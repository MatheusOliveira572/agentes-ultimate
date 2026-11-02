// Verificador e capturador da prova pv94 (caso-a-depois-v2.html e caso-b-produto-v2.html).
// Edge sem interface, perfil próprio, uma aba, uma captura por vez; nada na tela do usuário (windowsHide).
// Confere: rolagem lateral, contraste de cada texto (fundo sólido composto; sobre vidro, pixel a pixel no pior ponto),
// alvos de toque, somas do caso A (placar × lista × fita × navegação), a microinteração de concluir e desfazer,
// teclado (Tab e setas, anel de foco ≥ 3:1) e movimento reduzido. Sai com código 1 se houver erro.
// Uso: node verificar-v2.js [a|b|tudo] [--mutar]   (--mutar abre o caso A com ?mutar=contagem e TEM de falhar)
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const AQUI = __dirname;
const PNG = path.join(AQUI, 'png');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORTA = 9347;
const PERFIL = path.join(os.tmpdir(), 'pv94-edge-perfil');
const qual = process.argv[2] || 'tudo';
const MUTAR = process.argv.includes('--mutar');
const url = (arq, qs = '') => 'file:///' + path.join(AQUI, arq).replace(/\\/g, '/') + qs;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const CASOS = [];
if (qual === 'a' || qual === 'tudo') {
  for (const tema of ['light', 'dark']) for (const [w, h] of [[1440, 900], [390, 844]])
    CASOS.push({ nome: `caso-a-v2-${tema === 'light' ? 'claro' : 'escuro'}-${w}`, arq: 'caso-a-depois-v2.html', w, h, tema, somas: true });
  CASOS.push({ nome: 'caso-a-v2-claro-1440-concluir', arq: 'caso-a-depois-v2.html', w: 1440, h: 900, tema: 'light', somas: true, interacao: true });
  CASOS.push({ nome: 'caso-a-v2-escuro-1440-teclado', arq: 'caso-a-depois-v2.html', w: 1440, h: 900, tema: 'dark', teclado: true, semPng: true });
  CASOS.push({ nome: 'caso-a-v2-claro-1440-reduzido', arq: 'caso-a-depois-v2.html', w: 1440, h: 900, tema: 'light', reduzido: true, semPng: true });
  CASOS.push({ nome: 'caso-a-v2-claro-1440-vazio', arq: 'caso-a-depois-v2.html', qs: '?estado=vazio', w: 1440, h: 900, tema: 'light', somas: true });
}
if (qual === 'b' || qual === 'tudo') {
  for (const tema of ['light', 'dark']) for (const [w, h] of [[1440, 900], [390, 844]])
    CASOS.push({ nome: `caso-b-produto-v2-${tema === 'light' ? 'claro' : 'escuro'}-${w}`, arq: 'caso-b-produto-v2.html', w, h, tema });
  CASOS.push({ nome: 'caso-b-produto-v2-escuro-390-rolado', arq: 'caso-b-produto-v2.html', w: 390, h: 844, tema: 'dark', rolar: 520 });
  CASOS.push({ nome: 'caso-b-produto-v2-claro-1440-rolado', arq: 'caso-b-produto-v2.html', w: 1440, h: 900, tema: 'light', rolar: 640, zoom: { x: 1060, y: 640, width: 370, height: 70 } });
  CASOS.push({ nome: 'caso-b-produto-v2-escuro-1440-teclado-reduzido', arq: 'caso-b-produto-v2.html', w: 1440, h: 900, tema: 'dark', tecladoB: true, reduzido: true, semPng: true });
  CASOS.push({ nome: 'caso-b-produto-v2-claro-1440-transparencia-reduzida', arq: 'caso-b-produto-v2.html', w: 1440, h: 900, tema: 'light', transp: true, rolar: 640 });
}
if (qual === 'teste') CASOS.push({ nome: '_teste', arq: process.argv[3], w: 640, h: 320, tema: 'light' });
if (MUTAR) CASOS.splice(0, CASOS.length, { nome: 'mutacao', arq: 'caso-a-depois-v2.html', qs: '?mutar=contagem', w: 1440, h: 900, tema: 'light', somas: true, semPng: true });

// ---------- CDP mínimo ----------
let ws, seq = 0; const pend = new Map(); const ouvintes = [];
function cdp(method, params = {}) {
  const id = ++seq; ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pend.set(id, { res, rej, method }));
}
function quando(evento) { return new Promise((r) => ouvintes.push({ evento, r })); }
async function avaliar(fn, ...args) {
  const r = await cdp('Runtime.evaluate', { expression: `(${fn})(...${JSON.stringify(args)})`, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('JS: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}

// ---------- Funções que rodam na página ----------
function medirTudo(opc) {
  const erros = [], avisos = [];
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (s) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = s; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data;
    const m = s.match(/\/\s*([\d.]+%?)\s*\)|rgba\([^)]*,\s*([\d.]+)\s*\)/); let a = 1; if (m) { const v = m[1] || m[2]; a = v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); }
    if (s === 'transparent') a = 0; return [d[0], d[1], d[2], a]; };
  const comp = (cima, baixo) => [0, 1, 2].map((i) => Math.round(cima[i] * cima[3] + baixo[i] * (1 - cima[3])));
  const visivel = (e) => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return false;
    for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false; } return true; };
  // cobre: o ponto central do texto está debaixo de outro elemento (barra fixa, aviso)?
  const coberto = (e) => { const r = e.getBoundingClientRect(); const x = Math.min(innerWidth - 1, r.left + Math.min(8, r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const t = document.elementFromPoint(x, y); return t && !e.contains(t) && !t.contains(e) ? t : null; };
  const pares = [], vidro = [];
  const comTexto = [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('svg,script,style,.vh'));
  for (const e of comTexto) {
    if (!visivel(e)) continue;
    const cob = coberto(e); if (cob && !e.closest('.vidro, .lg, .sobre-foto')) continue;          // passa por baixo de uma camada (sólida ou vidro): não é para ler ali
    const s = getComputedStyle(e);
    const cor = rgba(s.color); if (cor[3] === 0) continue;
    const sobreVidro = !!e.closest('.vidro, .lg, .sobre-foto');
    let complexo = false; const cadeia = [];
    for (let x = e; x; x = x.parentElement) { const sx = getComputedStyle(x); cadeia.push(sx.backgroundColor); if (sx.backgroundImage !== 'none' && !x.closest('.vidro, .lg, .sobre-foto')) complexo = x; if (x.matches('.vidro, .lg, .sobre-foto')) break; }
    if (sobreVidro) { vidro.push(e); continue; }
    let fundo = [255, 255, 255];
    const raiz = getComputedStyle(document.body).backgroundColor; fundo = comp(rgba(raiz), fundo);
    for (const c of cadeia.reverse()) fundo = comp(rgba(c), fundo);
    const tam = parseFloat(s.fontSize), peso = +s.fontWeight;
    const grande = tam >= 24 || (tam >= 18.66 && peso >= 700);
    const r = razao(comp(cor, fundo), fundo);
    const txt = e.textContent.trim().slice(0, 40);
    if (complexo && !complexo.matches('.peca')) { avisos.push(`fundo com imagem, medir à parte: "${txt}"`); continue; }
    pares.push({ txt, r: +r.toFixed(2), min: grande ? 3 : 4.5 });
    if (r < (grande ? 3 : 4.5)) erros.push(`contraste ${r.toFixed(2)}:1 < ${grande ? 3 : 4.5} em "${txt}" (${s.color} sobre rgb(${fundo}))`);
    if (e.scrollWidth > e.clientWidth + 1 && s.overflow === 'hidden' && s.textOverflow !== 'ellipsis') erros.push(`texto cortado: "${txt}"`);
  }
  if (document.documentElement.scrollWidth > innerWidth) erros.push(`rolagem lateral: ${document.documentElement.scrollWidth} > ${innerWidth}`);
  // alvos: todo botão/link visível ≥ 24 px (WCAG 2.5.8); no celular, os de ação ≥ 44 px (meta nossa)
  for (const b of document.querySelectorAll('button, a[href], [tabindex="0"]')) {
    if (!visivel(b) || b.closest('.vh')) continue; const r = { width: b.offsetWidth || b.getBoundingClientRect().width, height: b.offsetHeight || b.getBoundingClientRect().height };   // tamanho de layout: transform de animação não conta
    if (r.width < 24 || r.height < 24) { if (!b.matches('.peca')) erros.push(`alvo pequeno ${Math.round(r.width)}×${Math.round(r.height)}: ${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 30)}`); }
    else if (innerWidth < 700 && (r.width < 44 || r.height < 44) && b.matches(opc.alvo44 || '.marcar, .abas a, .abas button')) erros.push(`alvo < 44 no celular: ${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 30)}`);
  }
  // controle que sai da tela (fixo não gera rolagem lateral, então a checagem acima não o vê)
  for (const b of document.querySelectorAll('button, a[href]')) { if (!visivel(b)) continue; const r = b.getBoundingClientRect();
    const fixo = (() => { for (let x = b; x; x = x.parentElement) if (getComputedStyle(x).position === 'fixed') return true; return false; })();
    if (fixo && (r.right > innerWidth + 0.5 || r.left < -0.5)) erros.push(`controle cortado pela borda: ${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 30)} (${Math.round(r.left)}–${Math.round(r.right)} de ${innerWidth})`); }
  const min = pares.reduce((m, p) => (p.r < m.r ? p : m), { r: 99 });
  return { erros, avisos, nPares: pares.length, pior: min, vidro: vidro.map((e) => { const r = e.getBoundingClientRect(); return { txt: e.textContent.trim().slice(0, 30), cor: getComputedStyle(e).color, x: r.left + scrollX, y: r.top + scrollY, vx: r.left, vy: r.top, w: r.width, h: r.height, tam: parseFloat(getComputedStyle(e).fontSize), peso: +getComputedStyle(e).fontWeight }; }) };
}

function somasA() {
  const erros = [];
  const n = (sel) => document.querySelectorAll(sel).length;
  const txt = (id) => +document.getElementById(id).textContent.replace(/\D/g, '');
  const linhas = n('.grupos .linha'), feitas = n('.grupos .linha.feita');
  if (txt('n-total') !== linhas) erros.push(`placar diz ${txt('n-total')} tarefas, a lista tem ${linhas}`);
  if (txt('n-feitas') !== feitas) erros.push(`placar diz ${txt('n-feitas')} feitas, a lista tem ${feitas}`);
  if (txt('n-pct') !== Math.round(100 * feitas / linhas)) erros.push(`percentual ${txt('n-pct')}% ≠ ${Math.round(100 * feitas / linhas)}%`);
  if (n('.peca') !== linhas) erros.push(`fita tem ${n('.peca')} peças, a lista ${linhas} linhas`);
  if (n('.peca.feita') !== feitas) erros.push(`fita tem ${n('.peca.feita')} feitas, a lista ${feitas}`);
  const nav = {}; document.querySelectorAll('[data-contagem]').forEach((s) => (nav[s.dataset.contagem] = +s.textContent));
  const abertasHoje = n('.grupos .linha:not(.feita)') - n('.grupos .linhas:last-of-type .linha:not(.feita)');
  if (nav['Feitas'] !== feitas) erros.push(`navegação "Feitas" ${nav['Feitas']} ≠ ${feitas}`);
  if (nav['Hoje'] + nav['Próximos'] + nav['Feitas'] !== linhas) erros.push(`navegação soma ${nav['Hoje'] + nav['Próximos'] + nav['Feitas']} ≠ ${linhas}`);
  if (nav['Hoje'] !== abertasHoje) erros.push(`navegação "Hoje" ${nav['Hoje']} ≠ ${abertasHoje} abertas hoje`);
  const proj = [...document.querySelectorAll('#nav-projetos small')].reduce((s, e) => s + +e.textContent, 0);
  if (proj !== linhas - feitas) erros.push(`projetos somam ${proj} abertas ≠ ${linhas - feitas}`);
  return { erros, linhas, feitas };
}

async function concluirEDesfazer() {
  const erros = [];
  const antes = +document.getElementById('n-feitas').textContent;
  document.querySelector('.linha[data-id="t7"] .marcar').click();
  await new Promise((r) => setTimeout(r, 450));
  const linha = document.querySelector('.linha[data-id="t7"]');
  if (!linha.classList.contains('feita')) erros.push('concluir: a linha não ficou feita');
  if (+document.getElementById('n-feitas').textContent !== antes + 1) erros.push('concluir: placar não subiu');
  if (!document.querySelector('.peca[data-id="t7"]').classList.contains('feita')) erros.push('concluir: peça da fita não encheu');
  if (!document.getElementById('aviso').classList.contains('ativo')) erros.push('concluir: aviso de desfazer não apareceu');
  const ag = document.getElementById('agora-info').textContent;
  if (/Revisar a proposta/.test(ag)) erros.push('concluir: o "agora" ainda aponta a tarefa feita como próxima');
  if (!/1 aberta ·/.test(document.getElementById('g-hoje').textContent)) erros.push('concluir: título do grupo Hoje não atualizou: ' + document.getElementById('g-hoje').textContent);
  if (document.querySelector('[data-fita="Hoje"]').textContent !== '6 de 8') erros.push('concluir: rótulo da fita não atualizou');
  if (!/Reabrir/.test(document.getElementById('b-concluir').textContent)) erros.push('concluir: botão do detalhe não virou Reabrir');
  if (document.getElementById('selo-prazo').offsetWidth > 0) erros.push('concluir: "em 2 h 40 min" continua na tarefa feita');
  { const a = document.getElementById('aviso').getBoundingClientRect(); for (const o of document.querySelectorAll('.lg:not(#aviso)')) { const b = o.getBoundingClientRect(); if (b.width && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) erros.push('vidro sobre vidro: o aviso cobre ' + o.className); } }
  const risco = getComputedStyle(linha.querySelector('.titulo'), '::after').transform;
  if (risco === 'none' || risco.startsWith('matrix(0')) erros.push('concluir: risco do título não chegou ao fim: ' + risco);
  return { erros, antes };
}
async function desfazer(antes) {
  const erros = [];
  document.getElementById('b-desfazer').click();
  await new Promise((r) => setTimeout(r, 400));
  if (+document.getElementById('n-feitas').textContent !== antes) erros.push('desfazer: placar não voltou');
  if (document.querySelector('.linha[data-id="t7"]').classList.contains('feita')) erros.push('desfazer: linha continua feita');
  if (!/Revisar a proposta/.test(document.getElementById('agora-info').textContent)) erros.push('desfazer: o "agora" não voltou');
  return { erros };
}
async function reduzido() {
  const erros = [];
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) erros.push('emulação de movimento reduzido não pegou');
  document.querySelector('.linha[data-id="t8"] .marcar').click();
  await new Promise((r) => setTimeout(r, 30));
  const longas = document.getAnimations().filter((a) => { const t = a.effect.getTiming(); return t.duration > 1 && !(a.transitionProperty === 'opacity' && t.duration <= 150); });
  if (longas.length) erros.push('movimento reduzido: ' + longas.map((a) => (a.transitionProperty || a.animationName) + ' ' + a.effect.getTiming().duration + 'ms').join(', '));
  return { erros };
}
function focoAtual() {
  const a = document.activeElement; const s = getComputedStyle(a);
  return { tag: a.tagName, cls: a.className, txt: (a.getAttribute('aria-label') || a.textContent).trim().slice(0, 40), outline: s.outlineStyle, larg: parseFloat(s.outlineWidth), cor: s.outlineColor, sel: document.querySelector('.linha[aria-current="true"]')?.dataset.id,
    anim: document.getAnimations().map((x) => x.animationName).filter(Boolean) };
}

// ---------- Pior ponto do texto sobre vidro (pixel a pixel) ----------
async function medirVidro(itens) {
  const res = [];
  for (const it of itens) {
    if (it.w < 2 || it.h < 2) continue;
    await avaliar((x) => { const e = [...document.querySelectorAll('.vidro *, .lg *, .sobre-foto *')].concat([...document.querySelectorAll('body *')]).find((n) => { const r = n.getBoundingClientRect(); return Math.abs(r.left - x.vx) < 0.5 && Math.abs(r.top - x.vy) < 0.5 && n.textContent.trim().startsWith(x.txt.slice(0, 10)); });
      if (e) { e.dataset.corGuardada = e.style.color; e.style.setProperty('color', 'transparent', 'important'); e.dataset.medindo = '1'; e.querySelectorAll('*').forEach((f) => f.style.setProperty('visibility', 'hidden', 'important')); } }, it);
    await espera(60);
    const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: it.x + 2, y: it.y + 2, width: Math.max(1, it.w - 4), height: Math.max(1, it.h - 4), scale: 1 } });
    const r = await avaliar(async (b64, cor) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; const m = cor.match(/[\d.]+/g).map(Number);
      const lum = (r, gg, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
      const lt = lum(m[0], m[1], m[2]); let pior = 99;
      for (let i = 0; i < d.length; i += 4) { const lb = lum(d[i], d[i + 1], d[i + 2]); const [a, z] = lt > lb ? [lt, lb] : [lb, lt]; pior = Math.min(pior, (a + 0.05) / (z + 0.05)); }
      document.querySelectorAll('[data-medindo]').forEach((e) => { e.style.color = e.dataset.corGuardada; delete e.dataset.medindo; e.querySelectorAll('*').forEach((f) => f.style.removeProperty('visibility')); });
      return +pior.toFixed(2);
    }, shot.data, it.cor);
    const grande = it.tam >= 24 || (it.tam >= 18.66 && it.peso >= 700);
    res.push({ txt: it.txt, pior: r, min: grande ? 3 : 4.5 });
  }
  return res;
}

// ---------- Execução ----------
(async () => {
  if (!EDGE) throw new Error('Edge não encontrado');
  fs.mkdirSync(PNG, { recursive: true });
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let alvo;
  for (let i = 0; i < 60 && !alvo; i++) { await espera(250); try { const l = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json(); alvo = l.find((t) => t.type === 'page'); } catch { /* subindo */ } }
  if (!alvo) throw new Error('Edge não respondeu');
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(p.method + ': ' + d.error.message)) : p.res(d.result); }
    else if (d.method) for (let i = ouvintes.length - 1; i >= 0; i--) if (ouvintes[i].evento === d.method) { ouvintes[i].r(d.params); ouvintes.splice(i, 1); } };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  const relatorio = []; let totalErros = 0;
  try {
    for (const c of CASOS) {
      const mobile = c.w < 700;
      await cdp('Emulation.setDeviceMetricsOverride', { width: c.w, height: c.h, deviceScaleFactor: 1, mobile });
      await cdp('Emulation.setTouchEmulationEnabled', { enabled: mobile });
      await cdp('Emulation.setEmulatedMedia', { features: [
        { name: 'prefers-color-scheme', value: c.tema }, { name: 'prefers-reduced-motion', value: c.reduzido ? 'reduce' : 'no-preference' },
        { name: 'prefers-reduced-transparency', value: c.transp ? 'reduce' : 'no-preference' }, { name: 'prefers-contrast', value: 'no-preference' }] });
      const carregou = quando('Page.loadEventFired');
      await cdp('Page.navigate', { url: url(c.arq, c.qs || '') }); await carregou; await espera(1700);
      if (c.rolar) { await avaliar((y) => { const s = document.querySelector('[data-rolagem]') || document.scrollingElement; s.scrollTop = y; }, c.rolar); await espera(500); }
      const r = { caso: c.nome, erros: [] };
      const errosJs = await avaliar(() => window.__errosJs || []); r.erros.push(...errosJs);
      const m = await avaliar(medirTudo, {}); r.erros.push(...m.erros); r.avisos = m.avisos; r.pares = m.nPares; r.piorTexto = m.pior;
      r.vidro = await medirVidro(m.vidro);
      for (const v of r.vidro) if (v.pior < v.min) r.erros.push(`vidro: "${v.txt}" ${v.pior}:1 < ${v.min} no pior ponto`);
      r.backdrop = await avaliar(() => { const v = [...document.querySelectorAll('.lg, .vidro')].find((x) => x.offsetWidth > 0); return v ? document.documentElement.className + ' | ' + getComputedStyle(v).backdropFilter : ''; });
      r.tons = await avaliar(() => [...document.querySelectorAll('.lg')].filter((x) => x.offsetWidth).map((x) => `${(x.getAttribute('aria-label') || x.className).slice(0, 18)}:${x.dataset.tom || 'tema'}${x.hasAttribute('data-lg-misto') ? '+misto' : ''}(${x.dataset.lgFundo || '-'})`).join(' '));
      if (c.somas) { const s = await avaliar(somasA); r.erros.push(...s.erros); r.somas = `${s.feitas} feitas de ${s.linhas}`; }
      if (c.interacao) {
        const a = await avaliar(concluirEDesfazer); r.erros.push(...a.erros);
        if (!c.semPng) { const shot = await cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(PNG, c.nome + '.png'), Buffer.from(shot.data, 'base64')); r.png = c.nome + '.png'; }
        const d = await avaliar(desfazer, a.antes); r.erros.push(...d.erros); r.interacao = 'concluir → placar, fita, risco, aviso; desfazer → volta';
      }
      if (c.tecladoB) {
        const tecla = async () => { await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await espera(80); };
        await tecla(); const f1 = await avaliar(focoAtual); if (!/Pular/.test(f1.txt)) r.erros.push('1º Tab não foi o "Pular para as fotos": ' + f1.txt);
        await avaliar(() => document.querySelector('.foto:not(.g)').focus()); await tecla(); await espera(300);
        const f2 = await avaliar(() => { const a = document.activeElement; const s = getComputedStyle(a); return { txt: a.getAttribute('aria-label'), outline: s.outlineStyle, larg: parseFloat(s.outlineWidth), leg: +getComputedStyle(a.querySelector('.legenda') || a).opacity, anim: document.getAnimations().length }; });
        if (f2.outline !== 'solid' || f2.larg < 2) r.erros.push('foto com foco sem anel visível: ' + f2.txt);
        if (f2.leg < 1) r.erros.push('foto com foco não mostra a legenda: ' + f2.txt);
        if (f2.anim > 0) r.erros.push('movimento reduzido: ' + f2.anim + ' animações rodando');
        r.teclado = `${f1.txt} → ${f2.txt} (${f2.outline} ${f2.larg}px, legenda ${f2.leg}); animações com redução: ${f2.anim}`;
      }
      if (c.reduzido && !c.tecladoB) { const d = await avaliar(reduzido); r.erros.push(...d.erros); r.reduzido = 'nenhuma transição longa com movimento reduzido'; }
      if (c.teclado) {
        const tecla = async (key, code, vk) => { await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk }); await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk }); await espera(60); };
        await tecla('Tab', 'Tab', 9); const f1 = await avaliar(focoAtual);
        if (!/Pular/.test(f1.txt)) r.erros.push('1º Tab não foi o "Pular para a lista": ' + f1.txt);
        await avaliar(() => document.querySelector('.linha[data-id="t7"] .abrir').focus());
        await tecla('ArrowDown', 'ArrowDown', 40); const f2 = await avaliar(focoAtual);
        if (f2.sel !== 't8') r.erros.push('seta para baixo não selecionou a próxima tarefa: ' + f2.sel);
        if (!f2.anim.includes('vira')) r.erros.push('troca do detalhe sem a transição 3D (vira): ' + f2.anim.join(','));
        const rev = await avaliar(() => document.querySelectorAll('.linhas.revela .linha').length && getComputedStyle(document.querySelector('.linhas.revela .linha')).animationTimeline);
        if (!/view/.test(rev)) r.erros.push('revelação ao rolar sem animation-timeline: view(): ' + rev);
        await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9); const f3 = await avaliar(focoAtual);
        if (f3.outline !== 'solid' || f3.larg < 2) r.erros.push(`anel de foco fraco em ${f3.txt}: ${f3.outline} ${f3.larg}px`);
        r.teclado = [f1, f2, f3].map((f) => `${f.txt} (${f.outline} ${f.larg}px)`).join(' → ');
      }
      if (c.zoom) { const z = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { ...c.zoom, scale: 2 } }); fs.writeFileSync(path.join(PNG, c.nome + '-zoom.png'), Buffer.from(z.data, 'base64')); }
      if (!c.semPng && !c.interacao) { const shot = await cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(PNG, c.nome + '.png'), Buffer.from(shot.data, 'base64')); r.png = c.nome + '.png'; }
      totalErros += r.erros.length; relatorio.push(r);
      console.log(`${r.erros.length ? 'ERRO' : 'ok  '} ${c.nome}: ${r.pares || 0} textos, pior ${r.piorTexto ? r.piorTexto.r + ':1 "' + r.piorTexto.txt + '"' : '-'}` +
        (r.vidro.length ? `; vidro pior ${Math.min(...r.vidro.map((v) => v.pior))}:1` : '') + (r.erros.length ? '\n     ' + r.erros.join('\n     ') : ''));
    }
  } finally { try { ws.close(); } catch { } edge.kill(); }
  if (!MUTAR) fs.writeFileSync(path.join(PNG, `medidas-v2-${qual}.json`), JSON.stringify({ data: new Date().toISOString(), totalErros, relatorio }, null, 2));
  if (MUTAR) { console.log(totalErros ? `mutação PEGA (${totalErros} erro(s)): o verificador falha no caso errado` : 'mutação ESCAPOU'); process.exit(totalErros ? 0 : 1); }
  process.exit(totalErros ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
