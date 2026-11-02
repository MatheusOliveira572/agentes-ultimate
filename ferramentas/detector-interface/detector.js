#!/usr/bin/env node
// Texto próprio do agentes-ultimate. Detector de padrões ruins de interface, sem IA e sem rede, em HTML, CSS, JSX/TSX e Vue.
// Regras tiradas de conhecimento/design (piso de qualidade, detalhes de interface, movimento, acessibilidade, web no celular).
// O detector do impeccable (pbakaus/impeccable, Apache-2.0) deu a ideia; no commit usado ele é em Rust, então nada foi copiado.
//   node ferramentas/detector-interface/detector.js <arquivo> [...]
// Sai 0 sem achado, 1 com achado, 2 em uso errado. Desligado por padrão: liga pelo "verificador" do config (skill integracoes).
'use strict';
const fs = require('fs');

const REGRAS = [
  { id: 'zoom-desligado', re: /user-scalable\s*=\s*no|maximum-scale\s*=\s*1\b/i, msg: 'zoom desligado: falha de acessibilidade (WCAG 1.4.4)' },
  { id: 'sem-foco', re: /outline\s*:\s*(none|0)\b(?![^}]*focus-visible)/i, msg: 'outline tirado sem substituto de :focus-visible' },
  { id: 'div-clicavel', re: /<(div|span)\b[^>]*\bonClick=/, msg: '<div>/<span> clicável: use <button> ou <a href>' },
  { id: 'img-sem-alt', re: /<img\b(?![^>]*\balt=)[^>]*>/i, msg: '<img> sem alt' },
  { id: 'tabindex-positivo', re: /tabindex\s*=\s*["'{]?[1-9]/i, msg: 'tabindex positivo quebra a ordem do teclado' },
  { id: 'transition-all', re: /transition(-property)?\s*:\s*all\b/i, msg: 'transition: all: nomeie as propriedades' },
  { id: 'escala-zero', re: /scale\(\s*0\s*\)/, msg: 'scale(0): comece de 0,9–0,97 com opacidade 0' },
  { id: 'ease-in', re: /\bease-in\b(?!-out)/, msg: 'ease-in em interface atrasa o que a pessoa está olhando: use ease-out' },
  { id: 'texto-gradiente', re: /background-clip\s*:\s*text/i, msg: 'texto em gradiente: ênfase vem de peso ou tamanho' },
  { id: 'borda-lateral', re: /border-(left|right|inline-start|inline-end)\s*:\s*([2-9]|\d{2,})px\s+solid\s+(?!transparent)/i, msg: 'borda lateral colorida acima de 1 px em cartão ou aviso' },
  { id: 'sombra-dura', re: /box-shadow\s*:\s*-?\d+px\s+-?\d+px\s+0(px)?\s/i, msg: 'sombra dura deslocada, sem desfoque' },
  { id: 'altura-100vh', re: /height\s*:\s*100vh/i, msg: '100vh estoura no celular: 100dvh no casco, 100svh no herói' },
  { id: 'largura-100vw', re: /width\s*:\s*100vw/i, msg: '100vw inclui a barra de rolagem: use 100%' },
  { id: 'entrelinha-px', re: /line-height\s*:\s*\d+(\.\d+)?(px|rem)/i, msg: 'entrelinha com unidade: use número sem unidade' },
  { id: 'letra-px', re: /letter-spacing\s*:\s*-?\d+(\.\d+)?px/i, msg: 'espaço entre letras em px: use em' },
  { id: 'vidro-sem-reserva', re: /(?<!-webkit-)backdrop-filter\s*:/i, msg: 'backdrop-filter sem reserva', exceto: /@supports|prefers-reduced-transparency/i },
  { id: 'hover-solto', re: /:hover\s*\{/, msg: ':hover fora de @media (hover: hover): fica preso no toque', exceto: /@media\s*\(\s*hover\s*:\s*hover/i },
  { id: 'movimento-sem-reducao', re: /@keyframes\b/, msg: 'animação sem prefers-reduced-motion', exceto: /prefers-reduced-motion/i },
];

function analisar(texto, nome = '') {
  const achados = [];
  const linhas = texto.split(/\r?\n/);
  for (const r of REGRAS) {
    if (r.exceto && r.exceto.test(texto)) continue;
    linhas.forEach((l, i) => {
      if (r.re.test(l)) achados.push({ arquivo: nome, linha: i + 1, id: r.id, msg: r.msg });
    });
  }
  return achados;
}

if (require.main === module) {
  const arqs = process.argv.slice(2);
  if (!arqs.length) { console.log('uso: node detector.js <arquivo> [...]'); process.exit(2); }
  const t0 = Date.now(); let n = 0; let lidos = 0;
  for (const a of arqs) {
    let t;
    try { t = fs.readFileSync(a, 'utf8'); } catch (e) { console.log(`${a}: não foi possível ler`); continue; }
    lidos++;
    for (const x of analisar(t, a)) { n++; console.log(`${x.arquivo}:${x.linha} [${x.id}] ${x.msg}`); }
  }
  console.log(`detector-interface: ${lidos} arquivo(s), ${n} achado(s), ${Date.now() - t0} ms`);
  process.exit(n ? 1 : 0);
}
module.exports = { analisar, REGRAS };
