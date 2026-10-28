const q = new URLSearchParams(location.search);
const V = q.get('v') || 'blur';
const ANIM = q.get('anim') === '1';
const BIG = q.get('big') === '1';
const ONLY = q.get('only') ? q.get('only').split(',').map(Number) : null; // índices dos painéis que refratam; os outros só desfocam
const ORBS = q.get('orbs') !== '0';
if (!ORBS) document.querySelectorAll('.orb').forEach((o) => o.remove());
const NS = 'http://www.w3.org/2000/svg';
if (ANIM) document.body.classList.add('anim');

// conteúdo detalhado atrás do vidro (para a refração aparecer)
const hues = [210, 280, 340, 20, 150, 190, 250, 310];
const content = document.getElementById('content');
for (let r = 0; r < 8; r++) {
  const row = document.createElement('div'); row.className = 'row';
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div'); c.className = 'card';
    const h = hues[(r + i) % hues.length];
    c.style.setProperty('--a', `hsl(${h} 70% 20%)`); c.style.setProperty('--b', `hsl(${h + 30} 70% 50%)`);
    c.textContent = `Título ${r}-${i}`; c.style.backgroundImage = `repeating-linear-gradient(0deg, rgba(255,255,255,.35) 0 2px, transparent 2px 18px), linear-gradient(155deg, hsl(${h} 70% 20%), hsl(${h + 30} 70% 50%))`; row.appendChild(c);
  }
  content.appendChild(row);
}

const PANELS = [
  { x: 28, y: 28, w: 110, h: 1024, r: 35 },
  { x: 160, y: 28, w: 1718, h: 70, r: 35 },
  { x: 192, y: 272, w: 670, h: 250, r: 35 },
  { x: 1398, y: 944, w: 480, h: 110, r: 55 },
  { x: 126, y: 962, w: 546, h: 98, r: 18 },
  ...(BIG ? [{ x: 1062, y: 28, w: 830, h: 1024, r: 35 }] : []),
];
const P = { blur: Number(q.get('bl') ?? 6), refraction: 38, bezel: 28, dispersion: 0.35, sat: 1.6 };

// ---------- mapa por canvas (versão atual do app) ----------
function canvasMap(w, h, r, bezel) {
  const MAXPX = 180000, scale = Math.min(1, Math.sqrt(MAXPX / (w * h)));
  const c = document.createElement('canvas'); c.width = Math.ceil(w * scale); c.height = Math.ceil(h * scale);
  const ctx = c.getContext('2d'); const img = ctx.createImageData(c.width, c.height); const d = img.data;
  r = Math.min(r, w / 2, h / 2); bezel = Math.min(bezel, Math.min(w, h) * 0.38);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const px = (x + .5) / scale, py = (y + .5) / scale;
    const sx = px < w / 2 ? -1 : 1, sy = py < h / 2 ? -1 : 1;
    const qx = Math.abs(px - w / 2) - (w / 2 - r), qy = Math.abs(py - h / 2) - (h / 2 - r);
    const out = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
    const depth = r - (out + Math.min(Math.max(qx, qy), 0));
    let nx, ny;
    if (qx > 0 && qy > 0) { nx = qx / out * sx; ny = qy / out * sy; } else if (qx > qy) { nx = sx; ny = 0; } else { nx = 0; ny = sy; }
    const t = Math.min(1, Math.max(0, depth / bezel)); const s = depth <= 0 ? 0 : (1 - t) ** 2.4;
    const i = (y * c.width + x) * 4;
    d[i] = 128 - nx * s * 127; d[i + 1] = 128 - ny * s * 127; d[i + 2] = 128; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); return c.toDataURL();
}

// ---------- mapa vetorial (SVG como imagem, sem pixel loop) ----------
// canal R/G = 128 + deslocamento; faixas nas bordas com gradiente + blend screen (sobe) / multiply (desce)
function vectorMap(w, h, r, bezel) {
  bezel = Math.min(bezel, Math.min(w, h) * 0.38);
  const stops = (dir) => [0, .15, .3, .5, .75, 1].map((t) => { const m = (1 - t) ** 2.4; return `<stop offset="${t}" stop-color="${dir(m)}"/>`; }).join('');
  const up = (ch) => (m) => { const v = Math.round(m * 255); return ch === 'r' ? `rgb(${v},0,0)` : `rgb(0,${v},0)`; };       // 0..255 (screen)
  const dn = (ch) => (m) => { const v = Math.round(255 - m * 255); return ch === 'r' ? `rgb(${v},255,255)` : `rgb(255,${v},255)`; }; // multiply
  const mk = (id, x1, y1, x2, y2, st) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st}</linearGradient>`;
  const svg = `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>
    ${mk('l', 0, 0, 1, 0, stops(up('r')))}${mk('rr', 1, 0, 0, 0, stops(dn('r')))}${mk('t', 0, 0, 0, 1, stops(up('g')))}${mk('b', 0, 1, 0, 0, stops(dn('g')))}
  </defs><rect width="${w}" height="${h}" fill="rgb(128,128,128)"/>
  <rect width="${bezel}" height="${h}" fill="url(#l)" style="mix-blend-mode:screen"/>
  <rect x="${w - bezel}" width="${bezel}" height="${h}" fill="url(#rr)" style="mix-blend-mode:multiply"/>
  <rect width="${w}" height="${bezel}" fill="url(#t)" style="mix-blend-mode:screen"/>
  <rect y="${h - bezel}" width="${w}" height="${bezel}" fill="url(#b)" style="mix-blend-mode:multiply"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const ids = [];
let uid = 0;
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; }
const KEEP = { r: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', g: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', b: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' };

// aberração cromática: 3 deslocamentos (atual)
function chroma3(f, scale, spread, mapIn) {
  const ch = (key, k) => { el('feDisplacementMap', { in: 'SourceGraphic', in2: mapIn, scale: scale * k, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + key }, f); el('feColorMatrix', { in: 'd' + key, type: 'matrix', values: KEEP[key], result: key }, f); };
  ch('r', 1 + spread); ch('g', 1); ch('b', 1 - spread);
  el('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }, f); el('feBlend', { in: 'rg', in2: 'b', mode: 'screen' }, f);
}
// aberração em 2 passes: R deslocado mais que G+B (franja vermelho/ciano)
function chroma2(f, scale, spread, mapIn) {
  el('feDisplacementMap', { in: 'SourceGraphic', in2: mapIn, scale: scale * (1 + spread), xChannelSelector: 'R', yChannelSelector: 'G', result: 'dR' }, f);
  el('feColorMatrix', { in: 'dR', type: 'matrix', values: KEEP.r, result: 'r' }, f);
  el('feDisplacementMap', { in: 'SourceGraphic', in2: mapIn, scale: scale * (1 - spread * .5), xChannelSelector: 'R', yChannelSelector: 'G', result: 'dC' }, f);
  el('feColorMatrix', { in: 'dC', type: 'matrix', values: '0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0', result: 'c' }, f);
  el('feBlend', { in: 'r', in2: 'c', mode: 'screen' }, f);
}
// aberração barata: 1 deslocamento + canais R e B deslocados por feOffset (sem 2 deslocamentos extras)
function chromaOffset(f, spreadPx, srcIn) {
  el('feColorMatrix', { in: srcIn, type: 'matrix', values: KEEP.r, result: 'r' }, f);
  el('feColorMatrix', { in: srcIn, type: 'matrix', values: KEEP.g, result: 'g' }, f);
  el('feColorMatrix', { in: srcIn, type: 'matrix', values: KEEP.b, result: 'b' }, f);
  el('feOffset', { in: 'r', dx: spreadPx, dy: 0, result: 'ro' }, f); el('feOffset', { in: 'b', dx: -spreadPx, dy: 0, result: 'bo' }, f);
  el('feBlend', { in: 'ro', in2: 'g', mode: 'screen', result: 'rg' }, f); el('feBlend', { in: 'rg', in2: 'bo', mode: 'screen' }, f);
}
// mapa por primitivas: flood -> blur (rampa de alfa nas bordas) -> gradiente (Sobel) em R e G
function primitiveMap(f, sigma, gain) {
  el('feFlood', { 'flood-color': '#fff', result: 'shape' }, f);
  el('feGaussianBlur', { in: 'shape', stdDeviation: sigma, result: 'ramp' }, f);
  el('feColorMatrix', { in: 'ramp', type: 'matrix', values: '0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1', result: 'gray' }, f);
  const k = (m) => el('feConvolveMatrix', { in: 'gray', order: '3', kernelMatrix: m, divisor: gain, bias: '0.5', preserveAlpha: 'true', edgeMode: 'duplicate', result: 'c' }, f);
  el('feConvolveMatrix', { in: 'gray', order: '3', kernelMatrix: '-1 0 1 -2 0 2 -1 0 1', divisor: gain, bias: '0.5', preserveAlpha: 'true', edgeMode: 'duplicate', result: 'gx' }, f);
  el('feConvolveMatrix', { in: 'gray', order: '3', kernelMatrix: '-1 -2 -1 0 0 0 1 2 1', divisor: gain, bias: '0.5', preserveAlpha: 'true', edgeMode: 'duplicate', result: 'gy' }, f);
  el('feColorMatrix', { in: 'gx', type: 'matrix', values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1', result: 'mx' }, f);
  el('feColorMatrix', { in: 'gy', type: 'matrix', values: '0 0 0 0 0  1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 1', result: 'my' }, f);
  el('feComposite', { in: 'mx', in2: 'my', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'map' }, f);
}

function makeFilter(svg, panel, variant) {
  const id = 'f' + uid++; const f = el('filter', { id, 'color-interpolation-filters': 'sRGB' }, svg);
  const { w, h, r } = panel; f.setAttribute('x', 0); f.setAttribute('y', 0);
  if (variant.startsWith('prim')) {
    f.setAttribute('filterUnits', 'objectBoundingBox'); f.setAttribute('width', 1); f.setAttribute('height', 1);
  } else { f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('width', w); f.setAttribute('height', h); }
  const scale = P.refraction;
  const withMap = (url) => el('feImage', { href: url, x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'none', result: 'map' }, f);
  if (variant === 'canvas3') { withMap(canvasMap(w, h, r, P.bezel)); chroma3(f, scale, P.dispersion * .3, 'map'); }
  else if (variant === 'canvas1') { withMap(canvasMap(w, h, r, P.bezel)); el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale, xChannelSelector: 'R', yChannelSelector: 'G' }, f); }
  else if (variant === 'vector1') { withMap(vectorMap(w, h, r, P.bezel)); el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale, xChannelSelector: 'R', yChannelSelector: 'G' }, f); }
  else if (variant === 'vector3') { withMap(vectorMap(w, h, r, P.bezel)); chroma3(f, scale, P.dispersion * .3, 'map'); }
  else if (variant === 'vector2') { withMap(vectorMap(w, h, r, P.bezel)); chroma2(f, scale, P.dispersion * .3, 'map'); }
  else if (variant === 'vectorOff') { withMap(vectorMap(w, h, r, P.bezel)); el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale, xChannelSelector: 'R', yChannelSelector: 'G', result: 'disp' }, f); chromaOffset(f, 2.5, 'disp'); }
  else if (variant === 'prim1') { primitiveMap(f, P.bezel * .6, 0.45); el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: scale * 2, xChannelSelector: 'R', yChannelSelector: 'G' }, f); }
  else if (variant === 'prim3') { primitiveMap(f, P.bezel * .6, 0.45); chroma3(f, scale * 2, P.dispersion * .3, 'map'); }
  return id;
}

const host = document.getElementById('panels');
const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'defs'); document.body.appendChild(svg);
PANELS.forEach((p, idx) => {
  const d = document.createElement('div'); d.className = 'panel';
  Object.assign(d.style, { left: p.x + 'px', top: p.y + 'px', width: p.w + 'px', height: p.h + 'px', borderRadius: p.r + 'px' });
  d.innerHTML = `<span>${V}</span>`;
  const base = `blur(${P.blur}px) saturate(${P.sat})`;
  let bf = 'none';
  if (V === 'blur') bf = base;
  else if (V !== 'none' && (!ONLY || ONLY.includes(idx))) { const id = makeFilter(svg, p, V); bf = `blur(${P.blur}px) url(#${id}) saturate(${P.sat})`; }
  else if (V !== 'none') bf = base;
  d.style.backdropFilter = bf; d.style.webkitBackdropFilter = bf;
  host.appendChild(d);
});
window.__ready = true;
