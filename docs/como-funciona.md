# Como funciona

## 1. A escolha automática (`hooks/roteador.js`)

Roda a cada pedido, antes do Claude responder. Sem IA, em milissegundos.

1. **Pedido trivial** (curto e sem assunto de nenhum pacote): não faz nada. O Claude responde direto.
2. **Pontos por pacote** (`pacotes/pacotes.json`): palavra do pedido = 1; expressão de 2+ palavras = 2; arquivo na
   pasta (raiz + 1 nível) = 2. Entram os pacotes com pontos ≥ `minimo` (2). Acentos e maiúsculas não importam.
   - **Ambíguas** (`pacotes.json` → `ambiguas`): palavra que serve a várias áreas ("visual", "tela de") vale 0,5 e,
     sozinha, não escolhe pacote.
   - **Pares** (`pacotes.json` → `<pacote>.pares`): verbo + artigo opcional + "novo" opcional + alvo vale 2 ("crie um
     site", "refaça a homepage"). O verbo solto vale 0: "faça login no site do banco" não é pedido de site.
   - **Desempate entre áreas vizinhas** (`pacotes.json` → `desempate`, hoje sites × interface): primeiro a **âncora**,
     o que o pedido diz que é o produto (site, landing, homepage × app, aplicativo, sistema). Se só um lado tem âncora e
     algum dos dois passou do mínimo, esse lado fica com o pedido e com os pontos do outro ("site em react com efeito
     vidro" é site). Âncora nos dois, ou em nenhum: fica o de mais pontos; empate, os dois. Âncora negada ("não é um
     app") não conta.
3. **Suas correções:** quando você diz `era com <agente>`, o pedido anterior é guardado com esse agente. Um pedido novo
   que divida ≥ 50% das palavras com um guardado ganha +3 pontos no pacote daquele agente.
4. **Já feito (`hooks/grafo.js`):** o grafo do projeto tem como nós os arquivos (cada um com uma linha tirada do 1º
   título ou comentário) e como ligações "A cita B" (o nome do arquivo B aparece em A). Os registros da memória
   (diário, lições, decisões, mapa) ficam ligados aos arquivos que mencionam. A busca:
   - transforma o pedido em termos: sem acento, no singular, e pelo grupo de sinônimos (`pacotes/sinonimos.json`);
   - pontua arquivos (nome + descrição) e registros que dividem termos com o pedido; registro ligado a um arquivo do
     assunto ganha pontos;
   - dá **1 salto** pelas ligações: arquivos que citam ou são citados pelos do assunto entram como "ligado".
   O grafo é refeito quando tem mais de 10 minutos ou quando o commit muda, em no máximo ~2,5 s (projeto grande fica
   parcial e avisa). Arquivos dos padrões de `sensiveis.txt` ficam de fora. Para ver na mão:
   `node <plugin>/hooks/grafo.js <pasta> "<pedido>"`.
5. **Memória:** na 1ª vez numa pasta, cria `.claude/base/` com os modelos (não sobrescreve nada que já exista).
6. **Saída:** uma linha para você (`Usando: …`) e o contexto para o Claude: pacotes e motivos, os agentes com o
   `subagent_type` completo, o catálogo inteiro (área → agentes), o "já feito" e a ordem de **delegar** (o
   orquestrador coordena; quem faz o trabalho são os agentes).
7. **Vocabulário não achou a área:** o Claude decide quais especialistas chamar, pelo assunto, olhando o catálogo e as
   descrições dos agentes. As palavras são um atalho, não a única forma de escolher.

O revisor entra sempre, antes de entregar.

## 2. O orquestrador (skill `ultimate`)

A conversa principal do Claude Code é o orquestrador. A skill diz como:

- **situar-se** antes de agir (o que já foi feito, decidido e o que falta);
- **escolher** e avisar quem vai trabalhar;
- **construir em rodadas** com contrato (cada item com a checagem que falha antes e passa depois);
- **revisar** sempre com o `revisor` antes de chegar a você;
- **decidir** com você: no máximo 3 opções, recomendação, perda, reversibilidade, risco;
- **lembrar**: `PROJETO.md` com decisões e "retomar aqui"; curadoria a cada ~10 entregas.

## 3. Os agentes (`fonte/` → `agents/`)

Cada agente = parte específica (`fonte/agentes/<pacote>/<nome>.md`) + **protocolo comum** (`fonte/comum.md`), juntados
por `scripts/gerar-agentes.js`. O protocolo é idêntico em todos (o validador confere) e traz:

- o que ler antes (projeto, lições que valem para o agente, a própria memória, o mapa e o que já foi feito);
- a conduta (4 regras do Karpathy), a depuração sistemática e a verificação antes de concluir;
- nunca inventar dados ([HIPÓTESE], [ESTIMATIVA]);
- quando parar e devolver;
- o que gravar ao terminar (memória com Playbook, lição com "vale para", proposta de melhoria, diário, mapa);
- o relatório padrão, com "Áreas impactadas".

## 4. O aprendizado

```
erro ─► lição (causa + evidência + "vale para") ─► repetiu? ─► regra no Playbook do agente
                                                        └────► proposta de mudar as instruções ─► curador ─► você aprova ─► CHANGELOG
defeito que você achou ─► regra automática no verificador do projeto (provada com o defeito injetado)
```

## 5. As travas (`hooks/travas.js`)

| Situação | O que acontece |
|---|---|
| `npm publish`, deploy de produção | pede a sua confirmação |
| `git push` | lê os commits que ainda não foram para o remoto: segredo de alta certeza bloqueia; o resto pede a sua confirmação |
| commit em forma lida com certeza (`cd` literal na pasta da sessão, `git add`, `git commit`, saída redirecionada, `\| tail`) | lê o que ele leva: `.env`, chaves, padrões de `sensiveis.txt` e segredo de alta certeza bloqueiam; média certeza pergunta; limpo, nunca pergunta |
| a palavra `commit` em qualquer outra forma (`eval`, alias, `xargs`, `VAR=x`, outra pasta) | lê o que já está preparado e pergunta, sem adivinhar |
| leitura que passa de 7 s, ou erro nela | pergunta; nunca libera calado |
| depois de Bash ou PowerShell, se o HEAD mudou (`hooks/trava-depois.js`) | lê o commit novo e, com segredo, avisa com a instrução de desfazer antes do push |
| heredoc gravando script com barra invertida | bloqueia (o arquivo sairia estragado) |

A trava nunca executa texto do comando (`hooks/leitor-segredos.js`: só o git, sem shell, em processo filho com prazo) e não roda git que
leia a pasta de trabalho de outro repositório antes da sua permissão: a configuração dele poderia executar programa. A tabela de formas está em `scripts/testar-travas-formas.js`.

## 6. Estimativa, barra e placar (0.7.0)

| Peça | Gancho ou comando | Grava em |
|---|---|---|
| Registro de cada execução | `hooks/execucoes.js` (`PreToolUse`/`PostToolUse` do `Agent`, `SubagentStart`, `SubagentStop`) | `.claude/base/.agentes.jsonl`; `~/.claude/agentes-ultimate/execucoes.jsonl` (só metadados) |
| Faixa de término | `scripts/estimar.js faixa … --registrar` (o orquestrador, ao lançar o agente) | `.claude/base/.estimativas.jsonl` |
| Progresso | o próprio agente, ao fim de cada etapa (passo 10 do protocolo) | `.claude/base/.progresso/<agente>-<código>.json` |
| Barra por agente | `hooks/barra.js` pelo `settings.json` do plugin → `~/.claude/agentes-ultimate/barra.js` | — |
| Placar | linha fixa do revisor lida no `SubagentStop` (só grava a linha); `scripts/placar.js` refaz o placar quando a skill pede | `revisoes.jsonl`, `defeitos.jsonl`, `placar.json`, `estado.json` |
| Índice | ganchos e leitores, só pelo trecho novo do `.jsonl` | `.indice-execucoes.json` (minutos e fator por chave, para a faixa e a barra); "de primeira" é calculado só pelo placar |
| Agentes agora | `hooks/mapa-servidor.js` (`/agentes` e evento `agentes`) | — |

O código do trabalho (`[cod:xxxx]` no fim da descrição do agente) liga as peças:
- ele é lido só da descrição;
- a correção do mesmo trabalho reusa o código, e o revisor recebe `[revisa:xxxx]`;
- o agente se liga ao código pelo `.meta.json` do agente ou pelo `PostToolUse` do `Agent` (par exato), nunca pela
  ordem de chegada.

Barra e mapa usam a mesma conta (`previsao` em `hooks/registro.js`):
- o % é o progresso gravado; sem ele, o tempo passado sobre o fim da faixa, marcado como estimado;
- o término sai do ritmo do progresso, limitado à faixa; sem ritmo, do meio da faixa;
- agente sem fim e sem sinal depois do prazo vira "sem notícia" e sai do painel 2 h depois.

## Limites conhecidos

- A escolha é por palavras e arquivos: pedidos ambíguos podem cair no pacote errado; a linha `Usando:` e o
  `era com <agente>` existem para isso.
- **Âncora em qualquer lugar do pedido:** quando o pedido não diz app, aplicativo ou sistema, uma menção a "site" decide o
  desempate mesmo quando o site é de outra pessoa e
  o pedido é de tela de app ("o componente react de tabela quebra quando colo dados do site do IBGE" vai ao designer de
  sites). Corrija com `era com designer-paineis`.
- **Site e app no mesmo pedido** vão a um lado só (o da âncora, ou o de mais pontos), salvo empate, quando vão os dois.
  Peça em dois pedidos ou diga quem você quer.
- O "já feito" entende os sinônimos da lista e as ligações por nome de arquivo, não o significado livre do texto.
  Acrescente grupos de sinônimos do seu domínio em `pacotes/sinonimos.json`.
- As referências de mercado dos agentes estão marcadas "(a confirmar)" até alguém abrir e conferir cada fonte.
