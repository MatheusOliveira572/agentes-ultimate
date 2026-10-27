#!/usr/bin/env node
// Roteador automático (UserPromptSubmit). Lê o pedido e a pasta, escolhe os pacotes de agentes, monta a memória do
// projeto na primeira vez e avisa o Claude (contexto) e o usuário (uma linha). Nunca bloqueia: em qualquer erro, sai 0.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const RAIZ = path.resolve(__dirname, '..');
const sair = () => process.exit(0);

function normalizar(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function contem(texto, termo) {
  const t = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9&])' + t + '($|[^a-z0-9&])').test(texto);
}

function palavras(texto) {
  return new Set(texto.split(/[^a-z0-9&]+/).filter((p) => p.length > 2));
}

function lerJson(arq, padrao) {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')); } catch (e) { return padrao; }
}

function gravarJson(arq, obj) {
  try { fs.mkdirSync(path.dirname(arq), { recursive: true }); fs.writeFileSync(arq, JSON.stringify(obj, null, 2)); } catch (e) { /* sem efeito */ }
}

// Arquivos da pasta: raiz + 1 nível, no máximo ~400 nomes (pasta grande não pode travar o pedido).
function nomesDaPasta(cwd) {
  const nomes = [];
  const ignorar = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__']);
  try {
    for (const a of fs.readdirSync(cwd, { withFileTypes: true })) {
      if (nomes.length > 400) break;
      if (ignorar.has(a.name)) continue;
      nomes.push(a.name);
      if (a.isDirectory()) {
        try { for (const b of fs.readdirSync(path.join(cwd, a.name)).slice(0, 60)) nomes.push(b); } catch (e) { /* sem acesso */ }
      }
    }
  } catch (e) { /* sem acesso */ }
  return nomes;
}

function pastaPermitida(cwd) {
  const p = path.resolve(cwd || '');
  if (!p || p === path.parse(p).root) return false;
  if (p === path.resolve(os.homedir())) return false;
  if (process.env.AGENTES_ULTIMATE_SEM_PASTA === '1') return false;
  if (fs.existsSync(path.join(p, '.claude', 'base', 'desligado'))) return false;
  return true;
}

const MODELOS = {
  'PROJETO.md': '# Projeto\n\n> Mantido pelo orquestrador. Objetivo, decisões tomadas (com data e motivo), restrições e estado atual.\n> Os agentes leem, mas não editam.\n\n## Objetivo\n\n## Decisões\n\n## Restrições\n\n## Estado atual\n',
  'APRENDIZADOS.md': '# Aprendizados compartilhados\n\n> Formato: `- [data][agente] lição — causa: … — evidência: … — vale para: <agentes ou "todos">`. Mais recente no topo.\n> O curador funde duplicadas e promove a regra o que se repetir.\n\n',
  'DIARIO.md': '# Diário do projeto\n\n> Uma linha por entrega: `- data [agente] o que foi feito → arquivo`. Mais recente no topo.\n\n',
  'PROPOSTAS.md': '# Propostas de melhoria dos agentes\n\n> Agente, problema, evidência, texto proposto. O curador avalia; o usuário aprova; a mudança vai para o CHANGELOG.\n\n',
  'CHANGELOG-AGENTES.md': '# Mudanças nas instruções dos agentes\n\n> Data, agente, o que mudou, motivo (proposta aprovada).\n\n',
  'MAPA.md': '# Mapa do projeto\n\n> Onde fica cada coisa, para ninguém começar no escuro. Uma linha por item: `caminho → para que serve`.\n> Quem cria um arquivo ou pasta importante acrescenta a linha.\n\n',
};

// "Já feito sobre isto": linhas do diário, lições e mapa que dividem palavras com o pedido (sem IA, instantâneo).
function jaFeito(cwd, texto) {
  const dir = path.join(cwd, '.claude', 'base');
  const meu = [...palavras(texto)].filter((w) => w.length > 3);
  if (!meu.length) return [];
  const achados = [];
  for (const [arq, rotulo, max] of [['DIARIO.md', 'diário', 4], ['APRENDIZADOS.md', 'lição', 3], ['MAPA.md', 'mapa', 3]]) {
    let linhas = [];
    try { linhas = fs.readFileSync(path.join(dir, arq), 'utf8').split(/\r?\n/).filter((l) => /^\s*-\s/.test(l)); } catch (e) { continue; }
    const pont = linhas.map((l) => {
      const ws = palavras(normalizar(l));
      return { l: l.trim(), s: meu.filter((w) => ws.has(w)).length };
    }).filter((x) => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, max);
    for (const x of pont) achados.push(`(${rotulo}) ${x.l.slice(0, 220)}`);
  }
  return achados;
}

function montarBase(cwd) {
  const dir = path.join(cwd, '.claude', 'base');
  const criados = [];
  try {
    fs.mkdirSync(dir, { recursive: true });
    for (const [nome, conteudo] of Object.entries(MODELOS)) {
      const arq = path.join(dir, nome);
      if (!fs.existsSync(arq)) { fs.writeFileSync(arq, conteudo); criados.push(nome); }
    }
  } catch (e) { return []; }
  return criados;
}

function main(d) {
  const pedido = String(d.prompt || '');
  const cwd = d.cwd || process.cwd();
  const texto = normalizar(pedido);
  const cfg = lerJson(path.join(RAIZ, 'pacotes', 'pacotes.json'), null);
  if (!cfg || !texto.trim()) sair();
  if (texto.trim().startsWith('/')) sair(); // comando: deixa o Claude Code tratar

  const globalDir = path.join(os.homedir(), '.claude', 'agentes-ultimate');
  const exemplosGlobal = path.join(globalDir, 'roteamento.json');
  const ultimoArq = path.join(globalDir, 'ultimo-pedido.json');
  const todosAgentes = new Set(Object.values(cfg.pacotes).flatMap((p) => p.agentes));

  // Correção do usuário: "era com <agente>" → aprende o exemplo e manda refazer.
  const corr = texto.match(/^\s*era (?:com|pro|para o|para a|do|da) (?:o |a )?([a-z0-9-]+)/);
  if (corr && todosAgentes.has(corr[1])) {
    const ultimo = lerJson(ultimoArq, {});
    const ex = lerJson(exemplosGlobal, []);
    if (ultimo.pedido) { ex.unshift({ pedido: ultimo.pedido, agente: corr[1], em: new Date().toISOString() }); gravarJson(exemplosGlobal, ex.slice(0, 300)); }
    out(`[agentes-ultimate] O usuário corrigiu a escolha: refaça o pedido anterior ("${(ultimo.pedido || '').slice(0, 160)}") com o agente \`${corr[1]}\`. O exemplo foi guardado para os próximos pedidos parecidos.`,
      `Anotado: pedidos assim vão para ${corr[1]}.`);
    return;
  }

  const nomes = nomesDaPasta(cwd);
  const pontos = {};
  const motivos = {};
  for (const [id, p] of Object.entries(cfg.pacotes)) {
    if (p.sempre) continue;
    let s = 0; const m = [];
    for (const w of p.palavras || []) if (contem(texto, w)) { s += w.includes(' ') ? 2 : 1; m.push(w); }
    for (const a of p.arquivos || []) if (nomes.some((n) => n.endsWith(a) || n === a)) { s += 2; m.push('pasta tem ' + a); }
    pontos[id] = s; motivos[id] = m;
  }

  // Exemplos que o usuário já corrigiu: pedido parecido puxa o agente indicado.
  const ex = lerJson(exemplosGlobal, []);
  const meu = palavras(texto);
  let agenteExemplo = null;
  for (const e of ex) {
    const outro = palavras(normalizar(e.pedido));
    const inter = [...meu].filter((w) => outro.has(w)).length;
    const uniao = new Set([...meu, ...outro]).size || 1;
    if (inter / uniao >= 0.5) { agenteExemplo = e.agente; break; }
  }
  if (agenteExemplo) {
    for (const [id, p] of Object.entries(cfg.pacotes)) {
      if (!p.sempre && p.agentes.includes(agenteExemplo)) { pontos[id] += 3; motivos[id].push('você já indicou ' + agenteExemplo); }
    }
  }

  const escolhidos = Object.keys(pontos).filter((id) => pontos[id] >= (cfg.minimo || 2)).sort((a, b) => pontos[b] - pontos[a]);
  const trivial = escolhidos.length === 0 && pedido.trim().length < 60;
  gravarJson(ultimoArq, { pedido: pedido.slice(0, 500), em: new Date().toISOString() });
  if (trivial) sair(); // pergunta curta e sem assunto de pacote: responde direto, sem montar nada

  const criados = pastaPermitida(cwd) ? montarBase(cwd) : [];
  const agentes = [...new Set(escolhidos.flatMap((id) => cfg.pacotes[id].agentes).concat(['revisor']))];
  const nomesPac = escolhidos.map((id) => cfg.pacotes[id].nome);
  const linhaUsuario = escolhidos.length
    ? `Usando: ${nomesPac.join(' + ')} · ${agentes.join(', ')}`
    : 'Usando: núcleo (planejador, pesquisador, revisor, redator)';

  const ctx = [
    '[agentes-ultimate] Pedido classificado automaticamente.',
    escolhidos.length
      ? 'Pacotes: ' + escolhidos.map((id) => `${cfg.pacotes[id].nome} (${motivos[id].slice(0, 4).join(', ')})`).join('; ') + '.'
      : 'Nenhum pacote de assunto; use o núcleo.',
    `Agentes indicados: ${agentes.join(', ')}${agenteExemplo ? ` (o usuário já indicou ${agenteExemplo} para pedido parecido)` : ''}.`,
    'Conduza pela skill `ultimate` (contrato → construção → prova → revisor → usuário). Se o pedido for simples, responda direto sem acionar agentes.',
    'Na 1ª linha da resposta, diga em poucas palavras quais agentes vai usar; o usuário corrige com "era com <agente>".',
  ];
  const antes = pastaPermitida(cwd) ? jaFeito(cwd, texto) : [];
  if (antes.length) {
    ctx.push('Já existe trabalho relacionado neste projeto (comece daqui, não do zero):\n- ' + antes.join('\n- '));
  } else if (!criados.length) {
    ctx.push('Nada relacionado no diário/mapa: antes de agir, procure no projeto (git log, busca pelos termos do pedido).');
  }
  if (criados.length) ctx.push(`Memória do projeto criada em .claude/base/ (${criados.join(', ')}). Preencha PROJETO.md com o objetivo assim que entender o pedido.`);
  out(ctx.join('\n'), linhaUsuario);
}

function out(contexto, mensagem) {
  process.stdout.write(JSON.stringify({
    systemMessage: mensagem,
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: contexto },
  }));
  sair();
}

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  try { main(JSON.parse(entrada || '{}')); } catch (e) { sair(); }
});
