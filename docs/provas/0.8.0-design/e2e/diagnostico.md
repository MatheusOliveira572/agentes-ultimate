# Diagnóstico: por que o "visual premium" da prova pv92 ficou "normal" (pv94)

Pedido do usuário (2026-11-02): "achei bem normal as telas, nada que impressionam" e, depois, "quero que vc me entregue algo
que impressiona e esse seja o padrão do nosso plugin". Este arquivo separa a falha de execução da falha das instruções e
propõe as mudanças. **Nada aqui foi aplicado nos agentes:** o engenheiro aplica depois da aprovação do usuário.

## 1. Em 5 linhas
1. A tela "depois" saiu do piso (tirou os vícios do "antes") e parou nele: limpa, correta e sem nenhuma ideia própria.
2. Execução: conteúdo encolheu e os números não fecham; 1440 px com ~45% da altura vazia; nenhuma estrutura de app.
3. Instruções: o modo Operar ("a expressão perde", "movimento quase nenhum") virou contenção, sem contrapeso de ambição.
4. Instruções: o piso é 90% lista de recusas e nada no método de app pede ideia, régua de "impressiona" ou comparação.
5. Roteamento: "redesenhe meu app" cai no `designer-paineis`, um agente de BI (FT, IBCS, Power BI) sem método de app.

## 2. (a) Execução fraca (quem construiu)
| Onde | O que se vê | Regra que já existia |
|---|---|---|
| Caso A, contagem | "Hoje: 3 de 6 feitas · 1 atrasada" sobre uma lista de **5** tarefas com **1** feita; "Fechar o mês" sumiu; "atrasada" foi inventada | piso: "número vem de fonte verdadeira"; agente: gabarito por script que confere as somas |
| Caso A, 1440 px | lista termina em y≈505 de 900: ~45% da altura sem nada; sem navegação, sem estado do sistema, sem barra lateral; parece formulário, não app | apple/fundamentos §layout ("a função é a mesma em qualquer tamanho; o arranjo muda") |
| Caso A, tipo | escala 22/28/17/15/13 px, degraus tímidos; o título da tela tem 22 px | piso: "degraus de tamanho e peso óbvios" |
| Caso A, cor | azul de sistema (#0a66d8) e cinza #f5f5f7 da Apple, sem escolha; escuro = preto puro com #1c1c1e (padrão iOS copiado) | piso: "claro ou escuro escolhido pela cena", fundamentos: "é molde?" |
| Caso A, vidro | barra de vidro sobre fundo liso: na captura nada passa por trás; o efeito não aparece nem tem função | piso: "vidro como enfeite" |
| Caso A, interação | marcador não marca nada; nenhum momento de concluir; nenhum atalho; uma entrada de 180 ms e escala ao pressionar | polimento §4 (todos os estados), fundamentos (Encanto) |
| Caso B, produto | 24 cartões iguais com legenda (o 1º item da lista de recusas do piso); 8 gradientes repetidos 3 vezes; barra de abas de celular no 1440 | piso: "grade de cartões iguais"; HIG layout |
| Conferência | 17 PNGs "abertos e vistos" só atrás de defeito mecânico; ninguém perguntou "isto impressiona?" | não havia régua (ver b) |

## 3. (b) O que no plugin empurra para o seguro
1. **`modos/operar.md` lido como contenção.** "Leitura rápida, consistência, expectativa nativa e a cena real de uso
   **vencem a expressão**; a marca vive nos detalhes, não na estrutura"; "Movimento: quase nenhum"; "destaque só no título
   da tela e no número principal". Tudo certo isolado, mas sem a frase que diz onde está a ambição num app (densidade bem
   resolvida, tipografia, estados, teclado, o momento de concluir, material em camadas), o resultado natural é o mínimo.
   O próprio arquivo avisa que "a falha não é ser sem graça", mas não dá régua para o oposto.
2. **Piso tratado como teto.** `piso-de-qualidade.md` tem 9 linhas de "conferir" e ~20 de "recusar"; a única frase de
   ambição é a última ("na dúvida entre refinado e comprometido, comprometa"). Quem tira os 20 vícios chega a uma tela
   vazia e correta e acha que terminou. Algumas recusas ("minigráficos, anéis de progresso", "número grande + rótulo
   pequeno") sem a ressalva "quando são o dado" desencorajam justamente a peça-assinatura de um app.
3. **Falta o passo de ambição no método.** `metodo.md` vai de "Direção" a "Construir" sem pedir a ideia única, as
   referências da categoria nem o teste do recorte. Isso só existe em `sites-premium/metodo-de-montagem.md` (passo 2), que
   é só de site e está noutro ramo. E `tela-nova/INDICE.md` manda fazer 3 comps e **não escolher**: num pedido de uma vez
   ("redesenhe"), sem comps, o agente cai no padrão mais seguro em vez de se comprometer com uma direção e declará-la.
4. **Nenhuma régua escrita de "impressionar".** Todas as checagens do `designer-paineis` e do `revisor` são mecânicas
   (contraste, ±2 px, rolagem, somas). `critica/INDICE.md` tem o "veredito de especificidade", mas só no fluxo de crítica,
   que ninguém chama ao construir. Sem régua, "impressiona?" vira gosto e é pulado.
5. **Densidade.** Nada diz que o primeiro quadro em 1440 px precisa estar ocupado por estrutura de produto; o
   `layout/INDICE.md` só trata de corte, sobreposição e crescimento.
6. **Movimento em app.** A tabela de frequência do Emil ("dezenas por dia: tirar ou reduzir") somada ao "quase nenhum" do
   Operar zera a microinteração, inclusive no pico emocional do produto (concluir uma tarefa), que a regra do pico e do
   fim (`critica/INDICE.md`) diz ser o que fica na memória.
7. **Vidro sem prova de função.** `apple/materiais.md` diz onde pôr vidro, mas não manda conferir que, na captura, há
   conteúdo passando por trás; sem isso, vidro sobre fundo liso passa como "certo".
8. **Roteamento.** `designer-sites` manda "tela de dados e de tarefa → designer-paineis". O `designer-paineis` é de BI:
   referências FT, Power BI, IBCS; método de contagens, notação de cenários e gabarito com somas. Nada sobre app.

## 4. Propostas de mudança no conhecimento (texto pronto)
**P1. Arquivo novo `conhecimento/design/impressionar.md`** (régua comum dos 3 designers e do revisor; texto pronto em
`propostas/impressionar.md`).

**P2. `modos/operar.md`, depois de "O teste":**
> **Onde mora a ambição num app.** Quieto não é pobre. A ousadia vai para: (1) uma peça-assinatura que é o próprio dado
> (o dia como linha do tempo, o progresso como peças clicáveis); (2) tipografia com um degrau de exibição (≥ 2,5× o
> corpo) no título e no número principal; (3) densidade de produto real, sem faixa morta no 1440; (4) estados e teclado
> desenhados (atalhos visíveis, seleção, foco, vazio); (5) o momento-pico do produto (concluir, enviar, salvar) com uma
> resposta desenhada de até 250 ms. Régua: `../impressionar.md`.

**P3. `modos/operar.md`, Movimento:** trocar "quase nenhum; nada nas interações frequentes" por "nada decorativo e nada
nas interações de navegação frequentes; **o momento-pico** (concluir, enviar, salvar) ganha uma resposta desenhada de até
250 ms, interrompível, com versão reduzida".

**P4. `piso-de-qualidade.md`, primeira linha depois do título:**
> **Piso, não teto.** Passar aqui é obrigatório e não basta: uma tela que só tirou os vícios está pronta para começar.
> A régua de pronto é `impressionar.md`.
E nas recusas de minigráfico e "número grande + rótulo": acrescentar "como enfeite; quando cada parte é um item real,
clicável e ligado à lista, é dado".

**P5. `metodo.md`, nova etapa 2b "Ambição" (antes de Construir), valendo para app, site e documento:**
> **2b. Ambição:** escreva em 3 linhas: a tese da tela; **a ideia** pela qual ela será lembrada (vem do produto: se serve
> ao concorrente, ainda não é); as 3 referências da categoria e o que cada uma faz de excelente que você vai igualar ou
> superar. Pedido sem "me dê opções": **comprometa-se com uma direção forte e declare-a**; as alternativas vão no fim do
> relatório, não no lugar da escolha. → `impressionar.md`.

**P6. `tela-nova/INDICE.md`, passo 3:** "Três opções **quando o usuário pediu opções** ou o projeto é novo e caro de
mudar; num pedido direto de redesenho, uma direção comprometida + as 2 alternativas descritas em 2 linhas cada."

**P7. `layout/INDICE.md`, Regras:** "**Primeiro quadro ocupado:** no computador (1440 × 900), app mostra a estrutura
inteira (navegação, conteúdo, detalhe, estado do sistema); faixa vazia acima de ~25% da altura só se for intencional e
declarada."

**P8. `apple/materiais.md`:** trocar "Como fazer na web" pela receita do **Liquid Glass de verdade** (lente por
`feDisplacementMap`, aro especular que segue a luz, tinta que se adapta pela luminância de trás, cápsula concêntrica,
camadas que se separam), com os valores, a reserva honesta fora do Chromium e o **teste "parece Apple ou parece
tentativa?"** em 5 itens com ampliação 2×. Texto pronto: `propostas/apple-materiais-receita.md`. O módulo provado
(`liquido.css`/`liquido.js` desta pasta) deveria virar `modelos/liquid-glass/`. O fosco atual da receita (desfoque 16 px
+ branco 55%) é exatamente o "glassmorphism" que o usuário recusou.

**P8b. `sites-premium/efeitos/`:** efeito novo "H. Vitrine Apple" (Liquid Glass + 3D + revelação ao rolar costurados por
uma ideia, com valores, limites e prova): `propostas/sites-efeito-vitrine-apple.md`.

**P9. Roteamento:** "redesenhe meu app/tela de app" vai a um papel de **designer de interface** (app e produto), não ao
designer de BI. Duas saídas: (a) criar `fonte/agentes/design/designer-interface.md`; (b) enquanto não existir, o
`designer-paineis` ganha o ramo "App ou tela de produto" (anexo B). Recomendo (a): o método de BI (notação IBCS, somas,
Power BI) e o de app (teclado, momento-pico, material) disputam as mesmas 90 linhas.

## 5. "Impressiona" como padrão de todos os agentes de design
Duas camadas, uma junção (texto completo em `propostas/impressionar.md`, a partir da régua de 14 itens da pesquisa
`docs/pesquisa-impressionar-2026-11.md` §5 e desta prova):
- **Camada 1, obrigatória:** funciona, responde, acessível, estados, teclado, coerência depois de cada ação, contraste no
  pior ponto, 390 px, as 3 preferências. Um "não" e não entrega.
- **Camada 2, impressiona (não é opcional):** uma ideia, composição de uma olhada com o primeiro quadro ocupado,
  tipografia com intenção, cor com papel, material com função (Liquid Glass fiel), movimento com propósito e o
  momento-pico, acabamento, final memorável. Dois "não" e há novo passe (até 3).
- **A junção (o gosto do usuário):** cara de Apple + Liquid Glass + 3D + revelação ao rolar, **costurados por uma ideia**:
  um efeito dominante; uma mola, uma luz, um material e uma paleta para todos; **teste de junção**: cada elemento com 1 linha
  de função na ideia, e o que não faz falta sai ("sem sopa de letrinhas").
- **3D e revelação ao rolar:** em **site**, camada de impacto **por padrão** (sem sequestrar a rolagem, texto visível sem JS,
  ≤ 1 dominante, desempenho medido); em **app**, só onde explicam o movimento; em **documento**, nada.
- **Critério de pronto** dos 3 designers: 1ª linha "passa na régua e no teste de junção"; com vidro, "passa no teste
  parece Apple, com a ampliação 2× anexada".
- **Passo de ambição** antes de construir: tese, ideia, 3 referências da categoria, direção comprometida.
- **Autocrítica escrita** depois dos PNGs: os itens com sim/não; "o que um exigente notaria em 5 s"; a referência da
  categoria e o que ela ainda faz melhor; o que ficou abaixo vai declarado.
- **Revisor:** roda a régua antes de ler a autocrítica; camada 1 ou 2+ itens da camada 2 = VERMELHO; 1 item ou elemento
  sem função na ideia = AMARELO com a correção.

## 6. Anexo: mudanças prontas para o engenheiro aplicar (formato das fontes)
Aplicadas no im99; a pasta `propostas/` saiu na limpeza da 0.8.0 (os textos estão nos destinos e no histórico do git).

| Arquivo proposto | Vai para | Linhas da parte específica |
|---|---|---|
| `propostas/designer-paineis.md` | `fonte/agentes/bi/designer-paineis.md` (ganha o ramo de tela de app: ambição, junção, momento-pico, régua) | 81 (≤ 90) |
| `propostas/designer-sites.md` | `fonte/agentes/design/designer-sites.md` (ramo lote-sites) | 77 (≤ 90) |
| `propostas/designer-documentos.md` | `fonte/agentes/documentos/designer-documentos.md` | 71 (≤ 90) |
| `propostas/revisor-trecho.md` | `fonte/agentes/nucleo/revisor.md` (só os trechos; +5 linhas, fica em ~87) | — |
| `propostas/impressionar.md` | `conhecimento/design/impressionar.md` (novo, com `ref` e `teste-ref` para o roteador) | — |
| `propostas/apple-materiais-receita.md` | `conhecimento/design/apple/materiais.md` (troca a seção da web, acrescenta o teste e a acessibilidade) | — |
| `propostas/sites-efeito-vitrine-apple.md` | `conhecimento/design/sites-premium/efeitos/vitrine-apple.md` + linha no índice | — |

**"Referências sob demanda"** (não contam nas 90 linhas): manter as atuais e acrescentar nos 3 designers "Quando o pedido
for premium, bonito, impressionar ou redesenho, leia `impressionar.md`"; no `designer-sites`, também "Quando montar a
camada de impacto, leia `sites-premium/efeitos/vitrine-apple.md`"; no `designer-paineis`, trocar "Quando o pedido for
amplo" para ler `metodo.md` **e** `impressionar.md`. P2–P7 e P9 (seção 4) entram no mesmo lote.

**Evals sugeridos:** "redesenhe meu app com visual premium" → o relatório tem a ideia numa frase, o teste de junção, a
autocrítica e uma ampliação do vidro; mutação: entregar a v1 desta pasta (`caso-a-depois.html`) tem de reprovar nos itens
9, 10, 12 e 14 da régua.
