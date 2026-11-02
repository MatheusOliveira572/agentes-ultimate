// Mostruário dos mundos (prova de design do agentes-ultimate, mt106). Gera molas.css a partir dos parâmetros de cada mundo
// (conhecimento/design/mundos/<mundo>.md), pelo modelo do plugin (modelos/mola-linear.js). Uma curva por mundo; o JS lê as
// mesmas variáveis (getComputedStyle), então CSS e JS usam a mesma mola. O brutalista não tem mola (corte seco / steps()).
// "ludico-calmo" é a navegação do lúdico (o arquivo do mundo: quique só no momento-pico; navegação sem quique).
// Uso: node gerar-molas.js        (reescreve molas.css)
'use strict';
const fs = require('fs');
const path = require('path');
const { mola } = require('../../../../modelos/mola-linear.js');

const MUNDOS = [
  ['apple', 0.5, 0.15], ['editorial', 0.6, 0], ['suico', 0.35, 0], ['quente', 0.7, 0], ['escuro', 0.25, 0],
  ['ludico', 0.5, 0.3], ['ludico-calmo', 0.5, 0], ['luxo', 0.9, 0], ['corporativo', 0.3, 0], ['retro', 0.4, 0.1],
];
const linhas = ['/* Gerado por gerar-molas.js a partir de modelos/mola-linear.js (não edite à mão). Duração = até assentar. */', ':root {'];
for (const [nome, d, b] of MUNDOS) {
  const m = mola({ duracao: d, bounce: b }, { pontos: 40 });
  linhas.push(`  /* ${nome}: duração ${d} s, quique ${b}; assenta em ${m.ms} ms; passa ${(m.passa * 100).toFixed(1)}%; ${m.pontos} pontos */`);
  linhas.push(`  --m-${nome}: ${m.css};`);
  linhas.push(`  --m-${nome}-ms: ${m.ms}ms;`);
}
linhas.push('}', '');
fs.writeFileSync(path.join(__dirname, 'molas.css'), linhas.join('\n'));
console.log('molas.css: ' + MUNDOS.length + ' molas');
