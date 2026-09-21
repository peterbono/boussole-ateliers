// Boussole Ateliers : spec de layout par atelier.
// Source unique : le site en tire l'aperçu SVG, le générateur FigJam en tire les sections.
//
// kinds :
//  columns  {cols:[{t, n}]}                      colonnes avec n stickies d'exemple
//  quadrant {x:[gauche,droite], y:[bas,haut], cells:[hg, hd, bg, bd], footer?:[...]}
//  canvas   {cols, rows, blocks:[{t, c, r, w?, h?}]}   grille de blocs façon BMC
//  grid     {rows:[...], cols:[...], cells?:'letters'|'dots'|'stickies'}   tableau
//  tree     {levels:[{t, n}]}                     arbre gauche → droite (niveau 0 = racine)
//  flow     {steps:[...], branch?:'…'}            étapes reliées par des flèches

const LAYOUTS = {
  // Cadrage
  kickoff:      {kind:'canvas', cols:3, rows:3, blocks:[{t:'Objectif',c:0,r:0},{t:'Définition du succès',c:1,r:0},{t:'Périmètre',c:2,r:0},{t:'Risques',c:0,r:1},{t:'Rôles',c:1,r:1},{t:'Hors périmètre',c:2,r:1},{t:'Jalons',c:0,r:2,w:3}]},
  problem:      {kind:'canvas', cols:3, rows:3, blocks:[{t:'Qui a le problème',c:0,r:0},{t:'Quel problème',c:1,r:0},{t:'Pourquoi maintenant',c:2,r:0},{t:'Ce qu\'on sait',c:0,r:1,w:1.5},{t:'Ce qu\'on suppose',c:1.5,r:1,w:1.5},{t:'Énoncé du problème (une phrase)',c:0,r:2,w:3}]},
  stakeholders: {kind:'quadrant', x:['Intérêt faible','Intérêt fort'], y:['Pouvoir faible','Pouvoir fort'], cells:['Satisfaire','Impliquer','Surveiller','Informer']},
  charter:      {kind:'columns', cols:[{t:'Mission',n:2},{t:'Valeurs',n:3},{t:'Règles',n:4},{t:'Rituels',n:3},{t:'Definition of Done',n:3}]},
  // Stratégie
  lean:         {kind:'canvas', cols:10, rows:3, blocks:[{t:'Problème',c:0,r:0,w:2,h:2},{t:'Solution',c:2,r:0,w:2},{t:'Proposition de valeur unique',c:4,r:0,w:2,h:2},{t:'Avantage déloyal',c:6,r:0,w:2},{t:'Segments clients',c:8,r:0,w:2,h:2},{t:'Métriques clés',c:2,r:1,w:2},{t:'Canaux',c:6,r:1,w:2},{t:'Structure de coûts',c:0,r:2,w:5},{t:'Sources de revenus',c:5,r:2,w:5}]},
  bmc:          {kind:'canvas', cols:10, rows:3, blocks:[{t:'Partenaires clés',c:0,r:0,w:2,h:2},{t:'Activités clés',c:2,r:0,w:2},{t:'Proposition de valeur',c:4,r:0,w:2,h:2},{t:'Relation client',c:6,r:0,w:2},{t:'Segments clients',c:8,r:0,w:2,h:2},{t:'Ressources clés',c:2,r:1,w:2},{t:'Canaux',c:6,r:1,w:2},{t:'Structure de coûts',c:0,r:2,w:5},{t:'Sources de revenus',c:5,r:2,w:5}]},
  vpc:          {kind:'canvas', cols:6, rows:2, blocks:[{t:'Produits & services',c:0,r:0,h:2},{t:'Créateurs de gain',c:1,r:0,w:2},{t:'Soulageurs de douleur',c:1,r:1,w:2},{t:'Gains',c:3,r:0,w:2},{t:'Douleurs',c:3,r:1,w:2},{t:'Tâches du client',c:5,r:0,h:2}]},
  vision:       {kind:'canvas', cols:4, rows:2, blocks:[{t:'Vision',c:0,r:0,w:4},{t:'Groupe cible',c:0,r:1},{t:'Besoins',c:1,r:1},{t:'Produit',c:2,r:1},{t:'Objectifs business',c:3,r:1}]},
  impact:       {kind:'tree', levels:[{t:'Objectif',n:1},{t:'Acteurs',n:2},{t:'Impacts',n:4},{t:'Livrables',n:6}]},
  box:          {kind:'canvas', cols:4, rows:2, blocks:[{t:'Nom du produit',c:0,r:0,w:2},{t:'Slogan / promesse',c:0,r:1,w:2},{t:'3 arguments',c:2,r:0,h:2},{t:'Dos de la boîte',c:3,r:0,h:2}]},
  positioning:  {kind:'quadrant', x:['Prix bas','Premium'], y:['Niche','Généraliste'], cells:['Concurrent A','Concurrent B','Nous','Espace vide']},
  nsm:          {kind:'tree', levels:[{t:'North Star',n:1},{t:'Leviers',n:3},{t:'Métriques d\'entrée',n:6}]},
  okr:          {kind:'grid', rows:['Objectif 1','Objectif 2','Objectif 3'], cols:['KR 1','KR 2','KR 3','Initiatives'], cells:'stickies'},
  horizons:     {kind:'columns', cols:[{t:'H1 · Coeur de métier',n:5},{t:'H2 · Extensions',n:3},{t:'H3 · Paris',n:2}]},
  prfaq:        {kind:'canvas', cols:2, rows:5, blocks:[{t:'Titre + sous-titre',c:0,r:0,w:2},{t:'Résumé',c:0,r:1},{t:'Problème',c:1,r:1},{t:'Solution',c:0,r:2},{t:'Citation dirigeant',c:1,r:2},{t:'Comment démarrer',c:0,r:3},{t:'Citation client',c:1,r:3},{t:'FAQ interne',c:0,r:4},{t:'FAQ externe',c:1,r:4}]},
  // Research
  persona:      {kind:'canvas', cols:4, rows:2, blocks:[{t:'Portrait & bio',c:0,r:0,h:2},{t:'Objectifs',c:1,r:0},{t:'Frustrations',c:2,r:0},{t:'Comportements',c:3,r:0},{t:'Contexte',c:1,r:1},{t:'Outils',c:2,r:1},{t:'Citation',c:3,r:1}]},
  jtbd:         {kind:'canvas', cols:4, rows:2, blocks:[{t:'Quand [situation], je veux [motivation], pour [résultat]',c:0,r:0,w:4},{t:'Push (situation actuelle)',c:0,r:1},{t:'Pull (nouvelle solution)',c:1,r:1},{t:'Anxiétés',c:2,r:1},{t:'Habitudes',c:3,r:1}]},
  empathy:      {kind:'quadrant', x:['',''], y:['',''], cells:['Dit','Pense','Fait','Ressent'], footer:['Douleurs','Gains']},
  journey:      {kind:'grid', rows:['Actions','Points de contact','Émotions','Frictions','Opportunités'], cols:['Découverte','Considération','Achat','Usage','Fidélité'], cells:'stickies'},
  'research-plan': {kind:'canvas', cols:2, rows:3, blocks:[{t:'Questions de recherche',c:0,r:0},{t:'Hypothèses',c:1,r:0},{t:'Méthode',c:0,r:1},{t:'Recrutement',c:1,r:1},{t:'Guide d\'entretien',c:0,r:2,w:2}]},
  assumptions:  {kind:'quadrant', x:['Preuve faible','Preuve forte'], y:['Peu important','Important'], cells:['Tester en premier','Déjà validé','Ignorer','Surveiller']},
  ost:          {kind:'tree', levels:[{t:'Résultat',n:1},{t:'Opportunités',n:3},{t:'Solutions',n:6},{t:'Expériences',n:6}]},
  blueprint:    {kind:'grid', rows:['Actions client','Front stage','Back stage','Systèmes'], cols:['Étape 1','Étape 2','Étape 3','Étape 4','Étape 5'], cells:'stickies'},
  kano:         {kind:'quadrant', x:['Fonction absente','Fonction présente'], y:['Insatisfait','Satisfait'], cells:['Attractif','Performance','Indifférent','Basique']},
  // Idéation
  hmw:          {kind:'columns', cols:[{t:'Insight',n:4},{t:'Comment pourrions-nous…',n:4},{t:'Votes',n:2}]},
  mindmap:      {kind:'tree', levels:[{t:'Sujet',n:1},{t:'Branches',n:4},{t:'Idées',n:8}]},
  affinity:     {kind:'columns', cols:[{t:'Thème A',n:5},{t:'Thème B',n:4},{t:'Thème C',n:6},{t:'Thème D',n:3}]},
  crazy8:       {kind:'grid', rows:['',''], cols:['1','2','3','4'], cells:'empty'},
  brainwriting: {kind:'grid', rows:['Tour 1','Tour 2','Tour 3','Tour 4','Tour 5','Tour 6'], cols:['Idée 1','Idée 2','Idée 3'], cells:'stickies'},
  dotvote:      {kind:'columns', cols:[{t:'Option A',n:2,dots:3},{t:'Option B',n:2,dots:5},{t:'Option C',n:2,dots:1},{t:'Option D',n:2,dots:2}]},
  sprint:       {kind:'flow', steps:['Lundi · Cartographier','Mardi · Esquisser','Mercredi · Décider','Jeudi · Prototyper','Vendredi · Tester']},
  experiments:  {kind:'grid', rows:['Expérience 1','Expérience 2','Expérience 3'], cols:['Hypothèse','Test','Métrique','Critère de succès','Résultat','Apprentissage'], cells:'stickies'},
  // Priorisation
  'impact-effort': {kind:'quadrant', x:['Effort faible','Effort fort'], y:['Impact faible','Impact fort'], cells:['Quick wins','Gros projets','Remplissage','À éviter']},
  rice:         {kind:'grid', rows:['Initiative A','Initiative B','Initiative C','Initiative D'], cols:['Reach','Impact','Confidence','Effort','Score'], cells:'letters'},
  moscow:       {kind:'columns', cols:[{t:'Must',n:4},{t:'Should',n:3},{t:'Could',n:3},{t:'Won\'t',n:2}]},
  storymap:     {kind:'grid', rows:['Backbone','Release 1','Release 2','Release 3'], cols:['Étape 1','Étape 2','Étape 3','Étape 4','Étape 5','Étape 6'], cells:'stickies'},
  roadmap:      {kind:'grid', rows:['Objectif 1','Objectif 2','Objectif 3'], cols:['Q1','Q2','Q3','Q4'], cells:'stickies'},
  nnl:          {kind:'columns', cols:[{t:'Now',n:3},{t:'Next',n:4},{t:'Later',n:5}]},
  decision:     {kind:'grid', rows:['Option A','Option B','Option C'], cols:['Critère 1 (×3)','Critère 2 (×2)','Critère 3 (×1)','Score'], cells:'letters'},
  wsjf:         {kind:'grid', rows:['Feature A','Feature B','Feature C','Feature D'], cols:['Valeur','Urgence','Risque','Taille','WSJF'], cells:'letters'},
  sprintplan:   {kind:'columns', cols:[{t:'Objectif du sprint',n:1},{t:'Capacité',n:1},{t:'Stories sélectionnées',n:5},{t:'Découpage',n:4}]},
  // Conception
  sitemap:      {kind:'tree', levels:[{t:'Accueil',n:1},{t:'Sections',n:4},{t:'Pages',n:8}]},
  wireframes:   {kind:'grid', rows:['',''], cols:['Écran 1','Écran 2','Écran 3'], cells:'empty'},
  userflow:     {kind:'flow', steps:['Entrée','Écran A','Décision ?','Écran B','Succès'], branch:'Erreur / état vide'},
  storyboard:   {kind:'grid', rows:['Scène','Légende'], cols:['1','2','3','4'], cells:'empty'},
  prd:          {kind:'canvas', cols:2, rows:4, blocks:[{t:'Problème',c:0,r:0},{t:'Objectif & métriques',c:1,r:0},{t:'Périmètre',c:0,r:1,w:2},{t:'User stories',c:0,r:2,w:2},{t:'Hors périmètre',c:0,r:3},{t:'Questions ouvertes',c:1,r:3}]},
  // Alignement
  raci:         {kind:'grid', rows:['Activité 1','Activité 2','Activité 3','Activité 4'], cols:['PM','Tech lead','Design','Sponsor'], cells:'letters', letters:'RACI'},
  daci:         {kind:'canvas', cols:4, rows:2, blocks:[{t:'Driver',c:0,r:0},{t:'Approver',c:1,r:0},{t:'Contributors',c:2,r:0},{t:'Informed',c:3,r:0},{t:'Options étudiées',c:0,r:1,w:2},{t:'Décision + pourquoi',c:2,r:1,w:2}]},
  dependencies: {kind:'grid', rows:['Équipe A','Équipe B','Équipe C','Équipe D'], cols:['Équipe A','Équipe B','Équipe C','Équipe D'], cells:'stickies'},
  pi:           {kind:'grid', rows:['Équipe 1','Équipe 2','Équipe 3','Équipe 4','Jalons'], cols:['Sprint 1','Sprint 2','Sprint 3','Sprint 4','Sprint 5','IP'], cells:'stickies'},
  program:      {kind:'grid', rows:['Équipe 1','Équipe 2','Équipe 3','Dépendances'], cols:['Sprint 1','Sprint 2','Sprint 3','Sprint 4','Sprint 5'], cells:'stickies'},
  premortem:    {kind:'columns', cols:[{t:'Causes de l\'échec',n:6},{t:'Regroupement',n:3},{t:'Parades',n:3}]},
  launch:       {kind:'canvas', cols:3, rows:2, blocks:[{t:'Cible',c:0,r:0},{t:'Message',c:1,r:0},{t:'Canaux',c:2,r:0},{t:'Séquence & responsables',c:0,r:1,w:2},{t:'Métriques de lancement',c:2,r:1}]},
  sync:         {kind:'columns', cols:[{t:'Ordre du jour',n:3},{t:'Décisions',n:2},{t:'Actions',n:3},{t:'Bloquants',n:1}]},
  // Mesure
  'retro-ssc':  {kind:'columns', cols:[{t:'Start',n:3},{t:'Stop',n:3},{t:'Continue',n:4}]},
  'retro-4l':   {kind:'columns', cols:[{t:'Liked',n:3},{t:'Learned',n:3},{t:'Lacked',n:2},{t:'Longed for',n:2}]},
  'retro-sailboat': {kind:'quadrant', x:['',''], y:['',''], cells:['Vent (ce qui pousse)','Île (objectif)','Ancres (ce qui freine)','Rochers (risques)']},
  health:       {kind:'grid', rows:['Leadership','Valeur livrée','Vélocité','Dépendances','Qualité','Apprentissage','Autonomie','Moral'], cols:['Vert','Jaune','Rouge','Tendance'], cells:'dots'},
  postmortem:   {kind:'columns', cols:[{t:'Chronologie',n:5},{t:'Causes',n:3},{t:'Ce qui a bien marché',n:2},{t:'Actions',n:3}]},
  metrics:      {kind:'flow', steps:['Acquisition','Activation','Rétention','Revenu','Recommandation']},
  ia:           {kind:'columns', cols:[{t:'Démo PI',n:2},{t:'Mesures',n:2},{t:'Problèmes',n:4},{t:'Causes racines',n:3},{t:'Actions',n:3}]},
};
if (typeof module !== 'undefined') module.exports = { LAYOUTS };
