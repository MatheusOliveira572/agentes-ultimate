<!-- Adaptado de addyosmani/agent-skills/references/testing-patterns.md e skills/test-driven-development/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte dos exemplos de sintaxe, ajuste a qualquer pilha; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=padroes-de-teste; palavras=mock, mocks, simulacao, dublê de teste, teste instavel, flaky, nome do teste, arrange act assert, snapshot, isolamento dos testes; agentes=testador-qa, engenheiro-software -->
<!-- teste-ref: sim=os testes usam mock para tudo e passam mas a produção quebra, revise a suíte | tem teste flaky que falha só quando roda junto com os outros; nao=traduza este e-mail para o inglês -->
# Como escrever bons testes (qualquer pilha)

## Estrutura e nome
- **Preparar → agir → conferir** (Arrange-Act-Assert), com as três partes visíveis.
- Nome no formato `[unidade] [comportamento esperado] [condição]`: "completarTarefa marca concluída e grava a hora".
  O conjunto dos nomes tem de ler como especificação.
- **Um conceito por teste**: "recusa título vazio" e "tira espaços do título" são dois testes.

## Conferir o estado, não as chamadas
Confira o **resultado** da operação, não quais métodos foram chamados por dentro. Teste que confere a sequência de
chamadas quebra na refatoração mesmo com o comportamento igual.

## DAMP antes de DRY
No código, não repetir (DRY) costuma ser certo. No teste, vale o **descritivo e significativo** (DAMP): cada teste conta a
história inteira sem obrigar a seguir ajudantes compartilhados. Repetição no teste é aceitável quando deixa cada um
legível sozinho.

## Implementação real antes de simulação
Ordem de preferência: (1) a implementação real; (2) uma versão falsa em memória (banco falso); (3) stub com respostas
fixas; (4) mock que confere chamadas. Simule **só nas bordas**: banco, HTTP, sistema de arquivos, relógio, aleatório,
serviço externo (e-mail, pagamento, IA). Não simule as suas funções utilitárias nem a regra de negócio. Simulação demais
dá teste que passa com produção quebrada. Para queda ou desfazer de transação, exercite a borda real: exceção injetada não
é o processo morrendo, e chamada simulada de transação não é o banco desfazendo.

## Antipadrões
| Antipadrão | Problema | Saída |
|---|---|---|
| Testar detalhe de implementação | Quebra na refatoração sem mudança de comportamento | Entradas e saídas |
| Teste instável (tempo, ordem) | Mina a confiança na suíte | Asserção determinística, estado isolado, relógio fixo |
| Testar o framework | Gasta tempo com código de terceiro | Só o seu código |
| Snapshot grande que ninguém revisa | Quebra em qualquer mudança e é aprovado no automático | Pouco e revisado linha a linha |
| Testes dependentes entre si | Passam sozinhos e falham juntos | Cada um monta e desmonta o próprio estado |
| Asserção fraca | Passa sem conferir nada | Valor exato esperado |

## Teste instável
Ache a causa (corrida, espera por tempo fixo, estado compartilhado, ordem, fuso, rede). Quarentena só declarada: o teste
vai marcado como pendente **com o motivo e a pendência no relatório**, nunca desligado em silêncio para a suíte passar.

## Hora e data
Nada de hora fixa ("14:10") em teste: use hora relativa a agora ou um relógio fixado por variável. Dado de teste com hora
respeita a ordem real dos eventos.
