<!-- Adaptado de usestrix/strix/strix/skills/vulnerabilities/header_injection.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-vulnerabilidades-header-injection-2; palavras=injecao de cabecalho parte 2, header injection parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia injecao de cabecalho parte 2 do guia | leia header injection parte 2 do guia; nao=escreva o texto da campanha de natal -->
## Validation

1. Show two distinct users (or sessions) receiving content keyed on attacker-supplied header — proves cache poisoning
2. Capture a password-reset / OAuth link pointing at attacker-controlled host — proves Host injection
3. Demonstrate the same endpoint returning different auth decisions with and without a forged forwarding header
4. For response splitting: show a downstream cache or proxy serving the injected second response to an unrelated request
5. All findings should produce a durable artifact (cached response, sent email, log entry, session change) — transient anomalies are not validation
6. For internal redirects, capture both the injected response metadata and the final internally selected route/handler

## False Positives

- Headers that vary by input but are correctly keyed in the cache (intentional personalization, Vary set correctly)
- `X-Forwarded-*` reflected back but only used for logging — not a security boundary, may not be exploitable
- Browsers blocking `Location: javascript:` or `Location: data:` — capability exists in the protocol but most modern browsers refuse to navigate
- CRLF appearing in response headers but stripped by an outer proxy before reaching any client or cache

## Impact

- Cross-user cache poisoning (defacement, XSS, account takeover via cached auth response)
- Account takeover via Host-confused password-reset / OAuth flows
- Auth bypass on endpoints trusting forwarding headers
- Session fixation and cookie tossing leading to account hijack
- Open redirect for phishing / OAuth `redirect_uri` abuse
- WAF / detection bypass via header-name and encoding tricks

## Pro Tips

1. The fastest win is usually Host / `X-Forwarded-Host` in a password-reset or OAuth flow — try first, costs one request
2. For cache poisoning, find the *unkeyed* input first (header that influences body but not cache key); the rest follows
3. `X-HTTP-Method-Override` is high-yield against backends that route on it before checking method-based auth — most useful from server-side / non-browser callers (it triggers CORS preflight in a browser, so not a CSRF primitive)
4. If a header test exposes message-boundary disagreement, switch to the dedicated request-smuggling workflow and identify the proxy → backend pair
5. `X-Original-URL` / `X-Rewrite-URL` against IIS / ASP.NET admin endpoints is still a high-yield bypass
6. Before claiming a CRLF win, verify the second line landed as a real header in the cache or downstream consumer — many servers strip CRLF silently
7. Outbound email flows are a separate but related surface — user input flowing into SMTP headers (To, Cc, Subject, Reply-To) is its own injection class with the same root cause

## Summary

Header injection is fundamentally a normalization failure: somewhere on the request → response path, user input reached a header value without CR/LF stripping or proper escaping. The impact tiers up from open redirect to cache poisoning to request smuggling depending on which downstream component trusts the resulting header. Audit every header whose value moves with input, and treat every `X-Forwarded-*` / Host trust as a security boundary that needs explicit justification.
