<!-- Adaptado de pbakaus/impeccable/skill/reference/critique.md @e89e3ad (Reference Material), © 2025 Paul Bakaus, Apache-2.0. Alterações: tradução e condensação das tabelas de nota, da carga cognitiva e das personas; alterado por agentes-ultimate. Licença em terceiros/pbakaus-impeccable/ (com NOTICE.md). -->
<!-- ref: tema=heuristicas; palavras=heuristicas de nielsen, nota de usabilidade, carga cognitiva, personas, persona, memoria de trabalho, excesso de opcoes; agentes=designer-paineis, designer-documentos, revisor -->
<!-- teste-ref: sim=dê nota às heurísticas de Nielsen desta tela e avalie a carga cognitiva | teste a tela com personas: usuário avançado e quem usa pela primeira vez; nao=atualize a planilha de comissões -->
# Heurísticas, carga cognitiva e personas (material de apoio da crítica)

## As 10 heurísticas de Nielsen, nota 0–4
Régua comum a todas: **0** ausente/quebrado; **1** raro, a maior parte falha; **2** parcial, lacunas grandes; **3** bom,
lacunas pequenas; **4** excelente em toda a tela.
| # | Heurística | 0 parece com | 4 parece com |
|---|---|---|---|
| 1 | Visibilidade do estado do sistema | nenhum retorno; o usuário adivinha | toda ação confirma; progresso sempre visível |
| 2 | Sistema × mundo real | jargão técnico puro | fala a língua do usuário em tudo |
| 3 | Controle e liberdade | o usuário fica preso; só recarregando | desfazer, cancelar, voltar e sair em todo lugar |
| 4 | Consistência e padrões | parecem produtos diferentes colados | o mesmo padrão em tudo, como a plataforma |
| 5 | Prevenção de erro | fácil errar e perder trabalho | o erro é difícil de cometer; confirmação onde destrói |
| 6 | Reconhecer em vez de lembrar | exige lembrar código, caminho, valor | tudo o que precisa está à vista |
| 7 | Flexibilidade e eficiência | um só caminho lento | atalhos e padrões para quem é avançado, sem atrapalhar o novato |
| 8 | Estética e minimalismo | ruído compete com o essencial | só o que serve à tarefa |
| 9 | Recuperação de erro | mensagem técnica sem saída | diz o problema e como resolver, com o dado preservado |
| 10 | Ajuda e documentação | nenhuma | ajuda contextual, curta, no ponto da dúvida |
Faixas do total (de 40): 36–40 excelente (só acabamento); 28–35 bom (atacar os pontos fracos); 20–27 aceitável (melhorias
grandes antes de agradar); 12–19 fraco (refazer a experiência); 0–11 crítico (redesenho). Com "n/a", leia pela
porcentagem: 90%+ excelente, 70%+ bom, 50%+ aceitável, 30%+ fraco, abaixo disso crítico (24/32 = 75% = bom).

## Carga cognitiva
Três tipos: **intrínseca** (a tarefa em si; não se tira, se organiza), **estranha** (o desenho ruim; é a que se corta),
**germânica** (o esforço de aprender o modelo; vale quando paga depois).
Lista de 8 itens:
- [ ] foco único: a tarefa principal sem distração de elementos concorrentes;
- [ ] blocos: informação em grupos de até 4 itens;
- [ ] agrupamento visual do que é relacionado (proximidade, borda, fundo);
- [ ] hierarquia: o mais importante é óbvio na hora;
- [ ] uma decisão por vez;
- [ ] poucas escolhas: até 4 opções visíveis por decisão;
- [ ] memória de trabalho: não exige lembrar dado da tela anterior para agir nesta;
- [ ] revelação progressiva: a complexidade aparece quando precisa.
Memória de trabalho: até 4 itens, administrável; 5–7, no limite (agrupe ou revele aos poucos); 8+, sobrecarga (o usuário
pula, erra o clique ou desiste).
Violações comuns: parede de opções; ponte de memória (lembrar de uma tela para outra); navegação escondida; barreira de
jargão; ruído visual de fundo; padrão inconsistente; várias tarefas ao mesmo tempo; troca de contexto.

## Personas (escolha 2–3 pelo tipo de tela; com contexto do projeto, mais 1–2 dele)
- **Avançado** (usa todo dia, quer rapidez): falta de atalho de teclado, muitos cliques na ação principal, introdução
  forçada, nada em lote.
- **Primeira vez:** navegação só com ícones, jargão no erro, ajuda invisível, primeiro passo incerto.
- **Com deficiência** (teclado, leitor de tela, baixa visão): foco perdido, nome ausente, contraste baixo, zoom quebrando.
- **Com pressa no celular:** alvo pequeno, texto longo, ação no lugar que o polegar não alcança, carga lenta.
- **Quem decide e lê o resumo** (executivo): a resposta não está no topo, números sem contexto, unidade ambígua.
Para cada uma: percorra a ação principal e liste o que quebrou, com o elemento exato.
