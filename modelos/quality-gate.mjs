#!/usr/bin/env node
// Adaptado de addyosmani/agent-skills/skills/constraint-driven-development/scripts/quality-gate.mjs @301b02b,
// © 2025 Addy Osmani, MIT. Alterações: mensagens em português e linha-resumo; alterado por agentes-ultimate.
// Licença em terceiros/addyosmani-agent-skills/.
//
// Portão de qualidade sobre o relatório JSON de um scanner que às vezes sai 0 mesmo com achado (Semgrep, axe).
// Modelo para copiar para o projeto do usuário (ex.: scripts/quality-gate.mjs) e chamar no CI ou no gancho do projeto.
//   node quality-gate.mjs semgrep relatorio-semgrep.json
//   node quality-gate.mjs axe relatorio-axe.json
// Sai 0: nada bloqueante; 1: achado bloqueante; 2: relatório ilegível, incompleto ou uso errado.
import { readFileSync } from 'node:fs';

const [ferramenta, arquivo, ...sobra] = process.argv.slice(2);
if (!['semgrep', 'axe'].includes(ferramenta) || !arquivo || sobra.length) {
  console.error('quality-gate: uso: node quality-gate.mjs <semgrep|axe> <relatorio.json>');
  process.exit(2);
}

try {
  const rel = JSON.parse(readFileSync(arquivo, 'utf8'));
  let niveis;
  let validos;
  let bloqueiam;
  if (ferramenta === 'semgrep') {
    // Varredura com erro ou sem nenhum arquivo lido não prova nada: é relatório incompleto, não "0 achado".
    if (!Array.isArray(rel?.results) || !Array.isArray(rel.errors) || rel.errors.length
        || !Array.isArray(rel.paths?.scanned) || !rel.paths.scanned.length) {
      throw new Error('varredura incompleta');
    }
    niveis = rel.results.map((a) => a?.extra?.severity);
    validos = ['INFO', 'WARNING', 'ERROR', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    bloqueiam = ['ERROR', 'HIGH', 'CRITICAL'];
  } else {
    // Uma página de erro do navegador pode parecer uma varredura de acessibilidade limpa.
    if (!Array.isArray(rel) || !rel.length
        || rel.some((p) => !Array.isArray(p?.violations) || typeof p.url !== 'string' || !['http:', 'https:'].includes(new URL(p.url).protocol))) {
      throw new Error('varredura incompleta');
    }
    niveis = rel.flatMap((p) => p.violations.map((a) => a?.impact));
    validos = ['minor', 'moderate', 'serious', 'critical'];
    bloqueiam = ['serious', 'critical'];
  }
  if (niveis.some((n) => !validos.includes(n))) throw new Error('gravidade desconhecida');
  const n = niveis.filter((x) => bloqueiam.includes(x)).length;
  console.log(`quality-gate ${ferramenta}: ${niveis.length} achado(s), ${n} bloqueante(s)`);
  process.exitCode = n ? 1 : 0;
} catch {
  console.error('quality-gate: relatório ilegível, incompleto ou não suportado; confira a saída do scanner');
  process.exitCode = 2;
}
