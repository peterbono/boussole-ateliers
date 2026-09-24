// Workshop Compass: generates the Plugin API scripts (use_figma) that build one FigJam section per workshop.
// node tools/figjam-gen.js [outDir] [lang]  → writes <outDir>/batch-*.js (one per batch), titles.js and plan.json
// Sources: data.js (structure), i18n/<lang>.js (titles, descriptions, phase names), layouts.<lang>.js (labels).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'tools', 'figjam-out');
const LANG = (process.argv[3] && !process.argv[3].startsWith('--')) ? process.argv[3] : 'en';
// --only=id1,id2 : ne génère que ces ateliers (ajout incrémental dans un fichier déjà publié)
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
const { PHASES, T } = require(path.join(root, 'data.js'));
const { LAYOUTS } = require(path.join(root, `layouts.${LANG}.js`));
const { I18N } = require(path.join(root, 'i18n', `${LANG}.js`));

const S = 8;                       // 320×200 → 2560×1600
const PAD = 64, TOP = 200;
const SEC_W = 2560 + 2 * PAD, SEC_H = 1600 + TOP + PAD;
const GAP = 160, COLS = 4, PHASE_TITLE_H = 200, PHASE_GAP = 400;
const ORIGIN = { x: 0, y: 0 };
const PHASE_FILL = { cadrage:'F8F5FF', strategie:'F5FBFF', research:'F1FEFD', ideation:'FFFBF0', prio:'FFF7F0', conception:'FFF0FA', alignement:'EBFFEE', mesure:'F9F9F9' };

// plan de placement
const plan = { phases: [], items: [] };
let y = ORIGIN.y;
for (const p of PHASES) {
  const items = T.filter(t => t.phase === p.id);
  plan.phases.push({ id: p.id, name: I18N.phases[p.id], x: ORIGIN.x, y });
  y += PHASE_TITLE_H;
  items.forEach((t, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const tx = I18N.templates[t.id];
    plan.items.push({ id: t.id, name: tx.name, desc: tx.desc, phase: p.id, fill: PHASE_FILL[p.id], x: ORIGIN.x + col * (SEC_W + GAP), y: y + row * (SEC_H + GAP), layout: LAYOUTS[t.id] });
  });
  y += Math.ceil(items.length / COLS) * (SEC_H + GAP) - GAP + PHASE_GAP;
}
fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify(plan, null, 1));
// le plan de placement reste calculé sur le catalogue complet : les positions
// des ateliers filtrés restent celles de la grille finale.
if (ONLY.length) plan.items = plan.items.filter(i => ONLY.includes(i.id));

const RUNTIME = String.raw`
const S = ${S}, PAD = ${PAD}, TOP = ${TOP}, CW = 2560, CH = 1600;
const h = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 });
const hex = s => h(parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16));
const INK = hex('1E1E1E'), MUTED = hex('757575'), LINE = hex('B3B3B3'), FILL = hex('FFFFFF'), SOFT = hex('C2E5FF'), WARN = hex('FFCDC2'), ACCENT = hex('3DADFF');
const STICKY = ['FFE299','B3EFBD','A8DAFF','FFA8DB','D3BDFF','FFD3A8'].map(hex);
const WORDS = ${JSON.stringify(LANG === 'fr' ? ['Idée','Insight','Hypothèse','Action','Question','Risque'] : ['Idea','Insight','Hypothesis','Action','Question','Risk'])};
const solid = c => [{ type: 'SOLID', color: c }];
for (const st of ['Regular','Medium','Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
const ids = {};

function rect(sec, x, y, w, hh, fill, stroke, radius) {
  const r = figma.createRectangle(); sec.appendChild(r);
  r.resize(Math.max(w, 1), Math.max(hh, 1)); r.x = x; r.y = y;
  r.fills = fill ? solid(fill) : []; r.strokes = stroke ? solid(stroke) : []; r.strokeWeight = 2; r.cornerRadius = radius == null ? 12 : radius;
  return r;
}
function text(sec, x, y, str, size, style, o) {
  o = o || {};
  const t = figma.createText(); sec.appendChild(t);
  t.fontName = { family: 'Inter', style: style || 'Medium' }; t.fontSize = size; t.characters = str; t.fills = solid(o.color || INK);
  if (o.w) { t.textAutoResize = 'HEIGHT'; t.resize(o.w, t.height); if (o.anchor === 'middle') t.textAlignHorizontal = 'CENTER'; }
  if (o.anchor === 'middle') t.x = o.w ? x : x - t.width / 2; else if (o.anchor === 'end') t.x = x - t.width; else t.x = x;
  t.y = y;
  if (o.rotate) { t.rotation = 90; t.x = x; t.y = y; }
  return t;
}
function sticky(sec, x, y, i, label) {
  const s = figma.createSticky(); sec.appendChild(s);
  s.text.characters = label || WORDS[i % WORDS.length]; s.fills = solid(STICKY[i % STICKY.length]); s.authorVisible = false; s.x = x; s.y = y;
  return s;
}
function stickies(sec, x, y, w, hh, n, seed) {
  const size = 240, gap = 24, perRow = Math.floor((w - 16) / (size + gap)), rows = Math.floor((hh - 16) / (size + gap));
  if (perRow < 1 || rows < 1) return;
  n = Math.min(n, perRow * rows);
  for (let i = 0; i < n; i++) sticky(sec, x + 8 + (i % perRow) * (size + gap), y + 8 + Math.floor(i / perRow) * (size + gap), seed + i);
}
function dot(sec, cx, cy, r, color) { const e = figma.createEllipse(); sec.appendChild(e); e.resize(r * 2, r * 2); e.x = cx - r; e.y = cy - r; e.fills = solid(color); return e; }
function shape(sec, x, y, w, hh, label, type, preset) {
  const s = figma.createShapeWithText(); sec.appendChild(s);
  s.shapeType = type || 'ROUNDED_RECTANGLE'; s.resize(w, hh); s.x = x; s.y = y;
  s.text.characters = label; s.text.fontSize = 28;
  const p = preset || { fill: FILL, stroke: LINE, text: INK };
  s.fills = solid(p.fill); s.strokes = solid(p.stroke); s.text.fills = solid(p.text);
  return s;
}
function connect(sec, a, b, arrow, type) {
  const c = figma.createConnector(); sec.appendChild(c);
  c.connectorStart = { endpointNodeId: a.id, magnet: 'AUTO' }; c.connectorEnd = { endpointNodeId: b.id, magnet: 'AUTO' };
  c.connectorLineType = type || 'STRAIGHT'; c.connectorStartStrokeCap = 'NONE'; c.connectorEndStrokeCap = arrow ? 'ARROW_LINES' : 'NONE';
  c.strokes = solid(arrow ? INK : LINE); c.strokeWeight = 3; return c;
}
const fitStr = (t, w, size) => { const max = Math.floor(w / (size * 0.55)); return t.length > max ? t.slice(0, Math.max(1, max - 1)) + '…' : t; };

const K = {};
K.columns = (sec, L, ox, oy) => {
  const p = 64, gap = 48, n = L.cols.length, cw = (CW - 2 * p - gap * (n - 1)) / n;
  L.cols.forEach((c, i) => {
    const x = ox + p + i * (cw + gap), y = oy + p, hh = CH - 2 * p;
    rect(sec, x, y, cw, hh, FILL, LINE);
    text(sec, x + 24, y + 22, c.t, 32, 'Bold', { w: cw - 48 });
    rect(sec, x, y + 96, cw, 2, LINE, null, 0);
    stickies(sec, x + 24, y + 120, cw - 48, hh - 144, c.n || 0, i * 3);
    if (c.dots) for (let d = 0; d < c.dots; d++) dot(sec, x + cw - 40 - d * 44, y + hh - 40, 16, ACCENT);
  });
};
K.quadrant = (sec, L, ox, oy) => {
  const p = 64, fh = L.footer ? 220 : 0, ax = (L.x[0] || L.x[1]) ? 56 : 0, ay = (L.y[0] || L.y[1]) ? 56 : 0;
  const gx = ox + p + ay, gy = oy + p, gw = CW - 2 * p - ay, gh = CH - 2 * p - ax - fh, hw = gw / 2, hh = gh / 2;
  rect(sec, gx, gy, gw, gh, FILL, LINE);
  rect(sec, gx + hw - 1, gy, 3, gh, LINE, null, 0); rect(sec, gx, gy + hh - 1, gw, 3, LINE, null, 0);
  const pos = [[gx, gy], [gx + hw, gy], [gx, gy + hh], [gx + hw, gy + hh]];
  L.cells.forEach((c, i) => { text(sec, pos[i][0] + 24, pos[i][1] + 22, c, 32, 'Bold', { w: hw - 48 }); stickies(sec, pos[i][0] + 24, pos[i][1] + 100, hw - 48, hh - 124, 2 + (i % 2), i * 5); });
  if (ax) { text(sec, gx, gy + gh + 14, L.x[0], 24, 'Regular', { color: MUTED }); text(sec, gx + gw, gy + gh + 14, L.x[1], 24, 'Regular', { color: MUTED, anchor: 'end' }); }
  if (ay) { text(sec, ox + p, gy + gh, L.y[0], 24, 'Regular', { color: MUTED, rotate: true }); }
  if (ay) { const t = text(sec, ox + p, gy, L.y[1], 24, 'Regular', { color: MUTED, rotate: true }); t.y = gy + t.width; }
  if (L.footer) { const fw = (gw - 48) / 2; L.footer.forEach((f, i) => { const fx = gx + i * (fw + 48), fy = gy + gh + 40; rect(sec, fx, fy, fw, fh - 40, FILL, LINE); text(sec, fx + 24, fy + 22, f, 32, 'Bold'); }); }
};
K.canvas = (sec, L, ox, oy) => {
  const p = 64, gap = 24, cw = (CW - 2 * p - gap * (L.cols - 1)) / L.cols, rh = (CH - 2 * p - gap * (L.rows - 1)) / L.rows;
  L.blocks.forEach((b, i) => {
    const w = b.w || 1, hh = b.h || 1;
    const x = ox + p + b.c * (cw + gap), y = oy + p + b.r * (rh + gap), bw = w * cw + (w - 1) * gap, bh = hh * rh + (hh - 1) * gap;
    rect(sec, x, y, bw, bh, FILL, LINE);
    text(sec, x + 24, y + 20, b.t, 28, 'Bold', { w: bw - 48 });
    if (bh >= 400 && bw >= 300) stickies(sec, x + 24, y + 110, bw - 48, bh - 134, 1 + (i % 2), i * 7);
  });
};
K.grid = (sec, L, ox, oy) => {
  const p = 64, hasR = L.rows.some(r => r), hasC = L.cols.some(c => c), lw = hasR ? 360 : 0, th = hasC ? 100 : 0;
  const gx = ox + p + lw, gy = oy + p + th, gw = CW - 2 * p - lw, gh = CH - 2 * p - th, cw = gw / L.cols.length, rh = gh / L.rows.length;
  rect(sec, gx, gy, gw, gh, null, LINE, 0);
  L.cols.forEach((c, i) => { if (i) rect(sec, gx + i * cw - 1, oy + p, 2, CH - 2 * p, LINE, null, 0); if (c) text(sec, gx + i * cw + cw / 2, oy + p + 30, fitStr(c, cw - 24, 28), 28, 'Bold', { anchor: 'middle' }); });
  L.rows.forEach((r, j) => { if (j) rect(sec, ox + p, gy + j * rh - 1, CW - 2 * p, 2, LINE, null, 0); if (r) text(sec, ox + p + 16, gy + j * rh + rh / 2 - 18, fitStr(r, lw - 32, 28), 28, 'Medium'); });
  const seq = L.letters || 'RACI'; let k = 11;
  const rnd = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  for (let j = 0; j < L.rows.length; j++) for (let i = 0; i < L.cols.length; i++) {
    const x = gx + i * cw, y = gy + j * rh;
    if (L.cells === 'stickies') { if (cw >= 280 && rh >= 280 && rnd() > 0.35) sticky(sec, x + cw / 2 - 120, y + rh / 2 - 120, Math.floor(rnd() * 6)); }
    else if (L.cells === 'letters') { const last = i === L.cols.length - 1; text(sec, x + cw / 2, y + rh / 2 - 22, last ? String(Math.floor(rnd() * 90 + 10)) : (L.letters ? seq[Math.floor(rnd() * seq.length)] : String(Math.floor(rnd() * 9 + 1))), 36, 'Medium', { anchor: 'middle', color: last ? ACCENT : INK }); }
    else if (L.cells === 'dots') { const kk = Math.floor(rnd() * 3); if (i === kk) dot(sec, x + cw / 2, y + rh / 2, Math.min(28, rh * 0.3), [hex('66D575'), hex('FFC943'), hex('FF7556')][kk]); if (i === L.cols.length - 1) text(sec, x + cw / 2, y + rh / 2 - 18, ['↑','→','↓'][Math.floor(rnd() * 3)], 32, 'Medium', { anchor: 'middle', color: MUTED }); }
  }
};
K.tree = (sec, L, ox, oy) => {
  const p = 64, lw = (CW - 2 * p) / L.levels.length, nh = 120;
  let prev = [];
  L.levels.forEach((lv, li) => {
    const x = ox + p + li * lw + 32, w = lw - 128, n = lv.n, gap = (CH - 2 * p - 80) / n, cur = [];
    text(sec, x, oy + p, lv.t, 24, 'Regular', { color: MUTED });
    for (let i = 0; i < n; i++) {
      const y = oy + p + 80 + gap * i + gap / 2 - nh / 2;
      const s = shape(sec, x, y, w, nh, n === 1 ? lv.t : lv.t.replace(/s$/, '') + ' ' + (i + 1), 'ROUNDED_RECTANGLE', li === 0 ? { fill: SOFT, stroke: ACCENT, text: INK } : null);
      cur.push(s);
      if (prev.length) connect(sec, prev[Math.floor(i * prev.length / n)], s, false, 'CURVED');
    }
    prev = cur;
  });
};
K.flow = (sec, L, ox, oy) => {
  const p = 64, n = L.steps.length, gap = 120, sw = (CW - 2 * p - gap * (n - 1)) / n, sh = 260, y = oy + (L.branch ? CH / 2 - 260 : CH / 2 - sh / 2);
  let prev = null;
  L.steps.forEach((st, i) => {
    const x = ox + p + i * (sw + gap), isQ = /\?$/.test(st);
    const s = shape(sec, x, y, sw, sh, st.replace(' · ', '\n'), isQ ? 'DIAMOND' : 'ROUNDED_RECTANGLE');
    if (prev) connect(sec, prev, s, true);
    if (L.branch && isQ) { const b = shape(sec, x, y + sh + 200, sw, 180, L.branch, 'ROUNDED_RECTANGLE', { fill: WARN, stroke: hex('FF7556'), text: INK }); connect(sec, s, b, true); }
    prev = s;
  });
};

// Cible concentrique : un anneau par horizon, un secteur par domaine.
// Les rayons ne sont pas alignes sur les axes des qu'il y a autre chose que
// 4 secteurs, d'ou la matrice posee a la main plutot qu'une rotation.
K.radar = (sec, L, ox, oy) => {
  const p = 64, cx = ox + CW / 2, cy = oy + CH / 2, rMax = (CH - 2 * p) / 2 - 24, BAND = hex('F4F6FA');
  for (let i = L.rings.length; i > 0; i--) {
    const r = rMax * i / L.rings.length;
    const e = figma.createEllipse(); sec.appendChild(e);
    e.resize(r * 2, r * 2); e.x = cx - r; e.y = cy - r;
    e.fills = solid(i % 2 ? BAND : FILL); e.strokes = solid(LINE); e.strokeWeight = 3;
  }
  const ray = (ang) => {
    const w = 3, r = rect(sec, 0, 0, w, rMax, LINE, null, 0);
    const th = ang + Math.PI / 2, c = Math.cos(th), si = Math.sin(th);
    r.relativeTransform = [[c, -si, cx - c * w / 2], [si, c, cy - si * w / 2]];
  };
  L.sectors.forEach((_, i) => ray((i / L.sectors.length) * Math.PI * 2 - Math.PI / 2));
  // quelques notes deja posees, une case sur deux, pour montrer comment on remplit
  L.sectors.forEach((_, si) => {
    const a = ((si + 0.5) / L.sectors.length) * Math.PI * 2 - Math.PI / 2;
    L.rings.forEach((_, ri) => {
      // l'anneau exterieur reste libre : c'est la que sont poses les noms de secteur
      if (!ri || ri > L.rings.length - 2 || (si + ri) % 2) return;
      const r = rMax * (ri + 0.5) / L.rings.length;
      sticky(sec, cx + Math.cos(a) * r - 120, cy + Math.sin(a) * r - 120, si + ri);
    });
  });
  L.sectors.forEach((t, i) => {
    const a = ((i + 0.5) / L.sectors.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * (rMax + 96), y = cy + Math.sin(a) * (rMax + 96);
    const anchor = Math.cos(a) > 0.25 ? 'start' : Math.cos(a) < -0.25 ? 'end' : 'middle';
    text(sec, x, y - 18, t, 32, 'Bold', { anchor });
  });
  // le nom de l'horizon est pose sur l'axe vertical, sur un fond qui masque le rayon
  L.rings.forEach((t, i) => {
    const r = rMax * (i + 1) / L.rings.length - 30;
    const w = t.length * 17 + 40;
    rect(sec, cx - w / 2, cy - r - 26, w, 52, FILL, LINE, 26);
    text(sec, cx, cy - r - 14, t, 28, 'Bold', { anchor: 'middle', color: i ? MUTED : ACCENT });
  });
};

async function build(item) {
  const sec = figma.createSection(); sec.name = item.name; sec.resize(${SEC_W}, ${SEC_H}); sec.x = item.x; sec.y = item.y;
  sec.fills = solid(hex(item.fill));
  text(sec, PAD, 40, item.name, 48, 'Bold');
  text(sec, PAD, 112, item.desc, 24, 'Regular', { w: CW, color: MUTED });
  K[item.layout.kind](sec, item.layout, PAD, TOP);
  ids[item.id] = sec.id;
}
`;

const BATCH = 6;
const batches = [];
for (let i = 0; i < plan.items.length; i += BATCH) batches.push(plan.items.slice(i, i + BATCH));
batches.forEach((b, i) => {
  const code = RUNTIME + `\nconst BATCH = ${JSON.stringify(b)};\nfor (const item of BATCH) await build(item);\nreturn ids;\n`;
  fs.writeFileSync(path.join(OUT, `batch-${String(i + 1).padStart(2, '0')}.js`), code);
});
// phase titles (page level)
const titles = `for (const st of ['Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
const P = ${JSON.stringify(plan.phases)}; const out = [];
for (const p of P) { const t = figma.createText(); t.fontName = { family: 'Inter', style: 'Bold' }; t.fontSize = 96; t.characters = p.name; t.x = p.x; t.y = p.y; out.push(t.id); }
return out;`;
fs.writeFileSync(path.join(OUT, 'titles.js'), titles);
console.log('batches', batches.length, 'runtime chars', RUNTIME.length, 'max batch chars', Math.max(...batches.map((b, i) => fs.statSync(path.join(OUT, `batch-${String(i + 1).padStart(2, '0')}.js`)).size)));
