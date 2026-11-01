<!-- Adaptado de addyosmani/agent-skills/references/performance-checklist.md e skills/performance-optimization/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=desempenho-web; palavras=core web vitals, lcp, inp, cls, lighthouse, pagina lenta, site lento, carregamento lento, tamanho do bundle, imagens pesadas, fontes da pagina; agentes=engenheiro-software, testador-qa -->
<!-- teste-ref: sim=o site está lento para carregar, melhore o LCP e o CLS da página inicial | o lighthouse acusa bundle grande e imagens pesadas; nao=faça a análise de crédito do fornecedor -->
# Desempenho no navegador (Core Web Vitals)

Método geral (medir, gargalo, manter ou voltar, registrar tentativas): `desempenho.md`. Aqui, as metas e as causas comuns.

## Metas (bom / precisa melhorar / ruim)
| Métrica | Bom | Melhorar | Ruim |
|---|---|---|---|
| LCP (maior elemento pintado) | ≤ 2,5 s | ≤ 4,0 s | > 4,0 s |
| INP (resposta à interação) | ≤ 200 ms | ≤ 500 ms | > 500 ms |
| CLS (deslocamento de layout) | ≤ 0,1 | ≤ 0,25 | > 0,25 |
TTFB > 800 ms: veja no gráfico de rede se é DNS (pré-conexão), aperto de mão TCP/TLS (HTTP/2, borda, keep-alive) ou
o servidor (perfil, consultas, cache).

## Causa provável por sintoma
| Sintoma | Causa | Onde olhar |
|---|---|---|
| LCP lento | imagem grande, recurso que bloqueia a renderização, servidor lento | cascata de rede, tamanho das imagens |
| CLS alto | imagem sem dimensões, conteúdo que chega tarde, troca de fonte | atribuição do deslocamento |
| INP ruim | JavaScript pesado na thread principal, atualização grande do DOM | tarefas longas no trace |
| carga inicial lenta | pacote grande, muitas requisições | tamanho do pacote, divisão de código |

## Lista
- **Imagens:** AVIF/WebP; `srcset` e `sizes`; `width` e `height` sempre (CLS); abaixo da dobra `loading="lazy"` e
  `decoding="async"`; a imagem do LCP com `fetchpriority="high"` e sem lazy.
- **JavaScript:** pacote inicial < 200 KB comprimido (meta comum); divisão por rota com `import()`; nada bloqueando no
  `<head>` (`defer`/`async`); tarefas > 50 ms quebradas (ceder a vez à thread principal, `scheduler.yield()` onde houver);
  trabalho não urgente fora do tratador do evento (`requestIdleCallback`); script de terceiro com `async`, medido, e com
  fachada quando pesado (chat, vídeo embutido). `memo`/`useMemo` só onde o perfil mostrar ganho.
- **CSS:** o crítico embutido ou pré-carregado; o resto sem bloquear; sem custo de CSS-em-JS em produção.
- **Fontes:** 2–3 famílias com 2–3 pesos; só WOFF2; servidas pelo próprio site quando der; a do LCP pré-carregada;
  `font-display: swap` (ou `optional`); subconjunto por `unicode-range`; fonte variável se precisar de vários pesos;
  métricas da fonte reserva ajustadas (`size-adjust`) contra o CLS; considere a fonte do sistema antes de qualquer outra.
- **Rede:** estáticos com cache longo + nome com hash; HTTP/2 ou 3; pré-conexão às origens conhecidas; sem redirecionamento
  à toa.
- **Renderização:** sem leitura e escrita de layout alternadas (layout forçado); animação só de `transform` e `opacity`;
  lista longa virtualizada; `content-visibility: auto` com `contain-intrinsic-size` fora da tela; sem `unload` e sem
  `Cache-Control: no-store` no HTML (mantém o cache de voltar/avançar).

## Prova
Números antes e depois (mesmo aparelho simulado, mesma rede), medida repetida acima do ruído, e os três Core Web Vitals no
"bom". Orçamento de desempenho no CI quando a página é do usuário final.
