# Inventário completo: 10 projetos → conteúdo para os agentes do agentes-ultimate (2026-11-01)

> Só inventário e proposta. Nada do plugin foi alterado. Continua a pesquisa `docs/pesquisas/pesquisa-plugins-2026-11.md`.
> **Desenho do plugin mantido** (mesmos agentes, roteador e protocolo): cada agente nosso passa a **ler sob demanda** o
> conteúdo dos 10 projetos que serve para ele. Agente ou skill novos só quando nenhum agente nosso cobre o item.

**Pergunta:** o que existe em cada projeto (skill, agente, comando, gancho, regra, referência, ferramenta), para qual agente
nosso vai cada item, com que licença e em que ordem construir. **O que mudaria a decisão:** a licença (copiar ou só a ideia),
o peso no contexto e a sobreposição com o que já temos.

## 0. Como foi feito (para refazer)

- **Árvores:** `api.github.com/repos/<dono>/<repo>/git/trees/HEAD?recursive=1` para os 9 repositórios. As árvores do
  context7, strix, 21st e impeccable vieram truncadas. Completei com a leitura paginada (offset) e com
  `/contents/<pasta>` (impeccable `.claude/skills/impeccable/reference`, strix `strix/skills/vulnerabilities`). Tamanhos em
  bytes vêm do campo `size` da API.
- **Licença e origem:** `api.github.com/repos/<dono>/<repo>` (campos `license` e `fork`). Para o everything-claude-code
  também abri `api.github.com/repos/affaan-m/ECC`, `/contents/`, `/contents/agents` e `/commits?path=LICENSE`.
- **Corpo lido** (raw.githubusercontent, cabeçalho e corpo): emil `break-ui`, `prototype`, `pick-ui-library`,
  `emil-design-eng`, `improve-animations`, `review-animations/STANDARDS.md`, `apple-design`, `animation-vocabulary`,
  `remove-animations`, `mobile-native`; jakub `teardown`, `explain-interface`, `build-design`, `interface-review`,
  `better-writing`, `state-machine`, `better-interface`, `variant`, `better-colors`; addy `constraint-driven-development`,
  `source-driven-development`, `context-engineering`, `idea-refine`, `interview-me`, `shipping-and-launch`,
  `code-review-and-quality`, `using-agent-skills`, `references/orchestration-patterns.md`, `references/definition-of-done.md`,
  `hooks/SDD-CACHE.md`, `hooks/SIMPLIFY-IGNORE.md`; ECC `hooks/hooks.json`, `commands/checkpoint.md`, `commands/orchestrate.md`,
  `commands/update-codemaps.md`, `skills/eval-harness`, `skills/verification-loop`, `skills/strategic-compact`,
  `agents/refactor-cleaner.md`, `agents/doc-updater.md`, `rules/performance.md`, `rules/agents.md`, `contexts/research.md`;
  strix `analysis/counterevidence`, `severity_calibration`, `fix_verification`, `source_aware_discovery`,
  `skills/owasp-top-10-testing`, `vulnerabilities/llm_prompt_injection`; context7 `skills/find-docs`,
  `plugins/cursor/.../docs-researcher.md`, `plugins/claude/context7/.mcp.json`; 21st `README.md`, `.cursor/rules/21st.mdc`;
  apple `SKILL.md`, `references/code-audit.md`; impeccable cópia local 4.0.3 (`SKILL.md`, `hooks/hooks.json`, cabeçalho dos
  4 agentes). READMEs de emil, jakub, addy e ECC para os itens restantes.
- **Lido só pelo nome, tamanho ou README** fica marcado **[HIPÓTESE]** na tabela.
- **Ressalva:** as páginas passam por uma ferramenta que resume. Nomes de arquivo e licenças vieram da API (dado bruto);
  resumos de conteúdo podem perder nuance. Nada foi instalado nem executado.

## 1. Licença por repositório (conferida na API em 2026-11-01)

| Projeto | Licença na API | Fork? | Pode copiar? | Pasta de crédito |
|---|---|---|---|---|
| dickwu/apple-design-skill | `null` | não | **Não.** Só a ideia, escrita por nós. As referências são texto da HIG da Apple | — |
| emilkowalski/skills | MIT | não | Sim, adaptado, com aviso | `terceiros/emilkowalski-skills/LICENSE` |
| jakubkrehel/skills | MIT | não | Sim | `terceiros/jakubkrehel-skills/LICENSE` |
| Superfuture (Figma Community) | página deu 403 | — | **Não.** Só a ideia | — |
| addyosmani/agent-skills | MIT | não | Sim | `terceiros/addyosmani-agent-skills/LICENSE` |
| upstash/context7 | MIT (o serviço tem termos próprios) | não | Sim (texto); o serviço só por integração | `terceiros/upstash-context7/LICENSE` |
| serafimcloud/21st | MIT | não | Sim (pouco a copiar) | `terceiros/serafimcloud-21st/LICENSE` |
| usestrix/strix | Apache-2.0 | não | Sim, marcando as alterações em cada arquivo (Apache §4) | `terceiros/usestrix-strix/LICENSE` |
| WorldFlowAI/everything-claude-code | `null` | não (cópia) | **Não desta cópia** | — |
| → original **affaan-m/ECC** (o antigo `affaan-m/everything-claude-code`) | MIT. O `LICENSE` entrou em 2026-01-26 ("docs: add missing MIT LICENSE file") | não | **Sim, copiar do original**, de um commit fixo | `terceiros/affaan-m-ECC/LICENSE` |
| pbakaus/impeccable | Apache-2.0 | não | Sim, marcando as alterações | `terceiros/pbakaus-impeccable/LICENSE` (+ `NOTICE`, se houver: **[HIPÓTESE]**, não conferido) |
| 21st-dev/magic-mcp (citado pelo 21st) | ISC | não | Não vamos copiar. Só integração | — |

**Regra para cada arquivo copiado:** primeira linha
`<!-- Adaptado de <projeto>/<arquivo> @<commit>, © <autor>, <licença>. Alterações: tradução e adaptação ao agentes-ultimate. Licença em terceiros/<projeto>/. -->`.
`CREDITOS.md` ganha uma linha por projeto com o commit usado. Os termos de cópia (aviso no MIT; marcar alteração e manter o
NOTICE no Apache) são o que sei das licenças. **[HIPÓTESE]**: não abri o texto das licenças nesta pesquisa. O `advogado-contratos`
confere no lote 0.

**ECC:** a cópia da WorldFlowAI (último push em 2026-01-23) repete o começo do original (o README dela aponta para
`affaan-m/everything-claude-code`). Os 9 agentes existem no original com o mesmo nome; conferi a lista de `agents/`, que hoje
tem 71 arquivos. Copiamos do original e só os itens desta lista. O conteúdo atual pode ter mudado desde a cópia.
Inventariar o original inteiro fica como pendência.

## 2. Inventário por projeto

Legenda de destino: **FUNDIR** (vira referência sob demanda de um agente ou skill nossos), **VALIDADOR**, **GANCHO**,
**PROTOCOLO**, **INTEGRAÇÃO** (opcional; o usuário liga, nada é instalado sozinho), **JÁ TEMOS**, **NÃO CABE**,
**NOVA-SKILL**, **NOVO-AGENTE**. `K/` = `conhecimento/`.

### 2.1 dickwu/apple-design-skill (sem licença: só ideia, texto nosso)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `SKILL.md` | Revisão contra a HIG: carga fixa + 3–6 arquivos por assunto (teto 8–12), cita `arquivo › título`, o que nenhuma referência cobre vira julgamento, relatório Resumo/Crítico/Melhorias/Acabamento/O que funciona/Plataforma | FUNDIR | Método do `designer-paineis` e do `designer-documentos`: carga por assunto com teto; "o que funciona" obrigatório | só ideia | https://github.com/dickwu/apple-design-skill/blob/main/SKILL.md |
| `references/hig-lookup.md` | Índice assunto → arquivo (30,6 KB) | FUNDIR | Ideia do `K/design/INDICE.md` (tabela "o que está na tela → arquivo") | só ideia | …/references/hig-lookup.md |
| `references/hig/` (124 arquivos, 1.137 KB) | Páginas da HIG rebaixadas | FUNDIR | Escrever com as nossas palavras em `K/design/apple/<tema>.md` os ~25 temas de tela e documento (lista na §3.1), com link da HIG pública. Os outros (~100: jogos, RA, Pencil, widgets, relógio…) entram só quando houver projeto nativo Apple, no `engenheiro-software` | Apple © (HIG) | https://developer.apple.com/design/human-interface-guidelines |
| `references/code-audit.md` | Auditoria de código: Apple Pay, Liquid Glass, iPhone Duo, `caminho:linha`, inferido = não verificado | FUNDIR | `engenheiro-software` → `K/plataformas/apple-auditoria.md` (texto nosso) | só ideia | …/references/code-audit.md |
| `references/cross-platform.md` | Termos da HIG ↔ Flutter, React Native, Tauri, Electron | FUNDIR | `engenheiro-software` → `K/plataformas/multiplataforma.md` | só ideia | …/references/cross-platform.md |
| `scripts/pull-hig.mjs` | Atualizador; rodar 2 vezes deixa o `git status` limpo | VALIDADOR | Testar que `gerar-agentes.js` é idempotente (rodar 2× = nada muda) | só ideia | …/scripts/pull-hig.mjs |
| `AGENTS.md`, `GEMINI.md`, `.cursorrules` | Mesmo conteúdo para outras ferramentas | NÃO CABE | Outras plataformas; repetem o SKILL | — | repo |
| `.github/FUNDING.yml`, `README.md` | Patrocínio, divulgação | NÃO CABE | Sem conteúdo de método (a fonte vai no CREDITOS) | — | repo |

### 2.2 emilkowalski/skills (MIT: copiar adaptado)
| Item | O que faz | Destino | Detalhe (origem → destino) | Licença | Link |
|---|---|---|---|---|---|
| `emil-design-eng` (27 KB) | Filosofia de acabamento: frequência decide animação, ease-out, < 300 ms, botão encolhe ao clicar, popover nasce do gatilho | FUNDIR | → `K/design/movimento/principios.md` (`designer-paineis`, `designer-documentos`) | MIT | https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng |
| `animate` + `RECIPES.md` | Criar animação escolhendo curva, duração, propriedade | FUNDIR | → `K/design/movimento/criar.md` (designer; `engenheiro-software` ao construir) | MIT | …/skills/animate |
| `animate-expo` + `RECIPES.md` (34,7 KB) | Mesmo padrão em React Native/Expo | FUNDIR | → `K/plataformas/react-native-movimento.md` (`engenheiro-software`, só se a pilha for RN) | MIT | …/skills/animate-expo |
| `review-animations` + `STANDARDS.md` | Revisão estrita: 17 regras com valores (curvas, faixas 100–500 ms), tabela Antes/Depois/Por quê, Bloquear/Aprovar | FUNDIR | → `K/design/movimento/revisar.md`; o formato da tabela vai ao `revisor` (lote 9) | MIT | …/skills/review-animations |
| `improve-animations` + `AUDIT.md` + `PLAN-TEMPLATE.md` | Auditoria do projeto todo, só leitura, planos autocontidos com valores exatos | FUNDIR | → `K/design/movimento/auditar.md` + `plano-modelo.md` | MIT | …/skills/improve-animations |
| `find-animation-opportunities` | Onde o movimento ajuda e onde não | FUNDIR | → `K/design/movimento/onde-animar.md` | MIT | …/skills/find-animation-opportunities |
| `remove-animations` | Só subtrai: tecla, alta frequência, decoração; cuidados (estado inicial invisível, espera por evento) | FUNDIR | → `K/design/movimento/remover.md` | MIT | …/skills/remove-animations |
| `animation-performance` | Animação que perde quadros | FUNDIR | → `K/design/movimento/desempenho.md` (designer + `engenheiro-software`) | MIT | …/skills/animation-performance |
| `animation-vocabulary` | Glossário reverso: descrição vaga → termo exato | FUNDIR | → `K/design/movimento/vocabulario.md` (traduzido) | MIT | …/skills/animation-vocabulary |
| `apple-design` (23 KB) | Princípios da Apple para a web (WWDC): resposta no toque, interrupção, molas, materiais | FUNDIR | → `K/design/apple/movimento-fluido.md` (texto do Emil, MIT; cita as WWDC) | MIT | …/skills/apple-design |
| `write-swift` (42,4 KB) | Swift moderno, concorrência, testes | FUNDIR | → `K/plataformas/swift.md`, dividido em 3 (só pilha Swift) | MIT | …/skills/write-swift |
| `pick-ui-library` | Uma biblioteca por tarefa; o que o `package.json` já usa ganha | FUNDIR | → `K/engenharia/bibliotecas-interface.md` (`engenheiro-software`) | MIT | …/skills/pick-ui-library |
| `prototype` + `PICKER.md` | 3–5 versões diferentes atrás de um seletor; não escolhe pelo usuário; apaga o resto depois | FUNDIR | → `K/design/variantes.md` (junto com `variant` e `state-machine` do jakub) | MIT | …/skills/prototype |
| `mobile-native` | Web que parece nativa no celular (hover preso, 100vh, zoom do campo, área segura) | FUNDIR | → `K/plataformas/web-no-celular.md` (`engenheiro-software`, designer) | MIT | …/skills/mobile-native |
| `break-ui` + `CATALOG.md` | Dados de pior caso plausíveis, alternador "dados de demonstração / pior caso", relatório Quebrado/Feio/Frágil | FUNDIR | → `K/design/pior-caso.md` + `pior-caso-catalogo.md` (designer, `testador-qa`) | MIT | …/skills/break-ui |
| `ask-sonner` + `API.md` | Guia da biblioteca Sonner | FUNDIR | → `K/plataformas/react/sonner.md` (só se o projeto usa Sonner) | MIT | …/skills/ask-sonner |
| `performance-cheatsheet.md`, `ui-cheatsheet.md` | Colas curtas | FUNDIR | → topo de `K/design/movimento/INDICE.md` | MIT | repo raiz |
| `disable-model-invocation: true` | Skill que só o usuário chama | VALIDADOR | `validar.js` aceita o campo e cobra nas skills só do usuário (`placar`, `registrar-defeito`, `ver-mapa`) | ideia | …/prototype/SKILL.md |

### 2.3 jakubkrehel/skills (MIT: copiar adaptado)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `better-interface` + `review-format.md` | Revisão geral que roteia para os domínios; teto de 15 achados, sistêmicos juntos, "não revisado" e "não verificado" declarados | FUNDIR | → `K/design/revisao-tela.md` (designer); formato → `revisor` (lote 9) | MIT | https://github.com/jakubkrehel/skills/tree/main/skills/better-interface |
| `better-accessibility` (6 refs, 36 KB) | Foco, teclado, ARIA, formulários, leitor de tela, movimento e zoom (WCAG 2.2) | FUNDIR | → `K/design/acessibilidade/*.md` (designers, `engenheiro-software`, `testador-qa`) | MIT | …/better-accessibility |
| `better-colors` (6 refs, 38,5 KB) | Contraste medido no fundo real, rampas OKLCH, tokens primitivo × semântico | FUNDIR | → `K/design/cor/*.md` | MIT | …/better-colors |
| `better-layout` (2 refs) | Agrupamento, alinhamento, ordem de leitura, espaço para tradução | FUNDIR | → `K/design/layout/*.md` | MIT | …/better-layout |
| `better-typography` (6 refs, 29 KB) | Escala, espaçamento, recursos da fonte, quebra, pontuação | FUNDIR | → `K/design/tipografia/*.md` (sobretudo `designer-documentos`) | MIT | …/better-typography |
| `better-ui` (6 refs, 32 KB) | Raio, alinhamento óptico, sombras, ícones, entrada/saída | FUNDIR | → `K/design/superficies-icones.md` (o movimento se junta ao do Emil) | MIT | …/better-ui |
| `better-writing` + `patterns.md` | Texto de interface: inventário de termos, botão com verbo, erro diz como resolver, confirmação nomeia o objeto | FUNDIR | → `K/escrita/texto-de-interface.md` (`redator`, designers, `especialista-cs`, `comunicador-corporativo`) | MIT | …/better-writing |
| `interface-review` + `scope-resolution.md` + `removed-signals.md` | Revisa só a mudança: `$BASE`, raio de 1–2 saltos (teto 5), Introduzido/Regressão/Pré-existente, linhas apagadas | FUNDIR | → `K/metodo/revisar-mudanca.md` (`revisor`, lote 9) | MIT | …/interface-review |
| `explain-interface` (4 refs, 30,5 KB) | Explica como algo foi feito (URL ou imagem); cada afirmação medida/derivada/inferida | FUNDIR | → `K/design/explicar-referencia.md` (`pesquisador`, designer) | MIT | …/explain-interface |
| `break` + `scenarios.md` | Componente em todos os cenários numa página temporária | FUNDIR | Junta com `break-ui` em `K/design/pior-caso.md` | MIT | …/break |
| `build-design` + `figma.md` | Construir a partir do Figma ou de imagem; tabela elemento × valor do desenho × valor construído | FUNDIR | → `K/design/construir-do-desenho.md` (`dev-powerbi`, `engenheiro-software`; o designer confere) | MIT | …/build-design |
| `state-machine` + `switcher.md` | Cada estado do componente com dados fictícios e seletor | FUNDIR | → `K/design/variantes.md` §estados (designer, `testador-qa`) | MIT | …/state-machine |
| `variant` + `picker.md` | 3 variantes num eixo; mesmo piso de acessibilidade; sem escolher pelo usuário | FUNDIR | → `K/design/variantes.md` | MIT | …/variant |
| `teardown` (8 refs 65,7 KB + `assets/` 112 KB + `scripts/` 63 KB) | Ilustração técnica (vista explodida, corte) em SVG/PNG/PDF, com prova por script | FUNDIR | → `K/documentos/ilustracao-tecnica.md` + `ferramentas/teardown/` (`designer-documentos`) | MIT | …/teardown |
| `*/agents/openai.yaml` (13) | Metadados do Codex | NÃO CABE | Outra plataforma | — | repo |
| `.claude-plugin/`, `AGENTS.md`, `CLAUDE.md`, `opencode.json` | Empacotamento deles | NÃO CABE | O nosso tem o próprio | — | repo |

### 2.4 Superfuture design review (Figma; só ideia)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `/superfuture-design-review` | Revisão por heurística (UX, acessibilidade, hierarquia, interação, produto) com semáforo vermelho/amarelo/verde ordenado por impacto | FUNDIR | Semáforo + "o que funciona" no formato do `revisor` e em `K/design/revisao-tela.md`. Estrutura interna **[HIPÓTESE]**: a página deu 403 | só ideia | https://www.figma.com/community/skill/65434/superfuture-design-review · https://www.figma.com/blog/try-these-10-skills-and-show-off-your-own/ |

### 2.5 addyosmani/agent-skills (MIT: copiar adaptado)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `using-agent-skills` | Meta-skill que roteia e dá regras comuns | JÁ TEMOS | `skills/ultimate` + `hooks/roteador.js`; suposições explícitas já estão no `comum.md` | MIT | https://github.com/addyosmani/agent-skills/tree/main/skills/using-agent-skills |
| `interview-me` | Uma pergunta por vez, sempre com um palpite; confirma antes de seguir | FUNDIR | → `K/metodo/entrevistar.md` (`planejador`, `gerente-produto`) | MIT | …/skills/interview-me |
| `idea-refine` (+3 refs + script, 41 KB) | Diverge (5–8 variações), converge (2–3), premissas que matam, lista "Não vamos fazer" | FUNDIR | → `K/metodo/refinar-ideia.md`, dividido (`estrategista`, `gerente-produto`, `estrategista-marketing`) | MIT | …/skills/idea-refine |
| `spec-driven-development` | Especificação antes do código | FUNDIR | → `K/metodo/especificar.md` (`planejador`, `gerente-produto`) | MIT | …/spec-driven-development |
| `constraint-driven-development` (+`floor-guard.md`, `quality-gate.mjs`) | Régua de qualidade em `CONSTRAINTS.md`, catraca, tabela de exceções com dono e validade | FUNDIR | → `K/engenharia/restricoes.md` (`engenheiro-software`, `testador-qa`); tabela de exceções → `analista-compliance` | MIT | …/constraint-driven-development |
| `planning-and-task-breakdown` | Tarefas pequenas com critério de aceite e ordem | FUNDIR | → `K/metodo/quebrar-tarefas.md` (`planejador`) | MIT | …/planning-and-task-breakdown |
| `incremental-implementation` | Fatias verticais: implementar, testar, verificar, commit | FUNDIR | → `K/engenharia/incremental.md` (`engenheiro-software`, `dev-powerbi`) | MIT | …/incremental-implementation |
| `test-driven-development` | Vermelho-verde-refatorar, pirâmide | FUNDIR | → `K/engenharia/tdd.md` (`testador-qa`, `engenheiro-software`) | MIT | …/test-driven-development |
| `context-engineering` | 5 níveis de contexto, carregar seletivo, salvar estado no fim da tarefa | FUNDIR | → `K/metodo/contexto.md` (`skills/ultimate` §2, `curador`) | MIT | …/context-engineering |
| `source-driven-development` | Versão pelo arquivo de dependências, doc oficial dessa versão, citação com link | FUNDIR | → `K/metodo/fonte-oficial-da-versao.md` (`pesquisador`, `engenheiro-software`, `dev-powerbi`) | MIT | …/source-driven-development |
| `doubt-driven-development` | Revisor em contexto limpo, só artefato + contrato; até 3 ciclos | FUNDIR | → `skills/ultimate` §5 (como chamar o revisor) | MIT | …/doubt-driven-development |
| `frontend-ui-engineering` | Componentes, design system, estado, WCAG 2.1 AA | FUNDIR | → `K/engenharia/interface-web.md` (`engenheiro-software`) | MIT | …/frontend-ui-engineering |
| `api-and-interface-design` | Contrato primeiro, erros, validação na borda | FUNDIR | → `K/engenharia/api.md` | MIT | …/api-and-interface-design |
| `browser-testing-with-devtools` | DOM, console, rede ao vivo pelo Chrome DevTools MCP | FUNDIR | → `K/engenharia/teste-no-navegador.md` (`testador-qa`); o MCP vai em `/integracoes` | MIT | …/browser-testing-with-devtools |
| `debugging-and-error-recovery` | Reproduzir, localizar, reduzir, corrigir, proteger | FUNDIR | Reforça o item 4 do `comum.md` → `K/engenharia/depurar.md` (`testador-qa`, `engenheiro-software`) | MIT | …/debugging-and-error-recovery |
| `code-review-and-quality` | 5 eixos; ~100/300/1.000 linhas; rótulos Crítico/Nit/Opcional/FYI | FUNDIR | → `K/metodo/revisar-codigo.md` (`revisor`, `engenheiro-software`) | MIT | …/code-review-and-quality |
| `code-simplification` | Simplificar sem mudar comportamento | FUNDIR | → `K/engenharia/simplificar.md` | MIT | …/code-simplification |
| `security-and-hardening` (+`hardening-patterns.md`) | OWASP, autenticação, segredos, dependências | FUNDIR | → `K/seguranca/endurecer.md` (`auditor-seguranca`, `engenheiro-software`; lote 8) | MIT | …/security-and-hardening |
| `performance-optimization` (+`optimization-patterns.md`) | Medir antes; Core Web Vitals | FUNDIR | → `K/engenharia/desempenho.md` | MIT | …/performance-optimization |
| `git-workflow-and-versioning` | Tronco, commits atômicos | FUNDIR | → `K/engenharia/git.md` | MIT | …/git-workflow-and-versioning |
| `ci-cd-and-automation` | Pipeline com portões | FUNDIR | → `K/engenharia/ci.md` | MIT | …/ci-cd-and-automation |
| `deprecation-and-migration` | Aposentar sistema e migrar com segurança | FUNDIR | → `K/engenharia/migracao.md` (`engenheiro-software`, `engenheiro-dados`) | MIT | …/deprecation-and-migration |
| `documentation-and-adrs` | Decisões (ADR) e o porquê | FUNDIR | → `K/escrita/adr.md` (`redator`, `engenheiro-software`) | MIT | …/documentation-and-adrs |
| `observability-and-instrumentation` | Logs estruturados, métricas RED, alertas por sintoma | FUNDIR | → `K/engenharia/observabilidade.md` | MIT | …/observability-and-instrumentation |
| `shipping-and-launch` | Lista antes de lançar, lançamento em etapas, plano de volta | FUNDIR | → `K/engenharia/lancar.md` (`gerente-produto`, `engenheiro-software`). **Ligar à skill `checklist-lancamento` da outra frente, sem duplicar** | MIT | …/shipping-and-launch |
| `agents/code-reviewer.md` | Revisor de código, 5 eixos | FUNDIR | → `revisor` (lote 9) | MIT | …/agents/code-reviewer.md |
| `agents/test-engineer.md` | Estratégia de teste, "prove que funciona" | FUNDIR | → `testador-qa` | MIT | …/agents/test-engineer.md |
| `agents/security-auditor.md` | Ameaças, OWASP | FUNDIR | → `auditor-seguranca` (lote 8) | MIT | …/agents/security-auditor.md |
| `agents/web-performance-auditor.md` | Core Web Vitals, modos rápido e profundo | FUNDIR | → `K/engenharia/desempenho-web.md` (`engenheiro-software`) | MIT | …/agents/web-performance-auditor.md |
| `.claude/commands/` (9: spec, plan, build, test, review, ship, code-simplify, constraints, webperf) | Atalhos do ciclo | JÁ TEMOS | `skills/rodada` + `ultimate` chamam o agente; não criar comandos | MIT | …/.claude/commands |
| `references/definition-of-done.md` | Régua de "pronto" | FUNDIR | → `skills/ultimate` §5 + `revisor` | MIT | …/references/definition-of-done.md |
| `references/testing-patterns.md` | Estrutura, nomes, simulação | FUNDIR | → `K/engenharia/padroes-de-teste.md` (`testador-qa`) | MIT | …/references/testing-patterns.md |
| `references/security-checklist.md` | Antes do commit, cabeçalhos, CORS, OWASP | FUNDIR | → `K/seguranca/lista.md` (lote 8, coordenar com `checklist-lancamento`) | MIT | …/references/security-checklist.md |
| `references/performance-checklist.md` | Metas e comandos de medição | FUNDIR | → `K/engenharia/desempenho.md` | MIT | …/references/performance-checklist.md |
| `references/accessibility-checklist.md` | Teclado, leitor de tela, ARIA | FUNDIR | → `K/design/acessibilidade/lista.md` | MIT | …/references/accessibility-checklist.md |
| `references/observability-checklist.md` | Plantão, logs, alertas | FUNDIR | → `K/engenharia/observabilidade.md`; parte "não logar dado pessoal" ao `especialista-lgpd` **[HIPÓTESE]** (não lido) | MIT | …/references/observability-checklist.md |
| `references/orchestration-patterns.md` | 5 padrões e 4 antipadrões (agente roteador, agente que chama agente…) | FUNDIR | → `skills/ultimate` §1 | MIT | …/references/orchestration-patterns.md |
| `hooks/session-start.sh` | Injeta a meta-skill no início | JÁ TEMOS | `hooks/roteador.js` e `atualizar.js` | MIT | …/hooks |
| `hooks/sdd-cache-pre/post.sh` + `SDD-CACHE.md` | Cache de WebFetch validado por ETag/Last-Modified em `.claude/sdd-cache/` | GANCHO | Opcional para o `pesquisador`, desligado por padrão (lote 9) | MIT | …/hooks/SDD-CACHE.md |
| `hooks/simplify-ignore.sh` + `SIMPLIFY-IGNORE.md` | Esconde blocos marcados do modelo ao simplificar | GANCHO | Opcional, prioridade baixa (lote 9) | MIT | …/hooks/SIMPLIFY-IGNORE.md |
| `evals/cases/` (25 JSON) + `fixtures/` + `scripts/run-evals.js` | Roteamento determinístico: positivos no top 3, negativos não em 1º, piso 95%, alerta de descrições parecidas | VALIDADOR | Eval de roteamento contra o `roteador.js` real, no `testar-hooks.js` (lote 5) | MIT | …/evals |
| `evals/plugin/` (dispara / fica quieto, avaliadores) | Comportamento sob demanda numa sessão sem tela | VALIDADOR | Evals de comportamento do `curador` (lote 5) | MIT | …/evals/plugin |
| `evals/skill-impact.md` | Mede se a skill muda o resultado | FUNDIR | → `curador` (`K/metodo/evals.md`) | MIT | …/evals/skill-impact.md |
| `scripts/validate-skills.js`, `lib/skill-lint.js` | Estrutura das skills | VALIDADOR | Somar ao `validar.js` o que faltar | MIT | …/scripts |
| `scripts/validate-reference-links.js` | Links das referências respondem | VALIDADOR | Checagem opcional (`--links`) das "Fonte: https://" | MIT | …/scripts |
| `scripts/validate-versions.js` | Versões coerentes | VALIDADOR | `plugin.json` = `marketplace.json` = topo do `CHANGELOG.md` | MIT | …/scripts |
| `scripts/validate-commands.js`, `validate-artifact-paths.js` | Caminhos citados existem | VALIDADOR | Cada "leia `<arquivo>`" dos agentes aponta para arquivo existente (lote 0) | MIT | …/scripts |
| `scripts/staged-secret-scan` (teste) | Procura segredo no conteúdo preparado para commit | GANCHO | `travas.js` passa a olhar o conteúdo, não só o nome (lote 9, depois da outra frente) | MIT | …/scripts |
| Testes dos scripts (`*-test.js`, `execution-status.js`) | Cada validador tem teste | JÁ TEMOS | `comum.md` item 3 ("checagem vista falhando") + `testar-hooks.js` | MIT | …/scripts |
| `docs/skill-anatomy.md`, `CONTRIBUTING.md`, `.claude/rules/skills-contributing.md` | Anatomia: Visão geral, Quando usar, Processo, Desculpas comuns, Sinais de alerta, Verificação | PROTOCOLO | Seções "Desculpas comuns" e "Sinais de alerta" no `docs/padrao-agente.md` + `validar.js` + 30 agentes (lote 9) | MIT | …/docs/skill-anatomy.md |
| `docs/agents.md`, `advanced-per-agent-configuration.md` | Modelo por agente | JÁ TEMOS | `skills/ultimate` §1b | MIT | …/docs |
| `docs/*-setup.md` (11), `.gemini/`, `.codex-plugin/`, `.opencode/`, `.agents/`, `commands/*.toml` | Instalação em outras ferramentas | NÃO CABE | Outras plataformas | — | …/docs |
| `docs/getting-started.md`, `adoption-guide.md`, `developer-onboarding.md`, `comparison.md` | Como adotar | JÁ TEMOS | `README.md` + `docs/como-funciona.md` | MIT | …/docs |
| `.github/ISSUE_TEMPLATE/skill-gap.yml` | Pedir skill que falta | JÁ TEMOS | `.claude/base/PROPOSTAS.md` | MIT | …/.github |
| `.github/workflows/test-plugin-install.yml` | Instala o plugin do zero no CI | VALIDADOR | Teste de instalação limpa antes de publicar versão | MIT | …/.github/workflows |
| `.claude-plugin/`, `plugin.json` | Empacotamento deles | NÃO CABE | Temos o nosso | — | repo |

### 2.6 upstash/context7 (MIT; serviço hospedado com termos próprios)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `skills/find-docs` | Doc atual da biblioteca: achar o ID, depois a doc; 1 conceito por consulta, até 3 consultas; sem segredo nem código proprietário na pergunta | FUNDIR | A regra (versão instalada, 1 conceito, até 3) → `K/metodo/fonte-oficial-da-versao.md`; a ferramenta → INTEGRAÇÃO | MIT | https://github.com/upstash/context7/tree/master/skills/find-docs |
| `skills/context7-cli` (+`docs.md`, `setup.md`) | CLI `npx ctx7` | INTEGRAÇÃO | Guia em `/integracoes`: o usuário instala; consultas vão à Upstash | MIT | …/skills/context7-cli |
| `skills/context7-mcp` | Uso pelo servidor MCP | INTEGRAÇÃO | Idem | MIT | …/skills/context7-mcp |
| `rules/context7-cli.md`, `rules/context7-mcp.md` | Quando usar | INTEGRAÇÃO | Texto de "quando usar" do guia | MIT | …/rules |
| `plugins/claude/context7/.mcp.json` | `{"type":"http","url":"https://mcp.context7.com/mcp?client=claude-code-plugin"}` | INTEGRAÇÃO | Trecho para o usuário colar; o plugin não liga sozinho | MIT | …/plugins/claude/context7/.mcp.json |
| `plugins/*/agents/docs-researcher.md` | Agente leve que busca a doc e devolve só o resumo | FUNDIR | "Pesquisa isolada, devolve resumo" → `pesquisador` (Método) | MIT | …/plugins/cursor/context7/agents/docs-researcher.md |
| `plugins/copilot/context7/commands/docs.md` | Comando `/docs` | JÁ TEMOS | `pesquisador` | MIT | …/commands/docs.md |
| `plugins/{antigravity,codex,copilot,cursor,agent-plugins}`, `context7-power` | Pacotes para outras ferramentas | NÃO CABE | Outras plataformas | — | …/plugins |
| `packages/{mcp,cli,sdk,admin-mcp,opencode,pi,tools-ai-sdk}` | Código do servidor e dos clientes | NÃO CABE | Não hospedamos serviço; o motor é privado | — | …/packages |
| `docs/`, `i18n/` | Documentação do serviço | NÃO CABE | Sem método para agente | — | …/docs |

### 2.7 serafimcloud/21st (MIT)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| Diretrizes de publicação de componente (README) | Prévia (`preview.png`) obrigatória, demonstração separada da lógica, tema por variáveis CSS, claro e escuro, acessibilidade, TypeScript | FUNDIR | → `K/design/componentes.md` (`designer-paineis`, `engenheiro-software`) | MIT | https://github.com/serafimcloud/21st |
| Registro 21st.dev (`npx shadcn@latest add "https://21st.dev/r/..."`) | Instala componente da comunidade | INTEGRAÇÃO | Só em projeto React + Tailwind; o código de terceiro passa pelo `revisor` antes de entrar | MIT | https://21st.dev |
| 21st MCP (`21st-dev/magic-mcp`, ISC) | Busca e gera componentes | INTEGRAÇÃO | Pede chave; manda o pedido ao serviço | ISC | https://github.com/21st-dev/magic-mcp |
| `apps/web/` | Código do site | NÃO CABE | Produto deles, não conteúdo de agente | — | repo |
| `.cursor/rules/21st.mdc` | Regras do próprio repositório (Supabase, Clerk, pnpm) | NÃO CABE | Só valem para o código deles | — | …/.cursor/rules/21st.mdc |
| `apps/web/components/features/prompt-rules/` | Função "regras de prompt" do site | NÃO CABE | Funcionalidade do site | — | repo |

### 2.8 usestrix/strix (Apache-2.0: copiar marcando as alterações)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `skills/find-security-vulnerabilities-in-code` | Revisar o diff, `arquivo:linha`; sem app rodando = "não confirmado" | FUNDIR | → Método do `auditor-seguranca` (lote 8) | Apache-2.0 | https://github.com/usestrix/strix/tree/main/skills |
| `skills/` de uso do CLI (7: penetration-testing, web-app-penetration-testing, api-security-testing, application-security-testing, managed-pentesting, ci-security-scanning, fix-security-vulnerabilities) | Como rodar o strix em cada caso | INTEGRAÇÃO | Guia em `/integracoes`; o método aproveitável vai para o item acima | Apache-2.0 | …/skills |
| `skills/owasp-top-10-testing` | OWASP Top 10:2025 + API Top 10; o que não se testa de fora; sem 2ª conta, controle de acesso fica incompleto | FUNDIR | → `K/seguranca/owasp-top10-2025.md` | Apache-2.0 | …/skills/owasp-top-10-testing |
| `strix/skills/analysis/counterevidence.md` | 3 estados: confirmado, descartado, lacuna de prova; argumentar o contrário antes de registrar | FUNDIR | → `K/seguranca/metodo/contraprova.md` (`auditor-seguranca`; ideia também no `revisor`) | Apache-2.0 | …/strix/skills/analysis |
| `analysis/severity_calibration.md` | Gravidade é conclusão; o que é crítico, alto, médio, baixo; não superestimar | FUNDIR | → `K/seguranca/metodo/gravidade.md` (`auditor-seguranca`; ideia ao `analista-compliance`) | Apache-2.0 | …/analysis |
| `analysis/fix_verification.md` | 5 portões em ordem antes de propor correção; reter quando não passa | FUNDIR | → `K/seguranca/metodo/verificar-correcao.md` (`auditor-seguranca`, `engenheiro-software`) | Apache-2.0 | …/analysis |
| `analysis/source_aware_discovery.md` | Cada ponto alcançável é um candidato; vizinho correto não prova nada; varrer a família inteira | FUNDIR | → `K/seguranca/metodo/varredura.md` | Apache-2.0 | …/analysis |
| `scan_modes/{quick,standard,deep,diff}` | Profundidade da análise | FUNDIR | → modos do `auditor-seguranca` (rápido, padrão, profundo, só a mudança) **[HIPÓTESE]**, lido só o nome | Apache-2.0 | …/scan_modes |
| `vulnerabilities/` (29 arquivos, 301,5 KB) | Um guia por classe: SQLi, XSS, SSRF, IDOR, JWT, CSRF, injeção de prompt, sistemas de agentes… | FUNDIR | → `K/seguranca/vulnerabilidades/<classe>.md` (`auditor-seguranca`; `engenheiro-software` ao corrigir). Só `llm_prompt_injection` lido; os demais **[HIPÓTESE]** | Apache-2.0 | …/vulnerabilities |
| `frameworks/{django,fastapi,nestjs,nextjs}` | Pontos fracos por framework | FUNDIR | → `K/seguranca/frameworks/` **[HIPÓTESE]** | Apache-2.0 | …/frameworks |
| `technologies/{active_directory,auth0,electron_desktop_apps,firebase,grafana_prometheus,llm_applications,supabase}` | Por tecnologia | FUNDIR | → `K/seguranca/tecnologias/` **[HIPÓTESE]** | Apache-2.0 | …/technologies |
| `protocols/{graphql,oauth}` | Por protocolo | FUNDIR | → `K/seguranca/protocolos/` **[HIPÓTESE]** | Apache-2.0 | …/protocols |
| `cloud/{aws,azure,gcp,kubernetes}` | Por nuvem | FUNDIR | → `K/seguranca/nuvem/` **[HIPÓTESE]** | Apache-2.0 | …/cloud |
| `custom/{api_spec_testing,dependency_cve_scanning,npx_confusion,source_aware_sast}` | Especificação de API, CVE de dependência, confusão de pacote no `npx`, SAST | FUNDIR | → `K/seguranca/dependencias.md` e afins; `npx_confusion` importa para nós (usamos `npx`) **[HIPÓTESE]** | Apache-2.0 | …/custom |
| `reconnaissance/{asset_discovery,infrastructure_lifecycle}` | Descoberta de alvos | INTEGRAÇÃO | Restrita: só pelo strix, em alvo próprio e com autorização escrita do dono | Apache-2.0 | …/reconnaissance |
| `tooling/{semgrep,hypothesis,python}` | Análise estática, teste por propriedade | FUNDIR | `semgrep` → `auditor-seguranca`; `hypothesis` → `testador-qa` **[HIPÓTESE]** | Apache-2.0 | …/tooling |
| `tooling/{nmap,naabu,subfinder,katana,ffuf,httpx,hurl,nuclei,sqlmap,agent_browser}` | Ferramentas ofensivas | INTEGRAÇÃO | Restrita, como acima; o plugin nunca roda sozinho | Apache-2.0 | …/tooling |
| `coordination/{root_agent,source_aware_whitebox}` | Como o agente raiz divide o trabalho | FUNDIR | Ideia para `skills/ultimate` (dividir por família, em paralelo) **[HIPÓTESE]**, não lido | Apache-2.0 | …/coordination |
| `strix/agents/prompts/{system_prompt,scope}.jinja` | Prompt do agente e escopo | FUNDIR | Regras de escopo → `auditor-seguranca` **[HIPÓTESE]**, não lido | Apache-2.0 | …/strix/agents/prompts |
| Código do strix (Python, contêiner, TUI, `benchmarks/`) | O produto | NÃO CABE | Copiar o motor não; usar instalado pela INTEGRAÇÃO | — | repo |

### 2.9 everything-claude-code (cópia sem licença; copiar do original affaan-m/ECC, MIT)
| Item | O que faz | Destino | Detalhe | Licença | Link (original) |
|---|---|---|---|---|---|
| `agents/planner.md` | Planejar funcionalidade | JÁ TEMOS | `planejador`; somar diferenças em `K/metodo/quebrar-tarefas.md` | MIT (orig.) | https://github.com/affaan-m/ECC/tree/main/agents |
| `agents/architect.md` | Decisão de arquitetura | FUNDIR | → `K/engenharia/arquitetura.md` (`engenheiro-software`) | MIT | …/agents/architect.md |
| `agents/tdd-guide.md` | TDD guiado | FUNDIR | → `K/engenharia/tdd.md` (`testador-qa`) | MIT | …/agents/tdd-guide.md |
| `agents/code-reviewer.md` | Revisão de qualidade e segurança | FUNDIR | → `revisor` (lote 9) | MIT | …/agents/code-reviewer.md |
| `agents/security-reviewer.md` (14 KB) | Análise de vulnerabilidade | FUNDIR | → `auditor-seguranca` (lote 8) | MIT | …/agents/security-reviewer.md |
| `agents/build-error-resolver.md` (12 KB) | Corrigir build com a menor mudança | FUNDIR | → `K/engenharia/erro-de-build.md` (`engenheiro-software`) | MIT | …/agents/build-error-resolver.md |
| `agents/e2e-runner.md` (20 KB) | Testes ponta a ponta (Playwright) | FUNDIR | → `K/engenharia/e2e.md` (`testador-qa`) | MIT | …/agents/e2e-runner.md |
| `agents/refactor-cleaner.md` | Código morto: detectar, classificar risco, um lote por vez, log de exclusões | FUNDIR | → `K/engenharia/codigo-morto.md` (`engenheiro-software`) | MIT | …/agents/refactor-cleaner.md |
| `agents/doc-updater.md` | Docs e mapas gerados do código | FUNDIR | → `redator` (doc descreve o estado atual); mapas já temos (`MAPA-AUTO`) | MIT | …/agents/doc-updater.md |
| `commands/{plan,tdd,e2e,code-review,build-fix,refactor-clean,test-coverage,update-docs}` | Atalhos para os agentes | JÁ TEMOS | Rodada + agentes; o conteúdo vai pelas linhas acima | MIT | …/commands |
| `commands/checkpoint.md` | Ponto de controle: verificação rápida + commit; comparar depois | FUNDIR | → `skills/rodada` (ponto de controle por etapa) | MIT | …/commands/checkpoint.md |
| `commands/verify.md` + `skills/verification-loop` | Build, tipos, lint, testes, segredos; PASS/FAIL por fase, PRONTO/NÃO PRONTO | FUNDIR | → `K/engenharia/verificacao.md` (`testador-qa`) + `ultimate` §5 | MIT | …/skills/verification-loop |
| `commands/eval.md` + `skills/eval-harness` | pass@k, pass^k, eval de capacidade × regressão, avaliadores por código, modelo e humano | FUNDIR | → `K/metodo/evals.md` (`curador`) | MIT | …/skills/eval-harness |
| `commands/learn.md` + `skills/continuous-learning` | Extrai padrões no fim da sessão; aprovação automática desligada | JÁ TEMOS | `curador` + `APRENDIZADOS.md` + `PROPOSTAS.md`; somar o limiar de "sessão com 10+ mensagens" | MIT | …/skills/continuous-learning |
| `commands/orchestrate.md` | Cadeias de agentes; passagem com Contexto, Achados, Arquivos, Perguntas, Recomendações; veredito SHIP/NEEDS WORK/BLOCKED | FUNDIR | Formato de passagem → `skills/ultimate` §3 | MIT | …/commands/orchestrate.md |
| `commands/update-codemaps.md` | Mapas da arquitetura; pede aprovação se mudar > 30% | JÁ TEMOS | `hooks/grafo.js` → `MAPA-AUTO.md` | MIT | …/commands/update-codemaps.md |
| `commands/setup-pm.md` + `scripts/lib/package-manager.js` | Detectar gerenciador de pacotes | FUNDIR | 1 linha no `engenheiro-software`: usar o do lockfile | MIT | …/commands/setup-pm.md |
| `skills/coding-standards` | Boas práticas por linguagem | FUNDIR | → `K/engenharia/padroes-codigo.md` | MIT | …/skills/coding-standards |
| `skills/backend-patterns` | API, banco, cache | FUNDIR | → `K/engenharia/backend.md` (`engenheiro-software`, `engenheiro-dados`) | MIT | …/skills/backend-patterns |
| `skills/frontend-patterns` | React, Next.js | FUNDIR | → `K/plataformas/react/padroes.md` | MIT | …/skills/frontend-patterns |
| `skills/clickhouse-io` | Padrões de ClickHouse | FUNDIR | → `K/dados/clickhouse.md` (`engenheiro-dados`, só se a pilha usar) | MIT | …/skills/clickhouse-io |
| `skills/security-review` | Lista de segurança | FUNDIR | → `K/seguranca/lista.md` (lote 8) | MIT | …/skills/security-review |
| `skills/tdd-workflow` | Método TDD | FUNDIR | → `K/engenharia/tdd.md` | MIT | …/skills/tdd-workflow |
| `skills/strategic-compact` + `suggest-compact.sh` + gancho PreToolUse | Sugere compactar após 50 chamadas e a cada 25, num marco, nunca no meio | GANCHO | Gancho "sugerir compactar" (lote 9) | MIT | …/skills/strategic-compact |
| `skills/project-guidelines-example` | Exemplo de diretrizes do projeto | JÁ TEMOS | `.claude/base/PROJETO.md` | MIT | …/skills |
| `rules/security.md` | Checagens obrigatórias | FUNDIR | → `K/seguranca/lista.md` | MIT | …/rules |
| `rules/{coding-style,patterns,git-workflow}.md` | Estilo, padrões, commits | FUNDIR | → `K/engenharia/padroes-codigo.md`, `git.md` | MIT | …/rules |
| `rules/testing.md` | TDD, 80% de cobertura | FUNDIR | → `K/engenharia/padroes-de-teste.md` (a meta é decisão do projeto) | MIT | …/rules |
| `rules/agents.md` | Quando delegar; tarefas independentes em paralelo | JÁ TEMOS | `skills/ultimate` §1 | MIT | …/rules |
| `rules/performance.md` | Modelo por tarefa; não começar tarefa grande nos últimos 20% da janela | FUNDIR | → `skills/ultimate` §1b | MIT | …/rules |
| `rules/hooks.md` | Uso de ganchos | FUNDIR | → `docs/como-funciona.md` **[HIPÓTESE]**, não lido | MIT | …/rules |
| Ganchos: bloquear servidor dev fora do tmux e lembrar do tmux | — | NÃO CABE | tmux não existe no Windows/PowerShell, onde o plugin roda | — | …/hooks/hooks.json |
| Gancho: lembrete antes de `git push` | — | JÁ TEMOS | `hooks/travas.js` | — | idem |
| Gancho: bloquear `.md`/`.txt` avulsos | — | NÃO CABE | O nosso método grava notas em `docs/` de propósito | — | idem |
| Gancho `PreCompact` (`pre-compact.js`) | Salva estado antes de compactar | GANCHO | Rascunho "retomar aqui" em `.claude/base/.retomar.md` (lote 9) | MIT | …/scripts/hooks/pre-compact.js |
| Gancho `SessionStart` (`session-start.js`) | Carrega o contexto anterior | JÁ TEMOS | "Situe-se" do protocolo + `MAPA.md` + ganchos de início | MIT | …/scripts/hooks |
| Gancho `SessionEnd` (`session-end.js`) | Salva estado no fim | GANCHO | Junto com o `PreCompact` | MIT | …/scripts/hooks |
| Gancho `evaluate-session.js` | Extrai padrões | JÁ TEMOS | `curador`, com aprovação, no projeto (não em `~/.claude`) | MIT | …/scripts/hooks |
| Gancho: URL do PR após `gh pr create` | Mostra o PR e o comando de revisão | FUNDIR | 1 linha no `engenheiro-software` | MIT | …/hooks/hooks.json |
| Ganchos prettier, `tsc --noEmit`, `console.log` (edição e Stop) | Formata e confere TS/JS | GANCHO | Gancho genérico "verificador do projeto": roda o que o projeto declarar em `.claude/base/config.json`, sem fixar JS (lote 9) | MIT | idem |
| `contexts/{dev,review,research}.md` | Modos de trabalho | FUNDIR | research → `pesquisador` (achados antes de recomendar); review → `revisor`; dev → `engenheiro-software` | MIT | …/contexts |
| `mcp-configs/mcp-servers.json` | Exemplos de MCP; aviso: MCP demais encolhe a janela, ter < 10 ativos | INTEGRAÇÃO | Aviso e exemplos em `/integracoes` | MIT | …/mcp-configs |
| `examples/` (CLAUDE.md, user-CLAUDE.md, sessões, statusline) | Exemplos | JÁ TEMOS | `PROJETO.md`, `hooks/barra.js` | MIT | …/examples |
| `tests/` | Testes dos ganchos | JÁ TEMOS | `scripts/testar-hooks.js` | MIT | …/tests |
| `.claude-plugin/`, `plugins/README.md`, `.claude/package-manager.json` | Empacotamento | NÃO CABE | Temos o nosso | — | repo |
| `WORLDFLOWAI.md`, `CONTRIBUTING.md` (da cópia) | Texto da cópia | NÃO CABE | Não é do original | — | https://github.com/WorldFlowAI/everything-claude-code |

### 2.10 pbakaus/impeccable (Apache-2.0: copiar marcando as alterações; lido da cópia local 4.0.3 e da API do GitHub)
| Item | O que faz | Destino | Detalhe | Licença | Link |
|---|---|---|---|---|---|
| `SKILL.md` | Princípios: verificar em passadas limitadas (1 inspeção, 1 lote de correções, até 1 confirmação); modos Persuadir/Operar/Ler/Experiência; "o pedido manda"; refinar preserva, redesenhar substitui | FUNDIR | → `K/design/metodo.md` (designers) + passadas limitadas em `skills/rodada` | Apache-2.0 | https://github.com/pbakaus/impeccable |
| `reference/craft.md` | Apelido obsoleto | NÃO CABE | O próprio arquivo diz que não acrescenta nada | — | …/reference |
| `shape.md` | Planejar UX antes do código | FUNDIR | → `K/design/planejar-tela.md` (designer; complementa a spec) | Apache-2.0 | …/reference/shape.md |
| `init.md` (11,7 KB) | Grava o contexto do produto em `PRODUCT.md` | JÁ TEMOS | `PROJETO.md` + `marca.md`; somar as perguntas de produto que faltarem | Apache-2.0 | …/init.md |
| `document.md` (27,5 KB) + agente `impeccable-documenter` | Gera a ficha de design do que já existe, derivada do entregue | FUNDIR | → `K/design/documentar-sistema.md` (designers), dividido | Apache-2.0 | …/document.md |
| `extract.md` | Tokens e componentes reutilizáveis | FUNDIR | → `K/design/extrair-tokens.md` (designer, `dev-powerbi` no tema) | Apache-2.0 | …/extract.md |
| `critique.md` (45,6 KB) | Revisão de UX com pontuação heurística | FUNDIR | → `K/design/critica/` em 3 arquivos (designers; o `revisor` usa a pontuação) | Apache-2.0 | …/critique.md |
| `audit.md` + `audit.native.md` | Acessibilidade, desempenho, responsivo | FUNDIR | → `K/design/auditoria.md` (designer, `testador-qa`); nativo → `K/plataformas/` | Apache-2.0 | …/audit.md |
| `polish.md` | Passe final antes de entregar | FUNDIR | → `K/design/polimento.md` (designers) | Apache-2.0 | …/polish.md |
| `bolder.md`, `delight.md`, `overdrive.md` | Ousar, encantar, passar do convencional | FUNDIR | → `K/design/persuadir/` (`estrategista-marketing`, `designer-documentos` em apresentações). Painel é modo Operar: não se aplica | Apache-2.0 | …/reference |
| `quieter.md`, `distill.md` | Acalmar, reduzir ao essencial | FUNDIR | → `K/design/acalmar-reduzir.md` (designers) | Apache-2.0 | …/reference |
| `harden.md` | Erros, i18n, casos extremos | FUNDIR | → `K/design/estados-e-extremos.md` (designer, `testador-qa`) | Apache-2.0 | …/harden.md |
| `onboard.md` | Primeiro uso, estados vazios, ativação | FUNDIR | → `K/design/primeiro-uso.md` (`gerente-produto`, `especialista-cs`, designer) | Apache-2.0 | …/onboard.md |
| `animate.md` | Movimento com propósito | FUNDIR | Junta em `K/design/movimento/` (o Emil manda nos valores) | Apache-2.0 | …/animate.md |
| `colorize.md` | Cor estratégica | FUNDIR | Junta em `K/design/cor/` | Apache-2.0 | …/colorize.md |
| `typeset.md` | Hierarquia tipográfica | FUNDIR | Junta em `K/design/tipografia/` | Apache-2.0 | …/typeset.md |
| `layout.md` | Espaço, ritmo, hierarquia | FUNDIR | Junta em `K/design/layout/` | Apache-2.0 | …/layout.md |
| `clarify.md` | Texto de interface, rótulos, erros | FUNDIR | Junta em `K/escrita/texto-de-interface.md` | Apache-2.0 | …/clarify.md |
| `adapt.md` + `adapt.native.md` | Outros tamanhos e aparelhos | FUNDIR | → `K/design/adaptar.md` (designer, `engenheiro-software`) | Apache-2.0 | …/adapt.md |
| `optimize.md` | Desempenho da interface | FUNDIR | → `K/engenharia/desempenho.md` | Apache-2.0 | …/optimize.md |
| `live.md` (37 KB) + `live-setup.md` + `scripts/live-*` + agente `manual-edit-applier` | Escolher elemento no navegador e gerar alternativas | INTEGRAÇÃO | Só a pedido explícito do usuário (`comum.md` item 7: não controlar a tela) | Apache-2.0 | …/live.md |
| `craft-floor.md` | Piso de qualidade e proibições, lido logo antes de editar | FUNDIR | → `K/design/piso-de-qualidade.md` (designers) | Apache-2.0 | …/craft-floor.md |
| `new-work.md` (63,6 KB) | Tela ou peça nova: escolher o "mundo visual" | FUNDIR | → `K/design/tela-nova/`, em 4 arquivos (designers) | Apache-2.0 | …/new-work.md |
| `routing.md` | Menu sem argumento; nunca roda comando sozinho | JÁ TEMOS | Roteador + `ultimate` | Apache-2.0 | …/routing.md |
| `operate.md` + `mode-operate.md` | Telas de tarefa: leitura rápida, consistência | FUNDIR | → `K/design/modos/operar.md` (`designer-paineis`) | Apache-2.0 | …/operate.md |
| `mode-persuade.md` | Telas que convencem | FUNDIR | → `K/design/modos/persuadir.md` (`estrategista-marketing`, `designer-documentos`) | Apache-2.0 | …/mode-persuade.md |
| `mode-read.md` | Telas de leitura | FUNDIR | → `K/design/modos/ler.md` (`designer-documentos`, `redator`) | Apache-2.0 | …/mode-read.md |
| `visualize.md` (14 KB) | Visualização de dados | FUNDIR | → `K/design/visualizacao.md` (`designer-paineis`) **[HIPÓTESE]**, lido o nome e o tamanho | Apache-2.0 | …/visualize.md |
| `component-review.md`, `region-map.md` (só no GitHub, não na 4.0.3) | Revisão de componente; mapa de regiões | FUNDIR | → `K/design/` (designer, `revisor`) **[HIPÓTESE]** | Apache-2.0 | …/reference |
| `ios.md`, `android.md` | Orientação nativa | FUNDIR | → `K/plataformas/ios.md`, `android.md` (`engenheiro-software`) | Apache-2.0 | …/reference |
| `hooks.md` + `hooks/hooks.json` + `scripts/hook*.mjs` + `scripts/detector/` | Detector determinístico de interface após cada edição (PostToolUse 5 s, Stop 30 s, Node 22) | GANCHO | Gancho genérico "verificador do projeto". O detector do impeccable entra como opção, desligado, porque duplicaria se o impeccable estiver instalado | Apache-2.0 | …/hooks/hooks.json |
| `doctor.md` + `scripts/doctor.mjs` | Relata desvios dos artefatos e nunca conserta de carona | FUNDIR | → `curador` (relatar memória e mapas velhos, sem corrigir sozinho) | Apache-2.0 | …/doctor.md |
| `reference/degraded/` (4) | Versões para quando não há subagente | NÃO CABE | O Claude Code tem subagentes; duplicado | — | …/degraded |
| Agente `impeccable-finish-reviewer` | `effort: high`, `maxTurns: 30`, para de ler por volta do 10º turno, até 8 correções, passe de veredito (resolvido/parcial/não) com até 3 regressões | FUNDIR | → `revisor` (lote 9) | Apache-2.0 | …/agents/impeccable-finish-reviewer.md |
| Agente `impeccable-asset-producer` (`maxTurns: 24`) | Imagens limpas a partir do aprovado, sem redesenhar | FUNDIR | → `designer-documentos` | Apache-2.0 | …/agents/impeccable-asset-producer.md |
| `scripts/context.mjs`, `context-signals.mjs`, `lib/*` (leitor de PRODUCT/DESIGN, "contexto velho") | Carrega o contexto e avisa quando está velho | JÁ TEMOS | "Situe-se" do protocolo; o aviso de contexto velho vai ao `curador` | Apache-2.0 | …/scripts |
| `scripts/generate-image.mjs`, `lib/provider.mjs`, `embed-prompt.mjs`, `reference/generate.md` | Gera imagem por um provedor externo | INTEGRAÇÃO | Desligada por padrão: manda o pedido para fora | Apache-2.0 | …/scripts |
| `scripts/concept-seed.mjs`, `lib/{composition,concept}-catalog.mjs`, `surface-briefs.mjs`, `data/font-index.json` | Catálogos de composição, conceito e fontes | FUNDIR | → apoio de `K/design/tela-nova/` **[HIPÓTESE]**, não lido | Apache-2.0 | …/scripts |
| Cabeçalho `allowed-tools`, `user-invocable`, `argument-hint`, `maxTurns` | Restringe ferramentas e turnos | VALIDADOR | `validar.js` aceita e confere esses campos (skills e agentes) | ideia | …/SKILL.md |
| `scripts/pin.mjs` | Atalho `/<comando>` | JÁ TEMOS | As nossas skills já são comandos | — | …/SKILL.md |
| Extensão de navegador, CLI `npx impeccable`, cópias em `.agent/.agents/.cursor/.codex/.devin/.dsh/.grok` | Outras ferramentas | NÃO CABE | Outras plataformas; mesmo conteúdo repetido | — | repo |

### 2.11 Itens que não servem a nenhum agente atual
| Item | Destino | Detalhe |
|---|---|---|
| Guia das ferramentas externas (context7, 21st, strix, detector, live e imagem do impeccable, Chrome DevTools MCP, aviso de "< 10 MCP ativos") | **NOVA-SKILL `integracoes`** | `disable-model-invocation: true`. Gatilho: "ligar o context7", "integrações", "MCP", "strix". Por ferramenta diz o que faz, que dado sai e para onde, o trecho para o usuário colar, como desligar e o risco. Nada é instalado pelo plugin |

**Nenhum NOVO-AGENTE.** Telas de app e web ficam com o `designer-paineis`, arquitetura e desempenho web com o
`engenheiro-software`. Reavaliar um `designer-interface` só se a eval de roteamento mostrar pedidos de app caindo no lugar
errado.

## 3. Mapa agente → conteúdo

Formato da linha de gatilho no corpo do agente (Método ou seção nova "Referências sob demanda", no máximo 8 linhas):
`- Quando <situação>, leia \`<caminho>\` (no máximo 3 arquivos por pedido).`

**Onde fica:** `conhecimento/<tema>/` quando serve a mais de um agente; `fonte/agentes/<pacote>/referencias/<agente>/`
quando serve a um só. O `gerar-agentes.js` só copia os `.md` do nível do pacote, então a subpasta não quebra o gerador.
**Risco técnico (lote 0):** o agente roda na pasta do projeto, e os arquivos ficam na pasta do plugin, que muda a cada
versão. Antes de tudo, provar que o agente abre `${CLAUDE_PLUGIN_ROOT}/conhecimento/...`. Se não abrir, o gancho de início
grava o caminho da raiz do plugin em `.claude/base/.raiz-plugin` e a linha passa a ser "leia `<raiz>/conhecimento/...`".
**[HIPÓTESE]**: não testei.

**Quem manda quando o conteúdo diverge:**
1. a marca e as decisões do projeto (`PROJETO.md`, `marca.md`);
2. a norma (WCAG, IBCS, lei);
3. as referências de mercado que o agente já tem;
4. o conteúdo importado. Entre os importados, manda o dono do tema: movimento, Emil; acessibilidade, cor, tipografia,
   layout e texto, Jakub; método de crítica, polimento e piso, impeccable; plataformas Apple, a HIG (texto nosso);
   segurança, strix; engenharia, addy antes do ECC.

A divergência fica escrita no arquivo, com os dois valores. Exemplo: o `STANDARDS.md` do Emil diz "< 300 ms" e, ao mesmo
tempo, faixa de até 500 ms para modais.

Coluna "Ferramentas": números da §3.2. "Opc." = passo opcional que o usuário liga.

| Agente | Ferramentas | Recebe | De onde (projeto: arquivo) | Destino | Licença | Linha de gatilho |
|---|---|---|---|---|---|---|
| `designer-paineis` | T1 detector, T2 verificador, T8 seletor de variantes, T9 pior caso; opc. T3 live, T28 DevTools | Método de crítica, auditoria, polimento, piso, tela nova, modo Operar, visualização, estados e extremos, adaptar, tokens; HIG (texto nosso); movimento; acessibilidade, cor, layout, tipografia, superfícies; pior caso; variantes e estados; construir do desenho; explicar referência; semáforo; componentes com prévia | impeccable `critique`, `audit`, `polish`, `craft-floor`, `new-work`, `operate`, `mode-operate`, `visualize`, `harden`, `adapt`, `extract`, `shape`, `document`, `quieter`, `distill`; apple-design-skill (ideia); emil (todas de animação, `break-ui`, `prototype`); jakub `better-*`, `break`, `state-machine`, `variant`, `build-design`, `explain-interface`; Superfuture; 21st README | `K/design/**` | Apache, MIT, ideia | "Quando revisar uma tela, leia `K/design/revisao-tela.md` e `K/design/critica/INDICE.md`." · "Antes de editar uma tela, leia `K/design/piso-de-qualidade.md`." · "Quando a tela tiver movimento, leia `K/design/movimento/INDICE.md`." · "Quando houver texto variável, leia `K/design/pior-caso.md`." · "Quando o usuário pedir opções, leia `K/design/variantes.md`." · "Quando houver gráfico, leia `K/design/visualizacao.md` e `K/design/apple/graficos.md`." (lote 7) |
| `designer-documentos` | T7 teardown; opc. T4 imagem | Tipografia, cor, layout, piso, crítica, polimento, modos Ler e Persuadir (apresentações), ilustração técnica, imagens a partir do aprovado; HIG de tipografia, cor, escrita e marca | impeccable `typeset`, `colorize`, `layout`, `polish`, `critique`, `mode-read`, `mode-persuade`, `bolder`, `delight`, agente `asset-producer`; jakub `better-typography`, `better-colors`, `better-layout`, `teardown`; emil `animation-vocabulary`, `emil-design-eng` (transições de slide) | `K/design/**`, `K/documentos/ilustracao-tecnica.md`, `ferramentas/teardown/` | Apache, MIT, ideia | "Quando formatar documento ou slide, leia `K/design/tipografia/INDICE.md`." · "Quando a peça precisar convencer, leia `K/design/modos/persuadir.md`." · "Quando precisar de ilustração técnica, leia `K/documentos/ilustracao-tecnica.md`." |
| `engenheiro-software` | T2 verificador, T15 portão de qualidade, T17 simplify-ignore, T21 gerenciador de pacotes; opc. T22–T25 (context7, 21st) | Fatias, API, interface web, simplificar, git, CI, migração, observabilidade, desempenho (web e de interface), arquitetura, erro de build, código morto, padrões, restrições, doc da versão instalada, bibliotecas de interface, plataformas (Swift, RN, iOS, Android, celular, Apple, multiplataforma, React/Sonner), verificar correção de segurança | addy (12 skills de engenharia + `web-performance-auditor` + checklists); ECC `architect`, `build-error-resolver`, `refactor-cleaner`, `coding-standards`, `backend-patterns`, `frontend-patterns`, `rules/*`, `setup-pm`; context7 `find-docs` (regra); emil `pick-ui-library`, `mobile-native`, `write-swift`, `animate-expo`, `ask-sonner`, `animation-performance`; impeccable `optimize`, `adapt`, `ios`, `android`; apple `code-audit`, `cross-platform` (ideia); strix `fix_verification`; 21st | `K/engenharia/**`, `K/plataformas/**` | MIT, Apache, ideia | "Antes de usar uma API de biblioteca, leia `K/metodo/fonte-oficial-da-versao.md`." · "Quando o pedido for arquitetura, leia `K/engenharia/arquitetura.md`." · "Quando o build quebrar, leia `K/engenharia/erro-de-build.md`." · "Quando a pilha for <X>, leia `K/plataformas/<x>.md`." |
| `testador-qa` | T1 detector, T2 verificador, T9 pior caso, T15 portão; opc. T28 DevTools | TDD, e2e, teste no navegador, padrões de teste, depurar, verificação PASS/FAIL, restrições, pior caso e estados, auditoria de interface, teste por propriedade | addy `test-driven-development`, `browser-testing-with-devtools`, `debugging-and-error-recovery`, `test-engineer`, `testing-patterns`, `constraint-driven-development`; ECC `tdd-guide`, `e2e-runner`, `tdd-workflow`, `verification-loop`, `rules/testing.md`; emil `break-ui`; jakub `break`, `state-machine`; impeccable `audit`, `harden`; strix `tooling/hypothesis` | `K/engenharia/**`, `K/design/pior-caso.md` | MIT, Apache | "Quando testar uma tela, leia `K/design/pior-caso.md`." · "Antes de dizer que passou, leia `K/engenharia/verificacao.md`." · "Quando for ponta a ponta, leia `K/engenharia/e2e.md`." |
| `auditor-seguranca` | T18 segredo no commit; opc. T26 strix, T27 semgrep | Método de contraprova, gravidade, verificação de correção, varredura, modos; 29 classes de vulnerabilidade; frameworks, tecnologias, protocolos, nuvem; OWASP 2025; endurecer; listas de segurança | strix `analysis/*`, `scan_modes/*`, `vulnerabilities/*`, `frameworks/*`, `technologies/*`, `protocols/*`, `cloud/*`, `custom/*`, `owasp-top-10-testing`, `find-security-vulnerabilities-in-code`; addy `security-and-hardening`, `security-auditor`, `security-checklist`; ECC `security-reviewer`, `security-review`, `rules/security.md` | `K/seguranca/**` | Apache, MIT | "Antes de registrar um achado, leia `K/seguranca/metodo/contraprova.md` e `gravidade.md`." · "Quando o código usar <classe>, leia `K/seguranca/vulnerabilidades/<classe>.md`." (lote 8) |
| `revisor` | Nenhuma nova (usa `git diff` no modo "só a mudança") | Formato: semáforo + "o que funciona", até 15 achados com sistêmicos juntos, cobertura e "não verificado", Antes/Depois/Por quê, `arquivo:linha`; modo "só a mudança"; 5 eixos e rótulos; passe de veredito; `maxTurns`; contraprova; régua de pronto | jakub `better-interface`, `interface-review`; emil `review-animations`; Superfuture; apple-design-skill (ideia); addy `code-review-and-quality`, `code-reviewer`, `definition-of-done`, `doubt-driven-development`; impeccable `finish-reviewer`, `critique`; ECC `code-reviewer`, `contexts/review.md`; strix `counterevidence` | `fonte/agentes/nucleo/referencias/revisor/formato.md`, `K/metodo/revisar-mudanca.md`, `K/metodo/revisar-codigo.md` | MIT, Apache, ideia | "Na 2ª revisão da mesma entrega, leia `referencias/revisor/passe-de-veredito.md`." · "Quando revisar só a mudança, leia `K/metodo/revisar-mudanca.md`." (lote 9) |
| `curador` | T5 doutor, T10 eval de roteamento, T12 validadores, T13 links, T14 instalação limpa; opc. T11 evals de comportamento | Evals (pass@k, capacidade × regressão, avaliadores), impacto de skill, evals de roteamento e comportamento, relatar desvio sem corrigir de carona, contexto velho, limiar de aprendizado | ECC `eval-harness`, `continuous-learning`; addy `evals/`, `skill-impact.md`, `context-engineering`; impeccable `doctor`, `context.mjs` (ideia) | `K/metodo/evals.md`, `K/metodo/contexto.md` | MIT, Apache | "Quando medir se um agente melhorou, leia `K/metodo/evals.md`." · "Quando achar memória ou mapa velho, relate e não corrija sem pedido." |
| `planejador` | Nenhuma | Entrevistar (1 pergunta com palpite), especificar, quebrar tarefas, passagem entre agentes | addy `interview-me`, `spec-driven-development`, `planning-and-task-breakdown`; ECC `planner`, `orchestrate` | `K/metodo/**` | MIT | "Quando o pedido for vago, leia `K/metodo/entrevistar.md`." · "Quando quebrar em etapas, leia `K/metodo/quebrar-tarefas.md`." |
| `pesquisador` | T16 cache de WebFetch (opc.); opc. T22/T23 context7, T28 DevTools | Fonte oficial da versão instalada, 1 conceito por consulta, pesquisa isolada que devolve resumo, achados antes de recomendar, explicar referência visual (medido/derivado/inferido); cache de WebFetch opcional | addy `source-driven-development`, `sdd-cache`; context7 `find-docs`, `docs-researcher`; ECC `contexts/research.md`; jakub `explain-interface` | `K/metodo/fonte-oficial-da-versao.md`, `K/design/explicar-referencia.md` | MIT | "Quando a pergunta for sobre biblioteca ou API, leia `K/metodo/fonte-oficial-da-versao.md`." · "Quando pedirem 'como fizeram este site', leia `K/design/explicar-referencia.md`." |
| `redator` | Nenhuma | Texto de interface, ADR, doc que descreve o estado atual, modo Ler | jakub `better-writing`; impeccable `clarify`, `mode-read`; addy `documentation-and-adrs`; ECC `doc-updater` | `K/escrita/**`, `K/design/modos/ler.md` | MIT, Apache | "Quando escrever rótulo, erro ou confirmação, leia `K/escrita/texto-de-interface.md`." · "Quando registrar decisão técnica, leia `K/escrita/adr.md`." |
| `gerente-produto` | Nenhuma | Entrevistar, refinar ideia ("Não vamos fazer"), especificar, lançar em etapas com plano de volta, primeiro uso | addy `interview-me`, `idea-refine`, `spec-driven-development`, `shipping-and-launch`; impeccable `onboard` | `K/metodo/**`, `K/engenharia/lancar.md`, `K/design/primeiro-uso.md` | MIT, Apache | "Quando a ideia estiver vaga, leia `K/metodo/refinar-ideia.md`." · "Quando planejar um lançamento, leia `K/engenharia/lancar.md` (e a skill `checklist-lancamento`)." |
| `estrategista` | Nenhuma | Refinar ideia (diverge, converge, premissas que matam) | addy `idea-refine` | `K/metodo/refinar-ideia.md` | MIT | "Quando comparar direções, leia `K/metodo/refinar-ideia.md`." |
| `estrategista-marketing` | Opc. T4 imagem | Refinar ideia; telas e peças que convencem; ousar e encantar | addy `idea-refine`; impeccable `mode-persuade`, `bolder`, `delight`, `overdrive` | `K/metodo/refinar-ideia.md`, `K/design/persuadir/` | MIT, Apache | "Quando a peça for página de campanha ou de venda, leia `K/design/modos/persuadir.md`." |
| `comunicador-corporativo` | Nenhuma | Tom pelo risco, confirmação que nomeia o objeto e a consequência | jakub `better-writing`; impeccable `clarify` | `K/escrita/texto-de-interface.md` §tom | MIT, Apache | "Quando a mensagem for de erro, perda ou risco, leia `K/escrita/texto-de-interface.md` §tom." |
| `especialista-cs` | Nenhuma | Mensagens de erro e de estado vazio, primeiro uso | jakub `better-writing`; impeccable `onboard`, `clarify` | `K/escrita/texto-de-interface.md`, `K/design/primeiro-uso.md` | MIT, Apache | "Quando escrever resposta-padrão ou artigo de ajuda, leia `K/escrita/texto-de-interface.md`." |
| `engenheiro-dados` | T2 verificador | Migração, backend e banco, ClickHouse | addy `deprecation-and-migration`; ECC `backend-patterns`, `clickhouse-io` | `K/engenharia/migracao.md`, `K/engenharia/backend.md`, `K/dados/clickhouse.md` | MIT | "Quando migrar fonte ou modelo, leia `K/engenharia/migracao.md`." |
| `dev-powerbi` | T2 verificador (roda o verificador de regras do projeto) | Fatias verticais, doc oficial da versão, construir do desenho com tabela elemento × valor, tokens do tema | addy `incremental-implementation`, `source-driven-development`; jakub `build-design`; impeccable `extract` | `K/engenharia/incremental.md`, `K/design/construir-do-desenho.md` | MIT, Apache | "Quando construir a partir do gabarito, leia `K/design/construir-do-desenho.md`." |
| `analista-compliance` | Nenhuma | Gravidade calibrada; tabela de exceções com dono e validade | strix `severity_calibration` (ideia adaptada); addy `constraint-driven-development` (exceções) | `fonte/agentes/compliance/referencias/analista-compliance/gravidade-e-excecoes.md` | Apache, MIT | "Quando classificar risco, leia `referencias/analista-compliance/gravidade-e-excecoes.md`." |
| `especialista-lgpd` | Lê a coluna "Risco" da §3.2 (T3, T4, T11, T22–T26, T28) | Dado que sai para serviço externo (MCP, CLI); não logar dado pessoal; vazamento por IA | context7 `find-docs` (aviso de dados); addy `observability-checklist` **[HIPÓTESE]**; strix `information_disclosure`, `llm_prompt_injection` | `K/seguranca/vulnerabilidades/` + 1 arquivo próprio | MIT, Apache | "Quando o pedido envolver ferramenta que manda dado para fora, leia `referencias/especialista-lgpd/dados-para-terceiros.md`." |
| `advogado-contratos` | Nenhuma (confere a licença de T3 `modern-screenshot`, T7 e T19 antes da cópia) | Obrigações de MIT, Apache-2.0 e ISC ao copiar conteúdo | textos das licenças (`terceiros/*/LICENSE`) | `fonte/agentes/juridico/referencias/advogado-contratos/licencas-abertas.md` | — | "Quando o pedido for usar código ou texto de terceiro, leia `referencias/advogado-contratos/licencas-abertas.md`." |
| `analista-fpa`, `analista-tesouraria`, `contador`, `especialista-tributario`, `analista-rh`, `recrutador`, `analista-operacoes`, `comprador`, `especialista-esg`, `executivo-vendas` | Nenhuma | Nada específico dos 10 projetos | — | — | — | Recebem só o que vier pelo protocolo (Desculpas comuns, Sinais de alerta, revisor em contexto limpo) |

### 3.1 HIG (sem licença): o que escrever com as nossas palavras
Para `K/design/apple/`, uma página curta por tema, com link para a página pública
`https://developer.apple.com/design/human-interface-guidelines/<tema>`. Os temas são: `charting-data`, `charts`, `color`,
`dark-mode`, `typography`, `layout`, `accessibility`, `loading`, `feedback`, `writing`, `lists-and-tables`, `searching`,
`menus`, `pop-up-buttons`, `toggles`, `sidebars`, `tab-bars`, `buttons`, `pickers`, `onboarding`, `settings`, `materials`,
`motion`, `design-principles`, `branding`.
Só abri `charting-data` (pelo JSON público
`https://developer.apple.com/tutorials/data/design/human-interface-guidelines/charting-data.json`). Ela traz: mostrar o que
o dado ensina; gráfico simples, com mais detalhe sob demanda; rótulos acessíveis em cada valor. Os demais nomes vêm do
índice do apple-design-skill **[HIPÓTESE]**: páginas não abertas. O texto é da Apple: não copiar, nem traduzido.

### 3.2 Ferramentas (scripts, detectores, ganchos, MCP, CLI, servidores locais, validadores, modelos)

**Regras para todas:**
- **Nada roda instalador sozinho.** Ferramenta que precisa de instalação vira passo opcional no README e na skill
  `integracoes`. Antes de usar, o agente roda `node scripts/checar-ferramenta.js <nome>` (T31). Se não estiver instalada,
  ele avisa e segue sem a ferramenta.
- **Tudo o que copiamos é reescrito em Node**, sem `.sh`, para rodar igual no PowerShell e no Git Bash, sem dependência
  nova de npm.
- **Prova:** primeiro, a fixture com defeito tem de **falhar**. Depois, a fixture limpa passa, em Node 24, nos dois shells:
  - PowerShell: `node <script> <args>; $LASTEXITCODE`
  - Git Bash: `node <script> <args>; echo $?`
- **Rodar também numa pasta com espaço e acento no caminho:** é onde script de terceiro costuma quebrar.

| # | Ferramenta (origem) | O que faz | Depende de | Trazer como | Agente e quando | Prova aqui | Risco |
|---|---|---|---|---|---|---|---|
| T1 | Detector de interface (impeccable `scripts/detector/**`, `detect.mjs`) | Acha anti-padrões de interface sem IA. Motores: regex, HTML estático, navegador, contraste por imagem | Node ≥ 22. Os motores de navegador e imagem precisam de um navegador **[HIPÓTESE]** | **Cópia adaptada** (Apache) só dos motores regex e HTML estático, em `ferramentas/detector-interface/`. Os de navegador ficam opcionais | `designer-paineis`, `testador-qa`, ao revisar tela web | HTML com defeito conhecido → sai ≠ 0 com o achado; HTML limpo → sai 0 | Local, sem rede. Duplica o gancho se o impeccable estiver instalado |
| T2 | Verificador do projeto (ideia: `hook.mjs`, `hook-lib.mjs` e `hooks.json` do impeccable; ganchos prettier, `tsc` e `console.log` do ECC) | Após cada edição, roda nos arquivos editados o comando que o projeto declarar | Node 24 | **Nosso** `hooks/verificador.js`, com tempo-limite (5 s na edição, 30 s no Stop). O comando vem de `.claude/base/config.json` e pode ser o T1 ou o verificador de regras do projeto | Todos que editam; `dev-powerbi` com o verificador de regras | Caso no `testar-hooks.js`: comando que falha → aviso; sem config → silêncio; comando lento → corta e não trava | Executa comando declarado pelo usuário; lentidão |
| T3 | Modo live (impeccable `live-browser*.js`, `live-accept.mjs`, `live-commit-manual-edits.mjs`, `detect-csp.mjs`, `modern-screenshot.umd.js`, agente `manual-edit-applier`) | Escolher elemento na página aberta no navegador e gerar alternativas | Node, navegador, o servidor de desenvolvimento do projeto rodando. Injeta script na página **[HIPÓTESE]**, não lido | **Passo opcional.** A cópia é possível (Apache), mas `modern-screenshot` é de terceiro: conferir a licença antes | `designer-paineis`, **só quando o usuário pedir** | Servidor local de teste + página de exemplo; o usuário confirma na tela | Controla o navegador (`comum.md` item 7): nunca automático |
| T4 | Geração de imagem (impeccable `generate-image.mjs`, `lib/provider.mjs`, `embed-prompt.mjs`) | Gera imagem por um provedor externo | Node, chave de API, rede | **Passo opcional, desligado.** Chave só em variável de ambiente | `designer-documentos`, `estrategista-marketing`, a pedido | Sem chave → mensagem clara e saída ≠ 0; com chave → 1 imagem de teste | Dado sai, custo, segredo |
| T5 | Doutor (impeccable `doctor.mjs`, `lib/staleness*.mjs`) | Relata desvio entre os artefatos e o que a versão lê; nunca corrige de carona | Node | **Reescrito** como `scripts/doutor.js` para o nosso formato (`MAPA`, memórias, `PROPOSTAS`) | `curador`, ao fechar etapa | Fixture com mapa velho → relata; `git status` continua limpo | Baixo |
| T6 | Leitor de contexto (impeccable `context.mjs`, `context-signals.mjs`, `lib/design-parser.mjs`) | Carrega PRODUCT/DESIGN | Node | **Já temos** ("situe-se" + `PROJETO.md`); não copiar | — | — | — |
| T7 | Teardown (jakub `teardown/assets/*`: viewer, worker, geometria, projeção, fila de render, folha, tema, exportação, flipbook; `scripts/*.cjs`: build-viewer, check-viewer, proof, commands, config + 5 testes) | Página de ilustração técnica com exportação SVG/PNG/PDF e prova nos extremos | Node; navegador para ver **[HIPÓTESE]**: sem pacote npm, conferir os `require` | **Cópia inteira** (MIT) em `ferramentas/teardown/` | `designer-documentos`, quando pedirem ilustração técnica | Rodar os 5 `test-*.cjs`; alterar 1 valor de geometria → algum falha | Código de terceiro: revisar antes de copiar |
| T8 | Seletor de variantes (emil `prototype/PICKER.md`, jakub `variant/picker.md`, `state-machine/switcher.md`) | Troca a variante ou o estado por parâmetro na URL, sem mexer no componente | HTML/JS no projeto | **Cópia** (MIT) como modelos em `modelos/seletor-variantes/` | Designers, quando pedirem opções | Página de teste troca pela URL; depois da limpeza, a busca pelo nome do seletor não acha nada | Sobrar código de teste no projeto |
| T9 | Alternador de pior caso (emil `break-ui` + `CATALOG.md`) | Troca "dados de demonstração / pior caso" na entrada dos dados | HTML/JS | **Cópia** (MIT) em `modelos/pior-caso/` | Designers, `testador-qa` | Fixture com nome de 200 caracteres → o relatório aponta "Quebrado" | Baixo |
| T10 | Eval de roteamento (addy `scripts/run-evals.js`, `evals/cases/*.json`, `lib/execution-status.js`) | Casos positivos e negativos, piso de 95% em 1º lugar, alerta de descrições parecidas | Node, sem rede | **Cópia adaptada** (MIT) só da parte determinística, em `scripts/eval-roteamento.js`, contra `hooks/roteador.js`, `pacotes.json` e `sinonimos.json` | `curador`, antes de cada versão | Tirar 1 palavra de um pacote → cai abaixo do piso e sai 1; repor → sai 0 | Ajustar palavras aos casos |
| T11 | Evals de comportamento (addy `evals/plugin/*`, modo sessão do `run-evals.js`) | Roda o `claude` sem tela e confere se a skill dispara ou fica quieta | `claude` CLI, conta, tokens | **Passo opcional**, sob demanda | `curador`, ao mudar um agente | 1 caso que deve disparar e 1 que deve ficar quieto | Custo; o prompt vai ao provedor, como em qualquer uso |
| T12 | Validadores de estrutura (addy `validate-skills.js`, `lib/skill-lint.js`, `validate-commands.js`, `validate-artifact-paths.js`, `validate-versions.js`) | Estrutura das skills, caminhos citados, versões coerentes | Node | **Adaptar** (MIT) para dentro do `validar.js` | `curador`, `engenheiro-software`, antes do commit | Cada regra nova vista falhando numa fixture | Baixo |
| T13 | Validador de links (addy `validate-reference-links.js`) | Pede HEAD em cada link de referência | Node, rede | **Adaptar** como opção `--links` do `validar.js`, fora do padrão | `curador`, antes de versão | Link quebrado de propósito → erro | Rede; site que bloqueia robô dá falso negativo (o Figma deu 403) |
| T14 | Teste de instalação limpa (addy `.github/workflows/test-plugin-install.yml`) | Instala o plugin do zero e roda os testes | CI do GitHub; aqui, o `claude` CLI **[HIPÓTESE]** | **Adaptar** como `scripts/testar-instalacao.js` local | `curador`, antes de publicar | Instalar numa pasta temporária e rodar `validar.js` | Baixo |
| T15 | Portão de qualidade (addy `constraint-driven-development/scripts/quality-gate.mjs` + `references/floor-guard.md`) | Aplica limites sobre a saída de scanners, que às vezes saem 0 com achado | Node | **Cópia** (MIT) como modelo em `modelos/quality-gate.mjs` para o projeto do usuário | `engenheiro-software`, `testador-qa`, ao montar a régua | Relatório com achado → sai 1 | Baixo |
| T16 | Cache de WebFetch (addy `hooks/sdd-cache-pre.sh`, `sdd-cache-post.sh`, `sdd-cache-test.sh`) | Revalida a página por ETag/Last-Modified e devolve o cache se não mudou | bash + curl, rede | **Reescrito em Node** (`hooks/cache-web.js`), desligado por padrão, fora do git | `pesquisador` | Servidor local que responde 304 → cache; página sem validador → não guarda | Guarda a leitura resumida, que pode envelhecer |
| T17 | Simplify-ignore (addy `hooks/simplify-ignore.sh` + teste) | Esconde blocos marcados ao simplificar e os devolve depois | bash | **Reescrito em Node**, opcional, prioridade baixa | `engenheiro-software` | O bloco marcado volta intacto depois de uma edição simulada | Perder código se o Stop falhar (manter o backup do original) |
| T18 | Segredo no commit (addy `scripts/staged-secret-scan-test.js`; o scanner não foi localizado **[HIPÓTESE]**) | Procura chave no conteúdo preparado para commit | Node, git | **Regra** dentro do `travas.js` (lote 9) | Todos, antes do commit | Chave falsa preparada → bloqueia; sem chave → passa | Falso positivo |
| T19 | Ganchos de sessão (ECC original `scripts/hooks/{session-start,session-end,pre-compact,suggest-compact,evaluate-session}.js`, `scripts/lib/utils.js`) | Sugerir compactar (após 50 chamadas, depois a cada 25) e salvar o estado antes de compactar e no fim | Node | **Cópia adaptada** (MIT, do original): `hooks/compactar.js` e `hooks/retomar.js`, que grava `.claude/base/.retomar.md` | Orquestrador | `testar-hooks.js`: 50 chamadas simuladas → aviso na 50ª e na 75ª; PreCompact → arquivo criado; nada em `~/.claude` | Baixo; escreve só em `.claude/base/` |
| T20 | Ganchos bash do ECC (tmux, prettier, `tsc`, `console.log`, URL do PR) | Específicos de JS e tmux | bash, `npx`, tmux | **Não copiar**: o T2 cobre; tmux não existe no Windows | — | — | — |
| T21 | Gerenciador de pacotes (ECC original `scripts/lib/package-manager.js`, `setup-package-manager.js`) | Descobre npm, pnpm, yarn ou bun pelo lockfile | Node | **Cópia da função** (MIT) para o T2 e o `engenheiro-software` | `engenheiro-software` | Pasta com `pnpm-lock.yaml` → "pnpm" | Baixo |
| T22 | context7 MCP remoto (`plugins/claude/context7/.mcp.json`) | Doc da versão certa por MCP HTTP (`mcp.context7.com`) | Rede, serviço da Upstash; chave opcional | **Passo opcional**: o usuário cola o trecho ou roda `claude mcp add` | `pesquisador`, `engenheiro-software`, em pergunta de biblioteca | "Está instalado?": `claude mcp list` mostra `context7` **[HIPÓTESE]** do formato; 1 consulta a uma biblioteca pública | Dado sai (nunca código, nem segredo); termos do serviço |
| T23 | context7 CLI (`npx ctx7`) | Mesma função pela linha de comando | Node, rede; baixa o pacote ao rodar | **Opcional**, com versão fixa (não `@latest`) | Idem | `npx ctx7@<versão> --help` **[HIPÓTESE]** | Executa código baixado de terceiro |
| T24 | Registro 21st (`npx shadcn@latest add "https://21st.dev/r/..."`) | Copia um componente da comunidade para o projeto | Node, rede, projeto React + Tailwind com shadcn | **Opcional** | `engenheiro-software`, quando precisar de componente pronto | Conferir `package.json` e `components.json`; num rascunho (skill `rascunho`), 1 componente + build | Código de terceiro entra no projeto: passa pelo `revisor` e pelo `auditor-seguranca` |
| T25 | 21st MCP (`21st-dev/magic-mcp`, ISC) | Busca e gera componentes | Chave de API, rede | **Opcional** | `engenheiro-software` | `claude mcp list` | Dado sai; chave |
| T26 | strix CLI (`usestrix/strix`) | Teste de invasão com agentes num contêiner (proxy, navegador, shell), com `--max-budget` | Python, Docker, chave de LLM | **Opcional, nunca instalado pelo plugin** (o oficial é `curl \| bash` ou pip) | `auditor-seguranca`, quando o usuário pedir teste ativo de sistema próprio | "Está instalado?": `strix --version` e `docker info`; teste num app de exemplo local | Exploração ativa; manda código ao provedor; custo. Só em alvo próprio, com autorização escrita |
| T27 | semgrep (referência `strix/skills/tooling/semgrep.md`) | Análise estática | Binário ou Python | **Opcional** | `auditor-seguranca` | `semgrep --version`; 1 regra num arquivo com falha conhecida | Baixo, se rodar sem login **[HIPÓTESE]** |
| T28 | Chrome DevTools MCP (citado por addy `browser-testing-with-devtools` e jakub `explain-interface`) | DOM, console e rede ao vivo | Node, Chrome | **Opcional, só a pedido** | `testador-qa`, `pesquisador` | `claude mcp list` | Controla o navegador; a página aberta é dado, não instrução |
| T29 | `pull-hig.mjs` (apple-design-skill) | Baixa a HIG | Node, rede | **Não trazer**: sem licença, e o texto é da Apple | — | — | — |
| T30 | `idea-refine.sh` (addy) | Salva a página da ideia **[HIPÓTESE]** | bash | **Não precisa**: vira 1 passo no método | — | — | — |
| T31 | **Checar ferramenta (nosso, novo)** | Procura no PATH (`where` no Windows, `command -v` no Git Bash) e mostra a versão; nunca instala | Node 24 | **Novo** `scripts/checar-ferramenta.js` (lote 0) | Todos, antes de T3, T4, T11, T22–T28 | `node` → "instalado, v24…", sai 0; nome inexistente → "não instalado", sai 1, nos 2 shells | Nenhum |
| T32 | Exemplos de MCP (ECC `mcp-configs/mcp-servers.json`) | GitHub, Supabase, Vercel, Railway… | Tokens de cada serviço | **Só documentação**, com o aviso "< 10 MCP ativos" | — | — | Tokens no arquivo: nunca gravar no repositório |

## 4. Peso e carga sob demanda

| Conteúdo de origem (bytes da API) | KB | Vai para o contexto? |
|---|---|---|
| impeccable `reference/` (GitHub main) | 412 | Não. Lido sob demanda (~320 KB entram, sem `live`, `live-setup`, `generate`, `hooks`, `doctor`, `init` e `craft`) **[ESTIMATIVA]** |
| emil `skills/` | 304 | Não, sob demanda |
| jakub `skills/` (sem `teardown/assets` e `scripts`) | 328 | Não, sob demanda; `teardown` ferramentas 175 KB fora do contexto |
| addy skills + references + agents + commands | 414 + 68 + 25 + 18 = 525 | Não, sob demanda; evals 113 KB, scripts 221 KB e hooks 83 KB são ferramentas |
| ECC (tamanhos da cópia) agents + commands + skills + rules + contexts | 84 + 39 + 96 + 9 + 2 = 230 | Não, sob demanda |
| strix `vulnerabilities/` + resto de `strix/skills` | 302 + ~150 **[ESTIMATIVA]**, não medido | Não, sob demanda |
| context7 (regras e skill) | ~10 **[ESTIMATIVA]** | Não |
| HIG escrita por nós (25 temas × 2–4 KB) | 50–100 **[ESTIMATIVA]** | Não |
| **Total em disco** | **~2,2 MB** (+10 a 20% com a tradução **[ESTIMATIVA]**) | — |

- **Contexto principal:** quase nada muda. As descrições dos agentes continuam as mesmas. Entra só a descrição da skill
  `integracoes`, de ~0,4 KB **[ESTIMATIVA]**, e ela não dispara sozinha.
- **Contexto de cada agente:** + até 8 linhas de gatilho (~1 KB). Por pedido, no máximo 3 arquivos de até 15 KB cada, ou
  seja, ≤ 45 KB, como o impeccable faz (só o playbook do comando).
- **Arquivos a dividir** (> 15 KB): `new-work` 63,6 · `critique` 45,6 · `write-swift` 42,4 · `idea-refine` 41,2 (pasta) ·
  `document` 27,5 · `emil-design-eng` 27,1 · `apple-design` 23,0 · `ssti` 19,3 · `agentic_system_security` 16,7 ·
  `header_injection` 16,2 KB. Cada pasta temática ganha um `INDICE.md` (situação → arquivo).
- **Validador (lote 0):** arquivo de `conhecimento/` ≤ 15 KB; ≤ 8 linhas de gatilho por agente; todo caminho citado existe;
  todo arquivo copiado tem a linha de crédito.

## 5. Quantidades por destino

| Destino | Itens | Projetos |
|---|---|---|
| FUNDIR | 148 | apple 5 · emil 17 · jakub 14 · Superfuture 1 · addy 36 · context7 2 · 21st 1 · strix 16 · ECC 26 · impeccable 30 |
| INTEGRAÇÃO | 12 | context7 4 · 21st 2 · strix 3 · ECC 1 · impeccable 2 |
| VALIDADOR | 10 | apple 1 · emil 1 · addy 7 · impeccable 1 |
| GANCHO | 8 | addy 3 · ECC 4 · impeccable 1 |
| PROTOCOLO | 1 | addy 1 |
| NOVA-SKILL | 1 | `integracoes` |
| NOVO-AGENTE | 0 | — |
| JÁ TEMOS | 23 | addy 7 · context7 1 · ECC 11 · impeccable 4 |
| NÃO CABE | 20 (9%) | apple 2 · jakub 2 · addy 2 · context7 3 · 21st 3 · strix 1 · ECC 4 · impeccable 3 |
| **Total** | **223 linhas** | (um item agrupado, como os 29 arquivos de vulnerabilidade, conta como 1 linha) |

As 32 ferramentas da §3.2 detalham linhas que já estão no inventário e não somam de novo. A exceção é a T31, que é
nossa e nova. Ficam assim: **14 para copiar ou adaptar** (T1, T5, T7–T10, T12–T17, T19, T21), **2 regras nossas**
(T2, T18), **10 opcionais com instalação** (T3, T4, T11, T22–T28), **4 não trazer ou já temos** (T6, T20, T29, T30),
**1 só documentação** (T32) e **1 nova** (T31).

Os "não cabe" são outra plataforma (Codex, Gemini, Cursor, tmux), empacotamento, código do produto de terceiros ou duplicado
(`degraded/`, `craft.md`).

## 6. Lotes de construção (2 a 4 h cada, por agente ou grupo)

A outra frente está mexendo em: `hooks/travas.js`, `fonte/comum.md`, `revisor`, `auditor-seguranca`, `designer-paineis` e
a skill `checklist-lancamento`. Nada abaixo toca neles antes dos lotes 7 a 9. Arquivos novos em `conhecimento/` não conflitam.

| Lote | Tempo | Agentes / alvo | O que entra | Toca em arquivo da outra frente? |
|---|---|---|---|---|
| 0 | 2 h | Infra | Prova do caminho (agente lê arquivo do plugin) ou `.raiz-plugin`; **T31** `checar-ferramenta.js`; `terceiros/<8>/LICENSE`; `CREDITOS.md` com o commit de cada projeto; `validar.js`: caminho citado existe, linha de crédito, ≤ 15 KB, ≤ 8 gatilhos; o `advogado-contratos` confere os termos de cópia | Não |
| 1 | 3–4 h | `engenheiro-software`, `testador-qa` | `K/engenharia/**`, `K/plataformas/**` (addy, ECC do original, context7 regra, emil de engenharia, impeccable `optimize`/`adapt`/`ios`/`android`, apple em texto nosso); **T15**, **T21**; gatilhos + evals | Não |
| 2 | 3 h | `designer-documentos` + design comum parte 1 | `K/design/{tipografia,cor,layout,acessibilidade,piso-de-qualidade,critica,polimento,modos/ler,modos/persuadir}`, `K/documentos/ilustracao-tecnica.md`, **T7** `ferramentas/teardown/` | Não (só cria arquivos que o `designer-paineis` usará) |
| 3 | 3 h | Design comum parte 2 (sem ligar ao `designer-paineis`) | `K/design/movimento/**`, `pior-caso`, `variantes`, `construir-do-desenho`, `explicar-referencia`, `componentes`, `visualizacao`, `modos/operar`, `tela-nova/`, `revisao-tela`, `apple/` (25 temas, texto nosso); **T8**, **T9** em `modelos/` | Não |
| 4 | 2–3 h | `redator`, `comunicador-corporativo`, `especialista-cs`, `gerente-produto`, `estrategista`, `estrategista-marketing`, `planejador`, `pesquisador` | `K/escrita/**`, `K/metodo/{entrevistar,refinar-ideia,especificar,quebrar-tarefas,fonte-oficial-da-versao}`, `K/design/primeiro-uso.md`, `K/engenharia/lancar.md` (só um link para `checklist-lancamento`) | Não |
| 5 | 2–3 h | `curador` + skills `ultimate`, `rodada`, `criar-agente` + validadores | Eval de roteamento (positivos e negativos, piso, descrições parecidas), evals de comportamento, links, versões, instalação limpa, campos `disable-model-invocation`/`allowed-tools`/`maxTurns`; `ultimate` (contexto limpo, régua de pronto, padrões de orquestração, modelo e janela); `rodada` (ponto de controle, passadas limitadas); **T5**, **T10**, **T12**, **T13**, **T14** (T11 opcional) | Não |
| 6 | 2 h | `analista-compliance`, `especialista-lgpd`, `advogado-contratos`, `engenheiro-dados`, `dev-powerbi` | Arquivos próprios + gatilhos | Não |
| 7 | 3–4 h | `designer-paineis` | Gatilhos para `K/design/**`, método (carga por assunto, semáforo, passadas limitadas), evals | **Sim: só depois da outra frente** |
| 8 | 3–4 h | `auditor-seguranca` | `K/seguranca/**` (strix inteiro + addy + ECC), modos, gatilhos, evals; alinhar com `checklist-lancamento` sem duplicar | **Sim: depois** |
| 9 | 3–4 h | `revisor` + protocolo + ganchos | Formato do revisor, passe de veredito, `maxTurns`; seções "Desculpas comuns" e "Sinais de alerta" (padrão + `validar.js` + 30 agentes); ganchos **T19** (compactar, retomar), **T2** (verificador do projeto), **T18** (segredo no conteúdo, `travas.js`), **T16** e **T17** opcionais | **Sim: depois** |
| 10 | 2 h | Skill `integracoes` + README | Passos opcionais com checagem "está instalado?" (T31): **T22–T28**, T32; seção "Integrações opcionais" | Não |
| 11 | 3–4 h | Detector de interface | **T1** (motores regex e HTML estático, Apache) ligado como opção do T2; fixtures com defeito; prova nos 2 shells | Depois do lote 9 (usa o T2) |
| 12 | 2–3 h, opcional | Live e imagem do impeccable | **T3** e **T4** como passos opcionais, só a pedido; conferir antes a licença do `modern-screenshot` | Só se o usuário quiser |

## 7. Riscos

- **Caminho dos arquivos para o agente** (lote 0). Se falhar, nenhuma linha de gatilho funciona.
- **Duplicar o impeccable instalado:** dois donos para o mesmo pedido e dois ganchos em cada edição. Recomendo trazer o
  conteúdo como referência dos nossos agentes, sem o gancho do detector ligado por padrão.
- **Licença:** Apache exige marcar a alteração em cada arquivo e manter o NOTICE; MIT exige o aviso. Copiar sempre de um
  commit fixo, registrado no `CREDITOS.md`. ECC só do original.
- **Conteúdo de terceiro é dado:** revisar cada arquivo antes de copiar, por instrução embutida. Os arquivos do strix são
  modelos jinja: tirar a sintaxe de modelo.
- **Ferramentas de terceiros no Windows:** os `.sh` não rodam no PowerShell (reescrever em Node). Testar em pasta com
  espaço e acento. O gancho do impeccable exige Node ≥ 22 (o Node 24 atende).
- **Integrações mandam dado para fora** (context7, 21st MCP, imagem do impeccable) ou fazem varredura ofensiva (strix):
  só com o usuário ligando, e o strix só em alvo próprio, com autorização escrita.

## 8. Fontes

| Fonte | Quem publica | Interesse |
|---|---|---|
| `api.github.com/repos/...` (árvores, licenças, commits) | GitHub | Independente dos autores |
| https://github.com/dickwu/apple-design-skill | Autor independente | Divulgar a skill; a HIG é da Apple |
| https://developer.apple.com/tutorials/data/design/human-interface-guidelines/charting-data.json | Apple | Fabricante (a diretriz é dela) |
| https://github.com/emilkowalski/skills | Autor (designer) | Divulga a própria biblioteca (Sonner) |
| https://github.com/jakubkrehel/skills | Autor (revista Interfaces) | Divulga o próprio trabalho |
| https://www.figma.com/blog/try-these-10-skills-and-show-off-your-own/ | Figma | Promover skills do Figma |
| https://github.com/addyosmani/agent-skills | Autor (engenheiro do Google) | Projeto pessoal aberto |
| https://github.com/upstash/context7 | Upstash | Atrair para o serviço hospedado |
| https://github.com/serafimcloud/21st · https://github.com/21st-dev/magic-mcp | 21st.dev | Atrair para o catálogo |
| https://github.com/usestrix/strix | Strix | Atrair para a plataforma paga |
| https://github.com/WorldFlowAI/everything-claude-code · https://github.com/affaan-m/ECC | WorldFlowAI (cópia) · autor original | Divulgação |
| https://github.com/pbakaus/impeccable + cópia local 4.0.3 | Autor (Paul Bakaus) | Projeto aberto, com extensão e CLI |

Todas abertas em 2026-11-01. Fato que decide e tem 2 fontes: a licença do ECC original (campo `license` da API e o commit
que criou o `LICENSE`, ambos do GitHub). As licenças dos outros vêm de 1 fonte (API), e a pesquisa anterior confere com o
README em emil, jakub, addy, strix e impeccable.

## 9. Recomendação
Seguir os lotes 0 → 6 agora, porque não tocam na outra frente. Depois, 7 → 9 quando ela fechar. Por fim, 10 e 11; o 12 só
se o usuário pedir. Começar
pelo lote 0: sem a prova de que o agente abre o arquivo do plugin, nenhuma linha de gatilho funciona. O lote 1 vem em
seguida, porque é o de maior volume com licença livre (addy e ECC). **Principal risco:** conviver com o impeccable instalado.
Mitigação: conteúdo sem o gancho dele, e a skill `integracoes` deixa a escolha ao usuário.
