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

  // ---- Lote 9: T19 (compactar e retomar) e T2 (verificador do projeto) ----
  const pv = projeto([]);
  const ativ = (extra) => hook('atividade.js', { hook_event_name: 'PostToolUse', cwd: pv, session_id: 'S9', tool_name: 'Read', tool_input: { file_path: path.join(pv, 'a.txt') }, ...extra });
  let aviso50 = false, aviso49 = false, aviso75 = false;
  for (let i = 1; i <= 75; i++) { fs.writeFileSync(path.join(pv, '.claude', 'base', '.contagem.json'), JSON.stringify({ sessao: 'S9', n: i - 1 })); if (![49, 50, 75].includes(i)) continue; const x = ativ(); const m = /compactar/.test(x.out || ''); if (i === 49) aviso49 = m; if (i === 50) aviso50 = m; if (i === 75) aviso75 = m; }
  caso('T19 compactar: aviso na 50ª e na 75ª chamada, não na 49ª', aviso50 && aviso75 && !aviso49, JSON.stringify({ aviso49, aviso50, aviso75 }));
  const rt = hook('retomar.js', { hook_event_name: 'PreCompact', cwd: pv });
  const trt = fs.existsSync(path.join(pv, '.claude', 'base', '.retomar.md')) ? fs.readFileSync(path.join(pv, '.claude', 'base', '.retomar.md'), 'utf8') : '';
  caso('T19 retomar: PreCompact grava .claude/base/.retomar.md', rt.code === 0 && /antes de compactar/.test(trt), trt.slice(0, 100) || 'sem arquivo');
  const cfgV = path.join(pv, '.claude', 'base', 'config.json');
  const edita = () => hook('atividade.js', { hook_event_name: 'PostToolUse', cwd: pv, session_id: 'V', tool_name: 'Edit', tool_input: { file_path: path.join(pv, 'a.js') } });
  let xv = edita();
  caso('T2 verificador: sem config, silêncio', xv.code === 0 && !xv.out, xv.out);
  fs.writeFileSync(cfgV, JSON.stringify({ verificador: { comando: ['node', '-e', 'process.exit(3)'] } }));
  xv = edita();
  caso('T2 verificador: comando que falha vira aviso', /verificador acusou/.test(xv.out || ''), xv.out);
  fs.writeFileSync(cfgV, JSON.stringify({ verificador: { comando: ['node', '-e', 'setTimeout(()=>{},20000)'] } }));
  const t9 = Date.now(); xv = edita();
  caso('T2 verificador: comando lento é cortado em 5 s e não trava', /cortado em 5 s/.test(xv.out || '') && Date.now() - t9 < 12000, xv.out);
  fs.writeFileSync(cfgV, JSON.stringify({ verificador: { comando: ['node', '-e', 'process.exit(0)'], extensoes: ['.py'] } }));
  xv = edita();
  caso('T2 verificador: extensão fora da lista não roda', !xv.out, xv.out);
  // A-5 (3ª rodada): o nome do arquivo chega literal, sem passar por shell (%VAR% no Windows, $(...) no sh).
  const sonda = path.join(pv, 'sonda-nome.js');
  fs.writeFileSync(sonda, "require('fs').writeFileSync(process.argv[3], process.argv[2]);");
  const recebido = path.join(pv, 'recebido.txt');
  for (const nomeA5 of ['x%USERNAME%.js', 'a$(echo pego).js', 'b\`echo pego\`.js']) {
    try { fs.unlinkSync(recebido); } catch (e) { /* 1ª vez */ }
    fs.writeFileSync(cfgV, JSON.stringify({ verificador: { comando: ['node', sonda, '{arquivo}', recebido] } }));
    hook('atividade.js', { hook_event_name: 'PostToolUse', cwd: pv, session_id: 'V', tool_name: 'Edit', tool_input: { file_path: path.join(pv, nomeA5) } });
    const viu = fs.existsSync(recebido) ? fs.readFileSync(recebido, 'utf8') : '(nada)';
    caso('0.8.0 A-5 verificador: o nome "' + nomeA5 + '" chega literal, sem shell', viu === nomeA5, viu);
  }
  // b-14: nome que começa com "-" chega como "./-nome", e não vira opção do programa.
  try { fs.unlinkSync(recebido); } catch (e) { /* */ }
  fs.writeFileSync(cfgV, JSON.stringify({ verificador: { comando: ['node', sonda, '{arquivo}', recebido] } }));
  hook('atividade.js', { hook_event_name: 'PostToolUse', cwd: pv, session_id: 'V', tool_name: 'Edit', tool_input: { file_path: path.join(pv, '--x.js') } });
  const viuB14 = fs.existsSync(recebido) ? fs.readFileSync(recebido, 'utf8') : '(nada)';
  caso('0.8.0 b-14 verificador: nome que começa com "-" chega como "./--x.js"', viuB14 === './--x.js', viuB14);
  caso('0.8.0 b-14 verificador: o comentário traz exemplo que roda no Windows e avisa que .cmd não roda sem shell', /\["node", "node_modules\/eslint\/bin\/eslint\.js", "\{arquivo\}"\]/.test(fs.readFileSync(path.join(RAIZ, 'hooks', 'verificador.js'), 'utf8')) && /\.cmd[^\n]*não roda sem shell/.test(fs.readFileSync(path.join(RAIZ, 'hooks', 'verificador.js'), 'utf8')), 'comentário');
  fs.writeFileSync(cfgV, JSON.stringify({ verificador: { comando: 'node ' + sonda + ' {arquivo} ' + recebido } }));
  try { fs.unlinkSync(recebido); } catch (e) { /* */ }
  xv = edita();
  caso('0.8.0 A-5 verificador: comando em texto não roda na edição e diz para usar a lista', /precisa ser uma lista/.test(xv.out || '') && !fs.existsSync(recebido), xv.out);
  const vsrc = fs.readFileSync(path.join(RAIZ, 'hooks', 'verificador.js'), 'utf8');
  caso('0.8.0 A-5 skill integracoes: o exemplo do detector usa a lista', /"comando": \["node", "<pasta do plugin>\/ferramentas\/detector-interface\/detector\.js", "\{arquivo\}"\]/.test(fs.readFileSync(path.join(RAIZ, 'skills', 'integracoes', 'SKILL.md'), 'utf8')) && /shell: false/.test(vsrc), 'exemplo');

  // ---- Lote 10 e 11: integrações e T1 detector (fixture com defeito sai 1; limpa sai 0; pasta com espaço e acento) ----
  const pd = path.join(tmp, 'detector com espaço ação'); fs.mkdirSync(pd, { recursive: true });
  const det = path.join(RAIZ, 'ferramentas', 'detector-interface', 'detector.js');
  const ruim = path.join(pd, 'ruim.html'); const bom = path.join(pd, 'bom.html');
  fs.writeFileSync(ruim, '<meta name="viewport" content="user-scalable=no">\n<style>a{transition: all .2s;height:100vh}</style>\n<img src="x.png">\n');
  fs.writeFileSync(bom, '<!doctype html><html lang="pt"><style>a{transition:opacity .2s;height:100dvh}</style><img src="x.png" alt="Logotipo"></html>\n');
  const roda = (f) => require('child_process').spawnSync(process.execPath, [det, f], { windowsHide: true, encoding: 'utf8' });
  let dr = roda(ruim);
  caso('T1 detector: HTML com defeito sai 1 e aponta linha e regra', dr.status === 1 && /ruim\.html:1 \[zoom-desligado\]/.test(dr.stdout) && /\[transition-all\]/.test(dr.stdout) && /\[img-sem-alt\]/.test(dr.stdout), dr.stdout + dr.stderr);
  dr = roda(bom);
  caso('T1 detector: HTML limpo sai 0', dr.status === 0 && /0 achado/.test(dr.stdout), dr.stdout);
  const cfgD = JSON.parse(fs.readFileSync(path.join(RAIZ, 'hooks', 'hooks.json'), 'utf8'));
  caso('T1 detector: desligado por padrão (nenhum gancho do plugin o chama)', !JSON.stringify(cfgD).includes('detector'), 'gancho cita o detector');
  const ski = fs.readFileSync(path.join(RAIZ, 'skills', 'integracoes', 'SKILL.md'), 'utf8');
  caso('0.8.0 B10 skill integracoes: só do usuário, com as ferramentas, o dado que sai e como desligar; não instala', /^disable-model-invocation: true/m.test(ski) && ['context7', '21st', 'strix', 'semgrep', 'Chrome DevTools'].every((s) => ski.includes(s)) && /não instala nada/.test(ski) && /Desligar/.test(ski), 'falta');
};
