<!-- Texto próprio do agentes-ultimate (2026-11-02), a partir de ../apple/ (HIG pública, páginas abertas em 2026-11-01), ../sites-premium/efeitos/vitrine-apple.md e da prova pv94. Um mundo entre os outros, não o padrão do plugin. -->
<!-- ref: tema=mundo-apple; palavras=mundo apple, cara de apple, estilo apple, liquid glass, vidro da apple, visual de iphone; agentes=designer-interface, designer-sites, designer-paineis, designer-documentos, revisor -->
<!-- teste-ref: sim=quero o app com cara de Apple e Liquid Glass | use o mundo Apple com vidro da Apple na barra; nao=monte o fluxo de caixa do trimestre -->
# Mundo: Apple / Liquid Glass

**A sensação:** o conteúdo em primeiro plano; controles de vidro flutuando sobre ele; precisão ao pixel e movimento físico.
O detalhe está em `../apple/INDICE.md` (HIG) e no módulo `<plugin>/modelos/liquid-glass/`; aqui só o resumo do mundo.

## Quando usar / quando não
- **Sim:** app que roda em iPhone, iPad ou Mac; produto de consumo com objeto físico para mostrar; pedido explícito
  ("cara de Apple", "Liquid Glass"); projeto que registrou esse gosto em `PROJETO.md` › "Gosto visual".
- **Não:** app só Android (use as convenções dele); marca com identidade forte própria; painel de Power BI (não há
  desfoque nem lente: simule com imagem pronta, ou escolha outro mundo); quando o vidro não tiver conteúdo vivo por trás.

## Tipografia
- Em app Apple: a fonte do sistema (SF) pela pilha `-apple-system, system-ui`, que só aparece em aparelho Apple.
- **Não embuta SF Pro em site nem em PDF:** a licença da Apple permite a SF só para maquetes de interface de software das
  plataformas Apple e proíbe embutir (https://developer.apple.com/fonts/, aberta em 2026-11-02).
- Fora do aparelho Apple (web, slide): **Inter** com **Inter Tight** no degrau de exibição (OFL); números tabulares.
- Escala com degrau de exibição forte (título ≥ 2,5× o corpo), tracking negativo leve no grande, `opsz` automático.

## Cor
- Neutros do sistema em camadas (claro e escuro desenhados, não invertidos); **um** acento da marca.
- A cor do vidro vem do que passa por trás (tinta que se adapta); nada de vidro colorido fixo.

## Material e profundidade
- **Liquid Glass só no que flutua** (navegação, controles; na landing, também o cartão-vitrine): lente que entorta na
  borda, aro de luz não uniforme, tom que muda com a foto de trás (`../apple/materiais.md` §receita e teste).
- 3 a 4 camadas: fundo de conteúdo, superfície, vidro flutuante, foco. Sombra macia, uma luz (o ponteiro; sem ponteiro,
  de cima à esquerda).

## Movimento
- Mola Apple: duração 0,5 s, quique 0,15 (quase imperceptível). CSS, 700 ms:
  `linear(0, 0.021, 0.075, 0.15, 0.235, 0.324, 0.413, 0.498, 0.576, 0.647, 0.71, 0.765, 0.812, 0.853, 0.886, 0.914,
  0.936, 0.954, 0.968, 0.98, 0.988, 0.994, 0.999, 1.002, 1.004, 1.005, 1.006, 1.006, 1.006, 1.006, 1.005, 1.005,
  1.004, 1.004, 1.003, 1.003, 1.002, 1.002, 1.002, 1.001, 1)`. A mola curta da vitrine (`vitrine-apple.md`) serve à landing.
- Camadas que se separam e se juntam (abas que se recolhem, busca que se aproxima); interrompível, segue o gesto.

## Forma
Cápsula e raios **concêntricos** (raio interno = externo − recuo); cantos contínuos com `corner-shape: squircle` e reserva
`@supports`. Ícones de traço único, peso alinhado ao texto.

## Imagem e 3D (o que é "real" aqui)
A foto do produto ou o próprio conteúdo do usuário, nítidos a 2×. 3D só para o objeto do produto (material físico com
mapa de ambiente), nunca ícone 3D genérico. Na landing, 3D e revelação ao rolar como camada de impacto
(`../sites-premium/efeitos/vitrine-apple.md`), com uma ideia só.

## 3 sinais de amador
1. "Glassmorphism": fosco branco com borda cinza, sobre fundo liso, sem lente (reprova o teste "parece Apple").
2. Vidro no conteúdo (cartão de dado, lista, texto longo), derrubando o contraste.
3. SF Pro embutida no site, ou ícones e telas da Apple copiados como se fossem do produto.

## Referência (só ideia, nada copiado)
- **Apple (HIG, Materials)**: o Liquid Glass forma a camada de controles e navegação, acima do conteúdo.
  https://developer.apple.com/design/human-interface-guidelines/materials (aberta em 2026-11-01, por `../apple/materiais.md`)
