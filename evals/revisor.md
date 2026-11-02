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
- Deve: terminar o relatório com `Placar: autor=dev-powerbi cod=r3a1 veredito=não B=0 A=1 M=0 b=2 ids=A-1,b-1,b-2`, numa linha só, com as contagens e os ids iguais aos da lista de achados; na revisão seguinte do mesmo trabalho, o achado ainda aberto mantém o id.
- Não deve: omitir a linha, trocar o formato, contar diferente da lista ou renumerar um achado que continua aberto (relatório sem a linha Placar = falha).
- Origem: placar por agente (plano 0.7.0, peça 2): o gancho só conta o que está nessa linha.

### Caso 7 · Teste enfraquecido para passar
- Tipo: regressão
- Pedido: "O dev corrigiu o limite de login e agora a suíte passa. Ele só ajustou o teste de 429 para esperar 200 e marcou 'pagamento: não se aplica'. Pode ir?"
- Deve: comparar o teste com a versão anterior (git diff), apontar o teste enfraquecido como achado Alto e o "não se aplica" sem motivo num item crítico também como Alto; veredito "não" até o teste voltar ao esperado original e passar pela correção do código.
- Não deve: aceitar "a suíte passa" como prova, nem tratar a troca do esperado como detalhe.
- Origem: checklists do autor do plugin (relatório de segurança: "teste apagado ou enfraquecido para passar"; "crítico marcado N/A").

### Caso 8 · Passe de veredito
- Tipo: regressão
- Pedido: "Segunda revisão da entrega: o autor diz que corrigiu A-1 e M-2."
- Deve: abrir `${CLAUDE_PLUGIN_ROOT}/conhecimento/metodo/revisar-mudanca.md` (ou a referência passada pelo orquestrador) e dar resolvido, parcial ou não resolvido para cada id com a prova refeita, até 3 regressões novas, mantendo os ids; citar no relatório a referência lida.
- Não deve: recomeçar a caça do zero nem dar por resolvido sem refazer a prova.
- Origem: B7-9 (referências sob demanda).

### Caso 9 · Revisão pela carga esperada
- Tipo: referência sob demanda
- Pedido: "revise esta mudança no contador de visitas; o site tem muitos acessos ao mesmo tempo."
- Deve: dizer a carga assumida; procurar corrida de ler e depois gravar; cada achado com um caso concreto e nas 4 partes (`conhecimento/engenharia/revisar-pela-carga.md`); atalho marcado com limite é decisão, salvo se a carga já passou.
- Não deve: achado sem caso concreto; "considere" sem correção.
- Origem: lote 13 (ponytail).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
| 2026-10-27 | 1 | não rodado | casos criados na elevação ao padrão de excelência |
| 2026-10-28 | 2 | não rodado | caso 6: linha fixa do placar (0.7.0) |
| 2026-11-01 | 3 | não rodado | caso 7: teste enfraquecido e "não se aplica" sem motivo (0.8.0) |
