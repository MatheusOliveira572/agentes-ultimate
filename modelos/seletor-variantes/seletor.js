// Adaptado de jakubkrehel/skills/skills/variant/SKILL.md @592aedc, © 2026 Jakub Krehel, MIT; e de
// emilkowalski/skills/skills/prototype/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: reescrito como modelo
// mínimo sem biblioteca; alterado por agentes-ultimate. Licença em terceiros/jakubkrehel-skills/ e terceiros/emilkowalski-skills/.
//
// Seletor de variantes e estados SÓ PARA DESENVOLVIMENTO: troca a variante (?variante=a|b|c) ou o estado
// (?estado=carregando|vazio|erro|...) pela URL, sem mexer no componente. Cada bloco da página marca o que é com
// data-variante="a" ou data-estado="vazio"; o seletor mostra só o pedido e desenha uma barrinha para trocar.
// Depois da escolha do usuário: apague este arquivo e os blocos não escolhidos (a busca por "data-variante" não acha nada).
(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  function aplicar(attr) {
    var nos = document.querySelectorAll('[' + attr + ']');
    if (!nos.length) return null;
    var valores = [];
    nos.forEach(function (n) { var v = n.getAttribute(attr); if (valores.indexOf(v) < 0) valores.push(v); });
    var chave = attr.replace('data-', '');
    var atual = params.get(chave) || valores[0];
    nos.forEach(function (n) { n.hidden = n.getAttribute(attr) !== atual; });
    return { chave: chave, valores: valores, atual: atual };
  }
  function barra(grupos) {
    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Seletor de variantes (desenvolvimento)');
    nav.style.cssText = 'position:fixed;inset-block-end:12px;inset-inline-end:12px;z-index:2147483647;display:flex;gap:6px;' +
      'padding:6px;border-radius:10px;background:rgb(20 20 20 / .85);color:#fff;font:12px/1.2 system-ui,sans-serif';
    grupos.forEach(function (g) {
      g.valores.forEach(function (v) {
        var a = document.createElement('a');
        var p = new URLSearchParams(params); p.set(g.chave, v);
        a.href = '?' + p.toString();
        a.textContent = g.chave + ': ' + v;
        a.style.cssText = 'color:inherit;padding:6px 8px;border-radius:6px;text-decoration:none;min-height:24px;' +
          (v === g.atual ? 'background:rgb(255 255 255 / .2)' : '');
        if (v === g.atual) a.setAttribute('aria-current', 'true');
        nav.appendChild(a);
      });
    });
    document.body.appendChild(nav);
  }
  var grupos = [aplicar('data-variante'), aplicar('data-estado')].filter(Boolean);
  if (grupos.length) barra(grupos);
  window.__seletorVariantes = grupos;
})();
