// Verificador e capturador do mostruário dos mundos (mt106). Edge sem interface, perfil próprio, uma aba, UMA captura por vez;
// nada na tela do usuário (windowsHide). Se o sistema matar o Edge (memória), espera e repete só o passo que caiu.
// Confere: fontes carregadas (por família de cada texto), coerência do conteúdo (13 campos iguais nos 10 mundos; o gráfico
// termina no número da tela), contraste pixel a pixel no pior ponto (normal, hover e ligado), texto cortado ou sobreposto,
// anel de foco (pixels que mudam com contraste ≥ 3:1, ao menos 2 px de perímetro), ordem do Tab, só transform/opacity
// animados, molas com ≥ 30 pontos, movimento reduzido (só esmaecer), rolagem lateral em 1440 e 390.
// Uso: node verificar.js [png|checar|tudo] [--so=<mundo>] [--mutar=numero|contraste|foco|grafico]  (mutação TEM de falhar)
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const AQUI = __dirname;
const PNG = path.join(AQUI, 'png');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const qual = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'tudo';
const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').slice(n.length + 3);
const SO = arg('so'); const MUTAR = arg('mutar');
const URL0 = 'file:///' + path.join(AQUI, 'index.html').replace(/\\/g, '/') + (MUTAR ? `?mutar=${MUTAR}` : '');
const MUNDOS = ['apple-liquid-glass', 'editorial', 'suico', 'quente-tatil', 'escuro-tecnico', 'ludico', 'luxo-sobrio', 'brutalista', 'corporativo-confianca', 'retro-analogico'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Edge + CDP mínimo (um processo por vez; reinicia se cair) ----------
let edge = null, ws = null, seq = 0, porta = 0, perfil = '';
const pend = new Map();
async function abrirEdge() {
  porta = 9300 + Math.floor(Math.random() * 500); perfil = path.join(os.tmpdir(), `mundos-edge-${process.pid}-${porta}`);
  edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', '--disable-gpu-rasterization',
    '--js-flags=--max-old-space-size=384', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let alvo;
  for (let i = 0; i < 80 && !alvo; i++) { await espera(250); try { const l = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json(); alvo = l.find((t) => t.type === 'page'); } catch { /* subindo */ } }
  if (!alvo) throw new Error('Edge não respondeu');
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((ok, falha) => { ws.onopen = ok; ws.onerror = falha; });
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(p.method + ': ' + d.error.message)) : p.res(d.result); } };
  ws.onclose = () => { for (const p of pend.values()) p.rej(new Error('conexão com o Edge caiu')); pend.clear(); };
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('DOM.enable'); await cdp('CSS.enable');
}
function fecharEdge() {
  try { ws && ws.close(); } catch { /* já fechou */ }
  try { edge && edge.kill(); } catch { /* já saiu */ }
  edge = null; ws = null;
  try { fs.rmSync(perfil, { recursive: true, force: true }); } catch { /* o Edge pode segurar o perfil por alguns segundos */ }
}
process.on('exit', fecharEdge);
function cdp(method, params = {}) {
  if (!ws || ws.readyState !== 1) return Promise.reject(new Error('conexão com o Edge caiu'));
  const id = ++seq; ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pend.set(id, { res, rej, method }));
}
async function avaliar(fn, ...args) {
  const r = await cdp('Runtime.evaluate', { expression: `(${fn})(...${JSON.stringify(args)})`, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('JS: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}
async function abrirPagina({ w = 1440, h = 1000, reduzido = false, url = URL0 } = {}) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: w < 700 });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduzido ? 'reduce' : 'no-preference' },
    { name: 'prefers-color-scheme', value: 'light' }] });
  await cdp('Page.navigate', { url });
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) { await espera(300); try { if (await avaliar(() => document.documentElement.dataset.pronto === '1')) break; } catch { /* navegando */ } }
  await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
  await espera(400);
}
// Leva o palco do mundo à tela e espera a entrada terminar (animações do palco acabadas e contadores parados).
async function mostrarMundo(id) {
  await avaliar((id) => { const s = document.getElementById(id); scrollTo(0, s.getBoundingClientRect().top + scrollY - 40); }, id);
  await espera(400);
  const t0 = Date.now();
  while (Date.now() - t0 < 9000) {
    const ok = await avaliar((id) => { const p = document.querySelector(`#${id} .palco`); if (!p.classList.contains('entrou')) return false;
      const rodando = p.getAnimations({ subtree: true }).some((a) => a.playState === 'running' || a.playState === 'pending');
      const contando = [...p.querySelectorAll('[data-conta]')].some((s) => !s.dataset.contou) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !rodando && !contando; }, id);
    if (ok) break; await espera(250);
  }
  await espera(300);
}
async function capturar(clip, arquivo) {
  const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: false });
  if (arquivo) fs.writeFileSync(arquivo, Buffer.from(shot.data, 'base64'));
  return shot.data;
}
// Repete o passo uma vez se o Edge cair (o sistema pode matar o processo por memória).
async function comRepeticao(nome, fn) {
  for (let t = 1; t <= 3; t++) {
    try { if (!ws) await abrirEdge(); return await fn(); }
    catch (e) { console.error(`  ${nome}: falhou na tentativa ${t} (${e.message})`); fecharEdge(); if (t === 3) throw e; await espera(8000); }
  }
}

// ---------- Na página ----------
// Textos do palco (HTML com nó de texto direto e <text> do SVG), com a caixa das letras.
function listarTextos(id) {
  const raiz = id ? document.querySelector(`#${id}`) : document.body;
  const rg = document.createRange(); const out = [];
  const caixaDe = (e) => { if (e instanceof SVGElement) return e.getBoundingClientRect();
    const rs = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).flatMap((n) => { rg.selectNodeContents(n); return [...rg.getClientRects()]; });
    if (!rs.length) return null;
    return { left: Math.min(...rs.map((q) => q.left)), top: Math.min(...rs.map((q) => q.top)), right: Math.max(...rs.map((q) => q.right)), bottom: Math.max(...rs.map((q) => q.bottom)) }; };
  const todos = [...raiz.querySelectorAll('*')].filter((e) => !e.closest('script,style,.pular,defs,symbol') &&
    (e.tagName.toLowerCase() === 'text' || (!(e instanceof SVGElement) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))));
  for (const e of todos) {
    const r = caixaDe(e); if (!r || r.right - r.left < 2) continue;
    const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none') continue;
    const cor = e instanceof SVGElement ? s.fill : s.color;
    e.dataset.mid = e.dataset.mid || Math.random().toString(36).slice(2, 9);
    const palco = e.closest('.palco');
    out.push({ id: e.dataset.mid, txt: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 32), cor, tam: parseFloat(s.fontSize), peso: +s.fontWeight,
      x: r.left + scrollX, y: r.top + scrollY, w: r.right - r.left, h: r.bottom - r.top, svg: e instanceof SVGElement, mundo: palco ? palco.dataset.mundo : 'moldura',
      familia: s.fontFamily });
  }
  return out;
}
// Pior contraste no fundo real das letras: fotografa a caixa com o texto (A) e sem ele (B); os pixels que mudam são o
// desenho das letras; o fundo que conta é o de B sob esse desenho, alargado 3 px (2×) para os lados.
async function piorContraste(it) {
  const prep = (id, esconder) => { const e = document.querySelector(`[data-mid="${id}"]`);
    for (const f of e.querySelectorAll('*')) f.style.setProperty('visibility', 'hidden', 'important');
    if (!(e instanceof SVGElement)) { e.style.setProperty('color', getComputedStyle(e).color, 'important');
      for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) if ([...p.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) { p.dataset.paiOculto = '1'; p.style.setProperty('color', 'transparent', 'important'); } }
    if (esconder) { e.style.setProperty(e instanceof SVGElement ? 'fill' : 'color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important');
      e.style.setProperty('text-decoration-color', 'transparent', 'important'); } };
  const clip = { x: it.x - 2, y: it.y - 2, width: it.w + 4, height: it.h + 4 };
  await avaliar(prep, it.id, false); await espera(50); const a64 = await capturar(clip);
  await avaliar(prep, it.id, true); await espera(50); const b64 = await capturar(clip);
  return avaliar(async (a64, b64, cor, id) => {
    const e = document.querySelector(`[data-mid="${id}"]`); for (const p of ['fill', 'color', 'text-shadow', 'text-decoration-color']) e.style.removeProperty(p);
    for (const f of e.querySelectorAll('*')) f.style.removeProperty('visibility');
    for (const p of document.querySelectorAll('[data-pai-oculto]')) { p.style.removeProperty('color'); delete p.dataset.paiOculto; }
    const ler = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(i, 0, 0); return { d: g.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }; };
    const A = await ler(a64), B = await ler(b64); const W = A.w, H = A.h;
    const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true }); cv.fillStyle = cor; cv.fillRect(0, 0, 1, 1); const t = cv.getImageData(0, 0, 1, 1).data;
    const lum = (r, gg, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
    const marca = new Uint8Array(W * H); let n = 0;
    for (let i = 0; i < W * H; i++) { const k = i * 4; if (Math.abs(A.d[k] - B.d[k]) + Math.abs(A.d[k + 1] - B.d[k + 1]) + Math.abs(A.d[k + 2] - B.d[k + 2]) > 40) { marca[i] = 1; n++; } }
    if (!n) return 0;   // nada desenhado: texto invisível
    const R = 3; const lt = lum(t[0], t[1], t[2]); let pior = 99;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let perto = false; for (let dy = -R; dy <= R && !perto; dy++) for (let dx = -R; dx <= R; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < H && xx >= 0 && xx < W && marca[yy * W + xx]) { perto = true; break; } }
      if (!perto) continue; const k = (y * W + x) * 4; const lb = lum(B.d[k], B.d[k + 1], B.d[k + 2]); const [a, z] = lt > lb ? [lt, lb] : [lb, lt]; pior = Math.min(pior, (a + 0.05) / (z + 0.05));
    }
    return +pior.toFixed(2);
  }, a64, b64, it.cor, it.id);
}
const minimo = (it) => (it.tam >= 24 || (it.tam >= 18.66 && it.peso >= 700) ? 3 : 4.5);

async function checarContraste(id, rotulo, erros, linhas) {
  const itens = await avaliar(listarTextos, id);
  let pior = { r: 99 };
  for (const it of itens) {
    const r = await piorContraste(it); const min = minimo(it);
    if (r < pior.r) pior = { r, txt: it.txt, min };
    if (r < min) erros.push(`[${id}${rotulo}] contraste ${r}:1 < ${min} em "${it.txt}"`);
  }
  linhas.push(`  contraste${rotulo}: ${itens.length} textos, pior ${pior.r}:1 em "${pior.txt}" (mínimo ${pior.min})`);
  return itens;
}

(async () => {
  if (!EDGE) throw new Error('Edge não encontrado');
  fs.mkdirSync(PNG, { recursive: true });
  setTimeout(() => { console.error('tempo esgotado (20 min): Edge encerrado'); fecharEdge(); process.exit(3); }, 1200000).unref();
  const erros = []; const linhas = [];
  const lista = SO ? MUNDOS.filter((m) => m.includes(SO)) : MUNDOS;

  if (qual === 'png' || qual === 'tudo') {
    // UMA captura por vez: a página é aberta, o mundo entra na tela, a entrada termina, o bloco é fotografado a 2×.
    for (const id of lista) {
      await comRepeticao(`png ${id}`, async () => {
        await abrirPagina();
        await mostrarMundo(id);
        const r = await avaliar((id) => { const q = document.getElementById(id).getBoundingClientRect(); return { x: q.left + scrollX, y: q.top + scrollY, width: q.width, height: q.height }; }, id);
        await capturar({ x: r.x - 16, y: r.y - 16, width: r.width + 32, height: r.height + 32 }, path.join(PNG, `${id}.png`));
        linhas.push(`png/${id}.png  ${Math.round((r.width + 32) * 2)} × ${Math.round((r.height + 32) * 2)} px (2×)`);
      });
      fecharEdge(); await espera(1500);
    }
  }
  if (qual === 'png' || qual === 'tudo' || qual === 'visao') {
    if (!SO) await comRepeticao('visão geral', async () => {
      await abrirPagina({ url: 'file:///' + path.join(AQUI, 'visao-geral.html').replace(/\\/g, '/'), h: 900 });
      const r = await avaliar(() => new Promise((ok) => { const imgs = [...document.images]; Promise.all(imgs.map((i) => i.decode().catch(() => null))).then(() => {
        const q = document.querySelector('.folha').getBoundingClientRect(); ok({ x: q.left, y: q.top + scrollY, width: q.width, height: q.height, n: imgs.filter((i) => i.naturalWidth > 0).length }); }); }));
      await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: Math.ceil(r.y + r.height), deviceScaleFactor: 2, mobile: false }); await espera(600);   // a folha inteira na janela (sem isso, só os primeiros 900 px são pintados)
      if (r.n !== 10) erros.push(`visão geral: ${r.n} de 10 imagens carregadas`);
      await capturar({ x: r.x, y: r.y, width: r.width, height: r.height }, path.join(PNG, 'visao-geral.png'));
      linhas.push(`png/visao-geral.png  ${Math.round(r.width * 2)} × ${Math.round(r.height * 2)} px (2×)`);
    });
    fecharEdge(); await espera(1500);
  }

  if (qual === 'fonte-pixel') {
    // VT323 é fonte de pixel: só fica nítida quando o pixel do desenho cai em pixels inteiros da tela. Mede a fração de pixels
    // meio-tom (nem fundo nem tinta) do mesmo texto em cada tamanho, a 2×; os tamanhos usados têm de estar entre os mais nítidos.
    await comRepeticao('fonte-pixel', async () => {
      await abrirPagina();
      const t = await avaliar(() => { const c = document.createElement('canvas'); c.width = 1600; c.height = 400; const g = c.getContext('2d', { willReadFrequently: true }); const out = [];
        for (let px = 12; px <= 140; px++) { g.clearRect(0, 0, 1600, 400); g.font = `${px * 2}px VT323`; g.fillStyle = '#000'; g.textBaseline = 'alphabetic'; g.fillText('Estação 1,8 m 14h', 4, 300);
          const d = g.getImageData(0, 0, 1600, 400).data; let tinta = 0, meio = 0; for (let i = 3; i < d.length; i += 4) { if (d[i] > 0) tinta++; if (d[i] > 20 && d[i] < 235) meio++; }
          out.push([px, +(meio / tinta).toFixed(3)]); } return out; });
      const usados = await avaliar(() => [...new Set([...document.querySelectorAll('.rt-visor, .rt-visor *')].filter((e) => getComputedStyle(e).fontFamily.includes('VT323') && e.textContent.trim()).map((e) => parseFloat(getComputedStyle(e).fontSize)))]);
      // A fração cai sozinha com o tamanho (mais área por borda): o que vale é a comparação com os vizinhos (±4 px).
      const rel = (p) => { const f = t.find(([q]) => q === p)[1]; const viz = t.filter(([q]) => Math.abs(q - p) <= 4 && q !== p).map(([, v]) => v).sort((x, y) => x - y); return f / viz[Math.floor(viz.length / 2)]; };
      const nitidos = t.filter(([p]) => p >= 16 && p <= 136 && rel(p) <= 0.85).map(([p]) => p);
      linhas.push('VT323, tamanhos nítidos (meio-tom ≤ 85% da mediana dos vizinhos): ' + nitidos.join(', '));
      for (const u of usados.filter((u) => u !== 15)) { const r = rel(u); linhas.push(`usado ${u}px: ${(r * 100).toFixed(0)}% do meio-tom dos vizinhos`);
        if (r > 0.85) erros.push(`VT323 em ${u}px borra (${(r * 100).toFixed(0)}% do meio-tom dos vizinhos; nítidos: ${nitidos.join(', ')})`); }
    });
    fecharEdge();
  }

  if (qual === 'checar' || qual === 'tudo') {
    await comRepeticao('checar', async () => {
      await abrirPagina();
      // Molas: ≥ 30 pontos em cada linear() do mundo.
      const molas = await avaliar(() => { const s = getComputedStyle(document.documentElement); return ['apple', 'editorial', 'suico', 'quente', 'escuro', 'ludico', 'ludico-calmo', 'luxo', 'corporativo', 'retro']
        .map((n) => { const v = s.getPropertyValue('--m-' + n).trim(); return { n, pontos: v.startsWith('linear(') ? v.split(',').length : 0 }; }); });
      for (const m of molas) if (m.pontos < 30) erros.push(`mola ${m.n}: ${m.pontos} pontos (< 30)`);
      linhas.push(`molas: ${molas.map((m) => `${m.n} ${m.pontos}`).join(', ')}`);
      // Só transform e opacity nas transições declaradas.
      const trans = await avaliar(() => { const ruins = []; for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch { continue; }
        const andar = (lista) => { for (const r of lista) { if (r.cssRules) andar(r.cssRules); const t = r.style && r.style.transitionProperty; if (t && !/^(transform|opacity)(,\s*(transform|opacity))*$/.test(t) && t !== 'all' && t !== 'none') ruins.push(r.selectorText + ' → ' + t);
          if (r.style && r.style.transitionProperty === 'all' && r.style.transition) ruins.push(r.selectorText + ' → all'); } }; andar(rs); } return ruins; });
      for (const t of trans) (t.startsWith('.lg ') ? linhas : erros).push((t.startsWith('.lg ') ? 'AVISO (modelo liquid-glass): ' : '') + `transição fora de transform/opacity: ${t}`);
      // Coerência do conteúdo: os 13 campos iguais nos 10 mundos; o gráfico termina no número da tela.
      const coer = await avaliar(() => { const campos = ['titulo', 'frase', 'numero', 'unidade', 'rotulo', 'k1', 'v1', 'k2', 'v2', 'k3', 'v3', 'b1', 'b2', 'legenda'];
        const palcos = [...document.querySelectorAll('.palco')]; const ref = {}; const ruins = [];
        for (const c of campos) ref[c] = palcos[0].querySelector(`[data-c="${c}"]`)?.textContent.trim();
        const esperado = { titulo: 'Estação Maré', numero: '1,8', unidade: 'm', b1: 'Receber alertas', b2: 'Ver as 12 boias' };
        for (const [c, v] of Object.entries(esperado)) if (ref[c] !== v) ruins.push(`apple: ${c} = "${ref[c]}" (esperado "${v}")`);
        for (const p of palcos) { const m = p.dataset.mundo;
          for (const c of campos) { const els = p.querySelectorAll(`[data-c="${c}"]`); if (els.length !== 1) { ruins.push(`${m}: campo ${c} aparece ${els.length} vezes`); continue; }
            const t = els[0].textContent.trim(); if (t !== ref[c]) ruins.push(`${m}: ${c} = "${t}" ≠ "${ref[c]}"`); }
          const num = parseFloat(p.querySelector('[data-c="numero"]').textContent.replace(',', '.')); const svg = p.querySelector('svg[data-grafico]');
          if (!svg || +svg.dataset.ultimo !== num) ruins.push(`${m}: o gráfico termina em ${svg && svg.dataset.ultimo}, a tela diz ${num}`);
          if (svg) { const vb = svg.viewBox.baseVal; const cs = getComputedStyle(svg); if (Math.abs(vb.width - parseFloat(cs.width)) > 1 || Math.abs(vb.height - parseFloat(cs.height)) > 1) ruins.push(`${m}: gráfico desenhado em ${vb.width}×${vb.height}, mas ocupa ${parseFloat(cs.width)}×${parseFloat(cs.height)}`); }
          for (const n of p.querySelectorAll('[data-nota]')) if (n.textContent.trim() !== p.querySelector('[data-c="numero"]').textContent.trim() + ' m') ruins.push(`${m}: anotação "${n.textContent}" ≠ número`); }
        return { ruins, n: palcos.length }; });
      for (const r of coer.ruins) erros.push('coerência: ' + r);
      linhas.push(`coerência: ${coer.n} palcos × 14 campos; ${coer.ruins.length} divergência(s)`);
      // Vidro do mundo Apple: lente ativa (Chromium) e tom calculado do mar renderizado.
      const vidro = await avaliar(() => { const v = document.querySelector('.ap-vidro'); const bf = getComputedStyle(v).backdropFilter; return { bf, tom: v.dataset.tom || '', fundo: v.dataset.lgFundo || '' }; });
      if (!/url\(/.test(vidro.bf)) erros.push(`vidro Apple sem lente: backdrop-filter = ${vidro.bf}`);
      linhas.push(`vidro Apple: backdrop-filter ${vidro.bf.slice(0, 18)}…, tom ${vidro.tom}, luminância de trás ${vidro.fundo}`);

      for (const id of lista) {
        linhas.push(`[${id}]`);
        await mostrarMundo(id);
        // Fontes: a 1ª família de cada texto (sem as do sistema) tem de estar carregada.
        const fontes = await avaliar((id) => { const sis = /^(-apple-system|BlinkMacSystemFont|system-ui|ui-monospace|sans-serif|serif|monospace|Georgia|"Segoe UI"|Segoe UI)$/;
          const fams = new Set(); for (const e of document.querySelectorAll(`#${id} .palco *`)) { if (!e.textContent.trim()) continue;
            const f = getComputedStyle(e).fontFamily.split(',').map((x) => x.trim().replace(/"/g, '')).find((x) => !sis.test(x) && !sis.test(`"${x}"`)); if (f) fams.add(f); }
          const carregadas = new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
          return [...fams].map((f) => ({ f, ok: carregadas.has(f) })); }, id);
        for (const f of fontes) if (!f.ok) erros.push(`[${id}] fonte não carregada: ${f.f}`);
        linhas.push(`  fontes: ${fontes.map((f) => f.f + (f.ok ? '' : ' (NÃO carregada)')).join(', ')}`);
        // Texto cortado (fora do palco ou da caixa com overflow) e texto sobre texto.
        const geo = await avaliar((id) => { const p = document.querySelector(`#${id} .palco`); const pr = p.getBoundingClientRect(); const ruins = []; const caixas = [];
          const rg = document.createRange();
          for (const e of p.querySelectorAll('*')) { const svg = e instanceof SVGElement; if (svg && e.tagName !== 'text') continue;
            const nos = svg ? [] : [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()); if (!svg && !nos.length) continue;
            // Caixa da tinta (não a da linha): da linha de base menos a subida real das letras até a base mais a descida.
            const r = svg ? e.getBoundingClientRect() : (() => { const rs = nos.flatMap((n) => { rg.selectNodeContents(n); return [...rg.getClientRects()]; });
              const cx = { left: Math.min(...rs.map((q) => q.left)), right: Math.max(...rs.map((q) => q.right)), top: Math.min(...rs.map((q) => q.top)), bottom: Math.max(...rs.map((q) => q.bottom)) };
              const st = getComputedStyle(e); if (/flex|grid/.test(st.display)) return cx;
              const ctx = document.createElement('canvas').getContext('2d'); ctx.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
              const m = ctx.measureText(nos.map((n) => n.textContent).join(''));
              const marco = () => { const s = document.createElement('span'); s.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; return s; };
              const m1 = marco(), m2 = marco(); nos[0].before(m1); nos[nos.length - 1].after(m2);
              const b1 = m1.getBoundingClientRect().bottom, b2 = m2.getBoundingClientRect().bottom; m1.remove(); m2.remove();
              return { left: cx.left, right: cx.right, top: b1 - m.actualBoundingBoxAscent, bottom: b2 + m.actualBoundingBoxDescent }; })();
            const t = e.textContent.trim().slice(0, 24);
            if (r.left < pr.left - 0.5 || r.right > pr.right + 0.5 || r.top < pr.top - 0.5 || r.bottom > pr.bottom + 0.5) ruins.push(`cortado pelo palco: "${t}"`);
            for (let a = e.parentElement; a && a !== p; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflow !== 'visible' && s.overflowX !== 'visible') { const ar = a.getBoundingClientRect();
              if (r.left < ar.left - 0.5 || r.right > ar.right + 0.5 || r.top < ar.top - 0.5 || r.bottom > ar.bottom + 0.5) ruins.push(`cortado por ${a.className.baseVal ?? a.className}: "${t}"`); break; } }
            caixas.push({ r, t, e }); }
          for (let i = 0; i < caixas.length; i++) for (let j = i + 1; j < caixas.length; j++) { const a = caixas[i].r, b = caixas[j].r;
            if (caixas[i].e.contains(caixas[j].e) || caixas[j].e.contains(caixas[i].e)) continue;
            const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (ix > 1 && iy > 1) ruins.push(`texto sobre texto: "${caixas[i].t}" × "${caixas[j].t}" (${ix.toFixed(0)}×${iy.toFixed(0)} px)`); }
          for (const b of p.querySelectorAll('button [data-c], h3 [data-c="titulo"]')) { rg.selectNodeContents(b); const tops = new Set([...rg.getClientRects()].map((q) => Math.round(q.top)));
            if (b.closest('button') && tops.size > 1) ruins.push('botão quebra em ' + tops.size + ' linhas: "' + b.textContent + '"'); }
          return { ruins, n: caixas.length }; }, id);
        for (const r of geo.ruins) erros.push(`[${id}] ${r}`);
        linhas.push(`  geometria: ${geo.n} textos, ${geo.ruins.length} cortado(s)/sobreposto(s)`);
        // Contraste: normal; com hover forçado nos 2 botões; com o principal ligado.
        await checarContraste(id, '', erros, linhas);
        const doc = await cdp('DOM.getDocument', { depth: -1 });
        const nos = await cdp('DOM.querySelectorAll', { nodeId: doc.root.nodeId, selector: `#${id} .palco button` });
        await avaliar(() => { const s = document.createElement('style'); s.id = 'sem-transicao'; s.textContent = '.palco *, .palco *::before, .palco *::after { transition-duration: 0s !important; transition-delay: 0s !important; }'; document.head.appendChild(s); });
        for (const n of nos.nodeIds) await cdp('CSS.forcePseudoState', { nodeId: n, forcedPseudoClasses: ['hover'] });
        await espera(150);
        const botoes = (await avaliar(listarTextos, id)).filter((it) => /Receber alertas|Ver as 12 boias|↵/.test(it.txt));
        let piorH = 99; for (const it of botoes) { const r = await piorContraste(it); piorH = Math.min(piorH, r); if (r < minimo(it)) erros.push(`[${id}:hover] contraste ${r}:1 em "${it.txt}"`); }
        for (const n of nos.nodeIds) await cdp('CSS.forcePseudoState', { nodeId: n, forcedPseudoClasses: [] });
        await avaliar((id) => document.querySelector(`#${id} .palco .b1`).click(), id); await espera(150);
        const lig = (await avaliar(listarTextos, id)).filter((it) => /Receber alertas/.test(it.txt));
        let piorL = 99; for (const it of lig) { const r = await piorContraste(it); piorL = Math.min(piorL, r); if (r < minimo(it)) erros.push(`[${id}:ligado] contraste ${r}:1 em "${it.txt}"`); }
        await avaliar((id) => { document.querySelector(`#${id} .palco .b1`).click(); document.getElementById('sem-transicao').remove(); }, id); await espera(150);
        linhas.push(`  contraste dos botões: hover pior ${piorH}:1; ligado pior ${piorL}:1`);
        // Foco: pixels que mudam entre focado e não focado, com contraste ≥ 3:1, somando ao menos 2 px de perímetro.
        await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 });
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 });
        const nBot = await avaliar((id) => document.querySelectorAll(`#${id} .palco button`).length, id);
        for (let k = 0; k < nBot; k++) {
          const r = await avaliar((id, k) => { const b = document.querySelectorAll(`#${id} .palco button`)[k]; b.blur(); const q = b.getBoundingClientRect();
            return { x: q.left + scrollX - 12, y: q.top + scrollY - 12, width: q.width + 24, height: q.height + 24, per: 2 * (q.width + q.height), nome: b.textContent.trim().slice(0, 20) }; }, id, k);
          await espera(80); const sem = await capturar(r);
          const vis = await avaliar((id, k) => { const b = document.querySelectorAll(`#${id} .palco button`)[k]; b.focus(); return b.matches(':focus-visible'); }, id, k);
          await espera(120); const com = await capturar(r);
          const anel = await avaliar(async (a, b) => { const ler = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
            const A = await ler(a), B = await ler(b); const lum = (r, g, bb) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); };
            let n = 0; for (let i = 0; i < A.length; i += 4) { const x = lum(A[i], A[i + 1], A[i + 2]), y = lum(B[i], B[i + 1], B[i + 2]); const [h, l] = x > y ? [x, y] : [y, x]; if ((h + 0.05) / (l + 0.05) >= 3) n++; }
            return n / 4; }, sem, com);   // pixels a 2× → px CSS²
          await avaliar((id, k) => document.querySelectorAll(`#${id} .palco button`)[k].blur(), id, k);
          const precisa = r.per * 2;
          if (!vis) erros.push(`[${id}] foco de "${r.nome}" não é :focus-visible`);
          if (anel < precisa) erros.push(`[${id}] anel de foco fraco em "${r.nome}": ${anel.toFixed(0)} px² com ≥ 3:1 (precisa ${precisa})`);
          linhas.push(`  foco "${r.nome}": ${anel.toFixed(0)} px² com ≥ 3:1 (mínimo ${precisa})`);
        }
        // Animações da entrada: só transform e opacity.
        const props = await avaliar((id) => { const s = new Set(); for (const a of document.querySelector(`#${id} .palco`).getAnimations({ subtree: true }))
          for (const k of a.effect.getKeyframes()) for (const p of Object.keys(k)) if (!['offset', 'easing', 'composite', 'computedOffset'].includes(p)) s.add(p); return [...s]; }, id);
        for (const p of props) if (!['opacity', 'transform'].includes(p)) erros.push(`[${id}] animação de ${p}`);
        linhas.push(`  animações: ${props.join(', ') || '(nenhuma ativa)'}`);
      }
      // Moldura (topo, índice, legendas e rodapé).
      linhas.push('[moldura]');
      await avaliar(() => scrollTo(0, 0)); await espera(300);
      const mold = (await avaliar(listarTextos, null)).filter((it) => it.mundo === 'moldura');
      let piorM = { r: 99 };
      for (const it of mold) { await avaliar((y) => scrollTo(0, Math.max(0, y - 300)), it.y); await espera(40); const r = await piorContraste(it); if (r < piorM.r) piorM = { r, txt: it.txt };
        if (r < minimo(it)) erros.push(`[moldura] contraste ${r}:1 em "${it.txt}"`); }
      linhas.push(`  contraste: ${mold.length} textos, pior ${piorM.r}:1 em "${piorM.txt}"`);
      // Ordem do Tab: pular → 10 mundos no índice → 2 botões por mundo, na ordem da página.
      await abrirPagina();
      const esperado = await avaliar(() => [...document.querySelectorAll('a[href], button')].map((e) => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 24)));
      const visto = [];
      for (let i = 0; i < esperado.length; i++) {
        await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await espera(60);
        for (let k = 0; k < 12 && !(await avaliar(() => { const r = document.activeElement.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })); k++) await espera(100);
        visto.push(await avaliar(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { t: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 24), vis: a.matches(':focus-visible'), dentro: r.top >= 0 && r.bottom <= innerHeight }; }));
      }
      const fora = visto.filter((v, i) => v.t !== esperado[i]); const semAnel = visto.filter((v) => !v.vis); const escondido = visto.filter((v) => !v.dentro);
      if (fora.length) erros.push(`ordem do Tab difere em ${fora.length} passo(s): ${fora.slice(0, 3).map((v) => v.t).join(' | ')}`);
      if (semAnel.length) erros.push(`Tab sem :focus-visible em ${semAnel.length}: ${semAnel.slice(0, 3).map((v) => v.t).join(' | ')}`);
      if (escondido.length) erros.push(`foco fora da tela em ${escondido.length}: ${escondido.slice(0, 3).map((v) => v.t).join(' | ')}`);
      linhas.push(`teclado: ${visto.length} paradas do Tab na ordem da página (${fora.length} fora de ordem, ${semAnel.length} sem anel, ${escondido.length} fora da tela)`);
      // Rolagem lateral: 1440 e 390 (no celular o palco rola dentro da própria caixa, a página não).
      for (const w of [1440, 390]) { await abrirPagina({ w, h: 900 }); const lat = await avaliar(() => document.documentElement.scrollWidth - innerWidth);
        if (lat > 0) erros.push(`rolagem lateral de ${lat} px em ${w}`); linhas.push(`largura ${w}: rolagem lateral ${lat} px`); }
      // Movimento reduzido: as entradas só esmaecem; nada termina transparente.
      await abrirPagina({ reduzido: true });
      const red = { mov: [], vazio: [] };
      for (const id of lista) { await mostrarMundo(id);
        const r = await avaliar((id) => { const p = document.querySelector(`#${id} .palco`); const mov = new Set();
          for (const a of p.getAnimations({ subtree: true })) for (const k of a.effect.getKeyframes()) if (k.transform && k.transform !== 'none') mov.add(a.animationName || 'anim');
          const vazio = [...p.querySelectorAll('[data-e]')].filter((e) => +getComputedStyle(e).opacity < 0.99).length; return { mov: [...mov], vazio }; }, id);
        if (r.mov.length) erros.push(`[${id}] com movimento reduzido ainda move: ${r.mov.join(', ')}`);
        if (r.vazio) erros.push(`[${id}] com movimento reduzido, ${r.vazio} peça(s) não apareceram`);
        red.mov.push(...r.mov); }
      linhas.push(`movimento reduzido: ${lista.length} mundos, ${red.mov.length} animação(ões) com deslocamento`);
    });
    fecharEdge();
  }

  console.log(linhas.join('\n'));
  if (erros.length) { console.log(`\n${erros.length} ERRO(S):\n- ` + erros.join('\n- ')); process.exitCode = 1; }
  else console.log('\n0 erro');
})().catch((e) => { console.error(e); fecharEdge(); process.exit(2); });
