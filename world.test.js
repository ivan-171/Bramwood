import test from 'node:test';
import assert from 'node:assert/strict';
import {GRID,TILE_H,TILE_W,point,weatherForDay,installations,villageDescriptors,BUILDING_SLOTS,SEASON_COLORS} from '../world.js';
import {newGame,decide,construct,advance,seasonOf} from '../engine.js';

test('El mundo isométrico tiene 14x14 casillas y proyección regular',()=>{
  assert.equal(GRID,14);assert.deepEqual(point(0,0),{x:0,y:0});
  assert.deepEqual(point(1,0),{x:TILE_W/2,y:TILE_H/2});
  assert.deepEqual(point(0,1),{x:-TILE_W/2,y:TILE_H/2});
});
test('Cuatro estaciones disponen de una paleta independiente',()=>{
  for(const s of ['Primavera','Verano','Otoño','Invierno'])assert.equal(SEASON_COLORS[s].grass.length,4);
});
test('El clima es estable por día y varía con las estaciones',()=>{
  for(const day of [1,19,37,55,73,120]){
    assert.deepEqual(weatherForDay(day),weatherForDay(day));
    assert.equal(weatherForDay(day).season,seasonOf(day));
    assert.ok(['Despejado','Nublado','Lluvia','Nevada','Viento'].includes(weatherForDay(day).type));
  }
  for(let d=1;d<200;d++)if(weatherForDay(d).type==='Nevada')assert.equal(seasonOf(d),'Invierno');
});
test('Edificios visualizados corresponden a construcciones reales',()=>{
  const s=newGame(5);const actual=installations(s);
  assert.equal(actual.length,5);
  assert.equal(actual.filter(b=>b.id==='houses').length,3);
  assert.equal(actual.filter(b=>b.id==='farm').length,1);
  assert.equal(actual.filter(b=>b.id==='lumber').length,1);
  assert.ok(actual.every(b=>b.x<GRID&&b.y<GRID));
  assert.ok(Object.entries(BUILDING_SLOTS).every(([id,slots])=>slots.every(([x,y])=>x>=0&&y>=0&&x<GRID&&y<GRID)));
});
test('Un edificio nuevo aparece sin cambiar la simulación',()=>{
  const s=newGame(12),before=JSON.stringify(s);
  villageDescriptors(s);installations(s);weatherForDay(s.day);
  assert.equal(JSON.stringify(s),before,'El render no puede modificar el estado');
  decide(s,'fence');let a=installations(s).filter(b=>b.id==='farm').length;
  assert.equal(construct(s,'farm').ok,true);let b=installations(s).filter(b=>b.id==='farm').length;
  assert.equal(b,a+1);
});
test('Mapa refleja historia de deforestación y estación tardía',()=>{
  const s=newGame(20);s.flags.forestResolved='cut';s.day=55;
  const data=villageDescriptors(s);
  assert.equal(data.trees,'talados');assert.equal(data.season,'Invierno');assert.deepEqual(data.weather,weatherForDay(55));
});
