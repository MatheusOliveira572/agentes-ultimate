// Modelo do agentes-ultimate (texto próprio; provado em docs/provas/0.8.0-design/e2e/, pv94). Liquid Glass na web (aproximação): lente por mapa de deslocamento, brilho que segue a luz e tinta que se adapta.
// Uso: <link rel="stylesheet" href="liquido.css"> + este arquivo; marque cada controle flutuante com class="lg".
// data-lg-adapta="seletor" no .lg faz a tinta virar clara/escura pela luminância dos elementos [data-lum] atrás dele.
// Valores [ESTIMATIVA nossa, a Apple não publica CSS]: aro de lente = 40% do raio (até 22 px), deslocamento 26 px,
// desfoque 3,2 px depois da lente (o Liquid Glass desfoca pouco: o que se vê atrás continua reconhecível).
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ua = navigator.userAgent;
  const chromium = /Chrome\/|Edg\//.test(ua) && !/Firefox\//.test(ua);
  const reduzMov = matchMedia('(prefers-reduced-motion: reduce)');
  const reduzTransp = matchMedia('(prefers-reduced-transparency: reduce)');
  const contrasteMais = matchMedia('(prefers-contrast: more)');
  const raiz = document.documentElement;
  let defs = null, n = 0;
  function garantirDefs() {
    if (defs) return defs;
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true');
    s.style.position = 'absolute';
    defs = document.createElementNS(NS, 'defs'); s.appendChild(defs); document.body.appendChild(s);
    return defs;
  }
  // Mapa de deslocamento: R = x, G = y, 128 = parado. Dentro do aro, puxa o fundo para dentro (efeito de lente na borda).
  function mapa(w, h, r, aro) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); const img = g.createImageData(w, h); const d = img.data;
    const hw = w / 2, hh = h / 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw, py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r);
      const fora = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)), dentro = Math.min(Math.max(qx, qy), 0);
      const dist = -(fora + dentro - r);                     // distância até a borda, positiva dentro
      let nx = 0, ny = 0, m = 0;
      if (dist >= 0 && dist < aro) {
        const t = 1 - dist / aro; m = t * t * (3 - 2 * t);   // suave, mais forte junto da borda
        if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = Math.sign(px) * qx / l; ny = Math.sign(py) * qy / l; }
        else if (qx > qy) nx = Math.sign(px); else ny = Math.sign(py);
      }
      const i = (y * w + x) * 4;
      d[i] = Math.round(128 + nx * m * 127); d[i + 1] = Math.round(128 + ny * m * 127); d[i + 2] = 128; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); return c.toDataURL();
  }
  function lente(el) {
    const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
    if (w < 8 || h < 8) return;
    if (el._lg && el._lg.w === w && el._lg.h === h) return;
    const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, h / 2, w / 2);
    const aro = Math.min(22, Math.max(8, r * 0.4 + 6));
    const id = el._lg ? el._lg.id : 'lg-' + (++n);
    let f = document.getElementById(id);
    if (!f) { f = document.createElementNS(NS, 'filter'); f.id = id; garantirDefs().appendChild(f); }
    const escala = +(el.dataset.lgForca || 26);
    f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', w); f.setAttribute('height', h);
    f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    f.innerHTML = `<feImage href="${mapa(w, h, r, aro)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>
      <feDisplacementMap in="SourceGraphic" in2="m" scale="${escala}" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="${el.dataset.lgDesfoque || 3.2}" result="b"/>
      <feColorMatrix in="b" type="saturate" values="1.7"/>`;
    el._lg = { id, w, h };
    el.style.setProperty('-webkit-backdrop-filter', `url(#${id})`); el.style.setProperty('backdrop-filter', `url(#${id})`);
  }
  // Luz: o aro e o brilho interno apontam para o ponteiro; sem ponteiro, luz de cima à esquerda que gira devagar com a rolagem.
  let px = null, py = null;
  function luz() {
    const rol = (document.scrollingElement.scrollTop + (document.querySelector('[data-rolagem]')?.scrollTop || 0)) * 0.06;
    for (const el of document.querySelectorAll('.lg')) {
      const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let ang = 135 + rol, lx = 25, ly = 0;
      if (px != null && !reduzMov.matches) {
        ang = Math.atan2(py - cy, px - cx) * 180 / Math.PI + 90;
        lx = Math.max(-20, Math.min(120, (px - r.left) / r.width * 100)); ly = Math.max(-40, Math.min(140, (py - r.top) / r.height * 100));
      }
      el.style.setProperty('--luz', ang.toFixed(1) + 'deg'); el.style.setProperty('--lx', lx.toFixed(0) + '%'); el.style.setProperty('--ly', ly.toFixed(0) + '%');
    }
  }
  // Tinta adaptável: luminância do que passa atrás do controle, por amostra numa grade de 8 × 8 pontos. Em cada ponto conta só o
  // [data-lum] mais interno que o cobre: elementos aninhados (seção com foto dentro) não somam duas vezes a mesma área.
  // fontes: [{ q: {left, top, width, height}, L, grade, nivel }], nivel = quantos ancestrais também batem com o seletor.
  function tomDe(r, fontes) {
    const N = 8; const vals = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = r.left + (j + 0.5) * r.width / N, y = r.top + (i + 0.5) * r.height / N;
      let melhor = null;
      for (const f of fontes) {
        const q = f.q;
        if (x < q.left || x >= q.left + q.width || y < q.top || y >= q.top + q.height) continue;
        if (!melhor || f.nivel > melhor.nivel) melhor = f;
      }
      if (!melhor) continue;
      let L = melhor.L;
      if (melhor.grade) {
        const n = Math.round(Math.sqrt(melhor.grade.length)); const q = melhor.q;
        const cx = Math.min(n - 1, Math.floor((x - q.left) / q.width * n)), cy = Math.min(n - 1, Math.floor((y - q.top) / q.height * n));
        L = melhor.grade[cy * n + cx];
      }
      if (Number.isFinite(L)) vals.push(L);
    }
    if (vals.length / (N * N) < 0.25) return { fundo: null, misto: false };   // pouco conteúdo atrás: segue o tema
    const fundo = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { fundo, misto: Math.max(...vals) - Math.min(...vals) > 0.25 };
  }
  function tom() {
    for (const el of document.querySelectorAll('.lg[data-lg-adapta]')) {
      const sel = el.dataset.lgAdapta;
      const fontes = [...document.querySelectorAll(sel)].map((f) => {
        let nivel = 0; for (let p = f.parentElement; p; p = p.parentElement) if (p.matches(sel)) nivel++;
        return { q: f.getBoundingClientRect(), L: +f.dataset.lum, grade: f.dataset.lumGrade ? f.dataset.lumGrade.split(',').map(Number) : null, nivel };
      });
      const { fundo, misto } = tomDe(el.getBoundingClientRect(), fontes);
      if (fundo == null) el.removeAttribute('data-tom'); else el.dataset.tom = fundo < 0.30 ? 'escuro' : 'claro';
      el.dataset.lgFundo = fundo == null ? '' : fundo.toFixed(2);
      // Fundo misto (claro e escuro juntos atrás do mesmo controle): a tinta engrossa, como a variante regular que ajusta a luminosidade.
      el.toggleAttribute('data-lg-misto', fundo != null && misto);
    }
  }
  let pedido = false;
  function quadro() { if (pedido) return; pedido = true; requestAnimationFrame(() => { pedido = false; luz(); tom(); }); }
  function montar() {
    const comLente = chromium && !reduzTransp.matches && !contrasteMais.matches;
    raiz.classList.toggle('lg-lente', comLente);
    for (const el of document.querySelectorAll('.lg')) {
      if (comLente) lente(el); else { el.style.removeProperty('backdrop-filter'); el.style.removeProperty('-webkit-backdrop-filter'); el._lg = null; }
    }
    quadro();
  }
  window.liquido = { montar, quadro, tomDe };
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { px = e.clientX; py = e.clientY; quadro(); } }, { passive: true });
  addEventListener('scroll', quadro, { passive: true, capture: true });
  addEventListener('resize', montar);
  for (const m of [reduzTransp, contrasteMais, reduzMov]) m.addEventListener('change', montar);
  if (window.ResizeObserver) { const ro = new ResizeObserver(montar); addEventListener('DOMContentLoaded', () => document.querySelectorAll('.lg').forEach((e) => ro.observe(e))); }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', montar); else montar();
})();
