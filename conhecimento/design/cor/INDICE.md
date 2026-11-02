<!-- Adaptado de jakubkrehel/skills/skills/better-colors/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte; a paleta da marca do projeto vence; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=cor; palavras=cor, cores, paleta, contraste, tokens de cor, rampa de cor, oklch, tema escuro, modo escuro, cor da marca, gradiente; agentes=designer-interface, designer-paineis, designer-documentos, engenheiro-software, designer-sites -->
<!-- teste-ref: sim=monte a paleta e os tokens de cor do app com tema escuro | o contraste das cores do relatório está ruim, revise a paleta; nao=prepare o parecer sobre a cláusula de multa -->
# Cor: sistema de rampas, tokens por papel, contraste medido

**Nunca relate um contraste que você não mediu, nem estime uma cor que dá para calcular.** Se o par passa ou não é decisão
de `../acessibilidade/INDICE.md`; superfícies, sombras e cor de ícone estão em `../detalhes-interface.md`. A paleta da
marca do projeto (`.claude/base/PROJETO.md`, manual da marca) vence.

## Regras
- **Use o sistema do projeto** (tokens e notação). Hex consistente vence hex com `oklch()` espalhado. Sistema novo:
  `oklch()` por padrão (os números se comportam como as regras abaixo pedem).
- **Sistema = rampas, não cores soltas:** uma rampa neutra, uma de destaque e só as de status que o produto usa de verdade.
  Segundo destaque só quando duas coisas precisam ser distinguidas.
- **Cada degrau tem um papel** (fundo da página, hover do componente, borda, preenchimento sólido, texto do corpo); não
  gere degrau que nenhum papel usa.
- **Primitivos pelo matiz, semânticos pelo papel:** `--azul-600` (primitivo) nunca vai direto no componente;
  `--cor-texto-secundario` (semântico) aponta para um primitivo e é o único que o componente usa.
- **Token só no seu papel:** nunca emprestar um token porque o valor serve hoje (separador como cor de texto quebra quando a
  borda clarear). Papel sem token: crie o token.
- **Rampa com o mesmo matiz** de ponta a ponta, mais viva no meio, degraus mais finos no lado claro (≈ 0,04–0,05 de L em
  OKLCH); feita com biblioteca de cor, nunca no olho. Croma proporcional ao máximo de cada matiz, não o mesmo número.
- **Uma cor, um significado** em toda a interface (matizes a menos de 15° em OKLCH contam como a mesma cor). Cor nunca é o
  único sinal: junte ícone, texto ou forma.
- **Um preenchimento por tela:** se a cor cheia marca a ação principal, só uma ação a recebe; as outras ficam neutras. Cor
  no fundo, não no rótulo.
- **Meça o par renderizado:** o texto contra o fundo em que ele realmente aparece (não o da página). Par falhou: relate o
  par, o valor medido e o limite; não troque a cor por conta própria se a cor é da marca.
- **Gradiente:** interpolação `in oklab` por padrão; `in oklch` quando dois matizes ficam cinza no meio.
- **Tema escuro** não é a rampa clara invertida: menos croma no destaque, mais degraus no lado escuro, todos os pares
  medidos de novo. Um mecanismo só de troca (`prefers-color-scheme` ou classe `.dark`).
- Correção de contraste muda a **luminosidade**, não o matiz. `prefers-contrast: more` com valor próprio por tema.
- Texto sobre cor com transparência: meça o resultado ou use um token sólido. Branco sobre o degrau 500 da maioria dos
  matizes falha 4,5:1: vá para o 600.

## Antes de terminar
| Padrão | Correção |
|---|---|
| hex/rgb/oklch solto no componente onde existe token | usar ou criar o token do papel |
| primitivo (`--azul-600`) no componente | token semântico apontando para ele |
| nome semântico com matiz ou componente (`--cor-botao-azul`) | nome pelo papel (`--cor-destaque-solido`) |
| token de borda usado em `color:` | token novo para o papel |
| rampa em `hsl()` só mudando a luminosidade | refazer com matiz percebido constante |
| status a menos de 15° do destaque | afastar 15°+ ou dar outro tratamento à ação destrutiva |
| cor fora do sRGB sem o valor sRGB antes | sRGB primeiro, a cor viva dentro de `@media (color-gamut: p3)` |

## Relatório
Gravidade: **ALTO** (conteúdo ilegível ou cor de significado enganoso; texto do corpo ou de controle abaixo do contraste
exigido é sempre ALTO); **MÉDIO** (falha visível de tema, token ou gama); **BAIXO** (acabamento isolado). Uma linha por
causa raiz, com todos os lugares: | Gravidade | Onde (`arquivo:linha`) | Antes | Depois | Por quê |. Termine com
**Bloquear** se sobrou ALTO, senão **Aprovar**; nunca aprove o que não inspecionou. Sem achados: "nenhum achado de cor".
