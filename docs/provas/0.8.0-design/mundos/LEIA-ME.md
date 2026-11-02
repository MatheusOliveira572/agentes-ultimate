# Mostruário dos 10 mundos visuais (mt106)

A mesma tela fictícia (Estação Maré: título, frase, número, lista de 3 itens, 2 botões e o gráfico das últimas 6 horas)
desenhada em cada mundo de `conhecimento/design/mundos/`. Abra `index.html` no Edge ou no Chrome (a lente do vidro só
existe no Chromium). `visao-geral.html` junta os 10 PNGs numa folha.

| Arquivo | Para que serve |
|---|---|
| `index.html`, `mostruario.css`, `mundos.css`, `mostruario.js` | o mostruário (moldura neutra + um bloco por mundo; dados, gráficos e o mar renderizado do mundo Apple feitos por código) |
| `molas.css` | as 10 molas em `linear()`, geradas por `gerar-molas.js` a partir de `modelos/mola-linear.js` |
| `verificar.js` | capturas a 2× pelo Edge sem interface (uma por vez) e as checagens |
| `png/` | `<mundo>.webp` (2464 px de largura) e `visao-geral.webp` |

## Como rodar
- `node gerar-molas.js`: reescreve `molas.css`.
- `node verificar.js png` (ou `visao`, `checar`, `fonte-pixel`, `tudo`); `--so=<mundo>` limita a um mundo.
- `node verificar.js checar --mutar=numero|contraste|foco|grafico|quebra|desenho` e `fonte-pixel --mutar=pixel` **têm de falhar**.

## O que `checar` confere
Fontes carregadas por família; os 14 campos iguais nos 10 mundos e o gráfico terminando no número da tela (e desenhado no
tamanho que ocupa); contraste pixel a pixel sob o desenho das letras (normal, hover forçado e botão ligado); texto cortado
ou sobre texto (caixa da tinta, não da linha); botão sem quebra de linha; anel de foco (pixels que mudam com ≥ 3:1, ao
menos 2 px de perímetro); ordem do Tab; só `transform`/`opacity` animados; molas com ≥ 30 pontos; movimento reduzido só
esmaece; sem rolagem lateral em 1440 e 390. `fonte-pixel` mede em que tamanhos a VT323 fica nítida (25, 50, 75, 100, 125 px).

Fontes do Google Fonts (SIL OFL 1.1), carregadas pela rede; nada de texto, imagem ou código de terceiros.
