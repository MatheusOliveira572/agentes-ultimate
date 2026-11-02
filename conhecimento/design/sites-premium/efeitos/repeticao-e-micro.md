<!-- Texto próprio do agentes-ultimate, a partir do estudo de efeitos de 2026-11-01 (docs/referencias-efeitos-2026-11.md): técnica descrita em palavras, nada copiado. -->
<!-- ref: tema=efeito-repeticao; palavras=marquee, orbita de logos, flutuacao de cartao, confete, botao magnetico, cursor proprio, seletor deslizante, esqueleto de carga, skeleton, webgl, shader de fundo; agentes=designer-sites, engenheiro-software -->
<!-- teste-ref: sim=faça um marquee de logos e um botão magnético | quero cursor próprio e esqueleto de carga; nao=calcule o custo médio ponderado do estoque -->
# Repetição, micro-interações e avançados

Repertório, não lista de compras. Origem: [VISTO] nas referências estudadas, [MERCADO] padrão público. Tempos e medidas são [ESTIMATIVA: ponto de partida nosso], salvo [MEDIDO]; o que a bancada provou está em `provas.md`. Regras comuns: `INDICE.md`.

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
- **Medidas:** ver `../r02-heroi-com-simulacao.md`.
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
- **Técnica:** evento de ponteiro na área em volta; deslocamento proporcional à distância, limitado, só em `transform`; ao sair, volta com transição.
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
- **Técnica:** `:hover` dentro de `@media (hover: hover)`; `transform` no cartão e na imagem; a sombra maior num pseudo-elemento que só muda `opacity`.
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
- **Técnica:** traço SVG com `pathLength="1"` e `stroke-dashoffset`; aviso em região `role="status"` já presente na página, com `transform` e `opacity`; o tempo para quando o aviso recebe foco ou ponteiro.
- **Medidas:** OK 0,3–0,5 s; aviso visível ≥ 5 s, com tempo pausado ao focar.
- **Reduzido:** aparece direto, com `aria-live="polite"`.

### F8. Esqueleto de carga [MERCADO]
- **O que é:** blocos do tamanho do conteúdo, com brilho lento.
- **Técnica:** blocos com a altura do conteúdo final (sem pulo ao trocar); brilho num pseudo-elemento movido por `transform`; só aparecem depois de um `setTimeout` de 200–300 ms.
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
