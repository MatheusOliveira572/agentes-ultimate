#!/usr/bin/env node
// Converte os PNGs das provas em WebP (perda leve, texto legível) pelo próprio Edge ou Chrome sem interface, e apaga o PNG.
// As provas pesavam 27 MB em PNG e o plugin é baixado inteiro por quem instala (revisão final da 0.8.0, M-3).
// Uso: node scripts/comprimir-provas.js <arquivo.png ou pasta> [...] [--qualidade 0.82] [--manter-png]
// Os verificadores das provas continuam gravando PNG; rode este script antes do commit. Linha final: RESUMO.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const qi = args.indexOf('--qualidade');
const QUALIDADE = qi >= 0 ? Number(args[qi + 1]) : 0.82;
const MANTER = args.includes('--manter-png');
const alvos = args.filter((a, i) => !a.startsWith('--') && !(qi >= 0 && i === qi + 1));
if (!alvos.length) { console.log('Uso: node scripts/comprimir-provas.js <arquivo.png ou pasta> [...] [--qualidade 0.82] [--manter-png]'); process.exit(2); }

const pngs = [];
const juntar = (p) => {
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const n of fs.readdirSync(p)) juntar(path.join(p, n));
  else if (/\.png$/i.test(p)) pngs.push(p);
};
for (const a of alvos) juntar(path.resolve(a));

function navegador() {
  const cand = [process.env.AGENTES_ULTIMATE_NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  return cand.find((c) => fs.existsSync(c));
}

async function main() {
  const t0 = Date.now();
  const nav = navegador();
  if (!nav) { console.log('RESUMO comprimir-provas: sem Edge/Chrome (defina AGENTES_ULTIMATE_NAVEGADOR); 0 convertido'); process.exit(2); }
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'au-comprimir-'));
  const porta = 9300 + Math.floor(Math.random() * 400);
  const proc = spawn(nav, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  let ws;
  const fim = (cod) => { try { ws && ws.close(); } catch (e) { /* */ } try { proc.kill(); } catch (e) { /* */ } setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) { /* */ } process.exit(cod); }, 800); };
  let alvo = null;
  for (let i = 0; i < 60 && !alvo; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { const l = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); alvo = l.find((x) => x.type === 'page'); } catch (e) { /* ainda abrindo */ }
  }
  if (!alvo) { console.log('RESUMO comprimir-provas: o navegador não abriu a porta de depuração; 0 convertido'); return fim(1); }
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pend = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  ws.onclose = () => { for (const f of pend.values()) f({ error: { message: 'conexão fechada' } }); pend.clear(); };
  const cdp = (method, params) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });

  let antes = 0, depois = 0, erros = 0;
  for (const p of pngs) {
    const b64 = fs.readFileSync(p).toString('base64');
    const expr = `new Promise((ok, falha) => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas');
      c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0);
      ok(c.toDataURL('image/webp', ${QUALIDADE})); }; i.onerror = () => falha('imagem'); i.src = 'data:image/png;base64,${b64}'; })`;
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    const url = r.result && r.result.result && r.result.result.value;
    if (!url || !url.startsWith('data:image/webp;base64,')) { erros++; console.log('ERRO ' + p + ': ' + JSON.stringify(r.error || r.result).slice(0, 200)); continue; }
    const webp = Buffer.from(url.slice('data:image/webp;base64,'.length), 'base64');
    const destino = p.replace(/\.png$/i, '.webp');
    fs.writeFileSync(destino, webp);
    antes += fs.statSync(p).size; depois += webp.length;
    if (!MANTER) fs.unlinkSync(p);
    console.log(`${path.basename(p)} → ${path.basename(destino)}: ${Math.round(fs.statSync(destino).size / 1024)} KB`);
  }
  console.log(`RESUMO comprimir-provas: ${pngs.length} PNG lidos, ${pngs.length - erros} WebP gravados, ${erros} erro(s), ` +
    `${(antes / 1048576).toFixed(1)} MB → ${(depois / 1048576).toFixed(1)} MB, qualidade ${QUALIDADE}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  fim(erros ? 1 : 0);
}
main().catch((e) => { console.log('RESUMO comprimir-provas: erro ' + e.message); process.exit(1); });
