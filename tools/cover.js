// Couverture pour la carte Tools du portfolio : une grille de boards, pas une affiche.
// Usage : node tools/cover.js   (Chrome headless, sortie en 2400×1350 puis réduite à 1200×675)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const { LAYOUTS } = require(path.join(root, 'layouts.en.js'));
const { Preview } = require(path.join(root, 'preview.js'));
const CH = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VARS = {'--pv-bg':'#FFFFFF','--pv-fill':'#F6F7FA','--pv-line':'#C9D0DC','--pv-ink':'#1A2236','--pv-muted':'#6B7590','--pv-accent':'#1F4FE0','--pv-accent-soft':'#E4EAFC','--pv-warn-soft':'#FCE4DA'};
const IDS = ['bmc', 'journey', 'ost', 'impact-effort', 'storymap', 'affinity'];
const pv = id => Preview.renderPreview(LAYOUTS[id], {}).replace(/var\((--pv-[a-z-]+)\)/g, (m, k) => VARS[k] || '#000');
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:675px;overflow:hidden;background:#EEF1F6}
.wrap{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:24px;padding:42px 44px;box-sizing:border-box}
.tile{background:#fff;border:1px solid #DDE3EC;border-radius:8px;overflow:hidden;box-shadow:0 12px 24px -16px rgba(20,30,60,.4)}
.tile svg{display:block;width:100%;height:100%}
</style><body><div class="wrap">${IDS.map(id => `<div class="tile">${pv(id)}</div>`).join('')}</div>`;
const tmp = path.join(root, 'tools', '.cover.html'); fs.writeFileSync(tmp, html);
const out = path.join(root, 'og', 'cover-tools.png');
execFileSync(CH, ['--headless=new','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=2','--window-size=1200,675','--virtual-time-budget=4000',`--screenshot=${out}`,`file://${tmp}`], {stdio:'ignore'});
fs.rmSync(tmp);
console.log('cover:', out);
