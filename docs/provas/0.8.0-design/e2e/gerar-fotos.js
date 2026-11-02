// Gera as "fotos" do caso B uma vez (WebGL pelo fotos-webgl.js, no Edge sem interface) e grava img/foto-<n>.webp, img/capa.webp e
// img/fotos-lum.js (luminância e grade 8 × 8 de cada uma, para a tinta do vidro). Renderizar ao vivo na captura é lento no
// SwiftShader (GPU por software); num navegador com GPU, render-fotos.html renderiza na hora. Uso: node gerar-fotos.js [inicio fim] [--capa]
'use strict';
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path'); const os = require('os');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORTA = 9351, PERFIL = path.join(os.tmpdir(), 'hd103-fotos-perfil'), IMG = path.join(__dirname, 'img');
const NOMES = ['Praia ao nascer do sol', 'Mergulho', 'Trilha', 'Pôr do sol', 'Noite no píer', 'Areia branca', 'Lagoa', 'Fogueira'];
const ini = +(process.argv[2] || 0), fim = +(process.argv[3] || 24), capa = process.argv.includes('--capa');
const so = (process.argv.find((a) => a.startsWith('--so=')) || '').slice(5);   // --so=Mergulho: só as fotos dessa cena
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, seq = 0; const pend = new Map(); const ouv = [];
const cdp = (method, params = {}) => { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); };
const quando = (ev) => new Promise((r) => ouv.push({ ev, r }));
(async () => {
  fs.mkdirSync(IMG, { recursive: true });
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--disable-extensions', '--allow-file-access-from-files',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  process.on('exit', () => { try { edge.kill(); } catch { /* saiu */ } });
  let alvo; for (let i = 0; i < 80 && !alvo; i++) { await espera(250); try { alvo = (await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ } }
  ws = new WebSocket(alvo.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); } else if (d.method) for (let i = ouv.length - 1; i >= 0; i--) if (ouv[i].ev === d.method) { ouv[i].r(d.params); ouv.splice(i, 1); } };
  await cdp('Page.enable');
  const c = quando('Page.loadEventFired'); await cdp('Page.navigate', { url: 'file:///' + path.join(__dirname, 'render-fotos.html').split(path.sep).join('/') }); await c;
  const arqLum = path.join(IMG, 'fotos-lum.js');
  const lum = fs.existsSync(arqLum) ? JSON.parse(fs.readFileSync(arqLum, 'utf8').replace(/^window\.FOTOS_LUM = /, '').replace(/;\s*$/, '')) : {};
  const fazer = async (chave, nome, semente, w, h) => {
    const t0 = Date.now();
    const r = (await cdp('Runtime.evaluate', { expression: `renderizar(${JSON.stringify(nome)}, ${semente}, ${w}, ${h})`, returnByValue: true, awaitPromise: true })).result.value;
    if (!r) throw new Error('sem WebGL');
    fs.writeFileSync(path.join(IMG, chave + '.webp'), Buffer.from(r.webp, 'base64'));
    lum[chave] = { lum: r.lum, grade: r.grade };
    fs.writeFileSync(arqLum, 'window.FOTOS_LUM = ' + JSON.stringify(lum) + ';\n');
    console.log(chave, nome, `${w}x${h}`, ((Date.now() - t0) / 1000).toFixed(1) + ' s', 'lum', r.lum);
  };
  try {
    if (capa) await fazer('capa', 'Pôr do sol', 7, 2880, 1000);
    for (let i = ini; i < fim; i++) if (!so || NOMES[i % 8] === so) await fazer('foto-' + i, NOMES[i % 8], i + 3, 1024, 1024);
  } finally { try { ws.close(); } catch { /* fechado */ } edge.kill(); }
})().catch((e) => { console.error(e); process.exit(2); });
