#!/usr/bin/env node
// Estimativa dos agentes (0.7.0). Único jeito de registrar a faixa dita ao usuário: grava em UTF-8, sempre válido
// (escrever o JSON à mão pelo PowerShell corrompe acentos e estrutura).
//   node estimar.js registrar --agente dev-powerbi --de 14:10 --ate 14:50 [--classe construcao] [--cod ab12] [--estimado 40]
//       → .claude/base/.estimativas.jsonl da pasta atual (ou --pasta <projeto>)
'use strict';
const path = require('path');
const R = require('../hooks/registro');

function opcoes(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) o[a.slice(2)] = true; else { o[a.slice(2)] = v; i++; } } else o._.push(a);
  }
  return o;
}
const falha = (msg) => { console.error(msg); process.exit(2); };
// O código é do trabalho: outro agente com o mesmo código (ex.: o revisor com o código do autor) é recusado.
function codigoDeOutro(cwd, agente, cod) {
  if (!cod) return;
  const outro = R.lerJsonl(path.join(R.base(cwd), '.estimativas.jsonl')).find((e) => e.cod === cod && e.agente !== agente);
  if (outro) falha(`o código ${cod} é do trabalho do ${outro.agente}. Para revisar esse trabalho, ponha [revisa:${cod}] na descrição e dê ao ${agente} um código próprio [cod:xxxx].`);
}

function registrar(o) {
  const cwd = path.resolve(o.pasta || process.cwd());
  const agente = R.agenteCurto(o.agente === true ? '' : o.agente);
  if (!agente) falha('falta --agente');
  const de = R.deHora(o.de), ateBruto = R.deHora(o.ate);
  if (de == null || ateBruto == null) falha('faixa incompleta: use --de HH:MM e --ate HH:MM (ex.: --de 14:10 --ate 14:50)');
  const ate = ateBruto < de ? ateBruto + 24 * 60 * 60 * 1000 : ateBruto; // passa da meia-noite
  const estimado = o.estimado != null && o.estimado !== true ? Number(String(o.estimado).replace(',', '.')) : null;
  if (estimado != null && !(estimado > 0)) falha('--estimado em minutos, maior que zero');
  const cod = o.cod && o.cod !== true ? R.codDe(`[cod:${o.cod}]`) : null;
  if (o.cod && !cod) falha('--cod: 2 a 16 letras ou números (ex.: ab12)');
  codigoDeOutro(cwd, agente, cod);
  const linha = { em: new Date().toISOString(), agente, classe: R.classeValida(o.classe === true ? '' : o.classe), cod,
    de: new Date(de).toISOString(), ate: new Date(ate).toISOString(), estimado_min: estimado };
  R.acrescentar(path.join(R.base(cwd), '.estimativas.jsonl'), linha);
  console.log(`faixa registrada: ${agente} · ${R.hhmm(de)}–${R.hhmm(ate)}${cod ? ' · cod ' + cod : ''} · classe ${linha.classe}`);
}

// Importa as execuções antigas do projeto a partir das transcrições do Claude Code (~/.claude/projects/<pasta>/*/
// subagents/agent-*.meta.json + .jsonl). Só as terminadas; cada uma entra uma vez. Da descrição sai só a classe.
function importar(o) {
  const t0 = Date.now();
  const cwd = path.resolve(o.pasta || process.cwd());
  const fs = require('fs');
  const os = require('os');
  const raiz = path.join(os.homedir(), '.claude', 'projects', cwd.replace(/[^A-Za-z0-9]/g, '-'));
  const destino = path.join(R.pastaGlobal(), 'execucoes.jsonl');
  const ja = new Set(R.lerJsonl(destino, 64 * 1024 * 1024).map((x) => x.id));
  let lidas = 0, novas = 0, puladas = 0;
  let sessoes = [];
  try { sessoes = fs.readdirSync(raiz); } catch (e) { /* sem transcrições */ }
  for (const s of sessoes) {
    const dir = path.join(raiz, s, 'subagents');
    let metas = [];
    try { metas = fs.readdirSync(dir).filter((f) => /^agent-.+\.meta\.json$/.test(f)); } catch (e) { continue; }
    for (const m of metas) {
      lidas++;
      const id = m.replace(/^agent-/, '').replace(/\.meta\.json$/, '');
      let meta = null;
      try { meta = JSON.parse(fs.readFileSync(path.join(dir, m), 'utf8')); } catch (e) { /* inválido */ }
      const agente = meta && R.agenteCurto(meta.agentType);
      if (!meta || !meta.finished || !agente || ja.has(id)) { puladas++; continue; }
      const p = R.pontasTranscricao(path.join(dir, `agent-${id}.jsonl`));
      if (!p.inicio || !p.fim || p.fim <= p.inicio) { puladas++; continue; }
      const linha = { id, agente, classe: R.classeDe(meta.description), projeto: R.projetoHash(cwd), inicio: new Date(p.inicio).toISOString(),
        fim: new Date(p.fim).toISOString(), minutos: Math.round((p.fim - p.inicio) / 6000) / 10, estimado_min: null, faixa_de: null, faixa_ate: null,
        fonte_estimativa: 'importado', cod: R.codDe(meta.description), versao_plugin: R.versaoPlugin() };
      if (meta.revivedAt) linha.retomado = true; // retomado depois de parar: o tempo inclui a espera, fica fora da estatística
      const nome = R.nomeCurto(cwd);
      if (nome) linha.nome_projeto = nome;
      R.acrescentar(destino, linha, 64 * 1024 * 1024);
      ja.add(id); novas++;
    }
  }
  console.log(`importar · ${lidas} transcrições lidas · ${novas} execuções novas · ${puladas} puladas (não terminadas, sem tipo ou já registradas) · 0 erro · ${Date.now() - t0} ms`);
}

// Faixa de término pela classe de referência. Sem --estimado: [mediana, p75] dos minutos reais das execuções
// parecidas. Com --estimado (conta de baixo para cima do orquestrador): estimado × [mediana, p75] do fator real ÷
// estimado (corrige o otimismo). Sem histórico (n < 3 em todos os níveis): estimado × 1 a × 2.
function faixa(o) {
  const agente = R.agenteCurto(o.agente === true ? '' : o.agente);
  const classe = o.classe && o.classe !== true ? R.classeValida(o.classe) : null;
  const estimado = o.estimado != null && o.estimado !== true ? Number(String(o.estimado).replace(',', '.')) : null;
  if (estimado != null && !(estimado > 0)) falha('--estimado em minutos, maior que zero');
  const inicio = o.inicio && o.inicio !== true ? R.deHora(o.inicio) : Date.now();
  if (inicio == null) falha('--inicio HH:MM');
  const resumo = R.resumoExecucoes();
  const ref = R.referenciaResumo(resumo, agente, classe);
  const mins = ref.valores;
  const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
  const r2 = (x) => (x == null ? null : Math.round(x * 100) / 100);
  const res = { agente, classe, nivel: ref.nivel, n: mins.length, mediana: r1(R.quantil(mins, 0.5)), p75: r1(R.quantil(mins, 0.75)),
    estimado_min: estimado, fator_nivel: null, fator_n: 0, fator_mediana: null, fator_p75: null, de_min: null, ate_min: null };
  if (estimado) {
    const rf = R.referenciaResumo(resumo, agente, classe, 'fat');
    const fat = rf.valores;
    if (fat.length) {
      Object.assign(res, { fator_nivel: rf.nivel, fator_n: fat.length, fator_mediana: r2(R.quantil(fat, 0.5)), fator_p75: r2(R.quantil(fat, 0.75)) });
      res.de_min = r1(estimado * res.fator_mediana); res.ate_min = r1(estimado * Math.max(res.fator_mediana, res.fator_p75));
    } else { res.de_min = estimado; res.ate_min = estimado * 2; res.nivel = ref.n ? res.nivel : 'sem histórico'; res.fator_nivel = 'sem histórico'; }
  } else if (mins.length) { res.de_min = res.mediana; res.ate_min = Math.max(res.mediana, res.p75); }
  const virgula = (x) => String(x).replace('.', ',');
  if (res.de_min == null) {
    res.texto = `sem histórico (n=0 para ${agente || 'este agente'}): informe --estimado <min>`;
  } else {
    const cinco = 5 * 60000;
    res.de = new Date(Math.floor((inicio + res.de_min * 60000) / cinco) * cinco).toISOString();
    res.ate = new Date(Math.max(Math.ceil((inicio + res.ate_min * 60000) / cinco) * cinco, Date.parse(res.de) + cinco)).toISOString();
    const partes = [`${R.hhmm(Date.parse(res.de))}–${R.hhmm(Date.parse(res.ate))}`];
    if (res.n) partes.push(`base n=${res.n} (${res.nivel})`, `mediana ${virgula(res.mediana)} min`, `p75 ${virgula(res.p75)} min`);
    else partes.push('sem histórico');
    if (estimado) partes.push(res.fator_mediana != null ? `estimado ${virgula(estimado)} min × fator ${virgula(res.fator_mediana)} (n=${res.fator_n}, ${res.fator_nivel})` : `estimado ${virgula(estimado)} min × 1 a 2 (fator sem histórico)`);
    res.texto = partes.join(' · ');
  }
  if (o.registrar) {
    if (!res.de) falha(res.texto);
    const cod = o.cod && o.cod !== true ? R.codDe(`[cod:${o.cod}]`) : null;
    if (o.cod && !cod) falha('--cod: 2 a 16 letras ou números (ex.: ab12)');
    codigoDeOutro(path.resolve(o.pasta || process.cwd()), agente, cod);
    R.acrescentar(path.join(R.base(path.resolve(o.pasta || process.cwd())), '.estimativas.jsonl'), { em: new Date().toISOString(), agente,
      classe: classe || 'outra', cod, de: res.de, ate: res.ate, estimado_min: estimado, base: `${res.nivel} n=${res.n}` });
    res.registrada = true;
  }
  console.log(o.json ? JSON.stringify(res) : res.texto + (res.registrada ? ' · registrada' : ''));
}

const o = opcoes(process.argv.slice(2));
const cmd = o._[0];
if (cmd === 'registrar') registrar(o);
else if (cmd === 'faixa') faixa(o);
else if (cmd === 'importar') importar(o);
else falha('uso: node estimar.js registrar --agente <nome> --de HH:MM --ate HH:MM [--classe <tipo>] [--cod <código>] [--estimado <min>]\n' +
  '     node estimar.js importar [--pasta <projeto>]');
