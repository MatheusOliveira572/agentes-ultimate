# Evals · designer-paineis

### Caso 1 · Seleção que muda de item ao reordenar
- Tipo: regressão
- Pedido: "Especifique a lista de gerências clicável: o diretor clica numa linha e o cartão ao lado mostra o detalhe dela. A lista é ordenada pelo desvio."
- Deve: especificar a seleção pela identidade do item (código da gerência), não pela posição; descrever o que acontece quando a ordem muda ou o item some do filtro.
- Não deve: guardar "a 3ª linha" como seleção, ou não dizer nada sobre reordenação.
- Origem: Erro conhecido "seleção guardada pela posição muda de item quando a lista reordena".

### Caso 2 · Painel que abre por cima da página
- Tipo: regressão
- Pedido: "Desenhe um seletor que abre um painel com busca por cima da página de contas."
- Deve: dizer que o painel esconde (ou bloqueia) o que fica embaixo, ter altura fixa que cai num vão da grade e prever o estado vazio da busca.
- Não deve: deixar o painel transparente ao clique ou com altura livre que termina em cima de outra peça.
- Origem: Erros conhecidos "painel por cima precisa esconder o que fica embaixo" e "painel de altura livre".

### Caso 3 · Notação de desvio e acessibilidade
- Tipo: capacidade
- Pedido: "Proponha a tabela de orçado × real × tendência por área para o diretor financeiro, com destaque para quem estourou."
- Deve: uma só unidade declarada no cabeçalho; cenários distinguidos por padrão (real cheio, orçado vazado, tendência hachurada) e não por cor; verde/vermelho só no desvio, sempre com sinal ou seta; tabela de contraste com cada par ≥ 4,5:1 (ou 3:1 em texto grande); desvio em barras divergentes a partir do zero, com o número-herói no topo à esquerda.
- Não deve: usar vermelho como único sinal de estouro, cores diferentes para cada cenário, ou misturar "mil" e "mi" na mesma coluna.
- Origem: Financial Times (desvio = barras divergentes contra a referência), IBCS (cenários e cores) e WCAG 2.2 critérios 1.4.1 e 1.4.3.

### Caso 4 · Pior caso de texto
- Tipo: capacidade
- Pedido: "Faça o gabarito da página de gerências com dados fictícios."
- Deve: pedir ou medir as contagens reais e o nome mais longo, gerar o PNG por script que falha se uma soma não fechar ou um texto não couber, e mostrar que o script falhou com um erro injetado.
- Não deve: entregar um PNG desenhado à mão com números que não somam ou nomes curtos de mentira.
- Origem: Método, passos 1, 3 e 6.

### Caso 5 · Pedido de fórmula
- Tipo: gatilho negativo
- Pedido: "Qual é a fórmula certa da tendência do ano e quando o desvio deve virar alerta?"
- Deve: devolver ao `analista-fpa`, dizendo que regra de cálculo e materialidade não são do designer.
- Não deve: definir a fórmula ou o limite de alerta por conta própria.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
