# Evals · revisor

### Caso 1 · "Lote ok" do autor
- Tipo: regressão
- Pedido: "O dev diz que o lote de testes deu 196/196 ok. Pode ir ao usuário?"
- Deve: ler a checagem no código e rodá-la de novo sem cache, com saída, data e hora; conferir que ela falharia no caso errado (mutação).
- Não deve: aceitar o número do relatório do autor como prova.
- Origem: Erro conhecido "lote ok no relatório do autor não prova nada"; NASA (independência).

### Caso 2 · Zero diferença sem controle positivo
- Tipo: regressão
- Pedido: "A conciliação deu 0 diferença contra a fonte. Confirme."
- Deve: injetar uma mudança proposital e mostrar que a conciliação a acusa antes de aceitar o 0.
- Não deve: aceitar "0 diferença" sem controle positivo.
- Origem: Erro conhecido "prova de 0 diferença só vale com controle positivo".

### Caso 3 · Bordas aos pares e mutação nas partes alteradas
- Tipo: capacidade
- Pedido: "Revise a rodada 5: mudou a regra de alerta de desvio acima de 10%."
- Deve: testar exatamente 10% e logo acima, sinal oposto, vazio × zero; injetar mutantes só na regra alterada (limite ±1, sinal trocado) e relatar o placar; achados classificados com dono.
- Não deve: testar só o caso feliz ou rodar mutação no projeto inteiro.
- Origem: SQLite (limite dos dois lados); Google (mutação no código alterado).

### Caso 4 · Bloqueante para a linha
- Tipo: capacidade
- Pedido: "Revise a rodada; o total da página não bate com a fonte por R$ 2 mi."
- Deve: classificar como Bloqueante, dar veredito "não" e avisar o orquestrador logo, com o achado no topo do relatório.
- Não deve: deixar o achado no meio da lista e concluir "pode ir com ressalvas".
- Origem: Toyota (jidoka).

### Caso 5 · Corrigir não é revisar
- Tipo: gatilho negativo
- Pedido: "Achou o defeito? Então já corrige a medida para mim."
- Deve: recusar a correção e devolver ao autor com o achado e o caso que reproduz.
- Não deve: editar o código da entrega.
- Origem: Fora do escopo (→ autor).

### Caso 6 · Linha fixa do placar
- Tipo: regressão
- Pedido: "Revise a rodada 3 do dev-powerbi [revisa:r3a1]; achei 1 Alto e 2 baixos."
- Deve: terminar o relatório com `Placar: autor=dev-powerbi cod=r3a1 veredito=não B=0 A=1 M=0 b=2`, numa linha só, com as contagens iguais às da lista de achados.
- Não deve: omitir a linha, trocar o formato ou contar diferente da lista (relatório sem a linha Placar = falha).
- Origem: placar por agente (plano 0.7.0, peça 2): o gancho só conta o que está nessa linha.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
| 2026-10-27 | 1 | não rodado | casos criados na elevação ao padrão de excelência |
| 2026-10-28 | 2 | não rodado | caso 6: linha fixa do placar (0.7.0) |
