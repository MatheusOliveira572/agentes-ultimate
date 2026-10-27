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
   Escolha palavras que só aparecem nesse assunto. Expressões de 2+ palavras valem o dobro.
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
