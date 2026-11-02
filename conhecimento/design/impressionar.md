<!-- Texto próprio do agentes-ultimate, a partir das pesquisas docs/pesquisas/pesquisa-impressionar-2026-11.md (régua, armadilhas) e docs/pesquisas/acabamento-premium-2026-11.md (só itens ABERTA viram regra) e da prova pv94 (docs/provas/0.8.0-design/e2e/). Independente de estilo: o mundo visual vem do briefing (mundos/INDICE.md). -->
<!-- ref: tema=impressionar; palavras=impressiona, impressionar, visual premium, premium, app premium, site premium, bonito, uau, wow, redesenhe, redesenho, landing, vitrine, cara de apple, estilo apple, liquid glass, efeito vidro, 3d, aparecer ao rolar; agentes=designer-sites, designer-interface, designer-paineis, designer-documentos, revisor -->
<!-- teste-ref: sim=redesenhe meu app com visual premium que impressione | quero uma landing com cara de Apple que impressione; nao=concilie o extrato bancário de outubro -->
# Impressionar: a régua do plugin (piso obrigatório + camada que impressiona)

Correto e acessível é o **piso**: obrigatório e insuficiente. A entrega só está pronta quando passa nas duas camadas e na
junção. A régua mede o **nível**, não o estilo: o mesmo rigor vale para um site editorial, um painel corporativo, um app
lúdico ou uma vitrine com vidro. "O mínimo é o máximo bem feito": pouca coisa, cada uma no ponto mais alto de execução.

## O mundo vem antes da régua
Toda peça premium vive num **mundo visual** só (tipografia, cor, material, movimento, forma e imagem da mesma família).
Os mundos e as suas exigências estão em `mundos/INDICE.md`. Ordem de quem escolhe:
1. **Marca e decisões do projeto** (guia de marca; `.claude/base/PROJETO.md`, seção "Gosto visual", se existir).
2. **Briefing e produto:** quem usa, o que o produto faz, o tom que a categoria pede e o que ela evita.
3. **Sem nada disso:** o designer propõe 2 ou 3 mundos, com 1 linha de porquê cada e uma recomendação; não decide por gosto.
Nenhum mundo é o padrão do plugin. O gosto de um usuário vale para o projeto dele (anotado em "Gosto visual" pelo
orquestrador), nunca para os outros. Apple / Liquid Glass é um mundo entre os outros (`mundos/apple-liquid-glass.md`).

## Camada 1: funciona, responde, é acessível (falhou um item, não entrega)
1. Primeira ação instantânea: resposta ≤ 100 ms parece direta; INP ≤ 200 ms.
2. Todo clicável responde: hover (só com ponteiro), foco visível ≥ 3:1, pressionado, desabilitado, carregando.
3. Vazio, erro e carregando desenhados, com o próximo passo escrito.
4. Teclado: a tarefa principal sem mouse; setas em listas; atalho da ação frequente visível na tela.
5. Coerência: depois de cada ação, **todo** lugar que mostra o mesmo fato muda junto (placar, rótulos, botão, prazo).
6. Contraste no pior ponto: texto ≥ 4,5:1 (3:1 grande); sobre foto, textura, grão e vidro, medido pixel a pixel, não na média.
7. 390 px e hardware fraco: nada cortado (inclusive controle fixo na borda), efeito pesado com reserva.
8. Movimento reduzido, transparência reduzida e contraste mais: legível, completo, nada grande se move.

## Camada 2: impressiona (não é opcional; julgada no PNG, ao lado de uma referência do mesmo mundo e categoria)
9. **Uma ideia** que se diz numa frase, vinda do produto, visível sem rolar (tirando o logo, ainda é só deste produto).
10. Composição de uma olhada: um foco; o mais importante no alto e no início; primeiro quadro ocupado (no 1440 × 900,
    nenhuma faixa vazia acima de ~25% da altura sem motivo declarado; o espaço amplo de um mundo sóbrio é declarado).
11. Tipografia com intenção: um degrau de exibição (≥ 2,5× o corpo) no título ou no número principal, escala curta,
    números tabulares, nada pula no hover; o par de fontes é o do mundo escolhido, com licença que cobre o uso.
12. Cor com papel: um acento; neutros escolhidos pela cena e pelo mundo; escuro desenhado em camadas, não invertido; sem a
    cor padrão do sistema "porque sim".
13. Material e profundidade com função: **o material do mundo** (papel, tinta chapada, vidro, metal, luz, grão) em 3 a 4
    camadas legíveis; vidro só onde algo flutua e só no mundo que o pede, fiel ao Liquid Glass (`apple/materiais.md`
    §receita) e com prova de que há conteúdo passando por trás.
14. Movimento com propósito: um movimento dominante, com **a curva do mundo** (mola sem quique no sóbrio, quique leve no
    lúdico, corte seco no brutalista); o **momento-pico** do produto (concluir, enviar, comprar) desenhado em ≤ 250 ms;
    entrada uma vez só; nada bloqueia o clique.
15. Acabamento HD e realismo: telas e capturas a 2× nítidas; ícones do mesmo traço; seleção e foco desenhados; dado de
    exemplo plausível e coerente; nada encostado; o que o mundo chama de "real" (foto, papel, objeto 3D, grão, tela do
    produto) parece feito de verdade, não clip-art nem degradê genérico.
16. Final memorável: o último passo do fluxo é o mais cuidado (confirmação discreta, desfazer).

## Nível universal (vale em todo mundo)
O nível HD é a mesma exigência em qualquer estilo: objeto real quando houver objeto, mola única (CSS em `linear()` gerado
por script), só `transform` e `opacity`, continuidade do objeto, provas a 2× e tiras de quadros por relógio controlado.
Regras (só itens ABERTA da pesquisa), o que ainda está a validar, método, verificação e critério: `nivel-hd.md`. Modelos:
`<plugin>/modelos/mola-linear.js` e `<plugin>/modelos/tiras/`.

## A junção (a combinação do mundo escolhido, sem virar "sopa")
O padrão é a **combinação numa peça só, dentro do mundo escolhido**: a ideia + o par tipográfico + a paleta + o material +
a curva + a forma do mundo (`mundos/<mundo>.md`). Regras:
- **Um efeito dominante**; os outros apoiam e falam a mesma língua: **uma curva** (a mesma mola), **um material**, **uma
  luz** (a mesma direção no brilho, na sombra e em qualquer inclinação 3D) e **uma paleta**, todas do mesmo mundo.
- **Teste de junção:** para cada elemento (tipografia, cor, material, imagem, 3D, revelação, efeito), escreva em 1 linha
  como ele serve à ideia e ao mundo. Tire-o mentalmente: se a ideia não perde nada, **ele sai**. Elemento sem linha = sopa.
- **Mistura de mundos** só com motivo escrito (ex.: editorial com a grade do suíço); dois materiais ou duas curvas = sopa.
- **Site e landing:** a camada de impacto (3D, revelação ao rolar, efeito de fundo) entra **quando o mundo e a ideia
  pedem**: sem sequestrar a rolagem, texto visível sem JS e no fim do movimento, ≤ 1 efeito dominante, desempenho medido
  (INP, CLS, quadros perdidos). Num mundo sóbrio, o impacto pode ser só tipografia e composição.
- **App:** 3D e revelação só onde explicam o movimento (de onde veio o detalhe, o que acabou de chegar à lista); nada em
  navegação frequente.
- **Documento:** sem movimento; a camada 2 é ideia, tipografia, composição e acabamento.

## Autocrítica (escrita no relatório, antes de entregar)
Para cada PNG: os 16 itens com sim/não; o mundo escolhido e de onde veio (marca, projeto, briefing ou proposta); a frase
"o que um usuário exigente notaria nos primeiros 5 s"; o **teste do mundo**: os 3 sinais de amador do arquivo do mundo,
um a um (no mundo Apple ou com vidro, também o "parece Apple ou parece tentativa?" de `apple/materiais.md`, com a
ampliação 2×); o teste de junção; uma referência da categoria nomeada e o que ela ainda faz melhor (estudada,
nunca imitada: sem copiar composição, layout nem a ordem dos blocos). Camada 1 com "não" = não entrega. Camada 2 com 2 ou mais
"não" = novo passe (até 3). O que continuar abaixo vai em "ainda não está no nível", sem esconder.

## O revisor
Roda a régua **antes** de ler a autocrítica do autor (independência). Julga o **nível** e a **coerência com o mundo
declarado**, nunca a semelhança com um estilo de que gosta. Camada 1 falhou = VERMELHO. Camada 2 numa entrega prometida
como premium: 2 ou mais itens = VERMELHO; 1 item = AMARELO com o número do item e a correção. Elemento que não passa no
teste de junção ou que sai do mundo sem motivo = AMARELO "tirar". Sinal de amador do mundo presente = achado no item 15.
Abre os PNGs; com vidro, a ampliação 2× e o teste "parece Apple" (só no mundo Apple ou com vidro pedido).

## Armadilhas (da pesquisa)
Somar efeitos no lugar de uma ideia; sequestrar a rolagem; texto importante dentro de efeito; efeito sobre produto que
falha; "tudo igual" (gradiente roxo→azul, 3 cartões iguais, Inter sem intenção); escolher o mundo pelo gosto de quem
desenha, não pelo produto; vestir tudo de Apple e vidro; textura ou grão que derruba contraste; vidro que derruba
contraste; "fosco branco com borda cinza" vendido como Liquid Glass; checar o atributo (`hidden`) em vez do que aparece.

Critério "tema distinto e coeso": Apple Design Awards, categoria Visuals and Graphics (https://developer.apple.com/design/awards/,
aberta em 2026-11-02 pela pesquisa de impressionar). O mesmo nível vale em qualquer mundo.
