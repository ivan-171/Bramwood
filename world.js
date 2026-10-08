// Bramwood v0.5 — The Living World. Procedural canvas artwork, zero external assets.
// World visuals never mutate the underlying narrative simulation.
import {seasonOf, BUILDINGS} from './engine.js';
export const GRID=14, TILE_W=86, TILE_H=43;
const H= (x,y,seed=31) => {let n=Math.imul(x+117,374761393)+Math.imul(y+249,668265263)+Math.imul(seed+91,1442695041);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
const mix=(a,b,t)=>a+(b-a)*t;
const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
export const point=(x,y)=>({x:(x-y)*TILE_W/2,y:(x+y)*TILE_H/2});
export const SEASON_COLORS={
  Primavera:{grass:['#567b50','#668558','#5b8253','#6e8a5d'],grassEdge:'#365944',tree:['#3e7955','#4d9568','#75a66c'],roof:'#a34f3d',light:'#d1e6aa',field:'#8a7950'},
  Verano:{grass:['#57854b','#699254','#618e4c','#779b58'],grassEdge:'#406139',tree:['#2d7550','#448d57','#75a95d'],roof:'#ae5941',light:'#f6e9ae',field:'#d4a963'},
  Otoño:{grass:['#777f4b','#8e8b54','#888653','#a19a5c'],grassEdge:'#605c39',tree:['#a66e3f','#ce9c4d','#8f7246'],roof:'#9d503d',light:'#f8d69b',field:'#9c8754'},
  Invierno:{grass:['#b9c5bd','#c5d0c7','#b6c3b7','#d3d9cd'],grassEdge:'#798d89',tree:['#587267','#758e7e','#c1ccc1'],roof:'#6c5a54',light:'#e9f0e7',field:'#c6c4b2'}
};
const SLOTS={
  houses:[[6,6],[5,7],[7,5],[8,6],[6,9],[8,9],[4,7]],
  farm:[[3,9],[4,10],[3,11],[5,11],[2,10],[5,9],[2,8],[4,12]],
  lumber:[[3,4],[2,5],[3,3],[1,5],[2,3]],
  quarry:[[10,5],[11,4],[10,4],[9,3]],
  watch:[[9,6],[7,10],[5,3],[10,9]],
  granary:[[5,5],[6,4],[5,8],[7,8]],
  market:[[8,7],[9,7],[7,7]],
  infirmary:[[7,3],[8,4]],
  palisade:[[4,3],[10,10]]
};
export const BUILDING_SLOTS=SLOTS;
export function installations(s){const out=[];for(const [id,slots] of Object.entries(SLOTS)){const count=Math.min(slots.length,s.buildings?.[id]||0);for(let i=0;i<count;i++)out.push({id,idx:i,x:slots[i][0],y:slots[i][1],name:BUILDINGS[id].name,level:i+1});}return out;}
export function weatherForDay(day,seed=1){const season=seasonOf(day), h=H(day,day*3,seed);let type='Despejado';if(season==='Invierno')type=h<.40?'Nevada':h<.64?'Nublado':h<.80?'Viento':'Despejado';else if(season==='Primavera')type=h<.33?'Lluvia':h<.47?'Nublado':h<.57?'Viento':'Despejado';else if(season==='Otoño')type=h<.36?'Lluvia':h<.64?'Nublado':h<.83?'Viento':'Despejado';else type=h<.16?'Lluvia':h<.29?'Nublado':'Despejado';return {type,season,sunlight:type==='Despejado'?1:type==='Nublado'?.75:.65};}
export function villageDescriptors(state){return {season:seasonOf(state.day),weather:weatherForDay(state.day,state.visualSeed||1),buildings:installations(state),population:state.population,trees:state.flags?.forestResolved==='cut'?'talados':state.flags?.forestResolved==='respected'?'protegidos':'intactos',palisade:state.buildings.palisade||0};}
const VISITORS=[
  ['Elara Thorn','Alcaldesa','#ad4f53'],['Toman Vale','Cazador','#345f4d'],['Irena Moss','Curandera','#536ba1'],['Osric Flint','Carpintero','#a77b48'],['Maeve Reed','Comerciante','#864f7b'],['Bran Hollow','Anciano','#73717a'],
  ['Aldeano','Agricultor','#ac7141'],['Aldeana','Artesana','#785b8d'],['Aldeano','Recolector','#496b65'],['Aldeana','Ganadera','#8a6e3e'],['Aldeano','Guardia','#43627a'],['Aldeana','Mercader','#aa5656']
];
const ROUTES=[[[6,5],[7,5],[7,6],[6,7],[5,7],[5,6]],[[4,6],[5,6],[6,6],[7,7],[8,7],[9,8]],[[3,7],[4,8],[5,8],[6,8],[7,8]],[[7,3],[7,4],[8,5],[8,6],[8,7],[9,7]],[[4,9],[5,9],[6,8],[7,7],[8,8]],[[3,4],[4,5],[5,5],[6,6],[7,6]]];
function poly(ctx,coords,fill,stroke=null,lineWidth=1){ctx.beginPath();ctx.moveTo(coords[0][0],coords[0][1]);for(let i=1;i<coords.length;i++)ctx.lineTo(coords[i][0],coords[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}}
function line(ctx,coords,color,width=1){ctx.beginPath();ctx.moveTo(coords[0][0],coords[0][1]);for(let i=1;i<coords.length;i++)ctx.lineTo(coords[i][0],coords[i][1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function ellipse(ctx,x,y,rx,ry,c){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();}
function diamond(ctx,x,y,fill,stroke=null){poly(ctx,[[x,y-TILE_H/2],[x+TILE_W/2,y],[x,y+TILE_H/2],[x-TILE_W/2,y]],fill,stroke,.65);}
function isRiver(x,y){return x===12||(x===11&&y>8)||(x===13&&y<5);}
function isPath(x,y){return (x===6&&y>=3&&y<=11)||(y===7&&x>=2&&x<=11)||(x===8&&y>=4&&y<=9)||(y===5&&x>=3&&x<=10)||(x===4&&y>=4&&y<=9);}
function drawTile(ctx,x,y,pal,season,t){const p=point(x,y);const grass=pal.grass[Math.floor(H(x,y)*4)];let c=grass;if(isRiver(x,y))c=season==='Invierno'?'#91b9bb':'#477f94';else if(isPath(x,y))c=season==='Invierno'?'#adaca1':'#ae9870';else if(x>=9&&y<=5&&H(x,y)>.23)c=season==='Invierno'?'#a6ada9':'#89837c';
 diamond(ctx,p.x,p.y+3,pal.grassEdge);diamond(ctx,p.x,p.y,c,season==='Invierno'?'#a9bbb4bb':'#29422c22');
 if(isRiver(x,y)){for(let i=0;i<3;i++){const a=Math.sin(t*.0016+i*2+x*4+y*3)*5;line(ctx,[[p.x-17+i*7+a,p.y-4+i*3],[p.x-9+i*7+a,p.y-6+i*3]],season==='Invierno'?'#e4f1ed88':'#b7e4e977',1.7);}return;}
 if(isPath(x,y)){for(let i=0;i<4;i++){const dx=(H(x,y,i+7)-.5)*60,dy=(H(x,y,i+17)-.5)*15;line(ctx,[[p.x+dx,p.y+dy],[p.x+dx+3,p.y+dy-1]],season==='Invierno'?'#dbd9c855':'#685e4d77',1.5);}return;}
 for(let i=0;i<5;i++){const rx=p.x+(H(x+i,y,5)-.5)*62,ry=p.y+(H(x,y+i,3)-.5)*24;ctx.fillStyle=season==='Invierno'?'#f0f2e833':'#b0ad6966';ctx.fillRect(rx,ry,2,2.5);} }
function tree(ctx,x,y,s,pal,season,t){const height=38+s*24;ellipse(ctx,x+6,y+3,19*s,7*s,'#172e2870');poly(ctx,[[x-3*s,y],[x+4*s,y],[x+2*s,y-height*.62],[x-2*s,y-height*.62]],'#70523b');if(season==='Invierno'){for(let n=0;n<3;n++){const h=height*(.36+n*.23);poly(ctx,[[x,y-height],[x-22*s+n*3*s,y-h],[x+20*s-n*3*s,y-h]],pal.tree[n]);line(ctx,[[x-13*s,y-h],[x+12*s,y-h]],'#e3e9dc',2.5);}return;}
 for(let i=0;i<3;i++){const y0=y-height*(.83-i*.19);const r=12*s+i*6*s;ellipse(ctx,x+(i===1?-4:2)*s,y0,r,13*s,pal.tree[(i+Math.floor(H(x,y)*3))%3]);ellipse(ctx,x-5*s,y0-5*s,5*s,3*s,'#e3dba527');}if(season==='Otoño'&&H(Math.floor(x),Math.floor(y),19)>.72){ellipse(ctx,x+24*s,y+Math.sin(t/1000+x)*4,2,2,'#cfaa61');}}
function roof(ctx,x,y,w,h,pal,kind='house'){const hh=h, rw=w;ellipse(ctx,x+5,y+6,rw*.67,rw*.30,'#18292366');poly(ctx,[[x-rw,y-rw*.36-hh],[x,y-hh+rw*.11],[x,y+rw*.45],[x-rw,y-rw*.04]],'#ae9776','#72583f',1);poly(ctx,[[x,y-hh+rw*.11],[x+rw,y-rw*.36-hh],[x+rw,y-rw*.04],[x,y+rw*.45]],'#ceb58b','#776044',1);
 poly(ctx,[[x-rw-5,y-rw*.36-hh],[x-4,y-hh-rw*.88],[x+4,y-hh-rw*.85],[x+rw+5,y-rw*.36-hh],[x+rw,y-rw*.36-hh+5],[x,y-hh+rw*.10],[x-rw,y-rw*.36-hh+5]],kind==='granary'?'#645041':kind==='infirmary'?'#64747b':pal.roof,'#583b32',1.2);
 line(ctx,[[x-3,y-hh-rw*.82],[x-rw,y-hh-rw*.31]],'#e2b48966',2);line(ctx,[[x+4,y-hh-rw*.82],[x+rw,y-hh-rw*.31]],'#301e2155',2);
 poly(ctx,[[x-8,y+rw*.33],[x-8,y-hh+rw*.21],[x+4,y-hh+rw*.14],[x+4,y+rw*.43]],'#59442e');ellipse(ctx,x+14,y-hh*.4,3.5,5,'#f6da8b');if(kind==='infirmary'){line(ctx,[[x-3,y-hh-10],[x+7,y-hh-10]],'#f3e5d5',3);line(ctx,[[x+2,y-hh-15],[x+2,y-hh-5]],'#f3e5d5',3);}
}
function drawField(ctx,x,y,season,t){const c=season==='Invierno'?'#a9aba0':'#a18650';diamond(ctx,x,y,c);for(let i=-3;i<=3;i++){line(ctx,[[x-26+i*5,y+7],[x+7+i*5,y-9]],i%2===0?'#654c33':'#c1a168',2.5);for(let j=0;j<3;j++){const rx=x-18+i*5+j*10,ry=y+4-j*4;if(season==='Invierno')ellipse(ctx,rx,ry-2,2,2,'#e4e8e1');else{line(ctx,[[rx,ry],[rx-2,ry-5]],'#64834a',1.3);ellipse(ctx,rx-2,ry-6-(season==='Verano'?2:0),2.5,2.5,season==='Otoño'?'#dfbe73':'#a5bc65');}}}}
function drawMarket(ctx,x,y,t){ellipse(ctx,x+5,y+4,31,9,'#1b2b2666');for(let i=-1;i<=1;i++){const xx=x+i*17;poly(ctx,[[xx-8,y-20],[xx,y-28],[xx+9,y-20],[xx,y-12]],i===0?'#bf7b45':'#e0bb78');line(ctx,[[xx-5,y-19],[xx-5,y+1]],'#593d2c',2);line(ctx,[[xx+6,y-19],[xx+6,y+1]],'#593d2c',2);}ellipse(ctx,x-4,y-5,6,2,'#ce9a58');}
function drawTower(ctx,x,y,season){ellipse(ctx,x+8,y+8,24,9,'#1b252677');poly(ctx,[[x-18,y-11],[x,y-19],[x,y-93],[x-18,y-85]],'#778079');poly(ctx,[[x,y-19],[x+18,y-11],[x+18,y-85],[x,y-93]],'#b9b7a4');poly(ctx,[[x-22,y-88],[x,y-100],[x+22,y-88],[x,y-77]],'#777b70');for(const dx of [-18,-7,6,18]){ctx.fillStyle='#9da297';ctx.fillRect(x+dx-3,y-102+(Math.abs(dx)*.42),8,13);}ellipse(ctx,x+5,y-61,3,6,'#3c4c4b');}
function drawQuarry(ctx,x,y,season){const stone=season==='Invierno'?'#a0a6a2':'#8e9189';ellipse(ctx,x+4,y+4,30,11,'#1b202066');for(let i=0;i<5;i++){const xx=x+(H(i,3)*44-22),yy=y+(H(5,i)*13-6);poly(ctx,[[xx-10,yy],[xx-5,yy-14],[xx+4,yy-17],[xx+12,yy-3],[xx+5,yy+3]],i%2===0?stone:'#747b77','#55594c',.7);} }
function drawLumber(ctx,x,y){roof(ctx,x,y,20,15,{roof:'#665241'},'house');for(let i=0;i<4;i++){line(ctx,[[x+13,y+2-i*4],[x+32,y-3-i*4]],'#8b5935',5);ellipse(ctx,x+32,y-3-i*4,2.5,3,'#d6a56b');}}
function drawPalisade(ctx,x,y){for(let i=-3;i<5;i++){const xx=x+i*9,yy=y+i*3;line(ctx,[[xx,yy-24],[xx,yy+2]],'#71513a',6);poly(ctx,[[xx-3,yy-24],[xx,yy-33],[xx+3,yy-24]],'#97724b');}line(ctx,[[x-31,y-9],[x+38,y+14]],'#624633',3);}
function drawBuilding(ctx,b,pal,season,t,selected){const p=point(b.x,b.y);if(selected){ellipse(ctx,p.x,p.y+3,42,17,'#f3ce75aa');ellipse(ctx,p.x,p.y+3,35,13,'#e9c87333');}
 if(b.id==='farm')drawField(ctx,p.x,p.y,season,t);else if(b.id==='watch')drawTower(ctx,p.x,p.y,season);else if(b.id==='quarry')drawQuarry(ctx,p.x,p.y,season);else if(b.id==='market')drawMarket(ctx,p.x,p.y,t);else if(b.id==='lumber')drawLumber(ctx,p.x,p.y);else if(b.id==='palisade')drawPalisade(ctx,p.x,p.y);else if(b.id==='granary')roof(ctx,p.x,p.y,27,25,pal,'granary');else if(b.id==='infirmary')roof(ctx,p.x,p.y,29,28,pal,'infirmary');else roof(ctx,p.x,p.y,25,27,pal);
 if(b.id==='houses'||b.id==='granary'){for(let n=0;n<3;n++){const drift=(t*.012+n*12+b.x*4)%36;ellipse(ctx,p.x+14+drift*.28,p.y-62-drift,3+drift*.11,2+drift*.09,'#e0e6d948');}}
 if(selected){ctx.font='bold 13px system-ui';const label=b.name.toUpperCase();const tx=ctx.measureText(label).width;ctx.fillStyle='#142920df';ctx.fillRect(p.x-tx/2-10,p.y-108,tx+20,24);ctx.fillStyle='#f9e3ae';ctx.fillText(label,p.x-tx/2,p.y-92);}}
function villagerPosition(i,t){const route=ROUTES[i%ROUTES.length];const period=7800+(i%5)*1600,phase=((t+i*1449)%period)/period*route.length,idx=Math.floor(phase);const a=route[idx],b=route[(idx+1)%route.length],f=phase-idx,sm=f*f*(3-2*f);const p=point(mix(a[0],b[0],sm)+.12*(i%3),mix(a[1],b[1],sm)+.05*i);return {x:p.x,y:p.y,step:Math.sin(t*.011+i),dx:b[0]-a[0]};}
function drawVillager(ctx,x,y,shirt,t,i,selected){if(selected)ellipse(ctx,x,y+2,10,4,'#f9e29e');ellipse(ctx,x+2,y+3,5,2,'#13252380');const stride=Math.sin(t*.010+i)*2;line(ctx,[[x-2,y-5],[x-3+stride,y+2]],'#4f3e33',2.6);line(ctx,[[x+2,y-5],[x+3-stride,y+2]],'#4f3e33',2.6);poly(ctx,[[x-5,y-17],[x+5,y-17],[x+4,y-6],[x-4,y-6]],shirt);ellipse(ctx,x,y-20,4.3,5,'#d8ac83');line(ctx,[[x-4,y-24],[x+4,y-24]],'#483d36',2.5);line(ctx,[[x-5,y-14],[x-8,y-8+stride]],'#d1a381',2);line(ctx,[[x+5,y-14],[x+8,y-8-stride]],'#d1a381',2);}
function drawCloud(ctx,x,y,s){ctx.globalAlpha=.12;for(let i=0;i<4;i++)ellipse(ctx,x+i*15,y-Math.sin(i)*4,28*s,10*s,'#fcf5df');ctx.globalAlpha=1;}
export class VillageWorld{
  constructor(canvas,{onSelect=()=>{},onWeather=()=>{}}={}){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.onSelect=onSelect;this.onWeather=onWeather;this.state=null;this.selected=null;this.offset={x:0,y:0};this.scale=1;this.pointers=new Map();this.drag=null;this.width=800;this.height=450;this.animationStart=performance.now();this.lastTs=0;this.running=true;this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;this.bind();this.resize();this.loop=this.loop.bind(this);this.raf=requestAnimationFrame(this.loop);}
  setState(s){this.state=s;if(this.selected?.type==='building'&&!installations(s).some(b=>this.selected.id===b.id&&this.selected.idx===b.idx))this.select(null);this.onWeather(weatherForDay(s.day,s.visualSeed||1));}
  resize(){const rect=this.canvas.getBoundingClientRect();if(rect.width<=0||rect.height<=0)return;this.width=rect.width;this.height=rect.height;const dpr=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);this.dpr=dpr;if(!this.userZoom){this.scale=rect.width<600?.70:Math.min(1.0,(rect.width-40)/(GRID*TILE_W*.95));}}
  worldToScreen(x,y){return {x:this.width/2+this.offset.x+x*this.scale,y:this.height/2+this.offset.y+(y-(GRID-1)*TILE_H/2)*this.scale};}
  screenToWorld(x,y){return {x:(x-this.width/2-this.offset.x)/this.scale,y:(y-this.height/2-this.offset.y)/this.scale+(GRID-1)*TILE_H/2};}
  zoom(factor,focus=null){const target=limit(this.scale*factor,.32,2.0),pt=focus||{x:this.width/2,y:this.height/2};const before=this.screenToWorld(pt.x,pt.y);this.scale=target;const after=this.worldToScreen(before.x,before.y);this.offset.x+=pt.x-after.x;this.offset.y+=pt.y-after.y;this.userZoom=true;}
  home(){this.offset={x:0,y:0};this.userZoom=false;this.resize();this.select(null);}
  select(s){this.selected=s;this.onSelect(s);}
  hitAt(screenX,screenY,t){const p=this.screenToWorld(screenX,screenY);const buildings=installations(this.state);for(let i=buildings.length-1;i>=0;i--){const b=buildings[i],q=point(b.x,b.y);if(Math.abs(p.x-q.x)<31&&p.y>=q.y-(b.id==='watch'?112:65)&&p.y<=q.y+17)return {type:'building',...b};}
  const count=Math.min(this.state.population,12);for(let i=count-1;i>=0;i--){const q=villagerPosition(i,t);if(Math.abs(p.x-q.x)<11&&Math.abs(p.y-(q.y-12))<18){const [name,role]=VISITORS[i];return {type:'person',idx:i,name,role};}}
  const tx=p.x/TILE_W+p.y/TILE_H,ty=p.y/TILE_H-p.x/TILE_W;const x=Math.round(tx),y=Math.round(ty);if(x>=0&&x<GRID&&y>=0&&y<GRID)return {type:'terrain',x,y,name:isRiver(x,y)?'Río de Bram':isPath(x,y)?'Camino del asentamiento':'Tierras de Bramwood'};return null;}
  bind(){this.pointerDown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;this.canvas.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===1)this.drag={x:e.clientX,y:e.clientY,ox:this.offset.x,oy:this.offset.y,moved:false,at:performance.now()};else if(this.pointers.size===2){const [a,b]=[...this.pointers.values()];this.pinchDist=Math.hypot(a.x-b.x,a.y-b.y);this.drag=null;}};
 this.pointerMove=e=>{if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===2){const [a,b]=[...this.pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(this.pinchDist&&d>0)this.zoom(d/this.pinchDist,{x:(a.x+b.x)/2-this.canvas.getBoundingClientRect().left,y:(a.y+b.y)/2-this.canvas.getBoundingClientRect().top});this.pinchDist=d;this.drag=null;}else if(this.drag){const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.hypot(dx,dy)>5)this.drag.moved=true;if(this.drag.moved){this.offset.x=this.drag.ox+dx;this.offset.y=this.drag.oy+dy;}}};
 this.pointerUp=e=>{const wasTap=this.pointers.size===1&&this.drag&&!this.drag.moved&&performance.now()-this.drag.at<600;this.pointers.delete(e.pointerId);if(wasTap&&this.state){const rect=this.canvas.getBoundingClientRect();this.select(this.hitAt(e.clientX-rect.left,e.clientY-rect.top,performance.now()));}this.drag=null;this.pinchDist=null;};
 this.canvas.addEventListener('pointerdown',this.pointerDown);this.canvas.addEventListener('pointermove',this.pointerMove);this.canvas.addEventListener('pointerup',this.pointerUp);this.canvas.addEventListener('pointercancel',this.pointerUp);this.canvas.addEventListener('wheel',e=>{e.preventDefault();const r=this.canvas.getBoundingClientRect();this.zoom(e.deltaY<0?1.12:.89,{x:e.clientX-r.left,y:e.clientY-r.top});},{passive:false});this.canvas.addEventListener('dblclick',e=>{e.preventDefault();this.home();});if(typeof ResizeObserver!=='undefined'){this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this.canvas);}else window.addEventListener('resize',()=>this.resize());}
  loop(ts){if(!this.running)return;if(!document.hidden&&this.canvas.getClientRects().length&&(ts-this.lastTs>=(this.reduced?650:30))){this.render(this.reduced?6000:ts);this.lastTs=ts;}this.raf=requestAnimationFrame(this.loop);}
  render(t=0){if(!this.state||!this.ctx)return;const ctx=this.ctx,W=this.width,Ht=this.height,{season,weather,buildings}=villageDescriptors(this.state),pal=SEASON_COLORS[season];const actual=this.canvas.width/this.width;ctx.setTransform(actual,0,0,actual,0,0);const bg=ctx.createLinearGradient(0,0,0,Ht);bg.addColorStop(0,season==='Invierno'?'#7b9598':weather.type==='Despejado'?'#849e93':'#677f7c');bg.addColorStop(1,'#263e36');ctx.fillStyle=bg;ctx.fillRect(0,0,W,Ht);drawCloud(ctx,(t*.006)% (W+200)-100,60,1.4);drawCloud(ctx,(t*.003+W/2)%(W+200)-100,95,1.1);
 ctx.save();ctx.translate(this.width/2+this.offset.x,this.height/2+this.offset.y);ctx.scale(this.scale,this.scale);ctx.translate(0,-(GRID-1)*TILE_H/2);
 // Ground tiles: alternating subtle texture, exposed edges, paths, stone, river.
 for(let k=0;k<=2*(GRID-1);k++)for(let x=0;x<GRID;x++){const y=k-x;if(y>=0&&y<GRID)drawTile(ctx,x,y,pal,season,t);}
 const occupied=new Set(buildings.map(b=>`${b.x},${b.y}`));const sprites=[];
 for(let x=0;x<GRID;x++)for(let y=0;y<GRID;y++){if(occupied.has(`${x},${y}`)||isRiver(x,y)||isPath(x,y))continue;
 const forest=(x<=4&&y<=6)||(x>=9&&y>=9)||(x<=2&&y>=9)||(x>=9&&y<=2);
 if(forest&&H(x,y,91)>.22&&!(this.state.flags?.forestResolved==='cut'&&H(x,y,91)>.65))sprites.push({depth:x+y,type:'tree',x,y,z:H(x,y,81)});
 else if(H(x,y,72)>.88)sprites.push({depth:x+y,type:'rock',x,y});else if(H(x,y,38)>.85)sprites.push({depth:x+y,type:'flower',x,y});}
 for(const b of buildings)sprites.push({depth:b.x+b.y,type:'building',...b});const people=Math.min(this.state.population,12);
 for(let i=0;i<people;i++){const p=villagerPosition(i,t);sprites.push({depth:p.y/TILE_H*2,type:'person',idx:i,p});}
 sprites.sort((a,b)=>a.depth-b.depth||(a.type==='person'?1:-1));
 for(const sp of sprites){const q=sp.p||point(sp.x,sp.y);if(sp.type==='tree')tree(ctx,q.x,q.y,sp.z*.36+.85,pal,season,t);else if(sp.type==='rock')drawQuarry(ctx,q.x,q.y,season);else if(sp.type==='flower'){for(let j=0;j<4;j++){ellipse(ctx,q.x-13+j*6,q.y-1+Math.sin(j)*4,2.2,2.2,season==='Invierno'?'#f2f5e8':season==='Otoño'?'#d8c276':'#e4cf95');}}else if(sp.type==='building')drawBuilding(ctx,sp,pal,season,t,this.selected?.type==='building'&&sp.id===this.selected.id&&sp.idx===this.selected.idx);else if(sp.type==='person'){const [name,role,color]=VISITORS[sp.idx];drawVillager(ctx,q.x,q.y,color,t,sp.idx,this.selected?.type==='person'&&sp.idx===this.selected.idx);}}
 ctx.restore();
 if(weather.type==='Lluvia'){ctx.strokeStyle='#c3dfe88a';ctx.lineWidth=1.1;for(let i=0;i<90;i++){const xx=(H(i,4)*W+t*.34)%W,yy=(H(i,7)*Ht+t*.57)%Ht;line(ctx,[[xx,yy],[xx-6,yy+15]],'#d2ebef88',1.1);}}
 if(weather.type==='Nevada'){for(let i=0;i<80;i++){let xx=(H(i,21)*W+Math.sin(t*.0008+i)*24+t*.007*(i%3+1))%W,yy=(H(i,41)*Ht+t*.02*(i%4+1))%Ht;ellipse(ctx,xx,yy,1+(i%3)*.5,1+(i%3)*.5,'#f9fcf0c9');}}
 if(weather.type==='Viento'||season==='Otoño'){for(let i=0;i<12;i++){const xx=(H(i,13)*W+t*.02*(i%3+1))%W,yy=(H(i,17)*Ht+t*.008)%Ht;ellipse(ctx,xx,yy,2.7,1.5,season==='Otoño'?'#e9b568aa':'#b4d1ab99');}}
 const vign=ctx.createRadialGradient(W/2,Ht/2,Math.min(W,Ht)*.26,W/2,Ht/2,Math.max(W,Ht)*.75);vign.addColorStop(0,'#071a0e00');vign.addColorStop(1,'#0a201a99');ctx.fillStyle=vign;ctx.fillRect(0,0,W,Ht);
 }
  destroy(){this.running=false;cancelAnimationFrame(this.raf);this.ro?.disconnect();this.canvas.removeEventListener('pointerdown',this.pointerDown);this.canvas.removeEventListener('pointermove',this.pointerMove);this.canvas.removeEventListener('pointerup',this.pointerUp);}
}
