<!-- Adaptado de jakubkrehel/skills/skills/better-accessibility/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=acessibilidade; palavras=acessibilidade, wcag, leitor de tela, teclado, foco visivel, aria, contraste minimo, area de toque, alvo de toque, movimento reduzido, zoom de 200; agentes=designer-paineis, designer-documentos, engenheiro-software, testador-qa -->
<!-- teste-ref: sim=revise a acessibilidade da tela: teclado, foco visível e leitor de tela | o formulário precisa passar no WCAG 2.2 AA com aria e área de toque mínima; nao=faça a previsão de vendas do trimestre -->
# Acessibilidade (WCAG 2.2 A e AA)

Revisar = duas voltas: **só teclado** (todo fluxo termina sem mouse) e **leitor de tela** (todo controle anuncia nome,
papel e estado). Na dúvida, o padrão da plataforma. Medir contraste é com `../cor/INDICE.md`; tamanho de texto com
`../tipografia/INDICE.md`; espaço entre alvos com `../layout/INDICE.md`.

**Critério, não convenção:** achado cita o critério WCAG 2.2 A/AA pelo número, ou uma tarefa concreta que o usuário de
tecnologia assistiva não consegue fazer. O resto (inclusive AAA) é recomendação, nunca ALTO.

## Regras
- **Elemento nativo primeiro:** `<button>` para ação, `<a href>` para navegar (com Ctrl/meio-clique funcionando), nunca
  `<div onClick>`. ARIA só quando não existe nativo.
- **Desabilitado = indisponível:** `disabled` nativo; `aria-disabled="true"` só quando precisa continuar focável (aí bloqueie
  ponteiro, teclado e envio no código).
- **Foco visível:** estilize `:focus-visible`; prefira o anel do navegador. Anel próprio com 3:1 contra toda cor vizinha
  (1.4.11), ex.: 2 px sólido com afastamento. O foco nunca fica todo escondido atrás de cabeçalho ou rodapé fixos (2.4.11).
- **Teclado completo:** todo gesto de ponteiro tem caminho pelo teclado (padrões ARIA APG): Esc fecha, setas andam dentro
  do componente composto, Tab entre componentes, Enter/Espaço ativam. Só `tabindex="0"` e `"-1"`; nunca positivo.
- **Prender e devolver o foco:** `<dialog>` com `showModal()` (fundo inerte, Esc). Sobreposição própria: `inert` no fundo,
  `role="dialog"`, `aria-modal="true"`, foco entra, fica e volta ao gatilho. Troca de rota no cliente: atualize o
  `document.title` e mova o foco para o `<h1>` ou `<main>` novo.
- **Área de toque:** mínimo AA 24 × 24 px (2.5.8); mire 44 × 44 no toque e 40 × 40 no desktop. Aumente com
  pseudo-elemento; áreas não se sobrepõem; camada decorativa com `pointer-events: none`. Todo arrastar tem alternativa de
  um ponteiro só (2.5.7).
- **Rótulo e tipo em todo campo:** `<label>` ligado; placeholder nunca é rótulo; `autocomplete` válido, `name`, `type` e
  `inputmode` certos; **nunca bloquear colar** (senha e código).
- **Erros anunciados:** valide no envio (não desabilite o botão até ficar válido); `aria-invalid="true"`,
  `aria-describedby` no texto do erro e foco no primeiro campo inválido.
- **Nome acessível em tudo:** botão só com ícone tem `aria-label`; o nome contém o texto visível; decorativo com
  `aria-hidden="true"` (nunca num focável).
- **Cor + segundo sinal** (1.4.1): ícone, texto ou sublinhado junto.
- **Contraste exigido:** texto 4,5:1 (1.4.3); texto grande (≥ 24 px ou 18,67 px negrito) 3:1; bordas, estados e gráficos
  que carregam sentido 3:1 (1.4.11). Controle inativo e logotipo são exceção. Falhou: relate o par e o critério.
- **Movimento reduzido:** movimento só dentro de `@media (prefers-reduced-motion: no-preference)`; reduzido = troca de
  deslize e escala por esmaecer; paralaxe e reprodução automática desligadas.
- **Nada que o usuário precisa depende de tempo:** o que se move ou atualiza sozinho por mais de 5 s tem pausa (2.2.2);
  toast com ação ou erro fica até ser fechado.
- **Conteúdo dinâmico:** validação de campo por `aria-describedby`; atualização não urgente em região `role="status"`
  (renderizada vazia antes); urgente em `role="alert"`; teste nos leitores de tela do público.
- **Texto alternativo pelo propósito:** decorativa `alt=""`; informativa descreve o sentido; funcional descreve a ação.
- **Estrutura é navegação:** títulos que descrevem as seções num esboço coerente; um `<main>`; "Pular para o conteúdo"
  como 1º focável quando há navegação repetida antes.
- **Zoom e texto:** texto aguenta 200% (1.4.4) e a página refaz em 320 px sem rolagem lateral (1.4.10).

## Antes de terminar
| Padrão | Correção |
|---|---|
| `outline: none` sem substituto de `focus-visible` | devolver o anel ou um próprio verificado |
| `<div onClick>` / `<span onClick>` | `<button>` ou `<a href>` |
| `role="button"` sem tratamento de tecla | elemento nativo, ou o mapa de teclas do APG |
| `tabindex` positivo | ordem do DOM e `0` |
| botão de enviar desabilitado até validar | habilitado, validar no envio |
| região `role="status"` montada já com o texto | renderizar vazia e atualizar o texto |
| `aria-live="assertive"` em toast de sucesso | `role="status"` |
| `<img>` sem `alt` | `alt=""` se decorativa, senão o propósito |
| `aria-hidden` em ancestral de controle | tirar, ou tornar a subárvore inerte |
| `maximum-scale=1` / `user-scalable=no` | tirar |
| dica em controle `disabled` nativo | texto ao lado, ou `aria-disabled` |
| arrastar sem alternativa por botão | caminho de um ponteiro só |

## Relatório
**ALTO:** impede uma tarefa, esconde conteúdo da tecnologia assistiva ou falha sistêmica. Sem navegador, confira nomes,
teclado em controles não nativos, estilos de foco, guarda do movimento reduzido e rótulos; com navegador, as duas voltas.
Formato e veredito como em `../cor/INDICE.md`, com o critério WCAG no "Por quê".

## Documento (PDF, slide)
Ordem de leitura e títulos marcados (estrutura do PDF), texto alternativo nas figuras, tabelas com cabeçalho marcado,
contraste igual ao da tela, idioma do documento definido, nada só em cor.
