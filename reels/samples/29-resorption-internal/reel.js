/*
 * 29 — Internal inflammatory root resorption (Resorption series 1/5)
 * Style: LAYERED PAPERCRAFT / SHADOWBOX — cut-paper layers, soft drop shadows, paper grain, parallax, paper tabs.
 * One 2D canvas, deterministic render(t). Evidence: RESEARCH.md section (b); claims + sources: NOTES.md.
 */
(function () {
'use strict';
const { W, H, clamp, lerp, seg, ease, rng, hash } = Kit;
const { canvas, ctx: CTX0 } = Kit.createCanvas();
let ctx = CTX0; // swapped to an offscreen context while the lifted pulp layer is composited
const TAU = Math.PI * 2;
const DUR = 22.4;
const io = ease.inOut, sm = ease.smooth;
const softBack = (x) => { if (x <= 0) return 0; if (x >= 1) return 1; const c1 = 0.95, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const sstep = (a, b, x) => sm(clamp((x - a) / (b - a)));

/* ------------------------------------------------------------------ timeline */
const T = {
  titleOut: 2.4, guide: [0.05, 0.7], flap: [0.6, 0.95, 1.15, 1.5],
  cam1: [2.15, 2.9], lift1: [2.3, 2.8], necro: [2.4, 3.1], tabA: 2.7, tabB: 2.95, plus: 3.35, reqOut: 6.25, lower1: [5.9, 6.3],
  cam2: [6.3, 7.05], peel: [6.75, 7.55], tabC: 7.05, cellsIn: 7.9, grow: [8.25, 10.6], tabD: 8.35, mechOut: 10.75,
  cam3: [10.8, 11.6], lift2: [11.3, 11.7], pull: [11.7, 12.5], e1: 11.6, cut: [12.3, 12.7], e2: 12.3, drop: 12.5, e3: 12.95,
  inset: 13.1, ring: 13.4, gp: [13.6, 13.9], cem: [13.9, 14.3], treatOut: 16.3,
  cam4: [16.4, 17.15], film: [16.55, 17.1], head: 16.75, s1: 17.1, s2: 17.8, s3: 18.5,
  shiftOn: [19.1, 19.8], shiftOff: [20.6, 21.2], endOut: 21.75, camR: [21.7, 22.1], xfade: [22.1, 22.4],
};

/* ------------------------------------------------------------------ palette */
const C = {
  backing: '#1c3036', bone: '#35625f', gum: '#d7a097', pdl: '#183a3e', floor: '#16272c',
  enamel: '#fbf5e6', dentin: '#e9d6b2', cream: '#f5ead4',
  coral: '#e8745c', gran: '#d6543d', coralDk: '#b8412b', necro: '#5d5f64', mauve: '#b6727d',
  teal: '#2c9c90', tealDk: '#124b48', tealTab: '#226b67',
  mustard: '#e4b44e', ink: '#2a2d32', inkSoft: '#5a6567', thread: '#a8322b', thread2: '#86283a',
  film: '#161a1e', xbone: '#444d52', xroot: '#a6aeb0', xpdl: '#1e2429', xld: '#7d878b',
  gp: '#f0977a', cement: '#fffdf4', pink: '#dba59c', frameTeal: '#2a7772',
};
const P = {}; // paper patterns (built in setup)

function makePaper(col, seed, o = {}) {
  const n = 384, c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'), [r, gg, b] = Kit.hex(col);
  const img = g.createImageData(n, n), d = img.data, amp = o.amp != null ? o.amp : 10;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const wn = hash(x, y, seed) - 0.5;
    const lf = Math.sin((x / n) * TAU * 3 + seed) * Math.sin((y / n) * TAU * 2 + seed * 1.7);
    const v = wn * amp * 2 + lf * amp * 0.35, i = (y * n + x) * 4;
    d[i] = clamp(r + v, 0, 255); d[i + 1] = clamp(gg + v, 0, 255); d[i + 2] = clamp(b + v * 0.9, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const R = rng(seed * 7 + 3), nf = o.fibres != null ? o.fibres : 240;
  for (let k = 0; k < nf; k++) {
    const x = R() * n, y = R() * n, a = R() * TAU, L = 6 + R() * 26;
    g.strokeStyle = R() < 0.5 ? `rgba(255,255,255,${o.fl || 0.11})` : `rgba(0,0,0,${o.fd || 0.07})`; g.lineWidth = 0.6 + R() * 0.8;
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + (R() - 0.5) * 6, y + Math.sin(a) * L * 0.5 + (R() - 0.5) * 6, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
  }
  if (o.after) o.after(g, n, R);
  return ctx.createPattern(c, 'repeat');
}

/* ------------------------------------------------------------------ geometry helpers */
function catmull(pts, sub = 10, closed = false) {
  const out = [], n = pts.length, Pt = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]), last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = Pt(i - 1), p1 = Pt(i), p2 = Pt(i + 1), p3 = Pt(i + 2);
    for (let k = 0; k < sub; k++) {
      const u = k / sub, u2 = u * u, u3 = u2 * u;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
/** uniform arc-length resampling of an open polyline */
function resample(pts, step) {
  const out = [pts[0].slice()]; let carry = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); let d = step - carry;
    while (d <= L) { const u = d / L; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); d += step; }
    carry = L - (d - step);
  }
  const l = pts[pts.length - 1], q = out[out.length - 1];
  if (Math.hypot(l[0] - q[0], l[1] - q[1]) > 0.5) out.push(l.slice()); else out[out.length - 1] = l.slice();
  return out;
}
/** scissor-cut look: replace a smooth outline by straight snips of irregular length with a little wobble */
function snip(pts, facet = 22, seed = 1, jit = 0.9, closed = true) {
  const out = []; let acc = 0, next = 0, k = 0; const n = pts.length, lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6;
    while (next <= acc + L) {
      const u = (next - acc) / L, j = (hash(k, seed) - 0.5) * 2 * jit;
      out.push([a[0] + dx * u - (dy / L) * j, a[1] + dy * u + (dx / L) * j]); k++;
      next += facet * (0.6 + 0.8 * hash(k, seed + 99));
    }
    acc += L;
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
const mirror = (pts) => pts.map(([x, y]) => [-x, y]).reverse();
function toPath(pts, closed = true, path) {
  const p = path || new Path2D(); p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  if (closed) p.closePath(); return p;
}
function rrectPts(x, y, w, h, r) {
  const out = [], cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a0] of cs) for (let k = 0; k <= 6; k++) { const a = a0 + (k / 6) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return out;
}

/* ------------------------------------------------------------------ paper primitive */
function paper(path, fill, elev = 4, o = {}) {
  const rule = o.rule || 'nonzero';
  ctx.save();
  if (elev > 0) {
    ctx.shadowColor = `rgba(6,14,18,${o.sa != null ? o.sa : 0.42})`;
    ctx.shadowBlur = 2 + elev * 2.1; ctx.shadowOffsetX = 0.6 + elev * 0.75; ctx.shadowOffsetY = 1 + elev * 1.25;
  }
  ctx.fillStyle = fill; ctx.fill(path, rule);
  ctx.restore();
  if (o.bevel !== false) { // cut-edge highlight (top-left) and shade (bottom-right), light from the top left
    const k = o.k || 1;
    ctx.save(); ctx.clip(path, rule); ctx.lineJoin = 'round';
    const bm = o.bm != null ? o.bm : 1;
    ctx.lineWidth = 2.2 * k; ctx.strokeStyle = `rgba(255,255,255,${(o.hl != null ? o.hl : 0.4) * bm})`; ctx.translate(1.1 * k, 1.5 * k); ctx.stroke(path);
    ctx.strokeStyle = `rgba(0,0,0,${0.15 * bm})`; ctx.translate(-2.2 * k, -3.0 * k); ctx.stroke(path);
    ctx.restore();
  }
}
function txt(s, x, y, font, color, o = {}) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.fillText(s, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}
function tw(s, font, ls = 0) {
  ctx.font = font; if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(s).width; if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'; return w;
}
function brad(x, y, r = 8) { // brass paper fastener
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowColor = 'rgba(6,14,18,0.5)'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 1.5; ctx.shadowOffsetY = 2.5;
  ctx.fillStyle = C.mustard; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.32, r * 0.34, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,10,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r - 0.6, 0, TAU); ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ tooth geometry (tooth space: x = 0 on the long axis, y = 0 at the cusp tips, apex at y = 1100) */
const YC = 730;            // lesion centre (mid-root — a drawing choice, see NOTES)
const JN = 600;            // necrotic (coronal) / vital (apical) junction
const BARE = [640, 820];   // where the predentin layer is lost
const P_CROWN = [[0, 46], [38, 34], [84, 6], [132, 16], [178, 66], [202, 140], [204, 200], [192, 270], [172, 330], [161, 366]];
const P_ROOT = [[161, 366], [154, 430], [143, 540], [127, 680], [108, 810], [86, 930], [62, 1020], [40, 1070], [22, 1094], [9, 1100]];
const P_DEJ = [[0, 112], [42, 100], [84, 80], [120, 94], [146, 140], [156, 205], [151, 275], [154, 330], [161, 366]];
const P_CANAL = [[9, 1100], [12, 1060], [16, 1000], [21, 900], [25, 800], [28, 720], [32, 600], [36, 480], [40, 410], [47, 378], [64, 350], [82, 312], [88, 268], [84, 228], [76, 196], [66, 170], [54, 178], [40, 198], [20, 212], [0, 216]];

const CROWN_R = snip(catmull(P_CROWN, 12), 24, 11, 0.8, false);
const ROOT_DENSE = catmull(P_ROOT, 14);
const ROOT_R = snip(ROOT_DENSE, 30, 12, 0.8, false);
const DEJ_R = snip(catmull(P_DEJ, 10), 22, 13, 0.7, false);
const WALLBASE = resample(catmull(P_CANAL, 20), 3);   // apex -> roof centre, right side
const N_WALL = WALLBASE.length;
let I_JN = 0; while (WALLBASE[I_JN][1] > JN) I_JN++;
function w0At(y) { // canal half-width (canal part only)
  let i = 0; while (i < N_WALL - 1 && WALLBASE[i + 1][1] > y) i++;
  const a = WALLBASE[i], b = WALLBASE[Math.min(N_WALL - 1, i + 1)];
  return a[1] === b[1] ? a[0] : lerp(a[0], b[0], clamp((a[1] - y) / (a[1] - b[1])));
}
function rootHalfAt(y) {
  let i = 0; while (i < ROOT_DENSE.length - 1 && ROOT_DENSE[i + 1][1] < y) i++;
  const a = ROOT_DENSE[i], b = ROOT_DENSE[Math.min(ROOT_DENSE.length - 1, i + 1)];
  return a[1] === b[1] ? a[0] : lerp(a[0], b[0], clamp((y - a[1]) / (b[1] - a[1])));
}
const lesA = (g) => 70 + 62 * g, lesB = (g) => 28 + 50 * g;
function bulgeAt(x0, y, g) { // extra half-width from the lesion (smooth union of canal and ellipse)
  const gate = clamp(g * 12); if (gate <= 0) return 0;
  const u = (y - YC) / lesA(g), e = Math.abs(u) < 1 ? lesB(g) * Math.sqrt(1 - u * u) : 0, d = e - x0;
  return gate * 0.5 * (d + Math.sqrt(d * d + 16));
}
function bulgeWall(g, bites) {
  const out = new Array(N_WALL);
  for (let i = 0; i < N_WALL; i++) {
    let x = WALLBASE[i][0]; const y = WALLBASE[i][1];
    if (y > 430 && y < 1040) {
      x += bulgeAt(x, y, g);
      if (bites) for (const b of bites) { const q = (y - b.y) / 20; if (q > -3 && q < 3) x += b.d * Math.exp(-q * q); }
    }
    out[i] = [x, y];
  }
  return out;
}
function insetWall(wall, fn) {
  const n = wall.length, out = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = wall[Math.max(0, i - 2)], b = wall[Math.min(n - 1, i + 2)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const d = fn(wall[i][1], WALLBASE[i][0]);
    out[i] = [Math.max(0, wall[i][0] + ty * d), wall[i][1] - tx * d];
  }
  out[n - 1][0] = 0;
  return out;
}
function buildGeom(st) {
  const g = st.g, A = lesA(g), B = lesB(g);
  const wall = bulgeWall(g, st.bites);
  const top = Math.min(BARE[0], YC - A - 2), bot = Math.max(BARE[1], YC + A + 2), bare = st.bare;
  const inner = insetWall(wall, (y, x0) => {
    const pd = y < 400 ? 7 : Math.min(7, x0 * 0.32);
    if (bare <= 0) return pd;
    return pd * (1 - bare * sstep(top - 12, top + 4, y) * (1 - sstep(bot - 4, bot + 12, y)));
  });
  const wallL = mirror(wall);
  const dentinPts = DEJ_R.concat(ROOT_R.slice(1), wall, wallL, mirror(ROOT_R).slice(0, -1), mirror(DEJ_R).slice(0, -1));
  const liner = new Path2D();
  const lin2 = inner.map(([x, y], i) => [Math.max(0, x - (wall[i][0] - x > 0.4 ? 1.5 : 0)), y]);
  toPath(wall.concat(lin2.slice().reverse()), true, liner);
  toPath(mirror(wall).concat(mirror(lin2).reverse()), true, liner);
  const api = inner.slice(0, I_JN + 1), cor = inner.slice(I_JN);
  return {
    A, B, wall, inner,
    dentin: toPath(dentinPts), floor: toPath(wall.concat(wallL)), liner,
    apical: toPath(api.concat(mirror(api))),
    coronal: toPath(cor.concat(mirror(cor).slice(1), [[0, JN + 5]])),
  };
}
const ENAMEL = toPath(CROWN_R.concat([[150, 386], [0, 394], [-150, 386]], mirror(CROWN_R).slice(0, -1)));
const PDL = (() => {
  const r = []; for (let y = 446; y <= 1100; y += 10) r.push([rootHalfAt(y) + 10, y]);
  r.push([14, 1110], [0, 1114]);
  return toPath(r.concat(mirror(r).slice(1)));
})();
const BONE = (() => {
  const top = []; for (let x = -1500; x <= 1500; x += 60) top.push([x, 430 + 13 * Math.sin(x * 0.011 + 1) + 7 * Math.sin(x * 0.027)]);
  const p = toPath(snip(catmull(top, 6), 34, 5, 1.2, false).concat([[1500, 2700], [-1500, 2700]]));
  const R = rng(77);
  for (let row = 0, gy = 520; gy < 1800; gy += 116, row++) for (let gx = -1010; gx < 760; gx += 126) {
    const x = gx + (R() - 0.5) * 64 + (row % 2) * 63, y = gy + (R() - 0.5) * 54, r = 15 + R() * 19, el = 0.75 + R() * 0.55, rot = R() * TAU;
    if (R() < 0.16) continue;
    const pts = [];
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, rr = r * (0.78 + 0.4 * hash(i, gx, gy)), ex = Math.cos(a) * rr * el, ey = Math.sin(a) * rr / el; pts.push([x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)]); }
    toPath(catmull(pts, 3, true), true, p);
  }
  return p;
})();
const GUM = (() => {
  const top = [], bot = [];
  for (let x = -1500; x <= 1500; x += 50) {
    top.push([x, 356 - 30 * Math.exp(-(x * x) / (250 * 250)) + 9 * Math.sin(x * 0.012 + 0.6)]);
    bot.push([x, 508 + 12 * Math.sin(x * 0.016 + 2)]);
  }
  return toPath(snip(catmull(top, 5), 30, 21, 1.1, false).concat(snip(catmull(bot, 5), 36, 22, 1.2, false).reverse()));
})();
const PULLTAB = (() => { const p = toPath(snip(rrectPts(-23, 112, 46, 124, 14), 26, 31, 0.6)); p.moveTo(8, 140); p.arc(0, 140, 8, 0, TAU); return p; })();
const FULL = { wall: bulgeWall(1, null) };
// outer silhouette of the tooth (film ghost, clip for the cement plug)
const SIL = toPath(CROWN_R.concat(ROOT_R.slice(1), mirror(ROOT_R), mirror(CROWN_R).slice(1, -1)));
// the two crescents of dentin that will be lost (hook: lifted as a paper flap along the cut line)
const FLAP = (() => {
  const yA = JN - 2, yB = 2 * YC - JN + 2, p = new Path2D();
  const outer = FULL.wall.filter((q) => q[1] > yA && q[1] < yB), inner = WALLBASE.filter((q) => q[1] > yA && q[1] < yB).reverse();
  for (const side of [1, -1]) toPath(outer.concat(inner).map((q) => [side * q[0], q[1]]), true, p);
  return p;
})();
const GUIDE_R = FULL.wall.filter((p) => p[1] > JN - 2 && p[1] < 2 * YC - JN + 2).map((p) => [p[0] + 1.5, p[1]]);
// microbes sprinkled on the necrotic coronal pulp
const MICRO = (() => {
  const R = rng(4242), out = [];
  const half = (y) => { if (y >= 380) return w0At(y); let m = 0; for (let i = I_JN; i < N_WALL; i++) if (Math.abs(WALLBASE[i][1] - y) < 4) m = Math.max(m, WALLBASE[i][0]); return m; };
  for (let k = 0; k < 34; k++) {
    const y = 236 + R() * 350, hw = Math.max(0, half(y) - 13);
    out.push({ x: (R() * 2 - 1) * hw, y, rod: R() < 0.55, rot: R() * TAU, s: 0.8 + R() * 0.5, col: R() < 0.78 ? C.mustard : '#f7e9c8', ph: R() * TAU });
  }
  return out;
})();
// dentinal tubules as faint scored lines (decoration)
const TUBULES = (() => {
  const p = new Path2D();
  for (let y = 440; y < 1060; y += 21) for (const s of [-1, 1]) {
    const x0 = w0At(y) + 3, x1 = rootHalfAt(y - 22) - 5;
    p.moveTo(s * x0, y); p.quadraticCurveTo(s * lerp(x0, x1, 0.5), y - 4, s * x1, y - 22);
  }
  for (let k = 0; k < 15; k++) { const a = Math.PI * (1.08 + (0.84 * k) / 14); p.moveTo(Math.cos(a) * 92, 262 + Math.sin(a) * 70); p.lineTo(Math.cos(a) * 150, 250 + Math.sin(a) * 150); }
  return p;
})();

/* ------------------------------------------------------------------ camera + parallax */
const REF = { x: 750, y: 905 };
const CAMS = {
  hook: { S: 0.9, fy: 550, ax: 540, ay: 1048 },
  wide: { S: 0.97, fy: 550, ax: 750, ay: 905 },
  zoom: { S: 1.5, fy: 720, ax: 750, ay: 900 },
  end: { S: 1.22, fy: 700, ax: 760, ay: 900 },
};
const mixCam = (a, b, u) => ({ S: Math.exp(lerp(Math.log(a.S), Math.log(b.S), u)), fy: lerp(a.fy, b.fy, u), ax: lerp(a.ax, b.ax, u), ay: lerp(a.ay, b.ay, u) });
function camAt(t) {
  if (t < T.cam1[0]) return CAMS.hook;
  if (t < T.cam1[1]) return mixCam(CAMS.hook, CAMS.wide, io(seg(t, T.cam1[0], T.cam1[1])));
  if (t < T.cam2[0]) return CAMS.wide;
  if (t < T.cam3[0]) { const c = mixCam(CAMS.wide, CAMS.zoom, io(seg(t, T.cam2[0], T.cam2[1]))); return { ...c, S: c.S * (1 + 0.03 * seg(t, T.cam2[1], T.cam3[0])) }; }
  if (t < T.cam3[1]) return mixCam({ ...CAMS.zoom, S: CAMS.zoom.S * 1.03 }, CAMS.wide, io(seg(t, T.cam3[0], T.cam3[1])));
  if (t < T.cam4[0]) return CAMS.wide;
  if (t < T.camR[0]) return mixCam(CAMS.wide, CAMS.end, io(seg(t, T.cam4[0], T.cam4[1])));
  return mixCam(CAMS.end, CAMS.hook, io(seg(t, T.camR[0], T.camR[1]))); // back to the hook framing before the loop cross-fade
}
const SW = { x: 0, y: 0 };
const pfOf = (d) => 1 + 0.08 * d;
function layerOf(cam, d) {
  const pf = pfOf(d), s = Math.pow(cam.S, pf);
  return { s, ox: REF.x + (cam.ax - REF.x) * pf + SW.x * (d - 2), oy: REF.y + (cam.ay - REF.y) * pf + SW.y * (d - 2) - cam.fy * s };
}
function setLayer(cam, d, ex = 0, ey = 0) { const L = layerOf(cam, d); ctx.setTransform(L.s, 0, 0, L.s, L.ox + ex, L.oy + ey); return L.s; }
function toScreen(cam, x, y, d = 0, ex = 0) { const L = layerOf(cam, d); return [L.ox + ex + x * L.s, L.oy + y * L.s]; }

/* ------------------------------------------------------------------ state */
const CELL_PHI = [-0.87, 0.05, 0.9];
function cellShape(i, side, r) { // clast: dome hugging the wall, ruffled border on the side facing the dentin (+x)
  const pts = [], n = 30, sd = i * 7 + (side > 0 ? 3 : 5);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU, c = Math.cos(a), front = c > 0.3;
    const rr = r * (0.92 + 0.22 * hash(Math.floor(k / 3), sd) + (front ? (k % 2 ? 0.11 : -0.09) : 0));
    pts.push([c * rr * (c > 0 ? 0.74 : 0.98), Math.sin(a) * rr * 1.2]);
  }
  return toPath(pts);
}
function cellNuclei(i, side, r) {
  const sd = i * 5 + (side > 0 ? 1 : 2), n = 3 + Math.floor(hash(sd, 9) * 2.99), out = [];
  for (let q = 0; q < n; q++) {
    const v = n === 1 ? 0 : q / (n - 1) - 0.5;
    out.push([r * (-0.34 + 0.2 * hash(q, sd) - 0.25 * (0.25 - v * v)), r * (v * 1.36 + 0.1 * (hash(q, sd + 3) - 0.5)), r * (0.17 + 0.07 * hash(q, sd + 7))]);
  }
  return out;
}
function stateAt(t) {
  const st = { t };
  st.g = io(seg(t, T.grow[0], T.grow[1]));
  st.lift = Math.max(sm(seg(t, T.lift1[0], T.lift1[1])) * (1 - sm(seg(t, T.lower1[0], T.lower1[1]))), sm(seg(t, T.lift2[0], T.lift2[1])));
  st.pullY = -1500 * ease.in(seg(t, T.pull[0], T.pull[1]));
  st.pulp = t < T.pull[1];
  st.tab = softBack(seg(t, T.lift2[0], T.lift2[1]));
  st.necroY = t < T.necro[0] ? 0 : lerp(150, JN + 12, io(seg(t, T.necro[0], T.necro[1])));
  st.bare = sm(seg(t, T.peel[0] + 0.05, T.peel[0] + 0.55));
  st.linerA = 1 - sm(seg(t, T.pull[0] + 0.2, T.pull[1]));
  st.cut = seg(t, T.cut[0], T.cut[1]);
  st.flow = 30 * Math.min(t, T.cut[0]);
  st.guide = sm(seg(t, T.guide[0], T.guide[0] + 0.3)) * (1 - sm(seg(t, 10.0, 10.6)));
  st.guideDraw = io(seg(t, T.guide[0], T.guide[1]));
  st.flap = sm(seg(t, T.flap[0], T.flap[1])) * (1 - sm(seg(t, T.flap[2], T.flap[3])));
  st.hl = sm(seg(t, T.peel[0] + 0.2, T.peel[0] + 0.6)) * (1 - sm(seg(t, 8.1, 8.8)));
  // odontoclasts (3 mirrored pairs)
  const A = lesA(st.g), B = lesB(st.g), act = sm(seg(t, T.grow[0] - 0.05, T.grow[0] + 0.35)) * (1 - sm(seg(t, T.grow[1] - 0.15, T.grow[1] + 0.3)));
  st.cells = []; st.bites = [];
  for (let i = 0; i < 3; i++) {
    const phi = CELL_PHI[i] + 0.15 * Math.sin(TAU * (0.19 * t + 0.33 * i)) * clamp(st.g * 3);
    const y = YC + A * Math.sin(phi), x0 = w0At(y), xw = x0 + bulgeAt(x0, y, st.g);
    const chomp = 0.5 - 0.5 * Math.cos(TAU * (1.25 * t + 0.37 * i)), bite = (2 + 5.5 * chomp) * act;
    st.bites.push({ y, d: bite });
    const r = 11.5 + 6 * st.g;
    const nx = Math.cos(phi) / B, ny = Math.sin(phi) / A, nl = Math.hypot(nx, ny), w = clamp(st.g * 3);
    const face = Math.atan2((ny / nl) * w, lerp(1, nx / nl, w));
    for (const side of [1, -1]) {
      const pop = softBack(seg(t, T.cellsIn + 0.1 * i + (side < 0 ? 0.05 : 0), T.cellsIn + 0.42 + 0.1 * i + (side < 0 ? 0.05 : 0)));
      if (pop <= 0) continue;
      const ud = seg(t, T.drop + 0.06 * i + (side < 0 ? 0.04 : 0), T.drop + 0.62 + 0.06 * i + (side < 0 ? 0.04 : 0)), e = ease.in(ud);
      if (ud >= 1) continue;
      const cx = xw + bite * 0.6 - 0.62 * r;
      st.cells.push({
        i, side, r, x: side * (cx - 14 * Math.sin(e * 3)), y: y + 170 * e, rot: (side > 0 ? face : Math.PI - face) + side * 2.4 * e + 0.05 * Math.sin(TAU * (0.6 * t + i * 0.4)) * (1 - e),
        sc: pop * (1 - 0.4 * e), sqx: 1 - 0.55 * sm(seg(ud, 0, 0.5)), a: 1 - sm(seg(ud, 0.62, 1)), chomp: chomp * act,
      });
    }
  }
  if (act <= 0) st.bites = null;
  return st;
}

/* ------------------------------------------------------------------ tooth layers */
function stitch(pts, color, lw, dash, off, k, upto = 1) {
  if (upto <= 0 || pts.length < 2) return;
  const n = Math.max(2, Math.round(pts.length * upto));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0] + 1.1 * k, pts[0][1] + 1.6 * k); for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0] + 1.1 * k, pts[i][1] + 1.6 * k);
  ctx.setLineDash(dash); ctx.lineDashOffset = off; ctx.strokeStyle = 'rgba(20,8,8,0.28)'; ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color; ctx.stroke();
  ctx.restore();
}
function outerThreadPts(side, yEnd) {
  const pts = [];
  for (let y = 1760; y >= yEnd; y -= 8) { const u = (y - 1104) / 656; pts.push([side * 3 + (16 * Math.sin(u * 6.4 + side * 1.3) + side * 26 * u) * Math.pow(clamp(u), 0.8), y]); }
  return pts;
}
function drawOuterThreads(st, t, k) {
  const yEnd = 1104 + 52 * ease.outBack(st.cut);
  for (const side of [-1, 1]) {
    const pts = outerThreadPts(side, yEnd);
    stitch(pts, side < 0 ? C.thread : C.thread2, 3.4, [11, 7], st.flow * (side < 0 ? 1 : 0.8), k);
    if (st.cut > 0.5) { // frayed cut end
      const e = pts[pts.length - 1]; ctx.save(); ctx.strokeStyle = side < 0 ? C.thread : C.thread2; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      for (const a of [-0.6, 0, 0.6]) { ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(e[0] + Math.sin(a + side * 0.3) * 8, e[1] - Math.cos(a) * 9); ctx.stroke(); }
      ctx.restore();
    }
  }
}
function drawInnerThreads(G, st, t, k) {
  const g = st.g, yTop = lerp(800, YC + 20, g);
  for (const side of [-1, 1]) {
    const pts = []; for (let y = 1099; y >= yTop; y -= 7) { const u = (1099 - y) / 300; pts.push([side * (2.6 + 2.4 * Math.sin(u * 5 + side)) * clamp((1099 - y) / 40 + 0.5), y]); }
    const col = side < 0 ? C.thread : C.thread2;
    stitch(pts, col, 3, [10, 7], st.flow * (side < 0 ? 1 : 0.8), k);
    if (g > 0.15) { // small vessels branching into the granulation tissue
      const u = clamp((g - 0.15) / 0.6);
      const twigs = [[YC + 70, 0.36, YC + 46, 0.6, YC - 2], [YC + 34, 0.16, YC - 26, 0.38, YC - 0.55 * G.A]];
      for (const [ya, cxf, cy, exf, ey] of twigs) {
        const br = [];
        for (let q = 0; q <= 14 * u; q++) { const v = q / 14, w = 1 - v; br.push([w * w * side * 3 + 2 * w * v * side * G.B * cxf + v * v * side * G.B * exf, w * w * ya + 2 * w * v * cy + v * v * ey]); }
        stitch(br, col, 2.3, [7, 6], st.flow * 0.7, k);
      }
    }
  }
}
function drawMicrobes(st, t) {
  for (const m of MICRO) {
    const s = softBack(clamp((st.necroY - m.y) / 46)) * m.s; if (s <= 0) continue;
    ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rot + 0.18 * Math.sin(TAU * 0.25 * t + m.ph)); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath();
    if (m.rod) ctx.roundRect(-5.4, -1.3, 12, 4.4, 2.2); else ctx.arc(0.8, 1.1, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = m.col; ctx.beginPath();
    if (m.rod) ctx.roundRect(-6, -2.2, 12, 4.4, 2.2); else ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawPulp(G, st, t, raised, k) {
  const elev = raised ? 14 * st.lift : 0, bm = raised ? clamp(st.lift * 4) : 1;
  ctx.save();
  if (raised) { // lifted like a paper flap hinged at the apex: the crown end comes up about (-9, -13), the vessels stay attached
    ctx.translate(0, 1100 + st.pullY); ctx.rotate(-0.0095 * st.lift); ctx.scale(1 + 0.014 * st.lift, 1 + 0.014 * st.lift); ctx.translate(0, -1100);
  }
  if (raised && st.tab > 0) { ctx.save(); ctx.translate(0, 232); ctx.scale(1, st.tab); ctx.translate(0, -232); paper(PULLTAB, P.cream, elev, { rule: 'evenodd', k }); ctx.restore(); }
  paper(G.apical, P.coral, elev, { k, bevel: raised, bm });
  if (st.g > 0.01) { // granulation tissue filling the defect
    ctx.save(); ctx.clip(G.apical); ctx.globalAlpha *= clamp(st.g * 2.2); ctx.fillStyle = P.gran;
    ctx.beginPath(); ctx.ellipse(0, YC, G.B + 16, G.A + 6, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  drawInnerThreads(G, st, t, k);
  paper(G.coronal, P.coral, elev, { k, bevel: raised, bm });
  if (st.necroY > 160) { // necrotic, infected front advancing from the crown
    ctx.save(); ctx.beginPath(); const y0 = st.necroY; ctx.moveTo(-150, 120); ctx.lineTo(150, 120); ctx.lineTo(150, y0);
    for (let x = 140, q = 0; x >= -150; x -= 10, q++) ctx.lineTo(x, y0 + (q % 2 ? 5 : -4)); ctx.closePath(); ctx.clip();
    ctx.fillStyle = P.necro; ctx.fill(G.coronal);
    if (raised) { ctx.save(); ctx.clip(G.coronal); ctx.lineWidth = 2.2 * k; ctx.strokeStyle = `rgba(255,255,255,${0.25 * bm})`; ctx.translate(1.1 * k, 1.5 * k); ctx.stroke(G.coronal); ctx.restore(); }
    drawMicrobes(st, t);
    ctx.restore();
  }
  ctx.restore();
}
function drawCells(st, k) {
  for (const c of st.cells) {
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(c.sc * c.sqx, c.sc * (1 + 0.06 * c.chomp)); ctx.globalAlpha *= c.a;
    paper(cellShape(c.i, c.side, c.r), P.teal, 3, { k: k / Math.max(0.3, c.sc), hl: 0.3 });
    ctx.fillStyle = C.tealDk;
    for (const nu of cellNuclei(c.i, c.side, c.r)) { ctx.beginPath(); ctx.arc(nu[0], nu[1], nu[2], 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}
function drawPrecursors(st, t, k) {
  const A = lesA(0);
  for (let i = 0; i < 3; i++) for (const side of [1, -1]) for (let q = 0; q < 2; q++) {
    const s0 = T.cellsIn + 0.1 * i + (side < 0 ? 0.05 : 0) - 1.05 - 0.22 * q, u = io(seg(t, s0, s0 + 1.1));
    if (u <= 0 || t > s0 + 1.3) continue;
    const y2 = YC + A * Math.sin(CELL_PHI[i]), x2 = side * (w0At(y2) - 7), w = 1 - u;
    const x = w * w * side * 2 + 2 * w * u * side * 4 + u * u * x2 + 2.2 * Math.sin(u * 9 + q * 2 + i), y = w * w * 1090 + 2 * w * u * 900 + u * u * y2;
    ctx.save(); ctx.globalAlpha *= sm(seg(u, 0, 0.1)) * (1 - sm(seg(t, s0 + 1.02, s0 + 1.25)));
    ctx.shadowColor = 'rgba(6,14,18,0.45)'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 2;
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, y, 5.2, 0, TAU); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.fillStyle = C.tealDk; ctx.beginPath(); ctx.arc(x - 0.6, y, 2, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawPeel(st, t, k) { // predentin strips coming off the wall
  for (const side of [1, -1]) for (let h = 0; h < 2; h++) {
    const s0 = T.peel[0] + 0.1 * h + (side < 0 ? 0.06 : 0), u = ease.out(seg(t, s0, s0 + 0.8));
    if (u <= 0 || u >= 1) continue;
    const yH = h ? BARE[1] : BARE[0], len = (BARE[1] - BARE[0]) / 2, xH = side * (w0At(yH) - 3.5);
    ctx.save(); ctx.translate(xH - side * (9 + 4 * h) * u, yH + (h ? 46 : 70) * u * u); ctx.rotate(side * (h ? -1 : 1) * 0.42 * Math.sin(u * 2.6)); ctx.globalAlpha *= 1 - sm(seg(u, 0.5, 1));
    const p = new Path2D(); p.roundRect(-3.5, h ? -len : 0, 7, len, 3);
    paper(p, P.mauve, 2 + 5 * u, { k, bevel: false });
    ctx.restore();
  }
}
let OFF = null;
function drawRaisedPulp(G, st, t, k) { // always drawn opaque; the short hand-over from the inlaid copy is composited through an offscreen canvas
  const a = clamp(st.lift * 4);
  if (a >= 1) { drawPulp(G, st, t, true, k); return; }
  if (!OFF) { const c = document.createElement('canvas'); c.width = W; c.height = H; OFF = { c, g: c.getContext('2d') }; }
  const main = ctx, m = ctx.getTransform();
  OFF.g.setTransform(1, 0, 0, 1, 0, 0); OFF.g.globalAlpha = 1; OFF.g.clearRect(0, 0, W, H);
  ctx = OFF.g; ctx.setTransform(m);
  drawPulp(G, st, t, true, k);
  ctx = main;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(OFF.c, 0, 0); ctx.restore();
}
function drawTooth(cam, st, G, t) {
  let s = setLayer(cam, -2);
  paper(BONE, P.bone, 5, { rule: 'evenodd', k: 1 / s, hl: 0.16 });
  s = setLayer(cam, -1.2);
  paper(GUM, P.gum, 5, { k: 1 / s, hl: 0.3 });
  s = setLayer(cam, 0); const k = 1 / s;
  ctx.fillStyle = C.pdl; ctx.fill(PDL);
  drawOuterThreads(st, t, k);
  paper(ENAMEL, P.enamel, 5, { k });
  ctx.fillStyle = C.floor; ctx.fill(G.floor);
  if (st.linerA > 0) { ctx.save(); ctx.globalAlpha = st.linerA; ctx.fillStyle = P.mauve; ctx.fill(G.liner); ctx.restore(); }
  if (st.pulp && st.lift < 0.25) drawPulp(G, st, t, false, k);
  paper(G.dentin, P.dentin, 6, { k });
  ctx.save(); ctx.clip(G.dentin); ctx.strokeStyle = 'rgba(120,84,40,0.13)'; ctx.lineWidth = 1.3; ctx.stroke(TUBULES); ctx.restore();
  if (st.hl > 0) { // freshly exposed dentin
    ctx.save(); ctx.globalAlpha = st.hl * (0.7 + 0.3 * Math.sin(TAU * 1.1 * t)); ctx.strokeStyle = '#fffdf0'; ctx.lineWidth = 4.2; ctx.lineCap = 'round';
    for (const side of [1, -1]) { ctx.beginPath(); let f = true; for (const p of G.wall) if (p[1] >= BARE[0] && p[1] <= BARE[1]) { if (f) ctx.moveTo(side * (p[0] + 1), p[1]); else ctx.lineTo(side * (p[0] + 1), p[1]); f = false; } ctx.stroke(); }
    ctx.restore();
  }
  if (st.flap > 0) { // hook: the dentin inside the cut line lifts as a flap and settles (preview of the loss)
    ctx.save(); ctx.translate(-6 * st.flap, -10 * st.flap); paper(FLAP, P.dentin, 14 * st.flap, { k, bm: st.flap }); ctx.restore();
  }
  if (st.guide > 0) { // dashed "cut here" outline of the lesion to come
    ctx.save(); ctx.globalAlpha = 0.9 * st.guide; ctx.translate(-6 * st.flap, -10 * st.flap);
    for (const side of [1, -1]) stitch(GUIDE_R.map((p) => [side * p[0], p[1]]).reverse(), C.coralDk, 5 * k, [13 * k, 9 * k], 0, k, st.guideDraw);
    ctx.restore();
  }
  if (st.pulp && st.lift > 0) drawRaisedPulp(G, st, t, k);
  drawPeel(st, t, k); drawPrecursors(st, t, k); drawCells(st, k);
}

/* ------------------------------------------------------------------ radiograph film (end scene) */
const FILM = { x: 530, y: 660, w: 412, h: 552 };
const SHIFT = { tooth: -54, bone: -80 }; // px the film image slides on the cone shift (bone further: parallax)
let FILM_MOUNT, FILM_SHEET, FILM_IMG, XDENTIN, CHIP3;
const DARROW = (() => { const L = 58, h = 6.5, a = 22, w = 16, p = new Path2D(); p.moveTo(-L, 0); p.lineTo(-L + a, -w); p.lineTo(-L + a, -h); p.lineTo(L - a, -h); p.lineTo(L - a, -w); p.lineTo(L, 0); p.lineTo(L - a, w); p.lineTo(L - a, h); p.lineTo(-L + a, h); p.lineTo(-L + a, w); p.closePath(); return p; })();
function shiftAt(t) { return sm(seg(t, T.shiftOn[0], T.shiftOn[1])) * (1 - sm(seg(t, T.shiftOff[0], T.shiftOff[1]))); }
function badge(x, y, n, u) {
  if (u <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(u, u);
  const p = new Path2D(); p.arc(0, 0, 25, 0, TAU); paper(p, P.coral, 4, { hl: 0.35 });
  txt(String(n), 0, 1, '800 36px Fraunces', C.cream, { align: 'center', base: 'middle' });
  ctx.restore();
}
/** canal-wall tracing on the film: coral dashes in a dark casing, drawn on up to `upto` */
function trace(pts, k, upto) {
  if (upto <= 0 || pts.length < 2) return;
  const n = Math.max(2, Math.round(pts.length * upto));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([11 * k, 11 * k]);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = 'rgba(16,20,24,0.92)'; ctx.lineWidth = 10 * k; ctx.stroke();
  ctx.strokeStyle = '#ff9274'; ctx.lineWidth = 5.5 * k; ctx.stroke();
  ctx.restore();
}
function drawFilm(t, cam) {
  const uin = softBack(seg(t, T.film[0], T.film[1])); if (seg(t, T.film[0], T.film[1]) <= 0) return;
  const uout = ease.in(seg(t, T.endOut, T.endOut + 0.31)); if (uout >= 1) return;
  const dxo = uout * 720, dx = (1 - uin) * 660 + dxo, rot = 0.012 + (1 - uin) * 0.07 + uout * 0.07, sh = shiftAt(t);
  if (t >= T.camR[0]) cam = CAMS.end; // on the way out the film is a rigid card: its image keeps the end framing and rides with it
  const place = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(FILM.x + dx + FILM.w / 2, FILM.y + FILM.h / 2); ctx.rotate(rot); ctx.translate(-FILM.w / 2, -FILM.h / 2); };
  place(); paper(FILM_MOUNT, P.cream, 9); paper(FILM_SHEET, P.film, 1.5, { hl: 0.1 });
  ctx.save(); ctx.clip(FILM_IMG);
  let s = setLayer(cam, -2, SHIFT.bone * sh + dxo);
  paper(BONE, P.xbone, 3, { rule: 'evenodd', bevel: false });
  s = setLayer(cam, 0, SHIFT.tooth * sh + dxo); const k = 1 / s;
  ctx.lineJoin = 'round'; ctx.strokeStyle = C.xld; ctx.lineWidth = 7; ctx.stroke(PDL); ctx.fillStyle = C.xpdl; ctx.fill(PDL);
  paper(XDENTIN, P.xroot, 3, { k, hl: 0.25 });
  // sign 3: dashed ghost of the root outline where it was before the shift (only where the shifted root has left it)
  if (sh > 0.01) {
    ctx.save(); const out = new Path2D(); out.rect(-4000, -4000, 8000, 8000); out.addPath(SIL); ctx.clip(out, 'evenodd');
    setLayer(cam, 0, dxo); ctx.globalAlpha = clamp(sh * 2.5) * 0.9; ctx.lineCap = 'round'; ctx.setLineDash([10 * k, 9 * k]);
    ctx.strokeStyle = 'rgba(16,20,24,0.7)'; ctx.lineWidth = 6.5 * k; ctx.stroke(SIL);
    ctx.strokeStyle = '#f7ecd2'; ctx.lineWidth = 3.4 * k; ctx.stroke(SIL);
    ctx.restore(); setLayer(cam, 0, SHIFT.tooth * sh + dxo);
  }
  // sign 1: equal half-widths either side of the canal (no axis line: nothing may be traceable through the lesion)
  const a1 = sm(seg(t, T.s1 + 0.25, T.s1 + 0.7));
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    for (const side of [1, -1]) {
      const x1 = side * (6 + (lesB(1) - 12) * a1); const p = new Path2D();
      p.moveTo(side * 6, YC - 3.2); p.lineTo(x1 - side * 12, YC - 3.2); p.lineTo(x1 - side * 12, YC - 10); p.lineTo(x1, YC); p.lineTo(x1 - side * 12, YC + 10); p.lineTo(x1 - side * 12, YC + 3.2); p.lineTo(side * 6, YC + 3.2); p.closePath();
      paper(p, P.coral, 2, { bevel: false });
    }
    ctx.restore();
  }
  // sign 2: the canal walls can be traced only up to the lesion margin, where a stop mark ends each tracing
  const a2 = sm(seg(t, T.s2 + 0.15, T.s2 + 0.7));
  if (a2 > 0) {
    for (const side of [1, -1]) {
      const up = FULL.wall.filter((p) => p[1] < JN - 4 && p[1] > 470).map((p) => [side * (p[0] + 4), p[1]]).reverse();
      const lo = FULL.wall.filter((p) => p[1] > 2 * YC - JN + 4 && p[1] < 1010).map((p) => [side * (p[0] + 4), p[1]]);
      for (const seg2 of [up, lo]) {
        trace(seg2, k, a2);
        const e = seg2[seg2.length - 1], um = softBack(seg(t, T.s2 + 0.6, T.s2 + 0.85));
        if (um > 0) { // stop mark across the end of the tracing
          ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(e[0] - 13 * um, e[1]); ctx.lineTo(e[0] + 13 * um, e[1]);
          ctx.strokeStyle = 'rgba(16,20,24,0.92)'; ctx.lineWidth = 11 * k; ctx.stroke(); ctx.strokeStyle = '#ff9274'; ctx.lineWidth = 6.5 * k; ctx.stroke(); ctx.restore();
        }
      }
    }
  }
  ctx.restore();
  // glossy edge of the film
  place(); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2; ctx.stroke(FILM_SHEET);
  // sign 3 chip clipped to the top edge of the film: a paper double arrow = the image slides on a cone shift
  const u3 = softBack(seg(t, T.s3 + 0.15, T.s3 + 0.5));
  if (u3 > 0) {
    place(); ctx.translate(FILM.w / 2 + 22, -18); ctx.rotate(-0.012); ctx.scale(u3, u3);
    paper(CHIP3, P.cream, 6);
    ctx.save(); ctx.translate(18 - 9 * sh, 0); paper(DARROW, P.coral, 2, { hl: 0.3 }); ctx.restore();
    const M = ctx.getTransform(), q = new DOMPoint(-92, 0).matrixTransform(M);
    badge(q.x, q.y, 3, u3);
  }
  // numbered call-outs pinned on the film (they ride with the image)
  const jx = FULL.wall.reduce((b, p) => (Math.abs(p[1] - (JN - 4)) < Math.abs(b[1] - (JN - 4)) ? p : b), FULL.wall[0])[0] + 4;
  const p1 = toScreen(cam, -lesB(1) - 26, YC - 74, 0, SHIFT.tooth * sh), p2 = toScreen(cam, jx, JN - 4, 0, SHIFT.tooth * sh);
  badge(p1[0] + dx, p1[1], 1, softBack(seg(t, T.s1 + 0.15, T.s1 + 0.5)));
  badge(p2[0] + 44 + dx, p2[1] - 4, 2, softBack(seg(t, T.s2 + 0.15, T.s2 + 0.5)));
}

/* ------------------------------------------------------------------ paper tabs */
const F = {
  cap38: '900 38px Nunito', cap36: '900 36px Nunito', cap34: '900 34px Nunito', over: '800 30px Nunito', role: 'italic 600 42px Fraunces', role40: 'italic 600 40px Fraunces',
  sign: '800 38px Nunito', lab30: '800 30px Nunito', head: '800 60px Fraunces', headSub: '800 34px Nunito', fine: '600 24px Nunito', tag: '800 27px Nunito', tagB: '900 27px Nunito', handle: '700 26px Nunito', num: '800 46px Fraunces',
};
const TABS = [
  { id: 'A', x: 64, y: 498, stripe: 'necro', seed: 3, rot: -0.008, in: T.tabA, out: T.reqOut, lead: () => [-46, 268],
    lines: [{ t: 'NECROTIC,', f: F.cap38, ls: 0.5 }, { t: 'INFECTED PULP', f: F.cap38, ls: 0.5 }, { t: 'the stimulus', f: F.role, c: C.coralDk, lh: 1.22 }] },
  { id: 'B', x: 64, y: 960, stripe: 'coral', seed: 4, rot: 0.007, in: T.tabB, out: T.reqOut + 0.06, lead: () => [-9, 905],
    lines: [{ t: 'VITAL PULP', f: F.cap38, ls: 0.5 }, { t: 'the blood supply', f: F.role, c: C.coralDk, lh: 1.22 }] },
  { id: 'C', x: 64, y: 606, stripe: 'mauve', seed: 5, rot: -0.006, in: T.tabC, out: T.mechOut, lead: (G) => { let b = G.wall[0]; for (const q of G.wall) if (Math.abs(q[1] - 700) < Math.abs(b[1] - 700)) b = q; return [-(b[0] + 2), b[1]]; },
    lines: [{ t: 'PREDENTIN LOST', f: F.cap36, ls: 0.5 }, { t: 'DENTIN EXPOSED', f: F.cap36, ls: 0.5, c: C.coralDk, arrow: true }] },
  { id: 'D', x: 64, y: 806, stripe: 'teal', seed: 6, rot: 0.008, in: T.tabD, out: T.mechOut + 0.06, lead: (G, st) => { const c = st.cells.find((q) => q.i === 2 && q.side < 0); return c ? [c.x - 4, c.y] : [-20, 790]; },
    lines: [{ t: 'ODONTOCLASTS', f: F.cap38, ls: 0.5 }, { t: 'resorb the dentin', f: F.role40, c: C.tealTab, lh: 1.22 }] },
  { id: 'E1', x: 64, y: 498, stripe: 'coral', seed: 7, rot: -0.007, in: T.e1, out: T.treatOut, lines: [{ t: 'PULP OUT', f: F.cap36, ls: 0.5 }] },
  { id: 'E2', x: 64, y: 640, stripe: 'thread', seed: 8, rot: 0.006, in: T.e2, out: T.treatOut + 0.04, chev: true, lines: [{ t: 'BLOOD SUPPLY CUT', f: F.cap36, ls: 0.3 }] },
  { id: 'E3', x: 64, y: 782, stripe: 'cream', seed: 9, rot: -0.005, in: T.e3, out: T.treatOut + 0.08, chev: true, fill: 'tealTab', ink: C.cream, lines: [{ t: 'RESORPTION STOPS', f: F.cap36, ls: 0.3 }] },
  { id: 'H', x: 64, y: 340, stripe: 'coral', seed: 10, rot: -0.006, in: T.head, out: T.endOut, fill: 'ink', ink: C.cream,
    lines: [{ t: 'Internal', f: F.head, lh: 1.02 }, { t: 'resorption', f: F.head, lh: 1.12 }, { t: 'classic X-ray signs', f: F.headSub, c: '#f6a48d', lh: 1.3 }] },
  { id: 'S1', x: 64, y: 586, num: 1, seed: 11, rot: 0.006, in: T.s1, out: T.endOut + 0.03,
    lines: [{ t: 'Symmetric,', f: F.sign, c: C.coralDk }, { t: 'well-defined', f: F.sign }, { t: 'ballooning', f: F.sign }] },
  { id: 'S2', x: 64, y: 806, num: 2, seed: 12, rot: -0.006, in: T.s2, out: T.endOut + 0.06,
    lines: [{ t: 'Canal outline lost', f: F.sign, hi: [14, 18] }, { t: 'in the lesion', f: F.sign }] },
  { id: 'S3', x: 64, y: 980, num: 3, seed: 13, rot: 0.005, in: T.s3, out: T.endOut + 0.09,
    lines: [{ t: 'Cone shift:', f: F.sign }, { t: 'stays on canal', f: F.sign, hi: [6, 14] }] },
];
function setupTabs() {
  for (const tb of TABS) {
    let h = tb.padT != null ? tb.padT : 16, wmax = 0;
    for (const L of tb.lines) {
      L.size = +/(\d+)px/.exec(L.f)[1]; L.w = tw(L.t, L.f, L.ls || 0) + (L.arrow ? 46 : 0);
      L.y = h + L.size * 0.84; h += L.size * (L.lh || 1.18); wmax = Math.max(wmax, L.w);
    }
    tb.sw = tb.num ? 60 : 18; tb.h = Math.ceil(h + 14); tb.w = Math.ceil(tb.sw + 20 + wmax + 24);
    tb.path = toPath(snip(rrectPts(0, 0, tb.w, tb.h, 13), 36, tb.seed * 13, 0.7));
  }
}
const ARROW = (() => { const p = new Path2D(); p.moveTo(0, -4.5); p.lineTo(20, -4.5); p.lineTo(20, -12); p.lineTo(36, 0); p.lineTo(20, 12); p.lineTo(20, 4.5); p.lineTo(0, 4.5); p.closePath(); return p; })();
const CHEV = (() => { const p = new Path2D(); p.moveTo(-18, -10); p.lineTo(0, 2); p.lineTo(18, -10); p.lineTo(18, 2); p.lineTo(0, 14); p.lineTo(-18, 2); p.closePath(); return p; })();
const PLUS = (() => { const a = 9, b = 28, p = new Path2D(); p.moveTo(-a, -b); p.lineTo(a, -b); p.lineTo(a, -a); p.lineTo(b, -a); p.lineTo(b, a); p.lineTo(a, a); p.lineTo(a, b); p.lineTo(-a, b); p.lineTo(-a, a); p.lineTo(-b, a); p.lineTo(-b, -a); p.lineTo(-a, -a); p.closePath(); return p; })();
let PLUS_AT = [240, 814];
function tabMotion(tb, t) {
  const uin = softBack(seg(t, tb.in, tb.in + 0.45)), uout = ease.in(seg(t, tb.out, tb.out + 0.28));
  if (seg(t, tb.in, tb.in + 0.45) <= 0 || uout >= 1) return null;
  const travel = tb.x + tb.w + 70;
  return { dx: -travel * (1 - uin) - travel * uout, rot: (tb.rot || 0) - 0.06 * (1 - Math.min(1, uin)) };
}
function drawTab(tb, m) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(tb.x + m.dx + tb.w / 2, tb.y + tb.h / 2); ctx.rotate(m.rot); ctx.translate(-tb.w / 2, -tb.h / 2);
  paper(tb.path, P[tb.fill || 'cream'], 6, { hl: tb.fill ? 0.2 : 0.45 });
  ctx.save(); ctx.clip(tb.path);
  ctx.fillStyle = P[tb.num ? 'coral' : tb.stripe || 'coral']; ctx.fillRect(0, 0, tb.sw, tb.h);
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(tb.sw, 0, 2, tb.h);
  if (tb.stripe === 'necro') { ctx.fillStyle = C.mustard; for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.arc(9 + (q % 2 ? 3 : -2), 26 + q * ((tb.h - 50) / 4), 2.6, 0, TAU); ctx.fill(); } }
  ctx.restore();
  if (tb.num) txt(String(tb.num), tb.sw / 2, tb.h / 2 + 2, F.num, C.cream, { align: 'center', base: 'middle' });
  const x0 = tb.sw + 20;
  for (const L of tb.lines) {
    let x = x0;
    if (L.arrow) { ctx.save(); ctx.translate(x, L.y - L.size * 0.34); paper(ARROW, P.coral, 1.5, { bevel: false }); ctx.restore(); x += 46; }
    const col = L.c || tb.ink || C.ink;
    if (L.hi) { // one key word in the accent colour
      const a = L.t.slice(0, L.hi[0]), b = L.t.slice(L.hi[0], L.hi[1]), c = L.t.slice(L.hi[1]);
      txt(a, x, L.y, L.f, col); x += tw(a, L.f); txt(b, x, L.y, L.f, C.coralDk); x += tw(b, L.f); txt(c, x, L.y, L.f, col);
    } else txt(L.t, x, L.y, L.f, col, { ls: L.ls || 0 });
  }
}
function leaderStrip(x0, y0, x1, y1, u, col = C.cream, lw = 6.5) {
  if (u <= 0) return;
  const x = lerp(x0, x1, u), y = lerp(y0, y1, u);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(6,14,18,0.42)'; ctx.shadowBlur = 7; ctx.shadowOffsetX = 2.5; ctx.shadowOffsetY = 4;
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
  ctx.restore();
  if (u > 0.97) brad(x1, y1, 8.5);
}

/* ------------------------------------------------------------------ inset: if the wall is perforated */
const INS = { x: 64, y: 884, w: 436, h: 462, wx: 18, wy: 72, ww: 400, wh: 290, S: 0.85, fx: -52, fy: 752 };
let INS_CARD, INS_WIN, INS_GEO, INS_HEAD;
function setupInset() {
  const card = toPath(snip(rrectPts(0, 0, INS.w, INS.h, 16), 40, 71, 0.8));
  const win = rrectPts(INS.wx, INS.wy, INS.ww, INS.wh, 18).reverse(); toPath(win, true, card);
  INS_CARD = card; INS_WIN = toPath(rrectPts(INS.wx - 2, INS.wy - 2, INS.ww + 4, INS.wh + 4, 20));
  const st = { g: 1, bare: 1, bites: null }, G = buildGeom(st);
  const yT = YC - 24, yB = YC + 24, xo = rootHalfAt(YC);
  const les = FULL.wall.filter((p) => p[1] > JN - 6 && p[1] < 2 * YC - JN + 6);
  const chan = [[-70, yT], [-(xo + 12), yT - 3], [-(xo + 12), yB + 3], [-70, yB]];
  // the plug ends flush with the outer root surface (it is also clipped to the root silhouette when drawn)
  const plug = [[-70, yT - 1], [-(rootHalfAt(yT - 2) - 1), yT - 2], [-(xo - 1), YC], [-(rootHalfAt(yB + 2) - 1), yB + 2], [-70, yB + 1]];
  const cem = toPath(les.concat(mirror(les))); toPath(plug, true, cem);
  const gpPts = FULL.wall.filter((p) => p[1] > 2 * YC - JN - 6).map((p) => [Math.max(2, p[0] - 0.5), p[1]]);
  const ring = new Path2D(); ring.arc(0, 0, 40, 0, TAU); ring.moveTo(32, 0); ring.arc(0, 0, 32, 0, TAU, true);
  INS_GEO = { G, chan: toPath(chan), cem, gp: toPath(gpPts.concat(mirror(gpPts))), ring, px: -(lesB(1) + xo) / 2 };
  const w36 = tw('CBCT: PERFORATED?', F.cap36, 0.5);
  INS_HEAD = Math.max(30, Math.min(36, Math.floor((36 * (INS.w - 44)) / w36)));
}
function drawInset(t) {
  const tb = { x: INS.x, w: INS.w, in: T.inset, out: T.treatOut + 0.12, rot: 0.005 }, m = tabMotion(tb, t); if (!m) return;
  const place = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(INS.x + m.dx + INS.w / 2, INS.y + INS.h / 2); ctx.rotate(m.rot); ctx.translate(-INS.w / 2, -INS.h / 2); };
  place(); ctx.save(); ctx.clip(INS_WIN);
  ctx.fillStyle = P.backing; ctx.fillRect(INS.wx - 4, INS.wy - 4, INS.ww + 8, INS.wh + 8);
  const S = INS.S, cx = INS.wx + INS.ww / 2, cy = INS.wy + INS.wh / 2;
  const sub = (d) => { place(); ctx.translate(cx, cy); const s = S * (1 + 0.03 * d); ctx.scale(s, s); ctx.translate(-INS.fx, -INS.fy); return 1 / s; };
  let k = sub(-2); paper(BONE, P.bone, 4, { rule: 'evenodd', k, hl: 0.16 });
  k = sub(0); ctx.fillStyle = C.pdl; ctx.fill(PDL); ctx.fillStyle = C.floor; ctx.fill(INS_GEO.G.floor);
  paper(INS_GEO.G.dentin, P.dentin, 5, { k });
  ctx.fillStyle = C.pdl; ctx.fill(INS_GEO.chan);
  const ug = io(seg(t, T.gp[0], T.gp[1]));
  if (ug > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-60, 2 * YC - JN - 10, 120, 16 + 260 * ug); ctx.clip(); paper(INS_GEO.gp, P.gp, 1.5, { k, hl: 0.3 }); ctx.restore(); }
  const uc = softBack(seg(t, T.cem[0], T.cem[1]));
  if (uc > 0) {
    ctx.save(); ctx.clip(SIL); ctx.translate(-20, YC); ctx.scale(0.55 + 0.45 * uc, 0.55 + 0.45 * uc); ctx.translate(20, -YC); ctx.globalAlpha = clamp(uc * 2.5);
    ctx.lineJoin = 'round'; ctx.strokeStyle = C.mauve; ctx.lineWidth = 6 * k; ctx.stroke(INS_GEO.cem); // mauve cut edge (outer half shows)
    paper(INS_GEO.cem, P.cement, 2 + 6 * (1 - Math.min(1, uc)), { k, hl: 0.5 }); ctx.restore();
  }
  // coral ring marks the perforation, pulses once, and leaves when the cement is in
  const ur = softBack(seg(t, T.ring, T.ring + 0.3)) * (1 - sm(seg(t, T.cem[1] - 0.1, T.cem[1] + 0.25)));
  if (ur > 0) {
    const pulse = 1 + 0.22 * Math.sin(Math.PI * seg(t, T.ring + 0.3, T.ring + 0.65));
    ctx.save(); ctx.translate(INS_GEO.px, YC); ctx.scale(ur * pulse, ur * pulse); paper(INS_GEO.ring, P.coral, 3, { rule: 'evenodd', k, hl: 0.3 }); ctx.restore();
  }
  ctx.restore();
  place(); paper(INS_CARD, P.cream, 7, { rule: 'evenodd' });
  // header
  const hf = `900 ${INS_HEAD}px Nunito`;
  txt('CBCT: PERFORATED', 22, 50, hf, C.ink, { ls: 0.5 }); txt('?', 22 + tw('CBCT: PERFORATED', hf, 0.5) + 4, 50, hf, C.coralDk);
  // label (on the card from the start, so it can be read)
  txt('CALCIUM SILICATE', 22, INS.wy + INS.wh + 44, F.lab30, C.ink, { ls: 0.4 });
  txt('CEMENT', 22, INS.wy + INS.wh + 80, F.lab30, C.ink, { ls: 0.4 }); txt('(e.g. MTA)', 22 + tw('CEMENT ', F.lab30, 0.4) + 6, INS.wy + INS.wh + 80, '700 30px Nunito', C.inkSoft);
  // paper-strip leader from the label to the cement
  const ul = sm(seg(t, T.cem[1] - 0.05, T.cem[1] + 0.3));
  if (ul > 0) {
    const M = ctx.getTransform(), a = new DOMPoint(cx + (4 - INS.fx) * S, cy + (YC + 84 - INS.fy) * S).matrixTransform(M), b = new DOMPoint(190, INS.wy + INS.wh + 16).matrixTransform(M);
    leaderStrip(b.x, b.y, a.x, a.y, ul, C.ink, 5.5);
  }
}

/* ------------------------------------------------------------------ fixed furniture: tag, handle, fine print, title, mat */
let TAG_PATH, TITLE = { size: 92, w: 0 }, SUB_PATH, MAT;
const FINE = [
  [0, 'schematic · not to scale'],
  [2.75, 'schematic · Abbott & Lin 2022, Dent Traumatol'],
  [6.7, 'schematic · Patel et al. 2022, Int Endod J'],
  [16.7, 'schematic · Patel 2022, Int Endod J; Thomas 2014, ISRN Dent'],
  [21.78, 'schematic · not to scale'], // flips back before the loop cross-fade starts
];
const TAG_Y = 284, TITLE_Y = 416, SUB_TXT = 'dead pulp above, live pulp below';
function drawFurniture(t) {
  // corner tag
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(66, TAG_Y); ctx.rotate(-0.014 + 0.004 * Math.sin(TAU * t / 11));
  paper(TAG_PATH, P.cream, 5, { rule: 'evenodd' });
  txt('RESORPTION 1/5', 50, 10, F.tag, C.ink, { ls: 1.2 });
  const w1 = tw('RESORPTION 1/5', F.tag, 1.2);
  ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(50 + w1 + 13, 1, 4, 0, TAU); ctx.fill();
  txt('INTERNAL', 50 + w1 + 27, 10, F.tagB, C.coralDk, { ls: 1.6 });
  brad(66 + 21, TAG_Y, 7);
  // handle
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const hw = tw('@natebrooksendo', F.handle), hp = new Path2D(); hp.roundRect(1012 - hw - 30, TAG_Y - 22, hw + 30, 44, 10);
  paper(hp, P.ink, 4, { hl: 0.14 }); txt('@natebrooksendo', 1012 - 15, TAG_Y + 9, F.handle, C.cream, { align: 'right' });
  // fine print label (flips when the text changes)
  let idx = 0; for (let i = 0; i < FINE.length; i++) if (t >= FINE[i][0]) idx = i;
  const since = t - FINE[idx][0], flip = idx > 0 && since < 0.3 ? since / 0.3 : 1;
  const show = flip < 0.5 && idx > 0 ? FINE[idx - 1][1] : FINE[idx][1], sy = Math.abs(Math.cos(Math.PI * flip)) < 0.02 ? 0.02 : Math.abs(Math.cos(Math.PI * flip));
  const fw = tw(show, F.fine) + 30, fp = new Path2D(); fp.roundRect(0, -21, fw, 42, 9);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(64, 1552); ctx.scale(1, flip >= 1 ? 1 : sy);
  paper(fp, P.ink, 4, { hl: 0.14 }); txt(show, 15, 8, F.fine, '#efe3cb');
}
function drawTitle(t) { // exits upward, fading out over the first 60% of its travel so it never crosses the tag
  const u = ease.in(seg(t, T.titleOut, T.titleOut + 0.38)); if (u >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, -90 * u); ctx.globalAlpha = 1 - sm(clamp(u / 0.6));
  ctx.shadowColor = 'rgba(4,10,14,0.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 7;
  txt('Internal resorption', W / 2, TITLE_Y, `900 ${TITLE.size}px Fraunces`, P.cream, { align: 'center' });
  ctx.restore();
  const u2 = ease.in(seg(t, T.titleOut + 0.06, T.titleOut + 0.44)); if (u2 >= 0.6) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, -110 * u2); ctx.translate(W / 2 - SUB_PATH.w / 2, TITLE_Y + 34); ctx.rotate(-0.008); ctx.globalAlpha = 1 - sm(clamp(u2 / 0.6));
  paper(SUB_PATH.path, P.coralDk, 6, { hl: 0.25 });
  txt(SUB_TXT, SUB_PATH.w / 2, 46, '800 38px Nunito', '#fff8ea', { align: 'center' });
  ctx.restore();
}
function buildMat() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  // vignette inside the box
  const vg = g.createRadialGradient(W / 2, H * 0.47, 520, W / 2, H * 0.47, 1180);
  vg.addColorStop(0, 'rgba(4,10,14,0)'); vg.addColorStop(1, 'rgba(4,10,14,0.42)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const ring = (inset, r, fill, seed, elev) => {
    const p = new Path2D(); p.rect(-40, -40, W + 80, H + 80);
    toPath(snip(rrectPts(inset, inset + 8, W - 2 * inset, H - 2 * inset - 16, r), 70, seed, 1.3).reverse(), true, p);
    g.save(); g.shadowColor = 'rgba(4,10,14,0.55)'; g.shadowBlur = 4 + elev * 2.4; g.shadowOffsetX = 1 + elev * 0.8; g.shadowOffsetY = 2 + elev * 1.3;
    g.fillStyle = fill; g.fill(p, 'evenodd'); g.restore();
    g.save(); g.clip(p, 'evenodd'); g.lineWidth = 2.4; g.strokeStyle = 'rgba(255,255,255,0.35)'; g.translate(1.2, 1.6); g.stroke(p); g.restore();
  };
  ring(52, 30, P.frameTeal, 81, 7); ring(38, 36, P.pink, 82, 6); ring(22, 44, P.cream, 83, 8);
  return c;
}

/* ------------------------------------------------------------------ frame */
function drawScene(t) {
  const cam = camAt(t);
  SW.x = 2.2 * Math.sin(TAU * t / 11); SW.y = 1.3 * Math.sin(TAU * t / 11 + 1.2);
  const st = stateAt(t), G = buildGeom(st);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = P.backing; ctx.fillRect(0, 0, W, H);
  drawTooth(cam, st, G, t);
  drawFilm(t, cam);
  // leaders, then tabs
  const act = [];
  for (const tb of TABS) { const m = tabMotion(tb, t); if (m) act.push([tb, m]); }
  for (const [tb, m] of act) if (tb.lead) {
    const p = tb.lead(G, st), q = toScreen(cam, p[0], p[1]);
    leaderStrip(tb.x + m.dx + tb.w - 8, tb.y + tb.h * 0.5, q[0], q[1], sm(seg(t, tb.in + 0.3, tb.in + 0.62)) * (1 - seg(t, tb.out - 0.16, tb.out)));
  }
  for (const [tb, m] of act) {
    if (tb.chev) { ctx.setTransform(1, 0, 0, 1, m.dx, 0); ctx.translate(tb.x + 92, tb.y - 30); paper(CHEV, P.cream, 4, { hl: 0.5 }); }
    drawTab(tb, m);
  }
  // "+" on a paper disc between the two requirements
  const up = softBack(seg(t, T.plus, T.plus + 0.4)) * (1 - ease.in(seg(t, T.reqOut - 0.05, T.reqOut + 0.2)));
  if (up > 0) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(PLUS_AT[0], PLUS_AT[1]); ctx.scale(up, up);
    const disc = new Path2D(); disc.arc(0, 0, 46, 0, TAU); paper(disc, P.cream, 6);
    ctx.rotate(0.6 * (1 - up)); ctx.scale(1.4, 1.4); paper(PLUS, P.coral, 1.5, { hl: 0.3 });
  }
  drawInset(t);
  drawTitle(t);
  drawFurniture(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(MAT, 0, 0);
}
let F0 = null;
function render(t) {
  t = clamp(t, 0, DUR);
  const xf = sm(seg(t, T.xfade[0], T.xfade[1]));
  if (xf > 0) { // loop: cross-fade back to the first frame (all end-card text has left by then)
    if (!F0) { F0 = document.createElement('canvas'); F0.width = W; F0.height = H; }
    drawScene(0); F0.getContext('2d').drawImage(canvas, 0, 0);
    drawScene(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = xf; ctx.drawImage(F0, 0, 0); ctx.globalAlpha = 1;
  } else drawScene(t);
}

/* ------------------------------------------------------------------ boot */
window.REEL = {
  title: 'Internal inflammatory root resorption',
  duration: DUR,
  poster: 20.2,
  canvas,
  fonts: ['900 92px Fraunces', '800 60px Fraunces', '800 46px Fraunces', '800 36px Fraunces', 'italic 600 42px Fraunces', 'italic 600 40px Fraunces',
    '900 38px Nunito', '900 36px Nunito', '900 27px Nunito', '800 38px Nunito', '800 34px Nunito', '800 30px Nunito', '800 27px Nunito', '700 30px Nunito', '700 26px Nunito', '600 24px Nunito'],
  setup() {
    const hatch = (g, n) => { g.strokeStyle = 'rgba(178,74,48,0.38)'; g.lineWidth = 2; for (let x = -n; x < n * 2; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + n, n); g.stroke(); } };
    const speck = (g, n, R) => { for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(120,112,108,${0.14 + R() * 0.3})`; g.beginPath(); g.arc(R() * n, R() * n, 0.6 + R() * 1.4, 0, TAU); g.fill(); } };
    const spec = { backing: [C.backing, 1, { amp: 6, fl: 0.05 }], bone: [C.bone, 2, { amp: 8, fl: 0.07 }], gum: [C.gum, 3], enamel: [C.enamel, 4, { amp: 6, fd: 0.05 }], dentin: [C.dentin, 5], cream: [C.cream, 6, { amp: 7 }],
      coral: [C.coral, 7], coralDk: [C.coralDk, 22, { fl: 0.08 }], gran: [C.gran, 8], necro: [C.necro, 9, { fl: 0.08 }], mauve: [C.mauve, 10], teal: [C.teal, 11], tealTab: [C.tealTab, 12, { fl: 0.07 }], ink: [C.ink, 13, { amp: 6, fl: 0.06 }],
      film: [C.film, 14, { amp: 5, fl: 0.04, fibres: 80 }], xbone: [C.xbone, 15, { amp: 8, fl: 0.06 }], xroot: [C.xroot, 16, { amp: 9 }], gp: [C.gp, 17, { after: hatch }], cement: [C.cement, 18, { amp: 5, after: speck }],
      pink: [C.pink, 19], frameTeal: [C.frameTeal, 20, { fl: 0.07 }], thread: [C.thread, 21] };
    for (const key in spec) P[key] = makePaper(spec[key][0], spec[key][1], spec[key][2] || {});
    setupTabs(); setupInset();
    { const A = TABS.find((q) => q.id === 'A'), B = TABS.find((q) => q.id === 'B'); PLUS_AT = [A.x + Math.min(A.w, B.w) / 2, (A.y + A.h + B.y) / 2]; }
    CHIP3 = toPath(snip(rrectPts(-112, -31, 224, 62, 14), 30, 97, 0.6));
    XDENTIN = buildGeom({ g: 1, bare: 1, bites: null }).dentin;
    FILM_MOUNT = toPath(snip(rrectPts(-16, -16, FILM.w + 32, FILM.h + 32, 20), 44, 51, 0.9));
    FILM_SHEET = toPath(rrectPts(0, 0, FILM.w, FILM.h, 16)); FILM_IMG = toPath(rrectPts(10, 10, FILM.w - 20, FILM.h - 20, 10));
    // corner tag (luggage-tag outline with a punched hole)
    const tagW = 50 + tw('RESORPTION 1/5', F.tag, 1.2) + 27 + tw('INTERNAL', F.tagB, 1.6) + 22;
    TAG_PATH = toPath(snip([[0, -8], [16, -28], [tagW - 12, -28], [tagW, -16], [tagW, 16], [tagW - 12, 28], [16, 28], [0, 8]], 60, 41, 0.5)); TAG_PATH.moveTo(27, 0); TAG_PATH.arc(21, 0, 6, 0, TAU);
    // title fits the safe width
    TITLE.size = Math.min(108, Math.floor((92 * 884) / tw('Internal resorption', '900 92px Fraunces')));
    const sw = tw(SUB_TXT, '800 38px Nunito') + 64;
    SUB_PATH = { w: sw, path: toPath(snip(rrectPts(0, 0, sw, 68, 14), 40, 43, 0.7)) };
    MAT = buildMat();
  },
  render,
};
Kit.boot(window.REEL);
})();
