<!-- Adaptado de pbakaus/impeccable/skill/SKILL.src.md @e89e3ad, © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução, corte dos comandos e do carregador do impeccable, o método virou 5 etapas ligadas aos nossos arquivos; alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md). -->
<!-- ref: tema=metodo-de-design; palavras=redesenhe, redesenho, redesenhar, redesign, visual premium, app premium, site institucional, site bonito, bonito, tela nova, pagina nova, landing page, novo visual, app, aplicativo; agentes=designer-paineis, designer-documentos, designer-sites -->
<!-- teste-ref: sim=redesenhe meu app com visual premium | crie um site institucional bonito para a empresa; nao=faça o controle de ponto dos funcionários -->
# Método de design: entender → direção → construir → auditar → polir

## Princípios (valem em todas as etapas)
- **O pedido manda.** Estética, época, material, fonte e paleta pedidos são honrados mesmo contra um alerta de padrão
  saturado; trocar o pedido pelo seu gosto é falha. A marca e as decisões do projeto vêm antes de tudo.
- **Refinar preserva; redesenhar substitui.** Refinar mantém identidade, comportamento, texto e tudo fora do escopo
  (pergunte antes de trocar texto factual ou acrescentar afirmação). Redesenhar mantém o conteúdo e a função e troca o
  mundo visual, e só com o pedido.
- **Símbolo carregado não vira enfeite** (emblemas ligados a militarismo, supremacia ou ódio, mesmo "do mundo do tema").
- **Autoridade visual é prova, não nome de arquivo:** a falta de uma especificação de design não torna o projeto "do zero".
- **Desvio da memória ou da especificação se relata, não se corrige de carona.**

## Modo da superfície
- **Persuadir:** o visitante decide e age; o desenho é o produto (landing page, marketing, campanha, preço) →
  `modos/persuadir.md`.
- **Operar:** o usuário cumpre uma tarefa (app, painel, editor, administração, ajustes): leitura rápida, consistência,
  expectativa nativa e a cena real de uso vencem a expressão; a marca vive nos detalhes → `modos/operar.md`.
- **Ler:** o visitante quer entender (documentação, artigo, guia, ajuda, changelog) → `modos/ler.md`.
- **Experiência:** o visitante está dentro da obra (portfólio, galeria): o artefato lidera, a interface recua.

## As 5 etapas (e o que abrir em cada uma; no máximo 3 arquivos por vez)
1. **Entender:** o produto, o público, a cena de uso, o que já existe e o que o pedido fixa. Sem isso, pergunte (uma
   pergunta com palpite). → `planejar-tela.md` (perguntas de UX antes do código).
2. **Direção:** o modo; o mundo visual (preservar, expandir ou substituir o atual); 2–3 direções quando o usuário pede
   opções (`variantes.md`), nunca escolher por ele. Tela ou página nova: `tela-nova/INDICE.md`. Plataforma Apple: as regras
   de `apple/INDICE.md`.
3. **Construir:** leia `piso-de-qualidade.md` **logo antes de editar**, mesmo num refinamento pequeno. Engenharia:
   `../engenharia/interface-web.md`; do gabarito para o código: `construir-do-desenho.md`; movimento: `movimento/INDICE.md`;
   componentes prontos (21st, se ligado): `componentes.md`.
4. **Auditar:** `critica/INDICE.md` (pontuação), `acessibilidade/INDICE.md`, `pior-caso.md` (texto longo, vazio, erro),
   `revisao-tela.md` (formato do revisor). Passadas limitadas: 1 inspeção, 1 lote de correções, no máximo 1 confirmação.
5. **Polir:** `polimento.md` (o caminho inteiro, todos os estados) e `detalhes-interface.md` (raio, sombra, ícone).

Antes de publicar um app ou site: a skill `/checklist-lancamento`.
