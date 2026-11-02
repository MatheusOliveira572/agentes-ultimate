# Liquid Glass na web (modelo)

Aproximação do material descrito na HIG da Apple (`conhecimento/design/apple/materiais.md`, receita e teste "parece Apple"). Provado
na prova pv94 (`docs/provas/0.8.0-design/e2e/`). Texto e código próprios do agentes-ultimate.

## Uso
```html
<link rel="stylesheet" href="liquido.css">
<nav class="lg" data-lg-adapta="[data-lum]">...</nav>          <!-- só controles e navegação que flutuam -->
<img src="capa.jpg" data-lum="0.72" data-lum-grade="0.8,0.7,...">   <!-- luminância de 0 a 1; grade opcional n × n -->
<script src="liquido.js"></script>
```

## O que cada parte faz
- **Lente** (o vidro entorta o que passa atrás, mais forte na borda): `backdrop-filter: url(#svg)` com `feDisplacementMap`. **Só no
  Chromium** (Chrome, Edge): é o único que aceita `url()` no `backdrop-filter`. Nos outros, o material regular (desfoque e saturação),
  sem fingir refração; diga no relatório qual navegador viu o quê.
- **Aro de luz** que segue o ponteiro (`--luz`), e gira devagar com a rolagem sem ponteiro. Congelado com movimento reduzido.
- **Tinta que se adapta**: `data-lg-adapta="<seletor>"` lê o `data-lum` (ou `data-lum-grade`) dos elementos atrás e põe
  `data-tom="claro|escuro"` e `data-lg-misto`. A conta é por amostra (8 × 8 pontos), e cada ponto usa o **elemento mais interno**
  que o cobre: `[data-lum]` aninhados (uma seção com uma foto dentro) não somam duas vezes a mesma área. Antes desta versão, a soma
  ponderada pela área contava os dois e puxava a média para o elemento de fora.
- **Preferências**: transparência reduzida tira a lente e a tinta (fosco opaco); contraste mais deixa sólido com borda.

## Limites
Valores de partida nossos ([ESTIMATIVA]; a Apple não publica CSS). Contraste se mede depois da lente, pixel a pixel, no pior ponto.
Nunca vidro sobre vidro; no celular, lente só em peça pequena.
