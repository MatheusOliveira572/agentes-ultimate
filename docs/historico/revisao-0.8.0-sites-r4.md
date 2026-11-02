# Revisão independente da 0.8.0, lote sites-premium, 4ª rodada (focada)

**Pode juntar: NÃO.** Os 6 achados da 3ª rodada estão fechados, mas a correção abriu um achado Alto novo:

- **A-1:** para recuperar telas de app, o pacote `interface` ganhou "tela de", "tela do" e "tela da" como expressões
  firmes de 2 pontos. Uma expressão sozinha já dá o mínimo. Resultado: **8 de 8 pedidos de outras áreas que citam uma
  tela** (SAP, notebook, cotação, auditoria) passam a chamar o `designer-paineis`, o `engenheiro-software` e o lembrete
  do `/checklist-lancamento`. Na `main` e na 3ª rodada, são 0 de 8. É o mesmo tipo de defeito da B-1, num grupo menor.
  A correção é de uma linha (as 3 expressões entram em `ambiguas`). Testei essa troca: ela fecha os 8 casos e passa nos
  75 casos do `testar-sites`.

O resto pode virar limite declarado, se o orquestrador preferir: 2 Médios e 2 Baixos.

- Revisor: `revisor` (código rv93), 2026-11-02, 10h05 a 11h10. Autor: `engenheiro-software` (código st82).
- Escopo: ramo `lote-sites`, 3882434..dbacbba, só os achados da `revisao-0.8.0-sites-r3.md` e o que a correção deles
  tocou (`hooks/roteador.js`, `pacotes/pacotes.json`, `scripts/testar-sites.js`, `site-preamar.html`, `provar.js`, CHANGELOG).
- Comparação: `main` (da13c1c), 38a9ae5 (3ª rodada) e dbacbba (agora). Tudo rodou em cópias `git archive` no temp do
  revisor (`rv93/`). Neste repositório, só este relatório foi criado.
- Edge: nenhum aberto. Julguei a página pelos PNGs do autor, com recortes.

## Conferência do que o autor disse

| O autor disse | Eu vi | Resultado |
|---|---|---|
| `testar-sites` 75 | 75 casos, 0 falha (cópia, 2 min 17 s) | confere |
| `testar-hooks` na árvore juntada 556 ok | junção simulada com a `main` atual (da13c1c, 3 commits depois da usada na 3ª rodada): `git merge-tree` sem conflito, árvore e5e0937; **592 ok, todos os casos passaram** | confere, com a `main` atual |
| eval 18/19, falha igual na `main` | 18/19, mesma frase ("estratégia de expansão…"), **0 palavra repetida** (eram 3) | confere |
| `validar.js` | 31 agentes, 19 pacotes, 12 skills, 0 erro, 0 aviso | confere |
| "crie um site em react com efeito vidro" → designer-sites | `designer-sites, engenheiro-software` (par "crie um site" + desempate pela âncora) | confere |
| "crie a tela de login do app em react" → designer-paineis | `designer-paineis, engenheiro-software` | confere |
| empate "crie o site e o app em react com animação" → os dois | 3 × 3, os dois designers | confere |
| as 39 negativas certas | a classe NS (31 frases) e as 15 novas da classe N passam | confere |

## Sonda nova: 63 frases fora de qualquer lista

62 frases novas (conferidas contra o `testar-sites.js`, o `eval` e as minhas sondas rv89) e 1 de controle repetida.
Rodei o `hooks/roteador.js` real nas 3 versões. Os arquivos estão no temp do revisor: `rv93/frases.txt`, `sonda.js` e
`out1.jsonl`.

| Grupo | Esperado | `main` | 3ª rodada | agora |
|---|---|---|---|---|
| N1: outras áreas, verbo + artigo + algo que não é site (10) | sem designer | 10 | 10 | **10** |
| N2: "tela de/do/da" fora de app (8) | sem designer | 8 | 8 | **0** (A-1) |
| N3: site de outro, sem pedido de criar (5) | nenhum designer | 5 | 5 | 4 (A-1 + M-10) |
| N4: "página inicial" ou "página de vendas" dentro de um painel (3) | sem `designer-sites` | 3 | 2 | **0** (M-11) |
| S: pedidos de site (17) | `designer-sites` | 0 | 15 | **16** |
| APP: telas de app (8) | `designer-paineis`, sem `designer-sites` | 4 | 6 | **7** |
| EMP: site e app no mesmo pedido (3) | os dois | 0 | 0 | 0 (regra decidida, b-16) |
| ANC: tela de app que cita um site (3) | `designer-paineis`, sem `designer-sites` | 2 | 1 | 1 (M-10) |
| BI: painel com "tela" (3) | `designer-paineis` | 2 | 2 | 3, mas pelo pacote `interface` (A-1) |
| Controle sem verbo nem tela (3) | igual à `main` | — | — | 3 iguais |

**O desempate por âncora não mexe em outras áreas.** O código só altera os pontos de `sites` e `interface`. Nas 63
frases, os outros pacotes escolhidos (Finanças, Jurídico, Compliance, Operações, BI…) são idênticos aos da `main`:
0 diferenças.

**A B-1 está fechada.** Os 10 pedidos com verbo + artigo de outras áreas ("crie o orçamento de marketing…", "refaça a
reconciliação do razão…", "redesenhe o processo de contas a pagar") não chamam ninguém de sites. Os 16 pedidos de site
certos incluem "crie uma lp para a black friday", "faça o site da imobiliária em react…" e "crie um site com tailwind e
animações…".

## Mutação nas partes alteradas

9 mutantes numa cópia, contra o `testar-sites.js`. O placar foi lido pelo resumo ("N casos, F falha(s)").

**Placar: 8 de 9 pegos.** Sem mutação: 75 casos, 0 falha.

| Mutante | Resultado |
|---|---|
| M1 par verbo + alvo desligado | pego (22 frases S) |
| M2 sem a regra da âncora (só a soma) | pego (4 frases S) |
| M3 empate derruba um dos dois | pego ("crie o site e o app em react com animação"): b-12 fechado |
| M4 a âncora vence sem levar os pontos do outro | pego |
| M5 a âncora só vale quando os dois passam do mínimo | pego |
| M6 o par aceita até 3 palavras entre o verbo e o alvo | pego ("faça login no site do banco…") |
| M7 saem "refaça" e "refazer" dos verbos | pego |
| **M8 a âncora sem a checagem de negação** | **escapou**: é defeito real (b-15) |
| M9 b-13: a barra de 21,10 volta a 6% | pego |
| I1 (informativo, não conta) "tela de/do/da" como ambíguas | 75/75 passam: a correção da A-1 não quebra a bateria |

## Achados abertos

| Id | Gravidade | Achado | Impede juntar? | Dono |
|---|---|---|---|---|
| A-1 | Alto | "tela de/do/da" como expressão firme de `interface`: 8 de 8 pedidos de outras áreas com "tela" vão ao designer de painéis + engenheiro + checklist | **sim** | `engenheiro-software` |
| M-10 | Médio | A âncora "site" vale com qualquer menção: uma tela de app que só cita um site de terceiro vai ao `designer-sites` | não (pode virar limite) | `engenheiro-software` |
| M-11 | Médio | "página inicial" e "página de vendas" como alvo e âncora de site: páginas de painel do Power BI chamam o `designer-sites` | não (pode virar limite) | `engenheiro-software` |
| b-15 | Baixo | Negação da âncora sem teste: o mutante M8 escapa e muda o roteamento | não | `engenheiro-software` |
| b-16 | Baixo | Limites não declarados: pares, âncora e desempate fora de `docs/como-funciona.md`; pedidos de site sem verbo + alvo ficam com o orquestrador; site e app juntos vão a um lado só | não | `engenheiro-software` |

### A-1 · "tela de/do/da" puxa o designer de painéis (Alto)

Saída real de agora (pacote e motivo, como o roteador escreve). Na `main` e em 38a9ae5, nenhuma dessas frases chama
designer:

- "tire um print da tela de erro do SAP e me explique o que significa" → Interface (app) (tela (ambígua), tela de) [checklist]
- "na tela de lançamento do SAP o valor do centro de custo aparece errado" → Finanças; Interface (app) [checklist]
- "a tela do meu notebook está piscando, o que pode ser" → Interface (app) (tela do) [checklist]
- "o fornecedor mandou a tela de cotação com preço diferente do contrato" → Interface; Operações [checklist]
- "explique a tela de aprovação de pedidos de compra para o time" → Interface [checklist]
- "qual transação abre a tela de cadastro de fornecedor no SAP" → Interface [checklist]
- "o auditor pediu a tela de log de acessos do sistema contábil" → Interface [checklist]
- "monte o passo a passo da tela de conciliação bancária para o manual" → Interface [checklist]

**Somado à âncora, também puxa o designer de sites:**

- "a tela de login do site da receita não abre, como resolvo" → só Sites (site, desempate: âncora de sites) [checklist]
- "faça a tela de importação que lê o arquivo baixado do site do banco" → só Sites

**Causa:**
- `pacotes.json` → `interface.palavras` tem "tela de", "tela do" e "tela da". Elas não estão em `ambiguas`.
- Toda expressão de 2 palavras vale 2 pontos firmes, e o mínimo é 2. Com "tela" (0,5), uma frase com "tela de" já soma 2,5.
- A bateria não tem nenhuma frase negativa com "tela de".

**Correção recomendada:**
1. Pôr "tela de", "tela do" e "tela da" em `ambiguas`.
2. Pôr os 8 pedidos do grupo N2 na classe N ou NS.

Testei essa troca numa cópia:
- fecha os 8 do N2, o da receita e o da importação;
- as telas de app da sonda continuam 7 de 8 (ex.: "crie a tela de cadastro do aplicativo de entregas" fica com
  aplicativo 1 + tela 0,5 + tela de 0,5 = 2);
- o `testar-sites` fica com 75 casos e 0 falha (mutante I1).

O único efeito colateral visto: "crie a medida dax de margem e mostre na tela de resultados" deixa de chamar o
`designer-paineis`. É o mesmo comportamento da `main`.

**Áreas impactadas:** todas. Esta área usa muito "tela de lançamento", "tela de aprovação" e outras telas do SAP.

### M-10 · Uma menção a "site" ganha a tela de app (Médio, pode virar limite)

A âncora vale se a palavra aparece em qualquer lugar do pedido. Então um site de terceiro, citado como fonte, decide o
pedido:

- "o componente react de tabela quebra quando colo dados do site do IBGE" → só `designer-sites`. A `main` e a 3ª
  rodada mandavam ao `designer-paineis`. Nenhuma das duas tem "tela de", então a A-1 não explica este caso.
- "um painel administrativo em react para o meu site" (classe X) → só `designer-sites`. O painel administrativo é tela
  de app.

É consequência da regra que o usuário decidiu (a âncora primeiro). Por isso, não reabro a regra. Há dois caminhos:

- **Declarar como limite.** O usuário corrige com "era com designer-paineis".
- **Afinar a âncora, sem mudar a regra:** "site d[oa] <outro>" no fim de uma oração não conta como âncora.
  [HIPÓTESE: precisa de sonda própria, porque "o site da imobiliária" é pedido de site.]

### M-11 · "Página inicial" e "página de vendas" de um painel chamam o designer de sites (Médio, pode virar limite)

| Pedido | `main` | 3ª rodada | agora |
|---|---|---|---|
| "crie a página inicial do relatório de orçamento no power bi" | BI | BI | BI + **Sites** (par "crie a pagina inicial") |
| "refaça a página inicial do painel com os kpis do mês" | BI | BI | BI + **Sites** |
| "monte a página de vendas do dashboard comercial" | nenhum | Sites | **só Sites** |

**Causa:** "pagina inicial" e "pagina de vendas" estão nos alvos de `sites.pares` e nas âncoras do desempate. "pagina de
vendas" também está nas palavras firmes.

**Por que pesa aqui:** num projeto Power BI, "página inicial" e "página Vendas" são nomes comuns de página de relatório.

**Correção sugerida:**
- tirar "pagina inicial" dos alvos e das âncoras; as expressões "pagina inicial do site" e "pagina inicial do meu"
  continuam cobrindo o caso de site;
- ou fazer o par não contar quando o pacote `bi` tem palavra firme.

### b-15 · Negação da âncora sem teste (Baixo)

O mutante M8 tira o `!negado(...)` da âncora e passa nos 75 casos. Ele não é equivalente. Teste com "não é um app: crie
o site com react e efeito vidro":

- agora: só o `designer-sites`;
- com o M8: os dois designers.

**Correção:** um caso com âncora negada na bateria.

### b-16 · Limites do roteamento não declarados (Baixo)

1. **Documentação.** `docs/como-funciona.md`, item 2, ainda descreve só "palavra = 1, expressão = 2, arquivo = 2". Não
   cita `ambiguas`, `pares` nem o desempate por âncora. Quem cria um pacote (`docs/criar-pacote.md`) não fica sabendo
   das regras novas. Elas estão só no `_como_usar` do `pacotes.json` e no CHANGELOG.
2. **Pedidos de site que ficam com o orquestrador.** Pedi um julgamento das 31 frases da classe X. Estas são pedidos
   claros de site e caem em "o vocabulário não reconheceu a área: decida você":
   - "quero um site moderno para a minha academia";
   - "preciso de um site";
   - "novo site de vendas";
   - "portfólio de fotografia online";
   - "página sobre nós da empresa".

   Da minha sonda, entra também "site para o meu restaurante com cardápio e reservas": existe "site para meu", mas não
   "site para o meu".

   Considero **limite aceitável, não Alto**. A saída manda o orquestrador escolher pelo assunto, com o catálogo inteiro,
   e não indica um agente errado. O custo é a falta da sugestão, não um erro. "quero um site com glassmorphism" já está
   na classe S e passa.

   Ganho barato: verbos "quero" e "preciso de" nos pares; "novo site", "site para o meu" e "site para a minha" nas
   expressões.
3. **Site e app no mesmo pedido.** Com as duas âncoras, decide a soma, e o empate exato é raro. Na sonda EMP, 0 de 3
   chamam os dois designers:
   - "crie o site e o aplicativo da clínica…" → só sites;
   - "faça a landing page e as telas do app…" → só painéis, porque "tela do app", "tela do" e "tela" somam juntas;
   - da classe X: "redesenhe o site e o app" → só sites; "o app e o site precisam de visual premium" → só painéis.

   É o comportamento da regra decidida. Falta escrever isso como limite no README ou no `como-funciona.md`.

## Achados da 3ª revisão: situação

| Id | Situação | Evidência |
|---|---|---|
| B-1 | **fechado** | N1: 10 de 10 sem designer (verbo + artigo + outro assunto). Classe NS (31) na bateria. Mutantes M1, M6 e M7 pegos |
| M-9 | **fechado**, como decidido | Os pedidos de site com react, next.js, tailwind ou efeito vidro (4 da sonda + "crie um site em react com efeito vidro") vão ao `designer-sites`. M2, M4 e M5 pegos. Resto da regra decidida em b-16 (3) |
| b-10 | **fechado** | O quadro mostra "33.4 ms (pior de 3: 33.4 / 33.4 / 16.8)" no B2; o caso novo compara com o pior |
| b-12 | **fechado** | Caso de empate na classe A; o mutante M3 é pego |
| b-13 | **fechado** | Recortes de `site-claro-1440`, `site-escuro-1440` e `site-claro-320`: "▼ mínima" escrito, fundo e fio de 3 px na semana 22 a 28; texto "vem destacada, com a marca"; barra de 21,10 fina (0,7%, mínimo de 2 px), as outras na proporção; o Solo diz "Tábua do mês, avisos e cenários 'e se'" (o "e se" existe na página). M9 pego |
| b-14 | **fechado** | O CHANGELOG corrige o relato da 2ª rodada e explica a saída do caso do css. O eval dá 0 palavra repetida |

## Bateria inteira

`testar-hooks.js` rodou 1 vez, na árvore juntada e5e0937 (`main` da13c1c + dbacbba). Resultado: **592 ok, "todos os casos passaram"**,
saída 0 (terminou às 11h03; o resto da saída são avisos de LF/CRLF do git nas pastas de teste). O número é maior que os
556 do autor porque a `main` atual tem os casos novos da trava (fb08f09..da13c1c). A junção não tem conflito e não
quebra nada.

## O que só o usuário consegue provar

1. Diga "tire um print da tela de erro do SAP" numa sessão com o plugin. Hoje a linha "Usando: Interface (app) ·
   designer-paineis…" aparece. Depois da A-1, não deve aparecer nada de interface.
2. Diga "crie um site para a minha clínica". Deve aparecer "Sites e landing pages · designer-sites, engenheiro-software".
3. Diga "quero um site moderno para a minha academia". Hoje aparece "Área não reconhecida…". Decida se basta o
   orquestrador escolher.
4. Abra `docs/provas/0.8.0-sites/png/site-claro-320.png` na tábua das semanas e confira que a semana 22 a 28 se
   distingue sem depender da cor.

Placar: autor=engenheiro-software cod=st82 veredito=não B=0 A=1 M=2 b=2 ids=A-1,M-10,M-11,b-15,b-16
