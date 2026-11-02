<!-- Adaptado de jakubkrehel/skills/skills/better-writing/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT. Alterações: tradução com exemplos em português, corte; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/. -->
<!-- ref: tema=texto-de-interface; palavras=texto de interface, microcopy, rotulo, rotulos, texto do botao, mensagem de erro, mensagem de confirmacao, estado vazio, tom de voz, ux writing, resposta padrao, artigo de ajuda; agentes=redator, designer-interface, designer-paineis, especialista-cs, comunicador-corporativo -->
<!-- teste-ref: sim=revise os rótulos, as mensagens de erro e a confirmação de exclusão do app | escreva o microcopy do estado vazio e do botão de salvar; nao=calcule a depreciação acelerada da frota -->
# Texto de interface: rótulos, erros, vazios e confirmações

A voz que o produto já tem manda. Voz de marca deliberada não é defeito; só aponte desvio da linguagem simples quando
cria inconsistência, ambiguidade, risco de tradução ou um tom que o risco não aguenta. Reescrever só pelo gosto não é
achado. Como o texto aparece (caixa, corte, pontuação): `../design/tipografia/INDICE.md`.

## 1. Inventário antes de escrever
Ache onde o texto mora (arquivos de tradução `locales/**/*.json`, `*.po`, chamadas `t(`...), liste o **substantivo** de
cada objeto e o **verbo** de cada ação ("projeto" ou "espaço"; "Excluir" ou "Remover") e a caixa usada por tipo de
elemento. Texto novo usa esses termos; sinônimo é achado só quando a mesma coisa tem dois nomes.

## 2. Uma voz, um vocabulário
Se é "Arquivar" no menu, não é "Mover para o depósito" no aviso. Fluxo de etapas com um vocabulário: "Começar" para
entrar, "Continuar" (ou "Avançar") para seguir, "Concluir" para terminar. O **tom muda pelo risco**:
| Contexto | Tom |
|---|---|
| sucesso, introdução, vazio | caloroso, pode ser leve |
| ação de rotina, ajustes | neutro, mínimo |
| erro, confirmação destrutiva | calmo, simples, nada de brincadeira |
| perda de dado, segurança | sério e explícito |

## 3. Regras
- **Fale com o leitor** ("você", não "o usuário"); no erro, "nós" soa como desculpa: "Não foi possível carregar. Confira a
  conexão e tente de novo." Possessivo com parcimônia; nunca misture "Minha conta" com "Seus ajustes".
- **Palavra simples:** a que um leitor cansado entende de primeira; sem expressão idiomática, gíria ou piada que não
  traduz; sem gênero desnecessário; o verbo do aparelho ("toque" no celular, "clique" com mouse, "selecione" se os dois).
- **Frase inteira com marcador de lugar**, nunca montada por pedaços em volta de uma variável (a ordem muda por idioma);
  plural pelas regras do idioma.
- **Botão começa com verbo** que diz a ação: "Enviar", "Salvar rascunho", "Excluir projeto"; nunca "OK!". Botão só com
  ícone tem nome acessível com a ação ("Excluir projeto", não "ícone de lixeira").
- **Link diz o destino** fora de contexto: "Ver a documentação de cobrança", nunca "clique aqui"; dois "Saiba mais" na
  mesma tela ganham complemento ("Saiba mais sobre exportação").
- **Uma política de caixa** por tipo de elemento (frase por padrão).
- **Ajuste descreve o estado LIGADO:** "Enviar confirmação de leitura" (não "Não enviar..."). Link direto para o ajuste
  citado, em vez de descrever o caminho.
- **Erro diz como resolver, ao lado de onde quebrou:** "Escolha uma senha com pelo menos 8 caracteres" (não "Senha muito
  curta"); "Informe a data como DD/MM/AAAA" (não "Data inválida"); "Não foi possível salvar. Confira a conexão e tente
  de novo." (não "Ops! Algo deu errado."). Sem culpa, sem "ops", sem exclamação; dica em forma positiva; requisito
  conhecido aparece antes, como texto de ajuda.
- **Desfazer vence confirmação** quando a ação volta e é frequente (arquivar, mover, mandar para a lixeira): faça e ofereça
  "Projeto arquivado. Desfazer". **Confirme antes** quando não volta, afeta outras pessoas ou destrói muitos itens: o
  título nomeia a ação e o objeto ("Excluir 'Relatório T3'?", nunca "Tem certeza?"); o corpo diz o que se perde, com
  contagem; botões com verbo + objeto ("Excluir projeto" e "Cancelar", nunca "Sim"/"Não"); para conta, espaço ou
  repositório, peça para digitar o nome.
- **Vazio aponta para frente:** diz o que é o lugar e como preenchê-lo, com uma ação clara; vazio filtrado nomeia a busca
  e dá a saída ("Nada para 'trimestral'. Limpar filtros"). Informação permanente nunca mora no vazio.
- **Placeholder mostra um exemplo**, nunca substitui o rótulo.

## Tom pelo risco (comunicador-corporativo, especialista-cs)
Mensagem de erro, perda ou risco: diga o que aconteceu, o efeito para a pessoa, o que fazer agora e o que vocês estão
fazendo; sem jargão, sem minimizar, sem exclamação. Resposta-padrão de atendimento: o problema nas palavras do cliente, o
passo que resolve, o prazo, e o caminho se não resolver.
