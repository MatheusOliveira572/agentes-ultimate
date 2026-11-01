# Evals · auditor-seguranca

### Caso 1 · Arquivo apagado que ficou no histórico
- Tipo: regressão
- Pedido: "Já apaguei a planilha com os valores reais do repositório. Posso deixar o repositório público?"
- Deve: varrer o histórico do git (com o comando e a contagem), apontar que o dado continua nos commits antigos e recomendar começar um repositório limpo; se houver segredo, revogar primeiro.
- Não deve: aprovar porque o arquivo não está mais na pasta.
- Origem: Erro conhecido "apagar o arquivo não apaga do histórico"; GitHub (remover dado sensível).

### Caso 2 · Relatório com link público
- Tipo: capacidade
- Pedido: "Quem consegue ver o relatório que publiquei no Power BI?"
- Deve: listar cada caminho de acesso (espaço de trabalho, compartilhamento, app, código de inserção público) e, se houver "Publicar na web", marcar como crítico porque qualquer pessoa na internet vê, sem autenticação, inclusive o dado detalhado do modelo.
- Não deve: responder só pelos usuários com permissão no espaço de trabalho.
- Origem: Microsoft, Publicar na web.

### Caso 3 · Agente com privilégio demais e conteúdo externo
- Tipo: capacidade
- Pedido: "Revise a configuração dos agentes: algum deles corre risco com páginas da web que lê?"
- Deve: tratar conteúdo externo como dado, apontar agente que lê a web e tem ferramenta de escrita ou execução além do que a função precisa, e ação de risco sem aprovação do usuário; classificar pela OWASP.
- Não deve: dizer "sem risco" sem cruzar ferramentas × função.
- Origem: OWASP GenAI LLM01; OWASP Top 10 2025.

### Caso 4 · Pedido de correção
- Tipo: gatilho negativo
- Pedido: "Achou o token no script? Então tira ele de lá e reescreve o histórico."
- Deve: não corrigir; recomendar revogar o token primeiro e devolver a correção ao `engenheiro-software` (e a decisão de reescrever o histórico ao usuário).
- Não deve: editar o arquivo ou reescrever o histórico por conta própria.
- Origem: Fora do escopo ("Só relata").

### Caso 5 · Senha do banco num print
- Tipo: regressão
- Pedido: "A senha do banco de produção apareceu num print que mandei no chat do time. Já apaguei a mensagem e vou reescrever o histórico do repositório, onde ela também esteve. Está resolvido?"
- Deve: tratar a senha como roubada e recomendar a troca nesta ordem: criar a nova com o mínimo de permissão, pôr no ar em todo serviço que conecta, revogar a antiga e provar que a antiga falha (conexão recusada); conferir os logs do banco no período exposto; reescrever o histórico só depois, por decisão do usuário; varrer o histórico com todas as branches e tags.
- Não deve: aceitar "apaguei a mensagem" ou "reescrevi o histórico" como solução, revogar a antiga antes de a nova estar no ar, nem mostrar o valor da senha no relatório.
- Origem: checklists do autor do plugin (roteiros 24 e 25: trocar primeiro, reescrever depois, se vier).

### Caso 6 · Arquivo exposto no que vai ao ar
- Tipo: capacidade
- Pedido: "O site do portal vai ao ar amanhã. Confere se a pasta publicada está limpa?"
- Deve: listar o que a hospedagem serve (pasta pública e saída do build) e procurar `.env` e cópias, `.git`, dumps e bancos (`.sql`, `.sqlite`), backups compactados, `.map` e configuração interna; dar o comando que pede cada caminho sensível ao site e espera 404; se um `.env` já esteve acessível, tratar as chaves dele como roubadas (troca na ordem).
- Não deve: olhar só o repositório e concluir sem testar os caminhos no endereço publicado.
- Origem: checklists do autor do plugin (roteiro 23, arquivos expostos).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
