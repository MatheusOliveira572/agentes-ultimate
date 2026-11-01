#!/usr/bin/env node
// Travas (PreToolUse em Bash/PowerShell). Regras que viram código em vez de lembrete:
//   - publicar (git push, npm publish, deploy de produção) → pede confirmação ao usuário e lembra o /checklist-lancamento;
//   - commit com arquivo sensível já preparado (padrões em .claude/base/sensiveis.txt + padrões fixos) → bloqueia;
//   - commit com segredo no conteúdo das linhas acrescentadas: padrão de alta certeza → bloqueia; de média → pergunta.
//     A mensagem diz arquivo:linha e o tipo, nunca o valor;
//   - heredoc gravando script com barra invertida → bloqueia (estraga o arquivo no Windows/Git Bash).
// Saída 2 + stderr = bloqueio com o motivo. Em qualquer erro interno, não bloqueia.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FIXOS = [/(^|\/)\.env(\..*)?$/i, /\.(pem|key|pfx|p12)$/i, /(^|\/)(id_rsa|id_ed25519)$/, /credenciais|credentials|secrets?\./i];

// Segredo no conteúdo. Alta certeza = formato conhecido (prefixo do provedor, cabeçalho seguido do corpo da chave,
// texto de conexão com senha de verdade). Média = parece segredo, mas pode ser exemplo. "g" em `senha` marca o grupo
// que é a senha: marcador como <senha>, ${VAR} ou ... não conta.
const ALTOS = [
  { tipo: 'chave privada (PEM)', re: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----(?:\s|\\n)+[A-Za-z0-9+/=]{40,}/ },
  { tipo: 'chave de acesso da AWS', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { tipo: 'token do GitHub', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/ },
  { tipo: 'chave da Anthropic', re: /\bsk-ant-[A-Za-z0-9_-]{32,}/ },
  { tipo: 'chave da OpenAI', re: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{32,}|\bsk-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}/ },
  { tipo: 'chave de API do Google', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { tipo: 'token do Slack', re: /\bxox[abposr]-[0-9A-Za-z-]{10,}/ },
  { tipo: 'chave secreta do Stripe', re: /\b[rs]k_live_[0-9A-Za-z]{20,}\b/ },
  { tipo: 'token do npm', re: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { tipo: 'chave de conta do Azure Storage', re: /\bAccountKey=[A-Za-z0-9+/]{40,}={0,2}/ },
  { tipo: 'texto de conexão com senha', re: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|rediss?|amqps?|mssql|sqlserver):\/\/[^\s:/@'"]+:([^\s@'"/]+)@[^\s'"]+/i, senha: 1 },
  { tipo: 'texto de conexão com senha', re: /\b(?:Server|Data Source|Host)\s*=[^;\n]+;.*?\b(?:Password|Pwd)\s*=\s*([^;'"\s]+)/i, senha: 1 },
];
const MEDIOS = [
  { tipo: 'senha, chave ou token atribuído no código', re: /\b(?:api[_-]?key|apikey|client[_-]?secret|secret|access[_-]?token|auth[_-]?token|token|senha|password|passwd|pwd)["']?\s*[:=]\s*["']([^"'\s]{12,})["']/i, senha: 1, valor: (v) => /\d/.test(v) && /[A-Za-z]/.test(v) },
  { tipo: 'token JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];
const marcador = (v) => !/[A-Za-z0-9]/.test(v) || /^(\.{2,}|\*+|x{3,}|<[^>]*>|\$\{[^}]*\}|\$\(?\w+\)?|\{\{?[^}]*\}?\}|%[sd]|\[[^\]]*\])$/i.test(v) ||
  /^(senha|password|pass|pwd|secret|changeme|sua[_-]?senha|your[_-]?password|usuario|user)$/i.test(v) || /process\.env|os\.environ|getenv|EXAMPLE|exemplo/i.test(v);

// Linhas acrescentadas do diff (-U0), com arquivo e número da linha no arquivo novo.
function acrescentadas(diff) {
  const out = []; let arq = null; let n = 0;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) { arq = l.slice(4).replace(/^b\//, '').trim(); continue; }
    const h = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (h) { n = Number(h[1]); continue; }
    if (arq && arq !== '/dev/null' && l.startsWith('+')) out.push({ arq, linha: n++, texto: l.slice(1) });
  }
  return out;
}
function achar(linhas, regras) {
  const achados = [];
  const porArq = {};
  for (const x of linhas) (porArq[x.arq] = porArq[x.arq] || []).push(x);
  for (const [arq, ls] of Object.entries(porArq)) {
    const texto = ls.map((x) => x.texto).join('\n');
    for (const r of regras) {
      const re = new RegExp(r.re.source, r.re.flags.includes('g') ? r.re.flags : r.re.flags + 'g');
      let m;
      while ((m = re.exec(texto))) {
        const v = r.senha ? m[r.senha] : m[0];
        if (!marcador(v) && (!r.valor || r.valor(v))) {
          const idx = texto.slice(0, m.index).split('\n').length - 1;
          achados.push(`${arq}:${ls[idx].linha} · ${r.tipo}`);
        }
        if (!m[0].length) re.lastIndex++;
      }
    }
  }
  return [...new Set(achados)];
}

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
      perguntar('agentes-ultimate: publicar é visível a outros. Confirme que quer enviar agora. Se for um lançamento ou abrir para mais gente, rodou o /checklist-lancamento?');
    }
    if (/\bgit\s+(-\S+\s+(\S+\s+)?)*commit\b/.test(cmd)) {
      let prep = '';
      try { prep = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8' }); } catch (e) { prep = ''; }
      const regras = FIXOS.concat(padroesDoProjeto(cwd));
      const ruins = prep.split('\n').map((s) => s.trim()).filter(Boolean).filter((f) => regras.some((r) => r.test(f)));
      if (ruins.length) {
        bloquear(`agentes-ultimate: o commit levaria arquivo sensível para o git:\n  ${ruins.join('\n  ')}\nTire com \`git restore --staged <arquivo>\` e ponha o padrão no .gitignore.`);
      }
      // Conteúdo: o que já está preparado e, com -a/--all, também as mudanças dos arquivos já versionados.
      const opc = { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] };
      let diff = '';
      try { diff = execSync('git diff --cached -U0 --no-color --no-ext-diff', opc); } catch (e) { diff = ''; }
      if (/\bcommit\b[^|;&]*\s(?:-[a-zA-Z]*a[a-zA-Z]*|--all)\b/.test(cmd)) {
        try { diff += '\n' + execSync('git diff -U0 --no-color --no-ext-diff', opc); } catch (e) { /* sem diff */ }
      }
      const linhas = acrescentadas(diff);
      const altos = achar(linhas, ALTOS);
      if (altos.length) {
        bloquear(`agentes-ultimate: o commit levaria um segredo para o git (o valor não é mostrado):\n  ${altos.join('\n  ')}\n` +
          'Tire o valor do arquivo (leia de uma variável de ambiente e cite pelo nome), prepare de novo com git add e, se ele já ' +
          'saiu desta máquina, troque-o: crie o novo, ponha no ar, revogue o antigo e prove que o antigo falha. É exemplo? ' +
          'Troque o valor por um marcador como <senha> ou ${VARIAVEL}.');
      }
      const medios = achar(linhas, MEDIOS);
      if (medios.length) {
        perguntar(`agentes-ultimate: o commit parece levar um segredo (média certeza; o valor não é mostrado):\n  ${medios.join('\n  ')}\n` +
          'Confirme só se for valor de exemplo ou de teste.');
      }
    }
  } catch (e) { /* trava nunca quebra o trabalho */ }
  process.exit(0);
});
