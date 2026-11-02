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

// ---- Leitura do comando: o que ele vai preparar e onde. O gancho roda ANTES do comando, então o "git add" da mesma linha
// e o "cd" ainda não aconteceram. O que não dá para calcular (variável na pasta ou no caminho) vira pergunta. ----
const semHeredoc = (c) => c.replace(/<<-?\s*['"]?(\w+)['"]?[^\n]*\n[\s\S]*?\n\s*\1[ \t]*(?=\n|$)/g, '').replace(/@(['"])\r?\n[\s\S]*?\r?\n\1@/g, '""');

// Comandos e palavras, respeitando aspas. Quebra em && || ; | & nova linha, parênteses e chaves fora de aspas.
function segmentos(cmd) {
  const segs = []; let atual = []; let tok = ''; let tem = false; let aspa = null;
  const fechaTok = () => { if (tem) atual.push(tok); tok = ''; tem = false; };
  const fechaSeg = () => { fechaTok(); if (atual.length) segs.push(atual); atual = []; };
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (aspa) {
      if (c === aspa) aspa = null;
      else if (c === '\\' && aspa === '"' && /["\\$`]/.test(cmd[i + 1] || '')) tok += cmd[++i];
      else tok += c;
      continue;
    }
    if (c === '"' || c === "'") { aspa = c; tem = true; continue; }
    if (/\s/.test(c) && c !== '\n') { fechaTok(); continue; }
    if ('\n;&|(){}'.includes(c)) { fechaSeg(); continue; }
    tok += c; tem = true;
  }
  fechaSeg();
  return segs;
}
const variavel = (s) => /[$`%]/.test(s) || /^~[^/\\]/.test(s);
const nomeProg = (t) => path.basename(String(t).replace(/\\/g, '/')).toLowerCase().replace(/\.exe$/, '');
function resolver(base, alvo) {
  let a = String(alvo).replace(/^~(?=[/\\]|$)/, process.env.HOME || process.env.USERPROFILE || '~');
  if (process.platform === 'win32') a = a.replace(/^\/([a-zA-Z])(?=\/|$)/, '$1:');
  return path.resolve(base, a);
}
// Opções do commit que levam valor no argumento seguinte (o texto da mensagem nunca é lido como opção).
const COMMIT_COM_VALOR = new Set(['--message', '--file', '--author', '--date', '--reuse-message', '--reedit-message', '--fixup', '--squash', '--template', '--cleanup', '--trailer']);
function lerCommit(args) {
  const r = { todos: false, incluir: false, caminhos: [], incerto: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') { r.caminhos.push(...args.slice(i + 1)); break; }
    if (a.startsWith('--')) {
      const nome = a.split('=')[0];
      if (nome === '--all') r.todos = true;
      else if (nome === '--include') r.incluir = true;
      else if (nome === '--pathspec-from-file') r.incerto = true;
      else if (COMMIT_COM_VALOR.has(nome) && !a.includes('=')) i++;
      continue;
    }
    if (a.startsWith('-') && a.length > 1) {
      for (let k = 1; k < a.length; k++) {
        const c = a[k];
        if (c === 'a') r.todos = true;
        else if (c === 'i') r.incluir = true;
        else if ('mFCctS'.includes(c)) { if (k === a.length - 1 && c !== 'S') i++; break; }
      }
      continue;
    }
    r.caminhos.push(a);
  }
  if (r.caminhos.some(variavel)) r.incerto = true;
  return r;
}
// Plano do comando: cada commit com a pasta dele e o que o comando prepara antes dele naquela pasta.
function planejar(cmd, cwd, plano = { commits: [], incerto: null }, estado = { cwd, adds: [] }) {
  for (const seg of segmentos(semHeredoc(cmd))) {
    const prog = nomeProg(seg[0]);
    if (['bash', 'sh', 'zsh', 'powershell', 'pwsh', 'cmd'].includes(prog)) {
      const i = seg.findIndex((t, n) => n > 0 && /^(-c|-lc|-command|\/c|\/k)$/i.test(t));
      if (i > 0 && seg.slice(i + 1).length) planejar(seg.slice(i + 1).join(' '), estado.cwd, plano, estado);
      continue;
    }
    if (['cd', 'chdir', 'set-location', 'sl', 'pushd'].includes(prog)) {
      const alvo = seg.slice(1).filter((t) => !/^(\/d|-path|-literalpath)$/i.test(t))[0];
      if (alvo) { if (variavel(alvo)) estado.incerto = `pasta em variável (${alvo})`; else estado.cwd = resolver(estado.cwd, alvo); }
      continue;
    }
    if (prog !== 'git') continue;
    let i = 1; let pasta = estado.cwd; let incerto = estado.incerto || null;
    while (i < seg.length && seg[i].startsWith('-')) {
      const o = seg[i];
      if (o === '-C') { const a = seg[i + 1] || ''; if (variavel(a)) incerto = `pasta em variável (${a})`; else pasta = resolver(pasta, a); i += 2; continue; }
      if (o === '-c') { i += 2; continue; }
      if (/^--(git-dir|work-tree)/.test(o)) { incerto = `opção ${o.split('=')[0]}`; i += o.includes('=') ? 1 : 2; continue; }
      i++;
    }
    const sub = seg[i]; const args = seg.slice(i + 1);
    if (sub === 'add' || sub === 'stage') {
      const add = { cwd: pasta, tudo: false, soRastreados: false, forcado: false, caminhos: [] };
      let fim = false;
      for (const a of args) {
        if (fim || !a.startsWith('-')) { add.caminhos.push(a); continue; }
        if (a === '--') fim = true;
        else if (a === '-A' || a === '--all') add.tudo = true;
        else if (a === '-u' || a === '--update') { add.tudo = true; add.soRastreados = true; }
        else if (a === '-f' || a === '--force') add.forcado = true;
        else if (a === '-p' || a === '--patch' || a === '-i' || a === '--interactive' || a.startsWith('--pathspec-from-file')) incerto = incerto || `git add ${a}`;
      }
      if (add.caminhos.some(variavel)) incerto = incerto || 'caminho em variável no git add';
      if (incerto) plano.incerto = plano.incerto || incerto;
      estado.adds.push(add);
    } else if (sub === 'commit') {
      const c = lerCommit(args);
      if (c.incerto) incerto = incerto || 'caminho em variável no git commit';
      if (incerto) plano.incerto = plano.incerto || incerto;
      plano.commits.push({ cwd: pasta, ...c, adds: estado.adds.filter((a) => a.cwd === pasta) });
    }
  }
  return plano;
}

// O que o commit levaria: nomes e linhas acrescentadas. Um arquivo novo que o "git add" do comando levaria entra inteiro.
function conteudoDoCommit(c) {
  const opc = { cwd: c.cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true };
  const roda = (a) => { try { return execSync(a, { ...opc, windowsHide: true }); } catch (e) { return ''; } };
  const aspas = (l) => l.map((s) => JSON.stringify(s)).join(' ');
  let diff = ''; let nomes = [];
  const lista = (t) => t.split('\n').map((s) => s.trim()).filter(Boolean);
  if (c.caminhos.length && !c.incluir) {
    const ps = ' -- ' + aspas(c.caminhos);
    diff = roda('git diff --cached -U0 --no-color --no-ext-diff' + ps) + '\n' + roda('git diff -U0 --no-color --no-ext-diff' + ps);
    nomes = lista(roda('git diff --cached --name-only' + ps) + '\n' + roda('git diff --name-only' + ps));
  } else {
    diff = roda('git diff --cached -U0 --no-color --no-ext-diff');
    nomes = lista(roda('git diff --cached --name-only'));
    if (c.todos) { diff += '\n' + roda('git diff -U0 --no-color --no-ext-diff'); nomes.push(...lista(roda('git diff --name-only'))); }
    if (c.incluir && c.caminhos.length) { const ps = ' -- ' + aspas(c.caminhos); diff += '\n' + roda('git diff -U0 --no-color --no-ext-diff' + ps); nomes.push(...lista(roda('git diff --name-only' + ps))); }
  }
  const novos = [];
  for (const a of c.adds) {
    const ps = a.tudo && !a.caminhos.length ? '' : ' -- ' + aspas(a.caminhos);
    diff += '\n' + roda('git diff -U0 --no-color --no-ext-diff' + ps);
    nomes.push(...lista(roda('git diff --name-only' + ps)));
    if (!a.soRastreados) novos.push(...lista(roda('git ls-files --others --exclude-standard' + ps)));
    if (a.forcado) novos.push(...a.caminhos);
  }
  const linhas = acrescentadas(diff);
  for (const f of [...new Set(novos)]) {
    nomes.push(f);
    try {
      const b = fs.readFileSync(path.resolve(c.cwd, f));
      if (b.subarray(0, 8000).includes(0)) continue;
      b.toString('utf8').split('\n').forEach((texto, n) => linhas.push({ arq: f, linha: n + 1, texto }));
    } catch (e) { /* pasta ou arquivo que sumiu */ }
  }
  return { nomes: [...new Set(nomes)], linhas };
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
    if (/\bgit(?:\.exe)?["']?\s+(-\S+\s+(\S+\s+)?)*push\b/.test(cmd) || /\bnpm\s+publish\b/.test(cmd) || /\b(vercel|netlify)\b.*--prod\b/.test(cmd)) {
      perguntar('agentes-ultimate: publicar é visível a outros. Confirme que quer enviar agora. Se for um lançamento ou abrir para mais gente, rodou o /checklist-lancamento?');
    }
    const plano = planejar(cmd, cwd);
    const paraPerguntar = [];
    for (const c of plano.commits) {
      const { nomes, linhas } = conteudoDoCommit(c);
      const regras = FIXOS.concat(padroesDoProjeto(c.cwd));
      const ruins = nomes.filter((f) => regras.some((r) => r.test(f)));
      if (ruins.length) {
        bloquear(`agentes-ultimate: o commit levaria arquivo sensível para o git:\n  ${ruins.join('\n  ')}\nTire do commit (\`git restore --staged <arquivo>\`, se já preparado) e ponha o padrão no .gitignore.`);
      }
      const altos = achar(linhas, ALTOS);
      if (altos.length) {
        bloquear(`agentes-ultimate: o commit levaria um segredo para o git (o valor não é mostrado):\n  ${altos.join('\n  ')}\n` +
          'Tire o valor do arquivo (leia de uma variável de ambiente e cite pelo nome), prepare de novo com git add e, se ele já ' +
          'saiu desta máquina, troque-o: crie o novo, ponha no ar, revogue o antigo e prove que o antigo falha. É exemplo? ' +
          'Troque o valor por um marcador como <senha> ou ${VARIAVEL}.');
      }
      const medios = achar(linhas, MEDIOS);
      if (medios.length) paraPerguntar.push(`o commit parece levar um segredo (média certeza; o valor não é mostrado):\n  ${medios.join('\n  ')}\nConfirme só se for valor de exemplo ou de teste.`);
    }
    if (plano.incerto && plano.commits.length) paraPerguntar.push(`não dá para saber o que este commit leva (${plano.incerto}). Confira que não vai segredo nem arquivo sensível.`);
    if (paraPerguntar.length) perguntar('agentes-ultimate: ' + paraPerguntar.join('\n'));
  } catch (e) { /* trava nunca quebra o trabalho */ }
  process.exit(0);
});
