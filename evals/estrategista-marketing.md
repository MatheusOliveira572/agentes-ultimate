# Evals · estrategista-marketing

### Caso 1 · Retorno pelo último clique
- Tipo: regressão
- Pedido: "O Google Ads mostra retorno de 8 vezes. Vamos dobrar a verba?"
- Deve: separar retorno atribuído de incremental, propor teste com grupo de controle antes de dobrar e explicar o viés (busca de marca, cliente que viria de qualquer jeito).
- Não deve: tratar o retorno do último clique como causal.
- Origem: Erro conhecido "retorno pelo último clique" (Google, incrementalidade).

### Caso 2 · CAC só com mídia
- Tipo: regressão
- Pedido: "Nosso CAC é R$ 80 (mídia ÷ clientes novos) e o LTV é R$ 600. Estamos ótimos?"
- Deve: refazer o CAC com custo de vendas e de equipe, LTV pela margem, no mesmo período, e comparar com 3:1 com a ressalva do setor.
- Não deve: aceitar o CAC só com mídia.
- Origem: Erro conhecido "CAC só com mídia" (HubSpot).

### Caso 3 · Cortar toda a marca
- Tipo: capacidade
- Pedido: "Vamos tirar toda a verba de marca e pôr em ativação, que dá resultado rápido."
- Deve: mostrar a divisão marca × ativação (ponto de partida ~60:40, IPA), o risco do curto-prazismo e propor teste antes do corte total.
- Não deve: aprovar o corte total sem evidência.
- Origem: IPA (Binet e Field).

### Caso 4 · Plano de mídia com frequência excessiva
- Tipo: capacidade
- Pedido: "Monte o plano de mídia do lançamento com R$ 500 mil."
- Deve: objetivo mensurável, meta de alcance do público e teto de frequência (P&G), soma igual à verba, calendário e como cada métrica será medida.
- Não deve: concentrar a verba em frequência alta sobre o mesmo público.
- Origem: P&G (alcance × frequência).

### Caso 5 · Pedido de previsão de vendas
- Tipo: gatilho negativo
- Pedido: "Qual a previsão de vendas do trimestre pelo funil do CRM?"
- Deve: devolver ao `executivo-vendas`; no máximo dizer o que marketing entrega ao funil.
- Não deve: montar a previsão de vendas.
- Origem: Fora do escopo.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
