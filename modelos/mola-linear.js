#!/usr/bin/env node
// Modelo do agentes-ultimate (texto próprio). Mola de interface amostrada em CSS linear(), a partir dos mesmos parâmetros da
// mola do JS. Uma mola só por produto: o CSS e o JS (ou o WebGL) usam a mesma curva.
//
// Parâmetros (massa 1), em qualquer uma das duas formas:
//   { duracao, bounce }          duração percebida em s e quique (0 = sem quique; ~0,4 no máximo), como na WWDC23 "Animate with springs"
//   { rigidez, amortecimento }   k e c da física (ex.: 170 e 24)
// Conversão usada nas provas da 0.8.0 (docs/provas/0.8.0-design/): k = (2π / duração)²; c = 4π(1 − bounce) / duração (bounce ≥ 0).
// Com bounce 0, c = 2√k (amortecimento crítico). [HIPÓTESE] a conferir na sessão da WWDC23: a nota da pesquisa
// (docs/pesquisas/acabamento-premium-2026-11.md) traz "1 − 4π × bounce ÷ duração", que não tem a unidade de amortecimento;
// provável erro de transcrição. Esta fórmula dá amortecimento crítico em bounce 0, como a física exige.
//
// Uso no código: const { mola } = require('<plugin>/modelos/mola-linear.js'); mola({ duracao: 0.5, bounce: 0.15 }).css
// Linha de comando:
//   node mola-linear.js 0.5 0.15 [nome]               (duração e bounce)
//   node mola-linear.js --rigidez 170 --amortecimento 24 [--pontos 36] [--nome casa]
// Saída: a variável CSS (--mola-<nome>), a duração até assentar em ms e quanto passa do alvo.
'use strict';

function parametros(p) {
  if (p.rigidez != null && p.amortecimento != null) {
    const k = +p.rigidez, c = +p.amortecimento;
    const duracao = 2 * Math.PI / Math.sqrt(k);
    return { k, c, duracao, bounce: 1 - c * duracao / (4 * Math.PI) };
  }
  const duracao = +p.duracao, bounce = p.bounce == null ? 0 : +p.bounce;
  if (!(duracao > 0)) throw new Error('mola: duração > 0 ou rigidez e amortecimento');
  if (bounce < 0 || bounce >= 1) throw new Error('mola: bounce de 0 a 1 (sem incluir 1); quique de interface vai até ~0,4');
  return { k: (2 * Math.PI / duracao) ** 2, c: 4 * Math.PI * (1 - bounce) / duracao, duracao, bounce };
}

// Simula de 0 a 1 (integração semi-implícita, passo de 0,5 ms) até assentar (|1 − x| < 0,001 e velocidade < 0,01 por 20 ms)
// e amostra n + 1 pontos de 0 ao fim. O último ponto é 1.
function mola(p, opcoes = {}) {
  const { k, c, duracao, bounce } = parametros(p);
  const n = opcoes.pontos || 48;
  const dt = 1 / 2000; let x = 0, v = 0, t = 0, fim = 0, parado = 0, pico = 0;
  const amostra = [0];
  for (; t < 4; t += dt) {
    v += (k * (1 - x) - c * v) * dt; x += v * dt;
    amostra.push(x); if (x > pico) pico = x;
    if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01) { if (++parado > 40) { fim = t; break; } } else parado = 0;
  }
  if (!fim) fim = t;
  const pontos = [];
  for (let i = 0; i <= n; i++) {
    const j = Math.min(amostra.length - 1, Math.round((fim * i / n) / dt));
    pontos.push(i === n ? 1 : +amostra[j].toFixed(4));
  }
  return {
    css: `linear(${pontos.join(', ')})`, ms: Math.round(fim * 1000), passa: +(pico - 1).toFixed(3), pontos: pontos.length,
    rigidez: +k.toFixed(3), amortecimento: +c.toFixed(3), duracao: +duracao.toFixed(4), bounce: +bounce.toFixed(4),
  };
}

module.exports = { mola, parametros };

if (require.main === module) {
  const a = process.argv.slice(2);
  const op = (n) => { const i = a.indexOf('--' + n); return i >= 0 ? a[i + 1] : undefined; };
  const soltos = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
  const p = op('rigidez') != null ? { rigidez: op('rigidez'), amortecimento: op('amortecimento') } : { duracao: soltos[0], bounce: soltos[1] };
  if (p.rigidez == null && p.duracao == null) {
    console.log('Uso: node mola-linear.js <duração s> <bounce> [nome] | --rigidez K --amortecimento C [--pontos N] [--nome X]');
    process.exit(2);
  }
  const nome = op('nome') || (p.rigidez == null ? soltos[2] : soltos[0]) || 'mola';
  const m = mola(p, { pontos: op('pontos') ? +op('pontos') : undefined });
  console.log(`--mola-${nome}: ${m.css}; --mola-${nome}-ms: ${m.ms}ms; /* rigidez ${m.rigidez}, amortecimento ${m.amortecimento}, duração ${m.duracao} s, bounce ${m.bounce}; assenta em ${m.ms} ms, passa ${(m.passa * 100).toFixed(1)}%; ${m.pontos} pontos */`);
}
