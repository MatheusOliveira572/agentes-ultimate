<!-- Adaptado de DietrichGebert/ponytail/skills/ponytail/SKILL.md e AGENTS.md @96608e0, © 2026 DietrichGebert, MIT. Alterações: tradução e adaptação; sem modo persistente nem ganchos; teste e verificação seguem o protocolo (a regra "mudança trivial não precisa de teste" saiu); exemplos reescritos; alterado por agentes-ultimate. Licença em terceiros/dietrichgebert-ponytail/. -->
<!-- ref: tema=escada-do-minimo; palavras=escada do minimo, menor mudanca completa, codigo minimo, yagni, superengenharia, mudanca enxuta, nunca cortar; agentes=engenheiro-software, revisor, planejador -->
<!-- teste-ref: sim=faça a menor mudança completa, sem superengenharia | quero o código mínimo, yagni, nada a mais; nao=escreva o texto do convite da festa -->
# Escada do mínimo

**O mínimo é na solução, nunca no cuidado.** Teste, verificação e o protocolo comum continuam iguais: o teste que falha antes
é obrigatório também aqui. No benchmark do próprio autor (2026-10-07, Opus 5.5), com estas regras, os bugs injetados pegos
**onde havia teste** caíram de 77% para 69%; o ganho foi menos código e mais testes escritos, não testes melhores. Por isso
esta escada não enfraquece teste nenhum.

## Antes de escrever
Leia o pedido e o código que ele toca. **Liste tudo o que a mudança alcança:** quem chama, testes, fixtures, configuração,
exports. Veja o que ela pode quebrar para quem usa (dado apagado ou exposto, chamada que deixa de funcionar). Isso é escopo;
funcionalidade a mais não é.

## A menor mudança completa (pegue o primeiro degrau que resolve inteiro)
1. **Precisa existir?** Pule opção e flexibilidade que ninguém pediu, e diga numa linha o que pulou. Pedido vago ganha a menor
   versão que faz o essencial.
2. **Já existe no projeto** (helper, componente, serviço, padrão)? Use como o código ao redor usa.
3. **Biblioteca padrão ou recurso da plataforma?** Use, a menos que o projeto tenha o seu. Componente da casa vence o nativo.
4. **Dependência já instalada?** Use. Nunca acrescente dependência por poucas linhas.
5. **Cabe em uma linha que se lê de relance?** Uma linha. Linha que precisa ser decifrada não é curta.
6. Senão, o mínimo de código que funciona.

- Termine toda parte que o pedido exige, inclusive quem chama, testes e fixtures que a mudança quebra.
- Nada de abstração, wrapper, conversão de tipo, opção, configuração ou código "para depois" que ninguém pediu. Apagar vence
  acrescentar. Mantenha as camadas e convenções que o projeto já tem.
- Correção de defeito: antes de editar, procure todo chamador da função e corrija a causa uma vez, no código compartilhado.
- Código movido ou juntado mantém o tratamento de erro e a validação.
- Entre opções do mesmo tamanho, a que acerta nas bordas.
- Comentário só para o porquê que o código não mostra, em uma linha.
- **Atalho consciente** leva o comentário `shortcut: <o limite>, <quando evoluir>` (também `atalho:`). É decisão registrada, não
  defeito, até a carga passar do limite. A lista sai de `divida-de-atalhos.md`.

## Nunca cortar
Validação na fronteira de confiança · tratamento de erro que evita perda de dados · segurança · acessibilidade · a calibração
que o hardware real exige · o teste e a verificação do protocolo · tudo o que o usuário pediu.

## Intensidade (só a pedido, nunca como modo que fica ligado)
- **leve:** faça o pedido e diga numa linha a opção menor; o usuário escolhe.
- **padrão:** as regras acima.
- **contestar:** antes de construir, questione a parte que a necessidade não justifica (serve também ao `planejador`).

## Exemplos (nossos, a partir dos casos do autor)
- **Debounce numa busca:** `clearTimeout` e `setTimeout` no próprio evento, cerca de 10 linhas, já são o debounce. Função utilitária
  com opções e cancelamento só quando houver 3 ou mais campos usando.
- **Somar a coluna de um CSV (contraexemplo):** a versão de 3 linhas que "pula o tratamento de erro" quebra na primeira linha
  malformada, que é justamente a checagem oculta do benchmark do autor. Tratamento de erro que evita perda de dado está na
  lista "nunca cortar": a linha ruim é contada e relatada, e o teste cobre a linha malformada.

Fecho de toda entrega: 1 ou 2 linhas com o que ficou de fora ou não foi conferido, e o risco (é o "Pendências" do relatório).
