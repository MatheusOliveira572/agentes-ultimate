#!/usr/bin/env node
// Confere o plugin: cada agente gerado tem o protocolo comum idêntico, cabeçalho completo, seções na ordem e tamanho
// razoável; todo agente citado em pacotes.json existe; todo agente pertence a um pacote; cada skill tem cabeçalho.
// Sai 1 se houver erro. Use antes de cada commit.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const erros = [];
const avisos = [];
const comum = fs.readFileSync(path.join(RAIZ, 'fonte', 'comum.md'), 'utf8').trim();
const SECOES = ['## Papel', '## Responsabilidades', '## Fora do escopo', '## Entrada e entrega', '## Referências de mercado',
  '## Método de trabalho', '## Critério de pronto', '## Erros conhecidos', '## Exemplo', '## Protocolo comum'];
const CAMPOS = ['name', 'description', 'tools', 'memory', 'effort', 'color'];

const dirAg = path.join(RAIZ, 'agents');
const agentes = fs.existsSync(dirAg) ? fs.readdirSync(dirAg).filter((f) => f.endsWith('.md')) : [];
if (!agentes.length) erros.push('agents/ vazio: rode node scripts/gerar-agentes.js');

for (const arq of agentes) {
  const t = fs.readFileSync(path.join(dirAg, arq), 'utf8');
  const nome = arq.replace(/\.md$/, '');
  const cab = (t.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  for (const c of CAMPOS) if (!new RegExp('^' + c + ':', 'm').test(cab)) erros.push(`${arq}: falta "${c}" no cabeçalho`);
  const n = (cab.match(/^name:\s*(.+)$/m) || [])[1];
  if (n && n.trim() !== nome) erros.push(`${arq}: name "${n.trim()}" difere do nome do arquivo`);
  const desc = (cab.match(/^description:\s*(.+)$/m) || [])[1] || '';
  if (!/Use para/.test(desc) || !/Não use para/.test(desc)) erros.push(`${arq}: description sem "Use para" e "Não use para"`);
  if (!t.includes(comum)) erros.push(`${arq}: protocolo comum diferente de fonte/comum.md (rode o gerador)`);
  let pos = -1;
  for (const s of SECOES) {
    const p = t.indexOf(s);
    if (p < 0) erros.push(`${arq}: falta a seção "${s}"`);
    else if (p < pos) erros.push(`${arq}: seção "${s}" fora de ordem`);
    else pos = p;
  }
  const especifico = t.length - comum.length;
  const linhas = t.slice(0, t.indexOf('## Protocolo comum')).split('\n').length;
  if (linhas > 90) avisos.push(`${arq}: parte específica com ${linhas} linhas (meta ≤ 90)`);
  if (especifico < 0) erros.push(`${arq}: arquivo menor que o protocolo comum`);
}

const pac = JSON.parse(fs.readFileSync(path.join(RAIZ, 'pacotes', 'pacotes.json'), 'utf8'));
const citados = new Set();
for (const [id, p] of Object.entries(pac.pacotes)) {
  for (const a of p.agentes) {
    citados.add(a);
    if (!agentes.includes(a + '.md')) erros.push(`pacotes.json: pacote "${id}" cita agente inexistente "${a}"`);
  }
  if (!p.sempre && !(p.palavras || []).length && !(p.arquivos || []).length) erros.push(`pacotes.json: pacote "${id}" sem palavras nem arquivos`);
}
for (const a of agentes) if (!citados.has(a.replace(/\.md$/, ''))) erros.push(`${a}: não pertence a nenhum pacote`);

const dirSk = path.join(RAIZ, 'skills');
for (const s of fs.readdirSync(dirSk)) {
  const f = path.join(dirSk, s, 'SKILL.md');
  if (!fs.existsSync(f)) { erros.push(`skills/${s}: sem SKILL.md`); continue; }
  const cab = (fs.readFileSync(f, 'utf8').match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  if (!/^name:\s*/m.test(cab) || !/^description:\s*/m.test(cab)) erros.push(`skills/${s}/SKILL.md: cabeçalho sem name/description`);
}

for (const a of avisos) console.log('AVISO ' + a);
for (const e of erros) console.log('ERRO  ' + e);
console.log(`${agentes.length} agentes, ${Object.keys(pac.pacotes).length} pacotes, ${fs.readdirSync(dirSk).length} skills · ${erros.length} erro(s), ${avisos.length} aviso(s)`);
process.exit(erros.length ? 1 : 0);
