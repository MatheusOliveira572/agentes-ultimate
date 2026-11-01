<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (página materials, aberta em 2026-11-01; Liquid Glass, mudança de 2025-09-09) e da documentação pública do CSS (MDN). Nada copiado; cada regra cita a fonte. -->
<!-- ref: tema=apple-materiais; palavras=efeito vidro, vidro, glass, glassmorphism, liquid glass, desfoque, blur, backdrop-filter, translucido, translucidez, fosco, card de vidro; agentes=designer-paineis, engenheiro-software, designer-documentos -->
<!-- teste-ref: sim=faça um card com efeito vidro estilo Apple | quero glassmorphism com backdrop-filter na barra de navegação, translúcido; nao=calcule o custo médio ponderado do estoque -->
# Materiais e efeito vidro (Liquid Glass)

## Quando usar vidro (HIG › Materials › Liquid Glass)
- **Só na camada funcional que flutua sobre o conteúdo:** barras de navegação, barras de ferramentas, abas, controles,
  folhas, menus. **Nunca na camada de conteúdo** (cartões de dado, listas, texto corrido): ali o vidro apaga a diferença
  entre o que se toca e o que se lê e acrescenta complexidade sem função.
- **Com parcimônia:** os componentes padrão já ganham o material sozinhos; em controle próprio, use pouco.
- **Duas variantes:** a **regular** desfoca e ajusta a luminosidade do que está atrás para o texto continuar legível (e o
  efeito de borda de rolagem reforça a legibilidade); a **clara** é muito translúcida, para quando o conteúdo de trás
  (foto, vídeo, mapa) deve continuar em evidência. Com conteúdo claro atrás da variante clara, ponha uma **camada escura
  de 35% de opacidade** por baixo. (HIG › Materials › Liquid Glass)
- Por baixo do vidro, os **materiais padrão** (ultrafino, fino, regular, grosso) dão estrutura; escolha pelo **papel**,
  nunca pela cor que eles parecem dar (as preferências do sistema mudam a aparência). (HIG › Materials › Standard
  materials)
- Texto sobre material com os níveis de vibração do sistema: normal para texto padrão, secundário para nota e subtítulo,
  terciário só para inativo que não precisa ser muito legível. (HIG › Materials › visionOS)
- O piso de qualidade recusa **vidro como enfeite** (`../piso-de-qualidade.md`): se o vidro não separa controle de
  conteúdo, tire.

## Como fazer na web (CSS; MDN: `backdrop-filter`, `@supports`, `prefers-reduced-transparency`)
```css
.vidro {                               /* barra ou cartão FLUTUANTE sobre conteúdo */
  background: rgb(255 255 255 / 0.55); /* fundo translúcido (escuro: rgb(28 28 30 / 0.55)) */
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  backdrop-filter: blur(16px) saturate(170%);
  border: 1px solid rgb(255 255 255 / 0.45);   /* borda clara e fina */
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);    /* sombra suave, com deslocamento */
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .vidro { background: rgb(255 255 255 / 0.92); }   /* sem suporte: fundo quase opaco */
}
@media (prefers-reduced-transparency: reduce) { .vidro { background: rgb(255 255 255 / 0.96); backdrop-filter: none; } }
@media (prefers-contrast: more) { .vidro { background: #fff; border-color: #000; } }
```
**[ESTIMATIVA: ponto de partida nosso, não da Apple]** desfoque 12–20 px, saturação 150–180%, fundo com 50–70% de
opacidade; ajuste medindo o contraste. A Apple não publica valores de CSS.

## Acessibilidade do vidro
- **Contraste no pior fundo:** meça o texto contra a parte mais clara (e a mais escura) do que pode passar por trás, não
  contra a média. Não passou: mais opacidade, a camada escura de 35% (variante clara) ou texto mais forte.
- `prefers-reduced-transparency: reduce` → fundo opaco, sem desfoque (equivale ao Reduzir Transparência da Apple).
  Suporte ainda parcial nos navegadores: trate como melhoria progressiva.
- `prefers-contrast: more` → fundo sólido e borda forte. `prefers-reduced-motion: reduce` → nada de reflexo que se mexe,
  paralaxe ou "brilho" animado no vidro.

## Desempenho
- **[ESTIMATIVA]** no máximo 2–3 superfícies de vidro visíveis ao mesmo tempo, e nunca vidro sobre vidro: cada
  `backdrop-filter` obriga a recompor tudo o que está atrás a cada quadro de rolagem.
- No celular, o desfoque grande em área grande pesa (bateria, quadros perdidos): área pequena, desfoque menor, e meça
  rolando num aparelho de alguns anos (`../../engenharia/desempenho-web.md`).
- Não anime o raio do desfoque; anime só `opacity`/`transform` do elemento.

## O que não funciona em cada plataforma
| Plataforma | Vidro real | O que fazer |
|---|---|---|
| iOS/iPadOS/macOS 26+ (SwiftUI/UIKit/AppKit) | sim, o material do sistema | use os componentes padrão; efeito próprio com parcimônia |
| versões anteriores da Apple | materiais (desfoque) sim, Liquid Glass não | caminho de reserva com os materiais padrão |
| navegador moderno | `backdrop-filter` (com prefixo `-webkit-` no Safari) | receita acima + `@supports` |
| navegador sem suporte, modo de economia | não | fundo quase opaco (o `@supports not`) |
| e-mail HTML, PDF, impressão | não | cor sólida; vidro não existe nesses meios |
| **Power BI** | **não há desfoque do que está atrás** (os visuais não leem o fundo) | só simular: **imagem de fundo pronta** já com a área desfocada/clareada no lugar do cartão, e o cartão com fundo semitransparente por cima; muda o layout, refaça a imagem |
| Android nativo | desfoque de fundo limitado e caro | superfícies tonais do Material (`../../plataformas/android.md`) |
