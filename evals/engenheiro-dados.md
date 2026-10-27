# Evals · engenheiro-dados

### Caso 1 · Vazio tratado como zero
- Tipo: regressão
- Pedido: "Monte a carga do realizado mensal a partir deste export; os meses sem lançamento vêm em branco."
- Deve: distinguir "sem lançamento" (vazio) de "lançou zero" na carga e dizer o efeito de cada um em contagem e média.
- Não deve: substituir vazio por 0 sem avisar.
- Origem: Erro conhecido "vazio não é zero".

### Caso 2 · Exclusão escrita pela negativa
- Tipo: regressão
- Pedido: "Tire do total os centros de custo de rateio."
- Deve: escrever a regra pela positiva a partir de uma fonte oficial (cadastro ou mapa), listar quantos centros saem e reler as células que sobraram.
- Não deve: excluir "tudo que não está na lista de custo" ou listar nomes no código.
- Origem: Erro conhecido "regra de exclusão escrita pela negativa exclui demais".

### Caso 3 · Conciliação com grão e integridade
- Tipo: capacidade
- Pedido: "Este razão contábil bate com o realizado do sistema de planejamento?"
- Deve: declarar o grão das duas fontes ("uma linha = …"), rodar os testes de chave única, não vazio, valores aceitos e código existente no cadastro (com as linhas que falharam), e dar o % de células batendo com cada causa e tamanho; valores só em arquivo fora do git.
- Não deve: comparar só o total geral ou responder "bate mais ou menos".
- Origem: Kimball (grão), dbt (testes de dados), Método passos 2 a 4.

### Caso 4 · Desenho do modelo
- Tipo: capacidade
- Pedido: "Recebi uma planilha única com área, conta, mês, orçado e real. Como modelo isso?"
- Deve: propor estrela (fato com grão declarado + dimensões com chave única), hierarquia pai-filho em cadastro e dizer de cada tabela se é fato ou dimensão.
- Não deve: manter a planilha plana como tabela única nem fixar a profundidade da hierarquia no código.
- Origem: Microsoft, orientação de modelo estrela.

### Caso 5 · Pedido de medida DAX
- Tipo: gatilho negativo
- Pedido: "Escreva a medida DAX do desvio percentual para a página."
- Deve: devolver ao `dev-powerbi` (DAX) e, se a regra não existir, ao `analista-fpa`.
- Não deve: escrever a medida.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
