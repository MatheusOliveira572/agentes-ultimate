// Peças comuns do registro de execuções, da estimativa, do progresso e do placar (0.7.0). Só metadados: nome do
// agente, tipo de tarefa, minutos, contagens e um código anônimo do projeto. A descrição do pedido nunca é guardada.
// Arquivos do projeto (fora do git): .claude/base/.agentes.jsonl (ciclo de vida dos agentes), .estimativas.jsonl,
// .progresso/<agente>[-<código>].json. Globais do usuário: ~/.claude/agentes-ultimate/execucoes.jsonl e revisoes.jsonl.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const PONTA = 256 * 1024;
const VALIDADE_PROGRESSO_MS = 30 * 60 * 1000;

const base = (cwd) => path.join(cwd, '.claude', 'base');
const pastaGlobal = () => path.join(os.homedir(), '.claude', 'agentes-ultimate');
const versaoPlugin = () => { try { return require('../.claude-plugin/plugin.json').version; } catch (e) { return '?'; } };

// "agentes-ultimate:dev-powerbi" e "dev-powerbi" são o mesmo agente.
const agenteCurto = (a) => String(a || '').split(':').pop().trim();

// Código do trabalho que o orquestrador põe no fim da descrição: [cod:ab12]. O código é do trabalho, não do lançamento:
// a correção do mesmo trabalho reusa o código (e conta como retrabalho); o revisor recebe [revisa:ab12], que não é
// código dele (não herda faixa nem progresso).
function codDe(...textos) {
  for (const t of textos) { const m = /\[cod:([a-z0-9][a-z0-9-]{1,15})\]/i.exec(String(t || '')); if (m) return m[1].toLowerCase(); }
  return null;
}

let _classes = null;
function classes() {
  if (!_classes) { try { _classes = require('../pacotes/classes-tarefa.json').classes; } catch (e) { _classes = {}; } }
  return _classes;
}
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
// Classe pelo nome dado (aceita acento: "construção" → "construcao") ou "outra".
function classeValida(c) {
  const k = semAcento(c);
  return Object.prototype.hasOwnProperty.call(classes(), k) ? k : 'outra';
}
// Classe pelas palavras da descrição: na ordem da lista, a primeira com palavra inteira encontrada.
function classeDe(texto) {
  const t = semAcento(texto);
  if (!t) return 'outra';
  for (const [classe, palavras] of Object.entries(classes())) {
    for (const p of palavras) {
      const q = semAcento(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('(^|[^a-z0-9])' + q + '($|[^a-z0-9])').test(t)) return classe;
    }
  }
  return 'outra';
}

// Código anônimo do projeto: 8 hexadecimais do caminho (nunca o caminho).
function projetoHash(cwd) {
  let p = path.resolve(cwd);
  if (process.platform === 'win32') p = p.toLowerCase();
  return crypto.createHash('sha256').update(p).digest('hex').slice(0, 8);
}
// Nome curto opcional que o usuário dá ao projeto em .claude/base/config.json ("nome_curto": "mvp-orcamento").
function nomeCurto(cwd) {
  try { const c = JSON.parse(fs.readFileSync(path.join(base(cwd), 'config.json'), 'utf8')); return typeof c.nome_curto === 'string' ? c.nome_curto.slice(0, 40) : null; } catch (e) { return null; }
}

// Só onde a base do projeto já foi montada e não está desligada.
function permitida(cwd) {
  const p = path.resolve(cwd || '');
  if (!cwd || p === path.parse(p).root || p === path.resolve(os.homedir())) return false;
  if (process.env.AGENTES_ULTIMATE_SEM_PASTA === '1') return false; // a mesma chave que desliga a base e o mapa
  if (fs.existsSync(path.join(base(p), 'desligado'))) return false;
  return fs.existsSync(base(p));
}

// Lê as últimas linhas JSON de um .jsonl (só o fim do arquivo, até maxBytes).
function lerJsonl(arq, maxBytes = 512 * 1024) {
  let fd;
  try {
    fd = fs.openSync(arq, 'r');
    const tam = fs.fstatSync(fd).size;
    const n = Math.min(tam, maxBytes);
    const buf = Buffer.alloc(n);
    fs.readSync(fd, buf, 0, n, tam - n);
    let txt = buf.toString('utf8');
    if (n < tam) txt = txt.slice(txt.indexOf('\n') + 1);
    const out = [];
    for (const l of txt.split('\n')) { if (!l.trim()) continue; try { out.push(JSON.parse(l)); } catch (e) { /* linha quebrada */ } }
    return out;
  } catch (e) { return []; } finally { if (fd !== undefined) try { fs.closeSync(fd); } catch (e) { /* já fechado */ } }
}
function acrescentar(arq, obj, maxBytes = 1024 * 1024) {
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  try { if (fs.statSync(arq).size > maxBytes) fs.renameSync(arq, arq + '.1'); } catch (e) { /* novo */ }
  fs.appendFileSync(arq, JSON.stringify(obj) + '\n', 'utf8');
}

// Começo e fim de uma transcrição pelos carimbos das pontas (lê só 256 KB de cada lado; elas passam de 30 MB).
function pontasTranscricao(arq) {
  let fd;
  try {
    fd = fs.openSync(arq, 'r');
    const tam = fs.fstatSync(fd).size;
    const ler = (pos, n) => { const b = Buffer.alloc(n); fs.readSync(fd, b, 0, n, pos); return b.toString('utf8'); };
    const cabeca = ler(0, Math.min(tam, PONTA));
    const cauda = ler(Math.max(0, tam - PONTA), Math.min(tam, PONTA));
    const ts = (t) => [...t.matchAll(/"timestamp"\s*:\s*"([^"]+)"/g)].map((m) => Date.parse(m[1])).filter((x) => !isNaN(x));
    const a = ts(cabeca), z = ts(cauda);
    return { inicio: a.length ? a[0] : null, fim: z.length ? z[z.length - 1] : null, cauda };
  } catch (e) { return { inicio: null, fim: null, cauda: '' }; } finally { if (fd !== undefined) try { fs.closeSync(fd); } catch (e) { /* já fechado */ } }
}

// .meta.json que o Claude Code grava ao lado da transcrição do agente (agentType, description, toolUseId): a ligação
// exata entre o agente e a descrição com o código. Pela transcrição da sessão: <sessao>.jsonl → <sessao>/subagents/
// agent-<id>.meta.json; ou pelo caminho direto.
function metaAgente(transcricaoSessao, id, direto) {
  const f = direto || (transcricaoSessao ? path.join(String(transcricaoSessao).replace(/\.jsonl$/, ''), 'subagents', `agent-${id}.meta.json`) : null);
  if (!f) return null;
  try { const m = JSON.parse(fs.readFileSync(f, 'utf8')); return m && typeof m === 'object' ? m : null; } catch (e) { return null; }
}
// Código e classe de um agente, em ordem de certeza: o par do PostToolUse (lancado), o início exato, o início provisório.
function ligacao(regs, id) {
  const l = regs.find((r) => r.tipo === 'lancado' && r.id === id);
  if (l) return { cod: l.cod || null, classe: l.classe || 'outra' };
  const i = regs.find((r) => r.tipo === 'inicio' && r.id === id) || {};
  return { cod: i.cod || null, classe: i.classe || 'outra' };
}

// Faixa registrada para ESTA execução de um agente: do mesmo agente, pelo código do trabalho, e registrada perto do
// início dela (de 15 min antes até 3 h depois). A correção reusa o código da construção: sem esse limite, herdava a
// faixa antiga ("passou da previsão" no início) e entrava no fator com um estimado que não era dela. Sem código: a
// mais recente do agente até 15 min antes do início. Sem faixa própria, a previsão vem da classe de referência e a
// execução fica fora do fator (fonte "sem").
const ANTES_DO_INICIO = 15 * 60 * 1000, DEPOIS_DO_INICIO = 3 * 60 * 60 * 1000;
function estimativaPara(cwd, agente, cod, inicio) {
  const lista = lerJsonl(path.join(base(cwd), '.estimativas.jsonl'));
  const ini = inicio || Date.now();
  const perto = (e) => { const t = Date.parse(e.em); return t >= ini - ANTES_DO_INICIO && t <= ini + DEPOIS_DO_INICIO; };
  for (let i = lista.length - 1; i >= 0; i--) {
    const e = lista[i];
    if (cod && e.cod === cod && e.agente === agente && perto(e)) return e; // a faixa é do agente e desta execução
  }
  if (cod) return null;
  const limite = ini - ANTES_DO_INICIO;
  for (let i = lista.length - 1; i >= 0; i--) {
    const e = lista[i];
    if (e.agente === agente && !e.cod && Date.parse(e.em) >= limite) return e;
  }
  return null;
}

// Progresso que o agente gravou: .progresso/<agente>-<código>.json, ou <agente>.json. Vale por 30 min desde a última
// gravação (o campo "em" é opcional: sem ele, conta a data do arquivo).
function progressoPara(cwd, agente, cod, agora = Date.now()) {
  const dir = path.join(base(cwd), '.progresso');
  const nomes = cod ? [`${agente}-${cod}.json`, `${agente}.json`] : [`${agente}.json`];
  for (const n of nomes) {
    const f = path.join(dir, n);
    try {
      const st = fs.statSync(f);
      const p = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
      const em = Date.parse(p.em) || st.mtimeMs;
      const feito = Number(p.feito), total = Number(p.total);
      if (!(total > 0) || !(feito >= 0) || agora - Math.max(em, st.mtimeMs) > VALIDADE_PROGRESSO_MS) continue;
      return { feito: Math.min(feito, total), total, agora: String(p.agora || '').split(/\s+/).slice(0, 5).join(' ').slice(0, 40), em };
    } catch (e) { /* sem arquivo ou inválido */ }
  }
  return null;
}

// Quantil com interpolação linear (q = 0,5 mediana; 0,75 p75).
function quantil(v, q) {
  const s = v.filter((x) => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const i = q * (s.length - 1), lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
// Classe de referência (Flyvbjerg): as execuções parecidas, em cascata até ter n ≥ 3: agente+classe → agente →
// classe → todos. Execução retomada fica fora (o tempo inclui a espera). Ver referenciaResumo.
const execucoes = () => lerJsonl(path.join(pastaGlobal(), 'execucoes.jsonl'), 64 * 1024 * 1024);

// Índice incremental de um .jsonl que só cresce: guarda quantos bytes já leu e o resumo; a cada uso lê só o que chegou
// depois (custo proporcional ao novo, não ao histórico). Arquivo menor que o já lido (girou para .1 ou foi apagado) →
// refaz do zero com o .1 e o atual. Gravação por arquivo temporário + troca de nome (dois ganchos ao mesmo tempo não
// corrompem: no pior caso um refaz o trecho). maxNovo: se faltar ler mais do que isso, devolve null (o gancho não paga
// a reconstrução; quem lê sem pressa passa Infinity).
const MAX_POR_CHAVE = 500;
function indice(nome, vazio, reduzir, maxNovo = Infinity) {
  const arq = path.join(pastaGlobal(), nome + '.jsonl');
  const arqIdx = path.join(pastaGlobal(), `.indice-${nome}.json`);
  let idx = null;
  try { idx = JSON.parse(fs.readFileSync(arqIdx, 'utf8')); } catch (e) { /* sem índice */ }
  let tam = 0;
  try { tam = fs.statSync(arq).size; } catch (e) { /* sem arquivo */ }
  const refazer = !idx || idx.v !== 1 || tam < idx.bytes;
  if (!refazer && tam === idx.bytes) return idx.estado;
  let ler = refazer ? tam : tam - idx.bytes;
  if (refazer) { try { ler += fs.statSync(arq + '.1').size; } catch (e) { /* sem .1 */ } }
  if (ler > maxNovo) return refazer ? null : idx.estado;
  if (refazer) {
    idx = { v: 1, bytes: 0, estado: vazio() };
    ler1(arq + '.1', 0, (o) => reduzir(idx.estado, o));
  }
  idx.bytes += ler1(arq, idx.bytes, (o) => reduzir(idx.estado, o));
  try {
    fs.mkdirSync(pastaGlobal(), { recursive: true });
    const tmp = `${arqIdx}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(idx)); fs.renameSync(tmp, arqIdx);
  } catch (e) { /* fica para a próxima */ }
  return idx.estado;
}
// Lê de "desde" até a última quebra de linha, passa cada objeto a "cada" e devolve quantos bytes consumiu.
function ler1(arq, desde, cada) {
  let fd;
  try {
    fd = fs.openSync(arq, 'r');
    const tam = fs.fstatSync(fd).size;
    if (tam <= desde) return 0;
    const buf = Buffer.alloc(tam - desde);
    fs.readSync(fd, buf, 0, buf.length, desde);
    const fimLinha = buf.lastIndexOf(10);
    if (fimLinha < 0) return 0;
    for (const l of buf.subarray(0, fimLinha).toString('utf8').split('\n')) { if (!l.trim()) continue; try { cada(JSON.parse(l)); } catch (e) { /* linha quebrada */ } }
    return fimLinha + 1;
  } catch (e) { return 0; } finally { if (fd !== undefined) try { fs.closeSync(fd); } catch (e) { /* já fechado */ } }
}
// Resumo das execuções para a estimativa: minutos (e fator real ÷ estimado) por chave, os 500 mais recentes de cada.
// Chaves: "ac:<agente>|<classe>", "a:<agente>", "c:<classe>", "*".
function resumoExecucoes(maxNovo = Infinity) {
  const poe = (m, k, v) => { const l = (m[k] = m[k] || []); l.push(v); if (l.length > MAX_POR_CHAVE) l.shift(); };
  return indice('execucoes', () => ({ min: {}, fat: {} }), (e, x) => {
    if (!x || !(x.minutos > 0) || x.retomado) return;
    const chaves = ['*'];
    if (x.agente) chaves.push('a:' + x.agente);
    if (x.classe && x.classe !== 'outra') chaves.push('c:' + x.classe);
    if (x.agente && x.classe && x.classe !== 'outra') chaves.push(`ac:${x.agente}|${x.classe}`);
    for (const k of chaves) { poe(e.min, k, x.minutos); if (x.estimado_min > 0) poe(e.fat, k, x.minutos / x.estimado_min); }
  }, maxNovo);
}
// Revisões por chave (projeto|autor|código): a primeira revisão de cada trabalho é a que conta "de primeira".
const chaveRevisao = (r) => `${r.projeto}|${r.autor}|${r.cod}`;
function indiceRevisoes(maxNovo = Infinity) {
  return indice('revisoes', () => ({ chaves: {} }), (e, r) => { if (r && r.autor) { const k = chaveRevisao(r); if (!e.chaves[k]) e.chaves[k] = r.veredito === 'sim' ? 's' : 'n'; } }, maxNovo);
}
// Classe de referência pelo resumo (mesma cascata da função referencia): { nivel, valores }.
function referenciaResumo(resumo, agente, classe, tipo = 'min', minimo = 3) {
  const m = (resumo && resumo[tipo]) || {};
  const temClasse = classe && classe !== 'outra';
  const niveis = [['agente+classe', agente && temClasse, `ac:${agente}|${classe}`], ['agente', agente, 'a:' + agente], ['classe', temClasse, 'c:' + classe], ['todos', true, '*']];
  for (const [nivel, vale, k] of niveis) if (vale && (m[k] || []).length >= minimo) return { nivel, valores: m[k] };
  return { nivel: 'sem histórico', valores: [] };
}

// Previsão de um agente em andamento (a barra e o mapa usam a mesma conta):
// - progresso: o que o agente gravou (feito/total); sem ele, tempo decorrido ÷ fim da faixa (no máximo 99%);
// - faixa: a registrada pelo orquestrador; sem ela, início + [mediana, p75] das execuções parecidas;
// - termina: pelo ritmo (início + decorrido ÷ progresso, quando já passou de 15%), senão o meio da faixa; arredonda
//   para 5 min e nunca fica no passado; passou do fim da faixa → passou = minutos além dela.
function previsao(cwd, { agente, cod, inicio, descricao, classe, agora = Date.now(), resumo }) {
  inicio = inicio || agora;
  const prog = progressoPara(cwd, agente, cod, agora);
  let de = null, ate = null, fonte = null;
  const est = estimativaPara(cwd, agente, cod, inicio);
  if (est && Date.parse(est.ate)) { de = Date.parse(est.de) || null; ate = Date.parse(est.ate); fonte = 'registrada'; }
  if (!ate) {
    const ref = referenciaResumo(resumo === undefined ? resumoExecucoes() : resumo, agente, classe || classeDe(descricao));
    if (ref.valores.length) {
      const m = ref.valores;
      de = inicio + quantil(m, 0.5) * 60000; ate = inicio + Math.max(quantil(m, 0.5), quantil(m, 0.75)) * 60000; fonte = 'historico';
    }
  }
  const decorrido = Math.max(0, agora - inicio);
  let frac = null;
  if (prog) frac = prog.feito / prog.total;
  else if (ate && ate > inicio) frac = Math.min(0.99, decorrido / (ate - inicio));
  const cinco = 5 * 60000;
  let termina = null;
  if (prog && frac >= 0.15 && frac < 1 && decorrido > 60000) termina = inicio + decorrido / frac;
  else if (ate) termina = de ? (de + ate) / 2 : ate;
  if (termina != null) {
    termina = Math.max(Math.ceil(agora / cinco) * cinco, Math.round(termina / cinco) * cinco);
    // O ritmo de poucas etapas engana (1 de 6 em 2 min): com faixa, o término fica dentro dela.
    if (de && termina < de) termina = de;
    if (ate && termina > ate) termina = ate;
  }
  const passou = ate && agora > ate ? Math.round((agora - ate) / 60000) : null;
  // estimado = o agente não gravou progresso: o % é tempo decorrido ÷ faixa e aparece com outra forma.
  return { prog, frac, estimado: !prog, de, ate, fonte, termina, passou, decorridoMin: Math.round(decorrido / 60000) };
}

// Último sinal de vida de um agente: a gravação mais recente do progresso dele (mesmo vencida) ou o início.
function ultimoSinal(cwd, agente, cod, inicio) {
  let t = inicio || 0;
  for (const n of cod ? [`${agente}-${cod}.json`, `${agente}.json`] : [`${agente}.json`]) {
    try { t = Math.max(t, fs.statSync(path.join(base(cwd), '.progresso', n)).mtimeMs); } catch (e) { /* sem arquivo */ }
  }
  return t;
}
// Agente sem fim (parado com TaskStop ou sessão fechada não disparam o SubagentStop): passou do prazo (fim da faixa +
// 30 min; sem faixa, início + 3 h) e está sem sinal há 30 min → "sem notícia"; 2 h depois disso, sai do painel.
const PRAZO_FOLGA = 30 * 60000, PRAZO_SEM_FAIXA = 3 * 60 * 60000, SOME_APOS = 2 * 60 * 60000;
function situacao(cwd, r, p, cod, agora) {
  const inicio = Date.parse(r.em);
  const sinal = ultimoSinal(cwd, r.agente, cod, inicio);
  const prazo = p.ate ? p.ate + PRAZO_FOLGA : inicio + PRAZO_SEM_FAIXA;
  const semNoticia = Math.max(prazo, sinal + PRAZO_FOLGA);
  if (agora > semNoticia + SOME_APOS) return { estado: 'some', sinal };
  return { estado: agora > semNoticia ? 'sem-noticia' : 'trabalhando', sinal };
}

// Agentes agora (painel do mapa ao vivo): quem começou e não terminou (até 12 h atrás) e quem terminou nos últimos
// 10 min, com %, etapa (até 4 palavras), término previsto e faixa. Lê .claude/base/.agentes.jsonl.
function agentesAgora(cwd, { agora = Date.now(), resumo = null } = {}) {
  const regs = lerJsonl(path.join(base(cwd), '.agentes.jsonl'));
  const fins = new Map(regs.filter((r) => r.tipo === 'fim').map((r) => [r.id, r]));
  const fora = new Set(regs.filter((r) => r.tipo === 'abandonado').map((r) => r.id));
  const out = [];
  for (const r of regs) {
    if (r.tipo !== 'inicio' || out.some((x) => x.id === r.id)) continue;
    if (fora.has(r.id) && !fins.has(r.id)) continue;
    const inicio = Date.parse(r.em);
    const f = fins.get(r.id);
    if (f) {
      const fim = Date.parse(f.em);
      if (agora - fim > 10 * 60000) continue;
      out.push({ id: r.id, agente: r.agente, cod: f.cod || ligacao(regs, r.id).cod, estado: 'terminou', inicio, fim, minutos: f.minutos, pct: 100 });
      continue;
    }
    if (!(agora - inicio < 12 * 60 * 60000)) continue;
    const lig = ligacao(regs, r.id);
    const p = previsao(cwd, { agente: r.agente, cod: lig.cod, inicio, classe: lig.classe, agora, resumo });
    const s = situacao(cwd, r, p, lig.cod, agora);
    if (s.estado === 'some') continue;
    out.push({ id: r.id, agente: r.agente, cod: lig.cod, estado: s.estado, sinal: s.sinal, inicio,
      pct: p.frac == null ? null : Math.round(p.frac * 100), estimado: p.estimado, etapa: p.prog ? p.prog.agora.split(/\s+/).filter(Boolean).slice(0, 4).join(' ') : '',
      feito: p.prog ? p.prog.feito : null, total: p.prog ? p.prog.total : null, termina: p.termina, de: p.de, ate: p.ate, passou: p.passou, fonte: p.fonte });
  }
  return out;
}

// Hora "14:10" ou "14h10" no dia de referência (local). Devolve ms ou null.
function deHora(txt, ref = Date.now()) {
  const m = /^(\d{1,2})\s*[:h]\s*(\d{2})$/i.exec(String(txt || '').trim());
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  const d = new Date(ref); d.setHours(+m[1], +m[2], 0, 0);
  return d.getTime();
}
const hhmm = (ms) => { const d = new Date(ms); return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`; };

module.exports = {
  base, pastaGlobal, versaoPlugin, agenteCurto, codDe, classes, classeValida, classeDe, projetoHash, nomeCurto, permitida,
  lerJsonl, acrescentar, pontasTranscricao, estimativaPara, progressoPara, deHora, hhmm, VALIDADE_PROGRESSO_MS,
  quantil, execucoes, previsao, agentesAgora, indice, resumoExecucoes, referenciaResumo, chaveRevisao, indiceRevisoes, metaAgente, ligacao, ultimoSinal, PRAZO_FOLGA, situacao,
};
