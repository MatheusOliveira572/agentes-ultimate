<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (páginas accessibility, typography, layout, abertas em 2026-11-01). Nada copiado; cada regra cita a página. -->
<!-- ref: tema=apple-acessibilidade; palavras=dynamic type, tamanho minimo da fonte, alvo de toque, 44 pt, contraste apple, acessibilidade ios, voiceover, reduzir movimento, aumentar contraste; agentes=designer-interface, designer-paineis, designer-documentos, engenheiro-software -->
<!-- teste-ref: sim=confira se o app ios atende ao dynamic type e ao alvo de toque de 44 pt | revise a acessibilidade do app iphone: voiceover, contraste e reduzir movimento; nao=elabore o termo de rescisão do contrato -->
# Lente 1: acessibilidade, tipo e toque (falha = Crítico)

## Tamanho de texto (HIG › Typography › Ensuring legibility; HIG › Accessibility › Vision)
| Plataforma | Padrão | Mínimo |
|---|---|---|
| iOS, iPadOS | 17 pt | 11 pt |
| macOS | 13 pt | 10 pt |
| tvOS | 29 pt | 23 pt |
| visionOS | 17 pt | 12 pt |
| watchOS | 16 pt | 12 pt |
- O texto acompanha a preferência de tamanho do sistema (Dynamic Type) e o layout sobrevive aos maiores tamanhos de
  acessibilidade com a hierarquia intacta; corte de texto mínimo ao crescer (mostrar no maior tamanho de acessibilidade
  tanto quanto no maior padrão); em espaço horizontal apertado, reorganize (ex.: ícone e hora descem para baixo do
  texto). (HIG › Typography › Supporting Dynamic Type)
- Pesos finos e leves fogem do texto pequeno. Poucos tipos de letra; estilos de texto do sistema para a hierarquia.
  (HIG › Typography › Conveying hierarchy, Using system fonts)

## Contraste (HIG › Accessibility › Vision; HIG › Dark Mode › Dark Mode colors)
| Texto | Mínimo |
|---|---|
| até 17 pt | 4,5:1 |
| 18 pt ou mais, ou negrito | 3:1 |
Calcule pelos valores reais e mostre os números. Valha nos dois modos (claro e escuro) e com Aumentar Contraste. Cores
do sistema já têm variantes acessíveis.

## Toque e clique (HIG › Accessibility › Mobility)
| | Padrão | Mínimo |
|---|---|---|
| celular (iOS, iPadOS) | 44 × 44 pt | 28 × 28 pt |
| desktop (macOS) | 28 × 28 pt | 20 × 20 pt |
O espaço entre controles importa tanto quanto o tamanho. Na web, o equivalente: 44 × 44 px no toque, mínimo AA de 24 ×
24 px (`../acessibilidade/INDICE.md`).

## O resto da lente
- Nada depende só de cor (ícone, texto ou forma junto). (HIG › Accessibility › Vision; HIG › Color › Inclusive color)
- Todo controle só com ícone tem rótulo para o leitor de tela (VoiceOver). No desktop, tudo funciona só com o teclado.
- Movimento é opcional e nunca o único portador de sentido; **Reduzir Movimento**, **Reduzir Transparência** e
  **Aumentar Contraste** têm resposta definida. (HIG › Accessibility; HIG › Motion)
- Som acompanhado de vibração (háptico) quando informa algo. (HIG › Accessibility › Hearing)
- Audite com a ferramenta de inspeção de acessibilidade da plataforma (Accessibility Inspector). (HIG › Accessibility)
