<!-- Adaptado de addyosmani/agent-skills/skills/frontend-ui-engineering/SKILL.md @301b02b, © 2025 Addy Osmani, MIT. Alterações: tradução, corte; a marca e o design do projeto vencem; alterado por agentes-ultimate. Licença em terceiros/addyosmani-agent-skills/. -->
<!-- ref: tema=interface-web; palavras=frontend, front-end, componente, componentes, tela do app, pagina web, interface web, design system, estado da tela, responsivo, site, app; agentes=engenheiro-software -->
<!-- teste-ref: sim=construa o componente de lista de pedidos no frontend, responsivo e acessível | implemente a página web do cadastro seguindo o design system; nao=apure o ICMS da nota fiscal -->
# Construir interface web com qualidade de produção

O desenho vem do designer (spec + gabarito); aqui é como o engenheiro constrói. Comparar o construído com o desenho
elemento a elemento: `design/construir-do-desenho.md` (pasta conhecimento).

## Componentes
- Tudo do componente junto (componente, estilo, teste, história/exemplo).
- **Composição antes de configuração:** filhos e encaixes em vez de dezenas de props booleanas.
- Focado: mais de ~200 linhas, divida. Busca de dados separada da apresentação.
- **Estado, o mais simples que serve:** local → elevado ao pai comum → contexto → biblioteca de estado. Passar prop por
  mais de 3 níveis que não a usam pede contexto ou reorganização.

## Fidelidade ao sistema de design
- Espaçamento só da escala do projeto (nada de valor inventado); hierarquia de títulos sem pular nível; cor por token
  semântico (`texto-primario`, `fundo-superficie`), nunca hex solto; contraste 4,5:1 (texto normal) e 3:1 (texto grande);
  cor nunca é o único sinal (ícone, texto ou padrão junto).
- **Referência como prova, não como molde:** estude 2–3 telas relevantes (hierarquia, densidade, navegação, controles,
  estados), escreva o contrato curto (função da tela, ação principal, estados, regras de largura, o que rejeitar) e
  reconstrua com os componentes, tokens e conteúdo do produto. Nunca copie marca, texto, imagem ou layout exato de outro.

## Evitar a "cara de IA"
| Padrão de IA | Problema | Qualidade de produção |
|---|---|---|
| roxo/anil em tudo | todo app fica igual | a paleta do projeto |
| gradiente demais | ruído, briga com o sistema | chapado ou gradiente sutil do sistema |
| tudo muito arredondado | ignora a hierarquia de raios | raio do sistema, consistente |
| herói genérico | sem relação com o conteúdo | layout a partir do conteúdo |
| texto de enchimento | esconde quebra e estouro | conteúdo realista (e o pior caso) |
| espaço interno enorme em tudo | mata a hierarquia | escala de espaçamento |
| grade de cartões iguais | ignora a prioridade da informação | layout pelo propósito |
| sombra pesada | compete com o conteúdo, pesa no aparelho fraco | sombra sutil ou nenhuma |

## Acessibilidade (WCAG 2.2 AA)
Tudo operável pelo teclado, com foco visível e ordem lógica; nome acessível em todo controle (rótulo, `aria-label` só
quando não há texto); foco administrado em diálogo (entra, fica preso, volta ao gatilho); estados vazio e de erro que
dizem o que fazer.

## Responsivo
Celular primeiro; conferir em 320, 768, 1024 e 1440 px. Estados de carregamento sem salto de layout (esqueleto com o tamanho
final); transição curta e só de `transform`/`opacity`.

## Pronto quando
Sem erro no console; tudo pelo Tab; leitor de tela entende estrutura e conteúdo; funciona nas 4 larguras; estados de
carregando, vazio, erro, sucesso e sem permissão tratados; segue espaçamento, cor e tipografia do projeto; 0 aviso do
axe; o designer revisou a prévia.
