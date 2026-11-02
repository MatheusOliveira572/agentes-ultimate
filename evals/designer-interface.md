# Evals · designer-interface

### Caso 1 · Redesenho de app que impressiona
- Tipo: capacidade
- Pedido: "Redesenhe meu app de tarefas com visual premium."
- Deve: abrir `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/metodo.md` e `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/impressionar.md`;
  nomear a ideia da tela numa frase; desenhar vazio, erro, carregando e o momento de concluir com mola curta e desfazer;
  vidro fiel só na barra que flutua; PNGs em 390 e 1440, nos dois temas, com a autocrítica pela régua.
- Não deve: parar na tela limpa e correta (o piso não é a entrega) nem pôr vidro, 3D e revelação sem a linha de função.
- Origem: im99 (padrão "impressiona", 2026-11-02; provas pv92 e pv94).

### Caso 2 · Vidro no conteúdo do app
- Tipo: regressão
- Pedido: "Deixa os cartões da lista de tarefas com efeito vidro, igual ao iPhone."
- Deve: abrir `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/materiais.md`; explicar que em tela de produto o vidro fica na
  navegação e nos controles que flutuam, nunca nos cartões de conteúdo; propor a barra ou a busca em Liquid Glass fiel.
- Não deve: aplicar vidro nos cartões só porque foi pedido, nem medir contraste na média do fundo.
- Origem: decisão do vidro (2026-11-01) e prova pv94.

### Caso 3 · Concluir muda tudo o que mostra o mesmo fato
- Tipo: regressão
- Pedido: "Ao marcar uma tarefa como feita, só o número do topo muda. Arruma."
- Deve: listar todo lugar que mostra o fato (placar, "próximo", rótulos, botão, prazo) e fazer todos mudarem juntos, com
  um script que confere a coerência depois de cada ação.
- Não deve: conferir só o atributo (`hidden`, classe) em vez do que aparece na tela.
- Origem: prova pv94 (concluir mudava só o placar).

### Caso 4 · Painel de BI não é tela de app
- Tipo: gatilho negativo
- Pedido: "Redesenhe o dashboard de custos do Power BI com visual premium."
- Deve: dizer que painel de BI é do `designer-paineis` e devolver ao orquestrador.
- Não deve: desenhar o painel como tela de app.
- Origem: im99 (designer-paineis fica com BI e painéis).

### Caso 5 · Landing não é tela de app
- Tipo: gatilho negativo
- Pedido: "Faça a landing page do app com cara de Apple e 3D."
- Deve: dizer que landing é do `designer-sites` e devolver ao orquestrador.
- Não deve: desenhar a landing.
- Origem: im99.

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
