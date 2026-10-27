#!/usr/bin/env node
// Testes dos ganchos sem o Claude Code: monta uma pasta de projeto temporária e manda pedidos de exemplo ao roteador e
// comandos de exemplo às travas. Sai 1 se algum caso não der o esperado. Não mexe na sua pasta de usuário: usa uma
// pasta de configuração temporária (HOME/USERPROFILE trocados).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agentes-ultimate-'));
const casa = path.join(tmp, 'casa');
const proj = path.join(tmp, 'projeto');
fs.mkdirSync(casa); fs.mkdirSync(proj);
const env = { ...process.env, HOME: casa, USERPROFILE: casa };

function hook(script, dados) {
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', script)], { input: JSON.stringify(dados), env, encoding: 'utf8' });
  let json = null; try { json = JSON.parse(r.stdout || 'null'); } catch (e) { /* texto */ }
  return { code: r.status, out: r.stdout, err: r.stderr, json };
}
const rot = (prompt, cwd = proj) => hook('roteador.js', { prompt, cwd, hook_event_name: 'UserPromptSubmit' });
const trava = (command, cwd = proj) => hook('travas.js', { tool_name: 'Bash', tool_input: { command }, cwd, hook_event_name: 'PreToolUse' });

let falhas = 0;
function caso(nome, ok, detalhe) { console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome}${ok ? '' : ' → ' + detalhe}`); if (!ok) falhas++; }
const msg = (r) => (r.json && r.json.systemMessage) || '';
const ctx = (r) => (r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.additionalContext) || '';

// Roteador
let r = rot('quanto é 15% de 2300?');
caso('pergunta trivial não monta nada', r.code === 0 && !r.out && !fs.existsSync(path.join(proj, '.claude')), r.out);

r = rot('Monte um painel no Power BI com orçado x realizado e o desvio por centro de custo');
caso('painel de orçamento → BI + Finanças', /BI e painéis/.test(msg(r)) && /Finanças/.test(msg(r)), msg(r));
caso('memória do projeto criada', fs.existsSync(path.join(proj, '.claude', 'base', 'PROJETO.md')) && fs.existsSync(path.join(proj, '.claude', 'base', 'MAPA.md')), 'faltou .claude/base');

r = rot('escreva o manual do usuário em PDF para a diretoria');
caso('manual em PDF → Documentos', /Documentos/.test(msg(r)) && !/BI e painéis/.test(msg(r)), msg(r));

fs.writeFileSync(path.join(proj, 'package.json'), '{}');
r = rot('corrija o erro no script de importação');
caso('pasta com package.json + erro → Software', /Software/.test(msg(r)), msg(r));

r = rot('era com o analista-fpa');
caso('correção "era com" aprende', /analista-fpa/.test(msg(r)) && fs.existsSync(path.join(casa, '.claude', 'agentes-ultimate', 'roteamento.json')), msg(r));
r = rot('corrija o erro no script de importação');
caso('pedido parecido segue a correção', /analista-fpa/.test(msg(r)) || /analista-fpa/.test(ctx(r)), msg(r));

fs.appendFileSync(path.join(proj, '.claude', 'base', 'DIARIO.md'), '- 2026-10-20 [dev-powerbi] página de desvio por centro de custo construída → powerbi/x\n');
r = rot('ajuste a página de desvio por centro de custo no painel');
caso('traz o trabalho já feito sobre o assunto', /Já existe trabalho relacionado/.test(ctx(r)) && /página de desvio/.test(ctx(r)), ctx(r).slice(0, 300));

fs.writeFileSync(path.join(proj, '.claude', 'base', 'desligado'), '');
fs.rmSync(path.join(proj, '.claude', 'base', 'PROJETO.md'));
rot('monte o painel de custos no power bi');
caso('pasta desligada não recria memória', !fs.existsSync(path.join(proj, '.claude', 'base', 'PROJETO.md')), 'recriou');

const casa2 = rot('monte o painel de custos no power bi', casa);
caso('pasta do usuário (home) nunca recebe memória', !fs.existsSync(path.join(casa, '.claude', 'base')), casa2.out);

// Travas
r = trava('git push origin main');
caso('git push pede confirmação', r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.permissionDecision === 'ask', r.out);
r = trava("cat > x.js <<'EOF'\nconst a = 'C:\\\\pasta';\nEOF");
caso('heredoc com barra invertida bloqueado', r.code === 2, `code ${r.code}`);
r = trava('git status');
caso('comando comum passa', r.code === 0 && !r.out, r.out);

execSync('git init -q', { cwd: proj });
fs.writeFileSync(path.join(proj, '.env'), 'SENHA=x');
execSync('git add .env', { cwd: proj });
r = trava('git commit -m teste');
caso('commit com .env bloqueado', r.code === 2 && /\.env/.test(r.err), `code ${r.code} ${r.err}`);
execSync('git rm --cached -q .env', { cwd: proj }); // repositório sem commit: restore --staged não funciona
fs.mkdirSync(path.join(proj, 'dados')); fs.writeFileSync(path.join(proj, 'dados', 'real.csv'), 'a');
fs.writeFileSync(path.join(proj, '.claude', 'base', 'sensiveis.txt'), '# padrões do projeto\ndados/**\n');
execSync('git add dados/real.csv', { cwd: proj });
r = trava('git commit -m dados');
caso('commit com padrão do projeto bloqueado', r.code === 2 && /dados\/real\.csv/.test(r.err), `code ${r.code} ${r.err}`);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(falhas ? `${falhas} caso(s) falharam` : 'todos os casos passaram');
process.exit(falhas ? 1 : 0);
