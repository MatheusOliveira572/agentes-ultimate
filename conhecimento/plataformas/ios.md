<!-- Adaptado de pbakaus/impeccable/skill/reference/ios.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0 (por sua vez destilado de ehmo/platform-design-skills, © 2026 ehmo, MIT, conforme o NOTICE do impeccable). Alterações: tradução, corte; alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md) e terceiros/ehmo-platform-design-skills/. -->
<!-- ref: tema=ios; palavras=ios, ipados, swiftui, uikit, app de iphone, app nativo apple, xcode, simulador do ios, dynamic type, sf symbols; agentes=engenheiro-software, designer-interface, designer-paineis -->
<!-- teste-ref: sim=construa a tela de configurações do app de iphone em swiftui | revise o app ios: alvos de toque, dynamic type e sf symbols; nao=escreva o código de conduta do fornecedor -->
# iOS e iPadOS nativos (SwiftUI, UIKit, React Native, Expo, Flutter)

A HIG governa estrutura, navegação e interação; a marca se expressa no que a plataforma deixa aberto (cor de destaque,
tipo em momentos de destaque, movimento, conteúdo). Texto completo da Apple, em palavras nossas: `design/apple/` (pasta
conhecimento).

**Teste do "veio do site":** um usuário fluente de iPhone confiaria neste app ou estranharia controles fora do padrão? Os
sinais: barra de navegação reinventada, gesto de voltar próprio, botão com cara de web, coisa que depende de hover. Use os
componentes da plataforma; fuja deles só com motivo.

## Layout
- Dentro das **áreas seguras**: nada sob o notch, a Dynamic Island, o indicador de início ou os cantos arredondados.
- **Navegação do sistema:** barra de abas para 2–5 seções (seções, nunca ações); pilha de navegação para hierarquia;
  folha (sheet) para tarefa autocontida. Sem navegação global própria nem metáforas misturadas.
- **O gesto de voltar pela borda esquerda** continua vivo; nunca desligado nem coberto.
- **Título grande** nas telas de topo, recolhendo ao rolar; telas de detalhe com título em linha.

## Toque e texto
- Alvo de toque **mínimo de 44 × 44 pt**, com folga entre alvos vizinhos.
- **Dynamic Type:** estilos de texto do sistema (de Large Title a Caption); nada de tamanho fixo. Corpo 17 pt; piso 11 pt.
- **San Francisco** na interface (SF Pro / SF Compact); a fonte da marca só em momentos de destaque.

## Cor e materiais
- **Cores semânticas do sistema** (label, secondaryLabel, systemBackground, separator, tint): se adaptam ao modo escuro e
  ao aumento de contraste; hex solto quebra lá.
- Modo escuro é aparência de primeira classe: desenhe e teste os dois.
- **Uma cor de destaque** (tint) para o que é interativo; decorar não é função dela.
- **Materiais do sistema** para desfoque e translucidez atrás de barras e folhas; nada de "vidro" feito à mão.

## Componentes
Controles da plataforma (switch, controle segmentado, stepper, seletores, action sheet, alerta, menu de contexto, ações por
deslizar). **SF Symbols** para ícones (alinhados à linha de base, seguem o Dynamic Type); não misture ícones da web.
Modal com propósito: folha para subtarefa que se dispensa, tela cheia para imersão; Cancelar/Concluir claros; deslizar
para fechar respeitado, salvo se perder dado (aí, confirmação). Listas agrupadas para conteúdo de ajustes.

## Movimento
Transições do sistema (empurrar desliza, folha sobe, fechar desfaz a entrada). Com **Reduzir Movimento** ligado, troque
paralaxe e deslizes grandes por esmaecer.

## Verificar
- Capturas do **Simulador**, nunca do navegador: `xcrun simctl io booted screenshot <arquivo>` (com vários abertos, o UDID de
  `xcrun simctl list devices booted`).
- Modo escuro (`xcrun simctl ui booted appearance dark`) e um tamanho grande de Dynamic Type no mesmo passe (pega o texto
  cortado que o layout fixo esconde).
- Simulador dá abrangência; postura, gestos e desempenho pedem aparelho. Diga qual produziu a prova.
