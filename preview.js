// Boussole Ateliers : rendu SVG d'un layout (aperçu sur le site, export "Copier en SVG").
// Géométrie de référence : 320 × 200. Le générateur FigJam reprend les mêmes proportions ×4.
(function(global){
  const W = 320, H = 200, P = 8;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // couleurs de stickies FigJam (jaune, vert, bleu, rose, violet, orange)
  const STICKY = ['#FFE58F','#B7EB8F','#91D5FF','#FFADD2','#D3ADF7','#FFD591'];
  const rnd = seed => { let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };

  function box(x, y, w, h, opts = {}){
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${opts.fill || 'var(--pv-fill)'}" stroke="${opts.stroke || 'var(--pv-line)'}" stroke-width="1"/>`;
  }
  function label(x, y, text, opts = {}){
    const size = opts.size || 8.5;
    const anchor = opts.anchor || 'start';
    const weight = opts.weight || 600;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${opts.fill || 'var(--pv-ink)'}" font-family="Public Sans, system-ui, sans-serif">${esc(text)}</text>`;
  }
  function sticky(x, y, s, i){ return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s}" height="${s}" rx="1.5" fill="${STICKY[i % STICKY.length]}"/>`; }
  function stickies(x, y, w, h, n, seed){
    const s = Math.min(16, Math.max(9, Math.floor(w / 3.2)));
    const perRow = Math.max(1, Math.floor((w - 4) / (s + 4)));
    let out = '', r = rnd(seed);
    for(let i = 0; i < n; i++){
      const col = i % perRow, row = Math.floor(i / perRow);
      const sx = x + 3 + col * (s + 4), sy = y + 3 + row * (s + 4);
      if(sy + s > y + h) break;
      out += `<g transform="rotate(${((r() - .5) * 6).toFixed(1)} ${sx + s/2} ${sy + s/2})">${sticky(sx, sy, s, Math.floor(r() * 6))}</g>`;
    }
    return out;
  }
  // tronque un titre pour tenir dans w px (approx 4.6px/char à 8.5px)
  const fit = (t, w, size = 8.5) => { const max = Math.floor(w / (size * .54)); return t.length > max ? t.slice(0, Math.max(1, max - 1)) + '…' : t; };

  const R = {};
  R.columns = ({cols}) => {
    const gap = 6, cw = (W - 2*P - gap*(cols.length - 1)) / cols.length;
    let out = '';
    cols.forEach((c, i) => {
      const x = P + i*(cw + gap);
      out += box(x, P, cw, H - 2*P) + label(x + 5, P + 13, fit(c.t, cw - 10)) + `<line x1="${x}" y1="${P+18}" x2="${x+cw}" y2="${P+18}" stroke="var(--pv-line)"/>`;
      out += stickies(x + 2, P + 22, cw - 4, H - 2*P - 24, c.n || 0, i + 1);
      if(c.dots){ for(let d = 0; d < c.dots; d++) out += `<circle cx="${x + cw - 8 - d*8}" cy="${H - P - 8}" r="3" fill="var(--pv-accent)"/>`; }
    });
    return out;
  };
  R.quadrant = ({x, y, cells, footer}) => {
    const fh = footer ? 26 : 0, ax = x[0] || x[1] ? 12 : 0, ay = y[0] || y[1] ? 12 : 0;
    const gx = P + ay, gy = P, gw = W - 2*P - ay, gh = H - 2*P - ax - fh, hw = gw/2, hh = gh/2;
    let out = box(gx, gy, gw, gh) + `<line x1="${gx+hw}" y1="${gy}" x2="${gx+hw}" y2="${gy+gh}" stroke="var(--pv-line)"/><line x1="${gx}" y1="${gy+hh}" x2="${gx+gw}" y2="${gy+hh}" stroke="var(--pv-line)"/>`;
    const pos = [[gx, gy],[gx+hw, gy],[gx, gy+hh],[gx+hw, gy+hh]];
    cells.forEach((c, i) => { out += label(pos[i][0] + 6, pos[i][1] + 13, fit(c, hw - 12)); out += stickies(pos[i][0] + 4, pos[i][1] + 18, hw - 8, hh - 22, 3 + (i*2)%4, i + 3); });
    if(ax){ out += label(gx + 2, H - P - fh - 2, x[0], {size:7, weight:500, fill:'var(--pv-muted)'}) + label(gx + gw - 2, H - P - fh - 2, x[1], {size:7, weight:500, anchor:'end', fill:'var(--pv-muted)'}); }
    if(ay){ out += `<text transform="translate(${P+8} ${gy+gh-2}) rotate(-90)" font-size="7" font-weight="500" fill="var(--pv-muted)" font-family="Public Sans, system-ui, sans-serif">${esc(y[0])}</text><text transform="translate(${P+8} ${gy+2}) rotate(-90)" text-anchor="end" font-size="7" font-weight="500" fill="var(--pv-muted)" font-family="Public Sans, system-ui, sans-serif">${esc(y[1])}</text>`; }
    if(footer){ const fw = (gw - 6)/2; footer.forEach((f, i) => { const fx = gx + i*(fw + 6); out += box(fx, gy + gh + 4, fw, fh - 4) + label(fx + 6, gy + gh + 4 + 14, f); }); }
    return out;
  };
  R.canvas = ({cols, rows, blocks}) => {
    const gap = 4, cw = (W - 2*P - gap*(cols - 1)) / cols, rh = (H - 2*P - gap*(rows - 1)) / rows;
    let out = '';
    blocks.forEach((b, i) => {
      const w = (b.w || 1), h = (b.h || 1);
      const x = P + b.c*(cw + gap), y = P + b.r*(rh + gap), bw = w*cw + (w - 1)*gap, bh = h*rh + (h - 1)*gap;
      out += box(x, y, bw, bh);
      // titre sur 1 ou 2 lignes
      const maxc = Math.floor((bw - 10) / 4.6);
      if(b.t.length > maxc && bh > 26){
        const cut = b.t.lastIndexOf(' ', maxc); const a = b.t.slice(0, cut > 4 ? cut : maxc), c = b.t.slice(cut > 4 ? cut + 1 : maxc);
        out += label(x + 5, y + 12, a, {size:7.5}) + label(x + 5, y + 21, fit(c, bw - 10, 7.5), {size:7.5});
      } else out += label(x + 5, y + 12, fit(b.t, bw - 10, 7.5), {size:7.5});
      if(bh > 40) out += stickies(x + 3, y + 26, bw - 6, bh - 30, 1 + (i % 3), i + 7);
    });
    return out;
  };
  R.grid = ({rows, cols, cells, letters}) => {
    const hasRowHead = rows.some(r => r), hasColHead = cols.some(c => c);
    const lw = hasRowHead ? 58 : 0, th = hasColHead ? 16 : 0;
    const gx = P + lw, gy = P + th, gw = W - 2*P - lw, gh = H - 2*P - th;
    const cw = gw / cols.length, rh = gh / rows.length;
    let out = box(gx, gy, gw, gh, {fill:'none'});
    cols.forEach((c, i) => { if(i) out += `<line x1="${gx + i*cw}" y1="${P}" x2="${gx + i*cw}" y2="${H - P}" stroke="var(--pv-line)"/>`; if(c) out += label(gx + i*cw + cw/2, P + 11, fit(c, cw - 4, 7.5), {size:7.5, anchor:'middle'}); });
    rows.forEach((r, j) => { if(j) out += `<line x1="${P}" y1="${gy + j*rh}" x2="${W - P}" y2="${gy + j*rh}" stroke="var(--pv-line)"/>`; if(r) out += label(P + 2, gy + j*rh + rh/2 + 3, fit(r, lw - 6, 7.5), {size:7.5}); });
    const seq = letters || 'RACI', rr = rnd(11);
    for(let j = 0; j < rows.length; j++) for(let i = 0; i < cols.length; i++){
      const x = gx + i*cw, y = gy + j*rh;
      if(cells === 'stickies'){ if(rr() > .35) out += `<g transform="rotate(${((rr()-.5)*6).toFixed(1)} ${x+cw/2} ${y+rh/2})">${sticky(x + cw/2 - Math.min(cw, rh)*.28, y + rh/2 - Math.min(cw, rh)*.28, Math.min(cw, rh)*.56, Math.floor(rr()*6))}</g>`; }
      else if(cells === 'letters'){ const isScore = i === cols.length - 1; out += label(x + cw/2, y + rh/2 + 3, isScore ? String(Math.floor(rr()*90 + 10)) : (letters ? seq[Math.floor(rr()*seq.length)] : String(Math.floor(rr()*9 + 1))), {size:8, anchor:'middle', fill:isScore ? 'var(--pv-accent)' : 'var(--pv-ink)'}); }
      else if(cells === 'dots'){ const k = Math.floor(rr()*3); if(i === k) out += `<circle cx="${x + cw/2}" cy="${y + rh/2}" r="${Math.min(5, rh*.3)}" fill="${['#3CB371','#F5C542','#E5533C'][k]}"/>`; if(i === cols.length - 1) out += label(x + cw/2, y + rh/2 + 3, ['↑','→','↓'][Math.floor(rr()*3)], {size:8, anchor:'middle', fill:'var(--pv-muted)'}); }
    }
    return out;
  };
  R.tree = ({levels}) => {
    const lw = (W - 2*P) / levels.length, nh = 14;
    let out = '', prev = [];
    levels.forEach((lv, li) => {
      const x = P + li*lw + 4, w = lw - 12;
      const n = lv.n, gap = (H - 2*P - 14) / n, ys = [];
      for(let i = 0; i < n; i++){ const y = P + 14 + gap*i + gap/2 - nh/2; ys.push(y + nh/2);
        out += box(x, y, w, nh, {fill: li === 0 ? 'var(--pv-accent-soft)' : 'var(--pv-fill)'});
        if(prev.length){ const py = prev[Math.floor(i * prev.length / n)]; out += `<path d="M${(x - 8).toFixed(1)} ${py.toFixed(1)} C${(x-3).toFixed(1)} ${py.toFixed(1)} ${(x-5).toFixed(1)} ${(y+nh/2).toFixed(1)} ${x.toFixed(1)} ${(y+nh/2).toFixed(1)}" fill="none" stroke="var(--pv-line)"/>`; }
      }
      out += label(x, P + 9, lv.t, {size:7.5, fill:'var(--pv-muted)', weight:500});
      prev = ys;
    });
    return out;
  };
  R.flow = ({steps, branch}) => {
    const n = steps.length, gap = 12, sw = (W - 2*P - gap*(n - 1)) / n, sh = 34, y = branch ? H/2 - 30 : H/2 - sh/2;
    let out = '';
    steps.forEach((s, i) => {
      const x = P + i*(sw + gap), isQ = /\?$/.test(s);
      out += isQ ? `<path d="M${x+sw/2} ${y} L${x+sw} ${y+sh/2} L${x+sw/2} ${y+sh} L${x} ${y+sh/2} Z" fill="var(--pv-fill)" stroke="var(--pv-line)"/>` : box(x, y, sw, sh);
      const parts = s.split(' · ');
      if(parts.length > 1){ out += label(x + sw/2, y + 14, parts[0], {size:7, anchor:'middle', fill:'var(--pv-muted)', weight:500}) + label(x + sw/2, y + 25, fit(parts[1], sw - 6, 7.5), {size:7.5, anchor:'middle'}); }
      else out += label(x + sw/2, y + sh/2 + 3, fit(s, sw - 6, 7.5), {size:7.5, anchor:'middle'});
      if(i < n - 1) out += `<path d="M${x+sw+2} ${y+sh/2} L${x+sw+gap-2} ${y+sh/2}" stroke="var(--pv-ink)" stroke-width="1.2" marker-end="url(#pv-arrow)"/>`;
      if(branch && isQ){ const bx = x + sw/2, by = y + sh + 30; out += `<path d="M${bx} ${y+sh+2} L${bx} ${by-2}" stroke="var(--pv-ink)" stroke-width="1.2" marker-end="url(#pv-arrow)"/>` + box(bx - sw/2, by, sw, 24, {fill:'var(--pv-warn-soft)'}) + label(bx, by + 15, fit(branch, sw - 6, 7.5), {size:7.5, anchor:'middle'}); }
    });
    return out;
  };

  function renderPreview(layout, opts = {}){
    const body = (R[layout.kind] || (() => ''))(layout);
    const cls = opts.class ? ` class="${opts.class}"` : '';
    return `<svg${cls} viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(opts.title || 'Aperçu')}"><defs><marker id="pv-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6z" fill="var(--pv-ink)"/></marker></defs><rect width="${W}" height="${H}" rx="6" fill="var(--pv-bg)"/>${body}</svg>`;
  }
  // version autonome (couleurs résolues) pour le presse-papier / Figma
  function renderStandalone(layout, title){
    const vars = {'--pv-bg':'#FFFFFF','--pv-fill':'#F6F7FA','--pv-line':'#C9D0DC','--pv-ink':'#1A2236','--pv-muted':'#6B7590','--pv-accent':'#1F4FE0','--pv-accent-soft':'#E4EAFC','--pv-warn-soft':'#FCE4DA'};
    let svg = renderPreview(layout, {title}).replace(/var\((--pv-[a-z-]+)\)/g, (m, k) => vars[k] || '#000');
    return svg.replace('<svg ', '<svg width="1280" height="800" ');
  }
  global.Preview = { renderPreview, renderStandalone, W, H, STICKY };
})(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module.exports : this));
