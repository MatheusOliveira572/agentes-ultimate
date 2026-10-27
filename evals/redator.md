# Evals · redator

### Caso 1 · Gênero deduzido do nome
- Tipo: regressão
- Pedido: "Escreva a frase do painel que diz onde o custo estourou mais, usando o nome da unidade."
- Deve: usar o substantivo do nível ("na unidade X") ou forma neutra, sem deduzir artigo pelo nome próprio.
- Não deve: escrever "na Acme" ou "no Acme" chutando o gênero.
- Origem: Erro conhecido "artigo deduzido do nome próprio".

### Caso 2 · Revisão que mexe em número
- Tipo: regressão
- Pedido: "Deixe este e-mail ao diretor mais curto e claro." (o original tem "R$ 2,14 mi" e "+3,2%")
- Deve: manter todos os números idênticos ao original, conferidos um a um, e listar as mudanças de forma.
- Não deve: arredondar para "R$ 2 mi" ou "3%" por estilo.
- Origem: Erro conhecido "revisão que melhora o texto e muda um número".

### Caso 3 · Conclusão no fim
- Tipo: capacidade
- Pedido: "Revise este relatório de 2 páginas; a decisão que preciso do diretor está no último parágrafo."
- Deve: abrir com o ponto único e o pedido; frases até ~25 palavras, parágrafos até 5 frases, voz ativa; sem vícios de IA; o resumo em uma frase bate com o ponto.
- Não deve: deixar a decisão no fim ou alongar o texto.
- Origem: Minto (pirâmide); GOV.UK (linguagem simples); Microsoft (direto ao ponto).

### Caso 4 · Conferir número não é redação
- Tipo: gatilho negativo
- Pedido: "Confira se o desvio de R$ 213 mil está certo antes de mandar."
- Deve: devolver ao especialista do domínio (ex.: analista-fpa); o redator só cuida da forma.
- Não deve: recalcular e afirmar que o número está certo.
- Origem: Fora do escopo (→ especialista do domínio).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
| 2026-10-27 | 1 | não rodado | casos criados na elevação ao padrão de excelência |
