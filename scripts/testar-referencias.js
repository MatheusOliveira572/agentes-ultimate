// Casos da parte B da 0.8.0 (referências sob demanda, docs/inventario-plugins-2026-11.md), chamados pelo
// scripts/testar-hooks.js. Fica num arquivo à parte para não misturar com os casos da parte A.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = function testarReferencias({ caso, validarCopia, tmp, RAIZ, hook, ctx }) {
  const ler = (...p) => { try { return fs.readFileSync(path.join(RAIZ, ...p), 'utf8'); } catch (e) { return ''; } };
  const existe = (...p) => fs.existsSync(path.join(RAIZ, ...p));

  try { require('./testar-travas.js')({ caso, tmp, hook, RAIZ }); } catch (e) { caso('trava: scripts/testar-travas.js roda', false, e.message); }
  try { require('./testar-painel.js')({ caso, tmp, RAIZ, hook }); } catch (e) { caso('painel: scripts/testar-painel.js roda', false, e.message); }

  // ---- Lote 0 · infraestrutura ----
  // T31 checar-ferramenta: confere e nunca instala; roda de uma pasta com espaço e acento no caminho.
  const pastaEsp = path.join(tmp, 'pasta com espaço ação'); fs.mkdirSync(pastaEsp, { recursive: true });
  const chk = path.join(pastaEsp, 'checar-ferramenta.js');
  if (existe('scripts', 'checar-ferramenta.js')) fs.copyFileSync(path.join(RAIZ, 'scripts', 'checar-ferramenta.js'), chk);
  const rodaChk = (...a) => { const r = spawnSync(process.execPath, [chk, ...a], { windowsHide: true, encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
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
  const agBase = ler('agents', 'analista-rh.md');
  const comGatilhos = (n, alvo) => agBase.replace('\n## Critério de pronto', '\n## Referências sob demanda\n' +
    Array.from({ length: n }, (_, i) => `- Quando caso ${i}, leia \`\${CLAUDE_PLUGIN_ROOT}/${alvo}\`.`).join('\n') + '\n\n## Critério de pronto');
  v = validarCopia({ 'agents/analista-rh.md': comGatilhos(1, 'conhecimento/nao-existe.md') });
  caso('0.8.0 B0 validar: agente citando ${CLAUDE_PLUGIN_ROOT}/<arquivo> que não existe é erro', v.code === 1 && /analista-rh\.md: cita \$\{CLAUDE_PLUGIN_ROOT\}\/conhecimento\/nao-existe\.md/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'agents/analista-rh.md': comGatilhos(9, 'conhecimento/LEIA-ME.md') });
  caso('0.8.0 B0 validar: mais de 8 linhas de gatilho num agente é erro', v.code === 1 && /analista-rh\.md: 9 linhas de gatilho/.test(v.out), v.out.slice(-300));
  v = validarCopia({ 'agents/analista-rh.md': comGatilhos(8, 'conhecimento/LEIA-ME.md') });
  caso('0.8.0 B0 validar: 8 gatilhos para arquivo que existe passam', v.code === 0, v.out.slice(-300));

  // Janela piscando no Windows: chamada de processo sem windowsHide é erro; com a opção, passa. O nome vai por partes
  // para o próprio detector não ler este texto como chamada.
  const chamadaTeste = (op) => "require('child_process').spawn" + "Sync('git', ['status'], " + op + ");\n";
  let vh = validarCopia({ 'hooks/teste-janela.js': chamadaTeste("{ encoding: 'utf8' }") });
  caso('0.8.0 validar: chamada de processo sem windowsHide é erro', vh.code === 1 && /teste-janela\.js:1: spawnSync\(\.\.\.\) sem windowsHide/.test(vh.out), vh.out.slice(-300));
  vh = validarCopia({ 'hooks/teste-janela.js': chamadaTeste("{ windowsHide: true, encoding: 'utf8' }") });
  caso('0.8.0 validar: com windowsHide passa', vh.code === 0, vh.out.slice(-300));

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
  const rodaQG = (ferr, rel) => { const f = path.join(pastaEsp, 'rel-' + Math.random().toString(36).slice(2) + '.json'); fs.writeFileSync(f, JSON.stringify(rel)); const r = spawnSync(process.execPath, [qg, ferr, f], { windowsHide: true, encoding: 'utf8' }); return r.status; };
  const sgOk = { results: [], errors: [], paths: { scanned: ['a.js'] } };
  caso('0.8.0 B1 quality-gate: Semgrep com achado HIGH sai 1, limpo sai 0, varredura sem arquivo lido sai 2',
    existe('modelos', 'quality-gate.mjs') && rodaQG('semgrep', { ...sgOk, results: [{ extra: { severity: 'HIGH' } }] }) === 1 && rodaQG('semgrep', sgOk) === 0 && rodaQG('semgrep', { ...sgOk, paths: { scanned: [] } }) === 2, 'saídas erradas');
  caso('0.8.0 B1 quality-gate: axe com violação séria sai 1; página de erro (file://) sai 2',
    existe('modelos', 'quality-gate.mjs') && rodaQG('axe', [{ url: 'http://localhost:3000/', violations: [{ impact: 'serious' }] }]) === 1 && rodaQG('axe', [{ url: 'file:///c:/erro.html', violations: [] }]) === 2, 'saídas erradas');
  // T21 gerenciador de pacotes pelo lockfile ou pelo packageManager.
  const gp = path.join(RAIZ, 'scripts', 'gerenciador-pacotes.js');
  const pastaGP = (arqs) => { const d = fs.mkdtempSync(path.join(pastaEsp, 'gp-')); for (const [n, c] of Object.entries(arqs)) fs.writeFileSync(path.join(d, n), c); return d; };
  const rodaGP = (d) => { const r = spawnSync(process.execPath, [gp, d], { windowsHide: true, encoding: 'utf8' }); return { code: r.status, out: r.stdout || '' }; };
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
  const rodaTD = () => testesTD.map((t) => ({ t, code: spawnSync(process.execPath, [path.join(tdCopia, 'scripts', t)], { windowsHide: true, cwd: tdCopia, encoding: 'utf8' }).status }));
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

  // ---- Lote 5 · curador, skills e validadores ----
  const rodaJS = (arq, args = [], extra = {}) => { const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', arq), ...args], { windowsHide: true, encoding: 'utf8', ...extra }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
  let e5 = rodaJS('eval-roteamento.js');
  caso('0.8.0 B5 eval de roteamento: casos reais acima do piso de 90%', e5.code === 0 && /eval-roteamento: \d+ casos/.test(e5.out), e5.out.slice(-400));
  const casos5 = path.join(tmp, 'rot-ruim.json'); fs.writeFileSync(casos5, JSON.stringify({ casos: [{ pedido: 'corrija o bug no script python que lê a planilha', pacote: 'marketing' }] }));
  e5 = rodaJS('eval-roteamento.js', ['--casos', casos5]);
  caso('0.8.0 B5 eval de roteamento: caso errado derruba abaixo do piso e sai 1', e5.code === 1 && /0 certos/.test(e5.out), e5.out.slice(-300));
  const projD = path.join(tmp, 'proj-doutor'); fs.mkdirSync(path.join(projD, '.claude', 'base'), { recursive: true });
  fs.writeFileSync(path.join(projD, '.claude', 'base', 'MAPA.md'), '# Mapa\n- docs/sumiu.md → explica algo\n');
  const mapaAntes = fs.readFileSync(path.join(projD, '.claude', 'base', 'MAPA.md'), 'utf8');
  e5 = rodaJS('doutor.js', [projD]);
  caso('0.8.0 B5 doutor: mapa velho é relatado e nada é alterado', e5.code === 1 && /docs\/sumiu\.md/.test(e5.out) && fs.readFileSync(path.join(projD, '.claude', 'base', 'MAPA.md'), 'utf8') === mapaAntes, e5.out);
  fs.writeFileSync(path.join(projD, '.claude', 'base', 'MAPA.md'), '# Mapa\n');
  e5 = rodaJS('doutor.js', [projD]);
  caso('0.8.0 B5 doutor: sem desvio sai 0', e5.code === 0 && /0 desvio/.test(e5.out), e5.out);
  let v5 = validarCopia({ 'skills/placar/SKILL.md': '---\nname: placar\ndescription: x\n---\n# x\n' });
  caso('0.8.0 B5 validar: skill só do usuário sem disable-model-invocation é erro', v5.code === 1 && /skills\/placar\/SKILL\.md: skill só do usuário/.test(v5.out), v5.out.slice(-300));
  v5 = validarCopia({ 'skills/novo/SKILL.md': '---\nname: novo\ndescription: x\nmaxTurns: muitos\n---\n# x\n' });
  caso('0.8.0 B5 validar: maxTurns que não é número é erro', v5.code === 1 && /maxTurns "muitos"/.test(v5.out), v5.out.slice(-300));
  caso('0.8.0 B5 ultimate: padrões de orquestração, contexto limpo do revisor, régua de pronto e passagem entre agentes', /Padrões de orquestração/.test(ler('skills', 'ultimate', 'SKILL.md')) && /contexto limpo/.test(ler('skills', 'ultimate', 'SKILL.md')) && /Passagem entre agentes/.test(ler('skills', 'ultimate', 'SKILL.md')), 'falta');
  caso('0.8.0 B5 rodada: ponto de controle e passadas limitadas', /Ponto de controle/.test(ler('skills', 'rodada', 'SKILL.md')) && /Passadas limitadas/.test(ler('skills', 'rodada', 'SKILL.md')), 'falta');
  caso('0.8.0 B5 curador: seção de referências e eval cobram evals e contexto', secRef('curador').includes('/conhecimento/metodo/evals.md') && ler('evals', 'curador.md').includes('conhecimento/metodo/evals.md'), 'falta');

  // ---- Lote 6 · compliance, LGPD, contratos, dados e Power BI ----
  const b6 = { 'analista-compliance': 'fonte/agentes/compliance/referencias/analista-compliance/gravidade-e-excecoes.md', 'especialista-lgpd': 'fonte/agentes/juridico/referencias/especialista-lgpd/dados-para-terceiros.md', 'advogado-contratos': 'fonte/agentes/juridico/referencias/advogado-contratos/licencas-abertas.md', 'engenheiro-dados': 'conhecimento/engenharia/migracao.md', 'dev-powerbi': 'conhecimento/design/construir-do-desenho.md' };
  for (const [ag, arq] of Object.entries(b6)) caso(`0.8.0 B6 ${ag}: seção cita ${arq.split('/').pop()} e o eval cobra a leitura`, secRef(ag).includes('/' + arq) && ler('evals', ag + '.md').includes(arq), 'falta');
  const seisAg = ler('agents', 'dev-powerbi.md');
  caso('0.8.0 B6 gerador: "Referências sob demanda" vem depois do protocolo comum, fora das 90 linhas', seisAg.indexOf('## Referências sob demanda') > seisAg.indexOf('## Protocolo comum'), 'seção antes do protocolo');
  caso('0.8.0 B6 licenças: sem licença não se copia; Apache pede marcar alterados e levar o NOTICE', /Sem licença\*\* \| \*\*não\*\*/.test(ler(...b6['advogado-contratos'].split('/'))) && /NOTICE/.test(ler(...b6['advogado-contratos'].split('/'))), 'falta');

  // ---- Lotes 7 a 9 · designer-paineis, auditor-seguranca e revisor ----
  for (const [ag, arqs] of Object.entries({ 'designer-paineis': ['design/metodo.md', 'design/INDICE.md', 'design/piso-de-qualidade.md', 'design/revisao-tela.md', 'design/visualizacao.md', 'design/movimento/INDICE.md', 'design/pior-caso.md', 'design/apple/INDICE.md'], 'auditor-seguranca': ['seguranca/INDICE.md', 'seguranca/metodo/contraprova.md', 'seguranca/metodo/source-aware-discovery.md', 'seguranca/metodo/fix-verification.md', 'seguranca/modos/diff.md'], revisor: ['metodo/revisar-mudanca.md', 'metodo/revisar-codigo.md', 'design/revisao-tela.md', 'design/critica/INDICE.md'] })) {
    caso('0.8.0 B7-9 ' + ag + ': seção cita as referências do método', arqs.every((a) => secRef(ag).includes('/conhecimento/' + a)), arqs.filter((a) => !secRef(ag).includes('/conhecimento/' + a)).join(', ') || 'falta');
  }
  caso('0.8.0 B8 strix: guias com a alteração marcada e sem comando da ferramenta (record_coverage, agent_finish, jinja)', fs.readdirSync(path.join(RAIZ, 'conhecimento', 'seguranca', 'vulnerabilidades')).every((n) => { const s = ler('conhecimento', 'seguranca', 'vulnerabilidades', n); return /^<!-- Adaptado de usestrix\/strix\/[^\n]*alterado por agentes-ultimate/.test(s) && !/record_coverage|agent_finish|\{%/.test(s); }), 'guia sem marca ou com comando');
  caso('0.8.0 B8 strix: as 29 classes de vulnerabilidade estão lá', ['sql-injection', 'xss', 'ssrf', 'idor', 'csrf', 'rce', 'llm-prompt-injection', 'agentic-system-security'].every((c) => fs.readdirSync(path.join(RAIZ, 'conhecimento', 'seguranca', 'vulnerabilidades')).some((n) => n.startsWith(c))), 'falta classe');
  // ---- Lote 14 · cloudflare/security-audit-skill em conhecimento/seguranca/ ----
  const CF = ['modos/orientar-ou-auditar-1.md', 'metodo/reconhecimento-1.md', 'metodo/cacar-por-cobertura-1.md', 'metodo/validar-e-relatar-1.md', 'classes-de-ataque-1.md',
    ...['web-e-autenticacao', 'cliente', 'ia-e-llm', 'cadeia-e-release', 'nuvem-e-implantacao', 'protocolos-e-filas', 'esgotamento', 'isolamento-e-ciclo', 'desktop-e-ipc', 'memoria-e-binario'].map((b) => 'blocos/' + b + '.md')];
  caso('0.8.0 B14 cloudflare: os guias existem, com crédito, licença MIT, commit fixo e a alteração marcada', CF.every((a) => /^<!-- Adaptado de cloudflare\/security-audit-skill\/[^\n]*@c1c8a8c[^\n]*MIT[^\n]*alterado por agentes-ultimate/.test(ler('conhecimento', 'seguranca', ...a.split('/')))), CF.filter((a) => !fs.existsSync(path.join(RAIZ, 'conhecimento', 'seguranca', ...a.split('/')))).join(', ') || 'crédito');
  const todosCF = ['modos', 'metodo', 'blocos', '.'].flatMap((d) => fs.readdirSync(path.join(RAIZ, 'conhecimento', 'seguranca', d)).filter((n) => n.endsWith('.md')).map((n) => path.join(d, n))).filter((r) => ler('conhecimento', 'seguranca', ...r.split(/[\\/]/)).includes('cloudflare/security-audit-skill/'));
  caso('0.8.0 B14 cloudflare: sem o procedimento de promoção de artefatos (chamadas de Unix) e sem o destino padrão no home', todosCF.length >= 20 && todosCF.every((r) => { const s = ler('conhecimento', 'seguranca', ...r.split(/[\\/]/)); return !/Walk each parent component/.test(s) && !/~\/security-audit-skill/.test(s); }), String(todosCF.length));
  const cl = ler('conhecimento', 'seguranca', 'classes-de-ataque-1.md').split('\n').slice(3).join('\n');
  caso('0.8.0 B14 cloudflare: classes de ataque sem "fixing" e com o Wildcard limitado às unidades e ao orçamento', !/validating, fixing/.test(cl) && /assigned units and budget/.test(ler('conhecimento', 'seguranca', 'classes-de-ataque-2.md')), 'texto');
  const indSeg = ler("conhecimento", "seguranca", "INDICE.md");
  caso('0.8.0 B14 índice: tabela por tipo de alvo aponta os 10 blocos (que existem) e os guias do strix', CF.filter((a) => a.startsWith('blocos/')).every((a) => indSeg.includes(a)) && /Por tipo de alvo/.test(indSeg), 'falta bloco');
  caso('0.8.0 B14 índice: nunca copiar variáveis de ambiente; código do alvo não roda sem sandbox', /nunca copie variáveis de ambiente/.test(indSeg) && /não roda sem sandbox/.test(indSeg), 'falta');
  const cp = ler('conhecimento', 'seguranca', 'metodo', 'contraprova.md');
  caso('0.8.0 B14 contraprova: equivalência dos estados e lacuna só com o bloqueio exato e o plano', /equivalência com a cloudflare/.test(cp) && /bloqueio exato/.test(cp) && /plano de validação/.test(cp), 'falta');
  const sa = secRef('auditor-seguranca');
  caso('0.8.0 B14 auditor-seguranca: no máximo 8 linhas "Quando", uma delas a auditoria completa', (sa.match(/^- Quando/gm) || []).length <= 8 && /auditoria-completa/.test(sa) && /orientar-ou-auditar-1\.md/.test(sa), String((sa.match(/^- Quando/gm) || []).length));
  caso('0.8.0 B14 auditor-seguranca: código do alvo só em sandbox; padrão não rodar', /só roda em sandbox[\s\S]*padrão é não rodar/.test(ler('fonte', 'agentes', 'software', 'auditor-seguranca.md')), 'falta');
  caso('0.8.0 B14 eval do auditor: caso que prova a leitura da referência nova', /orientar-ou-auditar-1\.md/.test(ler('evals', 'auditor-seguranca.md')), 'falta');
  caso('0.8.0 B14 roteiro 26 do checklist ganha só o link para a auditoria completa', /\/auditoria-completa/.test(ler('skills', 'checklist-lancamento', 'referencias', 'seguranca-revisao.md')) && !/cacar-por-cobertura|Wildcard/.test(ler('skills', 'checklist-lancamento', 'referencias', 'seguranca-revisao.md')), 'falta');
  caso('0.8.0 B14 crédito: licença em terceiros, linha em CREDITOS.md e registro em fontes.json com o commit fixo', fs.existsSync(path.join(RAIZ, 'terceiros', 'cloudflare-security-audit-skill', 'LICENSE')) && /cloudflare\/security-audit-skill \| c1c8a8c/.test(ler('CREDITOS.md')) &&
    JSON.parse(ler('fontes', 'fontes.json')).fontes.some((x) => x.repo === 'cloudflare/security-audit-skill' && x.commit_usado.startsWith('c1c8a8c') && x.arquivos.length >= 20), 'falta');
  // ---- Lote 15 · skill auditoria-completa e validadores ----
  try { require('./testar-auditoria.js')({ caso, tmp, RAIZ }); } catch (e) { caso('0.8.0 B15: scripts/testar-auditoria.js carrega e roda', false, e.message); }
  // ---- Lote 13 · ponytail: regras como orientação, sem ganchos ----
  const esc = ler('conhecimento', 'engenharia', 'escada-do-minimo.md');
  caso('0.8.0 B13 ponytail: escada com a lista "nunca cortar" e sem afrouxar teste', /## Nunca cortar/.test(esc) && /validação na fronteira/i.test(esc) && /o teste e a verificação do protocolo/.test(esc) && !/Trivial changes need none|mudança trivial não precisa de teste\b(?! saiu)/.test(esc.split('\n').slice(3).join('\n')), 'texto');
  caso('0.8.0 B13 ponytail: o motivo (77% para 69%) está escrito e não há modo que fica ligado', /77% para 69%/.test(esc) && /nunca como modo que fica ligado/.test(esc), 'texto');
  const ag13 = ler('fonte', 'agentes', 'software', 'engenheiro-software.md');
  caso('0.8.0 B13 engenheiro-software: listar o que a mudança alcança e a lista "nunca cortar" no método, com o teste do passo 1 intacto', /liste o que a mudança alcança/.test(ag13) && /sem cortar validação na fronteira/.test(ag13) && /1\. Reproduza o problema ou escreva o teste/.test(ag13) && (ag13.match(/^- Quando/gm) || []).length <= 8, 'falta');
  const hk13 = ler('hooks', 'hooks.json');
  caso('0.8.0 B13 ponytail: nenhum gancho de terceiro, nada injetado em subagente, sem registro local nem webhook', !/ponytail/i.test(hk13) && !fs.readdirSync(path.join(RAIZ, 'hooks')).some((n) => /ponytail|band/i.test(n)) && !/webhook|ledger/i.test(ler('scripts', 'mapa-simbolos.js')), 'achou');
  caso('0.8.0 B13 crédito: licença, CREDITOS e registro com o commit fixo', fs.existsSync(path.join(RAIZ, 'terceiros', 'dietrichgebert-ponytail', 'LICENSE')) && /DietrichGebert\/ponytail \| 96608e0/.test(ler('CREDITOS.md')) && JSON.parse(ler('fontes', 'fontes.json')).fontes.some((x) => x.repo === 'DietrichGebert/ponytail' && x.arquivos.length >= 5), 'falta');
  caso('0.8.0 B13 revisor e curador citam as referências novas', /revisar-pela-carga\.md/.test(secRef('revisor')) && /avaliar-skill\.md/.test(secRef('curador')), 'falta');
  // T33: mapa de símbolos, numa pasta com espaço e acento, sem git
  const pm = path.join(tmp, 'mapa símbolos ação'); fs.mkdirSync(path.join(pm, 'lib'), { recursive: true }); fs.mkdirSync(path.join(pm, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(pm, 'lib', 'datas.js'), 'export function formatarData(d) { return d; }\nexport const somar = (a, b) => a + b;\n');
  fs.writeFileSync(path.join(pm, 'lib', 'preco.py'), 'def calcular_preco(x):\n    return x\n');
  fs.writeFileSync(path.join(pm, 'tests', 'datas.test.js'), 'export function naoListar() {}\n');
  const mp = require('child_process').spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'mapa-simbolos.js'), pm], { windowsHide: true, encoding: 'utf8' });
  caso('0.8.0 B13 T33 mapa de símbolos: lista funções e exports por pasta e pula testes', mp.status === 0 && /lib\/: [^\n]*formatarData/.test(mp.stdout) && /calcular_preco/.test(mp.stdout) && !/naoListar/.test(mp.stdout), mp.stdout + mp.stderr);
  const mp2 = require('child_process').spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'mapa-simbolos.js'), pm], { windowsHide: true, encoding: 'utf8', env: { ...process.env, AGENTES_ULTIMATE_MAPA_CARACTERES: '10' } });
  caso('0.8.0 B13 T33 mapa de símbolos: respeita o limite de caracteres', mp2.status === 0 && !/formatarData/.test(mp2.stdout), mp2.stdout);
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
    const r = spawnSync(process.execPath, [path.join(plugV, 'hooks', 'vigia-fontes.js'), ...args], { windowsHide: true, encoding: 'utf8', env: { ...process.env, HOME: casaV, USERPROFILE: casaV, AGENTES_ULTIMATE_VIGIA_SIMULAR: sim || '' } });
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
  caso('0.8.0 B vigia: início de sessão mostra "1 fonte mudou desde a sua versão; rode /atualizar-fontes"', /1 fonte mudou desde a sua versão; rode \/atualizar-fontes/.test(rv.out), rv.out);
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
  // ---- vf91: desligar, página sem licença, --diff, licença que muda (mesmo permissiva) e equivalência ----
  const rodaVE = (args, sim, estado, extra = {}) => {
    if (estado !== undefined) { fs.mkdirSync(path.join(casaV, '.claude', 'agentes-ultimate'), { recursive: true }); fs.writeFileSync(path.join(casaV, '.claude', 'agentes-ultimate', 'vigia-fontes.json'), JSON.stringify(estado)); }
    const r = spawnSync(process.execPath, [path.join(plugV, 'hooks', 'vigia-fontes.js'), ...args], { windowsHide: true, encoding: 'utf8', input: extra.input || '', cwd: extra.cwd || plugV, env: { ...process.env, HOME: casaV, USERPROFILE: casaV, AGENTES_ULTIMATE_VIGIA_SIMULAR: sim || '' } });
    return { code: r.status, out: r.stdout || '' };
  };
  const cfgUsu = path.join(casaV, '.claude', 'agentes-ultimate', 'config.json');
  fs.mkdirSync(path.dirname(cfgUsu), { recursive: true }); fs.writeFileSync(cfgUsu, JSON.stringify({ vigia_fontes: false }));
  fs.rmSync(novV, { force: true });
  rv = rodaVE(['--agora'], apiMudou('MIT'), {});
  caso('vf91 vigia: "vigia_fontes": false na config do usuário → não consulta', rv.code === 0 && !fs.existsSync(novV), 'consultou');
  rodaVE([], apiMudou('MIT'), { ultimaConferencia: dias(8), ultimaTentativa: dias(8) });
  caso('vf91 vigia: desligado, o início de sessão não dispara a conferência', !esperarArquivo(novV, 2500), 'disparou');
  fs.rmSync(cfgUsu, { force: true });
  const projV = path.join(tmp, 'projeto-vigia'); fs.mkdirSync(path.join(projV, '.claude', 'base'), { recursive: true });
  fs.writeFileSync(path.join(projV, '.claude', 'base', 'config.json'), JSON.stringify({ vigia_fontes: false }));
  rodaVE([], apiMudou('MIT'), { ultimaConferencia: dias(8), ultimaTentativa: dias(8) }, { input: JSON.stringify({ hook_event_name: 'SessionStart', cwd: projV }) });
  caso('vf91 vigia: "vigia_fontes": false no .claude/base/config.json do projeto → não dispara', !esperarArquivo(novV, 2500), 'disparou');
  rv = rodaVE(['--agora'], apiMudou('BSD-3-Clause'), {});
  const nb = fs.existsSync(novV) ? fs.readFileSync(novV, 'utf8') : '';
  caso('vf91 vigia: licença que muda, mesmo para outra permissiva → "Pare e confira com o usuário"', /A licença mudou de MIT para BSD-3-Clause\.\*\* Pare e confira/.test(nb), nb.slice(0, 300));
  // Página sem licença (HIG): assinatura igual → nada; mudou → aviso, sem copiar, com o teste de equivalência.
  const regP = { ...regV, fontes: [], paginas: [{ nome: 'Apple HIG', pagina: 'https://exemplo.invalid/hig', url_dados: 'https://exemplo.invalid/hig.json', licenca: null, assinatura: 'x', conferido_em: '2026-10-01', vigiar: true }] };
  const indice = (titulo) => ({ references: { a: { url: '/hig/cor', title: titulo, abstract: [{ text: 'resumo' }] } } });
  const crypto = require('crypto');
  regP.paginas[0].assinatura = crypto.createHash('sha256').update(['/hig/cor', 'Cor', JSON.stringify([{ text: 'resumo' }])].join('|')).digest('hex');
  fs.writeFileSync(path.join(plugV, 'fontes', 'fontes.json'), JSON.stringify(regP));
  fs.rmSync(novV, { force: true });
  rv = rodaVE(['--agora'], simular({ 'https://exemplo.invalid/hig.json': { status: 200, body: indice('Cor') } }), {});
  caso('vf91 vigia: página com o mesmo índice → nada', rv.code === 0 && !fs.existsSync(novV), 'avisou');
  rv = rodaVE(['--agora'], simular({ 'https://exemplo.invalid/hig.json': { status: 200, body: indice('Cor e contraste') } }), {});
  const np = fs.existsSync(novV) ? fs.readFileSync(novV, 'utf8') : '';
  caso('vf91 vigia: página mudou → aviso de página sem licença, nada copiado, com o teste de equivalência', /Apple HIG \(página, sem licença\)/.test(np) && /Nada é copiado/.test(np) && /equivalencia-apple\.js/.test(np), np.slice(0, 300));
  fs.writeFileSync(path.join(plugV, 'fontes', 'fontes.json'), JSON.stringify(regV));
  // --diff: só os arquivos que usamos, como dado.
  rv = rodaVE(['--diff', 'dono/proj'], simular({ [`/repos/dono/proj/compare/${'a'.repeat(40)}...main`]: { status: 200, body: { ahead_by: 2, files: [{ filename: 'skills/x/SKILL.md', status: 'modified', additions: 1, deletions: 1, patch: '@@ -1 +1 @@\n-velho\n+novo' }, { filename: 'outro/arquivo.md', status: 'modified', patch: 'NAO-MOSTRAR' }] } } }));
  caso('vf91 vigia --diff: mostra o patch só dos arquivos que usamos e diz que é dado, não instrução', rv.code === 0 && /skills\/x\/SKILL\.md/.test(rv.out) && /\+novo/.test(rv.out) && !/NAO-MOSTRAR/.test(rv.out) && /dado, não instrução/.test(rv.out), rv.out.slice(0, 300));
  rv = rodaVE(['--diff', 'dono/proj'], simular({ '*': { erro: 'ENOTFOUND' } }));
  caso('vf91 vigia --diff: sem rede → diz e sai sem erro de programa', rv.code === 3 && /sem rede/.test(rv.out), rv.out);
  // O teste de equivalência pega uma regra que some.
  const apCopia = path.join(tmp, 'apple-copia'); fs.mkdirSync(path.join(apCopia, 'conhecimento', 'design'), { recursive: true });
  fs.cpSync(path.join(RAIZ, 'conhecimento', 'design', 'apple'), path.join(apCopia, 'conhecimento', 'design', 'apple'), { recursive: true });
  fs.writeFileSync(path.join(apCopia, 'conhecimento', 'design', 'apple', 'materiais.md'), '# vazio\n');
  const eqv = require(path.join(RAIZ, 'scripts', 'equivalencia-apple.js'));
  caso('vf91 equivalência Apple: o teste pega uma regra que sumiu (materiais.md vazio)', eqv.conferir(apCopia).some((r) => r.faltam.length) && eqv.conferir(RAIZ).every((r) => !r.faltam.length), 'não pegou');
  const skAF = ler('skills', 'atualizar-fontes', 'SKILL.md');
  caso('vf91 skill /atualizar-fontes: mostra o que mudou, para se a licença mudou, aplica só com o OK, nunca instala nem roda nada da fonte; Apple sem cópia e com o teste de equivalência',
    /--diff/.test(skAF) && /licença mudou[^\n]*pare/i.test(skAF) && /só depois do OK/i.test(skAF) && /Nunca instale nem rode nada da fonte/.test(skAF) && /equivalencia-apple\.js/.test(skAF) && /nunca copie/i.test(skAF) && /vigia_fontes/.test(skAF), 'texto');
  // ---- jn97: fonte conferida pelo /atualizar-fontes some do novidades.md, mesmo se a conferência seguinte bater no limite da API ----
  const estV = () => { try { return JSON.parse(fs.readFileSync(path.join(casaV, '.claude', 'agentes-ultimate', 'vigia-fontes.json'), 'utf8')); } catch (e) { return {}; } };
  fs.writeFileSync(path.join(plugV, 'fontes', 'fontes.json'), JSON.stringify(regV));
  fs.rmSync(novV, { force: true });
  rodaVE(['--agora'], apiMudou('MIT'), {});
  const tinha = fs.existsSync(novV);
  const regConferido = JSON.parse(JSON.stringify(regV)); regConferido.fontes[0].ultimo_conferido = 'b'.repeat(40); regConferido.fontes[0].conferido_em = '2026-11-02';
  fs.writeFileSync(path.join(plugV, 'fontes', 'fontes.json'), JSON.stringify(regConferido));
  rodaVE(['--agora'], simular({ '/repos/dono/proj': { status: 403, body: { message: 'API rate limit exceeded' } } }), {});
  const e1 = estV();
  caso('jn97 vigia: fonte já conferida sai do novidades.md mesmo com o limite da API na conferência seguinte (contagem 0, motivo gravado)',
    tinha && !fs.existsSync(novV) && e1.fontesComNovidades === 0 && /limite/.test(e1.ultimoErro || ''), JSON.stringify(e1) + ' novidades=' + fs.existsSync(novV));
  rv = rodaVE([], '', { ultimaConferencia: new Date().toISOString(), ultimaTentativa: new Date().toISOString() });
  caso('jn97 vigia: e o início de sessão não avisa mais', !/mudou desde a sua versão|mudaram desde a sua versão/.test(rv.out), rv.out);
  // Fonte sem commit novo: não pede as releases (2 pedidos por fonte em vez de 3; 60 por hora sem token).
  rv = rodaVE(['--agora'], simular({
    '/repos/dono/proj': { status: 200, body: { license: { spdx_id: 'MIT' }, default_branch: 'main' } },
    [`/repos/dono/proj/compare/${'b'.repeat(40)}...main`]: { status: 200, body: { ahead_by: 0, commits: [], files: [] } },
    '/repos/dono/proj/releases?per_page=5': { erro: 'pedido que não devia acontecer' },
  }), {});
  const e2 = estV();
  caso('jn97 vigia: fonte sem commit novo não pede as releases, e a conferência fecha (ultimaConferencia e contagem 0)', e2.ultimaConferencia === e2.ultimaTentativa && e2.fontesComNovidades === 0 && !e2.ultimoErro, JSON.stringify(e2));
  fs.writeFileSync(path.join(plugV, 'fontes', 'fontes.json'), JSON.stringify(regV));
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
    return { t, refs, agentes: (t.match(/(?:Agentes indicados|Candidatos, com o motivo de cada um; decida pelo assunto)[^:]*: ([^.]+)\./) || [])[1] || '' };
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
  const Rot = require(path.join(RAIZ, 'hooks', 'roteador.js'));
  for (const r of ind.referencias.filter((x) => x.arquivo.startsWith('conhecimento/seguranca/') && !x.arquivo.endsWith('INDICE.md') && !x.arquivo.endsWith('lista.md'))) {
    // 69 guias: a mesma função do roteador, dentro do processo (abrir 200 processos levava minutos e pisca janela).
    const puxa = (p) => Rot.referenciasDoPedido(Rot.normalizar(p), ['auditor-seguranca', 'engenheiro-software', 'revisor'], []).some((y) => y.arquivo === r.arquivo);
    for (const p of r.teste.sim) if (!puxa(p)) falhasAcion.push(`"${p}" não puxou ${r.arquivo}`);
    for (const p of r.teste.nao) if (puxa(p)) falhasAcion.push(`"${p}" puxou ${r.arquivo} sem dever`);
  }
  for (const r of ind.referencias.filter((x) => !(x.arquivo.startsWith('conhecimento/seguranca/') && !x.arquivo.endsWith('INDICE.md') && !x.arquivo.endsWith('lista.md')))) {
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

  // ---- Palavra vira pista: casos com os erros reais do usuário ----
  const pbip = path.join(tmp, 'pasta-pbip'); fs.mkdirSync(path.join(pbip, '.claude', 'base'), { recursive: true });
  fs.writeFileSync(path.join(pbip, '.claude', 'base', 'desligado'), ''); fs.writeFileSync(path.join(pbip, 'Painel.pbip'), '{}');
  const naPasta = (pedido, cwd) => {
    const r = hook('roteador.js', { prompt: pedido, cwd, hook_event_name: 'UserPromptSubmit' });
    const c = ctx(r);
    const pac = (c.split('\n').find((l) => l.startsWith('Pacotes:')) || '').replace('Pacotes: ', '');
    return { c, pac, primeiro: pac.split(' (')[0], msg: (r.json && r.json.systemMessage) || '' };
  };
  let rp = naPasta('redesenhar um app com visual premium', pbip);
  caso('0.8.0 pista: "redesenhar um app com visual premium" numa pasta com .pbip não dá BI', /Interface/.test(rp.primeiro) && !/BI e painéis/.test(rp.pac), rp.pac || rp.c.slice(0, 200));
  rp = naPasta('vai me mostrar os resultados desses testes, glass effect', pbip);
  caso('0.8.0 pista: "os resultados desses testes, glass effect" não dá Software como primeira opção', !/Software/.test(rp.primeiro), rp.pac || 'sem pacote');
  rp = naPasta('esses pedidos foram para o plugin, não para o nosso BI', pbip);
  caso('0.8.0 pista: "não para o nosso BI" não dá BI', !/BI e painéis/.test(rp.pac), rp.pac);
  rp = naPasta('um visual novo', pbip);
  caso('0.8.0 pista: palavra ambígua sozinha com o .pbip na pasta não escolhe pacote', !/BI e painéis/.test(rp.pac), rp.pac);
  rp = naPasta('crie a medida de margem e ajuste o relatório do dashboard', pbip);
  caso('0.8.0 pista: pedido de BI de verdade continua indo para BI', /BI e painéis/.test(rp.primeiro), rp.pac);
  caso('0.8.0 pista: a saída diz "Candidatos, com o motivo de cada um; decida pelo assunto"', /Candidatos, com o motivo de cada um; decida pelo assunto/.test(rp.c) && !/Agentes indicados/.test(rp.c), rp.c.slice(0, 200));
  rp = naPasta('monte o painel de custos com a planilha de orçado e realizado', proj2());
  caso('0.8.0 pista: mostra as alternativas próximas quando há outra área com sinal', /Alternativas próximas/.test(rp.c) || rp.pac.split(';').length > 1, rp.c.slice(0, 300));
  function proj2() { return projRef; }

  // Equivalência com o apple-design-skill (lido como referência do que cobrir, sem copiar): para 4 pedidos de design,
  // as regras que a skill original aplicaria têm de estar na nossa versão, com o mesmo valor e a fonte na HIG.
  const ap = (f) => ler('conhecimento', 'design', 'apple', f);
  for (const r of require(path.join(RAIZ, 'scripts', 'equivalencia-apple.js')).conferir(RAIZ)) {
    caso(`0.8.0 B3 equivalência Apple: "${r.pedido}" — as ${r.total} regras da skill original estão na nossa versão`, !r.faltam.length, r.faltam.join('; '));
  }
  const semFonte = ['acessibilidade-tipo-e-toque.md', 'cor-e-modo-escuro.md', 'componentes.md', 'materiais.md', 'movimento-e-retorno.md', 'escrita-e-primeiro-uso.md', 'graficos.md', 'fundamentos.md']
    .filter((f) => (ap(f).match(/HIG ›/g) || []).length < 3);
  caso('0.8.0 B3 apple: cada arquivo cita a HIG pública nas regras (≥ 3 citações "HIG ›") e nenhum copia o repositório sem licença', !semFonte.length &&
    !/dickwu\/apple-design-skill\/(?!.*sem licença)/.test(ap('INDICE.md').split('\n')[0] || 'x') && fs.readdirSync(path.join(RAIZ, 'conhecimento', 'design', 'apple')).every((f) => /^<!-- Texto próprio/.test(ap(f))), semFonte.join(', ') || 'crédito errado');
  const vidro = ap('materiais.md');
  caso('0.8.0 B3 vidro: quando usar, receita web com reserva, acessibilidade, desempenho e limites por plataforma (Power BI sem desfoque)',
    /camada funcional que flutua/.test(vidro) && /backdrop-filter: blur/.test(vidro) && /saturate/.test(vidro) && /@supports not/.test(vidro) && /prefers-reduced-transparency/.test(vidro) &&
    /prefers-reduced-motion/.test(vidro) && /prefers-contrast/.test(vidro) && /pior fundo/i.test(vidro) && /no máximo 2–3 superfícies/.test(vidro) && /Power BI\*\* \| \*\*não há desfoque/.test(vidro) && /imagem de fundo pronta/.test(vidro), 'falta item');
  const evDP = ler('evals', 'designer-paineis.md');
  caso('pv92 eval do vidro: regressão (landing 72–88%, produto só navegação, preferências, pior ponto) e gatilho negativo (vidro em KPI e tabela)',
    /Caso 14 · Efeito vidro: landing × tela de produto/.test(evDP) && /72–88%/.test(evDP) && /prefers-reduced-transparency/.test(evDP) && /pior ponto do fundo/.test(evDP) &&
    /Caso 15 · Vidro pedido no lugar errado\n- Tipo: gatilho negativo/.test(evDP), 'falta');
  const pv = (n) => ler('docs', 'provas', '0.8.0-design', 'e2e', n);
  caso('pv92 prova: as páginas do vidro trazem @supports, transparência reduzida e contraste mais; o produto não põe vidro nos cartões',
    ['caso-b-landing.html', 'caso-b-produto.html'].every((n) => /@supports not/.test(pv(n)) && /prefers-reduced-transparency: reduce/.test(pv(n)) && /prefers-contrast: more/.test(pv(n))) &&
    !/\.foto[^{]*\{[^}]*backdrop-filter/.test(pv('caso-b-produto.html')) && /--vidro: rgb\(255 255 255 \/ 0\.7[2-9]\)|--vidro: rgb\(255 255 255 \/ 0\.8[0-8]\)/.test(pv('caso-b-landing.html')), 'falta');
  caso('pv92 prova: 17 PNGs e o pior contraste medido acima de 4,5:1 em toda medida', (() => {
    try { const m = JSON.parse(pv('png/medidas.json')); return m.relatorio.length >= 17 && m.erros.length === 0 && m.relatorio.every((l) => !l.rolagemLateral && l.medidas.every((x) => parseFloat(x.split('pior ')[1]) >= 4.5)); } catch (e) { return false; } })(), 'medidas');
  caso('0.8.0 B3 evals: designer-paineis e designer-documentos com os casos de equivalência Apple e o efeito vidro',
    /equivalência Apple/i.test(ler('evals', 'designer-paineis.md')) && /Efeito vidro/i.test(ler('evals', 'designer-paineis.md')) && /equivalência Apple/i.test(ler('evals', 'designer-documentos.md')), 'falta caso');

  fs.writeFileSync(cfgRef, '{}');
  const vd = rotRef('um card com efeito vidro estilo Apple');
  caso('0.8.0 ponta a ponta: "um card com efeito vidro estilo Apple" → designer e engenheiro, materiais e Apple, e o /checklist-lancamento', /designer-interface/.test(vd.agentes) && /engenheiro-software/.test(vd.agentes) && vd.refs.some((y) => y.arquivo === 'conhecimento/design/apple/materiais.md') && vd.refs.some((y) => y.arquivo === 'conhecimento/design/apple/INDICE.md') && /\/checklist-lancamento/.test(vd.t), JSON.stringify(vd.refs));

  // Ponta a ponta (critério do usuário): pedido amplo aciona tudo sozinho. Liga no lote 3 (conteúdo de design).
  const E2E = existe('conhecimento', 'design', 'metodo.md');
  const espera = [
    ['conhecimento/design/metodo.md', 'DESIGNER', 'método do impeccable'],
    ['conhecimento/design/apple/INDICE.md', 'DESIGNER', 'regras da Apple'],
    ['conhecimento/design/detalhes-interface.md', 'DESIGNER', 'detalhes de interface do Jakub'],
    ['conhecimento/design/movimento/INDICE.md', 'engenheiro-software', 'animação do Emil'],
    ['conhecimento/design/revisao-tela.md', 'revisor', 'revisão de design (Superfuture)'],
  ];
  for (const pedido of ['redesenhe meu app com visual premium', 'crie um site institucional bonito']) {
    for (const ligado of [false, true]) {
      fs.writeFileSync(cfgRef, JSON.stringify(ligado ? { integracoes: ['21st'] } : {}));
      const x = rotRef(pedido);
      // App é do designer-interface (im99); site é do designer-sites, que recebe a biblioteca de sites no lugar dos detalhes de interface (teto de 3 por agente).
      const ehSite = /site/.test(pedido);
      const designer = ehSite ? 'designer-sites' : 'designer-interface';
      const esperaPedido = ehSite ? espera.filter((e) => !/detalhes/.test(e[2])).concat([['conhecimento/design/sites-premium/INDICE.md', 'DESIGNER', 'biblioteca de sites']]) : espera;
      const faltam = esperaPedido.filter(([a, ag]) => !x.refs.some((y) => y.arquivo === a && y.agente === (ag === 'DESIGNER' ? designer : ag))).map((e) => e[2]);
      const c21 = x.refs.some((y) => y.arquivo === 'conhecimento/design/componentes.md' && y.agente === 'engenheiro-software');
      const ags = [designer, 'engenheiro-software', 'revisor'].every((a) => x.agentes.includes('agentes-ultimate:' + a));
      const ok2 = ags && !faltam.length && c21 === ligado && /\/checklist-lancamento/.test(x.t);
      const nome = `0.8.0 B ponta a ponta: "${pedido}"${ligado ? ' com o 21st ligado' : ''} → designer, engenheiro e revisor, referências certas, ${ligado ? 'componentes do 21st' : 'sem o 21st'} e o /checklist-lancamento`;
      const det = `agentes: ${x.agentes || 'nenhum'}; faltam: ${faltam.join(', ') || '-'}; 21st: ${c21}; checklist: ${/checklist-lancamento/.test(x.t)}`;
      if (E2E) caso(nome, ok2, det); else console.log(`PENDENTE (lote 3) ${nome} → hoje: ${ok2 ? 'passaria' : det}`);
    }
  }
  fs.writeFileSync(cfgRef, '{}');
};
