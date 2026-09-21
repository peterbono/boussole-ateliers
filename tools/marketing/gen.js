// Génère les visuels Figma Community (1920×1080) : thumbnail + carousel. node tools/marketing/gen.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '../..');
const { T, PHASES, STAGES } = require(path.join(root, 'data.js'));
const L = require(path.join(root, 'i18n/en.js')).I18N;
const LAYOUTS = require(path.join(root, 'layouts.en.js')).LAYOUTS;
const { Preview } = require(path.join(root, 'preview.js'));
const RUN = {}; for(const f of 'ABCD') Object.assign(RUN, require(path.join(root, 'content', f + '.json')));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pv = id => Preview.renderPreview(LAYOUTS[id], {class:'pv', title:L.templates[id].name});
const HUE = {cadrage:258, strategie:222, research:168, ideation:46, prio:22, conception:335, alignement:92, mesure:200};

const CSS = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{--bg:#F2F4F8;--surface:#fff;--surface-2:#E9EDF3;--line:#D6DCE6;--ink:#1A2236;--ink-2:#4A5570;--ink-3:#5F6A85;--accent:#1F4FE0;
--pv-bg:#FFFFFF;--pv-fill:#F6F7FA;--pv-line:#C9D0DC;--pv-ink:#1A2236;--pv-muted:#6B7590;--pv-accent:#1F4FE0;--pv-accent-soft:#E4EAFC;--pv-warn-soft:#FCE4DA}
*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:var(--bg);color:var(--ink);font-family:"Public Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:"Bricolage Grotesque",sans-serif;margin:0;line-height:1.05;letter-spacing:-.025em}
.slide{position:relative;width:1920px;height:1080px;padding:96px 120px;display:flex;flex-direction:column}
.eyebrow{font-family:"IBM Plex Mono",monospace;font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.pv{display:block;width:100%;height:auto}
.card{background:var(--surface);border:1px solid var(--line);border-radius:22px;box-shadow:0 2px 4px rgba(20,30,60,.05),0 30px 60px -30px rgba(20,30,60,.25);overflow:hidden}
.chip{display:inline-flex;padding:6px 16px;border-radius:999px;font-size:20px;font-weight:600;background:hsl(var(--h) 75% 90%);color:hsl(var(--h) 45% 28%)}
.url{position:absolute;left:120px;bottom:64px;font-family:"IBM Plex Mono",monospace;font-size:24px;color:var(--ink-3)}
.brand{position:absolute;right:120px;bottom:64px;font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:28px;color:var(--ink)}
.btn{display:inline-flex;align-items:center;gap:12px;padding:16px 26px;border-radius:14px;background:var(--accent);color:#fff;font-weight:600;font-size:24px}
.mono{font-family:"IBM Plex Mono",monospace}
</style>`;
const brand = `<div class="url">workshop-compass.vercel.app</div><div class="brand">Workshop Compass</div>`;
const page = body => `<!doctype html><html><head><meta charset="utf-8">${CSS}</head><body>${body}</body></html>`;

// 1. Thumbnail
const thumbIds = ['lean','impact','stakeholders','journey','ost','hmw','impact-effort','storymap','nnl','userflow','raci','retro-sailboat'];
const thumbnail = page(`<div class="slide" style="padding:0">
  <div style="position:absolute;left:120px;top:150px;width:760px">
    <div class="eyebrow">FigJam · 61 boards · EN / FR · free</div>
    <h1 style="font-size:132px;font-weight:800;margin-top:22px">Workshop<br>Compass</h1>
    <p style="font-size:34px;line-height:1.35;color:var(--ink-2);margin:34px 0 0;max-width:640px">The right product workshop, at the right stage, in the right order. Every board ready to run.</p>
    <div style="margin-top:44px;display:flex;gap:14px;flex-wrap:wrap">${['Framing','Strategy','Research','Ideation','Prioritisation','Design','Alignment','Retros'].map((n, i) => `<span class="chip" style="--h:${Object.values(HUE)[i]}">${n}</span>`).join('')}</div>
  </div>
  <div style="position:absolute;left:960px;top:-40px;width:1100px;display:grid;grid-template-columns:repeat(3,320px);gap:26px;transform:rotate(-8deg)">
    ${thumbIds.map((id, i) => `<div class="card" style="padding:10px;transform:translateY(${(i % 3) * 30}px)">${pv(id)}</div>`).join('')}
  </div>
</div>`);

// 2. What's inside
const inside = page(`<div class="slide">
  <div class="eyebrow">What's inside</div>
  <h2 style="font-size:84px;font-weight:800;margin-top:16px">61 workshops, 8 phases, one file</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:56px">
    ${PHASES.map(p => { const items = T.filter(t => t.phase === p.id); return `<div class="card" style="padding:22px;--h:${HUE[p.id]}"><span class="chip">${esc(L.phases[p.id])}</span><div style="font-family:'Bricolage Grotesque';font-size:64px;font-weight:800;margin:14px 0 6px">${items.length}</div><div style="font-size:19px;color:var(--ink-2);line-height:1.45">${items.slice(0, 4).map(t => esc(L.templates[t.id].name)).join(' · ')}${items.length > 4 ? ' · …' : ''}</div></div>`; }).join('')}
  </div>
  ${brand}
</div>`);

// 3. How it works
const how = page(`<div class="slide">
  <div class="eyebrow">How it works</div>
  <h2 style="font-size:84px;font-weight:800;margin-top:16px">Pick your stage, get the sequence, open in FigJam</h2>
  <div style="display:grid;grid-template-columns:600px 1fr;gap:64px;margin-top:56px;align-items:start">
    <ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:34px">
      ${[['Answer 5 questions','Product stage, team size, what is blocking, what is missing, time frame.'],['Get the workshops in order','With why now, why this step, duration, participants, output. Share the plan by link.'],['Open the board in FigJam','Each step links to its section in this file. Duplicate, keep what you need, run it.']].map((s, i) => `<li style="display:grid;grid-template-columns:64px 1fr;gap:20px"><div class="mono" style="width:64px;height:64px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;font-size:28px">${i + 1}</div><div><div style="font-family:'Bricolage Grotesque';font-size:34px;font-weight:700">${s[0]}</div><div style="font-size:22px;color:var(--ink-2);margin-top:6px;line-height:1.4">${s[1]}</div></div></li>`).join('')}
    </ol>
    <div class="card" style="height:560px;background:#fff;overflow:hidden"><img src="app-guide.png" style="width:100%;display:block" alt=""></div>
  </div>
  ${brand}
</div>`);

// 4. Real boards
const boards = page(`<div class="slide">
  <div class="eyebrow">Ready to fill</div>
  <h2 style="font-size:84px;font-weight:800;margin-top:16px">Real FigJam boards, not screenshots</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:48px">
    ${['board-impact.png','board-stakeholders.png'].map(f => `<div class="card" style="height:600px;background:#fff"><img src="${f}" style="width:100%;height:100%;object-fit:contain;display:block" alt=""></div>`).join('')}
  </div>
  ${brand}
</div>`);

// 5. How-to
const r = RUN.premortem.en;
const howto = page(`<div class="slide">
  <div class="eyebrow">Every workshop comes with a how-to</div>
  <h2 style="font-size:72px;font-weight:800;margin-top:12px">Preparation, timed agenda, pitfalls</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:36px;align-items:start">
    <div class="card" style="padding:26px 30px">
      <span class="chip" style="--h:${HUE.alignement}">Alignment & delivery</span>
      <h3 style="font-size:40px;font-weight:700;margin-top:12px">Pre-mortem</h3>
      <div class="eyebrow" style="font-size:16px;margin:18px 0 6px">Agenda · 1 h</div>
      ${r.agenda.map(a => `<div style="display:grid;grid-template-columns:90px 1fr;gap:14px;padding:8px 0;border-top:1px solid var(--line);font-size:18px"><span class="mono" style="color:var(--ink-3)">${a.min} min</span><div><b>${esc(a.t)}</b><div style="color:var(--ink-2);margin-top:2px;line-height:1.35">${esc(a.d)}</div></div></div>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="card" style="padding:30px"><div class="eyebrow" style="font-size:16px;margin-bottom:12px">Before</div><ul style="margin:0;padding-left:22px;font-size:21px;color:var(--ink-2);line-height:1.45">${r.prep.map(p => `<li style="margin:6px 0">${esc(p)}</li>`).join('')}</ul></div>
      <div class="card" style="padding:30px"><div class="eyebrow" style="font-size:16px;margin-bottom:12px">Pitfalls</div><ul style="margin:0;padding-left:22px;font-size:21px;color:var(--ink-2);line-height:1.45">${r.pitfalls.map(p => `<li style="margin:6px 0">${esc(p)}</li>`).join('')}</ul></div>
    </div>
  </div>
  ${brand}
</div>`);

// 6. Stage matrix
const matrix = page(`<div class="slide">
  <div class="eyebrow">Which workshop, at which stage</div>
  <h2 style="font-size:72px;font-weight:800;margin-top:12px">Idea, pre-PMF, post-PMF, scale-up, mature</h2>
  <div class="card" style="margin-top:32px;padding:4px 28px">
    <table style="border-collapse:collapse;width:100%;font-size:18px">
      <thead><tr><th style="text-align:left;padding:12px 10px;color:var(--ink-3);font-weight:600">Phase</th>${STAGES.map(s => `<th style="text-align:left;padding:12px 10px;font-weight:700">${esc(L.stages[s.id].short)}</th>`).join('')}</tr></thead>
      <tbody>${PHASES.map(p => `<tr style="border-top:1px solid var(--line)"><td style="padding:9px 10px;--h:${HUE[p.id]}"><span class="chip" style="font-size:17px;padding:4px 12px">${esc(L.phases[p.id])}</span></td>${STAGES.map((s, si) => { const items = T.filter(t => t.phase === p.id && t.fit[si] === 3).slice(0, 2).map(t => esc(L.templates[t.id].name)); return `<td style="padding:9px 10px;color:var(--ink-2);line-height:1.35;vertical-align:top">${items.map(n => `<div><b style="color:var(--ink)">${n}</b></div>`).join('')}</td>`; }).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>
  ${brand}
</div>`);

const out = {thumbnail, 'carousel-1-inside':inside, 'carousel-2-how-it-works':how, 'carousel-3-boards':boards, 'carousel-4-how-to':howto, 'carousel-5-stages':matrix};
for(const [name, html] of Object.entries(out)) fs.writeFileSync(path.join(__dirname, name + '.html'), html);
console.log(Object.keys(out).join('\n'));
