'use strict';
const E = window.BramwoodEngine;
const SAVE = 'bramwood_save_v3';
const LEGACY = ['bramwood_save_v2','bramwood_v01'];
let tab = 'council';
let notice = '';

const q = id => document.getElementById(id);
function safeGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}}
function safeRemove(k){try{localStorage.removeItem(k)}catch(_){}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function loadGame(){
  const keys=[SAVE,...LEGACY];
  for(const key of keys){const raw=safeGet(key);if(!raw)continue;const p=E.importState(raw);if(p.ok){if(key!==SAVE)safeSet(SAVE,JSON.stringify(p.state));return p.state;}}
  return E.createBaseState(Date.now());
}
let s=loadGame();
function save(){safeSet(SAVE,JSON.stringify(s));}

function choose(eventId,choiceId){
  const out=E.resolveChoice(s,eventId,choiceId);
  if(!out.ok){
    notice=out.error==='NO_ACTIONS'?'El Consejo ya ha agotado sus dos decisiones importantes de hoy.':out.error==='ALREADY_HANDLED'?'Ese asunto ya ha recibido atención hoy.':out.error==='REQUIREMENTS'?'Ahora mismo Bramwood no cumple los requisitos para esa opción.':'Esa decisión ya no está disponible.';
  }else{s=out.state;notice=out.message||'Decisión registrada.';save();}
  render();
}
function endDay(){
  if(s.actionsLeft>0&&s.active.length){if(!confirm(`Aún te quedan ${s.actionsLeft} decisión${s.actionsLeft===1?'':'es'} de Consejo. Los asuntos abiertos pueden empeorar. ¿Terminar el día?`))return;}
  const out=E.advanceDay(s);s=out.state;notice=out.notes[0]||'Amanece un nuevo día en Bramwood.';save();render();window.scrollTo({top:0,behavior:'smooth'});
}
function beginProject(id){
  const out=E.startProject(s,id);
  if(!out.ok){notice=out.error==='NO_ACTIONS'?'No te quedan decisiones de Consejo hoy.':out.error==='NOT_AFFORDABLE'?'No tienes recursos suficientes para iniciar este proyecto.':out.error==='REQUIREMENTS'?'Todavía no cumples los requisitos para construirlo.':'Ese proyecto no puede iniciarse ahora.';}
  else{s=out.state;notice=out.message;save();}
  render();
}

function statBar(){return [
  ['👥',s.pop,'Habitantes'],['🌾',s.food,'Comida'],['🪵',s.wood,'Madera'],['🪙',s.coin,'Monedas']
].map(x=>`<div class="stat"><b>${x[0]} ${x[1]}</b><span>${x[2]}</span></div>`).join('');}
function urgencyClass(u){return /Crítico/.test(u)?'critical':/Urgente|Serio/.test(u)?'urgent':/Buen/.test(u)?'good':'';}
const urgencyRank={'Crítico':0,'Urgente':1,'Serio':2,'Tensión':3,'Política':4,'Interno':5,'Nuevo':6,'Misterio':7,'Estacional':8,'Oportunidad':9,'Información':10,'Personal':11,'Cotidiano':12,'Buen augurio':13,'Legado':14,'Social':15,'Economía':16,'Exploración':17,'Consecuencia':18,'Decisión':19};

function council(){
  const cap=`<div class="council-cap"><div><span>⚖️ CONSEJO</span><small>decisiones importantes disponibles</small></div><b>${s.actionsLeft}/${s.actionsMax}</b></div>`;
  const alerts=[];
  if(notice)alerts.push(`<div class="notice">${esc(notice)}</div>`);
  const dailyNeed=Math.max(2,Math.ceil(s.pop/9))+(s.season==='Invierno'?1:0);
  if(s.food<=dailyNeed*3)alerts.push('<div class="notice danger-note">⚠️ Las reservas de comida están peligrosamente bajas.</div>');
  if(s.pop>E.housingCapacity(s))alerts.push('<div class="notice danger-note">🏚️ Hay más habitantes que capacidad de vivienda.</div>');
  if(s.ending)alerts.push(`<div class="notice ending"><b>${esc(s.ending.title)}</b><br>${esc(s.ending.text)}</div>`);
  const ids=[...s.active].sort((a,b)=>(urgencyRank[E.EVENTS[a]?.urg]??99)-(urgencyRank[E.EVENTS[b]?.urg]??99));
  const cards=ids.map(id=>{
    const e=E.getEventView(s,id); if(!e)return'';
    const handled=e.handledToday,noActions=s.actionsLeft<=0;
    const remain=e.deadline?Math.max(0,e.deadline.days-e.nightsOpen):null;
    const timing=e.deadline?`<span class="deadline">⏳ ${remain===0?'esta noche':`en ${remain} noche${remain===1?'':'s'}`}</span>`:'';
    return `<section class="card event-card ${urgencyClass(e.urg)}">
      <div class="event-top"><div><span class="eyebrow">${esc(e.urg)}${e.chain?` · ${esc(e.chain)}`:''}</span><span class="age">${e.age?`abierto ${e.age}d`:'nuevo hoy'}</span></div>${timing}</div>
      <h2>${esc(e.title)}</h2><p>${esc(e.text)}</p>
      ${handled?'<div class="handled">✓ Ya has atendido este asunto hoy.</div>':''}
      <div class="choices">${e.choices.map(ch=>{const dis=noActions||handled||!ch.available;return `<button class="choice ${!ch.available?'locked':''}" ${dis?'disabled':''} onclick="choose('${id}','${ch.id}')"><b>${esc(ch.label)}</b><small>${esc(ch.desc)}${!ch.available?' · 🔒 No disponible ahora':''}</small></button>`}).join('')}</div>
    </section>`;
  }).join('');
  const empty=ids.length?'':'<div class="card quiet"><div class="big-icon">🌲</div><h2>Bramwood respira tranquila</h2><p>No hay asuntos activos. Puedes dedicar el día a proyectos o dejar que el tiempo avance.</p></div>';
  return cap+alerts.join('')+empty+cards+`<button class="end-day" onclick="endDay()"><b>☾ Terminar el día</b><span>La aldea producirá, consumirá y los asuntos abiertos avanzarán.</span></button>`;
}

function meter(label,value,cls=''){return `<div class="metric-row"><span>${label}</span><b>${value}/100</b></div><div class="meter ${cls}"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div>`;}
function factionLabel(v){return v>=50?'Aliada':v>=20?'Amistosa':v>=5?'Cordial':v>-10?'Neutral':v>-30?'Tensa':'Hostil';}
function village(){
  const buildingCards=Object.entries(s.buildings).map(([id,b])=>`<div class="building"><div class="building-icon">${id==='well'?'💧':id==='palisade'?'🛡️':id==='market'?'⚖️':id==='infirmary'?'✚':id==='fields'?'🌾':id==='homes'?'🏠':'🔨'}</div><div><b>${esc(b.name)}</b><small>${esc(b.desc||'')}</small></div><span>Nv. ${b.level||1}</span></div>`).join('');
  const facs=Object.entries(s.factions).map(([id,f])=>`<div class="faction"><div><b>${esc(f.name)}</b><small>${esc(f.desc)}</small></div><span class="attitude ${f.attitude< -10?'bad':f.attitude>=20?'goodtext':''}">${f.attitude>0?'+':''}${f.attitude} · ${factionLabel(f.attitude)}</span></div>`).join('');
  return `<section class="card settlement"><div class="eyebrow">Estado de la aldea</div><h2>Bramwood</h2><p class="weather">${esc(s.weather)} · Día ${s.seasonDay} de ${s.season}, Año ${s.year}</p>
    ${meter('Moral',s.morale)}${meter('Seguridad',s.safety,'security')}
    <div class="resource-grid"><div><span>💊 Medicina</span><b>${s.medicine}</b></div><div><span>🛠️ Herramientas</span><b>${s.tools}</b></div><div><span>🏷️ Reputación</span><b>${s.reputation}</b></div><div><span>🏠 Vivienda</span><b>${s.pop}/${E.housingCapacity(s)}</b></div></div>
  </section>
  <section class="card"><div class="eyebrow">Infraestructura</div><h2>Lo que habéis construido</h2><div class="building-list">${buildingCards}</div></section>
  <section class="card"><div class="eyebrow">Mundo exterior</div><h2>Relaciones</h2>${facs}</section>
  ${s.milestones.length?`<section class="card"><div class="eyebrow">Legado</div><h2>Hitos</h2><div class="milestones">${s.milestones.map(m=>`<span>${esc(m.replaceAll('_',' '))}</span>`).join('')}</div></section>`:''}`;
}

function costLine(cost){const icons={food:'🌾',wood:'🪵',coin:'🪙',medicine:'💊',tools:'🛠️'};return Object.entries(cost||{}).map(([k,v])=>`${icons[k]||k} ${v}`).join(' · ');}
function projects(){
  const active=s.projects.map(pr=>{const p=E.PROJECTS[pr.id];return `<div class="project active-project"><div><span class="eyebrow">En construcción</span><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div><div class="due">${Math.max(0,pr.dueDay-s.day)}d</div></div>`}).join('');
  const cards=Object.values(E.PROJECTS).map(p=>{const v=E.projectView(s,p.id); if(v.built&&!p.repeatable)return `<div class="project built"><div><span class="eyebrow">Completado</span><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div><span>✓</span></div>`;
    const disabled=!v.available||!v.affordable||s.actionsLeft<=0||v.active;
    return `<div class="project"><div><span class="eyebrow">${p.days} días base</span><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="cost">${costLine(p.cost)}</div>${!v.available?'<small class="locktext">🔒 Requisito narrativo o de infraestructura pendiente.</small>':''}</div><button ${disabled?'disabled':''} onclick="beginProject('${p.id}')">Construir</button></div>`;
  }).join('');
  return `${notice?`<div class="notice">${esc(notice)}</div>`:''}<div class="card project-head"><div><span class="eyebrow">Obras</span><h2>Proyectos de Bramwood</h2><p>Iniciar una obra consume una decisión de Consejo. Tomas reduce en un día la duración mientras pueda trabajar.</p></div><b>${s.actionsLeft}/${s.actionsMax}</b></div>${active?`<section class="card"><div class="eyebrow">En marcha</div>${active}</section>`:''}<section class="card"><div class="eyebrow">Disponibles</div><div class="project-list">${cards}</div></section>`;
}

function people(){
  const named=s.people.map(p=>`<div class="person ${p.alive===false?'dead':''}"><div class="avatar">${p.alive===false?'✝':'●'}</div><div><b>${esc(p.name)}</b><small>${esc(p.role)} · ${esc(p.trait)}</small></div><span>${esc(p.status||'Bien')}</span></div>`).join('');
  const homes=s.households.map(h=>`<div class="household"><div><b>${esc(h.name)}</b><small>${esc(h.work||'')}</small></div><span>${(h.adults||0)+(h.children||0)} personas</span></div>`).join('');
  return `<section class="card"><div class="eyebrow">Personas clave</div><h2>Vidas que importan</h2><p>Sus estados pueden abrir, cambiar o cerrar decisiones futuras.</p>${named}</section><section class="card"><div class="eyebrow">Hogares</div><h2>Familias de Bramwood</h2>${homes}</section>`;
}

function chronicle(){
  const stats=E.contentStats();
  return `<section class="card"><div class="eyebrow">La memoria de la aldea</div><h2>Crónica</h2>${s.history.slice(0,120).map(x=>`<div class="log">${esc(x)}</div>`).join('')}</section>
  <section class="card"><div class="eyebrow">Esta versión</div><div class="content-stats"><div><b>${stats.events}</b><span>eventos</span></div><div><b>${stats.choices}</b><span>decisiones</span></div><div><b>${stats.projects}</b><span>proyectos</span></div><div><b>${stats.chains}</b><span>líneas</span></div></div></section>
  <section class="card"><div class="eyebrow">Partida</div><h3>Guardar fuera del navegador</h3><p>La partida se guarda automáticamente. Exportarla te permite moverla a otro dispositivo o conservarla antes de una actualización.</p><div class="button-row"><button onclick="exportSave()">Exportar</button><button onclick="q('importFile').click()">Importar</button></div><input id="importFile" type="file" accept="application/json,.json" hidden onchange="importSave(event)"><button class="danger wide" onclick="resetGame()">Nueva partida</button></section>
  <section class="card install"><div class="eyebrow">iPhone</div><h3>Instalar Bramwood</h3><p>En Safari: <b>Compartir → Añadir a pantalla de inicio</b>. Después se abre a pantalla completa y funciona también sin conexión tras la primera carga.</p></section>`;
}

function exportSave(){const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bramwood-dia-${s.day}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function importSave(ev){const file=ev.target.files?.[0];if(!file)return;const p=E.importState(await file.text());if(p.ok){s=p.state;notice='Partida importada correctamente.';save();}else notice='Ese archivo no parece una partida válida de Bramwood.';ev.target.value='';render();}
function resetGame(){if(!confirm('¿Comenzar una nueva historia? La partida actual seguirá existiendo solo si antes la exportas.'))return;s=E.createBaseState(Date.now());notice='Una nueva crónica comienza en Bramwood.';LEGACY.forEach(safeRemove);save();tab='council';render();}
function switchTab(t){tab=t;notice='';render();window.scrollTo({top:0,behavior:'smooth'});}

function render(){
  const cal=`Día ${s.day} · ${s.season}, Año ${s.year}`;
  q('dateLine').textContent=cal;q('weatherLine').textContent=s.weather;q('stats').innerHTML=statBar();
  const views={council, village, projects, people, chronicle};q('app').innerHTML=views[tab]();
  document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
  q('eventBadge').textContent=s.active.length;q('eventBadge').classList.toggle('hidden',!s.active.length);
}
window.choose=choose;window.endDay=endDay;window.beginProject=beginProject;window.exportSave=exportSave;window.importSave=importSave;window.resetGame=resetGame;window.switchTab=switchTab;window.q=q;
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
