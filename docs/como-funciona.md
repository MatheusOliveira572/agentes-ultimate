# Como funciona

## 1. A escolha automática (`hooks/roteador.js`)

Roda a cada pedido, antes do Claude responder. Sem IA, em milissegundos.

1. **Pedido trivial** (curto e sem assunto de nenhum pacote): não faz nada. O Claude responde direto.
2. **Pontos por pacote** (`pacotes/pacotes.json`): palavra do pedido = 1; expressão de 2+ palavras = 2; arquivo na
   pasta (raiz + 1 nível) = 2. Entram os pacotes com pontos ≥ `minimo` (2). Acentos e maiúsculas não importam.
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
| `git push`, `npm publish`, deploy de produção | pede a sua confirmação |
| commit com `.env`, chaves, credenciais ou padrões de `.claude/base/sensiveis.txt` | bloqueia, com o motivo |
| heredoc gravando script com barra invertida | bloqueia (o arquivo sairia estragado) |

## Limites conhecidos

- A escolha é por palavras e arquivos: pedidos ambíguos podem cair no pacote errado; a linha `Usando:` e o
  `era com <agente>` existem para isso.
- O "já feito" entende os sinônimos da lista e as ligações por nome de arquivo, não o significado livre do texto.
  Acrescente grupos de sinônimos do seu domínio em `pacotes/sinonimos.json`.
- As referências de mercado dos agentes estão marcadas "(a confirmar)" até alguém abrir e conferir cada fonte.
