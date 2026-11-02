#!/usr/bin/env node
// Depois do comando (PostToolUse em Bash/PowerShell): se o HEAD mudou, lê o commit novo. Com segredo, avisa em destaque e diz
// como desfazer antes do push. Pega o que nenhuma leitura de comando prevê (script, alias antigo). Não executa texto do comando.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { pastasCitadas } = require('./trava-comando');
const { lerComPrazo } = require('./leitor-segredos');

const RECENTE_S = 300;
const git = (args, cwd) => execFileSync('git', args, { windowsHide: true, cwd, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const estado = (top) => path.join(os.tmpdir(), 'agentes-ultimate-head', crypto.createHash('sha1').update(top).digest('hex'));

let entrada = '';
process.stdin.on('data', (c) => { entrada += c; });
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(entrada || '{}');
    const sessao = d.cwd || process.cwd();
    const pedidos = [];
    const vistos = new Set();
    for (const p of pastasCitadas((d.tool_input || {}).command, sessao)) {
      let saida;
      try { saida = git(['rev-parse', '--show-toplevel', 'HEAD'], p).split(/\r?\n/); } catch (e) { continue; } // fora de repositório ou sem commit
      const [top, head] = saida;
      if (vistos.has(top)) continue;
      vistos.add(top);
      const f = estado(top);
      let antes = null;
      try { antes = fs.readFileSync(f, 'utf8').trim(); } catch (e) { /* 1ª vez neste repositório */ }
      if (antes === head) continue;
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, head);
      // Sem registro anterior: só o último commit, e só se for de agora.
      if (!antes && Date.now() / 1000 - Number(git(['log', '-1', '--format=%ct'], top)) > RECENTE_S) continue;
      pedidos.push({ tipo: 'intervalo', cwd: top, de: antes, ate: head });
    }
    if (!pedidos.length) process.exit(0);
    lerComPrazo(pedidos, 7000, (r, motivo) => {
      const lista = r ? [...r.ruins.map((x) => `${x} · arquivo sensível`), ...r.altos, ...r.medios] : [];
      let msg = '';
      if (lista.length) {
        const volta = pedidos[0].de || 'HEAD~1';
        msg = `agentes-ultimate: ATENÇÃO, o commit novo tem o que parece segredo ou arquivo sensível (o valor não é mostrado):\n  ${lista.join('\n  ')}\n` +
          `Desfaça ANTES do push: \`git reset --soft ${volta}\`, tire o valor do arquivo, prepare de novo e faça o commit. Não publique. Se já saiu desta máquina, troque o segredo.`;
      } else if (!r || r.incompleta) msg = `agentes-ultimate: não deu para conferir o commit novo (${motivo || 'grande demais'}). A barreira do push lê de novo; confira antes de publicar.`;
      if (msg) process.stdout.write(JSON.stringify({ decision: 'block', reason: msg, systemMessage: msg }));
      process.exit(0);
    });
  } catch (e) { process.exit(0); } // aviso, não barreira: a do push continua valendo
});
