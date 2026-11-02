// Verificador do projeto e sugestão de compactar, chamados pelo hooks/atividade.js (sem abrir processo de gancho a mais).
// Verificador: .claude/base/config.json → "verificador": { "comando": ["node", "node_modules/eslint/bin/eslint.js", "{arquivo}"], "extensoes": [".js"],
// "aoParar": ["node", "scripts/testes.js"] }. No Windows, programa .cmd (npm, npx, eslint, prettier) não roda sem shell: chame o .js
// dele com o node, como acima. Nome de arquivo que começa com "-" vai como "./-nome", para não virar opção do programa.
// O comando é uma lista e roda sem shell: o nome do arquivo editado vai como argumento e nunca é interpretado (%VAR%, $(...), aspas).
// Comando em texto, na edição, não roda (só avisa para usar a lista). "aoParar" em texto roda pelo shell: é fixo, sem nome de arquivo.
// Sem config, silêncio. Falhou → aviso. Passou do tempo (5 s na edição, 30 s ao parar) → corta e avisa; nunca trava o trabalho.
// Ideia de pbakaus/impeccable hook.mjs @e89e3ad, © 2025 Paul Bakaus, Apache-2.0, e dos ganchos do affaan-m/ECC @b38be6a,
// © 2026 Affaan Mustafa, MIT; reescrito; alterado por agentes-ultimate; licenças em terceiros/.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function config(cwd) {
  try { return JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'base', 'config.json'), 'utf8')).verificador || null; } catch (e) { return null; }
}
function rodar(comando, cwd, limiteMs) {
  const opc = { windowsHide: true, cwd, encoding: 'utf8', timeout: limiteMs, maxBuffer: 1024 * 1024 };
  const r = Array.isArray(comando) ? spawnSync(String(comando[0]), comando.slice(1).map(String), { windowsHide: true, ...opc, shell: false }) : spawnSync(String(comando), { windowsHide: true, ...opc, shell: true });
  const nome = (Array.isArray(comando) ? comando.join(' ') : String(comando)).slice(0, 80);
  if (r.error && r.error.code === 'ETIMEDOUT') return `verificador cortado em ${limiteMs / 1000} s: ${nome}`;
  if (r.error) return `verificador não rodou (${r.error.code || r.error.message}): ${nome}`;
  if (r.status !== 0) return `verificador acusou (saída ${r.status}): ${((r.stdout || '') + (r.stderr || '')).trim().slice(0, 400)}`;
  return null;
}
function aoEditar(cwd, rel) {
  const c = config(cwd);
  if (!c || !c.comando || !rel) return null;
  if (Array.isArray(c.extensoes) && !c.extensoes.includes(path.extname(rel))) return null;
  if (!Array.isArray(c.comando)) return 'verificador não rodou: "comando" precisa ser uma lista, como ["node", "regras.js", "{arquivo}"] (em texto, o nome do arquivo passaria por um shell)';
  const arg = rel.startsWith('-') ? './' + rel : rel;
  return rodar(c.comando.map((a) => String(a).split('{arquivo}').join(arg)), cwd, 5000);
}
function aoParar(cwd) {
  const c = config(cwd);
  return c && c.aoParar ? rodar(c.aoParar, cwd, 30000) : null;
}
// Compactar num marco: depois de 50 chamadas e a cada 25, uma linha; nunca interrompe. Conta por sessão, fora do git.
function sugerirCompactar(cwd, sessao) {
  const f = path.join(cwd, '.claude', 'base', '.contagem.json');
  let c = {};
  try { c = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { /* 1ª vez */ }
  const n = c.sessao === sessao ? (c.n || 0) + 1 : 1;
  try { fs.writeFileSync(f, JSON.stringify({ sessao, n })); } catch (e) { /* sem efeito */ }
  return n >= 50 && (n - 50) % 25 === 0 ? `${n} chamadas nesta sessão: quando fechar o item em andamento (depois de um commit), é um bom momento de compactar. Nunca no meio de uma tarefa.` : null;
}
module.exports = { aoEditar, aoParar, sugerirCompactar };
