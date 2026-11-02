<!-- Adaptado de usestrix/strix/strix/skills/technologies/llm_applications.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-tecnologias-llm-applications-1; palavras=aplicacao com llm, seguranca de llm, aplicacao com llm no codigo; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=audite o sistema quanto a aplicacao com llm | o código pode ter seguranca de llm, confira; nao=faça o fechamento do orçamento de viagens -->
# LLM Application Security

Use this as the umbrella workflow for the [OWASP Top 10 for LLM Applications 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/). Load `llm_prompt_injection` for deeper LLM01 testing and the relevant conventional vulnerability skill when an LLM-controlled value reaches a browser, query, command, URL, file, or authorization sink.

Treat the identifiers as a coverage taxonomy, not as report titles. Classify a finding by its technical root cause and affected trust boundary. One exploit chain may contain several OWASP categories, while one root cause should not become ten duplicate reports.

The LLM list covers the model as a component of an application. When a model acts through tools, persistent memory, peer agents, or autonomous workflows, apply this list and pair the assessment with the OWASP Top 10 for Agentic Applications 2026; do not force every agentic failure into an LLM category.

## Architecture and Evidence Map

Map the complete system before testing prompts:

```text
users / tenants / external content
  -> API, UI, file and multimodal ingestion
  -> prompt builder, policy and orchestration
  -> model/provider and context window
  -> memory, cache, RAG retrieval and vector index
  -> tools, MCP servers, plugins and peer agents
  -> output parsers, renderers and downstream systems
  -> logs, traces, feedback, evaluation and training pipelines
```

For every edge, record:

- **Data authority:** who creates, reads, updates, deletes, approves, and owns the data; tenant and sensitivity; retention and training use.
- **Action authority:** caller identity, downstream identity, permissions, authorization checks, confirmation, transaction boundaries, and audit evidence.
- **Transformation:** serialization, chunking, embedding, retrieval, reranking, prompt placement, output parsing, and cache keys.
- **Runtime identity:** application build, provider, model and revision, prompt revision, tool set, feature flags, corpus/index snapshot, temperature/seed where available, and quota policy.

Do not treat the model as an authorization principal or a trusted parser. Put deterministic authentication, authorization, validation, and policy enforcement outside the model.

## 2026 Coverage Matrix

| OWASP 2026 risk | Security invariant to test | Primary route |
|---|---|---|
| LLM01:2026 Prompt Injection | Untrusted instructions cannot cross a meaningful policy or authority boundary | `llm_prompt_injection` |
| LLM02:2026 Sensitive Information Disclosure | A response, context, cache, trace, training path, or retrieval result reveals only data authorized for the caller | This skill + `information_disclosure` |
| LLM03:2026 Excessive Agency | Tools expose only required functionality, permissions, and autonomy, with complete mediation at the action | This skill + `broken_function_level_authorization` / `business_logic` |
| LLM04:2026 Supply Chain | Every model, adapter, dataset, tokenizer, prompt, plugin, package, image, and hosted API has verified provenance and an immutable deployment identity | This skill + `dependency_cve_scanning` / `source_aware_sast` |
| LLM05:2026 Data and Model Poisoning | Attacker-influenced training, tuning, feedback, memory, or embedding data cannot persistently alter protected behavior unnoticed | This skill |
| LLM06:2026 Unbounded Consumption | Every request, recursive action, queue, and billable operation has enforceable cumulative resource and cost bounds | This skill + `business_logic` / `race_conditions` |
| LLM07:2026 Misinformation | Unsupported output cannot silently drive a security-sensitive or high-impact decision | This skill + `business_logic` |
| LLM08:2026 Hidden Context Exposure | Hidden instructions and operational context contain no secrets and reveal no security-relevant logic or capability that materially increases attacker power | This skill + `llm_prompt_injection` / `information_disclosure` |
| LLM09:2026 Vector and Embedding Weaknesses | Ingestion and retrieval preserve tenant, source, document authorization, and embedding confidentiality across the index lifecycle | This skill + `idor` / `information_disclosure` |
| LLM10:2026 Improper Output Handling | Model output remains untrusted until the actual downstream grammar and sink validate it | This skill + the sink-specific vulnerability skill |

## Assessment Workflow

1. Inventory every LLM-backed feature, model endpoint, ingestion route, retrieval source, tool, output consumer, and feedback/training path.
2. Build the data-and-authority map above for each user role and tenant.
3. Create a test matrix across application build, model/revision, prompt revision, tool configuration, identity, corpus snapshot, and quota tier.
4. Use controlled records with distinct per-user and per-tenant markers to distinguish context, retrieval, cache, memory, and training leakage.
5. Establish a normal baseline and matched negative control before adversarial variants. Run repeated trials and report success counts because model behavior is stochastic.
6. Validate the application-side effect, retrieved record, rendered sink, downstream authorization result, resource meter, or persistent model change. Model narration alone is not evidence of that effect.
7. Label each claim **architecture-confirmed**, **dynamically verified**, **candidate**, or **disproven**. Do not turn an unsafe architecture property into a claimed exploit, or ignore a confirmed control defect merely because downstream impact has not yet been exercised.
8. Report the smallest technical root cause that explains the demonstrated impact, then document related OWASP categories as chain context.

## Source Review

Trace source to sink around:

- provider SDK calls, local inference servers, model gateways, and fallback providers
- system/developer prompts, templates, message-role conversion, context truncation, reasoning channels, and prompt caches
- file, URL, email, image/audio/video, connector, tool-result, peer-agent, and memory ingestion
- embedding generation, collection/namespace selection, metadata filters, reranking, hybrid search, and retrieval caches
- function/tool definitions, MCP clients/servers, generic HTTP/shell/SQL tools, peer-agent delegation, and approval handlers
- model output parsers, HTML/Markdown renderers, terminals/IDEs/logs, code execution, query builders, URLs, file paths, templates, and policy decisions
- training/fine-tuning jobs, adapters, datasets, feedback stores, evaluation corpora, model registries, and runtime downloads
- token accounting, request limits, concurrency, retries, agent-loop depth, fan-out, async queues, streaming cancellation, and provider billing

Record both forward and reverse reachability: attacker-controlled input to privileged consumer, and privileged consumer back to every input or model output that can influence it.

## Optional Tool Routing

Use tools only when they match the deployed surface. Resolve compatible versions, runtime requirements, maintenance status, and advisories from registry metadata and current upstream documentation, then pin the exact reviewed versions for the run. Treat generated cases and scanner labels as leads until the application-side boundary is validated.

- **[Promptfoo](https://github.com/promptfoo/promptfoo)** — use for repeatable model/application trials, custom adversarial cases, graders, provider comparisons, and success-rate regression. Install the reviewed version locally with `npm install --save-dev --save-exact promptfoo@<reviewed-version>`, then invoke `./node_modules/.bin/promptfoo redteam run`. Define explicit plugins, assertions, `numTests`, `maxConcurrency`, and `delay`; provider calls may transmit test data and incur cost. Inspect the installed `owasp:llm` preset's category mapping and actual tests before claiming coverage; add cases for gaps against the assessment's chosen taxonomy.
- **[MCP Inspector](https://github.com/modelcontextprotocol/inspector)** — use for LLM01/LLM03 surface mapping when MCP servers are present. Install the reviewed version with `npm install --save-dev --save-exact @modelcontextprotocol/inspector@<reviewed-version>`, then use `./node_modules/.bin/mcp-inspector --cli --config <reviewed-config> --server <name> --method tools/list` and the equivalent `resources/list` / `prompts/list` operations. Starting a stdio server executes that configured process, initialization/list handlers may have side effects, and `tools/call` can perform the real action; inspect the target and credentials before invoking it.
- **[ModelScan](https://github.com/protectai/modelscan)** — use for LLM04 static triage of supported H5, Pickle, and SavedModel artifacts before loading them, for example `uvx modelscan==<reviewed-version> -p <artifact>`. Run it as an untrusted-file parser in an isolated analysis environment. A clean result covers only the scanner's supported formats and signatures; it does not establish artifact provenance, integrity, or absence of behavioral backdoors.

## LLM01:2026 Prompt Injection

Load `llm_prompt_injection` and test direct, indirect, stored, cross-modal, tool-result, memory, intermediate-reasoning, and multi-turn instruction paths. Include content from web pages, documents, messages, metadata, OCR, images/audio/video, retrieved chunks, tools, MCP servers, and peer agents.

For each delivery path, record provenance as untrusted, semi-trusted, or trusted-by-the-operator but attacker-writable through another workflow. Test plain, split, multilingual, encoded, invisible-Unicode, and multimodal representations where the deployed preprocessing makes them relevant.

Define the violated invariant before testing: unauthorized data access, an unauthorized action, corruption of a protected decision, persistent behavior change, or unsafe downstream output. A jailbreak or changed tone without a security-relevant boundary is not automatically an application vulnerability.

Distinguish:

- **Prompt injection:** input changes model behavior contrary to application policy.
- **Jailbreak:** model safety behavior is bypassed; application impact depends on the product's requirements and connected capabilities.
- **Poisoning:** attacker influence persists in training, feedback, memory, or an indexed corpus and affects later users or decisions.

## LLM02:2026 Sensitive Information Disclosure

Inventory sensitive data in prompts, reasoning or scratchpad traces, retrieved chunks, tool results, memory, caches, logs, training/feedback stores, model outputs, and provider retention paths.

Test separately for:

- cross-user and cross-tenant context, memory, cache, and retrieval leakage
- secrets or private records inserted into prompts, tool schemas/results, errors, traces, or telemetry
- retained user content later used for training, evaluation, or another user's response
- training-data membership or memorization when the tested model and data provenance make that claim meaningful
- model/provider options that expose logits, log probabilities, hidden metadata, raw context, or internal reasoning

Use distinct markers for each principal and storage stage. A fabricated secret or hallucinated record is not disclosure; correlate the output to a real record and its unauthorized source.

## LLM03:2026 Excessive Agency

Create a capability ledger for every tool and peer agent:

```text
tool -> exposed operations -> downstream identity -> permissions
     -> caller/user binding -> argument validation -> authorization
     -> side effects -> retry/idempotency -> audit evidence
```

Test the three independent causes:

- **Excessive functionality:** unused, generic, administrative, shell, arbitrary-URL, or broad CRUD tools remain callable.
- **Excessive permissions:** tools use a shared/service identity or scopes broader than the initiating user and requested operation.
- **Excessive autonomy:** consequential actions execute without human or deterministic authorization appropriate to the exact action, object, arguments, identity, and current state.

Tool descriptions, model instructions, hidden channel names, and confirmation prose are not authorization controls. Enforce authorization again at the tool/downstream system. Test delegation, recursive plans, retries, race/state changes between approval and execution, and whether untrusted tool results become new instructions.

Prove the accepted tool call and downstream result. A model saying it invoked a tool is not evidence that the action occurred.
