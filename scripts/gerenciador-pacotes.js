#!/usr/bin/env node
// Adaptado de affaan-m/ECC/scripts/lib/package-manager.js @b38be6a (detectFromPackageJson, detectFromLockFile),
// © 2026 Affaan Mustafa, MIT. Alterações: só a detecção (sem gravar configuração nem rodar nada), saída em português,
// conflito de lockfiles avisado; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/.
//
// Diz qual gerenciador de pacotes o projeto usa, para o agente rodar os comandos certos (npm, pnpm, yarn ou bun).
//   node scripts/gerenciador-pacotes.js [pasta]       (padrão: a pasta atual)
// Ordem: campo "packageManager" do package.json → lockfile. Sai 0 com o nome, 1 se não há sinal. Não executa nada.
'use strict';
const fs = require('fs');
const path = require('path');

const GERENCIADORES = {
  pnpm: { lock: ['pnpm-lock.yaml'], instalar: 'pnpm install', rodar: 'pnpm', executar: 'pnpm dlx', testar: 'pnpm test' },
  bun: { lock: ['bun.lock', 'bun.lockb'], instalar: 'bun install', rodar: 'bun run', executar: 'bunx', testar: 'bun test' },
  yarn: { lock: ['yarn.lock'], instalar: 'yarn', rodar: 'yarn', executar: 'yarn dlx', testar: 'yarn test' },
  npm: { lock: ['package-lock.json'], instalar: 'npm install', rodar: 'npm run', executar: 'npx', testar: 'npm test' },
};

function detectar(pasta) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(pasta, 'package.json'), 'utf8'));
    const nome = String(pkg.packageManager || '').split('@')[0];
    if (GERENCIADORES[nome]) return { nome, fonte: `package.json (packageManager: ${pkg.packageManager})`, locks: locksDe(pasta) };
  } catch (e) { /* sem package.json ou inválido */ }
  const locks = locksDe(pasta);
  if (locks.length) return { nome: locks[0].nome, fonte: `lockfile ${locks[0].arquivo}`, locks };
  return null;
}

function locksDe(pasta) {
  const achados = [];
  for (const [nome, g] of Object.entries(GERENCIADORES)) for (const arquivo of g.lock) if (fs.existsSync(path.join(pasta, arquivo))) achados.push({ nome, arquivo });
  return achados;
}

if (require.main === module) {
  const pasta = path.resolve(process.argv[2] || '.');
  const r = detectar(pasta);
  if (!r) { console.log('gerenciador: nenhum sinal (sem packageManager no package.json e sem lockfile). Pergunte ao usuário antes de instalar algo.'); process.exit(1); }
  const g = GERENCIADORES[r.nome];
  console.log(`gerenciador: ${r.nome} (pelo ${r.fonte}) · instalar: ${g.instalar} · rodar script: ${g.rodar} <script> · testar: ${g.testar} · executar pacote: ${g.executar}`);
  const outros = [...new Set(r.locks.map((l) => l.nome))].filter((n) => n !== r.nome);
  if (outros.length) console.log(`atenção: há lockfile de outro gerenciador (${outros.join(', ')}); não misture: confirme com o usuário qual vale.`);
  process.exit(0);
}

module.exports = { detectar };
