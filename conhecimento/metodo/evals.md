<!-- Adaptado de affaan-m/ECC/skills/eval-harness/SKILL.md @b38be6a, © 2026 Affaan Mustafa, MIT; e de addyosmani/agent-skills/evals/skill-impact.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, condensação, ligado às ferramentas do plugin; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/ e terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=evals; palavras=eval, evals, avaliar agente, medir se o agente melhorou, teste de agente, regressao do agente, pass@k, qualidade dos agentes, avaliador; agentes=curador, engenheiro-software -->
<!-- teste-ref: sim=meça se o agente melhorou depois da mudança, com evals de regressão | monte os evals do agente com avaliador por código e pass@k; nao=reajuste a tabela de preços do frete -->
# Evals: provar que um agente ou uma instrução melhorou

Defina o comportamento esperado **antes** de mudar; rode sempre; acompanhe as regressões.

## Tipos
- **Capacidade:** faz algo novo? (pode falhar no começo; é a meta.)
- **Regressão:** o que funcionava continua? (tem de passar sempre; ligada a um erro real ou a uma regra.)

## Avaliadores (do mais barato ao mais caro)
1. **Por código:** comando que sai 0 ou 1; determinístico, sempre a primeira escolha (`scripts/eval-roteamento.js`, `testar-hooks.js`).
2. **Por modelo:** um agente lê a saída contra critérios; para o que o código não mede (tom, qualidade do texto). Registre
   a nota com o motivo; repita para ver a variação.
3. **Humano:** o usuário ou o especialista; para risco alto; caro, então pouco.

## Métricas
- **pass@1:** acerta de primeira. **pass@3:** acerta em até 3 tentativas (meta típica: acima de 90%).
- **pass^3:** 3 acertos seguidos: a régua para caminho crítico.
Resultado não determinístico: rode mais de uma vez antes de concluir.

## Fluxo
1. **Definir** os casos: pedido, deve, não deve, origem (formato de `evals/<agente>.md`), inclusive 1 gatilho negativo.
2. **Linha de base:** rode na versão atual e guarde o que falhou.
3. **Mudar** o mínimo.
4. **Rodar de novo** e comparar. Sem ganho: volte a mudança.
5. **Relatório:** casos, taxa antes → depois, regressões.

## Uma instrução nova muda o resultado? (impacto)
Mesmo pedido, com e sem a instrução, em sessão limpa (`claude -p`, com `AGENTES_ULTIMATE_SEM_PASTA=1`). Se o resultado não muda, a
instrução é peso à toa. **Registre também o que foi rejeitado**, com a medida, para ninguém tentar de novo a mesma ideia morta.

## Roteamento
`node "<plugin>/scripts/eval-roteamento.js"`: casos de `evals/roteamento.json` contra o roteador real, piso de 90% em 1º
lugar, e o relatório das palavras que levam a mais de um pacote. Não ajuste palavra só para o caso passar.

## Comportamento (opcional, gasta tokens)
Rodar o `claude` sem tela para ver se um agente abre a referência certa: 1 caso que deve abrir e 1 que deve ficar quieto, olhando
as leituras na saída `--output-format stream-json --verbose`.
