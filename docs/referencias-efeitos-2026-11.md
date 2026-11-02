# Catálogo de efeitos para sites (2026-11-01)

Par de `docs/referencias-visuais-2026-11.md`. **Repertório, não lista de compras:** escolha um movimento dominante por tela,
a serviço da ideia do projeto, e vá além quando fizer sentido.

**Origem de cada item:**
- **[VISTO]**: observado em Finmate, Calen ou Dinzo (nomes de animação no CSS, capturas, estilo calculado). Sem mouse: o que
  depende de passar o mouse não foi visto em uso.
- **[MERCADO]**: padrão público conhecido. **Não** veio dos sites Nivora e Code and Chill, bloqueados pela rede da
  organização: este catálogo não inventaria o que eles têm.
- **Medidas e tempos são [ESTIMATIVA: ponto de partida nosso]**, salvo marca [MEDIDO]. **Nenhum efeito foi construído e
  testado nesta tarefa**: o lote de construção precisa provar cada um e medir o quadro no aparelho.

Texto próprio; técnica descrita em palavras, nada copiado.

## Regras comuns

- **Só `transform` e `opacity` quando puder.** Animar `width`, `top`, `box-shadow`, `filter` ou `backdrop-filter` custa mais.
- **Loop parado fora da tela:** `IntersectionObserver` pausa; `document.hidden` também; `animation-play-state` em CSS.
- `will-change` só durante o efeito, nunca em massa.
- **Movimento reduzido:** todo efeito tem alternativa. Regra base: sem deslocamento, escala, loop nem paralaxe; se a mudança
  importa, um esmaecimento de até 0,2 s.
- **Mexe sozinho por mais de 5 s, junto de outro conteúdo:** precisa de meio de pausar, parar ou esconder (WCAG 2.2.2).
- **Nunca mais de 3 flashes por segundo** (WCAG 2.3.1).
- **Animação vinda de interação** deve poder ser desligada (WCAG 2.3.3, AAA): respeite a preferência do sistema.
- **Conteúdo existe sem o efeito:** sem JS, o texto aparece. Nunca `opacity: 0` em CSS sem a classe que o JS põe.
- **Fim do movimento = estado legível e completo.** Captura em qualquer instante não deve ter texto invisível.
- **Teto:** até 3 tipos de efeito por página, 1 dominante. Em painel de decisão, só resposta e transição.

Tempos de referência: resposta 0,1–0,2 s; transição 0,2–0,4 s; entrada 0,5–0,7 s ([MEDIDO] nos sites); fundo 8–40 s por ciclo.
Curvas: desaceleração longa, `cubic-bezier(.16,1,.3,1)` ou `(.22,1,.36,1)` ([MEDIDO]) para entrar; `ease-out` curto para responder.

## A. Superfície e luz

### A1. Vidro [VISTO]
Ver `referencias-visuais`, seção 4. Desfoque e translucidez sobre fundo variado. **Exagera:** em tudo; sobre texto em
movimento. **Reduzido:** sem reflexo animado.

### A2. Brilho que segue o mouse (spotlight) [MERCADO]
- **O que é:** luz radial suave sobre uma grade de cartões, ou na borda deles, onde o ponteiro está.
- **Técnica:** evento de ponteiro grava `--x` e `--y` por `requestAnimationFrame`; camada com gradiente radial centrado nelas; para
  a borda, a luz fica em um pseudo-elemento recortado por máscara.
- **Medidas:** raio 200–500 px; opacidade 6–15% no escuro; responde em 1 quadro; some em 0,2–0,3 s ao sair.
- **Onde:** bento e seção escura. **Exagera:** em tela inteira, ou como única pista de interação.
- **Desempenho:** barato; só uma camada, sem desfoque.
- **Celular:** não há ponteiro: desligue com `@media (hover: none)`.
- **Reduzido:** luz fixa ou nenhuma.

### A3. Borda animada ou de luz [VISTO em parte; MERCADO]
- **O que é:** um traço de luz percorre a borda, ou a borda tem gradiente que gira.
- **Técnica:** `conic-gradient` com ângulo animado (`@property` registrando o ângulo) atrás do cartão, com a parte interna coberta; ou máscara composta para mostrar só o anel.
- **Medidas:** borda 1–2 px; 3–8 s por volta; uma única peça por tela (o plano recomendado).
- **Onde:** um destaque. **Exagera:** em vários cartões; parece cassino.
- **Desempenho:** ok; onde `@property` falhar, a borda fica estática.
- **Celular:** igual, ou estática.
- **Reduzido:** borda estática de acento.

### A4. Brilho colorido na ação [VISTO]
- **O que é:** o botão parece emitir luz da própria cor.
- **Técnica:** sombra na cor do acento + 1 px de luz interna no topo. [MEDIDO] 0 4–10 px, 14–28 px, opacidade 0,35–0,4; luz interna 1 px a 0,1–0,28.
- **Onde:** uma ação principal. **Exagera:** em todo botão; o brilho deixa de significar "faça isto".
- **Desempenho:** transição de sombra: use pseudo-elemento com opacidade.
- **Celular:** igual.
- **Reduzido:** igual, sem pulsar.

### A5. Faixa de brilho que passa (shimmer) [VISTO]
- **O que é:** uma faixa clara atravessa um elemento uma vez ou de tempos em tempos.
- **Técnica:** pseudo-elemento inclinado, com gradiente, cortado pelo pai com `overflow: hidden`, deslocado em `transform`.
- **Medidas:** 0,8–1,5 s, com pausa de 4–8 s; 15–30% de opacidade.
- **Onde:** selo, plano recomendado, esqueleto de carga. **Exagera:** em loop rápido.
- **Reduzido:** nada.

### A6. Pulso e anel [VISTO]
- **O que é:** um ponto emite anéis, indicando "ao vivo" ou uma conexão.
- **Técnica:** pseudo-elemento escala de 1 a 2–3 e some.
- **Medidas:** 1,5–3 s; anel a 30–60%.
- **Onde:** status real, hub. **Exagera:** "ao vivo" em algo que não é.
- **Reduzido:** ponto parado.

### A7. Inclinação 3D em cartão [MERCADO]
- **O que é:** o cartão gira levemente na direção do ponteiro.
- **Técnica:** `perspective` no pai; ângulos pelo ponteiro, por `requestAnimationFrame`, com suavização; camada de reflexo opcional.
- **Medidas:** 3–8° no máximo; perspectiva 800–1200 px; volta em 0,3–0,5 s; deslocamento das camadas internas em 8–24 px.
- **Onde:** cartão de produto, mockup, peça única. **Exagera:** em texto longo ou em toda a grade: dá enjoo e atrapalha a leitura.
- **Desempenho:** só `transform`.
- **Celular:** desligado; nada de giroscópio sem pedido.
- **Reduzido:** sem giro; no máximo mudança de sombra.

## B. Fundos

### B1. Gradiente radial estático [VISTO, MEDIDO]
- **O que é:** luzes grandes sobre cor base.
- **Técnica:** várias camadas de `radial-gradient`. [MEDIDO] raios 600–1300 px; opacidade 12–80%; somem em 55–90%.
- **Onde:** fundo de herói e bloco invertido. **Exagera:** faixas visíveis em gradiente longo: some ruído.
- **Desempenho:** muito leve, sem animação.
- **Celular:** raios proporcionais à largura (em %).
- **Reduzido:** é o estado natural.

### B2. Gradiente animado e aurora [MERCADO]
- **O que é:** manchas coloridas que derivam devagar.
- **Técnica:** 2–4 elementos grandes com cor e desfoque **pré-pintados** em gradiente radial, movidos só por `transform`; opcional, cor pré-renderizada em imagem leve.
- **Medidas:** 15–40 s por ciclo; deslocamento 5–15% da largura; poucas cores próximas.
- **Onde:** herói e fim de página. **Exagera:** cores saturadas sob texto; atrás de toda a página.
- **Desempenho:** evite `filter: blur` animado; pause fora da tela.
- **Celular:** 1–2 manchas, ou imagem parada.
- **Reduzido:** quadro fixo.

### B3. Malha de gradiente (mesh) [MERCADO]
- **O que é:** transição orgânica entre 3–5 cores.
- **Técnica:** várias radiais sobrepostas ou imagem otimizada (AVIF/WebP); versão viva em canvas ou WebGL só com motivo real.
- **Medidas:** cores vizinhas na mesma família; texto só sobre região calma.
- **Onde:** capa, imagem de produto. **Exagera:** como marca: é genérico.
- **Desempenho:** imagem é o mais leve; WebGL pesa em bateria.
- **Celular:** imagem.
- **Reduzido:** imagem parada.

### B4. Ruído e granulado [VISTO no Finmate, pelo aspecto]
- **O que é:** textura fina que tira o aspecto plástico e reduz faixas.
- **Técnica:** imagem pequena repetida, ou SVG `feTurbulence` já renderizado como imagem. Mistura `overlay` ou `soft-light`.
- **Medidas:** 2–6% de opacidade; tela 128–256 px.
- **Onde:** fundos escuros e gradientes. **Exagera:** visível como sujeira; sobre texto pequeno.
- **Desempenho:** `feTurbulence` vivo é caro; camada fixa em tela inteira com `mix-blend-mode` também: prefira só a seção.
- **Reduzido:** igual (é estático).

### B5. Grade, pontos e linhas de fundo [MERCADO]
- **O que é:** padrão técnico que some nas bordas.
- **Técnica:** gradientes lineares ou radiais repetidos + máscara radial.
- **Medidas:** passo 24–64 px; linha 1 px a 4–10%.
- **Onde:** produto técnico. **Exagera:** é o clichê atual do setor; mude escala ou desenho.
- **Reduzido:** igual.

### B6. Curva ou corte entre seções [VISTO]
- **O que é:** um bloco entra no outro por curva ou cartão sobreposto.
- **Técnica:** `border-radius` amplo no bloco seguinte e margem negativa; ou SVG com a mesma cor.
- **Medidas:** raio 24–48 px; sobreposição de 40–120 px.
- **Celular:** raio 20–28 px.
- **Reduzido:** igual.

### B7. Ilustração em cena animada [VISTO]
- **O que é:** pequena história decorativa de fundo (um objeto cruza o céu, por exemplo).
- **Técnica:** SVG com `transform` ao longo de `offset-path`; camadas com velocidades distintas.
- **Medidas:** 10–30 s; área pequena.
- **Onde:** uma vez, ligado ao tema. **Exagera:** como decoração sem relação.
- **Reduzido:** cena parada; pausa fora da tela.

## C. Rolagem

### C1. Entrada ao rolar [VISTO, MEDIDO]
- **O que é:** o bloco aparece subindo levemente.
- **Técnica:** `IntersectionObserver` adiciona classe; classe faz `opacity` e `translateY`. Cada item uma vez, e então parar de observar. Alternativa só em CSS: `animation-timeline: view()`, mas **não é Baseline** (MDN): use com `@supports`.
- **Medidas:** deslocamento 12–32 px; 0,5–0,7 s; escalonar em 40–80 ms, até 4–6 itens.
- **Onde:** títulos e grupos principais. **Exagera:** em cada parágrafo; rolagem rápida vira espera.
- **Desempenho:** barato.
- **Celular:** deslocamento menor; sem atraso longo.
- **Reduzido:** aparece direto, ou esmaece em 0,2 s.
- **Cuidado:** captura de tela, impressão e busca do navegador têm de ver o texto; dispare o fim ao chegar perto.

### C2. Parallax [VISTO em parte; MERCADO]
- **O que é:** camadas rolam em velocidades diferentes.
- **Técnica:** `transform` por `animation-timeline: scroll()` com `@supports`, ou `requestAnimationFrame` lendo a posição uma vez por quadro.
- **Medidas:** diferença de 10–30%, deslocamento total até 60–120 px.
- **Onde:** imagem de impacto ou mockup. **Exagera:** em texto; deslocamento grande causa enjoo.
- **Desempenho:** nunca ler layout no evento de rolagem sem controle.
- **Celular:** desligado ou mínimo.
- **Reduzido:** nenhum.

### C3. Seção presa com passos (scrollytelling) [MERCADO]
- **O que é:** o visual fica preso e muda conforme o texto rola.
- **Técnica:** `position: sticky` + `IntersectionObserver` por passo.
- **Medidas:** cada passo com 60–100 vh; 3–5 passos.
- **Onde:** um processo explicável. **Exagera:** mais de um por página; rolagem sequestrada.
- **Celular:** vira sequência normal (imagem + texto).
- **Reduzido:** sequência normal.
- **Regra:** nunca alterar a velocidade natural da rolagem.

### C4. Linha que se desenha [VISTO]
- **O que é:** traço aparece seguindo o caminho.
- **Técnica:** `stroke-dasharray` e `stroke-dashoffset` em SVG, com `pathLength="1"`.
- **Medidas:** 0,8–1,4 s uma vez; ou ligado à rolagem.
- **Onde:** passos, gráfico, sublinhado à mão em palavra-chave [VISTO]. **Exagera:** gráfico com dados que demoram para aparecer.
- **Reduzido:** traço completo.

### C5. Transição entre páginas ou seções [MERCADO]
- **O que é:** a peça muda de lugar ou a tela esmaece, com continuidade.
- **Técnica:** View Transitions API, com a navegação normal funcionando sem ela.
- **Medidas:** 0,2–0,4 s; peça compartilhada com o mesmo nome.
- **Onde:** catálogo → detalhe. **Exagera:** cortina ou limpeza de tela a cada troca.
- **Reduzido:** sem deslocamento; suporte conferido na hora de construir.

### C6. Cartões empilhados e revelação por máscara [MERCADO]
- **O que é:** cartões presos que se empilham, ou imagem que se abre por recorte.
- **Técnica:** `position: sticky` com `top` crescente; `clip-path` animado na entrada.
- **Medidas:** 3–6 cartões, 16–32 px de diferença; recorte em 0,6–1 s.
- **Celular:** altura menor que a tela, ou o conteúdo some.
- **Reduzido:** lista comum.

## D. Texto e números

### D1. Número que sobe [MERCADO; VISTO em saldo que entra]
- **O que é:** o valor conta até o final ao entrar na tela.
- **Técnica:** `requestAnimationFrame` com desaceleração, formatação por `Intl.NumberFormat`; largura fixada por `tabular-nums`.
- **Medidas:** 0,8–1,5 s; uma vez; começar perto do final (70–90%) em número grande.
- **Onde:** prova de impacto. **Exagera:** número financeiro em painel (parece instável); muitos juntos.
- **Celular:** igual.
- **Reduzido:** final direto. Leitor de tela lê o final; marque a parte animada com `aria-hidden`.
- **Sem JS:** o HTML já traz o número final.

### D2. Título que entra por palavra ou linha [MERCADO]
- **O que é:** partes sobem de trás de uma máscara.
- **Técnica:** dividir em spans por linha (com `overflow: hidden`) depois de a fonte carregar; manter o texto inteiro acessível.
- **Medidas:** 0,5–0,8 s; 30–60 ms entre partes.
- **Onde:** o título do herói, uma vez. **Exagera:** todos os títulos; palavras em atraso escondem a mensagem na dobra.
- **Reduzido:** título inteiro direto.

### D3. Palavra em destaque [VISTO]
- **O que é:** uma palavra em cor de acento, ou gradiente, ou sublinhada.
- **Técnica:** `span`; se em gradiente, `background-clip: text`, com cor sólida de reserva.
- **Medidas:** 1–3 palavras por título; contraste próprio medido.
- **Onde:** herói. **Exagera:** em todo título; gradiente em palavra virou clichê.
- **Reduzido:** igual.

### D4. Texto que troca ou se digita [MERCADO; VISTO em conversa]
- **O que é:** palavra rotativa ou digitação.
- **Técnica:** alterna em `translateY`/`opacity`; largura reservada para a palavra mais longa.
- **Medidas:** 2–3 s por palavra; 3–5 palavras; digitação 25–50 ms por caractere.
- **Onde:** um lugar, uma vez. **Exagera:** a frase não se lê parada.
- **Reduzido:** primeira palavra fixa; frase inteira legível. Pausa se durar mais de 5 s; `aria-live` desligado.

### D5. Título ligado à rolagem [MERCADO]
- **O que é:** o texto preenche a cor conforme se rola.
- **Técnica:** `background-size` com `background-clip: text`, ou spans. Use `animation-timeline` com reserva.
- **Medidas:** contraste mínimo já no estado inicial.
- **Exagera:** parágrafo que só se lê rolando.
- **Reduzido:** texto completo.

### D6. Gráfico que se desenha [VISTO]
- **O que é:** barras crescem, anel se fecha.
- **Técnica:** `scaleX` ou `scaleY` com origem na base; `stroke-dashoffset`.
- **Medidas:** 0,4–1 s, uma vez, sem esperar a leitura. Em painel, ver a decisão do projeto, quando houver.
- **Reduzido:** valor final.

## E. Repetição contínua

### E1. Marquee [VISTO]
- **O que é:** fila que passa sem fim (logos, depoimentos).
- **Técnica:** conteúdo duplicado; `translateX` de 0 a −50%; máscara nas pontas. Duas fileiras opostas para depoimentos [VISTO].
- **Medidas:** logos em 20–40 s; depoimentos em 40–70 s; velocidade constante em px/s; 60–120 px de esmaecido.
- **Onde:** prova secundária. **Exagera:** com informação que se precisa ler; quantidade pequena de itens.
- **Desempenho:** só `transform`; pausa fora da tela.
- **Celular:** igual ou deslize manual.
- **Reduzido:** fila estática com rolagem manual. **Sempre:** botão de pausa; cópia com `aria-hidden`.

### E2. Órbita e feixes [VISTO]
- **O que é:** logos giram em anéis; feixes correm pelas ligações.
- **Técnica:** anel gira e cada logo contragira para ficar em pé; feixe com `offset-path` ou `stroke-dashoffset`.
- **Medidas:** anel 30–90 s por volta; feixe 1,5–3 s com pausa.
- **Exagera:** vários anéis rápidos; logo em movimento é difícil de identificar.
- **Celular:** anéis parados.
- **Reduzido:** parado. Pausa disponível.

### E3. Flutuação [VISTO]
- **O que é:** um cartão ou personagem oscila levemente.
- **Técnica:** `translateY` alternado.
- **Medidas:** 4–12 px; 3–6 s; atrasos diferentes.
- **Exagera:** tudo flutuando, como se não tivesse peso.
- **Reduzido:** parado.

### E4. Cena de produto em ciclo [VISTO]
- **O que é:** itens entram, são classificados, somem; saldo muda.
- **Técnica:** linha do tempo de estados por classes; valores de uma lista fixa; ciclo reiniciado sem pulo.
- **Medidas:** ver R2 de `referencias-visuais`.
- **Reduzido:** cena final completa.

### E5. Queda de objetos e confete [VISTO]
- **O que é:** objetos caem como celebração ou ideia de categorizar.
- **Técnica:** poucas peças com `transform`, ou canvas; uma vez, ligado a um gesto.
- **Medidas:** 0,8–2 s; até 20–40 peças.
- **Exagera:** em fluxo sério; sem gatilho.
- **Reduzido:** sem queda, apenas confirmação em texto.

## F. Micro-interações

### F1. Botão [VISTO em parte]
- **O que é:** passar o mouse, apertar e carregar têm resposta.
- **Técnica:** passar: fundo 6–10% mais claro ou escuro e −1 a −2 px; apertar: `scale(.97–.99)`; carregar: mantém a largura, indicador dentro; ícone desloca 2–4 px.
- **Medidas:** 0,12–0,2 s; apertar ≤ 0,1 s.
- **Celular:** `:active` sempre, `:hover` só com `@media (hover: hover)`.
- **Reduzido:** só cor.
- **Teclado:** anel de foco de 2 px com 2 px de folga, contraste 3:1.

### F2. Botão magnético [MERCADO]
- **O que é:** o botão se aproxima do ponteiro quando perto.
- **Medidas:** 4–12 px; área 40–80 px; volta com mola em 0,3–0,5 s.
- **Onde:** portfólio, marca ousada. **Exagera:** em fluxo de compra: alvo que se move.
- **Celular:** desligado.
- **Reduzido:** desligado.

### F3. Cursor próprio [MERCADO]
- **O que é:** círculo que segue o ponteiro, ou muda sobre alvos.
- **Técnica:** elemento fixo com `transform`, suavizado, **mantendo o cursor do sistema** quando possível.
- **Medidas:** 12–40 px; atraso ≤ 100 ms.
- **Onde:** portfólio ou experiência, raramente. **Exagera:** em site de venda ou tarefa; atraso frustra.
- **Celular:** não existe.
- **Reduzido:** cursor do sistema. Desligado em `forced-colors`.

### F4. Cartão ao passar o mouse [VISTO, MEDIDO em tempos]
- **O que é:** sobe −2 a −4 px, sombra cresce, imagem cresce 2–4% dentro do recorte.
- **Medidas:** 0,16–0,3 s.
- **Exagera:** em cartão que não é clicável.
- **Celular:** nada; estado `:active` se tocável.
- **Reduzido:** só sombra ou borda.

### F5. Seletor deslizante [VISTO em planos]
- **O que é:** um fundo desliza para a opção escolhida.
- **Técnica:** indicador com `transform`, tamanho lido das opções; ou `anchor` quando houver suporte.
- **Medidas:** 0,2–0,3 s.
- **Reduzido:** troca direta.
- **Acessibilidade:** rádio real por baixo.

### F6. Acordeão [VISTO]
- **O que é:** abre e fecha com altura suave.
- **Técnica:** `grid-template-rows` de 0fr a 1fr, ou altura medida; ícone gira.
- **Medidas:** 0,2–0,3 s.
- **Reduzido:** direto.

### F7. Confirmação e notificação [VISTO em parte]
- **O que é:** marca de OK que se desenha; aviso que entra, some, e permite desfazer.
- **Medidas:** OK 0,3–0,5 s; aviso visível ≥ 5 s, com tempo pausado ao focar.
- **Reduzido:** aparece direto, com `aria-live="polite"`.

### F8. Esqueleto de carga [MERCADO]
- **O que é:** blocos do tamanho do conteúdo, com brilho lento.
- **Medidas:** brilho 1,2–2 s; aparece só depois de 200–300 ms de espera.
- **Reduzido:** sem brilho.

## G. Avançados, com motivo forte

| Efeito | O que é | Cuidado principal | Reserva |
|---|---|---|---|
| WebGL / shader de fundo | fluido, partículas | bateria, GPU fraca, peso | imagem parada |
| Cena 3D interativa | produto para girar | peso do modelo, teclado | imagem + vídeo |
| Vídeo em rolagem | quadros ligados à rolagem | muito pesado no celular | sequência de imagens paradas |
| Texto em cinética grande | título como animação principal | leitura | título parado |
| Pré-carregador de marca | abertura com logo | atrasa o conteúdo: em geral, **não use** | nada |

## Onde exagera, em resumo

Sinais de excesso: mais de 1 coisa chamando a atenção na mesma tela; efeito sem relação com a ideia; qualquer espera para ler;
fundo que disputa com o texto; violeta com brilho sobre preto, ou gradiente em palavra, só porque está na moda.

## Prova exigida do lote de construção

Para cada efeito que entrar em `conhecimento/design/efeitos/`:
1. Página de teste própria, sem código de terceiros.
2. Captura no início, no meio e no fim, e com `prefers-reduced-motion` ligado.
3. Medida em quadros no celular simulado (e em aparelho real quando houver).
4. Teclado e leitor de tela nas partes interativas.
5. Registro de suporte no MDN na data, para os itens não-Baseline: `animation-timeline`, `@property`, View Transitions, `anchor`, `prefers-reduced-transparency`.

Fontes abertas em 2026-11-01:
- MDN, `animation-timeline`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline
- MDN, `backdrop-filter`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- WCAG 2.2.2: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- WCAG 2.3.1: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
- WCAG 2.3.3: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

Suporte de `@property`, View Transitions e `anchor`: citado de conhecimento geral, **não conferido nesta tarefa**.
