# Revisão independente da 0.8.0, lote sites-premium, 2ª rodada

**Pode juntar: NÃO.** Fica 1 achado Alto aberto, e ele é novo:

- **A-3:** para consertar a A-1, html, css, react, frontend, "visual premium" e "efeito vidro" saíram do pacote `interface`.
  Com isso, pedidos de **tela de app** perderam o `designer-paineis`. Dos 16 pedidos de app da minha sonda que iam a ele
  em 9974b28, 13 agora não vão a designer nenhum. Somando as outras sondas, são 18 perdas.

Fora a A-3, quase tudo o que a 1ª revisão pediu foi corrigido e se repete na minha máquina:

- teclado real na prova, com controle positivo: a checagem nova acha os 3 defeitos da página antiga;
- bancada sem reprovação por comparação de imagem;
- ponto preso à curva em todas as cenas;
- larguras de 320 a 2560 px sem defeito;
- vidro coerente com a decisão do usuário;
- bloco "Por que é pago?" substituído por uma objeção própria.

- Revisor: `revisor` (código rv85), 2026-11-02, 6h10 a 7h05. Autor: `engenheiro-software` (código st82).
- Escopo: ramo `lote-sites`, fa570e5..060dd3d (13 commits). Comparação com 9974b28 (antes do lote) e com d6f1ad6 (1ª revisão).
- Tudo o que muda arquivos rodou em cópias `git archive`. Neste repositório, só este relatório foi criado.
- Um Edge por vez.

## Conferência do que o autor disse

| O autor disse | Eu vi | Resultado |
|---|---|---|
| `testar-hooks.js` 484 ok | 484 ok, "todos os casos passaram", 13 min (máquina ocupada) | confere |
| `testar-sites.js` 101 ok | 101 casos, 0 falha | confere |
| `validar.js` 0/0 | 31 agentes, 19 pacotes, 11 skills, 0 erro, 0 aviso | confere |
| `claude plugin validate .` | "Validation passed" | confere |
| `provar.js site` 20/20, larguras sem defeito | refeito numa cópia: 4 capturas sem problema, 20/20 mutantes, teclado, menu, curva, cenas e as 8 larguras ok, 550 s | confere |
| A-1: roteador só por `pacotes.json`, `roteador.js` intocado | `git diff` sem mudança em `hooks/`; mudaram `pacotes.json`, `conhecimento/indice.json` e 2 comentários `ref:` | confere, mas criou a A-3 e a M-7 |
| M-1: tolerância de 3 níveis, PROVADO só com 2 rodadas | refiz a bancada: 38 de 39, **0 reprovação por imagem**; a única falha foi tempo de quadro do E5 (66,6 ms) | imagem confere; tempo, ver b-10 |
| c51d134 "todos pegos" era falso, corrigido em 4e28d29/623baeb | confere: 2 mutantes escapavam. No conserto, um deles foi **trocado** (768 → 320 px), não pego | ver b-11 |

## Achados abertos

| Id | Gravidade | Achado | Dono |
|---|---|---|---|
| A-3 | Alto | Telas de app perderam o `designer-paineis` (18 pedidos); a bateria só testa 3, com expressão feita sob medida | `engenheiro-software` |
| M-7 | Médio | As expressões novas trazem 7 falsos positivos: o `designer-sites` é chamado para quem só usa o site de outro | `engenheiro-software` |
| M-8 | Médio | O teclado da prova não percebe um controle fora da ordem de Tab: conta "≥ 15 paradas" em vez da lista esperada | `engenheiro-software` |
| b-4 | Baixo | Ainda sem: "cria um site", "faz um site", "criar site", "site novo", "crie um web site", "homepage da empresa", "página inicial do meu produto", "quero uma landing"; "site para minha clínica" virou caso **negativo** | `engenheiro-software` |
| b-8 | Baixo | "crie um site com dashboard de vendas" vai só ao `designer-sites`, que pela própria descrição não faz dashboard | decisão do orquestrador; depois o autor |
| b-9 | Baixo | Resto de semelhança com o Calen: "Feito para quem prefere saber antes" mais o calendário de saldo previsto | `designer-sites` / autor |
| b-10 | Baixo | PROVADO por tempo de quadro oscila além do C5: E5 deu 66,6 ms na minha rodada, e o quadro diz 16,8 ms sem ressalva | `engenheiro-software` |
| b-11 | Baixo | A mensagem de 4e28d29 diz que "os 2 mutantes que escapavam agora são pegos", mas um deles foi trocado por outro | `engenheiro-software` |

### A-3 · Tela de app sem designer (Alto)

Sonda nova com 56 pedidos, rodada no `hooks/roteador.js` real em 9974b28 e em 060dd3d. Ela fica no temp do revisor,
`rv85/sonda-rot3.js`. Pedidos de app que iam ao `designer-paineis`:

| Pedido | 9974b28 | agora |
|---|---|---|
| "crie a tela de login do app em react", "faça a interface do sistema em react", "componente react de tabela com visual bonito", "crie o front-end do app", "tela do aplicativo com tailwind", "crie um app em react native" | `designer-paineis` | nenhum |
| "efeito vidro no menu do app", "efeito vidro no cabeçalho do aplicativo", "liquid glass na barra do aplicativo", "visual premium para o aplicativo" | `designer-paineis` | nenhum |
| "tela de cadastro em html e css", "html e css da tela de login", "frontend do aplicativo em react" | `designer-paineis` | só `engenheiro-software` + `testador-qa` + `auditor-seguranca` |
| Da sonda da 1ª revisão: "crie um aplicativo com visual premium", "um painel administrativo em react para o meu site", "site do app" | `designer-paineis` | nenhum |
| "efeito vidro", "visual premium" (sozinhos) | `designer-paineis` | nenhum |

Ficaram certos: "redesenhe a interface do app", "animação no botão do app" e "deixe o sistema com visual premium".

**Causa:**
- As palavras genéricas de design saíram de `interface`. Em troca entraram 12 expressões fechadas, como "app com visual
  premium", "efeito vidro estilo" e "card com efeito vidro".
- Os 3 casos de app da bateria, "faça um card com efeito vidro estilo Apple", "redesenhe meu app com visual premium" e
  "melhore a ux do aplicativo", batem exatamente nessas expressões. A bateria passa, e o pedido real escrito de outro
  jeito se perde.
- No pacote `sites`, a mesma técnica virou 200 palavras: cada combinação "X do site / do meu site / no site / para o meu
  site…" escrita à mão.

**Correção pedida, que depende de decisão (recomendação, nesta ordem):**
1. **Recomendado:** devolver as palavras genéricas ao `interface` e decidir o empate no roteador. Quando `sites` e
   `interface` pontuam juntos, fica só o de maior pontuação; no empate, os dois. É uma regra pequena e reversível em
   `roteador.js`, e acaba com a lista de 200 combinações.
2. Sem mexer no roteador: devolver as palavras ao `interface` e aceitar os dois designers nos pedidos de site que usam
   palavra genérica. Perde a separação limpa.
3. Em qualquer caso, pôr na bateria os 18 pedidos da tabela, escritos como o usuário escreve, e não como a lista de
   palavras.

### M-7 · Falsos positivos novos (Médio)

Chamam `designer-sites` + `engenheiro-software` + `revisor`, e em 9974b28 não chamavam ninguém:

- "encontrei um site para baixar o relatório da CVM" e "indique um site para aprender DAX", pela expressão "um site para";
- "preciso de um site confiável para comprar dólar", por "preciso de um site";
- "quero um site que compare preços de passagem", por "quero um site";
- "o layout do site do governo mudou e o robô de raspagem quebrou", por "layout do site";
- "o visual do site do concorrente é melhor que o nosso", por "visual do site";
- "o site responsivo do banco não abre no celular", por "site responsivo".

É a mesma causa da A-1 da 1ª revisão: expressão que não diz que o pedido é criar ou mudar um site **do usuário**.
**Correção pedida:** tirar essas expressões, ou exigir junto um verbo de criação ou mudança. Pôr os 7 pedidos como
negativos na bateria.

### M-8 · Teclado: controle fora do Tab passa (Médio)

Os meus 8 mutantes na página, rodados com as funções do próprio `provar.js`:

| Mutante | Resultado |
|---|---|
| R3 anel com 1,46:1 só no tema escuro | pegou |
| R4 Esc não fecha o menu | pegou |
| R6 ponto da maré baixa a 4 px da curva | pegou (4, 4 e 4 px) |
| R8 pausa escondida só no celular | pegou |
| **R5 `tabindex="-1"` na 1ª pergunta** (inalcançável pelo teclado, WCAG 2.1.1) | **escapou**: 23 paradas, e o mínimo é 15 |
| R1 sem `scroll-padding-top` | inválido: o Edge centraliza o foco nesta página, e nenhum foco vai para baixo da barra (vi foco a foco) |
| R2 sem o anel claro no bloco escuro | inválido: o bloco não tem nada focável |
| R7 e R9, planos sem empilhar em 768, 1024 e 1280 px | não é defeito: abri o PNG de 768, fica apertado mas legível |

Placar dos válidos: **4 de 5**.

**Controle positivo:** a checagem de teclado, rodada na página antiga (d6f1ad6), reprova. Acha foco sob a barra com Tab
e com Shift+Tab ("A previsão erra?") e anel de 1,33:1 em "Testar por 14 dias". A A-2 está de fato coberta.

**Correção pedida:** comparar as paradas com a lista de elementos focáveis da página (`a[href]`, `button`, `summary`,
`input` visíveis) e exigir as duas iguais. Isso vale mais que um número mínimo.

### b-4 · Sinônimos (Baixo, aberto em parte)

Agora vão ao designer certo: "crie um website", "lp de vendas", "crie a homepage", "fazer um site", "monte um site…",
"desenvolva um site…" e "crie meu portfólio online".

Continuam sem agente:
- "cria um site pra minha padaria", "criar site para loja", "faz um site pra mim", "site novo para a loja";
- "crie um web site", "crie uma web page";
- "homepage da empresa", "página inicial do meu produto";
- "quero uma landing", "faça a tela de login do meu site", "tela de checkout do meu site".

Além disso, "site para minha clínica" entrou na bateria como pedido que **não** deve chamar designer. Isso trava o erro.
Recomendo trocar o caso para positivo.

### b-8 · Site com dashboard (Baixo, decisão)

"crie um site com dashboard de vendas" vai só ao `designer-sites`, e a descrição dele diz: "Não use para painel, dashboard
ou tela de dados (→ designer-paineis)". Do jeito que está, o pedido chega a quem foi instruído a recusar parte dele.

**Recomendação:** chamar os dois quando houver "dashboard" ou "painel" junto de site. O `designer-sites` faz a página, e o
`designer-paineis` faz o painel dentro dela. Dá para voltar atrás, e não afeta outra área.

### b-9 · Direitos: o que sobrou (Baixo)

**Ficou resolvido:**
- "E quando a tábua erra?" é argumento próprio, nascido da metáfora: previsão, certo × palpite, linha cheia × tracejada.
  Não segue o "por que é pago" do Dinzo.
- Os títulos de preço ("A assinatura também entra na tábua"), das perguntas ("Antes de confiar na tábua") e do fim
  ("Da próxima vez, a maré baixa…", com a página terminando na preamar) também saem da ideia.
- A página inteira tem ideia própria.

**O que ainda segue de perto o Calen,** pelas notas de estudo em `docs/pesquisas/referencias-visuais-2026-11.md`, linhas 51 e 61–62
("para quem quer saber antes quanto vai sobrar"; "mapa de calor do calendário mostra a promessa em um golpe de vista"):
- o produto fictício é o mesmo do Calen, previsão de saldo do mês;
- tem o mesmo calendário de calor, com o título "Um mês inteiro, de relance.";
- e o título do bloco de recursos é **"Feito para quem prefere saber antes."**

Não há texto copiado: a 1ª revisão contou sequências de 5 palavras, e a única mudança de texto desde então foi para longe
do Calen. Mas o conjunto produto + calendário + "saber antes" repete o posicionamento dele.

- Os 3 passos com linha e o bento escuro são convenção, e aparecem nos 3 sites.
- As 4 perguntas são genéricas do nicho. Não as comparei com as do Dinzo: as capturas não estavam mais no computador.

**Correção pedida:** trocar o título do bento por algo da maré.

### b-10 · Tempo de quadro oscila (Baixo)

- Na minha rodada da bancada (cópia, CPU freada 4×, nada mais rodando): 38 de 39, e nenhuma falha por imagem.
- O E5 (confete) deu p95 de 66,6 ms. O autor registrou 16,8 ms, e o quadro diz "PROVADO" sem ressalva; o aviso de
  "perto do limite" está só no C5.

A regra das 2 rodadas seguidas não segura o ruído de tempo.

**Correção pedida:** tempo de quadro pela mediana de 3 rodadas, ou o aviso de oscilação em todo efeito cujo tempo variou
mais de 2× entre rodadas.

### b-11 · Relato do conserto (Baixo)

O mutante "tábua de preços sem empilhar (768 px)" escapava. Em 4e28d29 ele virou "(320 px)", que é pego, e a mensagem diz
que os 2 que escapavam "agora são pegos".

Abri o PNG do mutante em 768 px: fica apertado ("por mês" quebra), mas legível. Então não era defeito, e a troca é
defensável. Só que o relato tem de dizer que o mutante mudou e por quê, e não que foi pego.

## Achados da 1ª revisão: situação

| Id | Situação | Evidência |
|---|---|---|
| A-1 | **fechado** | Os 25 pedidos da tabela da A-1 dão o esperado. "o site de vendas caiu" → nenhum; "melhore a ux do site" → `designer-sites`. "o site da receita federal…" não entrega mais referência de design, só `interface-web.md` ao engenheiro. A bateria lê as referências. O que o conserto quebrou ficou na A-3 e na M-7 |
| A-2 | **fechado** | Página: foco fora da barra, pior anel 5,66:1, menu fecha com link e com Esc. Prova com Tab e Shift+Tab reais, que reprova a página antiga (controle positivo). Método, critério de pronto e eval 11 com teclado |
| M-1 | **fechado** (imagem) | Na minha rodada, 0 reprovação por comparação de imagem; o tempo segue no b-10 |
| M-2 | **fechado** | Bloco reescrito com argumento próprio; regra no agente, no critério de pronto, no eval 3 e no método. O resto está no b-9 |
| M-3 | **fechado** | A1 diz cartão de 72–88% sobre fundo calmo. `materiais.md` sem "sem o véu"; `.vidro` "não é o cartão de landing"; tonal "não use no cartão"; "tire, em tela de produto". Os 3 mutantes do autor são pegos |
| M-4 | **fechado** | Distância do ponto à curva de 0 a 0,4 px nas 3 cenas, em 1440 e 390 px; meu mutante de 4 px foi pego |
| M-5 | **fechado** | 20/20 do autor refeitos, e 4 de 5 meus válidos. O que escapou ficou na M-8 |
| M-6 | **fechado** | Garantia abaixo dos planos. Rolagem lateral 0 e nada espremido em 360, 375, 479, 481, 899, 901, 1119, 1121, 1280 e 2560 px (bordas de 480, 900 e 1120), além das 8 do autor |
| b-1 | **fechado** | A maré vai até o fim: preço na curva, régua, preamar no rodapé. A régua das perguntas é estática e sem rótulo: vai para a lista do usuário |
| b-2 | **fechado** | Quadro sem "49,9 e 16,8" fixo e sem "sem animação" em efeito animado (caso da bateria) |
| b-3 | **fechado** | `polimento.md` com o caminho completo; `checklist-lancamento` cita o `designer-sites` para site e landing |
| b-4 | aberto em parte | ver acima |
| b-5 | **fechado** | "publicado em 2018" e "o mais importante no topo" |
| b-6 | **fechado** | "Técnica" em F2, F4, F7 e F8 (caso da bateria; A1 aponta para `materiais.md`) |
| b-7 | **fechado** | Planos levam a `#fim`; sem `aria-label` em `<p>`; a pausa muda só o nome |

## Mutação no roteamento (cópia, `pacotes.json` mutado, `testar-sites.js`)

Placar: **pegou 5 de 9**. Foram pegos:
- tirar "ux do site";
- devolver "site do produto";
- devolver "efeito vidro" ao `interface`;
- devolver "novo site";
- pôr "meu site" com 2 pontos.

Os 4 que escaparam:
- tirar "app com visual premium", "html" ou "pagina web": a frase do teste continua coberta por outra palavra da lista.
  Isso mostra a sobreposição, e a perda real só aparece com frases de fora (A-3).
- devolver "react" ao `interface`: é parte da correção que recomendo na A-3; a bateria não defende nem um lado nem outro.

Sem mutação, a mesma cópia deu 101 casos e 0 falha.

## PNGs que abri

- Do autor: `site-claro-1440` (inteiro, e recortes da dobra, do preço, das perguntas e do fim), `site-claro-905` (inteiro e
  dobra) e `site-escuro-390` (dobra e fim).
- Meus: `site-claro-320` (meio da página) e os mutantes de planos em 768 e 1024 px.
- Nada cortado nem sobreposto. O ponto do dia 22 está no fundo da curva em 1440, 905 e 390 px.

**Parece premium?**
- Até "E quando a tábua erra?", sim, e próprio.
- O preço como linha da tábua, com a curva da assinatura, é a melhor mudança da rodada.
- As perguntas ainda têm uma régua decorativa que não diz nada, e meia tela vazia à direita no fim (gosto, para o usuário).

## Para o usuário provar (depois das correções)

1. Peça "crie a tela de login do app em react" e "efeito vidro no menu do app": os dois devem chamar o `designer-paineis`.
2. Peça "indique um site para aprender DAX": não deve chamar designer nenhum.
3. Abra `docs/provas/0.8.0-sites/site-preamar.html` em tela cheia, role até o fim e diga se a régua nas perguntas e o fim
   na preamar parecem intenção ou enfeite.
4. Com o teclado, vá ao fim com Tab e volte com Shift+Tab: o foco deve ficar sempre visível e nunca atrás da barra.
5. No celular ou em janela estreita, abra o Menu, toque num link e depois abra de novo e aperte Esc: nas duas vezes, o
   menu deve fechar.

## Limites desta revisão

- As capturas públicas de Finmate, Calen e Dinzo não estavam mais no computador. O b-9 se apoia nas notas de estudo do
  autor e na contagem de palavras da 1ª revisão.
- Sem aparelho real nem leitor de tela. Os evals do agente não foram rodados.
- A bancada rodou 1 vez (não 2); o b-10 vem dessa única rodada.

Placar: autor=engenheiro-software cod=st82 veredito=não B=0 A=1 M=2 b=5 ids=A-3,M-7,M-8,b-4,b-8,b-9,b-10,b-11
