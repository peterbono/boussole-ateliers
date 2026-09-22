// Génère les icônes du site à partir de la marque : PNG (apple-touch, 192, 512), favicon.ico.
// Usage : node tools/icons.js   (Chrome headless + Pillow requis en local ; les fichiers sont commités)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const CH = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MARK = (scale, ink = '#1A2236', accent = '#1F4FE0') => `<g transform="translate(16 16) scale(${scale}) translate(-16 -16)"><circle cx="16" cy="16" r="12.2" stroke="${ink}" stroke-width="1.8"/><path d="M16 1.4v2.6M16 28v2.6M1.4 16h2.6M28 16h2.6" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/><path d="M16 7.2l3.6 8.8H16z" fill="${accent}"/><path d="M16 7.2L12.4 16H16z" fill="${accent}" fill-opacity=".62"/><path d="M16 24.8l3.6-8.8H16z" fill="${ink}" fill-opacity=".18"/><path d="M16 24.8L12.4 16H16z" fill="${ink}" fill-opacity=".34"/></g>`;
const svg = (scale, bg, ink, accent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="${bg}"/>${MARK(scale, ink, accent)}</svg>`;
const tmp = path.join(root, 'tools', '.icon-tmp'); fs.mkdirSync(tmp, {recursive:true});
const shot = (name, size, content) => {
  const f = path.join(tmp, name + '.html');
  fs.writeFileSync(f, `<body style="margin:0"><div style="width:${size}px;height:${size}px">${content.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`);
  execFileSync(CH, ['--headless=new','--disable-gpu','--hide-scrollbars',`--window-size=${size},${size}`,'--virtual-time-budget=3000',`--screenshot=${path.join(root, name)}`,`file://${f}`], {stdio:'ignore'});
};
shot('apple-touch-icon.png', 180, svg(.72, '#F2F4F8', '#1A2236', '#1F4FE0'));
shot('icon-192.png', 192, svg(.78, '#F2F4F8', '#1A2236', '#1F4FE0'));
shot('icon-512.png', 512, svg(.78, '#F2F4F8', '#1A2236', '#1F4FE0'));
shot('.ico-src.png', 256, svg(.86, '#F2F4F8', '#1A2236', '#1F4FE0'));
execFileSync('python3', ['-c', `from PIL import Image
im = Image.open('${path.join(root, '.ico-src.png')}').convert('RGBA')
im.save('${path.join(root, 'favicon.ico')}', sizes=[(16,16),(32,32),(48,48)])`], {stdio:'inherit'});
fs.unlinkSync(path.join(root, '.ico-src.png'));
fs.rmSync(tmp, {recursive:true, force:true});
fs.writeFileSync(path.join(root, 'site.webmanifest'), JSON.stringify({
  name:'Workshop Compass', short_name:'Compass',
  description:'The right product workshop, at the right stage, in the right order.',
  start_url:'/', display:'standalone', background_color:'#F2F4F8', theme_color:'#F2F4F8',
  icons:[{src:'/icon-192.png', sizes:'192x192', type:'image/png'},{src:'/icon-512.png', sizes:'512x512', type:'image/png'},{src:'/favicon.svg', sizes:'any', type:'image/svg+xml'}]
}, null, 2) + '\n');
console.log('icons: favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest');
