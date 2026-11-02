<!-- Adaptado de usestrix/strix/strix/skills/technologies/llm_applications.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-tecnologias-llm-applications-2; palavras=aplicacao com llm parte 2, seguranca de llm parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia aplicacao com llm parte 2 do guia | leia seguranca de llm parte 2 do guia; nao=escreva o texto da campanha de natal -->
## LLM04:2026 Supply Chain

Build an inventory beyond ordinary packages:

- base models, weights, tokenizers, configuration, adapters/LoRA, quantizations, and model-conversion outputs
- training, tuning, evaluation, and embedding datasets
- prompt/template repositories, skills, plugins, MCP servers, hosted model APIs, and model gateways
- Python/JavaScript/native dependencies, containers, drivers, accelerators, and serving infrastructure

For each component, record origin, owner, license/terms, exact revision or digest, hash/signature/attestation, review status, update channel, runtime downloads, and effective permissions. Resolve every model alias, branch, mutable tag, adapter, and custom-code dependency to the artifact actually loaded. Identify who can mutate the source, promotion record, cache, or registry and whether the promoted artifact matches its claimed identity.

Inspect model loading as code loading. Pickle-compatible weights, custom model/tokenizer code, conversion hooks, package installation, and remote-code trust options can execute during acquisition or load. Trace the selected loader, artifact format, revision, initialization hooks, and resulting process or file activity.

Trace model-generated dependency names through every package runner, installer, build file, and registry lookup. A fabricated package recommendation is LLM07 misinformation; accepting or auto-installing an unverified name, namespace, or registry artifact is the LLM04 supply-chain boundary. Verify ownership and provenance rather than treating a registry response alone as proof of safety.

Use `dependency_cve_scanning` for verified known-CVE software versions. A malicious or tampered model, dataset, adapter, prompt, or plugin is a different supply-chain finding and requires provenance plus behavioral or loader evidence.

## LLM05:2026 Data and Model Poisoning

Map who can contribute to every pre-training, fine-tuning, preference, feedback, evaluation, memory, and embedding dataset. Record moderation, approval, deduplication, weighting, precedence, versioning, rollback, and the delay before data affects production.

Test:

- targeted trigger/backdoor behavior versus broad quality degradation
- poisoned examples that survive normalization, deduplication, chunking, or retraining
- feedback loops where model output or user ratings become future training data
- shared memory or indexed content that persists across users, sessions, or releases
- compromised adapters, merged models, or fine-tuning jobs that alter only a narrow topic, identity, or trigger

Compare clean and candidate snapshots with a fixed evaluation corpus and repeated trials. Trace a candidate record into the exact training/index snapshot and demonstrate persistence plus a protected behavior change. One retrieved malicious instruction may be LLM01 rather than proof that the model or dataset was poisoned.

Classify provenance/distribution compromise under LLM04 and durable corruption of data, weights, adapters, templates, or model behavior under LLM05. Record both when one chain crosses both boundaries, but do not duplicate the same root cause.

## LLM06:2026 Unbounded Consumption

Inventory every resource multiplier:

- input and output tokens, context windows, image/audio/video/document processing, embeddings, reranking, and model tier
- requests per user/key/IP/tenant, concurrency, batch size, and organization-wide budget
- agent iterations, tool calls, peer-agent fan-out, retries, provider failover, and recursive workflows
- upload count/size, chunk count, index growth, queued/background jobs, and retained outputs
- streaming connections, disconnect cancellation, timeouts, cache behavior, and partial failures
- logprobs or repeated-query surfaces that increase extraction or model-replication risk

Model cumulative work, not isolated limits: depth × fan-out × retries × failovers × model/tool cost. Test limits at request, identity, tenant, and global layers. Confirm that alternate keys, endpoints, models, encodings, streaming, retries, and concurrent requests cannot bypass accounting. Verify cancellation stops upstream inference and tool work, and that failed/retried operations do not bill or enqueue without bounds.

Record measured requests, tokens, tool calls, queue growth, latency, and provider-side cost/usage. Increase load in controlled steps; do not infer denial of service, model extraction, or financial impact from the mere absence of a UI counter.

## LLM07:2026 Misinformation

Define a trusted answer set and the downstream decision before testing. Separate ordinary model fallibility from a security or business-logic flaw.

Exercise:

- absent, ambiguous, stale, and mutually contradictory sources
- fabricated, mismatched, or forged citations, quotations, evidence, and task-completion claims
- adversarial sources that rank above authoritative material
- confidence language and UI cues that overstate certainty
- generated code, policy, medical/legal/financial guidance, identity matching, fraud/risk decisions, and other outputs consumed without verification
- automated actions triggered by unsupported claims

Measure claim support, citation coverage and entailment, source authority, abstention, and decision error across a repeatable corpus rather than reporting one hallucinated answer. Report when unsupported output crosses a defined trust boundary or drives a protected decision without required verification; otherwise record it as a quality/reliability issue.

## LLM08:2026 Hidden Context Exposure

Inventory non-user-facing content available to the model: system and developer instructions, retrieved policy text, user-profile context, tool/function schemas, workflow criteria, internal roles, reasoning scaffolds, and operational configuration.

Test extraction, inference, and reconstruction separately. Compare purported hidden context with the deployed revision, a unique marker, or observed capability because models can fabricate plausible prompts and tool lists.

Classify the result by what it exposes:

- embedded credentials, tokens, private records, or connection material -> LLM02 disclosure, with LLM08 as the exposure path
- hidden rules, trust boundaries, tool schemas, or workflow logic that materially improve an attack -> LLM08
- authorization, filtering, or privilege controls that depend on hidden-context secrecy or model obedience -> the underlying deterministic-control failure
- generic instructions with no sensitive content, security reliance, or material attacker advantage -> no standalone vulnerability

Assume hidden context is discoverable. Keep secrets and security-critical decisions outside it, and test the underlying control even when exact prompt wording cannot be recovered.

## LLM09:2026 Vector and Embedding Weaknesses

Map ingestion authorization separately from retrieval authorization. Preserve source identity, tenant, document ACL, classification, retention, and deletion state through chunking, embedding, indexing, replication, reranking, and caching.

Test:

- authorization inside vector search, filtering after top-k but before context construction, and filtering only after the model sees candidates
- shared collections/namespaces and missing, inconsistent, or fail-open tenant filters
- metadata-filter injection, type confusion, duplicate keys, or precedence differences
- oversampling/reranking/hybrid-search stages that drop earlier authorization constraints
- stale embeddings after source ACL changes, deletion, tenant moves, or index rebuilds
- retrieval and answer caches keyed without user, tenant, role, corpus version, or filter state
- cross-tenant existence inference through IDs, scores, timing, citations, or chunk metadata even when final text is refused
- adversarial or duplicate content that dominates nearest-neighbor retrieval
- embedding export, inversion, reconstruction, or linkage when vectors are returned or broadly readable

Use at least two principals and distinct documents. Inspect raw candidate IDs, context-bound chunks, and the final answer. Post-search filtering may cause ranking interference or expose candidates to an intermediate service without proving that the model or user received another tenant's content; state the exact boundary crossed.

Do not apply LLM09 merely because an application retrieves documents. Require an embedding or vector-similarity property; route authorization flaws in vectorless retrieval to the conventional access-control or information-disclosure skill.

## LLM10:2026 Improper Output Handling

Treat every model-generated string, object, URL, code block, tool argument, control sequence, and structured-output field as attacker-influenceable.

Trace output into its actual consumer:

- HTML, Markdown, email, office-document, terminal, IDE, log, and rich-text renderers
- shell/process APIs, SQL/NoSQL queries, templates, expressions, interpreters, and generated code accepted into builds
- URLs, webhooks, redirects, image fetches, browser navigation, and server-side requests
- file paths, archive entries, object keys, configuration, logs, and serialized objects
- authorization, moderation, routing, pricing, eligibility, or workflow decisions

Validate with the sink-specific skill (`xss`, `sql_injection`, `nosql_injection`, `rce`, `ssrf`, `path_traversal_lfi_rfi`, `ssti`, or `insecure_deserialization`). JSON/schema conformance does not establish authorization or semantic safety; validate types, ranges, identities, destinations, and business rules after parsing.

## Reproducibility and Reporting

- Preserve application/model/prompt/tool/corpus versions and all generation parameters available to the application.
- Compare baseline and adversarial trials, record attempt and success counts, and distinguish deterministic application behavior from stochastic model behavior.
- Validate authorization, data origin, downstream effects, persistence, or measured consumption outside the model transcript.
- Split reports when weaknesses have independent reproductions, trust boundaries, owners, or remediations. Otherwise report one technical root cause and mention additional OWASP mappings as chain context.
- Use `create_dependency_report` only for verified advisory-matched dependency CVEs. Use (registro do relatório) for dynamically verified application, model, RAG, agent, or supply-chain findings.

## Summary

Test the LLM application as a data-and-authority system, not as a chatbot prompt. Complete 2026 coverage requires model behavior, application code, retrieval, tools, supply chain, downstream sinks, and resource controls to be evaluated together while keeping their root causes distinct.
