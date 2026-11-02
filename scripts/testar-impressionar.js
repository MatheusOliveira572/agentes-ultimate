// Casos do padrão "impressiona" (revisão final, M-4 e M-6; mundos em 2026-11-02): a régua conhecimento/design/impressionar.md, o teste de junção
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

  // Régua independente de estilo (correção do usuário, 2026-11-02): o mundo vem do briefing, nenhum é o padrão, o gosto
  // fica no projeto; a junção é a do mundo escolhido; o teste "parece Apple" só vale no mundo Apple ou com vidro.
  caso('impressiona: a régua mede o nível, o mundo vem antes (marca/projeto → briefing → 2 ou 3 propostos) e nenhum é o padrão',
    /## O mundo vem antes da régua/.test(im) && /Nenhum mundo é o padrão do plugin/.test(im) && /PROJETO\.md`, seção "Gosto visual"/.test(im) &&
    /propõe 2 ou 3 mundos/.test(im) && /`mundos\/INDICE\.md`/.test(im), 'falta a seção do mundo');
  caso('impressiona: a junção é a combinação do mundo escolhido, sem Apple + vidro como padrão',
    /## A junção \(a combinação do mundo escolhido/.test(im) && /dentro do mundo escolhido/.test(secao(im, 'A junção')) &&
    !/cara de Apple \(tipo do sistema/.test(im) && !/entram \*\*por padrão\*\*/.test(im), 'a junção ainda prende a um estilo');
  caso('impressiona: "parece Apple" só no mundo Apple ou com vidro, na régua e no revisor da régua',
    (im.match(/[^\n]*parece Apple[^\n]*/g) || []).every((l) => /mundo Apple|com vidro|vidro pedido/.test(l)) && /teste do mundo/.test(secao(im, 'Autocrítica')) &&
    /coerência com o mundo\s+declarado/.test(secao(im, 'O revisor')), 'teste "parece Apple" incondicional');
  // Por item (tópico ou passo inteiro, que pode ocupar várias linhas), não por linha.
  const vidroLivre = (n) => corpo(n).split(/\n(?=\s*(?:- |\d+\. ))/).filter((l) => /parece\s+Apple/.test(l) && !/mundo Apple|se houver|com vidro|vidro pedido|ou vidro|houver vidro/.test(l)).map((l) => l.trim().slice(0, 90));
  for (const n of DESIGNERS.concat(['revisor'])) {
    caso(`impressiona: ${n} só aplica "parece Apple" no mundo Apple ou com vidro`, !vidroLivre(n).length, vidroLivre(n).join(' | ') || '-');
  }
  for (const n of DESIGNERS) {
    caso(`impressiona: ${n} escolhe o mundo no método (marca, projeto ou 2–3 propostos)`,
      /^\d+\. \*\*Ambição[^]*?\b(o mundo|\*\*o mundo\*\*)/m.test(secao(corpo(n), 'Método de trabalho')) && /2–3\s+propostos/.test(secao(corpo(n), 'Método de trabalho')), 'falta o mundo no método');
    caso(`impressiona: ${n} lê mundos/INDICE.md nas referências sob demanda`,
      /conhecimento\/design\/mundos\/INDICE\.md/.test(secao(ler('agents', n + '.md'), 'Referências sob demanda')), 'falta a leitura');
  }
  caso('impressiona: revisor julga o nível e a coerência com o mundo declarado, e roda o teste do mundo',
    /coerência com o mundo declarado, nunca o seu gosto/.test(secao(rv, 'Responsabilidades')) && /Entrega visual: [^\n]*teste do mundo declarado/.test(rv), 'falta no revisor');

  // Os mundos: índice com 8 a 10 mundos, cada arquivo no mesmo nível de exigência (mesmas seções, 3 sinais de amador,
  // referência pública com fonte aberta, fontes livres, ≤ 15 KB).
  const mi = ler('conhecimento', 'design', 'mundos', 'INDICE.md');
  const arqMundos = [...mi.matchAll(/\| `([a-z-]+\.md)` \|/g)].map((m) => m[1]);
  caso('impressiona: mundos/INDICE.md lista 8 a 10 mundos, com o Apple entre eles, e diz que nenhum é o padrão',
    arqMundos.length >= 8 && arqMundos.length <= 10 && arqMundos.includes('apple-liquid-glass.md') && /Nenhum mundo é o padrão do plugin/.test(mi), `${arqMundos.length} mundo(s)`);
  const SECOES = ['Quando usar / quando não', 'Tipografia', 'Cor', 'Material e profundidade', 'Movimento', 'Forma', 'Imagem e 3D', '3 sinais de amador'];
  for (const a of arqMundos) {
    const m = ler('conhecimento', 'design', 'mundos', a);
    const faltam = SECOES.filter((s) => !m.includes('\n## ' + s));
    const sinais = secao(m, '3 sinais de amador');
    const refs = (m.split(/\n## Referências? /)[1] || '');
    const prob = [];
    if (!m) prob.push('arquivo não existe');
    if (faltam.length) prob.push('seções: ' + faltam.join(', '));
    if (!/^1\. \S/m.test(sinais) || !/^2\. \S/m.test(sinais) || !/^3\. \S/m.test(sinais)) prob.push('3 sinais de amador');
    if (!/\*\*Sim:\*\*/.test(m) || !/\*\*Não:\*\*/.test(m)) prob.push('quando usar e quando não');
    if (!/https:\/\/\S+ \(aberta em 20\d\d-\d\d-\d\d/.test(refs) || !/só ideia, nada copiado/.test(m)) prob.push('referência com fonte aberta');
    if (!/Pares \(OFL\)|licença/i.test(secao(m, 'Tipografia'))) prob.push('fontes com licença');
    if (!/quique|sem curva|corte seco|steps\(\)/.test(secao(m, 'Movimento'))) prob.push('curva própria');
    if (Buffer.byteLength(m) > 15 * 1024) prob.push('acima de 15 KB');
    caso(`impressiona: mundo ${a} no mesmo nível de exigência`, !prob.length, prob.join('; '));
  }

  // A vitrine Apple é receita do mundo Apple, não padrão de landing.
  const vt = ler('conhecimento', 'design', 'sites-premium', 'efeitos', 'vitrine-apple.md');
  caso('impressiona: vitrine-apple.md é do mundo Apple; 3D e revelação quando o mundo pede; vidro só no mundo Apple ou a pedido',
    /não é o padrão do plugin/.test(vt) && /quando o mundo e a ideia pedem/.test(vt) && /\*\*vidro\*\* só no mundo Apple ou quando pedido/.test(vt) && !/entram por padrão/.test(vt), 'vitrine ainda é padrão');

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
