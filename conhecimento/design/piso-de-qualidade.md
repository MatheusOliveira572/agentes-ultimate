<!-- Adaptado de pbakaus/impeccable/skill/reference/craft-floor.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução, corte das marcas de regra e do bloco de outro modelo, ajuste ao protocolo (marca e decisões do projeto vencem); alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md). -->
<!-- ref: tema=piso-de-qualidade; palavras=piso de qualidade, acabamento, cara de ia, cara de template, visual amador, antes de editar a tela, premium, visual premium, refinado, sofisticado; agentes=designer-paineis, designer-documentos, designer-sites -->
<!-- teste-ref: sim=a tela está com cara de template feito por IA, dê um acabamento premium | antes de editar a tela, confira o piso de qualidade do visual; nao=lance as notas fiscais de entrada -->
# Piso de qualidade (ler logo antes de editar uma tela ou peça)

Carregue depois que a direção está decidida e construa sem anunciar a lista. A marca e as decisões do projeto passam por
cima de tudo aqui, menos do que está marcado como **proibido**. O seu hábito não passa por cima de nada.

## Conferir (no resultado construído, não na intenção; tudo numa mesma olhada no render)
- **Contraste:** corpo e placeholder ≥ 4,5:1; texto grande ≥ 3:1. Em superfície colorida, o texto secundário puxa o matiz
  da superfície ou do primeiro plano, nunca cinza.
- **Profundidade:** sombra com deslocamento e desfoque suave; halo colorido sem deslocamento é enfeite.
- **Espaço:** grupos apertados, separação generosa, mais espaço acima do título que abaixo. Leia os valores calculados.
- **Tipo:** medida do corpo 65–75 caracteres, título de destaque até 6 rem, espaço entre letras no mínimo −0,04 em (−0,02 a
  −0,03 costuma ler melhor), títulos equilibrados, degraus de tamanho e peso óbvios. Rode o texto real em toda largura e
  corrija o que estoura.
- **Movimento:** um momento pensado, não efeitos espalhados nem a mesma entrada em toda seção. Saída exponencial a partir
  de um estado já visível. Valores e quando não animar: `movimento/INDICE.md`.
- **Estados:** hover, desabilitado, carregando, erro, vazio; mais conteúdo real, controles que funcionam, composição
  responsiva e foco do teclado.
- **Superfícies do navegador:** seleção de texto, cursor de texto, barras de rolagem próprias, anéis de foco, distância
  do sublinhado e números tabulares nas tabelas também levam o desenho.
- **Texto:** a língua do produto; controle diz a ação; erro diz o problema e a saída.
- **Cobertura:** todo requisito do pedido presente e achável em segundos.

## Recusar (padrões da categoria; só o pedido, com as palavras dele, devolve um deles)
Estrutura:
- grade de cartões iguais (ícone + título + texto) como esqueleto da página; cartão dentro de cartão é sempre errado;
- o molde "número grande + rótulo pequeno + estatísticas de apoio + destaque";
- **proibido, sem exceção:** rótulo pequeno ("eyebrow"/"kicker") acima do título; o título carrega o próprio peso;
- números de seção (01 / 02 / 03) quando a sequência não informa nada;
- modal para tarefa que não precisa interromper nem proteger o foco.
Superfície:
- texto em gradiente (ênfase vem de peso ou tamanho);
- **vidro e desfoque como enfeite** em vez de efeito com função (onde usar e como fazer: `apple/materiais.md`);
- borda colorida lateral de mais de 1 px em cartão, item de lista, aviso ou alerta;
- sombra dura deslocada (`4px 4px 0`) fora de um mundo neobrutalista de fato;
- minigráficos, anéis de progresso e retângulos arredondados com sombra no lugar de conteúdo;
- fonte monoespaçada como fantasia de "técnico" (ela é para código, dado e medida);
- emoji ou caractere Unicode no lugar de um sistema de ícones (ícones de uma biblioteca real ou SVG próprio, mesmo traço e
  peso);
- máscara geométrica imitando contorno orgânico de foto;
- claro ou escuro escolhido pela categoria; escolha pela cena de uso (quem, onde, sob que luz).
Mais:
- elevação declarada uma vez só: borda **ou** sombra (borda de 1 px sob sombra larga é o "cartão fantasma"); raio de
  cartão 12–16 px; pílula só em controle pequeno;
- ilustração real ou nenhuma (cena em SVG "rabiscada", granulado com `feTurbulence` lê como amador; SVG fazendo geometria
  precisa, tudo bem);
- fundo é superfície; listras e grades só com um mapa, planta ou régua de verdade por baixo;
- número, afirmação e configuração vêm de fonte verdadeira; valor ilustrativo é rotulado como tal.

O piso cuida da mecânica e nunca escolhe a direção. Com tudo verde, gaste a página no mundo visual escolhido; na dúvida
entre "refinado" e "comprometido com a direção", comprometa.
