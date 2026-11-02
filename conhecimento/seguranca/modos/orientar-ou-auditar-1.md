<!-- Adaptado de cloudflare/security-audit-skill/skills/security-audit/SKILL.md @c1c8a8c, © 2025-2026 Cloudflare, Inc., MIT. Alterações: tirado o cabeçalho da skill; destino da saída pela skill auditoria-completa; sem o procedimento de promoção de artefatos (trocado por uma regra curta); links para os arquivos daqui, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/cloudflare-security-audit-skill/. -->
<!-- ref: tema=seg-cf-orientar-ou-auditar-1; palavras=orientacao ou auditoria completa, modo de auditoria completa, orientacao ou auditoria completa no codigo; agentes=auditor-seguranca, revisor -->
<!-- teste-ref: sim=audite o sistema quanto a orientacao ou auditoria completa | o código pode ter modo de auditoria completa, confira; nao=faça o fechamento do orçamento de viagens -->
# Security Audit

Find vulnerabilities that violate a real trust boundary, then give owners the source evidence, safe reproduction, priority, and smallest effective fix. This is a defensive, source-first workflow. A candidate without a concrete affected principal, resource, or security outcome is not a confirmed finding.

## Operating modes

This skill is guidance by default. Loading it does not authorize the complete audit workflow or file creation.

- **Guidance mode**: For security questions, focused reviews, methodology, triage, or investigation of specific findings, use only the relevant parts of this skill. Do not automatically run all six phases, create an output directory, or write audit artifacts. You may launch focused agents when useful; they return results to the current task.
- **Full audit mode**: Use the complete workflow when the user explicitly asks to audit or pen-test a codebase, asks for a full, comprehensive, or end-to-end security review, or requests report artifacts. Run all six phases and write the files defined below.

If the request could mean either mode, ask one focused question before creating files or starting the complete workflow.

## Platform terminology

This skill is agent-neutral:

- **Parent** is the agent that coordinates the run and owns shared state.
- **Task tool** is the platform's delegation or sub-agent mechanism.
- **`research` agent** is a delegated agent for focused source exploration and factual verification.
- **`general` agent** is a delegated agent for broad investigation and bounded local execution.
- **`subagent_type:`** in a heading names which of these two delegated agent roles runs that work.

Use equivalent platform capabilities while preserving role, write-isolation, prompt, and independence boundaries.

## Universal execution safety

These rules apply in both operating modes. Source inspection is read-only. Run target-controlled builds, tests, processes, browsers, emulators, fuzzers, and fixture processing only inside an OS-enforced sandbox that provides all of these controls:

- no external network; use only an isolated loopback namespace when the check needs local client/server traffic;
- an empty environment populated from an explicit allowlist with safe values, with scratch-local `HOME`, temporary directories, and caches;
- a read-only target and toolchain, with the target-controlled process able to write only inside its assigned `scratch/` directory; and
- explicit low CPU, memory, process, file-size, disk, and wall-clock limits.

The agent, outside the target-controlled process, may make a disposable source copy in an assigned `scratch/` directory when a build must write beside source. In guidance mode, do not retain target-controlled files. In full audit mode, only trusted parent-side code may promote the minimum non-secret result to retained `artifacts/` using the procedure under Write isolation. Never expose a retained output directory (other than the agent's own assigned `scratch/`), another agent's directory, the host home directory, credentials, sockets, or shared services to target code. Do not install dependencies or let builds fetch them. Use only tools and dependencies already available locally. If every control cannot be enforced, do not execute target code: report the missing sandbox capability as a needs-validation blocker and give a safe validation plan.

Use dummy principals, fixtures, and secrets. Do not probe deployed endpoints, external services, shared infrastructure, production identities, other users' data, or live control planes. Do not test availability against a live or shared process, publish artifacts, alter releases, spend paid API quota, or continue beyond the minimum local effect needed to establish a defect. If the decisive fact is outside source or the sandboxed fixture, report it as needing validation.

## Full audit setup

In full audit mode, resolve these values before reconnaissance:

- **Skill directory**: the absolute directory containing this `SKILL.md`.
- **Target**: the absolute repository root under review.
- **Repo name**: a stable repository identifier from the directory or local Git remote.
- **Output directory**: a new writable directory outside the target, chosen and checked by the `auditoria-completa` skill (agentes-ultimate: outside any Git repository, never in a cloud-synced folder; the reports hold vulnerabilities in clear text). Use a directory inside the target only when the user explicitly selects it and the parent verifies that version control ignores the whole directory. Otherwise stop and request an external path.
- **Source ref**: the reviewed commit and whether the worktree is dirty. Do not treat unreviewed generated or modified files as another revision.

### Write isolation

The parent creates and is the only writer of shared run files:

- `run-metadata.json`
- `architecture.md`
- `coverage-ledger.json`
- `findings.json`
- `REPORT.md`
- `FINDINGS-DETAIL.md`
- `NEEDS-VALIDATION.md`

Each hunter or verifier receives a unique root under `<output-dir>/agents/<agent-id>/`, with separate `scratch/` and `artifacts/` directories. Canonical agent IDs match `^[a-z0-9][a-z0-9_-]{0,63}$` and must not equal a Windows device name such as `con`, `prn`, `aux`, `nul`, `com1` through `com9`, or `lpt1` through `lpt9`. Lowercase IDs prevent case-fold collisions. The agent and every target-controlled process may write only to `scratch/`; retained `artifacts/` is parent-owned, is never exposed to the sandbox, and is writable only by trusted parent-side promotion code. Agents may not change shared files, target source, retained artifacts, or another agent's directory. Do not use `/tmp` or the host home directory as a writable fallback.

Artifact promotion is not copied here (agentes-ultimate). The original procedure needs Unix no-follow descriptor calls. Rule here: a delegated agent writes only to its own scratch directory and returns its result to the main thread, which alone consolidates. On Windows race-safe promotion is unavailable: a scratch file is never evidence, and decisive local evidence stays `needs_validation` with that blocker. Default here: do not execute target code at all.


For a reproduced check, record the command, exact test input, sandbox limits, and only the allowlisted environment variable names plus safe non-secret values needed to reproduce it. Never capture or copy the ambient environment, inherited variables, credential values, authentication state, or unrelated host paths. Launch from an empty environment rather than trying to redact one after execution.

Before delegation, the parent writes `run-metadata.json` with at least `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget` (null if unset), `execution_policy: "sandboxed-source-and-local-only"`, selected companion files, prior-run paths, shared-file owners, and `run_status: "in_progress"`. Update metadata only when those facts change; candidate state belongs in the coverage ledger and `findings.json`.

## Full audit planning

The coverage, prior-run, profile, and budget requirements in this section apply only in full audit mode.

### Coverage and prior runs

No one pass is complete. Build a deterministic coverage plan before hunting and update it after every agent result. [RECONNAISSANCE.md](../metodo/reconhecimento-1.md) defines the stable coverage units and [HUNTING.md](../metodo/cacar-por-cobertura-1.md) defines coverage-critic waves. The parent alone updates the ledger.

If prior runs exist, read every compatible `coverage-ledger.json` and `findings.json` before planning the current run:

1. Compare the relevant current source with each prior record and unit. A prior source ref alone is not evidence that a path is unchanged.
2. Carry a prior `confirmed` record into the current candidate set only when its relevant source and conditions are unchanged and its evidence still meets the current contract. Link it to a current ledger unit seeded `planned`, preserve its fingerprint, exclude only that carried root cause from hunters, and send the carried record through the current final verification path; the Phase 3 verifier that re-checks it becomes that unit's assignment owner and moves it to `candidate`.
3. When relevant source for a prior `confirmed` record changed, create a current planned revalidation unit. Do not put that record on the hunter exclusion list. It remains confirmed only if current independent validation establishes the current path and result.
4. Make prior `needs_validation`, `deferred`, `blocked`, `out_of_scope`, and any changed-source unit current work. A still-external `needs_validation` record may be carried only after the current source trace is checked and linked by fingerprint to a current `planned` unit whose verifier re-check supplies its owner and evidence; the record keeps the unresolved blocker. These prior states never suppress a current unit.
5. A prior same-source covered unit may inform priority, but it remains visible in the current ledger. A prior `rejected` record suppresses only the unchanged failed claim, not coverage of its unit; changed evidence creates current work.
6. Read the prior profile and scope. A prior `quick` or scoped ledger contributes only its recorded evidence and gaps, never an implied "rest is fine."

If no prior ledger exists, say so in the final coverage statement. Never imply that one run exhausts the target.

### Run profiles and scope

During full audit setup, pick a profile from the user's request or propose one from the target's size and stakes. Record it in `run-metadata.json` (`profile`, `scope_paths`) and state it in the report. The default is `standard`.

- **`quick`** — a bounded pass for small targets, re-runs, or a fast first look. Coarsen ledger units to surface × boundary × attack class (subsystem uses the fixed canonical `profile/quick/all-in-scope-subsystems` identifier), run exactly one hunter wave followed by exactly one final coverage-critic pass, and use one fresh verifier per candidate for both candidate validation and final record verification. Do not launch a follow-up hunter wave: record the critic's accepted discoveries and reassignments as `deferred`.
- **`standard`** — the workflow as written.
- **`deep`** — for high-stakes or large targets. Split ledger units per subsystem and lifecycle mode, run critic waves to a clean pass, keep candidate validation and final record verification as separate fresh agents, and give `prior_covered_same_source` units an independent second pass.

A **scoped run** audits a subset: named paths, one subsystem, one companion domain, or the diff between two source refs. Seed ledger units only for in-scope surfaces and record everything else as `out_of_scope` — never as `covered`. A scoped or `quick` run must present itself as partial coverage.

Profiles change breadth and redundancy, never the evidence bar. Do not scale away the candidate gate, the source/local execution boundary, `needs_validation` discipline, schema validation, or independent verification of `confirmed` records.
