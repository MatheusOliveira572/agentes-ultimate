// Casos do painel "Agentes agora": agente ativo não some, retomado volta, parado por erro vira "sem notícia",
// progresso sem código só com um agente vivo do tipo, sem faixa registrada não há % estimado.
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function testarPainel({ caso, tmp, RAIZ, hook }) {
  const R = require(path.join(RAIZ, 'hooks', 'registro.js'));
  const min = 60000;
  const agora = Date.now();
  const iso = (m) => new Date(agora - m * min).toISOString();
  let n = 0;
  const projeto = (linhas) => {
    const p = path.join(tmp, 'painel-' + (++n));
    fs.mkdirSync(path.join(p, '.claude', 'base', '.progresso'), { recursive: true });
    fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), linhas.map((l) => JSON.stringify(l)).join('\n') + '\n');
    return p;
  };
  const transcricao = (p, nome, minAtras) => {
    const f = path.join(p, nome + '.jsonl');
    fs.writeFileSync(f, '{}\n');
    const t = new Date(agora - minAtras * min);
    fs.utimesSync(f, t, t);
    return f;
  };
  const achar = (p, id) => (R.agentesAgora(p, { agora }) || []).find((x) => x.id === id);

  // 1. Ativo há 6 h, sem código e sem faixa: a transcrição escrita agora o mantém no painel.
  let p = projeto([]);
  let tr = transcricao(p, 'a1', 1);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), JSON.stringify({ em: iso(360), tipo: 'inicio', id: 'a1', agente: 'engenheiro-software', cod: null, tr }) + '\n');
  caso('painel: agente ativo há 6 h, sem código nem faixa, continua "trabalhando" pela escrita da transcrição', (achar(p, 'a1') || {}).estado === 'trabalhando', JSON.stringify(achar(p, 'a1')));

  // 2. Ativo há mais de 12 h também não sai.
  p = projeto([]);
  tr = transcricao(p, 'a2', 2);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), JSON.stringify({ em: iso(800), tipo: 'inicio', id: 'a2', agente: 'revisor', tr }) + '\n');
  caso('painel: agente ativo há mais de 12 h não sai', (achar(p, 'a2') || {}).estado === 'trabalhando', JSON.stringify(achar(p, 'a2')));

  // 3. Retomado sem novo início: a transcrição cresceu depois do fim.
  p = projeto([]);
  tr = transcricao(p, 'a3', 1);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), [{ em: iso(300), tipo: 'inicio', id: 'a3', agente: 'revisor', tr }, { em: iso(200), tipo: 'fim', id: 'a3', agente: 'revisor', minutos: 100 }].map((l) => JSON.stringify(l)).join('\n') + '\n');
  caso('painel: retomado por mensagem volta sozinho (transcrição cresceu depois do fim)', (achar(p, 'a3') || {}).estado === 'trabalhando', JSON.stringify(achar(p, 'a3')));

  // 3b. Fim normal: a última escrita é a do próprio fim, continua "terminou".
  p = projeto([]);
  tr = transcricao(p, 'a4', 5);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), [{ em: iso(60), tipo: 'inicio', id: 'a4', agente: 'revisor', tr }, { em: iso(5), tipo: 'fim', id: 'a4', agente: 'revisor', minutos: 55 }].map((l) => JSON.stringify(l)).join('\n') + '\n');
  caso('painel: fim normal continua "terminou" (a escrita final não conta como retomada)', (achar(p, 'a4') || {}).estado === 'terminou', JSON.stringify(achar(p, 'a4')));

  // 4. Parou por erro de API: nenhum fim, transcrição parada há 40 min.
  p = projeto([]);
  tr = transcricao(p, 'a5', 40);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), JSON.stringify({ em: iso(60), tipo: 'inicio', id: 'a5', agente: 'revisor', tr }) + '\n');
  caso('painel: parado sem fim (erro de API) vira "sem notícia" 30 min depois da última escrita', (achar(p, 'a5') || {}).estado === 'sem-noticia', JSON.stringify(achar(p, 'a5')));

  // 5. Progresso com outro sufixo: vale com um único vivo do tipo; com dois, não.
  p = projeto([{ em: iso(10), tipo: 'inicio', id: 'b1', agente: 'engenheiro-software' }]);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.progresso', 'engenheiro-software-parteB.json'), JSON.stringify({ feito: 2, total: 8, agora: 'lote dois' }));
  caso('painel: progresso sem o código exato vale com um único agente vivo do tipo', (achar(p, 'b1') || {}).pct === 25, JSON.stringify(achar(p, 'b1')));
  p = projeto([{ em: iso(10), tipo: 'inicio', id: 'b2', agente: 'engenheiro-software' }, { em: iso(9), tipo: 'inicio', id: 'b3', agente: 'engenheiro-software' }]);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.progresso', 'engenheiro-software-parteB.json'), JSON.stringify({ feito: 2, total: 8, agora: 'lote dois' }));
  caso('painel: com dois vivos do mesmo tipo, o progresso sem código não é de nenhum', (achar(p, 'b2') || {}).pct == null && (achar(p, 'b3') || {}).pct == null, JSON.stringify([achar(p, 'b2'), achar(p, 'b3')]));

  // 6. Sem faixa registrada e sem progresso: sem %, sem término, mesmo com histórico.
  p = projeto([{ em: iso(20), tipo: 'inicio', id: 'c1', agente: 'revisor' }]);
  const resumo = { min: { revisor: [10, 12, 14, 16], todos: [10, 12, 14, 16] }, fat: {} };
  const c1 = (R.agentesAgora(p, { agora, resumo }) || []).find((x) => x.id === 'c1') || {};
  const pc1 = R.previsao(p, { agente: 'revisor', inicio: agora - 20 * min, agora, resumo });
  caso('painel: sem faixa registrada não há % estimado nem término ("sem previsão")', c1.pct == null && c1.termina == null && c1.ate == null && pc1.frac == null && pc1.ate == null, JSON.stringify(c1));

  // 7. O gancho: fim, retomada, novo fim; e o início guarda só o caminho da transcrição.
  p = projeto([]);
  fs.writeFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), '');
  const ev = (nome, extra = {}) => hook('execucoes.js', { hook_event_name: nome, cwd: p, agent_id: 'd1', agent_type: 'agentes-ultimate:revisor', session_id: 'S', transcript_path: path.join(p, 'S.jsonl'), ...extra });
  ev('SubagentStart'); ev('SubagentStop'); ev('SubagentStart'); ev('SubagentStop');
  const regs = fs.readFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  caso('painel: agente retomado registra "retomada" e pode ter um segundo fim', regs.filter((r) => r.tipo === 'retomada').length === 1 && regs.filter((r) => r.tipo === 'fim').length === 2, JSON.stringify(regs.map((r) => r.tipo)));
  caso('painel: o início guarda o caminho da transcrição do agente, nunca o conteúdo', /agent-d1\.jsonl$/.test(regs[0].tr || '') && !('prompt' in regs[0]), JSON.stringify(regs[0]));
  const n1 = regs.length;
  ev('SubagentStop');
  const regs2 = fs.readFileSync(path.join(p, '.claude', 'base', '.agentes.jsonl'), 'utf8').trim().split('\n');
  caso('painel: SubagentStop repetido não vira fim duplicado', regs2.length === n1, `${regs2.length} × ${n1}`);
};
