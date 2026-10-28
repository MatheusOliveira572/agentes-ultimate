---
name: placar
description: Mostra o placar dos agentes — quantas vezes cada um passou no revisor de primeira, defeitos que o revisor achou por gravidade, defeitos que escaparam ao usuário, retrabalho, acerto da estimativa de término e a taxa de captura do revisor (meta 80%). Use quando o usuário pedir o placar, o desempenho ou a qualidade dos agentes, "quem erra mais", ou no fechamento de uma etapa.
---
# Placar dos agentes

1. Rode, na pasta do projeto:
   - todos os projetos: `node "${CLAUDE_PLUGIN_ROOT}/scripts/placar.js"`
   - só este projeto: `node "${CLAUDE_PLUGIN_ROOT}/scripts/placar.js" --projeto`
   O comando refaz `~/.claude/agentes-ultimate/placar.json` a partir dos registros e imprime a tabela.
2. Mostre a tabela ao usuário e leia em 2–3 linhas: quem passou de primeira mais vezes, quem deixou defeito escapar,
   se a taxa de captura do revisor está acima ou abaixo da meta de 80% e se as faixas de término estão acertando.
   Não invente número: o que o placar não tiver ("—"), diga que ainda não há registro.
3. De onde vêm os números (só metadados, nunca o conteúdo do pedido):
   - execuções e minutos: o gancho de cada agente que termina (`execucoes.jsonl`);
   - revisor: a linha fixa `Placar: autor=… cod=… veredito=… B= A= M= b= ids=…` no fim do relatório
     (`revisoes.jsonl`); cada achado conta uma vez por trabalho (pelos ids; sem ids, o maior número de cada gravidade
     entre as revisões do mesmo código);
     revisão sem essa linha não conta e vira aviso em `estado.json`;
   - defeitos que escaparam: a skill `registrar-defeito` (`defeitos.jsonl`; o texto fica só no projeto);
   - retrabalho: execuções do autor com o mesmo código de trabalho depois de um "não" do revisor (a correção reusa o
     código);
   - acerto da estimativa: execuções com faixa registrada (`estimar.js faixa --registrar`).
