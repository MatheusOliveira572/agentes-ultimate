# Prova do lote sites-premium (0.8.0): dados fictícios

Pedido: "crie um site premium para um app de finanças". Feito à mão pelo engenheiro seguindo `agents/designer-sites.md`,
**não** por uma execução do agente. Produto, valores e nomes são fictícios.

| Arquivo | O que é |
|---|---|
| `site-preamar.html` | a página, sem dependência externa |
| `bancada-efeitos.html` | um palco por efeito, código próprio; A4 (brilho) e D5 (texto preenchido) estão ali para serem medidos, não como recomendação |
| `provar.js` | `node provar.js site`, `efeitos` e `quadro`; um Edge sem interface por etapa, fechado ao fim dela |
| `resultado.json` | tudo o que foi medido |
| `png/` | site em 2 temas e 2 larguras; movimento reduzido; transparência reduzida; sem JS; folha da bancada |

**A ideia própria:** o mês desenhado como uma tábua de marés, com a maré baixa como o dia mais apertado. Daí saem a curva da
dobra, o calendário, o texto e a fonte de almanaque. Ficaram de fora, de propósito: logos, depoimentos e números de prova, porque
não existe prova real de um produto fictício.

**Movimento:** 1 dominante (a linha que se desenha), 1 cena em ciclo com pausa, e o vidro como superfície. O resto é resposta a clique.
