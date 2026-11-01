<!-- Adaptado de affaan-m/ECC/skills/verification-loop/SKILL.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, corte, comandos do próprio projeto, sem varredura de segredo por grep (a trava do plugin já confere o commit); alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/. -->
<!-- ref: tema=verificacao; palavras=verificacao final, verificar antes de entregar, pronto para pr, antes do pull request, relatorio de verificacao, passou ou nao passou, portao de qualidade; agentes=testador-qa, engenheiro-software -->
<!-- teste-ref: sim=faça a verificação final antes de abrir o pull request da funcionalidade | confira se está pronto para PR: build, lint e testes, com relatório de verificação; nao=calcule a depreciação do ativo imobilizado -->
# Verificação em 6 fases antes de dizer "pronto"

Use depois de uma funcionalidade ou refatoração, antes de abrir PR ou entregar ao revisor. Cada fase usa o **comando do
próprio projeto** (README, `package.json`, Makefile, CI). Mostre a saída; "deve passar" não é prova.

1. **Build.** Falhou: pare e corrija antes de seguir (`erro-de-build.md`).
2. **Tipos** (quando a pilha tem: `tsc --noEmit`, `mypy`, `pyright`...). Relate todos; corrija os que quebram.
3. **Linter.** Num pipeline com `pipefail`, limite a saída sem cortar o fluxo (`sed -n 1,40p`, não `head`), senão o
   linter que passou "falha" por SIGPIPE.
4. **Testes com cobertura:** total, passou, falhou, cobertura (se o projeto mede).
5. **Segurança básica:** nenhum segredo, `.env` ou chave na mudança (a trava do commit do plugin confere o conteúdo);
   `console.log`/`print` de depuração esquecido; dependência nova citada no relatório.
6. **Diff:** `git diff --stat` e a leitura de cada arquivo: mudança sem querer, tratamento de erro faltando, caso de borda.

## Aceite no ambiente de destino é outra coisa
Quando o pedido exige o sistema no ar (homologação, produção, loja), relate em separado: ambiente, versão instalada,
evidência, e o próximo passo permitido. Passar local, revisão ou merge **não prova** o aceite no destino. Sem acesso:
"verificação em homologação NÃO FEITA (sem acesso); próximo passo: quem tem acesso roda o teste de fumaça". Nada de
mexer em produção sem autorização. Tarefa só local: "não se aplica".

## Relatório
```
VERIFICAÇÃO
Build:     PASSOU
Tipos:     PASSOU (0 erro)
Linter:    PASSOU (2 avisos)
Testes:    PASSOU (48/48, cobertura 84%)
Segurança: PASSOU (nada na mudança)
Diff:      6 arquivos
Destino:   não se aplica | VERIFICADO | FALHOU | NÃO FEITO (motivo)
Geral:     PRONTO | NÃO PRONTO
Corrigir:  1. ...
```
Sessão longa: rode de novo depois de cada parte grande, não só no fim. Rodou e passou sem mudança de código no meio: não
repita (não traz informação).
