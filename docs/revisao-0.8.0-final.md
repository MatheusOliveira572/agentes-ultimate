# Revisão final da 0.8.0, antes da publicação (rv100)

Revisor independente, 2026-11-02, 15h30 a 16h40. Revisado: `main` em `10ee01e` (144 commits à frente de `origin/main` = `35209a0`,
a 0.7.0 publicada; `origin/main` é ancestral da `main`, então o push não tem conflito pelo último fetch). Autor do último
trabalho: `engenheiro-software`, código `im99`.

## Pode publicar: NÃO

Nada bloqueante e nada de segurança. Faltam 2 correções Altas, as duas baratas:
- **A-1:** o número da versão continua 0.7.0, então a versão nova não chega a quem já instalou;
- **A-2:** a atualização diária ainda abre uma janela de console visível no Windows.

O resto (6 Médios, 7 baixos) pode ir depois, mas 3 deles valem antes do push porque, depois de publicados, ficam no histórico
público: as menções à empresa (M-2), o peso dos PNGs (M-3) e o CHANGELOG (M-1).

| Checagem (rodada por mim, sem cache) | Resultado |
|---|---|
| `node scripts/testar-hooks.js` **completo, com a tabela de formas**, em primeiro plano, no HEAD `10ee01e` | **663 ok, 0 falha**, saída 0, 12 min 44 s (15h30–15h43); a tabela rodou as 52 formas ("segredo só depois de pergunta ou em limite declarado"; "17 formas simples nunca perguntam") |
| Mesma bateria sem a tabela (`AGENTES_ULTIMATE_SEM_FORMAS=1`), numa cópia `git archive HEAD` | 661 ok, 0 falha, 8 min 44 s |
| `node scripts/validar.js` | 32 agentes, 19 pacotes, 13 skills, 0 erro, 0 aviso |
| `claude plugin validate .` | ✔ Validation passed |
| `node scripts/testar-sites.js` (sozinho, na cópia) | 80 casos, 0 falha |
| `node scripts/testar-liquid-glass.js` | 5 ok |
| `node scripts/eval-roteamento.js` | 22 de 23 (95,7%, piso 90%), 0 palavra repetida. O erro ("qual a estratégia de expansão e o posicionamento competitivo da empresa" → nenhum) existe desde `4a9f422`; é igual em `7f280df` e em `c7e7adb` |
| Sonda do roteador: 40 pedidos × HEAD, `7f280df` (antes do im99) e `origin/main` (0.7.0) | Nada regrediu na escolha dos pacotes. A única mudança é a esperada (tela de app: `designer-paineis` → `designer-interface`). Mas as **referências** mudaram de dono em pedidos de painel (M-5) |
| Mutação nas partes do im99, numa cópia, 15 mutantes | **pegou 4 de 15**. Os 11 que escaparam são todos do padrão "impressiona" (M-4) |
| Tempo dos ganchos (mediana de 5; node vazio = 141 ms) | Por comando de shell: antes ~105–112 ms, depois ~170 ms. Por leitura: ~110 ms. Roteador ~190 ms. Stop ~135 ms. Commit preparado 0,36–0,40 s. Push 0,4 s (repositório vazio) e 0,8 s (31 MB) |
| Janela no Windows (sonda com `GetConsoleWindow`/`IsWindowVisible`) | chamada direta com `windowsHide`: sem janela. **Cadeia do `hooks/atualizar.js`: janela visível** (A-2) |

## Achados

### Alto

**A-1 · `.claude-plugin/plugin.json` ainda diz `"version": "0.7.0"`** (dono: `engenheiro-software`)
- **Evidência:** o arquivo no HEAD.
- **Consequência:** o README (linhas 269–271) diz "Sem subir o número, os outros PCs não percebem a mudança". O cache do
  Claude Code é por versão: em `~/.claude/plugins/cache/agentes-ultimate/agentes-ultimate/` há uma pasta por versão (0.4.0,
  0.5.0, 0.5.1, 0.7.0). Publicado como está, quem tem a 0.7.0 continua nela, e o aviso "atualizado: 0.7.0 → 0.8.0" não aparece.
- **Correção:** subir para `0.8.0`, junto com o M-1.

**A-2 · A atualização diária abre uma janela de console visível no Windows** (`hooks/atualizar.js:53`; dono: `engenheiro-software`)
- **Evidência:** reproduzi a mesma cadeia que o gancho usa: `spawn(cmd, { shell: true, detached: true, stdio: [...log], windowsHide: true })`.
  O comando filho, rodado pelo `cmd`, recebeu janela **visível**: `janela=6490532 visivel=True`. A chamada direta com
  `windowsHide` não teve janela (`janela=0 visivel=False`). O comando real é `claude plugin marketplace update … && claude plugin update …`,
  e o `claude.exe` desta máquina é um programa de console (`PE32+ … (console)`). Então 2 janelas abrem uma vez por dia, no
  início da 1ª sessão, e ficam abertas enquanto o comando roda.
- **Por que acontece:** com `detached`, o Windows ignora o "sem janela" do `cmd`. O `cmd` fica sem console, e cada programa de
  console que ele chama ganha um console novo, visível.
- **Por que é Alto:** é a classe de defeito que o usuário já achou ("janela piscando"). O CHANGELOG da 0.8.0 diz que ela foi
  resolvida, e o `validar.js` não pega o caso `shell` + `detached`. Não é regressão (o código é igual ao da 0.7.0).
- **Correção provada:** um `node` destacado, sem shell, que roda o `claude` com `spawnSync(..., { windowsHide: true })`. Na mesma
  sonda deu `janela=0 visivel=False` (`janela2.js`). Vale acrescentar ao `scripts/chamadas-processo.js` uma regra que acuse `shell: true`
  junto com `detached: true`. A outra chamada assim, em `mapa-servidor.js:30`, abre o navegador escolhido pelo usuário, que é
  janela de propósito.

### Médio

**M-1 · CHANGELOG da 0.8.0 incompleto e fora de ordem** (dono: `engenheiro-software`)
- **Cabeçalhos:** há três: "0.8.0 · em construção (parte B)", "0.8.0 · em construção (parte A)" e "0.8.0 · lote sites-premium (ramo
  lote-sites)". O último está **depois do 0.1.0** (linha 586). Nenhum tem data.
- **O que falta registrar:**
  - trava, 4ª rodada: M-12, M-13, b-13, b-14 e b-15;
  - binário fora do teto (`7f280df`);
  - sites, 4ª rodada: A-1 ("tela de/do/da" ambíguas), ganho barato, M-11, b-15, b-16;
  - sites, 5ª rodada: A-2, M-11, M-12 ("era com" depois do desempate), b-17, b-18;
  - provas pv92 e pv94 e o diagnóstico;
  - vitrine "Clara 35";
  - **im99 inteiro:** padrão impressiona, `designer-interface` (32º agente), `modelos/liquid-glass/`, `vitrine-apple.md` e os 3
    erros reais de rota no eval.
- **Prova:** `grep` por "designer-interface", "impressiona", "M-12", "tela de/do/da", "binári", "vitrine" e "pv94" no CHANGELOG:
  só aparece o M-11 da 3ª rodada da trava.
- **Correção:** um cabeçalho só, "0.8.0 · <data>", no topo, com o lote de sites dentro dele e as entradas que faltam.

**M-2 · Menções à empresa e ao repositório do usuário no repositório público** (dono: `engenheiro-software`; decisão do usuário)
- **Novas na 0.8.0 (ainda não publicadas):**
  - `docs/provas/0.8.0-design/vitrine/LEIA-ME.md:3` (a frase que dizia que nada era da empresa do usuário);
  - `docs/revisao-0.8.0-parteA.md`, linhas 65, 101, 194, 317, 394, 576, 606, 612, 617 e 623–627 (o nome da empresa, a árvore e o repositório
    do projeto piloto do usuário);
  - `docs/revisao-0.8.0-sites.md:223`.
- **Já publicadas na 0.7.0:**
  - `scripts/testar-hooks.js:84` (o pedido de teste citava a empresa e dois clientes reais);
  - `docs/revisao-0.7.0.md:331` e `:388` (nomes reais de empresa e de cliente);
  - `docs/plano-0.7.md:225`.
- **Nada achado de:** segredo (busca por padrões de chave AWS, GitHub, Anthropic, OpenAI, Slack e PEM), caminho de pasta de usuário,
  nome de usuário do Windows, e-mail real (só exemplos fictícios), dado real. As mensagens dos 144 commits a publicar não citam nenhum desses
  termos.
- **Ficam por decisão do dono:** "Matheus Oliveira" e "MatheusOliveira572" no manifesto, no LICENSE e no README (é a identidade
  pública do repositório) e o e-mail de autor dos commits.
- **Correção:** trocar por nomes fictícios ("Empresa X", "Cliente Y"; o caso de teste não perde nada) e tirar as frases "nada da
  <empresa>". Nos arquivos novos, antes do push: depois, ficam no histórico.

**M-3 · Peso: a árvore tem 31 MB, dos quais 26,6 MB são 76 PNGs de provas** (decisão do usuário)
- **Comparação com a 0.7.0:** no cache local, a 0.7.0 ocupa 2,5 MB.
- **Como o Claude Code instala:** a cópia do marketplace é rasa (`.git/shallow`, 1 commit), então quem instala baixa só a
  árvore. Mas baixa 31 MB, guarda mais 31 MB por versão no cache, e o plugin não usa nenhum PNG para funcionar.
- **No GitHub:** o push leva 69,8 MB de blobs novos. São 52,4 MB em 123 blobs de imagem, contando versões antigas
  (`site-claro-1920.png` tem 5 versões).
- **Opções:**
  - (a) publicar assim: 31 MB por instalação;
  - (b) recomendado: antes do push, um commit que tira ou comprime os PNGs pesados das provas (os 5 da v2 com cerca de 1,2 MB
    cada; os de `0.8.0-sites/png`), deixando 2 ou 3 por prova. A instalação cai para cerca de 5 MB; o histórico continua com os 52 MB;
  - (c) reescrever os 144 commits locais para tirar os blobs: histórico limpo, mas arriscado e difícil de desfazer.
- **Áreas que opinam:** o `designer-paineis` / `designer-sites` (quais PNGs são prova necessária).

**M-4 · O padrão "impressiona" não tem nenhum caso na bateria: 11 de 15 mutantes escaparam** (dono: `engenheiro-software`)
- **Os 11 que escaparam** (mutação numa cópia; `validar` + `liquid-glass` + `eval-roteamento` + `testar-sites` em cada):
  - tirar a régua do critério de pronto do `designer-interface`, do `designer-paineis` e do `designer-documentos`;
  - tirar o passo da junção do `designer-interface`;
  - tirar a régua das responsabilidades do revisor;
  - afrouxar o VERMELHO do revisor para 3 ou mais itens;
  - tirar o item 8 (movimento, transparência e contraste) do `impressionar.md`;
  - trocar "pixel a pixel" por "na média" no `impressionar.md`;
  - tirar o "Teste de junção" do `impressionar.md`;
  - tirar a transparência reduzida do critério do `designer-interface`;
  - tirar o `vitrine-apple.md` do índice de efeitos.
- **Os 4 pegos:** pacote de volta ao `designer-paineis`, `liquido.js` somando de novo os `[data-lum]` aninhados, vidro sobre foto
  "na média" no `materiais.md` e descrição sem o "Não use".
- **Por que importa:** nenhum script cita "régua", "camada 1/2", "junção" ou "impressiona". Os grupos G1–G10 têm um caso por
  regra, visto falhando antes; o item 2 do im99 não tem nenhum. O texto de hoje está certo, mas pode sumir numa edição sem que
  nada acuse.
- **Correção:** os casos de presença, no formato G7 (régua e junção nos 4 designers e no revisor; os 8 itens da camada 1;
  "pixel a pixel"), vistos falhando com estes mutantes.

**M-5 · O índice das referências ficou incoerente com o `designer-interface`** (dono: `engenheiro-software`)
- **Arquivos:** `conhecimento/indice.json` e a 2ª linha de cada referência.
- **(a) A régua não vai ao `designer-interface`:** o `impressionar.md` lista `designer-sites, designer-paineis, designer-documentos, revisor`.
  Num pedido de app premium ("redesenhe a tela de login do app com um visual mais moderno"), o roteador manda a régua **só ao
  revisor**. O próprio exemplo `sim` da referência ("redesenhe meu app com visual premium que impressione") cai nisso. O agente
  só a lê pelo próprio corpo, e lá a leitura é condicional ("quando o pedido for amplo ou premium").
- **(b) As referências de painel trocaram de dono:** o `modos/operar.md` (palavras "painel", "dashboard") e os `apple/*` passaram
  a listar o `designer-interface` em 1º. Em pedido de painel sem pacote escolhido, a referência agora vai "para
  designer-interface":
  - "melhore o visual do painel de vendas": `operar.md` ia ao `designer-paineis` em `7f280df`;
  - "aplique liquid glass no painel do power bi": `materiais.md`, `apple/INDICE.md` e `operar.md` vão ao designer de apps,
    mesmo com o `designer-paineis` entre os candidatos, porque vale a ordem da lista (`roteador.js:322`);
  - "calcule as emissões de escopo 2 para o relatório GRI" e "faça um relatório impressionante para o conselho": mesma troca.
- **Risco:** é a pista que o orquestrador lê. É o mesmo tipo de erro real de rota que o im99 quis fechar ("visual → BI" ao contrário).
- **Correção:** pôr o `designer-interface` no `impressionar.md` e o `designer-paineis` antes dele no `operar.md` e no `materiais.md`.
  Rodar a sonda de novo (`refs-dif.js`).

**M-6 · Os 2 designers novos não herdaram as regras G7/G9 que os outros 2 têm** (dono: `engenheiro-software`, com o designer)
- **O que falta:** o `designer-interface` e o `designer-sites` não têm, no critério de pronto, "fonte, ícone e imagem com licença
  que cobre o uso" (G9), que o `designer-paineis` e o `designer-documentos` têm. Também não têm "texto alternativo" ou leitor de
  tela (G7).
- **Prova:** `grep -i "licen|texto alternativo"` nas partes específicas: 0 linhas nos dois.
- **Risco:** é justamente o designer de sites que usa fotos (a vitrine e o caso B ficaram em "paisagem por código" por falta de
  banco licenciado). O `/checklist-lancamento` (L-1) pega isso só antes de publicar.
- **Correção:** 1 linha no critério de cada um (cabe nas 90 linhas: hoje são 80 e 82) e o caso G9 estendido.

### Baixo

- **b-1** README, tabela de skills: lista 10 das 13. Faltam `atualizar-fontes`, `auditoria-completa` e `integracoes`; a
  `/auditoria-completa` não aparece no README em lugar nenhum. A contagem de agentes (32) e a tabela de pacotes conferem com o
  `pacotes.json`.
- **b-2** `docs/como-funciona.md:116` manda corrigir tela de app com `era com designer-paineis` (agora é o `designer-interface`). A
  linha 121 diz que as referências de mercado estão "(a confirmar)", mas nenhum agente tem mais essa marca.
- **b-3** Fontes nos agentes:
  - o `designer-interface:35` e o `designer-paineis:42` atribuem "regra do pico e do fim" ao artigo `scrolljacking-101` da NN/g.
    A pesquisa do próprio plugin cita a URL certa (`nngroup.com/articles/peak-end-rule/`, `docs/pesquisa-impressionar-2026-11.md:36`);
  - o `designer-paineis:42` cita `docs/pesquisa-impressionar-2026-11.md` sem `${CLAUDE_PLUGIN_ROOT}`, e no projeto do usuário esse
    caminho não existe;
  - os "Erros conhecidos" do `designer-interface` citam "(prova pv92)" e "(prova pv94)", códigos internos.
- **b-4** O `apple/materiais.md` diz "grade 4 × 4 por foto" para a tinta. O modelo usa 8 × 8, e o LEIA-ME da e2e diz que o 4 × 4
  "não via as nuvens".
- **b-5** Régua aplicada por mim aos PNGs (camada 2, item 15, acabamento): 1 "não" em cada prova, nenhum declarado. Pela régua, é
  AMARELO. Dono: designer.
  - **Vitrine** (`vitrine-claro-1440.png`, `vitrine-escuro-1440.png`): a coluna de brilho sob a lente é um retângulo de bordas
    retas, mais visível no escuro. Há também uma fresta castanha na base da lente (ampliação 4×).
  - **Caso B v2** (`caso-b-produto-v2-claro-1440.png` e `-rolado.png`): a extensão de fundo vaza cerca de 20 px à direita da barra
    lateral, numa faixa borrada entre a barra e o mosaico. O `materiais.md` pede "máscara antes da borda do conteúdo".
  - **Caso A v2:** passou nos 8 itens da camada 2. A coerência confere (5 de 12 = 42%; "Hoje 5 de 8"; projetos 2+1+3+1 = 7
    abertas). Medi o contraste das tarefas feitas: 5,35:1.
- **b-6** LEIA-MEs desatualizados: o da vitrine (linha 91) ainda pede "Decidir qual vale" sobre o vidro em cima de foto, já decidido
  em 2026-11-02; o de `docs/provas/0.8.0-design/` chama a pv92 de "prova mais nova", e há a pv94.
- **b-7** Só o `designer-sites` diz "sem imitar os blocos de uma referência". A régua manda nomear "uma referência da categoria e o
  que ela ainda faz melhor", mas não diz "sem copiar composição nem layout". O item 9 ("tirando o logo, ainda é só deste
  produto") cobre a ideia, não a composição. Vale 1 frase no `impressionar.md`.

### Conferido sem achado
- **Padrão "impressiona" no texto:** os 4 designers e o revisor têm a régua de 2 camadas, o teste de junção, contraste no pior
  ponto (pixel a pixel sobre foto e vidro), teclado e foco, movimento e transparência reduzidos e contraste mais. Linhas antes do
  protocolo: interface 80, sites 82, painéis 87, documentos 73, revisor 89 (todas ≤ 90). As decisões do usuário estão no texto,
  sem reabrir: vidro de landing sobre foto com contraste medido; designer-interface separado; Apple + Liquid Glass + 3D +
  revelação, com "um efeito dominante". O que falta é teste (M-4) e índice (M-5).
- **Terceiros:**
  - 12 fontes em `fontes/fontes.json`;
  - 11 pastas em `terceiros/`, cada uma com LICENSE (a do impeccable também com NOTICE);
  - o `dickwu/apple-design-skill` não tem licença e nada foi copiado dele, como o CREDITOS declara;
  - o `CREDITOS.md` tem os commits fixos;
  - `modelos/liquid-glass/` e `vitrine-apple.md` declaram texto próprio, e não achei identificadores de implementações conhecidas
    (SDF e smoothstep são matemática comum);
  - os acréscimos do `materiais.md` são texto nosso, sem trecho em inglês copiado.
- **Ganchos:** só o `atualizar.js` chama `shell` com `detached` (fora o navegador do mapa). O `vigia-fontes` e o `mapa-servidor`
  destacam um `node` sem filho de console.
- **Roteador:** a sonda de 40 pedidos achou 7 pedidos com uma única palavra firme do README ("gargalo", "apresentação", "CPC",
  "ICMS", "painel", "aplicativo") que caem em "o Claude escolhe". Isso é desenho da 0.8.0 (mínimo de 2 pontos) e, em 6 deles,
  igual à 0.7.0. Não contei como achado.

## Mutação (im99), numa cópia `git archive HEAD`
Pegou 4 de 15. O controle sem mutação passou nos 4 testes. A lista dos que escaparam está no M-4. Script:
`rv100/mut.js` (no rascunho do revisor). Decide pelo resumo "N falha(s)" e pela saída.

## Lista de limpeza (não apaguei nada; o motivo de cada um)
| O quê | Peso | Motivo | Sugestão |
|---|---|---|---|
| `docs/provas/0.8.0-design/png/` (8 PNGs), `app-premium.html`, `card-vidro.html` | 1,4 MB | 1ª tentativa (pv92), superada pela e2e (pv94); os 8 PNGs não são citados pelo nome em lugar nenhum | apagar e deixar 1 linha no LEIA-ME |
| `docs/provas/0.8.0-design/e2e/propostas/` (7 arquivos) | 32 KB | rascunhos já aplicados ao `impressionar.md`, `materiais.md`, aos designers, ao revisor e ao `vitrine-apple.md`; 3 caminhos relativos quebrados | apagar |
| `docs/provas/0.8.0-design/e2e/liquido.js` e `liquido.css` | 12 KB | cópia antiga de `modelos/liquid-glass/`, **com o defeito** dos `[data-lum]` aninhados que o im99 corrigiu | o HTML da v2 aponta para `modelos/liquid-glass/` e a cópia sai |
| PNGs v2 de 1440 do caso B (5 de cerca de 1,2 MB) | 6,1 MB | os maiores do repositório | comprimir (WebP ou JPEG) ou ficar com 2 |
| PNGs v1 da e2e (`caso-a-depois-*`, `caso-b-produto-*`, `caso-b-landing-*`) | 3,1 MB | história antes e depois da v1; o LEIA-ME cita | manter 1 par antes e depois e apagar o resto |
| `docs/provas/0.8.0-sites/png/site-claro-1920.png`, `-768.png`, `-905.png` | 2,1 MB | não são citados pelo nome | apagar ou citar |
| `docs/revisao-*.md` (7 arquivos) | cerca de 200 KB | registros de revisão, com as menções do M-2 e tempos desta máquina; o CHANGELOG cita | mover para `docs/revisoes/` e limpar as menções, ou tirar do repositório público (decisão do usuário) |
| `docs/inventario-plugins-2026-11*.md`, `pesquisa-*.md`, `regras-pdfs-2026-11.md`, `referencias-*-2026-11.md`, `plano-0.7.md` | cerca de 300 KB | pesquisas e planos de entrada; o CHANGELOG e o `designer-paineis` citam | manter, agrupados em `docs/pesquisas/` (corrigindo as citações) |
| Fora do push: 4 worktrees (`au-prova`, `au-seg`, `au-sites`, `au-vigia`) e os ramos `prova-design`, `lotes-seguranca`, `lote-sites`, `vigia-fontes` | — | todos já juntados (0 commit fora da `main`), sem mudança pendente | `git worktree remove` e `git branch -d` |
| Falsos órfãos (ficam) | — | os 4 `test-*.cjs` do `teardown` são usados pela ferramenta; os `assets/` citados em `referencia-original/` são do original, que é mantido como veio | nada |

## Lista do usuário (o que só você prova)
1. Na 1ª sessão do dia, veja se abre uma janela preta de console por alguns segundos (A-2). Depois da correção, não deve abrir.
2. Decida o peso (M-3: a, b ou c) e as menções (M-2) **antes** do push: depois, ficam no histórico público.
3. Abra `docs/provas/0.8.0-design/vitrine/png/vitrine-escuro-1440.png` e `docs/provas/0.8.0-design/e2e/png/caso-b-produto-v2-claro-1440-rolado.png`.
   A coluna retangular de brilho e a faixa borrada à direita da barra incomodam (b-5)?
4. No push, a trava vai perguntar sobre publicar. Veja se a resposta vem em menos de 7 s com os 144 commits. Não medi: a trava
   deste projeto barra qualquer comando com o texto do push. Se passar de 7 s, aparece "não deu para conferir" (limite declarado M-11).
5. Depois de publicar com a versão nova, veja a linha "agentes-ultimate atualizado: 0.7.0 → 0.8.0" na sessão seguinte.

## Pendências e o que não verifiquei
- Rede bloqueada daqui: não abri a página da NN/g (b-3 se apoia na URL citada pela própria pesquisa do plugin) nem rodei o
  `validar.js --links`.
- Não rodei os verificadores das provas (`verificar.js`, `verificar-v2.js`) nem o Edge, por falta de memória (cerca de 1,7 GB
  livre). A régua nos PNGs foi aplicada a olho, com ampliação.
- A mutação usou um conjunto menor de testes (validar, liquid-glass, eval de roteamento e sites), não a bateria inteira. Uma
  busca nos `scripts/` confirma que nenhum outro caso cita a régua, a junção ou o `impressionar.md`.

Placar: autor=engenheiro-software cod=im99 veredito=não B=0 A=2 M=6 b=7 ids=A-1,A-2,M-1,M-2,M-3,M-4,M-5,M-6,b-1,b-2,b-3,b-4,b-5,b-6,b-7
