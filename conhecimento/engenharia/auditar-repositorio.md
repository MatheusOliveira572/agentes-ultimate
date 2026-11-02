<!-- Adaptado de DietrichGebert/ponytail/skills/ponytail-audit/SKILL.md @96608e0, © 2026 DietrichGebert, MIT. Alterações: tradução e adaptação; segurança profunda vai ao auditor-seguranca; alterado por agentes-ultimate. Licença em terceiros/dietrichgebert-ponytail/. -->
<!-- ref: tema=auditar-repositorio; palavras=auditar o repositorio, auditoria de qualidade, repositorio inteiro, o que da para apagar, codigo inchado; agentes=revisor, engenheiro-software -->
<!-- teste-ref: sim=faça uma auditoria de qualidade do repositório inteiro | o que dá para apagar neste código inchado?; nao=planeje o cardápio da semana -->
# Auditar o repositório inteiro (qualidade)

Relatório de uma vez; **não muda código**. Segurança a fundo vai ao `auditor-seguranca` (ou à skill `/auditoria-completa`).

## 1. Mapear antes
- Audite o que o usuário nomear (pasta, pacote); sem nada, o repositório inteiro.
- Leia o README, a configuração de build e implantação, as dependências, os pontos de entrada (main, rotas, handlers, jobs, comandos)
  e os testes.
- Ache a carga esperada e diga qual assumiu (`revisar-pela-carga.md`).
- Siga os fluxos principais de ponta a ponta: onde o dado entra, o que fica guardado, o que sai. Leia inteiros os caminhos de entrada
  de usuário, dinheiro, login, gravação de dados, jobs e o que é compartilhado entre processos.
- Repositório grande: vá fundo onde o erro custa mais, não arquivo por arquivo. **Diga o que não leu.**

## 2. Procurar, nesta ordem
1. **Defeito:** resultado errado, queda, borda esquecida (vazio, zero, último item, arredondamento, fuso), quem chama discordando do
   que a função devolve, a mesma regra aplicada de jeitos diferentes em 2 lugares.
2. **Risco:** falha de segurança (injeção, aleatório fraco, segredo no código, entrada sem checagem), perda de dados (erro engolido,
   gravação na ordem errada, sem transação).
3. **Escala:** ver `revisar-pela-carga.md`, item 3.
4. **Teste faltando:** lógica de risco (ramo, parser, dinheiro, segurança, gravação) sem um teste que falhe quando ela quebra. Um bom
   teste, não cobertura.
5. **Velocidade:** lentidão grande é problema; ganho pequeno é sugestão.
6. **Enxugar:** apagar (código morto, opção, flag e configuração sem uso), reaproveitar (2 helpers que fazem o mesmo: fique com um e
   diga o caminho), biblioteca padrão, YAGNI (interface com uma implementação, wrapper que só repassa), juntar quase-cópias, separar
   função que faz trabalhos sem relação (por trabalho, nunca por número de linhas).

## 3. Conferir antes de relatar
Caso concreto em cada achado; antes de chamar algo de "sem uso", procure na árvore inteira, inclusive testes, fixtures, configuração e
referência por texto ou dinâmica. Atalho marcado (`shortcut:` ou `atalho:`) que diz o limite é decisão, salvo se a carga já passou.

## 4. Saída
"O que este repositório faz" em 2 ou 3 frases e a carga assumida; achados em 3 grupos (Corrigir já · Corrigir · Seria bom),
**no máximo 20**, numerados, cada um nas 4 partes de `revisar-pela-carga.md`; se deixou de fora os menores, diga quantos. Termine com o
veredito, as linhas e dependências que dá para tirar, e "Não conferido": as partes que não leu ou não pôde rodar.
