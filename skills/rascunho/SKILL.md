---
name: rascunho
description: Trabalha numa cópia isolada do projeto (git worktree) para que os agentes construam sem atrapalhar a versão que o usuário usa, e depois junta com a lista de conflitos. Use quando uma construção longa vai mexer em arquivos que o usuário continua usando, ou quando o usuário pedir para experimentar sem risco.
---
# Rascunho isolado

1. **Criar:** `git worktree add ../<projeto>-<nome> -b <nome>` a partir do ramo atual. Fora de pastas sincronizadas
   (OneDrive, Dropbox), para não sincronizar cada arquivo gerado.
2. **Dados fora do git** (pastas ignoradas) não vão para a cópia: aponte a cópia para os dados da pasta principal (por
   parâmetro de caminho), sem copiar dados sensíveis.
3. **Memória:** continua na pasta principal (`.claude/base/` e `.claude/agent-memory/`). Avise os agentes.
4. **Avise o usuário** qual arquivo abrir para testar a versão nova (caminho completo) e que a principal continua a
   versão aprovada.
5. **Juntar:** `git merge` na principal. Conflito nunca se resolve "aceitando um lado": leia os dois, junte, e rode de
   novo as checagens principais. Liste ao usuário o que mudou.
6. **Descartar:** `git worktree remove ../<projeto>-<nome>` e apagar o ramo, só com o OK do usuário.
