# Proposta: o padrão HD dos designers (nível universal × mundos de estilo)

Origem: revisão do usuário sobre a vitrine Clara 35 (2026-11-02). "Ainda falta tirar a cara de trabalho amador: movimentos e
transições, acabamentos mais HD, a lente com cara de desenho; o mínimo é o máximo bem feito." E a correção: "não é tudo que vai
ser padrão Apple ou com vidro".
Base: a pesquisa `docs/pesquisas/acabamento-premium-2026-11.md` (2ª rodada, cod pq101) e esta prova (`LEIA-ME.md`, `tiras.js`,
`verificar.js`, `png/`). **Entram como regra só os itens marcados ABERTA na pesquisa**. Os [HIPÓTESE] ficam em "A validar".

## 1. Duas coisas diferentes, que não se misturam

| | O que é | Quando vale |
|---|---|---|
| **A. Nível HD (universal)** | Como o trabalho é **feito**: objeto real quando houver objeto, movimento com mola e continuidade, acabamento em 2×, provas por quadros. | **Sempre**, em qualquer estilo, qualquer produto. É o piso novo da camada 2 da régua "impressiona". |
| **B. Mundo de estilo** | Como o trabalho **parece**: tipografia, paleta, materiais, ritmo. A Apple com Liquid Glass é **um** mundo entre vários. | **Escolhido** pelo briefing ou pelo produto, com o porquê escrito numa frase. Nunca por padrão. |

Exemplos de mundos (repertório, não lista fechada): **produto Apple / Liquid Glass** (câmera, fone, hardware premium: esta
vitrine); **editorial** (revista, grid tipográfico, foto grande, sem vidro); **técnico/dados** (painel, mono, precisão, densidade);
**artesanal/quente** (papel, textura, serifa, cor de terra); **lúdico** (forma e cor fortes, personagem); **brutalista/manifesto**
(tipo gigante, cor chapada, contraste). O nível A vale igual em todos: um site editorial também precisa de mola, continuidade, 2× e
prova por quadros; um painel técnico também precisa de bordas finas, sombra em camadas e números tabulares.

**Regra de escolha do mundo:** o designer escreve "mundo: X, porque Y (produto/briefing)". Se o briefing não pede e o produto não
justifica, **não** usa vidro nem cara de Apple. O revisor reprova "Apple por padrão": vidro ou estética Apple sem essa frase.

## 2. Nível HD: regras (só itens ABERTA da pesquisa)
1. **Objeto 3D real quando houver objeto.** Material de vidro ou lente em WebGL define **mapa de ambiente** (PMREM de uma sala com
   faixas de luz tipo softbox) e `thickness` > 0, com `transmission`, `ior` e `clearcoat`. Para baratear, use `transmissionResolutionScale`.
2. **Tone mapping explícito:** `NeutralToneMapping` para produto bem iluminado; `AgX` ou `ACESFilmic` para cena HDR.
3. **Movimento de interface com mola** (duração + bounce): bounce 0 por padrão, no máximo ~0,4. A interrupção continua da
   velocidade atual, a animação pode ser cancelada e o movimento nunca é o único meio de informar.
4. **Mola em CSS por `linear()` amostrada** (30 a 60 pontos), gerada por script a partir dos mesmos parâmetros da mola do JS.
5. **Animar só `transform` e `opacity`**; `will-change` só onde é preciso.
6. **Continuidade de objeto:** o mesmo elemento atravessa a mudança (no WebGL, o mesmo objeto; entre estados do DOM, `view-transition-name`
   único). Respeitar os limites: uma transição por vez; entre páginas, só na mesma origem; o Firefox não faz entre páginas. Ter plano B sem a transição.
7. **`prefers-reduced-motion`** respeitado e testado (emulação `reduce`).
8. **Tipografia:** `font-optical-sizing: auto` com fonte que tenha `opsz`; `text-wrap: balance` em títulos (até 6 linhas), `pretty` em texto corrido.
9. **Cantos contínuos** com `corner-shape: squircle` só dentro de `@supports`, com raio simples como plano B.
10. **Provas visuais em 2×** (`deviceScaleFactor: 2`). Os quadros de transição vêm de **relógio controlado**: `page.clock` (install,
    pauseAt, runFor) ou pausar as animações (`getAnimations`) e avançar `currentTime`. No WebGL, avançar a mola por passo fixo.
    Não depender de `HeadlessExperimental.beginFrame`.

### A validar (vieram da pesquisa como [HIPÓTESE]; esta prova testou alguns, sem fonte aberta ainda)
- Borda fina de 0,5 px em telas 2× (`@media (min-resolution: 2dppx)`). Usado aqui.
- Sombras em 2 a 4 camadas (curta e nítida + longa e suave). Usado aqui.
- Grão `feTurbulence` contra faixas no degradê (opacidade 0,2 a 0,5, `overlay`). Usado aqui; o teste numérico de faixas ainda falta.
- Tracking −0,02 a −0,04 em títulos acima de 48 px. Usado aqui.
- Limites numéricos do teste de curva (1º passo não pode ser o maior; último passo ≤ 8% do maior; recuo ≤ 1%). Em `tiras.js`.
- Objeto 3D com ≤ 1% de pixels brancos saturados. Em `verificar.js`.

## 3. Método (entra no método dos 3 designers; o mundo é escolhido no passo 2)
1. Briefing e produto → **mundo de estilo** com a frase do porquê. Se há objeto físico, decidir **objeto 3D real** (WebGL) ×
   foto real × nenhum. Ilustração plana não representa um produto físico.
2. Definir a **mola da casa** (rigidez e amortecimento, ou duração e bounce) e gerar o `linear()` dela por script. Definir a
   **coreografia**: o principal primeiro, intervalo entre irmãos (40 a 60 ms) e o que é contínuo entre seções.
3. Construir com o nível A desde o início: 2×, bordas finas, sombras em camadas, números tabulares, `@supports` nos recursos novos.
4. Objeto 3D: ambiente com softbox, tone mapping explícito, vidro com espessura, borda pintada, imagem de reserva **renderizada do
   mesmo objeto** (sem WebGL, sem JS e com movimento reduzido).
5. Provar: as capturas em 2×, as tiras de quadros de cada transição principal, a análise da curva, o "girar 20°" do objeto e as reduções.
6. Abrir cada PNG a 2× e cada tira e perguntar: "parece produto real fotografado ou renderizado, ou parece ilustração? O movimento
   parece de produto premium ou de site de modelo?". Se não parecer, novo passe (até 3).

## 4. Verificação automática (scripts desta prova, para virar modelo do plugin)
| Teste | Como | Onde |
|---|---|---|
| Tira de quadros da transição | relógio controlado: mola avançada 50 ms por quadro (WebGL) e `getAnimations()` pausado com `currentTime` 0…600 ms (CSS) | `tiras.js` |
| Curva suave | posição por quadro → velocidade; reprova salto no início, parada seca e recuo | `tiras.js` → `png/tiras-medidas.json` |
| Reflexo real | o mesmo quadro a 0° e a 20°: os reflexos mudam de lugar | `png/tira-girar-20graus.png` |
| Sem estouro | % de pixels saturados no recorte do objeto | `verificar.js` (objeto-3d) |
| Reserva | sem WebGL, sem JS e com movimento reduzido: a imagem renderizada aparece | `verificar.js` |
| Coerência | o texto bate com o objeto 3D (7 vidros, 5 grupos, 11 lâminas), com mutação que tem de falhar | `verificar.js --mutar` |
| 2× | todas as capturas em `deviceScaleFactor: 2` | `verificar.js`, `tiras.js`, `foto.js` |

## 5. Critério de pronto (acrescentar ao dos designers e à régua do revisor)
- [ ] Frase do mundo de estilo escrita, com o porquê; nada de Apple ou vidro sem ela.
- [ ] Objeto físico = objeto 3D real ou foto real, com imagem de reserva do mesmo objeto; o "girar 20°" provado.
- [ ] Mola declarada (parâmetros) e amostrada em `linear()`; coreografia escrita; continuidade do objeto entre seções.
- [ ] Tira de quadros de cada transição principal, com a análise de curva passando.
- [ ] Todas as capturas em 2×, abertas e conferidas; bordas finas, sombras em camadas, sem faixas visíveis.
- [ ] Tudo o que já era piso continua: contraste no pior ponto, teclado, sem JS, reduções, 320 a 1920 sem rolagem lateral, LCP e CLS.

## 6. Onde mexer no plugin (proposta; o curador avalia e o usuário aprova)
- `conhecimento/design/nivel-hd.md` (novo): seções 1 a 5 acima, com o modelo de `tiras.js` e da mola em `linear()`.
- `conhecimento/design/impressionar.md`: a camada 2 passa a exigir o nível HD. A "junção" (cara de Apple + vidro + 3D) vira
  **um exemplo de mundo**, e o texto deixa claro que não é o padrão.
- `designer-sites`, `designer-paineis`, `designer-documentos`: passo "mundo de estilo com porquê" no método; nível HD no critério
  de pronto. Documento: sem movimento, mas com 2×, bordas finas e tipografia.
- `revisor`: reprova "Apple por padrão" e tira de quadros ausente; abre os PNGs a 2× e as tiras antes de ler a autocrítica.
- `modelos/`: `mola-linear.js` (gera o `linear()` a partir de rigidez e amortecimento ou de duração e bounce) e `tiras.js` genérico.

## 7. Evidência desta prova
Vitrine Clara 35 (mundo: produto Apple / Liquid Glass, porque o produto é uma câmera premium e o briefing pediu esse mundo):
lente em three.js 0.170.0 com geometria procedural, ambiente de estúdio e Neutral; mola única (rigidez 170, amortecimento 24) no
WebGL e no CSS; tiras `png/tira-lente-escuro.png`, `png/tira-revelacao.png`, `png/tira-reserva.png`, `png/tira-girar-20graus.png`;
medidas em `png/tiras-medidas.json` e `png/saida-tudo.txt`.

## 8. Telas de app (qualquer mundo de estilo; designer-paineis, prova hd103 em `../e2e/`)
Mesmo nível, dois mundos, de propósito: **caso A** (app de tarefas) = mundo **agenda de papel editorial**, porque o produto é a
agenda do dia (serifa com tamanho óptico, papel, caneta vermelha, marca-texto; sem vidro, sem Apple); **caso B** (fotos) = mundo
**Apple / Liquid Glass**, porque o pedido foi "efeito vidro estilo Apple". As regras abaixo valem para os dois.
1. **Continuidade da tarefa principal.** O objeto que o usuário escolheu atravessa a mudança de estado com `view-transition-name`
   único: lista → ficha (o título da tarefa viaja e o marca-texto escorrega); grade → tela cheia (a mesma foto cresce) e a volta
   para o lugar exato. **O foco segue o objeto**: ao abrir, vai para "Fechar"; ao fechar (inclusive com Esc), volta ao item.
2. **Ordem dos grupos explícita** quando há sobreposição (fundo < objeto < controles, por `z-index` nos `::view-transition-group`).
   Defeito achado pela tira e invisível no PNG parado: a foto que crescia passava por baixo do fundo do visor.
3. **Momento-pico com resposta física.** Ao concluir: a casinha salta (mola "pico"), o visto se desenha, o risco corre, o placar
   rola e a casa da fita assenta, no mesmo quadro. Uma família de molas por produto, gerada por script (`gerar-molas.js`, WWDC23:
   rigidez (2π/d)², amortecimento 4π(1 − bounce)/d): resposta (0,42 s, bounce 0), objeto (0,5 s, 0,15), pico (0,55 s, 0,3); 49 pontos.
4. **Interrupção sem salto.** Estado de interação por transição CSS (retoma do valor atual) ou Web Animations canceladas e
   recomeçadas do estado atual. Teste: desfazer aos 160 ms e medir a diferença entre o último quadro antes e o primeiro depois
   (≤ 0,05; deu 0,000).
5. **Coerência depois de cada ação:** todo lugar que mostra o mesmo fato muda junto (placar, rótulos, "próxima", botão, prazo),
   conferido por script com mutação que tem de falhar.
6. **Coreografia:** entrada uma vez, escalonada (34 ms entre irmãos, o principal primeiro); revelação ao rolar só no que entra
   (`animation-timeline: view()`, sem prender a rolagem). O que muda com o mundo é a forma, não o nível: no papel, visto de caneta e
   risco à mão; no vidro, a foto que cresce e os controles que descem.
7. **Imagem de conteúdo "real" sem foto de terceiros:** quando a tela mostra fotos e não há fotos reais, renderizar por shader
   próprio (céu com dispersão, nuvens por ruído, água com Fresnel e brilho do sol, ACES, vinheta, grão), **uma vez**, em WebP, com a
   grade de luminância num `.js` (`file://` bloqueia ler pixels de imagem) e a origem escrita na tela. Ao vivo, o SwiftShader do
   navegador sem interface leva ~40 s só para compilar o shader.
8. **Verificação (telas de app):** capturas em 2×; tiras com `getAnimations()` pausado e `currentTime` (deixar de fora as animações
   por rolagem, que não aceitam tempo absoluto); propriedades animadas só `transform`/`opacity`, sem contar as animações do próprio
   navegador para a View Transition (nomes `-ua-`); presença da transição pelo nome do pseudo-elemento; `linear()` com 30 ou mais
   pontos; contraste sobre foto e vidro na **caixa das letras** (Range), não no retângulo do botão.

**Critério de pronto (telas de app):** frase do mundo; tira de cada transição principal (abrir e fechar, concluir, interrupção)
aberta e conferida; foco que segue o objeto; coerência com mutação; reduzido sem animação; tudo o que já era piso continua.
**A validar:** os valores de bounce e o intervalo de 34 ms são escolha nossa ([HIPÓTESE]).
