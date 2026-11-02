#!/usr/bin/env node
// Prova do lote sites-premium, no Edge sem interface (perfil próprio, nada na tela do usuário), pelo protocolo de depuração.
//   node provar.js site      página fictícia: 2 temas × 2 larguras, preferências, sem JS, interações e mutantes
//   node provar.js efeitos   bancada: cada efeito no início, meio, fim e reduzido, com quadros medidos
//   node provar.js quadro    grava conhecimento/design/sites-premium/efeitos/provas.md a partir do resultado.json
// Um Edge por etapa, fechado ao fim dela. Abaixo de 0,6 GB livres, espera até 5 min e tenta 1 vez; se o Edge morrer, para e
// deixa em resultado.json o que já mediu (sem repetir em laço). Termina com uma linha-resumo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { spawn } = require('child_process');

const AQUI = __dirname;
const RAIZ = path.resolve(AQUI, '..', '..', '..');
const PNG = path.join(AQUI, 'png');
const RES = path.join(AQUI, 'resultado.json');
const EDGE = process.env.EDGE_CMD || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const TEMP = process.env.PROVA_TEMP || fs.mkdtempSync(path.join(os.tmpdir(), 'prova-sites-'));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const lerRes = () => { try { return JSON.parse(fs.readFileSync(RES, 'utf8')); } catch (e) { return {}; } };
const gravarRes = (o) => fs.writeFileSync(RES, JSON.stringify({ ...lerRes(), ...o }, null, 1) + '\n');

// ---- Protocolo de depuração ----
async function abrirEdge() {
  const t0 = Date.now();
  while (os.freemem() / 2 ** 30 < 0.6 && Date.now() - t0 < 5 * 60e3) await espera(10000);
  console.log(`Edge: ${(os.freemem() / 2 ** 30).toFixed(2)} GB livres${Date.now() - t0 > 1000 ? `, depois de esperar ${Math.round((Date.now() - t0) / 1000)} s` : ''}`);
  const perfil = fs.mkdtempSync(path.join(TEMP, 'perfil-'));
  const proc = spawn(EDGE, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run', '--disable-extensions', '--disable-background-networking', '--disable-sync', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const arq = path.join(perfil, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(arq); i++) await espera(200);
  const porta = fs.readFileSync(arq, 'utf8').split('\n')[0].trim();
  const lista = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
  const alvo = lista.find((t) => t.type === 'page');
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
  let seq = 0; const pend = new Map(); const erros = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { const { ok, erro } = pend.get(m.id); pend.delete(m.id); if (m.error) erro(new Error(JSON.stringify(m.error))); else ok(m.result); return; }
    if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') erros.push(m.params.entry.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erros.push('console.error');
  };
  // Conexão caiu: falha alto, em vez de deixar a promessa pendente e o Node sair calado com código 0.
  ws.onclose = () => { for (const { erro } of pend.values()) erro(new Error('conexão com o Edge caiu')); pend.clear(); };
  const cdp = (metodo, params = {}) => new Promise((ok, erro) => { const id = ++seq; pend.set(id, { ok, erro }); ws.send(JSON.stringify({ id, method: metodo, params })); });
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
  const ev = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(`${expr.slice(0, 80)}: ${r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text}`); return r.result.value; };
  const fechar = async () => { try { await Promise.race([cdp('Browser.close'), espera(3000)]); } catch (e) { /* já fechou */ } try { ws.close(); } catch (e) { /* idem */ } await espera(500); try { proc.kill(); } catch (e) { /* idem */ } await espera(300); try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) { /* trava de arquivo no Windows */ } };
  const versao = (await cdp('Browser.getVersion')).product;
  return { cdp, ev, erros, fechar, versao };
}
const urlDe = (f) => 'file:///' + f.replace(/\\/g, '/');
async function ir(b, url) { b.erros.length = 0; await b.cdp('Page.navigate', { url }); for (let i = 0; i < 50; i++) { await espera(100); if ((await b.ev('document.readyState').catch(() => '')) === 'complete') return; } }
async function janela(b, largura, altura = 900) { await b.cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 1, mobile: false }); }
async function midia(b, f) { await b.cdp('Emulation.setEmulatedMedia', { media: '', features: f }); }
async function foto(b, clip) {
  const p = clip ? { format: 'png', clip: { ...clip, scale: 1 } } : { format: 'png', captureBeyondViewport: true };
  if (!clip) { const m = await b.cdp('Page.getLayoutMetrics'); const c = m.cssContentSize; p.clip = { x: 0, y: 0, width: c.width, height: c.height, scale: 1 }; }
  return Buffer.from((await b.cdp('Page.captureScreenshot', p)).data, 'base64');
}

// ---- PNG sem biblioteca: o contraste é medido nos pixels reais do fundo, não no valor do CSS ----
function lerPng(buf) {
  let p = 8, w = 0, h = 0, cores = 0; const dados = [];
  while (p < buf.length) {
    const n = buf.readUInt32BE(p), t = buf.toString('latin1', p + 4, p + 8);
    if (t === 'IHDR') { w = buf.readUInt32BE(p + 8); h = buf.readUInt32BE(p + 12); if (buf[p + 16] !== 8 || buf[p + 20] !== 0) throw new Error('PNG não suportado'); cores = { 2: 3, 6: 4 }[buf[p + 17]]; if (!cores) throw new Error('cor não suportada'); }
    if (t === 'IDAT') dados.push(buf.subarray(p + 8, p + 8 + n));
    p += 12 + n;
  }
  const cru = zlib.inflateSync(Buffer.concat(dados)); const lin = w * cores; const px = Buffer.alloc(lin * h);
  for (let y = 0; y < h; y++) {
    const f = cru[y * (lin + 1)], o = y * (lin + 1) + 1, d = y * lin;
    for (let x = 0; x < lin; x++) {
      const a = x >= cores ? px[d + x - cores] : 0, c = y ? px[d - lin + x] : 0, e = x >= cores && y ? px[d - lin + x - cores] : 0, v = cru[o + x];
      let r = v;
      if (f === 1) r = v + a; else if (f === 2) r = v + c; else if (f === 3) r = v + ((a + c) >> 1);
      else if (f === 4) { const k = a + c - e, pa = Math.abs(k - a), pb = Math.abs(k - c), pc = Math.abs(k - e); r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? c : e); }
      px[d + x] = r & 255;
    }
  }
  return { w, h, cores, px };
}
const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const razao = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const TEXTOS = `(function () {
  var s = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    var n = w.currentNode; if (!n.textContent.trim()) continue;
    var e = n.parentElement; if (!e || e.closest('script, style')) continue;
    var dt = e.closest('details:not([open])'); if (dt && !e.closest('summary')) continue;
    var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || !e.getClientRects().length) continue;
    var op = 1, a = e; while (a) { op *= +getComputedStyle(a).opacity; a = a.parentElement; }
    if (op < .05) continue; /* elemento fora de vista de propósito (ex.: botão pulado) não conta */
    var r = document.createRange(); r.selectNodeContents(n);
    var rects = Array.prototype.map.call(r.getClientRects(), function (q) { return { x: q.left + scrollX, y: q.top + scrollY, w: q.width, h: q.height }; }).filter(function (q) { return q.w > 1 && q.h > 1 && q.y > -40; });
    if (!rects.length) continue;
    var m = cs.color.match(/[\\d.]+/g).map(Number);
    s.push({ t: n.textContent.trim().slice(0, 40), cor: m, op: op, px: parseFloat(cs.fontSize), peso: +cs.fontWeight, rects: rects, sel: (e.className && e.className.baseVal === undefined ? e.tagName + '.' + e.className : e.tagName) });
  }
  return s;
})()`;
const SEM_TEXTO = `(function () { var st = document.createElement('style'); st.id = '__semtexto'; st.textContent = '*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; caret-color: transparent !important; }'; document.head.appendChild(st); })()`;

async function medirContraste(b) {
  const itens = await b.ev(TEXTOS);
  await b.ev(SEM_TEXTO); await espera(80);
  const img = lerPng(await foto(b));
  await b.ev(`document.getElementById('__semtexto').remove()`);
  const falhas = []; let pior = 99, medidos = 0;
  for (const it of itens) {
    const a = (it.cor[3] === undefined ? 1 : it.cor[3]) * it.op;
    const grande = it.px >= 24 || (it.px >= 18.66 && it.peso >= 700);
    const lim = grande ? 3 : 4.5; let menor = 99;
    for (const q of it.rects) {
      const x0 = Math.max(0, Math.floor(q.x)), x1 = Math.min(img.w, Math.ceil(q.x + q.w)), y0 = Math.max(0, Math.floor(q.y)), y1 = Math.min(img.h, Math.ceil(q.y + q.h));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const o = (y * img.w + x) * img.cores, r = img.px[o], g = img.px[o + 1], bl = img.px[o + 2];
        const tr = it.cor[0] * a + r * (1 - a), tg = it.cor[1] * a + g * (1 - a), tb = it.cor[2] * a + bl * (1 - a);
        const c = razao(lum(tr, tg, tb), lum(r, g, bl)); if (c < menor) menor = c;
      }
    }
    if (menor === 99) continue;
    medidos++; pior = Math.min(pior, menor);
    if (menor < lim) falhas.push({ texto: it.t, razao: +menor.toFixed(2), minimo: lim, px: it.px, onde: it.sel });
  }
  return { contraste_medidos: medidos, contraste_falhas: falhas.length, contraste_pior: +pior.toFixed(2), detalhe_falhas: falhas.slice(0, 12) };
}

const CHECAGENS = `(function (celular) {
  var r = {};
  r.rolagem_lateral = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  var cortado = [];
  document.querySelectorAll('body *').forEach(function (e) {
    var cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.closest('svg, script, style, .oculto, .pular')) return;
    var q = e.getBoundingClientRect(); if (!q.width || !q.height) return;
    var temTexto = Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    if (temTexto && (q.right > innerWidth + 1 || q.left < -1)) cortado.push(e.tagName + ':' + e.textContent.trim().slice(0, 30));
    if (temTexto && /hidden|clip/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) cortado.push(e.tagName + ':' + e.textContent.trim().slice(0, 30));
    if (temTexto && !e.closest('details:not([open])')) { for (var a = e.parentElement; a && a !== document.body; a = a.parentElement) { var ca = getComputedStyle(a); if (/hidden|clip/.test(ca.overflowY) || /hidden|clip/.test(ca.overflowX)) { var qa = a.getBoundingClientRect(); if (q.bottom > qa.bottom + 1 || q.top < qa.top - 1) { cortado.push('vertical ' + e.tagName + ':' + e.textContent.trim().slice(0, 30)); break; } } } }
  });
  r.texto_cortado = cortado.length; r.detalhe_cortado = cortado.slice(0, 8);
  var pequenos = [];
  if (celular) document.querySelectorAll('a, button, summary, label[for]').forEach(function (e) {
    var cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.pular') || e.closest('details:not([open]) > ul')) return;
    var q = e.getBoundingClientRect(); if (!q.width) return;
    if (q.height < 43.5 || q.width < 43.5) pequenos.push(e.tagName + ':' + e.textContent.trim().slice(0, 24) + ':' + Math.round(q.width) + 'x' + Math.round(q.height));
  });
  /* Texto sobre texto: a medida de contraste esconde o texto para ler o fundo, então não vê isto. */
  var caixas = [], wt = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (wt.nextNode()) {
    var nt = wt.currentNode; if (!nt.textContent.trim()) continue; var pe = nt.parentElement; if (!pe || pe.closest('script, style, .pular') || (pe.closest('details:not([open])') && !pe.closest('summary'))) continue;
    var ce = getComputedStyle(pe); if (ce.visibility === 'hidden' || !pe.getClientRects().length) continue;
    var rg = document.createRange(); rg.selectNodeContents(nt);
    Array.prototype.forEach.call(rg.getClientRects(), function (x) { if (x.width > 1 && x.height > 1) caixas.push({ e: pe, t: nt.textContent.trim().slice(0, 24), l: x.left, r: x.right, a: x.top + 2, b: x.bottom - 2 }); });
  }
  var sobre = [];
  for (var i = 0; i < caixas.length; i++) for (var j = i + 1; j < caixas.length; j++) {
    var u = caixas[i], v = caixas[j]; if (u.e === v.e || u.e.contains(v.e) || v.e.contains(u.e)) continue;
    if (u.l < v.r - 1 && v.l < u.r - 1 && u.a < v.b && v.a < u.b) sobre.push(u.t + ' × ' + v.t);
  }
  r.texto_sobreposto = sobre.length; r.detalhe_sobreposto = sobre.slice(0, 8);
  r.alvos_pequenos = pequenos.length; r.detalhe_alvos = pequenos.slice(0, 8);
  var leg = '.aviso, .unidade, .tabua-topo, .variacao, td, th, .dia, .semana, .m, .rotulos, .selo, .marco, .periodo, .tag, .cenas, .valor, .metrica';
  var corpo = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    var n = w.currentNode; if (!n.textContent.trim()) continue; var e = n.parentElement; if (!e || e.closest('script, style')) continue;
    var cs2 = getComputedStyle(e); if (cs2.display === 'none' || !e.getClientRects().length) continue; var px = parseFloat(cs2.fontSize);
    if (px < 12 || (celular && px < 16 && !e.closest(leg))) corpo.push(e.tagName + '.' + e.className + ':' + px + ':' + n.textContent.trim().slice(0, 24));
  }
  r.corpo_pequeno = corpo.length; r.detalhe_corpo = corpo.slice(0, 8);
  /* Título levado ao topo (âncora): a barra fixa não pode cobri-lo. */
  var cobertos = [], nav = document.querySelector('.nav');
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelectorAll('h2[id]').forEach(function (h) {
    h.scrollIntoView(); var q = h.getBoundingClientRect(), b = nav.getBoundingClientRect();
    var el = document.elementFromPoint(q.left + Math.min(q.width, 40), q.top + q.height / 2);
    if (q.top < b.bottom - 1 || !el || !(h === el || h.contains(el))) cobertos.push(h.id);
  });
  r.titulos_cobertos = cobertos.length; r.detalhe_cobertos = cobertos;
  r.camadas_fixas = Array.prototype.filter.call(document.querySelectorAll('body *'), function (e) { var p = getComputedStyle(e).position; return p === 'fixed' || p === 'sticky'; }).length;
  scrollTo(0, 0); document.documentElement.style.scrollBehavior = '';
  return r;
})`;

const ARQ_SITE = path.join(AQUI, 'site-preamar.html');
// A cena gira sozinha: foto e contraste no meio da troca sairiam com o texto apagado. Parar pelo próprio botão da página.
async function fixarCena(b) { await b.ev(`(function(){var c=document.querySelector('[data-cena="0"]');if(c)c.click()})()`); await espera(450); }
async function capturaSite(b, url, tema, largura, nomePng) {
  await midia(b, [{ name: 'prefers-color-scheme', value: tema === 'escuro' ? 'dark' : 'light' }]);
  await janela(b, largura); await ir(b, url); await espera(1700); await fixarCena(b); // a curva já se desenhou; a cena para na inicial
  const foraDeVista = await b.ev(CHECAGENS + `(${largura < 500})`); await espera(120);
  if (nomePng) fs.writeFileSync(path.join(PNG, nomePng), await foto(b));
  const ct = await medirContraste(b);
  return { png: nomePng, tema, largura, erros_js: b.erros.length, detalhe_erros: [...b.erros], ...foraDeVista, ...ct };
}

async function provarSite() {
  fs.mkdirSync(PNG, { recursive: true });
  const t0 = Date.now(); let b = await abrirEdge(); const url = urlDe(ARQ_SITE);
  const novo = async () => { await b.fechar(); b = await abrirEdge(); };
  const capturas = [];
  for (const tema of ['claro', 'escuro']) for (const l of [1440, 390]) {
    if (capturas.length) await novo();
    const c = await capturaSite(b, url, tema, l, `site-${tema}-${l}.png`); capturas.push(c); gravarRes({ capturas });
    console.log(`${c.png}: js ${c.erros_js}, lateral ${c.rolagem_lateral}, cortado ${c.texto_cortado}, contraste ${c.contraste_falhas}/${c.contraste_medidos} (pior ${c.contraste_pior}), alvos ${c.alvos_pequenos}, corpo ${c.corpo_pequeno}, cobertos ${c.titulos_cobertos}, sobre ${c.texto_sobreposto}, fixas ${c.camadas_fixas}`);
  }
  // Simulação: cicla sozinha, a pausa para, fora da tela para.
  await novo(); await midia(b, []); await janela(b, 1440); await ir(b, url); await espera(400);
  const nome = () => b.ev(`document.getElementById('cena-nome').textContent`);
  const n0 = await nome(); await espera(3600); const n1 = await nome();
  await b.ev(`document.getElementById('pausa').click()`); const n2 = await nome(); await espera(3600); const n3 = await nome();
  await b.ev(`document.getElementById('pausa').click()`); await espera(200);
  await b.ev(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.body.scrollHeight)`); await espera(500); const n4 = await nome(); await espera(3600); const n5 = await nome();
  const simulacao = { ciclou: n0 !== n1, pausa_para: n2 === n3, fora_da_tela_para: n4 === n5 };
  // Interações: cena à mão, período do preço, pergunta, menu do celular, foco no "pular".
  gravarRes({ simulacao }); await novo(); await janela(b, 1440); await ir(b, url); await espera(300);
  await b.ev(`document.querySelector('[data-cena="2"]').click()`); await espera(450);
  const m = await b.ev(`document.getElementById('metrica').getAttribute('aria-label')+'|'+document.getElementById('t-22').textContent`);
  const antesP = await b.ev(`getComputedStyle(document.querySelector('.so-mensal')).display`);
  await b.ev(`document.querySelector('label[for="p-mensal"]').click()`);
  const depoisP = await b.ev(`getComputedStyle(document.querySelector('.so-mensal')).display+'|'+getComputedStyle(document.querySelector('.so-anual')).display`);
  await b.ev(`document.querySelector('details.p summary').click()`);
  const abriu = await b.ev(`document.querySelector('details.p').open && document.querySelector('details.p p').getBoundingClientRect().height > 0`);
  await janela(b, 390); await espera(150);
  await b.ev(`document.querySelector('.menu summary').click()`); await espera(100);
  const menu = await b.ev(`(function(){var u=document.querySelector('.menu ul').getBoundingClientRect();return u.height>100&&u.right<=innerWidth})()`);
  await janela(b, 1440); await ir(b, url); await espera(200);
  await b.cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await b.cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await espera(100);
  const foco = await b.ev(`document.activeElement.className==='pular' && document.activeElement.getBoundingClientRect().top>=0`);
  const interacoes = { cena_a_mao: m === 'R$ 1.012,40|1.012,40', preco_alterna: antesP === 'none' && depoisP.split('|')[0] !== 'none' && depoisP.split('|')[1] === 'none', pergunta_abre: abriu === true, menu_celular: menu === true, pular_recebe_foco: foco === true };
  // Movimento reduzido
  async function reduzMov(u, png) {
    await midia(b, [{ name: 'prefers-reduced-motion', value: 'reduce' }]); await janela(b, 1440); await ir(b, u); await espera(500);
    const ativa = await b.ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`);
    const rod = await b.ev(`document.getAnimations().filter(function(a){return a.playState==='running'}).length`);
    await espera(3400);
    const cena = await b.ev(`(function(){var l=getComputedStyle(document.querySelector('.linha.on'));return document.getElementById('m-i').textContent==='312'&&document.getElementById('cena-nome').textContent==='Como está'&&document.querySelectorAll('#linhas tr').length===4&&parseFloat(l.opacity)===1&&(l.strokeDashoffset==='0px'||l.strokeDashoffset==='0')&&document.getElementById('pausa').hidden})()`);
    if (png) fs.writeFileSync(path.join(PNG, png), await foto(b));
    return { media_ativa: ativa, animacoes_rodando: rod, cena_completa: cena === true, erros_js: b.erros.length };
  }
  gravarRes({ interacoes }); await novo();
  const reduzido_movimento = await reduzMov(url, 'site-movimento-reduzido-1440.png');
  gravarRes({ reduzido_movimento });
  // Transparência reduzida
  async function reduzTransp(u, png) {
    await midia(b, [{ name: 'prefers-reduced-transparency', value: 'reduce' }, { name: 'prefers-color-scheme', value: 'dark' }]); await janela(b, 1440); await ir(b, u); await espera(1700); await fixarCena(b);
    const ativa = await b.ev(`matchMedia('(prefers-reduced-transparency: reduce)').matches`);
    const r = await b.ev(`(function(){var d=0,al=1;document.querySelectorAll('body *').forEach(function(e){if(getComputedStyle(e).backdropFilter!=='none')d++;});document.querySelectorAll('.vidro,.nav').forEach(function(e){var m=getComputedStyle(e).backgroundColor.match(/[\\d.]+/g);al=Math.min(al,m[3]===undefined?1:+m[3]);});return {com_desfoque:d,alfa_minimo:al}})()`);
    if (png) fs.writeFileSync(path.join(PNG, png), await foto(b));
    const ct = await medirContraste(b);
    return { media_ativa: ativa, ...r, contraste_falhas: ct.contraste_falhas, contraste_pior: ct.contraste_pior, detalhe_falhas: ct.detalhe_falhas };
  }
  await novo();
  const reduzido_transparencia = await reduzTransp(url, 'site-transparencia-reduzida-1440.png');
  gravarRes({ reduzido_transparencia });
  // Mais contraste
  await novo();
  await midia(b, [{ name: 'prefers-contrast', value: 'more' }, { name: 'prefers-color-scheme', value: 'light' }]); await janela(b, 1440); await ir(b, url); await espera(1700); await fixarCena(b);
  const mc = await b.ev(`({ativa:matchMedia('(prefers-contrast: more)').matches,desfoque:Array.prototype.filter.call(document.querySelectorAll('.vidro,.nav'),function(e){return getComputedStyle(e).backdropFilter!=='none'}).length})`);
  const ctMais = await medirContraste(b);
  const mais_contraste = { media_ativa: mc.ativa, com_desfoque: mc.desfoque, contraste_falhas: ctMais.contraste_falhas, contraste_pior: ctMais.contraste_pior };
  // Sem JS
  async function semJs(u, png) {
    await midia(b, [{ name: 'prefers-color-scheme', value: 'light' }]); await janela(b, 390);
    await b.cdp('Emulation.setScriptExecutionDisabled', { value: true }); await ir(b, u); await espera(600);
    await b.cdp('Emulation.setScriptExecutionDisabled', { value: false });
    const t = await b.ev(`(function(){var e=document.querySelector('h1');var c=getComputedStyle(e);var l=getComputedStyle(document.querySelector('.linha.on'));var b=document.body.innerText;return {h1:+c.opacity===1,titulos:document.querySelectorAll('h2').length,tem:['312','Cartão vence','maré baixa','Por que é pago','178,80','fictício'].every(function(s){return b.indexOf(s)>=0}),curva:+l.opacity===1,botoes:getComputedStyle(document.getElementById('cenas')).display==='none'}})()`);
    if (png) fs.writeFileSync(path.join(PNG, png), await foto(b));
    return { ...t, texto_completo: t.h1 && t.titulos >= 6 && t.tem && t.curva && t.botoes };
  }
  gravarRes({ mais_contraste }); await novo();
  const sem_js = await semJs(url, 'site-sem-js-390.png');
  gravarRes({ sem_js });

  // Mutantes: cada checagem vista falhando no caso errado.
  const fonte = fs.readFileSync(ARQ_SITE, 'utf8');
  const mutante = (nome, f) => { const p = path.join(TEMP, `m-${nome}.html`); const t = f(fonte); if (t === fonte) throw new Error('mutante igual: ' + nome); fs.writeFileSync(p, t); return urlDe(p); };
  const mutantes = [];
  let c;
  await novo();
  c = await reduzMov(mutante('sem-rm', (t) => t.split('prefers-reduced-motion: reduce').join('max-width: 1px')));
  mutantes.push({ nome: 'sem o ramo de movimento reduzido', pegou: c.animacoes_rodando > 0 || !c.cena_completa || !c.media_ativa });
  gravarRes({ mutantes }); await novo();
  c = await reduzTransp(mutante('sem-rt', (t) => t.split('prefers-reduced-transparency: reduce').join('max-width: 1px')));
  mutantes.push({ nome: 'sem o ramo de transparência reduzida', pegou: c.com_desfoque > 0 || c.alfa_minimo < 0.96 });
  c = await capturaSite(b, mutante('contraste', (t) => t.replace('--texto-2: #47585f', '--texto-2: #aab4b0')), 'claro', 390, null);
  mutantes.push({ nome: 'texto secundário claro demais', pegou: c.contraste_falhas > 0 });
  c = await capturaSite(b, mutante('lateral', (t) => t.replace('<main id="conteudo">', '<main id="conteudo"><div style="width:900px;height:4px"></div>')), 'claro', 390, null);
  mutantes.push({ nome: 'peça mais larga que a tela', pegou: c.rolagem_lateral > 0 });
  c = await capturaSite(b, mutante('js', (t) => t.replace('caixa.hidden = false;', 'caixa.hidden = false; throw new Error("erro de teste");')), 'claro', 390, null);
  mutantes.push({ nome: 'erro de JavaScript', pegou: c.erros_js > 0 });
  c = await capturaSite(b, mutante('alvo', (t) => t.replace('.nav .btn { min-height: 44px; padding: 0 16px; font-size: 15px; }', '.nav .btn { min-height: 28px; padding: 0 16px; font-size: 15px; }')), 'claro', 390, null);
  mutantes.push({ nome: 'ação do cabeçalho pequena no celular', pegou: c.alvos_pequenos > 0 });
  c = await capturaSite(b, mutante('corpo', (t) => t.replace('body { font-size: 16px; }', 'body { font-size: 14px; }')), 'claro', 390, null);
  mutantes.push({ nome: 'corpo pequeno no celular', pegou: c.corpo_pequeno > 0 });
  c = await capturaSite(b, mutante('coberto', (t) => t.replace('scroll-margin-top: 88px;', 'scroll-margin-top: 0;')), 'claro', 1440, null);
  mutantes.push({ nome: 'âncora deixa o título sob a barra', pegou: c.titulos_cobertos > 0 });
  gravarRes({ mutantes }); await novo();
  c = await semJs(mutante('sem-js', (t) => t.replace('h1 { font-size:', 'h1 { opacity: 0; font-size:')));
  mutantes.push({ nome: 'título invisível sem JS', pegou: c.texto_completo === false });
  gravarRes({ mutantes }); await novo();
  c = await capturaSite(b, mutante('rotulo', (t) => t.replace('transform: translate(-50%, 8px); padding: 14px 0 0;', 'transform: translate(-50%, 8px); padding: 120px 0 0;')), 'claro', 1440, null);
  mutantes.push({ nome: 'rótulo cortado na vertical pela seção', pegou: c.texto_cortado > 0 });
  gravarRes({ mutantes }); await novo();
  c = await capturaSite(b, mutante('sobre', (t) => t.replace('.mare { position: relative; margin-top: 16px;', '.mare { position: relative; margin-top: -24px;')), 'claro', 1440, null);
  mutantes.push({ nome: 'rótulo da curva em cima de outro texto', pegou: c.texto_sobreposto > 0 });

  const versao = b.versao; await b.fechar();
  gravarRes({ gerado_em: new Date().toISOString(), navegador: versao, condicao: 'Edge sem interface, uma máquina Windows; imagens renderizadas sem aparelho real', capturas, simulacao, interacoes, reduzido_movimento, reduzido_transparencia, mais_contraste, sem_js, mutantes });
  const ruins = capturas.filter((x) => x.erros_js || x.rolagem_lateral || x.texto_cortado || x.contraste_falhas || x.alvos_pequenos || x.corpo_pequeno || x.titulos_cobertos || x.texto_sobreposto).length;
  console.log(JSON.stringify({ simulacao, interacoes, reduzido_movimento, reduzido_transparencia: { ...reduzido_transparencia, detalhe_falhas: reduzido_transparencia.detalhe_falhas.slice(0, 3) }, mais_contraste, sem_js, mutantes }));
  for (const x of capturas) for (const k of ['detalhe_falhas', 'detalhe_cortado', 'detalhe_alvos', 'detalhe_corpo', 'detalhe_cobertos', 'detalhe_erros', 'detalhe_sobreposto']) if (x[k] && x[k].length) console.log(x.png, k, JSON.stringify(x[k]));
  console.log(`RESUMO site: ${capturas.length} capturas, ${ruins} com problema, ${mutantes.filter((m) => m.pegou).length}/${mutantes.length} mutantes pegos, ${Math.round((Date.now() - t0) / 1000)} s`);
}

// ---- Bancada de efeitos ----
async function mouse(b, x, y) { await b.cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); }
async function varrer(b, c, ms) { const n = Math.max(6, Math.round(ms / 40)); for (let i = 0; i <= n; i++) { const k = i / n; await mouse(b, c.l + 20 + k * (c.w - 40), c.t + 20 + (Math.sin(k * 6) * .5 + .5) * (c.h - 40)); await espera(ms / n); } }
async function clicar(b, id) { const c = await b.ev(`bancada.centro(${JSON.stringify(id)}, '[data-gatilho]')`); await b.cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y }); await b.cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }); await b.cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }); }
const clipDe = (c) => ({ x: Math.max(0, c.l - 2), y: Math.max(0, c.t - 2), width: c.w + 4, height: c.h + 4 });
async function interagir(b, e, ms) {
  if (e.tipo === 'hover') { const c = await b.ev(`bancada.centro(${JSON.stringify(e.id)})`); await varrer(b, c, ms); await mouse(b, c.x, c.y); }
  else if (e.tipo === 'rolagem') await b.ev(`bancada.rolar(${JSON.stringify(e.id)}, ${ms})`);
  else if (e.tipo === 'clique') await clicar(b, e.id);
}
async function provarEfeitos() {
  fs.mkdirSync(PNG, { recursive: true });
  const t0 = Date.now(); let b = await abrirEdge(); const url = urlDe(path.join(AQUI, 'bancada-efeitos.html'));
  const preparar = async (fm, freio) => { await janela(b, 390, 844); await midia(b, fm); await ir(b, url); if (freio) await b.cdp('Emulation.setCPUThrottlingRate', { rate: 4 }); };
  let usados = 0;
  const talvezNovo = async (fm, freio) => { if (++usados > 8) { usados = 1; await b.fechar(); b = await abrirEdge(); await preparar(fm, freio); await espera(500); } };
  await janela(b, 390, 844); await midia(b, []); await ir(b, url);
  const lista = await b.ev('bancada.ids()');
  const saida = []; const quadros = {};
  // 1ª passada: movimento normal, sem freio de CPU, com capturas.
  for (const e of lista) {
    await talvezNovo([], false);
    const j = JSON.stringify(e.id);
    await mouse(b, 2, 840); await b.ev(`bancada.ativar(${j})`); await espera(30);
    const c = await b.ev(`bancada.centro(${j})`); const clip = clipDe(c);
    const r = { ...e, tipo: e.tipo };
    const a = await foto(b, clip);
    let m, f;
    if (e.tipo === 'estatico') {
      await espera(120); f = await foto(b, clip);
      await b.ev(`bancada.sem(${j})`); await espera(80); const sem = await foto(b, clip);
      r.mexeu = !f.equals(sem); m = sem; quadros[e.id] = { inicio: f, meio: f, fim: sem };
    } else {
      const meioMs = Math.round(e.t / 2);
      if (e.tipo === 'clique') { await clicar(b, e.id); await espera(Math.min(meioMs, 160)); m = await foto(b, clip); await espera(e.t); f = await foto(b, clip); }
      else if (e.tipo === 'hover') { await varrer(b, c, meioMs); m = await foto(b, clip); await varrer(b, c, meioMs); await mouse(b, c.x, c.y); await espera(200); f = await foto(b, clip); }
      else if (e.tipo === 'rolagem') { const p = b.ev(`bancada.rolar(${j}, ${e.t})`); await espera(meioMs); m = await foto(b, clip); await p; await espera(800); f = await foto(b, clip); }
      else { await espera(e.id === 'C4' || e.id === 'D2' || e.id === 'D6' ? 90 : meioMs); m = await foto(b, clip); await espera(meioMs); f = await foto(b, clip); }
      r.mexeu = !a.equals(m) || !m.equals(f) || !a.equals(f);
      quadros[e.id] = { inicio: a, meio: m, fim: f };
    }
    r.texto_invisivel_no_fim = await b.ev(`bancada.texto(${j})`);
    r.erros_js = b.erros.length;
    if (e.pausa) {
      await b.ev(`bancada.ativar(${j})`); await espera(100);
      await b.ev(`document.getElementById(${j}).querySelector('[data-botao-pausa]').click()`); await espera(450);
      const p1 = await foto(b, clip); await espera(Math.max(e.t, 2200)); const p2 = await foto(b, clip);
      r.pausa_ok = p1.equals(p2);
    }
    saida.push(r);
  }
  // 2ª passada: quadros, com a CPU freada 4× e largura de celular.
  await b.cdp('Emulation.setCPUThrottlingRate', { rate: 4 }); usados = 0;
  for (const r of saida) {
    await talvezNovo([], true);
    const j = JSON.stringify(r.id);
    await mouse(b, 2, 840); await b.ev(`bancada.ativar(${j})`); await espera(60);
    if (r.tipo === 'estatico') { const q = await b.ev('bancada.medir(1000)'); r.quadros = q.quadros; r.p95_ms = +q.p95.toFixed(1); r.quadros_longos = q.longos; r.props = []; continue; }
    const pm = b.ev('bancada.medir(1500)');
    await interagir(b, r, 1200);
    const pp = await b.ev('bancada.props()');
    const q = await pm;
    r.quadros = q.quadros; r.p95_ms = +q.p95.toFixed(1); r.quadros_longos = q.longos; r.props = pp;
  }
  await b.cdp('Emulation.setCPUThrottlingRate', { rate: 1 });
  // 3ª passada: movimento reduzido.
  const FM = [{ name: 'prefers-reduced-motion', value: 'reduce' }];
  await midia(b, FM); await ir(b, url); usados = 0;
  for (const r of saida) {
    await talvezNovo(FM, false);
    const j = JSON.stringify(r.id);
    await mouse(b, 2, 840); await b.ev(`bancada.ativar(${j})`); await espera(60);
    const c = await b.ev(`bancada.centro(${j})`); const clip = clipDe(c);
    await interagir(b, r, 400);
    await espera(600); const f1 = await foto(b, clip); await espera(450); const f2 = await foto(b, clip);
    const rod = await b.ev('bancada.rodando()');
    const txt = await b.ev(`bancada.texto(${j})`);
    r.reduzido_ok = f1.equals(f2) && rod === 0 && txt === 0; r.reduzido_rodando = rod; r.reduzido_texto_invisivel = txt;
    quadros[r.id].reduzido = f2;
    r.provado = !!(r.mexeu && r.reduzido_ok && r.p95_ms > 0 && r.p95_ms <= 34 && r.erros_js === 0 && r.texto_invisivel_no_fim === 0 && (!r.pausa || r.pausa_ok));
    delete r.t;
  }
  // Folha de contato para conferir a olho: início, meio, fim, reduzido.
  const b64 = (buf) => 'data:image/png;base64,' + buf.toString('base64');
  const lin1 = saida.map((r) => `<tr><td>${r.id}<br>${r.nome}<br>p95 ${r.p95_ms} ms<br>${r.provado ? 'PROVADO' : 'não provado'}</td>${['inicio', 'meio', 'fim', 'reduzido'].map((k) => `<td><img width="182" src="${b64(quadros[r.id][k])}"></td>`).join('')}</tr>`).join('');
  const folha = path.join(TEMP, 'folha.html');
  fs.writeFileSync(folha, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;color:#123;font:12px Segoe UI}td{padding:3px;vertical-align:top;width:190px}th{text-align:left}</style><table><tr><th>efeito</th><th>início</th><th>meio</th><th>fim (estático: sem o efeito)</th><th>reduzido</th></tr>${lin1}</table>`);
  await b.fechar(); b = await abrirEdge();
  await midia(b, []); await janela(b, 1000, 900); await ir(b, urlDe(folha)); await espera(800);
  fs.writeFileSync(path.join(PNG, 'bancada-efeitos.png'), await foto(b));
  const versao = b.versao; await b.fechar();
  // Controles: a medida de quadros, o "mexeu" e o "reduzido" têm de falhar no caso errado.
  await b.fechar(); b = await abrirEdge();
  const controles = [];
  await janela(b, 390, 844); await midia(b, []); await ir(b, url);
  await b.ev(`window.__voltas=(function(){var n=0,t=performance.now();while(performance.now()-t<12){n++}return n})()`);
  await b.cdp('Emulation.setCPUThrottlingRate', { rate: 4 });
  await b.ev(`bancada.ativar('A3'); (function q(){var x=0;for(var i=0;i<__voltas;i++){x+=performance.now()}requestAnimationFrame(q)})()`);
  const qc = await b.ev('bancada.medir(1500)');
  controles.push({ nome: 'carga de 12 ms por quadro (medida sem freio) na linha principal: só passa de 34 ms se a CPU estiver freada', p95_ms: +qc.p95.toFixed(1), pegou: qc.p95 > 34 });
  await b.fechar(); b = await abrirEdge();
  await janela(b, 390, 844); await midia(b, []); await ir(b, url); await b.cdp('Emulation.setCPUThrottlingRate', { rate: 4 });
  await b.ev(`(function(){var d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:linear-gradient(#2a7388,#7a3b2a)';document.body.appendChild(d);d.animate([{filter:'blur(0px)'},{filter:'blur(40px)'}],{duration:800,iterations:Infinity,direction:'alternate'})})()`);
  const qb = await b.ev('bancada.medir(1500)');
  controles.push({ nome: 'desfoque de 40 px animado na tela inteira (só informativo: mostra se a medida enxerga custo de pintura)', p95_ms: +qb.p95.toFixed(1), informativo: true, pegou: qb.p95 > 34 });
  await b.fechar(); b = await abrirEdge();
  const fonteB = fs.readFileSync(path.join(AQUI, 'bancada-efeitos.html'), 'utf8');
  const mB = path.join(TEMP, 'b-sem-rm.html'); fs.writeFileSync(mB, fonteB.replace('@media (prefers-reduced-motion: reduce) {', '@media (max-width: 1px) {').split("matchMedia('(prefers-reduced-motion: reduce)')").join("matchMedia('(max-width: 1px)')"));
  await janela(b, 390, 844); await midia(b, FM); await ir(b, urlDe(mB));
  await b.ev("bancada.ativar('E1')"); await espera(300);
  const ce = await b.ev("bancada.centro('E1')");
  const r1 = await foto(b, clipDe(ce)); await espera(600); const r2 = await foto(b, clipDe(ce)); const rr = await b.ev('bancada.rodando()');
  controles.push({ nome: 'marquee sem o ramo de movimento reduzido', pegou: !(r1.equals(r2) && rr === 0) });
  const mC = path.join(TEMP, 'b-parado.html'); fs.writeFileSync(mC, fonteB.replace('animation: anda 30s linear infinite;', ''));
  await midia(b, []); await ir(b, urlDe(mC));
  await b.ev("bancada.ativar('E1')"); await espera(100);
  const a1 = await foto(b, clipDe(ce)); await espera(1000); const a2 = await foto(b, clipDe(ce));
  controles.push({ nome: 'marquee sem a animação (o "mexeu" tem de dar falso)', pegou: a1.equals(a2) });
  console.log(JSON.stringify(controles));
  gravarRes({ efeitos: saida, efeitos_controles: controles, efeitos_condicao: `${versao}, sem interface, 390 px, CPU freada 4×; quadros por requestAnimationFrame em 1,5 s. Sem aparelho real.` });
  const ruins = saida.filter((r) => !r.provado);
  for (const r of ruins) console.log('NÃO PROVADO', r.id, r.nome, JSON.stringify({ mexeu: r.mexeu, red: r.reduzido_ok, rod: r.reduzido_rodando, txtR: r.reduzido_texto_invisivel, txt: r.texto_invisivel_no_fim, p95: r.p95_ms, js: r.erros_js, pausa: r.pausa_ok }));
  console.log(`RESUMO efeitos: ${saida.length} efeitos, ${saida.length - ruins.length} provados, ${ruins.length} não, ${Math.round((Date.now() - t0) / 1000)} s`);
}

// ---- Quadro de provas ----
function gravarQuadro() {
  const res = lerRes(); const e = res.efeitos || [];
  const IDS = [...'ABCDEF'].flatMap((g) => Array.from({ length: { A: 7, B: 7, C: 6, D: 6, E: 5, F: 8 }[g] }, (_, i) => g + (i + 1)));
  const linhas = IDS.map((id) => {
    const r = e.find((x) => x.id === id);
    if (!r || !r.provado) return `| ${id} | ${r ? r.nome : '—'} | [ESTIMATIVA: não provado na bancada] | ${r ? r.valor : '—'} | ${r ? r.p95_ms + ' ms' : '—'} | ${r && r.reduzido_ok ? 'sim' : 'não'} | ${r && r.props && r.props.length ? r.props.join(', ') : '—'} |`;
    return `| ${id} | ${r.nome} | PROVADO | ${r.valor} | ${r.p95_ms} ms | sim | ${r.props && r.props.length ? r.props.join(', ') : 'sem animação'} |`;
  }).join('\n');
  const provados = e.filter((x) => x.provado).length;
  const txt = `<!-- Texto próprio do agentes-ultimate. Gerado por docs/provas/0.8.0-sites/provar.js a partir de resultado.json. -->
<!-- ref: tema=efeitos-provados; palavras=prova dos efeitos, efeito provado, quadros do efeito, efeito pesa; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=este efeito pesa, qual a prova dos efeitos | mostre o efeito provado e os quadros do efeito; nao=calcule o custo médio ponderado do estoque -->
# Efeitos: o que foi provado, com que valor

${provados} de ${IDS.length} efeitos passaram na bancada (\`docs/provas/0.8.0-sites/bancada-efeitos.html\`; folha de contato em \`png/bancada-efeitos.png\`).
**Condição:** ${res.efeitos_condicao || 'sem medição'}

**PROVADO quer dizer:** com o valor da coluna, em código próprio, o efeito apareceu ou mexeu, ficou parado e legível com
\`prefers-reduced-motion\`, teve pausa quando o catálogo exige, 0 erro de JS e p95 do quadro até 34 ms na condição acima.
**Controles:** ${(res.efeitos_controles || []).map((c) => `${c.nome}: ${c.p95_ms !== undefined ? c.p95_ms + ' ms, ' : ''}${c.informativo ? (c.pegou ? 'a medida subiu' : 'a medida não subiu: custo de pintura não aparece aqui') : (c.pegou ? 'pegou' : 'NÃO pegou')}`).join('; ') || '—'}.
**Não prova:** aparelho real, GPU, bateria, nem o restante da faixa do catálogo, que continua [ESTIMATIVA: ponto de partida
nosso]. Quadro por \`requestAnimationFrame\` sobe com carga na linha principal; com pintura cara, o controle de desfoque variou entre rodadas (49,9 e 16,8 ms), então **custo de pintura e de compositor não está medido**: vidro, aurora e sombra precisam de aparelho real. Teclado e leitor de tela: só o
que está na página de prova (\`site-preamar.html\`), não em cada efeito. Os avançados do grupo G não foram construídos.

| Efeito | Nome | Situação | Valor usado | p95 do quadro | Reduzido testado | Propriedades animadas |
|---|---|---|---|---|---|---|
${linhas}
`;
  const f = path.join(RAIZ, 'conhecimento', 'design', 'sites-premium', 'efeitos', 'provas.md');
  fs.writeFileSync(f, txt);
  console.log(`RESUMO quadro: ${IDS.length} efeitos, ${provados} provados → ${f}`);
}

const cmd = process.argv[2];
(async () => {
  if (cmd === 'site') await provarSite();
  else if (cmd === 'efeitos') await provarEfeitos();
  else if (cmd === 'quadro') gravarQuadro();
  else { console.error('uso: node provar.js site|efeitos|quadro'); process.exit(2); }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
