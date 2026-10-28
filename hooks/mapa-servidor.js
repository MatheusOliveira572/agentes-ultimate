#!/usr/bin/env node
// Mapa ao vivo: servidor local (só 127.0.0.1) que serve o mapa do projeto e transmite, na hora, cada arquivo que o
// Claude ou um agente lê ou edita (lido de .claude/base/.atividade.jsonl), o último pedido (.ultima-busca.json) e o
// aviso de grafo refeito, para a página se atualizar sem F5. Para sozinho depois de 2 h sem uso.
// Uso: node hooks/mapa-servidor.js [pasta] [--abrir]   → sobe em segundo plano (ou reaproveita o que já está no ar),
//      imprime o endereço e, com --abrir, abre no navegador.
//      --auto (início de sessão): abre só se o projeto ou o usuário pediu, e só se ainda não houver aba conectada.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const cwd = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());
const BASE = path.join(cwd, '.claude', 'base');
const ESTADO = path.join(BASE, '.mapa-servidor.json');
const ATIV = path.join(BASE, '.atividade.jsonl');
const BUSCA = path.join(BASE, '.ultima-busca.json');
const OCIOSO_MS = 2 * 60 * 60 * 1000;
const VERSAO = (() => { try { return require('../.claude-plugin/plugin.json').version; } catch (e) { return '?'; } })();

const lerJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };

function abrir(url) {
  // AGENTES_ULTIMATE_ABRIR_CMD troca o navegador por outro comando (os testes usam um que só anota).
  const troca = process.env.AGENTES_ULTIMATE_ABRIR_CMD;
  try {
    if (troca) spawn(`${troca} "${url}"`, { shell: true, detached: true, stdio: 'ignore', windowsHide: true }).unref();
    else {
      const c = process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
      spawn(c[0], c[1], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    }
  } catch (e) { /* sem navegador */ }
}

// Pede abrir sozinho? O projeto manda (.claude/base/config.json); sem posição dele, vale a do usuário
// (~/.claude/agentes-ultimate/config.json), só em pasta onde a base já está montada.
function abrirSozinho() {
  if (fs.existsSync(path.join(BASE, 'desligado'))) return false;
  const proj = lerJson(path.join(BASE, 'config.json')) || {};
  if (proj.mapa && typeof proj.mapa.abrir_sozinho === 'boolean') return proj.mapa.abrir_sozinho;
  const usu = lerJson(path.join(os.homedir(), '.claude', 'agentes-ultimate', 'config.json')) || {};
  if (!(usu.mapa && usu.mapa.abrir_sozinho === true)) return false;
  return cwd !== path.resolve(os.homedir()) && cwd !== path.parse(cwd).root && fs.existsSync(BASE);
}

// Servidor no ar? Devolve { versao, clientes } ou null.
function vivo(estado) {
  return new Promise((ok) => {
    if (!estado || !estado.porta) return ok(null);
    const r = http.get({ host: '127.0.0.1', port: estado.porta, path: '/saude', timeout: 800 }, (res) => {
      let b = ''; res.on('data', (c) => { b += c; });
      res.on('end', () => { if (res.statusCode !== 200) return ok(null); try { ok(JSON.parse(b)); } catch (e) { ok({ versao: null, clientes: 0 }); } });
    });
    r.on('error', () => ok(null)); r.on('timeout', () => { r.destroy(); ok(null); });
  });
}

async function iniciar() {
  const auto = args.includes('--auto');
  if (auto && !abrirSozinho()) process.exit(0);
  let est = lerJson(ESTADO);
  let saude = await vivo(est);
  if (saude && saude.versao !== VERSAO) { try { process.kill(est.pid); } catch (e) { /* já saiu */ } saude = null; } // versão antiga do plugin
  if (!saude) {
    fs.mkdirSync(BASE, { recursive: true });
    try { fs.rmSync(ESTADO); } catch (e) { /* não havia */ }
    const filho = spawn(process.execPath, [__filename, cwd, '--servir'], { detached: true, stdio: 'ignore', windowsHide: true });
    filho.unref();
    for (let i = 0; i < 50 && !fs.existsSync(ESTADO); i++) await new Promise((r) => setTimeout(r, 100));
    est = lerJson(ESTADO);
    if (!est) { console.error('não consegui iniciar o servidor do mapa'); process.exit(1); }
  }
  const url = `http://127.0.0.1:${est.porta}/`;
  if (auto && saude && saude.clientes > 0) { console.log(`Mapa ao vivo: ${url} (já aberto)`); return; } // uma aba só
  console.log(`Mapa ao vivo: ${url}`);
  if (auto || args.includes('--abrir')) abrir(url);
}

function servir() {
  const { gerar } = require('./mapa-visual');
  const clientes = new Set();
  const enviar = (obj) => { const l = `data: ${JSON.stringify(obj)}\n\n`; for (const c of clientes) c.write(l); };
  let pagina = '', atual = null, assinatura = '';
  // Refaz a página e os dados; se o desenho mudou (pontos, ligações ou arquivos), avisa as abas para buscarem /dados.
  const refazer = () => {
    try {
      const r = gerar(cwd);
      pagina = r.html; atual = r.dados;
      const nova = [r.nos, r.arestas, r.dados.nos.filter((n) => n.t === 'a').map((n) => n.id).sort().join('\n')].join('|');
      if (assinatura && nova !== assinatura) enviar({ tipo: 'grafo' });
      assinatura = nova;
    } catch (e) { /* mantém a anterior */ }
  };
  refazer();
  let agendado = null;
  const agendar = (ms) => { if (!agendado) agendado = setTimeout(() => { agendado = null; refazer(); }, ms); };
  let ultimoUso = Date.now();
  let lido = 0;
  try { lido = fs.statSync(ATIV).size; } catch (e) { /* ainda não há atividade */ }
  const marca = (f) => { try { const s = fs.statSync(f); return s.mtimeMs + ':' + s.size; } catch (e) { return ''; } };
  let marcaBusca = marca(BUSCA);

  // Envia as últimas 30 ações a quem acaba de abrir, e depois só as novas.
  function ultimas(n) {
    try { return fs.readFileSync(ATIV, 'utf8').trim().split('\n').slice(-n).filter(Boolean); } catch (e) { return []; }
  }
  setInterval(() => {
    // Último pedido novo: manda os destaques na hora e refaz o desenho logo depois.
    const m = marca(BUSCA);
    if (m !== marcaBusca) {
      const b = lerJson(BUSCA);
      if (b) {
        marcaBusca = m; ultimoUso = Date.now();
        enviar({ tipo: 'busca', pedido: b.pedido, em: b.em, arquivos: (b.arquivos || []).map((a) => ({ rel: a.rel, ligado: !!a.ligado })),
          registros: (b.registros || []).map((x) => ({ texto: x.texto, rotulo: x.rotulo })) });
        agendar(300);
      }
    }
    let tam = 0;
    try { tam = fs.statSync(ATIV).size; } catch (e) { return; }
    if (tam < lido) lido = 0; // arquivo girou
    if (tam === lido) return;
    const fd = fs.openSync(ATIV, 'r'); const buf = Buffer.alloc(tam - lido); fs.readSync(fd, buf, 0, buf.length, lido); fs.closeSync(fd);
    lido = tam;
    const linhas = buf.toString('utf8').split('\n').filter(Boolean);
    if (linhas.length) ultimoUso = Date.now();
    for (const c of clientes) for (const l of linhas) c.write(`data: ${l}\n\n`);
    if (linhas.some((l) => /"acao":"(editou|criou)"/.test(l))) agendar(8000); // arquivo novo ou citação nova: refaz logo
  }, 500);
  setInterval(refazer, 60 * 1000); // e, de qualquer forma, a cada minuto
  setInterval(() => { for (const c of clientes) c.write(': ok\n\n'); }, 25 * 1000); // mantém a conexão aberta
  setInterval(() => { if (!clientes.size && Date.now() - ultimoUso > OCIOSO_MS) { try { fs.rmSync(ESTADO); } catch (e) { /* já saiu */ } process.exit(0); } }, 60 * 1000);

  const srv = http.createServer((req, res) => {
    ultimoUso = Date.now();
    if (req.url === '/saude') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok: true, versao: VERSAO, clientes: clientes.size })); }
    if (req.url === '/dados' || req.url.startsWith('/dados?')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(atual || { nos: [], arestas: [] }));
    }
    if (req.url === '/eventos') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      for (const l of ultimas(30)) res.write(`data: ${l}\n\n`);
      clientes.add(res); req.on('close', () => clientes.delete(res));
      return;
    }
    if (req.url === '/' || req.url.startsWith('/?')) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(pagina); }
    res.writeHead(404); res.end();
  });
  const tentar = (porta) => {
    srv.once('error', () => tentar(porta + 1));
    srv.listen(porta, '127.0.0.1', () => fs.writeFileSync(ESTADO, JSON.stringify({ porta, pid: process.pid, versao: VERSAO, desde: new Date().toISOString() })));
  };
  tentar(4777);
}

if (args.includes('--servir')) servir();
else iniciar();
