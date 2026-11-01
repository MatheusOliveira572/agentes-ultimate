#!/usr/bin/env node
// Vigia das fontes (SessionStart). Confere, no máximo 1 vez por semana e em segundo plano, se as fontes de terceiros do
// registro (fontes/fontes.json) mudaram desde o último commit conferido. Só pela API do GitHub e só metadados: commits
// novos, releases, CHANGELOG mexido, arquivos que nós usamos e mudança de licença. Nunca baixa conteúdo nem aplica nada.
// Achou algo: grava fontes/novidades.md e, na sessão seguinte, mostra "N fontes com novidades: rode /atualizar-fontes".
// Sem rede ou com limite da API: silêncio, tenta de novo depois (no mínimo 1 h entre tentativas).
//   node hooks/vigia-fontes.js           início de sessão (mostra o aviso; dispara a conferência se venceu a semana)
//   node hooks/vigia-fontes.js --agora   confere agora, na hora (o que o início de sessão dispara em segundo plano)
// Desligar: AGENTES_ULTIMATE_SEM_VIGIA=1. Teste sem rede: AGENTES_ULTIMATE_VIGIA_SIMULAR=<arquivo.json> com
// { "<caminho da API>": { "status": 200, "body": {...} }, "*": { "erro": "ENOTFOUND" } }.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const REGISTRO = path.join(RAIZ, 'fontes', 'fontes.json');
const NOVIDADES = path.join(RAIZ, 'fontes', 'novidades.md');
const ESTADO = path.join(os.homedir(), '.claude', 'agentes-ultimate', 'vigia-fontes.json');
const SEMANA = 7 * 24 * 60 * 60 * 1000;
const HORA = 60 * 60 * 1000;
const PERMISSIVAS = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'Unlicense', 'CC0-1.0', 'MIT-0']);

const lerJson = (f, p) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return p; } };
const gravarJson = (f, o) => { try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2)); } catch (e) { /* sem efeito */ } };

class SemRede extends Error {}

function pedir(caminho) {
  const sim = process.env.AGENTES_ULTIMATE_VIGIA_SIMULAR;
  if (sim) {
    const tabela = lerJson(sim, {});
    const r = tabela[caminho] || tabela['*'] || { status: 404, body: {} };
    if (r.erro) return Promise.reject(new SemRede(r.erro));
    return Promise.resolve({ status: r.status, body: r.body });
  }
  return new Promise((ok, falha) => {
    const req = https.get({ host: 'api.github.com', path: caminho, headers: { 'User-Agent': 'agentes-ultimate-vigia', Accept: 'application/vnd.github+json' }, timeout: 10000 }, (res) => {
      let s = ''; res.on('data', (d) => { s += d; }).on('end', () => { let body = null; try { body = JSON.parse(s); } catch (e) { /* vazio */ } ok({ status: res.statusCode, body }); });
    });
    req.on('timeout', () => req.destroy(new SemRede('tempo esgotado')));
    req.on('error', (e) => falha(new SemRede(e.message)));
  });
}

async function conferirFonte(f) {
  const repo = await pedir(`/repos/${f.repo}`);
  if (repo.status === 403 || repo.status === 429) throw new SemRede('limite da API');
  if (repo.status === 404) return { repo: f.repo, sumiu: true, afetados: f.arquivos.map((a) => a.destino) };
  if (repo.status !== 200 || !repo.body) throw new SemRede('resposta ' + repo.status);
  const licenca = (repo.body.license && repo.body.license.spdx_id) || null;
  const nov = { repo: f.repo, commits: 0, mensagens: [], releases: [], changelog: false, afetados: [], licenca: null };
  if (licenca !== f.licenca) nov.licenca = { antes: f.licenca, agora: licenca, restritiva: !PERMISSIVAS.has(licenca) };
  const branch = f.branch || repo.body.default_branch || 'main';
  const cmp = await pedir(`/repos/${f.repo}/compare/${f.ultimo_conferido}...${encodeURIComponent(branch)}`);
  if (cmp.status === 403 || cmp.status === 429) throw new SemRede('limite da API');
  if (cmp.status === 200 && cmp.body) {
    nov.commits = cmp.body.ahead_by || 0;
    nov.mensagens = (cmp.body.commits || []).slice(-5).map((c) => String((c.commit && c.commit.message) || '').split('\n')[0].slice(0, 100));
    const mexidos = (cmp.body.files || []).map((x) => x.filename);
    nov.changelog = mexidos.some((n) => /(^|\/)CHANGELOG/i.test(n));
    nov.afetados = f.arquivos.filter((a) => mexidos.includes(a.origem)).map((a) => `${a.origem} → ${a.destino}`);
  }
  const rel = await pedir(`/repos/${f.repo}/releases?per_page=5`);
  if (rel.status === 200 && Array.isArray(rel.body)) nov.releases = rel.body.filter((r) => r.published_at && r.published_at.slice(0, 10) > (f.conferido_em || '')).map((r) => r.tag_name);
  const mudou = nov.commits > 0 || nov.releases.length || nov.licenca;
  return mudou ? nov : null;
}

function escreverNovidades(lista, quando) {
  if (!lista.length) { try { fs.rmSync(NOVIDADES, { force: true }); } catch (e) { /* sem efeito */ } return; }
  const l = [`# Novidades das fontes (${quando})`, '',
    `<!-- vigia: ${lista.length} -->`,
    'Gerado por hooks/vigia-fontes.js só com metadados da API do GitHub. Nada foi baixado nem aplicado. Para tratar, rode',
    '`/atualizar-fontes`: o pesquisador separa correção, melhoria e função nova, confere a licença e grava a proposta; só',
    'o que o usuário aprovar é aplicado.', ''];
  for (const n of lista) {
    l.push(`## ${n.repo}`);
    if (n.sumiu) l.push('- **O repositório não responde mais (404).** Mantenha a cópia que temos e veja com o usuário.');
    if (n.licenca) l.push(n.licenca.restritiva
      ? `- **ATENÇÃO: a licença mudou de ${n.licenca.antes || 'nenhuma'} para ${n.licenca.agora || 'nenhuma'}, que não é permissiva.** Não traga nada novo desta fonte; o que já temos segue a licença do commit usado. Leve ao advogado-contratos.`
      : `- Licença mudou de ${n.licenca.antes || 'nenhuma'} para ${n.licenca.agora}.`);
    if (n.commits) l.push(`- ${n.commits} commit(s) novo(s) desde o conferido${n.mensagens && n.mensagens.length ? ': ' + n.mensagens.map((m) => `"${m}"`).join('; ') : ''}.`);
    if (n.releases && n.releases.length) l.push(`- Releases novas: ${n.releases.join(', ')}.`);
    if (n.changelog) l.push('- O CHANGELOG mudou.');
    l.push(n.afetados && n.afetados.length ? `- Arquivos que usamos e mudaram: ${n.afetados.join('; ')}.` : '- Nenhum arquivo que usamos mudou.');
    l.push('');
  }
  try { fs.mkdirSync(path.dirname(NOVIDADES), { recursive: true }); fs.writeFileSync(NOVIDADES, l.join('\n')); } catch (e) { /* sem efeito */ }
}

async function conferirAgora() {
  const reg = lerJson(REGISTRO, null);
  const est = lerJson(ESTADO, {});
  const agora = new Date();
  gravarJson(ESTADO, { ...est, ultimaTentativa: agora.toISOString() });
  if (!reg || !Array.isArray(reg.fontes)) return;
  const lista = [];
  try {
    for (const f of reg.fontes.filter((x) => x.vigiar !== false && /^[\w.-]+\/[\w.-]+$/.test(x.repo || ''))) {
      const n = await conferirFonte(f);
      if (n) lista.push(n);
    }
  } catch (e) {
    if (e instanceof SemRede) return; // silêncio: tenta de novo na próxima janela
    throw e;
  }
  escreverNovidades(lista, agora.toISOString().slice(0, 10));
  gravarJson(ESTADO, { ...lerJson(ESTADO, {}), ultimaConferencia: agora.toISOString(), fontesComNovidades: lista.length });
}

function inicioDeSessao() {
  let aviso = '';
  try {
    const t = fs.readFileSync(NOVIDADES, 'utf8');
    const n = Number((t.match(/<!-- vigia: (\d+) -->/) || [])[1] || 0);
    if (n) aviso = `${n} fonte${n > 1 ? 's' : ''} com novidades: rode /atualizar-fontes`;
    if (/ATENÇÃO: a licença mudou/.test(t)) aviso += ' (ATENÇÃO: licença mudou para não permissiva; veja fontes/novidades.md)';
  } catch (e) { /* sem novidades */ }
  const est = lerJson(ESTADO, {});
  const agora = Date.now();
  const venceu = !est.ultimaConferencia || agora - Date.parse(est.ultimaConferencia) >= SEMANA;
  const respiro = !est.ultimaTentativa || agora - Date.parse(est.ultimaTentativa) >= HORA;
  if (venceu && respiro) {
    try { const p = spawn(process.execPath, [__filename, '--agora'], { detached: true, stdio: 'ignore', windowsHide: true }); p.unref(); } catch (e) { /* tenta depois */ }
  }
  if (aviso) process.stdout.write(JSON.stringify({ systemMessage: aviso }));
}

if (process.env.AGENTES_ULTIMATE_SEM_VIGIA === '1') process.exit(0);
if (process.argv.includes('--agora')) conferirAgora().catch(() => {}).finally(() => process.exit(0));
else { try { inicioDeSessao(); } catch (e) { /* nunca trava a sessão */ } process.exit(0); }
