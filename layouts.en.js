// Workshop Compass: layout spec per workshop (EN labels). Reference for the FigJam file.
// Same structure as layouts.fr.js; only labels differ.
//
// kinds:
//  columns  {cols:[{t, n}]}                      columns with n example stickies
//  quadrant {x:[left,right], y:[bottom,top], cells:[tl, tr, bl, br], footer?:[...]}
//  canvas   {cols, rows, blocks:[{t, c, r, w?, h?}]}   block grid, BMC style
//  grid     {rows:[...], cols:[...], cells?:'letters'|'dots'|'stickies'}   table
//  tree     {levels:[{t, n}]}                     left → right tree (level 0 = root)
//  flow     {steps:[...], branch?:'…'}            steps linked by arrows

const LAYOUTS_EN = {
  // Framing
  kickoff:      {kind:'canvas', cols:3, rows:3, blocks:[{t:'Goal',c:0,r:0},{t:'Definition of success',c:1,r:0},{t:'Scope',c:2,r:0},{t:'Risks',c:0,r:1},{t:'Roles',c:1,r:1},{t:'Out of scope',c:2,r:1},{t:'Milestones',c:0,r:2,w:3}]},
  problem:      {kind:'canvas', cols:3, rows:3, blocks:[{t:'Who has the problem',c:0,r:0},{t:'What problem',c:1,r:0},{t:'Why now',c:2,r:0},{t:'What we know',c:0,r:1,w:1.5},{t:'What we assume',c:1.5,r:1,w:1.5},{t:'Problem statement (one sentence)',c:0,r:2,w:3}]},
  stakeholders: {kind:'quadrant', x:['Low interest','High interest'], y:['Low power','High power'], cells:['Keep satisfied','Manage closely','Monitor','Keep informed']},
  charter:      {kind:'columns', cols:[{t:'Mission',n:2},{t:'Values',n:3},{t:'Rules',n:4},{t:'Rituals',n:3},{t:'Definition of Done',n:3}]},
  // Strategy
  lean:         {kind:'canvas', cols:10, rows:3, blocks:[{t:'Problem',c:0,r:0,w:2,h:2},{t:'Solution',c:2,r:0,w:2},{t:'Unique value proposition',c:4,r:0,w:2,h:2},{t:'Unfair advantage',c:6,r:0,w:2},{t:'Customer segments',c:8,r:0,w:2,h:2},{t:'Key metrics',c:2,r:1,w:2},{t:'Channels',c:6,r:1,w:2},{t:'Cost structure',c:0,r:2,w:5},{t:'Revenue streams',c:5,r:2,w:5}]},
  bmc:          {kind:'canvas', cols:10, rows:3, blocks:[{t:'Key partners',c:0,r:0,w:2,h:2},{t:'Key activities',c:2,r:0,w:2},{t:'Value proposition',c:4,r:0,w:2,h:2},{t:'Customer relationships',c:6,r:0,w:2},{t:'Customer segments',c:8,r:0,w:2,h:2},{t:'Key resources',c:2,r:1,w:2},{t:'Channels',c:6,r:1,w:2},{t:'Cost structure',c:0,r:2,w:5},{t:'Revenue streams',c:5,r:2,w:5}]},
  vpc:          {kind:'canvas', cols:6, rows:2, blocks:[{t:'Products & services',c:0,r:0,h:2},{t:'Gain creators',c:1,r:0,w:2},{t:'Pain relievers',c:1,r:1,w:2},{t:'Gains',c:3,r:0,w:2},{t:'Pains',c:3,r:1,w:2},{t:'Customer jobs',c:5,r:0,h:2}]},
  vision:       {kind:'canvas', cols:4, rows:2, blocks:[{t:'Vision',c:0,r:0,w:4},{t:'Target group',c:0,r:1},{t:'Needs',c:1,r:1},{t:'Product',c:2,r:1},{t:'Business goals',c:3,r:1}]},
  impact:       {kind:'tree', levels:[{t:'Goal',n:1},{t:'Actors',n:2},{t:'Impacts',n:4},{t:'Deliverables',n:6}]},
  box:          {kind:'canvas', cols:4, rows:2, blocks:[{t:'Product name',c:0,r:0,w:2},{t:'Tagline / promise',c:0,r:1,w:2},{t:'3 selling points',c:2,r:0,h:2},{t:'Back of the box',c:3,r:0,h:2}]},
  positioning:  {kind:'quadrant', x:['Low price','Premium'], y:['Niche','Mainstream'], cells:['Competitor A','Competitor B','Us','Open space']},
  nsm:          {kind:'tree', levels:[{t:'North Star',n:1},{t:'Levers',n:3},{t:'Input metrics',n:6}]},
  okr:          {kind:'grid', rows:['Objective 1','Objective 2','Objective 3'], cols:['KR 1','KR 2','KR 3','Initiatives'], cells:'stickies'},
  horizons:     {kind:'columns', cols:[{t:'H1 · Core business',n:5},{t:'H2 · Extensions',n:3},{t:'H3 · Bets',n:2}]},
  prfaq:        {kind:'canvas', cols:2, rows:5, blocks:[{t:'Headline + subheading',c:0,r:0,w:2},{t:'Summary',c:0,r:1},{t:'Problem',c:1,r:1},{t:'Solution',c:0,r:2},{t:'Leader quote',c:1,r:2},{t:'How to get started',c:0,r:3},{t:'Customer quote',c:1,r:3},{t:'Internal FAQ',c:0,r:4},{t:'External FAQ',c:1,r:4}]},
  // Research
  persona:      {kind:'canvas', cols:4, rows:2, blocks:[{t:'Portrait & bio',c:0,r:0,h:2},{t:'Goals',c:1,r:0},{t:'Frustrations',c:2,r:0},{t:'Behaviours',c:3,r:0},{t:'Context',c:1,r:1},{t:'Tools',c:2,r:1},{t:'Quote',c:3,r:1}]},
  jtbd:         {kind:'canvas', cols:4, rows:2, blocks:[{t:'When [situation], I want to [motivation], so I can [outcome]',c:0,r:0,w:4},{t:'Push (current situation)',c:0,r:1},{t:'Pull (new solution)',c:1,r:1},{t:'Anxieties',c:2,r:1},{t:'Habits',c:3,r:1}]},
  empathy:      {kind:'quadrant', x:['',''], y:['',''], cells:['Says','Thinks','Does','Feels'], footer:['Pains','Gains']},
  journey:      {kind:'grid', rows:['Actions','Touchpoints','Emotions','Pain points','Opportunities'], cols:['Awareness','Consideration','Purchase','Usage','Loyalty'], cells:'stickies'},
  'research-plan': {kind:'canvas', cols:2, rows:3, blocks:[{t:'Research questions',c:0,r:0},{t:'Hypotheses',c:1,r:0},{t:'Method',c:0,r:1},{t:'Recruiting',c:1,r:1},{t:'Interview guide',c:0,r:2,w:2}]},
  assumptions:  {kind:'quadrant', x:['Weak evidence','Strong evidence'], y:['Low importance','High importance'], cells:['Test first','Already validated','Ignore','Monitor']},
  ost:          {kind:'tree', levels:[{t:'Outcome',n:1},{t:'Opportunities',n:3},{t:'Solutions',n:6},{t:'Experiments',n:6}]},
  blueprint:    {kind:'grid', rows:['Customer actions','Front stage','Back stage','Systems'], cols:['Step 1','Step 2','Step 3','Step 4','Step 5'], cells:'stickies'},
  kano:         {kind:'quadrant', x:['Feature absent','Feature present'], y:['Dissatisfied','Satisfied'], cells:['Delighters','Performance','Indifferent','Basic']},
  // Ideation
  hmw:          {kind:'columns', cols:[{t:'Insight',n:4},{t:'How might we…',n:4},{t:'Votes',n:2}]},
  mindmap:      {kind:'tree', levels:[{t:'Topic',n:1},{t:'Branches',n:4},{t:'Ideas',n:8}]},
  affinity:     {kind:'columns', cols:[{t:'Theme A',n:5},{t:'Theme B',n:4},{t:'Theme C',n:6},{t:'Theme D',n:3}]},
  crazy8:       {kind:'grid', rows:['',''], cols:['1','2','3','4'], cells:'empty'},
  brainwriting: {kind:'grid', rows:['Round 1','Round 2','Round 3','Round 4','Round 5','Round 6'], cols:['Idea 1','Idea 2','Idea 3'], cells:'stickies'},
  altworlds: {kind:'columns', cols:[{t:'Our world today', n:3},{t:'A brand you admire', n:4},{t:'A rival with no rules', n:4},{t:'A five-year-old', n:4},{t:'Worth stealing', n:3}]},
  dotvote:      {kind:'columns', cols:[{t:'Option A',n:2,dots:3},{t:'Option B',n:2,dots:5},{t:'Option C',n:2,dots:1},{t:'Option D',n:2,dots:2}]},
  sprint:       {kind:'flow', steps:['Monday · Map','Tuesday · Sketch','Wednesday · Decide','Thursday · Prototype','Friday · Test']},
  experiments:  {kind:'grid', rows:['Experiment 1','Experiment 2','Experiment 3'], cols:['Hypothesis','Test','Metric','Success criteria','Result','Learning'], cells:'stickies'},
  // Prioritisation
  'impact-effort': {kind:'quadrant', x:['Low effort','High effort'], y:['Low impact','High impact'], cells:['Quick wins','Big bets','Fill-ins','Avoid']},
  radar: {kind:'radar', rings:['Now','Next quarter','This year','Off the radar'], sectors:['Product','Customers','Tech','Team']},
  rice:         {kind:'grid', rows:['Initiative A','Initiative B','Initiative C','Initiative D'], cols:['Reach','Impact','Confidence','Effort','Score'], cells:'letters'},
  moscow:       {kind:'columns', cols:[{t:'Must',n:4},{t:'Should',n:3},{t:'Could',n:3},{t:'Won\'t',n:2}]},
  storymap:     {kind:'grid', rows:['Backbone','Release 1','Release 2','Release 3'], cols:['Step 1','Step 2','Step 3','Step 4','Step 5','Step 6'], cells:'stickies'},
  roadmap:      {kind:'grid', rows:['Objective 1','Objective 2','Objective 3'], cols:['Q1','Q2','Q3','Q4'], cells:'stickies'},
  nnl:          {kind:'columns', cols:[{t:'Now',n:3},{t:'Next',n:4},{t:'Later',n:5}]},
  decision:     {kind:'grid', rows:['Option A','Option B','Option C'], cols:['Criterion 1 (×3)','Criterion 2 (×2)','Criterion 3 (×1)','Score'], cells:'letters'},
  wsjf:         {kind:'grid', rows:['Feature A','Feature B','Feature C','Feature D'], cols:['Value','Urgency','Risk','Size','WSJF'], cells:'letters'},
  sprintplan:   {kind:'columns', cols:[{t:'Sprint goal',n:1},{t:'Capacity',n:1},{t:'Selected stories',n:5},{t:'Breakdown',n:4}]},
  // Design
  sitemap:      {kind:'tree', levels:[{t:'Home',n:1},{t:'Sections',n:4},{t:'Pages',n:8}]},
  wireframes:   {kind:'grid', rows:['',''], cols:['Screen 1','Screen 2','Screen 3'], cells:'empty'},
  userflow:     {kind:'flow', steps:['Entry','Screen A','Decision?','Screen B','Success'], branch:'Error / empty state'},
  storyboard:   {kind:'grid', rows:['Scene','Caption'], cols:['1','2','3','4'], cells:'empty'},
  prd:          {kind:'canvas', cols:2, rows:4, blocks:[{t:'Problem',c:0,r:0},{t:'Goal & metrics',c:1,r:0},{t:'Scope',c:0,r:1,w:2},{t:'User stories',c:0,r:2,w:2},{t:'Out of scope',c:0,r:3},{t:'Open questions',c:1,r:3}]},
  // Alignment
  raci:         {kind:'grid', rows:['Activity 1','Activity 2','Activity 3','Activity 4'], cols:['PM','Tech lead','Design','Sponsor'], cells:'letters', letters:'RACI'},
  daci:         {kind:'canvas', cols:4, rows:2, blocks:[{t:'Driver',c:0,r:0},{t:'Approver',c:1,r:0},{t:'Contributors',c:2,r:0},{t:'Informed',c:3,r:0},{t:'Options considered',c:0,r:1,w:2},{t:'Decision + why',c:2,r:1,w:2}]},
  dependencies: {kind:'grid', rows:['Team A','Team B','Team C','Team D'], cols:['Team A','Team B','Team C','Team D'], cells:'stickies'},
  pi:           {kind:'grid', rows:['Team 1','Team 2','Team 3','Team 4','Milestones'], cols:['Sprint 1','Sprint 2','Sprint 3','Sprint 4','Sprint 5','IP'], cells:'stickies'},
  program:      {kind:'grid', rows:['Team 1','Team 2','Team 3','Dependencies'], cols:['Sprint 1','Sprint 2','Sprint 3','Sprint 4','Sprint 5'], cells:'stickies'},
  premortem:    {kind:'columns', cols:[{t:'Causes of failure',n:6},{t:'Grouping',n:3},{t:'Mitigations',n:3}]},
  launch:       {kind:'canvas', cols:3, rows:2, blocks:[{t:'Target',c:0,r:0},{t:'Message',c:1,r:0},{t:'Channels',c:2,r:0},{t:'Sequence & owners',c:0,r:1,w:2},{t:'Launch metrics',c:2,r:1}]},
  sync:         {kind:'columns', cols:[{t:'Agenda',n:3},{t:'Decisions',n:2},{t:'Actions',n:3},{t:'Blockers',n:1}]},
  // Measure
  'retro-ssc':  {kind:'columns', cols:[{t:'Start',n:3},{t:'Stop',n:3},{t:'Continue',n:4}]},
  'retro-4l':   {kind:'columns', cols:[{t:'Liked',n:3},{t:'Learned',n:3},{t:'Lacked',n:2},{t:'Longed for',n:2}]},
  'retro-sailboat': {kind:'quadrant', x:['',''], y:['',''], cells:['Wind (what pushes us)','Island (goal)','Anchors (what slows us)','Rocks (risks)']},
  health:       {kind:'grid', rows:['Leadership','Value delivered','Speed','Dependencies','Quality','Learning','Autonomy','Fun'], cols:['Green','Yellow','Red','Trend'], cells:'dots'},
  postmortem:   {kind:'columns', cols:[{t:'Timeline',n:5},{t:'Causes',n:3},{t:'What went well',n:2},{t:'Actions',n:3}]},
  metrics:      {kind:'flow', steps:['Acquisition','Activation','Retention','Revenue','Referral']},
  ia:           {kind:'columns', cols:[{t:'PI demo',n:2},{t:'Metrics',n:2},{t:'Problems',n:4},{t:'Root causes',n:3},{t:'Actions',n:3}]},
  icebreaker: {"kind": "columns", "cols": [{"t": "Name and role", "n": 4}, {"t": "One word for today", "n": 4}, {"t": "What I need from this session", "n": 4}, {"t": "What I can bring", "n": 4}]},
  teamcanvas: {"kind": "canvas", "cols": 6, "rows": 3, "blocks": [{"t": "Purpose", "c": 0, "r": 0, "w": 2, "h": 2}, {"t": "People and roles", "c": 2, "r": 0, "w": 2}, {"t": "Common goals", "c": 4, "r": 0, "w": 2}, {"t": "Values", "c": 2, "r": 1, "w": 2}, {"t": "Personal goals", "c": 4, "r": 1, "w": 2}, {"t": "Strengths and assets", "c": 0, "r": 2, "w": 2}, {"t": "Rules and activities", "c": 2, "r": 2, "w": 2}, {"t": "Needs and expectations", "c": 4, "r": 2, "w": 2}]},
  pitch: {"kind": "canvas", "cols": 6, "rows": 3, "blocks": [{"t": "For (target customer)", "c": 0, "r": 0, "w": 3}, {"t": "Who (problem or need)", "c": 3, "r": 0, "w": 3}, {"t": "Our product is a (category)", "c": 0, "r": 1, "w": 3}, {"t": "That (key benefit)", "c": 3, "r": 1, "w": 3}, {"t": "Unlike (the alternative)", "c": 0, "r": 2, "w": 3}, {"t": "Ours (what only we do)", "c": 3, "r": 2, "w": 3}]},
  remember: {"kind": "columns", "cols": [{"t": "Six months from now", "n": 3}, {"t": "What changed for them", "n": 5}, {"t": "What they told a colleague", "n": 4}, {"t": "What we shipped to get there", "n": 5}]},
  eventstorming: {"kind": "flow", "steps": ["Trigger", "Command", "Domain event", "Policy", "Read model"], "branch": "Hot spot: nobody agrees"},
  poker: {"kind": "grid", "rows": ["Story A", "Story B", "Story C", "Story D"], "cols": ["Lowest card", "Highest card", "Why the gap", "Agreed size"], "cells": "stickies"},
  tshirt: {"kind": "columns", "cols": [{"t": "S", "n": 5}, {"t": "M", "n": 5}, {"t": "L", "n": 4}, {"t": "XL", "n": 3}, {"t": "Too big to size", "n": 3}]},
  buyfeature: {"kind": "grid", "rows": ["Feature A", "Feature B", "Feature C", "Feature D"], "cols": ["Price", "Who bought", "Total spent", "Rank"], "cells": "stickies"},
  refinement: {"kind": "columns", "cols": [{"t": "Needs context", "n": 4}, {"t": "Being sliced", "n": 4}, {"t": "Estimated", "n": 4}, {"t": "Ready", "n": 5}, {"t": "Parked", "n": 3}]},
  storywriting: {"kind": "canvas", "cols": 6, "rows": 3, "blocks": [{"t": "As a", "c": 0, "r": 0, "w": 2}, {"t": "I want", "c": 2, "r": 0, "w": 2}, {"t": "So that", "c": 4, "r": 0, "w": 2}, {"t": "Acceptance criteria", "c": 0, "r": 1, "w": 4, "h": 2}, {"t": "Out of scope", "c": 4, "r": 1, "w": 2}, {"t": "Open questions", "c": 4, "r": 2, "w": 2}]},
  dod: {"kind": "columns", "cols": [{"t": "Definition of Ready", "n": 6}, {"t": "Definition of Done", "n": 6}, {"t": "Deliberately not on the list", "n": 4}]},
  vsm: {"kind": "flow", "steps": ["Idea", "Refined", "In build", "In review", "In production"], "branch": "Wait time between steps"},
  roam: {"kind": "quadrant", "x": ["Handled now", "Handled later or not at all"], "y": ["Someone owns it", "Nobody owns it"], "cells": ["Resolved", "Mitigated", "Owned", "Accepted"]},
  teamboard: {"kind": "grid", "rows": ["Iteration 1", "Iteration 2", "Iteration 3", "Iteration 4", "Iteration 5"], "cols": ["Items", "Dependencies", "Milestones", "Objectives"], "cells": "stickies"},
};
if (typeof module !== 'undefined') module.exports = { LAYOUTS: LAYOUTS_EN };
