<!-- Adaptado de emilkowalski/skills/skills/review-animations/STANDARDS.md e skills/animate/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: tradução, condensação, junção dos padrões de criação e de revisão; alterado por agentes-ultimate. Licença em terceiros/emilkowalski-skills/. -->
<!-- ref: tema=movimento; palavras=animacao, animacoes, animar, movimento, transicao, transicoes, easing, curva de animacao, duracao da animacao, mola, spring, micro interacao, hover animado, entrada da tela, visual premium, redesenhe, redesenho, site bonito, bonito, site institucional; agentes=engenheiro-software, designer-paineis, designer-documentos, designer-sites -->
<!-- teste-ref: sim=crie a animação de entrada do modal com a curva e a duração certas | revise as animações e transições do app, estão lentas e com easing estranho; nao=calcule o ponto de equilíbrio do produto -->
# Movimento (Emil Kowalski manda nos valores)

**Valor de curva, duração e mola vem destas tabelas: nunca aproxime "no olho".** Cada animação precisa de um motivo
(orientar, dar retorno, mostrar relação); sem motivo, não anima. Com Reduzir Movimento, troca por esmaecer ou corte.

## Deve animar? (pela frequência)
| Frequência | Decisão |
|---|---|
| 100+ vezes por dia (atalho de teclado, abrir a paleta de comandos) | **nunca** |
| dezenas por dia (hover, navegar numa lista) | tirar ou reduzir muito |
| ocasional (modal, gaveta, toast) | animação padrão |
| rara ou primeira vez (introdução, retorno, comemoração) | pode ter encanto |

## Curva
- Entrar ou sair → **ease-out** (começa rápido, responde). Mover ou transformar na tela → **ease-in-out**. Hover e cor →
  **ease**. Padrão → ease-out. **Nunca ease-in em interface** (atrasa o momento que a pessoa está olhando).
- Curvas fortes (em animação pensada, no lugar das embutidas):
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` · `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` ·
  `--ease-gaveta: cubic-bezier(0.32, 0.72, 0, 1)` (gaveta no estilo iOS).

## Duração
| Elemento | Duração |
|---|---|
| retorno ao pressionar botão | 100–160 ms |
| dica, popover pequeno | 125–200 ms |
| menu suspenso, select | 150–250 ms |
| modal, gaveta | 200–500 ms |
| marketing, explicação | pode ser maior |
**Regra: animação de interface abaixo de 300 ms** (180 ms responde melhor que 400 ms). Divergência registrada: a mesma
tabela admite até 500 ms em modal e gaveta; vale o menor que ainda se lê.

## Física
- **Nunca `scale(0)`:** comece de `scale(0.9–0.97)` + `opacity: 0`.
- Botão pressionado: `transform: scale(0.97)` no `:active` com `transition: transform 160ms ease-out` (0,95–0,98).
- Popover nasce do gatilho (`transform-origin` no ponto de onde sai).
- **Molas** (arrastar com impulso, elemento "vivo", gesto interrompível): estilo Apple `{ duration: 0.5, bounce: 0.2 }`;
  quique sutil 0,1–0,3, e na maior parte da interface sem quique.
- **Interrompível:** transição de CSS se redireciona no meio; `@keyframes` recomeça do zero. Coisa disparada em
  sequência (toasts, alternadores) usa transição. Entrada sem JS: `@starting-style`.
- **Tempo assimétrico:** devagar onde a pessoa decide (segurar para confirmar), rápido onde o sistema responde.
- **Escalonar** entradas de grupo com 30–80 ms entre itens; nunca bloqueia a interação.
- **Coesão:** painel profissional é seco e rápido; o lúdico pode quicar mais.

## Desempenho
Só **`transform` e `opacity`** (pulam layout e pintura). Não mova filhos por variável de CSS no pai (recalcula todos);
`transform` direto no elemento. Em Framer Motion, use a string completa de `transform` (os atalhos `x`/`y` rodam na
thread principal). CSS vence JS sob carga; WAAPI dá controle de JS com o desempenho do CSS.

## Acessibilidade
Envolva em `@media (prefers-reduced-motion: no-preference)`; com redução, esmaecer no lugar de deslizar e escalar;
paralaxe e reprodução automática desligadas.

## Revisão (formato)
Tabela | Antes | Depois | Por quê |, uma linha por animação, e veredito **Bloquear** (regra acima quebrada em algo
frequente, `ease-in`, `scale(0)`, propriedade de layout animada, sem redução de movimento) ou **Aprovar**.
