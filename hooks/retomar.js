#!/usr/bin/env node
// Rascunho para retomar (PreCompact e SessionEnd): grava .claude/base/.retomar.md com a hora, os últimos arquivos mexidos e
// o estado do git, para a sessão seguinte começar de onde parou. Ideia de affaan-m/ECC/scripts/hooks/pre-compact.js e
// session-end.js @b38be6a, © 2026 Affaan Mustafa, MIT; reescrito; alterado por agentes-ultimate; licença em terceiros/affaan-m-ECC/.
// Escreve só em .claude/base/ (fora do git). Nunca o texto da conversa. Em erro, não atrapalha.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const R = require('./registro');

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(entrada || '{}');
    const cwd = d.cwd || process.cwd();
    const base = R.base(cwd);
    if (!R.permitida(cwd) || !fs.existsSync(base)) process.exit(0);
    const ativ = R.lerJsonl(path.join(base, '.atividade.jsonl'), 128 * 1024).filter((e) => e.arquivo && (e.acao === 'editou' || e.acao === 'criou'));
    const arquivos = [...new Set(ativ.map((e) => e.arquivo).reverse())].slice(0, 15);
    const g = spawnSync('git', ['status', '--short'], { windowsHide: true, cwd, encoding: 'utf8', timeout: 3000 });
    const status = g.status === 0 ? g.stdout.split('\n').filter(Boolean).slice(0, 20) : [];
    const motivo = d.hook_event_name === 'PreCompact' ? 'antes de compactar' : 'fim da sessão';
    const t = [`# Retomar (rascunho automático, ${motivo}, ${new Date().toISOString()})`, '',
      'Confira e complete o "retomar aqui" do PROJETO.md. Rascunho fora do git; refeito a cada compactação ou fim de sessão.', '',
      '## Últimos arquivos mexidos', ...(arquivos.length ? arquivos.map((a) => `- ${a}`) : ['- (nenhum registrado)']), '',
      '## Sem commit', ...(status.length ? status.map((s) => `- ${s}`) : ['- (nada, ou fora de um repositório)']), ''].join('\n');
    fs.writeFileSync(path.join(base, '.retomar.md'), t);
  } catch (e) { /* nunca atrapalha */ }
  process.exit(0);
});
