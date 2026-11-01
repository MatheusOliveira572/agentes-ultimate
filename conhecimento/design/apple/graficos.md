<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (páginas charting-data e charts, abertas em 2026-11-01). Nada copiado; cada regra cita a página. -->
<!-- ref: tema=apple-graficos; palavras=grafico, graficos, chart, charts, eixo do grafico, visualizacao de dados apple, swift charts, audio graphs, legenda do grafico; agentes=designer-paineis, engenheiro-software, designer-documentos -->
<!-- teste-ref: sim=revise os gráficos do painel: eixos, legenda e descrição acessível | desenhe o gráfico de linha do app ios com swift charts no padrão apple; nao=organize o inventário físico do almoxarifado -->
# Gráficos (padrão de dados da HIG)

## Quando e quanto (HIG › Charting data)
- Gráfico para **destacar o que o dado ensina**; ele chama a atenção, então use para o importante.
- **Simples, com mais detalhe quando a pessoa pedir:** resista a encher o gráfico; detalhes sob demanda (toque, dica,
  tela de detalhe).
- **Texto que ajuda a entender:** título, subtítulo e anotações dizem a conclusão e destacam o que pede ação.
- **Consistência entre gráficos** de propósito parecido (mesmo tipo, cor e escala); só mude para destacar uma diferença.

## Anatomia (HIG › Charts)
- Eixo com marcas de referência (ex.: 0, 50%, 100%); combine tipos de marca quando ajuda (linha com pontos nos valores).
- **Faixa do eixo fixa ou dinâmica pelo significado:** fixa quando o limite tem sentido (0–100%); dinâmica quando o que
  importa é a variação.
- Rótulos de marca e de grade em **sequências familiares** (0, 5, 10...).
- **Nunca só a cor** para separar séries ou informar algo essencial (forma, rótulo direto, padrão).

## Acessibilidade do gráfico (HIG › Charts › Enhancing the accessibility)
- Descrição para leitor de tela de cada série e valor; Audio Graphs (Swift Charts) quando houver.
- **Sem termos subjetivos** na descrição ("rápido", "quase"): os números falam.
- Formato sem ambiguidade ("6 de junho", não "6/6"; unidade explícita).
- Descreva **o que representa**, não a aparência ("receita de 2025", não "a linha azul").

Visualização de dados em painel (densidade, comparação, IBCS): `../visualizacao.md` quando existir no projeto.
