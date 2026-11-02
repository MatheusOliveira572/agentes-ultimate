# Vitrine "Clara 35": prova do nível HD (designer-sites, hd102)

Produto fictício: **Clara 35**, câmera compacta com lente fixa de 35 mm f/1,4. Preço, prazo e especificações são de exemplo; a
página diz isso no cartão e no rodapé.
- A lente é **geometria procedural em three.js**, sem modelo, textura ou foto de terceiros.
- Gravações, paisagem, luzes e letreiro são gerados por código.
- O vidro da barra e do cartão é o modelo do plugin, `modelos/liquid-glass/`.
- three.js 0.170.0 entra pelo CDN jsDelivr, com versão fixa e SRI no import map.

**Mundo de estilo: produto Apple / Liquid Glass**, porque o produto é uma câmera premium e o briefing pediu esse mundo. É **um**
mundo entre vários; o nível HD abaixo vale para qualquer estilo (regras no plugin: `conhecimento/design/nivel-hd.md`).

**Abrir:** `index.html` no Edge ou no Chrome, com internet (o three.js vem do CDN). Rolar devagar do herói até a reserva e mexer o
mouse sobre a lente. Sem internet, sem WebGL ou com movimento reduzido, entra a imagem renderizada do mesmo objeto.

## A ideia
**"Sete vidros entre você e a luz":** a lente é a página.
1. No herói, a lente montada aparece sobre a paisagem da hora dourada, com o fundo desfocado como em f/1,4.
2. Ao rolar, **o mesmo objeto 3D** gira de lado. O barril desliza para trás pelo eixo, como uma luva, e os 7 vidros se separam,
   com o eixo da luz em âmbar até o sensor e as etiquetas iguais à lista.
3. O diafragma explica o desfoque.
4. A reserva fecha no cartão de vidro.

## O que mudou da v1 (o usuário: "cara de desenho, movimento de template, acabamento não HD")
| Item | v1 | v2 (agora) |
|---|---|---|
| Lente | discos em CSS 3D com degradês | **WebGL**: barril anodizado em perfil de revolução, anel de foco com **serrilha real na malha** (240 sulcos), gravações em textura gerada, baioneta cromada, **7 vidros sólidos** (superfícies curvas, espessura, borda pintada de preto) em `MeshPhysicalMaterial` (transmissão 1, `ior` 1,52 a 1,85 por vidro, `thickness`, atenuação, **iridescência** = revestimento antirreflexo, `dispersion` 0,35), diafragma de 11 lâminas extrudado, sensor com difração |
| Luz | gradiente desenhado | **ambiente PMREM**: o RoomEnvironment com a sala escurecida e 4 softboxes (chave em cima à esquerda, recorte, faixa para o vidro aberto, frente); **Neutral (Khronos)** no tone mapping |
| Sombra e profundidade | nenhuma | sombra de contato macia sob a vista aberta; fundo do herói desfocado (profundidade de campo) |
| Movimento | `animation-timeline` ligado direto à rolagem (aos saltos com a roda) | **mola da casa** (rigidez 170, amortecimento 24, ζ 0,92, bounce ≈ 0, assenta em 573 ms) segue o progresso da rolagem, sem prender a rolagem; a mesma mola em CSS por `linear()` de 37 pontos; entrada da lente com a mola; o ponteiro inclina com a mola |
| Revelação | ligada à rolagem | uma vez, por tempo, escalonada 45 ms (o principal primeiro); o quadro f/1,4 chega com inclinação 3D |
| Reserva | troca de texto | **continuidade**: o mesmo botão, rótulo que sai em 120 ms e entra 70 ms depois, ✓ desenhado depois, aviso que troca no lugar; desfazer volta pelo mesmo caminho |
| Toque | escala fixa | apertar = 0,97 em 90 ms; soltar = **mola de toque** (380/26, bounce 0,06); passar = sobe 1 px; realce da navegação por cápsula concêntrica |
| HD | 1× | capturas em **2×**; bordas de 0,5 px em telas 2×; sombras em 3 camadas; grão contra faixas; `corner-shape: squircle` com `@supports`; tracking −0,034 a −0,042 nos títulos; `font-optical-sizing` |

## Provas (todas em 2×, Edge sem interface, uma captura por vez)
- **Bateria `node verificar.js tudo`** (`png/saida-tudo.txt`, `png/medidas-tudo.json`): **39 de 39 casos ok, 0 erro**.
  - Contraste: 342 textos medidos pixel a pixel no pior ponto, sobre o 3D, a foto e o vidro. O pior foi 5,09:1, e o pior em
    fundo sólido 5,34:1. Cartão de vidro: ≥ 8,27 no claro e ≥ 5,26 no escuro.
  - Sem rolagem lateral de 320 a 1920 px. Teclado (Tab e Shift+Tab, anel visível, nada sob a barra), sem JS, sem WebGL,
    movimento reduzido, transparência reduzida e contraste aumentado: todos passam.
  - Objeto 3D: **0,000% de pixels saturados** no recorte da lente (limite 1%).
  - Coerência: 7 vidros, 5 grupos e 11 lâminas lidos **do objeto 3D**, e a mola amostrada (37 pontos).
- **Mutação** `node verificar.js --mutar` (tira o vidro 5 do objeto 3D): o verificador falha com 7 erros, como deve
  (`png/saida-mutacao.txt`).
- **Tiras de quadros** `node tiras.js tudo` (`png/saida-tiras.txt`, `png/tiras-medidas.json`), com relógio controlado:
  - a mola da lente avança 50 ms por quadro;
  - nas transições CSS, as animações ficam pausadas e são postas em `currentTime` 0 a 600 ms;
  - a curva é analisada: sem salto no 1º quadro, sem parada seca, sem recuo. **As 3 curvas passam.**
- **Desempenho (navegação quente).** LCP: 320 ms (CPU 1×), 164 a 580 ms (CPU 4×); o elemento é o título. **CLS 0,000.**
  Quadros ao rolar, com a lente em WebGL a 2×: mediana de 17 ms com a CPU 1×; com a CPU 4×, mediana de 50 a 83 ms e p95 de
  100 a 167 ms. [MEDIDO no Edge sem interface com a GPU Intel Iris Xe. A CPU 4× pesa no JavaScript do three.js; não vale como
  número de aparelho.]
  - Para baixar o custo: a resolução é adaptativa (1,25× em movimento, até 2× parado), sem mapa de sombra, com
    `transmissionResolutionScale` 0,75, e a lente só começa depois do `load`.
  - A 1ª navegação num navegador recém-aberto pinta tarde em qualquer variante da página (medido: até ~4 s com a CPU 4×).

### PNGs e tiras que eu mostraria
1. `png/vitrine-claro-1440.webp`: herói em 2×, lente renderizada sobre a hora dourada desfocada.
2. `png/vitrine-escuro-1440-q2-aberta.webp`: os 7 vidros abertos no estúdio escuro (softboxes nos vidros, iridescência, etiquetas).
3. `png/tira-lente-escuro.webp`: 12 quadros de 50 ms, do herói à vista aberta; o barril sai como uma luva, o mesmo objeto em todos.
4. `png/tira-girar-20graus.webp`: o mesmo quadro a 0° e a 20°; os reflexos mudam de lugar (não é desenho).
5. `png/tira-reserva.webp` e `png/tira-revelacao.webp`: a reserva com continuidade e a revelação escalonada.
Também: `png/vitrine-claro-1440-q2-aberta.webp`, `png/vitrine-claro-390.webp`, `png/vitrine-escuro-1440-q4-reservar.webp` (+ `-zoom`),
`png/vitrine-claro-1440-zoom4x.webp`, reduções e as imagens de reserva em `img/`.

## Autocrítica (régua: "parece produto real renderizado ou ilustração? o movimento parece produto premium ou site de modelo?")
- **Lente: parece produto renderizado.** A serrilha pega luz, o vidro tem espessura e reflexo de softbox, e o revestimento dá o
  verde e o violeta dos vidros de verdade. O "girar 20°" mostra os reflexos se movendo.
- **Movimento: parece produto.** Uma mola só; a lente não pula com a roda do mouse (segue a mola); revelações escalonadas; a
  reserva troca no lugar.
- **Ainda não está no nível (sem esconder):**
  - No escuro, o diafragma (preto) quase some contra o fundo da vista aberta.
  - O barril em close é limpo demais (sem micro-riscos nem desgaste).
  - O fundo do herói é paisagem pintada em canvas, não foto.
  - Sem pós-processamento de profundidade de campo nos vidros (a profundidade de campo está só no fundo).
  - O custo de quadro com a CPU 4× é alto.
  - Safari e Firefox não testados (a lente WebGL deve funcionar; o vidro da barra cai para o fosco).
  - O letreiro "aberto" usa a fonte do sistema.

## Arquivos
| Arquivo | Para quê |
|---|---|
| `index.html` | estrutura; import map com SRI; paisagem em SVG para a reserva sem WebGL |
| `lente3d.js` | a lente WebGL (geometria, materiais, ambiente, mola, poses pelo espaço livre do layout, imagens de reserva por `?render=`) |
| `vitrine.js` | brilho do mar, diafragma em SVG, luzes do f/1,4, revelação escalonada, reserva |
| `vitrine.css` | mola da casa em `linear()`, coreografia, acabamento HD, reduções |
| `verificar.js` | bateria (`tudo`, `png`, `checar`, `--so=nome$`, `--mutar`, `--png`) |
| `tiras.js` | tiras de quadros determinísticas + análise de curva |
| `foto.js` | captura avulsa e geração das imagens de reserva (`img/*.webp`) |
| (proposta do padrão HD) | aplicada em `conhecimento/design/nivel-hd.md`, `modelos/mola-linear.js` e `modelos/tiras/`; saiu daqui (histórico do git) |

As capturas ficam em WebP (o plugin é baixado inteiro por quem instala). Os verificadores gravam PNG; antes do commit, rode
`node scripts/comprimir-provas.js docs/provas/0.8.0-design/vitrine/png` (Edge ou Chrome sem interface; converte e apaga o PNG)
e apague as capturas que este LEIA-ME não cita.
