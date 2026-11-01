<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (páginas color, dark-mode, abertas em 2026-11-01). Nada copiado; cada regra cita a página. -->
<!-- ref: tema=apple-cor; palavras=cor do sistema, cores semanticas, modo escuro do app, dark mode, tema escuro ios, cor de destaque, tint, display p3, cor apple; agentes=designer-paineis, designer-documentos, engenheiro-software -->
<!-- teste-ref: sim=acerte as cores semânticas e o modo escuro do app ios | o dark mode do app está com contraste ruim e cor de destaque demais; nao=faça a projeção de receita por canal -->
# Lente 3 (cor): cor e modo escuro

## Cor (HIG › Color)
- **Uma cor, um significado** em toda a interface, sobretudo para estado e interatividade. (› Best practices)
- Toda cor funciona em **claro, escuro e Aumentar Contraste**; teste em aparelhos diferentes (a tela True Tone muda o
  ponto de branco). (› Best practices)
- Arte e translucidez mudam a cor vizinha: ajuste o entorno para manter a continuidade. (› Best practices)
- **Nunca só a cor** para diferenciar, indicar interação ou informar algo essencial. (› Inclusive color)
- Contraste suficiente para ícone e texto; o significado da cor muda entre culturas (vermelho é perigo em umas e sorte em
  outras). (› Inclusive color)
- **Não fixe os valores das cores do sistema** no código (mudam entre versões e com as preferências); **não redefina o
  significado** das cores dinâmicas. (› System colors)
- Sobre fundo colorido, **rótulos de controle sem cor parecida com o fundo**; cuidado com a sobreposição de cores
  parecidas entre a camada de conteúdo e os controles. (› Liquid Glass color)
- **Cor ampla (Display P3)** onde a tela permite; dê variantes por espaço de cor quando duas cores P3 próximas viram uma
  só no sRGB. (› Color management)
- Cor de destaque da marca **com parcimônia** (nos controles principais e no estado), sem inundar a interface.
  (HIG › Branding)

## Modo escuro (HIG › Dark Mode)
- **Sem opção de aparência só do app:** siga a do sistema (inclusive o Automático). (› Best practices)
- O app fica bom nos **dois** modos. (› Best practices)
- **Cores que se adaptam** (semânticas); cor própria vem como conjunto com variante clara e escura. (› Dark Mode colors)
- Contraste de no mínimo **4,5:1** em todas as aparências. (› Dark Mode colors)
- **SF Symbols** com cores dinâmicas; imagem e ícone coloridos conferidos nos dois modos (um só arquivo se servir aos
  dois). (› Icons and images)
- Rótulos com as cores de rótulo do sistema (primária a quaternária); campos de texto com as vistas do sistema.
  (› Text)
- Fundos do sistema: no escuro, a base passa a "elevada" quando algo vem para frente (popover, folha). (› iOS, iPadOS)

## Na web e no Power BI
Mesmas regras com tokens semânticos claro/escuro (`../cor/INDICE.md`) e `prefers-color-scheme`; no Power BI, tema com as
duas paletas e contraste medido em cada uma.
