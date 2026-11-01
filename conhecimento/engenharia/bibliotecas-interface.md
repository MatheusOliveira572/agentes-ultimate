<!-- Adaptado de emilkowalski/skills/skills/pick-ui-library/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: tradução, corte da saudação; dependência nova pelo auditor; alterado por agentes-ultimate. Licença em terceiros/emilkowalski-skills/. -->
<!-- ref: tema=bibliotecas-interface; palavras=qual biblioteca, biblioteca de componentes, toast, toasts, notificacao na tela, drag and drop, arrastar e soltar, lista virtualizada, menu de comandos, biblioteca de graficos, gerenciamento de estado; agentes=engenheiro-software -->
<!-- teste-ref: sim=qual biblioteca usar para toasts e para arrastar e soltar no app react | preciso de lista virtualizada e de um menu de comandos, que biblioteca de componentes uso?; nao=avalie o risco de crédito do cliente -->
# Escolher a biblioteca de interface (lista curada do Emil Kowalski)

## Como usar
1. **Identifique a tarefa,** não a biblioteca que o pedido citou ("um menu que abre" é tarefa de primitivo acessível).
2. **Veja o que já está instalado** (`package.json`). Se o projeto já usa uma da lista, use-a. Se usa uma concorrente
   (ex.: `react-window` no lugar de Virtuoso), **fique com a do projeto**; troca só com pedido.
3. **Recomende uma**, com uma frase do que ela resolve. Instalar é dependência nova: diga versão e motivo, passe pelo
   `auditor-seguranca` e confirme com o usuário; descubra o gerenciador com `node "<plugin>/scripts/gerenciador-pacotes.js"`.
4. Tarefa fora da lista: diga que saiu da lista curada e recomende pelo seu conhecimento, com a fonte oficial da versão
   (`<plugin>/conhecimento/metodo/fonte-oficial-da-versao.md`).

## A lista (ecossistema React)
| Tarefa | Biblioteca |
|---|---|
| componentes acessíveis sem estilo (diálogo, popover, menu, select) | base-ui |
| menu de comandos (⌘K) | cmdk |
| toasts / notificações | Sonner |
| campo de código de verificação (OTP) | input-otp |
| painel de controles para ajustar valores | Leva (alternativa: dialkit) |
| animação geral (molas, layout, entrada/saída) | motion (Framer Motion) |
| animar números (contadores, preços) | NumberFlow |
| texto animado | torph |
| globo 3D | Cobe |
| imagem OG dinâmica (HTML/CSS → SVG/PNG) | Satori |
| realce de sintaxe | shiki |
| gráfico em tempo real (rola com o tempo) | Liveline |
| gráficos em geral (painéis) | recharts |
| arrastar e soltar | dnd kit |
| lista ou tabela longa (virtualização) | Virtuoso |
| estado compartilhado | zustand |
| classes condicionais | clsx |
| variantes tipadas com Tailwind | cva |
| tema claro/escuro sem piscar | next-themes |
Hover ou fade simples não precisa de motion: transição de CSS resolve. clsx para classe condicional avulsa; cva quando o
componente tem variantes de verdade (tamanho, intenção, estado).

## Erros comuns a pegar
Toast feito à mão ou com biblioteca de modal → Sonner. Dropdown/diálogo de `<div>` com foco manual → base-ui (cuida de
acessibilidade, foco preso e fechar). Número animado re-renderizando texto → NumberFlow. Lista de 1.000+ linhas
renderizada direto → Virtuoso. Rede de `useState` passando props → zustand. Ternários de className em 3 níveis → clsx
(ou cva).
