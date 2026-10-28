#!/usr/bin/env node
// Testes dos ganchos sem o Claude Code: monta uma pasta de projeto temporária e manda pedidos de exemplo ao roteador e
// comandos de exemplo às travas. Sai 1 se algum caso não der o esperado. Não mexe na sua pasta de usuário: usa uma
// pasta de configuração temporária (HOME/USERPROFILE trocados).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agentes-ultimate-'));
const casa = path.join(tmp, 'casa');
const proj = path.join(tmp, 'projeto');
fs.mkdirSync(casa); fs.mkdirSync(proj);
const env = { ...process.env, HOME: casa, USERPROFILE: casa };

function hook(script, dados) {
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', script)], { input: JSON.stringify(dados), env, encoding: 'utf8' });
  let json = null; try { json = JSON.parse(r.stdout || 'null'); } catch (e) { /* texto */ }
  return { code: r.status, out: r.stdout, err: r.stderr, json };
}
const rot = (prompt, cwd = proj) => hook('roteador.js', { prompt, cwd, hook_event_name: 'UserPromptSubmit' });
const trava = (command, cwd = proj) => hook('travas.js', { tool_name: 'Bash', tool_input: { command }, cwd, hook_event_name: 'PreToolUse' });

let falhas = 0;
function caso(nome, ok, detalhe) { console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome}${ok ? '' : ' → ' + detalhe}`); if (!ok) falhas++; }
const msg = (r) => (r.json && r.json.systemMessage) || '';
const ctx = (r) => (r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.additionalContext) || '';

// Roteador
let r = rot('Another Claude session sent a message:\n<agent-message from="x">Relatório: painel Power BI com orçado e desvio pronto</agent-message>');
caso('relatório de agente não é tratado como pedido', r.code === 0 && !r.out, r.out);
r = rot('quanto é 15% de 2300?');
caso('pergunta trivial não monta nada', r.code === 0 && !r.out && !fs.existsSync(path.join(proj, '.claude')), r.out);

r = rot('Monte um painel no Power BI com orçado x realizado e o desvio por centro de custo');
caso('painel de orçamento → BI + Finanças', /BI e painéis/.test(msg(r)) && /Finanças/.test(msg(r)), msg(r));
caso('memória do projeto criada', ['PROJETO.md', 'MAPA.md', 'DIARIO.md', 'APRENDIZADOS.md', '.gitignore'].every((f) => fs.existsSync(path.join(proj, '.claude', 'base', f))), 'faltou arquivo em .claude/base');

r = rot('escreva o manual do usuário em PDF para a diretoria');
caso('manual em PDF → Documentos', /Documentos/.test(msg(r)) && !/BI e painéis/.test(msg(r)), msg(r));

r = rot('monte a descrição da vaga e o roteiro de entrevista estruturada para analista de RH');
caso('vaga e entrevista → Pessoas', /Pessoas/.test(msg(r)) && /recrutador/.test(msg(r)), msg(r));
r = rot('revise a cláusula de limitação de responsabilidade deste contrato com o fornecedor');
caso('cláusula de contrato → Jurídico', /Jurídico/.test(msg(r)) && /advogado-contratos/.test(msg(r)), msg(r));
r = rot('qual o impacto da reforma tributária no crédito de PIS COFINS da empresa?');
caso('reforma tributária → Contábil', /Contábil/.test(msg(r)) && /especialista-tributario/.test(msg(r)), msg(r));
r = rot('projete o fluxo de caixa de 13 semanas e a necessidade de capital de giro');
caso('caixa de 13 semanas → Finanças com tesouraria', /analista-tesouraria/.test(msg(r)), msg(r));

r = rot('temos como ver uma análise em excel com isso, mostrando as unidades de negócios onde está crescendo o headcount e a folha por verba');
caso('headcount e folha em Excel → Pessoas + Finanças', /Pessoas/.test(msg(r)) && /Finanças/.test(msg(r)), msg(r));
caso('nome do agente completo para a ferramenta Agent', /agentes-ultimate:analista-rh/.test(ctx(r)) && /agentes-ultimate:revisor/.test(ctx(r)), ctx(r).slice(0, 400));
caso('instrução manda delegar', /DELEGUE/.test(ctx(r)), ctx(r).slice(0, 400));

r = rot('preciso organizar a mudança da sede para o novo prédio no ano que vem, com cronograma e responsáveis');
caso('vocabulário não acha: o Claude decide pelo catálogo', /DECIDA VOCÊ/.test(ctx(r)) && /Catálogo/.test(ctx(r)) && /agentes-ultimate:comprador/.test(ctx(r)), ctx(r).slice(0, 500));

fs.writeFileSync(path.join(proj, 'package.json'), '{}');
r = rot('corrija o erro no script de importação');
caso('pasta com package.json + erro → Software', /Software/.test(msg(r)), msg(r));

r = rot('era com o analista-fpa');
caso('correção "era com" aprende', /analista-fpa/.test(msg(r)) && fs.existsSync(path.join(casa, '.claude', 'agentes-ultimate', 'roteamento.json')), msg(r));
r = rot('corrija o erro no script de importação');
caso('pedido parecido segue a correção', /analista-fpa/.test(msg(r)) || /analista-fpa/.test(ctx(r)), msg(r));

fs.appendFileSync(path.join(proj, '.claude', 'base', 'DIARIO.md'), '- 2026-10-20 [dev-powerbi] página de desvio por centro de custo construída → powerbi/x\n');
r = rot('ajuste a página de desvio por centro de custo no painel');
caso('traz o trabalho já feito sobre o assunto', /Já existe trabalho relacionado/.test(ctx(r)) && /página de desvio/.test(ctx(r)), ctx(r).slice(0, 300));

// Grafo: sinônimos, ligações e mapa automático
fs.mkdirSync(path.join(proj, 'src'));
fs.writeFileSync(path.join(proj, 'src', 'carga.js'), "// Lê a planilha de orçamento e grava a tabela fato\nconst r = require('./regras.js');\n");
fs.writeFileSync(path.join(proj, 'src', 'regras.js'), '// Regras de desvio, sinal e arredondamento\nmodule.exports = {};\n');
fs.appendFileSync(path.join(proj, '.claude', 'base', 'DIARIO.md'),
  '- 2026-10-21 [engenheiro-dados] leitura da planilha corrigida (linhas de total) → src/carga.js\n' +
  '- 2026-10-22 [designer-paineis] página de custos por gerência desenhada → docs/custos.md\n');
const grafoArq = path.join(proj, '.claude', 'base', '.grafo.json');
if (fs.existsSync(grafoArq)) fs.rmSync(grafoArq);
r = rot('ajustar as despesas por área no painel');
caso('sinônimo: "despesas por área" acha "custos por gerência"', /custos por gerência/.test(ctx(r)), ctx(r).slice(0, 400));
r = rot('tem um erro na leitura da planilha de orçamento');
caso('ligação: acha o arquivo e o que ele cita', /src\/carga\.js/.test(ctx(r)) && /src\/regras\.js/.test(ctx(r)), (ctx(r).split('Já existe')[1] || '').slice(0, 600));
caso('ligação: acha o registro do diário do arquivo', /leitura da planilha corrigida/.test(ctx(r)), ctx(r).slice(0, 500));
const mapa = fs.readFileSync(path.join(proj, '.claude', 'base', 'MAPA-AUTO.md'), 'utf8');
caso('mapa automático descreve e liga os arquivos', /src\/carga\.js` — Lê a planilha de orçamento/.test(mapa) && /cita: regras\.js/.test(mapa), mapa.slice(0, 300));
r = rot('quanto é 15% de 2300?');
caso('trivial continua sem contexto', !r.out, r.out);

// Mapa visual: registra o último pedido e gera o HTML com o que foi usado em destaque
const ub = JSON.parse(fs.readFileSync(path.join(proj, '.claude', 'base', '.ultima-busca.json'), 'utf8'));
caso('último pedido registrado para o mapa', /planilha de orçamento/.test(ub.pedido) && ub.arquivos.some((a) => a.rel === 'src/carga.js'), JSON.stringify(ub).slice(0, 200));
const mv = require(path.join(RAIZ, 'hooks', 'mapa-visual.js')).gerar(proj);
const html = fs.readFileSync(mv.destino, 'utf8');
caso('MAPA.html gerado com os usados destacados', mv.usados > 0 && /src\/carga\.js/.test(html) && /"u":1|"u":2/.test(html), `${mv.nos} pontos, ${mv.usados} usados`);
let erroScript = '';
try { new Function(html.split('<script>')[1].split('</script>')[0]); } catch (e) { erroScript = e.message; }
caso('script da página do mapa é JavaScript válido', !erroScript, erroScript);
caso('.gitignore da base cobre os gerados', /MAPA\.html/.test(fs.readFileSync(path.join(proj, '.claude', 'base', '.gitignore'), 'utf8')), 'faltou MAPA.html');

// Atividade ao vivo: o gancho anota o arquivo tocado (só o caminho)
const atv = (tool, input, extra = {}) => hook('atividade.js', { tool_name: tool, tool_input: input, cwd: proj, hook_event_name: 'PostToolUse', ...extra });
const atvArq = path.join(proj, '.claude', 'base', '.atividade.jsonl');
atv('Read', { file_path: path.join(proj, 'src', 'carga.js') });
atv('Edit', { file_path: 'src/regras.js' }, { agent_type: 'dev-powerbi' });
atv('Read', { file_path: path.join(tmp, 'fora.txt') });
const linhasAtv = fs.existsSync(atvArq) ? fs.readFileSync(atvArq, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
caso('atividade: anota leitura e edição com o agente', linhasAtv.length === 2 && linhasAtv[0].acao === 'leu' && linhasAtv[0].arquivo === 'src/carga.js' && linhasAtv[1].acao === 'editou' && linhasAtv[1].agente === 'dev-powerbi', JSON.stringify(linhasAtv));
caso('atividade: arquivo fora do projeto não é anotado', !linhasAtv.some((l) => /fora/.test(l.arquivo || '')), JSON.stringify(linhasAtv));

// Mapa ao vivo: servidor local responde, serve a página e transmite um evento novo
const testeServidor = `
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const proj=process.argv[1],srv=process.argv[2];
spawnSync(process.execPath,[srv,proj],{encoding:'utf8'});
const est=JSON.parse(fs.readFileSync(path.join(proj,'.claude','base','.mapa-servidor.json'),'utf8'));
const get=(p)=>new Promise(ok=>http.get({host:'127.0.0.1',port:est.porta,path:p},r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>ok({s:r.statusCode,b}));}).on('error',()=>ok({s:0,b:''})));
(async()=>{const s=await get('/saude');const p=await get('/');
let recebido=false;const req=http.get({host:'127.0.0.1',port:est.porta,path:'/eventos'},r=>{r.on('data',c=>{if(String(c).includes('novo-arquivo.js'))recebido=true;});});
await new Promise(r=>setTimeout(r,700));
fs.appendFileSync(path.join(proj,'.claude','base','.atividade.jsonl'),JSON.stringify({em:new Date().toISOString(),acao:'criou',arquivo:'src/novo-arquivo.js',agente:'principal'})+'\\n');
await new Promise(r=>setTimeout(r,1800));req.destroy();
let busca=-1,t1=0;const req2=http.get({host:'127.0.0.1',port:est.porta,path:'/eventos'},r=>{r.on('data',c=>{if(busca<0&&t1&&/"tipo":"busca"/.test(String(c))&&String(c).includes('pedido novo do teste'))busca=Date.now()-t1;});});
await new Promise(r=>setTimeout(r,700));t1=Date.now();
fs.writeFileSync(path.join(proj,'.claude','base','.ultima-busca.json'),JSON.stringify({pedido:'pedido novo do teste',em:new Date().toISOString(),registros:[],arquivos:[{rel:'src/regras.js',ligado:false}]}));
while(busca<0&&Date.now()-t1<2000)await new Promise(r=>setTimeout(r,50));req2.destroy();
const d=await get('/dados');let dj=null;try{dj=JSON.parse(d.b);}catch(e){}
try{process.kill(est.pid);}catch(e){}
console.log(JSON.stringify({saude:s.s,pagina:/Ao vivo/.test(p.b)&&/src\\/carga\\.js/.test(p.b),recebido,busca,dados:d.s===200&&!!dj&&Array.isArray(dj.nos)&&Array.isArray(dj.arestas)}));})();`;
const rs = spawnSync(process.execPath, ['-e', testeServidor, proj, path.join(RAIZ, 'hooks', 'mapa-servidor.js')], { encoding: 'utf8', env, timeout: 30000 });
let srvRes = {}; try { srvRes = JSON.parse((rs.stdout || '').trim().split('\n').pop()); } catch (e) { /* falhou */ }
caso('servidor do mapa responde e serve a página', srvRes.saude === 200 && srvRes.pagina === true, rs.stdout + rs.stderr);
caso('servidor transmite o evento novo na hora', srvRes.recebido === true, rs.stdout + rs.stderr);
caso('servidor avisa o último pedido novo em até 2 s', srvRes.busca >= 0 && srvRes.busca <= 2000, rs.stdout + rs.stderr);
caso('servidor entrega os dados atuais em /dados', srvRes.dados === true, rs.stdout + rs.stderr);
const auto = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'mapa-servidor.js'), '--auto'], { cwd: proj, encoding: 'utf8', env });
caso('abrir sozinho fica desligado sem config', auto.status === 0 && !auto.stdout, auto.stdout);

// Fim do trabalho: o gancho Stop anota o resumo do que foi tocado (1 lido, 1 editado, 1 criado até aqui)
const ultimaAtv = () => { try { return JSON.parse(fs.readFileSync(atvArq, 'utf8').trim().split('\n').pop()); } catch (e) { return {}; } };
hook('atividade.js', { cwd: proj, hook_event_name: 'Stop', stop_hook_active: false });
const fimEv = ultimaAtv();
caso('fim do trabalho anotado pelo Stop com o resumo', fimEv.tipo === 'fim' && fimEv.lidos === 1 && fimEv.editados === 1 && fimEv.criados === 1, JSON.stringify(fimEv));
const nAtv = fs.readFileSync(atvArq, 'utf8').trim().split('\n').length;
hook('atividade.js', { cwd: proj, hook_event_name: 'Stop', stop_hook_active: false });
caso('Stop sem trabalho novo não repete o aviso', fs.readFileSync(atvArq, 'utf8').trim().split('\n').length === nAtv, `${nAtv} linhas antes`);

// Abrir sozinho pela configuração do usuário, e uma aba só (o comando de abrir é trocado por um que só anota)
const cfgUsu = path.join(casa, '.claude', 'agentes-ultimate', 'config.json');
fs.mkdirSync(path.dirname(cfgUsu), { recursive: true });
fs.writeFileSync(cfgUsu, JSON.stringify({ mapa: { abrir_sozinho: true } }));
const abriu = path.join(tmp, 'abriu.txt');
const anota = path.join(tmp, 'anota-abrir.js');
fs.writeFileSync(anota, `require('fs').appendFileSync(${JSON.stringify(abriu)}, process.argv[2] + '\\n');`);
const testeAuto = `
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const proj=process.argv[1],srv=process.argv[2],abriu=process.argv[3];
const conta=()=>fs.existsSync(abriu)?fs.readFileSync(abriu,'utf8').split('\\n').filter(Boolean).length:0;
const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{spawnSync(process.execPath,[srv,'--auto'],{cwd:proj,encoding:'utf8'});
for(let i=0;i<40&&conta()<1;i++)await espera(100);const primeira=conta();
let est={};try{est=JSON.parse(fs.readFileSync(path.join(proj,'.claude','base','.mapa-servidor.json'),'utf8'));}catch(e){}
const req=http.get({host:'127.0.0.1',port:est.porta||1,path:'/eventos'},r=>r.resume());req.on('error',()=>{});
await espera(600);spawnSync(process.execPath,[srv,'--auto'],{cwd:proj,encoding:'utf8'});await espera(2000);const segunda=conta();
req.destroy();try{process.kill(est.pid);}catch(e){}
console.log(JSON.stringify({primeira,segunda}));})();`;
const ra = spawnSync(process.execPath, ['-e', testeAuto, proj, path.join(RAIZ, 'hooks', 'mapa-servidor.js'), abriu],
  { encoding: 'utf8', env: { ...env, AGENTES_ULTIMATE_ABRIR_CMD: `"${process.execPath}" "${anota}"` }, timeout: 30000 });
let au = {}; try { au = JSON.parse((ra.stdout || '').trim().split('\n').pop()); } catch (e) { /* falhou */ }
caso('abrir sozinho lê a configuração do usuário', au.primeira === 1, ra.stdout + ra.stderr);
caso('não abre segunda janela com aba já conectada', au.primeira === 1 && au.segunda === 1, ra.stdout + ra.stderr);
fs.rmSync(cfgUsu);

// Projeto com agentes e memória próprios (config.json)
fs.mkdirSync(path.join(proj, 'docs'), { recursive: true });
fs.writeFileSync(path.join(proj, 'docs', 'diario-antigo.md'), '# Diário\n- 2026-10-19 conciliação do orçamento com o razão fechada → src/carga.js\n');
fs.writeFileSync(path.join(proj, '.claude', 'base', 'config.json'), JSON.stringify({
  agentes: { revisor: 'revisor-qa', 'analista-fpa': 'especialista-fpa' },
  memoria: [{ arquivo: 'docs/diario-antigo.md', rotulo: 'diário do projeto' }],
}));
r = rot('refaça a conciliação do orçamento com o razão');
caso('config: usa os agentes do projeto', /revisor-qa/.test(msg(r)) && /especialista-fpa/.test(msg(r)) && !/analista-fpa/.test(msg(r)), msg(r));
caso('config: lê a memória que o projeto já tinha', /\(diário do projeto\)/.test(ctx(r)), (ctx(r).split('Já existe')[1] || '').slice(0, 400));
fs.rmSync(path.join(proj, '.claude', 'base', 'config.json'));

fs.writeFileSync(path.join(proj, '.claude', 'base', 'desligado'), '');
fs.rmSync(path.join(proj, '.claude', 'base', 'PROJETO.md'));
rot('monte o painel de custos no power bi');
caso('pasta desligada não recria memória', !fs.existsSync(path.join(proj, '.claude', 'base', 'PROJETO.md')), 'recriou');

const casa2 = rot('monte o painel de custos no power bi', casa);
caso('pasta do usuário (home) nunca recebe memória', !fs.existsSync(path.join(casa, '.claude', 'base')), casa2.out);

// Travas
r = trava('git push origin main');
caso('git push pede confirmação', r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.permissionDecision === 'ask', r.out);
r = trava("cat > x.js <<'EOF'\nconst a = 'C:\\\\pasta';\nEOF");
caso('heredoc com barra invertida bloqueado', r.code === 2, `code ${r.code}`);
r = trava('git status');
caso('comando comum passa', r.code === 0 && !r.out, r.out);

execSync('git init -q', { cwd: proj });
fs.writeFileSync(path.join(proj, '.env'), 'SENHA=x');
execSync('git add .env', { cwd: proj });
r = trava('git commit -m teste');
caso('commit com .env bloqueado', r.code === 2 && /\.env/.test(r.err), `code ${r.code} ${r.err}`);
execSync('git rm --cached -q .env', { cwd: proj }); // repositório sem commit: restore --staged não funciona
fs.mkdirSync(path.join(proj, 'dados')); fs.writeFileSync(path.join(proj, 'dados', 'real.csv'), 'a');
fs.writeFileSync(path.join(proj, '.claude', 'base', 'sensiveis.txt'), '# padrões do projeto\ndados/**\n');
execSync('git add dados/real.csv', { cwd: proj });
r = trava('git commit -m dados');
caso('commit com padrão do projeto bloqueado', r.code === 2 && /dados\/real\.csv/.test(r.err), `code ${r.code} ${r.err}`);
const g = require(path.join(RAIZ, 'hooks', 'grafo.js')).obter(proj, 0);
caso('arquivo sensível fica fora do grafo', !g.nos['dados/real.csv'] && !!g.nos['src/carga.js'], Object.keys(g.nos).join(', '));
fs.mkdirSync(path.join(proj, 'privado')); fs.writeFileSync(path.join(proj, 'privado', 'saida.txt'), '# valor sigiloso\n');
fs.writeFileSync(path.join(proj, '.gitignore'), 'privado/\n');
const g2 = require(path.join(RAIZ, 'hooks', 'grafo.js')).obter(proj, 0);
caso('pasta ignorada pelo git fica fora do grafo', !g2.nos['privado/saida.txt'] && !!g2.nos['src/carga.js'], Object.keys(g2.nos).join(', '));

// Atualização automática: usa um "claude" falso que só anota que foi chamado.
const marca = path.join(tmp, 'chamado.txt');
const falso = path.join(tmp, 'claude-falso.js');
fs.writeFileSync(falso, `require('fs').appendFileSync(${JSON.stringify(marca)}, process.argv.slice(2).join(' ') + '\\n');`);
const envAt = { ...env, AGENTES_ULTIMATE_FORCAR_ATUALIZAR: '1', AGENTES_ULTIMATE_CLAUDE_CMD: `"${process.execPath}" "${falso}"` };
const atualizar = (e) => spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'atualizar.js')], { input: '{}', env: e, encoding: 'utf8' });
const esperar = (ms) => { const fim = Date.now() + ms; while (Date.now() < fim && !(fs.existsSync(marca) && fs.readFileSync(marca, 'utf8').split('\n').length > 2)) { /* espera o processo em 2º plano */ } };
let a = atualizar(envAt);
esperar(8000);
const chamadas = fs.existsSync(marca) ? fs.readFileSync(marca, 'utf8') : '';
caso('atualização roda marketplace update e plugin update', a.status === 0 && /marketplace update agentes-ultimate/.test(chamadas) && /plugin update agentes-ultimate@agentes-ultimate/.test(chamadas), `status ${a.status} chamadas: ${chamadas}`);
fs.writeFileSync(marca, '');
a = atualizar(envAt);
esperar(1500);
caso('no mesmo dia não roda de novo', fs.readFileSync(marca, 'utf8') === '', fs.readFileSync(marca, 'utf8'));
const estArq = path.join(casa, '.claude', 'agentes-ultimate', 'atualizacao.json');
const est = JSON.parse(fs.readFileSync(estArq, 'utf8')); est.versaoVista = '0.0.1'; fs.writeFileSync(estArq, JSON.stringify(est));
a = atualizar(envAt);
caso('avisa quando a versão mudou', /0\.0\.1 →/.test(a.stdout), a.stdout);
a = atualizar({ ...envAt, AGENTES_ULTIMATE_FORCAR_ATUALIZAR: '' });
caso('cópia de desenvolvimento não se atualiza', a.status === 0 && !a.stdout, a.stdout);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(falhas ? `${falhas} caso(s) falharam` : 'todos os casos passaram');
process.exit(falhas ? 1 : 0);
