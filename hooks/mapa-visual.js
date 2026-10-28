#!/usr/bin/env node
// Mapa visual do projeto: gera .claude/base/MAPA.html (abre no navegador, sem internet) com o grafo — arquivos, quem
// cita quem, registros da memória ligados aos arquivos — e destaca o que o último pedido usou. Aberto pelo servidor
// (hooks/mapa-servidor.js), a página se atualiza sozinha: último pedido, grafo refeito e o trabalho dos agentes.
// Uso: node hooks/mapa-visual.js [pasta] [--abrir]
'use strict';
const fs = require('fs');
const path = require('path');
const { obter, config } = require('./grafo');

const MAX_ARQUIVOS = 450;
const MAX_REGISTROS = 250;

function lerRegistros(cwd) {
  const fontes = [['.claude/base/DIARIO.md', 'diário'], ['.claude/base/APRENDIZADOS.md', 'lição'], ['.claude/base/PROJETO.md', 'decisão']];
  for (const m of config(cwd).memoria || []) if (m && m.arquivo) fontes.push([m.arquivo, m.rotulo || 'memória']);
  const out = [];
  for (const [arq, rotulo] of fontes) {
    try {
      for (const l of fs.readFileSync(path.join(cwd, arq), 'utf8').split(/\r?\n/)) if (/^\s*-\s+\S/.test(l)) out.push({ rotulo, texto: l.trim() });
    } catch (e) { /* sem arquivo */ }
  }
  return out;
}

// Os dados do desenho (pontos, ligações, último pedido). O servidor entrega isto em /dados.
function dados(cwd) {
  const g = obter(cwd, 0);
  let busca = null;
  try { busca = JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'base', '.ultima-busca.json'), 'utf8')); } catch (e) { /* sem busca */ }
  const usados = new Set((busca && busca.arquivos || []).map((a) => a.rel));
  const ligados = new Set((busca && busca.arquivos || []).filter((a) => a.ligado).map((a) => a.rel));
  const regsUsados = new Set((busca && busca.registros || []).map((r) => r.texto));

  // Arquivos: os usados primeiro, depois os mais conectados, até o limite.
  const grau = {};
  for (const [rel, n] of Object.entries(g.nos)) { grau[rel] = (grau[rel] || 0) + n.cita.length; for (const c of n.cita) grau[c] = (grau[c] || 0) + 1; }
  const todos = Object.keys(g.nos).filter((r) => !r.startsWith('.claude/base/'));
  const escolhidos = new Set([...usados].filter((r) => g.nos[r]));
  // Arquivo sem nenhuma ligação fica de fora (só espalharia o desenho); os usados entram sempre.
  for (const r of todos.sort((a, b) => (grau[b] || 0) - (grau[a] || 0))) { if (escolhidos.size >= MAX_ARQUIVOS || !grau[r]) break; escolhidos.add(r); }

  const nos = []; const idx = new Map();
  for (const rel of escolhidos) {
    idx.set(rel, nos.length);
    nos.push({ t: 'a', id: rel, d: g.nos[rel].d || '', pasta: path.dirname(rel), u: usados.has(rel) ? (ligados.has(rel) ? 2 : 1) : 0 });
  }
  const arestas = [];
  for (const rel of escolhidos) for (const c of g.nos[rel].cita) if (idx.has(c)) arestas.push([idx.get(rel), idx.get(c), 'cita']);

  // Registros da memória que mencionam algum arquivo do desenho (os usados sempre entram).
  const regs = lerRegistros(cwd);
  let nReg = 0;
  for (const r of regs) {
    const liga = [...escolhidos].filter((rel) => (rel.length >= 6 && r.texto.includes(rel)) || (path.basename(rel).length >= 6 && r.texto.includes(path.basename(rel))));
    const usado = regsUsados.has(r.texto);
    if (!usado && (!liga.length || nReg >= MAX_REGISTROS)) continue;
    const i = nos.length;
    nos.push({ t: 'r', id: r.rotulo + ': ' + r.texto.slice(0, 200), d: r.rotulo, pasta: '§memória', u: usado ? 3 : 0 });
    for (const rel of liga.slice(0, 6)) arestas.push([i, idx.get(rel), 'memória']);
    nReg++;
  }

  return { projeto: path.basename(cwd), geradoEm: new Date().toISOString(), busca: busca ? { pedido: busca.pedido, em: busca.em } : null, nos, arestas,
    total: Object.keys(g.nos).length, completo: g.completo };
}

function gerar(cwd) {
  const d = dados(cwd);
  const json = JSON.stringify(d).replace(/</g, '\\u003c');
  const html = PAGINA.replace('/*DADOS*/null', () => json); // função: "$&" num pedido não vira padrão de troca
  const destino = path.join(cwd, '.claude', 'base', 'MAPA.html');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  return { destino, html, dados: d, nos: d.nos.length, arestas: d.arestas.length, usados: d.nos.filter((n) => n.u).length };
}

const PAGINA = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mapa do projeto</title>
<style>
:root{color-scheme:light dark;--fundo:#f5f6fa;--fundo2:#e7e9f2;--tinta:#191c2e;--suave:#5b6076;--linha:#aeb4c8;--usado:#0f8a47;--ligado:#b86e00;--memoria:#6d3fd1;--foco:#d42f45;--vidro:rgba(255,255,255,.70);--borda:rgba(25,28,46,.11);--sombra:0 12px 32px rgba(25,28,46,.12),0 2px 6px rgba(25,28,46,.06)}
@media (prefers-color-scheme:dark){:root{--fundo:#12141c;--fundo2:#0a0b10;--tinta:#eceef5;--suave:#a6abc0;--linha:#4d546d;--usado:#34c27a;--ligado:#f0a33a;--memoria:#a685f7;--foco:#ff5d6e;--vidro:rgba(30,33,46,.66);--borda:rgba(255,255,255,.10);--sombra:0 12px 32px rgba(0,0,0,.45)}}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{display:flex;flex-direction:column;background:var(--fundo);color:var(--tinta);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
header{display:flex;gap:10px 20px;align-items:center;flex-wrap:wrap;padding:12px 18px;background:var(--vidro);backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4);border-bottom:1px solid var(--borda);position:relative;z-index:3}
h1{font-size:15px;font-weight:650;margin:0;letter-spacing:-.01em}.sub{color:var(--suave);font-size:12px;margin-top:1px}
input{flex:1;min-width:170px;max-width:280px;padding:7px 12px;border:1px solid var(--borda);border-radius:10px;background:var(--fundo);color:var(--tinta);font:inherit;font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s}
input:focus{border-color:var(--usado);box-shadow:0 0 0 3px color-mix(in srgb,var(--usado) 22%,transparent)}
.leg{display:flex;gap:4px 14px;flex-wrap:wrap;font-size:12px;color:var(--suave)}.leg span{white-space:nowrap}
.leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.leg i.q{border-radius:2px}.leg i.l{width:14px;height:2px;border-radius:1px;vertical-align:3px}
.acoes{margin-left:auto;display:flex;gap:8px}
button{font:inherit;font-size:12.5px;font-weight:600;color:var(--tinta);background:var(--fundo);border:1px solid var(--borda);border-radius:999px;padding:6px 14px;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .1s}
button:hover{border-color:var(--suave)}button:active{transform:scale(.97)}button:focus-visible{outline:2px solid var(--usado);outline-offset:2px}
button[aria-pressed="true"]{background:var(--tinta);color:var(--fundo);border-color:var(--tinta)}
#seguir{display:none}.vivo #seguir{display:inline-block}
main{position:relative;flex:1;min-height:0;overflow:hidden}
canvas{width:100%;height:100%;display:block;cursor:grab;touch-action:none}
.vidro{background:var(--vidro);backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);border:1px solid var(--borda);border-radius:14px;box-shadow:var(--sombra)}
#direita{position:absolute;right:16px;top:16px;width:min(340px,calc(100% - 32px));max-height:calc(100% - 84px);display:flex;flex-direction:column;gap:10px;z-index:2;pointer-events:none}
#direita>*{pointer-events:auto}
#info{padding:12px 14px;display:none;font-size:13px;flex:none}
#agentes{display:none;padding:12px 14px 4px;font-size:12.5px;overflow:auto;min-height:0}.vivo #agentes.tem{display:block}
#agentes h2{font-size:12.5px;font-weight:650;margin:0 0 4px;display:flex;align-items:baseline;gap:8px}#agentes h2 .n{margin-left:auto;color:var(--suave);font-weight:500;font-size:12px}
.ag{padding:10px 0 11px;border-top:1px solid var(--borda);animation:entra .35s ease-out;transition:opacity .6s}.ag:first-child{border-top:0}
.ag .lin{display:flex;align-items:center;gap:8px;min-width:0}.ag .pt{width:9px;height:9px;border-radius:50%;flex:none}
.ag b{font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ag .cod{color:var(--suave);font-size:11px;font-weight:500}
.ag .pct{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:650;white-space:nowrap}
.ag .trilho{height:6px;border-radius:999px;background:color-mix(in srgb,var(--suave) 18%,transparent);margin:8px 0 7px;overflow:hidden}
.ag .enche{height:100%;border-radius:999px;transition:width .9s cubic-bezier(.2,.8,.2,1)}
.ag .trilho.sem .enche{width:30%!important;opacity:.55;animation:vai 1.8s ease-in-out infinite}
.ag .etapa{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ag .fim{color:var(--suave);margin-top:2px;font-variant-numeric:tabular-nums}
.ag .fim.atraso{color:var(--foco);font-weight:600}.ag .trilho.estimado .enche{opacity:.85}.ag.feito{opacity:.7}.ag.parado{opacity:.62}.ag.parado .pct{color:var(--suave);font-weight:600}.ag.feito .pct{color:var(--usado)}.ag.chegou{animation:chega 1.2s ease-out}
@keyframes vai{from{transform:translateX(-110%)}to{transform:translateX(340%)}}@keyframes chega{30%{background:color-mix(in srgb,var(--usado) 14%,transparent)}}
#dica{position:absolute;left:0;top:0;max-width:300px;padding:10px 12px;font-size:12.5px;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .15s,transform .15s;z-index:2}
#dica.ver{opacity:1;transform:none}
.ct{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ct b{font-weight:650;word-break:break-all}
.cam{color:var(--suave);font-size:12px;word-break:break-all;margin-top:2px}
#info p,#dica p{margin:6px 0 0;color:var(--suave)}
.etq{font-size:11px;font-weight:600;padding:1px 8px;border-radius:999px;color:#fff;white-space:nowrap}.etq.uso{background:#0f7a3f}.etq.lig{background:#975a00}.etq.mem{background:#5b30b8}
#pedido{position:absolute;left:16px;bottom:16px;max-width:min(560px,calc(55% - 24px));padding:10px 14px;font-size:13px}
#pedido .hora{color:var(--suave);font-size:12px}#pedido .txt{margin-top:2px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
#sessao{position:absolute;right:16px;bottom:16px;max-width:calc(45% - 24px);padding:8px 14px;font-size:12.5px;color:var(--suave);display:none}.vivo #sessao{display:block}
#sessao b{color:var(--tinta);font-weight:650;font-variant-numeric:tabular-nums}#sessao .sep{margin:0 6px;opacity:.6}
#linha{position:absolute;left:16px;top:16px;width:min(320px,calc(100% - 32px));max-height:40%;overflow:auto;padding:10px 12px;font-size:12px;display:none}.vivo #linha{display:block}
#linha h2{font-size:12.5px;font-weight:650;margin:0 0 6px;display:flex;align-items:center;gap:7px}#linha h2 i{width:8px;height:8px;border-radius:50%;background:var(--usado);display:inline-block;animation:pisca 1.6s ease-in-out infinite}
#linha ol{list-style:none;margin:0;padding:0}#linha li{padding:4px 0;border-top:1px solid var(--borda);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:entra .35s ease-out}
#linha .hora{color:var(--suave);margin-right:6px;font-variant-numeric:tabular-nums}#linha .pt{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px}
#linha .vazio{color:var(--suave)}
#aviso{position:absolute;left:50%;top:16px;transform:translate(-50%,-8px);padding:9px 18px 9px 30px;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:opacity .45s,transform .45s;white-space:nowrap;z-index:2}
#aviso::before{content:"";position:absolute;left:13px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--usado)}
#aviso.ver{opacity:1;transform:translate(-50%,0)}
@keyframes pisca{50%{opacity:.3}}@keyframes entra{from{opacity:0;transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head><body>
<header><div><h1 id="titulo">Mapa do projeto</h1><div class="sub" id="sub"></div></div>
<input id="q" placeholder="Buscar arquivo ou anotação…" aria-label="Buscar arquivo ou anotação">
<div class="leg"><span><i style="background:var(--usado)"></i>usado no último pedido</span><span><i style="background:var(--ligado)"></i>ligado (1 salto)</span><span><i class="q" style="background:var(--memoria)"></i>memória</span><span><i style="background:var(--suave)"></i>arquivo</span><span><i class="l" style="background:var(--linha)"></i>cita</span><span><i class="l" style="background:var(--foco)"></i>trilha do trabalho</span></div>
<div class="acoes"><button id="seguir" type="button" aria-pressed="false" title="A câmera acompanha o arquivo que está sendo tocado">Seguir</button><button id="enquadrar" type="button" title="Mostrar o mapa inteiro">Enquadrar</button></div></header>
<main><canvas id="c" aria-label="Grafo do projeto"></canvas><div id="linha" class="vidro"><h2><i></i><span id="estado">Ao vivo</span></h2><ol id="eventos"><li class="vazio">Esperando o Claude trabalhar…</li></ol></div>
<div id="direita"><section id="agentes" class="vidro" aria-label="Agentes agora"><h2><span>Agentes agora</span><span class="n" id="agN"></span></h2><div id="agLista" aria-live="polite"></div></section><div id="info" class="vidro"></div></div><div id="dica" class="vidro" aria-hidden="true"></div><div id="aviso" class="vidro" role="status"></div><div id="pedido" class="vidro"></div><div id="sessao" class="vidro" aria-live="polite"></div></main>
<script>
const D=/*DADOS*/null;
const AO_VIVO=location.protocol.indexOf('http')===0;
const CALMO=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=id=>document.getElementById(id);
const C={};
function lerCores(){const s=getComputedStyle(document.documentElement);['fundo','fundo2','tinta','suave','linha','usado','ligado','memoria','foco'].forEach(k=>{C[k]=s.getPropertyValue('--'+k).trim();});C.escuro=matchMedia('(prefers-color-scheme: dark)').matches;}
lerCores();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',lerCores);}catch(e){}
function rgba(h,a){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')';}
const CORES_PASTA=['#4c6ef5','#0ca678','#e8590c','#ae3ec9','#1098ad','#f59f00','#d6336c','#74b816','#7048e8','#15aabf'];
const CORES_AG=['#1d4ed8','#be185d','#0e7490','#a16207','#6d28d9','#15803d','#c2410c','#4338ca'];
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
const corPasta=g=>CORES_PASTA[hash(g)%CORES_PASTA.length];
const corAg={};function corDo(a){if(!corAg[a])corAg[a]=a==='principal'?CORES_AG[0]:CORES_AG[1+(Object.keys(corAg).filter(x=>x!=='principal').length%(CORES_AG.length-1))];return corAg[a];}
const pl=(n,s,p)=>n+' '+(n===1?s:p);
const nomeAg=a=>String(a||'principal').split(':').pop();
const hm=ms=>{const d=new Date(ms);return d.getHours()+'h'+String(d.getMinutes()).padStart(2,'0');};
const hora=em=>new Date(em).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const nomeCurto=n=>n.t==='r'?n.d:n.id.split('/').pop();
function grupo(n){if(n.t==='r')return '';const p=n.pasta||'';if(!p||p==='.')return '(raiz)';return p.split('/').slice(0,2).join('/');}
const agora=()=>performance.now();
const FONTE='system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';

// ---- pontos e ligações ----
const N=[],E=[],porId=new Map(),chaves=new Map();let viz=[];let calor=1;
function novoNo(n,x,y){const p={t:n.t||'a',id:n.id,d:n.d||'',u:n.u||0,x:x,y:y,rx:x,ry:y,vx:0,vy:0,g:0,ph:Math.random()*6.2832,nasce:agora()};
p.pasta=n.pasta||(p.t==='a'?(n.id.split('/').slice(0,-1).join('/')||'.'):'');p.gr=grupo(p);N.push(p);porId.set(p.id,N.length-1);viz.push([]);return N.length-1;}
function novaLig(a,b,t,x){if(a==null||b==null||a===b)return null;const k=a+'>'+b+'>'+t;if(chaves.has(k))return chaves.get(k);const e={a:a,b:b,t:t,nasce:agora(),quando:Date.now()};
if(x)for(const q in x)e[q]=x[q];chaves.set(k,e);E.push(e);N[a].g++;N[b].g++;viz[a].push(b);viz[b].push(a);return e;}
function refazViz(){viz=N.map(()=>[]);for(const n of N)n.g=0;for(const e of E){N[e.a].g++;N[e.b].g++;viz[e.a].push(e.b);viz[e.b].push(e.a);}}
D.nos.forEach(n=>novoNo(n,(Math.random()-.5)*600,(Math.random()-.5)*600));
D.arestas.forEach(a=>novaLig(a[0],a[1],a[2]));

function passo(){const n=N.length;const cg={};
for(const p of N){if(!p.gr)continue;let c=cg[p.gr];if(!c)c=cg[p.gr]={x:0,y:0,n:0};c.x+=p.x;c.y+=p.y;c.n++;}
for(let i=0;i<n;i++){const a=N[i];for(let j=i+1;j<n;j++){const b=N[j];let dx=a.x-b.x,dy=a.y-b.y;const d2=dx*dx+dy*dy+.01;if(d2>90000)continue;const f=900/d2;dx*=f;dy*=f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy;}}
for(const e of E){const a=N[e.a],b=N[e.b];const dx=b.x-a.x,dy=b.y-a.y;const d=Math.sqrt(dx*dx+dy*dy)||1;const f=(d-(e.t==='memória'?45:60))*.02;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
for(const p of N){const c=p.gr&&cg[p.gr];if(c&&c.n>=3){p.vx+=(c.x/c.n-p.x)*.004;p.vy+=(c.y/c.n-p.y)*.004;}p.vx-=p.x*.002;p.vy-=p.y*.002;
let vx=p.vx*calor,vy=p.vy*calor;const v=Math.sqrt(vx*vx+vy*vy);if(v>25){vx*=25/v;vy*=25/v;}p.x+=vx;p.y+=vy;p.vx*=.6;p.vy*=.6;}
calor=Math.max(.04,calor*.993);}
for(let s=0;s<220;s++)passo();
// entrada em cascata: os mais conectados primeiro, uns 600 ms no total
(function(){const ordem=N.map((n,i)=>i).sort((a,b)=>N[b].g-N[a].g);const t0=agora()+80;ordem.forEach((i,r)=>{N[i].nasce=t0+r/Math.max(1,N.length)*320;});})();

// ---- cabeçalho, pedido ----
el('titulo').textContent='Mapa do projeto · '+D.projeto;
function atualizaSub(g){const na=N.filter(n=>n.t==='a').length;const nl=E.filter(e=>e.t!=='uso').length;
const dt=new Date(g.geradoEm);const hoje=dt.toDateString()===new Date().toDateString();const sb=el('sub');
sb.textContent=pl(N.length,'ponto','pontos')+' · '+pl(nl,'ligação','ligações')+(g.total>na?' · '+g.total+' arquivos no projeto':'')+' · atualizado '+(hoje?hora(dt):dt.toLocaleString('pt-BR'));
sb.title=g.total>na?'O desenho mostra os arquivos mais conectados.':'';}
atualizaSub(D);
function mostraPedido(b){const pe=el('pedido');pe.textContent='';if(!b){pe.textContent='Nenhum pedido registrado ainda: os destaques aparecem depois do próximo pedido.';return;}
const t=document.createElement('b');t.textContent='Último pedido';const h=document.createElement('span');h.className='hora';h.textContent=' · '+new Date(b.em).toLocaleString('pt-BR');
const p=document.createElement('div');p.className='txt';p.textContent=b.pedido||'';pe.append(t,h,p);}
mostraPedido(D.busca);

// ---- tela e câmera ----
const cv=el('c'),cx=cv.getContext('2d');let W=0,H=0,dpr=1;
function tam(){dpr=window.devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
tam();addEventListener('resize',tam);
let cam={x:0,y:0,k:.9},alvoCam=null,ancora=null,kAlvo=.9,inercia={x:0,y:0},mexeu=false,seguir=false,foco=-1,sel=-1,sobre=-1,filtro='',arr=null;
function limites(){if(!N.length)return[-100,-100,100,100];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const n of N){if(n.x<x0)x0=n.x;if(n.y<y0)y0=n.y;if(n.x>x1)x1=n.x;if(n.y>y1)y1=n.y;}return[x0,y0,x1,y1];}
function enquadre(){const b=limites();const k=Math.min(2,Math.max(.12,Math.min(W/(b[2]-b[0]+140),H/(b[3]-b[1]+200))));return{k:k,x:-(b[0]+b[2])/2*k,y:-(b[1]+b[3])/2*k};}
function enquadrar(anima){const a=enquadre();ancora=null;inercia={x:0,y:0};if(anima&&!CALMO)alvoCam=a;else{cam=a;alvoCam=null;}kAlvo=a.k;}
enquadrar(false);
const btSeguir=el('seguir');function poeSeguir(v){seguir=v;btSeguir.setAttribute('aria-pressed',v?'true':'false');if(!v&&alvoCam&&alvoCam.seg)alvoCam=null;}
btSeguir.addEventListener('click',()=>poeSeguir(!seguir));
el('enquadrar').addEventListener('click',()=>{poeSeguir(false);enquadrar(true);});
function movCam(){
if(seguir&&foco>=0&&!arr){const n=N[foco];alvoCam={k:cam.k,x:-n.rx*cam.k,y:-n.ry*cam.k,seg:true};}
if(alvoCam){const s=alvoCam.seg?.05:.12;cam.x+=(alvoCam.x-cam.x)*s;cam.y+=(alvoCam.y-cam.y)*s;
if(!alvoCam.seg){cam.k+=(alvoCam.k-cam.k)*s;kAlvo=cam.k;if(Math.abs(alvoCam.x-cam.x)+Math.abs(alvoCam.y-cam.y)<.5&&Math.abs(alvoCam.k-cam.k)<.002){cam=Object.assign({},{x:alvoCam.x,y:alvoCam.y,k:alvoCam.k});alvoCam=null;}}}
if(!arr&&(inercia.x||inercia.y)){cam.x+=inercia.x;cam.y+=inercia.y;inercia.x*=.92;inercia.y*=.92;if(Math.abs(inercia.x)+Math.abs(inercia.y)<.05)inercia={x:0,y:0};}
if(ancora){const nk=cam.k+(kAlvo-cam.k)*.22;cam.k=nk;cam.x=ancora.sx-W/2-ancora.px*nk;cam.y=ancora.sy-H/2-ancora.py*nk;if(Math.abs(kAlvo-nk)<.0005){cam.k=kAlvo;ancora=null;}}}
const tela=(x,y)=>({x:W/2+cam.x+x*cam.k,y:H/2+cam.y+y*cam.k});
function achar(sx,sy){let m=-1,md=196;for(let i=0;i<N.length;i++){const n=N[i];const p=tela(n.rx,n.ry);const d=(p.x-sx)*(p.x-sx)+(p.y-sy)*(p.y-sy);if(d<md){md=d;m=i;}}return m;}
const local=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId);}catch(x){}arr={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,m:false,ux:e.clientX,uy:e.clientY,ut:agora()};inercia={x:0,y:0};if(alvoCam&&!alvoCam.seg)alvoCam=null;ancora=null;cv.style.cursor='grabbing';});
cv.addEventListener('pointermove',e=>{if(arr){const dx=e.clientX-arr.x,dy=e.clientY-arr.y;if(!arr.m&&Math.abs(dx)+Math.abs(dy)>3){arr.m=true;mexeu=true;poeSeguir(false);escondeDica();}
if(arr.m){cam.x=arr.cx+dx;cam.y=arr.cy+dy;inercia={x:e.clientX-arr.ux,y:e.clientY-arr.uy};arr.ux=e.clientX;arr.uy=e.clientY;arr.ut=agora();}return;}dica(e);});
cv.addEventListener('pointerup',e=>{if(arr&&!arr.m)escolhe(achar(local(e).x,local(e).y));if(arr&&agora()-arr.ut>90)inercia={x:0,y:0};arr=null;cv.style.cursor='grab';});
cv.addEventListener('pointerleave',()=>{if(!arr){sobre=-1;escondeDica();}});
cv.addEventListener('wheel',e=>{e.preventDefault();mexeu=true;if(alvoCam&&!alvoCam.seg)alvoCam=null;const p=local(e);kAlvo=Math.min(4,Math.max(.12,(ancora?kAlvo:cam.k)*(e.deltaY<0?1.2:.83)));
ancora={sx:p.x,sy:p.y,px:(p.x-W/2-cam.x)/cam.k,py:(p.y-H/2-cam.y)/cam.k};},{passive:false});
el('q').addEventListener('input',e=>{filtro=e.target.value.trim().toLowerCase();});

// ---- cartões em vidro ----
function preencheCartao(box,i,completo){const n=N[i];box.textContent='';const t=document.createElement('div');t.className='ct';const b=document.createElement('b');b.textContent=nomeCurto(n);t.append(b);
if(n.u){const s=document.createElement('span');s.className='etq '+(n.u===2?'lig':n.u===3?'mem':'uso');s.textContent=n.u===2?'ligado ao pedido':'usado no pedido';t.append(s);}box.append(t);
const c=document.createElement('div');c.className='cam';c.textContent=n.t==='r'?n.id.slice(n.d.length+2):n.id;box.append(c);
const p=document.createElement('p');p.textContent=(n.t==='r'?'Anotação da memória ('+n.d+')':'Arquivo'+(n.d?' · '+n.d:''))+' · '+pl(viz[i].length,'ligação','ligações');box.append(p);
if(n.ultimo){const q=document.createElement('p');q.textContent='Último toque: '+n.ultimo.agente+' '+n.ultimo.acao+' às '+new Date(n.ultimo.em).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});box.append(q);}
if(completo&&viz[i].length){const l=document.createElement('p');l.textContent='Liga com: '+viz[i].slice(0,8).map(j=>nomeCurto(N[j])).join(', ')+(viz[i].length>8?'…':'');box.append(l);}}
const info=el('info'),dc=el('dica');
function escolhe(i){sel=i;if(i<0){info.style.display='none';return;}preencheCartao(info,i,true);info.style.display='block';escondeDica();}
function escondeDica(){dc.classList.remove('ver');}
function dica(e){const p=local(e);const i=achar(p.x,p.y);sobre=i;cv.style.cursor=i>=0?'pointer':'grab';if(i<0||i===sel){escondeDica();return;}
preencheCartao(dc,i,false);const w=dc.offsetWidth,h=dc.offsetHeight;let x=p.x+16,y=p.y+16;if(x+w>W-8)x=p.x-16-w;if(y+h>H-8)y=p.y-16-h;dc.style.left=Math.max(8,x)+'px';dc.style.top=Math.max(8,y)+'px';dc.classList.add('ver');}

// ---- desenho ----
const easeOut=p=>1-Math.pow(1-p,3);
function easeBack(p){const c=1.7;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2);}
function ent(n,T){if(CALMO)return 1;const p=(T-n.nasce)/280;return p<=0?0:p>=1?1:p;}
function ctrl(A,B){const dx=B.rx-A.rx,dy=B.ry-A.ry;return{x:(A.rx+B.rx)/2-dy*.12,y:(A.ry+B.ry)/2+dx*.12};}
function emCurva(A,Q,B,t){const u=1-t;return{x:u*u*A.rx+2*u*t*Q.x+t*t*B.rx,y:u*u*A.ry+2*u*t*Q.y+t*t*B.ry};}
function bate(n){return !!filtro&&(n.id.toLowerCase().indexOf(filtro)>=0||n.d.toLowerCase().indexOf(filtro)>=0);}
function cor(n){if(n.u===3||n.u===1)return C.usado;if(n.u===2)return C.ligado;if(n.t==='r')return C.memoria;return C.suave;}
const raio=n=>(n.t==='r'?3.4:3+Math.min(6,Math.sqrt(n.g)*1.4))+(n.u?2.2:0);
function caixa(x,y,w,h,r){cx.beginPath();if(cx.roundRect)cx.roundRect(x,y,w,h,r);else cx.rect(x,y,w,h);}
const agentes={};let realceTrilha=false;
function desenha(T){const k=cam.k,ag=Date.now();
cx.setTransform(dpr,0,0,dpr,0,0);const gb=cx.createRadialGradient(W*.5,H*.35,0,W*.5,H*.35,Math.max(W,H)*.85);gb.addColorStop(0,C.fundo);gb.addColorStop(1,C.fundo2);cx.fillStyle=gb;cx.fillRect(0,0,W,H);
cx.setTransform(dpr*k,0,0,dpr*k,dpr*(W/2+cam.x),dpr*(H/2+cam.y));
// regiões das pastas: halo suave atrás dos pontos de cada pasta
const grs={};for(const n of N){if(!n.gr||!ent(n,T))continue;let g=grs[n.gr];if(!g)g=grs[n.gr]={x:0,y:0,n:0,m:[]};g.x+=n.rx;g.y+=n.ry;g.n++;g.m.push(n);}
const regioes=[];for(const nome in grs){const g=grs[nome];if(g.n<3)continue;g.x/=g.n;g.y/=g.n;let s=0;for(const n of g.m)s+=(n.rx-g.x)*(n.rx-g.x)+(n.ry-g.y)*(n.ry-g.y);
const r=Math.sqrt(s/g.n)*1.35+26;const c=corPasta(nome);const gr=cx.createRadialGradient(g.x,g.y,0,g.x,g.y,r);const ha=C.escuro?.08:.14;gr.addColorStop(0,rgba(c,ha));gr.addColorStop(.6,rgba(c,ha/2));gr.addColorStop(1,rgba(c,0));
cx.globalAlpha=1;cx.fillStyle=gr;cx.beginPath();cx.arc(g.x,g.y,r,0,6.2832);cx.fill();regioes.push({nome:nome,x:g.x,y:g.y,r:r,n:g.n});}
// ligações em curva: espessura e opacidade pela relevância
const viz1=sel>=0?new Set([sel].concat(viz[sel])):null;const ativas=[];
for(const e of E){const A=N[e.a],B=N[e.b];const op=Math.min(ent(A,T),ent(B,T));if(op<=0)continue;const Q=ctrl(A,B);
const foco1=viz1&&viz1.has(e.a)&&viz1.has(e.b);const usado=A.u&&B.u&&e.t!=='uso';let c1,al,lw,traco=null;
if(e.t==='uso'){c1=e.cor||C.foco;al=realceTrilha?.85:.5;lw=realceTrilha?2.2:1.6;if(e.prov)traco=[5/k,4/k];}
else if(foco1){c1=C.foco;al=.9;lw=1.8;}else if(usado){c1=C.usado;al=.85;lw=2;}
else{const rel=Math.min(1,Math.log2(1+Math.min(A.g,B.g))/3);c1=e.t==='memória'?C.memoria:C.linha;al=(e.t==='memória'?.2:.28)+.42*rel;lw=.5+1.1*rel;if(viz1)al*=.3;}
if(filtro&&!(bate(A)||bate(B)))al*=.3;cx.globalAlpha=al*op;cx.strokeStyle=c1;cx.lineWidth=lw/k;if(traco)cx.setLineDash(traco);
cx.beginPath();cx.moveTo(A.rx,A.ry);cx.quadraticCurveTo(Q.x,Q.y,B.rx,B.ry);cx.stroke();if(traco)cx.setLineDash([]);
if(op>=1&&(usado||(e.t==='uso'&&(ag-e.quando<180000||realceTrilha))))ativas.push([e,A,B,Q]);}
// partículas correndo no caminho ativo (último pedido e trilha recente)
if(!CALMO){let np=0;for(const a of ativas){if(np>180)break;const e=a[0];const c=e.t==='uso'?(e.cor||C.foco):C.usado;for(let q=0;q<2;q++){const t=(T/1900+q*.5+((e.a*7+e.b*13)%10)/10)%1;
const p=emCurva(a[1],a[3],a[2],t);cx.globalAlpha=Math.sin(t*3.1416)*.9;cx.fillStyle=c;cx.beginPath();cx.arc(p.x,p.y,2.1/k,0,6.2832);cx.fill();np++;}}}
// cometas: a ligação de uso que acabou de nascer
for(const e of E){if(!e.cometa)continue;const p=(T-e.cometa)/1300;if(p>=1){e.cometa=0;continue;}if(p<0)continue;const A=N[e.a],B=N[e.b],Q=ctrl(A,B);const h=easeOut(p);const c=e.cor||C.foco;
for(let s=0;s<12;s++){const t=h-s*.022;if(t<0)break;const pt=emCurva(A,Q,B,t);cx.globalAlpha=(1-s/12)*.9;cx.fillStyle=c;cx.beginPath();cx.arc(pt.x,pt.y,(3.2-s*.2)/k,0,6.2832);cx.fill();}
const ph=emCurva(A,Q,B,h);const gl=cx.createRadialGradient(ph.x,ph.y,0,ph.x,ph.y,11/k);gl.addColorStop(0,rgba(c,.55));gl.addColorStop(1,rgba(c,0));cx.globalAlpha=1;cx.fillStyle=gl;cx.beginPath();cx.arc(ph.x,ph.y,11/k,0,6.2832);cx.fill();}
// pontos (escala e opacidade com easing na entrada)
for(let i=0;i<N.length;i++){const n=N[i];const e=ent(n,T);if(!e)continue;const r=raio(n)*easeBack(e)/Math.sqrt(k);const apaga=(viz1&&!viz1.has(i))||(filtro&&!bate(n));const c=i===sel?C.foco:cor(n);
cx.globalAlpha=(apaga?.2:1)*easeOut(e);
if(n.u&&!apaga){const gl=cx.createRadialGradient(n.rx,n.ry,r*.4,n.rx,n.ry,r*2.8);gl.addColorStop(0,rgba(c,.32));gl.addColorStop(1,rgba(c,0));cx.fillStyle=gl;cx.beginPath();cx.arc(n.rx,n.ry,r*2.8,0,6.2832);cx.fill();}
cx.fillStyle=c;if(n.t==='r')caixa(n.rx-r,n.ry-r,2*r,2*r,r*.35);else{cx.beginPath();cx.arc(n.rx,n.ry,r,0,6.2832);}cx.fill();cx.lineWidth=1/k;cx.strokeStyle=rgba(C.fundo,.9);cx.stroke();
if(i===sobre||i===sel){cx.globalAlpha=1;cx.strokeStyle=c;cx.lineWidth=1.5/k;cx.beginPath();cx.arc(n.rx,n.ry,r+4/k,0,6.2832);cx.stroke();}}
// anéis ao vivo e ondas de arquivo novo
for(const n of N){if(n.vivo&&n.vivo.ate>ag){const dur=n.vivo.acao==='leu'?4000:15000;const f=(n.vivo.ate-ag)/dur;const pu=CALMO?0:(T%1400)/1400;const r=(7+9*pu)/Math.sqrt(k);
cx.globalAlpha=(.25+.6*f)*(1-pu*.6);cx.strokeStyle=n.vivo.acao==='leu'?n.vivo.cor:C.foco;cx.lineWidth=2.4/k;cx.beginPath();cx.arc(n.rx,n.ry,r,0,6.2832);cx.stroke();}
if(n.onda){const d=T-n.onda;if(d>2200)n.onda=0;else for(let q=0;q<3;q++){const p=(d-q*260)/1300;if(p<=0||p>=1)continue;cx.globalAlpha=(1-p)*.55;cx.strokeStyle=n.ondaCor||C.usado;cx.lineWidth=1.6/k;cx.beginPath();cx.arc(n.rx,n.ry,(5+42*easeOut(p))/Math.sqrt(k),0,6.2832);cx.stroke();}}}
// ---- camada da tela: marcadores dos agentes, rótulos e nomes das pastas, sem sobreposição ----
cx.setTransform(dpr,0,0,dpr,0,0);cx.globalAlpha=1;const ocup=[];
const livre=(x,y,w,h)=>{if(x+w<0||y+h<0||x>W||y>H)return false;for(const o of ocup)if(x<o[0]+o[2]&&x+w>o[0]&&y<o[1]+o[3]&&y+h>o[1])return false;ocup.push([x,y,w,h]);return true;};
const marcas=[];const pilha={};
for(const nome in agentes){const a=agentes[nome];if(a.alvo==null)continue;const n=N[a.alvo];a.x+=(n.rx-a.x)*.12;a.y+=(n.ry-a.y)*.12;const s=tela(a.x,a.y);
const pi=pilha[a.alvo]||0;pilha[a.alvo]=pi+1;const pz=a.pousado?Math.min(1,(T-a.pousoT)/600):0;cx.font='600 12px '+FONTE;const w=cx.measureText(a.nome).width+31,h=22;
const x=s.x-w/2,y=s.y-14-h-pi*(h+5)+10*easeOut(pz);if(pz<1)ocup.push([x,y,w,h+6]);marcas.push({a:a,s:s,x:x,y:y,w:w,h:h,pz:pz,pi:pi});}
const cand=[];for(let i=0;i<N.length;i++){const n=N[i];if(!ent(n,T))continue;let p=0;if(i===sel)p=100;else if(i===sobre)p=95;else if(n.vivo&&n.vivo.ate>ag)p=85;else if(n.u)p=n.u===2?70:75;else if(bate(n))p=60;
else if(k>1.25&&n.g>=4)p=10+n.g;else if(k>.5&&n.g>=12)p=5+Math.min(4,n.g*.1);if(p)cand.push([p,i]);}cand.sort((a,b)=>b[0]-a[0]);
const pts=N.map(n=>ent(n,T)?tela(n.rx,n.ry):null);
const semNo=(x,y,w,h,fora)=>{for(let j=0;j<pts.length;j++){const p=pts[j];if(p&&j!==fora&&p.x>x-5&&p.x<x+w+5&&p.y>y-5&&p.y<y+h+5)return false;}return true;};
function rotulo(i,forte){const n=N[i];const s=tela(n.rx,n.ry);const txt=nomeCurto(n);cx.font=(forte?'600 ':'500 ')+'12px '+FONTE;const w=cx.measureText(txt).width;const x=s.x+raio(n)*Math.sqrt(k)+5;
if(!forte&&!semNo(x-2,s.y-9,w+4,18,i))return;if(!livre(x-2,s.y-9,w+4,18))return;cx.lineJoin='round';cx.lineWidth=3.5;cx.strokeStyle=rgba(C.fundo,.85);cx.strokeText(txt,x,s.y+4);cx.fillStyle=C.tinta;cx.fillText(txt,x,s.y+4);}
let nr=0;for(const c of cand){if(c[0]<60)break;if(nr++>60)break;rotulo(c[1],c[0]>=85);}
// nome da pasta na borda de cima do halo (ou na de baixo), nunca em cima de um ponto ou de outro rótulo
cx.font='600 11px '+FONTE;for(const g of regioes.sort((a,b)=>b.n-a.n)){if(g.n<5)continue;const w=cx.measureText(g.nome).width;
for(const lado of [-.9,.9]){const s=tela(g.x,g.y+g.r*lado);const x=s.x-w/2-3,y=s.y-8;if(!semNo(x,y,w+6,16,-1)||!livre(x,y,w+6,16))continue;
cx.lineWidth=3;cx.strokeStyle=rgba(C.fundo,.8);cx.strokeText(g.nome,s.x-w/2,s.y+4);cx.fillStyle=C.suave;cx.fillText(g.nome,s.x-w/2,s.y+4);break;}}
for(const c of cand){if(c[0]>=60)continue;if(nr++>90)break;rotulo(c[1],false);}
for(const m of marcas){const a=m.a;if(m.pz<1){cx.globalAlpha=1-m.pz;cx.shadowColor='rgba(0,0,0,.22)';cx.shadowBlur=10;cx.shadowOffsetY=2;cx.fillStyle=a.cor;caixa(m.x,m.y,m.w,m.h,11);cx.fill();
if(m.pi===0){cx.beginPath();cx.moveTo(m.s.x-5,m.y+m.h-1);cx.lineTo(m.s.x,m.y+m.h+6);cx.lineTo(m.s.x+5,m.y+m.h-1);cx.fill();}cx.shadowColor='transparent';cx.shadowBlur=0;cx.shadowOffsetY=0;
const pa=pctDe(a.nome),rx=m.x+12,ry=m.y+m.h/2;
if(pa!=null){a.anel=a.anel==null?pa:a.anel+(pa-a.anel)*.08;cx.lineWidth=2.2;cx.lineCap='round';cx.strokeStyle='rgba(255,255,255,.32)';cx.beginPath();cx.arc(rx,ry,5.4,0,6.2832);cx.stroke();
cx.strokeStyle='#fff';cx.beginPath();cx.arc(rx,ry,5.4,-1.5708,-1.5708+6.2832*Math.max(.03,Math.min(1,a.anel/100)));cx.stroke();cx.lineCap='butt';}
else{const pu=CALMO?1:.55+.45*Math.sin(T/260);cx.fillStyle='rgba(255,255,255,'+pu+')';cx.beginPath();cx.arc(rx,ry,3.2,0,6.2832);cx.fill();}
cx.font='600 12px '+FONTE;cx.fillStyle='#fff';cx.textBaseline='middle';cx.fillText(a.nome,m.x+22,m.y+m.h/2+.5);cx.textBaseline='alphabetic';}
if(m.pz>0){cx.globalAlpha=m.pz*.9;cx.fillStyle=a.cor;cx.beginPath();cx.arc(m.s.x,m.s.y-11-m.pi*12,4,0,6.2832);cx.fill();cx.lineWidth=1.5;cx.strokeStyle=rgba(C.fundo,.9);cx.stroke();}}
cx.globalAlpha=1;}
let quadros=0;
function laco(){const T=agora();passo();if(calor>.2)passo();const amp=CALMO?0:1.3;for(const n of N){n.rx=n.x+Math.sin(T*.0006+n.ph)*amp;n.ry=n.y+Math.cos(T*.0005+n.ph*1.3)*amp;}
if(++quadros===70&&!mexeu)enquadrar(true);movCam();desenha(T);requestAnimationFrame(laco);}
requestAnimationFrame(laco);

// ---- ao vivo: aberto pelo servidor local, a página se atualiza sozinha (sem F5) ----
const sess={lidos:new Set(),editados:new Set(),criados:new Set(),ultimo:0,fim:false};const vistos=new Set();
function agente(nome){nome=nomeAg(nome);let a=agentes[nome];if(!a)a=agentes[nome]={nome:nome,cor:corDo(nome),alvo:null,x:0,y:0,ultimo:0,pousado:false,pousoT:0,lido:null};return a;}
function lugarNovo(id,ref){if(ref!=null){const p=N[ref];return[p.x+(Math.random()-.5)*50,p.y+(Math.random()-.5)*50];}
const gr=grupo({t:'a',pasta:id.split('/').slice(0,-1).join('/')||'.'});let x=0,y=0,c=0;for(const n of N)if(n.gr===gr){x+=n.x;y+=n.y;c++;}
if(c)return[x/c+(Math.random()-.5)*40,y/c+(Math.random()-.5)*40];return[(Math.random()-.5)*120,(Math.random()-.5)*120];}
function garanteNo(id,ref,c){let i=porId.get(id);if(i!==undefined)return[i,false];const p=lugarNovo(id,ref);i=novoNo({t:'a',id:id,d:'(novo)'},p[0],p[1]);N[i].onda=agora();N[i].ondaCor=c||C.usado;calor=Math.max(calor,.3);return[i,true];}
function item(em,quem,c,txt){const ol=el('eventos');const v=ol.querySelector('.vazio');if(v)v.remove();const li=document.createElement('li');const h=document.createElement('span');h.className='hora';h.textContent=hora(em);li.append(h);
if(quem){const pt=document.createElement('span');pt.className='pt';pt.style.background=c;const b=document.createElement('b');b.textContent=quem;li.append(pt,b,' ');}li.append(txt);li.title=(quem?quem+' ':'')+txt;ol.prepend(li);while(ol.children.length>60)ol.lastChild.remove();}
function atividade(ev,hist){const a=agente(ev.agente||'principal');const quando=Date.parse(ev.em)||Date.now();
if(sess.fim||quando-sess.ultimo>1800000){sess.lidos.clear();sess.editados.clear();sess.criados.clear();sess.fim=false;}sess.ultimo=quando;
a.ultimo=quando;if(!hist){a.pousado=false;realceTrilha=false;}else if(!a.pousado){a.pousado=true;a.pousoT=-1e9;}
if(ev.arquivo){const r=garanteNo(ev.arquivo,ev.acao==='criou'?a.lido:null,a.cor);const i=r[0];const n=N[i];if(a.alvo==null){a.x=n.x;a.y=n.y;}a.alvo=i;
n.ultimo={agente:a.nome,acao:ev.acao,em:quando};if(!hist){n.vivo={acao:ev.acao,cor:a.cor,ate:Date.now()+(ev.acao==='leu'?4000:15000)};foco=i;}
if(ev.acao==='leu'){a.lido=i;sess.lidos.add(ev.arquivo);}
else if(ev.acao==='editou'||ev.acao==='criou'){(ev.acao==='criou'?sess.criados:sess.editados).add(ev.arquivo);
if(a.lido!=null&&a.lido!==i){const e=novaLig(a.lido,i,'uso',{cor:a.cor,prov:r[1]&&ev.acao==='criou'});e.quando=quando;e.cometa=hist||CALMO?0:agora();}}}
item(ev.em,a.nome,a.cor,ev.acao+' '+(ev.arquivo||('"'+(ev.busca||'')+'"')));}
let avisoT=0;function aviso(txt){const av=el('aviso');av.textContent=txt;av.classList.add('ver');clearTimeout(avisoT);avisoT=setTimeout(()=>av.classList.remove('ver'),9000);}
function fim(ev,hist){const T=agora();for(const n in agentes){const a=agentes[n];if(!a.pousado){a.pousado=true;a.pousoT=hist?-1e9:T;}}sess.fim=true;realceTrilha=true;
const l=ev.lidos!=null?ev.lidos:sess.lidos.size,ed=ev.editados!=null?ev.editados:sess.editados.size,cr=ev.criados!=null?ev.criados:sess.criados.size;
const txt='Trabalho concluído · '+pl(l,'lido','lidos')+', '+pl(ed,'editado','editados')+', '+pl(cr,'criado','criados');if(!hist)aviso(txt);item(ev.em,'',null,txt);}
function aplicaBusca(b){const T=agora();for(const n of N)n.u=0;
for(const a of b.arquivos||[]){if(!a||!a.rel)continue;const n=N[garanteNo(a.rel,null,C.usado)[0]];n.u=a.ligado?2:1;if(!CALMO){n.onda=T+Math.random()*300;n.ondaCor=n.u===2?C.ligado:C.usado;}}
for(const r of b.registros||[]){const i=porId.get(r.rotulo+': '+String(r.texto||'').slice(0,200));if(i!==undefined)N[i].u=3;}
mostraPedido(b);calor=Math.max(calor,.15);if(sel>=0)preencheCartao(info,sel,true);item(b.em||new Date().toISOString(),'',null,'Novo pedido: '+String(b.pedido||'').slice(0,90));}
let pedindo=false;
function atualizaGrafo(){if(pedindo)return;pedindo=true;fetch('/dados',{cache:'no-store'}).then(r=>r.json()).then(junta).catch(()=>{}).then(()=>{pedindo=false;});}
// Junta o grafo refeito sem embaralhar: quem já está fica onde está; quem chega entra perto dos vizinhos.
function junta(d){const mapa=new Array(d.nos.length);let resta=[];
d.nos.forEach((n,j)=>{const i=porId.get(n.id);if(i!==undefined){mapa[j]=i;const p=N[i];if(p.d==='(novo)'||!p.d)p.d=n.d;}else resta.push(j);});const novos=resta.length;
const vd={};for(const a of d.arestas){(vd[a[0]]=vd[a[0]]||[]).push(a[1]);(vd[a[1]]=vd[a[1]]||[]).push(a[0]);}
for(let volta=0;volta<3&&resta.length;volta++){const prox=[];for(const j of resta){const vs=(vd[j]||[]).filter(v=>mapa[v]!==undefined);if(!vs.length&&volta<2){prox.push(j);continue;}
let x=0,y=0;if(vs.length){for(const v of vs){x+=N[mapa[v]].x;y+=N[mapa[v]].y;}x=x/vs.length+(Math.random()-.5)*30;y=y/vs.length+(Math.random()-.5)*30;}else{const p=lugarNovo(d.nos[j].id,null);x=p[0];y=p[1];}
mapa[j]=novoNo(d.nos[j],x,y);}resta=prox;}
const reais=new Set();for(const a of d.arestas){novaLig(mapa[a[0]],mapa[a[1]],a[2]);if(a[2]==='cita'){reais.add(mapa[a[0]]);reais.add(mapa[a[1]]);}}
// as ligações provisórias do arquivo novo saem quando chegam as reais de "cita"
let tirou=false;for(let q=E.length-1;q>=0;q--){const e=E[q];if(e.prov&&reais.has(e.b)){chaves.delete(e.a+'>'+e.b+'>'+e.t);E.splice(q,1);tirou=true;}}if(tirou)refazViz();
if(novos){calor=Math.max(calor,.35);if(!mexeu)setTimeout(()=>enquadrar(true),900);}atualizaSub(d);}
function atualizaSessao(){const s=el('sessao');const ag=Date.now();const ativos=Object.values(agentes).filter(a=>!a.pousado&&ag-a.ultimo<180000).length;s.textContent='';
const partes=[['Sessão',null],[sess.lidos.size,sess.lidos.size===1?'lido':'lidos'],[sess.editados.size,sess.editados.size===1?'editado':'editados'],[sess.criados.size,sess.criados.size===1?'criado':'criados'],[ativos,ativos===1?'agente ativo':'agentes ativos']];
partes.forEach((p,i)=>{if(i){const sp=document.createElement('span');sp.className='sep';sp.textContent='·';s.append(sp);}if(p[1]===null){s.append(p[0]);return;}const b=document.createElement('b');b.textContent=p[0];s.append(b,' '+p[1]);});}
// ---- agentes agora: painel com %, etapa e término previsto de cada agente; aviso quando cada um termina ----
let agLista=[];const agEstado={},agCaixa=new Map();
function pctDe(nome){const a=agLista.find(x=>x.estado==='trabalhando'&&nomeAg(x.agente)===nome);return a&&a.pct!=null?a.pct:null;}
const ORDEM_EST={trabalhando:0,'sem-noticia':1,terminou:2};
function textoFim(a){if(a.estado==='sem-noticia')return['sem notícia desde '+hm(a.sinal||a.inicio)+' · parado ou sessão fechada?',false];if(a.estado==='terminou')return['terminou às '+hm(a.fim)+(a.minutos!=null?' · '+Math.round(a.minutos)+' min':''),false];
if(a.passou!=null)return['passou da previsão ('+hm(a.ate)+') · +'+a.passou+' min',true];if(a.termina)return['termina por volta de '+hm(a.termina),false];return['sem previsão ainda',false];}
function aplicaAgentes(ev){const lista=ev.lista||[];const fins=lista.filter(a=>agEstado[a.id]==='trabalhando'&&a.estado==='terminou');
for(const k in agEstado)delete agEstado[k];for(const a of lista)agEstado[a.id]=a.estado;agLista=lista;
for(const a of fins){const nome=nomeAg(a.agente);item(new Date(a.fim||Date.now()).toISOString(),nome,corDo(nome),'terminou'+(a.minutos!=null?' em '+Math.round(a.minutos)+' min':''));
const m=agentes[nome];if(m&&!m.pousado&&!lista.some(x=>x.estado==='trabalhando'&&nomeAg(x.agente)===nome)){m.pousado=true;m.pousoT=agora();}}
if(fins.length)aviso(fins.map(a=>nomeAg(a.agente)+' terminou'+(a.minutos!=null?' · '+Math.round(a.minutos)+' min':'')).join('   ·   '));
desenhaAgentes(fins.map(a=>a.id));}
function desenhaAgentes(chegaram){const box=el('agentes'),ls=el('agLista');const trab=agLista.filter(a=>a.estado==='trabalhando').length;
box.classList.toggle('tem',agLista.length>0);el('agN').textContent=trab?trab+' trabalhando':agLista.some(a=>a.estado==='sem-noticia')?'nenhum trabalhando':'todos terminaram';
const repetidos={};for(const a of agLista){const n=nomeAg(a.agente);repetidos[n]=(repetidos[n]||0)+1;}
const ordem=agLista.slice().sort((x,y)=>((ORDEM_EST[x.estado]||0)-(ORDEM_EST[y.estado]||0))||x.inicio-y.inicio);const vivos=new Set();
for(const a of ordem){vivos.add(a.id);let c=agCaixa.get(a.id);
if(!c){c=document.createElement('div');c.className='ag';c.innerHTML='<div class="lin"><i class="pt"></i><b></b><span class="cod"></span><span class="pct"></span></div><div class="trilho"><div class="enche"></div></div><div class="etapa"></div><div class="fim"></div>';agCaixa.set(a.id,c);}
ls.append(c);const nome=nomeAg(a.agente),feito=a.estado==='terminou',parado=a.estado==='sem-noticia',cor=parado?C.suave:corDo(nome);c.classList.toggle('feito',feito);c.classList.toggle('parado',parado);
if(chegaram&&chegaram.indexOf(a.id)>=0){c.classList.remove('chegou');void c.offsetWidth;c.classList.add('chegou');}
c.querySelector('.pt').style.background=cor;c.querySelector('b').textContent=nome;c.querySelector('.cod').textContent=repetidos[nome]>1&&a.cod?a.cod:'';
const est=!feito&&!parado&&a.estimado&&a.pct!=null;
c.querySelector('.pct').textContent=feito?'pronto':parado?'sem notícia':a.pct!=null?(est?'~'+a.pct+'% (estimado)':a.pct+'%'):'';
c.querySelector('.pct').title=est?'O agente ainda não informou o progresso: o % é o tempo passado sobre a faixa prevista.':'';
const tr=c.querySelector('.trilho'),en=c.querySelector('.enche');tr.classList.toggle('sem',!feito&&a.pct==null);tr.classList.toggle('estimado',est);
en.style.background=feito?C.usado:est?'repeating-linear-gradient(90deg,'+cor+' 0 7px,transparent 7px 11px)':cor;en.style.width=(feito?100:a.pct||0)+'%';
tr.setAttribute('role','progressbar');tr.setAttribute('aria-valuemin','0');tr.setAttribute('aria-valuemax','100');if(a.pct!=null)tr.setAttribute('aria-valuenow',String(feito?100:a.pct));else tr.removeAttribute('aria-valuenow');
c.querySelector('.etapa').textContent=feito?'concluído':(a.etapa||'trabalhando')+(a.total?' · '+a.feito+'/'+a.total:'');
const f=textoFim(a),fe=c.querySelector('.fim');fe.textContent=f[0];fe.classList.toggle('atraso',f[1]);
fe.title=a.de&&a.ate?'faixa '+hm(a.de)+'–'+hm(a.ate)+(a.fonte==='registrada'?' (registrada pelo orquestrador)':' (pelas execuções parecidas)'):'';}
for(const [id,c] of agCaixa)if(!vivos.has(id)){c.remove();agCaixa.delete(id);}}
function aoEvento(ev){if(ev.tipo==='agentes')return aplicaAgentes(ev);if(ev.tipo==='busca')return aplicaBusca(ev);if(ev.tipo==='grafo')return atualizaGrafo();
const chave=(ev.em||'')+'|'+(ev.tipo||'')+'|'+(ev.agente||'')+'|'+(ev.acao||'')+'|'+(ev.arquivo||ev.busca||'');if(vistos.has(chave))return;vistos.add(chave);
const hist=Date.now()-(Date.parse(ev.em)||Date.now())>60000;if(ev.tipo==='fim')fim(ev,hist);else atividade(ev,hist);atualizaSessao();}
if(AO_VIVO){document.body.classList.add('vivo');poeSeguir(true);atualizaSessao();setInterval(atualizaSessao,2000);
const es=new EventSource('/eventos');es.onmessage=m=>{let ev;try{ev=JSON.parse(m.data);}catch(e){return;}aoEvento(ev);};
es.onerror=()=>{el('estado').textContent='Ao vivo (reconectando…)';};es.onopen=()=>{el('estado').textContent='Ao vivo';};}
</script></body></html>`;

module.exports = { gerar, dados };

if (require.main === module) {
  const args = process.argv.slice(2);
  const cwd = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());
  const r = gerar(cwd);
  console.log(`MAPA.html: ${r.nos} pontos, ${r.arestas} ligações, ${r.usados} usados no último pedido → ${r.destino}`);
  if (args.includes('--abrir')) {
    const { spawn } = require('child_process');
    const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', r.destino]] : process.platform === 'darwin' ? ['open', [r.destino]] : ['xdg-open', [r.destino]];
    spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  }
}
