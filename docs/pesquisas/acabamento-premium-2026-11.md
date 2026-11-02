# Acabamento premium na web: técnicas e checklist verificável (2026-11-02, cod pq101)

**Aviso de cobertura (ler primeiro).** A pesquisa foi interrompida pelo limite de uso da ferramenta de leitura de páginas.
Só 5 fontes foram abertas e lidas por inteiro (marcadas **[ABERTA]**). Outras apareceram só em resultado de busca
(**[BUSCA]**: o trecho foi lido no resultado, a página não). O que vem do conhecimento geral do autor, sem fonte aberta,
está como **[HIPÓTESE]** e precisa de checagem antes de virar regra. **Não foram abertos:** Awwwards SOTD 2024–2026,
páginas reais da Apple, documentação do Playwright e do protocolo do Chrome. Termine esses pontos numa segunda rodada.

## (a) Checklist amador × premium (cada item tem um teste)

### Bloco 1. Objeto 3D (a lente "com cara de desenho")
| # | Amador | Premium | Como testar |
|---|---|---|---|
| 1 | Degradê plano no corpo, sem nada refletido | O material reflete um ambiente: faixas claras grandes e suaves (como softbox) deslizam pela superfície quando o objeto gira | Girar 20° e comparar 2 quadros: os reflexos devem mudar de lugar; se a imagem só desliza junto, é desenho |
| 2 | Simetria perfeita, borda de espessura constante | Espessura visível na borda, bisel pequeno, leve variação de rugosidade | Recortar a borda a 2×: deve haver faixa de transição com 2 tons, não uma linha só |
| 3 | Sem sombra, ou sombra borrada igual por toda parte | Sombra de contato: nítida e escura perto do apoio, esvaindo com a distância | Medir a luminância do chão: gradiente com mínimo junto do objeto |
| 4 | Vidro = círculo semitransparente | Vidro refrata o fundo (distorce), absorve cor na espessura, com leve dispersão nas bordas | Colocar uma grade atrás: as linhas devem curvar dentro do vidro |
| 5 | Cor chapada saturada | Mapeamento de tons que preserva realce suave (AgX/Neutral) em vez de queimar | Histograma: sem pico no 255 em mais de 1% dos pixels do objeto |
| 6 | Objeto parado ou girando em velocidade constante | Reage à rolagem/ponteiro com inércia (mola) e desacelera | Ver bloco 2 |
| 7 | Sem plano B: some em celular fraco | Quadro estático de alta qualidade como fallback | Desligar WebGL: a página mostra imagem, não vazio |

### Bloco 2. Movimento
| # | Amador | Premium | Como testar |
|---|---|---|---|
| 1 | Tudo entra junto, mesma curva, mesma duração | Escalonado (um após o outro, curto) e com hierarquia: o principal se move primeiro | Ler o início de cada animação: devem diferir em dezenas de ms |
| 2 | Curva linear ou "ease" padrão em tudo | Mola ou curva com desaceleração longa; sem aceleração brusca no início | Posição por quadro: a velocidade começa e termina sem salto |
| 3 | Parada seca (velocidade vai a zero de uma vez) ou ricochete exagerado | Chegada suave; bounce 0 como padrão | Segunda diferença da posição sem pico no último quadro |
| 4 | Não dá para interromper: clicar de novo espera acabar | A animação interrompida continua da posição e velocidade atuais | Disparar e reverter no meio: sem pulo de posição |
| 5 | Anima largura, altura, top, left, sombra | Só `transform` e `opacity` | Inspecionar o CSS/JS: lista de propriedades animadas |
| 6 | `will-change` em tudo | Só no que vai mudar, e removido depois | Contar elementos com `will-change` permanente |
| 7 | Salta entre páginas/estados, o objeto "some e reaparece" | O mesmo objeto atravessa a mudança (elemento compartilhado) | Capturar quadros da troca: o objeto aparece em todos, em posições intermediárias |
| 8 | Quadros perdidos na rolagem (engasgos) | Mapeamento rolagem→quadro fluido, imagens pré-carregadas | Contar quadros acima de 20 ms (seção c) |
| 9 | Ignora `prefers-reduced-motion` | Versão reduzida (fades curtos) | Emular a preferência e comparar |

### Bloco 3. Acabamento ("HD")
| # | Amador | Premium | Como testar |
|---|---|---|---|
| 1 | Imagem e canvas em 1×: bordas serrilhadas/borradas em tela retina | Canvas e imagens em 2× (ou 3×) | Capturar com fator 2: nitidez de borda (variância do Laplaciano) acima de um limite |
| 2 | Borda de 1 px grossa e cinza | Borda fina de 0,5 px em telas 2×, cor translúcida | Medir a espessura em captura 2× |
| 3 | Uma sombra só, grande e escura | 2 a 4 sombras em camadas (curta e nítida + longa e suave) com baixa opacidade | Contar camadas no `box-shadow` |
| 4 | Faixas visíveis nos degradês escuros ou longos (banding) | Grão leve por cima ou dither | Algoritmo de faixas (seção c) |
| 5 | Título grande com espaçamento padrão | Espaçamento negativo nos títulos grandes, tamanho óptico automático, `text-wrap: balance` | Ler o CSS computado |
| 6 | Números que mudam de largura (tabelas "dançam") | Algarismos tabulares | `font-variant-numeric: tabular-nums` presente |
| 7 | Cantos de círculo simples em cartões grandes | Cantos contínuos (squircle) onde houver suporte, com fallback | `@supports (corner-shape: squircle)` |
| 8 | Ícones de pesos e estilos diferentes | Uma família, mesmo traço e grade | Revisão visual lado a lado |
| 9 | Texto cinza claro sobre fundo claro | Contraste que passa em 4,5:1 sem parecer pesado | Cálculo de contraste |

## (b) Receitas técnicas

### B1. Objeto "real" sem arte de terceiros
**Três caminhos, do mais leve ao mais pesado:**
1. **Sequência de imagens na rolagem, em canvas.** Um contêiner alto com um canvas fixo (`position: sticky`) dentro; a
   posição de rolagem vira número de quadro: progresso × total, arredondado para baixo e limitado ao último índice.
   Pré-carregar todos os quadros antes de começar, senão engasga. Não sequestrar o evento de rolagem. Apple não publica
   o código; as descrições vêm de tutoriais de terceiros **[BUSCA]**
   (https://www.setproduct.com/blog/how-to-3d-animate-scroll, https://dev.to/bekbrace/creating-a-scrolling-animation-for-apple-airpods-1g0m,
   https://css-tricks.com/?p=308477, acessados 2026-11-02). Um exemplo da comunidade usa 147 quadros JPEG num canvas de
   1158×770 **[BUSCA]**. Um artigo cita que a Apple troca a sequência inteira por uma imagem única como plano B em
   celular **[BUSCA]**.
   - Valores **[HIPÓTESE]**: suavizar o índice (aproximar o quadro mostrado do alvo a cada rodada, por exemplo 10 a 15%
     da distância por quadro) em vez de ligar direto à rolagem; desenhar no canvas com largura = largura CSS × `devicePixelRatio`;
     formato WebP/AVIF; peso total entre 3 e 10 MB para 100 a 150 quadros (a conferir).
   - Para fazer sem arte de terceiros: renderizar os quadros você mesmo (three.js em modo offline com as receitas
     abaixo, capturando a página com o relógio controlado, seção c). Isso gera imagens "de estúdio" sem pagar o custo de WebGL ao vivo.
2. **Vídeo controlado pela rolagem** (`currentTime` do `<video>`). **[HIPÓTESE]**: exige vídeo com quadro-chave em todo
   quadro (ou muito frequente) para a busca para trás ser fluida; por isso costuma perder para a sequência de imagens.
3. **WebGL ao vivo com material físico (three.js).** Valores lidos na documentação oficial **[ABERTA]**
   (https://threejs.org/docs/pages/MeshPhysicalMaterial.html, 2026-11-02):

| Propriedade | Padrão | Faixa | Uso para vidro/lente |
|---|---|---|---|
| `transmission` | 0 | 0 a 1 | 1 para vidro; com valor acima de 0, `opacity` deve ser 1 |
| `ior` | 1,5 | 1,0 a 2,333 | 1,5 vidro comum |
| `thickness` | 0 | espaço da malha | acima de 0 faz o material ser um volume (borda e refração mais convincentes) |
| `attenuationColor` / `attenuationDistance` | branco / infinito | cor / maior que 0 | tinge a luz que atravessa (leve verde/azul no vidro grosso) |
| `clearcoat`, `clearcoatRoughness` | 0, 0 | 0 a 1 | camada de verniz brilhante por cima (revestimento da lente) |
| `iridescence` | 0 | 0 a 1 | reflexo de cor que muda com o ângulo (revestimento antirreflexo); `iridescenceIOR` 1,3, espessura 100 a 400 nm |
| `dispersion` | 0 | 0 ou mais (típico até 1) | aberração cromática; só em material transmissivo |

   A própria página diz: o material custa mais por pixel que os outros, os efeitos vêm desligados e "para melhor
   resultado, sempre defina um mapa de ambiente". **A página não confirma** se a transmissão exige passada extra de renderização.
   - **[HIPÓTESE]** (conhecimento geral, conferir): ambiente gerado por `RoomEnvironment` + `PMREMGenerator` dispensa
     arquivo HDR externo; para reflexos de estúdio, montar um ambiente próprio com 2 a 4 faixas claras retangulares
     (softbox) numa cena escura e usar como mapa; `renderer.toneMapping` AgX ou Neutral; `outputColorSpace` sRGB;
     `setPixelRatio(min(devicePixelRatio, 2))`; sombra de contato com um plano ao chão e textura de sombra desfocada; DOF só se sobrar orçamento de quadros.
   - **Mapeamento de tons [BUSCA]** (https://discourse.threejs.org/t/tone-mapping-overview/75204, Khronos via
     https://ehe.gamedev.net/news/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-objects-r2733):
     AgX é menos saturado que ACES por desenho e é bom ponto de partida para cena nova; Neutral (Khronos) preserva a cor
     base 1:1 até um máximo e comprime só os realces, indicado para objetos de produto bem iluminados. Fonte do Khronos
     via repasse de terceiro: abrir a original antes de citar.
   - **Geometria procedural, sem glTF:** lente biconvexa com `LatheGeometry` (perfil de curva girado), anel metálico com
     `TorusGeometry` ou `ExtrudeGeometry` com bisel, corpo com `RoundedBox` de exemplos do three.js **[HIPÓTESE]**.
   - **Custo [HIPÓTESE]**: biblioteca three.js pesa na ordem de centenas de KB comprimidos; transmissão em tela cheia pode
     derrubar celular fraco; plano B obrigatório = quadro estático ou sequência de imagens.
   - **Por que a lente parece desenho [HIPÓTESE, a validar com o teste do item 1 do bloco 1]:** SVG/CSS não tem ambiente
     para refletir nem refração do que está atrás; o degradê é fixo no objeto, então não muda quando a luz ou o ângulo muda.

### B2. Movimento
- **Molas (Apple, WWDC23 "Animate with springs")** **[BUSCA]** (https://wwdcnotes.com/notes/wwdc23/10158 e
  https://developer.apple.com/videos/play/wwdc2023/10158/, vistos em resultado de busca; páginas não abertas): a mola
  usa 2 parâmetros, duração e bounce; bounce vai de −1,0 a 1,0; na dúvida usar bounce 0; ter cautela com duração acima de
  cerca de 0,4 s em elementos de interface; fórmula citada: amortecimento = 1 − 4π × bounce ÷ duração (bounce ≥ 0).
  Exemplo citado: `.spring(duration: 0.6, bounce: 0.2)`.
  **[HIPÓTESE] tradução para a web:** `linear()` do CSS aceita uma lista de pontos amostrados de uma mola (gerar com
  script); ou biblioteca de movimento (Motion One/Framer Motion) com `type: "spring"`, `bounce` 0 a 0,25,
  `duration` 0,35 a 0,6 s para painéis grandes e 0,2 a 0,3 s para controles pequenos.
- **Escalonamento [HIPÓTESE]:** 30 a 60 ms entre itens, no máximo ~8 itens em sequência; o item principal primeiro.
- **Continuidade de objeto [ABERTA]** (https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API, 2026-11-02):
  dar o mesmo `view-transition-name` ao elemento nos dois estados faz o navegador animar posição e tamanho entre eles.
  `document.startViewTransition(fn)` para a mesma página; `@view-transition { navigation: auto }` nas duas páginas
  para trocas entre páginas. Pseudoelementos: `::view-transition-group/image-pair/old/new(nome)`. Nomes devem ser
  únicos durante a transição (duplicado pode cancelar). A tabela de suporte não carregou: **conferir antes de depender**.
- **Interrupção [ABERTA]:** a HIG da Apple (https://developer.apple.com/design/human-interface-guidelines/motion,
  lida via JSON público, 2026-11-02) manda: movimento realista que acompanha o gesto, feedback breve e preciso,
  "não faça as pessoas esperarem a animação terminar", evitar movimento em interações frequentes, movimento opcional
  (nunca o único jeito de passar informação). A página **não** traz durações, curvas nem seção própria de movimento reduzido.
- **Rapidez [ABERTA]** (https://web.dev/articles/animations-guide, 2026-11-02): animar só `transform` e `opacity`
  sempre que possível; `top`/`left` derrubaram 50% dos quadros no teste do guia; desfoques e sombras custam mais para
  pintar; `will-change` com moderação e, se possível, aplicar pouco antes e remover depois.
- **Curvas e durações [HIPÓTESE]:** a Apple não publica as curvas da web; use `cubic-bezier(0.32, 0.72, 0, 1)` (popular
  como "tipo iOS") para entradas de painel; entradas 250 a 450 ms, saídas 150 a 250 ms (mais curtas que a entrada);
  desfoque de movimento como `filter: blur()` só em objetos pequenos e por 100 a 200 ms (custa pintura).
- **Sinais de amador no movimento (tabela do bloco 2):** curva linear, tudo junto, sem interrupção, propriedades de
  layout, duração acima de 600 ms em controles, bounce alto em elementos corporativos, animação infinita sem motivo.

### B3. Acabamento
- **Densidade [HIPÓTESE]:** canvas com `width = clientWidth × dpr` (dpr limitado a 2 a 3), `ctx.scale(dpr, dpr)`;
  imagens `srcset` 1×/2×/3× ou AVIF/WebP em 2×; gerar as capturas de prova com `deviceScaleFactor: 2` **[BUSCA]**
  (https://macmyths.com/how-to-fix-blurry-playwright-screenshots/).
- **Hairline [HIPÓTESE]:** `border: 0.5px solid rgb(0 0 0 / .12)` dentro de `@media (min-resolution: 2dppx)`;
  alternativa `box-shadow: 0 0 0 0.5px rgb(0 0 0 / .12)`.
- **Sombras em camadas [HIPÓTESE]:** por exemplo 3 camadas: `0 1px 1px rgb(0 0 0/.06), 0 4px 8px rgb(0 0 0/.06), 0 16px 32px rgb(0 0 0/.08)`.
- **Banding [BUSCA]** (https://instantgradient.com/blog/grainy-gradients, https://frontendmasters.com/blog/grainy-gradients/,
  repassados por resultado de busca): banda aparece quando a transição tem menos níveis de cor que pixels; a correção
  comum é uma camada de ruído `feTurbulence` com `mix-blend-mode: overlay`; vendor sugere `baseFrequency` 0,6 a 1,0 e
  opacidade 0,2 a 0,4 (**orientação de quem vende gerador, não padrão testado**); limites: ruído é estático, pode mudar brilho/saturação, e degradês longos e suaves ainda mostram faixas; alternativa citada: usar o ruído como mapa de deslocamento (sem teste entre navegadores).
- **Tipografia [HIPÓTESE]:** `font-optical-sizing: auto` (precisa de fonte variável com eixo `opsz`); tracking de −0,02 a −0,04 em
  títulos acima de 48 px; `font-feature-settings`/`font-variant-numeric: tabular-nums` em números; `text-wrap: balance`
  nos títulos; `-webkit-font-smoothing: antialiased` no macOS.
- **Cantos contínuos [ABERTA]** (https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape, 2026-11-02):
  `corner-shape: squircle` (= `superellipse(2)`) depende de `border-radius`; sombra, borda e `backdrop-filter` seguem a
  forma; marcado **experimental/disponibilidade limitada**; usar `@supports not (corner-shape: squircle)` com raio simples.

## (c) Como verificar automaticamente
1. **Filmstrip de uma transição [HIPÓTESE, método padrão da web; Playwright não aberto]:** abrir a página com
   `deviceScaleFactor: 2`; para animações CSS/WAAPI, pausar tudo com `document.getAnimations()`, e para cada passo
   definir `animation.currentTime = t` e capturar a tela; juntar os PNG em uma tira (ImageMagick `montage` ou `sharp`).
   Para animação por `requestAnimationFrame`/WebGL, controlar o relógio (a API de relógio do Playwright, `page.clock`,
   a conferir) e capturar a cada 16,7 ms simulados. Isso é determinístico, sem depender de CPU. `animations: 'disabled'`
   do Playwright congela e finaliza animações para comparação estática **[BUSCA]** (resumo de terceiro).
2. **Quadros perdidos [HIPÓTESE]:** na página, medir o intervalo entre chamadas de `requestAnimationFrame` durante a
   rolagem/animação (script que rola em passos e grava os deltas) e/ou `PerformanceObserver` de `long-animation-frame`.
   Reprovar se mais de 2% dos intervalos passam de 20 ms ou algum passa de 50 ms. **Atenção:** o Chromium sem janela
   usa renderização por software; valor absoluto de FPS não vale, compare com a versão anterior ou conte só picos.
3. **Suavidade da curva [HIPÓTESE]:** com as posições por quadro (leitura de `getBoundingClientRect` ou do `transform`),
   calcular velocidade e aceleração; reprovar se a velocidade salta mais que um limite no primeiro ou último quadro
   (parada seca) ou se a posição retrocede sem ser o desenho.
4. **Interrupção [HIPÓTESE]:** disparar a animação, reverter na metade e comparar a posição do quadro logo antes e logo
   depois da reversão; salto acima de 2 px = reprovado.
5. **Banding [HIPÓTESE]:** recortar a região do degradê no PNG 8 bits, e por linha/coluna medir o comprimento de
   trechos com valor idêntico seguidos de degrau de exatamente 1 nível; muitos trechos longos (por exemplo acima de
   24 px a 2×) = faixas. Confirmar que a correção (grão) reduz esse número; teste só vale se visto falhar no caso sem grão.
6. **Nitidez a 2× [HIPÓTESE]:** capturar em 1× e 2×; reduzir o 2× para 1× e comparar com o 1× (SSIM); e medir a variância do Laplaciano
   da captura 2× em recortes de texto e borda. Imagem raster em 1× esticada aparece com variância baixa.
7. **Espessura da borda, camadas de sombra, `will-change`, propriedades animadas:** leitura do CSS computado e
   varredura do código (lista de propriedades dentro de `@keyframes`/`animate()`).
8. **Objeto 3D (bloco 1):** capturar o mesmo quadro em dois ângulos e verificar se as regiões brilhantes se deslocaram
   diferente do corpo; contar pixels saturados em 255; checar fallback com WebGL desligado.

## (d) Fontes e o que cada uma sustenta
| Fonte | Quem publica (interesse) | Estado | Sustenta |
|---|---|---|---|
| https://threejs.org/docs/pages/MeshPhysicalMaterial.html | Projeto three.js (oficial) | ABERTA 2026-11-02 | Tabela do material físico |
| https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json | Apple (oficial) | ABERTA 2026-11-02 | Princípios de movimento, cancelar |
| https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API | MDN (Mozilla, independente de fabricante) | ABERTA 2026-11-02 | View Transitions |
| https://web.dev/articles/animations-guide | Google (equipe do Chrome) | ABERTA 2026-11-02 | transform/opacity, will-change |
| https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape | MDN | ABERTA (100 mil de 152 mil caracteres) | squircle, suporte limitado |
| https://wwdcnotes.com/notes/wwdc23/10158 ; https://developer.apple.com/videos/play/wwdc2023/10158/ | Notas de comunidade; Apple | BUSCA | Molas: duração e bounce |
| https://www.setproduct.com/blog/how-to-3d-animate-scroll ; https://dev.to/bekbrace/creating-a-scrolling-animation-for-apple-airpods-1g0m ; https://css-tricks.com/?p=308477 ; https://github.com/Rachit-Pal/Apple-Scroll-Animation/blob/master/app.js | Blogs e exemplo de terceiros (a Apple não publica o código) | BUSCA | Sequência de imagens em canvas |
| https://discourse.threejs.org/t/tone-mapping-overview/75204 ; https://ehe.gamedev.net/news/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-objects-r2733 | Fórum de usuários; site de notícias | BUSCA | AgX × ACES × Neutral |
| https://instantgradient.com/blog/grainy-gradients ; https://frontendmasters.com/blog/grainy-gradients/ ; https://cssmatic.com/gen-noise-texture.html | Blogs/ferramentas (a última vende gerador) | BUSCA | Grão contra banding |
| https://macmyths.com/how-to-fix-blurry-playwright-screenshots/ | Blog de terceiro | BUSCA | `deviceScaleFactor`, `animations` |

Buscas feitas (para refazer): "Apple AirPods Pro page scroll animation image sequence canvas how it works frames";
"WWDC23 Animate with springs duration bounce response dampingFraction"; "three.js AgX tone mapping vs ACES filmic PBR
neutral Khronos"; "gradient banding fix noise dithering CSS SVG feTurbulence overlay 8-bit"; "Playwright screenshot
animations disabled deviceScaleFactor 2; CDP Page.startScreencast frames headless chromium" (esta última sem resultado
sobre o protocolo do Chrome).

## Segunda rodada recomendada (o que falta abrir)
Playwright (`screenshot`, `clock`, `toHaveScreenshot`); protocolo do Chrome (`Page.startScreencast`, `Tracing`);
Khronos PBR Neutral (repositório); WWDC23 10158 (Apple); `linear()` e `font-optical-sizing` (MDN); três a cinco sites
Awwwards SOTD 2024–2026 com objeto 3D, inspecionando se usam canvas com sequência, vídeo ou WebGL; página oficial de
exemplos do three.js (sombra de contato, `RoomEnvironment`).
