#!/usr/bin/env node
// Atividade ao vivo (PostToolUse): anota cada arquivo que o Claude ou um agente lê, edita, cria ou procura, para o
// mapa ao vivo mostrar onde o trabalho está acontecendo. Grava só o caminho (nunca o conteúdo) em
// .claude/base/.atividade.jsonl (fora do git). Nunca bloqueia: em qualquer erro, sai 0.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_BYTES = 2 * 1024 * 1024;
const ACAO = { Read: 'leu', Edit: 'editou', MultiEdit: 'editou', Write: 'criou', NotebookEdit: 'editou', Grep: 'procurou', Glob: 'procurou' };

function permitida(cwd) {
  const p = path.resolve(cwd || '');
  if (!p || p === path.parse(p).root || p === path.resolve(os.homedir())) return false;
  if (process.env.AGENTES_ULTIMATE_SEM_PASTA === '1') return false;
  if (fs.existsSync(path.join(p, '.claude', 'base', 'desligado'))) return false;
  return fs.existsSync(path.join(p, '.claude', 'base')); // só onde a base já foi montada
}

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(entrada || '{}');
    const cwd = d.cwd || process.cwd();
    const ferramenta = d.tool_name || '';
    if (!ACAO[ferramenta] || !permitida(cwd)) process.exit(0);
    const ti = d.tool_input || {};
    let alvo = ti.file_path || ti.notebook_path || ti.path || '';
    if (!alvo && (ferramenta === 'Grep' || ferramenta === 'Glob')) alvo = '';
    let rel = '';
    if (alvo) {
      const abs = path.resolve(cwd, alvo);
      rel = path.relative(cwd, abs).replace(/\\/g, '/');
      if (rel.startsWith('..') || path.isAbsolute(rel)) process.exit(0); // fora do projeto: não anota
      if (rel.startsWith('.claude/base/.')) process.exit(0); // arquivos internos da base
    }
    const ev = {
      em: new Date().toISOString(),
      acao: ACAO[ferramenta],
      arquivo: rel || null,
      busca: (ferramenta === 'Grep' || ferramenta === 'Glob') ? String(ti.pattern || '').slice(0, 80) : undefined,
      agente: d.agent_type || d.subagent_type || (d.agent_id ? 'agente' : 'principal'),
    };
    const arq = path.join(cwd, '.claude', 'base', '.atividade.jsonl');
    try { if (fs.statSync(arq).size > MAX_BYTES) fs.renameSync(arq, arq + '.1'); } catch (e) { /* novo */ }
    fs.appendFileSync(arq, JSON.stringify(ev) + '\n');
  } catch (e) { /* nunca quebra o trabalho */ }
  process.exit(0);
});
