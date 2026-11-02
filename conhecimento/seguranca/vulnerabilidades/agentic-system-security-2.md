<!-- Adaptado de usestrix/strix/strix/skills/vulnerabilities/agentic_system_security.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-vulnerabilidades-agentic-system-security-2; palavras=sistema de agentes parte 2, seguranca de agentes de ia parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia sistema de agentes parte 2 do guia | leia seguranca de agentes de ia parte 2 do guia; nao=escreva o texto da campanha de natal -->
## MCP Inspector (Conditional)

Use the official [MCP Inspector](https://github.com/modelcontextprotocol/inspector) only against a reviewed local/test server:

```bash
npx @modelcontextprotocol/inspector@<reviewed-version> --cli \
  --config reviewed-mcp.json --server test-server \
  --method tools/list --format json
```

- Before choosing MCP Inspector, inspect package-registry metadata, engine requirements, release notes, and advisories. Select a compatible reviewed version and pin that exact version for the run; do not infer safety from a release tag.
- Prefer CLI/TUI and loopback binding over exposing the web UI.
- Preserve the generated API token; never disable authentication or bind the process-spawning backend to an external interface.
- Do not publish ports 6274/6277 or pass through the Docker socket/host devices.
- `tools/list` is protocol-read-only, but launching/initializing an arbitrary stdio server executes it and list handlers can still have process-side effects. Review the server command/config first. Calling a tool can perform real external actions.
- Treat the inspected server command/config as executable; `npx` also downloads code, so pin a reviewed package version for repeatable or sensitive work.

## Regression With Promptfoo (Conditional)

[Promptfoo](https://github.com/promptfoo/promptfoo) can encode a bounded model/tool safety matrix after manual validation:

```bash
npx promptfoo@<reviewed-version> eval
```

- Resolve Promptfoo's runtime requirements, supported features, and security status from registry metadata and current upstream docs before choosing and pinning a version.
- Use synthetic prompts/data and a dedicated test provider/project.
- Provider calls transmit data externally and can incur cost even when evaluation orchestration is local. Set request/concurrency and spending ceilings.
- Pin model, provider, prompt, tool schema, retrieval corpus revision, and evaluator versions.
- Include allowed and denied controls across roles/tenants; use multiple runs for nondeterministic outcomes.
- Automated red-team labels are leads, not findings. Confirm the real tool call, data access, or side effect manually.
- Store redacted results; evaluation logs can contain system prompts, secrets, retrieved data, and tool arguments.

## Validation

A report must include:

1. initiating identity, tenant, model/runtime, and exact component versions
2. effective-authority map and relevant tool/resource schema
3. untrusted input source and decision boundary crossed
4. exact target-side operation or data access, with redacted audit evidence
5. denied identity/input and allowed control results across repeat runs
6. credential, feature, approval, environment, and user-interaction prerequisites
7. cleanup/revocation and a bounded regression case

## False Positives

- The model claims a tool ran but the target and audit log show no action.
- A listed tool cannot be invoked by the tested identity or validates arguments safely.
- A safety refusal changes wording but effective capability remains denied.
- Cross-session output is synthetic, cached public data, or hallucinated rather than another user's data.
- A scanner flags an instruction string without showing that it reaches a privileged decision or sink.
- A component has broad declared permissions but the runtime credential/network policy prevents the claimed access.

## Summary

Agent security is capability security. Map the real authority carried through models, tools, credentials, plugins, and delegated agents; validate authorization and approval at the target-side effect; treat every installed component as executable supply chain; and preserve each confirmed boundary failure as a bounded regression.
