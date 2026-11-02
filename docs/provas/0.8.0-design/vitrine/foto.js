// Captura avulsa da vitrine (Edge sem interface, uma aba, windowsHide), para iterar no visual e gerar as imagens de reserva.
// Uso: node foto.js <saida.png> [--w=1440] [--h=900] [--dsf=2] [--tema=light|dark] [--rolar=<px ou expressão>] [--espera=ms]
//      [--qs=?render=heroi&tam=1200x1200&fundo=transparente] [--render] (salva window.__render em vez do print da tela)
//      [--clip=x,y,w,h] [--reduzido] [--info]
'use strict';
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path'); const os = require('os');
const arg = (n, d) => { const a = process.argv.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
const tem = (n) => process.argv.includes('--' + n);
const SAIDA = path.resolve(process.argv[2]);
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORTA = 9800 + (process.pid % 150), PERFIL = path.join(os.tmpdir(), 'vitrine-foto-' + process.pid);
const URL0 = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + arg('qs', '');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, seq = 0; const pend = new Map(); const ouv = [];
const cdp = (method, params = {}) => { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); };
const quando = (ev) => new Promise((r) => ouv.push({ ev, r }));
const avaliar = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };
(async () => {
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  process.on('exit', () => { try { edge.kill(); } catch { /* saiu */ } });
  setTimeout(() => { console.error('tempo esgotado'); process.exit(3); }, 280000).unref();
  let alvo; for (let i = 0; i < 80 && !alvo; i++) { await espera(250); try { alvo = (await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ } }
  if (!alvo) throw new Error('Edge não respondeu');
  ws = new WebSocket(alvo.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(p.method + ': ' + d.error.message)) : p.res(d.result); }
    else if (d.method) { if (d.method === 'Runtime.exceptionThrown') console.log('exceção:', d.params.exceptionDetails.exception?.description?.slice(0, 200)); if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') console.log('console:', d.params.args.map((a) => a.value || a.description).join(' ').slice(0, 200));
      for (let i = ouv.length - 1; i >= 0; i--) if (ouv[i].ev === d.method) { ouv[i].r(d.params); ouv.splice(i, 1); } } };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  const w = +arg('w', 1440), h = +arg('h', 900);
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: +arg('dsf', 2), mobile: w < 700 });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: arg('tema', 'light') }, { name: 'prefers-reduced-motion', value: tem('reduzido') ? 'reduce' : 'no-preference' }] });
  const carregou = quando('Page.loadEventFired'); await cdp('Page.navigate', { url: URL0 }); await carregou;
  const t0 = Date.now(); await avaliar(`new Promise((ok) => { const f = () => (document.documentElement.classList.contains('gl-ativo') || window.__render || (window.__errosJs||[]).length) ? ok() : setTimeout(f, 100); f(); setTimeout(ok, 60000); })`);
  const tGl = Date.now() - t0;
  const rol = arg('rolar', ''); if (rol) { await avaliar(`scrollTo(0, ${isNaN(+rol) ? rol : +rol})`); }
  await espera(+arg('espera', 2500));
  if (tem('info')) console.log(JSON.stringify(await avaliar(`({ gl: document.documentElement.classList.contains('gl-ativo'), erros: window.__errosJs, prog: window.__vitrine && window.__vitrine.progresso(), renderer: (() => { const c = document.createElement('canvas').getContext('webgl2'); const e = c && c.getExtension('WEBGL_debug_renderer_info'); return c ? c.getParameter(e ? e.UNMASKED_RENDERER_WEBGL : c.RENDERER) : 'sem webgl2'; })() })`)), 'tempo até gl-ativo/render', tGl, 'ms');
  if (tem('render')) { const d = await avaliar('window.__render || ""'); if (!d) throw new Error('sem __render'); fs.writeFileSync(SAIDA, Buffer.from(d.split(',')[1], 'base64')); }
  else { const c = arg('clip', ''); const opc = { format: 'png' }; if (c) { const [x, y, cw, ch] = c.split(',').map(Number); opc.clip = { x, y: y + (await avaliar('scrollY')), width: cw, height: ch, scale: 1 }; }
    const s = await cdp('Page.captureScreenshot', opc); fs.writeFileSync(SAIDA, Buffer.from(s.data, 'base64')); }
  console.log('salvo', SAIDA); ws.close(); edge.kill(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(2); });
