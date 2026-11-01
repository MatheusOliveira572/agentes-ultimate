# Segurança · identidade e acesso (S-web-1, 2, 5, 8 e 13)

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia `seguranca-contexto.md`
(contexto do projeto, modo de trabalhar e "terminar com"). Só para app com servidor próprio; no Power BI, o login é da
plataforma.

## Roteiro 01 · login de verdade (S-web-1)
Provar quem é cada usuário, no servidor, em toda requisição. Tela de login e menu escondido são só interface: a checagem
real roda no servidor (ou nas regras do banco) sempre que um dado é lido ou alterado. Exemplo do que dá errado: a página
só mostra os dados depois do login porque o front-end checa `if (user)`, mas a rota `/api/...` por trás não checa nada,
e quem copia a URL num terminal leva os dados de todos.
**Autoteste de 2 min:** entre, copie uma requisição da API como cURL (ferramentas do desenvolvedor → Rede), apague a
linha do cookie ou da autorização e rode: tem de dar 401, não dados. Abra uma página protegida numa janela anônima: tem
de mandar para o login, e a busca de dados dela tem de falhar. Troque um ID na URL ou no corpo (`/api/users/42` →
`/api/users/43`): nunca pode aparecer dado de outra pessoa.

Papel: engenheiro sênior de segurança. Revise o login de ponta a ponta e deixe-o pronto para lançar.
- **Auditar:**
  1. O método (Supabase Auth, Clerk, Auth.js, Firebase Auth, JWT próprio, sessão no servidor). Se for feito à mão, diga,
     e se convém trocar por um provedor consolidado.
  2. **Todo** ponto de entrada do servidor (rotas de API, ações de servidor, funções serverless, resolvers GraphQL,
     funções do banco, webhooks, tarefas agendadas): exige usuário logado? A checagem está **no servidor, dentro do
     próprio tratador**, e não só na tela, num guarda de rota do navegador ou só no middleware?
  3. A identidade é verificada direito em toda requisição: sessão buscada no servidor, ou JWT verificado por biblioteca
     (assinatura, validade, emissor, público). Aponte token decodificado sem verificar, aceitação de `alg: none` e
     segredo de assinatura fixo ou fraco.
  4. O ID usado para ler ou gravar vem sempre da sessão verificada, nunca do corpo, da URL ou de cabeçalho do cliente.
  5. Cadastro e login: erro genérico ("e-mail ou senha inválidos") que não diz se a conta existe; e-mail confirmado antes
     de ação sensível; sessão encerrada ao sair e ao trocar a senha; duração de sessão razoável.
  6. OAuth, login social ou link mágico: parâmetro `state` usado; URLs de retorno numa lista exata; parâmetro
     `?next=`/`?redirect=`/`?returnTo=` só aceita caminho relativo do próprio site (sem redirecionamento aberto).
- **Corrigir:** uma função de servidor reaproveitável (ex.: `exigirUsuario()`) chamada no topo de todo tratador
  protegido, devolvendo 401 sem sessão válida; nenhuma decisão de segurança só no código do navegador; no Supabase, no
  servidor, use o método que revalida o usuário no servidor de login, não o que confia no cookie como está.
- **Verificar:** para cada endereço protegido, um `curl` sem credencial que deve dar 401 e um que tenta ler recurso de
  outro usuário e deve dar 403 ou 404.
**Feito quando:** todo endereço protegido dá 401 sem sessão válida; o ID vem sempre da sessão verificada; sair e trocar
a senha derrubam as sessões; os erros de login não revelam se o e-mail existe; redirecionamentos só para o próprio site.
**Cuidado:** middleware não basta (em 2025 uma falha do Next.js deixou pular o middleware): cheque dentro de cada rota e
ação. Ações de servidor do Next.js são endereços públicos: cada uma precisa da própria checagem. Não faça login próprio:
guardar senha, sessão e token é fácil de errar por pouco.

## Roteiro 05 · senhas com hash (S-web-2)
Guarde a senha de modo que nem você, nem quem roubar o banco, consiga lê-la: hash de mão única, com sal e lento de
propósito (Argon2id, scrypt ou bcrypt). Senha "criptografada" pode ser decifrada; hash rápido (MD5, SHA-256) se quebra
aos bilhões por segundo. Com provedor de login, ele já faz isso; o seu trabalho é a senha não vazar por outro lugar.
**Autoteste:** na tabela de usuários, o valor bom começa com `$argon2id$`, `$2b$12$` ou `$scrypt$`; texto puro ou
hexadecimal de 32/64 caracteres é ruim. Procure a senha de teste nos logs e no rastreio de erros: não pode aparecer.
Nenhuma resposta da API (inclusive `/api/me` e listas de usuários do administrador) tem `password` ou `password_hash`.

Papel: engenheiro sênior de segurança. Garanta que as senhas são tratadas e guardadas direito em todo o app.
- **Auditar:** (1) todo lugar que lida com senha: cadastro, login, troca, redefinição, "criar usuário" do administrador,
  convites, cargas iniciais, importações e testes; (2) como é guardada; com provedor, confirme que o app **não** guarda,
  registra nem repassa a senha em outro lugar (tabela própria, análise de uso, logs, e-mails, rastreio de erro); (3) se
  o app guarda, o algoritmo: texto puro, criptografia reversível, MD5, SHA-1, SHA-256 ou hash rápido sem sal é Crítico;
  (4) comparação pela função de verificação da biblioteca (tempo constante), não com `==`; (5) log de requisição,
  tratadores de erro e rastreio de erro nunca gravam corpo com senha; (6) nenhuma resposta ou estado do navegador tem
  senha ou hash, e senha nunca no `localStorage` nem em cookie.
- **Corrigir:** Argon2id (mínimo do OWASP: 19 MiB de memória, 2 iterações, paralelismo 1) por biblioteca mantida, ou
  bcrypt custo 12 (mínimo 10; bcrypt só usa os primeiros 72 bytes, então limite o tamanho máximo); hash fraco antigo:
  migre no próximo login certo (confere no antigo e regrava no novo) e diga o que fazer com quem não entra mais (forçar
  redefinição); regra de senha por tamanho (mínimo 8, recomendado 12 ou mais, aceitar ao menos 64, qualquer caractere,
  sem "1 maiúscula + 1 símbolo"), opcionalmente bloqueando senhas vazadas conhecidas; senha mascarada em todo log; nunca
  mandar senha por e-mail.
- **Verificar:** como fica um hash guardado agora, e um teste que prova: senha certa entra, errada falha, e a senha em
  texto não aparece em nenhum log.
**Feito quando:** senhas com Argon2id, scrypt ou bcrypt (ou só pelo provedor); nenhuma senha ou hash em log, relatório
de erro, e-mail ou resposta; há caminho de migração para hashes fracos; regra por tamanho.
**Cuidado:** criptografar não é fazer hash: se você decifra, o atacante com a chave também. Logger que grava o corpo
inteiro grava a senha: mascare.

## Roteiro 09 · trancar as rotas de administração (S-web-13)
Esconder o botão não é segurança. Toda página e toda API de administração confere, no servidor, que o usuário tem mesmo
o papel de administrador, guardado onde o usuário não edita. URL difícil de adivinhar, link escondido ou checagem de
e-mail no front-end não contam.
**Autoteste:** entre como usuário comum e abra `/admin` direto: redireciona ou 403. Como administrador, copie uma
requisição de administração como cURL, troque o cookie pelo de um usuário comum e rode: 403. Procure no pacote do
navegador e-mails de administrador ou lógica `isAdmin`.

Papel: engenheiro sênior de segurança. Garanta que só administrador de verdade alcança a administração, no servidor.
- **Auditar:** (1) toda rota privilegiada: páginas (`/admin`…), rotas de API, ações, mutações GraphQL, funções do banco,
  tarefas agendadas, e rotas de carga, teste, depuração ou migração (`/api/seed`, `/api/test`, `/api/reset-db`…);
  (2) para cada uma, se o papel é conferido no servidor, dentro do tratador, na página e em cada endereço de dados que
  ela chama; (3) de onde vem o papel: aceitável é uma coluna ou tabela de papéis no seu banco, ou metadado do provedor só
  do servidor (`app_metadata` do Supabase, `publicMetadata` do Clerk, custom claims do Firebase); **não** aceitável é
  `user_metadata` do Supabase (o usuário edita), `localStorage`, cookie definido pelo cliente, parâmetro de requisição
  ou e-mail fixo no front-end; (4) e-mails de administrador ou nomes de rotas de administração expostos no navegador.
- **Corrigir:** uma função de servidor (ex.: `exigirAdmin()`) que carrega o usuário verificado **e** confere o papel em
  fonte confiável, devolvendo 403; chamada no topo de todo tratador de administração, não só no middleware ou no
  layout; negar por padrão (rota nova de administração nasce protegida); rotas internas de tarefa e webhook protegidas
  por um segredo longo e aleatório num cabeçalho, comparado em tempo constante, ou pela autenticação da plataforma;
  rotas de carga, teste e depuração fora da produção; toda ação de administrador registrada (quem, o quê, quando, alvo;
  roteiro 08); diga como exigir MFA para contas de administrador no provedor.
- **Verificar:** testes que provam: sem login, 401; usuário comum, 403 em toda página e rota de administração;
  administrador, permitido; e ninguém vira administrador editando o próprio perfil ou metadado.
**Feito quando:** toda página e API de administração confere o papel no servidor; papéis onde o usuário não edita;
usuário comum recebe 403 em tudo (testado); rotas de teste fora da produção; ações de administrador registradas.
**Cuidado:** `user_metadata` do Supabase é editável pelo usuário. "Ninguém conhece a URL" não protege: URLs vão parar em
pacotes, logs e histórico do navegador.

## Roteiro 15 · cookies de sessão (S-web-5)
Quem tem o cookie de sessão é o usuário. Três marcas o protegem: HttpOnly (o JavaScript não lê, então XSS não rouba),
Secure (só vai por HTTPS) e SameSite=Lax (não vai na maioria das requisições de outro site). A sessão também precisa
vencer, ser renovada no login e ser destruída ao sair. Exemplo do que dá errado: token guardado no `localStorage`; uma
falha de XSS e o script do atacante leva uma cópia logada da conta por 30 dias.
**Autoteste:** ferramentas do desenvolvedor → Aplicativo → Cookies: o de sessão com HttpOnly, Secure e SameSite Lax ou
Strict; em Armazenamento local, nada chamado `token`, `jwt`, `session` ou `access_token`; saia e repita uma
requisição antiga com o cookie antigo: tem de falhar.

Papel: engenheiro sênior de segurança. Endureça como o app guarda e gerencia as sessões.
- **Auditar:** (1) onde fica a sessão (armazenamento no servidor, cookies e qual biblioteca os define, JWT,
  `localStorage`/`sessionStorage`, SDK do provedor) e todo cookie com as marcas atuais; (2) cada cookie de login:
  HttpOnly, Secure, SameSite (Lax ou Strict), `Path=/`, sem `Domain` amplo demais, `Max-Age`/`Expires` razoável; (3) ciclo
  da sessão: identificador novo no login e na troca de privilégio (contra fixação de sessão), destruída no servidor ao
  sair, prazo de inatividade e prazo máximo, todas revogadas depois de troca ou redefinição de senha; (4) token no
  `localStorage`: explique o risco e se o provedor aceita sessão por cookie; (5) com JWT: validade (token de acesso curto
  com rotação do token de renovação é o padrão), como revoga, e nada sensível no conteúdo (qualquer um lê).
- **Corrigir:** HttpOnly, Secure e SameSite=Lax em todo cookie de login (Strict para app muito sensível, se não quebrar
  o fluxo); prefixo `__Host-` onde o framework deixar; sessão renovada no login, destruída ao sair, e "sair de todos os
  aparelhos" rodando sozinho depois de troca de senha; prazos razoáveis (ex.: 7 a 30 dias com prazo de inatividade para
  app de consumidor, menos para administrador), explicando a escolha; com provedor, confirme que o padrão dele é seguro e
  que o seu código não o sobrescreve; nunca segredo ou dado pessoal em cookie legível (assine ou cifre o que precisar
  guardar dado, com segredo forte).
- **Verificar:** a lista final de cookies com as marcas e um teste que prova que o cookie de uma sessão encerrada não
  funciona mais.
**Feito quando:** cookies de sessão com HttpOnly, Secure e SameSite; sem token longo no `localStorage` (ou risco
entendido e mitigado); sair e trocar a senha invalidam a sessão no servidor; sessões vencem num prazo razoável.
**Cuidado:** alguns SDKs de login guardam token no `localStorage` por padrão: aceitável com uma CSP forte, mas saiba qual
usa e por quê. SameSite=Strict pode quebrar o login que vem de e-mail ou de OAuth: Lax é o padrão usual.

## Roteiro 17 · links de redefinição de senha que vencem (S-web-8)
O link de redefinição é uma chave-mestra temporária da conta: imprevisível, vale uma vez, vence rápido (15 a 30
minutos) e para de valer quando outro é pedido ou a senha muda. As mesmas regras valem para link mágico, confirmação de
e-mail e convite. Exemplo do que dá errado: um e-mail de redefinição de 3 meses atrás ainda funciona quando o e-mail da
pessoa é invadido; ou o token é previsível (hora, ID do usuário).
**Autoteste:** peça a redefinição e use o link; clique de novo: tem de falhar. Peça duas: a primeira tem de parar de
valer. Peça para um e-mail que não existe: a mensagem tem de ser idêntica. Espere passar do prazo e tente.

Papel: engenheiro sênior de segurança. Deixe seguro o fluxo de redefinição de senha e todo link parecido.
- **Escopo:** redefinição de senha, login por link mágico, confirmação de e-mail, confirmação de troca de e-mail,
  convites de time e todo link ou código enviado por e-mail ou SMS que dá acesso.
- **Auditar:** em cada fluxo, como o token é gerado, como é guardado, quanto dura, se vale uma vez, o que o invalida, o
  que o usuário vê para e-mail desconhecido e como a URL do link é montada.
- **Corrigir** (com provedor de login, diga quais configurações dele conferir e mude só o código que é seu):
  1. Token de fonte aleatória criptográfica com pelo menos 32 bytes (`crypto.randomBytes(32)`,
     `secrets.token_urlsafe(32)`); nada de hora, ID do usuário, UUIDv1 ou `Math.random`.
  2. Guardar só o hash SHA-256 do token, nunca o token.
  3. Prazo: 15 a 30 minutos para redefinição e link mágico; até 24 h para confirmação de e-mail; até 7 dias para convite.
  4. Vale uma vez: invalidado no uso; todos os tokens pendentes do usuário morrem quando outro é pedido ou a senha muda.
  5. Mesma mensagem e tempo de resposta parecido, exista o e-mail ou não ("se a conta existir, enviamos um link").
  6. Limite de pedidos por e-mail e por IP (roteiro 12).
  7. Link montado a partir de uma variável `APP_URL` configurada, **nunca** do cabeçalho Host da requisição (envenenar o
     Host manda o link para o domínio do atacante).
  8. Na página de redefinição: `Referrer-Policy: no-referrer` e nenhum script de terceiro (análise de uso) que veja o
     token na URL.
  9. Depois de redefinir: regra de senha e hash normais (roteiro 05), todas as sessões revogadas e um e-mail "sua senha
     foi trocada".
  10. Lista de URLs permitidas para o redirecionamento ao fim do fluxo.
- **Verificar:** testes que provam: token usado falha; vencido falha; antigo falha depois de pedir outro; e-mail real e
  falso recebem a mesma resposta; cabeçalho Host forjado não muda o domínio do link.
**Feito quando:** tokens aleatórios de 32 bytes ou mais, guardados como hash, vencendo em 15 a 30 minutos; valem uma
vez e pedir outro mata o anterior; a resposta não revela se o e-mail existe; link montado da URL configurada; redefinir
derruba as outras sessões e avisa o usuário.
**Cuidado:** script de análise de uso na página de redefinição pode gravar a URL inteira, com o token. As configurações
do provedor (Supabase, Firebase, Clerk) têm prazo e URLs de retorno próprios: confira.
