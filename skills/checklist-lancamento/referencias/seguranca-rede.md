# Segurança · rede e navegador (S-web-6, 14, 15, 16 e 17)

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia `seguranca-contexto.md`
(contexto do projeto, modo de trabalhar e "terminar com"). No Power BI e no SharePoint, a plataforma cuida disto.

## Roteiro 04 · só HTTPS (S-web-14)
Todo byte entre o usuário e os servidores cifrado, sem porta lateral em HTTP. A maioria das hospedagens já dá HTTPS,
mas ainda falta: HTTP redirecionado para HTTPS, o cabeçalho HSTS (o navegador nunca mais tenta HTTP), nenhum link
`http://` dentro do app e conexões cifradas com o banco e os outros serviços. Exemplo do que dá errado: uma chamada
antiga ainda usa `http://`, e o token de sessão passa em texto puro na rede do café.
**Autoteste:** abra `http://seudominio` (e o `www.`): tem de ir na hora para `https://`; passe o domínio no SSL Labs
(ssllabs.com/ssltest), meta nota A; no console do navegador, em cada página principal, nenhum aviso "Mixed Content".

Papel: engenheiro sênior de segurança. Garanta HTTPS em tudo, sem caminho em HTTP.
- **Auditar:** (1) onde o app está e quem cuida do TLS (plataforma, Cloudflare, nginx/Caddy num servidor, balanceador);
  (2) toda requisição HTTP (domínio, www, subdomínios, todos os caminhos) redirecionada de forma permanente (301/308)
  para HTTPS; (3) `http://` escrito no código: chamadas de API, imagens, scripts, fontes, iframes, webhooks, URLs de
  retorno do OAuth, links de e-mail, redirecionamentos e valores de variáveis de ambiente (`localhost` em configuração
  de desenvolvimento pode); (4) conexões de saída do servidor (banco, Redis, e-mail, APIs) exigindo TLS (ex.:
  `sslmode=require` no Postgres); (5) cookies com Secure; (6) atrás de proxy ou balanceador, o app lê o protocolo
  original direito (ex.: `app.set('trust proxy', 1)` no Express), para a detecção de HTTPS e os redirecionamentos
  funcionarem sem laço.
- **Corrigir:** redirecionamento HTTP → HTTPS na hospedagem ou no proxy; o cabeçalho
  `Strict-Transport-Security: max-age=63072000; includeSubDomains` (só ponha `includeSubDomains` se todo subdomínio
  serve HTTPS; **não** ponha `preload` sem o usuário confirmar, porque é difícil de desfazer); toda URL insegura vira
  `https://` ou relativa; TLS obrigatório no banco e nos serviços.
- **Verificar:** comandos `curl` que mostram o redirecionamento e o HSTS, e como olhar o console atrás de conteúdo misto.
**Feito quando:** HTTP sempre redireciona para HTTPS, em todo domínio e subdomínio usado; HSTS presente nas respostas
HTTPS; nenhum aviso de conteúdo misto; banco e serviços com TLS; cookies com Secure.
**Cuidado:** HSTS com preload é compromisso quase permanente: deixe para quando tudo estiver estável. Subdomínios
antigos (homologação, blog, documentação) costumam ser esquecidos e ainda servir HTTP.

## Roteiro 12 · limite de requisições (S-web-15)
Ninguém martela o login, os formulários ou as APIs pagas milhares de vezes por minuto. O limite corta quantas
requisições uma pessoa, IP ou conta faz numa janela de tempo: para adivinhação de senha, teste de senhas vazadas,
cadastro em massa, raspagem e, sobretudo em app de IA, robô estourando a sua conta nos endereços caros.
**Autoteste:** contra o seu próprio app, mande 30 tentativas rápidas de login:
`for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code} " -X POST https://SEUAPP/api/login -H 'content-type: application/json' -d '{}'; done`
Tem de começar a aparecer 429. Repita nos endereços de IA, cadastro e formulário de contato.

Papel: engenheiro sênior de segurança. Ponha limites que protejam contra força bruta, spam e abuso de custo.
- **Auditar:** (1) os endereços que precisam de limite, em grupos: login e afins (login, cadastro, redefinição, código
  de verificação e MFA, link mágico), caros ou pagos (IA, envio de e-mail e SMS, processamento de arquivo, busca,
  exportação), conteúdo do usuário (comentários, formulário de contato) e a API em geral; (2) o que existe hoje e se
  funcionaria na hospedagem: contador em memória **não** funciona em serverless nem com várias instâncias.
- **Corrigir:**
  1. Proponha uma tabela de limites para o usuário aprovar, a partir destes padrões: login, 5 tentativas por minuto por
     IP+e-mail, com espera crescente depois de falhas seguidas; cadastro, 5 por hora por IP; redefinição e link mágico, 3
     por hora por e-mail e 10 por hora por IP; código de verificação, 5 tentativas por código e depois o código morre;
     IA, limite por usuário por minuto **mais** cota diária por usuário ou plano; e-mail e SMS, tetos estritos por usuário
     e no total; API em geral, um limite generoso por IP (ex.: 100 por minuto).
  2. Implemente com um armazenamento compartilhado que funcione na hospedagem (ex.: Upstash Redis com
     `@upstash/ratelimit`, Redis, o próprio banco, ou recursos da plataforma como o WAF da Vercel ou o limite do
     Cloudflare); chave pelo ID do usuário quando logado e pelo IP quando não.
  3. Pegue o IP do cliente do jeito certo para a hospedagem: não confie num `X-Forwarded-For` cru que o cliente forja; use
     o cabeçalho verificado da plataforma.
  4. Devolva 429 com `Retry-After` e uma mensagem amigável, sem revelar se a conta existe.
  5. Registre quando o limite é atingido (roteiro 08).
  6. Para APIs pagas, diga também como pôr teto de gasto no painel de cada provedor, como última defesa.
- **Verificar:** um script que dispara requisições em cada endereço limitado, em local ou homologação, e mostra a virada
  para 429.
**Feito quando:** login, cadastro, redefinição, código e endereços pagos limitados; limites num armazenamento
compartilhado que funciona na hospedagem; acima do limite, 429 com Retry-After; tetos de gasto no provedor de IA, e-mail
e SMS.
**Cuidado:** endereço de SMS atrai fraude ("SMS pumping"): limite duro e restrinja os países de destino. Endereço de IA
sem cota é a conta surpresa número 1 de app feito com IA.

## Roteiro 13 · CORS fechado (S-web-16)
Só os seus sites leem as respostas da sua API pelo navegador. O CORS diz ao navegador quais outros sites podem ler as
respostas usando o navegador do visitante. Curinga ou "refletir qualquer origem", ainda mais com cookies, deixa um site
malicioso ler em silêncio os dados de um usuário logado. CORS não é autenticação: só controla navegadores, então a API
continua precisando dos roteiros 01 e 09.
**Autoteste:** `curl -s -I -H "Origin: https://estranho.example" https://SEUAPP/api/QUALQUER`: se a resposta ecoar
`Access-Control-Allow-Origin: https://estranho.example`, ou mostrar `*` junto com `Allow-Credentials: true`, corrija.

Papel: engenheiro sênior de segurança. Feche a configuração de CORS.
- **Auditar:** (1) todo lugar onde o CORS é configurado: middleware `cors()`, configuração do framework (cabeçalhos no
  `next.config.js`, `vercel.json`, `netlify.toml`/`_headers`), rotas ou funções que põem cabeçalhos `Access-Control-*` à
  mão, Edge Functions do Supabase, gateways de API e o CORS dos buckets (S3, R2, GCS, Firebase Storage); (2) para cada
  um: origens permitidas, se aceita credenciais, métodos e cabeçalhos; (3) aponte `Access-Control-Allow-Origin: *`,
  origem refletida da requisição sem conferir, `null` aceito como origem, curinga com credenciais e comparação frouxa
  (`endsWith("seuapp.com")` também aceita `malseuapp.com`; regex sem âncoras); (4) diga se a API é chamada de outra
  origem: se o front-end e a API têm a mesma origem, talvez nem precise de CORS.
- **Corrigir:** curinga e reflexão viram uma lista exata vinda de variável de ambiente (domínios de produção; `localhost`
  só em desenvolvimento), com comparação exata; credenciais só se precisa mesmo, e nunca com curinga; métodos e
  cabeçalhos só os que o front-end usa; endereço público, só de leitura e não personalizado (um catálogo público) pode
  usar `*`, mas nunca com cookies; um parágrafo explicando por que CORS não é autenticação e confirmando que os
  endereços continuam checando login no servidor.
- **Verificar:** comandos `curl` mostrando que uma origem permitida recebe os cabeçalhos de CORS e uma desconhecida não.
**Feito quando:** nenhum curinga nem origem refletida em endereço com cookie ou dado privado; origens numa lista exata
na configuração; origem desconhecida não recebe `Access-Control-Allow-Origin`.
**Cuidado:** CORS só afeta navegador: `curl`, scripts e servidores ignoram, então nunca substitui login. Buckets têm a
própria configuração de CORS, separada do app.

## Roteiro 14 · cabeçalhos de segurança (S-web-17)
Alguns cabeçalhos HTTP ligam, de graça, proteções fortes do navegador: que scripts podem rodar (CSP), nunca usar HTTP
(HSTS), nunca ser posto em moldura por outro site (contra clickjacking), não adivinhar tipo de arquivo e o que mandar no
Referer. Não corrigem defeito, mas fazem muitos ataques falharem ou causarem bem menos estrago. Exemplo: sem proteção de
moldura, outro site carrega o seu numa moldura invisível e induz o usuário a clicar "Apagar conta".
**Autoteste:** passe o domínio em securityheaders.com (meta A), ou `curl -s -I https://SEUAPP` e procure
`content-security-policy`, `strict-transport-security`, `x-content-type-options`, `x-frame-options`, `referrer-policy`.

Papel: engenheiro sênior de segurança. Ponha um conjunto forte e funcionando de cabeçalhos de segurança em toda resposta.
- **Auditar:** (1) que cabeçalhos saem hoje e onde são configurados (framework, middleware, helmet, `vercel.json`,
  `_headers` do Netlify, nginx/Caddy); (2) toda origem de terceiro que o app carrega ou chama de forma legítima (análise
  de uso, fontes, pagamento, Supabase, login, CDN de imagem, API de IA, mapas), lendo o código: a CSP precisa delas.
- **Corrigir**, em todas as rotas, no lugar mais adequado da tecnologia:
  - CSP, começando por `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`,
    acrescentando só as origens de terceiros achadas; sem `'unsafe-inline'` e `'unsafe-eval'` para scripts (se o
    framework precisa de script embutido, use nonce ou hash; se algo exige mesmo um valor inseguro, explique);
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`;
  - `X-Content-Type-Options: nosniff`;
  - `X-Frame-Options: DENY` (ou `SAMEORIGIN` se o app põe as próprias páginas em moldura);
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`, ligando só o que o app usa;
  - `Cross-Origin-Opener-Policy: same-origin` (ou `same-origin-allow-popups` se as janelas de OAuth ou pagamento
    quebrarem);
  - sem `X-Powered-By` nem versão do servidor;
  - `Cache-Control: no-store` em página logada e em resposta da API com dado pessoal.
- **Implantar aos poucos:** primeiro a CSP em `Content-Security-Policy-Report-Only`; liste o que seria bloqueado em cada
  página principal (login, pagamento, OAuth, upload, conteúdo embutido), ajuste e só então passe a valer. Diga as páginas
  exatas para clicar e confirmar que nada quebrou.
- **Verificar:** o `curl` que confere cada cabeçalho e a nota esperada no securityheaders.com.
**Feito quando:** todos os cabeçalhos em toda página e resposta da API; a CSP valendo (não só relatando) e o app ainda
funciona (login, pagamento, OAuth); sem `X-Powered-By`; nota A ou melhor.
**Cuidado:** CSP errada quebra em silêncio pagamento, janela de OAuth e análise de uso: por isso o modo só relatando vem
antes. Cabeçalho no `next.config.js` não vale em toda hospedagem: confira no endereço publicado, não só no local.

## Roteiro 16 · proteção contra CSRF (S-web-6)
Outros sites não conseguem fazer o usuário logado agir sem saber. O CSRF abusa de o navegador mandar os seus cookies
sozinho: uma página maliciosa envia um formulário escondido ao seu app e, se o servidor só olha o cookie, acha que foi o
usuário. Exemplo: o formulário escondido manda para "trocar e-mail"; a pessoa, logada, visita a página, o e-mail vira o
do atacante, que depois redefine a senha. Proteção: cookies SameSite, token de CSRF ou checagem de Origin em toda
requisição que muda estado, e nunca mudar dado por GET.
**Autoteste:** o app usa cookie para o login? Então CSRF se aplica. Procure rota GET que muda dado (`/delete?id=`,
`/logout`, `/subscribe`). No seu próprio app: salve um HTML local com um formulário que se envia sozinho para um dos
seus endereços, abra logado e veja se a ação acontece.

Papel: engenheiro sênior de segurança. Proteja o app contra CSRF.
- **Auditar:** (1) como as requisições se autenticam: com cookie (inclusive cookie de sessão do provedor), CSRF se
  aplica; se o login é **só** um token Bearer no cabeçalho Authorization posto pelo JavaScript, o risco é baixo: diga, e
  confirme que não existe caminho por cookie; (2) todo endereço que muda estado (POST, PUT, PATCH, DELETE, ações,
  formulários) e toda rota GET que muda estado; (3) a proteção existente: middleware do framework (Django, Rails e
  Laravel já trazem), a checagem de Origin/Host das ações de servidor do Next.js (e se `serverActions.allowedOrigins`
  foi afrouxado), SameSite, token ou checagem de Origin próprios; (4) se endereços JSON também aceitam corpo
  form-encoded ou `text/plain`, que outro site manda sem pré-verificação de CORS.
- **Corrigir:** GET que muda estado vira POST/DELETE; proteção de CSRF do framework onde existe, sem estar desligada; em
  Express ou servidor próprio, biblioteca mantida com token sincronizado ou double-submit assinado (o antigo `csurf` foi
  descontinuado); checagem de Origin em toda requisição que muda estado, como defesa extra (recusa quando Origin vem e não
  é o seu site); endereços JSON exigem `Content-Type: application/json`; cookies de login SameSite Lax ou Strict
  (roteiro 15); só os webhooks ficam de fora, e esses verificam assinatura (roteiro 19); ações de alto risco (trocar
  e-mail, trocar senha, apagar conta, saques) pedem também a senha atual ou login recente.
- **Verificar:** um teste que manda requisição que muda estado com Origin estranha e sem token e confirma a recusa, e que
  a tela real continua funcionando.
**Feito quando:** nenhum GET muda dado; toda requisição que muda estado exige token ou passa pela checagem de Origin;
cookies com SameSite Lax ou Strict; mudança sensível de conta pede autenticação de novo.
**Cuidado:** SameSite ajuda mas não completa: subdomínio que você não controla e navegador antigo ainda dão problema.
CSRF de login (logar a vítima na conta do atacante) também existe: proteja o formulário de login.
