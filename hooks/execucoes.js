#!/usr/bin/env node
// Registro de cada execução de agente (0.7.0). Ganchos: PreToolUse e PostToolUse da ferramenta Agent, SubagentStart e
// SubagentStop. No projeto, anota o ciclo de vida em .claude/base/.agentes.jsonl (pedido → lançado → início → fim),
// que o mapa ao vivo lê para o painel "Agentes agora". No fim, grava uma linha em ~/.claude/agentes-ultimate/
// execucoes.jsonl só com metadados (agente, classe, minutos, faixa, código do pedido, código anônimo do projeto).
// A descrição e o pedido nunca são gravados. Nunca bloqueia: em qualquer erro, sai 0.
'use strict';
const path = require('path');
const R = require('./registro');

const DEZ_MIN = 10 * 60 * 1000;
const iso = (ms) => new Date(ms).toISOString();
const ref = () => Math.random().toString(36).slice(2, 8);

function tratar(d) {
  const cwd = d.cwd || process.cwd();
  const ev = d.hook_event_name;
  if (!ev || !R.permitida(cwd)) return;
  const arq = path.join(R.base(cwd), '.agentes.jsonl');
  const agora = Date.now();

  if ((ev === 'PreToolUse' || ev === 'PostToolUse') && /^(Agent|Task)$/.test(d.tool_name || '')) {
    const ti = d.tool_input || {};
    const agente = R.agenteCurto(ti.subagent_type || 'general-purpose');
    const cod = R.codDe(ti.description, ti.prompt);
    if (ev === 'PreToolUse') {
      R.acrescentar(arq, { em: iso(agora), tipo: 'pedido', ref: ref(), agente, cod, classe: R.classeDe(ti.description), bg: !!ti.run_in_background });
      return;
    }
    const resp = d.tool_response || {};
    if (resp.status !== 'async_launched' || !resp.agentId) return; // o agente em primeiro plano já terminou: o SubagentStop registra
    const regs = R.lerJsonl(arq);
    const p = pedidoLivre(regs, agente, cod, agora);
    R.acrescentar(arq, { em: iso(agora), tipo: 'lancado', id: String(resp.agentId), agente, cod: cod || (p && p.cod) || null,
      classe: (p && p.classe) || R.classeDe(ti.description), ref: p ? p.ref : null });
    return;
  }

  const agente = R.agenteCurto(d.agent_type);
  const id = d.agent_id ? String(d.agent_id) : '';
  if (!agente || !id) return; // agentes internos do Claude Code vêm sem tipo

  if (ev === 'SubagentStart') {
    const regs = R.lerJsonl(arq);
    if (regs.some((r) => r.tipo === 'inicio' && r.id === id)) return; // retomada do mesmo agente
    const lancado = regs.find((r) => r.tipo === 'lancado' && r.id === id);
    const p = lancado ? null : pedidoLivre(regs, agente, null, agora);
    const fonte = lancado || p || {};
    R.acrescentar(arq, { em: iso(agora), tipo: 'inicio', id, agente, cod: fonte.cod || null, classe: fonte.classe || 'outra', ref: p ? p.ref : (lancado && lancado.ref) || null });
    return;
  }

  if (ev === 'SubagentStop') {
    const regs = R.lerJsonl(arq);
    if (regs.some((r) => r.tipo === 'fim' && r.id === id)) return; // o SubagentStop chega 2 vezes para o mesmo agente
    const ini = regs.find((r) => r.tipo === 'inicio' && r.id === id) || {};
    const pontas = d.agent_transcript_path ? R.pontasTranscricao(d.agent_transcript_path) : { inicio: null, fim: null };
    const inicio = pontas.inicio || Date.parse(ini.em) || agora;
    const fim = Math.max(inicio, pontas.fim || agora);
    const minutos = Math.round((fim - inicio) / 6000) / 10;
    const cod = ini.cod || null;
    const est = R.estimativaPara(cwd, agente, cod, inicio);
    R.acrescentar(arq, { em: iso(agora), tipo: 'fim', id, agente, cod, minutos });
    const linha = {
      id, agente, classe: est ? R.classeValida(est.classe) : (ini.classe || 'outra'), projeto: R.projetoHash(cwd),
      inicio: iso(inicio), fim: iso(fim), minutos,
      estimado_min: est && est.estimado_min != null ? est.estimado_min : null,
      faixa_de: est ? est.de : null, faixa_ate: est ? est.ate : null, fonte_estimativa: est ? 'registrada' : 'sem',
      cod, versao_plugin: R.versaoPlugin(),
    };
    const nome = R.nomeCurto(cwd);
    if (nome) linha.nome_projeto = nome;
    R.acrescentar(path.join(R.pastaGlobal(), 'execucoes.jsonl'), linha, 20 * 1024 * 1024);
  }
}

// O pedido (PreToolUse) mais antigo do mesmo agente que ainda não virou lançamento nem início, dos últimos 10 min.
function pedidoLivre(regs, agente, cod, agora) {
  const usados = new Set(regs.filter((r) => (r.tipo === 'lancado' || r.tipo === 'inicio') && r.ref).map((r) => r.ref));
  return regs.find((r) => r.tipo === 'pedido' && r.agente === agente && !usados.has(r.ref) && (!cod || r.cod === cod) &&
    agora - Date.parse(r.em) < DEZ_MIN) || null;
}

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  try { tratar(JSON.parse(entrada || '{}')); } catch (e) { /* nunca quebra o trabalho */ }
  process.exit(0);
});
