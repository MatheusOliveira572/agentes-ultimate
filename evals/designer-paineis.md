# Evals · designer-paineis

### Caso 1 · Seleção que muda de item ao reordenar
- Tipo: regressão
- Pedido: "Especifique a lista de gerências clicável: o diretor clica numa linha e o cartão ao lado mostra o detalhe dela. A lista é ordenada pelo desvio."
- Deve: especificar a seleção pela identidade do item (código da gerência), não pela posição; descrever o que acontece quando a ordem muda ou o item some do filtro.
- Não deve: guardar "a 3ª linha" como seleção, ou não dizer nada sobre reordenação.
- Origem: Erro conhecido "seleção guardada pela posição muda de item quando a lista reordena".

### Caso 2 · Painel que abre por cima da página
- Tipo: regressão
- Pedido: "Desenhe um seletor que abre um painel com busca por cima da página de contas."
- Deve: dizer que o painel esconde (ou bloqueia) o que fica embaixo, ter altura fixa que cai num vão da grade e prever o estado vazio da busca.
- Não deve: deixar o painel transparente ao clique ou com altura livre que termina em cima de outra peça.
- Origem: Erros conhecidos "painel por cima precisa esconder o que fica embaixo" e "painel de altura livre".

### Caso 3 · Notação de desvio e acessibilidade
- Tipo: capacidade
- Pedido: "Proponha a tabela de orçado × real × tendência por área para o diretor financeiro, com destaque para quem estourou."
- Deve: uma só unidade declarada no cabeçalho; cenários distinguidos por padrão (real cheio, orçado vazado, tendência hachurada) e não por cor; verde/vermelho só no desvio, sempre com sinal ou seta; tabela de contraste com cada par ≥ 4,5:1 (ou 3:1 em texto grande); desvio em barras divergentes a partir do zero, com o número-herói no topo à esquerda.
- Não deve: usar vermelho como único sinal de estouro, cores diferentes para cada cenário, ou misturar "mil" e "mi" na mesma coluna.
- Origem: Financial Times (desvio = barras divergentes contra a referência), IBCS (cenários e cores) e WCAG 2.2 critérios 1.4.1 e 1.4.3.

### Caso 4 · Pior caso de texto
- Tipo: capacidade
- Pedido: "Faça o gabarito da página de gerências com dados fictícios."
- Deve: pedir ou medir as contagens reais e o nome mais longo, gerar o PNG por script que falha se uma soma não fechar ou um texto não couber, e mostrar que o script falhou com um erro injetado.
- Não deve: entregar um PNG desenhado à mão com números que não somam ou nomes curtos de mentira.
- Origem: Método, passos 1, 3 e 6.

### Caso 5 · Pedido de fórmula
- Tipo: gatilho negativo
- Pedido: "Qual é a fórmula certa da tendência do ano e quando o desvio deve virar alerta?"
- Deve: devolver ao `analista-fpa`, dizendo que regra de cálculo e materialidade não são do designer.
- Não deve: definir a fórmula ou o limite de alerta por conta própria.
- Origem: Fora do escopo.

### Caso 6 · Acessibilidade além do contraste do texto
- Tipo: regressão
- Pedido: "Especifique o seletor de gerência e as barras de desvio da página de contas; o CFO às vezes usa só o teclado."
- Deve: tabela de contraste com o texto (≥ 4,5:1) e com o que não é texto (barras, borda do campo, anel de foco ≥ 3:1, WCAG 1.4.11), em todos os estados (normal, ao passar o mouse, selecionado, desabilitado, erro); ordem de tabulação igual à de leitura, foco visível e nada que prenda o foco; texto alternativo de cada visual e um resumo em texto do gráfico.
- Não deve: medir só o texto no estado normal, nem deixar a ordem de tabulação para o padrão do Power BI.
- Origem: checklists do autor do plugin (itens 19, 20 e 21).

### Caso 7 · "Atualizado em" fixo no texto
- Tipo: regressão
- Pedido: "Ponha no rodapé do painel "dados atualizados diariamente"."
- Deve: trocar por "Atualizado em <data e hora>" vindo da carga real (medida ligada à última carga), que muda quando a carga roda; dizer a cobertura dos dados (até que mês o real está fechado).
- Não deve: escrever uma promessa fixa que o painel não controla.
- Origem: checklists do autor do plugin (itens 27 e 30: não prometer o que não se controla).

### Caso 8 · Equivalência Apple: tela de app
- Tipo: regressão
- Pedido: "Revise a tela inicial do nosso app de iPhone no padrão da Apple."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/INDICE.md` (ou a referência passada) e aplicar as 5 lentes na ordem, com os valores da HIG citados (`HIG › tema › seção`): texto 17 pt (mínimo 11), contraste 4,5:1 até 17 pt e 3:1 a partir de 18 pt ou negrito, alvo 44 × 44 pt (mínimo 28), abas que navegam e nunca somem, vidro só na camada flutuante; relatório Resumo / Crítico / Melhorias / Acabamento / O que funciona / Plataforma.
- Não deve: revisar de memória sem citar a página, nem trazer convenção da Apple para um app só Android sem dizer.
- Origem: B3 (equivalência com o apple-design-skill; texto nosso a partir da HIG).


### Caso 9 · Equivalência Apple: painel de dados
- Tipo: regressão
- Pedido: "O painel de vendas tem 6 gráficos e ninguém entende; arrume no estilo Apple."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/graficos.md` e aplicar: gráfico simples com detalhe sob demanda, título com a conclusão, consistência entre gráficos, eixo fixo ou dinâmico pelo significado, nunca só a cor, descrição acessível sem termo subjetivo.
- Não deve: encher os gráficos de séries nem separar séries só por cor.
- Origem: B3 (HIG › Charting data; Charts).


### Caso 10 · Equivalência Apple: formulário
- Tipo: regressão
- Pedido: "Desenhe o formulário de cadastro do app no padrão Apple."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/escrita-e-primeiro-uso.md` e `movimento-e-retorno.md` e aplicar: rótulo que diz o que acontece, erro perto do campo dizendo como resolver, escolha em vez de digitação, validação ao preencher, senha nunca pré-preenchida, seletor no contexto, alvo de 44 × 44 pt.
- Não deve: validar só no fim com um alerta genérico.
- Origem: B3 (HIG › Writing; Feedback; Pickers).


### Caso 11 · Equivalência Apple: componente com animação
- Tipo: regressão
- Pedido: "Anime a abertura do cartão de detalhe como no iOS."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/movimento-e-retorno.md` e `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/movimento/INDICE.md`: movimento com propósito, breve e cancelável, curva e duração da tabela do Emil (abaixo de 300 ms, ease-out forte), Reduzir Movimento troca por esmaecer, nada oscilando.
- Não deve: inventar curva "no olho" nem animar propriedade de layout.
- Origem: B3 (HIG › Motion; Emil Kowalski).


### Caso 12 · Efeito vidro
- Tipo: regressão
- Pedido: "Faça um card com efeito vidro estilo Apple."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/apple/materiais.md`; usar o vidro só se o cartão flutua sobre conteúdo (senão, dizer que vidro em conteúdo é contra a HIG e propor alternativa); receita com `backdrop-filter` (desfoque + saturação), borda clara fina, sombra suave, fundo translúcido e reserva `@supports not`; contraste medido no pior fundo; `prefers-reduced-transparency`, `prefers-contrast` e `prefers-reduced-motion`; no máximo 2–3 superfícies de vidro; no Power BI, avisar que não há desfoque e simular com imagem de fundo pronta.
- Não deve: usar vidro como enfeite em cartão de dado, nem apresentar os valores de CSS como se fossem da Apple.
- Origem: B3 (HIG › Materials › Liquid Glass; pedido do usuário de 2026-11-01).

### Caso 13 · Carga por assunto e semáforo
- Tipo: regressão
- Pedido: "Revise a tela de custos do painel antes de ir ao usuário."
- Deve: abrir `${CLAUDE_PLUGIN_ROOT}/conhecimento/design/revisao-tela.md` (ou a referência passada pelo orquestrador) e carregar só os arquivos do assunto, entregar semáforo por impacto com até 15 achados, sistêmicos juntos, "o que funciona" e o que não foi verificado, em passadas limitadas (1 inspeção, 1 lote de correções, no máximo 1 confirmação); citar no relatório a referência lida.
- Não deve: abrir a pasta inteira nem listar uma seção por domínio.
- Origem: B7-9 (referências sob demanda).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
