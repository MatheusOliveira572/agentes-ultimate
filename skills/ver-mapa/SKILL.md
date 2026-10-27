---
name: ver-mapa
description: Abre no navegador o mapa visual do projeto — arquivos, quem cita quem, anotações da memória ligadas aos arquivos — com o que o último pedido usou em destaque. Use quando o usuário pedir para ver o mapa, o grafo, as conexões, a memória ou "o que a base usou".
---
# Ver o mapa do projeto

1. Rode, na pasta do projeto:
   `node "${CLAUDE_PLUGIN_ROOT}/hooks/mapa-visual.js" . --abrir`
   (gera `.claude/base/MAPA.html`, fora do git, e abre no navegador padrão).
2. Diga ao usuário como ler:
   - **verde** = arquivos e anotações que o último pedido usou; **laranja** = ligados a eles (1 salto);
   - **quadrado roxo** = anotação da memória (diário, lição, decisão); **cinza** = os demais arquivos;
   - clicar num ponto mostra o que ele é e com quem se liga; a roda do mouse dá zoom; arrastar move; a caixa de
     busca destaca pelo nome.
3. Se o projeto for grande, o mapa mostra os ~450 arquivos mais conectados e sempre os usados no último pedido.
4. Explique, se perguntarem, que isto é o mapa do projeto que a base monta (sem IA); não é o raciocínio interno do
   modelo, que não é visível.
