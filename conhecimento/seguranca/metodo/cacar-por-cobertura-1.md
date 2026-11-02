<!-- Adaptado de cloudflare/security-audit-skill/skills/security-audit/HUNTING.md @c1c8a8c, © 2025-2026 Cloudflare, Inc., MIT. Alterações: sem o procedimento de promoção de artefatos (trocado por uma regra curta); links para os arquivos daqui, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/cloudflare-security-audit-skill/. -->
<!-- ref: tema=seg-cf-cacar-por-cobertura-1; palavras=cacada por cobertura, critico de cobertura, cacada por cobertura no codigo; agentes=auditor-seguranca, revisor -->
<!-- teste-ref: sim=audite o sistema quanto a cacada por cobertura | o código pode ter critico de cobertura, confira; nao=faça o fechamento do orçamento de viagens -->
# Vulnerability Hunting

### Phase 2: Run coverage-led hunting waves

The parent assigns `planned` ledger units to `general` agents. Use enough focused hunters to cover the units without combining unrelated boundaries. One hunter may own closely related units in one subsystem; no unit may be silently unassigned because of an agent-count limit — a unit the budget cannot reach is explicitly `deferred` with reason `budget_cannot_reserve_critics_and_validation`.

When a budget or profile caps hunter count, assign units in priority order and record the ordering rationale in the ledger. Rank by: (1) unauthenticated or lowest-trust entry surfaces before authenticated ones; (2) boundaries protecting the most valuable resources (credentials, cross-tenant data, code execution, release authority); (3) prior-run gaps, revalidation targets, and changed source before same-source re-passes; (4) units whose class historically yields confirmed findings for this target type over speculative ones. Ties break lexicographically by `coverage_id` so runs stay deterministic.

Before launch, the parent changes assigned units to `in_progress`, sets a canonical lowercase `agent_id`, and creates that agent's `scratch/` and parent-owned `artifacts/`. Hunters read source and parent-provided context, write only to their unique `scratch/`, and return one structured result through the Task tool. They never write retained artifacts or edit target source, `architecture.md`, `coverage-ledger.json`, `findings.json`, or another agent's files.

## Required hunter prompt

Every hunter prompt contains these parts in this order:

1. A two-sentence role preamble: the hunter's goal is to find source-grounded security invariant failures in its assigned units, and it must return exactly one JSON object matching the structured-result contract at the end of this prompt.
2. `architecture.md` verbatim.
3. Assigned coverage IDs, subsystem, boundary, repository-relative starting paths, and each unit's assignment block map from `coverage-ledger.json`.
4. The exact selected blocks, copied verbatim: each selected ordinary attack-class block from `ATTACK-CLASSES.md`, and from each selected companion its `Core discipline`, each chosen attack-class subsection, `Universal moves`, and `Validation rules`. Ordinary blocks are self-contained and carry no companion-style `Core discipline`, `Universal moves`, or `Validation rules` sections. Do not send block or companion names alone.
5. Explicit excluded ordinary and companion blocks with a reason for each exclusion.
6. The core hunting method below, followed by the promotion procedure block.
7. The core validation rules below.
8. Carried same-source prior confirmed exclusions, each limited to fingerprint, title, and root cause, plus peer-owned current coverage IDs that this hunter must not duplicate.
9. The unique scratch/artifact paths, safe agent ID, predeclared promotion allowlist and byte limits, and the structured-result contract, including the Structured hunter result block below and the `confirmed` and `needs_validation` branches of `report-schema.json` copied verbatim.

A prompt may select several companion blocks when the same path crosses several domains. Keep their constraints together. Scope is the hunter's coverage obligation, not permission to duplicate excluded work. If an unexpected different boundary appears, return it under `uncovered` so the parent creates a stable ledger unit and assigns it in the next wave.

#### Core hunting method — include in every hunter prompt

```text
## Defensive vulnerability-finding method

Your goal is to find source-grounded security invariant failures and the smallest fix,
not to expand harm beyond the boundary result. Stay within source review and bounded local execution.
Do not contact deployed endpoints, provider APIs, registries, identity systems,
message brokers, shared services, or other users. Use local dummy data only.

READ THE CODE AT DEPTH. Follow each assigned input through parsing, identity,
authorization, normalization, state, derived copies, and the final sink. Read sibling,
legacy, batch, retry, cancellation, migration, and error paths that produce the same
effect. Compare sibling controls for equivalence, not only presence, and compare what
one component guarantees with what the next component assumes.

WORK FROM A CONCRETE INVARIANT:
1. Name the lower-trust principal and starting capability.
2. Name the accepted value, action, state transition, or resource selector.
3. Locate the control that should reject, bind, isolate, limit, or revoke it.
4. Trace the exact source path after that decision.
5. Stop at the smallest affected dummy record, wrong return value, process-integrity
   effect, or locally observable shared-resource effect.
6. State a source-level change and regression case that enforce the invariant.

DEPTH BOUND: trace only paths that can reach your assigned boundary or whose
guarantees that boundary relies on. Stop a line of investigation as soon as the
invariant is settled either way, and record the result in your structured output —
a covered, candidate, or blocked disposition, or an `uncovered` entry — instead of
continuing to search.

TEST SAD PATHS AND DISAGREEMENTS. Check absent, empty, zero, negative, maximum,
over-limit, duplicate, mixed encoding, stale, revoked, reordered, concurrent,
partially migrated, failed dependency, and rollback state only where the interface
accepts them. Compare canonicalization and units at every parser or policy handoff.
For multi-step issues, treat each output as a prerequisite and do not assume a later
boundary. If any prerequisite is not established, record a blocker.

When a proposed high or critical candidate reveals a reusable root cause, search paths
owned by the assigned coverage IDs for lexical, structural, and logical variants.
Consolidate the same root cause, but establish each variant's conditions and impact
independently. Do not investigate peer-owned units. Return a variant with no current
coverage unit as `uncovered`.

USE THE NARROWEST LOCAL CHECK THAT SETTLES THE CLAIM. Target-controlled builds,
tests, processes, browsers, emulators, fuzzers, and fixture processing may run only
inside the parent-approved OS-enforced sandbox. It must disable external networking,
start from an empty allowlisted environment, expose target and tools read-only, permit
writes only to your scratch directory, and apply low CPU, memory, process, file-size,
disk, and wall-clock limits. Isolated loopback is allowed only for a local fixture.
If any control is unavailable, do not execute: return needs_validation with that exact
blocker. Prefer an existing unit test, minimal function harness, dummy-tenant service
call, small malformed fixture, deterministic race schedule, or locally rendered policy.
Do not install or fetch tools.

Record the exact input, command, limits, and minimum result. For the environment,
record only allowlisted variable names and safe non-secret values needed to reproduce
the check. Never capture the ambient environment, inherited variables, credentials,
authentication state, or unrelated host paths. The target-controlled process writes
only in scratch. After the sandbox and all its processes terminate, only trusted
parent-side code may promote predeclared scratch-relative files, following the
promotion procedure block included verbatim in this prompt. You and target code never
write retained artifacts. If promotion is unavailable or fails for decisive evidence,
return needs_validation with the exact promotion blocker.
Never stress availability, invoke a live target, use a real credential, publish an
artifact, or continue past the minimum observed effect.

A deployment, browser, provider, broker, OS, proxy, package, secret, or identity fact
outside source is not proof either way. If one such fact is decisive, return a
needs_validation record with the exact missing observation and safe owner-observed check.
```

#### Promotion procedure (not copied)

Artifact promotion is not copied here (agentes-ultimate). The original procedure needs Unix no-follow descriptor calls. Rule here: a delegated agent writes only to its own scratch directory and returns its result to the main thread, which alone consolidates. On Windows race-safe promotion is unavailable: a scratch file is never evidence, and decisive local evidence stays `needs_validation` with that blocker. Default here: do not execute target code at all.

#### Core validation rules — include in every hunter prompt

```text
## Candidate gate

1. A candidate needs a complete repository-relative source trace and evidence for the
   claimed root cause, including the strongest source-visible control.
2. A proposed confirmed record needs a bounded local observed result, meaningful impact
   across a stated boundary, complete conditions, and no visible preventing layer.
3. Do not strengthen a crash into code execution, ordinary work into shared availability,
   or a same-principal action into privilege gain.
4. If a required fact is not source-visible or locally observable, use
   needs_validation. Name exact blockers; do not give it severity or speculative completion.
5. A missing best practice with no affected principal/resource is excluded or hardening,
   not a finding. A candidate disproved by source is not needs_validation.
6. Use the same source-derived fingerprint for the same root cause in every state.
   It must match `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$` and must not include a line,
   wave, agent, severity, or verdict.
7. Return an empty candidate array when nothing survives these gates.
```

## Local validation boundaries

Local execution is for confirmation, not impact expansion:

- **Allowed only in the required OS sandbox:** offline builds with present dependencies; isolated-loopback processes using dummy state; unit and integration tests; small fixture processing; sanitizers; bounded fuzz/regression tests; deterministic concurrency checks; local browser/emulator tests with dummy accounts; rendered manifests and policy evaluation with dummy identities; mocked external or paid calls.
- **Disallowed:** live or deployed traffic; requests to services not started for this isolated check; network dependency installation; real accounts or credentials; production data; shared queues, cloud resources, runners, registries, signing or release services; publishing; stress, saturation, or cost generation; any work after the minimum dummy-data boundary result.

The sandbox starts with an empty environment, gives target code no external network or host writable path, and enforces explicit low resource and time limits for every check, not only checks expected to be expensive. Scratch output remains target-controlled after exit. Promote it only with the no-follow, path-confined, regular-file, bounded-size host procedure in `SKILL.md`. Missing any sandbox or promotion capability does not erase a source-grounded candidate; represent the exact blocker in `needs_validation`.
