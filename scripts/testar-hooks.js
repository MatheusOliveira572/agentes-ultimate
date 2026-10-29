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

// Peças do registro (0.7.0). Numa cópia de versão antiga, sem o arquivo, cada função devolve [] e o caso falha em vez de
// derrubar a bateria: é assim que se prova que o caso falhava antes.
function registro() { try { return require(path.join(RAIZ, 'hooks', 'registro.js')); } catch (e) { return new Proxy({}, { get: () => () => [] }); } }
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
// b-5: na pasta do usuário fica só o que o aprendizado usa (termos), sem valores, números, caminhos nem e-mails
rot('ajuste o texto do comunicado de R$ 2 mi que está em C:\\Users\\fulano\\Documentos\\comunicado-2026.docx e mande para fulano@empresa.com.br');
const ultimoTxt = fs.readFileSync(path.join(casa, '.claude', 'agentes-ultimate', 'ultimo-pedido.json'), 'utf8');
caso('último pedido guarda só termos: sem R$ 2 mi, caminho, e-mail ou número', /comunicado/.test(ultimoTxt) && !/R\$|2 mi|fulano|Users|Documentos|empresa|@|\d{2}/.test(ultimoTxt.replace(/"em":\s*"[^"]*"/, '')) && !/"pedido"/.test(ultimoTxt), ultimoTxt);
r = rot('era com o redator');
const rotTxt = fs.readFileSync(path.join(casa, '.claude', 'agentes-ultimate', 'roteamento.json'), 'utf8');
caso('exemplos do "era com" só com termos (os antigos com texto são convertidos)', /redator/.test(rotTxt) && /importacao/.test(rotTxt) && !/"pedido"/.test(rotTxt) && !/fulano|R\$/.test(rotTxt) && /redator/.test(msg(r)), rotTxt.slice(0, 400));
r = rot('corrija o erro no script de importação');
caso('pedido parecido continua seguindo a correção antiga convertida', /analista-fpa/.test(msg(r)) || /analista-fpa/.test(ctx(r)), msg(r));
// b-11: palavra com inicial maiúscula fora do começo da frase é provável nome próprio (pessoa, empresa, cliente) e sai
rot('revise o contrato da Odebrecht com o João Silva da CCR para a Motiva. Depois monte o resumo do contrato');
const ultimoB11 = fs.readFileSync(path.join(casa, '.claude', 'agentes-ultimate', 'ultimo-pedido.json'), 'utf8');
caso('termos sem nomes próprios (inicial maiúscula fora do começo da frase), mantendo o começo da frase', !/odebrecht|joao|silva|ccr|motiva/.test(ultimoB11) &&
  /revise/.test(ultimoB11) && /contrato/.test(ultimoB11) && /depois/.test(ultimoB11) && /resumo/.test(ultimoB11), ultimoB11);

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
const gi7 = fs.readFileSync(path.join(proj, '.claude', 'base', '.gitignore'), 'utf8');
caso('.gitignore da base cobre progresso, estimativas e agentes', ['.progresso/', '.estimativas.jsonl', '.agentes.jsonl', '.fins/'].every((l) => gi7.split(/\r?\n/).includes(l)), gi7);

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

// ---- 0.7.0 · registro de cada execução e da faixa estimada ----
const p7 = path.join(tmp, 'projeto7');
fs.mkdirSync(path.join(p7, '.claude', 'base'), { recursive: true });
const execArq = path.join(casa, '.claude', 'agentes-ultimate', 'execucoes.jsonl');
const lerJsonl = (f) => { try { return fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch (e) { return []; } };
const exe = (dados) => hook('execucoes.js', { cwd: p7, session_id: 's1', ...dados });
const estimar = (argv, cwd = p7) => spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), ...argv], { cwd, env, encoding: 'utf8' });
const linhaTr = (ts) => JSON.stringify({ type: 'assistant', timestamp: ts, message: { content: 'texto do agente' } }) + '\n';
function transcricao(nome, ini, fim, mb = 0) {
  const f = path.join(tmp, nome);
  fs.writeFileSync(f, linhaTr(ini));
  if (mb) { const miolo = Buffer.from(linhaTr(ini).repeat(2000)); const fd = fs.openSync(f, 'a'); for (let n = 0; n < mb * 1024 * 1024; n += miolo.length) fs.writeSync(fd, miolo); fs.closeSync(fd); }
  fs.appendFileSync(f, linhaTr(fim));
  return f;
}
// faixa relativa a agora (hora fixa como "14:10" faz o caso depender da hora em que a bateria roda)
const dDe7 = new Date(Date.now() + 20 * 60000), dAte7 = new Date(Date.now() + 60 * 60000);
const hm7 = (d, sep) => `${String(d.getHours()).padStart(2, '0')}${sep}${String(d.getMinutes()).padStart(2, '0')}`;
let re = estimar(['registrar', '--agente', 'agentes-ultimate:dev-powerbi', '--classe', 'construção', '--cod', 'ab12', '--de', hm7(dDe7, ':'), '--ate', hm7(dAte7, 'h'), '--estimado', '40']);
const est7 = lerJsonl(path.join(p7, '.claude', 'base', '.estimativas.jsonl'));
const de7 = est7[0] ? new Date(est7[0].de) : null;
caso('estimar registrar grava a faixa em UTF-8 (classe com acento vira "construcao")', re.status === 0 && est7.length === 1 && est7[0].agente === 'dev-powerbi' &&
  est7[0].classe === 'construcao' && est7[0].cod === 'ab12' && est7[0].estimado_min === 40 && de7 && Math.abs(de7 - dDe7) < 60000,
  `status ${re.status} ${re.stderr} ${JSON.stringify(est7)}`);
re = estimar(['registrar', '--agente', 'dev-powerbi', '--de', '14:10']);
caso('estimar registrar recusa faixa incompleta', re.status !== 0 && lerJsonl(path.join(p7, '.claude', 'base', '.estimativas.jsonl')).length === 1, `status ${re.status}`);

exe({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_input: { description: 'Painel de custos R$ 2 mi [cod:ab12]', prompt: 'Monte o painel de R$ 2 mi', subagent_type: 'agentes-ultimate:dev-powerbi' } });
exe({ hook_event_name: 'SubagentStart', agent_id: 'a1', agent_type: 'agentes-ultimate:dev-powerbi' });
const tr1 = transcricao('a1.jsonl', '2026-10-28T13:00:00.000Z', '2026-10-28T13:42:30.000Z');
exe({ hook_event_name: 'SubagentStop', agent_id: 'a1', agent_type: 'agentes-ultimate:dev-powerbi', agent_transcript_path: tr1, last_assistant_message: 'pronto, R$ 2 mi' });
exe({ hook_event_name: 'SubagentStop', agent_id: 'a1', agent_type: 'agentes-ultimate:dev-powerbi', agent_transcript_path: tr1 });
let ex = lerJsonl(execArq);
caso('registro: uma linha por execução (a parada repetida do mesmo agente não duplica)', ex.length === 1, JSON.stringify(ex));
const e1 = ex[0] || {};
caso('registro: agente, classe, código, minutos pela transcrição e a faixa registrada', e1.agente === 'dev-powerbi' && e1.cod === 'ab12' && e1.minutos === 42.5 &&
  e1.classe === 'construcao' && e1.fonte_estimativa === 'registrada' && e1.estimado_min === 40 && !!e1.faixa_ate, JSON.stringify(e1));
const bruto = fs.existsSync(execArq) ? fs.readFileSync(execArq, 'utf8') : '';
caso('registro global sem o pedido, valores ou caminho (só o código anônimo do projeto)', bruto && !/R\$|2 mi|[Pp]ainel|projeto7|a1\.jsonl/.test(bruto) && /^[0-9a-f]{8}$/.test(e1.projeto || ''), bruto);
re = exe({});
const re2 = exe({ hook_event_name: 'SubagentStop' });
caso('registro: entrada sem campos sai 0 e não grava', re.code === 0 && re2.code === 0 && lerJsonl(execArq).length === 1, `${re.code} ${re2.code}`);
const tr2 = transcricao('a2.jsonl', '2026-10-28T10:00:00.000Z', '2026-10-28T11:30:00.000Z', 40);
exe({ hook_event_name: 'SubagentStart', agent_id: 'a2', agent_type: 'revisor' });
exe({ hook_event_name: 'SubagentStop', agent_id: 'a2', agent_type: 'revisor', agent_transcript_path: tr2 });
const t0 = Date.now();
registro().pontasTranscricao(tr2);
const ms = Date.now() - t0; // só a leitura (abrir processo no Windows varia de 0,2 a 5 s e não é o que se mede aqui)
ex = lerJsonl(execArq);
caso('registro: transcrição de 40 MB lida só nas pontas, em menos de 1 s', ex.length === 2 && ex[1].minutos === 90 && ex[1].classe === 'outra' && ms < 1000, `${ms} ms ${JSON.stringify(ex[1])}`);
// dois agentes do mesmo tipo em segundo plano: cada um fica com o seu código, mesmo terminando fora de ordem
for (const [cod, id, desc] of [['x1', 'b1', 'revise a página de custos'], ['x2', 'b2', 'corrija o erro da carga']]) {
  const ti = { description: `${desc} [cod:${cod}]`, prompt: 'p', subagent_type: 'agentes-ultimate:engenheiro-dados', run_in_background: true };
  exe({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_input: ti });
  exe({ hook_event_name: 'PostToolUse', tool_name: 'Agent', tool_input: ti, tool_response: { status: 'async_launched', agentId: id, agentType: 'agentes-ultimate:engenheiro-dados' } });
}
for (const id of ['b2', 'b1']) exe({ hook_event_name: 'SubagentStart', agent_id: id, agent_type: 'agentes-ultimate:engenheiro-dados' });
for (const id of ['b2', 'b1']) exe({ hook_event_name: 'SubagentStop', agent_id: id, agent_type: 'agentes-ultimate:engenheiro-dados', agent_transcript_path: transcricao(id + '.jsonl', '2026-10-28T09:00:00.000Z', '2026-10-28T09:10:00.000Z') });
ex = lerJsonl(execArq);
const b1 = ex.find((x) => x.id === 'b1') || {}, b2 = ex.find((x) => x.id === 'b2') || {};
caso('registro: dois agentes do mesmo tipo ficam cada um com o seu código', b1.cod === 'x1' && b2.cod === 'x2', JSON.stringify([b1, b2]));
caso('registro: sem faixa registrada, a classe vem das palavras do pedido', b1.classe === 'revisao' && b2.classe === 'correcao' && b1.fonte_estimativa === 'sem', JSON.stringify([b1, b2]));
// importar o passado: transcrições antigas do projeto (pasta do Claude Code com o nome da pasta do projeto)
const slug7 = path.resolve(p7).replace(/[^A-Za-z0-9]/g, '-');
const sub7 = path.join(casa, '.claude', 'projects', slug7, 'sessao-antiga', 'subagents');
fs.mkdirSync(sub7, { recursive: true });
fs.writeFileSync(path.join(sub7, 'agent-z1.meta.json'), JSON.stringify({ agentType: 'designer-paineis', description: 'desenhe a tela de custos R$ 3 mi', finished: true }));
fs.copyFileSync(transcricao('z1.jsonl', '2026-10-20T08:00:00.000Z', '2026-10-20T08:25:00.000Z'), path.join(sub7, 'agent-z1.jsonl'));
fs.writeFileSync(path.join(sub7, 'agent-z2.meta.json'), JSON.stringify({ agentType: 'designer-paineis', description: 'x', finished: false }));
fs.copyFileSync(transcricao('z2.jsonl', '2026-10-20T08:00:00.000Z', '2026-10-20T08:05:00.000Z'), path.join(sub7, 'agent-z2.jsonl'));
re = estimar(['importar']);
const re7b = estimar(['importar']);
ex = lerJsonl(execArq);
const z1 = ex.filter((x) => x.id === 'z1');
caso('importar: execuções antigas entram uma vez, com classe e sem o pedido', re.status === 0 && re7b.status === 0 && z1.length === 1 && z1[0].fonte_estimativa === 'importado' &&
  z1[0].minutos === 25 && z1[0].classe === 'spec' && !ex.some((x) => x.id === 'z2') && !/R\$ 3|custos/.test(fs.readFileSync(execArq, 'utf8')), `${re.stdout}${re.stderr} ${JSON.stringify(z1)}`);

// ---- 0.7.0 · faixa pela classe de referência (cascata até n ≥ 3) e fator real ÷ estimado ----
[[10, 10], [20, 10], [30, 25], [40, 20], [50, 50]].forEach(([min, est], i) => fs.appendFileSync(execArq, JSON.stringify({ id: 'r' + i, agente: 'analista-x', classe: 'dados',
  projeto: 'abcd1234', minutos: min, estimado_min: est, fonte_estimativa: 'registrada' }) + '\n'));
fs.appendFileSync(execArq, JSON.stringify({ id: 'r9', agente: 'analista-x', classe: 'dados', minutos: 900, retomado: true }) + '\n');
const faixa = (argv, e = env) => { const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), 'faixa', '--json', ...argv], { cwd: p7, env: e, encoding: 'utf8' });
  try { return JSON.parse(r.stdout); } catch (x) { return { erro: r.stdout + r.stderr }; } };
let fx = faixa(['--agente', 'analista-x', '--classe', 'dados', '--inicio', '14:00']);
caso('faixa sem estimado: mediana e p75 dos minutos reais (10..50 → 30 e 40), retomado fora', fx.nivel === 'agente+classe' && fx.n === 5 && fx.mediana === 30 && fx.p75 === 40 &&
  /^14h30–14h40/.test(fx.texto), JSON.stringify(fx));
fx = faixa(['--agente', 'analista-x', '--classe', 'dados', '--estimado', '60', '--inicio', '14:00']);
caso('faixa com estimado: corrige pelo fator real ÷ estimado (mediana 1,2 e p75 2 → 72 a 120 min)', fx.fator_mediana === 1.2 && fx.fator_p75 === 2 && fx.de_min === 72 && fx.ate_min === 120 &&
  /fator 1,2/.test(fx.texto), JSON.stringify(fx));
fx = faixa(['--agente', 'agente-novo', '--classe', 'dados']);
const fx2 = faixa(['--agente', 'analista-x', '--classe', 'texto']);
caso('faixa: cascata cai de nível quando n < 3 (agente novo → classe; classe sem histórico → agente)', fx.nivel === 'classe' && fx.n === 5 && fx2.nivel === 'agente' && fx2.n === 5, JSON.stringify([fx, fx2]));
const casaVazia = path.join(tmp, 'casa-vazia'); fs.mkdirSync(casaVazia);
fx = faixa(['--agente', 'analista-x', '--estimado', '30', '--inicio', '9:00'], { ...env, HOME: casaVazia, USERPROFILE: casaVazia });
caso('faixa sem histórico: estimado × 1 a × 2, dito no texto', fx.nivel === 'sem histórico' && fx.de_min === 30 && fx.ate_min === 60 && /sem histórico/.test(fx.texto), JSON.stringify(fx));
re = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), 'faixa', '--agente', 'analista-x', '--classe', 'dados', '--cod', 'fx01', '--registrar'], { cwd: p7, env, encoding: 'utf8' });
const regFx = lerJsonl(path.join(p7, '.claude', 'base', '.estimativas.jsonl')).find((x) => x.cod === 'fx01');
caso('faixa --registrar grava a mesma faixa que mostrou', re.status === 0 && regFx && regFx.agente === 'analista-x' && regFx.classe === 'dados' &&
  Math.round((Date.parse(regFx.ate) - Date.parse(regFx.de)) / 60000) >= 5, `${re.stdout}${re.stderr} ${JSON.stringify(regFx)}`);

// ---- 0.7.0 · progresso gravado pelo agente e barra por agente no painel do Claude Code ----
const prog7 = path.join(p7, '.claude', 'base', '.progresso');
fs.mkdirSync(prog7, { recursive: true });
fs.writeFileSync(path.join(prog7, 'dev-powerbi-k1.json'), JSON.stringify({ feito: 3, total: 4, agora: 'lote final das telas extra' }));
fs.writeFileSync(path.join(prog7, 'dev-powerbi-k2.json'), JSON.stringify({ feito: 1, total: 4, agora: 'modelo' }));
const velho = path.join(prog7, 'revisor-k3.json');
fs.writeFileSync(velho, JSON.stringify({ feito: 2, total: 3, agora: 'conferência' }));
const meiaHora = (Date.now() - 31 * 60000) / 1000; fs.utimesSync(velho, meiaHora, meiaHora);
estimar(['registrar', '--agente', 'revisor', '--cod', 'k3', '--de', new Date(Date.now() - 30 * 60000).toTimeString().slice(0, 5), '--ate', new Date(Date.now() - 20 * 60000).toTimeString().slice(0, 5)]);
const agoraMs = Date.now();
const tarefas = [
  { id: 't1', type: 'local_agent', agentType: 'agentes-ultimate:dev-powerbi', status: 'running', description: 'telas da escala [cod:k1]', startTime: agoraMs - 20 * 60000, tokenCount: 1 },
  { id: 't2', type: 'local_agent', agentType: 'agentes-ultimate:dev-powerbi', status: 'running', description: 'modelo novo [cod:k2]', startTime: agoraMs - 5 * 60000, tokenCount: 1 },
  { id: 't3', type: 'local_agent', agentType: 'agentes-ultimate:revisor', status: 'running', description: 'revise a rodada [cod:k3]', startTime: agoraMs - 40 * 60000, tokenCount: 1 },
  { id: 't4', type: 'local_agent', agentType: 'Explore', status: 'completed', description: 'x', startTime: agoraMs - 60000, tokenCount: 1 },
];
const barra = (dados, script = path.join(RAIZ, 'hooks', 'barra.js')) => {
  const r = spawnSync(process.execPath, [script], { input: typeof dados === 'string' ? dados : JSON.stringify(dados), env, encoding: 'utf8' });
  const linhas = (r.stdout || '').trim().split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (e) { return { erro: l }; } });
  return { code: r.status, out: r.stdout, linhas, porId: Object.fromEntries(linhas.map((l) => [l.id, l.content])) };
};
let br = barra({ cwd: p7, columns: 200, tasks: tarefas });
caso('barra: dois agentes do mesmo tipo com códigos diferentes têm progressos diferentes', /75%/.test(br.porId.t1 || '') && /3\/4/.test(br.porId.t1 || '') &&
  /25%/.test(br.porId.t2 || '') && /1\/4 · modelo/.test(br.porId.t2 || ''), br.out);
caso('barra: rótulo da etapa com até 5 palavras e só tarefas em andamento', /lote final das telas extra/.test(br.porId.t1 || '') && !('t4' in br.porId), br.out);
caso('barra: progresso de mais de 30 min é ignorado e a faixa vencida avisa "passou da previsão"', !/2\/3/.test(br.porId.t3 || '') && /passou da previsão.*\+\d+ min/.test(br.porId.t3 || ''), br.out);
br = barra({ cwd: p7, columns: 40, tasks: tarefas });
caso('barra: corta na largura da coluna', br.linhas.length === 3 && br.linhas.every((l) => [...l.content].length <= 40), br.out);
br = barra('{isto não é json');
caso('barra: entrada inválida sai 0 sem texto', br.code === 0 && !br.out, `${br.code} ${br.out}`);
const lancador = path.join(casa, '.claude', 'agentes-ultimate', 'barra.js');
re = spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'barra.js'), '--instalar'], { input: '{}', env, encoding: 'utf8' });
br = fs.existsSync(lancador) ? barra({ cwd: p7, columns: 200, tasks: tarefas }, lancador) : { porId: {} };
caso('barra --instalar grava o lançador fixo e ele mostra a mesma barra', re.status === 0 && /75%/.test(br.porId.t1 || ''), `${re.status} ${re.stderr} ${JSON.stringify(br.porId)}`);
let cfgPlugin = {}; try { cfgPlugin = JSON.parse(fs.readFileSync(path.join(RAIZ, 'settings.json'), 'utf8')); } catch (e) { /* sem arquivo */ }
caso('settings.json do plugin liga a barra pelo lançador fixo', cfgPlugin.subagentStatusLine && cfgPlugin.subagentStatusLine.type === 'command' &&
  /\$HOME\/\.claude\/agentes-ultimate\/barra\.js/.test(cfgPlugin.subagentStatusLine.command), JSON.stringify(cfgPlugin));
const ses = JSON.parse(fs.readFileSync(path.join(RAIZ, 'hooks', 'hooks.json'), 'utf8')).hooks.SessionStart[0].hooks.map((h) => h.command).join(' ');
caso('o início de sessão regrava o lançador (a pasta do plugin muda a cada versão)', /barra\.js" --instalar/.test(ses), ses);

// ---- 0.7.0 · placar: linha fixa do revisor, defeitos que escaparam ao usuário e números por agente ----
const revArq = path.join(casa, '.claude', 'agentes-ultimate', 'revisoes.jsonl');
const estadoArq = path.join(casa, '.claude', 'agentes-ultimate', 'estado.json');
const revisar = (id, msgFinal, tr) => {
  exe({ hook_event_name: 'SubagentStart', agent_id: id, agent_type: 'agentes-ultimate:revisor' });
  exe({ hook_event_name: 'SubagentStop', agent_id: id, agent_type: 'agentes-ultimate:revisor', agent_transcript_path: tr || transcricao(id + '.jsonl', '2026-10-28T15:00:00.000Z', '2026-10-28T15:20:00.000Z'), last_assistant_message: msgFinal });
};
revisar('v1', 'Veredito: não pode ir.\nPlacar: autor=agentes-ultimate:dev-powerbi cod=ab12 veredito=não B=1 A=2 M=0 b=3');
let rv = lerJsonl(revArq);
caso('placar: a linha fixa do revisor vira registro com as contagens', rv.length === 1 && rv[0].autor === 'dev-powerbi' && rv[0].cod === 'ab12' && rv[0].veredito === 'nao' &&
  rv[0].B === 1 && rv[0].A === 2 && rv[0].M === 0 && rv[0].b === 3, JSON.stringify(rv));
caso('registro da revisão sem o campo "primeira" (uma fonte só: o placar calcula "de primeira")', rv.length === 1 && !('primeira' in rv[0]), JSON.stringify(rv));
// a segunda revisão do mesmo código vem pelo fim da transcrição (relatório entregue pelo SubagentHandback)
const trH = transcricao('v2.jsonl', '2026-10-28T16:00:00.000Z', '2026-10-28T16:10:00.000Z');
fs.appendFileSync(trH, JSON.stringify({ type: 'assistant', timestamp: '2026-10-28T16:10:01.000Z', message: { content: [{ type: 'tool_use', name: 'SubagentHandback',
  input: { message: 'Pode ir.\nPlacar: autor=dev-powerbi cod=ab12 veredito=sim B=0 A=0 M=1 b=0' } }] } }) + '\n');
revisar('v2', '', trH);
rv = lerJsonl(revArq);
caso('placar: a 2ª revisão do mesmo código é lida pelo fim da transcrição (o "de primeira" dela é conferido no placar abaixo)', rv.length === 2 && rv[1].veredito === 'sim' && rv[1].M === 1, JSON.stringify(rv));
const lerEstado = () => { try { return JSON.parse(fs.readFileSync(estadoArq, 'utf8')); } catch (e) { return {}; } };
const semAntes = lerEstado().revisor_sem_placar || 0; // o revisor do caso de 40 MB também terminou sem a linha
revisar('v3', 'Revisei e está tudo certo.');
const estado = lerEstado();
caso('placar: relatório do revisor sem a linha Placar não grava e deixa aviso', lerJsonl(revArq).length === 2 && estado.revisor_sem_placar === semAntes + 1, JSON.stringify(estado));
const placar = (argv, cwd = p7) => spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'placar.js'), ...argv], { cwd, env, encoding: 'utf8' });
re = placar(['defeito', '--agente', 'dev-powerbi', '--gravidade', 'Alta', '--texto', 'total da página não bate por R$ 2 mi']);
const dfTxt = fs.existsSync(path.join(p7, '.claude', 'base', 'DEFEITOS-USUARIO.md')) ? fs.readFileSync(path.join(p7, '.claude', 'base', 'DEFEITOS-USUARIO.md'), 'utf8') : '';
const dfGlob = fs.existsSync(path.join(casa, '.claude', 'agentes-ultimate', 'defeitos.jsonl')) ? fs.readFileSync(path.join(casa, '.claude', 'agentes-ultimate', 'defeitos.jsonl'), 'utf8') : '';
caso('defeito do usuário: texto só no projeto, contagem no global', re.status === 0 && /total da página não bate/.test(dfTxt) && /dev-powerbi/.test(dfTxt) &&
  /"agente":"dev-powerbi"/.test(dfGlob) && /"gravidade":"A"/.test(dfGlob) && !/R\$|página/.test(dfGlob), `${re.stderr} ${dfGlob}`);
re = placar(['--json']);
let pl = {}; try { pl = JSON.parse(re.stdout); } catch (e) { /* falhou */ }
const dev = (pl.agentes || {})['dev-powerbi'] || {};
caso('placar: de primeira, defeitos por gravidade, escapados, retrabalho e taxa de captura', dev.revisados === 1 && dev.de_primeira === 0 && dev.B === 1 && dev.A === 2 && dev.M === 1 &&
  dev.b === 3 && dev.escaparam === 1 && pl.captura && pl.captura.pegos === 7 && pl.captura.usuario === 1 && pl.captura.taxa === 87.5, re.stdout + re.stderr);
caso('placar: acerto da estimativa pela faixa registrada', dev.com_faixa === 1 && dev.dentro_faixa === 0 && typeof dev.erro_mediano === 'number', JSON.stringify(dev));
caso('placar refeito e gravado em placar.json', fs.existsSync(path.join(casa, '.claude', 'agentes-ultimate', 'placar.json')), 'sem placar.json');
re = placar([]);
caso('placar em tabela legível', re.status === 0 && /\| dev-powerbi \|/.test(re.stdout) && /Taxa de captura do revisor: 87,5%/.test(re.stdout), re.stdout);

// ---- 0.7.0 · "Agentes agora" no mapa ao vivo: cada agente com %, etapa, término previsto e aviso ao terminar ----
const p8 = path.join(tmp, 'projeto8');
const b8 = path.join(p8, '.claude', 'base');
fs.mkdirSync(path.join(b8, '.progresso'), { recursive: true });
const iso8 = (minAtras) => new Date(Date.now() - minAtras * 60000).toISOString();
const ag8 = [
  { em: iso8(30), tipo: 'inicio', id: 'g1', agente: 'dev-powerbi', cod: 'm1', classe: 'construcao' },
  { em: iso8(12), tipo: 'inicio', id: 'g2', agente: 'designer-paineis', cod: 'm2', classe: 'spec' },
  { em: iso8(50), tipo: 'inicio', id: 'g3', agente: 'revisor', cod: 'm3', classe: 'revisao' },
  { em: iso8(2), tipo: 'fim', id: 'g3', agente: 'revisor', cod: 'm3', minutos: 48 },
  { em: iso8(900), tipo: 'inicio', id: 'g0', agente: 'velho', cod: null, classe: 'outra' },
];
fs.writeFileSync(path.join(b8, '.agentes.jsonl'), ag8.map((x) => JSON.stringify(x)).join('\n') + '\n');
fs.writeFileSync(path.join(b8, '.progresso', 'dev-powerbi-m1.json'), JSON.stringify({ feito: 3, total: 5, agora: 'lote final das telas extra' }));
const hm8 = (minFrente) => new Date(Date.now() + minFrente * 60000).toTimeString().slice(0, 5);
estimar(['registrar', '--agente', 'designer-paineis', '--cod', 'm2', '--de', hm8(20), '--ate', hm8(40)], p8);
const R8 = registro();
const agora8 = R8.agentesAgora ? R8.agentesAgora(p8) : [];
const q1 = agora8.find((x) => x.id === 'g1') || {}, q2 = agora8.find((x) => x.id === 'g2') || {}, q3 = agora8.find((x) => x.id === 'g3') || {};
caso('agentes agora: cada agente com %, etapa em até 4 palavras e término pelo ritmo', q1.estado === 'trabalhando' && q1.pct === 60 && q1.etapa === 'lote final das telas' &&
  q1.feito === 3 && q1.total === 5 && Math.abs(q1.termina - (Date.parse(ag8[0].em) + 50 * 60000)) <= 5 * 60000, JSON.stringify(q1));
caso('agentes agora: sem progresso, término pela faixa registrada', q2.estado === 'trabalhando' && q2.fonte === 'registrada' && q2.termina >= Date.now() + 15 * 60000 &&
  q2.termina <= Date.now() + 45 * 60000 && typeof q2.pct === 'number', JSON.stringify(q2));
caso('agentes agora: quem terminou aparece com os minutos; início de 15 h atrás sem fim não conta', q3.estado === 'terminou' && q3.minutos === 48 && !agora8.some((x) => x.id === 'g0'), JSON.stringify(agora8));
const testeAgentes = `
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const proj=process.argv[1],srv=process.argv[2];
spawnSync(process.execPath,[srv,proj],{encoding:'utf8'});
const est=JSON.parse(fs.readFileSync(path.join(proj,'.claude','base','.mapa-servidor.json'),'utf8'));
const get=(p)=>new Promise(ok=>http.get({host:'127.0.0.1',port:est.porta,path:p},r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>ok({s:r.statusCode,b}));}).on('error',()=>ok({s:0,b:''})));
(async()=>{const a=await get('/agentes');let lista=[];try{lista=JSON.parse(a.b);}catch(e){}
let ms=-1,t1=0,inicial=false;const req=http.get({host:'127.0.0.1',port:est.porta,path:'/eventos'},r=>{r.on('data',c=>{const s=String(c);if(/"tipo":"agentes"/.test(s)&&/"g1"/.test(s))inicial=true;if(ms<0&&t1&&/"tipo":"agentes"/.test(s)&&/"g4"/.test(s))ms=Date.now()-t1;});});
await new Promise(r=>setTimeout(r,800));t1=Date.now();
fs.appendFileSync(path.join(proj,'.claude','base','.agentes.jsonl'),JSON.stringify({em:new Date().toISOString(),tipo:'inicio',id:'g4',agente:'redator',cod:'m4',classe:'texto'})+'\\n');
while(ms<0&&Date.now()-t1<4000)await new Promise(r=>setTimeout(r,50));req.destroy();
const p=await get('/');try{process.kill(est.pid);}catch(e){}
console.log(JSON.stringify({n:lista.length,inicial,ms,painel:/Agentes agora/.test(p.b)}));})();`;
const rg = spawnSync(process.execPath, ['-e', testeAgentes, p8, path.join(RAIZ, 'hooks', 'mapa-servidor.js')], { encoding: 'utf8', env, timeout: 30000 });
let ag = {}; try { ag = JSON.parse((rg.stdout || '').trim().split('\n').pop()); } catch (e) { /* falhou */ }
caso('mapa: /agentes entrega os agentes e a página tem o painel "Agentes agora"', ag.n === 3 && ag.painel === true, rg.stdout + rg.stderr);
caso('mapa: quem abre recebe os agentes na hora e um agente novo chega em até 3 s', ag.inicial === true && ag.ms >= 0 && ag.ms <= 3000, rg.stdout + rg.stderr);

// ---- A-1 · escala: histórico grande não deixa o fim do agente lento, e o placar dá o mesmo resultado ----
// Gerador determinístico de histórico (execuções e uma revisão por código, para comparar com a regra antiga).
function sintetico(nExec, nRev, semente = 7) {
  let s = semente; const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const ags = ['dev-powerbi', 'designer-paineis', 'engenheiro-dados', 'analista-fpa', 'redator', 'pesquisador'];
  const cls = ['construcao', 'spec', 'dados', 'regras', 'texto', 'pesquisa', 'correcao'];
  const projs = ['aaaa1111', 'bbbb2222', 'cccc3333'];
  const t0 = Date.parse('2026-01-01T00:00:00Z'), passo = 60000 * 7;
  const revs = []; const execs = [];
  for (let k = 0; k < nRev; k++) {
    revs.push({ em: new Date(t0 + (k * nExec / nRev + 0.5) * passo).toISOString(), revisor: 'revisor', autor: ags[k % ags.length], cod: 'c' + k, projeto: projs[k % 3],
      veredito: rnd() < 0.4 ? 'nao' : 'sim', B: rnd() < 0.1 ? 1 : 0, A: Math.floor(rnd() * 3), M: Math.floor(rnd() * 3), b: Math.floor(rnd() * 4) });
  }
  for (let i = 0; i < nExec; i++) {
    const k = Math.floor(rnd() * nRev); const r = revs[k]; const comCod = rnd() < 0.6;
    const ini = t0 + i * passo; const min = Math.round((5 + rnd() * 90) * 10) / 10;
    const est = rnd() < 0.5 ? Math.round(10 + rnd() * 60) : null; const faixa = rnd() < 0.5;
    execs.push({ id: 'e' + i, agente: comCod ? r.autor : ags[i % ags.length], classe: cls[i % cls.length], projeto: comCod ? r.projeto : projs[i % 3],
      inicio: new Date(ini).toISOString(), fim: new Date(ini + min * 60000).toISOString(), minutos: min, estimado_min: est,
      faixa_de: faixa ? new Date(ini + 20 * 60000).toISOString() : null, faixa_ate: faixa ? new Date(ini + 50 * 60000).toISOString() : null,
      fonte_estimativa: faixa ? 'registrada' : 'sem', cod: comCod ? r.cod : null, retomado: rnd() < 0.02 || undefined });
  }
  return { execs, revs, defs: revs.filter((r, k) => k % 9 === 0).map((r) => ({ em: r.em, agente: r.autor, projeto: r.projeto, gravidade: 'A' })) };
}
// A regra do placar da 0.7.0 antes da correção (quadrática), para provar que o resultado não mudou.
function placarAntigo({ execs, revs, defs }) {
  const ag = {}; const de = (n) => (ag[n] = ag[n] || { execucoes: 0, revisados: 0, de_primeira: 0, B: 0, A: 0, M: 0, b: 0, escaparam: 0, retrabalho: 0, com_faixa: 0, dentro_faixa: 0, erro_mediano: null, _e: [] });
  for (const x of execs) { const a = de(x.agente); a.execucoes++; const ini = Date.parse(x.inicio), ate = Date.parse(x.faixa_ate), dF = Date.parse(x.faixa_de);
    if (ate && ini && x.minutos > 0 && ate > ini) { a.com_faixa++; const fim = ini + x.minutos * 60000; if (fim <= ate && (!dF || fim >= dF)) a.dentro_faixa++; const ff = (ate - ini) / 60000; a._e.push(Math.abs(x.minutos - ff) / ff * 100); } }
  const porCod = {};
  for (const r of revs) { const a = de(r.autor); for (const g of ['B', 'A', 'M', 'b']) a[g] += Number(r[g]) || 0; const k = `${r.projeto}|${r.autor}|${r.cod}`; if (!porCod[k]) { porCod[k] = r; a.revisados++; if (r.veredito === 'sim') a.de_primeira++; } }
  for (const r of Object.values(porCod)) { const naos = revs.filter((x) => x.projeto === r.projeto && x.autor === r.autor && x.cod === r.cod && x.veredito === 'nao').map((x) => Date.parse(x.em));
    if (!naos.length || !r.cod) continue; const p = Math.min(...naos); de(r.autor).retrabalho += execs.filter((x) => x.agente === r.autor && x.cod === r.cod && x.projeto === r.projeto && Date.parse(x.inicio) > p).length; }
  for (const d of defs) de(d.agente).escaparam++;
  const q = registro().quantil;
  for (const a of Object.values(ag)) { a.erro_mediano = a._e.length ? Math.round(q(a._e, 0.5) * 10) / 10 : null; delete a._e; }
  const pegos = revs.reduce((t, r) => t + ['B', 'A', 'M', 'b'].reduce((u, g) => u + (Number(r[g]) || 0), 0), 0);
  return { agentes: ag, captura: { pegos, usuario: defs.length, taxa: pegos + defs.length ? Math.round(pegos / (pegos + defs.length) * 1000) / 10 : null, meta: 80 } };
}
const gravarHist = (casaX, h) => { const g = path.join(casaX, '.claude', 'agentes-ultimate'); fs.mkdirSync(g, { recursive: true });
  for (const [n, l] of [['execucoes', h.execs], ['revisoes', h.revs], ['defeitos', h.defs]]) fs.writeFileSync(path.join(g, n + '.jsonl'), l.map((x) => JSON.stringify(x)).join('\n') + '\n'); };
const ordena = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, ordena(o[k])])) : o);
const casaEq = path.join(tmp, 'casa-eq'); const histEq = sintetico(3000, 1000);
gravarHist(casaEq, histEq);
re = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'placar.js'), '--json'], { cwd: p7, env: { ...env, HOME: casaEq, USERPROFILE: casaEq }, encoding: 'utf8' });
let plNovo = {}; try { plNovo = JSON.parse(re.stdout); } catch (e) { /* falhou */ }
const plVelho = placarAntigo(histEq);
caso('escala: o placar dá o mesmo resultado da regra antiga (3 mil execuções, 1 mil revisões)', JSON.stringify(ordena(plNovo.agentes)) === JSON.stringify(ordena(plVelho.agentes)) &&
  JSON.stringify(ordena(plNovo.captura)) === JSON.stringify(ordena(plVelho.captura)), `novo ${String(JSON.stringify(ordena(plNovo.agentes))).slice(0, 300)}\nvelho ${String(JSON.stringify(ordena(plVelho.agentes))).slice(0, 300)}`);
const casa60 = path.join(tmp, 'casa60'); gravarHist(casa60, sintetico(60000, 20000));
const env60 = { ...env, HOME: casa60, USERPROFILE: casa60 };
const p60 = path.join(tmp, 'projeto60'); fs.mkdirSync(path.join(p60, '.claude', 'base'), { recursive: true });
const tr60 = transcricao('t60.jsonl', '2026-10-28T10:00:00.000Z', '2026-10-28T10:20:00.000Z');
const fim60 = (id) => { const t = Date.now(); spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'execucoes.js')], { input: JSON.stringify({ cwd: p60, hook_event_name: 'SubagentStop', agent_id: id,
  agent_type: 'agentes-ultimate:revisor', agent_transcript_path: tr60, last_assistant_message: `Placar: autor=dev-powerbi cod=z${id} veredito=não B=0 A=1 M=0 b=0` }), env: env60, encoding: 'utf8' }); return Date.now() - t; };
// Abrir um Node no Windows custa de 0,2 a 1 s conforme a carga da máquina: mede-se, intercalado, um Node vazio, e o gancho
// pode custar no máximo 300 ms além dele (o defeito antigo custava 26 s).
const vazio = () => { const t = Date.now(); spawnSync(process.execPath, ['-e', ''], { env: env60 }); return Date.now() - t; };
const med = (l) => l.slice().sort((a, b) => a - b)[Math.floor(l.length / 2)];
fim60('aquece');
const tempos60 = [], vazios = [];
for (let i = 1; i <= 5; i++) { tempos60.push(fim60('m' + i)); vazios.push(vazio()); }
caso(`escala: com 60 mil execuções o fim de um agente custa menos de 0,3 s além de abrir o Node (mediana ${med(tempos60)} ms; Node vazio ${med(vazios)} ms)`,
  med(tempos60) - med(vazios) < 300 && lerJsonl(path.join(casa60, '.claude', 'agentes-ultimate', 'revisoes.jsonl')).length === 20006, `${tempos60.join(', ')} ms × vazio ${vazios.join(', ')} ms`);
const barra60 = () => { const t = Date.now(); spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'barra.js')], { input: JSON.stringify({ cwd: p60, columns: 120, tasks: [{ id: 'x', agentType: 'dev-powerbi',
  status: 'running', description: 'monte a página', startTime: Date.now() - 600000 }] }), env: env60, encoding: 'utf8' }); return Date.now() - t; };
barra60();
const temposB = [], vaziosB = [];
for (let i = 1; i <= 5; i++) { temposB.push(barra60()); vaziosB.push(vazio()); }
caso(`escala: com 60 mil execuções a barra custa menos de 0,3 s além de abrir o Node (mediana ${med(temposB)} ms; Node vazio ${med(vaziosB)} ms)`,
  med(temposB) - med(vaziosB) < 300, `${temposB.join(', ')} ms × vazio ${vaziosB.join(', ')} ms`);

// ---- M-2 · dois agentes do mesmo tipo lançados juntos não trocam de código (ganchos em paralelo, inícios a 5 ms) ----
const testeParalelo = `
const {spawn}=require('child_process'),path=require('path'),fs=require('fs');
const [gancho,raiz,casaP]=process.argv.slice(1);
const env={...process.env,HOME:casaP,USERPROFILE:casaP};
const roda=(d)=>new Promise(ok=>{const p=spawn(process.execPath,[gancho],{env,stdio:['pipe','ignore','ignore']});p.on('close',ok);p.stdin.end(JSON.stringify(d));});
const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const erros=[];const R=require(path.join(raiz,'hooks','registro.js'));
for(let k=0;k<20;k++){const cwd=path.join(casaP,'p'+k);fs.mkdirSync(path.join(cwd,'.claude','base'),{recursive:true});
const tipo='agentes-ultimate:dev-powerbi',A='ida'+k,B='idb'+k;
const ti=(c)=>({description:'tarefa [cod:'+c+']',prompt:'p',subagent_type:tipo,run_in_background:true});
await roda({cwd,hook_event_name:'PreToolUse',tool_name:'Agent',tool_use_id:'tua'+k,tool_input:ti('xa'+k)});
await roda({cwd,hook_event_name:'PreToolUse',tool_name:'Agent',tool_use_id:'tub'+k,tool_input:ti('xb'+k)});
const ps=[];ps.push(roda({cwd,hook_event_name:'SubagentStart',agent_id:B,agent_type:tipo}));await espera(5);
ps.push(roda({cwd,hook_event_name:'SubagentStart',agent_id:A,agent_type:tipo}));
ps.push(roda({cwd,hook_event_name:'PostToolUse',tool_name:'Agent',tool_use_id:'tua'+k,tool_input:ti('xa'+k),tool_response:{status:'async_launched',agentId:A}}));await espera(5);
ps.push(roda({cwd,hook_event_name:'PostToolUse',tool_name:'Agent',tool_use_id:'tub'+k,tool_input:ti('xb'+k),tool_response:{status:'async_launched',agentId:B}}));
await Promise.all(ps);
const ag=R.agentesAgora(cwd);const a=ag.find(x=>x.id===A)||{},b=ag.find(x=>x.id===B)||{};
if(a.cod!=='xa'+k||b.cod!=='xb'+k)erros.push('painel '+k+': '+a.cod+' '+b.cod);
await roda({cwd,hook_event_name:'SubagentStop',agent_id:A,agent_type:tipo});await roda({cwd,hook_event_name:'SubagentStop',agent_id:B,agent_type:tipo});}
const ex=fs.readFileSync(path.join(casaP,'.claude','agentes-ultimate','execucoes.jsonl'),'utf8').trim().split('\\n').map(l=>JSON.parse(l));
for(const x of ex){const k=x.id.replace(/^id[ab]/,'');const certo=(x.id.startsWith('ida')?'xa':'xb')+k;if(x.cod!==certo)erros.push('registro '+x.id+': '+x.cod);}
console.log(JSON.stringify({n:ex.length,erros}));})();`;
const casaPar = path.join(tmp, 'casa-paralelo'); fs.mkdirSync(casaPar);
const rp = spawnSync(process.execPath, ['-e', testeParalelo, path.join(RAIZ, 'hooks', 'execucoes.js'), RAIZ, casaPar], { encoding: 'utf8', timeout: 240000 });
let par = {}; try { par = JSON.parse((rp.stdout || '').trim().split('\n').pop()); } catch (e) { /* falhou */ }
caso('código certo: 20 rodadas com dois agentes do mesmo tipo em paralelo (inícios a 5 ms), no painel e no registro', par.n === 40 && par.erros && par.erros.length === 0, rp.stdout + rp.stderr);
// agente em primeiro plano: sem PostToolUse até o fim; o código vem do .meta.json ao lado da transcrição. No Claude Code
// 2.1.302 o .meta.json ainda não existe no SubagentStart (sonda do revisor, b-9): no início vale o palpite pela ordem dos
// pedidos, e o registro do fim usa o .meta.json. O caso do início cobre o caminho para quando ele já existir.
const pMeta = path.join(tmp, 'projeto-meta'); fs.mkdirSync(path.join(pMeta, '.claude', 'base'), { recursive: true });
const dMeta = path.join(tmp, 'sessao-meta', 'subagents'); fs.mkdirSync(dMeta, { recursive: true });
const exeM = (d) => hook('execucoes.js', { cwd: pMeta, transcript_path: path.join(tmp, 'sessao-meta.jsonl'), ...d });
for (const [c, t] of [['fa01', 'tf1'], ['fb02', 'tf2']]) exeM({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_use_id: t, tool_input: { description: `x [cod:${c}]`, subagent_type: 'analista-fpa' } });
for (const [id, c, t] of [['fg2', 'fb02', 'tf2'], ['fg1', 'fa01', 'tf1']]) {
  fs.writeFileSync(path.join(dMeta, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'analista-fpa', description: `x [cod:${c}]`, toolUseId: t }));
  fs.copyFileSync(transcricao(id + '.jsonl', '2026-10-28T08:00:00.000Z', '2026-10-28T08:10:00.000Z'), path.join(dMeta, `agent-${id}.jsonl`));
  exeM({ hook_event_name: 'SubagentStart', agent_id: id, agent_type: 'analista-fpa' });
}
const agM = registro().agentesAgora(pMeta);
caso('código certo em primeiro plano no início, se o .meta.json do agente já existir', (agM.find((x) => x.id === 'fg1') || {}).cod === 'fa01' && (agM.find((x) => x.id === 'fg2') || {}).cod === 'fb02', JSON.stringify(agM));
for (const id of ['fg2', 'fg1']) exeM({ hook_event_name: 'SubagentStop', agent_id: id, agent_type: 'analista-fpa', agent_transcript_path: path.join(dMeta, `agent-${id}.jsonl`) });
const exM = lerJsonl(execArq).filter((x) => /^fg/.test(x.id));
caso('código certo em primeiro plano no registro, pelo .meta.json do agente', exM.length === 2 && exM.find((x) => x.id === 'fg1').cod === 'fa01' && exM.find((x) => x.id === 'fg2').cod === 'fb02', JSON.stringify(exM));

// ---- M-1 · agente parado (TaskStop) ou sessão fechada não fica "trabalhando" ----
const p9 = path.join(tmp, 'projeto9'); const b9 = path.join(p9, '.claude', 'base');
fs.mkdirSync(path.join(b9, '.progresso'), { recursive: true });
const iso9 = (min) => new Date(Date.now() + min * 60000).toISOString();
const hm9 = (min) => new Date(Date.now() + min * 60000).toTimeString().slice(0, 5);
fs.writeFileSync(path.join(b9, '.agentes.jsonl'), [
  { em: iso9(-90), tipo: 'inicio', id: 'h1', agente: 'dev-powerbi', cod: 's1', classe: 'construcao', sessao: 'S1' },   // faixa venceu há 40 min, sem sinal
  { em: iso9(-90), tipo: 'inicio', id: 'h2', agente: 'redator', cod: 's2', classe: 'texto', sessao: 'S1' },            // faixa venceu, mas gravou progresso há pouco
  { em: iso9(-240), tipo: 'inicio', id: 'h3', agente: 'analista-fpa', cod: 's3', classe: 'regras', sessao: 'S1' },     // sem notícia há mais de 2 h
  { em: iso9(-200), tipo: 'inicio', id: 'h4', agente: 'pesquisador', cod: 's4', classe: 'pesquisa', sessao: 'S1' },    // sem faixa, 3 h 20 sem sinal
].map((x) => JSON.stringify(x)).join('\n') + '\n');
// faixas registradas na hora em que cada agente começou (a faixa só vale perto do início da execução: M-7)
for (const [ag9, c, ini, de, ate] of [['dev-powerbi', 's1', -90, -70, -40], ['redator', 's2', -90, -70, -40], ['analista-fpa', 's3', -240, -220, -190]]) {
  fs.appendFileSync(path.join(b9, '.estimativas.jsonl'), JSON.stringify({ em: iso9(ini), agente: ag9, classe: 'outra', cod: c, de: iso9(de), ate: iso9(ate), estimado_min: null }) + '\n');
}
fs.writeFileSync(path.join(b9, '.progresso', 'redator-s2.json'), JSON.stringify({ feito: 2, total: 3, agora: 'revisão final' }));
const R9 = registro();
let ag9 = R9.agentesAgora(p9, { resumo: null });
const est9 = (id) => (ag9.find((x) => x.id === id) || {}).estado;
caso('sem notícia: passou do fim da faixa + 30 min sem progresso', est9('h1') === 'sem-noticia' && est9('h2') === 'trabalhando', JSON.stringify(ag9.map((x) => [x.id, x.estado])));
caso('sem notícia some 2 h depois; sem faixa, o prazo é o início + 3 h', !ag9.some((x) => x.id === 'h3') && est9('h4') === 'sem-noticia', JSON.stringify(ag9.map((x) => [x.id, x.estado])));
fs.appendFileSync(path.join(b9, '.agentes.jsonl'), JSON.stringify({ em: iso9(-5), tipo: 'inicio', id: 'h5', agente: 'redator', cod: 's5', classe: 'texto', sessao: 'S2' }) + '\n');
hook('execucoes.js', { cwd: p9, hook_event_name: 'SessionStart', session_id: 'S2', source: 'startup' });
ag9 = R9.agentesAgora(p9, { resumo: null });
caso('início de sessão tira do painel os agentes sem sinal da sessão anterior (e mantém os da atual)', !ag9.some((x) => ['h1', 'h4'].includes(x.id)) && est9('h5') === 'trabalhando' && est9('h2') === 'trabalhando',
  JSON.stringify(ag9.map((x) => [x.id, x.estado])));
const nEx9 = lerJsonl(execArq).length;
hook('execucoes.js', { cwd: p9, hook_event_name: 'SubagentStop', agent_id: 'h1', agent_type: 'dev-powerbi' });
caso('agente tirado do painel que termina depois ainda entra no registro', lerJsonl(execArq).length === nEx9 + 1 && lerJsonl(execArq).pop().id === 'h1', `${nEx9}`);
caso('o início de sessão chama o registro', /execucoes\.js/.test(JSON.stringify(JSON.parse(fs.readFileSync(path.join(RAIZ, 'hooks', 'hooks.json'), 'utf8')).hooks.SessionStart)), 'sem execucoes.js no SessionStart');

// ---- M-3 · o código é do trabalho: o revisor recebe [revisa:cod] e não herda a faixa nem o código do autor ----
// (p7 já tem a faixa do dev-powerbi com o código ab12)
exe({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_use_id: 'trv1', tool_input: { description: 'revise a rodada [revisa:ab12]', prompt: 'Revise o trabalho [cod:ab12] do dev-powerbi', subagent_type: 'agentes-ultimate:revisor' } });
exe({ hook_event_name: 'SubagentStart', agent_id: 'rv1', agent_type: 'agentes-ultimate:revisor' });
exe({ hook_event_name: 'SubagentStop', agent_id: 'rv1', agent_type: 'agentes-ultimate:revisor', agent_transcript_path: transcricao('rv1.jsonl', '2026-10-28T12:00:00.000Z', '2026-10-28T12:15:00.000Z'),
  last_assistant_message: 'Placar: autor=dev-powerbi cod=ab12 veredito=sim B=0 A=0 M=0 b=0' });
const rv1 = lerJsonl(execArq).find((x) => x.id === 'rv1') || {};
caso('código: o revisor com [revisa:ab12] (e [cod:ab12] só no pedido) não fica com o código nem a faixa do autor', rv1.cod === null && rv1.fonte_estimativa === 'sem' && rv1.classe === 'revisao', JSON.stringify(rv1));
const R10 = registro();
caso('código: a faixa registrada só vale para o mesmo agente', R10.estimativaPara(p7, 'revisor', 'ab12', Date.now()) === null && !!R10.estimativaPara(p7, 'dev-powerbi', 'ab12', Date.now()), 'faixa de outro agente');
re = estimar(['registrar', '--agente', 'revisor', '--cod', 'ab12', '--de', '10:00', '--ate', '10:30']);
const re10 = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), 'faixa', '--agente', 'revisor', '--estimado', '20', '--cod', 'ab12', '--registrar'], { cwd: p7, env, encoding: 'utf8' });
caso('código: estimar.js recusa o código do trabalho de outro agente e explica o [revisa:]', re.status !== 0 && re10.status !== 0 && /\[revisa:ab12\]/.test(re.stderr) &&
  !lerJsonl(path.join(p7, '.claude', 'base', '.estimativas.jsonl')).some((x) => x.agente === 'revisor' && x.cod === 'ab12'), `${re.status} ${re.stderr} | ${re10.status} ${re10.stderr}`);
re = estimar(['registrar', '--agente', 'dev-powerbi', '--cod', 'ab12', '--de', '10:00', '--ate', '10:30']);
caso('código: correção do mesmo trabalho pelo autor reusa o código', re.status === 0, re.stderr);
const skillU = fs.readFileSync(path.join(RAIZ, 'skills', 'ultimate', 'SKILL.md'), 'utf8');
caso('código: a skill ultimate e o eval do revisor usam [revisa:cod] e a correção reusa o código', /\[revisa:/.test(skillU) && /reus/.test(skillU) &&
  /\[revisa:/.test(fs.readFileSync(path.join(RAIZ, 'evals', 'revisor.md'), 'utf8')), 'falta a regra');

// ---- M-4 · % estimado (sem progresso gravado) aparece diferente do informado, e o término respeita a faixa ----
const p11 = path.join(tmp, 'projeto11'); const b11 = path.join(p11, '.claude', 'base');
fs.mkdirSync(path.join(b11, '.progresso'), { recursive: true });
const iso11 = (min) => new Date(Date.now() + min * 60000).toISOString();
const hm11 = (min) => new Date(Date.now() + min * 60000).toTimeString().slice(0, 5);
fs.writeFileSync(path.join(b11, '.agentes.jsonl'), [
  { em: iso11(-10), tipo: 'inicio', id: 'k1', agente: 'redator', cod: 'e1', classe: 'texto' },        // sem progresso
  { em: iso11(-2), tipo: 'inicio', id: 'k2', agente: 'dev-powerbi', cod: 'e2', classe: 'construcao' }, // 1 de 6 em 2 min, faixa de 60–80 min
  { em: iso11(-20), tipo: 'inicio', id: 'k3', agente: 'pesquisador', cod: 'e3', classe: 'pesquisa' },  // 1 de 10 em 20 min, faixa de 25–40 min
].map((x) => JSON.stringify(x)).join('\n') + '\n');
for (const [ag11, c, de, ate] of [['redator', 'e1', 20, 40], ['dev-powerbi', 'e2', 58, 78], ['pesquisador', 'e3', 5, 20]]) estimar(['registrar', '--agente', ag11, '--cod', c, '--de', hm11(de), '--ate', hm11(ate)], p11);
fs.writeFileSync(path.join(b11, '.progresso', 'dev-powerbi-e2.json'), JSON.stringify({ feito: 1, total: 6, agora: 'modelo' }));
fs.writeFileSync(path.join(b11, '.progresso', 'pesquisador-e3.json'), JSON.stringify({ feito: 1, total: 10, agora: 'fontes' }));
const ag11 = registro().agentesAgora(p11, { resumo: null });
const k = (id) => ag11.find((x) => x.id === id) || {};
caso('% estimado: sem progresso gravado o % vem marcado como estimado e o término fica dentro da faixa', k('k1').estimado === true && k('k1').termina <= k('k1').ate && k('k1').termina >= k('k1').de,
  JSON.stringify(k('k1')));
caso('% real: com progresso o % não é estimado e o ritmo é limitado pela faixa (nem antes do início, nem depois do fim)', k('k2').estimado === false && k('k2').termina >= k('k2').de &&
  k('k3').estimado === false && k('k3').termina <= k('k3').ate, JSON.stringify([k('k2'), k('k3')]));
const t11 = (id, ag11b, desc) => ({ id, type: 'local_agent', agentType: ag11b, status: 'running', description: desc, startTime: Date.parse(iso11(-10)) });
br = barra({ cwd: p11, columns: 200, tasks: [t11('a', 'redator', 'texto [cod:e1]'), t11('b', 'dev-powerbi', 'telas [cod:e2]')] });
caso('barra: % estimado com "~", % informado sem', /~\d+%/.test(br.porId.a || '') && !/~/.test(br.porId.b || ''), br.out);
const pag11 = fs.readFileSync(path.join(RAIZ, 'hooks', 'mapa-visual.js'), 'utf8');
caso('painel: barra tracejada e "(estimado)" para o % sem progresso, cheia para o informado', /\.trilho\.estimado/.test(pag11) && /\(estimado\)/.test(pag11) && /repeating-linear-gradient/.test(pag11), 'falta a forma do estimado');

// ---- M-5 · bordas que os mutantes B2, C1 e C2 atravessaram ----
const casaM5 = path.join(tmp, 'casa-m5'); const gM5 = path.join(casaM5, '.claude', 'agentes-ultimate'); fs.mkdirSync(gM5, { recursive: true });
const envM5 = { ...env, HOME: casaM5, USERPROFILE: casaM5 };
const lin = (l) => l.map((x) => JSON.stringify(x)).join('\n') + '\n';
// B2: cascata em par — 2 execuções de agente+classe caem para o nível "agente"; 3 ficam em "agente+classe"
fs.writeFileSync(path.join(gM5, 'execucoes.jsonl'), lin([
  { id: 'q1', agente: 'ag2', classe: 'dados', minutos: 100 }, { id: 'q2', agente: 'ag2', classe: 'dados', minutos: 100 }, { id: 'q3', agente: 'ag2', classe: 'texto', minutos: 10 },
  { id: 'q4', agente: 'ag3', classe: 'dados', minutos: 20 }, { id: 'q5', agente: 'ag3', classe: 'dados', minutos: 20 }, { id: 'q6', agente: 'ag3', classe: 'dados', minutos: 20 },
]));
const fxM5 = (a) => { const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), 'faixa', '--json', '--agente', a, '--classe', 'dados'], { cwd: p7, env: envM5, encoding: 'utf8' });
  try { return JSON.parse(r.stdout); } catch (e) { return { erro: r.stdout + r.stderr }; } };
const f2 = fxM5('ag2'), f3 = fxM5('ag3');
caso('cascata em par: n = 2 cai para o nível de cima (agente), n = 3 fica (agente+classe)', f2.nivel === 'agente' && f2.n === 3 && f3.nivel === 'agente+classe' && f3.n === 3, JSON.stringify([f2, f3]));
// C1 e C2: retrabalho só depois do "não", e "de primeira" por trabalho (código), não por autor
fs.writeFileSync(path.join(gM5, 'execucoes.jsonl'), lin([
  { id: 'w1a', agente: 'dev', cod: 'w1', projeto: 'p1', inicio: '2026-10-28T10:00:00Z', minutos: 10 },
  { id: 'w1b', agente: 'dev', cod: 'w1', projeto: 'p1', inicio: '2026-10-28T12:00:00Z', minutos: 5 },
  { id: 'w2a', agente: 'dev', cod: 'w2', projeto: 'p1', inicio: '2026-10-28T13:00:00Z', minutos: 5 },
]));
fs.writeFileSync(path.join(gM5, 'revisoes.jsonl'), lin([
  { em: '2026-10-28T11:00:00Z', autor: 'dev', cod: 'w1', projeto: 'p1', veredito: 'nao', B: 0, A: 1, M: 0, b: 0 },
  { em: '2026-10-28T14:00:00Z', autor: 'dev', cod: 'w2', projeto: 'p1', veredito: 'sim', B: 0, A: 0, M: 0, b: 0 },
]));
re = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'placar.js'), '--json'], { cwd: p7, env: envM5, encoding: 'utf8' });
let devM5 = {}; try { devM5 = JSON.parse(re.stdout).agentes.dev; } catch (e) { /* falhou */ }
caso('retrabalho: conta só a execução do mesmo trabalho depois do "não" (1, não 2 nem 0)', devM5.retrabalho === 1, re.stdout + re.stderr);
caso('de primeira: é por trabalho; outro código do mesmo autor aprovado de primeira conta (1 de 2)', devM5.revisados === 2 && devM5.de_primeira === 1, re.stdout + re.stderr);
const pC2 = path.join(tmp, 'projeto-c2'); fs.mkdirSync(path.join(pC2, '.claude', 'base'), { recursive: true });
for (const [id, c, v] of [['c2a', 'w1', 'não'], ['c2b', 'w2', 'sim']]) {
  hook('execucoes.js', { cwd: pC2, hook_event_name: 'SubagentStop', agent_id: id, agent_type: 'revisor', last_assistant_message: `Placar: autor=dev cod=${c} veredito=${v} B=0 A=0 M=0 b=0` });
}
re = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'placar.js'), '--json', '--projeto'], { cwd: pC2, env, encoding: 'utf8' });
let devC2 = {}; try { devC2 = JSON.parse(re.stdout).agentes.dev || {}; } catch (e) { /* falhou */ }
caso('de primeira pelo gancho até o placar: a 1ª revisão de outro código do mesmo autor conta (1 de 2)', devC2.revisados === 2 && devC2.de_primeira === 1, re.stdout + re.stderr);

// ---- M-6 · a 2ª revisão do mesmo trabalho não soma de novo o achado que continua aberto ----
const pM6 = path.join(tmp, 'projeto-m6'); fs.mkdirSync(path.join(pM6, '.claude', 'base'), { recursive: true });
const casaM6 = path.join(tmp, 'casa-m6'); fs.mkdirSync(casaM6);
const envM6 = { ...env, HOME: casaM6, USERPROFILE: casaM6 };
const revM6 = (id, linha) => spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'execucoes.js')], { input: JSON.stringify({ cwd: pM6, hook_event_name: 'SubagentStop', agent_id: id, agent_type: 'revisor',
  last_assistant_message: linha }), env: envM6, encoding: 'utf8' });
revM6('n1', 'Placar: autor=dev cod=s1 veredito=não B=0 A=1 M=1 b=0');            // sem ids: o Alto e o Médio continuam abertos na 2ª
revM6('n2', 'Placar: autor=dev cod=s1 veredito=não B=0 A=1 M=1 b=0');
revM6('i1', 'Placar: autor=redator cod=s2 veredito=não B=0 A=1 M=1 b=0 ids=A-1,M-1'); // com ids: A-1 continua, M-1 fechou, M-2 é novo
revM6('i2', 'Placar: autor=redator cod=s2 veredito=não B=0 A=1 M=1 b=0 ids=A-1,M-2');
const rvM6 = lerJsonl(path.join(casaM6, '.claude', 'agentes-ultimate', 'revisoes.jsonl'));
caso('achados: a linha fixa aceita ids e o registro guarda a lista', rvM6.length === 4 && JSON.stringify(rvM6[3].ids) === '["A-1","M-2"]', JSON.stringify(rvM6));
re = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'placar.js'), '--json'], { cwd: pM6, env: envM6, encoding: 'utf8' });
let plM6 = {}; try { plM6 = JSON.parse(re.stdout); } catch (e) { /* falhou */ }
const dM6 = (plM6.agentes || {}).dev || {}, rM6 = (plM6.agentes || {}).redator || {};
caso('achados sem ids: o que continua aberto não conta 2 vezes (A 1, M 1)', dM6.A === 1 && dM6.M === 1, re.stdout + re.stderr);
caso('achados com ids: conta por achado (A-1 uma vez; M-1 e M-2 → M 2) e a taxa usa a mesma conta', rM6.A === 1 && rM6.M === 2 && plM6.captura && plM6.captura.pegos === 5, re.stdout + re.stderr);
caso('revisor e eval pedem os ids na linha fixa', /ids=/.test(fs.readFileSync(path.join(RAIZ, 'agents', 'revisor.md'), 'utf8')) && /ids=/.test(fs.readFileSync(path.join(RAIZ, 'evals', 'revisor.md'), 'utf8')), 'falta ids=');

// ---- b-1 · AGENTES_ULTIMATE_SEM_PASTA=1 desliga também o registro (claude -p aninhado em teste não suja o histórico) ----
const pB1 = path.join(tmp, 'projeto-b1'); fs.mkdirSync(path.join(pB1, '.claude', 'base'), { recursive: true });
const nExB1 = lerJsonl(execArq).length;
for (const d of [{ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_input: { description: 'x [cod:sp01]', subagent_type: 'redator' } },
  { hook_event_name: 'SubagentStart', agent_id: 'sp1', agent_type: 'redator' }, { hook_event_name: 'SubagentStop', agent_id: 'sp1', agent_type: 'redator' }]) {
  spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'execucoes.js')], { input: JSON.stringify({ cwd: pB1, ...d }), env: { ...env, AGENTES_ULTIMATE_SEM_PASTA: '1' }, encoding: 'utf8' });
}
caso('AGENTES_ULTIMATE_SEM_PASTA=1 desliga o registro de execuções', !fs.existsSync(path.join(pB1, '.claude', 'base', '.agentes.jsonl')) && lerJsonl(execArq).length === nExB1, 'gravou');

// ---- b-2 · com histórico de minutos e nenhum estimado, o texto não diz "sem histórico" na base ----
fs.writeFileSync(path.join(gM5, 'execucoes.jsonl'), lin([1, 2, 3].map((i) => ({ id: 'h' + i, agente: 'ag9', classe: 'dados', minutos: 10 * i }))));
const fB2 = (() => { const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), 'faixa', '--json', '--agente', 'ag9', '--classe', 'dados', '--estimado', '30'], { cwd: p7, env: envM5, encoding: 'utf8' });
  try { return JSON.parse(r.stdout); } catch (e) { return { erro: r.stdout + r.stderr }; } })();
caso('faixa: com minutos mas sem estimados, a base mostra o nível certo e só o fator fica "sem histórico"', fB2.nivel === 'agente+classe' && /base n=3 \(agente\+classe\)/.test(fB2.texto) && /fator sem histórico/.test(fB2.texto), JSON.stringify(fB2));

// ---- b-3 · lançador da barra também no $HOME quando ele difere da pasta do usuário (rede corporativa) ----
const casaU = path.join(tmp, 'casa-userprofile'), casaH = path.join(tmp, 'casa-home'); fs.mkdirSync(casaU); fs.mkdirSync(casaH);
spawnSync(process.execPath, [path.join(RAIZ, 'hooks', 'barra.js'), '--instalar'], { input: '{}', env: { ...process.env, USERPROFILE: casaU, HOME: casaH }, encoding: 'utf8' });
const temLanc = (c) => fs.existsSync(path.join(c, '.claude', 'agentes-ultimate', 'barra.js'));
caso('lançador gravado na pasta do usuário e no $HOME quando são diferentes', process.platform !== 'win32' || (temLanc(casaU) && temLanc(casaH)), `${temLanc(casaU)} ${temLanc(casaH)}`);

// ---- b-4 · as duas chamadas do mesmo SubagentStop em paralelo não duplicam nem perdem a linha Placar ----
const testeDuplo = `
const {spawn}=require('child_process'),path=require('path'),fs=require('fs');
const [gancho,casaD,trBase]=process.argv.slice(1);
const env={...process.env,HOME:casaD,USERPROFILE:casaD};
const roda=(d)=>new Promise(ok=>{const p=spawn(process.execPath,[gancho],{env,stdio:['pipe','ignore','ignore']});p.on('close',ok);p.stdin.end(JSON.stringify(d));});
(async()=>{const cwd=path.join(casaD,'proj');fs.mkdirSync(path.join(cwd,'.claude','base'),{recursive:true});
for(let k=0;k<10;k++){const id='dup'+k;const tr=path.join(casaD,id+'.jsonl');
fs.writeFileSync(tr,fs.readFileSync(trBase,'utf8')+JSON.stringify({type:'assistant',timestamp:'2026-10-28T10:30:00Z',message:{content:'Placar: autor=dev cod=dd'+k+' veredito=sim B=0 A=0 M=0 b=0'}})+'\\n');
await roda({cwd,hook_event_name:'SubagentStart',agent_id:id,agent_type:'revisor'});
const base={cwd,hook_event_name:'SubagentStop',agent_id:id,agent_type:'revisor',agent_transcript_path:tr};
await Promise.all([roda({...base,last_assistant_message:'Placar: autor=dev cod=dd'+k+' veredito=sim B=0 A=0 M=0 b=0'}),roda(base)]);}
const ler=(n)=>{try{return fs.readFileSync(path.join(casaD,'.claude','agentes-ultimate',n),'utf8').trim().split('\\n').filter(Boolean).map(l=>JSON.parse(l));}catch(e){return [];}};
console.log(JSON.stringify({exec:ler('execucoes.jsonl').length,rev:ler('revisoes.jsonl').length}));})();`;
const casaDup = path.join(tmp, 'casa-dup'); fs.mkdirSync(casaDup);
const rd = spawnSync(process.execPath, ['-e', testeDuplo, path.join(RAIZ, 'hooks', 'execucoes.js'), casaDup, transcricao('dup-base.jsonl', '2026-10-28T10:00:00.000Z', '2026-10-28T10:20:00.000Z')], { encoding: 'utf8', timeout: 120000 });
let dup = {}; try { dup = JSON.parse((rd.stdout || '').trim().split('\n').pop()); } catch (e) { /* falhou */ }
caso('SubagentStop repetido em paralelo (10 vezes): 1 execução e 1 linha Placar por agente', dup.exec === 10 && dup.rev === 10, rd.stdout + rd.stderr);

// ---- b-6 · código da linha Placar limitado a 16 caracteres, como o [cod:] ----
const nRevB6 = lerJsonl(revArq).length;
hook('execucoes.js', { cwd: p7, hook_event_name: 'SubagentStop', agent_id: 'b6', agent_type: 'revisor', last_assistant_message: 'Placar: autor=dev cod=abcdefghijklmnopqrstuvwxyz veredito=sim B=0 A=0 M=0 b=0' });
caso('linha Placar com código de mais de 16 caracteres não é aceita', lerJsonl(revArq).length === nRevB6, 'aceitou');

// ---- M-7 · a correção que reusa o código não herda a faixa antiga da construção (nem estraga o fator) ----
const p12 = path.join(tmp, 'projeto12'); const b12 = path.join(p12, '.claude', 'base'); fs.mkdirSync(b12, { recursive: true });
const h12 = (min) => new Date(Date.now() + min * 60000).toISOString();
// construção registrada há 6 h (faixa de 2 h, estimado 120 min); a correção começa agora, sem faixa nova
fs.writeFileSync(path.join(b12, '.estimativas.jsonl'), JSON.stringify({ em: h12(-360), agente: 'dev-powerbi', classe: 'construcao', cod: 'cx01', de: h12(-360), ate: h12(-240), estimado_min: 120 }) + '\n');
const exe12 = (d) => hook('execucoes.js', { cwd: p12, ...d });
exe12({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_use_id: 'tc1', tool_input: { description: 'corrija a medida [cod:cx01]', subagent_type: 'agentes-ultimate:dev-powerbi' } });
exe12({ hook_event_name: 'SubagentStart', agent_id: 'cx1', agent_type: 'agentes-ultimate:dev-powerbi' });
const ag12 = (registro().agentesAgora(p12, { resumo: null }) || []).find((x) => x.id === 'cx1') || {};
caso('faixa: a correção com o código da construção não herda a faixa antiga (nada de "passou da previsão" no início)', ag12.estado === 'trabalhando' && ag12.passou == null && ag12.fonte !== 'registrada', JSON.stringify(ag12));
const nowIso = new Date().toISOString(); const tr12 = transcricao('cx1.jsonl', nowIso, new Date(Date.now() + 20 * 60000).toISOString());
exe12({ hook_event_name: 'SubagentStop', agent_id: 'cx1', agent_type: 'agentes-ultimate:dev-powerbi', agent_transcript_path: tr12 });
const ex12 = lerJsonl(execArq).find((x) => x.id === 'cx1') || {};
caso('faixa: a correção sem faixa própria fica fora do fator (fonte "sem", sem estimado)', ex12.fonte_estimativa === 'sem' && ex12.estimado_min == null && ex12.faixa_ate == null && ex12.cod === 'cx01', JSON.stringify(ex12));
// e a faixa registrada para esta execução (logo antes de começar) continua valendo
fs.appendFileSync(path.join(b12, '.estimativas.jsonl'), JSON.stringify({ em: h12(-1), agente: 'dev-powerbi', classe: 'correcao', cod: 'cx01', de: h12(20), ate: h12(40), estimado_min: 30 }) + '\n');
exe12({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_use_id: 'tc2', tool_input: { description: 'corrija de novo [cod:cx01]', subagent_type: 'agentes-ultimate:dev-powerbi' } });
exe12({ hook_event_name: 'SubagentStart', agent_id: 'cx2', agent_type: 'agentes-ultimate:dev-powerbi' });
const ag12b = (registro().agentesAgora(p12, { resumo: null }) || []).find((x) => x.id === 'cx2') || {};
caso('faixa: a faixa registrada logo antes desta execução vale', ag12b.fonte === 'registrada' && ag12b.passou == null, JSON.stringify(ag12b));

// ---- b-8 · abrir outra sessão não tira do painel um agente vivo dentro da faixa ----
const p13 = path.join(tmp, 'projeto13'); const b13 = path.join(p13, '.claude', 'base'); fs.mkdirSync(b13, { recursive: true });
fs.writeFileSync(path.join(b13, '.agentes.jsonl'), JSON.stringify({ em: h12(-35), tipo: 'inicio', id: 'v1', agente: 'redator', cod: 'vv01', classe: 'texto', sessao: 'S1' }) + '\n');
fs.writeFileSync(path.join(b13, '.estimativas.jsonl'), JSON.stringify({ em: h12(-36), agente: 'redator', classe: 'texto', cod: 'vv01', de: h12(20), ate: h12(40), estimado_min: 60 }) + '\n');
hook('execucoes.js', { cwd: p13, hook_event_name: 'SessionStart', session_id: 'S2', source: 'startup' });
const v13 = (registro().agentesAgora(p13, { resumo: null }) || []).find((x) => x.id === 'v1') || {};
caso('início de outra sessão mantém o agente de 35 min sem progresso que ainda está dentro da faixa', v13.estado === 'trabalhando', JSON.stringify(v13));

// ---- b-10 · teto do término pela faixa (mutante M4) e trava do fim sem depender de corrida (mutante M2b) ----
const p14 = path.join(tmp, 'projeto14'); const b14 = path.join(p14, '.claude', 'base'); fs.mkdirSync(path.join(b14, '.progresso'), { recursive: true });
fs.writeFileSync(path.join(b14, '.agentes.jsonl'), JSON.stringify({ em: h12(-20), tipo: 'inicio', id: 't1', agente: 'dev-powerbi', cod: 'tt01', classe: 'construcao' }) + '\n');
fs.writeFileSync(path.join(b14, '.estimativas.jsonl'), JSON.stringify({ em: h12(-21), agente: 'dev-powerbi', classe: 'construcao', cod: 'tt01', de: h12(5), ate: h12(20), estimado_min: 40 }) + '\n');
fs.writeFileSync(path.join(b14, '.progresso', 'dev-powerbi-tt01.json'), JSON.stringify({ feito: 1, total: 6, agora: 'modelo' })); // 17%: o ritmo daria 2 h
const t14 = (registro().agentesAgora(p14, { resumo: null }) || []).find((x) => x.id === 't1') || {};
caso('término pelo ritmo (acima de 15%) não passa do fim da faixa', t14.estimado === false && t14.termina != null && t14.termina <= t14.ate && t14.ate - Date.now() < 25 * 60000, JSON.stringify(t14));
fs.mkdirSync(path.join(b14, '.fins'), { recursive: true });
fs.writeFileSync(path.join(b14, '.fins', 'u1'), ''); // a outra chamada do mesmo SubagentStop está no meio (já criou a trava)
const nEx14 = lerJsonl(execArq).length;
hook('execucoes.js', { cwd: p14, hook_event_name: 'SubagentStop', agent_id: 'u1', agent_type: 'dev-powerbi' });
caso('trava do fim: com a trava já criada pela outra chamada, esta não registra de novo', lerJsonl(execArq).length === nEx14, `${lerJsonl(execArq).length - nEx14} linha(s) a mais`);

// ---- modelo e esforço por tarefa (skill ultimate §1b): só com o aceite; o projeto vence o usuário ----
const pMod = path.join(tmp, 'projeto-modelo'); fs.mkdirSync(path.join(pMod, '.claude', 'base'), { recursive: true });
const cfgUsuMod = path.join(casa, '.claude', 'agentes-ultimate', 'config.json');
const politica = () => /Política de modelo e esforço ATIVA/.test(ctx(rot('monte o painel de custos por centro de custo no power bi', pMod)));
if (fs.existsSync(cfgUsuMod)) fs.rmSync(cfgUsuMod);
const semConfig = politica();
fs.writeFileSync(cfgUsuMod, JSON.stringify({ modelo_por_tarefa: true }));
const usuarioLiga = politica();
fs.writeFileSync(path.join(pMod, '.claude', 'base', 'config.json'), JSON.stringify({ modelo_por_tarefa: false }));
const projetoDesliga = politica();
fs.rmSync(cfgUsuMod);
caso('modelo por tarefa: sem configuração, a linha da política não aparece', semConfig === false, String(semConfig));
caso('modelo por tarefa: o usuário com true liga a política no contexto', usuarioLiga === true, String(usuarioLiga));
caso('modelo por tarefa: o projeto com false desliga, mesmo com o usuário em true', projetoDesliga === false, String(projetoDesliga));

// ---- M-8 · hora "HH:MM" perto da meia-noite cai no dia certo (relógio fixado; não depende da hora real) ----
const p15 = path.join(tmp, 'projeto15'); fs.mkdirSync(path.join(p15, '.claude', 'base'), { recursive: true });
const relogio = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d; };
const reg15 = (agoraFix, de, ate, cod) => { spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'estimar.js'), 'registrar', '--agente', 'redator', '--cod', cod, '--de', de, '--ate', ate],
  { cwd: p15, env: { ...env, AGENTES_ULTIMATE_AGORA: agoraFix.toISOString() }, encoding: 'utf8' });
  return lerJsonl(path.join(p15, '.claude', 'base', '.estimativas.jsonl')).find((x) => x.cod === cod) || {}; };
const min = (a, b) => Math.round((Date.parse(a) - b.getTime()) / 60000);
const a2350 = relogio(23, 50), a0010 = relogio(0, 10);
const m1 = reg15(a2350, '00:10', '00:40', 'mn01'); // depois da meia-noite: amanhã
const m2 = reg15(a2350, '23:30', '00:30', 'mn02'); // atravessa a meia-noite
const m3 = reg15(a0010, '23:40', '23:55', 'mn03'); // logo depois da meia-noite, faixa de ontem
caso('hora perto da meia-noite: às 23h50, "00:10–00:40" é amanhã (+20 e +50 min)', min(m1.de, a2350) === 20 && min(m1.ate, a2350) === 50, JSON.stringify(m1));
caso('hora perto da meia-noite: às 23h50, "23:30–00:30" atravessa a meia-noite (-20 e +40 min)', min(m2.de, a2350) === -20 && min(m2.ate, a2350) === 40, JSON.stringify(m2));
caso('hora perto da meia-noite: às 0h10, "23:40–23:55" é de ontem (-30 e -15 min)', min(m3.de, a0010) === -30 && min(m3.ate, a0010) === -15, JSON.stringify(m3));

// ---- b-13 · faixa que já terminou antes do início da execução não vale (mesmo registrada há menos de 15 min) ----
const p16 = path.join(tmp, 'projeto16'); const b16 = path.join(p16, '.claude', 'base'); fs.mkdirSync(b16, { recursive: true });
fs.writeFileSync(path.join(b16, '.estimativas.jsonl'), JSON.stringify({ em: h12(-14), agente: 'dev-powerbi', classe: 'correcao', cod: 'vz01', de: h12(-10), ate: h12(-5), estimado_min: 5 }) + '\n');
fs.writeFileSync(path.join(b16, '.agentes.jsonl'), JSON.stringify({ em: h12(0), tipo: 'inicio', id: 'z1', agente: 'dev-powerbi', cod: 'vz01', classe: 'correcao' }) + '\n');
const z16 = (registro().agentesAgora(p16, { resumo: null }) || []).find((x) => x.id === 'z1') || {};
caso('faixa vencida antes do início não vale (nada de "passou da previsão" no início)', z16.estado === 'trabalhando' && z16.fonte !== 'registrada' && z16.passou == null, JSON.stringify(z16));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(falhas ? `${falhas} caso(s) falharam` : 'todos os casos passaram');
process.exit(falhas ? 1 : 0);
