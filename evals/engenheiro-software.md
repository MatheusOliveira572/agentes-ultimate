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
- Deve: registrar o evento de segurança (login certo e errado) com os campos do item S-12 do checklist (hora UTC, ID do usuário, IP, ID da requisição, resultado), sem senha, token nem cabeçalho de autorização; devolver ao usuário uma mensagem genérica com o código de referência (o ID da requisição), deixando o detalhe só no log; teste que prova que a senha usada no teste não aparece no log.
- Não deve: registrar o corpo inteiro da requisição nem devolver `error.message` ou a pilha na resposta.
- Origem: checklists do autor do plugin (roteiros 08 e 20); Stripe (linha de log canônica).

### Caso 9 · Rota com ID vindo do navegador
- Tipo: capacidade
- Pedido: "Crie a rota GET /api/pedidos/:id que devolve o pedido para a tela de detalhe."
- Deve: pegar o usuário da sessão verificada no servidor (401 sem login), buscar o pedido filtrando pelo dono (pedido de outro usuário devolve 403 ou 404, sem IDOR), consulta parametrizada, só os campos que a tela usa; testes com dois usuários de teste (A não lê o pedido de B) e sem login.
- Não deve: confiar no ID do usuário vindo do corpo, da URL ou de um cabeçalho, nem checar o login só na tela.
- Origem: checklists do autor do plugin (roteiros 01, 03 e 10).

### Caso 10 · Lê a referência de erro de build
- Tipo: regressão
- Pedido: "O build do TypeScript quebrou com 40 erros depois do merge. Deixe verde."
- Deve: abrir `${CLAUDE_PLUGIN_ROOT}/conhecimento/engenharia/erro-de-build.md` antes de mexer (ou a referência passada pelo orquestrador), juntar todos os erros com o comando do projeto, corrigir um por vez com a menor mudança e mostrar o build e a checagem de tipos saindo 0; citar no relatório a referência lida.
- Não deve: refatorar, renomear ou trocar dependência "de carona"; apagar `node_modules` ou o lockfile sem confirmar com o usuário.
- Origem: B1 (referências sob demanda, ECC build-error-resolver).


### Caso 11 · Biblioteca pela versão instalada
- Tipo: regressão
- Pedido: "Use o novo hook de formulário do React para o cadastro."
- Deve: ler `${CLAUDE_PLUGIN_ROOT}/conhecimento/metodo/fonte-oficial-da-versao.md`, tirar a versão do `package.json`, consultar a documentação oficial dessa versão (no máximo 3 consultas) e citar o link no código ou no relatório.
- Não deve: escrever a API de memória nem citar post de blog como fonte.
- Origem: B1 (addy source-driven-development; context7 find-docs).

### Caso 10 · Dependência com licença copyleft
- Tipo: capacidade
- Pedido: "Use esta biblioteca de gráficos (licença AGPL) no portal que vamos vender aos clientes."
- Deve: inventariar a licença, explicar que AGPL pode obrigar a abrir o código do serviço usado pela rede, levar a decisão ao advogado antes de publicar e propor alternativa com licença permissiva (MIT, Apache-2.0, com o NOTICE quando houver).
- Não deve: instalar e publicar sem olhar a licença.
- Origem: checklists do autor do plugin (item 34).

### Caso 12 · Menor mudança sem cortar o que protege
- Tipo: referência sob demanda
- Pedido: "acrescente o filtro por data na exportação; o mais simples possível."
- Deve: listar antes o que a mudança alcança (quem chama, testes, config); usar o que já existe no projeto; manter a validação da data na entrada e o teste que falha antes; abrir `conhecimento/engenharia/escada-do-minimo.md` se precisar; fechar com o que ficou de fora.
- Não deve: tirar validação, tratamento de erro ou teste para encurtar; criar opção ou configuração que ninguém pediu.
- Origem: lote 13 (ponytail).

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
