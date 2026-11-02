// Clara 35: vitrine. Gera as peças decorativas (brilho do mar, diafragma, luzes), revela os blocos ao entrar na tela
// (escalonados, com a mola da casa), faz a reserva (pico do fluxo, com continuidade) e troca as imagens de reserva da lente.
// A lente em WebGL fica em lente3d.js. Sem JS a página continua inteira: todos os textos à vista, a lente em imagem.
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

  // Revelação: cada bloco entra uma vez, com a mola da casa, escalonado 45 ms dentro do grupo (o principal primeiro).
  // A transição é por tempo (não presa à rolagem): rolar aos saltos não faz o texto pular. Movimento reduzido: só esmaece.
  // Imagens de reserva da lente: a vista aberta substitui a montada quando a lista entra (só quando não há WebGL).
  raiz.classList.add('io');
  { const grupos = new Map(); for (const e of $$('.revela')) { const g = e.parentElement; const i = grupos.get(g) || 0; e.style.setProperty('--i', i); grupos.set(g, i + 1); } }
  const abertura = $('.abertura'), lista = $('#por-dentro');
  const io = new IntersectionObserver((es) => { for (const e of es) {
    if (e.target === lista) abertura.classList.toggle('aberta', e.isIntersecting || e.boundingClientRect.top < 0);
    else if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  } }, { rootMargin: '0px 0px -8% 0px' });
  io.observe(lista); $$('.revela').forEach((e) => io.observe(e));

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

  // Reserva: o pico do fluxo. O mesmo botão troca de rótulo por baixo (camadas que deslizam com a mola), o ✓ se desenha e
  // o aviso abaixo troca no mesmo lugar; Desfazer volta pelo mesmo caminho, interrompível no meio (transição, não animação fixa).
  const bReservar = $('#b-reservar'), cartao = $('#cartao'), aviso = $('#aviso-sr');
  function marcar(sim) {
    cartao.classList.toggle('reservado', sim); bReservar.setAttribute('aria-pressed', String(sim));
    $('.b-antes', bReservar).setAttribute('aria-hidden', String(sim)); $('.b-depois', bReservar).setAttribute('aria-hidden', String(!sim));
    aviso.textContent = sim ? 'Reservada. Lugar guardado na fila de março. Nada é cobrado até o envio.' : 'Reserva desfeita. Sem cobrança até o envio.';
  }
  bReservar?.addEventListener('click', () => { if (!cartao.classList.contains('reservado')) marcar(true); });
  $('#b-desfazer')?.addEventListener('click', () => { marcar(false); bReservar.focus(); });
})();
