# Vitrine "Clara 35" (prova do padrão "impressiona", designer-sites)

Produto fictício: **Clara 35**, câmera compacta com lente fixa de 35 mm f/1,4. Nada da Motiva, nada de finanças. Preço, prazo e
especificações são de exemplo e a página diz isso no cartão ("preço de exemplo") e no rodapé. Paisagem, lente, diafragma, luzes e
letreiro são **ilustrações geradas por código** (SVG e CSS, com gerador determinístico em `vitrine.js`). Nenhuma imagem, texto ou
código de terceiros. O vidro reaproveita o módulo da prova pv94 (`../e2e/liquido.css` e `../e2e/liquido.js`, sem alteração).

**Abrir:** `index.html` no Edge ou no Chrome (a lente do vidro só existe no Chromium) e rolar devagar do herói até a reserva.

## A ideia (uma frase)
**"Sete vidros entre você e a luz":** a lente é a página. O herói mostra a lente montada; ao rolar, **o mesmo objeto** gira de
lado e se abre em 3D nos seus sete vidros, com o eixo da luz em âmbar até o sensor; depois o diafragma explica o desfoque, e o
mesmo material de vidro vira a navegação e o cartão de reserva.

Efeito dominante: **a lente que se abre ao rolar** (CSS 3D, `animation-timeline` de vista, sem sequestrar a rolagem).
Apoios: revelação dos textos ao rolar (mesma mola) e o Liquid Glass (navegação + cartão). Uma luz (cima à esquerda, ou o ponteiro),
uma curva (a mola curta da receita), um material (vidro), um acento (âmbar da hora dourada).

## Teste de junção (cada elemento, a função; tirar faz falta?)
| Elemento | Serve à ideia porque… | Tirar faz falta? |
|---|---|---|
| Lente 3D (herói) | é o produto e o título ("sete vidros") | sim: sem ela não há ideia |
| Abertura em 3D ao rolar (dominante) | mostra os sete vidros "por dentro"; a lista ao lado tem os mesmos números das etiquetas | sim: é o argumento técnico |
| Eixo âmbar + sensor | é "a luz" do título atravessando os vidros até o sensor | sim: liga título, lista ("entrega a luz reta ao sensor") e cor |
| Revelação ao rolar | os blocos chegam com a mesma mola da lente; nada espera para ler | médio: tirar deixa a página correta, mas solta |
| Diafragma (3 desenhos iguais: dentro da lente, na lista, no controle) | explica o desfoque redondo (11 lâminas) e liga a lente ao quadro f/1,4 | sim |
| Quadro f/1,4 com o letreiro "aberto" em foco | o fundo vira luz; o letreiro é o objeto nítido (e o trocadilho com "abertura") | o letreiro é o elo mais fraco; sem ele o quadro vira papel de parede de bokeh |
| Liquid Glass na barra e no cartão | é o mesmo material dos vidros; o cartão fica "na luz" (a coluna de brilho do mar passa sob a borda) | sim no cartão (é o último vidro entre você e a compra); a barra é convenção da Apple |
| Paisagem | é "a luz": no herói, refletida no vidro frontal e atrás do cartão | sim |
| Âmbar | a hora dourada; só no acento (botão, f/1,4, eixo da luz) | sim |

Ficou de fora de propósito: escolha de cor do produto, grade de recursos, depoimentos, números de mercado (não há prova real).

## Medidas (bateria `node verificar.js tudo` → `png/saida-tudo.txt` e `png/medidas-tudo.json`, 2026-11-02)
Edge sem interface, perfil próprio, uma aba, uma captura por vez, `windowsHide`. **34 de 34 casos ok, 0 erro, saída 0.**
- **Contraste:** 332 textos medidos **pixel a pixel no pior ponto** (sobre paisagem, quadro e vidro, com o texto escondido e o fundo
  capturado) + 41 pares em fundo sólido. Pior pixel **5,28:1** ("Ver a lente por dentro" em 1024 px); pior sólido **5,34:1**
  (legenda do quadro). Cartão de vidro: claro ≥ 8,14:1 e escuro ≥ 7,14:1 em todos os textos (1440 e 390). Contas à parte (`node`, fórmula WCAG):
  anel de foco 5,47:1 (claro) e 9,34:1 (escuro), 7,20:1 sobre o vidro escurecido; trilho do controle 3,29:1 e 4,22:1 (≥ 3:1, 1.4.11).
- **Rolagem lateral:** 0 em 320, 390, 768, 1024, 1440 e 1920, no topo e rolado.
- **Coerência texto × desenho:** 7 vidros, 5 grupos, 11 lâminas, lista cobre 1–7 uma vez; desfoque redondo até f/4 e com a forma do
  diafragma em f/5,6 e f/8 (o texto diz "redondo, de f/1,4 até f/4"). **Mutação** `node verificar.js --mutar` (tira um vidro):
  o verificador **falha** com 4 erros ("texto diz sete elementos, a lente tem 6 vidros"…). O contraste por pixel também falhou de
  verdade antes da correção (a lente cobria o texto em 320 e 768 px: 1:1) e passou depois.
- **Teclado:** 1º Tab = "Pular para o conteúdo"; ordem barra → herói → controle → reserva; anel sólido em todos; nenhum foco sob a
  barra; Shift+Tab volta. Reserva: "Reservada" + ✓ desenhado + aviso falado (`aria-live`) + Desfazer, que devolve o foco.
- **Movimento reduzido:** 0 animações rodando; a lente aparece aberta, parada (estado por IntersectionObserver).
  **Transparência reduzida** e **contraste mais:** `backdrop-filter: none` na barra e no cartão (fosco opaco), textos ≥ 9:1.
- **Sem JS:** 22 textos, cada um posto no meio da tela: 0 escondido (a revelação é CSS puro).
- **Vidro que se adapta:** a barra fica clara sobre o céu (0,80) e **escura sobre o quadro noturno** (0,06), no tema claro
  (`png/vitrine-claro-1440-q3b-barra-sobre-foto-zoom.png`: as luzes e o letreiro entortam na borda da cápsula).
- **Desempenho (CPU 4× mais lenta, headless):** LCP 760 ms (1440) e 588 ms (390), o elemento é o título; **CLS 0,000**.
  Quadros ao rolar a abertura: mediana 33,4 e 33,3 ms, p95 66,6 e 50 ms, 13 e 0 de 90 acima de 50 ms (varia entre rodadas). **[MEDIDO em headless, sem GPU real:
  não vale como prova de 60 fps num aparelho.]** INP não medido (o clique é sintético; os manipuladores são de tempo constante).

## PNGs (todos abertos e conferidos)
| Arquivo | Mostra |
|---|---|
| `png/vitrine-claro-1440.png`, `png/vitrine-escuro-1440.png` (+ `-zoom4x`: base da lente ampliada 4×) | herói: lente 3D (barril, gravação, reflexos dos vidros por dentro) sobre o amanhecer / a hora azul com lua |
| `png/vitrine-claro-390.png`, `png/vitrine-escuro-390.png` | herói no celular (lente presa à base da tela, sem cobrir o texto) |
| `png/vitrine-claro-1440-q1-girando.png` | quadro 1 da rolagem: a lente passa de frente, o barril começa a sumir |
| `png/vitrine-claro-1440-q2-aberta.png`, `png/vitrine-escuro-1440-q2-aberta.png` | quadro 2: os sete vidros abertos, etiquetas = números da lista, eixo da luz até o sensor |
| `png/vitrine-claro-1440-q3-abertura.png`, `png/vitrine-claro-1440-q3b-barra-sobre-foto.png` (+ `-zoom`) | quadro 3: f/1,4 e o desfoque; a barra de vidro escurece sobre a foto |
| `png/vitrine-claro-1440-q4-reservar.png` (já reservado), `png/vitrine-escuro-1440-q4-reservar.png` (+ `-zoom` de cada) | cartão de Liquid Glass na luz; ampliação 2× da borda com a coluna de brilho entortando |
| `png/vitrine-claro-390-q2-aberta.png`, `png/vitrine-escuro-390-q4-reservar.png` | lente aberta e cartão no celular |
| `png/vitrine-claro-1440-reduzido-aberta.png`, `png/vitrine-claro-1440-transparencia-reduzida.png` | movimento reduzido (aberta, parada) e transparência reduzida (cartão opaco) |

## Autocrítica pela régua (`../e2e/propostas/impressionar.md`)
**Camada 1:** 1 INP não medido (pendência, não "não"); 2 hover/foco/pressionado sim; 3 vazio/erro/carregando: não se aplica (sem
servidor), a reserva tem desfazer; 4 teclado sim; 5 coerência sim (medida); 6 contraste no pior ponto sim; 7 390 e CPU fraca sim;
8 reduções sim. **Camada 2:** 9 uma ideia sim; 10 primeiro quadro ocupado sim; 11 título 96 px = 4,6× o corpo sim; 12 um acento sim;
13 material com prova de conteúdo atrás sim (zoom); 14 um dominante e o pico (✓ em 240 ms, mola que chega a 1,0 em ~100 ms) sim;
15 acabamento: quase (ver abaixo); 16 final com desfazer sim.

- **O que um usuário exigente notaria em 5 s:** a lente de verdade no herói, girando ao rolar, e a tipografia grande; no escuro,
  a lua e o brilho do mar. Depois: os vidros abertos são planos (sem espessura de vidro vista de lado).
- **Vidro, "parece Apple ou tentativa?"** (5 traços): entorta na borda sim (zooms do cartão e da barra); aro desigual, mais forte do
  lado da luz, sim; tom muda claro/escuro sim (medido); dá para reconhecer o que está atrás sim (montanhas e brilho do mar no cartão);
  cápsula/raio concêntrico e sombra macia sobre conteúdo real sim. **Passa**, no Chromium.
- **Referência da categoria:** as páginas de produto da Apple (seção de câmera do iPhone). O que ela ainda faz melhor: render 3D
  real (espessura, refração e luz física) e fotografia de verdade como prova; aqui são planos CSS e ilustração.

### Ainda não está no nível (sem esconder)
- Os vidros abertos são discos planos: de lado viram elipses finas com aro; espessura e refração real pediriam WebGL.
- A barra de vidro no topo, sobre o céu claro, lê como "pílula branca"; o Liquid Glass só aparece de verdade sobre o quadro escuro e
  no cartão.
- O letreiro "aberto" usa a fonte do sistema (Segoe no Windows, SF no Mac): muda de aparência entre sistemas.
- A lente do vidro existe só no Chromium; Safari e Firefox recebem o fosco regular (não testado: não há esses navegadores aqui).
  O caminho sem linha do tempo de rolagem **com** movimento (Firefox) também não foi exercitado; com movimento reduzido, sim.

## Decidido
Vidro de landing **pode ir sobre foto** quando o contraste é medido pixel a pixel no pior ponto (decisão de 2026-11-02; aqui ≥ 7,14:1 no cartão).

## Correções depois da revisão final (b-5)
- A coluna de brilho do mar sob a lente era um retângulo de bordas retas (visível no escuro): agora esmaece nas laterais (máscara
  em gradiente) e ficou mais larga e suave.
- A fresta castanha na base da lente (ampliação 4×) era o filete âmbar do barril visto de raspão: o filete saiu e a face frontal
  cresceu 0,8% para cobrir a junta (`png/vitrine-claro-1440-zoom4x.png`, `png/vitrine-escuro-1440-zoom4x.png`).

## Arquivos
`index.html` (estrutura e paisagem em SVG), `vitrine.css`, `vitrine.js`, `verificar.js` (verificador e capturador; `tudo`, `png`,
`checar`, `--so=<trecho>`, `--mutar`, `--png`), `png/` (PNGs, `saida-tudo.txt`, `medidas-tudo.json`).
