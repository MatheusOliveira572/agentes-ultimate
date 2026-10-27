---
name: criar-agente
description: Cria ou revisa um agente especialista no padrão do agentes-ultimate (protocolo comum, referências com fonte, evals, memória). Use quando o usuário pedir um agente novo, quando nenhum agente existente cobrir um pedido recorrente, ou para revisar um agente que errou.
---
# Criar ou revisar um agente

0. Leia `docs/padrao-agente.md` do plugin: é o padrão de excelência, e o validador reprova o que não seguir.
   Referências = **pelo menos 3 empresas diferentes que são as melhores naquela função** (marcadas `[empresa]`), com a
   prática da própria empresa documentada e a fonte aberta; normas e autores só completam; leis vão no método.
1. **Precisa mesmo?** Se um agente existente cobre a função, amplie-o. Um agente = uma responsabilidade.
2. **Evals primeiro:** 3 a 5 casos reais em `.claude/agent-evals/<nome>.md` (pedido, deve, não deve), com pelo menos
   1 regressão (de uma lição) e 1 gatilho negativo (pedido que não é dele).
3. **Arquivo do agente** em `.claude/agents/<nome>.md` (no projeto) ou, para levar a todos os projetos, em
   `fonte/agentes/<pacote>/<nome>.md` do plugin. Seções na ordem: Papel (com o porquê) · Responsabilidades · Fora do
   escopo (com o destino) · Entrada e entrega · Referências de mercado (3–5, com prática, aplicação e link aberto, ou
   "(a confirmar)") · Método (cada passo com a checagem) · Critério de pronto · Erros conhecidos (com a origem) · Exemplo
   (bom × ruim) · **Protocolo comum** copiado sem alteração de `fonte/comum.md` do plugin.
4. **Cabeçalho:** `name`, `description` entre aspas simples com o que faz, "Use para…", 2–3 pedidos reais e "Não use
   para… (→ agente)"; `tools` mínimas (revisor não corrige; ninguém chama outro agente); `memory: project`; `effort`
   (high para quem constrói ou revisa; medium para quem decide ou pesquisa); `color`.
5. **No plugin:** rode `node scripts/gerar-agentes.js` e `node scripts/validar.js`; inclua o agente num pacote de
   `pacotes/pacotes.json` com as palavras que o chamam.
6. **Teste:** rode os evals chamando o agente com cada pedido, em modo de proposta; registre o resultado no arquivo de
   evals. Caso reprovado vira ajuste no agente.
7. Conte ao usuário o que o agente faz, as referências, o resultado dos evals e como chamá-lo.
