# Padrão de excelência dos agentes

Todo agente do agentes-ultimate segue este padrão. O `scripts/validar.js` reprova o que não seguir.

## 1. Princípios
1. **Uma responsabilidade por agente.** Se a descrição precisa de "e também", são dois agentes.
2. **A descrição é o gatilho:** o que faz, "Use para…", 2–3 pedidos reais e "Não use para… (→ agente)".
3. **Menor privilégio:** só as ferramentas necessárias. Quem revisa ou audita não corrige.
4. **Trabalha como as melhores empresas da função**, com 3 a 5 referências concretas, cada uma aberta e conferida.
5. **Prova, não promessa:** cada passo do método tem a checagem que o agente roda.
6. **Aprende e é avaliado:** 3 a 20 casos de teste (evals) por agente; cada falha real vira caso novo.
7. **Áreas reguladas** (jurídico, tributário, trabalhista, contábil, saúde): cita a norma com o link, data a
   consulta, e avisa que a resposta não substitui o profissional habilitado quando houver decisão com efeito legal.
8. **Protocolo comum idêntico em todos** (`fonte/comum.md`), juntado pelo gerador.

## 2. Arquivo do agente (`fonte/agentes/<pacote>/<nome>.md`)
Cabeçalho: `name`, `description` (entre aspas simples), `tools`, `memory: project`, `effort` (high para quem
constrói, revisa ou dá parecer técnico; medium para quem decide, pesquisa ou escreve), `color`.

Seções, nesta ordem: Papel (com o porquê) · Responsabilidades · Fora do escopo (com o destino) · Entrada e entrega ·
Referências de mercado · Método de trabalho (cada passo com a checagem) · Critério de pronto · Erros conhecidos (com
a origem) · Exemplo (bom × ruim). Parte específica com até ~90 linhas.

### Referências de mercado (3 a 5): as melhores **empresas** daquela função
O agente trabalha como trabalham **as empresas que são as melhores do mundo (e, quando houver, do Brasil) naquela
função**: o RH como o do Google, da Netflix ou da Natura; o jurídico como os melhores escritórios e departamentos
jurídicos; vendas como Salesforce e HubSpot; operações como Toyota e Amazon; e assim por diante. Regras:

- **Pelo menos 3 referências são empresas** reconhecidas pela excelência naquela função (ranking, prêmio, estudo de
  caso publicado, prática documentada pela própria empresa). Marque com `[empresa]`.
- Normas, órgãos e autores (ISO, W3C, IBCS, leis, livros) podem completar até 5, marcados `[norma]` ou `[autor]`.
  Lei e norma obrigatória, nas áreas reguladas, vão no **Método**, não contam como referência.
- Prefira mesclar referência global e brasileira quando existir uma brasileira de destaque na função.
- A prática citada tem de ser **da empresa e documentada** (página dela, relatório, livro ou estudo de caso sobre
  ela). "A empresa X é ótima em RH" sem dizer o que ela faz não vale.

Formato de cada uma:

```
- **Quem** [empresa] (por que é referência, meia linha), *prática*: o que faz de concreto. **Aqui:** como vira
  regra no trabalho do agente. Fonte: https://… (aberta em AAAA-MM-DD)
```

A fonte precisa ter sido **aberta e lida**; se o link não abre ou não diz o que se afirma, troque a referência.
"Seguir as melhores práticas da empresa X" sem dizer o que fazer não vale.

## 3. Evals (`evals/<nome>.md`)

```
# Evals · <nome>

### Caso 1 · <título curto>
- Tipo: regressão | capacidade | gatilho negativo
- Pedido: "<pedido real, como o usuário faria>"
- Deve: <critérios que dois revisores julgariam igual>
- Não deve: <o erro que este caso pega>
- Origem: <regra, lição ou prática de mercado de onde veio>

## Histórico
| Data | Versão | Resultado | Observação |
|---|---|---|---|
```

Mínimo 3 casos, com pelo menos 1 **regressão** (vem de um erro conhecido) e 1 **gatilho negativo** (pedido que não é
dele e deve ser devolvido ao agente certo). Rodar: chamar o agente com o pedido em modo de proposta, comparar com
"Deve/Não deve" e registrar no histórico.
