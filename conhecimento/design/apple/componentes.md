<!-- Texto próprio do agentes-ultimate, a partir da HIG pública da Apple (páginas buttons, toggles, pickers, menus, tab-bars, sidebars, lists-and-tables, searching, settings, abertas em 2026-11-01). Nada copiado; cada regra cita a página. -->
<!-- ref: tema=apple-componentes; palavras=barra de abas, tab bar, barra lateral, sidebar, botao principal, botao destrutivo, alternador, toggle, switch, seletor, picker, menu de contexto, lista e tabela, campo de busca, tela de ajustes; agentes=designer-interface, designer-paineis, engenheiro-software -->
<!-- teste-ref: sim=revise a tab bar, a barra lateral e os botões do app ios | o switch e o picker da tela de ajustes estão fora do padrão da apple; nao=prepare o dossiê do processo trabalhista -->
# Lente 2: convenções da plataforma (componentes)

## Navegação (HIG › Tab bars; Sidebars)
- **Abas navegam, não agem.** Poucas abas (o necessário para a hierarquia); sem aba "mais" por falta de espaço; a barra
  fica visível ao trocar de seção; **nunca desabilite nem esconda** uma aba (mostre o motivo dentro dela); rótulo em
  cada aba; SF Symbols; selo (oval vermelho) só para informação crítica; sobre conteúdo colorido, abas monocromáticas.
- No iPad, a barra de abas pode virar barra lateral. **Barra lateral:** comece pela barra de abas; no máximo 2 níveis;
  pode ser escondida; nada crítico no rodapé dela (a janela pode estar com a base fora da tela); cor dos ícones com
  função clara.
- Ações da tela atual ficam na **barra de ferramentas**; Concluir/Enviar com o estilo de destaque; o excedente num menu
  "Mais". **Folhas:** uma por vez, alça quando redimensiona, deslizar para fechar, uma saída além de Concluir.
- Conteúdo dentro das áreas seguras; controles importantes no meio da tela ou abaixo (alcance de uma mão); voltar por
  deslizar e ações por deslizar nas linhas funcionam.

## Botões (HIG › Buttons)
- Espaço em volta para se distinguir do entorno; **estado de pressionado** em todo botão próprio.
- Estilo de destaque para a ação mais provável; **diferencie a preferida pelo estilo, não pelo tamanho**.
- Rótulo de botão sem cor parecida com o fundo colorido do conteúdo.
- Cada botão diz o que faz (símbolo, texto curto ou ambos); texto quando é mais claro que o ícone.
- **Ação destrutiva nunca com o papel de principal**, mesmo sendo a mais provável.

## Alternadores e seletores (HIG › Toggles; Pickers)
- Alternador para dois valores opostos de um estado; diferença entre os estados óbvia; **switch só em linha de lista**
  (a linha dá o contexto); switch para o ajuste que importa, caixa de seleção para o detalhe.
- Seletor para lista média a longa (curta: menu); valores previsíveis e em ordem lógica; **no contexto**, perto do
  campo, sem trocar de tela; minutos com menos granularidade quando serve; versão compacta onde falta espaço.

## Menus (HIG › Menus)
Item mais usado primeiro; itens relacionados agrupados (mesmo de importância diferente); ícone com parcimônia e propósito;
submenu raro, raso e curto; submenu continua abrindo mesmo com itens indisponíveis; submenu em vez de recuo.

## Listas, tabelas e busca (HIG › Lists and tables; Searching)
Texto em lista/tabela para varrer fácil; texto curto na linha; plano para não cortar quando a largura varia; cabeçalho de
coluna com substantivo curto, sem pontuação final; botão de informação só para revelar mais da linha. Busca com o
**escopo atual visível** (placeholder descritivo, título); busca que importa em lugar principal (aba de busca ou campo
embaixo).

## Ajustes (HIG › Settings)
Poucos ajustes; não peça em ajustes o que dá para descobrir sozinho; ajustes do app no lugar do sistema (no Mac, no menu
do app), não na barra de ferramentas.

## Desktop (Mac)
Todo comando no menu de barra (inclusive os da barra de ferramentas), atalhos padrão respeitados; janela redimensiona
com fluidez; nada crítico na barra de baixo; todo interativo com retorno ao ponteiro e estado de hover.
