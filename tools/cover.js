// Couverture pour la carte Tools du portfolio.
// Ce que l'outil vend n'est pas un lot de boards, c'est la sequence : quel atelier
// pour ta situation, dans quel ordre. La couverture montre donc un plan, pas une bibliotheque.
// Usage : node tools/cover.js   (Chrome headless, rendu en 2400x1350)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const { LAYOUTS } = require(path.join(root, 'layouts.en.js'));
const { Preview } = require(path.join(root, 'preview.js'));
const CH = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VARS = {'--pv-bg':'#FFFFFF','--pv-fill':'#F6F7FA','--pv-line':'#C9D0DC','--pv-ink':'#1A2236','--pv-muted':'#6B7590','--pv-accent':'#1F4FE0','--pv-accent-soft':'#E4EAFC','--pv-warn-soft':'#FCE4DA'};
const HUE = {cadrage:258, strategie:222, research:168, ideation:46, prio:22, conception:335, alignement:92, mesure:200};
const pv = id => Preview.renderPreview(LAYOUTS[id], {}).replace(/var\((--pv-[a-z-]+)\)/g, (m, k) => VARS[k] || '#000');
// La sequence que l'outil produit reellement pour ce cas, verifiee dans l'app.
const SITUATION = 'Post-PMF startup · unmanageable backlog';
const STEPS = [
  {id:'okr',     name:'Quarterly OKRs',            phase:'Strategy & vision',       h:'strategie', dur:'3 h'},
  {id:'impact',  name:'Impact mapping',            phase:'Strategy & vision',       h:'strategie', dur:'3 h'},
  {id:'ost',     name:'Opportunity Solution Tree', phase:'Research & discovery',    h:'research',  dur:'2 h 30'},
  {id:'roadmap', name:'Product roadmap',           phase:'Prioritisation & planning', h:'prio',    dur:'2 h'},
];
const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap">
<style>
html,body{margin:0;width:1200px;height:675px;overflow:hidden;background:#EEF1F6;font-family:"Public Sans",system-ui,sans-serif;color:#1A2236;-webkit-font-smoothing:antialiased}
.wrap{position:absolute;inset:0;padding:40px 44px;box-sizing:border-box;display:flex;flex-direction:column}
.ctx{display:flex;align-items:baseline;gap:14px;margin-bottom:26px}
.ctx b{font-family:"Bricolage Grotesque",sans-serif;font-size:34px;font-weight:800;letter-spacing:-.02em}
.ctx i{font-style:normal;font-size:19px;color:#5F6A85}
.rail{flex:1;display:flex;flex-direction:column;gap:14px}
.row{flex:1;display:flex;align-items:center;gap:22px;position:relative}
.n{position:relative;flex:none;width:56px;height:56px;border-radius:50%;border:2px solid #1A2236;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;background:#EEF1F6;z-index:1}
.row:not(:last-child) .n::after{content:"";position:absolute;top:56px;left:50%;width:2px;height:28px;background:#C9D0DC;transform:translateX(-50%)}
.card{flex:1;min-width:0;display:flex;align-items:center;gap:20px;background:#fff;border:1px solid #DDE3EC;border-radius:14px;padding:16px 20px;box-shadow:0 12px 26px -18px rgba(20,30,60,.45)}
.t{flex:1;min-width:0}
.t h3{margin:0 0 8px;font-size:32px;font-weight:700;letter-spacing:-.01em;line-height:1.1}
.t .m{display:flex;align-items:center;gap:10px}
.chip{display:inline-flex;padding:4px 12px;border-radius:999px;font-size:17px;font-weight:600;background:hsl(var(--h) 75% 91%);color:hsl(var(--h) 45% 30%)}
.dur{font-size:17px;color:#5F6A85}
.mini{flex:none;width:148px;border:1px solid #E1E6EF;border-radius:7px;overflow:hidden;background:#fff}
.mini svg{display:block;width:100%;height:100%}
</style><body><div class="wrap">
  <div class="ctx"><b>Your plan</b><i>${SITUATION}</i></div>
  <div class="rail">
    ${STEPS.map((s, i) => `<div class="row"><div class="n">${i + 1}</div><div class="card"><div class="t"><h3>${s.name}</h3><div class="m"><span class="chip" style="--h:${HUE[s.h]}">${s.phase}</span><span class="dur">${s.dur}</span></div></div><div class="mini">${pv(s.id)}</div></div></div>`).join('')}
  </div>
</div>`;
const tmp = path.join(root, 'tools', '.cover.html'); fs.writeFileSync(tmp, html);
const out = path.join(root, 'og', 'cover-tools.png');
execFileSync(CH, ['--headless=new','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=2','--window-size=1200,675','--virtual-time-budget=5000',`--screenshot=${out}`,`file://${tmp}`], {stdio:'ignore'});
fs.rmSync(tmp);
console.log('cover:', out);
