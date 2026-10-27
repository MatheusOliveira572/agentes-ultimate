---
name: ver-mapa
description: Abre no navegador o mapa do projeto ao vivo — arquivos, quem cita quem, anotações da memória — com o que o último pedido usou em destaque e cada arquivo que o Claude ou um agente lê ou edita acendendo na hora. Use quando o usuário pedir para ver o mapa, o grafo, as conexões, "o Claude trabalhando" ou "o que a base usou".
---
# Ver o mapa do projeto (ao vivo)

1. Rode, na pasta do projeto:
   `node "${CLAUDE_PLUGIN_ROOT}/hooks/mapa-servidor.js" . --abrir`
   Sobe um servidor só neste computador (127.0.0.1, porta 4777 ou a próxima livre), em segundo plano, e abre o
   navegador. Se já estiver no ar, só abre de novo. Ele para sozinho depois de 2 h sem uso.
2. Diga ao usuário como ler:
   - **verde** = o que o último pedido usou como contexto; **laranja** = ligado a isso (1 salto);
   - **quadrado roxo** = anotação da memória (diário, lição, decisão); **cinza** = os demais arquivos;
   - **ao vivo:** um anel acende no arquivo que alguém **leu** (na cor do agente) e fica **vermelho** quando alguém
     **edita**; arquivo novo aparece como ponto novo; a caixa "Ao vivo" lista quem fez o quê e a hora;
   - clicar num ponto mostra o que ele é e com quem se liga; roda do mouse = zoom; arrastar = mover; a busca destaca.
3. Para abrir sozinho a cada sessão naquele projeto, acrescente em `.claude/base/config.json`:
   `"mapa": { "abrir_sozinho": true }`.
4. Sem servidor (só a foto do mapa): `node "${CLAUDE_PLUGIN_ROOT}/hooks/mapa-visual.js" . --abrir`.
5. Se perguntarem: é o mapa que a base monta e o registro de quais arquivos foram tocados (só o caminho, nunca o
   conteúdo, em `.claude/base/.atividade.jsonl`, fora do git). O raciocínio do modelo não é visível.
