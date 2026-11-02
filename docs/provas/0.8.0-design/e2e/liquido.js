// Liquid Glass na web (aproximação): lente por mapa de deslocamento, brilho que segue a luz e tinta que se adapta.
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
  // Tinta adaptável: média da luminância (ponderada pela área) dos [data-lum] que passam atrás do controle.
  function tom() {
    for (const el of document.querySelectorAll('.lg[data-lg-adapta]')) {
      const r = el.getBoundingClientRect(); let soma = 0, area = 0, min = 1, max = 0;
      for (const f of document.querySelectorAll(el.dataset.lgAdapta)) {
        const q = f.getBoundingClientRect();
        // data-lum-grade: n × n valores (4 × 4 ou 8 × 8) da luminância da foto; usa só as células que estão atrás do controle.
        const grade = f.dataset.lumGrade ? f.dataset.lumGrade.split(',').map(Number) : null;
        const n = grade ? Math.round(Math.sqrt(grade.length)) : 1;
        const celulas = grade ? grade.map((L, k) => ({ L, x0: q.left + (k % n) * q.width / n, y0: q.top + Math.floor(k / n) * q.height / n, w: q.width / n, h: q.height / n }))
          : [{ L: +f.dataset.lum, x0: q.left, y0: q.top, w: q.width, h: q.height }];
        for (const c of celulas) {
          const a = Math.max(0, Math.min(r.right, c.x0 + c.w) - Math.max(r.left, c.x0)) * Math.max(0, Math.min(r.bottom, c.y0 + c.h) - Math.max(r.top, c.y0));
          if (a > 0) { soma += a * c.L; area += a; min = Math.min(min, c.L); max = Math.max(max, c.L); }
        }
      }
      const fundo = area / (r.width * r.height) < 0.25 ? null : soma / area;   // pouco conteúdo atrás: segue o tema
      if (fundo == null) el.removeAttribute('data-tom'); else el.dataset.tom = fundo < 0.30 ? 'escuro' : 'claro';
      el.dataset.lgFundo = fundo == null ? '' : fundo.toFixed(2);
      // Fundo misto (claro e escuro juntos atrás do mesmo controle): a tinta engrossa, como a variante regular que ajusta a luminosidade.
      el.toggleAttribute('data-lg-misto', fundo != null && max - min > 0.25);
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
  window.liquido = { montar, quadro };
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { px = e.clientX; py = e.clientY; quadro(); } }, { passive: true });
  addEventListener('scroll', quadro, { passive: true, capture: true });
  addEventListener('resize', montar);
  for (const m of [reduzTransp, contrasteMais, reduzMov]) m.addEventListener('change', montar);
  if (window.ResizeObserver) { const ro = new ResizeObserver(montar); addEventListener('DOMContentLoaded', () => document.querySelectorAll('.lg').forEach((e) => ro.observe(e))); }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', montar); else montar();
})();
