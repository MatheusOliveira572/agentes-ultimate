# Prova visual · painel "Agentes agora" (0.7.0, depois das correções da revisão)

Feita em 2026-10-28: Edge sem interface (`--headless=new`), dirigido pelo protocolo de depuração (`Page.navigate`,
`Page.captureScreenshot`). Projeto de demonstração com 4 agentes simulados, servidor do mapa com a pasta do usuário
trocada (não toca a real). Resultado: 0 erro de JavaScript na página; Edge e servidor fechados no fim.

| Arquivo | O que mostra |
|---|---|
| `painel-1-trabalhando.png` | 4 agentes: revisor 67% e dev-powerbi 63% (progresso informado, barra cheia), designer-paineis "~21% (estimado)" (barra tracejada), analista-fpa "sem notícia" (cinza, "nenhuma etapa informada"); anel de progresso nos marcadores |
| `painel-2-revisor-terminou.png` | o revisor termina: aviso "revisor terminou · 41 min" no topo, linha no "Ao vivo", card "pronto · terminou às 22h27 · 41 min" |
| `painel-3-escuro.png` | o mesmo no tema escuro |
| `painel-4-detalhe.png` | o painel em 2x, recortado pela caixa real (todos os cards), claro |
| `painel-5-detalhe-escuro.png` | idem, escuro (o leve retângulo atrás do card do revisor é da captura em 2x logo depois da troca de escala e tema; não aparece na foto inteira `painel-3-escuro.png`) |

Conferido em cada imagem: nada sobreposto (aviso, "Ao vivo", painel, marcadores e contador da sessão em lugares
separados), textos inteiros e legíveis, claro e escuro.
