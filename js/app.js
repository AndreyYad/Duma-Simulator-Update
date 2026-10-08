(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=a=>a.reduce((s,v)=>s+v,0);
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const app=$('#app'), toBuild=$('#toBuild');
const plural=(n,a,b,c)=>Math.abs(n)===1?a:c; // English: singular for 1, plural otherwise (the middle form is unused)
const mest=n=>n+' '+plural(n,'seat','seats','seats');

function defaults(set,raw){ raw=raw||{T:DEF_T,F:DEF_F,Q:DEF_Q}; const ix=n=>raw.F.findIndex(f=>f[0]===n);
  return Object.assign({name:'Standard',seats:350,sys:'prop',party:'auto',duo:[-1,-1],year:0,span:true,dshare:50,lowpri:false,thr:0,thron:false,key:'',gate:raw.gate?ix(raw.gate[0]):-1,gnote:raw.gate?raw.gate[1]:'',
  no:(raw.no||[]).map(p=>p.map(ix)),coal:(raw.co||[]).map(x=>({n:x[0],m:x[1].map(ix)})),
  traits:TR.map(([id,n,g])=>({id,n,g})),
  topics:raw.T.map(([n,s,c,lo,hi])=>({n,s,c,lo,hi})),
  fams:raw.F.map(([n,c,d,tr,sm])=>({n,c,d,logo:'',sm:sm!=null?!!sm:(()=>{ const x=/Party-list vote: ([\d.]+)%/.exec(d); return !!x&&parseFloat(x[1].replace(',','.'))<5; })(),tr:Object.assign({},tr),ppl:((raw.P||{})[n]||[]).map(p=>({n:p[0],s:p[1]})),cap:(()=>{ const c=(raw.cap||[]).find(x=>x[0]===n); return c?ix(c[1]):-1; })()})),
  qs:raw.Q.map(([t,d,q,A,B,a,b])=>({t,d,q,A,B,on:true,a:a.slice(),b:b.slice()}))},set||{}); }
const HEX=/^#[0-9a-f]{6}$/i;
// Картинка — либо загруженный файл (data:), либо ссылка http(s)
const isUrl=s=>typeof s==='string'&&/^https?:\/\/\S+$/i.test(s)&&s.length<=2000, okImg=s=>typeof s==='string'&&(s.indexOf('data:image/')===0||isUrl(s))?s:'';
function norm(c){
  if(!c||!Array.isArray(c.topics)||!Array.isArray(c.fams)||!Array.isArray(c.qs)||c.fams.length<2||!c.topics.length) return null;
  c.name=String(c.name||'Untitled').slice(0,60);
  c.seats=Math.max(10,Math.min(1000,Math.round(+c.seats)||350)); c.sys=c.sys==='mixed'?'mixed':'prop';
  c.party=['auto','one','dom','multi'].includes(c.party)?c.party:'multi';
  c.traits=(Array.isArray(c.traits)&&c.traits.length?c.traits:TR.map(([id,n,g])=>({id,n,g}))).filter(x=>x&&x.id).map(x=>({id:String(x.id),n:String(x.n||x.id),g:String(x.g||'Custom')}));
  const ok=new Set(c.traits.map(x=>x.id)), ids=a=>(Array.isArray(a)?a:[]).filter((id,i,arr)=>ok.has(id)&&arr.indexOf(id)===i);
  c.topics=c.topics.map(t=>({n:String(t.n||'Topic'),s:String(t.s||''),c:HEX.test(t.c)?t.c:'#94A8F9',lo:String(t.lo||''),hi:String(t.hi||'')}));
  c.fams=c.fams.slice(0,12).map(f=>{ const tr={}; Object.keys(f.tr||{}).forEach(id=>{ const l=Math.round(+f.tr[id]); if(ok.has(id)&&l>=1&&l<=3) tr[id]=l; });
    return {n:String(f.n||'Party'),c:HEX.test(f.c)?f.c:'#888888',d:String(f.d||''),logo:okImg(f.logo),tr,sm:!!f.sm,cap:Number.isInteger(f.cap)?f.cap:-1,
      ppl:(Array.isArray(f.ppl)?f.ppl:[]).filter(p=>p&&typeof p.n==='string').slice(0,12).map(p=>({n:p.n.slice(0,60),s:PORT.some(x=>x[0]===p.s)?p.s:'',img:okImg(p.img)}))}; });
  c.qs=c.qs.filter(q=>q&&q.t>=0&&q.t<c.topics.length).map(q=>({t:+q.t,d:q.d===-1?-1:1,q:String(q.q||''),A:String(q.A||''),B:String(q.B||''),on:q.on!==false,a:ids(q.a),b:ids(q.b)}));
  const nf=c.fams.length, okf=x=>Number.isInteger(x)&&x>=0&&x<nf;
  c.no=(Array.isArray(c.no)?c.no:[]).filter(p=>Array.isArray(p)&&okf(p[0])&&okf(p[1])&&p[0]!==p[1]).map(p=>[p[0],p[1]]);
  c.coal=(Array.isArray(c.coal)?c.coal:[]).filter(x=>x&&Array.isArray(x.m)).map(x=>({n:String(x.n||'Coalition').slice(0,60),m:x.m.filter(okf)}));
  c.span=c.span!==false; c.year=Math.round(+c.year)||0;
  c.dshare=Number.isFinite(+c.dshare)&&c.dshare!==null&&c.dshare!==undefined?Math.max(0,Math.min(100,Math.round(+c.dshare))):50;
  c.thr=Math.max(0,Math.min(20,Math.round((+c.thr||0)*2)/2)); c.thron=!!c.thron; c.key=typeof c.key==='string'?c.key.slice(0,12):'';
  c.lowpri=c.lowpri===true;
  c.gate=okf(c.gate)?c.gate:-1; c.gnote=String(c.gnote||'').slice(0,400);
  c.fams.forEach((f,i)=>{ if(!okf(f.cap)||f.cap===i) f.cap=-1; });
  c.duo=[0,1].map(k=>{ const v=Math.round(+(c.duo||[])[k]); return v>=0&&v<c.fams.length?v:-1; });
  return c;
}
const KEY='duma-simulator-en-v1', PKEY='duma-simulator-en-presets';
let C=null, USER=[];
try{ C=norm(JSON.parse(localStorage.getItem(KEY))); }catch(e){}
try{ USER=(JSON.parse(localStorage.getItem(PKEY))||[]).filter(p=>p&&p.n&&norm(p.c)); }catch(e){ USER=[]; }
const presetCfg=p=>defaults(Object.assign({name:p.n},p.set),p.raw);
if(!C) C=presetCfg(BUILTIN.find(p=>p.n==='Duma-2021'));
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(C)); }catch(e){} }
// Показывать ли места от округов кольцами: настройка вида, хранится в браузере
let RINGS=true; try{ RINGS=localStorage.getItem('duma-sim-rings')!=='0'; }catch(e){}
function setRings(v){ RINGS=!!v; try{ localStorage.setItem('duma-sim-rings',v?'1':'0'); }catch(e){} }
function saveUser(){ try{ localStorage.setItem(PKEY,JSON.stringify(USER)); return true; }catch(e){ return false; } }

// ══════ Модель ══════
const LV=[{n:'Not important',w:0},{n:'A little',w:1},{n:'Medium',w:2},{n:'Important',w:3.5},{n:'Very',w:5}];
const SV=[0,.35,.7,1], SL=['','weak','moderate','strong'], SIGMA=0.2;
const R={party:'multi',sys:'prop'}; // система, действующая в текущем прохождении
const SK=()=>C.key||C.year; // ключ сценария в DUMA, BILLS и PRES
const FIC=()=>!!(C.year&&typeof DUMA!=='undefined'&&DUMA[SK()]&&DUMA[SK()].fic); // вымышленный сценарий
const thrOn=()=>!!(C.year&&C.thron&&C.thr>0&&(R.party==='multi'||R.party==='dom')), thrTxt=()=>String(C.thr); // проходной барьер для списков
// Пониженный приоритет малых партий: при равной близости малая партия получает PRI от веса обычной
const PRI=.4, pen=f=>C.lowpri&&C.fams[f]&&C.fams[f].sm?-2*SIGMA*SIGMA*Math.log(PRI):0, lowOn=()=>C.lowpri&&C.fams.some(F=>F.sm);
const gateOut=()=>C.gate>=0&&!!C.fams[C.gate]&&S.gv>0; // партия не допущена ответом на первый вопрос
const NEWREG=['DON','LUG','ZAP','KHE']; // регионы, включённые в 2022 году
const maj=()=>Math.floor(C.seats/2)+1, bonus=()=>R.party==='dom'?maj():0, pool=()=>C.seats-bonus();
const distTotal=()=>R.sys==='mixed'?Math.round(pool()*C.dshare/100):0, listTotal=()=>pool()-distTotal();
const enabled=()=>C.qs.filter(q=>q.on);
const S={lv:[],qs:[],pp:[],ans:[],flip:[],i:0,bi:0,order:[],hl:null,open:{},sa:[],si:0};
// Позиция партии на шкале вопроса: насколько сильна её самая выраженная черта за B минус то же за A
function pos(q,F){ const m=ids=>ids.reduce((s,id)=>Math.max(s,SV[F.tr[id]||0]),0); return m(q.b)-m(q.a); }
// Политические координаты: вклад каждой черты в две оси.
// [экономика: −1 государство … +1 рынок, власть: −1 свобода … +1 порядок]
const AX={gos:[-1,0],mkt:[1,0],tax_hi:[-1,0],tax_lo:[1,0],labor:[-1,0],biz:[1,0],nat:[-1,0],priv:[1,0],prot:[-.5,0],welfare:[-1,0],self:[1,0],pub:[-1,0],choice:[1,0],equal:[-1,0],
  soviet:[-.7,.3],agr:[-.3,0],growth:[.3,0],eco:[-.2,0],auth:[0,1],law:[0,1],rehab:[0,-1],privacy:[0,-1],lib:[0,-1],plural:[0,-1],stab:[0,.7],pres:[0,.7],parl:[0,-.5],direct:[0,-.5],
  trad:[0,.6],prog:[0,-.6],rel:[0,.5],sec:[0,-.4],mil:[0,.6],pac:[0,-.6],cent:[0,.6],fed:[0,-.5],nation:[0,.7],cosmo:[0,-.5],imm_anti:[0,.6],imm_pro:[0,-.5],assim:[0,.4],multi:[0,-.4],
  lang_one:[0,.5],lang_min:[0,-.4],unity:[0,.4],sep:[0,-.3],sov:[0,.5],antiwest:[0,.5],west:[0,-.5],euro:[0,-.4],eurasia:[0,.2],pop:[0,.2]};
// s: {черта: сила 0…1}. Чем больше у партии сильных черт одного направления, тем дальше она от центра.
function coords(s){ let x=0,xw=0,y=0,yw=0; Object.keys(s).forEach(id=>{ const a=AX[id], v=s[id]; if(!a||!v) return; x+=v*a[0]; xw+=v*Math.abs(a[0]); y+=v*a[1]; yw+=v*Math.abs(a[1]); }); return [x/(xw+2),y/(yw+2)]; }
const famCoords=F=>{ const s={}; Object.keys(F.tr).forEach(id=>{ s[id]=SV[F.tr[id]]; }); return coords(s); };
// Черты отвечающего: насколько он в среднем склонялся к вариантам, к которым привязана черта
function userCoords(){ const s={}, n={}; S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(v==null) return;
    q.a.forEach(id=>{ s[id]=(s[id]||0)-v; n[id]=(n[id]||0)+1; }); q.b.forEach(id=>{ s[id]=(s[id]||0)+v; n[id]=(n[id]||0)+1; }); });
  const o={}; Object.keys(s).forEach(id=>{ o[id]=Math.max(0,s[id]/n[id]); }); return coords(o); }
function compassBox(withUser){
  const W=360, p0=30, p1=W-30, sc=v=>p0+(Math.max(-1,Math.min(1,v))+1)/2*(p1-p0), mid=W/2;
  const pts=C.fams.map(F=>{ const c=famCoords(F); return {x:sc(c[0]),y:sc(-c[1]),c:F.c,n:F.n}; });
  if(withUser&&S.ans.some(v=>v!=null)){ const c=userCoords(); pts.push({x:sc(c[0]),y:sc(-c[1]),you:true,n:'You'}); }
  let g='<rect x="'+p0+'" y="'+p0+'" width="'+(p1-p0)+'" height="'+(p1-p0)+'" fill="var(--sunk)" stroke="var(--line2)" stroke-width="1"/>'+
    '<line x1="'+mid+'" y1="'+p0+'" x2="'+mid+'" y2="'+p1+'" stroke="var(--line2)" stroke-width="1"/><line x1="'+p0+'" y1="'+mid+'" x2="'+p1+'" y2="'+mid+'" stroke="var(--line2)" stroke-width="1"/>'+
    '<text x="'+mid+'" y="18" text-anchor="middle" class="ax">Order and strong government</text><text x="'+mid+'" y="'+(W-8)+'" text-anchor="middle" class="ax">Freedoms and competition</text>'+
    '<text x="12" y="'+mid+'" text-anchor="middle" class="ax" transform="rotate(-90 12 '+mid+')">State-run economy</text><text x="'+(W-12)+'" y="'+mid+'" text-anchor="middle" class="ax" transform="rotate(90 '+(W-12)+' '+mid+')">Market economy</text>';
  const placed=[]; let labels='';
  pts.slice().sort((a,b)=>a.y-b.y).forEach(p=>{ const t=p.n.length>20?p.n.slice(0,19)+'…':p.n, w=t.length*5.7+4, left=p.x>W*.6, x0=left?p.x-10-w:p.x+10; let y=p.y+3.5;
    for(let k=0;k<8&&placed.some(b=>Math.abs(b.y-y)<11&&x0<b.x1&&x0+w>b.x0);k++) y+=11;
    placed.push({x0,x1:x0+w,y}); labels+='<text x="'+(left?p.x-10:p.x+10).toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="'+(left?'end':'start')+'" class="'+(p.you?'lb you':'lb')+'">'+esc(t)+'</text>'; });
  pts.forEach(p=>{ g+=p.you?'<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="8" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>':'<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="6.5" fill="'+esc(p.c)+'" stroke="var(--surface)" stroke-width="1.5"><title>'+esc(p.n)+'</title></circle>'; });
  return '<div class="box"><h3>Political compass'+(withUser?'':' parties')+'</h3><p class="hint">'+(withUser?'Where you ended up and where the parties stand. Your point is calculated from the same traits that are attached to the answer options.':'Where the parties stand before you start answering. At the end of the test your own point will appear on this map.')+' Positions are derived from ideological traits: the horizontal axis is the economy, the vertical axis is the attitude to authority and freedoms.</p>'+
    '<div class="cmp"><svg viewBox="0 0 '+W+' '+W+'" role="img" aria-label="Political compass of the parties">'+g+labels+'</svg></div></div>';
}
function lr(w,total){ // метод наибольших остатков
  const s=sum(w); if(!s) return w.map(()=>0);
  const raw=w.map(x=>x/s*total), fl=raw.map(Math.floor);
  raw.map((r,i)=>[r-fl[i],i]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]).slice(0,total-sum(fl)).forEach(x=>fl[x[1]]++);
  return fl;
}
function plan(lv,qs){ return {list:lr(lv.map(l=>LV[l].w),listTotal()), dist:lr(qs.map(q=>LV[lv[q.t]].w),distTotal())}; }
function chunkTot(t,P,qs){ let n=P.list[t]; qs.forEach((q,i)=>{ if(q.t===t) n+=P.dist[i]; }); return n; }
// Вопрос как маленькое голосование среди допущенных партий (el): доли по колоколу Гаусса от расстояния до ответа
function shares(i,v,el){ const e=S.pp[i].map((x,f)=>el[f]?(v-x)*(v-x)+pen(f):Infinity), m=Math.min(...e), w=e.map(x=>x===Infinity?0:Math.exp(-(x-m)/(2*SIGMA*SIGMA))), W=sum(w); return w.map(x=>x/W); }
function nearest(i,v,el,w){ let b=-1; S.pp[i].forEach((x,f)=>{ if(!el[f]) return; if(b<0){ b=f; return; } const d=(v-x)*(v-x)+pen(f), bd=(v-S.pp[i][b])*(v-S.pp[i][b])+pen(b); if(d<bd-1e-9||(Math.abs(d-bd)<=1e-9&&w&&w[f]>w[b])) b=f; }); return b; }
// Кто допущен к местам и кто лидер, если считать только темы из scope
function context(scope){
  const nF=C.fams.length, all=C.fams.map((_,f)=>!(gateOut()&&f===C.gate)), sc=Array(nF).fill(0);
  scope.forEach(t=>{ const w=Array(nF).fill(0); let k=0;
    S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(q.t!==t||v==null) return; k++; shares(i,v,all).forEach((x,f)=>w[f]+=x); });
    if(k) w.forEach((x,f)=>sc[f]+=x/k*LV[S.lv[t]].w); });
  const ord=sc.map((_,f)=>f).sort((a,b)=>sc[b]-sc[a]||a-b);
  let el=all;
  if(R.party==='one') el=all.map((_,f)=>f===ord[0]);
  // барьер: партия с долей голосов ниже барьера не получает мест по списку, округа за ней остаются
  const tot=sum(sc.filter((_,f)=>el[f])), vs=sc.map((v,f)=>el[f]&&tot?v/tot:0); let elL=el;
  if(thrOn()&&tot){ elL=el.map((e,f)=>e&&vs[f]*100>=C.thr-1e-9); if(!elL.some(Boolean)) elL=el.map((e,f)=>f===ord[0]); }
  // Доминантная партия определяется только в конце теста: ближайшая по всем ответам или та, которую выбрали на экране результатов
  return {el,elL,vs,dom:R.party==='dom'&&S.fin?(S.dom!=null&&el[S.dom]?S.dom:ord[0]):-1,sc};
}
// Итог одной темы: места по списку + округа. Вопрос “без мнения” округ не разыгрывает: мандаты уходят в список темы.
function block(t,P,X){
  const nF=C.fams.length, w=Array(nF).fill(0), dist=Array(nF).fill(0), wins={}; let n=P.list[t], k=0;
  S.qs.forEach((q,i)=>{ if(q.t!==t) return; const v=S.ans[i]; if(v==null){ n+=P.dist[i]; return; } k++; shares(i,v,X.elL).forEach((x,f)=>w[f]+=x); });
  const ww=k?w:X.elL.map(e=>e?1:0);
  S.qs.forEach((q,i)=>{ if(q.t!==t||S.ans[i]==null) return; const f=nearest(i,S.ans[i],X.el,ww); wins[i]=f; dist[f]+=P.dist[i]; });
  const list=lr(ww,n); return {list,dist,wins,tot:list.map((x,f)=>x+dist[f]),k};
}
// Все блоки тем сразу, с учётом особых условий партий
function blocks(scope,P){ const X=context(scope), bl={}; scope.forEach(t=>{ bl[t]=block(t,P,X); }); applyCaps(scope.map(t=>bl[t])); return {X,bl}; }
// Особое условие: партия получает ровно один одномандатный округ, все остальные её места уходят указанной партии
function applyCaps(bs){ if(R.party==='one'||!bs.length) return;
  C.fams.forEach((F,f)=>{ const g=F.cap; if(!(g>=0)||g===f||!C.fams[g]) return; let kept=false;
    bs.forEach(b=>{ b.list[g]+=b.list[f]; b.list[f]=0; if(b.dist[f]>0){ const keep=kept?0:1; kept=true; b.dist[g]+=b.dist[f]-keep; b.dist[f]=keep; } });
    if(!kept){ const s1=bs.find(b=>b.dist[g]>0), s2=bs.find(b=>b.list[g]>0); if(s1){ s1.dist[g]--; s1.dist[f]++; } else if(s2){ s2.list[g]--; s2.list[f]++; } }
    bs.forEach(b=>{ b.tot=b.list.map((x,k)=>x+b.dist[k]); }); }); }
function totals(scope,P){ const B=blocks(scope,P), st=Array(C.fams.length).fill(0); scope.forEach(t=>B.bl[t].tot.forEach((v,f)=>st[f]+=v)); if(B.X.dom>=0&&scope.length) st[B.X.dom]+=bonus(); return st; }
function themePos(t){ let s=0,n=0; S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(q.t===t&&v!=null){ s+=q.d*v; n++; } }); return n?s/n:null; }
function famPos(f,t){ let s=0,n=0; S.qs.forEach((q,i)=>{ if(q.t===t){ s+=q.d*S.pp[i][f]; n++; } }); return n?s/n:0; }
function leader(st){ let b=0; st.forEach((v,f)=>{ if(v>st[b]) b=f; }); return b; }
const vetoed=(a,b)=>C.no.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
function vetoPair(m){ for(let i=0;i<m.length;i++) for(let j=i+1;j<m.length;j++) if(vetoed(m[i],m[j])) return [m[i],m[j]]; return null; }
const mkey=m=>m.slice().sort((a,b)=>a-b).join(',');
function coName(m){ const k=mkey(m), c=C.coal.find(x=>x.m.length&&mkey(x.m)===k); return c?c.n:''; }
// Порядок партий в конструкторе — ось слева направо. Союз невозможен, если в нём есть пара, отказавшаяся работать вместе,
// а при включённом правиле соседей — если он шире трёх шагов по оси. Союзы с названием показываются первыми.
function coalitions(st){
  const M=maj(), fs=st.map((v,i)=>i).filter(i=>st[i]>0), res=[];
  (function rec(start,cur){
    if(cur.length){ const sp=cur[cur.length-1]-cur[0]; if((C.span&&sp>3)||vetoPair(cur)) return; const tot=sum(cur.map(i=>st[i]));
      if(tot>=M){ if(cur.every(i=>tot-st[i]<M)) res.push({m:cur.slice(),t:tot,sp}); return; } }
    for(let k=start;k<fs.length;k++){ cur.push(fs[k]); rec(k+1,cur); cur.pop(); }
  })(0,[]);
  res.sort((a,b)=>a.m.length-b.m.length||a.sp-b.sp||b.t-a.t);
  const named=C.coal.filter(c=>c.m.length&&c.m.every(f=>st[f]>0)&&!vetoPair(c.m)&&sum(c.m.map(f=>st[f]))>=M).map(c=>({m:c.m.slice().sort((a,b)=>a-b),t:sum(c.m.map(f=>st[f]))})).sort((a,b)=>a.m.length-b.m.length||b.t-a.t);
  const seen={}, out=[]; named.concat(res.slice(0,4)).forEach(c=>{ const k=mkey(c.m); if(!seen[k]){ seen[k]=1; out.push(c); } });
  return out.slice(0,6);
}

// ══════ Зал: d3-parliament ══════
// groups: [{seats, c, k, f, t}] слева направо; k:'d' — места от округов, рисуются кольцами
function drawParl(el,groups,dim,big,sm,onClick,still){
  if(!window.d3||!d3.parliament){ el.innerHTML='<p class="note">The chamber diagram did not load: the d3-parliament library needs an internet connection.</p>'; return; }
  if(!el._p){
    el.innerHTML='<svg viewBox="0 0 600 306" role="img" aria-label="Parliament diagram"><text class="big" x="300" y="266" text-anchor="middle"></text><text class="sm" x="300" y="294" text-anchor="middle"></text></svg>';
    const p=d3.parliament().width(600).innerRadiusCoef(0.4);
    if(reduce||still){ p.enter.smallToBig(false).fromCenter(false); p.update.animate(false); p.exit.bigToSmall(false).toCenter(false); }
    if(onClick) p.on('click',onClick);
    el._p=p;
  }
  const data=groups.filter(g=>g.seats>0), svg=d3.select(el).select('svg');
  if(data.length) svg.datum(data).call(el._p);
  const seats=svg.selectAll('.seat'), rs={}; seats.each(d=>{ rs[d.polar.r.toFixed(2)]=1; });
  const rw=180/Math.max(1,Object.keys(rs).length), g=d=>d.party||{};
  seats.style('fill',d=>RINGS&&g(d).k==='d'?'var(--surface)':g(d).c||'var(--pend)').style('stroke',d=>RINGS&&g(d).k==='d'?g(d).c:'none').style('stroke-width',rw*.14)
    .style('cursor',onClick?'pointer':null).classed('dim',d=>!!dim&&dim(g(d)));
  svg.select('.big').text(big); svg.select('.sm').text(sm);
}
// Фотографии персонажей: своя загруженная или из набора photos.js (свободные снимки с Викисклада)
const PH=window.PHOTO||{}, PHS=window.PHOTO_SRC||{}, LG=window.LOGO||{}, LGS=window.LOGO_SRC||{};
// Логотип партии: свой загруженный или из набора logos.js, подставляется по названию
const lg=F=>F.logo||LG[F.n]||'';
const face=p=>p?(p.img||PH[p.n]||''):'';
const mark=F=>lg(F)?'<img class="logo" src="'+esc(lg(F))+'" alt="" style="border-color:'+esc(F.c)+'">':'<i class="dot" style="background:'+esc(F.c)+'"></i>';

// ══════ 1. Конструктор ══════
const OPEN={}; let PREV=null, PMSG='';
const inp=(k,v,extra)=>'<input class="in" id="f-'+k.replace(/\./g,'-')+'" data-k="'+k+'" value="'+esc(v)+'" '+(extra||'')+'>';
const tname=id=>(C.traits.find(x=>x.id===id)||{n:id}).n;
const groups=()=>{ const g=[]; C.traits.forEach(x=>{ if(!g.includes(x.g)) g.push(x.g); }); return g; };
const cnt=n=>n+' '+plural(n,'question','questions','questions');
function viewBuild(){
  toBuild.hidden=true; window.scrollTo(0,0);
  app.innerHTML='<div class="stack" id="build">'+
  '<div class="intro"><h1>Build your own State Duma</h1><p>Pick an election, from 1993 to 2026: each has its own parties, its own questions of the day and its own impossible alliances. Or set everything up yourself. The respondent moves a slider between two options, and the answers turn into the make-up of the Duma and a cabinet.</p></div>'+
  '<section class="step box"><header><h2>Presets</h2><p class="hint">Ready-made sets and your saved tests. Saved presets are stored in this browser.</p></header>'+
    '<span class="lbl" style="margin:0">State Duma elections</span><div class="presets">'+BUILTIN.map((p,i)=>p.set.year&&!p.h?'<button type="button" class="preset" data-act="pre" data-i="'+i+'" aria-pressed="'+(C.name===p.n)+'"><b>'+esc(p.n)+'</b><span>'+esc(p.d)+'</span></button>':'').join('')+'</div>'+
    '<span class="lbl" style="margin:0">Standard test and my presets</span><div class="presets">'+BUILTIN.map((p,i)=>p.set.year||p.h?'':'<button type="button" class="preset" data-act="pre" data-i="'+i+'" aria-pressed="'+(C.name===p.n)+'"><b>'+esc(p.n)+'</b><span>'+esc(p.d)+'</span></button>').join('')+
      USER.map((p,i)=>'<div class="pwrap"><button type="button" class="preset" data-act="upre" data-i="'+i+'" aria-pressed="'+(C.name===p.n)+'"><b>'+esc(p.n)+'</b><span>My preset · '+mest(p.c.seats)+' · '+p.c.fams.length+' '+plural(p.c.fams.length,'party','parties','parties')+'</span></button><button type="button" class="x" data-act="delPre" data-i="'+i+'" aria-label="Delete preset">×</button></div>').join('')+'</div>'+
    '<div class="psave"><input class="in" id="pname" value="'+esc(C.name)+'" maxlength="60" aria-label="Preset name" placeholder="Preset name"><button type="button" class="chip" data-act="savePre">Save the current test as a preset</button>'+(PREV?'<button type="button" class="link" data-act="undo">Restore the test that was open before loading</button>':'')+'<span class="hint" id="pmsg">'+esc(PMSG)+'</span></div></section>'+
  '<p class="hint sec-hint">Below are the settings of the selected test. The sections are collapsed: open the one you want to change.</p>'+
  '<details class="step box sec" data-o="s1"'+(OPEN.s1?' open':'')+'><summary><span class="num">1</span><h2>Parliament</h2><span class="sec-t"><span class="t-open">Open</span><span class="t-close">Collapse</span></span></summary><div class="sec-b"><div class="parl">'+
    '<div class="parl-form">'+
      '<div><label class="lbl" for="seats">Number of seats</label><div class="seats"><input type="number" id="seats" min="10" max="1000" value="'+C.seats+'"><input type="range" id="seatsR" min="10" max="1000" value="'+C.seats+'" aria-label="Number of seats"></div><div class="chips" id="presets" style="margin-top:8px"></div></div>'+
      '<div><span class="lbl">Political system</span><fieldset class="sys">'+
        [['auto','Chosen by the test','Six opening questions decide which system suits the respondent.'],['multi','Multi-party','All parties share the seats.'],['dom','Dominant-party','The party closest to the answers over the whole test gets the majority; the rest is divided according to the answers.'],['one','One-party','All seats go to the party closest to the answers.']]
          .map(([v,n,d])=>'<label><input type="radio" name="party" id="party-'+v+'" value="'+v+'"'+(C.party===v?' checked':'')+'><b>'+n+'</b><span>'+d+'</span></label>').join('')+'</fieldset></div>'+
      '<div><span class="lbl">How seats are divided</span><fieldset class="sys">'+
        '<label><input type="radio" name="sys" id="sys-prop" value="prop"'+(C.sys==='prop'?' checked':'')+'><b>By party list</b><span>In proportion to how close the parties are to the answers.</span></label>'+
        '<label><input type="radio" name="sys" id="sys-mixed" value="mixed"'+(C.sys==='mixed'?' checked':'')+'><b>Mixed, as in Russia</b><span>Some seats by party list, some by districts: each question is a district.</span></label>'+
        '<div id="dshrow" style="grid-column:1/-1"><label class="lbl" for="dshare" style="margin-top:6px">Share of single-member districts: <b id="dshv"></b></label><input type="range" id="dshare" min="0" max="100" step="5" value="'+C.dshare+'" style="width:100%;accent-color:var(--accent)"><p class="hint" id="dshhint" style="margin:4px 0 0">Applies if the opening questions lead to a mixed system.</p></div>'+
        '<div id="thrrow" style="grid-column:1/-1"'+(C.year?'':' hidden')+'><label class="chk"><input type="checkbox" id="thron"'+(C.thron?' checked':'')+'> Electoral threshold for party lists</label> <input type="number" class="in" id="thr" min="0.5" max="20" step="0.5" value="'+C.thr+'" style="width:86px;display:inline-block;margin-left:8px" aria-label="Electoral threshold, %"> %<p class="hint" style="margin:4px 0 0">A party below the threshold gets no party-list seats; the districts it wins stay with it. The threshold cannot be changed after the test is taken.</p></div>'+
        '<div id="lowrow" style="grid-column:1/-1"'+(C.fams.some(F=>F.sm)?'':' hidden')+'><label class="chk"><input type="checkbox" id="lowpri"'+(C.lowpri?' checked':'')+'> Lower priority for minor parties</label><p class="hint" style="margin:4px 0 0">Minor parties get fewer votes and districts for the same closeness to the answers, so their result is closer to the real one. Minor parties now: '+esc(C.fams.filter(F=>F.sm).map(F=>F.n).join(', '))+'. The minor-party flag is changed in the party card.</p></div>'+
        '<label class="chk" id="ringchk" style="grid-column:1/-1"><input type="checkbox" id="f-rings"'+(RINGS?' checked':'')+'> Show district seats as rings</label>'+
      '</fieldset></div><div class="note" id="parl-note"></div></div>'+
    '<figure class="parl-fig"><div class="hemi" id="parl-h"></div><div class="parl-leg" id="parl-leg"></div></figure>'+
  '</div></div></details>'+
  '<details class="step box sec" data-o="s2"'+(OPEN.s2?' open':'')+'><summary><span class="num">2</span><h2>Ideological traits</h2><span class="sec-t"><span class="t-open">Open</span><span class="t-close">Collapse</span></span></summary><div class="sec-b"><p class="hint">Parties are built from these traits, and the answer options are tied to them too. A party’s position on a question is derived from matching traits.</p>'+
    '<div class="rows">'+groups().map(g=>'<div class="tg"><span>'+esc(g)+'</span><div class="chips">'+C.traits.filter(x=>x.g===g).map(x=>'<span class="tchip">'+esc(x.n)+(g==='Custom'?'<button type="button" class="rm" data-act="delTrait" data-id="'+esc(x.id)+'" aria-label="Delete trait">×</button>':'')+'</span>').join('')+'</div></div>').join('')+
    '<div class="psave"><input class="in" id="newTrait" maxlength="40" placeholder="Your own trait, for example “Monarchism”" aria-label="Name of the new trait"><button type="button" class="chip" data-act="addTrait">+ Add trait</button></div></div></div></details>'+
  '<details class="step sec" data-o="s3"'+(OPEN.s3?' open':'')+'><summary><span class="num">3</span><h2>Parties</h2><span class="sec-t"><span class="t-open">Open</span><span class="t-close">Collapse</span></span></summary><div class="sec-b"><p class="hint">Open a party to set its traits, logo and characters. Clicking a trait changes its strength: weak, moderate, strong, off. The order from top to bottom is the left-to-right axis.</p>'+
    '<div class="rows">'+C.fams.map((F,i)=>'<details class="card" data-o="f'+i+'"'+(OPEN['f'+i]?' open':'')+'><summary><span data-fm="'+i+'">'+mark(F)+'</span><span data-fn="'+i+'">'+esc(F.n)+'</span><small data-ft="'+i+'"></small></summary><div class="c-body" data-fb="'+i+'">'+(OPEN['f'+i]?famBody(i):'')+'</div></details>').join('')+
    (C.fams.length<12?'<button type="button" class="add" data-act="addFam">+ Add party</button>':'')+'</div></div></details>'+
  '<details class="step box sec" data-o="s4"'+(OPEN.s4?' open':'')+'><summary><span class="num">4</span><h2>Coalitions</h2><span class="sec-t"><span class="t-open">Open</span><span class="t-close">Collapse</span></span></summary><div class="sec-b"><p class="hint">Alliance names appear in the results when a coalition has exactly that membership. Refusals to work together are set in the party cards.</p>'+
    '<div class="rows"><div class="note" id="co-veto"></div>'+C.coal.map((c,i)=>'<div class="coed"><div class="f-f" style="grid-template-columns:1fr 30px">'+inp('coal.'+i+'.n',c.n,'aria-label="Coalition name" maxlength="60"')+'<button type="button" class="x" data-act="delCoal" data-i="'+i+'" aria-label="Delete coalition">×</button></div><div class="chips">'+C.fams.map((F,j)=>'<button type="button" class="chip" data-act="coM" data-i="'+i+'" data-j="'+j+'" aria-pressed="'+c.m.includes(j)+'">'+esc(F.n)+'</button>').join('')+'</div><small class="hint" data-cw="'+i+'"></small></div>').join('')+
    '<button type="button" class="add" data-act="addCoal">+ Add a coalition name</button>'+
    '<label class="chk"><input type="checkbox" id="f-span" data-k="span"'+(C.span?' checked':'')+'> Only neighbours on the axis may unite: no more than three steps apart</label></div></div></details>'+
  '<details class="step sec" data-o="s5"'+(OPEN.s5?' open':'')+'><summary><span class="num">5</span><h2>Topics and questions</h2><span class="sec-t"><span class="t-open">Open</span><span class="t-close">Collapse</span></span></summary><div class="sec-b"><p class="hint">Each answer option has its own traits: parties with those traits are drawn to it. The dots under a question show where the parties end up.</p>'+
    '<div class="rows">'+C.topics.map((T,t)=>'<details class="card" data-o="t'+t+'"'+(OPEN['t'+t]?' open':'')+'><summary><i class="dot" data-tc="'+t+'" style="background:'+esc(T.c)+'"></i><span data-tn="'+t+'">'+esc(T.n)+'</span><small data-tq="'+t+'"></small></summary><div class="c-body" data-tb="'+t+'">'+(OPEN['t'+t]?topicBody(t):'')+'</div></details>').join('')+
    '<button type="button" class="add" data-act="addTopic">+ Add topic</button></div></div></details>'+
  '<details class="io box" data-o="io"'+(OPEN.io?' open':'')+'><summary>Move the test to another device</summary><p class="hint">Copy the text below and paste it into the test on another device.</p>'+
    '<textarea class="in" id="io" spellcheck="false" aria-label="The test as text"></textarea><div class="r"><button type="button" class="chip" data-act="exp">Show the current test</button><button type="button" class="chip" data-act="copy">Copy</button><button type="button" class="chip" data-act="imp">Load from text</button><span class="hint" id="io-msg"></span></div></details>'+
  '<div class="launch"><button type="button" class="cta" data-act="run" id="run">Start the test</button><span id="run-info"></span></div>'+
  '</div>';
  const root=$('#build');
  root.addEventListener('input',onInput); root.addEventListener('click',onAct); root.addEventListener('change',onChange);
  root.addEventListener('toggle',e=>{ const d=e.target, o=d.dataset&&d.dataset.o; if(!o) return; OPEN[o]=d.open; const b=d.querySelector('.c-body');
    if(o[0]==='s'){ if(d.open&&o==='s1') updParl(); return; } // раздел настройки: схему зала нужно перерисовать, когда она стала видна
    if(d.open&&b&&!b.innerHTML) b.innerHTML=o[0]==='f'?famBody(+o.slice(1)):topicBody(+o.slice(1)); },true);
  $('#seats').addEventListener('change',()=>{ $('#seats').value=C.seats; });
  updParl(); updMeta(); updCo();
}
function updCo(){
  const v=$('#co-veto'); if(!v) return;
  v.textContent=C.no.length?'Won’t work together: '+C.no.map(p=>C.fams[p[0]].n+' and '+C.fams[p[1]].n).join('; ')+'.':'No refusals: any parties can join the same coalition.';
  C.coal.forEach((c,i)=>{ const el=$('[data-cw="'+i+'"]'); if(!el) return; const vp=vetoPair(c.m); el.textContent=vp?'This alliance is impossible: “'+C.fams[vp[0]].n+'” and “'+C.fams[vp[1]].n+'” refuse to work together.':''; });
}
function famBody(i){
  const F=C.fams[i];
  return '<div class="f-f"><input type="color" id="f-fams-'+i+'-c" data-k="fams.'+i+'.c" value="'+esc(F.c)+'" aria-label="Colour">'+inp('fams.'+i+'.n',F.n,'aria-label="Party name"')+'<span class="fd">'+inp('fams.'+i+'.d',F.d,'aria-label="Description" placeholder="Short description"')+'</span><button type="button" class="x" data-act="delFam" data-i="'+i+'" aria-label="Delete party"'+(C.fams.length<=2?' disabled':'')+'>×</button></div>'+
    '<div class="f-logo">'+(lg(F)?'<img class="logo" src="'+esc(lg(F))+'" alt="Logo" style="border-color:'+esc(F.c)+'">':'<span class="ph">logo</span>')+'<label for="logo-'+i+'">Logo</label><input type="file" id="logo-'+i+'" data-logo="'+i+'" accept="image/*"><button type="button" class="chip" data-act="logoUrl" data-i="'+i+'">Set by link</button>'+(F.logo?'<button type="button" class="link" data-act="delLogo" data-i="'+i+'">Remove logo</button>':'')+'</div>'+
    '<div class="tg"><span>Size</span><div><label class="chk"><input type="checkbox" id="sm-'+i+'" data-sm="'+i+'"'+(F.sm?' checked':'')+'> Minor party: its priority is lowered if this is switched on in the parliament settings</label></div></div>'+
    '<div class="tg"><span>Special rule</span><div><select class="in" id="f-fams-'+i+'-cap" data-k="fams.'+i+'.cap" data-int="1" aria-label="Special rule for the party"><option value="-1">None: seats are counted as for everyone else</option>'+C.fams.map((G,j)=>j===i?'':'<option value="'+j+'"'+(F.cap===j?' selected':'')+'>Only one single-member district; all other seats go to “'+esc(G.n)+'”</option>').join('')+'</select></div></div>'+
    '<div class="tg"><span>Characters</span><div class="ppl">'+F.ppl.map((p,j)=>'<div class="pp">'+(face(p)?'<img class="ava sm" src="'+esc(face(p))+'" alt="">':'<span class="ava sm ph"></span>')+inp('fams.'+i+'.ppl.'+j+'.n',p.n,'aria-label="Character name" maxlength="60" placeholder="Name"')+'<select class="in" id="f-fams-'+i+'-ppl-'+j+'-s" data-k="fams.'+i+'.ppl.'+j+'.s" aria-label="Preferred portfolio"><option value="">'+(j?'No specialty':'Leader, no specialty')+'</option>'+PORT.filter(x=>x[0]!=='pm').map(x=>'<option value="'+x[0]+'"'+(p.s===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+'</select><label class="chip up" title="Upload your own photo">Photo<input type="file" accept="image/*" id="pimg-'+i+'-'+j+'" data-pimg="'+i+','+j+'" hidden></label><button type="button" class="chip" data-act="pimgUrl" data-i="'+i+'" data-j="'+j+'" title="Set a photo by link">Link</button><button type="button" class="x" data-act="delP" data-i="'+i+'" data-j="'+j+'" aria-label="Delete character">×</button></div>').join('')+
      (F.ppl.length<12?'<button type="button" class="add" data-act="addP" data-i="'+i+'">+ Add character</button>':'')+'<small class="hint">The first on the list is the leader: they become prime minister if the party heads the government. The specialty hints at which ministry suits the person. The photo is matched by name; you can upload your own with the “Photo” button or set one with the “Link” button.</small></div></div>'+
    '<div class="tg"><span>Will not join a coalition with</span><div class="chips">'+C.fams.map((G,j)=>j===i?'':'<button type="button" class="chip veto" data-act="veto" data-i="'+i+'" data-j="'+j+'" aria-pressed="'+vetoed(i,j)+'">'+esc(G.n)+'</button>').join('')+'</div></div>'+
    groups().map(g=>'<div class="tg"><span>'+esc(g)+'</span><div class="chips">'+C.traits.filter(x=>x.g===g).map(x=>{ const l=F.tr[x.id]||0; return '<button type="button" class="tchip" data-act="tr" data-i="'+i+'" data-id="'+esc(x.id)+'" data-l="'+l+'" aria-pressed="'+(l>0)+'">'+esc(x.n)+'<small>'+SL[l]+'</small></button>'; }).join('')+'</div></div>').join('');
}
function topicBody(t){
  const T=C.topics[t], qs=C.qs.map((q,i)=>({q,i})).filter(x=>x.q.t===t);
  return '<div class="t-f"><input type="color" id="f-topics-'+t+'-c" data-k="topics.'+t+'.c" value="'+esc(T.c)+'" aria-label="Topic colour">'+inp('topics.'+t+'.n',T.n,'aria-label="Topic name"')+
      '<span class="tp">'+inp('topics.'+t+'.lo',T.lo,'aria-label="Left pole" placeholder="Left pole of the axis"')+'</span><span class="tp">'+inp('topics.'+t+'.hi',T.hi,'aria-label="Right pole" placeholder="Right pole of the axis"')+'</span>'+
      '<button type="button" class="x" data-act="delTopic" data-i="'+t+'" aria-label="Delete topic"'+(C.topics.length<=1?' disabled':'')+'>×</button></div>'+
    qs.map(x=>qHtml(x.i)).join('')+'<button type="button" class="add" data-act="addQ" data-i="'+t+'">+ Add question</button>';
}
function axSvg(q){
  const w=300, x=v=>12+(v+1)/2*(w-24); let g='<rect x="12" y="8" width="'+(w-24)+'" height="4" rx="2" fill="var(--pend)"/><line x1="'+w/2+'" y1="3" x2="'+w/2+'" y2="17" stroke="var(--ink3)" stroke-width="1"/>';
  C.fams.forEach(F=>{ g+='<circle cx="'+x(pos(q,F)).toFixed(1)+'" cy="10" r="4.5" fill="'+esc(F.c)+'" stroke="var(--surface)" stroke-width="1"><title>'+esc(F.n)+'</title></circle>'; });
  return '<svg viewBox="0 0 '+w+' 20" role="img" aria-label="Party positions between A and B">'+g+'</svg>';
}
function sideHtml(i,s){
  const q=C.qs[i], k='qs.'+i, id='f-qs-'+i, sel=q[s], L=s.toUpperCase();
  return '<div class="opt"><label><span>'+L+'</span><textarea class="in" rows="2" id="'+id+'-'+L+'" data-k="'+k+'.'+L+'" placeholder="Option '+L+'">'+esc(q[L])+'</textarea></label>'+
    '<div class="trs">'+sel.map(t=>'<span class="tchip" data-l="1">'+esc(tname(t))+'<button type="button" class="rm" data-act="untr" data-i="'+i+'" data-s="'+s+'" data-id="'+esc(t)+'" aria-label="Remove trait">×</button></span>').join('')+
    '<select class="in tsel" id="'+id+'-add'+s+'" data-addtr="'+s+'" data-i="'+i+'" aria-label="Add a trait to option '+L+'"><option value="">+ trait</option>'+groups().map(g=>'<optgroup label="'+esc(g)+'">'+C.traits.filter(x=>x.g===g&&!sel.includes(x.id)).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.n)+'</option>').join('')+'</optgroup>').join('')+'</select></div></div>';
}
function qHtml(i){
  const q=C.qs[i], T=C.topics[q.t], k='qs.'+i, id='f-qs-'+i;
  return '<div class="q'+(q.on?'':' off')+'" data-q="'+i+'"><div class="q-head"><input type="checkbox" id="'+id+'-on" data-k="'+k+'.on"'+(q.on?' checked':'')+' aria-label="Question is included in the test" title="Included in the test"><input class="in q-t" id="'+id+'-q" data-k="'+k+'.q" value="'+esc(q.q)+'" aria-label="Question title" placeholder="Question title"><button type="button" class="x" data-act="delQ" data-i="'+i+'" aria-label="Delete question">×</button></div>'+
    '<div class="q-ab">'+sideHtml(i,'a')+sideHtml(i,'b')+'</div>'+
    '<div class="q-ax"><span class="ax" data-ax="'+i+'">'+axSvg(q)+'</span><label>B points to the pole <select class="in" id="'+id+'-d" data-k="'+k+'.d" data-int="1"><option value="1"'+(q.d===1?' selected':'')+'>'+esc(T.hi||'right')+'</option><option value="-1"'+(q.d===-1?' selected':'')+'>'+esc(T.lo||'left')+'</option></select></label></div></div>';
}
function refreshQ(i){ const el=$('.q[data-q="'+i+'"]'); if(el) el.outerHTML=qHtml(i); }
function refreshAxes(){ $$('[data-ax]').forEach(el=>{ const q=C.qs[+el.dataset.ax]; if(q) el.innerHTML=axSvg(q); }); }
function updParl(){
  const auto=C.party==='auto'; R.party=auto?'multi':C.party; R.sys=auto?'prop':C.sys;
  const B=bonus(), L=listTotal(), D=distTotal(), nq=enabled().length, one=R.party==='one';
  $$('input[name="sys"]').forEach(r=>{ r.disabled=auto; }); $('#ringchk').hidden=R.sys!=='mixed'; $('#dshrow').hidden=R.sys!=='mixed'&&!auto; $('#dshhint').hidden=!auto; $('#dshv').textContent=C.dshare+'%';
  drawParl($('#parl-h'),one?[{seats:C.seats,c:'var(--ink)'}]:[{seats:B,c:'var(--ink)'},{seats:L,c:'var(--accent)'},{seats:D,c:'var(--accent2)',k:'d'}],null,C.seats,plural(C.seats,'seat','seats','seats'));
  $('#parl-leg').innerHTML=one?'<span><i class="dot" style="background:var(--ink)"></i>To the winner <b>'+C.seats+'</b></span>':
    (B?'<span><i class="dot" style="background:var(--ink)"></i>To the leader upfront <b>'+B+'</b></span>':'')+'<span><i class="dot" style="background:var(--accent)"></i>By party list <b>'+L+'</b></span>'+(D?'<span>'+(RINGS?'<i class="ring"></i>':'<i class="dot" style="background:var(--accent2)"></i>')+'By districts <b>'+D+'</b></span>':'')+'<span>Majority <b>'+maj()+'</b></span>';
  let note=auto?'Six opening questions will choose the system and the way seats are divided. The diagram shows the multi-party, party-list variant.':
    one?'All '+mest(C.seats)+' go to the party closest to the answers.':
    (R.party==='dom'?'The party that ends up closest to the answers at the end of the test gets '+mest(B)+', that is, a majority. The remaining '+pool()+' are divided by the answers among all parties, including it. ':'')+
    (!D?'Party-list seats are divided by the largest remainder method.':D===nq?'Exactly one question — one seat: '+nq+' '+plural(nq,'district','districts','districts')+'.':nq?(D>nq?'Districts: '+D+', questions: '+nq+': each question decides on average '+(D/nq).toFixed(1)+' seats, all of which go to the question’s winner.':'Districts: '+D+', questions: '+nq+': only questions on the respondent’s most important topics will get a seat.'):'Enable at least one question.');
  $('#parl-note').textContent=note;
  const pre=[100,350,450]; if(R.sys==='mixed'&&R.party==='multi'&&nq>=5&&!pre.includes(nq*2)) pre.unshift(nq*2);
  $('#presets').innerHTML=pre.map(n=>'<button type="button" class="chip" data-act="seats" data-i="'+n+'" aria-pressed="'+(C.seats===n)+'">'+n+(n===nq*2&&R.sys==='mixed'?' · question = seat':n===450?' · as in the State Duma':'')+'</button>').join('');
}
function updMeta(){
  const nq=enabled().length, nt=C.topics.filter((_,t)=>C.qs.some(q=>q.on&&q.t===t)).length;
  C.topics.forEach((_,t)=>{ const el=$('[data-tq="'+t+'"]'); if(!el) return; const all=C.qs.filter(q=>q.t===t), on=all.filter(q=>q.on).length; el.textContent=on===all.length?cnt(on):on+' of '+all.length+' enabled'; });
  C.fams.forEach((F,i)=>{ const el=$('[data-ft="'+i+'"]'), n=Object.keys(F.tr).length; if(el) el.textContent=n+' '+plural(n,'trait','traits','traits')+' · '+F.ppl.length+' '+plural(F.ppl.length,'character','characters','characters'); });
  $('#run').disabled=!nq;
  $('#run-info').textContent=nq?(C.party==='auto'?'6 questions about the system · ':'')+nt+' '+plural(nt,'topic','topics','topics')+' · '+cnt(nq)+' · '+mest(C.seats)+' · '+(C.party==='auto'?'the test picks the system':SYSF[C.party].toLowerCase()+', '+(C.sys==='mixed'?'mixed':'party list'))+(C.year&&C.thron&&C.thr>0?' · threshold '+thrTxt()+'%':'')+(lowOn()?' · minor parties at lower priority':''):'Enable at least one question';
}
function setSeats(n){ C.seats=Math.max(10,Math.min(1000,Math.round(n))); save(); updParl(); updMeta(); }
function onInput(e){
  const el=e.target;
  if(el.id==='seats'||el.id==='seatsR'){ const n=+el.value; if(!(n>=10&&n<=1000)) return; setSeats(n); (el.id==='seats'?$('#seatsR'):$('#seats')).value=C.seats; return; }
  if(el.id==='lowpri'){ C.lowpri=el.checked; save(); updMeta(); return; }
  if(el.dataset&&el.dataset.sm!==undefined){ const F=C.fams[+el.dataset.sm]; if(F){ F.sm=el.checked; rerender(); } return; }
  if(el.id==='thron'){ C.thron=el.checked; if(C.thron&&!(C.thr>0)){ C.thr=5; $('#thr').value=5; } save(); updMeta(); return; }
  if(el.id==='thr'){ const v=+el.value; if(!(v>=0&&v<=20)) return; C.thr=Math.round(v*2)/2; save(); updMeta(); return; }
  if(el.id==='dshare'){ C.dshare=Math.max(0,Math.min(100,+el.value||0)); save(); updParl(); updMeta(); return; }
  if(el.id==='f-rings'){ setRings(el.checked); updParl(); return; }
  if(el.name==='sys'||el.name==='party'){ C[el.name]=el.value; save(); updParl(); updMeta(); return; }
  const k=el.dataset.k; if(!k) return;
  const v=el.type==='checkbox'?el.checked:el.dataset.int?+el.value:el.value;
  const ps=k.split('.'); let o=C; for(let i=0;i<ps.length-1;i++) o=o[ps[i]]; o[ps[ps.length-1]]=v; save();
  if(el.type==='checkbox'){ const qe=el.closest('.q'); if(qe){ qe.classList.toggle('off',!v); updParl(); updMeta(); } }
  if(ps[0]==='topics'){ const t=ps[1]; if(ps[2]==='n') $('[data-tn="'+t+'"]').textContent=v; if(ps[2]==='c') $('[data-tc="'+t+'"]').style.background=v; }
  if(ps[0]==='fams'){ const i=ps[1]; if(ps[2]==='n') $('[data-fn="'+i+'"]').textContent=v; if(ps[2]==='c'){ $('[data-fm="'+i+'"]').innerHTML=mark(C.fams[i]); refreshAxes(); } }
}
function rerender(){ const keep=window.scrollY; save(); viewBuild(); window.scrollTo(0,keep); }
function onChange(e){
  const el=e.target;
  if(el.dataset.pimg&&el.files&&el.files[0]){ const [pi,pj]=el.dataset.pimg.split(',').map(Number), file=el.files[0]; if(!/^image\//.test(file.type)) return;
    const rd=new FileReader(); rd.onload=()=>{ const im=new Image(); im.onload=()=>{ const w=120, hh=150, c=document.createElement('canvas'); c.width=w; c.height=hh; const k=Math.max(w/im.width,hh/im.height);
      c.getContext('2d').drawImage(im,(w-im.width*k)/2,(hh-im.height*k)/2,im.width*k,im.height*k); try{ C.fams[pi].ppl[pj].img=c.toDataURL('image/jpeg',.82); }catch(_){ return; } rerender(); }; im.src=rd.result; }; rd.readAsDataURL(file); return; }
  if(el.dataset.addtr&&el.value){ const i=+el.dataset.i; C.qs[i][el.dataset.addtr].push(el.value); save(); refreshQ(i); return; }
  if(el.dataset.logo!==undefined&&el.files&&el.files[0]){ const i=+el.dataset.logo, file=el.files[0]; if(!/^image\//.test(file.type)) return;
    const rd=new FileReader(); rd.onload=()=>{ const im=new Image(); im.onload=()=>{ const s=96, c=document.createElement('canvas'); c.width=c.height=s; const k=Math.min(s/im.width,s/im.height), w=im.width*k, h=im.height*k;
      c.getContext('2d').drawImage(im,(s-w)/2,(s-h)/2,w,h); try{ C.fams[i].logo=c.toDataURL('image/png'); }catch(_){ return; } rerender(); }; im.src=rd.result; }; rd.readAsDataURL(file); }
}
function loadCfg(c,msg){ PREV=JSON.stringify(C); C=c; PMSG=msg; Object.keys(OPEN).forEach(k=>delete OPEN[k]); save(); viewBuild(); }
function onAct(e){
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act, i=+b.dataset.i, id=b.dataset.id;
  const clearQ=()=>Object.keys(OPEN).forEach(k=>{ if(k[0]==='q') delete OPEN[k]; });
  if(a==='pre'){ const p=BUILTIN[i]; loadCfg(presetCfg(p),'Preset loaded: “'+p.n+'”.'); }
  else if(a==='upre'){ const p=USER[i]; loadCfg(norm(JSON.parse(JSON.stringify(p.c))),'Preset loaded: “'+p.n+'”.'); C.name=p.n; save(); }
  else if(a==='delPre'){ if(b.dataset.arm){ USER.splice(i,1); saveUser(); PMSG='Preset deleted.'; rerender(); } else { b.dataset.arm=1; b.textContent='✓'; b.title='Click again to delete'; $('#pmsg').textContent='Click again to delete the preset.'; } }
  else if(a==='savePre'){ const n=$('#pname').value.trim(); if(!n){ $('#pmsg').textContent='Enter a preset name.'; return; }
    if(BUILTIN.some(p=>p.n===n)){ $('#pmsg').textContent='This name is taken by a built-in preset; choose another one.'; return; }
    C.name=n; const k=USER.findIndex(p=>p.n===n), rec={n,c:JSON.parse(JSON.stringify(C))}; if(k>=0) USER[k]=rec; else USER.push(rec);
    if(saveUser()) PMSG=(k>=0?'Preset updated: “':'Preset saved: “')+n+'”.'; else { if(k<0) USER.pop(); PMSG='Could not save: the browser storage is full. Remove logos or delete old presets.'; } rerender(); }
  else if(a==='undo'){ let c=null; try{ c=norm(JSON.parse(PREV)); }catch(_){} if(c){ PREV=null; C=c; PMSG='The previous test has been restored.'; rerender(); } }
  else if(a==='seats'){ setSeats(i); $('#seats').value=$('#seatsR').value=C.seats; }
  else if(a==='addTrait'){ const n=$('#newTrait').value.trim(); if(!n) return; C.traits.push({id:'c'+Date.now().toString(36),n,g:'Custom'}); rerender(); }
  else if(a==='delTrait'){ C.traits=C.traits.filter(x=>x.id!==id); C.fams.forEach(F=>delete F.tr[id]); C.qs.forEach(q=>{ q.a=q.a.filter(x=>x!==id); q.b=q.b.filter(x=>x!==id); }); rerender(); }
  else if(a==='tr'){ const F=C.fams[i], l=((F.tr[id]||0)+1)%4; if(l) F.tr[id]=l; else delete F.tr[id]; b.dataset.l=l; b.setAttribute('aria-pressed',l>0); b.querySelector('small').textContent=SL[l]; save(); updMeta(); refreshAxes(); }
  else if(a==='untr'){ const q=C.qs[i], s=b.dataset.s; q[s]=q[s].filter(x=>x!==id); save(); refreshQ(i); }
  else if(a==='addFam'){ C.fams.push({n:'New party',c:'#8a8f9c',d:'',logo:'',tr:{},ppl:[],cap:-1}); OPEN['f'+(C.fams.length-1)]=true; rerender(); }
  else if(a==='delFam'){ C.fams.splice(i,1); C.duo=[-1,-1]; const sh=x=>x>i?x-1:x; C.no=C.no.filter(p=>!p.includes(i)).map(p=>p.map(sh)); C.coal.forEach(c=>{ c.m=c.m.filter(x=>x!==i).map(sh); }); C.fams.forEach(F=>{ F.cap=F.cap===i?-1:sh(F.cap); }); Object.keys(OPEN).forEach(k=>{ if(k[0]==='f') delete OPEN[k]; }); rerender(); }
  else if(a==='delLogo'){ C.fams[i].logo=''; rerender(); }
  else if(a==='logoUrl'||a==='pimgUrl'){ const P=a==='pimgUrl'?C.fams[i].ppl[+b.dataset.j]:null, cur=P?P.img:C.fams[i].logo;
    const u=window.prompt('Ссылка на картинку (начинается с https://). Пустая строка убирает картинку.',isUrl(cur)?cur:''); if(u===null) return; const v=u.trim();
    if(v&&!isUrl(v)){ window.alert('Нужна ссылка, которая начинается с http:// или https://'); return; }
    if(P) P.img=v; else C.fams[i].logo=v; rerender(); }
  else if(a==='addP'){ C.fams[i].ppl.push({n:'New character',s:'',img:''}); rerender(); }
  else if(a==='delP'){ C.fams[i].ppl.splice(+b.dataset.j,1); rerender(); }
  else if(a==='veto'){ const j=+b.dataset.j, k=C.no.findIndex(p=>(p[0]===i&&p[1]===j)||(p[0]===j&&p[1]===i)); if(k>=0) C.no.splice(k,1); else C.no.push([i,j]); save();
    $$('[data-act="veto"]').forEach(x=>{ const xi=+x.dataset.i, xj=+x.dataset.j; if((xi===i&&xj===j)||(xi===j&&xj===i)) x.setAttribute('aria-pressed',k<0); }); updCo(); }
  else if(a==='coM'){ const c=C.coal[i], j=+b.dataset.j, k=c.m.indexOf(j); if(k>=0) c.m.splice(k,1); else c.m.push(j); b.setAttribute('aria-pressed',k<0); save(); updCo(); }
  else if(a==='addCoal'){ C.coal.push({n:'New coalition',m:[]}); rerender(); }
  else if(a==='delCoal'){ C.coal.splice(i,1); rerender(); }
  else if(a==='addTopic'){ C.topics.push({n:'New topic',s:'',c:'#b7a3e8',lo:'Left pole',hi:'Right pole'}); OPEN['t'+(C.topics.length-1)]=true; rerender(); }
  else if(a==='delTopic'){ C.topics.splice(i,1); C.qs=C.qs.filter(q=>q.t!==i); C.qs.forEach(q=>{ if(q.t>i) q.t--; }); Object.keys(OPEN).forEach(k=>{ if(k[0]==='t') delete OPEN[k]; }); rerender(); }
  else if(a==='addQ'){ let at=C.qs.length; for(let k=C.qs.length-1;k>=0;k--) if(C.qs[k].t===i){ at=k+1; break; }
    C.qs.splice(at,0,{t:i,d:1,q:'New question',A:'',B:'',on:true,a:[],b:[]}); rerender(); }
  else if(a==='delQ'){ C.qs.splice(i,1); clearQ(); rerender(); }
  else if(a==='exp'){ $('#io').value=JSON.stringify(C); $('#io-msg').textContent='The current test is shown in the field.'; }
  else if(a==='copy'){ const ta=$('#io'); if(!ta.value) ta.value=JSON.stringify(C); const sel=()=>{ ta.select(); $('#io-msg').textContent='The text is selected: copy it manually.'; };
    try{ navigator.clipboard.writeText(ta.value).then(()=>{ $('#io-msg').textContent='Copied.'; },sel); }catch(_){ sel(); } }
  else if(a==='imp'){ let c=null; try{ c=norm(JSON.parse($('#io').value)); }catch(_){}
    if(!c){ $('#io-msg').textContent='Could not read the text. Paste it in full, from the first curly brace to the last.'; return; }
    OPEN.io=true; const io=OPEN.io; loadCfg(c,'Test loaded from text.'); OPEN.io=io; }
  else if(a==='run'){ S.lv=C.topics.map((_,t)=>C.qs.some(q=>q.on&&q.t===t)?2:0); toBuild.hidden=false;
    if(C.party==='auto'){ S.sa=[]; S.si=0; window.scrollTo(0,0); viewSys(); } else { R.party=C.party; R.sys=C.sys; S.gv=undefined; begin(); } }
}

// ══════ Шкала с ползунком: общий экран вопроса ══════
function valText(v){ if(v===null) return 'Move the slider towards the option you prefer'; const a=Math.abs(v), s=v<0?'A':'B';
  return a<.08?'Exactly in the middle':a<.4?'Slightly closer to '+s:a<.8?'Noticeably closer to '+s:'Fully for '+s; }
function ask(o){
  app.innerHTML='<section class="narrow">'+o.prog+'<div class="meta">'+o.meta+'</div><h2 class="qtitle">'+esc(o.title)+'</h2>'+
    '<div class="poles"><button type="button" class="pole l" data-v="-1" tabindex="-1"><em>A</em><span>'+esc(o.L)+'</span></button><button type="button" class="pole r" data-v="1" tabindex="-1"><em>B</em><span>'+esc(o.R)+'</span></button></div>'+
    '<div class="track" id="track"><div class="rail"></div>'+[-1,-.5,0,.5,1].map(t=>'<div class="tick'+(t===0?' c':'')+'" style="left:'+((t+1)/2*100)+'%"></div>').join('')+
      '<div class="fill"></div><div class="ball" role="slider" tabindex="0" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0"></div></div>'+
    '<div class="val" id="val" aria-hidden="true"></div>'+
    '<div class="nav2"><button type="button" class="cta" id="next">Next</button><button type="button" class="link" id="back"'+(o.back?'':' disabled')+'>‹ Back</button><button type="button" class="link" id="skip">No opinion ›</button></div>'+
    '<div class="kbd">Keyboard: ← → move the slider, Enter goes on.</div></section>';
  let cur=o.val, drag=false;
  const tr=$('#track'), ball=$('.ball',tr), fill=$('.fill',tr), l=$('.pole.l',app), r=$('.pole.r',app);
  const draw=anim=>{ const v=cur===null?0:cur, x=(v+1)/2*100;
    tr.classList.toggle('anim',!!anim&&!reduce); tr.classList.toggle('set',cur!==null);
    ball.style.left=x+'%'; fill.style.left=Math.min(50,x)+'%'; fill.style.width=Math.abs(x-50)+'%';
    ball.setAttribute('aria-valuenow',Math.round(v*100));
    ball.setAttribute('aria-valuetext',cur===null?'Not moved':valText(cur)+(Math.abs(v)>=.08?': '+(v<0?o.L:o.R):''));
    ball.setAttribute('aria-label',o.title+'. A: '+o.L+'. B: '+o.R);
    $('#val').textContent=valText(cur);
    l.style.setProperty('--o',cur===null||v<=.08?1:Math.max(.45,1-v*.6)); r.style.setProperty('--o',cur===null||v>=-.08?1:Math.max(.45,1+v*.6));
    l.classList.toggle('on',cur!==null&&v<=-.08); r.classList.toggle('on',cur!==null&&v>=.08);
    $('#next').disabled=cur===null; };
  const set=(v,anim)=>{ v=Math.max(-1,Math.min(1,v)); if(Math.abs(v)<.04) v=0; cur=Math.round(v*100)/100; draw(anim); };
  const fromX=cx=>{ const b=tr.getBoundingClientRect(); return (cx-b.left)/b.width*2-1; };
  tr.addEventListener('pointerdown',e=>{ drag=true; tr.classList.add('drag'); try{ tr.setPointerCapture(e.pointerId); }catch(_){} set(fromX(e.clientX),e.target!==ball); ball.focus({preventScroll:true}); e.preventDefault(); });
  tr.addEventListener('pointermove',e=>{ if(drag) set(fromX(e.clientX),false); });
  const end=()=>{ drag=false; tr.classList.remove('drag'); };
  tr.addEventListener('pointerup',end); tr.addEventListener('pointercancel',end);
  ball.addEventListener('keydown',e=>{ const v=cur===null?0:cur, st=e.shiftKey?.25:.1;
    if(e.key==='ArrowLeft'||e.key==='ArrowDown'){ e.preventDefault(); set(v-st,true); }
    else if(e.key==='ArrowRight'||e.key==='ArrowUp'){ e.preventDefault(); set(v+st,true); }
    else if(e.key==='Home'){ e.preventDefault(); set(-1,true); }
    else if(e.key==='End'){ e.preventDefault(); set(1,true); }
    else if(e.key==='Enter'&&cur!==null){ e.preventDefault(); o.next(cur); } });
  [l,r].forEach(b=>b.addEventListener('click',()=>set(+b.dataset.v*.85,true)));
  $('#next').addEventListener('click',()=>{ if(cur!==null) o.next(cur); });
  $('#back').addEventListener('click',()=>{ if(o.back) o.back(); });
  $('#skip').addEventListener('click',()=>o.next(null));
  draw(false); ball.focus({preventScroll:true});
}

// ══════ 2. Шесть вопросов о системе ══════
// Первый вопрос сценария: допускать ли партию к выборам. Ответ “нет” убирает её из расчёта мест.
function begin(){ if(C.gate>=0&&C.fams[C.gate]) viewGate(); else viewPrio(); }
function viewGate(){ const F=C.fams[C.gate]; window.scrollTo(0,0);
  ask({prog:'',meta:'<b>First question</b><span>Admission to the election</span>',title:'Should the party “'+F.n+'” be allowed to stand in the election?',L:'Yes, allow it',R:'No, bar it',val:S.gv==null?null:S.gv,back:null,
    next:x=>{ S.gv=x; viewPrio(); }}); }
function viewSys(){
  const i=S.si, q=SYSQ[i], v=S.sa[i];
  ask({prog:'<div class="prog" aria-hidden="true">'+SYSQ.map((_,k)=>'<i class="'+(k===i?'cur':S.sa[k]===null?'skip':S.sa[k]!==undefined?'done':'')+'"></i>').join('')+'</div>',
    meta:'<b>First, let’s choose the system</b><span>Question '+(i+1)+' of '+SYSQ.length+'</span>',title:q.q,L:q.A,R:q.B,val:v==null?null:v,
    back:i?()=>{ S.si--; viewSys(); }:null,
    next:x=>{ S.sa[i]=x; if(i<SYSQ.length-1){ S.si++; viewSys(); } else viewVerdict(); }});
}
function viewVerdict(){
  const sc=SYSK.map(()=>0); SYSQ.forEach((q,i)=>{ const v=S.sa[i]; if(v==null) return; (v<0?q.a:q.b).forEach((x,k)=>sc[k]+=Math.abs(v)*x); });
  let best=SYSK.length-1; sc.forEach((x,k)=>{ if(x>sc[best]+1e-9) best=k; });
  R.party=SYSK[best]; R.sys=S.sa[5]>0.08?'mixed':'prop';
  const mx=Math.max(1,...sc); window.scrollTo(0,0);
  app.innerHTML='<section class="narrow"><div class="meta"><b>System chosen</b></div><h2>'+SYSF[R.party]+'</h2><p class="lead">'+SYSD[R.party]+' '+(R.party==='one'?'':R.sys==='mixed'?'Seats are divided under a mixed scheme: some by party list, some by districts, because a specific deputy matters more to you.':'Seats are divided by party lists.')+'</p>'+
    '<div class="box"><div class="vd">'+SYSK.map((k,j)=>'<div class="'+(j===best?'win':'')+'"><span>'+SYSN[k]+'</span><i><b style="width:'+(sc[j]/mx*100)+'%"></b></i><em>'+sc[j].toFixed(1)+'</em></div>').join('')+'</div><p class="hint">Points are scored by how far you moved the slider in each of the six questions. In a tie the more pluralist system wins.</p></div>'+
    '<div class="go"><button type="button" class="cta" id="go">Next: topic importance</button><button type="button" class="link" id="redo">Answer again</button></div></section>';
  $('#go').addEventListener('click',viewPrio); $('#redo').addEventListener('click',()=>{ S.sa=[]; S.si=0; viewSys(); });
  $('#go').focus({preventScroll:true});
}

// ══════ 3. Приоритеты ══════
function segHtml(t,lv){ return '<div class="seg" role="radiogroup" aria-label="Importance of the topic “'+esc(C.topics[t].n)+'”">'+LV.map((L,k)=>'<button type="button" role="radio" data-t="'+t+'" data-l="'+k+'" aria-checked="'+(k===lv)+'" tabindex="'+(k===lv?0:-1)+'">'+L.n+'</button>').join('')+'</div>'; }
function viewPrio(){
  toBuild.hidden=false; window.scrollTo(0,0);
  const ts=C.topics.map((_,t)=>t).filter(t=>C.qs.some(q=>q.on&&q.t===t));
  app.innerHTML='<section class="narrow"><h2>What matters more to you?</h2><p class="lead">Mark how important each topic is. The more important a topic, the more of the '+pool()+' seats your answers on it will decide'+(R.party==='dom'?' (another '+bonus()+' go straight to the leading party)':'')+'. A topic marked <b>“Not important”</b> will be skipped.</p>'+
    '<div class="rows" id="prs">'+ts.map(t=>'<div class="pr" data-t="'+t+'"><span class="nm"><i class="dot" style="background:'+esc(C.topics[t].c)+'"></i>'+esc(C.topics[t].n)+(C.topics[t].s?'<small>'+esc(C.topics[t].s)+'</small>':'')+'</span><span class="st"><span class="v"></span><small>seats</small></span><span class="sh"></span></div>').join('')+'</div>'+
    '<div class="go"><button type="button" class="cta" id="go">Go to the questions</button><span id="goinfo"></span></div><div style="margin-top:22px">'+compassBox(false)+'</div></section>';
  const upd=()=>{ const qs=enabled(), P=plan(S.lv,qs); let n=0;
    $$('.pr',app).forEach(row=>{ const t=+row.dataset.t; row.lastElementChild.outerHTML=segHtml(t,S.lv[t]); $('.v',row).textContent=chunkTot(t,P,qs); row.classList.toggle('off',!S.lv[t]); if(S.lv[t]) n+=qs.filter(q=>q.t===t).length; });
    const act=S.lv.filter(l=>l>0).length; $('#go').disabled=!act; $('#goinfo').textContent=act?cnt(n)+' in '+act+' '+plural(act,'block','blocks','blocks'):'Choose at least one topic'; };
  const prs=$('#prs');
  prs.addEventListener('click',e=>{ const b=e.target.closest('button[data-l]'); if(!b) return; S.lv[+b.dataset.t]=+b.dataset.l; upd(); const nb=$('button[data-t="'+b.dataset.t+'"][data-l="'+b.dataset.l+'"]',prs); if(nb) nb.focus({preventScroll:true}); });
  prs.addEventListener('keydown',e=>{ const b=e.target.closest('button[data-l]'); if(!b||!/Arrow(Left|Right)/.test(e.key)) return; e.preventDefault(); const t=+b.dataset.t, l=Math.max(0,Math.min(4,S.lv[t]+(e.key==='ArrowRight'?1:-1))); S.lv[t]=l; upd(); $('button[data-t="'+t+'"][data-l="'+l+'"]',prs).focus(); });
  $('#go').addEventListener('click',startQuiz); upd();
}

// ══════ 4. Вопросы ══════
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function startQuiz(){
  // Блоки идут от менее важных к самым важным, “Будущее” — в самом конце; порядок вопросов и сторона вариантов случайны
  const rnd=C.topics.map(()=>Math.random());
  const ft=C.topics.findIndex(t=>t.n==='The Future'); // тема “Будущее” всегда идёт последней
  S.order=C.topics.map((_,t)=>t).filter(t=>S.lv[t]>0).sort((a,b)=>(a===ft)-(b===ft)||S.lv[a]-S.lv[b]||rnd[a]-rnd[b]);
  S.qs=[]; S.order.forEach(t=>shuffle(C.qs.filter(q=>q.on&&q.t===t)).forEach(q=>S.qs.push(q)));
  S.pp=S.qs.map(q=>C.fams.map(F=>pos(q,F)));
  S.fin=false; S.dom=null; S.ans=S.qs.map(()=>undefined); S.flip=S.qs.map(()=>Math.random()<.5); S.open={}; S.i=0; S.bi=0; S.P=plan(S.lv,S.qs);
  window.scrollTo(0,0); viewQuiz();
}
function progHtml(cur){ return '<div class="prog" aria-hidden="true">'+S.qs.map((q,i)=>{ const v=S.ans[i]; let c=i===cur?'cur':v===null?'skip':v!==undefined?'done':''; if(i&&q.t!==S.qs[i-1].t) c+=' gap'; return '<i class="'+c+'"></i>'; }).join('')+'</div>'; }
function viewQuiz(){
  const i=S.i, q=S.qs[i], T=C.topics[q.t], bq=S.qs.filter(x=>x.t===q.t), n=bq.indexOf(q)+1, d=S.P.dist[i], v=S.ans[i], fl=S.flip[i];
  ask({prog:progHtml(i),
    meta:'<i class="dot" style="background:'+esc(T.c)+';margin:0"></i><b>'+esc(T.n)+'</b><span class="pill">'+mest(chunkTot(q.t,S.P,S.qs))+' at stake</span>'+(d?'<span class="pill d">district: '+d+' '+plural(d,'seat','seats','seats')+'</span>':'')+'<span>Question '+n+' of '+bq.length+'</span>',
    title:q.q,L:fl?q.B:q.A,R:fl?q.A:q.B,val:v==null?null:(fl?-v:v),
    back:n>1?()=>{ S.i--; viewQuiz(); }:null,
    next:x=>{ S.ans[i]=x===null?null:(fl?-x:x); const nx=S.qs[i+1]; if(!nx||nx.t!==q.t) viewBoard(); else { S.i++; viewQuiz(); } }});
}

// ══════ 5. Табло после каждого блока ══════
function viewBoard(){
  window.scrollTo(0,0);
  const t=S.order[S.bi], T=C.topics[t], last=S.bi===S.order.length-1, nF=C.fams.length, M=maj();
  const scope=S.order.slice(0,S.bi+1), prev=S.bi?totals(S.order.slice(0,S.bi),S.P):Array(nF).fill(0), now=totals(scope,S.P), add=now.map((v,f)=>v-prev[f]);
  const n=chunkTot(t,S.P,S.qs), given=sum(now), X=context(scope), B=block(t,S.P,X), dn=sum(B.dist);
  app.innerHTML='<section class="board">'+progHtml(-1)+'<div class="box">'+
    '<span class="eyebrow">Block '+(S.bi+1)+' of '+S.order.length+'</span><h2>“'+esc(T.n)+'” hands out <em>'+n+'</em> '+plural(n,'seat','seats','seats')+'</h2>'+
    '<div class="bcols"><div class="hemi" id="bh"></div><div><div class="sb" id="sb" style="height:'+(nF*44-4)+'px">'+
      C.fams.map((F,i)=>'<div class="sr" data-f="'+i+'" style="--c:'+esc(F.c)+'"><span class="rk"></span><span class="nm"><b>'+(lg(F)?mark(F):'')+esc(F.n)+'</b><span class="bar"><span></span><em></em></span></span><span class="pts"></span><span class="tot"></span></div>').join('')+
    '</div><p class="msg" id="msg" aria-live="polite"></p></div></div>'+
    '<div class="bfoot"><span>Absolute majority: '+M+'</span><span>'+
      (R.party==='one'?'All seats go to the party currently closest to your answers':R.party==='dom'?'Another '+bonus()+' is the guaranteed majority: who gets it is decided at the end of the test':!B.k?'No answers in this block: the seats are split equally':R.sys==='mixed'?(n-dn)+' by party list and '+dn+' by districts':'Based on your answers on this topic')+'</span></div></div>'+
    '<div class="bnav"><span></span><button type="button" class="cta" id="cont">'+(last?(C.year?'Show my Duma':'Show my parliament'):'Next: '+esc(C.topics[S.order[S.bi+1]].n))+'</button></div></section>';
  const rows=$$('.sr',app), bh=$('#bh');
  const rank=(st,tie)=>{ const o=st.map((_,f)=>f).sort((a,b)=>st[b]-st[a]||(tie?tie[a]-tie[b]:0)||a-b), r=[]; o.forEach((f,i)=>r[f]=i); return r; };
  const show=(st,rk,pts)=>{ rows.forEach((r,f)=>{ r.style.top=rk[f]*44+'px'; $('.rk',r).textContent=rk[f]+1; $('.tot',r).textContent=st[f]; $('.bar span',r).style.width=Math.min(100,st[f]/(M/.7)*100)+'%'; r.classList.toggle('maj',st[f]>=M);
      const p=$('.pts',r); if(pts){ p.textContent=add[f]>0?'+'+add[f]:add[f]<0?'−'+(-add[f]):'0'; p.className='pts show'+(add[f]>0?'':add[f]<0?' neg':' zero'); } });
    drawParl(bh,st.map((v,f)=>({seats:v,c:C.fams[f].c})).concat({seats:C.seats-sum(st),c:'var(--pend)'}),null,sum(st),'of '+C.seats+' allocated'); };
  const pr=rank(prev,null); show(prev,pr,false);
  const fin=()=>{ if(!$('#sb')) return; show(now,rank(now,pr),true);
    const L=leader(now), Lp=leader(prev), nm=C.fams[L].n;
    let m=now[L]>=M?nm+': absolute majority':S.bi===0?nm+' takes the lead':Lp!==L&&prev[Lp]>0?nm+' takes over the lead':nm+' stays in the lead';
    if(!last) m+=' · remaining: '+mest(C.seats-given); $('#msg').textContent=m; };
  if(reduce) fin(); else setTimeout(fin,600);
  $('#cont').addEventListener('click',()=>{ if(last) viewResult(); else { S.bi++; S.i++; window.scrollTo(0,0); viewQuiz(); } });
  $('#cont').focus({preventScroll:true});
}

// ══════ 6. Результат ══════
function viewResult(){
  S.fin=true; S.hl=null; S.pick=[]; window.scrollTo(0,0);
  const mixed=R.sys==='mixed', answered=S.ans.filter(v=>v!=null).length;
  app.innerHTML='<section class="res stack"><div><div class="chips" style="margin-bottom:10px">'+(C.year?'<span class="pill">Election of '+C.year+' </span>':'')+(FIC()?'<span class="pill">Fictional scenario</span>':'')+(thrOn()?'<span class="pill">Threshold '+thrTxt()+'%</span>':'')+'<span class="pill">'+SYSF[R.party]+'</span><span class="pill">'+(mixed?'Mixed: party list and districts':'By party lists')+'</span><span class="pill">'+mest(C.seats)+'</span></div><h2 tabindex="-1" style="outline:none">'+(C.year?'Your Duma of '+C.year+' ':'Your parliament')+'</h2><p class="lead" id="lead" style="margin:0"></p></div>'+
    '<div class="box main"><div class="hemi" id="rh"></div><div><div class="chips" id="tiers" style="margin:0 0 8px"></div><div class="chips" id="ringrow" style="margin:0 0 8px"></div><div class="chips" id="domrow" style="margin:0 0 10px" hidden></div>'+(mixed?'<div id="dsres" style="margin:0 0 10px"><label class="lbl" for="dshare2">Share of single-member districts: <b id="dshv2">'+C.dshare+'%</b></label><input type="range" id="dshare2" min="0" max="100" step="5" value="'+C.dshare+'" style="width:100%;accent-color:var(--accent)"></div>':'')+'<p class="hint" id="thrline" style="margin:0 0 8px" hidden></p><div class="leg" id="leg"></div><div class="desc" id="desc"></div></div></div>'+
    '<div class="box"><h3>Election results</h3><p class="hint">A card in the style of Wikipedia. It is easy to save as a screenshot.</p><div id="wb"></div></div>'+
    '<div id="presbox"></div><div id="mapbox"></div><div id="futbox"></div>'+
    '<div class="box" id="cobox"><h3>Possible majorities and the government</h3><p class="hint">Alliances that reach '+maj()+' or more.'+(C.span?' Only neighbours on the axis may unite: no more than three steps apart.':'')+(C.no.length?' Parties that refuse to work together never end up in the same alliance.':'')+' Pick an alliance or put together your own to hand out ministerial portfolios.</p><div class="coal" id="coal"></div><p class="hint" id="cmline" style="margin:12px 0 0"></p><div id="copick"></div></div>'+
    '<div id="billbox"></div>'+
    '<div class="box"><h3>Seats by topic</h3><p class="hint">Click a topic to highlight its seats in the chamber. Change its importance and the parliament is recalculated.</p><div class="ths" id="ths"></div></div>'+
    compassBox(true)+
    '<div class="box"><h3>Where you stand</h3><p class="hint">Your average position (white circle) and the parties’ positions on each topic. Open a topic to see every question'+(mixed?' and who won its district':'')+'.</p><div class="fleg">'+C.fams.map(F=>'<span><i class="dot" style="background:'+esc(F.c)+'"></i>'+esc(F.n)+'</span>').join('')+'<span><i class="dot you"></i>You</span></div><div class="strips" id="strips"></div></div>'+
    '<div class="acts"><button type="button" class="cta" id="again">Take it again</button><button type="button" class="cta ghost" id="edit">Edit the test</button><button type="button" class="cta ghost" id="shot">Save as image</button></div>'+
    '<details class="det box"><summary>How it is calculated</summary>'+
      '<p><b>Parties.</b> Each party has a set of ideological traits with a strength: weak, moderate or strong. Each answer option has traits attached too. A party stands closer to an option on the question scale the stronger its most pronounced trait among those attached to it.</p>'+
      '<p><b>Political system.</b> '+SYSD[R.party]+(R.party==='dom'?' The guaranteed majority is '+bonus()+' of '+C.seats+'.':'')+'</p>'+
      C.fams.map(F=>F.cap>=0&&C.fams[F.cap]?'<p><b>Special rule.</b> “'+esc(F.n)+'” always gets exactly one single-member district, whatever the answers. All other seats it would have won go to “'+esc(C.fams[F.cap].n)+'”.</p>':'').join('')+
      (lowOn()?'<p><b>Minor parties.</b> Parties marked as minor ('+esc(C.fams.filter(F=>F.sm).map(F=>F.n).join(', '))+') have a lowered priority: at the same closeness to your answer such a party gets 40% of an ordinary party’s share, and it wins a district only if it is clearly closer than the others.</p>':'')+
      (thrOn()?'<p><b>Electoral threshold.</b> A party’s vote share is its average closeness to your answers across all topics, weighted by their importance. A party with a share below '+thrTxt()+'% takes no part in the division of party-list seats but can still win districts.</p>':'')+
      '<p><b>Topics.</b> Topic importance divides the seats between topics (not important — 0, a little — 1, medium — 2, important — 3.5, very — 5 shares) by the largest remainder method.</p>'+
      '<p><b>Party-list seats.</b> Each question works like a small vote: your slider is compared with every party’s position; the closest gets most of the question, nearby ones get a little, distant ones almost nothing (a Gaussian bell). A topic’s seats are divided by the sum of these shares.</p>'+
      (mixed?'<p><b>District seats.</b> Each question is a district: all its seats go to the party whose position is closest to your answer. If there are as many seats as questions, it is exactly one question — one seat. A “no opinion” question does not contest its district; its seats move to the list of the same topic.</p>':'')+
      '<p>If a topic has no answers at all, its seats are split equally. Answered: '+answered+' of '+S.qs.length+'.</p></details></section>';
  $('#cobox').addEventListener('click',e=>{ const p=e.target.closest('[data-pk]');
    if(p){ const f=+p.dataset.pk, k=S.pick.indexOf(f); if(k>=0) S.pick.splice(k,1); else S.pick.push(f); updResult(); return; }
    const b=e.target.closest('[data-co]'); if(b&&b.dataset.co) viewCabinet(b.dataset.co.split(',').map(Number)); });
  const ths=$('#ths');
  ths.addEventListener('click',e=>{ const b=e.target.closest('button[data-l]');
    if(b){ e.stopPropagation(); const t=+b.dataset.t; S.lv[t]=+b.dataset.l; if(!S.order.some(x=>S.lv[x]>0)) S.lv[t]=1; updResult(); const nb=$('button[data-t="'+t+'"][data-l="'+S.lv[t]+'"]',ths); if(nb) nb.focus({preventScroll:true}); return; }
    const r=e.target.closest('.tr'); if(!r||r.classList.contains('na')) return; const k='t'+r.dataset.t; S.hl=S.hl===k?null:k; updResult(); });
  ths.addEventListener('keydown',e=>{ const r=e.target.closest('.tr'); if(r&&e.target===r&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); r.click(); } });
  $('#again').addEventListener('click',()=>{ if(C.party==='auto'){ S.sa=[]; S.si=0; window.scrollTo(0,0); viewSys(); } else { S.gv=undefined; begin(); } });
  { const ds=$('#dshare2'); if(ds) ds.addEventListener('input',()=>{ C.dshare=Math.max(0,Math.min(100,+ds.value||0)); $('#dshv2').textContent=C.dshare+'%'; save(); updResult(); }); }
  $('#edit').addEventListener('click',viewBuild); $('#shot').addEventListener('click',exportPng);
  updResult(); $('.res h2').focus({preventScroll:true});
}
function updResult(){
  const mixed=R.sys==='mixed', P=plan(S.lv,S.qs), nF=C.fams.length, M=maj(), scope=S.order.filter(t=>S.lv[t]>0), BB=blocks(scope,P), X=BB.X;
  const bl=C.topics.map((_,t)=>BB.bl[t]||null);
  const li=Array(nF).fill(0), di=Array(nF).fill(0), bo=Array(nF).fill(0); if(X.dom>=0) bo[X.dom]=bonus();
  bl.forEach(b=>{ if(b) b.list.forEach((v,f)=>{ li[f]+=v; di[f]+=b.dist[f]; }); });
  const st=li.map((v,f)=>v+di[f]+bo[f]), L=leader(st), hl=S.hl, solo=st[L]>=M;
  const gr=[]; C.fams.forEach((F,f)=>{ gr.push({seats:bo[f],c:F.c,f,t:-1,k:'b'}); ['l','d'].forEach(k=>bl.forEach((b,t)=>{ if(b) gr.push({seats:k==='l'?b.list[f]:b.dist[f],c:F.c,f,t,k}); })); });
  const hf=hl&&hl[0]==='f'?+hl.slice(1):null, ht=hl&&hl[0]==='t'?+hl.slice(1):null, hk=hl&&hl[0]==='k'?hl[1]:null;
  const dim=hf!==null?o=>o.f!==hf:ht!==null?o=>o.t!==ht:hk?o=>o.k!==hk:null;
  const ch=t=>bl[t]?sum(bl[t].tot):0, KN={l:'party list',d:'by districts',b:'guaranteed to the leader'}, KS={l:sum(li),d:sum(di),b:sum(bo)};
  drawParl($('#rh'),gr,dim,hf!==null?st[hf]:ht!==null?ch(ht):hk?KS[hk]:C.seats,hf!==null?C.fams[hf].n:ht!==null?C.topics[ht].n:hk?KN[hk]:plural(C.seats,'seat','seats','seats'),
    d=>{ if(d.party&&d.party.f!==undefined){ const k='f'+d.party.f; S.hl=S.hl===k?null:k; updResult(); } });
  $('#lead').innerHTML='Largest faction — <b>'+mark(C.fams[L])+esc(C.fams[L].n)+'</b>: '+mest(st[L])+' of '+C.seats+'. '+(R.party==='one'?'In a one-party system it takes the whole chamber.':solo?'That is an absolute majority; no allies are needed.':'No party reaches the majority of '+M+' on its own, so a deal will be needed.')+(gateOut()?' The party “'+esc(C.fams[C.gate].n)+'” was not allowed to stand: that is how you answered the first question.':'')+(C.gate>=0&&C.gnote?' '+esc(C.gnote):'');
  { const tl=$('#thrline'), under=C.fams.map((F,f)=>f).filter(f=>X.el[f]&&!X.elL[f]); tl.hidden=!thrOn();
    tl.textContent=thrOn()?'Electoral threshold for party lists — '+thrTxt()+'%. '+(under.length?'Below the threshold: '+under.map(f=>C.fams[f].n+' ('+pc(X.vs[f])+')').join(', ')+'.':'All parties cleared it.'):''; }
  { const dr=$('#domrow'); dr.hidden=X.dom<0;
    dr.innerHTML=X.dom<0?'':'<span class="lbl" style="margin:0;width:100%">The guaranteed majority goes to</span>'+C.fams.map((F,f)=>X.el[f]?'<button type="button" class="chip" data-dom="'+f+'" aria-pressed="'+(f===X.dom)+'">'+mark(F)+esc(F.n)+'</button>':'').join('');
    $$('[data-dom]',dr).forEach(b=>b.addEventListener('click',()=>{ S.dom=+b.dataset.dom; updResult(); })); }
  const rr=$('#ringrow'); rr.hidden=!sum(di); rr.innerHTML='<button type="button" class="chip" id="ringsw" aria-pressed="'+RINGS+'"><i class="ring" style="border-color:currentColor"></i>Districts as rings</button>';
  $('#ringsw').addEventListener('click',()=>{ setRings(!RINGS); updResult(); const b=$('#ringsw'); if(b) b.focus({preventScroll:true}); });
  const tr=$('#tiers'), tiers=[['l','<i class="dot" style="background:var(--ink2)"></i>By party list '],['d',(RINGS?'<i class="ring" style="border-color:var(--ink2)"></i>':'<i class="dot" style="background:var(--ink2)"></i>')+'By districts '],['b','<i class="dot" style="background:var(--ink2)"></i>To the leader upfront ']].filter(x=>KS[x[0]]>0);
  tr.hidden=tiers.length<2;
  tr.innerHTML=tiers.map(x=>'<button type="button" class="chip" data-k="'+x[0]+'" aria-pressed="'+(hk===x[0])+'">'+x[1]+KS[x[0]]+'</button>').join('');
  $$('button',tr).forEach(b=>b.addEventListener('click',()=>{ const k='k'+b.dataset.k; S.hl=S.hl===k?null:k; updResult(); }));
  const parts=f=>[bo[f]?bo[f]+' upfront':'',li[f]+(mixed?' list':''),mixed?di[f]+' districts':''].filter(Boolean);
  const leg=$('#leg');
  leg.innerHTML=C.fams.map((F,f)=>f).sort((a,b)=>st[b]-st[a]).map(f=>'<button type="button" class="row'+(st[f]?'':' zero')+'" data-f="'+f+'" aria-pressed="'+(hf===f)+'">'+mark(C.fams[f])+'<b>'+esc(C.fams[f].n)+'</b><span class="bar"><span style="width:'+(st[f]/Math.max(1,st[L])*100)+'%;background:'+esc(C.fams[f].c)+'"></span></span><span class="n">'+(tiers.length>1&&st[f]?'<small>'+(bo[f]?bo[f]+' + ':'')+li[f]+(mixed?' + '+di[f]:'')+'</small>':'')+st[f]+'</span></button>').join('');
  $$('.row',leg).forEach(b=>b.addEventListener('click',()=>{ const k='f'+b.dataset.f; S.hl=S.hl===k?null:k; updResult(); }));
  const d=$('#desc');
  if(hf!==null){ const F=C.fams[hf], trs=Object.keys(F.tr).sort((a,b)=>F.tr[b]-F.tr[a]).slice(0,6).map(tname); d.innerHTML='<b>'+esc(F.n)+'</b> · '+mest(st[hf])+(tiers.length>1?' ('+parts(hf).join(', ')+')':'')+'. '+esc(F.d)+(trs.length?' <b>Traits:</b> '+esc(trs.join(', ').toLowerCase())+'.':''); }
  else if(ht!==null) d.innerHTML='<b>'+esc(C.topics[ht].n)+'</b> · '+mest(ch(ht))+': '+C.fams.map((F,f)=>f).filter(f=>bl[ht].tot[f]).sort((a,b)=>bl[ht].tot[b]-bl[ht].tot[a]).map(f=>esc(C.fams[f].n)+' '+bl[ht].tot[f]).join(', ')+'.';
  else if(hk) d.textContent=hk==='l'?'Party-list seats are shown as filled circles: they are divided in proportion to how close the parties are to your answers.':hk==='d'?(RINGS?'District seats are shown as rings: each question goes entirely to the closest party.':'District seats: each question goes entirely to the closest party.'):'The leading party gets these seats straight away, as a guaranteed majority.';
  else d.textContent='Click a party or a seat in the chamber to read about the party and highlight its seats.';
  const co=coalitions(st), bar=m=>'<div class="bar">'+m.map(f=>'<span style="width:'+(st[f]/C.seats*100)+'%;background:'+esc(C.fams[f].c)+'"></span>').join('')+'<em style="left:'+(M/C.seats*100)+'%"></em><em class="cm" style="left:'+(CM()/C.seats*100)+'%"></em></div><button type="button" class="chip" data-co="'+m.join(',')+'" style="margin-top:9px">Form a government</button>';
  $('#coal').innerHTML=solo?'<div class="co"><div class="t"><span>'+esc(C.fams[L].n)+' alone</span><em>'+st[L]+'</em></div>'+bar([L])+'</div>':
    co.length?co.map(c=>{ const nm=coName(c.m), ps=c.m.map(f=>esc(C.fams[f].n)).join(' + '); return '<div class="co"><div class="t"><span>'+(nm?esc(nm)+'<small>'+ps+'</small>':ps)+'</span><em>'+c.t+'</em></div>'+bar(c.m)+'</div>'; }).join(''):'<p class="hint">With this result, no permitted alliance reaches '+M+'.</p>';
  wikibox(st,li,di,bo); try{ worldBoxes(st,scope,co); }catch(e){ if(window.console) console.error(e); }
  try{ const fb=$('#futbox'); if(fb) fb.innerHTML=futureBox(st); }catch(e){ if(window.console) console.error(e); }
  S.st=st; S.pick=S.pick.filter(f=>st[f]>0); const pt=sum(S.pick.map(f=>st[f])), vp=vetoPair(S.pick), pn=coName(S.pick);
  $('#copick').innerHTML='<span class="lbl" style="margin:14px 0 6px">Your own coalition</span><div class="chips">'+C.fams.map((F,f)=>st[f]?'<button type="button" class="chip" data-pk="'+f+'" aria-pressed="'+S.pick.includes(f)+'">'+mark(F)+esc(F.n)+' · '+st[f]+'</button>':'').join('')+'</div>'+
    '<div class="go" style="margin-top:10px"><button type="button" class="chip" data-co="'+S.pick.join(',')+'"'+(S.pick.length&&!vp?'':' disabled')+'>Form a government</button><span>'+(vp?'“'+esc(C.fams[vp[0]].n)+'” and “'+esc(C.fams[vp[1]].n)+'” refuse to sit in the same coalition':S.pick.length?(pn?'“'+esc(pn)+'”: ':'')+pt+' of '+C.seats+(pt>=M?': a majority':': a minority government, short of a majority by '+(M-pt)):'Tick the parties that will join the government')+'</span></div>';
  $('#ths').innerHTML=C.topics.map((T,t)=>{ const na=!S.order.includes(t), b=bl[t];
    return '<div class="tr'+(na?' na':'')+'" data-t="'+t+'"'+(na?'':' role="button" tabindex="0" aria-pressed="'+(ht===t)+'"')+'><span class="nm"><i class="dot" style="background:'+esc(T.c)+'"></i>'+esc(T.n)+(na?' <small style="font-weight:500;color:var(--ink3)">· no answers</small>':'')+'</span><span class="n">'+ch(t)+'</span>'+
      '<span class="tb">'+(b?C.fams.map((F,f)=>b.tot[f]?'<i style="width:'+(b.tot[f]/Math.max(1,ch(t))*100)+'%;background:'+esc(F.c)+'" title="'+esc(F.n)+': '+b.tot[f]+'"></i>':'').join(''):'')+'</span>'+(na?'':segHtml(t,S.lv[t]))+'</div>'; }).join('');
  const sEl=$('#strips');
  sEl.innerHTML=S.order.map(t=>{ const u=themePos(t); return u===null?'':stripHtml(t,u,P,bl[t],X); }).join('')||'<p class="hint">You gave no opinion on any topic.</p>';
  $$('details[data-t]',sEl).forEach(dt=>dt.addEventListener('toggle',()=>{ S.open[dt.dataset.t]=dt.open; }));
}
function stripHtml(t,val,P,b,X){
  const T=C.topics[t], w=300, x=v=>12+(v+1)/2*(w-24); let g='<rect x="12" y="10" width="'+(w-24)+'" height="6" rx="3" fill="var(--line2)"/>';
  C.fams.forEach((F,f)=>{ g+='<circle cx="'+x(famPos(f,t)).toFixed(1)+'" cy="13" r="5" fill="'+esc(F.c)+'" opacity="'+(X.el[f]?.9:.25)+'"><title>'+esc(F.n)+'</title></circle>'; });
  g+='<circle cx="'+x(val).toFixed(1)+'" cy="13" r="7" fill="var(--surface)" stroke="var(--ink)" stroke-width="2.5"/>';
  const rows=[]; S.qs.forEach((q,i)=>{ if(q.t===t&&S.ans[i]!==undefined) rows.push(qRow(i,P.dist[i],b,X)); });
  return '<div class="strip"><div class="l"><span>'+esc(T.lo)+'</span><b>'+esc(T.n)+'</b><span style="text-align:right">'+esc(T.hi)+'</span></div><svg viewBox="0 0 '+w+' 26" width="100%" aria-hidden="true">'+g+'</svg>'+
    '<details class="qd" data-t="'+t+'"'+(S.open[t]?' open':'')+'><summary>Question by question ('+rows.length+')</summary>'+rows.join('')+'</details></div>';
}
function qRow(i,d,b,X){
  const q=S.qs[i], v=S.ans[i], p=S.pp[i], w=300, x=z=>12+(z+1)/2*(w-24), best=v===null?null:(b&&b.wins[i]!==undefined?b.wins[i]:nearest(i,v,X.el));
  let g='<rect x="12" y="8" width="'+(w-24)+'" height="4" rx="2" fill="var(--pend)"/><line x1="'+w/2+'" y1="4" x2="'+w/2+'" y2="16" stroke="var(--ink3)" stroke-width="1"/>';
  C.fams.forEach((F,f)=>{ if(f!==best) g+='<circle cx="'+x(p[f]).toFixed(1)+'" cy="10" r="3.5" fill="'+esc(F.c)+'" opacity="'+(best===null?.85:.4)+'"><title>'+esc(F.n)+'</title></circle>'; });
  if(best!==null) g+='<circle cx="'+x(p[best]).toFixed(1)+'" cy="10" r="6" fill="'+esc(C.fams[best].c)+'" stroke="var(--surface)" stroke-width="2"/><circle cx="'+x(v).toFixed(1)+'" cy="10" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>';
  const tag=v===null?'<span class="near off">No opinion'+(d?' · '+d+' to the list':'')+'</span>':'<span class="near" style="--c:'+esc(C.fams[best].c)+'"><small>'+(d?'District · '+d:'Closest')+'</small><i class="dot"></i>'+esc(C.fams[best].n)+'</span>';
  return '<div class="qr"><div class="h"><b>'+esc(q.q)+'</b>'+tag+'</div><svg viewBox="0 0 '+w+' 20" width="100%" role="img" aria-label="'+esc(q.q)+'">'+g+'</svg><div class="ab"><span>'+esc(q.A)+'</span><span>'+esc(q.B)+'</span></div></div>';
}

// ══════ 7. Правительство: раздача министерских портфелей ══════
// Очередь выбора — по д'Ондту от числа мест. Первым уходит пост премьера, дальше партия берёт портфель,
// связанный с её самой сильной чертой; при равенстве — более весомый.
function draft(m,st){
  const k={}, left=PORT.map(p=>p[0]), asg={}, ord={}; m.forEach(f=>{ k[f]=0; });
  for(let n=1;left.length;n++){
    let f=m[0]; m.forEach(x=>{ if(st[x]/(k[x]+1)>st[f]/(k[f]+1)+1e-9) f=x; });
    let best='pm';
    if(n>1){ let bs=-1; left.forEach(id=>{ const p=PORT.find(x=>x[0]===id), s=p[3].reduce((a,t)=>Math.max(a,SV[C.fams[f].tr[t]||0]),0)+p[2]*.5; if(s>bs+1e-9){ bs=s; best=id; } }); }
    asg[best]=f; ord[best]=n; k[f]++; left.splice(left.indexOf(best),1);
  }
  return {asg,ord};
}
// Кто из партии займёт портфель: премьер — первый в её списке, затем профильные персонажи, затем остальные по порядку
function staff(asg,ord){
  const used={}, min={}, ids=PORT.map(p=>p[0]).sort((a,b)=>ord[a]-ord[b]);
  const take=(id,k)=>{ min[id]=k; (used[asg[id]]=used[asg[id]]||{})[k]=1; }, free=(f,j)=>!(used[f]&&used[f][j]);
  if(C.fams[asg.pm].ppl.length) take('pm',0);
  ids.forEach(id=>{ if(min[id]!==undefined) return; const f=asg[id], k=C.fams[f].ppl.findIndex((p,j)=>p.s===id&&free(f,j)); if(k>=0) take(id,k); });
  ids.forEach(id=>{ if(min[id]!==undefined) return; const f=asg[id], k=C.fams[f].ppl.findIndex((p,j)=>free(f,j)); if(k>=0) take(id,k); else min[id]=-1; });
  return min;
}
function viewCabinet(m){
  const st=S.st, M=maj(); m=m.filter(f=>st[f]>0).sort((a,b)=>st[b]-st[a]||a-b); if(!m.length||vetoPair(m)) return; const cn=coName(m);
  const auto=draft(m,st), asg=Object.assign({},auto.asg), amin=staff(auto.asg,auto.ord), min=Object.assign({},amin), tot=sum(m.map(f=>st[f])), n=PORT.length;
  const anyP=m.some(f=>C.fams[f].ppl.length);
  window.scrollTo(0,0);
  app.innerHTML='<section class="res stack"><div><div class="chips" style="margin-bottom:10px">'+(cn?'<span class="pill">'+esc(cn)+'</span>':'')+'<span class="pill">'+(tot>=M?'Majority government':'Minority government')+'</span><span class="pill">'+tot+' of '+C.seats+' seats</span></div>'+
    '<h2 tabindex="-1" style="outline:none">Government</h2><p class="lead" style="margin:0;max-width:70ch">'+(m.length>1?'Coalition: ':'Single-party cabinet: ')+m.map(f=>'<b>'+esc(C.fams[f].n)+'</b>').join(', ')+'. Portfolios are handed out in turns: the more seats a party has, the earlier and more often it picks, and it takes the ministry closest to its traits. '+(anyP?'Parties nominate ministers from their own characters. ':'These parties have no characters yet: add them in the test settings, in the party cards. ')+'A portfolio can be passed to another party and a minister can be replaced.</p></div>'+
    '<div class="box main"><div class="hemi" id="ch"></div><div class="leg" id="cleg"></div></div>'+
    '<div class="box"><h3>Cabinet of ministers</h3><p class="hint">The number on the left shows in which turn the portfolio was picked.</p><div id="crows"></div></div>'+
    '<div class="acts"><button type="button" class="cta" id="cback">← Back to results</button><button type="button" class="cta ghost" id="creset">Hand out again by the rule</button></div>'+
    '<details class="det box"><summary>How portfolios are handed out</summary><p><b>Order of picks.</b> The D’Hondt method: a party’s seats are divided by the number of portfolios it already holds plus one, and the party with the highest quotient picks next. This keeps each party’s share of portfolios close to its share of coalition seats.</p>'+
      '<p><b>The pick.</b> On the first turn the largest party takes the post of prime minister. After that a party takes the portfolio linked to its strongest trait; when interest is equal, the weightier post is chosen.</p>'+
      '<p><b>Ministers.</b> The prime minister is the first character on the party’s list, that is, its leader. Other portfolios go first to characters with a matching specialty, then to the rest in order. One person holds one post; if a party runs out of people, the post stays vacant.</p></details></section>';
  const pick=(id)=>{ const f=asg[id], busy={}; PORT.forEach(p=>{ if(p[0]!==id&&asg[p[0]]===f&&min[p[0]]>=0) busy[min[p[0]]]=1; }); const P=C.fams[f].ppl; let k=P.findIndex((p,j)=>p.s===id&&!busy[j]); if(k<0) k=P.findIndex((p,j)=>!busy[j]); return k; };
  const fill=()=>{
    $('#cleg').innerHTML=m.map(f=>{ const c=PORT.filter(p=>asg[p[0]]===f).length, F=C.fams[f]; return '<div class="row" style="cursor:default">'+mark(F)+'<b>'+esc(F.n)+'</b><span class="bar"><span style="width:'+(c/n*100)+'%;background:'+esc(F.c)+'"></span></span><span class="n"><small>'+Math.round(st[f]/tot*100)+'% of coalition seats</small>'+c+' of '+n+'</span></div>'; }).join('');
    $('#crows').innerHTML=PORT.slice().sort((a,b)=>auto.ord[a[0]]-auto.ord[b[0]]).map(p=>{ const id=p[0], f=asg[id], was=auto.asg[id], P=C.fams[f].ppl, held={};
      PORT.forEach(x=>{ if(x[0]!==id&&asg[x[0]]===f&&min[x[0]]>=0) held[min[x[0]]]=x[1]; });
      return '<div class="cab-row" style="--c:'+esc(C.fams[f].c)+'"><span class="rk">'+auto.ord[id]+'</span><span class="nm">'+(min[id]>=0&&face(P[min[id]])?'<img class="ava" src="'+esc(face(P[min[id]]))+'" alt="">':'')+'<b>'+p[1]+'</b>'+(min[id]>=0&&P[min[id]]?'<small class="who">'+esc(P[min[id]].n)+'</small>':'<small>Post is vacant</small>')+(f!==was?'<small>Reassigned manually; by the rule — '+esc(C.fams[was].n)+'</small>':'')+'</span>'+
        '<select class="in" id="port-'+id+'" data-port="'+id+'" aria-label="Which party gets the portfolio: '+p[1]+'"'+(m.length<2?' disabled':'')+'>'+m.map(x=>'<option value="'+x+'"'+(x===f?' selected':'')+'>'+esc(C.fams[x].n)+'</option>').join('')+'</select>'+
        '<select class="in" id="min-'+id+'" data-min="'+id+'" aria-label="Who holds the post: '+p[1]+'"'+(P.length?'':' disabled')+'><option value="-1">'+(P.length?'— vacant —':'no characters')+'</option>'+P.map((x,j)=>'<option value="'+j+'"'+(j===min[id]?' selected':'')+(held[j]?' disabled':'')+'>'+esc(x.n)+(held[j]?' · already '+held[j].toLowerCase():'')+'</option>').join('')+'</select></div>'; }).join(''); };
  fill();
  $('#crows').addEventListener('change',e=>{ const t=e.target, id=t.dataset.port||t.dataset.min; if(!id) return;
    if(t.dataset.port){ asg[id]=+t.value; min[id]=-1; min[id]=pick(id); } else min[id]=+t.value;
    fill(); const s=$('#'+t.id); if(s) s.focus({preventScroll:true}); });
  $('#creset').addEventListener('click',()=>{ Object.assign(asg,auto.asg); Object.assign(min,amin); fill(); });
  $('#cback').addEventListener('click',viewResult);
  drawParl($('#ch'),C.fams.map((F,f)=>({seats:st[f],c:F.c,f})),o=>!m.includes(o.f),tot,plural(tot,'seat','seats','seats')+' held by the government');
  $('.res h2').focus({preventScroll:true});
}
// Викибокс: карточка итогов в оформлении Википедии
function wikibox(st,li,di,bo){
  const el=$('#wb'); if(!el) return; const N=C.seats, M=maj(), mixed=R.sys==='mixed';
  const order=st.map((v,f)=>f).filter(f=>st[f]>0).sort((a,b)=>st[b]-st[a]||a-b), top=order.slice(0,6), rest=order.slice(6);
  const years=BUILTIN.filter(p=>p.set.year&&!p.h).map(p=>p.set.year), yi=years.indexOf(C.year);
  const real=F=>{ const x=/Party-list vote: ([\d.]+)%/.exec(F.d); return x?x[1]+'%':''; }, anyReal=C.year&&top.some(f=>real(C.fams[f]));
  const ini=s=>s.split(/[\s—-]+/).filter(Boolean).map(w=>w[0]).join('').slice(0,3).toUpperCase(), pct=v=>(v/N*100).toFixed(1)+'%';
  let rows='';
  for(let k=0;k<top.length;k+=3){ const g=top.slice(k,k+3), pad='<td></td>'.repeat(3-g.length), row=(th,fn)=>'<tr><th scope="row">'+th+'</th>'+g.map(f=>'<td>'+fn(f,C.fams[f])+'</td>').join('')+pad+'</tr>';
    rows+=row('',(f,F)=>{ const ph=face(F.ppl[0]); return '<div class="wb-ph'+(ph?' pic':'')+'" style="background:'+esc(F.c)+'">'+(ph?'<img src="'+esc(ph)+'" alt="">':lg(F)?'<img src="'+esc(lg(F))+'" alt="">':'<span>'+esc(ini(F.n))+'</span>')+'</div>'; })+
      row('Leader',(f,F)=>F.ppl.length?esc(F.ppl[0].n):'—')+
      row('Party',(f,F)=>'<span class="wb-pn"><i style="background:'+esc(F.c)+'"></i>'+esc(F.n)+'</span>')+
      row('Seats won',f=>'<b>'+st[f]+'</b>')+
      row('Share of seats',f=>pct(st[f]))+
      (mixed?row('List / districts',f=>li[f]+' / '+di[f]):'')+
      (bo.some(x=>x)?row('Guaranteed',f=>bo[f]||'—'):'')+
      (anyReal?row('In the '+C.year+' election, party-list vote',(f,F)=>real(F)||'—'):'')+
      '<tr><td colspan="4" class="wb-hr"></td></tr>'; }
  el.innerHTML='<table class="wb"><tbody><tr><th colspan="4" class="wb-title">'+(C.year?'State Duma election ('+C.year+')':'Parliamentary election')+'<div>based on test answers</div></th></tr>'+
    (yi>=0?'<tr><td colspan="4"><div class="wb-nav"><span>'+(yi>0?'← '+years[yi-1]:'')+'</span><b>'+C.year+'</b><span>'+(yi<years.length-1?years[yi+1]+' →':'')+'</span></div></td></tr>':'')+
    '<tr><td colspan="4" class="wb-sub">All '+N+' '+plural(N,'seat','seats','seats')+' '+(C.year?'in the State Duma':'in the parliament')+'<br>A majority requires '+M+' '+plural(M,'seat','seats','seats')+'<br>Constitutional majority — '+CM()+(thrOn()?'<br>Electoral threshold — '+thrTxt()+'%':'')+'</td></tr>'+rows+
    '<tr><td colspan="4"><div class="hemi" id="wbh"></div><div class="wb-cap">Distribution of seats according to the test</div></td></tr>'+
    (rest.length?'<tr><th scope="row">Others</th><td colspan="3" class="wb-left">'+rest.map(f=>esc(C.fams[f].n)+' — '+st[f]).join(', ')+'</td></tr>':'')+
    '<tr><th scope="row">System</th><td colspan="3" class="wb-left">'+SYSF[R.party]+'; '+(mixed?'mixed: party list and districts':'party lists')+'</td></tr></tbody></table>';
  drawParl($('#wbh'),C.fams.map((F,f)=>({seats:st[f],c:F.c})),null,'','',null,true);
}

// ══════ 8. Мир вокруг Думы: конституционное большинство, регионы, президент, законопроекты ══════
const CM=()=>Math.ceil(C.seats*2/3); // конституционное большинство: две трети мест
// Данные из world.js могут не загрузиться (например, в кеше осталась старая страница): тогда эти блоки просто не показываются
const WORLD=typeof BILLS!=='undefined'&&typeof PRES!=='undefined'&&typeof REG!=='undefined'&&typeof REG_T!=='undefined';
const sv=(tr,ids)=>ids.reduce((s,id)=>Math.max(s,SV[tr[id]||0]),0);
const pc=v=>(v*100).toFixed(1)+'%';
// Доли партий по стране: насколько каждая близка к ответам (как при делении мест по списку)
function natShare(scope){ const X=context(scope), s=X.sc.map((v,f)=>X.el[f]?v:0), t=sum(s), n=X.el.filter(Boolean).length; return t?s.map(v=>v/t):X.el.map(e=>e?1/n:0); }
// Черты отвечающего: средняя склонность к вариантам, к которым привязана черта (0…1)
function userTr(){ const s={}, n={}; S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(v==null) return;
    q.a.forEach(id=>{ s[id]=(s[id]||0)-v; n[id]=(n[id]||0)+1; }); q.b.forEach(id=>{ s[id]=(s[id]||0)+v; n[id]=(n[id]||0)+1; }); });
  const o={}; Object.keys(s).forEach(id=>{ o[id]=Math.max(0,s[id]/n[id]); }); return o; }

// ── Регионы: общенациональная доля партии умножается на то, насколько её черты отвечают интересам региона
function regionResult(id,share){
  const types=REG[id][1].filter(t=>REG_T[t]&&(!C.year||(C.year>=REG_T[t][3]&&C.year<=REG_T[t][4])));
  const w=share.map((v,f)=>{ if(!v) return 0; let a=0; types.forEach(t=>{ const tr=REG_T[t][2]; Object.keys(tr).forEach(k=>{ a+=tr[k]*SV[C.fams[f].tr[k]||0]; }); }); return v*Math.exp(.7*a/Math.sqrt(Math.max(1,types.length))); });
  const T=sum(w); return {types,p:w.map(v=>T?v/T:0)};
}
function mapBox(share){
  const M=window.RUMAP; if(!WORLD||!M||!C.year) return '';
  const ids=Object.keys(REG).filter(id=>M.r[id]&&((id!=='CR'&&id!=='SEV')||C.year>=2016)&&(!NEWREG.includes(id)||C.year>=2026)), res={}, wins=C.fams.map(()=>0);
  ids.forEach(id=>{ const r=regionResult(id,share); r.w=leader(r.p); res[id]=r; wins[r.w]++; });
  S.regRes=res; S.natShare=share; if(!res[S.reg]) S.reg='MOW';
  const tip=id=>esc(REG[id][0]+': '+C.fams[res[id].w].n+' '+pc(res[id].p[res[id].w]));
  let g=ids.map(id=>'<path class="rg" data-r="'+id+'" d="'+M.r[id]+'" fill="'+esc(C.fams[res[id].w].c)+'"><title>'+tip(id)+'</title></path>').join('');
  ['MOW','SPE','SEV'].forEach(id=>{ if(res[id]) g+='<circle class="rg city" data-r="'+id+'" cx="'+M.c[id][0]+'" cy="'+M.c[id][1]+'" r="6" fill="'+esc(C.fams[res[id].w].c)+'"><title>'+tip(id)+'</title></circle>'; });
  const order=wins.map((v,f)=>f).filter(f=>wins[f]).sort((a,b)=>wins[b]-wins[a]);
  return '<div class="box"><h3>Map of Russia: how the regions voted</h3><p class="hint">The colour shows the party-list winner in each region. A region’s result comes from your answers and from what matters to that region in particular: the Red Belt, the national republics, the capitals and the Far East all vote differently. Click a region or choose it from the list.'+(C.year>=2026?' For the '+C.year+' , the map also shows Crimea, Sevastopol and the four regions incorporated into Russia in 2022.':C.year>=2016?' For the '+C.year+' election the map also shows Crimea and Sevastopol, where voting took place at the time.':'')+'</p>'+
    '<div class="mapgrid"><div><div class="rumap"><svg viewBox="0 0 '+M.w+' '+M.h+'" role="img" aria-label="Map of Russia with the winners by region">'+g+'</svg></div>'+
      '<div class="fleg" style="justify-content:center;margin:8px 0 0">'+order.map(f=>'<span><i class="dot" style="background:'+esc(C.fams[f].c)+'"></i>'+esc(C.fams[f].n)+' — '+wins[f]+'</span>').join('')+'</div></div>'+
    '<div><label class="lbl" for="regsel">Region</label><select class="in" id="regsel">'+ids.slice().sort((a,b)=>REG[a][0].localeCompare(REG[b][0],'en')).map(id=>'<option value="'+id+'"'+(id===S.reg?' selected':'')+'>'+esc(REG[id][0])+'</option>').join('')+'</select><div id="reginfo">'+regInfo(S.reg)+'</div></div></div></div>';
}
function regInfo(id){
  const r=S.regRes&&S.regRes[id]; if(!r) return '';
  const o=r.p.map((v,f)=>f).filter(f=>r.p[f]>.004).sort((a,b)=>r.p[b]-r.p[a]).slice(0,6);
  return '<div class="leg" style="margin-top:10px">'+o.map(f=>'<div class="row" style="cursor:default">'+mark(C.fams[f])+'<b>'+esc(C.fams[f].n)+'</b><span class="bar"><span style="width:'+(r.p[f]/r.p[o[0]]*100)+'%;background:'+esc(C.fams[f].c)+'"></span></span><span class="n"><small>nationwide '+pc(S.natShare[f])+'</small>'+pc(r.p[f])+'</span></div>').join('')+'</div>'+
    r.types.map(t=>'<p class="hint" style="margin-top:8px"><b>'+REG_T[t][0]+'.</b> '+REG_T[t][1]+'</p>').join('');
}
function showReg(){ const mb=$('#mapbox'); if(!mb) return; $$('.rg',mb).forEach(p=>p.classList.toggle('sel',p.dataset.r===S.reg)); const s=$('#regsel'); if(s) s.value=S.reg; const i=$('#reginfo'); if(i) i.innerHTML=regInfo(S.reg); }

// ── Президентские выборы: те же правила близости, но среди кандидатов; при необходимости второй тур
function presResult(){
  const P=WORLD&&PRES[SK()]; if(!P||!S.qs.length) return null;
  const grey=['#6b7280','#9a6b3f','#7b5ea7','#3f8f8a']; let gi=0;
  const cands=P.c.map(c=>{ const f=c[1]?C.fams.findIndex(F=>F.n===c[1]):-1; return {n:c[0],f,tr:c[2]||(f>=0?C.fams[f].tr:{}),c:f>=0?C.fams[f].c:grey[gi++%4],pn:f>=0?C.fams[f].n:'Independent'}; });
  const w=cands.map(()=>0); let tw=0;
  S.order.forEach(t=>{ if(!(S.lv[t]>0)) return; const a=cands.map(()=>0); let k=0;
    S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(q.t!==t||v==null) return; k++; const e=cands.map(c=>{ const x=sv(c.tr,q.b)-sv(c.tr,q.a); return (v-x)*(v-x); }), m=Math.min(...e), gs=e.map(x=>Math.exp(-(x-m)/(2*SIGMA*SIGMA))), G=sum(gs); gs.forEach((x,j)=>{ a[j]+=x/G; }); });
    if(k){ const lw=LV[S.lv[t]].w; a.forEach((x,j)=>{ w[j]+=x/k*lw; }); tw+=lw; } });
  const p1=tw?w.map(x=>x/tw):w.map(()=>1/cands.length), ord=p1.map((v,j)=>j).sort((a,b)=>p1[b]-p1[a]);
  let second=null, win=ord[0];
  if(p1[ord[0]]<=.5&&cands.length>2){ // голоса выбывших делятся между двумя финалистами по идейной близости
    const A=ord[0], B=ord[1], xy=cands.map(c=>{ const s={}; Object.keys(c.tr).forEach(id=>{ s[id]=SV[c.tr[id]]; }); return coords(s); }), d=(i,j)=>Math.hypot(xy[i][0]-xy[j][0],xy[i][1]-xy[j][1])+.05;
    let pa=p1[A], pb=p1[B]; cands.forEach((c,j)=>{ if(j===A||j===B) return; const da=d(j,A), db=d(j,B), stay=.7; pa+=p1[j]*stay*db/(da+db); pb+=p1[j]*stay*da/(da+db); });
    const T=pa+pb; second={a:A,b:B,pa:pa/T,pb:pb/T}; win=second.pa>=second.pb?A:B; }
  return {y:P.y,cands,p1,ord,second,win,real:P.real};
}
function presBox(){
  const r=presResult(); if(!r) return ''; S.pres=r;
  const top=r.ord.slice(0,6); let rows='';
  for(let k=0;k<top.length;k+=3){ const g=top.slice(k,k+3), pad='<td></td>'.repeat(3-g.length), row=(th,fn)=>'<tr><th scope="row">'+th+'</th>'+g.map(j=>'<td>'+fn(j,r.cands[j])+'</td>').join('')+pad+'</tr>';
    rows+=row('',(j,c)=>{ const ph=face({n:c.n}); return '<div class="wb-ph'+(ph?' pic':'')+'" style="background:'+esc(c.c)+'">'+(ph?'<img src="'+esc(ph)+'" alt="">':'<span>'+esc(c.n.split(' ').map(x=>x[0]).join(''))+'</span>')+'</div>'; })+
      row('Candidate',(j,c)=>(j===r.win?'<b>'+esc(c.n)+'</b>':esc(c.n)))+
      row('Party',(j,c)=>'<span class="wb-pn"><i style="background:'+esc(c.c)+'"></i>'+esc(c.pn)+'</span>')+
      row('First round',j=>pc(r.p1[j]))+
      (r.second?row('Second round',j=>j===r.second.a?'<b>'+pc(r.second.pa)+'</b>':j===r.second.b?'<b>'+pc(r.second.pb)+'</b>':'—'):'')+
      '<tr><td colspan="4" class="wb-hr"></td></tr>'; }
  const W=r.cands[r.win];
  return '<div class="box"><h3>Presidential election of '+r.y+' </h3><p class="hint">'+(FIC()?'A snap presidential election right after the Duma election: the scenario is fictional, the politicians are real,':'The presidential election that follows this Duma. The candidates are real,')+' while the votes are counted from your answers, just as for the parties. If nobody wins more than half, a second round is held, and the votes of eliminated candidates go to the closer finalist.</p>'+
    '<table class="wb"><tbody><tr><th colspan="4" class="wb-title">Russian presidential election ('+r.y+')<div>based on test answers</div></th></tr>'+rows+
    '<tr><th scope="row">Outcome</th><td colspan="3" class="wb-left"><b>'+esc(W.n)+'</b> wins '+(r.second?'in the second round':'in the first round')+'</td></tr>'+
    '<tr><th scope="row">In reality</th><td colspan="3" class="wb-left">'+esc(r.real)+'</td></tr></tbody></table></div>';
}

// ══════ “Ваша Прекрасная Россия Будущего”: концовка по взглядам отвечающего и составу Думы ══════
function futEra(){ return typeof FUT_ERA!=='undefined'&&C.year&&!FIC()?FUT_ERA.find(e=>C.year>=e.from&&C.year<=e.to):null; }
// Как ответил бы сторонник концовки на вопрос: +1 — вариант Б, −1 — вариант А, 0 — ему всё равно
function futIdeal(e,q){ const sc=ids=>ids.reduce((s,id)=>s+(e.w[id]||0),0), dv=sc(q.b)-sc(q.a); return dv>0?1:dv<0?-1:0; }
// Близость к концовке — косинус между вашими ответами и ответами её сторонника (вопросы темы “Будущее” весят вдвое);
// к ней прибавляется небольшая поправка за долю мест у партий, на которые концовка опирается.
function futRank(st){ const era=futEra(); if(!era||typeof FUT==='undefined'||!S.qs.length||S.ans.every(v=>v==null)) return null;
  const ft=C.topics.findIndex(t=>t.n==='The Future'), N=sum(st)||1, kq=S.qs.map(q=>q.t===ft?2:1); let un=0; S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(v!=null) un+=kq[i]*v*v; });
  const list=FUT[era.k].filter(e=>(!e.from||C.year>=e.from)&&(!e.to||C.year<=e.to)).map(e=>{ let x=0,y=0,ue=0; // ue — сила ваших ответов на вопросы, важные для концовки: безразличие концовки к остальным штрафуется вполовину
    S.qs.forEach((q,i)=>{ const id=futIdeal(e,q); if(!id) return; y+=kq[i]; const v=S.ans[i]; if(v!=null){ x+=kq[i]*v*id; ue+=kq[i]*v*v; } });
    return {e,sc:(ue&&y?x/Math.sqrt((.5*un+.5*ue)*y):0)+.2*sum(C.fams.map((F,f)=>e.fam.includes(F.n)?st[f]/N:0))}; }).sort((x,y)=>y.sc-x.sc);
  const dbg=/[?&]fut=([0-9]+)/.exec(location.search), pick=dbg&&FUT[era.k][+dbg[1]]; // ?fut=N в адресе показывает концовку с номером N — для проверки оформления
  if(pick){ const i=list.findIndex(x=>x.e===pick); if(i>=0) list.unshift(list.splice(i,1)[0]); }
  return {era,list}; }
function flagSvg(f){ const tot=sum(f.s.map(x=>Array.isArray(x)?x[1]:1)); let y=0;
  let h='<svg class="fut-flag" viewBox="0 0 90 60" role="img" aria-label="Flag">'+f.s.map(x=>{ const c=Array.isArray(x)?x[0]:x, hh=60*(Array.isArray(x)?x[1]:1)/tot, r='<rect x="0" y="'+y+'" width="90" height="'+(hh+.4)+'" fill="'+c+'"/>'; y+=hh; return r; }).join('');
  if(f.h) h+='<rect x="0" y="0" width="12" height="60" fill="'+f.h+'"/>';
  if(f.e) h+=f.ep==='c'?'<text x="45" y="42" font-size="34" text-anchor="middle" fill="'+f.ec+'">'+f.e+'</text>':'<text x="'+(f.h?27:17)+'" y="25" font-size="22" text-anchor="middle" fill="'+f.ec+'">'+f.e+'</text>';
  return h+'</svg>'; }
// Контуры лежат в документе один раз (скрытый svg с defs), карты ссылаются на них через use
function futDefs(){ if(document.getElementById('futdefs')) return; const M=window.RUMAP, K=window.FUTMAP||{}; if(!M) return;
  const h=document.createElement('div'); h.id='futdefs'; h.setAttribute('aria-hidden','true'); h.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  h.innerHTML='<svg><defs>'+Object.keys(M.r).map(id=>'<path id="fr-'+id+'" d="'+M.r[id]+'"/>').join('')+Object.keys(K).map(k=>'<path id="fc-'+k+'" d="'+K[k].d+'"/>').join('')+'</defs></svg>'; document.body.appendChild(h); }
// В контуре Украины Крыма нет: он рисуется отдельно, когда Украина в составе или у концовки стоит cr.
// nr — нынешние границы: Донецкая, Луганская, Запорожская и Херсонская области в составе России (целиком, как в российской Конституции)
function futMapSvg(m,col){ const M=window.RUMAP, K=window.FUTMAP||{}; if(!M) return ''; futDefs();
  let b=[0,0,M.w,M.h]; const inc=(m.inc||[]).concat(m.nr&&!(m.inc||[]).includes('UKR')?['DON','LUG','ZAP','KHE']:[]).filter(k=>K[k]), solid={DON:1,LUG:1,ZAP:1,KHE:1}; inc.forEach(k=>{ const q=K[k].b; b=[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[2]),Math.max(b[3],q[3])]; });
  const sp={}; (m.split||[]).forEach(g=>g[0].forEach(id=>{ sp[id]=g[1]; }));
  const cr=m.cr||inc.includes('UKR'), ids=Object.keys(M.r).filter(id=>!NEWREG.includes(id)&&((id!=='CR'&&id!=='SEV')||cr)), on=id=>m.only?m.only.includes(id):!(m.exc||[]).includes(id);
  return '<svg class="fut-map" viewBox="'+(b[0]-8)+' '+(b[1]-8)+' '+(b[2]-b[0]+16)+' '+(b[3]-b[1]+16)+'" role="img" aria-label="Borders">'+
    inc.map(k=>'<use href="#fc-'+k+'" fill="'+col+'"'+(solid[k]?'':' fill-opacity=".7"')+'/>').join('')+
    ids.map(id=>'<use href="#fr-'+id+'" '+(on(id)?'fill="'+(sp[id]||col)+'"':'class="off"')+'/>').join('')+'</svg>'; }
function futCard(e,st,when){ const col=e.party[1], ph=PH[e.lead]||'', lgo=LG[e.party[0]]||'';
  const mono=e.party[0].replace(/[“”“”"]/g,'').split(/[\s—–-]+/).filter(Boolean).map(x=>x[0].toUpperCase()).join('').slice(0,3);
  const row=(k,v)=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>';
  return '<div class="fut-card" style="--fc:'+esc(col)+'"><div class="fut-head">'+flagSvg(e.flag)+'<div><small>'+esc(when)+'</small><b>'+esc(e.n)+'</b></div></div>'+
    '<div class="fut-body"><div class="fut-info"><div class="fut-lead"><div class="wb-ph'+(ph?' pic':'')+'" style="background:'+esc(col)+'">'+(ph?'<img src="'+esc(ph)+'" alt="">':'<span>'+esc(e.lead.split(' ').map(x=>x[0]).join(''))+'</span>')+'</div><div><small>Leader</small><b>'+esc(e.lead)+'</b></div></div>'+
    '<dl>'+row('Ideology',esc(e.ideo))+row('Form of government',esc(e.form))+row('Ruling party',(lgo?'<img class="logo" src="'+esc(lgo)+'" alt="" style="border-color:'+esc(col)+'">':'<span class="fut-mono" style="background:'+esc(col)+'">'+esc(mono)+'</span>')+esc(e.party[0]))+'</dl></div>'+
    '<div class="fut-vis"><figure>'+futMapSvg(e.map,col)+'<figcaption>Borders</figcaption></figure></div></div></div>'; }
function futureBox(st){ const r=futRank(st); if(!r) return '';
  return '<div class="box fut"><h3>Your Beautiful Russia of the Future</h3><p class="hint">'+esc(r.era.intro)+' The ending is chosen from your answers in every topic (the “Future” topic counts double) and from the make-up of your Duma. The scenario is fictional, the politicians are real.</p>'+
    futCard(r.list[0].e,st,r.era.when)+
    '<p class="hint" style="margin-top:10px">It could also have gone this way: '+r.list.slice(1,4).map(x=>esc(x.e.lead)+' — '+esc(x.e.n)+' ('+esc(x.e.ideo)+')').join('; ')+'.</p>'+
    '</div>'; }

// ── Законопроекты: фракция голосует “за”, если её черты ближе к закону, чем к возражениям
function billVote(b,st){ const yes=[], no=[], abs=[]; C.fams.forEach((F,f)=>{ if(!st[f]) return; const p=sv(F.tr,b[2])-sv(F.tr,b[3]); (p>=.2?yes:p<=-.2?no:abs).push(f); }); const cnt=a=>sum(a.map(f=>st[f])); return {yes,no,abs,y:cnt(yes),n:cnt(no),a:cnt(abs)}; }
function billsBox(st){
  const B=WORLD&&BILLS[SK()]; if(!B) return ''; const N=C.seats, ut=userTr(), um=ids=>ids.reduce((s,id)=>Math.max(s,ut[id]||0),0); let passed=0;
  const items=B.map(b=>{ const v=billVote(b,st), need=b[4]==='const'?CM():maj(), ok=v.y>=need, up=um(b[2])-um(b[3]); if(ok) passed++;
    const who=(a,t)=>a.length?'<span class="bv"><b>'+t+':</b> '+a.map(f=>'<i class="dot" style="background:'+esc(C.fams[f].c)+'"></i>'+esc(C.fams[f].n)).join(', ')+'</span>':'';
    return '<div class="bill"><div class="h"><b>'+esc(b[0])+'</b><span class="pill '+(ok?'ok':'bad')+'">'+(ok?'Passed':'Rejected')+'</span></div><p class="hint">'+esc(b[1])+(b[4]==='const'?' A constitutional majority is required: '+need+'.':'')+'</p>'+
      '<div class="vbar"><span class="y" style="width:'+(v.y/N*100)+'%"></span><span class="a" style="width:'+(v.a/N*100)+'%"></span><span class="n" style="width:'+(v.n/N*100)+'%"></span><em style="left:'+(need/N*100)+'%"></em></div>'+
      '<div class="vnum"><span>For <b>'+v.y+'</b></span><span>Abstained <b>'+v.a+'</b></span><span>Against <b>'+v.n+'</b></span><span>Needed <b>'+need+'</b></span></div>'+
      '<div class="bvs">'+who(v.yes,'For')+who(v.abs,'Abstained')+who(v.no,'Against')+'</div>'+
      '<p class="hint"><b>You:</b> '+(up>=.15?'would vote for':up<=-.15?'would vote against':'would probably abstain')+'. <b>In reality:</b> '+esc(b[5])+'</p></div>'; }).join('');
  return '<div class="box"><h3>Bills of this convocation</h3><p class="hint">'+(FIC()?'A fictional agenda: issues such a Duma would have to decide.':'Real bills considered by the Duma chosen in the '+C.year+' election.')+' Factions vote according to their traits: an ordinary law needs '+maj()+' votes, a constitutional one — '+CM()+'. Your Duma passed '+passed+' of '+B.length+'.</p>'+items+'</div>';
}

// Заполняет блоки результата, которые есть только в думских сценариях
function worldBoxes(st,scope,co){
  const pb=$('#presbox'), mb=$('#mapbox'), bb=$('#billbox'), cl=$('#cmline'), cm=CM();
  if(cl){ const solo=st.map((v,f)=>f).filter(f=>st[f]>=cm), cs=co.filter(c=>c.t>=cm);
    cl.textContent='Constitutional majority — '+cm+' '+plural(cm,'seat','seats','seats'), cl.textContent+=solo.length?': “'+C.fams[solo[0]].n+'” reaches it alone and can amend the Constitution without allies.':cs.length?'. These alliances reach it: '+cs.map(c=>coName(c.m)||c.m.map(f=>C.fams[f].n).join(' + ')).join('; ')+'.':'. None of the alliances shown reaches it: amending the Constitution will require a deal with the opposition.'; }
  if(pb) pb.innerHTML=presBox();
  if(mb){ mb.innerHTML=mapBox(natShare(scope)); showReg();
    if(!mb._b){ mb._b=1; mb.addEventListener('click',e=>{ const r=e.target.closest('[data-r]'); if(r){ S.reg=r.dataset.r; showReg(); } }); mb.addEventListener('change',e=>{ if(e.target.id==='regsel'){ S.reg=e.target.value; showReg(); } }); } }
  if(bb) bb.innerHTML=billsBox(st);
}

// ══════ Картинка с результатом: рисуется на холсте и скачивается как PNG ══════
function exportPng(){
  const st=S.st; if(!st) return;
  const css=getComputedStyle(document.documentElement), tok=n=>css.getPropertyValue(n).trim()||'#888888';
  const W=1080, M=maj(), mixed=R.sys==='mixed', order=st.map((v,f)=>f).filter(f=>st[f]>0).sort((a,b)=>st[b]-st[a]||a-b), L=order[0];
  const legY=800, rowH=54, lines=3+(S.pres?1:0), H=legY+Math.ceil(order.length/2)*rowH+40+lines*40+90;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext&&cv.getContext('2d'); if(!g) return;
  const D="Unbounded, 'Golos Text', sans-serif", B="'Golos Text', system-ui, sans-serif", font=(w,px,fam)=>{ g.font=w+' '+px+'px '+fam; };
  const fit=(t,max)=>{ let s=String(t); if(g.measureText(s).width<=max) return s; while(s.length>3&&g.measureText(s+'…').width>max) s=s.slice(0,-1); return s+'…'; };
  g.fillStyle=tok('--bg'); g.fillRect(0,0,W,H);
  g.fillStyle=tok('--surface'); g.beginPath(); if(g.roundRect) g.roundRect(36,36,W-72,H-72,30); else g.rect(36,36,W-72,H-72); g.fill();
  // шапка
  g.fillStyle=tok('--accent'); g.beginPath(); g.arc(104,112,22,Math.PI,0); g.fill();
  g.textBaseline='alphabetic'; g.textAlign='left'; g.fillStyle=tok('--ink2'); font(800,24,D); g.fillText('Duma Simulator',140,112);
  g.fillStyle=tok('--ink'); font(800,56,D); g.fillText(fit(C.year?'Your Duma of '+C.year+' ':'Your parliament',W-164),82,196);
  g.fillStyle=tok('--ink2'); font(500,25,B); g.fillText(fit(SYSF[R.party]+' · '+(mixed?'mixed: party list and districts':'party lists')+' · '+mest(C.seats),W-164),82,238);
  // зал: те же места, что на экране
  const seats=$$('#rh .seat'), k=(W-220)/600, ox=110, oy=270, rs={}; seats.forEach(el=>{ const d=d3.select(el).datum(); if(d&&d.polar) rs[d.polar.r.toFixed(2)]=1; });
  const rw=180/Math.max(1,Object.keys(rs).length), r=rw*.4*k;
  seats.forEach(el=>{ const d=d3.select(el).datum(); if(!d||!d.cartesian) return; const cs=getComputedStyle(el), x=ox+(300+d.cartesian.x)*k, y=oy+(300+d.cartesian.y)*k, ring=cs.stroke&&cs.stroke!=='none';
    g.beginPath(); g.arc(x,y,ring?r*.92:r,0,Math.PI*2); if(ring){ g.fillStyle=tok('--surface'); g.fill(); g.lineWidth=rw*.14*k; g.strokeStyle=cs.stroke; g.stroke(); } else { g.fillStyle=cs.fill||tok('--pend'); g.fill(); } });
  g.textAlign='center'; g.fillStyle=tok('--ink'); font(800,68,D); g.fillText(String(C.seats),W/2,oy+300*k-44);
  g.fillStyle=tok('--ink2'); font(500,26,B); g.fillText(plural(C.seats,'seat','seats','seats'),W/2,oy+300*k-8);
  // партии в две колонки
  const colW=(W-164-40)/2; g.textAlign='left';
  order.forEach((f,i)=>{ const F=C.fams[f], x=82+(i%2)*(colW+40), y=legY+Math.floor(i/2)*rowH;
    g.fillStyle=F.c; g.beginPath(); g.arc(x+13,y-9,13,0,Math.PI*2); g.fill();
    font(800,28,D); const num=String(st[f]), nw=g.measureText(num).width; font(500,21,B); const pct=(st[f]/C.seats*100).toFixed(1)+'%', pw=g.measureText(pct).width;
    g.fillStyle=tok('--ink'); font(600,26,B); g.fillText(fit(F.n,colW-44-nw-pw-30),x+38,y);
    g.textAlign='right'; g.fillStyle=tok('--ink2'); font(500,21,B); g.fillText(pct,x+colW,y); g.fillStyle=tok('--ink'); font(800,28,D); g.fillText(num,x+colW-pw-14,y); g.textAlign='left'; });
  // итоговые строки
  let y=legY+Math.ceil(order.length/2)*rowH+34; g.fillStyle=tok('--line2'); g.fillRect(82,y-44,W-164,2);
  const line=t=>{ g.fillStyle=tok('--ink'); font(500,25,B); g.fillText(fit(t,W-164),82,y); y+=40; };
  line('Largest faction — '+C.fams[L].n+': '+mest(st[L])+' of '+C.seats);
  line('Majority — '+M+' · constitutional majority — '+CM());
  if(S.pres) line('President ('+S.pres.y+'): '+S.pres.cands[S.pres.win].n);
  g.fillStyle=tok('--ink3'); font(500,21,B); g.fillText('based on test answers · bolshoiprikol2.github.io/Duma-Simulator',82,y+8);
  const name='duma-simulator'+(C.year?'-'+C.year:'')+'.png';
  cv.toBlob(b=>{ if(!b) return; const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },800); },'image/png');
}
const cr=$('#credits'); if(cr){ const ALL=Object.assign({},PHS); Object.keys(LGS).forEach(n=>{ ALL['Party logo: “'+n+'”']=LGS[n]; }); const ks=Object.keys(ALL).sort(); if(!ks.length) cr.hidden=true;
  cr.addEventListener('toggle',()=>{ const box=$('div',cr); if(!cr.open||box.innerHTML) return;
    box.innerHTML=ks.map(n=>{ const s=ALL[n]; return '<p>'+esc(n)+': <a href="https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(s[0].replace(/ /g,'_'))+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>'+(s[1]?', author: '+esc(s[1]):'')+(s[2]?', licence: '+esc(s[2]):'')+'</p>'; }).join(''); }); }
toBuild.addEventListener('click',viewBuild);
viewBuild();
})();
