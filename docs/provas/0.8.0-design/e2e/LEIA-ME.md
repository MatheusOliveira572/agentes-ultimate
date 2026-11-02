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

PNGs: `png/caso-a-antes-claro-1440.png` e `png/caso-a-depois-claro-1440.png` (um par antes e depois; os outros da v1 saíram na
limpeza da 0.8.0 e continuam no histórico do git).

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

PNGs da v1 do caso B: saíram na limpeza da 0.8.0 (continuam no histórico do git); as medidas ficam em `png/medidas.json`.

## 4. Conferência
17 PNGs, todos abertos e vistos; 0 erro de JavaScript; 0 rolagem lateral; `medidas.json` com o tema, as preferências emuladas, o
`backdrop-filter` calculado e o contraste de cada texto sobre o vidro. Eval: casos 14 (regressão) e 15 (gatilho negativo) em
`evals/designer-paineis.md`; casos na bateria em `scripts/testar-referencias.js` ("pv92").

## Limites
- Não houve `claude -p` com agentes de verdade: as páginas seguem as referências que o roteador indicou, aplicadas por um agente só.
  A prova de que o conteúdo é acionado é a saída do roteador (seção 1); a de que ele funciona, as páginas.
- O suporte a `prefers-reduced-transparency` nos navegadores ainda é parcial (o Edge desta máquina respeita a emulação).
- A tentativa anterior (2026-11-01, `app-premium.html` e `card-vidro.html`) saiu na limpeza da 0.8.0; está no histórico do git.

---

# v2 (pv94, 2026-11-02): refeito pelo designer-paineis porque a v1 ficou "normal"
O usuário achou as telas da v1 "bem normais, nada que impressiona" e pediu que **impressionar** seja o padrão do plugin. Por
que a v1 ficou assim (execução × instruções) e as propostas de mudança: `diagnostico.md` (as propostas já foram aplicadas a
`conhecimento/design/impressionar.md`, `apple/materiais.md`, aos designers e ao revisor, e a pasta `propostas/` saiu). Os
arquivos da v1 ficam para comparação.

## O que é cada coisa
| Arquivo | O que é |
|---|---|
| `caso-a-depois-v2.html` | App de tarefas (mesmo conteúdo do "antes": 6 tarefas, detalhe, 12 / 5 / 42%). **Ideia: o dia lido como uma linha do tempo, com o agora no meio**; a fita do dia (cada peça é uma tarefa, clicável); o passado comprimido, o que está aberto ganha espaço; inspetor à direita; teclado (↑ ↓, Espaço, Ctrl+Enter, Ctrl+Z) com dicas na tela; concluir com mola, risco que se desenha, placar, fita e "próxima" que mudam juntos, aviso com desfazer; troca do detalhe com inclinação 3D vinda da lista; "Próximos dias" se revela ao rolar. `?estado=vazio` e `?mutar=contagem` |
| `caso-b-produto-v2.html` | Álbum do app de fotos (mesmos 24 nomes e datas). **Ideia: a luz da viagem atravessa o vidro.** Capa que sangra por trás da barra lateral; Liquid Glass só na navegação e nos controles; fotos sólidas em mosaico por lugar que **pousam ao rolar** (3D); a mesma luz (o ponteiro) inclina as fotos e gira o aro do vidro; no celular, as abas se recolhem ao rolar e a busca se aproxima |
| `modelos/liquid-glass/` (na raiz do plugin; a cópia daqui saiu na limpeza, com o defeito dos `[data-lum]` aninhados) | O material **Liquid Glass** usado nos dois casos: lente (`backdrop-filter: url(#svg)` com `feDisplacementMap`), aro especular que segue a luz, tinta que se adapta à luminância do que passa atrás (grade 8 × 8 sobre o controle, mais grossa sobre fundo misto), cápsula concêntrica. Fora do Chromium: material regular declarado, sem fingir refração |
| `verificar-v2.js` | Edge sem interface, uma aba, uma captura por vez (`windowsHide`). Uso: `node verificar-v2.js a|b|tudo` e `node verificar-v2.js a --mutar` |

## Junção (cada elemento serve à ideia; o que não servia saiu)
| Elemento | Caso A ("o dia como linha do tempo") | Caso B ("a luz atravessa o vidro") |
|---|---|---|
| Tipografia | "Hoje" 54 px e o placar 56 px; o resto em escala curta | título de 68 px sobre a capa |
| Material | palco embutido + inspetor; Liquid Glass só na captura, nas abas e no aviso | Liquid Glass na barra lateral e nas cápsulas; fotos sólidas |
| 3D | o detalhe "vira" vindo da lista (de onde veio) | fotos pousam ao entrar; inclinam para a luz |
| Revelação ao rolar | os próximos dias chegam (o futuro que vem) | as fotos de cada lugar pousam |
| Movimento | uma mola para tudo; momento-pico = concluir | a mesma mola; abas que se separam ao rolar |
| Tirado no 2º passe | metadados das tarefas feitas (o passado comprimido) | paralaxe da capa (não fazia falta à ideia) |

## Conferência (comandos rodados em 2026-11-02, saída lida)
- `node verificar-v2.js a` → 8 casos ok: contraste do pior texto sólido 4,65:1 (claro) e 5,15:1 (escuro); vidro no pior
  ponto ≥ 4,91:1; somas placar × lista × fita × navegação × projetos fecham; concluir/desfazer atualizam placar, fita,
  "próxima", grupo, botão e prazo; Tab → "Pular para a lista", ↓ seleciona a próxima com a transição 3D; revelação com
  `animation-timeline: view()`; movimento reduzido sem transição longa; alvos ≥ 44 px no celular.
- `node verificar-v2.js b` → 8 casos ok: vidro e texto sobre foto no pior ponto ≥ 4,67:1; tons do vidro por caso em
  `png/medidas-v2-b.json` (campo `tons`: escuro sobre a capa, claro e "misto" sobre as fotos claras); teclado e
  movimento reduzido (0 animações rodando).
- **Mutações pegas:** contagem errada (`--mutar`: "placar diz 6, a lista tem 5"); "agora" não atualizado; prazo que
  continuava na tarefa feita; aviso abrindo sobre a barra de vidro; controle cortado pela borda em 390 px (pego na versão
  real antes da correção).
- **Vistos e corrigidos no PNG** (a mecânica não pegava): passado ocupando o meio da tela; colisão "Próximos dias0 de 4" e
  data quebrada no celular; estado incoerente ao concluir; grupos com o mesmo arranjo; faixa cinza na lagoa.

## PNGs v2 (`png/`)
`caso-a-v2-{claro,escuro}-{1440,390}.png`, `caso-a-v2-claro-1440-concluir.png`, `caso-a-v2-claro-1440-vazio.png`;
`caso-b-produto-v2-{claro,escuro}-{1440,390}.png`, `caso-b-produto-v2-claro-1440-rolado.png` (+ `-zoom.png`, lente ampliada
2×), `caso-b-produto-v2-escuro-390-rolado.png` (abas recolhidas), `caso-b-produto-v2-claro-1440-transparencia-reduzida.png`.

## Autocrítica pela régua (`conhecimento/design/impressionar.md`, camada 2)
| Item | A | B |
|---|---|---|
| 9 ideia numa frase | sim | sim |
| 10 uma olhada, primeiro quadro ocupado | sim | sim |
| 11 tipografia com intenção | sim | sim |
| 12 cor com papel, escuro em camadas | sim | sim |
| 13 material com função, vidro fiel | parcial: sobre texto, a lente precisa de 7 px de desfoque e quase não aparece | sim (5 de 5 no teste "parece Apple", ampliação anexada) |
| 14 movimento com propósito e momento-pico | sim | sim (não há momento-pico de fluxo nesta tela) |
| 15 acabamento | sim | parcial: as "fotos" pintadas por código leem como ilustração vetorial |
| 16 final memorável | sim (desfazer) | não se aplica nesta tela |

## O que ainda não está no nível
- **Fotos de verdade** fariam B subir um degrau; as paisagens por código são o limite honesto sem banco de imagens licenciado.
- **O Liquid Glass só existe no Chromium.** No Safari (justamente o público "Apple") aparece o material regular, sem lente.
- No Windows a fonte é a Segoe UI Variable, não a SF: a "cara de Apple" perde um pouco fora do Mac.
- A tem "Ctrl K" e "Nova tarefa" desenhados, mas a paleta de comandos e a captura não estão construídas; não há arrastar
  para reordenar.
- A barra lateral clara de B mostra uma passagem brusca onde a capa termina (é física, mas não é bonita).
- O verificador mede contraste pixel a pixel, mas o "impressiona" continua julgado no olho, pela régua; não há medida
  automática para ele.

## Rodada de correção do caso B (pv94, depois da revisão do orquestrador)
Apontado: a barra lateral terminava num corte seco onde a capa acaba, e o vidro não lia como Liquid Glass na imagem parada.
- **Extensão de fundo** (como no macOS 26): sob a barra lateral, a foto vizinha espelhada e desfocada, do topo ao fim da
  página, com a cor do pé da capa esmaecendo na passagem; no escuro, escurecida (brilho 0,72) para o texto da barra.
- **Barra lateral com material mais grosso** que o dos controles (superfície grande: tinta 0,72 claro / 0,76 escuro).
- **Aro e borda mais legíveis:** aro de 1,5 px, linha externa de 0,5 px e brilho interno só no tom claro.
- **"Fotos" mais fotográficas:** nuvens desfocadas, suavização que tira o fio de vetor e grão leve (±4,5); na capa, a
  legenda "Imagens ilustrativas geradas por código (sem foto real)".
- Mosaico com `grid-auto-flow: dense` (o 2º lugar abria buracos); tinta lida numa grade 8 × 8 (a 4 × 4 não via as nuvens),
  e a capa passou a ter a grade.
- **Medida:** o contraste sobre o vidro passou a ser medido na caixa das letras (`Range`), não no recuo do botão; ainda
  pega vidro ruim (mutação com tinta escura 0,10: 4 casos reprovados).
- Novo: `png/caso-b-produto-v2-escuro-1440-rolado.png` e `-zoom.png` (barra lateral ampliada 2×).
- `node verificar-v2.js b`: 9 casos ok; `node verificar-v2.js a`: 8 casos ok (o vidro de A usa o mesmo modelo). Depois da limpeza, com as páginas no
  `modelos/liquid-glass/`: `b` 9 casos ok e `a` 8 casos ok de novo (2026-11-02).

**PNGs para mostrar ao usuário:** `png/caso-a-v2-claro-1440.png`, `png/caso-b-produto-v2-claro-1440-rolado.png` e
`png/caso-b-produto-v2-escuro-1440-rolado-zoom.png`.
