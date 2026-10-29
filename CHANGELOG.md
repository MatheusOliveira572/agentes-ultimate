# Mudanças

## 0.7.0 · 2026-10-28
- **Verificações (bloco 0, Claude Code 2.1.302, detalhes no topo de `docs/plano-0.7.md`):**
  - o plugin liga a barra pelo próprio `settings.json` (o plano supunha que não; a skill `instalar-barra` não foi
    necessária);
  - `claude plugin eval` existe;
  - os campos reais dos ganchos `Agent`, `SubagentStart` e `SubagentStop`. O `SubagentStop` chega 2 vezes por agente.
- **Registro de cada execução** (`hooks/execucoes.js`): ciclo de vida do agente em `.claude/base/.agentes.jsonl`
  (pedido → lançado → início → fim). Uma linha por execução em `~/.claude/agentes-ultimate/execucoes.jsonl`, com:
  - agente, tipo de tarefa (`pacotes/classes-tarefa.json`), minutos pelas pontas da transcrição (256 KB de cada lado);
  - faixa registrada, código do pedido e código anônimo do projeto;
  - nunca o pedido nem o caminho.
- **Código do pedido `[cod:xxxx]`** na descrição do agente: liga progresso, faixa, registro e placar, e separa dois
  agentes do mesmo tipo trabalhando ao mesmo tempo.
- **Estimativa** (`scripts/estimar.js`):
  - `faixa` usa a classe de referência em cascata (agente+classe → agente → classe → todos, até n ≥ 3) e dá a
    mediana e o p75 dos minutos reais;
  - com `--estimado`, corrige pelo fator real ÷ estimado; sem histórico, estimado × 1 a × 2;
  - `--registrar` grava a mesma faixa;
  - `registrar` é o único jeito de gravar a faixa (UTF-8 garantido);
  - `importar` traz as execuções antigas das transcrições do projeto.
  - A skill `ultimate` manda calcular, registrar e dizer a faixa com a base.
- **Progresso:** o protocolo comum ganha o passo 10: gravar `.claude/base/.progresso/<agente>-<código>.json`
  (feito, total, etapa) ao fim de cada etapa. `validar.js` exige o passo e a ferramenta `Write` em todo agente.
- **Barra por agente** no painel do Claude Code (`hooks/barra.js`): barra, %, etapa, minutos e "fim 14h10–14h50"
  ou "passou da previsão (+n min)". Liga pelo `settings.json` do plugin, por um lançador fixo
  (`~/.claude/agentes-ultimate/barra.js`) que o início de sessão regrava, porque o comando da barra não recebe
  `CLAUDE_PLUGIN_ROOT`.
- **Placar** (`scripts/placar.js`, skills `placar` e `registrar-defeito`):
  - o revisor termina o relatório com a linha fixa `Placar: autor= cod= veredito= B= A= M= b=`, que o gancho lê da
    última mensagem ou do fim da transcrição;
  - por agente: de primeira, defeitos por gravidade, escaparam ao usuário, retrabalho e acerto da faixa, mais a taxa
    de captura do revisor;
  - revisor sem a linha vira aviso em `estado.json`; novo caso 6 no eval do revisor.
- **Mapa ao vivo · "Agentes agora":**
  - painel lateral com cada agente trabalhando: cor, barra de %, etapa em até 4 palavras, "termina por volta de
    17h40" (pelo ritmo do progresso ou pela faixa), "passou da previsão" ou "terminou às";
  - aviso e linha no "Ao vivo" quando cada agente termina;
  - anel de progresso no marcador do agente; nome do agente sem o prefixo do plugin;
  - nova rota `/agentes`.
- Testes dos ganchos: 89 casos (37 novos, cada um visto falhando antes da mudança). Os commits dos blocos 1 a 3
  dizem 65, 70 e 78 casos; os números certos são 63, 68 e 76.

### Correções da revisão independente (`docs/revisao-0.7.0.md`), antes de publicar
A versão continua 0.7.0 (não tinha sido publicada). Um commit por item.
- **A-1 · fim do agente lento com o histórico:**
  - antes, o `SubagentStop` refazia o placar inteiro, com custo quadrático (2,4 s com 10 mil execuções, 122 s com
    60 mil);
  - agora o gancho só acrescenta a linha e atualiza, pelo trecho novo, um índice por chave
    (`~/.claude/agentes-ultimate/.indice-*.json`: primeira revisão por trabalho; minutos e fator por chave, os 500
    mais recentes);
  - o placar completo é refeito só pela skill `placar` e pelo registro de defeito; o retrabalho é calculado numa
    passada;
  - barra, mapa e `estimar.js faixa` usam o mesmo resumo;
  - medido com 60 mil execuções e 20 mil revisões: o fim do agente custa até 0,3 s além de abrir o Node (281 ms, com
    Node vazio a 163 ms; 187 ms numa medida com a máquina livre), e a barra também;
  - o placar dá o mesmo resultado da regra antiga.
- **M-1 · agente parado:** agente parado (`TaskStop`) ou sessão fechada não fica mais "trabalhando":
  - passou do fim da faixa + 30 min sem progresso (sem faixa, início + 3 h), vira "sem notícia" (cinza) e sai do
    painel 2 h depois;
  - o início de sessão tira do painel os agentes sem sinal de sessões anteriores (se ainda terminarem, o registro
    vale).
- **M-2 · troca de código:** dois agentes do mesmo tipo lançados juntos não trocam mais de código. A ligação vem do
  par certo, não da ordem de chegada:
  - o `.meta.json` que o Claude Code grava ao lado da transcrição do agente;
  - o `PostToolUse` do `Agent` (com `agentId` e a descrição);
  - o `tool_use_id`.

  O pedido mais antigo do mesmo tipo vira só palpite provisório. Provado com 20 rodadas, inícios a 5 ms.
- **M-3 · regra do código:** o código é do **trabalho**:
  - correção do mesmo trabalho reusa o código do autor (é o retrabalho);
  - o revisor recebe `[revisa:xxxx]`, não `[cod:]`, e não herda faixa nem progresso;
  - o código só é lido da descrição;
  - a faixa vale só para o mesmo agente, e o `estimar.js` recusa o código de outro agente.
- **M-4 · % estimado:**
  - sem progresso gravado, o % aparece como estimado: barra tracejada e "~21% (estimado)" no painel, "▒" e "~21%"
    na barra;
  - o término pelo ritmo das etapas fica dentro da faixa.
- **M-5:** casos para os mutantes B2 (cascata em par), C1 (valor do retrabalho) e C2 ("de primeira" por trabalho).
  Mutação numa cópia: os 3 são pegos.
- **M-6 · achado contado duas vezes:** a linha fixa do revisor ganha `ids=A-1,M-2,…`, e o achado ainda aberto mantém
  o id. O placar conta cada achado uma vez por trabalho (sem ids: o maior número de cada gravidade entre as revisões).
- **b-5 · privacidade:** `ultimo-pedido.json` e os exemplos do "era com" guardam só os termos do pedido (sem
  valores, números, caminhos nem e-mails), nunca o texto; os exemplos antigos são convertidos.
- **Baixos:**
  - b-1: `AGENTES_ULTIMATE_SEM_PASTA=1` desliga o registro;
  - b-2: texto da faixa sem o "sem histórico" errado;
  - b-3: lançador também no `$HOME` quando ele difere da pasta do usuário;
  - b-4: trava contra o `SubagentStop` repetido em paralelo;
  - b-6: código da linha Placar limitado a 16 caracteres;
  - b-7: prova dos casos "falhando antes" em `docs/provas/0.7.0-casos-antes.md` (69 de 73 casos novos falham na
    0.6.0; os 4 que passam são negativos).
- **Prova visual** (`docs/provas/0.7.0-painel/`, Edge sem interface, 0 erro de JavaScript): achou e corrigiu duas
  coisas.
  - O card "sem notícia" mostrava a barra estimada perto de 99% (parecia "quase pronto") e a etapa "trabalhando".
    Agora mostra só o progresso informado e "nenhuma etapa informada" ou "última etapa: …".
  - Ao trocar o tema com a página aberta, o painel ficava com as cores do tema anterior. Agora se redesenha.
- Fica para depois: sal no código anônimo do projeto (b-6; tudo é local hoje) e retrabalho pelas correções "era com"
  (b-7; o registro não guarda qual agente estava errado).
- Testes dos ganchos: 125 casos, todos passando.

### Correções da 2ª rodada da revisão (pode publicar = sim; antes do push)
- **M-7 · faixa da construção herdada pela correção:** a correção que reusa o código herdava a faixa da construção
  ("passou da previsão · +398 min" já no início, fator 0,17 no histórico). Agora a faixa com código só vale se é do
  mesmo agente e foi registrada perto do início desta execução (de 15 min antes até 3 h depois). Sem faixa própria,
  a previsão vem da classe de referência, e a execução fica fora do fator (fonte "sem"). A skill `ultimate` manda
  registrar faixa nova na correção.
- **b-8:** abrir outra sessão no mesmo projeto não tira mais do painel um agente vivo dentro da faixa: usa o mesmo
  prazo do painel.
- **b-9:** texto do caso e do comentário. Na 2.1.302 o `.meta.json` do agente só existe no fim; no início, vale o
  palpite até o `PostToolUse` ou o `SubagentStop`.
- **b-10:** casos que pegam os mutantes M4 (teto do término pela faixa, com progresso acima de 15%) e M2b (trava do
  fim testada sem depender de corrida).
- **b-11:** os termos guardados descartam palavras com inicial maiúscula fora do começo da frase (prováveis nomes de
  pessoa, empresa ou cliente).
- **b-12:** sai o campo `primeira` do registro das revisões. Ele ficava nulo com histórico grande e era uma 2ª fonte
  para a regra que o placar calcula.
- **Modelo e esforço por tarefa:** o roteador lê `"modelo_por_tarefa"` no `config.json` do usuário e no do projeto.
  O projeto vence, inclusive com `false`. Ligada, a política põe no contexto a linha que manda passar `model` e
  `effort` pela tabela da skill `ultimate` §1b. README com a seção Configuração.
- Testes dos ganchos: 136 casos, todos passando.

## 0.6.0 · 2026-10-28
- **Mapa sem F5:** o servidor avisa a página quando o último pedido muda (`tipo:"busca"`: destaques, caixa "Último
  pedido" e arquivo citado que ainda não estava no desenho) e quando o grafo refeito muda (`tipo:"grafo"`: a página
  busca `/dados` e junta sem embaralhar; quem já está fica onde está, quem chega entra perto dos vizinhos). O grafo é
  refeito também 8 s depois de uma edição ou arquivo novo. `mapa-visual.js` exporta `dados(cwd)`.
- **Ligações feitas sozinhas:** quando um agente lê A e depois edita ou cria B, nasce a ligação de uso A → B com um
  cometa, que fica como trilha durante a sessão; arquivo novo surge com uma onda perto do que o agente lia, ligado a
  ele (provisório, até o grafo refeito trazer as ligações de "cita").
- **Marcador por agente** com nome e cor, que desliza até o arquivo tocado; partículas no caminho ativo; botão
  "Seguir" (a câmera acompanha; desliga ao arrastar); contador da sessão (lidos, editados, criados, agentes ativos).
- **Acabamento:** entrada em cascata, grafo "respirando" em repouso, ligações em curva com peso pela relevância,
  pastas como regiões com halo e nome, cartões em vidro fosco ao passar o mouse e ao clicar, zoom e arraste com
  inércia, botão "Enquadrar", rótulos sem sobreposição, claro e escuro automáticos, respeita "reduzir movimento".
- **Tudo automático:** gancho `Stop` anota o fim do trabalho e o mapa avisa "Trabalho concluído · X lidos, Y
  editados, Z criados", com os marcadores pousando e a trilha em destaque. Abrir sozinho também pela configuração do
  usuário (`~/.claude/agentes-ultimate/config.json` → `"mapa": { "abrir_sozinho": true }`; a do projeto prevalece);
  no início da sessão não abre outra janela se já houver aba conectada. Servidor de versão antiga é trocado sozinho.
- Testes dos ganchos: 52 casos.

## 0.5.1 · 2026-10-27
- **Delegar é o padrão:** pedido com trabalho de especialista vai para os agentes; o orquestrador coordena, junta,
  cobra prova e chama o revisor. Antes, a instrução "se for simples, responda direto" fazia o Claude trabalhar sozinho.
  Projeto pode trocar com `"delegar": "quando-precisar"` no `config.json`.
- **Nome certo do agente:** o contexto passa o `subagent_type` completo (`agentes-ultimate:<nome>`); os agentes do
  projeto (equivalências) vão sem prefixo.
- **Vocabulário não achou a área? O Claude decide:** recebe o catálogo inteiro (área → agentes) e escolhe pelo assunto,
  em vez de cair no núcleo. O catálogo também vai quando há pacote, para acrescentar outra área se faltar.
- Plural em cada palavra das expressões ("unidades de negócios" acha "unidade de negócio"); vocabulário de pessoal e
  folha (headcount, folha, verba, grade, quadro de pessoal) e de planilha (Excel, xlsx).
- Mapa ignora o arquivo temporário do Office (`~$…`).
- Testes dos ganchos: 45 casos.

## 0.5.0 · 2026-10-27
- **Mapa ao vivo:** gancho `PostToolUse` (`hooks/atividade.js`) anota cada arquivo lido, editado, criado ou
  procurado, e por qual agente (só o caminho, em `.claude/base/.atividade.jsonl`, fora do git). Servidor local
  (`hooks/mapa-servidor.js`, 127.0.0.1, para sozinho após 2 h sem uso) transmite na hora: o arquivo acende na cor do
  agente, edição fica vermelha, arquivo novo vira ponto novo, e a lista "Ao vivo" mostra quem fez o quê.
- Abrir: skill `ver-mapa` ("mostre o mapa"), ou sozinho a cada sessão com `"mapa": { "abrir_sozinho": true }` no
  `.claude/base/config.json` do projeto (desligado por padrão).
- Testes dos ganchos: 41 casos (atividade, servidor, transmissão, abertura automática).

## 0.4.1 · 2026-10-27
- **Mapa visual** (`hooks/mapa-visual.js`, skill `ver-mapa`): página HTML sem internet com o grafo do projeto
  (arquivos, quem cita quem, anotações da memória) e o caminho que o último pedido usou em destaque; clique, zoom,
  busca. O roteador guarda o último pedido em `.claude/base/.ultima-busca.json`.
- `.claude/base/.gitignore` de versões antigas ganha as linhas dos arquivos gerados que faltarem.
- Testes dos ganchos: 36 casos.

## 0.4.0 · 2026-10-27
- **16 agentes novos para as áreas da empresa:** RH (`analista-rh`, `recrutador`), Jurídico (`advogado-contratos`,
  `especialista-lgpd`), Compliance (`analista-compliance`), Contábil e tributário (`contador`,
  `especialista-tributario`), Tesouraria (`analista-tesouraria`), Comercial (`executivo-vendas`), Marketing
  (`estrategista-marketing`), Clientes (`especialista-cs`), Operações (`analista-operacoes`, `comprador`), Estratégia
  (`estrategista`), Comunicação (`comunicador-corporativo`) e ESG (`especialista-esg`). 17 pacotes no total.
- **Padrão de excelência** (`docs/padrao-agente.md`), cobrado pelo validador: 3 a 5 referências com fonte aberta, das
  quais **pelo menos 3 empresas diferentes** reconhecidas como as melhores daquela função (`[empresa]`); normas e
  autores só completam; leis ficam no método. 3 a 20 evals por agente, com regressão e gatilho negativo.
- Os 14 agentes anteriores refeitos nesse padrão: referências trocadas por empresas, práticas delas viraram passos do
  método, evals novos em `evals/`.
- **Config por projeto** (`.claude/base/config.json`): troca os agentes do plugin pelos do projeto, lê memórias que o
  projeto já tinha e desliga pacotes.
- Roteador ignora relatórios de agentes e avisos do sistema que chegam como mensagem.
- Testes dos ganchos: 33 casos.

## 0.3.1 · 2026-10-27
- **Correção de privacidade:** em repositório git, o grafo e o mapa automático só incluem o que o git não ignora
  (`git ls-files -co --exclude-standard`). Antes, pastas de dados fora do git (ex.: saídas com valores) entravam no
  `MAPA-AUTO.md` local. Teste novo.

## 0.3.0 · 2026-10-27
- **Atualização automática** (`hooks/atualizar.js`, SessionStart): no máximo 1 vez por dia, em segundo plano, roda
  `claude plugin marketplace update agentes-ultimate` e `claude plugin update agentes-ultimate@agentes-ultimate`; na
  sessão seguinte avisa a versão nova. Desliga com `AGENTES_ULTIMATE_SEM_AUTOATUALIZAR=1`; não roda em cópia local
  (`--plugin-dir`). Registro em `~/.claude/agentes-ultimate/atualizacao.log`.
- Testes dos ganchos: 25 casos (4 novos da atualização, com um `claude` falso).

## 0.2.0 · 2026-10-27
- **Grafo do projeto** (`hooks/grafo.js`): mapa automático (`.claude/base/MAPA-AUTO.md`) com o que é cada arquivo e
  quem cita quem; registros da memória ligados aos arquivos; busca do "já feito" com sinônimos
  (`pacotes/sinonimos.json`) e 1 salto pelas ligações. Sem IA, local, com limite de tempo.
- Protocolo comum: situar-se pelo mapa automático e pelos arquivos ligados; citar sempre o caminho dos arquivos na
  memória (é o que liga a memória ao mapa).
- Roteador: plural simples nas palavras dos pacotes; arquivo da pasta só reforça (sozinho não puxa pacote); pedido com
  assunto abaixo do mínimo vai para o núcleo em vez de ser tratado como trivial.
- `.claude/base/.gitignore` criado sozinho (o grafo e o mapa automático ficam fora do git).
- Testes dos ganchos: 21 casos.

## 0.1.0 · 2026-10-27
- Primeira versão: 14 agentes em 6 pacotes (núcleo, BI, Finanças, Produto, Software, Documentos), protocolo comum
  gerado, skills `ultimate`, `rodada`, `fechar-etapa`, `criar-agente`, `rascunho` e `metodo-powerbi`.
- Escolha automática por pedido e pasta, com aprendizado por `era com <agente>`.
- "Já feito sobre isto": diário, lições e mapa relacionados entram no contexto antes de começar.
- Memória do projeto criada na primeira vez (`.claude/base/`).
- Travas: confirmação para publicar; bloqueio de commit com arquivo sensível e de heredoc com barra invertida.
- Validador, gerador e testes dos ganchos (15 casos).
