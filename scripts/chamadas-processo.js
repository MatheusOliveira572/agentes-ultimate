// Acha chamadas de processo (spawn, spawnSync, exec, execSync, execFile, execFileSync) sem `windowsHide`. No Windows, sem
// essa opção, cada chamada pode piscar uma janela de console na tela do usuário. Usado pelo validar.js. Só leitura.
'use strict';
// Com ponto também conta (require('child_process').spawnSync); só o .exec( fica de fora, porque é o método de regex.
const PADRAO = /(^|[^\w])(spawnSync|spawn|execSync|execFileSync|execFile|(?<!\.)exec)\(/g;

// Posição do ")" que fecha o "(" em `ini`, pulando textos entre aspas e crases.
function fechamento(t, ini) {
  let nivel = 0;
  let aspa = null;
  for (let i = ini; i < t.length; i++) {
    const c = t[i];
    if (aspa) {
      if (c === '\\') i++;
      else if (c === aspa) aspa = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') aspa = c;
    else if (c === '(') nivel++;
    else if (c === ')' && --nivel === 0) return i;
  }
  return -1;
}

// Devolve [{ linha, nome, ini, fim }] das chamadas sem windowsHide. Definição de função não conta.
function semWindowsHide(t) {
  const achados = [];
  for (const m of t.matchAll(PADRAO)) {
    const ini = m.index + m[0].length - 1;
    const antes = t.slice(Math.max(0, m.index - 12), m.index + m[1].length);
    if (/function\s*$/.test(antes)) continue;
    const fim = fechamento(t, ini);
    if (fim < 0 || t.slice(ini, fim).includes('windowsHide')) continue;
    achados.push({ linha: t.slice(0, ini).split('\n').length, nome: m[2], ini, fim });
  }
  return achados;
}

module.exports = { semWindowsHide };
