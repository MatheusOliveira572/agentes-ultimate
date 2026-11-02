// Casos do modelo modelos/liquid-glass/ (im99): a tinta adaptável lê o que passa atrás sem somar [data-lum] aninhados.
// Roda o liquido.js num contexto com um DOM mínimo (sem navegador). Chamado pelo testar-referencias.js; sozinho:
// node scripts/testar-liquid-glass.js [arquivo liquido.js]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Monta um DOM mínimo, roda o liquido.js e devolve o fundo e o "misto" que ele calculou para o controle.
function medir(arqJs, fontes) {
  const ctl = { dataset: { lgAdapta: '[data-lum]' }, attrs: {}, style: { setProperty() {}, removeProperty() {} },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40 }),
    removeAttribute(n) { delete this.attrs[n]; }, toggleAttribute(n, v) { if (v) this.attrs[n] = ''; else delete this.attrs[n]; },
    offsetWidth: 100, offsetHeight: 40, matches: () => false, parentElement: null };
  const els = fontes.map((f) => ({ dataset: { lum: String(f.L) }, getBoundingClientRect: () => ({ ...f.q, right: f.q.left + f.q.width, bottom: f.q.top + f.q.height }), matches: (s) => s === '[data-lum]', parentElement: null }));
  fontes.forEach((f, i) => { if (f.pai != null) els[i].parentElement = els[f.pai]; });
  const doc = { documentElement: { classList: { toggle() {} } }, readyState: 'complete', scrollingElement: { scrollTop: 0 },
    querySelectorAll: (s) => (s === '.lg[data-lg-adapta]' || s === '.lg' ? [ctl] : s === '[data-lum]' ? els : []), querySelector: () => null,
    getElementById: () => null, createElementNS: () => ({ setAttribute() {}, appendChild() {}, style: {} }), body: { appendChild() {} } };
  const mm = () => ({ matches: false, addEventListener() {} });
  const janela = { navigator: { userAgent: 'Node' }, matchMedia: mm, document: doc, addEventListener() {}, requestAnimationFrame: (f) => f(),
    getComputedStyle: () => ({ borderTopLeftRadius: '20px' }) };
  janela.window = janela;
  vm.runInNewContext(fs.readFileSync(arqJs, 'utf8'), janela);
  janela.liquido.quadro();
  return { fundo: ctl.dataset.lgFundo === '' ? null : Number(ctl.dataset.lgFundo), tom: ctl.dataset.tom, misto: 'data-lg-misto' in ctl.attrs };
}

function testar({ caso, RAIZ }, arq = path.join(RAIZ, 'modelos', 'liquid-glass', 'liquido.js')) {
  const existe = fs.existsSync(arq);
  caso('im99 liquid-glass: o modelo existe (css, js e LEIA-ME que diz que a lente é só no Chromium)', existe && fs.existsSync(path.join(RAIZ, 'modelos', 'liquid-glass', 'liquido.css')) &&
    /Só no\s+Chromium|só no Chromium/i.test((() => { try { return fs.readFileSync(path.join(RAIZ, 'modelos', 'liquid-glass', 'LEIA-ME.md'), 'utf8'); } catch (e) { return ''; } })()), arq);
  if (!existe) return;
  // Seção clara (0,9) cobrindo o controle inteiro, com uma foto escura (0,1) dentro, cobrindo a metade da esquerda.
  const aninhado = medir(arq, [{ L: 0.9, q: { left: 0, top: 0, width: 100, height: 40 } }, { L: 0.1, q: { left: 0, top: 0, width: 50, height: 40 }, pai: 0 }]);
  caso('im99 liquid-glass: [data-lum] aninhados não somam duas vezes (seção 0,9 com foto 0,1 na metade → fundo 0,50, misto)',
    aninhado.fundo != null && Math.abs(aninhado.fundo - 0.5) < 0.05 && aninhado.misto, JSON.stringify(aninhado));
  const simples = medir(arq, [{ L: 0.1, q: { left: 0, top: 0, width: 100, height: 40 } }]);
  caso('im99 liquid-glass: fundo escuro inteiro → tom escuro, sem misto', simples.tom === 'escuro' && !simples.misto, JSON.stringify(simples));
  const pouco = medir(arq, [{ L: 0.1, q: { left: 0, top: 0, width: 10, height: 10 } }]);
  caso('im99 liquid-glass: pouco conteúdo atrás → segue o tema (sem tom)', pouco.fundo == null && pouco.tom === undefined, JSON.stringify(pouco));
  const mat = (() => { try { return fs.readFileSync(path.join(RAIZ, 'conhecimento', 'design', 'apple', 'materiais.md'), 'utf8'); } catch (e) { return ''; } })();
  caso('im99 liquid-glass: materiais.md cita o modelo', /modelos\/liquid-glass/.test(mat), 'falta');
}

module.exports = testar;
if (require.main === module) {
  let f = 0;
  testar({ caso: (n, ok, d) => { console.log(`${ok ? 'ok   ' : 'FALHA'} ${n}${ok ? '' : ' → ' + d}`); if (!ok) f++; }, RAIZ: path.resolve(__dirname, '..') }, process.argv[2] || undefined);
  process.exit(f ? 1 : 0);
}
