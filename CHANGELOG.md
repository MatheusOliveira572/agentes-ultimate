# Mudanças

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
