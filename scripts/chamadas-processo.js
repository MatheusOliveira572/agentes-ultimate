// Acha chamadas de processo sem windowsHide: true. No Windows, sem essa opção, cada chamada pode piscar uma janela de console.
// Usado pelo validar.js. Só leitura. Lê o código sem comentários e sem o conteúdo de textos, e só em arquivo que usa child_process.
'use strict';

// Troca comentários e o conteúdo de textos e regex por espaços, mantendo as posições e as quebras de linha.
function mascarar(t) {
  const s = t.split('');
  const apaga = (a, b) => { for (let k = a; k < b && k < s.length; k++) if (s[k] !== '\n') s[k] = ' '; };
  let ultimo = '';
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '/' && t[i + 1] === '/') { const f = t.indexOf('\n', i); const e = f < 0 ? t.length : f; apaga(i, e); i = e - 1; continue; }
    if (c === '/' && t[i + 1] === '*') { const f = t.indexOf('*/', i + 2); const e = f < 0 ? t.length : f + 2; apaga(i, e); i = e - 1; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let k = i + 1;
      for (; k < t.length && t[k] !== c; k++) { if (t[k] === '\\') k++; else if (t[k] === '\n' && c !== '`') break; }
      apaga(i + 1, k); i = k; ultimo = c; continue;
    }
    if (c === '/' && /^[(,=:[!&|?{};\n]?$/.test(ultimo)) { // regex
      let k = i + 1; let cl = false;
      for (; k < t.length && t[k] !== '\n'; k++) { if (t[k] === '\\') k++; else if (t[k] === '[') cl = true; else if (t[k] === ']') cl = false; else if (t[k] === '/' && !cl) break; }
      if (t[k] === '/') { apaga(i + 1, k); i = k; ultimo = '/'; continue; }
    }
    if (!/\s/.test(c)) ultimo = c;
  }
  return s.join('');
}
function fechamento(m, ini) {
  let nivel = 0;
  for (let i = ini; i < m.length; i++) { if (m[i] === '(') nivel++; else if (m[i] === ')' && --nivel === 0) return i; }
  return -1;
}
const CP = /(?:require\s*\(\s*['"`](?:node:)?child_process['"`]\s*\))/;

// Devolve [{ linha, nome, ini, fim }] das chamadas sem a opção. Sem fechar o parêntese também acusa: nunca pula calado.
function semWindowsHide(t) {
  if (!/child_process/.test(t)) return [];
  const m = mascarar(t);
  // Na máscara, o nome do módulo some de dentro das aspas: procura no texto original, na mesma posição.
  const nomes = new Set(['spawnSync', 'spawn', 'execSync', 'execFileSync', 'execFile', 'exec']);
  const objetos = new Set();
  for (const x of t.matchAll(new RegExp('(?:const|let|var)\\s+([\\w$]+)\\s*=\\s*' + CP.source, 'g'))) objetos.add(x[1]);
  for (const x of t.matchAll(new RegExp('(?:const|let|var)?\\s*\\{([^}]*)\\}\\s*=\\s*' + CP.source, 'g'))) {
    for (const par of x[1].split(',')) { const q = par.split(':'); if (q[1] && nomes.has(q[0].trim())) nomes.add(q[1].trim()); }
  }
  const achados = [];
  const ver = (ini, nome) => {
    const fim = fechamento(m, ini);
    const args = fim < 0 ? '' : m.slice(ini, fim);
    const boa = /\bwindowsHide\s*:\s*true\b/.test(args) || /[{,]\s*windowsHide\s*[,}]/.test(args);
    if (!boa) achados.push({ linha: t.slice(0, ini).split('\n').length, nome: fim < 0 ? nome + ' (sem fechar o parêntese)' : nome, ini, fim });
  };
  const so = [...nomes].filter((n) => n !== 'exec').join('|');
  for (const x of m.matchAll(new RegExp('(^|[^\\w$.])(' + so + '|exec)\\s*\\(', 'g'))) {
    const antes = m.slice(Math.max(0, x.index - 12), x.index + x[1].length);
    if (/function\s*$/.test(antes)) continue;
    ver(x.index + x[0].length - 1, x[2]);
  }
  // Pelo objeto do módulo: cp.exec(...), require('child_process').spawnSync(...). exec de regex não entra.
  const metodos = '(spawnSync|spawn|execSync|execFileSync|execFile|exec)';
  for (const o of objetos) for (const x of m.matchAll(new RegExp('(^|[^\\w$.])' + o.replace(/\$/g, '\\$') + '\\s*\\.\\s*' + metodos + '\\s*\\(', 'g'))) ver(x.index + x[0].length - 1, x[2]);
  for (const x of m.matchAll(new RegExp('require\\s*\\(\\s*.\\s*.\\s*\\)\\s*\\.\\s*' + metodos + '\\s*\\(', 'g'))) if (t.slice(x.index, x.index + x[0].length).includes('child_process')) ver(x.index + x[0].length - 1, x[1]);
  return achados;
}

// shell + detached: no Windows, cada programa de console chamado pelo cmd ganha console novo e visível, mesmo com windowsHide
// (revisão final, A-2). Devolve [{ linha, nome }]. Exceção marcada com o comentário "janela de propósito" na linha de cima.
function shellDestacado(t) {
  if (!/child_process/.test(t)) return [];
  const m = mascarar(t);
  const linhas = t.split('\n');
  const achados = [];
  for (const x of m.matchAll(/(^|[^\w$.])(spawnSync|spawn|execFileSync|execFile|execSync|exec)\s*\(/g)) {
    const ini = x.index + x[0].length - 1;
    const fim = fechamento(m, ini);
    const args = fim < 0 ? '' : m.slice(ini, fim);
    if (!/\bshell\s*:\s*true\b/.test(args) || !/\bdetached\s*:\s*true\b/.test(args)) continue;
    const linha = t.slice(0, ini).split('\n').length;
    if (/janela de propósito/.test(linhas[linha - 2] || '')) continue;
    achados.push({ linha, nome: x[2] });
  }
  return achados;
}

module.exports = { semWindowsHide, shellDestacado };
