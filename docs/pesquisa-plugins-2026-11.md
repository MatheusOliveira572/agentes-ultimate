# Pesquisa: 10 projetos de skills e agentes para trazer ao agentes-ultimate (2026-11-01)

**Pergunta:** o que estes 10 projetos fazem, como constroem agentes e skills, o que dá para combinar com o nosso padrão
e quais agentes ou skills nos faltam. **O que mudaria a decisão:** uma ideia que aumente a taxa de acerto do roteador ou
do revisor sem pesar no contexto, e licença que permita ou não copiar.

**Como foi feita:** leitura do nosso plugin (`README.md`, `docs/como-funciona.md`, `docs/padrao-agente.md`,
`fonte/comum.md`, `scripts/validar.js`, `pacotes/pacotes.json`, `hooks/hooks.json`, `skills/*/SKILL.md`,
`CHANGELOG.md`); para cada projeto, o README no GitHub, 1 ou 2 arquivos de skill ou agente pelo `raw.githubusercontent.com`
e a licença pela API do GitHub (`api.github.com/repos/<dono>/<repo>`, campo `license`). Busca extra: "Superfuture design
review Figma skill" (busca web padrão). O impeccable foi lido também na cópia instalada local (versão 4.0.3). Nada foi
instalado nem executado. Todos os links abaixo foram abertos em 2026-11-01.

**Ressalva de método:** as páginas foram lidas por uma ferramenta que resume o conteúdo; números como estrelas e contagem
de arquivos vêm dela e podem ter pequenas diferenças. Os trechos de formato (cabeçalho, seções) foram conferidos no
arquivo bruto.

## 1. Projeto a projeto

### 1.1 dickwu/apple-design-skill
- **O que é:** uma skill que revisa interfaces (celular e desktop) contra as Human Interface Guidelines da Apple e traduz
  os termos para Flutter, React Native, Tauri, Electron e SwiftUI.
- **Como constrói:** `SKILL.md` com `name` e `description` (a descrição lista as frases que disparam a skill), mais
  `references/` com 123 páginas geradas da HIG, um índice (`hig-lookup.md`), um mapa entre plataformas e um guia de
  auditoria de código. **Carregamento progressivo:** um conjunto fixo sempre; depois 3 a 6 arquivos escolhidos por uma
  tabela "o que está na tela → arquivo"; teto de 8 a 12 arquivos por revisão, nunca a pasta inteira. Cada achado cita
  `arquivo › título` e um trecho curto; o que nenhuma referência cobre é marcado como julgamento. Relatório fixo
  (Resumo, Crítico, Melhorias, Acabamento, O que funciona, Notas de plataforma). Um script (`scripts/pull-hig.mjs`)
  rebaixa as diretrizes e deve deixar o `git status` limpo se rodado 2 vezes. Sem evals. Instala por `npx skills add` ou
  clonando em `~/.claude/skills/`.
- **Ideias para nós:**
  - *Tabela de carregamento por assunto com teto de arquivos* → skills `metodo-powerbi` e `ultimate`, e agentes com
    referência longa. Ganho: menos contexto, leitura dirigida. Custo M. Risco: tabela desatualizada esconder o arquivo
    certo (mitigar com "busque por termo se a tabela não cobrir").
  - *"Citou, abriu; não coberto = julgamento"* → já é o nosso [HIPÓTESE]; reforça o formato do achado do `revisor`
    (arquivo + trecho). Custo P.
  - *Atualizador determinístico de referências* (rodar 2 vezes = nada muda) → regra para `scripts/` que geram arquivos
    (`gerar-agentes.js`). Custo P. Risco baixo.
- **Falta para nós:** um revisor de interface de app/web (o `designer-paineis` é de BI).
- **Licença:** a API do GitHub mostra `license: null` (sem arquivo de licença reconhecido); o texto da HIG é da Apple.
  **Só a ideia.**
- Fontes: https://github.com/dickwu/apple-design-skill · https://raw.githubusercontent.com/dickwu/apple-design-skill/main/SKILL.md ·
  https://api.github.com/repos/dickwu/apple-design-skill

### 1.2 emilkowalski/skills
- **O que é:** 16 skills de interface, a maioria sobre animação (criar, revisar, melhorar, remover, desempenho), mais
  `break-ui` (testar a tela com dados de pior caso), `prototype` (várias versões com alternador) e `pick-ui-library`.
- **Como constrói:** uma pasta por skill com `SKILL.md`. Cabeçalho com `name`, `description` e, nas que só o usuário
  chama, `disable-model-invocation: true` (visto em `review-animations`). Corpo: postura, 10 padrões inegociáveis
  numerados, gatilhos de escalada, hierarquia de correções (da mais barata, "apagar", à mais cara), tabela de achados
  **Antes | Depois | Por quê** e veredito **Bloquear | Aprovar** com `arquivo:linha`. ~120 linhas. Sem evals.
  Instala por `npx skills@latest add`.
- **Ideias para nós:**
  - *`disable-model-invocation: true` nas skills que só o usuário chama* (`placar`, `registrar-defeito`,
    `fechar-etapa`, `ver-mapa`) → cabeçalho das skills + regra no `validar.js`. Ganho: a descrição sai do contexto de
    todo pedido e a skill não dispara sozinha. Custo P. Risco: o orquestrador deixar de chamar `fechar-etapa` quando
    devia (decidir skill a skill). Nenhuma skill nossa usa o campo hoje (conferido por busca em `skills/`).
  - *Hierarquia de correções "da mais barata para a mais cara"* → método do `revisor` e do `designer-paineis`. Custo P.
  - *Tabela Antes | Depois | Por quê* no relatório do revisor. Custo P.
- **Falta para nós:** `break-ui` → skill de dados de pior caso (ver 2.2).
- **Licença:** MIT (README). Pode copiar trecho com aviso de copyright; preferimos reescrever.
- Fontes: https://github.com/emilkowalski/skills · https://raw.githubusercontent.com/emilkowalski/skills/main/skills/review-animations/SKILL.md

### 1.3 jakubkrehel/skills
- **O que é:** 13 skills para interface (acessibilidade, layout, tipografia, cores, texto de interface), uma revisão
  geral que junta tudo (`better-interface`), revisão só do que mudou no ramo (`interface-review`), `break`,
  `state-machine` (cada estado do componente numa página descartável) e `variant`.
- **Como constrói:** cabeçalho só com `name` e `description`. A skill geral **roteia** para as de domínio ("use as
  skills de domínio como fonte da verdade") e manda mudanças de um ramo para `interface-review`. Regras: evidência, não
  gosto; reconhecer antes de julgar; verificar o que dá para verificar; ordenar por impacto no usuário; preferir a
  correção mais barata; **juntar achados sistêmicos**; revisar sem alterar. Relatório: escopo e cobertura (domínio
  revisado ou "não revisado"), uma tabela ordenada com `caminho:linha`, lista de checagens rodadas e **não
  verificadas**, veredito, **no máximo 15 achados**; o modelo do relatório fica num arquivo à parte (`review-format.md`).
  Tem `.claude-plugin/` (instala como plugin) e `AGENTS.md`/`CLAUDE.md`. Sem evals visíveis.
- **Ideias para nós:**
  - *Teto de achados + "juntar sistêmicos" + cobertura declarada* → formato do `revisor`. Ganho: relatório curto, sem
    20 achados que são 1 causa. Custo P. Risco: achado real cortado pelo teto (mitigar: o teto vale para os de gravidade
    baixa).
  - *Revisão só do que mudou no ramo* (`git diff`) → modo do `revisor` na 2ª rodada. Custo P.
  - *Modelo do relatório em arquivo à parte* → `fonte/` com `formatos/relatorio-revisor.md` incluído pelo gerador.
    Custo P.
- **Falta para nós:** `variant`/`state-machine` → skill de variantes (ver 2.2).
- **Licença:** MIT (README). Mesma regra do 1.2.
- Fontes: https://github.com/jakubkrehel/skills · https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-interface/SKILL.md

### 1.4 Superfuture design review (Figma Community)
- **O que é:** skill do Figma, de Joey Primiani (Superfuture), chamada `/superfuture-design-review`, que revisa um
  arquivo do Figma por heurísticas de UX, acessibilidade, hierarquia visual, interação e pensamento de produto.
- **Como constrói:** a página da comunidade **não abriu** (HTTP 403). Pelo blog do Figma: notas em **semáforo**
  (vermelho = bloqueia, amarelo = recomendado, verde = o que já funciona), ordenadas por impacto no usuário; skills do
  Figma são markdown com instruções em ordem, chamadas à mão pelo nome. Estrutura interna: **[HIPÓTESE]**.
- **Ideia para nós:** *semáforo com "o que funciona" obrigatório* → relatório do `revisor` e do `designer-paineis`
  (verde diz o que não mexer). Custo P. Risco: virar elogio; manter "o que funciona" em 1 a 3 linhas.
- **Licença:** termos da Figma Community, não lidos (página bloqueada). **Só a ideia.**
- Fontes: https://www.figma.com/community/skill/65434/superfuture-design-review (403) ·
  https://www.figma.com/blog/try-these-10-skills-and-show-off-your-own/

### 1.5 addyosmani/agent-skills
- **O que é:** 25 skills de engenharia pelo ciclo de vida (definir, planejar, construir, verificar, revisar, publicar),
  9 comandos, 4 agentes revisores (código, testes, segurança, desempenho web) e 7 listas de checagem.
- **Como constrói:** cabeçalho `name` + `description` com "Use when"; corpo fixo: Visão geral · Quando usar · Processo ·
  **Desculpas comuns (tabela desculpa × realidade)** · **Sinais de alerta** · Verificação (evidência exigida).
  `doubt-driven-development`: o orquestrador declara a afirmação, um revisor em **contexto limpo recebe só o artefato e
  o contrato, sem o raciocínio do autor**, e é pedido a achar problemas, não a aprovar; no máximo 3 ciclos e depois
  escala ao usuário; só na sessão principal. **Evals em 3 níveis:** (1) estrutura no CI; (2) **roteamento
  determinístico** no CI: por skill, pedidos positivos (devem ficar no top 3, ou top 1 no pedido-assinatura) e negativos
  (não podem ficar em 1º; se têm dono, o dono tem de ganhar), TF-IDF sobre as descrições, piso de 95% de acerto em 1º
  lugar e alerta de **descrições parecidas** (50% aviso, 75% erro); (3) comportamento sob demanda, com uma sessão
  `claude` sem tela e avaliadores por caso. Instala como plugin (marketplace) ou `npx skills add`.
- **Ideias para nós:**
  - *Eval de roteamento no `testar-hooks.js`*: cada `evals/<agente>.md` ganha pedidos positivos e negativos que rodam
    contra o `roteador.js` real, com piso de acerto e checagem de palavras repetidas entre pacotes. Ganho alto: o nosso
    roteador é lexical (palavras de `pacotes.json`), igual ao deles, e hoje temos ~15 casos de roteamento escritos à mão.
    Custo M. Risco: otimizar palavras para os casos e piorar o pedido real (mitigar com casos tirados das correções
    `era com`).
  - *Seções "Desculpas comuns" e "Sinais de alerta"* no padrão do agente → `docs/padrao-agente.md` + `validar.js`.
    Ganho: ataca o atalho mais comum ("deve funcionar"). Custo M (30 agentes). Risco: +10 a 15 linhas por agente.
  - *Revisor em contexto limpo, sem o raciocínio do autor, pedido a achar defeito* → skill `ultimate` (como chamar o
    `revisor`). Custo P. Risco baixo.
  - *Teto de 3 ciclos de revisão e depois escalar* → skill `rodada`. Custo P.
- **Falta para nós:** auditor de desempenho web (opcional); `interview-me`/`spec` já cobertos por `planejador` e
  `gerente-produto`.
- **Licença:** MIT. Pode copiar trecho com aviso; preferimos reescrever.
- Fontes: https://github.com/addyosmani/agent-skills ·
  https://raw.githubusercontent.com/addyosmani/agent-skills/main/skills/doubt-driven-development/SKILL.md ·
  https://github.com/addyosmani/agent-skills/tree/main/evals · https://raw.githubusercontent.com/addyosmani/agent-skills/main/evals/README.md

### 1.6 upstash/context7
- **O que é:** serviço que entrega ao agente a documentação **da versão certa** de uma biblioteca, por servidor MCP
  (`resolve-library-id`, `query-docs`) ou por CLI `ctx7` guiado por uma skill.
- **Como constrói:** a skill `context7-cli` tem `name` + `description` com os gatilhos ("ctx7", "docs atuais") e seções
  curtas (referência rápida, autenticação, erros comuns), com a ordem obrigatória "achar o ID, depois buscar a doc".
  O motor (API, rastreador) é **privado** e hospedado (`mcp.context7.com`); chave grátis; a documentação é de terceiros e
  o próprio projeto avisa que não garante exatidão.
- **Ideia para nós:** *regra "API de biblioteca = doc da versão instalada antes de escrever"* → `engenheiro-software`,
  `dev-powerbi` e `pesquisador` (ler a versão em `package.json`/lockfile e abrir a doc oficial daquela versão). Custo P.
  Sem serviço externo.
- **Não trazer:** o servidor/CLI (manda as consultas a terceiro, exige conta, conflita com "nada sai do seu computador").
- **Licença:** MIT no repositório; o serviço tem termos próprios. Só a ideia.
- Fontes: https://github.com/upstash/context7 · https://raw.githubusercontent.com/upstash/context7/master/skills/context7-cli/SKILL.md

### 1.7 serafimcloud/21st
- **O que é:** o código do 21st.dev, um catálogo comunitário de componentes React (shadcn/ui, Tailwind, Radix), "npm
  para design engineers". Não é um plugin de agentes; o único item de agente é `.cursor/rules/`, sem conteúdo visível.
- **Como constrói:** cada componente publicado tem `code.tsx` e `demos/default/` com `code.demo.tsx` e **`preview.png`
  obrigatório**. Usa Supabase, Clerk, Cloudflare R2, Amplitude.
- **Ideia para nós:** *toda peça visual com demonstração e imagem de prévia* → já fazemos com gabarito; nada novo.
- **Não trazer:** o catálogo (é React; o nosso público é BI e documentos).
- **Licença:** MIT (README). Irrelevante: não há o que copiar.
- Fonte: https://github.com/serafimcloud/21st

### 1.8 usestrix/strix
- **O que é:** ferramenta de teste de invasão com agentes autônomos (reconhecimento, exploração), rodando num
  contêiner Docker com proxy, navegador e shell, que **confirma cada falha com prova de conceito**.
- **Como constrói:** 9 skills (`find-security-vulnerabilities-in-code` etc.) com cabeçalho `name`, `description`,
  `license`, `metadata` (autor, site). A skill manda rodar o CLI com orçamento (`--max-budget`), revisar só o diff no
  PR e: **sem a aplicação rodando, o achado é "não confirmado"**; antes de relatar, conferir que a prova mostra o
  impacto; cada achado com arquivo e linha; saída em markdown, JSON, CSV e SARIF. Instala por `curl | bash` ou pip.
- **Ideias para nós:**
  - *Achado de segurança "confirmado" só com prova; sem prova, "não confirmado"* → `auditor-seguranca` (Método e
    Critério de pronto). Custo P. Risco baixo.
  - *Orçamento declarado por execução* (`--max-budget`) → já temos faixa de tempo; poderia virar limite de turnos do
    revisor (ver 1.10). Custo P.
- **Não trazer:** o CLI e o contêiner (exploração ativa, manda o código ao provedor de IA, instalador por `curl | bash`).
- **Licença:** Apache-2.0 (página e cabeçalho da skill). Cópia permitida com aviso e NOTICE; preferimos só a ideia.
- Fontes: https://github.com/usestrix/strix · https://github.com/usestrix/strix/tree/main/skills ·
  https://raw.githubusercontent.com/usestrix/strix/main/skills/find-security-vulnerabilities-in-code/SKILL.md

### 1.9 WorldFlowAI/everything-claude-code
- **O que é:** coleção de configurações do Claude Code: 9 agentes (planner, architect, tdd-guide, code-reviewer,
  security-reviewer, build-error-resolver, e2e-runner, refactor-cleaner, doc-updater), 9 skills, 10 comandos, ganchos e
  6 regras. Os comandos de instalação apontam para `affaan-m/everything-claude-code`; a API diz que **não é fork**.
- **Como constrói:** agente com `name`, `description`, `tools`, `model` (ex.: opus). Skill `continuous-learning`: gancho
  `Stop` que, em sessões com 10+ mensagens, extrai padrões e salva em `~/.claude/skills/learned/`, com `auto_approve`
  falso por padrão; `/learn` faz à mão. Ganchos de sessão (início, fim, antes de compactar, sugerir compactar). O README
  avisa: MCP demais encolhe a janela (de 200 mil para ~70 mil); recomenda menos de 10 ativos por projeto.
- **Ideias para nós:**
  - *Gancho "sugerir compactar"/salvar estado antes de compactar* (`pre-compact`) → gancho novo que grava "retomar
    aqui" em `PROJETO.md` antes da compactação. Ganho: retomada sem perda. Custo M. Risco: escrever no arquivo do
    orquestrador por gancho (fazer só um rascunho em `.claude/base/.retomar.md`).
  - *Agente `build-error-resolver`* → coberto pelo `engenheiro-software` + passo 4 do protocolo. Não trazer.
  - *Aprendizado no `Stop`* → já temos (lição → proposta → aprovação), e o nosso é mais seguro (projeto, não
    `~/.claude`). Não trazer.
- **Licença:** o README diz MIT, mas a API do GitHub mostra `license: null` e o repositório não é o original.
  **Só a ideia.**
- Fontes: https://github.com/WorldFlowAI/everything-claude-code · https://api.github.com/repos/WorldFlowAI/everything-claude-code ·
  https://raw.githubusercontent.com/WorldFlowAI/everything-claude-code/main/skills/continuous-learning/SKILL.md

### 1.10 pbakaus/impeccable (instalado na máquina, 4.0.3)
- **O que é:** kit de design para agentes de código: 1 skill com 24 comandos (`critique`, `audit`, `polish`, `harden`,
  `layout`, `typeset` etc.), um **detector determinístico** de 62 regras (sem IA), gancho que examina os arquivos de
  interface editados, extensão de navegador e 4 agentes auxiliares. Nasceu da skill `frontend-design` da Anthropic.
- **Como constrói (lido na cópia local):** 1 `SKILL.md` com `version`, `user-invocable`, `argument-hint` (lista de
  comandos), `license` e **`allowed-tools`** restritos aos scripts dele; uma tabela comando → `reference/<comando>.md`
  (39 arquivos), carregando **só o playbook do comando** e a "régua mínima" (`craft-floor.md`) logo antes de editar.
  Sem argumento, mostra um menu e **nunca roda comando sozinho**. Lê `PRODUCT.md` e `DESIGN.md` do projeto por script.
  "Verificar em passadas limitadas, não em laço": 1 rodada de inspeção, 1 lote de correções, no máximo 1 confirmação.
  O agente `impeccable-finish-reviewer` tem `effort: high` e **`maxTurns: 30`**, "por volta do 10º turno pare de ler e
  escreva", contrato de entrada e de saída com **5 seções fixas**, até 8 correções, e um **passe de veredito**: na
  segunda vez só marca cada correção como resolvida/parcial/não resolvida e no máximo 3 regressões, sem nova caça.
  Há `reference/degraded/` com a versão de cada agente para quando não houver subagentes.
- **Ideias para nós:**
  - *Passe de veredito na 2ª revisão* → `revisor` + skill `rodada`. Ganho: corta o laço revisão ↔ correção. Custo P.
    Risco: deixar passar defeito novo fora das 3 regressões (aceitável; o usuário ainda testa).
  - *`maxTurns` e "pare de ler e escreva"* → cabeçalho do `revisor` e `pesquisador` + regra no `validar.js` (campo
    permitido). Ganho: agente que nunca devolve nada deixa de acontecer. Custo P. Risco: corte cedo em revisão grande.
  - *Detector determinístico ligado a gancho* → gancho `PostToolUse` que, se existir `.claude/base/verificar.js` no
    projeto, roda só nos arquivos editados e devolve os avisos. Generaliza o "defeito vira regra automática" que já
    está em `docs/como-funciona.md` §4. Custo M. Risco: lentidão a cada edição (rodar só com tempo-limite e por arquivo).
  - *`allowed-tools` restrito na skill* → `metodo-powerbi` e `ver-mapa`. Custo P.
  - *Versão "sem subagente" das instruções* → não trazer agora (o Claude Code tem subagentes).
- **Não trazer:** os 24 comandos de estética web (sobrepõem ao próprio impeccable, que o usuário já usa; melhor
  conviver do que duplicar). Atenção à convivência: os dois plugins têm ganchos em edição de arquivos.
- **Licença:** Apache-2.0 (cabeçalho da `SKILL.md` local e README). Cópia permitida com aviso e NOTICE; preferimos
  reescrever.
- Fontes: https://github.com/pbakaus/impeccable · cópia local `~/.claude/plugins/cache/impeccable/impeccable/4.0.3/`
  (`skills/impeccable/SKILL.md`, `agents/impeccable-finish-reviewer.md`)

## 2. Síntese

### 2.1 As 10 melhores ideias (ganho ÷ custo)

| # | Ideia | De onde | Onde entra | Ganho | Custo | Risco principal |
|---|---|---|---|---|---|---|
| 1 | Eval de roteamento: positivos e negativos por agente, contra o `roteador.js` real, com piso de acerto e alerta de palavras repetidas entre pacotes | addyosmani | `evals/` + `testar-hooks.js` + `validar.js` | Alto | M | Ajustar palavras aos casos e piorar o pedido real |
| 2 | Revisor em contexto limpo, sem o raciocínio do autor, pedido a achar defeito; teto de 3 ciclos e escala | addyosmani | skill `ultimate` e `rodada` | Alto | P | Baixo |
| 3 | Passe de veredito na 2ª revisão (resolvido/parcial/não + até 3 regressões) | impeccable | `revisor` + `rodada` | Alto | P | Defeito novo fora das 3 |
| 4 | `disable-model-invocation: true` nas skills só do usuário | emilkowalski | cabeçalho de `placar`, `registrar-defeito`, `ver-mapa` (e avaliar `fechar-etapa`) + `validar.js` | Médio (contexto) | P | Skill útil deixar de ser lembrada |
| 5 | Relatório do revisor: semáforo + "o que funciona", até 15 achados, sistêmicos juntos, `arquivo:linha`, Antes/Depois/Por quê, lista "não verificado" | jakubkrehel, emilkowalski, Superfuture | `revisor` (modelo em arquivo à parte) | Médio | P | Achado cortado pelo teto (teto só para gravidade baixa) |
| 6 | `maxTurns` + "pare de ler e escreva" no revisor e no pesquisador | impeccable | cabeçalho dos agentes + `validar.js` | Médio | P | Corte cedo |
| 7 | Seções "Desculpas comuns" e "Sinais de alerta" no padrão do agente | addyosmani | `docs/padrao-agente.md`, `fonte/agentes/*`, `validar.js` | Médio | M | +10–15 linhas por agente |
| 8 | Tabela de carregamento por assunto com teto de arquivos | apple-design-skill, impeccable | `metodo-powerbi`, agentes com referência longa | Médio | M | Tabela desatualizada |
| 9 | Segurança: "confirmado" só com prova; sem prova, "não confirmado" | strix | `auditor-seguranca` | Médio | P | Baixo |
| 10 | Gancho do verificador do projeto nos arquivos editados | impeccable | `hooks/` (novo, opcional por `config.json`) | Médio | M | Lentidão a cada edição |

Fora das 10, baratas: doc da versão instalada antes de usar uma API (context7, P); rascunho de "retomar aqui" antes de
compactar (everything-claude-code, M); revisão só do diff na 2ª rodada (jakubkrehel, P).

### 2.2 Agentes e skills novos recomendados

| Nome | Tipo | Pacote | Por que não cabe num que já temos |
|---|---|---|---|
| `estressar` | skill | núcleo (usada por `designer-paineis`, `designer-documentos`, `testador-qa`) | Nenhum agente tem o roteiro de pior caso (nome longo, lista vazia, valor enorme, negativo, 1 item, 500 itens). O `testador-qa` testa código, não a tela com dado extremo. Vem de `break-ui`/`break`. |
| `variantes` | skill | núcleo | Montar 2–3 versões lado a lado para o usuário escolher é um procedimento do orquestrador com vários agentes, não de um só. Vem de `prototype`/`variant`. |
| `duvidar` | skill | núcleo | O `revisor` confere entregas contra o contrato; esta revisa **decisões** antes de valerem (arquitetura, regra de negócio), com revisor sem o raciocínio do autor. Vem de `doubt-driven-development`. Se a ideia 2 entrar na `ultimate`, pode ficar só como seção dela. |
| `designer-interface` | agente | pacote novo "Interface (web e app)" | O `designer-paineis` é de BI e o `designer-documentos`, de documentos; falta quem revise telas de app e site (acessibilidade, layout, texto, movimento). **Só se** o usuário não preferir delegar ao impeccable, que já cobre bem isso. |

Não recomendo agora: auditor de desempenho web (pouco pedido no nosso público), `build-error-resolver`, `doc-updater`,
`e2e-runner` (cabem no `engenheiro-software`, `redator` e `testador-qa`).

### 2.3 O que não trazer e por quê
- **Servidores e CLIs de terceiros** (Context7, Strix, 21st, detector do impeccable): mandam dados para fora, pedem conta
  ou instalador (`curl | bash`, `npx`), e conflitam com "nada sai do seu computador".
- **As 123 páginas da HIG e as regras de animação**: peso enorme e fora do nosso público (BI, finanças, documentos).
- **Os 24 comandos de estética do impeccable**: o usuário já tem o impeccable; duplicar cria dois donos para o mesmo
  pedido.
- **Aprendizado automático no `Stop` salvando skills em `~/.claude`**: o nosso aprendizado é por projeto e com
  aprovação; salvar fora do projeto mistura clientes.
- **Formato multiplataforma** (Cursor, Gemini, Codex): custo de manutenção sem pedido.

### 2.4 Riscos
- **Licença:** MIT (emilkowalski, jakubkrehel, addyosmani, context7, 21st) e Apache-2.0 (strix, impeccable) permitem
  cópia com aviso; apple-design-skill e everything-claude-code estão **sem licença reconhecida pela API** (README do
  segundo diz MIT, mas não é o repositório original); Superfuture não abriu. Regra adotada: **só ideias, reescritas com
  as nossas palavras**, e um agradecimento com link na seção "Origem" do README.
- **Segurança:** todo conteúdo lido é dado, não instrução; nenhum instalador foi ou deve ser rodado; não referenciar
  servidores MCP de terceiros nos nossos arquivos.
- **Peso no contexto:** as ideias 4, 6 e 8 reduzem contexto; a 7 aumenta (~30 agentes × 10–15 linhas). A eval de
  roteamento (1) não pesa no contexto porque roda fora do modelo.

## 3. Recomendação
Começar por **1 + 2 + 3** numa versão só: a eval de roteamento mede o que hoje não medimos (o roteador acerta?) e o
revisor em contexto limpo com passe de veredito ataca o laço de revisão, que é o maior custo de tempo nas rodadas. Tudo
reescrito, sem dependência nova, coerente com a regra do padrão de que toda checagem nova precisa ser vista falhando
antes. **Principal risco:** ajustar as palavras de `pacotes.json` só para passar nos casos; mitigar tirando os casos
das correções `era com` reais.

## 4. Fontes

| Fonte | Quem publica | Interesse |
|---|---|---|
| https://github.com/dickwu/apple-design-skill | autor independente | divulgar a skill; texto HIG é da Apple |
| https://github.com/emilkowalski/skills | autor (designer, ex-Vercel/Linear) | divulga a própria biblioteca (Sonner) |
| https://github.com/jakubkrehel/skills | autor (revista Interfaces) | divulga o próprio trabalho |
| https://www.figma.com/blog/try-these-10-skills-and-show-off-your-own/ | Figma (fabricante) | promover skills do Figma |
| https://github.com/addyosmani/agent-skills | autor (engenheiro do Google) | projeto pessoal aberto |
| https://github.com/upstash/context7 | Upstash (empresa) | vender/atrair para o serviço hospedado |
| https://github.com/serafimcloud/21st | 21st.dev (empresa) | atrair para o catálogo |
| https://github.com/usestrix/strix | Strix (empresa) | atrair para a plataforma paga |
| https://github.com/WorldFlowAI/everything-claude-code | WorldFlowAI (empresa), cópia de outro autor | divulgação |
| https://github.com/pbakaus/impeccable + cópia local 4.0.3 | autor (Paul Bakaus) | projeto aberto, com extensão e CLI |
| `api.github.com/repos/...` (licença, fork) | GitHub | independente dos autores |

Fato que decide e tem 2 fontes: o formato de eval de roteamento do addyosmani (página da pasta `evals/` e o
`evals/README.md`, ambas do mesmo autor, sem fonte independente). O passe de veredito do impeccable tem só a cópia
local. Nenhuma ideia tem prova independente de que funciona: são inspiração, a validar com a nossa eval e o placar.
