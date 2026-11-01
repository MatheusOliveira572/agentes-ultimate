<!-- Adaptado de addyosmani/agent-skills/skills/code-simplification/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte dos exemplos por linguagem; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=simplificar; palavras=simplificar, simplifique, legibilidade, codigo confuso, funcao muito longa, aninhamento, limpar o codigo, deixar mais legivel; agentes=engenheiro-software -->
<!-- teste-ref: sim=simplifique esta função muito longa sem mudar o comportamento | o código está confuso, com aninhamento de 5 níveis, deixe mais legível; nao=prepare a pauta da reunião de diretoria -->
# Simplificar sem mudar o comportamento

Meta: código que um colega novo entende mais rápido que o original. Não é ter menos linhas. Não simplifique código que já
está claro, que você ainda não entende, que é crítico de desempenho (se a versão simples for mais lenta, medida), ou que
vai ser reescrito.

## 5 princípios
1. **Comportamento idêntico:** mesmas saídas, efeitos, erros e bordas para toda entrada. Na dúvida, não mude.
2. **Convenção do projeto,** não a sua preferência: leia o `CLAUDE.md`/padrões e o código vizinho antes.
3. **Clareza antes de esperteza:** ternário encadeado vira `if`/`switch`/tabela; `reduce` com lógica embutida vira laço
   legível.
4. **Equilíbrio:** não embuta demais (um ajudante com bom nome explica a chamada), não junte lógicas sem relação, não
   tire abstração que existe para teste, não otimize por número de linhas.
5. **Só o que mudou:** por padrão, o código mexido agora. Fora disso, só com pedido.

## Processo
1. **Entender antes (cerca de Chesterton):** qual a responsabilidade, quem chama, que bordas e erros trata, por que está
   assim (`git blame`, mensagem do commit). Sem resposta, leia mais antes.
2. **Achar os sinais concretos:**
   - estrutura: aninhamento de 3+ níveis (cláusulas de guarda), função de 50+ linhas (dividir), ternário aninhado,
     parâmetro booleano (`f(true, false)` → objeto de opções ou duas funções), a mesma condição em vários lugares
     (predicado com nome);
   - nomes: genéricos (`data`, `temp`, `item`), abreviados (`usr`, `cfg`), enganosos (`get` que muda estado);
     comentário que diz "o quê" sai, comentário que diz "por quê" fica;
   - redundância: 5+ linhas repetidas, código morto (confirme antes; `codigo-morto.md`), invólucro que não acrescenta
     nada, padrão exagerado (fábrica de fábrica, estratégia com uma estratégia só), conversão de tipo já inferido.
3. **Uma por vez, com teste a cada uma.** Refatoração vai em commit separado de correção e de funcionalidade. Mais de
   500 linhas: automatize (codemod, transformação de AST, script) em vez de editar à mão.
4. **Comparar antes × depois:** ficou mesmo mais fácil? Senão, volte.

## Sinais de alerta
Precisou mudar teste para passar (mudou comportamento); a versão "simples" é maior e mais difícil; renomear pelo gosto;
tirar tratamento de erro "para limpar"; muitas simplificações num commit; mexer fora do escopo.

## Pronto quando
Testes existentes passam **sem alteração**; build sem aviso novo; linter passa; cada mudança revisável sozinha; diff sem
nada sem relação; nenhum tratamento de erro removido; nada morto deixado para trás.
