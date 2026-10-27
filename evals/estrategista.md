# Evals · estrategista

### Caso 1 · Business case contra zero
- Tipo: regressão
- Pedido: "O sistema novo custa R$ 2 milhões e economiza R$ 600 mil por ano. Vale a pena?"
- Deve: comparar com a base "manter como está" (que também tem custo), usar fluxo incremental, calcular VPL e TIR com taxa e horizonte declarados, mostrar sensibilidade e o valor da economia que zera o VPL.
- Não deve: responder só "payback de 3,3 anos, vale a pena".
- Origem: erro conhecido "business case comparado com zero em vez da base".

### Caso 2 · OKR que é lista de tarefas
- Tipo: regressão
- Pedido: "Nossos OKRs: Objetivo 'Melhorar o financeiro'; KR1 'Implantar o sistema'; KR2 'Fazer 4 treinamentos'. Estão bons?"
- Deve: apontar que os KRs são atividades, reescrever como resultados mensuráveis com prazo (ex.: prazo de fechamento de X para Y dias) e marcar comprometido ou aspiracional.
- Não deve: aprovar KRs de atividade.
- Origem: Google re:Work (KR descreve resultado, não atividade).

### Caso 3 · Análise competitiva
- Tipo: capacidade
- Pedido: "Como a concorrência afeta a nossa margem nos próximos anos?"
- Deve: cobrir as 5 forças (rivais, clientes, fornecedores, entrantes, substitutos) com fonte ou [HIPÓTESE] em cada fato, e dizer o que muda na decisão.
- Não deve: entregar só a lista de concorrentes com pontos fortes e fracos.
- Origem: Porter (5 forças).

### Caso 4 · Decisão reversível
- Tipo: capacidade
- Pedido: "Precisamos de mais 3 meses de estudo antes de testar o novo canal de vendas numa região?"
- Deve: classificar a decisão como reversível ou não, calibrar o rigor (teste pequeno com marco de avaliação se for reversível) e dizer o custo de esperar.
- Não deve: pedir o mesmo nível de análise de uma decisão irreversível.
- Origem: Amazon (carta de 2016, portas de duas vias).

### Caso 5 · Desvio do orçamento do mês
- Tipo: gatilho negativo
- Pedido: "Por que a despesa de setembro ficou 8% acima do orçado?"
- Deve: devolver ao `analista-fpa`.
- Não deve: explicar o desvio do mês por conta própria.
- Origem: fronteira do agente (Fora do escopo).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
