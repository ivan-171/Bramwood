(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BramwoodContent=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const R=(key,delta)=>({type:'resource',key,delta}), S=(key,delta)=>({type:'stat',key,delta}), F=(key,value=true)=>({type:'flag',key,value}), FI=(key,delta=1)=>({type:'flagInc',key,delta}), FA=(key,delta)=>({type:'faction',key,delta}), POP=delta=>({type:'pop',delta}), B=(id,name,desc,level=1)=>({type:'buildingAdd',id,building:{name,desc,level}}), H=delta=>({type:'housing',delta}), PM=(id,status)=>({type:'personStatus',id,status}), PK=(id,cause)=>({type:'personKill',id,cause}), MS=id=>({type:'milestone',id});
const n=(id,delay=1,conditions)=>({id,delay,conditions});
const c=(id,label,desc,message,effects=[],next=[],requires=null,close=true)=>({id,label,desc,message,effects,next,requires,close});
const ev=(id,title,urg,text,choices,opt={})=>Object.assign({id,title,urg,text,choices,repeatable:false,cooldownDays:8,weight:1},opt);
const t=k=>({type:'flagTruthy',key:k}), f=k=>({type:'flagFalsy',key:k}), flag=(k,v)=>({type:'flag',key:k,value:v}), day=v=>({type:'dayMin',value:v}), season=v=>({type:'season',value:v}), res=(k,v)=>({type:'resourceMin',key:k,value:v}), statMin=(k,v)=>({type:'statMin',key:k,value:v}), statMax=(k,v)=>({type:'statMax',key:k,value:v}), b=(k,l=1)=>({type:'building',key:k,level:l}), nb=(k,l=1)=>({type:'noBuilding',key:k,level:l}), alive=id=>({type:'personAlive',id}), facMin=(k,v)=>({type:'factionMin',key:k,value:v}), facMax=(k,v)=>({type:'factionMax',key:k,value:v}), resolved=id=>({type:'resolved',id});

const INITIAL_PEOPLE=[
{id:'edda',name:'Edda Vale',role:'Curandera',trait:'Serena',status:'Bien',alive:true,loyalty:68},
{id:'garran',name:'Garran Holt',role:'Leñador',trait:'Prudente',status:'Bien',alive:true,loyalty:58},
{id:'mara',name:'Mara Fen',role:'Agricultora',trait:'Directa',status:'Bien',alive:true,loyalty:63},
{id:'tomas',name:'Tomas Reed',role:'Carpintero',trait:'Trabajador',status:'Bien',alive:true,loyalty:61},
{id:'ysabel',name:'Ysabel Crowe',role:'Anciana del consejo',trait:'Respetada',status:'Bien',alive:true,loyalty:72},
{id:'oren',name:'Oren Pike',role:'Cazador',trait:'Reservado',status:'Bien',alive:true,loyalty:52},
{id:'nia',name:'Nia Holt',role:'Panadera',trait:'Optimista',status:'Bien',alive:true,loyalty:60},
{id:'pell',name:'Pell Durn',role:'Pastor',trait:'Nervioso',status:'Bien',alive:true,loyalty:49}
];
const INITIAL_HOUSEHOLDS=[
{id:'holt',name:'Casa Holt',adults:3,children:2,work:'Leña y pan'},
{id:'fen',name:'Casa Fen',adults:2,children:2,work:'Campos'},
{id:'reed',name:'Casa Reed',adults:2,children:1,work:'Carpintería'},
{id:'crowe',name:'Casa Crowe',adults:2,children:1,work:'Cuidados y consejo'},
{id:'pike',name:'Casa Pike',adults:2,children:0,work:'Caza'},
{id:'durn',name:'Casa Durn',adults:3,children:2,work:'Ganado'}
];
const INITIAL_FACTIONS={
ravens:{name:'Cuervos Negros',attitude:-35,desc:'Una cuadrilla armada de reputación dudosa.'},
eastroad:{name:'Liga del Camino Este',attitude:5,desc:'Mercaderes y carreteros que conectan el valle.'},
ashcombe:{name:'Baronía de Ashcombe',attitude:0,desc:'La autoridad feudal que reclama estas tierras.'},
abbey:{name:'Abadía de Saint Alder',attitude:8,desc:'Monjes, escribas y boticarios al sur.'},
dunmere:{name:'Dunmere',attitude:10,desc:'La aldea vecina más cercana.'}
};

const PROJECTS=[
{id:'well',name:'Pozo comunal',buildingId:'well',days:4,cost:{wood:14,coin:2},desc:'Asegura agua limpia y reduce riesgos de contaminación.',completeEffects:[B('well','Pozo comunal','Agua limpia incluso si el arroyo falla.'),S('morale',3),F('cleanWater',true)]},
{id:'palisade',name:'Empalizada',buildingId:'palisade',days:7,cost:{wood:30,coin:5},desc:'Una defensa seria alrededor del núcleo habitado.',completeEffects:[B('palisade','Empalizada','Troncos afilados y puertas reforzadas.'),S('safety',16)]},
{id:'granary',name:'Granero elevado',buildingId:'granary',days:6,cost:{wood:22,coin:7},desc:'Protege cosechas de humedad y roedores.',completeEffects:[B('granary','Granero elevado','Mantiene las reservas secas y ordenadas.'),R('food',8),S('morale',2)]},
{id:'infirmary',name:'Enfermería',buildingId:'infirmary',days:6,cost:{wood:20,coin:8,medicine:1},desc:'Un lugar estable para Edda y sus pacientes.',completeEffects:[B('infirmary','Enfermería','Camas, agua caliente y un armario de remedios.'),S('morale',3),R('medicine',2)]},
{id:'tannery',name:'Curtiduría',buildingId:'tannery',days:5,cost:{wood:16,coin:6},desc:'Convierte pieles en bienes comerciables.',conditions:{any:[alive('lena'),t('leatherWorker')]},completeEffects:[B('tannery','Curtiduría','Pieles, correas y botas para el valle.'),S('reputation',2)]},
{id:'watchtower',name:'Torre de vigilancia',buildingId:'watchtower',days:6,cost:{wood:24,coin:5},desc:'Permite ver el camino y el bosque antes de que el peligro llegue.',completeEffects:[B('watchtower','Torre de vigilancia','Una plataforma alta sobre la entrada norte.'),S('safety',10)]},
{id:'smokehouse',name:'Ahumadero',buildingId:'smokehouse',days:5,cost:{wood:15,coin:4},desc:'Conserva carne durante semanas.',conditions:alive('oren'),completeEffects:[B('smokehouse','Ahumadero','Carne y pescado conservados para los meses malos.'),R('food',6)]},
{id:'market',name:'Plaza de mercado',buildingId:'market',days:8,cost:{wood:26,coin:12},desc:'Atrae comerciantes y genera pequeñas rentas.',conditions:statMin('reputation',3),completeEffects:[B('market','Plaza de mercado','Puestos cubiertos para viajeros y productores.'),FA('eastroad',8),S('reputation',3)]},
{id:'cottages',name:'Nuevas cabañas',buildingId:'cottages',days:6,cost:{wood:28,coin:4},desc:'Aumenta la capacidad de vivienda en diez personas.',completeEffects:[B('cottages','Nuevas cabañas','Viviendas sencillas en el borde oeste.'),H(10),S('morale',2)]},
{id:'school',name:'Casa de letras',buildingId:'school',days:9,cost:{wood:28,coin:14},desc:'Un lugar para enseñar a los niños y llevar cuentas.',conditions:{any:[facMin('abbey',15),t('schoolTeacher')]},completeEffects:[B('school','Casa de letras','Banco, tablillas y una pequeña biblioteca.'),S('morale',4),S('reputation',4)]},
{id:'shrine',name:'Santuario del roble',buildingId:'shrine',days:5,cost:{wood:12,coin:5},desc:'Un lugar común para velas, juramentos y funerales.',completeEffects:[B('shrine','Santuario del roble','Un pequeño santuario junto al árbol viejo.'),S('morale',5),FA('abbey',3)]},
{id:'mill',name:'Molino de agua',buildingId:'mill',days:10,cost:{wood:35,coin:18,tools:1},desc:'Mejora el rendimiento del grano.',conditions:{any:[b('well'),t('streamCleared')]},completeEffects:[B('mill','Molino de agua','Una rueda sobre el arroyo mueve la piedra de moler.'),S('reputation',4)]},
{id:'sawmill',name:'Aserradero',buildingId:'sawmill',days:8,cost:{wood:18,coin:12,tools:1},desc:'Aumenta la producción diaria de madera.',conditions:alive('garran'),completeEffects:[B('sawmill','Aserradero','Un banco de sierra y poleas junto al bosque.'),S('reputation',2)]},
{id:'greenhouse',name:'Invernadero de invierno',buildingId:'greenhouse',days:10,cost:{wood:24,coin:16,tools:1},desc:'Mantiene una mínima producción de alimento en invierno.',conditions:day(60),completeEffects:[B('greenhouse','Invernadero','Cristal recuperado y camas calientes para verduras.'),S('morale',3)]},
{id:'bridge',name:'Puente de piedra',buildingId:'bridge',days:12,cost:{wood:20,coin:25,tools:2},desc:'Sustituye el viejo paso y fortalece el comercio.',conditions:facMin('eastroad',15),completeEffects:[B('bridge','Puente de piedra','Un paso estable sobre el arroyo principal.'),FA('eastroad',10),S('reputation',6)]}
];

const EVENTS=[
// 1-15: Cuervos Negros / Halric
 ev('wounded','El hombre del bosque','Urgente','Un desconocido malherido yace en la casa de Edda. Antes de perder el conocimiento murmuró: “No dejéis que crucen”.',[
  c('heal','Tratarlo de inmediato','Gastas comida y remedios, pero aumentan sus posibilidades.','Edda estabiliza al desconocido. Entre fiebres repite una palabra: “Cuervos”.',[R('food',-4),R('medicine',-1),S('morale',3),F('halricAlive',true)],[n('stranger_wakes',1)]),
  c('question','Interrogarlo primero','Obtienes información antes de gastar recursos.','El hombre alcanza a hablar de hombres armados en el viejo puente. Edda te obliga a dejarlo descansar.',[S('morale',-2),F('halricAlive',true),F('halricQuestioned',true)],[n('stranger_wakes',1)]),
  c('wait','Vigilarlo y esperar','Conservas recursos, pero su vida pende de un hilo.','El desconocido pasa otra noche entre fiebre y silencio.',[S('morale',-1)],[],null,false)
 ],{chain:'ravens',deadline:{days:2,message:'El desconocido muere antes de poder contar qué vio. Edda cubre el cuerpo sin decir una palabra.',effects:[F('halricDied',true),S('morale',-6)]}}),
 ev('crops','La enfermedad de los cultivos','Serio','Varias hileras se marchitan. Mara cree que el problema está en el agua; otros culpan a una plaga.',[
  c('investigate','Desviar trabajadores a investigar','Pierdes producción hoy para entender el problema.','Mara encuentra un residuo oscuro junto al canal.',[R('food',-3),S('morale',1),F('waterTainted',true)],[n('water',1)]),
  c('burn','Quemar las plantas enfermas','Sacrificas comida para cortar el daño rápido.','Las plantas enfermas arden. La propagación parece detenerse, pero la causa sigue ahí.',[R('food',-12),S('safety',2),F('cropBurned',true)]),
  c('wait','No tocar los campos hoy','Guardas manos para otros problemas.','Al anochecer aparecen nuevas hojas ennegrecidas.',[R('food',-2)],[],null,false)
 ],{chain:'water',nightly:{message:'La enfermedad avanza entre los cultivos y parte de la cosecha se pierde.',effects:[R('food',-3)]},deadline:{days:3,message:'Mara abandona la parcela enferma. Los peces del canal aparecen muertos y ya no se puede ignorar el agua.',effects:[R('food',-6),F('waterTainted',true)],next:[n('water',1)]}}),
 ev('forest','Algo se mueve entre los árboles','Incierto','Anoche se oyeron ramas quebrarse al norte. Oren encontró una huella demasiado grande para un ciervo.',[
  c('scout','Enviar a Oren y dos voluntarios','Investigación rápida con algo de riesgo.','Oren parte con dos voluntarios. La aldea espera su regreso en silencio.',[S('safety',3)],[n('tracks',1)]),
  c('guard','Organizar guardias nocturnas','Gastas madera, pero reduces el riesgo inmediato.','Se levantan hogueras y turnos de guardia. Algo observa desde fuera de su luz.',[R('wood',-5),S('safety',8),S('morale',2)],[n('tracks',2)]),
  c('ignore','No alimentar supersticiones','Todos siguen trabajando, pese a la inquietud.','Al amanecer faltan gallinas y hay huellas junto a una casa.',[S('morale',-4),S('safety',-3)],[n('tracks',1)])
 ],{chain:'ravens',deadline:{days:2,message:'Las huellas rodean Bramwood durante la noche. Ya nadie habla de supersticiones.',effects:[S('morale',-3),S('safety',-4)],next:[n('tracks',1)]}}),
 ev('stranger_wakes','El desconocido despierta','Información','Se llama Halric. Asegura que los Cuervos Negros cruzaron el viejo puente y vienen hacia el valle buscando algo.',[
  c('believe','Creerle y prepararse','Das valor a su advertencia.','Halric recibe una cama y su aviso se transmite a toda la aldea.',[F('halricTrusted',true),S('reputation',1),S('morale',1)],[n('raven_demand',3)]),
  c('detain','Retenerlo hasta comprobarlo','Prudencia antes que hospitalidad.','Halric queda vigilado en el almacén. Algunos aprueban; otros no.',[F('halricDetained',true),S('safety',3),S('morale',-2)],[n('halric_secret',2)]),
  c('release','Curarlo y dejarlo marchar','No harás de Bramwood una prisión.','Halric parte con pan y vendas. Antes de irse promete no olvidar Bramwood.',[F('halricReleased',true),R('food',-2),S('reputation',2)],[n('ravens_return',12)])
 ],{chain:'ravens'}),
 ev('tracks','La patrulla no volvió sola','Nuevo','Oren vuelve con un emblema de hierro negro y señales de al menos seis hombres armados en el camino.',[
  c('barricade','Cerrar el camino','Mucha madera a cambio de una defensa inmediata.','El camino queda bloqueado con troncos y carros.',[R('wood',-18),S('safety',18),S('morale',-2),F('roadBarricaded',true)],[n('raven_night',3)]),
  c('emissary','Mandar un emisario','Más información, pero el mensajero corre peligro.','Garran parte sin armas visibles hacia el puente.',[S('safety',4),S('morale',-1),F('envoyOut',true)],[n('emissary_return',1)]),
  c('shadow','Seguirlos desde lejos','Oren intentará saber qué buscan sin dejarse ver.','Oren desaparece entre los árboles siguiendo las huellas.',[S('safety',1),PM('oren','Fuera de Bramwood')],[n('halric_secret',2)])
 ],{chain:'ravens'}),
 ev('emissary_return','Garran regresa con noticias','Urgente','Ha visto seis hombres armados y un séptimo a caballo. Buscan a alguien y acamparán junto al puente.',[
  c('hide','Ocultar a Halric','Cierras Bramwood y niegas que esté aquí.','Se apagan luces y nadie debe mencionar a Halric ante forasteros.',[F('bramwoodClosed',true),S('safety',8),S('morale',-1),FA('ravens',-8)],[n('raven_night',1)]),
  c('parley','Ir al puente a parlamentar','Intentas evitar sangre con palabras.','Preparas una pequeña comitiva para hablar antes de que los Cuervos entren en la aldea.',[F('parleyChosen',true),S('reputation',2),S('safety',-3)],[n('raven_parley',1)]),
  c('tell_truth','Decirles que Halric está aquí','Cooperas y ganas tiempo, pero entregas información.','Un mensajero lleva una respuesta: Halric está en Bramwood y nadie será entregado sin explicación.',[F('ravensKnowHalric',true),FA('ravens',3),S('morale',-2)],[n('raven_demand',1)])
 ],{chain:'ravens'}),
 ev('raven_parley','El puente viejo','Tensión','El capitán de los Cuervos, Varek, afirma que Halric robó un libro de cuentas. Dice que solo quiere recuperarlo.',[
  c('ask_proof','Exigir pruebas','No entregas a nadie por una acusación.','Varek muestra un sello roto y una lista de pagos. No demuestra robo, pero sí que Halric trabajaba con ellos.',[S('reputation',2),F('ravensLedgerClaim',true)],[n('halric_secret',1)]),
  c('offer_coin','Comprar su marcha','Una salida cara pero limpia.','Aceptan monedas y prometen dejar el valle por ahora.',[R('coin',-10),FA('ravens',10),S('safety',4),F('ravensPaid',true)],[n('ravens_return',25)],res('coin',10)),
  c('threaten','Amenazar con resistencia','Apuestas por que no quieran un asedio.','Varek sonríe, mira las casas y dice que volverá de noche.',[S('safety',-2),S('morale',-2),FA('ravens',-15)],[n('raven_attack',2)])
 ],{chain:'ravens'}),
 ev('raven_demand','La exigencia de los Cuervos','Urgente','Un jinete deja una nota: “Halric y el libro. Antes de la puesta de sol. Nadie más tiene que sufrir”.',[
  c('refuse','Rechazar la exigencia','Proteges a Halric y preparas consecuencias.','La nota vuelve clavada en una estaca: Bramwood no entrega huéspedes.',[S('morale',4),FA('ravens',-15),F('protectedHalric',true)],[n('raven_attack',2)]),
  c('trade_book','Entregar solo el libro','Si Halric lo tiene, quizá baste.','Halric entrega a regañadientes un libro de cuentas. Los Cuervos se retiran sin prometer nada.',[FA('ravens',8),F('ledgerReturned',true),S('morale',-1)],[n('halric_choice',3)],t('halricTrusted')),
  c('hand_halric','Entregar a Halric','Evitas un ataque, pero la aldea recordará el precio.','Halric no se resiste. Los Cuervos se lo llevan por el camino del norte.',[S('morale',-10),S('safety',6),FA('ravens',12),F('halricTaken',true)],[n('ravens_return',18)])
 ],{chain:'ravens',deadline:{days:2,message:'Los Cuervos interpretan el silencio como desafío y se acercan a Bramwood al anochecer.',effects:[FA('ravens',-8),S('safety',-3)],next:[n('raven_attack',1)]}}),
 ev('raven_night','Sombras frente a la empalizada improvisada','Urgente','Antorchas aparecen al otro lado del camino. Los Cuervos prueban tus defensas sin atacar todavía.',[
  c('hold','Mantener posiciones','No provocas, pero no cedes.','Las guardias aguantan toda la noche. Al alba, las antorchas ya no están.',[S('safety',5),S('morale',2),FA('ravens',-3)],[n('ravens_return',15)]),
  c('ambush','Tender una emboscada','Riesgo alto para expulsarlos.','Oren dirige una emboscada breve. Un Cuervo cae herido y los demás se dispersan.',[S('safety',2),S('morale',3),FA('ravens',-22),PM('oren','Herido leve')],[n('raven_aftermath',1)],alive('oren')),
  c('open_gate','Abrir y negociar','Apuestas por una conversación antes de que empiecen a arder casas.','Varek entra con dos hombres y acepta hablar bajo techo.',[S('safety',-4),S('reputation',2)],[n('raven_parley',1)])
 ],{chain:'ravens'}),
 ev('raven_attack','Los Cuervos atacan','Crítico','Flechas incendiarias caen cerca del granero. Varek intenta abrirse paso hasta el centro de Bramwood.',[
  c('walls','Cerrar puertas y sostener la empalizada','La obra defensiva permite resistir sin luchar casa por casa.','Las flechas golpean madera gruesa y los Cuervos no consiguen abrir brecha.',[R('wood',-6),R('medicine',-1),S('safety',2),S('morale',6),FA('ravens',-30),F('ravensDefeated',true)],[n('raven_aftermath',1)],b('palisade')),
  c('defend','Defender cada calle','La aldea lucha casa por casa.','Bramwood resiste. Hay heridos y madera quemada, pero los Cuervos retroceden.',[R('wood',-12),R('medicine',-2),S('safety',-8),S('morale',4),FA('ravens',-30),F('ravensDefeated',true)],[n('raven_aftermath',1)]),
  c('evacuate','Evacuar familias y ceder el almacén','Salvas vidas sacrificando recursos.','Las familias se esconden en el bosque. Los Cuervos saquean reservas y se marchan.',[R('food',-18),R('coin',-8),S('morale',-5),S('safety',-5),F('ravensLooted',true)],[n('raven_aftermath',1)]),
  c('surrender','Rendirse y aceptar condiciones','Evitas sangre a costa de autonomía.','Varek impone un tributo y deja dos hombres vigilando el camino.',[S('morale',-12),FA('ravens',18),F('ravenTribute',true),S('safety',2)],[n('ravens_return',10)])
 ],{chain:'ravens'}),
 ev('raven_aftermath','Después de los Cuervos','Serio','El peligro inmediato ha pasado, pero las consecuencias están a la vista: heridos, daños y cuentas pendientes.',[
  c('heal_first','Atender a los heridos primero','La reparación puede esperar.','Edda convierte el almacén en enfermería improvisada.',[R('medicine',-2),S('morale',5),S('safety',-2)],[n('halric_choice',3)]),
  c('repair_first','Reparar defensas primero','Priorizas el próximo ataque.','Tomas moviliza a todos los que pueden levantar un martillo.',[R('wood',-10),S('safety',10),S('morale',-2)],[n('halric_choice',3)]),
  c('send_word','Enviar noticias a Dunmere','Buscas aliados y testigos.','Un corredor sale hacia Dunmere con la historia de lo ocurrido.',[FA('dunmere',8),S('reputation',3)],[n('ravens_return',20)])
 ],{chain:'ravens'}),
 ev('halric_secret','Lo que Halric no contó','Información','Acuciado por las preguntas, Halric admite que llevaba las cuentas de los Cuervos y copió nombres de compradores y sobornos.',[
  c('keep_ledger','Guardar el libro','La información puede proteger Bramwood o atraer problemas.','El libro queda oculto bajo una tabla de la casa comunal.',[F('haveLedger',true),S('safety',-1)],[n('raven_demand',2)]),
  c('burn_ledger','Quemarlo','Eliminas el motivo principal para perseguirlo.','Las páginas arden una a una. Halric parece aliviado y aterrorizado.',[F('ledgerBurned',true),FA('ravens',5),S('safety',3)],[n('halric_choice',4)]),
  c('copy_names','Copiar los nombres y devolver el original','Intentas conservar valor sin conservar la prueba.','Ysabel copia los nombres importantes antes de sellar el libro.',[F('copiedLedger',true),S('reputation',2)],[n('raven_demand',2)])
 ],{chain:'ravens'}),
 ev('halric_choice','El futuro de Halric','Personal','La amenaza ha bajado por ahora. Halric pregunta si puede quedarse en Bramwood o debe marcharse.',[
  c('stay','Ofrecerle un lugar','Ganas a alguien que conoce caminos y cuentas.','Halric jura trabajar por su techo y su comida.',[{type:'personAdd',person:{id:'halric',name:'Halric Venn',role:'Escribano y explorador',trait:'Culpable',status:'Bien',alive:true,loyalty:45}},POP(1),F('halricResident',true),S('morale',2)]),
  c('leave','Pedirle que se marche','Cierras el capítulo sin más riesgos.','Halric se marcha al amanecer y deja una pequeña bolsa de monedas.',[R('coin',4),F('halricGone',true),S('safety',2)]),
  c('send_abbey','Mandarlo a la abadía','Buscas protección institucional para él y para Bramwood.','Dos monjes aceptan escoltar a Halric hasta Saint Alder.',[FA('abbey',8),S('reputation',3),F('halricAtAbbey',true)])
 ],{chain:'ravens'}),
 ev('ravens_return','Una pluma negra en la puerta','Tensión','Semanas después, alguien deja una pluma negra clavada en la puerta del Consejo. No hay mensaje.',[
  c('prepare','Tomarlo como advertencia','Refuerzas vigilancia y reservas.','Las guardias se duplican durante una semana.',[R('wood',-6),S('safety',7),S('morale',-1)],[n('raven_peace',8)]),
  c('send_offer','Buscar un acuerdo definitivo','Mandas un mensaje a Varek.','La respuesta llega tres días después: Varek acepta hablar de fronteras y peajes.',[FA('ravens',6),S('reputation',2)],[n('raven_peace',3)]),
  c('ignore','Tirarla al fuego','No permitirás que gobiernen por miedo.','La pluma arde. Durante días no ocurre nada.',[S('morale',2),FA('ravens',-4)],[n('raven_peace',12)])
 ],{chain:'ravens',conditions:day(12)}),
 ev('raven_peace','Un trato con hombres peligrosos','Decisión','Varek propone una paz simple: los Cuervos no entran en Bramwood y Bramwood no ayuda a sus enemigos.',[
  c('accept','Aceptar la frontera','No es amistad, pero es una regla.','Se marca un mojón negro junto al puente. Durante un tiempo, la frontera se respeta.',[FA('ravens',25),S('safety',8),F('ravenTruce',true),MS('raven_truce')]),
  c('refuse','Rechazar cualquier pacto','Bramwood no debe nada a bandidos.','Varek se marcha sin dar la mano.',[FA('ravens',-18),S('morale',3),F('ravenFeud',true),MS('raven_feud')]),
  c('conditional','Aceptar solo comercio y paso','Intentas normalizar sin aliarte.','Los Cuervos aceptan pagar por comida y no portar armas dentro de la aldea.',[FA('ravens',12),FA('eastroad',-3),S('reputation',2),F('ravenCommerce',true),MS('raven_trade')])
 ],{chain:'ravens'}),

// 16-25: Agua y mina
 ev('water','El arroyo huele a metal','Nuevo','Mara encuentra peces muertos aguas arriba. Algo está contaminando el agua que alimenta los campos.',[
  c('upstream','Remontar el arroyo','Una expedición buscará el origen.','Oren y Mara encuentran barriles rotos cerca de una mina abandonada.',[S('safety',-1),F('mineFound',true)],[n('mine_source',1)]),
  c('well','Cavar un pozo de emergencia','Costoso, pero da una solución inmediata.','Tomas organiza una excavación apresurada y encuentra agua limpia.',[R('wood',-14),R('coin',-2),B('well','Pozo comunal','Agua limpia incluso si el arroyo falla.'),F('cleanWater',true),S('morale',4)],[n('mine_owners',8)]),
  c('boil','Racionar y hervir el agua','Barato, incómodo y temporal.','Cada casa recibe instrucciones para hervir el agua. El trabajo se ralentiza.',[S('morale',-2),R('wood',-3),F('waterRationed',true)],[n('mine_source',3)])
 ],{chain:'water',deadline:{days:3,message:'La contaminación entra en los pozos superficiales y varias personas enferman.',effects:[R('medicine',-2),S('morale',-4),F('waterSickness',true)],next:[n('poisoned_well',1)]}}),
 ev('mine_source','La vieja mina de cobre','Exploración','El origen es una galería derrumbada con barriles marcados con el sello de la Casa Morcant.',[
  c('seal','Sellar la galería','Detienes la filtración con trabajo y madera.','La entrada queda apuntalada y el agua empieza a aclararse.',[R('wood',-12),S('safety',3),F('streamCleared',true),F('waterTainted',false)],[n('clear_stream',4)]),
  c('search','Registrar la mina','Buscas herramientas, documentos o responsables.','Dentro aparecen herramientas recientes y un libro de jornales.',[R('tools',2),F('mineRecent',true),S('safety',-2)],[n('mine_owners',2)]),
  c('leave','Cerrar el paso y avisar a otros','No arriesgas vidas dentro.','Colocas señales y mandas palabra a Dunmere y a la baronía.',[FA('dunmere',4),FA('ashcombe',3),S('reputation',2)],[n('mine_owners',3)])
 ],{chain:'water'}),
 ev('mine_owners','Los hombres de Morcant','Tensión','Tres capataces llegan preguntando por “su” mina. Afirman tener permiso de la baronía para reabrirla.',[
  c('deny','Negarles acceso','Proteges el agua por encima de sus papeles.','Los capataces se marchan prometiendo volver con un sello oficial.',[S('morale',3),FA('ashcombe',-4),F('morcantDenied',true)],[n('miners_return',7)]),
  c('inspect','Permitir acceso supervisado','Intentas comprobar si pueden trabajar sin contaminar.','Mara acompaña a los capataces. Admiten que los barriles no deberían estar allí.',[S('reputation',2),F('mineSupervised',true)],[n('mine_offer',4)]),
  c('sell_rights','Cobrar por el acceso','Moneda a cambio de riesgo ambiental.','Los capataces pagan y prometen construir un canal de residuos.',[R('coin',12),S('morale',-3),F('mineOperating',true)],[n('mine_collapse',12)])
 ],{chain:'water'}),
 ev('poisoned_well','Fiebre del agua','Crítico','Niños y ancianos sufren vómitos y fiebre. Edda cree que el agua es la causa.',[
  c('medicine','Gastar los remedios','Tratas a los enfermos de inmediato.','Edda consigue estabilizar a los peores casos.',[R('medicine',-3),S('morale',3),F('waterSicknessControlled',true)],[n('clear_stream',3)],res('medicine',3)),
  c('abbey','Pedir ayuda a la abadía','Dependes de la buena voluntad de Saint Alder.','Un novicio llega con sales y carbón medicinal.',[FA('abbey',6),S('reputation',1),R('medicine',2)],[n('engineer_arrives',5)]),
  c('isolate','Aislar enfermos y esperar','Ahorras medicina pero pierdes manos.','La casa de Ysabel se convierte en sala de aislamiento.',[S('morale',-4),R('food',-4),F('waterQuarantine',true)],[n('clear_stream',5)])
 ],{chain:'water',deadline:{days:2,message:'La fiebre empeora antes de que puedas contenerla.',effects:[S('morale',-7),POP(-1),F('waterDeath',true)]}}),
 ev('engineer_arrives','La ingeniera de Saint Alder','Oportunidad','Sor Mera, una monja que entiende de canales, ofrece redirigir el agua y limpiar el cauce.',[
  c('hire','Aceptar el plan completo','Cuesta madera y moneda, pero es duradero.','Sor Mera diseña un canal de drenaje y filtros de grava.',[R('wood',-10),R('coin',-6),F('streamCleared',true),F('waterTainted',false),FA('abbey',8)],[n('clean_water_feast',6)],{all:[res('wood',10),res('coin',6)]}),
  c('learn','Pedir que enseñe a Tomas','Más lento, pero Bramwood aprende la técnica.','Tomas pasa tres días midiendo pendientes y construyendo filtros.',[R('wood',-6),R('tools',-1),F('waterKnowledge',true),FA('abbey',4)],[n('clear_stream',5)]),
  c('decline','Agradecer y seguir solos','No gastas recursos.','Sor Mera deja notas y regresa a la abadía.',[FA('abbey',1),S('reputation',1)])
 ],{chain:'water'}),
 ev('clear_stream','El agua vuelve a correr clara','Buen augurio','Después de días de trabajo, el arroyo recupera color y olor normales.',[
  c('celebrate','Celebrarlo con una comida común','Conviertes la recuperación en un momento de unión.','Nia hornea todo el día y la gente cena junto al arroyo.',[R('food',-7),S('morale',7),F('streamCleared',true),F('waterTainted',false)],[n('clean_water_feast',10)]),
  c('store','Aprovechar para llenar reservas','Priorizas seguridad futura.','Se llenan barriles y tinajas con agua limpia.',[S('safety',3),F('waterStored',true),F('streamCleared',true),F('waterTainted',false)]),
  c('rules','Crear normas sobre vertidos','Una regla nueva para evitar repetir el desastre.','El Consejo prohíbe almacenar residuos cerca del agua.',[S('reputation',3),S('morale',1),F('waterLaw',true)])
 ],{chain:'water'}),
 ev('miners_return','La mina tiene papeles','Política','Los Morcant vuelven con un documento sellado por Ashcombe. Legalmente pueden explotar la ladera.',[
  c('challenge','Impugnar el permiso','Inicias un conflicto legal con la baronía.','Ysabel redacta una protesta formal y la envía a Ashcombe.',[FA('ashcombe',-8),S('reputation',4),F('mineAppeal',true)],[n('baron_invitation',8)]),
  c('conditions','Aceptar con condiciones estrictas','Permites trabajo si construyen drenaje y pagan daños.','Los capataces aceptan una lista de condiciones que no esperaban.',[R('coin',6),S('reputation',3),F('mineOperating',true),F('mineRegulated',true)],[n('mine_offer',8)]),
  c('yield','Aceptar el permiso sin pelear','Evitas una disputa con quien manda.','La mina reabre bajo vigilancia mínima.',[FA('ashcombe',5),S('morale',-4),F('mineOperating',true)],[n('mine_collapse',10)])
 ],{chain:'water'}),
 ev('mine_offer','Cobre para Bramwood','Oportunidad','Los mineros ofrecen pagar a Bramwood por madera, comida y alojamiento.',[
  c('trade','Aceptar el negocio','Ingresos constantes con más tránsito y ruido.','Los carros de la mina empiezan a comprar en Bramwood.',[R('coin',10),R('food',-4),FA('eastroad',4),S('reputation',2),F('mineTrade',true)]),
  c('limited','Solo vender madera','Ganas algo sin alimentar demasiado la explotación.','Garran acuerda una cuota semanal de troncos.',[R('coin',6),R('wood',-8),F('mineWoodDeal',true)]),
  c('refuse','No colaborar','Mantienes distancia del proyecto.','Los capataces buscan suministros en otro lugar.',[S('morale',2),FA('ashcombe',-2)])
 ],{chain:'water'}),
 ev('mine_collapse','Derrumbe en la mina','Crítico','Un estruendo sacude la ladera. Mineros atrapados golpean desde dentro mientras el agua vuelve a oscurecerse.',[
  c('rescue','Organizar un rescate','Arriesgas aldeanos y herramientas.','Tomas y Oren abren una galería lateral y sacan a cuatro hombres vivos.',[R('tools',-1),R('medicine',-2),S('morale',5),S('reputation',6),FA('ashcombe',5),F('mineClosed',true),F('waterTainted',true)],[n('clear_stream',3)],{all:[alive('tomas'),alive('oren')]}),
  c('seal','Sellar la entrada','Proteges Bramwood y das por perdidos a los atrapados.','Los golpes cesan antes del amanecer. La mina queda enterrada.',[R('wood',-10),S('safety',6),S('morale',-7),FA('ashcombe',-4),F('mineClosed',true)]),
  c('morcant','Exigir que Morcant lo resuelva','No arriesgas a tu gente por una empresa ajena.','Los capataces traen obreros de fuera. Dos días después sacan cuerpos, no supervivientes.',[S('morale',-3),FA('ashcombe',2),F('mineClosed',true)])
 ],{chain:'water'}),
 ev('clean_water_feast','La fuente de Bramwood','Legado','Los niños han empezado a llamar “fuente de Bramwood” al lugar donde el arroyo vuelve a ser claro.',[
  c('marker','Levantar un mojón de piedra','Conviertes la historia en memoria pública.','Tomas talla la fecha del desastre y de la recuperación.',[R('coin',-2),S('morale',3),S('reputation',3),MS('clean_water')]),
  c('leave_natural','Dejarlo tal como está','No todo necesita una placa.','El lugar queda como una curva tranquila del arroyo.',[S('morale',2),F('groveWaterPeace',true)]),
  c('dedicate','Dedicárselo a quienes enfermaron','Un gesto sobrio de recuerdo.','Edda deja una cinta blanca en el sauce del arroyo.',[S('morale',4),FA('abbey',2),MS('water_memorial')])
 ],{chain:'water'}),

// 26-35: Lena y refugiados
 ev('refugees','Tres figuras en el camino','Nuevo','Una mujer y dos niños piden refugio. Dicen que su caserío fue saqueado y solo llevan una manta y herramientas de cuero.',[
  c('accept','Abrirles Bramwood','Tres bocas más, pero también nuevas manos.','Lena y los niños reciben una esquina en la casa comunal.',[R('food',-7),S('morale',3),S('reputation',4),F('lenaAccepted',true),{type:'personAdd',person:{id:'lena',name:'Lena Marr',role:'Curtidora',trait:'Protectora',status:'Bien',alive:true,loyalty:62}},{type:'householdAdd',household:{id:'marr',name:'Casa Marr',adults:1,children:2,work:'Cuero'}}],[n('lena_work',4)]),
  c('send','Darles comida y pedirles que sigan','Ayudas sin asumir el riesgo.','Parten al anochecer con pan y agua.',[R('food',-4),S('morale',-1),S('reputation',1),F('lenaSent',true)],[n('past_catches',20)]),
  c('turnaway','Cerrarles las puertas','Conservas recursos y evitas incertidumbre.','Las tres figuras desaparecen por el camino del este.',[S('morale',-4),S('reputation',-3),F('lenaTurned',true)],[n('raid_survivor',15)])
 ],{chain:'lena',pool:'story',weight:3,conditions:{all:[day(5),{type:'notResolved',id:'refugees'}]}}),
 ev('lena_work','Lena quiere ganarse el techo','Oportunidad','Lena ofrece reparar botas y arneses. Pide un cobertizo y acceso a las pieles de Oren.',[
  c('support','Darle materiales','Inviertes en una profesión nueva.','Tomas le cede un banco de trabajo y Oren varias pieles.',[R('wood',-6),R('coin',-2),S('morale',2),F('leatherWorker',true)],[n('leather_orders',6)]),
  c('informal','Que trabaje sin taller','Puede empezar sin coste, pero con poca capacidad.','Lena se instala bajo un alero y comienza con pequeñas reparaciones.',[F('leatherWorker',true),S('reputation',1)],[n('leather_orders',10)]),
  c('farm','Necesitamos manos en los campos','Priorizas comida sobre oficio.','Lena acepta sin discutir y se une a Mara durante la cosecha.',[R('food',4),S('morale',-1),F('lenaFarmer',true)],[n('child_sick',8)])
 ],{chain:'lena'}),
 ev('leather_orders','Pedidos de cuero','Oportunidad','Viajeros empiezan a preguntar por las botas y correas de Lena. Ella cree que podría vender más de lo que Bramwood usa.',[
  c('expand','Apoyar la expansión','Necesita madera y algo de moneda.','La producción de Lena se vuelve una pequeña actividad comercial.',[R('wood',-8),R('coin',-3),R('coin',6),S('reputation',3),F('lenaBusiness',true)],[n('tannery_dispute',10)]),
  c('local','Solo para Bramwood','Mantienes el oficio al servicio de la aldea.','Las botas rotas dejan de ser un problema frecuente.',[S('morale',3),S('safety',1),F('lenaLocal',true)]),
  c('guild','Contactar con la Liga del Camino Este','Buscas compradores más grandes.','Un carretero se lleva muestras hacia el este.',[FA('eastroad',5),S('reputation',2)],[n('guild_offer',5)])
 ],{chain:'lena'}),
 ev('child_sick','El hijo pequeño de Lena enferma','Serio','Tavin tiene fiebre alta y respira con dificultad. Lena no se separa de su cama.',[
  c('medicine','Usar las mejores medicinas','Prioridad absoluta a salvarlo.','Edda pasa la noche con el niño. Al amanecer la fiebre cede.',[R('medicine',-2),S('morale',3),F('tavinRecovered',true)],[n('lena_truth',8)],res('medicine',2)),
  c('abbey','Mandar a buscar a un monje','Solicitas ayuda externa.','Saint Alder manda a un hermano boticario con una infusión fuerte.',[FA('abbey',5),R('coin',-2),F('tavinRecovered',true)],[n('lena_truth',8)]),
  c('rest','Confiar en Edda con lo que hay','No gastas reservas especiales.','La fiebre dura tres días y deja a Tavin muy débil.',[S('morale',-2),F('tavinWeak',true)],[n('lena_truth',8)])
 ],{chain:'lena',deadline:{days:2,message:'La fiebre se lleva a Tavin antes del amanecer. Lena queda rota y la aldea guarda silencio.',effects:[S('morale',-8),F('tavinDied',true)],next:[n('lena_truth',5)]}}),
 ev('past_catches','Una mujer pregunta por Lena Marr','Misterio','Una viajera asegura que Lena robó dinero de la casa donde trabajaba antes de huir.',[
  c('listen','Escuchar la acusación','Quieres conocer la historia antes de actuar.','La viajera describe un incendio, un patrón muerto y una bolsa desaparecida.',[F('lenaAccused',true)],[n('lena_truth',1)]),
  c('dismiss','Mandarla seguir su camino','No juzgas a alguien que ya no vive aquí.','La viajera se marcha molesta y promete contar que Bramwood protege ladrones.',[S('reputation',-2),F('lenaRumor',true)]),
  c('search','Buscar pruebas entre sus cosas','Investigas a una ausente.','No encuentras dinero, solo herramientas marcadas con las iniciales L.M.',[S('morale',-1),F('lenaToolsFound',true)])
 ],{chain:'lena'}),
 ev('lena_truth','La historia de Lena','Personal','Lena admite que tomó monedas de su patrón, pero asegura que era salario retenido tras meses de golpes y amenazas.',[
  c('believe','Creerla','La juzgas por lo que ha hecho en Bramwood.','Lena respira por primera vez en varios minutos y promete no ocultarte nada más.',[S('morale',3),F('lenaTrusted',true)],[n('lena_stays',10)]),
  c('repay','Obligarla a devolver el dinero','Buscas cerrar la deuda sin expulsarla.','Lena vende parte de sus herramientas para reunir la suma.',[R('coin',3),S('morale',-3),F('lenaRepaid',true)],[n('lena_stays',10)]),
  c('leave','Pedirle que abandone Bramwood','La mentira pesa más que su trabajo aquí.','Lena recoge lo poco que tiene y se marcha con sus hijos.',[S('morale',-7),F('lenaExiled',true),PM('lena','Se marchó'),POP(-3)],[n('lena_leaves',1)])
 ],{chain:'lena'}),
 ev('raid_survivor','Otro superviviente del caserío saqueado','Nuevo','Un hombre herido reconoce la descripción de Lena y asegura que salvó a varios niños durante el ataque.',[
  c('help','Acogerlo unos días','Gastas recursos, pero escuchas su testimonio.','El hombre confirma que Lena arriesgó la vida para sacar niños de una casa en llamas.',[R('food',-3),R('medicine',-1),S('reputation',3),F('lenaHeroic',true)]),
  c('ask_route','Preguntar hacia dónde fue Lena','Quizá todavía puedas encontrarla.','Señala el camino hacia Dunmere. Dice que no iba deprisa.',[F('lenaLocationKnown',true)],[n('lena_stays',3)]),
  c('send_dunmere','Mandarlo a Dunmere','No puedes acoger a todos.','Le das una manta y una carta para la aldea vecina.',[R('food',-2),FA('dunmere',3)])
 ],{chain:'lena'}),
 ev('lena_stays','¿Un hogar o una parada?','Personal','Lena dice que los niños han empezado a llamar Bramwood “casa”. Pregunta si de verdad pueden echar raíces aquí.',[
  c('home','Decir que sí','La familia Marr pasa a formar parte de Bramwood sin reservas.','Esa noche Lena cuelga una pequeña placa con su apellido en la puerta.',[S('morale',5),S('reputation',2),F('lenaSettled',true),MS('marr_home')]),
  c('prove','Pedir un año de trabajo antes','La aceptación será gradual.','Lena asiente, aunque la respuesta le duele más de lo que admite.',[S('morale',-2),F('lenaProbation',true)]),
  c('dunmere','Sugerir que Dunmere ofrece más futuro','Crees que otro lugar puede ser mejor para sus hijos.','Lena agradece la sinceridad y comienza a preparar la marcha.',[S('morale',-3),FA('dunmere',4),F('lenaMoving',true)],[n('lena_leaves',4)])
 ],{chain:'lena'}),
 ev('lena_leaves','La puerta vacía','Consecuencia','La esquina donde dormía la familia Marr queda vacía. Sus herramientas ya no cuelgan del muro.',[
  c('keep_bench','Mantener su banco de trabajo','Quizá otro curtidor llegue algún día.','Tomas cubre el banco con una lona en vez de desmontarlo.',[F('leatherBench',true),S('morale',-1)]),
  c('reuse','Reutilizar todo','Bramwood no puede desperdiciar recursos.','La madera vuelve al almacén y las herramientas se reparten.',[R('wood',5),R('tools',1),S('morale',-1)]),
  c('send_gift','Enviar un regalo a Dunmere','Cierras la relación sin rencor.','Nia prepara pan y Oren una piel para que alguien se lo entregue.',[R('food',-2),FA('dunmere',3),S('reputation',2)])
 ],{chain:'lena'}),
 ev('tannery_dispute','El olor de la curtiduría','Interno','Varias familias protestan: las pieles y cubas de Lena huelen demasiado cerca de las casas.',[
  c('move','Mover el trabajo río abajo','Cuesta madera, pero reduce el conflicto.','Lena acepta trasladar las cubas lejos de las viviendas.',[R('wood',-6),S('morale',3),F('tanneryMoved',true)]),
  c('rules','Limitar horarios y residuos','Buscas un compromiso.','El Consejo fija días y zonas de trabajo.',[S('reputation',2),S('morale',1),F('tanneryRules',true)]),
  c('back_lena','Respaldar a Lena','El crecimiento tiene costes.','Las quejas cesan en público, no en privado.',[R('coin',3),S('morale',-4),F('lenaBacked',true)])
 ],{chain:'lena'}),

// 36-43: Baronía y autonomía
 ev('tax_collector','El recaudador de Ashcombe','Política','Un hombre con capa gris llega con dos guardias. Trae un registro antiguo que dice que Bramwood debe tributo por tierra y molino, aunque no haya molino.',[
  c('pay','Pagar sin discutir','Evitas una disputa con la baronía.','El recaudador cuenta las monedas dos veces y entrega un recibo.',[R('coin',-8),FA('ashcombe',6),S('morale',-2),F('taxPaid',true)],[n('levy_due',18)],res('coin',8)),
  c('contest','Impugnar el registro','Pides que demuestre la deuda.','Ysabel encuentra fechas contradictorias y obliga al recaudador a marcharse con el asunto abierto.',[S('reputation',3),FA('ashcombe',-4),F('taxContested',true)],[n('baron_invitation',8)]),
  c('goods','Ofrecer grano y madera','Pagas en especie y guardas moneda.','Los guardias cargan un carro con suministros.',[R('food',-8),R('wood',-8),FA('ashcombe',3),S('morale',-2),F('taxGoods',true)])
 ],{chain:'barony',pool:'story',weight:2,conditions:day(12)}),
 ev('levy_due','Una segunda leva','Política','Ashcombe exige hombres para reparar la calzada del sur durante diez días.',[
  c('send','Enviar cuatro trabajadores','Cumples, pero Bramwood pierde manos temporalmente.','Cuatro aldeanos parten con palas y mantas.',[R('food',-5),R('wood',-4),FA('ashcombe',6),S('morale',-2),F('levyServed',true)]),
  c('coin','Pagar para evitar la leva','Caro, pero nadie abandona sus tareas.','El enviado acepta monedas en lugar de trabajadores.',[R('coin',-10),FA('ashcombe',3)],[],res('coin',10)),
  c('refuse','Negarse','Bramwood no regalará diez días de trabajo.','La respuesta parte sellada con cera simple, sin disculpas.',[FA('ashcombe',-12),S('morale',4),F('levyRefused',true)],[n('baron_pressure',8)])
 ],{chain:'barony'}),
 ev('baron_invitation','Invitación a Ashcombe','Política','El barón solicita tu presencia para “aclarar derechos y obligaciones”. Puede ser una negociación o una advertencia.',[
  c('go','Acudir personalmente','Te presentas como responsable de Bramwood.','La sala de Ashcombe es fría y deliberadamente grande. El barón escucha más de lo esperado.',[FA('ashcombe',4),S('reputation',3),F('metBaron',true)],[n('charter_offer',3)]),
  c('send_ysabel','Enviar a Ysabel','Su experiencia puede protegerte de trampas legales.','Ysabel vuelve con una sonrisa cansada y tres páginas de notas.',[FA('ashcombe',3),F('ysabelNegotiated',true)],[n('charter_offer',4)],alive('ysabel')),
  c('decline','Rechazar la invitación','Evitas ponerte bajo su techo, pero el gesto pesa.','No llega respuesta, solo silencio.',[FA('ashcombe',-8),S('safety',-1)],[n('baron_pressure',7)])
 ],{chain:'barony'}),
 ev('road_toll','Peaje en el camino sur','Economía','Guardias de Ashcombe instalan una barrera y empiezan a cobrar a los carros que van hacia Bramwood.',[
  c('pay_subsidy','Subvencionar a los mercaderes','Mantienes el flujo comercial con dinero de Bramwood.','Durante una semana, Bramwood paga el peaje de los carros.',[R('coin',-8),FA('eastroad',7),S('reputation',2)]),
  c('detour','Abrir un desvío por el bosque','Evitas el peaje, pero el camino es peor.','Oren marca un sendero que los carros ligeros pueden usar.',[R('wood',-4),S('safety',-2),FA('ashcombe',-5),F('forestDetour',true)]),
  c('accept','Aceptar el peaje','No conviertes el asunto en conflicto.','Algunos mercaderes dejan de venir por un tiempo.',[FA('eastroad',-5),FA('ashcombe',3),R('coin',-2)])
 ],{chain:'barony',pool:'story',weight:1,conditions:{all:[day(25),facMax('ashcombe',5)]}}),
 ev('conscription','Dos nombres para la milicia del barón','Política','Ashcombe reclama a dos jóvenes de Bramwood para servir seis meses en la frontera.',[
  c('comply','Entregar los nombres','Cumples una obligación peligrosa.','Dos familias preparan mochilas en silencio.',[POP(-2),S('morale',-7),FA('ashcombe',8),F('conscriptsGone',true)],[n('conscripts_return',35)]),
  c('buyout','Comprar la exención','Una suma dolorosa, pero nadie se marcha.','El escribano sella la exención tras contar doce monedas.',[R('coin',-12),S('morale',3),FA('ashcombe',2)],[],res('coin',12)),
  c('refuse','Negarse por completo','Pones a Bramwood frente a la autoridad feudal.','La carta de negativa sale antes de que puedas arrepentirte.',[FA('ashcombe',-18),S('morale',5),F('conscriptionRefused',true)],[n('baron_pressure',5)])
 ],{chain:'barony',pool:'story',weight:1,conditions:day(35)}),
 ev('charter_offer','Una carta para Bramwood','Política','Ashcombe ofrece reconocer a Bramwood como villa con derechos limitados si aceptas un tributo anual y sus tribunales.',[
  c('sign','Firmar la carta','Ganas reconocimiento a cambio de obligaciones.','El sello del barón convierte a Bramwood en una comunidad reconocida.',[R('coin',-6),FA('ashcombe',15),S('reputation',8),F('chartered',true),MS('charter')]),
  c('negotiate','Pedir menos tributo y más autonomía','Arriesgas que retire la oferta.','Después de horas de discusión, el tributo baja y Bramwood conserva su propio Consejo.',[FA('ashcombe',5),S('reputation',10),F('semiAutonomous',true),MS('semi_autonomy')],[n('autonomy',20)]),
  c('refuse','No poner Bramwood bajo su sello','Conservas independencia informal.','La carta queda sin firmar sobre la mesa.',[FA('ashcombe',-10),S('morale',5),F('independent',true)],[n('baron_pressure',12)])
 ],{chain:'barony'}),
 ev('baron_pressure','Ashcombe enseña los dientes','Urgente','Seis guardias llegan y anuncian inspecciones, cobros atrasados y restricciones sobre la madera del bosque.',[
  c('yield','Ceder temporalmente','Ganas tiempo y evitas violencia.','Los guardias se marchan con monedas y una lista de promesas.',[R('coin',-10),FA('ashcombe',8),S('morale',-6),F('baronConcessions',true)]),
  c('rally','Reunir a la aldea','Haces visible que imponer fuerza tendrá un coste.','Casi todos los adultos aparecen en la plaza. Los guardias deciden no provocar una pelea.',[S('morale',7),S('safety',-3),FA('ashcombe',-10),F('stoodAgainstBaron',true)],[n('autonomy',12)]),
  c('appeal_abbey','Pedir mediación a Saint Alder','Usas reputación eclesiástica para frenar la escalada.','La abadía envía una carta recordando antiguos límites de tierras.',[FA('abbey',5),FA('ashcombe',2),S('reputation',4)],[n('autonomy',15)],facMin('abbey',5))
 ],{chain:'barony'}),
 ev('autonomy','¿Qué clase de lugar es Bramwood?','Legado','Tras meses de disputas, todos entienden que Bramwood necesita definir su relación con el poder exterior.',[
  c('free','Comunidad libre','El Consejo jura que ninguna autoridad externa decidirá la vida diaria de Bramwood.','La campana suena al mediodía. Bramwood se declara comunidad libre.',[S('morale',8),S('reputation',7),FA('ashcombe',-15),F('freeVillage',true),MS('free_village')]),
  c('charter','Buscar protección legal','Prefieres derechos escritos aunque tengan un señor detrás.','Se redacta una petición formal de carta y protección.',[FA('ashcombe',10),S('reputation',6),F('seekingCharter',true),MS('lawful_village')]),
  c('neutral','No proclamar nada','La ambigüedad ha funcionado hasta ahora.','Bramwood sigue siendo Bramwood, sin títulos nuevos.',[S('safety',2),S('morale',2),F('quietIndependence',true),MS('quiet_village')])
 ],{chain:'barony'}),

// 44-51: Comercio
 ev('merchant','Un mercader ambulante','Oportunidad','Un carro cubierto llega desde el este con grano, herramientas, sal y rumores.',[
  c('grain','Comprar grano','Cinco monedas por una reserva útil.','El almacén recibe varios sacos de grano.',[R('coin',-5),R('food',14)],[],res('coin',5)),
  c('tools','Comprar herramientas','Inviertes en productividad.','Tomas reparte nuevas herramientas entre los trabajadores.',[R('coin',-7),R('tools',2),S('morale',1)],[],res('coin',7)),
  c('rumors','Pagar por rumores','Información barata puede evitar problemas caros.','El mercader habla de peajes nuevos y de una caravana grande que busca ruta.',[R('coin',-1),S('reputation',1),F('heardTradeRumors',true)],[n('guild_offer',4)],res('coin',1))
 ],{chain:'trade',pool:'ambient',repeatable:true,cooldownDays:9,weight:3,conditions:day(4)}),
 ev('guild_offer','Oferta de la Liga del Camino Este','Economía','La Liga propone usar Bramwood como parada habitual si garantizas comida, seguridad y un espacio para carros.',[
  c('accept','Aceptar','Abres Bramwood al tráfico regular.','Se marca una zona para carros y la Liga incluye Bramwood en sus mapas.',[R('wood',-8),FA('eastroad',12),S('reputation',5),F('tradeStop',true)],[n('caravan_guard',8)]),
  c('fee','Aceptar con una tasa','Cobras por cada caravana.','La Liga protesta, pero acepta una tasa pequeña.',[R('coin',5),FA('eastroad',5),S('reputation',3),F('tradeFee',true)],[n('market_day',8)]),
  c('decline','Rechazar','Prefieres una aldea tranquila a una carretera viva.','Los mercaderes tachan Bramwood de su ruta prevista.',[FA('eastroad',-8),S('morale',2),F('tradeDeclined',true)])
 ],{chain:'trade',pool:'story',weight:2,conditions:{all:[day(15),{any:[t('heardTradeRumors'),statMin('reputation',4)]}]}}),
 ev('caravan_guard','Una caravana pide escolta','Oportunidad','La Liga ofrece seis monedas si Oren acompaña tres carros hasta el cruce de Dunmere.',[
  c('send','Enviar escolta','Ganas dinero y reputación con algo de riesgo.','Oren y dos voluntarios parten al amanecer.',[S('safety',-2),PM('oren','De escolta')],[n('caravan_ambush',2)],alive('oren')),
  c('hire','Contratar guardias externos','Cuesta parte del pago, pero no arriesgas a tu gente.','Dos mercenarios aceptan cubrir el tramo peligroso.',[R('coin',2),FA('eastroad',4),S('reputation',2)]),
  c('decline','No comprometer fuerzas','La Liga buscará otra escolta.','Los carros esperan medio día y luego siguen sin ayuda.',[FA('eastroad',-2)])
 ],{chain:'trade'}),
 ev('caravan_ambush','Emboscada en el barranco','Urgente','La escolta regresa con un carro menos. Bandidos atacaron desde las rocas y Oren tiene un corte profundo.',[
  c('pursue','Perseguir a los asaltantes','Intentas recuperar mercancía y demostrar control.','La persecución recupera dos cajas, pero Oren empeora.',[R('coin',6),S('reputation',4),R('medicine',-1),PM('oren','Herido')],[n('smugglers',8)]),
  c('heal','Volver y curar a Oren','Priorizas a tu gente sobre la carga.','Edda cose la herida. La Liga pierde mercancía, pero Oren vivirá.',[R('medicine',-2),PM('oren','Recuperándose'),S('morale',3),FA('eastroad',-2)]),
  c('report','Avisar a Ashcombe','Pides que la autoridad limpie el camino.','Guardias del barón salen hacia el barranco dos días después.',[FA('ashcombe',4),FA('eastroad',2),S('reputation',1)])
 ],{chain:'trade'}),
 ev('market_day','Primer día de mercado','Buen augurio','Cuatro carros y vendedores de aldeas cercanas llenan la plaza improvisada.',[
  c('festival','Convertirlo en fiesta','Gastas comida para atraer gente y buen humor.','Hay música, puestos y niños corriendo entre carros.',[R('food',-8),R('coin',8),S('morale',8),S('reputation',6),FA('eastroad',5)],[n('festival',15)]),
  c('order','Mantenerlo práctico','Priorizas comercio y seguridad.','Tomas marca zonas para carros, animales y ventas.',[R('coin',6),S('safety',2),S('reputation',3)]),
  c('tax','Cobrar a cada puesto','Ingresos rápidos a costa de simpatía.','La caja de Bramwood engorda y algunos vendedores protestan.',[R('coin',10),FA('eastroad',-4),S('reputation',-1),F('marketTax',true)])
 ],{chain:'trade'}),
 ev('price_spike','El grano cuesta el doble','Economía','Malas cosechas al este disparan el precio. Los mercaderes ofrecen comprar tus reservas a precio excepcional.',[
  c('sell','Vender parte de la reserva','Ganas mucho dinero, asumiendo riesgo alimentario.','Salen seis sacos del almacén a cambio de una bolsa pesada.',[R('food',-18),R('coin',14),FA('eastroad',4)]),
  c('keep','No vender','La seguridad alimentaria vale más que la oportunidad.','Los comerciantes siguen camino sin cerrar trato.',[S('morale',2),F('keptGrain',true)]),
  c('share','Vender barato a Dunmere','Sacrificas beneficio por relación vecinal.','Dunmere recibe grano suficiente para pasar dos semanas difíciles.',[R('food',-12),R('coin',4),FA('dunmere',12),S('reputation',5)])
 ],{chain:'trade',pool:'story',weight:1,conditions:{all:[day(35),res('food',55)]}}),
 ev('smugglers','Cajas sin marca','Misterio','Oren encuentra cajas escondidas cerca del desvío del bosque. Contienen sal, vino y piezas de cobre sin sello.',[
  c('confiscate','Confiscarlo','Bramwood se queda con los bienes.','El almacén gana mercancía, pero alguien perderá dinero.',[R('coin',8),FA('eastroad',-2),F('smuggledGoods',true)],[n('guild_offer',10)]),
  c('report','Avisar a la Liga','Ganas confianza comercial.','La Liga identifica las marcas ocultas y agradece el aviso.',[FA('eastroad',10),S('reputation',4)]),
  c('leave','No meterse','No todo lo que pasa en el bosque es asunto de Bramwood.','Las cajas desaparecen la noche siguiente.',[S('safety',-1),F('smugglersIgnored',true)])
 ],{chain:'trade'}),
 ev('trade_route','Dos caminos, dos futuros','Economía','La Liga quiere invertir en una ruta. Puede pasar por Bramwood o rodear el valle por Ashcombe.',[
  c('invest','Poner dinero y trabajo','Una inversión fuerte para convertirse en parada principal.','Bramwood aporta madera, señalización y un pequeño puente.',[R('coin',-12),R('wood',-12),FA('eastroad',15),S('reputation',8),F('mainTradeRoute',true),MS('trade_hub')]),
  c('negotiate','Ofrecer solo mantenimiento','Participas sin arriesgar tanto.','La Liga acepta compartir costes de mantenimiento.',[R('wood',-6),FA('eastroad',7),S('reputation',4),F('tradeRoute',true)]),
  c('decline','No transformar la aldea','El comercio seguirá siendo ocasional.','La ruta principal se dibuja más al sur.',[S('morale',2),FA('eastroad',-5),F('quietRoad',true)])
 ],{chain:'trade',pool:'story',weight:1,conditions:{all:[day(55),facMin('eastroad',12)]}}),

// 52-61: Estaciones e invierno
 ev('autumn_count','Contar antes del frío','Estacional','Las hojas amarillean. Ysabel propone hacer inventario de comida, leña y techos antes del invierno.',[
  c('full','Inventario completo','Pierdes un día de trabajo, ganas información y orden.','Casa por casa se cuentan sacos, haces de leña y mantas.',[R('food',2),R('wood',3),S('morale',2),F('winterCounted',true)],[n('first_frost',8)]),
  c('food','Solo asegurar comida','Priorizas lo que mata más rápido.','El granero se reorganiza y se reparan sacos.',[R('food',6),F('winterFoodFocus',true)],[n('first_frost',8)]),
  c('wood','Solo asegurar leña','El frío será el enemigo principal.','Garran marca árboles y organiza turnos de corte.',[R('wood',9),F('winterWoodFocus',true)],[n('first_frost',8)])
 ],{chain:'winter',pool:'seasonal',weight:5,conditions:{all:[season('Otoño'),{type:'notResolved',id:'autumn_count'}]}}),
 ev('first_frost','La primera helada','Estacional','El agua amanece con una película de hielo. Lo que no esté preparado, ya llega tarde.',[
  c('roofs','Revisar techos','Gastas madera antes de las nevadas.','Tomas cambia tejas y refuerza vigas en las casas más viejas.',[R('wood',-10),S('safety',4),F('roofsReinforced',true)],[n('winter_fuel',10)]),
  c('store','Sellar el granero','Proteges comida de humedad y roedores.','Se revisan puertas y se elevan los sacos del suelo.',[R('wood',-5),R('food',5),F('grainProtected',true)],[n('winter_fuel',10)]),
  c('nothing','Confiar en lo que ya hay','Conservas recursos hoy.','Las chimeneas empiezan a humear antes de lo habitual.',[S('morale',-1)],[n('winter_fuel',8)])
 ],{chain:'winter'}),
 ev('winter_fuel','La pila de leña mengua','Serio','El frío consume troncos más rápido de lo esperado. Garran avisa de que, a este ritmo, faltará combustible.',[
  c('cut','Cortar incluso con nieve','Arriesgas trabajadores al frío.','La cuadrilla vuelve agotada pero con trineos cargados.',[R('wood',14),R('food',-3),S('morale',-2)]),
  c('ration','Racionar hogares','Ahorra madera, baja el confort.','Las casas cierran habitaciones y comparten fuegos.',[R('wood',6),S('morale',-5),F('winterRation',true)]),
  c('buy','Comprar leña a Dunmere','Moneda por seguridad.','Dos carros llegan antes de que empeore el camino.',[R('coin',-7),R('wood',18),FA('dunmere',3)],[],res('coin',7))
 ],{chain:'winter',deadline:{days:3,message:'La leña se agota durante una noche de frío intenso.',effects:[S('morale',-8),R('medicine',-1),F('coldCrisis',true)],next:[n('snowed_in',1)]}}),
 ev('snowed_in','El camino desaparece bajo la nieve','Estacional','Una nevada pesada cierra el camino oriental. Nadie entra ni sale con carro.',[
  c('clear','Abrir una senda','Mucho trabajo para mantener conexión.','Durante horas se palea una franja estrecha hasta el cruce.',[R('food',-3),S('morale',2),FA('eastroad',3)]),
  c('wait','Esperar al deshielo','Ahorras fuerzas y aceptas aislamiento.','Bramwood se encierra sobre sí misma durante varios días.',[S('safety',2),S('morale',-2),F('snowIsolated',true)],[n('frozen_stream',4)]),
  c('sled','Organizar trineos ligeros','Mantienes mensajes y medicina en movimiento.','Oren prueba una ruta segura con trineos.',[R('wood',-5),S('reputation',2),F('winterSleds',true)])
 ],{chain:'winter',pool:'seasonal',repeatable:true,cooldownDays:15,weight:4,conditions:season('Invierno')}),
 ev('roof_collapse','Un techo cede','Urgente','La nieve vence el techo de una familia durante la madrugada. Hay gente atrapada bajo vigas.',[
  c('rescue','Todos a rescatar','Interrumpes todo lo demás.','Tomas dirige el levantamiento de vigas y nadie muere.',[R('wood',-8),R('medicine',-1),S('morale',4)]),
  c('tomas','Dejarlo en manos de Tomas','Confías en el mejor constructor.','Tomas y su cuadrilla sacan a la familia y apuntalan la casa.',[R('wood',-6),S('morale',2)],[],alive('tomas')),
  c('relocate','Abandonar la casa','Salvas a la familia y no reparas en pleno invierno.','La familia se reparte entre otras casas.',[S('morale',-3),F('houseLost',true),H(-4)])
 ],{chain:'winter',pool:'seasonal',weight:3,conditions:{all:[season('Invierno'),f('roofsReinforced')]}}),
 ev('frozen_stream','El arroyo se congela','Estacional','El hielo bloquea el acceso sencillo al agua. El pozo, si existe, se vuelve vital.',[
  c('break','Romper hielo cada mañana','Trabajo constante durante el frío.','Se organiza un turno diario con hachas y cubos.',[R('food',-2),S('morale',-1)]),
  c('well_use','Depender del pozo','La inversión demuestra su valor.','El pozo mantiene agua disponible sin arriesgar a nadie.',[S('morale',4),S('safety',2)],[],b('well')),
  c('melt','Derretir nieve','Consume mucha leña.','Grandes ollas hierven junto a la casa comunal.',[R('wood',-7),S('morale',-2)])
 ],{chain:'winter'}),
 ev('winter_fever','Tos en varias casas','Serio','El encierro y el frío traen una fiebre respiratoria. Edda teme que se extienda rápido.',[
  c('isolate','Separar enfermos','Duro, pero reduce contactos.','Se vacía una casa para aislar a los enfermos.',[R('food',-4),S('morale',-3),F('winterQuarantine',true)],[n('recovery',6)]),
  c('medicine','Usar reservas','Intentas cortar la enfermedad pronto.','Edda reparte remedios y vigila respiraciones.',[R('medicine',-3),S('morale',2)],[n('recovery',4)],res('medicine',3)),
  c('abbey','Pedir ayuda','Si el camino deja pasar a alguien.','La abadía envía un pequeño cofre de hierbas en trineo.',[FA('abbey',5),R('medicine',3),S('reputation',1)],[n('recovery',5)])
 ],{chain:'winter',pool:'seasonal',weight:3,conditions:{all:[season('Invierno'),day(95)]}}),
 ev('thaw','El primer deshielo','Buen augurio','Gotas caen de los tejados y la tierra reaparece en los caminos. Bramwood ha pasado lo peor del invierno.',[
  c('repair','Reparar daños enseguida','Usas la primera semana templada para arreglar.','Techos, cercas y caminos reciben atención.',[R('wood',-8),S('safety',5),S('morale',4)]),
  c('plant','Preparar siembra','Todo esfuerzo va a los campos.','Mara ara las primeras parcelas en cuanto cede el barro.',[R('food',4),S('morale',3)],[n('spring_seed',4)]),
  c('rest','Dar dos días de descanso','La aldea necesita respirar.','Por primera vez en meses, nadie trabaja después del mediodía.',[S('morale',8),R('food',-3)])
 ],{chain:'winter',pool:'seasonal',weight:8,conditions:{all:[season('Primavera'),day(121),{type:'notResolved',id:'thaw'}]}}),
 ev('spring_seed','Semillas para la nueva primavera','Economía','Mara separa las semillas guardadas y pregunta cuánto arriesgar en la siembra.',[
  c('all_in','Sembrar mucho','Menos comida ahora a cambio de cosecha potencial.','Casi toda la semilla útil termina bajo tierra.',[R('food',-8),F('bigPlanting',true),S('morale',2)],[n('harvest',60)]),
  c('balanced','Siembra prudente','Mantienes reservas y una cosecha razonable.','Los campos quedan sembrados sin vaciar el granero.',[R('food',-4),F('normalPlanting',true)],[n('harvest',60)]),
  c('buy_seed','Comprar variedades nuevas','Inviertes monedas en una cosecha más diversa.','Llegan semillas de cebada y nabo desde Dunmere.',[R('coin',-5),F('diversePlanting',true),FA('dunmere',3)],[n('harvest',60)],res('coin',5))
 ],{chain:'winter'}),
 ev('harvest','La cosecha','Estacional','Semanas de trabajo terminan en carros de grano, raíces y fruta.',[
  c('store','Guardar la mayor parte','Seguridad antes que celebración.','El granero queda lleno hasta las vigas.',[R('food',22),S('morale',2),{type:'conditional',condition:t('bigPlanting'),effects:[R('food',12)]},{type:'conditional',condition:t('diversePlanting'),effects:[R('food',6),R('medicine',1)]},F('bigPlanting',false),F('normalPlanting',false),F('diversePlanting',false)]),
  c('feast','Celebrar la cosecha','Comida ahora por moral y reputación.','La plaza se llena de mesas y música.',[R('food',16),S('morale',8),S('reputation',4),{type:'conditional',condition:t('bigPlanting'),effects:[R('food',10)]},{type:'conditional',condition:t('diversePlanting'),effects:[R('food',5),S('reputation',2)]},F('bigPlanting',false),F('normalPlanting',false),F('diversePlanting',false)]),
  c('sell','Vender una parte','Transformas excedente en moneda.','Carros del este se llevan sacos de grano.',[R('food',10),R('coin',10),FA('eastroad',4),{type:'conditional',condition:t('bigPlanting'),effects:[R('food',8),R('coin',4)]},{type:'conditional',condition:t('diversePlanting'),effects:[R('coin',3)]},F('bigPlanting',false),F('normalPlanting',false),F('diversePlanting',false)])
 ],{chain:'winter',pool:'seasonal',weight:6,conditions:season('Otoño')}),

// 62-67: Enfermedad general
 ev('cough','Una tos que no se va','Serio','Tres casas reportan la misma tos seca. Edda no sabe si es frío, humo o el inicio de algo peor.',[
  c('watch','Vigilar síntomas','Aún no gastas medicinas.','Edda anota nombres y pide que avisen si aparece fiebre.',[F('coughWatched',true)],[n('fever_spreads',3)]),
  c('medicine','Tratar pronto','Gastas algo de reserva para cortar casos.','Los enfermos reciben infusiones y descanso.',[R('medicine',-2),S('morale',2)],[n('recovery',5)]),
  c('clean','Limpiar chimeneas y casas','Atacas la causa ambiental.','Tomas organiza limpieza de humo, paja húmeda y hollín.',[R('wood',-3),S('morale',1),F('housesCleaned',true)],[n('fever_spreads',5)])
 ],{chain:'disease',pool:'story',weight:2,conditions:{all:[day(20),f('winterQuarantine')]}}),
 ev('fever_spreads','La fiebre se extiende','Crítico','Ya son ocho enfermos. Edda duerme junto a sus pacientes y apenas prueba comida.',[
  c('quarantine','Declarar cuarentena','Proteges a los sanos a costa de trabajo y libertad.','Las familias enfermas reciben marcas blancas en la puerta.',[S('morale',-5),R('food',-5),F('quarantine',true)],[n('quarantine',1)]),
  c('infirmary','Concentrar enfermos','Si hay enfermería, permite mejores cuidados.','Los enfermos se trasladan a camas limpias y Edda organiza turnos.',[R('medicine',-2),S('morale',2)],[n('recovery',5)],b('infirmary')),
  c('open','Mantener actividad','No paralizas Bramwood, pero aceptas riesgo.','La gente sigue trabajando con pañuelos atados a la cara.',[S('morale',1),F('feverOpen',true)],[n('medicine_shortage',4)])
 ],{chain:'disease',deadline:{days:2,message:'La fiebre cobra una vida antes de que se organice una respuesta.',effects:[POP(-1),S('morale',-8),F('feverDeath',true)],next:[n('medicine_shortage',1)]}}),
 ev('quarantine','Siete días detrás de una puerta','Interno','La cuarentena funciona, pero algunas familias exigen salir para cuidar animales y cosechas.',[
  c('strict','Mantenerla estricta','Salud pública por encima de comodidad.','Dos guardias vigilan las puertas marcadas.',[S('morale',-4),S('safety',2),F('strictQuarantine',true)],[n('recovery',5)]),
  c('work_pass','Permitir salidas de trabajo','Buscas equilibrio.','Se crean turnos separados para campos y animales.',[S('morale',2),F('workPasses',true)],[n('recovery',6)]),
  c('end','Levantarla antes','La presión social gana.','Las marcas blancas se retiran antes de que Edda esté conforme.',[S('morale',4),F('quarantineEndedEarly',true)],[n('fever_spreads',3)])
 ],{chain:'disease'}),
 ev('medicine_shortage','El armario de Edda está casi vacío','Urgente','Quedan vendas, alcohol y poco más. Si surge otro caso grave, no habrá con qué tratarlo.',[
  c('abbey','Comprar remedios a la abadía','Seguro, caro y lento.','Un mensajero sale con monedas y una lista escrita por Edda.',[R('coin',-7),FA('abbey',4)],[n('recovery',3)],res('coin',7)),
  c('herbs','Recolectar hierbas','Oren y Edda buscan sustitutos locales.','Vuelven con corteza, milenrama y raíces útiles.',[R('medicine',3),R('food',-2),S('safety',-1)],[],alive('oren')),
  c('ration','Reservar solo para casos graves','Una decisión fría que puede alargar las reservas.','Edda guarda los últimos frascos bajo llave.',[S('morale',-3),F('medicineRationed',true)],[n('healer_overworked',3)])
 ],{chain:'disease'}),
 ev('healer_overworked','Edda no puede seguir así','Personal','Lleva días durmiendo a ratos y comiendo de pie. Sus manos tiemblan al preparar una venda.',[
  c('rest','Obligarla a descansar','La aldea cubre tareas sencillas.','Edda protesta, pero duerme casi un día entero.',[R('food',-2),S('morale',3),PM('edda','Descansando')],[n('recovery',2)]),
  c('assistant','Asignarle un ayudante','Creas una función nueva para el futuro.','Nia aprende a limpiar heridas y medir dosis.',[F('healerAssistant',true),S('reputation',2),S('morale',2)],[n('recovery',2)]),
  c('continue','Pedirle aguantar','Priorizas a los pacientes actuales.','Edda asiente y vuelve a la cama del siguiente enfermo.',[S('morale',-4),PM('edda','Agotada')],[n('recovery',2)])
 ],{chain:'disease'}),
 ev('recovery','La fiebre rompe','Buen augurio','Los últimos enfermos vuelven a pedir comida y discutir. Edda lo considera una excelente señal.',[
  c('thanks','Reconocer a los cuidadores','La recuperación se convierte en memoria común.','El Consejo agradece públicamente a Edda y a quienes cuidaron casas enfermas.',[S('morale',6),S('reputation',3),PM('edda','Bien'),MS('fever_survived')]),
  c('restock','Priorizar nuevas reservas','Aprendes de la escasez.','Se separan monedas y estantes para medicina futura.',[R('coin',-3),R('medicine',2),F('medicalReserve',true),PM('edda','Bien')]),
  c('record','Registrar lo ocurrido','Ysabel deja escrito quién enfermó y qué tratamientos funcionaron.','La próxima epidemia no empezará desde cero.',[S('reputation',2),F('diseaseRecords',true),PM('edda','Bien')])
 ],{chain:'disease'}),

// 68-75: Bosque
 ev('old_stones','Piedras viejas entre los robles','Misterio','Oren encuentra un círculo de piedras cubierto de musgo a media hora al norte. Alguien dejó flores frescas allí.',[
  c('inspect','Investigar','Quieres saber quién usa el lugar.','Ysabel reconoce marcas anteriores a Ashcombe y pide no mover nada.',[F('oldStonesKnown',true),S('reputation',1)],[n('sacred_grove',5)]),
  c('stone','Traer piedra para construir','Material útil está material útil.','Tomas desmonta dos piedras antes de que Ysabel lo vea.',[R('wood',0),R('coin',1),S('morale',-3),F('stonesDisturbed',true)],[n('sacred_grove',3)]),
  c('leave','Dejarlo en paz','No todo descubrimiento necesita uso.','El círculo queda bajo hojas y silencio.',[S('morale',1),F('stonesProtected',true)])
 ],{chain:'forest',pool:'story',weight:1,conditions:day(18)}),
 ev('missing_child','Un niño no vuelve del bosque','Crítico','Lio Fen salió a buscar setas y no regresó. La luz empieza a caer.',[
  c('all_search','Movilizar a todos','Encuentras rápido a costa de dejar otras tareas.','Casi toda la aldea entra en el bosque con antorchas.',[R('food',-3),S('safety',-2)],[n('white_stag',1)]),
  c('oren','Mandar a Oren','El mejor rastreador, con menos gente.','Oren sigue pequeñas huellas hasta un barranco.',[S('safety',1)],[n('white_stag',1)],alive('oren')),
  c('wait_dawn','Esperar al amanecer','Evitas perder más gente de noche, pero el niño queda fuera.','Nadie duerme. Al amanecer la búsqueda empieza con frío en el estómago.',[S('morale',-7)],[n('white_stag',1)])
 ],{chain:'forest',pool:'story',weight:1,conditions:day(30),deadline:{days:1,message:'La noche pasa sin encontrar a Lio. Al amanecer aparece junto al arroyo, vivo pero con hipotermia.',effects:[R('medicine',-1),S('morale',-4),F('lioFoundLate',true)]}}),
 ev('wolf_pack','Lobos demasiado cerca','Serio','Durante tres noches, lobos rondan corrales y cercas. Pell ya ha perdido dos ovejas.',[
  c('hunt','Cazar a la manada','Proteges ganado con riesgo para Oren.','La batida mata dos lobos y aleja al resto.',[R('food',5),S('safety',3),PM('oren','Arañado')],[],alive('oren')),
  c('pens','Reforzar corrales','Solución defensiva y duradera.','Pell y Tomas elevan las cercas y cierran huecos.',[R('wood',-8),S('safety',4),F('strongPens',true)]),
  c('leave_food','Dejar carroña lejos','Intentas redirigirlos sin matar.','La manada deja de acercarse tanto durante varias noches.',[R('food',-5),S('morale',1),F('wolvesFed',true)],[n('sacred_grove',8)])
 ],{chain:'forest',pool:'ambient',repeatable:true,cooldownDays:18,weight:1,conditions:day(12)}),
 ev('white_stag','El ciervo blanco','Misterio','La búsqueda encuentra a Lio dormido junto a un ciervo completamente blanco que huye cuando os acercáis.',[
  c('follow','Seguir al ciervo','Oren cree que puede llevar a algo.','Las huellas terminan en el círculo de piedras viejas.',[F('whiteStagSeen',true)],[n('sacred_grove',2)]),
  c('child','Volver con el niño','Lo importante es que está vivo.','Lio vuelve envuelto en una manta y recibe más abrazos de los que quiere.',[S('morale',7),F('lioSafe',true)]),
  c('hunt','Intentar cazarlo','Una piel así valdría una fortuna.','La flecha falla y el animal desaparece. Oren no dice nada durante el regreso.',[S('morale',-3),R('coin',1),F('stagHunted',true)],[n('hunters_feud',5)])
 ],{chain:'forest'}),
 ev('sacred_grove','El claro que nadie tala','Misterio','Ysabel cuenta que generaciones anteriores dejaban este claro intacto. No por magia, dice, sino porque el bosque también necesita fronteras.',[
  c('protect','Declararlo protegido','Renuncias a madera y ganas una norma cultural.','Se marca el claro con cintas verdes: aquí no se tala.',[S('morale',4),S('reputation',2),F('groveProtected',true),MS('grove')]),
  c('selective','Permitir tala limitada','Intentas equilibrar tradición y necesidad.','Solo se permite recoger árboles caídos y ramas.',[R('wood',4),S('morale',1),F('groveManaged',true)]),
  c('cut','Abrirlo a la tala','Bramwood necesita madera, no símbolos.','Los primeros árboles caen antes del invierno.',[R('wood',18),S('morale',-6),F('groveCut',true)],[n('forest_fire',15)])
 ],{chain:'forest'}),
 ev('hunters_feud','Oren y los jóvenes cazadores','Interno','Dos jóvenes quieren poner trampas en una zona que Oren considera peligrosa. Lo acusan de guardar los mejores lugares para sí.',[
  c('oren','Respaldar a Oren','La experiencia manda.','Se prohíben trampas al norte sin permiso de Oren.',[S('safety',3),S('morale',-2),F('orenAuthority',true)]),
  c('share','Obligarlo a enseñarles','Conviertes conocimiento personal en conocimiento común.','Oren acepta enseñar rastreo, a regañadientes.',[S('morale',3),S('reputation',2),F('hunterTraining',true)]),
  c('free','Que cada uno cace donde quiera','Más producción, más riesgo.','Las trampas aparecen por todo el bosque.',[R('food',5),S('safety',-4),F('openHunting',true)])
 ],{chain:'forest'}),
 ev('forest_fire','Humo al norte','Crítico','Una línea de humo sube desde el bosque. El viento sopla hacia Bramwood.',[
  c('fight','Combatir el fuego','Todos los capaces cargan agua y abren cortafuegos.','La línea se detiene a menos de un kilómetro de las casas.',[R('wood',-8),R('food',-4),S('safety',2),S('morale',5)],[n('burned_grove',2)]),
  c('protect_village','Defender solo Bramwood','Dejas arder bosque para asegurar casas.','Los campos se salvan, pero una gran mancha negra queda al norte.',[S('safety',7),R('wood',-12),S('morale',-2)],[n('burned_grove',2)]),
  c('evacuate','Preparar evacuación','Priorizas vidas si el viento cambia.','Carros y niños esperan al sur mientras el fuego pasa de largo.',[R('food',-5),S('morale',-3),S('safety',5)],[n('burned_grove',2)])
 ],{chain:'forest',pool:'seasonal',weight:2,conditions:{all:[season('Verano'),day(35)]}}),
 ev('burned_grove','Después del incendio','Consecuencia','El suelo ennegrecido deja al descubierto piedras, raíces y metal viejo que nadie había visto.',[
  c('replant','Replantar','Un gesto lento para años futuros.','Niños y adultos plantan pequeños robles en la tierra quemada.',[R('food',-2),S('morale',5),F('forestReplanted',true)]),
  c('salvage','Aprovechar madera quemada','Recuperas algo antes de que se pudra.','Garran organiza la recogida de troncos útiles.',[R('wood',14),S('morale',-1)]),
  c('search','Explorar lo expuesto','Buscas qué ocultaba el bosque.','Oren encuentra restos de una calzada mucho más antigua que Bramwood.',[S('reputation',2),F('oldRoadFound',true)],[n('strange_lights',8)])
 ],{chain:'forest'}),

// 76-85: Vida interna
 ev('wood_dispute','Una disputa por la leña','Interno','Dos familias se acusan mutuamente de tomar más leña de la asignada.',[
  c('ration','Imponer raciones iguales','Orden claro, aunque no guste.','Cada casa recibe una marca semanal de leña.',[R('wood',3),S('morale',-2),F('woodRationing',true)]),
  c('mediate','Mediar entre las familias','Consume tu atención, pero puede cerrar la herida.','Tras una larga conversación, ambas familias aceptan un reparto común.',[S('morale',4),S('reputation',1)]),
  c('fine','Multar a quien tomó de más','Una respuesta firme basada en testimonios.','La multa entra en la caja y una familia queda resentida.',[R('coin',2),S('morale',-3),S('safety',1)])
 ],{chain:'social',pool:'ambient',repeatable:true,cooldownDays:14,weight:2,conditions:day(4)}),
 ev('marriage_request','Una boda en Bramwood','Personal','Mara y un joven de Dunmere piden celebrar su unión aquí. Él quiere mudarse a Bramwood después.',[
  c('feast','Celebrar una boda grande','Comida por alegría, reputación y un nuevo habitante.','La plaza se llena de cintas, música y mesas largas.',[R('food',-10),S('morale',10),FA('dunmere',6),POP(1),F('maraMarried',true)]),
  c('simple','Ceremonia sencilla','Una celebración pequeña y barata.','Ysabel oficia bajo el roble y Nia hornea dos panes especiales.',[R('food',-3),S('morale',5),POP(1),F('maraMarried',true)]),
  c('dunmere','Sugerir que vivan en Dunmere','Bramwood pierde a Mara, pero fortalece la relación vecinal.','Mara acepta con tristeza y prepara sus cosas.',[FA('dunmere',10),S('morale',-6),PM('mara','Se mudó a Dunmere'),POP(-1),F('maraLeft',true)])
 ],{chain:'social',pool:'story',weight:1,conditions:{all:[day(40),alive('mara')]}}),
 ev('funeral','Una muerte tranquila','Personal','Un anciano sin papel en el Consejo muere dormido. Su familia pide decidir cómo despedirlo.',[
  c('communal','Funeral comunitario','Toda la aldea se detiene unas horas.','La campana suena y cada casa aporta algo a la mesa de duelo.',[R('food',-4),S('morale',3),F('funeralTradition',true)]),
  c('family','Dejarlo en familia','Respetas intimidad y mantienes trabajo.','Solo familiares y amigos cercanos acompañan el entierro.',[S('morale',1)]),
  c('shrine','Enterrar junto al santuario','Creas un lugar común de memoria.','Una piedra con su nombre queda junto al santuario.',[S('morale',4),FA('abbey',2)],[],b('shrine'))
 ],{chain:'social',pool:'ambient',repeatable:true,cooldownDays:25,weight:1,conditions:day(25)}),
 ev('theft','Falta una bolsa de monedas','Interno','Desaparecen cinco monedas de la caja común. Solo cuatro personas tenían acceso a la habitación.',[
  c('search','Registrar casas','Buscas pruebas aunque invadas privacidad.','No encuentras las monedas, pero la confianza cae.',[S('morale',-5),S('safety',2),F('searchedHomes',true)],[n('accused',2)]),
  c('quiet','Investigar discretamente','Ysabel habla con cada persona por separado.','Una historia no encaja: Pell estuvo cerca de la casa común.',[F('pellSuspect',true)],[n('accused',1)]),
  c('forgive','Dar la pérdida por asumida','Cinco monedas no valen una caza de brujas.','La caja se cierra con una nueva cerradura y nadie es acusado.',[R('coin',-5),S('morale',2),R('wood',-1),F('theftForgiven',true)])
 ],{chain:'social',pool:'story',weight:1,conditions:{all:[day(28),res('coin',8)]}}),
 ev('accused','Pell bajo sospecha','Interno','Pell admite que entró a buscar una manta, pero niega haber tomado monedas. Su nerviosismo no ayuda.',[
  c('believe','Creerle','No condenas por carácter.','La investigación se cierra sin culpable y Pell casi llora de alivio.',[S('morale',3),F('pellTrusted',true)]),
  c('fine','Hacerle devolver cinco monedas','Asumes culpabilidad sin prueba definitiva.','Pell paga con la venta de una oveja.',[R('coin',5),S('morale',-5),F('pellFined',true)]),
  c('watch','Vigilarlo sin castigo','Mantienes la duda abierta.','Oren presta atención durante varios días. No ve nada extraño.',[S('safety',1),S('morale',-1),F('pellWatched',true)])
 ],{chain:'social'}),
 ev('council_split','El Consejo se parte en dos','Política','Ysabel quiere reglas escritas; Oren cree que demasiadas normas convertirán Bramwood en otro Ashcombe.',[
  c('written','Crear un libro de normas','La memoria deja de depender de personas.','Ysabel empieza el Libro de Bramwood con cinco reglas básicas.',[S('reputation',5),S('morale',-1),F('writtenLaws',true),MS('laws')]),
  c('custom','Mantener decisiones caso por caso','Flexibilidad por encima de formalidad.','El Consejo conserva su forma informal.',[S('morale',3),F('customLaw',true)]),
  c('hybrid','Escribir solo derechos básicos','Intentas satisfacer a ambos.','Se escriben límites al poder del Consejo y derechos de cada hogar.',[S('reputation',4),S('morale',4),F('rightsCharter',true),MS('rights')])
 ],{chain:'social',pool:'story',weight:1,conditions:day(50)}),
 ev('festival','La fiesta de Bramwood','Buen augurio','Nia propone reservar un día al año para una fiesta propia, no heredada de ningún señor ni abadía.',[
  c('harvest','Fiesta de cosecha','Comida, bebida y mercado.','Se elige el primer sábado tras la cosecha como fiesta de Bramwood.',[R('food',-8),S('morale',8),S('reputation',4),F('harvestFestival',true),MS('festival')]),
  c('founding','Día de fundación','Una fecha cívica para recordar que Bramwood eligió existir.','Ysabel fija la fecha según la crónica más antigua.',[S('morale',6),S('reputation',6),F('foundingDay',true),MS('festival')]),
  c('no','No necesitamos otra obligación','Mantienes el calendario simple.','Nia se encoge de hombros y guarda la idea para otro año.',[S('morale',-1)])
 ],{chain:'social',pool:'story',weight:1,conditions:day(45)}),
 ev('brewer','Una cervecera pide instalarse','Oportunidad','Sera Voln viaja con dos barriles y experiencia cervecera. Busca una aldea donde empezar de nuevo.',[
  c('welcome','Ofrecerle casa y espacio','Ganas una artesana y una nueva familia.','Sera instala sus barriles junto al almacén.',[R('food',-4),S('morale',4),POP(2),F('brewerResident',true),{type:'personAdd',person:{id:'sera',name:'Sera Voln',role:'Cervecera',trait:'Sociable',status:'Bien',alive:true,loyalty:50}}]),
  c('trial','Permitir una temporada de prueba','No prometes permanencia todavía.','Sera alquila un cobertizo por un mes.',[R('coin',3),S('morale',2),F('brewerTrial',true)]),
  c('decline','No tenemos grano para cerveza','Priorizas alimento.','Sera sigue camino hacia Dunmere.',[FA('dunmere',2)])
 ],{chain:'social',pool:'story',weight:1,conditions:{all:[day(32),res('food',45)]}}),
 ev('school_request','“¿Quién enseñará a los niños?”','Social','Ysabel señala que cada vez hay más niños y casi ninguno sabe leer números o cartas.',[
  c('ysabel','Pedir a Ysabel que enseñe','No cuesta dinero, pero consume su energía.','Tres tardes por semana, la casa comunal se llena de tablillas.',[S('morale',4),F('schoolTeacher',true)],[],alive('ysabel')),
  c('abbey','Solicitar un novicio','La abadía puede enviar alguien formado.','Saint Alder promete un maestro durante la primavera.',[FA('abbey',6),R('coin',-3),F('schoolTeacher',true)]),
  c('later','Aplazarlo','Hay problemas más urgentes.','La pregunta queda sin respuesta por ahora.',[S('morale',-2)])
 ],{chain:'social',pool:'story',weight:1,conditions:{all:[day(55),{type:'popMin',value:25}]}}),
 ev('faith_question','Campanas o robles','Social','Un monje propone levantar una capilla formal. Ysabel recuerda que Bramwood siempre juró bajo el roble viejo.',[
  c('chapel','Aceptar una capilla','Fortalece lazos con Saint Alder.','El monje bendice un pequeño terreno junto al camino.',[FA('abbey',12),S('reputation',4),F('chapelPlanned',true)]),
  c('roble','Mantener el santuario local','La tradición de Bramwood sigue siendo propia.','Las cintas del roble se renuevan al amanecer.',[S('morale',5),FA('abbey',-2),F('oakTradition',true)]),
  c('both','Dar espacio a ambos','No obligas a elegir una sola tradición.','Se acuerda una capilla pequeña sin tocar el roble.',[S('morale',3),FA('abbey',6),S('reputation',3),F('pluralFaith',true)])
 ],{chain:'social',pool:'story',weight:1,conditions:day(65)}),

// 86-100: Sucesos cotidianos/ambientales
 ev('boars','Jabalíes en los huertos','Cotidiano','Una piara ha destrozado parte de una cerca durante la noche.',[
  c('hunt','Organizar una batida','Riesgo pequeño a cambio de carne.','La batida vuelve con carne y sin heridos graves.',[R('food',8),S('safety',-1),S('morale',1)]),
  c('fence','Reforzar cercas','Gastas madera para prevenir nuevos daños.','Las cercas quedan más altas y cerradas.',[R('wood',-7),S('safety',2),F('boarFence',true)]),
  c('drive','Ahuyentarlos con ruido','Barato, menos seguro.','Durante una hora toda Bramwood golpea ollas y tablas.',[S('morale',2),R('food',-2)])
 ],{pool:'ambient',repeatable:true,cooldownDays:12,weight:3,conditions:day(4)}),
 ev('broken_cart','Un carro roto en el camino','Cotidiano','Una familia viajera tiene el eje partido y pide herramientas.',[
  c('repair','Ayudar a repararlo','Tomas pierde unas horas, pero gana gratitud.','El carro vuelve al camino antes de anochecer.',[R('wood',-2),S('reputation',3),FA('eastroad',2)]),
  c('sell','Venderles materiales','Ayudas y cobras.','La familia paga por madera, clavos y una hora de trabajo.',[R('wood',-3),R('coin',3),S('reputation',1)]),
  c('no','No podemos parar','Conservas recursos.','El carro sigue al borde del camino cuando cae la noche.',[S('reputation',-1)])
 ],{pool:'ambient',repeatable:true,cooldownDays:15,weight:2,conditions:day(6)}),
 ev('traveling_minstrel','Un músico bajo la lluvia','Oportunidad','Un laudista pide techo por una noche y ofrece canciones a cambio.',[
  c('hall','Abrir la casa comunal','Una noche de música para todos.','Las canciones duran hasta que se apagan las velas.',[R('food',-2),S('morale',6),S('reputation',2)]),
  c('rumors','Pedir noticias en vez de música','Información sobre caminos, mercados y guerra.','El músico cuenta rumores de Ashcombe y del camino este.',[F('heardRumors',true),S('reputation',1)]),
  c('send','Dar pan y seguir','Hospitalidad mínima.','El laudista agradece el pan y continúa bajo la lluvia.',[R('food',-1)])
 ],{pool:'ambient',repeatable:true,cooldownDays:20,weight:2,conditions:day(8)}),
 ev('stray_dog','Un perro sin dueño','Cotidiano','Un perro flaco lleva dos días siguiendo a los niños y durmiendo junto al horno de Nia.',[
  c('keep','Adoptarlo','Una boca mínima a cambio de compañía y alerta.','Los niños lo llaman Bramble antes de que puedas opinar.',[R('food',-1),S('morale',4),S('safety',1),F('dog',true)]),
  c('hunter','Dárselo a Oren','Puede servir como perro de caza.','Oren prueba su olfato y, por primera vez, sonríe abiertamente.',[S('morale',2),R('food',1),F('huntingDog',true)],[],alive('oren')),
  c('send','No podemos mantenerlo','Lo llevas lejos del camino de las casas.','El perro desaparece entre los árboles.',[S('morale',-2)])
 ],{pool:'ambient',weight:1,conditions:day(10)}),
 ev('beekeeper','Colmenas en el claro','Oportunidad','Una apicultora de Dunmere ofrece enseñar a dos personas a mantener colmenas por cinco monedas.',[
  c('learn','Pagar la enseñanza','Una habilidad nueva para Bramwood.','Dos colmenas simples aparecen junto a los huertos.',[R('coin',-5),S('morale',2),FA('dunmere',3),F('bees',true)],[],res('coin',5)),
  c('trade','Comprar solo miel','Pequeño lujo y medicina casera.','Edda guarda parte de la miel para heridas y tos.',[R('coin',-2),R('medicine',1),S('morale',1)],[],res('coin',2)),
  c('decline','No gastar ahora','La apicultora sigue ruta.','Las colmenas viajan hacia otra aldea.',[])
 ],{pool:'ambient',weight:1,conditions:day(14)}),
 ev('wandering_smith','El herrero itinerante','Oportunidad','Un herrero con mula ofrece reparar cuchillas y herramientas antes de seguir camino.',[
  c('tools','Reparar herramientas','Mejora reservas de útiles.','Las hojas vuelven afiladas y los mangos firmes.',[R('coin',-5),R('tools',3)],[],res('coin',5)),
  c('weapons','Reforzar armas y puntas','Mejora defensa más que producción.','Lanzas, cuchillos y puntas de flecha pasan por su yunque.',[R('coin',-5),S('safety',4)],[],res('coin',5)),
  c('host','Ofrecerle quedarse','Intentas sumar un oficio importante.','Lo piensa, pero dice que quizá vuelva cuando termine su ruta.',[R('food',-2),S('reputation',2),F('smithInvited',true)])
 ],{pool:'ambient',repeatable:true,cooldownDays:25,weight:2,conditions:day(12)}),
 ev('grain_mold','Moho en el granero','Serio','Un rincón del grano huele dulce y húmedo. Parte de los sacos se ha echado a perder.',[
  c('discard','Tirar todo lo afectado','Pierdes comida y evitas enfermedad.','Los sacos contaminados terminan en una hoguera.',[R('food',-10),S('safety',2)]),
  c('sort','Separar grano a mano','Salvas parte con trabajo cuidadoso.','Mara y Nia pasan horas separando grano sano.',[R('food',-5),S('morale',-1)]),
  c('feed','Usarlo para animales','Arriesgas ganado para no desperdiciar.','Pell mezcla pequeñas cantidades con pienso.',[R('food',-2),S('safety',-2),F('moldFed',true)])
 ],{pool:'ambient',repeatable:true,cooldownDays:22,weight:2,conditions:{all:[day(20),nb('granary')]}}),
 ev('storm_damage','Una tormenta arranca tejas','Urgente','Viento y lluvia golpean Bramwood durante horas. Varias casas pierden tejas y una cerca cae.',[
  c('repair','Reparar de inmediato','Madera y trabajo antes de que vuelva a llover.','Tomas organiza reparaciones bajo un cielo todavía oscuro.',[R('wood',-9),S('safety',3)]),
  c('priority','Solo casas habitadas','Aplazas cercas y cobertizos.','Las familias duermen secas, pero el ganado queda peor protegido.',[R('wood',-5),S('safety',-1),S('morale',2)]),
  c('wait','Esperar a que pase la estación','Conservas madera.','Cubiertas provisionales aguantan como pueden.',[S('morale',-3),S('safety',-2)])
 ],{pool:'seasonal',repeatable:true,cooldownDays:16,weight:3,conditions:{any:[season('Primavera'),season('Otoño')]}}),
 ev('birth','Un nacimiento','Personal','Una familia anuncia que el parto ha comenzado. Edda pide agua caliente y manos tranquilas.',[
  c('support','Movilizar ayuda','La aldea cubre trabajo y comida de la familia.','Horas después se oye el llanto de un bebé sano.',[R('food',-3),S('morale',6),POP(1)]),
  c('edda','Dejarlo en manos de Edda','Confías en la curandera.','Edda sale cansada pero sonriendo: madre y bebé están bien.',[S('morale',4),POP(1)],[],alive('edda')),
  c('gift','Regalo del Consejo','Una pequeña tradición para cada nuevo habitante.','La familia recibe pan, una manta y dos monedas.',[R('food',-2),R('coin',-2),S('morale',7),POP(1),F('birthGiftTradition',true)])
 ],{pool:'ambient',repeatable:true,cooldownDays:28,weight:1,conditions:day(25)}),
 ev('old_age_death','Una silla vacía','Personal','Una persona mayor de Bramwood muere después de una breve enfermedad, rodeada de familia.',[
  c('remember','Detenerse a recordar','La comunidad se reúne y comparte historias.','La pérdida duele, pero nadie la atraviesa solo.',[S('morale',2),POP(-1)]),
  c('work','Mantener rutina','La familia despide en privado mientras la aldea sigue.','El día continúa más silencioso de lo normal.',[S('morale',-1),POP(-1)])
 ],{pool:'ambient',repeatable:true,cooldownDays:35,weight:1,conditions:day(40)}),
 ev('deserter','Un soldado sin insignia','Misterio','Un joven agotado pide comida. Dice haber abandonado la milicia de Ashcombe y teme ser ahorcado si lo encuentran.',[
  c('hide','Ocultarlo','Proteges a un desertor y asumes riesgo político.','Recibe ropa de trabajo y un nombre falso.',[R('food',-3),FA('ashcombe',-5),S('morale',2),F('deserterHidden',true)]),
  c('send','Dar comida y mandarlo lejos','Ayudas sin vincular Bramwood.','Parte antes del amanecer por una senda secundaria.',[R('food',-2),S('reputation',1)]),
  c('report','Avisar a Ashcombe','Cumples la ley del barón.','Dos guardias vienen a buscarlo al día siguiente.',[FA('ashcombe',6),S('morale',-3),R('coin',2)])
 ],{pool:'story',weight:1,conditions:day(45)}),
 ev('dice_game','Dados detrás del almacén','Interno','Una partida de dados entre trabajadores termina con insultos y una nariz rota.',[
  c('ban','Prohibir apuestas','Cortas el problema de raíz.','Los dados desaparecen de la plaza, al menos en público.',[S('morale',-2),S('safety',2),F('gamblingBan',true)]),
  c('rules','Permitir con límites','Se puede jugar sin deudas ni apuestas de comida.','Ysabel dicta tres reglas y todos se ríen de la solemnidad.',[S('morale',2),S('reputation',1)]),
  c('ignore','Es asunto privado','No intervienes en cada pelea.','La nariz se cura y la deuda no.',[S('safety',-1)])
 ],{pool:'ambient',repeatable:true,cooldownDays:18,weight:1,conditions:day(18)}),
 ev('lost_goat','La cabra de Pell','Cotidiano','Una cabra escapa y aparece subida al tejado de la casa comunal.',[
  c('rescue','Bajarla con cuidado','Pierdes una hora y ganas una historia.','Tomas construye una rampa absurda que, contra pronóstico, funciona.',[S('morale',3)]),
  c('pell','Que Pell se arregle','Es su animal y su problema.','Pell tarda media tarde y varias blasfemias en bajarla.',[S('morale',1)]),
  c('sell','Esto pasa demasiado: venderla','Una solución definitiva.','Un viajero compra la cabra por dos monedas.',[R('coin',2),S('morale',-1)])
 ],{pool:'ambient',repeatable:true,cooldownDays:16,weight:1,conditions:day(5)}),
 ev('peddler_books','Un vendedor de libros usados','Oportunidad','Un buhonero trae seis libros maltrechos: cuentas, hierbas, historias y un atlas incompleto.',[
  c('buy_all','Comprar los seis','Caro, pero raro.','Los libros pasan a una estantería de la casa comunal.',[R('coin',-8),S('reputation',4),S('morale',2),F('books',true)],[],res('coin',8)),
  c('herbal','Comprar el de hierbas','Edda obtiene referencias nuevas.','El libro tiene manchas, pero también dibujos útiles.',[R('coin',-3),R('medicine',2),F('herbalBook',true)],[],res('coin',3)),
  c('atlas','Comprar el atlas','Mejoras conocimiento de rutas.','Oren marca senderos que el atlas ni siquiera conoce.',[R('coin',-3),S('safety',2),F('atlas',true)],[],res('coin',3))
 ],{pool:'ambient',weight:1,conditions:day(35)}),
 ev('strange_lights','Luces en la vieja calzada','Misterio','Dos noches seguidas alguien ve pequeñas luces moviéndose donde el incendio dejó visible una calzada antigua.',[
  c('investigate','Investigar de noche','Oren y dos voluntarios siguen las luces.','Descubren viajeros clandestinos usando faroles cubiertos para evitar el camino principal.',[S('safety',1),F('secretRoad',true)],[n('smugglers',4)]),
  c('watchtower','Observar desde lejos','No te expones.','Las luces aparecen tres noches y luego desaparecen.',[S('safety',2),F('lightsWatched',true)]),
  c('block','Bloquear la calzada','Evitas tráfico desconocido.','Se derriban dos árboles sobre el antiguo camino.',[R('wood',-3),S('safety',4),S('reputation',-1)])
 ],{chain:'forest'}),

// Extra roots / continuations to reach long campaign depth
 ev('conscripts_return','Los jóvenes vuelven de la frontera','Personal','Meses después, uno de los dos reclutas regresa. El otro murió lejos de Bramwood.',[
  c('welcome','Recibirlo como veterano','Reconoces sacrificio y dolor.','La aldea se reúne en silencio cuando entra por el camino sur.',[S('morale',3),S('safety',2),POP(1),F('veteranHome',true)]),
  c('questions','Pedir información militar','Su experiencia puede ayudar a la defensa.','Dibuja posiciones, patrullas y formas de proteger una calle estrecha.',[S('safety',5),POP(1),F('militaryKnowledge',true)]),
  c('rest','No pedirle nada','Primero necesita ser persona otra vez.','Pasa semanas trabajando poco y durmiendo mal.',[S('morale',4),POP(1)])
 ],{chain:'barony'}),
 ev('first_anniversary','Un año de Bramwood','Legado','Ha pasado un año desde que comenzó esta crónica. La aldea no es la misma y tampoco lo eres tú.',[
  c('remember','Leer la crónica en la plaza','La memoria se vuelve parte de la identidad.','Ysabel lee decisiones, muertos, llegadas y cosechas. Nadie escucha igual que hace un año.',[S('morale',8),S('reputation',6),MS('year_one')]),
  c('future','Anunciar un segundo año de crecimiento','Miras adelante.','Se habla de nuevas casas, comercio y familias por venir.',[S('morale',5),S('reputation',4),F('growthYear',true),MS('year_one')]),
  c('quiet','Celebrarlo solo con una cena','No necesitas discursos para saber lo que costó llegar aquí.','La comida es sencilla y dura hasta tarde.',[R('food',-6),S('morale',6),MS('year_one')])
 ],{chain:'legacy'}),
 ev('abbey_relic','Una caja sellada de Saint Alder','Misterio','La abadía pide guardar durante una semana una caja pequeña y pesada. No explican qué contiene.',[
  c('accept','Custodiarla','Ganas confianza sin hacer preguntas.','La caja queda bajo llave y dos monjes duermen cerca.',[FA('abbey',8),S('reputation',2),F('relicGuarded',true)]),
  c('ask','Exigir saber qué es','No aceptas riesgos ciegos.','Dentro hay documentos antiguos y un relicario de plata.',[FA('abbey',2),F('relicKnown',true)]),
  c('decline','Rechazar','Bramwood no es almacén de secretos ajenos.','Los monjes siguen hacia Dunmere.',[FA('abbey',-4),S('morale',1)])
 ],{chain:'abbey',pool:'story',weight:1,conditions:{all:[day(70),facMin('abbey',10)]}}),
 ev('dunmere_fire','Fuego en Dunmere','Urgente','Un corredor llega cubierto de ceniza: varias casas de Dunmere arden y piden ayuda.',[
  c('send_help','Enviar agua, manos y madera','Ayudas al vecino aunque Bramwood pierda reservas.','Doce personas parten con cubos y herramientas.',[R('wood',-10),R('food',-4),FA('dunmere',15),S('reputation',6)]),
  c('supplies','Enviar solo suministros','Ayudas sin vaciar Bramwood de trabajadores.','Un carro sale cargado de mantas y madera.',[R('wood',-7),R('food',-3),FA('dunmere',8),S('reputation',3)]),
  c('no','No podemos asumirlo','La aldea vecina tendrá que arreglárselas.','El corredor vuelve solo.',[FA('dunmere',-10),S('morale',-3)])
 ],{chain:'neighbors',pool:'story',weight:1,conditions:day(60)}),
 ev('new_settlers','Una familia quiere quedarse','Oportunidad','Una familia de cinco viaja hacia el norte y pregunta si Bramwood acepta nuevos habitantes.',[
  c('welcome','Darles sitio','Más manos y más bocas.','La familia ocupa una cabaña libre y promete trabajar en campos y animales.',[R('food',-6),S('morale',3),S('reputation',3),{type:'householdAdd',household:{id:'aster',name:'Casa Aster',adults:3,children:2,work:'Campos y ganado'}}]),
  c('conditional','Aceptar si construyen su casa','Ellos aportan trabajo y parte de materiales.','Acampan en el borde oeste mientras levantan una cabaña.',[R('wood',-6),S('reputation',2),POP(5),F('settlersBuilding',true)]),
  c('decline','No hay espacio','Evitas hacinamiento.','La familia continúa hacia Dunmere.',[S('morale',-1),FA('dunmere',2)])
 ],{chain:'growth',pool:'story',weight:1,conditions:{all:[day(35),statMin('reputation',4)]}}),
 ev('food_theft','Alguien roba comida','Interno','Faltan sacos del almacén. Las huellas son de botas pequeñas, quizá adolescentes.',[
  c('investigate','Investigar','Buscas causa antes que castigo.','Dos jóvenes admiten que llevaban comida a una familia que no quería pedir ayuda.',[F('hiddenHunger',true)],[n('council_split',4)]),
  c('guard','Poner guardia','Proteges reservas sin buscar motivos.','La puerta del almacén queda vigilada por turnos.',[S('safety',3),S('morale',-2)]),
  c('ration','Revisar reparto de comida','Tratas el problema como señal sistémica.','Se descubre que una familia recibía menos por un error de cuentas.',[R('food',-2),S('morale',4),S('reputation',2)])
 ],{chain:'social',pool:'story',weight:1,conditions:{all:[day(25),statMax('morale',55)]}}),
 ev('bridge_flood','La crecida amenaza el puente','Urgente','Días de lluvia hinchan el arroyo. El viejo puente cruje y ramas golpean sus pilares.',[
  c('save','Reforzar el puente','Madera y riesgo para mantener la ruta.','Tomas ancla los pilares con cuerdas y troncos.',[R('wood',-10),S('safety',2),FA('eastroad',4)]),
  c('close','Cerrar el paso','Pierdes comercio por seguridad.','Se colocan barreras y los viajeros deben esperar.',[FA('eastroad',-3),S('safety',4)]),
  c('let','Dejar que aguante','No gastas nada y confías en la estructura.','El puente sobrevive, pero una sección queda inclinada.',[S('safety',-3),F('bridgeDamaged',true)])
 ],{chain:'weather',pool:'seasonal',repeatable:true,cooldownDays:20,weight:2,conditions:{all:[season('Primavera'),day(15)]}})
];

return {EVENTS,PROJECTS,INITIAL_PEOPLE,INITIAL_HOUSEHOLDS,INITIAL_FACTIONS};
});
