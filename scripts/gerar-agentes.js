#!/usr/bin/env node
// Gera agents/<nome>.md juntando a parte específica (fonte/agentes/<pacote>/<nome>.md) com o protocolo comum
// (fonte/comum.md). Mudou o comum, muda em todos. Rode depois de editar qualquer arquivo em fonte/.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const comum = fs.readFileSync(path.join(RAIZ, 'fonte', 'comum.md'), 'utf8').trim();
const destino = path.join(RAIZ, 'agents');
fs.mkdirSync(destino, { recursive: true });

const gerados = [];
for (const pacote of fs.readdirSync(path.join(RAIZ, 'fonte', 'agentes'))) {
  const dir = path.join(RAIZ, 'fonte', 'agentes', pacote);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const arq of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const especifico = fs.readFileSync(path.join(dir, arq), 'utf8').trim();
    const aviso = `<!-- Gerado por scripts/gerar-agentes.js a partir de fonte/agentes/${pacote}/${arq} + fonte/comum.md. Não edite aqui. -->`;
    const [, cab, corpo] = especifico.match(/^(---[\s\S]*?---)\s*([\s\S]*)$/) || [];
    if (!cab) { console.error(`sem cabeçalho: ${pacote}/${arq}`); process.exit(1); }
    // "Referências sob demanda" vai depois do protocolo comum: é índice de arquivos, não conta nas 90 linhas da parte específica.
    const iRef = corpo.indexOf('## Referências sob demanda');
    let principal = corpo.trim(); let refs = '';
    if (iRef >= 0) {
      const fim = corpo.indexOf('\n## ', iRef + 5);
      refs = (fim >= 0 ? corpo.slice(iRef, fim) : corpo.slice(iRef)).trim();
      principal = (corpo.slice(0, iRef) + (fim >= 0 ? corpo.slice(fim + 1) : '')).trim();
    }
    fs.writeFileSync(path.join(destino, arq), `${cab}\n${aviso}\n${principal}\n\n${comum}\n${refs ? `\n${refs}\n` : ''}`);
    gerados.push(`${pacote}/${arq}`);
  }
}
console.log(`${gerados.length} agentes gerados em agents/:\n  ` + gerados.join('\n  '));

// Índice das referências sob demanda (0.8.0): conhecimento/indice.json, lido pelo roteador.
const indice = require('./indice-referencias');
const { referencias, problemas } = indice.montar(RAIZ);
if (fs.existsSync(path.join(RAIZ, 'conhecimento'))) {
  fs.writeFileSync(path.join(RAIZ, 'conhecimento', 'indice.json'), indice.texto(referencias));
  console.log(`conhecimento/indice.json: ${referencias.length} referência(s)${problemas.length ? `, ${problemas.length} problema(s) (veja o validar.js)` : ''}`);
}

// Registro das fontes (0.8.0): a lista origem → destino de fontes/fontes.json sai das linhas de crédito.
const fontesReg = require('./fontes-registro');
const regSinc = fontesReg.sincronizado(RAIZ);
if (regSinc) {
  fs.writeFileSync(fontesReg.ARQ(RAIZ), fontesReg.texto(regSinc));
  console.log(`fontes/fontes.json: ${regSinc.fontes.length} fonte(s), ${regSinc.fontes.reduce((n, f) => n + f.arquivos.length, 0)} arquivo(s) de origem ligados`);
}
