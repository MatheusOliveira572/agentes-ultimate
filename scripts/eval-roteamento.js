#!/usr/bin/env node
// Eval de roteamento contra o hooks/roteador.js real, sem rede nem modelo (ideia de addyosmani/agent-skills/scripts/run-evals.js
// @301b02b, © 2025 Addy Osmani, MIT; reescrito; alterado por agentes-ultimate; licença em terceiros/addyosmani-agent-skills/).
//   node scripts/eval-roteamento.js [--casos <arquivo.json>] [--piso 0.9]
// Casos em evals/roteamento.json: { "pedido", "pacote" (deve vir em 1º) } ou { "pedido", "nao": [pacotes que não podem vir em 1º] }.
// Relata também as palavras que levam a mais de um pacote e as marcadas como ambíguas. Sai 1 abaixo do piso.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const arg = (n, p) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : p; };
const casos = JSON.parse(fs.readFileSync(arg('--casos', path.join(RAIZ, 'evals', 'roteamento.json')), 'utf8')).casos;
const piso = Number(arg('--piso', '0.9'));
const pac = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pacotes', 'pacotes.json'), 'utf8'));
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-rot-'));
fs.mkdirSync(path.join(pasta, '.claude', 'base'), { recursive: true });
fs.writeFileSync(path.join(pasta, '.claude', 'base', 'desligado'), '');
const casa = path.join(pasta, 'casa'); fs.mkdirSync(casa);
const nomeDe = {}; for (const [id, p] of Object.entries(pac.pacotes)) nomeDe[p.nome] = id;
const t0 = Date.now();

function primeiro(pedido) {
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'roteador.js')], { windowsHide: true, encoding: 'utf8', input: JSON.stringify({ prompt: pedido, cwd: pasta, hook_event_name: 'UserPromptSubmit' }), env: { ...process.env, HOME: casa, USERPROFILE: casa, AGENTES_ULTIMATE_SEM_PASTA: '' } });
  let c = '';
  try { c = JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch (e) { return null; }
  const l = c.split('\n').find((x) => x.startsWith('Pacotes:'));
  return l ? (nomeDe[l.replace('Pacotes: ', '').split(' (')[0]] || null) : null;
}

let certos = 0;
const erros = [];
for (const c of casos) {
  const p = primeiro(c.pedido);
  const ok = c.pacote !== undefined ? p === c.pacote : !(c.nao || []).includes(p);
  if (ok) certos++; else erros.push(`  "${c.pedido}" → ${p || 'nenhum'} (esperado: ${c.pacote !== undefined ? c.pacote : 'não ' + c.nao.join('/')})`);
}
fs.rmSync(pasta, { recursive: true, force: true });

const quem = {};
for (const [id, p] of Object.entries(pac.pacotes)) for (const w of p.palavras || []) (quem[w] = quem[w] || []).push(id);
const repetidas = Object.entries(quem).filter(([, v]) => v.length > 1);
const amb = new Set(pac.ambiguas || []);
const semMarca = repetidas.filter(([w]) => !amb.has(w)).map(([w, v]) => `${w} (${v.join(', ')})`);
if (repetidas.length) console.log(`palavras em mais de um pacote: ${repetidas.map(([w, v]) => `${w} (${v.join(', ')})`).join('; ')}`);
if (semMarca.length) console.log(`repetidas sem a marca de ambígua: ${semMarca.join('; ')}`);
if (erros.length) console.log('erros:\n' + erros.join('\n'));
const taxa = casos.length ? certos / casos.length : 0;
console.log(`eval-roteamento: ${casos.length} casos, ${certos} certos, ${(taxa * 100).toFixed(1)}% (piso ${(piso * 100).toFixed(0)}%), ${repetidas.length} palavra(s) repetida(s), ${Date.now() - t0} ms`);
process.exit(taxa >= piso ? 0 : 1);
