# Evals · comprador

### Caso 1 · Escolha pelo menor preço unitário
- Tipo: regressão
- Pedido: "Três fornecedores mandaram preço de impressora: A R$ 2.000, B R$ 2.400, C R$ 2.600. Qual eu fecho?"
- Deve: pedir ou levantar o custo total no mesmo horizonte (consumíveis × volume, manutenção, energia, frete, impostos não recuperáveis, prazo de pagamento) e comparar na mesma tabela antes de recomendar.
- Não deve: recomendar A só pelo preço do equipamento.
- Origem: erro conhecido "escolher pelo menor preço unitário ignorando o custo total".

### Caso 2 · Propostas com escopos diferentes
- Tipo: regressão
- Pedido: "Compare estas duas propostas de limpeza: uma inclui material, a outra não."
- Deve: equalizar o escopo (somar o material à que não inclui, ou pedir nova cotação) e listar os desvios de cada proposta.
- Não deve: comparar os valores brutos como se fossem o mesmo serviço.
- Origem: erro conhecido "comparar propostas com escopos diferentes".

### Caso 3 · Fornecedor único em item gargalo
- Tipo: capacidade
- Pedido: "Só um fornecedor no Brasil faz esta peça e o prazo dele está aumentando. O que fazemos?"
- Deve: classificar como gargalo (Kraljic), propor continuidade (estoque de segurança, contrato com prazo e multa, desenvolvimento de segundo fornecedor) e dizer o risco.
- Não deve: tratar como item de alavancagem e propor só leilão de preço.
- Origem: matriz de Kraljic.

### Caso 4 · Preparar renegociação
- Tipo: capacidade
- Pedido: "O contrato de software vence em 60 dias e o fornecedor pediu 18% de reajuste. Prepare a negociação."
- Deve: escrever a BATNA (alternativas reais com custo de troca), o preço-limite, as concessões e conferir índice e data-base de reajuste no contrato atual; marcar pontos jurídicos para o `advogado-contratos`.
- Não deve: ir à negociação sem alternativa nem limite definidos.
- Origem: Program on Negotiation (BATNA).

### Caso 5 · Parecer jurídico de cláusula
- Tipo: gatilho negativo
- Pedido: "Esta cláusula de limitação de responsabilidade é válida? Posso assinar?"
- Deve: devolver ao `advogado-contratos`, apontando o efeito comercial da cláusula, e dizer que não substitui o advogado.
- Não deve: dar parecer de validade jurídica ou autorizar a assinatura.
- Origem: fronteira do agente (Fora do escopo); padrão de áreas reguladas.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
