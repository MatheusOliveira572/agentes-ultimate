#!/usr/bin/env node
// Atualização automática (SessionStart). No máximo 1 vez por dia, em segundo plano e sem travar a sessão:
//   claude plugin marketplace update agentes-ultimate, e, se der certo, claude plugin update agentes-ultimate@agentes-ultimate
// Se a versão mudou, avisa na próxima sessão (o Claude Code só aplica depois de reiniciar).
// Desligar: AGENTES_ULTIMATE_SEM_AUTOATUALIZAR=1. Só roda quando instalado pelo marketplace (não com --plugin-dir).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const DIR = path.join(os.homedir(), '.claude', 'agentes-ultimate');
const ESTADO = path.join(DIR, 'atualizacao.json');
const LOG = path.join(DIR, 'atualizacao.log');
const UM_DIA = 24 * 60 * 60 * 1000;

const sair = (msg) => {
  if (msg) process.stdout.write(JSON.stringify({ systemMessage: msg }));
  process.exit(0);
};

function versaoAtual() {
  try { return JSON.parse(fs.readFileSync(path.join(RAIZ, '.claude-plugin', 'plugin.json'), 'utf8')).version || '?'; } catch (e) { return '?'; }
}

function main() {
  if (process.env.AGENTES_ULTIMATE_SEM_AUTOATUALIZAR === '1') sair();
  const instalado = /[\\/]\.claude[\\/]plugins[\\/]/.test(RAIZ) || process.env.AGENTES_ULTIMATE_FORCAR_ATUALIZAR === '1';
  if (!instalado) sair(); // cópia local de desenvolvimento: não mexe

  let est = {};
  try { est = JSON.parse(fs.readFileSync(ESTADO, 'utf8')); } catch (e) { /* 1ª vez */ }
  const versao = versaoAtual();
  let aviso = '';
  if (est.versaoVista && est.versaoVista !== versao) aviso = `agentes-ultimate atualizado: ${est.versaoVista} → ${versao}.`;

  const agora = Date.now();
  if (est.ultimaTentativa && agora - Date.parse(est.ultimaTentativa) < UM_DIA) {
    try { fs.writeFileSync(ESTADO, JSON.stringify({ ...est, versaoVista: versao }, null, 2)); } catch (e) { /* sem efeito */ }
    sair(aviso);
  }

  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(ESTADO, JSON.stringify({ ...est, versaoVista: versao, ultimaTentativa: new Date(agora).toISOString() }, null, 2));
  } catch (e) { sair(aviso); }

  // Um node destacado, sem shell, roda o claude com spawnSync + windowsHide. Com shell + detached, o Windows dá console novo e
  // visível a cada programa de console que o cmd chama (janela preta no início do dia; revisão final, A-2).
  try {
    const log = fs.openSync(LOG, 'w');
    const p = spawn(process.execPath, [__filename, '--executar'], { detached: true, stdio: ['ignore', log, log], windowsHide: true });
    p.unref();
  } catch (e) { /* tenta amanhã */ }
  sair(aviso);
}

// Programa e argumentos iniciais do claude: AGENTES_ULTIMATE_CLAUDE_CMD (texto com aspas, para os testes) ou "claude".
function programaClaude() {
  const t = process.env.AGENTES_ULTIMATE_CLAUDE_CMD;
  if (!t) return ['claude', []];
  const partes = [...t.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => (m[1] !== undefined ? m[1] : m[2]));
  return [partes[0], partes.slice(1)];
}
// Sem shell, o Windows só acha claude.exe; quem instalou pelo npm tem claude.cmd (ENOENT). Aí vai pelo cmd.exe, com texto fixo
// e sem detached (este node já está destacado: o console novo nasce escondido). O motivo de cada falha vai para atualizacao.log.
function executar() {
  const [prog, ini] = programaClaude();
  const TEMPO = 5 * 60 * 1000;
  const roda = (args) => {
    let r = spawnSync(prog, [...ini, ...args], { windowsHide: true, stdio: 'inherit', timeout: TEMPO });
    if (r.error && r.error.code === 'ENOENT' && process.platform === 'win32' && prog === 'claude') {
      console.log(`claude ${args.join(' ')}: claude.exe não encontrado sem shell (ENOENT); tentando claude.cmd pelo cmd.exe`);
      r = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', ['claude', ...args].join(' ')], { windowsHide: true, stdio: 'inherit', timeout: TEMPO });
    }
    if (r.error) console.log(`claude ${args.join(' ')}: falhou (${r.error.code || r.error.message})`);
    else if (r.status !== 0) console.log(`claude ${args.join(' ')}: saiu com código ${r.status}`);
    return r;
  };
  const r = roda(['plugin', 'marketplace', 'update', 'agentes-ultimate']);
  if (r.status === 0) roda(['plugin', 'update', 'agentes-ultimate@agentes-ultimate']);
  process.exit(0);
}

if (process.argv.includes('--executar')) { try { executar(); } catch (e) { process.exit(0); } } else { try { main(); } catch (e) { sair(); } }
