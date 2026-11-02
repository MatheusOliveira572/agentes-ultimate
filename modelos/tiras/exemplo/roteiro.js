// Roteiro de exemplo do modelo de tiras: a entrada do cartão de pagina.html, com a curva medida.
// Uso: node modelos/tiras/tiras.js modelos/tiras/exemplo/roteiro.js        (com TIRAS_MUTAR=seco, a curva TEM de reprovar)
'use strict';
const path = require('path');
const pagina = path.join(__dirname, 'pagina.html') + (process.env.TIRAS_MUTAR ? '?mutar=' + process.env.TIRAS_MUTAR : '');
module.exports = {
  saida: process.env.TIRAS_SAIDA || '.',
  tiras: {
    async 'tira-cartao-entra'(t) {
      await t.abrir(pagina, { tema: 'light' });
      await t.av('window.entrar()');
      await t.espera(50);                                   // o navegador cria a transição
      const ts = [0, 40, 80, 130, 190, 260, 360, 480, 620, 769], quadros = [], posicoes = [];
      for (const ms of ts) {
        await t.congelar(ms); await t.espera(30);
        quadros.push(await t.quadro({ x: 80, y: 120, width: 520, height: 460 }, 0.5));
        // posição no sentido do movimento: quanto o cartão já subiu (de 240 px a 0)
        posicoes.push(await t.av(`240 - new DOMMatrix(getComputedStyle(document.getElementById('cartao')).transform).m42`));
      }
      return { quadros, rotulos: ts.map((ms) => ms + ' ms'), colunas: 5, posicoes };
    },
  },
};
