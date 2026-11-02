// Tiras de quadros (filmstrips) das transições principais, determinísticas: o relógio é nosso, não o da máquina.
// - lente: salto de rolagem do herói até a vista aberta; a mola da lente (lente3d.js) avança 50 ms por quadro (__vitrine.avancar).
// - girar: o mesmo quadro com a lente girada 0° e 20° (os reflexos têm de mudar de lugar, não deslizar junto com o corpo).
// - revelacao e reserva: transições CSS pausadas (document.getAnimations) e postas em currentTime = 0, 50, 100… ms.
// Também mede a curva: posição por quadro → velocidade; reprova salto no início, parada seca no fim e recuo fora do desenho.
// Edge sem interface, uma aba, windowsHide, deviceScaleFactor 2. Uso: node tiras.js [lente|girar|revelacao|reserva|tudo]
'use strict';
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path'); const os = require('os');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const PORTA = 9960 + (process.pid % 30), PERFIL = path.join(os.tmpdir(), 'vitrine-tiras-' + process.pid), PNG = path.join(__dirname, 'png');
const URL0 = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
const qual = process.argv[2] || 'tudo';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, seq = 0; const pend = new Map(); const ouv = [];
const cdp = (method, params = {}) => { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); };
const quando = (ev) => new Promise((r) => ouv.push({ ev, r }));
const av = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
async function abrir(tema, w = 1440, h = 900) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: false });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: tema }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
  const c = quando('Page.loadEventFired'); await cdp('Page.navigate', { url: URL0 }); await c;
  await av(`new Promise((ok) => { const f = () => document.documentElement.classList.contains('gl-ativo') ? ok() : setTimeout(f, 100); f(); setTimeout(ok, 25000); })`); await espera(1500);
}
const foto = async (clip) => (await cdp('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } })).data;
// junta os quadros numa tira (canvas da própria página), com o tempo escrito em cada quadro
async function montar(nome, quadros, rotulos, colunas) {
  const b64 = await av(`(async () => { const q = ${JSON.stringify(quadros)}, rot = ${JSON.stringify(rotulos)}, col = ${colunas};
    const imgs = await Promise.all(q.map((d) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + d; })));
    const w = imgs[0].width, h = imgs[0].height, esc = Math.min(1, 900 / w), tw = Math.round(w * esc), th = Math.round(h * esc), pad = 16, lin = Math.ceil(imgs.length / col);
    const c = document.createElement('canvas'); c.width = col * tw + (col + 1) * pad; c.height = lin * (th + 44) + pad; const g = c.getContext('2d');
    g.fillStyle = '#e9e8e4'; g.fillRect(0, 0, c.width, c.height);
    imgs.forEach((im, k) => { const x = pad + (k % col) * (tw + pad), y = pad + Math.floor(k / col) * (th + 44); g.drawImage(im, x, y, tw, th);
      g.fillStyle = '#1d1d1f'; g.font = '600 22px Segoe UI, sans-serif'; g.fillText(rot[k], x + 4, y + th + 30); });
    return c.toDataURL('image/png').split(',')[1]; })()`);
  fs.writeFileSync(path.join(PNG, nome), Buffer.from(b64, 'base64')); console.log('tira', nome, quadros.length, 'quadros');
}
// análise da curva: v[i] = x[i+1]-x[i]; reprova se o 1º passo já é o maior (salto), se o último passo é > 8% do maior (parada seca)
// ou se a posição recua mais que 1% do percurso (fora do desenho)
function curva(xs) { const v = xs.slice(1).map((x, i) => x - xs[i]); const tot = xs[xs.length - 1] - xs[0]; const vmax = Math.max(...v.map(Math.abs));
  const erros = []; if (Math.abs(v[0]) >= vmax - 1e-9 && v.length > 3) erros.push('salto no 1º quadro'); if (Math.abs(v[v.length - 1]) > 0.08 * vmax) erros.push('parada seca no fim');
  if (v.some((d) => Math.sign(d) !== Math.sign(tot) && Math.abs(d) > 0.01 * Math.abs(tot))) erros.push('recuo');
  return { erros, v: v.map((d) => +(d / (tot || 1)).toFixed(3)) }; }

(async () => {
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files', '--enable-unsafe-swiftshader', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  process.on('exit', () => { try { edge.kill(); } catch { /* saiu */ } }); setTimeout(() => { console.error('tempo esgotado'); process.exit(3); }, 560000).unref();
  let alvo; for (let i = 0; i < 80 && !alvo; i++) { await espera(250); try { alvo = (await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ } }
  ws = new WebSocket(alvo.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(p.method + ': ' + d.error.message)) : p.res(d.result); }
    else if (d.method) for (let i = ouv.length - 1; i >= 0; i--) if (ouv[i].ev === d.method) { ouv[i].r(d.params); ouv.splice(i, 1); } };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  const relatorio = {}; let falhas = 0;
  const tela = { x: 0, y: 0, width: 1440, height: 900 };

  if (qual === 'lente' || qual === 'tudo') {
    await abrir('dark');
    await av(`window.__vitrine.parar(); scrollTo(0, document.querySelector('#por-dentro h2').getBoundingClientRect().top + scrollY - innerHeight * 0.30)`); await espera(200);
    const q = [], xs = [];
    const y = await av('scrollY'); for (let i = 0; i < 12; i++) { xs.push(await av(`window.__vitrine.avancar(${i === 0 ? 0 : 50})`)); q.push(await foto({ ...tela, y })); }   // o recorte é em coordenadas da página
    const c = curva(xs); relatorio.lente = { progresso: xs.map((x) => +x.toFixed(3)), ...c }; falhas += c.erros.length;
    await montar('tira-lente-escuro.png', q, xs.map((x, i) => `${i * 50} ms · progresso ${x.toFixed(2)}`), 4);
  }
  if (qual === 'girar' || qual === 'tudo') {
    await abrir('light'); const cx = await av('window.__vitrine.caixa()');
    const clip = { x: Math.max(0, cx.x - 20), y: Math.max(0, cx.y - 20), width: Math.min(1440 - cx.x, cx.w + 40), height: Math.min(900 - cx.y, cx.h + 40) };
    const q = []; for (const a of [0, 0.349]) { await av(`window.__vitrine.parar(); window.__vitrine.girar(${a})`); await espera(150); q.push(await foto(clip)); }
    await montar('tira-girar-20graus.png', q, ['0°', '20° (os reflexos mudam de lugar)'], 2);
  }
  async function tiraCss(nome, preparo, clipExpr, tema, passos, rotulo, sel) {
    await abrir(tema); await av(preparo);
    await av(`new Promise((ok) => { const f = () => document.getAnimations().length ? ok() : requestAnimationFrame(f); f(); setTimeout(ok, 3000); })`);
    const n = await av(`(() => { window.__anims = document.getAnimations(); window.__anims.forEach((a) => a.pause()); return window.__anims.length; })()`);
    const clip = await av(clipExpr); const q = [], xs = [];
    for (const t of passos) { await av(`window.__anims.forEach((a) => { a.currentTime = ${t}; })`); await espera(60); q.push(await foto(clip));
      xs.push(await av(`(() => { const e = document.querySelector('${sel}'); const m = new DOMMatrix(getComputedStyle(e).transform); return m.m42; })()`)); }
    const c = curva(xs.map((x) => -x)); relatorio[nome] = { animacoes: n, posicaoY: xs.map((x) => +x.toFixed(2)), ...c }; falhas += c.erros.length;
    await montar(`tira-${nome}.png`, q, passos.map((t) => `${t} ms${rotulo ? ' · ' + rotulo : ''}`), 5);
  }
  const passos = [0, 40, 80, 120, 170, 220, 280, 350, 450, 600];
  if (qual === 'revelacao' || qual === 'tudo')
    await tiraCss('revelacao', `scrollTo(0, document.querySelector('#abertura').getBoundingClientRect().top + scrollY - 40)`,
      `({ x: 0, y: scrollY, width: 1440, height: 900 })`, 'light', passos, '', '#quadro');
  if (qual === 'reserva' || qual === 'tudo')
    await tiraCss('reserva', `(async () => { scrollTo(0, document.querySelector('#reservar').getBoundingClientRect().top + scrollY + 40); await new Promise((r) => setTimeout(r, 1200)); document.getAnimations().forEach((a) => a.finish()); document.querySelector('#b-reservar').click(); })()`,
      `(() => { const b = document.querySelector('#cartao').getBoundingClientRect(); return { x: b.left + scrollX - 12, y: b.top + scrollY + b.height - 190, width: b.width + 24, height: 200 }; })()`, 'dark', passos, '', '.b-depois');
  fs.writeFileSync(path.join(PNG, 'tiras-medidas.json'), JSON.stringify({ data: new Date().toISOString(), falhas, relatorio }, null, 2));
  console.log(JSON.stringify(relatorio, null, 1).slice(0, 1800)); console.log(falhas ? `FALHAS: ${falhas}` : 'curvas ok');
  ws.close(); edge.kill(); process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
