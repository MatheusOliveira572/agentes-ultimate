<!-- Texto próprio do agentes-ultimate, a partir da pesquisa docs/pesquisas/pesquisa-impressionar-2026-11.md (régua de 14 itens, armadilhas) e da prova pv94 (docs/provas/0.8.0-design/e2e/). -->
<!-- ref: tema=impressionar; palavras=impressiona, impressionar, visual premium, premium, app premium, site premium, bonito, uau, wow, redesenhe, redesenho, landing, vitrine, cara de apple, estilo apple, liquid glass, efeito vidro, 3d, aparecer ao rolar; agentes=designer-sites, designer-interface, designer-paineis, designer-documentos, revisor -->
<!-- teste-ref: sim=redesenhe meu app com visual premium que impressione | quero uma landing com cara de Apple que impressione; nao=concilie o extrato bancário de outubro -->
# Impressionar: a régua do plugin (piso obrigatório + camada que impressiona)

Pedido do usuário (2026-11-02): "quero algo que impressiona, e esse seja o padrão do nosso plugin". Correto e acessível
é o **piso**: obrigatório e insuficiente. A entrega só está pronta quando passa nas duas camadas e na junção.

## Camada 1: funciona, responde, é acessível (falhou um item, não entrega)
1. Primeira ação instantânea: resposta ≤ 100 ms parece direta; INP ≤ 200 ms.
2. Todo clicável responde: hover (só com ponteiro), foco visível ≥ 3:1, pressionado, desabilitado, carregando.
3. Vazio, erro e carregando desenhados, com o próximo passo escrito.
4. Teclado: a tarefa principal sem mouse; setas em listas; atalho da ação frequente visível na tela.
5. Coerência: depois de cada ação, **todo** lugar que mostra o mesmo fato muda junto (placar, rótulos, botão, prazo).
6. Contraste no pior ponto: texto ≥ 4,5:1 (3:1 grande); sobre foto e vidro, medido pixel a pixel, não na média.
7. 390 px e hardware fraco: nada cortado (inclusive controle fixo na borda), efeito pesado com reserva.
8. Movimento reduzido, transparência reduzida e contraste mais: legível, completo, nada grande se move.

## Camada 2: impressiona (não é opcional; julgada no PNG, ao lado de uma referência da categoria)
9. **Uma ideia** que se diz numa frase, vinda do produto, visível sem rolar (tirando o logo, ainda é só deste produto).
10. Composição de uma olhada: um foco; o mais importante no alto e no início; primeiro quadro ocupado (no 1440 × 900,
    nenhuma faixa vazia acima de ~25% da altura sem motivo declarado).
11. Tipografia com intenção: um degrau de exibição (≥ 2,5× o corpo) no título ou no número principal, escala curta,
    números tabulares, nada pula no hover.
12. Cor com papel: um acento; neutros escolhidos pela cena; escuro desenhado em camadas, não invertido; sem a cor
    padrão do sistema "porque sim".
13. Material e profundidade com função: 3 a 4 camadas legíveis; vidro só onde algo flutua, fiel ao Liquid Glass
    (`apple/materiais.md` §receita) e com prova de que há conteúdo passando por trás.
14. Movimento com propósito: um movimento dominante; o **momento-pico** do produto (concluir, enviar, comprar) desenhado
    em ≤ 250 ms com mola curta; entrada uma vez só; nada bloqueia o clique.
15. Acabamento: ícones do mesmo traço, seleção e foco desenhados, dado de exemplo plausível e coerente, nada encostado.
16. Final memorável: o último passo do fluxo é o mais cuidado (confirmação discreta, desfazer).

## A junção (o gosto do usuário, sem virar "sopa")
O padrão é a **combinação numa peça só**: cara de Apple (tipo do sistema com escala de exibição, espaço, acabamento ao
pixel) + Liquid Glass fiel + 3D + revelação ao rolar + a ideia. Regras:
- **Um efeito dominante**; os outros apoiam e falam a mesma língua: **uma curva** (a mesma mola), **um material**, **uma
  luz** (a mesma direção no aro do vidro, no brilho e na inclinação 3D) e **uma paleta**.
- **Teste de junção:** para cada elemento (vidro, 3D, revelação, tipografia, cor, efeito), escreva em 1 linha como ele
  serve à ideia. Tire-o mentalmente: se a ideia não perde nada, **ele sai**. Elemento sem linha = sopa.
- **Site e landing:** 3D e revelação ao rolar entram **por padrão** como camada de impacto: sem sequestrar a rolagem,
  texto visível sem JS e no fim do movimento, ≤ 1 efeito dominante, desempenho medido (INP, CLS, quadros perdidos).
- **App:** 3D e revelação só onde explicam o movimento (de onde veio o detalhe, o que acabou de chegar à lista); nada em
  navegação frequente.
- **Documento:** sem movimento; a camada 2 é ideia, tipografia, composição e acabamento.

## Autocrítica (escrita no relatório, antes de entregar)
Para cada PNG: os 16 itens com sim/não; a frase "o que um usuário exigente notaria nos primeiros 5 s"; com vidro, "parece
Apple ou parece tentativa?" (teste em `apple/materiais.md`); o teste de junção; uma referência da categoria nomeada e o
que ela ainda faz melhor (estudada, nunca imitada: sem copiar composição, layout nem a ordem dos blocos). Camada 1 com "não" = não entrega. Camada 2 com 2 ou mais "não" = novo passe (até 3). O que
continuar abaixo vai em "ainda não está no nível", sem esconder.

## O revisor
Roda a régua **antes** de ler a autocrítica do autor (independência). Camada 1 falhou = VERMELHO. Camada 2 numa entrega
prometida como premium: 2 ou mais itens = VERMELHO; 1 item = AMARELO com o número do item e a correção. Elemento que não
passa no teste de junção = AMARELO "tirar". Abre os PNGs e uma ampliação 2× do vidro.

## Armadilhas (da pesquisa)
Somar efeitos no lugar de uma ideia; sequestrar a rolagem; texto importante dentro de efeito; efeito sobre produto que
falha; "tudo igual" (gradiente roxo→azul, 3 cartões iguais, Inter sem intenção); vidro que derruba contraste; "fosco
branco com borda cinza" vendido como Liquid Glass; checar o atributo (`hidden`) em vez do que aparece na tela.
