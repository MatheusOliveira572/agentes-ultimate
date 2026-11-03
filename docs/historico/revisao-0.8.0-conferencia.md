# Conferência curta antes do push da 0.8.0 (rv107)

Revisor independente, 2026-11-02, 20h13 a 20h35. Revisado: `main` em `6f1e483` (173 commits à frente de `origin/main` = `35209a0`,
a 0.7.0 publicada). Autor: `engenheiro-software`, código `hd105`. Escopo: fechar os achados da revisão final
(`revisao-0.8.0-final.md`, rv100) e conferir o que entrou depois (provas no nível HD, mundos visuais, nível HD no plugin,
mostruário dos 10 mundos).

## Pode publicar: NÃO

Um achado Alto, barato e já com a correção provada:
- **A-3:** a atualização diária deixou de funcionar para quem instalou o Claude Code pelo npm. A correção do A-2 chama o
  `claude` sem shell; no Windows isso não acha o `claude.cmd` e falha calada. Na 0.7.0 funcionava.

Os 2 Médios (M-7 e M-8) valem antes do push porque são uma linha cada e o M-7 fica no histórico público.

| Checagem (rodada por mim, sem cache) | Resultado |
|---|---|
| `node scripts/validar.js` | 32 agentes, 19 pacotes, 13 skills, 0 erro, 0 aviso |
| `claude plugin validate .` | ✔ Validation passed |
| `node scripts/testar-impressionar.js` | 71 casos, 0 falha |
| `node scripts/testar-sites.js` | 80 casos, 0 falha (2 min 25 s) |
| `node scripts/testar-liquid-glass.js` | todos ok |
| `node scripts/eval-roteamento.js` | 24 casos, 23 certos (95,8%, piso 90%), 0 palavra repetida. O erro ("estratégia de expansão…" → nenhum) é o mesmo antigo |
| `AGENTES_ULTIMATE_SEM_FORMAS=1 node scripts/testar-hooks.js`, em 2º plano, gravando em arquivo | **739 ok**, "todos os casos passaram", saída 0. Inclui os 2 casos do A-2 (janela e detector) |
| `node scripts/testar-travas-formas.js`, em 1º plano | 52 formas, 24 com segredo no commit, 0 sem pergunta nem limite declarado, **0 furo**; 17 simples, 0 falso positivo (239 s) |
| SRI do three.js: baixei os 2 arquivos do jsDelivr e calculei o sha384 | Os 2 batem com o import map (`three.module.min.js` 691.648 bytes e `RoomEnvironment.js` 3.606 bytes). Versão fixa `three@0.170.0`; o cabeçalho do arquivo e o `package.json` dizem MIT |
| Mutação nas partes novas (mv104/hd105), numa cópia `git archive HEAD` | **pegou 5 de 6** (`testar-impressionar` + `validar`); o que escapou vira o b-12 |
| Sonda de janela da correção proposta para o A-3 (`GetConsoleWindow`/`IsWindowVisible`) | `janela=0 visivel=False`, e o `claude.cmd` falso rodou (saída 0) |

## Achados da revisão final (rv100)

| Id | Situação | Prova |
|---|---|---|
| A-1 versão | **Fechado** | `plugin.json` = `0.8.0` |
| A-2 janela | **Fechado** (janela), mas a correção abriu o **A-3** | `hooks/atualizar.js:53` destaca um `node` sem shell; caso "não abre janela visível" passa; o detector acusa shell + detached |
| M-1 CHANGELOG | **Fechado** | um cabeçalho só, `## 0.8.0 · 2026-11-03`, no topo, com as entradas que faltavam (sobra o b-8) |
| M-2 menções | **Fechado** para os termos de antes; achado novo da mesma classe no M-7 | `git grep` em HEAD: nenhuma menção à empresa, a clientes ou ao projeto do usuário |
| M-3 peso | Decisão do usuário, aplicada a opção (b) | Ver "Peso" abaixo |
| M-4 casos do "impressiona" | **Fechado** | 71 casos; mutação desta rodada pegou 5 de 6 |
| M-5 índice | **Fechado** | casos no `testar-impressionar` e eval de roteamento verdes |
| M-6 licença e texto alternativo | **Fechado** | `licen` e texto alternativo/leitor de tela no critério do `designer-interface` e do `designer-sites` |
| b-1 a b-4, b-6, b-7 | **Fechados** | README com 13 skills; `como-funciona` sem "era com designer-paineis"; NN/g com `peak-end-rule`; grade 8 × 8; "da referência, só a ideia" nos 4 designers |
| b-5 acabamento | Refeito no nível HD (hd102/hd103); não reapliquei a régua inteira | Ver "Imagens" abaixo |

## Achados novos

### Alto

**A-3 · A atualização diária não roda quando o Claude Code foi instalado pelo npm** (`hooks/atualizar.js:66`; dono: `engenheiro-software`)
- **Evidência:** `executar()` chama `spawnSync('claude', …, { windowsHide: true })` sem shell. No Windows, sem shell, o Node só
  acha `.exe`/`.com`. Quem instalou com `npm install -g @anthropic-ai/claude-code` tem `claude.cmd`. Reproduzi com um
  `claude.cmd` falso no PATH: sem shell, `ENOENT`; com shell, saída 0. O erro cai no `try` e a atualização não acontece,
  todo dia, sem aviso. Nesta máquina o `claude` é `claude.exe` (WinGet), então o autor não teria visto.
- **Por que é Alto:** é a mesma razão do A-1: a versão nova não chega a quem já instalou. E é regressão: na 0.7.0, com shell,
  funcionava. O teste do A-2 usa o `powershell.exe` como "claude", então não cobre o `.cmd`.
- **Correção provada:** em `executar()`, se a 1ª chamada der `ENOENT` no Windows, chamar
  `spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'claude plugin …'], { windowsHide: true })`, **sem**
  `detached` (o node já está destacado). Os argumentos são fixos, sem texto de fora. Sonda: o `claude.cmd` falso rodou
  (saída 0) e o console dele deu `janela=0 visivel=False` (`rv107-cmd/sonda.js` no rascunho do revisor). Caso novo na
  bateria: um `claude.cmd` falso no PATH, com e sem a correção.

### Médio

**M-7 · Nome de usuário do Windows numa captura de saída da vitrine** (`docs/provas/0.8.0-design/vitrine/png/saida-mutacao.txt:7`;
dono: `engenheiro-software`)
- **Evidência:** a linha `at file:///C:/Users/<login do usuário>/agentes-ul…` (o login corporativo que a busca pedia para
  não ter), entrou no `88ec688` (hd102). É a única ocorrência em HEAD.
- **Histórico:** o mesmo login já está em 2 commits ainda não publicados (`152751e`, a minha revisão final, corrigido em
  `ba76b1a`; e `88ec688`). Um commit novo tira da árvore, não do histórico.
- **Correção:** trocar o caminho por `file:///<pasta>/agentes-ultimate/...` antes do push. O histórico é decisão do usuário
  (abaixo).

**M-8 · A descrição do `designer-sites` ainda manda "tela de app" ao `designer-paineis`** (`agents/designer-sites.md:3` e
`fonte/agentes/design/designer-sites.md:3`; dono: `engenheiro-software`)
- **Evidência:** "Não use para painel, dashboard ou tela de app (→ designer-paineis)". Desde o im99 tela de app é do
  `designer-interface`, e as descrições dos outros 2 já dizem isso. Vem de `a41feb9` e passou pela revisão final.
- **Risco:** é o texto que o Claude Code lê para delegar sozinho; é o tipo de erro de rota que o usuário já achou.
- **Correção:** "painel ou dashboard (→ designer-paineis), tela de app (→ designer-interface)".

### Baixo
- **b-8** O CHANGELOG não registra o mostruário dos 10 mundos (`2f60e77`, `6f1e483`), e o "14,6 MB" da linha da compressão
  agora é 15,9 MB.
- **b-9** `docs/provas/0.8.0-design/LEIA-ME.md` está desatualizado: não lista `mundos/` e chama a pv94 de "a mais nova",
  mas o `e2e/` foi refeito no hd103.
- **b-10** O cabeçalho do CHANGELOG tem data `2026-11-03` (amanhã). Ajustar para o dia do push.
- **b-11** O README não fala do padrão visual (régua "impressiona", 10 mundos, nível HD). Bastam 2 linhas na seção dos
  pacotes ou das referências.
- **b-12** Mutante que escapou: trocar "Apple / Liquid Glass é um mundo entre os outros" por "é o mundo padrão" no
  `impressionar.md` passa nos testes, porque eles só conferem que "Nenhum mundo é o padrão do plugin" continua lá. Um caso
  que acuse "Apple…padrão" sem "não"/"nenhum" fecha a regra do usuário "Apple nunca é o padrão".

## O que entrou depois da revisão final
- **Nada da empresa ou do usuário:** em HEAD, `git grep` pelos nomes da empresa e de clientes, a pasta de usuário, o login,
  "Matheus", e-mails e `C:\Users` acha só o M-7, o exemplo fictício `C:/Users/x/a.js` (`scripts/testar-auditoria.js:41`)
  e a identidade pública do dono (manifesto, LICENSE, README), que fica por decisão dele. "OneDrive" só no detector de pasta
  sincronizada e no texto dele. As mensagens dos 173 commits não citam a empresa, o login nem o e-mail pessoal; o e-mail
  de autor dos commits é o do dono do repositório.
- **Segredos:** nenhum padrão de chave (AWS, GitHub, Anthropic, OpenAI, Slack, PEM) fora dos testes e das referências.
- **Licenças:**
  - three.js 0.170.0: MIT, por CDN, versão fixa e SRI conferido (tabela acima);
  - fontes: as provas carregam do Google Fonts (nada empacotado no repositório): Inter, Inter Tight, Fraunces, Source Serif 4,
    Public Sans, Young Serif, Instrument Sans, Geist e Geist Mono, Fredoka, Nunito, Cormorant Garamond, Manrope, Space
    Grotesk e Space Mono, IBM Plex Sans e Mono, VT323, JetBrains Mono. Todas são OFL; o `mundos/INDICE.md` cita
    `google/fonts` (OFL 1.1) e os repositórios do Geist e do IBM Plex;
  - fotos do caso B: geradas por shader próprio (`fotos-webgl.js`), sem foto de terceiros; a lente da vitrine é geometria
    procedural;
  - copiado de terceiros: não achei. Nada de "copyright", banco de imagem ou trecho de outra implementação nas provas, nos
    mundos ou nos modelos.
- **Designers e revisor (linhas antes do protocolo, meta ≤ 90):** interface 89, sites 90, painéis 90, documentos 77,
  revisor 90. Comparei com `cc00b7d` (depois das correções da revisão final): nenhum perdeu teclado, foco, contraste,
  acessibilidade, texto alternativo, movimento ou transparência reduzidos, licença nem "da referência, só a ideia". Apple só
  aparece como "no mundo Apple ou com vidro pedido". O `designer-sites` tem "Vestir tudo de Apple e vidro por hábito" nos erros
  conhecidos.
- **README, CHANGELOG e versão:** versão 0.8.0 no manifesto; 1 cabeçalho no CHANGELOG; 32 agentes e 13 skills no README
  batem com o `validar.js`. Faltas no b-8, b-10 e b-11.

## Peso
- **Árvore (o que quem instala baixa; a cópia do marketplace é rasa):** 15,9 MB em 621 arquivos. Imagens: 11,2 MB.
  `docs/`: 12,5 MB. **Sem `docs/`, o plugin tem 3,4 MB** (a 0.7.0 tinha 2,5 MB).
- **Push:** 192,5 MB de blobs novos (165 MB no disco), quase tudo PNG de versões antigas das provas. O maior blob tem
  6,4 MB, longe do limite do GitHub. Isso pesa só para quem clona o repositório inteiro.
- **Aceitável?** Sim para a 0.8.0: é 1,6× a meta de 10 MB, só na instalação, e nada do plugin depende das provas. Para a
  0.8.1, recomendo tirar `docs/provas/` da árvore publicada (ramo próprio ou anexos de release, com link no LEIA-ME): a
  instalação cai para cerca de 3,4 MB.

## Imagens abertas (3 de 4)
- `vitrine/png/vitrine-claro-1440.webp`: lente 3D nítida, texto do anel legível, barra e botões inteiros. Nada quebrado.
- `mundos/png/visao-geral.webp`: os 10 mundos com a mesma tela, legendas e números (1,8 m, 14 nós, 22,4 °C, 15h42)
  iguais em todos. Nada cortado nem sobreposto. No "Corporativo de confiança" sobra área vazia embaixo do cartão
  (gosto, não defeito).
- `e2e/png/caso-a-v2-claro-1440.webp`: contas coerentes (5 de 12 = 42%; "5 de 8" hoje; Hoje 3 = 2 abertas + 1 atrasada;
  projetos 2+1+3+1 = 7 abertas = 3 de hoje + 4 próximos). O visto à mão passa da borda da caixa, de propósito. A última
  tarefa aparece esmaecida sob o campo "Nova tarefa…" (rolagem). Nada quebrado.
- Não rodei os verificadores visuais (memória livre de cerca de 1,7 GB, como pedido).

## Decisões do usuário
1. **Login no histórico (M-7):** (a) recomendado: publicar com o histórico como está e tirar só da árvore. É o login
   corporativo, não senha nem dado sensível, e o nome do dono já é público no repositório. (b) Reescrever os 173 commits
   locais antes do push: limpa, mas é arriscado e não dá para desfazer depois do push. Depois do push, só (a) é possível.
2. **Peso:** publicar com 15,9 MB e tirar `docs/provas/` da árvore na 0.8.1 (recomendado), ou tirar agora (atrasa o push).

## Lista do usuário (o que só você prova)
1. Depois do push, num PC com o Claude Code instalado pelo npm (`where claude` mostra `claude.cmd`), abra uma sessão no
   dia seguinte: deve aparecer "agentes-ultimate atualizado: 0.7.0 → 0.8.0" e nenhuma janela preta (A-3 corrigido).
2. Neste PC (WinGet), o mesmo aviso na sessão seguinte ao push, também sem janela.
3. Abra `docs/provas/0.8.0-design/mundos/png/visao-geral.webp`. Os 10 mundos parecem do mesmo nível, e nenhum parece "o
   padrão"?
4. No push, a trava pergunta sobre publicar. Veja se a resposta vem em menos de 7 s com os 173 commits.

## Pendências e o que não verifiquei
- Não rodei a bateria com a tabela de formas na mesma execução (rodei a tabela à parte, `testar-travas-formas.js`).
- A correção do A-3 foi provada numa sonda, não no `atualizar.js`: o autor precisa do caso na bateria.
- Não reapliquei a régua inteira (camadas 1 e 2) às provas HD; abri 3 imagens.

Placar (1ª passada): autor=engenheiro-software cod=hd105 veredito=não B=0 A=1 M=2 b=5 ids=A-3,M-7,M-8,b-8,b-9,b-10,b-11,b-12

## Reconferência (2026-11-02, 20h40 a 21h05, `main` em `d1de95c`)

Correções do autor: `c852df4` e `3aa1851` (A-3), `b84353a` (M-7), `2408954` (M-8), `ffb8680` (b-12), `a8889fb` (b-8 e b-10),
`9f78ba7` (b-9) e `d1de95c` (b-11).

## Pode publicar: SIM

| Id | Situação | Prova (rodada por mim agora) |
|---|---|---|
| A-3 | **Fechado** | Uma sonda nova (`rv107-cmd/sonda-atualizar.js`) roda o `hooks/atualizar.js` **real**, com a casa num temp, sem `claude.exe` e com um `claude.cmd` falso no PATH (`where claude` mostra só ele). **Atual:** os 2 comandos rodaram (`plugin marketplace update agentes-ultimate`, depois `plugin update agentes-ultimate@agentes-ultimate`), o console de cada um deu `visivel=False` e o log diz o motivo ("ENOENT; tentando claude.cmd pelo cmd.exe"). **Controle, o `atualizar.js` de `447a447`:** nenhuma chamada, nenhum log. O fallback só entra com ENOENT, no Windows, para o `claude` padrão, e o texto do `cmd /c` é fixo, sem nada de fora |
| A-3, caso novo da bateria | **Pega o defeito** | Bateria `SEM_FORMAS` numa cópia `git archive d1de95c` com o `atualizar.js` antigo: **741 ok, 1 falha**. A falha é justamente "conferência A-3: com claude.cmd (npm)… → chamadas: nenhuma". 741 + 1 = 742, o total do autor |
| M-7 | **Fechado** na árvore | `git grep` pelo login em HEAD: 0. A linha agora é `file:///<pasta>/lente3d.js`. A busca pela empresa, pelo e-mail e por `C:\Users\<número>` em HEAD e nas mensagens dos 8 commits novos também deu 0. O histórico continua com o login em 2 commits não publicados (decisão 1 abaixo) |
| M-8 | **Fechado** | `agents/designer-sites.md:3` e a fonte agora dizem "painel ou dashboard (→ designer-paineis), tela de app (→ designer-interface)". Nenhuma descrição manda mais tela de app ao `designer-paineis` |
| b-8, b-10 | **Fechados** | CHANGELOG com `## 0.8.0 · 2026-11-02`; mostruário (mt106) na linha 445; "15,9 MB (já com o mostruário)" |
| b-9 | **Fechado** | `docs/provas/0.8.0-design/LEIA-ME.md` lista `mundos/` |
| b-11 | **Fechado** | README, linhas 80–82: régua, nível HD e 10 mundos, "Apple / Liquid Glass é um deles" |
| b-12 | **Fechado** | Mesmos 6 mutantes na cópia nova: o "Apple vira padrão" agora é pego. O `testar-impressionar` pega 5 de 6, e o 6º (índice) é pego pelo `validar.js`: 6 de 6 |

Outras checagens:
- `validar.js`: 32 agentes, 19 pacotes, 13 skills, 0 erro, 0 aviso;
- `claude plugin validate .`: ✔;
- `testar-impressionar.js`: 73 casos, 0 falha;
- `eval-roteamento.js`: 23 de 24 (95,8%), o mesmo erro antigo;
- versão 0.8.0 no manifesto.

Não rodei de novo a bateria inteira no HEAD: o autor teve 742 ok, e a minha cópia com só o `atualizar.js` trocado deu 741 ok mais a
falha esperada. Também não rodei a tabela de formas, porque nada nos commits novos mexe nas travas.

### Decisões do usuário (continuam)
1. **Login no histórico (M-7):** o login continua em `152751e` e `88ec688`, que vão no push. Recomendo publicar assim: é um
   login, não um segredo, e o nome do dono já é público. A alternativa é reescrever os commits locais antes do push; depois
   do push, não há mais volta.
2. **Peso:** 15,9 MB é aceitável na 0.8.0. Na 0.8.1, tirar `docs/provas/` da árvore (fica em cerca de 3,4 MB).

### Lista do usuário (mantida)
1. Num PC com o Claude Code do npm (`where claude` mostra `claude.cmd`), na sessão do dia seguinte ao push, deve aparecer
   "agentes-ultimate atualizado: 0.7.0 → 0.8.0" e nenhuma janela preta.
2. Neste PC (WinGet), o mesmo aviso, também sem janela.
3. No push, a trava pergunta sobre publicar: a resposta vem em menos de 7 s?

Placar: autor=engenheiro-software cod=hd105 veredito=sim B=0 A=0 M=0 b=0 ids=
