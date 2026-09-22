// Build: copies the app into dist/ and generates one static page per workshop (EN + FR),
// plus sitemap.xml, robots.txt and llms.txt. Run: node tools/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), dist = path.join(root, 'dist');
const { T, PHASES, STAGES, FIGJAM } = require(path.join(root, 'data.js'));
const { CHAIN, chainInputs } = require(path.join(root, 'chain.js'));
const { SOURCES } = require(path.join(root, 'sources.js'));
const I18N = { en: require(path.join(root, 'i18n/en.js')).I18N, fr: require(path.join(root, 'i18n/fr.js')).I18N };
const LAYOUTS = { en: require(path.join(root, 'layouts.en.js')).LAYOUTS, fr: require(path.join(root, 'layouts.fr.js')).LAYOUTS };
const { Preview } = require(path.join(root, 'preview.js'));
const SITE = process.env.SITE_URL || 'https://workshop-compass.vercel.app';

// 1. contenu d'animation : fusion des fichiers content/*.json → content/run.json
const RUN = {};
const contentDir = path.join(root, 'content');
if(fs.existsSync(contentDir)) for(const f of fs.readdirSync(contentDir)){
  if(!/^[A-Z]\.json$/.test(f)) continue;
  Object.assign(RUN, JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf8')));
}

// 2. dist : copie de l'app
fs.rmSync(dist, {recursive:true, force:true}); fs.mkdirSync(dist, {recursive:true});
for(const f of ['index.html','data.js','chain.js','sources.js','preview.js','layouts.en.js','layouts.fr.js','favicon.svg','favicon.ico','apple-touch-icon.png','icon-192.png','icon-512.png','site.webmanifest']) fs.copyFileSync(path.join(root, f), path.join(dist, f));
if(fs.existsSync(path.join(root, 'og'))) fs.cpSync(path.join(root, 'og'), path.join(dist, 'og'), {recursive:true});
fs.mkdirSync(path.join(dist, 'i18n')); for(const f of ['en.js','fr.js']) fs.copyFileSync(path.join(root, 'i18n', f), path.join(dist, 'i18n', f));
const EX = {};
if(fs.existsSync(contentDir)) for(const f of fs.readdirSync(contentDir)){ if(!/^ex-[A-Z]\.json$/.test(f)) continue; Object.assign(EX, JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf8'))); }
fs.mkdirSync(path.join(dist, 'content')); fs.writeFileSync(path.join(dist, 'content/run.json'), JSON.stringify(RUN)); fs.writeFileSync(path.join(dist, 'content/examples.json'), JSON.stringify(EX));

// 3. pages
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const base = { en: '/workshops/', fr: '/fr/ateliers/' };
const pageUrl = (lang, id) => base[lang] + id + '/';
const figjamUrl = t => FIGJAM.file && FIGJAM.nodes[t.id] ? `https://www.figma.com/board/${FIGJAM.file}/${encodeURIComponent(FIGJAM.name)}?node-id=${encodeURIComponent(FIGJAM.nodes[t.id].replace(':', '-'))}` : '';
const fmtDur = (h, u, lang) => h >= 7 ? Math.round(h/7) + ' ' + u.days : (h < 1 ? Math.round(h*60) + ' ' + u.min : (h % 1 ? (lang === 'fr' ? h.toFixed(1).replace('.', ',') : h.toFixed(1)) : h) + ' ' + u.hours);
const CSS = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const FONTS = '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta name="theme-color" content="#F2F4F8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Public+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">';
const PAGE_CSS = `
.page{max-width:860px;margin:0 auto;padding-inline:20px;padding-block:20px 60px}
.crumbs{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px;color:var(--ink-3);margin-bottom:18px}
.crumbs a{color:var(--ink-2);text-decoration:none}.crumbs a:hover{text-decoration:underline}
.page h1{font-size:clamp(26px,4vw,36px);font-weight:800;letter-spacing:-.02em;margin:10px 0 8px}
.page .lead{font-size:17px;color:var(--ink-2);margin:0 0 18px;max-width:65ch}
.page .pv-box{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--pv-bg);margin:18px 0}
.page .cta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:16px 0}
.page section{margin-top:26px}
.page h2{font-size:20px;font-weight:700;margin-bottom:10px}
.page h3.k{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);font-family:"IBM Plex Mono",monospace;font-weight:500;margin:14px 0 6px}
.page ul,.page ol{margin:0;padding-left:20px;color:var(--ink-2)}
.page li{margin:4px 0}
.page .related{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.page .related a{display:block;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);text-decoration:none;color:var(--ink);font-weight:600}
.page .related a:hover{border-color:var(--accent)}
.page .related small{display:block;font-weight:400;color:var(--ink-3);margin-top:2px}
.page .foot{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--ink-3);display:flex;flex-wrap:wrap;gap:14px}
.page .foot a{color:var(--ink-2)}
`;
function head(lang, title, desc, url, extra = '', og = '/og/default.png'){
  const alt = lang === 'en' ? 'fr' : 'en';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="article"><meta property="og:url" content="${SITE}${url}"><meta property="og:site_name" content="${esc(I18N[lang].title)}"><meta property="og:image" content="${SITE}${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}${og}">
${extra}${FONTS}<style>${CSS}${PAGE_CSS}</style><script defer src="/_vercel/insights/script.js"></script></head><body>`;
}
function workshopPage(lang, t){
  const L = I18N[lang], u = L.ui, x = L.templates[t.id], ph = PHASES.find(p => p.id === t.phase), run = RUN[t.id] && RUN[t.id][lang];
  const url = pageUrl(lang, t.id), alt = lang === 'en' ? 'fr' : 'en', altUrl = pageUrl(alt, t.id);
  const title = `${x.name} · ${L.title}`;
  const desc = `${x.desc} ${x.why}`.slice(0, 300);
  const fj = figjamUrl(t);
  const stages = STAGES.map((s, i) => t.fit[i] >= 2 ? (t.fit[i] === 3 ? `<b>${esc(L.stages[s.id].short)}</b>` : esc(L.stages[s.id].short)) : null).filter(Boolean).join(' · ');
  const c = CHAIN[t.id] || {}, get = ids => (ids || []).map(id => T.find(q => q.id === id)).filter(Boolean);
  const outputs = T.filter(q => chainInputs(q.id).includes(t.id));
  const related = [...get(c.needs).map(q => ({q, k:u.needsRequired})), ...(c.anyOf || []).flatMap(g => get(g).map(q => ({q, k:u.oneOf}))), ...get(c.helps).map(q => ({q, k:u.needsHelpful})), ...outputs.map(q => ({q, k: lang === 'en' ? 'Feeds' : 'Alimente'}))];
  const ld = {'@context':'https://schema.org', '@type':'HowTo', name:x.name, description:x.desc, inLanguage:lang, totalTime:`PT${Math.round(t.dur*60)}M`, url:SITE + url};
  if(run) ld.step = run.agenda.map((a, i) => ({'@type':'HowToStep', position:i + 1, name:a.t, text:a.d}));
  const extra = `<link rel="alternate" hreflang="${alt}" href="${SITE}${altUrl}"><link rel="alternate" hreflang="${lang}" href="${SITE}${url}"><link rel="alternate" hreflang="x-default" href="${SITE}${pageUrl('en', t.id)}">\n<script type="application/ld+json">${JSON.stringify(ld)}</script>\n`;
  let html = head(lang, title, desc, url, extra, `/og/${lang}/${t.id}.png`);
  html += `<div class="page">
<nav class="crumbs"><a href="/${lang === 'fr' ? '?lang=fr' : ''}">${esc(L.title)}</a> › <a href="${base[lang]}">${esc(u.allWorkshops)}</a> › <span>${esc(L.phases[ph.id])}</span><span style="margin-left:auto"><a href="${altUrl}">${alt.toUpperCase()}</a></span></nav>
<span class="chip" style="--h:var(${ph.h})">${esc(L.phases[ph.id])}</span>
<h1>${esc(x.name)}</h1>
<p class="lead">${esc(x.desc)}</p>
<p class="why"><b>${esc(u.when)}</b> ${esc(x.why)}</p>
<dl class="meta"><div><dt>${esc(u.dur)}</dt><dd>${fmtDur(t.dur, u, lang)}</dd></div><div><dt>${esc(u.who)}</dt><dd>${esc(x.who)}</dd></div><div><dt>${esc(u.out)}</dt><dd>${esc(x.out)}</dd></div><div><dt>${esc(u.filterStage)}</dt><dd>${stages}</dd></div></dl>
<div class="pv-box">${Preview.renderPreview(LAYOUTS[lang][t.id], {class:'pv', title:u.preview(x.name)})}</div>
<div class="cta">${fj ? `<a class="btn primary" href="${fj}" target="_blank" rel="noopener">${esc(u.openFigjam)}</a>` : ''}<a class="btn" href="/?open=${t.id}${lang === 'fr' ? '&lang=fr' : ''}">${esc(u.openApp)}</a></div>
<p class="hint">${esc(u.figjamHint)}${FIGJAM.community ? ` <a href="${FIGJAM.community}" target="_blank" rel="noopener">${esc(u.communityLink)}</a>` : ''}</p>`;
  const ex = EX[t.id] && EX[t.id][lang];
  if(ex){
    html += `<section><h2>${esc(u.pvFilled)}</h2>
<div class="pv-box">${Preview.renderFilled(LAYOUTS[lang][t.id], ex.blocks, {class:'pv', title:u.pvFilled})}</div>
<p class="ex-intro"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 5v.2"/></svg><span>${esc(u.exampleIntro)}</span></p><p style="color:var(--ink-2);margin:10px 0 0">${esc(ex.context)}</p><div class="ex-take"><b>${esc(u.takeaway)}</b><p>${esc(ex.takeaway)}</p></div></section>`;
  }
  if(run){
    html += `<section><h2>${esc(u.howTo)}</h2>
<h3 class="k">${esc(u.prep)}</h3><ul>${run.prep.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
<h3 class="k">${esc(u.agenda)}</h3><ol class="agenda">${run.agenda.map(a => `<li><span class="mono amin">${a.min} ${esc(u.minutes)}</span><div><b>${esc(a.t)}</b><br>${esc(a.d)}</div></li>`).join('')}</ol>
<h3 class="k">${esc(u.pitfalls)}</h3><ul>${run.pitfalls.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
<h3 class="k">${esc(u.nextStep)}</h3><p style="color:var(--ink-2)">${esc(run.next)}</p>
${run.source ? `<p class="muted" style="font-size:13px">${esc(u.source)} : ${SOURCES[t.id] ? `<a href="${SOURCES[t.id]}" target="_blank" rel="noopener">${esc(run.source)}</a>` : esc(run.source)}</p>` : ''}</section>`;
  }
  if(related.length) html += `<section><h2>${lang === 'en' ? 'Related workshops' : 'Ateliers liés'}</h2><div class="related">${related.map(r => `<a href="${pageUrl(lang, r.q.id)}">${esc(L.templates[r.q.id].name)}<small>${esc(r.k)} · ${esc(L.phases[r.q.phase])}</small></a>`).join('')}</div></section>`;
  html += `<div class="foot"><a href="/${lang === 'fr' ? '?lang=fr' : ''}">${esc(u.backToApp)}</a><a href="${base[lang]}">${esc(u.allWorkshops)}</a><a href="${altUrl}">${alt === 'fr' ? 'Version française' : 'English version'}</a></div>
</div></body></html>`;
  return html;
}
function indexPage(lang){
  const L = I18N[lang], u = L.ui, url = base[lang], alt = lang === 'en' ? 'fr' : 'en';
  const title = `${u.allWorkshops} · ${L.title}`;
  const desc = lang === 'en' ? '60+ product workshops, by phase, with a preview, a how-to and a FigJam board for each.' : 'Plus de 60 ateliers produit, par phase, avec aperçu, déroulé et board FigJam pour chacun.';
  let html = head(lang, title, desc, url, `<link rel="alternate" hreflang="${alt}" href="${SITE}${base[alt]}">`);
  html += `<div class="page"><nav class="crumbs"><a href="/${lang === 'fr' ? '?lang=fr' : ''}">${esc(L.title)}</a> › <span>${esc(u.allWorkshops)}</span><span style="margin-left:auto"><a href="${base[alt]}">${alt.toUpperCase()}</a></span></nav><h1>${esc(u.allWorkshops)}</h1><p class="lead">${esc(desc)}</p>`;
  for(const ph of PHASES){
    const items = T.filter(t => t.phase === ph.id);
    html += `<section><h2><span class="chip" style="--h:var(${ph.h})">${esc(L.phases[ph.id])}</span></h2><div class="related">${items.map(t => `<a href="${pageUrl(lang, t.id)}">${esc(L.templates[t.id].name)}<small>${fmtDur(t.dur, u, lang)} · ${esc(L.templates[t.id].who)}</small></a>`).join('')}</div></section>`;
  }
  html += `<div class="foot"><a href="/${lang === 'fr' ? '?lang=fr' : ''}">${esc(u.backToApp)}</a></div></div></body></html>`;
  return html;
}
const urls = [];
for(const lang of ['en','fr']){
  const dir = path.join(dist, base[lang]); fs.mkdirSync(dir, {recursive:true});
  fs.writeFileSync(path.join(dir, 'index.html'), indexPage(lang)); urls.push(base[lang]);
  for(const t of T){ const d = path.join(dir, t.id); fs.mkdirSync(d, {recursive:true}); fs.writeFileSync(path.join(d, 'index.html'), workshopPage(lang, t)); urls.push(pageUrl(lang, t.id)); }
}

// 4. sitemap, robots, llms.txt
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE}/</loc></url>\n${urls.map(u => `<url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
const L = I18N.en;
let llms = `# ${L.title}\n\n> Pick your product stage and what is blocking: get the sequence of product workshops to run, a preview of each template, a how-to and a FigJam board. Free, English and French.\n\nApp: ${SITE}/\nFigJam file (Figma Community): ${FIGJAM.community}\n\n## Workshops by phase\n\n`;
for(const ph of PHASES){ llms += `### ${L.phases[ph.id]}\n\n`; for(const t of T.filter(t => t.phase === ph.id)){ const x = L.templates[t.id]; llms += `- [${x.name}](${SITE}${pageUrl('en', t.id)}): ${x.desc} Duration ${fmtDur(t.dur, L.ui, 'en')}. ${x.why}\n`; } llms += '\n'; }
llms += `## Stages\n\n${STAGES.map(s => `- ${L.stages[s.id].name}: ${L.stages[s.id].hint}`).join('\n')}\n\n## French version\n\n${SITE}${base.fr}\n`;
fs.writeFileSync(path.join(dist, 'llms.txt'), llms);
console.log(`built ${urls.length} pages, ${Object.keys(RUN).length} how-tos → dist/`);
