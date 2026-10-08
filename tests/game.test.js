'use strict';
const assert=require('assert');
const E=require('../engine.js');
const C=require('../content.js');
let passed=0;function test(name,fn){try{fn();console.log('✓',name);passed++;}catch(e){console.error('✗',name);throw e;}}
const fixed=v=>()=>v;

test('la v0.2 supera 100 eventos, 300 decisiones y tiene 15 proyectos',()=>{const x=E.contentStats();assert(x.events>=100);assert(x.choices>=300);assert.equal(x.projects,15);assert(x.chains>=10);});
test('todos los IDs de evento son únicos y las referencias existen',()=>{const ids=C.EVENTS.map(e=>e.id), set=new Set(ids);assert.equal(ids.length,set.size);for(const e of C.EVENTS){for(const ch of e.choices){for(const n of ch.next||[])assert(set.has(n.id),`${e.id}->${n.id}`);for(const fx of ch.effects||[])if(fx.type==='queue'||fx.type==='open')assert(set.has(fx.id));}for(const n of e.deadline?.next||[])assert(set.has(n.id));}});
test('partida nueva: tres crisis y dos decisiones',()=>{const s=E.createBaseState(1);assert.deepStrictEqual(s.active,['wounded','crops','forest']);assert.equal(s.actionsLeft,2);assert.equal(s.pop,22);});
test('una decisión aplica efectos, agenda continuación y consume acción',()=>{let s=E.createBaseState(1);const o=E.resolveChoice(s,'wounded','heal');assert(o.ok);s=o.state;assert.equal(s.actionsLeft,1);assert.equal(s.food,68);assert.equal(s.medicine,4);assert(s.queue.some(q=>q.id==='stranger_wakes'));});
test('no hay tercera decisión del Consejo en el mismo día',()=>{let s=E.createBaseState(1);s=E.resolveChoice(s,'wounded','heal').state;s=E.resolveChoice(s,'forest','scout').state;const x=E.resolveChoice(s,'crops','burn');assert(!x.ok);assert.equal(x.error,'NO_ACTIONS');});
test('un asunto ignorado cumple su plazo y deja consecuencias',()=>{let s=E.createBaseState(1);s.active=['wounded'];s.eventMeta={wounded:{openedDay:1,lastHandledDay:0,nightsOpen:0}};s=E.advanceDay(s,fixed(.99)).state;assert(s.active.includes('wounded'));s=E.advanceDay(s,fixed(.99)).state;assert(!s.active.includes('wounded'));assert.equal(s.flags.halricDied,true);});
test('las opciones con recursos insuficientes quedan bloqueadas',()=>{let s=E.createBaseState(1);s.active=['merchant'];s.eventMeta={merchant:{openedDay:1,lastHandledDay:0,nightsOpen:0}};s.coin=0;const v=E.getEventView(s,'merchant');assert.equal(v.choices.find(x=>x.id==='grain').available,false);const o=E.resolveChoice(s,'merchant','grain');assert.equal(o.error,'REQUIREMENTS');});
test('los proyectos consumen recursos/acción y terminan con el paso del tiempo',()=>{let s=E.createBaseState(1);const o=E.startProject(s,'well');assert(o.ok);s=o.state;assert.equal(s.actionsLeft,1);assert.equal(s.wood,70);assert(s.projects.some(p=>p.id==='well'));for(let i=0;i<4;i++)s=E.advanceDay(s,fixed(.99)).state;assert(s.buildings.well);});
test('el calendario tiene cuatro estaciones y años de 120 días',()=>{assert.deepStrictEqual(E.calendarForDay(1),{year:1,season:'Primavera',seasonDay:1});assert.deepStrictEqual(E.calendarForDay(31),{year:1,season:'Verano',seasonDay:1});assert.deepStrictEqual(E.calendarForDay(91),{year:1,season:'Invierno',seasonDay:1});assert.deepStrictEqual(E.calendarForDay(121),{year:2,season:'Primavera',seasonDay:1});});
test('un save v0.1/v0.1.1 migra al modelo nuevo',()=>{const old={saveVersion:2,day:17,pop:26,food:40,wood:60,coin:8,morale:52,safety:31,active:['crops'],resolved:['wounded'],people:[['Edda','Curandera','Leal']],history:['vieja']};const s=E.normalizeState(old);assert.equal(s.saveVersion,3);assert.equal(s.day,17);assert.equal(s.pop,26);assert(s.eventMeta.crops);assert.equal(s.people[0].name,'Edda');});
test('stats y relaciones quedan dentro de límites válidos',()=>{const s=E.normalizeState({saveVersion:3,morale:999,safety:-10,factions:{ravens:{attitude:-999}}});assert.equal(s.morale,100);assert.equal(s.safety,0);assert.equal(s.factions.ravens.attitude,-100);});
test('todo el contenido es alcanzable desde raíces, pools o cadenas',()=>{const ids=new Set(C.EVENTS.map(e=>e.id));const roots=new Set(['wounded','crops','forest','first_anniversary',...C.EVENTS.filter(e=>e.pool).map(e=>e.id)]);const adj={};for(const e of C.EVENTS){adj[e.id]=[];for(const ch of e.choices){for(const n of ch.next||[])adj[e.id].push(n.id);for(const fx of ch.effects||[])if(fx.type==='queue'||fx.type==='open')adj[e.id].push(fx.id);}for(const n of e.deadline?.next||[])adj[e.id].push(n.id);}const seen=new Set(roots),q=[...roots];while(q.length){for(const y of adj[q.shift()]||[])if(!seen.has(y)){seen.add(y);q.push(y)}}assert.deepStrictEqual([...ids].filter(x=>!seen.has(x)),[]);});

function sim(seed,days){let s=E.createBaseState(seed),seen=new Set(s.active);let x=seed>>>0;const rng=()=>{x=(Math.imul(1103515245,x)+12345)>>>0;return x/4294967296;};for(let d=0;d<days;d++){
  let guard=0;while(s.actionsLeft>0&&s.active.length&&guard++<5){const active=s.active.filter(id=>{const v=E.getEventView(s,id);return !v.handledToday&&v.choices.some(c=>c.available)});if(!active.length)break;const id=active[Math.floor(rng()*active.length)];const v=E.getEventView(s,id);const opts=v.choices.filter(c=>c.available);const ch=opts[Math.floor(rng()*opts.length)];const o=E.resolveChoice(s,id,ch.id);if(o.ok)s=o.state;else break;}
  if(s.actionsLeft>0&&rng()<.18){const ps=Object.values(E.PROJECTS).filter(p=>{const v=E.projectView(s,p.id);return v.available&&v.affordable&&!v.built&&!v.active});if(ps.length){const o=E.startProject(s,ps[Math.floor(rng()*ps.length)].id);if(o.ok)s=o.state;}}
  s=E.advanceDay(s,rng).state;s.active.forEach(id=>seen.add(id));
  for(const k of ['pop','food','wood','coin','medicine','tools','morale','safety'])assert(Number.isFinite(s[k]),`${k} NaN`);
  assert(s.food>=0&&s.wood>=0&&s.coin>=0&&s.medicine>=0&&s.tools>=0);assert(s.morale>=0&&s.morale<=100&&s.safety>=0&&s.safety<=100);
 }return{s,seen};}

test('20 campañas simuladas de 180 días no rompen el motor',()=>{for(let i=1;i<=20;i++)sim(i*991,180);});
test('campañas con semillas/decisiones distintas descubren contenido diferente',()=>{const a=sim(1234,120),b=sim(98765,120);const onlyA=[...a.seen].filter(x=>!b.seen.has(x)),onlyB=[...b.seen].filter(x=>!a.seen.has(x));assert(onlyA.length+onlyB.length>=8,`solo ${onlyA.length+onlyB.length} diferencias`);assert(a.seen.size>=20);assert(b.seen.size>=20);});

test('save corrupto no bloquea el juego',()=>{const r=E.importState('{nope');assert(!r.ok);assert.equal(r.state.day,1);});
console.log(`\n${passed} tests OK`);
