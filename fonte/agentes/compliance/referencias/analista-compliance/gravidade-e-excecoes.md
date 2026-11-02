<!-- Adaptado de usestrix/strix/strix/skills/analysis/severity_calibration.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0; e de addyosmani/agent-skills/skills/constraint-driven-development/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, a calibração de segurança virou régua geral de risco, tabela de exceções; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/ e terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=gravidade-e-excecoes; palavras=matriz de risco, classificar risco, gravidade do risco, severidade, excecao de controle, tabela de excecoes, nao conformidade, aceite de risco, risco residual; agentes=analista-compliance -->
<!-- teste-ref: sim=classifique a gravidade dos riscos desta não conformidade e o risco residual | monte a tabela de exceções de controle com dono e validade para o aceite de risco; nao=crie a animação do botão da tela -->
# Gravidade calibrada e exceções com dono e validade

## Gravidade é conclusão, não ponto de partida
Primeiro confirme que o risco é real e alcançável (contraprova: o que impediria isso de acontecer? o controle roda de
verdade?). Só depois classifique. Pergunta que decide: **uma auditoria séria, que põe a reputação nisso, aceitaria esta nota?** Se a
resposta é "só aceitando uma cadeia de suposições", não é alto. Dê nota ao que você provou, não ao pior caso imaginável.

## Régua
- **Crítico:** dano decisivo com prova: perda ou exposição em massa, sanção certa, fraude sem barreira, controle-chave inexistente.
- **Alto:** falha de controle que cruza uma fronteira real (segregação de funções, alçada, acesso a dado sensível), com caminho demonstrado.
- **Médio:** o alto bloqueado por uma restrição real e confirmada (uso interno, papel privilegiado, condição estreita); lacuna em
  objeto de menor valor; informação que ajuda um passo seguinte.
- **Baixo:** falha de forma, documentação, defesa em profundidade sem caminho de exploração.
**O que costuma ser superestimado:** "poderia importar se somado a várias hipóteses"; o que já exige acesso de administrador; falha que
exige o atacante já ter o segredo, sem mostrar como obtê-lo.

## Estados de um achado
**Confirmado** (com evidência) · **descartado** (qual controle, onde, e que ele roda nesse caminho) · **lacuna de prova** (plausível, não
confirmado, sem controle nomeado): é resultado legítimo; não vira "descartado" para limpar a lista.

## Tabela de exceções
| Regra ou controle | Onde | Motivo | **Dono** | **Validade** (até 90 dias) | Compensação | Como sai |
Exceção com dono e data destrava a entrega; apagar a regra destrava todo mundo para sempre. Vencida sem renovação decidida pelo dono
volta a ser não conformidade. Exceção nova sem conversa é achado.
