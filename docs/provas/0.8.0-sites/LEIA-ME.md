# Prova do lote sites-premium (0.8.0): dados fictícios

Pedido: "crie um site premium para um app de finanças". Feito à mão pelo engenheiro seguindo `agents/designer-sites.md`,
**não** por uma execução do agente. Produto, valores e nomes são fictícios.

| Arquivo | O que é |
|---|---|
| `site-preamar.html` | a página, sem dependência externa |
| `bancada-efeitos.html` | um palco por efeito, código próprio; A4 (brilho) e D5 (texto preenchido) estão ali para serem medidos, não como recomendação |
| `provar.js` | `node provar.js site`, `efeitos` e `quadro`; um Edge sem interface por etapa, fechado ao fim dela |
| `resultado.json` | tudo o que foi medido |
| `png/` | site em 2 temas (1440 e 390 px); claro em 320 px (o `provar.js` também grava 768, 905 e 1920 px; essas 3 saíram na limpeza da 0.8.0); movimento reduzido; transparência reduzida; sem JS; folha da bancada |

**A ideia própria:** o mês desenhado como uma tábua de marés, com a maré baixa como o dia mais apertado. Daí saem a curva da
dobra, o calendário, a objeção ("e quando a tábua erra?"), o preço como mais uma linha da tábua, a régua nas perguntas e o
fim da página na preamar, com o rodapé embaixo d'água. Ficaram de fora, de propósito: logos, depoimentos e números de prova, porque
não existe prova real de um produto fictício.

**Movimento:** 1 dominante (a linha que se desenha), 1 cena em ciclo com pausa, e o vidro como superfície. O resto é resposta a clique.

## O que não saiu limpo ou não foi medido
- O botão da cena aparece como "Retomar" nos PNGs: a prova para a cena no início, para a foto não pegar o texto na troca.
- Larguras checadas: 320, 390, 768, 905, 960, 1024, 1100, 1440 e 1920 px. Teclado real (Tab e Shift+Tab) em 2 temas e 2 larguras; 3 cenas da simulação; ponto da maré baixa na curva.
- Custo de pintura e de compositor não está medido com confiança: o controle de desfoque sobe numa rodada e não em outra. Sem aparelho real.
- Fontes de sistema do Windows (Sitka, Segoe UI): em outro sistema, a página cai nas reservas.
- Na 1ª rodada, as checagens passaram com um rótulo sobre outro texto: só apareceu abrindo o PNG. Virou a checagem de texto sobreposto, com mutante.

As capturas ficam em WebP (o plugin é baixado inteiro por quem instala). Os verificadores gravam PNG; antes do commit, rode
`node scripts/comprimir-provas.js <pasta png>` (Edge ou Chrome sem interface; converte e apaga o PNG).
