# Pesquisa: o que impressiona em sites e apps (2026-11)

Pedido: base para o padrão "algo que impressiona" dos designers do plugin agentes-ultimate.
Data da pesquisa e do acesso a todas as fontes: **2026-11-02**. Texto em palavras próprias; nada copiado de sites.
Marcações: **[CONFIRMADO]** = li a fonte primária aberta; **[SECUNDÁRIA]** = só blog/resumo; **[HIPÓTESE]** = não verifiquei em fonte aberta.

## 0. Limites desta pesquisa (leia primeiro)

- **Reddit bloqueado** pela ferramenta de busca/abertura ("unable to fetch from www.reddit.com"). Nenhum comentário de r/web_design, r/webdev ou r/UXDesign foi lido. Também **não abri** X/Twitter, Dribbble, Behance, Godly, Land-book, Lapa. FWA e CSS Design Awards: páginas de critérios deram 404/redirecionamento; **sem fonte** para eles.
- O que usuários de verdade dizem veio de **comentários do Hacker News** (API pública Algolia, links abaixo). É amostra pequena e enviesada para público técnico. O vocabulário tipo "buttery" e "every pixel" **não apareceu** nas fontes abertas (ver seção 3).
- Estatísticas de tendências 2025–2026 (ex.: "61% dos Sites of the Day são 3D") vêm de **um blog de marketing sem método**; não use como número.
- Dan Saffer e Aarron Walter: o livro não foi aberto; usei NN/g (que cita Walter) e resumos [SECUNDÁRIA] para Saffer.

## 1. O que júris premiam

| Prêmio | O que avaliam | Fonte | Quem publica / interesse |
|---|---|---|---|
| Awwwards | Design 40%, Usabilidade 30%, Criatividade 20%, Conteúdo 10%. Mínimo de 18 jurados; as 3 notas mais distantes da média são descartadas; voto de usuários PRO conta. Menção honrosa a partir de 6,5. | https://www.awwwards.com/about-evaluation/ [CONFIRMADO] | O próprio prêmio |
| Webby | Conteúdo, Estrutura e navegação, Design visual (de alta qualidade, adequado ao público **e acessível**), Funcionalidade (carregamento rápido, tecnologia bem usada, compatibilidade), Interatividade, Inovação (novo de verdade e a tecnologia funciona), Experiência geral (o que faz voltar/compartilhar). | https://www.webbyawards.com/judging/ [CONFIRMADO] | O próprio prêmio |
| Apple Design Awards 2026 | 6 categorias: Delight and Fun, Inclusivity, Innovation, Interaction ("controles sem esforço, adaptados à plataforma"), Social Impact, Visuals and Graphics ("tema distinto e coeso", animações de alta qualidade). A página não traz pesos. | https://developer.apple.com/design/awards/ [CONFIRMADO] | Apple |
| CSS Design Awards, FWA, Godly, Land-book, Lapa | Sem fonte aberta. | — | — |

Leituras que importam:
- No Awwwards, **Design + Usabilidade = 70%**. Um fabricante de sites afirma que um site original e difícil de usar perde para um menos original e impecável [SECUNDÁRIA, https://www.utsubo.com/blog/award-winning-website-design-guide]. Um blog de 2026 diz que "criatividade" é o diferencial, o que **contradiz** os pesos oficiais (20%). Confie nos pesos oficiais.
- Um resumo de skill chegou a citar 40/30/15/15; a página oficial diz 40/30/20/10. Exemplo de como a cópia de segunda mão muda o número.
- O Webby de 2002 (estudo com ~3.000 sites) achou conteúdo como melhor preditor da nota geral e design visual como o mais fraco [SECUNDÁRIA via busca, https://webtango.berkeley.edu/papers/hfw01/hfw01.htm; dado antigo, não aberto por mim].
- Nos prêmios da Apple, **inclusão é categoria própria** e os exemplos citados usam VoiceOver, texto dinâmico, contraste e redução de movimento: acessibilidade faz parte do "bonito", não é anexo.

## 2. Pesquisa e dados (por que impressiona)

| Tema | O que a fonte diz | Fonte |
|---|---|---|
| Primeira impressão em 50 ms | Lindgaard et al. (2006): a atratividade visual de uma página é julgada em ~50 ms, e esse julgamento bate com o feito depois de olhar mais. Ressalva: laboratório de um só grupo; mede **beleza percebida**, não compreensão. | Resumo em Nature: https://www.nature.com/news/2006/060109/full/news060109-13.html (via busca; paper original: Behaviour & Information Technology 25, 115–126, doi 10.1080/01449290500330448, **não aberto**) [SECUNDÁRIA] |
| Complexidade e protótipo | Tuch et al. (2012, Int. J. Human-Computer Studies): em 119 capturas de sites, **baixa complexidade visual + alta "cara de site esperado"** = mais bonito já nos primeiros 50 ms. Só li o resumo, não o texto completo. | https://research.google/pubs/pub38315/ [CONFIRMADO só o resumo] |
| Estética-usabilidade | Kurosu e Kashimura (1995, Hitachi, 26 variações de caixa eletrônico, 252 pessoas): a **beleza percebida** correlacionou mais com a **facilidade percebida** do que com a real. Tolera falha pequena, não grave; pode mascarar problemas em teste. | https://www.nngroup.com/articles/aesthetic-usability-effect/ [CONFIRMADO] |
| Pico-fim | Lembramos dos picos de emoção e do final. Criar picos positivos (feedback de sucesso), eliminar picos negativos, caprichar no fim e nos erros. | https://www.nngroup.com/articles/peak-end-rule/ [CONFIRMADO] |
| Delight | Hierarquia de Walter, via NN/g: funcional, confiável, usável, só então prazer. "Delight de superfície" (animação, microtexto, som) soa gratuito se o produto falha; "delight profundo" = fluxo sem atrito. Humor forçado em marca séria soa falso. | https://www.nngroup.com/articles/theory-user-delight/ [CONFIRMADO] |
| Microinterações | Par gatilho-feedback; servem a status, prevenção de erro e marca; não devem ser "enfeite"; animação longa deixa de ser microinteração. Saffer (4 partes: gatilho, regras, feedback, ciclos/modos) só em resumos. | https://www.nngroup.com/articles/microinteractions/ [CONFIRMADO]; Saffer [SECUNDÁRIA] https://uxdesign.cc/think-smaller-engaging-users-through-microinteractions-9f10372f2e1b |
| Velocidade percebida | 0,1 s = sensação de manipulação direta; 1 s = fluxo de pensamento preservado; 10 s = limite de atenção. INP "bom" ≤ 200 ms (percentil 75). | https://www.nngroup.com/articles/response-times-3-important-limits/ e https://web.dev/articles/inp [CONFIRMADO] |
| Atenção na página | 57% do tempo de visualização fica acima da dobra (2018); as duas primeiras telas concentram 74%. Quem rola precisa de motivo. | https://www.nngroup.com/articles/scrolling-and-attention/ [CONFIRMADO] |
| Movimento (Apple) | Só com propósito; nunca usar só animação para informação importante (complementar com háptico/áudio); curto e preciso; evitar excesso em ações frequentes; permitir cancelar; respeitar redução de movimento. | https://developer.apple.com/design/human-interface-guidelines/motion [CONFIRMADO, via JSON público da página] |
| Redução de movimento | `prefers-reduced-motion` existe para quem tem distúrbio vestibular; animações grandes de escala/deslocamento são gatilho comum. | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion [CONFIRMADO] |

Fonte que mais ensina "craft" fino: a lista de Rauno Freiberg (designer na Vercel) — https://interfaces.rauno.me/ [CONFIRMADO; é opinião de um autor, não norma]. Itens que viram critério: animação de interação até ~200 ms; escala sutil proporcional ao gatilho; reduzir animação em ações frequentes; números tabulares; não mudar o peso da fonte no hover (evita pulo de layout); hover só em dispositivo com ponteiro; atualização otimista com reversão; feedback perto do gatilho (ex.: ✓ ao copiar); estado vazio que convida a criar; navegar listas com setas; evitar "espaço morto" entre itens clicáveis.

## 3. O que usuários de verdade dizem

Amostra: Hacker News (comentários, API Algolia). Reddit/X/Dribbble não acessíveis. Cada link abre o comentário.

| Padrão | Exemplo (paráfrase; trecho curto entre aspas é do original) | Link |
|---|---|---|
| Ver o site e pensar "equipe competente" antes de usar o produto | Sobre o Stripe: cores vivas, linhas nítidas e animações suaves ("smooth animations") passam a impressão de equipe capaz antes da análise racional; o autor ressalva que design também pode disfarçar produto ruim. | https://news.ycombinator.com/item?id=23081794 (hbosch, 2020-05) |
| Elogio ao "polimento" depois de usar | Raycast: "very well polished"; "lightweight, speed, excellent UI/UX"; "less friction" para estender. Elogio vem de **velocidade + extensibilidade + atalhos**, não de efeito. | https://news.ycombinator.com/item?id=37303052 · https://news.ycombinator.com/item?id=49834138 · https://news.ycombinator.com/item?id=38296626 |
| "Parece nativo" como elogio | Aconselha portar app garantindo que "look and feel native" e não seja Electron. | https://news.ycombinator.com/item?id=28633165 (eps, 2021) |
| "Atenção ao detalhe" ligada a animação, resposta rápida e tratamento de erro | Comentário sobre interfaces embarcadas: ganham com animação, tratamento de erro e resposta rápida. Outro elogia site pela animação e atenção ao detalhe. Outro cita som, animação e sequência como detalhe do jogo Vampire Survivors. | https://news.ycombinator.com/item?id=33439368 · https://news.ycombinator.com/item?id=9219320 · https://news.ycombinator.com/item?id=32098313 |
| Reclamação: animação ruim é percebida | "Nenhuma das duas animações é boa", mal passam num olhar rápido. Animação mal feita **piora** a impressão. | https://news.ycombinator.com/item?id=49915032 (spoiler, 2026-09) |
| Reclamação: web inchada | A maioria dos sites é "bloated" e põe experiência do usuário no fim da fila; mas "alguns são fluidos, funcionais e bonitos". | https://news.ycombinator.com/item?id=44392945 (monocularvision, 2025-06) |
| Elogio ao Linear por quem usou | Atalhos "tão bons quanto dizem" (aplicar comando no item sob o mouse, sem clicar); app desktop polido; "extremamente bonito". Críticas: editor, excesso de formas de organizar, mobile fraco. | https://macwright.com/2024/04/09/linear-notes [CONFIRMADO, blog pessoal] |

Palavras que **apareceram** nas fontes abertas: *smooth, polished, slick, beautiful, native, lightweight, speed, friction (pouco atrito), attention to detail, obsessive, pixel perfection (em vaga de emprego), flawless, craft*.
Palavras do pedido que **não encontrei** em fonte aberta e ficam como **[HIPÓTESE]** de vocabulário comum: *buttery, every pixel, delightful, feels alive, premium*. "Delightful" é do jargão da Apple/NN/g, não necessariamente de usuários.
NN/g adverte (aesthetic-usability) que elogio ao visual em teste pode refletir vontade de agradar; olhe o que a pessoa **faz**.

### Dois momentos do elogio (síntese minha, apoiada nas fontes acima)
- **Nos 5 primeiros segundos** ("uau"): composição limpa e com cara de produto conhecido (Tuch), tipografia e espaçamento seguros, cor com intenção, movimento de entrada suave que não bloqueia, carregamento instantâneo. Julgamento visual vem em ~50 ms (Lindgaard).
- **Depois de usar** (elogio duradouro): velocidade (<100 ms nas ações), atalhos de teclado, atualização otimista, estados vazios/erro bem escritos, consistência entre telas, acessibilidade, nada trava. É o que Raycast e Linear recebem nos comentários.

## 4. Efeitos e técnicas (catálogo)

Legenda de custo: B = baixo, M = médio, A = alto (esforço + risco de desempenho/acessibilidade). "Fonte" = onde se apoia; sem fonte aberta, está marcado.

| Efeito | Quando impressiona | Custo | Risco / virou clichê? | Fonte |
|---|---|---|---|---|
| Microinteração com propósito (estado de botão, ✓ ao copiar, mola no toggle) | Sempre em ação frequente: confirma e dá prazer | B | Baixo se ≤ ~200 ms e cancelável | NN/g microinterações; Freiberg; Apple Motion |
| Estados de hover/foco/pressionado em tudo que é clicável | Dá "vida" sem custo | B | Só em ponteiro; foco visível é acessibilidade | Freiberg |
| Animação de entrada curta, uma vez, escalonada | Primeiro uau sem atrasar | B | Se bloquear conteúdo, vira irritação | Apple Motion ("evite excesso em interações frequentes") |
| Contadores / números que sobem | Dado vivo | B | Útil só se o número importa; senão é enfeite; NN/g cita revelar números como boa prática de scroll-fade | https://www.nngroup.com/articles/scroll-fading-101/ [SECUNDÁRIA, só vi o resumo na busca] |
| Scroll-driven animations (CSS `animation-timeline`, `scroll()`/`view()`) | Revelar/encadear sem JavaScript | M | Suporte: Chrome/Edge desde 115 e Safari 26 [SECUNDÁRIA]; **Firefox: fontes divergem** (uma diz atrás de flag em 2026) — exigir fallback | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations [CONFIRMADO conceito]; suporte [HIPÓTESE], conferir em caniuse |
| View Transitions (mudança de estado ou de página) | Mantém contexto, reduz carga cognitiva e latência percebida | M | Suporte entre documentos irregular; sempre ter fallback | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API [CONFIRMADO conceito; tabela de suporte não carregou] |
| Tipografia grande / variável | Identidade forte, lê-se em 5 s | B–M | Peso mudando no hover causa pulo de layout (evitar) | Freiberg |
| 3D / WebGL leve | "Uau" de abertura; domina galerias de premiados | A | Peso, mobile, GPU fraca; precisa de degradação graciosa; "61% dos SOTD" é número não verificado | Awwwards (conceito) [SECUNDÁRIA] |
| Cursor personalizado / hover magnético | Charme em portfólio | M | Quebra em toque e teclado; não serve a app de trabalho [HIPÓTESE, sem fonte aberta] | — |
| Grão/textura, gradiente em malha | Calor e profundidade | B | Gradiente roxo→azul, cartões iguais e fonte Inter são citados como "marcas de IA/genérico" | https://www.925studios.co/blog/ai-slop-design-tells [SECUNDÁRIA, agência com interesse] |
| Bento (grade de cartões de tamanhos diferentes) | Hierarquia visual clara, bom para painéis | B–M | Sinais de saturação em 2023–24; difícil no celular e na acessibilidade | https://webdesignerdepot.com/what-is-the-bento-ui-trend-and-how-can-you-get-started [SECUNDÁRIA, sem pesquisa de opinião] |
| Vidro / Liquid Glass | Profundidade e sensação nativa | M | **NN/g criticou o Liquid Glass do iOS 26 por prejudicar legibilidade** (artigo de out/2025 não aberto; confirmado só por cobertura). A Apple adicionou opção mais opaca no iOS 26.1 | https://anderegg.ca/2025/10/12/nielsen-norman-group-on-ios-26-usability [SECUNDÁRIA] |
| Parallax sutil | Profundidade na abertura | M | Escala/deslocamento grande é gatilho vestibular; precisa de redução de movimento | MDN reduced-motion |
| Texto que se revela | Foco de leitura | B–M | Texto importante dentro de efeito de rolagem é a pior combinação segundo NN/g | https://www.nngroup.com/articles/scrolljacking-101/ [CONFIRMADO] |
| Paleta de comandos (Cmd+K) + atalhos visíveis | App "profissional"; muito citado em Linear/Raycast | M | Aprendizado; invisível no toque | Macwright; HN Raycast |
| Atualização otimista + esqueleto de carregamento | Parece instantâneo | M | Precisa reverter com aviso se falhar | Freiberg; NN/g tempos de resposta |

## 5. Régua do impressionar (14 itens verificáveis)

Cada item diz **quando o usuário nota** (5 s = primeira vista; uso = depois de usar) e **como verificar**.

1. **Composição legível em 1 olhada** (5 s). Um foco por tela, hierarquia clara, sem excesso de elementos. Teste: mostrar a tela por ~1 s a uma pessoa e pedir "o que é e o que fazer"; ela acerta. (Tuch; Lindgaard)
2. **Aparência de produto conhecido** (5 s). Padrões reconhecíveis (menu onde se espera) com acabamento acima da média; nada que obrigue a "aprender o layout". (Tuch)
3. **Tipografia com intenção** (5 s). Escala definida, no máximo 2 famílias, números tabulares em tabelas, sem pulo de layout em hover. Teste: passar o mouse em tudo e ver se algo se move. (Freiberg)
4. **Cor com papel** (5 s). Cada cor significa algo (acento, alerta, neutro); contraste legível. Teste: ferramenta de contraste ≥ AA em texto e ícones. (Webby: design acessível)
5. **Carga e primeira ação instantâneas** (5 s). Conteúdo útil visível rápido; ação < 100 ms parece direta, ≤ 200 ms de INP. Teste: medir INP e tempo de resposta de 3 ações frequentes. (NN/g; web.dev)
6. **Movimento com propósito, curto e cancelável** (5 s e uso). Cada animação diz "o que mudou" ou confirma; ≤ ~200 ms em interação; entrada de página uma vez; nada bloqueia o clique. Teste: listar cada animação e o seu motivo; as sem motivo saem. (Apple Motion; Freiberg)
7. **Respeita `prefers-reduced-motion` e tem alternativa sem movimento** (uso). Teste: ligar a opção no sistema e ver que nada grande se move. (MDN; Apple)
8. **Todo elemento clicável responde** (uso). Hover (só em ponteiro), foco visível, pressionado, desativado, carregando. Teste: percorrer com Tab e mouse. (Freiberg; NN/g microinterações)
9. **Estados vazio, erro e carregando desenhados** (uso). Texto que explica e diz o próximo passo; erro sem culpar; esqueleto em vez de tela em branco. Teste: forçar cada estado em cada tela. (NN/g pico-fim)
10. **Teclado em primeiro lugar** (uso). Enter envia, setas navegam listas, atalho para ação frequente, paleta de comandos se o app é de trabalho. Teste: fazer a tarefa principal sem o mouse. (Linear/Raycast; Freiberg)
11. **Consistência** (uso). Mesmo espaçamento, raio e cor em toda tela; nada "de outro sistema". Teste: sobrepor duas telas e comparar tokens.
12. **Detalhe de acabamento** (uso). Nada cortado ou sobreposto, alinhamento ao pixel, ícones do mesmo traço, seleção de texto estilizada, favicon, título de aba. Teste: ampliar 200% e procurar quebras. (Freiberg; "atenção ao detalhe" nos comentários)
13. **Funciona em tela pequena e em hardware fraco** (uso). Degradação graciosa dos efeitos pesados; nada depende de GPU. Teste: CPU limitada a 4× e janela estreita. (Webby: compatibilidade; Freiberg: adaptar ao hardware)
14. **Final e erros memoráveis** (uso). Confirmação de sucesso clara e discreta; o último passo do fluxo é o mais cuidado. Teste: percorrer o fluxo e avaliar a última tela. (NN/g pico-fim)

Regra de precedência (NN/g, delight): itens 5, 8, 9 e 10 (funciona e responde) vêm **antes** de efeitos de superfície. Efeito sobre produto instável é lido como gratuito.

## 6. Armadilhas

1. **Scrolljacking**: desorienta, usuário orientado a tarefa abandona; pior quando muda velocidade/direção com texto para ler; só tolerável curto, abaixo da dobra, com navegação fixa. NN/g: causa mais dano que benefício. https://www.nngroup.com/articles/scrolljacking-101/ [CONFIRMADO]
2. **Animação gratuita ou que bloqueia**: Apple pede brevidade e cancelamento; Freiberg pede reduzir nas ações frequentes.
3. **Delight sobre produto falho**: NN/g cita sites que tentaram "surpreender" e falharam em usabilidade.
4. **Humor ou "fofura" em marca séria**: NN/g (donut no pull-to-refresh).
5. **Efeitos pesados sem fallback** (3D, blur grande, vídeo): Freiberg alerta para custo de blur e GPU; vale ter versão leve.
6. **Beleza que mascara problema**: elogio em teste pode ser efeito estética-usabilidade; medir tarefa, não só opinião. (NN/g)
7. **Tudo igual**: gradiente roxo→azul, três cartões arredondados, Inter, hero idêntico são lidos como genérico [SECUNDÁRIA]. Antídoto: restrições de marca definidas antes de gerar.
8. **Vidro/transparência que derruba contraste** (caso Liquid Glass).
9. **Cursor e hover especiais sem alternativa** em toque e teclado [HIPÓTESE].
10. **Texto importante dentro de efeito** (revelar, rolagem presa).
11. **Mobile esquecido**: Awwwards e usuários reclamam de sites que quebram ou pesam no celular [SECUNDÁRIA].

## 7. Apps: o que faz alguém chamar de "lindo"

Fontes abertas são poucas; o que segue está marcado.
- **Linear**: velocidade tratada como parte do desenho, atalhos de uma letra, paleta de comandos, e dica de tecla mostrada na hora [SECUNDÁRIA: https://www.buildmvpfast.com/blog/linear-aesthetic-tokens-density-keyboard-first-ux-2026 e https://unsung.aresluna.org/tags/above-and-beyond/ (apareceram na busca, não abertos)]. Elogio direto e crítica equilibrada em https://macwright.com/2024/04/09/linear-notes [CONFIRMADO].
- **Raycast**: comentários citam polimento, leveza, velocidade, "menos atrito" para estender (links na seção 3).
- **Things**: Apple Design Award em 2009 e 2017; elogios citados à interface "toda refeita pixel a pixel" e a animações de abrir/fechar que mantêm você no lugar da lista — **mas as citações vêm da página do próprio fabricante** (https://culturedcode.com/), então é material promocional [SECUNDÁRIA, interessada].
- **Arc, Apple em geral**: sem fonte aberta suficiente nesta pesquisa. [HIPÓTESE] para qualquer afirmação sobre mola, háptico ou som; a HIG de movimento confirma apenas o princípio (háptico/áudio complementam animação).
- **Densidade, tipografia, estados vazios**: apoio direto em Freiberg (listas sem espaço morto, números tabulares, estado vazio que convida a criar).

## 8. Cinco descobertas mais úteis (resumo)

1. O "uau" dos primeiros 50 ms vem de **simplicidade + cara de produto conhecido**, não de efeito (Tuch/Lindgaard).
2. Júris pesam **Design 40% + Usabilidade 30%**; criatividade só 20% (Awwwards oficial). Webby e Apple também exigem acessibilidade.
3. O elogio **duradouro** de apps como Raycast e Linear é **velocidade, atalhos e baixo atrito**; efeito vem depois (NN/g: delight só funciona sobre produto usável).
4. Movimento premiado = **curto (~200 ms), com propósito, cancelável e com versão de movimento reduzido**; scrolljacking e texto em efeito são os erros que a pesquisa mais condena.
5. "Parece genérico" é a crítica de 2026 (gradiente roxo, cartões iguais, Inter): **restrições de marca e um conceito único** valem mais que somar efeitos.

## 9. Buscas feitas (para refazer)

WebSearch: "Lindgaard 2006 attention web designers 50 milliseconds"; "Google Research visual complexity prototypicality first impression"; "Aarron Walter Designing for Emotion pyramid"; "Awwwards Site of the Day 2025 trends"; "Awwwards Site of the Day jury comments"; "reddit web design attention to detail buttery smooth"; "why Linear app feels so good"; "Rauno Freiberg Web Interface Guidelines"; "NN/g scrolljacking"; "Nielsen Norman Group Liquid Glass"; "Baseline scroll-driven animations"; "Things 3 Apple Design Award"; "Webby Awards judging criteria"; "Dan Saffer Microinteractions"; "bento grid overused"; "web design trends fatigue AI generated"; "site:reddit.com r/web_design" (sem resultados de Reddit).
HN Algolia: `hn.algolia.com/api/v1/search?query=<termo>&tags=comment` com os termos "beautiful website smooth", "Raycast polished", "attention to detail animation", "feels native polished" (alguns termos retornaram 0 resultados: "scroll hijacking annoying…", "attention to detail website beautiful smooth").

## 10. Fontes (acesso em 2026-11-02)

| Fonte | Quem publica / interesse | Estado |
|---|---|---|
| https://www.awwwards.com/about-evaluation/ | Awwwards (o prêmio) | aberta |
| https://www.webbyawards.com/judging/ | Webby Awards | aberta |
| https://developer.apple.com/design/awards/ | Apple | aberta |
| https://developer.apple.com/design/human-interface-guidelines/motion | Apple (via JSON público) | aberta |
| https://www.nngroup.com/articles/aesthetic-usability-effect/ | NN/g (consultoria, independente de produto) | aberta |
| https://www.nngroup.com/articles/peak-end-rule/ | NN/g | aberta |
| https://www.nngroup.com/articles/theory-user-delight/ | NN/g | aberta |
| https://www.nngroup.com/articles/microinteractions/ | NN/g | aberta |
| https://www.nngroup.com/articles/response-times-3-important-limits/ | NN/g | aberta |
| https://www.nngroup.com/articles/scrolling-and-attention/ | NN/g | aberta |
| https://www.nngroup.com/articles/scrolljacking-101/ | NN/g | aberta |
| https://web.dev/articles/inp | Google | aberta |
| https://research.google/pubs/pub38315/ | Google Research (listagem do artigo de Tuch et al.) | só resumo |
| https://www.nature.com/news/2006/060109/full/news060109-13.html | Nature (jornalismo científico) | só apareceu em busca; **não aberta** |
| https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API | MDN (Mozilla) | aberta (sem tabela de suporte) |
| https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations | MDN | aberta (sem tabela de suporte) |
| https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | MDN | aberta |
| https://interfaces.rauno.me/ | Rauno Freiberg (designer, opinião de autor) | aberta |
| https://macwright.com/2024/04/09/linear-notes | Tom MacWright (blog pessoal) | aberta |
| https://news.ycombinator.com/item?id=23081794, 37303052, 49834138, 38296626, 28633165, 33439368, 9219320, 32098313, 49915032, 44392945 | Comentários de usuários do Hacker News | lidos via API Algolia |
| https://www.utsubo.com/blog/award-winning-website-design-guide | Agência (interesse comercial) | só em busca |
| https://anderegg.ca/2025/10/12/nielsen-norman-group-on-ios-26-usability | Blog pessoal, comenta o NN/g | só em busca |
| https://www.925studios.co/blog/ai-slop-design-tells | Agência (interesse comercial) | só em busca |
| https://culturedcode.com/ | Fabricante do Things (promocional) | só em busca |
| Não acessados: Reddit, X, Dribbble, Behance, Godly, Land-book, Lapa, FWA, CSS Design Awards | — | bloqueio ou 404 |

## 11. Aplicação ao plugin (recomendação)

Usar a **régua da seção 5** como lista de verificação dos designers e do revisor, em duas camadas: (A) itens 5, 7–11, 13 e 14 (funciona, responde, acessível) obrigatórios; (B) itens 1–4, 6 e 12 (acabamento visual e movimento) avaliados por comparação com um modelo aprovado. Catálogo de efeitos como lista de **opções com custo**, nunca como obrigação. Principal risco: tratar "impressionar" como mais efeito; a evidência aberta (NN/g, Awwwards 70% em design+usabilidade, comentários do HN) aponta para velocidade, clareza e acabamento. Segundo risco: quase toda a evidência de "o que usuários elogiam" vem de uma comunidade técnica (HN); faltou Reddit/X/Dribbble, então vale repetir a coleta quando o acesso existir.
