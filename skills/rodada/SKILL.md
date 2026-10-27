---
name: rodada
description: Conduz uma rodada de construção com o time de agentes (especificação → contrato → checagem que falha → construção → prova → revisor → divergências → usuário). Use sempre que um agente for construir ou alterar algo que o usuário vai testar.
---
# Rodada de construção

1. **Especificação existe e está aprovada?** Tela ou visual sem especificação do designer não se constrói; regra sem o
   especialista também não. Se falta, peça primeiro.
2. **Contrato** em `docs/rodadas/<nome>-contrato.md`, escrito pelo agente que constrói: cada item com a checagem que
   falha antes e passa depois, e o que fica fora. Meta de 3–4 h; se passar, divida.
3. **Lance o agente** com: onde trabalhar, escopo numerado, o que não tocar, regras de operação (memória do computador,
   commits a cada item, sem push) e a entrega esperada. Dê ao usuário a faixa de horário de término.
4. **Ao receber o relatório:** confira se cada "passou" tem comando e saída. O que não tiver vira pendência.
5. **Revisor** sempre: ele refaz as checagens, testa as bordas e devolve o veredito e a lista do usuário (≤ 6 itens).
6. **Divergências** (o autor discordou da especificação ou achou um caso não previsto) vão ao dono (designer ou
   especialista), que decide com recomendação. Achados pequenos entram na rodada seguinte, não abrem rodada nova.
7. **Usuário testa** pela lista curta, com o caminho exato do arquivo no topo. Antes, confirme que nenhum agente está
   usando o mesmo programa ou arquivo.
8. **Defeito achado pelo usuário** vira: registro em `.claude/agent-evals/defeitos-usuario.md` (o que viu, causa,
   checagem que pega) e uma regra automática no verificador do projeto, provada com o defeito injetado. Atualize a taxa
   de captura (pegos pelo revisor ÷ total).
9. Atualize `PROJETO.md` ("retomar aqui") e faça commit.

**Pausa a pedido do usuário:** mande o agente terminar só o comando em andamento, fazer commit (ou "WIP"), fechar o
que abriu e gravar "Retomar aqui" no contrato. Para retomar, mande mensagem ao mesmo agente.
