<!-- Texto próprio do agentes-ultimate, a partir da pesquisa docs/pesquisas/acabamento-premium-2026-11.md (só itens ABERTA viram regra) e das provas hd102 e hd103 (docs/provas/0.8.0-design/). Resumo na régua: impressionar.md, seção "Nível universal". -->
<!-- ref: tema=nivel-hd; palavras=nivel hd, acabamento hd, acabamento premium, cara de amador, cara de trabalho amador, mola, spring, linear(), view transition, view-transition-name, transicao premium, tira de quadros, filmstrip, objeto 3d, webgl, three.js, tone mapping, 2x, devicescalefactor; agentes=designer-sites, designer-interface, designer-paineis, designer-documentos, revisor, engenheiro-software -->
<!-- teste-ref: sim=tira essa cara de trabalho amador: transições premium e acabamento HD | a lente em 3D parece desenho, quero cara de produto real com WebGL; nao=faça a conciliação bancária de outubro -->
# Nível HD: como o trabalho é feito (vale em todo mundo de estilo)

Pedido do usuário (2026-11-02): "o mínimo é o máximo bem feito". O **nível** é universal: objeto real quando houver objeto,
movimento com mola e continuidade, acabamento a 2×, provas por quadros. O **estilo** é outra coisa: vem do mundo escolhido
(`mundos/INDICE.md`; ordem de escolha em `impressionar.md`, "O mundo vem antes da régua"). Apple com Liquid Glass é um mundo
entre os outros, nunca o padrão. Um site editorial também precisa de mola, continuidade, 2× e prova por quadros; um painel
técnico também precisa de borda fina, sombra em camadas e números tabulares.

## 1. Regras (só itens ABERTA da pesquisa; a fonte de cada uma está lá)
1. **Objeto 3D:** material de vidro ou lente em WebGL define **mapa de ambiente** (three.js: "sempre defina um mapa de
   ambiente"), `thickness` > 0 com `transmission`, `ior` e `clearcoat`; para baratear, `renderer.transmissionResolutionScale`.
2. **Mapeamento de tons explícito:** `NeutralToneMapping` (Khronos PBR Neutral) para produto bem iluminado; o three.js tem
   `AgX` e `ACESFilmic` para cena HDR.
3. **Mola de interface por duração e bounce** (WWDC23 "Animate with springs"): bounce 0 por padrão; ~0,15 quase imperceptível;
   ~0,3 perceptível; acima de ~0,4 exagera. Comece pela duração, depois o bounce. Mola interrompida continua **da velocidade
   atual**; ease-in-out não representa a velocidade inicial. Movimento nunca é o único meio de informar (HIG).
4. **Mola em CSS por `linear()` amostrada** (MDN): 30 a 60 pontos, gerada por script a partir dos **mesmos** parâmetros da mola
   do JS (`<plugin>/modelos/mola-linear.js`). Uma família de molas por produto, nunca curva de olho.
5. **Animar só `transform` e `opacity`** (web.dev); `will-change` só no que vai mudar.
6. **Continuidade de objeto:** o mesmo elemento atravessa a mudança (no WebGL, o mesmo objeto; entre estados do DOM,
   `view-transition-name` único). Limites (MDN, Chrome): uma transição por vez; entre páginas só na mesma origem; o Firefox não
   faz entre páginas. Sempre com plano B sem a transição.
7. **`prefers-reduced-motion`** respeitado e testado com a emulação `reduce`.
8. **Tipografia:** `font-optical-sizing: auto` com fonte que tenha eixo `opsz`; `text-wrap: balance` em títulos (até 6 linhas
   no Chromium) e `pretty` em texto corrido.
9. **Cantos contínuos:** `corner-shape: squircle` só dentro de `@supports`, com raio simples de reserva (recurso experimental).
10. **Provas a 2×** (`deviceScaleFactor: 2`). Quadros de transição por **relógio controlado** (`page.clock` install, pauseAt,
    runFor; ou `getAnimations()` pausadas com `currentTime`); no WebGL, a mola avança por passo fixo. Não depender de
    `HeadlessExperimental.beginFrame` nem de espera por tempo de máquina.

### A validar ([HIPÓTESE]: usados nas provas, sem fonte aberta ainda)
- Ambiente de estúdio (`RoomEnvironment` + `PMREMGenerator`, faixas de luz tipo softbox) no lugar de arquivo HDR.
- Imagem de reserva **renderizada do mesmo objeto** (sem WebGL, sem JS e com movimento reduzido).
- Borda de 0,5 px em tela 2× (`@media (min-resolution: 2dppx)`); sombras em 2 a 4 camadas; `tabular-nums`.
- Grão `feTurbulence` em `overlay` (opacidade 0,2 a 0,5) contra faixas no degradê; o teste numérico de faixas ainda falta.
- Tracking −0,02 a −0,04 em títulos acima de 48 px.
- Entrada escalonada: o principal primeiro, 30 a 60 ms entre irmãos (as provas usaram 34 e 45 ms).
- Limites da análise de curva (`<plugin>/modelos/tiras/`): 1º passo não é o maior; último ≤ 8% do maior; recuo ≤ 1%;
  nenhum quadro com mais de 50% do percurso.
- Objeto 3D com ≤ 1% de pixels brancos saturados (a pesquisa abriu o critério do Neutral; o limite numérico é nosso).
- Fórmula do amortecimento: as provas usam 4π(1 − bounce) ÷ duração (amortecimento crítico em bounce 0); a nota da pesquisa
  traz "1 − 4π × bounce ÷ duração", provável erro de transcrição. Conferir na sessão da WWDC23.
- Valores das molas das provas (resposta 0,42 s/0; objeto 0,5 s/0,15; pico 0,55 s/0,3) são escolha nossa.

## 2. Método (nos designers; o mundo é escolhido antes, pela régua)
1. **Mundo** com a frase do porquê ("mundo: X, porque Y"). Sem pedido nem produto que justifique, nada de vidro ou cara de
   Apple. Se há objeto físico: objeto 3D real (WebGL) × foto real × nenhum. Ilustração plana não representa produto físico.
2. **Mola da casa** (duração e bounce, ou rigidez e amortecimento) e o `linear()` dela por script (`modelos/mola-linear.js`).
   **Coreografia** escrita: o principal primeiro, o intervalo entre irmãos e o que é contínuo entre seções ou estados.
3. Construir no nível desde o começo: 2×, borda fina, sombra em camadas, números tabulares, `@supports` nos recursos novos.
4. Objeto 3D: ambiente, mapeamento de tons explícito, vidro com espessura, imagem de reserva.
5. Provar: capturas a 2×, a tira de cada transição principal com a análise de curva (`modelos/tiras/`), o "girar 20°" do objeto
   (os reflexos mudam de lugar em relação ao corpo) e as reduções.
6. Abrir cada PNG a 2× e cada tira: "parece produto real fotografado ou renderizado, ou parece ilustração? O movimento parece de
   produto premium ou de site de modelo?". Se não parecer, novo passe (até 3).

## 3. Verificação automática
| Teste | Como | Modelo |
|---|---|---|
| Tira de quadros | relógio controlado; quadro a 2× por tempo escolhido | `modelos/tiras/` |
| Curva suave | posição por quadro → passo; reprova salto, parada seca, recuo e degrau | `modelos/tiras/tiras.js` (`curva`) |
| Mola única | o `linear()` do CSS sai do mesmo script e dos mesmos parâmetros do JS | `modelos/mola-linear.js` |
| Reflexo real | o mesmo quadro a 0° e a 20°: os reflexos mudam de lugar | tira de 2 quadros |
| Sem estouro | % de pixels saturados no recorte do objeto | verificador da prova |
| Reserva | sem WebGL, sem JS e com movimento reduzido: a imagem aparece | verificador da prova |
| Coerência | o texto bate com o objeto e o estado, com mutação que tem de falhar | verificador da prova |
| Interrupção | reverter no meio: diferença entre o último quadro antes e o 1º depois ≤ 0,05 | tira + leitura do estado |

## 4. Telas de app (qualquer mundo; prova hd103 em `docs/provas/0.8.0-design/e2e/`)
1. **Continuidade da tarefa principal:** o objeto escolhido atravessa a mudança com `view-transition-name` único (lista → ficha;
   grade → tela cheia; e a volta para o lugar exato). **O foco segue o objeto**: ao abrir, vai para "Fechar"; ao fechar
   (também com Esc), volta ao item.
2. **Ordem dos grupos explícita** quando há sobreposição (fundo < objeto < controles, `z-index` nos `::view-transition-group`).
   A tira acha o defeito que o PNG parado não mostra (a foto que crescia passava por baixo do fundo).
3. **Momento-pico com resposta física** no mesmo quadro: o controle salta (mola "pico"), o visto se desenha, o placar rola.
4. **Interrupção sem salto:** estado de interação por transição CSS (retoma do valor atual) ou Web Animations canceladas e
   recomeçadas do estado atual; medido pela tira.
5. **Coerência depois de cada ação** (régua, item 5), conferida por script com mutação.
6. **Coreografia:** entrada uma vez, escalonada; revelação ao rolar só no que entra (`animation-timeline: view()`, sem prender
   a rolagem). O mundo muda a forma, não o nível.
7. **Imagem de conteúdo sem foto de terceiros:** renderizar por shader próprio, **uma vez**, em WebP, com a origem escrita na
   tela (o navegador sem interface leva ~40 s para compilar um shader assim ao vivo).
8. **Verificação:** capturas a 2×; tiras com `getAnimations()` pausadas (sem as animações por rolagem); só `transform` e
   `opacity` animados (sem contar as animações `-ua-` do próprio navegador na View Transition); `linear()` com 30 ou mais
   pontos; contraste sobre foto e vidro na **caixa das letras**, não no retângulo do botão.

## 5. Critério de pronto (designers; o revisor confere)
- [ ] Frase do mundo com o porquê; nada de Apple ou vidro sem ela.
- [ ] Objeto físico = objeto 3D real ou foto real, com reserva; "girar 20°" provado.
- [ ] Mola declarada e amostrada em `linear()` por script; coreografia escrita; continuidade do objeto.
- [ ] Tira de cada transição principal, aberta, com a análise de curva passando (em app: abrir, fechar, concluir, interrupção).
- [ ] Capturas a 2× abertas e conferidas; foco que segue o objeto (app); reduções sem animação.
- [ ] Tudo o que já era piso continua (camada 1 da régua).
- Documento: sem movimento; vale o 2×, a borda fina e a tipografia.
