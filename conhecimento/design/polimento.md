<!-- Adaptado de pbakaus/impeccable/skill/reference/polish.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução, corte dos comandos da ferramenta do impeccable, ajuste ao protocolo; alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md). -->
<!-- ref: tema=polimento; palavras=polimento, polir, passe final, refinar, refinamento, acabamento final, antes de entregar a tela, detalhes finais; agentes=designer-paineis, designer-documentos, designer-sites -->
<!-- teste-ref: sim=faça o passe final de polimento da tela antes de entregar ao usuário | polir os detalhes finais do relatório sem redesenhar; nao=simule o fluxo de caixa com juros compostos -->
# Polimento: o passe final, sem redesenho escondido

Polir é refinar. Preserve o mundo visual atual, o conteúdo, o comportamento e tudo o que está fora do escopo. Se o conceito
está errado, diga e recomende redesenho em vez de redesenhar calado. Resultado de detector é prova de defeito, não de
qualidade: veja a experiência renderizada e o caminho real de uso.

## 1. O sistema
Leia a especificação de design, os tokens, os componentes compartilhados e os fluxos vizinhos (sem sistema formal: as
convenções coerentes do projeto). Classifique cada desvio antes de corrigir: **token faltando** (o sistema precisa de um
valor reutilizável); **implementação avulsa** (um componente que já existe deveria substituí-la); **desencontro de
conceito** (fluxo ou hierarquia diferente das áreas comparáveis); **defeito local** (só incompleto). Corrija a causa no
nível mais estreito correto. Princípio do sistema que não dá para inferir: pergunte.

## 2. A prova
Use a funcionalidade nos tamanhos representativos (computador e celular; no nativo, as classes de aparelho no simulador).
Saiba: o caminho está completo? qual a régua de qualidade e o tempo? o que está inacabado de propósito? quais estados,
tamanhos de conteúdo, papéis e formas de entrada o usuário encontra? Crítica anterior é uma entrada, não a lista toda.

## 3. Ordem
1. tarefa quebrada ou bloqueada, perda de dado, estado enganoso, caminho inacessível;
2. estados faltando: carregando, vazio, erro, sucesso, desabilitado, sem permissão;
3. fluxo, hierarquia, responsivo, desvio do sistema;
4. inconsistência visual e de movimento;
5. limpeza de código e arquivos.
Não aperfeiçoe um canto deixando o resto abaixo da mesma régua.

## 4. O caminho inteiro
- **Fluxo:** mesmos modelos mentais, termos, revelação, rotas e jeito de salvar das áreas vizinhas; a tarefa principal e
  o estado atual óbvios sem achatar tudo no mesmo peso; chegada, transição, vazio e recuperação ligados.
- **Layout e tipo:** grade e escala do projeto; alinhamento óptico além do matemático; tipografia do mesmo papel igual;
  testar medida, quebra, tradução, zoom e carga de fonte em todas as larguras suportadas.
- **Cor, imagem, ícone:** tokens semânticos e significados estáveis nos temas; contraste de texto, controle e foco em todo
  estado; uma família de ícones com o mesmo traço e alinhamento óptico; imagem sem salto de layout, com proporção certa e
  texto alternativo útil.
- **Interação e estado:** todo controle com padrão, hover, foco, ativo, desabilitado, carregando, erro e sucesso; foco
  visível, ordem de Tab lógica, rótulos, alvos de toque da plataforma; movimento coerente, interrompível e leve (não anime
  só para o polimento aparecer); conteúdo longo, ausente, traduzido, sem rede, lento e com permissão limitada.
- **Texto e código:** termos, caixa, pontuação e fatos consistentes (pergunte antes de mudar uma afirmação); tire saída de
  depuração, código morto, imports e estilos sem uso e duplicação criada no polimento; componente compartilhado no lugar
  do avulso; token só para valor reutilizável de verdade.

## 5. Conferir e fechar
Percorra o caminho de novo com mouse, teclado e toque: larguras do celular ao largo (no nativo, telefone e tablet nas
orientações suportadas); estados carregando/vazio/erro/sucesso/desabilitado/conteúdo longo/ausente; zoom, contraste, foco,
semântica e nomes no leitor de tela; console sem erro, sem salto de layout, latência de interação; concordância com a
especificação, as áreas vizinhas e o escopo. **Passadas limitadas:** uma inspeção, um lote de correções e no máximo uma
confirmação. Feche com o diff: tire mudança acidental, código órfão e arquivos temporários.
