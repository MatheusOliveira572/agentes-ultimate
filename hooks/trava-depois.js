#!/usr/bin/env node
// Depois do comando (PostToolUse e PostToolUseFailure em Bash/PowerShell: o comando que faz o commit e depois falha também passa aqui): se o HEAD mudou, lê o commit novo. Com segredo, avisa em destaque e diz
// como desfazer antes do push. Pega o que nenhuma leitura de comando prevê (script, alias antigo). Não executa texto do comando.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { pastasCitadas } = require('./trava-comando');
const { lerComPrazo, SEGURO } = require('./leitor-segredos');

const RECENTE_S = 300;
// Só nas pastas de dentro da sessão (pastasCitadas), com as opções que desligam o que o git executaria ao ler.
const git = (args, cwd) => execFileSync('git', [...SEGURO, ...args], { windowsHide: true, cwd, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
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
      if (!antes && Date.now() / 1000 - Number(git(['log', '-1', '--no-show-signature', '--format=%ct'], top)) > RECENTE_S) continue;
      pedidos.push({ tipo: 'intervalo', cwd: top, de: antes, ate: head });
    }
    if (!pedidos.length) process.exit(0);
    lerComPrazo(pedidos, 7000, (r, motivo) => {
      const lista = r ? [...r.ruins.map((x) => `${x} · arquivo sensível`), ...r.altos, ...r.medios] : [];
      let msg = '';
      if (lista.length) {
        const volta = pedidos[0].de || 'HEAD~1';
        // O commit já está num remoto? (o push pode ter rodado no mesmo comando)
        let remotos = '';
        try { remotos = git(['branch', '-r', '--contains', pedidos[0].ate], pedidos[0].cwd); } catch (e) { /* sem remoto */ }
        // Sem ramo de rastreio que contenha o commit, mas com push no comando (para caminho ou URL): pode já ter saído.
        const comPush = /\bgit\b[\s\S]*\bpush\b/i.test(String((d.tool_input || {}).command || '').replace(/['"\\`^]/g, ''));
        msg = `agentes-ultimate: ATENÇÃO, o commit novo tem o que parece segredo ou arquivo sensível (o valor não é mostrado):\n  ${lista.join('\n  ')}\n` +
          (remotos ? `Já foi publicado (${remotos.split(/\s+/).filter(Boolean).slice(0, 3).join(', ')}): troque a chave agora (crie a nova, ponha no ar, revogue a antiga e prove que a antiga falha). Desfazer o commit aqui não tira do remoto; limpar o histórico de lá é com quem cuida do repositório.`
            : comPush ? 'Este comando teve push: o commit pode já ter sido publicado. Troque a chave agora (crie a nova, ponha no ar, revogue a antiga e prove que a antiga falha) e, se não saiu, desfaça o commit antes de outro push.'
            : `Desfaça ANTES do push: \`git reset --soft ${volta}\`, tire o valor do arquivo, prepare de novo e faça o commit. Não publique. Se já saiu desta máquina, troque o segredo.`);
      } else if (!r || r.incompleta) msg = `agentes-ultimate: não deu para conferir o commit novo (${motivo || 'grande demais'}). A barreira do push lê de novo; confira antes de publicar.`;
      if (msg) process.stdout.write(JSON.stringify({ decision: 'block', reason: msg, systemMessage: msg }));
      process.exit(0);
    });
  } catch (e) { process.exit(0); } // aviso, não barreira: a do push continua valendo
});
