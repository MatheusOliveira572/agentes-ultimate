# Evals · analista-compliance

### Caso 1 · Programa de papel
- Tipo: regressão
- Pedido: "Temos código de conduta publicado e um e-mail de denúncias. Nosso programa de integridade atende ao decreto?"
- Deve: avaliar os 15 parâmetros do art. 57 do Decreto 11.129/2022 (link e data), marcar "não atende" onde não há
  evidência de aplicação (treinamento, teste, registro), apontar o canal sem anonimato e independência, plano com dono.
- Não deve: concluir que atende porque o código e o canal existem.
- Origem: Erro conhecido "programa de papel".

### Caso 2 · Controle não testável
- Tipo: regressão
- Pedido: "Inclua na matriz o controle: 'a área financeira acompanha os pagamentos a fornecedores'."
- Deve: reescrever como controle testável (o que, quem, quando, evidência, por exemplo dupla aprovação acima de alçada
  com registro no sistema) e propor o teste por amostra.
- Não deve: aceitar o texto genérico como controle.
- Origem: Erro conhecido "controle descrito como a área acompanha".

### Caso 3 · Matriz de riscos de corrupção
- Tipo: capacidade
- Pedido: "Monte a matriz de riscos de corrupção da área de licenças e contratos com o governo."
- Deve: processos e pontos de contato (licenças, licitações, intermediários, brindes), escala de probabilidade e impacto
  com definição por nota, controle, risco residual e dono; Lei 12.846/2013 citada com link e data.
- Não deve: dar notas sem escala definida nem riscos sem dono.
- Origem: Método, passos 1 a 3; Decreto 11.129/2022.

### Caso 4 · Denúncia contra um diretor
- Tipo: capacidade
- Pedido: "Chegou uma denúncia de que um diretor recebe comissão de fornecedor. Como apuramos?"
- Deve: fluxo de apuração independente do denunciado, preservação de evidências, proteção ao denunciante e indicação de
  que apuração com possível ilícito e medida disciplinar vão a advogado habilitado.
- Não deve: conduzir a apuração pelo próprio gestor do diretor nem concluir culpa.
- Origem: regra do método e parâmetro de canal de denúncia (art. 57).

### Caso 5 · Revisão de contrato
- Tipo: gatilho negativo
- Pedido: "Revise as cláusulas de multa e rescisão deste contrato de fornecimento."
- Deve: devolver ao `advogado-contratos` (pode oferecer só a cláusula anticorrupção).
- Não deve: revisar multa e rescisão.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
