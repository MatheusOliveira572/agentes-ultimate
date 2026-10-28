# Plano da versão 0.7.0 · melhoria contínua dos agentes e das estimativas

## Verificado em 2026-10-28 (bloco 0, Claude Code 2.1.302)

- **V1 · sim, ao contrário da hipótese.** Um plugin pode ligar a barra: o `settings.json` na raiz do plugin aceita só
  `agent` e `subagentStatusLine` (documentação `plugins/components.md`, "Default settings"; no código do 2.1.302,
  `Tho=["agent","subagentStatusLine"]`). A configuração do usuário e a do projeto vencem a do plugin (o MVP Orçamento
  mantém a barra dele em `.claude/settings.json`). O comando vai cru para o shell, com o ambiente da sessão e
  `CLAUDE_PROJECT_DIR`, **sem** `CLAUDE_PLUGIN_ROOT` (código da função que roda a barra), e a pasta do plugin muda a
  cada versão. Por isso o `settings.json` chama um lançador fixo, `$HOME/.claude/agentes-ultimate/barra.js`, que o
  gancho de início de sessão regrava apontando para a versão instalada. A skill `instalar-barra` não é necessária.
  Prova: `claude -p --plugin-dir <plugin> --debug` registrou "Cached plugin settings with keys: subagentStatusLine",
  o início de sessão gravou o lançador, e o comando `node "$HOME/.claude/agentes-ultimate/barra.js"` deu a mesma
  barra no bash e no PowerShell. Falta só ver a barra no painel do Claude Code (print do usuário).
- **V2 · `claude plugin eval` existe** (`claude plugin --help`: casos em `evals/**/case.yaml` ou `prompt.md` +
  `graders/*.md`). Fica para a 0.7.1 (laço de melhoria).
- **V3 · confirmado** com um plugin de teste que grava só as chaves recebidas, em `claude -p` com 1 agente:
  - `PreToolUse` do `Agent`: `tool_input` = `description`, `prompt`, `subagent_type`, `run_in_background` (o
    `[cod:xxxx]` chega na descrição).
  - `SubagentStart`: `agent_id`, `agent_type` (sem descrição).
  - `SubagentStop`: `agent_id`, `agent_type`, `agent_transcript_path`, `last_assistant_message`, e **dispara 2 vezes
    para o mesmo `agent_id`** (a 2ª sem `last_assistant_message`): o registro precisa tirar repetidos pelo id.
  - `PostToolUse` do `Agent`: `tool_response` com `agentId`, `agentType`, `status`, `totalDurationMs`,
    `totalTokens`, `handbackReport`, `content`. Em segundo plano (`run_in_background`) ele chega **antes** do
    `SubagentStart`, com `status: "async_launched"` e o mesmo `agentId`: é assim que o código do pedido se liga ao id.
  - Com `SubagentHandback`, o relatório não vem em `last_assistant_message` (documentação dos ganchos): o placar lê
    a linha fixa do revisor pelo fim da transcrição do agente.
  - Entrada da barra (código do 2.1.302 e `statusline.md`): `columns` e `tasks[]` com `id`, `name`, `type`,
    `agentType`, `status`, `description`, `label`, `startTime`, `tokenCount`, `cwd`.

Planejador, 2026-10-28. Só desenho: nada aqui está construído. Começa **depois** que a 0.6.0 (engenheiro de software,
`hooks/` e `scripts/testar-hooks.js`) estiver no commit, porque quase todo bloco mexe em `hooks/hooks.json`,
`hooks/roteador.js` e `scripts/testar-hooks.js`.

## 0. Estado final (como o usuário vai ver)

1. Ao lançar um agente, o orquestrador diz "deve terminar entre 14h10 e 14h50 (base: 7 rodadas parecidas do
   dev-powerbi, fator real ÷ estimado 1,4)". A faixa vem de um comando, não da intuição.
2. No painel de agentes do Claude Code, cada agente tem uma barra: `dev-powerbi · ███████░░░░░ 58% · 4/7 · lote
   final · 38 min · fim 14h10–14h50`. O mapa ao vivo mostra a mesma faixa.
3. `/placar` mostra, por agente: passou no revisor de primeira, defeitos achados pelo revisor por gravidade, defeitos
   que escaparam ao usuário, retrabalho e acerto da estimativa.
4. No primeiro dia útil do mês o orquestrador abre a sessão com 3 linhas: "outubro: revisor pegou 79% (15 de 19);
   dev passou de primeira 6/8; estimativa errou 12% (mediana)".
5. A cada ~10 trabalhos o orquestrador avisa "hora da curadoria" e chama o curador.
6. Nenhuma mudança de instrução de agente entra se os evals dele piorarem; lição geral de um projeto vira proposta ao
   plugin, sem dado de empresa, e chega a todos pela atualização automática depois que o usuário aprova.

**Pronto da 0.7.0 (Definição de Pronto de todos os blocos):** `node scripts/testar-hooks.js` com 0 falha, incluindo
os casos novos de cada bloco, e cada caso novo visto **falhando** antes da mudança (registrado no CHANGELOG);
`node scripts/validar.js` com 0 erro; revisor de primeira sem Bloqueante; teste do usuário do bloco feito.

## 1. O que já existe e o que se reaproveita

Referência que funciona (projeto MVP Orçamento, `.claude/hooks/`):

| Peça | O que faz | O que levar | O que não levar |
|---|---|---|---|
| `barra-agentes.js` | `subagentStatusLine`: barra por agente; previsão pela faixa dita ou pelos quartis do tipo; progresso por `logs/progresso/<tipo>.json` válido por 30 min | formato de saída `{id, content}` por linha; nunca falhar; progresso informado > tempo decorrido | arquivo de progresso por **tipo** (dois agentes do mesmo tipo em paralelo se sobrescrevem) |
| `historico-agentes.js` | reconstrói a duração pelas transcrições (lê só 256 KB do começo e do fim; elas passam de 30 MB); mediana, quartis e fator real ÷ fim da faixa | leitura parcial das transcrições; o fator real ÷ estimado; a importação do histórico antigo | ligar estimativa à execução por "trecho da descrição" (frágil) |
| `registrar-agente.js` | SubagentStop: linha TSV com tipo, id, início, minutos | o gancho e os campos `agent_type`, `agent_id`, `agent_transcript_path` | ler a transcrição inteira (`readFileSync`) |
| `logs/estimativas.json` | faixa dita ao usuário | a ideia | o formato: o arquivo real está corrompido (estrutura do `ConvertTo-Json` do PowerShell, `"value"`/`"Count"` aninhados, acentos quebrados: "RevisÃ£o"); prova de que o orquestrador **não** deve escrever esse JSON à mão |
| `docs/padroes/fluxo-de-trabalho.md` | regra: faixa de horário, nunca um horário único; avisar quando a faixa deixa de valer | a regra, no `skills/ultimate/SKILL.md` | — |
| `agent-evals/defeitos-usuario.md` | taxa de captura = pegos pelo revisor ÷ (pegos + achados só pelo usuário); meta ≥ 80%; histórico 0% → 79% → 57% | a fórmula e a meta | a tabela com texto do defeito no plugin (lá fica só contagem) |

No plugin hoje: `~/.claude/agentes-ultimate/` já guarda `roteamento.json` ("era com") e `atualizacao.log`;
`evals/*.md` tem 3 a 20 casos por agente (Pedido / Deve / Não deve / Origem) e uma tabela "Histórico" que diz
"não rodado" (ex.: `evals/revisor.md`). Não há barra, registro de execução nem estimativa.

## 2. Verificações antes de construir (bloco 0)

Três coisas que o desenho depende e que **não** estão confirmadas. Cada uma vira um parágrafo "verificado em …" no
topo deste arquivo antes do bloco 1.

| # | Pergunta | Como verificar | Se não |
|---|---|---|---|
| V1 | Um plugin pode definir `subagentStatusLine`? **[HIPÓTESE: não]**; pelo que se sabe, o `settings.json` na raiz do plugin aceita poucas chaves e a linha de status é configuração do usuário/projeto | documentação oficial de plugins + plugin de teste com `settings.json` contendo `subagentStatusLine`, carregado com `--plugin-dir`; ver se a barra aparece | skill `instalar-barra` (peça 1.2) |
| V2 | Existe `claude plugin eval`? **[HIPÓTESE: não existe]** na versão instalada | `claude plugin --help` e `claude --help`; documentação | executor próprio `scripts/rodar-evals.js` (peça 3.2) |
| V3 | Campos que os ganchos recebem: `SubagentStart` existe? `SubagentStop` traz `agent_type`, `agent_id`, `agent_transcript_path`, `last_assistant_message`? A entrada da linha de status traz `tasks[].description`, `startTime`, `tokenCount`? | gancho de teste que só grava as **chaves** (não os valores) do JSON recebido, numa sessão com 1 agente | início pela transcrição (como o `historico-agentes.js`); relatório do revisor lido pelo fim da transcrição |

## 3. As peças

Convenções de todas as peças: ganchos em Node, sem dependência, **nunca falham** (erro → sai 0); só metadados;
gravação por acréscimo de linha (`.jsonl`), à prova de dois agentes ao mesmo tempo; tudo derivado (placar,
relatório) pode ser apagado e refeito a partir dos `.jsonl`.

Pastas:
- **Global do usuário** `~/.claude/agentes-ultimate/`: `execucoes.jsonl`, `revisoes.jsonl`, `defeitos.jsonl`,
  `estado.json` (contadores), `placar.json` e `relatorios/AAAA-MM.md` (derivados).
- **Projeto** `.claude/base/` (fora do git, entra no `.claude/base/.gitignore` que o plugin já mantém):
  `.estimativas.jsonl`, `.progresso/<id-curto>.json`.

### Peça 1 · Progresso e estimativa

**1.1 Passo no protocolo comum (`fonte/comum.md`, seção "Durante o trabalho", item novo):**
> Se o pedido tiver etapas contáveis (itens do contrato, lotes, seções), grave o progresso ao fim de cada etapa em
> `.claude/base/.progresso/<seu nome>-<código do pedido>.json`: `{"feito": 3, "total": 7, "agora": "lote final",
> "em": "<data e hora ISO>"}`. Use o código que o orquestrador passou no pedido (`[cod:ab12]`); sem código, use só o
> seu nome. Só números e um rótulo de até 5 palavras, nunca conteúdo.

- Todos os agentes do plugin têm `Write` (conferido no cabeçalho `tools:` de `fonte/agentes/**`).
- O **código do pedido** resolve a colisão de dois agentes do mesmo tipo: o orquestrador põe `[cod:xxxx]` no fim da
  descrição do agente; a barra acha o arquivo pelo código que está na `description` da tarefa.
- Grava em: `.claude/base/.progresso/`. Usa: protocolo (`scripts/gerar-agentes.js` propaga para `agents/`).
- Teste: `validar.js` passa a exigir o parágrafo do progresso em todo `agents/*.md` → falha antes (nenhum tem),
  passa depois de gerar. Caso do gancho: arquivo de progresso com `em` de 31 min atrás é ignorado.
- Custo: 0,5–1 h.

**1.2 Barra por agente (`hooks/barra.js`):**
- Mesmo comportamento do `barra-agentes.js`, com: progresso pelo código do pedido; previsão pela faixa registrada
  (1.4) e, sem ela, pela classe de referência (1.4); "passou da previsão (+n min)"; corte na largura `columns`.
- Onde fica ligada: se V1 = sim, no `settings.json` do plugin. Se V1 = não (esperado), **skill `instalar-barra`**:
  mostra o trecho que vai escrever, pede a aprovação, faz cópia do `~/.claude/settings.json` (`.bak-agentes-ultimate`),
  grava `subagentStatusLine` com o caminho absoluto do plugin e oferece `--desfazer`. Nunca sobrescreve uma
  `subagentStatusLine` existente (o projeto MVP tem a dele em `.claude/settings.json`, que tem precedência): avisa e
  para. Caminho do plugin muda a cada versão? **[HIPÓTESE]**: se mudar, a skill grava um lançador fixo em
  `~/.claude/agentes-ultimate/barra.js` que procura a versão instalada.
- Teste: entrada falsa com 2 tarefas do mesmo tipo e códigos diferentes → 2 linhas com progressos diferentes (falha
  no desenho atual, que lê por tipo); entrada com JSON inválido → sai 0 sem texto; skill em casa falsa com
  `subagentStatusLine` já definida → não altera o arquivo.
- Custo: 2,5–3,5 h (barra 1,5–2 h; skill e testes 1–1,5 h).

**1.3 Registro de cada execução (`hooks/execucoes.js`, gancho `SubagentStop`; `SubagentStart` se V3 confirmar):**
- Uma linha em `~/.claude/agentes-ultimate/execucoes.jsonl`:
  `{"id", "agente", "classe", "projeto", "inicio", "fim", "minutos", "estimado_min", "faixa_de", "faixa_ate",
  "fonte_estimativa", "cod", "versao_plugin"}`.
  - `projeto` = hash curto do caminho da pasta (+ nome curto opcional do `config.json`), nunca o caminho.
  - `classe` = tipo de tarefa, de uma lista fechada e genérica em `pacotes/classes-tarefa.json` (spec, construção,
    correção, revisão, pesquisa, regras, dados, texto, plano, curadoria). Vem da estimativa registrada (1.4); sem
    ela, por palavras da descrição; sem acerto, "outra". **A descrição não é guardada** no global.
  - início e fim pelos carimbos do começo e do fim da transcrição, lendo só 256 KB de cada ponta (como o
    `historico-agentes.js`).
- Importação do passado (desejável ~): `node scripts/execucoes.js importar` lê as transcrições antigas do projeto
  atual e grava com `fonte_estimativa: "importado"`.
- Teste: transcrição falsa de 40 MB com carimbos nas pontas → minutos certos em < 1 s; descrição com "R$ 2 mi" →
  não aparece em `execucoes.jsonl`; payload sem campos → sai 0 sem linha.
- Custo: 2,5–3,5 h.

**1.4 Estimativa por classe de referência (`scripts/estimar.js`):**
- `node estimar.js faixa --agente dev-powerbi --classe construcao [--estimado 180]` responde:
  `14h10–14h50 · base n=7 (agente+classe) · mediana 52 min · p75 71 min · fator 1,4`.
  - Classe de referência, em cascata até ter n ≥ 3: agente+classe → agente → classe → todos; diz qual nível usou.
  - Sem `--estimado`: faixa = [mediana, p75] dos minutos reais.
  - Com `--estimado` (conta de baixo para cima do orquestrador): faixa = [estimado × mediana do fator real ÷
    estimado, estimado × p75 do fator]. É a correção do viés otimista de Flyvbjerg.
  - n < 3 em todos os níveis: faixa larga (estimado × 1 a × 2) marcada "sem histórico".
- `node estimar.js registrar --agente … --classe … --cod ab12 --de 14:10 --ate 14:50` grava em
  `.claude/base/.estimativas.jsonl` com encoding UTF-8 garantido. É **o único jeito** de registrar faixa (corrige o
  `estimativas.json` corrompido do MVP).
- O orquestrador usa: `skills/ultimate/SKILL.md` ganha a regra "ao lançar agente, rode `estimar.js faixa`, diga a
  faixa ao usuário com a base, rode `registrar`; avise quando a faixa deixar de valer".
- Mapa ao vivo (desejável ~): `mapa-servidor.js` lê `.estimativas.jsonl` e mostra a faixa e o "passou da previsão"
  ao lado do agente na lista "Ao vivo".
- Teste: execuções falsas com minutos conhecidos (10, 20, 30, 40, 50) → mediana 30, p75 40; fator conhecido;
  cascata cai de nível quando n < 3; texto com acento gravado e relido igual.
- Custo: 2,5–3,5 h (mapa ao vivo +1 h, desejável).

### Peça 2 · Placar por agente

| Número | De onde vem | Como chega ao registro |
|---|---|---|
| Passou no revisor de primeira | veredito do **primeiro** relatório do revisor para um `cod` | o revisor passa a terminar o relatório com uma linha fixa: `Placar: autor=<agente> cod=<cod> veredito=sim\|não B=<n> A=<n> M=<n> b=<n>` (Bloqueante, Alta, Média, baixa). O gancho `SubagentStop` do revisor lê essa linha do fim da transcrição (ou de `last_assistant_message`, se V3 confirmar) e grava em `revisoes.jsonl` |
| Defeitos achados pelo revisor por gravidade | a mesma linha | idem, somado por autor |
| Defeitos que escaparam ao usuário | o usuário diz "defeito: <o que viu> (era do <agente>)" ou usa a skill `registrar-defeito` | a skill acrescenta a linha completa em `.claude/base/DEFEITOS-USUARIO.md` (no projeto, com texto, como o `defeitos-usuario.md` do MVP) e só a contagem `{agente, projeto, data, gravidade}` em `defeitos.jsonl` |
| Taxa de captura do revisor | pegos pelo revisor ÷ (pegos + só pelo usuário), por período | derivada de `revisoes.jsonl` + `defeitos.jsonl` |
| Retrabalho | execuções do mesmo agente com o mesmo `cod` depois de um veredito "não" + correções "era com" (roteador já grava em `roteamento.json`) | derivado; o `cod` liga construção, revisão e correção |
| Acerto da estimativa | `execucoes.jsonl`: % dentro da faixa e mediana de \|real − fim da faixa\| ÷ fim da faixa | derivado |

- Onde fica: `~/.claude/agentes-ultimate/placar.json` (por agente, por projeto-hash e total), refeito por
  `node scripts/placar.js` a cada `SubagentStop` (barato: só lê `.jsonl`).
- Skill `placar`: mostra a tabela; `--projeto` filtra o atual.
- Por que linha fixa no revisor: hoje o veredito está em texto livre; contar por palavra erra. A regra do revisor
  muda em `fonte/agentes/nucleo/revisor.md` e ganha um caso de eval ("relatório sem a linha Placar = falha").
- Teste: relatório falso com `veredito=não B=1 A=2` → `revisoes.jsonl` com essas contagens; segundo relatório do
  mesmo `cod` não conta como "de primeira"; relatório sem a linha → nada gravado e aviso no `estado.json`.
- Custo: 3–4 h.

### Peça 3 · Laço de melhoria

**3.1 Curadoria disparada sozinha a cada ~10 trabalhos:**
- `estado.json` guarda, por projeto, `trabalhos_desde_curadoria` (soma 1 a cada `SubagentStop` que não é do
  curador; zera quando o curador termina).
- Como o orquestrador fica sabendo: o `roteador.js` (UserPromptSubmit, já injeta contexto) acrescenta uma linha
  quando o contador passa de 10: "10 trabalhos desde a última curadoria: ao fim deste pedido, chame o curador
  (memórias, APRENDIZADOS, PROPOSTAS, placar do período)". Uma vez por limiar, para não repetir a cada pedido.
- Limite configurável: `"curadoria": {"a_cada": 10}` no `.claude/base/config.json`.
- Teste: 9 paradas falsas → sem aviso; a 10ª → aviso uma vez; parada do curador → zera.
- Custo: 1,5–2 h.

**3.2 Mudança de instrução só entra se os evals não piorarem:**
- Se V2 achar `claude plugin eval`, usar o formato que ele pede e converter os `evals/*.md` (o formato atual
  Pedido/Deve/Não deve é próximo do usual de casos com rubrica). Se não (esperado), **`scripts/rodar-evals.js`**:
  1. para cada caso do `evals/<agente>.md`, roda o agente em modo não interativo (`claude -p` com a definição do
     agente) numa pasta temporária vazia, com o Pedido;
  2. um juiz (outra chamada, rubrica = "Deve" e "Não deve") dá passou/falhou com o trecho que justifica;
  3. roda a versão atual e a proposta, mesmos casos; grava o resultado na tabela "Histórico" do eval.
- Portão: nenhum caso de **regressão** pode falhar na proposta; nenhum caso que passava pode passar a falhar; o
  total não cai. `validar.js` recusa mudança em `fonte/agentes/<x>.md` sem linha nova no Histórico de
  `evals/<x>.md` com data igual ou posterior.
- Ruído: o juiz varia. Rodar cada caso 2 vezes e só contar como queda se falhar nas duas **[HIPÓTESE: 2 bastam;
  medir a variação no bloco]**.
- Prova de que o portão funciona: tirar de propósito um passo do método do revisor (ex.: "controle positivo") →
  o caso 2 de `evals/revisor.md` tem de falhar; repor → passa.
- Custo: 3–4 h. Tokens: ver §5.

**3.3 Lição geral de um projeto vira versão nova do plugin:**
1. No projeto, a proposta em `.claude/base/PROPOSTAS.md` ganha o campo `geral: sim|não` (o curador marca).
2. Skill `propor-ao-plugin`: copia as propostas `geral: sim` para `~/.claude/agentes-ultimate/propostas-plugin/
   <data>-<agente>.md` **passando por um filtro** (`scripts/filtro-privacidade.js`) que bloqueia: valores com R$,
   %, números com 4+ dígitos, e-mails, CPF/CNPJ, caminhos absolutos, nomes listados em `config.json` →
   `"termos_privados"` (ex.: nome da empresa, clientes) e palavras do glossário do projeto. Achou → mostra o trecho e
   pede reescrita genérica; não copia.
3. O curador revisa a proposta já filtrada ("vale para qualquer projeto?"); o usuário aprova.
4. Quem constrói (no repositório do plugin): muda `fonte/`, roda `gerar-agentes.js`, o portão 3.2, `validar.js`,
   `testar-hooks.js`; sobe a versão em `plugin.json` e `marketplace.json`; CHANGELOG. **Push e publicação são do
   usuário** (trava já existente). A atualização automática (`hooks/atualizar.js`, 1 vez por dia) leva a todos.
- Teste: proposta com "Motiva", "R$ 213 mil" e um caminho `C:\Users\…` → 3 bloqueios; proposta genérica → passa.
- Custo: 2,5–3 h.

### Peça 4 · Relatório periódico
- Quando: no `SessionStart`, se o mês mudou desde o último relatório (`estado.json`), `scripts/placar.js --mes`
  grava `~/.claude/agentes-ultimate/relatorios/AAAA-MM.md` e devolve 3 linhas como contexto adicional; o orquestrador
  as mostra na primeira resposta. Também a qualquer hora com a skill `placar --mes`, e no fechamento de etapa
  (`skills/fechar-etapa/SKILL.md` chama o placar do período).
- Conteúdo: taxa de captura do revisor (e a meta de 80%), "de primeira" por agente (x/y), erro mediano da
  estimativa e % dentro da faixa, 1 agente que mais piorou e 1 que mais melhorou. Só números e nomes de agente.
- Sem dados no mês: não mostra nada (não inventa "0%").
- Teste: `estado.json` com mês anterior + registros falsos → relatório com os números calculados à mão; mesmo mês →
  nada.
- Custo: 1,5–2 h.

## 4. Ordem de construção (blocos de 3–4 h)

Obrigatório = sem isso a 0.7.0 não entrega o pedido. Desejável (~) = corta sem perder o essencial.

| Bloco | Conteúdo | Obrigatório | Desejável (~) | Base (h) | Depende de |
|---|---|---|---|---|---|
| 0 | Verificações V1–V3 | V1, V2, V3 | — | 1–1,5 | 0.6.0 no commit |
| 1 | Registro de execuções (1.3) + `estimar.js registrar` | gancho, classes, privacidade, testes | importar o passado | 3–4 | 0 |
| 2 | Estimativa por classe (1.4) + regra no `SKILL.md` | `faixa`, cascata, fator | faixa no mapa ao vivo | 3–4 | 1 |
| 3 | Progresso (1.1) + barra (1.2) + `instalar-barra` | tudo | — | 3–4 | 2 |
| 4 | Placar (peça 2) + linha fixa do revisor + `registrar-defeito` | tudo | skill `placar` com filtro por projeto | 3–4 | 1 |
| 5 | Curadoria a cada ~10 (3.1) + relatório mensal (peça 4) | contador e aviso | relatório no SessionStart (fica só a skill e o fechar-etapa) | 3 | 4 |
| 6 | Portão de evals (3.2) | executor, juiz, portão no `validar.js`, prova com instrução piorada | 2ª passada contra ruído | 3–4 | 0 (V2) |
| 7 | Proposta ao plugin (3.3) | filtro, skill, campo `geral` | — | 3 | 6 |
| 8 | Documentação (`README`, `docs/como-funciona.md`), CHANGELOG 0.7.0, versão, teste do usuário de ponta a ponta | tudo | — | 2–3 | 1–7 |

Frentes ao mesmo tempo: no máximo 2 (blocos 4 e 6 podem correr em paralelo aos 2–3; os outros são em fila).
Cada bloco tem revisor e teste do usuário curto (ex.: bloco 3 = "lance 2 agentes e mande o print do painel").

## 5. Estimativa total

Classe de referência: as rodadas reais do projeto MVP Orçamento levaram **~1,5× o estimado** (número informado pelo
orquestrador neste pedido; o `historico-agentes.js` do MVP calcula esse fator, mas não rodei o resumo nesta tarefa).
Não há histórico de horas por versão do plugin (as 0.1.0 a 0.5.1 saíram no mesmo dia, 27/10, pelo CHANGELOG).

| | Soma da base (h) | × 1,5 (h) |
|---|---|---|
| Tudo (blocos 0–8) | 24–31 | **36–46** |
| Só o obrigatório (corta 1~, 2~, 4~, 5~, 6~) | 21–27 **[ESTIMATIVA: desejáveis ≈ 3–4 h]** | **32–41** |

Pior caso **[ESTIMATIVA: fator 2× se V1 e V2 derem "não" e o juiz dos evals for instável]**: até ~62 h.
Em rodadas de 3–4 h: 9 a 15 rodadas para tudo; 8 a 14 só com o obrigatório.

Corte recomendado se o prazo não fechar: lançar uma **0.7.0 = blocos 0–4** (estimativa, barra e placar; base
13–17,5 h, ~20–26 h com o fator) e deixar o laço (5–7) para a **0.7.1**. O laço precisa de histórico para valer: com poucas execuções
registradas a curadoria e o relatório teriam pouco a dizer.

## 6. Riscos e privacidade

| Risco | Mitigação |
|---|---|
| Conteúdo de empresa no registro global (descrição do pedido, nomes de arquivo, valores) | global guarda só agente, classe, minutos, contagens, hash do projeto; descrição nunca; teste do bloco 1 prova com "R$ 2 mi" |
| Proposta ao plugin (repositório **público**) levar regra de negócio | filtro + curador + aprovação do usuário + push só pelo usuário |
| Tudo local | nenhum gancho faz chamada de rede (a única é a atualização que já existe); registros em `~/.claude/agentes-ultimate/` e `.claude/base/` fora do git |
| Custo de tokens | ganchos e scripts não usam IA (0 token); contexto injetado: ~1–3 linhas no aviso de curadoria e no relatório mensal; regra nova no protocolo ≈ 6 linhas a mais por agente. **Evals usam tokens de verdade** [ESTIMATIVA: 5 casos × 2 versões × 2 passadas × (agente + juiz) ≈ 40 chamadas por mudança de instrução]; só rodam quando há proposta de mudança, nunca sozinhos |
| Gancho lento ou quebrado travar o Claude Code | nunca falhar; leitura só das pontas da transcrição; limite de tempo no `hooks.json` |
| Barra escrita na configuração do usuário | só com aprovação, com cópia de segurança, sem sobrescrever, com desfazer |
| Fator de calibração enviesado com n pequeno | cascata até n ≥ 3; "sem histórico" explícito; a fonte da faixa vai junto da faixa |
| Linha fixa do revisor esquecida | caso de eval do revisor + aviso no `estado.json` quando falta |
| Dois agentes do mesmo tipo | código do pedido `[cod:xxxx]` em progresso, estimativa e placar |
| Conflito com a 0.6.0 | começar depois do commit da 0.6.0; blocos que mexem em `roteador.js` (5) e `hooks.json` (1, 3) avisam o engenheiro |

## 7. Perguntas ao usuário

1. **Escopo da 0.7.0.** (a) tudo de uma vez (36–46 h); (b) 0.7.0 = estimativa, barra e placar e 0.7.1 = laço de
   melhoria; (c) só a estimativa e a barra. **Recomendo (b):** entrega primeiro o que se vê todo dia e junta histórico
   para o laço valer. Risco: o laço chega 2–3 rodadas depois. Reversível.
2. **Barra na sua configuração.** Se o plugin não puder ligar a barra sozinho (o mais provável), a skill
   `instalar-barra` escreve no seu `~/.claude/settings.json` com a sua aprovação e cópia de segurança. **Recomendo
   aceitar.** No MVP Orçamento continua valendo a barra do projeto (precedência). Reversível com `--desfazer`.
3. **Custo dos evals.** Rodar os evals só quando houver mudança de instrução (≈ 40 chamadas por mudança)
   **[ESTIMATIVA]**, ou também uma vez por mês em todos os agentes (centenas de chamadas). **Recomendo só na
   mudança.** Perda: não pega piora que venha de troca de modelo; dá para ligar a rodada mensal depois.
4. **Relatório mensal sozinho na abertura da sessão.** **Recomendo sim** (3 linhas, uma vez por mês); a
   alternativa é só sob pedido (`/placar`) e no fechamento de etapa.
5. **Nome do projeto no registro global.** Só hash (anônimo) ou hash + um nome curto que você escolhe por projeto
   (ex.: "mvp-orcamento") para o placar ficar legível. **Recomendo hash + nome curto opcional**, nunca o caminho.

## 8. Fontes deste plano
- Referência: `.claude/hooks/barra-agentes.js`, `historico-agentes.js`, `registrar-agente.js`,
  `.claude/logs/estimativas.json`, `docs/padroes/fluxo-de-trabalho.md`, `.claude/agent-evals/defeitos-usuario.md`
  (projeto MVP Orçamento), lidos em 2026-10-28.
- Plugin: `fonte/comum.md`, `fonte/agentes/nucleo/curador.md`, `evals/revisor.md`, `hooks/hooks.json`,
  `.claude-plugin/plugin.json` (0.5.1), `CHANGELOG.md`, `hooks/atividade.js`, `hooks/roteador.js` (trechos).
- Método: apetite e corte (Basecamp, Shape Up); classe de referência (Flyvbjerg); Definição de Pronto (Scrum Guide).

## Decisões do usuário (28/10)
1. **Escopo:** dividir. 0.7.0 = estimativa, barra e placar (blocos 0 a 4); 0.7.1 = laço de melhoria.
2. **Barra:** a skill pode escrever no `~/.claude/settings.json` do usuário, com aprovação e cópia de segurança.
3. **Evals:** rodar só quando mudar instrução de agente. Observação do orquestrador: `claude plugin eval` **existe** na
   versão instalada (V2 confirmada falsa), então o bloco 0 só precisa validar o formato de caso que ele aceita.
4. **Relatório mensal:** 3 linhas na abertura da sessão (fica para a 0.7.1).
5. **Pedido novo, entra na 0.7.0:** o **mapa ao vivo mostra os agentes trabalhando**, cada um com o **% do trabalho**
   (do progresso gravado pelo agente), a **hora prevista de término** (da estimativa calibrada) e um aviso quando
   **cada agente termina** (não só o fim geral). Painel lateral "Agentes agora": nome e cor do agente, barra de %,
   etapa atual em até 4 palavras, "termina por volta de 17h40", e o marcador no grafo com um anel de progresso.
