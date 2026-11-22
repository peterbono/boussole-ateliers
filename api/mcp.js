// MCP server (Streamable HTTP, stateless, JSON responses) at /mcp.
// The person's own AI (Claude, ChatGPT, Mistral, any MCP client) reads the situation and picks the answers;
// this server only lists the options and runs the same plan engine as the page. No model call, no key, no cost per brief.
const { T, STAGES, TEAMS, TRIGGERS, GOALS, HORIZONS, FIGJAM } = require('../data.js');
const { planCore } = require('../engine.js');
const I18N = { en: require('../i18n/en.js').I18N, fr: require('../i18n/fr.js').I18N };

const SITE = process.env.SITE_URL || 'https://compass.floriangouloubi.com';
const VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const SERVER = { name: 'workshop-compass', title: 'Workshop Compass', version: '1.0.0' };
const INSTRUCTIONS = `Workshop Compass turns a product team's situation into a sequence of workshops (75 templates, each with a FigJam board).
1. Call get_compass_options once to read the allowed values and the workshop catalog.
2. From what the person told you, choose stage, team, trigger, 1 to 3 goals and horizon. Ask one short question only if the stage or the time available is truly unclear; otherwise take the most common reading and say so.
3. Call build_workshop_plan. Present the plan in order with the reason for each step, then give the person the plan link: it opens the same plan on the site, where they can adjust it.
Answer in the person's language and pass lang accordingly (en or fr). Never use an em-dash.`;

const LANG = { type: 'string', enum: ['en', 'fr'], description: 'Language of the texts and of the plan link. Use the language of the conversation (fr for French, en otherwise).' };
const ids = arr => arr.map(x => x.id);
const TOOLS = [
  {
    name: 'get_compass_options',
    title: 'Read the compass options',
    description: 'Returns every allowed value for stage, team, trigger, goals and horizon, with what each one means, plus the catalog of workshops (id, name, phase, what it is for). Call it before build_workshop_plan.',
    inputSchema: { type: 'object', properties: { lang: LANG }, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'build_workshop_plan',
    title: 'Build the workshop plan',
    description: 'Runs the Workshop Compass engine on the chosen answers and returns the ordered workshop plan (duration, who to invite, output, FigJam board) plus a link that opens the same plan on compass.floriangouloubi.com.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      required: ['stage', 'team', 'trigger', 'goals', 'horizon'],
      properties: {
        stage: { type: 'string', enum: ids(STAGES), description: 'idee = idea, no product yet; prepmf = MVP without proven traction; postpmf = real traction; scale = several teams; mature = established product with legacy.' },
        team: { type: 'string', enum: ids(TEAMS), description: 'Product + tech headcount: xs 1-5, s 6-15, m 16-50, l 50+.' },
        trigger: { type: 'string', enum: ids(TRIGGERS), description: 'Main reason they come. See get_compass_options for the meaning of each id.' },
        goals: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string', enum: ids(GOALS) }, description: '1 to 3 goals.' },
        horizon: { type: 'string', enum: ids(HORIZONS), description: 'demi = one workshop (2 to 4 h); semaine = one week (3 to 5 workshops); programme = 6 to 8 weeks. Default semaine.' },
        pin: { type: 'array', maxItems: 3, items: { type: 'string', enum: ids(T) }, description: 'Optional: up to 3 workshop ids the person explicitly needs.' },
        skip: { type: 'array', maxItems: 3, items: { type: 'string', enum: ids(T) }, description: 'Optional: up to 3 workshop ids to leave out (already done, or not applicable).' },
        reason: { type: 'string', maxLength: 300, description: 'Optional: 1 or 2 sentences on how you read the situation, shown on the site above the plan. Same language as lang.' },
        lang: LANG,
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

const fmtDur = (h, lang) => h >= 7 ? `${Math.round(h / 7)} ${lang === 'fr' ? 'j' : 'd'}` : h < 1 ? `${Math.round(h * 60)} min` : `${lang === 'fr' ? String(h).replace('.', ',') : h} h`;
const figjamUrl = id => FIGJAM.file && FIGJAM.nodes[id] ? `https://www.figma.com/board/${FIGJAM.file}/${encodeURIComponent(FIGJAM.name)}?node-id=${encodeURIComponent(FIGJAM.nodes[id].replace(':', '-'))}` : null;
const pageUrl = (lang, id) => SITE + (lang === 'fr' ? '/fr/ateliers/' : '/workshops/') + id + '/';

function options(lang){
  const L = I18N[lang];
  return {
    stage: STAGES.map(s => ({ id: s.id, name: L.stages[s.id].name, meaning: L.stages[s.id].hint })),
    team: TEAMS.map(t => ({ id: t.id, people: L.teams[t.id] })),
    trigger: TRIGGERS.map(t => ({ id: t.id, name: L.triggers[t.id].name, meaning: L.triggers[t.id].hint })),
    goals: GOALS.map(g => ({ id: g.id, name: L.goals[g.id] })),
    horizon: HORIZONS.map(h => ({ id: h.id, name: L.horizons[h.id] })),
    workshops: T.map(t => ({ id: t.id, name: L.templates[t.id].name, phase: L.phases[t.phase], purpose: L.templates[t.id].desc })),
  };
}

function plan(args){
  const lang = args.lang === 'fr' ? 'fr' : 'en', L = I18N[lang];
  const has = (arr, v) => arr.some(x => x.id === v);
  const bad = ['stage', 'team', 'trigger', 'horizon'].filter(k => !has({ stage: STAGES, team: TEAMS, trigger: TRIGGERS, horizon: HORIZONS }[k], args[k]));
  const goals = Array.isArray(args.goals) ? [...new Set(args.goals.filter(g => has(GOALS, g)))].slice(0, 3) : [];
  if(!goals.length) bad.push('goals');
  if(bad.length) throw new Error(`Invalid value for ${bad.join(', ')}. Call get_compass_options to read the allowed ids.`);
  const okT = v => T.some(t => t.id === v);
  const list = v => Array.isArray(v) ? [...new Set(v.filter(okT))].slice(0, 3) : [];
  const a = { stage: args.stage, team: args.team, trigger: args.trigger, goals, horizon: args.horizon, pin: list(args.pin), skip: list(args.skip) };
  const reason = typeof args.reason === 'string' ? args.reason.replace(/\s+/g, ' ').replace(/—/g, ',').trim().slice(0, 300) : '';
  const { pick } = planCore(a);
  const url = new URL(SITE + '/');
  ['stage', 'team', 'trigger', 'horizon'].forEach(k => url.searchParams.set(k, a[k]));
  url.searchParams.set('goals', a.goals.join(','));
  if(a.pin.length) url.searchParams.set('pin', a.pin.join(','));
  if(a.skip.length) url.searchParams.set('skip', a.skip.join(','));
  if(reason) url.searchParams.set('reason', reason);
  if(lang !== 'en') url.searchParams.set('lang', lang);
  const total = pick.reduce((s, x) => s + x.t.dur, 0);
  const steps = pick.map((x, i) => {
    const tx = L.templates[x.t.id];
    return { step: i + 1, id: x.t.id, name: tx.name, phase: L.phases[x.t.phase], duration: fmtDur(x.t.dur, lang), why_now: tx.why, what: tx.desc, who: tx.who, output: tx.out, pinned: a.pin.includes(x.t.id), figjam: figjamUrl(x.t.id), page: pageUrl(lang, x.t.id) };
  });
  return { answers: a, summary: `${L.stages[a.stage].name} · ${L.triggers[a.trigger].name} · ${steps.length} ${lang === 'fr' ? 'ateliers' : 'workshops'} · ${fmtDur(total, lang)}`, plan_link: url.href, steps };
}

function callTool(name, args){
  if(name === 'get_compass_options') return options(args.lang === 'fr' ? 'fr' : 'en');
  if(name === 'build_workshop_plan'){
    const out = plan(args);
    console.log(JSON.stringify({ event: 'mcp_plan', lang: args.lang === 'fr' ? 'fr' : 'en', stage: out.answers.stage, trigger: out.answers.trigger, goals: out.answers.goals, horizon: out.answers.horizon, pin: out.answers.pin, skip: out.answers.skip, steps: out.steps.length }));
    return out;
  }
  const e = new Error(`Unknown tool: ${name}`); e.code = -32602; throw e;
}

function handle(msg){
  const { id, method, params = {} } = msg || {};
  const ok = result => ({ jsonrpc: '2.0', id, result });
  const fail = (code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
  if(!msg || msg.jsonrpc !== '2.0' || typeof method !== 'string') return fail(-32600, 'Invalid request');
  if(id === undefined) return null; // notification (notifications/initialized, cancelled…) : rien à répondre
  switch(method){
    case 'initialize': {
      const v = VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS[0];
      return ok({ protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER, instructions: INSTRUCTIONS });
    }
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: TOOLS });
    case 'tools/call': {
      try{
        const out = callTool(params.name, params.arguments || {});
        return ok({ content: [{ type: 'text', text: JSON.stringify(out, null, 1) }], structuredContent: out });
      }catch(err){
        if(err.code === -32602) return fail(-32602, err.message);
        return ok({ content: [{ type: 'text', text: err.message }], isError: true });
      }
    }
    case 'resources/list': return ok({ resources: [] });
    case 'prompts/list': return ok({ prompts: [] });
    default: return fail(-32601, `Method not found: ${method}`);
  }
}

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if(req.method === 'OPTIONS'){ res.status(204).end(); return; }
  if(req.method === 'GET'){
    // pas de flux SSE côté serveur : un navigateur qui ouvre l'URL voit comment s'en servir
    if((req.headers.accept || '').includes('text/event-stream')){ res.status(405).setHeader('Allow', 'POST').end(); return; }
    res.status(200).json({ name: SERVER.title, mcp: SITE + '/mcp', transport: 'streamable-http', tools: TOOLS.map(t => t.name), how: 'Add this URL as a custom connector in Claude, ChatGPT or any MCP client.' });
    return;
  }
  if(req.method !== 'POST'){ res.status(405).setHeader('Allow', 'POST, GET, OPTIONS').end(); return; }
  if(+(req.headers['content-length'] || 0) > 64000){ res.status(413).json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Body too large' } }); return; }
  let body;
  try{ body = typeof req.body === 'string' ? JSON.parse(req.body || 'null') : req.body; }
  catch(e){ res.status(400).json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); return; }
  const batch = Array.isArray(body);
  const replies = (batch ? body : [body]).map(handle).filter(Boolean);
  if(!replies.length){ res.status(202).end(); return; }
  res.status(200).json(batch ? replies : replies[0]);
};
