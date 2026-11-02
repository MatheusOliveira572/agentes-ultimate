// Molas por duração e bounce (WWDC23 "Animate with springs", massa 1), amostradas em CSS linear().
// rigidez k = (2π / duração)²; amortecimento c = 4π(1 − bounce) / duração para bounce ≥ 0 (bounce 0 = amortecimento crítico,
// c = 2√k). Simula a posição de 0 a 1 até assentar (|1 − x| < 0,001 e velocidade ~0) e amostra N pontos.
// Uso: node gerar-molas.js [duracao bounce nome]...   Sem argumentos, imprime as molas usadas nas provas pv94/hd103.
'use strict';
function mola(duracao, bounce, n = 48) {
  const k = (2 * Math.PI / duracao) ** 2, c = 4 * Math.PI * (1 - bounce) / duracao;
  const dt = 1 / 2000; let x = 0, v = 0, t = 0; const amostra = [[0, 0]]; let fim = 0, parado = 0;
  for (; t < 4; t += dt) {                            // integração semi-implícita, passo de 0,5 ms
    v += (k * (1 - x) - c * v) * dt; x += v * dt;
    amostra.push([t + dt, x]);
    if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01) { if (++parado > 40) { fim = t; break; } } else parado = 0;
  }
  if (!fim) fim = t;
  const pontos = [];
  for (let i = 0; i <= n; i++) {
    const tt = fim * i / n; const j = Math.min(amostra.length - 1, Math.round(tt / dt));
    pontos.push(i === n ? 1 : +amostra[j][1].toFixed(4));
  }
  const pico = Math.max(...amostra.map((a) => a[1]));
  return { css: `linear(${pontos.join(', ')})`, ms: Math.round(fim * 1000), pico: +(pico - 1).toFixed(3), pontos: pontos.length };
}
module.exports = { mola };
if (require.main === module) {
  const a = process.argv.slice(2);
  const lista = a.length ? [[+a[0], +a[1], a[2] || 'mola']] : [[0.42, 0, 'resposta'], [0.5, 0.15, 'objeto'], [0.55, 0.3, 'pico']];
  for (const [d, b, nome] of lista) { const m = mola(d, b); console.log(`--mola-${nome}: ${m.css}; --mola-${nome}-ms: ${m.ms}ms; /* duração ${d}, bounce ${b}, assenta em ${m.ms} ms, passa ${(m.pico * 100).toFixed(1)}% */`); }
}
