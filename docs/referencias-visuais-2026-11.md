# Referências visuais para sites premium (estudo de 2026-11-01)

Fonte de um lote de construção do plugin. **Repertório, não molde:** os sites são fonte de ideias. O designer parte da
direção própria de cada projeto, escolhe e combina o que serve e pode ir além. Nenhuma receita é obrigatória, e nenhuma
sequência de seções é regra. Efeitos estão em `docs/referencias-efeitos-2026-11.md`.

## 0. O que foi estudado e o que ficou de fora

| Site | Situação em 2026-11-01 | Como |
|---|---|---|
| finmate.com.br | **Estudado** | Edge sem interface, 1440 e 390 px, rolado até o fim, HTML e CSS públicos |
| usecalen.com.br | **Estudado** | idem |
| dinzo.com.br | **Estudado** | idem |
| usenivora.com.br | **Não aberto** | a política de rede da organização bloqueia ("Newly Observed Domain"); 3 tentativas pelo caminho normal |
| codeandchill.store (`/new` e catálogo) | **Não aberto** | mesmo bloqueio, 3 tentativas; termos da loja também não lidos |

**O bloqueio não foi contornado:** nada de proxy, cópia em cache, arquivo da web ou busca por prévias, porque a decisão é
da organização, não do agente. Por isso, neste documento **nenhuma linha descreve o Nivora nem o Code and Chill**. O que
falta para fechar está na seção 7. O pedido de "todos os 5 sites" está **incompleto: 3 de 5**.

**Limites da medição:**
- Só carreguei e rolei: **sem passar o mouse, clicar ou abrir acordeão**. Estado de foco, de passagem e de erro dos sites
  não foi observado.
- Medi em um computador, em uma rede, em um dia. Não medi tempo de carga nem quadros por segundo.
- O CSS lido foi o inline mais até 8 folhas externas por site. Contagem zero significa "não achei nesse material".

**Como ler as medidas:**
- **[MEDIDO]** saiu do estilo calculado dos 3 sites.
- **[ESTIMATIVA: ponto de partida nosso]** é sugestão a ajustar, sem medição.
- Os valores são faixas de proporção. Nenhuma cor nem fonte de um site deve ser reaproveitada em conjunto.

## 1. Fichas dos sites

Os 3 são de finanças pessoais no Brasil, com integração a bancos: amostra estreita. O que se repete entre eles pode ser
convenção do nicho, não regra de "premium".

### Finmate (estudado)
- **O que é:** controle de gastos pelo mensageiro, para quem quer evitar surpresa na fatura; venda por assinatura direta.
- **Visual:** fundo verde-escuro com gradientes radiais largos e granulado discreto, com blocos claros alternados no meio.
  Fontes Plus Jakarta Sans (títulos e texto) e Inter. Grade de 1280 px. H1 48 px no computador, 30 px no celular. Raios:
  pílula (118 ocorrências), 16 e 20 px. Sombras em anel de 1 px com luz interna fina.
- **Estrutura (8 blocos, 5.912 px):** herói com celular → conexões com bancos em bento → 3 cartões de uso → faixa de ação
  → depoimentos → vídeo → perguntas → ação final com preço.
- **Movimento:** 58 animações ativas na medição: órbita de logos em anéis, feixes de luz, marquee, itens que entram na lista.
- **Produto:** conversa simulada dentro de um celular, lista de lançamentos real em cartão branco, hub radial de logos.
- **Excelente:** o herói mostra o produto no canal em que ele funciona. O hub radial explica "conecta tudo" sem texto.
- **Fraco:** branco sobre o verde do botão mede **2,57:1**, abaixo do mínimo. Texto justificado no celular abre buracos.
  Nota legal miúda repetida junto de cada botão. Branco a 45% sobre o escuro mede 4,46:1, logo abaixo de 4,5.

### Calen (estudado)
- **O que é:** app de previsão de saldo no mês, para quem quer saber antes quanto vai sobrar; baixa o app ou testa grátis.
- **Visual:** alternância forte entre quase preto e creme, com um bloco anil no meio; acento violeta só em ação e destaque.
  Fonte Satoshi. Grade de 1240 px. H1 58/36 px, peso 500, entrelinha 1,06. Raios 18–28 px. O botão tem brilho colorido
  (sombra da cor do acento mais luz interna de 1 px).
- **Estrutura (14 blocos + rodapé, 15.884 px):** herói com notebook e celular → 3 problemas em ziguezague → bento de recursos → uso
  dentro de assistentes de IA → multiplataforma → compartilhar → bancos → conteúdo educativo → depoimentos → planos →
  segurança → perguntas → baixar com QR → ação final → rodapé.
- **Movimento:** 39 animações ativas: depoimentos em fileiras opostas, ilustração de céu, brilho no plano recomendado,
  saldo que entra deslizando. Navegação flutuante em pílula e botão de ação fixo no canto da rolagem.
- **Produto:** mockups do app real em dispositivos; gráfico de rosca e calendário como termômetro dentro dos cartões.
- **Excelente:** o ritmo escuro × creme faz uma página de 15 mil px não parecer uma coisa só. O mapa de calor do calendário
  mostra a promessa em um golpe de vista. Prova condensada logo sob a ação do herói.
- **Fraco:** longo, com partes que repetem a promessa. Barra de promoção, navegação, botão fixo e aviso de cookies somam 4
  camadas sobre o conteúdo; nas capturas (sem fechar o aviso de cookies), o botão fixo **cobre um título** e a navegação
  sem fundo deixa o título passar por trás dela. Na dobra, muitas provas em sequência disputam a atenção.

### Dinzo (estudado)
- **O que é:** organizador de finanças com assistente de conversa e mascote; público amplo, tom leve.
- **Visual:** quase branco, azul único de acento, cartões brancos com sombra mínima, um bloco azul-marinho por página.
  Plus Jakarta Sans em peso 800 nos títulos. Grade de 1120 px, a mais estreita e a mais calma. H1 46/32 px. Blocos com
  88 px de respiro, constantes. Raio 14 px como base. Mascote em 3D como personagem.
- **Estrutura (14 blocos, 10.200 px):** herói → faixa de logos → 3 passos com linha desenhada → demonstração de conversa →
  bento → computador → telas do app → segurança → planos → "por que é pago" → depoimentos → perguntas → desejo → ação com QR.
- **Movimento:** 20 animações ativas; simulação viva no herói (lançamentos entram, saldo muda entre visitas), linha que se
  desenha, entrada com curva longa (0,6 s).
- **Produto:** o melhor tratamento de números dos 3: símbolo e centavos menores que o inteiro, e valores tabulares (o termo
  aparece 29 vezes no CSS). Barras e anéis de progresso sempre acompanhados do valor.
- **Excelente:** clareza e hierarquia. O bloco que explica por que o produto é pago trata a objeção de frente. A identidade
  vem de um personagem, não de efeito.
- **Fraco:** corpo pequeno (13–13,5 px em boa parte), cinza claro a **2,46:1** em texto, botão de 36 px de altura no
  celular. Barra fixa com fundo a 82%: na captura, o que passa atrás fica visível sob o menu.

### Sinais de modelo comprado
**Nenhum sinal de modelo comprado nos 3 estudados:** sem meta de gerador nem assinatura de construtor; animações e mockups
são específicos do produto. Finmate usa pilha comum (Vite, Tailwind, Radix, com nomes de animação próprios); Dinzo e Calen
usam Next. **[HIPÓTESE]** Os 3 podem partilhar referências, porque a ordem das seções e os raios são parecidos. Isso limita
a dizer "é padrão": o que aprendemos aqui é convenção recente do nicho. Code and Chill, sendo loja, seria por definição
fonte de modelos; ver seção 7.

## 2. Padrões

**Repetem-se nos 3 [MEDIDO]:**

| Item | Faixa |
|---|---|
| Largura do conteúdo | 1120–1280 px |
| H1 computador / celular | 46–58 px / 30–36 px |
| H1 entrelinha / espaçamento entre letras | 1,06–1,15 / −0,025 a −0,028 em |
| H2 computador | 38–48 px, entrelinha 1,08–1,15 |
| Respiro vertical de bloco, computador / celular | 64–112 px / 40–72 px (herói do Calen: 160 px, por causa das camadas fixas) |
| Altura do botão principal, computador / celular | 48–59 px nos dois (exceção: 36 px no cabeçalho) |
| Raio: botão / cartão / bloco grande | 10–16 px ou pílula / 14–20 px / 24–28 px |
| Sombra de cartão | quase invisível: 0,04–0,10 de opacidade, 1–8 px; dispositivo: 0,18–0,55, 24–90 px |
| Transição curta | 0,15–0,3 s |
| Entrada | 0,5–0,7 s, curva que desacelera muito (0,16,1,0,3,1 ou 0,22,1,0,36,1) |
| Altura da página | 5,9–15,9 mil px; no celular, 1,2–1,8 vez isso |

Também se repetem: produto real ou simulado na dobra; bento de recursos com mini-mockups; logos de bancos como prova;
planos com recomendado marcado; perguntas em acordeão; ação final em bloco de contraste; um único acento; um bloco
invertido para quebrar o ritmo.

**O que diferencia:**
- Finmate: **atmosfera** (fundo com luz e textura) e órbita animada.
- Calen: **ritmo** (escuro × creme) e densidade de argumento.
- Dinzo: **personagem** e rigor na tipografia dos números.

Nos 3, o que fica na memória é **uma** ideia forte. Tudo o mais é convenção, e é isso que deixa um site parecido com os
outros. **Copiar a convenção não dá identidade; a identidade vem da ideia própria.**

**Vale copiar o princípio, não a falha:** contraste do botão, corpo pequeno, área de toque, camadas fixas por cima do
conteúdo. As medidas abaixo ficam dentro das normas mesmo quando os sites não ficaram.

**Falta nos 3:** `prefers-reduced-transparency` e tema escuro por preferência real (Finmate e Dinzo: 0 no CSS lido; Calen:
6 de `prefers-color-scheme`, sem confirmar o uso). `prefers-reduced-motion` existe em todos (2, 18 e 19 ocorrências).

## 3. Receitas de seção e de peça

Cada receita é opção. Medidas sem marca são **[ESTIMATIVA: ponto de partida nosso]** dentro das faixas medidas. Regras
gerais que valem para todas e não se repetem: contraste de 4,5:1 (3:1 em texto ≥ 24 px, ou ≥ 18,66 px em negrito), foco
visível, área de toque mínima de 24 px pela WCAG 2.2 AA e 44 px como meta nossa no celular, texto real em vez de imagem,
e tudo aguentando o conteúdo mais longo previsto.

### R1. Herói com produto em mockup
- **Quando usar:** o produto tem tela e a tela prova a promessa. Se a tela é confusa, use recorte ou simulação (R2).
- **Estrutura:** duas colunas (texto 45–55%, produto o resto) ou centrado com produto abaixo. Texto: título, 1–2 frases,
  ação principal + secundária, uma linha de prova. Produto: um dispositivo ou pares (notebook + celular sobreposto, com 8–15%
  do celular saindo da grade).
- **Medidas:** título 46–64 px, peso 500–800, entrelinha 1,05–1,15, −0,02 a −0,03 em; texto 17–20 px, até 60 caracteres por
  linha; ações 48–54 px, 12 px entre elas; sombra do dispositivo 0 30–40 px 80–90 px a 0,18–0,5. Entrada 0,6 s, atraso até 0,2 s.
- **Estados:** imagem carregando (espaço reservado com proporção fixa, sem pulo); sem JS (imagem parada, texto completo).
- **Celular:** uma coluna, texto primeiro; título 30–36 px; o produto pode começar a aparecer na dobra, indicando que há
  mais. Botões lado a lado só se cada um couber sem quebrar.
- **Acessibilidade:** `alt` descreve o que o mockup prova; dado fictício marcado se puder ser confundido com real.
- **Erro comum:** mockup tão reduzido que nada se lê: mostre menos tela, maior. Dispositivo genérico com tela inventada que o
  produto não tem.

### R2. Herói com produto vivo (simulação)
- **Quando usar:** o valor está no que acontece (algo entra, se organiza, responde). Exige uma ideia clara em 3–6 s.
- **Estrutura:** painel com um a três eventos em ciclo; cartões-satélite saindo do painel; controle visível de pausa.
- **Medidas:** cada passo 1,5–3 s, transição 0,3–0,5 s, 3–6 estados em ciclo; no máximo 3 satélites.
- **Estados:** tocando, pausado, reduzido (última cena parada e completa), fora da tela (para de rodar).
- **Celular:** o painel inteiro cabe sem rolagem interna; satélites somem ou viram fila abaixo.
- **Acessibilidade:** mais de 5 s em paralelo ao conteúdo exige meio de pausar (WCAG 2.2.2); nada de anúncio ao vivo a cada
  passo; `aria-hidden` no decorativo, com uma frase-resumo.
- **Erro comum:** simulação que muda valores e parece erro ao recarregar. Animar 3 coisas ao mesmo tempo.

### R3. Herói de conversa ou canal
- **Quando usar:** o produto vive em um canal conhecido (mensageiro, e-mail, voz) e a surpresa é "sem instalar nada".
- **Estrutura:** dispositivo com 2–4 trocas; a última mostra o resultado. Pedido curto → resposta com dado.
- **Medidas:** bolhas 13–15 px, raio 12–18 px, largura máx. 82%; digitando 0,8–1,5 s; entrada 0,25–0,4 s.
- **Estados:** tocando, parado, reduzido (conversa completa).
- **Celular:** o dispositivo ocupa a largura menos 24 px; sem moldura se a moldura roubar espaço.
- **Acessibilidade:** conversa como lista em texto, não imagem.
- **Erro comum:** imitar marca registrada do mensageiro de perto (risco legal) e fonte de 10 px nas bolhas.

### R4. Faixa de prova com números
- **Quando usar:** há número verificável, com fonte e data. Sem número real, use outra prova; nunca invente.
- **Estrutura:** 3–4 números em linha, ou uma linha sob a ação (avatares + total + nota + selo). Número grande, rótulo curto.
- **Medidas:** número 32–56 px, tabular, peso 600–800; rótulo 13–15 px; bloco 40–64 px de respiro; separador de 1 px a 0,1.
- **Estados:** número curto e enorme (`2,4 mi`); rótulo em duas linhas sem desalinhar a base.
- **Celular:** 2 × 2, ou lista.
- **Acessibilidade:** subida animada não pode alterar o texto lido: `aria-label` com o valor final.
- **Erro comum:** número sem fonte, ou notas de loja antigas. "Mais de X usuários" sem base é promessa publicitária.

### R5. Faixa de logos
- **Quando usar:** a lista de marcas conhecidas reduz dúvida, com permissão de uso ou de integração real.
- **Estrutura:** frase curta acima, logos em cinza a 50–70% ou estáticos; em marquee se forem mais de 8.
- **Medidas:** logo 32–52 px de altura; intervalo 32–48 px; bordas somem em máscara de 60–120 px; marquee em 20–40 s por volta.
- **Estados:** passar o mouse dá cor; pausa em foco ou clique.
- **Celular:** os mesmos logos, menores (28–36 px), com velocidade igual em px/s.
- **Acessibilidade:** um `aria-label` para o grupo; cópias duplicadas com `aria-hidden`.
- **Erro comum:** logo em cinza abaixo de 3:1 quando é informação necessária; logo sem autorização.

### R6. Passos com linha ("como funciona")
- **Quando usar:** o processo tem 3–4 etapas e a simplicidade é o argumento.
- **Estrutura:** linha ou curva ligando etapas; número ou ícone; título de 3–5 palavras; frase.
- **Medidas:** cartões com 16–24 px de intervalo; linha 1,5–2 px; desenho 0,8–1,4 s, uma vez.
- **Estados:** antes de entrar na tela, a linha completa, nunca invisível sem JS.
- **Celular:** a linha vira vertical à esquerda.
- **Acessibilidade:** lista ordenada real.
- **Erro comum:** 6 passos para vender simplicidade.

### R7. Grade bento de recursos
- **Quando usar:** 5–9 recursos de pesos diferentes, cada um demonstrável em pequena escala.
- **Estrutura:** grade de 12 colunas; 1–2 peças largas; 1–2 peças invertidas de cor; o resto neutro. Cada peça: título, 1–2
  linhas, mini-demonstração do recurso, que é o conteúdo e não enfeite.
- **Medidas:** intervalo 16–20 px; preenchimento 24–32 px; raio 20–28 px; título 16–19 px, peso 600–800; corpo 14–15 px.
- **Estados:** com muitos e poucos itens internos; passar o mouse em no máximo −2 px e sombra leve; sem link, sem resposta falsa.
- **Celular:** uma coluna, ordem por importância, mini-demonstração legível (2 colunas só para peças pequenas).
- **Acessibilidade:** ordem do DOM igual à visual; demonstração decorativa com `aria-hidden` e o valor no texto.
- **Erro comum:** ícone + título + frase em caixas iguais não é bento, é lista. Demonstração com dado ilegível.

### R8. Ziguezague problema → resposta
- **Quando usar:** o público reconhece as dores e há resposta específica para cada uma.
- **Estrutura:** 2–4 fileiras alternando texto e tela; título da fileira em forma de dor, resposta logo abaixo.
- **Medidas:** título 28–34 px; entre fileiras 64–120 px; imagem 45–55%.
- **Estados:** tela vertical e horizontal na mesma alternância sem desalinhar.
- **Celular:** sempre texto → imagem, sem alternar.
- **Acessibilidade:** a ordem de leitura não se inverte com `order` em CSS.
- **Erro comum:** mais de 4 fileiras cansa; quebre o ritmo com bento ou faixa.

### R9. Demonstração em vídeo
- **Quando usar:** o produto é melhor visto em uso e cabe em menos de 60 s.
- **Estrutura:** vídeo vertical ou horizontal em moldura; duração à vista; texto com 3–4 pontos ao lado; ação abaixo.
- **Medidas:** botão de reproduzir ≥ 56 px; capa com contraste de 3:1 para o ícone; carregar só o `poster` antes do clique.
- **Estados:** capa, tocando, pausado, erro de carga (mostra capa e link).
- **Celular:** não tocar som sozinho; dados móveis: nada de pré-carga.
- **Acessibilidade:** legendas; controles nativos; pausa.
- **Erro comum:** vídeo de fundo automático com o peso do herói. Depoimento em vídeo sem legenda.

### R10. Depoimentos
- **Quando usar:** com depoimento real, autorizado, com nome ou identificação. Sem isso, nada.
- **Estrutura:** (a) 3 cartões; (b) parede; (c) duas fileiras em sentidos opostos. Número e nota junto do conjunto.
- **Medidas:** corpo 15–17 px, até 45–65 caracteres; foto 36–48 px; fileira em 40–70 s; cartões de altura igual ou alvenaria.
- **Estados:** depoimento longo (corte + "ler tudo"), sem foto (iniciais).
- **Celular:** uma coluna ou deslize horizontal com indicação, sem marquee que force a leitura.
- **Acessibilidade:** o marquee para em passagem e foco e tem botão de pausa; leitura em ritmo próprio.
- **Erro comum:** foto de banco e nome inventado (é enganoso, e pode ser irregular). 5 estrelas em tudo, sem fonte.

### R11. Seção de preços
- **Quando usar:** preço público e comparável. Com venda consultiva, troque por "o que muda em cada plano" e contato.
- **Estrutura:** seletor de período com economia; 2–3 planos; o recomendado com borda de acento, selo e botão cheio, outros
  com botão contornado; valor mensal e **total cobrado escrito**; lista por **diferença** ("tudo do plano X, mais…"); garantia
  e forma de cancelar abaixo.
- **Medidas:** cartão 320–380 px, preenchimento 24–32 px; inteiro 40–56 px, centavos e símbolo 45–60% dele, tabular; borda do
  recomendado 2 px; selo 11–13 px; lista 14–15 px, com 10–14 px entre itens; recomendado até 8–16 px maior.
- **Estados:** alterna período sem pular altura; plano esgotado; valor em moeda longa; plano atual (dentro do produto).
- **Celular:** recomendado primeiro, ou empilhado com ele em destaque; sem rolagem horizontal de tabela.
- **Acessibilidade:** seletor como grupo de rádio; preço em texto legível por completo; preço riscado explicado.
- **Erro comum:** esconder o total anual, ou riscar preço que nunca existiu (padrão enganoso, proibido).

### R12. Bloco de objeção franca
- **Quando usar:** há uma dúvida que trava a compra (por que é pago, por que confiar, por que esse preço).
- **Estrutura:** a pergunta como título; resposta direta em 3–5 linhas; 2–3 pontos com evidência.
- **Medidas:** coluna de texto de 480–640 px; imagem ou personagem opcional.
- **Estados:** sem imagem funciona sozinho.
- **Celular:** uma coluna, resposta antes da imagem.
- **Acessibilidade:** é texto comum, sem acordeão escondendo o argumento.
- **Erro comum:** desviar da pergunta. Isso custa mais confiança que não fazer a seção.

### R13. Segurança e confiança
- **Quando usar:** dados sensíveis, dinheiro ou saúde.
- **Estrutura:** 3–4 afirmações verificáveis, cada uma com selo, norma ou política.
- **Medidas:** ícone 32–40 px em caixa de raio 10–12 px; título 15–17 px; corpo 14–15 px.
- **Estados:** selo sem marca autorizada: só texto.
- **Celular:** lista.
- **Acessibilidade:** selo com nome no texto.
- **Erro comum:** "nível bancário" e cadeado sem o que sustenta. Citar lei sem o que foi de fato feito.

### R14. Perguntas frequentes
- **Quando usar:** há objeções recorrentes, e o texto reduz atendimento.
- **Estrutura:** 5–10 perguntas, coluna 640–800 px, em uma coluna; a resposta começa pela resposta.
- **Medidas:** linha ≥ 52 px; pergunta 15–17 px, peso 500–600; abre em 0,2–0,3 s; ícone gira.
- **Estados:** fechada, aberta, foco, resposta longa, âncora direta abre o item.
- **Celular:** alvo inteiro da linha.
- **Acessibilidade:** `details/summary` ou botão com `aria-expanded`; busca do navegador deve achar o texto.
- **Erro comum:** perguntas que ninguém faz, só para repetir vantagem.

### R15. Ação final e passagem ao celular
- **Quando usar:** quem chegou ao fim precisa de um último passo simples.
- **Estrutura:** bloco de contraste com a promessa reduzida a uma linha, uma ação e o que tira o risco. App: QR visível no
  computador, botões de loja no celular.
- **Medidas:** título 34–56 px; bloco 64–112 px de respiro, raio 24–28 px se for cartão; QR ≥ 120 px com margem clara.
- **Estados:** QR só no computador; loja conforme o sistema detectado, com a outra acessível.
- **Celular:** botão em toda a largura, 48–56 px.
- **Acessibilidade:** QR sempre tem link em texto; botões de loja têm nome.
- **Erro comum:** nova promessa no fim. Vários botões disputando.

### R16. Navegação de site
- **Quando usar:** sempre que houver rolagem longa, em uma das formas: barra plena ou pílula flutuante.
- **Estrutura:** marca, 3–5 links, entrar, ação principal; âncoras com rolagem suave e destaque da seção.
- **Medidas:** altura 56–72 px; pílula com 12–16 px da borda; fundo opaco ou vidro a ≥ 70% **com** desfoque; 13–15 px; ação 36–44 px.
- **Estados:** topo, rolado, seção ativa, menu aberto, foco.
- **Celular:** ≤ 60 px, marca + ação + menu; menu em painel inteiro; alvo ≥ 44 px, incluindo a ação do cabeçalho.
- **Acessibilidade:** link "pular para o conteúdo"; `scroll-margin-top` igual à altura da barra; foco nunca oculto sob ela (WCAG 2.4.11).
- **Erro comum:** barra transparente sem fundo ao rolar, com títulos passando por trás; somar barra de promoção e botão
  flutuante até cobrir conteúdo. **Conte as camadas fixas: no máximo 2 visíveis na dobra** e meça a área coberta (até 15–20%).

### R17. Barra de promoção e botão fixo
- **Quando usar:** oferta real, com prazo. Botão fixo em página muito longa, ao passar da dobra.
- **Estrutura:** barra de 32–40 px com uma frase e um código, descartável. Botão fixo some sobre a ação do herói e a final.
- **Estados:** descartada lembra a escolha; código copiado confirma.
- **Celular:** botão vira faixa inferior, respeitando a área segura do aparelho.
- **Acessibilidade:** fechar por teclado; `padding-bottom` para o botão não cobrir o fim da página.
- **Erro comum:** contador falso; botão sobre título (acontece quando o botão é centralizado sobre o conteúdo).

### R18. Cartão de métrica (herói de dado)
- **Quando usar:** um número decide; serve para o mockup da landing e para a tela do produto.
- **Estrutura:** rótulo, valor grande, período, variação com **sinal, seta e cor**; opcional: linha ou barra de progresso.
- **Medidas:** valor 32–56 px, `tabular-nums`; símbolo e centavos 45–60% do inteiro; rótulo 12–14 px; variação 12–14 px; preenchimento
  20–28 px; raio 14–20 px; sombra 0 1–8 px a 0,04–0,10, ou borda de 1 px.
- **Estados:** vazio ("sem dados no período"), carregando (esqueleto do tamanho do valor), erro, número enorme, negativo.
- **Celular:** valor nunca corta; abrevia antes de quebrar.
- **Acessibilidade:** cor não é o único sinal (WCAG 1.4.1); valor completo em `aria-label` quando abreviado.
- **Erro comum:** precisão falsa, período omitido, variação sem base de comparação.

### R19. Linha de transação ou de item
- **Quando usar:** lista que prova que o produto entende o dado real.
- **Estrutura:** ícone ou logo, título, metadado, valor à direita alinhado pelo separador, subinfo.
- **Medidas:** altura 56–72 px; título 14–15 px; meta 12–13 px com contraste de 4,5:1; valor tabular; 8–12 px entre cartões, ou
  separador de 1 px.
- **Estados:** nome longo (corta com reticências e fica legível por `title`/expansão), sem logo (iniciais), pendente.
- **Celular:** o valor nunca empurra o título para fora.
- **Acessibilidade:** tabela ou lista real, valor com sinal em texto.
- **Erro comum:** dado de exemplo com marca real em situação depreciativa.

### R20. Progresso em anel, barra e calendário
- **Quando usar:** meta, limite, parcelas ou "como vai o mês" em um golpe de vista.
- **Estrutura:** barra (rótulo, valor de × a), anel (fração no centro, ex. 5/10), calendário-termômetro (dia + intensidade).
- **Medidas:** barra 6–10 px com raio pleno; anel 40–64 px, traço 4–6 px; célula 28–36 px com raio 6–8 px, intervalo 4–6 px; cor em 3–5 níveis.
- **Estados:** 0%, 100%, acima de 100% (cor + texto), sem dado (cinza com tracejado).
- **Celular:** célula ≥ 32 px quando for tocável, com detalhe ao tocar.
- **Acessibilidade:** valor em texto sempre; dia do calendário com `aria-label` completo; mapa de calor com níveis distintos sem cor (ou valor).
- **Erro comum:** vermelho e verde como único código. Rosca para comparar muitas partes.

### R21. Hub de integrações
- **Quando usar:** "conecta tudo" é o argumento e há mais de 8 integrações reais.
- **Estrutura:** centro com a marca; 2–3 anéis de logos; linhas ligando; pulso ocasional. Lista em texto abaixo, com busca se forem muitas.
- **Medidas:** logo 40–56 px; anéis com 60–90 px de diferença de raio; pulso a cada 3–6 s.
- **Estados:** reduzido: parado, linhas visíveis.
- **Celular:** um ou dois anéis, ou grade de logos; o texto sustenta o argumento.
- **Acessibilidade:** `aria-hidden` no desenho; lista em texto legível.
- **Erro comum:** logos sobrepostos que quebram com 2 itens a mais. Prever a quantidade real.

### R22. Personagem ou objeto-assinatura
- **Quando usar:** marca com tom leve e público amplo. Em produto sério, um objeto ou forma própria cumpre o papel.
- **Estrutura:** um personagem coerente aparece 3–5 vezes com função (saudar, proteger, celebrar), nunca como enfeite repetido.
- **Medidas:** 120–280 px de altura em computador; 80–160 no celular; movimento pequeno, 2–5 s, parado em reduzido.
- **Estados:** versão estática para todo uso.
- **Celular:** nunca desloca o texto da dobra.
- **Acessibilidade:** `alt` vazio se decorativo.
- **Erro comum:** gerar sem consistência entre as cenas e sem origem registrada.

### R23. Ritmo de blocos (fundo como estrutura)
- **Quando usar:** página com mais de 6 blocos, com risco de virar um rolo só.
- **Estrutura:** um neutro base; bloco invertido a cada 2–4 blocos; uma cor forte uma vez. Ou um só fundo atmosférico e cartões claros. Transição reta, curva ou com cartão sobreposto.
- **Medidas:** 64–112 px de respiro, celular 40–72 px; preto levemente colorido em vez de `#000`; creme em vez de branco quando há muito branco.
- **Estados:** tema escuro e claro por token, cada par medido.
- **Celular:** menos blocos invertidos colados, porque cansam mais.
- **Acessibilidade:** recalcular contraste em cada fundo, inclusive de links e foco.
- **Erro comum:** alternar por hábito, sem relação com o conteúdo. Aqui, fundo escuro é opção de projeto: **respeite a marca e a decisão de quem pediu.**

### R24. Atmosfera de fundo
- **Quando usar:** a marca pede clima, e o conteúdo fica em superfícies calmas.
- **Estrutura:** cor base; 2–3 luzes radiais grandes (700–1300 px, 15–55% de opacidade, somem até 60–90%); granulado de 2–5%. Técnica no catálogo de efeitos.
- **Estados:** pior ponto do fundo medido contra o texto.
- **Celular:** menos luzes, imagem leve.
- **Acessibilidade:** nada de texto diretamente sobre a parte de maior variação.
- **Erro comum:** violeta sobre preto com brilho: é o visual mais gasto do setor; use só se a marca for essa.

### R25. Rodapé
- **Quando usar:** sempre que houver página longa ou obrigações legais.
- **Estrutura:** marca, 3–5 colunas de links, contato, identificação legal, redes.
- **Medidas:** 13–15 px; contraste de 4,5:1; linhas ≥ 32 px de altura no celular.
- **Estados:** o que tem de constar por lei em cada negócio (com `advogado-contratos` quando houver venda).
- **Celular:** colunas viram acordeão ou lista.
- **Acessibilidade:** `nav` com rótulo.
- **Erro comum:** cinza claro ilegível "porque é rodapé".

## 4. Efeito vidro

**Base:** medição dos 3 sites, documentação pública (MDN) e o que já está em `conhecimento/design/apple/materiais.md`.
**Não vem do Code and Chill**, que era o interesse principal do usuário e continua bloqueado.

### O que foi medido

| Site | Peça | Fundo | Borda | Desfoque | Leitura |
|---|---|---|---|---|---|
| Finmate | cartões sobre o fundo escuro | branco a 3–4% | branca a 10% | 4 px | boa: o fundo é calmo e o texto, branco |
| Finmate | pílulas e etiquetas | branco a 10% | branca a 15% | 4 px | boa |
| Finmate | selo sobre vídeo | preto a 60% | nenhuma | 4 px | boa |
| Finmate | barra inferior | opaca | branca a 10% no topo | 4 px sem efeito visível, por ser opaca | desfoque desperdiçado |
| Dinzo | barra superior | quase branco a 82% | linha inferior | não medido no topo (zero computado) | restos do conteúdo aparecem na captura |
| Finmate | outras 5 peças | não identificadas | — | 12 px (estilo calculado) | não avaliada |
| Calen | barra e superfícies | sem desfoque | — | 0 no CSS lido | prova de que dá para ter "premium" sem vidro |

### O que isso acrescenta ao `apple/materiais.md`
A seção da Apple diz quando, como e o caminho de reserva. Este estudo acrescenta:

1. **Vidro fino sobre fundo calmo:** branco a 3–10%, borda a 10–15% e desfoque de 4 px sobre fundo escuro homogêneo. É uma
   variante que o texto de 50–70% não cobre. Serve porque o fundo não varia; quase não é vidro, é **superfície tonal**.
2. **Conflito a resolver:** a referência da Apple diz "nunca na camada de conteúdo". Na web de marketing, este uso em cartão
   é comum e funciona, quando o fundo é calmo. **Sugestão:** manter a regra para produto e tela de tarefa, e permitir a
   superfície tonal em landing, dizendo que ali o que trabalha é a cor, não o desfoque. O dono da seção decide.
3. **Translúcido sem desfoque é defeito, não economia:** a 82%, sem desfoque, o conteúdo de trás vira ruído legível.
4. **Causa comum de "não funcionou":** um pai com `opacity < 1`, `filter`, `mask`, `clip-path`, `mix-blend-mode` ou o próprio
   `backdrop-filter` vira raiz do fundo, e o filho só desfoca o que está dentro dele (MDN).
5. **Desfoque em superfície opaca** custa e não aparece: retire.
6. **Luz interna de 1 px no topo:** o que faz parecer vidro no escuro é a borda de luz, não o desfoque.
7. O suporte mudou: `backdrop-filter` é Baseline 2024, enquanto `prefers-reduced-transparency` segue "Limited availability"
   e experimental no MDN: a reserva não pode depender só dele.

### Receita de vidro
- **Quando usar:** navegação, painel flutuante, controle sobre foto ou vídeo. Em landing, superfície tonal sobre fundo calmo.
- **Quando não usar:** tabela, parágrafo, formulário longo, sobre fundo muito variado, vidro sobre vidro, em e-mail, PDF ou Power BI.
- **Camadas, de trás para frente:**
  1. Fundo por trás com alguma variação (sem isso, o efeito não aparece).
  2. Cor translúcida.
  3. Desfoque e reforço de saturação.
  4. Borda de 1 px mais clara no topo (luz).
  5. Sombra para separar.
  6. Texto.
- **Variantes [ESTIMATIVA: ponto de partida nosso]:**

| Variante | Cor | Desfoque e saturação | Borda | Sombra | Uso |
|---|---|---|---|---|---|
| Tonal, escuro | branco 3–10% | 0–4 px | branca 10–15% | nenhuma | cartão de landing sobre fundo calmo |
| Barra | claro ou escuro 60–75% | 12–20 px, 150–180% | 1 px a 10–45% | leve ao rolar | navegação |
| Painel | 50–70% | 16–24 px, 150–180% | 1 px a 20–45% | 0 8–24 px 24–60 px a 0,12–0,25 | menu, modal |
| Sobre foto | preto 35–60% | 4–12 px | nenhuma ou 10% | nenhuma | legenda, selo, controle |

- **Estados:** passar o mouse: mais opaco 5–10 pontos, em 0,15 s; foco com anel sólido e opaco; **texto e ícone em contraste contra o pior ponto de fundo**.
- **Pior caso a medir:** contraste com a parte mais clara e a mais escura que passa atrás. Para conferir, deixe branco puro e preto puro atrás numa página de teste.
- **Celular:** desfoque de até 8–12 px, poucas superfícies, testado rolando em aparelho antigo.
- **Sem suporte a `backdrop-filter`:** com `@supports not`, fundo a 90–96%.
- **Quem pediu menos transparência:** com `prefers-reduced-transparency: reduce`, fundo a 96–100%, sem desfoque. Como o suporte é limitado, a base do desenho precisa passar no contraste **sem contar com o efeito**.
- **Alto contraste:** com `prefers-contrast: more` e `forced-colors`, fundo sólido e borda real.
- **Movimento:** sem reflexo animado em `prefers-reduced-motion`; não anime o raio de desfoque.
- **Erro comum:** tudo de vidro; texto cinza claro em vidro claro; vidro em cima de texto em movimento.

## 5. Método para montar um site inteiro

Isto não substitui `conhecimento/design/metodo.md` nem `tela-nova/INDICE.md`: é o complemento específico de site. As
sequências são **pontos de partida**; a regra é **sair do previsível quando o projeto pedir**.

### Passo 1. Entender
Uma frase para cada item: quem visita, o que acredita ao chegar, que objeção o trava, qual ação se quer, que prova real
existe. Liste o material verdadeiro: telas, números, depoimentos, fotos, autorizações.

### Passo 2. Definir uma identidade própria
1. **A ideia única:** o que ficaria na memória de quem saiu do site? Pode ser um personagem, um ritmo, uma atmosfera, um objeto,
   uma forma de mostrar números, uma estrutura incomum. Tem de vir do produto: se servir para o concorrente, ainda não é.
2. **Três direções diferentes de verdade** (mundo visual, tipo, composição); o usuário escolhe.
3. **Sistema mínimo:** 1 fonte com personalidade ou par com contraste; neutros levemente coloridos; 1 acento, usado com pouca
   frequência; 3 raios; 3 sombras; 1 curva de entrada e 1 de resposta.
4. **Teste do recorte:** tire o logo. A página ainda parece só deste produto? Compare com as 3 referências da área: se a
   composição for igual, troque algo que importa, não só a cor.
5. **Regra de direitos:** nada de combinar paleta + fonte + layout de um site de referência.

### Passo 3. Escolher e ordenar blocos
Comece pelo que precisa ser dito, depois escolha as receitas. Pontos de partida:

| Tipo | Sequência de partida | Por onde sair do previsível |
|---|---|---|
| SaaS ou app por assinatura | R1 ou R2 → R5 → R6 → R7 → R8 → R10 → R11 → R13 → R14 → R15 | começar pela demonstração sem título grande; mostrar preço já no herói |
| Produto por canal (mensageiro, voz) | R3 → R4 → R9 → R21 → R10 → R12 → R11 → R14 → R15 | deixar a pessoa experimentar a conversa ali mesmo |
| Serviço B2B ou consultoria | herói de tese → R4 → casos → método (R6) → R13 → pessoas → contato | um caso inteiro como página principal |
| Produto físico ou loja | foto em grande → uso → detalhes → R10 → comprar → R14 | uma história contada por rolagem |
| Portfólio ou institucional | peça principal → trabalhos → como pensa → contato | a navegação é o próprio trabalho |
| Página de evento ou captação | promessa + data + ação → programação → pessoas → R4 → ação | contagem real, ou programação como herói |
| Documentação ou produto técnico | exemplo funcionando → instalar → casos → R14 | o código roda na dobra |

**Tamanho:** o estudo foi de 8 a 14 blocos. Pare quando não houver novo argumento: o Finmate cobre o essencial em 5,9 mil px.

**Uma ideia forte por bloco; um movimento dominante por tela.**

### Passo 4. Compor com material real
Texto real desde o primeiro rascunho (com `redator`). Dados de exemplo plausíveis e marcados. Nada de imagem sem origem
registrada.

### Passo 5. Construir
Tokens primeiro; celular junto, não depois; efeitos por último, depois de a página funcionar sem eles (`referencias-efeitos`).

### Passo 6. Conferir antes de entregar
- [ ] Em 5 s, sem rolar: o que é, para quem, o que fazer. Mostre a alguém, ou leia só a dobra.
- [ ] Ideia própria presente; teste do recorte passa.
- [ ] Toda afirmação, número e depoimento com fonte; nada enganoso (preço, contador, escassez).
- [ ] Contraste calculado para todos os pares, nos piores pontos de fundo e sobre botão com acento.
- [ ] Capturas em 390, 768, 1440 e 1920 px: nada cortado; sem rolagem horizontal; **navegação e botões fixos não cobrem título**.
- [ ] Teclado do início ao fim; foco nunca sob barra; "pular para o conteúdo".
- [ ] `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, JS desligado: tudo legível e completo.
- [ ] Pause em tudo que mexe sozinho por mais de 5 s (WCAG 2.2.2); nada pisca mais de 3 vezes por segundo (WCAG 2.3.1).
- [ ] Alvos de toque ≥ 44 px, inclusive a ação do cabeçalho; corpo ≥ 16 px no celular; legendas ≥ 12 px.
- [ ] Carga e estabilidade medidas (`engenharia/desempenho-web.md`); imagens com dimensão; fontes sem salto.
- [ ] Título, descrição, imagem de compartilhamento e aviso de privacidade reais; rastreadores só com consentimento (`especialista-lgpd`).
- [ ] Revisão com `conhecimento/design/revisao-tela.md`.

## 6. Onde entra no plugin

Para o lote de construção. Não foi criado nada: outro engenheiro está nessa pasta.

| Arquivo proposto | Conteúdo | Quem lê | Linha |
|---|---|---|---|
| `conhecimento/design/site/INDICE.md` | índice receita → arquivo | `designer-paineis`, `engenheiro-software`, `estrategista-marketing` | Quando criar ou reformar um site, leia `conhecimento/design/site/INDICE.md`. |
| `conhecimento/design/site/metodo.md` | seção 5 | idem | Quando montar um site inteiro, leia `site/metodo.md` depois de `metodo.md`. |
| `conhecimento/design/site/herois.md` | R1–R3 | idem | Quando desenhar a primeira dobra de um site, leia `site/herois.md`. |
| `conhecimento/design/site/prova.md` | R4, R5, R10, R13 | idem + `redator` | Quando mostrar prova, logos ou depoimentos, leia `site/prova.md`. |
| `conhecimento/design/site/explicar.md` | R6–R9, R12, R21, R22 | idem | Quando explicar o produto ou um recurso, leia `site/explicar.md`. |
| `conhecimento/design/site/vender.md` | R11, R14, R15, R17 | idem + `estrategista-marketing` | Quando montar preços, perguntas ou a ação final, leia `site/vender.md`. |
| `conhecimento/design/site/estrutura.md` | R16, R23–R25 | idem | Quando definir navegação, ritmo, fundo ou rodapé, leia `site/estrutura.md`. |
| `conhecimento/design/numeros.md` | R18–R20 | `designer-paineis`, `dev-powerbi`, `designer-documentos`, `engenheiro-software` | Quando mostrar número, progresso ou lista de valores, leia `numeros.md`. |
| `conhecimento/design/apple/materiais.md` (acrescentar) ou `site/vidro.md` | seção 4 | quem já lê materiais | Quando usar vidro, leia `apple/materiais.md`; em site, também `site/vidro.md`. |
| `conhecimento/design/efeitos/INDICE.md` + grupos | `docs/referencias-efeitos-2026-11.md` | `designer-paineis`, `engenheiro-software` | Quando pedirem um efeito ou animação de site, leia `efeitos/INDICE.md`, depois `movimento/INDICE.md`. |
| `conhecimento/design/modos/persuadir.md` e `INDICE.md` | ponteiros para `site/` | quem já lê | acrescentar uma linha em cada um |

Atenção:
- Registrar `<!-- ref: … -->` e `<!-- teste-ref: … -->` como nos outros arquivos, com a origem "texto próprio".
- Citar os sites só como "referência estudada em 2026-11-01".
- **Lacuna:** nenhum agente é dono de site. `designer-paineis` é de BI, e um site cairia nele e no `engenheiro-software`. A decisão de criar um designer de sites é do usuário: seção 8.

### Landing × produto

| Serve mais para landing | Serve para os dois | Serve mais para painel e produto |
|---|---|---|
| R1–R3 e R5 | R18–R20 (números) | R18–R20 com estados completos |
| R4, R10, R12, R13, R15 | R14, R16 | densidade, filtros, seleção visível |
| R11 como venda (R11 como "plano atual" no produto) | tokens, raios, sombras, curvas de resposta | superfície calma, sem atmosfera |
| R21–R24 | símbolo e centavos menores; tabular | |
| Marquee, entrada por rolagem, parallax | anel de foco, resposta ao clique | nenhuma animação em loop; vidro só em camada flutuante |

Em painel, valem antes as referências do próprio agente (IBCS, FT, Microsoft): **fundo atmosférico, ritmo e simulação viva
não entram em painel de decisão.**

## 7. O que falta: Nivora e Code and Chill

**Situação:** os dois domínios são barrados pelo filtro de rede. Estes itens do pedido **não foram feitos**:
inventário do catálogo; prévias e páginas de produto; templates; tipos de efeitos; estudo do vidro neles; leitura dos termos
da loja; ficha do Nivora. Termos, se comprados ou licenciados, seguem [HIPÓTESE]: **tratar como proibida qualquer reprodução
até lê-los.**

**Quando houver acesso, registrar neste molde:** tipo de peça | o que é | como funciona visualmente | quando usar | receita nas
nossas palavras | medido onde? | público ou pago. Sem baixar, comprar ou copiar.

## 8. Decisões para o usuário

1. **Como abrir os 2 sites bloqueados.**
   - **Recomendo:** pedir à TI liberação dos 2 domínios. Risco: demora; sem perda.
   - **Ou:** você mesmo gerar prints ou PDF por um meio que a política da sua organização permita, e deixar numa pasta. Risco: sem medida de CSS, só o que aparece; prévias animadas se perdem.
   - **Ou:** seguir só com os 3 sites. Perda: o interesse principal (vidro e catálogo) fica sem a fonte que você indicou.
2. **Criar um agente designer de sites.** Recomendo sim, pois `designer-paineis` traz regras de BI que atrapalham num site.
   Reversível. Perda: mais um agente a manter. `curador` e `engenheiro-software` opinam.
3. **Vidro em cartão de landing** (seção 4, item 2). Recomendo permitir só a superfície tonal. Reversível.

## Fontes

Referências estudadas em 2026-11-01, sem licença de reprodução, das quais só se extraiu padrão e proporção: finmate.com.br,
usecalen.com.br, dinzo.com.br.

Normas e documentação, abertas em 2026-11-01:
- MDN, `backdrop-filter`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- MDN, `prefers-reduced-transparency`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency
- WCAG 2.2.2: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- WCAG 2.3.1: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html

Citadas de conhecimento consolidado, sem abrir nesta tarefa (conferir na construção): WCAG 1.4.1, 1.4.3, 2.4.11 e 2.5.8.
