<!-- Adaptado de usestrix/strix/strix/skills/custom/npx_confusion.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-dependencias-npx-confusion-2; palavras=confusao de pacote parte 2, npx confusion parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia confusao de pacote parte 2 do guia | leia npx confusion parte 2 do guia; nao=calcule a folha de pagamento do mês -->
## Reporting

There is no CVE and no vulnerable installed version here, so this does not go through `create_dependency_report`; that tool requires an advisory-matched CVE. Use (registro do relatório) only after the applicable core condition is fully verified.

A registry lookup or `404` alone is candidate evidence, not a working PoC. The report must preserve the target invocation and execution context, show the exact selected package and binary/module, demonstrate the runner's execution transition in a representative controlled setup without publishing the contested name, and establish the authority inherited by that process. When source is available, include the responsible invocation/configuration and concrete fix in `code_locations`.

Do not file documentation/comment-only references, locally satisfied commands, unregisterable names, ambiguous ownership, or chains that stop before package execution. Retain them as investigation notes only when useful.

Derive CVSS from the demonstrated path rather than a fixed severity label. Account for required developer/user action, registry and configuration prerequisites, runner permissions, credential availability, and the confidentiality, integrity, and availability actually exposed. A CI, release, container-build, or agent context can be severe, but the context name alone does not establish High or Critical impact.

Deduplicate by root cause, affected asset/workflow, and remediation. Combine call sites when the same configuration mistake and fix apply; keep separate findings when the same candidate name affects different products, tenants, runner semantics, authority, or fixes.

## False Positives

- The executable is provided by a declared dependency in every real execution context.
- `npx --package @scope/pkg <bin>` explicitly binds the executable to the intended package.
- A versioned package spec or scope-specific registry points to the intended publisher.
- The public package is the deliberately selected third-party tool.
- npm fetches the manifest but cannot infer or execute a bin.
- The reference appears only in generated/minified text with no executable call site.
- A registry/proxy error is misread as an unregistered name, or the target-path control pair is inconclusive.
- A package is absent but registry policy prevents the contested registration.
- The command resolves to the deliberately selected ecosystem tool and expected publisher.
- The already-registered name belongs to the target's own organization.
- An explicit `dlx` or `npm:` package spec is treated as missing-local fallback without evidence of a package/publisher mismatch.

## Remediation

- Install the intended package and invoke its local executable through an npm script.
- For npm, bind and pin the provider: `npx --package @org/tool@<version> org-tool`; use `--no` when a missing dependency must fail.
- For Bun, use `bunx --package @org/tool@<version> org-tool` and `--no-install` when remote installation is not intended.
- Replace `yarn dlx`/`pnpm dlx` in repeatable or privileged workflows with a declared, locked dependency plus the runner's local `exec` command. When ephemeral execution is required, bind and pin the provider package explicitly.
- For Deno, pin the `npm:` package and binary subpath, retain a reviewed lockfile, use cache-only operation where appropriate, and grant only the permissions the command requires.
- Route private scopes to the intended registry and prevent public fallback.
- Pin package versions and lockfiles in privileged workflows.
- Replace bare `npx -y <name>` agent launchers with reviewed, publisher-qualified, version-pinned package specs.

## Summary

Treat package-runner confusion as an identity and execution-context bug. Prove the runner-specific transition, distinguish binary names from package names, verify registry and publisher state without equating absence with eligibility, and report only a complete execution path under the affected workflow's actual authority.
