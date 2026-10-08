(function (root, factory) {
  const content = typeof module === 'object' && module.exports ? require('./content.js') : root.BramwoodContent;
  const api = factory(content);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BramwoodEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';

  const SAVE_VERSION = 3;
  const ACTIONS_PER_DAY = 2;
  const DAYS_PER_SEASON = 30;
  const SEASONS = ['Primavera','Verano','Otoño','Invierno'];
  const EVENT_MAP = Object.fromEntries(C.EVENTS.map(e => [e.id, e]));
  const PROJECT_MAP = Object.fromEntries(C.PROJECTS.map(p => [p.id, p]));
  const clone = v => JSON.parse(JSON.stringify(v));
  const clamp = (n,min,max) => Math.max(min, Math.min(max, Number.isFinite(+n) ? +n : min));
  const uniq = arr => [...new Set(arr)];

  function calendarForDay(day) {
    const d = Math.max(1, Math.floor(+day || 1));
    const z = d - 1;
    return {
      year: Math.floor(z / 120) + 1,
      season: SEASONS[Math.floor((z % 120) / DAYS_PER_SEASON)],
      seasonDay: (z % DAYS_PER_SEASON) + 1
    };
  }

  function defaultBuildings() {
    return {
      homes: {name:'Casas comunales', level:1, capacity:30, desc:'Techos para las familias de Bramwood.'},
      store: {name:'Almacén', level:1, desc:'Protege parte de las reservas.'},
      fields: {name:'Huertos y campos', level:1, desc:'La fuente principal de alimento.'}
    };
  }

  function createBaseState(seed) {
    const cal = calendarForDay(1);
    return {
      saveVersion:SAVE_VERSION,
      day:1, year:cal.year, season:cal.season, seasonDay:cal.seasonDay, weather:'Fresco y despejado',
      pop:22, food:72, wood:84, coin:16, medicine:5, tools:4,
      morale:61, safety:18, reputation:0,
      actionsMax:ACTIONS_PER_DAY, actionsLeft:ACTIONS_PER_DAY,
      flags:{}, active:['wounded','crops','forest'], resolved:[], queue:[], cooldowns:{}, eventMeta:{
        wounded:{openedDay:1,lastHandledDay:0,nightsOpen:0},
        crops:{openedDay:1,lastHandledDay:0,nightsOpen:0},
        forest:{openedDay:1,lastHandledDay:0,nightsOpen:0}
      },
      people:clone(C.INITIAL_PEOPLE), households:clone(C.INITIAL_HOUSEHOLDS), buildings:defaultBuildings(),
      factions:clone(C.INITIAL_FACTIONS), projects:[],
      history:['Día 1 — Comienza la crónica de Bramwood. Tres asuntos reclaman tu atención y el Consejo solo puede abordar dos decisiones importantes al día.'],
      milestones:[], ending:null,
      rngState:(Math.floor(seed == null ? Date.now() : seed) >>> 0) || 0xB2A4C001
    };
  }

  function migrateLegacy(raw) {
    const s = createBaseState(123456789);
    if (!raw || typeof raw !== 'object') return s;
    for (const k of ['day','pop','food','wood','coin','morale','safety','reputation','actionsLeft']) if (raw[k] != null) s[k] = raw[k];
    if (Array.isArray(raw.active)) s.active = raw.active.filter(id => EVENT_MAP[id]);
    if (Array.isArray(raw.resolved)) s.resolved = raw.resolved.filter(id => EVENT_MAP[id]);
    if (Array.isArray(raw.queue)) s.queue = raw.queue.map(q => ({day:+(q.day ?? q.d), id:q.id ?? q.e})).filter(q => EVENT_MAP[q.id] && Number.isFinite(q.day));
    if (raw.flags && typeof raw.flags === 'object') s.flags = clone(raw.flags);
    if (Array.isArray(raw.history)) s.history = clone(raw.history);
    if (raw.eventMeta && typeof raw.eventMeta === 'object') s.eventMeta = clone(raw.eventMeta);
    if (Array.isArray(raw.people)) {
      // v0.1 used [name, role, trait]
      s.people = raw.people.map((p,i) => Array.isArray(p) ? ({id:'legacy_'+i,name:p[0],role:p[1],trait:p[2],status:'Bien',alive:true,loyalty:50}) : p);
    }
    if (Array.isArray(raw.buildings)) {
      raw.buildings.forEach(b => {
        if (!Array.isArray(b)) return;
        const name = String(b[0]||'').toLowerCase();
        if (name.includes('pozo')) s.buildings.well={name:'Pozo',level:b[1]||1,desc:'Agua limpia para la aldea.'};
      });
    }
    return s;
  }

  function normalizeState(input) {
    let raw = input && typeof input === 'object' ? clone(input) : {};
    let s = raw.saveVersion >= 3 ? Object.assign(createBaseState(raw.rngState), raw) : migrateLegacy(raw);
    s.saveVersion = SAVE_VERSION;
    s.day = Math.max(1, Math.floor(+s.day || 1));
    const cal = calendarForDay(s.day); Object.assign(s, cal);
    for (const r of ['pop','food','wood','coin','medicine','tools']) s[r] = Math.max(0, Math.floor(+s[r] || 0));
    s.morale=clamp(s.morale,0,100); s.safety=clamp(s.safety,0,100); s.reputation=Math.floor(+s.reputation||0);
    s.actionsMax=ACTIONS_PER_DAY; s.actionsLeft=clamp(Number.isFinite(+s.actionsLeft)?+s.actionsLeft:ACTIONS_PER_DAY,0,ACTIONS_PER_DAY);
    s.flags=s.flags&&typeof s.flags==='object'?s.flags:{};
    s.active=uniq(Array.isArray(s.active)?s.active.filter(id=>EVENT_MAP[id]):[]);
    s.resolved=uniq(Array.isArray(s.resolved)?s.resolved.filter(id=>EVENT_MAP[id]):[]);
    s.queue=Array.isArray(s.queue)?s.queue.map(q=>({day:Math.max(1,Math.floor(+(q.day??q.d)||1)),id:q.id??q.e})).filter(q=>EVENT_MAP[q.id]):[];
    s.cooldowns=s.cooldowns&&typeof s.cooldowns==='object'?s.cooldowns:{};
    s.eventMeta=s.eventMeta&&typeof s.eventMeta==='object'?s.eventMeta:{};
    s.active.forEach(id=>{
      const m=s.eventMeta[id]||{};
      s.eventMeta[id]={openedDay:Math.max(1,Math.floor(+m.openedDay||s.day)),lastHandledDay:Math.max(0,Math.floor(+m.lastHandledDay||0)),nightsOpen:Math.max(0,Math.floor(+m.nightsOpen||0))};
    });
    s.people=Array.isArray(s.people)?s.people:clone(C.INITIAL_PEOPLE);
    s.households=Array.isArray(s.households)?s.households:clone(C.INITIAL_HOUSEHOLDS);
    s.buildings=s.buildings&&typeof s.buildings==='object'?s.buildings:defaultBuildings();
    s.factions=s.factions&&typeof s.factions==='object'?s.factions:clone(C.INITIAL_FACTIONS);
    Object.keys(C.INITIAL_FACTIONS).forEach(k=>{ if(!s.factions[k]) s.factions[k]=clone(C.INITIAL_FACTIONS[k]); s.factions[k].attitude=clamp(s.factions[k].attitude,-100,100); });
    s.projects=Array.isArray(s.projects)?s.projects.filter(p=>PROJECT_MAP[p.id]&&Number.isFinite(+p.dueDay)):[];
    s.history=Array.isArray(s.history)?s.history:[];
    s.milestones=Array.isArray(s.milestones)?s.milestones:[];
    s.rngState=(+s.rngState>>>0)||0xB2A4C001;
    sanitize(s); return s;
  }

  function sanitize(s) {
    for (const r of ['pop','food','wood','coin','medicine','tools']) s[r]=Math.max(0,Math.floor(+s[r]||0));
    s.morale=clamp(s.morale,0,100); s.safety=clamp(s.safety,0,100); s.reputation=Math.floor(+s.reputation||0);
    s.actionsLeft=clamp(s.actionsLeft,0,ACTIONS_PER_DAY);
    Object.values(s.factions||{}).forEach(f=>{f.attitude=clamp(f.attitude,-100,100);});
    return s;
  }

  function internalRand(s) {
    s.rngState = (Math.imul(1664525, s.rngState) + 1013904223) >>> 0;
    return s.rngState / 4294967296;
  }
  function rand(s, external) { return external ? external() : internalRand(s); }
  function person(s,id){ return s.people.find(p=>p.id===id); }
  function alive(s,id){ const p=person(s,id); return !!(p&&p.alive!==false); }
  function buildingLevel(s,id){ return s.buildings[id]?.level||0; }
  function factionAttitude(s,id){ return s.factions[id]?.attitude||0; }
  function housingCapacity(s){ return s.buildings.homes?.capacity || 30; }

  function checkCondition(s,c) {
    if (!c) return true;
    if (Array.isArray(c)) return c.every(x=>checkCondition(s,x));
    if (c.all) return c.all.every(x=>checkCondition(s,x));
    if (c.any) return c.any.some(x=>checkCondition(s,x));
    if (c.not) return !checkCondition(s,c.not);
    switch(c.type){
      case 'flag': return (s.flags[c.key] ?? false) === c.value;
      case 'flagTruthy': return !!s.flags[c.key];
      case 'flagFalsy': return !s.flags[c.key];
      case 'resourceMin': return (s[c.key]||0) >= c.value;
      case 'resourceMax': return (s[c.key]||0) <= c.value;
      case 'statMin': return (s[c.key]||0) >= c.value;
      case 'statMax': return (s[c.key]||0) <= c.value;
      case 'dayMin': return s.day >= c.value;
      case 'dayMax': return s.day <= c.value;
      case 'season': return Array.isArray(c.value)?c.value.includes(s.season):s.season===c.value;
      case 'building': return buildingLevel(s,c.key) >= (c.level||1);
      case 'noBuilding': return buildingLevel(s,c.key) < (c.level||1);
      case 'personAlive': return alive(s,c.id);
      case 'personDead': return !alive(s,c.id);
      case 'factionMin': return factionAttitude(s,c.key) >= c.value;
      case 'factionMax': return factionAttitude(s,c.key) <= c.value;
      case 'popMin': return s.pop >= c.value;
      case 'popMax': return s.pop <= c.value;
      case 'resolved': return s.resolved.includes(c.id);
      case 'notResolved': return !s.resolved.includes(c.id);
      case 'milestone': return s.milestones.includes(c.id);
      case 'projectActive': return s.projects.some(p=>p.id===c.id);
      default:return true;
    }
  }

  function requirementsMet(s, requires){ return !requires || checkCondition(s, requires); }
  function hasQueued(s,id){ return s.queue.some(q=>q.id===id); }
  function canOpen(s,id){
    const e=EVENT_MAP[id]; if(!e||s.active.includes(id)||hasQueued(s,id)) return false;
    if(!e.repeatable&&s.resolved.includes(id)) return false;
    if((s.cooldowns[id]||0)>s.day) return false;
    return checkCondition(s,e.conditions);
  }
  function openEvent(s,id){ if(!canOpen(s,id)) return false; s.active.push(id); s.eventMeta[id]={openedDay:s.day,lastHandledDay:0,nightsOpen:0}; return true; }
  function queueEvent(s,id,day){
    const e=EVENT_MAP[id]; if(!e||s.active.includes(id)||hasQueued(s,id)||(!e.repeatable&&s.resolved.includes(id))) return false;
    s.queue.push({day:Math.max(s.day,Math.floor(+day||s.day)),id}); return true;
  }
  function closeEvent(s,id, resolved=true){
    const e=EVENT_MAP[id]; s.active=s.active.filter(x=>x!==id); delete s.eventMeta[id];
    if(resolved&&e&&!e.repeatable&&!s.resolved.includes(id)) s.resolved.push(id);
    if(e?.repeatable) s.cooldowns[id]=s.day+(e.cooldownDays||6);
  }
  function log(s,msg){ if(msg) s.history.unshift(`Día ${s.day} — ${msg}`); if(s.history.length>400) s.history.length=400; }

  function addPerson(s,p){ if(!s.people.some(x=>x.id===p.id)) s.people.push(clone(p)); }
  function setPersonStatus(s,id,status){ const p=person(s,id); if(p) p.status=status; }
  function killPerson(s,id,cause){ const p=person(s,id); if(p&&p.alive!==false){p.alive=false;p.status='Fallecido';s.pop=Math.max(0,s.pop-1);if(cause)log(s,`${p.name} muere: ${cause}.`);} }
  function addHousehold(s,h){ if(!s.households.some(x=>x.id===h.id)){s.households.push(clone(h)); s.pop += (h.adults||0)+(h.children||0);} }
  function addBuilding(s,id,data){ if(!s.buildings[id]) s.buildings[id]=Object.assign({level:1},clone(data||{})); else s.buildings[id].level=Math.max(s.buildings[id].level||1,data?.level||1); }

  function applyEffect(s,e){
    if(!e) return;
    switch(e.type){
      case 'resource': s[e.key]=(s[e.key]||0)+(e.delta||0); break;
      case 'stat': s[e.key]=(s[e.key]||0)+(e.delta||0); break;
      case 'pop': s.pop+=(e.delta||0); break;
      case 'flag': s.flags[e.key]=clone(e.value); break;
      case 'flagInc': s.flags[e.key]=(s.flags[e.key]||0)+(e.delta||1); break;
      case 'faction': if(s.factions[e.key]) s.factions[e.key].attitude+=(e.delta||0); break;
      case 'personAdd': addPerson(s,e.person); break;
      case 'personStatus': setPersonStatus(s,e.id,e.status); break;
      case 'personKill': killPerson(s,e.id,e.cause); break;
      case 'householdAdd': addHousehold(s,e.household); break;
      case 'buildingAdd': addBuilding(s,e.id,e.building); break;
      case 'buildingLevel': if(s.buildings[e.id]) s.buildings[e.id].level=Math.max(1,(s.buildings[e.id].level||1)+(e.delta||1)); break;
      case 'housing': if(s.buildings.homes) s.buildings.homes.capacity+=(e.delta||0); break;
      case 'queue': queueEvent(s,e.id,s.day+(e.delay||0)); break;
      case 'open': openEvent(s,e.id); break;
      case 'cooldown': s.cooldowns[e.id]=Math.max(s.cooldowns[e.id]||0,s.day+(e.days||1)); break;
      case 'milestone': if(!s.milestones.includes(e.id)) s.milestones.push(e.id); break;
      case 'ending': s.ending={id:e.id,title:e.title,text:e.text,day:s.day}; break;
      case 'conditional': if(checkCondition(s,e.condition)) applyEffects(s,e.effects); else applyEffects(s,e.elseEffects); break;
      case 'history': log(s,e.message); break;
    }
  }
  function applyEffects(s,effects){ (effects||[]).forEach(e=>applyEffect(s,e)); }

  function resolveChoice(state,eventId,choiceId){
    const s=normalizeState(state); const ev=EVENT_MAP[eventId];
    if(!ev||!s.active.includes(eventId)) return {ok:false,error:'EVENT_NOT_ACTIVE',state:s};
    const ch=ev.choices.find(c=>c.id===choiceId); if(!ch) return {ok:false,error:'CHOICE_NOT_ALLOWED',state:s};
    if(s.actionsLeft<=0) return {ok:false,error:'NO_ACTIONS',state:s};
    const meta=s.eventMeta[eventId]||{openedDay:s.day,lastHandledDay:0,nightsOpen:0};
    if(meta.lastHandledDay===s.day) return {ok:false,error:'ALREADY_HANDLED',state:s};
    if(!requirementsMet(s,ch.requires)) return {ok:false,error:'REQUIREMENTS',state:s};
    s.actionsLeft--; meta.lastHandledDay=s.day; s.eventMeta[eventId]=meta;
    applyEffects(s,ch.effects);
    (ch.next||[]).forEach(n=>{if(checkCondition(s,n.conditions)) queueEvent(s,n.id,s.day+(n.delay||1));});
    if(ch.close!==false) closeEvent(s,eventId,true);
    if(ch.cooldownDays) s.cooldowns[eventId]=s.day+ch.cooldownDays;
    log(s,ch.message||`${ev.title}: ${ch.label}.`); sanitize(s);
    return {ok:true,state:s,message:ch.message||'',resolved:ch.close!==false};
  }

  function processActiveNight(s,notes){
    [...s.active].forEach(id=>{
      const ev=EVENT_MAP[id], meta=s.eventMeta[id]; if(!ev||!meta)return;
      meta.nightsOpen=(meta.nightsOpen||0)+1;
      if(ev.nightly){ applyEffects(s,ev.nightly.effects); if(ev.nightly.message){notes.push(ev.nightly.message);log(s,ev.nightly.message);} }
      if(ev.deadline && meta.nightsOpen>=ev.deadline.days){
        applyEffects(s,ev.deadline.effects);
        (ev.deadline.next||[]).forEach(n=>queueEvent(s,n.id,s.day+(n.delay||1)));
        const m=ev.deadline.message||`${ev.title} queda sin resolver y la situación empeora.`; notes.push(m);log(s,m); closeEvent(s,id,true);
      }
    });
  }

  function passiveEconomy(s,notes,rng){
    let foodProd=buildingLevel(s,'fields')*2 + (alive(s,'mara')?1:0);
    if(s.season==='Verano') foodProd+=1; if(s.season==='Otoño') foodProd+=2; if(s.season==='Invierno') foodProd=buildingLevel(s,'greenhouse')?1:0;
    if(s.flags.waterTainted&&!buildingLevel(s,'well')) foodProd=Math.max(0,foodProd-2);
    if(s.weather==='Tormenta') foodProd=Math.max(0,foodProd-1);
    if(buildingLevel(s,'mill')) foodProd+=1;
    let woodProd=1+(alive(s,'garran')?1:0)+(buildingLevel(s,'sawmill')?1:0);
    if(s.season==='Invierno') woodProd=Math.max(1,woodProd-1);
    s.food+=foodProd; s.wood+=woodProd;
    if(buildingLevel(s,'market')&&s.day%3===0) s.coin+=1;
    if(buildingLevel(s,'infirmary')&&s.day%5===0) s.medicine+=1;
    if(buildingLevel(s,'tannery')&&s.day%4===0) s.coin+=1;

    const consumption=Math.max(2,Math.ceil(s.pop/9))+(s.season==='Invierno'?1:0);
    if(s.food>=consumption){s.food-=consumption;s.flags.hungerDays=0;} else {
      const deficit=consumption-s.food;s.food=0;s.flags.hungerDays=(s.flags.hungerDays||0)+1;s.morale-=4+deficit*2;
      const m='Las reservas no alcanzan para alimentar a todos. El hambre se siente en Bramwood.'; notes.push(m);log(s,m);
      if(s.flags.hungerDays>=3&&s.pop>8&&rand(s,rng)<0.28){s.pop--;const m2='Una familia pierde a uno de los suyos durante los días de hambre.';notes.push(m2);log(s,m2);}
    }
    if(s.pop>housingCapacity(s)){s.morale-=2; if(s.day%3===0){const m='El hacinamiento empieza a tensar la convivencia.';notes.push(m);log(s,m);}}
    if(s.season==='Invierno'){const winterWood=Math.max(1,Math.ceil(s.pop/18));if(s.wood>=winterWood)s.wood-=winterWood;else{s.wood=0;s.morale-=3;s.flags.coldDays=(s.flags.coldDays||0)+1;}}
  }

  function weatherFor(s,rng){
    const r=rand(s,rng);
    const pools={
      Primavera:[['Lluvia',.28],['Fresco y despejado',.68],['Tormenta',1]],
      Verano:[['Calor seco',.25],['Cálido y despejado',.78],['Tormenta',1]],
      Otoño:[['Lluvia',.35],['Frío y nublado',.82],['Tormenta',1]],
      Invierno:[['Nieve',.42],['Frío intenso',.82],['Ventisca',1]]
    };
    return pools[s.season].find(x=>r<x[1])[0];
  }

  function processQueue(s,notes){
    const due=s.queue.filter(q=>q.day<=s.day); s.queue=s.queue.filter(q=>q.day>s.day);
    due.forEach(q=>{ if(openEvent(s,q.id)){const m=`Nuevo asunto: ${EVENT_MAP[q.id].title}.`;notes.push(m);log(s,m);} });
  }

  function eligibleRandomEvents(s,pool){
    return C.EVENTS.filter(e=>e.pool===pool&&canOpen(s,e.id)&&checkCondition(s,e.conditions));
  }
  function weightedPick(s,list,rng){
    if(!list.length)return null; const total=list.reduce((a,e)=>a+(e.weight||1),0);let r=rand(s,rng)*total;
    for(const e of list){r-=e.weight||1;if(r<=0)return e;} return list[list.length-1];
  }
  function maybeSpawn(s,notes,rng){
    if(s.active.length>=4)return;
    const storyChance=s.active.length<2?0.62:0.32;
    let e=null;
    if(rand(s,rng)<storyChance) e=weightedPick(s,eligibleRandomEvents(s,'story'),rng);
    if(!e&&rand(s,rng)<0.58) e=weightedPick(s,eligibleRandomEvents(s,'ambient'),rng);
    if(!e&&rand(s,rng)<0.34) e=weightedPick(s,eligibleRandomEvents(s,'seasonal'),rng);
    if(e&&openEvent(s,e.id)){const m=`Nuevo asunto: ${e.title}.`;notes.push(m);log(s,m);}
  }

  function completeProjects(s,notes){
    const done=s.projects.filter(p=>p.dueDay<=s.day); s.projects=s.projects.filter(p=>p.dueDay>s.day);
    done.forEach(pr=>{const p=PROJECT_MAP[pr.id];if(!p)return;applyEffects(s,p.completeEffects);const m=`Proyecto completado: ${p.name}.`;notes.push(m);log(s,m);});
  }

  function checkMilestones(s,notes){
    const add=(id,msg)=>{if(!s.milestones.includes(id)){s.milestones.push(id);notes.push(msg);log(s,msg);}};
    if(s.day>=31)add('summer1','Bramwood alcanza su primer verano.');
    if(s.day>=61)add('autumn1','Bramwood alcanza su primer otoño.');
    if(s.day>=91)add('winter1','Bramwood entra en su primer invierno.');
    if(s.day>=121){add('year1','Bramwood sobrevive un año completo.'); if(canOpen(s,'first_anniversary')) queueEvent(s,'first_anniversary',s.day);}
    if(s.pop>=40)add('pop40','Bramwood ya es más que una pequeña aldea: cuarenta personas la llaman hogar.');
    if(s.safety>=75)add('safe75','Las defensas de Bramwood inspiran respeto en todo el valle.');
  }

  function checkCollapse(s,notes){
    if(s.ending)return;
    if(s.pop<=0){s.ending={id:'empty',title:'La aldea vacía',text:'No queda nadie para mantener encendido el fuego de Bramwood.',day:s.day};}
    else if(s.morale<=0&&s.pop<12){s.ending={id:'exodus',title:'El éxodo',text:'La confianza se rompe. Las últimas familias abandonan Bramwood.',day:s.day};}
    if(s.ending){const m=`FINAL — ${s.ending.title}: ${s.ending.text}`;notes.push(m);log(s,m);}
  }

  function advanceDay(state,rng){
    const s=normalizeState(state),notes=[];
    processActiveNight(s,notes);
    passiveEconomy(s,notes,rng);
    s.day++;
    Object.assign(s,calendarForDay(s.day)); s.weather=weatherFor(s,rng); s.actionsLeft=ACTIONS_PER_DAY;
    completeProjects(s,notes); processQueue(s,notes); checkMilestones(s,notes); maybeSpawn(s,notes,rng); checkCollapse(s,notes); sanitize(s);
    return {ok:true,state:s,notes};
  }

  function getEventView(state,id){
    const s=normalizeState(state),e=EVENT_MAP[id]; if(!e)return null;const m=s.eventMeta[id]||{openedDay:s.day,lastHandledDay:0,nightsOpen:0};
    return Object.assign({},e,{age:Math.max(0,s.day-m.openedDay),nightsOpen:m.nightsOpen||0,handledToday:m.lastHandledDay===s.day,choices:e.choices.map(ch=>Object.assign({},ch,{available:requirementsMet(s,ch.requires)}))});
  }

  function projectView(state,id){
    const s=normalizeState(state),p=PROJECT_MAP[id]; if(!p)return null;
    const active=s.projects.find(x=>x.id===id); const built=buildingLevel(s,p.buildingId||id)>0;
    return Object.assign({},p,{active, built, available:checkCondition(s,p.conditions), affordable:Object.entries(p.cost||{}).every(([k,v])=>(s[k]||0)>=v)});
  }
  function startProject(state,id){
    const s=normalizeState(state),p=PROJECT_MAP[id]; if(!p)return {ok:false,error:'UNKNOWN_PROJECT',state:s};
    if(s.actionsLeft<=0)return {ok:false,error:'NO_ACTIONS',state:s};
    if(s.projects.some(x=>x.id===id))return {ok:false,error:'PROJECT_ACTIVE',state:s};
    if(p.buildingId&&buildingLevel(s,p.buildingId)>0&&!p.repeatable)return {ok:false,error:'ALREADY_BUILT',state:s};
    if(!checkCondition(s,p.conditions))return {ok:false,error:'REQUIREMENTS',state:s};
    for(const [k,v] of Object.entries(p.cost||{})) if((s[k]||0)<v)return {ok:false,error:'NOT_AFFORDABLE',state:s};
    Object.entries(p.cost||{}).forEach(([k,v])=>s[k]-=v); s.actionsLeft--;
    let duration=p.days||4; if(alive(s,'tomas'))duration=Math.max(2,duration-1); if(s.weather==='Ventisca')duration++;
    s.projects.push({id,dueDay:s.day+duration,startedDay:s.day}); log(s,`Comienza el proyecto ${p.name}. Si nada lo retrasa, estará listo en ${duration} días.`);sanitize(s);
    return {ok:true,state:s,message:`Comienza ${p.name}.`};
  }

  function importState(jsonOrObject){try{const obj=typeof jsonOrObject==='string'?JSON.parse(jsonOrObject):jsonOrObject;return{ok:true,state:normalizeState(obj)}}catch(e){return{ok:false,error:'INVALID_SAVE',state:createBaseState(1)}}}

  function contentStats(){return{events:C.EVENTS.length,choices:C.EVENTS.reduce((n,e)=>n+e.choices.length,0),projects:C.PROJECTS.length,chains:uniq(C.EVENTS.map(e=>e.chain).filter(Boolean)).length};}

  return {SAVE_VERSION,ACTIONS_PER_DAY,SEASONS,EVENTS:EVENT_MAP,PROJECTS:PROJECT_MAP,CONTENT:C,
    createBaseState,normalizeState,calendarForDay,resolveChoice,advanceDay,getEventView,startProject,projectView,importState,checkCondition,contentStats,clone,housingCapacity};
});
