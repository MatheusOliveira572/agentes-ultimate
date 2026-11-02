<!-- Texto próprio do agentes-ultimate, a partir do estudo visual de 2026-11-01 (docs/referencias-visuais-2026-11.md): só padrão e proporção, nada copiado dos sites estudados. -->
<!-- ref: tema=site-cartao-metrica; palavras=cartao de metrica, heroi de dado, numero em destaque, simbolo e centavos; agentes=designer-sites, designer-paineis, engenheiro-software -->
<!-- teste-ref: sim=desenhe o cartão de métrica do saldo | quero um número em destaque com símbolo e centavos menores; nao=calcule o ponto de equilíbrio do produto -->
# R18. Cartão de métrica (herói de dado)

Repertório, não molde: use, combine, corte ou vá além, a partir da direção própria do projeto. Medidas sem marca são [ESTIMATIVA: ponto de partida nosso]. Regras que valem para todas: `INDICE.md`.

- **Quando usar:** um número decide; serve para o mockup da landing e para a tela do produto.
- **Estrutura:** rótulo, valor grande, período, variação com **sinal, seta e cor**; opcional: linha ou barra de progresso.
- **Medidas:** valor 32–56 px, `tabular-nums`; símbolo e centavos 45–60% do inteiro; rótulo 12–14 px; variação 12–14 px; preenchimento
  20–28 px; raio 14–20 px; sombra 0 1–8 px a 0,04–0,10, ou borda de 1 px.
- **Estados:** vazio ("sem dados no período"), carregando (esqueleto do tamanho do valor), erro, número enorme, negativo.
- **Celular:** valor nunca corta; abrevia antes de quebrar.
- **Acessibilidade:** cor não é o único sinal (WCAG 1.4.1); valor completo em `aria-label` quando abreviado.
- **Erro comum:** precisão falsa, período omitido, variação sem base de comparação.

**Prova:** usada na página de `docs/provas/0.8.0-sites/` (site-preamar.html); os valores escolhidos ali passaram nas checagens de `resultado.json`. A faixa acima continua [ESTIMATIVA].
