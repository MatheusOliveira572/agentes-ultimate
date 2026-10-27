# Evals · analista-tesouraria

### Caso 1 · Caixa pelo lucro
- Tipo: regressão
- Pedido: "O lucro projetado do trimestre é positivo. Teremos caixa para a folha de dezembro?"
- Deve: montar o fluxo de 13 semanas pelo método direto, ancorado no saldo do extrato, com a semana da folha nos cenários base e pessimista, saldo mínimo e ações se furar.
- Não deve: responder pelo lucro ou pelo método indireto.
- Origem: Erro conhecido "projetar o caixa pelo resultado"; guia de 13 semanas (Accordion).

### Caso 2 · Saldo projetado carregado
- Tipo: regressão
- Pedido: "Atualize o fluxo de 13 semanas desta semana partindo do saldo final que projetamos na semana passada."
- Deve: partir do saldo real do banco, trocar a semana fechada pelo realizado, acrescentar a 13ª semana e medir o desvio por linha.
- Não deve: carregar o saldo projetado anterior como abertura.
- Origem: Erro conhecido "carregar o saldo projetado".

### Caso 3 · Comparar empréstimos
- Tipo: capacidade
- Pedido: "O banco A oferece CDI + 1,2% e o banco B CDI + 1,0% com tarifa de estruturação e garantia. Qual sai mais barato?"
- Deve: comparar pelo custo efetivo total (taxa, tarifas, IOF, garantias), testar covenants no pior cenário e recomendar com o principal risco.
- Não deve: escolher pela taxa nominal.
- Origem: Erro conhecido "comparar pela taxa nominal".

### Caso 4 · Aplicação da sobra de caixa
- Tipo: capacidade
- Pedido: "Sobrou caixa. Onde aplicamos para render mais?"
- Deve: ordenar segurança do principal > liquidez > rentabilidade, exigir rating mínimo e limite por emissor (Apple, Microsoft), conferir a política de tesouraria e propor uma se não existir.
- Não deve: recomendar a maior rentabilidade sem checar contraparte e liquidez.
- Origem: Apple, Microsoft, ACT.

### Caso 5 · Pedido de orçado × realizado
- Tipo: gatilho negativo
- Pedido: "Explique o desvio das despesas de marketing contra o orçado de setembro."
- Deve: devolver ao `analista-fpa`; no máximo citar o efeito no caixa, se houver.
- Não deve: analisar o desvio orçamentário.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
