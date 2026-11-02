# Revisão independente da 0.8.0, lote sites-premium, 5ª rodada (conferência curta)

**Pode juntar: NÃO.** A-1, b-15 e b-16 estão fechados; o M-10 virou limite declarado. A M-11 fechou nas 3 frases da
4ª rodada, mas as formas novas de "página de vendas" repetem o defeito (continua aberta, Médio). E o "ganho barato"
abriu um achado Alto novo, do mesmo tipo da A-1:

- **A-2:** "novo site de", "site moderno", "site para o meu" e "site para a minha" entraram em `sites` como expressões
  firmes de 2 pontos. Uma expressão sozinha já dá o mínimo. Resultado: **10 de 10 pedidos de outras áreas** com essas
  expressões ("o novo site de reembolso não aceita o recibo do táxi", "qual o site para o meu cadastro no INSS")
  chamam o `designer-sites`, o `engenheiro-software` e o lembrete do `/checklist-lancamento`. Na `main` e na 4ª rodada:
  0 de 10. Três das quatro ("novo site", "site para o meu/a minha") fui eu quem sugeriu na 4ª rodada, sem sondá-las
  em outras áreas: o erro de origem é meu. A correção é de uma linha (as 4 entram em `ambiguas`), testada abaixo.

Os outros 3 achados novos são menores: M-12 (o `era com` não tira o designer de sites no exemplo do próprio README),
b-17 (o texto do limite 1 é mais largo que o comportamento) e b-18 (um mutante da M-11 escapa da bateria).

- Revisor: `revisor` (código rv96), 2026-11-02, 13h20 a 14h15. Autor: `engenheiro-software` (código st82).
- Escopo: ramo `lote-sites`, dbacbba..c4c7c6f (4c5de34, 5b67eb6, dffe565, 9a78b3c, c4c7c6f), só os itens da
  `revisao-0.8.0-sites-r4.md` e o que a correção deles tocou (`pacotes/pacotes.json`, `scripts/testar-sites.js`, 3
  cabeçalhos `ref:` e `conhecimento/indice.json`, `README.md`, `docs/como-funciona.md`, `docs/criar-pacote.md`).
  Decisões já tomadas não foram reabertas ("quero"/"preciso de" fora do par; "preciso de um site" com o orquestrador;
  âncora primeiro).
- Comparação: `main` (4830310), dbacbba (4ª rodada) e c4c7c6f (agora), em cópias `git archive` no temp do revisor
  (`rv96/`). Neste repositório, só este relatório foi criado.

## Conferência dos itens da 4ª rodada

| Id | Situação | Evidência (rodada agora) |
|---|---|---|
| A-1 | **fechado** | "tela de/do/da" em `ambiguas`. Sonda rv93, grupo N2: 8 de 8 sem designer (eram 0 de 8). 8 frases novas de outras áreas com "tela" (TM1, nota fiscal, contracheque, extrato, Ariba, folha, ponto, tribunal): 8 de 8 sem designer (na 4ª rodada, 8 de 8 iam ao `designer-paineis`). Telas de app: 8 de 8 na sonda rv93 e 4 de 5 nas novas. Mutantes M1–M3 pegos |
| M-11 | **aberto (Médio)**: fechado nas frases da 4ª rodada, não no defeito | "pagina inicial" e "pagina de vendas" saíram de alvos, âncoras e palavras firmes. Sonda rv93, N4: 3 de 3 sem `designer-sites`. "Página inicial" de Power BI: 3 de 3 limpas. Mas as 6 formas novas de "página de vendas" são firmes e voltam a puxar o designer de sites em páginas de relatório: 5 de 5 ver abaixo. Formas de site seguem pegas: "crie a página inicial do site da clínica", "faça a página de vendas do meu curso", "monte a página de vendas para o lançamento do ebook" → `designer-sites`. Mutantes M4 e M5 pegos |
| b-15 | **fechado** | Caso "não é um app: crie o site com react e efeito vidro" na bateria; o mutante sem `!negado` na âncora (M7) agora é pego. Frases novas: "não quero um app: faça o site da padaria" → `designer-sites`; "não é um site: crie o app de agenda em react" → `designer-paineis` |
| b-16 | **fechado**, com ressalvas (M-12, b-17) | `como-funciona.md` descreve ambíguas, pares, desempate e negação; `criar-pacote.md` manda usar `pares` e `desempate`; README tem a seção "Limites do roteamento de site × app". Mutante M12 (README sem a linha do empate) pego |
| M-10 | virou limite declarado (README e `como-funciona.md`) | "o componente react de tabela quebra quando colo dados do site do IBGE" segue indo ao `designer-sites`, como o texto diz |
| ganho barato | **funciona, mas abre a A-2** | "site para o meu restaurante com cardápio e reservas", "quero um novo site de receitas da minha avó", "preciso de um site moderno para o escritório", "novo site de vendas" → `designer-sites` (antes: orquestrador). "onboarding do app": "faça o fluxo de onboarding do app de academia" → `designer-paineis` (antes: orquestrador) |

## Checagens decisivas (rodadas por mim)

| Checagem | Resultado |
|---|---|
| `node scripts/testar-sites.js` (cópia de c4c7c6f, 13h27) | **77 casos, 0 falha(s)**, 2 min 21 s |
| `node scripts/validar.js` | 31 agentes, 19 pacotes, 12 skills · 0 erro, 0 aviso |
| `claude plugin validate .` (worktree) | "Validation passed" |
| Sonda rv93 (63 frases) + 27 novas + 11 de falso positivo, roteador real × 3 versões; mais 5 de "página de vendas" e 5 do mutante M6 | tabelas acima e abaixo |
| Outros pacotes (Finanças, RH, Operações, BI…) nas 101 frases, `main` × agora | **0 diferença** (o comparador viu as diferenças de Sites e Interface quando não as filtrei: controle positivo) |
| Junção com a `main` atual (4830310) | **1 conflito** de 2 linhas, que não vem desta rodada (ver "Junção") |
| Bateria inteira (`testar-hooks.js`, 62 GB livres), na junção resolvida | **651 ok, todos passaram**, saída 0 |

## Achados abertos

| Id | Gravidade | Achado | Impede juntar? | Dono |
|---|---|---|---|---|
| A-2 | Alto | "novo site de", "site moderno", "site para o meu/a minha" firmes: 10 de 10 pedidos de outras áreas vão ao designer de sites + engenheiro + checklist | **sim** | `engenheiro-software` |
| M-11 | Médio | As formas novas de "página de vendas" ("para", "do meu", "do produto", "uma") são firmes: 5 de 5 páginas de relatório com elas chamam o `designer-sites` | não (pode virar limite) | `engenheiro-software` |
| M-12 | Médio | `era com designer-paineis` não tira o `designer-sites` no exemplo do limite 1: o bônus do exemplo é somado antes do desempate e a âncora leva os pontos | não (pode virar texto) | `engenheiro-software` |
| b-17 | Baixo | O limite 1 do README diz "uma menção a 'site' decide o pedido"; só decide quando o pedido não cita app, aplicativo ou sistema | não | `engenheiro-software` |
| b-18 | Baixo | Saída de "pagina inicial" das âncoras sem caso: o mutante M6 escapa e muda 2 pedidos de painel para o designer de sites | não | `engenheiro-software` |

### A-2 · Expressões do ganho barato puxam o designer de sites em pedidos de outras áreas (Alto)

Saída real de agora. Na `main` e em dbacbba, nenhuma destas frases chama designer:

- "cadastre o fornecedor no novo site de compras da empresa" → Sites (site, novo site de); Operações [checklist]
- "o novo site de notas fiscais da prefeitura pede certificado digital" → Sites (site, novo site de) [checklist]
- "o novo site de reembolso não aceita o recibo do táxi" → Sites [checklist]
- "a planilha baixada do novo site de câmbio veio com vírgula errada" → Sites [checklist]
- "acesse o novo site de compras do governo e baixe o edital" → Sites [checklist]
- "o banco lançou um site moderno, mas o extrato continua igual" → Sites (site, site moderno) [checklist]
- "o site moderno do concorrente tem preço menor, monte a análise de preço" → Sites [checklist]
- "procure um site para o meu filho estudar matemática" → Sites (site, site para o meu) [checklist]
- "qual o site para o meu cadastro no INSS" → Sites [checklist]
- "indique um site para a minha pesquisa de preços de aço" → Sites (site, site para a minha) [checklist]

**Causa:** em `pacotes.json` → `sites.palavras`, as 4 expressões valem 2 pontos firmes; com "site" (1), somam 3. A
bateria não tem frase negativa com nenhuma delas. Os pedidos de site que elas salvam também não recebem a biblioteca
`sites-premium` ("quero um novo site de receitas…", "preciso de um site moderno…", "novo site de vendas" → `refs` vazias),
porque os cabeçalhos `ref:` não têm essas expressões.

**Correção recomendada** (mutante informativo I1, abaixo): pôr as 4 em `ambiguas` (valem 0,5 e, sem outro sinal firme
do assunto, não levam ao designer). Mover de volta para a classe X as 3 frases S que o I1 derruba (ficam com o
orquestrador, como o limite aceito na 4ª rodada) e pôr as 10 frases acima na classe N. Outra saída igualmente boa:
tirar as 4 expressões.

Testei a troca numa cópia (`rv96/fix`), com as 38 frases novas:
- fecha os 10 falsos positivos acima;
- 3 pedidos de site voltam ao orquestrador ("quero um novo site de receitas da minha avó", "preciso de um site moderno
  para o escritório", "novo site de vendas"), o limite aceito na 4ª rodada;
- "site para o meu escritório de contabilidade, com formulário de contato" continua no `designer-sites`;
- nenhuma outra frase muda.
- No `testar-sites` (mutante informativo I1): 77 casos, 1 falha. A classe S perde 3 frases, que vão ao orquestrador:
  "site para o meu restaurante com cardápio e reservas", "quero um site moderno para a minha academia" e "novo site de
  vendas". São as que precisam voltar à classe X. Minha conta de que a da academia ficaria (2 pontos) estava errada: o
  roteador real dá "nenhum". Vale a saída, não a conta.

### M-12 · O `era com` não corrige o limite 1 (Médio)

O README diz "Em todos os casos, corrija com `era com <agente>`" e o gancho responde "Anotado: pedidos assim vão para
designer-paineis". Testei com a mesma casa entre as chamadas (`rv96/eracom.js`): pedido, `era com designer-paineis`,
o mesmo pedido de novo.

| Pedido | 1ª vez | 2ª vez, depois do `era com designer-paineis` |
|---|---|---|
| "o componente react de tabela quebra quando colo dados do site do IBGE" (o exemplo do README) | `designer-sites` | **`designer-sites` primeiro**, Sites com "desempate: âncora de sites"; o `designer-paineis` só entra pelo pacote BI |
| "faça a landing page e as telas do app de delivery" (limite 2) | `designer-sites` | `designer-paineis` |
| "crie o site e o aplicativo da clínica com o mesmo visual" (limite 2) | `designer-sites` | `designer-paineis` |
| controle: "monte a tela de cadastro do sistema de chamados" | nenhum | `designer-paineis` |

**Causa:** `hooks/roteador.js`, linhas 202–205 somam +3 ao pacote do agente corrigido; o desempate (linhas 211–217)
roda depois e, com âncora só em `sites`, dá a `sites` os pontos de `interface` e zera `interface`. A correção do
usuário vira ponto do lado que ela queria tirar. Na `main` o mesmo pedido vai ao `designer-paineis` já na 1ª vez.

**Correção, à escolha do autor:** (a) o desempate não aplica a âncora quando o exemplo corrigido aponta para o lado sem
âncora; ou (b) o README diz a verdade: "o `era com` refaz o pedido da vez; no seguinte, o designer de sites continua
na frente".

### b-17 · Limite 1 mais largo que o comportamento (Baixo)

"Uma menção a 'site' decide o pedido" só vale quando o pedido não tem âncora de app. "crie a tela de login do app com
link para o site" → `designer-paineis` (âncora nos dois lados: decide a soma). Texto sugerido: "Quando o pedido não diz
app, aplicativo ou sistema, uma menção a 'site' decide…".

### M-11 · "Página de vendas" de relatório ainda chama o designer de sites (Médio, continua aberto)

As frases da 4ª rodada estão limpas. Mas a correção trocou "pagina de vendas" por 6 formas firmes ("uma pagina de
vendas", "pagina de vendas do meu", "… da minha", "… para", "… do curso", "… do produto"), e 4 delas aparecem em
pedidos de página de relatório. Saída de agora (na `main`, nenhuma chama o `designer-sites`):

- "monte uma página de vendas no power bi com mapa por região" → BI + **Sites** (uma pagina de vendas), com a biblioteca `sites-premium`
- "filtre a página de vendas para a região sul no power bi" → BI + **Sites** (pagina de vendas para)
- "mude a página de vendas para mostrar o realizado do mês" → **só Sites** (pagina de vendas para)
- "na página de vendas do produto, o gráfico de margem está vazio" → **só Sites** (pagina de vendas do produto)
- "a página de vendas do meu relatório não carrega depois da atualização" → **só Sites** (pagina de vendas do meu)

**Causa:** "para", "do meu" e "do produto" não distinguem página de site de página de relatório; firmes, cada uma
basta sozinha.

**Correção, à escolha do autor:** (a) as 6 formas em `ambiguas` (exigem um segundo sinal: site, landing, curso,
ebook…; perde-se "faça a página de vendas da minha loja de roupas", que vai ao orquestrador); (b) ficar só com as
formas que só servem a site ("pagina de vendas do curso", "do ebook") e declarar o resto como limite. Pode virar
limite, como já estava na 4ª rodada; não impede juntar sozinho.

Os cabeçalhos `ref:` de `sites-premium/INDICE.md`, `metodo-de-montagem.md` e `modos/persuadir.md` têm 4 das 6 formas
(faltam "da minha" e "do produto"): "faça a página de vendas da minha loja de roupas" vai ao `designer-sites` sem a
biblioteca. Detalhe para a mesma correção.

### b-18 · Saída de "pagina inicial" das âncoras sem teste (Baixo)

Ver o M6 na mutação. **Correção:** um caso na classe P ou NS, por exemplo "refaça a página inicial do painel
administrativo com o formulário de contato" (esperado: sem `designer-sites`), visto pegando o M6.

### Observação (não é achado)

"monte a tela de cadastro do sistema de chamados" fica com o orquestrador ("tela de" e "sistema" são ambíguas). É o
mesmo da `main` e o efeito colateral previsto na 4ª rodada. "crie a medida dax de margem e mostre na tela de
resultados" também volta ao comportamento da `main` (nenhum designer), como previsto.

## Mutação nas partes alteradas

12 mutantes numa cópia (`rv96/mut`), contra o `testar-sites.js`, lidos pelo resumo ("N casos, F falha(s)"); script em
`rv96/mut.js`. **Placar: 11 de 12 pegos.** Sem mutação: 77 casos, 0 falha.

| Mutante | Resultado |
|---|---|
| M1 "tela de/do/da" saem das ambíguas | pego (as 8 frases de SAP) |
| M2 só "tela de" sai | pego |
| M3 só "tela do" sai | pego |
| M4 "pagina inicial" volta aos alvos do par | pego |
| M5 "pagina de vendas" volta às palavras firmes | pego |
| **M6 "pagina inicial" volta às âncoras de sites** | **escapou**: não é equivalente (b-18) |
| M7 âncora sem `!negado` | pego (2 falhas): b-15 fechado |
| M8 sai "novo site de" | pego |
| M9 sai "site moderno" | pego |
| M10 sai "site para o meu" | pego |
| M11 sai "onboarding do app" | pego |
| M12 README sem a linha do empate | pego |
| I1 (informativo, não conta) as 4 expressões da A-2 em `ambiguas` | 1 falha: as 3 frases S que voltariam à classe X |

**M6 muda o roteamento.** Rodei o roteador da cópia com o mutante (`rv96/m6`):
- "refaça a página inicial do painel administrativo com o formulário de contato": agora `designer-paineis`; com o M6, `designer-sites` (desempate: âncora de sites).
- "crie a página inicial do painel administrativo com formulário de contato em react": agora `designer-paineis`; com o M6, `designer-sites`.

Falta na bateria um caso de painel com "página inicial" e um sinal fraco de site.

## Junção

A `main` andou desde a 4ª rodada (da13c1c → 4830310, 17 commits). `git merge-tree --write-tree main c4c7c6f` agora
**dá 1 conflito**, em `conhecimento/design/movimento/INDICE.md`. Não vem desta rodada: dbacbba × `main` atual já
conflita, e c4c7c6f × da13c1c não conflita. São duas linhas vizinhas do cabeçalho:
- linha 1: a `main` (d1355f4) troca a versão da fonte `@a81dbca` → `@f1090be`;
- linha 2: o ramo (9ba6924) acrescenta `designer-sites` aos agentes do `ref:`.

Resolução certa: as duas mudanças (linha 1 da `main`, linha 2 do ramo). Fiz isso na cópia (`rv96/resolver.js`) e
conferi que `conhecimento/indice.json`, juntado sem conflito, já traz `designer-sites` no tema movimento. Quem fizer
o merge resolve à mão (sem rebase).

## Bateria inteira

`testar-hooks.js` rodou 1 vez, sozinho, na árvore juntada e resolvida (`main` 4830310 + c4c7c6f), das 13h55 às
14h10: **651 ok, "todos os casos passaram"**, saída 0. `validar.js` na mesma árvore: 31 agentes, 19 pacotes, 13
skills · 0 erro, 0 aviso.

## O que só o usuário consegue provar

1. Diga "o novo site de reembolso não aceita o recibo do táxi". Hoje aparece "Usando: Sites e landing pages ·
   designer-sites…". Depois da A-2, não deve aparecer nada de sites.
2. Diga "tire um print da tela de erro do SAP". Não deve aparecer "Interface (app)" (A-1 fechada).
3. Diga "crie a página inicial do relatório de orçamento no power bi". Deve aparecer só BI, sem "Sites".
4. Diga "o componente react de tabela quebra quando colo dados do site do IBGE", depois `era com designer-paineis` e
   repita o pedido: hoje o designer de sites continua na frente (M-12).

5. Diga "mude a página de vendas para mostrar o realizado do mês". Hoje aparece "Sites e landing pages" (M-11).

Placar: autor=engenheiro-software cod=st82 veredito=não B=0 A=1 M=2 b=2 ids=A-2,M-11,M-12,b-17,b-18
