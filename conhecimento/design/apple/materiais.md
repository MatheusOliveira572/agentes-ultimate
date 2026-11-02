<!-- Texto próprio do agentes-ultimate (receita do Liquid Glass provada em docs/provas/0.8.0-design/e2e/, pv94), a partir da HIG pública da Apple (página materials, aberta em 2026-11-01; Liquid Glass, mudança de 2025-09-09), da documentação pública do CSS (MDN) e do estudo visual de 2026-11-01 (docs/referencias-visuais-2026-11.md, seção 4). Nada copiado; cada regra cita a fonte. -->
<!-- ref: tema=apple-materiais; palavras=efeito vidro, vidro, glass, glassmorphism, liquid glass, desfoque, blur, backdrop-filter, translucido, translucidez, fosco, card de vidro; agentes=designer-sites, designer-paineis, engenheiro-software, designer-documentos -->
<!-- teste-ref: sim=faça um card com efeito vidro estilo Apple | quero glassmorphism com backdrop-filter na barra de navegação, translúcido; nao=calcule o custo médio ponderado do estoque -->
# Materiais e efeito vidro (Liquid Glass)

## Onde vale cada regra (decisão do usuário, 2026-11-01)
| Onde | Regra |
|---|---|
| **Tela de produto ou de tarefa** (app, painel, formulário, extrato) | a regra da Apple, abaixo: só navegação e controles. Nunca em cartão de dado, lista ou texto |
| **Landing page** e página de marketing | também **cartão**, com **pouca transparência**, sobre **fundo calmo ou foto** (decisão de 2026-11-02: sobre foto, com contraste medido ponto a ponto; ver "Cartão de vidro em landing page") |

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
  conteúdo, tire, em tela de produto. Em landing page vale a seção "Cartão de vidro em landing page".

## Como fazer na web: Liquid Glass, não "glassmorphism"
O usuário quer o vidro da Apple, **não uma tentativa**. O fosco antigo (desfoque grande + branco translúcido + borda cinza)
**não** é Liquid Glass. O material da HIG tem 5 traços; cada um tem a sua receita:

| Traço (HIG › Materials › Liquid Glass) | Receita web | Valor de partida [ESTIMATIVA] |
|---|---|---|
| **Lente:** entorta o que passa atrás, mais forte na borda | `backdrop-filter: url(#f)` com `feImage` (mapa de deslocamento gerado para o tamanho e o raio da peça: R/G = normal da borda × força, curva suave) → `feDisplacementMap` → `feGaussianBlur` → `feColorMatrix saturate` | aro = 40% do raio + 6 px (até 22 px); força 26; desfoque 3–4 px sobre foto, 6–8 px sobre texto; saturação 1,7 |
| **Aro especular** que reage à luz | anel de 1,25 px (máscara `content-box` × `border-box`) em gradiente cujo ângulo `--luz` segue o ponteiro (e gira devagar com a rolagem); brilho interno radial no lado da luz | aro 0,95 no claro, 0,55–0,70 no escuro |
| **Tinta que se adapta** ao que passa atrás | luminância real do conteúdo de trás (grade 4 × 4 por foto, só as células cobertas) → `data-tom="claro|escuro"`; fundo misto engrossa a tinta | limiar 0,30; misto se Δ > 0,25; tinta clara 0,58–0,66 (misto 0,78), escura 0,56–0,66 (misto 0,72) |
| **Forma em cápsula concêntrica** | raio = altura/2; seleção interna com raio externo − recuo | recuo 4–10 px |
| **Barra lateral sempre sobre conteúdo** (extensão de fundo do macOS 26) | camada atrás da barra lateral com a foto vizinha espelhada e desfocada (10 px), a cor do pé da capa esmaecendo no topo, máscara antes da borda do conteúdo; no escuro, brilho 0,72 | sem ela, a barra termina num corte seco onde a capa acaba (visto na prova pv94) |
| **Camadas que se separam e se juntam** | ex.: abas que se recolhem na selecionada ao rolar para baixo e a busca que se aproxima, com a mola do projeto | 520 ms, mola curta |

Reserva honesta: a lente só existe no Chromium (o `url()` no `backdrop-filter`); nos outros, o material regular
(`blur(14px) saturate(180%)`) **sem fingir refração**, e o relatório diz qual navegador viu o quê.

## Teste "parece Apple ou parece tentativa?" (com o PNG e uma ampliação 2× do vidro)
1. Na ampliação, o conteúdo de trás **entorta** junto da borda (listras e horizontes curvam).
2. O aro de luz é visível e **não uniforme** (mais forte do lado da luz).
3. O tom **muda** quando passa foto clara e escura (capture rolado sobre as duas).
4. Dá para **reconhecer** o que está atrás (desfoque baixo); não é um leitoso uniforme.
5. Cápsula ou raio concêntrico, sombra macia, flutuando sobre conteúdo real (nunca sobre fundo liso).
Falhou 2 ou mais: é tentativa; refaça antes de entregar.

Reserva em CSS puro (sem lente), para navegador sem `url()` no `backdrop-filter` e para as preferências:
```css
.vidro {                               /* barra, menu ou controle FLUTUANTE (cartão de landing: receita abaixo) */
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

## Cartão de vidro em landing page
Só em landing page. **Pouca transparência:** atrás do cartão passam só cor e luz, nunca forma que se leia. **Fundo calmo:**
cor única ou luz larga, sem texto e sem nada em movimento por trás. **Sobre foto** (decisão do usuário, 2026-11-02): pode, desde que o
contraste de cada texto seja medido pixel a pixel no pior ponto da foto, depois da lente, nos dois temas.
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
- **Superfície tonal** (visto nas referências estudadas, [MEDIDO]): branco a 3–10% sobre escuro homogêneo. É o
  contrário de pouca transparência: não use no cartão. Fica registrada como medida, não como opção.
- **Não serve em landing:** sobre vídeo ou gradiente em movimento, vidro sobre vidro, tabela ou texto longo. Sobre foto, só com o
  contraste medido ponto a ponto (acima).

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

- O contraste se mede **depois** da lente, pixel a pixel, no pior ponto de cada texto (a lente traz para trás do rótulo o
  que estava fora dele). Falhou: tinta mais grossa (misto), mais desfoque sobre texto, nunca texto menor.
- `prefers-reduced-transparency` e `prefers-contrast: more` tiram a lente e a tinta (fosco opaco ou sólido com borda);
  `prefers-reduced-motion` congela o aro na luz padrão.
- Nunca vidro sobre vidro: aviso, menu e folha abrem **fora** de outra peça de vidro (checagem de sobreposição).

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
