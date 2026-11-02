// Casos do lote sites-premium da 0.8.0: agente designer-sites, biblioteca conhecimento/design/sites-premium/, distinção do
// vidro e prova dos efeitos. Chamado pelo scripts/testar-hooks.js; sozinho: node scripts/testar-sites.js (roda só este lote).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function testarSites({ caso, tmp, RAIZ, rot, ctx }) {
  const ler = (...p) => { try { return fs.readFileSync(path.join(RAIZ, ...p), 'utf8'); } catch (e) { return ''; } };
  const existe = (...p) => fs.existsSync(path.join(RAIZ, ...p));
  const PASTA = ['conhecimento', 'design', 'sites-premium'];
  const lerSP = (...p) => ler(...PASTA, ...p);

  // ---- Roteamento: quem cuida de site × quem cuida de painel (roteador real) ----
  const projS = path.join(tmp, 'projeto-sites'); fs.mkdirSync(path.join(projS, '.claude', 'base'), { recursive: true });
  fs.writeFileSync(path.join(projS, '.claude', 'base', 'desligado'), '');
  const agentesDe = (pedido) => {
    const t = ctx(rot(pedido, projS));
    return { t, ag: (t.match(/(?:Agentes indicados|Candidatos)[^:]*: ([^.]+)\./) || [])[1] || '', refs: (t.match(/Referências para este pedido.*/) || [''])[0] };
  };
  for (const p of ['crie uma landing page para o meu aplicativo', 'faça a página de vendas do curso de investimentos', 'desenhe o site institucional da empresa',
    'crie um site premium para um app de finanças', 'redesenhe o site da clínica']) {
    const x = agentesDe(p);
    caso(`0.8.0 sites roteador: "${p}" → designer-sites, sem designer-paineis`, /designer-sites/.test(x.ag) && !/designer-paineis/.test(x.ag), x.ag || 'nenhum');
  }
  for (const p of ['monte um painel no power bi com o desvio por área', 'desenhe o dashboard com os kpi da diretoria', 'redesenhe a tela do app de estoque']) {
    const x = agentesDe(p);
    caso(`0.8.0 sites roteador: "${p}" → designer-paineis, sem designer-sites`, /designer-paineis/.test(x.ag) && !/designer-sites/.test(x.ag), x.ag || 'nenhum');
  }
  // A-1 (revisão): frases do revisor, lendo agentes e referências.
  const PARA_SITES = ['efeito vidro no site', 'visual premium para o site', 'crie uma página web de contato', 'html e css do site', 'crie o frontend do meu site em react',
    'melhore a ux do site', 'a interface do meu site está confusa', 'redesign do site', 'site com animação', 'site responsivo com tailwind', 'formulário de contato do site', 'componente do meu site', 'animacao no site',
    'preciso de um site', 'quero um site para minha clínica', 'melhore o visual do meu site', 'crie um site premium para a minha clínica', 'efeito vidro no meu site',
    'crie um website para a padaria', 'crie a homepage da loja', 'redesenhe a página inicial do site', 'monte uma lp de vendas'];
  for (const p of PARA_SITES) {
    const x = agentesDe(p);
    caso(`0.8.0 sites A-1: "${p}" → designer-sites, sem designer-paineis, com a biblioteca`, /designer-sites/.test(x.ag) && !/designer-paineis/.test(x.ag) && !/para `agentes-ultimate:designer-paineis`/.test(x.refs) && /sites-premium/.test(x.refs), `${x.ag || 'nenhum'} | ${x.refs.slice(0, 200)}`);
  }
  const SEM_DESIGNER = ['o site de vendas caiu', 'abra o novo site do governo', 'confira o preço no site do produto', 'erro no novo site da empresa', 'o site da receita federal saiu do ar hoje', 'publique o site', 'o avião fez um landing de emergência', 'site para minha clínica'];
  for (const p of SEM_DESIGNER) {
    const x = agentesDe(p);
    caso(`0.8.0 sites A-1: "${p}" não chama designer nem entrega referência a designer`, !/designer-/.test(x.ag) && !/designer-/.test(x.refs), `${x.ag} | ${x.refs.slice(0, 200)}`);
  }
  const dash = agentesDe('dashboard com kpi de vendas do meu site');
  caso('0.8.0 sites A-1: pedido de painel não leva a biblioteca de sites', !/sites-premium/.test(dash.refs) && !/designer-sites/.test(dash.ag), dash.refs.slice(0, 200));
  for (const p of ['faça um card com efeito vidro estilo Apple', 'redesenhe meu app com visual premium', 'melhore a ux do aplicativo']) {
    const x = agentesDe(p);
    caso(`0.8.0 sites A-1: "${p}" continua no designer-paineis`, /designer-paineis/.test(x.ag) && !/designer-sites/.test(x.ag), x.ag || 'nenhum');
  }
  const css = agentesDe('corrija o css e o html do botão no react');
  caso('0.8.0 sites A-1: html, css e react sem site vão ao engenheiro, sem designer', /engenheiro-software/.test(css.ag) && !/designer-/.test(css.ag), css.ag || 'nenhum');
  const soSite = agentesDe('o site da receita federal saiu do ar hoje');
  caso('0.8.0 sites roteador: "site" sozinho não puxa o designer de sites', !/designer-sites/.test(soSite.ag), soSite.ag);
  const lp = agentesDe('crie uma landing page para o meu aplicativo');
  caso('0.8.0 sites roteador: landing page traz o engenheiro e lembra o /checklist-lancamento', /engenheiro-software/.test(lp.ag) && /\/checklist-lancamento/.test(lp.t), lp.t.slice(0, 200));
  caso('0.8.0 sites roteador: landing page puxa o índice da biblioteca para o designer de sites', /sites-premium[\\/]INDICE\.md` \(para `agentes-ultimate:designer-sites`\)/.test(lp.t), (lp.t.match(/Referências para este pedido.*/) || [''])[0].slice(0, 400));

  // ---- Agente ----
  const ag = ler('agents', 'designer-sites.md');
  const desc = (ag.match(/^description:\s*(.+)$/m) || [])[1] || '';
  caso('0.8.0 sites agente: gerado, com "Use para" e "Não use para", separado dos painéis', /Use para/.test(desc) && /Não use para/.test(desc) && /designer-paineis/.test(desc) && /landing page/i.test(desc), desc.slice(0, 200) || 'sem agente');
  const descP = (ler('agents', 'designer-paineis.md').match(/^description:\s*(.+)$/m) || [])[1] || '';
  caso('0.8.0 sites agente: designer-paineis devolve site e landing page ao designer-sites', /designer-sites/.test(descP) && /landing page/i.test(descP), descP.slice(-200));
  caso('0.8.0 sites agente: parte específica ≤ 90 linhas', !!ag && ag.slice(0, ag.indexOf('## Protocolo comum')).split('\n').length <= 90, 'passou de 90');
  const pac = JSON.parse(ler('pacotes', 'pacotes.json') || '{"pacotes":{}}');
  const comAg = Object.values(pac.pacotes).filter((p) => p.agentes.includes('designer-sites'));
  caso('0.8.0 sites pacote: designer-sites num pacote com "landing page" e "site institucional" como expressões, fora do pacote de interface',
    comAg.length === 1 && ['landing page', 'pagina de vendas', 'site institucional'].every((w) => comAg[0].palavras.includes(w)) &&
    !['landing page', 'site institucional'].some((w) => ((pac.pacotes.interface || {}).palavras || []).includes(w)), JSON.stringify(comAg.map((p) => p.nome)));
  caso('0.8.0 sites A-2: teclado no método e no critério de pronto', /Shift\+Tab/.test(ag.split('## Método de trabalho')[1].split('## Critério')[0]) && /Teclado/.test(ag.split('## Critério de pronto')[1].split('## Erros')[0]) && /Caso \d+ · Teclado/.test(ler('evals', 'designer-sites.md')), 'falta');
  caso('0.8.0 sites M-2: agente e critério proíbem imitar argumento e ordem de referência', /sem imitar os de uma referência/.test(ag) && /nem o argumento e a ordem de um bloco/.test(ag.split('## Critério de pronto')[1].split('## Erros')[0]), 'falta');
  caso('0.8.0 sites b-3: polimento com caminho completo e checklist de lançamento aponta o designer de sites', /\$\{CLAUDE_PLUGIN_ROOT\}\/conhecimento\/design\/polimento\.md/.test(ag) && /designer-sites/.test(ler('skills', 'checklist-lancamento', 'SKILL.md')), 'falta');
  caso('0.8.0 sites b-5: referência da NNG com a data do estudo e sem afirmar o que o artigo não diz', /publicado\s+em 2018/.test(ag) && !/principal e a ação no topo/.test(ag), 'falta');
  caso('0.8.0 sites agente: método diz repertório, não molde, e direção própria', /repertório/i.test(ag) && /direção própria/i.test(ag), 'falta');

  // ---- Evals: vidro para os dois lados e os gatilhos ----
  const ev = ler('evals', 'designer-sites.md');
  caso('0.8.0 sites evals: vidro em cartão de landing (permitido) e em tela de produto (recusado)', /vidro[^\n]*landing/i.test(ev) && /vidro[^\n]*(tela de produto|produto)/i.test(ev) && /camada de conteúdo/.test(ev) && /pouca transparência/.test(ev), 'falta caso');
  caso('0.8.0 sites evals: pedido de painel devolvido ao designer-paineis', /Tipo: gatilho negativo[\s\S]*designer-paineis/.test(ev), 'falta');

  // ---- Biblioteca ----
  const RECEITAS = ['r01-heroi-com-mockup', 'r02-heroi-com-simulacao', 'r03-heroi-de-conversa', 'r04-faixa-de-numeros', 'r05-faixa-de-logos', 'r06-passos-com-linha',
    'r07-grade-bento', 'r08-ziguezague', 'r09-video-demonstracao', 'r10-depoimentos', 'r11-precos', 'r12-objecao-franca', 'r13-seguranca-e-confianca', 'r14-perguntas-frequentes',
    'r15-acao-final', 'r16-navegacao', 'r17-promocao-e-botao-fixo', 'r18-cartao-de-metrica', 'r19-linha-de-transacao', 'r20-progresso', 'r21-hub-de-integracoes',
    'r22-personagem', 'r23-ritmo-de-blocos', 'r24-atmosfera-de-fundo', 'r25-rodape'];
  const faltamR = RECEITAS.filter((r) => !existe(...PASTA, r + '.md'));
  caso('0.8.0 sites biblioteca: 25 receitas, uma por arquivo', !faltamR.length, faltamR.join(', '));
  const incompletas = RECEITAS.filter((r) => { const t = lerSP(r + '.md'); return !['Quando usar:', 'Estrutura:', 'Estados:', 'Celular:', 'Acessibilidade:', 'Erro comum:'].every((c) => t.includes(c)) || !/Repertório, não molde/.test(t); });
  caso('0.8.0 sites biblioteca: cada receita com quando usar, estrutura, estados, celular, acessibilidade, erro comum e o aviso de repertório', !incompletas.length, incompletas.join(', '));
  const indiceSP = lerSP('INDICE.md');
  const foraDoIndice = RECEITAS.filter((r) => !indiceSP.includes(r + '.md'));
  caso('0.8.0 sites biblioteca: INDICE.md aponta cada receita, o método e os efeitos, e diz que não há ordem obrigatória', !foraDoIndice.length && /metodo-de-montagem\.md/.test(indiceSP) && /efeitos\/INDICE\.md/.test(indiceSP) && /Nenhuma ordem é obrigatória/.test(indiceSP), foraDoIndice.join(', ') || 'falta');
  const met = lerSP('metodo-de-montagem.md');
  caso('0.8.0 sites método: ideia própria, teste do recorte, sequências como ponto de partida e conferência final', /ideia única/i.test(met) && /Teste do recorte/.test(met) && /pontos de partida/.test(met) && /Conferir antes de entregar/.test(met), 'falta');
  const efeitosTxt = ['efeitos/INDICE.md', 'efeitos/superficie-e-fundos.md', 'efeitos/rolagem-e-texto.md', 'efeitos/repeticao-e-micro.md'].map((f) => lerSP(f)).join('\n');
  const IDS = [...'ABCDEF'].flatMap((g) => Array.from({ length: { A: 7, B: 7, C: 6, D: 6, E: 5, F: 8 }[g] }, (_, i) => g + (i + 1)));
  const faltamE = IDS.filter((id) => !new RegExp('### ' + id + '\\.').test(efeitosTxt));
  caso('0.8.0 sites efeitos: os 39 efeitos do catálogo', IDS.length === 39 && !faltamE.length, faltamE.join(', '));
  caso('0.8.0 sites b-6: todo efeito de A a F tem "Técnica"', IDS.every((id) => /\*\*Técnica:\*\*/.test((efeitosTxt.split('### ' + id + '.')[1] || '').split('\n### ')[0]) || id === 'A1'), IDS.filter((id) => !/\*\*Técnica:\*\*/.test((efeitosTxt.split('### ' + id + '.')[1] || '').split('\n### ')[0])).join(', '));
  caso('0.8.0 sites efeitos: regras comuns (só transform e opacity, pausa em 5 s, conteúdo sem o efeito, teto)', /`transform` e `opacity`/.test(efeitosTxt) && /WCAG 2\.2\.2/.test(efeitosTxt) && /sem JS/i.test(efeitosTxt) && /até 3 tipos/.test(efeitosTxt), 'falta');
  const indGeral = ler('conhecimento', 'design', 'INDICE.md') + ler('conhecimento', 'design', 'modos', 'persuadir.md');
  caso('0.8.0 sites biblioteca: índice de design e modo Persuadir apontam para a biblioteca', (indGeral.match(/sites-premium\/INDICE\.md/g) || []).length >= 2, 'falta ponteiro');

  // ---- Acionamento: cada arquivo da biblioteca, com os 2 pedidos que puxam e o que não puxa, no roteador real ----
  const refsDe = (pedido) => [...ctx(rot(pedido, projS)).matchAll(/`([^`]+)` \(para `([^`]+)`\)/g)].map((m) => ({ arquivo: path.relative(RAIZ, m[1]).split(path.sep).join('/'), agente: m[2].replace(/^agentes-ultimate:/, '') }));
  const indiceRefs = (() => { try { return JSON.parse(ler('conhecimento', 'indice.json')).referencias; } catch (e) { return []; } })();
  const minhas = indiceRefs.filter((r) => r.arquivo.includes('/sites-premium/'));
  const falhasA = [];
  for (const r of minhas) {
    for (const p of r.teste.sim) if (!refsDe(p).some((y) => y.arquivo === r.arquivo)) falhasA.push(`"${p}" não puxou ${r.arquivo}`);
    for (const p of r.teste.nao) if (refsDe(p).some((y) => y.arquivo === r.arquivo)) falhasA.push(`"${p}" puxou ${r.arquivo}`);
  }
  caso(`0.8.0 sites acionamento: ${minhas.length} arquivos × (2 que puxam + 1 que não), roteador real`, minhas.length >= 30 && !falhasA.length, falhasA.slice(0, 5).join(' | ') || 'biblioteca sem índice');
  const inst = refsDe('crie um site institucional bonito');
  const temRef = (a, ag) => inst.some((y) => y.arquivo === 'conhecimento/design/' + a && y.agente === ag);
  caso('0.8.0 sites ponta a ponta: "crie um site institucional bonito" → biblioteca e método ao designer, movimento ao engenheiro, revisão ao revisor', temRef('sites-premium/INDICE.md', 'designer-sites') && temRef('metodo.md', 'designer-sites') && temRef('movimento/INDICE.md', 'engenheiro-software') && temRef('revisao-tela.md', 'revisor'), JSON.stringify(inst));
  const painelR = refsDe('monte um painel no power bi com o desvio por área');
  caso('0.8.0 sites ponta a ponta: pedido de painel não recebe a biblioteca de sites', !painelR.some((y) => /sites-premium/.test(y.arquivo)), JSON.stringify(painelR));
  const vidroP = refsDe('faça um card com efeito vidro na landing page');
  caso('0.8.0 sites ponta a ponta: vidro em landing page entrega materiais.md ao designer de sites', vidroP.some((y) => y.arquivo === 'conhecimento/design/apple/materiais.md' && y.agente === 'designer-sites'), JSON.stringify(vidroP));

  // ---- Direitos e pendência ----
  const todosSP = (function lista(d) { if (!fs.existsSync(d)) return []; return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? lista(path.join(d, e.name)) : [path.join(d, e.name)]); })(path.join(RAIZ, ...PASTA));
  const citaSemMarca = todosSP.flatMap((f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => /finmate|usecalen|\bcalen\b|dinzo/i.test(l) && !/referência estudada/i.test(l)).map((l) => path.basename(f) + ': ' + l.slice(0, 60)));
  caso('0.8.0 sites direitos: a biblioteca só cita os sites como "referência estudada"', todosSP.length > 0 && !citaSemMarca.length, citaSemMarca.slice(0, 3).join(' | ') || 'sem biblioteca');
  const citaNaoAberto = todosSP.flatMap((f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => /nivora|code and chill|codeandchill/i.test(l) && !/não (foram )?(estudad|abert)/i.test(l)).map((l) => path.basename(f)));
  caso('0.8.0 sites pendência: Nivora e Code and Chill só aparecem como não estudados', /Nivora/.test(indiceSP) && !citaNaoAberto.length, citaNaoAberto.join(', ') || 'pendência não registrada no índice');
  const reg = JSON.parse(ler('fontes', 'fontes.json') || '{}');
  const est = reg.referencias_estudadas || [];
  caso('0.8.0 sites fontes: 3 sites como referência estudada, sem licença de reprodução, e 2 como não abertos', est.filter((e) => e.situacao === 'estudado' && /sem licença/.test(e.licenca || '')).length === 3 &&
    est.filter((e) => e.situacao === 'nao_aberto').length === 2, JSON.stringify(est.map((e) => [e.site, e.situacao])));

  // ---- Vidro: a distinção e os acréscimos ----
  const vid = ler('conhecimento', 'design', 'apple', 'materiais.md');
  caso('0.8.0 sites vidro: landing page permite cartão com pouca transparência sobre fundo calmo; produto e tarefa seguem a regra da Apple',
    /landing page/i.test(vid) && /pouca transparência/.test(vid) && /fundo calmo/.test(vid) && /tela de produto ou de tarefa/i.test(vid) && /Nunca na camada de conteúdo/.test(vid), 'falta a distinção');
  caso('0.8.0 sites vidro: acréscimos do estudo (sem desfoque é defeito, raiz do fundo, opaco não desfoca, luz de 1 px, suporte)',
    /sem desfoque é defeito/i.test(vid) && /mix-blend-mode/.test(vid) && /superfície opaca/.test(vid) && /luz/.test(vid) && /Baseline 2024/.test(vid), 'falta acréscimo');

  // M-3: a regra do vidro, conferida pelo conteúdo e não só por palavras soltas; os mutantes têm de ser pegos.
  const regrasVidro = (m, ef) => {
    const p = [];
    const al = +((m.match(/\.cartao-landing \{[\s\S]*?background: rgb\([^/]*\/ (0?\.\d+)\)/) || [])[1] || 0);
    if (!(al >= 0.72 && al <= 0.88)) p.push('cartão de landing fora de 72–88%: ' + al);
    if (!/sem foto, sem texto e sem nada em movimento/.test(m)) p.push('fundo calmo sem a definição');
    if (/sem o véu/.test(m)) p.push('"sem o véu" sugere que com véu serve');
    if (!/cartão de landing: receita abaixo/.test(m)) p.push('.vidro genérico sem dizer que não é o cartão de landing');
    if (/Superfície tonal/.test(m) && !/não use no cartão/.test(m)) p.push('superfície tonal sem a ressalva');
    if (!/se o vidro não separa controle de[\s\S]{0,80}em tela de produto/.test(m)) p.push('"se não separa controle, tire" sem a ressalva da landing');
    const a1 = (ef.split('### A1.')[1] || '').split('### A2.')[0];
    if (/fundo variado/.test(a1) || !/fundo calmo/.test(a1)) p.push('efeito A1 contradiz a decisão');
    return p;
  };
  const mat = ler('conhecimento', 'design', 'apple', 'materiais.md'), sup = lerSP('efeitos', 'superficie-e-fundos.md');
  caso('0.8.0 sites M-3: materiais.md e o efeito A1 seguem a decisão do vidro (landing = cartão, pouca transparência, fundo calmo)', !regrasVidro(mat, sup).length, regrasVidro(mat, sup).join('; '));
  const mutV = [['cartão a 30%', mat.replace('background: rgb(22 42 58 / 0.82);', 'background: rgb(22 42 58 / 0.30);'), sup],
    ['regra trocada', mat.replace('sem foto, sem texto e sem nada em movimento', 'foto, vídeo ou gradiente em movimento'), sup],
    ['A1 sobre fundo variado', mat, sup.replace(/fundo calmo/g, 'fundo variado')]];
  caso('0.8.0 sites M-3: os mutantes do vidro (cartão a 30%, regra trocada, A1 sobre fundo variado) são pegos', mutV.every(([, m, e]) => regrasVidro(m, e).length > 0), mutV.filter(([, m, e]) => !regrasVidro(m, e).length).map((x) => x[0]).join(', '));

  // ---- Prova ----
  const PROVA = ['docs', 'provas', '0.8.0-sites'];
  const res = (() => { try { return JSON.parse(ler(...PROVA, 'resultado.json')); } catch (e) { return null; } })();
  caso('0.8.0 sites prova: resultado.json gerado pela bancada', !!res, 'falta docs/provas/0.8.0-sites/resultado.json');
  if (res) {
    const cap = res.capturas || [];
    const esperadas = ['claro', 'escuro'].flatMap((t) => [1440, 390].map((l) => `site-${t}-${l}.png`));
    caso('0.8.0 sites prova: 4 PNGs do site (2 temas, 2 larguras) existem e não estão vazios', esperadas.every((p) => existe(...PROVA, 'png', p) && fs.statSync(path.join(RAIZ, ...PROVA, 'png', p)).size > 20000), esperadas.join(', '));
    caso('0.8.0 sites prova: 0 erro de JS, 0 rolagem lateral, 0 texto cortado ou sobreposto, 0 título sob a barra nas 4 capturas', cap.length === 4 && cap.every((c) => c.erros_js === 0 && c.rolagem_lateral === 0 && c.texto_cortado === 0 && c.texto_sobreposto === 0 && c.titulos_cobertos === 0), JSON.stringify(cap.map((c) => [c.png, c.erros_js, c.rolagem_lateral, c.texto_cortado])));
    caso('0.8.0 sites prova: contraste medido no pior ponto do fundo (0 falha)', cap.length === 4 && cap.every((c) => c.contraste_falhas === 0 && c.contraste_medidos > 20), JSON.stringify(cap.map((c) => [c.png, c.contraste_falhas, c.contraste_medidos])));
    caso('0.8.0 sites prova: no celular, alvos ≥ 44 px e corpo ≥ 16 px', cap.filter((c) => c.largura === 390).every((c) => c.alvos_pequenos === 0 && c.corpo_pequeno === 0), JSON.stringify(cap.map((c) => [c.alvos_pequenos, c.corpo_pequeno])));
    const rm = res.reduzido_movimento || {}; const rt = res.reduzido_transparencia || {};
    caso('0.8.0 sites prova: prefers-reduced-motion testado (nada rodando, cena completa, curva inteira)', rm.media_ativa === true && rm.animacoes_rodando === 0 && rm.cena_completa === true, JSON.stringify(rm));
    caso('0.8.0 sites prova: prefers-reduced-transparency testado (sem desfoque, fundo ≥ 96%)', rt.media_ativa === true && rt.com_desfoque === 0 && rt.alfa_minimo >= 0.96 && rt.contraste_falhas === 0, JSON.stringify(rt));
    caso('0.8.0 sites prova: sem JS o conteúdo está inteiro', (res.sem_js || {}).texto_completo === true, JSON.stringify(res.sem_js));
    const mut = res.mutantes || [];
    caso('0.8.0 sites prova: as checagens falham no caso errado (mutantes)', mut.length >= 20 && mut.every((m) => m.pegou === true), JSON.stringify(mut));
    const tk = res.teclado || [];
    caso('0.8.0 sites A-2: teclado real em 2 temas e 2 larguras (foco fora da barra, anel ≥ 3:1, pausa alcançável) e menu que fecha', tk.length === 3 && tk.every((x) => x.paradas >= 15 && x.tem_pausa && !x.sob_a_barra.length && !x.anel_fraco.length && x.pior_anel >= 3) &&
      !!res.menu && res.menu.fecha_ao_seguir_link && res.menu.fecha_com_esc && res.menu.titulo_visivel, JSON.stringify(tk.map((x) => [x.sob_a_barra, x.anel_fraco])) + JSON.stringify(res.menu));
    caso('0.8.0 sites M-4: ponto da maré baixa na curva em cada cena, em 1440 e 390 px', (res.curva || []).length === 6 && res.curva.every((x) => x.ok), JSON.stringify(res.curva));
    caso('0.8.0 sites M-5: cada cena da simulação sem texto cortado, sobreposto ou sem contraste', (res.cenas || []).length === 6 && res.cenas.every((x) => !x.rolagem_lateral && !x.texto_cortado && !x.texto_sobreposto && !x.contraste_falhas), JSON.stringify(res.cenas));
    const lgs = res.larguras || [];
    caso('0.8.0 sites M-6: 320, 768, 905, 960, 1024, 1100, 1440 e 1920 px sem rolagem lateral, texto cortado, espremido ou sobreposto', [320, 768, 905, 960, 1024, 1100, 1440, 1920].every((l) => lgs.some((x) => x.largura === l && !x.erros_js && !x.rolagem_lateral && !x.texto_cortado && !x.texto_espremido && !x.texto_sobreposto && !x.contraste_falhas)), JSON.stringify(lgs.map((x) => [x.largura, x.rolagem_lateral, x.texto_espremido])));
    caso('0.8.0 sites M-5: vidro dentro da regra nas 4 capturas', cap.every((c) => c.vidro_fora_da_regra === 0), JSON.stringify(cap.map((c) => c.detalhe_vidro)));
    const nomesM = ['foco invisível', 'botão de pausa escondido', 'anel de foco sem contraste no rodapé', 'barra alta sem scroll-padding (foco sob a barra)', 'menu do celular não fecha ao seguir link', 'vidro a 45% sem desfoque', 'valor longo só na 3ª cena', 'ponto da maré baixa solto da curva', 'tábua de preços sem empilhar (320 px)'];
    caso('0.8.0 sites M-5: os pontos cegos da revisão viraram mutantes, todos pegos', nomesM.every((n) => (res.mutantes || []).some((m) => m.nome === n && m.pegou)), nomesM.filter((n) => !(res.mutantes || []).some((m) => m.nome === n && m.pegou)).join(', '));
    const html = ler(...PROVA, 'site-preamar.html');
    caso('0.8.0 sites M-2: sem o bloco e os títulos parecidos com os de uma referência', !/Por que é pago|quanto sobra|Perguntas de quem/i.test(html), 'sobrou');
    caso('0.8.0 sites b-7: botões de plano levam ao fim da página, sem aria-label em parágrafo, pausa muda só o nome', /href="#fim">Testar o Solo/.test(html) && !/<p[^>]*aria-label/.test(html) && !/id="pausa" aria-pressed/.test(html), 'falta');
    caso('0.8.0 sites direitos: a página de prova não traz nome, texto nem endereço de terceiros, e diz que é fictícia', /fict[ií]c/i.test(html) && !/finmate|usecalen|dinzo|nivora|code ?and ?chill/i.test(html) && !/(src|href)=["']https?:/i.test(html) && !/url\(["']?https?:/i.test(html), 'falta aviso ou há referência externa');
    // Cada efeito ou tem prova na bancada, ou fica [ESTIMATIVA] no quadro.
    const quadro = lerSP('efeitos', 'provas.md');
    const pe = res.efeitos || [];
    const semLinha = IDS.filter((id) => !new RegExp('^\\| ' + id + ' \\|', 'm').test(quadro));
    caso('0.8.0 sites efeitos: o quadro de provas tem uma linha por efeito', !semLinha.length, semLinha.join(', '));
    const errados = IDS.filter((id) => { const l = (quadro.match(new RegExp('^\\| ' + id + ' \\|.*$', 'm')) || [''])[0]; return /PROVADO/.test(l) === /\[ESTIMATIVA/.test(l); });
    caso('0.8.0 sites efeitos: só está PROVADO no quadro o que passou na bancada; o resto fica [ESTIMATIVA]', !errados.length, errados.join(', '));
    const ctrl = (res.efeitos_controles || []).filter((c) => !c.informativo);
    caso('0.8.0 sites efeitos: os controles da bancada falham no caso errado (quadros, mexeu, reduzido)', ctrl.length >= 3 && ctrl.every((c) => c.pegou === true), JSON.stringify(res.efeitos_controles));
    const rods = res.efeitos_rodadas || [];
    const r2 = rods.filter((x) => x.ids).slice(-2);
    caso('0.8.0 sites M-1: 2 rodadas seguidas e nenhuma reprovação por comparação de imagem (só tempo de quadro pode oscilar)', r2.length === 2 && r2.every((x) => x.falhas.every((f) => f.motivo.every((m) => /^quadro/.test(m)))), JSON.stringify(r2.map((x) => x.falhas)));
    const est = IDS.filter((id) => r2.length === 2 && r2.every((x) => x.ids.includes(id)));
    caso('0.8.0 sites M-1: PROVADO no quadro só o que passou nas 2 rodadas', IDS.every((id) => new RegExp('^\\| ' + id + ' \\|.*\\| PROVADO( \\(perto do limite[^|]*)? \\|', 'm').test(quadro) === est.includes(id)), IDS.filter((id) => new RegExp('^\\| ' + id + ' \\|.*\\| PROVADO( \\(perto do limite[^|]*)? \\|', 'm').test(quadro) !== est.includes(id)).join(', '));
    caso('0.8.0 sites b-2: quadro sem número fixo no texto e sem "sem animação" em efeito animado', !/49,9 e 16,8/.test(quadro) && !(res.efeitos || []).some((e) => e.tipo !== 'estatico' && new RegExp('^\\| ' + e.id + ' \\|.*sem animação \\|$', 'm').test(quadro)), 'texto antigo');
    const provados = pe.filter((e) => e.provado);
    caso('0.8.0 sites efeitos: cada provado foi visto mexendo, parou com movimento reduzido e teve quadros medidos', provados.length > 0 && provados.every((e) => e.mexeu === true && e.reduzido_ok === true && (e.p95_ms > 0 || e.tipo === 'estatico')), JSON.stringify(provados.filter((e) => !(e.mexeu === true && e.reduzido_ok === true && (e.p95_ms > 0 || e.tipo === 'estatico'))).map((e) => e.id)));
  }
}

module.exports = testarSites;

if (require.main === module) {
  const RAIZ = path.resolve(__dirname, '..');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'au-sites-'));
  const casa = path.join(tmp, 'casa'); fs.mkdirSync(casa);
  const env = { ...process.env, HOME: casa, USERPROFILE: casa };
  delete env.AGENTES_ULTIMATE_SEM_PASTA;
  const hook = (script, dados) => {
    const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', script)], { windowsHide: true, input: JSON.stringify(dados), env, encoding: 'utf8' });
    let json = null; try { json = JSON.parse(r.stdout || 'null'); } catch (e) { /* texto */ }
    return { code: r.status, out: r.stdout, err: r.stderr, json };
  };
  let falhas = 0; let total = 0;
  const caso = (nome, ok, detalhe) => { total++; console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome}${ok ? '' : ' → ' + detalhe}`); if (!ok) falhas++; };
  const rot = (prompt, cwd) => hook('roteador.js', { prompt, cwd, hook_event_name: 'UserPromptSubmit' });
  const ctx = (r) => (r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.additionalContext) || '';
  testarSites({ caso, tmp, RAIZ, rot, ctx });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`${total} casos, ${falhas} falha(s)`);
  process.exit(falhas ? 1 : 0);
}
