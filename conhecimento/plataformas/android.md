<!-- Adaptado de pbakaus/impeccable/skill/reference/android.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0 (por sua vez destilado de ehmo/platform-design-skills, © 2026 ehmo, MIT, conforme o NOTICE do impeccable). Alterações: tradução, corte; alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md) e terceiros/ehmo-platform-design-skills/. -->
<!-- ref: tema=android; palavras=android, jetpack compose, material design, material 3, app android, kotlin, emulador android, adb, material you; agentes=engenheiro-software, designer-paineis -->
<!-- teste-ref: sim=construa a tela inicial do app android em jetpack compose com material 3 | revise o app android: voltar do sistema, alvos de toque e tema escuro; nao=monte o cronograma de férias do time -->
# Android nativo (Jetpack Compose, Views, React Native, Expo, Flutter)

O Material Design 3 governa estrutura, navegação e interação; a marca entra pelo tema do Material (papéis de cor, escala
de tipo, forma, movimento). App multiplataforma "Material em todo lugar" no iPhone, ou "iOS com pele de Android", falha.

**Teste:** um usuário fluente de Android tropeçaria em componente fora do padrão? O sinal mais comum é o app de iPhone
vestido de Android: só barra inferior copiada, seta de voltar que ignora o Voltar do sistema, switches com cara de iOS.

## Layout
- **Navegação pelo tamanho:** barra de navegação inferior (3–5 destinos) na largura compacta; trilho ou gaveta na
  expandida. Nunca a barra do telefone sem ajuste no tablet.
- **O Voltar do sistema sempre funciona** (gesto preditivo e botão); nunca prender o usuário nem sequestrar o gesto.
- **De borda a borda com os insets:** barra de status, barra de navegação, recorte da tela e teclado; nada escondido atrás.
- **Barra superior** com o contexto da tela; FAB quando a tela tem uma ação principal.

## Toque e texto
- Alvo de toque **mínimo de 48 × 48 dp**, com pelo menos 8 dp entre alvos.
- **Escala de tipo do Material** (Display, Headline, Title, Body, Label; grande/médio/pequeno): texto por papel, nunca
  tamanho escolhido tela a tela. Roboto é a fonte do sistema; a da marca entra pela escala. Sempre **sp**, nunca px fixo.

## Cor e tema
- **Papéis de cor** (primary, on-primary, surface, surface-variant, secondary-container, outline, error): resolvem claro,
  escuro e contraste; hex solto quebra.
- **Cor dinâmica** (Material You, Android 12+) onde couber, com esquema fixo de reserva.
- Tema escuro de primeira classe, nunca inversão rápida.
- **Elevação tonal** (níveis de superfície, com sombra onde couber); nada de sombra arbitrária.

## Componentes e movimento
Componentes do Material (botões preenchido/tonal/contornado/texto, FAB, switches, chips, snackbars, folhas inferiores,
diálogos, barra/trilho/gaveta). **Um FAB, uma ação principal.** Snackbar para retorno passageiro; diálogo só para decisão
que precisa interromper. Movimento do Material (transformação de contêiner, eixo compartilhado, esmaecer-trocar) com
curvas e durações padrão; com "Remover animações" ligado, esmaecer ou corte seco.

## Verificar
- Capturas do emulador ou do aparelho, nunca do navegador: `adb exec-out screencap -p > <arquivo>` (`adb -s <serial>` com
  vários), em cada classe de aparelho que o app atende.
- Tema escuro (`adb shell cmd uimode night yes`) e escala de fonte (`adb shell settings put system font_scale 1.3`) no
  passe; leia os valores antes e **devolva-os ao fim** (é a configuração do aparelho do usuário).
- Emulador dá abrangência; gestos, taxa de atualização e desempenho pedem aparelho. Diga qual produziu a prova.
