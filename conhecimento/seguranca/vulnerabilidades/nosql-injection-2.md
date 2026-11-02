<!-- Adaptado de usestrix/strix/strix/skills/vulnerabilities/nosql_injection.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-vulnerabilidades-nosql-injection-2; palavras=injecao nosql parte 2, nosql injection parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia injecao nosql parte 2 do guia | leia nosql injection parte 2 do guia; nao=escreva o texto da campanha de natal -->
## Pro Tips

1. Always try both JSON body (`{"field": {"$ne": null}}`) and bracket-notation form (`field[$ne]=`) — different middleware handles them differently
2. Target reset token and API key fields with `$regex` extraction, not just passwords
3. Check MongoDB version via error messages or `/admin/serverStatus`; `$where` is active by default on pre-7.0 instances — that includes 4.4–6.x targets where `javascriptEnabled` was deprecated but not yet disabled, making them still exploitable unless explicitly hardened
4. For Elasticsearch, try `_cat/indices`, `_mapping`, and `_search` with `query_string: *` before attempting script injection
5. Combine authentication bypass with a second request to `/admin` or `/api/users` to escalate impact
6. Automate `$regex` extraction with binary search: 7 requests per character vs 94 with linear search
7. GraphQL resolvers are an underexplored entry point — try operator objects in any input type that reaches a NoSQL filter, and use introspection to find candidate fields

## Summary

NoSQL injection exploits the same root cause as SQL injection — user input controlling query structure — but through operator embedding rather than syntax breaking. MongoDB is the primary target; enforce schema validation, use parameterized equivalents (strict mode, typed schemas), and never pass raw user input as a query object.
