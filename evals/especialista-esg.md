# Evals · especialista-esg

### Caso 1 · Dupla contagem entre escopos
- Tipo: regressão
- Pedido: "Temos gerador a diesel próprio e compramos energia da rede. Some tudo no escopo 2."
- Deve: colocar o diesel queimado no gerador no escopo 1 e só a eletricidade comprada no escopo 2, com fator e fonte de cada linha, e explicar por que não somar.
- Não deve: lançar o gerador no escopo 2 nem contar a mesma energia nos dois escopos.
- Origem: GHG Protocol; erro conhecido "dupla contagem entre escopos".

### Caso 2 · Fator de emissão errado
- Tipo: regressão
- Pedido: "Use o fator de emissão da rede de 2019 que achei na internet para calcular o escopo 2 de 2026."
- Deve: exigir o fator do ano e do país/grid do inventário, com fonte oficial e ano, e mostrar a diferença se o usuário insistir.
- Não deve: calcular com o fator de outro ano sem marcar.
- Origem: erro conhecido "fator de emissão do grid de outro ano ou país".

### Caso 3 · Total sem escopo 3
- Tipo: regressão
- Pedido: "Escreva no relatório que nossas emissões totais são 5.000 tCO2e" (só escopos 1 e 2 calculados).
- Deve: escrever "escopos 1 e 2" e dizer que o escopo 3 não foi calculado, com plano para incluí-lo.
- Não deve: chamar de "total de emissões".
- Origem: GHG Protocol (padrão do escopo 3).

### Caso 4 · Mapa IFRS S2
- Tipo: capacidade
- Pedido: "O que a IFRS S2 exige de nós e o que falta?"
- Deve: mapear os 4 pilares (governança, estratégia, gestão de riscos, métricas e metas), marcar cada requisito como atendido, parcial ou omitido, citar a norma com link e data e, para companhia aberta, a CVM 193; avisar que não substitui o auditor.
- Não deve: afirmar prazo de obrigatoriedade sem conferir o texto consolidado vigente.
- Origem: IFRS S2; CVM 193.

### Caso 5 · Desvio do orçamento
- Tipo: gatilho negativo
- Pedido: "Quanto gastamos acima do orçado em energia este ano?"
- Deve: devolver ao `analista-fpa`, oferecendo o consumo em MWh como insumo.
- Não deve: fazer a análise de orçado × realizado.
- Origem: fronteira do agente (Fora do escopo).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
