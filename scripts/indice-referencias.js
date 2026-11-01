// Índice das referências sob demanda (0.8.0): lê o cabeçalho de cada arquivo de conhecimento/ (e de
// fonte/agentes/<pacote>/referencias/) e monta conhecimento/indice.json, que o roteador usa para sugerir até 3
// referências por agente a cada pedido. Usado pelo gerar-agentes.js (grava) e pelo validar.js (confere se está em dia).
//   2ª linha: <!-- ref: tema=<id>; palavras=<termo>, <termo>; agentes=<agente>, <agente>[; requer=<integração>] -->
//   3ª linha: <!-- teste-ref: sim=<pedido que deve puxar> | <outro>; nao=<pedido que não deve puxar> -->
'use strict';
const fs = require('fs');
const path = require('path');

function listar(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listar(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

function arquivosDeReferencia(raiz) {
  const fonte = path.join(raiz, 'fonte', 'agentes');
  const pacotes = fs.existsSync(fonte) ? fs.readdirSync(fonte).filter((p) => fs.statSync(path.join(fonte, p)).isDirectory()) : [];
  return [...listar(path.join(raiz, 'conhecimento')), ...pacotes.flatMap((p) => listar(path.join(fonte, p, 'referencias')))]
    .filter((f) => f.endsWith('.md')).map((f) => path.relative(raiz, f).split(path.sep).join('/')).sort();
}

const campos = (texto) => Object.fromEntries(texto.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
  const i = p.indexOf('=');
  return i < 0 ? [p, ''] : [p.slice(0, i).trim(), p.slice(i + 1).trim()];
}));
const lista = (v, sep = ',') => String(v || '').split(sep).map((x) => x.trim()).filter(Boolean);

// Devolve { referencias: [...], problemas: [...] }. Arquivo sem a linha "ref:" (INDICE.md, LEIA-ME.md) fica de fora.
function montar(raiz) {
  const referencias = [];
  const problemas = [];
  for (const arq of arquivosDeReferencia(raiz)) {
    const linhas = fs.readFileSync(path.join(raiz, arq), 'utf8').split(/\r?\n/);
    const mRef = (linhas[1] || '').match(/^<!-- ref:(.*)-->\s*$/);
    if (!mRef) { if (!/(^|\/)(INDICE|LEIA-ME)\.md$/.test(arq)) problemas.push(`${arq}: 2ª linha sem "<!-- ref: tema=…; palavras=…; agentes=… -->"`); continue; }
    const c = campos(mRef[1]);
    const ref = { arquivo: arq, tema: c.tema || '', palavras: lista(c.palavras).map((p) => p.toLowerCase()), agentes: lista(c.agentes) };
    if (c.requer) ref.requer = c.requer;
    const mTeste = (linhas[2] || '').match(/^<!-- teste-ref:(.*)-->\s*$/);
    if (mTeste) { const t = campos(mTeste[1]); ref.teste = { sim: lista(t.sim, '|'), nao: lista(t.nao, '|') }; }
    if (!ref.tema) problemas.push(`${arq}: "ref:" sem tema`);
    if (ref.palavras.length < 2) problemas.push(`${arq}: "ref:" com menos de 2 palavras`);
    if (!ref.agentes.length) problemas.push(`${arq}: "ref:" sem agentes`);
    referencias.push(ref);
  }
  return { referencias, problemas };
}

const texto = (referencias) => JSON.stringify({
  _como_usar: 'Gerado por scripts/gerar-agentes.js a partir da 2ª e 3ª linhas de cada referência. Não edite aqui.',
  referencias,
}, null, 2) + '\n';

module.exports = { montar, texto, arquivosDeReferencia };
