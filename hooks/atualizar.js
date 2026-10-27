#!/usr/bin/env node
// Atualização automática (SessionStart). No máximo 1 vez por dia, em segundo plano e sem travar a sessão:
//   claude plugin marketplace update agentes-ultimate && claude plugin update agentes-ultimate@agentes-ultimate
// Se a versão mudou, avisa na próxima sessão (o Claude Code só aplica depois de reiniciar).
// Desligar: AGENTES_ULTIMATE_SEM_AUTOATUALIZAR=1. Só roda quando instalado pelo marketplace (não com --plugin-dir).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

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

  const claude = process.env.AGENTES_ULTIMATE_CLAUDE_CMD || 'claude';
  const cmd = `${claude} plugin marketplace update agentes-ultimate && ${claude} plugin update agentes-ultimate@agentes-ultimate`;
  try {
    const log = fs.openSync(LOG, 'w');
    const p = spawn(cmd, { shell: true, detached: true, stdio: ['ignore', log, log], windowsHide: true });
    p.unref();
  } catch (e) { /* sem rede ou sem claude no PATH: tenta amanhã */ }
  sair(aviso);
}

try { main(); } catch (e) { sair(); }
