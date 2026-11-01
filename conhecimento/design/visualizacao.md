<!-- Texto próprio do agentes-ultimate. Resumo de prática de visualização de dados, apoiado na HIG pública (https://developer.apple.com/design/human-interface-guidelines/charting-data) e nas referências dos designers do plugin. -->
<!-- ref: tema=visualizacao-de-dados; palavras=visualizacao de dados, grafico de barras, grafico de linha, tipo de grafico, qual grafico usar, eixo zero, legenda, cores das series, painel de dados, kpi; agentes=designer-paineis, designer-documentos -->
<!-- teste-ref: sim=qual gráfico usar para comparar as vendas por região no painel de dados | o gráfico de linha está com legenda confusa e cores das séries demais; nao=elabore o contrato de prestação de serviço -->
# Visualização de dados (painel e relatório)

- **Comece pela pergunta** que o gráfico responde; o título diz a conclusão ("Custo 4% acima da meta em março"), não o
  nome do gráfico.
- **Tipo pelo que se compara:** categorias → barras (horizontais com rótulo longo); tempo → linha (ou colunas com poucos
  pontos); parte do todo → barra empilhada ou 100% (pizza só com 2–3 fatias); desvio contra meta → barras de diferença;
  distribuição → histograma ou caixa; relação → dispersão.
- **Barras começam no zero.** Linha pode recortar o eixo, com o recorte visível.
- **Poucas cores:** uma cor de destaque para o que importa e cinza para o resto; cor de estado só com significado
  (bom/ruim); nunca só a cor para separar séries (rótulo direto no fim da linha em vez de legenda distante).
- **Rótulo direto** e números com unidade e casas fixas, tabulares; sem eixo duplo salvo necessidade explicada.
- **Ordenação com sentido:** do maior para o menor, ou na ordem natural (tempo, etapa).
- **Simples primeiro, detalhe sob demanda** (dica, clique para detalhar). Mesmo tipo e escala para gráficos de propósito
  parecido.
- **Acessível:** descrição de cada série e valor para leitor de tela, sem termo subjetivo (`apple/graficos.md`).
- Painel: modo Operar (`modos/operar.md`); pior caso dos dados (`pior-caso.md`): zero, negativo, muito grande, sem dado.
