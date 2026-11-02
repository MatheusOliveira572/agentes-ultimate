<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (página materials, aberta em 2026-11-01; Liquid Glass, mudança de 2025-09-09), da documentação pública do CSS (MDN) e do estudo visual de 2026-11-01 (docs/referencias-visuais-2026-11.md, seção 4). Nada copiado; cada regra cita a fonte. -->
<!-- ref: tema=apple-materiais; palavras=efeito vidro, vidro, glass, glassmorphism, liquid glass, desfoque, blur, backdrop-filter, translucido, translucidez, fosco, card de vidro; agentes=designer-sites, designer-paineis, engenheiro-software, designer-documentos -->
<!-- teste-ref: sim=faça um card com efeito vidro estilo Apple | quero glassmorphism com backdrop-filter na barra de navegação, translúcido; nao=calcule o custo médio ponderado do estoque -->
# Materiais e efeito vidro (Liquid Glass)

## Onde vale cada regra (decisão do usuário, 2026-11-01)
| Onde | Regra |
|---|---|
| **Tela de produto ou de tarefa** (app, painel, formulário, extrato) | a regra da Apple, abaixo: só navegação e controles. Nunca em cartão de dado, lista ou texto |
| **Landing page** e página de marketing | também **cartão**, com **pouca transparência** e sobre **fundo calmo** (ver "Cartão de vidro em landing page") |

Na dúvida se a página é uma coisa ou outra: a pessoa veio ler e decidir (landing) ou veio trabalhar (produto)?

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

## Cartão de vidro em landing page
Só em landing page. **Pouca transparência:** atrás do cartão passam só cor e luz, nunca forma que se leia. **Fundo calmo:**
cor única ou luz larga, sem foto, sem texto e sem nada em movimento por trás.
```css
.cartao-landing {                                   /* cor própria do cartão, quase opaca */
  background: rgb(22 42 58 / 0.82);                 /* claro: rgb(255 255 255 / 0.82) */
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  backdrop-filter: blur(10px) saturate(140%);
  border: 1px solid rgb(255 255 255 / 0.10);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.14); /* a luz de 1 px no topo é o que faz parecer vidro no escuro */
}
```
- **[ESTIMATIVA: ponto de partida nosso]** fundo 72–88% de opacidade, desfoque 8–12 px, borda a 10–15%. O valor exato acima
  (82%, 10 px) foi usado e medido em `docs/provas/0.8.0-sites/`; a faixa não foi medida.
- **Superfície tonal** (visto nas referências estudadas, [MEDIDO]): branco a 3–10%, borda a 10–15% e desfoque de 4 px sobre
  escuro homogêneo. O número é transparente, mas quem trabalha é a cor: só serve com fundo que não varia. Na dúvida, use o
  cartão acima.
- **Não serve em landing:** sobre foto ou vídeo sem o véu de 35–60%, vidro sobre vidro, tabela ou texto longo.

## Variantes [ESTIMATIVA: ponto de partida nosso]
| Variante | Cor | Desfoque e saturação | Borda | Sombra | Uso |
|---|---|---|---|---|---|
| Barra | claro ou escuro 60–75% | 12–20 px, 150–180% | 1 px a 10–45% | leve ao rolar | navegação |
| Painel | 50–70% | 16–24 px, 150–180% | 1 px a 20–45% | 0 8–24 px 24–60 px a 0,12–0,25 | menu, modal |
| Sobre foto | preto 35–60% | 4–12 px | nenhuma ou 10% | nenhuma | legenda, selo, controle |

## Por que não funcionou (estudo de 2026-11-01; MDN: `backdrop-filter`)
- **Translúcido sem desfoque é defeito, não economia:** a 82%, sem desfoque, o conteúdo de trás vira ruído legível.
- **Raiz do fundo:** um pai com `opacity` menor que 1, `filter`, `mask`, `clip-path`, `mix-blend-mode` ou o próprio
  `backdrop-filter` vira a raiz; o filho só desfoca o que está dentro dele.
- **Desfoque em superfície opaca** custa e não aparece: retire.
- **Falta luz:** no escuro, o que faz parecer vidro é a borda de luz de 1 px no topo, não o desfoque.
- **Sem variação atrás** o efeito não aparece: nesse caso, use cor sólida.

## Acessibilidade do vidro
- **Contraste no pior fundo:** meça o texto contra a parte mais clara (e a mais escura) do que pode passar por trás, não
  contra a média. Não passou: mais opacidade, a camada escura de 35% (variante clara) ou texto mais forte.
- `prefers-reduced-transparency: reduce` → fundo opaco, sem desfoque (equivale ao Reduzir Transparência da Apple).
  Suporte ainda parcial ("Limited availability" e experimental no MDN, enquanto `backdrop-filter` é Baseline 2024): a base do
  desenho precisa passar no contraste **sem contar com o efeito**.
- `prefers-contrast: more` → fundo sólido e borda forte. `prefers-reduced-motion: reduce` → nada de reflexo que se mexe,
  paralaxe ou "brilho" animado no vidro.

## Desempenho
- **[ESTIMATIVA]** no máximo 2–3 superfícies de vidro visíveis ao mesmo tempo, e nunca vidro sobre vidro: cada
  `backdrop-filter` obriga a recompor tudo o que está atrás a cada quadro de rolagem.
- No celular, o desfoque grande em área grande pesa (bateria, quadros perdidos): área pequena, desfoque menor, e meça
  rolando num aparelho de alguns anos (`../../engenharia/desempenho-web.md`).
- Não anime o raio do desfoque; anime só `opacity`/`transform` do elemento.
- **[ESTIMATIVA]** no celular, desfoque de até 8–12 px e poucas superfícies.

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
