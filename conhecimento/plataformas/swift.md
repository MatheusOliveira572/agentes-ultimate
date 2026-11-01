<!-- Adaptado de emilkowalski/skills/skills/write-swift/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: tradução, condensação (42 KB → este arquivo), corte dos exemplos; alterado por agentes-ultimate. Licença em terceiros/emilkowalski-skills/. -->
<!-- ref: tema=swift; palavras=swift, swiftui, xcode, actor, async await em swift, sendable, concorrencia em swift, swift testing, codigo swift; agentes=engenheiro-software -->
<!-- teste-ref: sim=escreva o modelo de dados em swift com struct, enum e concorrência segura | o compilador do swift reclama de sendable no actor, corrija; nao=revise o orçamento de marketing do semestre -->
# Swift moderno (Swift 6.x)

## Comece estreito, alargue com motivo
| Precisa de | Use | Só desça quando |
|---|---|---|
| dado | `struct` / `enum` | precisar de identidade, compartilhamento ou herança |
| abstração | tipo concreto | houver código repetido entre tipos |
| polimorfismo | `some P` (genérico) | precisar guardar tipos diferentes → `any P` |
| execução | ator principal, síncrono | o perfil mostrar travamento → `async` → `@concurrent` → `actor` |
| memória | `Array`, `String` | o perfil mostrar custo → `InlineArray`, `Span` |
| segurança | API segura | interoperar com C ou caminho quente medido → `Unsafe*` |

## Dados com tipos de valor
`struct`/`enum` por padrão; `class` só para identidade, estado mutável compartilhado, herança ou vida de recurso. `let`
por padrão. Struct com propriedade de referência mutável não é valor nem referência (as cópias vazam mudança). Enum para
conjunto fechado e estado mutuamente exclusivo (troca uma pilha de opcionais por um caso só).

## Erros e opcionais
Recuperável → `throw`; erro de programação → `precondition`/`fatalError`. Erro como enum com valor associado (o contexto é o
ponto). `guard` para condição de erro. `throws(TipoDeErro)` em função interna e código genérico que repassa erro; API pública
com `throws` comum. `!` só onde você enuncia a invariante (prefira `#require`/`precondition` com mensagem).

## Concorrência: um fio só até o perfil mandar
1. Tudo no ator principal (serve à maioria dos apps). 2. `async/await` para esconder espera (rede, disco). 3. `@concurrent`
para tirar **o seu** trabalho pesado do principal, só depois do Instruments mostrar travamento. 4. `actor` para tirar
**estado** do principal, quando o vaivém pesar.
- `nonisolated` roda onde é chamado: o padrão certo para API de biblioteca.
- Não crie tarefa para trabalho trivial; uma tarefa por operação de ponta a ponta.
- **`await` é ponto de suspensão e quebra a atomicidade:** o estado pode mudar; confira de novo depois de cada `await`.
- Ator: mude o estado em métodos síncronos (rodam inteiros); métodos `async` finos; ator não é fila FIFO (use tarefa ou
  `AsyncStream` se a ordem importa).

## Sendable
Tipos de valor são `Sendable` quando o conteúdo é; tipo público nunca ganha por inferência (marcar é compromisso de API).
Atores e classes `@MainActor` já são. Modelo comum: nem `@MainActor` nem `Sendable`, de propósito. Dá para mandar um
objeto não `Sendable` se quem manda para de usá-lo. `@unchecked Sendable` só com sincronização real (Mutex). Erro de
compartilhamento, nesta ordem: não compartilhe (uma cópia local por tarefa resolve a maioria) → torne valor `Sendable` →
isole num ator.

## Concorrência estruturada
`async let` para número fixo de filhos; `withTaskGroup` para número dinâmico (`withDiscardingTaskGroup` sem retorno);
`Task {}` só quando a vida não cabe num escopo (toque, delegate, aparecer da tela); `Task.detached` quase nunca.

## SwiftUI
`View` é `@MainActor`, inclusive o `@State`. Algumas APIs rodam fora do principal (assinatura com `@Sendable`:
`visualEffect`, `Shape.path(in:)`, `Layout`): nada de estado do principal lá dentro. Ações são síncronas de propósito
(animação no mesmo quadro do gesto). Estado na costura: a tela dispara a tarefa; a camada assíncrona faz uma mudança
síncrona ao terminar; a tela reage.

## Protocolos e genéricos
Protocolo sem personalização por tipo é desperdício (use extensão restrita). Ter-um antes de ser-um; composição antes de
herança; downcast forçado é cheiro. `some P` por padrão, `any P` para guardar tipos variados. Requisito do protocolo é
ponto de personalização (despacho dinâmico); método só na extensão é estático.

## API
Sem prefixo de tipo em API só Swift; sem `get` na frente; controle de acesso explícito na borda; modelo em que estado
ilegal não se escreve (setter privado + método que valida, enum, `UUID` tipado). Property wrapper para política de
acesso; result builder para DSL; macro quando o boilerplate é código que o compilador escreveria.

## Desempenho: meça, depois escolha
Saiba a complexidade (`remove(at:)` em laço é O(n²); `removeAll(where:)` é O(n)); `map/filter` encadeados alocam um
array por etapa; perfil com Time Profiler e Allocations rodando **um teste**; `final` em classe sem subclasse; struct
grande com campos de referência custa retenções por cópia; `[MeuModelo]` homogêneo vence `[any Modelo]`;
`InlineArray` e `Span` (Swift 6.2) para armazenamento fixo e acesso contíguo seguro.

## ARC
A vida garantida termina no último uso, não na chave. `weak`/`unowned` só para quebrar ciclo; melhor não criar o ciclo.
`deinit` sem efeito global (use `defer` no ponto de chamada).

## Testes: Swift Testing
`@Test` em qualquer função; `#expect(a == b)`; `try #require(...)` para parar e desembrulhar; suítes são `struct` (instância
nova por teste); `@Test(arguments:)` em vez de laço; `.disabled("motivo")` em vez de comentar; `withKnownIssue` para falha
de fora; `confirmation` para callbacks; testes rodam em paralelo e em ordem aleatória (é recurso: revela dependência
escondida); testes de saída (`#expect(processExitsWith: .failure)`) para `precondition`.
