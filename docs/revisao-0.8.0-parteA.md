# Revisão independente da 0.8.0, parte A (regras dos 2 checklists)

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
