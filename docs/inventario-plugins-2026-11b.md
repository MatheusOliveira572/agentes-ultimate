# Inventário complementar: ponytail e security-audit-skill → agentes-ultimate (2026-11-02)

> Só inventário e proposta. Nada do plugin foi alterado e nada destes projetos foi instalado ou executado.
> Continua `docs/inventario-plugins-2026-11.md` (legenda, regra de crédito e numeração de ferramentas, T1–T32).
> **Desenho do plugin mantido:** cada conteúdo vai para o agente que faz sentido. O padrão é trazer.

**Pergunta:** quais repositórios são "ponytail" e "secrity-audit-skill", o que existe neles, para onde vai cada item e há
sinal de risco? **O que mudaria a decisão:** identificar o repositório errado, a licença, um sinal de envio de dados ou
de ampliação de permissão, e a sobreposição com o strix e com a skill `checklist-lancamento`.

## 1. Conclusão

| Nome pedido | Repositório mais provável | Certeza | Licença (API) | Fork? | Destino principal |
|---|---|---|---|---|---|
| ponytail | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | **Alta** | MIT | não | Regras e revisão para `engenheiro-software`, `revisor` e `curador`; **ganchos não vêm** |
| secrity-audit-skill | [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) | **Alta, mas é inferência**: o nome escrito não existe (busca exata = 0) e o usuário confirma | MIT | não | `K/seguranca/`, `auditor-seguranca`, 1 skill nova e 2 validadores |

**Sinal de risco:** nenhum sinal de roubo de dados, instalador oculto ou instrução maliciosa nas partes lidas. Há pontos (R1–R5, R10)
que justificam não instalar o ponytail inteiro, e 1 defeito que impede os validadores da Cloudflare de rodar no Windows
sem adaptação (§5). Nada malicioso **nas partes lidas** não é o mesmo que nada malicioso: o que não foi lido está em §6.

## 2. Candidatos

Dados da API em 2026-11-02. "Último push" = campo `pushed_at`.

### ponytail (388 repositórios com o nome)

| Repositório | Estrelas | Último push | Licença | O que é | Avaliação |
|---|---:|---|---|---|---|
| **DietrichGebert/ponytail** | 182.235 | 2026-10-29 | MIT | Plugin de Claude Code e outros agentes: código mínimo. v5.3.3 | **O mais provável.** O resto da lista deriva dele |
| ilindaniel/ponytail-lite | 235 | 2026-07-26 | MIT | Um único `AGENTS.md` | Derivado |
| AbdullahHameedKhan/karpathy-ponytail-skills | 60 | 2026-06-25 | `null` | Karpathy + escada do ponytail | Derivado; só a ideia |
| neptun-zuti/ponytail-hermes | 40 | 2026-06-14 | `null` | Porte para Hermes | Porte |
| coldbricks/paisley-ponytail | 24 | 2026-07-09 | MIT | Recupera fotos antigas | Sem relação |

`jan-klacan/ponytail` e `Aimer-zero/ponytail` apareceram na busca web e não foram abertos.

### security-audit-skill (149 com o nome; "secrity-audit-skill" = 0)

| Repositório | Estrelas | Último push | Licença | O que é | Avaliação |
|---|---:|---|---|---|---|
| **cloudflare/security-audit-skill** | 56.523 | 2026-09-14 | MIT | Auditoria em 6 fases com achados verificados | **O mais provável.** Nome exato; o blog da empresa confirma a origem |
| netresearch/security-audit-skill | 52 | 2026-10-30 | NOASSERTION | Auditoria em PHP | Nome exato, nicho, pouco uso |
| wrsmith108/claude-skill-security-auditor | 38 | 2026-02-10 | `null` | Auditoria com plano de correção | Só a ideia |
| toshipon/claude-code-security-audit-skill | 9 | 2026-10-26 | MIT | `/security-audit all` | Quase sem uso |
| smartchainark/skill-security-audit | 10 | 2026-02-09 | MIT | Detecta padrão malicioso **em skills de terceiros** | Outro objetivo: ver a pergunta abaixo |

Também vistos, com outro nome: `trailofbits/skills` (7.939 estrelas, CC-BY-SA-4.0: a cópia obrigaria a mesma licença) e
`berabuddies/Semia` (615, Apache-2.0, audita skills). **[HIPÓTESE]** não inventariados.

**Pergunta ao usuário:** "é o da Cloudflare, para auditar o código dos seus projetos?" Recomendação: sim. Se a intenção era
auditar **skills de terceiros antes de instalar**, o alvo muda (`berabuddies/Semia` ou `smartchainark/skill-security-audit`),
e este inventário não cobre isso.

## 3. Como foi feito (para refazer)

- **Buscas na API:** `search/repositories?q=ponytail`, `q=ponytail+in:name`, `q=security-audit-skill`,
  `q=security-audit-skill+in:name`, `q=secrity-audit-skill`, ordenadas por estrelas.
- **Buscas na web:** "ponytail plugin Claude Code skills agents github"; "security-audit-skill Claude Code skill github";
  "Ponytail Dietrich Gebert criticism review benchmark…"; "Cloudflare security-audit skill vulnerability discovery harness…";
  "Cloudflare blog vulnerability discovery harness…" (só em `blog.cloudflare.com`).
- **Metadados:** `api.github.com/repos/<dono>/<repo>`, `/commits?per_page=3`, `/git/trees/HEAD?recursive=1` (nenhuma árvore truncada).
- **Commits a fixar:** ponytail `96608e0` (2026-10-29), cloudflare `c1c8a8c` (2026-09-14).
- **Copyright (arquivo `LICENSE`):** "Copyright (c) 2026 DietrichGebert"; "Copyright (c) 2025-2026 Cloudflare, Inc.".
- **Ressalva:** as páginas passam por uma ferramenta que resume. Nomes, tamanhos e licenças vêm da API. A auditoria de
  código (rede, processos, arquivos) é a leitura feita por essa ferramenta. O `engenheiro-software` ou o `auditor-seguranca`
  confere o arquivo bruto antes de copiar. Item lido só pelo nome ou por tamanho está marcado **[HIPÓTESE]**.

## 4. Inventário

`K/` = `conhecimento/`. Crédito: `terceiros/dietrichgebert-ponytail/LICENSE` e `terceiros/cloudflare-security-audit-skill/LICENSE`,
primeira linha de cada arquivo no formato do inventário anterior, com o commit acima. Todos os itens com link "…" partem da
raiz do repositório daquele bloco. **Licença dos dois repositórios: MIT; nenhum é fork.** Exceção: `caveman-SKILL.md` é de outro projeto, sem aviso de licença, e não vem.

### 4.1 DietrichGebert/ponytail

| Item | O que faz | Destino | Detalhe | Link |
|---|---|---|---|---|
| `skills/ponytail/SKILL.md` (3,5 KB) | Escada: precisa existir? já existe? biblioteca padrão? dependência instalada? uma linha? o mínimo. Listar antes tudo o que a mudança toca. "Nunca cortar": validação, erro que evita perda de dados, segurança, acessibilidade | FUNDIR | → `K/engenharia/escada-do-minimo.md` (`engenheiro-software`). Complementa `padroes-codigo.md` e `simplificar.md`: estes tratam código pronto; a escada vem **antes de escrever** | …/skills/ponytail |
| Intensidades `lite`, `full`, `ultra` | Só sugerir a opção menor; aplicar; contestar o pedido antes de construir | FUNDIR | Seção do mesmo arquivo, **a pedido, sem modo persistente**. A ideia do `ultra` também serve ao `planejador` | …/skills/ponytail |
| Fechamento "o que pulou ou não verificou" | 1 a 2 linhas no fim da resposta | JÁ TEMOS | "Pendências" do protocolo comum | …/skills/ponytail |
| Comentário `shortcut: <limite>, <quando evoluir>` | Atalho consciente com limite escrito | FUNDIR | → `escada-do-minimo.md`; o `revisor` não reporta atalho marcado, salvo se a carga passou do limite | …/skills/ponytail |
| `AGENTS.md` | Versão compacta das regras | PROTOCOLO | 2 frases no método do `engenheiro-software`: listar o raio da mudança e a lista "nunca cortar". Ele **não** entra no `fonte/comum.md`: 30 agentes não escrevem código | …/AGENTS.md |
| `skills/ponytail-review` (5,1 KB) | Revisão do diff: ler quem chama, conhecer a carga esperada, cada achado com caso concreto; bug, risco, escala, teste, velocidade, enxugar | FUNDIR | → referência do `revisor`, só o que falta: **julgar pela carga esperada** e a categoria "enxugar". Não trocar o formato atual | …/skills/ponytail-review |
| `skills/ponytail-audit` (5,4 KB) | Mesma revisão no repositório inteiro; até 20 achados; termina em "Not checked" | FUNDIR | → `K/engenharia/auditar-repositorio.md` (`revisor`, `engenheiro-software`). Não altera código. Segurança profunda vai a `auditor-seguranca` | …/skills/ponytail-audit |
| `skills/ponytail-debt` (1,8 KB) | Junta os `shortcut:` por `git grep`; marca os sem gatilho | FUNDIR | → `K/engenharia/divida-de-atalhos.md`. Ampliar o padrão: o original só reconhece `#`, `//` e `/*` (faltam `--`, `;`, `<!--`) | …/skills/ponytail-debt |
| `skills/ponytail-gain` | Painel com ganhos | NÃO CABE | **Os números são fixos**, copiados do benchmark do autor, e não medem o projeto do usuário. Contraria "nunca invente dados" na tela | …/skills/ponytail-gain |
| `skills/ponytail-help` | Ajuda do produto | NÃO CABE | Sem conteúdo aproveitável | …/skills/ponytail-help |
| `hooks/ponytail-activate.js` | No início da sessão: grava estado, copia script para a pasta do Claude, injeta as regras e o mapa, manda o agente oferecer `statusLine` | NÃO CABE | Sinal R1 e R2 (§5). Sempre ligado duplica o protocolo e gasta contexto | …/hooks |
| `hooks/ponytail-subagent.js` | Injeta as regras em **todo** subagente | NÃO CABE | Sinal R2: atingiria redator, jurídico e finanças | …/hooks |
| `hooks/ponytail-mode-tracker.js`, `-runtime.js`, `-config.js`, `-instructions.js` | Troca e guarda o nível do modo | NÃO CABE | Só servem ao modo persistente, que não vem | …/hooks |
| `hooks/ponytail-map.js` (5,4 KB) | Mapa de funções, classes e exports por pasta, por regex, em até 2.000 caracteres; só leitura; sem rede | GANCHO | **T33, opcional.** Complementa o `MAPA-AUTO.md` (arquivos e quem cita quem) com os **símbolos** | …/hooks/ponytail-map.js |
| `hooks/band/metrics.ts` (14,7 KB) | Funções puras: custo, tokens, reuso (definições novas × existentes), testes | VALIDADOR | **T34, opcional.** Só a medida de reuso, reescrita em Node, para o placar. **Sem** `webhookRequest` | …/hooks/band |
| `hooks/band/board.ts` (45 KB) | Painel HTML de uma página, sem rede | FUNDIR | Só a ideia (KPIs, mapa de calor de atividade) para o `curador` avaliar no painel "Agentes agora". Código não vem | …/hooks/band |
| `hooks/band/register.tsx`, `ponytail-band-import.js`, `types.d.ts`, `claude-band.json` | Barra de tarefas; CSV por tarefa; webhook; importa as transcrições antigas | NÃO CABE | Sinais R3 e R4. Exige Claude Code ≥ 2.1.290 | …/hooks/band |
| `hooks/ponytail-statusline.{ps1,sh}` | Etiqueta do modo | JÁ TEMOS | A 0.7.0 tem barra própria | …/hooks |
| `benchmarks/agentic/README.md` + método | 3 braços (sem skill, versão anterior, versão nova), 39 tarefas, 5 execuções, mediana, IC 95% por bootstrap, checagens ocultas, juiz cego | FUNDIR | → `K/metodo/avaliar-skill.md` (`curador`, skill `criar-agente`). **Um dos itens de maior valor** | …/benchmarks/agentic |
| `benchmarks/agentic/*.py` (run, judge, tasks…) | Executor do benchmark | VALIDADOR | **T36, opcional, nunca automático**: roda `claude -p` e gasta dinheiro. **[HIPÓTESE]** código não lido | …/benchmarks/agentic |
| `benchmarks/results/2026-10-07-agentic.md` | Resultado e limites | FUNDIR | Citar como exemplo de relatório, com as ressalvas de §7. As versões de junho **não** (método criticado) | …/benchmarks/results |
| `benchmarks/*.js`, `promptfooconfig*`, `arms/` | Benchmark antigo | NÃO CABE | Método criticado (§7). `caveman-SKILL.md` é de outro projeto, sem aviso de licença: não copiar | …/benchmarks |
| `examples/` (11 arquivos) | Antes × depois da mesma tarefa | FUNDIR | 2 ou 3 casos em `escada-do-minimo.md`. Só `rate-limit` lido, e **tem defeito** (o `slowapi` exige `request: Request`): testar antes de copiar. Os outros **[HIPÓTESE]** | …/examples |
| `scripts/check-rule-copies.js` | Compara as cópias de regra com a fonte e procura frases-chave ("canários") | VALIDADOR | **T35.** Ideia para `validar.js`: frases do `fonte/comum.md` presentes em cada agente. Limite: confere presença, não sentido | …/scripts |
| `scripts/check-versions.js` | Versões iguais nos manifestos | VALIDADOR | Parte do T35, se `validar.js` não fizer. **[HIPÓTESE]** lido só o nome | …/scripts |
| `.github/CONTRIBUTING.md` | Mudar regra exige benchmark de 3 braços; sem ele, o PR é fechado | PROTOCOLO | Regra do `curador`: mudança em agente importante traz um eval antes × depois | …/.github |
| `.github/workflows/publish.yml` | Ações fixadas por SHA, publicação por OIDC, sem token guardado, permissões mínimas | FUNDIR | → exemplo em `K/engenharia/ci.md` | …/.github/workflows |
| `tests/hooks-windows.test.js` | Testes de gancho no Windows | VALIDADOR | **T37**, como modelo para os nossos ganchos. **[HIPÓTESE]** lido só o nome | …/tests |
| `docs/agent-portability.md` | Tabela de plataformas; "adaptadores finos" | FUNDIR | Referência do `curador`, se o plugin sair do Claude Code | …/docs |
| `.cursor/`, `.kiro/`, `.clinerules/`, `.windsurf/`, `.qoder/`, `.openclaw/`, `.opencode/`, `pi-extension/`, `__init__.py`, `commands/`, manifestos de outras plataformas | Adaptadores | NÃO CABE | O plugin é Claude Code | raiz |
| `scripts/uninstall.js`, `cursor-hooks.js`, `build-` e `publish-openclaw-skills.js` | Instalar e publicar | NÃO CABE | Sinal R5 | …/scripts |
| `README.md`, `INSTALL.md`, `i18n/`, `assets/`, `FUNDING.yml`, `docs/cursor-hooks.md` | Divulgação e instalação | NÃO CABE | Há patrocinadores e links de rastreamento no README | raiz |

### 4.2 cloudflare/security-audit-skill

Raiz dos arquivos: `skills/security-audit/`. Mantidos em inglês, como os do strix. **Limite do `validar.js`: 15 KB por
referência**, então 5 arquivos precisam ser divididos e entram com `-1`/`-2`, como já se fez com o strix.

| Item | O que faz | Destino | Detalhe | Link |
|---|---|---|---|---|
| `SKILL.md`, modos | Orientação (padrão: sem arquivos) × auditoria completa (só a pedido) | FUNDIR | → `K/seguranca/modos/orientar-ou-auditar.md`. **Cortar** "fix" (o auditor só relata) | …/SKILL.md |
| `SKILL.md` (22 KB), orquestração | 6 fases com subagentes novos: reconhecimento, caça, validação, saída, verificação, relatório | NOVA-SKILL | **`auditoria-completa`**, com `disable-model-invocation: true`. Motivo para ser skill: **agente nosso não chama agente**, então só a thread principal orquestra. Usa o `auditor-seguranca` nas ondas | …/SKILL.md |
| `RECONNAISSANCE.md` (15,9 KB) | Mapa estático: arquitetura, fronteiras, entradas, comandos proibidos; livro de cobertura | FUNDIR | → `K/seguranca/metodo/reconhecimento-{1,2}.md` | …/RECONNAISSANCE.md |
| `HUNTING.md` (22,4 KB) | Ondas por cobertura, invariante, críticos de cobertura, resultado em JSON | FUNDIR | → `metodo/cacar-por-cobertura-{1,2}.md`. Sem o trecho de promoção de artefatos | …/HUNTING.md |
| `VALIDATION-AND-REPORTING.md` (17,8 KB) | Verificador novo tenta refutar; 3 vereditos; relatórios | FUNDIR | → `metodo/validar-e-relatar-{1,2}.md`. Ver §4.3 | …/VALIDATION-AND-REPORTING.md |
| `ATTACK-CLASSES.md` (15,7 KB) | Índice de classes e de quando abrir cada bloco | FUNDIR | → `K/seguranca/classes-de-ataque-{1,2}.md`. **Cortar** "fix" e **limitar** a seção Wildcard ("until the invariant is settled"), sem teto de escopo | …/ATTACK-CLASSES.md |
| `WEB-PROTOCOL-AND-AUTH.md` (12,3 KB) | Cache, sessão, SAML, MFA, passkeys, mTLS | FUNDIR | → `K/seguranca/blocos/web-e-autenticacao.md`. **Novo:** SAML, MFA, passkeys, mTLS, cache | …/WEB-PROTOCOL-AND-AUTH.md |
| `CLIENT-SIDE.md` (8,6 KB) | DOM clobbering, postMessage, service worker, XS-Leaks | FUNDIR | → `blocos/cliente.md`; complementa `browser-security` | …/CLIENT-SIDE.md |
| `AI-AND-LLM.md` (10,6 KB) | RAG, memória, agência excessiva, MCP, subagentes | FUNDIR | → `blocos/ia-e-llm.md`; **útil para auditar o próprio plugin**. Sobrepõe em parte `llm-prompt-injection`, `agentic-system-security` e `llm-applications` | …/AI-AND-LLM.md |
| `SUPPLY-CHAIN-AND-RELEASE.md` (7,3 KB) | Origem de dependência, CI, assinatura, atualização | FUNDIR | → `blocos/cadeia-e-release.md`. **Conflito:** ver §4.3 | …/SUPPLY-CHAIN-AND-RELEASE.md |
| `CLOUD-AND-DEPLOYMENT.md` (8,3 KB) | IAM, contêiner, ingress, evento | FUNDIR | → `blocos/nuvem-e-implantacao.md`; método entre provedores, complementa `nuvem/` | …/CLOUD-AND-DEPLOYMENT.md |
| `PROTOCOLS-RPC-AND-MESSAGING.md` (7,5 KB) | gRPC, filas, replay | FUNDIR | → `blocos/protocolos-e-filas.md`. **Novo** | …/PROTOCOLS-RPC-AND-MESSAGING.md |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` (7,5 KB) | Amplificação, cotas, retry; proíbe estressar serviço real | FUNDIR | → `blocos/esgotamento.md`. **Novo** | …/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md |
| `DATA-ISOLATION-AND-LIFECYCLE.md` (7,8 KB) | Multi-inquilino, cache, backup, exclusão, retenção | FUNDIR | → `blocos/isolamento-e-ciclo.md`. **Novo.** Ligar ao `especialista-lgpd` (retenção e exclusão) | …/DATA-ISOLATION-AND-LIFECYCLE.md |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` (8,7 KB) | Deep link, webview, IPC local | FUNDIR | → `blocos/desktop-e-ipc.md`; complementa `electron-desktop-apps` | …/DESKTOP-MOBILE-AND-LOCAL-IPC.md |
| `MEMORY-SAFETY-AND-BINARY.md` (10,5 KB) | C/C++, FFI, kernel | FUNDIR | → `blocos/memoria-e-binario.md`. **Novo.** Prevê fuzzers: só leitura sem sandbox | …/MEMORY-SAFETY-AND-BINARY.md |
| `report-schema.json` (14,5 KB) | Contrato do achado por veredito; sem URL externa | VALIDADOR | **T38** | …/report-schema.json |
| `validate-findings.cjs` (28,8 KB) | Valida `findings.json`; só leitura; sem rede | VALIDADOR | **T38. Não roda no Windows sem adaptar** (§5, R6) | …/validate-findings.cjs |
| `validate-coverage-ledger.cjs` (33,5 KB) | Valida o livro de cobertura; só leitura; sem rede | VALIDADOR | **T39**, mesma adaptação | …/validate-coverage-ledger.cjs |
| `validate-*.test.cjs` (54,9 KB) | Testes dos validadores | VALIDADOR | Vêm junto, como prova. **[HIPÓTESE]** corpo não lido; ler antes de rodar | …/skills/security-audit |
| Regras de sandbox | Sem rede, ambiente vazio, alvo só leitura, limites; **sem isso, não executar** e o achado fica `needs_validation` | PROTOCOLO | Vai para o método do `auditor-seguranca`. **Padrão aqui: não executar o alvo** | …/SKILL.md |
| Proibições (produção, credenciais, publicar) | Não sondar serviço real nem copiar ambiente | JÁ TEMOS | `K/seguranca/INDICE.md` já limita; acrescentar "nunca copiar variáveis de ambiente" | …/SKILL.md |
| Procedimento de promoção de artefatos | Cópia segura por descritor, sem seguir link | NÃO CABE | Depende de chamadas de Unix; manter só o princípio: subagente escreve em rascunho, a thread principal consolida | …/HUNTING.md |
| `README.md` e `npx skills add` | Instalação | NÃO CABE | Nada é instalado. O próprio plugin alerta sobre `npx` (`dependencias/npx-confusion`) | …/README.md |

### 4.3 Segurança: comparação para não duplicar

| Assunto | strix (já em `K/seguranca/`) | Cloudflare | `checklist-lancamento` | Decisão |
|---|---|---|---|---|
| Quando se usa | Referência por classe | **Auditoria profunda de um repositório** | **Antes de publicar**, comportamento verificado | Papéis distintos: nenhum substitui o outro |
| Estados | `confirmed`, `ruled_out`, lacuna | `confirmed`, `rejected`, `needs_validation` + bloqueio e plano | Passou, Corrigido, Aberto… | Manter `contraprova.md`. Acrescentar a equivalência e exigir **bloqueio exato e plano** na lacuna (ganho real) |
| Gravidade | `severity-calibration.md` | Não passa do impacto demonstrado; `needs_validation` não tem gravidade | Crítico a Baixo | Régua atual fica; soma a regra da Cloudflare |
| Modos | `quick`, `standard`, `deep`, `diff` | Orientar × completo; perfis quick, standard, deep | — | Os de cima definem a **profundidade**; a skill define o **fluxo**. Em `deep.md`, "chain findings for maximum impact" continua limitado a alvo próprio |
| Classes | 29 guias prontos, com exemplos | Blocos por **tipo de alvo** | Roteiros | Índice novo por tipo de alvo aponta para os dois. Sem colar classe repetida |
| Revisão completa | — | Fluxo com subagentes | Roteiro 26: uma passada | O roteiro 26 fica e ganha um link: "para ir fundo, skill `auditoria-completa`". **Não copiar blocos para o checklist** |
| Dependência | `dependencias/` | "CVE conhecida não é achado por si só" | Item do bloco S | **Conflito com o passo 3 do auditor** (tabela e Crítico/Alto com motivo). Mantém-se o nosso; a regra da Cloudflare só separa "achado explorável" de "nota de endurecimento" |
| Cobertura e verificador novo | Não | **Sim: é a diferença principal** | Não | É o motivo de trazer |

**Limites a respeitar:** o `auditor-seguranca` já tem 7 linhas "Quando…", e o máximo é 8. Só cabe 1 nova ("auditoria completa →
skill `auditoria-completa`"); o resto entra pelo `INDICE.md`. Máximo de 3 referências por pedido continua. **Observação:** o
cabeçalho do `INDICE.md` cita `endurecer.md`, que não apareceu em `conhecimento/seguranca/`; cabe conferir.

## 5. Sinais de segurança

| # | Projeto | Sinal | Evidência | Gravidade **[ESTIMATIVA]** | O que fazer |
|---|---|---|---|---|---|
| R1 | ponytail | **Gancho manda o agente propor mudar `settings.json`** ("Proactively offer to set this up…"). O gancho não escreve no arquivo | `hooks/ponytail-activate.js` | Média: amplia configuração por instrução injetada | Não trazer |
| R2 | ponytail | Injeta regras em cada sessão e **em todo subagente**; copia script para a pasta do Claude a cada sessão | `ponytail-activate.js`, `ponytail-subagent.js` | Média: muda o comportamento de todos os agentes | Não trazer |
| R3 | ponytail | **Registro ligado por padrão** (`ledger: true`): grava em `~/.config/ponytail/band/` o projeto e o nome da tarefa, que pode ser a **primeira linha do prompt (até 60 caracteres)**. `band import` lê as transcrições de todos os projetos | `plugin.json`, `register.tsx`, `ponytail-band-import.js` | Média em projeto sigiloso; fica na máquina | Não trazer. Quem instalar sozinho: desligar `ledger` |
| R4 | ponytail | **Webhook opcional manda dados para fora**: projeto, sessão, custo, tokens e nome (`sendNames` ligado por padrão). Vazio por padrão; só https, salvo localhost; token no cofre do sistema | `plugin.json`, `metrics.ts`, `register.tsx` | Baixa enquanto vazio | Não trazer |
| R5 | ponytail | `uninstall.js` reescreve `settings.json` sem cópia e apaga pastas recursivamente; `publish-openclaw-skills.js` usa `shell: true` com argumentos concatenados (execução manual) | `scripts/` | Baixa | Não trazer |
| R6 | cloudflare | **Validadores recusam tudo no Windows:** exigem `O_NOFOLLOW` e `O_NONBLOCK` e lançam erro se faltarem. É proteção correta em Unix. **[HIPÓTESE]** que o Node no Windows não define essas constantes: não executado | `readFileWithinLimit` em `validate-findings.cjs`; mensagem igual no outro | Bloqueia T38/T39 | Adaptar (§6) sem enfraquecer em silêncio; ver falhar antes |
| R7 | cloudflare | **Sem `allowed-tools`**: a skill herda o que o agente tiver. Os subagentes podem executar código do alvo, se houver sandbox | `SKILL.md` | Média | A nossa skill declara ferramentas. Padrão: não executar o alvo |
| R8 | cloudflare | Relatórios detalham **vulnerabilidades em texto claro**; saída padrão em `~/security-audit-skill/<repo>/run-<N>` | `README.md`, `SKILL.md` | Média se a pasta sincronizar com a nuvem | Avisar antes; confirmar o destino; nunca em pasta versionada ou compartilhada |
| R9 | cloudflare | A versão descrita no blog terminava em envio a uma "API de ingestão". **Na versão atual não encontrei envio** | Blog × `README`, `SKILL`, `VALIDATION` | Informativa | Fixar `c1c8a8c`; rever a cada atualização |
| R10 | ambos | Atualização: instalar pelo marketplace ou por `npx skills` traz código novo sem revisão, e o ponytail executa ganchos a cada início | `skills/ponytail-help`, `INSTALL.md` | Média | Copiar de commit fixo, como os demais |

**Procurado e não encontrado nas partes lidas:** `postinstall` (o `package.json` só tem `test`), dependências, `curl | bash`,
`irm | iex`, `eval`, URL fixa de telemetria, pedido de credenciais, texto "ignore as instruções", pedido para dar estrela.
O INSTALL traz `--trust` para o Grok e pede confiar nos ganchos do Codex, sem efeito aqui. `vm.runInNewContext` em
`ponytail-subagent.js` só aplica uma regex de variável de ambiente, com limite de 100 ms.

## 6. Ferramentas (continua T1–T32)

Nada é instalado sozinho. Dependências na tabela; a checagem é `node "${CLAUDE_PLUGIN_ROOT}/scripts/checar-ferramenta.js"`, quando couber.

| ID | Ferramenta | Dependências | Como trazer | Prova no Windows (pasta com espaço e acento) | Risco |
|---|---|---|---|---|---|
| T33 | Mapa de símbolos (`ponytail-map.js`) | Node, git (com alternativa sem git) | Copiar com crédito; **sem** gancho de sessão ligado por padrão: acrescenta seção ao `MAPA-AUTO.md` ou roda a pedido | Rodar num repositório de teste; ver saída ≤ 2.000 caracteres, sem arquivo ignorado pelo git. A alternativa sem git não lê o `.gitignore`: testar também | Nomes de funções entram no contexto; sem rede |
| T34 | Medida de reuso (de `metrics.ts`) | Node, git | Reescrever em Node; opcional | Fixture com função reaproveitada × duplicada; os 2 casos | Baixo. Número indicativo: é regex |
| T35 | Canários de regra (`check-rule-copies.js`) | Node | Só a ideia, no `validar.js` | Tirar uma frase de um agente e ver **falhar**; repor e passar | Baixo; não confere sentido |
| T36 | Executor de benchmark (`benchmarks/agentic`) | Python, Claude Code, modelo pago | Só a pedido, depois de ler o código, e com o custo mostrado antes | 1 tarefa, 1 execução. O autor mediu cerca de US$ 0,14–0,20 por sessão; 585 sessões seriam da ordem de US$ 100 **[ESTIMATIVA: 585 × 0,17]** | **Gasta dinheiro**; Bash desligado no original |
| T37 | Modelo de teste de gancho (`hooks-windows.test.js`) | Node | Ler e adaptar a `hooks/` | `node --test` nos 2 shells | Baixo. **[HIPÓTESE]** não lido |
| T38 | `validate-findings.cjs` + `report-schema.json` | Node, sem pacote | Copiar de `c1c8a8c`, marcar a alteração. Em `win32`, usar `lstat` + checar arquivo regular e **avisar** que não há proteção contra troca entre a checagem e a abertura | **Primeiro** rodar sem alterar e registrar a falha (confirma R6). Depois: `findings.json` válido passa, e inválido, link simbólico e arquivo > 5 MiB falham | Baixo: só lê. A adaptação reduz a proteção: revisão do `auditor-seguranca` |
| T39 | `validate-coverage-ledger.cjs` | Node, sem pacote | Igual ao T38 | Igual; os testes `.test.cjs` adaptados | Igual |

**Sandbox no Windows:** o fluxo exige isolamento imposto pelo sistema (sem rede, ambiente vazio, alvo só leitura). Não há
prova de que temos isso aqui. Sem ela, o fluxo foi feito para deixar o achado em `needs_validation`: esse é o padrão proposto.

### Lido × não lido

- **Lidos:** ponytail: as 6 skills, `AGENTS.md`, `README`, `INSTALL`, `after-install`, `CONTRIBUTING`, `publish.yml`, os ganchos
  (`activate`, `subagent`, `mode-tracker`, `runtime`, `config`, `instructions`, `map`, `band-import`, `statusline.ps1`), `band/metrics`,
  `band/board`, `band/register`, os JSON de ganchos, `plugin.json`, `package.json`, `uninstall`, `cursor-hooks`, `check-rule-copies`,
  `publish-openclaw`, `.opencode/plugins/ponytail.mjs`, `pi-extension/index.js`, `__init__.py`, resultado de 2026-10-07. Cloudflare:
  todos os `.md`, o esquema e os 2 validadores.
- **Não lidos (auditar antes de copiar):** ponytail: `benchmarks/agentic/*.py` e `.env.example`, `tests/`, `test.yml`, `check-versions`,
  `build-openclaw`, `ponytail-statusline.sh`, `.opencode/plugins/ponytail-frontmatter.cjs`, 10 dos 11 `examples/`. Cloudflare: `validate-*.test.cjs`. As 110 e 148 issues abertas
  não foram lidas.

## 7. O que pesa contra cada um (procurado de propósito)

**ponytail**
- **O ganho anunciado é do próprio autor, e já foi corrigido uma vez.** Colin Eberhardt (CTO da Scott Logic) mostrou que uma
  frase, "Follow YAGNI principles, and one-liner solutions", venceu a skill no benchmark original, e o autor refez o teste. Ele
  admitiu que os 94% eram teto por tarefa. Fontes: blog da Scott Logic e InfoQ.
- **Resultado atual, de 2026-10-07:** −53% de linhas, −26% de custo, em 39 tarefas e só com Opus 5.5. Mas: checagens ocultas
  empatadas (87/90 × 86/90); 30/30 em segurança em todos os braços; **bugs detectados onde há teste caíram de 77% para 69%**;
  testes desnecessários subiram de 36% para 45%; juiz cego sem diferença contra o agente sem skill (p = 0,09); Bash desligado.
- **Peso real:** a regra é cerca de 3,5 KB. O plugin já tem "o mais simples" e YAGNI. O ganho está na **escada antes de escrever**,
  na lista "nunca cortar", no `shortcut:` e, principalmente, no **método de benchmark**. Daí o destino pequeno, sem ganchos.
- **As 182 mil estrelas não provam qualidade**; o projeto foi criado em 2026-06-12.

**cloudflare/security-audit-skill**
- **Custo:** muitos subagentes por auditoria. **[HIPÓTESE]** não medido. O blog diz que uma execução acha cerca de **metade** do
  que várias acham, e que falta persistência na versão original (o README atual trata execuções repetidas como cumulativas).
- **Sem prova independente de eficácia:** os números do blog (128 repositórios, 7.245 achados acionáveis) são do fabricante, e
  referem-se ao sistema maior, que **não foi liberado**. Os artigos de terceiros consultados só repetem o anúncio.
- **Parado desde 2026-09-14,** com 110 issues abertas. Código e método não foram feitos para Windows (R6).
- **Sobrepõe o strix** em web, nuvem e LLM (§4.3), e **pesa cerca de 183 KB** de `.md`: nunca carregar tudo.

## 8. Resumo e lotes

| Destino | ponytail | cloudflare | Total |
|---|---:|---:|---:|
| FUNDIR | 12 | 15 | 27 |
| NOVA-SKILL | 0 | 1 | 1 |
| NOVO-AGENTE | 0 | 0 | 0 |
| GANCHO | 1 | 0 | 1 |
| VALIDADOR | 5 | 4 | 9 |
| PROTOCOLO | 2 | 1 | 3 |
| INTEGRAÇÃO | 0 | 0 | 0 |
| JÁ TEMOS | 2 | 1 | 3 |
| NÃO CABE | 10 | 2 | 12 |
| **Itens** | **32** | **24** | **56** |

Peso sob demanda: ponytail, 21 KB nas 6 skills, de que entra menos da metade **[ESTIMATIVA]**; Cloudflare, 183 KB de `.md`.

| Lote | Tempo **[ESTIMATIVA]** | Alvo | O que entra | Atenção |
|---|---|---|---|---|
| 13 | 2–3 h | `engenheiro-software`, `revisor`, `curador` | `K/engenharia/{escada-do-minimo,auditar-repositorio,divida-de-atalhos}.md`, `K/metodo/avaliar-skill.md`, `ci.md`, T33, T35, T37, crédito | Toca `revisor` e `validar.js`: confirmar se há outra frente neles |
| 14 | 4–5 h | `auditor-seguranca` + `K/seguranca` | Métodos e blocos, equivalência em `contraprova.md`, índice por tipo de alvo, link no roteiro 26, gatilhos e evals | Toca `checklist-lancamento` só no link |
| 15 | 3–4 h | Skill `auditoria-completa` + T38, T39 | Fluxo na thread principal, ferramentas declaradas, aviso de destino e de custo, prova no Windows | Depende do lote 14 |
| Opcional | a pedido | T34, T36 | Medida de reuso; benchmark | T36 custa dinheiro |

## 9. Recomendação

**Trazer os dois, de commit fixo, sem instalar nem ligar ganchos de terceiros: primeiro o lote 14 + 15, depois o 13.** A Cloudflare
traz o que o plugin não tem (cobertura rastreada e verificador novo que tenta refutar); o ponytail acrescenta menos, e o principal
é o método de benchmark. **Restrição real:** agente do plugin não chama agente, e por isso a auditoria completa só existe como skill.
**Principal risco:** relatórios com vulnerabilidades detalhadas em texto claro numa pasta sincronizada (R8) e os validadores
adaptados ao Windows com proteção menor (R6). Volta atrás: arquivos novos, removíveis por lote.

## 10. Fontes (abertas em 2026-11-02)

| Fonte | Quem publica | Interesse |
|---|---|---|
| `api.github.com` (repositórios, árvores, commits, busca) | GitHub | Independente dos autores |
| https://github.com/DietrichGebert/ponytail | Autor | Divulga o projeto; tem patrocinadores e site próprio |
| https://github.com/DietrichGebert/ponytail/blob/main/benchmarks/results/2026-10-07-agentic.md | Autor | Mede o próprio produto |
| https://blog.scottlogic.com/2026/06/16/ponytail-yagni-and-the-problem-with-prompt-benchmarks.html | Scott Logic (Colin Eberhardt) | Crítico independente; consultoria |
| https://infoq.com/news/2026/08/ponytail-agent-skill-benchmark | InfoQ | Imprensa técnica, independente |
| https://github.com/cloudflare/security-audit-skill | Cloudflare | Fabricante; vende serviço de segurança |
| https://blog.cloudflare.com/build-your-own-vulnerability-harness/ | Cloudflare (Grant Bourzikas; 2026-06-18) | Fabricante; divulga o próprio sistema |
| https://korben.info/en/cloudflare-launches-ai-security-audit-skill.html · https://redreamality.com/blog/cloudflare-security-audit-skill-for-coding-agents/ | Blogs de terceiros | Só listados pela busca, **não abertos**; não sustentam nada aqui |
| `skills/checklist-lancamento/**`, `conhecimento/seguranca/**`, `fonte/agentes/software/auditor-seguranca.md`, `scripts/validar.js` | Este plugin | Estado local |

**Fatos que decidem e duas fontes:** identidade da Cloudflare = repositório na organização + blog da empresa com o link (mesma
origem; os artigos de terceiros não foram abertos, logo não contam como segunda fonte independente). Ponytail = API + InfoQ e Scott
Logic (independentes). Licenças = campo da API + arquivo `LICENSE` de cada repositório. Termos do MIT: seguem a regra do inventário anterior.
