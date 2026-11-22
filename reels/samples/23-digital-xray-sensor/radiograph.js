/*
 * Sample 23 — procedural mandibular molar periapical + X-ray transmission map.
 * One set of outlines drives everything: the ghost tooth above the sensor (THREE.Shape), the dart fate, the scintillator
 * flashes, the charge in each pixel well and the gray level on the screen. Deterministic (Kit.hash / Kit.noise2 only).
 * Schematic attenuation values — tuned to look like a periapical, not measured.
 */
import { GW, GH } from './timeline.js';
const { clamp, lerp, noise2, hash } = Kit;

export const RW = 640, RH = 480;          // "radiograph" pixels (4:3). 1 mm ≈ 20 px, schematic.

/* ---- outlines as replayable commands (canvas 2-D context and THREE.Shape share the method names) ---- */
const MOLAR = [
  ['M', 228, 188],
  ['C', 214, 160, 204, 125, 208, 98], ['C', 210, 70, 222, 52, 246, 47], ['C', 268, 43, 286, 52, 300, 60],
  ['C', 308, 65, 330, 65, 338, 60], ['C', 352, 52, 372, 43, 394, 47], ['C', 418, 52, 430, 70, 432, 98],
  ['C', 436, 125, 426, 160, 412, 188],
  ['C', 414, 230, 420, 300, 416, 360], ['C', 413, 400, 408, 428, 396, 432], ['C', 384, 434, 376, 410, 370, 370],
  ['C', 362, 320, 350, 268, 322, 252],
  ['C', 300, 264, 290, 310, 284, 360], ['C', 280, 400, 276, 438, 262, 442], ['C', 246, 444, 240, 410, 236, 370],
  ['C', 230, 310, 226, 240, 228, 188], ['Z'],
];
const MOLAR_ENAMEL = [
  ['M', 228, 188],
  ['C', 214, 160, 204, 125, 208, 98], ['C', 210, 70, 222, 52, 246, 47], ['C', 268, 43, 286, 52, 300, 60],
  ['C', 308, 65, 330, 65, 338, 60], ['C', 352, 52, 372, 43, 394, 47], ['C', 418, 52, 430, 70, 432, 98],
  ['C', 436, 125, 426, 160, 412, 188],
  ['C', 406, 170, 401, 140, 399, 118], ['C', 397, 96, 386, 86, 372, 86], ['C', 356, 86, 340, 96, 320, 97],
  ['C', 300, 96, 284, 86, 268, 86], ['C', 254, 86, 243, 96, 241, 118], ['C', 239, 140, 234, 170, 228, 188], ['Z'],
];
const MOLAR_CHAMBER = [
  ['M', 250, 198], ['C', 248, 170, 254, 146, 263, 136], ['C', 272, 150, 300, 157, 320, 157],
  ['C', 340, 157, 368, 150, 377, 136], ['C', 386, 146, 392, 170, 390, 198],
  ['C', 388, 214, 372, 220, 352, 216], ['C', 336, 213, 304, 213, 288, 216], ['C', 268, 220, 252, 214, 250, 198], ['Z'],
];
const MOLAR_CANALS = [   // centre line [x,y] + half-width at each end
  { pts: [[267, 208], [262, 262], [259, 320], [258, 380], [261, 432]], w0: 8, w1: 1.6 },
  { pts: [[373, 208], [382, 262], [390, 320], [393, 376], [394, 422]], w0: 9, w1: 1.8 },
];
const PREMOLAR = [
  ['M', 100, 188], ['C', 88, 160, 80, 125, 86, 98], ['C', 90, 70, 108, 48, 142, 46], ['C', 176, 48, 196, 70, 201, 98],
  ['C', 206, 125, 196, 160, 184, 188], ['C', 184, 240, 174, 330, 160, 396], ['C', 154, 424, 134, 428, 128, 400],
  ['C', 116, 330, 100, 240, 100, 188], ['Z'],
];
const PREMOLAR_ENAMEL = [
  ['M', 100, 188], ['C', 88, 160, 80, 125, 86, 98], ['C', 90, 70, 108, 48, 142, 46], ['C', 176, 48, 196, 70, 201, 98],
  ['C', 206, 125, 196, 160, 184, 188], ['C', 178, 168, 173, 140, 171, 116], ['C', 169, 92, 156, 82, 142, 82],
  ['C', 128, 82, 116, 92, 114, 116], ['C', 112, 140, 106, 168, 100, 188], ['Z'],
];
const PREMOLAR_PULP = [
  ['M', 129, 150], ['C', 129, 122, 136, 106, 142, 102], ['C', 148, 106, 155, 122, 155, 150],
  ['C', 155, 220, 151, 320, 146, 398], ['L', 141, 398], ['C', 136, 320, 129, 220, 129, 150], ['Z'],
];

export function trace(target, cmds, xf = (x, y) => [x, y]) {
  for (const c of cmds) {
    if (c[0] === 'M') { const [x, y] = xf(c[1], c[2]); target.moveTo(x, y); }
    else if (c[0] === 'L') { const [x, y] = xf(c[1], c[2]); target.lineTo(x, y); }
    else if (c[0] === 'C') { const a = xf(c[1], c[2]), b = xf(c[3], c[4]), e = xf(c[5], c[6]); target.bezierCurveTo(a[0], a[1], b[0], b[1], e[0], e[1]); }
    else if (c[0] === 'Z') target.closePath();
  }
}
function canalPoly(cn, xf) {   // tapered ribbon around a centre line
  const P = cn.pts.map((p) => xf(p[0], p[1])), L = [], R = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, w = lerp(cn.w0, cn.w1, i / (P.length - 1));
    L.push([P[i][0] - (dy / n) * w, P[i][1] + (dx / n) * w]); R.push([P[i][0] + (dy / n) * w, P[i][1] - (dx / n) * w]);
  }
  return L.concat(R.reverse());
}

/* the four teeth in the film: half a premolar, second premolar, first molar (the one modelled in 3-D), second molar */
const ID = (x, y) => [x, y];
export const TEETH = [
  { out: PREMOLAR, en: PREMOLAR_ENAMEL, pulp: [PREMOLAR_PULP], canals: [], xf: (x, y) => [x - 123, y + (y > 188 ? (y - 188) * 0.04 : 0)] },
  { out: PREMOLAR, en: PREMOLAR_ENAMEL, pulp: [PREMOLAR_PULP], canals: [], xf: ID },
  { out: MOLAR, en: MOLAR_ENAMEL, pulp: [MOLAR_CHAMBER], canals: MOLAR_CANALS, xf: ID },
  { out: MOLAR, en: MOLAR_ENAMEL, pulp: [MOLAR_CHAMBER], canals: MOLAR_CANALS, xf: (x, y) => [320 + (x - 320) * 0.95 + 219, y > 188 ? 188 + (y - 188) * 0.9 : y + 3] },
];

function maskCanvas(draw, blur) {
  const c = document.createElement('canvas'); c.width = RW; c.height = RH;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000'; g.fillRect(0, 0, RW, RH);
  if (blur) g.filter = `blur(${blur}px)`;
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineJoin = 'round';
  draw(g);
  const d = g.getImageData(0, 0, RW, RH).data, out = new Float32Array(RW * RH);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
  return out;
}
const fbm = (x, y, s) => 0.55 * noise2(x, y, s) + 0.3 * noise2(x * 2.1, y * 2.1, s + 1) + 0.15 * noise2(x * 4.3, y * 4.3, s + 2);

export function buildRadiograph() {
  const fillAll = (key) => (g) => { for (const t of TEETH) { g.beginPath(); trace(g, t[key], t.xf); g.fill(); } };
  const mTooth = maskCanvas(fillAll('out'), 1.3);
  const mEnamel = maskCanvas(fillAll('en'), 1.1);
  const mPulp = maskCanvas((g) => {
    for (const t of TEETH) {
      for (const p of t.pulp) { g.beginPath(); trace(g, p, t.xf); g.fill(); }
      for (const cn of t.canals) { const poly = canalPoly(cn, t.xf); g.beginPath(); poly.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); }
    }
  }, 2.2);
  const strokeAll = (w) => (g) => { g.lineWidth = w; for (const t of TEETH) { g.beginPath(); trace(g, t.out, t.xf); g.stroke(); } };
  const mPdl = maskCanvas(strokeAll(9), 1.4);
  const mLd = maskCanvas(strokeAll(23), 2.2);
  const crestY = (x) => 213 + 3 * Math.sin(x * 0.031) + 2 * noise2(x * 0.05, 3.3, 5);
  const mBone = maskCanvas((g) => { g.beginPath(); g.moveTo(-10, crestY(-10)); for (let x = 0; x <= RW + 10; x += 10) g.lineTo(x, crestY(x)); g.lineTo(RW + 10, RH + 10); g.lineTo(-10, RH + 10); g.closePath(); g.fill(); }, 2.5);

  // attenuation -> transmission
  const Tm = new Float32Array(RW * RH);
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    const i = y * RW + x, tooth = mTooth[i], bone = mBone[i], out = 1 - tooth;
    const trab = fbm(x / 15, y / 13, 11), fine = noise2(x / 5.2, y / 5.2, 23);
    const marrow = clamp((trab + 0.1) * 2.2 + fine * 0.35);
    let att = 0.05;
    att += 0.12 * clamp((y - 150) / 60) * (1 - bone);                         // gingiva / cheek
    att += bone * (0.5 + 0.24 * (1 - marrow) + 0.1 * clamp((y - 400) / 80));  // trabecular bone, denser inferiorly
    att += bone * out * (0.34 * clamp(mLd[i] * 1.6 - mPdl[i] * 2.2) - 0.42 * clamp(mPdl[i] * 1.5));   // lamina dura / PDL space
    att += tooth * (0.82 + 0.26 * (1 - bone));                                // dentin (crown projects through more tooth)
    att += mEnamel[i] * 1.25;                                                 // enamel cap
    att -= mPulp[i] * tooth * 0.46;                                           // pulp chamber and canals
    Tm[i] = Math.exp(-Math.max(0.03, att));
  }
  const sampleT = (u, v) => {            // bilinear, u,v in 0..1 (u: mesial->distal, v: occlusal->apical)
    const fx = clamp(u) * (RW - 1), fy = clamp(v) * (RH - 1), x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(RW - 1, x0 + 1), y1 = Math.min(RH - 1, y0 + 1);
    return lerp(lerp(Tm[y0 * RW + x0], Tm[y0 * RW + x1], fx - x0), lerp(Tm[y1 * RW + x0], Tm[y1 * RW + x1], fx - x0), fy - y0);
  };
  // exposure per chip pixel (cell average), normalised so that the open beam = 1
  const E = new Float32Array(GW * GH), cw = RW / GW, ch = RH / GH; let tmax = 0;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    let s = 0, n = 0;
    for (let y = Math.floor(j * ch); y < (j + 1) * ch; y += 2) for (let x = Math.floor(i * cw); x < (i + 1) * cw; x += 2) { s += Tm[Math.min(RH - 1, y) * RW + Math.min(RW - 1, x)]; n++; }
    E[j * GW + i] = s / n; tmax = Math.max(tmax, s / n);
  }
  for (let k = 0; k < E.length; k++) E[k] /= tmax;
  const gray = (tr) => { const g = 1 - tr / tmax; return clamp(Math.pow(clamp(g), 0.86) * 1.06 + 0.035); };   // display: more exposure = darker

  // smooth image
  const hi = document.createElement('canvas'); hi.width = RW; hi.height = RH;
  { const g = hi.getContext('2d'); const im = g.createImageData(RW, RH);
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
      const i = y * RW + x; const vg = 1 - 0.16 * Math.pow(Math.hypot((x - RW / 2) / (RW / 2), (y - RH / 2) / (RH / 2)) / 1.41, 2.2);
      const v = clamp(gray(Tm[i]) * vg + (hash(x, y, 77) - 0.5) * 0.035) * 255;
      im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v * 1.01; im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0); }
  const blockGray = new Float32Array(GW * GH);
  for (let k = 0; k < E.length; k++) blockGray[k] = gray(E[k] * tmax);

  return { T: Tm, sampleT, E, blockGray, hi, tmax, MOLAR, MOLAR_CHAMBER, MOLAR_CANALS, canalPoly };
}
