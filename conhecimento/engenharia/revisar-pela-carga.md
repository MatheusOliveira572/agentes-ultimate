<!-- Adaptado de DietrichGebert/ponytail/skills/ponytail-review/SKILL.md @96608e0, © 2026 DietrichGebert, MIT. Alterações: tradução; só o que falta em conhecimento/metodo/revisar-codigo.md (julgar pela carga esperada, caso concreto, atalho marcado, achado em 4 partes); alterado por agentes-ultimate. Licença em terceiros/dietrichgebert-ponytail/. -->
<!-- ref: tema=revisar-pela-carga; palavras=carga esperada, aguenta a carga, revisao pela carga, escala da mudanca, muitos usuarios ao mesmo tempo; agentes=revisor, engenheiro-software -->
<!-- teste-ref: sim=revise se a mudança aguenta a carga esperada de muitos usuários ao mesmo tempo | revisão pela carga: isso escala?; nao=resuma a ata da reunião de condomínio -->
# Revisar pela carga esperada

Complementa `../metodo/revisar-codigo.md` (5 eixos) e `../metodo/revisar-mudanca.md` (só a mudança).

1. **Ache a carga esperada no projeto** (README, configuração de implantação): uma pessoa rodando um script, ou muitos usuários e
   processos ao mesmo tempo. Julgue a escala contra ela e **diga qual carga assumiu**.
2. **Leia além do diff:** quem chama cada função alterada, o que ela chama, os testes. Mudou assinatura, retorno ou comportamento:
   procure todo chamador.
3. **Escala** (certo para um, errado para muitos): checar e depois gravar sem trava (corrida), o mesmo trabalho feito por todo
   processo, memória ou lista que só cresce, uma consulta por item, O(n²) em entrada grande, estado por processo que devia ser
   compartilhado.
4. **Cada achado com um caso concreto:** "esta entrada ou situação dá este resultado errado". Sem caso, sem achado. Releia as linhas
   e confirme que o chamador existe, que o valor pode mesmo ser vazio, que o código está mesmo sem uso.
5. **Atalho marcado** com `shortcut:` ou `atalho:` que diz o limite é decisão, não achado, salvo se a carga esperada já passa dele.
6. **Correção:** a menor que funciona, de preferência a que apaga código. Nada de camada ou configuração que o problema não pede.
   Sem gosto pessoal, sem "considere".
7. **Achado em 4 partes**, cada uma em 1 ou 2 frases simples: o que é · o problema · a correção · o que acontece se não corrigir.
   Numere os achados em todos os grupos, para o usuário dizer "corrija o 2 e o 5".
8. **Fecho:** veredito em uma linha, linhas que dá para tirar (quando houver), e "Não conferido" quando algo importava e não deu para
   ver. Nada achado: diga o que conferiu.

A gravidade e a linha fixa do `revisor` continuam as do agente; este arquivo só muda **como** procurar e escrever.
