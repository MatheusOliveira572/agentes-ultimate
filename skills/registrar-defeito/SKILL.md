---
name: registrar-defeito
description: Registra um defeito que o usuário achou e que escapou do revisor ("defeito: o total não bate (era do dev-powerbi)"), para o placar contar contra o agente autor e a taxa de captura do revisor. Use quando o usuário apontar um erro numa entrega já revisada, disser "defeito:" ou pedir para registrar um defeito.
---
# Registrar defeito achado pelo usuário

1. Descubra, sem perguntar o óbvio: qual agente fez a entrega (o usuário pode dizer "era do <agente>"; senão, quem
   construiu aquilo pelo `DIARIO.md`), a gravidade (Bloqueante: impede o uso ou número errado ao decisor; Alta:
   errado e visível; Média: atrapalha; baixa: acabamento) e o que o usuário viu, em uma frase.
2. Rode, na pasta do projeto:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/placar.js" defeito --agente <nome> --gravidade <Bloqueante|Alta|Média|baixa> --texto "<o que o usuário viu>"`
   O texto vai só para `.claude/base/DEFEITOS-USUARIO.md` (no projeto); o registro global guarda só agente, gravidade,
   data e o código anônimo do projeto.
3. Diga ao usuário que ficou registrado e trate o defeito: volta ao autor com o caso que reproduz, e o revisor ganha
   um caso de regressão para não deixar passar de novo.
