// Molas por duração e bounce das provas pv94/hd103, amostradas em CSS linear(). A conta está no modelo do plugin,
// modelos/mola-linear.js (física da WWDC23, massa 1; rigidez (2π/d)², amortecimento 4π(1 − bounce)/d); aqui só a lista.
// Uso: node gerar-molas.js [duracao bounce nome]...   Sem argumentos, imprime as molas usadas nas provas pv94/hd103.
'use strict';
const modelo = require('../../../../modelos/mola-linear.js');
// Mesmo formato de antes (pico = quanto passa do alvo), para quem já usava este arquivo.
function mola(duracao, bounce, n = 48) { const m = modelo.mola({ duracao, bounce }, { pontos: n }); return { css: m.css, ms: m.ms, pico: m.passa, pontos: m.pontos }; }
module.exports = { mola };
if (require.main === module) {
  const a = process.argv.slice(2);
  const lista = a.length ? [[+a[0], +a[1], a[2] || 'mola']] : [[0.42, 0, 'resposta'], [0.5, 0.15, 'objeto'], [0.55, 0.3, 'pico']];
  for (const [d, b, nome] of lista) { const m = mola(d, b); console.log(`--mola-${nome}: ${m.css}; --mola-${nome}-ms: ${m.ms}ms; /* duração ${d}, bounce ${b}, assenta em ${m.ms} ms, passa ${(m.pico * 100).toFixed(1)}% */`); }
}
