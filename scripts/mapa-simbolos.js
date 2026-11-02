#!/usr/bin/env node
// Adaptado de DietrichGebert/ponytail/hooks/ponytail-map.js @96608e0, © 2026 DietrichGebert, MIT. Alterações: a pedido (sem gancho de
// sessão), windowsHide, variável AGENTES_ULTIMATE_MAPA_CARACTERES, comentários traduzidos; alterado por agentes-ultimate. Licença em terceiros/dietrichgebert-ponytail/.
// Mapa de símbolos (T33): funções, classes e exports de primeiro nível do projeto, uma linha por pasta, dentro de um limite de
// caracteres. Complementa o MAPA-AUTO.md (arquivos e quem cita quem) com o que já existe para reaproveitar. Sem modelo, sem
// dependência, sem rede, só leitura: `git ls-files` (ou uma varredura curta) e uma regex por linguagem.
//   node scripts/mapa-simbolos.js [pasta]
// shortcut: regex, não parser; perde definição aninhada ou dinâmica. Se o mapa precisar ser exato, troque por um índice de verdade.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BUDGET = Number(process.env.AGENTES_ULTIMATE_MAPA_CARACTERES || 2000);
const MAX_FILES = 4000;
const SRC = /\.(py|js|jsx|mjs|cjs|ts|tsx|go|rs|rb|java|kt|php|swift|cs)$/;
const SKIP_DIR = /(^|\/)(node_modules|\.git|dist|build|out|vendor|venv|\.venv|__pycache__|coverage|\.next|target|migrations|versions|fixtures|tests?|__tests__|spec)(\/|$)/;
const SKIP_FILE = /(^|\/)(test_[^/]*|[^/]*(_test|\.test|\.spec|\.gen|\.min|\.d)\.[a-z]+)$/;
const NAME = /^(?:type\s+)?(?:[\w$]+\s+as\s+)?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)$/;
const SAFE_PATH = /^[\w.@+$()[\]\/-]+$/;
const SHARED = /(util|helper|lib|common|shared|service|component|hook|core|model|schema|api)/i;

const PATTERNS = {
  py: [/^(?:async\s+)?def\s+([A-Za-z]\w*)/gm, /^class\s+([A-Za-z]\w*)/gm],
  js: [/^export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm,
       /^export\s*\{([^}]*)\}/gm],
  go: [/^func\s+(?:\([^)]*\)\s*)?([A-Z]\w*)/gm, /^type\s+([A-Z]\w*)/gm],
  rs: [/^pub\s+(?:async\s+)?(?:fn|struct|enum|trait|type)\s+(\w+)/gm],
  rb: [/^\s*(?:def|class|module)\s+([A-Za-z][\w.]*)/gm],
  jvm: [/^\s*(?:public\s+)?(?:static\s+)?(?:final\s+)?(?:class|interface|enum|record)\s+(\w+)/gm],
};
const LANG = { py: 'py', js: 'js', jsx: 'js', mjs: 'js', cjs: 'js', ts: 'js', tsx: 'js', go: 'go', rs: 'rs',
               rb: 'rb', java: 'jvm', kt: 'jvm', swift: 'jvm', cs: 'jvm', php: 'jvm' };

function listFiles(root) {
  try {
    // 64 MiB: com muitos arquivos, o `git ls-files` passa do limite padrão de 1 MiB do Node.
    const tracked = execFileSync('git', ['ls-files'], { windowsHide: true, cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000, maxBuffer: 64 * 1024 * 1024 })
      .split('\n').filter(Boolean).slice(0, MAX_FILES * 5);
    if (tracked.length) return tracked;
  } catch (e) { /* fora de repositório git: varredura abaixo */ }
  const out = [];
  (function walk(dir, depth) {
    if (depth > 6 || out.length > MAX_FILES * 5) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue;
      const rel = path.relative(root, path.join(dir, ent.name)).replace(/\\/g, '/');
      if (ent.isDirectory()) { if (!SKIP_DIR.test(rel + '/')) walk(path.join(dir, ent.name), depth + 1); }
      else out.push(rel);
    }
  })(root, 0);
  return out;
}

function namesIn(file, text) {
  const lang = LANG[path.extname(file).slice(1)];
  const names = [];
  for (const re of PATTERNS[lang] || []) {
    for (const m of text.matchAll(re)) {
      for (const n of m[1].split(',').map((s) => (s.trim().match(NAME) || [])[1]).filter(Boolean)) {
        if (!n.startsWith('_') && !names.includes(n)) names.push(n);
      }
    }
  }
  return names;
}

function buildMap(root = process.cwd()) {
  const files = listFiles(root)
    .filter((f) => SAFE_PATH.test(f) && SRC.test(f) && !SKIP_DIR.test(f) && !SKIP_FILE.test(f))
    .slice(0, MAX_FILES)
    .sort((a, b) => (SHARED.test(b) - SHARED.test(a)) || a.localeCompare(b));
  const dirs = new Map();
  for (const f of files) {
    let text;
    try {
      if (!fs.lstatSync(path.join(root, f)).isFile()) continue;
      text = fs.readFileSync(path.join(root, f), 'utf8').slice(0, 65536);
    } catch (e) { continue; }
    const names = namesIn(f, text);
    if (!names.length) continue;
    const dir = path.dirname(f) === '.' ? '.' : path.dirname(f);
    dirs.set(dir, [...(dirs.get(dir) || []), names]);
  }
  const lines = [];
  let used = 0;
  let skipped = 0;
  for (const [dir, perFile] of dirs) {
    const names = [...new Set(perFile.flatMap((n) => n.slice(0, perFile.length > 8 ? 1 : 3)))];
    const line = `${dir}/: ${names.slice(0, 30).join(', ')}${names.length > 30 ? ', ...' : ''}`;
    if (used + line.length > BUDGET) { skipped++; continue; }
    lines.push(line);
    used += line.length + 1;
  }
  if (!lines.length) return '';
  return 'Mapa de símbolos (o que já existe; reaproveite, e abra o arquivo só quando precisar do detalhe):\n' +
    lines.join('\n') + (skipped ? `\n(mais ${skipped} pasta(s) fora do limite)` : '');
}

module.exports = { buildMap };

if (require.main === module) process.stdout.write(buildMap(process.argv[2] || process.cwd()) + '\n');
