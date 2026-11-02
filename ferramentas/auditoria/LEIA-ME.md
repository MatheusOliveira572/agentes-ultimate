<!-- Adaptado de cloudflare/security-audit-skill/skills/security-audit/validate-findings.cjs, validate-coverage-ledger.cjs e report-schema.json @c1c8a8c, © 2025-2026 Cloudflare, Inc., MIT. Alterações: leitura no Windows; esquema sem mudança; alterado por agentes-ultimate. Licença em terceiros/cloudflare-security-audit-skill/. -->
# Validadores da auditoria completa (T38, T39)

Só leitura, sem rede, sem pacote. Usados pela skill `/auditoria-completa`:

    node "<plugin>/ferramentas/auditoria/validate-findings.cjs" <pasta-da-auditoria>/findings.json
    node "<plugin>/ferramentas/auditoria/validate-coverage-ledger.cjs" <pasta-da-auditoria>/coverage-ledger.json

Saem 0 com `PASS` e 1 com `FAIL` e a lista de erros (até 100). Passar prova só o formato e a coerência do livro, nunca que o achado é verdadeiro.

**Alteração:** o original recusa todo arquivo quando o sistema não tem `O_NOFOLLOW` e `O_NONBLOCK`, que é o caso do Node no Windows
(as duas constantes são `undefined`). Aqui, sem elas, o arquivo é conferido com `lstat` (recusa link e o que não é arquivo comum), aberto
só para leitura e conferido de novo com `fstat`. Sai um aviso: não há proteção contra a troca do arquivo entre a checagem e a abertura. Em
Linux e macOS o caminho original fica igual. Os testes do original (`validate-*.test.cjs`, com `mkfifo` e links de Unix) não vieram; os
nossos estão em `scripts/testar-auditoria.js`.
