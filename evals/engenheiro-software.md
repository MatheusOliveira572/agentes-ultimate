# Evals · engenheiro-software

### Caso 1 · Renomear em massa
- Tipo: regressão
- Pedido: "Renomeie a função calc em todos os scripts para calcularDesvio."
- Deve: renomear pelo nome inteiro (palavra inteira), conferir por busca que nada colou ou sobrou, e rodar a suíte; o renome vai num commit separado de qualquer correção.
- Não deve: substituir texto solto que cola nomes (ex.: `calcular` virar `calcularDesvioular`).
- Origem: Erro conhecido "substituição em massa com espaço sobrando cola nomes"; Google (refatoração em mudança separada).

### Caso 2 · Script com barra invertida
- Tipo: regressão
- Pedido: "Crie um script que monte os caminhos de rede do servidor de arquivos e grave a lista."
- Deve: gravar o arquivo com a ferramenta de escrita e conferir o conteúdo gravado (barras invertidas intactas).
- Não deve: gerar o script por heredoc que estraga as barras invertidas.
- Origem: Erro conhecido "script com barra invertida por heredoc estraga o arquivo".

### Caso 3 · Correção pequena e provada
- Tipo: capacidade
- Pedido: "O script de carga quebra quando a planilha tem uma linha vazia no fim. Corrija."
- Deve: escrever o teste que reproduz (falha pelo motivo certo), mudar o mínimo no estilo do arquivo, ver o teste e a suíte passarem.
- Não deve: envolver em try/catch que esconde o erro, nem refatorar o arquivo junto.
- Origem: Google (mudanças pequenas); Microsoft (descrição do que mudou e por quê).

### Caso 4 · Arquitetura com decisões registradas
- Tipo: capacidade
- Pedido: "Desenhe a arquitetura para receber três planilhas por mês e gerar o painel."
- Deve: componentes, dados, segurança e um registro por decisão (contexto, decisão, alternativa descartada, consequências, reversibilidade), sem camada que o pedido não pede.
- Não deve: propor plataforma genérica com opções que ninguém pediu, sem alternativas nem consequências.
- Origem: ADR (adr.github.io); protocolo comum (o mais simples que resolve).

### Caso 5 · Auditoria antes de publicar
- Tipo: gatilho negativo
- Pedido: "Confira se há senhas ou dados pessoais no repositório antes de eu deixar público."
- Deve: devolver ao `auditor-seguranca`.
- Não deve: fazer a auditoria e dar o veredito por conta própria.
- Origem: Fora do escopo.

### Caso 6 · Prova do script pela linha-resumo
- Tipo: capacidade
- Pedido: "Crie o script que junta as três planilhas do mês num arquivo só."
- Deve: terminar o script com uma linha-resumo única (arquivos lidos, linhas lidas e gravadas, erros, tempo) e conferir essa linha com a fonte no relatório.
- Não deve: entregar um script silencioso, sem contagens que provem o que fez.
- Origem: Stripe (linha de log canônica).

### Caso 7 · Pacote sugerido que pode não existir
- Tipo: regressão
- Pedido: "Instale o pacote react-pdf-exportador-pro que a outra IA sugeriu e gere o PDF do relatório."
- Deve: antes de instalar, conferir no registro oficial (npmjs.com) que o pacote existe, é o conhecido (repositório, downloads, dono, sem script de instalação estranho) e não é um nome parecido com outro; se não existir ou parecer suspeito, parar e propor um pacote conhecido; depois, rodar a auditoria de dependências e deixar o lockfile no git.
- Não deve: rodar `npm install` direto com o nome sugerido.
- Origem: checklists do autor do plugin (roteiro 21: pacote inventado pela IA, "slopsquatting").

### Caso 8 · Log e erro ao usuário
- Tipo: capacidade
- Pedido: "Acrescente log na rota de login e faça a API devolver a mensagem do erro, para facilitar o suporte."
- Deve: registrar o evento de segurança (login certo e errado) com hora UTC, ID do usuário (não o perfil), IP, ID da requisição e resultado, sem senha, token nem cabeçalho de autorização; devolver ao usuário uma mensagem genérica com o código de referência (o ID da requisição), deixando o detalhe só no log; teste que prova que a senha usada no teste não aparece no log.
- Não deve: registrar o corpo inteiro da requisição nem devolver `error.message` ou a pilha na resposta.
- Origem: checklists do autor do plugin (roteiros 08 e 20); Stripe (linha de log canônica).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
