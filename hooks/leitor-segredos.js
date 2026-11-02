#!/usr/bin/env node
// Leitura de segredos para as travas. Roda como processo filho, com prazo no pai: leitura lenta (antivírus, commit enorme)
// nunca segura o gancho, e prazo vencido vira pergunta. Nunca executa texto do comando: só execFile do git com argumentos
// fixos, sem shell; caminho vindo do comando só entra depois de "--". A saída diz arquivo:linha e o tipo, nunca o valor.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

// .env.example, .sample, .template e .dist são modelos que o checklist manda ter no git: o nome não bloqueia, o conteúdo é lido.
const FIXOS = [/(^|\/)\.env(?!\.(?:example|sample|template|dist)$)(\..*)?$/i, /\.(pem|key|pfx|p12)$/i, /(^|\/)(id_rsa|id_ed25519)$/, /credenciais|credentials|secrets?\./i];

// Alta certeza = formato conhecido (prefixo do provedor, cabeçalho seguido do corpo da chave, texto de conexão com senha de
// verdade). Média = parece segredo, mas pode ser exemplo. `senha` marca o grupo que é o valor: marcador como <senha> não conta.
const ALTOS = [
  { tipo: 'chave privada (PEM)', re: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----(?:\s|\\n)+[A-Za-z0-9+/=]{40,}/ },
  { tipo: 'chave de acesso da AWS', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { tipo: 'chave secreta da AWS', re: /\baws_secret_access_key\b["']?\s*[:=]\s*["']?([A-Za-z0-9/+]{40})(?![A-Za-z0-9/+])/i, senha: 1 },
  { tipo: 'token do GitHub', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/ },
  { tipo: 'chave da Anthropic', re: /\bsk-ant-[A-Za-z0-9_-]{32,}/ },
  { tipo: 'chave da OpenAI', re: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{32,}|\bsk-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}/ },
  { tipo: 'chave de API do Google', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { tipo: 'token do Slack', re: /\bxox[abposr]-[0-9A-Za-z-]{10,}/ },
  { tipo: 'chave secreta do Stripe', re: /\b[rs]k_live_[0-9A-Za-z]{20,}\b/ },
  { tipo: 'token do npm', re: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { tipo: 'chave de conta do Azure Storage', re: /\bAccountKey=[A-Za-z0-9+/]{40,}={0,2}/ },
  { tipo: 'texto de conexão com senha', re: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|rediss?|amqps?|mssql|sqlserver):\/\/[^\s:/@'"]+:([^\s@'"/]+)@[^\s'"]+/i, senha: 1 },
  { tipo: 'texto de conexão com senha', re: /\b(?:Server|Data Source|Host)\s*=[^;\n]{1,200};.{0,500}?\b(?:Password|Pwd)\s*=\s*([^;'"\s]+)/i, senha: 1 },
  { tipo: 'texto de conexão com senha', re: /\b(?:Password|Pwd)\s*=\s*([^;'"\s]+)\s*;.{0,500}?\b(?:Server|Data Source|Host)\s*=/i, senha: 1 },
];
const letraENumero = (v) => /\d/.test(v) && /[A-Za-z]/.test(v);
const MEDIOS = [
  { tipo: 'senha, chave ou token atribuído no código', re: /(?:^|[^A-Za-z0-9])(?:api[_-]?key|apikey|client[_-]?secret|secret[_-]?access[_-]?key|secret|access[_-]?token|auth[_-]?token|token|senha|password|passwd|pwd)["']?\s*[:=]\s*["']([^"'\s]{12,})["']/i, senha: 1, valor: letraENumero },
  // Sem aspas: o nome tem de dizer que é segredo, e chamada, propriedade ou lista não é valor.
  { tipo: 'senha, chave ou token atribuído sem aspas', re: /(?:^|[^A-Za-z0-9])[A-Za-z0-9_]*(?:api[_-]?key|client[_-]?secret|secret[_-]?key|secret[_-]?access[_-]?key|secret|access[_-]?token|auth[_-]?token|password)\s*[:=]\s*([^\s"'#]{12,})/i, senha: 1, valor: (v) => letraENumero(v) && !/[().[\]{},$]/.test(v) },
  { tipo: 'token JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];
// Pontuação colada e "\n" literal não são parte do valor; o que começa com barra invertida é valor mesmo.
const limpaValor = (v) => { const s = String(v); return (s.replace(/\\[nrt"'].*$/, '') || s).replace(/[.,;:`)\]]+$/, ''); };
const soX = (v) => /^[^xX]{0,20}[xX]{16,}=*$/.test(String(v).replace(/^xox[a-z]-/i, ''));
const LOCAL = /^(?:localhost|127\.0\.0\.1|\[?::1\]?|\(local\)|\(localdb\).*|\.)$/i;
// Texto de conexão que parece exemplo de desenvolvimento: pergunta em vez de bloquear. O servidor é lido pelo nome inteiro.
function exemploDeDev(trecho, v) {
  const host = (trecho.match(/:\/\/[^@\s]*@([^:/?\s'"]+)/) || trecho.match(/\b(?:Server|Data Source|Host)\s*=\s*([^;,\s'"]+)/i) || [])[1];
  if (host && LOCAL.test(host)) return true;
  if (/^(?:my)?pass(?:word)?\d*$/i.test(v)) return true;
  const u = (trecho.match(/:\/\/([^:/@\s]+):/) || trecho.match(/\b(?:User(?: Id)?|Uid|Username)\s*=\s*([^;'"\s]+)/i) || [])[1];
  return !!u && u.toLowerCase() === String(v).toLowerCase();
}
const marcador = (v0) => { const v = limpaValor(v0); return !/[A-Za-z0-9]/.test(v) || soX(v) || /^(\.{2,}|\*+|x{3,}|<[^>]*>|\$\{[^}]*\}|\$\(?\w+\)?|\{\{?[^}]*\}?\}|%[sd]|\[[^\]]*\])$/i.test(v) ||
  /^(senha|password|pass|pwd|secret|changeme|sua[_-]?senha|your[_-]?password|usuario|user)$/i.test(v) || /process\.env|os\.environ|getenv|EXAMPLE|exemplo/i.test(v); };

// Nome entre aspas no diff (aspas, barra, tabulação): volta ao nome real.
function desaspar(s) {
  if (!s.startsWith('"')) return s;
  const bytes = [];
  for (let i = 1; i < s.length - 1; i++) {
    if (s[i] !== '\\') { bytes.push(...Buffer.from(s[i])); continue; }
    const o = s.slice(i + 1, i + 4);
    if (/^[0-7]{3}$/.test(o)) { bytes.push(parseInt(o, 8)); i += 3; } else { const e = { n: 10, t: 9, r: 13 }[s[i + 1]]; bytes.push(e || s.charCodeAt(i + 1)); i++; }
  }
  return Buffer.from(bytes).toString('utf8');
}
// Linhas acrescentadas do diff (-U0), com arquivo e número da linha. Conta o bloco: linha de conteúdo nunca vira cabeçalho.
function acrescentadas(diff) {
  const out = []; let arq = null; let n = 0; let resta = 0;
  for (const l of diff.split('\n')) {
    if (resta > 0 && l.startsWith('+')) { if (arq && arq !== '/dev/null') out.push({ arq, linha: n, texto: l.slice(1) }); n++; resta--; continue; }
    if (l.startsWith('+++ ')) { arq = desaspar(l.slice(4).trim().replace(/\t.*$/, '')).replace(/^b\//, ''); continue; }
    const h = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))?/);
    if (h) { n = Number(h[1]); resta = h[2] === undefined ? 1 : Number(h[2]); }
  }
  return out;
}
const TETO_BYTES = Number(process.env.AGENTES_ULTIMATE_TRAVA_TETO) || 24 * 1024 * 1024;

function achar(linhas, regras, fracos) {
  const achados = [];
  const porArq = {};
  for (const x of linhas) (porArq[x.arq] = porArq[x.arq] || []).push(x);
  for (const [arq, ls] of Object.entries(porArq)) {
    const texto = ls.map((x) => x.texto).join('\n');
    const inicios = [0];
    for (let i = texto.indexOf('\n'); i >= 0; i = texto.indexOf('\n', i + 1)) inicios.push(i + 1);
    const linhaDe = (pos) => { let a = 0, b = inicios.length - 1; while (a < b) { const m = (a + b + 1) >> 1; if (inicios[m] <= pos) a = m; else b = m - 1; } return a; };
    for (const r of regras) {
      const re = new RegExp(r.re.source, r.re.flags.includes('g') ? r.re.flags : r.re.flags + 'g');
      let m;
      while ((m = re.exec(texto))) {
        const v = r.senha ? m[r.senha] : m[0];
        if (!marcador(v) && (!r.valor || r.valor(v))) {
          if (r.senha && r.tipo === 'texto de conexão com senha' && exemploDeDev(texto.slice(m.index, m.index + m[0].length + 200).split('\n')[0], limpaValor(v))) {
            fracos.push(`${arq}:${ls[linhaDe(m.index)].linha} · texto de conexão que parece exemplo de desenvolvimento`);
          } else achados.push(`${arq}:${ls[linhaDe(m.index)].linha} · ${r.tipo}`);
        }
        if (!m[0].length) re.lastIndex++;
      }
    }
  }
  return [...new Set(achados)];
}

function padroesDoProjeto(cwd) {
  try {
    return fs.readFileSync(path.join(cwd, '.claude', 'base', 'sensiveis.txt'), 'utf8')
      .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
      .map((g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*') + '$', 'i'));
  } catch (e) { return []; }
}

// Git com argumentos fixos e sem shell. As opções de -c tiram o que poderia rodar programa da configuração durante a leitura.
// Opções que desligam o que o git pode executar ao ler: verificação de assinatura (gpg.program), fsmonitor, diff externo, pager e
// trace2. Não cobre filtro "clean" de .gitattributes na leitura da pasta de trabalho (git diff): ver o limite no README.
const SEGURO = ['-c', 'core.quotepath=false', '-c', 'core.fsmonitor=false', '-c', 'log.showroot=true', '-c', 'log.showSignature=false',
  '-c', 'gpg.program=', '-c', 'gpg.ssh.program=', '-c', 'gpg.x509.program=', '-c', 'diff.external=', '-c', 'core.pager=cat',
  '-c', 'trace2.normalTarget=', '-c', 'trace2.eventTarget=', '-c', 'trace2.perfTarget=', '--no-pager'];
const DIFF = ['-U0', '--no-color', '--no-ext-diff', '--no-textconv'];
const lista = (t) => t.split('\0').map((s) => s.trim()).filter(Boolean);

function ler(p, r) {
  const roda = (args) => {
    try {
      return execFileSync('git', [...SEGURO, ...args], { windowsHide: true, cwd: p.cwd, encoding: 'utf8', maxBuffer: TETO_BYTES + 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (e) {
      // Estouro de tamanho: leitura incompleta. Git que falha por outro motivo (fora de um repositório): o commit também falha.
      if (e.code === 'ENOBUFS') r.incompleta = true;
      return '';
    }
  };
  const nomesDe = (args) => lista(roda(args));
  let diff = ''; let nomes = []; const novos = [];
  if (p.tipo === 'preparado') {
    diff = roda(['diff', '--cached', ...DIFF]);
    nomes = nomesDe(['diff', '--cached', '--name-only', '-z']);
  } else if (p.tipo === 'commit') {
    const ps = p.caminhos.length ? ['--', ...p.caminhos] : [];
    diff = roda(['diff', '--cached', ...DIFF, ...(p.incluir ? [] : ps)]);
    nomes = nomesDe(['diff', '--cached', '--name-only', '-z', ...(p.incluir ? [] : ps)]);
    if (p.todos || ps.length) {
      diff += '\n' + roda(['diff', ...DIFF, ...(p.todos ? [] : ps)]);
      nomes.push(...nomesDe(['diff', '--name-only', '-z', ...(p.todos ? [] : ps)]));
    }
    for (const a of p.adds) {
      const pa = a.caminhos.length ? ['--', ...a.caminhos] : [];
      diff += '\n' + roda(['diff', ...DIFF, ...pa]);
      nomes.push(...nomesDe(['diff', '--name-only', '-z', ...pa]));
      // "git add -A" sem caminho leva o repositório inteiro, mesmo de uma subpasta.
      if (!a.soRastreados) novos.push(...nomesDe(['ls-files', '--others', '--exclude-standard', '-z', '--', ...(a.caminhos.length ? a.caminhos : [':/'])]));
    }
  } else { // naoEnviados, intervalo: só objetos do git; nada da pasta de trabalho é tocado.
    const alvo = p.tipo === 'intervalo' ? (p.de ? ['-n', '50', `${p.de}..${p.ate}`] : ['-n', '1', p.ate]) : ['HEAD', '--branches', '--tags', '--not', '--remotes'];
    diff = roda(['log', '-p', '--no-show-signature', '--format=', ...DIFF, ...alvo]);
    nomes = nomesDe(['log', '--format=', '--name-only', '-z', ...alvo]);
  }
  if (diff.length > TETO_BYTES) { r.incompleta = true; diff = diff.slice(0, TETO_BYTES); }
  const linhas = acrescentadas(diff);
  let lidos = diff.length;
  for (const f of [...new Set(novos)]) {
    nomes.push(f);
    if (f.endsWith('/')) continue; // repositório dentro do repositório
    try {
      const abs = path.resolve(p.cwd, f);
      const tam = fs.statSync(abs).size;
      if (lidos + tam > TETO_BYTES) { r.incompleta = true; continue; }
      lidos += tam;
      const b = fs.readFileSync(abs);
      if (b.subarray(0, 8000).includes(0)) continue;
      b.toString('utf8').split('\n').forEach((texto, n) => linhas.push({ arq: f, linha: n + 1, texto }));
    } catch (e) { r.incompleta = true; } // não ler nunca é o mesmo que estar limpo
  }
  const regras = FIXOS.concat(padroesDoProjeto(p.cwd));
  const fracos = [];
  r.ruins.push(...new Set(nomes.filter((f) => regras.some((x) => x.test(f.replace(/\\/g, '/'))))));
  r.altos.push(...achar(linhas, ALTOS, fracos));
  r.medios.push(...achar(linhas, MEDIOS, fracos), ...fracos);
}

// Pedidos: [{ tipo: preparado|commit|naoEnviados|intervalo, cwd, ... }]. Cada lista volta limitada, para o JSON não ficar enorme.
function lerTudo(pedidos) {
  const r = { ruins: [], altos: [], medios: [], incompleta: false };
  for (const p of pedidos) ler(p, r);
  for (const k of ['ruins', 'altos', 'medios']) { const u = [...new Set(r[k])]; r[k] = u.slice(0, 20); if (u.length > 20) r[k].push(`... e mais ${u.length - 20}`); }
  return r;
}

// No pai: roda este arquivo como filho, com prazo. cb(resultado | null, motivo). O pai nunca espera leitura.
function lerComPrazo(pedidos, prazoMs, cb) {
  const ms = Number(process.env.AGENTES_ULTIMATE_TRAVA_PRAZO_MS) || prazoMs;
  let fim = false; let out = '';
  const terminar = (r, motivo) => { if (fim) return; fim = true; clearTimeout(t); try { filho.kill(); } catch (e) { /* já saiu */ } cb(r, motivo); };
  const filho = spawn(process.execPath, [__filename], { windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] });
  const t = setTimeout(() => terminar(null, `a leitura não terminou em ${ms / 1000} s`), ms);
  filho.on('error', () => terminar(null, 'a leitura não pôde começar'));
  filho.stdin.on('error', () => {});
  filho.stdout.on('data', (c) => { out += c; });
  filho.on('close', () => { try { terminar(JSON.parse(out)); } catch (e) { terminar(null, 'a leitura falhou'); } });
  filho.stdin.end(JSON.stringify(pedidos));
}

if (require.main === module) {
  let e = '';
  process.stdin.on('data', (c) => { e += c; });
  process.stdin.on('end', () => { process.stdout.write(JSON.stringify(lerTudo(JSON.parse(e)))); });
}
module.exports = { lerComPrazo, SEGURO };
