// Casos da parte B da 0.8.0 (referências sob demanda, docs/inventario-plugins-2026-11.md), chamados pelo
// scripts/testar-hooks.js. Fica num arquivo à parte para não misturar com os casos da parte A.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = function testarReferencias({ caso, validarCopia, tmp, RAIZ, hook, ctx }) {
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

  // ---- Lote 1 · engenheiro-software e testador-qa ----
  const secRef = (n) => (ler('agents', n + '.md').split('\n## Referências sob demanda')[1] || '').split('\n## ')[0];
  caso('0.8.0 B1 engenheiro-software: seção "Referências sob demanda" com erro de build, depuração, arquitetura, versão da biblioteca e plataformas',
    ['engenharia/erro-de-build.md', 'engenharia/depurar.md', 'engenharia/arquitetura.md', 'metodo/fonte-oficial-da-versao.md', 'plataformas/INDICE.md', 'scripts/checar-ferramenta.js'].every((s) => secRef('engenheiro-software').includes('${CLAUDE_PLUGIN_ROOT}/' + (s.startsWith('scripts') ? s : 'conhecimento/' + s))), secRef('engenheiro-software').slice(0, 200) || 'sem a seção');
  caso('0.8.0 B1 testador-qa: seção com TDD, padrões de teste, ponta a ponta, navegador e verificação',
    ['tdd.md', 'padroes-de-teste.md', 'e2e.md', 'teste-no-navegador.md', 'verificacao.md'].every((s) => secRef('testador-qa').includes('/conhecimento/engenharia/' + s)), secRef('testador-qa').slice(0, 200) || 'sem a seção');
  caso('0.8.0 B1 evals: engenheiro e testador com caso de regressão que cobra a leitura da referência',
    /conhecimento\/engenharia\/erro-de-build\.md/.test(ler('evals', 'engenheiro-software.md')) && /conhecimento\/engenharia\/verificacao\.md/.test(ler('evals', 'testador-qa.md')), 'falta o caso');
  // T15 portão de qualidade (modelo para o projeto do usuário): achado bloqueante sai 1; limpo 0; incompleto 2.
  const qg = path.join(RAIZ, 'modelos', 'quality-gate.mjs');
  const rodaQG = (ferr, rel) => { const f = path.join(pastaEsp, 'rel-' + Math.random().toString(36).slice(2) + '.json'); fs.writeFileSync(f, JSON.stringify(rel)); const r = spawnSync(process.execPath, [qg, ferr, f], { encoding: 'utf8' }); return r.status; };
  const sgOk = { results: [], errors: [], paths: { scanned: ['a.js'] } };
  caso('0.8.0 B1 quality-gate: Semgrep com achado HIGH sai 1, limpo sai 0, varredura sem arquivo lido sai 2',
    existe('modelos', 'quality-gate.mjs') && rodaQG('semgrep', { ...sgOk, results: [{ extra: { severity: 'HIGH' } }] }) === 1 && rodaQG('semgrep', sgOk) === 0 && rodaQG('semgrep', { ...sgOk, paths: { scanned: [] } }) === 2, 'saídas erradas');
  caso('0.8.0 B1 quality-gate: axe com violação séria sai 1; página de erro (file://) sai 2',
    existe('modelos', 'quality-gate.mjs') && rodaQG('axe', [{ url: 'http://localhost:3000/', violations: [{ impact: 'serious' }] }]) === 1 && rodaQG('axe', [{ url: 'file:///c:/erro.html', violations: [] }]) === 2, 'saídas erradas');
  // T21 gerenciador de pacotes pelo lockfile ou pelo packageManager.
  const gp = path.join(RAIZ, 'scripts', 'gerenciador-pacotes.js');
  const pastaGP = (arqs) => { const d = fs.mkdtempSync(path.join(pastaEsp, 'gp-')); for (const [n, c] of Object.entries(arqs)) fs.writeFileSync(path.join(d, n), c); return d; };
  const rodaGP = (d) => { const r = spawnSync(process.execPath, [gp, d], { encoding: 'utf8' }); return { code: r.status, out: r.stdout || '' }; };
  let g1 = rodaGP(pastaGP({ 'pnpm-lock.yaml': 'lockfileVersion: 9\n' }));
  caso('0.8.0 B1 gerenciador-pacotes: pasta com pnpm-lock.yaml → pnpm (sai 0)', existe('scripts', 'gerenciador-pacotes.js') && g1.code === 0 && /^gerenciador: pnpm /.test(g1.out), g1.out);
  g1 = rodaGP(pastaGP({ 'package.json': '{"packageManager":"yarn@4.1.0"}', 'package-lock.json': '{}' }));
  caso('0.8.0 B1 gerenciador-pacotes: packageManager do package.json vence e o lockfile de outro gerenciador vira aviso', g1.code === 0 && /^gerenciador: yarn /.test(g1.out) && /atenção: .*npm/.test(g1.out), g1.out);
  g1 = rodaGP(pastaGP({}));
  caso('0.8.0 B1 gerenciador-pacotes: sem sinal → sai 1 e manda perguntar', g1.code === 1 && /Pergunte ao usuário/.test(g1.out), g1.out);

  // ---- Índice de referências e acionamento pelo roteador ----
  const projRef = path.join(tmp, 'projeto-refs'); fs.mkdirSync(path.join(projRef, '.claude', 'base'), { recursive: true });
  fs.writeFileSync(path.join(projRef, '.claude', 'base', 'desligado'), ''); // sem memória nem grafo: só o roteamento
  const cfgRef = path.join(projRef, '.claude', 'base', 'config.json');
  const rotRef = (pedido) => {
    const r = hook('roteador.js', { prompt: pedido, cwd: projRef, hook_event_name: 'UserPromptSubmit' });
    const t = ctx(r);
    const linha = (t.split('\n').find((l) => l.startsWith('Referências para este pedido')) || '');
    const refs = [...linha.matchAll(/`([^`]+)` \(para `([^`]+)`\)/g)].map((m) => ({ arquivo: path.relative(RAIZ, m[1]).split(path.sep).join('/'), agente: m[2].replace(/^agentes-ultimate:/, '') }));
    return { t, refs, agentes: (t.match(/Agentes indicados[^:]*: ([^.]+)\./) || [])[1] || '' };
  };
  const ind = (() => { try { return JSON.parse(ler('conhecimento', 'indice.json')); } catch (e) { return { referencias: [] }; } })();
  const fixo = (() => { try { return require(path.join(RAIZ, 'scripts', 'indice-referencias.js')).montar(RAIZ); } catch (e) { return null; } })();
  caso('0.8.0 B índice: conhecimento/indice.json gerado pelo gerar-agentes.js a partir do cabeçalho de cada referência', !!fixo && fixo.problemas.length === 0 &&
    JSON.stringify(fixo.referencias) === JSON.stringify(ind.referencias), fixo ? fixo.problemas.join('; ') || 'indice.json diferente do cabeçalho' : 'sem scripts/indice-referencias.js');
  v = validarCopia({ 'conhecimento/teste/sem-ref.md': '<!-- Texto próprio do agentes-ultimate. Teste. -->\n# Sem a linha ref\n' });
  caso('0.8.0 B índice: validar acusa referência sem a linha "ref:"', v.code === 1 && /sem-ref\.md: 2ª linha sem/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'conhecimento/teste/sem-teste.md': ok + '# x\n' });
  caso('0.8.0 B índice: validar acusa referência sem os 2+1 pedidos de teste e o indice.json desatualizado', v.code === 1 && /sem-teste\.md: 3ª linha sem/.test(v.out) && /indice\.json desatualizado/.test(v.out), v.out.slice(-300));
  // Acionamento: para cada tema, 2 pedidos que puxam a referência e 1 que não puxa, contra o roteador real.
  let falhasAcion = [];
  for (const r of ind.referencias) {
    for (const p of (r.teste || {}).sim || []) { const x = rotRef(p); if (!x.refs.some((y) => y.arquivo === r.arquivo)) falhasAcion.push(`"${p}" não puxou ${r.arquivo}`); }
    for (const p of (r.teste || {}).nao || []) { const x = rotRef(p); if (x.refs.some((y) => y.arquivo === r.arquivo)) falhasAcion.push(`"${p}" puxou ${r.arquivo} sem dever`); }
  }
  caso(`0.8.0 B acionamento: ${ind.referencias.length} tema(s) × (2 pedidos que puxam + 1 que não), roteador real`, ind.referencias.length > 0 && !falhasAcion.length, falhasAcion.slice(0, 6).join(' | ') || 'índice vazio');
  const muitos = rotRef('corrija o erro de build do typescript, a api, o teste e2e, a migração, o desempenho, o git e o ci do sistema');
  const porAg = {}; for (const y of muitos.refs) porAg[y.agente] = (porAg[y.agente] || 0) + 1;
  caso('0.8.0 B acionamento: no máximo 3 referências por agente e 6 por pedido', muitos.refs.length <= 6 && Object.values(porAg).every((n) => n <= 3), JSON.stringify(porAg));
  const trivialRef = rotRef('quanto é 15% de 2300?');
  caso('0.8.0 B acionamento: pergunta trivial não ganha referência', !trivialRef.refs.length, JSON.stringify(trivialRef.refs));

  // Ponta a ponta (critério do usuário): pedido amplo aciona tudo sozinho. Liga no lote 3 (conteúdo de design).
  const E2E = existe('conhecimento', 'design', 'metodo.md');
  const espera = [
    ['conhecimento/design/metodo.md', 'designer-paineis', 'método do impeccable'],
    ['conhecimento/design/apple/INDICE.md', 'designer-paineis', 'regras da Apple'],
    ['conhecimento/design/detalhes-interface.md', 'designer-paineis', 'detalhes de interface do Jakub'],
    ['conhecimento/design/movimento/INDICE.md', 'engenheiro-software', 'animação do Emil'],
    ['conhecimento/design/revisao-tela.md', 'revisor', 'revisão de design (Superfuture)'],
  ];
  for (const pedido of ['redesenhe meu app com visual premium', 'crie um site institucional bonito']) {
    for (const ligado of [false, true]) {
      fs.writeFileSync(cfgRef, JSON.stringify(ligado ? { integracoes: ['21st'] } : {}));
      const x = rotRef(pedido);
      const faltam = espera.filter(([a, ag]) => !x.refs.some((y) => y.arquivo === a && y.agente === ag)).map((e) => e[2]);
      const c21 = x.refs.some((y) => y.arquivo === 'conhecimento/design/componentes.md' && y.agente === 'engenheiro-software');
      const ags = ['designer-paineis', 'engenheiro-software', 'revisor'].every((a) => x.agentes.includes('agentes-ultimate:' + a));
      const ok2 = ags && !faltam.length && c21 === ligado && /\/checklist-lancamento/.test(x.t);
      const nome = `0.8.0 B ponta a ponta: "${pedido}"${ligado ? ' com o 21st ligado' : ''} → designer, engenheiro e revisor, referências certas, ${ligado ? 'componentes do 21st' : 'sem o 21st'} e o /checklist-lancamento`;
      const det = `agentes: ${x.agentes || 'nenhum'}; faltam: ${faltam.join(', ') || '-'}; 21st: ${c21}; checklist: ${/checklist-lancamento/.test(x.t)}`;
      if (E2E) caso(nome, ok2, det); else console.log(`PENDENTE (lote 3) ${nome} → hoje: ${ok2 ? 'passaria' : det}`);
    }
  }
  fs.writeFileSync(cfgRef, '{}');
};
