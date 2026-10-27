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
    fs.writeFileSync(path.join(destino, arq), `${cab}\n${aviso}\n${corpo.trim()}\n\n${comum}\n`);
    gerados.push(`${pacote}/${arq}`);
  }
}
console.log(`${gerados.length} agentes gerados em agents/:\n  ` + gerados.join('\n  '));
