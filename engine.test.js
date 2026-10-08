import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,eventInfo,decide,advance,construct,setFocus,setEdict,seasonOf,yearOf,capacity,dailyEstimate,validateSave,BUILDINGS,EVENT_COUNT} from '../engine.js';

function clearEvent(s){if(!s.currentEvent)return;const e=eventInfo(s);const safe=e.choices.find(c=>c.affordable);assert.ok(safe,`Sin decisión posible en ${e.id} día ${s.day}`);assert.equal(decide(s,safe.id).ok,true);}
test('Inicio: aldea vulnerable, evento y cinco recursos',()=>{const s=newGame(123);assert.equal(s.population,18);assert.equal(s.stats.security,20);assert.equal(s.resources.wood,105);assert.equal(eventInfo(s).id,'wolves');assert.equal(Object.keys(s.resources).length,5);assert.ok(EVENT_COUNT>=20);});
test('Las elecciones requieren recursos y generan consecuencias encadenadas',()=>{const s=newGame(3);assert.equal(decide(s,'invalid').ok,false);assert.equal(decide(s,'hunt').ok,true);assert.equal(s.flags.wolvesResolved,'hunted');assert.ok(s.queued.some(q=>q.id==='wolf_retaliation'));assert.equal(s.notables.find(p=>p.id==='toman').trust,64);});
test('No se avanza ni construye antes de decidir',()=>{const s=newGame(10);assert.equal(advance(s,1).ok,false);assert.equal(construct(s,'farm').ok,false);assert.equal(s.day,1);clearEvent(s);assert.equal(construct(s,'farm').ok,true);assert.equal(s.actions,1);assert.equal(s.buildings.farm,2);});
test('Costes, órdenes y límites de construcción',()=>{const s=newGame(55);clearEvent(s);assert.equal(construct(s,'palisade').ok,false);const original=s.resources.wood;assert.equal(construct(s,'lumber').ok,true);assert.equal(s.resources.wood,original-BUILDINGS.lumber.cost.wood);assert.equal(setFocus(s,'trade').ok,true);assert.equal(setEdict(s,'sparse').ok,false);});
test('Estaciones: comienzo del invierno, años y proyecciones',()=>{assert.equal(seasonOf(1),'Primavera');assert.equal(seasonOf(19),'Verano');assert.equal(seasonOf(37),'Otoño');assert.equal(seasonOf(55),'Invierno');assert.equal(seasonOf(73),'Primavera');assert.equal(yearOf(73),2);const s=newGame(5);s.day=12;const warm=dailyEstimate(s);s.day=56;const cold=dailyEstimate(s);assert.ok(warm.food>cold.food);});
test('Se detiene ante eventos pendientes',()=>{const s=newGame(24);clearEvent(s);const result=advance(s,7);assert.equal(result.ok,true);assert.ok(result.progressed>=1&&result.progressed<=7);if(result.interrupted)assert.ok(eventInfo(s));});
test('Guardado, importación y versiones incompatibles',()=>{const s=newGame(87);const copy=validateSave(JSON.parse(JSON.stringify(s)));assert.deepEqual(copy,s);copy.resources.food=0;assert.notEqual(s.resources.food,copy.resources.food);assert.throws(()=>validateSave({...s,version:1}));assert.throws(()=>validateSave({...s,resources:{...s.resources,food:-8}}));});
test('La población debe caber en las casas para evitar penalización',()=>{const s=newGame(42);assert.equal(capacity(s),18);s.buildings.houses++;assert.equal(capacity(s),24);});
test('Simulación larga: sin NaN, recursos negativos ni estados colgados',()=>{
  const s=newGame(12345);let count=0;
  while(s.alive&&s.day<150&&count++<1100){
    if(s.currentEvent){const options=eventInfo(s).choices.filter(c=>c.affordable);assert.ok(options.length,`Día ${s.day}, evento ${s.currentEvent}, sin opción asequible`);const preference=['hold','treat','early','humb le','ward','fence','repair','humble','aided','evacuate','listen','seal','plot','accept','hunt'];const pick=options.find(c=>preference.includes(c.id))||options.at(-1);assert.equal(decide(s,pick.id).ok,true);continue;}
    if(s.actions>0){if(s.buildings.farm<3&&construct(s,'farm').ok)continue;if(s.buildings.lumber<2&&construct(s,'lumber').ok)continue;if(s.focus!=='trade'&&s.resources.food>70&&setFocus(s,'trade').ok)continue;if(s.focus!=='harvest'&&s.resources.food<45&&setFocus(s,'harvest').ok)continue;if(s.buildings.houses*6<s.population+2&&construct(s,'houses').ok)continue;}
    advance(s,7);
    for(const value of Object.values(s.resources))assert.ok(Number.isFinite(value)&&value>=0);
    for(const value of Object.values(s.stats))assert.ok(Number.isFinite(value)&&value>=0&&value<=100);
    assert.ok(s.day<300);
  }
  assert.ok(count<1100,'El simulador se ha quedado bloqueado.');
  assert.ok(s.journal.length>5);
});
