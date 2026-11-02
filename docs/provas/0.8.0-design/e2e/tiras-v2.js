// Tiras de quadros determinísticas das transições dos casos A e B (hd103). O relógio é nosso: depois do gatilho, todas as
// animações da página (CSS, transições, Web Animations e View Transitions) são pausadas e postas em currentTime = t; a
// captura de cada quadro é feita a 2×. Também mede a continuidade numérica (interrupção sem salto).
// Edge sem interface, uma aba, windowsHide. Uso: node tiras-v2.js [a-ficha|a-concluir|a-interrupcao|b-abrir|b-fechar|tudo]
'use strict';
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path'); const os = require('os');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORTA = 9349, PERFIL = path.join(os.tmpdir(), 'hd103-tiras-perfil'), PNG = path.join(__dirname, 'png');
const qual = process.argv[2] || 'tudo';
const url = (arq) => 'file:///' + path.join(__dirname, arq).replace(/\\/g, '/');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, seq = 0; const pend = new Map(); const ouv = [];
const cdp = (method, params = {}) => { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); };
const quando = (ev) => new Promise((r) => ouv.push({ ev, r }));
const av = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

async function abrir(arq, tema, w = 1440, h = 900) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: false });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: tema }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
  const c = quando('Page.loadEventFired'); await cdp('Page.navigate', { url: url(arq) }); await c;
  await av('new Promise((r) => { const ok = () => (window.__pronto === undefined || window.__pronto) ? r() : setTimeout(ok, 100); setTimeout(ok, 2300); })');
}
// pausa tudo o que estiver rodando e põe em t (ms desde o gatilho)
const congelar = (t) => av(`(() => { const as = document.getAnimations().filter((a) => !(a.timeline && a.timeline.constructor.name !== "DocumentTimeline")); as.forEach((a) => { a.pause(); a.currentTime = ${t}; }); return as.length; })()`);
async function quadro(clip, escala) { const s = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: escala } }); return s.data; }
// monta a tira numa grade, com o tempo de cada quadro escrito embaixo
async function montar(nome, quadros, rotulos, colunas, tema) {
  const b64 = await av(`(async () => { const qs = ${JSON.stringify(quadros)}; const rs = ${JSON.stringify(rotulos)};
    const imgs = await Promise.all(qs.map((q) => { const i = new Image(); i.src = 'data:image/png;base64,' + q; return i.decode().then(() => i); }));
    const w = imgs[0].width, h = imgs[0].height, m = 24, lab = 52, col = ${colunas}, lin = Math.ceil(imgs.length / col);
    const c = document.createElement('canvas'); c.width = col * w + (col + 1) * m; c.height = lin * (h + lab) + (lin + 1) * m; const g = c.getContext('2d');
    g.fillStyle = '${tema === 'dark' ? '#0d0c0b' : '#e9e4da'}'; g.fillRect(0, 0, c.width, c.height);
    imgs.forEach((im, k) => { const x = m + (k % col) * (w + m), y = m + Math.floor(k / col) * (h + lab + m); g.drawImage(im, x, y);
      g.fillStyle = '${tema === 'dark' ? '#f1e8da' : '#1c1915'}'; g.font = '600 30px Segoe UI, sans-serif'; g.fillText(rs[k], x + 4, y + h + 38); });
    return c.toDataURL('image/png').split(',')[1]; })()`);
  fs.writeFileSync(path.join(PNG, nome + '.png'), Buffer.from(b64, 'base64'));
  console.log('tira', nome + '.png', quadros.length, 'quadros');
}

const TIRAS = {
  // A: lista → ficha. O título da tarefa viaja da linha para a ficha e o marca-texto escorrega (View Transition).
  async 'a-ficha'() {
    await abrir('caso-a-depois-v2.html', 'light');
    await av(`(async () => { document.querySelector('.linha[data-id="t8"] .abrir').click(); await window.__vt.ready; })()`);
    const ts = [0, 70, 140, 220, 320, 450, 600, 760], qs = [];
    for (const t of ts) { await congelar(t); await espera(40); qs.push(await quadro({ x: 244, y: 0, width: 1196, height: 900 }, 0.4)); }
    await montar('tira-a-lista-ficha-claro', qs, ts.map((t) => t + ' ms'), 4, 'light');
  },
  // A: concluir. Visto de caneta que se desenha, casinha que salta (mola pico), risco, placar que rola, casa da fita que assenta.
  async 'a-concluir'() {
    await abrir('caso-a-depois-v2.html', 'light');
    await av(`document.querySelector('.linha[data-id="t8"] .marcar').click()`);
    const ts = [0, 40, 90, 150, 230, 340, 500, 900], qs = [];
    for (const t of ts) { await congelar(t); await espera(40); qs.push(await quadro({ x: 268, y: 60, width: 700, height: 760 }, 0.6)); }
    await montar('tira-a-concluir-claro', qs, ts.map((t) => t + ' ms'), 8, 'light');
  },
  // A: interrupção. Concluir e, aos 120 ms, desfazer: o risco e o visto voltam do ponto em que estavam, sem salto.
  async 'a-interrupcao'() {
    await abrir('caso-a-depois-v2.html', 'dark');
    const ler = `(() => { const l = document.querySelector('.linha[data-id="t8"]'); const m = getComputedStyle(l.querySelector('.titulo'), '::after').transform.match(/matrix\\(([^)]*)\\)/);
      const v = m ? m[1].split(',').map(Number) : [0, 0]; return { risco: +Math.hypot(v[0], v[1]).toFixed(3), visto: +(+getComputedStyle(l.querySelector('.circulo path')).strokeDashoffset.replace('px', '')).toFixed(3) }; })()`;
    await av(`document.querySelector('.linha[data-id="t8"] .marcar').click()`);
    await congelar(160); const antes = await av(ler);
    const qs = [await quadro({ x: 268, y: 640, width: 700, height: 120 }, 0.8)], rs = ['concluir +160 ms'];
    await av(`document.querySelector('.linha[data-id="t8"] .marcar').click()`);   // desfaz no meio do caminho
    await congelar(0); const logo = await av(ler);
    const serie = [logo];
    for (const t of [60, 140, 260, 420]) { await congelar(t); await espera(30); serie.push(await av(ler)); qs.push(await quadro({ x: 268, y: 640, width: 700, height: 120 }, 0.8)); rs.push('desfazer +' + t + ' ms'); }
    const salto = Math.max(Math.abs(logo.risco - antes.risco), Math.abs(logo.visto - antes.visto));
    console.log('interrupção: antes', JSON.stringify(antes), '→ logo depois', JSON.stringify(logo), '→ fim', JSON.stringify(serie[serie.length - 1]), '| salto', salto.toFixed(3));
    if (salto > 0.05) { console.log('ERRO: a interrupção saltou'); process.exitCode = 1; }
    await montar('tira-a-interrupcao-escuro', qs, rs, 5, 'dark');
  },
  // B: abrir a foto da grade em tela cheia; a mesma foto cresce (View Transition), os controles de vidro chegam depois.
  async 'b-abrir'() {
    await abrir('caso-b-produto-v2.html', 'dark');
    await av(`(async () => { window.scrollTo(0, 420); await new Promise((r) => setTimeout(r, 400)); document.querySelectorAll('.foto')[3].click(); await window.__vt.ready; })()`);
    const ts = [0, 80, 160, 260, 380, 520, 700, 900], qs = [];
    for (const t of ts) { await congelar(t); await espera(40); qs.push(await quadro({ x: 0, y: 420, width: 1440, height: 900 }, 0.4)); }
    await montar('tira-b-abrir-foto-escuro', qs, ts.map((t) => t + ' ms'), 4, 'dark');
  },
  async 'b-fechar'() {
    await abrir('caso-b-produto-v2.html', 'light');
    await av(`(async () => { window.scrollTo(0, 420); await new Promise((r) => setTimeout(r, 400)); document.querySelectorAll('.foto')[3].click(); await window.__vt.finished; await new Promise((r) => setTimeout(r, 300)); document.querySelector('.visor-fechar').click(); await window.__vt.ready; })()`);
    const ts = [0, 100, 220, 380, 560, 800], qs = [];
    for (const t of ts) { await congelar(t); await espera(40); qs.push(await quadro({ x: 0, y: 420, width: 1440, height: 900 }, 0.4)); }
    await montar('tira-b-fechar-foto-claro', qs, ts.map((t) => t + ' ms'), 3, 'light');
  },
};

(async () => {
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  process.on('exit', () => { try { edge.kill(); } catch { /* saiu */ } });
  let alvo; for (let i = 0; i < 80 && !alvo; i++) { await espera(250); try { alvo = (await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ } }
  if (!alvo) throw new Error('Edge não respondeu');
  ws = new WebSocket(alvo.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(p.method + ': ' + d.error.message)) : p.res(d.result); }
    else if (d.method) for (let i = ouv.length - 1; i >= 0; i--) if (ouv[i].ev === d.method) { ouv[i].r(d.params); ouv.splice(i, 1); } };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  try { for (const [nome, f] of Object.entries(TIRAS)) if (qual === 'tudo' || qual === nome || (qual.length === 1 && nome.startsWith(qual + '-'))) await f(); }
  finally { try { ws.close(); } catch { /* fechado */ } edge.kill(); }
})().catch((e) => { console.error(e); process.exit(2); });
