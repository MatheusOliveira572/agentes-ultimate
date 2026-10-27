---
name: fechar-etapa
description: Fecha uma etapa do plano depois que o usuário aprova o teste — provas por item, taxa de captura do revisor, curadoria das memórias, estado para retomar. Use quando o usuário disser que a etapa está aprovada.
---
# Fechar etapa

1. **Provas:** cada item da etapa no acompanhamento do projeto (`docs/progresso.json` ou equivalente) só vira "passou"
   com a prova (comando, cenário, commit ou print do usuário). Sem prova, continua aberto.
2. **Taxa de captura:** em `.claude/agent-evals/defeitos-usuario.md`, some os achados do revisor e os do usuário na
   etapa; registre a taxa e os casos novos.
3. **Curadoria:** chame o `curador` (memórias acima de ~150 linhas, lições duplicadas, propostas pendentes).
4. **Junção:** se a etapa foi feita numa cópia (ramo ou worktree), junte na principal, resolva conflitos lendo os dois
   lados e rode de novo as checagens principais na versão juntada.
5. **Estado:** atualize `PROJETO.md` (e `CLAUDE.md`, se existir) com o que foi entregue, o que ficou e o próximo passo.
6. **Commit** com a mensagem "Fecha etapa N: …". Nunca publique sem pedido explícito do usuário.
7. Conte ao usuário: o que ficou pronto, a taxa de captura, o que ficou pendente e qual é a próxima etapa.
