#!/usr/bin/env node
// Grafo do projeto, sem IA: arquivos (com uma linha dizendo o que são), quem cita quem, e os registros da memória
// (diário, lições, decisões) ligados aos arquivos que mencionam. Serve para achar o que já existe sobre um pedido
// mesmo sem palavra em comum (sinônimos) e pelo que está ligado (1 salto no grafo).
// Uso direto: node hooks/grafo.js <pasta> [pedido]   → gera .claude/base/MAPA-AUTO.md e, com pedido, mostra a busca.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const IGNORAR_DIR = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build', '.next', '.cache',
  'coverage', 'bin', 'obj', '.idea', '.vscode', 'agent-memory']);
const TEXTO = new Set(['.md', '.txt', '.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.py', '.ps1', '.sh', '.json', '.yaml',
  '.yml', '.toml', '.tmdl', '.sql', '.m', '.dax', '.html', '.css', '.cs', '.java', '.go', '.rs', '.rb', '.php', '.r']);
const LIMITE_ARQUIVOS = 1500;
const LIMITE_MS = 2500;
const MAX_LER = 64 * 1024;

function normalizar(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

let _sin = null;
function sinonimos() {
  if (_sin) return _sin;
  _sin = new Map();
  try {
    const g = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pacotes', 'sinonimos.json'), 'utf8')).grupos || [];
    g.forEach((grupo, i) => grupo.forEach((w) => { const k = normalizar(w); if (!_sin.has(k)) _sin.set(k, '§' + i); }));
  } catch (e) { /* sem sinônimos */ }
  return _sin;
}

// Palavra → forma única: sem acento, singular simples, sinônimo pelo grupo.
function radical(w) {
  let p = w;
  if (p.length > 4 && p.endsWith('coes')) p = p.slice(0, -4) + 'cao';
  else if (p.length > 4 && p.endsWith('oes')) p = p.slice(0, -3) + 'ao';
  else if (p.length > 4 && p.endsWith('ais')) p = p.slice(0, -2) + 'l';
  else if (p.length > 3 && p.endsWith('s') && !p.endsWith('ss')) p = p.slice(0, -1);
  const s = sinonimos();
  return s.get(w) || s.get(p) || p;
}

const VAZIAS = new Set(['para', 'com', 'que', 'uma', 'uns', 'umas', 'por', 'como', 'mais', 'esta', 'este', 'isso', 'isto',
  'aqui', 'nao', 'sim', 'dos', 'das', 'nos', 'nas', 'pelo', 'pela', 'sobre', 'entre', 'quando', 'onde', 'qual', 'quais',
  'faca', 'fazer', 'ajuste', 'ajustar', 'crie', 'criar', 'veja', 'ver', 'the', 'and', 'for', 'with', 'from', 'this', 'that']);

function termos(texto) {
  const out = new Set();
  for (const w of normalizar(texto).split(/[^a-z0-9&]+/)) {
    if (w.length < 3 || VAZIAS.has(w)) continue;
    out.add(radical(w));
  }
  return out;
}

function sensiveis(cwd) {
  try {
    return fs.readFileSync(path.join(cwd, '.claude', 'base', 'sensiveis.txt'), 'utf8').split(/\r?\n/)
      .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
      .map((g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*') + '$', 'i'));
  } catch (e) { return []; }
}

// Uma linha dizendo o que o arquivo é: 1º título (markdown), 1º comentário (código) ou campo de descrição (json).
function descrever(rel, conteudo) {
  const ext = path.extname(rel).toLowerCase();
  const linhas = conteudo.split(/\r?\n/).slice(0, 40);
  if (ext === '.md') {
    const h = linhas.find((l) => /^#{1,3}\s+\S/.test(l));
    if (h) return h.replace(/^#+\s*/, '').trim();
  }
  if (ext === '.json') {
    const m = conteudo.match(/"(?:description|_como_usar|descricao|name)"\s*:\s*"([^"]{8,200})"/);
    if (m) return m[1];
  }
  for (const l of linhas) {
    const m = l.match(/^\s*(?:\/\/+|#(?!!)|--|<!--|\/\*+|\*|''')\s*(.{12,})$/);
    if (m && !/^(eslint|use strict|-\*-|@ts-|region|endregion)/i.test(m[1])) return m[1].replace(/\*\/|-->/g, '').trim();
  }
  const nome = linhas.find((l) => /^\s*(name|nome|title|titulo)\s*:/.test(l));
  return nome ? nome.replace(/^\s*\w+\s*:\s*/, '').trim() : '';
}

function listar(cwd, inicio) {
  const proib = sensiveis(cwd);
  const arquivos = [];
  const pilha = [''];
  while (pilha.length && arquivos.length < LIMITE_ARQUIVOS && Date.now() - inicio < LIMITE_MS) {
    const relDir = pilha.pop();
    let itens = [];
    try { itens = fs.readdirSync(path.join(cwd, relDir), { withFileTypes: true }); } catch (e) { continue; }
    for (const it of itens) {
      const rel = (relDir ? relDir + '/' : '') + it.name;
      if (proib.some((r) => r.test(rel))) continue;
      if (it.isDirectory()) {
        if (!IGNORAR_DIR.has(it.name) && !(it.name.startsWith('.') && it.name !== '.claude')) pilha.push(rel);
      } else if (it.isFile()) {
        arquivos.push(rel);
      }
    }
  }
  return arquivos;
}

// Monta o grafo: nós = arquivos; arestas = "A cita B" (pelo caminho ou nome do arquivo B aparecendo em A).
function montar(cwd) {
  const inicio = Date.now();
  const arquivos = listar(cwd, inicio);
  const nos = {};
  const porNome = new Map();
  for (const rel of arquivos) {
    const base = path.basename(rel);
    if (!porNome.has(base)) porNome.set(base, []);
    porNome.get(base).push(rel);
    nos[rel] = { d: '', cita: [] };
  }
  const nomesUnicos = [...porNome.keys()].filter((b) => b.length >= 6 && /\.[a-z0-9]+$/i.test(b));
  for (const rel of arquivos) {
    if (Date.now() - inicio > LIMITE_MS) break;
    if (!TEXTO.has(path.extname(rel).toLowerCase()) || rel.startsWith('.claude/base/')) continue;
    let c = '';
    try { const fd = fs.openSync(path.join(cwd, rel), 'r'); const buf = Buffer.alloc(MAX_LER); const n = fs.readSync(fd, buf, 0, MAX_LER, 0); fs.closeSync(fd); c = buf.slice(0, n).toString('utf8'); } catch (e) { continue; }
    nos[rel].d = descrever(rel, c).slice(0, 160);
    const cita = new Set();
    for (const b of nomesUnicos) {
      if (b === path.basename(rel) || !c.includes(b)) continue;
      for (const alvo of porNome.get(b)) if (alvo !== rel) cita.add(alvo);
    }
    nos[rel].cita = [...cita].slice(0, 30);
  }
  return { geradoEm: new Date().toISOString(), completo: Date.now() - inicio <= LIMITE_MS && arquivos.length < LIMITE_ARQUIVOS, nos };
}

// Registros da memória (linhas de lista) com os arquivos que cada um menciona.
function registros(cwd, grafo) {
  const out = [];
  const nomes = Object.keys(grafo.nos);
  const porBase = new Map();
  for (const r of nomes) { const b = path.basename(r); if (b.length >= 5) { if (!porBase.has(b)) porBase.set(b, []); porBase.get(b).push(r); } }
  for (const [arq, rotulo] of [['DIARIO.md', 'diário'], ['APRENDIZADOS.md', 'lição'], ['PROJETO.md', 'decisão'], ['MAPA.md', 'mapa']]) {
    let linhas = [];
    try { linhas = fs.readFileSync(path.join(cwd, '.claude', 'base', arq), 'utf8').split(/\r?\n/).filter((l) => /^\s*-\s+\S/.test(l)); } catch (e) { continue; }
    for (const l of linhas) {
      const liga = new Set();
      for (const r of nomes) if (r.length >= 6 && l.includes(r)) liga.add(r);
      for (const [b, rs] of porBase) if (l.includes(b)) rs.forEach((r) => liga.add(r));
      out.push({ rotulo, texto: l.trim(), t: termos(l), arquivos: [...liga] });
    }
  }
  return out;
}

const caminhoGrafo = (cwd) => path.join(cwd, '.claude', 'base', '.grafo.json');

// Regera se não existe, se tem mais de `idadeMin` minutos ou se o git mudou de commit.
function obter(cwd, idadeMin = 10) {
  const arq = caminhoGrafo(cwd);
  let head = '';
  try {
    const h = fs.readFileSync(path.join(cwd, '.git', 'HEAD'), 'utf8').trim();
    head = h.startsWith('ref:') ? (fs.readFileSync(path.join(cwd, '.git', h.slice(5).trim()), 'utf8').trim()) : h;
  } catch (e) { /* sem git */ }
  try {
    const g = JSON.parse(fs.readFileSync(arq, 'utf8'));
    if (g.head === head && Date.now() - Date.parse(g.geradoEm) < idadeMin * 60000) return g;
  } catch (e) { /* regera */ }
  const g = montar(cwd);
  g.head = head;
  try { fs.mkdirSync(path.dirname(arq), { recursive: true }); fs.writeFileSync(arq, JSON.stringify(g)); escreverMapa(cwd, g); } catch (e) { /* só leitura */ }
  return g;
}

function escreverMapa(cwd, g) {
  const linhas = ['# Mapa automático do projeto', '',
    `> Gerado pelo agentes-ultimate em ${g.geradoEm.slice(0, 16).replace('T', ' ')}${g.completo ? '' : ' (parcial: projeto grande)'}. Não edite: é refeito sozinho.`,
    '> Formato: `caminho` — o que é · cita: arquivos que ele menciona. O mapa escrito à mão fica em MAPA.md.', ''];
  const porPasta = {};
  for (const [rel, n] of Object.entries(g.nos)) {
    if (rel.startsWith('.claude/base/')) continue;
    const pasta = path.dirname(rel) === '.' ? '(raiz)' : path.dirname(rel);
    (porPasta[pasta] = porPasta[pasta] || []).push([rel, n]);
  }
  for (const pasta of Object.keys(porPasta).sort()) {
    linhas.push(`## ${pasta}`);
    for (const [rel, n] of porPasta[pasta].sort()) {
      const cita = n.cita.length ? ` · cita: ${n.cita.slice(0, 5).map((c) => path.basename(c)).join(', ')}${n.cita.length > 5 ? '…' : ''}` : '';
      linhas.push(`- \`${rel}\`${n.d ? ' — ' + n.d : ''}${cita}`);
    }
    linhas.push('');
  }
  fs.writeFileSync(path.join(cwd, '.claude', 'base', 'MAPA-AUTO.md'), linhas.join('\n'));
}

// Busca: termos do pedido (com sinônimos) → registros e arquivos; depois 1 salto pelas ligações.
function buscar(cwd, pedido, opcoes = {}) {
  const g = opcoes.grafo || obter(cwd);
  const q = termos(pedido);
  if (!q.size) return { registros: [], arquivos: [] };
  const regs = registros(cwd, g);
  const pontos = new Map();
  const somar = (rel, s) => pontos.set(rel, (pontos.get(rel) || 0) + s);

  for (const [rel, n] of Object.entries(g.nos)) {
    if (rel.startsWith('.claude/base/')) continue;
    const t = termos(rel.replace(/[/._-]/g, ' ') + ' ' + n.d);
    const comum = [...q].filter((w) => t.has(w)).length;
    if (comum >= Math.min(2, q.size)) somar(rel, comum * 2);
  }
  const achados = [];
  for (const r of regs) {
    let s = [...q].filter((w) => r.t.has(w)).length;
    if (r.arquivos.some((a) => pontos.has(a))) s += 2; // ligado a um arquivo do assunto
    if (s >= 2) { achados.push({ ...r, s }); r.arquivos.forEach((a) => somar(a, 1)); }
  }
  // 1 salto: arquivos citados por (ou que citam) os arquivos do assunto.
  const semente = [...pontos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([r]) => r);
  for (const r of semente) {
    for (const c of (g.nos[r] || { cita: [] }).cita) somar(c, 1);
    for (const [outro, n] of Object.entries(g.nos)) if (n.cita.includes(r)) somar(outro, 1);
  }
  const arquivos = [...pontos.entries()].filter(([, s]) => s >= 1).sort((a, b) => b[1] - a[1]).slice(0, opcoes.maxArquivos || 6)
    .map(([rel, s]) => ({ rel, d: (g.nos[rel] || {}).d || '', s, ligado: !semente.includes(rel) }));
  const regsOrd = achados.sort((a, b) => b.s - a.s).slice(0, opcoes.maxRegistros || 6);
  return { registros: regsOrd, arquivos };
}

module.exports = { obter, buscar, termos, radical, montar };

if (require.main === module) {
  const cwd = path.resolve(process.argv[2] || process.cwd());
  const g = obter(cwd, 0);
  console.log(`${Object.keys(g.nos).length} arquivos no grafo${g.completo ? '' : ' (parcial)'} → .claude/base/MAPA-AUTO.md`);
  if (process.argv[3]) {
    const r = buscar(cwd, process.argv.slice(3).join(' '), { grafo: g });
    for (const x of r.registros) console.log(`(${x.rotulo}) ${x.texto}`);
    for (const a of r.arquivos) console.log(`(arquivo${a.ligado ? ', ligado' : ''}) ${a.rel}${a.d ? ' — ' + a.d : ''}`);
  }
}
