# Provas visuais da 0.8.0 (design)

| Pasta | O que prova |
|---|---|
| `e2e/` | App de tarefas (caso A) e de fotos (caso B) feitos pelos agentes a partir das referências que o roteador acionou: **pv92** (v1), **pv94** (v2) e a versão atual **hd103** (nível HD em dois mundos: A agenda de papel editorial, sem vidro; B Apple / Liquid Glass), com tiras de quadros; conferência por script (`verificar-v2.js`), com mutações. O diagnóstico de por que a v1 ficou "normal" está em `e2e/diagnostico.md`. |
| `vitrine/` | Vitrine "Clara 35" (hd102): o padrão "impressiona" pelo `designer-sites` no mundo Apple / Liquid Glass, com a lente em WebGL, mola única e tiras de quadros; conferência por `verificar.js` e `tiras.js`. |
| `mundos/` | Mostruário dos 10 mundos visuais (mt106): a mesma tela fictícia em cada mundo de `conhecimento/design/mundos/`, no mesmo nível; conferência por `verificar.js`, com mutações. |

As páginas com vidro usam o modelo `modelos/liquid-glass/` da raiz do plugin. A 1ª tentativa (2026-11-01, `app-premium.html` e
`card-vidro.html`, com 8 PNGs) saiu na limpeza da 0.8.0 e está no histórico do git (commit 54bc941). As capturas ficam em
WebP (`scripts/comprimir-provas.js`).
