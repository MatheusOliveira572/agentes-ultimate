<!-- Adaptado de jakubkrehel/skills/skills/better-layout/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte; o grid e a escala do projeto vencem; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=layout; palavras=layout, espacamento, alinhamento, grade, grid, agrupamento, hierarquia visual, responsivo, quebra de layout, margens, ordem de leitura; agentes=designer-paineis, designer-documentos, engenheiro-software -->
<!-- teste-ref: sim=o layout da página está desalinhado e o espaçamento entre os grupos confuso | revise o grid e o alinhamento do documento, com margens e ordem de leitura; nao=calcule a provisão de férias -->
# Layout: agrupar, alinhar, espaçar, aguentar o pior caso

Corrija no sistema de estilos do projeto; os números abaixo valem só onde o projeto não tem escala de espaçamento. Achado
precisa de falha que dá para mostrar (corte, sobreposição, ordem errada), não de gosto. Áreas de toque e foco:
`../acessibilidade/INDICE.md`; raio e sombra: `../detalhes-interface.md`; medida e truncamento: `../tipografia/INDICE.md`.

## Regras
- **Agrupe com espaço,** depois com forma de fundo, e só por último com linha. O espaço entre grupos é pelo menos 2× o de
  dentro do grupo (8 dentro → 16 ou mais entre).
- **Controle se distingue do conteúdo:** fundo, borda, sublinhado ou uma zona fixa (barra de ferramentas).
- **Poucas bordas de alinhamento,** tudo nelas; um degrau da escala por nível de aninhamento (16 px é um bom padrão).
- **Propriedades lógicas** no que espelha em idioma da direita para a esquerda (`margin-inline-start`, `text-align:
  start`); esquerda/direita físicas só para geometria física.
- **Ordem pela importância:** o mais importante no alto e na borda de início; numa linha, o que identifica vem antes, os
  metadados e as ações depois. A ordem visual é a do DOM.
- **Uma ação principal por tela;** mais de 3 secundárias vão para um menu. Melhor uma tela curta que leva ao detalhe que
  uma longa com tudo no topo.
- **Indique o conteúdo escondido:** o próximo item aparece 16–32 px além da borda de rolagem, ou um controle de abrir.
  Valor truncado que o usuário precisa tem caminho até o texto inteiro (também pelo teclado).
- **Controle sem borda pede mais folga:** 12 px entre controles com borda ou preenchidos; 24 px entre os glifos visíveis
  de controles só texto/ícone.
- **Botão de largura total dentro das margens** (≈ 16 px no celular); de borda a borda só seguindo o padrão da plataforma.
- **Conteúdo sangra, controle flutua:** fundo e mídia até a borda; texto e controles dentro das margens e áreas seguras.
  Cabeçalho fixo: `scroll-padding-block-start` com a altura dele.
- **Ponto de quebra vem do conteúdo,** não de aparelho; mantenha o layout largo até ele deixar de caber; consulta de
  contêiner para o componente; teste a menor e a maior largura suportadas.
- **Planeje crescimento:** tradução aumenta o texto (o rótulo de uma palavra é o mais arriscado); `max-width` e
  `min-height`, nunca largura ou altura fixas em caixa com texto. Ação crítica nunca onde zoom ou rolagem a cortam.

## Antes de terminar
| Padrão | Correção |
|---|---|
| trilha `1fr` ou filho flex com texto longo ou tabela larga estourando | `minmax(0, 1fr)`; `min-width: 0` no filho |
| `width: 100vw` | `width: 100%` (100vw inclui a barra de rolagem) |
| `height: 100vh` em painel de altura cheia no celular | `100dvh` |
| `height:` fixo em caixa com texto | `min-height`, ou `max-height` com rolagem |
| `@media (max-width)` dentro de componente reutilizável | `@container` no pai |
| `env(safe-area-inset-*)` sem `viewport-fit=cover` | acrescentar a meta tag |
| cabeçalho fixo sem `scroll-padding-block-start` | definir com a altura dele |

## Relatório
**ALTO:** bloqueia conteúdo ou ação numa largura suportada; corte ou sobreposição em 320 px ou zoom de 200%; truncado sem
caminho até o valor; ordem visual diferente da ordem de leitura. Formato e veredito como em `../cor/INDICE.md`
(Antes/Depois/Por quê, `arquivo:linha`, Bloquear/Aprovar).

## Documento e slide
Mesma lógica: margens e colunas fixas do modelo; espaço entre seções ≥ 2× o espaço entre parágrafos; um ponto focal por
slide; alinhamento às mesmas guias em todas as páginas; nada encostado na borda de corte.
