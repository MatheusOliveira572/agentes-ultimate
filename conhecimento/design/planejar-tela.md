<!-- Adaptado de pbakaus/impeccable/skill/reference/shape.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução, condensação, entrevista no nosso formato (uma pergunta por vez com palpite); alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md). -->
<!-- ref: tema=planejar-tela; palavras=planejar a tela, briefing de design, brief da tela, especificar a tela, antes de desenhar, ux antes do codigo, descoberta, entrevista de design; agentes=designer-paineis, designer-documentos, gerente-produto -->
<!-- teste-ref: sim=antes de desenhar, faça o briefing de design da tela nova | quero planejar a ux da tela antes do código, com as perguntas de descoberta; nao=reveja a conciliação de cartões -->
# Planejar a tela antes do código (o "brief")

## Fase 1: entrevista de descoberta
Uma pergunta por vez, sempre com um palpite ("acho que é X; confere?"), em duas rodadas:
- **Rodada 1 · propósito, pessoas e resultado:** quem chega, em que contexto, com que necessidade; o modo (Persuadir,
  Operar, Ler, Experiência); a ação principal; como se sabe que deu certo.
- **Rodada 2 · material, comportamento e limites:** o conteúdo e os dados reais (com as faixas: vazio, um, muitos,
  longo); o que já existe e precisa ser preservado; o que não pode mudar; plataforma e entrega.
Pare de perguntar quando o resto dá para supor com segurança; escreva as suposições.

## Fase 2: a direção
A autoridade visual (marca, sistema existente, referência dada), a tese de estrutura e interação, a sequência, o
momento focal, e a consequência para a construção. Opções, só se o usuário pediu (`variantes.md`).

## Fase 3: o brief (7 partes)
1. **Função e público:** quem chega, contexto, necessidade, modo.
2. **Resultado e prova:** tarefa ou ação principal, o que é sucesso, a prova real, a verdade do produto.
3. **Direção escolhida:** autoridade visual, tese de estrutura e interação, sequência, momento focal, consequência.
4. **Escopo e limites:** fidelidade, abrangência, interatividade, alvo nomeado, o que fica intocado, antimetas
   explícitas ("não vamos fazer").
5. **Estados e faixas:** faixas realistas de conteúdo e dado; estados do material.
6. **Interação e layout:** hierarquia, topologia, responsivo, o que é clicável, retorno e transições (a intenção, não o CSS).
7. **Restrições e decisões em aberto:** plataforma, entrega, acessibilidade, tradução, componentes reutilizáveis e o que
   quem constrói **não pode inventar**.

## Confirmar e parar
Mostre o brief, peça a confirmação e pare. Só então construir (`metodo.md`, etapa 3).
