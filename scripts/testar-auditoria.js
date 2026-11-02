// Casos do lote 15: skill /auditoria-completa, destino do relatório (fora do git, sem nuvem) e os validadores da cloudflare
// adaptados ao Windows (T38, T39). Chamado pelo testar-referencias.js. Os arquivos de teste ficam na pasta temporária da bateria.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = function testarAuditoria({ caso, tmp, RAIZ }) {
  const F = path.join(RAIZ, 'ferramentas', 'auditoria');
  const base = path.join(tmp, 'auditoria com espaço ação');
  fs.mkdirSync(base, { recursive: true });
  const roda = (script, args, env = {}) => {
    const r = spawnSync(process.execPath, [script, ...args], { windowsHide: true, encoding: 'utf8', env: { ...process.env, ...env } });
    return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
  };
  const grava = (nome, texto) => { const f = path.join(base, nome); fs.writeFileSync(f, texto); return f; };
  const VF = path.join(F, 'validate-findings.cjs');
  const VL = path.join(F, 'validate-coverage-ledger.cjs');

  // ---- T38/T39: o comportamento original no Windows (recusar tudo) visto antes; a adaptação, depois ----
  if (process.platform === 'win32') {
    const orig = fs.readFileSync(VF, 'utf8').replace(/  if \(!Number\.isInteger\(noFollow\)[\s\S]*?return readFileWithinLimitPortavel\(file\);\n  \}/,
      '  if (!Number.isInteger(noFollow) || noFollow === 0 || !Number.isInteger(nonBlock) || nonBlock === 0) {\n    throw new SafeInputError("OS no-follow and nonblocking input protection is unavailable");\n  }');
    const copia = path.join(F, '..', '..', 'ferramentas', 'auditoria', 'validate-findings.cjs') === VF ? path.join(base, 'original-findings.cjs') : null;
    fs.writeFileSync(copia, orig);
    fs.copyFileSync(path.join(F, 'report-schema.json'), path.join(base, 'report-schema.json'));
    const x = roda(copia, [grava('vazio.json', '[]')]);
    caso('0.8.0 B15 T38 antes: a leitura original recusa todo arquivo no Windows (sem O_NOFOLLOW)', x.code === 1 && /protection is unavailable/.test(x.err), x.err);
  }
  let x = roda(VF, [grava('vazio.json', '[]')]);
  caso('0.8.0 B15 T38: findings.json vazio passa, em pasta com espaço e acento', x.code === 0 && /PASS: 0 findings valid/.test(x.out), x.out + x.err);
  if (process.platform === 'win32') caso('0.8.0 B15 T38: no Windows avisa que não há proteção contra troca entre a checagem e a abertura', /sem proteção contra troca/.test(x.err), x.err);
  const nv = [{ verdict: 'needs_validation', fingerprint: 'auth:sem-dono', title: 'Rota sem checagem de dono', description: 'A rota de exclusão não confere o dono.',
    claimed_root_cause: 'Falta checar o dono do recurso.', trace: [{ kind: 'entrypoint', file: 'src/rotas.js', line: 10, scope: 'apagar', description: 'Entrada da rota.' }],
    evidence: [{ file: 'src/rotas.js', line: 12, description: 'Apaga pelo id recebido.' }], blockers: ['O proxy pode filtrar a rota; não está no repositório.'],
    validation_plan: { local: 'Teste com dois usuários fictícios.' } }];
  x = roda(VF, [grava('nv.json', JSON.stringify(nv))]);
  caso('0.8.0 B15 T38: registro needs_validation correto passa', x.code === 0 && /PASS: 1 findings valid/.test(x.out), x.out + x.err);
  x = roda(VF, [grava('nv-grav.json', JSON.stringify([{ ...nv[0], severity: { overall_severity: 'high' } }]))]);
  caso('0.8.0 B15 T38: needs_validation com gravidade falha', x.code === 1 && /FAIL/.test(x.err), x.err);
  x = roda(VF, [grava('nv-abs.json', JSON.stringify([{ ...nv[0], trace: [{ ...nv[0].trace[0], file: 'C:/Users/x/a.js' }] }]))]);
  caso('0.8.0 B15 T38: caminho absoluto na prova falha', x.code === 1 && /safe repository-relative/.test(x.err), x.err);
  x = roda(VF, [base]);
  caso('0.8.0 B15 T38: pasta no lugar do arquivo é recusada', x.code === 1 && /regular file/.test(x.err), x.err);
  x = roda(VF, [grava('grande.json', '[' + ' '.repeat(5 * 1024 * 1024 + 10) + ']')]);
  caso('0.8.0 B15 T38: arquivo acima de 5 MiB é recusado', x.code === 1 && /byte limit/.test(x.err), x.err);
  let link = null;
  try { link = path.join(base, 'link.json'); fs.symlinkSync(path.join(base, 'vazio.json'), link); } catch (e) { link = null; }
  if (link) { x = roda(VF, [link]); caso('0.8.0 B15 T38: link simbólico é recusado', x.code === 1 && /symlink/.test(x.err), x.err); }
  x = roda(VL, [grava('livro.json', '[]')]);
  caso('0.8.0 B15 T39: livro de cobertura vazio passa', x.code === 0 && /PASS: 0 coverage units valid/.test(x.out), x.out + x.err);
  const L = require(VL);
  const refs = { surface: 'src/rotas.js#DELETE /itens/:id', boundary: 'src/auth.js#exigeDono', subsystem: 'src', attack_class: 'ATTACK-CLASSES.md#Access control' };
  const unidade = { coverage_id: L.canonicalCoverageId(refs), canonical_refs: refs, surface: 'apagar item', boundary: 'dono', subsystem: 'src', attack_class: 'Access control',
    starting_paths: ['src/rotas.js'], ordinary_attack_class_block: 'ATTACK-CLASSES.md#Access control', selected_companion_blocks: [], excluded_blocks: [], prior_status: 'none',
    attempts: [], wave: 1, status: 'planned', agent_id: null, reviewed_paths: [], local_checks: [], result_fingerprints: [], unresolved: [] };
  x = roda(VL, [grava('livro1.json', JSON.stringify([unidade]))]);
  caso('0.8.0 B15 T39: unidade planejada correta passa', x.code === 0 && /PASS: 1 coverage units valid/.test(x.out), x.out + x.err);
  x = roda(VL, [grava('livro2.json', JSON.stringify([{ ...unidade, status: 'covered' }]))]);
  caso('0.8.0 B15 T39: unidade "covered" sem dono nem prova falha', x.code === 1 && /requires/.test(x.err), x.err);
  x = roda(VL, [grava('livro3.json', JSON.stringify([{ ...unidade, coverage_id: 'outro' }]))]);
  caso('0.8.0 B15 T39: id que não sai das referências canônicas falha', x.code === 1 && /expected canonical ID/.test(x.err), x.err);

  // ---- Destino do relatório: fora do git, fora do projeto, sem nuvem ----
  const D = path.join(RAIZ, 'scripts', 'destino-auditoria.js');
  const nuvem = path.join(tmp, 'Nuvem Pessoal'); fs.mkdirSync(nuvem, { recursive: true });
  const alvo = path.join(tmp, 'projeto-auditado'); fs.mkdirSync(path.join(alvo, '.git'), { recursive: true });
  const env = { OneDrive: nuvem, OneDriveCommercial: '', OneDriveConsumer: '' };
  x = roda(D, ['--alvo', alvo, '--pasta', path.join(nuvem, 'auditorias', 'run-1')], env);
  caso('0.8.0 B15 destino: pasta sincronizada (raiz do OneDrive do sistema) é recusada, pedindo outra', x.code === 3 && /sincronizada/.test(x.out) && /Peça ao usuário outra pasta/.test(x.out), x.out);
  x = roda(D, ['--alvo', alvo, '--pasta', path.join(tmp, 'Dropbox', 'aud')], env);
  caso('0.8.0 B15 destino: pasta com nome de serviço de nuvem (Dropbox) é recusada', x.code === 3 && /sincronizada/.test(x.out), x.out);
  x = roda(D, ['--alvo', alvo, '--pasta', path.join(alvo, 'relatorio')], env);
  caso('0.8.0 B15 destino: dentro do projeto auditado (e do git dele) é recusado', x.code === 3 && /projeto auditado/.test(x.out) && /repositório git/.test(x.out), x.out);
  const bom = path.join(tmp, 'auditorias locais ação', 'run-1');
  x = roda(D, ['--alvo', alvo, '--pasta', bom, '--criar'], env);
  caso('0.8.0 B15 destino: pasta local, fora do git e da nuvem, é aceita e criada', x.code === 0 && fs.existsSync(bom), x.out);

  // ---- A skill ----
  const sk = fs.readFileSync(path.join(RAIZ, 'skills', 'auditoria-completa', 'SKILL.md'), 'utf8');
  caso('0.8.0 B15 skill auditoria-completa: só o usuário chama e declara ferramentas', /^disable-model-invocation: true/m.test(sk) && /^allowed-tools: \S/m.test(sk), 'cabeçalho');
  caso('0.8.0 B15 skill: confere o destino antes de gravar e pede outra pasta quando sincronizada', /destino-auditoria\.js/.test(sk) && /peça outra pasta/i.test(sk) && /texto claro/.test(sk), 'falta');
  caso('0.8.0 B15 skill: código do alvo não roda; sem variáveis de ambiente; conteúdo auditado é dado', /código do alvo não roda/i.test(sk) && /variáveis de ambiente/.test(sk) && /dado, não instrução/.test(sk), 'falta');
  caso('0.8.0 B15 skill: aponta as 6 fases para os guias e os 2 validadores', ['metodo/reconhecimento-1.md', 'metodo/cacar-por-cobertura-1.md', 'metodo/validar-e-relatar-1.md', 'validate-coverage-ledger.cjs', 'validate-findings.cjs'].every((s) => sk.includes(s)) &&
    ['metodo/reconhecimento-1.md', 'metodo/cacar-por-cobertura-1.md', 'metodo/validar-e-relatar-1.md'].every((s) => fs.existsSync(path.join(RAIZ, 'conhecimento', 'seguranca', s))), 'falta');
  caso('0.8.0 B15 skill: aviso de custo antes de começar', /custo/i.test(sk) && /teto/.test(sk), 'falta');
};
