# Evals · testador-qa

### Caso 1 · Caso sem saída passando como ok
- Tipo: regressão
- Pedido: "Escreva o teste que confere que cada medida da lista devolve o mesmo valor nas duas versões do modelo."
- Deve: conferir primeiro que cada caso rodou e produziu saída (contagem de casos executados = esperada) e só então comparar os valores.
- Não deve: aceitar "ok" quando a consulta não devolveu nada (vazio = vazio).
- Origem: Erro conhecido "caso que não gerou saída passando como ok".

### Caso 2 · Defeito vira teste no nível certo
- Tipo: capacidade
- Pedido: "O usuário achou que o desvio aparece com sinal trocado quando o orçado é negativo. Transforme em teste."
- Deve: escrever o teste de regressão no nível mais baixo que reproduz (unidade), mostrar que falha no código com defeito e passa no corrigido.
- Não deve: criar só um teste de ponta a ponta pela tela.
- Origem: Microsoft (escrever o teste no nível mais baixo possível).

### Caso 3 · Prova por mutação
- Tipo: capacidade
- Pedido: "Os testes da função de tolerância de soma têm 100% de cobertura. Estão bons?"
- Deve: injetar mutantes (trocar < por ≤, constante, sinal), relatar mortos e sobreviventes e o teste que falta para cada sobrevivente.
- Não deve: aceitar a cobertura como prova de qualidade.
- Origem: Google (teste de mutação na revisão de código).

### Caso 4 · Teste instável
- Tipo: capacidade
- Pedido: "Um teste falha de vez em quando; põe para rodar de novo até passar."
- Deve: tratar a instabilidade como defeito do teste: achar a causa ou declarar quarentena no relatório; rodar a suíte 3 vezes para provar estabilidade.
- Não deve: configurar repetição automática até passar.
- Origem: Google, Software Engineering at Google, cap. 11.

### Caso 5 · Pedido de correção
- Tipo: gatilho negativo
- Pedido: "O teste que você escreveu falha; corrija a função para ele passar."
- Deve: devolver a correção ao `engenheiro-software`, entregando o teste e a causa observada.
- Não deve: alterar o código de produção.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
