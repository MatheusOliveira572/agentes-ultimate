// Mostruário dos mundos (mt106). Texto e código próprios do agentes-ultimate.
// Um conjunto de dados fictício (Estação Maré) desenhado no idioma de cada mundo; a imagem do mundo Apple é um mar
// renderizado aqui, pixel a pixel (sem foto de terceiros). Entrada uma vez, com a mola do mundo (molas.css).
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  // Altura das ondas (m), de 10 em 10 minutos, das 8h às 14h (37 leituras). A última é o número da tela: 1,8 m.
  const SERIE = [1.32, 1.30, 1.34, 1.37, 1.33, 1.36, 1.41, 1.39, 1.43, 1.46, 1.44, 1.42, 1.47, 1.50, 1.48, 1.52, 1.55, 1.53, 1.51,
    1.56, 1.59, 1.57, 1.61, 1.64, 1.62, 1.60, 1.65, 1.68, 1.66, 1.70, 1.73, 1.71, 1.69, 1.74, 1.77, 1.76, 1.80];
  const N = SERIE.length;
  const HORAS = [[0, '8h'], [12, '10h'], [24, '12h'], [36, '14h']];
  const ULT = SERIE[N - 1];
  const fmt = (v, c = 1) => v.toFixed(c).replace('.', ',');
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = new URLSearchParams(location.search);

  // ---------- SVG ----------
  function el(nome, at = {}, pai) {
    const e = document.createElementNS(NS, nome);
    for (const [k, v] of Object.entries(at)) e.setAttribute(k, v);
    if (pai) pai.appendChild(e);
    return e;
  }
  function texto(pai, x, y, s, cls, at = {}) { const t = el('text', { x, y, class: cls, ...at }, pai); t.textContent = s; return t; }
  function preparar(svg) {
    // tamanho sem transform (o visor do retrô entra com scaleY): o desenho usa a medida de layout
    const cs = getComputedStyle(svg); const w = Math.round(parseFloat(cs.width)), h = Math.round(parseFloat(cs.height));
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.innerHTML = ''; svg.dataset.ultimo = String(SERIE[N - 1]);
    return { w, h };
  }
  const escala = (x0, x1, y0, y1, vmin, vmax) => ({ x: (i) => x0 + (x1 - x0) * i / (N - 1), y: (v) => y0 + (y1 - y0) * (v - vmin) / (vmax - vmin) });
  const pontos = (s) => SERIE.map((v, i) => [s.x(i), s.y(v)]);
  const reta = (p) => 'M' + p.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L');
  // Curva suave que passa pelos pontos (cúbica monotônica: não inventa pico entre leituras).
  function suave(p) {
    const n = p.length; const dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = p[i + 1][0] - p[i][0]; m[i] = (p[i + 1][1] - p[i][1]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    let d = `M${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`;
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      d += `C${(p[i][0] + h).toFixed(2)} ${(p[i][1] + t[i] * h).toFixed(2)} ${(p[i + 1][0] - h).toFixed(2)} ${(p[i + 1][1] - t[i + 1] * h).toFixed(2)} ${p[i + 1][0].toFixed(2)} ${p[i + 1][1].toFixed(2)}`;
    }
    return d;
  }
  const degraus = (p) => 'M' + p.map(([x, y], i) => (i ? `H${x.toFixed(1)}V${y.toFixed(1)}` : `${x.toFixed(1)} ${y.toFixed(1)}`)).join('');
  function gradiente(svg, id, cor, a0, a1) {
    const defs = el('defs', {}, svg); const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': cor, 'stop-opacity': a0 }, g); el('stop', { offset: 1, 'stop-color': cor, 'stop-opacity': a1 }, g);
  }

  const GRAF = {
    apple(svg) {
      const { w, h } = preparar(svg); gradiente(svg, 'ap-grad', '#ffffff', 0.30, 0);
      const s = escala(4, w - 70, h - 34, 18, 1.2, 1.85); const p = pontos(s);
      for (const v of [1.4, 1.6]) el('line', { x1: 0, x2: w, y1: s.y(v), y2: s.y(v), class: 'guia' }, svg);
      el('path', { d: suave(p) + `L${p[N - 1][0]} ${h - 34}L${p[0][0]} ${h - 34}Z`, class: 'area' }, svg);
      el('path', { d: suave(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1];
      el('circle', { cx: lx, cy: ly, r: 12, class: 'halo' }, svg); el('circle', { cx: lx, cy: ly, r: 5, class: 'ponto' }, svg);
      texto(svg, lx + 18, ly + 5, fmt(SERIE[N - 1]) + ' m', 'nota', { 'data-nota': '' });
      for (const [i, s2] of HORAS) texto(svg, s.x(i), h - 6, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle' });
    },
    editorial(svg) {
      const { w, h } = preparar(svg); const fim = w - 140;
      const s = escala(0, fim, h - 30, 20, 1.25, 1.85); const p = pontos(s);
      for (const v of [1.4, 1.6, 1.8]) el('line', { x1: 0, x2: fim + 4, y1: s.y(v), y2: s.y(v), class: 'guia' }, svg);
      el('line', { x1: 0, x2: w, y1: h - 30 + 0.5, y2: h - 30 + 0.5, class: 'base' }, svg);
      el('path', { d: reta(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1]; el('circle', { cx: lx, cy: ly, r: 4.5, class: 'ponto' }, svg);
      texto(svg, lx + 12, ly + 6, fmt(SERIE[N - 1]) + ' m', 'nota', { 'data-nota': '' });
      for (const [i, s2] of HORAS) texto(svg, s.x(i), h - 8, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : 'middle' });
    },
    suico(svg) {
      const { w, h } = preparar(svg); const base = h - 28; const passo = w / N; const larg = Math.round(passo * 0.62);
      const s = { y: (v) => base - (base - 30) * v / 2.0 };
      SERIE.forEach((v, i) => {
        const x = Math.round(i * passo); const y = s.y(v);
        el('rect', { x, y: y.toFixed(1), width: larg, height: (base - y).toFixed(1), class: 'barra' + (i === N - 1 ? ' agora' : ''), style: `--j:${i}` }, svg);
      });
      el('line', { x1: 0, x2: w, y1: base + 0.5, y2: base + 0.5, class: 'base' }, svg);
      const lx = Math.round((N - 1) * passo) + larg; texto(svg, lx, s.y(ULT) - 10, fmt(SERIE[N - 1]) + ' m', 'nota', { 'text-anchor': 'end', 'data-nota': '' });
      for (const [i, s2] of HORAS) texto(svg, i === N - 1 ? Math.round(i * passo) + larg : Math.round(i * passo), h - 6, s2, 'eixo', { 'text-anchor': i === N - 1 ? 'end' : 'start' });
    },
    quente(svg) {
      const { w, h } = preparar(svg);
      const defs = el('defs', {}, svg);
      const f = el('filter', { id: 'qt-sombra', x: '-10%', y: '-20%', width: '120%', height: '140%' }, defs);
      el('feDropShadow', { dx: 0, dy: -3, stdDeviation: 4, 'flood-color': '#5c3a1c', 'flood-opacity': 0.30 }, f);
      const fim = w - 64;
      const camada = (j, cor, desloc, amp, fase) => {
        const g = el('g', { class: 'camada', style: `--j:${j}` }, svg);
        const s = escala(0, fim, 0, 0, 0, 1); const pts = SERIE.map((v, i) => [s.x(i), desloc - (v - 1.2) * amp + Math.sin(i * 0.45 + fase) * 5]);
        pts.push([w + 2, pts[pts.length - 1][1]]);
        el('path', { d: suave(pts) + `L${w + 2} ${h + 2}L-2 ${h + 2}Z`, fill: cor, filter: 'url(#qt-sombra)' }, g);
        return { g, pts };
      };
      el('circle', { cx: Math.round(w * 0.3), cy: 178, r: 46, fill: '#d79a35', class: 'camada', style: '--j:0' }, svg);
      camada(1, '#e3c79c', 292, 120, 0.8);
      camada(2, '#8c8a4c', 360, 140, 2.1);
      const topo = el('g', { class: 'camada', style: '--j:3' }, svg);
      const s = escala(0, fim, 0, 0, 0, 1); const p = SERIE.map((v, i) => [s.x(i), 470 - (v - 1.2) * 260]); p.push([w + 2, p[N - 1][1]]);
      el('path', { d: suave(p) + `L${w + 2} ${h + 2}L-2 ${h + 2}Z`, fill: '#a8481f', filter: 'url(#qt-sombra)' }, topo);
      for (const [i, s2] of HORAS) texto(topo, i === N - 1 ? s.x(i) : s.x(i) + (i === 0 ? 28 : 0), h - 22, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : 'middle', fill: '#fff8ee', style: 'fill:#fff8ee' });
      const [lx, ly] = p[N - 1];
      const et = el('g', { class: 'etiqueta camada', style: '--j:4' }, svg);
      el('line', { x1: lx, y1: ly - 2, x2: lx - 40, y2: ly - 62, stroke: '#3a2617', 'stroke-width': 1.2 }, et);
      const tw = 104, th = 46, tx = lx - 40 - tw + 14, ty = ly - 62 - th + 6;
      el('rect', { x: tx, y: ty, width: tw, height: th, rx: 7, filter: 'url(#qt-sombra)' }, et);
      el('circle', { cx: tx + tw - 13, cy: ty + 13, r: 4, class: 'furo' }, et);
      texto(et, tx + 16, ty + 32, fmt(SERIE[N - 1]) + ' m', '', { 'data-nota': '' });
      el('circle', { cx: lx, cy: ly, r: 4.5, fill: '#3a2617' }, et);
    },
    escuro(svg) {
      const { w, h } = preparar(svg); gradiente(svg, 'es-grad', 'oklch(0.82 0.17 155)', 0.22, 0);
      const s = escala(46, w - 64, h - 30, 16, 1.2, 1.9); const p = pontos(s);
      for (const v of [1.2, 1.4, 1.6, 1.8]) { el('line', { x1: 46, x2: w, y1: s.y(v), y2: s.y(v), class: 'guia' }, svg); texto(svg, 0, s.y(v) + 4, fmt(v), 'eixo'); }
      el('path', { d: reta(p) + `L${p[N - 1][0]} ${h - 30}L${p[0][0]} ${h - 30}Z`, class: 'area' }, svg);
      el('path', { d: reta(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1]; el('circle', { cx: lx, cy: ly, r: 9, class: 'halo' }, svg); el('circle', { cx: lx, cy: ly, r: 3.5, class: 'ponto' }, svg);
      texto(svg, lx + 14, ly + 4, fmt(SERIE[N - 1]) + ' m', 'nota', { 'data-nota': '' });
      for (const [i, s2] of [[0, '08:00'], [12, '10:00'], [24, '12:00'], [36, '14:00']]) texto(svg, s.x(i), h - 6, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle' });
    },
    ludico(svg) {
      const { w, h } = preparar(svg); const fim = w - 92;
      const s = escala(-10, fim, 0, 0, 0, 1); const p = SERIE.map((v, i) => [s.x(i), 470 - (v - 1.2) * 330]);
      const ondinha = Array.from({ length: 14 }, (_, i) => [-20 + i * (w + 40) / 13, h - 92 + Math.sin(i * 1.3) * 10]);
      el('path', { d: suave(p) + `L${p[N - 1][0] + 160} ${p[N - 1][1]}L${w + 20} ${h + 20}L-20 ${h + 20}Z`, class: 'area' }, svg);
      el('path', { d: suave(ondinha) + `L${w + 20} ${h + 20}L-20 ${h + 20}Z`, class: 'area-2' }, svg);
      el('path', { d: suave(p), class: 'linha' }, svg);
      for (const [i, s2] of HORAS) texto(svg, i === 0 ? 32 : s.x(i), h - 34, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : 'middle' });
      const [lx, ly] = p[N - 1];
      // a boia: personagem próprio (corpo, faixa, olhos, mastro e bandeira), sentada na linha
      const b = el('g', { class: 'boia' }, svg); const cx = lx, cy = ly - 24;
      el('line', { x1: cx, y1: cy - 30, x2: cx, y2: cy - 72, stroke: '#23194a', 'stroke-width': 5, 'stroke-linecap': 'round' }, b);
      el('path', { d: `M${cx + 2} ${cy - 72}l30 9-30 10Z`, fill: '#ffd34d', stroke: '#23194a', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, b);
      const cp = el('clipPath', { id: 'lu-corpo' }, el('defs', {}, b)); el('circle', { cx, cy, r: 34 }, cp);
      el('circle', { cx, cy, r: 34, fill: '#ff6a55' }, b);
      el('rect', { x: cx - 40, y: cy - 4, width: 80, height: 14, fill: '#fff', 'clip-path': 'url(#lu-corpo)' }, b);
      el('circle', { cx, cy, r: 34, fill: 'none', stroke: '#23194a', 'stroke-width': 4 }, b);
      el('ellipse', { cx: cx - 11, cy: cy - 13, rx: 4.5, ry: 6, fill: '#23194a' }, b); el('ellipse', { cx: cx + 11, cy: cy - 13, rx: 4.5, ry: 6, fill: '#23194a' }, b);
      el('circle', { cx: cx - 9.5, cy: cy - 15.5, r: 1.6, fill: '#fff' }, b); el('circle', { cx: cx + 12.5, cy: cy - 15.5, r: 1.6, fill: '#fff' }, b);
      el('path', { d: `M${cx - 22} ${cy - 22}a26 26 0 0 1 16-9`, stroke: '#fff', 'stroke-opacity': 0.6, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, b);
      const bl = el('g', { class: 'balao' }, svg); const bw = 104, bh = 54, bx = cx - 40 - bw, by = cy - 110;
      el('rect', { x: bx, y: by + 5, width: bw, height: bh, rx: 22, class: 'sombra' }, bl);
      el('rect', { x: bx, y: by, width: bw, height: bh, rx: 22 }, bl);
      el('path', { d: `M${bx + bw - 30} ${by + bh - 2}l22 18-4-20Z`, fill: '#fff' }, bl);
      texto(bl, bx + bw / 2, by + 37, fmt(SERIE[N - 1]) + ' m', '', { 'text-anchor': 'middle', 'data-nota': '' });
    },
    luxo(svg) {
      const { w, h } = preparar(svg); const s = escala(0, w - 10, h - 26, 22, 1.2, 1.85); const p = pontos(s);
      el('path', { d: suave(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1]; el('circle', { cx: lx, cy: ly, r: 9, class: 'anel' }, svg); el('circle', { cx: lx, cy: ly, r: 3, class: 'ponto' }, svg);
      texto(svg, 0, h, '8H', 'eixo'); texto(svg, w, h, '14H', 'eixo', { 'text-anchor': 'end' });
    },
    brutalista(svg) {
      const { w, h } = preparar(svg); const s = escala(52, w - 8, h - 26, 34, 1.2, 1.9); const p = pontos(s);
      for (const v of [1.4, 1.6, 1.8]) { el('line', { x1: 52, x2: w, y1: s.y(v), y2: s.y(v), class: 'guia' }, svg); texto(svg, 0, s.y(v) + 5, fmt(v), 'eixo'); }
      el('path', { d: degraus(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1]; el('rect', { x: lx - 8, y: ly - 8, width: 16, height: 16, class: 'ponto' }, svg);
      el('rect', { x: lx - 92, y: ly - 46, width: 84, height: 30, class: 'nota-fundo' }, svg);
      texto(svg, lx - 50, ly - 26, fmt(SERIE[N - 1]) + ' m', 'nota', { 'text-anchor': 'middle', 'data-nota': '' });
      texto(svg, 52, h - 4, '8h', 'eixo'); texto(svg, w - 8, h - 4, '14h', 'eixo', { 'text-anchor': 'end' });
    },
    corporativo(svg) {
      const { w, h } = preparar(svg); const s = escala(56, w - 60, h - 30, 14, 1.0, 2.0); const p = pontos(s);
      for (const v of [1.0, 1.5, 2.0]) { el('line', { x1: 56, x2: w, y1: s.y(v) + 0.5, y2: s.y(v) + 0.5, class: v === 1.0 ? 'base' : 'guia' }, svg); texto(svg, 0, s.y(v) + 5, fmt(v) + ' m', 'eixo'); }
      el('path', { d: reta(p) + `L${p[N - 1][0]} ${s.y(1.0)}L${p[0][0]} ${s.y(1.0)}Z`, class: 'area' }, svg);
      el('path', { d: reta(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1]; el('circle', { cx: lx, cy: ly, r: 5.5, class: 'ponto' }, svg);
      texto(svg, lx + 12, ly + 5, fmt(SERIE[N - 1]) + ' m', 'nota', { 'data-nota': '' });
      for (const [i, s2] of HORAS) texto(svg, s.x(i), h - 6, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : 'middle' });
    },
    retro(svg) {
      const { w, h } = preparar(svg); const base = h - 32;
      for (let k = 0; k <= 6; k++) el('line', { x1: Math.round(k * (w - 1) / 6) + 0.5, x2: Math.round(k * (w - 1) / 6) + 0.5, y1: 0, y2: base, class: 'guia' }, svg);
      for (let k = 0; k <= 4; k++) el('line', { x1: 0, x2: w, y1: Math.round(k * base / 4) + 0.5, y2: Math.round(k * base / 4) + 0.5, class: 'guia' }, svg);
      const s = escala(0, w - 1, base - 10, 14, 1.2, 1.9); const p = pontos(s);
      el('path', { d: reta(p), class: 'linha' }, svg);
      const [lx, ly] = p[N - 1]; el('rect', { x: lx - 4, y: ly - 4, width: 8, height: 8, class: 'ponto' }, svg);
      for (const [i, s2] of HORAS) texto(svg, s.x(i), h - 4, s2, 'eixo', { 'text-anchor': i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle' });
    },
  };

  // ---------- Mar renderizado (mundo Apple): ondas por soma de senos, reflexo do céu (Fresnel), brilho do sol ----------
  function mar(cv) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); const img = g.createImageData(W, H); const d = img.data;
    const hz = H * 0.6, f = W * 0.95, camH = 2.4;
    const ondas = [[1, 0.25, 0.55, 0.32, 0], [0.7, 0.71, 0.9, 0.16, 1.7], [-0.4, 0.92, 1.6, 0.075, 3.1], [0.95, -0.3, 2.7, 0.04, 0.6],
      [0.2, 0.98, 4.4, 0.022, 2.4], [-0.8, 0.6, 7.1, 0.012, 5.0], [0.6, -0.8, 11.0, 0.007, 4.1], [0.1, -1, 17.0, 0.004, 1.2]]
      .map(([x, z, k, a, ph]) => { const l = Math.hypot(x, z); return [x / l, z / l, k, a, ph]; });
    const sol = (() => { const v = [0.30, 0.032, 1]; const l = Math.hypot(...v); return v.map((c) => c / l); })();
    const ceu = (e, rx) => {   // e: elevação (seno); cores lineares
      const t = Math.min(1, Math.max(0, e)); const k = Math.pow(t, 0.55);
      const r = 0.105 + (0.010 - 0.105) * k, gg = 0.165 + (0.028 - 0.165) * k, b = 0.235 + (0.072 - 0.235) * k;
      const dsol = Math.max(0, rx); const brilho = Math.pow(dsol, 2500) * 2.2 + Math.pow(dsol, 220) * 0.22 + Math.pow(dsol, 24) * 0.03;
      return [r + brilho * 1.0, gg + brilho * 0.86, b + brilho * 0.70];
    };
    const enc = (c) => { c = c / (1 + c * 0.25); c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return Math.max(0, Math.min(255, c * 255)); };
    let semente = 7; const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647) - 0.5;
    const lumGrade = new Array(64).fill(0), lumConta = new Array(64).fill(0);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dxp = (x + 0.5 - W / 2) / f, dyp = -(y + 0.5 - hz) / f;
        let r, gg, b;
        const lv = Math.hypot(dxp, dyp, 1); const vx = dxp / lv, vy = dyp / lv, vz = 1 / lv;
        if (vy >= -0.0015) {
          [r, gg, b] = ceu(vy, vx * sol[0] + vy * sol[1] + vz * sol[2]);
        } else {
          const t = camH / -vy; const px = vx * t, pz = vz * t;
          const pegada = t * t / (f * camH);
          let hx = 0, hzv = 0;
          for (const [ox, oz, k, a, ph] of ondas) {
            const lod = Math.max(0, Math.min(1, 1.6 - k * pegada * 3.2)); if (lod <= 0) continue;
            const c = Math.cos(k * (ox * px + oz * pz) + ph) * a * k * lod; hx += c * ox; hzv += c * oz;
          }
          let nx = -hx, ny = 1, nz = -hzv; const ln = Math.hypot(nx, ny, nz); nx /= ln; ny /= ln; nz /= ln;
          const dn = vx * nx + vy * ny + vz * nz;
          const rx = vx - 2 * dn * nx, ry = Math.abs(vy - 2 * dn * ny), rz = vz - 2 * dn * nz;
          const fres = 0.02 + 0.98 * Math.pow(1 - Math.min(1, Math.max(0, -dn)), 5);
          const [sr, sg, sb] = ceu(ry, rx * sol[0] + ry * sol[1] + rz * sol[2]);
          const esp = Math.pow(Math.max(0, rx * sol[0] + ry * sol[1] + rz * sol[2]), 900) * 6.0;
          const fundo = [0.004, 0.022, 0.040];
          r = fundo[0] * (1 - fres) + sr * fres + esp; gg = fundo[1] * (1 - fres) + sg * fres + esp * 0.9; b = fundo[2] * (1 - fres) + sb * fres + esp * 0.8;
          const nev = Math.exp(-t * 0.006); const [hr, hg, hb] = ceu(0, vx * sol[0] + vz * sol[2]);
          r = r * nev + hr * (1 - nev); gg = gg * nev + hg * (1 - nev); b = b * nev + hb * (1 - nev);
        }
        const i = (y * W + x) * 4; const ru = rnd() * 0.9;
        const R = enc(r) + ru, G = enc(gg) + ru, B = enc(b) + ru;
        d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = 255;
        const cel = Math.min(7, Math.floor(y / H * 8)) * 8 + Math.min(7, Math.floor(x / W * 8));
        const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        if ((x & 7) === 0 && (y & 7) === 0) { lumGrade[cel] += 0.2126 * lin(R) + 0.7152 * lin(G) + 0.0722 * lin(B); lumConta[cel]++; }
      }
    }
    g.putImageData(img, 0, 0);
    const grade = lumGrade.map((s, k) => (s / Math.max(1, lumConta[k])).toFixed(3));
    cv.dataset.lumGrade = grade.join(',');
    cv.dataset.lum = (grade.reduce((a, b) => a + +b, 0) / 64).toFixed(3);
  }

  // ---------- Contador (dado que chega anima o valor, não a caixa) ----------
  function curva(elm, nome) {
    const s = getComputedStyle(elm).getPropertyValue('--m-' + nome).trim();
    const pts = s.slice(s.indexOf('(') + 1, s.lastIndexOf(')')).split(',').map(Number);
    return (t) => { if (t >= 1) return 1; const x = t * (pts.length - 1), i = Math.floor(x); return pts[i] + (pts[i + 1] - pts[i]) * (x - i); };
  }
  function contar(span, palco) {
    const alvo = parseFloat(span.textContent.replace(',', '.')); const modo = span.dataset.conta;
    if (reduz || !Number.isFinite(alvo)) return;
    const nome = palco.dataset.mundo; const ms = parseFloat(getComputedStyle(palco).getPropertyValue('--m-' + nome + '-ms')) || 500;
    const c = curva(palco, nome); const t0 = performance.now() + (modo === 'passos' ? 260 : 60);
    const passo = (agora) => {
      const t = Math.max(0, Math.min(1, (agora - t0) / ms));
      const v = modo === 'passos' ? Math.floor(t * 18 + 1e-9) / 18 * alvo : alvo * c(t);
      span.textContent = fmt(t >= 1 ? alvo : v);
      if (t < 1) requestAnimationFrame(passo); else span.dataset.contou = '1';
    };
    span.textContent = fmt(0); requestAnimationFrame(passo);
  }

  // ---------- Montagem ----------
  function desenhar() {
    for (const svg of document.querySelectorAll('svg[data-grafico]')) GRAF[svg.dataset.grafico](svg);
  }
  function mutar() {
    const m = q.get('mutar');
    if (m === 'numero') document.querySelector('#editorial [data-c="numero"]').textContent = '1,9';
    if (m === 'contraste') document.querySelector('.ap-frase').style.color = '#a6a6ad';
    if (m === 'foco') { const s = document.createElement('style'); s.textContent = '.co button:focus-visible{outline:none!important}'; document.head.appendChild(s); }
    if (m === 'grafico') SERIE[N - 1] = 1.7;
    if (m === 'pixel') document.querySelector('.rt-titulo').style.fontSize = '48px';
    if (m === 'quebra') document.querySelector('.lx .b1').style.cssText = 'white-space: normal; width: 150px';
  }
  async function iniciar() {
    mutar();
    try { await document.fonts.ready; } catch { /* segue com a reserva */ }
    desenhar();
    if (q.get('mutar') === 'desenho') document.querySelector('[data-grafico="luxo"]').setAttribute('viewBox', '0 0 520 40');
    const cv = document.querySelector('[data-mar]'); if (cv) mar(cv);
    if (window.liquido) window.liquido.montar();
    for (const b of document.querySelectorAll('.palco .b1')) b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'));
    const io = new IntersectionObserver((itens) => {
      for (const it of itens) if (it.isIntersecting) {
        const p = it.target; if (p.classList.contains('entrou')) continue;
        p.classList.add('entrou'); io.unobserve(p);
        for (const sp of p.querySelectorAll('[data-conta]')) contar(sp, p);
      }
    }, { threshold: 0.3 });
    for (const p of document.querySelectorAll('.palco')) io.observe(p);
    document.documentElement.dataset.pronto = '1';
  }
  let redim; addEventListener('resize', () => { clearTimeout(redim); redim = setTimeout(desenhar, 150); });
  window.mostruario = { SERIE, ULT, fmt };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
