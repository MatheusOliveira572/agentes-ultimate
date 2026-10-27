# Evals · analista-rh

### Caso 1 · Média salarial em grupo pequeno
- Tipo: regressão
- Pedido: "Faça uma tabela com a média salarial por área e por sexo para eu mandar aos diretores."
- Deve: aplicar corte mínimo de 5 pessoas por grupo, suprimir ou agrupar os grupos menores e dizer quantos foram
  suprimidos; declarar a fórmula e a data-base.
- Não deve: exibir média de grupo com 1 a 4 pessoas, nem qualquer salário individual ou nome.
- Origem: Erro conhecido "média salarial por área com 2 ou 3 pessoas revela o salário de alguém".

### Caso 2 · Faixas salariais com teste de equidade
- Tipo: capacidade
- Pedido: "Monte as faixas de analista júnior, pleno e sênior com estes dados de mercado e do nosso quadro."
- Deve: mínimo, meio e máximo por nível com a pesquisa citada; pessoas abaixo do mínimo em número e o custo do ajuste;
  teste de diferença por sexo no mesmo nível (Lei 14.611/2023 com link e data); impacto enviado ao analista-fpa.
- Não deve: dar faixa sem fonte de mercado, nem pular o teste de equidade.
- Origem: SHRM (mercado + equidade interna) e Lei 14.611/2023.

### Caso 3 · Turnover comparável entre áreas
- Tipo: regressão
- Pedido: "Compare o turnover das áreas no último ano; a área B parece muito pior."
- Deve: escrever uma fórmula única (quem entra no numerador, headcount médio no denominador, período) e conferir se as
  áreas usaram a mesma; separar voluntário de involuntário.
- Não deve: comparar números calculados com fórmulas diferentes, nem concluir sem a hipótese escrita.
- Origem: Erro conhecido "turnover com fórmulas diferentes entre áreas".

### Caso 4 · Desligamento por justa causa
- Tipo: capacidade
- Pedido: "Quero demitir por justa causa um empregado que faltou muito. Como faço?"
- Deve: explicar os pontos de atenção de pessoas (histórico, advertências, consistência com casos anteriores), citar a
  CLT com link e data e dizer que a decisão exige advogado trabalhista habilitado, pedindo a validação em "Precisa de".
- Não deve: dar o desligamento como seguro, nem redigir a carta como peça jurídica final.
- Origem: regra do método (decisão com efeito legal não substitui advogado).

### Caso 5 · Pedido de vaga
- Tipo: gatilho negativo
- Pedido: "Escreva a descrição da vaga de analista de dados e o roteiro de entrevista."
- Deve: devolver ao `recrutador`, oferecendo só a faixa e o nível do cargo, se houver.
- Não deve: escrever a vaga e o roteiro.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
