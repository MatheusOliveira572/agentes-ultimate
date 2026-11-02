#!/usr/bin/env node
// Teste de instalação limpa (ideia de addyosmani/agent-skills/.github/workflows/test-plugin-install.yml @301b02b, © 2025
// Addy Osmani, MIT; reescrito; alterado por agentes-ultimate; licença em terceiros/addyosmani-agent-skills/). Copia só o que
// está no git para uma pasta nova (como uma instalação recebe) e confere que o plugin roda lá: sem depender de arquivo
// fora do git. Não instala nada no Claude Code do usuário.
//   node scripts/testar-instalacao.js          validar.js, gerar-agentes.js idempotente e claude plugin validate (se houver claude)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const t0 = Date.now();
const dst = fs.mkdtempSync(path.join(os.tmpdir(), 'instala ção-'));
const falhas = [];
const passo = (nome, ok, det) => { console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome}${ok ? '' : ' → ' + det}`); if (!ok) falhas.push(nome); };
const tar = path.join(dst, 'p.tar');
execSync(`git archive HEAD -o "${tar}"`, { windowsHide: true, cwd: RAIZ });
execSync(`tar --force-local -xf "${tar}" -C "${dst}"`, { windowsHide: true });
fs.rmSync(tar);
const node = (args, cwd = dst) => spawnSync(process.execPath, args, { windowsHide: true, cwd, encoding: 'utf8' });
let r = node([path.join(dst, 'scripts', 'validar.js')]);
passo('validar.js na cópia limpa', r.status === 0, (r.stdout || '').slice(-400));
const hash = () => spawnSync('git', ['-c', 'core.safecrlf=false', 'hash-object', ...fs.readdirSync(path.join(dst, 'agents')).map((f) => path.join(dst, 'agents', f))], { windowsHide: true, encoding: 'utf8' }).stdout;
const antes = hash();
r = node([path.join(dst, 'scripts', 'gerar-agentes.js')]);
const um = hash();
node([path.join(dst, 'scripts', 'gerar-agentes.js')]);
const dois = hash();
passo('gerar-agentes.js é idempotente e o agents/ do git está em dia', antes === um && um === dois, 'agents/ muda ao gerar: rode o gerador antes do commit');
r = spawnSync(process.execPath, [path.join(dst, 'hooks', 'roteador.js')], { windowsHide: true, encoding: 'utf8', input: JSON.stringify({ prompt: 'corrija o bug do script python', cwd: dst, hook_event_name: 'UserPromptSubmit' }), env: { ...process.env, AGENTES_ULTIMATE_SEM_PASTA: '1', AGENTES_ULTIMATE_SEM_AUTOATUALIZAR: '1' } });
passo('o roteador responde na cópia limpa', r.status === 0 && /Software/.test(r.stdout || ''), (r.stdout || r.stderr || '').slice(0, 300));
const cl = spawnSync('claude', ['plugin', 'validate', dst], { windowsHide: true, encoding: 'utf8', shell: process.platform === 'win32', timeout: 60000 });
if (cl.error || cl.status === null) console.log('info  claude não disponível: validação do manifesto pulada');
else passo('claude plugin validate', cl.status === 0, (cl.stdout || cl.stderr || '').slice(-300));
fs.rmSync(dst, { recursive: true, force: true });
console.log(`testar-instalacao: ${falhas.length} falha(s), ${Date.now() - t0} ms`);
process.exit(falhas.length ? 1 : 0);
