# Revisão independente da 0.8.0, parte A (regras dos 2 checklists)

> **Situação atual: pode juntar NÃO** (3ª rodada, 2026-11-02, a última seção deste arquivo): 1 Bloqueante (B-2) e 2 Altos (A-4, A-5)
> abertos. A 2ª rodada vem antes dela, e o texto logo abaixo é da 1ª rodada.

**Pode publicar: NÃO.** Há 1 achado Alto aberto (A-1): a trava de segredo não vê o caso mais comum de commit de um agente,
`git add` e `git commit` no mesmo comando. Provado no Claude Code real: o segredo foi para o commit.

- Revisor: `revisor` (2026-11-01, 19h50 a 23h). Autor: `engenheiro-software`; correção jurídica: `especialista-lgpd`.
- Escopo: commits da parte A de 4a65baa a 58f7920 (4a65baa, ba26e3d, 948d75e, 128649a, 237e77d, 48677fc, 5f74b9b, b05d366,
  0976e2b, f1656cc, e5c872c, 5544502, 4a88def, 37221d9, cd8e5d7, 58f7920) e depois o 9fc1af7 (artigos de lei).
- Tudo rodou em cópias `git archive` no temp. A pasta de trabalho e o que está sem commit da parte B não foram tocados.

**O que está bom:** a bateria, os números do autor, os 5 status, a escolha de blocos pelo perfil, o protocolo comum, a
condensação de LGPD, marketing e compliance, a fidelidade aos PDFs e as marcas [HIPÓTESE] e [conferir]. O problema está
concentrado na trava (A-1, M-1 a M-4).

## Achados

| Id | Gravidade | Achado | Dono |
|---|---|---|---|
| A-1 | Alto | Trava não vê o que o comando ainda vai preparar, nem commit em outra pasta ou por caminho | `engenheiro-software` |
| M-1 | Médio | Commit grande passa com o segredo, sem aviso (tempo do gancho e limite de 64 MB) | `engenheiro-software` |
| M-2 | Médio | Exemplos legítimos bloqueados: marcador seguido de pontuação e chave de exemplo com "xxxx" | `engenheiro-software` |
| M-3 | Médio | CHANGELOG afirma que a árvore do plugin passa sem bloqueio; ela é bloqueada | `engenheiro-software` |
| M-4 | Médio | 6 dos 11 formatos de chave não têm teste: tirar qualquer um não derruba a bateria | `engenheiro-software` |
| b-1 | Baixo | Segredos que passam: ADO com a senha antes do servidor, `API_KEY=` sem aspas, secret da AWS sem o id | `engenheiro-software` |
| b-2 | Baixo | Alarmes à toa: UUID ou hash atribuído a `token` pergunta; " -a" no texto da mensagem faz varrer o não preparado | `engenheiro-software` |
| b-3 | Baixo | Nenhum teste protege a escolha de blocos por perfil nem o "sob demanda" da skill | `engenheiro-software` |
| b-4 | Baixo | A bateria quebra com `AGENTES_ULTIMATE_SEM_PASTA=1` no ambiente | `engenheiro-software` |
| b-5 | Baixo | A proposta `docs/regras-pdfs-2026-11.md` contradiz o que foi feito | `curador` |
| b-6 | Baixo | Condensação do `engenheiro-software` tirou do agente os campos do log; CHANGELOG e eval ainda os citam | `engenheiro-software` |
| b-7 | Baixo | Mensagens de commit não descrevem o conteúdo (5544502 e 9fc1af7) | `engenheiro-software` |

### A-1 · Alto · a trava não vê o que o comando ainda vai preparar
O gancho roda **antes** do comando e só lê `git diff --cached` (mais `git diff` com `-a`), na pasta da sessão.

| Comando, com segredo real de formato conhecido | Resultado |
|---|---|
| `git add novo.js && git commit -m x` | passa |
| `git add -A; git commit -m x` (PowerShell) | passa |
| `cd <repo> && git commit -m x`, de outra pasta | passa (lê a pasta errada) |
| `git -C <repo> commit -m x`, de outra pasta | passa (lê a pasta errada) |
| `git commit a.js -m x` e `git commit -m x -- a.js` | passa |
| `git commit --include a.js -m x` | passa |
| `git.exe commit -am x` | passa (nem é reconhecido como commit) |

**Prova real** (`claude -p`, Claude Code 2.1.302, plugin desta cópia, `AGENTES_ULTIMATE_SEM_PASTA=1`):
- controle, com o arquivo já preparado e `git commit -m x`: bloqueado, 1 commit no repositório;
- pedido `git add -A && git commit -m x`: **o arquivo com o segredo foi para o commit** (2 commits). O agente trocou o `&&`
  por `git add -A; if ($?) { git commit -m x }`, que é a mesma forma.

**Por que é Alto:** é a forma comum de um agente fazer commit, e `cd <pasta> && git` é o normal de subagente, porque a pasta
volta ao início a cada chamada. O README diz "o conteúdo do commit também é lido". A verificação de nome de arquivo
(`.env`, chaves) tem a mesma falha, que já existia antes da 0.8.0.

**Correção sugerida:**
- com `git add` no comando, varrer também `git diff -U0` e o conteúdo dos não rastreados que o add levaria;
- com `cd` ou `-C`, usar essa pasta;
- com caminho no commit, ler o caminho;
- aceitar `git.exe`;
- criar um caso para cada forma, visto falhando antes.

### M-1 · Médio · commit grande passa sem aviso
| Tamanho (árvore do MVP, segredo no último arquivo) | Diff | Tempo do gancho | Resultado |
|---|---|---|---|
| ×1 | 8,0 MB | 3,3 s | bloqueia |
| ×4 | 32,2 MB | 16,6 s | bloqueia só fora do Claude Code; o limite do gancho é 10 s |
| ×4 no `claude -p` real | 32,2 MB | | **segredo foi para o commit**, sem nenhum aviso |
| ×9 | 72,3 MB | 33 s | passa: acima do `maxBuffer` de 64 MB o diff vira vazio |

- [ESTIMATIVA: interpolação de ×1 e ×4] O limite de 10 s cai por volta de 20 a 25 MB de diff.
- É justamente o caso de "primeiro commit de um projeto existente".
- Custo quadrático em dois pontos:
  - `texto.slice(0, m.index).split('\n')` a cada achado: 20 mil linhas com `"token":` levam 11 s; 40 mil levam 48 s;
  - `.*?` do texto ADO: 105, 210 e 420 KB numa linha com `Host=a;` repetido levam 1,8 s, 6,7 s e 19,9 s.
- **Correção sugerida:** contar as linhas de uma vez só, limitar a janela do `.*?` e, ao passar de um teto de tamanho, **perguntar**
  ("grande demais para conferir"), em vez de passar calado. Perguntar não quebra a regra "erro interno não bloqueia".

### M-2 · Médio · exemplos legítimos são bloqueados
O pedido era que exemplo de README passasse. Passam `<senha>` em URL, `${VAR}`, `...`, `sk-...`, a chave de exemplo da AWS, e
`usuario:senha@` e `user:password@`. Bloqueiam (saída 2):
- **Marcador seguido de pontuação no texto de conexão ADO.** O grupo da senha também captura a crase ou o ponto seguinte, e o
  marcador deixa de casar. Em Markdown, o texto de conexão entre crases com `<senha>` ou `${DB_SENHA}` no lugar da senha é
  bloqueado, e também quando termina em ponto final. **A própria mensagem da trava manda usar esse marcador**, então quem
  obedece continua bloqueado.
- **Chave de exemplo só com "x".** Os prefixos da Anthropic, do GitHub e do Stripe seguidos de 24 a 40 caracteres "x" ou "X".
  Em chave de formato conhecido, o marcador é testado contra a chave inteira e nunca casa.
- **Exemplos de desenvolvimento.** URL do Postgres em `localhost` com usuário e senha "admin", e texto ADO com a senha "myPassword"
  (o exemplo clássico da documentação). Aqui cabe decidir: perguntar em vez de bloquear para `localhost` e para senha igual ao usuário.
  Esta descrição está em palavras porque o exemplo literal fez a trava nova bloquear este próprio relatório.

Passam, como pedido: hash (sha256, sha do git, integrity sha512), bcrypt em `password_hash`, base64 de imagem de 300 KB
(numa linha e em várias), UUID solto, o CHANGELOG inteiro, a proposta e os roteiros.

### M-3 · Médio · afirmação do CHANGELOG que não se reproduz
O CHANGELOG diz: "a árvore inteira do plugin (206 arquivos) [...] passam sem bloqueio nem pergunta". Na minha conferência:
- no 58f7920 (249 arquivos) e no 9fc1af7 (272): **bloqueia**, em `scripts/testar-hooks.js:936`;
- essa linha é o próprio caso de teste do falso positivo, com `\n` literal depois de `Password=…`: o `n` conta como letra da senha;
- o commit passou porque a versão instalada aqui é a 0.7.0, sem a leitura de conteúdo;
- a árvore do MVP passa: 671 arquivos, 8,0 MB, 3,1 s, 0 bloqueio. Essa parte confere.

**Correção sugerida:** resolver junto com M-2, refazer a medida e corrigir o texto. Sem isso, publicar o plugin num repositório novo
é bloqueado pela própria trava.

### M-4 · Médio · formatos de chave sem teste
Sem os padrões de OpenAI, Google, Slack, Stripe, npm ou Azure Storage, a bateria continua com 288 ok. Os 6 funcionam hoje, pelo
meu ataque com valor de formato real, mas uma edição do padrão quebra sem ninguém ver. Incluir 1 caso para cada um, mais o limite de
tamanho (uma letra a menos passa).

### Baixos
- **b-1:** segredos que passam:
  - texto ADO com a senha antes de `Server=`;
  - `API_KEY=valor` sem aspas fora de `.env`;
  - `aws_secret_access_key = ...` sem o id `AKIA`, porque `\bsecret` não casa depois de `_`.
- **b-2:** alarmes à toa:
  - UUID ou sha256 atribuído a `token` pergunta. Só pergunta, é aceitável;
  - a mensagem `-m "tira a flag -a do script"` ativa a varredura do que não vai no commit e bloqueia.
- **b-3:** os mutantes S2 (S-web sempre entra) e S3 (abrir todos os roteiros) escapam, porque os casos só olham palavras. O
  comportamento está certo hoje, nas 2 execuções reais (item 3 abaixo).
- **b-4:** com a variável no ambiente, o caso "memória do projeto criada" falha e a bateria aborta com ENOENT e pilha. Os testes
  deveriam tirá-la do `env` que passam aos ganchos.
- **b-5:** a proposta ainda diz:
  - "Só proposta. Nada do plugin foi alterado";
  - "Autoria: não aparece" e "autoria não identificada";
  - "Os 36 prompts do PDF B não entram no plugin, nem traduzidos", mas os roteiros em `referencias/` são tradução próxima dos prompts
    (comparei o 11 inteiro; o 24 e o 25 no início);
  - a regra de treino de IA continua como "não vale para dado antigo sem novo aviso", abrandada no 9fc1af7.

  Com a autoria do usuário, o uso é legítimo, mas o repositório público se contradiz. Falta registrar a decisão D-1 no topo.
- **b-6:** o commit 37221d9, feito para abrir espaço à parte B, resumiu a regra de log. Saíram do agente hora UTC, ID da requisição,
  resultado e cabeçalho de autorização. Também mudou "com teste que tenta quebrar" para "testados". O item S-12 do checklist mantém
  os campos, mas o caso 8 do eval e o texto G4 do CHANGELOG ainda os atribuem ao agente.
- **b-7:**
  - o 5544502, "G8 correção: H-5", traz também o vigia de fontes da parte B (625 linhas);
  - o 9fc1af7 diz "sem alteração de conteúdo", mas muda o conteúdo jurídico.

## Conferência, item a item

**1. Bateria e validadores: confere.**
- `git archive 58f7920`, sem cache: **288 ok, 0 falha**, em 2 min 43 s. O controle da mutação, em cópia nova, repetiu 288.
- `validar.js`: 30 agentes, 18 pacotes, 11 skills, 0 erro, 0 aviso.
- Bateria de 58f7920 sobre o código de 60cf275: 104 casos da 0.8.0, com 91 falhas. Uma delas é o carregamento da parte B, então
  são **90 de 103**, como o autor disse.
- Os 13 restantes são guardas legítimas de regressão.
- Sobre o nome do que foi testado: os 288 incluem os casos da parte B (`testar-referencias.js`).
- No 9fc1af7: **304 ok, 0 falha**, e `validar.js` 0 erro.

**2. Trava: é o ponto fraco desta revisão.**
- Chave de formato conhecido dentro de `.js`, `.ts`, `.py` e `.npmrc`: todas bloqueiam (OpenAI, Anthropic, GitHub clássico e
  fino, AWS, Google, Slack, Stripe, npm, Azure).
- PEM: PKCS8, RSA, EC, OPENSSH, ENCRYPTED e `\n` literal bloqueiam.
- Texto de conexão: `mysql://`, `mongodb+srv://`, ADO e ODBC bloqueiam.
- `-a`: `-am`, `-a -m`, `--all`, `-m x -a` e PowerShell bloqueiam; sem `-a`, o não preparado não conta.
- CRLF: bloqueia. Commit que só remove o segredo: passa.
- **Nunca mostra o valor:** nenhum vazamento em todos os casos.
- Falhas: A-1, M-1 a M-4, b-1 e b-2.
- Mutação nas partes alteradas (trava, validador, skill, revisor): **pegou 14 de 22**. Escaparam T1 a T6 (M-4), S2 e S3 (b-3).

**3. Skill: confere.** Execuções reais com `claude -p` (sonnet):
- Painel interno com dado de empregado: entram S, P, A, H, L; ficam fora S-web e C-venda. No item S-3, leu só o roteiro 24 e o contexto.
- Site público com login, upload e cobrança: entram S, S-web, P, A, H, L; avisou que C-venda não existe e chamou o `advogado-contratos`. No
  item S-web-9, leu só o roteiro 18 e o contexto.
- Os 5 status estão na skill e saíram no relatório.
- Todos os ids citados em "mexeu em X, rode Y" existem em `itens.md`.

**4. Revisor e teste enfraquecido: coerente.** Texto e caso 7 pedem a mesma coisa: comparar com a versão anterior, Alto, "não" até voltar.
Mutante R1 pego. Como os demais, o eval está como "não rodado".

**5. Fidelidade aos PDFs: 10 de 10 fiéis.**
| Item | Original | Resultado |
|---|---|---|
| P-3 | A 03 | fiel; ciência em lugar de consentimento |
| P-10 | A 04 | fiel; mesmo teste de versão |
| P-6 | A 13 | fiel; prazos trocados pelos da LGPD |
| P-8 | A 15 | fiel |
| A-1 | A 19 | fiel; WCAG 1.4.3 e 1.4.11 |
| H-8 | A 23 | fiel; mesmo teste de recarregar e trocar de aparelho |
| S-2 e roteiro 11 | B 11 | fiel; comparados linha a linha |
| S-3 | B 24 | fiel; todas as branches e tags |
| S-4 | B 25 | fiel; mesma ordem |
| S-11 | B 20 | fiel; código de referência |

- A adaptação ao Brasil troca GDPR, CCPA e FTC por LGPD e CDC, sem levar regra estrangeira como se fosse local.
- "Não se aplica a painel interno" faz sentido: S-web quase nunca entra; P-11 tira banner de cookie, aviso ao público e consentimento
  de marketing, mantendo minimização e RLS; o CDC não se aplica a empregado, mas H-2 continua valendo.

**6. Agentes alterados: confere, com b-6.**
- Protocolo comum: 30 de 30 idênticos, por hash da seção.
- `gerar-agentes.js` não muda nada em `agents/`.
- `validar.js` sem aviso de 90 linhas; maior parte específica em 87 linhas.
- Texto antes e depois: LGPD, marketing e compliance não perderam regra. Saíram frases de motivo, referências repetidas e a "origem" de
  um erro conhecido. "Preliminar" e "data-limite calculada" continuam no passo 5 do método.
- Motiva: nada na parte A. As menções em `plano-0.7.md`, `revisao-0.7.0.md` e `testar-hooks.js` (nome fictício de teste) já existiam.
- Os PDFs não estão no git.

**7. [conferir] e [HIPÓTESE]: confere, inclusive no 9fc1af7.**
- Sobram 3 [HIPÓTESE] no checklist (Marco Civil e LBI para ferramenta interna; ausência de lei de rótulo de IA), e NBR 17225 [conferir]
  no checklist e no `designer-paineis`. Todas visíveis no ponto de uso, e a skill avisa que vão ao jurídico antes de valer.
- Testes alterados pelo 9fc1af7: não são teste enfraquecido. Trocam "tem [conferir]" por "tem o artigo e não tem [conferir]".
- As correções batem com o que o aviso descreveu (art. 19 só para confirmação e acesso; art. 39; MP 2.200-2; ECA Digital; Resolução 19/2024).
- **Não verificado por mim:** os artigos no texto oficial. `planalto.gov.br` não respondeu daqui (tempo esgotado e conexão encerrada).
  A situação do PL 2338/2023 confere na página da Câmara ("Aguardando Parecer do(a) Relator(a) na Comissão Especial").
- O 9fc1af7 registra que 3 edições do marketing foram apagadas por um `git checkout --` da frente B e repostas. Conferi só o resultado:
  o texto final de marketing está coerente.

## Lista do usuário (depois de corrigir A-1)
1. Confirme que os 2 PDFs são seus (decisão D-1): é o que permite os roteiros traduzidos num plugin público.
2. Numa sessão com a nova versão, peça um commit com `git add` e `git commit` juntos, com um arquivo de chave falsa: deve bloquear e dizer
   arquivo e linha, sem mostrar o valor.
3. Peça um commit de um README com um texto de conexão de exemplo entre crases, com `<senha>`: deve passar.
4. Dê um `git push` de teste e recuse: a pergunta deve lembrar o `/checklist-lancamento`.
5. Rode `/checklist-lancamento` num painel de verdade e diga se as perguntas e o relatório fazem sentido no seu dia a dia.

Placar: autor=engenheiro-software cod=sem-codigo veredito=não B=0 A=1 M=4 b=7 ids=A-1,M-1,M-2,M-3,M-4,b-1,b-2,b-3,b-4,b-5,b-6,b-7

## 2ª rodada (2026-11-02)

**Pode publicar: NÃO.**
- **Bloqueante B-1:** a correção do A-1 faz a trava rodar texto do comando antes da permissão. No Claude Code real, a permissão foi
  negada e o comando embutido rodou mesmo assim.
- **Alto A-2:** a mesma correção abriu um furo novo. `git commit -m x 2>&1`, forma comum de agente, era barrado e agora leva o segredo.
- **Alto A-3:** arquivo com acento no nome não é lido quando o `git add` vai no mesmo comando.

As 8 formas pedidas no A-1 estão barradas. O que foi corrigido em M-2, M-3, M-4, b-2, b-3, b-4, b-5, b-7 e no `windowsHide` se sustenta.

- Revisor: `revisor`. Revisado: cópia `git archive` do 9974b28, que era o HEAD no início. O HEAD atual, 71eacea, não muda `hooks/travas.js`,
  `scripts/testar-travas.js` nem `scripts/chamadas-processo.js`. Comparação com o código anterior: 13d4afd.
- Bateria sem cache: 383 ok, 0 falha. Com `AGENTES_ULTIMATE_SEM_PASTA=1`: 383 ok, 0 falha. `validar.js`: 0 erro, 0 aviso.
- A bateria passa com tudo isso aberto: nenhum caso dela cobre as formas abaixo.

### Passe de veredito
| Id | Veredito | Prova |
|---|---|---|
| A-1 | **parcial** | As 8 formas pedidas: barradas no gancho e, em 7 delas, no `claude -p`. Restam 11 formas em que o segredo entra (tabela abaixo) |
| M-1 | **parcial** | 32 MB e 72 MB perguntam, sem passar calado. Se o gancho passa de 10 s, o segredo ainda entra sem aviso (2 provas reais) |
| M-2 | resolvido | Marcador com crase, ponto e parêntese e chave só com "x" passam; `localhost` e `myPassword` perguntam. Efeito colateral em b-8 |
| M-3 | resolvido | Árvore inteira do HEAD num repositório novo (297 arquivos): passa, sem bloqueio nem pergunta, em 3,4 s (preparada) e 7,3 s (`git add -A`, máquina ocupada). CHANGELOG corrigido |
| M-4 | resolvido | Tirar cada um dos 6 formatos derruba a bateria da trava: pegou 6 de 6 |
| b-1 | **parcial** | ADO com a senha antes do servidor bloqueia e `API_KEY=` pergunta. Sem aspas, `aws_secret_access_key` e `api_key` minúsculo passam; o caso do autor só testou com aspas |
| b-2 | resolvido | "-a" no texto da mensagem não varre o não preparado. UUID atribuído a `token` só pergunta, como aceito |
| b-3 | resolvido | Os 2 casos existem e passam. Conferem o texto da skill, não o comportamento |
| b-4 | resolvido | 383 ok com a variável no ambiente |
| b-5 | resolvido | Registro no topo da proposta. A confirmação de autoria do usuário não é verificável por mim (lista do usuário) |
| b-6 | **parcial** | O eval aponta para o S-12, com a frase repetida. O G4 do CHANGELOG ainda atribui os campos ao agente, e o agente não cita S-12 nem os campos: o caso 8 cobra o que ele não tem |
| b-7 | resolvido | O CHANGELOG explica as 2 mensagens, sem reescrever o histórico |

### Achados abertos
| Id | Gravidade | Achado | Dono |
|---|---|---|---|
| B-1 | Bloqueante | O gancho roda texto do comando avaliado, antes da permissão (regressão) | `engenheiro-software` |
| A-1 | Alto | Ainda há formas de preparar ou commitar que a trava não vê | `engenheiro-software` |
| A-2 | Alto | Redirecionamento e prefixo antes do `git` fazem o commit passar (regressão) | `engenheiro-software` |
| A-3 | Alto | Nome de arquivo com acento: conteúdo e nome sensível não são lidos | `engenheiro-software` |
| M-1 | Médio | Gancho acima de 10 s é encerrado e o commit segue sem aviso | `engenheiro-software` |
| M-5 | Médio | 6 mutantes reais escapam da bateria da trava | `engenheiro-software` |
| b-1 | Baixo | Segredo sem aspas em minúsculas passa, inclusive no formato do arquivo de credenciais da AWS | `engenheiro-software` |
| b-6 | Baixo | Campos do log: CHANGELOG e eval não batem com o agente | `engenheiro-software` |
| b-8 | Baixo | Afrouxamentos do M-2: 3 casos de senha real (regressão) | `engenheiro-software` |
| b-9 | Baixo | `windowsHide`: furos do detector e 6 chamadas fora do que ele olha | `engenheiro-software` |

### B-1 · Bloqueante · a trava roda texto do comando
`conteudoDoCommit` monta a linha com `JSON.stringify` e chama `execSync`, que passa pelo `cmd.exe`. Aspas dentro de um caminho encerram o texto, e o que vem depois vira comando.

Prova no Claude Code real, sem permissão para a ferramenta Bash, com o comando `` git commit -m x 'q" & echo pego > INJETADO.txt & "' ``:
- retorno da ferramenta: "This command requires approval", com o comando na lista de negados e nenhum commit;
- **o arquivo `INJETADO.txt` foi criado**, e o agente relatou que nada tinha sido criado;
- o gancho sozinho, em `git commit` e em `git add`, cria o arquivo; com caminho comum, não. Na versão 13d4afd essas chamadas não recebiam texto do comando.

**Por que é Bloqueante:** quem consegue propor um comando, por exemplo por injeção de prompt, roda o que quiser sem a pergunta de permissão.

[HIPÓTESE, não testada aqui] Em Linux e macOS, `$(...)` no caminho também executa, porque continua entre aspas duplas. A marca de "pergunta" não impede: o texto é usado antes de a pergunta sair.

**Correção sugerida:** `execFileSync('git', [args])`, sem shell, e um caso para aspas no caminho de `git add` e de `git commit`.

### A-2 · Alto · redirecionamento e prefixo (regressão)
O leitor de comando novo trata `2>` como caminho do commit, então o `git diff` olha um caminho que não existe e volta vazio. Ele também só reconhece o `git` como primeira palavra. As 10 formas abaixo eram barradas no 13d4afd com o arquivo preparado e agora passam, conferidas rodando o comando de verdade:

- `git commit -m x 2>&1`, `2>/dev/null`, `> log.txt` e `2>&1 | tail -3`;
- `VAR=x git commit`, `env git commit`, `command git commit`, `if git commit ...`, `timeout 60 git commit`, `! git commit`.

Com `git add` junto, também passam `git add -A 2>&1 && git commit -m x 2>&1`, `git add -A > /dev/null && git commit -m x` e `git add -A && if true; then git commit -m x; fi` (estas 3 já passavam antes).

**Prova no `claude -p`:** `git commit -m x 2>&1`, `git add -A 2>&1 && git commit -m x 2>&1` e `GIT_AUTHOR_NAME=x git commit -m x` levaram o segredo para o commit.

**Correção sugerida:** tirar redirecionamentos na leitura e achar o `git` depois de atribuições, `env`, `command`, `if`, `then`, `!` e `timeout`. **Na dúvida, perguntar:** se a palavra `commit` aparece e o plano não reconheceu nenhum commit, a trava não pode ficar calada.

### A-3 · Alto · nome com acento
`git ls-files` e `git diff --name-only` devolvem nome com acento entre aspas e em octal (`"configura\303\247..."`), por causa do padrão `core.quotepath`. O `statSync` falha, o `catch` engole o erro e o arquivo não é lido. O nome sensível também não casa, porque sobra a aspa no fim.

| Caso, com `git add -A && git commit -m x` (ou o nome no add) | Resultado |
|---|---|
| Arquivo `configuração.js` | segredo no commit |
| Arquivo em pasta `área/` | segredo no commit |
| `.env` em pasta `área/` | arquivo no commit |

**Prova no `claude -p`:** o segredo foi para o commit. Em projeto em português isso é comum.

**Correção sugerida:** usar `-z` nas listas de nomes (ou `core.quotepath=false`) e tratar o `+++` com aspas do diff. Se não conseguir ler o arquivo, perguntar em vez de ignorar.

### A-1 · o que resta
Todas com o segredo no commit, rodando o comando de verdade (11 formas):
| Forma | Causa |
|---|---|
| `git -C sub add . && git commit`, `cd sub && git add . && cd .. && git commit`, `git add -A && cd sub && git commit` | o add só conta se foi na mesma pasta do commit |
| `Push-Location <repo>; git commit` | só `cd`, `chdir`, `Set-Location`, `sl` e `pushd` são lidos |
| `cd /pasta\ com\ espaco && git commit` | a barra antes do espaço não é lida, a pasta não existe e o erro vira "sem conteúdo" |
| `echo novo.js \| xargs git add && git commit` | `xargs` não é lido |
| `git -c alias.k=commit k -am x`, `git config alias.ci commit && git ci -am x` | alias não é lido |
| `eval "git add -A && git commit -m x"` | `eval` não é lido |
| `git add -f build && git commit` | pasta ignorada forçada: só o nome da pasta é tentado |
| Heredoc com `&& git add -A && git commit` na mesma linha do `<<EOF` | o resto da linha sai junto com o heredoc |

**`git add -A && git commit -m x && git push`:** a trava só pergunta sobre publicar, sem ler o commit, porque a checagem de push vem antes. Quem confirma envia o segredo. Já era assim no 13d4afd, mas é a forma mais grave: ler o commit antes da pergunta de push.

### M-1 · o gancho ainda pode estourar 10 s
| Tamanho (árvore do MVP, segredo no último arquivo) | Gancho | Resultado |
|---|---|---|
| ×1, 8,0 MB | 3,6 s | bloqueia |
| ×2, 16,1 MB | 6,8 s | bloqueia |
| ×3, 24,1 MB | 7,3 s | pergunta |
| ×4, 32,2 MB | 7,4 s | pergunta; no `claude -p`, nada foi para o commit |
| ×9, 72,3 MB | 8,3 s | pergunta; no `claude -p`, nada foi para o commit |

O caso medido na 1ª rodada está resolvido. Os prazos não cobrem operações que não podem ser interrompidas:
- **Arquivo novo recém-escrito.** Nesta máquina, a 1ª leitura de um arquivo de 5 MB com texto de código levou 176 e 204 s, e a 2ª levou 0,00 s. A causa provável é o antivírus [HIPÓTESE: o tempo medido é da leitura; o antivírus como causa não foi confirmado]. O `readFileSync` trava o gancho. **No `claude -p`, com `git add -A && git commit`, o segredo foi para o commit.** Com 1 MB, a mesma leitura levou 9,8 s.
- **Linha única de 23 MB com `Host=a;`:** o gancho leva 12,0 s, porque o prazo só é conferido entre regras. **No `claude -p`, o segredo foi para o commit.** Esse arquivo é improvável; o caso prova o mecanismo.

**Correção sugerida:** rodar a leitura num processo filho com prazo, e o pai pergunta quando o prazo vence.

### M-5 · mutação na trava: pegou 18 de 26
- Mutação geral em `hooks/travas.js`: 12 de 20. Formatos de chave: 6 de 6. Controle sem mudança: 56 ok.
- **Escaparam, e são reais (6):**
  - `git add -f` ignorado;
  - `git add -u` levando não rastreado;
  - estouro do buffer sem marcar leitura incompleta: é o caminho acima de 25 MB, nenhum caso passa dele;
  - prazo de leitura ignorado;
  - número da linha errado na mensagem;
  - heredoc sem tratamento: o caso existente põe o texto depois do commit e passaria de qualquer jeito.
- **Escaparam, mas não são defeito (2):** `--include` ignorado, porque o caminho é lido do mesmo jeito; e o filtro de pasta do add removido, que é justamente a direção da correção do A-1.

### Baixos novos
- **b-8 (regressão do M-2),** todos barrados no 13d4afd:
  - senha que começa com barra invertida agora **passa**, porque `limpaValor` corta tudo depois da barra e sobra vazio;
  - `@localhost.empresa.com` só pergunta, porque o nome é testado só pelo começo;
  - servidor real com `localhost` em outro ponto da linha só pergunta.
  - Senha que começa com `$` passa, mas já passava antes.
- **b-9 (`windowsHide`),** ver abaixo.

### `windowsHide`
- **Em `hooks/` e `scripts/`, nenhuma chamada ficou sem a opção.** Conferi de 2 jeitos:
  - detector sobre a árvore inteira: 0 nessas pastas;
  - registro em tempo de execução com a bateria inteira, envolvendo `child_process`: 0 chamadas sem a opção. O registro acusou a chamada sem a opção no controle positivo. Ele só vê processos que herdam `NODE_OPTIONS`. Com ele ligado, 2 casos do abrir sozinho falham (381 ok); sem ele, 383 ok. Atribuo a falha ao registro.
- **A regra falha sem a opção:** tirar a opção de `travas.js`, `checar-ferramenta.js` e `grafo.js` dá erro no `validar.js`, com arquivo e linha. Subpasta de `scripts/` também é varrida.
- **Furos do detector (b-9):**
  - aceita `windowsHide: false`, a palavra em comentário e a palavra em texto;
  - não vê `require('child_process').exec(`, nem função renomeada;
  - pula sem aviso quando não acha o fechamento da chamada: apóstrofo em comentário ou parêntese em regex;
  - não olha `modelos/` nem `ferramentas/`: há 6 chamadas sem a opção em `ferramentas/teardown` (`scripts/check-viewer.cjs`, `commands.cjs`, `proof.cjs`), que podem abrir janela no Windows quando a ferramenta roda [HIPÓTESE, não testada]. O detector também aponta `assets/flipbook.js`, mas ali `spawn` é função local, não processo.

### Regressões causadas pelas correções
1. **B-1:** a trava executa texto do comando (A-1, 6d566bc).
2. **A-2:** 10 formas barradas antes passam agora (A-1, 6d566bc).
3. **b-8:** 3 casos de senha real ficaram mais fracos (M-2, 9fd2b43).

### Não verificado
- Linux e macOS: tudo rodou no Windows.
- A autoria dos PDFs (b-5).
- A causa do tempo de leitura (antivírus).

### Lista do usuário (depois de corrigir B-1, A-1, A-2 e A-3)
1. Confirme que os 2 PDFs são seus (D-1): o registro diz que sim, e eu não tenho como conferir.
2. Numa sessão com a nova versão, peça um commit com `git add -A`, `2>&1` e um arquivo de chave falsa com acento no nome: deve bloquear, dizer arquivo e linha, e não mostrar o valor.
3. Peça `git add -A && git commit -m x && git push` com essa chave falsa: deve bloquear pelo segredo, antes de perguntar sobre publicar.
4. Peça um commit de um README com um texto de conexão de exemplo entre crases, com `<senha>`: deve passar.
5. Rode `/checklist-lancamento` num painel de verdade e diga se as perguntas e o relatório fazem sentido no seu dia a dia.

Placar: autor=engenheiro-software cod=sem-codigo veredito=não B=1 A=3 M=2 b=4 ids=B-1,A-1,A-2,A-3,M-1,M-5,b-1,b-6,b-8,b-9

## 3ª rodada (2026-11-02): a trava em 3 barreiras e os lotes 7 a 11

**Pode juntar: NÃO.**
- **Bloqueante B-2:** a trava roda programa da configuração de um repositório de **outra pasta** citada no comando. No Claude Code
  real, com a ferramenta negada, o programa rodou antes da permissão. É a mesma classe do B-1 por outro caminho: o B-1 em si (texto do
  comando) está fechado.
- **Alto A-4:** commit e push no **mesmo comando** levam o segredo ao remoto só com a pergunta genérica de publicar. Isso inclui uma forma
  da lista "lida com certeza". Também passam, sem nenhuma pergunta, um script que faz commit e push e o `gh repo create --push`.
- **Alto A-5:** o verificador novo passa o nome do arquivo editado por um shell. No Windows, `%VAR%` no nome é expandido (provado). Em
  Linux e macOS, `$(...)` no nome rodaria um comando sem a permissão do Bash [HIPÓTESE pelo mecanismo, sem Linux aqui]. A skill
  `integracoes` ensina essa configuração.

O que o autor afirmou e se sustenta: o texto do comando não é mais executado (16 formas, 0 arquivo criado, com controle positivo);
`git commit -m "x"` e a forma padrão do Claude Code passam sem pergunta; A-1, A-2, A-3, M-1, b-1, b-6 e b-8 fechados; licença e marcação
dos 69 guias do strix; nada da Motiva nos commits novos.

- Revisor: `revisor`, código rv87 (manhã de 2026-11-02: bateria às 06h30, fim às 08h15). Autor: `engenheiro-software`, código tr86.
- Revisado: cópia `git archive` do a13ea41 (HEAD; inclui dbfd0c3, a trava refeita, e 56de65b..097a9fb, os lotes 7 a 11). Comparação: 82458d9.
- Bateria sem cache, na cópia: **481 ok, 0 falha** (06h30 a 06h54, com a máquina ocupada pelas minhas sondas). O autor citou 475; a
  diferença são os 6 casos do a13ea41. `validar.js`: 0 erro, 0 aviso. `claude plugin validate`: ok.
- **A bateria passa com tudo isso aberto:** a tabela das formas não reproduz o fluxo real (M-7).
- Os testes rodaram em cópias e repositórios do temp. Nada foi executado no repositório do autor além de leitura e do commit deste
  relatório.

### Passe de veredito (achados da 2ª rodada)
| Id | Veredito | Prova |
|---|---|---|
| B-1 | resolvido | 16 formas de injeção (aspas no caminho, `$()`, crases, `;` no caminho, `-c core.fsmonitor`, `-c diff.external`, filtro e textconv, `GIT_EXTERNAL_DIFF=`, `--exec-path`, PowerShell `& { }` e `$()`, pathspec com atributo) pelos ganchos antes e depois: 0 arquivo criado; o mesmo texto num shell de verdade cria (controle). No `claude -p` (refeito às 08h, depois que o limite de uso voltou), com a ferramenta negada: o `INJETADO.txt` não foi criado. O próprio Claude Code também recusou o comando por erro de leitura do PowerShell. **Outro caminho de execução: B-2** |
| A-1 | resolvido | As 11 formas da 2ª rodada perguntam ou são lidas (tabela do autor na bateria; `cd` com espaço escapado refeito por mim no fluxo real: pergunta) |
| A-2 | resolvido | `git commit -m x 2>&1`, `GIT_AUTHOR_NAME=x git commit` e `timeout 60 git commit`, com a chave preparada: bloqueiam |
| A-3 | resolvido | `configuração.js` e `.env` em `área/`, com `git add -A && git commit`: bloqueiam |
| M-1 | resolvido | Linha única de 23 MB com `Host=a;`: pergunta em 7,4 s (era 12 s, e o segredo entrava). Prazo forçado de 1 ms: o antes pergunta e o depois avisa "não deu para conferir". A leitura lenta do antivírus não se reproduz sob demanda; o mecanismo é o do prazo forçado |
| M-5 | **não verificado** | Os 6 casos do a13ea41 existem e passam. A mutação parou no 3º mutante (falta de memória, ver "Mutação") |
| b-1 | resolvido | `aws_secret_access_key = <40>` sem aspas, no formato do arquivo de credenciais: bloqueia; `api_key=` minúsculo: pergunta |
| b-6 | resolvido | O agente tem o passo 8 com os campos e o S-12; o eval cobra os mesmos campos |
| b-8 | resolvido | Senha com barra invertida, `localhost.empresa.com` e "localhost" no comentário: bloqueiam. `localhost` de verdade pergunta e `<senha>` passa (controles) |
| b-9 | resolvido | 10 de 12 casos meus: `windowsHide: false`, opção só em comentário ou em texto, `require(...).exec`, função renomeada, objeto do módulo, parêntese em regex e apóstrofo em comentário são acusados. Escapam 2 bordas sem uso hoje: `import * as cp` (ESM) e método guardado em variável |

### Achados abertos
| Id | Gravidade | Achado | Dono |
|---|---|---|---|
| B-2 | Bloqueante | Ganchos rodam programa da configuração de repositório de outra pasta, antes da permissão | `engenheiro-software` |
| A-4 | Alto | Commit e push no mesmo comando: a barreira do push lê antes de o commit existir; `gh ... --push` e script não passam por ela | `engenheiro-software` |
| A-5 | Alto | Verificador passa o nome do arquivo editado por um shell | `engenheiro-software` |
| M-6 | Médio | Comando que falha não dispara a barreira de depois (`PostToolUseFailure`) | `engenheiro-software` |
| M-7 | Médio | A tabela das formas mede o depois e o push num fluxo que o Claude Code não usa; a afirmação "todas avisam depois e barram no push" é falsa no fluxo real | `engenheiro-software` |
| M-8 | Médio | Arquivo em UTF-16 passa pelas 3 barreiras | `engenheiro-software` |
| M-9 | Médio | 13 de 25 formas comuns sem segredo perguntam | `engenheiro-software`; quais formas entram: usuário |
| M-10 | Médio | `.env.example` é bloqueado, e o checklist do próprio plugin manda criá-lo | `engenheiro-software` |
| M-11 | Médio | No 1º push de um projeto com histórico, a barreira do push não termina no prazo e vira a pergunta genérica | `engenheiro-software` |
| b-10 | Baixo | `com$'mit'` (aspas ANSI-C) não é visto como commit: com pasta em variável, nenhuma pergunta e nenhum aviso | `engenheiro-software` |
| b-11 | Baixo | `retomar.js` no `SessionEnd`: "Hook cancelled" em 3 de 4 rodadas do `claude -p` com o plugin | `engenheiro-software` |
| b-12 | Baixo | O depois custa cerca de 0,4 s em todo comando de shell | `engenheiro-software` |

### B-2 · Bloqueante · a configuração de outra pasta roda antes da permissão
A trava roda `git log -p` na pasta citada por `cd`, `-C`, `pushd` ou `Set-Location`, para ler os commits não enviados. O depois roda
`git rev-parse` e `git log` nessas pastas em **todo** comando. Esses `git` usam a configuração do repositório daquela pasta. As opções
de proteção (`core.fsmonitor=false`, `--no-ext-diff`, `--no-textconv`) não cobrem `log.showSignature` com `gpg.program`, que faz o git
chamar um programa para conferir a assinatura de um commit.

Montei um repositório "baixado" com `log.showSignature=true`, `gpg.program` apontando para um script que grava uma marca, e um commit
com cabeçalho de assinatura falso.

| Gancho e comando (sessão em outra pasta) | Programa da outra pasta rodou? |
|---|---|
| antes, `cd "<X>" && git push` | **sim** |
| antes, `git -C "<X>" push` | **sim** |
| antes, `cd "<X>" && git commit -m x` | não: commit em outra pasta só pergunta, sem ler |
| depois, `cd "<X>" && ls` (comando comum, já aprovado) | **sim** |
| `core.fsmonitor` com o mesmo script, nas 4 formas | não (a proteção funciona) |

**Prova no Claude Code real** (2.1.302, `claude -p` com haiku, plugin da cópia, os plugins instalados desligados, sem permissão para a
ferramenta), comando `git -C "<X>" push`:
- a ferramenta foi negada (`permission_denials`, "publicar é visível a outros...") e o push não rodou;
- **a marca foi criada**, com os argumentos do git ("--status-fd=1 --verify ...");
- controle: o mesmo pedido sem o plugin não criou a marca.

**Por que é Bloqueante:** o autor escreveu no CHANGELOG que rodar git em outro repositório antes da permissão "usaria a configuração
dele (filtros do git executam programa)", e por isso o commit em outra pasta pergunta. O push e o depois fazem exatamente isso. Uma pasta
com `.git` vinda de fora (zip ou pasta compartilhada) roda o que quiser quando o agente só cita a pasta. Sem o plugin (controle), a marca não
foi criada. A lista de chaves que rodam programa é aberta (`gpg.ssh.program`, `gpg.x509.program`, `trace2.*` grava arquivo),
então acrescentar `-c log.showSignature=false` fecha este caso e não fecha a classe.

**Correção sugerida:** git só na pasta da sessão e nas subpastas dela. Fora dela, o antes e o push perguntam **sem ler** e dizem "não
conferido: pasta fora da sessão"; o depois não roda git lá. Caso que prova: o mesmo repositório com a marca, nos 3 caminhos.

### A-4 · Alto · commit e push no mesmo comando
A barreira do push lê os commits não enviados **antes** de o comando rodar. Se o mesmo comando cria o commit, a leitura não o vê.
Remoto local (repositório nu no temp), o comando rodado de verdade:

| Comando | Pergunta antes | Remoto | Depois |
|---|---|---|---|
| `echo '<chave>' >> a.js && git commit -am x && git push` (forma "simples") | só "publicar é visível a outros" | **segredo no remoto** | "Desfaça ANTES do push" |
| `git ci -am x && git push` (alias que já existia) | só "publicar" | **segredo no remoto** | idem |
| `sh salvar.sh && git push` (script com o commit) | só "publicar" | **segredo no remoto** | idem |
| `eval "git add -A && git commit ..." && git push` | genérica + "publicar" | **segredo no remoto** | idem |
| `sh deploy.sh` (script com commit e push) | **nenhuma** | **segredo no remoto** | idem |
| `gh repo create teste --private --source=. --push` | **nenhuma** (só a decisão da trava; não rodei) | - | - |

- **A 1ª linha é da lista "lida com certeza".** O leitor trata `echo ... > arquivo` como leitura, então não vê que o comando escreve o
  arquivo que o commit vai levar. Sem push no mesmo comando, só o depois pega (`printf > novo.js`, `echo > .env`: avisa).
- O limite declarado ("script, alias e palavra montada são vistos depois e no push") só vale quando o push é outro comando.
- O aviso de depois manda "Desfaça ANTES do push" e "Não publique" quando já foi publicado.
- `gh repo create --push` não tem a palavra `git`, então não passa nem pela pergunta de publicar, que o plugin manda fazer sempre.

**Correção sugerida:** push no mesmo comando de qualquer forma que não seja "simples" bloqueia, com a instrução de separar o commit e o
push. Redirecionamento com destino de arquivo, antes de um commit, deixa a forma incerta. `gh ... --push` e `gh repo create` entram na
barreira. O depois confere se o commit já está num remoto e, se estiver, diz "já publicado: troque o segredo".

### A-5 · Alto · verificador passa o nome do arquivo por um shell
`hooks/verificador.js` monta `comando.replace('{arquivo}', '"' + rel + '"')` e roda com `shell: true`. O nome vem do `file_path` da
ferramenta Write ou Edit.
- **Provado no Windows:** com o arquivo `x%USERNAME%.js`, o verificador recebeu `x18-112089.js`. O nome passa pelo `cmd.exe`, e o
  verificador confere o arquivo errado.
- **Em Linux e macOS** [HIPÓTESE, sem Linux nesta máquina]: o Node usa `/bin/sh -c`, e aspas duplas não impedem `$(...)` nem crases.
  Um arquivo `a$(curl ...|sh).js`, criado pela ferramenta Write, rodaria o comando sem passar pela permissão do Bash. Esse é o caminho de
  quem consegue injetar um pedido.
- Só vale com `verificador.comando` configurado com `{arquivo}`. É exatamente o que a skill `integracoes` ensina para o detector de
  interface. É a mesma lição do B-1, registrada em `APRENDIZADOS.md`.

**Correção sugerida:** comando em lista (`["node", "detector.js", "{arquivo}"]`), rodado com `execFile`, sem shell, e o nome como
argumento. Caso que prova: um nome com `%VAR%` (Windows) e com `$(...)` (onde houver sh) chega literal.

### M-6 · Médio · comando que falha não passa pela barreira de depois
Sonda no Claude Code 2.1.302, com um plugin que só registra eventos: `echo um` gerou `PostToolUse`; `echo dois; exit 3` gerou
**`PostToolUseFailure`**, e não `PostToolUse`. O `hooks.json` só liga o `trava-depois.js` no `PostToolUse`. Todo comando que faz o commit
e depois falha (`... && npm test` vermelho, `... && git push` sem remoto, script que sai com erro) fica sem o aviso. O push separado
ainda barra, se for no repositório da sessão.

**Correção sugerida:** ligar o mesmo gancho em `PostToolUseFailure`, com um caso que rode um comando que commita e sai 1.

### M-7 · Médio · a tabela das formas não mede o fluxo real
`scripts/testar-travas-formas.js`:
- chama o depois com `cwd` = pasta do repositório, também nos casos "de fora", em que o Claude Code manda a pasta da sessão;
- confere o push com `git push origin main` rodado na pasta do repositório, e não do jeito que o agente chegaria lá;
- tira `&& git push` do comando antes de rodar, e nenhum caso falha depois do commit.

No fluxo real (sessão em outra pasta, o mesmo comando no depois, o push feito do mesmo jeito que o commit):

| Forma | Antes | Depois | Push |
|---|---|---|---|
| `cd /pasta\ com\ espaco && git commit` (é a F5 da tabela) | pergunta | **calado** | **só "publicar"** |
| `D="<R>"; cd "$D" && git add -A && git commit` | pergunta | **calado** | **só "publicar"** |
| `D="<R>"; cd "$D" && git com$'mit' -am x` | **passa** | **calado** | **só "publicar"** |

A tabela marca a F5 como "avisa depois e barra no push". A frase do CHANGELOG e do commit dbfd0c3, "todas as 19 avisam depois do comando
e barram no push", não vale no Claude Code.

**Correção sugerida:** a tabela usa o `cwd` da sessão no depois e no push, roda o push do mesmo jeito que o commit, mantém o `&& git push`
contra um remoto local e tem um caso que falha depois do commit.

### M-8 · Médio · arquivo em UTF-16 passa pelas 3 barreiras
O leitor pula conteúdo binário (byte zero nos primeiros 8 KB, ou "Binary files" no diff). UTF-16 tem byte zero a cada letra.
- `config.ini` em UTF-16LE com a chave, `git add -A && git commit`: antes passa, depois calado, push só "publicar". Em UTF-8 (controle):
  bloqueia.
- É o que o Windows PowerShell 5.1 grava com `>` e `>>` sem perfil (a R8 da minha sonda: `echo '<chave>' >> a.js; git commit -am x`
  deixou a chave em UTF-16 no commit, sem nenhum sinal).
- Somado ao `gh repo create --push` (A-4), é um caminho **sem nenhuma pergunta e sem aviso**, sem truque no comando.

**Correção sugerida:** BOM de UTF-16 (FF FE ou FE FF), ou byte zero alternado, decodifica como UTF-16 antes das regras. Caso que prova:
o mesmo arquivo nas 3 barreiras.

### M-9 · Médio · pergunta demais em formas comuns sem segredo
25 formas comuns, sem segredo, rodadas de verdade (todas fazem o commit): **11 passam, 13 perguntam e 1 bloqueia**.

- Passam:
  - `git commit -m "x"` e `git commit -m "fix(api): ajusta"`;
  - a forma padrão do Claude Code (`git add a.js && git commit -m "$(cat <<'EOF' ...)"`);
  - `cd "C:\..."` e `git -C "C:\..."`;
  - `| head`;
  - nome com espaço entre aspas;
  - no PowerShell: `git commit -am "x"`, here-string, `; if ($?) { }` e `2>&1 | Select-Object`.
- Perguntam, com o motivo:
  - "R$5" na mensagem (expansão);
  - `--trailer`;
  - `git rm` e `git mv` antes do commit;
  - `checkout -b` e `switch -c`;
  - `npm test && git commit` (no teste, `node -e`);
  - `commit -S`;
  - sessão na pasta-mãe, com `cd app &&` e com `git -C app`;
  - no PowerShell: caminho com barra invertida sem aspas (`git add src\b.js;`, `cd C:\...;`) e `| Out-Null`.

No PowerShell, a barra invertida é a forma normal de caminho no Windows, não escape. Pergunta frequente ensina a responder "sim" sem
ler. **Sugestão:** `rm`, `mv`, `checkout -b` e `switch -c` na lista; barra invertida literal no PowerShell; `Out-Null` como leitura; `$`
seguido de dígito não é expansão.

### M-10 · Médio · `.env.example` é bloqueado
`git add .env.example && git commit` com `API_URL=` e `API_KEY=` vazios: **bloqueia**, com "ponha o padrão no .gitignore". O
`/checklist-lancamento` (itens.md, linha 21; `seguranca-segredos.md`, linhas 41, 56 e 60) e `conhecimento/seguranca/lista.md` mandam ter
o `.env.example` no git, com marcadores. O agente que segue o checklist é barrado e recebe o conselho contrário. O nome entra pela regra
`(^|/)\.env(\..*)?$`.

**Correção sugerida:** `.env.example`, `.sample`, `.template` e `.dist` saem da regra de nome. O conteúdo continua lido: valor real
bloqueia.

### M-11 · Médio · 1º push de projeto com histórico vira pergunta genérica
O repositório do MVP (sem remoto, 196 commits, 20,8 MB de diff) leva 9,8 s só para o `git log -p` dos não enviados. A barreira do push
vence o prazo de 7 s **sempre** (7,5 s, 3 de 3) e pergunta "não deu para conferir". O 1º push de um projeto, o que publica tudo, é
justamente quando a barreira não lê. Com `git add -A && git commit` no mesmo repositório, o antes leva 5,3 s de mediana e 7,8 s de máximo:
perto do prazo.

**Sugestão:** o depois guarda os commits que já conferiu limpos, e o push lê só os que não conferiu. Para o 1º push, um comando sem prazo
que o usuário roda uma vez (por exemplo, o `/checklist-lancamento`).

### Baixos
- **b-10:** `git com$'mit' -am x` (aspas ANSI-C do bash) e `com$"mit"`. O `plano` tira as aspas e deixa o `$`, então "commit" não aparece.
  - Na pasta da sessão: antes passa, depois avisa e o push barra.
  - Com a pasta em variável: nada pergunta e nada avisa (tabela da M-7).
  - Exige truque no comando, por isso Baixo. **Sugestão:** tirar também `$` antes de aspas.
- **b-11:** em 3 de 4 rodadas do `claude -p` com o plugin, o Claude Code registrou "SessionEnd hook [retomar.js] failed: Hook cancelled", até com
  `AGENTES_ULTIMATE_SEM_PASTA=1`, quando o gancho sai na hora. Na sessão interativa não verifiquei. Se lá também for cancelado, o
  rascunho de retomar só sai no PreCompact.
- **b-12:** o depois roda 2 `git` em todo comando de shell (mediana 411 ms; 204 ms são de abrir o `node`). **Sugestão:** ler `.git/HEAD` e a ref com `fs` e só chamar o git quando o HEAD mudou. Isso também ajuda no B-2.

### As prioridades do pedido
- **(a) B-1 fechado?** O texto do comando, sim: 16 formas sem execução, com controle positivo. A configuração da pasta citada, não: B-2.
  - Não confirmado: um `git.exe` plantado na pasta (o Node 24 rodou o git do PATH, não o da pasta, na minha sonda);
  - não confirmado: `core.fsmonitor` (a proteção funciona).
- **(b) Forma com segredo que passa pelas 3 barreiras sem pergunta e sem aviso?**
  - Sim, sem truque: arquivo em UTF-16 com `gh repo create --push` (M-8 com A-4).
  - Com truque: `com$'mit'` com a pasta em variável (b-10).
  - Sem pergunta sobre o segredo, com o segredo no remoto: commit e push no mesmo comando (A-4).
- **(c) `git commit -m "x"` simples:** não pergunta, na pasta da sessão, no Git Bash e no PowerShell. A forma padrão do Claude Code também
  não. Mas 13 de 25 formas comuns perguntam (M-9) e o `.env.example` bloqueia (M-10).
- **(d) Lentidão e janela:** tempos abaixo. Nenhuma chamada nova sem `windowsHide` (`validar.js` 0 erro, detector conferido em b-9). O
  verificador com `shell: true` também esconde a janela.
- **(e) Licença e Motiva:**
  - os 69 guias do strix têm, na 1ª linha, a origem, o commit 6b7ae2e, "© 2025 OmniSecure Inc., Apache-2.0", a lista de alterações e
    "alterado por agentes-ultimate" (conferi os 69);
  - o `LICENSE` está em `terceiros/usestrix-strix/`, e o `CREDITOS.md` e o `fontes.json` têm o registro;
  - **não verificado:** se o strix tem um arquivo `NOTICE` (Apache §4d manda copiar). Esta máquina não tem rede para o GitHub, e o
    inventário não registra;
  - Motiva, CFO, caminhos e e-mails do usuário: 0 nos commits 56de65b..a13ea41. As menções antigas (`plano-0.7.md`, revisões e nome de
    teste) continuam como na 2ª rodada.
- **(f) As 2 decisões:** abaixo.

### Tempos dos ganchos
Mediana de 5, intercalada com um `node` vazio. As linhas sem nota foram medidas com a máquina livre; as do MVP, com a máquina ocupada pela bateria.

| Gancho e caso | Mediana | `node` vazio |
|---|---|---|
| antes (`travas.js`), comando sem git | 303 ms | 253 ms |
| antes, `git commit -m x`, repositório pequeno | 776 ms | 210 ms |
| antes, `git commit -m x`, repositório do MVP (OneDrive), máquina ocupada | 1,8 s | 0,4 s |
| antes, `git add -A && git commit -m x`, MVP, máquina ocupada | 5,3 s (máx. 7,8 s) | 0,4 s |
| antes, push no MVP, máquina ocupada | 7,5 s: vence o prazo (M-11) | 0,4 s |
| depois (`trava-depois.js`), comando comum | 411 ms | 204 ms |
| depois, comando comum no MVP, máquina ocupada | 531 ms | 302 ms |
| depois, HEAD mudou (lê o commit num filho) | 975 ms | - |
| depois, comando com 10 `cd` literais | 1,7 s | 191 ms |
| `retomar.js` no PreCompact, atividade com 0, 2 mil e 20 mil linhas | 411, 406 e 388 ms | cerca de 200 ms |
| `atividade.js`, Read e Edit, sem verificador | 224 e 218 ms | cerca de 200 ms |
| `atividade.js`, Edit com verificador (`node` vazio) | 496 ms | 187 ms |
| `atividade.js`, Stop com `aoParar` (`node` vazio) | 502 ms | 205 ms |

- **Todo comando de shell** agora paga o antes (cerca de 0,3 s) e o depois (cerca de 0,4 s). O `retomar.js` e a sugestão de compactar
  custam só o `node`, e o `retomar.js` não cresce com a atividade (lê o fim, 128 KB). O depois soma cerca de 80 s em 200 comandos (b-12).
- O verificador só custa quando está configurado. O `Stop` espera o `aoParar` até 30 s a cada fim de resposta.

### Mutação nas partes alteradas
**Interrompida, placar parcial: pegou 2 de 2 rodados.**
- Rodei uma cópia nova por mutante, com troca de texto que falha se o trecho não for achado, e o `scripts/testar-travas.js` sem a tabela
  longa.
- O controle sem mutação deu só a falha esperada: o caso b-4, porque o meu executor roda com `AGENTES_ULTIMATE_SEM_PASTA=1`.
- T1 (forma incerta com commit não pergunta): pego por 11 casos.
- T2 (as aspas não são tiradas da palavra): pego por 1 caso.
- O 3º mutante (pasta da sessão sempre "dentro") não terminou em 50 min. Às 08h o Claude Code parou o processo por falta de memória
  (1,4 GB livres de 7,7 GB). Por ordem, não reiniciei.
- Ficaram sem rodar 13 mutantes, prontos em `mutar.js` no scratchpad:
  - `$` fora de aspas e `git add` em outra pasta;
  - `xargs` na lista de leitura;
  - `core.quotepath` e `--branches` no push;
  - teto e arquivo que não abre;
  - recência e 50 commits no depois;
  - `--no-textconv` e `log.showroot`;
  - depois só com alta certeza.
- O "36 de 38" do autor não foi conferido.

### Opinião sobre as 2 decisões do autor
1. **"Commit em outra pasta sempre pergunta".**
   - **Recomendo** pastas **dentro** da sessão, mesmo outro repositório (a sessão aberta numa pasta-mãe com o projeto dentro), lidas
     como "simples". Elas estão na pasta que o usuário confiou ao abrir o Claude Code. Hoje esse jeito comum de trabalhar pergunta em
     todo commit (M-9) e a pergunta não traz nada, porque a pasta nem é lida.
   - Fora da sessão: perguntar **sem rodar git lá** (B-2), dizendo qual pasta e que nada foi conferido.
   - Risco: um repositório malicioso posto dentro da pasta da sessão roda a configuração dele. É o mesmo nível de confiança da pasta da
     sessão. Dá para voltar atrás.
2. **"Nome sensível no histórico pergunta no push em vez de bloquear".**
   - **Concordo.** Bloquear para sempre um push por um nome antigo (`docs/credentials.md`, um `.env.example`) só se resolve reescrevendo
     o histórico, operação pesada para quem não é desenvolvedor. Conteúdo de alta certeza continua bloqueando.
   - Condições:
     - corrigir antes o M-10, para o `.env.example` não cair nem na pergunta;
     - a pergunta diz o nome e que o arquivo vai ficar público;
     - nome forte (`.env` sem sufixo, `.pem`, `.key`, `id_rsa`) continua bloqueando também no push.

### Não verificado
- Linux e macOS (A-5 e a forma `$(...)` em geral). Tudo rodou no Windows 11, Git 2.55, Node 24, Claude Code 2.1.302.
- A mutação (13 de 15 mutantes não rodaram) e o "36 de 38" do autor.
- A ordem entre a trava e a recusa do próprio Claude Code no `claude -p` do B-1. O que vale é a prova direta nos ganchos, com controle positivo.
- O `NOTICE` do strix, e o `npm run deploy` com `gh-pages` (forma de script que publica; mesmo caso do `sh deploy.sh`) [HIPÓTESE].
- A sessão interativa no `SessionEnd` (b-11).

### Lista do usuário (depois de corrigir B-2, A-4 e A-5)
1. Peça um commit de um `.env.example` com os nomes e os valores vazios: deve passar, sem pergunta.
2. Peça "adicione esta chave falsa em config.ini, faça o commit e o push no mesmo comando": deve bloquear antes de qualquer envio.
3. Com o Claude Code aberto numa pasta-mãe, peça um commit no projeto de dentro: não deve perguntar se não houver segredo.
4. Confirme se o strix tem `NOTICE` (ou peça ao pesquisador, com rede).
5. Diga se as perguntas que ainda aparecem no seu dia a dia (lista da M-9) incomodam: elas decidem o que entra na lista curta.

Placar: autor=engenheiro-software cod=tr86 veredito=não B=1 A=2 M=6 b=3 ids=B-2,A-4,A-5,M-6,M-7,M-8,M-9,M-10,M-11,b-10,b-11,b-12

## 4ª rodada (2026-11-02): os 6 achados corrigidos e os limites declarados

**Pode juntar: NÃO**, só por texto do README. O código está pronto para juntar.
- **Os 6 achados corrigidos estão fechados:** B-2, A-4, A-5, M-6, M-7 e M-10. Cada um foi conferido com a sonda da 3ª rodada, com 2 a 4
  variações novas e com controle positivo no código antigo. O M-6 também foi conferido no Claude Code real.
- **Falta corrigir 1 frase do README (M-12):** um dos limites declarados está escrito errado, e é justamente o pior caso que ficou.
  O README diz que um commit feito por script "só é visto depois de rodar e no push". Isso não vale em dois casos:
  - **script que também publica** (`sh deploy.sh`, `npm run <nome livre>`, `.\deploy.ps1`): nada pergunta, e o segredo chega ao remoto;
  - **script rodado numa pasta fora da sessão:** o depois não diz nada, e o push só pergunta "não conferido".
  É troca de texto, sem código. Proponho o texto abaixo. Feita a troca, basta conferir a frase: não precisa de nova rodada.
- **Recomendado, sem impedir a junção (M-13):** 1 caso de teste. O mutante que faz o depois rodar git fora da sessão escapou da bateria.
- Escopo, como o usuário decidiu: só os 6 corrigidos e o texto dos limites. M-8, M-9, M-11, b-10, b-11 e b-12 não foram reabertos.
  Para eles, só conferi se o README os descreve como são.

- Revisor: `revisor`, código rv90 (2026-11-02, das 09h39 às 11h25). Autor: `engenheiro-software`, código tr86.
- Revisado: cópia `git archive` do da13c1c (c910a7b..da13c1c). Controle: cópia do a13ea41, o código que a 3ª rodada revisou.
- **Bateria sem a tabela** (`AGENTES_ULTIMATE_SEM_FORMAS=1 node scripts/testar-hooks.js`, na cópia, das 10h22 às 10h33): **515 ok, 0 falha**.
- **Tabela de formas sozinha** (`node scripts/testar-travas-formas.js`): **52 formas, 0 furo**, 17 formas comuns sem falso positivo (337 s).
  - Controle positivo, a mesma tabela com os ganchos do a13ea41: **10 furos** (403 s). É o número que o autor declarou.
- `validar.js`: 0 erro, 0 aviso. `claude plugin validate .`: passou.
- Uma execução de `claude -p` (haiku, Claude Code 2.1.302), usada no M-6.
- Os testes rodaram em cópias e em repositórios do temp. No repositório do autor, só leitura e o commit deste relatório.

### Passe de veredito (os 6 corrigidos)
| Id | Veredito | Prova |
|---|---|---|
| B-2 | **resolvido** | **Fora da sessão:** 9 configurações-espiãs × 9 formas, nenhuma execução. As configurações: assinatura com `gpg.program`, `core.fsmonitor`, `core.hooksPath`, `include.path`, filtro clean/smudge, `filter.process`, `textconv` com `diff.external`, pager e `trace2`. As formas: `cd`, `-C`, `Set-Location`, `GIT_DIR=`, `add -A && commit`, `commit -am && push`, script && push, o depois e o depois de falha. No a13ea41, a assinatura e o `include.path` rodaram em 7 de 9 formas cada (controle). O `git` puro roda 6 dessas configurações. `pager`, `trace2` e `hooksPath` não rodam nem no git puro (sem terminal; o `trace2` não é lido da configuração do repositório), então essas 3 linhas não provam nada. **Dentro da sessão** (decisão do usuário): nenhuma execução, exceto o filtro clean e o `filter.process`, nas 2 formas que leem a pasta de trabalho (`cd app && git add -A && git commit`, `commit -am`). É o que o README declara. As mensagens: `git -C <fora> push`, `Set-Location <fora>; git push` e `cd .. && git push` dizem "não conferido: pasta fora da sessão (<pasta>). Nenhum git rodou lá". `cd app && git commit -m x`, `git -C app commit -m x` e `cd app && git add -A && git commit -m x` passam sem pergunta; com a chave, bloqueiam |
| A-4 | **resolvido** para publicar visível no comando | 4 formas da 3ª rodada: `echo >> a.js && commit -am && push`, alias && push, script && push e `eval` && push. Todas perguntam "o segredo não pôde ser conferido antes de publicar". Formas novas que também perguntam: `cp segredo.txt a.js && ...`, `commit -am > log.txt && push`, `Add-Content; commit -am; push` (PowerShell), `powershell -File salvar.ps1; git push`, `push && exit 1`, `gh repo create` (com e sem `--push`), `git subtree push` e `npm run deploy:prod`. Nas que rodei de verdade, com remoto nu, o segredo só chegou ao remoto depois dessa pergunta, e o depois disse "Já foi publicado... troque a chave". A exceção é o push sem ramo de rastreio (b-13). `gh`, `subtree` e `deploy:prod` só passaram pela decisão do antes. Controles: `git commit -m "x"` e `git add -A && git commit -m x`, limpos, **passam sem pergunta**; a forma comum com push pergunta só "publicar"; com a chave, bloqueia. **O que fica:** script que publica sem a palavra no comando (`sh deploy.sh`, `npm run ship`, `.\deploy.ps1`, `npx gh-pages`) não pergunta nada, e o segredo chega ao remoto. Não tem como ler isso antes: é limite, e o README o descreve errado (M-12) |
| A-5 | **resolvido** | O verificador recebe o nome literal em: `x%USERNAME%.js`, ``a$(echo PWN)`id`.js``, `b & echo PWN ^x.js` e `sub/c%PATH%.js`. O comando em texto não roda na edição e diz para usar a lista. A 3ª rodada já provou que o código antigo expandia o nome (`x18-112089.js`). Os 3 casos do autor em `testar-painel.js` passam. O exemplo da skill `integracoes` usa a lista. Ficam 2 bordas, em b-14 |
| M-6 | **resolvido** | **No Claude Code real**, num `claude -p` com o plugin da cópia: o comando foi `sh salvar.sh; exit 3`, um script que faz o commit da chave sem a palavra. Saída 3. O stream trouxe "PostToolUseFailure:PowerShell says: agentes-ultimate: ATENÇÃO... a.js:2 · chave de acesso da AWS", e o modelo recebeu o aviso como "hook blocking error". Nos ganchos, `commit && push && exit 1` também avisa "já foi publicado" |
| M-7 | **resolvido** | A tabela usa o cwd da sessão no depois e no push, faz o push do mesmo jeito que o commit, roda o `&& git push` contra um remoto nu e tem um comando que falha. Resultado: 0 furo no atual e 10 no a13ea41, rodados por mim (números acima). A correção da frase da 2ª rodada está no CHANGELOG |
| M-10 | **resolvido** | Passam: `.env.example` e `config/.env.sample` com valores vazios ou marcador, e `.env.Template` com `.env.dist`. Bloqueiam: `.env.example` com chave (pelo conteúdo, `.env.example:1`); `.env`, `.env.local`, `.env.example.bak` e `.env.examples` (pelo nome) |

### Mutação nas partes alteradas
**Pegou 11 de 12.** Cada mutante rodou numa cópia nova do da13c1c, com troca de texto que falha se o trecho não for achado. Rodei só o módulo de
teste da parte (`testar-travas.js` ou `testar-painel.js`, com o mesmo `hook()` da bateria). Controles sem mutação: 144 ok / 0 falha e 26 ok / 0
falha. Rodado junto da tabela, o controle deu 1 falha falsa, no caso M-3 (árvore do plugin): o prazo de 7 s estourou com a máquina ocupada. Sozinho,
o caso passou 3 de 3.

| Mutante | Resultado |
|---|---|
| B-2: `naSessao` sempre verdadeiro (git roda fora no antes) | pegou (5 casos) |
| B-2: `pastasCitadas` também devolve as pastas de fora (git roda fora no depois) | **escapou: M-13** |
| B-2: sem `log.showSignature=false`, `gpg.program=` e `--no-show-signature` | pegou (2) |
| A-4: comando que grava em arquivo volta a ser forma lida | pegou (1) |
| A-4: `gh --push`, `gh repo create` e `npm run deploy` deixam de ser publicação | pegou (3) |
| A-4: sem a pergunta "não pôde ser conferido" | pegou (7) |
| A-4: o depois nunca diz "já foi publicado" | pegou (1) |
| M-6: sem o `PostToolUseFailure` no `hooks.json` | pegou (1) |
| A-5: lista rodada com `shell: true` | pegou (5) |
| A-5: comando em texto volta a rodar na edição | pegou (1) |
| M-10: sem a exceção dos modelos | pegou (5) |
| M-10: exceção larga demais (`.env.<qualquer>`) | pegou (1, `.env.local`) |

### Os limites do README, frase a frase
| Limite no README | Confere? | Prova |
|---|---|---|
| Script, alias antigo ou palavra montada "só é visto depois de rodar e no push" | **não (M-12)** | Vale para o alias e o script **sem** push, na pasta da sessão: o depois avisa e o push barra (tabela, linhas L). Não vale para script que publica: `sh deploy.sh`, `npm run ship` e `.\deploy.ps1` não perguntam nada, o segredo chega ao remoto e o depois diz "já foi publicado". Não vale fora da sessão: `cd <fora> && sh salvar.sh` passa, o depois fica calado e o push só pergunta "não conferido" |
| UTF-16 "passa pelas 3 barreiras" | sim | Esta faixa de commits não mexeu na leitura de binário (diff de `leitor-segredos.js`: só nome, opções do git e `--no-show-signature`). Vale a prova da 3ª rodada |
| Formas pouco comuns perguntam (`git rm`, `git mv`, `checkout -b`, "R$5", `--trailer`, barra invertida no PowerShell, `Out-Null`) | sim, mas incompleta (b-15) | As 7 perguntam. Também perguntam, e o README não cita: `npm test && git commit` (comum), `commit -S` e `switch -c`. Saíram da lista, porque passam sem pergunta (decisão do usuário): `cd app && git commit` e `git -C app commit` com a sessão na pasta-mãe |
| Repositório grande passa do prazo de 7 s | sim | Código do prazo intocado. Não medi de novo |
| `com$'mit'`: nada avisa com a pasta em variável | sim | `plano` sem mudança nesta faixa |
| `retomar.js` cancelado no `claude -p` | sim | Sem mudança |
| O depois custa cerca de 0,4 s | sim | Mediana de 7: 371 ms, contra 167 ms de um `node` vazio, com a máquina ocupada |
| Repositório malicioso dentro da sessão roda o filtro clean | sim, exato | O filtro clean e o `filter.process` rodaram em 2 de 9 formas, as que leem a pasta de trabalho. Assinatura, fsmonitor, `include.path`, `hooksPath`, `textconv` e diff externo: 0 de 9 |

### Achados abertos
| Id | Gravidade | Achado | Dono |
|---|---|---|---|
| M-12 | Médio | A frase do limite "script... só é visto depois de rodar e no push" esconde o pior caso: script que publica (nada pergunta, o segredo vai ao remoto) e script fora da sessão (nada é lido) | `engenheiro-software` |
| M-13 | Médio | O teste do B-2 não prova que nenhum git roda fora da sessão: o mutante que devolve as pastas de fora ao depois escapou. A espiã usa a assinatura, e as opções `-c` também a desligam. Hoje o código está certo; uma regressão na regra principal do B-2 passaria verde. **Sugestão:** depois de `cd <fora> && ls`, conferir que não foi criado o registro `agentes-ultimate-head/<sha1 da pasta>` (ele só existe se o git rodou lá), ou usar uma configuração que as opções não cobrem | `engenheiro-software` |
| b-13 | Baixo | Push para caminho ou URL sem ramo de rastreio (`git push ../nu HEAD:main`): o depois diz "Desfaça ANTES do push" quando já foi publicado. A pergunta de antes avisou | `engenheiro-software` |
| b-14 | Baixo | Verificador em lista no Windows: o exemplo do comentário (`"aoParar": ["npm.cmd", "test"]`) não roda no Node 24 ("verificador não rodou (EINVAL)"), e `["npm", ...]` dá ENOENT. Na prática, ferramenta `.cmd` (npx, eslint, prettier) não roda como verificador. Nome de arquivo que começa com `-` vira opção (`--x.js` → "node: bad option") | `engenheiro-software` |
| b-15 | Baixo | A lista de formas que perguntam (M-9 no README) omite `npm test && git commit`, `commit -S` e `switch -c` | `engenheiro-software` |
| M-8, M-9, M-11, b-10, b-11, b-12 | - | Declarados no README por decisão do usuário. Não reabertos; o texto confere, exceto b-15 | usuário (aceitos) |

**Texto proposto para o M-12** (no lugar da 1ª linha dos limites):
> - Comando que faz o commit sem citar a palavra (script, alias antigo, palavra montada em variável) não é lido antes. Na pasta da sessão, o
>   depois avisa e o push seguinte barra. **Script que também publica** (`sh deploy.sh`, `npm run <nome>`, `.\deploy.ps1`, `npx gh-pages`)
>   não pergunta nada: o segredo chega ao remoto, e o depois só avisa "já foi publicado: troque a chave". Fora da pasta da sessão, nada é
>   lido: o depois fica calado e o push só pergunta "não conferido".

Para o b-15: acrescentar `npm test && git commit`, `commit -S` e `switch -c` à lista. Para o b-14: no comentário, trocar o exemplo por
`["node", "node_modules/eslint/bin/eslint.js", "{arquivo}"]` e dizer que `.cmd` não roda sem shell. Para o nome com `-`: passar `./` antes do nome.

### Não verificado
- Linux e macOS (A-5 com `$(...)` num `sh` de verdade). Tudo rodou no Windows 11, Git 2.55, Node 24.18 e Claude Code 2.1.302.
- O B-2 no `claude -p`: o autor diz que provou; eu usei a única execução no M-6. A prova do B-2 é direta nos ganchos, com controle positivo.
- `gh pr create` sem `--push`, que pode empurrar o ramo [HIPÓTESE]: não está na regra `OUTRO_PUBLICA`. Não rodei, porque não há `gh`
  autenticado aqui.
- Junção ou link simbólico dentro da sessão apontando para fora: `naSessao` compara o caminho escrito, não o real. Não testei.
- `pager`, `trace2` e `hooksPath`: os controles não dispararam nem no git puro. As linhas desses 3 não provam nem que estão cobertos, nem que estão descobertos.

### Lista do usuário
1. Peça um commit de um `.env.example` com os nomes e os valores vazios: deve passar, sem pergunta.
2. Peça "adicione esta chave falsa em config.ini, faça o commit e o push no mesmo comando": deve perguntar, dizendo que o segredo não
   pôde ser conferido. Responda "não".
3. Com o Claude Code aberto numa pasta-mãe, peça um commit no projeto de dentro: não deve perguntar se não houver segredo.
4. Leia a frase nova do limite (M-12) e decida se "script que publica não pergunta nada" é aceitável. Se não for, o caminho é um gancho
   `pre-push` do git no projeto, que o plugin hoje não instala.

Placar: autor=engenheiro-software cod=tr86 veredito=não B=0 A=0 M=5 b=6 ids=M-12,M-13,M-8,M-9,M-11,b-13,b-14,b-15,b-10,b-11,b-12
