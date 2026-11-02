// Clara 35: vitrine. Gera as peças decorativas (barril, brilho do mar, diafragma, luzes), liga a luz ao ponteiro,
// faz a reserva (pico do fluxo) e o recuo por IntersectionObserver quando não há linha do tempo de rolagem.
// Sem JS a página continua inteira: textos, links e a lente montada (sem barril e sem brilho do mar).
(function () {
  'use strict';
  const raiz = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  const escuro = matchMedia('(prefers-color-scheme: dark)');
  const temLinha = CSS.supports('animation-timeline: view()');
  const params = new URLSearchParams(location.search);

  // Mutação para provar o verificador: tira um vidro (a contagem "sete elementos" deixa de bater).
  if (params.get('mutar') === 'vidro') $('.vidro[data-n="5"]')?.remove();

  // Luminância do que passa atrás do vidro, pelo tema (liquido.js lê data-lum).
  function lum() { for (const e of $$('[data-lum-claro]')) e.dataset.lum = escuro.matches ? e.dataset.lumEscuro : e.dataset.lumClaro; window.liquido?.quadro(); }
  lum(); escuro.addEventListener('change', lum);

  // Gerador determinístico (mesma ilustração a cada carga).
  let semente = 35;
  const acaso = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;

  // Brilho no mar: traços mais curtos e densos perto do horizonte, uma coluna sob o sol.
  const mar = $('#linhas-mar');
  if (mar) {
    let s = '';
    for (let i = 0; i < 190; i++) {
      const t = acaso(), y = 610 + 288 * t ** 1.7, perto = (y - 606) / 294;
      const naColuna = acaso() < 0.45;
      const x = naColuna ? 1150 + (acaso() - 0.5) * (60 + perto * 260) : acaso() * 1600;
      const w = (naColuna ? 14 : 22) + perto * (naColuna ? 70 : 140) * acaso();
      const h = 0.9 + perto * 2.4;
      const o = naColuna ? 0.35 + 0.55 * acaso() : 0.10 + 0.22 * acaso();
      s += `<rect x="${(x - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(2)}" rx="${(h / 2).toFixed(2)}" opacity="${o.toFixed(2)}"/>`;
    }
    mar.innerHTML = s;
  }

  // Barril: 48 faixas em volta do eixo; o tom de cada uma sai do ângulo até a luz (CSS: cos(--a − --luz-lente)).
  const barril = $('#barril');
  if (barril) {
    const N = 48; let s = '';
    for (let i = 0; i < N; i++) s += `<i class="faixa" style="--a:${(i * 360 / N).toFixed(2)}deg;--par:${i % 2}"></i>`;
    barril.innerHTML = s;
    barril.style.setProperty('--R', 'calc(var(--d) * .47)');
    barril.style.setProperty('--w', `calc(var(--d) * ${(2 * Math.PI * 0.47 / N + 0.004).toFixed(4)})`);
    barril.style.setProperty('--L', 'calc(150 * var(--u))');
  }

  // Diafragma de 11 lâminas: abertura em polígono de lados curvos; cada lado continua até a borda (o desenho das lâminas).
  const LAMINAS = 11;
  function iris(svg, r) {
    if (!svg) return;
    const R = 49, v = [];
    for (let k = 0; k < LAMINAS; k++) { const a = (k / LAMINAS) * Math.PI * 2 - Math.PI / 2; v.push([r * Math.cos(a), r * Math.sin(a)]); }
    const curva = r * 0.16; // lados curvos: a abertura fica quase redonda
    let abertura = `M${v[0][0].toFixed(2)} ${v[0][1].toFixed(2)}`;
    for (let k = 0; k < LAMINAS; k++) {
      const a = v[k], b = v[(k + 1) % LAMINAS], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, l = Math.hypot(mx, my) || 1;
      abertura += ` Q${(mx + (mx / l) * curva).toFixed(2)} ${(my + (my / l) * curva).toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
    }
    let laminas = '';
    for (let k = 0; k < LAMINAS; k++) {
      const a = v[k], b = v[(k + 1) % LAMINAS]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      // da aresta b na direção a→b até o círculo de raio R
      const ux = dx / l, uy = dy / l, p = b[0] * ux + b[1] * uy, q = b[0] ** 2 + b[1] ** 2 - R * R, t = -p + Math.sqrt(Math.max(0, p * p - q));
      laminas += `<path class="iris-lamina" d="M${b[0].toFixed(2)} ${b[1].toFixed(2)} Q${(b[0] + ux * t * 0.5 + uy * 4).toFixed(2)} ${(b[1] + uy * t * 0.5 - ux * 4).toFixed(2)} ${(b[0] + ux * t).toFixed(2)} ${(b[1] + uy * t).toFixed(2)}"/>`;
    }
    svg.innerHTML = `<path class="iris-borda" fill-rule="evenodd" d="M0 -${R} A${R} ${R} 0 1 1 0 ${R} A${R} ${R} 0 1 1 0 -${R} Z ${abertura} Z"/>${laminas}<circle class="iris-anel" r="${R - 0.5}"/>`;
    svg.dataset.laminas = LAMINAS;
  }
  iris($('#iris-lente'), 40);
  iris($('.iris-mini'), 30);

  // Luz e inclinação: a mesma luz do vidro (liquido.js) gira o brilho do barril e dos vidros; a lente inclina ≤ 8° para o ponteiro.
  const lente = $('#obj-lente'), mira = $('#mira');
  const ponteiroFino = matchMedia('(hover: hover) and (pointer: fine)');
  let alvoX = 0, alvoY = 0, atualX = 0, atualY = 0, luz = 135, correndo = false;
  function passo() {
    atualX += (alvoX - atualX) * 0.12; atualY += (alvoY - atualY) * 0.12;
    mira.style.setProperty('--tx', atualX.toFixed(2) + 'deg'); mira.style.setProperty('--ty', atualY.toFixed(2) + 'deg');
    lente.style.setProperty('--luz-lente', luz.toFixed(1) + 'deg');
    if (Math.abs(alvoX - atualX) + Math.abs(alvoY - atualY) > 0.02) requestAnimationFrame(passo); else correndo = false;
  }
  if (lente && mira) addEventListener('pointermove', (e) => {
    if (!ponteiroFino.matches || reduz.matches || e.pointerType !== 'mouse') return;
    const r = mira.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (innerWidth / 2))), ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (innerHeight / 2)));
    alvoY = nx * 8; alvoX = -ny * 8;
    luz = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90 + 180; // a luz vem do lado do ponteiro
    if (!correndo) { correndo = true; requestAnimationFrame(passo); }
  }, { passive: true });

  // Recuo: sem linha do tempo de rolagem, ou com movimento reduzido, a lente se abre quando a lista entra (IntersectionObserver).
  if (!temLinha || reduz.matches) {
    raiz.classList.add('io');
    const abertura = $('.abertura'), lista = $('#por-dentro');
    const io = new IntersectionObserver((es) => { for (const e of es) {
      if (e.target === lista) abertura.classList.toggle('aberta', e.isIntersecting || e.boundingClientRect.top < 0);
      else if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
    } }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(lista); $$('.revela').forEach((e) => io.observe(e));
  }

  // Abertura f/1,4 → f/8: as luzes encolhem (abertura ∝ 1/N), ficam mais fortes e, de f/5,6 em diante, tomam a forma do diafragma.
  const PASSOS = [1.4, 2, 2.8, 4, 5.6, 8];
  const fmt = (n) => 'f/' + String(n).replace('.', ',');
  const luzes = $('#luzes');
  if (luzes) {
    const cores = ['255 190 120', '255 214 170', '255 236 214', '240 162 92', '255 190 120', '140 206 214'];
    let s = '';
    for (let i = 0; i < 30; i++) {
      const fileira = acaso() < 0.6; // a maioria na linha da orla
      const x = acaso() * 100, y = fileira ? 52 + (acaso() - 0.5) * 16 : 18 + acaso() * 70;
      const t = 4 + acaso() ** 1.6 * 13;
      s += `<i class="luz" style="--x:${x.toFixed(1)}%;--y:${y.toFixed(1)}%;--t:${t.toFixed(1)};--c:${cores[Math.floor(acaso() * cores.length)]};--o:${(0.5 + 0.5 * acaso()).toFixed(2)}"></i>`;
    }
    luzes.innerHTML = s;
  }
  let poligono = '';
  { const p = []; for (let k = 0; k < LAMINAS; k++) { const a = (k / LAMINAS) * Math.PI * 2 - Math.PI / 2; p.push(`${(50 + 50 * Math.cos(a)).toFixed(1)}% ${(50 + 50 * Math.sin(a)).toFixed(1)}%`); } poligono = `polygon(${p.join(',')})`; }
  const faixa = $('#abertura-faixa'), valor = $('#abertura-valor'), noite = $('#noite');
  function aplicarAbertura() {
    const n = PASSOS[+faixa.value], k = 1.4 / n;
    noite.style.setProperty('--esc', Math.max(0.12, k ** 0.9).toFixed(3));
    noite.style.setProperty('--a0', Math.min(0.85, 0.30 / Math.max(0.35, k ** 0.8)).toFixed(3));
    noite.style.setProperty('--nitidez', (1 - k).toFixed(3));
    noite.style.setProperty('--forma', n >= 5.6 ? poligono : 'circle(50%)');
    noite.dataset.f = n;
    faixa.style.setProperty('--p', (+faixa.value / 5 * 100) + '%'); valor.textContent = fmt(n); faixa.setAttribute('aria-valuetext', fmt(n));
    iris($('#iris-controle'), 41 * k ** 0.8);
  }
  if (faixa) { faixa.addEventListener('input', aplicarAbertura); aplicarAbertura(); }

  // Reserva: o pico do fluxo. Mola curta no botão, ✓ que se desenha, aviso falado e Desfazer.
  const bReservar = $('#b-reservar'), estado = $('#estado-reserva');
  const textoInicial = estado?.textContent;
  function reservar() {
    if (bReservar.classList.contains('reservada')) return;
    bReservar.classList.add('reservada'); $('.b-rotulo', bReservar).textContent = 'Reservada';
    estado.innerHTML = 'Lugar guardado na fila de março. Nada é cobrado até o envio. <button type="button" class="desfazer" id="b-desfazer">Desfazer</button>';
    $('#b-desfazer').addEventListener('click', () => {
      bReservar.classList.remove('reservada'); $('.b-rotulo', bReservar).textContent = 'Reservar';
      estado.textContent = 'Reserva desfeita. ' + textoInicial; bReservar.focus();
    });
  }
  bReservar?.addEventListener('click', reservar);
})();
