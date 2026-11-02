#!/usr/bin/env node
// Texto próprio do agentes-ultimate. Teste de equivalência com o apple-design-skill (lido como referência do que cobrir, sem
// copiar): para 4 pedidos de design, as regras que a skill original aplicaria têm de estar na nossa versão, com o mesmo valor e
// a fonte na HIG. Rodado pela bateria e pela skill /atualizar-fontes quando a HIG ou o repositório de referência mudarem.
//   node scripts/equivalencia-apple.js        sai 0 com tudo coberto; 1 com a lista do que falta
'use strict';
const fs = require('fs');
const path = require('path');

const EQUIV = {
  'tela de app (iPhone)': [['tipo padrão 17 pt e mínimo 11 pt', 'acessibilidade-tipo-e-toque.md', /iOS, iPadOS \| 17 pt \| 11 pt/], ['contraste 4,5:1 até 17 pt e 3:1 a partir de 18 pt ou negrito', 'acessibilidade-tipo-e-toque.md', /até 17 pt \| 4,5:1[\s\S]*18 pt ou mais, ou negrito \| 3:1/],
    ['alvo 44 × 44 pt (mínimo 28) no celular e 28 × 28 (mínimo 20) no desktop', 'acessibilidade-tipo-e-toque.md', /44 × 44 pt \| 28 × 28 pt[\s\S]*28 × 28 pt \| 20 × 20 pt/], ['abas navegam, não agem; nunca escondidas ou desabilitadas', 'componentes.md', /Abas navegam, não agem[\s\S]*nunca desabilite nem esconda/],
    ['vidro só na camada flutuante, nunca no conteúdo', 'materiais.md', /Nunca na camada de conteúdo/], ['5 lentes na ordem e relatório com "O que funciona"', 'INDICE.md', /Acessibilidade[\s\S]*Convenções da plataforma[\s\S]*Desenho visual[\s\S]*Interação[\s\S]*Conteúdo e escrita[\s\S]*O que funciona/]],
  'painel de dados': [['gráfico simples com detalhe sob demanda', 'graficos.md', /Simples, com mais detalhe quando a pessoa pedir/], ['nunca só a cor para separar séries', 'graficos.md', /Nunca só a cor/], ['descrição sem termos subjetivos e formato sem ambiguidade', 'graficos.md', /Sem termos subjetivos[\s\S]*sem ambiguidade/],
    ['faixa do eixo fixa ou dinâmica pelo significado', 'graficos.md', /fixa ou dinâmica pelo significado/], ['uma cor, um significado; claro, escuro e Aumentar Contraste', 'cor-e-modo-escuro.md', /Uma cor, um significado[\s\S]*claro, escuro e Aumentar Contraste/]],
  'formulário': [['erro perto do problema, dizendo como resolver', 'escrita-e-primeiro-uso.md', /perto do problema[^.]*como resolver/], ['rótulo diz o que acontece e mantém o nome no fluxo', 'escrita-e-primeiro-uso.md', /Cada rótulo diz o que acontece[\s\S]*mantém o nome no fluxo/],
    ['puxar do sistema, escolha em vez de digitação, validar ao preencher, nunca pré-preencher senha', 'movimento-e-retorno.md', /Puxe do sistema[\s\S]*nunca\s+preencha senha/], ['seletor no contexto, perto do campo', 'componentes.md', /no contexto\*\*, perto do\s+campo/], ['alvo de toque e contraste do campo', 'acessibilidade-tipo-e-toque.md', /44 × 44 pt/]],
  'componente com animação': [['movimento com propósito, breve, cancelável e raro no frequente', 'movimento-e-retorno.md', /Com propósito[\s\S]*Breve, cancelável e raro/], ['Reduzir Movimento troca por esmaecer', 'movimento-e-retorno.md', /Reduzir Movimento, troque por\s+esmaecer/],
    ['evitar oscilação perto de 0,2 Hz', 'movimento-e-retorno.md', /0,2 Hz/], ['curvas e durações com o dono do movimento', '../movimento/INDICE.md', /animação de interface abaixo de 300 ms/], ['vidro: Reduzir Transparência e o pior fundo', 'materiais.md', /prefers-reduced-transparency[\s\S]*pior fundo|pior fundo[\s\S]*prefers-reduced-transparency/]],
};

// Devolve [{ pedido, total, faltam: [regra] }] lendo conhecimento/design/apple/ da raiz dada.
function conferir(raiz) {
  const ap = (f) => { try { return fs.readFileSync(path.join(raiz, 'conhecimento', 'design', 'apple', f), 'utf8'); } catch (e) { return ''; } };
  return Object.entries(EQUIV).map(([pedido, regras]) => ({ pedido, total: regras.length, faltam: regras.filter(([, f, re]) => !re.test(ap(f))).map((r) => r[0]) }));
}
module.exports = { EQUIV, conferir };

if (require.main === module) {
  const res = conferir(path.resolve(__dirname, '..'));
  for (const r of res) console.log(`${r.faltam.length ? 'FALTA' : 'ok   '} ${r.pedido}: ${r.total - r.faltam.length} de ${r.total} regras${r.faltam.length ? ' (faltam: ' + r.faltam.join('; ') + ')' : ''}`);
  process.exit(res.some((r) => r.faltam.length) ? 1 : 0);
}
