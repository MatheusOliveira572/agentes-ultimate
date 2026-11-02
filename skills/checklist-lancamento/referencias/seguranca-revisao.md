# Segurança · monitoramento, revisão completa, testes de quebra e incidente

Adaptado dos checklists do autor do plugin ("Pre-launch Security Toolkit", 2026). Antes, leia
`seguranca-contexto.md` (contexto do projeto, modo de trabalhar e "terminar com").

## Roteiro 08 · registrar e monitorar atividade suspeita (S-12)
O log é a câmera de segurança: um registro dos eventos que importam (logins, falhas, permissão negada, ações de
administração, eventos de pagamento) e alertas quando o padrão parece errado. Tão importante quanto: o log não pode ter
segredo nem senha, ou vira um vazamento à parte.
**Autoteste de 2 min:** erre o login 5 vezes. Dá para achar esses eventos no log em 2 minutos, com hora, conta e IP?
Alguém seria avisado? Se não, há log mas não há monitoramento. Procure no log por `password`, `token` e
`authorization`: tem de estar mascarado.

Papel: engenheiro sênior de segurança. Acrescente log de segurança e alertas básicos, sem registrar nada sensível.
- **Auditar:** (1) o log de hoje: o que registra, para onde vai (console da hospedagem, Sentry, Datadog, Axiom…), por
  quanto tempo fica e quem lê; (2) se alguma linha de log ou relatório de erro tem senha, token, ID de sessão, chave de
  API, link de redefinição, número de cartão inteiro ou corpo inteiro de requisição com dado pessoal.
- **Corrigir:**
  1. Log estruturado (JSON) de eventos de segurança por uma função pequena (ex.: `logEventoSeguranca(evento, detalhes)`):
     login certo e errado, saída, cadastro, troca e redefinição de senha (pedida e concluída), troca de e-mail, mudança de
     MFA, permissão negada (401/403), ações de administração e troca de papel, limite atingido (429), eventos de
     pagamento e de webhook (inclusive assinatura que falhou), uploads, criação de chave de API e erros 5xx inesperados.
  2. Cada evento com hora UTC, nome, ID do usuário (se conhecido), IP, navegador, ID da requisição e resultado. O ID da
     requisição aparece na resposta de erro, para o relato do usuário achar a linha do log.
  3. Valores sensíveis mascarados em todo lugar (senha, token, cookie, cabeçalho de autorização, chave, cartão) e no
     rastreio de erros também; quebras de linha tiradas do que o usuário digitou, contra injeção no log.
  4. Alertas (ou o passo exato no provedor): mais de 10 logins errados por conta ou IP em 5 minutos; pico de
     401/403/429/5xx; administrador novo ou troca de papel; falha de assinatura de webhook.
  5. Prazo de guarda recomendado e acesso ao log só do time.
- **Entregar:** `SECURITY_RUNBOOK.md` de uma página: onde ficam os logs, como achar a atividade de um usuário, o que
  cada alerta significa e as 3 primeiras coisas a fazer quando um dispara.
**Feito quando:** eventos de segurança registrados com hora, usuário, IP e ID da requisição; nenhum segredo nem senha no
log ou no relatório de erro; alertas para força bruta, pico de erro e mudança de administrador; o roteiro de uma página existe.
**Cuidado:** log com dado pessoal demais vira problema de privacidade: registre IDs, não perfis inteiros. Log de console
de função serverless some rápido em algumas hospedagens: mande para um serviço de log com prazo de guarda.

## Revisão completa (roteiro 26)
Uma passada no app inteiro, como um atacante veria. Pega o que os itens isolados não pegam, principalmente falha de
regra de negócio do próprio app (reusar teste grátis, entrar no time de outro, pular uma etapa do fluxo).
**Antes de rodar:** depois dos outros itens, numa sessão nova, com o código inteiro e o modelo mais capaz disponível. Para ir
fundo (cobertura rastreada e verificador que tenta refutar cada achado), use a skill `/auditoria-completa`.

Papel: testador de invasão sênior fazendo a revisão completa antes do lançamento. Pense como atacante. **Não mude
código nesta etapa; primeiro o relatório.**
- **Fase 1 · superfície de ataque:** leia o código (e o `SECURITY_MAP.md`, se houver). Resuma: tecnologias,
  hospedagem, dados guardados (e o quanto são sensíveis), papéis, todo ponto de entrada (páginas, rotas, ações,
  funções, webhooks, tarefas agendadas, uploads, ferramentas de administração), serviços de terceiros e as fronteiras
  de confiança (o que o navegador controla × o que o servidor decide).
- **Fase 2 · cada área**, com o que foi checado e o que foi achado:
  1. Login: checagem no servidor em todo ponto de entrada, sessão, redefinição de senha, OAuth e redirecionamentos,
     MFA para administradores.
  2. Controle de acesso: IDOR em todo endereço com ID, rotas de administração, isolamento entre clientes e times,
     troca de papel.
  3. Segredos: pacote do navegador, variáveis de ambiente, histórico do git, logs, arquivos expostos.
  4. Dados: regras do banco e RLS, menor privilégio, campos sensíveis nas respostas, backups.
  5. Entradas: validação no servidor, atribuição em massa, injeção (SQL, NoSQL, comando), XSS (inclusive saída de IA),
     redirecionamento aberto, SSRF em toda função que busca URL, injeção em cabeçalho de e-mail.
  6. Arquivos: tipo, tamanho e conteúdo do upload; privacidade do armazenamento; como são servidos.
  7. Pagamento: preço calculado no servidor, webhook verificado, idempotência, direitos de acesso, cupons, corridas.
  8. Rede: HTTPS/HSTS, CORS, cabeçalhos de segurança, cookies, CSRF, limite de requisições (sobretudo nos pagos e de IA).
  9. Pacotes e implantação: dependência vulnerável ou suspeita, modo de depuração, vazamento em erro, source maps,
     versões de pré-visualização abertas.
  10. Regra de negócio: abuso de teste grátis, indicação, créditos, convites, cotas; transições de estado (dá para
      pular ou repetir etapa?), corridas, e o que for próprio deste app.
  11. IA (se houver): injeção de prompt por conteúdo do usuário ou documento, ações que o modelo dispara, vazamento de
      dado entre usuários, abuso de custo.
- **Fase 3 · relatório** `SECURITY_REVIEW.md`: resumo executivo em até 5 linhas; tabela de achados por gravidade (ID ·
  título · gravidade Crítico/Alto/Médio/Baixo · local arquivo:linha ou endereço · como o atacante exploraria, passo a
  passo · correção recomendada · esforço P/M/G); o que foi checado sem problema; o que **não deu para verificar** pelo
  código (painel, hospedagem), com os passos exatos para o usuário. Gravidade honesta, sem inflar nem esconder, com o
  grau de confiança de cada achado.
- Pare e espere a aprovação. Depois, corrija na ordem de gravidade, uma de cada vez, atualizando o status na tabela.

**Feito quando:** `SECURITY_REVIEW.md` existe com a tabela ordenada; todo Crítico e Alto está corrigido ou tem dono e
data; os itens "não deu para verificar" foram conferidos pelo usuário.
**Cuidado:** revisor de IA deixa passar e inventa. Para achado duvidoso, peça "mostre o código exato que prova isto".
Rode de novo depois de função grande e antes de todo lançamento importante.

## Testes de quebra e relatório final (roteiro 27)
Correção sem teste é palpite. Este passo transforma cada proteção num teste automatizado que tenta quebrá-la; se o
teste falha, corrige-se o código e roda-se de novo. Os testes ficam no repositório e rodam a cada publicação.
**Antes de rodar:** só em ambiente local ou de homologação; nunca teste destrutivo em produção nem com dado real.

Papel: engenheiro de segurança e líder de QA. Prove que as proteções funcionam, corrija o que não funcionar e entregue
o relatório final.
- **Regras:** contas de teste próprias (no mínimo: visitante sem login, usuário A, usuário B, administrador); testes
  reais e repetíveis no framework de testes do projeto (se não houver, crie um mínimo e explique como rodar).
- **Passo 1 · testes "tente quebrar"** para cada proteção que se aplica (os números são os itens de `itens.md`):
  S-web-1 sem login, todo endereço protegido devolve 401 · S-web-3 A não lê, altera nem apaga recurso de B (403/404) e
  a chave pública sozinha não lê nada privado · S-web-14 HTTP redireciona para HTTPS e há HSTS (só na URL de
  homologação ou produção) · S-web-2 senha guardada com Argon2id, bcrypt ou scrypt e nunca em log ou resposta ·
  S-web-7 entrada negativa, enorme, de tipo errado ou com campo a mais é recusada, e `"role":"admin"` é ignorado;
  textos de injeção devolvem resposta vazia ou 400 · S-web-4 textos de XSS aparecem como texto · S-12 login errado gera
  evento de log sem segredo · S-web-13 usuário comum recebe 403 em toda página e endereço de administração · S-1/S-2 o
  build de produção não tem padrão de segredo · S-web-15 a requisição N+1 devolve 429 · S-web-16 origem desconhecida não
  recebe Allow-Origin · S-web-17 todos os cabeçalhos de segurança presentes · S-web-5 cookie de sessão com HttpOnly,
  Secure e SameSite, e sessão encerrada é recusada · S-web-6 requisição que muda estado vinda de outra origem, sem
  token, é recusada · S-web-8 link de redefinição usado, vencido ou substituído falha, e e-mail real e falso recebem a
  mesma resposta · S-web-9 HTML disfarçado, SVG com script, arquivo grande demais e nome com `../` são recusados ·
  S-web-10 preço adulterado, quantidade negativa, cupom reusado, página de sucesso sem pagar e webhook sem assinatura
  ou repetido falham sem dano · S-11 resposta de erro sem pilha, caminho ou consulta · S-9 caminhos sensíveis devolvem
  404 · S-4 chave antiga é recusada (o usuário roda à mão; dê os comandos).
- **Passo 2 · corrigir e testar de novo:** para cada teste que falha, explique a causa, aplique a menor correção certa
  e rode até passar. **Não enfraqueça nem apague um teste para ele passar.**
- **Passo 3 · relatório** `SECURITY_REPORT.md`, no formato da §4 da skill: resumo (total; Passou; Corrigido e
  retestado; Aberto; Não se aplica; Só o usuário faz), tabela de todos os itens com a evidência (nome do teste ou
  comando), achados e correções, abertos com risco e próximo passo, ações que só o usuário faz, e como rodar os testes
  de segurança (recomende rodar no CI a cada envio).

**Feito quando:** há teste automatizado para toda proteção que se aplica; todos passam ou cada falha está listada como
aberta; o relatório resume achados, correções e abertos; os testes rodam no CI.
**Cuidado:** "corrigir" enfraquecendo o teste. Se um teste mudou, pergunte por quê. Teste verde não é app seguro: prova
o que testa. Repita a revisão completa conforme o app cresce.

## Incidente
Chave vazada, cobrança estranha, usuário relatando conta mexida, dado que mudou sozinho. Nesta ordem:
1. **Calma e evidência:** não apague logs, usuários nem o repositório. Anote o que viu e quando.
2. **Estancar:** troque as chaves expostas (`seguranca-segredos.md`, roteiro 25), primeiro pagamento, nuvem e banco.
   Ponha a função afetada em manutenção, se preciso.
3. **Derrubar sessões:** troque o segredo de sessão/JWT ou revogue as sessões; force redefinição de senha das contas
   afetadas.
4. **Investigar:** logs do app, do banco e dos painéis dos provedores: quando começou, o que foi acessado, quais contas.
5. **Fechar o buraco:** corrija, com teste que prova a correção (roteiro 27), e publique.
6. **Conferir os dados:** algo foi lido, alterado ou apagado? Os backups estão íntegros (`seguranca-extras.md`, B3)?
7. **Avisar:** dado pessoal afetado → `especialista-lgpd` no mesmo dia. A LGPD manda comunicar à ANPD e aos titulares
   o incidente com risco ou dano relevante (art. 48; https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm),
   no prazo da Resolução CD/ANPD 15/2024 (https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis).
   Peça validação de advogado ou do encarregado.
8. **Aprender:** pós-incidente curto: causa, impacto, correção e o que impede de novo.

**Chave vazando agora?** Revogue no painel do provedor imediatamente, mesmo antes de ter a substituta no ar, se for de
pagamento, nuvem ou IA: alguns minutos fora do ar custam menos que a alternativa. Depois siga o roteiro 25.

**Roteiro de resposta:** papel: responsável por resposta a incidente. "Acho que o app foi comprometido. O que vi:
[o quê, quando, o que foi estranho]." Ajude, nesta ordem: (1) contenção: as 3 primeiras ações nos próximos 15 minutos,
com os passos; (2) quais credenciais trocar primeiro, e como, sem derrubar o app sem necessidade; (3) onde olhar no
código, nos logs e nos painéis, com as consultas e filtros exatos; (4) a falha mais provável dado o código, com a
correção e um teste; (5) um resumo simples que o usuário possa adaptar para avisar os afetados. Não imprima segredo.
Pergunte antes de qualquer ação destrutiva.

## Manter seguro depois do lançamento
A tabela "mexeu em X, rode Y" fica na §6 da skill. Acrescente ao arquivo de regras do projeto (`CLAUDE.md`) uma seção
curta de segurança, para o código novo já nascer seguro. Exemplo: "Toda rota de API chama a checagem de usuário no
servidor e valida a entrada com um esquema. Nunca chave secreta no navegador. Nunca confiar em preço vindo do cliente.
Toda tabela nova nasce com RLS. Perguntar antes de adicionar pacote."
