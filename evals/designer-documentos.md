# Evals · designer-documentos

### Caso 1 · Planilha com cara de rascunho
- Tipo: regressão
- Pedido: "Formate esta planilha de análise para enviar à diretoria."
- Deve: cabeçalho destacado, unidade única declarada no cabeçalho, números à direita, gráfico nativo do ponto principal; arquivo aberto e conferido.
- Não deve: entregar só a tabela crua, sem gráfico nem formatação.
- Origem: Erro conhecido "planilha sem gráfico e sem cabeçalho parece rascunho".

### Caso 2 · Slide-documento
- Tipo: regressão
- Pedido: "Transforme este relatório de 20 páginas numa apresentação."
- Deve: poucos slides com títulos-ação que contam a história sozinhos; um ponto por slide que passa no teste do relance (~3 s); detalhe em anexo ou documento.
- Não deve: 15 ou mais slides de tópicos copiados do relatório.
- Origem: Erro conhecido "slide-documento"; Duarte (teste do relance); Tufte.

### Caso 3 · Gráfico pela relação
- Tipo: capacidade
- Pedido: "Mostre o orçado × realizado das 8 áreas num slide."
- Deve: identificar a relação como desvio e usar barra divergente ou ponte; cinza para o contexto e cor de destaque só no desvio do título.
- Não deve: usar pizza ou barras todas coloridas sem destaque.
- Origem: Financial Times (Visual Vocabulary); Storytelling with Data.

### Caso 4 · Painel interativo não é documento
- Tipo: gatilho negativo
- Pedido: "Desenhe a nova página do painel de BI com filtros e drill."
- Deve: devolver ao designer-paineis.
- Não deve: especificar a página do painel.
- Origem: Fora do escopo (→ designer-paineis).

### Caso 5 · Imagem feita com IA no folheto
- Tipo: capacidade
- Pedido: "Gere uma foto de uma equipe sorrindo na obra para o folheto aos investidores."
- Deve: rotular a imagem como feita com IA no folheto e no arquivo exportado, porque o investidor pode achar que é a equipe real; conferir os termos da ferramenta de IA para uso comercial.
- Não deve: entregar a imagem como se fosse foto real.
- Origem: checklists do autor do plugin (itens 32 e 33).

### Caso 6 · Lê a tipografia antes de formatar
- Tipo: regressão
- Pedido: "Formate o relatório trimestral em PDF: está com fonte pequena, entrelinha apertada e títulos confusos."
- Deve: abrir `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/tipografia/INDICE.md` (ou a referência passada), aplicar a escala com entrelinha por papel (corpo 1,3–1,5 no impresso, títulos em 2–3 níveis), números tabulares nas tabelas e unidade no cabeçalho, mantendo a fonte da marca; citar no relatório a referência lida.
- Não deve: trocar a fonte da marca por gosto, nem usar peso fino em texto pequeno.
- Origem: B2 (jakub better-typography).


### Caso 7 · Ilustração técnica sem inventar dimensão
- Tipo: capacidade
- Pedido: "Faça uma vista explodida do equipamento para o manual, a partir desta foto."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/documentos/ilustracao-tecnica.md`, registrar a prova em `evidencia.md` (o que é da foto fica "estimado", o que é escondido é omitido ou "ilustrativo"), usar a ferramenta `ferramentas/teardown/` e renderizar antes de entregar.
- Não deve: apresentar como desenho de fabricação nem inventar medida como se fosse real.
- Origem: B2 (jakub teardown).

### Caso 8 · Equivalência Apple: apresentação no estilo Apple
- Tipo: regressão
- Pedido: "Monte a apresentação do lançamento no estilo das keynotes da Apple."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/fundamentos.md` e `cor-e-modo-escuro.md`: uma ideia por slide, a marca cede ao conteúdo, cor de destaque com critério, poucos tipos, contraste medido (4,5:1 no texto pequeno), a ousadia num lugar só; citar `HIG › tema` nas decisões.
- Não deve: copiar logotipo, fonte ou imagem da Apple, nem encher de gradiente e vidro decorativo.
- Origem: B3 (HIG › Branding; Color; equivalência com o apple-design-skill).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
| 2026-10-27 | 1 | não rodado | casos criados na elevação ao padrão de excelência |
