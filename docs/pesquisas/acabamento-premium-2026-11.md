# Acabamento premium na web: técnicas e checklist verificável (2ª rodada, 2026-11-02, cod pq101)

**Legenda.** **ABERTA** = página aberta e lida nesta pesquisa, com link e data de acesso 2026-11-02. **BUSCA** = só vi o
trecho no resultado de busca (a página não foi aberta). **[HIPÓTESE]** = conhecimento geral do autor, sem fonte aberta.
Só ABERTA vira regra do plugin (seção "O que vira regra").

**O que mudou da 1ª para a 2ª rodada:** a maior parte das receitas passou de BUSCA/HIPÓTESE para ABERTA (Playwright,
protocolo do Chrome, Khronos, three.js, WWDC23, MDN, guias do Chrome, Awwwards). Uma afirmação foi **corrigida**: o limite
de ~0,4 da Apple é do *bounce*, não da duração (a 1ª rodada leu o resumo da busca e errou). A observação da Apple e dos
sites premiados só deu indícios, porque a leitura de página devolve texto e nomes de arquivo, sem scripts.

## (a) Checklist amador × premium
A coluna "Status" refere-se à prática; o método de teste proposto é nosso.

### Bloco 1. Objeto 3D (a lente "com cara de desenho")
| # | Amador | Premium | Como testar | Status |
|---|---|---|---|---|
| 1 | Degradê fixo no corpo, nada refletido | O material reflete um mapa de ambiente; o reflexo muda com o ângulo | Girar 20°: reflexos mudam de lugar em relação ao corpo | **ABERTA** (three.js: "sempre defina um mapa de ambiente") |
| 2 | Borda de espessura constante, vidro de uma película | `thickness` maior que 0 (volume) + `attenuationColor`/`attenuationDistance` | Recorte da borda a 2×: transição em pelo menos 2 tons | **ABERTA** (thickness/atenuação); bisel da malha [HIPÓTESE] |
| 3 | Sem sombra, ou sombra igual em todo lado | Sombra de contato: escura e nítida junto do apoio, esvai com a distância | Luminância do chão em gradiente | [HIPÓTESE] |
| 4 | Vidro = círculo translúcido | `transmission` 1, `ior` ~1,5, `dispersion`, `clearcoat`, `iridescence` | Grade atrás: linhas curvam dentro do vidro | **ABERTA** |
| 5 | Cor chapada saturada ou realce queimado | Mapeamento de tons adequado (Neutral para produto; AgX/ACES para cena HDR) | Menos de 1% dos pixels do objeto em 255 | **ABERTA** (Neutral, Khronos; constantes do three.js); "AgX satura menos que ACES" só BUSCA |
| 6 | Objeto parado ou girando em velocidade constante | Reage com mola e inércia | Itens 2 e 3 do bloco 2 | **ABERTA** (WWDC23) |
| 7 | Sem plano B | Imagem estática/sequência como fallback; `transmissionResolutionScale` para baratear | Desligar WebGL: aparece imagem | [HIPÓTESE] (fallback); resolução da transmissão **ABERTA** |

### Bloco 2. Movimento
| # | Amador | Premium | Como testar | Status |
|---|---|---|---|---|
| 1 | Tudo entra junto | Itens escalonados, o principal primeiro (30 a 60 ms entre itens) | Atrasos de início por item | [HIPÓTESE] |
| 2 | Curva ease-in-out/linear que para seca ou ignora o gesto | Mola: começa com a velocidade que o gesto tinha, assenta com cauda longa | Velocidade por quadro sem salto | **ABERTA** (WWDC23: ease-in-out não representa velocidade inicial) |
| 3 | Ricochete exagerado | Bounce 0 por padrão; ~15% quase imperceptível; ~30% nítido; acima de 0,4 exagerado para UI | Overshoot pequeno em UI séria | **ABERTA** (WWDC23) |
| 4 | Não interrompe, ou pula ao interromper | Mola retargetada continua da velocidade atual; feedback breve, "não faça esperar" | Reverter na metade: sem salto de posição | **ABERTA** (WWDC23 + HIG) |
| 5 | Anima largura, altura, top, left, sombra | Só `transform` e `opacity` | Lista de propriedades animadas | **ABERTA** (web.dev; Chrome: largura/altura rodam layout a cada quadro) |
| 6 | `will-change` em tudo | Só no que vai mudar | Contar `will-change` permanente | **ABERTA** (web.dev) |
| 7 | Estado muda e o objeto some/reaparece | Mesmo `view-transition-name` nos dois estados | Quadros intermediários com o objeto presente | **ABERTA** (MDN + Chrome) |
| 8 | Engasgos na rolagem | Quadros estáveis | Intervalos de rAF acima de 20 ms (seção c) | [HIPÓTESE] (o limite 20 ms/2% é nosso) |
| 9 | Ignora movimento reduzido | Versão com fades curtos; movimento nunca é o único meio de informar | `reducedMotion: 'reduce'` no contexto | **ABERTA** (HIG + Playwright) |

### Bloco 3. Acabamento
| # | Amador | Premium | Como testar | Status |
|---|---|---|---|---|
| 1 | Capturas e canvas em 1× | Densidade 2× (capturas com `deviceScaleFactor: 2`) | Captura com fator 2; nitidez de borda | **ABERTA** (Playwright, captura); canvas `width × dpr` [HIPÓTESE] |
| 2 | Borda de 1 px grossa | Borda 0,5 px translúcida em tela 2× | Medir espessura em captura 2× | [HIPÓTESE] |
| 3 | Uma sombra grande e escura | 2 a 4 sombras em camada, baixa opacidade | Contar camadas do `box-shadow` | [HIPÓTESE] |
| 4 | Faixas (banding) em degradê | Grão leve (feTurbulence + overlay) ou dither | Trechos longos de valor idêntico (seção c) | [HIPÓTESE] (só BUSCA: blogs) |
| 5 | Título grande com quebra feia | `font-optical-sizing: auto` (fonte com eixo `opsz`), `text-wrap: balance` (até 6 linhas no Chromium, 10 no Firefox); tracking negativo | CSS computado | **ABERTA** (optical sizing, balance); valor do tracking [HIPÓTESE] |
| 6 | Números que dançam | `font-variant-numeric: tabular-nums` | CSS presente | [HIPÓTESE] |
| 7 | Cantos de círculo simples em cartão grande | `corner-shape: squircle` + `border-radius`, com `@supports` e raio simples de plano B | `@supports` no CSS | **ABERTA** (experimental, suporte limitado) |
| 8 | Ícones de pesos diferentes | Uma família e grade | Revisão lado a lado | [HIPÓTESE] |
| 9 | Texto cinza claro em fundo claro | Contraste 4,5:1 | Cálculo de contraste | [HIPÓTESE] (WCAG não aberta) |

**Contagem:** 25 linhas; **10 continuam [HIPÓTESE]** (bloco 1: 3 e 7; bloco 2: 1 e 8; bloco 3: 2, 3, 4, 6, 8, 9) e 15 têm a
prática ABERTA (algumas com um valor de detalhe ainda [HIPÓTESE], indicado na linha).

## (b) Receitas técnicas

### B1. Objeto "real" sem arte de terceiros
1. **Sequência de imagens na rolagem em canvas.** Descrição de tutoriais de terceiros (**BUSCA**; a Apple não publica
   código): contêiner alto, canvas `sticky`, índice = progresso × total (piso, limitado ao último), pré-carga obrigatória,
   não sequestrar a rolagem, imagem única como plano B em celular
   (https://www.setproduct.com/blog/how-to-3d-animate-scroll, https://dev.to/bekbrace/creating-a-scrolling-animation-for-apple-airpods-1g0m).
   **Observação pública na Apple (ABERTA, limitada):** a leitura de https://www.apple.com/airpods-pro/ (2026-11-02)
   mostra arquivos com nomes `hero_startframe`/`hero_endframe`, `product-viewer`, `closer_look_`, um filme em HLS (`.m3u8`)
   e um modelo `.usdz` para "ver no seu espaço". É **indício** de quadros-chave em imagem + vídeo em streaming + modelo 3D
   só para realidade aumentada; **não** confirma canvas nem WebGL. Fechar inspecionando no navegador (Rede/Elementos).
   Valores [HIPÓTESE]: suavizar o índice (10 a 15% da distância por quadro), WebP/AVIF, 3 a 10 MB para 100 a 150 quadros.
2. **Vídeo controlado pela rolagem** (`currentTime`): [HIPÓTESE] exige quadro-chave frequente; não verificado.
3. **WebGL com material físico.** Valores (**ABERTA**, https://threejs.org/docs/pages/MeshPhysicalMaterial.html):

| Propriedade | Padrão | Faixa | Uso |
|---|---|---|---|
| `transmission` | 0 | 0 a 1 | 1 para vidro; `opacity` 1 |
| `ior` | 1,5 | 1,0 a 2,333 | vidro comum |
| `thickness` | 0 | espaço da malha | maior que 0 = volume |
| `attenuationColor`/`Distance` | branco/infinito | cor / maior que 0 | tinge a luz pela espessura |
| `clearcoat`/`clearcoatRoughness` | 0/0 | 0 a 1 | verniz |
| `iridescence` | 0 | 0 a 1 | reflexo que muda com o ângulo; `iridescenceIOR` 1,3; espessura 100 a 400 nm |
| `dispersion` | 0 | 0 ou mais | aberração cromática, só em transmissivo |

   - O material custa mais por pixel; "para melhor resultado, sempre defina um mapa de ambiente" (mesma página, ABERTA).
   - **Custo da transmissão (ABERTA, https://threejs.org/docs/pages/WebGLRenderer.html):** `renderer.transmissionResolutionScale`
     (padrão 1) renderiza o alvo de transmissão em resolução menor, com "melhorias significativas de desempenho"; ex. 0,5.
     A página não descreve a passada extra além disso.
   - **Mapeamento de tons (ABERTA, mesma página):** constantes `NoToneMapping, Linear, Reinhard, Cineon, ACESFilmic,
     Custom, AgX, Neutral`; padrão `NoToneMapping`; `toneMappingExposure` padrão 1; para HDR com pós-processamento,
     `outputBufferType: HalfFloatType`.
   - **Khronos PBR Neutral (ABERTA, https://github.com/KhronosGroup/ToneMapping/blob/main/PBR_Neutral/README.md):** para fluxo
     PBR com entrada Rec.709 e saída sRGB; reproduz exatamente a cor base entre 0,08 e 0,8 por canal (dielétrico brilhante
     de frente, luz branca); sem desvio de matiz; comprime só realces; início da compressão K_s = 0,76 (0,8 − 0,04) e
     dessaturação K_d = 0,15. A página não compara com ACES/AgX (a comparação segue só BUSCA:
     https://discourse.threejs.org/t/tone-mapping-overview/75204).
   - **Ainda [HIPÓTESE]:** `RoomEnvironment` + `PMREMGenerator` como ambiente sem arquivo HDR; ambiente próprio com faixas
     claras; sombra de contato; `LatheGeometry`/`TorusGeometry`/`ExtrudeGeometry` para lente e anel;
     `setPixelRatio(min(dpr, 2))`; peso do three.js.

### B2. Movimento
- **Molas (ABERTA, https://developer.apple.com/videos/play/wwdc2023/10158/):** parâmetros duração (perceptual) e bounce
  (−1 a 1); bounce 0 é o padrão geral; ~15% quase imperceptível; ~30% perceptível; acima de ~0,4 exagera na maioria das
  interfaces; comece pela duração, depois ajuste o bounce; **mola retargetada em voo usa a velocidade atual** (interrupção
  suave); ease-in-out não representa velocidade inicial. Fórmulas (massa 1): rigidez = (2π ÷ duração)²; amortecimento =
  1 − 4π × bounce ÷ duração (bounce ≥ 0), ou 4π ÷ (duração + 4π × bounce) (bounce < 0). Exemplo da sessão: duração 0,6, bounce 0,2.
- **Mola na web (ABERTA, https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear):** `linear()` aceita
  vários pontos; valores acima de 1 criam overshoot; serve para uma mola amostrada em CSS; **Baseline: amplamente
  disponível desde dezembro de 2023**; 30 a 60 pontos costumam bastar; o MDN indica um gerador visual (linear-easing-generator.netlify.app).
- **Continuidade de objeto (ABERTA, MDN https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API e Chrome
  https://developer.chrome.com/docs/web-platform/view-transitions/same-document e .../cross-document):**
  - `view-transition-name` igual nos dois estados; nomes únicos (duplicado cancela); só uma transição por vez (a nova
    pula a antiga ao fim); callbacks assíncronos congelam a página (buscar dados antes).
  - Suporte: mesma página, Chrome 111; `view-transition-class` Chrome/Edge 125, Firefox 144, Safari 18.2; **entre páginas**:
    Chrome/Edge 126, Safari 18.2, **Firefox não**; exige mesma origem, `@view-transition { navigation: auto }` nas duas
    páginas e `pagereveal` em script clássico no `<head>`.
  - Durações dos exemplos do Chrome: 90 ms saída + 210 ms entrada com 300 ms de deslize; 150 ms saída e 300 ms entrada;
    500 ms para o círculo. O guia não recomenda duração: são exemplos.
- **Interrupção e movimento opcional (ABERTA, HIG, https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json):**
  movimento realista que segue o gesto; feedback breve; deixar cancelar; evitar em interações frequentes; nunca único meio de informar.
- **Velocidade (ABERTA, https://web.dev/articles/animations-guide):** `transform`/`opacity`; `top`/`left` custaram 50% de
  quadros no teste do guia; `will-change` com moderação.
- **Ainda [HIPÓTESE]:** curva `cubic-bezier(0.32, 0.72, 0, 1)`, entradas 250–450 ms e saídas 150–250 ms (os exemplos do
  Chrome vão de 90 a 500 ms), escalonamento 30–60 ms, desfoque de movimento com `blur()`.

### B3. Acabamento
- **Cantos contínuos (ABERTA, https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape):** `squircle` = `superellipse(2)`;
  depende de `border-radius`; sombra, borda e `backdrop-filter` seguem a forma; experimental, disponibilidade limitada; plano B com `@supports not`.
- **Tamanho óptico (ABERTA, https://developer.mozilla.org/en-US/docs/Web/CSS/font-optical-sizing):** `auto` é o padrão; só
  tem efeito em fonte com eixo `opsz` (inferência da leitura); texto grande fica mais delicado, com mais contraste de traço; Baseline desde março de 2020.
- **Quebra de linha (ABERTA, https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap):** `balance` para títulos (não se
  aplica acima de 6 linhas no Chromium e 10 no Firefox); `pretty` para texto corrido, mais lento; Baseline desde março de 2024.
- **Densidade (ABERTA, https://playwright.dev/docs/api/class-browser, `newContext`):** `deviceScaleFactor` (padrão 1);
  `reducedMotion` `"reduce"` emula a preferência; `recordVideo.fps` padrão 25 (baixo demais para medir fluidez).
- **Grão contra banding (BUSCA, [HIPÓTESE]):** `feTurbulence` + `mix-blend-mode: overlay`, frequência 0,6–1,0, opacidade
  0,2–0,4 (valor de quem vende gerador); limitado em degradês longos. Não aberto.
- **Ainda [HIPÓTESE]:** hairline 0,5 px, 3 sombras em camada, tracking −0,02 a −0,04, `tabular-nums`, contraste 4,5:1.

## (c) Como verificar automaticamente
1. **Relógio controlado (ABERTA, https://playwright.dev/docs/api/class-clock):** `page.clock.install()` troca `Date`,
   `setTimeout`/`setInterval`, **`requestAnimationFrame`**, `requestIdleCallback` e `performance` por versões falsas;
   `pauseAt(t)` salta e pausa; `runFor(ms)` avança disparando tudo; `fastForward` dispara cada timer no máximo uma vez
   (não serve para animação); `resume` volta ao normal; vale para o contexto inteiro. **Receita:** instalar, `pauseAt`,
   depois repetir `runFor(16.7)` + `screenshot` para montar a tira (rAF e WebGL).
2. **Congelar animações CSS/WAAPI (ABERTA, https://playwright.dev/docs/api/class-page, `screenshot`):** `animations: 'disabled'`
   para CSS, transições e Web Animations; finitas vão ao fim (disparam `transitionend`), infinitas voltam ao início e
   retomam depois; `scale: 'device'` (padrão) dá 1 pixel por pixel do aparelho, `'css'` 1 por pixel CSS. Para ver quadros
   intermediários não use `disabled`: use o relógio (item 1).
3. **Protocolo do Chrome (ABERTA, https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json):**
   - `Animation.setPlaybackRate`, `Animation.setPaused`, `Animation.seekAnimations(currentTime)` existem (domínio **experimental**).
   - `Emulation.setDeviceMetricsOverride` aceita `deviceScaleFactor` (0 desliga); `Emulation.setVirtualTimePolicy` é **experimental** (tempo virtual).
   - `HeadlessExperimental.beginFrame` envia um quadro e devolve captura, mas exige alvo criado com `BeginFrameControl`;
     o domínio é **experimental** e `enable`/`disable` estão **obsoletos**. A página https://developer.chrome.com/docs/chromium/new-headless
     (ABERTA) diz que o modo antigo, separado, só existe como binário `chrome-headless-shell` desde a 132 e não fala de
     `beginFrame`: **trate `beginFrame` como arriscado**; prefira o relógio do Playwright.
4. **Quadros perdidos:** [HIPÓTESE] medir intervalos de `requestAnimationFrame` durante rolagem real (sem relógio falso) e
   reprovar com mais de 2% acima de 20 ms ou algum acima de 50 ms; o valor absoluto no Chromium sem janela não vale (comparar relativo).
5. **Suavidade e interrupção:** [HIPÓTESE] posições por quadro (da tira) → velocidade e aceleração; salto de velocidade no
   primeiro/último quadro = parada seca; reverter na metade e checar salto de posição ≤ 2 px.
6. **Banding:** [HIPÓTESE] no PNG 8 bits, medir trechos longos de valor idêntico em degradê (por exemplo mais de 24 px a 2×).
   Só vale se o teste falhar sem grão e passar com grão.
7. **Nitidez a 2×:** [HIPÓTESE] reduzir a captura 2× e comparar com a 1× (SSIM); variância do Laplaciano em recortes de texto/borda.
8. **Leitura estática:** CSS computado e varredura do código (propriedades animadas, `will-change`, `@supports`, `tabular-nums`).

## O que vira regra do plugin (só itens ABERTA)
1. Todo material de vidro/lente em WebGL define mapa de ambiente e `thickness` maior que 0; usa `transmission`, `ior`,
   `clearcoat` conforme a tabela; reduz custo com `transmissionResolutionScale`.
2. Mapeamento de tons explícito: `NeutralToneMapping` para produto bem iluminado; `AgX`/`ACESFilmic` para cena HDR.
3. Movimento de interface com mola (duração + bounce), bounce 0 por padrão e no máximo ~0,4; interrupção continua da
   velocidade atual; animação cancelável; movimento nunca é o único meio de informar.
4. Mola em CSS por `linear()` amostrada (30 a 60 pontos).
5. Animar só `transform` e `opacity`; `will-change` só onde necessário.
6. Continuidade de objeto por `view-transition-name` único; respeitar os limites (uma transição por vez; entre páginas só
   mesma origem; Firefox sem suporte entre páginas); plano B sem a transição.
7. Respeitar `prefers-reduced-motion`; testar com `reducedMotion: 'reduce'`.
8. Tipografia: `font-optical-sizing: auto` com fonte que tenha `opsz`; `text-wrap: balance` em títulos (até 6 linhas); `pretty` em texto corrido.
9. Cantos contínuos com `corner-shape: squircle` só com `@supports` e raio simples de plano B.
10. Provas visuais: capturas com `deviceScaleFactor: 2`; quadros por `page.clock` (`install` + `pauseAt` + `runFor` + `screenshot`);
    não depender de `HeadlessExperimental.beginFrame`.

## Sites premiados (Awwwards, ABERTA 2026-11-02, só tags; a página não traz comentário de júri)
| Site (SOTD) | Tags de tecnologia | Fonte |
|---|---|---|
| MECHA (31/10/2026) | Webflow, GSAP, Three.js, animação, parallax, microinterações | https://www.awwwards.com/sites/mecha |
| Spyker Cars (30/10/2026) | E-commerce, luxo, 3D, WebGL, GSAP, rolagem, transições, storytelling | https://www.awwwards.com/sites/spyker-cars |
| Forge Automotive (25/10/2026) | WebGL, GSAP, Next.js, rolagem infinita, parallax; destaques "exaustão em WebGL" e "luz pontual falso 3D" | https://www.awwwards.com/sites/forge-automotive |

Padrão nos 3: **GSAP** para coreografia e **WebGL/Three.js** onde há 3D; um deles destaca "falso 3D" (luz que acompanha o
ponteiro) em vez de modelo real. A leitura dos próprios sites (spykercars.com, forgeautomotive.co.uk, mecha-xyz.webflow.io)
só devolveu texto e nomes de imagem: não deu para ver canvas, scripts ou modelos; fica só o que as tags dizem. A página
"Grids" (SOTD de 02/11/2026) deu 404 no endereço que tentei. Pedido era 3 a 5 sites; cumprido com 3, todos de outubro de 2026
(nenhum de 2025: não pesquisei a lista de 2025).

## (d) Fontes (acessadas em 2026-11-02)
| Fonte | Quem publica (interesse) | Estado |
|---|---|---|
| https://threejs.org/docs/pages/MeshPhysicalMaterial.html ; https://threejs.org/docs/pages/WebGLRenderer.html | Projeto three.js (oficial) | ABERTA |
| https://github.com/KhronosGroup/ToneMapping/blob/main/PBR_Neutral/README.md | Khronos Group (consórcio de padrões) | ABERTA |
| https://developer.apple.com/videos/play/wwdc2023/10158/ ; https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json | Apple (oficial) | ABERTA |
| MDN: .../CSS/easing-function/linear ; .../CSS/font-optical-sizing ; .../CSS/text-wrap ; .../CSS/corner-shape ; .../API/View_Transition_API (base https://developer.mozilla.org/en-US/docs/Web) | MDN (Mozilla e comunidade) | ABERTA; páginas longas lidas nos primeiros 100 mil caracteres, e a tabela de compatibilidade não veio: suporte tirado da frase "Baseline" do MDN e dos guias do Chrome |
| https://developer.chrome.com/docs/web-platform/view-transitions/same-document ; .../cross-document ; https://web.dev/articles/animations-guide ; https://developer.chrome.com/docs/chromium/new-headless | Google (equipe do Chrome; interesse: promover a plataforma) | ABERTA |
| https://playwright.dev/docs/api/class-clock ; .../class-page ; .../class-browser | Microsoft (Playwright, oficial) | ABERTA |
| https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | Chrome DevTools (oficial) | ABERTA (domínios Animation, Emulation, HeadlessExperimental; a versão em HTML só dava redirecionamento) |
| https://www.awwwards.com/sites/mecha ; .../spyker-cars ; .../forge-automotive | Awwwards (prêmio comercial; tags informadas pelos autores) | ABERTA (tags) |
| https://www.apple.com/airpods-pro/ | Apple (oficial) | ABERTA (só texto e nomes de arquivos) |
| https://www.setproduct.com/blog/how-to-3d-animate-scroll ; https://dev.to/bekbrace/creating-a-scrolling-animation-for-apple-airpods-1g0m ; https://css-tricks.com/?p=308477 ; https://github.com/Rachit-Pal/Apple-Scroll-Animation/blob/master/app.js | Blogs e exemplo de terceiros | BUSCA |
| https://discourse.threejs.org/t/tone-mapping-overview/75204 ; https://instantgradient.com/blog/grainy-gradients ; https://frontendmasters.com/blog/grainy-gradients/ | Fórum; blogs | BUSCA (não abertos) |

Buscas feitas na 1ª rodada, para refazer: "Apple AirPods Pro page scroll animation image sequence canvas how it works frames";
"WWDC23 Animate with springs duration bounce response dampingFraction"; "three.js AgX tone mapping vs ACES filmic PBR neutral
Khronos"; "gradient banding fix noise dithering CSS SVG feTurbulence overlay 8-bit"; "Playwright screenshot animations
disabled deviceScaleFactor 2; CDP Page.startScreencast frames headless chromium".

## Pendências
- Canvas/WebGL/vídeo na Apple e nos sites premiados: só se confirma inspecionando no navegador (Rede/Elementos). Páginas de
  iPhone e Vision Pro não foram vistas; só a de AirPods Pro.
- Awwwards de 2025 não foi pesquisado.
- Seguem [HIPÓTESE]: 10 linhas do checklist (ver contagem) e valores de receita listados em "Ainda [HIPÓTESE]".
- Exemplos do three.js (`RoomEnvironment`, sombra de contato) e `Page.startScreencast` do protocolo: não abertos.
