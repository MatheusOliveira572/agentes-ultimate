# Itens do checklist de lançamento

Adaptado dos checklists do autor do plugin ("The App Launch Checklist" e "Pre-launch Security Toolkit", 2026), com as
leis brasileiras no lugar das estrangeiras. Leia só os blocos que o perfil (SKILL.md §2) aplicou.

Formato de cada item: `- **<bloco>-<n> · título.** o que é e quando vale. Verificar: como provar o comportamento.
Dono: quem faz.` Item que cita lei traz o link oficial; **[conferir]** = artigo ainda não conferido no texto oficial pelo
`especialista-lgpd`. O validador (`scripts/validar.js`) exige "Verificar:" em todo item e o link em todo item que cita lei.

**Painel interno (Power BI, SharePoint):** a plataforma cuida de login, cookies, CORS e CSRF; o bloco S-web quase nunca
entra. Entram segredos, quem acessa o quê (workspace, link de compartilhamento, RLS), LGPD de empregado,
acessibilidade, licenças e a honestidade do que o painel afirma ("atualizado em", cobertura dos dados).

## S · Segredos, acesso, dependências, exposição e contas
- **S-1 · Segredo fora do código e do que é entregue.** Toda chave secreta fica só no servidor ou no cofre da
  plataforma: nada em código do navegador, no PBIP, em script, em planilha ou em documento; cite pelo nome da variável.
  Verificar: gere a versão de produção e procure no que sai (pasta do build, pacote, PBIP) por `sk_`, `sk-`, `AKIA`,
  `ghp_`, `service_role`, `Bearer`, `password`, `secret`: 0 achado; a trava de commit do plugin está ativa. Dono:
  `auditor-seguranca` (varre) e `engenheiro-software` (move para o servidor). Roteiro: `seguranca-segredos.md`, 02.
- **S-2 · Variáveis de ambiente.** Nenhum segredo com prefixo público (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`,
  `EXPO_PUBLIC_`, `PUBLIC_`); `.env` fora do git e `.env.example` só com marcadores; sem valor padrão inseguro;
  chaves e bancos separados para desenvolvimento e produção. Verificar: `git ls-files | grep -i env` só mostra
  `.env.example`; a busca por `|| "` e `?? "` junto de nome de segredo dá 0; o app falha na partida se faltar variável.
  Dono: `engenheiro-software`. Roteiro: `seguranca-segredos.md`, 11.
- **S-3 · Histórico inteiro sem segredo.** Vale para todo repositório que outra pessoa vê, e obrigatório antes de
  torná-lo público. Verificar: gitleaks ou TruffleHog no histórico com todas as branches e tags (ou `git log --all -p`
  com os padrões), valores mascarados, 0 achado ou cada achado na lista de troca (S-4); repositório público começa
  limpo. Dono: `auditor-seguranca`; ligar a varredura de segredos e a proteção de envio do GitHub: Só o usuário faz.
  Roteiro: `seguranca-segredos.md`, 24.
- **S-4 · Segredo exposto é trocado na ordem certa.** Exposto em código, histórico, log, print, chat ou chamado conta
  como roubado. Ordem: criar o novo (mínimo de permissão, restrição de origem, limite de gasto), pôr no ar em todo lugar
  que o usa, revogar o antigo, provar que o antigo falha e conferir o uso no período exposto. Reescrever o histórico vem
  depois, se vier. Verificar: chamada só de leitura com a chave antiga devolve 401/403 e o app funciona com a nova.
  Dono: Só o usuário faz (painel do provedor), guiado pelo `engenheiro-software`. Roteiro: `seguranca-segredos.md`, 25.
- **S-5 · MFA nas contas que controlam o projeto.** Git, hospedagem, domínio, banco, nuvem, Microsoft/Power BI,
  provedores de IA e de pagamento: MFA por aplicativo ou chave de acesso (não SMS), só quem precisa, papéis mínimos,
  integrações e tokens revisados, alerta de login. Verificar: a lista de contas, cada uma marcada "MFA ligado" e
  "membros revisados" pelo usuário. Dono: Só o usuário faz. Roteiro: `seguranca-extras.md`, B4.
- **S-7 · Dependências reais e sem falha conhecida.** Cada dependência direta existe no registro oficial e é a conhecida
  (não um nome parecido nem inventado pela IA); sem falha Crítica ou Alta em produção; lockfile no git e instalação a
  partir dele. Verificar: `npm audit --omit=dev`, `pip-audit` ou `osv-scanner` com 0 Crítico/Alto de produção (ou
  cada um com motivo); lista das diretas conferida no registro. Dono: `auditor-seguranca` (audita) e
  `engenheiro-software` (atualiza). Roteiro: `seguranca-publicacao.md`, 21.
- **S-8 · Nada sem uso vai ao ar.** Pacote, rota, página, script, variável e chave de funções abandonadas saem antes de
  publicar. Verificar: `npx knip`/`npx depcheck` ou `deptry` sem pendência, lista de rotas conferida, e o app ainda
  compila, passa nos testes e roda. Dono: `engenheiro-software`; revogar as chaves sem uso: Só o usuário faz. Roteiro:
  `seguranca-publicacao.md`, 22.
- **S-9 · Nada privado no que vai ao ar.** Na pasta ou no pacote publicado não há `.env` e cópias, `.git`, dumps,
  bancos, backups, logs, `.map` nem dado real de teste; listagem de pasta desligada; armazenamento privado. No Power BI:
  sem "Publicar na web" com dado sigiloso, sem link para "qualquer pessoa da organização" onde só alguns podem ver, com a
  exportação de dados detalhados limitada e a RLS ligada quando o acesso é por pessoa. Verificar: cada caminho sensível
  pedido ao endereço publicado devolve 404 (script do roteiro 23); no Power BI, a lista de acessos do workspace, dos
  links e das exportações. Dono: `auditor-seguranca`. Roteiro: `seguranca-publicacao.md`, 23.
- **S-10 · Limite de gasto e alarmes.** Todo serviço cobrado por uso (IA, nuvem, banco, e-mail, SMS, mapas): alerta de
  cobrança, teto de gasto quando o provedor oferece e limite por chave; cota por usuário nas funções mais caras.
  Verificar: tela do painel de cada provedor com o alerta e o teto configurados. Dono: Só o usuário faz. Roteiro:
  `seguranca-extras.md`, B5.
- **S-11 · Erro sem detalhe e sem modo de depuração.** Em produção o usuário vê uma mensagem genérica com código de
  referência; pilha, caminho, consulta e versões vão só para o log; documentação de API e playground fechados ou
  protegidos; sem source map público; versões de pré-visualização protegidas. Verificar: provoque no endereço de produção
  um 404, um 500 e um erro de validação e confira que nenhum mostra pilha, caminho, consulta ou versão. Dono:
  `engenheiro-software`. Roteiro: `seguranca-publicacao.md`, 20.
- **S-12 · Log de segurança, sem segredo.** Login certo e errado, permissão negada, ação de administração, troca de
  papel, limite atingido e evento de pagamento ficam registrados com hora UTC, ID do usuário (não o perfil), IP, ID da
  requisição e resultado; senha, token, cookie e chave nunca entram no log; alerta para força bruta e pico de erros.
  App público com fins econômicos: o Marco Civil (art. 15 [conferir]) manda guardar os registros de acesso por 6 meses
  (https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm); ferramenta interna [HIPÓTESE] não se
  enquadra, confirme com o jurídico. Verificar: erre o login 5 vezes e ache os eventos no log em até 2 min, com hora,
  conta e IP; procure no log por `password`, `token`, `authorization`: 0 achado. Dono: `engenheiro-software`.
  Roteiro: `seguranca-revisao.md`, 08.

## S-web · App com servidor próprio (login próprio ou entrada de fora)

## P · Privacidade (LGPD)

## A · Acessibilidade

## H · Honestidade do que se afirma

## L · Licenças
