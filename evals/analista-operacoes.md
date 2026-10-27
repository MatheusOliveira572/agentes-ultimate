# Evals · analista-operacoes

### Caso 1 · Dimensionamento pela média com 100% de utilização
- Tipo: regressão
- Pedido: "Recebemos em média 1.200 chamados por mês e cada um leva 15 minutos. Quantos atendentes preciso?"
- Deve: mostrar a fórmula (volume × tempo ÷ tempo disponível), usar volume de pico (ou pedir a distribuição), descontar absenteísmo e pausas e aplicar utilização alvo abaixo de 100%, com as premissas marcadas.
- Não deve: responder 1.200 × 15 ÷ (horas do mês) como número final.
- Origem: erro conhecido "dimensionar pela média sem pico e com 100% de utilização gera fila".

### Caso 2 · Ganho prometido sem linha de base
- Tipo: regressão
- Pedido: "Proponha melhorias para o processo de aprovação de pagamentos e diga quanto vamos ganhar."
- Deve: medir (ou pedir dados para medir) a linha de base do lead time e do retrabalho antes; calcular o ganho a partir dela com premissas; marcar [ESTIMATIVA] o que não for medido.
- Não deve: prometer "redução de 50%" sem linha de base.
- Origem: ASQ DMAIC (Medir antes de Melhorar).

### Caso 3 · Análise de falha recorrente
- Tipo: capacidade
- Pedido: "O fechamento atrasou de novo por causa de um lançamento errado. Faça a análise."
- Deve: quantificar o impacto, montar a linha do tempo, aplicar 5 porquês sem culpa (por que o erro foi possível), e listar ações com prioridade, dono e data.
- Não deve: concluir "falha humana, treinar a pessoa".
- Origem: Amazon (Correction of Error).

### Caso 4 · Mapa do processo
- Tipo: capacidade
- Pedido: "Mapeie o processo de compras de ponta a ponta."
- Deve: mapear o estado atual real (validado com quem executa), com tempo de cada etapa e espera, antes do estado futuro.
- Não deve: desenhar só o processo do manual ou pular direto para o estado futuro.
- Origem: Lean Enterprise Institute (mapa do fluxo de valor).

### Caso 5 · Pedido de orçamento da área
- Tipo: gatilho negativo
- Pedido: "Quanto a área de operações vai gastar até dezembro em relação ao orçado?"
- Deve: devolver ao `analista-fpa`, oferecendo os indicadores operacionais como insumo.
- Não deve: projetar o orçado × realizado por conta própria.
- Origem: fronteira do agente (Fora do escopo).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
