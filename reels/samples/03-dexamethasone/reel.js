/*
 * 03 · How dexamethasone turns down inflammation (genomic mechanism)
 * Style: classic medical-atlas plate — cream laid paper, sepia pen line, watercolour washes,
 * numbered leader labels, a circular "enlarged detail" inset. One 2D canvas, deterministic render(t).
 */
(() => {
'use strict';
const { canvas, ctx } = Kit.createCanvas();
const { clamp, lerp, seg, env, ease, rng, hash, noise1, noise2, W, H } = Kit;
const TAU = Math.PI * 2, D2R = Math.PI / 180;
const DUR = 29.5;

// ------------------------------------------------------------------ palette
const COL = {
  ink: '#2E2118', sepia: '#6B4F3A', faded: '#9A8A76', cream: '#F7EFDD',
  verm: '#B5452C', vermD: '#8E2F1C', indigo: '#4F6A8F', indigoD: '#2F4566',
  ochre: '#C99A3F', violet: '#8E7BA0', violetD: '#5A4670',
  rose: '#E09A86', calm: '#E2D5AE', mem: '#DFAE8C',
  verd: '#4E8B6E', verdD: '#2C6449', madder: '#A2475A', madderD: '#7A2A3C', plum: '#7D4E78', plumD: '#5A2F57',
  mito: '#D49A58', golgi: '#C98A6C', brass: '#C8A15A',
};
const rgba = (c, a) => Kit.rgba(c, a);
const SERIF = '"EB Garamond", "Libre Baskerville", serif';
const font = (size, weight = 400, italic = false) => `${italic ? 'italic ' : ''}${weight} ${size}px ${SERIF}`;
const HAS_LS = 'letterSpacing' in ctx;

// ------------------------------------------------------------------ world layout (screen px at zoom 1)
const C = { x: 600, y: 960, rx: 405, ry: 345 };     // cell
const N = { x: 705, y: 1000, rx: 205, ry: 175 };    // nucleus
const KF = 2.05, IC = { x: 532, y: 942 }, IR = 412; // inset: final zoom, centre, radius
const uv = (u, v) => [N.x + u / KF, N.y + v / KF];  // nucleus-detail coords (final inset px) -> world
const NUCL_U = 322, NUCL_V = -4;                    // nucleolus centre (inset px), clear of the gene diagram

// ------------------------------------------------------------------ geometry helpers
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
function blob(cx, cy, rx, ry, seed, wob = 0.03, n = 180, freq = 2) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const m = 1 + wob * (noise1(Math.cos(a) * freq + 10, seed) + 0.6 * noise1(Math.sin(a) * freq * 1.7 + 20, seed + 1));
    pts.push([cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m]);
  }
  return pts;
}
function jitter(pts, amp, seed, sc) {
  return pts.map(([x, y]) => [x + amp * noise2(x * sc, y * sc, seed), y + amp * noise2(x * sc + 31.7, y * sc + 17.3, seed + 3)]);
}
function bbox(pts) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
function normals(pts) { // inward unit normals of a closed polygon
  const n = pts.length; let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    let nx = -ty, ny = tx; if (nx * (cx - p[0]) + ny * (cy - p[1]) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  });
}
function offset(pts, d) { const nn = normals(pts); return pts.map((p, i) => [p[0] + nn[i][0] * d, p[1] + nn[i][1] * d]); }
/** attach watercolour jitter layers + ink variant + bbox to a polygon */
function shape(pts, seed, amp = 3, sc = 0.035) {
  pts.L = [0, 1, 2].map((i) => jitter(pts, amp, seed * 13 + i * 7, sc));
  pts.I = jitter(pts, amp * 0.3, seed * 13 + 99, sc * 1.6);
  pts.bb = bbox(pts);
  return pts;
}
function capsule(cx, cy, len, wid, ang, n = 18) {
  const pts = [], r = wid / 2, hl = len / 2 - r;
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI * i) / n; pts.push([hl + Math.cos(a) * r, Math.sin(a) * r]); }
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (Math.PI * i) / n; pts.push([-hl + Math.cos(a) * r, Math.sin(a) * r]); }
  const c = Math.cos(ang), s = Math.sin(ang);
  return pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}

// ------------------------------------------------------------------ drawing primitives
let LW = 1;                 // line-width compensation for the current transform (screen-constant ink)
let grainPat = null, paper = null;
function path(pts, closed = true, prog = 1) {
  ctx.beginPath();
  const n = pts.length, m = closed ? n : n - 1;
  const s = m * clamp(prog), k = Math.floor(s);
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= k; i++) { const p = pts[i % n]; ctx.lineTo(p[0], p[1]); }
  const f = s - k;
  if (f > 0 && k < m) { const a = pts[k % n], b = pts[(k + 1) % n]; ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); }
  if (closed && prog >= 1) ctx.closePath();
}
function addPoly(pts, dx = 0, dy = 0) { ctx.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + dx, pts[i][1] + dy); ctx.closePath(); }
/** watercolour wash: layered jittered fills, pale bloom, darker pooled edge, pigment granulation */
function wash(pts, col, a = 1, o = {}) {
  if (a <= 0.003) return;
  const L = pts.L || [pts, pts, pts];
  const c = typeof col === 'string' ? Kit.hex(col) : col;
  ctx.save();
  ctx.fillStyle = rgba(c, (o.fa ?? 0.3) * a);
  for (const l of L) { path(l); ctx.fill(); }
  const bb = pts.bb || bbox(pts);
  if (o.bloom !== false) {
    const cx = lerp(bb[0], bb[2], 0.4), cy = lerp(bb[1], bb[3], 0.36), r = Math.max(bb[2] - bb[0], bb[3] - bb[1]) * 0.55;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(252,247,233,${0.34 * a})`); g.addColorStop(1, 'rgba(252,247,233,0)');
    ctx.fillStyle = g; path(L[0]); ctx.fill();
  }
  const dk = Kit.mix(c, [70, 45, 30], 0.35);
  ctx.strokeStyle = rgba(dk, (o.ea ?? 0.22) * a); ctx.lineWidth = (o.edge ?? 3.2) * LW; ctx.lineJoin = 'round';
  path(L[1]); ctx.stroke();
  if (o.gran !== false && grainPat) {
    path(pts); ctx.clip();
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = (o.ga ?? 0.5) * a;
    ctx.fillStyle = grainPat; ctx.fillRect(bb[0] - 4, bb[1] - 4, bb[2] - bb[0] + 8, bb[3] - bb[1] + 8);
  }
  ctx.restore();
}
function ink(pts, w = 2, o = {}) {
  if ((o.a ?? 1) <= 0.003 || (o.prog ?? 1) <= 0) return;
  const P = o.raw ? pts : (pts.I || pts);
  ctx.save();
  ctx.strokeStyle = rgba(o.col || COL.ink, (o.a ?? 1) * 0.92);
  ctx.lineWidth = w * LW; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  path(P, o.closed !== false, o.prog ?? 1); ctx.stroke();
  ctx.restore();
}
/** engraved hatching in the shadow crescent (shape minus a copy shifted toward the light) */
function hatch(pts, o) {
  if (o.a <= 0.003) return;
  ctx.save();
  path(pts); ctx.clip();
  ctx.beginPath(); addPoly(pts); addPoly(pts, o.dx, o.dy); ctx.clip('evenodd');
  const bb = pts.bb, cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, R = Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) / 2 + 10;
  ctx.translate(cx, cy); ctx.rotate(o.ang);
  ctx.strokeStyle = rgba(o.col || COL.sepia, o.a); ctx.lineWidth = (o.w || 1) * LW;
  ctx.beginPath();
  for (let y = -R; y <= R; y += o.sp) { ctx.moveTo(-R, y + Math.sin(y * 0.37) * 0.6); ctx.lineTo(R, y - Math.sin(y * 0.29) * 0.6); }
  ctx.stroke();
  ctx.restore();
}
function withXf(x, y, rot, s, fn) {
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (s !== 1) ctx.scale(s, s);
  const old = LW; LW = old / Math.abs(s); fn(); LW = old; ctx.restore();
}
function lsSet(px) { if (HAS_LS) ctx.letterSpacing = px + 'px'; }
function text(str, x, y, o = {}) {
  if ((o.alpha ?? 1) <= 0.003) return 0;
  ctx.save();
  ctx.font = font(o.size || 36, o.weight || 400, o.italic);
  ctx.fillStyle = typeof o.color === 'string' ? o.color : rgba(o.color || COL.ink, 1);
  ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'alphabetic';
  if (o.ls) lsSet(o.ls);
  ctx.fillText(str, x, y);
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}
function measure(str, size, weight = 400, italic = false, ls = 0) {
  ctx.save(); ctx.font = font(size, weight, italic); if (ls) lsSet(ls); const w = ctx.measureText(str).width; ctx.restore(); return w;
}
/** text with a subscript run, e.g. sub('PLA','2') */
function textSub(main, subs, x, y, o = {}) {
  const size = o.size || 36;
  const w1 = measure(main, size, o.weight, o.italic), w2 = measure(subs, size * 0.62, o.weight, o.italic);
  let x0 = x; if (o.align === 'center') x0 = x - (w1 + w2) / 2; else if (o.align === 'right') x0 = x - (w1 + w2);
  text(main, x0, y, { ...o, align: 'left' });
  text(subs, x0 + w1 + 1, y + size * 0.18, { ...o, size: size * 0.62, align: 'left' });
}
function ornament(x, y, s, a, col = COL.sepia) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x, y - s * 0.6); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s * 0.6); ctx.closePath(); ctx.fill();
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * s * 1.7, y, s * 0.22, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ static assets (built in setup)
const S = {};   // static shapes
function pnoise(x, y, P, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const h = (a, b) => hash(((a % P) + P) % P, ((b % P) + P) % P, seed);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}
function makeGrain() {
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
  const im = g.createImageData(n, n), d = im.data;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v1 = pnoise(x / 8, y / 8, 32, 3), v2 = pnoise(x / 4, y / 4, 64, 4), v3 = pnoise(x / 2, y / 2, 128, 9);
    let v = 255 - 60 * Math.max(0, v1 - 0.5) - 22 * v2 - 14 * v3 - (hash(x, y, 5) > 0.95 ? 36 * hash(x, y, 6) : 0);
    const p = (y * n + x) * 4; d[p] = v; d[p + 1] = v * 0.985; d[p + 2] = v * 0.96; d[p + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return ctx.createPattern(c, 'repeat');
}
function makePaper() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const sw = 135, sh = 240, s = document.createElement('canvas'); s.width = sw; s.height = sh; const sg = s.getContext('2d');
  const id = sg.createImageData(sw, sh);
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    const X = x * 8, Y = y * 8;
    const dx = (X - W / 2) / (W * 0.66), dy = (Y - H * 0.5) / (H * 0.6);
    const vig = clamp(Math.pow(dx * dx + dy * dy, 1.5));
    const n = noise2(X / 300, Y / 300, 11) * 0.6 + noise2(X / 95, Y / 95, 12) * 0.4;
    const col = Kit.mix('#F5ECD8', '#DFC79C', clamp(vig * 0.85 + n * 0.09 + 0.06));
    const p = (y * sw + x) * 4; id.data[p] = col[0]; id.data[p + 1] = col[1]; id.data[p + 2] = col[2]; id.data[p + 3] = 255;
  }
  sg.putImageData(id, 0, 0);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(s, 0, 0, W, H);
  const im = g.getImageData(0, 0, W, H), d = im.data;
  for (let i = 0, p = 0; i < W * H; i++, p += 4) { const r = (hash(i, 77) - 0.5) * 9; d[p] += r; d[p + 1] += r; d[p + 2] += r * 0.9; }
  g.putImageData(im, 0, 0);
  // laid-paper chain lines (very faint)
  g.strokeStyle = 'rgba(120,95,60,0.025)'; g.lineWidth = 2;
  for (let x = 40; x < W; x += 92) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 3, H); g.stroke(); }
  // fibres
  const R = rng(5); g.lineCap = 'round';
  for (let i = 0; i < 900; i++) {
    const x = R() * W, y = R() * H, L = 8 + R() * 34, a = R() * TAU, bend = (R() - 0.5) * 12;
    g.strokeStyle = `rgba(${110 + R() * 40},${85 + R() * 30},${55 + R() * 25},${0.03 + R() * 0.05})`; g.lineWidth = 0.6 + R() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L / 2 - Math.sin(a) * bend, y + Math.sin(a) * L / 2 + Math.cos(a) * bend, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
  }
  // foxing spots, mostly toward the edges
  for (let i = 0; i < 22; i++) {
    let x = R() * W, y = R() * H; if (R() < 0.7) { if (R() < 0.5) x = R() < 0.5 ? R() * 140 : W - R() * 140; else y = R() < 0.5 ? R() * 220 : H - R() * 260; }
    const r = 4 + R() * 26, gr = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + R() * 0.09; gr.addColorStop(0, `rgba(150,100,50,${a})`); gr.addColorStop(0.6, `rgba(160,110,60,${a * 0.5})`); gr.addColorStop(1, 'rgba(160,110,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // intaglio plate mark
  g.fillStyle = 'rgba(120,90,55,0.035)'; g.fillRect(30, 30, W - 60, H - 60);
  g.strokeStyle = 'rgba(110,80,50,0.22)'; g.lineWidth = 2; g.strokeRect(30, 30, W - 60, H - 60);
  g.strokeStyle = 'rgba(255,250,238,0.4)'; g.lineWidth = 1.5; g.strokeRect(33, 33, W - 66, H - 66);
  return c;
}

function buildStatic() {
  // ---- cell membrane (bilayer)
  S.memOut = shape(blob(C.x, C.y, C.rx, C.ry, 1, 0.022, 300, 1.5), 1, 2);
  S.memN = normals(S.memOut);
  S.memIn = shape(offset(S.memOut, 15), 2, 2);
  S.cyto = shape(offset(S.memOut, 16), 3, 5, 0.02);
  S.band = S.memOut; // band fill uses memOut + memIn (evenodd)
  // phospholipid heads sampled along the outer contour
  S.heads = [];
  { const P = S.memOut, n = P.length; let acc = 0;
    for (let i = 0; i < n; i++) {
      const a = P[i], b = P[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      let d = acc; while (d < L) { const f = d / L; const nn = S.memN[i];
        S.heads.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, nn[0], nn[1]]); d += 8.4; }
      acc = d - L;
    } }
  // ---- nucleus
  S.nucOut = shape(blob(N.x, N.y, N.rx, N.ry, 3, 0.02, 220, 1.4), 4, 1.6);
  S.nucIn = shape(offset(S.nucOut, 7), 5, 1.6);
  S.nucFill = shape(offset(S.nucOut, 3), 6, 3, 0.03);
  S.nucN = normals(S.nucOut);
  S.pores = [20, 55, 95, 128, 155, 185, 215, 250, 285, 318, 350].map((deg) => {
    const i = Math.round((deg / 360) * S.nucOut.length) % S.nucOut.length;
    return { p: S.nucOut[i], n: S.nucN[i], deg };
  });
  { const R = rng(21); S.chrom = [];
    for (let k = 0; k < 1500 && S.chrom.length < 620; k++) {
      const a = R() * TAU, r = Math.sqrt(R());
      const x = N.x + Math.cos(a) * r * (N.rx - 12), y = N.y + Math.sin(a) * r * (N.ry - 12);
      const nucl = Math.hypot(x - (N.x + NUCL_U / KF), y - (N.y + NUCL_V / KF)) < 30;
      const keep = r > 0.8 ? 0.92 : r > 0.55 ? 0.4 : 0.22;
      if (!nucl && R() < keep) S.chrom.push([x, y, 0.9 + R() * 1.1 + (r > 0.85 ? 0.5 : 0)]);
    } }
  { const [nx, ny] = uv(NUCL_U, NUCL_V); S.nucleolus = shape(blob(nx, ny, 25, 21, 7, 0.09, 60, 2), 7, 1.5, 0.15);
    const R = rng(33); S.nucDots = [];
    for (let k = 0; k < 110; k++) { const a = R() * TAU, r = Math.sqrt(R()) * 20; S.nucDots.push([nx + Math.cos(a) * r * 1.15, ny + Math.sin(a) * r * 0.95, 0.8 + R() * 1.1]); } }
  // ---- organelles
  S.mito = [[650, 690, 74, 26, -0.18, 11], [952, 935, 70, 24, 1.42, 12], [478, 1218, 70, 25, 0.38, 13], [292, 1080, 58, 22, -0.95, 14]].map(([x, y, l, w, a, sd]) => {
    const out = shape(capsule(x, y, l, w, a), sd, 1.6, 0.06);
    const cr = []; const hl = l / 2 - w * 0.35, c = Math.cos(a), s = Math.sin(a);
    for (let i = 0; i <= 9; i++) { const u = -hl + (2 * hl * i) / 9, v = (i % 2 ? 1 : -1) * w * 0.28; cr.push([x + u * c - v * s, y + u * s + v * c]); }
    return { out, cr };
  });
  S.er = [20, 33, 46].map((off, j) => {
    const pts = [];
    for (let k = 0; k <= 60; k++) { const a = (247 + (88 * k) / 60) * D2R; const o = off + 2.4 * Math.sin(k * 0.9 + j);
      pts.push([N.x + Math.cos(a) * (N.rx + o), N.y + Math.sin(a) * (N.ry + o)]); }
    return pts;
  });
  S.ribo = [];
  for (const pl of S.er) for (let k = 1; k < pl.length; k += 2) { const p = pl[k]; const dx = p[0] - N.x, dy = p[1] - N.y, L = Math.hypot(dx, dy); S.ribo.push([p[0] + (dx / L) * 4, p[1] + (dy / L) * 4]); }
  // golgi stack
  S.golgi = [0, 1, 2, 3].map((i) => {
    const gx = 905, gy = 1290, R = 108 + i * 10, a0 = 228 * D2R, a1 = 262 * D2R, pts = [], th = 6;
    for (let k = 0; k <= 24; k++) { const a = lerp(a0, a1, k / 24), tp = Math.sin((Math.PI * k) / 24) ** 0.6; pts.push([gx + Math.cos(a) * (R + th * tp / 2), gy + Math.sin(a) * (R + th * tp / 2)]); }
    for (let k = 24; k >= 0; k--) { const a = lerp(a0, a1, k / 24), tp = Math.sin((Math.PI * k) / 24) ** 0.6; pts.push([gx + Math.cos(a) * (R - th * tp / 2), gy + Math.sin(a) * (R - th * tp / 2)]); }
    return shape(pts, 40 + i, 0.8, 0.08);
  });
  S.vesicles = [[470, 760, 7], [705, 772, 6], [915, 1050, 6], [585, 1208, 6], [348, 1128, 5], [880, 1105, 5], [400, 1255, 5], [820, 690, 6], [930, 1188, 4.5], [255, 990, 4.5]]
    .map(([x, y, r], i) => shape(blob(x, y, r, r, 50 + i, 0.08, 24, 2), 50 + i, 0.6, 0.2));
  { const R = rng(71); S.speck = [];
    for (let k = 0; k < 900 && S.speck.length < 300; k++) {
      const a = R() * TAU, r = Math.sqrt(R()) * 0.93, x = C.x + Math.cos(a) * r * C.rx, y = C.y + Math.sin(a) * r * C.ry;
      if (((x - N.x) / (N.rx + 50)) ** 2 + ((y - N.y) / (N.ry + 50)) ** 2 < 1) continue;
      S.speck.push([x, y, 0.7 + R() * 0.9]);
    } }
  // watercolour back-run shapes
  S.blooms = [[330, 760, 70, 55, 0], [455, 1240, 85, 40, 0], [880, 1150, 60, 70, 0], [560, 690, 95, 42, 0], [250, 1000, 40, 90, 0], [640, 930, 70, 60, 1], [760, 1100, 80, 45, 1]]
    .map(([x, y, rx, ry, nuc], i) => ({ p: shape(blob(x, y, rx, ry, 120 + i, 0.16, 70, 2.6), 120 + i, 2.5, 0.05), nuc }));
  { const R = rng(97); S.prot = [];
    for (let k = 0; k < 400 && S.prot.length < 26; k++) { const a = R() * TAU, r = 0.25 + 0.7 * Math.sqrt(R()); const x = N.x - 40 + Math.cos(a) * r * 330, y = N.y - 20 + Math.sin(a) * r * 300;
      if (((x - C.x) / (C.rx - 40)) ** 2 + ((y - C.y) / (C.ry - 40)) ** 2 > 1) continue; if (((x - N.x) / (N.rx + 22)) ** 2 + ((y - N.y) / (N.ry + 22)) ** 2 < 1) continue;
      S.prot.push([x, y, R()]); } }
  // ---- glyphs (local coordinates)
  S.gr = (() => { const pts = [], n = 80;
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; let r = 20 * (1 + 0.1 * Math.cos(2 * a) + 0.05 * noise1(Math.cos(a) * 2 + 3, 61));
      const d = angDiff(a, -Math.PI / 2); r *= 1 - 0.36 * Math.exp(-(d * d) / (2 * 0.26 * 0.26)); pts.push([Math.cos(a) * r * 1.15, Math.sin(a) * r]); }
    return shape(pts, 61, 1.1, 0.13); })();
  S.hsp = (() => { // one banana-shaped HSP90 protomer, from (0,0) curving down
    const L = 36, w = 10, cl = [];
    for (let i = 0; i <= 16; i++) { const s = i / 16; cl.push([-9 * Math.sin(Math.PI * s) , s * L]); }
    const nn = cl.map((p, i) => { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(16, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const Ln = Math.hypot(tx, ty); return [-ty / Ln, tx / Ln]; });
    const left = cl.map((p, i) => { const tw = (w / 2) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, i / 16 * 1.1 + 0.05))); return [p[0] + nn[i][0] * tw, p[1] + nn[i][1] * tw]; });
    const right = cl.map((p, i) => { const tw = (w / 2) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, i / 16 * 1.1 + 0.05))); return [p[0] - nn[i][0] * tw, p[1] - nn[i][1] * tw]; }).reverse();
    return shape(left.concat(right), 62, 0.8, 0.15); })();
  S.dex = (() => {
    const a = 6.4, s3 = Math.sqrt(3);
    const hex = (cx, cy) => [0, 1, 2, 3, 4, 5].map((k) => [cx + a * Math.cos((30 + 60 * k) * D2R), cy + a * Math.sin((30 + 60 * k) * D2R)]);
    const B = [a * s3, 0], Cc = [a * s3 * 1.5, -1.5 * a], ex = Cc[0] + (a * s3) / 2, Dc = [ex + 0.688 * a, Cc[1]], R5 = 0.851 * a;
    const pent = [144, 216, 288, 0, 72].map((d) => [Dc[0] + R5 * Math.cos(d * D2R), Dc[1] + R5 * Math.sin(d * D2R)]);
    // Dexamethasone = 9-fluoro-11β,17,21-trihydroxy-16α-methylpregna-1,4-diene-3,20-dione (PubChem CID 5743),
    // drawn as a skeletal formula: rings A/B/C/D, Δ1 and Δ4 double bonds, 3-oxo, 10- and 13-methyls, 9α-F, 11β-OH,
    // 16α-CH3, 17α-OH and the C17 side chain C20(=O)–C21H2–OH. Oxygens are dark dots, fluorine a green dot.
    const cx = 2.15 * a, cy = -1.25 * a, sh = (p) => [p[0] - cx, p[1] - cy];
    const rings = [hex(0, 0), hex(B[0], B[1]), hex(Cc[0], Cc[1]), pent].map((r) => shape(r.map(sh), 70, 0.4, 0.3));
    const A = (x, y) => sh([x * a, y * a]);                       // ring-A-centred coords in units of a
    const add = (p, dx, dy, L) => [p[0] + dx * L * a, p[1] + dy * L * a];
    const C1 = A(0, -1), C2 = A(-0.866, -0.5), C3 = A(-0.866, 0.5), C4 = A(0, 1), C5 = A(0.866, 0.5), C10 = A(0.866, -0.5);
    const C9 = A(1.732, -1), C11 = A(1.732, -2), C13 = A(3.464, -2), C17 = sh(pent[2]), C16 = sh(pent[3]);
    const inner = (p, q, ctr) => { // inner line of a ring double bond, pulled toward the ring centre
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], dx = ctr[0] - m[0], dy = ctr[1] - m[1], L = Math.hypot(dx, dy) || 1, o = 0.24 * a;
      const ox = (dx / L) * o, oy = (dy / L) * o;
      return [lerp(p[0], q[0], 0.2) + ox, lerp(p[1], q[1], 0.2) + oy, lerp(p[0], q[0], 0.8) + ox, lerp(p[1], q[1], 0.8) + oy];
    };
    const ctrA = A(0, 0);
    const dbl = [inner(C1, C2, ctrA), inner(C4, C5, ctrA)];                 // Δ1 and Δ4
    const O3 = add(C3, -0.866, 0.5, 0.85);                                  // 3-oxo (C=O)
    const C20 = add(C17, 0, -1, 0.9), O20 = add(C20, -0.866, -0.5, 0.8);    // 20-oxo
    const C21 = add(C20, 0.866, -0.5, 0.9), O21 = add(C21, 0.866, 0.5, 0.8); // 21-OH
    const O17 = add(C17, 0.951, -0.309, 0.8), O11 = add(C11, -0.866, -0.5, 0.8), F9 = add(C9, 0, 1, 0.62);
    const single = [[C10, add(C10, 0, -1, 0.8)], [C13, add(C13, 0, -1, 0.8)], [C16, add(C16, 1, 0, 0.8)], // CH3 groups
      [C17, C20], [C20, C21], [C21, O21], [C17, O17], [C11, O11], [C9, F9]];
    const double = [[C3, O3], [C20, O20]];
    return { rings, dbl, single, double, O: [O3, O20, O21, O17, O11], F: [F9], a };
  })();
  S.cyto2 = (() => { const pts = blob(0, 0, 7, 6.2, 80, 0.12, 26, 2); return shape(pts, 80, 0.7, 0.3); })();
  S.nfk = [blob(-9.5, 0, 10.5, 9.5, 90, 0.08, 34, 2), blob(9.5, 0.5, 9.5, 9, 91, 0.08, 34, 2)].map((p, i) => shape(p, 90 + i, 0.6, 0.2));
  S.ap1 = [blob(-8.5, 0, 9, 9.2, 93, 0.08, 34, 2), blob(8.5, 0, 9, 8.6, 94, 0.08, 34, 2)].map((p, i) => shape(p, 93 + i, 0.6, 0.2));
  S.pinkA = shape(blob(0, 0, 1, 1, 1, 0, 40), 1, 0); // unit circle helper (unused fill)
}

// ------------------------------------------------------------------ timeline
const STEPS = [
  { n: '1', a: 2.0, b: 5.2, title: 'Slips through the membrane', sub: 'lipophilic steroid' },
  { n: '2', a: 5.2, b: 9.4, title: 'Binds and activates GR', sub: 'glucocorticoid receptor + HSP90 chaperone' },
  { n: '3', a: 9.4, b: 12.3, title: 'Enters the nucleus', sub: 'drug–receptor complex' },
  { n: '4', a: 12.3, b: 15.8, title: 'Anti-inflammatory genes turned up', sub: 'transactivation via GREs' },
  { n: '5', a: 15.8, b: 19.3, title: 'Inflammatory genes turned down', sub: 'transrepression: NF-κB, AP-1' },
  { n: '*', a: 19.3, b: 22.8, title: 'Mediator output falls', sub: 'over hours, not minutes' },
  { n: 'P', a: 22.8, b: DUR + 1, title: 'Acts upstream of NSAIDs', sub: 'a gene-level brake on inflammation' },
];
const DEXS = [
  { s: [96, 612], th: 214, t0: 2.05, tc: 3.2, tx: 3.8, ta: 5.6, rot0: 0.3, seed: 1 },
  { s: [70, 880], th: 182, t0: 2.4, tc: 3.6, tx: 4.2, ta: 6.1, rot0: -0.5, seed: 2 },
  { s: [100, 1250], th: 150, t0: 2.8, tc: 4.0, tx: 4.6, ta: 6.6, rot0: 1.1, seed: 3 },
];
// GR–HSP90 complexes. HSP90 stays bound and escorts GR to the pore; it is released at the pore (tB[0] + REL).
const V_UP = -128, V_DN = 118;
const GRS = [
  { p: [404, 838], rot0: -0.12, pore: 215, dock: [-215, V_UP - 43], mirror: false, tA: [9.45, 11.3], tB: [11.3, 12.1], tC: [12.1, 13.1] },
  { p: [338, 1002], rot0: 0.18, pore: 185, dock: [-133, V_UP - 43], mirror: true, tA: [9.65, 11.5], tB: [11.5, 12.3], tC: [12.3, 13.3] },
  { p: [432, 1160], rot0: 0.08, pore: 185, dock: [-234, 28], mirror: false, tA: [9.85, 12.5], tB: [14.9, 15.4], tC: [15.4, 15.95], outD: 80 },
];
const REL = 0.32;
const GENES_ON = [{ u: 30, name: 'annexin A1', t: 13.35 }, { u: 210, name: 'MKP-1', t: 13.65 }];
const GENES_OFF = [{ u: -54, name: 'COX-2', t: 16.35, mkp: true }, { u: 68, name: 'IL-1β', t: 16.55, mkp: true }, { u: 188, name: 'TNF-α', t: 16.75, mkp: true }, { u: 302, name: 'IL-6', t: 16.95 }];
const TF_NF = -289, TF_AP = -178;            // NF-κB and AP-1 positions on the lower strand
const LAB_DY = 80;                            // gene-name baseline below its strand
const SW_SC = 2.0;                            // gene-switch scale in the finished inset
const GS0 = 1.32, DEX0 = 1.6, DEXB = 0.6;     // actor scales (cytoplasm GR, free dex, bound dex relative to GR)
const T_TETH = [15.9, 16.3];

const insetZ = (t) => seg(t, 11.4, 12.7, ease.inOut) * (1 - seg(t, 19.3, 20.5, ease.inOut));
const calmU = (t) => seg(t, 20.1, 22.1, ease.inOut);
const ghostU = (t) => seg(t, 22.6, 23.2, ease.inOut);

// membrane / pore helpers
function memIdx(deg) { const n = S.memOut.length; return ((Math.round((deg / 360) * n) % n) + n) % n; }
function memPt(deg, d) { const i = memIdx(deg), p = S.memOut[i], nn = S.memN[i]; return [p[0] + nn[0] * d, p[1] + nn[1] * d]; }
function porePts(deg, outD = 30) {
  const pr = S.pores.find((q) => q.deg === deg); const p = pr.p, nn = pr.n;
  return { out: [p[0] - nn[0] * outD, p[1] - nn[1] * outD], at: p, inn: [p[0] + nn[0] * 30, p[1] + nn[1] * 30] };
}
const bez = (p0, p1, p2, u) => [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
const mid = (a, b, k = 0) => { const dx = b[0] - a[0], dy = b[1] - a[1]; return [(a[0] + b[0]) / 2 - dy * k, (a[1] + b[1]) / 2 + dx * k]; };

function grState(i, t) {
  const g = GRS[i], d = DEXS[i];
  let x = g.p[0], y = g.p[1], rot = g.rot0;
  const wob = (s) => [3 * noise1(t * 0.7, 300 + i * 7 + s), 3 * noise1(t * 0.7, 340 + i * 7 + s)];
  const P = porePts(g.pore, g.outD), dockW = uv(...g.dock);
  if (t < g.tA[0]) { const w = wob(0); x += w[0]; y += w[1]; rot += 0.06 * noise1(t * 0.5, 400 + i); }
  else if (t < g.tA[1]) {
    const u = seg(t, g.tA[0], g.tA[1], ease.inOut); const p = bez(g.p, mid(g.p, P.out, 0.18), P.out, u);
    const w = wob(0), damp = 1 - u; x = p[0] + w[0] * damp; y = p[1] + w[1] * damp; rot = lerp(g.rot0, 0, u) + 0.08 * Math.sin(u * Math.PI * 2);
  } else if (t < g.tB[1]) {
    const u = seg(t, g.tB[0], g.tB[1], ease.inOut); x = lerp(P.out[0], P.inn[0], u); y = lerp(P.out[1], P.inn[1], u); rot = 0;
  } else if (t < g.tC[0]) {
    const w = wob(9); x = P.inn[0] + w[0] * 0.7; y = P.inn[1] + w[1] * 0.7; rot = 0.05 * noise1(t * 0.6, 500 + i);
  } else {
    const u = seg(t, g.tC[0], g.tC[1], ease.inOut); const p = bez(P.inn, mid(P.inn, dockW, -0.12), dockW, u);
    x = p[0]; y = p[1]; rot = 0.1 * Math.sin(u * Math.PI) * (1 - u);
  }
  const act = seg(t, d.ta, d.ta + 0.5, ease.out);
  const s = lerp(GS0, 1, seg(t, g.tB[0], g.tB[1], ease.inOut));
  return { x, y, rot, act, s, bound: t >= d.ta, mirror: g.mirror };
}
function dexState(i, t) {
  const d = DEXS[i], g = GRS[i];
  const pocket = () => { const gs = grState(i, t); const c = Math.cos(gs.rot), s = Math.sin(gs.rot); return [gs.x + 13 * gs.s * s, gs.y - 13 * gs.s * c, gs.rot, gs.s]; };
  const out = memPt(d.th, -8), inn = memPt(d.th, 24);
  let x, y, rot = d.rot0 + t * 0.55 * (i % 2 ? -1 : 1), sc = DEX0;
  const drift = (k) => [7 * noise1(t * 0.8, 600 + i * 5) * k, 7 * noise1(t * 0.8, 650 + i * 5) * k];
  if (t < d.t0) { const w = drift(1); x = d.s[0] + w[0]; y = d.s[1] + w[1]; }
  else if (t < d.tc) { const u = seg(t, d.t0, d.tc, ease.inOut); const p = bez(d.s, mid(d.s, out, 0.15), out, u); const w = drift(1 - u); x = p[0] + w[0]; y = p[1] + w[1]; }
  else if (t < d.tx) { const u = seg(t, d.tc, d.tx, ease.inOut); x = lerp(out[0], inn[0], u); y = lerp(out[1], inn[1], u); }
  else if (t < d.ta) { const u = seg(t, d.tx, d.ta, ease.inOut); const tgt = pocket(); const p = bez(inn, mid(inn, [tgt[0], tgt[1]], -0.2), [tgt[0], tgt[1]], u); x = p[0]; y = p[1];
    rot = lerp(rot, tgt[2], u * u); sc = lerp(DEX0, DEXB * tgt[3], ease.inOut(u)); }
  else { const tgt = pocket(); x = tgt[0]; y = tgt[1]; rot = tgt[2]; sc = DEXB * tgt[3]; }
  return { x, y, rot, sc, bound: t >= d.ta, crossing: t >= d.tc - 0.15 && t <= d.tx + 0.15 };
}

// ------------------------------------------------------------------ glyph drawing
function drawDex(x, y, rot, sc, a = 1) {
  if (a <= 0.003) return;
  withXf(x, y, rot, sc, () => {
    ctx.save(); ctx.globalAlpha *= a;
    for (const r of S.dex.rings) wash(r, '#C8401F', 1, { fa: 0.5, bloom: false, gran: false, edge: 1.2, ea: 0.3 });
    for (const r of S.dex.rings) ink(r, 1.7, { col: '#4A1608', raw: true });
    ctx.strokeStyle = rgba('#4A1608', 0.92); ctx.lineWidth = 1.5 * LW; ctx.lineCap = 'round';
    const D = S.dex; ctx.beginPath();
    for (const [p, q] of D.single) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
    for (const [p, q] of D.double) { // two parallel strokes
      const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), nx = (-dy / L) * 1.25, ny = (dx / L) * 1.25;
      for (const o of [-1, 1]) { ctx.moveTo(p[0] + nx * o, p[1] + ny * o); ctx.lineTo(q[0] + nx * o, q[1] + ny * o); } }
    for (const d of D.dbl) { ctx.moveTo(d[0], d[1]); ctx.lineTo(d[2], d[3]); }
    ctx.stroke();
    ctx.fillStyle = rgba('#7A2410', 0.95);
    for (const p of D.O) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.9, 0, TAU); ctx.fill(); }
    ctx.fillStyle = rgba('#5E8C34', 1); ctx.strokeStyle = rgba('#2F4A16', 0.9); ctx.lineWidth = 0.8 * LW;
    for (const p of D.F) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.1, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  });
}
function drawHSP(x, y, rot, a) {
  if (a <= 0.003) return;
  withXf(x, y, rot, 1, () => { ctx.save(); ctx.globalAlpha *= a; wash(S.hsp, COL.ochre, 1, { fa: 0.45, edge: 1.6, ga: 0.35 }); ink(S.hsp, 1.5); ctx.restore(); });
}
function drawGR(gs, a = 1, t = 0, dex = null) {
  if (a <= 0.003) return;
  const col = Kit.mix(Kit.hex('#7F95B4'), Kit.hex(COL.indigo), gs.act);
  withXf(gs.x, gs.y, gs.rot, gs.s, () => {
    ctx.save(); ctx.globalAlpha *= a;
    if (gs.mirror) ctx.scale(-1, 1);
    wash(S.gr, col, 1, { fa: 0.38 + 0.12 * gs.act, edge: 2, ga: 0.4 });
    ink(S.gr, 1.7);
    ctx.strokeStyle = rgba(COL.indigoD, 0.55); ctx.lineWidth = 1.1 * LW; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, 3); ctx.quadraticCurveTo(-11, 13, -1, 14); ctx.moveTo(5, -1); ctx.quadraticCurveTo(13, 1, 15, 9); ctx.moveTo(-7, -4); ctx.lineTo(-3, 2); ctx.stroke();
    ctx.restore();
  });
}
function drawSparks(x, y, rot, u, a) {
  if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.globalAlpha *= a * (1 - u); ctx.strokeStyle = rgba(COL.ink, 0.85); ctx.lineWidth = 1.3 * LW; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const d of [-55, -90, -125]) { const an = d * D2R + rot; const r0 = 15 + 10 * u, r1 = 22 + 14 * u; ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); }
  ctx.stroke(); ctx.restore();
}
function drawCytokine(x, y, s, a) {
  withXf(x, y, 0, s, () => { ctx.save(); ctx.globalAlpha *= a; wash(S.cyto2, COL.madder, 1, { fa: 0.5, bloom: false, gran: false, edge: 1.2 }); ink(S.cyto2, 1.2, { col: COL.madderD });
    ctx.fillStyle = rgba(COL.madderD, 0.8); ctx.beginPath(); ctx.arc(1.5, -1, 1.5, 0, TAU); ctx.fill(); ctx.restore(); });
}
function drawPG(x, y, rot, s, a) { // tiny prostaglandin skeleton: cyclopentane + two chains
  withXf(x, y, rot, s, () => {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = rgba(COL.madderD, 0.9); ctx.lineWidth = 1.25 * LW; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); for (let k = 0; k < 5; k++) { const an = (-90 + 72 * k) * D2R; const px = Math.cos(an) * 4.2, py = Math.sin(an) * 4.2; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
    ctx.moveTo(4, -1.3); ctx.lineTo(8, -4); ctx.lineTo(12, -1.5); ctx.lineTo(16, -4); ctx.lineTo(19, -2);
    ctx.moveTo(2.5, 3.4); ctx.lineTo(6.5, 6.5); ctx.lineTo(10.5, 4.5); ctx.lineTo(14.5, 7.5); ctx.lineTo(18.5, 5.5);
    ctx.stroke(); ctx.restore();
  });
}
function drawNFkB(x, y, dim, a) {
  withXf(x, y, 0, 1, () => { ctx.save(); ctx.globalAlpha *= a;
    S.nfk.forEach((p, i) => { const c = Kit.mix(Kit.hex(i ? '#B8687A' : COL.madder), Kit.hex('#B9ADA3'), dim); wash(p, c, 1, { fa: 0.45, edge: 1.6, ga: 0.35 }); ink(p, 1.5); });
    ctx.restore(); });
}
function drawAP1(x, y, dim, a) {
  withXf(x, y, 0, 1, () => { ctx.save(); ctx.globalAlpha *= a;
    S.ap1.forEach((p, i) => { const c = Kit.mix(Kit.hex(i ? '#9A6D96' : COL.plum), Kit.hex('#B5ABA8'), dim); wash(p, c, 1, { fa: 0.45, edge: 1.6, ga: 0.35 }); ink(p, 1.5); });
    ctx.restore(); });
}

// ------------------------------------------------------------------ world (cell) drawing under a view transform
function setView(T) { ctx.setTransform(T.k, 0, 0, T.k, T.ox - T.cx * T.k, T.oy - T.cy * T.k); LW = 1 / T.k; }
function toScreen(T, wx, wy) { return [T.ox + (wx - T.cx) * T.k, T.oy + (wy - T.cy) * T.k]; }
const T0 = { cx: 0, cy: 0, k: 1, ox: 0, oy: 0 };

const INK0 = 0.9; // the plate is already partly inked at t = 0 (thumbnail frame)
function drawPencil(t) { // faint graphite under-drawing that the pen inks over
  const a = 0.2 * (1 - seg(t, 1.3, 2.6)); if (a <= 0.003) return;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [dx, dy, k] of [[1.6, 1.1, 1], [-1.2, 0.6, 0.55]]) {
    ctx.strokeStyle = rgba('#5E5953', a * k); ctx.lineWidth = 1.1;
    ctx.beginPath(); addPoly(S.memOut, dx, dy); addPoly(S.nucOut, dx, dy); ctx.stroke();
    ctx.beginPath(); for (const m of S.mito) addPoly(m.out, dx, dy); for (const g of S.golgi) addPoly(g, dx, dy); ctx.stroke();
  }
  ctx.restore();
}
function drawCell(t, T, inset) {
  const draw = (a, b) => seg(t + INK0, a, b, ease.inOut);
  const lin = (a, b) => seg(t + INK0, a, b);
  const calm = calmU(t);
  const cytoCol = Kit.mix(Kit.hex(COL.rose), Kit.hex(COL.calm), calm);
  const zf = inset ? clamp((T.k - 1) / (KF - 1)) : 0;
  // --- cytoplasm
  wash(S.cyto, cytoCol, lin(0.1, 1.9), { fa: 0.26, ga: 0.55, edge: 5 });
  // watercolour back-runs (toned down inside the enlarged inset so they don't read as shapes)
  { const ba = draw(1.0, 2.0); if (ba > 0) for (const b of S.blooms) wash(b.p, b.nuc ? COL.violet : cytoCol, ba * (b.nuc ? 0.5 * lerp(1, 0.3, zf) : 0.55 * lerp(1, 0.5, zf)), { fa: 0.07, bloom: false, gran: false, edge: 2.4, ea: 0.42 }); }
  // speckle (free ribosomes)
  { const pa = draw(1.1, 2.0) * 0.5; if (pa > 0) { ctx.fillStyle = rgba(COL.sepia, pa); ctx.beginPath(); for (const [x, y, r] of S.speck) { ctx.moveTo(x + r * LW, y); ctx.arc(x, y, r * LW * 1.2, 0, TAU); } ctx.fill(); } }
  // --- organelles
  S.mito.forEach((m, i) => { const p = draw(0.5 + i * 0.08, 1.3 + i * 0.08); wash(m.out, COL.mito, draw(0.9, 1.9), { fa: 0.42, edge: 2, ga: 0.45 }); ink(m.out, 1.6, { prog: p });
    ink(m.cr, 1.1, { closed: false, raw: true, prog: draw(1.0, 1.7), col: '#7A4E26' }); });
  S.er.forEach((pl, j) => ink(pl, 1.4, { closed: false, raw: true, prog: draw(0.7 + j * 0.1, 1.5 + j * 0.1), col: '#5E4636' }));
  { const ra = draw(1.2, 1.9); if (ra > 0) { ctx.fillStyle = rgba('#5E4636', 0.75 * ra); ctx.beginPath(); for (const [x, y] of S.ribo) { ctx.moveTo(x + 1.6 * LW, y); ctx.arc(x, y, 1.6 * LW, 0, TAU); } ctx.fill(); } }
  S.golgi.forEach((g, i) => { wash(g, COL.golgi, draw(1.0, 1.9), { fa: 0.5, bloom: false, edge: 1.2, ga: 0.3 }); ink(g, 1.3, { prog: draw(0.7 + i * 0.07, 1.4 + i * 0.07) }); });
  S.vesicles.forEach((v, i) => { wash(v, i % 3 ? COL.ochre : COL.golgi, draw(1.1, 1.9), { fa: 0.35, bloom: false, gran: false, edge: 1 }); ink(v, 1.1, { prog: draw(0.9 + i * 0.04, 1.4 + i * 0.04) }); });
  // --- nucleus
  wash(S.nucFill, COL.violet, lin(0.3, 1.9) * lerp(1, 0.33, zf), { fa: 0.27, ga: lerp(0.6, 0.3, zf), edge: 4, bloom: zf < 0.5 });
  { const ca = draw(1.0, 1.9) * lerp(0.7, 0.2, zf); if (ca > 0) {
      const nShow = Math.floor(S.chrom.length * draw(0.9, 1.9)); ctx.fillStyle = rgba(COL.violetD, ca); ctx.beginPath();
      for (let k = 0; k < nShow; k++) { const [x, y, r] = S.chrom[k]; const rr = r * Math.pow(LW, 0.6); ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, TAU); } ctx.fill(); } }
  wash(S.nucleolus, COL.violetD, draw(1.0, 1.9), { fa: 0.38, edge: 1.6 });
  { const na = draw(1.1, 1.9) * 0.8; if (na > 0) { ctx.fillStyle = rgba('#3E2C52', na); ctx.beginPath(); for (const [x, y, r] of S.nucDots) { const rr = r * Math.pow(LW, 0.6); ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, TAU); } ctx.fill(); } }
  ink(S.nucleolus, 1.2, { prog: draw(0.9, 1.5), a: 0.8 });
  // envelope band
  { const ba = draw(0.8, 1.6); if (ba > 0) { ctx.save(); ctx.beginPath(); addPoly(S.nucOut); addPoly(S.nucIn); ctx.fillStyle = rgba('#B7A6C4', 0.55 * ba); ctx.fill('evenodd'); ctx.restore(); } }
  ink(S.nucOut, 1.9, { prog: draw(0.3, 1.25) });
  ink(S.nucIn, 1.2, { prog: draw(0.4, 1.35), a: 0.8 });
  { const pa = draw(1.0, 1.6); if (pa > 0) for (const pr of S.pores) {
      ctx.save(); ctx.globalAlpha *= pa; ctx.translate(pr.p[0] + pr.n[0] * 3.5, pr.p[1] + pr.n[1] * 3.5); ctx.rotate(Math.atan2(pr.n[1], pr.n[0]));
      ctx.fillStyle = rgba('#F3E8D2', 1); ctx.strokeStyle = rgba(COL.ink, 0.85); ctx.lineWidth = 1.1 * LW;
      ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, -4.5); ctx.lineTo(-5, 4.5); ctx.moveTo(5, -4.5); ctx.lineTo(5, 4.5); ctx.stroke(); ctx.restore(); } }
  hatch(S.nucOut, { dx: -22, dy: -20, ang: 0.85, sp: 5.5, w: 0.9, col: COL.violetD, a: 0.28 * draw(1.2, 2.0) });
  // --- membrane (skip when far outside the inset)
  if (!inset || T.k < 1.5) {
    const mp = draw(0.05, 1.2);
    { const ba = draw(0.6, 1.5); if (ba > 0) { ctx.save(); ctx.beginPath(); addPoly(S.memOut); addPoly(S.memIn); ctx.fillStyle = rgba(COL.mem, 0.55 * ba); ctx.fill('evenodd'); ctx.restore(); } }
    hatch(S.memOut, { dx: -40, dy: -36, ang: 0.8, sp: 7, w: 1, col: COL.sepia, a: 0.22 * draw(1.2, 2.0) });
    hatch(S.memOut, { dx: -16, dy: -14, ang: -0.75, sp: 7.5, w: 0.9, col: COL.sepia, a: 0.2 * draw(1.3, 2.0) });
    // phospholipid heads (part around crossing dex molecules)
    const nShow = Math.floor(S.heads.length * draw(0.4, 1.5));
    if (nShow > 0) {
      const movers = []; for (let i = 0; i < 3; i++) { const d = dexState(i, t); if (d.crossing) movers.push(d); }
      ctx.beginPath(); const tails = [];
      for (let k = 0; k < nShow; k++) {
        let [x, y, nx, ny] = S.heads[k];
        let px = 0, py = 0;
        for (const m of movers) { const dx = x - m.x, dy = y - m.y, dd = Math.hypot(dx, dy); if (dd < 30) { const f = (1 - dd / 30) * 9; px += (dx / (dd || 1)) * f; py += (dy / (dd || 1)) * f; } }
        const o1x = x + nx * 2.6 + px, o1y = y + ny * 2.6 + py, o2x = x + nx * 12.4 + px, o2y = y + ny * 12.4 + py;
        ctx.moveTo(o1x + 2.5, o1y); ctx.arc(o1x, o1y, 2.5, 0, TAU); ctx.moveTo(o2x + 2.5, o2y); ctx.arc(o2x, o2y, 2.5, 0, TAU);
        tails.push([x + nx * 5 + px, y + ny * 5 + py, x + nx * 7 + px, y + ny * 7 + py, x + nx * 10 + px, y + ny * 10 + py, x + nx * 8 + px, y + ny * 8 + py]);
      }
      ctx.fillStyle = rgba('#F1DCC4', 0.95); ctx.fill(); ctx.strokeStyle = rgba(COL.ink, 0.7); ctx.lineWidth = 0.75 * LW; ctx.stroke();
      ctx.beginPath(); for (const q of tails) { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); ctx.moveTo(q[4], q[5]); ctx.lineTo(q[6], q[7]); }
      ctx.strokeStyle = rgba(COL.sepia, 0.55); ctx.lineWidth = 0.7 * LW; ctx.stroke();
    }
    ink(S.memOut, 2.0, { prog: mp });
    ink(S.memIn, 1.3, { prog: draw(0.15, 1.3), a: 0.75 });
  }
}

function drawMediators(t, za = 1) {
  // budding from the upper-right membrane, drifting out; output tapers off once the genes are turned down
  if (za <= 0.003) return;
  for (let i = 0; i < 200; i++) {
    const b = 0.3 + i * 0.105; if (b > t) break;
    const rate = (b < 2.5 ? 0.95 : 0.72) * (1 - seg(b, 19.6, 20.8));
    if (hash(i, 11) > rate) continue;
    const life = 2.3 + hash(i, 12) * 0.9, age = t - b; if (age > life) continue;
    const deg = lerp(-78, -22, hash(i, 13));
    const i0 = memIdx(deg), p = S.memOut[i0], nn = S.memN[i0];
    const dirA = Math.atan2(-nn[1], -nn[0]) + (hash(i, 14) - 0.5) * 0.7 - 0.25;
    const sp = 42 + hash(i, 15) * 30, dist = sp * age + 14 * ease.out(clamp(age / 0.5));
    let x = p[0] + Math.cos(dirA) * dist, y = p[1] + Math.sin(dirA) * dist;
    x += Math.sin(age * 2.1 + i) * 4; y += Math.cos(age * 1.7 + i) * 3;
    let a = seg(age, 0, 0.35) * (1 - seg(age, life - 0.8, life)) * (1 - seg(t, 20.7, 22.3)) * za;
    a *= seg(y, 566, 616) * (1 - seg(x, 1020, 1070));
    if (a <= 0.01) continue;
    if (hash(i, 16) < 0.55) drawCytokine(x, y, 1.85 + hash(i, 17) * 0.75, a);
    else drawPG(x, y, hash(i, 18) * TAU, 2.0 + hash(i, 19) * 0.55, a);
  }
}

function hspPose(i, side, t) { // world pose of one HSP90 protomer of complex i
  // HSP90 stays bound after hormone binding and escorts GR to the nuclear pore (Echeverría 2009);
  // it is released at the pore mouth and drifts back into the cytoplasm.
  const g = GRS[i], tr = g.tB[0] + REL;
  const gs = grState(i, Math.min(t, tr));
  const lx = side * 21 * gs.s, ly = 2 * gs.s, lr = -side * 0.35;
  const c = Math.cos(gs.rot), s = Math.sin(gs.rot);
  let x = gs.x + lx * c - ly * s, y = gs.y + lx * s + ly * c, rot = gs.rot + lr;
  if (t > tr) {
    const u = seg(t, tr, tr + 1.5, ease.out), P = porePts(g.pore);
    let ox = P.at[0] - P.inn[0], oy = P.at[1] - P.inn[1]; const L = Math.hypot(ox, oy) || 1; ox /= L; oy /= L; // outward
    x += (ox * 30 - oy * side * 24) * u; y += (oy * 30 + ox * side * 24) * u; rot += side * 0.8 * u;
  }
  return { x, y, rot, s: gs.s, a: seg(t, 0.9, 1.6) * (1 - seg(t, tr + 0.35, tr + 1.4)) };
}
function drawHSPs(i, t) {
  for (const side of [-1, 1]) {
    const h = hspPose(i, side, t); if (h.a <= 0.003) continue;
    withXf(h.x, h.y, h.rot, h.s, () => { if (side > 0) ctx.scale(-1, 1); drawHSP(0, 0, 0, h.a); });
  }
}
function dotted(pts, a, col = COL.ink, w = 1.7) {
  if (a <= 0.003 || pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = rgba(col, 0.75 * a); ctx.lineWidth = w * LW; ctx.lineCap = 'round';
  ctx.setLineDash([0.1, 7 * LW]); ctx.beginPath(); pts.forEach((q, k) => (k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); ctx.restore();
}
function drawProteins(t) { // newly made anti-inflammatory proteins (annexin A1, MKP-1) — schematic
  for (const [x, y, h] of S.prot) {
    const a = seg(t, 20.3 + h * 1.2, 20.8 + h * 1.2) * (1 - ghostU(t)); if (a <= 0.003) continue;
    const dx = 3 * Math.sin(t * 1.3 + h * 20), dy = 3 * Math.cos(t * 1.1 + h * 17);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = rgba(COL.verd, 0.75); ctx.strokeStyle = rgba(COL.verdD, 0.95); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(x + dx, y + dy, 6.5, 5.2, h * 3, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  }
}
function drawTrails(t) {
  for (let i = 0; i < 3; i++) {
    const d = DEXS[i], a = 1 - seg(t, d.ta + 0.6, d.ta + 1.4);
    if (t > d.t0 && a > 0) { const pts = []; for (let s = d.t0; s <= Math.min(t, d.ta); s += 0.05) { const q = dexState(i, s); pts.push([q.x, q.y]); } dotted(pts, a, '#7A2410', 2.2); }
    const g = GRS[i], b = 1 - seg(t, g.tA[1] + 0.2, g.tA[1] + 0.9);
    if (t > g.tA[0] && b > 0) { const pts = []; for (let s = g.tA[0]; s <= Math.min(t, g.tA[1]); s += 0.05) { const q = grState(i, s); pts.push([q.x, q.y + 4]); } dotted(pts, b, COL.indigoD, 2.2); }
  }
}
function drawActors(t, T, inset) {
  // HSP90 chaperones, GR complexes, dexamethasone
  for (let i = 0; i < 3; i++) {
    const gs = grState(i, t), d = DEXS[i];
    const appear = seg(t, 0.9, 1.6);
    drawHSPs(i, t);
    drawGR(gs, appear, t);
    drawSparks(gs.x, gs.y - 12 * gs.s, gs.rot, seg(t, d.ta, d.ta + 0.5), 1);
  }
  for (let i = 0; i < 3; i++) {
    const ds = dexState(i, t);
    const a = ds.bound ? 1 : seg(t, 1.4, 1.9);
    drawDex(ds.x, ds.y, ds.rot, ds.sc, a);
  }
}

// ------------------------------------------------------------------ nucleus detail (inset layer, coords in final-inset px)
function setDetail(T) { const s = T.k / KF; ctx.setTransform(s, 0, 0, s, T.ox, T.oy); LW = 1 / s; }
function helix(u0, u1, v, a, tint, tintA) {
  const A = 11, lam = 58;
  if (tintA > 0) { // pale chromatin ribbon
    ctx.fillStyle = rgba(tint, tintA * a); ctx.beginPath(); ctx.roundRect(u0 - 6, v - 17, u1 - u0 + 12, 34, 17); ctx.fill();
  }
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  // rungs
  ctx.strokeStyle = rgba(COL.sepia, 0.55); ctx.lineWidth = 1.2 * LW; ctx.beginPath();
  for (let u = u0 + 3; u < u1; u += 7) { const s = Math.sin(((u - u0) / lam) * TAU); ctx.moveTo(u, v - A * s); ctx.lineTo(u, v + A * s); }
  ctx.stroke();
  for (const ph of [0, Math.PI]) {
    ctx.strokeStyle = rgba(COL.ink, 0.9); ctx.lineWidth = 2 * LW; ctx.beginPath();
    for (let u = u0; u <= u1; u += 3) { const y = v + A * Math.sin(((u - u0) / lam) * TAU + ph); u === u0 ? ctx.moveTo(u, y) : ctx.lineTo(u, y); }
    ctx.stroke();
  }
  ctx.restore();
}
function drawDetail(t, T, a) {
  if (a <= 0.003) return;
  setDetail(T);
  // segments tinted on the strands
  const gre = seg(t, 13.1, 13.5);
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = rgba(COL.verm, 0.16 + 0.22 * gre); ctx.beginPath(); ctx.roundRect(-262, V_UP - 19, 170, 38, 10); ctx.fill();
  for (const g of GENES_ON) { const on = seg(t, g.t, g.t + 0.3); ctx.fillStyle = rgba(COL.verd, 0.1 + 0.25 * on); ctx.beginPath(); ctx.roundRect(g.u - 58, V_UP - 17, 116, 34, 12); ctx.fill(); }
  for (const g of GENES_OFF) { const off = seg(t, g.t, g.t + 0.3); ctx.fillStyle = rgba(Kit.mix(Kit.hex(COL.madder), Kit.hex('#B4A898'), off), 0.32 - 0.14 * off); ctx.beginPath(); ctx.roundRect(g.u - 58, V_DN - 17, 116, 34, 12); ctx.fill(); }
  ctx.fillStyle = rgba(COL.madder, 0.14); ctx.beginPath(); ctx.roundRect(TF_NF - 44, V_DN - 18, TF_AP - TF_NF + 84, 36, 10); ctx.fill();
  ctx.restore();
  helix(-336, 336, V_UP, a, COL.ochre, 0);
  helix(-362, 362, V_DN, a, COL.ochre, 0);
  // transcription factors on the lower strand
  const teth = seg(t, T_TETH[0], T_TETH[1]);
  withXf(TF_NF, V_DN - 27, 0, KF, () => drawNFkB(0, 0, teth * 0.65, a));
  withXf(TF_AP, V_DN - 27, 0, KF, () => drawAP1(0, 0, teth * 0.65, a));
  // mRNA from genes that were turned up
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  for (const g of GENES_ON) for (let k = 0; k < 3; k++) {
    const t0 = g.t + 0.35 + k * 0.4, age = t - t0; if (age < 0) continue;
    const life = 1.5, al = seg(age, 0, 0.25) * (1 - seg(age, life - 0.5, life)) * (1 - seg(t, 19.1, 19.5)); if (al <= 0) continue;
    const ox = g.u + (k - 1) * 24 + age * 10 * (k - 1), oy = V_UP - 54 - age * 28;
    ctx.strokeStyle = rgba(COL.verdD, 0.85 * al); ctx.lineWidth = 2 * LW; ctx.beginPath();
    for (let s = 0; s <= 1.0001; s += 0.08) { const yy = oy - s * 30, xx = ox + Math.sin(s * 9 + age * 6 + k) * 4; s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.fillStyle = rgba(COL.verdD, 0.9 * al); ctx.beginPath(); ctx.arc(ox + Math.sin(age * 6 + k) * 4, oy, 2.6 * LW * 1.4, 0, TAU); ctx.fill();
  }
  // dotted "signal" arcs
  const arc = (col, al, p, p0, p1, p2) => { if (p <= 0 || al <= 0) return; ctx.strokeStyle = rgba(col, 0.85 * al); const pts = [];
    for (let s = 0; s <= p + 1e-6; s += 0.04) pts.push(bez(p0, p1, p2, s)); ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); };
  ctx.setLineDash([2.5 * LW, 5 * LW]); ctx.lineWidth = 1.8 * LW;
  for (const g of GENES_ON) arc(COL.verdD, 1 - seg(t, g.t + 1.2, g.t + 1.8), seg(t, g.t - 0.35, g.t + 0.05, ease.inOut), [-120, V_UP - 75], [(-120 + g.u) / 2, V_UP - 142], [g.u - 6, V_UP - 30]);
  for (const g of GENES_OFF) {
    const al = 1 - seg(t, g.t + 1.0, g.t + 1.6);
    // tethered GR (transrepression of NF-κB / AP-1-driven genes)
    arc(COL.indigoD, al, seg(t, g.t - 0.4, g.t, ease.inOut), [-192, 50], [(-192 + g.u) / 2, 38], [g.u + 2, V_DN - 52]);
    // MKP-1 (DUSP1), made by the transactivation arm, also turns COX-2, IL-1β and TNF down (Abraham 2006)
    if (g.mkp) arc(COL.verdD, al, seg(t, g.t - 0.45, g.t - 0.05, ease.inOut), [GENES_ON[1].u, V_UP + LAB_DY + 14], [(GENES_ON[1].u + g.u) / 2, 14], [g.u + 8, V_DN - 52]);
  }
  ctx.setLineDash([]);
  ctx.restore();
}
/** brass "gene switch": lever up = HI (expression turned up), lever down = LO; lamp + glow show the level */
function drawSwitch(x0, y0, on, lamp, glowCol, glowA, a, sc = SW_SC) {
  if (a <= 0.003 || sc <= 0.05) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.translate(x0, y0); ctx.scale(sc, sc);
  const onC = clamp(on), px = -4, py = 0, L = 20, lx = 14;
  const ang = lerp(75, -75, on) * D2R, ex = px + Math.cos(ang) * L, ey = py + Math.sin(ang) * L;
  // plate with an engraved inner rule
  ctx.fillStyle = '#F6EEDB'; ctx.strokeStyle = rgba(COL.ink, 0.95); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.roundRect(-27, -11.5, 52, 23, 5); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = rgba(COL.sepia, 0.55); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.roundRect(-25, -9.5, 48, 19, 3.5); ctx.stroke();
  // engraved HI / LO (the active one inked darker)
  ctx.font = font(9.4, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = rgba(COL.ink, lerp(0.28, 0.95, onC)); ctx.fillText('HI', -17.5, -1.2);
  ctx.fillStyle = rgba(COL.ink, lerp(0.95, 0.28, onC)); ctx.fillText('LO', -17.5, 8.4);
  // lamp glow
  if (glowA > 0.01) { const g = ctx.createRadialGradient(lx, 0, 3, lx, 0, 17); g.addColorStop(0, rgba(glowCol, 0.6 * glowA)); g.addColorStop(0.5, rgba(glowCol, 0.22 * glowA)); g.addColorStop(1, rgba(glowCol, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, 0, 17, 0, TAU); ctx.fill(); }
  // lever (bat handle) + pivot boss
  ctx.strokeStyle = rgba(COL.ink, 0.95); ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.fillStyle = '#E9D9B8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ex, ey, 4.2, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = rgba(COL.ink, 0.92); ctx.beginPath(); ctx.arc(px, py, 3.4, 0, TAU); ctx.fill();
  // lamp
  ctx.fillStyle = typeof lamp === 'string' ? lamp : rgba(lamp, 1); ctx.strokeStyle = rgba(COL.ink, 0.9); ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(lx, 0, 5, 0, TAU); ctx.fill(); ctx.stroke();
  if (glowA > 0.01) { ctx.fillStyle = `rgba(255,252,240,${0.75 * glowA})`; ctx.beginPath(); ctx.arc(lx - 1.6, -1.6, 1.4, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ screen-space annotation helpers
function marker(n, x, y, a, hot) {
  if (a <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = rgba('#F7EFDC', 0.97); ctx.strokeStyle = rgba(hot ? COL.vermD : COL.ink, 0.95); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.stroke();
  ctx.restore();
  text(n, x, y + 10.5, { size: 31, weight: 600, align: 'center', color: hot ? COL.vermD : COL.ink, alpha: a });
}
function leader(x1, y1, x2, y2, p, a) {
  if (a <= 0.003 || p <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = rgba(COL.ink, 0.85); ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
  if (p >= 1) { ctx.fillStyle = rgba(COL.ink, 0.9); ctx.beginPath(); ctx.arc(x2, y2, 2.8, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** marker with leader: marker at (mx,my) -> target (tx,ty) */
function callout(n, mx, my, tx, ty, t0, a, hot) {
  const ap = seg(clampT, t0, t0 + 0.35, ease.out) * a; if (ap <= 0) return;
  const dx = tx - mx, dy = ty - my, L = Math.hypot(dx, dy) || 1;
  leader(mx + (dx / L) * 22, my + (dy / L) * 22, tx, ty, seg(clampT, t0 + 0.1, t0 + 0.55, ease.inOut), ap);
  marker(n, mx, my, ap, hot);
}
let clampT = 0;

function drawWatch(x, y, r, t, a) {
  if (a <= 0.003) return;
  const sweep = seg(t, 20.5, 22.5, ease.inOut);
  ctx.save(); ctx.globalAlpha *= a;
  // bow + crown
  ctx.strokeStyle = rgba(COL.ink, 0.9); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y - r - 12, 9, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
  ctx.fillStyle = rgba(COL.brass, 0.75); ctx.beginPath(); ctx.roundRect(x - 6, y - r - 9, 12, 10, 3); ctx.fill(); ctx.stroke();
  // case
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, 'rgba(236,214,160,0.95)'); g.addColorStop(1, 'rgba(184,140,72,0.9)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.lineWidth = 2.2; ctx.stroke();
  ctx.fillStyle = 'rgba(250,244,228,0.96)'; ctx.beginPath(); ctx.arc(x, y, r - 7, 0, TAU); ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
  // ticks
  ctx.lineWidth = 1.4; ctx.beginPath();
  for (let k = 0; k < 12; k++) { const an = (k / 12) * TAU; const r0 = r - (k % 3 ? 13 : 17), r1 = r - 9; ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); }
  ctx.stroke();
  // elapsed sector (pale wash)
  const hAng = -Math.PI / 2 + sweep * (4 / 12) * TAU;
  ctx.fillStyle = rgba(COL.verd, 0.22); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r - 9, -Math.PI / 2, hAng); ctx.closePath(); ctx.fill();
  // hands
  const mAng = -Math.PI / 2 + sweep * 4 * TAU;
  ctx.lineCap = 'round';
  ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(hAng) * (r - 26), y + Math.sin(hAng) * (r - 26)); ctx.stroke();
  ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(mAng) * (r - 14), y + Math.sin(mAng) * (r - 14)); ctx.stroke();
  ctx.fillStyle = rgba(COL.ink, 1); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ fixed page furniture
function drawHeader(t) {
  const a = 1;
  lsSet(0);
  text('PLATE III', 64, 268, { size: 28, weight: 500, color: COL.sepia, ls: 5, alpha: a });
  text('@natebrooksendo', 1016, 268, { size: 28, italic: true, align: 'right', color: COL.sepia, alpha: a * 0.95 });
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = rgba(COL.sepia, 0.75);
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(64, 286); ctx.lineTo(1016, 286); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(64, 291); ctx.lineTo(1016, 291); ctx.stroke(); ctx.restore();
  const ta = 1;
  text('How dexamethasone', 540, 376 + 6 * (1 - ta), { size: 80, weight: 500, align: 'center', color: COL.ink, alpha: ta });
  text('turns down inflammation', 540, 456 + 6 * (1 - ta), { size: 80, weight: 500, italic: true, align: 'center', color: COL.ink, alpha: ta });
  ctx.save(); ctx.globalAlpha = 1; ctx.strokeStyle = rgba(COL.sepia, 0.7); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(370, 490); ctx.lineTo(515, 490); ctx.moveTo(565, 490); ctx.lineTo(710, 490); ctx.stroke(); ctx.restore();
  ornament(540, 490, 9, 1, COL.vermD);
}
function drawCaptions(t) {
  ctx.save(); ctx.strokeStyle = rgba(COL.sepia, 0.7); ctx.globalAlpha = seg(t, 0.4, 1.0);
  ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(64, 1376); ctx.lineTo(960, 1376); ctx.stroke();
  ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(64, 1381); ctx.lineTo(960, 1381); ctx.stroke(); ctx.restore();
  for (const st of STEPS) {
    const last = st.n === 'P';
    const a = last ? seg(t, st.a, st.a + 0.3, ease.out) : env(t, st.a, st.b, 0.28, 0.2);
    if (a <= 0.003) continue;
    const dy = 10 * (1 - a);
    // badge
    if (st.n === 'P' || st.n === '*') {
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = rgba(COL.vermD, 0.95);
      if (st.n === 'P') { ornament(100, 1442 + dy, 13, a, COL.vermD); }
      else { // hourglass badge ("over hours")
        const cx = 100, cy = 1438 + dy;
        ctx.fillStyle = rgba('#F7EFDC', 0.9); ctx.strokeStyle = rgba(COL.vermD, 0.95); ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(cx, cy, 30, 0, TAU); ctx.fill(); ctx.stroke(); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(cx, cy, 25, 0, TAU); ctx.stroke();
        const sand = seg(t, 19.7, 22.3, ease.inOut);
        ctx.lineWidth = 2; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 10, cy - 15); ctx.lineTo(cx + 10, cy - 15); ctx.lineTo(cx + 1.5, cy); ctx.lineTo(cx + 10, cy + 15); ctx.lineTo(cx - 10, cy + 15); ctx.lineTo(cx - 1.5, cy); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = rgba(COL.ochre, 0.95);
        const top = lerp(1, 0.1, sand), bot = lerp(0.15, 1, sand);
        ctx.beginPath(); ctx.moveTo(cx - 8 * top, cy - 1 - 12 * top); ctx.lineTo(cx + 8 * top, cy - 1 - 12 * top); ctx.lineTo(cx, cy - 1); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - 8, cy + 13); ctx.lineTo(cx + 8, cy + 13); ctx.lineTo(cx + 8 - 6 * (1 - bot), cy + 13 - 11 * bot); ctx.lineTo(cx - 8 + 6 * (1 - bot), cy + 13 - 11 * bot); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = rgba(COL.vermD, 0.95); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(cx - 13, cy - 16); ctx.lineTo(cx + 13, cy - 16); ctx.moveTo(cx - 13, cy + 16); ctx.lineTo(cx + 13, cy + 16); ctx.stroke(); }
      ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = rgba('#F7EFDC', 0.9); ctx.strokeStyle = rgba(COL.vermD, 0.95); ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(100, 1438 + dy, 30, 0, TAU); ctx.fill(); ctx.stroke(); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(100, 1438 + dy, 25, 0, TAU); ctx.stroke(); ctx.restore();
      text(st.n, 100, 1452 + dy, { size: 42, weight: 600, align: 'center', color: COL.vermD, alpha: a });
    }
    let size = last ? 58 : 52; while (size > 40 && measure(st.title, size, 600) > 800) size -= 1;
    text(st.title, 152, 1456 + dy, { size, weight: 600, color: COL.ink, alpha: a });
    text(st.sub, 153, 1510 + dy, { size: 42, italic: true, color: COL.sepia, alpha: a });
  }
  // fine print
  // per-step caveats replace the default line (fine print, not required reading)
  const notes = [
    [5.5, 12.3, 'Newer model: HSP90 escorts GR to the nuclear pore (Echeverría 2009)'],
    [12.4, 15.75, 'Both arms contribute · one GRE drawn for two genes · schematic'],
    [15.85, 19.2, 'MKP-1, GILZ and mRNA decay also turn these genes down · schematic'],
    [19.4, 22.6, 'Timings illustrative · rapid non-genomic effects also exist (not shown)'],
  ];
  // sequential swaps: the default line fades out before a note fades in (and back after it), so two
  // lines never overlap and the default never flashes in the short gaps between adjacent notes
  let cover = 0;
  for (const [a, b, str] of notes) { const na = env(t, a, b, 0.3, 0.3); cover = Math.max(cover, env(t, a - 0.35, b + 0.35, 0.3, 0.3)); text(str, 64, 1560, { size: 23, italic: true, color: COL.sepia, alpha: na * 0.9 }); }
  const fa = seg(t, 1.0, 1.5) * (1 - seg(t, 18.6, 18.9)) * (1 - cover);
  text('Schematic · not to scale · timings simplified', 64, 1560, { size: 23, italic: true, color: COL.sepia, alpha: fa * 0.9 });
  const sa = seg(t, 24.4, 24.9);
  text('Cain & Cidlowski, Nat Rev Immunol 2017 · Barnes, Br J Pharmacol 2006 · Abraham, J Exp Med 2006', 64, 1560, { size: 22, italic: true, color: COL.sepia, alpha: sa * 0.95 });
}

// ------------------------------------------------------------------ payoff panel
function fitSize(str, maxW, size, weight = 400, italic = false) { while (size > 20 && measure(str, size, weight, italic) > maxW) size -= 0.5; return size; }
function drawPanel(t) {
  const g = ghostU(t); if (g <= 0) return;
  // ghost the figure under fresh paper
  ctx.save(); ctx.globalAlpha = 0.88 * g; ctx.beginPath(); ctx.rect(0, 500, W, 866); ctx.clip(); ctx.drawImage(paper, 0, 0); ctx.restore();
  const s = (a, b) => seg(t, a, b, ease.out);
  // frame (inked on); right edge kept clear of the Reels button column
  const FX0 = 72, FX1 = 952, FY0 = 518, FY1 = 1348;
  const fp = seg(t, 22.6, 23.3, ease.inOut);
  ctx.save(); ctx.strokeStyle = rgba(COL.ink, 0.85); ctx.lineWidth = 1.6; ctx.globalAlpha = g;
  const fr = [[FX0, FY0], [FX1, FY0], [FX1, FY1], [FX0, FY1]];
  ctx.beginPath(); const per = 2 * (FX1 - FX0 + FY1 - FY0); let rem = fp * per; ctx.moveTo(fr[0][0], fr[0][1]);
  for (let k = 1; k <= 4 && rem > 0; k++) { const a = fr[k - 1], b = fr[k % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]); const f = Math.min(1, rem / L); ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); rem -= L; }
  ctx.stroke(); ctx.lineWidth = 0.7; ctx.globalAlpha = g * seg(t, 23.1, 23.4); ctx.strokeRect(FX0 + 7, FY0 + 7, FX1 - FX0 - 14, FY1 - FY0 - 14); ctx.restore();
  const cap = 'Fig. 3 — where each drug acts on prostaglandin synthesis (simplified)';
  text(cap, 104, 574, { size: fitSize(cap, 820, 30, 400, true), italic: true, color: COL.sepia, alpha: s(22.8, 23.2) });
  const X = 345;
  const node = (str, y, t0) => text(str, X, y, { size: 38, weight: 500, align: 'center', color: COL.ink, alpha: s(t0, t0 + 0.35) });
  const arrow = (y0, y1, t0) => { const p = seg(t, t0, t0 + 0.3, ease.inOut); if (p <= 0) return; ctx.save(); ctx.strokeStyle = rgba(COL.ink, 0.9); ctx.lineWidth = 2; ctx.lineCap = 'round';
    const ye = lerp(y0, y1, p); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, ye); ctx.stroke();
    if (p > 0.95) { ctx.beginPath(); ctx.moveTo(X - 9, y1 - 14); ctx.lineTo(X, y1); ctx.lineTo(X + 9, y1 - 14); ctx.stroke(); } ctx.restore(); };
  node('Membrane phospholipids', 636, 22.9);
  arrow(656, 774, 23.0);
  textSub('cPLA', '2', X - 46, 728, { size: 36, italic: true, align: 'right', color: COL.sepia, alpha: s(23.1, 23.4) });
  node('Arachidonic acid', 818, 23.2);
  arrow(838, 972, 23.3);
  text('COX-1 / COX-2', X - 46, 918, { size: 34, italic: true, align: 'right', color: COL.sepia, alpha: s(23.4, 23.7) });
  node('Prostaglandins', 1016, 23.5);
  text('pain · swelling', X, 1054, { size: 30, italic: true, align: 'center', color: COL.sepia, alpha: s(23.6, 23.9) });
  // blockers: a 12 px bar across the step with short T-caps, a fine leader to the label
  const LX = 566;
  const block = (y, col, label, subs, ly, t0) => {
    const p = seg(t, t0, t0 + 0.3, ease.out); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = rgba(col, 0.95); ctx.lineCap = 'butt'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(X - 30, y); ctx.lineTo(X + 30, y); ctx.stroke();
    ctx.lineWidth = 3.2; ctx.beginPath(); for (const ex of [X - 30, X + 30]) { ctx.moveTo(ex, y - 11); ctx.lineTo(ex, y + 11); } ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(COL.ink, 0.7); ctx.beginPath(); ctx.moveTo(X + 40, y); ctx.lineTo(LX - 16, ly - 13); ctx.lineTo(LX - 6, ly - 13); ctx.stroke();
    ctx.restore();
    text(label, LX, ly, { size: 40, weight: 600, color: col, ls: 3, alpha: p });
    subs.forEach((sb, k) => text(sb, LX, ly + 38 + 35 * k, { size: 34, italic: true, color: COL.sepia, alpha: p }));
  };
  block(716, COL.verm, 'STEROID', ['partly via annexin A1'], 716, 23.65);
  block(880, COL.verm, 'STEROID', ['less COX-2 made', '(COX-1 unaffected)'], 856, 23.85);
  block(932, COL.indigoD, 'NSAID', ['blocks COX-1 & COX-2', 'enzyme activity'], 990, 24.05);
  // endodontic relevance (pooled RCT evidence + an explicit "not a ranking" caveat)
  const ea = s(24.1, 24.4);
  ctx.save(); ctx.globalAlpha = ea; ctx.strokeStyle = rgba(COL.sepia, 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(104, 1102); ctx.lineTo(920, 1102); ctx.stroke(); ctx.restore();
  const hw = text('In endodontics,', 104, 1148, { size: 36, weight: 600, color: COL.vermD, alpha: ea });
  text('oral/injected steroids reduced', 104 + hw + 12, 1148, { size: 36, italic: true, color: COL.ink, alpha: ea });
  text('post-op pain vs control at 6–24 h', 104, 1190, { size: 36, italic: true, color: COL.ink, alpha: ea });
  text('Meta-analysis of 29 RCTs · Alajlan et al., J Endod 2024 · moderate certainty', 104, 1232, { size: 23, italic: true, color: COL.sepia, alpha: s(24.3, 24.6) });
  const cv = s(24.5, 24.8);
  text('Mechanism, not a clinical ranking: steroids given only after treatment', 104, 1270, { size: 23, italic: true, color: COL.sepia, alpha: cv });
  text('did not beat placebo for post-op pain (Zanjir et al., J Endod 2020)', 104, 1298, { size: 23, italic: true, color: COL.sepia, alpha: cv });
}

/** label with a pale paper "tablet" behind it (for text sitting on washes) */
function tag(str, x, y, o) {
  const a = o.alpha ?? 1; if (a <= 0.003) return 0;
  const size = o.size || 32, w = measure(str, size, o.weight || 400, o.italic, o.ls || 0);
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  ctx.save(); ctx.globalAlpha = a * (o.ta ?? 0.8); ctx.fillStyle = 'rgb(248,241,226)';
  ctx.beginPath(); ctx.roundRect(x0 - 9, y - size * 0.78, w + 18, size * 1.06, 8); ctx.fill(); ctx.restore();
  return text(str, x, y, o);
}

// ------------------------------------------------------------------ loop: blot-wipe back to the opening frame
let frame0 = null;
function drawLoopWipe(t) {
  const u = seg(t, DUR - 0.5, DUR - 0.05, ease.inOut); if (u <= 0 || !frame0) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  if (u >= 1) { ctx.drawImage(frame0, 0, 0); return; }
  const edge = lerp(-260, W + 160, u);
  for (const [off, al] of [[170, 0.12], [120, 0.24], [76, 0.42], [36, 0.66], [0, 1]]) {
    ctx.save(); ctx.globalAlpha = al; ctx.beginPath(); ctx.moveTo(-20, -20);
    for (let y = -20; y <= H + 20; y += 20) ctx.lineTo(edge + off + 80 * noise1(y / 170, 77) + 26 * noise1(y / 41, 78 + off), y);
    ctx.lineTo(-20, H + 20); ctx.closePath(); ctx.clip(); ctx.drawImage(frame0, 0, 0); ctx.restore();
  }
}

// ------------------------------------------------------------------ main render
function render(t) {
  t = clamp(t, 0, DUR); clampT = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0); LW = 1; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(paper, 0, 0);
  drawHeader(t);

  const z = insetZ(t), gh = ghostU(t);
  // ---------------- base figure
  setView(T0);
  drawPencil(t);
  drawCell(t, T0, false);
  drawMediators(t, 1 - seg(z, 0.1, 0.5));
  drawTrails(t);
  drawProteins(t);
  drawActors(t, T0, false);
  ctx.setTransform(1, 0, 0, 1, 0, 0); LW = 1;

  // ---------------- base annotations
  const lab = (str, x, y, t0, t1, o = {}) => text(str, x, y, { size: 34, italic: true, color: COL.sepia, ...o, alpha: seg(t, t0, t0 + 0.4) * (1 - seg(t, t1, t1 + 0.4)) * (o.alpha ?? 1) });
  lab('Dexamethasone', 72, 548, 1.5, 11.1, { color: COL.vermD, weight: 600, size: 36 });
  { const d0 = dexState(0, t), la = seg(t, 1.7, 2.0) * (1 - seg(t, 3.3, 3.7)); // leader to the first molecule while it drifts in
    leader(150, 560, d0.x + 4, d0.y - 22, seg(t, 1.7, 2.1, ease.out), la); }
  lab('inflammatory mediators', 1012, 540, 0.6, 99, { align: 'right', color: COL.madderD, alpha: lerp(1, 0.45, seg(t, 20.7, 22.1)) * (1 - gh) * (1 - seg(z, 0, 0.3)) });
  { const a = seg(t, 1.5, 1.9) * (1 - gh); leader(705, 1204, 705, 1180, 1, a * 0.9); text('NUCLEUS', 705, 1242, { size: 34, weight: 500, align: 'center', color: COL.violetD, ls: 3, alpha: a }); }
  const ma = 1 - seg(t, 11.1, 11.5);
  callout('1', 140, 704, ...memPt(214, 2), 3.15, ma, t < 5.2);
  { const g0 = grState(0, t); callout('2', 290, 708, g0.x - 6 * g0.s, g0.y - 20 * g0.s, 5.65, ma, t >= 5.2 && t < 9.4); }
  { const P = porePts(215); callout('3', 590, 770, P.at[0] - 6, P.at[1] - 8, 10.05, ma, t >= 9.4 && t < 12.3); }
  { const a = seg(t, 5.9, 6.3) * (1 - seg(t, 9.1, 9.5)); const g0 = grState(0, t);
    tag('GR', g0.x + 46, g0.y + 6, { size: 34, weight: 600, color: COL.indigoD, ls: 2, alpha: a, ta: 0.85 });
    const h = hspPose(0, -1, t), c = Math.cos(h.rot), sn = Math.sin(h.rot);
    const hx = h.x + h.s * (-9 * c - 18 * sn), hy = h.y + h.s * (-9 * sn + 18 * c);  // mid-point of the left protomer
    const ha = a * seg(t, 6.0, 6.4);
    leader(330, 912, hx - 3, hy + 2, seg(t, 6.1, 6.5, ease.out), ha);
    tag('HSP90', 322, 926, { size: 34, weight: 600, color: '#5A3E0E', ls: 1, align: 'right', alpha: ha, ta: 0.85 }); }
  { // result step: pocket-watch right under the tapering mediator plume
    const a = seg(t, 20.2, 20.6) * (1 - gh); drawWatch(884, 702, 56, t, a);
    tag('hours', 806, 716, { size: 36, italic: true, weight: 600, align: 'right', color: COL.verdD, alpha: a, ta: 0.85 });
    tag('(illustrative)', 806, 748, { size: 24, italic: true, align: 'right', color: COL.sepia, alpha: a, ta: 0.85 });
    const pa = seg(t, 21.0, 21.4) * (1 - gh), q = S.prot[S.protLab];
    if (pa > 0.003 && q) { const dx = 3 * Math.sin(t * 1.3 + q[2] * 20), dy = 3 * Math.cos(t * 1.1 + q[2] * 17);
      leader(250, 610, q[0] + dx - 4, q[1] + dy - 6, seg(t, 21.0, 21.4, ease.out), pa);
      tag('new anti-inflammatory proteins', 86, 600, { size: 30, italic: true, weight: 500, color: COL.verdD, alpha: pa, ta: 0.85 }); } }
  { const fa = seg(t, 1.0, 1.5) * (1 - seg(z, 0, 0.3)) * (1 - gh) * 0.9, later = seg(t, 20.65, 21.0);
    text('Fig. 1 — inflamed macrophage, cut away', 72, 1352, { size: 24, italic: true, color: COL.sepia, alpha: fa * (1 - seg(t, 20.3, 20.6)) });
    text('Fig. 1 — the same macrophage, hours later', 72, 1352, { size: 24, italic: true, color: COL.sepia, alpha: fa * later }); }

  // ---------------- inset (enlarged nucleus)
  if (z > 0.001) {
    // ghost the rest of the plate so the eye goes to the enlargement
    ctx.save(); ctx.globalAlpha = 0.94 * seg(z, 0.1, 0.7); ctx.beginPath(); ctx.rect(0, 500, W, 868); ctx.clip(); ctx.drawImage(paper, 0, 0); ctx.restore();
    const T = { cx: N.x, cy: N.y, k: lerp(1, KF, z), ox: lerp(N.x, IC.x, z), oy: lerp(N.y, IC.y, z) };
    const r = lerp(Math.max(N.rx, N.ry) * 1.12, IR, z);
    ctx.save();
    ctx.beginPath(); ctx.arc(T.ox, T.oy, r, 0, TAU); ctx.clip();
    ctx.drawImage(paper, 0, 0);
    setView(T);
    drawCell(t, T, true);
    drawDetail(t, T, seg(z, 0.35, 0.9));
    setView(T);
    for (let i = 0; i < 3; i++) { // GR complexes (with HSP90 until the pore, and bound dex) drawn magnified
      drawHSPs(i, t); const gs = grState(i, t); drawGR(gs, 1, t); const ds = dexState(i, t); drawDex(ds.x, ds.y, ds.rot, ds.sc, 1);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); LW = 1;
    ctx.restore();
    // ring
    const ra = seg(z, 0, 0.12);
    ctx.save(); ctx.globalAlpha = ra; ctx.strokeStyle = rgba(COL.ink, 0.9); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(T.ox, T.oy, r, 0, TAU); ctx.stroke();
    ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(T.ox, T.oy, r + 6, 0, TAU); ctx.stroke(); ctx.restore();
    // gene switches: kept through the zoom-out so the final state shrinks back into the nucleus
    const P = (u, v) => [T.ox + u * (T.k / KF), T.oy + v * (T.k / KF)];
    const swA = seg(z, 0.5, 0.95), swS = SW_SC * (T.k / KF);
    const la = seg(z, 0.8, 1) * (1 - seg(t, 19.15, 19.4));
    for (const g of GENES_ON) { const on = ease.outBack(seg(t, g.t, g.t + 0.32)), oc = clamp(on); const [x, y] = P(g.u, V_UP);
      drawSwitch(x, y, on, Kit.mix(Kit.hex('#B3B8A6'), Kit.hex('#3E9A6E'), oc), COL.verd, oc, swA, swS);
      const c = Kit.mix(Kit.hex('#6E6152'), Kit.hex(COL.verdD), oc); const [lx, ly] = P(g.u, V_UP + LAB_DY);
      tag(g.name, lx, ly, { size: 36, weight: 600, align: 'center', color: rgba(c, 1), alpha: la, ta: 0.85 }); }
    for (const g of GENES_OFF) { const off = seg(t, g.t, g.t + 0.32), on = 1 - ease.outBack(off); const [x, y] = P(g.u, V_DN);
      drawSwitch(x, y, on, Kit.mix(Kit.hex('#C2475E'), Kit.hex('#A98A88'), off), '#D0485F', 0.85 * (1 - off), swA, swS);
      const c = Kit.mix(Kit.hex(COL.madderD), Kit.hex('#867B70'), off); const [lx, ly] = P(g.u, V_DN + LAB_DY);
      tag(g.name, lx, ly, { size: 36, weight: 600, align: 'center', color: rgba(c, 1), alpha: la, ta: 0.85 }); }
    // inset annotations
    if (la > 0.003) {
      text('Fig. 2 — nucleus, enlarged', 72, 548, { size: 26, italic: true, color: COL.sepia, alpha: la * 0.95 });
      { const [x, y] = P(-174, V_UP + LAB_DY); tag('GRE', x, y, { size: 36, weight: 600, align: 'center', color: COL.vermD, ls: 2, alpha: la * seg(t, 12.8, 13.2), ta: 0.85 }); }
      { const [x, y] = P(TF_NF, V_DN + LAB_DY); tag('NF-κB', x, y, { size: 36, weight: 600, align: 'center', color: COL.madderD, alpha: la, ta: 0.85 }); }
      { const [x, y] = P(TF_AP, V_DN + LAB_DY); tag('AP-1', x, y, { size: 36, weight: 600, align: 'center', color: COL.plumD, alpha: la, ta: 0.85 }); }
      { const [x, y] = P(60, -282); tag('anti-inflammatory genes', x, y, { size: 36, italic: true, weight: 500, align: 'center', color: COL.verdD, alpha: la * seg(t, 12.6, 13.0), ta: 0.85 }); }
      { const [x, y] = P(90, 270); tag('inflammatory genes', x, y, { size: 36, italic: true, weight: 500, align: 'center', color: COL.madderD, alpha: la * seg(t, 12.8, 13.2), ta: 0.85 }); }
      const ia = la * (1 - seg(t, 19.2, 19.4));
      { const [mx, my] = P(-175, -284), [tx, ty] = P(-175, -226); callout('4', mx, my, tx, ty, 13.2, ia, t < 15.8); }
      { const [mx, my] = P(-110, -8), [tx, ty] = P(-198, 8); callout('5', mx, my, tx, ty, 15.95, ia, t >= 15.8); }
    }
  }

  drawPanel(t);
  drawCaptions(t);
  drawLoopWipe(t);
}

window.REEL = {
  title: 'How dexamethasone turns down inflammation',
  duration: DUR,
  poster: 18.5,
  canvas,
  fonts: ['500 80px "EB Garamond"', 'italic 500 80px "EB Garamond"', '600 52px "EB Garamond"', 'italic 400 42px "EB Garamond"', 'italic 600 36px "EB Garamond"', '600 36px "EB Garamond"', '400 30px "EB Garamond"', '700 19px "EB Garamond"'],
  async setup() {
    paper = makePaper();
    grainPat = makeGrain();
    buildStatic();
    // protein dot that carries the "new anti-inflammatory proteins" leader (upper-left cytoplasm)
    let best = 1e9; S.prot.forEach((q, i) => { const d = Math.hypot(q[0] - 330, q[1] - 790); if (d < best) { best = d; S.protLab = i; } });
    render(0); // cache the opening frame for the loop wipe
    frame0 = document.createElement('canvas'); frame0.width = W; frame0.height = H; frame0.getContext('2d').drawImage(canvas, 0, 0);
  },
  render,
};
Kit.boot(REEL);
})();
