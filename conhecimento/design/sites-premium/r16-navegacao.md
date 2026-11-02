<!-- Texto próprio do agentes-ultimate, a partir do estudo visual de 2026-11-01 (docs/pesquisas/referencias-visuais-2026-11.md): só padrão e proporção, nada copiado dos sites estudados. -->
<!-- ref: tema=site-navegacao-site; palavras=navegacao do site, menu do site, navegacao flutuante, barra do site; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=desenhe a navegação do site com menu fixo | quero uma navegação flutuante em pílula no menu do site; nao=faça o rateio das despesas por centro de custo -->
# R16. Navegação de site

Repertório, não molde: use, combine, corte ou vá além, a partir da direção própria do projeto. Medidas sem marca são [ESTIMATIVA: ponto de partida nosso]. Regras que valem para todas: `INDICE.md`.

- **Quando usar:** sempre que houver rolagem longa, em uma das formas: barra plena ou pílula flutuante.
- **Estrutura:** marca, 3–5 links, entrar, ação principal; âncoras com rolagem suave e destaque da seção.
- **Medidas:** altura 56–72 px; pílula com 12–16 px da borda; fundo opaco ou vidro a ≥ 70% **com** desfoque; 13–15 px; ação 36–44 px.
- **Estados:** topo, rolado, seção ativa, menu aberto, foco.
- **Celular:** ≤ 60 px, marca + ação + menu; menu em painel inteiro; alvo ≥ 44 px, incluindo a ação do cabeçalho.
- **Acessibilidade:** link "pular para o conteúdo"; `scroll-margin-top` igual à altura da barra; foco nunca oculto sob ela (WCAG 2.4.11).
- **Erro comum:** barra transparente sem fundo ao rolar, com títulos passando por trás; somar barra de promoção e botão
  flutuante até cobrir conteúdo. **Conte as camadas fixas: no máximo 2 visíveis na dobra** e meça a área coberta (até 15–20%).

**Prova:** usada na página de `docs/provas/0.8.0-sites/` (site-preamar.html); os valores escolhidos ali passaram nas checagens de `resultado.json`. A faixa acima continua [ESTIMATIVA].
