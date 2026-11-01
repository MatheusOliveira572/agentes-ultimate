// Casos da parte B da 0.8.0 (referências sob demanda, docs/inventario-plugins-2026-11.md), chamados pelo
// scripts/testar-hooks.js. Fica num arquivo à parte para não misturar com os casos da parte A.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = function testarReferencias({ caso, validarCopia, tmp, RAIZ }) {
  const ler = (...p) => { try { return fs.readFileSync(path.join(RAIZ, ...p), 'utf8'); } catch (e) { return ''; } };
  const existe = (...p) => fs.existsSync(path.join(RAIZ, ...p));

  // ---- Lote 0 · infraestrutura ----
  // T31 checar-ferramenta: confere e nunca instala; roda de uma pasta com espaço e acento no caminho.
  const pastaEsp = path.join(tmp, 'pasta com espaço ação'); fs.mkdirSync(pastaEsp, { recursive: true });
  const chk = path.join(pastaEsp, 'checar-ferramenta.js');
  if (existe('scripts', 'checar-ferramenta.js')) fs.copyFileSync(path.join(RAIZ, 'scripts', 'checar-ferramenta.js'), chk);
  const rodaChk = (...a) => { const r = spawnSync(process.execPath, [chk, ...a], { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
  let c = rodaChk('node');
  caso('0.8.0 B0 checar-ferramenta: node instalado → sai 0 com a versão (pasta com espaço e acento)', c.code === 0 && /node: instalado, v\d+/.test(c.out), c.out);
  c = rodaChk('ferramenta-que-nao-existe-zz9');
  caso('0.8.0 B0 checar-ferramenta: ausente → "não instalado", sai 1, sem instalar', c.code === 1 && /não instalado/.test(c.out) && !/npm i|install/i.test(c.out), c.out);
  c = rodaChk('node', 'ferramenta-que-nao-existe-zz9');
  caso('0.8.0 B0 checar-ferramenta: várias, uma ausente → sai 1 e a linha-resumo conta 1 ausente', c.code === 1 && /2 pedida\(s\), 1 instalada\(s\), 1 ausente\(s\)/.test(c.out), c.out);
  c = rodaChk('node & calc');
  caso('0.8.0 B0 checar-ferramenta: nome com espaço ou símbolo é recusado (sai 2, nada roda)', c.code === 2 && /nome inválido/.test(c.out), c.out);

  // Licenças e créditos dos 8 projetos copiados.
  const pastas = ['emilkowalski-skills', 'jakubkrehel-skills', 'addyosmani-agent-skills', 'upstash-context7', 'serafimcloud-21st', 'usestrix-strix', 'affaan-m-ECC', 'pbakaus-impeccable'];
  caso('0.8.0 B0 terceiros: LICENSE de cada projeto copiado e o NOTICE do impeccable', pastas.every((p) => /License|LICENSE/.test(ler('terceiros', p, 'LICENSE'))) && /Third-Party Notices/.test(ler('terceiros', 'pbakaus-impeccable', 'NOTICE.md')), pastas.filter((p) => !existe('terceiros', p, 'LICENSE')).join(', ') || 'falta NOTICE');
  const cred = ler('CREDITOS.md');
  const repos = ['emilkowalski/skills', 'jakubkrehel/skills', 'addyosmani/agent-skills', 'upstash/context7', 'serafimcloud/21st', 'usestrix/strix', 'affaan-m/ECC', 'pbakaus/impeccable', 'dickwu/apple-design-skill'];
  caso('0.8.0 B0 CREDITOS.md: cada projeto com o commit fixo (40 hex) e a licença', repos.every((r) => new RegExp(`\\| ${r.replace('/', '\\/')} \\| [0-9a-f]{40} \\|`).test(cred)), repos.filter((r) => !cred.includes('| ' + r + ' | ')).join(', ') || 'sem commit');
  caso('0.8.0 B0 CREDITOS.md: ECC só do original e apple sem cópia', /nunca da cópia WorldFlowAI/.test(cred) && /apple-design-skill[^\n]*Nada copiado/.test(cred), 'falta a ressalva');

  // validar.js: cada regra nova vista falhando numa cópia.
  const ok = '<!-- Texto próprio do agentes-ultimate. Teste. -->\n<!-- ref: tema=teste; palavras=teste; agentes=engenheiro-software -->\n# Teste\n';
  let v = validarCopia({ 'conhecimento/teste/grande.md': ok + 'x'.repeat(16 * 1024) });
  caso('0.8.0 B0 validar: arquivo de referência acima de 15 KB é erro', v.code === 1 && /grande\.md: 16\.\d KB/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'conhecimento/teste/sem-credito.md': '# Sem crédito\n' });
  caso('0.8.0 B0 validar: referência sem a linha de crédito é erro', v.code === 1 && /sem-credito\.md: 1ª linha sem o crédito/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'conhecimento/teste/sem-licenca.md': '<!-- Adaptado de x/y/z.md @abcdef1, © X, MIT. Alterações: tradução; alterado por agentes-ultimate. Licença em terceiros/nao-existe/. -->\n# x\n' });
  caso('0.8.0 B0 validar: crédito apontando para licença que não está em terceiros/ é erro', v.code === 1 && /sem-licenca\.md: crédito sem "Licença em terceiros/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'conhecimento/teste/sem-alteracao.md': '<!-- Adaptado de usestrix/strix/a.md @abcdef1, © OmniSecure, Apache-2.0. Licença em terceiros/usestrix-strix/. -->\n# x\n' });
  caso('0.8.0 B0 validar: crédito sem marcar as alterações (Apache §4b) é erro', v.code === 1 && /sem-alteracao\.md: crédito sem "Alterações/.test(v.out), v.out.slice(-300));
  const agBase = ler('agents', 'curador.md');
  const comGatilhos = (n, alvo) => agBase.replace('\n## Critério de pronto', '\n## Referências sob demanda\n' +
    Array.from({ length: n }, (_, i) => `- Quando caso ${i}, leia \`\${CLAUDE_PLUGIN_ROOT}/${alvo}\`.`).join('\n') + '\n\n## Critério de pronto');
  v = validarCopia({ 'agents/curador.md': comGatilhos(1, 'conhecimento/nao-existe.md') });
  caso('0.8.0 B0 validar: agente citando ${CLAUDE_PLUGIN_ROOT}/<arquivo> que não existe é erro', v.code === 1 && /curador\.md: cita \$\{CLAUDE_PLUGIN_ROOT\}\/conhecimento\/nao-existe\.md/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'agents/curador.md': comGatilhos(9, 'conhecimento/LEIA-ME.md') });
  caso('0.8.0 B0 validar: mais de 8 linhas de gatilho num agente é erro', v.code === 1 && /curador\.md: 9 linhas de gatilho/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'agents/curador.md': comGatilhos(8, 'conhecimento/LEIA-ME.md') });
  caso('0.8.0 B0 validar: 8 gatilhos para arquivo que existe passam', v.code === 0, v.out.slice(-300));
};
