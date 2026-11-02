<!-- Adaptado de jakubkrehel/skills/skills/variant/SKILL.md e skills/state-machine/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT; e de emilkowalski/skills/skills/prototype/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: tradução, junção, corte; o seletor ficou em modelos/seletor-variantes/; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/ e terceiros/emilkowalski-skills/. -->
<!-- ref: tema=variantes; palavras=variantes, opcoes de layout, tres opcoes, alternativas de design, prototipo, prototipos, comparar versoes, estados do componente, seletor de variantes, me mostre opcoes; agentes=designer-paineis, designer-documentos, testador-qa, designer-sites -->
<!-- teste-ref: sim=me mostre três opções de layout para o cartão, lado a lado com seletor | quero protótipos de variantes do componente e todos os estados dele; nao=faça o recibo de aluguel -->
# Variantes e estados: respostas diferentes, não tons diferentes

## Variantes de um pedaço
1. **Um pedaço só** (um cartão, um cabeçalho, um fluxo), na página real.
2. **Conheça o chão:** sistema de estilos, biblioteca de componentes e de movimento, tokens (cor, espaço, raio, tipo,
   curva), densidade e voz do produto (ferramenta densa limita até onde a variante mais ousada vai), onde o pedaço aparece
   (fundo, vizinhos, larguras).
3. **Nomeie o eixo antes do código:** cada variante responde diferente num eixo. | Estrutura (agrupamento, ordem,
   colunas) | Densidade (escala de espaço) | Ênfase (onde vai a cor cheia) | Tipo (degraus, peso, medida) | Voz (rótulos,
   tom, quanto texto) |. Três variantes no mesmo eixo = três tons; isso não é opção.
4. **Construa na página real**, atrás de um seletor que troca pela URL (`?variante=a|b|c`), sem mexer no componente
   original (modelo em `<plugin>/modelos/seletor-variantes/`).
5. **Mostre as trocas e pare:** o que cada uma ganha e perde. **Não escolha pelo usuário.** Depois da escolha, apague as
   outras e o seletor (a busca pelo nome do seletor não acha mais nada).

## O piso que toda variante cumpre
Nome acessível e foco visível em todo controle; teclado alcança tudo; movimento respeita `prefers-reduced-motion`; nada
cortado, sobreposto ou inalcançável em 320 px ou zoom de 200%; contraste exigido no texto do corpo e dos controles;
nada só em cor nem só em movimento; ação destrutiva com confirmação, desfazer ou tratamento distinto; truncado tem
caminho até o valor; nada escondido sem pista visível; todo erro diz como sair; cor semântica nunca contra o sentido
(vermelho de perigo em ação que não destrói).

## Estados de um componente
Liste cada estado que ele pode ter (padrão, hover, foco, ativo, desabilitado, carregando, vazio, erro, sucesso, sem
permissão, conteúdo longo) e mostre todos **com dado fictício**, trocando por um seletor de estado
(`?estado=carregando`), sem alterar o componente. O testador usa a mesma página para conferir cada estado.

## Protótipo com 3–5 versões (Emil)
Para direções bem diferentes de uma tela: 3 a 5 versões atrás de um seletor, cada uma completa o bastante para julgar;
o usuário escolhe; o resto sai do projeto.
