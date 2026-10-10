(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=a=>a.reduce((s,v)=>s+v,0);
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const app=$('#app'), toBuild=$('#toBuild');
const plural=(n,a,b,c)=>{ const m=Math.abs(n)%100, k=m%10; return m>10&&m<20?c:k===1?a:k>=2&&k<=4?b:c; };
const mest=n=>n+' '+plural(n,'место','места','мест');

function defaults(set,raw){ raw=raw||{T:DEF_T,F:DEF_F,Q:DEF_Q}; const ix=n=>raw.F.findIndex(f=>f[0]===n);
  return Object.assign({name:'Стандартный',seats:350,sys:'prop',party:'auto',duo:[-1,-1],year:0,span:true,dshare:50,lowpri:false,thr:0,thron:false,key:'',gate:raw.gate?ix(raw.gate[0]):-1,gnote:raw.gate?raw.gate[1]:'',
  no:(raw.no||[]).map(p=>p.map(ix)),coal:(raw.co||[]).map(x=>({n:x[0],m:x[1].map(ix)})),scenarios:[],
  traits:TR.map(([id,n,g])=>({id,n,g})),
  topics:raw.T.map(([n,s,c,lo,hi])=>({n,s,c,lo,hi})),
  fams:raw.F.map(([n,c,d,tr,sm])=>({n,c,d,logo:'',sm:sm!=null?!!sm:(()=>{ const x=/По списку — ([\d,]+)%/.exec(d); return !!x&&parseFloat(x[1].replace(',','.'))<5; })(),tr:Object.assign({},tr),ppl:((raw.P||{})[n]||[]).map(p=>({n:p[0],s:p[1]})),cap:(()=>{ const c=(raw.cap||[]).find(x=>x[0]===n); return c?ix(c[1]):-1; })()})),
  qs:raw.Q.map(([t,d,q,A,B,a,b])=>({t,d,q,A,B,on:true,a:a.slice(),b:b.slice()}))},set||{}); }
const HEX=/^#[0-9a-f]{6}$/i;
// Картинка — либо загруженный файл (data:), либо ссылка http(s)
const isUrl=s=>typeof s==='string'&&/^https?:\/\/\S+$/i.test(s)&&s.length<=2000, okImg=s=>typeof s==='string'&&(s.indexOf('data:image/')===0||isUrl(s))?s:'';
function norm(c){
  if(!c||!Array.isArray(c.topics)||!Array.isArray(c.fams)||!Array.isArray(c.qs)||c.fams.length<2||!c.topics.length) return null;
  c.name=String(c.name||'Без названия').slice(0,60);
  c.seats=Math.max(10,Math.min(1000,Math.round(+c.seats)||350)); c.sys=c.sys==='mixed'?'mixed':'prop';
  c.party=['auto','one','dom','multi'].includes(c.party)?c.party:'multi';
  c.traits=(Array.isArray(c.traits)&&c.traits.length?c.traits:TR.map(([id,n,g])=>({id,n,g}))).filter(x=>x&&x.id).map(x=>({id:String(x.id),n:String(x.n||x.id),g:String(x.g||'Свои')}));
  const ok=new Set(c.traits.map(x=>x.id)), ids=a=>(Array.isArray(a)?a:[]).filter((id,i,arr)=>ok.has(id)&&arr.indexOf(id)===i);
  c.topics=c.topics.map(t=>({n:String(t.n||'Тема'),s:String(t.s||''),c:HEX.test(t.c)?t.c:'#94A8F9',lo:String(t.lo||''),hi:String(t.hi||'')}));
  c.fams=c.fams.slice(0,12).map(f=>{ const tr={}; Object.keys(f.tr||{}).forEach(id=>{ const l=Math.round(+f.tr[id]); if(ok.has(id)&&l>=1&&l<=3) tr[id]=l; });
    return {n:String(f.n||'Партия'),c:HEX.test(f.c)?f.c:'#888888',d:String(f.d||''),logo:okImg(f.logo),tr,sm:!!f.sm,cap:Number.isInteger(f.cap)?f.cap:-1,
      ppl:(Array.isArray(f.ppl)?f.ppl:[]).filter(p=>p&&typeof p.n==='string').slice(0,12).map(p=>({n:p.n.slice(0,60),s:PORT.some(x=>x[0]===p.s)?p.s:'',img:okImg(p.img)}))}; });
  c.qs=c.qs.filter(q=>q&&q.t>=0&&q.t<c.topics.length).map(q=>({t:+q.t,d:q.d===-1?-1:1,q:String(q.q||''),A:String(q.A||''),B:String(q.B||''),on:q.on!==false,a:ids(q.a),b:ids(q.b)}));
  const nf=c.fams.length, okf=x=>Number.isInteger(x)&&x>=0&&x<nf;
  c.no=(Array.isArray(c.no)?c.no:[]).filter(p=>Array.isArray(p)&&okf(p[0])&&okf(p[1])&&p[0]!==p[1]).map(p=>[p[0],p[1]]);
  c.coal=(Array.isArray(c.coal)?c.coal:[]).filter(x=>x&&Array.isArray(x.m)).map(x=>({n:String(x.n||'Коалиция').slice(0,60),m:x.m.filter(okf),mode:x.mode==='logic'?'logic':'exact',
    when:(Array.isArray(x.when)?x.when:[]).map(m=>Array.isArray(m)?m.filter((f,i,a)=>okf(f)&&a.indexOf(f)===i):[]),
    variants:(Array.isArray(x.variants)?x.variants:[]).slice(0,1).map(v=>{ const required=Array.isArray(v.required)?v.required.filter((f,i,a)=>okf(f)&&a.indexOf(f)===i):[], optional=Array.isArray(v.optional)?v.optional.filter((f,i,a)=>okf(f)&&a.indexOf(f)===i&&!required.includes(f)):[]; return {required,optional}; })}));
  if(!Array.isArray(c.scenarios)) c.scenarios=[];
  c.scenarios=c.scenarios.filter(x=>x&&typeof x==='object').map(x=>({
    n:String(x.n||'Новый сценарий').slice(0,60),
    when:(Array.isArray(x.when)?x.when:[]).map(m=>Array.isArray(m)?m.filter((f,i,a)=>okf(f)&&a.indexOf(f)===i):[]),
    no:(Array.isArray(x.no)?x.no:c.no).filter(p=>Array.isArray(p)&&okf(p[0])&&okf(p[1])&&p[0]!==p[1]).map(p=>[p[0],p[1]])
  }));
  c.span=c.span!==false; c.year=Math.round(+c.year)||0;
  c.dshare=Number.isFinite(+c.dshare)&&c.dshare!==null&&c.dshare!==undefined?Math.max(0,Math.min(100,Math.round(+c.dshare))):50;
  c.thr=Math.max(0,Math.min(20,Math.round((+c.thr||0)*2)/2)); c.thron=!!c.thron; c.key=typeof c.key==='string'?c.key.slice(0,12):'';
  c.lowpri=c.lowpri===true;
  c.gate=okf(c.gate)?c.gate:-1; c.gnote=String(c.gnote||'').slice(0,400);
  c.fams.forEach((f,i)=>{ if(!okf(f.cap)||f.cap===i) f.cap=-1; });
  c.duo=[0,1].map(k=>{ const v=Math.round(+(c.duo||[])[k]); return v>=0&&v<c.fams.length?v:-1; });
  return c;
}
const KEY='svoy-parlament-v5', PKEY='svoy-parlament-presets';
let C=null, USER=[];
try{ C=norm(JSON.parse(localStorage.getItem(KEY))); }catch(e){}
try{ USER=(JSON.parse(localStorage.getItem(PKEY))||[]).filter(p=>p&&p.n&&norm(p.c)); }catch(e){ USER=[]; }
const presetCfg=p=>defaults(Object.assign({name:p.n},p.set),p.raw);
if(!C) C=presetCfg(BUILTIN.find(p=>p.n==='Дума-2021'));
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(C)); }catch(e){} }
// Показывать ли места от округов кольцами: настройка вида, хранится в браузере
let RINGS=true; try{ RINGS=localStorage.getItem('duma-sim-rings')!=='0'; }catch(e){}
function setRings(v){ RINGS=!!v; try{ localStorage.setItem('duma-sim-rings',v?'1':'0'); }catch(e){} }
function saveUser(){ try{ localStorage.setItem(PKEY,JSON.stringify(USER)); return true; }catch(e){ return false; } }

// ══════ Модель ══════
const LV=[{n:'Не важно',w:0},{n:'Мало',w:1},{n:'Средне',w:2},{n:'Важно',w:3.5},{n:'Очень',w:5}];
const SV=[0,.35,.7,1], SL=['','слабо','умеренно','сильно'], SIGMA=0.2;
const R={party:'multi',sys:'prop'}; // система, действующая в текущем прохождении
const SK=()=>C.key||C.year; // ключ сценария в DUMA, BILLS и PRES
const FIC=()=>!!(C.year&&typeof DUMA!=='undefined'&&DUMA[SK()]&&DUMA[SK()].fic); // вымышленный сценарий
const thrOn=()=>!!(C.year&&C.thron&&C.thr>0&&(R.party==='multi'||R.party==='dom')), thrTxt=()=>String(C.thr).replace('.',','); // проходной барьер для списков
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
  if(withUser&&S.ans.some(v=>v!=null)){ const c=userCoords(); pts.push({x:sc(c[0]),y:sc(-c[1]),you:true,n:'Вы'}); }
  let g='<rect x="'+p0+'" y="'+p0+'" width="'+(p1-p0)+'" height="'+(p1-p0)+'" fill="var(--sunk)" stroke="var(--line2)" stroke-width="1"/>'+
    '<line x1="'+mid+'" y1="'+p0+'" x2="'+mid+'" y2="'+p1+'" stroke="var(--line2)" stroke-width="1"/><line x1="'+p0+'" y1="'+mid+'" x2="'+p1+'" y2="'+mid+'" stroke="var(--line2)" stroke-width="1"/>'+
    '<text x="'+mid+'" y="18" text-anchor="middle" class="ax">Порядок и сильная власть</text><text x="'+mid+'" y="'+(W-8)+'" text-anchor="middle" class="ax">Свободы и конкуренция</text>'+
    '<text x="12" y="'+mid+'" text-anchor="middle" class="ax" transform="rotate(-90 12 '+mid+')">Государство в экономике</text><text x="'+(W-12)+'" y="'+mid+'" text-anchor="middle" class="ax" transform="rotate(90 '+(W-12)+' '+mid+')">Рынок в экономике</text>';
  const placed=[]; let labels='';
  pts.slice().sort((a,b)=>a.y-b.y).forEach(p=>{ const t=p.n.length>20?p.n.slice(0,19)+'…':p.n, w=t.length*5.7+4, left=p.x>W*.6, x0=left?p.x-10-w:p.x+10; let y=p.y+3.5;
    for(let k=0;k<8&&placed.some(b=>Math.abs(b.y-y)<11&&x0<b.x1&&x0+w>b.x0);k++) y+=11;
    placed.push({x0,x1:x0+w,y}); labels+='<text x="'+(left?p.x-10:p.x+10).toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="'+(left?'end':'start')+'" class="'+(p.you?'lb you':'lb')+'">'+esc(t)+'</text>'; });
  pts.forEach(p=>{ g+=p.you?'<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="8" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>':'<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="6.5" fill="'+esc(p.c)+'" stroke="var(--surface)" stroke-width="1.5"><title>'+esc(p.n)+'</title></circle>'; });
  return '<div class="box"><h3>Политические координаты'+(withUser?'':' партий')+'</h3><p class="hint">'+(withUser?'Где оказались вы и где стоят партии. Ваша точка считается по тем же чертам, что привязаны к вариантам ответов.':'Где стоят партии до того, как вы начали отвечать. В конце теста на этой же карте появится ваша точка.')+' Положение выводится из идейных черт: по горизонтали — экономика, по вертикали — отношение к власти и свободам.</p>'+
    '<div class="cmp"><svg viewBox="0 0 '+W+' '+W+'" role="img" aria-label="Политические координаты партий">'+g+labels+'</svg></div></div>';
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
// Итог одной темы: места по списку + округа. Вопрос «без мнения» округ не разыгрывает: мандаты уходят в список темы.
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
const vetoed=(a,b,rules=C)=>rules.no.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
function vetoPair(m,rules=C){ for(let i=0;i<m.length;i++) for(let j=i+1;j<m.length;j++) if(vetoed(m[i],m[j],rules)) return [m[i],m[j]]; return null; }
const mkey=m=>m.slice().sort((a,b)=>a-b).join(',');
function coalitionMatches(c,m){
  if(c.mode==='logic') return (c.when||[]).some(condition=>condition.length&&condition.every(f=>m.includes(f)));
  if(c.variants&&c.variants.length) return c.variants.some(v=>v.required.every(f=>m.includes(f))&&m.every(f=>v.required.includes(f)||v.optional.includes(f)));
  return c.m.length&&mkey(c.m)===mkey(m);
}
function coName(m,rules=C){ const c=rules.coal.find(x=>coalitionMatches(x,m)); return c?c.n:''; }
function coalitionAllowed(m,rules){
  return !(rules.span&&m.length&&Math.max(...m)-Math.min(...m)>3)&&!vetoPair(m,rules);
}
function coalitionExists(st,rules,excluded){
  const M=maj(), fs=st.map((v,i)=>i).filter(i=>st[i]>0&&!excluded.includes(i));
  let found=false;
  (function rec(start,cur){
    if(found) return;
    if(cur.length){ if(!coalitionAllowed(cur,rules)) return;
      if(sum(cur.map(i=>st[i]))>=M){ found=true; return; } }
    for(let k=start;k<fs.length&&!found;k++){ cur.push(fs[k]); rec(k+1,cur); cur.pop(); }
  })(0,[]);
  return found;
}
function coalitionMode(st){
  const ranked=st.map((v,i)=>({v,i})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  for(let s=0;s<C.scenarios.length;s++){ const scenario=C.scenarios[s];
    for(const condition of scenario.when){ if(!condition.length) continue;
      const cutoff=ranked[Math.min(condition.length-1,ranked.length-1)];
      if(!cutoff||!condition.every(f=>st[f]>0&&st[f]>=cutoff.v)) continue;
      if(!coalitionExists(st,C,condition)) return {rules:Object.assign({},C,{no:scenario.no}),scenario:s};
    }
  }
  return {rules:C,scenario:-1};
}
// Порядок партий в конструкторе — ось слева направо. Союз невозможен, если в нём есть пара, отказавшаяся работать вместе,
// а при включённом правиле соседей — если он шире трёх шагов по оси. Союзы с названием показываются первыми.
function coalitions(st){
  const mode=coalitionMode(st), rules=mode.rules, M=maj(), fs=st.map((v,i)=>i).filter(i=>st[i]>0), res=[];
  (function rec(start,cur){
    if(cur.length){ const sp=cur[cur.length-1]-cur[0]; if(!coalitionAllowed(cur,rules)) return; const tot=sum(cur.map(i=>st[i]));
      if(tot>=M){ if(cur.every(i=>tot-st[i]<M)) res.push({m:cur.slice(),t:tot,sp}); return; } }
    for(let k=start;k<fs.length;k++){ cur.push(fs[k]); rec(k+1,cur); cur.pop(); }
  })(0,[]);
  res.sort((a,b)=>a.m.length-b.m.length||a.sp-b.sp||b.t-a.t);
  const named=[];
  rules.coal.forEach(rule=>{
    const matches=rule.mode==='logic'||rule.variants&&rule.variants.length?res.filter(c=>coalitionMatches(rule,c.m)):rule.m.length&&rule.m.every(f=>st[f]>0)&&coalitionAllowed(rule.m,rules)&&sum(rule.m.map(f=>st[f]))>=M?[{m:rule.m.slice().sort((a,b)=>a-b),t:sum(rule.m.map(f=>st[f])),sp:rule.m.length?Math.max(...rule.m)-Math.min(...rule.m):0}]:[];
    matches.forEach(c=>named.push(Object.assign({},c,{name:rule.n})));
  });
  named.sort((a,b)=>a.m.length-b.m.length||a.sp-b.sp||b.t-a.t);
  const seen={}, out=[]; named.concat(res.slice(0,4)).forEach(c=>{ const k=mkey(c.m); if(!seen[k]){ seen[k]=1; out.push(c); } });
  const namedCount=new Set(named.map(c=>mkey(c.m))).size, shown=out.slice(0,Math.max(6,namedCount)), counts={};
  shown.forEach(c=>{ c.name=c.name||coName(c.m,rules); if(c.name) counts[c.name]=(counts[c.name]||0)+1; });
  const indices={}; shown.forEach(c=>{ c.displayName=c.name&&counts[c.name]>1?c.name+' ('+((indices[c.name]=(indices[c.name]||0)+1))+')':c.name; });
  return shown;
}

// ══════ Зал: d3-parliament ══════
// groups: [{seats, c, k, f, t}] слева направо; k:'d' — места от округов, рисуются кольцами
function drawParl(el,groups,dim,big,sm,onClick,still){
  if(!window.d3||!d3.parliament){ el.innerHTML='<p class="note">Схема зала не загрузилась: нужен доступ в интернет для библиотеки d3-parliament.</p>'; return; }
  if(!el._p){
    el.innerHTML='<svg viewBox="0 0 600 306" role="img" aria-label="Схема парламента"><text class="big" x="300" y="266" text-anchor="middle"></text><text class="sm" x="300" y="294" text-anchor="middle"></text></svg>';
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
const OPEN={}; let PREV=null, PMSG='', FMSG='', CO_VIEW=-1, VETO_VIEW={};
const inp=(k,v,extra)=>'<input class="in" id="f-'+k.replace(/\./g,'-')+'" data-k="'+k+'" value="'+esc(v)+'" '+(extra||'')+'>';
const tname=id=>(C.traits.find(x=>x.id===id)||{n:id}).n;
const groups=()=>{ const g=[]; C.traits.forEach(x=>{ if(!g.includes(x.g)) g.push(x.g); }); return g; };
const cnt=n=>n+' '+plural(n,'вопрос','вопроса','вопросов');
function coalitionEditor(coal,prefix){
  const base=prefix?prefix+'.':'';
  return '<div class="rows">'+coal.map((c,i)=>{
    const variant=c.variants&&c.variants.length?c.variants[0]:{required:c.m,optional:[]};
    const exact='<div class="coed"><div class="chips">'+C.fams.map((F,f)=>{
      const state=variant.required.includes(f)?'required':variant.optional.includes(f)?'optional':'none';
      return '<button type="button" class="chip coal-member" data-act="coM" data-i="'+i+'" data-v="0" data-j="'+f+'" data-state="'+state+'" aria-pressed="'+(state!=='none')+'"><span>'+esc(F.n)+'</span>'+(state==='none'?'':'<small>'+(state==='required'?'(обязательно)':'(опционально)')+'</small>')+'</button>';
    }).join('')+'</div></div>';
    return '<div class="coed"><div class="f-f" style="grid-template-columns:1fr 30px">'+inp(base+'coal.'+i+'.n',c.n,'aria-label="Название коалиции" maxlength="60"')+'<button type="button" class="x" data-act="delCoal" data-i="'+i+'" aria-label="Удалить коалицию">×</button></div>'+
      '<button type="button" class="chip" data-act="coalMode" data-i="'+i+'">'+(c.mode==='logic'?'Режим: условия И/ИЛИ':'Режим: точный состав')+'</button>'+
      (c.mode==='logic'?'<p class="hint">Партии внутри строки соединены через «И», строки между собой — через «ИЛИ».</p>'+(c.when||[]).map((condition,j)=>'<div class="coed"><div class="go"><b>Строка «И» '+(j+1)+'</b><button type="button" class="x" data-act="delCoWhen" data-i="'+i+'" data-j="'+j+'" aria-label="Удалить условие коалиции">×</button></div><div class="chips">'+C.fams.map((F,f)=>'<button type="button" class="chip" data-act="coWhenM" data-i="'+i+'" data-j="'+j+'" data-f="'+f+'" aria-pressed="'+condition.includes(f)+'">'+esc(F.n)+'</button>').join('')+'</div></div>').join('')+'<button type="button" class="add" data-act="addCoWhen" data-i="'+i+'">+ Добавить условие «или»</button>':
        '<p class="hint">Нажмите на партию, чтобы переключать состояния: обязательная, опциональная, не выбрана. Обязательные партии должны входить в коалицию, опциональные могут входить или отсутствовать.</p>'+exact)+'</div>';
  }).join('')+
    '<button type="button" class="add" data-act="addCoal">+ Добавить название коалиции</button></div>';
}
function scenarioEditor(i){
  const s=C.scenarios[i], path='scenarios.'+i;
  return '<div class="rows">'+
    '<div class="f-f" style="grid-template-columns:1fr 30px">'+inp(path+'.n',s.n,'aria-label="Название сценария" maxlength="60"')+'<button type="button" class="x" data-act="delScenario" data-i="'+i+'" aria-label="Удалить сценарий">×</button></div>'+
    '<p class="hint">Сценарий сработает, если партии из одного условия лидируют и по стандартным запретам нельзя собрать большинство без них. Условия соединяются через «или». После срабатывания показываются все коалиции по новым настройкам; партии из условия не обязаны в них входить. Запреты для этого сценария задаются в карточках партий.</p>'+
    '<span class="lbl">Условия срабатывания</span>'+s.when.map((condition,j)=>'<div class="coed"><div class="go"><b>Условие '+(j+1)+'</b><button type="button" class="x" data-act="delWhen" data-i="'+i+'" data-j="'+j+'" aria-label="Удалить условие">×</button></div><div class="chips">'+C.fams.map((F,f)=>'<button type="button" class="chip" data-act="conditionM" data-i="'+i+'" data-j="'+j+'" data-f="'+f+'" aria-pressed="'+condition.includes(f)+'">'+esc(F.n)+'</button>').join('')+'</div><small class="hint">Выбранные партии должны входить в число лидирующих.</small></div>').join('')+
    '<button type="button" class="add" data-act="addWhen" data-i="'+i+'">+ Добавить условие «или»</button></div>';
}
function viewBuild(){
  toBuild.hidden=true; window.scrollTo(0,0);
  app.innerHTML='<div class="stack" id="build">'+
  '<div class="intro"><h1>Соберите свою Государственную думу</h1><p>Выберите выборы, от 1993 до 2026 года: у каждых свои партии, свои вопросы того времени и свои невозможные союзы. Или настройте всё сами. Отвечающий двигает ползунок между двумя вариантами, а его ответы превращаются в состав Думы и правительство.</p></div>'+
  '<section class="step box"><header><h2>Пресеты</h2><p class="hint">Готовые наборы и ваши сохранённые тесты. Сохранённые пресеты хранятся в этом браузере.</p></header>'+
    '<span class="lbl" style="margin:0">Выборы в Государственную думу</span><div class="presets">'+BUILTIN.map((p,i)=>p.set.year&&!p.h?'<button type="button" class="preset" data-act="pre" data-i="'+i+'" aria-pressed="'+(C.name===p.n)+'"><b>'+esc(p.n)+'</b><span>'+esc(p.d)+'</span></button>':'').join('')+'</div>'+
    '<span class="lbl" style="margin:0">Стандартный тест и мои пресеты</span><div class="presets">'+BUILTIN.map((p,i)=>p.set.year||p.h?'':'<button type="button" class="preset" data-act="pre" data-i="'+i+'" aria-pressed="'+(C.name===p.n)+'"><b>'+esc(p.n)+'</b><span>'+esc(p.d)+'</span></button>').join('')+
      USER.map((p,i)=>'<div class="pwrap"><button type="button" class="preset" data-act="upre" data-i="'+i+'" aria-pressed="'+(C.name===p.n)+'"><b>'+esc(p.n)+'</b><span>Мой пресет · '+mest(p.c.seats)+' · '+p.c.fams.length+' '+plural(p.c.fams.length,'партия','партии','партий')+'</span></button><button type="button" class="x" data-act="delPre" data-i="'+i+'" aria-label="Удалить пресет">×</button></div>').join('')+'</div>'+
    '<div class="psave"><input class="in" id="pname" value="'+esc(C.name)+'" maxlength="60" aria-label="Название пресета" placeholder="Название пресета"><button type="button" class="chip" data-act="savePre">Сохранить текущий тест как пресет</button>'+(PREV?'<button type="button" class="link" data-act="undo">Вернуть тест, который был до загрузки</button>':'')+'<span class="hint" id="pmsg">'+esc(PMSG)+'</span></div></section>'+
  '<p class="hint sec-hint">Ниже — настройки выбранного теста. Разделы свёрнуты: откройте тот, который хотите изменить.</p>'+
  '<details class="step box sec" data-o="s1"'+(OPEN.s1?' open':'')+'><summary><span class="num">1</span><h2>Парламент</h2><span class="sec-t"><span class="t-open">Открыть</span><span class="t-close">Свернуть</span></span></summary><div class="sec-b"><div class="parl">'+
    '<div class="parl-form">'+
      '<div><label class="lbl" for="seats">Количество мест</label><div class="seats"><input type="number" id="seats" min="10" max="1000" value="'+C.seats+'"><input type="range" id="seatsR" min="10" max="1000" value="'+C.seats+'" aria-label="Количество мест"></div><div class="chips" id="presets" style="margin-top:8px"></div></div>'+
      '<div><span class="lbl">Политическая система</span><fieldset class="sys">'+
        [['auto','Выбирает тест','Шесть вступительных вопросов решают, какая система подходит отвечающему.'],['multi','Многопартийная','Места делят все партии.'],['dom','С доминантной партией','Партия, ближайшая к ответам по итогам всего теста, получает большинство; остальное делится по ответам.'],['one','Однопартийная','Все места у партии, самой близкой к ответам.']]
          .map(([v,n,d])=>'<label><input type="radio" name="party" id="party-'+v+'" value="'+v+'"'+(C.party===v?' checked':'')+'><b>'+n+'</b><span>'+d+'</span></label>').join('')+'</fieldset></div>'+
      '<div><span class="lbl">Как делятся места</span><fieldset class="sys">'+
        '<label><input type="radio" name="sys" id="sys-prop" value="prop"'+(C.sys==='prop'?' checked':'')+'><b>По списку</b><span>Пропорционально близости партий к ответам.</span></label>'+
        '<label><input type="radio" name="sys" id="sys-mixed" value="mixed"'+(C.sys==='mixed'?' checked':'')+'><b>Смешанная, как в России</b><span>Часть мест по списку, часть по округам: вопрос — округ.</span></label>'+
        '<div id="dshrow" style="grid-column:1/-1"><label class="lbl" for="dshare" style="margin-top:6px">Доля одномандатных округов: <b id="dshv"></b></label><input type="range" id="dshare" min="0" max="100" step="5" value="'+C.dshare+'" style="width:100%;accent-color:var(--accent)"><p class="hint" id="dshhint" style="margin:4px 0 0">Применится, если по вводным вопросам выйдет смешанная система.</p></div>'+
        '<div id="thrrow" style="grid-column:1/-1"'+(C.year?'':' hidden')+'><label class="chk"><input type="checkbox" id="thron"'+(C.thron?' checked':'')+'> Проходной барьер для партийных списков</label> <input type="number" class="in" id="thr" min="0.5" max="20" step="0.5" value="'+C.thr+'" style="width:86px;display:inline-block;margin-left:8px" aria-label="Проходной барьер, %"> %<p class="hint" style="margin:4px 0 0">Партия, набравшая меньше барьера, не получает мест по списку; выигранные округа остаются за ней. После прохождения теста барьер изменить нельзя.</p></div>'+
        '<div id="lowrow" style="grid-column:1/-1"'+(C.fams.some(F=>F.sm)?'':' hidden')+'><label class="chk"><input type="checkbox" id="lowpri"'+(C.lowpri?' checked':'')+'> Пониженный приоритет малых партий</label><p class="hint" style="margin:4px 0 0">Малые партии получают меньше голосов и округов при той же близости к ответам, так что их результат ближе к настоящему. Сейчас малые: '+esc(C.fams.filter(F=>F.sm).map(F=>F.n).join(', '))+'. Признак малой партии меняется в карточке партии.</p></div>'+
        '<label class="chk" id="ringchk" style="grid-column:1/-1"><input type="checkbox" id="f-rings"'+(RINGS?' checked':'')+'> Показывать места от округов кольцами</label>'+
      '</fieldset></div><div class="note" id="parl-note"></div></div>'+
    '<figure class="parl-fig"><div class="hemi" id="parl-h"></div><div class="parl-leg" id="parl-leg"></div></figure>'+
  '</div></div></details>'+
  '<details class="step box sec" data-o="s2"'+(OPEN.s2?' open':'')+'><summary><span class="num">2</span><h2>Черты идеологий</h2><span class="sec-t"><span class="t-open">Открыть</span><span class="t-close">Свернуть</span></span></summary><div class="sec-b"><p class="hint">Из этих черт собираются партии, и к ним же привязаны варианты ответов. Позиция партии по вопросу выводится из совпадения черт.</p>'+
    '<div class="rows">'+groups().map(g=>'<div class="tg"><span>'+esc(g)+'</span><div class="chips">'+C.traits.filter(x=>x.g===g).map(x=>'<span class="tchip">'+esc(x.n)+(g==='Свои'?'<button type="button" class="rm" data-act="delTrait" data-id="'+esc(x.id)+'" aria-label="Удалить черту">×</button>':'')+'</span>').join('')+'</div></div>').join('')+
    '<div class="psave"><input class="in" id="newTrait" maxlength="40" placeholder="Своя черта, например «Монархизм»" aria-label="Название новой черты"><button type="button" class="chip" data-act="addTrait">+ Добавить черту</button></div></div></div></details>'+
  '<details class="step sec" data-o="s3"'+(OPEN.s3?' open':'')+'><summary><span class="num">3</span><h2>Партии</h2><span class="sec-t"><span class="t-open">Открыть</span><span class="t-close">Свернуть</span></span></summary><div class="sec-b"><p class="hint">Раскройте партию, чтобы задать её черты, логотип и персонажей. Нажатие на черту меняет силу: слабо, умеренно, сильно, снять. Порядок сверху вниз — ось слева направо.</p>'+
    '<div class="rows">'+C.fams.map((F,i)=>'<details class="card" data-o="f'+i+'"'+(OPEN['f'+i]?' open':'')+'><summary><span data-fm="'+i+'">'+mark(F)+'</span><span data-fn="'+i+'">'+esc(F.n)+'</span><small data-ft="'+i+'"></small><span class="fam-order">'+(i>0?'<button type="button" class="fam-move" data-act="moveFam" data-i="'+i+'" data-dir="-1" aria-label="Переместить партию вверх">↑</button>':'')+(i<C.fams.length-1?'<button type="button" class="fam-move" data-act="moveFam" data-i="'+i+'" data-dir="1" aria-label="Переместить партию вниз">↓</button>':'')+'</span></summary><div class="c-body" data-fb="'+i+'">'+(OPEN['f'+i]?famBody(i):'')+'</div></details>').join('')+
    (C.fams.length<12?'<button type="button" class="add" data-act="addFam">+ Добавить партию</button>':'')+
    '<div class="psave" style="display:block"><textarea class="in" id="fam-import" rows="5" spellcheck="false" aria-label="Данные партии в формате JSON" placeholder="Вставьте JSON партии" style="display:block;width:100%;max-width:none;box-sizing:border-box"></textarea><div style="margin-top:8px"><button type="button" class="chip" data-act="importFam"'+(C.fams.length>=12?' disabled':'')+'>Добавить партию из текста</button><span class="hint" id="fam-import-msg" role="status" aria-live="polite" style="margin-left:10px">'+esc(FMSG)+'</span></div></div></div></details>'+
  '<details class="step box sec" data-o="s4"'+(OPEN.s4?' open':'')+'><summary><span class="num">4</span><h2>Коалиции</h2><span class="sec-t"><span class="t-open">Открыть</span><span class="t-close">Свернуть</span></span></summary><div class="sec-b"><p class="hint">Названия союзов показываются в результатах, когда коалиция совпадает по составу. Отказы работать вместе задаются в карточках партий.</p>'+
    '<div class="chips" style="margin-bottom:10px"><button type="button" class="chip" data-act="coalView" data-i="-1" aria-pressed="'+(CO_VIEW<0)+'">Обычные настройки</button>'+C.scenarios.map((s,i)=>'<button type="button" class="chip" data-act="coalView" data-i="'+i+'" data-scenario-tab="'+i+'" aria-pressed="'+(CO_VIEW===i)+'">'+esc(s.n||'Сценарий '+(i+1))+'</button>').join('')+'<button type="button" class="add" data-act="addScenario">+ Добавить сценарий</button></div>'+
    (CO_VIEW<0?'<div class="rows"><div class="note" id="co-veto"></div>'+coalitionEditor(C.coal,'')+
    '<label class="chk"><input type="checkbox" id="f-span" data-k="span"'+(C.span?' checked':'')+'> Объединяться могут только соседи по оси: не дальше трёх шагов друг от друга</label></div>':scenarioEditor(CO_VIEW))+
    '</div></details>'+
  '<details class="step sec" data-o="s5"'+(OPEN.s5?' open':'')+'><summary><span class="num">5</span><h2>Темы и вопросы</h2><span class="sec-t"><span class="t-open">Открыть</span><span class="t-close">Свернуть</span></span></summary><div class="sec-b"><p class="hint">У каждого варианта ответа свои черты: партии с этими чертами тянутся к нему. Точки под вопросом показывают, где в итоге стоят партии.</p>'+
    '<div class="rows">'+C.topics.map((T,t)=>'<details class="card" data-o="t'+t+'"'+(OPEN['t'+t]?' open':'')+'><summary><i class="dot" data-tc="'+t+'" style="background:'+esc(T.c)+'"></i><span data-tn="'+t+'">'+esc(T.n)+'</span><small data-tq="'+t+'"></small></summary><div class="c-body" data-tb="'+t+'">'+(OPEN['t'+t]?topicBody(t):'')+'</div></details>').join('')+
    '<button type="button" class="add" data-act="addTopic">+ Добавить тему</button></div></div></details>'+
  '<details class="io box" data-o="io"'+(OPEN.io?' open':'')+'><summary>Перенести тест на другое устройство</summary><p class="hint">Скопируйте текст ниже и вставьте его в тест на другом устройстве.</p>'+
    '<textarea class="in" id="io" spellcheck="false" aria-label="Тест в виде текста"></textarea><div class="r"><button type="button" class="chip" data-act="exp">Показать текущий тест</button><button type="button" class="chip" data-act="copy">Скопировать</button><button type="button" class="chip" data-act="imp">Загрузить из текста</button><span class="hint" id="io-msg" role="status" aria-live="polite"></span></div></details>'+
  '<div class="launch"><button type="button" class="cta" data-act="run" id="run">Запустить тест</button><span id="run-info"></span></div>'+
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
  v.textContent=C.no.length?'Не работают вместе: '+C.no.map(p=>C.fams[p[0]].n+' и '+C.fams[p[1]].n).join('; ')+'.':'Отказов нет: любые партии могут войти в одну коалицию.';
  C.coal.forEach((c,i)=>{ const el=$('[data-cw="'+i+'"]'); if(!el) return; const vp=vetoPair(c.m); el.textContent=vp?'Этот союз невозможен: «'+C.fams[vp[0]].n+'» и «'+C.fams[vp[1]].n+'» отказались работать вместе.':''; });
}
function vetoList(scope){ return scope>=0&&C.scenarios[scope]?C.scenarios[scope].no:C.no; }
function partyTransfer(i){
  const F=C.fams[i], used=new Set(Object.keys(F.tr||{}));
  return JSON.stringify({type:'duma-party',version:1,traits:C.traits.filter(t=>used.has(t.id)),party:{n:F.n,c:F.c,d:F.d,logo:F.logo,sm:F.sm,capName:F.cap>=0&&C.fams[F.cap]?C.fams[F.cap].n:'',tr:F.tr,ppl:F.ppl}},null,2);
}
function downloadParty(i){
  const name=C.fams[i].n.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/,'')||'party';
  const safeName=/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name)?'_'+name:name;
  const blob=new Blob([partyTransfer(i)],{type:'application/json;charset=utf-8'}), url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url; link.download=safeName+'.json'; document.body.appendChild(link); link.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); link.remove(); },800);
}
function importParty(){
  const fail=message=>{ FMSG=message; const status=$('#fam-import-msg'); if(status) status.textContent=message; };
  if(C.fams.length>=12){ fail('Достигнут лимит в 12 партий.'); return; }
  let raw;
  try{ raw=JSON.parse($('#fam-import').value); }
  catch(err){ fail('Ошибка разбора JSON: '+err.message); return; }
  if(!raw||raw.type!=='duma-party'||raw.version!==1||!raw.party||typeof raw.party!=='object'||Array.isArray(raw.party)){
    fail('Неверный формат данных партии. Загрузите JSON, скачанный кнопкой «Скачать данные партии».'); return;
  }
  const src=raw.party, name=typeof src.n==='string'?src.n.trim():'';
  if(!name||!src.tr||typeof src.tr!=='object'||Array.isArray(src.tr)||!Array.isArray(raw.traits)){
    fail('В данных не хватает названия, черт партии или их описаний.'); return;
  }
  const defs=new Map();
  raw.traits.forEach(t=>{ if(t&&typeof t.id==='string'&&t.id&&typeof t.n==='string') defs.set(t.id,{id:t.id,n:t.n,g:typeof t.g==='string'&&t.g?t.g:'Свои'}); });
  if(Object.keys(src.tr).some(id=>!defs.has(id))){ fail('Не найдены описания некоторых черт партии. Проверьте JSON.'); return; }
  const remap={};
  Object.keys(src.tr).forEach((id,k)=>{
    if(!defs.has(id)) return;
    const trait=defs.get(id), current=C.traits.find(t=>t.id===id);
    if(!current){ C.traits.push(trait); remap[id]=id; }
    else if(current.n===trait.n&&current.g===trait.g) remap[id]=id;
    else { let next; do{ next='p'+Date.now().toString(36)+(k++).toString(36); }while(C.traits.some(t=>t.id===next)); C.traits.push(Object.assign({},trait,{id:next})); remap[id]=next; }
  });
  const tr={}; Object.keys(src.tr).forEach(id=>{ const level=Math.round(+src.tr[id]); if(remap[id]&&level>=1&&level<=3) tr[remap[id]]=level; });
  const cap=typeof src.capName==='string'?C.fams.findIndex(F=>F.n===src.capName):-1;
  const imported={n:name.slice(0,60),c:HEX.test(src.c)?src.c:'#888888',d:typeof src.d==='string'?src.d:'',logo:okImg(src.logo),sm:!!src.sm,cap:cap>=0?cap:-1,tr,
    ppl:(Array.isArray(src.ppl)?src.ppl:[]).filter(p=>p&&typeof p.n==='string').slice(0,12).map(p=>({n:p.n.slice(0,60),s:PORT.some(x=>x[0]===p.s)?p.s:'',img:okImg(p.img)}))};
  C.fams.push(imported); const i=C.fams.length-1; OPEN['f'+i]=true; FMSG=''; rerender();
}
function famBody(i){
  const F=C.fams[i];
  const scope=Number.isInteger(VETO_VIEW[i])?VETO_VIEW[i]:-1, no=vetoList(scope), vetoRules={no};
  return '<div class="f-f"><input type="color" id="f-fams-'+i+'-c" data-k="fams.'+i+'.c" value="'+esc(F.c)+'" aria-label="Цвет">'+inp('fams.'+i+'.n',F.n,'aria-label="Название партии"')+'<span class="fd">'+inp('fams.'+i+'.d',F.d,'aria-label="Описание" placeholder="Короткое описание"')+'</span><button type="button" class="x" data-act="delFam" data-i="'+i+'" aria-label="Удалить партию"'+(C.fams.length<=2?' disabled':'')+'>×</button></div>'+
    '<div class="f-logo">'+(lg(F)?'<img class="logo" src="'+esc(lg(F))+'" alt="Логотип" style="border-color:'+esc(F.c)+'">':'<span class="ph">лого</span>')+'<label for="logo-'+i+'">Логотип</label><input type="file" id="logo-'+i+'" data-logo="'+i+'" accept="image/*"><button type="button" class="chip" data-act="logoUrl" data-i="'+i+'">Указать ссылку</button>'+(F.logo?'<button type="button" class="link" data-act="delLogo" data-i="'+i+'">Убрать логотип</button>':'')+'</div>'+
    '<div class="tg"><span>Размер</span><div><label class="chk"><input type="checkbox" id="sm-'+i+'" data-sm="'+i+'"'+(F.sm?' checked':'')+'> Малая партия: её приоритет понижен, если это включено в настройках парламента</label></div></div>'+
    '<div class="tg"><span>Особое условие</span><div><select class="in" id="f-fams-'+i+'-cap" data-k="fams.'+i+'.cap" data-int="1" aria-label="Особое условие для партии"><option value="-1">Нет: места считаются как у всех</option>'+C.fams.map((G,j)=>j===i?'':'<option value="'+j+'"'+(F.cap===j?' selected':'')+'>Только один одномандатный округ, остальные места — партии «'+esc(G.n)+'»</option>').join('')+'</select></div></div>'+
    '<div class="tg"><span>Персонажи</span><div class="ppl">'+F.ppl.map((p,j)=>'<div class="pp">'+(face(p)?'<img class="ava sm" src="'+esc(face(p))+'" alt="">':'<span class="ava sm ph"></span>')+inp('fams.'+i+'.ppl.'+j+'.n',p.n,'aria-label="Имя персонажа" maxlength="60" placeholder="Имя"')+'<select class="in" id="f-fams-'+i+'-ppl-'+j+'-s" data-k="fams.'+i+'.ppl.'+j+'.s" aria-label="Профильный портфель"><option value="">'+(j?'Без профиля':'Лидер, без профиля')+'</option>'+PORT.filter(x=>x[0]!=='pm').map(x=>'<option value="'+x[0]+'"'+(p.s===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+'</select><label class="chip up" title="Загрузить своё фото">Фото<input type="file" accept="image/*" id="pimg-'+i+'-'+j+'" data-pimg="'+i+','+j+'" hidden></label><button type="button" class="chip" data-act="pimgUrl" data-i="'+i+'" data-j="'+j+'" title="Указать ссылку на фото">Ссылка</button><button type="button" class="x" data-act="delP" data-i="'+i+'" data-j="'+j+'" aria-label="Удалить персонажа">×</button></div>').join('')+
      (F.ppl.length<12?'<button type="button" class="add" data-act="addP" data-i="'+i+'">+ Добавить персонажа</button>':'')+'<small class="hint">Первый в списке — лидер: он станет премьером, если партия возглавит правительство. Профиль подсказывает, какое министерство человеку ближе. Фото подставляется по имени; своё можно загрузить кнопкой «Фото» или указать кнопкой «Ссылка».</small></div></div>'+
    '<div class="tg"><span>Не войдёт в коалицию с</span><div><select class="in" data-veto-scope data-i="'+i+'" aria-label="Сценарий запретов коалиции"><option value="-1"'+(scope<0?' selected':'')+'>Стандартный сценарий</option>'+C.scenarios.map((s,j)=>'<option value="'+j+'" data-veto-option="'+j+'"'+(scope===j?' selected':'')+'>'+esc(s.n||'Сценарий '+(j+1))+'</option>').join('')+'</select><div class="chips" style="margin-top:6px">'+C.fams.map((G,j)=>j===i?'':'<button type="button" class="chip veto" data-act="veto" data-i="'+i+'" data-j="'+j+'" data-scenario="'+scope+'" aria-pressed="'+vetoed(i,j,vetoRules)+'">'+esc(G.n)+'</button>').join('')+'</div></div></div>'+
    groups().map(g=>'<div class="tg"><span>'+esc(g)+'</span><div class="chips">'+C.traits.filter(x=>x.g===g).map(x=>{ const l=F.tr[x.id]||0; return '<button type="button" class="tchip" data-act="tr" data-i="'+i+'" data-id="'+esc(x.id)+'" data-l="'+l+'" aria-pressed="'+(l>0)+'">'+esc(x.n)+'<small>'+SL[l]+'</small></button>'; }).join('')+'</div></div>').join('')+
    '<div class="psave"><button type="button" class="chip" data-act="downloadFam" data-i="'+i+'">Скачать данные партии</button><span class="hint" id="fam-download-msg-'+i+'" role="status" aria-live="polite"></span></div>';
}
function topicBody(t){
  const T=C.topics[t], qs=C.qs.map((q,i)=>({q,i})).filter(x=>x.q.t===t);
  return '<div class="t-f"><input type="color" id="f-topics-'+t+'-c" data-k="topics.'+t+'.c" value="'+esc(T.c)+'" aria-label="Цвет темы">'+inp('topics.'+t+'.n',T.n,'aria-label="Название темы"')+
      '<span class="tp">'+inp('topics.'+t+'.lo',T.lo,'aria-label="Левый полюс" placeholder="Левый полюс оси"')+'</span><span class="tp">'+inp('topics.'+t+'.hi',T.hi,'aria-label="Правый полюс" placeholder="Правый полюс оси"')+'</span>'+
      '<button type="button" class="x" data-act="delTopic" data-i="'+t+'" aria-label="Удалить тему"'+(C.topics.length<=1?' disabled':'')+'>×</button></div>'+
    qs.map(x=>qHtml(x.i)).join('')+'<button type="button" class="add" data-act="addQ" data-i="'+t+'">+ Добавить вопрос</button>';
}
function axSvg(q){
  const w=300, x=v=>12+(v+1)/2*(w-24); let g='<rect x="12" y="8" width="'+(w-24)+'" height="4" rx="2" fill="var(--pend)"/><line x1="'+w/2+'" y1="3" x2="'+w/2+'" y2="17" stroke="var(--ink3)" stroke-width="1"/>';
  C.fams.forEach(F=>{ g+='<circle cx="'+x(pos(q,F)).toFixed(1)+'" cy="10" r="4.5" fill="'+esc(F.c)+'" stroke="var(--surface)" stroke-width="1"><title>'+esc(F.n)+'</title></circle>'; });
  return '<svg viewBox="0 0 '+w+' 20" role="img" aria-label="Позиции партий между A и B">'+g+'</svg>';
}
function sideHtml(i,s){
  const q=C.qs[i], k='qs.'+i, id='f-qs-'+i, sel=q[s], L=s.toUpperCase();
  return '<div class="opt"><label><span>'+L+'</span><textarea class="in" rows="2" id="'+id+'-'+L+'" data-k="'+k+'.'+L+'" placeholder="Вариант '+L+'">'+esc(q[L])+'</textarea></label>'+
    '<div class="trs">'+sel.map(t=>'<span class="tchip" data-l="1">'+esc(tname(t))+'<button type="button" class="rm" data-act="untr" data-i="'+i+'" data-s="'+s+'" data-id="'+esc(t)+'" aria-label="Убрать черту">×</button></span>').join('')+
    '<select class="in tsel" id="'+id+'-add'+s+'" data-addtr="'+s+'" data-i="'+i+'" aria-label="Добавить черту варианту '+L+'"><option value="">+ черта</option>'+groups().map(g=>'<optgroup label="'+esc(g)+'">'+C.traits.filter(x=>x.g===g&&!sel.includes(x.id)).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.n)+'</option>').join('')+'</optgroup>').join('')+'</select></div></div>';
}
function qHtml(i){
  const q=C.qs[i], T=C.topics[q.t], k='qs.'+i, id='f-qs-'+i;
  return '<div class="q'+(q.on?'':' off')+'" data-q="'+i+'"><div class="q-head"><input type="checkbox" id="'+id+'-on" data-k="'+k+'.on"'+(q.on?' checked':'')+' aria-label="Вопрос включён в тест" title="Включён в тест"><input class="in q-t" id="'+id+'-q" data-k="'+k+'.q" value="'+esc(q.q)+'" aria-label="Заголовок вопроса" placeholder="Заголовок вопроса"><button type="button" class="x" data-act="delQ" data-i="'+i+'" aria-label="Удалить вопрос">×</button></div>'+
    '<div class="q-ab">'+sideHtml(i,'a')+sideHtml(i,'b')+'</div>'+
    '<div class="q-ax"><span class="ax" data-ax="'+i+'">'+axSvg(q)+'</span><label>B ведёт к полюсу <select class="in" id="'+id+'-d" data-k="'+k+'.d" data-int="1"><option value="1"'+(q.d===1?' selected':'')+'>'+esc(T.hi||'правому')+'</option><option value="-1"'+(q.d===-1?' selected':'')+'>'+esc(T.lo||'левому')+'</option></select></label></div></div>';
}
function refreshQ(i){ const el=$('.q[data-q="'+i+'"]'); if(el) el.outerHTML=qHtml(i); }
function refreshAxes(){ $$('[data-ax]').forEach(el=>{ const q=C.qs[+el.dataset.ax]; if(q) el.innerHTML=axSvg(q); }); }
function updParl(){
  const auto=C.party==='auto'; R.party=auto?'multi':C.party; R.sys=auto?'prop':C.sys;
  const B=bonus(), L=listTotal(), D=distTotal(), nq=enabled().length, one=R.party==='one';
  $$('input[name="sys"]').forEach(r=>{ r.disabled=auto; }); $('#ringchk').hidden=R.sys!=='mixed'; $('#dshrow').hidden=R.sys!=='mixed'&&!auto; $('#dshhint').hidden=!auto; $('#dshv').textContent=C.dshare+'%';
  drawParl($('#parl-h'),one?[{seats:C.seats,c:'var(--ink)'}]:[{seats:B,c:'var(--ink)'},{seats:L,c:'var(--accent)'},{seats:D,c:'var(--accent2)',k:'d'}],null,C.seats,plural(C.seats,'место','места','мест'));
  $('#parl-leg').innerHTML=one?'<span><i class="dot" style="background:var(--ink)"></i>Победителю <b>'+C.seats+'</b></span>':
    (B?'<span><i class="dot" style="background:var(--ink)"></i>Лидеру сразу <b>'+B+'</b></span>':'')+'<span><i class="dot" style="background:var(--accent)"></i>По списку <b>'+L+'</b></span>'+(D?'<span>'+(RINGS?'<i class="ring"></i>':'<i class="dot" style="background:var(--accent2)"></i>')+'По округам <b>'+D+'</b></span>':'')+'<span>Большинство <b>'+maj()+'</b></span>';
  let note=auto?'Систему и способ деления мест выберут шесть вступительных вопросов. На схеме показан многопартийный вариант по списку.':
    one?'Все '+mest(C.seats)+' получает партия, самая близкая к ответам.':
    (R.party==='dom'?'Партия, которая в конце теста окажется ближе всех к ответам, получает '+mest(B)+', то есть большинство. Остальные '+pool()+' делятся по ответам между всеми партиями, включая её. ':'')+
    (!D?'По списку места делятся методом наибольших остатков.':D===nq?'Ровно один вопрос — одно место: '+nq+' '+plural(nq,'округ','округа','округов')+'.':nq?(D>nq?'Округов '+D+', а вопросов '+nq+': каждый вопрос разыгрывает в среднем '+(D/nq).toFixed(1).replace('.',',')+' мандата, все они достаются победителю вопроса.':'Округов '+D+', а вопросов '+nq+': мандат получат вопросы самых важных для отвечающего тем.'):'Включите хотя бы один вопрос.');
  $('#parl-note').textContent=note;
  const pre=[100,350,450]; if(R.sys==='mixed'&&R.party==='multi'&&nq>=5&&!pre.includes(nq*2)) pre.unshift(nq*2);
  $('#presets').innerHTML=pre.map(n=>'<button type="button" class="chip" data-act="seats" data-i="'+n+'" aria-pressed="'+(C.seats===n)+'">'+n+(n===nq*2&&R.sys==='mixed'?' · вопрос = место':n===450?' · как в Госдуме':'')+'</button>').join('');
}
function updMeta(){
  const nq=enabled().length, nt=C.topics.filter((_,t)=>C.qs.some(q=>q.on&&q.t===t)).length;
  C.topics.forEach((_,t)=>{ const el=$('[data-tq="'+t+'"]'); if(!el) return; const all=C.qs.filter(q=>q.t===t), on=all.filter(q=>q.on).length; el.textContent=on===all.length?cnt(on):on+' из '+all.length+' включено'; });
  C.fams.forEach((F,i)=>{ const el=$('[data-ft="'+i+'"]'), n=Object.keys(F.tr).length; if(el) el.textContent=n+' '+plural(n,'черта','черты','черт')+' · '+F.ppl.length+' '+plural(F.ppl.length,'персонаж','персонажа','персонажей'); });
  $('#run').disabled=!nq;
  $('#run-info').textContent=nq?(C.party==='auto'?'6 вопросов о системе · ':'')+nt+' '+plural(nt,'тема','темы','тем')+' · '+cnt(nq)+' · '+mest(C.seats)+' · '+(C.party==='auto'?'систему выбирает тест':SYSF[C.party].toLowerCase()+', '+(C.sys==='mixed'?'смешанная':'по списку'))+(C.year&&C.thron&&C.thr>0?' · барьер '+thrTxt()+'%':'')+(lowOn()?' · малые партии с пониженным приоритетом':''):'Включите хотя бы один вопрос';
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
  if(ps[0]==='scenarios'&&ps[2]==='n'){ const name=v||'Сценарий '+(+ps[1]+1), tab=$('[data-scenario-tab="'+ps[1]+'"]'); if(tab) tab.textContent=name; $$('[data-veto-option="'+ps[1]+'"]').forEach(option=>option.textContent=name); }
  if(el.type==='checkbox'){ const qe=el.closest('.q'); if(qe){ qe.classList.toggle('off',!v); updParl(); updMeta(); } }
  if(ps[0]==='topics'){ const t=ps[1]; if(ps[2]==='n') $('[data-tn="'+t+'"]').textContent=v; if(ps[2]==='c') $('[data-tc="'+t+'"]').style.background=v; }
  if(ps[0]==='fams'){ const i=ps[1]; if(ps[2]==='n') $('[data-fn="'+i+'"]').textContent=v; if(ps[2]==='c'){ $('[data-fm="'+i+'"]').innerHTML=mark(C.fams[i]); refreshAxes(); } }
}
function rerender(){ const keep=window.scrollY; save(); viewBuild(); window.scrollTo(0,keep); }
function onChange(e){
  const el=e.target;
  if(el.dataset.vetoScope!==undefined){ VETO_VIEW[+el.dataset.i]=+el.value; rerender(); return; }
  if(el.dataset.pimg&&el.files&&el.files[0]){ const [pi,pj]=el.dataset.pimg.split(',').map(Number), file=el.files[0]; if(!/^image\//.test(file.type)) return;
    const rd=new FileReader(); rd.onload=()=>{ const im=new Image(); im.onload=()=>{ const w=120, hh=150, c=document.createElement('canvas'); c.width=w; c.height=hh; const k=Math.max(w/im.width,hh/im.height);
      c.getContext('2d').drawImage(im,(w-im.width*k)/2,(hh-im.height*k)/2,im.width*k,im.height*k); try{ C.fams[pi].ppl[pj].img=c.toDataURL('image/jpeg',.82); }catch(_){ return; } rerender(); }; im.src=rd.result; }; rd.readAsDataURL(file); return; }
  if(el.dataset.addtr&&el.value){ const i=+el.dataset.i; C.qs[i][el.dataset.addtr].push(el.value); save(); refreshQ(i); return; }
  if(el.dataset.logo!==undefined&&el.files&&el.files[0]){ const i=+el.dataset.logo, file=el.files[0]; if(!/^image\//.test(file.type)) return;
    const rd=new FileReader(); rd.onload=()=>{ const im=new Image(); im.onload=()=>{ const s=96, c=document.createElement('canvas'); c.width=c.height=s; const k=Math.min(s/im.width,s/im.height), w=im.width*k, h=im.height*k;
      c.getContext('2d').drawImage(im,(s-w)/2,(s-h)/2,w,h); try{ C.fams[i].logo=c.toDataURL('image/png'); }catch(_){ return; } rerender(); }; im.src=rd.result; }; rd.readAsDataURL(file); }
}
function loadCfg(c,msg){ PREV=JSON.stringify(C); C=c; CO_VIEW=-1; VETO_VIEW={}; PMSG=msg; Object.keys(OPEN).forEach(k=>delete OPEN[k]); save(); viewBuild(); }
function onAct(e){
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act, i=+b.dataset.i, id=b.dataset.id;
  const clearQ=()=>Object.keys(OPEN).forEach(k=>{ if(k[0]==='q') delete OPEN[k]; });
  if(a==='moveFam'){
    e.preventDefault();
    const j=i+Number(b.dataset.dir);
    if(j<0||j>=C.fams.length) return;
    const swapIndex=x=>x===i?j:x===j?i:x, swapList=a=>{ for(let k=0;k<a.length;k++) a[k]=swapIndex(a[k]); }, swapPairs=a=>a.forEach(p=>swapList(p));
    [C.fams[i],C.fams[j]]=[C.fams[j],C.fams[i]];
    C.duo=C.duo.map(swapIndex); C.gate=swapIndex(C.gate);
    C.fams.forEach(F=>{ if(F.cap>=0) F.cap=swapIndex(F.cap); });
    swapPairs(C.no);
    C.coal.forEach(c=>{ swapList(c.m); (c.when||[]).forEach(swapList); (c.variants||[]).forEach(v=>{ swapList(v.required); swapList(v.optional); }); });
    C.scenarios.forEach(s=>{ s.when.forEach(swapList); swapPairs(s.no); });
    [OPEN['f'+i],OPEN['f'+j]]=[OPEN['f'+j],OPEN['f'+i]];
    [VETO_VIEW[i],VETO_VIEW[j]]=[VETO_VIEW[j],VETO_VIEW[i]];
    save(); rerender();
  }
  else if(a==='pre'){ const p=BUILTIN[i]; loadCfg(presetCfg(p),'Загружен пресет «'+p.n+'».'); }
  else if(a==='upre'){ const p=USER[i]; loadCfg(norm(JSON.parse(JSON.stringify(p.c))),'Загружен пресет «'+p.n+'».'); C.name=p.n; save(); }
  else if(a==='delPre'){ if(b.dataset.arm){ USER.splice(i,1); saveUser(); PMSG='Пресет удалён.'; rerender(); } else { b.dataset.arm=1; b.textContent='✓'; b.title='Нажмите ещё раз, чтобы удалить'; $('#pmsg').textContent='Нажмите ещё раз, чтобы удалить пресет.'; } }
  else if(a==='savePre'){ const n=$('#pname').value.trim(); if(!n){ $('#pmsg').textContent='Введите название пресета.'; return; }
    if(BUILTIN.some(p=>p.n===n)){ $('#pmsg').textContent='Это название занято готовым пресетом, выберите другое.'; return; }
    C.name=n; const k=USER.findIndex(p=>p.n===n), rec={n,c:JSON.parse(JSON.stringify(C))}; if(k>=0) USER[k]=rec; else USER.push(rec);
    if(saveUser()) PMSG=(k>=0?'Пресет обновлён: «':'Пресет сохранён: «')+n+'».'; else { if(k<0) USER.pop(); PMSG='Не получилось сохранить: в хранилище браузера не хватает места. Уберите логотипы или удалите старые пресеты.'; } rerender(); }
  else if(a==='undo'){ let c=null; try{ c=norm(JSON.parse(PREV)); }catch(_){} if(c){ PREV=null; C=c; PMSG='Прежний тест возвращён.'; rerender(); } }
  else if(a==='seats'){ setSeats(i); $('#seats').value=$('#seatsR').value=C.seats; }
  else if(a==='addTrait'){ const n=$('#newTrait').value.trim(); if(!n) return; C.traits.push({id:'c'+Date.now().toString(36),n,g:'Свои'}); rerender(); }
  else if(a==='delTrait'){ C.traits=C.traits.filter(x=>x.id!==id); C.fams.forEach(F=>delete F.tr[id]); C.qs.forEach(q=>{ q.a=q.a.filter(x=>x!==id); q.b=q.b.filter(x=>x!==id); }); rerender(); }
  else if(a==='tr'){ const F=C.fams[i], l=((F.tr[id]||0)+1)%4; if(l) F.tr[id]=l; else delete F.tr[id]; b.dataset.l=l; b.setAttribute('aria-pressed',l>0); b.querySelector('small').textContent=SL[l]; save(); updMeta(); refreshAxes(); }
  else if(a==='untr'){ const q=C.qs[i], s=b.dataset.s; q[s]=q[s].filter(x=>x!==id); save(); refreshQ(i); }
  else if(a==='addFam'){ C.fams.push({n:'Новая партия',c:'#8a8f9c',d:'',logo:'',tr:{},ppl:[],cap:-1}); OPEN['f'+(C.fams.length-1)]=true; rerender(); }
  else if(a==='downloadFam'){ try{ downloadParty(i); const status=$('#fam-download-msg-'+i); if(status) status.textContent='Файл партии скачан.'; }catch(err){ if(window.console) console.error('Не удалось скачать данные партии:',err); const status=$('#fam-download-msg-'+i); if(status) status.textContent='Не удалось скачать файл партии.'; } }
  else if(a==='importFam'){ importParty(); }
  else if(a==='delFam'){ C.fams.splice(i,1); C.duo=[-1,-1]; const sh=x=>x>i?x-1:x, remap=m=>m.filter(x=>x!==i).map(sh); C.no=C.no.filter(p=>!p.includes(i)).map(p=>p.map(sh)); C.coal.forEach(c=>{ c.m=remap(c.m); c.when=(c.when||[]).map(remap).filter(m=>m.length); (c.variants||[]).forEach(v=>{ v.required=remap(v.required); v.optional=remap(v.optional); }); }); C.scenarios.forEach(s=>{ s.when.forEach(m=>{ const k=m.indexOf(i); if(k>=0) m.splice(k,1); m.forEach((x,j)=>{ if(x>i) m[j]--; }); }); s.when=s.when.filter(m=>m.length); s.no=s.no.filter(p=>!p.includes(i)).map(p=>p.map(sh)); }); VETO_VIEW={}; C.fams.forEach(F=>{ F.cap=F.cap===i?-1:sh(F.cap); }); Object.keys(OPEN).forEach(k=>{ if(k[0]==='f') delete OPEN[k]; }); rerender(); }
  else if(a==='delLogo'){ C.fams[i].logo=''; rerender(); }
  else if(a==='logoUrl'||a==='pimgUrl'){ const P=a==='pimgUrl'?C.fams[i].ppl[+b.dataset.j]:null, cur=P?P.img:C.fams[i].logo;
    const u=window.prompt('Ссылка на картинку (начинается с https://). Пустая строка убирает картинку.',isUrl(cur)?cur:''); if(u===null) return; const v=u.trim();
    if(v&&!isUrl(v)){ window.alert('Нужна ссылка, которая начинается с http:// или https://'); return; }
    if(P) P.img=v; else C.fams[i].logo=v; rerender(); }
  else if(a==='addP'){ C.fams[i].ppl.push({n:'Новый персонаж',s:'',img:''}); rerender(); }
  else if(a==='delP'){ C.fams[i].ppl.splice(+b.dataset.j,1); rerender(); }
  else if(a==='veto'){ const j=+b.dataset.j, scope=+b.dataset.scenario, no=vetoList(scope), k=no.findIndex(p=>(p[0]===i&&p[1]===j)||(p[0]===j&&p[1]===i)); if(k>=0) no.splice(k,1); else no.push([i,j]); save();
    $$('[data-act="veto"]').forEach(x=>{ const xi=+x.dataset.i, xj=+x.dataset.j; if(+x.dataset.scenario===scope&&((xi===i&&xj===j)||(xi===j&&xj===i))) x.setAttribute('aria-pressed',k<0); }); updCo(); }
  else if(a==='coM'){ const c=C.coal[i], v=+b.dataset.v, f=+b.dataset.j; if(!c.variants.length) c.variants=[{required:c.m.slice(),optional:[]}]; const variant=c.variants[v], state=b.dataset.state, next=state==='none'?'required':state==='required'?'optional':'none'; variant.required=variant.required.filter(x=>x!==f); variant.optional=variant.optional.filter(x=>x!==f); if(next==='required') variant.required.push(f); if(next==='optional') variant.optional.push(f); b.dataset.state=next; b.setAttribute('aria-pressed',next!=='none'); b.innerHTML='<span>'+esc(C.fams[f].n)+'</span>'+(next==='none'?'':'<small>'+(next==='required'?'(обязательно)':'(опционально)')+'</small>'); save(); updCo(); }
  else if(a==='coalMode'){ const c=C.coal[i]; if(c.mode==='logic'){ c.mode='exact'; } else { c.mode='logic'; if(!c.when||!c.when.length) c.when=[c.m.slice()]; } rerender(); }
  else if(a==='coWhenM'){ const condition=C.coal[i].when[+b.dataset.j], f=+b.dataset.f, k=condition.indexOf(f); if(k>=0) condition.splice(k,1); else condition.push(f); b.setAttribute('aria-pressed',k<0); save(); }
  else if(a==='addCoWhen'){ C.coal[i].when.push([]); rerender(); }
  else if(a==='delCoWhen'){ C.coal[i].when.splice(+b.dataset.j,1); if(!C.coal[i].when.length) C.coal[i].when.push([]); rerender(); }
  else if(a==='addCoal'){ C.coal.push({n:'Новая коалиция',m:[],mode:'exact',when:[],variants:[{required:[],optional:[]}]}); rerender(); }
  else if(a==='delCoal'){ C.coal.splice(i,1); rerender(); }
  else if(a==='coalView'){ CO_VIEW=i; rerender(); }
  else if(a==='addScenario'){ C.scenarios.push({n:'Новый сценарий',when:[[]],no:C.no.map(p=>p.slice())}); CO_VIEW=C.scenarios.length-1; rerender(); }
  else if(a==='delScenario'){ C.scenarios.splice(i,1); VETO_VIEW=Object.keys(VETO_VIEW).reduce((out,f)=>{ const s=VETO_VIEW[f]; out[f]=s===i?-1:s>i?s-1:s; return out; },{}); CO_VIEW=-1; rerender(); }
  else if(a==='addWhen'){ C.scenarios[i].when.push([]); rerender(); }
  else if(a==='delWhen'){ C.scenarios[i].when.splice(+b.dataset.j,1); rerender(); }
  else if(a==='conditionM'){ const m=C.scenarios[i].when[+b.dataset.j], f=+b.dataset.f, k=m.indexOf(f); if(k>=0) m.splice(k,1); else m.push(f); b.setAttribute('aria-pressed',k<0); save(); }
  else if(a==='addTopic'){ C.topics.push({n:'Новая тема',s:'',c:'#b7a3e8',lo:'Левый полюс',hi:'Правый полюс'}); OPEN['t'+(C.topics.length-1)]=true; rerender(); }
  else if(a==='delTopic'){ C.topics.splice(i,1); C.qs=C.qs.filter(q=>q.t!==i); C.qs.forEach(q=>{ if(q.t>i) q.t--; }); Object.keys(OPEN).forEach(k=>{ if(k[0]==='t') delete OPEN[k]; }); rerender(); }
  else if(a==='addQ'){ let at=C.qs.length; for(let k=C.qs.length-1;k>=0;k--) if(C.qs[k].t===i){ at=k+1; break; }
    C.qs.splice(at,0,{t:i,d:1,q:'Новый вопрос',A:'',B:'',on:true,a:[],b:[]}); rerender(); }
  else if(a==='delQ'){ C.qs.splice(i,1); clearQ(); rerender(); }
  else if(a==='exp'){ $('#io').value=JSON.stringify(C); $('#io-msg').textContent='Текущий тест показан в поле.'; }
  else if(a==='copy'){ const ta=$('#io'); if(!ta.value) ta.value=JSON.stringify(C); const sel=()=>{ ta.select(); $('#io-msg').textContent='Текст выделен: скопируйте его вручную.'; };
    try{ navigator.clipboard.writeText(ta.value).then(()=>{ $('#io-msg').textContent='Скопировано.'; },sel); }catch(_){ sel(); } }
  else if(a==='imp'){
    const msg=$('#io-msg'); let raw;
    try{ raw=JSON.parse($('#io').value); }
    catch(err){ msg.textContent='Ошибка разбора JSON: '+err.message; return; }
    if(!raw||typeof raw!=='object'||Array.isArray(raw)){ msg.textContent='Ошибка формата: в корне JSON должен быть объект настроек.'; return; }
    const missing=[];
    if(!Array.isArray(raw.topics)||!raw.topics.length) missing.push('topics (непустой массив тем)');
    if(!Array.isArray(raw.fams)||raw.fams.length<2) missing.push('fams (массив минимум из двух партий)');
    if(!Array.isArray(raw.qs)) missing.push('qs (массив вопросов)');
    if(missing.length){ msg.textContent='Не удалось загрузить настройки: отсутствуют или имеют неверный формат '+missing.join(', ')+'.'; return; }
    let c;
    try{ c=norm(raw); }
    catch(err){ if(window.console) console.error('Ошибка обработки JSON конфигурации:',err); msg.textContent='Ошибка обработки конфигурации: '+err.message; return; }
    if(!c){ msg.textContent='Не удалось загрузить настройки: конфигурация не прошла проверку формата.'; return; }
    OPEN.io=true; const io=OPEN.io, imported=JSON.stringify(c); loadCfg(c,'Тест загружен из текста.'); OPEN.io=io; $('#io').value=imported; $('#io-msg').textContent='Тест загружен из текста.'; }
  else if(a==='run'){ S.lv=C.topics.map((_,t)=>C.qs.some(q=>q.on&&q.t===t)?2:0); toBuild.hidden=false;
    if(C.party==='auto'){ S.sa=[]; S.si=0; window.scrollTo(0,0); viewSys(); } else { R.party=C.party; R.sys=C.sys; S.gv=undefined; begin(); } }
}

// ══════ Шкала с ползунком: общий экран вопроса ══════
function valText(v){ if(v===null) return 'Сдвиньте ползунок к варианту, который вам ближе'; const a=Math.abs(v), s=v<0?'A':'B';
  return a<.08?'Ровно посередине':a<.4?'Немного ближе к '+s:a<.8?'Заметно ближе к '+s:'Полностью за '+s; }
function ask(o){
  app.innerHTML='<section class="narrow">'+o.prog+'<div class="meta">'+o.meta+'</div><h2 class="qtitle">'+esc(o.title)+'</h2>'+
    '<div class="poles"><button type="button" class="pole l" data-v="-1" tabindex="-1"><em>A</em><span>'+esc(o.L)+'</span></button><button type="button" class="pole r" data-v="1" tabindex="-1"><em>B</em><span>'+esc(o.R)+'</span></button></div>'+
    '<div class="track" id="track"><div class="rail"></div>'+[-1,-.5,0,.5,1].map(t=>'<div class="tick'+(t===0?' c':'')+'" style="left:'+((t+1)/2*100)+'%"></div>').join('')+
      '<div class="fill"></div><div class="ball" role="slider" tabindex="0" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0"></div></div>'+
    '<div class="val" id="val" aria-hidden="true"></div>'+
    '<div class="nav2"><button type="button" class="cta" id="next">Дальше</button><button type="button" class="link" id="back"'+(o.back?'':' disabled')+'>‹ Назад</button><button type="button" class="link" id="skip">Без мнения ›</button></div>'+
    '<div class="kbd">С клавиатуры: ← → двигают ползунок, Enter — дальше.</div></section>';
  let cur=o.val, drag=false;
  const tr=$('#track'), ball=$('.ball',tr), fill=$('.fill',tr), l=$('.pole.l',app), r=$('.pole.r',app);
  const draw=anim=>{ const v=cur===null?0:cur, x=(v+1)/2*100;
    tr.classList.toggle('anim',!!anim&&!reduce); tr.classList.toggle('set',cur!==null);
    ball.style.left=x+'%'; fill.style.left=Math.min(50,x)+'%'; fill.style.width=Math.abs(x-50)+'%';
    ball.setAttribute('aria-valuenow',Math.round(v*100));
    ball.setAttribute('aria-valuetext',cur===null?'Не сдвинут':valText(cur)+(Math.abs(v)>=.08?': '+(v<0?o.L:o.R):''));
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
// Первый вопрос сценария: допускать ли партию к выборам. Ответ «нет» убирает её из расчёта мест.
function begin(){ if(C.gate>=0&&C.fams[C.gate]) viewGate(); else viewPrio(); }
function viewGate(){ const F=C.fams[C.gate]; window.scrollTo(0,0);
  ask({prog:'',meta:'<b>Первый вопрос</b><span>Допуск к выборам</span>',title:'Должна ли партия «'+F.n+'» быть допущена до выборов?',L:'Да, допустить',R:'Нет, не допускать',val:S.gv==null?null:S.gv,back:null,
    next:x=>{ S.gv=x; viewPrio(); }}); }
function viewSys(){
  const i=S.si, q=SYSQ[i], v=S.sa[i];
  ask({prog:'<div class="prog" aria-hidden="true">'+SYSQ.map((_,k)=>'<i class="'+(k===i?'cur':S.sa[k]===null?'skip':S.sa[k]!==undefined?'done':'')+'"></i>').join('')+'</div>',
    meta:'<b>Сначала выберем систему</b><span>Вопрос '+(i+1)+' из '+SYSQ.length+'</span>',title:q.q,L:q.A,R:q.B,val:v==null?null:v,
    back:i?()=>{ S.si--; viewSys(); }:null,
    next:x=>{ S.sa[i]=x; if(i<SYSQ.length-1){ S.si++; viewSys(); } else viewVerdict(); }});
}
function viewVerdict(){
  const sc=SYSK.map(()=>0); SYSQ.forEach((q,i)=>{ const v=S.sa[i]; if(v==null) return; (v<0?q.a:q.b).forEach((x,k)=>sc[k]+=Math.abs(v)*x); });
  let best=SYSK.length-1; sc.forEach((x,k)=>{ if(x>sc[best]+1e-9) best=k; });
  R.party=SYSK[best]; R.sys=S.sa[5]>0.08?'mixed':'prop';
  const mx=Math.max(1,...sc); window.scrollTo(0,0);
  app.innerHTML='<section class="narrow"><div class="meta"><b>Система выбрана</b></div><h2>'+SYSF[R.party]+'</h2><p class="lead">'+SYSD[R.party]+' '+(R.party==='one'?'':R.sys==='mixed'?'Места делятся по смешанной схеме: часть по списку, часть по округам, потому что вам важнее конкретный депутат.':'Места делятся по партийным спискам.')+'</p>'+
    '<div class="box"><div class="vd">'+SYSK.map((k,j)=>'<div class="'+(j===best?'win':'')+'"><span>'+SYSN[k]+'</span><i><b style="width:'+(sc[j]/mx*100)+'%"></b></i><em>'+sc[j].toFixed(1).replace('.',',')+'</em></div>').join('')+'</div><p class="hint">Очки набираются по тому, как далеко вы сдвинули ползунок в каждом из шести вопросов. При равенстве выигрывает более плюралистичная система.</p></div>'+
    '<div class="go"><button type="button" class="cta" id="go">Дальше: важность тем</button><button type="button" class="link" id="redo">Ответить заново</button></div></section>';
  $('#go').addEventListener('click',viewPrio); $('#redo').addEventListener('click',()=>{ S.sa=[]; S.si=0; viewSys(); });
  $('#go').focus({preventScroll:true});
}

// ══════ 3. Приоритеты ══════
function segHtml(t,lv){ return '<div class="seg" role="radiogroup" aria-label="Важность темы «'+esc(C.topics[t].n)+'»">'+LV.map((L,k)=>'<button type="button" role="radio" data-t="'+t+'" data-l="'+k+'" aria-checked="'+(k===lv)+'" tabindex="'+(k===lv?0:-1)+'">'+L.n+'</button>').join('')+'</div>'; }
function viewPrio(){
  toBuild.hidden=false; window.scrollTo(0,0);
  const ts=C.topics.map((_,t)=>t).filter(t=>C.qs.some(q=>q.on&&q.t===t));
  app.innerHTML='<section class="narrow"><h2>Что для вас важнее?</h2><p class="lead">Отметьте, насколько важна каждая тема. Чем важнее тема, тем больше мест из '+pool()+' решат ваши ответы по ней'+(R.party==='dom'?' (ещё '+bonus()+' сразу получит партия-лидер)':'')+'. Тему с отметкой <b>«Не важно»</b> тест пропустит.</p>'+
    '<div class="rows" id="prs">'+ts.map(t=>'<div class="pr" data-t="'+t+'"><span class="nm"><i class="dot" style="background:'+esc(C.topics[t].c)+'"></i>'+esc(C.topics[t].n)+(C.topics[t].s?'<small>'+esc(C.topics[t].s)+'</small>':'')+'</span><span class="st"><span class="v"></span><small>мест</small></span><span class="sh"></span></div>').join('')+'</div>'+
    '<div class="go"><button type="button" class="cta" id="go">Перейти к вопросам</button><span id="goinfo"></span></div><div style="margin-top:22px">'+compassBox(false)+'</div></section>';
  const upd=()=>{ const qs=enabled(), P=plan(S.lv,qs); let n=0;
    $$('.pr',app).forEach(row=>{ const t=+row.dataset.t; row.lastElementChild.outerHTML=segHtml(t,S.lv[t]); $('.v',row).textContent=chunkTot(t,P,qs); row.classList.toggle('off',!S.lv[t]); if(S.lv[t]) n+=qs.filter(q=>q.t===t).length; });
    const act=S.lv.filter(l=>l>0).length; $('#go').disabled=!act; $('#goinfo').textContent=act?cnt(n)+' в '+act+' '+plural(act,'блоке','блоках','блоках'):'Выберите хотя бы одну тему'; };
  const prs=$('#prs');
  prs.addEventListener('click',e=>{ const b=e.target.closest('button[data-l]'); if(!b) return; S.lv[+b.dataset.t]=+b.dataset.l; upd(); const nb=$('button[data-t="'+b.dataset.t+'"][data-l="'+b.dataset.l+'"]',prs); if(nb) nb.focus({preventScroll:true}); });
  prs.addEventListener('keydown',e=>{ const b=e.target.closest('button[data-l]'); if(!b||!/Arrow(Left|Right)/.test(e.key)) return; e.preventDefault(); const t=+b.dataset.t, l=Math.max(0,Math.min(4,S.lv[t]+(e.key==='ArrowRight'?1:-1))); S.lv[t]=l; upd(); $('button[data-t="'+t+'"][data-l="'+l+'"]',prs).focus(); });
  $('#go').addEventListener('click',startQuiz); upd();
}

// ══════ 4. Вопросы ══════
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function startQuiz(){
  // Блоки идут от менее важных к самым важным, «Будущее» — в самом конце; порядок вопросов и сторона вариантов случайны
  const rnd=C.topics.map(()=>Math.random());
  const ft=C.topics.findIndex(t=>t.n==='Будущее'); // тема «Будущее» всегда идёт последней
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
    meta:'<i class="dot" style="background:'+esc(T.c)+';margin:0"></i><b>'+esc(T.n)+'</b><span class="pill">'+mest(chunkTot(q.t,S.P,S.qs))+' на кону</span>'+(d?'<span class="pill d">округ: '+d+' '+plural(d,'мандат','мандата','мандатов')+'</span>':'')+'<span>Вопрос '+n+' из '+bq.length+'</span>',
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
    '<span class="eyebrow">Блок '+(S.bi+1)+' из '+S.order.length+'</span><h2>«'+esc(T.n)+'» раздаёт <em>'+n+'</em> '+plural(n,'место','места','мест')+'</h2>'+
    '<div class="bcols"><div class="hemi" id="bh"></div><div><div class="sb" id="sb" style="height:'+(nF*44-4)+'px">'+
      C.fams.map((F,i)=>'<div class="sr" data-f="'+i+'" style="--c:'+esc(F.c)+'"><span class="rk"></span><span class="nm"><b>'+(lg(F)?mark(F):'')+esc(F.n)+'</b><span class="bar"><span></span><em></em></span></span><span class="pts"></span><span class="tot"></span></div>').join('')+
    '</div><p class="msg" id="msg" aria-live="polite"></p></div></div>'+
    '<div class="bfoot"><span>Абсолютное большинство: '+M+'</span><span>'+
      (R.party==='one'?'Все места у партии, которая сейчас ближе всего к вашим ответам':R.party==='dom'?'Ещё '+bonus()+' — гарантированное большинство: кому оно достанется, решится в конце теста':!B.k?'В этом блоке нет ответов: места поделены поровну':R.sys==='mixed'?(n-dn)+' по списку и '+dn+' по округам':'По вашим ответам в этой теме')+'</span></div></div>'+
    '<div class="bnav"><span></span><button type="button" class="cta" id="cont">'+(last?(C.year?'Показать мою Думу':'Показать мой парламент'):'Дальше: '+esc(C.topics[S.order[S.bi+1]].n))+'</button></div></section>';
  const rows=$$('.sr',app), bh=$('#bh');
  const rank=(st,tie)=>{ const o=st.map((_,f)=>f).sort((a,b)=>st[b]-st[a]||(tie?tie[a]-tie[b]:0)||a-b), r=[]; o.forEach((f,i)=>r[f]=i); return r; };
  const show=(st,rk,pts)=>{ rows.forEach((r,f)=>{ r.style.top=rk[f]*44+'px'; $('.rk',r).textContent=rk[f]+1; $('.tot',r).textContent=st[f]; $('.bar span',r).style.width=Math.min(100,st[f]/(M/.7)*100)+'%'; r.classList.toggle('maj',st[f]>=M);
      const p=$('.pts',r); if(pts){ p.textContent=add[f]>0?'+'+add[f]:add[f]<0?'−'+(-add[f]):'0'; p.className='pts show'+(add[f]>0?'':add[f]<0?' neg':' zero'); } });
    drawParl(bh,st.map((v,f)=>({seats:v,c:C.fams[f].c})).concat({seats:C.seats-sum(st),c:'var(--pend)'}),null,sum(st),'из '+C.seats+' распределено'); };
  const pr=rank(prev,null); show(prev,pr,false);
  const fin=()=>{ if(!$('#sb')) return; show(now,rank(now,pr),true);
    const L=leader(now), Lp=leader(prev), nm=C.fams[L].n;
    let m=now[L]>=M?nm+': абсолютное большинство':S.bi===0?nm+' выходит вперёд':Lp!==L&&prev[Lp]>0?nm+' перехватывает лидерство':nm+' сохраняет лидерство';
    if(!last) m+=' · осталось '+mest(C.seats-given); $('#msg').textContent=m; };
  if(reduce) fin(); else setTimeout(fin,600);
  $('#cont').addEventListener('click',()=>{ if(last) viewResult(); else { S.bi++; S.i++; window.scrollTo(0,0); viewQuiz(); } });
  $('#cont').focus({preventScroll:true});
}

// ══════ 6. Результат ══════
function viewResult(){
  S.fin=true; S.hl=null; S.pick=[]; window.scrollTo(0,0);
  const mixed=R.sys==='mixed', answered=S.ans.filter(v=>v!=null).length;
  app.innerHTML='<section class="res stack"><div><div class="chips" style="margin-bottom:10px">'+(C.year?'<span class="pill">Выборы '+C.year+' года</span>':'')+(FIC()?'<span class="pill">Вымышленный сценарий</span>':'')+(thrOn()?'<span class="pill">Барьер '+thrTxt()+'%</span>':'')+'<span class="pill">'+SYSF[R.party]+'</span><span class="pill">'+(mixed?'Смешанная: список и округа':'По партийным спискам')+'</span><span class="pill">'+mest(C.seats)+'</span></div><h2 tabindex="-1" style="outline:none">'+(C.year?'Ваша Дума '+C.year+' года':'Ваш парламент')+'</h2><p class="lead" id="lead" style="margin:0"></p></div>'+
    '<div class="box main"><div class="hemi" id="rh"></div><div><div class="chips" id="tiers" style="margin:0 0 8px"></div><div class="chips" id="ringrow" style="margin:0 0 8px"></div><div class="chips" id="domrow" style="margin:0 0 10px" hidden></div>'+(mixed?'<div id="dsres" style="margin:0 0 10px"><label class="lbl" for="dshare2">Доля одномандатных округов: <b id="dshv2">'+C.dshare+'%</b></label><input type="range" id="dshare2" min="0" max="100" step="5" value="'+C.dshare+'" style="width:100%;accent-color:var(--accent)"></div>':'')+'<p class="hint" id="thrline" style="margin:0 0 8px" hidden></p><div class="leg" id="leg"></div><div class="desc" id="desc"></div></div></div>'+
    '<div class="box"><h3>Итоги выборов</h3><p class="hint">Карточка в оформлении Википедии. Её удобно сохранить снимком экрана.</p><div id="wb"></div></div>'+
    '<div id="presbox"></div><div id="mapbox"></div><div id="futbox"></div>'+
    '<div class="box" id="cobox"><h3>Возможные большинства и правительство</h3><p class="hint">Союзы, которые набирают '+maj()+' и больше.'+(C.span?' Объединяться могут только соседи по оси: не дальше трёх шагов друг от друга.':'')+(C.no.length?' Партии, которые отказались работать вместе, в один союз не попадают.':'')+' Выберите союз или соберите свой, чтобы раздать министерские портфели.</p><div class="coal" id="coal"></div><p class="hint" id="cmline" style="margin:12px 0 0"></p><div id="copick"></div></div>'+
    '<div id="billbox"></div>'+
    '<div class="box"><h3>Места по темам</h3><p class="hint">Нажмите на тему, чтобы подсветить её места в зале. Поменяйте важность, и парламент пересчитается.</p><div class="ths" id="ths"></div></div>'+
    compassBox(true)+
    '<div class="box"><h3>Где вы находитесь</h3><p class="hint">Ваша средняя позиция (белый кружок) и позиции партий по каждой теме. Раскройте тему, чтобы увидеть каждый вопрос'+(mixed?' и кому достался его округ':'')+'.</p><div class="fleg">'+C.fams.map(F=>'<span><i class="dot" style="background:'+esc(F.c)+'"></i>'+esc(F.n)+'</span>').join('')+'<span><i class="dot you"></i>Вы</span></div><div class="strips" id="strips"></div></div>'+
    '<div class="acts"><button type="button" class="cta" id="again">Пройти заново</button><button type="button" class="cta ghost" id="edit">Изменить тест</button><button type="button" class="cta ghost" id="shot">Сохранить картинкой</button></div>'+
    '<details class="det box"><summary>Как это считается</summary>'+
      '<p><b>Партии.</b> У каждой партии есть набор идейных черт с силой: слабо, умеренно или сильно. К каждому варианту ответа тоже привязаны черты. Партия стоит на шкале вопроса тем ближе к варианту, чем сильнее её самая выраженная черта из привязанных к нему.</p>'+
      '<p><b>Политическая система.</b> '+SYSD[R.party]+(R.party==='dom'?' Гарантированное большинство — это '+bonus()+' из '+C.seats+'.':'')+'</p>'+
      C.fams.map(F=>F.cap>=0&&C.fams[F.cap]?'<p><b>Особое условие.</b> «'+esc(F.n)+'» при любом раскладе получает ровно один одномандатный округ. Все остальные места, которые ей причитались бы, переходят партии «'+esc(C.fams[F.cap].n)+'».</p>':'').join('')+
      (lowOn()?'<p><b>Малые партии.</b> У партий, отмеченных как малые ('+esc(C.fams.filter(F=>F.sm).map(F=>F.n).join(', '))+'), приоритет понижен: при одинаковой близости к вашему ответу такая партия получает 40% от доли обычной, а округ выигрывает, только если она заметно ближе остальных.</p>':'')+
      (thrOn()?'<p><b>Проходной барьер.</b> Доля голосов партии — это её средняя близость к вашим ответам по всем темам с учётом их важности. Партия с долей ниже '+thrTxt()+'% не участвует в делении мест по списку, но округа выигрывать может.</p>':'')+
      '<p><b>Темы.</b> Важность тем делит места между ними (не важно — 0, мало — 1, средне — 2, важно — 3,5, очень — 5 долей) по методу наибольших остатков.</p>'+
      '<p><b>Места по списку.</b> Каждый вопрос работает как маленькое голосование: ваш ползунок сравнивается с позицией каждой партии, ближайшая получает бо́льшую часть вопроса, близкие — понемногу, далёкие — почти ничего (колокол Гаусса). Места темы делятся по сумме этих долей.</p>'+
      (mixed?'<p><b>Места по округам.</b> Каждый вопрос — округ: все его мандаты забирает партия, чья позиция ближе всего к вашему ответу. Если мандатов столько же, сколько вопросов, выходит ровно один вопрос — одно место. Вопрос «без мнения» округ не разыгрывает, его мандаты переходят в список той же темы.</p>':'')+
      '<p>Если по теме нет ни одного ответа, её места делятся поровну. Отвечено '+answered+' из '+S.qs.length+'.</p></details></section>';
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
  const st=li.map((v,f)=>v+di[f]+bo[f]), L=leader(st), hl=S.hl, mode=coalitionMode(st), rules=mode.rules, solo=st[L]>=M;
  const gr=[]; C.fams.forEach((F,f)=>{ gr.push({seats:bo[f],c:F.c,f,t:-1,k:'b'}); ['l','d'].forEach(k=>bl.forEach((b,t)=>{ if(b) gr.push({seats:k==='l'?b.list[f]:b.dist[f],c:F.c,f,t,k}); })); });
  const hf=hl&&hl[0]==='f'?+hl.slice(1):null, ht=hl&&hl[0]==='t'?+hl.slice(1):null, hk=hl&&hl[0]==='k'?hl[1]:null;
  const dim=hf!==null?o=>o.f!==hf:ht!==null?o=>o.t!==ht:hk?o=>o.k!==hk:null;
  const ch=t=>bl[t]?sum(bl[t].tot):0, KN={l:'по списку',d:'по округам',b:'гарантировано лидеру'}, KS={l:sum(li),d:sum(di),b:sum(bo)};
  drawParl($('#rh'),gr,dim,hf!==null?st[hf]:ht!==null?ch(ht):hk?KS[hk]:C.seats,hf!==null?C.fams[hf].n:ht!==null?C.topics[ht].n:hk?KN[hk]:plural(C.seats,'место','места','мест'),
    d=>{ if(d.party&&d.party.f!==undefined){ const k='f'+d.party.f; S.hl=S.hl===k?null:k; updResult(); } });
  $('#lead').innerHTML='Крупнейшая фракция — <b>'+mark(C.fams[L])+esc(C.fams[L].n)+'</b>: '+mest(st[L])+' из '+C.seats+'. '+(R.party==='one'?'В однопартийной системе ей достаётся весь зал.':solo?'Это абсолютное большинство, союзники не нужны.':'До большинства в '+M+' в одиночку никто не дотягивает, придётся договариваться.')+(gateOut()?' Партия «'+esc(C.fams[C.gate].n)+'» к выборам не допущена: так вы ответили на первый вопрос.':'')+(C.gate>=0&&C.gnote?' '+esc(C.gnote):'');
  { const tl=$('#thrline'), under=C.fams.map((F,f)=>f).filter(f=>X.el[f]&&!X.elL[f]); tl.hidden=!thrOn();
    tl.textContent=thrOn()?'Проходной барьер для списков — '+thrTxt()+'%. '+(under.length?'Не преодолели: '+under.map(f=>C.fams[f].n+' ('+pc(X.vs[f])+')').join(', ')+'.':'Его преодолели все партии.'):''; }
  { const dr=$('#domrow'); dr.hidden=X.dom<0;
    dr.innerHTML=X.dom<0?'':'<span class="lbl" style="margin:0;width:100%">Гарантированное большинство получает</span>'+C.fams.map((F,f)=>X.el[f]?'<button type="button" class="chip" data-dom="'+f+'" aria-pressed="'+(f===X.dom)+'">'+mark(F)+esc(F.n)+'</button>':'').join('');
    $$('[data-dom]',dr).forEach(b=>b.addEventListener('click',()=>{ S.dom=+b.dataset.dom; updResult(); })); }
  const rr=$('#ringrow'); rr.hidden=!sum(di); rr.innerHTML='<button type="button" class="chip" id="ringsw" aria-pressed="'+RINGS+'"><i class="ring" style="border-color:currentColor"></i>Округа кольцами</button>';
  $('#ringsw').addEventListener('click',()=>{ setRings(!RINGS); updResult(); const b=$('#ringsw'); if(b) b.focus({preventScroll:true}); });
  const tr=$('#tiers'), tiers=[['l','<i class="dot" style="background:var(--ink2)"></i>По списку '],['d',(RINGS?'<i class="ring" style="border-color:var(--ink2)"></i>':'<i class="dot" style="background:var(--ink2)"></i>')+'По округам '],['b','<i class="dot" style="background:var(--ink2)"></i>Лидеру сразу ']].filter(x=>KS[x[0]]>0);
  tr.hidden=tiers.length<2;
  tr.innerHTML=tiers.map(x=>'<button type="button" class="chip" data-k="'+x[0]+'" aria-pressed="'+(hk===x[0])+'">'+x[1]+KS[x[0]]+'</button>').join('');
  $$('button',tr).forEach(b=>b.addEventListener('click',()=>{ const k='k'+b.dataset.k; S.hl=S.hl===k?null:k; updResult(); }));
  const parts=f=>[bo[f]?bo[f]+' сразу':'',li[f]+(mixed?' список':''),mixed?di[f]+' округа':''].filter(Boolean);
  const leg=$('#leg');
  leg.innerHTML=C.fams.map((F,f)=>f).sort((a,b)=>st[b]-st[a]).map(f=>'<button type="button" class="row'+(st[f]?'':' zero')+'" data-f="'+f+'" aria-pressed="'+(hf===f)+'">'+mark(C.fams[f])+'<b>'+esc(C.fams[f].n)+'</b><span class="bar"><span style="width:'+(st[f]/Math.max(1,st[L])*100)+'%;background:'+esc(C.fams[f].c)+'"></span></span><span class="n">'+(tiers.length>1&&st[f]?'<small>'+(bo[f]?bo[f]+' + ':'')+li[f]+(mixed?' + '+di[f]:'')+'</small>':'')+st[f]+'</span></button>').join('');
  $$('.row',leg).forEach(b=>b.addEventListener('click',()=>{ const k='f'+b.dataset.f; S.hl=S.hl===k?null:k; updResult(); }));
  const d=$('#desc');
  if(hf!==null){ const F=C.fams[hf], trs=Object.keys(F.tr).sort((a,b)=>F.tr[b]-F.tr[a]).slice(0,6).map(tname); d.innerHTML='<b>'+esc(F.n)+'</b> · '+mest(st[hf])+(tiers.length>1?' ('+parts(hf).join(', ')+')':'')+'. '+esc(F.d)+(trs.length?' <b>Черты:</b> '+esc(trs.join(', ').toLowerCase())+'.':''); }
  else if(ht!==null) d.innerHTML='<b>'+esc(C.topics[ht].n)+'</b> · '+mest(ch(ht))+': '+C.fams.map((F,f)=>f).filter(f=>bl[ht].tot[f]).sort((a,b)=>bl[ht].tot[b]-bl[ht].tot[a]).map(f=>esc(C.fams[f].n)+' '+bl[ht].tot[f]).join(', ')+'.';
  else if(hk) d.textContent=hk==='l'?'Места по списку показаны закрашенными кружками: они делятся пропорционально близости партий к вашим ответам.':hk==='d'?(RINGS?'Места по округам показаны кольцами: каждый вопрос целиком достаётся ближайшей партии.':'Места по округам: каждый вопрос целиком достаётся ближайшей партии.'):'Эти места партия-лидер получает сразу, как гарантированное большинство.';
  else d.textContent='Нажмите на партию или на место в зале, чтобы прочитать о партии и подсветить её места.';
  const co=coalitions(st), bar=m=>'<div class="bar">'+m.map(f=>'<span style="width:'+(st[f]/C.seats*100)+'%;background:'+esc(C.fams[f].c)+'"></span>').join('')+'<em style="left:'+(M/C.seats*100)+'%"></em><em class="cm" style="left:'+(CM()/C.seats*100)+'%"></em></div><button type="button" class="chip" data-co="'+m.join(',')+'" style="margin-top:9px">Собрать правительство</button>';
  $('#cobox').querySelector('h3').textContent=mode.scenario>=0?'Возможные большинства и правительство · '+C.scenarios[mode.scenario].n:'Возможные большинства и правительство';
  $('#coal').innerHTML=solo&&mode.scenario<0?'<div class="co"><div class="t"><span>'+esc(C.fams[L].n)+' в одиночку</span><em>'+st[L]+'</em></div>'+bar([L])+'</div>':
    co.length?co.map(c=>{ const nm=c.displayName, ps=c.m.map(f=>esc(C.fams[f].n)).join(' + '); return '<div class="co"><div class="t"><span>'+(nm?esc(nm)+'<small>'+ps+'</small>':ps)+'</span><em>'+c.t+'</em></div>'+bar(c.m)+'</div>'; }).join(''):'<p class="hint">При таком раскладе ни один допустимый союз не набирает '+M+'.</p>';
  wikibox(st,li,di,bo); try{ worldBoxes(st,scope,co); }catch(e){ if(window.console) console.error(e); }
  try{ const fb=$('#futbox'); if(fb) fb.innerHTML=futureBox(st); }catch(e){ if(window.console) console.error(e); }
  S.st=st; S.pick=S.pick.filter(f=>st[f]>0); const pick=Array.from(new Set(S.pick)), pt=sum(pick.map(f=>st[f])), vp=vetoPair(pick,rules), pn=coName(pick,rules);
  $('#copick').innerHTML='<span class="lbl" style="margin:14px 0 6px">Своя коалиция</span><div class="chips">'+C.fams.map((F,f)=>st[f]?'<button type="button" class="chip" data-pk="'+f+'" aria-pressed="'+pick.includes(f)+'">'+mark(F)+esc(F.n)+' · '+st[f]+'</button>':'').join('')+'</div>'+
    '<div class="go" style="margin-top:10px"><button type="button" class="chip" data-co="'+pick.join(',')+'"'+(pick.length&&coalitionAllowed(pick,rules)?'':' disabled')+'>Собрать правительство</button><span>'+(mode.scenario>=0?'Сценарий «'+esc(C.scenarios[mode.scenario].n)+'»: действуют его правила коалиций. ': '')+(vp?'«'+esc(C.fams[vp[0]].n)+'» и «'+esc(C.fams[vp[1]].n)+'» отказались работать в одной коалиции':pick.length?(pn?'«'+esc(pn)+'»: ':'')+pt+' из '+C.seats+(pt>=M?': большинство есть':': правительство меньшинства, до большинства не хватает '+(M-pt)):'Отметьте партии, которые войдут в правительство')+'</span></div>';
  $('#ths').innerHTML=C.topics.map((T,t)=>{ const na=!S.order.includes(t), b=bl[t];
    return '<div class="tr'+(na?' na':'')+'" data-t="'+t+'"'+(na?'':' role="button" tabindex="0" aria-pressed="'+(ht===t)+'"')+'><span class="nm"><i class="dot" style="background:'+esc(T.c)+'"></i>'+esc(T.n)+(na?' <small style="font-weight:500;color:var(--ink3)">· без ответов</small>':'')+'</span><span class="n">'+ch(t)+'</span>'+
      '<span class="tb">'+(b?C.fams.map((F,f)=>b.tot[f]?'<i style="width:'+(b.tot[f]/Math.max(1,ch(t))*100)+'%;background:'+esc(F.c)+'" title="'+esc(F.n)+': '+b.tot[f]+'"></i>':'').join(''):'')+'</span>'+(na?'':segHtml(t,S.lv[t]))+'</div>'; }).join('');
  const sEl=$('#strips');
  sEl.innerHTML=S.order.map(t=>{ const u=themePos(t); return u===null?'':stripHtml(t,u,P,bl[t],X); }).join('')||'<p class="hint">Вы не высказались ни по одной теме.</p>';
  $$('details[data-t]',sEl).forEach(dt=>dt.addEventListener('toggle',()=>{ S.open[dt.dataset.t]=dt.open; }));
}
function stripHtml(t,val,P,b,X){
  const T=C.topics[t], w=300, x=v=>12+(v+1)/2*(w-24); let g='<rect x="12" y="10" width="'+(w-24)+'" height="6" rx="3" fill="var(--line2)"/>';
  C.fams.forEach((F,f)=>{ g+='<circle cx="'+x(famPos(f,t)).toFixed(1)+'" cy="13" r="5" fill="'+esc(F.c)+'" opacity="'+(X.el[f]?.9:.25)+'"><title>'+esc(F.n)+'</title></circle>'; });
  g+='<circle cx="'+x(val).toFixed(1)+'" cy="13" r="7" fill="var(--surface)" stroke="var(--ink)" stroke-width="2.5"/>';
  const rows=[]; S.qs.forEach((q,i)=>{ if(q.t===t&&S.ans[i]!==undefined) rows.push(qRow(i,P.dist[i],b,X)); });
  return '<div class="strip"><div class="l"><span>'+esc(T.lo)+'</span><b>'+esc(T.n)+'</b><span style="text-align:right">'+esc(T.hi)+'</span></div><svg viewBox="0 0 '+w+' 26" width="100%" aria-hidden="true">'+g+'</svg>'+
    '<details class="qd" data-t="'+t+'"'+(S.open[t]?' open':'')+'><summary>Вопрос за вопросом ('+rows.length+')</summary>'+rows.join('')+'</details></div>';
}
function qRow(i,d,b,X){
  const q=S.qs[i], v=S.ans[i], p=S.pp[i], w=300, x=z=>12+(z+1)/2*(w-24), best=v===null?null:(b&&b.wins[i]!==undefined?b.wins[i]:nearest(i,v,X.el));
  let g='<rect x="12" y="8" width="'+(w-24)+'" height="4" rx="2" fill="var(--pend)"/><line x1="'+w/2+'" y1="4" x2="'+w/2+'" y2="16" stroke="var(--ink3)" stroke-width="1"/>';
  C.fams.forEach((F,f)=>{ if(f!==best) g+='<circle cx="'+x(p[f]).toFixed(1)+'" cy="10" r="3.5" fill="'+esc(F.c)+'" opacity="'+(best===null?.85:.4)+'"><title>'+esc(F.n)+'</title></circle>'; });
  if(best!==null) g+='<circle cx="'+x(p[best]).toFixed(1)+'" cy="10" r="6" fill="'+esc(C.fams[best].c)+'" stroke="var(--surface)" stroke-width="2"/><circle cx="'+x(v).toFixed(1)+'" cy="10" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>';
  const tag=v===null?'<span class="near off">Без мнения'+(d?' · '+d+' в список':'')+'</span>':'<span class="near" style="--c:'+esc(C.fams[best].c)+'"><small>'+(d?'Округ · '+d:'Ближе всего')+'</small><i class="dot"></i>'+esc(C.fams[best].n)+'</span>';
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
  const st=S.st, M=maj(), mode=coalitionMode(st), rules=mode.rules; m=m.filter(f=>st[f]>0).sort((a,b)=>st[b]-st[a]||a-b); if(!m.length||!coalitionAllowed(m,rules)) return; const listed=coalitions(st).find(c=>mkey(c.m)===mkey(m)), cn=listed?listed.displayName:coName(m,rules);
  const auto=draft(m,st), asg=Object.assign({},auto.asg), amin=staff(auto.asg,auto.ord), min=Object.assign({},amin), tot=sum(m.map(f=>st[f])), n=PORT.length;
  const anyP=m.some(f=>C.fams[f].ppl.length);
  window.scrollTo(0,0);
  app.innerHTML='<section class="res stack"><div><div class="chips" style="margin-bottom:10px">'+(cn?'<span class="pill">'+esc(cn)+'</span>':'')+'<span class="pill">'+(tot>=M?'Правительство большинства':'Правительство меньшинства')+'</span><span class="pill">'+tot+' из '+C.seats+' мест</span></div>'+
    '<h2 tabindex="-1" style="outline:none">Правительство</h2><p class="lead" style="margin:0;max-width:70ch">'+(m.length>1?'Коалиция: ':'Однопартийный кабинет: ')+m.map(f=>'<b>'+esc(C.fams[f].n)+'</b>').join(', ')+'. Портфели розданы по очереди: чем больше у партии мест, тем раньше и чаще она выбирает, и берёт министерство, которое ближе её чертам. '+(anyP?'Министров партии выдвигают из своих персонажей. ':'У этих партий пока нет персонажей: добавьте их в настройках теста, в карточках партий. ')+'Портфель можно передать другой партии, а министра заменить.</p></div>'+
    '<div class="box main"><div class="hemi" id="ch"></div><div class="leg" id="cleg"></div></div>'+
    '<div class="box"><h3>Кабинет министров</h3><p class="hint">Номер слева показывает, каким по счёту портфель был выбран.</p><div id="crows"></div></div>'+
    '<div class="acts"><button type="button" class="cta" id="cback">← К результатам</button><button type="button" class="cta ghost" id="creset">Раздать заново по правилу</button></div>'+
    '<details class="det box"><summary>Как раздаются портфели</summary><p><b>Очередь.</b> Метод д’Ондта: число мест партии делится на число уже взятых ею портфелей плюс один, и выбирает партия с наибольшим частным. Так доля портфелей получается близкой к доле мест в коалиции.</p>'+
      '<p><b>Выбор.</b> Первым ходом крупнейшая партия забирает пост премьер-министра. Дальше партия берёт портфель, связанный с её самой сильной чертой; при равном интересе выбирается более весомый пост.</p>'+
      '<p><b>Министры.</b> Премьером становится первый персонаж в списке партии, то есть её лидер. Остальные портфели сначала получают персонажи с подходящим профилем, потом остальные по порядку. Один человек занимает один пост; если людей не хватило, пост остаётся вакантным.</p></details></section>';
  const pick=(id)=>{ const f=asg[id], busy={}; PORT.forEach(p=>{ if(p[0]!==id&&asg[p[0]]===f&&min[p[0]]>=0) busy[min[p[0]]]=1; }); const P=C.fams[f].ppl; let k=P.findIndex((p,j)=>p.s===id&&!busy[j]); if(k<0) k=P.findIndex((p,j)=>!busy[j]); return k; };
  const fill=()=>{
    $('#cleg').innerHTML=m.map(f=>{ const c=PORT.filter(p=>asg[p[0]]===f).length, F=C.fams[f]; return '<div class="row" style="cursor:default">'+mark(F)+'<b>'+esc(F.n)+'</b><span class="bar"><span style="width:'+(c/n*100)+'%;background:'+esc(F.c)+'"></span></span><span class="n"><small>'+Math.round(st[f]/tot*100)+'% мест коалиции</small>'+c+' из '+n+'</span></div>'; }).join('');
    $('#crows').innerHTML=PORT.slice().sort((a,b)=>auto.ord[a[0]]-auto.ord[b[0]]).map(p=>{ const id=p[0], f=asg[id], was=auto.asg[id], P=C.fams[f].ppl, held={};
      PORT.forEach(x=>{ if(x[0]!==id&&asg[x[0]]===f&&min[x[0]]>=0) held[min[x[0]]]=x[1]; });
      return '<div class="cab-row" style="--c:'+esc(C.fams[f].c)+'"><span class="rk">'+auto.ord[id]+'</span><span class="nm">'+(min[id]>=0&&face(P[min[id]])?'<img class="ava" src="'+esc(face(P[min[id]]))+'" alt="">':'')+'<b>'+p[1]+'</b>'+(min[id]>=0&&P[min[id]]?'<small class="who">'+esc(P[min[id]].n)+'</small>':'<small>Пост вакантен</small>')+(f!==was?'<small>Передано вручную; по правилу — '+esc(C.fams[was].n)+'</small>':'')+'</span>'+
        '<select class="in" id="port-'+id+'" data-port="'+id+'" aria-label="Какой партии достаётся портфель: '+p[1]+'"'+(m.length<2?' disabled':'')+'>'+m.map(x=>'<option value="'+x+'"'+(x===f?' selected':'')+'>'+esc(C.fams[x].n)+'</option>').join('')+'</select>'+
        '<select class="in" id="min-'+id+'" data-min="'+id+'" aria-label="Кто занимает пост: '+p[1]+'"'+(P.length?'':' disabled')+'><option value="-1">'+(P.length?'— вакансия —':'нет персонажей')+'</option>'+P.map((x,j)=>'<option value="'+j+'"'+(j===min[id]?' selected':'')+(held[j]?' disabled':'')+'>'+esc(x.n)+(held[j]?' · уже '+held[j].toLowerCase():'')+'</option>').join('')+'</select></div>'; }).join(''); };
  fill();
  $('#crows').addEventListener('change',e=>{ const t=e.target, id=t.dataset.port||t.dataset.min; if(!id) return;
    if(t.dataset.port){ asg[id]=+t.value; min[id]=-1; min[id]=pick(id); } else min[id]=+t.value;
    fill(); const s=$('#'+t.id); if(s) s.focus({preventScroll:true}); });
  $('#creset').addEventListener('click',()=>{ Object.assign(asg,auto.asg); Object.assign(min,amin); fill(); });
  $('#cback').addEventListener('click',viewResult);
  drawParl($('#ch'),C.fams.map((F,f)=>({seats:st[f],c:F.c,f})),o=>!m.includes(o.f),tot,plural(tot,'место','места','мест')+' у правительства');
  $('.res h2').focus({preventScroll:true});
}
// Викибокс: карточка итогов в оформлении Википедии
function wikibox(st,li,di,bo){
  const el=$('#wb'); if(!el) return; const N=C.seats, M=maj(), mixed=R.sys==='mixed';
  const order=st.map((v,f)=>f).filter(f=>st[f]>0).sort((a,b)=>st[b]-st[a]||a-b), top=order.slice(0,6), rest=order.slice(6);
  const years=BUILTIN.filter(p=>p.set.year&&!p.h).map(p=>p.set.year), yi=years.indexOf(C.year);
  const real=F=>{ const x=/По списку — ([\d,]+)%/.exec(F.d); return x?x[1]+'%':''; }, anyReal=C.year&&top.some(f=>real(C.fams[f]));
  const ini=s=>s.split(/[\s—-]+/).filter(Boolean).map(w=>w[0]).join('').slice(0,3).toUpperCase(), pct=v=>(v/N*100).toFixed(1).replace('.',',')+'%';
  let rows='';
  for(let k=0;k<top.length;k+=3){ const g=top.slice(k,k+3), pad='<td></td>'.repeat(3-g.length), row=(th,fn)=>'<tr><th scope="row">'+th+'</th>'+g.map(f=>'<td>'+fn(f,C.fams[f])+'</td>').join('')+pad+'</tr>';
    rows+=row('',(f,F)=>{ const ph=face(F.ppl[0]); return '<div class="wb-ph'+(ph?' pic':'')+'" style="background:'+esc(F.c)+'">'+(ph?'<img src="'+esc(ph)+'" alt="">':lg(F)?'<img src="'+esc(lg(F))+'" alt="">':'<span>'+esc(ini(F.n))+'</span>')+'</div>'; })+
      row('Лидер',(f,F)=>F.ppl.length?esc(F.ppl[0].n):'—')+
      row('Партия',(f,F)=>'<span class="wb-pn"><i style="background:'+esc(F.c)+'"></i>'+esc(F.n)+'</span>')+
      row('Мест получено',f=>'<b>'+st[f]+'</b>')+
      row('Доля мест',f=>pct(st[f]))+
      (mixed?row('Список / округа',f=>li[f]+' / '+di[f]):'')+
      (bo.some(x=>x)?row('Гарантировано',f=>bo[f]||'—'):'')+
      (anyReal?row('На выборах '+C.year+' года, по списку',(f,F)=>real(F)||'—'):'')+
      '<tr><td colspan="4" class="wb-hr"></td></tr>'; }
  el.innerHTML='<table class="wb"><tbody><tr><th colspan="4" class="wb-title">'+(C.year?'Выборы в Государственную думу ('+C.year+')':'Парламентские выборы')+'<div>по ответам на тест</div></th></tr>'+
    (yi>=0?'<tr><td colspan="4"><div class="wb-nav"><span>'+(yi>0?'← '+years[yi-1]:'')+'</span><b>'+C.year+'</b><span>'+(yi<years.length-1?years[yi+1]+' →':'')+'</span></div></td></tr>':'')+
    '<tr><td colspan="4" class="wb-sub">Все '+N+' '+plural(N,'место','места','мест')+' '+(C.year?'в Государственной думе':'в парламенте')+'<br>Для большинства необходимо '+M+' '+plural(M,'место','места','мест')+'<br>Конституционное большинство — '+CM()+(thrOn()?'<br>Проходной барьер — '+thrTxt()+'%':'')+'</td></tr>'+rows+
    '<tr><td colspan="4"><div class="hemi" id="wbh"></div><div class="wb-cap">Распределение мест по итогам теста</div></td></tr>'+
    (rest.length?'<tr><th scope="row">Остальные</th><td colspan="3" class="wb-left">'+rest.map(f=>esc(C.fams[f].n)+' — '+st[f]).join(', ')+'</td></tr>':'')+
    '<tr><th scope="row">Система</th><td colspan="3" class="wb-left">'+SYSF[R.party]+'; '+(mixed?'смешанная: список и округа':'партийные списки')+'</td></tr></tbody></table>';
  drawParl($('#wbh'),C.fams.map((F,f)=>({seats:st[f],c:F.c})),null,'','',null,true);
}

// ══════ 8. Мир вокруг Думы: конституционное большинство, регионы, президент, законопроекты ══════
const CM=()=>Math.ceil(C.seats*2/3); // конституционное большинство: две трети мест
// Данные из world.js могут не загрузиться (например, в кеше осталась старая страница): тогда эти блоки просто не показываются
const WORLD=typeof BILLS!=='undefined'&&typeof PRES!=='undefined'&&typeof REG!=='undefined'&&typeof REG_T!=='undefined';
const sv=(tr,ids)=>ids.reduce((s,id)=>Math.max(s,SV[tr[id]||0]),0);
const pc=v=>(v*100).toFixed(1).replace('.',',')+'%';
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
  return '<div class="box"><h3>Карта России: как проголосовали регионы</h3><p class="hint">Цвет показывает победителя по спискам в регионе. Результат региона получается из ваших ответов и из того, что важно именно ему: красный пояс, национальные республики, столицы и Дальний Восток голосуют по-разному. Нажмите на регион или выберите его в списке.'+(C.year>=2026?' Для выборов '+C.year+' года на карте показаны также Крым, Севастополь и четыре региона, включённые в состав России в 2022 году.':C.year>=2016?' Для выборов '+C.year+' года на карте показаны также Крым и Севастополь, где тогда проходило голосование.':'')+'</p>'+
    '<div class="mapgrid"><div><div class="rumap"><svg viewBox="0 0 '+M.w+' '+M.h+'" role="img" aria-label="Карта России с победителями по регионам">'+g+'</svg></div>'+
      '<div class="fleg" style="justify-content:center;margin:8px 0 0">'+order.map(f=>'<span><i class="dot" style="background:'+esc(C.fams[f].c)+'"></i>'+esc(C.fams[f].n)+' — '+wins[f]+'</span>').join('')+'</div></div>'+
    '<div><label class="lbl" for="regsel">Регион</label><select class="in" id="regsel">'+ids.slice().sort((a,b)=>REG[a][0].localeCompare(REG[b][0],'ru')).map(id=>'<option value="'+id+'"'+(id===S.reg?' selected':'')+'>'+esc(REG[id][0])+'</option>').join('')+'</select><div id="reginfo">'+regInfo(S.reg)+'</div></div></div></div>';
}
function regInfo(id){
  const r=S.regRes&&S.regRes[id]; if(!r) return '';
  const o=r.p.map((v,f)=>f).filter(f=>r.p[f]>.004).sort((a,b)=>r.p[b]-r.p[a]).slice(0,6);
  return '<div class="leg" style="margin-top:10px">'+o.map(f=>'<div class="row" style="cursor:default">'+mark(C.fams[f])+'<b>'+esc(C.fams[f].n)+'</b><span class="bar"><span style="width:'+(r.p[f]/r.p[o[0]]*100)+'%;background:'+esc(C.fams[f].c)+'"></span></span><span class="n"><small>по стране '+pc(S.natShare[f])+'</small>'+pc(r.p[f])+'</span></div>').join('')+'</div>'+
    r.types.map(t=>'<p class="hint" style="margin-top:8px"><b>'+REG_T[t][0]+'.</b> '+REG_T[t][1]+'</p>').join('');
}
function showReg(){ const mb=$('#mapbox'); if(!mb) return; $$('.rg',mb).forEach(p=>p.classList.toggle('sel',p.dataset.r===S.reg)); const s=$('#regsel'); if(s) s.value=S.reg; const i=$('#reginfo'); if(i) i.innerHTML=regInfo(S.reg); }

// ── Президентские выборы: те же правила близости, но среди кандидатов; при необходимости второй тур
function presResult(){
  const P=WORLD&&PRES[SK()]; if(!P||!S.qs.length) return null;
  const grey=['#6b7280','#9a6b3f','#7b5ea7','#3f8f8a']; let gi=0;
  const cands=P.c.map(c=>{ const f=c[1]?C.fams.findIndex(F=>F.n===c[1]):-1; return {n:c[0],f,tr:c[2]||(f>=0?C.fams[f].tr:{}),c:f>=0?C.fams[f].c:grey[gi++%4],pn:f>=0?C.fams[f].n:'Самовыдвижение'}; });
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
      row('Кандидат',(j,c)=>(j===r.win?'<b>'+esc(c.n)+'</b>':esc(c.n)))+
      row('Партия',(j,c)=>'<span class="wb-pn"><i style="background:'+esc(c.c)+'"></i>'+esc(c.pn)+'</span>')+
      row('Первый тур',j=>pc(r.p1[j]))+
      (r.second?row('Второй тур',j=>j===r.second.a?'<b>'+pc(r.second.pa)+'</b>':j===r.second.b?'<b>'+pc(r.second.pb)+'</b>':'—'):'')+
      '<tr><td colspan="4" class="wb-hr"></td></tr>'; }
  const W=r.cands[r.win];
  return '<div class="box"><h3>Президентские выборы '+r.y+' года</h3><p class="hint">'+(FIC()?'Досрочные выборы президента сразу после думских: сценарий вымышленный, политики настоящие,':'Следующие после этой Думы выборы президента. Кандидаты настоящие,')+' а голоса считаются по вашим ответам, так же как у партий. Если никто не набрал больше половины, назначается второй тур, и голоса выбывших уходят к более близкому финалисту.</p>'+
    '<table class="wb"><tbody><tr><th colspan="4" class="wb-title">Президентские выборы в России ('+r.y+')<div>по ответам на тест</div></th></tr>'+rows+
    '<tr><th scope="row">Итог</th><td colspan="3" class="wb-left"><b>'+esc(W.n)+'</b> побеждает '+(r.second?'во втором туре':'в первом туре')+'</td></tr>'+
    '<tr><th scope="row">На самом деле</th><td colspan="3" class="wb-left">'+esc(r.real)+'</td></tr></tbody></table></div>';
}

// ══════ «Ваша Прекрасная Россия Будущего»: концовка по взглядам отвечающего и составу Думы ══════
function futEra(){ return typeof FUT_ERA!=='undefined'&&C.year&&!FIC()?FUT_ERA.find(e=>C.year>=e.from&&C.year<=e.to):null; }
// Как ответил бы сторонник концовки на вопрос: +1 — вариант Б, −1 — вариант А, 0 — ему всё равно
function futIdeal(e,q){ const sc=ids=>ids.reduce((s,id)=>s+(e.w[id]||0),0), dv=sc(q.b)-sc(q.a); return dv>0?1:dv<0?-1:0; }
// Близость к концовке — косинус между вашими ответами и ответами её сторонника (вопросы темы «Будущее» весят вдвое);
// к ней прибавляется небольшая поправка за долю мест у партий, на которые концовка опирается.
function futRank(st){ const era=futEra(); if(!era||typeof FUT==='undefined'||!S.qs.length||S.ans.every(v=>v==null)) return null;
  const ft=C.topics.findIndex(t=>t.n==='Будущее'), N=sum(st)||1, kq=S.qs.map(q=>q.t===ft?2:1); let un=0; S.qs.forEach((q,i)=>{ const v=S.ans[i]; if(v!=null) un+=kq[i]*v*v; });
  const list=FUT[era.k].filter(e=>(!e.from||C.year>=e.from)&&(!e.to||C.year<=e.to)).map(e=>{ let x=0,y=0,ue=0; // ue — сила ваших ответов на вопросы, важные для концовки: безразличие концовки к остальным штрафуется вполовину
    S.qs.forEach((q,i)=>{ const id=futIdeal(e,q); if(!id) return; y+=kq[i]; const v=S.ans[i]; if(v!=null){ x+=kq[i]*v*id; ue+=kq[i]*v*v; } });
    return {e,sc:(ue&&y?x/Math.sqrt((.5*un+.5*ue)*y):0)+.2*sum(C.fams.map((F,f)=>e.fam.includes(F.n)?st[f]/N:0))}; }).sort((x,y)=>y.sc-x.sc);
  const dbg=/[?&]fut=([0-9]+)/.exec(location.search), pick=dbg&&FUT[era.k][+dbg[1]]; // ?fut=N в адресе показывает концовку с номером N — для проверки оформления
  if(pick){ const i=list.findIndex(x=>x.e===pick); if(i>=0) list.unshift(list.splice(i,1)[0]); }
  return {era,list}; }
function flagSvg(f){ const tot=sum(f.s.map(x=>Array.isArray(x)?x[1]:1)); let y=0;
  let h='<svg class="fut-flag" viewBox="0 0 90 60" role="img" aria-label="Флаг">'+f.s.map(x=>{ const c=Array.isArray(x)?x[0]:x, hh=60*(Array.isArray(x)?x[1]:1)/tot, r='<rect x="0" y="'+y+'" width="90" height="'+(hh+.4)+'" fill="'+c+'"/>'; y+=hh; return r; }).join('');
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
  return '<svg class="fut-map" viewBox="'+(b[0]-8)+' '+(b[1]-8)+' '+(b[2]-b[0]+16)+' '+(b[3]-b[1]+16)+'" role="img" aria-label="Границы">'+
    inc.map(k=>'<use href="#fc-'+k+'" fill="'+col+'"'+(solid[k]?'':' fill-opacity=".7"')+'/>').join('')+
    ids.map(id=>'<use href="#fr-'+id+'" '+(on(id)?'fill="'+(sp[id]||col)+'"':'class="off"')+'/>').join('')+'</svg>'; }
function futCard(e,st,when){ const col=e.party[1], ph=PH[e.lead]||'', lgo=LG[e.party[0]]||'';
  const mono=e.party[0].replace(/[«»“”"]/g,'').split(/[\s—–-]+/).filter(Boolean).map(x=>x[0].toUpperCase()).join('').slice(0,3);
  const row=(k,v)=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>';
  return '<div class="fut-card" style="--fc:'+esc(col)+'"><div class="fut-head">'+flagSvg(e.flag)+'<div><small>'+esc(when)+'</small><b>'+esc(e.n)+'</b></div></div>'+
    '<div class="fut-body"><div class="fut-info"><div class="fut-lead"><div class="wb-ph'+(ph?' pic':'')+'" style="background:'+esc(col)+'">'+(ph?'<img src="'+esc(ph)+'" alt="">':'<span>'+esc(e.lead.split(' ').map(x=>x[0]).join(''))+'</span>')+'</div><div><small>Лидер</small><b>'+esc(e.lead)+'</b></div></div>'+
    '<dl>'+row('Идеология',esc(e.ideo))+row('Форма правления',esc(e.form))+row('Правящая партия',(lgo?'<img class="logo" src="'+esc(lgo)+'" alt="" style="border-color:'+esc(col)+'">':'<span class="fut-mono" style="background:'+esc(col)+'">'+esc(mono)+'</span>')+esc(e.party[0]))+'</dl></div>'+
    '<div class="fut-vis"><figure>'+futMapSvg(e.map,col)+'<figcaption>Границы</figcaption></figure></div></div></div>'; }
function futureBox(st){ const r=futRank(st); if(!r) return '';
  return '<div class="box fut"><h3>Ваша Прекрасная Россия Будущего</h3><p class="hint">'+esc(r.era.intro)+' Концовка подобрана по ответам во всех темах (тема «Будущее» весит вдвое больше) и по составу вашей Думы. Сценарий вымышленный, политики настоящие.</p>'+
    futCard(r.list[0].e,st,r.era.when)+
    '<p class="hint" style="margin-top:10px">Могло быть и так: '+r.list.slice(1,4).map(x=>esc(x.e.lead)+' — '+esc(x.e.n)+' ('+esc(x.e.ideo)+')').join('; ')+'.</p>'+
    '</div>'; }

// ── Законопроекты: фракция голосует «за», если её черты ближе к закону, чем к возражениям
function billVote(b,st){ const yes=[], no=[], abs=[]; C.fams.forEach((F,f)=>{ if(!st[f]) return; const p=sv(F.tr,b[2])-sv(F.tr,b[3]); (p>=.2?yes:p<=-.2?no:abs).push(f); }); const cnt=a=>sum(a.map(f=>st[f])); return {yes,no,abs,y:cnt(yes),n:cnt(no),a:cnt(abs)}; }
function billsBox(st){
  const B=WORLD&&BILLS[SK()]; if(!B) return ''; const N=C.seats, ut=userTr(), um=ids=>ids.reduce((s,id)=>Math.max(s,ut[id]||0),0); let passed=0;
  const items=B.map(b=>{ const v=billVote(b,st), need=b[4]==='const'?CM():maj(), ok=v.y>=need, up=um(b[2])-um(b[3]); if(ok) passed++;
    const who=(a,t)=>a.length?'<span class="bv"><b>'+t+':</b> '+a.map(f=>'<i class="dot" style="background:'+esc(C.fams[f].c)+'"></i>'+esc(C.fams[f].n)).join(', ')+'</span>':'';
    return '<div class="bill"><div class="h"><b>'+esc(b[0])+'</b><span class="pill '+(ok?'ok':'bad')+'">'+(ok?'Принят':'Отклонён')+'</span></div><p class="hint">'+esc(b[1])+(b[4]==='const'?' Нужно конституционное большинство: '+need+'.':'')+'</p>'+
      '<div class="vbar"><span class="y" style="width:'+(v.y/N*100)+'%"></span><span class="a" style="width:'+(v.a/N*100)+'%"></span><span class="n" style="width:'+(v.n/N*100)+'%"></span><em style="left:'+(need/N*100)+'%"></em></div>'+
      '<div class="vnum"><span>За <b>'+v.y+'</b></span><span>Воздержались <b>'+v.a+'</b></span><span>Против <b>'+v.n+'</b></span><span>Нужно <b>'+need+'</b></span></div>'+
      '<div class="bvs">'+who(v.yes,'За')+who(v.abs,'Воздержались')+who(v.no,'Против')+'</div>'+
      '<p class="hint"><b>Вы:</b> '+(up>=.15?'проголосовали бы за':up<=-.15?'проголосовали бы против':'скорее воздержались бы')+'. <b>На самом деле:</b> '+esc(b[5])+'</p></div>'; }).join('');
  return '<div class="box"><h3>Законопроекты этого созыва</h3><p class="hint">'+(FIC()?'Вымышленная повестка: вопросы, которые пришлось бы решать такой Думе.':'Реальные инициативы, которые рассматривала Дума, избранная в '+C.year+' году.')+' Фракции голосуют по своим чертам: обычному закону нужно '+maj()+' голосов, конституционному — '+CM()+'. В вашей Думе принято '+passed+' из '+B.length+'.</p>'+items+'</div>';
}

// Заполняет блоки результата, которые есть только в думских сценариях
function worldBoxes(st,scope,co){
  const pb=$('#presbox'), mb=$('#mapbox'), bb=$('#billbox'), cl=$('#cmline'), cm=CM(), rules=coalitionMode(st).rules;
  if(cl){ const solo=st.map((v,f)=>f).filter(f=>st[f]>=cm), cs=co.filter(c=>c.t>=cm);
    cl.textContent='Конституционное большинство — '+cm+' '+plural(cm,'место','места','мест'), cl.textContent+=solo.length?': «'+C.fams[solo[0]].n+'» набирает его в одиночку и может менять Конституцию без союзников.':cs.length?'. Его дают союзы: '+cs.map(c=>coName(c.m,rules)||c.m.map(f=>C.fams[f].n).join(' + ')).join('; ')+'.':'. Ни один из показанных союзов его не набирает: менять Конституцию придётся по договорённости с оппозицией.'; }
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
  g.fillStyle=tok('--ink'); font(800,56,D); g.fillText(fit(C.year?'Ваша Дума '+C.year+' года':'Ваш парламент',W-164),82,196);
  g.fillStyle=tok('--ink2'); font(500,25,B); g.fillText(fit(SYSF[R.party]+' · '+(mixed?'смешанная: список и округа':'партийные списки')+' · '+mest(C.seats),W-164),82,238);
  // зал: те же места, что на экране
  const seats=$$('#rh .seat'), k=(W-220)/600, ox=110, oy=270, rs={}; seats.forEach(el=>{ const d=d3.select(el).datum(); if(d&&d.polar) rs[d.polar.r.toFixed(2)]=1; });
  const rw=180/Math.max(1,Object.keys(rs).length), r=rw*.4*k;
  seats.forEach(el=>{ const d=d3.select(el).datum(); if(!d||!d.cartesian) return; const cs=getComputedStyle(el), x=ox+(300+d.cartesian.x)*k, y=oy+(300+d.cartesian.y)*k, ring=cs.stroke&&cs.stroke!=='none';
    g.beginPath(); g.arc(x,y,ring?r*.92:r,0,Math.PI*2); if(ring){ g.fillStyle=tok('--surface'); g.fill(); g.lineWidth=rw*.14*k; g.strokeStyle=cs.stroke; g.stroke(); } else { g.fillStyle=cs.fill||tok('--pend'); g.fill(); } });
  g.textAlign='center'; g.fillStyle=tok('--ink'); font(800,68,D); g.fillText(String(C.seats),W/2,oy+300*k-44);
  g.fillStyle=tok('--ink2'); font(500,26,B); g.fillText(plural(C.seats,'место','места','мест'),W/2,oy+300*k-8);
  // партии в две колонки
  const colW=(W-164-40)/2; g.textAlign='left';
  order.forEach((f,i)=>{ const F=C.fams[f], x=82+(i%2)*(colW+40), y=legY+Math.floor(i/2)*rowH;
    g.fillStyle=F.c; g.beginPath(); g.arc(x+13,y-9,13,0,Math.PI*2); g.fill();
    font(800,28,D); const num=String(st[f]), nw=g.measureText(num).width; font(500,21,B); const pct=(st[f]/C.seats*100).toFixed(1).replace('.',',')+'%', pw=g.measureText(pct).width;
    g.fillStyle=tok('--ink'); font(600,26,B); g.fillText(fit(F.n,colW-44-nw-pw-30),x+38,y);
    g.textAlign='right'; g.fillStyle=tok('--ink2'); font(500,21,B); g.fillText(pct,x+colW,y); g.fillStyle=tok('--ink'); font(800,28,D); g.fillText(num,x+colW-pw-14,y); g.textAlign='left'; });
  // итоговые строки
  let y=legY+Math.ceil(order.length/2)*rowH+34; g.fillStyle=tok('--line2'); g.fillRect(82,y-44,W-164,2);
  const line=t=>{ g.fillStyle=tok('--ink'); font(500,25,B); g.fillText(fit(t,W-164),82,y); y+=40; };
  line('Крупнейшая фракция — '+C.fams[L].n+': '+mest(st[L])+' из '+C.seats);
  line('Большинство — '+M+' · конституционное большинство — '+CM());
  if(S.pres) line('Президент ('+S.pres.y+'): '+S.pres.cands[S.pres.win].n);
  g.fillStyle=tok('--ink3'); font(500,21,B); g.fillText('по ответам на тест · bolshoiprikol2.github.io/Duma-Simulator',82,y+8);
  const name='duma-simulator'+(C.year?'-'+C.year:'')+'.png';
  cv.toBlob(b=>{ if(!b) return; const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },800); },'image/png');
}
const cr=$('#credits'); if(cr){ const ALL=Object.assign({},PHS); Object.keys(LGS).forEach(n=>{ ALL['Логотип партии «'+n+'»']=LGS[n]; }); const ks=Object.keys(ALL).sort(); if(!ks.length) cr.hidden=true;
  cr.addEventListener('toggle',()=>{ const box=$('div',cr); if(!cr.open||box.innerHTML) return;
    box.innerHTML=ks.map(n=>{ const s=ALL[n]; return '<p>'+esc(n)+': <a href="https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(s[0].replace(/ /g,'_'))+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>'+(s[1]?', автор: '+esc(s[1]):'')+(s[2]?', лицензия: '+esc(s[2]):'')+'</p>'; }).join(''); }); }
toBuild.addEventListener('click',viewBuild);
viewBuild();
})();
