<!-- Adaptado de jakubkrehel/skills/skills/better-typography/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte, ajuste ao protocolo (a marca do projeto vence); alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=tipografia; palavras=tipografia, fonte, fontes, tipo de letra, escala tipografica, entrelinha, altura da linha, espacamento entre letras, hierarquia do texto, titulos e corpo, tamanho da fonte, formatar documento; agentes=designer-documentos, designer-interface, designer-paineis, engenheiro-software, designer-sites -->
<!-- teste-ref: sim=acerte a tipografia do relatório: escala, entrelinha e hierarquia dos títulos | a fonte do slide está pequena e a altura da linha apertada, revise a tipografia; nao=reconcilie os lançamentos do banco com o razão -->
# Tipografia: como o texto aparece (escala, espaço, carga, quebra, pontuação)

As palavras são do `escrita/texto-de-interface.md`; contraste se mede em `../cor/INDICE.md` e se aprova em
`../acessibilidade/INDICE.md`. **A fonte e a escala da marca do projeto vencem**: nunca proponha outra fonte sem pedido.

## Medido × preferência
São **achados** quando faltam: entrelinha sem unidade; peso ≥ 400 abaixo de 18 px; medida de 60–75 caracteres; campo de
16 px no iOS; números tabulares em valor que muda. São **heurísticas** (só aponte onde quebram a escala do próprio
projeto): espaçamento entre letras, pares de fontes, razão da escala.

## Regras
- **Menos fontes, tamanhos e pesos:** raramente mais de 3 fontes (página de marketing pode ter mais que app). Peso e
  tamanho fazem hierarquia; cada um a mais a dilui. Par com contraste (serifa no título, sem serifa no corpo); duas quase
  iguais parecem erro.
- **Peso:** abaixo de 18 px, 400 ou mais; 100–300 só a partir de 28 px, conferido contra o fundo.
- **Carregue as faces que o desenho usa:** o navegador sintetiza negrito/itálico que a família não tem e deforma a letra.
  Desligue a síntese só depois de conferir a pilha de reserva, e só o modo indesejado.
- **Propriedade antes de código bruto:** `font-weight: 650` (não `font-variation-settings: "wght"`);
  `font-variant-numeric: tabular-nums` (não `"tnum"`). `font-optical-sizing: auto`.
- **Escala com nomes por uso:** poucos tamanhos, cada um com sua entrelinha e peso (um papel = uma decisão). Em equipe,
  nomes por uso (`texto-corpo-p`). Títulos descem de tamanho com o nível; o subordinado nunca supera o pai.
- **Entrelinha por papel:** destaque 1,1; títulos 1,2–1,3; corpo 1,5–1,6; sempre sem unidade. Texto de 3+ linhas, pelo
  menos 1,4, mesmo em linha apertada.
- **Espaço entre letras:** títulos ≥ 24 px, −0,01 a −0,02 em; rótulos em maiúsculas ≤ 14 px, +0,05 em; corpo 0. Sempre
  em `em`. Kerning é da fonte e fica ligado (`font-kerning: none` nunca é correção).
- **Medida:** texto corrido com 60–75 caracteres por linha.
- **Quebra:** `text-wrap: balance` em títulos e descrições curtas (nunca em parágrafo); `text-wrap: pretty` em parágrafo
  (evita palavra sozinha na última linha); `overflow-wrap: break-word` onde um link ou ID pode escapar;
  `white-space: nowrap` em rótulo e selo. Alinhamento `start`; justificado só em layout editorial pensado.
- **Números tabulares** em contador, cronômetro, preço e coluna numérica (nada pula); no texto corrido, proporcionais.
- **Truncar com volta:** uma linha (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) ou várias
  (`-webkit-line-clamp`), sempre com um jeito de ver o texto inteiro (dica, expandir).
- **Caixa natural e pontuação tipográfica:** guarde o texto em caixa normal e mude com `text-transform`; aspas curvas
  “ ”, travessão —, meia-risca –, reticências …, espaço não separável onde a quebra separaria número e unidade.
- **Sublinhado da fonte:** `text-underline-position` e `text-decoration-thickness: from-font`.
- **Campo no celular com 16 px** (o iOS dá zoom abaixo disso).
- **Pisos:** texto corrido começa em 16 px; interface pode ir a 14 px (campos, menus) e 13 px (legendas); raramente abaixo
  de 12 px. `font-size` em `rem`, para o tamanho do leitor valer.
- **Suavização** uma vez na raiz; `lang` e `dir` certos; `text-box: trim-both cap alphabetic` em botão e selo (opcional);
  texto decorativo em CSS, não em imagem; texto útil sempre selecionável.

## Documento e slide (designer-documentos)
Mesmas regras em pt: corpo de relatório 10–12 pt com entrelinha 1,3–1,5; títulos em 2–3 níveis claros; tabelas com
números tabulares e alinhados à direita, com a unidade no cabeçalho; slide com no máximo 2 tamanhos de texto além do
título e corpo legível a 3 m (≈ 18 pt ou mais).

## Antes de terminar
| Padrão | Correção |
|---|---|
| peso sem a face carregada | carregar a face ou usar um peso que a família tem |
| `font-synthesis: none` no texto da interface | tirar; desligar só o modo indesejado |
| `font-variation-settings` para peso ou `opsz` | `font-weight`; deixar `font-optical-sizing: auto` |
| `font-feature-settings: "tnum"` | `font-variant-numeric: tabular-nums` |
| entrelinha em px/rem | número sem unidade |
| entrelinha apertada em texto que quebra | 1,4 ou mais |
| espaço entre letras em px | o mesmo em `em` |
| corpo em px | `rem` |
| peso 100–300 abaixo de 18 px | 400 ou mais |
| `balance` em parágrafo | `pretty` |
