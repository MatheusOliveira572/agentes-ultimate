#!/usr/bin/env node
// Tabela de formas de commit, rodada de verdade: cada comando passa pela trava e, se ela deixar (ou perguntar, como se o usuário
// aceitasse), roda num shell real. Vale: segredo no commit só depois de uma pergunta (ou em limite declarado); segredo no commit
// sempre avisa depois do comando e sempre barra no push. Forma simples sem segredo nunca pergunta. As 43 formas vêm da 2ª rodada
// da revisão da parte A; os segredos são montados por partes. Uso: node scripts/testar-travas-formas.js [pasta de outra versão].
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

function achaBash() {
  if (process.platform !== 'win32') return 'bash';
  try {
    const raiz = execSync('git --exec-path', { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().replace(/\/(mingw64|mingw32|usr)\/.*$/, '');
    const b = path.join(raiz, 'bin', 'bash.exe');
    if (fs.existsSync(b)) return b;
  } catch (e) { /* sem git */ }
  return null;
}

function rodarTabela(RAIZ) {
  const BASH = achaBash();
  const AWS = 'AK' + 'IAZ7QK3LMN4PRS5TUV';
  const COM = `aws_id = "${AWS}"\n`;
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'trava-formas-'));
  let n = 0;
  const git = (c, cwd) => execSync(c, { cwd, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', windowsHide: true });
  const repo = (nomePasta) => {
    const p = path.join(base, nomePasta || ('r' + (++n)));
    fs.mkdirSync(p, { recursive: true });
    git('git init -q', p); git('git config user.email t@t', p); git('git config user.name t', p); git('git config core.autocrlf false', p);
    fs.writeFileSync(path.join(p, 'a.js'), 'base\n'); fs.writeFileSync(path.join(p, 'limpo.js'), 'base\n');
    fs.mkdirSync(path.join(p, 'sub')); fs.writeFileSync(path.join(p, 'sub', 'k.js'), 'base\n');
    git('git add -A', p); git('git commit -q -m base', p);
    return p;
  };
  const fora = path.join(base, 'fora'); fs.mkdirSync(fora);
  const posix = (p) => p.replace(/\\/g, '/');
  const novo = (p) => fs.writeFileSync(path.join(p, 'novo.js'), COM);
  const muda = (p) => fs.writeFileSync(path.join(p, 'a.js'), 'base\n' + COM);
  const prep = (p) => { muda(p); git('git add a.js', p); };
  const subnovo = (p) => fs.writeFileSync(path.join(p, 'sub', 'novo.js'), COM);
  const acento = (p) => fs.writeFileSync(path.join(p, 'configuração.js'), COM);
  const pastaAcento = (p) => { fs.mkdirSync(path.join(p, 'área')); fs.writeFileSync(path.join(p, 'área', 'novo.js'), COM); };
  const envAcento = (p) => { fs.mkdirSync(path.join(p, 'área')); fs.writeFileSync(path.join(p, 'área', '.env'), 'X=1\n'); };
  const ignorada = (p) => { fs.writeFileSync(path.join(p, '.gitignore'), 'build/\n'); git('git add .gitignore', p); git('git commit -q -m i', p); fs.mkdirSync(path.join(p, 'build')); fs.writeFileSync(path.join(p, 'build', 'novo.js'), COM); };
  const aliasAntigo = (p) => { muda(p); git('git config alias.ci commit', p); };
  const script = (p) => { muda(p); fs.writeFileSync(path.join(p, 'salvar.sh'), 'git add a.js\ngit com' + 'mit -m x\n'); };

  // [nome, comando, preparo, 'fora', shell, pasta, esperado]. esperado: 'barra' (padrão), 'passa' (controle), 'limite' (sem a palavra commit).
  const casos = [
    ['A1 add novo && commit', 'git add novo.js && git commit -m x', novo],
    ['A1 add -A; commit', 'git add -A; git commit -m x', novo],
    ['A1 cd repo && commit (de fora)', 'cd "<R>" && git commit -m x', prep, 'fora'],
    ['A1 git -C commit (de fora)', 'git -C "<R>" commit -m x', prep, 'fora'],
    ['A1 commit caminho', 'git commit a.js -m x', muda],
    ['A1 commit -- caminho', 'git commit -m x -- a.js', muda],
    ['A1 --include', 'git commit --include a.js -m x', muda],
    ['A1 git.exe -am', 'git.exe commit -am x', muda],
    ['F1 commit 2>&1 (preparado)', 'git commit -m x 2>&1', prep],
    ['F1 add -A 2>&1 && commit 2>&1', 'git add -A 2>&1 && git commit -m x 2>&1', novo],
    ['F1 commit 2>/dev/null', 'git commit -m x 2>/dev/null', prep],
    ['F1 commit > log', 'git commit -m x > log.txt', prep],
    ['F1 add -A > /dev/null && commit', 'git add -A > /dev/null && git commit -m x', novo],
    ['F1 commit 2>&1 | tail -3', 'git commit -m x 2>&1 | tail -3', prep],
    ['F1 commit | tail', 'git commit -m x | tail -3', prep],
    ['F2 acento: add -A && commit', 'git add -A && git commit -m x', acento],
    ['F2 acento: add nome && commit', 'git add configuração.js && git commit -m x', acento],
    ['F2 pasta acento: add -A && commit', 'git add -A && git commit -m x', pastaAcento],
    ['F2 .env em pasta com acento (add -A)', 'git add -A && git commit -m x', envAcento],
    ['F3 VAR=x git commit', 'GIT_AUTHOR_NAME=x git commit -m x', prep],
    ['F3 env git commit', 'env git commit -m x', prep],
    ['F3 command git commit', 'command git commit -m x', prep],
    ['F3 if git commit', 'if git commit -m x; then echo ok; fi', prep],
    ['F3 add && if..then commit', 'git add -A && if true; then git commit -m x; fi', novo],
    ['F3 timeout 60 git commit', 'timeout 60 git commit -m x', prep],
    ['F3 ! git commit', '! git commit -m x', prep],
    ['F4 git -C sub add . && commit', 'git -C sub add . && git commit -m x', subnovo],
    ['F4 cd sub, add, cd .., commit', 'cd sub && git add . && cd .. && git commit -m x', subnovo],
    ['F4 add na raiz, cd sub, commit', 'git add -A && cd sub && git commit -m x', novo],
    ['F5 Push-Location', 'Push-Location "<R>"; git commit -m x', prep, 'fora', 'ps'],
    ['F5 cd com espaço escapado', 'cd <RESC> && git commit -m x', prep, 'fora', 'bash', 'pasta com espaco'],
    ['F5 cd com aspas e espaço', 'cd "<R>" && git commit -m x', prep, 'fora', 'bash', 'pasta com espaco 2'],
    ['F5 cd pasta que não existe', 'cd /nao/existe/mesmo; git -C "<R>" commit -m x', prep, 'fora'],
    ['F6 xargs git add', 'echo novo.js | xargs git add && git commit -m x', novo],
    ['F6 alias -c', 'git -c alias.k=commit k -a -m x', muda],
    ['F6 alias config', 'git config alias.ci commit && git ci -am x', muda],
    ['F6 eval', 'eval "git add -A && git commit -m x"', novo],
    ['F6 add -f em pasta ignorada', 'git add -f build && git commit -m x', ignorada],
    ['F6 heredoc na mesma linha', 'cat <<EOF > nota.txt && git add -A && git commit -m x\nbody\nEOF', novo],
    ['F6 add -A && commit && push', 'git add -A && git commit -m x && git push', novo],
    ['F6 commit -am && push', 'git commit -am x && git push', muda],
    ['C add limpo && commit (segredo fora)', 'git add limpo.js && git commit -m x', (p) => { muda(p); fs.writeFileSync(path.join(p, 'limpo.js'), 'base\nok\n'); }, null, 'bash', null, 'passa'],
    ['C commit que só remove o segredo', 'git add -A && git commit -m x', (p) => { prep(p); git('git commit -q -m s', p); fs.writeFileSync(path.join(p, 'a.js'), 'base\n'); }, null, 'bash', null, 'passa'],
    // Sem a palavra commit no texto: a trava antes não tem como ver. Depois do comando e no push, tem.
    ['L alias que já existia', 'git ci -am x', aliasAntigo, null, 'bash', null, 'limite'],
    ['L script que faz o commit', 'sh salvar.sh', script, null, 'bash', null, 'limite'],
    ['L palavra montada em variável', 'P=com; git add -A; git ${P}mit -m x', novo, null, 'bash', null, 'limite'],
    // Palavra partida por aspas: ainda é a palavra.
    ['F7 palavra partida por aspas', "git com''mit -am x", muda],
  ];
  const hook = (arq, entrada, extra = {}) => spawnSync(process.execPath, [path.join(RAIZ, 'hooks', arq)], { windowsHide: true, encoding: 'utf8', input: JSON.stringify(entrada), env: { ...process.env, ...extra }, timeout: 60000 });
  const res = [];
  const temDepois = fs.existsSync(path.join(RAIZ, 'hooks', 'trava-depois.js'));
  for (const [nome, cmd0, monta, onde, shell = 'bash', pasta, esperado = 'barra'] of casos) {
    if (shell === 'ps' ? process.platform !== 'win32' : !BASH) continue;
    const p = repo(pasta); monta(p);
    const R = posix(p);
    const cmd = cmd0.replace(/<RESC>/g, R.replace(/ /g, '\\ ')).replace(/<R>/g, R);
    const cwd = onde === 'fora' ? fora : p;
    const tool = shell === 'ps' ? 'PowerShell' : 'Bash';
    const r = hook('travas.js', { tool_name: tool, tool_input: { command: cmd }, cwd, hook_event_name: 'PreToolUse' });
    const dec = r.status === 2 ? 'bloqueia' : /"ask"/.test(r.stdout) ? 'pergunta' : 'passa';
    let levou = false; let aviso = null; let push = null; let semValor = !(r.stderr + r.stdout).includes(AWS);
    if (dec !== 'bloqueia') {
      const antes = git('git rev-parse HEAD', p).trim();
      if (temDepois) hook('trava-depois.js', { tool_name: tool, tool_input: { command: 'git status' }, cwd: p, hook_event_name: 'PostToolUse' }); // o registro do HEAD anterior
      const sem = cmd.replace(/ && git push$/, ''); // nada neste repositório tem remoto; o push não é o que está em prova aqui
      if (shell === 'ps') spawnSync('powershell', ['-NoProfile', '-Command', sem], { cwd, windowsHide: true, encoding: 'utf8', timeout: 30000 });
      else spawnSync(BASH, ['-c', sem], { cwd, windowsHide: true, encoding: 'utf8', timeout: 30000 });
      const depois = git('git rev-parse HEAD', p).trim();
      if (antes !== depois) {
        const dif = execSync(`git diff --name-only ${antes} ${depois}`, { cwd: p, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
        const conteudo = execSync(`git diff ${antes} ${depois}`, { cwd: p, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
        levou = conteudo.split('\n').some((l) => l.startsWith('+') && l.includes(AWS)) || /\.env/.test(dif);
      }
      if (levou && temDepois) {
        const d = hook('trava-depois.js', { tool_name: tool, tool_input: { command: cmd }, cwd: p, hook_event_name: 'PostToolUse' });
        aviso = /desfa[cç]a antes do push/i.test(d.stdout) && !d.stdout.includes(AWS);
        const x = hook('travas.js', { tool_name: 'Bash', tool_input: { command: 'git push origin main' }, cwd: p, hook_event_name: 'PreToolUse' });
        push = conteudoTemAltaCerteza(COM, cmd0, monta, envAcento) ? x.status === 2 : /"ask"/.test(x.stdout) && /\.env/.test(x.stdout);
        semValor = semValor && !(x.stderr + x.stdout).includes(AWS);
      }
    }
    let ok;
    if (esperado === 'passa') ok = dec === 'passa' && !levou;
    else if (esperado === 'limite') ok = temDepois ? levou && aviso === true && push === true : !levou || dec !== 'passa';
    else ok = (!levou || dec === 'pergunta') && (!levou || !temDepois || (aviso === true && push === true));
    res.push({ nome, dec, levou, aviso, push, esperado, ok: ok && semValor });
  }
  try { fs.rmSync(base, { recursive: true, force: true }); } catch (e) { /* antivírus segura arquivo */ }
  return { res, semShell: !BASH };
}
// O .env não tem segredo no conteúdo: no push ele cai na pergunta com o nome. Os outros têm o segredo: bloqueia.
function conteudoTemAltaCerteza(_c, _cmd, monta, envAcento) { return monta !== envAcento; }

// Forma simples sem segredo nunca pergunta, e o commit acontece de verdade.
function rodarSimples(RAIZ) {
  const BASH = achaBash();
  if (!BASH) return [];
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'trava-simples-'));
  const git = (c, cwd) => execSync(c, { cwd, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', windowsHide: true });
  let n = 0;
  const FORMAS = [
    'git commit -am x',
    'git commit -a -m "corrige o commit anterior"',
    'git commit -am "custa R$ 5"',
    `git commit -a -m "$(cat <<'EOF'\nvarias linhas; git add -A && $(rm x)\n\nCo-Authored-By: fulano <a@b>\nEOF\n)"`,
    `git commit -a -F - <<'EOF'\nmensagem; it's ok\nEOF`,
    'git add -A && git commit -m x',
    'git add . && git commit -m x 2>&1',
    'git add a.js limpo.js && git commit -m x',
    'git add -A; git commit -m x',
    'git add -A && git commit -m x | tail -3',
    'git add -A && git commit -m x && git status',
    'git add -A && git commit -q -m x && git log --oneline -1',
    'cd "<R>" && git add -A && git commit -m x',
    'git -C "<R>" commit -am x',
    'git commit --amend --no-edit -a',
    '"git" commit -am x',
    "git commit -am 'it''s'",
  ];
  const res = [];
  for (const f of FORMAS) {
    const p = path.join(base, 'r' + (++n)); fs.mkdirSync(p);
    git('git init -q', p); git('git config user.email t@t', p); git('git config user.name t', p);
    fs.writeFileSync(path.join(p, 'a.js'), 'base\n'); fs.writeFileSync(path.join(p, 'limpo.js'), 'base\n');
    git('git add -A', p); git('git commit -q -m base', p);
    fs.writeFileSync(path.join(p, 'a.js'), 'base\nmudou\n');
    const cmd = f.replace(/<R>/g, posix2(p));
    const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'travas.js')], { windowsHide: true, encoding: 'utf8', input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: cmd }, cwd: p, hook_event_name: 'PreToolUse' }), timeout: 60000 });
    const antes = git('git rev-parse HEAD', p).trim();
    spawnSync(BASH, ['-c', cmd], { cwd: p, windowsHide: true, encoding: 'utf8', timeout: 30000 });
    const fez = git('git rev-parse HEAD', p).trim() !== antes;
    res.push({ forma: f, ok: r.status === 0 && !r.stdout && fez, saida: r.status + ' ' + r.stdout.slice(0, 160) + (fez ? '' : ' (commit não aconteceu)') });
  }
  try { fs.rmSync(base, { recursive: true, force: true }); } catch (e) { /* antivírus segura arquivo */ }
  return res;
}
const posix2 = (p) => p.replace(/\\/g, '/');

if (require.main === module) {
  const RAIZ = path.resolve(process.argv[2] || path.join(__dirname, '..'));
  const t0 = Date.now();
  const { res } = rodarTabela(RAIZ);
  for (const x of res) console.log(`${x.ok ? 'ok   ' : 'FURO '} ${x.nome.padEnd(42)} ${x.dec.padEnd(9)} ${x.levou ? 'SEGREDO NO COMMIT' : '-'.padEnd(17)} depois=${x.aviso} push=${x.push}`);
  const simples = rodarSimples(RAIZ);
  for (const x of simples) if (!x.ok) console.log(`FALSO POSITIVO: ${x.forma.split('\n')[0]} → ${x.saida}`);
  const semPergunta = res.filter((x) => x.levou && x.dec === 'passa' && x.esperado !== 'limite').length;
  console.log(`formas: ${res.length} rodadas, ${res.filter((x) => x.levou).length} com segredo no commit, ${semPergunta} sem pergunta nem limite declarado, ${res.filter((x) => !x.ok).length} furo(s); simples: ${simples.length}, ${simples.filter((x) => !x.ok).length} falso(s) positivo(s); ${Math.round((Date.now() - t0) / 1000)} s`);
  process.exit(res.some((x) => !x.ok) || simples.some((x) => !x.ok) ? 1 : 0);
}
module.exports = { rodarTabela, rodarSimples };
