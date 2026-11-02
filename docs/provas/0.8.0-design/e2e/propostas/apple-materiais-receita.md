<!-- Proposta pv94: troca a seção "Como fazer na web" de conhecimento/design/apple/materiais.md pela receita abaixo
     (o resto do arquivo fica). Implementação provada: docs/provas/0.8.0-design/e2e/liquido.css e liquido.js (propor mover
     para modelos/liquid-glass/). Valores marcados [ESTIMATIVA]: a Apple não publica CSS. -->
## Como fazer na web: Liquid Glass, não "glassmorphism"
O usuário quer o vidro da Apple, **não uma tentativa**. O fosco antigo (desfoque grande + branco translúcido + borda cinza)
**não** é Liquid Glass. O material da HIG tem 5 traços; cada um tem a sua receita:

| Traço (HIG › Materials › Liquid Glass) | Receita web | Valor de partida [ESTIMATIVA] |
|---|---|---|
| **Lente:** entorta o que passa atrás, mais forte na borda | `backdrop-filter: url(#f)` com `feImage` (mapa de deslocamento gerado para o tamanho e o raio da peça: R/G = normal da borda × força, curva suave) → `feDisplacementMap` → `feGaussianBlur` → `feColorMatrix saturate` | aro = 40% do raio + 6 px (até 22 px); força 26; desfoque 3–4 px sobre foto, 6–8 px sobre texto; saturação 1,7 |
| **Aro especular** que reage à luz | anel de 1,25 px (máscara `content-box` × `border-box`) em gradiente cujo ângulo `--luz` segue o ponteiro (e gira devagar com a rolagem); brilho interno radial no lado da luz | aro 0,95 no claro, 0,55–0,70 no escuro |
| **Tinta que se adapta** ao que passa atrás | luminância real do conteúdo de trás (grade 4 × 4 por foto, só as células cobertas) → `data-tom="claro|escuro"`; fundo misto engrossa a tinta | limiar 0,30; misto se Δ > 0,25; tinta clara 0,58–0,66 (misto 0,78), escura 0,56–0,66 (misto 0,72) |
| **Forma em cápsula concêntrica** | raio = altura/2; seleção interna com raio externo − recuo | recuo 4–10 px |
| **Camadas que se separam e se juntam** | ex.: abas que se recolhem na selecionada ao rolar para baixo e a busca que se aproxima, com a mola do projeto | 520 ms, mola curta |

Reserva honesta: a lente só existe no Chromium (o `url()` no `backdrop-filter`); nos outros, o material regular
(`blur(14px) saturate(180%)`) **sem fingir refração**, e o relatório diz qual navegador viu o quê.

## Teste "parece Apple ou parece tentativa?" (com o PNG e uma ampliação 2× do vidro)
1. Na ampliação, o conteúdo de trás **entorta** junto da borda (listras e horizontes curvam).
2. O aro de luz é visível e **não uniforme** (mais forte do lado da luz).
3. O tom **muda** quando passa foto clara e escura (capture rolado sobre as duas).
4. Dá para **reconhecer** o que está atrás (desfoque baixo); não é um leitoso uniforme.
5. Cápsula ou raio concêntrico, sombra macia, flutuando sobre conteúdo real (nunca sobre fundo liso).
Falhou 2 ou mais: é tentativa; refaça antes de entregar.

## Acessibilidade (acrescentar à seção existente)
- O contraste se mede **depois** da lente, pixel a pixel, no pior ponto de cada texto (a lente traz para trás do rótulo o
  que estava fora dele). Falhou: tinta mais grossa (misto), mais desfoque sobre texto, nunca texto menor.
- `prefers-reduced-transparency` e `prefers-contrast: more` tiram a lente e a tinta (fosco opaco ou sólido com borda);
  `prefers-reduced-motion` congela o aro na luz padrão.
- Nunca vidro sobre vidro: aviso, menu e folha abrem **fora** de outra peça de vidro (checagem de sobreposição).
