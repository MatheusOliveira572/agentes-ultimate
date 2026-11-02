# Criar um pacote novo

Exemplo: um pacote "Jurídico" com um agente `analista-juridico`.

1. **O agente:** crie `fonte/agentes/juridico/analista-juridico.md` copiando a estrutura de um agente existente
   (cabeçalho + Papel, Responsabilidades, Fora do escopo, Entrada e entrega, Referências de mercado, Método de trabalho,
   Critério de pronto, Erros conhecidos, Exemplo). **Não** escreva o protocolo comum: o gerador acrescenta.
2. **O pacote:** em `pacotes/pacotes.json`, acrescente:
   ```json
   "juridico": {
     "nome": "Jurídico",
     "agentes": ["analista-juridico"],
     "palavras": ["contrato", "clausula", "lgpd", "termo de uso", "parecer juridico"],
     "arquivos": []
   }
   ```
   Escolha palavras que só aparecem nesse assunto. Expressões de 2+ palavras valem o dobro. Palavra que serve a várias
   áreas vai em `ambiguas` (vale 0,5). Verbo comum ("crie", "faça") **nunca** como palavra solta: use `pares`, que só
   pontua o verbo seguido do alvo do assunto (ex.: o pacote `sites`). Se o assunto é vizinho de outro (site × tela de
   app), declare o par em `desempate`, com as âncoras de cada lado, e teste frases dos dois lados e de empate.
3. **Gere e confira:**
   ```bash
   node scripts/gerar-agentes.js
   node scripts/validar.js
   node scripts/testar-hooks.js
   ```
   Acrescente em `scripts/testar-hooks.js` um caso com um pedido real do novo assunto.
4. **Opcional:** uma skill de método em `skills/metodo-juridico/SKILL.md` (como o `metodo-powerbi`).

## Pacote privado (regras da sua empresa)

Regras de negócio, nomes internos e dados da sua empresa **não** vão para este repositório público. Deixe-os no
próprio projeto: `.claude/agents/` (agentes só daquele projeto), `CLAUDE.md` e `.claude/base/`. A base pública e o que
é privado convivem: o Claude Code carrega os dois.
