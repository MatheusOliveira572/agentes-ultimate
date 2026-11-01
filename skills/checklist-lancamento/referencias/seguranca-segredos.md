# Segurança · segredos e chaves (itens S-1 a S-4)

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia `seguranca-contexto.md`
(contexto do projeto, modo de trabalhar e "terminar com"). Nunca imprima o valor de um segredo: cite pelo nome.

## Roteiro 02 · esconder as chaves de API (S-1)
O que roda no navegador vai inteiro para cada visitante. Chave secreta (IA, pagamento, e-mail, SMS, banco) em código de
front-end é pública: um robô copia e gasta por você. A correção é uma rota pequena no servidor: o navegador chama o seu
servidor, o servidor acrescenta a chave e chama o terceiro.
**Autoteste de 2 min:** gere o build de produção e procure na pasta de saída (`dist/`, `build/`, `.next/static/`) por
`sk_`, `sk-`, `secret`, `Bearer`, `api_key`, `service_role`; no site no ar, faça a mesma busca nas fontes do navegador
(Ctrl+Shift+F nas ferramentas do desenvolvedor) e olhe as URLs e cabeçalhos das requisições.

Papel: engenheiro sênior de segurança. Ache toda chave, token ou credencial que possa chegar ao navegador (ou ao pacote
de um app de celular) e leve todo segredo para o servidor.
- **Auditar:**
  1. Procure no código inteiro, inclusive configuração, chaves e tokens escritos à mão (`sk_`, `sk-`, `pk_`, `AKIA`,
     `ghp_`, `xox`, `Bearer`, `api_key`, `apiKey`, `secret`, `token`, `password`, `service_role`, `private_key` e textos
     longos com cara de aleatórios).
  2. Liste cada serviço de terceiro: que chave usa, se é chamada do navegador ou do servidor, e se é **publicável** (feita
     para ser pública: `pk_` do Stripe, chave anônima do Supabase só com RLS ligada, configuração web do Firebase, chave
     do Google Maps restrita por domínio) ou **secreta** (`sk_`/`rk_` do Stripe, chaves de IA, `service_role` do
     Supabase, URL do banco, e-mail e SMS, segredo de webhook e de JWT, credenciais de nuvem).
  3. Confira toda variável exposta ao navegador por prefixo público (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`,
     `EXPO_PUBLIC_`, `PUBLIC_`, `NUXT_PUBLIC_`) e aponte as que guardam segredo.
  4. Gere o build de produção e procure segredo no que sai: é o que vai de fato ao ar.
- **Corrigir:** todo segredo em variável só do servidor; cada chamada do navegador que precisa de segredo vira uma rota
  ou ação no servidor que exige login quando cabe, valida a entrada, tem limite de requisições e faz só a operação que a
  tela precisa. **Não** faça um repasse genérico que encaminha qualquer URL ou corpo (vira um relé aberto). Para as
  publicáveis que ficam públicas, diga que restrições pôr no painel (domínios, APIs permitidas, só leitura).
- **Importante:** tirar a chave do código não "desvaza". Entregue a lista de todo segredo que **já esteve** em código do
  navegador ou em repositório público, para trocar (roteiro 25).
**Feito quando:** a busca no build de produção não acha segredo; nenhum segredo tem prefixo público; toda chamada que
precisa de segredo passa pelo servidor; as publicáveis têm restrição no painel; existe a lista do que trocar.
**Cuidado:** código minificado não esconde nada; app de celular também conta (a chave sai do pacote); protótipos feitos
com IA costumam pôr chave no front-end: procure antes de lançar.

## Roteiro 11 · variáveis de ambiente (S-2)
Ferramentas de build mandam ao navegador toda variável com prefixo público. É preciso separar o público do secreto,
manter o `.env` fora do git e usar valores diferentes em desenvolvimento e produção.
**Autoteste:** `git ls-files | grep -i env` só pode mostrar `.env.example` (com marcadores); no painel da hospedagem,
nenhum segredo com prefixo público; procure valores padrão como `|| "secret"` ou `?? "changeme"`.

Papel: engenheiro sênior de segurança. Audite e arrume o uso de variáveis de ambiente e configuração.
- **Auditar:**
  1. Toda variável que o código lê (`process.env`, `import.meta.env`, `os.environ`, `Deno.env`, arquivos de
     configuração) e todo `.env*` do repositório. Tabela: NOME · onde é usada (navegador, servidor, ambos) · pública ou
     SECRETA · notas. **Só nomes, nunca valores.**
  2. Todo segredo com prefixo público ou lido em código do navegador.
  3. `.gitignore` cobre `.env`, `.env.local`, `.env.*.local`? Algum `.env` está ou já esteve no git?
  4. Valor padrão inseguro (`process.env.JWT_SECRET || "secret"`) ou padrão que usa valor de teste em produção sem avisar.
  5. Segredo vazando por outro caminho: rota `/api/config` ou `/api/health`, mensagem de erro, log do navegador, dados
     da página renderizada no servidor, imagem Docker e argumentos de build, log do CI.
  6. Desenvolvimento e produção com valores separados (chave de teste em dev, chave real só em produção, banco separado).
- **Corrigir:** renomeie ou mova os segredos para nenhum ficar público, e leve o código que os usa para o servidor;
  `.env.example` com todo nome e um marcador seguro; `.gitignore` atualizado; validação na partida (um esquema) para o
  app falhar logo, com mensagem clara, se faltar variável, **sem imprimir o valor**; sem valor padrão inseguro; segredo
  de assinatura longo e aleatório (32 bytes ou mais), com o comando para gerar.
- **Relatar:** toda variável que pode ter vazado (prefixo público, arquivo versionado, logs), para trocar no roteiro 25.
**Feito quando:** nenhum segredo com prefixo público ou lido no navegador; `.env` ignorado e `.env.example` documenta
tudo; o app falha logo sem variável obrigatória; dev e produção com chaves e bancos diferentes.
**Cuidado:** pôr `.env` no `.gitignore` não tira do histórico (roteiro 24); na maioria das hospedagens, trocar variável
exige publicar de novo.

## Roteiro 24 · histórico do git sem segredo (S-3)
Apagar o segredo num commit novo não remove: o git lembra tudo. Robôs varrem o GitHub público atrás de chave nova
minutos depois do envio.
**Autoteste:** `gitleaks git -v` (versões antigas: `gitleaks detect -v`) ou `trufflehog git file://. --only-verified`;
no GitHub, ligue a varredura de segredos e a proteção de envio (Settings → Code security).

Papel: engenheiro sênior de segurança. Ache todo segredo que já foi para o repositório e impeça que aconteça de novo.
- **Auditar:**
  1. Varra o histórico **inteiro, todas as branches e tags**, com gitleaks ou TruffleHog. Sem eles, diga os comandos exatos.
  2. Sem ferramenta, busque à mão: `git log --all -p -S "<padrão>"` e `git log --all --full-history -- "**/.env*"`, com
     padrões como `sk_live_`, `sk_test_`, `rk_live_`, `sk-`, `sk-ant-`, `AKIA`, `ghp_`, `github_pat_`, `xoxb-`, `AIza`,
     o cabeçalho BEGIN … PRIVATE KEY, `service_role`, texto de conexão com usuário e senha, `api_key=`, `secret=`,
     `password=` e textos longos em base64 ou hexadecimal em configuração. Inclua todo `.env` que já foi versionado.
  3. Cada achado: tipo · arquivo · commit · data · branch · ainda está no código atual? **Valor mascarado: só os 4
     primeiros caracteres.**
  4. Outros esconderijos: notebooks, dados de teste, configuração do CI, Dockerfile, documentação e capturas de tela.
- **Corrigir:**
  1. **Primeiro:** todo segredo achado vai para a lista de troca (roteiro 25). Reescrever o histórico não torna seguro um
     segredo vazado: forks, clones e caches guardam cópia.
  2. Tire os que ainda estão no código atual e leia-os de variável de ambiente.
  3. Prevenção: a trava de commit do plugin (já bloqueia os formatos conhecidos), um passo no CI que varre cada envio e
     a varredura de segredos com proteção de envio do GitHub.
  4. **Só depois da troca, e só se o usuário quiser:** como limpar o histórico com `git filter-repo`, o impacto
     (commits com novo identificador, envio forçado, todo colaborador clona de novo) e como pedir ao GitHub que limpe as
     visualizações em cache se o repositório for público.
**Feito quando:** o histórico inteiro (todas as branches) foi varrido; todo segredo achado está na lista de troca; não
sobra segredo no código atual; varredura antes do commit e proteção de envio ligadas.
**Cuidado:** troque primeiro e reescreva depois (se reescrever); reescrever sozinho dá falsa segurança. Repositório
privado não é cofre: é compartilhado, copiado para notebooks e ligado a ferramentas de terceiros.

## Roteiro 25 · trocar as chaves expostas (S-4)
Chave que já esteve em código do navegador, histórico do git, arquivo público, log, captura de tela, chat ou chamado
conta como roubada. Trocar é: criar a nova, pôr em todo lugar que o app usa, publicar, confirmar que funciona, revogar a
antiga e confirmar que ela morreu. Os passos no painel do provedor só o usuário faz; o agente guia e atualiza código e
configuração.
**Autoteste:** chame a API do provedor com a chave antiga: tem de falhar (401/403). Olhe no painel de uso e cobrança
do provedor se houve atividade estranha no período em que a chave ficou exposta.

Papel: engenheiro sênior de segurança e de resposta a incidente. Guie a troca segura de toda credencial que pode ter
vazado; o usuário faz os passos no painel.
- **Passo 1 · inventário:** toda credencial do app (chaves de terceiros, senhas e textos de conexão do banco,
  `service_role`, segredos de sessão e JWT, segredos de OAuth e de webhook, chaves e contas de serviço de nuvem, tokens
  de publicação e de CI, credenciais de e-mail). Para cada: onde está guardada (variáveis de cada ambiente, CI, `.env`
  local, outros serviços) e se há evidência de exposição (achados dos roteiros 02, 11, 24 e de arquivos expostos).
- **Passo 2 · prioridade pelo estrago possível:** pagamento e nuvem primeiro; depois banco e `service_role`; depois IA e
  mensagens (abuso de custo); depois o resto.
- **Passo 3 · roteiro por chave, nesta ordem:** (a) onde criar a nova no painel, com o mínimo de permissão, restrições
  (IP, domínio) e limite de gasto; (b) todo lugar para atualizar; (c) publicar e confirmar que o app funciona com a
  nova; (d) revogar a antiga; (e) confirmar que a antiga falha, com uma requisição segura, só de leitura; (f) conferir
  logs e uso do provedor no período exposto e o que procurar; (g) efeitos esperados: trocar o segredo de sessão desloga
  todo mundo; trocar a senha do banco exige atualizar cada serviço que conecta; trocar o segredo de webhook exige
  atualizar a configuração no provedor.
- **Passo 4 · endurecer:** todo segredo lido de variável de ambiente, sem valor padrão; um `SECRETS.md` com nome, para
  quê, dono, onde fica e última troca, **nunca o valor**.
Nunca peça ao usuário para colar valor de segredo no chat, e nunca o imprima.
**Feito quando:** toda chave exposta foi substituída, publicada e revogada; as antigas comprovadamente falham; os logs
do provedor foram conferidos; as novas têm escopo mínimo, restrições e limite de gasto; existe o `SECRETS.md` sem valores.
**Cuidado:** ponha a nova no ar antes de revogar a antiga, ou você mesmo derruba o app. Exceção: chave de pagamento,
nuvem ou IA vazando **agora**: revogue já, mesmo antes da substituta (minutos fora do ar custam menos).
