# Segurança · implantação e dependências

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia `seguranca-contexto.md`
(contexto do projeto, modo de trabalhar e "terminar com").

## Roteiro 20 · desligar o modo de depuração em produção (S-11)
O modo de depuração mostra erros detalhados: pilha, caminhos, consultas SQL, valores de ambiente e, às vezes, um console
interativo. Para o atacante, é ouro. Em produção, o usuário vê uma mensagem genérica com código de referência; o
detalhe completo vai para os seus logs.
**Autoteste de 2 min:** no site no ar, abra uma página que não existe, mande JSON malformado a uma API e use um ID
inválido: só erros limpos, nunca pilha. Veja se há `.map` baixável (fontes do navegador) e tente `/docs`, `/redoc`,
`/graphql` e `/swagger` no domínio de produção.

Papel: engenheiro sênior de segurança. Garanta que a produção nunca mostre informação de depuração nem ferramenta de
desenvolvedor.
- **Auditar:**
  1. A configuração de depuração do framework em produção. Exemplos: Django `DEBUG = False` e `ALLOWED_HOSTS`; Flask
     sem debug (o depurador Werkzeug permite executar código remoto); FastAPI `debug=False` e `/docs`, `/redoc`,
     `/openapi.json` fechados ou protegidos se a API é privada; Node/Express com `NODE_ENV=production` e um tratador de
     erro que nunca manda `err.stack` nem `err.message` de erro interno; Next.js, Vite e React com build de produção (não
     servidor de desenvolvimento); Laravel `APP_DEBUG=false`; Rails `consider_all_requests_local = false`; Spring com
     Actuator restrito; GraphQL sem introspecção nem playground em produção, salvo se público de propósito.
  2. Todo caminho de erro: blocos `catch` que devolvem `error.message` ou o erro cru do banco; páginas 404 e 500; erros
     de validação.
  3. Source maps públicos, listagem de pasta, cabeçalhos que contam demais (`X-Powered-By`, versão do servidor), rotas
     de teste ou depuração, rotas de saúde ou status que mostram versões, ambiente ou dependências, e `console.log` no
     navegador imprimindo dado sensível.
- **Corrigir:** depuração desligada em produção pela configuração de ambiente (para não depender de lembrar); um
  tratador global de erro: o usuário recebe mensagem genérica e um código de referência, e o detalhe vai só para o log e
  o rastreio de erros; erros do banco e de terceiros viram mensagens genéricas; source maps fora do público (ou enviados
  só ao rastreio de erros); listagem de pasta desligada; rotas de depuração e logs barulhentos fora da produção.
- **Verificar:** comandos `curl` que provocam um 404, um 500 e um erro de validação em produção e mostram que nenhum
  revela pilha, caminho, consulta ou versão.
**Feito quando:** depuração desligada em produção pela configuração; erros com mensagem genérica e código de
referência, sem pilha; documentação de API e playground desligados ou protegidos; source maps fora do público.
**Cuidado:** versões de pré-visualização e homologação costumam ficar públicas com depuração ligada: proteja com senha
ou login da plataforma. Devolver `error.message` num `catch` é vazamento discreto: erro de banco costuma trazer nome de
tabela e coluna.

## Roteiro 21 · dependências vulneráveis e pacotes suspeitos (S-7)
Quase todo app é código de outras pessoas. Quando sai uma falha conhecida, ela é publicada com as versões afetadas e há
quem varra a internet atrás de quem ainda as usa: atualizar é a correção. E todo pacote tem de ser real: a IA às vezes
inventa nomes, e há quem registre esses nomes com código malicioso ("slopsquatting").
**Autoteste de 2 min:** `npm audit --omit=dev` (ou `pnpm audit --prod`), `pip-audit` ou `osv-scanner` no projeto; no
GitHub, ligue os alertas do Dependabot; confira se o framework está numa versão com suporte e correções.

Papel: engenheiro sênior de segurança. Ache e corrija dependências com falha conhecida e confira a lista atrás de
pacotes suspeitos.
- **Auditar:**
  1. Rode as ferramentas da tecnologia (`npm audit`, `pnpm audit`, `pip-audit`, `bundle audit`, `cargo audit`,
     `composer audit`, ou `osv-scanner` para qualquer uma). Sem poder rodar, diga o comando exato para o usuário.
  2. Tabela: pacote · versão instalada · versão corrigida · gravidade · direta ou indireta · usada em produção ou só em
     desenvolvimento · para que serve.
  3. Framework e runtime (Node.js, Python, Next.js, React, Django…) em versão com suporte e correções.
  4. Para cada dependência **direta**: existe no registro oficial? É a conhecida (não um nome quase igual)? Tem
     repositório real e número razoável de downloads? Trocou de dono há pouco? Aponte o que a IA pode ter inventado ou
     errado o nome, e script de instalação (`postinstall`) que não se espera.
  5. Lockfile no git e o CI instalando a partir dele (`npm ci`, `pnpm install --frozen-lockfile`, pip com hashes).
- **Corrigir:** primeiro o Crítico e o Alto de produção, com o menor salto de versão que corrige; em salto de versão
  principal, leia o changelog, liste o que quebra neste código e ajuste; dependência indireta vulnerável: atualize a
  mãe ou use `overrides`/`resolutions`, explicando; nunca `npm audit fix --force` às cegas; build e testes depois de
  cada grupo de atualizações; Dependabot ou Renovate (com atualizações agrupadas) e alertas de segurança ligados.
- **Relatar:** o que foi atualizado, o que ficou (com o motivo: "sem correção", "só desenvolvimento, não vai ao ar") e
  o que parece suspeito na lista.
**Feito quando:** 0 Crítico/Alto em dependência de produção (ou cada um explicado); framework com suporte; toda
dependência direta é real e legítima; lockfile no git; Dependabot ou Renovate ligado; build e testes passam.
**Cuidado:** pacote inventado é ataque real: antes de instalar o que a IA sugeriu, confira em npmjs.com ou pypi.org.
Frameworks soltam correções urgentes com frequência: assine os avisos de segurança do seu.

## Roteiro 22 · tirar o que não se usa (S-8)
Projeto feito com IA acumula pacotes, arquivos e rotas de experimentos abandonados. Dependência sem uso continua sendo
código que pode ter falha ou ser sequestrado; rota esquecida continua sendo uma porta. Tirar encolhe a superfície de
ataque (e o pacote).
**Autoteste:** JavaScript/TypeScript: `npx knip` ou `npx depcheck`; Python: `deptry .`; percorra a pasta de rotas da
API: você reconhece e ainda usa cada uma?

Papel: engenheiro sênior de segurança. Reduza a superfície de ataque tirando o que o app não usa.
- **Auditar:**
  1. Dependências sem uso pela ferramenta certa (knip ou depcheck; deptry; ou busca manual cuidadosa). Confirme cada
     candidata: importação dinâmica, uso em configuração (build, PostCSS, Tailwind, Babel, ESLint, testes), uso por linha
     de comando nos scripts do `package.json`, dependências pares e pacotes de tipos.
  2. Dependências de produção que só servem ao desenvolvimento (tipos, linters, testes, build).
  3. Código morto que ainda vai ao ar: rotas e ações sem uso, páginas de funções removidas, webhooks antigos, rotas de
     teste, demonstração ou carga inicial, ferramentas de administração abandonadas, arquivos sem uso em `public/`.
  4. Variáveis de ambiente, scripts de terceiros (análise de uso antiga, chat), aplicativos OAuth e chaves de API
     ligados a funções removidas.
- **Corrigir:** remova as dependências sem uso e leve as de desenvolvimento para `devDependencies` (ou equivalente);
  apague rotas, páginas e arquivos mortos (na dúvida, liste em vez de apagar); tire scripts e variáveis sem uso; build,
  testes e o app de pé para confirmar que tudo funciona.
- **Relatar:** tabela item · tipo (pacote, rota, arquivo, script, variável, chave) · evidência de que não se usa · o que
  foi feito; e as chaves e aplicativos OAuth para o usuário revogar no painel.
**Feito quando:** nenhuma dependência sem uso; ferramentas de desenvolvimento em `devDependencies`; rotas, páginas e
rotas de teste mortas apagadas; scripts e chaves sem uso removidos ou revogados; o app ainda compila e roda.
**Cuidado:** detector de dependência sem uso tem falso positivo: compile e teste sempre depois de tirar.

## Roteiro 23 · arquivos expostos (S-9)
O servidor entrega o que está na pasta pública, e o build às vezes copia mais do que se espera. Robôs pedem todo dia
caminhos como `/.env`, `/.git/config` e `/backup.zip` a milhões de sites. Se algum devolver o arquivo, acabou: um
`.env` exposto vaza todas as chaves; uma pasta `.git` exposta entrega o código e o histórico inteiros.
**Autoteste de 2 min**, só contra o seu próprio domínio (cada linha deve dar 404 ou 403):
`for p in .env .env.local .env.production .env.backup .git/config .git/HEAD .DS_Store backup.zip db.sql dump.sql database.sqlite; do echo "$p $(curl -s -o /dev/null -w '%{http_code}' https://SEUAPP/$p)"; done`
Olhe dentro de `public/`, `static/` e da saída do build atrás do que não é para o público.

Papel: engenheiro sênior de segurança. Garanta que nenhum arquivo sensível possa ser baixado dos endereços públicos.
- **Auditar:**
  1. `public/`, `static/`, `assets/`, a saída do build (`dist/`, `build/`, `out/`, `.next/static`) e o que mais o
     servidor ou a hospedagem servir direto. Liste o que não deveria ser público: `.env` e cópias, `.git`, bancos e dumps
     (`.sql`, `.sqlite`, `.db`), compactados (`.zip`, `.tar.gz`), logs, pastas de editor (`.vscode`, `.idea`),
     `.DS_Store`, configuração com detalhe interno, documentos privados e dados de teste com dado real.
  2. A configuração do servidor ou da hospedagem: listagem de pasta e regras que sirvam arquivos começados por ponto.
  3. `robots.txt` e `sitemap.xml` não anunciam caminho privado (`robots.txt` é público e **não** protege nada).
  4. Armazenamento na nuvem (S3, R2, GCS, Supabase Storage, Firebase Storage): quais são públicos e se o conteúdo pode
     ser listado.
  5. `.dockerignore`, `.vercelignore` e afins, para segredo não ir para imagem ou publicação.
- **Corrigir:** apague ou tire das pastas públicas os arquivos sensíveis; regras para que arquivos com ponto e extensões
  de backup e dump sempre devolvam 404 (configuração da hospedagem, regras do nginx ou middleware); listagem desligada;
  armazenamento privado, salvo o que precisa ser público, e sem listagem nesses; se um arquivo exposto tinha segredo,
  ele vai para a lista de troca (`seguranca-segredos.md`, roteiro 25).
- **Entregar:** um script `scripts/check-exposed.sh` que recebe o domínio e pede estes caminhos, mostrando o código de
  cada um e destacando o que devolver 200: `/.env`, `/.env.local`, `/.env.production`, `/.env.development`,
  `/.env.backup`, `/.env.bak`, `/.env.old`, `/.git/config`, `/.git/HEAD`, `/.gitignore`, `/.DS_Store`,
  `/.vscode/settings.json`, `/.idea/workspace.xml`, `/backup.zip`, `/backup.tar.gz`, `/db.sql`, `/dump.sql`,
  `/database.sql`, `/database.sqlite`, `/data.db`, `/config.json`, `/config.yml`, `/docker-compose.yml`, `/.npmrc`,
  `/phpinfo.php`, `/server-status`, `/swagger.json`, `/openapi.json`, `/graphql`, mais todo `.map` da pasta de
  arquivos estáticos. Só contra o próprio domínio.
**Feito quando:** todo caminho sensível devolve 404/403 no site no ar; as pastas públicas só têm o que é para o
público; listagem desligada; armazenamento privado ou sem listagem; o script existe e roda de novo.
**Cuidado:** rode de novo depois de toda publicação grande: um passo novo de build pode trazer arquivo de volta. Se um
`.env` já esteve acessível, trate toda chave dele como roubada (roteiro 25).

**Painel interno no Power BI:** os equivalentes são "Publicar na web" (qualquer pessoa na internet vê, inclusive o dado
detalhado do modelo), link de compartilhamento para "qualquer pessoa da organização", exportação de dados detalhados
liberada e RLS desligada quando o acesso devia ser por pessoa. Confira cada um na lista de acessos do workspace.
