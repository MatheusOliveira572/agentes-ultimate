<!-- Texto próprio do agentes-ultimate. Método de auditoria de código de app Apple, escrito a partir da HIG pública (https://developer.apple.com/design/human-interface-guidelines). Ideia de roteiro inspirada no apple-design-skill (sem licença; nada copiado). -->
<!-- ref: tema=apple-auditoria; palavras=hig, auditoria do app ios, app store, auditar o app ios, auditoria do app apple, conformidade com a hig, revisar codigo swiftui, app da apple store, revisao para a app store; agentes=engenheiro-software -->
<!-- teste-ref: sim=faça a auditoria do app ios contra a HIG antes de mandar para a app store | revise o código swiftui do app para conformidade com a hig; nao=calcule a margem de contribuição do produto -->
# Auditar código de app Apple contra a HIG

## Método
1. **Situe a plataforma e a versão:** iOS/iPadOS/macOS/watchOS/visionOS, SwiftUI ou UIKit, versão mínima do sistema
   (o `Info.plist`/projeto diz). Recurso novo (ex.: o material "Liquid Glass", introduzido em 2025) só vale onde a versão
   mínima o tem; abaixo dela, o caminho de reserva tem de existir.
2. **Leia por assunto**, não o app inteiro: navegação, toque, texto, cor e materiais, componentes, movimento,
   acessibilidade, privacidade e permissões. Para cada assunto, o arquivo de `plataformas/ios.md` e a página da HIG.
3. **Cada achado com `arquivo:linha`**, a regra (com o link da página da HIG) e a correção. O que você deduziu sem ver
   rodando é "inferido, não verificado".
4. **Prove no Simulador** o que dá (modo escuro, Dynamic Type grande, Reduzir Movimento, Aumentar Contraste, idioma
   da direita para a esquerda) e diga o que só o aparelho confirma.

## O que procurar no código
- Tamanho de fonte fixo (`.font(.system(size:))` sem `relativeTo:`) → estilos de texto do Dynamic Type.
- Cor em hex/RGB fixo → cores semânticas e assets com variante escura e de alto contraste.
- `.ignoresSafeArea()` em conteúdo interativo; controles sob o notch ou o indicador de início.
- Gesto de voltar desligado (`interactivePopGestureRecognizer` desativado) ou navegação própria no lugar da pilha.
- Botão menor que 44 × 44 pt (`.frame` pequeno sem `.contentShape` maior).
- Ícone de imagem sem `accessibilityLabel`; controle feito de `onTapGesture` em vez de `Button` (some do VoiceOver e do
  teclado).
- Animação sem checar `accessibilityReduceMotion`; transparência sem checar `accessibilityReduceTransparency`.
- Desfoque ou "vidro" feito à mão por cima de conteúdo, em vez dos materiais do sistema.
- Pedido de permissão (câmera, localização, contatos) sem o texto de motivo no `Info.plist` ou pedido logo ao abrir, sem
  contexto.
- Pagamento com Apple Pay: o botão oficial do sistema (`PKPaymentButton`/`PayWithApplePayButton`), nunca desenhado à mão.

## Relatório
Resumo; críticos (quebram uso ou acessibilidade); melhorias; acabamento; **o que já está certo**; por plataforma, o que
muda. Cada item: `arquivo:linha`, regra + link, correção, verificado ou inferido.
