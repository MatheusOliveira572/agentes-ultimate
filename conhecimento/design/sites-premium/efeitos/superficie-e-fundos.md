<!-- Texto próprio do agentes-ultimate, a partir do estudo de efeitos de 2026-11-01 (docs/referencias-efeitos-2026-11.md): técnica descrita em palavras, nada copiado. -->
<!-- ref: tema=efeito-superficie; palavras=brilho que segue o mouse, spotlight, borda animada, borda de luz, shimmer, inclinacao 3d, tilt, aurora, gradiente animado, malha de gradiente, mesh gradient, ruido de fundo, grade de pontos; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=quero um brilho que segue o mouse nos cartões | faça um fundo com aurora e malha de gradiente; nao=calcule o custo médio ponderado do estoque -->
# Superfície, luz e fundos

Repertório, não lista de compras. Origem: [VISTO] nas referências estudadas, [MERCADO] padrão público. Tempos e medidas são [ESTIMATIVA: ponto de partida nosso], salvo [MEDIDO]; o que a bancada provou está em `provas.md`. Regras comuns: `INDICE.md`.

## A. Superfície e luz

### A1. Vidro [VISTO]
Ver `../../apple/materiais.md`. Em landing page, só cartão com pouca transparência (72–88%) sobre fundo calmo: cor única ou
luz larga, sem foto nem movimento atrás. Em tela de produto, só navegação e controles. **Exagera:** em tudo; sobre texto em
movimento; translúcido sem desfoque. **Reduzido:** sem reflexo animado; com transparência reduzida, opaco.

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

### B4. Ruído e granulado [VISTO, pelo aspecto]
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
