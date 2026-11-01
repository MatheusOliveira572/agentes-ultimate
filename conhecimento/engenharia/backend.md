<!-- Adaptado de affaan-m/ECC/skills/backend-patterns/SKILL.md @b38be6a, © 2026 Affaan Mustafa, MIT. Alterações: tradução, corte dos exemplos de código; alterado por agentes-ultimate. Licença em terceiros/affaan-m-ECC/. -->
<!-- ref: tema=backend; palavras=backend, servidor, camada de servico, repositorio de dados, middleware, transacao, fila, job em segundo plano, limite de requisicoes, rate limit, retentativa, backoff; agentes=engenheiro-software, engenheiro-dados -->
<!-- teste-ref: sim=estruture o backend com camada de serviço, repositório de dados e middleware de autenticação | o job em segundo plano precisa de fila, retentativa com backoff e rate limit; nao=prepare a proposta comercial para o cliente -->
# Padrões de servidor (backend)

API em si (contrato, erros, paginação, idempotência): `api.md`. Lentidão: `desempenho.md`. Logs e alertas:
`observabilidade.md`.

## Camadas
- **Rota/controlador:** recebe, valida a entrada (na borda), chama o serviço, devolve no formato único. Sem regra de
  negócio.
- **Serviço:** a regra de negócio, testável sem HTTP nem banco real.
- **Repositório:** acesso a dados atrás de uma interface; troca de banco e teste com versão em memória ficam fáceis.
- **Middleware:** o que vale para toda requisição (autenticação, log com ID de correlação, limite de requisições,
  tratamento central de erro).

## Banco
- Peça só as colunas que usa; evite N+1 (traga a relação na mesma consulta); pagine.
- **Transação** quando várias escritas têm de valer juntas ou nenhuma; curta (nunca esperando rede ou usuário dentro).
- Migração de esquema: expandir → contrair (`migracao.md`).

## Cache (cache-aside)
Lê do cache; se não tem, lê da fonte e grava com prazo (TTL). Na escrita, invalide a chave. A chave inclui tudo de que a
resposta depende (cliente, idioma, permissão). Só para o que é caro e lido muito mais do que muda.

## Erros e falhas de fora
- **Tratador central:** erro conhecido vira status e código de referência; erro inesperado vira 500 genérico ao usuário,
  com o detalhe só no log.
- **Retentativa com espera exponencial** (ex.: 1 s, 2 s, 4 s, com variação aleatória) e número máximo; só para erro
  temporário (tempo esgotado, 429, 503) e só em operação idempotente (ou com chave de idempotência).
- Tempo-limite em toda chamada externa.

## Acesso
- Identidade sempre conferida no servidor (token validado: assinatura, validade, emissor); nunca confiar em ID, papel ou
  preço vindo do navegador.
- Permissão por papel (RBAC) conferida em cada operação, não só na tela; usuário A não vê dado de B (teste com dois
  usuários). Detalhes de segurança: `auditor-seguranca`.

## Limite de requisições
Por usuário ou chave e por IP, com resposta 429 e `Retry-After`; mais apertado em login, cadastro e envio de e-mail.

## Trabalho em segundo plano
O que é lento ou depende de terceiro sai da requisição para uma fila: a requisição registra o trabalho e responde; o
trabalhador processa com retentativa, idempotência (pode chegar mais de uma vez) e fila de mensagens mortas para o que
falhar sempre, com alerta.
