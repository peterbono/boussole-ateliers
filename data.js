// Workshop Compass: structural data (ids, scores, durations). Texts in i18n/, layouts in layouts.*.js
const STAGES = [{id:'idee'},{id:'prepmf'},{id:'postpmf'},{id:'scale'},{id:'mature'}];
const TEAMS = [{id:'xs', size:3},{id:'s', size:10},{id:'m', size:30},{id:'l', size:80}];
const TRIGGERS = [{id:'kickoff'},{id:'pivot'},{id:'backlog'},{id:'misalign'},{id:'slow'},{id:'growth'},{id:'refonte'}];
const GOALS = [{id:'vision'},{id:'users'},{id:'ideas'},{id:'prio'},{id:'design'},{id:'align'},{id:'process'},{id:'measure'}];
const HORIZONS = [{id:'demi', cap:2},{id:'semaine', cap:5},{id:'programme', cap:10}];
const PHASES = [{id:'cadrage', h:'--h-cadrage'},{id:'strategie', h:'--h-strategie'},{id:'research', h:'--h-research'},{id:'ideation', h:'--h-ideation'},{id:'prio', h:'--h-prio'},{id:'conception', h:'--h-conception'},{id:'alignement', h:'--h-alignement'},{id:'mesure', h:'--h-mesure'}];

/* fit = [idea, pre-PMF, post-PMF, scale-up, mature], 0 (not relevant) to 3 (core). Texts live in i18n/*.js */
const T = [
 {id:'kickoff',phase:'cadrage',fit:[2,2,3,3,3],goals:['align'],triggers:['kickoff','refonte'],dur:2},
 {id:'problem',phase:'cadrage',fit:[3,3,2,2,2],goals:['vision','users'],triggers:['kickoff','pivot','refonte'],dur:1.5},
 {id:'stakeholders',phase:'cadrage',fit:[1,1,2,3,3],goals:['align'],triggers:['kickoff','misalign','refonte'],dur:1},
 {id:'charter',phase:'cadrage',fit:[2,2,3,3,2],goals:['align','process'],triggers:['kickoff','misalign','slow'],dur:2},
 {id:'lean',phase:'strategie',fit:[3,3,1,0,0],goals:['vision'],triggers:['kickoff','pivot'],dur:2},
 {id:'bmc',phase:'strategie',fit:[2,2,3,2,2],goals:['vision'],triggers:['pivot','growth'],dur:3},
 {id:'vpc',phase:'strategie',fit:[3,3,2,1,2],goals:['vision','users'],triggers:['pivot','kickoff','growth'],dur:2},
 {id:'vision',phase:'strategie',fit:[2,2,3,3,2],goals:['vision'],triggers:['kickoff','misalign','pivot'],dur:2},
 {id:'impact',phase:'strategie',fit:[1,2,3,3,3],goals:['vision','prio','measure'],triggers:['kickoff','backlog','growth'],dur:3},
 {id:'box',phase:'strategie',fit:[2,2,2,1,1],goals:['vision','ideas'],triggers:['kickoff','pivot'],dur:1.5},
 {id:'positioning',phase:'strategie',fit:[2,2,3,2,3],goals:['vision'],triggers:['pivot','growth'],dur:1.5},
 {id:'nsm',phase:'strategie',fit:[0,2,3,3,3],goals:['measure','vision'],triggers:['growth','misalign','kickoff'],dur:3},
 {id:'okr',phase:'strategie',fit:[0,1,3,3,3],goals:['vision','align','measure'],triggers:['misalign','growth','backlog'],dur:3},
 {id:'horizons',phase:'strategie',fit:[0,0,1,2,3],goals:['vision'],triggers:['growth','refonte'],dur:2},
 {id:'prfaq',phase:'strategie',fit:[2,2,2,3,3],goals:['vision','align'],triggers:['kickoff','refonte'],dur:4},
 {id:'persona',phase:'research',fit:[2,3,2,2,2],goals:['users'],triggers:['kickoff','refonte','pivot'],dur:2},
 {id:'jtbd',phase:'research',fit:[3,3,3,2,3],goals:['users','vision'],triggers:['pivot','growth','kickoff'],dur:2.5},
 {id:'empathy',phase:'research',fit:[3,3,2,1,1],goals:['users'],triggers:['kickoff','refonte'],dur:1},
 {id:'journey',phase:'research',fit:[1,2,3,3,3],goals:['users','design'],triggers:['refonte','growth','kickoff'],dur:3},
 {id:'research-plan',phase:'research',fit:[3,3,2,2,2],goals:['users'],triggers:['kickoff','pivot','refonte'],dur:1.5},
 {id:'assumptions',phase:'research',fit:[3,3,3,2,2],goals:['users','prio'],triggers:['kickoff','pivot'],dur:2},
 {id:'ost',phase:'research',fit:[1,2,3,3,3],goals:['users','ideas','prio'],triggers:['growth','backlog','kickoff'],dur:2.5},
 {id:'blueprint',phase:'research',fit:[0,1,2,3,3],goals:['design','align'],triggers:['refonte','slow'],dur:4},
 {id:'kano',phase:'research',fit:[0,1,2,2,3],goals:['prio','users'],triggers:['backlog','growth'],dur:2},
 {id:'hmw',phase:'ideation',fit:[3,3,3,2,2],goals:['ideas'],triggers:['kickoff','growth','refonte'],dur:1},
 {id:'mindmap',phase:'ideation',fit:[3,2,2,1,1],goals:['ideas'],triggers:['kickoff','pivot'],dur:1},
 {id:'affinity',phase:'ideation',fit:[2,3,3,2,2],goals:['users','ideas'],triggers:['kickoff','refonte','growth'],dur:2},
 {id:'crazy8',phase:'ideation',fit:[2,3,3,2,2],goals:['ideas','design'],triggers:['kickoff','refonte'],dur:0.75},
 {id:'brainwriting',phase:'ideation',fit:[2,2,2,2,2],goals:['ideas'],triggers:['growth','kickoff'],dur:0.75},
 {id:'dotvote',phase:'ideation',fit:[2,2,2,2,2],goals:['ideas','prio'],triggers:['kickoff','backlog','growth'],dur:0.25},
 {id:'sprint',phase:'ideation',fit:[3,3,2,2,2],goals:['ideas','design','users'],triggers:['kickoff','pivot','refonte'],dur:35},
 {id:'experiments',phase:'ideation',fit:[3,3,3,2,2],goals:['measure','ideas'],triggers:['pivot','growth','kickoff'],dur:1.5},
 {id:'impact-effort',phase:'prio',fit:[2,3,3,3,3],goals:['prio'],triggers:['backlog','growth','kickoff'],dur:1},
 {id:'rice',phase:'prio',fit:[0,1,3,3,3],goals:['prio'],triggers:['backlog'],dur:2},
 {id:'moscow',phase:'prio',fit:[1,2,3,2,2],goals:['prio'],triggers:['kickoff','backlog'],dur:1.5},
 {id:'storymap',phase:'prio',fit:[2,3,3,3,2],goals:['prio','design'],triggers:['kickoff','refonte','backlog'],dur:3},
 {id:'roadmap',phase:'prio',fit:[1,2,3,3,3],goals:['prio','align'],triggers:['misalign','backlog','growth'],dur:2},
 {id:'nnl',phase:'prio',fit:[1,3,3,3,2],goals:['prio','align'],triggers:['backlog','misalign'],dur:1.5},
 {id:'decision',phase:'prio',fit:[1,2,2,3,3],goals:['prio'],triggers:['backlog'],dur:1.5},
 {id:'wsjf',phase:'prio',fit:[0,0,1,3,3],goals:['prio'],triggers:['backlog','slow'],dur:2,minTeam:16},
 {id:'sprintplan',phase:'prio',fit:[1,2,3,3,2],goals:['process'],triggers:['slow'],dur:2},
 {id:'sitemap',phase:'conception',fit:[1,2,2,2,3],goals:['design'],triggers:['refonte','kickoff'],dur:2},
 {id:'wireframes',phase:'conception',fit:[2,3,3,2,2],goals:['design'],triggers:['kickoff','refonte'],dur:3},
 {id:'userflow',phase:'conception',fit:[2,3,3,3,3],goals:['design'],triggers:['kickoff','refonte'],dur:2},
 {id:'storyboard',phase:'conception',fit:[3,2,1,1,1],goals:['design','ideas'],triggers:['kickoff','pivot'],dur:1.5},
 {id:'prd',phase:'conception',fit:[0,1,3,3,3],goals:['align','design'],triggers:['kickoff','misalign'],dur:2},
 {id:'raci',phase:'alignement',fit:[0,1,2,3,3],goals:['align'],triggers:['misalign','slow','kickoff'],dur:1.5},
 {id:'daci',phase:'alignement',fit:[0,1,2,3,3],goals:['align'],triggers:['misalign'],dur:1},
 {id:'dependencies',phase:'alignement',fit:[0,0,1,3,3],goals:['align','process'],triggers:['slow','misalign'],dur:2,minTeam:16},
 {id:'pi',phase:'alignement',fit:[0,0,0,3,3],goals:['align','prio'],triggers:['slow','misalign'],dur:14,minTeam:16},
 {id:'program',phase:'alignement',fit:[0,0,0,3,3],goals:['align'],triggers:['slow'],dur:2,minTeam:16},
 {id:'premortem',phase:'alignement',fit:[1,2,3,3,3],goals:['align'],triggers:['kickoff','refonte'],dur:1},
 {id:'launch',phase:'alignement',fit:[0,2,3,3,3],goals:['align','measure'],triggers:['kickoff','growth'],dur:2},
 {id:'sync',phase:'alignement',fit:[0,1,2,3,3],goals:['align'],triggers:['misalign'],dur:1},
 {id:'retro-ssc',phase:'mesure',fit:[1,2,3,3,3],goals:['process'],triggers:['slow'],dur:1},
 {id:'retro-4l',phase:'mesure',fit:[1,2,3,3,3],goals:['process'],triggers:['slow'],dur:1},
 {id:'retro-sailboat',phase:'mesure',fit:[1,2,3,3,3],goals:['process'],triggers:['slow','misalign'],dur:1.25},
 {id:'health',phase:'mesure',fit:[0,1,2,3,3],goals:['process','align'],triggers:['slow','misalign'],dur:1},
 {id:'postmortem',phase:'mesure',fit:[0,1,2,3,3],goals:['process'],triggers:['slow'],dur:1.5},
 {id:'metrics',phase:'mesure',fit:[0,2,3,3,3],goals:['measure'],triggers:['growth'],dur:2},
 {id:'ia',phase:'mesure',fit:[0,0,0,3,3],goals:['process'],triggers:['slow'],dur:4,minTeam:16}
];


// Fichier FigJam communautaire : rempli par le générateur (clé du fichier + node-id de la section de chaque atelier)
const FIGJAM = { file: 'zhiQxgTHsZlPgmD1d6tjKl', name: 'Boussole-Ateliers', nodes: {"kickoff":"3:2","problem":"3:59","stakeholders":"3:110","charter":"3:164","lean":"3:242","bmc":"3:303","vpc":"4:194","vision":"4:245","impact":"4:286","box":"4:393","positioning":"4:428","nsm":"4:482","okr":"5:399","horizons":"5:443","prfaq":"5:495","persona":"5:516","jtbd":"5:573","empathy":"5:614","journey":"6:531","research-plan":"6:553","assumptions":"6:594","ost":"6:648","blueprint":"6:779","kano":"6:851","hmw":"7:728","mindmap":"7:780","affinity":"7:886","crazy8":"7:961","brainwriting":"7:973","dotvote":"7:993","sprint":"8:889","experiments":"8:928","impact-effort":"8:996","rice":"8:1050","moscow":"8:1090","storymap":"8:1153","roadmap":"9:1061","nnl":"9:1105","decision":"9:1165","wsjf":"9:1193","sprintplan":"9:1233","sitemap":"9:1288","wireframes":"10:1210","userflow":"10:1220","storyboard":"10:1267","prd":"10:1281","raci":"10:1296","daci":"10:1330","dependencies":"11:1264","pi":"11:1322","program":"11:1346","premortem":"11:1418","launch":"11:1478","sync":"11:1519","retro-ssc":"12:1417","retro-4l":"12:1469","retro-sailboat":"12:1524","health":"12:1574","postmortem":"12:1613","metrics":"12:1676","ia":"12:1715"} };

if (typeof module !== 'undefined') module.exports = { STAGES, TEAMS, TRIGGERS, GOALS, HORIZONS, PHASES, T, FIGJAM };
