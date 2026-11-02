<!-- Adaptado de addyosmani/agent-skills/skills/planning-and-task-breakdown/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, condensação, saída no formato do plugin; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=quebrar-tarefas; palavras=quebrar em tarefas, quebrar em etapas, plano de implementacao, lista de tarefas, dividir o trabalho, ordem das tarefas, plano de trabalho, cronograma das etapas, tarefas pequenas, criterio de aceite; agentes=planejador, gerente-produto -->
<!-- teste-ref: sim=quebre o projeto em tarefas pequenas com critério de aceite e ordem | monte o plano de implementação dividido em etapas com dependências; nao=redija a nota de pesar aos colaboradores -->
# Quebrar em tarefas pequenas, com aceite e ordem

1. **Modo plano:** só leitura até o plano estar aprovado.
2. **Grafo de dependências:** o que depende do quê (dados → API → tela; contrato antes dos dois lados).
3. **Fatias verticais** (`../engenharia/incremental.md`): cada tarefa entrega algo que funciona de ponta a ponta.
4. **Cada tarefa:** título com verbo; o que muda; **critério de aceite verificável**; como verificar (o comando ou o teste);
   arquivos prováveis; tamanho.
   | Tamanho | Arquivos | Alcance | Exemplo |
   |---|---|---|---|
   | XS | 1 | uma função ou configuração | uma regra de validação |
   | S | 1–2 | um componente ou endpoint | um endpoint novo |
   | M | 3–5 | uma fatia de funcionalidade | fluxo de cadastro |
   | L | 5–8 | funcionalidade com vários componentes | busca com filtro e paginação |
   | XL | 8+ | **grande demais: quebre mais** | — |
5. **Ordem e pontos de controle:** risco primeiro; um ponto de controle (testes verdes, commit) a cada 2–3 tarefas.
6. **Paralelo:** fatias independentes, testes de algo já pronto e documentação podem ir em paralelo (agentes diferentes);
   o que mexe no mesmo arquivo, não.

**Saída:** o plano (decisões, riscos, perguntas abertas) e a lista de tarefas no lugar que o projeto usa
(`.claude/base/`, `docs/`, ou o rastreador de tarefas indicado no `CLAUDE.md`); cada etapa com a contagem para o
progresso (feito/total).
