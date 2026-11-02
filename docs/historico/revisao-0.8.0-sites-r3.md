# Revisão independente da 0.8.0, lote sites-premium, 3ª rodada

**Pode juntar: NÃO.** Fica 1 achado Bloqueante, e ele é novo:

- **B-1:** para fazer "crie um site" funcionar sem a lista de 200 combinações, o pacote `sites` ganhou 16 verbos comuns
  (crie, faça, monte, desenvolva, construa, melhore, refaça…) como palavras firmes de 1 ponto. Dois verbos já somam o
  mínimo. Resultado: **38 de 39 pedidos de outras áreas**, todos fora de qualquer lista, passam a chamar o `designer-sites`,
  o `engenheiro-software` e o lembrete do `/checklist-lancamento`. Na `main`, são 0 de 39.
  Exemplos: "faça a análise de variação e crie a apresentação para a diretoria", "crie o contrato e faça a revisão das
  cláusulas" e "crie um relatório com os dados do site do IBGE".

É o único item que impede juntar. O resto pode virar limite declarado, se o orquestrador preferir:

- 1 Médio: o desempate entrega pedidos de site com palavra técnica só ao `designer-paineis`;
- 4 Baixos.

O que a 2ª revisão pediu foi feito e se confirma na minha máquina:

- tela de app voltou ao nível da `main`;
- os 7 falsos positivos da M-7 saíram;
- teclado pela lista real de controles;
- a tábua das semanas substituiu o calendário;
- regra das 3 rodadas.

- Revisor: `revisor` (código rv89), 2026-11-02, 8h40 a 9h40. Autor: `engenheiro-software` (código st82).
- Escopo: ramo `lote-sites`, 340c10f..38a9ae5. Comparação com a `main` (4672437) e com 340c10f (2ª rodada).
- Tudo rodou em cópias `git archive` no temp, inclusive a junção simulada (`git merge-tree` main × 38a9ae5, árvore bf3b139,
  sem conflito). Neste repositório, só este relatório foi criado.
- Nenhum Edge foi aberto: a página mudou só no bloco da tábua, e julguei pelos PNGs do autor.

## Conferência do que o autor disse

| O autor disse | Eu vi | Resultado |
|---|---|---|
| `testar-hooks` 553 ok | na junção simulada com a `main` atual (4672437, 4 commits depois do merge): **579 ok, "todos os casos passaram"**, 16 min | confere, e junta sem conflito |
| `testar-sites` 72 casos | 72 casos, 0 falha (cópia, 94 s) | confere; a queda de 101 está explicada abaixo |
| `validar.js` 0/0 | 31 agentes, 19 pacotes, 12 skills, 0 erro, 0 aviso | confere |
| eval-roteamento 18/19, a falha é igual na `main` | 18/19 nas duas, mesma frase ("estratégia de expansão…"). Na `main`, 0 palavras repetidas; agora o eval avisa 3 sem a marca de ambígua: "redesenhe", "site com dashboard" e "site com painel" | confere; o aviso novo vai para o b-14 |
| A-3: palavras genéricas de volta ao `interface` | html, css, react, frontend, efeito vidro e visual premium estão lá; entraram "tela" e "sistema" (ambíguas), "checkout" e "painel administrativo" | confere |
| M-7: lista de 200 saiu; "âncoras de 1 ponto + verbos" | 59 palavras em `sites`. **Os 16 verbos são palavras firmes de 1 ponto** | confere, e é a B-1 |
| M-8: Tab comparado com a lista real | li o `provar.js`: lista de `a[href], button, summary, input…, [tabindex]` visíveis; reprova se falta ou sobra; o mutante `tabindex=-1` usa `faltam.length > 0` | confere |
| b-9: sai o calendário e o "saber antes" | saíram; entrou a tábua das semanas. Os números batem com o calendário antigo (amplitudes 2.970, 2.230, 400, 977,60 e 21,10 conferidas à mão) | confere, com 3 restos (b-13) |
| b-10: PROVADO só com 3 rodadas e p95 ≤ 2× | regra no teste e no quadro. Mas o B2 deu 33,4 / 33,4 / 16,8 ms (1,99×) e o quadro mostra só "16,8 ms" | em parte (b-10) |
| b-11 | CHANGELOG diz que o mutante foi trocado, e por quê | confere |

### Por que o `testar-sites` caiu de 101 para 72 casos

Não houve corte escondido. Foi consolidação:

- Saíram 35 casos de uma frase cada: 22 de site, 8 sem designer, 1 de painel, 3 de app e 1 de css. Entraram 4 casos de
  tabela, que juntam 55 + 37 + 7 + 40 frases, e mais 2 casos novos (referência da biblioteca e b-9). A conta fecha:
  101 − 35 + 6 = 72.
- Das frases antigas, todas continuam na tabela, menos 3:
  - "dashboard com kpi de vendas do meu site": saiu, coerente com o b-8. A irmã "dashboard de vendas do meu site" está na
    classe A (os dois designers).
  - "preciso de um site": foi para a classe X, que não é testada.
  - **"corrija o css e o html do botão no react"**: saiu sem registro. Antes, o teste exigia "só o engenheiro, sem
    designer". Agora a frase vai ao `designer-paineis`, como na `main`. Isso é coerente com a decisão da A-3, mas a
    troca não foi declarada (b-14).
- As 21 frases da classe X ("o orquestrador decide") não são checadas. Faz sentido para as ambíguas; só registro o fato.

## Achados abertos

| Id | Gravidade | Achado | Impede juntar? | Dono |
|---|---|---|---|---|
| B-1 | Bloqueante | Verbos comuns como palavra firme de `sites`: 38 de 39 pedidos de outras áreas vão ao `designer-sites` (+ engenheiro + checklist) | **sim** | `engenheiro-software` |
| M-9 | Médio | Desempate pela soma total: pedido de site com react, efeito vidro ou animação vai só ao `designer-paineis` (5 de 19) | não (pode virar limite) | `engenheiro-software` |
| b-10 | Baixo | Aberto em parte: o B2 oscilou 33,4 / 33,4 / 16,8 ms, passa por 1,99×, e o quadro mostra só 16,8 ms | não | `engenheiro-software` |
| b-12 | Baixo | A regra "empate = os dois" não tem teste: o mutante que derruba um no empate passa | não | `engenheiro-software` |
| b-13 | Baixo | Página: o plano Solo ainda vende "calendário"; o texto diz "linha em vermelho", mas só um número fica colorido (coral no escuro), e a semana mais baixa é marcada só pela cor; a barra de 21,10 aparece com 6% da largura, quando o certo seria 0,7% | não | `designer-sites` / autor |
| b-14 | Baixo | Registro: o caso do css saiu sem aviso; a entrada da 2ª rodada no CHANGELOG ainda diz "html, css, react e frontend sem site vão ao engenheiro"; o eval avisa 3 palavras repetidas sem a marca de ambígua | não | `engenheiro-software` |

### B-1 · Verbos comuns puxam o designer de sites (Bloqueante)

**Sonda:** 79 frases novas, que não estão em nenhuma lista nem nas minhas sondas antigas. Rodei o `hooks/roteador.js`
real em 3 versões: `main`, 340c10f e 38a9ae5. O arquivo está no temp do revisor: `rv89/frases.txt`, `sonda.js` e
`out1.jsonl`.

| Grupo | Esperado | `main` | 340c10f | agora |
|---|---|---|---|---|
| F1: usar o site de outro, com verbo (15) | nenhum designer | 15 certos | 15 | **0** |
| F2: outras áreas com 2 verbos, sem "site" (16) | sem `designer-sites` | 16 | 16 | **0** |
| F3: "web" sem ser site (8) | sem `designer-sites` | 8 | 8 | **1** |
| APP: telas de app (16) | `designer-paineis` | 10 | 5 | 10 |
| SITE: pedidos de site (12) | `designer-sites` | 0 | 7 | 11 |
| BI: painéis (5) | `designer-paineis` | 3 | 3 | 5 |
| Controle: outras áreas sem verbo (7) | igual à `main` | — | — | 7 iguais |

Saída real de agora (pacote e motivo, como o roteador escreve):

- "faça a análise de variação e crie a apresentação para a diretoria" → Sites e landing pages (crie, faca) [checklist]
- "crie o contrato de prestação de serviço e faça a revisão das cláusulas" → Sites (crie, faca); Jurídico [checklist]
- "faça o fechamento contábil e crie a conciliação bancária" → Finanças; Sites (crie, faca) [checklist]
- "crie testes unitários e faça o refactor da função" → Sites (crie, faca) [checklist]
- "melhore o texto e refaça o resumo executivo" → Sites (melhore, refaca) [checklist]
- "crie um relatório com os dados do site do IBGE" → Sites (site, crie) [checklist]. É o falso positivo que o autor
  declarou como "possível". Na verdade, é a regra geral: os 15 da F1 erram ("faça login no site do banco…", "crie uma
  conta no site da receita…").
- "crie uma api web em python", "desenvolva uma aplicação web para controle de estoque" e "crie um web app de tarefas" →
  Sites (web + verbo). O último ainda entrega as referências de tela da Apple ao `designer-sites`.
- "desenvolva o app e crie a tela de login" → só Sites (crie, desenvolva). Uma tela de app indo ao designer de sites.

**Causa:**
- `pacotes.json` → `sites.palavras` contém crie, cria, criar, faca, faz, fazer, monte, montar, desenvolva, construa,
  desenhe, redesenhe, melhore e refaca. Eles não estão em `ambiguas`.
- Cada um vale 1 ponto firme, e o mínimo é 2. Dois verbos, ou um verbo + "site" ou "web", escolhem o pacote.
- A bateria só tem frases negativas **sem** esses verbos. A única com "criação" não bate na palavra.

**A bateria trava o defeito:** o mutante "verbos viram ambíguos (0,5)" é **pego**, com 12 frases S falhando. Ou seja, o
teste defende o verbo solto.

**Correção (recomendação, nesta ordem):**
1. **Recomendado:** o verbo só pontua junto do alvo. Uma regra nova e pequena no roteador, em `pacotes.json` →
   `sites.pares`: verbo + artigo opcional (um, uma, o, a, meu, minha, nosso) + "novo" opcional + alvo (site, website,
   landing, homepage, página web, lp). Vale 2; verbo solto vale 0. Pelas frases da sonda, cobre "crie um site", "faça o
   site da pizzaria" e "refaça a homepage da minha loja". Não pega "faça login no site do banco" nem "crie um relatório
   com os dados do site". Dá para voltar atrás, e é o mesmo tipo de mudança que o desempate.
2. Verbos como ambíguos (0,5): resolve F2 e F3, mas perde 12 pedidos de site ("crie um site", "fazer um site"…). Não
   recomendo.
3. Voltar às expressões fechadas: é a lista de 200 que a M-7 tirou.

Em qualquer caso, os 39 pedidos de F1 a F3 entram na bateria como negativos.

**Áreas impactadas:** todas. A linha "Usando: Sites e landing pages · designer-sites…" aparece para o usuário em pedidos
de finanças, jurídico, RH, BI e software.

### M-9 · Desempate entrega pedido de site ao designer de painéis (Médio)

A sonda `frases2.txt` e `frases3.txt` tem 19 pedidos de site que citam uma tecnologia ou um efeito. Destes, 5 vão só ao
`designer-paineis`, e 2 não vão a ninguém:

| Pedido | Pontos (sites × interface) | Agora |
|---|---|---|
| "crie um site em react com efeito vidro" | site + crie = 2 × react + efeito vidro = 3 | só `designer-paineis` |
| "landing page do app com visual premium em react" | 3 × 4 | só `designer-paineis` (em 340c10f: os dois) |
| "site com efeito vidro e animação" | 1 × 3 | só `designer-paineis` |
| "site em html e css com animação" | 1 × 3 | só `designer-paineis` |
| "homepage com animação e componente de depoimentos" | 1 × 2 | só `designer-paineis` |
| "quero um site com glassmorphism" | 1 × 1 | nenhum |
| "tela de login do site em react" | 1 × 1,5 | nenhum |

**Causa:**
- A regra decidida (fica o de mais pontos) compara a soma total.
- As palavras de tecnologia valem só para o `interface`. O "site", que é a âncora, vale 1.
- Então quanto mais o pedido de site descreve a técnica, mais ele vira pedido de app.
- O caso inverso também acontece: "redesenhe o site e o app" vai só ao `designer-sites`.

**Correção sugerida, sem reabrir a decisão:** desempatar pelas âncoras. Cada pacote do par declara as suas
(site/website/landing/homepage × app/aplicativo/sistema/tela do app). Quem tem âncora e o outro não, fica. Se os dois têm
ou nenhum tem, vale a soma, como hoje.

**Se ficar como limite:** declarar no README do pacote que "pedido de site cheio de termo técnico pode ir ao designer de
painéis; corrija com 'era com designer-sites'".

### b-10 · Tempo de quadro (Baixo, aberto em parte)

A regra das 3 rodadas está no teste e no quadro, e pegaria o meu caso da 2ª revisão (E5 a 66,6 ms, que é 4×).

Só que o B2 (Aurora) deu 33,4, 33,4 e 16,8 ms e passa por 1,99×. O quadro mostra "16,8 ms", que é o valor da última
rodada e não a mediana (33,4). O limite de 2× fica exatamente em 1 quadro perdido: com o p95 andando de 16,7 em 16,7 ms,
qualquer ruído de 0,5 ms troca o veredito.

**Correção:** mostrar a mediana ou a pior das 3 rodadas.

### b-12 · "Empate = os dois" sem teste (Baixo)

O mutante D2 tira o `!==`, e assim o empate também derruba um dos dois. Ele passa nos 72 casos. Nenhuma frase da bateria
empata `sites` × `interface` acima do mínimo, porque as da classe A chegam aos dois designers pelo pacote `bi`.

**Correção:** um caso de empate, por exemplo "crie o site do app em react" (2 × 2 → os dois designers).

### b-13 · Página (Baixo)

Vi `site-claro-1440` inteiro e recortes da tábua em 1440 claro, 1440 escuro e 320 px. A tábua está limpa e alinhada,
cabe em 320 px sem rolagem, e os números conferem. Restos:

- O plano Solo ainda diz "Tábua, **calendário** e avisos" (linha 440 de `site-preamar.html`), mas o calendário saiu.
- "A linha em vermelho é a semana em que a água baixa mais": só o 312,40 fica colorido, não a linha. No tema escuro, a cor
  é coral. E a marca de "baixa" agora é só a cor (antes havia a etiqueta escrita), contra o WCAG 1.4.1.
- A barra de 21,10 ocupa 6,0% da largura, quando a proporção é 0,7% (21,10 ÷ 2.970). Parece um piso fixo, e ele
  exagera a barra 8×. Pequeno, mas é a mesma régua que pedimos aos painéis.

### b-14 · Registro (Baixo)

- O caso "corrija o css e o html do botão no react → só engenheiro" saiu da bateria sem nota. Agora a frase vai ao
  `designer-paineis`.
- A entrada da 2ª rodada no CHANGELOG ainda diz "html, css, react e frontend sem site vão ao engenheiro". A nova entrada
  não corrige isso.
- `eval-roteamento` passou a avisar 3 palavras repetidas sem a marca de ambígua. O `validar.js` não vê o aviso.

## Achados da 2ª revisão: situação

| Id | Situação | Evidência |
|---|---|---|
| A-3 | **fechado** | Tela de app: 10 de 16 frases novas certas, igual à `main` (340c10f: 5). As 6 que erram também erram na `main` (ex.: "faça a tela de onboarding do aplicativo", que soma 1,5). Os 18 pedidos da A-3 estão na classe P e passam |
| M-7 | **fechado** como pedido | Os 7 falsos da M-7 estão na classe N e passam. A mesma família (usar o site de outro) volta pela B-1, com verbo |
| M-8 | **fechado** | Código lido. O mutante `tabindex=-1` entra nos 21 do autor. Limite não testado [HIPÓTESE]: controle feito com `div` + `role=button` sem `tabindex` não entra na lista esperada |
| b-4 | **fechado** | 11 de 12 pedidos de site novos certos. Falta "quero um site moderno para a minha academia" (limite) |
| b-8 | **fechado** | Classe A, 7 de 7. O `designer-sites` faz a página e o `designer-paineis` faz o painel |
| b-9 | **fechado** | Saíram o calendário e o "saber antes". Os restos de texto estão no b-13 |
| b-10 | aberto em parte | ver acima |
| b-11 | **fechado** | CHANGELOG (ef353b8) |

## Mutação (cópia, contra `scripts/testar-sites.js`)

Placar: **pegou 9 de 12**.

Foram pegos:
- D1: sem o par de desempate;
- D3: derruba o vencedor;
- D4: `>` no lugar de `>=`;
- V1: verbos ambíguos (pego, mas é o defeito que a bateria trava, ver B-1);
- V2: sem "web";
- V3: sem "crie";
- V4: sem "do meu site";
- V5: sem "tela" no `interface`;
- V7: sem "react" no `interface`.

Os 3 que escaparam:
- **D2**, empate derruba um: vira o b-12.
- D5, o perdedor fica com metade: quase equivalente, só muda quando quem perde tem 4 pontos ou mais.
- V6, sem "site com dashboard" no `bi`: equivalente, porque "dashboard de" e "painel de indicadores" cobrem as mesmas
  frases.

Sem mutação, a mesma cópia deu 72 casos e 0 falha.

## PNGs que abri

- `site-claro-1440` inteiro.
- Recortes da tábua em `site-claro-1440`, `site-escuro-1440` e `site-claro-320`.
- Nada cortado nem sobreposto. Em 320 px, as 4 colunas cabem, apertadas mas legíveis.

**Parece premium?**
- A tábua "O mês em cinco linhas de tábua" é mais própria que o calendário, e lê como almanaque.
- O título do bloco escuro ("O que a tábua mostra além da maré") agora sai da metáfora.
- O conjunto não lembra mais o Calen.

## Para o usuário provar (depois da B-1)

1. Peça "faça a análise de variação e crie a apresentação para a diretoria": a linha "Usando:" não pode citar Sites.
2. Peça "crie um relatório com os dados do site do IBGE": nenhum designer.
3. Peça "crie um site em react com efeito vidro": deve vir o `designer-sites`.
4. Peça "crie a tela de login do app em react": deve vir o `designer-paineis`, sem o de sites.
5. Abra `docs/provas/0.8.0-sites/site-preamar.html` e olhe a tábua das semanas. A semana mais baixa salta aos olhos sem
   depender da cor?

## Limites desta revisão

- A página não foi recapturada: confiei nos PNGs do autor e no código, porque só o bloco da tábua mudou. A prova de 21/21
  mutantes do autor não foi refeita.
- O limite da M-8 com `div role=button` é leitura de código, sem rodar.
- O roteamento foi testado com o roteador real, mas não num `claude -p`.

Placar: autor=engenheiro-software cod=st82 veredito=não B=1 A=0 M=1 b=4 ids=B-1,M-9,b-10,b-12,b-13,b-14
