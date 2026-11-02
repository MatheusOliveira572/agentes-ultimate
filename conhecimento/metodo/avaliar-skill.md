<!-- Adaptado de DietrichGebert/ponytail/benchmarks/agentic/README.md, benchmarks/results/2026-10-07-agentic.md e .github/CONTRIBUTING.md @96608e0, © 2026 DietrichGebert, MIT. Alterações: tradução e resumo do método; ressalvas da crítica independente; nenhum código do executor; alterado por agentes-ultimate. Licença em terceiros/dietrichgebert-ponytail/. -->
<!-- ref: tema=avaliar-skill; palavras=avaliar skill, benchmark de agente, medir se a instrucao melhorou, tres bracos, braco sem skill, mudanca de regra do agente; agentes=curador, planejador -->
<!-- teste-ref: sim=faça um benchmark de agente para avaliar a skill antes de mudar a regra | medir se a instrução melhorou, com braço sem skill; nao=escreva a legenda do post de aniversário -->
# Avaliar se uma mudança de instrução melhorou o agente

Complementa `evals.md`. Serve para mudança em agente importante, no protocolo comum, no roteador ou numa skill.

## Desenho
- **3 braços, mesma tarefa, mesmo modelo:** sem a instrução · a versão atual · a versão com a mudança. Rode os 3 na mesma janela de
  tempo, alternando por tarefa, para que a hora e a variação do modelo atinjam todos igual.
- **Tarefas de 2 tipos:** com checagem oculta que roda o resultado (defeito, segurança, privacidade, renomear em todo chamador) e
  abertas, em que o agente escolhe o escopo. Pelo menos uma tarefa onde a mudança deve ajudar e uma que ela pode quebrar (regra nova
  briga com regra velha).
- **Cada instrumento tem uma referência boa e uma ruim** e um autoteste que prova, antes de gastar, que a boa passa e a ruim é pega.
  Juiz por modelo também tem autoteste (ordenar a referência exagerada acima da mínima) e julga às cegas.
- **Isolamento:** cada sessão numa pasta temporária nova, fora de qualquer repositório git, sem `CLAUDE.md`, sem memória automática e
  só com o plugin em teste (`--plugin-dir`). Confira na transcrição de uma sessão o que foi injetado. Dentro de um repositório o
  Claude Code mostra ao modelo as mensagens de commit, e o braço "sem skill" deixa de ser limpo.
- **Estatística:** mediana de 5 ou mais execuções por tarefa; razão braço ÷ base por tarefa; média geométrica das razões, com
  intervalo de 95% por bootstrap; "melhor em X de Y tarefas" por teste do sinal.
- **Custo antes:** mostre ao usuário a estimativa (sessões × custo médio) e rode só com o aceite dele. Nada roda sozinho.

## O que medir
Linhas e arquivos do código entregue (testes à parte, nunca contados como inchaço), checagens ocultas, tokens, custo, tempo, se
escreveu teste onde a lógica precisa e **se o teste pega defeito injetado** (inverter comparação, tirar um `if`, erro de um).

## Exemplo de leitura honesta (resultado do autor, 2026-10-07)
Com a skill: −53% de linhas e −26% de custo em 39 tarefas, só com Opus 5.5 e sem shell. Mas: checagens ocultas empatadas (87/90 ×
86/90); mais testes escritos, porém **bugs pegos onde há teste caíram de 77% para 69%**; teste desnecessário subiu de 36% para 45%; o
juiz cego não viu diferença contra o agente sem skill (p = 0,09). E a versão anterior do benchmark foi criticada por terceiros (Scott
Logic, InfoQ): uma frase curta ("siga YAGNI") empatou com a skill. **Número do próprio autor não é prova independente.**

## Regra para mudar agente importante
Proposta que muda o que o agente é instruído a fazer traz o antes × depois: o caso de eval em que deve ajudar, o caso que pode
quebrar, as 2 versões rodadas e o resultado. Sem isso, fica proposta.
