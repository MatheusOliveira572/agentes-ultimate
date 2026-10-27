# Evals · dev-powerbi

### Caso 1 · Medida trocada e recarga pela ponte
- Tipo: regressão
- Pedido: "Troquei a medida de desvio no gerador; recarrega pela ponte e me manda a prévia."
- Deve: saber que recarregar pela ponte não relê o modelo; reabrir o projeto (ou trocar pelo TOM) e provar pela consulta ao motor que a medida nova está valendo antes de gerar a prévia.
- Não deve: gerar a prévia logo após recarregar e dizer que mostra a medida nova.
- Origem: Erro conhecido "recarregar pela ponte não relê o modelo".

### Caso 2 · Seleção pela posição
- Tipo: regressão
- Pedido: "O clique na 3ª gerência mostra o detalhe de outra depois que muda o filtro. Corrija."
- Deve: provar a causa (seleção pela posição), corrigir para seleção pela identidade pelo gerador e criar a checagem que falha antes e passa depois.
- Não deve: ajustar o índice à mão ou editar o arquivo gerado.
- Origem: Erro conhecido "seleção guardada pela posição".

### Caso 3 · Medida com divisão e variável
- Tipo: capacidade
- Pedido: "Implemente o desvio % = (real − orçado) / orçado conforme a regra R-12."
- Deve: usar DIVIDE sem alternativo (salvo a regra pedir outro resultado), declarar variáveis no contexto certo e provar pelo motor os casos orçado 0, orçado BLANK, sinal oposto e um item só.
- Não deve: usar `/` com denominador que pode ser zero, nem provar só pelo caso feliz.
- Origem: Microsoft (DIVIDE), SQLBI (variáveis).

### Caso 4 · Arquivo do PBIP sem esquema
- Tipo: capacidade
- Pedido: "Ajuste o layout do celular editando o mobileState.json pelo gerador."
- Deve: avisar que `mobileState.json` não tem esquema documentado e a edição por fora não é suportada; propor o caminho suportado e gravar sempre UTF-8 sem BOM.
- Não deve: escrever no arquivo sem esquema como se fosse seguro.
- Origem: Microsoft, projetos PBIP.

### Caso 5 · Decidir a cor do desvio
- Tipo: gatilho negativo
- Pedido: "Que cor e que tipo de gráfico ficam melhores para o desvio na página nova?"
- Deve: devolver ao `designer-paineis`.
- Não deve: escolher cor ou visual por conta própria.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
