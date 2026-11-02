<!-- Adaptado de jakubkrehel/skills/skills/interface-review/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT; e de pbakaus/impeccable/skill/agents/impeccable-finish-reviewer.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução, condensação, generalizado de tela para qualquer mudança; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/ e terceiros/pbakaus-impeccable/. -->
<!-- ref: tema=revisar-mudanca; palavras=revisar a mudanca, revisar o diff, revisar so a mudanca, revisao do pr, segunda revisao, passe de veredito, linhas apagadas, regressao da mudanca; agentes=revisor -->
<!-- teste-ref: sim=revise só a mudança deste PR, olhando também as linhas apagadas | faça o passe de veredito da segunda revisão desta entrega; nao=calcule o preço de venda do produto -->
# Revisar só a mudança, e o passe de veredito

## Só a mudança
1. **Resolva o escopo primeiro:** a base (`$BASE`: o ramo, o commit, o que o pedido disser). Sem mudança para revisar: pergunte, não invente uma.
2. **Um diff não é uma superfície:** leia o que a mudança toca e o que depende dela, a 1–2 saltos, até 5 arquivos além do diff.
3. **Leia as linhas apagadas:** regressão é invisível no estado depois. Teste tirado, checagem removida, tratamento de erro, foco, rótulo,
   estado. Uma remoção só é regressão se nada na mudança a substitui.
4. **Classifique pela causa, não pelo lugar:** **Introduzido** (a mudança criou), **Regressão** (a mudança enfraqueceu o que estava certo),
   **Pré-existente** (já estava e não piorou: relate à parte, não bloqueia).
5. **Cobre a intenção declarada:** a mudança faz o que o contrato diz, e só isso?
6. **Não altere a árvore de trabalho** ao revisar.

## Passe de veredito (2ª revisão da mesma entrega)
Com a correção em mãos, você **dá nota, não caça de novo**. Para cada achado da rodada anterior: **resolvido / parcial / não resolvido**, com a
prova refeita; até 3 regressões novas causadas pela correção. Só volte a caçar se a correção mudou muito mais do que o pedido, se as provas
não são válidas, ou se aparecer algo Alto na passagem. Mantenha os mesmos ids. Isso evita rodadas sem fim.

## Disciplina de tempo
Pare de ler e escreva antes de acabar o orçamento (por volta do 10º turno de um limite de 30): um relatório inteiro com o que foi visto vale
mais que uma leitura completa sem relatório. Até 8 correções recomendadas por rodada; o resto vai como observação.
