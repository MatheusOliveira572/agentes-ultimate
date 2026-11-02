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
  for (const p of ['crie uma landing page para o meu aplicativo', 'faça a landing page do curso de investimentos', 'desenhe o site institucional da empresa',
    'crie um site premium para um app de finanças', 'redesenhe o site da clínica']) {
    const x = agentesDe(p);
    caso(`0.8.0 sites roteador: "${p}" → designer-sites, sem designer-paineis`, /designer-sites/.test(x.ag) && !/designer-paineis/.test(x.ag), x.ag || 'nenhum');
  }
  for (const p of ['monte um painel no power bi com o desvio por área', 'desenhe o dashboard com os kpi da diretoria', 'redesenhe a tela do app de estoque']) {
    const x = agentesDe(p);
    caso(`0.8.0 sites roteador: "${p}" → designer-paineis, sem designer-sites`, /designer-paineis/.test(x.ag) && !/designer-sites/.test(x.ag), x.ag || 'nenhum');
  }
  // A-3, M-7, b-4, b-8 (2ª revisão): todas as frases das sondas do revisor (rv85) e frases de app novas, com o esperado.
  // S = só designer-sites; P = designer-paineis sem designer-sites; A = os dois; N = nenhum designer nem referência a designer; X = o orquestrador decide.
  const TABELA = {
   "S": [
    "landing page",
    "quero uma landing",
    "faça uma landing page",
    "uma landing page pro produto",
    "lp de vendas do meu curso",
    "crie um site",
    "cria um site pra minha padaria",
    "quero um site novo",
    "preciso de um site para minha empresa",
    "me ajuda a fazer um site pro meu restaurante",
    "site para minha clínica",
    "site de portfólio",
    "página inicial do meu produto",
    "homepage da empresa",
    "página de captura de leads",
    "redesenhe o site",
    "melhore o visual do meu site",
    "crie uma página web simples de contato",
    "site institucional",
    "faça a tela de login do meu site",
    "tela de checkout do meu site",
    "crie um website",
    "crie um web site",
    "crie uma web page",
    "crie uma página web de contato",
    "crie uma página de contato",
    "crie meu portfólio online",
    "criar site para loja",
    "fazer um site",
    "monte um site para o escritório",
    "desenvolva um site para a clínica",
    "construa um site institucional",
    "faz um site pra mim",
    "site novo para a loja",
    "quero criar uma landing page",
    "landing pages para campanha",
    "efeito vidro no site",
    "visual premium para o site",
    "html e css do site",
    "crie o frontend do meu site em react",
    "melhore a ux do site",
    "a interface do meu site está confusa",
    "redesign do site",
    "site com animação",
    "site responsivo com tailwind",
    "formulário de contato do site",
    "componente do meu site",
    "animacao no site",
    "quero um site para minha clínica",
    "crie um site premium para a minha clínica",
    "efeito vidro no meu site",
    "crie um website para a padaria",
    "crie a homepage da loja",
    "redesenhe a página inicial do site",
    "monte uma lp de vendas",
    "crie um site para o meu escritório de advocacia",
    "faça um site de casamento",
    "desenvolva o site da minha consultoria",
    "preciso de um site institucional para a ONG",
    "refaça a homepage da minha loja",
    "crie uma landing para o lançamento do curso",
    "melhore a página inicial do meu site",
    "crie um site de uma página só para o evento",
    "faça o site da pizzaria com cardápio",
    "crie um site com blog para a minha marca",
    "crie um site em react",
    "faça a landing page em react com tailwind",
    "site com efeito vidro e animação",
    "faça a landing page com visual premium e efeito vidro",
    "site em html e css com animação",
    "monte uma landing page em next.js com tailwind e animação",
    "quero um site com glassmorphism",
    "crie o site da clínica em react com formulário de contato",
    "landing page com liquid glass",
    "desenvolva o site institucional em react e tailwind",
    "homepage com animação e componente de depoimentos",
    "crie a landing page do aplicativo com efeito vidro",
    "crie um site para a minha clínica odontológica",
    "faça um website para o escritório de advocacia",
    "monte uma landing page para o lançamento do curso",
    "refaça a homepage da padaria com fotos maiores",
    "desenvolva o site da ong com página de doação",
    "melhore o site da loja, está lento e feio no celular",
    "construa um site de portfólio para fotógrafo",
    "preciso de um site institucional para a construtora",
    "faça um site one page para o casamento",
    "crie uma lp para a black friday",
    "redesenhe o site da escola com um visual mais moderno",
    "monte um site em next.js para a minha consultoria",
    "faça o site da imobiliária em react com busca de imóveis",
    "landing page com efeito vidro e animação de entrada",
    "crie um site com tailwind e animações suaves para a agência",
    "não é um app: crie o site com react e efeito vidro",
    "não é para o app, faça o site em react com animação",
    "não quero um app: faça o site da padaria com cardápio",
    "site para o meu escritório de contabilidade, com formulário de contato",
    "crie a página inicial do site da clínica"
   ],
   "P": [
    "crie a tela de login do app em react",
    "tela de cadastro em html e css",
    "faça a interface do sistema em react",
    "componente react de tabela com visual bonito",
    "melhore o css da tela do sistema",
    "frontend do aplicativo em react",
    "crie o front-end do app",
    "tela do aplicativo com tailwind",
    "efeito vidro no menu do app",
    "efeito vidro no cabeçalho do aplicativo",
    "liquid glass na barra do aplicativo",
    "visual premium para o aplicativo",
    "deixe o sistema com visual premium",
    "um painel administrativo em react",
    "crie um app em react native",
    "html e css da tela de login",
    "redesenhe a interface do app",
    "animação no botão do app",
    "tela de checkout do aplicativo",
    "efeito vidro",
    "visual premium",
    "tela do app",
    "desenhe a interface do aplicativo",
    "melhore a ux do formulário",
    "crie um aplicativo com visual premium",
    "power bi publicado num site",
    "faça um card com efeito vidro estilo Apple",
    "redesenhe meu app com visual premium",
    "melhore a ux do aplicativo",
    "monte a tela de configurações do aplicativo em react",
    "faça o menu lateral do app com efeito vidro",
    "melhore a interface do aplicativo de vendas",
    "componente de calendário em react para o app",
    "crie o formulário de cadastro do aplicativo",
    "deixe a tela inicial do app com visual premium",
    "animação de carregamento no aplicativo",
    "css do botão do app está desalinhado",
    "desenvolva o app e crie a tela de login",
    "crie e desenvolva o app em react",
    "monte a tela de perfil do aplicativo com efeito vidro",
    "faça o redesenho da tela de pedidos do app",
    "crie um app de finanças com visual premium",
    "faça a tela de onboarding do aplicativo",
    "crie um componente de gráfico no app em react",
    "desenvolva o front-end do sistema de chamados",
    "monte a interface do app de estoque em tailwind",
    "faça o app mobile com animação no menu",
    "crie a navegação do aplicativo com glassmorphism",
    "melhore a ui do sistema interno",
    "refaça a tela de busca do app",
    "construa o painel administrativo do sistema em react",
    "crie o formulário de login do aplicativo com validação",
    "faça o css do aplicativo ficar responsivo",
    "crie um dashboard de vendas no power bi",
    "monte o painel de indicadores da diretoria",
    "faça um relatório no power bi com o orçado e realizado",
    "crie um painel de bi para o comercial",
    "desenvolva o dashboard de estoque",
    "crie a tela de cadastro do aplicativo de entregas",
    "faça o fluxo de onboarding do app de academia",
    "desenhe a tela de checkout do app da loja",
    "monte o painel administrativo do sistema de chamados em react",
    "melhore a ux do aplicativo de agendamento",
    "crie a interface do sistema de estoque com tailwind",
    "redesenhe a tela de configurações do app",
    "componente de calendário em react para o app de reservas",
    "crie a tela de login do aplicativo de entregas em react native",
    "desenhe a tela do carrinho do app de mercado",
    "refaça a tela de onboarding do app com 3 passos",
    "melhore a tela do perfil no aplicativo",
    "não é um site: crie o app de agenda em react"
   ],
   "A": [
    "crie um dashboard para o site",
    "dashboard de vendas do meu site",
    "dashboard na landing page",
    "mostre um dashboard na landing page do meu produto",
    "desenhe o site do painel de BI",
    "crie um site com dashboard de vendas",
    "site com painel de indicadores para os clientes",
    "crie o site e o app em react com animação"
   ],
   "N": [
    "o site da receita federal saiu do ar hoje",
    "o site",
    "site",
    "entrei no site do banco e não consegui pagar o boleto",
    "pesquise no site da CVM a instrução sobre fundos",
    "baixe os dados do site do IBGE e calcule a inflação",
    "veja no site da microsoft como funciona o DAX",
    "meu site",
    "meu site está lento, o que faço",
    "landing",
    "o avião fez um landing de emergência",
    "parasite é um filme bom",
    "opposite",
    "website",
    "parece um site",
    "contrato de criação de site",
    "analise a concorrência e o posicionamento do site",
    "política de privacidade do site",
    "cookies no site lgpd",
    "publique o site",
    "erro 500 no meu site em produção",
    "corrija o bug de login no site",
    "seo do site",
    "confira o preço no site do produto",
    "abra o novo site do governo",
    "erro no novo site da empresa",
    "o site de vendas caiu",
    "encontrei um site para baixar o relatório da CVM",
    "indique um site para aprender DAX",
    "preciso de um site confiável para comprar dólar",
    "quero um site que compare preços de passagem",
    "a página web do banco não abre",
    "a homepage do jornal mudou",
    "o website do fornecedor está fora do ar",
    "o layout do site do governo mudou e o robô de raspagem quebrou",
    "o formulário do site da receita não envia",
    "o css do site quebrou depois do deploy",
    "o visual do site do concorrente é melhor que o nosso",
    "o site responsivo do banco não abre no celular",
    "a interface do site da prefeitura é horrível",
    "crie um relatório com os dados do site do IBGE",
    "faça login no site do banco e baixe o extrato",
    "crie uma conta no site da receita federal",
    "monte uma planilha com os preços do site do fornecedor",
    "faça o download da tabela no site da CVM",
    "crie um resumo da notícia do site do valor",
    "desenvolva um robô que lê o site da prefeitura",
    "faça uma pesquisa no site do concorrente sobre preços",
    "crie um alerta quando o site do banco central publicar a selic",
    "monte a lista de fornecedores a partir do site da associação",
    "melhore o script que raspa o site do governo",
    "faça a cotação do dólar pelo site do banco",
    "crie um e-mail para o suporte do site da operadora",
    "construa uma tabela com os dados do website da ANP",
    "faz um resumo do que tem no site da empresa concorrente",
    "crie o orçamento de marketing para o próximo trimestre",
    "faça a projeção de caixa de dezembro",
    "monte o cronograma de implantação do ERP",
    "desenvolva o plano de carreira dos analistas",
    "construa a matriz de riscos do contrato",
    "melhore a redação do e-mail para o fornecedor",
    "refaça a reconciliação do razão com o balancete",
    "desenhe o fluxo de aprovação de compras",
    "redesenhe o processo de contas a pagar",
    "crie a política de reembolso de despesas",
    "tire um print da tela de erro do SAP e me explique o que significa",
    "na tela de lançamento do SAP o valor do centro de custo aparece errado",
    "a tela do meu notebook está piscando, o que pode ser",
    "o fornecedor mandou a tela de cotação com preço diferente do contrato",
    "explique a tela de aprovação de pedidos de compra para o time",
    "qual transação abre a tela de cadastro de fornecedor no SAP",
    "o auditor pediu a tela de log de acessos do sistema contábil",
    "monte o passo a passo da tela de conciliação bancária para o manual",
    "a tela de login do site da receita não abre, como resolvo",
    "baixe a tabela de câmbio do site do banco central e atualize a planilha",
    "resuma as notícias do site da CVM sobre a nova norma",
    "o site do fornecedor saiu do ar e preciso do boleto",
    "compare os preços do site da concorrente com os nossos",
    "qual o prazo de prescrição de uma multa contratual",
    "calcule o ebitda ajustado do trimestre",
    "quais exames admissionais são obrigatórios para motorista",
    "quero um site para aprender inglês",
    "quero um site para aprender DAX de graça",
    "a tela de fechamento do TM1 travou no meio da carga",
    "mande a tela da nota fiscal rejeitada para o fiscal",
    "o colaborador não acha a tela do contracheque no portal de RH",
    "anexe a tela do extrato bancário na conciliação de outubro",
    "revise a tela de aprovação da ordem de compra no Ariba",
    "a tela da folha de pagamento mostra horas extras erradas",
    "explique o que aparece na tela do ponto eletrônico",
    "o jurídico pediu a tela do processo no portal do tribunal"
   ],
   "X": [
    "site web",
    "preciso de um site",
    "portfólio de fotografia online",
    "o site está feio, deixa bonito",
    "dashboard",
    "crie um dashboard",
    "painel",
    "um painel administrativo em react para o meu site",
    "painel web do cliente",
    "landing page com print do dashboard",
    "pagina web",
    "crie um app",
    "site institucional e app",
    "site do app",
    "ajuste a landing page do relatório financeiro",
    "escreva o texto da landing page",
    "redesenhe a landing page do painel",
    "página sobre nós da empresa",
    "glassmorphism no painel",
    "glassmorphism",
    "crie o site do app em react",
    "efeito vidro no site do aplicativo",
    "landing page do app com visual premium em react",
    "crie um site em react com efeito vidro",
    "tela de login do site em react",
    "redesenhe o site e o app",
    "o app e o site precisam de visual premium",
    "corrija o css e o html do botão no react",
    "dashboard com kpi de vendas do meu site",
    "crie o site e o aplicativo da clínica com o mesmo visual",
    "o site e o app da loja precisam de redesign em react",
    "faça a landing page e as telas do app de delivery",
    "faça a tela de importação que lê o arquivo baixado do site do banco",
    "o componente react de tabela quebra quando colo dados do site do IBGE",
    "crie a tela de login do app com link para o site",
    "monte a tela de cadastro do sistema de chamados",
    "quero um novo site de receitas da minha avó",
    "preciso de um site moderno para o escritório",
    "uma página de vendas para o meu curso de excel",
    "novo site de vendas",
    "site para o meu restaurante com cardápio e reservas",
    "quero um site moderno para a minha academia",
    "faça a página de vendas do meu curso",
    "monte a página de vendas para o lançamento do ebook",
    "faça a página de vendas da minha loja de roupas",
    "monte a página de vendas do meu ebook",
    "quero uma página de vendas para o meu ebook"
   ],
   "NS": [
    "crie o plano e monte o cronograma do projeto",
    "faça a análise de variação e crie a apresentação para a diretoria",
    "desenvolva e construa o modelo financeiro de fluxo de caixa",
    "melhore o texto e refaça o resumo executivo",
    "crie o contrato de prestação de serviço e faça a revisão das cláusulas",
    "monte o orçamento e faça a projeção do ano",
    "crie a descrição da vaga e monte o roteiro de entrevista",
    "faça o fechamento contábil e crie a conciliação bancária",
    "desenvolva a política de compliance e crie o treinamento",
    "crie a campanha de marketing e faça o calendário de posts",
    "melhore o processo de compras e refaça o fluxograma",
    "faz a conta e cria a planilha de comissões",
    "crie uma medida dax e faça o gráfico de barras",
    "monte a query sql e crie a tabela de dimensão",
    "construa o modelo de dados e desenvolva as medidas",
    "crie testes unitários e faça o refactor da função",
    "crie uma api web em python",
    "desenvolva um serviço web para integrar com o SAP",
    "faça um scraper web para coletar preços",
    "crie um web app de tarefas",
    "desenvolva uma aplicação web para controle de estoque",
    "monte um servidor web local para testes",
    "crie um webhook para o slack",
    "faça o deploy da aplicação web no azure",
    "corrija o bug no script python que lê a planilha",
    "escreva o manual do usuário em PDF",
    "revise a cláusula de rescisão do contrato",
    "calcule o ebitda ajustado do trimestre",
    "analise o turnover da equipe de vendas",
    "prepare o plano de comunicação interna",
    "avalie o risco de lgpd no cadastro de clientes",
    "crie a página inicial do relatório de orçamento no power bi",
    "monte a página de vendas do dashboard comercial",
    "refaça a página inicial do painel com os kpis do mês",
    "melhore a tela de vendas do dashboard do power bi",
    "a tela do relatório de orçamento demora para carregar no power bi",
    "crie a medida dax de margem e mostre na tela de resultados",
    "crie a página inicial do relatório de vendas no power bi",
    "refaça a página de vendas do relatório do power bi com os kpis",
    "a página de vendas do dashboard não atualiza depois da carga",
    "monte uma página de vendas no power bi com mapa por região",
    "na página inicial do painel, troque o cartão de receita",
    "filtre a página de vendas para a região sul no power bi",
    "na página de vendas do produto, o gráfico de margem está vazio",
    "a página de vendas do meu relatório não carrega depois da atualização",
    "mude a página de vendas para mostrar o realizado do mês",
    "redesenhe a página inicial do painel administrativo em react com efeito vidro",
    "crie a página inicial do portal do cliente em react com animação",
    "melhore a página inicial do dashboard em react com glassmorphism",
    "refaça a página inicial do painel administrativo com o formulário de contato",
    "crie a página inicial do painel administrativo com formulário de contato em react",
    "o site moderno do concorrente tem preço menor, monte a análise de preço",
    "acesse o novo site de compras do governo e baixe o edital",
    "cadastre o fornecedor no novo site de compras da empresa",
    "o novo site de notas fiscais da prefeitura pede certificado digital",
    "o novo site de reembolso não aceita o recibo do táxi",
    "o banco lançou um site moderno, mas o extrato continua igual",
    "procure um site para o meu filho estudar matemática",
    "qual o site para o meu cadastro no INSS",
    "indique um site para a minha pesquisa de preços de aço",
    "a planilha baixada do novo site de câmbio veio com vírgula errada"
   ]
  };





  const regra = {
    S: (x) => /designer-sites/.test(x.ag) && !/designer-paineis/.test(x.ag) && !/para `agentes-ultimate:designer-paineis`/.test(x.refs),
    P: (x) => /designer-paineis/.test(x.ag) && !/designer-sites/.test(x.ag),
    A: (x) => /designer-sites/.test(x.ag) && /designer-paineis/.test(x.ag),
    // Referência genérica (layout, relatório) ainda vai ao 1º agente do arquivo quando nenhum pacote entra: é regra do roteador, fora deste lote.
    N: (x) => !/designer-/.test(x.ag) && !/sites-premium|designer-sites/.test(x.refs),
    NS: (x) => !/designer-sites/.test(x.ag) && !/sites-premium/.test(x.refs),
  };
  const nomeClasse = { S: 'só o designer de sites', P: 'o designer de painéis, sem o de sites', A: 'os dois designers', N: 'nenhum designer nem a biblioteca de sites', NS: 'tudo menos o designer de sites (outras áreas, "web" que não é site)' };
  for (const k of ['S', 'P', 'A', 'N', 'NS']) {
    const ruins = TABELA[k].map((p) => [p, agentesDe(p)]).filter(([, x]) => !regra[k](x)).map(([p, x]) => `"${p}" → ${(x.ag || 'nenhum').replace(/agentes-ultimate:/g, '')}`);
    caso(`0.8.0 sites A-3/M-7/b-4/b-8: ${TABELA[k].length} frases que pedem ${nomeClasse[k]}`, !ruins.length, ruins.length + ' erradas: ' + ruins.slice(0, 6).join(' | '));
  }
  // Referência: "site" sozinho não entrega nada a designer; pedido de site entrega a biblioteca.
  const refSite = agentesDe('crie um site para a minha padaria');
  caso('0.8.0 sites A-1: pedido de site leva a biblioteca de sites ao designer de sites', /sites-premium\/INDICE\.md` \(para `agentes-ultimate:designer-sites`\)/.test(refSite.refs.replace(/\\/g, '/')), refSite.refs.slice(0, 200));
  const cf = ler('docs', 'como-funciona.md'), cp = ler('docs', 'criar-pacote.md'), rd = ler('README.md');
  caso('0.8.0 sites b-16: pares, âncora e desempate documentados, e os 2 limites declarados no README', /\*\*Pares\*\*/.test(cf) && /\*\*Desempate entre áreas vizinhas\*\*/.test(cf) && /`pares`/.test(cp) && /`desempate`/.test(cp) &&
    /Limites do roteamento de site × app/.test(rd) && /não diz app, aplicativo ou sistema/.test(rd) && /dados do site do IBGE/.test(rd) && /a um lado só, salvo empate/.test(rd), 'falta');
  // M-12: o "era com" vale depois do desempate. Casa própria, para o exemplo aprendido não vazar para os outros casos.
  {
    const casaM12 = fs.mkdtempSync(path.join(os.tmpdir(), 'au-m12-'));
    const envM12 = { ...process.env, HOME: casaM12, USERPROFILE: casaM12 }; delete envM12.AGENTES_ULTIMATE_SEM_PASTA;
    const rotM12 = (prompt) => { const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'roteador.js')], { windowsHide: true, input: JSON.stringify({ prompt, cwd: projS, hook_event_name: 'UserPromptSubmit' }), env: envM12, encoding: 'utf8' }); let j = null; try { j = JSON.parse(r.stdout || 'null'); } catch (e) { /* texto */ } const t = (j && j.hookSpecificOutput && j.hookSpecificOutput.additionalContext) || ''; return (t.match(/(?:Agentes indicados|Candidatos)[^:]*: ([^.]+)\./) || [])[1] || ''; };
    const ped = 'o componente react de tabela quebra quando colo dados do site do IBGE';
    const antes = rotM12(ped); rotM12('era com designer-paineis'); const depois = rotM12(ped);
    caso('0.8.0 sites M-12: depois do "era com designer-paineis", o mesmo pedido vai ao designer de painéis, sem o de sites', /designer-sites/.test(antes) && /designer-paineis/.test(depois) && !/designer-sites/.test(depois), `antes: ${antes} | depois: ${depois}`);
    const ctl = rotM12('crie um site para a minha padaria com cardápio');
    caso('0.8.0 sites M-12 (controle): a correção não muda um pedido de site diferente', /designer-sites/.test(ctl) && !/designer-paineis/.test(ctl), ctl);
    fs.rmSync(casaM12, { recursive: true, force: true });
  }
  // b-18: "página inicial" fora das âncoras e dos alvos; um painel administrativo com formulário de contato não é site.
  const pi = agentesDe('refaça a página inicial do painel administrativo com o formulário de contato');
  caso('0.8.0 sites b-18: "página inicial" de painel não é âncora nem alvo de site', !/designer-sites/.test(pi.ag) && !/sites-premium/.test(pi.refs), pi.ag);
  // b-15: âncora negada ('não é um app') não conta; sem o !negado da âncora, o pedido iria aos dois designers.
  const neg = agentesDe('não é um app: crie o site com react e efeito vidro');
  caso('0.8.0 sites b-15: âncora negada ("não é um app") não conta no desempate', /designer-sites/.test(neg.ag) && !/designer-paineis/.test(neg.ag), neg.ag);
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
    comAg.length === 1 && ['landing page', 'uma pagina de vendas', 'site institucional'].every((w) => comAg[0].palavras.includes(w)) &&
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
    // Decisão de 2026-11-02: o cartão de landing pode ir sobre foto, com o contraste medido ponto a ponto.
    if (!/sem texto e sem nada em movimento/.test(m) || !/Sobre foto[\s\S]{0,160}pixel a pixel/.test(m)) p.push('fundo calmo sem a definição');
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
    ['regra trocada', mat.replace('sem texto e sem nada em movimento', 'vídeo ou gradiente em movimento'), sup],
    ['foto sem medida', mat.replace(/pixel a pixel/g, 'na média'), sup],
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
    caso('0.8.0 sites A-2: teclado real em 2 temas e 2 larguras (foco fora da barra, anel ≥ 3:1, pausa alcançável) e menu que fecha', tk.length === 3 && tk.every((x) => x.esperadas > 0 && x.paradas === x.esperadas && !(x.faltam || [1]).length && !(x.sobram || [1]).length && x.tem_pausa && !x.sob_a_barra.length && !x.anel_fraco.length && x.pior_anel >= 3) &&
      !!res.menu && res.menu.fecha_ao_seguir_link && res.menu.fecha_com_esc && res.menu.titulo_visivel, JSON.stringify(tk.map((x) => [x.sob_a_barra, x.anel_fraco])) + JSON.stringify(res.menu));
    caso('0.8.0 sites M-4: ponto da maré baixa na curva em cada cena, em 1440 e 390 px', (res.curva || []).length === 6 && res.curva.every((x) => x.ok), JSON.stringify(res.curva));
    caso('0.8.0 sites M-5: cada cena da simulação sem texto cortado, sobreposto ou sem contraste', (res.cenas || []).length === 6 && res.cenas.every((x) => !x.rolagem_lateral && !x.texto_cortado && !x.texto_sobreposto && !x.contraste_falhas), JSON.stringify(res.cenas));
    const lgs = res.larguras || [];
    caso('0.8.0 sites M-6: 320, 768, 905, 960, 1024, 1100, 1440 e 1920 px sem rolagem lateral, texto cortado, espremido ou sobreposto', [320, 768, 905, 960, 1024, 1100, 1440, 1920].every((l) => lgs.some((x) => x.largura === l && !x.erros_js && !x.rolagem_lateral && !x.texto_cortado && !x.texto_espremido && !x.texto_sobreposto && !x.contraste_falhas)), JSON.stringify(lgs.map((x) => [x.largura, x.rolagem_lateral, x.texto_espremido])));
    caso('0.8.0 sites M-5: vidro dentro da regra nas 4 capturas', cap.every((c) => c.vidro_fora_da_regra === 0), JSON.stringify(cap.map((c) => c.detalhe_vidro)));
    const nomesM = ['foco invisível', 'pergunta fora do Tab (tabindex -1)', 'botão de pausa escondido', 'anel de foco sem contraste no rodapé', 'barra alta sem scroll-padding (foco sob a barra)', 'menu do celular não fecha ao seguir link', 'vidro a 45% sem desfoque', 'valor longo só na 3ª cena', 'ponto da maré baixa solto da curva', 'tábua de preços sem empilhar (320 px)'];
    caso('0.8.0 sites M-5: os pontos cegos da revisão viraram mutantes, todos pegos', nomesM.every((n) => (res.mutantes || []).some((m) => m.nome === n && m.pegou)), nomesM.filter((n) => !(res.mutantes || []).some((m) => m.nome === n && m.pegou)).join(', '));
    const html = ler(...PROVA, 'site-preamar.html');
    const barras = [...html.matchAll(/class="amp-barra" style="width:([\d.]+)%"><\/span><span class="num">([\d.,]+)/g)].map((m) => [+m[1], +m[2].replace(/\./g, '').replace(',', '.')]);
    const maxAmp = Math.max(...barras.map((b) => b[1]));
    caso('0.8.0 sites b-13: Solo sem "calendário", semana mais baixa com aviso escrito, texto sem "linha em vermelho" e barras na proporção', !/Tábua, calendário/.test(html) && /▼ mínima/.test(html) && !/linha em vermelho/.test(html) &&
      barras.length === 5 && barras.every(([w, v]) => Math.abs(w - (v / maxAmp) * 100) < 0.1), JSON.stringify(barras));
    caso('0.8.0 sites b-9: sem o calendário de calor nem o "saber antes"', !/saber antes|class="dias"|class="dia n\d/.test(html) && /Baixa-mar/.test(html), 'sobrou');
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
    const r2 = rods.filter((x) => x.ids && x.p95).slice(-3);
    caso('0.8.0 sites M-1: 3 rodadas seguidas e nenhuma reprovação por comparação de imagem (só tempo de quadro pode oscilar)', r2.length === 3 && r2.every((x) => x.falhas.every((f) => f.motivo.every((m) => /^quadro/.test(m)))), JSON.stringify(r2.map((x) => x.falhas)));
    const est = IDS.filter((id) => { const v = r2.map((x) => x.p95[id]).filter((n) => n > 0); return r2.length === 3 && r2.every((x) => x.ids.includes(id)) && v.length && Math.max(...v) <= 2 * Math.min(...v); });
    caso('0.8.0 sites M-1: b-10: PROVADO no quadro só o que passou nas 3 rodadas com tempo estável (≤ 2×)', IDS.every((id) => new RegExp('^\\| ' + id + ' \\|.*\\| PROVADO( \\(perto do limite[^|]*)? \\|', 'm').test(quadro) === est.includes(id)), IDS.filter((id) => new RegExp('^\\| ' + id + ' \\|.*\\| PROVADO( \\(perto do limite[^|]*)? \\|', 'm').test(quadro) !== est.includes(id)).join(', '));
    caso('0.8.0 sites b-2: quadro sem número fixo no texto e sem "sem animação" em efeito animado', !/49,9 e 16,8/.test(quadro) && !(res.efeitos || []).some((e) => e.tipo !== 'estatico' && new RegExp('^\\| ' + e.id + ' \\|.*sem animação \\|$', 'm').test(quadro)), 'texto antigo');
    const piorErrado = IDS.filter((id) => { const l = (quadro.match(new RegExp('^\\| ' + id + ' \\|.*\\| PROVADO.*$', 'm')) || [''])[0]; if (!l) return false; const v = r2.map((x) => x.p95[id]).filter((n) => n > 0); return !l.includes('| ' + Math.max(...v) + ' ms (pior de ' + v.length); });
    caso('0.8.0 sites b-10: o quadro mostra a pior das 3 rodadas, não a última', r2.length === 3 && !piorErrado.length, piorErrado.join(', '));
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
