/*
 * 32 · External replacement resorption (ankylosis) — GEOLOGY FIELD DIAGRAM
 * A textbook rock-strata cross-section: bone = stippled sandstone, dentin = hatched slate, enamel = limestone,
 * PDL = moss-green fibre band. Deterministic: everything is a pure function of t.
 */
(() => {
'use strict';
const { canvas, ctx } = Kit.createCanvas();
const { W, H, clamp, lerp, seg, env, ease, hash, noise1 } = Kit;
const smooth = ease.smooth;
const DUR = 21;

const LB = '"Libre Baskerville", "Source Serif 4", serif';
const SS = '"Source Serif 4", "Libre Baskerville", serif';

const C = {
  paper: '#ECE6D3', paperLight: '#F5F0E1', air: '#F3EEDF', ink: '#2B2723', inkSoft: '#5E554A',
  boneA: '#E6C57F', boneB: '#DDB86E', boneC: '#D4AA5F', boneDot: '#76511F', cortex: '#C2924A', marrow: '#B9853F',
  dentin: '#7C8A93', dentinHatch: '#414E56', enamel: '#F8F4E6', enamelLine: '#9C9A86',
  pdl: '#8FAA58', pdlFiber: '#46622A', pdlDead: '#C4BDAE', pdlDeadFiber: '#8A8377',
  gum: '#CB8A73', gumLine: '#87483A', gp: '#B4472A', pulp: '#DBA79D', clot: '#7C3A30',
  rust: '#A2371F', moss: '#4A6628', slate: '#3F4C55', steel: '#9AA3A8',
};

// ---------------------------------------------------------------- timeline
const T = {
  out0: 1.2, out1: 1.7,          // tooth leaves the socket
  dry0: 1.7, dry1: 3.4,          // stopwatch
  in0: 3.5, in1: 4.2,            // replanted
  zin0: 3.8, zin1: 4.8,          // zoom in
  lab0: 4.3, lab1: 5.6,          // "PDL DEAD"
  fuse0: 5.5, fuse1: 8.7,        // caption
  br0: 5.8, br1: 7.9,            // bone bridging
  st0: 7.6, st1: 8.9,            // stamp
  zout0: 8.6, zout1: 9.5,        // zoom out
  lap0: 9.3, lap1: 12.8,         // time-lapse
  capE0: 9.0, capE1: 13.0,
  inf0: 10.0, inf1: 12.9,        // infraposition develops
  sig0: 13.0, sig1: 15.8,        // signs
  card0: 15.8, card1: 20.5,      // end card (fade until 20.95)
};

// ---------------------------------------------------------------- panel + section geometry
const PX = 64, PY = 426, PW = 952, PH = 760;
const CREST = 36;               // bone crest, px below the CEJ (tooth-local)
const PDLW = 20;                // PDL width (exaggerated, not to scale)
const INF = 46;                 // final infraposition (schematic)

function resample(pts, step) {
  const out = [pts[0]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let a = pts[i - 1]; const b = pts[i]; let d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (acc + d >= step) { const u = (step - acc) / d; a = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; out.push(a); d = Math.hypot(b[0] - a[0], b[1] - a[1]); acc = 0; }
    acc += d;
  }
  const last = pts[pts.length - 1], q = out[out.length - 1];
  if (Math.hypot(last[0] - q[0], last[1] - q[1]) > step * 0.4) out.push(last); else out[out.length - 1] = last;
  return out;
}

function buildTooth(spec) {
  const Tt = { ...spec, h: spec.yC - spec.yI };
  const { rc, L } = Tt;
  Tt.hw = (s) => rc * (1 - 0.22 * s) * Math.sqrt(Math.max(0, 1 - Math.pow(s, 3.2)));
  const raw = [], N = 200;
  for (let i = 0; i <= N; i++) { const s = Math.sin((i / N) * Math.PI / 2); raw.push([-Tt.hw(s), s * L]); }
  for (let i = N - 1; i >= 0; i--) { const s = Math.sin((i / N) * Math.PI / 2); raw.push([Tt.hw(s), s * L]); }
  const O = resample(raw, 6);
  const n = O.length;
  const Wl = O.map((p, i) => { const a = O[Math.max(0, i - 1)], b = O[Math.min(n - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - (dy / l) * PDLW, p[1] + (dx / l) * PDLW]; });
  let jm = 0; O.forEach((p, i) => { if (p[1] > O[jm][1]) jm = i; });
  let j0 = 0; while (O[j0][1] < CREST) j0++;
  let j1 = n - 1; while (O[j1][1] < CREST) j1--;
  // oblique fibres: the bone end sits a little more coronal than the cementum end
  const Wq = O.map((p, j) => { const sh = Math.round(-2 * clamp((jm - j) / 9, -1, 1)); return Wl[clamp(j + sh, 0, n - 1)]; });
  Object.assign(Tt, { O, Wl, Wq, jm, j0, j1 });
  return Tt;
}

const TL = buildTooth({ x: 196, rc: 76, hwI: 118, yI: 64, yC: 264, L: 360, r1: 46, r2: 26 });
const TC = buildTooth({ x: 476, rc: 80, hwI: 118, yI: 64, yC: 264, L: 380, r1: 26, r2: 46 });
const TR = buildTooth({ x: 734, rc: 66, hwI: 100, yI: 74, yC: 264, L: 366, r1: 34, r2: 52 });

function crownOuter(c, Tt) {
  const { rc, hwI, h, r1, r2 } = Tt, yI = -h;
  c.moveTo(-rc, 0);
  c.bezierCurveTo(-rc - 3, -0.26 * h, -hwI, yI + 0.64 * h, -hwI, yI + 0.38 * h);
  c.bezierCurveTo(-hwI, yI + 0.13 * h, -hwI + 0.3 * r1, yI, -hwI + r1, yI);
  c.quadraticCurveTo(0, yI - 5, hwI - r2, yI);
  c.bezierCurveTo(hwI - 0.3 * r2, yI, hwI, yI + 0.15 * h, hwI, yI + 0.42 * h);
  c.bezierCurveTo(hwI, yI + 0.66 * h, rc + 3, -0.26 * h, rc, 0);
}
function crownCore(c, Tt) {
  const { rc, hwI, h, r1, r2 } = Tt, yI = -h, e = 24;
  c.moveTo(-rc, 0);
  c.bezierCurveTo(-rc + 2, -0.3 * h, -hwI + e, yI + 0.66 * h, -hwI + e, yI + 0.42 * h);
  c.bezierCurveTo(-hwI + e, yI + 0.24 * h, -hwI + e + 0.4 * r1, yI + e, -hwI + e + r1, yI + e);
  c.lineTo(hwI - e - r2, yI + e);
  c.bezierCurveTo(hwI - e - 0.4 * r2, yI + e, hwI - e, yI + 0.26 * h, hwI - e, yI + 0.45 * h);
  c.bezierCurveTo(hwI - e, yI + 0.68 * h, rc - 2, -0.3 * h, rc, 0);
}
function pulpPath(c, Tt) {
  const { h, L, hwI } = Tt, cw = Tt.rc * 0.19;
  c.moveTo(-2.5, L - 26);
  c.lineTo(-cw * 0.55, L * 0.5); c.lineTo(-cw, 0);
  c.bezierCurveTo(-cw - 4, -0.2 * h, -hwI * 0.36, -0.36 * h, -hwI * 0.34, -0.56 * h);
  c.bezierCurveTo(-hwI * 0.2, -0.47 * h, -hwI * 0.1, -0.44 * h, 0, -0.44 * h);
  c.bezierCurveTo(hwI * 0.1, -0.44 * h, hwI * 0.2, -0.47 * h, hwI * 0.34, -0.56 * h);
  c.bezierCurveTo(hwI * 0.36, -0.36 * h, cw + 4, -0.2 * h, cw, 0);
  c.lineTo(cw * 0.55, L * 0.5); c.lineTo(2.5, L - 26); c.closePath();
}
function poly(c, pts, close) { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (close) c.closePath(); }

// ---------------------------------------------------------------- patterns + static layers
const PAT = {};
let bg = null, startPanel = null, stamp = null;

function tile(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); return ctx.createPattern(c, 'repeat'); }
function stippleTile(cell, n, col, r0, r1, seed) {
  return tile(cell * n, cell * n, (g, w) => {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = (i + 0.5 + (hash(i, j, seed) - 0.5) * 0.8) * cell, y = (j + 0.5 + (hash(i, j, seed + 1) - 0.5) * 0.8) * cell, r = lerp(r0, r1, hash(i, j, seed + 2));
      for (const ox of [-w, 0, w]) for (const oy of [-w, 0, w]) { g.beginPath(); g.arc(x + ox, y + oy, r, 0, 7); g.fill(); }
    }
  });
}
function buildPatterns() {
  PAT.stipple = stippleTile(11, 10, Kit.rgba(C.boneDot, 0.72), 0.9, 1.7, 3);
  PAT.stippleDense = stippleTile(8, 12, Kit.rgba(C.boneDot, 0.6), 0.8, 1.4, 9);
  PAT.clot = stippleTile(7, 10, 'rgba(40,10,8,0.5)', 0.8, 1.5, 21);
  PAT.dash = tile(46, 24, (g) => { g.strokeStyle = Kit.rgba(C.boneDot, 0.55); g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(5, 6); g.lineTo(17, 6); g.moveTo(28, 18); g.lineTo(40, 18); g.stroke(); });
  PAT.hatch = tile(11, 11, (g) => { g.strokeStyle = Kit.rgba(C.dentinHatch, 0.62); g.lineWidth = 1.25; g.beginPath(); for (const o of [-11, 0, 11]) { g.moveTo(o - 2, 13); g.lineTo(o + 13, -2); } g.stroke(); });
  PAT.hatchLight = tile(11, 11, (g) => { g.strokeStyle = Kit.rgba(C.dentinHatch, 0.3); g.lineWidth = 1.1; g.beginPath(); for (const o of [-11, 0, 11]) { g.moveTo(o - 2, 13); g.lineTo(o + 13, -2); } g.stroke(); });
  PAT.brick = tile(30, 18, (g) => { g.strokeStyle = Kit.rgba(C.enamelLine, 0.75); g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0.5); g.lineTo(30, 0.5); g.moveTo(0, 9.5); g.lineTo(30, 9.5); g.moveTo(7.5, 0); g.lineTo(7.5, 9); g.moveTo(22.5, 9); g.lineTo(22.5, 18); g.stroke(); });
  PAT.gum = tile(26, 16, (g) => { g.strokeStyle = Kit.rgba(C.gumLine, 0.55); g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(3, 5); g.quadraticCurveTo(7, 1.5, 11, 5); g.moveTo(16, 13); g.quadraticCurveTo(20, 9.5, 24, 13); g.stroke(); });
  PAT.marrow = tile(22, 22, (g) => { g.strokeStyle = 'rgba(92,58,18,0.62)'; g.lineWidth = 1.1; g.beginPath(); g.arc(6, 6, 3.4, 0, 7); g.moveTo(20.4, 17); g.arc(17, 17, 3.4, 0, 7); g.stroke(); });
  PAT.core = stippleTile(6, 8, 'rgba(60,60,60,0.35)', 0.6, 1.0, 33);
}

function txt(g, s, x, y, font, color, align, ls) {
  g.font = font; g.fillStyle = color; g.textAlign = align || 'left'; g.textBaseline = 'alphabetic';
  try { g.letterSpacing = (ls || 0) + 'px'; } catch (e) { /* older engines */ }
  g.fillText(s, x, y);
  try { g.letterSpacing = '0px'; } catch (e) { /* */ }
}
function measure(g, s, font, ls) { g.font = font; try { g.letterSpacing = (ls || 0) + 'px'; } catch (e) { /* */ } const w = g.measureText(s).width; try { g.letterSpacing = '0px'; } catch (e) { /* */ } return w; }
function fitFont(g, s, weight, fam, max, maxW, ls) { let px = max; while (px > 20 && measure(g, s, `${weight} ${px}px ${fam}`, ls) > maxW) px -= 1; return px; }
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function plaque(g, x, y, w, h, a) { g.save(); g.globalAlpha *= a == null ? 1 : a; rrect(g, x, y, w, h, 5); g.fillStyle = Kit.rgba(C.paperLight, 0.95); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.5; g.stroke(); g.restore(); }

// legend swatches (also used on the static background)
function swatch(g, kind, x, y, w, h) {
  g.save(); rrect(g, x, y, w, h, 3); g.clip();
  if (kind === 'enamel') { g.fillStyle = C.enamel; g.fillRect(x, y, w, h); g.fillStyle = PAT.brick; g.fillRect(x, y, w, h); }
  if (kind === 'dentin') { g.fillStyle = C.dentin; g.fillRect(x, y, w, h); g.fillStyle = PAT.hatch; g.fillRect(x, y, w, h); }
  if (kind === 'bone') { g.fillStyle = C.boneA; g.fillRect(x, y, w, h); g.fillStyle = PAT.stipple; g.fillRect(x, y, w, h); }
  if (kind === 'pdl') { g.fillStyle = C.pdl; g.fillRect(x, y, w, h); g.strokeStyle = C.pdlFiber; g.lineWidth = 1.5; g.beginPath(); for (let i = -2; i < 12; i++) { g.moveTo(x + i * 7, y + h + 2); g.lineTo(x + i * 7 + 14, y - 2); } g.stroke(); }
  g.restore();
  rrect(g, x, y, w, h, 3); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.stroke();
}

function buildBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H; const g = bg.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  // blotches + grain + fibres (survey-sheet paper)
  for (let i = 0; i < 46; i++) { const x = hash(i, 1) * W, y = hash(i, 2) * H, r = 160 + hash(i, 3) * 340; const gr = g.createRadialGradient(x, y, 0, x, y, r); const dark = hash(i, 4) > 0.45; gr.addColorStop(0, dark ? 'rgba(150,122,70,0.055)' : 'rgba(255,252,238,0.09)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 16000; i++) { g.fillStyle = hash(i, 7) > 0.5 ? 'rgba(90,70,35,0.05)' : 'rgba(255,255,245,0.07)'; g.fillRect(hash(i, 5) * W, hash(i, 6) * H, 1.5, 1.5); }
  g.lineWidth = 1; for (let i = 0; i < 420; i++) { const x = hash(i, 11) * W, y = hash(i, 12) * H, a = hash(i, 13) * 6.28, l = 6 + hash(i, 14) * 16; g.strokeStyle = 'rgba(110,88,50,0.07)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  // fold creases of the map sheet
  const crease = (x0, y0, x1, y1) => { g.strokeStyle = 'rgba(255,255,245,0.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = 'rgba(90,70,35,0.10)'; g.beginPath(); g.moveTo(x0 + 1.5, y0 + 1.5); g.lineTo(x1 + 1.5, y1 + 1.5); g.stroke(); };
  crease(540, 0, 540, H); crease(0, 640, W, 640); crease(0, 1280, W, 1280);
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, 620, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,50,20,0.20)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);

  // neat line (map border) with graticule ticks
  const bx = 36, by = 204, bw = 1008, bh = 1402;
  g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(bx, by, bw, bh);
  g.lineWidth = 1; g.strokeRect(bx + 9, by + 9, bw - 18, bh - 18);
  g.lineWidth = 1.2; g.beginPath();
  for (let x = bx + 56; x < bx + bw; x += 56) { g.moveTo(x, by); g.lineTo(x, by - 10); g.moveTo(x, by + bh); g.lineTo(x, by + bh + 10); }
  for (let y = by + 56; y < by + bh; y += 56) { g.moveTo(bx, y); g.lineTo(bx - 10, y); g.moveTo(bx + bw, y); g.lineTo(bx + bw + 10, y); }
  g.stroke();
  // sheet margin notes (decorative; outside the safe area)
  txt(g, 'ENDODONTIC FIELD SURVEY', bx, 178, `600 22px ${SS}`, C.inkSoft, 'left', 4);
  txt(g, 'SHEET 32', bx + bw, 178, `600 22px ${SS}`, C.inkSoft, 'right', 4);
  txt(g, 'CROSS-SECTION A–A’  ·  REPLANTED INCISOR AND ALVEOLAR BONE', W / 2, 1650, `600 20px ${SS}`, C.inkSoft, 'center', 3);
  txt(g, 'SCHEMATIC  ·  NOT TO SCALE', W / 2, 1682, `400 20px ${SS}`, C.inkSoft, 'center', 3);

  // header: series tag, handle, title
  const tagF = `700 30px ${SS}`, tag = 'RESORPTION 4/5 · REPLACEMENT';
  const tw = measure(g, tag, tagF, 2.2);
  g.fillStyle = C.ink; rrect(g, 64, 234, tw + 34, 48, 4); g.fill();
  g.strokeStyle = C.paperLight; g.lineWidth = 1; rrect(g, 68, 238, tw + 26, 40, 2); g.stroke();
  txt(g, tag, 81, 269, tagF, C.paperLight, 'left', 2.2);
  txt(g, '@natebrooksendo', 1016, 268, `italic 400 26px ${LB}`, C.inkSoft, 'right', 0.3);
  const title = 'Replacement resorption';
  const tp = fitFont(g, title, 700, LB, 74, 952, -0.5);
  txt(g, title, 62, 358, `700 ${tp}px ${LB}`, C.ink, 'left', -0.5);
  txt(g, 'the root is gradually replaced by bone', 66, 406, `italic 400 37px ${LB}`, C.moss, 'left', 0);

  // legend strip under the section ("EXPLANATION" is what a geologic map calls its legend)
  const ly = 1200;
  let x = 66;
  for (const [k, lab] of [['enamel', 'ENAMEL'], ['dentin', 'DENTIN'], ['pdl', 'PDL'], ['bone', 'BONE']]) {
    swatch(g, k, x, ly, 58, 40);
    txt(g, lab, x + 70, ly + 31, `600 30px ${SS}`, C.ink, 'left', 2);
    x += 70 + measure(g, lab, `600 30px ${SS}`, 2) + 38;
  }
  // root-filling key (line symbol)
  g.strokeStyle = C.gp; g.lineWidth = 9; g.lineCap = 'butt'; g.beginPath(); g.moveTo(x + 4, ly + 20); g.lineTo(x + 52, ly + 20); g.stroke();
  g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(x + 4, ly + 15.5, 48, 9);
  txt(g, 'root filling', x + 64, ly + 30, `italic 400 30px ${SS}`, C.ink, 'left', 0);
}

function buildStamp() {
  stamp = document.createElement('canvas'); stamp.width = 400; stamp.height = 130; const g = stamp.getContext('2d');
  const f = `700 48px ${LB}`; const w = measure(g, 'ANKYLOSIS', f, 5);
  const bw = w + 56, x0 = (400 - bw) / 2;
  g.strokeStyle = C.rust; g.lineWidth = 5; rrect(g, x0, 14, bw, 100, 8); g.stroke();
  g.lineWidth = 1.6; rrect(g, x0 + 9, 23, bw - 18, 82, 4); g.stroke();
  txt(g, 'ANKYLOSIS', 200 + 2.5, 82, f, C.rust, 'center', 5);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 900; i++) { g.globalAlpha = 0.25 + 0.6 * hash(i, 81); g.beginPath(); g.arc(hash(i, 82) * 400, hash(i, 83) * 130, 0.5 + hash(i, 84) * 1.5, 0, 7); g.fill(); }
}

// ---------------------------------------------------------------- section drawing (section coordinates 0..952 × 0..760)
const GUM_PTS = [[-84, 256], [56, 208], [196, 256], [336, 208], [476, 256], [614, 208], [734, 256], [852, 208], [1000, 256]];
const wInf = (x) => smooth(clamp((Math.abs(x - TC.x) - 100) / 76));
function gumY(x, dI) {
  let y = 256;
  for (let i = 1; i < GUM_PTS.length; i++) if (x <= GUM_PTS[i][0] || i === GUM_PTS.length - 1) { const a = GUM_PTS[i - 1], b = GUM_PTS[i]; const u = clamp((x - a[0]) / (b[0] - a[0])); y = lerp(a[1], b[1], 0.5 - 0.5 * Math.cos(Math.PI * u)); break; }
  return y - dI * wInf(x);
}
const crestY = (x, dI) => 300 + 2.5 * Math.sin(x / 47) - dI * wInf(x);
const c1 = (x) => 432 + 13 * Math.sin(x / 150 + 1) + 5 * Math.sin(x / 47);
const c2 = (x) => 574 + 12 * Math.sin(x / 170 + 2.2) + 5 * Math.sin(x / 53 + 1);
const LENSES = [[38, 432, 19, 44, 0.05], [50, 596, 25, 28, 0], [334, 404, 13, 36, 0.03], [336, 540, 20, 40, -0.04], [612, 414, 11, 34, -0.03], [610, 548, 18, 38, 0.05], [884, 398, 27, 46, 0.06], [330, 676, 42, 14, 0.04], [612, 668, 44, 15, -0.05], [742, 686, 36, 12, 0.02]];

function curveFn(c, fn, x0, x1, step, first) { for (let x = x0; x <= x1; x += step) { if (first && x === x0) c.moveTo(x, fn(x)); else c.lineTo(x, fn(x)); } }

function drawGround(dI) {
  const X0 = -20, X1 = PW + 20;
  ctx.fillStyle = C.air; ctx.fillRect(X0, -20, X1 - X0, PH + 40);
  // gingiva ("topsoil")
  ctx.beginPath(); curveFn(ctx, (x) => gumY(x, dI), X0, X1, 6, true); ctx.lineTo(X1, 330); ctx.lineTo(X0, 330); ctx.closePath();
  ctx.fillStyle = C.gum; ctx.fill(); ctx.fillStyle = PAT.gum; ctx.fill();
  ctx.beginPath(); curveFn(ctx, (x) => gumY(x, dI), X0, X1, 6, true); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke();
  // bone strata
  const bonePath = () => { ctx.beginPath(); curveFn(ctx, (x) => crestY(x, dI), X0, X1, 6, true); ctx.lineTo(X1, PH + 30); ctx.lineTo(X0, PH + 30); ctx.closePath(); };
  bonePath(); ctx.fillStyle = C.boneA; ctx.fill();
  ctx.save(); bonePath(); ctx.clip();
  ctx.beginPath(); curveFn(ctx, c1, X0, X1, 8, true); ctx.lineTo(X1, PH + 30); ctx.lineTo(X0, PH + 30); ctx.closePath(); ctx.fillStyle = C.boneB; ctx.fill(); ctx.fillStyle = PAT.dash; ctx.fill();
  ctx.beginPath(); curveFn(ctx, c2, X0, X1, 8, true); ctx.lineTo(X1, PH + 30); ctx.lineTo(X0, PH + 30); ctx.closePath(); ctx.fillStyle = C.boneC; ctx.fill(); ctx.fillStyle = PAT.stippleDense; ctx.fill();
  ctx.fillStyle = PAT.stipple; ctx.fillRect(X0, 200, X1 - X0, PH);
  // bedding planes
  ctx.lineWidth = 1.3; ctx.strokeStyle = Kit.rgba(C.ink, 0.42);
  ctx.beginPath(); curveFn(ctx, c1, X0, X1, 8, true); ctx.stroke();
  ctx.beginPath(); curveFn(ctx, c2, X0, X1, 8, true); ctx.stroke();
  ctx.strokeStyle = Kit.rgba(C.ink, 0.2); ctx.setLineDash([22, 9]);
  for (const [f, o] of [[c1, -62], [c1, 58], [c2, 66], [c2, 122]]) { ctx.beginPath(); curveFn(ctx, (x) => f(x + 40) + o, X0, X1, 8, true); ctx.stroke(); }
  ctx.setLineDash([]);
  // marrow lenses ("conglomerate")
  for (const [x, y, rx, ry, rot] of LENSES) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 7); ctx.fillStyle = C.marrow; ctx.fill(); ctx.fillStyle = PAT.marrow; ctx.fill(); ctx.strokeStyle = Kit.rgba(C.ink, 0.8); ctx.lineWidth = 1.4; ctx.stroke(); }
  ctx.restore();
  // cortical crest
  ctx.beginPath(); curveFn(ctx, (x) => crestY(x, dI) + 5, X0, X1, 6, true); ctx.strokeStyle = C.cortex; ctx.lineWidth = 10; ctx.stroke();
  ctx.beginPath(); curveFn(ctx, (x) => crestY(x, dI), X0, X1, 6, true); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
}

function bandPath(Tt, F) { const { O, j0, j1 } = Tt; ctx.beginPath(); ctx.moveTo(O[j0][0], O[j0][1]); for (let j = j0 + 1; j <= j1; j++) ctx.lineTo(O[j][0], O[j][1]); for (let j = j1; j >= j0; j--) ctx.lineTo(F[j][0], F[j][1]); ctx.closePath(); }
function wallLine(Tt, F) { const { j0, j1 } = Tt; ctx.beginPath(); ctx.moveTo(F[j0][0], F[j0][1]); for (let j = j0 + 1; j <= j1; j++) ctx.lineTo(F[j][0], F[j][1]); }

function drawPdlHealthy(Tt) {
  const { O, Wq, j0, j1 } = Tt;
  wallLine(Tt, Wq); ctx.strokeStyle = C.cortex; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
  bandPath(Tt, Wq); ctx.fillStyle = C.pdl; ctx.fill();
  ctx.beginPath(); for (let j = j0; j <= j1; j++) { ctx.moveTo(O[j][0], O[j][1]); ctx.lineTo(Wq[j][0], Wq[j][1]); }
  ctx.strokeStyle = C.pdlFiber; ctx.lineWidth = 1.5; ctx.stroke();
  wallLine(Tt, Wq); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.stroke();
}
// dead PDL band; prog(j) = how far bone has grown from the socket wall towards the root (0..1)
function drawPdlDead(Tt, prog) {
  const { O, Wq, j0, j1 } = Tt;
  const F = Wq.map((q, j) => { const p = prog ? prog(j) : 0; return [lerp(q[0], O[j][0], p), lerp(q[1], O[j][1], p)]; });
  wallLine(Tt, Wq); ctx.strokeStyle = C.cortex; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
  // bone that has crossed the gap shows through (bone strata are underneath); tint it slightly so the bridges read
  bandPath(Tt, Wq); ctx.fillStyle = 'rgba(255,244,205,0.22)'; ctx.fill();
  bandPath(Tt, F); ctx.fillStyle = C.pdlDead; ctx.fill();
  ctx.beginPath();
  for (let j = j0; j <= j1; j++) {
    const p = prog ? prog(j) : 0; if (p > 0.97) continue; const h1 = hash(j, 71), h2 = hash(j, 72);
    if (h1 < 0.22) continue;
    const a = O[j], b = F[j], u0 = 0.05, u1 = 0.25 + 0.3 * h2, u2 = u1 + 0.18, u3 = 0.95;
    ctx.moveTo(lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)); ctx.lineTo(lerp(a[0], b[0], u1), lerp(a[1], b[1], u1));
    if (h1 > 0.5) { ctx.moveTo(lerp(a[0], b[0], u2), lerp(a[1], b[1], u2)); ctx.lineTo(lerp(a[0], b[0], u3), lerp(a[1], b[1], u3)); }
  }
  ctx.strokeStyle = C.pdlDeadFiber; ctx.lineWidth = 1.3; ctx.stroke();
  wallLine(Tt, F); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.stroke();
}

function drawCrown(Tt) {
  ctx.beginPath(); crownOuter(ctx, Tt); ctx.closePath(); ctx.fillStyle = C.enamel; ctx.fill(); ctx.fillStyle = PAT.brick; ctx.fill();
}
function strokeCrown(Tt) {
  ctx.beginPath(); crownCore(ctx, Tt); ctx.strokeStyle = Kit.rgba(C.ink, 0.75); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); crownOuter(ctx, Tt); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke();
}
function fillDentin() { ctx.fillStyle = C.dentin; ctx.fill(); ctx.fillStyle = PAT.hatch; ctx.fill(); }
function drawDentinFull(Tt) {
  const { O } = Tt;
  ctx.beginPath(); crownCore(ctx, Tt); for (let j = O.length - 2; j >= 0; j--) ctx.lineTo(O[j][0], O[j][1]); ctx.closePath(); fillDentin();
  ctx.beginPath(); poly(ctx, O, false); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
}
function drawPulp(Tt, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); pulpPath(ctx, Tt); ctx.fillStyle = C.pulp; ctx.fill(); ctx.strokeStyle = Kit.rgba(C.ink, 0.8); ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
}
function drawFilling(Tt, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); pulpPath(ctx, Tt); ctx.fillStyle = '#D9D4C6'; ctx.fill(); ctx.fillStyle = PAT.core; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(-60, -10, 120, Tt.L); ctx.clip(); ctx.beginPath(); pulpPath(ctx, Tt); ctx.fillStyle = C.gp; ctx.fill(); ctx.restore();
  ctx.beginPath(); pulpPath(ctx, Tt); ctx.strokeStyle = Kit.rgba(C.ink, 0.85); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-Tt.rc * 0.19 - 1, -10); ctx.lineTo(Tt.rc * 0.19 + 1, -10); ctx.stroke();
  ctx.restore();
}
function drawNeighbor(Tt, dI) {
  ctx.save(); ctx.translate(Tt.x, Tt.yC - dI);
  drawPdlHealthy(Tt); drawCrown(Tt); drawDentinFull(Tt); strokeCrown(Tt); drawPulp(Tt, 1);
  ctx.restore();
}

// replacement front: how far bone has replaced dentin, measured inwards from each side of the root (schematic)
function depth(y, side, D) {
  if (D <= 0) return 0;
  const s = y / TC.L, n = 0.5 + 0.5 * noise1(y / 36 + side * 41.3, 7);
  const ramp = smooth(clamp((y - (CREST - 8)) / 52));
  const scal = 6 * Math.abs(Math.sin(y / 13 + side * 1.7 + 2 * noise1(y / 60, 11 + side))) * clamp(D / 14);
  return Math.max(0, D * (0.5 + 0.7 * n) * (0.8 + 0.45 * s) + scal - 3) * ramp;
}
const ROWS_Y = (() => { const a = []; for (let y = 0; y < TC.L - 24; y += 3) a.push(y); for (let y = TC.L - 24; y <= TC.L; y += 1) a.push(y); return a; })();
function drawDentinRemaining(D) {
  const runs = []; let cur = null;
  for (const y of ROWS_Y) {
    const hwy = TC.hw(y / TC.L), xl = -hwy + depth(y, 0, D), xr = hwy - depth(y, 1, D);
    if (xr - xl > 1.6) { if (!cur) { cur = []; runs.push(cur); } cur.push([y, xl, xr]); } else cur = null;
  }
  for (const r of runs) {
    const top = r[0], bot = r[r.length - 1], first = top[0] === 0;
    ctx.beginPath();
    if (first) crownCore(ctx, TC); else ctx.moveTo((top[1] + top[2]) / 2, top[0] - 2);
    for (let i = first ? 1 : 0; i < r.length; i++) ctx.lineTo(r[i][2], r[i][0]);
    ctx.lineTo((bot[1] + bot[2]) / 2, bot[0] + 1.5);
    for (let i = r.length - 1; i >= (first ? 1 : 0); i--) ctx.lineTo(r[i][1], r[i][0]);
    ctx.closePath(); fillDentin();
    ctx.beginPath();
    if (first) { ctx.moveTo(r[0][2], 0); for (let i = 1; i < r.length; i++) ctx.lineTo(r[i][2], r[i][0]); ctx.lineTo((bot[1] + bot[2]) / 2, bot[0] + 1.5); for (let i = r.length - 1; i >= 0; i--) ctx.lineTo(r[i][1], r[i][0]); } else { ctx.moveTo((top[1] + top[2]) / 2, top[0] - 2); for (let i = 0; i < r.length; i++) ctx.lineTo(r[i][2], r[i][0]); ctx.lineTo((bot[1] + bot[2]) / 2, bot[0] + 1.5); for (let i = r.length - 1; i >= 0; i--) ctx.lineTo(r[i][1], r[i][0]); ctx.closePath(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
  }
}

function state(t) {
  const out = seg(t, T.out0, T.out1, ease.in), back = seg(t, T.in0, T.in1, ease.out);
  const present = t < T.in0 ? 1 - out : back;
  const lift = t < T.in0 ? 150 * out : 150 * (1 - back);
  const k = seg(t, T.zin0, T.zin1, ease.inOut) * (1 - seg(t, T.zout0, T.zout1, ease.inOut));
  const tb = seg(t, T.br0, T.br1);
  const v = seg(t, T.lap0, T.lap1);
  return {
    out, back, present, lift, z: 1 + 0.55 * k, cx: TC.x, cy: lerp(PH / 2, 452, k), k,
    dead: t >= T.in0, tb, fill: seg(t, 4.7, 5.5, smooth),
    D: 215 * Math.pow(smooth(v), 1.35), v,
    dI: INF * seg(t, T.inf0, T.inf1, ease.inOut),
    ptr: t < T.zout0 + 0.3 ? lerp(0.03, 0.19, seg(t, T.br0, T.br1 + 0.4, smooth)) : lerp(0.19, 0.965, seg(t, T.lap0 - 0.1, T.lap1, ease.inOut)),
  };
}

function drawSection(t, S) {
  drawGround(S.dI);
  drawNeighbor(TL, S.dI); drawNeighbor(TR, S.dI * 0.94);
  const Tt = TC;
  ctx.save(); ctx.translate(Tt.x, Tt.yC);
  // --- socket
  if (!S.dead || S.back < 1) {
    const clotA = S.out * (1 - S.back);
    if (clotA < 1 && !S.dead) { ctx.save(); ctx.globalAlpha = 1; drawPdlHealthy(Tt); ctx.restore(); }
    if (clotA > 0) {
      ctx.save(); ctx.globalAlpha = clotA;
      ctx.beginPath(); ctx.moveTo(-Tt.rc - 4, -12); for (let j = Tt.j0 - 2; j <= Tt.j1 + 2; j++) ctx.lineTo(Tt.Wl[j][0], Tt.Wl[j][1]); ctx.lineTo(Tt.rc + 4, -12); ctx.closePath();
      ctx.fillStyle = C.clot; ctx.fill(); ctx.fillStyle = PAT.clot; ctx.fill();
      wallLine(Tt, Tt.Wq); ctx.strokeStyle = C.pdl; ctx.lineWidth = 6; ctx.stroke();   // PDL remnants on the socket wall
      wallLine(Tt, Tt.Wq); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-Tt.rc - 4, -12); ctx.quadraticCurveTo(0, -4, Tt.rc + 4, -12); ctx.strokeStyle = Kit.rgba(C.ink, 0.8); ctx.lineWidth = 1.6; ctx.stroke();
      ctx.restore();
    }
  }
  if (S.dead) {
    ctx.save(); ctx.globalAlpha = S.back;
    const prog = S.tb > 0 ? (j) => smooth(clamp((S.tb * 1.5 - (0.5 + 0.5 * noise1(j * 0.21, 3))) / 0.5)) : null;
    if (S.tb < 1) drawPdlDead(Tt, prog);
    else { bandPath(Tt, Tt.Wq); ctx.fillStyle = `rgba(255,244,205,${0.22 * (1 - clamp(S.D / 40))})`; ctx.fill(); }
    ctx.restore();
  }
  // --- tooth
  ctx.save(); ctx.translate(0, -S.lift); ctx.globalAlpha = S.present;
  if (S.present > 0) {
    if (S.D > 0) {
      // bone that now occupies the former root: slightly lighter, with the old root outline kept as a dashed "inferred contact"
      ctx.save(); ctx.beginPath(); poly(ctx, Tt.O, true); ctx.clip();
      ctx.fillStyle = `rgba(255,246,214,${0.3 * clamp(S.D / 30)})`; ctx.fillRect(-120, CREST - 10, 240, Tt.L);
      const la = clamp((S.D - 150) / 50); if (la > 0) { ctx.globalAlpha = la; ctx.beginPath(); ctx.ellipse(-30, 236, 13, 30, 0.08, 0, 7); ctx.fillStyle = C.marrow; ctx.fill(); ctx.fillStyle = PAT.marrow; ctx.fill(); ctx.strokeStyle = Kit.rgba(C.ink, 0.75); ctx.lineWidth = 1.3; ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.7 * clamp(S.D / 25); ctx.setLineDash([8, 6]); ctx.beginPath(); for (let j = Tt.j0; j <= Tt.j1; j++) { const p = Tt.O[j]; if (j === Tt.j0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    }
    drawCrown(Tt);
    if (S.D > 0) drawDentinRemaining(S.D); else drawDentinFull(Tt);
    strokeCrown(Tt);
    drawPulp(Tt, 1 - S.fill); drawFilling(Tt, S.fill);
    // fusion line lights up once when bone meets root
    const fa = env(t, T.br1 - 0.25, T.zout0 + 0.5, 0.35, 0.6);
    if (fa > 0) { ctx.save(); ctx.globalAlpha = 0.85 * fa; ctx.beginPath(); for (let j = Tt.j0; j <= Tt.j1; j++) { const p = Tt.O[j]; if (j === Tt.j0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.strokeStyle = C.rust; ctx.lineWidth = 4.5; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
  ctx.restore();

  // --- infraposition reference: the neighbours' incisal level vs the ankylosed crown
  const ia = clamp((S.dI - 10) / 14);
  if (ia > 0) {
    ctx.save(); ctx.globalAlpha = ia;
    const y0 = TC.yI - S.dI, y1 = TC.yI - 4;
    ctx.setLineDash([10, 7]); ctx.strokeStyle = C.rust; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(322, y0); ctx.lineTo(628, y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(TC.x, y0 + 3); ctx.lineTo(TC.x, y1 - 2); ctx.stroke();
    ctx.fillStyle = C.rust; ctx.beginPath(); ctx.moveTo(TC.x, y1); ctx.lineTo(TC.x - 7, y1 - 12); ctx.lineTo(TC.x + 7, y1 - 12); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // --- percussion: a mirror handle taps the crown
  const ra = env(t, T.sig0 + 0.1, T.sig1 + 0.2, 0.3, 0.4);
  if (ra > 0) {
    const taps = [T.sig0 + 0.75, T.sig0 + 1.45, T.sig0 + 2.15];
    let bump = 0; for (const tk of taps) { const x = t - tk; bump = Math.max(bump, x < 0 ? smooth(clamp(1 + x / 0.2)) : 1 - smooth(clamp(x / 0.36))); }
    const cxp = TC.x + 92, cyp = 96, dx = Math.cos(-0.72), dy = Math.sin(-0.72), off = 30 * (1 - bump);
    ctx.save(); ctx.globalAlpha = ra;
    for (const tk of taps) { const a = t - tk; if (a < 0 || a > 0.62) continue; for (let i = 0; i < 3; i++) { const r = 16 + 78 * a + 13 * i; ctx.beginPath(); ctx.arc(cxp - 8, cyp, r, Math.PI * 0.72, Math.PI * 1.36); ctx.strokeStyle = Kit.rgba(C.rust, (1 - a / 0.62) * (1 - i * 0.25)); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke(); } }
    ctx.translate(cxp + dx * off, cyp + dy * off); ctx.rotate(-0.72);
    rrect(ctx, 0, -8, 420, 16, 8); ctx.fillStyle = C.steel; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -3); ctx.lineTo(410, -3); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); for (let i = 0; i < 9; i++) { ctx.moveTo(60 + i * 9, -8); ctx.lineTo(60 + i * 9, 8); } ctx.strokeStyle = Kit.rgba(C.ink, 0.5); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  }
}

const toScreen = (S, x, y) => [PX + PW / 2 + (x - S.cx) * S.z, PY + PH / 2 + (y - S.cy) * S.z];

function drawStrip(t, S) {
  const a = seg(t, T.fuse0 - 0.2, T.fuse0 + 0.4, ease.out); if (a <= 0) return;
  const h = 56, y0 = PY + PH - h;
  ctx.save(); ctx.globalAlpha = a;
  const segs = [[0, 0.22, 'WEEKS', '#EBDCB0', PAT.stipple], [0.22, 0.5, 'MONTHS', '#CFD6AC', PAT.dash], [0.5, 1, 'YEARS', '#BFC9CC', PAT.hatchLight]];
  for (const [u0, u1, lab, col, pat] of segs) {
    const x0 = PX + u0 * PW, w = (u1 - u0) * PW;
    ctx.fillStyle = col; ctx.fillRect(x0, y0, w, h);
    ctx.save(); ctx.globalAlpha = a * 0.45; ctx.fillStyle = pat; ctx.fillRect(x0, y0, w, h); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.stroke();
    const cxl = lab === 'YEARS' ? x0 + w * 0.42 : x0 + w / 2, f = `700 30px ${SS}`, tw = measure(ctx, lab, f, 4);
    ctx.fillStyle = Kit.rgba(col, 0.9); ctx.fillRect(cxl - tw / 2 - 8, y0 + 10, tw + 16, h - 20);
    txt(ctx, lab, cxl + 2, y0 + 39, f, C.ink, 'center', 4);
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(PX, y0); ctx.lineTo(PX + PW, y0); ctx.stroke();
  const px = PX + S.ptr * PW;
  ctx.strokeStyle = C.rust; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + h); ctx.stroke();
  ctx.fillStyle = C.rust; ctx.beginPath(); ctx.moveTo(px, y0 + 1); ctx.lineTo(px - 13, y0 - 21); ctx.lineTo(px + 13, y0 - 21); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.restore();
}

function drawCompass() {
  const x = PX + 824, y = PY + 478, w = 122, h = 186, cx = x + w / 2, cy = y + h / 2;
  plaque(ctx, x, y, w, h, 0.96);
  txt(ctx, 'CORONAL', cx + 1, y + 30, `600 21px ${SS}`, C.ink, 'center', 1.6);
  txt(ctx, 'APICAL', cx + 1, y + h - 14, `600 21px ${SS}`, C.ink, 'center', 1.6);
  ctx.save(); ctx.translate(cx, cy);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, 0, 31, 0, 7); ctx.stroke();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r0 = i % 4 === 0 ? 24 : 28; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * 31, Math.sin(a) * 31); ctx.stroke(); }
  const star = (len, wd, rot, fillTop) => { ctx.save(); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(wd, 0); ctx.lineTo(0, len); ctx.lineTo(-wd, 0); ctx.closePath(); ctx.fillStyle = C.paperLight; ctx.fill(); ctx.stroke(); if (fillTop) { ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(wd, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, len); ctx.lineTo(-wd, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); } ctx.restore(); };
  star(19, 5, Math.PI / 4, false); star(19, 5, -Math.PI / 4, false); star(24, 6, Math.PI / 2, true); star(42, 7, 0, true);
  ctx.restore();
}
function drawScale() {
  const x = PX + 18, y = PY + 646, w = 212, h = 50;
  plaque(ctx, x, y, w, h, 0.96);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? C.paperLight : C.ink; ctx.fillRect(x + 14 + i * 22, y + 12, 22, 9); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.strokeRect(x + 14, y + 12, 88, 9);
  txt(ctx, 'not to scale', x + 14, y + 42, `italic 400 22px ${SS}`, C.ink, 'left', 0);
  ctx.beginPath(); for (let i = 0; i <= 4; i++) { ctx.moveTo(x + 14 + i * 22, y + 8); ctx.lineTo(x + 14 + i * 22, y + 12); } ctx.stroke();
  txt(ctx, 'schematic', x + w - 12, y + 24, `italic 400 22px ${SS}`, C.ink, 'right', 0);
}

function drawPanel(t) {
  const S = state(t);
  ctx.save(); ctx.beginPath(); ctx.rect(PX, PY, PW, PH); ctx.clip();
  ctx.save(); ctx.translate(PX + PW / 2, PY + PH / 2); ctx.scale(S.z, S.z); ctx.translate(-S.cx, -S.cy);
  drawSection(t, S);
  ctx.restore();
  // section end marks
  const ma = 1 - S.k;
  if (ma > 0) { ctx.save(); ctx.globalAlpha = ma; txt(ctx, 'A', PX + 20, PY + 44, `italic 700 30px ${LB}`, C.ink, 'left', 0); txt(ctx, 'A’', PX + PW - 18, PY + 44, `italic 700 30px ${LB}`, C.ink, 'right', 0); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PX + 30, PY + 54); ctx.lineTo(PX + 30, PY + 68); ctx.moveTo(PX + PW - 32, PY + 54); ctx.lineTo(PX + PW - 32, PY + 68); ctx.stroke(); ctx.restore(); }
  drawStrip(t, S);
  ctx.save(); ctx.globalAlpha = 1 - 0.0 * S.k; drawCompass(); if (seg(t, T.fuse0 - 0.2, T.fuse0 + 0.4) < 1 || true) drawScale(); ctx.restore();
  // "DETAIL" tag while zoomed
  if (S.k > 0.02) { ctx.save(); ctx.globalAlpha = S.k; plaque(ctx, PX + 18, PY + 18, 196, 44); txt(ctx, 'DETAIL · root', PX + 32, PY + 49, `600 25px ${SS}`, C.ink, 'left', 1.2); ctx.restore(); }

  // callout: PDL DEAD
  const la = env(t, T.lab0, T.lab1, 0.3, 0.3);
  if (la > 0) {
    ctx.save(); ctx.globalAlpha = la;
    const f = `700 34px ${LB}`, s = 'PDL DEAD', tw = measure(ctx, s, f, 2), [mx, my] = toScreen(S, TC.x, TC.yC + 268), pw = tw + 36, ph = 58;
    const yb = TC.yC + 182, hwb = TC.hw(182 / TC.L) + PDLW / 2;
    const [lx, ly] = toScreen(S, TC.x - hwb, yb), [rx, ry] = toScreen(S, TC.x + hwb, yb);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx - pw / 2 + 10, my - ph / 2); ctx.lineTo(lx, ly); ctx.moveTo(mx + pw / 2 - 10, my - ph / 2); ctx.lineTo(rx, ry); ctx.stroke();
    for (const [qx, qy] of [[lx, ly], [rx, ry]]) { ctx.beginPath(); ctx.arc(qx, qy, 6, 0, 7); ctx.fillStyle = C.paperLight; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(qx, qy, 2.4, 0, 7); ctx.fillStyle = C.ink; ctx.fill(); }
    plaque(ctx, mx - pw / 2, my - ph / 2, pw, ph);
    txt(ctx, s, mx + 1, my + 12, f, C.ink, 'center', 2);
    ctx.restore();
  }
  ctx.restore();
}
function drawPanelFrame() {
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(PX, PY, PW, PH);
  ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = PX + 68; x < PX + PW; x += 68) { ctx.moveTo(x, PY); ctx.lineTo(x, PY - 7); }
  for (let y = PY + 76; y < PY + PH; y += 76) { ctx.moveTo(PX, y); ctx.lineTo(PX - 7, y); ctx.moveTo(PX + PW, y); ctx.lineTo(PX + PW + 7, y); }
  ctx.stroke();
}

// ---------------------------------------------------------------- small drawings for the caption zone
const MINI = buildTooth({ x: 0, rc: 80, hwI: 118, yI: 64, yC: 264, L: 380, r1: 30, r2: 44 });
function miniTooth(x, y, sc, rot, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(sc, sc);
  if (o.coat != null) { ctx.beginPath(); for (let j = MINI.j0 - 3; j <= MINI.j1 + 3; j++) { const p = MINI.O[j]; if (j === MINI.j0 - 3) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.strokeStyle = Kit.rgba(Kit.mix(C.pdl, C.pdlDead, o.coat), 1); ctx.lineWidth = 26; ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.stroke(); ctx.strokeStyle = C.ink; ctx.lineWidth = 30; ctx.globalCompositeOperation = 'destination-over'; ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
  ctx.beginPath(); crownOuter(ctx, MINI); ctx.closePath(); ctx.fillStyle = C.enamel; ctx.fill();
  ctx.beginPath(); crownCore(ctx, MINI); for (let j = MINI.O.length - 2; j >= 0; j--) ctx.lineTo(MINI.O[j][0], MINI.O[j][1]); ctx.closePath(); ctx.fillStyle = C.dentin; ctx.fill();
  if (!o.noRoot) { ctx.beginPath(); poly(ctx, MINI.O, false); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2 / sc; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.beginPath(); crownOuter(ctx, MINI); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2 / sc; ctx.stroke();
  ctx.restore();
}
function stopwatch(x, y, r, u) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = C.ink; ctx.fillRect(-7, -r - 17, 14, 12); ctx.fillRect(-13, -r - 23, 26, 8);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = C.paperLight; ctx.fill();
  const min = 75 * u, a0 = -Math.PI / 2;
  if (min > 0) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 5, a0, a0 + Math.min(min, 60) / 60 * Math.PI * 2); ctx.closePath(); ctx.fillStyle = Kit.rgba(C.rust, 0.3); ctx.fill(); }
  if (min > 60) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 5, a0, a0 + (min - 60) / 60 * Math.PI * 2); ctx.closePath(); ctx.fillStyle = Kit.rgba(C.rust, 0.6); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = i % 3 === 0 ? r - 13 : r - 8; ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3)); } ctx.stroke();
  const ah = a0 + (min / 60) * Math.PI * 2; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ah) * (r - 16), Math.sin(ah) * (r - 16)); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
}
function numRich(parts, x, y, px) { // [[text, color, weight]]
  let cx = x; for (const [s, col, wt] of parts) { const f = `${wt || 600} ${px}px ${SS}`; txt(ctx, s, cx, y, f, col || C.ink, 'left', 0); cx += measure(ctx, s, f, 0); } return cx;
}
const CAPX = 66;

function drawCaptions(t) {
  // A — figure caption of the plate
  let a = Math.max(env(t, -1, T.out0 + 0.3, 0.01, 0.3), seg(t, DUR - 0.4, DUR - 0.05));
  if (a > 0) { ctx.save(); ctx.globalAlpha = a; txt(ctx, 'Fig. 1 — Section A–A’: an incisor in its socket, held by the PDL', CAPX, 1318, `italic 400 28px ${SS}`, C.inkSoft, 'left', 0); ctx.restore(); }

  // B/C — dry time
  a = env(t, T.out1 - 0.2, T.lab1 - 0.05, 0.35, 0.3);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    const u = seg(t, T.dry0, T.dry1, ease.inOut);
    stopwatch(128, 1372, 58, u);
    txt(ctx, 'DRY > 60 MIN', 214, 1396, `700 68px ${LB}`, C.ink, 'left', 1);
    // the avulsed tooth, drying on the bench
    miniTooth(880, 1368, 0.33, -Math.PI / 2 - 0.06, { coat: smooth(clamp((u - 0.15) / 0.75)) });
    ctx.strokeStyle = Kit.rgba(C.inkSoft, 0.7); ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i * 0.37) % 1, x0 = 888 + i * 34, y0 = 1322 - ph * 26; ctx.globalAlpha = a * Math.sin(ph * Math.PI) * 0.9; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + 7, y0 - 7, x0 - 7, y0 - 14, x0, y0 - 21); ctx.stroke(); }
    ctx.globalAlpha = a * seg(t, T.dry1 - 0.5, T.dry1, ease.out);
    txt(ctx, 'PDL cells likely non-viable', CAPX, 1478, `italic 400 38px ${LB}`, C.moss, 'left', 0);
    txt(ctx, 'Fouad 2020, Dent Traumatol (IADT avulsion guideline)', CAPX, 1524, `400 24px ${SS}`, C.inkSoft, 'left', 0.2);
    ctx.restore();
  }

  // D — fusion
  a = env(t, T.fuse0, T.fuse1, 0.35, 0.3);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    txt(ctx, 'Bone grows across', CAPX, 1352, `700 58px ${LB}`, C.ink, 'left', -0.3);
    txt(ctx, 'the dead PDL', CAPX, 1424, `700 58px ${LB}`, C.ink, 'left', -0.3);
    txt(ctx, 'Andreasen & Kristerson 1981, Acta Odontol Scand · monkey', CAPX, 1486, `400 24px ${SS}`, C.inkSoft, 'left', 0.2);
    ctx.restore();
  }
  const sa = seg(t, T.st0, T.st0 + 0.28, ease.out) * (1 - seg(t, T.st1 - 0.3, T.st1));
  if (sa > 0) { const k = seg(t, T.st0, T.st0 + 0.28, ease.out); ctx.save(); ctx.globalAlpha = sa; ctx.translate(782, 1392); ctx.rotate(-0.09); const sc = lerp(1.35, 0.9, k); ctx.scale(sc, sc); ctx.drawImage(stamp, -200, -65); ctx.restore(); }

  // E — geological time
  a = env(t, T.capE0, T.capE1, 0.35, 0.3);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a * seg(t, T.capE0 + 0.2, T.capE0 + 0.6);
    txt(ctx, 'Root remodeled as bone', CAPX, 1350, `700 56px ${LB}`, C.ink, 'left', -0.3);
    ctx.globalAlpha = a * seg(t, T.capE0 + 0.9, T.capE0 + 1.3);
    numRich([['Age ', C.ink], ['8–16', C.rust, 700], [': root resorbed in ', C.ink], ['3–7 yr', C.rust, 700]], CAPX, 1428, 48);
    txt(ctx, '≥ 1 h dry · Andersson 1989, Endod Dent Traumatol · time scale schematic', CAPX, 1486, `400 24px ${SS}`, C.inkSoft, 'left', 0.2);
    ctx.restore();
  }

  // F — signs
  a = env(t, T.sig0, T.sig1, 0.35, 0.3);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    const f = `700 30px ${SS}`, sw = measure(ctx, 'SIGNS', f, 6);
    txt(ctx, 'SIGNS', 508 + 3, 1304, f, C.moss, 'center', 6);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(CAPX, 1294); ctx.lineTo(508 - sw / 2 - 18, 1294); ctx.moveTo(508 + sw / 2 + 18, 1294); ctx.lineTo(950, 1294); ctx.stroke();
    const cols = [226, 520, 808];
    const st = (i) => seg(t, T.sig0 + 0.15 + i * 0.3, T.sig0 + 0.5 + i * 0.3, ease.out);
    // 1 percussion
    ctx.globalAlpha = a * st(0);
    { const x = cols[0], y = 1410; miniTooth(x - 22, y + 12, 0.24, 0, { noRoot: false });
      ctx.save(); ctx.translate(x + 12, y - 30); ctx.rotate(-0.6); rrect(ctx, 0, -5, 96, 10, 5); ctx.fillStyle = C.steel; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      ctx.strokeStyle = C.rust; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - 30, y - 34, 26 + i * 13, Math.PI * 0.86, Math.PI * 1.4); ctx.stroke(); }
      // little note
      ctx.fillStyle = C.rust; ctx.beginPath(); ctx.ellipse(x - 98, y - 60, 8, 6, -0.4, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 91, y - 62); ctx.lineTo(x - 91, y - 92); ctx.lineTo(x - 76, y - 84); ctx.stroke(); }
    txt(ctx, 'Metallic percussion', cols[0], 1502, `600 34px ${SS}`, C.ink, 'center', 0);
    // 2 no mobility
    ctx.globalAlpha = a * st(1);
    { const x = cols[1], y = 1410; miniTooth(x, y + 12, 0.24, 0, {});
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const yy = y - 62; ctx.beginPath(); ctx.moveTo(x - 58, yy); ctx.lineTo(x + 58, yy); ctx.moveTo(x - 46, yy - 10); ctx.lineTo(x - 58, yy); ctx.lineTo(x - 46, yy + 10); ctx.moveTo(x + 46, yy - 10); ctx.lineTo(x + 58, yy); ctx.lineTo(x + 46, yy + 10); ctx.stroke();
      ctx.strokeStyle = C.rust; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 16, yy + 18); ctx.lineTo(x + 16, yy - 18); ctx.stroke(); }
    txt(ctx, 'No mobility', cols[1], 1502, `600 34px ${SS}`, C.ink, 'center', 0);
    // 3 infraposition
    ctx.globalAlpha = a * st(2);
    { const x = cols[2], y = 1410;
      ctx.fillStyle = C.gum; ctx.fillRect(x - 100, y + 2, 200, 28); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x - 100, y + 2, 200, 28);
      miniTooth(x - 64, y, 0.2, 0, { noRoot: true }); miniTooth(x + 64, y, 0.2, 0, { noRoot: true }); miniTooth(x, y + 15, 0.2, 0, { noRoot: true });
      ctx.fillStyle = C.gum; ctx.fillRect(x - 99, y + 12, 198, 17);
      ctx.setLineDash([7, 5]); ctx.strokeStyle = C.rust; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 96, y - 46); ctx.lineTo(x + 96, y - 46); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.rust; ctx.beginPath(); ctx.moveTo(x, y - 27); ctx.lineTo(x - 7, y - 40); ctx.lineTo(x + 7, y - 40); ctx.closePath(); ctx.fill(); }
    txt(ctx, 'Infraposition', cols[2], 1502, `600 34px ${SS}`, C.ink, 'center', 0);
    txt(ctx, 'in a growing jaw', cols[2], 1540, `italic 400 30px ${SS}`, C.moss, 'center', 0);
    ctx.globalAlpha = a;
    txt(ctx, 'Fouad 2020, Dent Traumatol (IADT) · Kawanami 1999, Endod Dent Traumatol', CAPX, 1574, `400 22px ${SS}`, C.inkSoft, 'left', 0.1);
    ctx.restore();
  }
}

// decoronation inset (schematic): crown and root filling removed, root left below the crest, flap closed over it
function drawInset(x, y, w, h) {
  ctx.save(); rrect(ctx, x, y, w, h, 4); ctx.fillStyle = C.air; ctx.fill(); ctx.save(); rrect(ctx, x, y, w, h, 4); ctx.clip();
  const cx = x + w / 2, crest = y + h * 0.5;
  ctx.fillStyle = C.boneA; ctx.fillRect(x, crest, w, h); ctx.fillStyle = PAT.stipple; ctx.fillRect(x, crest, w, h);
  // root left in bone, canal empty (blood clot)
  ctx.save(); ctx.translate(cx, crest - 4); ctx.scale(0.3, 0.3);
  ctx.beginPath(); ctx.rect(-200, 62, 400, 600); ctx.clip();
  ctx.beginPath(); poly(ctx, MINI.O, true); ctx.fillStyle = C.dentin; ctx.fill(); ctx.fillStyle = PAT.hatch; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); pulpPath(ctx, MINI); ctx.fillStyle = C.clot; ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 25, crest + 14.5); ctx.lineTo(cx + 25, crest + 14.5); ctx.stroke();
  // new bone over the root top + flap ("topsoil") closed
  ctx.fillStyle = C.gum; ctx.beginPath(); ctx.moveTo(x, crest - 20); ctx.quadraticCurveTo(cx, crest - 30, x + w, crest - 20); ctx.lineTo(x + w, crest + 3); ctx.lineTo(x, crest + 3); ctx.closePath(); ctx.fill(); ctx.fillStyle = PAT.gum; ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, crest - 20); ctx.quadraticCurveTo(cx, crest - 30, x + w, crest - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, crest + 3); ctx.lineTo(x + w, crest + 3); ctx.stroke();
  // crown lifted off (ghost)
  ctx.save(); ctx.translate(cx + 4, crest - 36); ctx.rotate(0.14); ctx.scale(0.3, 0.3);
  ctx.beginPath(); crownOuter(ctx, MINI); ctx.closePath(); ctx.fillStyle = Kit.rgba(C.enamel, 0.9); ctx.fill(); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  ctx.strokeStyle = C.rust; ctx.fillStyle = C.rust; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx + 54, crest - 44); ctx.quadraticCurveTo(cx + 74, crest - 66, cx + 62, crest - 88); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 58, crest - 98); ctx.lineTo(cx + 54, crest - 82); ctx.lineTo(cx + 70, crest - 84); ctx.closePath(); ctx.fill();
  ctx.restore();
  rrect(ctx, x, y, w, h, 4); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.restore();
}

function drawCard(t) {
  const aIn = seg(t, T.card0, T.card0 + 0.6, ease.out), a = aIn * (1 - seg(t, T.card1, T.card1 + 0.42));
  if (a <= 0) return;
  const x = 50, y = 1074 + (1 - aIn) * 44, w = 980, h = 514;
  ctx.save(); ctx.globalAlpha = a;
  ctx.save(); ctx.shadowColor = 'rgba(50,35,10,0.35)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 7; rrect(ctx, x, y, w, h, 6); ctx.fillStyle = C.paperLight; ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; rrect(ctx, x, y, w, h, 6); ctx.stroke(); ctx.lineWidth = 1; rrect(ctx, x + 8, y + 8, w - 16, h - 16, 3); ctx.stroke();
  // tab
  const tf = `700 22px ${SS}`, tw = measure(ctx, 'EXPLANATION', tf, 5);
  ctx.fillStyle = C.paperLight; ctx.fillRect(W / 2 - tw / 2 - 16, y - 4, tw + 32, 22);
  txt(ctx, 'EXPLANATION', W / 2 + 2, y + 13, tf, C.inkSoft, 'center', 5);
  const L0 = 84;
  const s1 = seg(t, T.card0 + 0.3, T.card0 + 0.7, ease.out), s2 = seg(t, T.card0 + 0.9, T.card0 + 1.3, ease.out), s3 = seg(t, T.card0 + 1.6, T.card0 + 2.0, ease.out);
  // takeaway
  ctx.globalAlpha = a * s1;
  const head = 'NO KNOWN WAY TO ARREST IT', hp = fitFont(ctx, head, 700, LB, 50, 866, 1);
  txt(ctx, head, L0, y + 88, `700 ${hp}px ${LB}`, C.rust, 'left', 1);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(L0, y + 112); ctx.lineTo(950, y + 112); ctx.stroke(); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L0, y + 117); ctx.lineTo(950, y + 117); ctx.stroke();
  // signs recap
  numRich([['Signs  ', C.moss, 700], ['metallic percussion · no mobility · infraposition', C.ink, 400]], L0, y + 160, 31);
  ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L0, y + 180); ctx.lineTo(950, y + 180); ctx.stroke();
  // plan
  ctx.globalAlpha = a * s2;
  txt(ctx, 'GROWING PATIENT', L0, y + 228, `700 30px ${SS}`, C.moss, 'left', 2.4);
  txt(ctx, 'Plan early, e.g. decoronation', L0, y + 278, `600 42px ${SS}`, C.ink, 'left', 0);
  drawInset(736, y + 198, 214, 204);
  ctx.setLineDash([3, 6]); ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(L0, y + 304); ctx.lineTo(706, y + 304); ctx.stroke(); ctx.setLineDash([]);
  // protect
  ctx.globalAlpha = a * s3;
  txt(ctx, 'PROTECT THE PDL', L0, y + 352, `700 30px ${SS}`, C.moss, 'left', 2.4);
  const pb = 'Replant at once, or store in milk', pp = fitFont(ctx, pb, 600, SS, 42, 630, 0);
  txt(ctx, pb, L0, y + 402, `600 ${pp}px ${SS}`, C.ink, 'left', 0);
  ctx.globalAlpha = a * s2;
  txt(ctx, 'decoronation: crown off, root left to turn to bone · schematic', L0, y + 446, `italic 400 23px ${SS}`, C.inkSoft, 'left', 0);
  ctx.globalAlpha = a * s1;
  ctx.lineWidth = 1; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(L0, y + 462); ctx.lineTo(950, y + 462); ctx.stroke();
  txt(ctx, 'Campbell 2005, J Can Dent Assoc · Malmgren 1984, Scand J Dent Res · Fouad 2020, Dent Traumatol (IADT)', L0, y + 490, `400 ${fitFont(ctx, 'Campbell 2005, J Can Dent Assoc · Malmgren 1984, Scand J Dent Res · Fouad 2020, Dent Traumatol (IADT)', 400, SS, 23, 866, 0)}px ${SS}`, C.inkSoft, 'left', 0);
  ctx.restore();
}

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  drawPanel(t);
  const lo = seg(t, DUR - 0.5, DUR - 0.04, smooth);
  if (lo > 0 && startPanel) { ctx.save(); ctx.globalAlpha = lo; ctx.drawImage(startPanel, PX, PY); ctx.restore(); }
  drawPanelFrame();
  drawCaptions(t);
  drawCard(t);
}

window.REEL = {
  title: 'Replacement resorption (ankylosis)',
  duration: DUR,
  poster: 19.6,
  canvas,
  fonts: [`700 70px ${LB}`, `400 36px ${LB}`, `italic 400 36px ${LB}`, `italic 700 30px ${LB}`, `400 24px ${SS}`, `600 34px ${SS}`, `700 30px ${SS}`, `italic 400 28px ${SS}`],
  setup() {
    buildPatterns(); buildBackground(); buildStamp();
    ctx.drawImage(bg, 0, 0); drawPanel(0);
    startPanel = document.createElement('canvas'); startPanel.width = PW; startPanel.height = PH;
    startPanel.getContext('2d').drawImage(canvas, PX, PY, PW, PH, 0, 0, PW, PH);
  },
  render(t) { frame(((t % DUR) + DUR) % DUR); },
};
Kit.boot(window.REEL);
})();
