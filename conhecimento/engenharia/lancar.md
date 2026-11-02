<!-- Adaptado de addyosmani/agent-skills/skills/shipping-and-launch/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte da lista de pré-lançamento (ela é a skill checklist-lancamento do plugin, sem duplicar); alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=lancar; palavras=lancamento em etapas, liberacao gradual, rollout, canario, plano de volta, rollback, criterio de volta, monitorar o lancamento, go-live, colocar no ar; agentes=gerente-produto, engenheiro-software -->
<!-- teste-ref: sim=planeje o rollout em etapas com canário e critério de rollback | faça o plano de go-live com liberação gradual e monitoramento do lançamento; nao=revise a política de home office -->
# Lançar em etapas, com critério de volta

**A lista do que conferir antes de publicar é a skill `/checklist-lancamento`** (segurança, dados pessoais, acessibilidade,
desempenho, operação): rode-a primeiro. Aqui está o como liberar.

## Chave de liberação (feature flag)
Implantar ≠ liberar: o código vai ao ar desligado e liga por grupo; toda chave nasce com data de remoção.

## Sequência
Interno (o time) → grupo pequeno (1–5%) → metade → todos; em cada passo, olhe as métricas por um tempo combinado antes de
avançar.

## Critérios por métrica (contra a linha de base de antes)
| Métrica | Avançar | Segurar e investigar | Voltar |
|---|---|---|---|
| taxa de erro | até 10% acima | 10–100% acima | mais de 2× |
| latência p95 | até 20% acima | 20–50% acima | mais de 50% acima |
| erros de JavaScript no cliente | nenhum tipo novo | tipo novo em < 0,1% das sessões | tipo novo em > 0,1% |
| métrica de negócio | neutra ou melhor | queda < 5% (pode ser ruído) | queda > 5% |

## Voltar
Quem decide, em quanto tempo, como (desligar a chave antes de reverter código), e o que avisar a quem. Volta treinada
antes do lançamento, não inventada na hora.

## Depois de ir ao ar
Painel e alertas por sintoma (`observabilidade.md`); conferência pós-lançamento (o fluxo principal funciona no ambiente de
destino, com prova); registro do que aconteceu e do que se aprendeu.
