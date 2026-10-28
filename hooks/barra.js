#!/usr/bin/env node
// Barra por agente no painel de agentes do Claude Code (subagentStatusLine, 0.7.0):
//   dev-powerbi · ███████░░░░░ 58% · 4/7 · lote final · 38 min · fim 14h10–14h50
// Entrada (stdin): { cwd, columns, tasks: [{ id, agentType, status, description, startTime, cwd }] }. Saída: uma linha
// JSON { id, content } por agente em andamento. Progresso pelo código do pedido ([cod:xxxx] na descrição), previsão
// pela faixa registrada ou pelas execuções parecidas (hooks/registro.js, a mesma conta do mapa ao vivo).
// Nunca falha: em qualquer erro, não escreve nada e o Claude Code mostra a linha padrão.
// --instalar (início de sessão): grava ~/.claude/agentes-ultimate/barra.js, o lançador fixo que o settings.json do
// plugin chama, apontando para esta versão (a pasta do plugin muda a cada versão).
'use strict';
const fs = require('fs');
const path = require('path');
const R = require('./registro');

function instalar() {
  const destino = path.join(R.pastaGlobal(), 'barra.js');
  const texto = '// Lançador da barra dos agentes: gerado pelo agentes-ultimate a cada início de sessão. Não edite.\n' +
    `try { require(${JSON.stringify(__filename)}); } catch (e) { process.exit(0); }\n`;
  let atual = '';
  try { atual = fs.readFileSync(destino, 'utf8'); } catch (e) { /* ainda não existe */ }
  if (atual !== texto) { fs.mkdirSync(path.dirname(destino), { recursive: true }); fs.writeFileSync(destino, texto); }
}

const cheia = (frac, n) => { const c = Math.round(Math.max(0, Math.min(1, frac)) * n); return '█'.repeat(c) + '░'.repeat(n - c); };

function linhas(d) {
  const agora = Date.now();
  const largura = Math.max(20, Number(d.columns) || 100);
  let resumo; // lido uma vez, só se algum agente precisar do histórico
  const out = [];
  for (const t of d.tasks || []) {
    if (!t || !t.id || (t.status && t.status !== 'running')) continue;
    const agente = R.agenteCurto(t.agentType || t.name || 'agente');
    const cwd = t.cwd || d.cwd || process.cwd();
    const cod = R.codDe(t.description, t.label);
    const inicio = Number(t.startTime) || agora;
    if (resumo === undefined && !R.estimativaPara(cwd, agente, cod, inicio)) resumo = R.resumoExecucoes();
    const p = R.previsao(cwd, { agente, cod, inicio, descricao: t.description, agora, resumo: resumo || null });
    let fim;
    if (!p.ate) fim = 'sem previsão';
    else if (p.passou != null) fim = `passou da previsão (${R.hhmm(p.ate)}) · +${p.passou} min`;
    else fim = `fim ${p.de ? R.hhmm(p.de) + '–' : 'até '}${R.hhmm(p.ate)}`;
    const corpo = [
      agente,
      p.frac == null ? '' : `${cheia(p.frac, 12)} ${String(Math.round(p.frac * 100)).padStart(2)}%`,
      p.prog ? `${p.prog.feito}/${p.prog.total}${p.prog.agora ? ' · ' + p.prog.agora : ''}` : '',
      `${p.decorridoMin} min`,
      fim,
    ].filter(Boolean).join(' · ');
    out.push({ id: t.id, content: [...corpo].slice(0, largura).join('') });
  }
  return out;
}

if (process.argv.includes('--instalar')) {
  try { instalar(); } catch (e) { /* sem pasta do usuário: a barra padrão continua */ }
  process.exit(0);
}
let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  try { for (const l of linhas(JSON.parse(entrada || '{}'))) process.stdout.write(JSON.stringify(l) + '\n'); } catch (e) { /* linha padrão */ }
  process.exit(0);
});
