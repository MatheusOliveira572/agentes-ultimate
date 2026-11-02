<!-- Adaptado de jakubkrehel/skills/skills/build-design/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução, corte, extensão ao gabarito em imagem e ao Power BI; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=construir-do-desenho; palavras=construir a partir do figma, figma, gabarito, a partir do desenho, implementar o design, fiel ao layout, pixel perfect, da imagem para o codigo, construir a tela do gabarito; agentes=engenheiro-software, dev-powerbi, designer-interface, designer-paineis -->
<!-- teste-ref: sim=construa a tela a partir do figma, fiel ao layout aprovado | implemente o gabarito aprovado em código e compare elemento por elemento; nao=agende a reunião de alinhamento trimestral -->
# Construir a partir do desenho (Figma, gabarito, imagem)

1. **Leia o desenho na fonte:** com o Figma ligado, os valores vêm do contexto de design (procure a ferramenta `figma`
   antes de dizer que não há); com imagem, meça na imagem e marque o que é estimado.
2. **Mapeie para o projeto:**
   | No desenho | No código |
   |---|---|
   | variável ou estilo vinculado | o token de mesmo nome ou valor |
   | valor solto igual a um token | esse token |
   | valor solto sem token | o token mais próximo, listado como "arredondado" |
   | instância de componente | o componente do projeto com esse nome e a variante mostrada |
   | instância sem equivalente no projeto | marcação simples no lugar, listada como desvio, perguntando se deve virar componente |
   | grupo avulso de camadas | marcação simples no lugar, não um componente novo |
3. **Construa só o que o desenho mostra.** Estado que o desenho não desenhou (carregando, erro) não se inventa: fica o
   padrão, e a falta vai para o relatório.
4. **Compare com o desenho:** captura do construído × gabarito na mesma largura; alinhamento ±2 px; nada cortado ou
   sobreposto.
5. **Relate e pare:**
   | Elemento | Desenho | Construído | Situação |
   |---|---|---|---|
   | recuo do cartão | 20 px | `p-5` | igual |
   | tamanho do título | 15 px | `text-sm`, 14 px | arredondado para o token |
   | selo | pílula preenchida | rótulo de texto | desvio: não há componente de selo (perguntado) |
   Mais: **sem ligação** (o que vem de props até existir o servidor), **estados faltando**, **conflitos** (onde o desenho
   quebra uma regra, com o arquivo de referência que manda).

## Antes de terminar
Valor no código que só aparece na captura e não no desenho → leia do contexto de design; utilitário arbitrário
(`w-[343px]`) ou hex solto no diff → token, ou pergunte se o arredondamento aparece; arquivo novo de componente para um
quadro que não é componente → marcação simples; ramo de carregando/erro que o desenho não tem → tire e liste como falta.

## Power BI (dev-powerbi)
O "token" é o tema (JSON) e as medidas de formatação; posição e tamanho vêm do gabarito em px; a comparação é a imagem
exportada da página contra o gabarito, com a tabela acima.
