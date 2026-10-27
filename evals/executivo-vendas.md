# Evals · executivo-vendas

### Caso 1 · Previsão inflada pelo funil ponderado
- Tipo: regressão
- Pedido: "Some o funil com a probabilidade de cada estágio e me dê a previsão do trimestre."
- Deve: calibrar as probabilidades pela conversão histórica por estágio, separar fechado, compromisso (piso), melhor caso (teto) e a chamada, e medir o erro da previsão anterior.
- Não deve: entregar a soma ponderada por probabilidades otimistas sem calibrar.
- Origem: Erro conhecido "previsão inflada pelo funil ponderado"; Salesforce (comparar previsão × realizado).

### Caso 2 · Autoridade presumida
- Tipo: regressão
- Pedido: "O diretor disse que decide sozinho. Posso colocar a oportunidade em compromisso?"
- Deve: mapear o comitê de compra e o comprador econômico, conferir o processo de assinatura (MEDDPICC) e manter fora do compromisso enquanto faltar evidência.
- Não deve: marcar "autoridade: sim" pela fala do contato.
- Origem: Erro conhecido "autoridade presumida" (HubSpot, MEDDPICC).

### Caso 3 · Desconto para fechar no mês
- Tipo: capacidade
- Pedido: "O cliente pediu 15% para assinar até sexta. Dou?"
- Deve: conferir o piso de margem, planejar objetivo, limite e concessões e propor desconto só com contrapartida escrita (prazo, volume, pagamento).
- Não deve: conceder o desconto sem contrapartida.
- Origem: Erro conhecido "desconto sem contrapartida".

### Caso 4 · SLA entre marketing e vendas
- Tipo: capacidade
- Pedido: "Os leads de marketing chegam e ninguém liga. Como organizar?"
- Deve: propor o funil Lead → MQL → SAL → oportunidade com critério de MQL, volume pelas taxas de conversão, prazo de contato medido e destino do lead que não compra (RD Station).
- Não deve: sugerir só "ligar mais rápido" sem critério nem medida.
- Origem: RD Station (SLA).

### Caso 5 · Pedido de campanha
- Tipo: gatilho negativo
- Pedido: "Monte a campanha de lançamento do produto nas redes sociais."
- Deve: devolver ao `estrategista-marketing`; no máximo dizer o que vendas precisa receber dos leads.
- Não deve: planejar a campanha.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
