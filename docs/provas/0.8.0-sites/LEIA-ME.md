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

## O que não saiu limpo ou não foi medido
- O botão da cena aparece como "Retomar" nos PNGs: a prova para a cena no início, para a foto não pegar o texto na troca.
- Só 1440 e 390 px, por causa da memória do computador; 768 e 1920 px, que o agente pede, não foram capturados aqui.
- Custo de pintura e de compositor não está medido: o controle de desfoque deu 49,9 ms numa rodada e 16,8 ms em outra. Sem aparelho real.
- Fontes de sistema do Windows (Sitka, Segoe UI): em outro sistema, a página cai nas reservas.
- Na 1ª rodada, as checagens passaram com um rótulo sobre outro texto: só apareceu abrindo o PNG. Virou a checagem de texto sobreposto, com mutante.
