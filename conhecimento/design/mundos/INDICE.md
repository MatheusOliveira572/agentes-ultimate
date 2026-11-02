<!-- Texto próprio do agentes-ultimate (2026-11-02): mundos visuais no mesmo nível de exigência, para a régua ../impressionar.md não depender de um estilo. Referências públicas citadas em cada mundo só como ideia; nada copiado. -->
<!-- ref: tema=mundos-visuais; palavras=mundo visual, estilo visual, direcao visual, linguagem visual, qual estilo, que estilo, visual premium, premium, site premium, app premium, redesenhe, redesenho, site institucional, site bonito, bonito; agentes=designer-sites, designer-interface, designer-paineis, designer-documentos, revisor -->
<!-- teste-ref: sim=que estilo visual combina com o meu produto? | redesenhe meu app com visual premium; nao=calcule a depreciação do ativo imobilizado -->
# Mundos visuais: escolher um, e executá-lo no nível mais alto

Um **mundo** é uma família coerente de tipografia, cor, material, movimento, forma e imagem. A régua
(`../impressionar.md`) mede o nível; o mundo diz **como** esse nível aparece. Nenhum mundo é o padrão do plugin.

## Como escolher (nesta ordem)
1. **Marca e projeto mandam:** guia de marca; `.claude/base/PROJETO.md`, seção "Gosto visual". Se o mundo já está
   decidido, use-o e não proponha outro.
2. **Briefing e produto:** o que o produto faz, quem usa, em que momento, e o que a categoria evita (um banco não pode
   parecer brinquedo; um jogo infantil não pode parecer balanço contábil).
3. **Sem marca nem gosto registrado:** proponha **2 ou 3 mundos** desta lista, cada um com 1 linha de porquê e o risco,
   e a sua recomendação. Quem escolhe é o usuário (`../tela-nova/INDICE.md`, passo 3).
4. Quando o usuário disser um gosto que vale para o projeto todo, peça ao orquestrador (campo "Precisa de") que o anote
   em `PROJETO.md` › "Gosto visual" (o designer não edita o `PROJETO.md`). O gosto de um projeto não vira regra do plugin.

## Os mundos
| Mundo | Combina com | Arquivo |
|---|---|---|
| Apple / Liquid Glass | app de plataforma Apple, produto de consumo com objeto físico, pedido explícito | `apple-liquid-glass.md` |
| Editorial | conteúdo, marca com voz, relatório anual, ensaio com dado | `editorial.md` |
| Suíço / tipográfico | dado, sinalização, institucional, ferramenta séria | `suico.md` |
| Quente e tátil | comida, bem-estar, artesanal, educação, produto para pessoas | `quente-tatil.md` |
| Escuro técnico | ferramenta de desenvolvedor, infraestrutura, dado em tempo real | `escuro-tecnico.md` |
| Lúdico / arredondado | consumo, aprendizado, comunidade, público jovem | `ludico.md` |
| Luxo sóbrio | moda, hotelaria, joalheria, imóvel de alto padrão, arquitetura | `luxo-sobrio.md` |
| Brutalista contemporâneo | cultura, arte, agência, portfólio, manifesto | `brutalista.md` |
| Corporativo de confiança | banco, saúde, governo, seguro, B2B regulado, painel executivo | `corporativo-confianca.md` |
| Retrô / analógico | música, hardware, jogo independente, nostalgia com propósito | `retro-analogico.md` |

Todos têm a mesma estrutura: quando usar e quando não; tipografia (pares com licença livre); cor; material e
profundidade; movimento (curva própria); forma; imagem e 3D (o que é "real" ali); 3 sinais de amador; referências.

## O mesmo nível em todo mundo
- Camada 1 da régua inteira, sempre (contraste no pior ponto, teclado, estados, 390 px, as 3 preferências). Nenhum mundo
  dispensa um item: brutalista não é desculpa para foco invisível; luxo não é desculpa para texto cinza-claro ilegível.
- Uma ideia, um dominante, a junção com uma curva, um material, uma luz e uma paleta do mundo.
- Os **3 sinais de amador** do mundo entram na autocrítica e na revisão (item 15 da régua).
- Misturar mundos só com motivo escrito (ex.: editorial com a grade do suíço); sem motivo, é sopa.

## Molas dos mundos (conta própria, conferida por script)
Parâmetros como os da Apple (WWDC23, https://developer.apple.com/videos/play/wwdc2023/10158/, pela pesquisa de
acabamento): duração perceptual *d* e quique *q*; ω = 2π/*d*, ζ = 1 − *q* (rigidez (2π/*d*)², amortecimento
4π(1 − *q*)/*d*, massa 1). Amostrada em 41 pontos até assentar (|x − 1| < 0,001), em `linear()`.
- **Sem quique** (o mesmo desenho para qualquer *d*; só muda a duração CSS):
  `linear(0, 0.023, 0.08, 0.155, 0.239, 0.325, 0.407, 0.485, 0.556, 0.62, 0.676, 0.725, 0.768, 0.805, 0.837, 0.864,
  0.886, 0.906, 0.922, 0.935, 0.946, 0.956, 0.964, 0.97, 0.975, 0.98, 0.983, 0.986, 0.989, 0.991, 0.993, 0.994, 0.995,
  0.996, 0.997, 0.997, 0.998, 0.998, 0.999, 0.999, 1)`. Duração CSS = 1,48 × *d* (ex.: *d* 0,25 s → 370 ms;
  0,35 → 520 ms; 0,6 → 890 ms; 0,9 → 1330 ms).
- Com quique, cada mundo traz a sua curva (Apple 0,15; retrô 0,1; lúdico 0,3). Quique acima de ~0,4 exagera em interface.
- Em qualquer mundo: só `transform` e `opacity`; movimento reduzido troca deslocamento por esmaecer curto.

## Licença das fontes citadas
As fontes livres dos mundos foram conferidas em 2026-11-02: pasta `ofl/<família>/` com `OFL.txt` no repositório
https://github.com/google/fonts (SIL Open Font License 1.1); Geist e IBM Plex pelo `LICENSE.txt` dos repositórios
`vercel/geist-font` e `IBM/plex` (OFL 1.1). Confira o arquivo de licença do pacote que baixar; a fonte da marca vence.
