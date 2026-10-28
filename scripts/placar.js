#!/usr/bin/env node
// Placar por agente (0.7.0), refeito dos registros globais (só metadados):
//   execucoes.jsonl (cada execução), revisoes.jsonl (linha fixa do revisor), defeitos.jsonl (defeitos que escaparam).
// Por agente: execuções, passou no revisor de primeira, defeitos achados pelo revisor por gravidade (B/A/M/b),
// defeitos que escaparam ao usuário, retrabalho (execuções do mesmo código depois de um "não") e acerto da estimativa
// (dentro da faixa registrada e erro mediano |real − fim da faixa| ÷ fim da faixa). Taxa de captura do revisor =
// pegos ÷ (pegos + achados só pelo usuário), meta ≥ 80%.
//   node placar.js [--projeto] [--json]           → tabela (ou JSON) e grava ~/.claude/agentes-ultimate/placar.json
//   node placar.js defeito --agente <nome> --gravidade <Bloqueante|Alta|Média|baixa> --texto "<o que o usuário viu>"
//       → texto em .claude/base/DEFEITOS-USUARIO.md (projeto); só a contagem no global
'use strict';
const fs = require('fs');
const path = require('path');
const R = require('../hooks/registro');

const GRAV = { b: 'B', bloqueante: 'B', a: 'A', alta: 'A', alto: 'A', m: 'M', media: 'M', medio: 'M', baixa: 'b', baixo: 'b' };
const gravidade = (g) => { const s = String(g || ''); if (s === 'b') return 'b'; if (s === 'B') return 'B'; return GRAV[s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()] || null; };

function calcular({ projeto } = {}) {
  const dir = R.pastaGlobal();
  const doProjeto = (x) => !projeto || x.projeto === projeto;
  const execs = R.lerJsonl(path.join(dir, 'execucoes.jsonl'), 64 * 1024 * 1024).filter(doProjeto);
  const revs = R.lerJsonl(path.join(dir, 'revisoes.jsonl'), 64 * 1024 * 1024).filter(doProjeto);
  const defs = R.lerJsonl(path.join(dir, 'defeitos.jsonl'), 64 * 1024 * 1024).filter(doProjeto);
  const ag = {};
  const de = (nome) => (ag[nome] = ag[nome] || { execucoes: 0, revisados: 0, de_primeira: 0, B: 0, A: 0, M: 0, b: 0, escaparam: 0, retrabalho: 0,
    com_faixa: 0, dentro_faixa: 0, erro_mediano: null, _erros: [] });
  for (const x of execs) {
    const a = de(x.agente); a.execucoes++;
    const ini = Date.parse(x.inicio), ate = Date.parse(x.faixa_ate), deF = Date.parse(x.faixa_de);
    if (ate && ini && x.minutos > 0 && ate > ini) {
      a.com_faixa++;
      const fim = ini + x.minutos * 60000;
      if (fim <= ate && (!deF || fim >= deF)) a.dentro_faixa++;
      const fimFaixa = (ate - ini) / 60000;
      a._erros.push(Math.abs(x.minutos - fimFaixa) / fimFaixa * 100);
    }
  }
  const porCod = {};
  for (const r of revs) {
    const a = de(r.autor);
    for (const g of ['B', 'A', 'M', 'b']) a[g] += Number(r[g]) || 0;
    const k = `${r.projeto}|${r.autor}|${r.cod}`;
    if (!porCod[k]) { porCod[k] = r; a.revisados++; if (r.veredito === 'sim') a.de_primeira++; }
  }
  // Retrabalho: execuções do autor com o mesmo código que começaram depois do primeiro "não".
  for (const r of Object.values(porCod)) {
    const naos = revs.filter((x) => x.projeto === r.projeto && x.autor === r.autor && x.cod === r.cod && x.veredito === 'nao').map((x) => Date.parse(x.em));
    if (!naos.length || !r.cod) continue;
    const primeiroNao = Math.min(...naos);
    de(r.autor).retrabalho += execs.filter((x) => x.agente === r.autor && x.cod === r.cod && x.projeto === r.projeto && Date.parse(x.inicio) > primeiroNao).length;
  }
  for (const d of defs) de(d.agente).escaparam++;
  for (const a of Object.values(ag)) { a.erro_mediano = a._erros.length ? Math.round(R.quantil(a._erros, 0.5) * 10) / 10 : null; delete a._erros; }
  const pegos = revs.reduce((s, r) => s + ['B', 'A', 'M', 'b'].reduce((t, g) => t + (Number(r[g]) || 0), 0), 0);
  const usuario = defs.length;
  const captura = { pegos, usuario, taxa: pegos + usuario ? Math.round(pegos / (pegos + usuario) * 1000) / 10 : null, meta: 80 };
  return { gerado_em: new Date().toISOString(), projeto: projeto || null, agentes: ag, captura };
}

const virgula = (x) => String(x).replace('.', ',');
function tabela(p) {
  const nomes = Object.keys(p.agentes).sort();
  if (!nomes.length) return 'Placar vazio: ainda não há execução registrada.';
  const l = ['| Agente | Execuções | De primeira no revisor | Defeitos do revisor B/A/M/b | Escaparam ao usuário | Retrabalho | Dentro da faixa | Erro mediano da faixa |',
    '|---|---|---|---|---|---|---|---|'];
  for (const n of nomes) {
    const a = p.agentes[n];
    l.push(`| ${n} | ${a.execucoes} | ${a.revisados ? `${a.de_primeira}/${a.revisados}` : '—'} | ${a.B}/${a.A}/${a.M}/${a.b} | ${a.escaparam} | ${a.retrabalho} | ` +
      `${a.com_faixa ? `${a.dentro_faixa}/${a.com_faixa}` : '—'} | ${a.erro_mediano == null ? '—' : virgula(a.erro_mediano) + '%'} |`);
  }
  const c = p.captura;
  l.push('', c.taxa == null ? 'Taxa de captura do revisor: sem dados ainda.' : `Taxa de captura do revisor: ${virgula(c.taxa)}% (${c.pegos} de ${c.pegos + c.usuario}; meta ≥ ${c.meta}%)`);
  return l.join('\n');
}

function refazer(opc) {
  const p = calcular(opc);
  if (!opc || !opc.projeto) { fs.mkdirSync(R.pastaGlobal(), { recursive: true }); fs.writeFileSync(path.join(R.pastaGlobal(), 'placar.json'), JSON.stringify(p, null, 1)); }
  return p;
}

function defeito(o) {
  const cwd = path.resolve(o.pasta || process.cwd());
  const agente = R.agenteCurto(o.agente === true ? '' : o.agente);
  const g = gravidade(o.gravidade);
  const texto = o.texto && o.texto !== true ? String(o.texto).replace(/\s+/g, ' ').trim() : '';
  if (!agente || !g || !texto) { console.error('uso: node placar.js defeito --agente <nome> --gravidade <Bloqueante|Alta|Média|baixa> --texto "<o que o usuário viu>"'); process.exit(2); }
  const data = new Date().toISOString().slice(0, 10);
  const arq = path.join(R.base(cwd), 'DEFEITOS-USUARIO.md');
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  if (!fs.existsSync(arq)) fs.writeFileSync(arq, '# Defeitos achados pelo usuário\n\n> Defeito que escapou do revisor e chegou ao usuário. Uma linha por defeito: data · agente · gravidade · o que viu.\n> A contagem (sem o texto) entra no placar.\n\n');
  const nomeG = { B: 'Bloqueante', A: 'Alta', M: 'Média', b: 'baixa' }[g];
  fs.appendFileSync(arq, `- ${data} · ${agente} · ${nomeG} · ${texto}\n`, 'utf8');
  R.acrescentar(path.join(R.pastaGlobal(), 'defeitos.jsonl'), { em: new Date().toISOString(), agente, projeto: R.projetoHash(cwd), gravidade: g });
  refazer();
  console.log(`defeito registrado: ${agente} · ${nomeG} → .claude/base/DEFEITOS-USUARIO.md`);
}

module.exports = { calcular, refazer, tabela };

if (require.main === module) {
  const a = process.argv.slice(2);
  const o = { _: [] };
  for (let i = 0; i < a.length; i++) { if (a[i].startsWith('--')) { const v = a[i + 1]; if (v === undefined || v.startsWith('--')) o[a[i].slice(2)] = true; else { o[a[i].slice(2)] = v; i++; } } else o._.push(a[i]); }
  if (o._[0] === 'defeito') defeito(o);
  else {
    const p = refazer(o.projeto ? { projeto: R.projetoHash(path.resolve(o.pasta || process.cwd())) } : {});
    console.log(o.json ? JSON.stringify(p) : tabela(p));
  }
}
