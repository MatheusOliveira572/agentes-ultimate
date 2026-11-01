#!/usr/bin/env node
// Confere se uma ferramenta externa está instalada, antes de um agente depender dela. Procura no PATH (com as extensões
// do PATHEXT no Windows), mostra o caminho e a versão (`<nome> --version`, até 15 s) e NUNCA instala nada.
//   node scripts/checar-ferramenta.js <nome> [<nome>...]     ex.: node scripts/checar-ferramenta.js semgrep docker
// Sai 0 se todas estão instaladas, 1 se falta alguma, 2 se o nome é inválido. Funciona igual no PowerShell e no Git Bash.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WIN = process.platform === 'win32';

function acharNoPath(nome) {
  const dirs = (process.env.PATH || process.env.Path || '').split(path.delimiter).filter(Boolean);
  const exts = WIN ? ['', ...(process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean).map((e) => e.toLowerCase())] : [''];
  for (const d of dirs) {
    for (const e of exts) {
      const f = path.join(d.replace(/^"|"$/g, ''), nome + e);
      try { if (fs.statSync(f).isFile() && (WIN ? e !== '' || /\.(exe|cmd|bat|com)$/i.test(f) : (fs.accessSync(f, fs.constants.X_OK), true))) return f; } catch (err) { /* segue */ }
    }
  }
  return null;
}

function versao(arq) {
  const op = { encoding: 'utf8', timeout: 15000, windowsHide: true };
  // .cmd/.bat no Windows só rodam pelo cmd.exe; o nome já foi conferido (só letras, números, ponto, hífen e sublinhado).
  const r = WIN && /\.(cmd|bat)$/i.test(arq)
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', `""${arq}" --version"`], { ...op, windowsVerbatimArguments: true })
    : spawnSync(arq, ['--version'], op);
  if (r.error) return r.error.code === 'ETIMEDOUT' ? 'versão não respondeu em 15 s' : 'versão não lida';
  const linha = `${r.stdout || ''}\n${r.stderr || ''}`.split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  return linha ? linha.slice(0, 120) : 'versão não informada';
}

const nomes = process.argv.slice(2);
if (!nomes.length) { console.log('uso: node scripts/checar-ferramenta.js <nome> [<nome>...]'); process.exit(2); }
const t0 = Date.now();
let ausentes = 0;
for (const nome of nomes) {
  if (!/^[\w.-]+$/.test(nome)) { console.log(`${nome}: nome inválido (use só o nome do programa, sem caminho nem espaço)`); process.exit(2); }
  const arq = acharNoPath(nome);
  if (!arq) { ausentes++; console.log(`${nome}: não instalado (não está no PATH). O plugin não instala nada: siga sem a ferramenta e avise o usuário.`); continue; }
  console.log(`${nome}: instalado, ${versao(arq)} (${arq})`);
}
console.log(`checar-ferramenta: ${nomes.length} pedida(s), ${nomes.length - ausentes} instalada(s), ${ausentes} ausente(s), ${Date.now() - t0} ms`);
process.exit(ausentes ? 1 : 0);
