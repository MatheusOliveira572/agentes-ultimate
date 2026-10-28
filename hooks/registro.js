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

// Código do pedido que o orquestrador põe no fim da descrição: [cod:ab12].
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

// Faixa registrada para um agente: pelo código do pedido; sem código, a mais recente do agente até 15 min antes do início.
function estimativaPara(cwd, agente, cod, inicio) {
  const lista = lerJsonl(path.join(base(cwd), '.estimativas.jsonl'));
  for (let i = lista.length - 1; i >= 0; i--) {
    const e = lista[i];
    if (cod && e.cod === cod) return e;
  }
  if (cod) return null;
  const limite = (inicio || Date.now()) - 15 * 60 * 1000;
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
};
