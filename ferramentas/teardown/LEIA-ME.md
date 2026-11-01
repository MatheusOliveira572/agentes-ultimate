<!-- Adaptado de jakubkrehel/skills/skills/teardown/assets e skills/teardown/scripts @592aedc, © 2026 Jakub Krehel, MIT. Alterações: nenhuma no código (cópia inteira); a SKILL.md original foi renomeada para referencia-original/ORIGINAL-SKILL.md (é dado, não instrução); alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/ e LICENSE nesta pasta. -->
# teardown: ilustração técnica (cópia da ferramenta do Jakub Krehel)

Visualizador e gerador de ilustração técnica (vista explodida, corte, camadas) com exportação SVG/PNG/PDF e prova nos
extremos. Sem dependência de npm. Método em português: `<plugin>/conhecimento/documentos/ilustracao-tecnica.md`.

- `assets/`: visualizador (`viewer.html`, `viewer.js`), geometria, projeção, fila de render, folha, tema, exportação.
- `scripts/`: `build-viewer.cjs`, `check-viewer.cjs`, `proof.cjs`, `commands.cjs`, `config.cjs` e 5 testes `test-*.cjs`.
- `referencia-original/`: as referências do autor, em inglês, como vieram (só leitura).

Testes (Node 24, PowerShell e Git Bash): `node scripts/test-geometry.cjs` (e os outros 4) saem 0; trocando `Math.PI` por
`3` em `assets/geometry.js`, o `test-geometry.cjs` sai 1 (o `scripts/testar-hooks.js` do plugin confere isso).
