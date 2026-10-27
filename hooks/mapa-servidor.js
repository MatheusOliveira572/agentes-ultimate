#!/usr/bin/env node
// Mapa ao vivo: servidor local (só 127.0.0.1) que serve o mapa do projeto e transmite, na hora, cada arquivo que o
// Claude ou um agente lê ou edita (lido de .claude/base/.atividade.jsonl). Para sozinho depois de 2 h sem uso.
// Uso: node hooks/mapa-servidor.js [pasta] [--abrir]   → sobe em segundo plano (ou reaproveita o que já está no ar),
//      imprime o endereço e, com --abrir, abre no navegador.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const cwd = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());
const BASE = path.join(cwd, '.claude', 'base');
const ESTADO = path.join(BASE, '.mapa-servidor.json');
const ATIV = path.join(BASE, '.atividade.jsonl');
const OCIOSO_MS = 2 * 60 * 60 * 1000;

function abrir(url) {
  const c = process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try { spawn(c[0], c[1], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); } catch (e) { /* sem navegador */ }
}

function vivo(estado) {
  return new Promise((ok) => {
    if (!estado || !estado.porta) return ok(false);
    const r = http.get({ host: '127.0.0.1', port: estado.porta, path: '/saude', timeout: 800 }, (res) => { res.resume(); ok(res.statusCode === 200); });
    r.on('error', () => ok(false)); r.on('timeout', () => { r.destroy(); ok(false); });
  });
}

async function iniciar() {
  // --auto (gancho de início de sessão): só abre se o projeto pediu em .claude/base/config.json → "mapa": { "abrir_sozinho": true }.
  if (args.includes('--auto')) {
    let cfg = {};
    try { cfg = JSON.parse(fs.readFileSync(path.join(BASE, 'config.json'), 'utf8')); } catch (e) { /* sem config */ }
    if (!(cfg.mapa && cfg.mapa.abrir_sozinho) || fs.existsSync(path.join(BASE, 'desligado'))) process.exit(0);
    args.push('--abrir');
  }
  let est = null;
  try { est = JSON.parse(fs.readFileSync(ESTADO, 'utf8')); } catch (e) { /* nenhum */ }
  if (!(await vivo(est))) {
    fs.mkdirSync(BASE, { recursive: true });
    try { fs.rmSync(ESTADO); } catch (e) { /* não havia */ }
    const filho = spawn(process.execPath, [__filename, cwd, '--servir'], { detached: true, stdio: 'ignore', windowsHide: true });
    filho.unref();
    for (let i = 0; i < 50 && !fs.existsSync(ESTADO); i++) await new Promise((r) => setTimeout(r, 100));
    try { est = JSON.parse(fs.readFileSync(ESTADO, 'utf8')); } catch (e) { console.error('não consegui iniciar o servidor do mapa'); process.exit(1); }
  }
  const url = `http://127.0.0.1:${est.porta}/`;
  console.log(`Mapa ao vivo: ${url}`);
  if (args.includes('--abrir')) abrir(url);
}

function servir() {
  const { gerar } = require('./mapa-visual');
  let pagina = '';
  const refazer = () => { try { gerar(cwd, { aoVivo: true }); pagina = fs.readFileSync(path.join(BASE, 'MAPA.html'), 'utf8'); } catch (e) { /* mantém a anterior */ } };
  refazer();
  const clientes = new Set();
  let ultimoUso = Date.now();
  let lido = 0;
  try { lido = fs.statSync(ATIV).size; } catch (e) { /* ainda não há atividade */ }

  // Envia as últimas 30 ações a quem acaba de abrir, e depois só as novas.
  function ultimas(n) {
    try { return fs.readFileSync(ATIV, 'utf8').trim().split('\n').slice(-n).filter(Boolean); } catch (e) { return []; }
  }
  setInterval(() => {
    let tam = 0;
    try { tam = fs.statSync(ATIV).size; } catch (e) { return; }
    if (tam < lido) lido = 0; // arquivo girou
    if (tam === lido) return;
    const fd = fs.openSync(ATIV, 'r'); const buf = Buffer.alloc(tam - lido); fs.readSync(fd, buf, 0, buf.length, lido); fs.closeSync(fd);
    lido = tam;
    const linhas = buf.toString('utf8').split('\n').filter(Boolean);
    if (linhas.length) ultimoUso = Date.now();
    for (const c of clientes) for (const l of linhas) c.write(`data: ${l}\n\n`);
  }, 500);
  setInterval(refazer, 60 * 1000); // arquivos novos entram no desenho a cada minuto
  setInterval(() => { if (!clientes.size && Date.now() - ultimoUso > OCIOSO_MS) { try { fs.rmSync(ESTADO); } catch (e) { /* já saiu */ } process.exit(0); } }, 60 * 1000);

  const srv = http.createServer((req, res) => {
    ultimoUso = Date.now();
    if (req.url === '/saude') { res.writeHead(200); return res.end('ok'); }
    if (req.url === '/eventos') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      for (const l of ultimas(30)) res.write(`data: ${l}\n\n`);
      clientes.add(res); req.on('close', () => clientes.delete(res));
      return;
    }
    if (req.url === '/' || req.url.startsWith('/?')) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(pagina); }
    res.writeHead(404); res.end();
  });
  const tentar = (porta) => {
    srv.once('error', () => tentar(porta + 1));
    srv.listen(porta, '127.0.0.1', () => fs.writeFileSync(ESTADO, JSON.stringify({ porta, pid: process.pid, desde: new Date().toISOString() })));
  };
  tentar(4777);
}

if (args.includes('--servir')) servir();
else iniciar();
