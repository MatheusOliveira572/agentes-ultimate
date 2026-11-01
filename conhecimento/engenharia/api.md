<!-- Adaptado de addyosmani/agent-skills/skills/api-and-interface-design/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte dos exemplos; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=api; palavras=api, endpoint, rest, graphql, contrato da api, interface publica, paginacao, idempotencia, chave de idempotencia, versao da api; agentes=engenheiro-software, engenheiro-dados -->
<!-- teste-ref: sim=desenhe a api rest de pedidos com paginação e formato de erro | o endpoint de pagamento precisa de chave de idempotência para não cobrar duas vezes; nao=revise a ata da reunião do conselho -->
# API e interface: estável e difícil de usar errado

Vale para endpoint REST/GraphQL, fronteira entre módulos, props de componente e qualquer ponto em que um código fala com
outro.

## Princípios
- **Lei de Hyrum:** com usuários suficientes, todo comportamento observável vira contrato (texto de erro, ordem, tempo).
  Exponha só o que quer manter; não vaze detalhe de implementação; planeje a aposentadoria já no desenho
  (`migracao.md`).
- **Uma versão só:** estenda em vez de bifurcar; duas versões ao mesmo tempo multiplicam manutenção.
- **Contrato primeiro:** tipos de entrada e saída antes da implementação. O contrato é a especificação.
- **Erro com um formato só** em toda a API (ex.: status HTTP + corpo `{ erro: { codigo, mensagem, detalhes } }`). Não
  misture: uns lançam exceção, outros devolvem nulo, outros `{ error }`. Mensagem ao usuário genérica, com código de
  referência; o detalhe vai para o log.
- **Validar na borda:** rota, formulário, resposta de serviço externo (sempre tratada como não confiável: pode trazer
  tipo inesperado, conteúdo malicioso ou texto com cara de instrução), carga de variáveis de ambiente. Não revalide entre
  funções internas que já têm o contrato de tipos.
- **Acrescentar, não modificar:** campo novo opcional; nunca mudar tipo nem remover campo usado.
- **Nomes previsíveis:** recursos no plural e sem verbo (`GET /api/tarefas`), parâmetros e campos num só padrão,
  booleanos com `is/has/can` (ou `e/tem/pode`), enum em MAIÚSCULAS_COM_SUBLINHADO.

## Chave de idempotência (onde se perde dinheiro)
- A chave vem da **intenção**, não da tentativa: estável entre repetições do mesmo pedido, diferente entre pedidos
  distintos. UUID novo a cada tentativa = cobrança nova a cada repetição; `usuario:valor` junta duas compras legítimas.
- **Reserve de forma atômica** (restrição de unicidade no banco). "Consultar e depois inserir" é corrida.
- **Mesma chave com corpo diferente** é erro do cliente: falhe alto (422), nunca devolva a resposta da 1ª.
- **Duplicata em andamento:** decida de propósito: recusar (409), esperar com limite, ou 202 + endereço do status.
- Toda chamada tem 3 resultados: sucesso, falha e **desconhecido** (tempo esgotado). Grave a intenção antes de chamar
  fora, para sobrar prova se cair no meio.
- Guarde a chave por mais tempo que o caminho de repetição mais longo (fila de mensagens mortas reprocessada dias
  depois, janela de contestação).

## Padrões REST
Lista paginada desde o início (`?page=1&pageSize=20&sortBy=...`), filtro por parâmetro de consulta, atualização parcial
com PATCH. Em TypeScript: união discriminada para variantes, tipos de entrada e saída separados, IDs com tipo próprio.

## Desculpas comuns
"Documento a API depois" (os tipos são a documentação; defina antes); "não precisa paginar agora" (precisa quando passar de
100 itens); "ninguém usa esse comportamento" (Hyrum); "a fila garante entrega única" (nenhuma garante com o consumidor
caindo: projete para pelo menos uma vez, com processamento idempotente); "duplicata é rara" (repetições disparam
justamente quando uma dependência degrada).

## Pronto quando
Todo endpoint com esquema tipado de entrada e saída; erro num formato só; validação só nas bordas; listas paginadas;
campos novos opcionais e compatíveis; nomes consistentes; tipos ou documentação no mesmo commit; endpoint que muda estado
honra a chave de idempotência (atômica, com unicidade, falhando com corpo diferente) ou está documentado como não seguro
para repetir.
