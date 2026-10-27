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
  // Aceita o plural simples em cada palavra da expressão ("unidade de negocio" acha "unidades de negocios").
  const t = normalizar(termo).split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(e?s)?').join('\\s+');
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
  '.gitignore': '# Gerados pelo agentes-ultimate (refeitos sozinhos)\n.grafo.json\nMAPA-AUTO.md\nMAPA.html\n.ultima-busca.json\n.atividade.jsonl\n.atividade.jsonl.1\n.mapa-servidor.json\n',
  'MAPA.md': '# Mapa do projeto\n\n> Onde fica cada coisa, para ninguém começar no escuro. Uma linha por item: `caminho → para que serve`.\n> Quem cria um arquivo ou pasta importante acrescenta a linha.\n\n',
};

// "Já feito sobre isto": pelo grafo do projeto (sinônimos + ligações entre memória e arquivos). Sem IA.
function jaFeito(cwd, pedido) {
  try {
    const r = require('./grafo').buscar(cwd, pedido);
    // Guarda o que foi usado, para o mapa visual (MAPA.html) destacar o caminho do último pedido.
    try {
      fs.writeFileSync(path.join(cwd, '.claude', 'base', '.ultima-busca.json'), JSON.stringify({
        pedido: pedido.slice(0, 300), em: new Date().toISOString(),
        registros: r.registros.map((x) => ({ texto: x.texto.slice(0, 240), rotulo: x.rotulo, arquivos: x.arquivos })),
        arquivos: r.arquivos.map((a) => ({ rel: a.rel, ligado: a.ligado })),
      }));
    } catch (e) { /* só leitura */ }
    return r.registros.map((x) => `(${x.rotulo}) ${x.texto.slice(0, 220)}`)
      .concat(r.arquivos.map((a) => `(arquivo${a.ligado ? ' ligado' : ''}) ${a.rel}${a.d ? ' — ' + a.d.slice(0, 120) : ''}`));
  } catch (e) { return []; }
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
    // .gitignore de versões antigas: acrescenta os gerados que faltarem.
    const gi = path.join(dir, '.gitignore');
    const atual = fs.readFileSync(gi, 'utf8');
    const faltam = MODELOS['.gitignore'].split('\n').filter((l) => l && !l.startsWith('#') && !atual.split(/\r?\n/).includes(l));
    if (faltam.length) fs.appendFileSync(gi, (atual.endsWith('\n') ? '' : '\n') + faltam.join('\n') + '\n');
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
  // Relatório de agente ou aviso do sistema chegando como mensagem: não é pedido do usuário.
  if (/<agent-message|another claude session sent a message|\[subagent hand-back\]|<task-notification|\[system notification/.test(texto)) sair();

  const globalDir = path.join(os.homedir(), '.claude', 'agentes-ultimate');
  const exemplosGlobal = path.join(globalDir, 'roteamento.json');
  const ultimoArq = path.join(globalDir, 'ultimo-pedido.json');
  let projetoCfg = {};
  try { projetoCfg = JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'base', 'config.json'), 'utf8')); } catch (e) { /* sem config */ }
  for (const id of projetoCfg.pacotes_desligados || []) delete cfg.pacotes[id];
  const todosAgentes = new Set(Object.values(cfg.pacotes).flatMap((p) => p.agentes).concat(Object.values(projetoCfg.agentes || {})));

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
    // Arquivo da pasta só reforça: sozinho não puxa o pacote (pergunta curta numa pasta com package.json não é Software).
    if (s > 0) for (const a of p.arquivos || []) if (nomes.some((n) => n.endsWith(a) || n === a)) { s += 2; m.push('pasta tem ' + a); }
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
  // Trivial = curto e sem nenhuma palavra de assunto. Com assunto abaixo do mínimo, vai para o núcleo.
  const algumAssunto = Object.values(pontos).some((s) => s > 0);
  const trivial = escolhidos.length === 0 && !algumAssunto && pedido.trim().length < 60;
  gravarJson(ultimoArq, { pedido: pedido.slice(0, 500), em: new Date().toISOString() });
  if (trivial) sair(); // pergunta curta e sem assunto de pacote: responde direto, sem montar nada

  const criados = pastaPermitida(cwd) ? montarBase(cwd) : [];
  // Projeto com agentes próprios: .claude/base/config.json → "agentes": { "revisor": "revisor-qa", ... }.
  const equiv = (projetoCfg.agentes || {});
  const agentes = [...new Set(escolhidos.flatMap((id) => cfg.pacotes[id].agentes).concat(['revisor']).map((a) => equiv[a] || a))];
  // Nome que o Claude Code usa para chamar: agentes do plugin vêm com o prefixo; os do projeto (equivalências), sem.
  const doProjeto = new Set(Object.values(equiv));
  const chamada = (a) => (doProjeto.has(a) ? a : 'agentes-ultimate:' + a);
  const nomesPac = escolhidos.map((id) => cfg.pacotes[id].nome);
  const linhaUsuario = escolhidos.length
    ? `Usando: ${nomesPac.join(' + ')} · ${agentes.join(', ')}`
    : 'Área não reconhecida pelo vocabulário: o Claude escolhe os especialistas';
  // Vocabulário não achou a área: o Claude decide, com o catálogo inteiro na mão.
  const catalogo = Object.values(cfg.pacotes).map((p) => `${p.nome}: ${p.agentes.map(chamadaFora).join(', ')}`).join(' | ');
  function chamadaFora(a) { const e = equiv[a] || a; return Object.values(equiv).includes(e) ? e : 'agentes-ultimate:' + e; }

  const ctx = [
    '[agentes-ultimate] Pedido classificado automaticamente.',
    escolhidos.length
      ? 'Pacotes: ' + escolhidos.map((id) => `${cfg.pacotes[id].nome} (${motivos[id].slice(0, 4).join(', ')})`).join('; ') + '.'
      : 'O vocabulário não reconheceu a área deste pedido. DECIDA VOCÊ quais especialistas o pedido precisa, pelo assunto (não pelo verbo), escolhendo no catálogo abaixo e nas descrições dos agentes disponíveis; não use só o núcleo por falta de palavra-chave.',
    escolhidos.length
      ? `Agentes indicados (subagent_type para a ferramenta Agent): ${agentes.map(chamada).join(', ')}${agenteExemplo ? ` (o usuário já indicou ${agenteExemplo} para pedido parecido)` : ''}. Se o pedido precisar de outra área, acrescente pelo catálogo.`
      : 'Revisor (sempre antes de entregar): agentes-ultimate:revisor' + (equiv.revisor ? ` (neste projeto: ${equiv.revisor})` : '') + '.',
    `Catálogo (área: subagent_type): ${catalogo}.`,
    projetoCfg.delegar === 'quando-precisar'
      ? 'Conduza pela skill `ultimate`. Delegue aos agentes quando o trabalho pedir um especialista; o resto, faça você.'
      : 'DELEGUE: este pedido é trabalho de especialista. Você é o orquestrador: chame os agentes indicados com a ferramenta Agent (passe o contexto e o "já feito" abaixo), combine o resultado, chame o revisor antes de entregar e fale com o usuário. Não faça você mesmo a análise, o código ou o documento. Siga a skill `ultimate`. Só responda sem agentes se for uma pergunta de uma linha.',
    'Na 1ª linha da resposta, diga quais agentes vai usar; o usuário corrige com "era com <agente>".',
  ];
  const antes = pastaPermitida(cwd) ? jaFeito(cwd, pedido) : [];
  if (antes.length) {
    ctx.push('Já existe trabalho relacionado neste projeto (comece daqui, não do zero; "ligado" = citado por/cita um arquivo do assunto):\n- ' + antes.join('\n- '));
  } else if (!criados.length) {
    ctx.push('Nada relacionado na memória nem no mapa: antes de agir, procure no projeto (git log, busca pelos termos do pedido).');
  }
  if (pastaPermitida(cwd)) ctx.push('Mapa automático do projeto (o que é cada arquivo e quem cita quem): .claude/base/MAPA-AUTO.md.');
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
