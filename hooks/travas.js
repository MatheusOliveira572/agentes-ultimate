#!/usr/bin/env node
// Travas (PreToolUse em Bash/PowerShell). Regras que viram código em vez de lembrete:
//   - heredoc gravando script com barra invertida → bloqueia (estraga o arquivo no Windows/Git Bash);
//   - commit em forma que dá para ler com certeza → lê o que ele leva: segredo de alta certeza ou arquivo sensível bloqueia,
//     média certeza pergunta. A forma simples com conteúdo limpo nunca pergunta;
//   - a palavra commit em qualquer outra forma → lê o que já está preparado e pergunta, sem adivinhar;
//   - push → lê os commits que ainda não foram para o remoto (última barreira) e sempre pede confirmação;
//   - leitura em processo filho, com prazo: estourou, pergunta; nunca libera calado.
// Depois do comando, hooks/trava-depois.js lê o commit novo. Esta trava nunca executa texto do comando.
// Saída 2 + stderr = bloqueio com o motivo. A mensagem diz arquivo:linha e o tipo, nunca o valor.
'use strict';
const { lerComando, pastasCitadas } = require('./trava-comando');
const { lerComPrazo } = require('./leitor-segredos');

const PUBLICAR = 'publicar é visível a outros. Confirme que quer enviar agora. Se for um lançamento ou abrir para mais gente, rodou o /checklist-lancamento?';
const curta = (l) => l.join('\n  ');
const bloquear = (msg) => { process.stderr.write(msg + '\n'); process.exit(2); };
const sair = (pede) => {
  if (pede.length) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: 'agentes-ultimate: ' + pede.join('\n') } }));
  process.exit(0);
};

function decidir(d) {
  const cmd = String((d.tool_input || {}).command || '');
  const cwd = d.cwd || process.cwd();
  if (/<<-?\s*['"]?\w+['"]?/.test(cmd) && />>?\s*["']?[^\s"'|;&]+\.(js|cjs|mjs|ps1|py|sh)\b/.test(cmd) && cmd.includes('\\')) {
    bloquear('agentes-ultimate: script com barra invertida não se grava por heredoc (o arquivo sai estragado). Use a ferramenta de escrita de arquivo e rode com o interpretador.');
  }
  const pede = [];
  if (/\bnpm\s+publish\b/.test(cmd) || /\b(vercel|netlify)\b.*--prod\b/.test(cmd)) pede.push(PUBLICAR);
  // Aspas e barras no meio da palavra não escondem: com''mit também é commit.
  const plano = cmd.replace(/['"\\`^]/g, '');
  const temCommit = /\bcommit\b/i.test(plano);
  const temPush = /\bpush\b/i.test(plano) && /\bgit\b/i.test(plano);
  if (!temCommit && !temPush) sair(pede);
  const c = lerComando(cmd, cwd, d.tool_name);
  if (c.tipo === 'inofensivo') sair(pede);
  const pedidos = [];
  let publica = false;
  if (c.tipo === 'simples') {
    pedidos.push(...c.commits);
    for (const p of c.pushes) { publica = true; pedidos.push({ tipo: 'naoEnviados', cwd: p }); }
  } else {
    pedidos.push({ tipo: 'preparado', cwd });
    if (temPush) { publica = true; for (const p of [...new Set([...pastasCitadas(cmd, cwd), ...(c.pushes || [])])]) pedidos.push({ tipo: 'naoEnviados', cwd: p }); }
    if (temCommit) pede.push(`este comando pode criar um commit de um jeito que não dá para ler com certeza (${c.motivo}). Confirme só se souber o que ele leva: segredo ou arquivo sensível não pode ir.`);
  }
  if (publica) pede.push(PUBLICAR);
  if (!pedidos.length) sair(pede);
  lerComPrazo(pedidos, 7000, (r, motivo) => {
    if (!r) { pede.push(`não deu para conferir o que vai no git (${motivo}). Confira que não vai segredo, ou faça commits menores.`); sair(pede); }
    if (r.altos.length) {
      bloquear(`agentes-ultimate: o git levaria um segredo (o valor não é mostrado):\n  ${curta(r.altos)}\n` +
        'Tire o valor do arquivo (leia de uma variável de ambiente e cite pelo nome), prepare de novo com git add. Se já está em um commit, desfaça o commit antes de publicar. ' +
        'Se ele já saiu desta máquina, troque-o: crie o novo, ponha no ar, revogue o antigo e prove que o antigo falha. É exemplo? Troque o valor por um marcador como <senha> ou ${VARIAVEL}.');
    }
    const soPush = pedidos.every((p) => p.tipo === 'naoEnviados');
    if (r.ruins.length && !soPush) {
      bloquear(`agentes-ultimate: o commit levaria arquivo sensível para o git:\n  ${curta(r.ruins)}\nTire do commit (\`git restore --staged <arquivo>\`, se já preparado) e ponha o padrão no .gitignore.`);
    }
    if (r.ruins.length) pede.push(`os commits que vão sair têm arquivo de nome sensível:\n  ${curta(r.ruins)}`);
    if (r.medios.length) pede.push(`parece haver um segredo (média certeza; o valor não é mostrado):\n  ${curta(r.medios)}\nConfirme só se for valor de exemplo ou de teste.`);
    if (r.incompleta) pede.push('parte do conteúdo não foi lida: grande demais para conferir no tempo do gancho, ou arquivo que não abriu. Confira que não vai segredo (ou faça commits menores).');
    sair(pede);
  });
}

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  let d;
  try { d = JSON.parse(entrada || '{}'); } catch (e) { process.exit(0); }
  try { decidir(d); } catch (e) {
    // Erro interno em comando de git não libera calado; nos outros a trava não atrapalha.
    if (/\b(commit|push)\b/i.test(String((d.tool_input || {}).command || ''))) sair(['não deu para conferir este comando (erro interno da trava). Confira que não vai segredo.']);
    process.exit(0);
  }
});
