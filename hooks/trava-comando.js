// Leitura do comando pela trava. Não tenta prever o que um comando vai fazer: reconhece uma lista curta de formas lidas com
// certeza; o resto é "incerto", e a trava pergunta. Só lê texto; nada daqui executa o comando.
//   inofensivo: só leitura (git log, grep, echo...), não cria commit nem publica, ainda que cite as palavras.
//   simples:    cd literal; git add; git commit; git push; leitura; saída redirecionada; "| tail".
//   incerto:    todo o resto (eval, alias, xargs, $(...), VAR=x, script, outra pasta...).
'use strict';
const fs = require('fs');
const path = require('path');

const COM_VALOR = new Set(['--message', '--file', '--author', '--date']);
const SEM_VALOR = new Set(['--all', '--include', '--only', '--quiet', '--signoff', '--verbose', '--no-verify', '--amend', '--no-edit', '--allow-empty', '--allow-empty-message', '--no-gpg-sign']);
const GIT_LEITURA = new Set(['status', 'log', 'show', 'diff', 'rev-parse', 'ls-files', 'blame', 'shortlog', 'rev-list', 'describe', 'merge-base', 'cat-file']);
const LEITURA = new Set(['echo', 'printf', 'cat', 'head', 'tail', 'wc', 'grep', 'ls', 'pwd', 'sort', 'uniq', 'cut', 'true', 'dir', 'type', 'get-content', 'select-string', 'select-object', 'where-object', 'write-output', 'write-host']);
const nomeProg = (t) => path.basename(String(t).replace(/\\/g, '/')).toLowerCase().replace(/\.exe$/, '');

// As 2 formas de mensagem de várias linhas, com texto que o shell não expande, e o "se deu certo" do PowerShell 5.1.
function normalizar(cmd) {
  return cmd
    .replace(/"\$\(cat <<-?\s*'(\w+)'\r?\n[\s\S]*?\r?\n\s*\1[ \t]*\r?\n\s*\)"/g, "'msg'")
    .replace(/(-F\s+-\s+)<<-?\s*'(\w+)'\r?\n[\s\S]*?\r?\n\s*\2[ \t]*(?=\r?\n|$)/g, '$1')
    .replace(/@'\r?\n[\s\S]*?\r?\n'@/g, "'msg'")
    .replace(/;\s*if\s*\(\$\?\)\s*\{([^{}]*)\}/g, ' && $1');
}

// Palavras e operadores, respeitando aspas. Qualquer coisa que o shell interpretaria e não está aqui: devolve o motivo.
function tokens(cmd, ps) {
  const toks = []; let w = ''; let tem = false; let alvo = false;
  const fecha = () => { if (tem) { if (alvo) alvo = false; else toks.push({ w }); } w = ''; tem = false; };
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (c === "'") {
      const f = cmd.indexOf("'", i + 1);
      if (f < 0) return { motivo: 'aspas sem fechar' };
      w += cmd.slice(i + 1, f); tem = true; i = f; continue;
    }
    if (c === '"') {
      let f = i + 1; tem = true;
      for (; f < cmd.length && cmd[f] !== '"'; f++) {
        const d = cmd[f];
        if (d === '`' || (d === '$' && /[\w({?!@#*-]/.test(cmd[f + 1] || ''))) return { motivo: 'expansão dentro de aspas' };
        if (d === '\\' && /["\\$`]/.test(cmd[f + 1] || '')) {
          if (ps) return { motivo: 'barra invertida dentro de aspas, no PowerShell' };
          w += cmd[++f]; continue;
        }
        w += d;
      }
      if (f >= cmd.length) return { motivo: 'aspas sem fechar' };
      i = f; continue;
    }
    if (c === ' ' || c === '\t' || c === '\r') { fecha(); continue; }
    if (c === '\n' || c === ';') { fecha(); toks.push({ op: ';' }); continue; }
    if (c === '&' && cmd[i + 1] === '&') { fecha(); toks.push({ op: '&&' }); i++; continue; }
    if (c === '|' && cmd[i + 1] === '|') return { motivo: 'operador ||' };
    if (c === '|' && cmd[i + 1] === '&') return { motivo: 'operador |&' };
    if (c === '|') { fecha(); toks.push({ op: '|' }); continue; }
    if (c === '>' || (c === '&' && cmd[i + 1] === '>')) {
      if (c === '&') i++;
      if (/^(\d|\*)$/.test(w)) { w = ''; tem = false; } else fecha();
      while (cmd[i + 1] === '>') i++;
      while (cmd[i + 1] === ' ') i++;
      if (cmd[i + 1] === '&' && /\d/.test(cmd[i + 2] || '')) { i += 2; continue; }
      if (cmd.startsWith('$null', i + 1)) { i += 5; continue; }
      alvo = true; continue;
    }
    if ('&$`\\(){}<!'.includes(c) || (!tem && '#~@'.includes(c))) return { motivo: `"${c}" fora de aspas` };
    w += c; tem = true;
  }
  fecha();
  if (alvo) return { motivo: 'redirecionamento sem destino' };
  return { toks };
}

// Flags do commit: só as da lista. Opção fora dela (--fixup, -C, --pathspec-from-file...) deixa a forma incerta.
function lerCommit(args) {
  const r = { todos: false, incluir: false, caminhos: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') { r.caminhos.push(...args.slice(i + 1)); break; }
    if (a.startsWith('--')) {
      const nome = a.split('=')[0];
      if (COM_VALOR.has(nome)) { if (!a.includes('=')) i++; continue; }
      if (!SEM_VALOR.has(nome)) return { motivo: `git commit ${nome}` };
      if (nome === '--all') r.todos = true;
      if (nome === '--include') r.incluir = true;
      continue;
    }
    if (a.startsWith('-') && a.length > 1) {
      for (let k = 1; k < a.length; k++) {
        const c = a[k];
        if (c === 'a') r.todos = true;
        else if (c === 'i') r.incluir = true;
        else if (c === 'm' || c === 'F') { if (k === a.length - 1) i++; break; }
        else if (!'qsvno'.includes(c)) return { motivo: `git commit -${c}` };
      }
      continue;
    }
    r.caminhos.push(a);
  }
  return r;
}
function lerAdd(args, cwd) {
  const r = { cwd, soRastreados: false, caminhos: [] };
  let fim = false;
  for (const a of args) {
    if (fim || !a.startsWith('-')) { r.caminhos.push(a); continue; }
    if (a === '--') fim = true;
    else if (a === '-u' || a === '--update') r.soRastreados = true;
    else if (!['-A', '--all', '-v', '--verbose'].includes(a)) return { motivo: `git add ${a}` };
  }
  return r;
}
function resolver(base, alvo) {
  let a = String(alvo);
  if (process.platform === 'win32') a = a.replace(/^\/([a-zA-Z])(?=\/|$)/, '$1:');
  return path.resolve(base, a);
}
// Só a pasta da sessão e as subpastas do mesmo repositório: rodar git em outra pasta usaria a configuração dela.
function naSessao(pasta, sessao) {
  const rel = path.relative(sessao, pasta);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return false;
  if (!fs.existsSync(pasta)) return false;
  for (let d = pasta; d.length > sessao.length; d = path.dirname(d)) if (fs.existsSync(path.join(d, '.git'))) return false;
  return true;
}

function lerComando(cmd, sessao, ferramenta) {
  const incerto = (motivo) => ({ tipo: 'incerto', motivo });
  const t = tokens(normalizar(cmd), ferramenta === 'PowerShell');
  if (t.motivo) return incerto(t.motivo);
  const canos = [[[]]];
  for (const x of t.toks) {
    const cano = canos[canos.length - 1];
    if (x.op === '|') cano.push([]);
    else if (x.op) canos.push([[]]);
    else cano[cano.length - 1].push(x.w);
  }
  let pasta = sessao; const adds = []; const commits = []; const pushes = []; let soLeitura = true; let foraDaSessao = false;
  for (const cano of canos) {
    for (const seg of cano.slice(1)) if (!seg.length || !LEITURA.has(nomeProg(seg[0]))) return incerto(`saída passada para ${seg[0] || 'nada'}`);
    const seg = cano[0];
    if (!seg.length) continue;
    const prog = nomeProg(seg[0]);
    if (LEITURA.has(prog)) continue;
    if (['cd', 'chdir', 'set-location', 'sl', 'pushd', 'push-location'].includes(prog)) {
      const alvos = seg.slice(1).filter((a) => !/^(\/d|-path|-literalpath)$/i.test(a));
      if (alvos.length !== 1) return incerto('cd sem uma pasta só');
      pasta = resolver(pasta, alvos[0]); soLeitura = false;
      continue;
    }
    if (prog !== 'git') return incerto(`comando ${seg[0]}`);
    let i = 1; let local = pasta;
    if (seg[i] === '-C' && seg[i + 1]) { local = resolver(pasta, seg[i + 1]); i += 2; }
    while (seg[i] === '--no-pager') i++;
    const sub = seg[i]; const args = seg.slice(i + 1);
    if (GIT_LEITURA.has(sub)) continue;
    if (sub === 'stash' && args[0] === 'push') continue;
    soLeitura = false;
    if (sub === 'push') { pushes.push(local); continue; }
    if (sub === 'add' || sub === 'stage') {
      const a = lerAdd(args, local);
      if (a.motivo) return incerto(a.motivo);
      adds.push(a);
    } else if (sub === 'commit') {
      const c = lerCommit(args);
      if (c.motivo) return incerto(c.motivo);
      if (!naSessao(local, sessao)) foraDaSessao = true;
      if (adds.some((a) => a.cwd !== local)) return incerto('git add em outra pasta');
      commits.push({ tipo: 'commit', cwd: local, todos: c.todos, incluir: c.incluir, caminhos: c.caminhos, adds: adds.slice() });
    } else return incerto(`git ${sub}`);
  }
  if (foraDaSessao) return { ...incerto('commit em outra pasta'), pushes };
  if (soLeitura) return { tipo: 'inofensivo' };
  return { tipo: 'simples', commits, pushes };
}

// Pastas citadas de forma literal: para o depois do comando e para a barreira do push.
function pastasCitadas(cmd, sessao) {
  const out = new Set([sessao]);
  for (const m of String(cmd).matchAll(/(?:\bcd|\bpushd|\bSet-Location|\bPush-Location|\s-C)\s+("[^"$`]+"|'[^']+'|[^\s;&|"'$`]+)/gi)) {
    try { const p = resolver(sessao, m[1].replace(/^["']|["']$/g, '')); if (fs.statSync(p).isDirectory()) out.add(p); } catch (e) { /* não existe */ }
  }
  return [...out];
}
module.exports = { lerComando, pastasCitadas };
