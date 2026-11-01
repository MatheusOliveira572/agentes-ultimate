# Segurança · dados e entradas (S-6, S-web-3, 4, 7, 9 e 10)

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia `seguranca-contexto.md`
(contexto do projeto, modo de trabalhar e "terminar com").

## Roteiro 03 · travar o banco (S-6, S-web-3)
O usuário lê e altera só os próprios dados, mesmo falando direto com o banco. Duas coisas precisam valer: toda consulta
filtra pelo usuário certo (a Ana busca o pedido 18 porque é dela, nunca o 22: trocar o número e ver o endereço de outra
pessoa é um IDOR, dos defeitos mais comuns); e o banco em si está fechado. Se o front-end fala direto com o banco
(Supabase, Firebase), as regras do banco **são** a segurança: a chave pública do front-end deixa qualquer um consultar
as tabelas, e as regras decidem o que cada um leva.
**Autoteste de 2 min:** crie duas contas de teste; como A, copie uma requisição que carrega dados de A, troque pelo ID
de algo de B e mande: 403/404. No Supabase, o editor de tabelas mostra RLS ligada em toda tabela, e o Security Advisor
não tem aviso. No Firebase, nenhuma regra `allow read, write: if true` nem regra de "modo de teste" com data.
**Painel no Power BI:** o equivalente é a RLS: confira com "ver como" em pelo menos dois papéis que cada um vê só o seu
recorte, e que ninguém fora dos papéis lê o modelo.

Papel: engenheiro sênior de segurança, especialista em banco. Garanta que cada usuário só lê e altera o que pode, e que
o banco está fechado.
- **Auditar:**
  1. Toda tabela, coleção e bucket de armazenamento: quem deve ler, criar, alterar e apagar (só o dono, o time, os
     administradores, o público).
  2. Como o app chega ao banco: só pelo servidor, ou direto do navegador (cliente do Supabase, SDK do Firebase).
  3. Se o navegador fala direto com o banco: no Supabase/Postgres, RLS **ligada** em toda tabela dos esquemas expostos,
     com políticas separadas para SELECT, INSERT, UPDATE e DELETE pelo `auth.uid()`; INSERT e UPDATE com `WITH CHECK`,
     para ninguém criar linha de outro dono nem trocar `owner_id`/`user_id`; views (passam por cima da RLS se não forem
     `security_invoker = true`) e funções `SECURITY DEFINER` (passam por cima da RLS e precisam checar permissão
     sozinhas); política nunca baseada em `user_metadata` (o usuário edita). No Firebase, regras por caminho que dependem
     de `request.auth.uid` e validam os campos gravados, sem regra de teste nem `if true`. Buckets privados por padrão,
     com política para cada um acessar só os próprios arquivos.
  4. Se o acesso é pelo servidor: toda consulta que busca, altera ou apaga por ID também confere dono ou permissão;
     liste os endereços em que o ID vem do cliente e a consulta não filtra pelo usuário atual.
  5. A chave de administrador (`service_role`) e o texto de conexão do banco só em código de servidor.
  6. Privilégios do usuário do banco (não superusuário), se o banco é alcançável da internet aberta (lista de IPs,
     nada de 0.0.0.0/0), conexões com TLS e backup automático ligado.
  7. Respostas da API nunca trazem coluna sensível (hash de senha, tokens, e-mail de outros, marcas internas): selecione
     só os campos que a tela usa.
- **Corrigir:** escreva as políticas, regras e checagens de dono que faltam, mostrando cada política inteira, com uma
  linha de explicação simples.
- **Verificar:** um teste (ou script) com dois usuários de teste que prova que A não lê, altera nem apaga as linhas e os
  arquivos de B, e que um visitante sem login, só com a chave pública, não leva nada privado.
**Feito quando:** RLS ou regras ligadas em toda tabela, coleção e bucket; A não lê, altera nem apaga o que é de B
(testado, não suposto); chave de administrador só no servidor; banco fora da internet aberta, com backup; respostas
sem hash de senha nem campo privado de outros.
**Cuidado:** RLS ligada sem política bloqueia tudo; RLS desligada libera tudo; nenhum dos dois é o que se quer. Views e
funções `SECURITY DEFINER` são o desvio clássico da RLS. Banco com acesso de rede 0.0.0.0/0 e senha fraca é vazamento
comum.

## Roteiro 06 · validar formulários no servidor (S-web-7)
Validação no front-end é experiência do usuário; no servidor, é segurança. Tudo o que o navegador confere (obrigatório,
mínimo e máximo, opções da lista) se pula mandando a requisição direto. O servidor valida cada entrada (tipo, tamanho,
faixa, formato, valores aceitos) e aceita só os campos esperados, para ninguém enfiar `role` ou `price`. Exemplos do que
dá errado: o pedido chega com quantidade -3 e o servidor cria um total negativo; a rota "atualizar perfil" grava o
corpo inteiro e o usuário acrescenta `"role": "admin"`.
**Autoteste:** nas ferramentas do desenvolvedor, copie uma requisição de formulário como fetch, cole no console, mude os
valores (negativo, texto de 100 mil caracteres, tipo errado) e mande; acrescente `"role":"admin"` ou `"credits":99999`
numa atualização de perfil: tem de ser ignorado ou recusado.

Papel: engenheiro sênior de segurança. Ponha validação estrita no servidor em toda entrada que o app aceita.
- **Auditar:** (1) todo endereço, ação, tratador de formulário, webhook e tarefa que recebe entrada de fora (corpo,
  query, parâmetros da URL, cabeçalhos, cookies, metadados de arquivo enviado), numa tabela com os campos de cada um;
  (2) se cada um valida no servidor hoje, e como; (3) atribuição em massa: onde o corpo (ou um espalhamento dele, como
  `{...req.body}` ou `**data`) vai direto para criar ou alterar no banco. Aponte campo que tem de ser decidido pelo
  servidor (`id`, `user_id`/`owner_id`, `role`, `is_admin`, `price`, `amount`, `status`, `credits`, `balance`, `plan`,
  `is_verified`, `email_verified`, `created_at`).
- **Corrigir:** **uma** biblioteca de validação que combine com a tecnologia (Zod em TypeScript, Pydantic em Python),
  validando no início de cada tratador, antes de regra de negócio ou banco; para cada campo: tipo, obrigatório ou não,
  mínimo e máximo de número, tamanho máximo de **todo** texto, valores aceitos quando der, formatos (e-mail, URL, UUID,
  data) e dinheiro em inteiro na menor unidade (centavos); campo desconhecido recusado (modo estrito) e só campos
  permitidos copiados para a gravação; campos do servidor nunca vindos do cliente; entradas normalizadas (aparar
  espaços, e-mail em minúsculas); resposta 400 padronizada, com mensagem por campo e nunca pilha; tamanho máximo do
  corpo; os mesmos esquemas no front-end quando der, mas o que vale é o do servidor.
- **Verificar:** testes que mandam quantidade negativa, texto de 100 mil caracteres, tipo errado, campo obrigatório
  faltando e `"role":"admin"` a mais: cada um é recusado ou ignorado, e nada inválido chega ao banco.
**Feito quando:** todo endereço que recebe entrada valida no servidor com esquema; todo texto tem tamanho máximo e todo
número tem faixa; campo desconhecido recusado e campo do servidor fora do alcance do cliente; entrada inválida devolve
400 limpo, nunca queda nem pilha.
**Cuidado:** tipo do TypeScript não existe em execução: `quantity: number` não faz nada contra `"quantity": "-3"`.
Validar não torna a saída segura: texto válido ainda pode ter HTML (roteiro 07).

## Roteiro 07 · contra XSS (S-web-4)
O texto do usuário aparece sempre como texto, nunca roda como código. XSS acontece quando algo que o usuário digitou
entra na página como HTML e o navegador executa: o script age como quem está vendo a página (lê dados, rouba a sessão,
age por ela). Os frameworks modernos escapam texto por padrão; o XSS entra pelas saídas de emergência. Exemplo: um
comentário com `<script>` renderizado com `innerHTML` roda para todo mundo que lê, inclusive o administrador.
**Autoteste:** em todo campo que aparece em algum lugar (nome, bio, comentário, título), digite
`<img src=x onerror=alert(1)>`: se surgir um alerta, há XSS. Em campo de site ou URL, digite `javascript:alert(1)` e
clique no link. Procure no código `dangerouslySetInnerHTML`, `innerHTML`, `v-html` e `{@html`.

Papel: engenheiro sênior de segurança. Ache e corrija todo lugar em que conteúdo controlado pelo usuário possa rodar
como código no navegador.
- **Auditar:**
  1. Saídas perigosas, cada uma com arquivo:linha e de onde vem o dado: React `dangerouslySetInnerHTML`; Vue `v-html`;
     Svelte `{@html}`; Angular `[innerHTML]` ou `bypassSecurityTrust*`; DOM `innerHTML`, `outerHTML`,
     `insertAdjacentHTML`, `document.write`, jQuery `.html()`/`.append()` com texto; modelos de servidor (`|safe`,
     `mark_safe`, autoescape desligado, `Markup()`, `<%- %>` no EJS, `{{{ }}}` no Handlebars, auxiliares `raw()`);
     execução de código (`eval`, `new Function`, `setTimeout`/`setInterval` com texto).
  2. URLs do usuário em `href`, `src`, `action` ou `window.location`: só `http:`, `https:` e `mailto:`; `javascript:` e
     `data:` bloqueados.
  3. Dado do usuário dentro de `<script>`, em tratadores de evento embutidos, em `style` ou em JSON embutido no HTML.
  4. Markdown e texto rico (aceita HTML cru?), editores ricos, upload de SVG e e-mails ou PDFs gerados com conteúdo do
     usuário.
  5. Saída de IA também é entrada não confiável: se vira HTML ou Markdown na tela, tem de ser limpa.
- **Corrigir:** prefira a renderização normal com escape (`{valor}` no JSX, `{{ }}` nos modelos); onde precisar mesmo de
  HTML, limpe com DOMPurify (navegador) ou um limpador mantido no servidor, com lista estrita de tags e atributos;
  valide o esquema da URL antes de virar link; cookies de sessão HttpOnly (roteiro 15) e uma CSP (roteiro 14) como
  segunda linha de defesa.
- **Verificar:** testes que enviam `<img src=x onerror=alert(1)>`, `"><svg onload=alert(1)>` e `javascript:alert(1)`
  por cada entrada afetada e conferem que aparecem como texto inofensivo.
**Feito quando:** nenhum `innerHTML`/`dangerouslySetInnerHTML`/`v-html` sem limpeza com dado do usuário; links do
usuário só com `http`, `https` e `mailto`; Markdown, texto rico e saída de IA limpos; os textos de teste aparecem como
texto em todo lugar.
**Cuidado:** painel de administração é alvo preferido: XSS guardado que dispara quando o administrador vê o conteúdo do
usuário entrega o app inteiro. Limpe na saída, não só na entrada: dado chega ao banco por importação, API ou versão
antiga do app.

## Roteiro 10 · consultas parametrizadas (S-web-7)
A estrutura da consulta é fixa; a entrada do usuário é sempre só dado. Injeção de SQL acontece quando a entrada é colada
no texto da consulta e muda o que ela faz (uma busca montada como `WHERE name = '${input}'` recebe `' OR '1'='1` e
devolve todos os pedidos). Consulta parametrizada manda a consulta e os valores separados. ORMs fazem isso, até alguém
usar a saída "crua".
**Autoteste:** procure no código SQL montado com template ou `+` (`SELECT ... ${`, `f"SELECT ... {`, `"... WHERE id = " +`)
e as saídas cruas dos ORMs (`$queryRawUnsafe`, `$executeRawUnsafe`, `sequelize.literal`, `knex.raw(`, `.extra(`,
`text(f"...")`); digite um `'` nas caixas de busca: erro 500 ou mensagem de SQL é sinal de alerta.

Papel: engenheiro sênior de segurança. Elimine injeção: SQL, NoSQL, texto de filtro e comando.
- **Auditar:** (1) toda consulta do código; aponte as que montam o texto com variáveis por concatenação, template,
  f-string, `.format()` ou `%`; (2) saídas cruas de ORM com entrada não confiável: Prisma `$queryRawUnsafe`,
  `$executeRawUnsafe`, `Prisma.raw` (a forma com template marcado `$queryRaw` com `${valor}` **é** parametrizada e está
  certa), Sequelize `literal()` e consultas cruas, Knex `raw()` com interpolação, TypeORM `query()` com texto,
  SQLAlchemy `text()` com f-string, Django `raw()`/`extra()`, Drizzle `sql.raw()`; (3) identificadores dinâmicos que não
  se parametrizam: coluna do ORDER BY, direção, nome de tabela ou coluna, LIMIT vindos da entrada; (4) NoSQL: JSON da
  requisição direto na consulta, permitindo operador como `{"$ne": null}` ou `{"$gt": ""}`; (5) Supabase/PostgREST:
  texto de filtro montado com a entrada (`.or(` com `${input}`) e chamadas `.rpc()` cujas funções montam SQL dinâmico com
  EXECUTE; (6) injeção de comando: `exec`, `spawn` com `shell: true`, `os.system`, `subprocess` com `shell=True`, ou
  qualquer comando de shell com a entrada do usuário.
- **Corrigir:** toda consulta apontada vira parametrizada ou construtor seguro do ORM; identificador dinâmico passa por
  uma lista fixa (`sort=price` → `"price"`), nunca o valor cru; no NoSQL, tipos validados (texto tem de ser texto) antes
  da consulta; comandos com lista de argumentos, sem shell (ou sem comando); usuário do banco só com os privilégios que
  o app precisa.
- **Verificar:** testes que mandam `' OR '1'='1`, `'; DROP TABLE users; --` e `{"$ne": null}` a cada entrada afetada:
  resposta normal "sem resultados" ou 400, nunca dado a mais nem erro do banco.
**Feito quando:** nenhuma consulta montada por concatenação com a entrada; saídas cruas com entrada parametrizadas ou
removidas; ordenação e colunas por lista fixa; os textos de injeção devolvem vazio ou 400.
**Cuidado:** no Prisma, `$queryRaw` com template é seguro e `$queryRawUnsafe` com template não é; os nomes quase não
diferem. Mensagem de erro do banco mostrada ao usuário ajuda o atacante: esconda (roteiro 20).

## Roteiro 18 · upload só do tipo e do tamanho esperados (S-web-9)
Upload é das funções mais arriscadas: o arquivo pode ser malware, script disfarçado de imagem, página HTML ou SVG que
roda código no seu domínio, arquivo gigante que come o armazenamento e a conta, ou nome que tenta gravar fora da pasta.
O servidor confere tipo, tamanho e conteúdo real, e guarda onde o arquivo não roda.
**Autoteste:** renomeie um `.html` para `.jpg` e envie; abra a URL resultante: aparece como página? Envie um arquivo
muito acima do limite. Envie um SVG com `<script>alert(1)</script>` e abra direto.

Papel: engenheiro sênior de segurança. Deixe seguro todo upload do app.
- **Auditar:** (1) todo caminho de upload: formulários, avatares, anexos, importação de CSV/Excel, arrastar e soltar,
  envio direto ao armazenamento por URL pré-assinada (S3, R2, Supabase Storage, Firebase Storage, UploadThing,
  Cloudinary) e funções de IA que aceitam arquivo; (2) para cada um: quem pode enviar (exige login?), que checagens
  existem e onde (só no navegador ou no servidor), onde o arquivo fica, como é nomeado, como é servido (domínio,
  Content-Type, Content-Disposition) e se é público.
- **Corrigir** (tudo no servidor ou nas políticas do armazenamento, nunca só no navegador):
  1. Tipo: lista permitida por função (avatar: jpeg, png, webp); confira a extensão **e** o conteúdo real pelos bytes
     iniciais (ex.: biblioteca `file-type`), sem confiar no Content-Type do cliente; bloqueie HTML, SVG, XML, JS e
     executáveis, salvo se a função precisa mesmo.
  2. Tamanho: máximo por arquivo (ex.: 5 MB para imagem) no servidor e nas condições da URL pré-assinada
     (`content-length-range`) ou nos limites do bucket; máximo de arquivos por requisição e cota por usuário.
  3. Nomes e caminhos: nomes aleatórios (UUID); nunca o nome do usuário no caminho (evita `../`); o nome original só como
     texto de exibição escapado.
  4. Armazenamento: objeto na nuvem ou pasta fora da raiz web, privado por padrão; arquivo privado servido por URL
     assinada de curta duração, depois da checagem de permissão.
  5. Entrega: Content-Type correto, `X-Content-Type-Options: nosniff` e `Content-Disposition: attachment` para o que não
     é imagem exibida; de preferência, arquivos do usuário num domínio separado.
  6. Imagens: recodifique com sharp ou Pillow (tira carga escondida e metadados EXIF, inclusive a localização) e limite
     as dimensões, contra bomba de descompressão.
  7. Compactados e documentos: limite o tamanho descompactado e o número de arquivos dos zip; em exportação CSV, prefixe
     células que começam com `=`, `+`, `-` ou `@` (contra injeção de fórmula na planilha).
  8. Arquivos compartilhados entre usuários: varredura de malware, ou diga que serviço usar.
- **Verificar:** testes que enviam um `.html` renomeado, um `.svg` com script, um arquivo grande demais e um nome com
  `../`: todos recusados ou neutralizados.
**Feito quando:** tipo conferido pelo conteúdo real; limite de tamanho no servidor ou no armazenamento; nomes aleatórios
que não saem da pasta; arquivo enviado não roda como página no domínio principal; imagens recodificadas e sem
localização.
**Cuidado:** upload pré-assinado não passa pelo seu servidor: os limites têm de estar na política pré-assinada ou nas
regras do bucket. Bucket público costuma ser listável: garanta que ninguém navega pelos arquivos de todos.

## Roteiro 19 · preços e pagamentos (S-web-10)
O navegador é território do cliente: ele edita tudo ali. O servidor calcula todo preço, desconto e total pelo próprio
banco, e só libera pedido ou plano quando o provedor confirma o pagamento por webhook com assinatura verificada, nunca
porque alguém chegou à página de "sucesso". Exemplos do que dá errado: o pedido de R$ 49 é editado para R$ 1; abrir
`/checkout/success` direto marca o pedido como pago; uma chamada falsa de webhook vira a conta para o plano pago.
**Autoteste:** edite preço, valor ou quantidade na requisição de pagamento e mande: o valor cobrado não pode mudar. Abra
a página de sucesso sem pagar: nada pode ser liberado. Tente o mesmo cupom duas vezes, um cupom vencido e quantidade 0
ou -1.

Papel: engenheiro sênior de segurança, especialista em pagamentos. Garanta que ninguém paga menos do que deve nem leva
sem pagar.
- **Auditar:** siga o fluxo do dinheiro de ponta a ponta: página do produto ou plano → carrinho → pagamento → provedor
  (Stripe, Mercado Pago, Pagar.me, PayPal…) → página de sucesso → webhook → entrega ou liberação → reembolso e
  cancelamento. Em cada etapa: o que o cliente manda e em que o servidor confia.
- **Corrigir:**
  1. Preço: o cliente manda só IDs de produto ou plano e quantidades; o servidor busca os preços no banco ou nos IDs de
     preço do provedor e calcula total, imposto, frete e desconto; preço, valor, moeda ou total vindos do cliente são
     ignorados.
  2. Quantidades: inteiros com mínimo 1 e um máximo sensato; o resto é recusado.
  3. Dinheiro em inteiro na menor unidade (centavos), nunca ponto flutuante.
  4. Cupons e créditos: validados no servidor (existe, não venceu, limite de uso total e por usuário, produtos
     elegíveis) e aplicados numa transação do banco, para não serem usados duas vezes por requisições em paralelo.
  5. Liberação **só** por webhook verificado (ex.: `checkout.session.completed`, `payment_intent.succeeded`,
     `invoice.paid`), nunca pelo redirecionamento de sucesso; a página de sucesso só mostra o status.
  6. Webhooks: assinatura verificada com o corpo **cru** e o segredo do endereço (ex.: `stripe.webhooks.constructEvent`);
     o que falhar é recusado; IDs de evento processados guardados para ignorar repetidos (idempotência); eventos fora de
     ordem tratados; valor e moeda pagos conferidos com o pedido.
  7. Assinaturas e direitos de acesso: decididos no servidor pelo status guardado via webhook, nunca por marca do cliente
     nem por parâmetro como `?plan=pro`; cancelamento, falha de pagamento, reembolso e contestação tiram o acesso quando
     devem.
  8. Saldos, créditos e estoque: atualização atômica em transação, contra gasto duplo por corrida.
  9. Dado de cartão nunca passa pelo seu servidor: use o checkout hospedado ou os componentes do provedor.
  10. Chaves de teste em desenvolvimento e reais só em produção; a rota do webhook fica fora da proteção de CSRF, mas com
      assinatura verificada.
- **Verificar:** testes para preço adulterado, quantidade negativa, cupom reusado, página de sucesso sem pagar, webhook
  sem assinatura ou forjado e o mesmo webhook entregue duas vezes; depois, os passos da linha de comando ou do painel do
  provedor para mandar webhooks de teste.
**Feito quando:** totais calculados só no servidor com preços confiáveis; pedido e plano liberados só por webhook com
assinatura; webhook repetido não entrega duas vezes; cupom, crédito e estoque sem gasto duplo; reembolso e cancelamento
tiram o acesso.
**Cuidado:** ler o corpo do webhook como JSON antes de verificar quebra a assinatura: muitos frameworks precisam de
configuração de corpo cru nessa rota. Teste grátis e indicação também são vazamento de dinheiro: garanta que não se
reusam com e-mails novos sem fim.
