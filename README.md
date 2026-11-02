# agentes-ultimate

Uma base de agentes especialistas para o [Claude Code](https://claude.com/claude-code), em português, para **qualquer
trabalho**: um painel de BI, uma análise financeira, um relatório, um script, uma pesquisa.

Você só faz o pedido. A base:

1. **escolhe sozinha** os especialistas certos, pelo assunto do pedido e pelos arquivos da pasta, e mostra a escolha
   numa linha (`Usando: BI e painéis + Finanças · designer-paineis, dev-powerbi, analista-fpa, revisor`);
2. **não começa no escuro:** antes de agir, traz o que já foi feito sobre o assunto. Ela mantém um **grafo do
   projeto** (o que é cada arquivo, quem cita quem, e quais registros da memória falam de cada arquivo) e busca com
   **sinônimos** ("despesas por área" acha "custos por gerência") e pelas **ligações** (pedido sobre um arquivo traz os
   arquivos ligados e o histórico dele). Tudo local, sem IA;
3. **monta a memória do projeto** na primeira vez, sem você pedir;
4. **cobra prova:** nada é "pronto" sem um comando rodado e lido; um revisor independente confere antes de você;
5. **aprende:** erro vira lição com causa e evidência; lição que se repete vira regra; e você aprova qualquer mudança
   no comportamento dos agentes;
6. **protege:** pede confirmação antes de publicar e bloqueia commit de senha ou dado sensível.

Se a escolha errar, diga `era com <agente>`: ela refaz e aprende para os próximos pedidos parecidos.

## Instalar

Pré-requisitos: Claude Code e [Node.js](https://nodejs.org/) (os ganchos são scripts Node, sem dependências).

No Claude Code:

```
/plugin marketplace add MatheusOliveira572/agentes-ultimate
/plugin install agentes-ultimate@agentes-ultimate
```

Ou pelo terminal:

```bash
claude plugin marketplace add MatheusOliveira572/agentes-ultimate
claude plugin install agentes-ultimate@agentes-ultimate
```

**Atualização automática:** uma vez por dia, ao abrir uma sessão, o plugin busca a versão nova em segundo plano
(`claude plugin marketplace update` + `claude plugin update`). Ela vale a partir da próxima vez que você abrir o
Claude Code, e uma linha avisa "agentes-ultimate atualizado: 0.2.0 → 0.3.0". Para desligar, defina
`AGENTES_ULTIMATE_SEM_AUTOATUALIZAR=1`. Para atualizar na hora:

```bash
claude plugin marketplace update agentes-ultimate
claude plugin update agentes-ultimate@agentes-ultimate
```

Para testar uma cópia local sem instalar: `claude --plugin-dir <pasta-do-repositório>`.

## O que vem

**Núcleo** (sempre disponível): `planejador`, `pesquisador`, `revisor`, `redator`, `curador`.

32 agentes, cada um trabalhando como **as melhores empresas daquela função** (pelo menos 3 empresas diferentes por
agente, com a prática documentada e a fonte aberta), com casos de teste próprios em `evals/`.

| Pacote | Entra quando o pedido fala de… | Agentes | Algumas referências |
|---|---|---|---|
| BI e painéis | Power BI, DAX, painel, dashboard (ou a pasta tem `.pbip`) | `designer-paineis`, `engenheiro-dados`, `dev-powerbi` | Financial Times, Airbnb, Microsoft, SQLBI |
| Interface (app) | tela de app, aplicativo, redesenho, visual premium, efeito vidro | `designer-interface`, `engenheiro-software` | Apple, Nielsen Norman, Google, Stripe |
| Sites e landing pages | landing page, página de vendas, site institucional | `designer-sites`, `engenheiro-software` | Stripe, Nielsen Norman, Google, Apple |
| Finanças | orçado, realizado, desvio, fechamento, caixa, capital de giro | `analista-fpa`, `analista-tesouraria` | Microsoft Finance, Equinor, Apple, Ambev |
| Contábil e tributário | contabilidade, CPC/IFRS, imposto, reforma tributária, SPED | `contador`, `especialista-tributario` | Deloitte, KPMG, Unilever |
| Pessoas (RH) | vaga, entrevista, cargos e salários, desempenho, clima | `analista-rh`, `recrutador` | Google People Ops, Netflix, Natura, Amazon, Nubank |
| Jurídico | contrato, cláusula, LGPD, dados pessoais | `advogado-contratos`, `especialista-lgpd` | GE, GitHub, Apple, Google, Microsoft |
| Compliance e riscos | programa de integridade, controles, canal de denúncia | `analista-compliance` | Siemens, Petrobras, Microsoft |
| Comercial | funil, proposta comercial, previsão de vendas, CRM | `executivo-vendas` | Salesforce, HubSpot, RD Station |
| Marketing | posicionamento, campanha, marca, CAC/LTV | `estrategista-marketing` | P&G, Airbnb, Magalu, Google |
| Clientes | atendimento, NPS, churn, SLA | `especialista-cs` | Amazon, Bain, Zendesk, Gainsight |
| Operações e suprimentos | processos, lean, gargalo, compras, fornecedor | `analista-operacoes`, `comprador` | Toyota, Amazon, Danaher, Apple, P&G |
| Estratégia | planejamento estratégico, OKR, business case | `estrategista` | Google, Amazon, BCG |
| Comunicação | comunicado, imprensa, crise | `comunicador-corporativo` | J&J, Netflix, Amazon |
| ESG | emissões, sustentabilidade, GRI, IFRS S2 | `especialista-esg` | Microsoft, Schneider Electric, Natura |
| Produto | escopo, prioridade, proposta | `gerente-produto` | Amazon, Intercom, Nubank |
| Software | código, erro, script, testes, segurança | `engenheiro-software`, `testador-qa`, `auditor-seguranca` | Google, Microsoft, Stripe, Spotify |
| Documentos | apresentação, relatório, PDF, manual, e-mail | `designer-documentos`, `redator` | Duarte, Financial Times, Amazon, Mailchimp |

**Padrão visual:** o padrão é o nível, não um estilo. A régua [impressiona](conhecimento/design/impressionar.md) e o
[nível HD](conhecimento/design/nivel-hd.md) (mola, continuidade, capturas a 2×, tiras de quadros) valem em qualquer um dos
[10 mundos visuais](conhecimento/design/mundos/INDICE.md), escolhido pela marca ou pelo briefing; Apple / Liquid Glass é um deles.

Nas áreas reguladas (jurídico, tributário, contábil, trabalhista), o agente cita a lei com o artigo e o link oficial e
diz quando a decisão precisa de advogado ou contador habilitado. O padrão completo está em
[docs/padrao-agente.md](docs/padrao-agente.md).

**Skills:**

| Skill | Para quê |
|---|---|
| `ultimate` | O método do orquestrador: situar-se, escolher, contrato, prova, revisor, decisões, memória |
| `rodada` | Uma rodada de construção do começo ao teste do usuário, com pausa e retomada |
| `fechar-etapa` | Fecha uma etapa: provas, taxa de captura do revisor, curadoria, estado |
| `criar-agente` | Cria um agente novo no padrão, com evals |
| `rascunho` | Trabalha numa cópia isolada (git worktree) sem atrapalhar a versão em uso |
| `metodo-powerbi` | Como construir Power BI premium com agentes: PBIP gerado, testes pelo motor, Desktop Bridge |
| `ver-mapa` | Abre o mapa do projeto ao vivo, com o painel "Agentes agora" |
| `placar` | Placar por agente: passou no revisor de primeira, defeitos, retrabalho, acerto da estimativa |
| `registrar-defeito` | Registra um defeito que o usuário achou e que escapou do revisor |
| `checklist-lancamento` | Antes de publicar: escolhe os blocos pelo perfil (segredos, app web, LGPD, acessibilidade, honestidade, licenças), prova o comportamento de cada item e entrega o relatório |
| `auditoria-completa` | Auditoria de segurança de um repositório em 6 fases, com verificador independente; só você chama, e o relatório vai para fora do git e de pasta sincronizada |
| `integracoes` | Guia das ferramentas externas opcionais: o que fazem, que dado sai, como ligar e desligar; nada é instalado |
| `atualizar-fontes` | Trata as novidades das fontes de terceiros achadas pelo vigia: o que mudou, licença, o que trazer; só aplica com o seu OK |

## Como funciona

```
pedido → roteador (gancho) ─┬─ escolhe pacotes e agentes (palavras + arquivos + suas correções)
                            ├─ traz "já feito sobre isto" (diário, lições, mapa)
                            └─ cria .claude/base/ na 1ª vez
       → orquestrador (skill ultimate) → agentes → revisor → você
```

**Ver o mapa ao vivo:** peça "mostre o mapa" (skill `ver-mapa`). Abre no navegador um desenho do projeto: cada
arquivo é um ponto, cada "este arquivo cita aquele" é uma linha, as anotações da memória são quadrados roxos, e o que o
**último pedido usou** aparece em verde (o que está ligado a ele, em laranja). **Enquanto o Claude trabalha**, cada
arquivo que ele ou um agente lê acende na cor do agente, o que é editado fica vermelho, e uma lista mostra "14:32 ·
dev-powerbi editou medidas.js". **Tudo se atualiza sozinho, sem F5:** o destaque do novo pedido, o grafo refeito (quem
já está no desenho fica onde está) e as ligações de uso: quando um agente lê A e depois edita ou cria B, nasce uma linha
A → B com um cometa, que fica como trilha. Cada agente é um marcador com o nome dele, que desliza até o arquivo que está
tocando; "Seguir" faz a câmera acompanhar; ao fim do trabalho aparece "Trabalho concluído · X lidos, Y editados, Z
criados". Roda só no seu computador (127.0.0.1) e guarda só caminhos, nunca conteúdo. Para abrir sozinho a cada
sessão: `"mapa": { "abrir_sozinho": true }` em `.claude/base/config.json` (vale para o projeto) ou em
`~/.claude/agentes-ultimate/config.json` (vale para todos os seus projetos); se já houver uma aba aberta, não abre
outra. Não é o raciocínio do modelo (isso não é visível); é onde o trabalho está acontecendo.

**Agentes agora (no mapa):** um painel lateral lista cada agente trabalhando, com a cor dele, a barra de %, a etapa em
que está e "termina por volta de 17h40"; quando cada um termina, aparece o aviso "revisor terminou · 41 min". O
marcador do agente no desenho ganha um anel que enche com o progresso. Agente parado no meio (ou sessão fechada)
vira "sem notícia", em cinza, depois do fim da faixa + 30 min sem progresso, e sai do painel 2 h depois.

**Barra no painel de agentes do Claude Code:** cada agente ganha uma linha
`dev-powerbi · ███████░░░░░ 58% · 4/7 · lote final · 38 min · fim 14h10–14h50`. Liga sozinha com o plugin (o
`settings.json` dele); se você ou o projeto já tiverem uma `subagentStatusLine` própria, vale a sua.

**De onde vêm o % e o horário:**
- o **%** é o que o agente grava ao fim de cada etapa (`.claude/base/.progresso/<agente>-<código>.json`); sem isso,
  é o tempo passado sobre a previsão e aparece como estimado (barra tracejada, "~21% (estimado)");
- o **código** `[cod:xxxx]` é do trabalho: a correção do mesmo trabalho reusa o código; o revisor recebe
  `[revisa:xxxx]` e não herda a faixa do autor;
- o **horário** vem da faixa que o orquestrador registra ao lançar o agente:
  `node scripts/estimar.js faixa --agente <nome> --classe <tipo> --cod <código> --registrar`.
  A faixa sai das execuções parecidas já registradas (mediana e p75), corrigida pelo quanto as estimativas
  costumam errar;
- cada execução fica em `~/.claude/agentes-ultimate/execucoes.jsonl`, só com metadados (agente, tipo de tarefa,
  minutos, código anônimo do projeto), nunca o pedido. Para trazer o histórico antigo de um projeto:
  `node scripts/estimar.js importar`.

**Placar:** o revisor termina cada relatório com a linha
`Placar: autor=<agente> cod=<código> veredito=sim|não B= A= M= b= ids=A-1,M-2`. Cada achado conta uma vez por trabalho,
mesmo que continue aberto na revisão seguinte. O `/placar` mostra, por agente:
- quantas vezes passou de primeira;
- os defeitos por gravidade;
- os que escaparam ao usuário (`/registrar-defeito`);
- o retrabalho e o acerto da faixa;
- a taxa de captura do revisor (meta de 80%).

A memória de cada projeto fica dentro dele, em `.claude/base/`:

| Arquivo | Quem escreve | O que guarda |
|---|---|---|
| `PROJETO.md` | orquestrador | objetivo, decisões com data, restrições, "retomar aqui" |
| `MAPA.md` | todos | onde fica cada coisa (escrito à mão) |
| `MAPA-AUTO.md` | a base, sozinha | cada arquivo com uma linha dizendo o que é e quem cita quem (refeito a cada 10 min ou commit novo; fora do git) |
| `DIARIO.md` | todos | uma linha por entrega |
| `APRENDIZADOS.md` | todos | lições com causa, evidência e "vale para" |
| `PROPOSTAS.md` | todos | melhorias nas instruções dos agentes, à espera da sua aprovação |
| `CHANGELOG-AGENTES.md` | curador | o que mudou nos agentes, quando e por quê |
| `sensiveis.txt` | você | padrões de arquivo que nunca vão para o git (ex.: `dados/**`) |

Cada agente também tem a própria memória (`.claude/agent-memory/<agente>/`), com **Playbook** (regras de trabalho
com o porquê), histórico e contexto consolidado.

Detalhes em [docs/como-funciona.md](docs/como-funciona.md). Para criar um pacote seu (ex.: jurídico, marketing), veja
[docs/criar-pacote.md](docs/criar-pacote.md).

### Limites do roteamento de site × app
- Quando o pedido não diz app, aplicativo ou sistema, uma menção a "site" decide o pedido, mesmo quando o site é de outra
  pessoa ("dados do site do IBGE" num pedido de tela de app vai ao designer de sites).
- Site e app no mesmo pedido vão a um lado só, salvo empate.
- Em todos os casos, corrija com `era com <agente>`: a correção vale também para os pedidos parecidos seguintes. Detalhes
  em `docs/como-funciona.md`.

## Referências sob demanda e ferramentas externas

Cada agente tem, no corpo, até 8 linhas "Quando X, leia `${CLAUDE_PLUGIN_ROOT}/conhecimento/...`". O Claude Code troca
a variável pela pasta do plugin, e o agente abre só o arquivo que o pedido pede (no máximo 3 por pedido). O conteúdo vem
de projetos abertos (MIT e Apache-2.0), copiado e adaptado com crédito; o texto da Apple é nosso, escrito a partir da HIG
pública. Licenças em `terceiros/`, commits em [CREDITOS.md](CREDITOS.md), regras da pasta em
[conhecimento/LEIA-ME.md](conhecimento/LEIA-ME.md).

Antes de depender de uma ferramenta externa, o agente roda `node scripts/checar-ferramenta.js <nome>`: ela diz se está
instalada e a versão, e **nunca instala nada**. Sem a ferramenta, o agente avisa e segue sem ela.

## Integrações opcionais

context7, 21st, strix, semgrep, Chrome DevTools MCP e o detector de interface são opcionais: **o plugin não instala nada**. A skill
`/integracoes` diz, por ferramenta, o que faz, que dado sai e para onde, como ligar, como desligar e o risco. Verificador do projeto
(comando que roda a cada edição, 5 s, e ao parar, 30 s): `"verificador"` em `.claude/base/config.json`, com o comando em lista
(`["node", "regras.js", "{arquivo}"]`): roda sem shell, e o nome do arquivo vai como argumento.

## Configuração

- `"modelo_por_tarefa": true` em `~/.claude/agentes-ultimate/config.json` (todos os projetos) ou em
  `.claude/base/config.json` (o projeto vence, inclusive com `false`): o orquestrador passa a escolher modelo e esforço
  de cada agente pela tarefa, pela tabela da skill `ultimate` §1b (revisão nunca abaixo de opus/high). Vale também
  `"true"`/`"false"` em texto. Sem a chave, nada muda.

## Vigia das fontes de terceiros

Uma vez por semana, no início de uma sessão e em segundo plano (sem atrasar a abertura, sem janela), o plugin confere se os
projetos de `fontes/fontes.json` mudaram desde a versão usada: no GitHub, pela API pública, sem token (commits, releases,
licença e os arquivos que usamos); na HIG da Apple, a assinatura do índice público. Mudou: aparece "N fontes mudaram desde a sua
versão; rode /atualizar-fontes". A skill mostra o que mudou, para se a licença mudou, propõe o que trazer e só aplica com o seu OK.
Nada é instalado nem executado da fonte; da Apple nada é copiado (roda só o teste de equivalência). Sem rede ou com filtro: silêncio,
tenta de novo na semana seguinte. Desligar: `"vigia_fontes": false` em `~/.claude/agentes-ultimate/config.json` ou no
`.claude/base/config.json` do projeto. Limite: a assinatura da HIG cobre a lista de páginas e os resumos, não o texto inteiro de
cada página.

## Desligar num projeto

Crie o arquivo `.claude/base/desligado` na pasta do projeto, ou defina `AGENTES_ULTIMATE_SEM_PASTA=1`. A base nunca
cria memória na sua pasta de usuário nem na raiz do disco.

## Privacidade e segurança

- Nada sai do seu computador por causa do plugin: os ganchos só leem o pedido e a pasta, localmente.
- O último pedido e as correções `era com…` ficam em `~/.claude/agentes-ultimate/` só como termos e o agente; nunca
  o texto do pedido. Os termos são palavras de assunto, sem valores, números, caminhos e e-mails, e sem as palavras
  com inicial maiúscula fora do começo da frase (prováveis nomes de pessoa, empresa ou cliente). Um nome escrito em
  minúscula ou no começo da frase ainda pode ficar.
- Execuções, revisões e defeitos ficam em `~/.claude/agentes-ultimate/*.jsonl` só com metadados (agente, tipo de
  tarefa, minutos, contagens, código anônimo do projeto); o texto de um defeito fica só no projeto.
- Publicar (`git push`, `npm publish`, deploy de produção) sempre pede confirmação e lembra o `/checklist-lancamento`.
- Commit de `.env`, chaves e dos padrões de `sensiveis.txt` é bloqueado. O conteúdo também é lido: segredo em formato conhecido
  (chave privada, chaves de nuvem, do GitHub e de IA, texto de conexão com senha) bloqueia; o que só parece segredo pergunta. A
  mensagem diz o arquivo e a linha, nunca o valor. São 3 barreiras: **antes do comando** (a forma comum de commit é lida; outra forma
  que cite commit pergunta), **depois do comando** (HEAD mudou e tem segredo: avisa e diz como desfazer) e **antes do push** (lê os
  commits que ainda não foram para o remoto).
  O git só roda na pasta da sessão e dentro dela (inclusive outro repositório lá dentro, como um worktree). Fora dela, a trava
  pergunta sem ler e diz qual pasta. Publicar junto de um commit, script, alias, `eval`, `gh ... --push` ou `npm run deploy` pergunta,
  dizendo que o segredo não pôde ser conferido; o aviso de depois diz "já foi publicado: troque a chave" quando o push já rodou.

  **Limites conhecidos (decisão do usuário: declarados, não corrigidos agora).** A trava é ajuda, não garantia, e o plugin não instala
  gancho do git no seu repositório.
  - Comando que faz o commit sem citar a palavra (script, alias antigo, palavra montada em variável) não é lido antes. Na pasta da sessão, o
    depois avisa e o push seguinte barra. **Script que também publica** (`sh deploy.sh`, `npm run <nome>`, `.\deploy.ps1`, `npx gh-pages`)
    não pergunta nada: o segredo chega ao remoto, e o depois só avisa "já foi publicado: troque a chave". Fora da pasta da sessão, nada é
    lido: o depois fica calado e o push só pergunta "não conferido".
  - Arquivo em UTF-16 (o que o Windows PowerShell 5.1 grava com `>` e `>>`) não é lido: passa pelas 3 barreiras.
  - Formas pouco comuns de commit perguntam mesmo sem segredo (`git rm`, `git mv`, `checkout -b`, `switch -c`, `npm test && git commit`,
    `commit -S`, "R$5" na mensagem, `--trailer`,
    caminho com barra invertida sem aspas no PowerShell, `| Out-Null`).
  - Em repositório grande (1º push de um projeto com histórico), a leitura passa do prazo de 7 s e vira a pergunta genérica "não deu
    para conferir".
  - `com$'mit'` (aspas ANSI-C do bash) não é visto como commit antes; com a pasta em variável, nada avisa.
  - No `claude -p`, o gancho `retomar.js` do fim de sessão às vezes é cancelado pelo Claude Code ("Hook cancelled").
  - O depois custa cerca de 0,4 s em todo comando de shell.
  - **Repositório malicioso posto dentro da pasta da sessão** roda a configuração dele quando o git lê a pasta de trabalho. As leituras
    desligam verificação de assinatura (`gpg.program`), `core.fsmonitor`, diff externo, `textconv`, pager e `trace2`; fica descoberto o
    filtro `clean` de `.gitattributes` (roda em `git diff` da pasta de trabalho) e qualquer chave nova que o git passe a executar. É o
    mesmo nível de confiança que você dá à pasta ao abrir o Claude Code nela.

## Para quem quer contribuir

```bash
node scripts/gerar-agentes.js   # gera agents/ a partir de fonte/ (protocolo comum + parte de cada agente)
node scripts/validar.js         # confere protocolo, cabeçalhos, seções, pacotes e skills
node scripts/testar-hooks.js    # testa o roteador e as travas com pedidos de exemplo
claude plugin validate .
```

Edite sempre `fonte/`; `agents/` é gerado.

**Publicar uma versão nova** (para chegar a todos os PCs instalados): suba o número em `.claude-plugin/plugin.json`
(ex.: 0.3.0 → 0.3.1), registre no `CHANGELOG.md`, faça commit e `git push`. Sem subir o número, os outros PCs não
percebem a mudança.

## Origem

Nasceu de um projeto real de painel financeiro em Power BI construído com um time de agentes, e incorpora ideias do
[UAO](https://github.com/MatheusOliveira572/UOA) (modelo comum de agente, memória × playbook, propostas com aprovação).
As regras gerais da skill `ultimate` são lições daquele projeto, cada uma com o porquê.

## Licença

MIT.
