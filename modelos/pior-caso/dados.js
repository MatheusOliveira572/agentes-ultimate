// Adaptado de emilkowalski/skills/skills/break-ui/SKILL.md @a81dbca, © 2026 Emil Kowalski, MIT. Alterações: reescrito
// como modelo mínimo; alterado por agentes-ultimate. Licença em terceiros/emilkowalski-skills/.
//
// Alternador "dados de demonstração / pior caso" SÓ PARA DESENVOLVIMENTO. O pior caso entra pela mesma porta da
// demonstração (troque a fixture, nunca o componente): ?dados=pior na URL, ou escolherDados('pior') no Node.
// Troque os exemplos abaixo pelos campos e limites reais do seu esquema (cite arquivo:linha de cada limite).
'use strict';
const demonstracao = [
  { nome: 'Ana Souza', email: 'ana.souza@exemplo.com', papel: 'Analista', status: 'ativo', valor: 1250.5, quando: '2026-10-28' },
  { nome: 'Bruno Lima', email: 'bruno@exemplo.com', papel: 'Gerente', status: 'convidado', valor: 980, quando: '2026-10-30' },
];
// Plausível, nunca "aaaa": cada linha mistura várias falhas do catálogo ao mesmo tempo.
const pior = [
  { nome: 'Maria Aparecida dos Santos Albuquerque de Vasconcellos Ribeiro', email: 'maria.aparecida.dos.santos.albuquerque@subdominio.empresa-exemplo.com.br', papel: '', status: 'expirado', valor: -1234567.89, quando: '1999-12-31' },
  { nome: 'Lu', email: 'l@x.co', papel: 'Coordenadora de Planejamento Estratégico e Relações Institucionais', status: 'ativo', valor: 0, quando: '2026-11-01' },
  { nome: 'José "Zé" O’Connor <adm>', email: 'jose+teste@exemplo.com', papel: null, status: 'convidado', valor: 1, quando: '2030-01-01' },
  { nome: 'محمد الأحمد', email: 'mohammed@exemplo.com', papel: 'Analista 😀', status: 'ativo', valor: 99999999999.99, quando: '2026-02-29' },
];
const variacoes = { vazio: [], um: [demonstracao[0]], muitos: Array.from({ length: 1000 }, (_, i) => ({ ...demonstracao[i % 2], nome: `${demonstracao[i % 2].nome} ${i + 1}` })) };

function escolherDados(modo) {
  if (modo === 'pior') return pior;
  if (variacoes[modo]) return variacoes[modo];
  return demonstracao;
}
if (typeof module !== 'undefined') module.exports = { escolherDados, demonstracao, pior, variacoes };
if (typeof window !== 'undefined') window.escolherDados = () => escolherDados(new URLSearchParams(window.location.search).get('dados'));
