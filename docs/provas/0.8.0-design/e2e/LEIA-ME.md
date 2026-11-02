# Prova ponta a ponta de design (pv92): "visual premium" e "efeito vidro estilo Apple"

Responde a 2 perguntas do usuário: (1) num pedido amplo de redesenho, o plugin aciona sozinho as referências de design?
(2) consegue fazer um vidro estilo Apple, e mostrar o resultado? Tudo fictício (app de tarefas, app de fotos, landing "Lumen").
Páginas feitas pelo `engenheiro-software` seguindo **só** o que o plugin manda ao `designer-paineis` e ao engenheiro, sem `claude -p`
(gasto de conta). PNGs no Edge sem interface, perfil próprio, uma captura por vez, sem nada na tela do usuário.

## 1. O que o plugin acionou sozinho (roteador real, projeto vazio, 2026-11-02)
| Pedido | Agentes candidatos | "Referências para este pedido" |
|---|---|---|
| "redesenhe meu app com visual premium" | designer-paineis, engenheiro-software, revisor | `design/apple/INDICE.md`, `design/metodo.md`, `design/detalhes-interface.md` (designer); `design/movimento/INDICE.md`, `engenharia/interface-web.md` (engenheiro); `design/revisao-tela.md` (revisor); lembrete do `/checklist-lancamento` |
| "um card com efeito vidro estilo Apple" | designer-paineis, engenheiro-software, revisor | `design/apple/INDICE.md`, `design/apple/materiais.md` (designer); lembrete do `/checklist-lancamento` |

Ninguém pediu as referências: elas vieram do roteador. O designer, pela seção "Referências sob demanda" do agente, ainda abre o
`piso-de-qualidade.md` antes de editar e o `movimento/INDICE.md` porque a tela tem movimento.

## 2. Caso A: "redesenhe meu app com visual premium" (`caso-a-antes.html` → `caso-a-depois.html`)
| Passo do método (`design/metodo.md`) | Arquivo lido | O que decidiu na tela |
|---|---|---|
| Entender e modo | `design/metodo.md`, `design/modos/operar.md` | app de tarefas = modo **Operar**: leitura rápida, fonte do sistema, neutros, um destaque, números tabulares, quase nenhum movimento |
| Apple, lente 1 | `design/apple/INDICE.md`, `design/apple/acessibilidade-tipo-e-toque.md` | corpo 17 px; alvos de 44 × 44; contraste ≥ 4,5:1 nos 2 modos; nada só por cor ("Atrasada" escrito, não só vermelho) |
| Apple, cor | `design/apple/cor-e-modo-escuro.md` | tokens semânticos claro/escuro; uma cor, um significado (azul = ação, vermelho = atraso, verde = feito); segue o tema do sistema |
| Apple, materiais | `design/apple/materiais.md` | vidro **só** na barra superior que flutua sobre a lista; `@supports` e transparência reduzida |
| Construir | `design/piso-de-qualidade.md` | saíram: grade de cartões iguais, rótulo acima do título, texto em gradiente, emoji como ícone, sombra dura, borda lateral colorida, `transition: all`; entrou ícone SVG com `currentColor` |
| Movimento | `design/movimento/INDICE.md` | uma entrada rara no detalhe (180 ms, ease-out, de 0,97, sem `scale(0)`), com redução de movimento; pressionar 0,97 em 160 ms |
| Polir | `design/detalhes-interface.md` | sombra para elevação e borda para estrutura; hover só com `@media (hover: hover)`; foco visível; raio 12–16 px |

PNGs: `png/caso-a-antes-claro-{1440,390}.png`, `png/caso-a-depois-{claro,escuro}-{1440,390}.png`.

## 3. Caso B: "um card com efeito vidro estilo Apple" (`caso-b-landing.html`, `caso-b-produto.html`)
Regra seguida: na **landing**, o cartão pode ter vidro, com 72–88% de opacidade e fundo calmo (decisão do lote de sites, ainda não
gravada no `materiais.md` deste ramo: o vidro aqui usa 78% no claro e 80% no escuro); na **tela de produto**, vidro só na navegação e nos
controles que flutuam (`apple/materiais.md`: "Nunca na camada de conteúdo"), e as fotos ficam em cartões sólidos.

- Receita: desfoque 16 px, saturação 170%, borda fina, sombra suave; `@supports not` com fundo quase opaco; `prefers-reduced-transparency`
  com fundo opaco e sem desfoque (conferido no navegador: `backdrop-filter: none`); `prefers-contrast: more` com fundo sólido e borda forte.
- **Contraste no pior ponto do fundo:** o texto fica transparente, a área dele é capturada e cada pixel do fundo composto é comparado
  com a cor do texto (`png/medidas.json`). A 1ª versão do produto ficou em **2,56:1** no rótulo da aba no escuro e **3,83:1** no claro,
  com as fotos passando por baixo. Subi a opacidade do vidro (72% → 84% no claro, 86% no escuro) e o tom do texto, como manda o
  `materiais.md`. Agora a menor medida de todas é **4,94:1** (aba ativa, escuro, 390 px); no cartão da landing, 7,71:1 no pior ponto.
- Ajuste visto no PNG: no claro, a mancha de fundo não passava por trás do cartão e o vidro não aparecia; mudei a posição dela.

PNGs: `png/caso-b-landing-{claro,escuro}-{1440,390}.png`, `png/caso-b-landing-claro-transparencia-reduzida-1440.png`,
`png/caso-b-landing-claro-contraste-mais-1440.png`, `png/caso-b-produto-{claro,escuro}-{390,1440}.png`,
`png/caso-b-produto-claro-transparencia-reduzida-390.png`.

## 4. Conferência
17 PNGs, todos abertos e vistos; 0 erro de JavaScript; 0 rolagem lateral; `medidas.json` com o tema, as preferências emuladas, o
`backdrop-filter` calculado e o contraste de cada texto sobre o vidro. Eval: casos 14 (regressão) e 15 (gatilho negativo) em
`evals/designer-paineis.md`; casos na bateria em `scripts/testar-referencias.js` ("pv92").

## Limites
- Não houve `claude -p` com agentes de verdade: as páginas seguem as referências que o roteador indicou, aplicadas por um agente só.
  A prova de que o conteúdo é acionado é a saída do roteador (seção 1); a de que ele funciona, as páginas.
- O suporte a `prefers-reduced-transparency` nos navegadores ainda é parcial (o Edge desta máquina respeita a emulação).
- A pasta `../app-premium.html` e `../card-vidro.html` são da tentativa anterior (2026-11-01), com as ressalvas do `../LEIA-ME.md`.
