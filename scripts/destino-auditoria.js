#!/usr/bin/env node
// Texto próprio do agentes-ultimate. Confere a pasta onde a skill /auditoria-completa grava o relatório. O relatório traz
// vulnerabilidades em texto claro, então a pasta: fica fora de qualquer repositório git, fora do projeto auditado e fora de pasta
// sincronizada com a nuvem (OneDrive, Dropbox, Google Drive, iCloud, Box, MEGA, pCloud, Sync).
//   node scripts/destino-auditoria.js --alvo <projeto> [--pasta <destino>] [--criar]
// Sem --pasta, propõe <home>/auditorias-seguranca/<projeto>/run-<N>. Sai 0 (pode gravar), 3 (pasta recusada: peça outra ao usuário)
// ou 2 (uso errado). Imprime uma linha JSON. Só lê o disco; só cria a pasta com --criar. Não roda git.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const NUVEM = /(^|[\\/])(onedrive( - [^\\/]+)?|dropbox|google ?drive|meu drive|my drive|icloud ?drive|icloud~[^\\/]*|box( sync)?|mega(sync)?|pcloud ?drive|sync\.com|sync)([\\/]|$)/i;

function args(v) {
  const a = { criar: false };
  for (let i = 0; i < v.length; i++) {
    if (v[i] === '--alvo') a.alvo = v[++i];
    else if (v[i] === '--pasta') a.pasta = v[++i];
    else if (v[i] === '--criar') a.criar = true;
  }
  return a;
}
// Raízes de sincronização que o próprio sistema informa (variáveis do OneDrive no Windows).
function raizesSincronizadas() {
  return ['OneDrive', 'OneDriveCommercial', 'OneDriveConsumer'].map((k) => process.env[k]).filter(Boolean).map((p) => path.resolve(p));
}
const dentro = (filho, pai) => { const r = path.relative(pai, filho); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };
function repositorioAcima(p) {
  for (let d = path.resolve(p); ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, '.git'))) return d;
    if (path.dirname(d) === d) return null;
  }
}
function conferir(pasta, alvo) {
  const p = path.resolve(pasta);
  const motivos = [];
  if (alvo && dentro(p, path.resolve(alvo))) motivos.push('fica dentro do projeto auditado');
  const repo = repositorioAcima(p);
  if (repo) motivos.push(`fica dentro de um repositório git (${repo})`);
  const sinc = raizesSincronizadas().find((r) => dentro(p, r));
  if (sinc || NUVEM.test(p)) motivos.push(`parece pasta sincronizada com a nuvem (${sinc || p.match(NUVEM)[2]})`);
  return motivos;
}
function proposta(alvo) {
  const nome = path.basename(path.resolve(alvo || 'projeto')).replace(/[^\w.-]+/g, '-') || 'projeto';
  const base = path.join(os.homedir(), 'auditorias-seguranca', nome);
  let n = 1;
  while (fs.existsSync(path.join(base, `run-${n}`))) n++;
  return path.join(base, `run-${n}`);
}

if (require.main === module) {
  const a = args(process.argv.slice(2));
  if (!a.alvo) { console.log(JSON.stringify({ ok: false, erro: 'uso: --alvo <projeto> [--pasta <destino>] [--criar]' })); process.exit(2); }
  const pasta = a.pasta || proposta(a.alvo);
  const motivos = conferir(pasta, a.alvo);
  if (motivos.length) {
    console.log(JSON.stringify({ ok: false, pasta, motivos, pedir: 'O relatório traz vulnerabilidades em texto claro. Peça ao usuário outra pasta: local, fora do git e sem sincronização.' }));
    process.exit(3);
  }
  if (a.criar) fs.mkdirSync(pasta, { recursive: true });
  console.log(JSON.stringify({ ok: true, pasta, criada: a.criar }));
  process.exit(0);
}
module.exports = { conferir, proposta };
