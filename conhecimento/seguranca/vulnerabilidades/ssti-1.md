<!-- Adaptado de usestrix/strix/strix/skills/vulnerabilities/ssti.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-vulnerabilidades-ssti-1; palavras=ssti, injecao de template, ssti no codigo; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=audite o sistema quanto a ssti | o código pode ter injecao de template, confira; nao=escreva o texto da campanha de natal -->
# Server-Side Template Injection

SSTI happens when user input reaches a template engine as syntax instead of as data — `<valor>` rendered through Jinja, `${user_input}` through Velocity / SpEL, `<%= user_input %>` through ERB / EJS. The eventual impact is almost always RCE because template engines are designed to evaluate expressions and most leak access to the host language's runtime (Python builtins, Java reflection, JavaScript prototypes). The discovery cost is low — a `<valor>` probe — but the gadget chain to RCE differs sharply per engine, so engine fingerprinting is the load-bearing step.

## Attack Surface

**Input shapes that reach the renderer**
- Form fields, query / path / header values, cookies, JSON / GraphQL variables
- Filenames and file metadata processed by document / report templates
- Email subject / body / template-selector fields
- Theme / customization endpoints (CSS / HTML generation, dashboard widgets, webhook payload templates)
- Markdown / WYSIWYG content rendered through a templating layer downstream

**Code patterns that enable injection**
- User input concatenated into a template string before `render(template_str)` instead of passed as a context variable to `render(template_obj, context)`
- "Template editor" features for tenants / admins where the *template itself* is user-controllable
- `format()` / `sprintf()` / printf-style chains with user-controlled format string downstream of a template
- YAML / TOML / JSON values whose strings are later evaluated through a template

**Engines in scope**
- Python: Jinja2, Mako, Django (limited)
- Java: Velocity, Freemarker, Thymeleaf (with SpEL), JSP EL
- JS / Node: Handlebars, Nunjucks, EJS, Pug, Marko, Dust
- Ruby: ERB, Haml, Slim
- PHP: Twig, Smarty, Blade
- .NET: Razor, RazorEngine

## High-Value Targets

- Email rendering pipelines (subject / body / "from" templates)
- PDF / report generators (server-side render → headless browser)
- CMS theme and plugin editors
- Webhook and notification payload templates
- API response formatters that interpolate strings (pagination labels, error messages, custom field renders)
- Admin / tenant template editors — explicit "edit your template" features

## Reconnaissance

### Injection Points

- Submit a benign string and grep responses (HTML, JSON, emails, PDFs) for verbatim reflection
- Anywhere user input ends up in a value that's clearly being templated (preview panes, "your message will look like…" panels) is high-signal
- Check error pages — many engines leak template syntax in stack traces

### Engine Fingerprinting

The classic differential probe — most engines evaluate exactly one of these, identifying themselves:

| Probe | Renders to | Engine family |
|---|---|---|
| `<valor>` | `49` | Jinja2 / Twig / Nunjucks |
| `<valor>` | `7777777` (Jinja) or `49` (Twig) | distinguishes Jinja from Twig |
| `${7*7}` | `49` | Velocity / Freemarker / SpEL / JSP EL / Thymeleaf |
| `<%= 7*7 %>` | `49` | ERB / EJS |
| `#{7*7}` | `49` | Pug / some Ruby contexts |
| `<valor>` | `49` | doT.js |

For Thymeleaf specifically, the `*{...}` selection-expression form also evaluates but only inside a `th:object` scope; `${...}` is the universal probe.

Secondary signals: error message text (engine name in stack trace), comment-syntax differential (`{# #}` Jinja vs `<%# %>` ERB vs `{* *}` Smarty), filter syntax (`|` vs `:` vs space).

### Blind Probes

When output isn't reflected:

- **Time-based**: payload that triggers a sleep on the host language (`<valor>` for Jinja, `${T(java.lang.Thread).sleep(5000)}` for SpEL, `<%= sleep(5) %>` for ERB)
- **OAST**: payload that performs a DNS lookup or HTTP fetch to attacker infrastructure (`<valor>`)
- **Length / ETag diff**: payload whose evaluation changes the body length, even if the value isn't directly visible

## Key Vulnerabilities

### Jinja2 / Mako (Python)

**Jinja sandbox:** resolve the installed Jinja build and check current sandbox advisories before selecting indirect `str.format` or `|attr` gadgets. Establish template-source control and inspect custom filters; user data passed only as a variable is a different surface ([release notes](https://jinja.palletsprojects.com/en/stable/changes/)).

The classic Python class walk — every object exposes its method-resolution-order, which leads to `object`, which exposes every subclass loaded in the interpreter, which includes things like `subprocess.Popen`:

```jinja
<valor>
```

Locate a useful subclass and call it. Common gadgets when builtins are reachable through globals:

```jinja
<valor>
<valor>
<valor>
```

Sandbox bypass: even with `SandboxedEnvironment`, attribute-lookup tricks (`|attr('__class__')`) and `request.environ` access can re-introduce reachability. Check whether the app exposes `request`, `config`, `cycler`, or any framework global into the template context.

### Velocity / Freemarker / Thymeleaf (Java)

SpEL (Spring Expression Language) — used by Thymeleaf and various Spring components — reaches `Runtime` via the `T()` type operator. Note that `Runtime.exec()` returns a `java.lang.Process` object whose `toString()` is `"Process[pid=...]"`, **not** the command's stdout. To get reflected output you need to consume the process's `InputStream`:

```spel
${T(java.lang.Runtime).getRuntime().exec('id')}
${new java.util.Scanner(T(java.lang.Runtime).getRuntime().exec('id').getInputStream()).useDelimiter('\\A').next()}
${T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec('id').getInputStream())}
```

The first form confirms execution (rendered Process object proves the call ran); the Scanner form is universally available; the `IOUtils` form is shorter when Apache Commons IO is on the classpath. For blind contexts, validate via OAST or sleep.

Freemarker's `freemarker.template.utility.Execute` is the canonical RCE gadget when not denylisted, and unlike `Runtime.exec` it returns the command output as a string directly:

```freemarker
<#assign ex="freemarker.template.utility.Execute"?new()> ${ ex("id") }
```

Velocity gadgets typically don't have `$Runtime` in context — that's not a standard Velocity built-in. The portable approach is string-class reflection from any reachable object:

```velocity
#set($s = "")
#set($r = $s.class.forName("java.lang.Runtime").getMethod("getRuntime").invoke(null))
$r.exec("id")
```

This requires the default `UberspectImpl` (Velocity 1.x and Velocity 2.x without `SecureUberspector`); same `Process.toString()` caveat applies — capture stdout via `Scanner` or `BufferedReader` if reflected output is needed. If the application uses Velocity Tools, `$class` (a `ClassTool`) is often in scope and shortens the chain considerably.

Thymeleaf SSTI requires control over the *template source*, not just over a model variable bound into the template — normal Spring MVC binding renders `${userInput}` as a value, never re-evaluated as SpEL. The exploitable surface is `templateEngine.process(userControlledString, ctx)`, admin-editable email / notification templates, and template fragments composed from user input. When that surface exists, the same SpEL payloads apply:

```html
<div th:utext="${T(java.lang.Runtime).getRuntime().exec('id')}"></div>
<div th:utext="${new java.util.Scanner(T(java.lang.Runtime).getRuntime().exec('id').getInputStream()).useDelimiter('\\A').next()}"></div>
```

Confusing this with normal model binding produces false positives — confirm the template source itself is attacker-influenced before flagging.

### Smarty / Twig / Blade (PHP)

Twig sandbox bypasses are version-specific. The canonical historical gadget (Twig 1.x) registered `system` as an undefined-filter callback, then invoked it through the filter pipeline:

```twig
<valor><valor>
```

In Twig 2.x / 3.x, `_self` returns the template name as a string and does not expose `.env`. Bypasses depend on which extensions are loaded and the active sandbox policy; consult Twig's published security advisories and probe with the version-specific gadgets (filter/function abuse, reflection on `_context` in some configs).

Smarty `{php}...{/php}` was the historical RCE primitive; deprecated in Smarty 3 and removed in 4. On modern Smarty, the surface is static-method invocation and template-object reflection — `{$smarty.template_object->smarty->...}` walks back to the Smarty engine, and direct static calls on whitelisted classes (e.g. `{Smarty_Internal_Write_File::writeFile(...)}` on misconfigured installs) reach the filesystem. Probe both before assuming Smarty is hardened.

Blade (Laravel) compiles templates to PHP on first render and caches the compiled output, so the dangerous paths are runtime: `Blade::render($userControlledString, ...)`, `Blade::compileString(...)` with user input, or any reachable `@php ... @endphp` block whose body is composed from user input — all three are direct RCE.

### ERB / Haml (Ruby)

Direct Ruby evaluation — backticks are the shortest path that *reflects* command output:

```erb
<%= `id` %>
<%= IO.popen('id').read %>
<% require 'open3'; out, _ = Open3.capture2('id'); %><%= out %>
<%= system('id') %>
```

The first three render the command's stdout into the response. `system('id')` returns `true`/`false` and prints the command output to the *server's* stdout, not the HTTP body — useful for confirming execution succeeded but not for capturing output. Pair with OAST or a side-effect (file write, DNS lookup) when the response doesn't reflect anything.

Haml is the same risk surface in different syntax. `instance_eval` / `class_eval` chained off any reachable object becomes RCE.

### Handlebars / Nunjucks / EJS (JavaScript)

EJS evaluates inline JavaScript:

```ejs
<%= require('child_process').execSync('id').toString() %>
```

Nunjucks via constructor walk on reachable objects:

```nunjucks
<valor>
```

Handlebars itself is harder (default helpers are restricted), but custom helpers that pass arguments to `eval`, `Function`, or `child_process` re-open the surface. Also probe for prototype pollution as an SSTI amplifier — once `Object.prototype` is polluted, downstream template logic may execute attacker-controlled code paths.

## Bypass Techniques

**Sandbox escape — generic patterns**
- **Attribute lookup instead of direct access**: `<valor>` blocked? try `<valor>`
- **Class walk to recover deleted builtins**: `<valor>` enumerates everything loaded
- **String constructor games**: `'__import__'.__class__` etc., when literal `__import__` is filtered
- **Filter / function aliasing**: same callable reachable via different names — find one not on the denylist
- **Implicit conversion**: object whose `__str__` / `toString` triggers code, coerced via concatenation

**Filter and parser evasion**
- Whitespace / case variants in keywords: `<valor>`, `<valor>`, `<valor>`
- String concatenation to assemble denylisted identifiers: `<valor>`, `<valor>` — splits a token without a comment (Jinja's lexer doesn't recognize `{#` inside expression mode, so SQL-style `/**/` token splitting doesn't work here)
- Encoding layering: payload arrives URL-encoded, JSON-decoded, then template-rendered — pick the encoding that survives the filter but is decoded before render
- Operator precedence games: `((7)*(7))`, `7**7`, `7+0+7`
- Null byte truncation: `<valor>` — terminates payload for some pre-template filters but not the template parser
- Unicode normalization: smart quotes, fullwidth digits — bypasses naive denylists, normalizes back during render

**Polyglot and chained evaluation**
- Multi-engine pipelines: output of engine A feeds engine B — craft payload valid in both, or escape A and inject for B
- Markdown / RST embedded in a template — Markdown parser may strip your payload, but a code block survives and reaches the template
- Format string → template: printf-style format applied before template render; payload that's inert as a format string but live as a template

## RCE Primitives

**Direct command execution by language**
- Python: `os.system`, `os.popen`, `subprocess.run`, `subprocess.Popen`, `__import__('os').system`
- Java: `Runtime.getRuntime().exec`, `ProcessBuilder`, `freemarker.template.utility.Execute`
- Ruby: backticks, `system`, `exec`, `Open3.capture2`, `IO.popen`, `%x{}`
- JavaScript / Node: `require('child_process').execSync` / `exec` / `spawn`; `require.main.require(...)` when nested module loading is needed (`process.mainModule` is the older form, deprecated since Node 14 but still present in most CJS contexts)
- PHP: `system`, `passthru`, `exec`, `shell_exec`, backticks, `popen`

**Indirect / second-stage**
- File write to webroot → trigger via subsequent HTTP request (when shell exec is blocked but file write isn't)
- Define a function / macro inline that runs on next render
- Unsafe deserialization gadget invoked through template (Java `ObjectInputStream`, Python `pickle`, PHP `unserialize`)
- DNS / HTTP exfiltration when shell exec produces no observable output
