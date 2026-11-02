// Verificador e capturador da vitrine Clara 35 (prova de design, agentes-ultimate).
// Edge sem interface, perfil próprio, uma aba, uma captura por vez; nada na tela do usuário (windowsHide).
// Confere: erros de JS, rolagem lateral (320 a 1920), contraste (fundo sólido composto; sobre foto, lente e vidro, pixel a
// pixel no pior ponto), alvos, coerência do texto com o desenho (7 vidros, 5 grupos, 11 lâminas, desfoque redondo até f/4),
// teclado (Tab e Shift+Tab, foco fora da barra, anel visível), reserva e desfazer, movimento e transparência reduzidos,
// página sem JS, LCP, CLS e quadros com a CPU 4× mais lenta. Sai com código 1 se houver erro.
// Uso: node verificar.js [png|checar|tudo] [--mutar]   (--mutar abre ?mutar=vidro e TEM de falhar)
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const AQUI = __dirname;
const PNG = path.join(AQUI, 'png');
// Saídas sem a pasta do usuário: o caminho da prova vira <pasta> (as saídas vão para o repositório público).
const semPasta = (s) => String(s).split('file:///' + AQUI.replace(/\\/g, '/')).join('file:///<pasta>').split(AQUI).join('<pasta>')
  .replace(/[A-Za-z]:[\\/]Users[\\/][^\\/\s]+/g, '<pasta>');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORTA = 9400 + (process.pid % 400);   // porta e perfil por execução: a anterior pode ainda estar fechando
const PERFIL = path.join(os.tmpdir(), 'vitrine-edge-' + process.pid);
const qual = process.argv[2] || 'tudo';
const MUTAR = process.argv.includes('--mutar');
const SO = (process.argv.find((a) => a.startsWith('--so=')) || '').slice(5);
const URL0 = 'file:///' + path.join(AQUI, 'index.html').replace(/\\/g, '/');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// rolar: expressão avaliada na página que devolve o scrollY desejado
const R = {
  girando: 'innerHeight * 0.30',
  aberta: "document.querySelector('#por-dentro h2').getBoundingClientRect().top + scrollY - innerHeight * 0.30",
  lista: "document.querySelector('#lista-pecas li:nth-child(3)').getBoundingClientRect().top + scrollY - innerHeight * 0.40",
  abertura: "document.querySelector('#t-abertura').getBoundingClientRect().top + scrollY - innerHeight * 0.16",
  reservar: "document.querySelector('#reservar').getBoundingClientRect().top + scrollY + 40",
  fim: 'document.documentElement.scrollHeight',
};
const CASOS = [];
const tnome = (t) => (t === 'light' ? 'claro' : 'escuro');
if (qual === 'png' || qual === 'tudo') {
  for (const tema of ['light', 'dark']) for (const [w, h] of [[1440, 900], [390, 844]]) CASOS.push({ nome: `vitrine-${tnome(tema)}-${w}`, w, h, tema, zoomRet: w === 1440 ? { x: 860, y: 600, width: 360, height: 180 } : null });   // base da lente ampliada 4×
  CASOS.push({ nome: 'vitrine-claro-1440-q1-girando', w: 1440, h: 900, tema: 'light', rolar: R.girando });
  CASOS.push({ nome: 'vitrine-claro-1440-q2-aberta', w: 1440, h: 900, tema: 'light', rolar: R.aberta });
  CASOS.push({ nome: 'vitrine-escuro-1440-q2-aberta', w: 1440, h: 900, tema: 'dark', rolar: R.lista });
  CASOS.push({ nome: 'vitrine-claro-1440-q3-abertura', w: 1440, h: 900, tema: 'light', rolar: R.abertura });
  CASOS.push({ nome: 'vitrine-claro-1440-q3b-barra-sobre-foto', w: 1440, h: 900, tema: 'light', rolar: "document.querySelector('#noite').getBoundingClientRect().top + scrollY + 120", zoomNav: true });
  CASOS.push({ nome: 'vitrine-escuro-1440-q4-reservar', w: 1440, h: 900, tema: 'dark', rolar: R.reservar, zoomSel: '#cartao' });
  CASOS.push({ nome: 'vitrine-claro-1440-q4-reservar', w: 1440, h: 900, tema: 'light', rolar: R.reservar, zoomSel: '#cartao', reservar: true });
  CASOS.push({ nome: 'vitrine-claro-390-q2-aberta', w: 390, h: 844, tema: 'light', rolar: 'innerHeight * 1.08' });
  CASOS.push({ nome: 'vitrine-escuro-390-q4-reservar', w: 390, h: 844, tema: 'dark', rolar: R.reservar });
  CASOS.push({ nome: 'vitrine-claro-1440-reduzido-aberta', w: 1440, h: 900, tema: 'light', rolar: R.aberta, reduzido: true });
  CASOS.push({ nome: 'vitrine-claro-1440-transparencia-reduzida', w: 1440, h: 900, tema: 'light', rolar: R.reservar, transp: true });
}
if (qual === 'checar' || qual === 'tudo') {
  for (const w of [320, 768, 1024, 1920]) for (const rol of [null, R.aberta, R.reservar]) CASOS.push({ nome: `largura-${w}${rol ? '-rolado' : ''}`, w, h: w < 700 ? 760 : 1000, tema: 'light', rolar: rol, semPng: true });
  CASOS.push({ nome: 'teclado-escuro-1440', w: 1440, h: 900, tema: 'dark', teclado: true, semPng: true });
  CASOS.push({ nome: 'coerencia-claro-1440', w: 1440, h: 900, tema: 'light', coerencia: true, semPng: true });
  CASOS.push({ nome: 'reduzido-animacoes', w: 1440, h: 900, tema: 'light', reduzido: true, contarAnim: true, rolar: R.aberta, semPng: true });
  CASOS.push({ nome: 'contraste-mais-escuro-1440', w: 1440, h: 900, tema: 'dark', contrasteMais: true, rolar: R.reservar, semPng: true });
  CASOS.push({ nome: 'sem-webgl-1440', w: 1440, h: 900, tema: 'light', qs: '?semgl', semGl: true, semPng: true });
  CASOS.push({ nome: 'objeto-3d-1440', w: 1440, h: 900, tema: 'light', objeto3d: true, semPng: true });
  CASOS.push({ nome: 'sem-js-1440', w: 1440, h: 900, tema: 'light', semJs: true, semPng: true });
  CASOS.push({ nome: 'desempenho-cpu4x-1440', w: 1440, h: 900, tema: 'light', desempenho: true, semPng: true });
  CASOS.push({ nome: 'desempenho-1440', w: 1440, h: 900, tema: 'light', desempenho: true, cpu: 1, semPng: true });
  CASOS.push({ nome: 'desempenho-cpu4x-1440-semgl', w: 1440, h: 900, tema: 'light', desempenho: true, qs: '?semgl', semPng: true });
  CASOS.push({ nome: 'desempenho-cpu4x-1440-1x', w: 1440, h: 900, tema: 'light', desempenho: true, dsf: 1, semPng: true });
  CASOS.push({ nome: 'desempenho-cpu4x-390', w: 390, h: 844, tema: 'light', desempenho: true, semPng: true });
}
// --so=nome (contém) ou --so=nome$ (nome exato)
if (SO) CASOS.splice(0, CASOS.length, ...CASOS.filter((c) => (SO.endsWith('$') ? c.nome === SO.slice(0, -1) : c.nome.includes(SO))));
if (MUTAR) CASOS.splice(0, CASOS.length, { nome: 'mutacao-vidro', w: 1440, h: 900, tema: 'light', coerencia: true, semPng: true, qs: '?mutar=vidro' });

// ---------- CDP mínimo ----------
let ws, seq = 0; const pend = new Map(); const ouvintes = []; const excecoes = [];
function cdp(method, params = {}) { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); }
function quando(evento) { return new Promise((r) => ouvintes.push({ evento, r })); }
async function avaliar(fn, ...args) {
  const r = await cdp('Runtime.evaluate', { expression: `(${fn})(...${JSON.stringify(args)})`, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('JS: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}
async function tecla(key, code, vk, shift) {
  const mod = shift ? 8 : 0;
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await espera(320);
}

// ---------- Na página ----------
const PIXEL = '.lg, .sobre-foto, .pecas, .noite, .controle';
function medirTudo(PIXEL) {
  const erros = [], avisos = [];
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (s) => { if (s === 'transparent') return [0, 0, 0, 0]; cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = s; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data;
    const m = s.match(/\/\s*([\d.]+%?)\s*\)|rgba\([^)]*,\s*([\d.]+)\s*\)/); let a = 1; if (m) { const v = m[1] || m[2]; a = v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); } return [d[0], d[1], d[2], a]; };
  const comp = (cima, baixo) => [0, 1, 2].map((i) => Math.round(cima[i] * cima[3] + baixo[i] * (1 - cima[3])));
  const opac = (e) => { let o = 1; for (let x = e; x; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; };
  const visivel = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return false;
    for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.visibility === 'hidden' || s.display === 'none') return false; } return opac(e) > 0.02; };
  const coberto = (e) => { const r = e.getBoundingClientRect(); const x = Math.min(innerWidth - 1, Math.max(0, r.left + Math.min(8, r.width / 2))), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const t = document.elementFromPoint(x, y); return t && !e.contains(t) && !t.contains(e) ? t : null; };
  const pares = [], pixel = [];
  const comTexto = [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('svg,script,style,.pular'));
  for (const e of comTexto) {
    if (!visivel(e)) continue;
    const s = getComputedStyle(e); const txt = e.textContent.trim().slice(0, 40);
    const o = opac(e); if (o < 0.98) avisos.push(`texto em transição (opacidade ${o.toFixed(2)}): "${txt}"`);
    const cob = coberto(e); if (cob && !cob.closest('.lg') && !e.closest('.lg')) continue;     // passa por baixo de outra camada
    if (cob && cob.closest('.lg') && !e.closest('.lg')) continue;                           // atrás da barra de vidro: não é para ler ali
    const cor = rgba(s.color); if (cor[3] === 0) continue;
    if (e.closest(PIXEL)) { pixel.push(e); continue; }
    let fundo = comp(rgba(getComputedStyle(document.body).backgroundColor), [255, 255, 255]);
    const cadeia = []; for (let x = e; x && x !== document.body; x = x.parentElement) cadeia.push(getComputedStyle(x).backgroundColor);
    for (const c of cadeia.reverse()) fundo = comp(rgba(c), fundo);
    const tam = parseFloat(s.fontSize), peso = +s.fontWeight; const grande = tam >= 24 || (tam >= 18.66 && peso >= 700);
    const r = razao(comp(cor, fundo), fundo);
    pares.push({ txt, r: +r.toFixed(2), min: grande ? 3 : 4.5 });
    if (r < (grande ? 3 : 4.5)) erros.push(`contraste ${r.toFixed(2)}:1 < ${grande ? 3 : 4.5} em "${txt}"`);
  }
  if (document.documentElement.scrollWidth > innerWidth) erros.push(`rolagem lateral: ${document.documentElement.scrollWidth} > ${innerWidth}`);
  for (const b of document.querySelectorAll('button, a[href], input')) {
    if (!visivel(b) || b.matches('.pular')) continue; const w = b.offsetWidth, h = b.offsetHeight;
    if (w < 24 || h < 24) erros.push(`alvo pequeno ${w}×${h}: ${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 30)}`);
    else if (innerWidth < 700 && h < 44) erros.push(`alvo < 44 px de altura no celular: ${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 30)} (${h})`);
    const r = b.getBoundingClientRect(); if (r.right > innerWidth + 0.5 || r.left < -0.5) erros.push(`controle cortado pela borda: ${b.textContent.trim().slice(0, 30)}`);
  }
  // título coberto pela barra fixa
  const nav = document.querySelector('.nav').getBoundingClientRect();
  for (const t of document.querySelectorAll('h1, h2')) { const r = t.getBoundingClientRect(); if (r.top < nav.bottom && r.bottom > nav.top && r.left < nav.right && r.right > nav.left && r.top > -4) avisos.push(`título passa sob a barra: "${t.textContent.slice(0, 30)}"`); }
  const min = pares.reduce((m, p) => (p.r < m.r ? p : m), { r: 99 });
  const rg = document.createRange();
  return { erros, avisos, nPares: pares.length, pior: min, pixel: pixel.map((e) => {
    const rs = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => { rg.selectNodeContents(n); return rg.getBoundingClientRect(); });
    const r = { left: Math.min(...rs.map((q) => q.left)), top: Math.min(...rs.map((q) => q.top)), right: Math.max(...rs.map((q) => q.right)), bottom: Math.max(...rs.map((q) => q.bottom)) };
    const nb = document.querySelector('.nav').getBoundingClientRect(); const sobNav = !e.closest('.nav') && r.top < nb.bottom && r.right > nb.left && r.left < nb.right;
    const x0 = Math.max(0, r.left), y0 = Math.max(sobNav ? nb.bottom + 2 : 0, r.top), x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);   // o trecho que passa sob a barra fixa não é para ler ali
    e.dataset.medirId = Math.random().toString(36).slice(2);
    return { id: e.dataset.medirId, txt: e.textContent.trim().slice(0, 30), cor: getComputedStyle(e).color, x: x0 + scrollX, y: y0 + scrollY, w: x1 - x0, h: y1 - y0, tam: parseFloat(getComputedStyle(e).fontSize), peso: +getComputedStyle(e).fontWeight };
  }).filter((p) => p.w > 4 && p.h > 4) };
}
async function medirPixel(itens) {
  const res = [];
  for (const it of itens) {
    await avaliar((id) => { const e = document.querySelector(`[data-medir-id="${id}"]`); e.dataset.corGuardada = e.style.color; e.style.setProperty('color', 'transparent', 'important');
      e.style.setProperty('text-shadow', 'none', 'important'); e.querySelectorAll('*').forEach((f) => f.style.setProperty('visibility', 'hidden', 'important')); }, it.id);
    await espera(50);
    const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: it.x + 1, y: it.y + 2, width: Math.max(1, it.w - 2), height: Math.max(1, it.h - 4), scale: 1 } });
    const r = await avaliar(async (b64, cor, id) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; const m = cor.match(/[\d.]+/g).map(Number);
      const lum = (r, gg, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
      const lt = lum(m[0], m[1], m[2]); let pior = 99;
      for (let i = 0; i < d.length; i += 4) { const lb = lum(d[i], d[i + 1], d[i + 2]); const [a, z] = lt > lb ? [lt, lb] : [lb, lt]; pior = Math.min(pior, (a + 0.05) / (z + 0.05)); }
      const e = document.querySelector(`[data-medir-id="${id}"]`); e.style.color = e.dataset.corGuardada; e.style.removeProperty('text-shadow'); e.querySelectorAll('*').forEach((f) => f.style.removeProperty('visibility'));
      return +pior.toFixed(2);
    }, shot.data, it.cor, it.id);
    const grande = it.tam >= 24 || (it.tam >= 18.66 && it.peso >= 700);
    res.push({ txt: it.txt, pior: r, min: grande ? 3 : 4.5 });
  }
  return res;
}
function coerencia() {
  const erros = [], txt = (s) => document.querySelector(s)?.textContent || '';
  const k = window.__vitrine?.contagem; if (!k) return { erros: ['lente 3D não montou (sem __vitrine.contagem)'], resumo: '' };
  const vidros = k.numeros.map((n) => ({ dataset: { n } })); const grupos = { size: k.grupos };
  const ext = { sete: 7, cinco: 5 };
  const h2 = txt('#por-dentro h2'); const mN = h2.match(/(\w+) elementos em (\w+) grupos/);
  if (!mN) erros.push('título "Por dentro" sem "N elementos em N grupos"');
  else { if (ext[mN[1]] !== vidros.length) erros.push(`texto diz ${mN[1]} elementos, a lente tem ${vidros.length} vidros`); if (ext[mN[2]] !== grupos.size) erros.push(`texto diz ${mN[2]} grupos, a lente tem ${grupos.size}`); }
  const ficha = txt('.cartao-ficha').match(/(\d+) elementos/); if (!ficha || +ficha[1] !== vidros.length) erros.push(`cartão diz ${ficha && ficha[1]} elementos, a lente tem ${vidros.length}`);
  const cobertos = [...document.querySelectorAll('#lista-pecas li')].flatMap((li) => li.dataset.elementos.split(',')).filter((x) => x !== 'iris').map(Number).sort((a, b) => a - b);
  const nums = vidros.map((v) => +v.dataset.n).sort((a, b) => a - b);
  if (JSON.stringify(cobertos) !== JSON.stringify(nums)) erros.push(`lista cobre ${cobertos} e a lente tem ${nums}`);
  for (const li of document.querySelectorAll('#lista-pecas li')) { const n = li.querySelector('.num').textContent.trim(); if (li.dataset.elementos !== 'iris' && n.replace('·', ',') !== li.dataset.elementos) erros.push(`número "${n}" ≠ elementos ${li.dataset.elementos}`); }
  const lam = k.laminas;
  const lamTxt = [txt('#lista-pecas'), txt('.texto-sec')].map((t) => +(t.match(/(\d+) lâminas/) || [])[1]);
  if (lamTxt.some((n) => n !== lam)) erros.push(`texto diz ${lamTxt} lâminas, o diafragma tem ${lam}`);
  if (+document.querySelector('.iris-mini').dataset.laminas !== lam) erros.push('ícone do diafragma com número de lâminas diferente do diafragma 3D');
  // desfoque redondo até f/4; forma do diafragma de f/5,6 em diante
  const faixa = document.querySelector('#abertura-faixa'), noite = document.querySelector('#noite'); const formas = [];
  for (let v = 0; v <= 5; v++) { faixa.value = v; faixa.dispatchEvent(new Event('input')); formas.push(`${noite.dataset.f}:${getComputedStyle(noite).getPropertyValue('--forma').trim().slice(0, 7)}`); }
  const ate = (txt('.texto-sec').match(/até f\/([\d,]+)/) || [])[1]; const limite = ate ? +ate.replace(',', '.') : NaN;
  for (const f of formas) { const [n, forma] = f.split(':'); if ((+n <= limite) !== forma.startsWith('circle')) erros.push(`em f/${n} o desfoque é ${forma}, o texto diz redondo até f/${ate}`); }
  if (document.querySelector('#abertura-valor').textContent !== 'f/8') erros.push('rótulo da abertura não acompanhou a faixa');
  faixa.value = 0; faixa.dispatchEvent(new Event('input'));
  const mola = getComputedStyle(document.documentElement).getPropertyValue('--mola').trim();
  if (!mola.startsWith('linear(') || mola.split(',').length < 30) erros.push('a mola da casa não está amostrada em linear() (≥ 30 pontos)');
  return { erros, resumo: `${vidros.length} vidros, ${grupos.size} grupos, ${lam} lâminas (do objeto 3D), formas ${formas.join(' ')}; mola linear() com ${mola.split(',').length} pontos` };
}
async function reservarEDesfazer() {
  const erros = []; const b = document.querySelector('#b-reservar');
  b.click(); await new Promise((r) => setTimeout(r, 900));
  const vis = (s) => { const e = document.querySelector(s); return +getComputedStyle(e).opacity > 0.98 && getComputedStyle(e).visibility === 'visible'; };
  if (b.getAttribute('aria-pressed') !== 'true') erros.push('reservar: aria-pressed não virou true');
  if (!vis('.b-depois') || vis('.b-antes')) erros.push('reservar: o rótulo "Reservada" não ficou sozinho à vista');
  if (!vis('.estado-b') || vis('.estado-a')) erros.push('reservar: o aviso não trocou');
  if (!/cobrado/.test(document.querySelector('#aviso-sr').textContent)) erros.push('reservar: aviso falado sem a condição de cobrança');
  if (getComputedStyle(document.querySelector('.b-ok path')).strokeDashoffset !== '0px') erros.push('reservar: o ✓ não terminou de se desenhar');
  return { erros };
}
async function desfazer() {
  const erros = []; document.querySelector('#b-desfazer').click(); await new Promise((r) => setTimeout(r, 900));
  const b = document.querySelector('#b-reservar');
  if (b.getAttribute('aria-pressed') !== 'false' || +getComputedStyle(document.querySelector('.b-antes')).opacity < 0.98) erros.push('desfazer: botão não voltou');
  if (document.activeElement !== b) erros.push('desfazer: foco não voltou ao botão');
  return { erros };
}
function focoAtual() {
  const a = document.activeElement; const s = getComputedStyle(a); const r = a.getBoundingClientRect(); const nav = document.querySelector('.nav').getBoundingClientRect();
  const naNav = !!a.closest('.nav'); const sob = !naNav && r.top < nav.bottom && r.bottom > nav.top && r.left < nav.right && r.right > nav.left;
  return { corpo: a === document.body, txt: (a.getAttribute('aria-label') || a.textContent || a.id || a.tagName).trim().replace(/\s+/g, ' ').slice(0, 34), outline: s.outlineStyle, larg: parseFloat(s.outlineWidth), cor: s.outlineColor,
    sob, fora: r.bottom < 0 || r.top > innerHeight, tom: a.closest('.lg')?.dataset.tom || '' };
}

// ---------- Execução ----------
(async () => {
  if (!EDGE) throw new Error('Edge não encontrado');
  fs.mkdirSync(PNG, { recursive: true });
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', '--enable-unsafe-swiftshader', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  process.on('exit', () => { try { edge.kill(); } catch { /* já saiu */ } });
  setTimeout(() => { console.error('tempo esgotado (25 min): Edge encerrado'); process.exit(3); }, 1500000).unref();
  let alvo;
  for (let i = 0; i < 60 && !alvo; i++) { await espera(250); try { const l = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json(); alvo = l.find((t) => t.type === 'page'); } catch { /* subindo */ } }
  if (!alvo) throw new Error('Edge não respondeu');
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(p.method + ': ' + d.error.message)) : p.res(d.result); }
    else if (d.method) { if (d.method === 'Runtime.exceptionThrown') excecoes.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
      for (let i = ouvintes.length - 1; i >= 0; i--) if (ouvintes[i].evento === d.method) { ouvintes[i].r(d.params); ouvintes.splice(i, 1); } } };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  const relatorio = []; let totalErros = 0;
  try {
    for (const c of CASOS) {
      excecoes.length = 0;
      const mobile = c.w < 700;
      await cdp('Emulation.setDeviceMetricsOverride', { width: c.w, height: c.h, deviceScaleFactor: c.dsf || 2, mobile });
      await cdp('Emulation.setTouchEmulationEnabled', { enabled: mobile });
      await cdp('Emulation.setScriptExecutionDisabled', { value: !!c.semJs });
      await cdp('Emulation.setCPUThrottlingRate', { rate: c.desempenho ? (c.cpu || 4) : 1 });
      await cdp('Emulation.setEmulatedMedia', { features: [
        { name: 'prefers-color-scheme', value: c.tema }, { name: 'prefers-reduced-motion', value: c.reduzido ? 'reduce' : 'no-preference' },
        { name: 'prefers-reduced-transparency', value: c.transp ? 'reduce' : 'no-preference' }, { name: 'prefers-contrast', value: c.contrasteMais ? 'more' : 'no-preference' }] });
      const r0 = {}; const carregou = quando('Page.loadEventFired');
      await cdp('Page.navigate', { url: URL0 + (c.qs || '') }); await carregou;
      // a lente 3D carrega do CDN e compila os materiais: espera ficar ativa (ou a reserva, se não houver WebGL / movimento reduzido)
      if (!c.semJs) r0.gl = await avaliar(() => new Promise((ok) => { const t = Date.now(); const f = () => document.documentElement.classList.contains('gl-ativo') ? ok(Date.now() - t) : (Date.now() - t > 25000 ? ok(-1) : setTimeout(f, 100)); if (matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.includes('semgl')) ok(0); else f(); }));
      await espera(c.desempenho ? 2500 : 1600);
      Object.assign(r0, { caso: c.nome, erros: [], avisos: [] }); const r = r0; if (r.gl === -1) r.erros.push('a lente WebGL não ativou em 25 s');
      if (c.desempenho) {
        const p = await avaliar(() => new Promise((ok) => { const out = { lcp: 0, cls: 0, lcpEl: '' };
          new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (out.congelado) return; out.lcp = e.startTime; out.lcpEl = e.element ? e.element.tagName + '.' + e.element.className : ''; } }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
          // o LCP vale até a primeira rolagem (como no navegador, que para de medir na interação); a rolagem do teste vem depois
          // rola a abertura da lente em 90 quadros e mede o intervalo entre quadros
          const fim = document.querySelector('#abertura').getBoundingClientRect().top + scrollY; const ts = []; let i = 0;
          const q = (t) => { ts.push(t); scrollTo(0, fim * (i / 90)); if (++i <= 90) requestAnimationFrame(q); else {
            const d = ts.slice(1).map((t, k) => t - ts[k]).sort((a, b) => a - b);
            out.mediana = +d[Math.floor(d.length / 2)].toFixed(1); out.p95 = +d[Math.floor(d.length * 0.95)].toFixed(1); out.lentos = d.filter((x) => x > 50).length; ok(out); } };
          setTimeout(() => { out.congelado = true; requestAnimationFrame(q); }, 400); }));
        r.desempenho = `LCP ${Math.round(p.lcp)} ms (${p.lcpEl}), CLS ${p.cls.toFixed(3)}, quadros na abertura: mediana ${p.mediana} ms, p95 ${p.p95} ms, ${p.lentos} de 90 acima de 50 ms (CPU ${c.cpu || 4}×)`;
        if (p.lcp > 2500) r.erros.push(`LCP ${Math.round(p.lcp)} ms > 2500`); if (p.cls > 0.1) r.erros.push(`CLS ${p.cls.toFixed(3)} > 0,1`);
        if (p.p95 > 50) r.avisos.push(`p95 de quadro ${p.p95} ms com CPU 4× (headless, sem GPU real)`);
      }
      if (c.rolar) { await avaliar((ex) => scrollTo(0, eval(ex)), c.rolar); await espera(2600); }
      if (!c.semJs) { const ej = await avaliar(() => window.__errosJs || []); r.erros.push(...ej.map(semPasta), ...excecoes.map((x) => 'exceção: ' + semPasta(x).slice(0, 120)));
        if (!(await avaliar(() => !!window.liquido))) r.erros.push('liquido.js não carregou (caminho modelos/liquid-glass)'); }
      if (!c.desempenho) {
        const m = await avaliar(medirTudo, PIXEL); r.erros.push(...m.erros); r.avisos.push(...m.avisos); r.pares = m.nPares; r.piorTexto = m.pior;
        r.pixel = await medirPixel(m.pixel);
        for (const v of r.pixel) if (v.pior < v.min) r.erros.push(`pixel: "${v.txt}" ${v.pior}:1 < ${v.min} no pior ponto`);
        r.vidro = await avaliar(() => [...document.querySelectorAll('.lg')].filter((x) => x.offsetWidth).map((x) => `${x.className.split(' ')[0]}:${x.dataset.tom || 'tema'}${x.hasAttribute('data-lg-misto') ? '+misto' : ''}(${x.dataset.lgFundo || '-'}) ${getComputedStyle(x).backdropFilter.slice(0, 14)}`).join(' | '));
      }
      if (c.semJs) {
        // sem JS a revelação continua só em CSS (linha do tempo de rolagem): cada texto, posto no meio da tela, tem de estar inteiro
        // (sem JS na página os temporizadores não rodam: a espera é feita daqui)
        // .estado-b só existe depois de reservar
        const SEL = 'h1, h2, h3, .lista-pecas p, .cartao p:not(.estado-b), .sub, .texto-sec'; const n = await avaliar((s) => document.querySelectorAll(s).length, SEL); const s = { falta: [] };
        for (let i = 0; i < n; i++) {
          await avaliar((s, i) => document.querySelectorAll(s)[i].scrollIntoView({ block: 'center' }), SEL, i); await espera(150);
          const f = await avaliar((s, i) => { const e = document.querySelectorAll(s)[i]; let o = 1; for (let x = e; x; x = x.parentElement) o *= +getComputedStyle(x).opacity;
            return o < 0.98 || getComputedStyle(e).visibility === 'hidden' || e.offsetHeight === 0 ? e.textContent.slice(0, 30) + ' (' + o.toFixed(2) + ')' : ''; }, SEL, i);
          if (f) s.falta.push(f);
        }
        r.semJsTextos = n;
        if (s.falta.length) r.erros.push('sem JS, texto invisível: ' + s.falta.join(' | ')); r.semJs = `sem JS: ${s.falta.length} de ${n} textos escondidos no meio da tela`;
      }
      if (c.semGl) { const s = await avaliar(() => ({ gl: document.documentElement.classList.contains('gl-ativo'), img: (() => { const i = document.querySelector('.lente-img-heroi img'); return i.complete && i.naturalWidth > 0 && getComputedStyle(document.querySelector('.lente-img-heroi')).visibility === 'visible'; })() }));
        if (s.gl || !s.img) r.erros.push('sem WebGL: a imagem renderizada da lente não apareceu'); r.semGl = 'sem WebGL: imagem de reserva à vista = ' + s.img; }
      if (c.objeto3d) { const cx = await avaliar(() => window.__vitrine.caixa());
        const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: cx.x, y: cx.y, width: cx.w, height: cx.h, scale: 1 } });
        const o = await avaliar(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
          const d = g.getImageData(0, 0, cv.width, cv.height).data; let sat = 0, n = d.length / 4; for (let i = 0; i < d.length; i += 4) if (d[i] >= 254 && d[i + 1] >= 254 && d[i + 2] >= 254) sat++; return { sat: sat / n, px: n }; }, shot.data);
        if (o.sat > 0.01) r.erros.push(`objeto 3D estourado: ${(o.sat * 100).toFixed(2)}% de pixels brancos saturados`); r.objeto3d = `lente: ${(o.sat * 100).toFixed(3)}% de pixels saturados em ${o.px} (limite 1%); WebGL ativo em ${r.gl} ms`; }
      if (c.coerencia) { const k = await avaliar(coerencia); r.erros.push(...k.erros); r.coerencia = k.resumo; }
      if (c.contarAnim) {
        const a = await avaliar(() => { const ativos = document.getAnimations().filter((x) => x.playState === 'running' && !(x.transitionProperty === 'opacity')).map((x) => x.animationName || x.transitionProperty);
          return { ativos, aberta: +getComputedStyle(document.querySelector('.lente-img-aberta')).opacity > 0.98, gl: document.documentElement.classList.contains('gl-ativo') }; });
        if (a.gl) r.erros.push('movimento reduzido: a lente WebGL não deveria rodar');
        if (a.ativos.length) r.erros.push('movimento reduzido: animações rodando: ' + a.ativos.join(', '));
        if (!a.aberta) r.erros.push('movimento reduzido: a lente não mostrou o estado aberto');
        r.reduzido = `animações rodando: ${a.ativos.length}; lente aberta (sem movimento): ${a.aberta}`;
      }
      if (c.teclado) {
        const seq = [];
        await tecla('Tab', 'Tab', 9); seq.push(await avaliar(focoAtual));
        if (!/Pular/.test(seq[0].txt)) r.erros.push('1º Tab não foi o "Pular para o conteúdo": ' + seq[0].txt);
        for (let i = 0; i < 12; i++) { await tecla('Tab', 'Tab', 9); seq.push(await avaliar(focoAtual)); }
        await tecla('Tab', 'Tab', 9, true); const volta = await avaliar(focoAtual);
        if (volta.txt !== seq[seq.length - 2].txt) r.erros.push(`Shift+Tab não voltou: ${volta.txt} ≠ ${seq[seq.length - 2].txt}`);
        for (const f of seq) { if (f.corpo) continue; if (f.outline === 'none' || f.larg < 2) r.erros.push(`foco sem anel: ${f.txt}`); if (f.sob) r.erros.push(`foco sob a barra: ${f.txt}`); if (f.fora) r.erros.push(`foco fora da tela: ${f.txt}`); }
        r.teclado = seq.map((f) => `${f.txt}${f.tom ? '[' + f.tom + ']' : ''}`).join(' → ') + ` ⟵ ${volta.txt}`;
      }
      if (c.reservar) { const a = await avaliar(reservarEDesfazer); r.erros.push(...a.erros); }
      if (c.zoomRet) { const z = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...c.zoomRet, scale: 4 } }); fs.writeFileSync(path.join(PNG, c.nome + '-zoom4x.png'), Buffer.from(z.data, 'base64')); }
      if (c.zoomNav) { const q = await avaliar(() => { const b = document.querySelector('.nav').getBoundingClientRect(); return { x: b.left - 16 + scrollX, y: Math.max(0, b.top - 10) + scrollY, width: b.width + 32, height: b.height + 24 }; });
        const z = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...q, scale: 2 } }); fs.writeFileSync(path.join(PNG, c.nome + '-zoom.png'), Buffer.from(z.data, 'base64')); }
      if (c.zoomSel) {
        const q = await avaliar((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.right - 230 + scrollX, y: b.bottom - 200 + scrollY, width: 270, height: 230 }; }, c.zoomSel);   // canto inferior direito: onde a coluna de brilho do mar passa sob a borda
        const z = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...q, scale: 2 } }); fs.writeFileSync(path.join(PNG, c.nome + '-zoom.png'), Buffer.from(z.data, 'base64'));
      }
      if (!c.semPng || process.argv.includes('--png')) { const shot = await cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(PNG, c.nome + '.png'), Buffer.from(shot.data, 'base64')); r.png = c.nome + '.png'; }
      if (c.reservar) { const d = await avaliar(desfazer); r.erros.push(...d.erros); r.reserva = 'reservar → "Reservada" + ✓ + aviso + Desfazer; desfazer → volta e devolve o foco'; }
      totalErros += r.erros.length; relatorio.push(r);
      const pp = r.pixel && r.pixel.length ? `; pior pixel ${Math.min(...r.pixel.map((v) => v.pior))}:1 "${r.pixel.reduce((a, b) => (b.pior < a.pior ? b : a)).txt}"` : '';
      console.log(`${r.erros.length ? 'ERRO' : 'ok  '} ${c.nome}: ${r.pares || 0} textos sólidos, pior ${r.piorTexto ? r.piorTexto.r + ':1' : '-'}${pp}` +
        [r.coerencia, r.teclado, r.reduzido, r.desempenho, r.semJs, r.semGl, r.objeto3d, r.reserva, r.vidro].filter(Boolean).map((x) => '\n     · ' + x).join('') +
        (r.avisos.length ? '\n     aviso: ' + [...new Set(r.avisos)].slice(0, 6).join('\n     aviso: ') : '') + (r.erros.length ? '\n     ✗ ' + r.erros.join('\n     ✗ ') : ''));
    }
  } finally { try { ws.close(); } catch { } edge.kill(); }
  if (!MUTAR && !SO) fs.writeFileSync(path.join(PNG, `medidas-${qual}.json`), JSON.stringify({ data: new Date().toISOString(), totalErros, relatorio }, null, 2));
  if (MUTAR) { console.log(totalErros ? `mutação PEGA (${totalErros} erro(s)): o verificador falha no caso errado` : 'mutação ESCAPOU'); process.exit(totalErros ? 0 : 1); }
  process.exit(totalErros ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
