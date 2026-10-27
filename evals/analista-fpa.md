# Evals · analista-fpa

### Caso 1 · Molde com zero
- Tipo: regressão
- Pedido: "Escreva a frase que explica a mudança do desvio da área entre duas revisões."
- Deve: evitar o molde "de A para B" quando A ou B é zero (usar "antes …, ficou …") e testar A=0, B=0, A=B e sinais opostos, com exemplo que fecha.
- Não deve: entregar uma frase só testada no caso comum.
- Origem: Erro conhecido "molde 'de A para B' quebra quando A ou B é zero".

### Caso 2 · Valor no limite do corte
- Tipo: regressão
- Pedido: "O alerta dispara a partir de 5% de estouro. Uma área está com 4,996%. Entra?"
- Deve: decidir pelo valor arredondado na precisão do corte e dizer qual medida exibida é a referência.
- Não deve: decidir pelo valor bruto enquanto a tela mostra 5,0%.
- Origem: Erro conhecido "valor no limite do corte pelo arredondamento".

### Caso 3 · Sentido favorável e cenário
- Tipo: capacidade
- Pedido: "Defina a regra de cor do desvio para a tabela que mistura linhas de custo e de receita."
- Deve: declarar o cenário de comparação e o sentido favorável por tipo de linha (custo abaixo do orçado = favorável; receita acima = favorável), com um exemplo de cada que fecha.
- Não deve: pintar pelo sinal aritmético do desvio.
- Origem: IBCS (verde = bom em relação à meta).

### Caso 4 · Tendência forçada para a meta
- Tipo: capacidade
- Pedido: "A tendência do ano está acima do orçado; dá para projetar o restante pelo orçado para fechar em linha?"
- Deve: recusar misturar meta e previsão; manter a tendência como real + revisão oficial e mostrar a lacuna até a meta; dizer perda e reversibilidade.
- Não deve: usar o orçado como projeção para "fechar" a tendência.
- Origem: Equinor (separar meta, previsão e alocação de recursos).

### Caso 5 · Pedido de visual
- Tipo: gatilho negativo
- Pedido: "Desenhe a página de desvios com o gráfico em cascata."
- Deve: devolver ao `designer-paineis`; no máximo indicar a regra de cálculo que o visual precisa.
- Não deve: especificar grade, cores ou layout.
- Origem: Fora do escopo.

### Caso 6 · Quanto confiar na tendência
- Tipo: capacidade
- Pedido: "O CFO perguntou se pode confiar na tendência do ano. Como respondemos?"
- Deve: medir a acurácia comparando as revisões antigas com o real que fechou depois, com o erro em % por bloco, e escrever a regra de como essa medida é atualizada.
- Não deve: responder "é confiável" sem medir o erro das revisões passadas.
- Origem: Microsoft Finance (back testing e meta de acurácia).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
