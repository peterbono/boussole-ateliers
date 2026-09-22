// Génère une image OG (1200×630) par atelier et par langue dans og/<lang>/<id>.png, plus og/default.png.
// Usage : node tools/og.js   (Chrome headless requis en local ; les PNG sont commités, le build les copie)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const { T, PHASES } = require(path.join(root, 'data.js'));
const I18N = { en: require(path.join(root, 'i18n/en.js')).I18N, fr: require(path.join(root, 'i18n/fr.js')).I18N };
const LAYOUTS = { en: require(path.join(root, 'layouts.en.js')).LAYOUTS, fr: require(path.join(root, 'layouts.fr.js')).LAYOUTS };
const { Preview } = require(path.join(root, 'preview.js'));
const CH = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HUE = {cadrage:258, strategie:222, research:168, ideation:46, prio:22, conception:335, alignement:92, mesure:200};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tmp = path.join(root, 'tools', '.og-tmp'); fs.mkdirSync(tmp, {recursive:true});
const css = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Public+Sans:wght@400;600&display=swap"><style>
:root{--pv-bg:#FFFFFF;--pv-fill:#F6F7FA;--pv-line:#C9D0DC;--pv-ink:#1A2236;--pv-muted:#6B7590;--pv-accent:#1F4FE0;--pv-accent-soft:#E4EAFC;--pv-warn-soft:#FCE4DA}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#F2F4F8;font-family:"Public Sans",system-ui,sans-serif;color:#1A2236;-webkit-font-smoothing:antialiased}
.og{width:1200px;height:630px;display:grid;grid-template-columns:1fr 480px;gap:40px;padding:64px 72px;box-sizing:border-box;align-items:center}
.chip{display:inline-flex;padding:6px 14px;border-radius:999px;font-size:18px;font-weight:600;background:hsl(var(--h) 75% 90%);color:hsl(var(--h) 45% 28%)}
h1{font-family:"Bricolage Grotesque",sans-serif;font-size:56px;font-weight:800;letter-spacing:-.02em;line-height:1.05;margin:18px 0 16px}
p{font-size:22px;line-height:1.4;color:#4A5570;margin:0;max-width:34ch}
.brand{position:absolute;left:72px;bottom:40px;font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:22px;display:flex;align-items:center;gap:9px;letter-spacing:-.02em}
.brand svg{width:26px;height:26px;color:#1A2236}
.brand i{font-style:normal;font-weight:600;color:#4A5570}
.url{position:absolute;right:72px;bottom:46px;font-size:18px;color:#5F6A85;font-family:"IBM Plex Mono",monospace}
.pv{width:480px;height:auto;border:1px solid #D6DCE6;border-radius:14px;background:#fff;box-shadow:0 30px 60px -30px rgba(20,30,60,.3)}
.hero h1{font-size:88px;margin:0 0 20px}
</style>`;
const MARK = `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12.2" stroke="currentColor" stroke-width="1.8"/><path d="M16 1.4v2.6M16 28v2.6M1.4 16h2.6M28 16h2.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16 7.2l3.6 8.8H16z" fill="#1F4FE0"/><path d="M16 7.2L12.4 16H16z" fill="#1F4FE0" fill-opacity=".62"/><path d="M16 24.8l3.6-8.8H16z" fill="#1A2236" fill-opacity=".18"/><path d="M16 24.8L12.4 16H16z" fill="#1A2236" fill-opacity=".34"/></svg>`;
const brandHtml = L => { const p = L.title.split(' '); return `<div class="brand">${MARK}<span>${esc(p.slice(0, -1).join(' '))} <i>${esc(p[p.length - 1])}</i></span></div>`; };
function page(lang, t){
  const L = I18N[lang], x = L.templates[t.id];
  return `<!doctype html><html><head><meta charset="utf-8">${css}</head><body><div class="og" style="--h:${HUE[t.phase]}"><div><span class="chip">${esc(L.phases[t.phase])}</span><h1>${esc(x.name)}</h1><p>${esc(x.desc)}</p></div>${Preview.renderPreview(LAYOUTS[lang][t.id], {class:'pv'})}</div>${brandHtml(L)}<div class="url">workshop-compass.vercel.app</div></body></html>`;
}
const defaultPage = `<!doctype html><html><head><meta charset="utf-8">${css}</head><body><div class="og hero" style="grid-template-columns:1fr"><div><span class="chip" style="--h:222">61 product workshops · FigJam · free</span><h1>Workshop Compass</h1><p style="max-width:44ch;font-size:26px">The right product workshop, at the right stage, in the right order. Every board ready to run, with a how-to and a filled example.</p></div></div>${brandHtml(I18N.en)}<div class="url">workshop-compass.vercel.app</div></body></html>`;
const jobs = [];
for(const lang of ['en','fr']){ fs.mkdirSync(path.join(root, 'og', lang), {recursive:true}); for(const t of T){ const html = path.join(tmp, `${lang}-${t.id}.html`); fs.writeFileSync(html, page(lang, t)); jobs.push([html, path.join(root, 'og', lang, t.id + '.png')]); } }
fs.writeFileSync(path.join(tmp, 'default.html'), defaultPage); jobs.push([path.join(tmp, 'default.html'), path.join(root, 'og', 'default.png')]);
let n = 0;
for(const [html, png] of jobs){
  if(process.argv.includes('--missing') && fs.existsSync(png)) continue;
  execFileSync(CH, ['--headless=new','--disable-gpu','--hide-scrollbars','--window-size=1200,630','--virtual-time-budget=4000',`--screenshot=${png}`,`file://${html}`], {stdio:'ignore'}); n++;
}
fs.rmSync(tmp, {recursive:true, force:true});
console.log(`og: ${n} images rendered`);
