#!/usr/bin/env node
// Travas (PreToolUse em Bash/PowerShell). Regras que viram código em vez de lembrete:
//   - publicar (git push, npm publish, deploy de produção) → pede confirmação ao usuário;
//   - commit com arquivo sensível já preparado (padrões em .claude/base/sensiveis.txt + padrões fixos) → bloqueia;
//   - heredoc gravando script com barra invertida → bloqueia (estraga o arquivo no Windows/Git Bash).
// Saída 2 + stderr = bloqueio com o motivo. Em qualquer erro interno, não bloqueia.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FIXOS = [/(^|\/)\.env(\..*)?$/i, /\.(pem|key|pfx|p12)$/i, /(^|\/)(id_rsa|id_ed25519)$/, /credenciais|credentials|secrets?\./i];

function padroesDoProjeto(cwd) {
  try {
    return fs.readFileSync(path.join(cwd, '.claude', 'base', 'sensiveis.txt'), 'utf8')
      .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
      .map((g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*') + '$', 'i'));
  } catch (e) { return []; }
}

const bloquear = (msg) => { process.stderr.write(msg + '\n'); process.exit(2); };
const perguntar = (motivo) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: motivo } }));
  process.exit(0);
};

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  let d;
  try { d = JSON.parse(entrada || '{}'); } catch (e) { process.exit(0); }
  try {
    const cmd = String((d.tool_input || {}).command || '');
    const cwd = d.cwd || process.cwd();
    if (/<<-?\s*['"]?\w+['"]?/.test(cmd) && />>?\s*["']?[^\s"'|;&]+\.(js|cjs|mjs|ps1|py|sh)\b/.test(cmd) && cmd.includes('\\')) {
      bloquear('agentes-ultimate: script com barra invertida não se grava por heredoc (o arquivo sai estragado). Use a ferramenta de escrita de arquivo e rode com o interpretador.');
    }
    if (/\bgit\s+(-\S+\s+(\S+\s+)?)*push\b/.test(cmd) || /\bnpm\s+publish\b/.test(cmd) || /\b(vercel|netlify)\b.*--prod\b/.test(cmd)) {
      perguntar('agentes-ultimate: publicar é visível a outros. Confirme que quer enviar agora.');
    }
    if (/\bgit\s+(-\S+\s+(\S+\s+)?)*commit\b/.test(cmd)) {
      let prep = '';
      try { prep = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8' }); } catch (e) { prep = ''; }
      const regras = FIXOS.concat(padroesDoProjeto(cwd));
      const ruins = prep.split('\n').map((s) => s.trim()).filter(Boolean).filter((f) => regras.some((r) => r.test(f)));
      if (ruins.length) {
        bloquear(`agentes-ultimate: o commit levaria arquivo sensível para o git:\n  ${ruins.join('\n  ')}\nTire com \`git restore --staged <arquivo>\` e ponha o padrão no .gitignore.`);
      }
    }
  } catch (e) { /* trava nunca quebra o trabalho */ }
  process.exit(0);
});
