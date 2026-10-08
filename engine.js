// Bramwood — Memoria y Consecuencias. Motor puro, sin dependencias ni llamadas de red.
export const VERSION = 3;
export const SEASON_NAMES = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
export const RESOURCE_NAMES = { food:'Comida', wood:'Madera', stone:'Piedra', gold:'Coronas', herbs:'Hierbas' };
export const BUILDINGS = {
  farm: {name:'Campos de cultivo',cost:{wood:22,stone:4,gold:8},description:'+9 comida al día en primavera y verano; menos en invierno.',max:8},
  lumber: {name:'Taller maderero',cost:{wood:14,stone:5,gold:8},description:'+6 madera al día. Más rápido en verano.',max:5},
  quarry: {name:'Cantera',cost:{wood:20,stone:3,gold:12},description:'+4 piedra al día.',max:4},
  watch: {name:'Torre de vigilancia',cost:{wood:32,stone:14,gold:14},description:'+10 defensa y +1 defensa diaria.',max:4},
  granary: {name:'Granero',cost:{wood:25,stone:12,gold:9},description:'+90 capacidad de comida y menos pérdidas.',max:4},
  market: {name:'Mercado',cost:{wood:35,stone:12,gold:20},description:'+5 coronas al día y mejor prosperidad.',max:3},
  houses: {name:'Casas comunales',cost:{wood:35,stone:8,gold:9},description:'+6 plazas de vivienda.',max:7},
  infirmary: {name:'Enfermería',cost:{wood:27,stone:13,gold:19,herbs:3},description:'Recuperación de salud y menos epidemias.',max:2},
  palisade: {name:'Empalizada',cost:{wood:65,stone:25,gold:22},description:'+23 defensa. Protege ante incursiones.',max:2}
};
export const FOCI = {
  harvest:{name:'Alimentar',detail:'+8 comida / día · −1 corona'},
  timber:{name:'Recolectar',detail:'+8 madera / día'},
  guard:{name:'Patrullar',detail:'+2 defensa / día · −2 coronas'},
  trade:{name:'Comerciar',detail:'+4 coronas / día · +1 prosperidad'}
};
export const EDICTS = {
  normal:{name:'Raciones normales',detail:'Equilibrio entre hambre y ánimo.'},
  sparse:{name:'Raciones reducidas',detail:'−28% consumo · −1 moral / día'},
  generous:{name:'Mesa compartida',detail:'+30% consumo · +1 moral / día'}
};
export const NOTABLES = [
  {id:'elara',name:'Elara Thorn',role:'Alcaldesa',trait:'Prudente y ecuánime',trust:62},
  {id:'toman',name:'Toman Vale',role:'Cazador',trait:'Directo; odia deber favores',trust:54},
  {id:'irena',name:'Irena Moss',role:'Curandera',trait:'Solidaria, incluso con extraños',trust:58},
  {id:'osric',name:'Osric Flint',role:'Carpintero',trait:'Pragmático; cree en la madera',trust:50},
  {id:'maeve',name:'Maeve Reed',role:'Comerciante',trait:'Astuta; siempre negocia',trust:48},
  {id:'bran',name:'Bran Hollow',role:'Anciano',trait:'Guarda secretos del bosque',trust:52}
];
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const deepCopy=x=>JSON.parse(JSON.stringify(x));
export const seasonOf = day => SEASON_NAMES[Math.floor(((day-1)%72)/18)];
export const yearOf = day => Math.floor((day-1)/72)+1;
export const dayOfSeason=day=>((day-1)%18)+1;
function rand(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function pick(s,arr){return arr[Math.floor(rand(s)*arr.length)];}
function capResources(s){for(const k of Object.keys(RESOURCE_NAMES))s.resources[k]=Math.max(0,Math.round(s.resources[k]));s.resources.food=Math.min(s.resources.food,120+s.buildings.granary*90);}
const log=(s,title,text,type='world')=>{s.journal.unshift({day:s.day,title,text,type});s.journal=s.journal.slice(0,180);};
function modify(s,amounts={}){
  for(const [key,val] of Object.entries(amounts)){
    if(key in s.resources)s.resources[key]+=val;
    else if(key in s.stats)s.stats[key]=clamp(s.stats[key]+val,0,100);
    else if(key==='population')s.population=Math.max(0,s.population+val);
  }
  capResources(s);
}
function trust(s,id,n){const person=s.notables.find(p=>p.id===id);if(person&&person.alive)person.trust=clamp(person.trust+n,0,100);}
function wound(s,id,n){const person=s.notables.find(p=>p.id===id);if(person&&person.alive){person.health=clamp(person.health+n,0,100);if(person.health===0){person.alive=false;s.population=Math.max(0,s.population-1);log(s,'Una silla vacía',`${person.name} ha muerto. Sus decisiones y las tuyas seguirán en la crónica.`,'loss');}}}
function schedule(s,id,offset){if(!s.queued.some(q=>q.id===id))s.queued.push({id,due:s.day+offset});}
function trait(s,id){return s.flags[id];}
function consequence(s,message){s.lastOutcome={day:s.day,text:message};log(s,'Decisión del consejo',message,'decision');}
function option(id,label,summary,apply,cost={}){return {id,label,summary,apply,cost};}
const EVENTS = [
  {id:'wolves',category:'Amenaza',title:'Huellas alrededor del granero',speaker:'Toman Vale',text:'Un rastro de lobos rodea las últimas casas. Toman ha visto a una cría cerca del bosque: tal vez la manada solo busca comida.',when:s=>s.day<=65&&!trait(s,'wolvesResolved'),weight:7,options:s=>[
    option('hunt','Organizar una batida','−8 comida, +defensa; Toman satisfecho.',x=>{modify(x,{food:-8,security:9,morale:2});trust(x,'toman',10);x.flags.wolvesResolved='hunted';schedule(x,'wolf_retaliation',6);consequence(x,'Toman dirige una batida y aleja a los lobos. El bosque, sin embargo, ha quedado alterado.');},{food:8}),
    option('feed','Dejar carne fuera del poblado','−15 comida; sin sangre, por ahora.',x=>{modify(x,{food:-15,morale:3});trust(x,'irena',7);x.flags.wolvesResolved='fed';schedule(x,'wolves_return',8);consequence(x,'La manada come lejos de las casas. Algunos vecinos celebran tu compasión; otros cuentan las reservas.');},{food:15}),
    option('fence','Levantar trampas y cercas','−15 madera; +defensa.',x=>{modify(x,{wood:-15,security:7});trust(x,'osric',7);x.flags.wolvesResolved='fenced';consequence(x,'Osric refuerza los corrales. Los lobos rodean las trampas, pero se marchan.');},{wood:15})]},
  {id:'wolf_retaliation',category:'Consecuencia',title:'Un cazador herido',speaker:'Irena Moss',text:'El bosque sigue revuelto tras la batida. Toman regresa con un corte profundo y dos perros no han vuelto.',when:s=>trait(s,'wolvesResolved')==='hunted',weight:0,options:s=>[
    option('heal','Atender a Toman','−3 hierbas; recupera la salud.',x=>{modify(x,{herbs:-3,morale:3});wound(x,'toman',14);trust(x,'irena',8);consequence(x,'Irena salva la pierna de Toman. La batida ya no parece una victoria sencilla.');},{herbs:3}),
    option('ignore','Dejarlo reposar','Sin coste material; Toman empeora.',x=>{wound(x,'toman',-45);trust(x,'toman',-14);modify(x,{morale:-4});consequence(x,'Sin medicinas, la herida de Toman se infecta. Nadie olvida la decisión.');})]},
  {id:'wolves_return',category:'Consecuencia',title:'La manada recuerda el camino',speaker:'Bran Hollow',text:'Los lobos vuelven al lugar donde encontraron carne. Esta noche hay cachorros junto al sendero de los huertos.',when:s=>trait(s,'wolvesResolved')==='fed',weight:0,options:s=>[
    option('ward','Ahuyentarlos con antorchas','−10 madera, +defensa.',x=>{modify(x,{wood:-10,security:5});trust(x,'bran',5);consequence(x,'La manada se interna en el bosque. Desde hoy se hacen guardias en el sendero.');},{wood:10}),
    option('sanctuary','Mantener una zona de alimentación','−20 comida, +moral; posible coste futuro.',x=>{modify(x,{food:-20,morale:8,security:-5});x.flags.wolfSanctuary=true;trust(x,'irena',9);consequence(x,'La aldea alimenta a los lobos lejos de las casas. Hay paz, aunque los cazadores protestan.');},{food:20})]},
  {id:'refugees',category:'Población',title:'Familias en el camino',speaker:'Irena Moss',text:'Cinco personas llegan desde una aldea incendiada. Traen poco equipaje y mucho miedo. Piden quedarse antes de que anochezca.',when:s=>s.day>7&&s.day<130&&!trait(s,'refugeesSeen'),weight:5,options:s=>[
    option('accept','Abrir las puertas','+5 habitantes, −20 comida; Irena agradecida.',x=>{modify(x,{population:5,food:-20,morale:4,prosperity:3});x.flags.refugeesSeen='welcomed';trust(x,'irena',12);schedule(x,'newcomers',7);consequence(x,'Cinco refugiados reciben un techo. Ahora también dependen de tus cosechas.');},{food:20}),
    option('supplies','Dar víveres para el viaje','−12 comida, +reputación interna.',x=>{modify(x,{food:-12,morale:2});x.flags.refugeesSeen='aided';trust(x,'elara',4);consequence(x,'Las familias siguen su camino con provisiones. Elara pregunta si habría espacio para todos.');},{food:12}),
    option('turn','Cerrar las puertas','+defensa, −moral; Irena resentida.',x=>{modify(x,{security:3,morale:-10});x.flags.refugeesSeen='refused';trust(x,'irena',-18);consequence(x,'Cierras las puertas. La aldea está a salvo esta noche, pero el silencio pesa más que el frío.');})]},
  {id:'newcomers',category:'Consecuencia',title:'Los recién llegados reclaman voz',speaker:'Elara Thorn',text:'Tras una semana trabajando los campos, las familias acogidas piden participar en las decisiones y tener sus propias tierras.',when:s=>trait(s,'refugeesSeen')==='welcomed',weight:0,options:s=>[
    option('plots','Conceder parcelas','−12 madera, +prosperidad y moral.',x=>{modify(x,{wood:-12,prosperity:8,morale:5});trust(x,'elara',8);x.flags.inclusiveVillage=true;consequence(x,'Las nuevas familias construyen huertos. Bramwood es un poco más grande y menos homogénea.');},{wood:12}),
    option('labor','Pedir trabajo antes de votar','+15 madera, −moral, menos confianza.',x=>{modify(x,{wood:15,morale:-7});trust(x,'irena',-10);x.flags.laborDispute=true;schedule(x,'labor_strike',6);consequence(x,'Los refugiados aceptan trabajar, pero la plaza se llena de murmullos.');})]},
  {id:'labor_strike',category:'Consecuencia',title:'Herramientas abandonadas',speaker:'Irena Moss',text:'Las familias recién llegadas no aparecen en los campos. Dicen que Bramwood les exige obediencia pero no les ofrece pertenencia.',when:s=>trait(s,'laborDispute'),weight:0,options:s=>[
    option('compromise','Reconocer su lugar en el consejo','+moral, −coronas.',x=>{modify(x,{gold:-12,morale:8,prosperity:3});trust(x,'irena',9);consequence(x,'La protesta acaba con un pacto. Nadie gana del todo, pero vuelven a trabajar.');},{gold:12}),
    option('suppress','Disolver la protesta','+defensa, −moral.',x=>{modify(x,{security:6,morale:-14,prosperity:-3});trust(x,'toman',4);trust(x,'irena',-13);consequence(x,'La guardia disuelve la protesta. Bramwood trabaja en silencio.');})]},
  {id:'bandits',category:'Amenaza',title:'Un mensaje clavado al puente',speaker:'Toman Vale',text:'Una banda exige 25 coronas para dejar pasar a los viajeros. Han contado vuestros graneros y saben que no hay murallas.',when:s=>s.day>11&&!trait(s,'banditsSeen'),weight:5,options:s=>[
    option('pay','Pagar una vez','−25 coronas; evita el ataque inmediato.',x=>{modify(x,{gold:-25,security:-2});x.flags.banditsSeen='paid';schedule(x,'bandits_return',12);consequence(x,'Pagas el tributo. Los bandidos se marchan sonrientes; conocen ahora el precio de vuestra paz.');},{gold:25}),
    option('fight','Rechazar la amenaza','Asalto en tres días; importa la defensa.',x=>{x.flags.banditsSeen='defied';modify(x,{morale:4});schedule(x,'raid',3);trust(x,'toman',10);consequence(x,'Bramwood desafía a los bandidos. Toman pide preparar guardias y provisiones antes del ataque.');}),
    option('negotiate','Enviar a Maeve a negociar','−10 coronas; riesgo, posible acuerdo.',x=>{modify(x,{gold:-10});trust(x,'maeve',9);x.flags.banditsSeen='negotiated';schedule(x,'bandits_terms',4);consequence(x,'Maeve sale con diez coronas y una oferta que no ha querido explicar en público.');},{gold:10})]},
  {id:'bandits_return',category:'Consecuencia',title:'El tributo ya es costumbre',speaker:'Maeve Reed',text:'Los bandidos vuelven. Esta vez piden comida además de dinero: creen que Bramwood siempre pagará.',when:s=>trait(s,'banditsSeen')==='paid',weight:0,options:s=>[
    option('pay_again','Comprar un mes de calma','−28 comida, −18 coronas.',x=>{modify(x,{food:-28,gold:-18,morale:-10});x.flags.banditTax=true;consequence(x,'Vuelves a pagar. La tranquilidad se ha convertido en una deuda.');},{food:28,gold:18}),
    option('ambush','Tender una emboscada','Resultado condicionado por defensa.',x=>resolveRaid(x,true))]},
  {id:'bandits_terms',category:'Consecuencia',title:'La oferta de Maeve',speaker:'Maeve Reed',text:'Los bandidos permitirían comercio libre a cambio de una parte de los peajes. Maeve insiste en que un pacto no tiene por qué ser rendición.',when:s=>trait(s,'banditsSeen')==='negotiated',weight:0,options:s=>[
    option('deal','Firmar el pacto','+prosperidad y coronas, −moral.',x=>{modify(x,{gold:20,prosperity:7,morale:-6,security:-5});x.flags.tradeWithBandits=true;consequence(x,'Los comerciantes vuelven al camino. A la entrada, un bandido recoge los peajes.');}),
    option('betray','Arrestar al emisario','+defensa; asalto en tres días.',x=>{modify(x,{security:5,morale:3});schedule(x,'raid',3);consequence(x,'El emisario es apresado. Los bandidos lo sabrán al caer la noche.');})]},
  {id:'raid',category:'Consecuencia',title:'Antorchas junto al puente',speaker:'Toman Vale',text:s=>`Los bandidos llegan de noche. La defensa de Bramwood es ${s.stats.security}/100. ¿Ordenas resistir en las puertas o proteges solo a las familias?`,when:s=>true,weight:0,options:s=>[
    option('hold','Defender el puente','La defensa decidirá las pérdidas.',x=>resolveRaid(x,false)),
    option('evacuate','Replegarse a las casas','Salvar vidas, sacrificar recursos.',x=>{modify(x,{food:-25,wood:-25,gold:-12,security:-8,morale:-3});trust(x,'irena',7);consequence(x,'Retiras a las familias del puente. Los asaltantes saquean almacenes, pero nadie muere.');})]},
  {id:'sickness',category:'Salud',title:'Fiebre en los dormitorios',speaker:'Irena Moss',text:'Tres trabajadores llevan dos días con fiebre. Irena sospecha del agua del pozo; aislarlos retrasará el trabajo en los campos.',when:s=>s.day>6&&(!trait(s,'sicknessSeen')||s.day-s.flags.sicknessSeen>65),weight:4,options:s=>[
    option('treat','Dar prioridad a la enfermería','−4 hierbas; mejora el ánimo.',x=>{modify(x,{herbs:-4,morale:4});x.flags.sicknessSeen=x.day;trust(x,'irena',10);consequence(x,'Irena trata a los enfermos y ordena hervir el agua. La fiebre retrocede.');},{herbs:4}),
    option('isolate','Aislar los dormitorios','−14 comida, −moral; sin consumir hierbas.',x=>{modify(x,{food:-14,morale:-4});x.flags.sicknessSeen=x.day;consequence(x,'El aislamiento contiene el brote, pero los vecinos temen acercarse a los enfermos.');},{food:14}),
    option('work','Que sigan trabajando','Ganas recursos; enfermedad más peligrosa.',x=>{modify(x,{food:17,morale:-11});x.flags.sicknessSeen=x.day;schedule(x,'fever_spreads',4);trust(x,'irena',-16);consequence(x,'Los enfermos vuelven al campo. Cuatro días después, habrá que contar el coste.');})]},
  {id:'fever_spreads',category:'Consecuencia',title:'La fiebre se extiende',speaker:'Irena Moss',text:'La enfermedad alcanza nuevas casas. Irena señala el día que se ordenó trabajar a los primeros enfermos.',when:s=>true,weight:0,options:s=>[
    option('fullcare','Abrir los almacenes medicinales','−6 hierbas; reduce el daño.',x=>{modify(x,{herbs:-6,morale:-5});wound(x,'osric',-15);consequence(x,'Con las últimas hierbas, Irena salva a varios enfermos. Osric sigue débil.');},{herbs:6}),
    option('wait','Aguardar','Riesgo de perder población.',x=>{modify(x,{population:-2,morale:-15,prosperity:-5});wound(x,'osric',-50);consequence(x,'La fiebre cede demasiado tarde. Se cavan dos tumbas junto al sendero.');})]},
  {id:'merchant',category:'Comercio',title:'Una caravana se detiene',speaker:'Maeve Reed',text:'Un grupo de mercaderes ofrece grano a cambio de madera. Uno de ellos también vende un cofre de suministros médicos.',when:s=>s.day>3,weight:5,cooldown:25,options:s=>[
    option('grain','Comprar sacos de grano','−23 madera, +35 comida.',x=>{modify(x,{wood:-23,food:35});trust(x,'maeve',4);consequence(x,'La caravana entrega cereal. Los almacenes huelen a cosecha nueva.');},{wood:23}),
    option('medicine','Comprar remedios','−20 coronas, +9 hierbas.',x=>{modify(x,{gold:-20,herbs:9});trust(x,'irena',4);consequence(x,'Maeve consigue un cofre de remedios y ungüentos.');},{gold:20}),
    option('sell','Vender producción local','−32 madera, +29 coronas.',x=>{modify(x,{wood:-32,gold:29,prosperity:3});consequence(x,'El comercio trae nuevas monedas a Bramwood.');},{wood:32})]},
  {id:'harvest',category:'Oportunidad',title:'Las espigas se inclinan',speaker:'Elara Thorn',text:'El tiempo ha favorecido los campos. Se puede recoger pronto o dejar madurar la cosecha con riesgo de tormenta.',when:s=>seasonOf(s.day)==='Otoño',weight:4,cooldown:35,options:s=>[
    option('early','Cosechar de inmediato','+33 comida, seguridad alimentaria.',x=>{modify(x,{food:33,morale:3});consequence(x,'Los graneros reciben una cosecha segura, aunque no la más abundante.');}),
    option('late','Esperar unos días','Posible cosecha excelente o daños.',x=>{if(rand(x)<.62){modify(x,{food:59,prosperity:4});consequence(x,'El sol aguanta. Bramwood disfruta la cosecha más abundante en años.');}else{modify(x,{food:-12,morale:-7});consequence(x,'Una tormenta rompe los tallos. La espera ha salido cara.');}})]},
  {id:'storm',category:'Clima',title:'Nubes sobre las techumbres',speaker:'Osric Flint',text:'Viento y lluvia azotan los tejados. Osric pide madera para reforzar las casas viejas antes de que oscurezca.',when:s=>true,weight:3,cooldown:20,options:s=>[
    option('repair','Reforzar tejados','−18 madera, +moral.',x=>{modify(x,{wood:-18,morale:3});trust(x,'osric',6);consequence(x,'La tormenta golpea fuerte, pero la gente duerme bajo techo.');},{wood:18}),
    option('wait','Esperar a que escampe','Riesgo de perder provisiones.',x=>{const loss=10+Math.floor(rand(x)*18);modify(x,{food:-loss,morale:-5});consequence(x,`Dos tejados ceden y se pierden ${loss} unidades de comida.`);})]},
  {id:'forest',category:'Misterio',title:'Las señales del bosque viejo',speaker:'Bran Hollow',text:'Bran asegura que los árboles marcados no deben talarse. Osric dice que el invierno no espera supersticiones.',when:s=>s.day>15&&!trait(s,'forestResolved'),weight:4,options:s=>[
    option('listen','Respetar el bosque viejo','−12 madera, +moral; Bran agradecido.',x=>{modify(x,{wood:-12,morale:7});trust(x,'bran',16);x.flags.forestResolved='respected';schedule(x,'forest_gift',14);consequence(x,'Se trazan límites nuevos para la tala. Bran lleva flores a una piedra cubierta de musgo.');},{wood:12}),
    option('cut','Talar sin excepciones','+38 madera, −moral; Bran disgustado.',x=>{modify(x,{wood:38,morale:-8});trust(x,'bran',-20);trust(x,'osric',8);x.flags.forestResolved='cut';schedule(x,'forest_erosion',12);consequence(x,'Osric obtiene madera para un mes, pero el arroyo empieza a enturbiarse.');})]},
  {id:'forest_gift',category:'Consecuencia',title:'Un sendero entre las raíces',speaker:'Bran Hollow',text:'Bran conduce a la aldea hasta una arboleda con plantas medicinales, intacta porque evitaste talar los árboles viejos.',when:s=>trait(s,'forestResolved')==='respected',weight:0,options:s=>[
    option('gather','Recolectar con cuidado','+11 hierbas y respeto por Bran.',x=>{modify(x,{herbs:11});trust(x,'bran',8);consequence(x,'Se recogen hierbas sin dañar las raíces. El bosque ha devuelto el favor.');})]},
  {id:'forest_erosion',category:'Consecuencia',title:'El arroyo trae barro',speaker:'Osric Flint',text:'Al talar la pendiente, la lluvia ha lavado la tierra. El agua del pozo está sucia y parte del huerto, enterrada.',when:s=>trait(s,'forestResolved')==='cut',weight:0,options:s=>[
    option('replant','Replantar la ladera','−25 madera, +moral.',x=>{modify(x,{wood:-25,morale:7,prosperity:2});trust(x,'bran',5);consequence(x,'Replantar lleva tiempo. El agua vuelve a aclararse lentamente.');},{wood:25}),
    option('ditch','Abrir una zanja rápida','−16 comida, −moral.',x=>{modify(x,{food:-16,morale:-6});consequence(x,'La zanja desvía el barro del pozo, pero destruye un bancal.');},{food:16})]},
  {id:'mine',category:'Exploración',title:'Una entrada detrás de las zarzas',speaker:'Osric Flint',text:'Unos niños encuentran una vieja galería en la colina. Dentro hay vetas de piedra y restos de herramientas oxidadas.',when:s=>s.day>28&&!trait(s,'mineResolved'),weight:3,options:s=>[
    option('explore','Enviar una cuadrilla','−9 comida; posible recompensa importante.',x=>{modify(x,{food:-9});x.flags.mineResolved='explored';schedule(x,'mine_result',5);consequence(x,'Seis vecinos bajan con lámparas. La entrada queda acordonada hasta que vuelvan.');},{food:9}),
    option('seal','Cerrar la entrada','−10 madera, +seguridad.',x=>{modify(x,{wood:-10,security:5});x.flags.mineResolved='sealed';consequence(x,'Osric clava tablas sobre la entrada. Nadie sabe qué había dentro.');},{wood:10})]},
  {id:'mine_result',category:'Consecuencia',title:'Ecos de la mina',speaker:'Osric Flint',text:'La cuadrilla vuelve con piedra y un mapa incompleto. Uno de los túneles podría derrumbarse si siguen cavando.',when:s=>trait(s,'mineResolved')==='explored',weight:0,options:s=>[
    option('stop','Quedarse con lo encontrado','+40 piedra; sin asumir más riesgos.',x=>{modify(x,{stone:40,morale:2});consequence(x,'Los mineros regresan con piedra suficiente para construir. La galería queda abandonada.');}),
    option('deeper','Seguir hasta el fondo','Riesgo de heridos, gran premio.',x=>{if(rand(x)<.5){modify(x,{stone:75,gold:35});consequence(x,'¡Hallan un almacén olvidado, lleno de piedra y monedas antiguas!');}else{modify(x,{stone:24,population:-1,morale:-14});consequence(x,'Un derrumbe mata a un trabajador. El botín apenas compensa la pérdida.');}})]},
  {id:'festival',category:'Vida cotidiana',title:'La plaza pide una fiesta',speaker:'Elara Thorn',text:'Tras semanas de trabajo, los vecinos piden música y pan compartido. Algunos creen que las provisiones deberían reservarse para el frío.',when:s=>s.day>12,weight:4,cooldown:27,options:s=>[
    option('feast','Celebrar una fiesta','−22 comida, −9 coronas; +moral.',x=>{modify(x,{food:-22,gold:-9,morale:15,prosperity:3});trust(x,'elara',7);consequence(x,'La plaza se ilumina con faroles. Durante una noche nadie cuenta las monedas.');},{food:22,gold:9}),
    option('humble','Reunión modesta','−8 comida; +moral.',x=>{modify(x,{food:-8,morale:6});consequence(x,'Vecinos y niños bailan en la plaza. La comida alcanza para todos.');},{food:8}),
    option('cancel','Seguir trabajando','−moral, +comida.',x=>{modify(x,{food:7,morale:-7});consequence(x,'No hay fiesta. Los vecinos vuelven al trabajo sin protestar en voz alta.');})]},
  {id:'lord',category:'Política',title:'Un mensajero del conde',speaker:'Elara Thorn',text:'El conde de la región quiere registrar Bramwood. Ofrece reconocimiento a cambio de impuestos y obediencia.',when:s=>s.day>42&&!trait(s,'lordResolved'),weight:4,options:s=>[
    option('charter','Aceptar la carta','−35 coronas; +prosperidad, nuevas obligaciones.',x=>{modify(x,{gold:-35,prosperity:12,security:4});x.flags.lordResolved='charter';trust(x,'elara',10);schedule(x,'lord_tax',16);consequence(x,'Bramwood obtiene una carta sellada. Se le reconoce un lugar en los caminos, pero ya no responde solo ante sí misma.');},{gold:35}),
    option('free','Rechazar el juramento','+moral; tensión con el conde.',x=>{modify(x,{morale:9,security:-7});x.flags.lordResolved='free';schedule(x,'lord_pressure',12);consequence(x,'El mensajero parte sin firma. Bramwood conserva su independencia, aunque el conde ya conoce su nombre.');})]},
  {id:'lord_tax',category:'Consecuencia',title:'El precio del sello',speaker:'Maeve Reed',text:'El conde envía un recaudador. La protección prometida no es gratuita.',when:s=>trait(s,'lordResolved')==='charter',weight:0,options:s=>[
    option('tax','Pagar el impuesto','−35 coronas; mantener la carta.',x=>{modify(x,{gold:-35,security:7});consequence(x,'El recaudador se marcha. La carta del conde sigue vigente.');},{gold:35}),
    option('refuse','Cuestionar el impuesto','+moral, −prosperidad, fin del pacto.',x=>{modify(x,{morale:5,prosperity:-8,security:-5});x.flags.lordResolved='free';consequence(x,'Bramwood protesta ante el conde. El reconocimiento queda suspendido.');})]},
  {id:'lord_pressure',category:'Consecuencia',title:'El camino se estrecha',speaker:'Maeve Reed',text:'Soldados del conde inspeccionan las mercancías. Los comerciantes temen perder clientes por la negativa de Bramwood a jurar lealtad.',when:s=>trait(s,'lordResolved')==='free',weight:0,options:s=>[
    option('diplomacy','Enviar regalos','−25 coronas; +prosperidad.',x=>{modify(x,{gold:-25,prosperity:6});trust(x,'maeve',6);consequence(x,'Un regalo abre las puertas del diálogo sin ceder el autogobierno.');},{gold:25}),
    option('resist','Aguantar el bloqueo','−prosperidad, +moral.',x=>{modify(x,{prosperity:-10,morale:9});consequence(x,'El camino pierde comercio, pero la plaza aplaude la independencia.');})]},
  {id:'winter_help',category:'Clima',title:'La primera helada',speaker:'Irena Moss',text:'Los caminos amanecen blancos. Quienes duermen cerca de las paredes pasan frío; las reservas deberán durar hasta la primavera.',when:s=>seasonOf(s.day)==='Invierno',weight:5,cooldown:38,options:s=>[
    option('fuel','Repartir leña','−27 madera, +moral.',x=>{modify(x,{wood:-27,morale:10});trust(x,'irena',6);consequence(x,'El humo de las chimeneas dibuja una franja sobre Bramwood.');},{wood:27}),
    option('shelter','Abrir edificios comunes','−8 comida, +moral, −prosperidad.',x=>{modify(x,{food:-8,morale:6,prosperity:-3});consequence(x,'Las familias se reúnen en la sala del consejo para pasar las noches frías.');},{food:8}),
    option('endure','Ahorrar los suministros','−moral, riesgo de enfermedad.',x=>{modify(x,{morale:-12});wound(x,'bran',-18);consequence(x,'Se ahorra la leña. Bran tiembla de frío en su casa.');})]},
  {id:'dispute',category:'Personajes',title:'Dos vecinos y un límite',speaker:'Elara Thorn',text:'Osric acusa a Maeve de haber ocupado parte de su patio con un almacén. Ambos exigen que el consejo tome partido.',when:s=>s.day>16,weight:3,cooldown:50,options:s=>[
    option('osric','Dar la razón a Osric','+madera; Maeve pierde confianza.',x=>{modify(x,{wood:16,morale:-2});trust(x,'osric',12);trust(x,'maeve',-13);consequence(x,'El almacén se retira. Maeve deja de hablar con Osric durante semanas.');}),
    option('maeve','Dar la razón a Maeve','+coronas; Osric pierde confianza.',x=>{modify(x,{gold:18,prosperity:2});trust(x,'maeve',12);trust(x,'osric',-13);consequence(x,'El almacén permanece. Osric dice que las monedas pesan más que sus derechos.');}),
    option('mediate','Pagar una mediación','−12 coronas, +moral; ambos ceden.',x=>{modify(x,{gold:-12,morale:7});trust(x,'osric',4);trust(x,'maeve',4);consequence(x,'La plaza llega a un acuerdo imperfecto. Nadie sale humillado.');},{gold:12})]},
  {id:'outpost',category:'Oportunidad',title:'Una torre abandonada',speaker:'Toman Vale',text:'Toman encuentra una pequeña torre derruida sobre la loma. Repararla permitiría ver llegar caravanas y amenazas.',when:s=>s.day>30&&!trait(s,'outpostSeen'),weight:3,options:s=>[
    option('repair','Reparar la torre de la loma','−32 madera, −12 piedra; +defensa.',x=>{modify(x,{wood:-32,stone:-12,security:16});x.flags.outpostSeen='repaired';trust(x,'toman',8);consequence(x,'Una nueva señal de humo puede verse desde Bramwood. Los caminos resultan más seguros.');},{wood:32,stone:12}),
    option('ignore','Dejarla como está','Sin coste; oportunidad perdida.',x=>{x.flags.outpostSeen='ignored';consequence(x,'La torre sigue en ruinas. Los viajeros aún deben confiar en su propia vista.');})]}
];
const EVENTS_BY_ID=Object.fromEntries(EVENTS.map(e=>[e.id,e]));
function resolveRaid(s,ambush){
  const bonus=(ambush?8:0)+(s.buildings.watch*3)+(s.buildings.palisade*6);
  const defensive=s.stats.security+bonus+Math.floor(rand(s)*15);
  if(defensive>=62){modify(s,{security:-5,morale:10,gold:18});trust(s,'toman',9);s.flags.raidWon=true;consequence(s,'La guardia rechaza el asalto. Los bandidos huyen dejando botín y una reputación inesperada.');}
  else if(defensive>=38){modify(s,{security:-12,food:-15,wood:-12,morale:-2});wound(s,'toman',-18);consequence(s,'El puente resiste, pero arden un cobertizo y parte de la despensa. Toman sale herido.');}
  else{const deaths=1+Math.floor(rand(s)*3);modify(s,{population:-deaths,food:-35,wood:-22,gold:-17,security:-18,morale:-18});wound(s,'toman',-35);consequence(s,`El puente cae. Bramwood pierde ${deaths} habitantes y buena parte de sus reservas.`);}
}
export function newGame(seed=Date.now()){
  const s={version:VERSION,seed:Math.floor(seed)>>>0,day:1,population:18,resources:{food:95,wood:105,stone:24,gold:50,herbs:8},stats:{morale:61,security:20,prosperity:25},buildings:{farm:1,lumber:1,quarry:0,watch:0,granary:0,market:0,houses:3,infirmary:0,palisade:0},focus:'harvest',edict:'normal',actions:2,notables:NOTABLES.map(p=>({...p,health:100,alive:true})),flags:{},seen:{},queued:[],currentEvent:'wolves',journal:[],lastOutcome:null,history:[],alive:true,ending:null};
  log(s,'Una aldea entre los árboles','Dieciocho personas levantan Bramwood. Hay madera en abundancia, pero casi ninguna defensa. Lo que ocurra ahora quedará escrito.');
  snapshot(s);return s;
}
function snapshot(s){s.history.push({day:s.day,food:s.resources.food,morale:s.stats.morale,security:s.stats.security,population:s.population});s.history=s.history.slice(-80);}
export function capacity(s){return s.buildings.houses*6;}
export function foodCapacity(s){return 120+s.buildings.granary*90;}
export function costsAvailable(s,cost){return Object.entries(cost).every(([k,v])=>s.resources[k]>=v);}
export function eventInfo(s){if(!s.currentEvent)return null;const e=EVENTS_BY_ID[s.currentEvent];if(!e)return null;return {id:e.id,title:e.title,category:e.category,speaker:e.speaker,text:typeof e.text==='function'?e.text(s):e.text,choices:e.options(s).map(o=>({id:o.id,label:o.label,summary:o.summary,cost:o.cost,affordable:costsAvailable(s,o.cost)}))};}
export function decide(s,choiceId){if(!s.alive)return {ok:false,message:'La partida ha terminado.'};const event=EVENTS_BY_ID[s.currentEvent];if(!event)return {ok:false,message:'No hay evento pendiente.'};const choice=event.options(s).find(o=>o.id===choiceId);if(!choice)return {ok:false,message:'Esa decisión no existe.'};if(!costsAvailable(s,choice.cost))return {ok:false,message:'No hay suficientes recursos para esa decisión.'};s.seen[event.id]=s.day;choice.apply(s);s.currentEvent=null;checkStatus(s);return {ok:true,message:s.lastOutcome?.text||'Decisión aplicada.'};}
export function construct(s,id){const b=BUILDINGS[id];if(!b)return {ok:false,message:'Edificio desconocido.'};if(!s.alive||s.currentEvent)return {ok:false,message:'Resuelve antes el evento pendiente.'};if(s.actions<1)return {ok:false,message:'No quedan órdenes del consejo hoy.'};if(s.buildings[id]>=b.max)return {ok:false,message:'Has alcanzado el máximo de este edificio.'};if(!costsAvailable(s,b.cost))return {ok:false,message:'No tienes suficientes materiales.'};modify(s,Object.fromEntries(Object.entries(b.cost).map(([k,v])=>[k,-v])));s.buildings[id]++;s.actions--;if(id==='watch')modify(s,{security:10});if(id==='palisade')modify(s,{security:23});if(id==='market')modify(s,{prosperity:5});if(id==='infirmary')modify(s,{morale:3});capResources(s);log(s,`Construido: ${b.name}`,`El consejo invierte en ${b.name.toLowerCase()}.`,'build');checkStatus(s);return {ok:true,message:`${b.name} construido.`};}
export function setFocus(s,id){if(!FOCI[id])return {ok:false,message:'Prioridad no válida.'};if(s.currentEvent||!s.alive)return {ok:false,message:'Resuelve primero el evento.'};if(s.actions<1)return {ok:false,message:'No quedan órdenes hoy.'};if(s.focus===id)return {ok:false,message:'Ya es la prioridad elegida.'};s.focus=id;s.actions--;log(s,'Nueva prioridad',`El consejo concentra sus esfuerzos en ${FOCI[id].name.toLowerCase()}.`,'decision');return {ok:true,message:`Prioridad: ${FOCI[id].name}.`};}
export function setEdict(s,id){if(!EDICTS[id])return {ok:false,message:'Edicto no válido.'};if(s.currentEvent||!s.alive)return {ok:false,message:'Resuelve primero el evento.'};if(s.actions<1)return {ok:false,message:'No quedan órdenes hoy.'};if(s.edict===id)return {ok:false,message:'Ya está en vigor.'};s.edict=id;s.actions--;log(s,'Edicto alimentario',`Se decreta: ${EDICTS[id].name.toLowerCase()}.`,'decision');return {ok:true,message:`En vigor: ${EDICTS[id].name}.`};}
export function dailyEstimate(s){
  const season=seasonOf(s.day);const farmFactor=season==='Invierno'?.18:season==='Otoño'?.65:season==='Primavera'?.85:1.15;
  const foodProduction=Math.round(s.buildings.farm*9*farmFactor+(s.focus==='harvest'?8:0));
  const consumption=Math.ceil(s.population*.68*(s.edict==='sparse'?.72:s.edict==='generous'?1.3:1));
  const woodProduction=s.buildings.lumber*6+(s.focus==='timber'?8:0);
  const stoneProduction=s.buildings.quarry*4;
  const goldProduction=s.buildings.market*5+(s.focus==='trade'?4:0)-(s.focus==='harvest'?1:0)-(s.focus==='guard'?2:0)-Math.floor(s.population/12)-(s.flags.banditTax?2:0);
  return {food:foodProduction-consumption,wood:woodProduction,stone:stoneProduction,gold:goldProduction,consumption};
}
export function riskLevel(s){const threat=100-s.stats.security+(seasonOf(s.day)==='Invierno'?12:0)+(s.population>capacity(s)?10:0);return threat>85?'Crítico':threat>60?'Elevado':threat>35?'Moderado':'Bajo';}
function nextEvent(s){
  const due=s.queued.filter(q=>q.due<=s.day).sort((a,b)=>a.due-b.due);
  if(due.length){const chosen=due[0];s.queued.splice(s.queued.indexOf(chosen),1);return chosen.id;}
  // Obligamos a tener una pausa entre decisiones para que el tiempo avance.
  if(rand(s)>.57)return null;
  const pool=[];
  for(const ev of EVENTS){if(ev.weight<=0)continue;if(ev.when&&!ev.when(s))continue;const last=s.seen[ev.id];if(last&&(ev.cooldown===undefined||s.day-last<ev.cooldown))continue;for(let i=0;i<ev.weight;i++)pool.push(ev.id);}
  return pool.length?pick(s,pool):null;
}
function checkStatus(s){
  if(s.population<=0){s.alive=false;s.ending='Bramwood quedó vacía. Las casas permanecen, pero nadie conserva sus historias.';log(s,'Fin de la aldea',s.ending,'loss');}
  else if(s.stats.morale<=0){s.alive=false;s.ending='Bramwood se dispersó. La comunidad dejó de creer en el consejo.';log(s,'Fin de la aldea',s.ending,'loss');}
}
function dailyTurn(s){
  s.day++;
  const estimate=dailyEstimate(s);
  modify(s,{food:estimate.food,wood:estimate.wood,stone:estimate.stone,gold:estimate.gold});
  const season=seasonOf(s.day);
  if(s.focus==='guard')modify(s,{security:2});
  else if(s.buildings.watch>0)modify(s,{security:Math.min(2,s.buildings.watch)});
  else if(s.day%4===0)modify(s,{security:-1});
  if(s.focus==='trade')modify(s,{prosperity:1});
  if(s.edict==='sparse')modify(s,{morale:-1});
  if(s.edict==='generous')modify(s,{morale:1});
  if(s.population>capacity(s))modify(s,{morale:-2});
  if(s.resources.food<10)modify(s,{morale:-3});
  if(s.resources.food===0){modify(s,{morale:-6});if(rand(s)<.22){modify(s,{population:-1});log(s,'El hambre llega a las casas','Una persona no sobrevive a las privaciones.','loss');}}
  if(season==='Invierno'&&s.resources.wood<12){modify(s,{morale:-2});if(rand(s)<.13)wound(s,pick(s,s.notables).id,-8);}
  if(s.resources.food>65&&s.stats.morale>60&&s.population<capacity(s)&&rand(s)<.09){modify(s,{population:1});log(s,'Una nueva vida','Una familia recibe a un recién nacido.','world');}
  for(const p of s.notables){if(p.alive&&p.health<100){p.health=Math.min(100,p.health+(s.buildings.infirmary?6:2));}}
  if(dayOfSeason(s.day)===1){log(s,`Comienza ${season.toLowerCase()}`,`Año ${yearOf(s.day)}. Las estaciones transforman cosechas, reservas y necesidades.`,'world');}
  s.actions=2;
  checkStatus(s);snapshot(s);
  if(s.alive)s.currentEvent=nextEvent(s);
}
export function advance(s,days=1){if(!s.alive)return {ok:false,message:'La partida ha terminado.'};if(s.currentEvent)return {ok:false,message:'Primero debes decidir qué hacer con el evento.'};const steps=clamp(Math.floor(days)||1,1,10);let progressed=0;while(progressed<steps&&s.alive&&!s.currentEvent){dailyTurn(s);progressed++;}return {ok:true,progressed,interrupted:!!s.currentEvent,message:s.currentEvent?'Un acontecimiento requiere tu decisión.':`${progressed} día(s) transcurridos.`};}
export function objective(s){if(!s.alive)return {title:'Bramwood ha caído',detail:s.ending,progress:100};if(s.day<19)return {title:'Echar raíces',detail:'Sobrevive a los primeros 18 días y asegura comida para la aldea.',progress:Math.round(s.day/19*100)};if(s.day<55)return {title:'Resistir el primer invierno',detail:'Prepara comida y leña. El invierno comienza el día 55.',progress:Math.round((s.day-18)/37*100)};if(s.day<91)return {title:'Del claro al asentamiento',detail:'Llega al día 91 con al menos 20 habitantes y 40 puntos de moral.',progress:Math.round((s.day-54)/37*100)};if(s.day<145)return {title:'Forjar una comunidad duradera',detail:'Mantén viva la aldea hasta el inicio del tercer año.',progress:Math.round((s.day-90)/55*100)};return {title:'La historia sigue',detail:'Tu asentamiento sobrevive. Construye tu legado: fortaleza, comercio o comunidad.',progress:100};}
export function achievements(s){return [
  {id:'first_winter',title:'Primer invierno',done:s.day>=73},
  {id:'village',title:'Una pequeña villa',done:s.population>=25},
  {id:'secure',title:'La guardia vigila',done:s.stats.security>=75},
  {id:'wealth',title:'Riqueza compartida',done:s.resources.gold>=180},
  {id:'medicine',title:'Cuidado mutuo',done:s.buildings.infirmary>=1},
  {id:'free',title:'Tierra libre',done:s.flags.lordResolved==='free'},
  {id:'charter',title:'Bajo el sello',done:s.flags.lordResolved==='charter'},
  {id:'wolf',title:'Pacto con el bosque',done:!!s.flags.wolfSanctuary}
];}
export function validateSave(raw){
  if(!raw||typeof raw!=='object'||raw.version!==VERSION)throw Error('Guardado incompatible con esta versión de Bramwood.');
  if(!Number.isInteger(raw.day)||raw.day<1||raw.day>1000000||!Number.isInteger(raw.population)||raw.population<0||raw.population>100000)throw Error('Partida dañada.');
  if(!Number.isInteger(raw.seed)||raw.seed<0||raw.seed>4294967295)throw Error('Semilla de partida inválida.');
  if(!raw.resources||!raw.stats||!raw.buildings||!Array.isArray(raw.notables)||!Array.isArray(raw.journal)||!Array.isArray(raw.queued)||!Array.isArray(raw.history))throw Error('Faltan datos en la partida.');
  for(const k of Object.keys(RESOURCE_NAMES)){if(!Number.isFinite(raw.resources[k])||raw.resources[k]<0||raw.resources[k]>1e8)throw Error('Recurso inválido: '+k);}
  for(const k of ['morale','security','prosperity']){if(!Number.isFinite(raw.stats[k])||raw.stats[k]<0||raw.stats[k]>100)throw Error('Estado inválido: '+k);}
  for(const [id,b] of Object.entries(BUILDINGS)){if(!Number.isInteger(raw.buildings[id])||raw.buildings[id]<0||raw.buildings[id]>b.max)throw Error('Construcción inválida: '+id);}
  if(!Number.isInteger(raw.actions)||raw.actions<0||raw.actions>2)throw Error('Órdenes inválidas.');
  if(raw.currentEvent&&!EVENTS_BY_ID[raw.currentEvent])throw Error('Evento desconocido.');
  if(!FOCI[raw.focus]||!EDICTS[raw.edict])throw Error('Política inválida.');
  if(!raw.flags||typeof raw.flags!=='object'||!raw.seen||typeof raw.seen!=='object')throw Error('Faltan datos de los acontecimientos.');
  if(raw.notables.length>50||raw.journal.length>300||raw.history.length>200||raw.queued.length>100)throw Error('La partida excede sus límites.');
  for(const n of raw.notables){if(!n||typeof n.name!=='string'||n.name.length>150||typeof n.role!=='string'||n.role.length>150||!Number.isFinite(n.trust)||n.trust<0||n.trust>100||!Number.isFinite(n.health)||n.health<0||n.health>100||typeof n.alive!=='boolean')throw Error('Habitante inválido.');}
  for(const h of raw.history){if(!h||!Number.isInteger(h.day)||!Number.isFinite(h.food)||h.food<0||!Number.isFinite(h.morale)||h.morale<0||h.morale>100||!Number.isFinite(h.security)||!Number.isFinite(h.population))throw Error('Historial inválido.');}
  for(const j of raw.journal){if(!j||!Number.isInteger(j.day)||typeof j.title!=='string'||typeof j.text!=='string'||j.title.length>300||j.text.length>2500)throw Error('Crónica inválida.');}
  for(const q of raw.queued){if(!q||!EVENTS_BY_ID[q.id]||!Number.isInteger(q.due)||q.due<1)throw Error('Consecuencia pendiente inválida.');}
  return deepCopy(raw);
}
export function endingDescription(s){if(!s.alive)return s.ending;if(s.stats.security>=75)return 'Bramwood, la guardiana del bosque: una aldea que aprendió a defenderse.';if(s.stats.prosperity>=75)return 'Bramwood, el cruce de caminos: el comercio hizo crecer una tierra humilde.';if(s.stats.morale>=75)return 'Bramwood, hogar de todos: una comunidad unida que logró resistir.';return 'Bramwood, una aldea tenaz: su historia todavía se está escribiendo.';}
export const EVENT_COUNT=EVENTS.length;
