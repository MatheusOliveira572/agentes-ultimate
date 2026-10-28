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
    const tu = d.tool_use_id ? String(d.tool_use_id) : null;
    if (ev === 'PreToolUse') {
      R.acrescentar(arq, { em: iso(agora), tipo: 'pedido', ref: ref(), tu, agente, cod, classe: R.classeDe(ti.description), bg: !!ti.run_in_background });
      return;
    }
    // O PostToolUse traz no mesmo pacote o agentId e a descrição com o código: é o par exato (em segundo plano chega
    // logo depois do lançamento; em primeiro plano, no fim). Os ganchos rodam em paralelo, então o SubagentStart pode
    // ter chegado antes: quem lê usa este par (R.ligacao) no lugar do palpite do início.
    const resp = d.tool_response || {};
    if (!resp.agentId) return;
    const regs = R.lerJsonl(arq);
    const p = pedidoLivre(regs, agente, cod, agora, tu);
    R.acrescentar(arq, { em: iso(agora), tipo: 'lancado', id: String(resp.agentId), tu, agente, cod,
      classe: (p && p.classe) || R.classeDe(ti.description), ref: p ? p.ref : null });
    return;
  }

  // Início de sessão: agente de outra sessão sem fim e sem sinal há 30 min sai do painel ("abandonado"). Se ele ainda
  // terminar, o SubagentStop registra normalmente (só o "fim" evita a repetição).
  if (ev === 'SessionStart') {
    const regs = R.lerJsonl(arq);
    const fechados = new Set(regs.filter((r) => r.tipo === 'fim' || r.tipo === 'abandonado').map((r) => r.id));
    for (const r of regs) {
      if (r.tipo !== 'inicio' || fechados.has(r.id) || (d.session_id && r.sessao === d.session_id)) continue;
      if (agora - R.ultimoSinal(cwd, r.agente, R.ligacao(regs, r.id).cod, Date.parse(r.em)) < R.PRAZO_FOLGA) continue;
      R.acrescentar(arq, { em: iso(agora), tipo: 'abandonado', id: r.id, agente: r.agente });
      fechados.add(r.id);
    }
    return;
  }

  const agente = R.agenteCurto(d.agent_type);
  const id = d.agent_id ? String(d.agent_id) : '';
  if (!agente || !id) return; // agentes internos do Claude Code vêm sem tipo

  if (ev === 'SubagentStart') {
    const regs = R.lerJsonl(arq);
    if (regs.some((r) => r.tipo === 'inicio' && r.id === id)) return; // retomada do mesmo agente
    // Código, em ordem de certeza: o .meta.json do agente (descrição e tool_use_id dele), o par do PostToolUse, e só
    // então o pedido mais antigo do mesmo tipo (palpite, marcado provisório).
    const meta = R.metaAgente(d.transcript_path, id);
    const lancado = regs.find((r) => r.tipo === 'lancado' && r.id === id);
    let fonte = null, provisorio = false;
    if (meta) {
      const p = pedidoLivre(regs, agente, null, agora, meta.toolUseId) || {};
      fonte = { cod: R.codDe(meta.description), classe: p.classe || R.classeDe(meta.description), ref: p.ref || null };
    } else if (lancado) fonte = lancado;
    else { fonte = pedidoLivre(regs, agente, null, agora) || {}; provisorio = true; }
    const linha = { em: iso(agora), tipo: 'inicio', id, agente, cod: fonte.cod || null, classe: fonte.classe || 'outra', ref: fonte.ref || null, sessao: d.session_id || null };
    if (provisorio) linha.provisorio = true;
    R.acrescentar(arq, linha);
    return;
  }

  if (ev === 'SubagentStop') {
    const regs = R.lerJsonl(arq);
    if (regs.some((r) => r.tipo === 'fim' && r.id === id)) return; // o SubagentStop chega 2 vezes para o mesmo agente
    const ini = regs.find((r) => r.tipo === 'inicio' && r.id === id) || {};
    const lig = R.ligacao(regs, id);
    const meta = d.agent_transcript_path ? R.metaAgente(null, id, String(d.agent_transcript_path).replace(/\.jsonl$/, '.meta.json')) : null;
    const pontas = d.agent_transcript_path ? R.pontasTranscricao(d.agent_transcript_path) : { inicio: null, fim: null };
    const inicio = pontas.inicio || Date.parse(ini.em) || agora;
    const fim = Math.max(inicio, pontas.fim || agora);
    const minutos = Math.round((fim - inicio) / 6000) / 10;
    const cod = meta ? R.codDe(meta.description) : lig.cod;
    const est = R.estimativaPara(cwd, agente, cod, inicio);
    R.acrescentar(arq, { em: iso(agora), tipo: 'fim', id, agente, cod, minutos });
    const linha = {
      id, agente, classe: est ? R.classeValida(est.classe) : (lig.classe || 'outra'), projeto: R.projetoHash(cwd),
      inicio: iso(inicio), fim: iso(fim), minutos,
      estimado_min: est && est.estimado_min != null ? est.estimado_min : null,
      faixa_de: est ? est.de : null, faixa_ate: est ? est.ate : null, fonte_estimativa: est ? 'registrada' : 'sem',
      cod, versao_plugin: R.versaoPlugin(),
    };
    const nome = R.nomeCurto(cwd);
    if (nome) linha.nome_projeto = nome;
    R.acrescentar(path.join(R.pastaGlobal(), 'execucoes.jsonl'), linha, 64 * 1024 * 1024);
    placarDoRevisor(cwd, agente, id, d.last_assistant_message, pontas.cauda);
    // Só o resumo incremental (o trecho novo); se ele estiver muito atrás, quem lê sem pressa refaz. O placar completo
    // é refeito pela skill placar, nunca aqui.
    R.resumoExecucoes(64 * 1024);
  }
}

// Linha fixa no fim do relatório do revisor:
//   Placar: autor=<agente> cod=<código> veredito=sim|não B=<n> A=<n> M=<n> b=<n>
// Vem da última mensagem do agente ou, com SubagentHandback, do fim da transcrição. Revisor sem a linha: aviso.
const LINHA_PLACAR = /Placar:\s*autor=([\w:.-]+)\s+cod=([\w-]+)\s+veredito=(sim|n[ãa]o)\s+B=(\d+)\s+A=(\d+)\s+M=(\d+)\s+b=(\d+)/gi;
function placarDoRevisor(cwd, agente, id, msg, cauda) {
  let m = null;
  for (const txt of [msg, cauda]) { const todas = [...String(txt || '').matchAll(LINHA_PLACAR)]; if (todas.length) { m = todas[todas.length - 1]; break; } }
  const dir = R.pastaGlobal();
  if (!m) {
    if (!/revis/.test(agente)) return;
    const arq = path.join(dir, 'estado.json');
    let est = {}; try { est = JSON.parse(require('fs').readFileSync(arq, 'utf8')); } catch (e) { /* novo */ }
    est.revisor_sem_placar = (est.revisor_sem_placar || 0) + 1; est.ultimo_sem_placar = new Date().toISOString();
    require('fs').mkdirSync(dir, { recursive: true }); require('fs').writeFileSync(arq, JSON.stringify(est, null, 1));
    return;
  }
  const projeto = R.projetoHash(cwd), autor = R.agenteCurto(m[1]), cod = m[2].toLowerCase();
  const rev = { em: new Date().toISOString(), revisor: agente, id, autor, cod, projeto,
    veredito: /^sim$/i.test(m[3]) ? 'sim' : 'nao', B: +m[4], A: +m[5], M: +m[6], b: +m[7] };
  const ja = R.indiceRevisoes(256 * 1024); // índice por chave, lido só no trecho novo
  rev.primeira = ja ? !ja.chaves[R.chaveRevisao(rev)] : null; // índice frio e histórico grande: o placar decide depois
  R.acrescentar(path.join(dir, 'revisoes.jsonl'), rev, 64 * 1024 * 1024);
  R.indiceRevisoes(64 * 1024);
}

// O pedido (PreToolUse) mais antigo do mesmo agente que ainda não virou lançamento nem início, dos últimos 10 min.
function pedidoLivre(regs, agente, cod, agora, tu) {
  if (tu) { const exato = regs.find((r) => r.tipo === 'pedido' && r.tu === tu); if (exato) return exato; }
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
