<!-- Adaptado de addyosmani/agent-skills/skills/code-review-and-quality/SKILL.md e skills/doubt-driven-development/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, condensação; contraprova pela ideia do strix analysis/counterevidence (Apache-2.0); alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=revisar-codigo; palavras=revisao de codigo, code review, revisar o codigo, revise o codigo, revisar a entrega, pull request, qualidade do codigo; agentes=revisor, engenheiro-software -->
<!-- teste-ref: sim=faça a revisão de código deste pull request | revise o código da entrega quanto à qualidade; nao=defina a meta de vendas do trimestre -->
# Revisão de código: 5 eixos, tamanho e rótulos

## Os 5 eixos, nesta ordem
1. **Correção:** faz o que o contrato pede, nas bordas e nos erros; os testes cobrem o comportamento.
2. **Legibilidade e simplicidade:** um colega novo entende? daria com menos linhas? abstração paga o que custa?
3. **Arquitetura:** segue os padrões do projeto, dependências na direção certa, sem duplicar.
4. **Segurança:** entrada validada na borda, segredo fora, autorização conferida (`../seguranca/lista.md`).
5. **Desempenho:** N+1, sem limite, trabalho repetido; só com evidência.

## Tamanho
~100 linhas mudadas: bom, revisa de uma vez. ~300: aceitável, se for uma mudança lógica só. ~1.000: grande demais, peça para dividir
(empilhado, por grupo de arquivos, horizontal ou fatias verticais). Olhe também o tamanho do arquivo.

## Rótulos
| Rótulo | Quer dizer | Exemplo |
|---|---|---|
| **Crítico** | bloqueia | falha de segurança, perda de dado, função quebrada |
| **Nit** | menor; o autor pode ignorar | formatação, gosto |
| **Opcional** | sugestão | vale pensar, não é exigência |
| **FYI** | informação | contexto para depois |
Correspondência com o relatório do plugin: Crítico = Bloqueante ou Alto; Nit e Opcional = baixo ou observação.

## Contraprova antes de registrar
Para cada achado, argumente o contrário: **confirmado** (como reproduzir), **descartado** (qual controle, onde, e que ele roda nesse caminho)
ou **lacuna de prova** (plausível e sem controle nomeado: fica como pendência, não vira "descartado").

## Contexto limpo
O revisor recebe só o artefato e o contrato, nunca o raciocínio do autor: o que o autor pensou ancora o julgamento. No máximo 3 ciclos.
