<!-- Adaptado de emilkowalski/skills/skills/mobile-native/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: tradução, corte da saudação e dos blocos de código; alterado por agentes-ultimate. Licença em terceiros/emilkowalski-skills/. -->
<!-- ref: tema=web-no-celular; palavras=celular, no celular, mobile, iphone, android, tela pequena, toque, hover preso, zoom no campo, 100vh, notch, area segura, pwa; agentes=engenheiro-software, designer-interface, designer-paineis -->
<!-- teste-ref: sim=no celular o hover fica preso e a página dá zoom no campo de texto | o app web no iphone corta no notch e o 100vh passa da tela; nao=calcule o custo de frete por região -->
# Web que parece nativa no celular

Uma coisa só: tirar, um a um, os sinais de "isto é um site" num app web aberto no celular. O celular de verdade é a fonte da
verdade: **nada disto aparece na emulação do navegador do computador.** Se não der para testar no aparelho, diga o que foi
conferido pelo código e o que o usuário precisa confirmar no telefone.

## Regras
1. Cada correção com o motivo; aplique onde o motivo vale (`user-select: none` no texto é defeito, no botão é certo).
2. **Media query, não detecção de aparelho:** `(hover: hover)`, `(pointer: fine)`, `env()`, `dvh`. Nunca pelo user agent
   nem pela largura.
3. Toque e mouse não se excluem (iPad com trackpad, notebook com tela de toque): escreva para os dois, pela capacidade.
4. **Nunca desligue o zoom** (`user-scalable=no`, `maximum-scale=1` são falha de acessibilidade). Corrija a fonte do campo.
5. Teste no aparelho antes de dizer pronto.

## Sintoma → correção
| Sintoma | Correção | Por quê |
|---|---|---|
| hover preso depois do toque | hover dentro de `@media (hover: hover) and (pointer: fine)` | o toque simula hover e o deixa ligado; o retorno ao toque vem do `:active` |
| clarão cinza/azul ao tocar | `-webkit-tap-highlight-color: transparent` (global) + `:active` próprio em todo tocável | é o sinal mais alto de "site" |
| altura errada | `100dvh` no casco do app; `100svh` no herói | `100vh` é a maior janela (barra recolhida) e estoura; `dvh` muda com a barra; `svh` é estável |
| página dá zoom no campo | fonte do campo ≥ 16 px (só no celular, se o desktop usa menor) | o iOS amplia abaixo de 16 px e não volta |
| toque parece lento | retorno no `pointerdown`/`:active` (100–160 ms, ease-out) + `touch-action: manipulation` | o botão nativo responde quando o dedo encosta, não quando sai |
| puxar para atualizar sequestra a rolagem | `overscroll-behavior: none` em `html, body`; `contain` nas áreas roláveis internas | nunca `touchmove` + `preventDefault()` |
| conteúdo para no notch | `viewport-fit=cover` + padding com `env(safe-area-inset-*)` em cabeçalho fixo, barra inferior, toasts | sem a meta tag, os `env()` valem 0 |
| pressionar seleciona o texto do botão | `user-select: none` só nos controles | nunca no `body`: endereço, erro e número do pedido são conteúdo |
| carrossel rola na vertical | `touch-action: pan-y` na superfície do gesto; ou rolagem nativa com `scroll-snap` | diz ao navegador que ele cuida só da vertical |
| barra de status com cor errada | um `theme-color` por `prefers-color-scheme`, da cor do topo da página | um valor só erra em um dos temas |

Nos campos, o teclado certo: `inputmode="numeric"` (códigos), `"decimal"` (valores), `type="email"`, `type="tel"`,
`autocapitalize="none"` e `autocorrect="off"` em e-mail, usuário e código.

## Piso de todo app web para celular
Meta viewport com `width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content` (no
Android o teclado encolhe a janela como no iOS); o `theme-color` por tema; o realce de toque desligado com `:active`;
hover protegido pela media query; `overscroll-behavior` na raiz; campos ≥ 16 px.

## Testar no aparelho
Servidor de desenvolvimento em `0.0.0.0`, aberto pelo IP da rede; iOS: Safari → Desenvolver → aparelho; Android:
`chrome://inspect`. Num telefone de alguns anos atrás, com o teclado aberto, uma vez em paisagem; como PWA instalado se for
alvo (muda janela, área segura e barra de status). O simulador do Xcode ajuda, mas não substitui o toque real.

## Nunca entregar
`user-scalable=no`; hover sem a media query; `100vh` em casco de app; `100dvh` em herói; retorno só no `click`;
`preventDefault` para parar a rolagem; `user-select: none` no body; `touch-action: none` onde o usuário precisa rolar;
`env()` sem `viewport-fit=cover`; um `theme-color` para os dois temas; detecção por user agent; "corrigido" pela emulação.

## Relatório curto
O que estava errado (sintoma e o porquê em uma linha), o que mudou (arquivo e declaração) e o que precisa do telefone.
