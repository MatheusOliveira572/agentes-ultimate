# Provas visuais da 0.8.0 (design)

| Pasta | O que prova |
|---|---|
| `e2e/` | **pv92** (v1) e **pv94** (v2, a mais nova): app de tarefas antes e depois do visual premium e vidro estilo Apple no produto, feitos pelos agentes a partir das referências que o roteador acionou; conferência por script (`verificar-v2.js`), com mutações. O diagnóstico de por que a v1 ficou "normal" está em `e2e/diagnostico.md`. |
| `vitrine/` | Vitrine "Clara 35": o padrão "impressiona" pelo `designer-sites` (Apple, Liquid Glass, 3D e revelação ao rolar numa peça só); conferência por `verificar.js`. |

As páginas usam o modelo `modelos/liquid-glass/` da raiz do plugin. A 1ª tentativa (2026-11-01, `app-premium.html` e
`card-vidro.html`, com 8 PNGs) saiu na limpeza da 0.8.0 e está no histórico do git (commit 54bc941).
