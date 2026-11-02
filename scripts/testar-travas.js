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
    ['cd "<R>" && git commit -m x', prep, 'a.js', 'mesma pasta'],
    ['git -C "<R>" commit -m x', prep, 'a.js', 'mesma pasta'],
    ['git -C "<R>" add -A && git -C "<R>" commit -m x', novo, 'novo.js', 'mesma pasta'],
  ];
  for (const [cmd, monta, arq, onde] of formas) {
    const p = monta(repo());
    const x = trava(cmd.replace(/<R>/g, p), onde === 'outra pasta' ? fora : p);
    caso(`0.8.0 A-1 trava: "${cmd}" (${onde}) é bloqueado, com arquivo:linha e sem o valor`, barrou(x, arq), `code ${x.code} ${x.err} ${x.out}`);
  }
  // Em outra pasta, ou dentro de outro programa: pergunta (rodar git em outra pasta usaria a configuração dela, antes da permissão).
  for (const [cmd, monta] of [['bash -c "git add . && git commit -m x"', novo], ['cd "<R>" && git commit -m x', prep], ['Set-Location "<R>"; git add -A; git commit -m x', novo], ['git -C "<R>" commit -m x', prep]]) {
    const q = monta(repo());
    const fin = cmd.startsWith('bash') ? q : fora;
    const y = trava(cmd.replace(/<R>/g, q), fin);
    caso(`0.8.0 2ª rodada trava: "${cmd}" pergunta, sem adivinhar`, y.code === 0 && pede(y), `code ${y.code} ${y.err} ${y.out}`);
  }
  // ---- B-1: a trava nunca executa texto do comando ----
  for (const [nome, cmd, arqI] of [
    ['aspas no caminho do commit', "git commit -m x 'q\" & echo pego > INJ1.txt & \"'", 'INJ1.txt'],
    ['aspas no caminho do add', "git add 'q\" & echo pego > INJ2.txt & \"' && git commit -m x", 'INJ2.txt'],
    ['substituição no caminho', 'git add "$(echo pego > INJ3.txt)" && git commit -m x', 'INJ3.txt'],
    ['crase no caminho', 'git commit -m x -- "`echo pego > INJ4.txt`"', 'INJ4.txt'],
    ['pasta com comando', 'git -C "q\" & echo pego > INJ5.txt & \"" commit -m x', 'INJ5.txt'],
    ['eval', 'eval "echo pego > INJ6.txt; git commit -m x"', 'INJ6.txt'],
  ]) {
    const q = repo(); trava(cmd, q);
    caso('0.8.0 B-1 trava: não executa o que está no comando (' + nome + ')', !fs.existsSync(path.join(q, arqI)), 'arquivo criado pela trava');
  }
  for (const arqF of ['travas.js', 'trava-comando.js', 'leitor-segredos.js', 'trava-depois.js']) {
    const fonte = fs.readFileSync(path.join(RAIZ, 'hooks', arqF), 'utf8');
    caso('0.8.0 B-1 trava: ' + arqF + ' não usa execSync nem shell', !/\bexecSync\b|shell\s*:\s*true/.test(fonte), 'achou');
  }
  // ---- M-5: o que escapava da mutação ----
  let q5 = repo(); fs.writeFileSync(path.join(q5, 'a.js'), 'um\ndois\n' + COM);
  let x5 = trava('git add a.js && git commit -m x', q5);
  caso('0.8.0 M-5 trava: a mensagem traz o número certo da linha', x5.code === 2 && x5.err.includes('a.js:3 '), x5.err);
  q5 = novo(repo()); x5 = trava('git add -u && git commit -m x', q5);
  caso('0.8.0 M-5 trava: "git add -u" não leva arquivo novo', x5.code === 0 && !x5.out, `code ${x5.code} ${x5.err} ${x5.out}`);
  q5 = repo(); fs.writeFileSync(path.join(q5, '.gitignore'), 'build/\n'); git('git add .gitignore', q5); git('git commit -q -m i', q5); fs.mkdirSync(path.join(q5, 'build')); fs.writeFileSync(path.join(q5, 'build', 'n.js'), COM);
  x5 = trava('git add -f build && git commit -m x', q5);
  caso('0.8.0 M-5 trava: "git add -f" não é forma lida com certeza: pergunta', x5.code === 0 && pede(x5), `code ${x5.code} ${x5.out}`);
  q5 = novo(repo());
  x5 = trava("git commit -F - <<'EOF'\ngit add -A\nEOF", q5);
  caso('0.8.0 M-5 trava: "git add -A" dentro do heredoc da mensagem não conta como preparo', x5.code === 0 && !x5.out, `code ${x5.code} ${x5.err} ${x5.out}`);
  // Mutação da 2ª rodada: o que só a tabela longa pegava.
  q5 = prep(repo()); x5 = trava('eval "git commit -m x"', q5);
  caso('0.8.0 2ª rodada trava: forma incerta com segredo já preparado bloqueia (não só pergunta)', x5.code === 2 && /a\.js:2/.test(x5.err), `code ${x5.code} ${x5.out}`);
  q5 = muda(repo()); x5 = trava("git com''mit -am x", q5);
  caso('0.8.0 2ª rodada trava: palavra partida por aspas ainda é commit', x5.code !== 0 || pede(x5), `code ${x5.code} ${x5.out}`);
  const limpo5 = () => { const q = repo(); fs.writeFileSync(path.join(q, 'a.js'), 'base\nok\n'); fs.writeFileSync(path.join(q, 'sub.txt'), 'ok\n'); return q; };
  for (const [nome, cmd] of [['add em outra pasta', 'git -C sub add . && git commit -m x'], ['opção longa fora da lista', 'git commit --fixup HEAD -a'], ['opção curta fora da lista', 'git commit -p -m x'], ['saída passada para outro programa', 'git commit -am x | sh']]) {
    fs.mkdirSync(path.join(q5 = limpo5(), 'sub'), { recursive: true });
    x5 = trava(cmd, q5);
    caso('0.8.0 2ª rodada trava: ' + nome + ' pergunta, mesmo sem segredo', x5.code === 0 && pede(x5), `code ${x5.code} ${x5.out}`);
  }
  q5 = repo(); let ligou = true;
  try { fs.symlinkSync(path.join(q5, 'nao-existe.js'), path.join(q5, 'quebrado.js')); } catch (e) { ligou = false; }
  if (ligou) { x5 = trava('git add -A && git commit -m x', q5); caso('0.8.0 2ª rodada trava: arquivo novo que não abre pergunta, não passa como limpo', x5.code === 0 && pede(x5), `code ${x5.code} ${x5.out}`); }
  // ---- A-3: nome com acento, nos 2 sentidos; aspas no diff ----
  q5 = repo(); fs.writeFileSync(path.join(q5, 'configuração.js'), COM); git('git add .', q5);
  x5 = trava('git commit -m x', q5);
  caso('0.8.0 A-3 trava: acento já preparado sai legível na mensagem', x5.code === 2 && x5.err.includes('configuração.js:1'), x5.err);
  q5 = repo(); fs.writeFileSync(path.join(q5, 'a b.js'), COM); fs.writeFileSync(path.join(q5, 'a\tc.js'.replace('\t', process.platform === 'win32' ? '_' : '\t')), COM); git('git add .', q5);
  x5 = trava('git commit -m x', q5);
  caso('0.8.0 A-3 trava: espaço no nome também é lido', x5.code === 2 && x5.err.includes('a b.js:1'), x5.err);
  // ---- Depois do comando e barreira do push ----
  const depois = (command, cwd) => hook('trava-depois.js', { tool_name: 'Bash', tool_input: { command }, cwd, hook_event_name: 'PostToolUse' });
  q5 = muda(repo()); depois('git status', q5);
  let d5 = depois('git status', q5);
  caso('0.8.0 trava depois: HEAD parado, silêncio', d5.code === 0 && !d5.out, d5.out);
  git('git add a.js', q5); git('git commit -q -m s', q5);
  d5 = depois('qualquer', q5);
  caso('0.8.0 trava depois: HEAD mudou com segredo → aviso com a instrução de desfazer antes do push, sem o valor', d5.code === 0 && /ANTES do push/.test(d5.out) && /a\.js:2/.test(d5.out) && !d5.out.includes('IAZ7QK3'), d5.out);
  d5 = depois('qualquer', q5);
  caso('0.8.0 trava depois: o aviso sai uma vez', !d5.out, d5.out);
  x5 = trava('git push origin main', q5);
  caso('0.8.0 trava push: segredo em commit não enviado bloqueia, sem o valor', x5.code === 2 && /a\.js:2/.test(x5.err) && !x5.err.includes('IAZ7QK3'), `code ${x5.code} ${x5.out}`);
  x5 = trava('git add -A && git commit -m x && git push', novo(repo()));
  caso('0.8.0 trava push: "add, commit e push" bloqueia pelo segredo, antes de perguntar sobre publicar', x5.code === 2 && /novo\.js:1/.test(x5.err), `code ${x5.code} ${x5.out}`);
  q5 = repo(); x5 = trava('git push', q5);
  caso('0.8.0 trava push: sem segredo, continua perguntando sobre publicar', x5.code === 0 && pede(x5) && /checklist-lancamento/.test(x5.out), x5.out);
  const remoto = path.join(tmp, 'remoto-' + (++n)); git('git init -q --bare "' + remoto + '"', tmp);
  q5 = repo(); muda(q5); git('git add a.js', q5); git('git commit -q -m s', q5); git('git remote add origin "' + remoto + '"', q5); git('git push -q origin HEAD:refs/heads/main', q5);
  x5 = trava('git push', q5);
  caso('0.8.0 trava push: o que já está no remoto não conta', x5.code === 0 && pede(x5) && !/segredo/.test(x5.out), `code ${x5.code} ${x5.err}`);
  x5 = trava('git stash push -m "x"', repo());
  caso('0.8.0 trava push: "git stash push" não é publicar', x5.code === 0 && !x5.out, x5.out);
  x5 = trava('node -e "a.push(1)"', repo());
  caso('0.8.0 trava push: "push" de código, sem git, não pergunta', x5.code === 0 && !x5.out, x5.out);
  x5 = trava('git -c alias.p=push p', repo());
  caso('0.8.0 trava push: push por alias pergunta', x5.code === 0 && pede(x5), x5.out);
  // ---- Tabela das formas, rodada de verdade (leva minutos; AGENTES_ULTIMATE_SEM_FORMAS=1 pula nas rodadas intermediárias) ----
  if (!process.env.AGENTES_ULTIMATE_SEM_FORMAS) {
    const Tab = require(path.join(RAIZ, 'scripts', 'testar-travas-formas.js'));
    const { res } = Tab.rodarTabela(RAIZ);
    const furos = res.filter((f) => !f.ok);
    caso(`0.8.0 2ª rodada tabela: ${res.length} formas rodadas; segredo no commit só depois de pergunta ou em limite declarado, sempre com aviso depois e barra no push`, res.length >= 47 && !furos.length, furos.map((f) => f.nome).join('; '));
    const simples = Tab.rodarSimples(RAIZ);
    const fp = simples.filter((f) => !f.ok);
    caso(`0.8.0 2ª rodada tabela: ${simples.length} formas simples sem segredo nunca perguntam, e o commit acontece`, simples.length >= 17 && !fp.length, fp.map((f) => f.forma + ' → ' + f.saida).join('; '));
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

  const comPrazo = (command, cwd, ms) => {
    const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'travas.js')], { windowsHide: true, encoding: 'utf8', input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd, hook_event_name: 'PreToolUse' }), env: { ...process.env, AGENTES_ULTIMATE_TRAVA_PRAZO_MS: String(ms) } });
    let json = null; try { json = JSON.parse(r.stdout || 'null'); } catch (e) { /* texto */ }
    return { code: r.status, out: r.stdout, err: r.stderr, json };
  };
  p = repo(); fs.writeFileSync(path.join(p, 'a.js'), 'mudou\n'); git('git add a.js', p);
  x = comPrazo('git commit -m x', p, 1);
  caso('0.8.0 M-1 trava: prazo da leitura vencido → pergunta, nunca libera calado', x.code === 0 && pede(x) && /não terminou/.test(x.out), `code ${x.code} ${x.out}`);
  p = repo(); fs.writeFileSync(path.join(p, 'g.txt'), 'linha comum\n'.repeat(200000)); git('git add g.txt', p);
  x = comTeto('git commit -m x', p, 1000);
  caso('0.8.0 M-1 trava: diff que estoura a leitura → pergunta "grande demais"', x.code === 0 && pede(x) && /grande demais/.test(x.out), `code ${x.code} ${x.out}`);

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

  // ---- M-4: cada formato de chave bloqueia; uma letra a menos no limite não é mais o formato ----
  const A = 'a1B2c3D4e5';
  const ate = (n) => (A.repeat(10)).slice(0, n);
  for (const [nome, prefixo, tam] of [['OpenAI', 'sk-' + 'proj-', 32], ['Google', 'AI' + 'za', 35], ['Slack', 'xo' + 'xb-', 10], ['Stripe', 's' + 'k_live_', 20], ['npm', 'np' + 'm_', 36], ['Azure Storage', 'Account' + 'Key=', 40]]) {
    const cheio = noCommit('v = "' + prefixo + ate(tam) + '"\n', 'c.js');
    caso('0.8.0 M-4 trava: chave ' + nome + ' é bloqueada, sem mostrar o valor', cheio.code === 2 && /c\.js:1/.test(cheio.err) && !cheio.err.includes(ate(tam)), `code ${cheio.code} ${cheio.err}`);
    const curto = noCommit('v = "' + prefixo + ate(tam - 1) + '"\n', 'c.js');
    caso('0.8.0 M-4 trava: ' + nome + ' com uma letra a menos não é o formato', curto.code === 0, `code ${curto.code} ${curto.err}`);
  }

  // ---- b-1: segredos que passavam ----
  y2 = noCommit(PW + 'Forte9Senha;' + SV + 'db01;Database=x;\n');
  caso('0.8.0 b-1 trava: texto ADO com a senha antes do servidor é bloqueado', y2.code === 2, `code ${y2.code} ${y2.out}`);
  y2 = noCommit('API_' + 'KEY=' + 'q8W2e4R6t8Y0u2I4\n', 'run.sh');
  caso('0.8.0 b-1 trava: API_KEY=valor sem aspas pergunta', y2.code === 0 && pede(y2), `code ${y2.code} ${y2.out}`);
  const SA = 'q8W2e4R6t8Y0u2I4o6P8a1S3d5F7g9H1j3K5l7Z9';
  y2 = noCommit('aws_' + 'secret_access_key = "' + SA + '"\n', 'cfg.ini');
  caso('0.8.0 b-1 trava: aws_secret_access_key com aspas bloqueia', y2.code === 2, `code ${y2.code} ${y2.out}`);
  y2 = noCommit('[default]\naws_' + 'secret_access_key = ' + SA + '\n', 'cfg.ini');
  caso('0.8.0 b-1 trava: aws_secret_access_key sem aspas, como no arquivo de credenciais, bloqueia', y2.code === 2 && /cfg\.ini:2/.test(y2.err), `code ${y2.code} ${y2.out}`);
  y2 = noCommit('aws_secret_' + 'access_key = ' + 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY' + 'EXAMPLEKEY\n', 'cfg.ini');
  caso('0.8.0 b-1 trava: a chave de exemplo da documentação da AWS passa', y2.code === 0 && !y2.out, `code ${y2.code} ${y2.err}`);
  y2 = noCommit('api' + '_key=q8W2e4R6t8Y0u2I4\n', 'run.sh');
  caso('0.8.0 b-1 trava: api_key=valor minúsculo sem aspas pergunta', y2.code === 0 && pede(y2), `code ${y2.code} ${y2.out}`);
  y2 = noCommit('api' + '_key = config.get(k1234567890)\n', 'c.py');
  caso('0.8.0 b-1 trava: chamada atribuída a api_key não é valor', y2.code === 0 && !y2.out, `code ${y2.code} ${y2.out}`);
  // ---- b-8: o que a correção do M-2 tinha afrouxado ----
  y2 = noCommit(SV + 'db01;User Id=app;' + PW + '\\Forte9Senha;\n');
  caso('0.8.0 b-8 trava: senha que começa com barra invertida bloqueia', y2.code === 2, `code ${y2.code} ${y2.out}`);
  y2 = noCommit('db = "' + PG + 'app:' + 'Forte9Senha' + '@localhost.empresa.com:5432/x"\n');
  caso('0.8.0 b-8 trava: servidor que só começa com localhost bloqueia', y2.code === 2, `code ${y2.code} ${y2.out}`);
  y2 = noCommit(SV + 'db01.empresa.com;User Id=app;' + PW + 'Forte9Senha; // antes era localhost\n');
  caso('0.8.0 b-8 trava: localhost em outro ponto da linha não afrouxa', y2.code === 2, `code ${y2.code} ${y2.out}`);

  // ---- M-3: a árvore do próprio plugin passa, num repositório novo ----
  const arv = path.join(tmp, 'arvore-plugin'); fs.mkdirSync(arv, { recursive: true });
  for (const d of ['agents', 'conhecimento', 'docs', 'evals', 'fonte', 'fontes', 'hooks', 'modelos', 'pacotes', 'scripts', 'skills', 'terceiros', 'ferramentas', 'README.md', 'CHANGELOG.md', 'CREDITOS.md']) if (fs.existsSync(path.join(RAIZ, d))) fs.cpSync(path.join(RAIZ, d), path.join(arv, d), { recursive: true });
  git('git init -q', arv); git('git config user.email t@t', arv); git('git config user.name t', arv);
  const ta = trava('git add -A && git commit -m tudo', arv);
  caso('0.8.0 M-3 trava: a árvore inteira do plugin passa sem bloqueio nem pergunta', ta.code === 0 && !ta.out, `code ${ta.code} ${ta.err.slice(0, 400)}`);

  // ---- b-9: furos do detector de windowsHide ----
  const { semWindowsHide } = require(path.join(RAIZ, 'scripts', 'chamadas-processo.js'));
  const CPM = "require('child_" + "process')";
  const S = 'spawn' + 'Sync';
  for (const [nome, fonte, acusa] of [
    ['windowsHide: false', `const { ${S} } = ${CPM}; ${S}('a', [], { windowsHide: false });`, 1],
    ['a palavra em comentário', `const { ${S} } = ${CPM}; ${S}('a', [] /* windowsHide: true */);`, 1],
    ['a palavra em texto', `const { ${S} } = ${CPM}; ${S}('a windowsHide: true', []);`, 1],
    ['require direto com exec', `${CPM}.exec('a');`, 1],
    ['objeto do módulo', `const cp = ${CPM}; cp.exec('a');`, 1],
    ['função renomeada', `const { ${S}: roda } = ${CPM}; roda('a', []);`, 1],
    ['sem fechar o parêntese', `const { ${S} } = ${CPM}; ${S}('a', [`, 1],
    ['apóstrofo em comentário não cega', `const { ${S} } = ${CPM}; // it's\n${S}('a');`, 1],
    ['parêntese em regex não cega', `const { ${S} } = ${CPM}; ${S}('a', /\\)/.source);`, 1],
    ['com a opção certa', `const { ${S} } = ${CPM}; ${S}('a', [], { windowsHide: true });`, 0],
    ['exec de regex', `const { ${S} } = ${CPM}; /x/.exec('a');`, 0],
    ['função local, sem o módulo', "function spawn(a) { return a; } spawn('a');", 0],
    ['nome em comentário', `const x = ${CPM}; // ${S}('a')\n`, 0],
  ]) { const a = semWindowsHide(fonte); caso('0.8.0 b-9 detector: ' + nome + (acusa ? ' é acusado' : ' não é acusado'), a.length === acusa, JSON.stringify(a)); }
  const val = fs.readFileSync(path.join(RAIZ, 'scripts', 'validar.js'), 'utf8');
  caso('0.8.0 b-9 detector: olha ferramentas/ e modelos/ também', /\['hooks', 'scripts', 'ferramentas', 'modelos'\]/.test(val), 'lista mudou');

  // ---- b-3: escolha de blocos do checklist pelo perfil e carga sob demanda dos roteiros ----
  const sk = fs.readFileSync(path.join(RAIZ, 'skills', 'checklist-lancamento', 'SKILL.md'), 'utf8');
  caso('0.8.0 b-3 checklist: o bloco S-web tem condição de perfil (só com login próprio ou entrada de fora), não entra sempre', /\*\*S-web\*\*[^|]*\|\s*resposta 3 = login próprio, ou 5 = sim\s*\|/.test(sk), 'condição do S-web mudou');
  caso('0.8.0 b-3 checklist: os roteiros abrem só o da área do item, quando for executar', /abra só o da área do item, quando for executar/.test(sk) && !/abra todos|leia todos os roteiros/i.test(sk), 'carga sob demanda mudou');
  // ---- b-4: a bateria roda com AGENTES_ULTIMATE_SEM_PASTA=1 no ambiente ----
  caso('0.8.0 b-4 bateria: tira AGENTES_ULTIMATE_SEM_PASTA do ambiente dos ganchos', !('AGENTES_ULTIMATE_SEM_PASTA' in process.env), 'variável herdada');
};
