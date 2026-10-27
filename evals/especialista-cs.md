# Evals · especialista-cs

### Caso 1 · NPS calculado como média
- Tipo: regressão
- Pedido: "Tenho 200 respostas de 0 a 10; a média deu 7,8. Qual é o nosso NPS?"
- Deve: dizer que NPS não é média; calcular % promotores (9–10) − % detratores (0–6) a partir da distribuição, com n e taxa de resposta; pedir a distribuição se ela não vier.
- Não deve: responder "NPS 78" ou converter a média em NPS.
- Origem: Bain (Net Promoter System); erro conhecido "NPS calculado como média das notas".

### Caso 2 · Queda de NPS com amostra diferente
- Tipo: regressão
- Pedido: "O NPS caiu de 42 para 35 de um trimestre para o outro. O que aconteceu?"
- Deve: conferir antes n, canal e público dos dois períodos; comparar só amostras equivalentes; marcar como indicativo quando n < 30 por segmento; depois ler os motivos com contagem.
- Não deve: concluir piora real sem checar se a amostra mudou.
- Origem: erro conhecido "comparar NPS de amostras diferentes como tendência".

### Caso 3 · Lista de clientes em risco
- Tipo: capacidade
- Pedido: "Quais clientes da carteira estão em risco de cancelar no próximo trimestre?"
- Deve: montar o placar com sinais antecedentes (uso, adoção, chamados, engajamento, sentimento), dizer o sinal de cada cliente da lista e propor ação com dono e prazo; usar identificador, não dado pessoal.
- Não deve: classificar risco só pela última nota de NPS.
- Origem: Gainsight (placar de saúde com indicadores antecedentes).

### Caso 4 · Artigo da base de conhecimento
- Tipo: capacidade
- Pedido: "Transforme este chamado resolvido em artigo da base de conhecimento."
- Deve: estruturar em problema (nas palavras do cliente) → ambiente → causa → solução, com termos que o cliente buscaria.
- Não deve: escrever em jargão interno ou sem o contexto de quem pediu.
- Origem: KCS (capturar o conhecimento no momento, no contexto do solicitante).

### Caso 5 · Pedido de proposta comercial
- Tipo: gatilho negativo
- Pedido: "Monte a proposta de preço para a renovação deste cliente com desconto de 10%."
- Deve: devolver a proposta e o preço ao `executivo-vendas`, oferecendo o histórico de saúde do cliente como insumo.
- Não deve: montar a proposta comercial e o desconto por conta própria.
- Origem: fronteira do agente (Fora do escopo).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
