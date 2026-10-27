#!/usr/bin/env node
// Mapa visual do projeto: gera .claude/base/MAPA.html (abre no navegador, sem internet) com o grafo — arquivos, quem
// cita quem, registros da memória ligados aos arquivos — e destaca o que o último pedido usou.
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

function gerar(cwd) {
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

  const dados = { projeto: path.basename(cwd), geradoEm: new Date().toISOString(), busca: busca ? { pedido: busca.pedido, em: busca.em } : null, nos, arestas,
    total: Object.keys(g.nos).length, completo: g.completo };
  const html = PAGINA.replace('/*DADOS*/null', JSON.stringify(dados).replace(/</g, '\\u003c'));
  const destino = path.join(cwd, '.claude', 'base', 'MAPA.html');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  return { destino, nos: nos.length, arestas: arestas.length, usados: usados.size + regsUsados.size };
}

const PAGINA = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mapa do projeto</title>
<style>
:root{--fundo:#f6f7fb;--papel:#fff;--tinta:#1d2033;--suave:#6b7085;--linha:#d9dce8;--usado:#12a150;--ligado:#e08a00;--memoria:#7b3fe4;--foco:#e5374b}
@media (prefers-color-scheme:dark){:root{--fundo:#12131a;--papel:#1b1d27;--tinta:#e9eaf2;--suave:#9a9eb3;--linha:#2c2f3d}}
*{box-sizing:border-box}html,body{margin:0;height:100%;background:var(--fundo);color:var(--tinta);font:14px/1.4 system-ui,Segoe UI,sans-serif}
header{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:12px 16px;background:var(--papel);border-bottom:1px solid var(--linha)}
h1{font-size:16px;margin:0}.sub{color:var(--suave);font-size:12px}
input{flex:1;min-width:180px;max-width:360px;padding:8px 10px;border:1px solid var(--linha);border-radius:8px;background:var(--fundo);color:var(--tinta)}
.leg{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--suave)}.leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px}
main{position:relative;height:calc(100% - 64px)}canvas{width:100%;height:100%;display:block;cursor:grab}
#info{position:absolute;right:16px;top:16px;width:min(360px,calc(100% - 32px));background:var(--papel);border:1px solid var(--linha);border-radius:12px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.08);display:none}
#info b{word-break:break-all}#info p{margin:6px 0 0;color:var(--suave)}
#pedido{position:absolute;left:16px;bottom:16px;max-width:min(560px,calc(100% - 32px));background:var(--papel);border:1px solid var(--linha);border-radius:12px;padding:10px 14px;font-size:13px}
#linha{position:absolute;left:16px;top:16px;width:min(340px,calc(100% - 32px));max-height:45%;overflow:auto;background:var(--papel);border:1px solid var(--linha);border-radius:12px;padding:10px 12px;font-size:12px;display:none}
#linha h2{font-size:13px;margin:0 0 6px;display:flex;align-items:center;gap:6px}#linha h2 i{width:8px;height:8px;border-radius:50%;background:var(--usado);display:inline-block;animation:pisca 1.2s infinite}
#linha ol{list-style:none;margin:0;padding:0}#linha li{padding:3px 0;border-top:1px solid var(--linha);word-break:break-all}#linha li b{font-weight:600}
@keyframes pisca{50%{opacity:.25}}
</style></head><body>
<header><div><h1 id="titulo">Mapa do projeto</h1><div class="sub" id="sub"></div></div>
<input id="q" placeholder="Buscar arquivo ou anotação…" aria-label="Buscar">
<div class="leg"><span><i style="background:var(--usado)"></i>usado no último pedido</span><span><i style="background:var(--ligado)"></i>ligado (1 salto)</span><span><i style="background:var(--memoria)"></i>memória</span><span><i style="background:var(--suave)"></i>arquivo</span></div></header>
<main><canvas id="c"></canvas><div id="info"></div><div id="pedido"></div><div id="linha"><h2><i></i>Ao vivo</h2><ol id="eventos"></ol></div></main>
<script>
const D=/*DADOS*/null;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
document.getElementById('titulo').textContent='Mapa do projeto · '+D.projeto;
document.getElementById('sub').textContent=D.nos.length+' pontos, '+D.arestas.length+' ligações'+(D.total>D.nos.length?' (de '+D.total+' arquivos; os mais conectados)':'')+' · gerado '+new Date(D.geradoEm).toLocaleString('pt-BR');
const pe=document.getElementById('pedido');
if(D.busca){pe.innerHTML='<b>Último pedido</b> ('+new Date(D.busca.em).toLocaleString('pt-BR')+')<br>';pe.append(D.busca.pedido);}else pe.textContent='Nenhum pedido registrado ainda: os destaques aparecem depois do próximo pedido.';
const cv=document.getElementById('c'),cx=cv.getContext('2d');let W,H,dpr;
function tam(){dpr=window.devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;}
tam();addEventListener('resize',tam);
const N=D.nos.map((n,i)=>({...n,x:(Math.random()-.5)*600,y:(Math.random()-.5)*600,vx:0,vy:0,g:0}));
for(const [a,b] of D.arestas){N[a].g++;N[b].g++;}
const viz=N.map(()=>[]);for(const [a,b] of D.arestas){viz[a].push(b);viz[b].push(a);}
let cam={x:0,y:0,k:.9},sel=-1,filtro='',calor=1;
function passo(){const k=.02;for(let i=0;i<N.length;i++){const a=N[i];for(let j=i+1;j<N.length;j++){const b=N[j];let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy+.01;if(d2>90000)continue;const f=900/d2;dx*=f;dy*=f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy;}}
for(const [i,j] of D.arestas){const a=N[i],b=N[j];const dx=b.x-a.x,dy=b.y-a.y;const d=Math.sqrt(dx*dx+dy*dy)||1;const f=(d-60)*k;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
for(const n of N){n.vx-=n.x*.002;n.vy-=n.y*.002;n.x+=n.vx*calor;n.y+=n.vy*calor;n.vx*=.6;n.vy*=.6;}calor=Math.max(.05,calor*.995);}
function cor(n){if(n.u===3||n.u===1)return css('--usado');if(n.u===2)return css('--ligado');if(n.t==='r')return css('--memoria');return css('--suave');}
function bate(n){return filtro&&(n.id.toLowerCase().includes(filtro)||n.d.toLowerCase().includes(filtro));}
function desenha(){cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle=css('--fundo');cx.fillRect(0,0,W,H);
cx.setTransform(dpr*cam.k,0,0,dpr*cam.k,dpr*(W/2+cam.x),dpr*(H/2+cam.y));
const viz1=sel>=0?new Set([sel,...viz[sel]]):null;
for(const [a,b,t] of D.arestas){const A=N[a],B=N[b];const usado=A.u&&B.u;const foco=viz1&&viz1.has(a)&&viz1.has(b);
cx.strokeStyle=foco?css('--foco'):usado?css('--usado'):t==='memória'?css('--memoria'):css('--linha');cx.globalAlpha=foco||usado?.9:(viz1?.15:.45);cx.lineWidth=(foco||usado?1.8:.7)/cam.k;cx.beginPath();cx.moveTo(A.x,A.y);cx.lineTo(B.x,B.y);cx.stroke();}
cx.globalAlpha=1;
for(let i=0;i<N.length;i++){const n=N[i];const r=((n.t==='r'?3.5:3+Math.min(6,Math.sqrt(n.g)*1.4))+(n.u?2.5:0))/Math.sqrt(cam.k);const apaga=(viz1&&!viz1.has(i))||(filtro&&!bate(n));
cx.globalAlpha=apaga?.2:1;cx.fillStyle=i===sel?css('--foco'):cor(n);cx.beginPath();if(n.t==='r'){cx.rect(n.x-r,n.y-r,2*r,2*r);}else cx.arc(n.x,n.y,r,0,7);cx.fill();
if(n.u||i===sel||(bate(n)&&cam.k>.3)){cx.fillStyle=css('--tinta');cx.font=(11/cam.k)+'px system-ui';cx.fillText(n.t==='r'?n.d:n.id.split('/').pop(),n.x+r+3/cam.k,n.y+3/cam.k);}}
cx.globalAlpha=1;}
let quadros=0,mexeu=false;
function enquadra(){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const n of N){x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x);y1=Math.max(y1,n.y);}
cam.k=Math.min(2,Math.max(.15,Math.min(W/(x1-x0+80),H/(y1-y0+120))));cam.x=-(x0+x1)/2*cam.k;cam.y=-(y0+y1)/2*cam.k;}
function laco(){for(let s=0;s<2;s++)passo();if(!mexeu&&(++quadros===60||quadros===240))enquadra();desenha();requestAnimationFrame(laco);}laco();
for(let s=0;s<200;s++)passo();enquadra();
function ponto(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-W/2-cam.x)/cam.k,y:(e.clientY-r.top-H/2-cam.y)/cam.k};}
let arr=null;cv.addEventListener('mousedown',e=>{mexeu=true;arr={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,m:false};});cv.addEventListener('wheel',()=>{mexeu=true;});
addEventListener('mousemove',e=>{if(!arr)return;if(Math.abs(e.clientX-arr.x)+Math.abs(e.clientY-arr.y)>3)arr.m=true;cam.x=arr.cx+e.clientX-arr.x;cam.y=arr.cy+e.clientY-arr.y;});
addEventListener('mouseup',e=>{if(arr&&!arr.m)escolhe(ponto(e));arr=null;});
cv.addEventListener('wheel',e=>{e.preventDefault();cam.k=Math.min(4,Math.max(.15,cam.k*(e.deltaY<0?1.12:.89)));},{passive:false});
const info=document.getElementById('info');
function escolhe(p){let m=-1,md=144/(cam.k*cam.k);N.forEach((n,i)=>{const d=(n.x-p.x)**2+(n.y-p.y)**2;if(d<md){md=d;m=i;}});sel=m;
if(m<0){info.style.display='none';return;}const n=N[m];info.style.display='block';info.innerHTML='';const b=document.createElement('b');b.textContent=n.t==='r'?n.id:n.id;info.append(b);
const p1=document.createElement('p');p1.textContent=(n.t==='r'?'Anotação da memória':'Arquivo')+(n.d&&n.t!=='r'?' — '+n.d:'')+' · '+viz[m].length+' ligação(ões)'+(n.u===2?' · ligado ao último pedido':n.u?' · usado no último pedido':'');info.append(p1);
const lst=document.createElement('p');lst.textContent='Liga com: '+viz[m].slice(0,8).map(j=>N[j].t==='r'?N[j].d:N[j].id.split('/').pop()).join(', ')+(viz[m].length>8?'…':'');info.append(lst);}
document.getElementById('q').addEventListener('input',e=>{filtro=e.target.value.trim().toLowerCase();});
// Ao vivo: aberto pelo servidor local, recebe cada arquivo lido/editado e acende o ponto na hora.
const CORES_AG=['#2563eb','#db2777','#0891b2','#ca8a04','#7c3aed','#16a34a','#ea580c','#4f46e5'];const corAg={};
function corDo(a){if(!corAg[a])corAg[a]=a==='principal'?'#2563eb':CORES_AG[(Object.keys(corAg).length+1)%CORES_AG.length];return corAg[a];}
const porId=new Map(N.map((n,i)=>[n.id,i]));
function vivoNo(ev){let i=porId.get(ev.arquivo);if(i===undefined){N.push({t:'a',id:ev.arquivo,d:'(novo)',pasta:'',u:0,x:(Math.random()-.5)*80,y:(Math.random()-.5)*80,vx:0,vy:0,g:0});viz.push([]);i=N.length-1;porId.set(ev.arquivo,i);calor=Math.max(calor,.3);}
const n=N[i];n.vivo={acao:ev.acao,cor:corDo(ev.agente),ate:Date.now()+(ev.acao==='leu'?4000:15000)};n.toques=(n.toques||0)+1;}
const desenhaBase=desenha;desenha=function(){desenhaBase();const agora=Date.now();
cx.setTransform(dpr*cam.k,0,0,dpr*cam.k,dpr*(W/2+cam.x),dpr*(H/2+cam.y));
for(const n of N){if(!n.vivo||n.vivo.ate<agora)continue;const f=(n.vivo.ate-agora)/(n.vivo.acao==='leu'?4000:15000);const r=(8+10*(1-f%1))/Math.sqrt(cam.k);
cx.globalAlpha=.25+.6*f;cx.strokeStyle=n.vivo.acao==='leu'?n.vivo.cor:css('--foco');cx.lineWidth=3/cam.k;cx.beginPath();cx.arc(n.x,n.y,r,0,7);cx.stroke();
cx.globalAlpha=1;cx.fillStyle=css('--tinta');cx.font='600 '+(12/cam.k)+'px system-ui';cx.fillText(n.id.split('/').pop(),n.x+r+3/cam.k,n.y+4/cam.k);}cx.globalAlpha=1;};
if(location.protocol.startsWith('http')){const lin=document.getElementById('linha'),ol=document.getElementById('eventos');lin.style.display='block';
const es=new EventSource('/eventos');es.onmessage=m=>{let ev;try{ev=JSON.parse(m.data);}catch(e){return;}
if(ev.arquivo)vivoNo(ev);const li=document.createElement('li');const hora=new Date(ev.em).toLocaleTimeString('pt-BR');
const b=document.createElement('b');b.textContent=ev.agente;b.style.color=corDo(ev.agente);li.append(hora+' · ',b,' '+ev.acao+' ',ev.arquivo||('"'+(ev.busca||'')+'"'));ol.prepend(li);while(ol.children.length>60)ol.lastChild.remove();};
es.onerror=()=>{lin.querySelector('h2').lastChild.textContent=' Ao vivo (reconectando…)';};es.onopen=()=>{lin.querySelector('h2').lastChild.textContent=' Ao vivo';};}
</script></body></html>`;

module.exports = { gerar };

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
