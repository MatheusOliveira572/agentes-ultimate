// Casos do padrão "impressiona" (revisão final, M-4 e M-6): a régua conhecimento/design/impressionar.md, o teste de junção
// nos 4 designers e no revisor, o VERMELHO do revisor, e licença, texto alternativo e "não imitar a referência" nos designers.
// Lê o texto gerado em agents/ (o que o Claude Code carrega). Chamado pelo testar-referencias.js; sozinho:
// node scripts/testar-impressionar.js [raiz do plugin]
'use strict';
const fs = require('fs');
const path = require('path');

function testar({ caso, RAIZ }) {
  const ler = (...p) => { try { return fs.readFileSync(path.join(RAIZ, ...p), 'utf8'); } catch (e) { return ''; } };
  const corpo = (n) => ler('agents', n + '.md').split('## Protocolo comum')[0];
  const secao = (t, titulo) => (t.split('\n## ' + titulo)[1] || '').split('\n## ')[0];
  const DESIGNERS = ['designer-interface', 'designer-sites', 'designer-paineis', 'designer-documentos'];

  // A régua em si: os 16 itens, o piso que não entrega, pixel a pixel, a junção, o revisor e o "não imitar".
  const im = ler('conhecimento', 'design', 'impressionar.md');
  const c1 = secao(im, 'Camada 1'), c2 = secao(im, 'Camada 2');
  const itens = (t, de, ate) => { const f = []; for (let i = de; i <= ate; i++) if (!new RegExp('^' + i + '\\. \\S', 'm').test(t)) f.push(i); return f; };
  const f1 = itens(c1, 1, 8), f2 = itens(c2, 9, 16);
  caso('impressiona: a régua tem os 8 itens da camada 1 e os 8 da camada 2, e camada 1 com falha não entrega',
    !f1.length && !f2.length && /falhou um item, não entrega/.test(im), `faltam itens: ${f1.concat(f2).join(', ') || '-'}`);
  caso('impressiona: camada 1, item 8: movimento reduzido, transparência reduzida e contraste mais',
    /^8\. Movimento reduzido, transparência reduzida e contraste mais/m.test(c1), 'falta o item 8');
  caso('impressiona: contraste sobre foto e vidro medido pixel a pixel, não na média',
    /^6\. Contraste no pior ponto[^\n]*pixel a pixel, não na média/m.test(c1), 'falta no item 6');
  caso('impressiona: a junção (um efeito dominante, uma curva, um material, uma luz) e o teste de junção',
    /## A junção/.test(im) && /\*\*Um efeito dominante\*\*/.test(im) && /\*\*Teste de junção:\*\*[^\n]*\n[^\n]*\*\*ele sai\*\*/.test(im), 'falta a junção');
  caso('impressiona: o revisor roda a régua antes da autocrítica; camada 1 falhou ou 2+ itens da camada 2 = VERMELHO',
    /antes\*\* de ler a autocrítica/.test(secao(im, 'O revisor')) && /Camada 1 falhou = VERMELHO/.test(im) && /2 ou mais itens = VERMELHO; 1 item = AMARELO/.test(im), 'falta a regra do revisor');
  caso('impressiona: autocrítica com referência da categoria estudada, nunca imitada (composição, layout)',
    /referência da categoria[^]*nunca imitada[^.]*composição, layout/.test(secao(im, 'Autocrítica')), 'falta o b-7');

  // Os 4 designers: régua no critério de pronto, junção no método, licença e "não imitar" no critério.
  for (const n of DESIGNERS) {
    const c = corpo(n), crit = secao(c, 'Critério de pronto'), met = secao(c, 'Método de trabalho');
    caso(`impressiona: ${n} com a régua e o teste de junção no critério de pronto`,
      /régua `impressionar\.md`[^\n]*camada 2 com no máximo 1 "não"/.test(crit) && /junção/.test(crit), 'falta no Critério de pronto');
    caso(`impressiona: ${n} com o passo da junção no método`, /^\d+\. (\*\*)?Junção/m.test(met), 'falta no Método');
    caso(`impressiona: ${n} com licença que cobre o uso e só a ideia da referência estudada`,
      /licença que cobre o uso/.test(crit) && /(nada de|nem o|nada de texto)[^\n]*(composição|identidade|ordem de um bloco)|só a ideia[^]{0,40}composição/i.test(crit), 'falta no Critério de pronto');
  }
  for (const n of ['designer-interface', 'designer-sites', 'designer-paineis']) {
    caso(`impressiona: ${n} com texto alternativo no critério de pronto`, /texto alternativo/i.test(secao(corpo(n), 'Critério de pronto')), 'falta no Critério de pronto');
  }
  const di = secao(corpo('designer-interface'), 'Critério de pronto');
  caso('impressiona: designer-interface testa movimento reduzido, transparência reduzida e contraste mais',
    /movimento reduzido, transparência reduzida e contraste\s+mais/.test(di), 'falta no Critério de pronto');

  // O revisor: régua antes da autocrítica, passo da entrega visual com o VERMELHO, critério.
  const rv = corpo('revisor');
  caso('impressiona: revisor roda a régua antes da autocrítica do autor (responsabilidades)',
    /régua `impressionar\.md` \*\*antes\*\* de ler a autocrítica/.test(secao(rv, 'Responsabilidades')), 'falta nas Responsabilidades');
  caso('impressiona: revisor, entrega visual: camada 1 falhou ou 2+ itens da camada 2 = VERMELHO; junção',
    /Entrega visual: camadas 1 e 2 da régua, junção/.test(rv) && /falhou ou 2\+ itens da camada 2 = VERMELHO/.test(rv), 'falta no Método');

  // O índice de efeitos traz a vitrine Apple, e o arquivo existe.
  const ix = ler('conhecimento', 'design', 'sites-premium', 'efeitos', 'INDICE.md');
  caso('impressiona: efeitos/INDICE.md lista a vitrine-apple.md, e ela existe',
    /vitrine-apple\.md/.test(ix) && !!ler('conhecimento', 'design', 'sites-premium', 'efeitos', 'vitrine-apple.md'), 'falta no índice');
}

module.exports = testar;
if (require.main === module) {
  let f = 0, o = 0;
  testar({ caso: (n, ok, d) => { console.log(`${ok ? 'ok   ' : 'FALHA'} ${n}${ok ? '' : ' → ' + d}`); if (ok) o++; else f++; }, RAIZ: path.resolve(process.argv[2] || path.join(__dirname, '..')) });
  console.log(`${o + f} casos, ${f} falha(s)`);
  process.exit(f ? 1 : 0);
}
