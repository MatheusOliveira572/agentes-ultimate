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
  // Progresso para a barra e o mapa (0.7.0): o passo está no protocolo e o agente consegue gravar o arquivo.
  if (!/\.claude\/base\/\.progresso\/<seu nome>-<código>\.json/.test(t)) erros.push(`${arq}: falta o passo de gravar o progresso (.claude/base/.progresso/)`);
  if (!/^tools:.*\bWrite\b/m.test(cab)) erros.push(`${arq}: sem a ferramenta Write (precisa gravar o progresso e a memória)`);
  let pos = -1;
  for (const s of SECOES) {
    const p = t.indexOf(s);
    if (p < 0) erros.push(`${arq}: falta a seção "${s}"`);
    else if (p < pos) erros.push(`${arq}: seção "${s}" fora de ordem`);
    else pos = p;
  }
  // Padrão de excelência: 3 a 5 referências das melhores da função, cada uma com link aberto (nada "a confirmar").
  const refs = (t.split('## Referências de mercado')[1] || '').split('## Método de trabalho')[0];
  const itens = refs.split(/\n(?=- \*\*)/).filter((x) => /^\s*-?\s*\*\*/.test(x.trim()) || x.trim().startsWith('- **'));
  const comLink = itens.filter((x) => /Fonte:\s*https:\/\/\S+/.test(x) && /\*\*Aqui:\*\*/.test(x));
  if (comLink.length < 3 || itens.length > 5) erros.push(`${arq}: referências de mercado ${comLink.length} com "Aqui:" e "Fonte: https://" (exigido 3 a 5)`);
  if (/a confirmar/i.test(refs)) erros.push(`${arq}: referência marcada "(a confirmar)": abra a fonte ou troque a referência`);
  // Empresas DIFERENTES (pela 1ª palavra do nome: "Google (x)" e "Google People Ops" contam como uma só).
  const empresas = new Set(comLink.filter((x) => /\[empresa\]/.test(x))
    .map((x) => ((x.match(/\*\*([^*]+)\*\*/) || [])[1] || '').replace(/\(.*$/, '').trim().split(/\s+/)[0].toLowerCase())).size;
  if (empresas < 3) erros.push(`${arq}: ${empresas} empresa(s) diferente(s) marcada(s) [empresa] (exigido pelo menos 3 das melhores empresas da função)`);
  if (itens.some((x) => !/\[(empresa|norma|autor)\]/.test(x))) erros.push(`${arq}: referência sem marca [empresa], [norma] ou [autor]`);
  // Evals: 3 a 20 casos, com pelo menos 1 regressão e 1 gatilho negativo.
  const evArq = path.join(RAIZ, 'evals', nome + '.md');
  if (!fs.existsSync(evArq)) erros.push(`${arq}: sem evals/${nome}.md`);
  else {
    const ev = fs.readFileSync(evArq, 'utf8');
    const casos = (ev.match(/^### Caso/gm) || []).length;
    if (casos < 3 || casos > 20) erros.push(`evals/${nome}.md: ${casos} casos (exigido 3 a 20)`);
    if (!/Tipo:\s*regress/i.test(ev)) erros.push(`evals/${nome}.md: falta caso de regressão`);
    if (!/Tipo:\s*gatilho negativo/i.test(ev)) erros.push(`evals/${nome}.md: falta caso de gatilho negativo`);
    for (const campo of ['Pedido:', 'Deve:', 'Não deve:']) if ((ev.match(new RegExp(campo, 'g')) || []).length < casos) erros.push(`evals/${nome}.md: algum caso sem "${campo}"`);
  }
  const especifico = t.length - comum.length;
  const linhas = t.slice(0, t.indexOf('## Protocolo comum')).split('\n').length;
  if (linhas > 90) avisos.push(`${arq}: parte específica com ${linhas} linhas (meta ≤ 90)`);
  if (especifico < 0) erros.push(`${arq}: arquivo menor que o protocolo comum`);
}

// Placar (0.7.0): o revisor termina o relatório com a linha fixa que o gancho lê, e o eval cobra a linha.
const LINHA_FIXA = 'Placar: autor=<agente> cod=<código> veredito=sim|não B=<n> A=<n> M=<n> b=<n> ids=<A-1,M-2,…>';
try { if (!fs.readFileSync(path.join(dirAg, 'revisor.md'), 'utf8').includes(LINHA_FIXA)) erros.push(`revisor.md: falta a linha fixa do placar ("${LINHA_FIXA}")`); } catch (e) { erros.push('revisor.md não existe'); }
try { if (!/Placar:/.test(fs.readFileSync(path.join(RAIZ, 'evals', 'revisor.md'), 'utf8'))) erros.push('evals/revisor.md: falta o caso da linha Placar'); } catch (e) { /* já acusado acima */ }

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

// Checklist de lançamento (0.8.0): todo item tem "Verificar:" (comportamento provado, não existência) e, se cita lei
// brasileira, traz o link oficial (gov.br) no próprio item.
const dirCL = path.join(dirSk, 'checklist-lancamento');
if (fs.existsSync(dirCL)) {
  const arqItens = path.join(dirCL, 'itens.md');
  if (!fs.existsSync(arqItens)) erros.push('skills/checklist-lancamento: sem itens.md');
  else {
    const itensCL = [];
    for (const l of fs.readFileSync(arqItens, 'utf8').split(/\r?\n/)) {
      if (/^- \*\*[A-Z][\w-]*-\d+ ·/.test(l)) itensCL.push(l);
      else if (itensCL.length && itensCL[itensCL.length - 1] && /^\s+\S/.test(l)) itensCL[itensCL.length - 1] += '\n' + l;
      else if (!/^\s*$/.test(l)) itensCL.push(null);
    }
    for (const it of itensCL.filter(Boolean)) {
      const id = it.match(/^- \*\*([A-Z][\w-]*-\d+)/)[1];
      if (!/Verificar:/.test(it)) erros.push(`skills/checklist-lancamento/itens.md: ${id} sem "Verificar:"`);
      if (/\b(Lei|Decreto|Resolução|LGPD|CDC|Marco Civil|LBI|ECA Digital)\b/.test(it) && !/https:\/\/[^\s)]*\.gov\.br/.test(it)) {
        erros.push(`skills/checklist-lancamento/itens.md: ${id} cita lei sem o link oficial (gov.br)`);
      }
    }
  }
}

// Referências sob demanda (0.8.0, docs/inventario-plugins-2026-11.md): os agentes leem arquivos da pasta do plugin pelo
// caminho `${CLAUDE_PLUGIN_ROOT}/...` (o Claude Code troca a variável no corpo do agente; provado num `claude -p` real).
// Regras: todo caminho citado existe; no máximo 8 linhas "- Quando …" por agente; arquivo de referência ≤ 15 KB e com a
// linha de crédito (adaptado, com a licença em terceiros/, ou texto próprio).
const LIMITE_REF = 15 * 1024;
const MAX_GATILHOS = 8;
const pastasTerceiros = new Set(fs.existsSync(path.join(RAIZ, 'terceiros')) ? fs.readdirSync(path.join(RAIZ, 'terceiros')) : []);
const listar = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? listar(path.join(dir, e.name)) : [path.join(dir, e.name)]);
};
const rel = (f) => path.relative(RAIZ, f).split(path.sep).join('/');
const arquivosRef = [...listar(path.join(RAIZ, 'conhecimento')),
  ...fs.readdirSync(path.join(RAIZ, 'fonte', 'agentes')).flatMap((p) => listar(path.join(RAIZ, 'fonte', 'agentes', p, 'referencias')))]
  .filter((f) => f.endsWith('.md'));
for (const f of arquivosRef) {
  const tam = fs.statSync(f).size;
  if (tam > LIMITE_REF) erros.push(`${rel(f)}: ${(tam / 1024).toFixed(1)} KB (limite 15 KB por arquivo de referência: divida e ponha um INDICE.md)`);
  const l1 = fs.readFileSync(f, 'utf8').split(/\r?\n/)[0];
  if (/^<!-- Adaptado de /.test(l1)) {
    const pasta = (l1.match(/Licença em terceiros\/([^/\s]+)\//) || [])[1];
    if (!pasta || !pastasTerceiros.has(pasta) || !fs.existsSync(path.join(RAIZ, 'terceiros', pasta, 'LICENSE'))) erros.push(`${rel(f)}: crédito sem "Licença em terceiros/<pasta>/" com o LICENSE dentro`);
    if (!/@[0-9a-f]{7,40}\b/.test(l1)) erros.push(`${rel(f)}: crédito sem o commit de origem (@<commit>)`);
    if (!/©/.test(l1)) erros.push(`${rel(f)}: crédito sem o aviso de copyright (©)`);
    if (!/Alterações:[^>]*alterado por agentes-ultimate/.test(l1)) erros.push(`${rel(f)}: crédito sem "Alterações: …; alterado por agentes-ultimate" (Apache §4b)`);
  } else if (!/^<!-- Texto próprio do agentes-ultimate/.test(l1)) {
    erros.push(`${rel(f)}: 1ª linha sem o crédito ("<!-- Adaptado de …" ou "<!-- Texto próprio do agentes-ultimate …")`);
  }
}
const citaveis = [...agentes.map((a) => path.join(dirAg, a)), ...listar(dirSk).filter((f) => f.endsWith('.md')), ...arquivosRef];
const citadosRef = new Set();
for (const f of citaveis) {
  const t = fs.readFileSync(f, 'utf8');
  // Nos arquivos de referência a variável não é trocada: lá a raiz do plugin se escreve "<plugin>/".
  for (const m of t.matchAll(/(\$\{CLAUDE_PLUGIN_ROOT\}|<plugin>)\/([^\s`'")<>*]+)/g)) {
    const alvo = m[2].replace(/[.,;:]+$/, '');
    citadosRef.add(alvo.replace(/\/$/, ''));
    if (!fs.existsSync(path.join(RAIZ, alvo))) erros.push(`${rel(f)}: cita ${m[1]}/${alvo}, que não existe`);
  }
}
for (const arq of agentes) {
  const t = fs.readFileSync(path.join(dirAg, arq), 'utf8');
  const sec = (t.split('\n## Referências sob demanda')[1] || '').split('\n## ')[0];
  const gat = sec.split('\n').filter((l) => /^- /.test(l)).length; // toda linha de item conta, comece ou não com "Quando"
  if (gat > MAX_GATILHOS) erros.push(`${arq}: ${gat} linhas de gatilho em "Referências sob demanda" (máximo ${MAX_GATILHOS})`);
  if (sec && !gat) erros.push(`${arq}: seção "Referências sob demanda" sem nenhuma linha "- Quando …, leia …"`);
}
// Índice (conhecimento/indice.json): cabeçalho "ref:" em cada referência, agentes que existem, 2 pedidos que puxam e 1
// que não puxa (rodados contra o roteador no testar-hooks.js), e o arquivo gerado em dia com as referências.
if (fs.existsSync(path.join(RAIZ, 'conhecimento'))) {
  const ind = require(path.join(RAIZ, 'scripts', 'indice-referencias.js'));
  const { referencias, problemas } = ind.montar(RAIZ);
  for (const p of problemas) erros.push(p);
  for (const r of referencias) {
    for (const a of r.agentes) if (!agentes.includes(a + '.md')) erros.push(`${r.arquivo}: "ref:" cita o agente "${a}", que não existe`);
    if (!r.teste || r.teste.sim.length < 2 || r.teste.nao.length < 1) erros.push(`${r.arquivo}: 3ª linha sem "<!-- teste-ref: sim=<pedido> | <pedido>; nao=<pedido> -->" (2 que puxam, 1 que não)`);
  }
  let atual = '';
  try { atual = fs.readFileSync(path.join(RAIZ, 'conhecimento', 'indice.json'), 'utf8'); } catch (e) { /* falta */ }
  if (atual.replace(/\r\n/g, '\n') !== ind.texto(referencias)) erros.push('conhecimento/indice.json desatualizado ou ausente: rode node scripts/gerar-agentes.js');
}
// Registro das fontes (fontes/fontes.json): toda fonte citada em terceiros/, no CREDITOS.md ou numa linha de crédito
// está no registro; a lista origem → destino do registro está em dia com as linhas de crédito.
{
  const fr = require(path.join(RAIZ, 'scripts', 'fontes-registro.js'));
  const reg = fr.ler(RAIZ);
  const usosF = fr.usos(RAIZ);
  const temTerceiros = pastasTerceiros.size > 0;
  if (!reg) { if (temTerceiros || Object.keys(usosF).length) erros.push('fontes/fontes.json ausente ou inválido: toda fonte de terceiros entra no registro'); } else {
    const porRepo = new Map(reg.fontes.map((f) => [f.repo, f]));
    for (const f of reg.fontes) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(f.repo || '')) erros.push(`fontes/fontes.json: fonte sem "repo" dono/nome`);
      for (const c of ['commit_usado', 'ultimo_conferido']) if (!/^[0-9a-f]{40}$/.test(f[c] || '')) erros.push(`fontes/fontes.json: ${f.repo} sem "${c}" (40 hex)`);
      if (!('licenca' in f) || !f.branch) erros.push(`fontes/fontes.json: ${f.repo} sem "licenca" ou "branch"`);
    }
    for (const repo of Object.keys(usosF)) if (!porRepo.has(repo)) erros.push(`linha de crédito cita ${repo}, que não está em fontes/fontes.json (fonte nova entra no registro antes)`);
    for (const p of pastasTerceiros) if (!reg.fontes.some((f) => f.pasta === p)) erros.push(`terceiros/${p}/ não corresponde a nenhuma fonte de fontes/fontes.json`);
    let cred = '';
    try { cred = fs.readFileSync(path.join(RAIZ, 'CREDITOS.md'), 'utf8'); } catch (e) { /* sem CREDITOS */ }
    for (const m of cred.matchAll(/^\| ([\w.-]+\/[\w.-]+) \| ([0-9a-f]{40}) \|/gm)) {
      const f = porRepo.get(m[1]);
      if (!f) erros.push(`CREDITOS.md cita ${m[1]}, que não está em fontes/fontes.json`);
      else if (f.commit_usado !== m[2]) erros.push(`CREDITOS.md: commit de ${m[1]} difere do commit_usado do registro`);
    }
    const sinc = fr.sincronizado(RAIZ);
    if (fr.texto(sinc) !== fs.readFileSync(fr.ARQ(RAIZ), 'utf8').replace(/\r\n/g, '\n')) erros.push('fontes/fontes.json: lista "arquivos" fora de dia com as linhas de crédito (rode node scripts/gerar-agentes.js)');
  }
}
for (const f of arquivosRef) {
  const r = rel(f);
  if (/(^|\/)INDICE\.md$|^conhecimento\/LEIA-ME\.md$/.test(r)) continue;
  const viaCitacao = [...citadosRef].some((c) => r === c || r.startsWith(c + '/'));
  const viaIndice = arquivosRef.some((g) => /INDICE\.md$/.test(g) && fs.readFileSync(g, 'utf8').includes(path.basename(f)));
  if (!viaCitacao && !viaIndice) avisos.push(`${r}: nenhum agente, skill ou INDICE.md cita este arquivo`);
}

for (const a of avisos) console.log('AVISO ' + a);
for (const e of erros) console.log('ERRO  ' + e);
console.log(`${agentes.length} agentes, ${Object.keys(pac.pacotes).length} pacotes, ${fs.readdirSync(dirSk).length} skills · ${erros.length} erro(s), ${avisos.length} aviso(s)`);
process.exit(erros.length ? 1 : 0);
