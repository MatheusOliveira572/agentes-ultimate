# Mudanças

## 0.8.0 · em construção (parte B: conteúdo dos 10 projetos lido sob demanda)
Fonte: `docs/inventario-plugins-2026-11.md`. O desenho do plugin não muda: cada agente ganha até 8 linhas "quando X, leia
`${CLAUDE_PLUGIN_ROOT}/...`" e o conteúdo fica em `conhecimento/`. Casos em `scripts/testar-referencias.js`, cada um visto
falhando antes.
- **B0 · infraestrutura:**
  - prova num `claude -p` real (Claude Code 2.1.302): o Claude Code troca `${CLAUDE_PLUGIN_ROOT}` no corpo do agente do
    plugin, e o agente abre o arquivo da pasta do plugin (fora do projeto, caminho com espaço e acento); com outra
    variável (controle), o caminho chega literal e não abre;
  - `scripts/checar-ferramenta.js`: confere no PATH e mostra a versão, nunca instala (sai 0, 1 ou 2);
  - `terceiros/<projeto>/LICENSE` dos 8 projetos copiados (e o `NOTICE.md` do impeccable) e `CREDITOS.md` com o commit
    fixo de cada um; ECC só do original `affaan-m/ECC`; apple-design-skill sem cópia;
  - `validar.js`: caminho `${CLAUDE_PLUGIN_ROOT}/...` citado existe, até 8 gatilhos por agente, referência até 15 KB e
    com a linha de crédito (commit, ©, licença em `terceiros/`, alterações marcadas).
- **Índice de referências e acionamento sozinho:**
  - cada referência traz, na 2ª linha, tema, palavras e agentes, e, na 3ª, 2 pedidos que devem puxá-la e 1 que não deve;
    o `gerar-agentes.js` junta tudo em `conhecimento/indice.json` e o `validar.js` confere se está em dia;
  - o roteador acrescenta ao contexto "Referências para este pedido: `<arquivo>` (para `<agente>`)", com o mesmo
    vocabulário (sem acento, plural, sinônimos de `pacotes/sinonimos.json`), até 3 por agente e 6 por pedido; referência
    de integração opcional (`requer=21st`) só entra com `"integracoes": ["21st"]` no config;
  - pacote novo "Interface (app e site)" (`designer-paineis` + `engenheiro-software`) e, em pedido de construir app,
    site ou sistema, a lembrança do `/checklist-lancamento` antes de publicar;
  - casos: cada tema com os 3 pedidos contra o roteador real; os 2 pedidos amplos de ponta a ponta ("redesenhe meu app
    com visual premium", "crie um site institucional bonito") ficam pendentes até o conteúdo de design (lote 3).
- **B1 · `engenheiro-software` e `testador-qa`** (~114 KB, 29 arquivos em `conhecimento/engenharia/`, `conhecimento/plataformas/` e
  `conhecimento/metodo/fonte-oficial-da-versao.md`):
  - de addyosmani/agent-skills (MIT): fatias, TDD, padrões de teste, depuração, teste no navegador, API, interface web,
    simplificar, git, CI, migração, observabilidade, desempenho (servidor e web), régua de qualidade, fonte oficial da versão;
  - do original affaan-m/ECC (MIT): erro de build, ponta a ponta, verificação em 6 fases, código morto, arquitetura,
    padrões de código, backend; de emilkowalski/skills (MIT): bibliotecas de interface, web no celular, Swift; de
    pbakaus/impeccable (Apache-2.0, que destilou de ehmo/platform-design-skills, MIT): iOS e Android; context7 (MIT):
    regra de consulta da documentação; auditoria de app Apple em texto nosso a partir da HIG;
  - ferramentas: `modelos/quality-gate.mjs` (portão sobre o JSON do Semgrep e do axe; sai 1 com achado bloqueante, 2 com
    relatório incompleto) e `scripts/gerenciador-pacotes.js` (npm, pnpm, yarn ou bun pelo packageManager ou lockfile);
  - os dois agentes ganham a seção "Referências sob demanda" (8 linhas cada) e 2 casos de eval; prova num `claude -p`
    real: o `engenheiro-software` do plugin abriu `conhecimento/engenharia/erro-de-build.md` e respondeu por ele;
  - nas referências, a raiz do plugin se escreve `<plugin>/` (lá a variável não é trocada) e o `validar.js` confere esses
    caminhos também; tema de referência conta como assunto ("o build quebrou" deixa de ser pergunta trivial).
- **Vigia das fontes:**
  - registro `fontes/fontes.json`: cada fonte com repo, licença, branch, pasta em `terceiros/`, commit usado, último
    conferido e a lista origem → destino (refeita pelo `gerar-agentes.js` a partir das linhas de crédito); o `validar.js`
    falha se `terceiros/`, o `CREDITOS.md` ou uma linha de crédito citar fonte fora do registro;
  - gancho `hooks/vigia-fontes.js` no início de sessão: 1 vez por semana, em segundo plano, só metadados da API do GitHub
    (commits desde o conferido, releases, CHANGELOG, arquivos que usamos, licença); sem rede ou com limite da API,
    silêncio; nunca baixa nem aplica nada; com novidade grava `fontes/novidades.md` (fora do git) e mostra "N fontes com
    novidades: rode /atualizar-fontes"; licença que vira não permissiva dá alerta forte. Desligar:
    `AGENTES_ULTIMATE_SEM_VIGIA=1`;
  - skill `/atualizar-fontes` (só o usuário): pesquisador separa correção, melhoria e função nova e confere a licença,
    proposta em `PROPOSTAS.md`, o engenheiro aplica só o aprovado, o revisor confere e o registro ganha o novo commit.

## 0.8.0 · em construção (parte A: regras dos checklists do autor do plugin)
Fonte: `docs/regras-pdfs-2026-11.md`, a partir dos checklists do autor do plugin ("The App Launch Checklist" e
"Pre-launch Security Toolkit", 2026). Artigos de lei ainda não conferidos no texto oficial ficam marcados **[conferir]**
até o `especialista-lgpd` confirmar. Um commit por grupo (G1 a G11), cada item com um caso em `scripts/testar-hooks.js`
visto falhando antes.
- **G11 · fechamento antes de publicar:**
  - skill nova `checklist-lancamento`: pergunta o perfil (público ou interno, dado pessoal, login próprio, IA,
    entrada de fora, repositório público, cobrança), aplica só os blocos que cabem (S, S-web, P, A, H, L), prova o
    comportamento de cada item e entrega o relatório com Passou / Corrigido e retestado / Aberto / Não se aplica (com
    motivo) / Só o usuário faz; repete as verificações na versão final; tabela "mexeu em X, rode Y"; cartão de
    incidente;
  - os itens ficam em `skills/checklist-lancamento/itens.md` e os roteiros detalhados de segurança (auditar,
    corrigir, verificar, feito quando) em `referencias/`, um arquivo por área, carregados só quando o item é executado;
  - `validar.js`: todo item do checklist tem "Verificar:" e, se cita lei, o link oficial (gov.br);
  - `revisor`: teste apagado ou enfraquecido para passar, e item crítico "não se aplica" sem motivo, são achado Alto
    (caso 7 no eval);
  - skill `rodada`: o contrato inclui os itens do checklist quando a rodada mexe em login, dado pessoal, pacote, chave,
    IA, upload ou publicação;
  - a trava do `git push` (e de npm publish e deploy) continua só perguntando e passa a lembrar o
    `/checklist-lancamento`.
- **G1 · segredos e chaves:**
  - protocolo comum, passo 11: segredo se cita pelo nome da variável, nunca pelo valor (não pedir, não colar, não
    imprimir); vale para os 30 agentes;
  - `hooks/travas.js` passa a ler o conteúdo do commit (as linhas acrescentadas de `git diff --cached -U0`, e também
    as do `-a`). Bloqueia os padrões de alta certeza: chave privada PEM (cabeçalho seguido do corpo), chaves da AWS,
    GitHub, Anthropic, OpenAI, Google, Slack, Stripe, npm e Azure Storage, e texto de conexão com senha (URL ou
    `Server=…;Password=…`). Pergunta nos de média certeza (senha, chave ou token atribuído no código; JWT). A mensagem dá
    `arquivo:linha` e o tipo, nunca o valor. Marcadores (`<senha>`, `${VAR}`, `...`) e a chave de exemplo da AWS passam;
  - `auditor-seguranca`: histórico com todas as branches e tags e valor mascarado; segredo exposto trocado na ordem
    (novo, no ar, revoga o antigo, prova que o antigo falha; reescrever o histórico depois); seção "não deu para
    verificar"; caso 5 no eval;
  - checklist, bloco S: S-1 segredo fora do que é entregue, S-2 variáveis de ambiente, S-3 histórico, S-4 troca na
    ordem, S-5 MFA nas contas e S-10 limite de gasto (os dois últimos "só o usuário faz"); roteiros 02, 11, 24 e 25 e
    extras B4 e B5 em `referencias/`.
- **G2 · pacotes e cadeia de suprimentos:**
  - protocolo comum, passo 11 (agora "Segredos e pacotes"): pacote novo só depois de conferir no registro oficial que
    existe e é o conhecido, não um nome parecido;
  - `auditor-seguranca`, novo passo 3: auditoria de dependências (`npm audit`, `pip-audit`, `osv-scanner`), diretas
    conferidas no registro e lockfile no git;
  - `engenheiro-software`: critério de pronto com pacote conferido, auditoria sem Crítico/Alto em produção e lockfile;
    caso 7 no eval (pacote sugerido que pode não existir);
  - checklist: S-7 dependências e S-8 o que não se usa; roteiros 21 e 22 em `referencias/seguranca-publicacao.md`.
- **G3 · o que vai ao ar expõe demais?**
  - `auditor-seguranca`: na pasta ou no pacote publicado não há `.env`, `.git`, dump, backup nem `.map`; no Power BI,
    confere "Publicar na web", link para "qualquer pessoa da organização", exportação de dados e RLS desligada; caso 6
    no eval;
  - `engenheiro-software`: erro ao usuário é genérico, com código de referência, e o detalhe vai só para o log;
  - `especialista-lgpd`: o inventário inclui os serviços de terceiros que recebem dado, conferidos no tráfego real;
  - checklist: S-9 nada privado no que vai ao ar (com os pontos do Power BI) e S-11 erro sem detalhe; roteiros 20 e 23.
- **G4 · logs sem segredo e rastreáveis:**
  - `engenheiro-software`: log sem senha, token nem perfil inteiro (registra o ID, não o perfil), com hora UTC, ID do
    usuário e da requisição e resultado; caso 8 no eval (log e erro ao usuário);
  - checklist: S-12 log de segurança, com a guarda de 6 meses do Marco Civil (art. 15 [conferir]) para app público com
    fins econômicos e a [HIPÓTESE] de que ferramenta interna não se enquadra; roteiro 08.
- **G5 · controle de acesso e app web:**
  - checklist, bloco S-web (entra quando há login próprio ou entrada de fora), 17 itens: login no servidor, senhas,
    banco e IDOR, XSS, cookies, CSRF, validação e consulta parametrizada, links de redefinição, upload, pagamento, SSRF,
    IA, administração, HTTPS, limite de requisições, CORS e cabeçalhos de segurança;
  - S-6 no bloco S (vale para todo produto): A não vê o dado de B, testado com dois usuários; no Power BI, "ver como"
    com dois papéis da RLS;
  - roteiros em `referencias/`: identidade (01, 05, 09, 15, 17), dados (03, 06, 07, 10, 18, 19), rede (04, 12, 13, 14,
    16) e extras B1 (IA) e B2 (SSRF);
  - `engenheiro-software`, passo 7: código com login ou entrada de fora confere identidade no servidor, nunca aceita ID,
    papel ou preço do navegador, valida a entrada, usa consulta parametrizada e roda os itens S-web que toca; caso 9 no
    eval.
- **G6 · privacidade e LGPD** (os artigos não conferidos no texto oficial levam **[conferir]**):
  - `especialista-lgpd`: aviso de privacidade pelos fluxos reais, com versão e data; operador, suboperadores e
    transferência internacional; pedidos do titular com identidade conferida, resposta em até 15 dias e registro; guarda
    contando backups e ferramentas de terceiros; criança e adolescente com o ECA Digital (vigência como [HIPÓTESE]);
    erros conhecidos: aviso copiado de modelo, "li e aceito" não é consentimento, treinar IA com dado de usuário é
    finalidade nova; caso 6 no eval. Texto do agente condensado para caber nas 90 linhas;
  - `advogado-contratos`: termos de uso batendo com o produto e registro do aceite (quem, versão, quando, como, sem
    sobrescrever); caso 5 no eval;
  - `estrategista-marketing`: consentimento de marketing separado, desmarcado e revogável; caso 6 no eval;
  - checklist, bloco P: P-1 a P-11 (inventário, aviso, ciência × consentimento, guarda, terceiros, pedidos do titular,
    criança, treino de IA, cookies só depois da escolha, registro do aceite, painel interno com dado de empregado),
    todos com o link oficial; extra B6.
- **G7 · acessibilidade:**
  - `designer-paineis`: contraste de 3:1 também para o que não é texto (barra, borda de campo, foco; WCAG 1.4.11) e em
    todos os estados; ordem de tabulação igual à de leitura, foco visível, nada preso; a NBR 17225:2025 entra no método;
    critério de pronto com texto alternativo de cada visual e resumo em texto; caso 6 no eval;
  - checklist, bloco A: A-1 contraste em tudo e em todos os estados, A-2 texto alternativo e resumo, A-3 só com o
    teclado, A-4 teste com quem usa tecnologia assistiva; LBI art. 63 [conferir] e a [HIPÓTESE] do art. 34 para
    ferramenta interna.
- **G8 · honestidade do que se afirma:**
  - `estrategista-marketing`: alegação objetiva com evidência datada (sem evidência, sai) e depoimento só de cliente
    real, com incentivo declarado; caso 7 no eval;
  - `analista-compliance`: selo ou certificação sem relatório vigente, com escopo e período, é alegação falsa; caso 6;
  - `designer-paineis`: "atualizado em" vem da carga real, nunca texto fixo; caso 7;
  - `advogado-contratos`: a lista de risco ganha uso de marca e publicidade (logo com permissão escrita) e nível de
    serviço medível; caso 6;
  - `redator` e `designer-documentos` (decisão D-4, opção b): conteúdo feito com IA para terceiros leva rótulo quando
    alguém puder ser enganado; caso 5 em cada eval;
  - checklist, bloco H: H-1 a H-7 (alegação, "atualizado em", disponibilidade, depoimentos, selos, logos, rótulo de IA),
    com CDC e Lei 9.279 [conferir] e a [HIPÓTESE] do PL 2338/2023;
  - Papel e Fora do escopo de marketing e compliance condensados para caber nas 90 linhas.
- **G9 · licenças e propriedade intelectual:**
  - protocolo comum, passo 6: material de terceiro sem licença (texto, imagem, prompt) entra só como ideia, com as nossas
    palavras e a fonte citada; nunca copiado (decisão do orquestrador: no protocolo, para valer nos 30 agentes);
  - `pesquisador`: o mesmo nos erros conhecidos, com a Lei 9.610 [conferir]; caso 5 no eval (perguntar antes se o
    material é do usuário: os PDFs desta versão eram dele); regra nova em `skills/ultimate/regras-gerais.md`;
  - `designer-paineis` e `designer-documentos`: fonte, ícone e imagem com licença que cobre o uso;
  - `engenheiro-software`: inventário de licenças das dependências com os avisos (MIT, NOTICE do Apache); copyleft vai
    para revisão; caso 10 no eval;
  - checklist, bloco L: L-1 recursos visuais, L-2 dependências, L-3 material de terceiro.
- **G10 · venda ao consumidor:** só os padrões enganosos entram agora (o resto do grupo, com o bloco C-venda, fica fora
  até haver projeto que venda ao consumidor): `estrategista-marketing` ganha o erro conhecido (urgência falsa, caixa já
  marcada, recusa escondida; CDC [conferir]) e o caso 8 no eval; checklist H-8.
- **Validador (D-e):** norma brasileira citada em `fonte/` ("Lei", "Decreto", "Resolução", "LC" ou "MP" com número) sem
  link oficial (gov.br) na mesma linha ou nas 2 seguintes vira aviso; citar de novo, no mesmo arquivo, uma norma já
  linkada não pede outro link. As normas citadas hoje passam (0 aviso). O doc pedia "na linha ou na seguinte"; ficaram 2
  linhas porque duas citações antigas (compliance e comprador) quebram a linha antes do link.
- **Backup (D-i):** `engenheiro-dados` só dá por pronto, com banco próprio, o backup provado por restauração num
  ambiente separado (com `RESTORE.md`); caso 6 no eval; checklist S-13 e extra B3.
- `engenheiro-software` condensado para voltar às 90 linhas depois da seção de referências da parte B.

## 0.7.0 · 2026-10-28
- **Verificações (bloco 0, Claude Code 2.1.302, detalhes no topo de `docs/plano-0.7.md`):**
  - o plugin liga a barra pelo próprio `settings.json` (o plano supunha que não; a skill `instalar-barra` não foi
    necessária);
  - `claude plugin eval` existe;
  - os campos reais dos ganchos `Agent`, `SubagentStart` e `SubagentStop`. O `SubagentStop` chega 2 vezes por agente.
- **Registro de cada execução** (`hooks/execucoes.js`): ciclo de vida do agente em `.claude/base/.agentes.jsonl`
  (pedido → lançado → início → fim). Uma linha por execução em `~/.claude/agentes-ultimate/execucoes.jsonl`, com:
  - agente, tipo de tarefa (`pacotes/classes-tarefa.json`), minutos pelas pontas da transcrição (256 KB de cada lado);
  - faixa registrada, código do pedido e código anônimo do projeto;
  - nunca o pedido nem o caminho.
- **Código do pedido `[cod:xxxx]`** na descrição do agente: liga progresso, faixa, registro e placar, e separa dois
  agentes do mesmo tipo trabalhando ao mesmo tempo.
- **Estimativa** (`scripts/estimar.js`):
  - `faixa` usa a classe de referência em cascata (agente+classe → agente → classe → todos, até n ≥ 3) e dá a
    mediana e o p75 dos minutos reais;
  - com `--estimado`, corrige pelo fator real ÷ estimado; sem histórico, estimado × 1 a × 2;
  - `--registrar` grava a mesma faixa;
  - `registrar` é o único jeito de gravar a faixa (UTF-8 garantido);
  - `importar` traz as execuções antigas das transcrições do projeto.
  - A skill `ultimate` manda calcular, registrar e dizer a faixa com a base.
- **Progresso:** o protocolo comum ganha o passo 10: gravar `.claude/base/.progresso/<agente>-<código>.json`
  (feito, total, etapa) ao fim de cada etapa. `validar.js` exige o passo e a ferramenta `Write` em todo agente.
- **Barra por agente** no painel do Claude Code (`hooks/barra.js`): barra, %, etapa, minutos e "fim 14h10–14h50"
  ou "passou da previsão (+n min)". Liga pelo `settings.json` do plugin, por um lançador fixo
  (`~/.claude/agentes-ultimate/barra.js`) que o início de sessão regrava, porque o comando da barra não recebe
  `CLAUDE_PLUGIN_ROOT`.
- **Placar** (`scripts/placar.js`, skills `placar` e `registrar-defeito`):
  - o revisor termina o relatório com a linha fixa `Placar: autor= cod= veredito= B= A= M= b=`, que o gancho lê da
    última mensagem ou do fim da transcrição;
  - por agente: de primeira, defeitos por gravidade, escaparam ao usuário, retrabalho e acerto da faixa, mais a taxa
    de captura do revisor;
  - revisor sem a linha vira aviso em `estado.json`; novo caso 6 no eval do revisor.
- **Mapa ao vivo · "Agentes agora":**
  - painel lateral com cada agente trabalhando: cor, barra de %, etapa em até 4 palavras, "termina por volta de
    17h40" (pelo ritmo do progresso ou pela faixa), "passou da previsão" ou "terminou às";
  - aviso e linha no "Ao vivo" quando cada agente termina;
  - anel de progresso no marcador do agente; nome do agente sem o prefixo do plugin;
  - nova rota `/agentes`.
- Testes dos ganchos: 89 casos (37 novos, cada um visto falhando antes da mudança). Os commits dos blocos 1 a 3
  dizem 65, 70 e 78 casos; os números certos são 63, 68 e 76.

### Correções da revisão independente (`docs/revisao-0.7.0.md`), antes de publicar
A versão continua 0.7.0 (não tinha sido publicada). Um commit por item.
- **A-1 · fim do agente lento com o histórico:**
  - antes, o `SubagentStop` refazia o placar inteiro, com custo quadrático (2,4 s com 10 mil execuções, 122 s com
    60 mil);
  - agora o gancho só acrescenta a linha e atualiza, pelo trecho novo, um índice por chave
    (`~/.claude/agentes-ultimate/.indice-*.json`: primeira revisão por trabalho; minutos e fator por chave, os 500
    mais recentes);
  - o placar completo é refeito só pela skill `placar` e pelo registro de defeito; o retrabalho é calculado numa
    passada;
  - barra, mapa e `estimar.js faixa` usam o mesmo resumo;
  - medido com 60 mil execuções e 20 mil revisões: o fim do agente custa até 0,3 s além de abrir o Node (281 ms, com
    Node vazio a 163 ms; 187 ms numa medida com a máquina livre), e a barra também;
  - o placar dá o mesmo resultado da regra antiga.
- **M-1 · agente parado:** agente parado (`TaskStop`) ou sessão fechada não fica mais "trabalhando":
  - passou do fim da faixa + 30 min sem progresso (sem faixa, início + 3 h), vira "sem notícia" (cinza) e sai do
    painel 2 h depois;
  - o início de sessão tira do painel os agentes sem sinal de sessões anteriores (se ainda terminarem, o registro
    vale).
- **M-2 · troca de código:** dois agentes do mesmo tipo lançados juntos não trocam mais de código. A ligação vem do
  par certo, não da ordem de chegada:
  - o `.meta.json` que o Claude Code grava ao lado da transcrição do agente;
  - o `PostToolUse` do `Agent` (com `agentId` e a descrição);
  - o `tool_use_id`.

  O pedido mais antigo do mesmo tipo vira só palpite provisório. Provado com 20 rodadas, inícios a 5 ms.
- **M-3 · regra do código:** o código é do **trabalho**:
  - correção do mesmo trabalho reusa o código do autor (é o retrabalho);
  - o revisor recebe `[revisa:xxxx]`, não `[cod:]`, e não herda faixa nem progresso;
  - o código só é lido da descrição;
  - a faixa vale só para o mesmo agente, e o `estimar.js` recusa o código de outro agente.
- **M-4 · % estimado:**
  - sem progresso gravado, o % aparece como estimado: barra tracejada e "~21% (estimado)" no painel, "▒" e "~21%"
    na barra;
  - o término pelo ritmo das etapas fica dentro da faixa.
- **M-5:** casos para os mutantes B2 (cascata em par), C1 (valor do retrabalho) e C2 ("de primeira" por trabalho).
  Mutação numa cópia: os 3 são pegos.
- **M-6 · achado contado duas vezes:** a linha fixa do revisor ganha `ids=A-1,M-2,…`, e o achado ainda aberto mantém
  o id. O placar conta cada achado uma vez por trabalho (sem ids: o maior número de cada gravidade entre as revisões).
- **b-5 · privacidade:** `ultimo-pedido.json` e os exemplos do "era com" guardam só os termos do pedido (sem
  valores, números, caminhos nem e-mails), nunca o texto; os exemplos antigos são convertidos.
- **Baixos:**
  - b-1: `AGENTES_ULTIMATE_SEM_PASTA=1` desliga o registro;
  - b-2: texto da faixa sem o "sem histórico" errado;
  - b-3: lançador também no `$HOME` quando ele difere da pasta do usuário;
  - b-4: trava contra o `SubagentStop` repetido em paralelo;
  - b-6: código da linha Placar limitado a 16 caracteres;
  - b-7: prova dos casos "falhando antes" em `docs/provas/0.7.0-casos-antes.md` (69 de 73 casos novos falham na
    0.6.0; os 4 que passam são negativos).
- **Prova visual** (`docs/provas/0.7.0-painel/`, Edge sem interface, 0 erro de JavaScript): achou e corrigiu duas
  coisas.
  - O card "sem notícia" mostrava a barra estimada perto de 99% (parecia "quase pronto") e a etapa "trabalhando".
    Agora mostra só o progresso informado e "nenhuma etapa informada" ou "última etapa: …".
  - Ao trocar o tema com a página aberta, o painel ficava com as cores do tema anterior. Agora se redesenha.
- Fica para depois: sal no código anônimo do projeto (b-6; tudo é local hoje) e retrabalho pelas correções "era com"
  (b-7; o registro não guarda qual agente estava errado).
- Testes dos ganchos: 125 casos, todos passando.

### Correções da 2ª rodada da revisão (pode publicar = sim; antes do push)
- **M-7 · faixa da construção herdada pela correção:** a correção que reusa o código herdava a faixa da construção
  ("passou da previsão · +398 min" já no início, fator 0,17 no histórico). Agora a faixa com código só vale se é do
  mesmo agente e foi registrada perto do início desta execução (de 15 min antes até 3 h depois). Sem faixa própria,
  a previsão vem da classe de referência, e a execução fica fora do fator (fonte "sem"). A skill `ultimate` manda
  registrar faixa nova na correção.
- **b-8:** abrir outra sessão no mesmo projeto não tira mais do painel um agente vivo dentro da faixa: usa o mesmo
  prazo do painel.
- **b-9:** texto do caso e do comentário. Na 2.1.302 o `.meta.json` do agente só existe no fim; no início, vale o
  palpite até o `PostToolUse` ou o `SubagentStop`.
- **b-10:** casos que pegam os mutantes M4 (teto do término pela faixa, com progresso acima de 15%) e M2b (trava do
  fim testada sem depender de corrida).
- **b-11:** os termos guardados descartam palavras com inicial maiúscula fora do começo da frase (prováveis nomes de
  pessoa, empresa ou cliente).
- **b-12:** sai o campo `primeira` do registro das revisões. Ele ficava nulo com histórico grande e era uma 2ª fonte
  para a regra que o placar calcula.
- **Modelo e esforço por tarefa:** o roteador lê `"modelo_por_tarefa"` no `config.json` do usuário e no do projeto.
  O projeto vence, inclusive com `false`. Ligada, a política põe no contexto a linha que manda passar `model` e
  `effort` pela tabela da skill `ultimate` §1b. README com a seção Configuração.
- Testes dos ganchos: 136 casos, todos passando.

### Correções da 3ª rodada da revisão (pode publicar = sim; antes do push)
- **M-8 · hora perto da meia-noite:** uma hora "HH:MM" perto da meia-noite caía no dia errado (às 23h47, "00:10"
  virava 0h10 de hoje, no passado).
  - Agora a hora vai para o dia que fica a até 12 h de agora, e o `--ate` menor que o `--de` passa a meia-noite.
  - `AGENTES_ULTIMATE_AGORA` fixa o relógio nos testes (23h50 e 0h10).
  - A bateria não depende mais da hora em que roda: rodada às 23h55, todos passam.
- **b-13:** a faixa que terminou antes do início da execução não vale mais, mesmo registrada há menos de 15 min.
  - Um caso antigo usava a hora fixa "14:10" e, à noite, caía nessa regra. Agora usa horas relativas a agora.
  - O commit do b-13 (`778a7ca`) saiu com essas 3 falhas; elas foram corrigidas no seguinte (`358872c`).
- **b-15:** `modelo_por_tarefa` aceita `"true"`/`"false"` em texto.
- Testes dos ganchos: 141 casos, todos passando.

## 0.6.0 · 2026-10-28
- **Mapa sem F5:** o servidor avisa a página quando o último pedido muda (`tipo:"busca"`: destaques, caixa "Último
  pedido" e arquivo citado que ainda não estava no desenho) e quando o grafo refeito muda (`tipo:"grafo"`: a página
  busca `/dados` e junta sem embaralhar; quem já está fica onde está, quem chega entra perto dos vizinhos). O grafo é
  refeito também 8 s depois de uma edição ou arquivo novo. `mapa-visual.js` exporta `dados(cwd)`.
- **Ligações feitas sozinhas:** quando um agente lê A e depois edita ou cria B, nasce a ligação de uso A → B com um
  cometa, que fica como trilha durante a sessão; arquivo novo surge com uma onda perto do que o agente lia, ligado a
  ele (provisório, até o grafo refeito trazer as ligações de "cita").
- **Marcador por agente** com nome e cor, que desliza até o arquivo tocado; partículas no caminho ativo; botão
  "Seguir" (a câmera acompanha; desliga ao arrastar); contador da sessão (lidos, editados, criados, agentes ativos).
- **Acabamento:** entrada em cascata, grafo "respirando" em repouso, ligações em curva com peso pela relevância,
  pastas como regiões com halo e nome, cartões em vidro fosco ao passar o mouse e ao clicar, zoom e arraste com
  inércia, botão "Enquadrar", rótulos sem sobreposição, claro e escuro automáticos, respeita "reduzir movimento".
- **Tudo automático:** gancho `Stop` anota o fim do trabalho e o mapa avisa "Trabalho concluído · X lidos, Y
  editados, Z criados", com os marcadores pousando e a trilha em destaque. Abrir sozinho também pela configuração do
  usuário (`~/.claude/agentes-ultimate/config.json` → `"mapa": { "abrir_sozinho": true }`; a do projeto prevalece);
  no início da sessão não abre outra janela se já houver aba conectada. Servidor de versão antiga é trocado sozinho.
- Testes dos ganchos: 52 casos.

## 0.5.1 · 2026-10-27
- **Delegar é o padrão:** pedido com trabalho de especialista vai para os agentes; o orquestrador coordena, junta,
  cobra prova e chama o revisor. Antes, a instrução "se for simples, responda direto" fazia o Claude trabalhar sozinho.
  Projeto pode trocar com `"delegar": "quando-precisar"` no `config.json`.
- **Nome certo do agente:** o contexto passa o `subagent_type` completo (`agentes-ultimate:<nome>`); os agentes do
  projeto (equivalências) vão sem prefixo.
- **Vocabulário não achou a área? O Claude decide:** recebe o catálogo inteiro (área → agentes) e escolhe pelo assunto,
  em vez de cair no núcleo. O catálogo também vai quando há pacote, para acrescentar outra área se faltar.
- Plural em cada palavra das expressões ("unidades de negócios" acha "unidade de negócio"); vocabulário de pessoal e
  folha (headcount, folha, verba, grade, quadro de pessoal) e de planilha (Excel, xlsx).
- Mapa ignora o arquivo temporário do Office (`~$…`).
- Testes dos ganchos: 45 casos.

## 0.5.0 · 2026-10-27
- **Mapa ao vivo:** gancho `PostToolUse` (`hooks/atividade.js`) anota cada arquivo lido, editado, criado ou
  procurado, e por qual agente (só o caminho, em `.claude/base/.atividade.jsonl`, fora do git). Servidor local
  (`hooks/mapa-servidor.js`, 127.0.0.1, para sozinho após 2 h sem uso) transmite na hora: o arquivo acende na cor do
  agente, edição fica vermelha, arquivo novo vira ponto novo, e a lista "Ao vivo" mostra quem fez o quê.
- Abrir: skill `ver-mapa` ("mostre o mapa"), ou sozinho a cada sessão com `"mapa": { "abrir_sozinho": true }` no
  `.claude/base/config.json` do projeto (desligado por padrão).
- Testes dos ganchos: 41 casos (atividade, servidor, transmissão, abertura automática).

## 0.4.1 · 2026-10-27
- **Mapa visual** (`hooks/mapa-visual.js`, skill `ver-mapa`): página HTML sem internet com o grafo do projeto
  (arquivos, quem cita quem, anotações da memória) e o caminho que o último pedido usou em destaque; clique, zoom,
  busca. O roteador guarda o último pedido em `.claude/base/.ultima-busca.json`.
- `.claude/base/.gitignore` de versões antigas ganha as linhas dos arquivos gerados que faltarem.
- Testes dos ganchos: 36 casos.

## 0.4.0 · 2026-10-27
- **16 agentes novos para as áreas da empresa:** RH (`analista-rh`, `recrutador`), Jurídico (`advogado-contratos`,
  `especialista-lgpd`), Compliance (`analista-compliance`), Contábil e tributário (`contador`,
  `especialista-tributario`), Tesouraria (`analista-tesouraria`), Comercial (`executivo-vendas`), Marketing
  (`estrategista-marketing`), Clientes (`especialista-cs`), Operações (`analista-operacoes`, `comprador`), Estratégia
  (`estrategista`), Comunicação (`comunicador-corporativo`) e ESG (`especialista-esg`). 17 pacotes no total.
- **Padrão de excelência** (`docs/padrao-agente.md`), cobrado pelo validador: 3 a 5 referências com fonte aberta, das
  quais **pelo menos 3 empresas diferentes** reconhecidas como as melhores daquela função (`[empresa]`); normas e
  autores só completam; leis ficam no método. 3 a 20 evals por agente, com regressão e gatilho negativo.
- Os 14 agentes anteriores refeitos nesse padrão: referências trocadas por empresas, práticas delas viraram passos do
  método, evals novos em `evals/`.
- **Config por projeto** (`.claude/base/config.json`): troca os agentes do plugin pelos do projeto, lê memórias que o
  projeto já tinha e desliga pacotes.
- Roteador ignora relatórios de agentes e avisos do sistema que chegam como mensagem.
- Testes dos ganchos: 33 casos.

## 0.3.1 · 2026-10-27
- **Correção de privacidade:** em repositório git, o grafo e o mapa automático só incluem o que o git não ignora
  (`git ls-files -co --exclude-standard`). Antes, pastas de dados fora do git (ex.: saídas com valores) entravam no
  `MAPA-AUTO.md` local. Teste novo.

## 0.3.0 · 2026-10-27
- **Atualização automática** (`hooks/atualizar.js`, SessionStart): no máximo 1 vez por dia, em segundo plano, roda
  `claude plugin marketplace update agentes-ultimate` e `claude plugin update agentes-ultimate@agentes-ultimate`; na
  sessão seguinte avisa a versão nova. Desliga com `AGENTES_ULTIMATE_SEM_AUTOATUALIZAR=1`; não roda em cópia local
  (`--plugin-dir`). Registro em `~/.claude/agentes-ultimate/atualizacao.log`.
- Testes dos ganchos: 25 casos (4 novos da atualização, com um `claude` falso).

## 0.2.0 · 2026-10-27
- **Grafo do projeto** (`hooks/grafo.js`): mapa automático (`.claude/base/MAPA-AUTO.md`) com o que é cada arquivo e
  quem cita quem; registros da memória ligados aos arquivos; busca do "já feito" com sinônimos
  (`pacotes/sinonimos.json`) e 1 salto pelas ligações. Sem IA, local, com limite de tempo.
- Protocolo comum: situar-se pelo mapa automático e pelos arquivos ligados; citar sempre o caminho dos arquivos na
  memória (é o que liga a memória ao mapa).
- Roteador: plural simples nas palavras dos pacotes; arquivo da pasta só reforça (sozinho não puxa pacote); pedido com
  assunto abaixo do mínimo vai para o núcleo em vez de ser tratado como trivial.
- `.claude/base/.gitignore` criado sozinho (o grafo e o mapa automático ficam fora do git).
- Testes dos ganchos: 21 casos.

## 0.1.0 · 2026-10-27
- Primeira versão: 14 agentes em 6 pacotes (núcleo, BI, Finanças, Produto, Software, Documentos), protocolo comum
  gerado, skills `ultimate`, `rodada`, `fechar-etapa`, `criar-agente`, `rascunho` e `metodo-powerbi`.
- Escolha automática por pedido e pasta, com aprendizado por `era com <agente>`.
- "Já feito sobre isto": diário, lições e mapa relacionados entram no contexto antes de começar.
- Memória do projeto criada na primeira vez (`.claude/base/`).
- Travas: confirmação para publicar; bloqueio de commit com arquivo sensível e de heredoc com barra invertida.
- Validador, gerador e testes dos ganchos (15 casos).
