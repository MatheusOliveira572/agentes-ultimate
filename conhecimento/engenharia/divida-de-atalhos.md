<!-- Adaptado de DietrichGebert/ponytail/skills/ponytail-debt/SKILL.md @96608e0, © 2026 DietrichGebert, MIT. Alterações: tradução; marcador em português (atalho:) e mais prefixos de comentário (--, ;, <!--, ', REM); alterado por agentes-ultimate. Licença em terceiros/dietrichgebert-ponytail/. -->
<!-- ref: tema=divida-de-atalhos; palavras=divida de atalhos, atalhos marcados, listar os atalhos, shortcut no codigo, divida tecnica marcada; agentes=engenheiro-software, revisor -->
<!-- teste-ref: sim=liste a dívida de atalhos marcados no código | quais atalhos marcados com shortcut ficaram para depois?; nao=calcule o frete do pedido -->
# Dívida de atalhos

Todo atalho consciente leva `shortcut: <o limite>, <quando evoluir>` (ou `atalho:`; código antigo pode dizer `ponytail:`). Esta lista
junta todos num livro só, para que o adiamento não vire permanente sem ninguém ver. **Só lê e relata.**

## Procurar
Fora do `.git` e do que o `.gitignore` ignora:

    git grep --no-index --exclude-standard -nE "(#|//|/[*]|--|;|<!--|'|REM) ?(shortcut|atalho|ponytail):"

O prefixo de comentário deixa de fora o texto que só cita a convenção. Pule o que não é adiamento (um atalho de teclado, por exemplo).
Se o usuário der outra palavra (`TODO`), procure por ela.

## Saída
Uma linha por marcador, agrupada por arquivo:

    <arquivo>:<linha>, <o que foi simplificado>. limite: <o limite>. evoluir: <o gatilho>.

Marcador sem gatilho de evolução ganha a etiqueta `sem-gatilho`: é o que apodrece calado. Dono por linha, se pedirem:
`git blame -L<linha>,<linha>`. Termine com `<N> marcadores, <M> sem gatilho.` Nada achado: `Sem dívida de atalhos.`
Para guardar, só a pedido, num arquivo (`DIVIDA-ATALHOS.md`).
