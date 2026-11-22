// Workshop Compass: the plan engine, shared by the page (index.html) and the MCP server (api/mcp.js).
// planCore(answers) scores every workshop, keeps the plan for the horizon and orders it by prerequisites.
// Needs STAGES, TEAMS, HORIZONS, PHASES, T (data.js) and CHAIN (chain.js) in scope (browser globals or require).
(function(root){
  // data.js et chain.js déclarent des const globales (pas des propriétés de window) : on les lit par leur nom côté navigateur
  const D = typeof module !== 'undefined' ? Object.assign({}, require('./data.js'), require('./chain.js')) : {STAGES, TEAMS, HORIZONS, PHASES, T, CHAIN};
  const byId = (arr, id) => arr.find(x => x.id === id);
  const phaseIdx = id => D.PHASES.findIndex(p => p.id === id);
  const stageIdx = id => D.STAGES.findIndex(s => s.id === id);
  // ordre du parcours : un atelier vient après ses prérequis présents dans le plan (needs, et au moins un membre de chaque groupe anyOf représenté) ; départage par phase puis score
  function orderByDeps(pick){
    const inPlan = new Set(pick.map(x => x.t.id));
    const blockers = x => {
      const c = D.CHAIN[x.t.id] || {}, b = [];
      (c.needs || []).forEach(id => { if(inPlan.has(id)) b.push([id]); });
      (c.anyOf || []).forEach(g => { const present = g.filter(id => inPlan.has(id)); if(present.length) b.push(present); });
      return b; // liste de groupes : chaque groupe doit avoir au moins un membre déjà placé
    };
    const out = [], placed = new Set(); let rest = pick.slice();
    while(rest.length){
      const ready = rest.filter(x => blockers(x).every(g => g.some(id => placed.has(id))));
      const pool = ready.length ? ready : rest; // cycle improbable : on débloque par phase
      pool.sort((x, y) => phaseIdx(x.t.phase) - phaseIdx(y.t.phase) || y.s - x.s);
      const next = pool[0]; out.push(next); placed.add(next.t.id); rest = rest.filter(x => x !== next);
    }
    return out;
  }
  function planCore(a){
    const si = stageIdx(a.stage);
    const team = byId(D.TEAMS, a.team).size;
    const cap = byId(D.HORIZONS, a.horizon).cap;
    const scored = D.T.map(t => {
      const fit = t.fit[si];
      if((a.skip || []).includes(t.id)) return null;
      const pinned = (a.pin || []).includes(t.id);
      if(fit === 0 && !pinned) return null;
      if(t.minTeam && team < t.minTeam && !pinned) return null;
      let s = Math.max(fit, pinned ? 3 : 0) * 3 + (pinned ? 10 : 0);
      const gm = t.goals.filter(g => a.goals.includes(g)).length;
      s += Math.min(gm, 2) * 2;
      if(t.triggers.includes(a.trigger)) s += 3;
      if(a.horizon === 'demi' && t.dur > 4) s -= 6;
      if(a.horizon === 'semaine' && t.dur > 8) s -= 3;
      return {t, s, fit};
    }).filter(Boolean);
    scored.sort((x, y) => y.s - x.s || phaseIdx(x.t.phase) - phaseIdx(y.t.phase));
    const min = a.horizon === 'programme' ? 8 : 9;
    let pick = [];
    if(a.horizon === 'programme'){
      D.PHASES.forEach(p => { const best = scored.find(x => x.t.phase === p.id && x.s >= min); if(best) pick.push(best); });
      scored.forEach(x => { if(pick.length < cap && !pick.includes(x) && x.s >= min) pick.push(x); });
    } else pick = scored.filter(x => x.s >= min).slice(0, cap);
    if(pick.length === 0) pick = scored.slice(0, Math.min(cap, 3));
    scored.forEach(x => { if((a.pin || []).includes(x.t.id) && !pick.includes(x)) pick.push(x); });
    return {pick: orderByDeps(pick), scored, si, team};
  }
  const api = { planCore };
  if(typeof module !== 'undefined') module.exports = api; else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
