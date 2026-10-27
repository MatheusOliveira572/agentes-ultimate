# Mudanças

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
