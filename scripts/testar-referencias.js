// Casos da parte B da 0.8.0 (referências sob demanda, docs/inventario-plugins-2026-11.md), chamados pelo
// scripts/testar-hooks.js. Fica num arquivo à parte para não misturar com os casos da parte A.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = function testarReferencias({ caso, validarCopia, tmp, RAIZ, hook, ctx }) {
  const ler = (...p) => { try { return fs.readFileSync(path.join(RAIZ, ...p), 'utf8'); } catch (e) { return ''; } };
  const existe = (...p) => fs.existsSync(path.join(RAIZ, ...p));

  try { require('./testar-painel.js')({ caso, tmp, RAIZ, hook }); } catch (e) { caso('painel: scripts/testar-painel.js roda', false, e.message); }

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

  // ---- Lote 2 · designer-documentos e design comum (parte 1) ----
  caso('0.8.0 B2 designer-documentos: seção com tipografia, cor, layout, piso, crítica, modos e ilustração técnica',
    ['design/tipografia/INDICE.md', 'design/cor/INDICE.md', 'design/layout/INDICE.md', 'design/piso-de-qualidade.md', 'design/critica/INDICE.md', 'design/modos/ler.md', 'documentos/ilustracao-tecnica.md', 'design/acessibilidade/INDICE.md']
      .every((s) => secRef('designer-documentos').includes('/conhecimento/' + s)), secRef('designer-documentos').slice(0, 200) || 'sem a seção');
  caso('0.8.0 B2 eval do designer-documentos cobra a leitura da tipografia', /conhecimento\/design\/tipografia\/INDICE\.md/.test(ler('evals', 'designer-documentos.md')), 'falta o caso');
  // T7 teardown: os 5 testes da ferramenta passam numa pasta com espaço e acento; mexer na geometria faz um falhar.
  const tdOrig = path.join(RAIZ, 'ferramentas', 'teardown');
  const tdCopia = path.join(pastaEsp, 'teardown');
  const testesTD = existe('ferramentas', 'teardown', 'scripts') ? fs.readdirSync(path.join(tdOrig, 'scripts')).filter((f) => /^test-.*\.cjs$/.test(f)) : [];
  const rodaTD = () => testesTD.map((t) => ({ t, code: spawnSync(process.execPath, [path.join(tdCopia, 'scripts', t)], { cwd: tdCopia, encoding: 'utf8' }).status }));
  if (testesTD.length) fs.cpSync(tdOrig, tdCopia, { recursive: true });
  const td1 = rodaTD();
  caso('0.8.0 B2 teardown: os 5 testes da ferramenta passam (Node, pasta com espaço e acento)', testesTD.length === 5 && td1.every((x) => x.code === 0), JSON.stringify(td1));
  if (testesTD.length) { const g = path.join(tdCopia, 'assets', 'geometry.js'); fs.writeFileSync(g, fs.readFileSync(g, 'utf8').replace(/Math\.PI/g, '3')); }
  const td2 = rodaTD();
  caso('0.8.0 B2 teardown: trocar Math.PI por 3 na geometria faz o test-geometry falhar', td2.some((x) => x.t === 'test-geometry.cjs' && x.code !== 0), JSON.stringify(td2));
  caso('0.8.0 B2 teardown: LICENSE do autor junto da ferramenta', /Jakub Krehel/.test(ler('ferramentas', 'teardown', 'LICENSE')), 'sem LICENSE');

  // ---- Lote 4 · redator, comunicação, CS, produto, estratégia, marketing, planejador, pesquisador ----
  const b4 = { redator: 'escrita/texto-de-interface.md', 'comunicador-corporativo': 'escrita/texto-de-interface.md', 'especialista-cs': 'design/primeiro-uso.md', 'gerente-produto': 'engenharia/lancar.md',
    estrategista: 'metodo/refinar-ideia.md', 'estrategista-marketing': 'design/modos/persuadir.md', planejador: 'metodo/quebrar-tarefas.md', pesquisador: 'metodo/fonte-oficial-da-versao.md' };
  for (const [ag, arq] of Object.entries(b4)) {
    caso(`0.8.0 B4 ${ag}: seção cita ${arq} e o eval cobra a leitura`, secRef(ag).includes('/conhecimento/' + arq) && ler('evals', ag + '.md').includes('conhecimento/' + arq), 'falta na seção ou no eval');
  }
  caso('0.8.0 B4 lancar.md aponta para a skill checklist-lancamento em vez de duplicar a lista', /\/checklist-lancamento/.test(ler('conhecimento', 'engenharia', 'lancar.md')), 'falta');
  caso('0.8.0 B4 marketing continua dentro de 90 linhas com a seção e sem marca [conferir]', ler('agents', 'estrategista-marketing.md').split('## Protocolo comum')[0].split('\n').length <= 90 && !/\[conferir\]/.test(ler('fonte', 'agentes', 'marketing', 'estrategista-marketing.md')), 'passou de 90 ou voltou [conferir]');

  // ---- Vigia das fontes: registro + conferência semanal só por metadados ----
  v = validarCopia({ 'conhecimento/teste/fora.md': '<!-- Adaptado de fulano/projeto-x/a.md @abcdef1, © 2026 Fulano, MIT. Alterações: tradução; alterado por agentes-ultimate. Licença em terceiros/emilkowalski-skills/. -->\n' + ok.split('\n').slice(1).join('\n') });
  caso('0.8.0 B fontes: linha de crédito que cita fonte fora de fontes/fontes.json é erro', v.code === 1 && /cita fulano\/projeto-x, que não está em fontes\/fontes\.json/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'terceiros/sem-registro/LICENSE': 'MIT License\n' });
  caso('0.8.0 B fontes: pasta em terceiros/ sem fonte no registro é erro', v.code === 1 && /terceiros\/sem-registro\/ não corresponde/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'CREDITOS.md': ler('CREDITOS.md') + '| fulano/outro | ' + 'a'.repeat(40) + ' | MIT | x | y |\n' });
  caso('0.8.0 B fontes: CREDITOS.md citando fonte fora do registro é erro', v.code === 1 && /CREDITOS\.md cita fulano\/outro/.test(v.out), v.out.slice(-300));
  caso('0.8.0 B fontes: registro com a lista origem → destino de cada arquivo adaptado (ex.: ECC build-error-resolver → erro-de-build.md)',
    /"origem": "agents\/build-error-resolver\.md",\s*"destino": "conhecimento\/engenharia\/erro-de-build\.md"/.test(ler('fontes', 'fontes.json')), 'falta no registro');
  // Gancho numa cópia do plugin (grava fontes/novidades.md lá, nunca no repositório), com a API simulada.
  const plugV = path.join(tmp, 'plugin-vigia'); fs.mkdirSync(path.join(plugV, 'hooks'), { recursive: true }); fs.mkdirSync(path.join(plugV, 'fontes'), { recursive: true });
  const casaV = path.join(tmp, 'casa-vigia'); fs.mkdirSync(casaV, { recursive: true });
  if (existe('hooks', 'vigia-fontes.js')) fs.copyFileSync(path.join(RAIZ, 'hooks', 'vigia-fontes.js'), path.join(plugV, 'hooks', 'vigia-fontes.js'));
  const regV = { fontes: [{ repo: 'dono/proj', licenca: 'MIT', branch: 'main', pasta: 'dono-proj', commit_usado: 'a'.repeat(40), ultimo_conferido: 'a'.repeat(40), conferido_em: '2026-10-01', vigiar: true, arquivos: [{ origem: 'skills/x/SKILL.md', destino: 'conhecimento/x.md' }] }] };
  fs.writeFileSync(path.join(plugV, 'fontes', 'fontes.json'), JSON.stringify(regV));
  const simular = (tabela) => { const f = path.join(tmp, 'api-' + Math.random().toString(36).slice(2) + '.json'); fs.writeFileSync(f, JSON.stringify(tabela)); return f; };
  const novV = path.join(plugV, 'fontes', 'novidades.md');
  const rodaV = (args, sim, estado) => {
    if (estado !== undefined) { fs.mkdirSync(path.join(casaV, '.claude', 'agentes-ultimate'), { recursive: true }); fs.writeFileSync(path.join(casaV, '.claude', 'agentes-ultimate', 'vigia-fontes.json'), JSON.stringify(estado)); }
    const r = spawnSync(process.execPath, [path.join(plugV, 'hooks', 'vigia-fontes.js'), ...args], { encoding: 'utf8', env: { ...process.env, HOME: casaV, USERPROFILE: casaV, AGENTES_ULTIMATE_VIGIA_SIMULAR: sim || '' } });
    return { code: r.status, out: r.stdout || '' };
  };
  const apiMudou = (licenca) => simular({
    '/repos/dono/proj': { status: 200, body: { license: { spdx_id: licenca }, default_branch: 'main' } },
    [`/repos/dono/proj/compare/${'a'.repeat(40)}...main`]: { status: 200, body: { ahead_by: 3, commits: [{ commit: { message: 'corrige a regra de contraste' } }], files: [{ filename: 'skills/x/SKILL.md' }, { filename: 'CHANGELOG.md' }] } },
    '/repos/dono/proj/releases?per_page=5': { status: 200, body: [{ tag_name: 'v2.0.0', published_at: '2026-10-20T00:00:00Z' }] },
  });
  fs.rmSync(novV, { force: true });
  let rv = rodaV(['--agora'], apiMudou('MIT'), {});
  const nv = fs.existsSync(novV) ? fs.readFileSync(novV, 'utf8') : '';
  caso('0.8.0 B vigia: mudança detectada (API simulada) → novidades.md com commits, release, CHANGELOG e o arquivo nosso afetado',
    rv.code === 0 && /3 commit\(s\) novo/.test(nv) && /v2\.0\.0/.test(nv) && /CHANGELOG mudou/.test(nv) && /skills\/x\/SKILL\.md → conhecimento\/x\.md/.test(nv), nv.slice(0, 300) || 'sem novidades.md');
  rv = rodaV([], '', { ultimaConferencia: new Date().toISOString(), ultimaTentativa: new Date().toISOString() });
  caso('0.8.0 B vigia: início de sessão mostra "1 fonte com novidades: rode /atualizar-fontes"', /1 fonte com novidades: rode \/atualizar-fontes/.test(rv.out), rv.out);
  fs.rmSync(novV, { force: true });
  rv = rodaV(['--agora'], simular({ '*': { erro: 'ENOTFOUND' } }), {});
  caso('0.8.0 B vigia: sem rede → silêncio (sai 0, nada escrito, nada na tela)', rv.code === 0 && !rv.out && !fs.existsSync(novV), rv.out);
  rv = rodaV(['--agora'], simular({ '/repos/dono/proj': { status: 403, body: { message: 'API rate limit exceeded' } } }), {});
  caso('0.8.0 B vigia: limite da API → silêncio', rv.code === 0 && !rv.out && !fs.existsSync(novV), rv.out);
  rv = rodaV(['--agora'], apiMudou('GPL-3.0'), {});
  const nl = fs.existsSync(novV) ? fs.readFileSync(novV, 'utf8') : '';
  const sl = rodaV([], '', { ultimaConferencia: new Date().toISOString(), ultimaTentativa: new Date().toISOString() });
  caso('0.8.0 B vigia: licença mudou para restritiva → alerta forte no arquivo e na linha do início de sessão',
    /ATENÇÃO: a licença mudou de MIT para GPL-3\.0/.test(nl) && /não traga nada novo/i.test(nl) && /ATENÇÃO: licença mudou/.test(sl.out), nl.slice(0, 300) + ' | ' + sl.out);
  // 1 vez por semana: conferido há 2 dias → o início de sessão não dispara a conferência; há 8 dias → dispara (em 2º plano).
  const esperar = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  const esperarArquivo = (f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fs.existsSync(f)) return true; esperar(100); } return fs.existsSync(f); };
  fs.rmSync(novV, { force: true });
  const dias = (n) => new Date(Date.now() - n * 864e5).toISOString();
  rodaV([], apiMudou('MIT'), { ultimaConferencia: dias(2), ultimaTentativa: dias(2) });
  const naoRodou = !esperarArquivo(novV, 2500);
  rodaV([], apiMudou('MIT'), { ultimaConferencia: dias(8), ultimaTentativa: dias(8) });
  const rodou = esperarArquivo(novV, 8000);
  caso('0.8.0 B vigia: controle de 1 vez por semana (2 dias → não confere; 8 dias → confere em segundo plano)', naoRodou && rodou, `2 dias: ${naoRodou ? 'não rodou' : 'rodou'}; 8 dias: ${rodou ? 'rodou' : 'não rodou'}`);
  caso('0.8.0 B vigia: gancho registrado no SessionStart e skill /atualizar-fontes só do usuário',
    /vigia-fontes\.js/.test(ler('hooks', 'hooks.json')) && /^disable-model-invocation: true/m.test(ler('skills', 'atualizar-fontes', 'SKILL.md')) && /pesquisador/.test(ler('skills', 'atualizar-fontes', 'SKILL.md')), 'falta');

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
    // Referência de integração opcional (requer=…) só é testada com a integração ligada no config do projeto.
    fs.writeFileSync(cfgRef, JSON.stringify(r.requer ? { integracoes: [r.requer] } : {}));
    for (const p of (r.teste || {}).sim || []) { const x = rotRef(p); if (!x.refs.some((y) => y.arquivo === r.arquivo)) falhasAcion.push(`"${p}" não puxou ${r.arquivo}`); }
    for (const p of (r.teste || {}).nao || []) { const x = rotRef(p); if (x.refs.some((y) => y.arquivo === r.arquivo)) falhasAcion.push(`"${p}" puxou ${r.arquivo} sem dever`); }
  }
  fs.writeFileSync(cfgRef, '{}');
  const sem21 = rotRef('use um componente pronto do 21st com shadcn no app react');
  caso('0.8.0 B acionamento: referência de integração desligada (21st) não entra', !sem21.refs.some((y) => y.arquivo === 'conhecimento/design/componentes.md'), JSON.stringify(sem21.refs));
  caso(`0.8.0 B acionamento: ${ind.referencias.length} tema(s) × (2 pedidos que puxam + 1 que não), roteador real`, ind.referencias.length > 0 && !falhasAcion.length, falhasAcion.slice(0, 6).join(' | ') || 'índice vazio');
  const muitos = rotRef('corrija o erro de build do typescript, a api, o teste e2e, a migração, o desempenho, o git e o ci do sistema');
  const porAg = {}; for (const y of muitos.refs) porAg[y.agente] = (porAg[y.agente] || 0) + 1;
  caso('0.8.0 B acionamento: no máximo 3 referências por agente e 8 por pedido', muitos.refs.length <= 8 && Object.values(porAg).every((n) => n <= 3), JSON.stringify(porAg));
  const trivialRef = rotRef('quanto é 15% de 2300?');
  caso('0.8.0 B acionamento: pergunta trivial não ganha referência', !trivialRef.refs.length, JSON.stringify(trivialRef.refs));

  // D-h (pendência da parte A): palavras de ir ao ar puxam o /checklist-lancamento; lançamento de produto continua Marketing.
  for (const p of ['faça o go-live do sistema na sexta', 'antes de publicar o app, confira o que falta', 'vamos colocar no ar a nova versão do portal']) {
    const x = rotRef(p);
    caso(`0.8.0 D-h roteador: "${p}" lembra o /checklist-lancamento`, /\/checklist-lancamento/.test(x.t), x.t.slice(0, 200) || 'trivial');
  }
  const mkt = rotRef('monte o plano de lançamento do produto novo com a campanha nas redes sociais');
  caso('0.8.0 D-h roteador: plano de lançamento de produto vai para Marketing e não pede o checklist de publicação',
    /estrategista-marketing/.test(mkt.agentes) && !/\/checklist-lancamento/.test(mkt.t), `agentes: ${mkt.agentes}; checklist: ${/checklist-lancamento/.test(mkt.t)}`);

  // Equivalência com o apple-design-skill (lido como referência do que cobrir, sem copiar): para 4 pedidos de design,
  // as regras que a skill original aplicaria têm de estar na nossa versão, com o mesmo valor e a fonte na HIG.
  const ap = (f) => ler('conhecimento', 'design', 'apple', f);
  const equiv = {
    'tela de app (iPhone)': [['tipo padrão 17 pt e mínimo 11 pt', 'acessibilidade-tipo-e-toque.md', /iOS, iPadOS \| 17 pt \| 11 pt/], ['contraste 4,5:1 até 17 pt e 3:1 a partir de 18 pt ou negrito', 'acessibilidade-tipo-e-toque.md', /até 17 pt \| 4,5:1[\s\S]*18 pt ou mais, ou negrito \| 3:1/],
      ['alvo 44 × 44 pt (mínimo 28) no celular e 28 × 28 (mínimo 20) no desktop', 'acessibilidade-tipo-e-toque.md', /44 × 44 pt \| 28 × 28 pt[\s\S]*28 × 28 pt \| 20 × 20 pt/], ['abas navegam, não agem; nunca escondidas ou desabilitadas', 'componentes.md', /Abas navegam, não agem[\s\S]*nunca desabilite nem esconda/],
      ['vidro só na camada flutuante, nunca no conteúdo', 'materiais.md', /Nunca na camada de conteúdo/], ['5 lentes na ordem e relatório com "O que funciona"', 'INDICE.md', /Acessibilidade[\s\S]*Convenções da plataforma[\s\S]*Desenho visual[\s\S]*Interação[\s\S]*Conteúdo e escrita[\s\S]*O que funciona/]],
    'painel de dados': [['gráfico simples com detalhe sob demanda', 'graficos.md', /Simples, com mais detalhe quando a pessoa pedir/], ['nunca só a cor para separar séries', 'graficos.md', /Nunca só a cor/], ['descrição sem termos subjetivos e formato sem ambiguidade', 'graficos.md', /Sem termos subjetivos[\s\S]*sem ambiguidade/],
      ['faixa do eixo fixa ou dinâmica pelo significado', 'graficos.md', /fixa ou dinâmica pelo significado/], ['uma cor, um significado; claro, escuro e Aumentar Contraste', 'cor-e-modo-escuro.md', /Uma cor, um significado[\s\S]*claro, escuro e Aumentar Contraste/]],
    'formulário': [['erro perto do problema, dizendo como resolver', 'escrita-e-primeiro-uso.md', /perto do problema[^.]*como resolver/], ['rótulo diz o que acontece e mantém o nome no fluxo', 'escrita-e-primeiro-uso.md', /Cada rótulo diz o que acontece[\s\S]*mantém o nome no fluxo/],
      ['puxar do sistema, escolha em vez de digitação, validar ao preencher, nunca pré-preencher senha', 'movimento-e-retorno.md', /Puxe do sistema[\s\S]*nunca\s+preencha senha/], ['seletor no contexto, perto do campo', 'componentes.md', /no contexto\*\*, perto do\s+campo/], ['alvo de toque e contraste do campo', 'acessibilidade-tipo-e-toque.md', /44 × 44 pt/]],
    'componente com animação': [['movimento com propósito, breve, cancelável e raro no frequente', 'movimento-e-retorno.md', /Com propósito[\s\S]*Breve, cancelável e raro/], ['Reduzir Movimento troca por esmaecer', 'movimento-e-retorno.md', /Reduzir Movimento, troque por\s+esmaecer/],
      ['evitar oscilação perto de 0,2 Hz', 'movimento-e-retorno.md', /0,2 Hz/], ['curvas e durações com o dono do movimento', '../movimento/INDICE.md', /animação de interface abaixo de 300 ms/], ['vidro: Reduzir Transparência e o pior fundo', 'materiais.md', /prefers-reduced-transparency[\s\S]*pior fundo|pior fundo[\s\S]*prefers-reduced-transparency/]],
  };
  for (const [pedido, regras] of Object.entries(equiv)) {
    const faltam = regras.filter(([, f, re]) => !re.test(ap(f))).map((r) => r[0]);
    caso(`0.8.0 B3 equivalência Apple: "${pedido}" — as ${regras.length} regras da skill original estão na nossa versão`, !faltam.length, faltam.join('; '));
  }
  const semFonte = ['acessibilidade-tipo-e-toque.md', 'cor-e-modo-escuro.md', 'componentes.md', 'materiais.md', 'movimento-e-retorno.md', 'escrita-e-primeiro-uso.md', 'graficos.md', 'fundamentos.md']
    .filter((f) => (ap(f).match(/HIG ›/g) || []).length < 3);
  caso('0.8.0 B3 apple: cada arquivo cita a HIG pública nas regras (≥ 3 citações "HIG ›") e nenhum copia o repositório sem licença', !semFonte.length &&
    !/dickwu\/apple-design-skill\/(?!.*sem licença)/.test(ap('INDICE.md').split('\n')[0] || 'x') && fs.readdirSync(path.join(RAIZ, 'conhecimento', 'design', 'apple')).every((f) => /^<!-- Texto próprio/.test(ap(f))), semFonte.join(', ') || 'crédito errado');
  const vidro = ap('materiais.md');
  caso('0.8.0 B3 vidro: quando usar, receita web com reserva, acessibilidade, desempenho e limites por plataforma (Power BI sem desfoque)',
    /camada funcional que flutua/.test(vidro) && /backdrop-filter: blur/.test(vidro) && /saturate/.test(vidro) && /@supports not/.test(vidro) && /prefers-reduced-transparency/.test(vidro) &&
    /prefers-reduced-motion/.test(vidro) && /prefers-contrast/.test(vidro) && /pior fundo/i.test(vidro) && /no máximo 2–3 superfícies/.test(vidro) && /Power BI\*\* \| \*\*não há desfoque/.test(vidro) && /imagem de fundo pronta/.test(vidro), 'falta item');
  caso('0.8.0 B3 evals: designer-paineis e designer-documentos com os casos de equivalência Apple e o efeito vidro',
    /equivalência Apple/i.test(ler('evals', 'designer-paineis.md')) && /Efeito vidro/i.test(ler('evals', 'designer-paineis.md')) && /equivalência Apple/i.test(ler('evals', 'designer-documentos.md')), 'falta caso');

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
