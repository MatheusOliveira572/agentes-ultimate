<!-- Adaptado de usestrix/strix/strix/skills/vulnerabilities/ssti.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-vulnerabilidades-ssti-2; palavras=ssti parte 2, injecao de template parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia ssti parte 2 do guia | leia injecao de template parte 2 do guia; nao=calcule a folha de pagamento do mês -->
## Post-Exploitation

- Environment dump (`env`, `os.environ`, `System.getenv`) — credentials, cloud metadata tokens, internal URLs
- Cloud metadata fetch (`http://169.254.169.254/latest/meta-data/`, `http://metadata.google.internal/`) — IAM tokens
- Read filesystem secrets (`.env`, `.aws/credentials`, `~/.ssh/`, `/proc/self/environ`)
- Lateral via internal HTTP — service mesh endpoints reachable from the rendering host
- Persistence: cron, scheduled task, systemd unit, `~/.ssh/authorized_keys`, web shell in webroot

## Testing Methodology

1. **Find templated input** — anywhere a server clearly templated user input (preview panes, email previews, dynamic dashboards, custom fields)
2. **Fingerprint the engine** — run the differential probe table; confirm with a second probe
3. **Confirm evaluation, not reflection** — `<valor>` rendering as `49` (not `<valor>` literally) is the line between XSS and SSTI
4. **Probe sandbox state** — try `<valor>`, `<valor>`, `<valor>`, `<valor>` (Jinja); `${self}`, `${T(java.lang.Class)}` (Java); `<%= self %>` (Ruby) — reachable globals are the gadget pool
5. **Enumerate gadgets** — class walk for Python / Node, reflection for Java, `require` chain for Node
6. **Reach RCE** — pick the shortest gadget chain to a shell-equivalent primitive
7. **Validate side effects** — DNS callback, file write, sleep — anything observable that proves execution

## Validation

1. Show evaluated output for two distinct expressions (`<valor>` → `49` and `<valor>` → `56`) to rule out coincidence or hard-coded reflection
2. Demonstrate object access (`<valor>`, `${T(java.lang.Class)}`) confirming runtime reflection
3. Demonstrate side effect — DNS lookup to attacker-controlled domain, sleep with measurable delta, file written to a known path
4. For RCE: command output captured in response, file written, or OAST callback containing command output
5. Provide minimal payload — the simplest expression that reaches RCE, not the kitchen-sink polyglot

## False Positives

- Template syntax reflected literally (`<valor>` rendered as `<valor>`) — that's XSS-shaped, not SSTI
- Sandboxed environments where reflection succeeds but reachable objects expose nothing useful (Jinja `SandboxedEnvironment` with no `request` / `config` in context)
- Client-side template engines (Vue, Angular, Mustache running in the browser) — that's client-side template injection, different impact (XSS, not RCE)
- Markdown / static-site generators that template at build time only, with no user input reaching the build
- Engines where the output is HTML-escaped before display, masking evaluation as XSS-like reflection — verify with a non-HTML probe (`<valor>` numeric)

## Impact

- Remote code execution on the rendering host (the default outcome — almost every engine leaks a path to it)
- Server-side data exfiltration via gadget chains (filesystem, env vars, internal HTTP)
- Cloud credential theft via metadata service access from the compromised host
- Lateral movement into internal services reachable from the renderer
- Persistent backdoor via web shell or service-account key planting
- Build / supply-chain compromise when the templated content is a build artifact

## Pro Tips

1. Always confirm with a second math probe (`<valor>`) before celebrating — single-shot reflection of `49` could be coincidental
2. Engine fingerprint first, gadget chain second — wrong-engine payloads are wasted requests and noise in WAF logs
3. For Jinja, the highest-yield reachable global varies by framework (`request` in Flask, `config` always present, `cycler` in older Jinja); spray all three before walking subclasses
4. SpEL is everywhere in Spring stacks — Thymeleaf, Spring Security expression language, Spring Cloud Gateway routes; the same payload shape (`${T(java.lang.Runtime)...}`) works across all of them
5. EJS / Nunjucks are common in Express / Koa apps — `require('child_process').execSync('id')` if `require` is in scope (EJS), or escape via `range.constructor("return require('child_process')...")()` for Nunjucks; `process.mainModule.require(...)` is the older form, deprecated since Node 14
6. Sandbox escapes are usually one indirection away — `attr` lookup, constructor traversal, MRO walk; most "sandboxed" environments still reach the runtime if you go through attribute access instead of direct reference
7. Output not reflected? Time-based and OAST work as well as for SQLi — `${T(java.lang.Thread).sleep(5000)}` for SpEL, `<valor>` (or the `request.application.__globals__.__builtins__` walk in Flask) for Jinja — bare `__import__` is not in the template namespace and will raise `UndefinedError`
8. Email previews and PDF generators are gold mines — they're often built on the same engine as the public site but exposed to less-validated input flows

## Summary

SSTI is fundamentally different from XSS at the same syntactic location: the payload runs on the server, in the host language, with whatever objects the engine exposes. Engine fingerprinting via the math-probe table narrows the search space immediately. From there it's a race between the sandbox's denylist and the language's reflection capability — and the language usually wins. Treat any user input that reaches a template renderer (not a templated context variable) as RCE-shaped until proven sandboxed.
