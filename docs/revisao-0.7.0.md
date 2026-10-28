# Revisão independente · agentes-ultimate 0.7.0

Revisor, 2026-10-28 (17h27–18h05). Escopo: commits `85899dd`..`b3764eb` sobre a 0.6.0 (`0cec368`), contra
`docs/plano-0.7.md` e as decisões do usuário de 28/10. Só relato; nada foi corrigido.

## Veredito

**Pode publicar: não** (1 Alto aberto; nenhum Bloqueante). O Alto é de correção barata (horas, não dias): com ele
fechado e os Médios M-1 a M-3 ao menos decididos, a versão está pronta para o teste do usuário.

| Gravidade | Qtde | Itens |
|---|---|---|
| Bloqueante | 0 | — |
| Alto | 1 | A-1 |
| Médio | 6 | M-1 a M-6 |
| Baixo | 7 | b-1 a b-7 |

A linha Placar do fim usa `cod=v070`: o trabalho revisado não tinha código de pedido (`[cod:]`), então uso o nome da
versão.

## Checagens decisivas (rodadas por mim, sem cache)

| Checagem | Resultado |
|---|---|
| `node scripts/testar-hooks.js` (17h27) | **89 de 89 ok**, saída 0, 63 s. Os testes usam uma pasta de usuário temporária (`HOME`/`USERPROFILE` trocados): não tocam `~/.claude` |
| `node scripts/validar.js` | `30 agentes, 17 pacotes, 9 skills · 0 erro(s), 0 aviso(s)` |
| `claude plugin validate .\.claude-plugin\plugin.json` | `Validation passed`, saída 0 |
| Estimativa calculada à mão (4 execuções 12, 18, 30, 60 min; estimadas 10, 20, 20, 40) | Esperado: mediana 24, p75 37,5; fatores 0,9 · 1,2 · 1,5 · 1,5 → mediana 1,35, p75 1,5; `--estimado 40` → 54–60 min → 9h50–10h00. **Obtido igual**, nível `agente+classe`, n=4; execução retomada (999 min) e outro agente (500 min) ficaram fora |
| Cascata até n ≥ 3 | 4 casos montados à mão: cai para `agente`, `classe`, `todos` e "sem histórico" nos pontos certos (bordas n=2 e n=3) |
| Claude Code real (2.1.302, plugin-sonda em `claude -p` com `AGENTES_ULTIMATE_SEM_PASTA=1`, só chaves e horários) | 3 sondas: ver A-1, M-1, M-2 e "Observações sobre o plano" |
| Provas do autor no scratchpad (`painel-1..4.png`) | Conferidas: painel com nome, cor, barra, etapa, "termina por volta de", "terminou às · 41 min", aviso no topo e linha no "Ao vivo", claro e escuro. São de uma página de demonstração com dados montados, não de agentes reais |

## Achados

### Alto

**A-1 · O fim de cada agente fica lento à medida que o histórico cresce (custo quadrático no `SubagentStop`).**
Dono: engenheiro-software.
- O gancho refaz o placar inteiro a cada agente que termina (`execucoes.js` → `placar.refazer()`), e o cálculo do
  retrabalho percorre todas as revisões para cada código revisado e, para cada "não", todas as execuções
  (`scripts/placar.js`, laço "Retrabalho").
- Medido (mediana de 5, Node puro ≈ 0,2 s nesta máquina):

  | Histórico global | `SubagentStop` | Demais ganchos |
  |---|---|---|
  | vazio | 0,36 s | 0,22–0,34 s |
  | 3 mil execuções / 1 mil revisões (0,7 MB) | 0,48 s | 0,22–0,31 s |
  | 10 mil / 3,3 mil (2,3 MB) | **2,4 s** | 0,24–0,32 s |
  | 60 mil / 20 mil (19 MB) | **122 s** | barra 1,3 s |

- Com o limite de 5 s do `hooks.json`, passando de ~15 mil execuções **[ESTIMATIVA pela curva acima]** cada fim de
  agente espera 5 s e o `placar.json` deixa de ser refeito. Um ano de uso intenso fica perto de 3–5 mil execuções
  **[ESTIMATIVA: ~20 agentes por dia útil]**; o teste de 10× escala falha. Fere "nenhum gancho pode deixar a sessão
  lenta" e "tudo precisa escalar"; o plano dizia "barato: só lê `.jsonl`".
- Caminho sugerido (decisão do autor): agrupar revisões e execuções por chave antes do laço (linear) e/ou tirar o
  `refazer()` do gancho (o `/placar` já refaz na hora) ou rodá-lo em processo destacado. Caso de regressão: histórico
  de 10 mil execuções → `SubagentStop` abaixo de 1 s.

### Médio

**M-1 · Agente parado ou sessão fechada no meio fica "trabalhando" no painel por até 12 h.** Dono: engenheiro-software
(e designer-paineis para o texto).
- Prova no Claude Code real: agente em segundo plano parado com `TaskStop` gerou `PreToolUse`, `PostToolUse` e
  `SubagentStart`, e **nenhum** `SubagentStop`. Sem o fim, `agentesAgora` mantém o agente por 12 h, depois com
  "passou da previsão · +N min", e ele volta quando o mapa reabre. A barra do Claude Code não sofre (lê o `status`).
- Sugestão: tratar `TaskStop`/fim de sessão (`Stop`, `SessionEnd`) e tirar do painel quem não tem atividade nem
  progresso há X min, com o rótulo "sem notícia".

**M-2 · Dois agentes do mesmo tipo lançados juntos podem trocar de código no registro e no mapa.** Dono:
engenheiro-software.
- No Claude Code real, o `SubagentStart` do 2º agente chegou **antes** do `PostToolUse` que liga o código ao id, com
  os ganchos em processos paralelos (o plano, V3, supõe o contrário). Reproduzi a ordem com o `execucoes.js` real:
  na ordem exata observada, 0 de 10 erros; com os dois inícios a 5 ms, **2 de 6** rodadas gravaram o 2º agente com o
  código do 1º. O fim herda o código do `inicio`, então execução, faixa, progresso do painel e placar vão para o
  código errado. A barra do Claude Code fica certa (lê o código da descrição).
- Sugestão: no fim e no `agentesAgora`, preferir o código do registro `lancado` do mesmo id quando existir. Caso de
  regressão: os 4 eventos em paralelo, com os inícios a 5 ms.

**M-3 · As regras do código do pedido não fecham com o placar e a estimativa.** Dono: engenheiro-software (texto da
skill `ultimate` e do eval do revisor).
- A skill manda "um código novo" a cada lançamento; o retrabalho só conta execuções do autor com o **mesmo** código
  depois de um "não". Seguindo a skill, a coluna Retrabalho fica sempre 0.
- O caso 6 do eval do revisor põe o código do trabalho revisado no formato `[cod:r3a1]` dentro do pedido; se a
  descrição do revisor vier sem código próprio, `codDe(descrição, pedido)` pega `r3a1`. Provei que
  `estimativaPara(proj, 'revisor', 'ab12')` devolve a faixa do **dev-powerbi** (classe construção, estimado 120): a
  execução do revisor entra na estatística com a faixa e a classe do autor, e o progresso dele vai para
  `revisor-<código do autor>.json`. Sugestão: correção reaproveita o código do trabalho; o revisor recebe o código
  revisado como `cod=xxxx` (sem colchetes) e o seu próprio `[cod:yyyy]`; `estimativaPara` exige o mesmo agente.

**M-4 · O painel mostra como "%" um número que o agente não informou, e o término nem sempre vem da estimativa.**
Dono: designer-paineis (visual) e engenheiro-software.
- Decisão 5 do usuário: "% do trabalho (do progresso gravado pelo agente)" e "hora prevista de término (da estimativa
  calibrada)". Sem progresso gravado, o % é tempo decorrido ÷ faixa (até 99%) e aparece igual ao informado (ex.:
  "designer-paineis 21%" no `painel-1-trabalhando.png`, sem etapa). Com progresso ≥ 15%, o término sai do ritmo
  (decorrido ÷ fração), sem limite pela faixa: 1 de 6 etapas em 2 min vira "termina em 12 min" mesmo com faixa de
  1 h. Está documentado no CHANGELOG, mas diverge do pedido.
- Sugestão: % estimado com outra forma (trilho indeterminado ou "~21%") e término pelo ritmo só dentro da faixa.

**M-5 · Três de 7 mutantes escaparam dos testes (B2, C1, C2).** Dono: engenheiro-software. Ver o placar de mutação
abaixo. Faltam: a borda da cascata em par (n = 2 cai de nível, n = 3 fica), o valor do retrabalho (antes e depois do
"não") e uma revisão do mesmo autor com outro código.

**M-6 · A 2ª revisão do mesmo código soma de novo os achados ainda abertos.** Dono: engenheiro-software (regra:
orquestrador).
- `pegos` e B/A/M/b somam todas as linhas Placar. Um Alto que continua aberto na 2ª revisão conta 2 vezes, e a taxa
  de captura do revisor (meta 80%) fica otimista. O plano diz "somado por autor", sem tratar a repetição.
  Sugestão: contar defeitos só da 1ª revisão de cada código, ou pedir ao revisor "novos=" na linha.

### Baixo

- **b-1 · `AGENTES_ULTIMATE_SEM_PASTA=1` não desliga o registro.** `atividade.js` e `roteador.js` respeitam;
  `registro.permitida()` não. Um `claude -p` aninhado dentro de um projeto (evals da 0.7.1, testes) grava execuções
  de teste no histórico real e distorce a estimativa.
- **b-2 · Texto da faixa contraditório:** com histórico de minutos mas nenhum estimado, sai "base n=4 (sem
  histórico)". `estimar.js` usa `ref.n`, que não existe (deveria ser `ref.lista.length`).
- **b-3 · Lançador da barra.** Testado: arquivo ausente → `node` sai 1 com erro (o Claude Code deve cair na linha
  padrão **[HIPÓTESE]**: não visto no painel); versão apagada → sai 0 sem texto (falha segura); duas sessões de
  versões diferentes → vale a última que abriu (falha segura). Risco no Windows: o comando usa `$HOME` do shell, o
  lançador é gravado em `os.homedir()` (= `USERPROFILE`); se `HOME` estiver definido em outro lugar (rede
  corporativa), não há barra. Aqui `HOME` = `USERPROFILE`. Mac e Linux: os dois são `HOME`, sem risco.
- **b-4 · Ordem das paradas repetidas.** Com as duas chamadas do mesmo `SubagentStop` em paralelo (o plano diz que
  vêm 2), 4 de 20 execuções duplicaram e 6 de 20 linhas Placar se perderam (a 2ª, sem mensagem, marca o fim antes).
  Nas 3 sondas reais veio 1 chamada por agente, então o risco é baixo hoje; o teste do autor só cobre em sequência.
- **b-5 · Pasta global não é só metadados (vem da 0.1, fora do diff da 0.7).** `~/.claude/agentes-ultimate/
  ultimo-pedido.json` guarda o texto do último pedido (conferido agora: tem um pedido real do usuário) e
  `roteamento.json` os pedidos corrigidos. O README diz "só metadados" para os `*.jsonl` (correto) e menciona só as
  correções "era com". Sugestão: dizer no README que o último pedido fica lá, ou guardar só as palavras-chave.
- **b-6 · Código do projeto é hash sem sal** (8 hex do SHA-256 do caminho): dá para descobrir testando caminhos
  prováveis. Fica local, sem risco hoje; vale um sal por máquina se o placar um dia sair dela. A linha Placar aceita
  `cod` sem limite de tamanho (`[\w-]+`): limitar a 16, como no `[cod:]`.
- **b-7 · Itens do plano sem prova no repositório.** "Cada caso novo visto falhando antes" (Definição de Pronto)
  está afirmado no CHANGELOG, sem registro: **não verificado**. Retrabalho pelas correções "era com" (peça 2) não
  entrou.

## Privacidade (foco 2)

- Varri, com um pedido que levava "R$ 2 mi", nome de empresa e um caminho `C:\Users\…`: `execucoes.jsonl`,
  `revisoes.jsonl`, `defeitos.jsonl`, `estado.json` e `placar.json` guardam só agente, classe, minutos, horários,
  faixa, contagens, id do agente, código do pedido e hash do projeto (+ nome curto, se o usuário der). **Nenhum texto
  de pedido, caminho ou nome vazou** pelas peças da 0.7. Mutante que grava o nome da pasta foi pego pelo teste.
- Nos testes, nada escreve na pasta real do usuário. O lançador `~/.claude/agentes-ultimate/barra.js` tem o caminho
  do plugin (local, necessário). O que não é só metadado está em b-5 (anterior à 0.7).

## Robustez dos ganchos (foco 3)

- Erro → sai 0: JSON inválido e entrada vazia saem 0 sem texto (`execucoes.js` e `barra.js`); nenhum gancho novo
  escreve na saída padrão, então nenhum pode bloquear (`PreToolUse`/`SubagentStop` sem decisão).
- Tempo: todos perto do custo de abrir o Node, exceto o `SubagentStop` com histórico grande (A-1).
- `SubagentStop` duplicado: tratado pelo id em sequência; em paralelo, ver b-4.
- Lançador e versões: ver b-3. A barra vista no painel do Claude Code com o plugin **instalado** (não por
  `--plugin-dir`) continua sem prova: está na lista do usuário.

## Placar de mutação

Cópia limpa do `HEAD` (`git archive`) por mutante, uma troca de texto, `testar-hooks.js` inteiro. Controle: o
original passa 89 de 89. **Pegou 4 de 7.**

| # | Peça | Defeito injetado | Resultado |
|---|---|---|---|
| A1 | registro de execução (`execucoes.js`) | tira a defesa contra o `SubagentStop` repetido | pego (4 casos) |
| A2 | registro de execução | grava o nome da pasta do projeto no registro global | pego (caso de privacidade) |
| B1 | estimativa (`estimar.js`) | fim da faixa sem o p75 do fator | pego |
| B2 | estimativa (`registro.js`) | cascata aceita n ≥ 2 | **escapou**: o teste da cascata só usa n = 0; a borda n = 2 × n = 3 não é testada (o comportamento de hoje está certo: conferi à mão) |
| C1 | placar (`placar.js`) | retrabalho conta execuções de antes do 1º "não" | **escapou**: nenhum caso confere o retrabalho (o caso que cita "retrabalho" no nome não testa o valor) |
| C2 | placar (`execucoes.js`) | "de primeira" ignora o código | **escapou**: não há revisão do mesmo autor com outro código. Efeito pequeno: o `placar.js` recalcula "de primeira" por conta própria e não usa o campo `primeira` gravado (duas fontes da mesma regra) |
| D1 | progresso (`registro.js`) | progresso vale 5 h em vez de 30 min | pego |

## Observações sobre o plano (V3)

No Claude Code 2.1.302 medido hoje: `SubagentStop` veio 1 vez por agente e sem `last_assistant_message` (o código
cobre os dois casos: lê o fim da transcrição, e a linha Placar já estava lá quando o gancho rodou); o `SubagentStart`
pode chegar antes do `PostToolUse` com o `agentId`; agente parado não dispara `SubagentStop`. Vale atualizar o topo do
`docs/plano-0.7.md`.

## O que só o usuário consegue provar

1. Instale a 0.7.0 do repositório local, abra uma sessão nova num projeto **sem** `subagentStatusLine` própria e
   lance 2 agentes do mesmo tipo em segundo plano: no painel de agentes do Claude Code devem aparecer 2 linhas com
   barra, % e "fim HHhMM–HHhMM" diferentes (V1 só foi provado com `--plugin-dir`).
2. No mapa ao vivo, o painel "Agentes agora" deve listar os 2 e, quando cada um termina, mostrar o aviso "<agente>
   terminou · N min" e a linha no "Ao vivo".
3. Pare um agente no meio (Esc ou parar a tarefa): hoje ele continua "trabalhando" no painel (M-1). Diga se incomoda.
4. Depois de uma revisão, rode `/placar`: a linha do autor deve aparecer com "de primeira" e os defeitos.
5. No MVP Orçamento, confira que a barra do projeto continua valendo (a dele tem precedência).

## Arquivos lidos

`hooks/execucoes.js`, `hooks/registro.js`, `hooks/barra.js`, `hooks/hooks.json`, `settings.json`,
`hooks/mapa-servidor.js` e `hooks/mapa-visual.js` (trechos alterados), `hooks/roteador.js` (gravação do último
pedido e `.gitignore`), `scripts/estimar.js`, `scripts/placar.js`, `scripts/validar.js` (trecho novo),
`scripts/testar-hooks.js` (casos novos), `skills/ultimate`, `skills/placar`, `skills/registrar-defeito`,
`fonte/comum.md`, `fonte/agentes/nucleo/revisor.md`, `evals/revisor.md`, `pacotes/classes-tarefa.json`, README,
`docs/como-funciona.md`, CHANGELOG, `docs/plano-0.7.md`.

Placar: autor=engenheiro-software cod=v070 veredito=não B=0 A=1 M=6 b=7
