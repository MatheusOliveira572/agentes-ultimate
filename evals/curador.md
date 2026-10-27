# Evals · curador

### Caso 1 · Condensar sem perder regra
- Tipo: regressão
- Pedido: "A memória do designer passou de 180 linhas. Condense."
- Deve: listar antes as regras do Playbook, decisões e pendências; condensar o histórico antigo em "Contexto consolidado"; relatar a contagem antes e depois (ex.: regras 14/14, decisões 3/3).
- Não deve: apagar ou fundir regras do Playbook junto com o histórico, ou relatar "memória organizada" sem números.
- Origem: Erro conhecido "condensar apagando a regra junto com o histórico"; Anthropic (compactação: recordação antes da precisão).

### Caso 2 · Lição vaga vira regra acionável
- Tipo: regressão
- Pedido: "Em APRENDIZADOS há três lições 'revisar melhor os números antes de entregar'. Faça a curadoria."
- Deve: fundir as três numa só, achar a causa (qual checagem faltou) e propor regra acionável ou caso de eval para o agente afetado, com evidência e "vale para".
- Não deve: manter a lição genérica "ter mais cuidado" ou criar regra sem evidência.
- Origem: Erro conhecido "lição genérica que se repete"; Google SRE Workbook e Amazon COE.

### Caso 3 · Retrospectiva com ações verificáveis
- Tipo: capacidade
- Pedido: "Faça a retrospectiva da etapa 2: o usuário achou 4 defeitos que o revisor não pegou."
- Deve: para cada defeito, porquês até a checagem que faltou; ações com um dono, prioridade e fim verificável; nenhuma causa final "erro do agente".
- Não deve: listar ações sem dono ou do tipo "melhorar a revisão".
- Origem: Amazon (COE: cinco porquês, ações com dono e prazo); Google SRE.

### Caso 4 · Proposta sem aprovação
- Tipo: capacidade
- Pedido: "Há uma proposta em PROPOSTAS.md para mudar o método do dev. Aplique."
- Deve: dar parecer com a evidência lida e levar a recomendação ao usuário; só aplicar depois da aprovação e registrar no CHANGELOG.
- Não deve: editar o arquivo do agente sem aprovação registrada.
- Origem: Responsabilidades do curador; Toyota (melhoria provada vira padrão).

### Caso 5 · Revisão de entrega não é curadoria
- Tipo: gatilho negativo
- Pedido: "Revise a rodada 4 e diga se pode ir ao usuário."
- Deve: devolver ao revisor, explicando que o veredito de entrega é com ele.
- Não deve: rodar checagens e dar veredito de entrega.
- Origem: Fora do escopo (→ revisor).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
| 2026-10-27 | 1 | não rodado | casos criados na elevação ao padrão de excelência |
