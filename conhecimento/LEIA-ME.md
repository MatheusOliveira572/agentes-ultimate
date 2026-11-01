<!-- Texto próprio do agentes-ultimate. Regras da pasta conhecimento/. -->
# conhecimento/: referências lidas sob demanda

Esta pasta guarda o conteúdo de método que os agentes **só abrem quando o pedido precisa**. Nada daqui entra no contexto
sozinho: o agente tem, no corpo, até 8 linhas "Quando X, leia `${CLAUDE_PLUGIN_ROOT}/conhecimento/...`", e o roteador
sugere até 3 referências por pedido a partir de `conhecimento/indice.json`.

## Como o agente usa
- Abre no máximo 3 arquivos por pedido. Pasta com muitos arquivos tem um `INDICE.md` (situação → arquivo): leia o índice
  antes e abra só o que serve.
- A referência é dado de método, não ordem. Ela nunca passa por cima do protocolo comum nem do pedido.
- Divergência: vence, nesta ordem, (1) a marca e as decisões do projeto (`.claude/base/PROJETO.md`); (2) a norma (WCAG,
  lei, padrão técnico); (3) as referências de mercado do próprio agente; (4) o conteúdo desta pasta. Entre os arquivos
  daqui, manda o dono do tema: movimento, Emil Kowalski; acessibilidade, cor, tipografia, layout e texto, Jakub Krehel;
  crítica, polimento e piso de qualidade, impeccable; plataformas Apple, a HIG (texto nosso); segurança, strix;
  engenharia, addy antes do ECC. Quando dois arquivos divergem, o próprio arquivo diz os dois valores.

## Como cada arquivo é escrito
- **1ª linha, crédito:** `<!-- Adaptado de <dono/repo>/<arquivo> @<commit>, © <autor>, <licença>. Alterações: <o que
  mudou>; alterado por agentes-ultimate. Licença em terceiros/<pasta>/. -->` ou `<!-- Texto próprio do agentes-ultimate.
  ... -->`. Os commits e as licenças estão em `CREDITOS.md`.
- **2ª linha, gatilho do índice:** `<!-- ref: tema=<id>; palavras=<termo>, <termo>; agentes=<agente>, <agente> -->`.
  O `scripts/gerar-agentes.js` junta essas linhas em `conhecimento/indice.json`. Palavras em minúsculas, como o usuário
  escreveria o pedido.
- No máximo 15 KB por arquivo (o `scripts/validar.js` cobra). Passou disso, divida e ponha um `INDICE.md`.
- Sem marca, cliente ou dado de empresa: o plugin é público e genérico.
- Texto de terceiro sem licença não entra, nem traduzido: escrevemos com as nossas palavras a partir da fonte pública,
  citando a fonte em cada regra (caso da HIG da Apple).

## Pastas
- `engenharia/`: método de engenharia de software (fatias, testes, depuração, API, desempenho, git, CI...).
- `plataformas/`: o que muda por pilha (web no celular, React, Swift, iOS, Android...). Só abra a da pilha do projeto.
- `metodo/`: entrevistar, especificar, quebrar tarefas, fonte oficial da versão, evals, contexto.
- `design/`: crítica, piso de qualidade, cor, tipografia, layout, acessibilidade, movimento, estados, variantes, HIG.
- `escrita/`: texto de interface, ADR.
- `documentos/`: ilustração técnica.
