<!-- Adaptado de affaan-m/ECC/agents/build-error-resolver.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, corte, comandos destrutivos só com confirmação, dependência nova pelo auditor; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/. -->
<!-- ref: tema=erro-de-build; palavras=build, erro de build, build quebrou, compilacao, compilar, erro de tipo, tsc, cannot find module, webpack, vite; agentes=engenheiro-software, testador-qa -->
<!-- teste-ref: sim=o build quebrou com erro de tipo no typescript | a compilação do projeto falha com cannot find module depois do merge de ontem; nao=escreva a política de férias da equipe -->
# Build quebrado: deixar verde com a menor mudança

**Meta:** o build e a checagem de tipos passam, nenhum erro novo, a suíte continua verde. Nada de refatorar, renomear,
mudar arquitetura ou "aproveitar para melhorar": isso vai num pedido à parte.

## 1. Juntar todos os erros antes de mexer
- Rode o comando do próprio projeto (o `build`/`typecheck` do `package.json`, `tsc --noEmit`, `cargo build`, `dotnet
  build`...). No TypeScript, `tsc --noEmit --pretty --incremental false` mostra todos de uma vez.
- Classifique: inferência de tipo, tipo faltando, importação, configuração, dependência.
- Ordem: o que impede o build primeiro, depois erros de tipo, por último avisos.

## 2. Corrigir um por vez, o mínimo
Para cada erro: leia a mensagem (esperado × recebido), ache a correção mínima, rode de novo a checagem, siga.

| Erro (TypeScript) | Correção mínima típica |
|---|---|
| `implicitly has an 'any' type` | anotar o tipo |
| `Object is possibly 'undefined'` | `?.` ou checagem de nulo, se o nulo for possível de verdade |
| `Property ... does not exist` | acrescentar à interface ou marcar opcional |
| `Cannot find module` | conferir `paths` do tsconfig e o caminho do import; pacote faltando, ver abaixo |
| `Type 'X' is not assignable to 'Y'` | converter, ou corrigir o tipo que está errado |
| restrição de genérico | `extends { ... }` |
| hook chamado dentro de condição (React) | subir o hook para o topo do componente |
| `await` fora de `async` | marcar a função `async` |

## 3. Pode e não pode
- **Pode:** anotar tipo, checar nulo, corrigir import/export, atualizar definição de tipo, corrigir configuração.
- **Não pode:** refatorar código vizinho, renomear (salvo o que causa o erro), mudar fluxo de lógica (salvo o que é o
  erro), otimizar, mudar estilo.
- **Dependência nova ou troca de versão:** não é "correção mínima". Diga qual pacote, a versão e o motivo, e passe pelo
  `auditor-seguranca` antes de instalar.
- **Apagar cache, `node_modules` ou lockfile** é irreversível para o estado da pasta: só com confirmação do usuário, e
  depois de tentar o resto. Lockfile apagado muda versões sem ninguém ver.

## 4. Pronto quando
- O comando de build e o de tipos saem 0 (mostre a saída).
- Nenhum erro novo; a suíte continua passando.
- Diff pequeno (como referência, menos de 5% das linhas do arquivo afetado) e só nas linhas dos erros.

## Quando não é este caso
Precisa refatorar, mudar arquitetura ou criar funcionalidade: pare e devolva ao orquestrador. Teste falhando por lógica
(não por build): siga o método de depuração (`depurar.md`). Problema de segurança: `auditor-seguranca`.
