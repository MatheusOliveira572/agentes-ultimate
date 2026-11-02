#!/usr/bin/env node
// Modelo do agentes-ultimate (texto próprio, a partir das provas hd102 e hd103 em docs/provas/0.8.0-design/: vitrine/tiras.js e
// e2e/tiras-v2.js). Tiras de quadros (filmstrips) determinísticas das transições: o relógio é nosso, não o da máquina.
//   - CSS, transições, Web Animations e View Transitions: depois do gatilho, todas as animações da linha do tempo do documento
//     são pausadas e postas em currentTime = t (as de rolagem ficam de fora: não aceitam tempo absoluto);
//   - WebGL ou mola em JS: a página expõe um gancho que avança a mola por passo fixo (ex.: window.__prova.avancar(50)).
// Capturas a 2× (deviceScaleFactor 2), Edge ou Chrome sem interface, perfil próprio, nada na tela do usuário (windowsHide).
// Também mede a curva: posição por quadro → passo; reprova salto no 1º quadro, parada seca no fim e recuo fora do desenho.
//
// Uso: node <plugin>/modelos/tiras/tiras.js <roteiro.js> [nome da tira | tudo]
// O roteiro exporta { saida: '<pasta dos PNGs>', tiras: { nome: async (t) => { ... } } }; veja exemplo/roteiro.js e LEIA-ME.md.
// Linha final: RESUMO (tiras, quadros, curvas reprovadas, tempo). Sai 1 se alguma curva reprovar, 2 se não rodar.
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Análise da curva. xs = posição em cada quadro (qualquer unidade, no sentido do movimento).
// Limites [HIPÓTESE] das provas (sem fonte aberta): o 1º passo não pode ser o maior; o último passo ≤ 8% do maior; recuo ≤ 1%
// do percurso; nenhum quadro leva mais de 50% do percurso (degrau: corte seco ou steps()). Mola com quique passa do alvo de
// propósito: use recuoMax ≥ o "passa" da mola (modelos/mola-linear.js). Ponha a posição de antes do gatilho no 1º quadro.
function curva(xs, limites = {}) {
  const ultimoMax = limites.ultimoMax == null ? 0.08 : limites.ultimoMax;
  const recuoMax = limites.recuoMax == null ? 0.01 : limites.recuoMax;
  const degrauMax = limites.degrauMax == null ? 0.5 : limites.degrauMax;
  const v = xs.slice(1).map((x, i) => x - xs[i]);
  const tot = xs[xs.length - 1] - xs[0];
  const vmax = Math.max(...v.map(Math.abs));
  const erros = [];
  if (v.length > 3 && Math.abs(v[0]) >= vmax - 1e-9) erros.push('salto no 1º quadro');
  if (Math.abs(v[v.length - 1]) > ultimoMax * vmax) erros.push('parada seca no fim');
  if (v.some((d) => Math.sign(d) !== Math.sign(tot) && Math.abs(d) > recuoMax * Math.abs(tot))) erros.push('recuo');
  if (v.some((d) => Math.abs(d) > degrauMax * Math.abs(tot))) erros.push('degrau (um quadro leva mais de ' + Math.round(degrauMax * 100) + '% do percurso)');
  return { erros, passos: v.map((d) => +(d / (tot || 1)).toFixed(3)) };
}

function navegador() {
  return [process.env.AGENTES_ULTIMATE_NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find((c) => fs.existsSync(c));
}

// Abre o navegador e devolve a API que o roteiro usa.
async function sessao(opcoes = {}) {
  const nav = navegador();
  if (!nav) throw new Error('sem Edge ou Chrome (defina AGENTES_ULTIMATE_NAVEGADOR)');
  const porta = opcoes.porta || 9400 + (process.pid % 300);
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'au-tiras-'));
  const proc = spawn(nav, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files',
    '--enable-unsafe-swiftshader', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let alvo;
  for (let i = 0; i < 80 && !alvo; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json()).find((x) => x.type === 'page'); } catch (e) { /* subindo */ }
  }
  if (!alvo) { try { proc.kill(); } catch (e) { /* */ } throw new Error('o navegador não abriu a porta de depuração'); }
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let seq = 0; const pend = new Map(); const ouv = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); if (d.error) p.rej(new Error(p.method + ': ' + d.error.message)); else p.res(d.result); }
    else if (d.method) for (let i = ouv.length - 1; i >= 0; i--) if (ouv[i].ev === d.method) { ouv[i].r(d.params); ouv.splice(i, 1); }
  };
  ws.onclose = () => { for (const p of pend.values()) p.rej(new Error('conexão fechada')); pend.clear(); };
  const cdp = (method, params = {}) => { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); };
  const quando = (ev) => new Promise((r) => ouv.push({ ev, r }));
  await cdp('Page.enable'); await cdp('Runtime.enable');
  const av = async (expr) => {
    const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
    return r.result.value;
  };
  const api = {
    av, cdp,
    espera: (ms) => new Promise((r) => setTimeout(r, ms)),
    // Abre a página a 2× (padrão), no tema pedido e com movimento normal (a tira é do movimento; o reduzido se prova à parte).
    async abrir(url, o = {}) {
      await cdp('Emulation.setDeviceMetricsOverride', { width: o.largura || 1440, height: o.altura || 900, deviceScaleFactor: o.escala || 2, mobile: false });
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: o.tema || 'light' }, { name: 'prefers-reduced-motion', value: o.reduzido ? 'reduce' : 'no-preference' }] });
      const c = quando('Page.loadEventFired');
      await cdp('Page.navigate', { url: /^[a-z]+:/i.test(url) ? url : 'file:///' + path.resolve(url).replace(/\\/g, '/') });
      await c;
      if (o.pronto) await av(`new Promise((ok) => { const f = () => (${o.pronto}) ? ok() : setTimeout(f, 100); f(); setTimeout(ok, ${o.esperaMax || 25000}); })`);
    },
    // Pausa as animações da linha do tempo do documento e põe todas em t ms desde o gatilho. Devolve quantas.
    congelar: (t) => av(`(() => { const as = document.getAnimations().filter((a) => !a.timeline || a.timeline instanceof DocumentTimeline);
      as.forEach((a) => { a.pause(); a.currentTime = ${+t}; }); return as.length; })()`),
    // Recorte em coordenadas da PÁGINA (some scrollX/scrollY); escala do recorte (1 = tamanho da captura a 2×).
    quadro: async (clip, escala = 1) => (await cdp('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: escala } })).data,
    // Junta os quadros numa grade, com o rótulo (ex.: "120 ms") embaixo de cada um, e grava <saida>/<nome>.png.
    async montar(arquivo, quadros, rotulos, colunas = 4, cores = {}) {
      const fundo = cores.fundo || '#e9e8e4', texto = cores.texto || '#1d1d1f';
      const b64 = await av(`(async () => { const qs = ${JSON.stringify(quadros)}, rs = ${JSON.stringify(rotulos)}, col = ${+colunas};
        const imgs = await Promise.all(qs.map((q) => { const i = new Image(); i.src = 'data:image/png;base64,' + q; return i.decode().then(() => i); }));
        const w = imgs[0].width, h = imgs[0].height, m = 24, lab = 52, lin = Math.ceil(imgs.length / col);
        const c = document.createElement('canvas'); c.width = col * w + (col + 1) * m; c.height = lin * (h + lab) + (lin + 1) * m;
        const g = c.getContext('2d'); g.fillStyle = ${JSON.stringify(fundo)}; g.fillRect(0, 0, c.width, c.height);
        imgs.forEach((im, k) => { const x = m + (k % col) * (w + m), y = m + Math.floor(k / col) * (h + lab + m); g.drawImage(im, x, y);
          g.fillStyle = ${JSON.stringify(texto)}; g.font = '600 30px Segoe UI, sans-serif'; g.fillText(rs[k], x + 4, y + h + 38); });
        return c.toDataURL('image/png').split(',')[1]; })()`);
      fs.mkdirSync(path.dirname(arquivo), { recursive: true });
      fs.writeFileSync(arquivo, Buffer.from(b64, 'base64'));
      return arquivo;
    },
    curva,
    fechar() { try { ws.close(); } catch (e) { /* */ } try { proc.kill(); } catch (e) { /* */ } setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) { /* */ } }, 500); },
  };
  return api;
}

module.exports = { curva, sessao };

if (require.main === module) {
  const [roteiroArq, qual = 'tudo'] = process.argv.slice(2);
  if (!roteiroArq) { console.log('Uso: node tiras.js <roteiro.js> [nome | tudo]'); process.exit(2); }
  const t0 = Date.now();
  (async () => {
    const roteiro = require(path.resolve(roteiroArq));
    const saida = path.resolve(path.dirname(path.resolve(roteiroArq)), roteiro.saida || '.');
    const t = await sessao(roteiro.opcoes || {});
    const relatorio = {}; let tiras = 0, quadros = 0, reprovadas = 0;
    // O roteiro devolve { quadros, rotulos, colunas?, cores?, posicoes?, limites? }; a tira e a curva saem daqui.
    try {
      for (const [nome, f] of Object.entries(roteiro.tiras)) {
        if (qual !== 'tudo' && qual !== nome) continue;
        const r = await f(t);
        await t.montar(path.join(saida, nome + '.png'), r.quadros, r.rotulos, r.colunas, r.cores);
        tiras++; quadros += r.quadros.length;
        const c = r.posicoes ? curva(r.posicoes, r.limites) : null;
        if (c && c.erros.length) reprovadas++;
        relatorio[nome] = { quadros: r.quadros.length, ...(c ? { posicoes: r.posicoes.map((x) => +(+x).toFixed(3)), ...c } : {}) };
        console.log(`tira ${nome}.png: ${r.quadros.length} quadros${c ? ', curva ' + (c.erros.join(', ') || 'ok') : ''}`);
      }
    } finally { t.fechar(); }
    fs.writeFileSync(path.join(saida, 'tiras-medidas.json'), JSON.stringify({ data: new Date().toISOString(), reprovadas, relatorio }, null, 2));
    console.log(`RESUMO tiras: ${tiras} tira(s), ${quadros} quadros, ${reprovadas} curva(s) reprovada(s), ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    setTimeout(() => process.exit(reprovadas ? 1 : 0), 700);
  })().catch((e) => { console.log('RESUMO tiras: não rodou (' + e.message + ')'); process.exit(2); });
}
