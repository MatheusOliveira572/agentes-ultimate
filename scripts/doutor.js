#!/usr/bin/env node
// Doutor (ideia de pbakaus/impeccable doctor @e89e3ad, © 2025 Paul Bakaus, Apache-2.0; reescrito; alterado por
// agentes-ultimate; licença em terceiros/pbakaus-impeccable/): relata desvios na memória do projeto e NUNCA corrige de carona.
//   node scripts/doutor.js [pasta]
// Olha .claude/base/: mapa que cita arquivo que sumiu, propostas paradas, aprendizados em excesso, memória de agente grande,
// arquivos da base velhos. Sai 0 sem desvio, 1 com desvio. Só leitura.
'use strict';
const fs = require('fs');
const path = require('path');

const pasta = path.resolve(process.argv[2] || '.');
const base = path.join(pasta, '.claude', 'base');
const achados = [];
const ler = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return null; } };
const t0 = Date.now();
const DIA = 864e5;

if (!fs.existsSync(base)) { console.log(`doutor: ${pasta} não tem .claude/base (nada a conferir), 0 desvio, ${Date.now() - t0} ms`); process.exit(0); }

// 1. MAPA.md citando caminho que não existe mais.
const mapa = ler(path.join(base, 'MAPA.md')) || '';
for (const l of mapa.split(/\r?\n/)) {
  const m = l.match(/^[-*]?\s*`?([^\s`→]+[/.][^\s`→]*)`?\s*→/);
  if (m && !/^https?:/.test(m[1]) && !fs.existsSync(path.join(pasta, m[1]))) achados.push(`MAPA.md cita ${m[1]}, que não existe`);
}
// 2. Propostas e aprendizados acumulados.
const prop = ler(path.join(base, 'PROPOSTAS.md')) || '';
const nProp = (prop.match(/^(?:- |## )/gm) || []).length;
if (nProp > 20) achados.push(`PROPOSTAS.md com ${nProp} itens: rode o curador`);
const apr = ler(path.join(base, 'APRENDIZADOS.md')) || '';
const nApr = (apr.match(/^- \[/gm) || []).length;
if (nApr > 60) achados.push(`APRENDIZADOS.md com ${nApr} lições: fundir as duplicadas e promover a regra`);
// 3. PROJETO.md vazio ou velho perto do diário.
const proj = path.join(base, 'PROJETO.md'); const diario = path.join(base, 'DIARIO.md');
if (fs.existsSync(proj) && !/\S/.test((ler(proj) || '').replace(/^#.*$|^>.*$/gm, ''))) achados.push('PROJETO.md sem objetivo preenchido');
if (fs.existsSync(proj) && fs.existsSync(diario) && fs.statSync(diario).mtimeMs - fs.statSync(proj).mtimeMs > 30 * DIA) achados.push('PROJETO.md parado há mais de 30 dias enquanto o DIARIO.md anda');
// 4. Memória de agente acima do tamanho combinado.
const mem = path.join(pasta, '.claude', 'agent-memory');
if (fs.existsSync(mem)) {
  for (const a of fs.readdirSync(mem)) {
    const t = ler(path.join(mem, a, 'MEMORY.md'));
    if (t && t.split('\n').length > 150) achados.push(`memória de ${a} com ${t.split('\n').length} linhas (meta ~150): condensar o histórico`);
  }
}

for (const a of achados) console.log('DESVIO ' + a);
console.log(`doutor: ${pasta}, ${achados.length} desvio(s), nada foi alterado, ${Date.now() - t0} ms`);
process.exit(achados.length ? 1 : 0);
