<!-- Adaptado de jakubkrehel/skills/skills/better-ui/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte, divergências com o Emil registradas; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=detalhes-interface; palavras=detalhes de interface, raio da borda, cantos arredondados, sombra, sombras, icones, alinhamento optico, borda do cartao, botao pressionado, acabamento fino, visual premium, redesenhe, redesenho, site bonito, bonito, site institucional; agentes=designer-paineis, engenheiro-software -->
<!-- teste-ref: sim=acerte os detalhes de interface: raio, sombras e ícones do cartão | o botão pressionado e o alinhamento óptico dos ícones estão estranhos; nao=calcule a taxa interna de retorno do projeto -->
# Detalhes de interface (Jakub Krehel): valores exatos

Os valores são **exatos**, não faixas: `cubic-bezier(0.2, 0, 0, 1)` não é `cubic-bezier(0.4, 0, 0.2, 1)`, e 0,96 não é 0,95.

- **Raio concêntrico:** com superfícies aninhadas e recuo uniforme visível, raio de fora = raio de dentro + recuo +
  borda. Acima de 24 px de recuo, trate como superfícies separadas.
- **Alinhamento óptico** onde o geométrico parece errado: botão com 2 px a menos de recuo do lado do ícone; triângulo de
  "play" deslocado para a ponta; glifo assimétrico corrigido no próprio SVG.
- **Sombra para elevação, borda para estrutura:** borda que só existe para dar profundidade vira sombras transparentes em
  camadas; bordas ficam em divisórias, células de tabela, selecionados e campos. Em modo de cores forçadas a sombra some:
  mantenha `border: 1px solid transparent` sob o anel de sombra.
- **Contorno de imagem** em preto ou branco puros: 1 px, recuado 1 px, `oklch(0 0 0 / 0.1)` no claro e
  `oklch(1 0 0 / 0.1)` no escuro (nunca um quase-preto da paleta nem a cor de destaque).
- **Estado interativo por transição, não por `@keyframes`.**
- **Pressionar:** escala 0,96 em 150 ms com ease-out; desabilitado nunca escala. *Divergência:* o Emil usa 0,97 em
  160 ms (`movimento/INDICE.md`); em movimento, o Emil manda; use um só valor no projeto.
- **Interação frequente responde na hora** (tecla, hover de linha, troca de aba): instantâneo ou ≤ 150 ms só em
  `opacity`/`background-color`.
- **Entrada escalonada de 100 ms** entre blocos com sentido (título, descrição, ações), só em entrada rara.
  *Divergência:* o Emil dá 30–80 ms entre itens de lista; 100 ms vale para blocos.
- **Saída menor e mais curta que a entrada:** opacidade, 4 px de desfoque e `translateY(-12px)` fixo em 150 ms ease-out,
  nunca a altura inteira do contêiner. Sem animação de estado na primeira renderização.
- **Troca de ícone contextual** (play↔pause, copiar↔copiado): escala 0,25→1, opacidade 0→1, desfoque 4 px→0.
- Transições desligadas na troca de tema; transicione só o que muda (nunca `transition: all`); `will-change` só com a
  propriedade animada.
- **Hover só com ponteiro que faz hover** (`@media (hover: hover)`); rolagem contida nos sobrepostos
  (`overscroll-behavior: contain`).
- **Traço do ícone acompanha o peso do texto ao lado:** 1,5 px no peso 400 até 2,5 px no 700; uma biblioteca de ícones
  por superfície; um SVG só, recolorido por estado com `currentColor`.

## Antes de terminar
| Detecção | Correção |
|---|---|
| pai e filho com recuo e o mesmo raio | somar o recuo ao raio de fora |
| anel `box-shadow: 0 0 0 1px` sem borda | `border: 1px solid transparent` |
| `transition: all` | nomear as propriedades |
| `animation` em `:hover` ou classe que liga e desliga | transição nas mesmas propriedades |
| escala ao pressionar abaixo de 0,96, ou sem excluir `:disabled` | 0,96 e `:not(:disabled):active` |
| `bounce` diferente de 0 em interface | `bounce: 0` |
| `translate`/`scale`/`filter` animados sem guarda de movimento reduzido | guardar e esmaecer na redução |
| `fill="#…"` no SVG do ícone | `currentColor` |
| hover fora de `@media (hover: hover)` | envolver na consulta |
Relatório: | Gravidade | Onde | Antes | Depois | Por quê |, como em `cor/INDICE.md`.
