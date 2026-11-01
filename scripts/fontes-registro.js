// Registro das fontes de terceiros (fontes/fontes.json): de onde veio cada arquivo adaptado do plugin.
// Os campos repo, licença, branch, pasta e commits são escritos à mão (pela skill /atualizar-fontes); a lista "arquivos"
// (origem → destino) é refeita pelo gerar-agentes.js a partir da linha de crédito de cada arquivo, para nunca divergir.
'use strict';
const fs = require('fs');
const path = require('path');

const ARQ = (raiz) => path.join(raiz, 'fontes', 'fontes.json');

function listar(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listar(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

// Arquivos que podem trazer linha de crédito: referências (.md, 1ª linha) e modelos/scripts/ferramentas (comentário no topo).
function arquivosComCredito(raiz) {
  const fonte = path.join(raiz, 'fonte', 'agentes');
  const pacotes = fs.existsSync(fonte) ? fs.readdirSync(fonte).filter((p) => fs.statSync(path.join(fonte, p)).isDirectory()) : [];
  return [
    ...listar(path.join(raiz, 'conhecimento')), ...pacotes.flatMap((p) => listar(path.join(fonte, p, 'referencias'))),
    ...listar(path.join(raiz, 'modelos')), ...listar(path.join(raiz, 'scripts')), ...listar(path.join(raiz, 'hooks')),
    ...listar(path.join(raiz, 'ferramentas')),
  ].filter((f) => /\.(md|js|mjs|cjs|html|css)$/.test(f)).map((f) => path.relative(raiz, f).split(path.sep).join('/')).sort();
}

// "Adaptado de dono/repo/caminho e outro/caminho @abc1234, © ..." → [{ repo, origem, commit }]. Uma linha pode ter várias.
function creditos(texto) {
  const topo = texto.split(/\r?\n/).slice(0, 6).join(' ');
  if (!/Adaptado de /.test(topo)) return [];
  const saida = [];
  // A lista de caminhos do mesmo repositório vem separada por ", " ou " e ", antes do "@commit".
  for (const m of topo.matchAll(/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/(\S+(?:(?:, e|,| e) \S+)*)\s+@([0-9a-f]{7,40})/g)) {
    const repo = `${m[1]}/${m[2]}`;
    for (const o of m[3].split(/, e |, | e /)) saida.push({ repo, origem: o.replace(/^(?:\/\/\s*)/, '').replace(/[,;]$/, ''), commit: m[4] });
  }
  return saida;
}

function usos(raiz) {
  const porRepo = {};
  for (const rel of arquivosComCredito(raiz)) {
    let t = '';
    try { t = fs.readFileSync(path.join(raiz, rel), 'utf8'); } catch (e) { continue; }
    for (const c of creditos(t)) (porRepo[c.repo] = porRepo[c.repo] || []).push({ origem: c.origem, destino: rel, commit: c.commit });
  }
  for (const r of Object.keys(porRepo)) porRepo[r].sort((a, b) => (a.destino + a.origem).localeCompare(b.destino + b.origem));
  return porRepo;
}

function ler(raiz) {
  try { return JSON.parse(fs.readFileSync(ARQ(raiz), 'utf8')); } catch (e) { return null; }
}

// Devolve o registro com a lista "arquivos" refeita a partir dos créditos (não grava).
function sincronizado(raiz) {
  const reg = ler(raiz);
  if (!reg) return null;
  const u = usos(raiz);
  for (const f of reg.fontes) f.arquivos = (u[f.repo] || []).map(({ origem, destino }) => ({ origem, destino }));
  return reg;
}

const texto = (reg) => JSON.stringify(reg, null, 2) + '\n';

module.exports = { ARQ, ler, usos, creditos, sincronizado, texto, arquivosComCredito };
