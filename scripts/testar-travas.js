// Casos da trava de commit (revisão da parte A, ids A-1, M-1, M-2, M-3, M-4, b-1, b-2). Os segredos de teste são montados
// por partes: este arquivo não tem nenhum segredo literal, e o valor nunca pode aparecer na mensagem da trava.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

module.exports = function testarTravas({ caso, tmp, hook, RAIZ }) {
  const trava = (command, cwd, tool = 'Bash') => hook('travas.js', { tool_name: tool, tool_input: { command }, cwd, hook_event_name: 'PreToolUse' });
  const pede = (x) => x.json && x.json.hookSpecificOutput && x.json.hookSpecificOutput.permissionDecision === 'ask';
  const git = (c, cwd) => execSync(c, { windowsHide: true, cwd, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
  const AWS = 'AK' + 'IAZ7QK3LMN4PRS5TUV';
  const COM = `aws_id = "${AWS}"\n`;
  let n = 0;
  const repo = () => {
    const p = path.join(tmp, 'trava-' + (++n));
    fs.mkdirSync(p, { recursive: true });
    git('git init -q', p); git('git config user.email t@t', p); git('git config user.name t', p);
    fs.writeFileSync(path.join(p, 'a.js'), 'base\n'); fs.writeFileSync(path.join(p, 'limpo.js'), 'base\n');
    git('git add a.js limpo.js', p); git('git commit -q -m base', p);
    return p;
  };
  const fora = path.join(tmp, 'trava-fora'); fs.mkdirSync(fora, { recursive: true });
  const barrou = (x, arq) => x.code === 2 && x.err.includes(arq + ':') && !x.err.includes('IAZ7QK3');

  // ---- A-1: o que o comando vai preparar, commit em outra pasta e por caminho ----
  const novo = (p) => { fs.writeFileSync(path.join(p, 'novo.js'), COM); return p; };
  const muda = (p) => { fs.writeFileSync(path.join(p, 'a.js'), 'base\n' + COM); return p; };
  const prep = (p) => { muda(p); git('git add a.js', p); return p; };
  const formas = [
    ['git add novo.js && git commit -m x', novo, 'novo.js', 'mesma pasta'],
    ['git add -A; git commit -m x', novo, 'novo.js', 'mesma pasta'],
    ['git add -A; if ($?) { git commit -m x }', novo, 'novo.js', 'mesma pasta'],
    ['git add . && git commit -m x', muda, 'a.js', 'mesma pasta'],
    ['git add -u && git commit -m x', muda, 'a.js', 'mesma pasta'],
    ['git commit a.js -m x', muda, 'a.js', 'mesma pasta'],
    ['git commit -m x -- a.js', muda, 'a.js', 'mesma pasta'],
    ['git commit --include a.js -m x', muda, 'a.js', 'mesma pasta'],
    ['git.exe commit -am x', muda, 'a.js', 'mesma pasta'],
    ['bash -c "git add . && git commit -m x"', novo, 'novo.js', 'mesma pasta'],
    ['cd "<R>" && git commit -m x', prep, 'a.js', 'outra pasta'],
    ['Set-Location "<R>"; git add -A; git commit -m x', novo, 'novo.js', 'outra pasta'],
    ['git -C "<R>" commit -m x', prep, 'a.js', 'outra pasta'],
    ['git -C "<R>" add -A && git -C "<R>" commit -m x', novo, 'novo.js', 'outra pasta'],
  ];
  for (const [cmd, monta, arq, onde] of formas) {
    const p = monta(repo());
    const x = trava(cmd.replace(/<R>/g, p), onde === 'outra pasta' ? fora : p);
    caso(`0.8.0 A-1 trava: "${cmd}" (${onde}) é bloqueado, com arquivo:linha e sem o valor`, barrou(x, arq), `code ${x.code} ${x.err} ${x.out}`);
  }
  let p = repo(); fs.writeFileSync(path.join(p, '.env'), 'X=1\n');
  let x = trava('git add -A && git commit -m x', p);
  caso('0.8.0 A-1 trava: arquivo sensível que o "git add -A" levaria é bloqueado pelo nome', x.code === 2 && /\.env/.test(x.err), `code ${x.code} ${x.err}`);
  p = repo(); x = trava('git add $ARQ && git commit -m x', p);
  caso('0.8.0 A-1 trava: caminho em variável não dá para calcular → pergunta', x.code === 0 && pede(x), `code ${x.code} ${x.out}`);
  p = repo(); x = trava('cd $PASTA && git commit -m x', p);
  caso('0.8.0 A-1 trava: pasta em variável não dá para calcular → pergunta', x.code === 0 && pede(x), `code ${x.code} ${x.out}`);
  p = muda(repo()); fs.writeFileSync(path.join(p, 'limpo.js'), 'base\nok\n');
  x = trava('git add limpo.js && git commit -m "ajuste; sem a flag -a nem git add -A"', p);
  caso('0.8.0 A-1/b-2 trava: só o que vai no commit conta (texto da mensagem não muda nada; segredo fora do add passa)', x.code === 0 && !x.out, `code ${x.code} ${x.err} ${x.out}`);
  p = repo(); fs.writeFileSync(path.join(p, '.gitignore'), 'segredo.txt\n'); fs.writeFileSync(path.join(p, 'segredo.txt'), COM);
  x = trava('git add -A && git commit -m x', p);
  caso('0.8.0 A-1 trava: arquivo ignorado pelo .gitignore não conta no "git add -A"', x.code === 0 && !x.out, `code ${x.code} ${x.err} ${x.out}`);
  x = trava('echo "git commit -a" && git log --grep commit', muda(repo()));
  caso('0.8.0 A-1 trava: citar "git commit" em texto não é commit', x.code === 0 && !x.out, `code ${x.code} ${x.out}`);
  p = muda(repo());
  x = trava("git commit -q -F - <<'EOF'\ncorrige; git add -A && it's ok\nEOF", p);
  caso('0.8.0 A-1 trava: mensagem em heredoc não é lida como comando', x.code === 0 && !x.out, `code ${x.code} ${x.err} ${x.out}`);

  // ---- M-1: commit grande. Sem custo quadrático; o que não der para ler a tempo vira pergunta, nunca passa calado ----
  const comTeto = (command, cwd, teto) => {
    const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'travas.js')], { windowsHide: true, encoding: 'utf8', input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd, hook_event_name: 'PreToolUse' }), env: { ...process.env, AGENTES_ULTIMATE_TRAVA_TETO: String(teto) } });
    let json = null; try { json = JSON.parse(r.stdout || 'null'); } catch (e) { /* texto */ }
    return { code: r.status, out: r.stdout, err: r.stderr, json };
  };
  p = repo(); fs.writeFileSync(path.join(p, 'grande.txt'), 'linha comum\n'.repeat(4000)); git('git add grande.txt', p);
  x = comTeto('git commit -m x', p, 1000);
  caso('0.8.0 M-1 trava: diff acima do teto não passa calado: pergunta "grande demais para conferir"', x.code === 0 && pede(x) && /grande demais/.test(x.out), `code ${x.code} ${x.out}`);
  p = repo(); fs.writeFileSync(path.join(p, 'grande.txt'), 'linha comum\n'.repeat(4000));
  x = comTeto('git add -A && git commit -m x', p, 1000);
  caso('0.8.0 M-1 trava: arquivo novo acima do teto também pergunta', x.code === 0 && pede(x) && /grande demais/.test(x.out), `code ${x.code} ${x.out}`);
  p = repo(); fs.writeFileSync(path.join(p, 'muitos.json'), ('{"tok' + 'en": "abc123def456ghi"}\n').repeat(40000)); git('git add muitos.json', p);
  let t0 = Date.now(); x = trava('git commit -m x', p); let ms = Date.now() - t0;
  caso('0.8.0 M-1 trava: 40 mil linhas com achado levam menos de 6 s (era 48 s: custo quadrático)', ms < 6000 && pede(x), `${ms} ms ${x.out.slice(0, 120)}`);
  p = repo(); fs.writeFileSync(path.join(p, 'host.txt'), 'Host=a;'.repeat(60000) + '\n'); git('git add host.txt', p);
  t0 = Date.now(); x = trava('git commit -m x', p); ms = Date.now() - t0;
  caso('0.8.0 M-1 trava: linha de 420 KB com "Host=a;" leva menos de 3 s (era 19,9 s)', ms < 3000, `${ms} ms`);

  // ---- M-2: exemplo legítimo não bloqueia; exemplo de desenvolvimento pergunta; segredo real continua bloqueado ----
  const noCommit = (texto, arq = 'doc.md') => { const q = repo(); fs.writeFileSync(path.join(q, arq), texto); git('git add ' + arq, q); return trava('git commit -m x', q); };
  const PW = 'Pass' + 'word=', SV = 'Serv' + 'er=', PG = 'postgres' + '://';
  for (const [nome, texto] of [
    ['marcador seguido de crase', '`' + SV + 'db;' + PW + '<senha>`\n'],
    ['variável seguida de crase', '`' + SV + 'db;' + PW + '$' + '{DB_SENHA}`\n'],
    ['marcador seguido de ponto', 'Use ' + SV + 'db;' + PW + '<senha>.\n'],
    ['chave de exemplo da Anthropic só com x', 'sk-' + 'ant-' + 'x'.repeat(32) + '\n'],
    ['chave de exemplo do GitHub só com x', 'gh' + 'p_' + 'x'.repeat(36) + '\n'],
    ['chave de exemplo do Stripe só com X', 'rk_' + 'live_' + 'X'.repeat(24) + '\n'],
    ['exemplo do Slack só com x', 'xo' + 'xb-' + 'x'.repeat(24) + '\n'],
  ]) { const y = noCommit(texto); caso('0.8.0 M-2 trava: passa (' + nome + ')', y.code === 0 && !y.out, `code ${y.code} ${y.err} ${y.out}`); }
  for (const [nome, texto] of [
    ['banco em localhost', 'db = "' + PG + 'admin:' + 'Forte9Senha' + '@localhost:5432/app"\n'],
    ['senha igual ao usuário', 'db = "' + PG + 'admin:' + 'admin' + '@db.interno:5432/app"\n'],
    ['texto ADO em localhost', SV + 'localhost;User Id=app;' + PW + 'Forte9Senha;\n'],
    ['exemplo clássico da documentação', SV + 'db01;User Id=app;' + PW + 'my' + 'Password;\n'],
  ]) { const y = noCommit(texto); caso('0.8.0 M-2 trava: pergunta em vez de bloquear (' + nome + ')', y.code === 0 && pede(y), `code ${y.code} ${y.err} ${y.out}`); }
  let y2 = noCommit('db = "' + PG + 'app:' + 'Forte9Senha' + '@db.interno:5432/app"\n');
  caso('0.8.0 M-2 trava: senha real em servidor de verdade continua bloqueada', y2.code === 2, `code ${y2.code} ${y2.out}`);

  // ---- b-1: segredos que passavam ----
  y2 = noCommit(PW + 'Forte9Senha;' + SV + 'db01;Database=x;\n');
  caso('0.8.0 b-1 trava: texto ADO com a senha antes do servidor é bloqueado', y2.code === 2, `code ${y2.code} ${y2.out}`);
  y2 = noCommit('API_' + 'KEY=' + 'q8W2e4R6t8Y0u2I4\n', 'run.sh');
  caso('0.8.0 b-1 trava: API_KEY=valor sem aspas pergunta', y2.code === 0 && pede(y2), `code ${y2.code} ${y2.out}`);
  y2 = noCommit('aws_' + 'secret_access_key = "' + 'q8W2e4R6t8Y0u2I4o6P8a1S3d5F7g9H1j3K5l7Z9"\n', 'cfg.ini');
  caso('0.8.0 b-1 trava: aws_secret_access_key sem o id pergunta', y2.code === 0 && pede(y2), `code ${y2.code} ${y2.out}`);

};
