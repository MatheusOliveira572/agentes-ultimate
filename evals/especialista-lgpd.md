# Evals · especialista-lgpd

### Caso 1 · Consentimento como base para dados de empregados
- Tipo: regressão
- Pedido: "Vamos pedir aos empregados que assinem um consentimento para usarmos os dados deles na folha."
- Deve: explicar que, sem possibilidade real de recusa, não há consentimento livre; indicar a base do art. 7 adequada
  (obrigação legal, execução de contrato) com inciso, link e data.
- Não deve: recomendar o consentimento como base padrão.
- Origem: Erro conhecido "usar consentimento como base padrão".

### Caso 2 · Prazo do incidente contado do fim da investigação
- Tipo: regressão
- Pedido: "Descobrimos ontem que uma planilha com CPF e dados bancários de clientes foi enviada a um e-mail externo.
  Vamos investigar por duas semanas e depois avisamos a ANPD."
- Deve: contar 3 dias úteis desde que se soube (data calculada), propor comunicação preliminar e complemento em até 20
  dias úteis, listar os 7 itens do aviso ao titular, citar a Resolução CD/ANPD 15/2024 e pedir validação do encarregado.
- Não deve: aceitar esperar o fim da investigação.
- Origem: Erro conhecido sobre o prazo do incidente.

### Caso 3 · Precisa de RIPD?
- Tipo: capacidade
- Pedido: "Vamos usar reconhecimento facial na catraca da sede. Precisa de relatório de impacto?"
- Deve: aplicar o teste da ANPD (critério geral + específico: dado sensível biométrico, tecnologia nova), concluir "sim"
  com o motivo, base do art. 11, e roteiro do RIPD com o conteúdo do art. 38.
- Não deve: decidir sem o teste escrito nem usar base do art. 7 para dado sensível.
- Origem: Referência ANPD RIPD.

### Caso 4 · Prazo de guarda e exclusão
- Tipo: capacidade
- Pedido: "Por quanto tempo guardamos os currículos de quem não foi contratado, e como apagamos?"
- Deve: finalidade e base legal com inciso; prazo de guarda definido com o motivo; quem apaga e como, incluindo cópias de
  segurança e o tempo real até a exclusão completa.
- Não deve: responder "guardar indefinidamente para vagas futuras" sem base nem prazo.
- Origem: Referência Google (retenção por categoria e exclusão com cópias) e Apple (minimização).

### Caso 5 · Segredo no código
- Tipo: gatilho negativo
- Pedido: "Confira se há senha ou chave de API exposta neste repositório antes de publicar."
- Deve: devolver ao `auditor-seguranca`.
- Não deve: fazer a auditoria técnica do repositório.
- Origem: Fora do escopo.

### Caso 6 · Aviso copiado e "li e aceito"
- Tipo: regressão
- Pedido: "Peguei o modelo de política de privacidade de outro site e pus uma caixa 'li e aceito a política' no cadastro. Está ok para lançar?"
- Deve: comparar o aviso linha a linha com os dados, os terceiros e o tráfego reais e apontar o que não bate; explicar que política se dá ciência e que "li e aceito" não é consentimento (genérico é nulo, art. 8º, §4º, marcado [conferir] até conferir no texto oficial); pedir versão e data do aviso; separar o consentimento de marketing, se houver.
- Não deve: aprovar o modelo copiado nem tratar a caixa como base legal de todos os tratamentos.
- Origem: checklists do autor do plugin (itens 01 e 03).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
