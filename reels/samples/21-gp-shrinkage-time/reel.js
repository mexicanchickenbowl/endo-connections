/*
 * 21 · Warm GP: when does it stop shrinking?  — STRIP-CHART RECORDER style.
 * One full-frame 2-D canvas. render(t) is a pure function of t (see reels/SPEC.md).
 * Everything that is not a cited number is schematic: curve shapes, temperature trace, composite time axis,
 * canal gap (exaggerated). See NOTES.md / RESEARCH.md.
 */
(() => {
'use strict';
const { W, H, clamp, lerp, seg, ease, rng, hash, noise1, noise2 } = Kit;
const { canvas, ctx } = Kit.createCanvas();
const TAU = Math.PI * 2, rad = (d) => (d * Math.PI) / 180;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// ───────────────────────── palette / fonts ─────────────────────────
const C = {
  paper: '#f3ecd8', ink: '#25211c', dim: '#5d574c', pre: '#6f8f7b',
  red: '#c3271b', blue: '#1b5aa6', violet: '#52308c', black: '#2a2622',
  engr: '#ddd7c2', brass: '#b99a5b', dentin: '#ead9ae', dentinLn: '#b89f68', voidc: '#2a2420', sealer: '#e4ecf1', sealerLn: '#55697a',
};
const F = {
  title: (px) => `400 ${px}px "Special Elite"`,
  tw: (px, b) => `${b ? 700 : 400} ${px}px "Courier Prime"`,
  bc: (px, w = 600) => `${w} ${px}px "Barlow Condensed"`,
};

// ───────────────────────── layout ─────────────────────────
const TITLE = { x: 64, y: 238, w: 952, h: 232 };
const SPEC = { x: 64, y: 484, w: 566, h: 274 };
const WATCH = { cx: 824, cy: 648, R: 108 };
const LEG_Y = 791;
const CHY = 818, CHH = 562, PENX = 890, PW = 970;      // chart paper: y, height, pen x, visible paper width
const LN = { temp: 36, tempH: 120, vol: 156, volH: 250, br: 406, brH: 60, ru: 466, ruH: 60 };
const CAP = { x: 64, y: 1402, w: 896, h: 178 };

// paper coordinates (px along the strip): 0 = start, S1 = 10 min, S2 = 24 h, S3 = end of record
const S1 = 300, S2 = 646, S3 = 826, SEND = 2000, MINPX = S1 / 10, DAYPX = (S3 - S2) / 5;
const sHr = (h) => S1 + ((h - 1 / 6) / (24 - 1 / 6)) * (S2 - S1);
const S45 = sHr(0.75), S10 = sHr(10);

// ───────────────────────── timeline (s) ─────────────────────────
const T = { start: 0.7, minEnd: 5.2, hrStart: 6.0, hrEnd: 11.0, dayStart: 12.1, dayEnd: 13.9, ffStart: 19.75, ffEnd: 20.55, dur: 20.6 };
const EV = {
  penDown: [0.25, 0.55], cool: 4.62, mark1: 5.22, note1: 5.42, brk: 8.2, brkLab: 8.5, cryst: 9.9,   // cool / cryst are re-timed in setup()
  stable: 11.1, mark2: 11.5, lift: [11.7, 12.0], nodata: 14.05,
  slideB: [15.35, 15.9], slideA: [19.7, 20.2], reset: [19.9, 20.4], opOut: [19.6, 19.85],
};

function ramp(u, r = 0.08) {           // 0→1, linear with soft start/stop
  u = clamp(u); const k = 1 / (1 - r);
  if (u < r) return (k * u * u) / (2 * r);
  if (u > 1 - r) { const w = 1 - u; return 1 - (k * w * w) / (2 * r); }
  return k * (u - r / 2);
}
function paperS(t) {
  if (t < T.start) return 0;
  if (t < T.minEnd) return S1 * ramp((t - T.start) / (T.minEnd - T.start), 0.07);
  if (t < T.hrStart) return S1;
  if (t < T.hrEnd) return S1 + (S2 - S1) * ramp((t - T.hrStart) / (T.hrEnd - T.hrStart), 0.06);
  if (t < T.dayStart) return S2;
  if (t < T.dayEnd) return S2 + (S3 - S2) * ramp((t - T.dayStart) / (T.dayEnd - T.dayStart), 0.1);
  if (t < T.ffStart) return S3;
  return S3 + (SEND - S3) * ease.inOut(seg(t, T.ffStart, T.ffEnd));
}

function tWhenS(target) {              // first time the pen has passed paper position `target` (bisection; paperS is monotonic)
  let a = 0, b = T.ffStart; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (paperS(m) >= target) b = m; else a = m; } return b;
}

// ───────────────────────── schematic curves ─────────────────────────
const VA = 0.5, VB = 0.26, VTOT = VA + VB;
function vol(s) {                      // schematic volume loss, 0 … VTOT
  if (s <= 0) return 0;
  if (s <= S1) { const m = s / MINPX; return (VA * (1 - Math.exp(-m / 2.2))) / (1 - Math.exp(-10 / 2.2)); }
  const u = clamp((s - S1) / (S10 - S1)); return VA + VB * (1 - Math.pow(1 - u, 2.4));
}
function tmp(s) {                      // schematic cooling, 0 (hot) … 1 (37 °C)
  if (s <= 0) return 0; if (s >= S1) return 1;
  const m = s / MINPX; return (1 - Math.exp(-m / 2.0)) / (1 - Math.exp(-10 / 2.0));
}
const VOL0 = 44, TMP0 = 24;            // lane offsets of the two start levels (kept clear of the scale-plate labels)
const yVol = (s) => LN.vol + VOL0 + vol(s) * (LN.volH - 64) + 0.6 * noise1(s / 8, 3);
const yTmp = (s) => LN.temp + TMP0 + tmp(s) * (LN.tempH - 42) + 0.45 * noise1(s / 6, 5);

// ───────────────────────── small drawing helpers ─────────────────────────
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function spaced(c, str, x, y, sp = 0, align = 'left') {      // letter-spaced text, current font
  const ch = [...str], ws = ch.map((k) => c.measureText(k).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1);
  let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  c.textAlign = 'left'; ch.forEach((k, i) => { c.fillText(k, cx, y); cx += ws[i] + sp; }); return tot;
}
const ADV = 0.6;                       // Courier Prime advance (em)
/** typewriter text (monospace, per-character strike variation). segs: string | [[text,color],…] */
function tw(c, segs, x, y, px, o = {}) {
  if (typeof segs === 'string') segs = [[segs, o.color || C.ink]];
  let str = ''; const cols = [];
  for (const [s, col] of segs) { for (let i = 0; i < s.length; i++) cols.push(col || C.ink); str += s; }
  const adv = px * ADV, n = str.length, rev = o.reveal == null ? n : o.reveal, sd = o.seed || 1;
  const x0 = o.align === 'right' ? x - n * adv : o.align === 'center' ? x - (n * adv) / 2 : x;
  c.save(); c.font = F.tw(px, o.bold); c.textBaseline = 'alphabetic'; c.textAlign = 'center';
  const A = o.alpha == null ? 1 : o.alpha;
  for (let i = 0; i < n && i < rev; i++) {
    const ch = str[i]; if (ch === ' ') continue;
    const dy = (hash(i, sd, 11) - 0.5) * px * 0.03, a = 0.84 + 0.16 * hash(i, sd, 12), cx = x0 + (i + 0.5) * adv;
    c.globalAlpha = A * a; c.fillStyle = cols[i];
    if (ch === '→') {
      const yy = y - px * 0.27 + dy, w = adv * 0.44; c.strokeStyle = cols[i]; c.lineWidth = px * (o.bold ? 0.085 : 0.06); c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(cx - w, yy); c.lineTo(cx + w, yy); c.moveTo(cx + w - px * 0.16, yy - px * 0.13); c.lineTo(cx + w, yy); c.lineTo(cx + w - px * 0.16, yy + px * 0.13); c.stroke();
    } else c.fillText(ch, cx, y + dy);
  }
  c.restore(); return n * adv;
}
function screw(c, x, y, r, a = 0.6) {
  c.save();
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#d6d9d6'); g.addColorStop(0.7, '#8c9391'); g.addColorStop(1, '#4d5553');
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(x + 1, y + 2, r + 1.2, 0, TAU); c.fill();
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(20,25,24,.85)'; c.lineWidth = Math.max(1.6, r * 0.24); c.beginPath(); c.moveTo(x - Math.cos(a) * r * 0.72, y - Math.sin(a) * r * 0.72); c.lineTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72); c.stroke();
  c.restore();
}
function mounts(c, R) {                 // brass corner mounts of a card
  const s = 24;
  for (const [cx, cy, sx, sy] of [[R.x, R.y, 1, 1], [R.x + R.w, R.y, -1, 1], [R.x, R.y + R.h, 1, -1], [R.x + R.w, R.y + R.h, -1, -1]]) {
    c.save(); c.translate(cx - sx * 4, cy - sy * 4); c.scale(sx, sy);
    const g = c.createLinearGradient(0, 0, s, s); g.addColorStop(0, '#dcc489'); g.addColorStop(0.5, '#b3944f'); g.addColorStop(1, '#7c6431');
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 4; c.shadowOffsetY = 1.5 * sy;
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(s, 0); c.lineTo(0, s); c.closePath(); c.fill();
    c.shadowColor = 'transparent'; c.strokeStyle = 'rgba(255,240,200,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(1, 1); c.lineTo(s - 3, 1); c.stroke();
    c.restore();
  }
}
function card(c, R, seed = 5) {
  c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 20; c.shadowOffsetY = 7; c.fillStyle = C.paper; rr(c, R.x, R.y, R.w, R.h, 4); c.fill(); c.restore();
  c.save(); rr(c, R.x, R.y, R.w, R.h, 4); c.clip();
  const g = c.createLinearGradient(0, R.y, 0, R.y + R.h); g.addColorStop(0, '#f7f1df'); g.addColorStop(1, '#ebe2c8'); c.fillStyle = g; c.fillRect(R.x, R.y, R.w, R.h);
  const r = rng(seed);
  for (let i = 0; i < (R.w * R.h) / 300; i++) {
    const x = R.x + r() * R.w, y = R.y + r() * R.h, a = r() * TAU, l = 3 + r() * 9;
    c.strokeStyle = r() < 0.5 ? 'rgba(120,100,60,.06)' : 'rgba(255,255,255,.22)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  c.strokeStyle = 'rgba(90,70,30,.25)'; c.lineWidth = 1.5; rr(c, R.x + 0.75, R.y + 0.75, R.w - 1.5, R.h - 1.5, 4); c.stroke();
  c.restore();
}
function engr(c, str, x, y, px, o = {}) {   // engraved panel lettering
  c.save(); c.font = F.bc(px, o.w || 600); c.textBaseline = 'alphabetic';
  c.fillStyle = 'rgba(0,0,0,.55)'; spaced(c, str, x + 0.8, y + 1.4, o.sp == null ? 1.5 : o.sp, o.align);
  c.fillStyle = o.color || C.engr; c.globalAlpha = o.alpha == null ? 0.92 : o.alpha; const w = spaced(c, str, x, y, o.sp == null ? 1.5 : o.sp, o.align);
  c.restore(); return w;
}

// ───────────────────────── pre-rendered pieces ─────────────────────────
let tile, bg, overlay, shade, pc, pcx, acc, accx, STAMP = {}, titlePx = 80;

function makeTile() {
  tile = mk(500, CHH); const c = tile.getContext('2d');
  const img = c.createImageData(500, CHH), d = img.data;
  for (let y = 0; y < CHH; y++) for (let x = 0; x < 500; x++) {
    const w = x / 500;
    const n1 = lerp(noise2(x / 41, y / 41, 7), noise2((x - 500) / 41, y / 41, 7), w);
    const n2 = lerp(noise2(x / 2.6, y / 2.6, 9), noise2((x - 500) / 2.6, y / 2.6, 9), w);
    const v = n1 * 3.4 + n2 * 2.4, i = (y * 500 + x) * 4;
    d[i] = 243 + v; d[i + 1] = 236 + v; d[i + 2] = 215 + v * 1.4; d[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  // pre-printed grid (data lanes only)
  const yA = LN.temp, yB = LN.vol + LN.volH;
  for (let x = 0; x < 500; x += 10) {
    const maj = x % 50 === 0; c.fillStyle = maj ? 'rgba(78,124,98,.62)' : 'rgba(96,142,114,.30)';
    c.fillRect(x - (maj ? 0.7 : 0.5), yA, maj ? 1.4 : 1, yB - yA);
  }
  for (let y = yA; y <= yB + 0.1; y += 10) {
    const k = Math.round((y - yA) / 10), edge = y === yA || Math.abs(y - yB) < 0.1 || y === LN.vol, maj = k % 5 === 0;
    c.fillStyle = edge ? 'rgba(62,104,80,.9)' : maj ? 'rgba(78,124,98,.62)' : 'rgba(96,142,114,.30)';
    c.fillRect(0, y - (edge ? 1 : maj ? 0.7 : 0.5), 500, edge ? 2 : maj ? 1.4 : 1);
  }
  c.fillStyle = 'rgba(62,104,80,.75)'; c.fillRect(0, LN.ru - 0.8, 500, 1.6);                 // time-marker baseline
  // tiny pre-printed chart number (decoration)
  c.font = F.bc(15, 600); c.fillStyle = 'rgba(78,124,98,.7)'; c.textBaseline = 'alphabetic';
  spaced(c, 'CHART No. 21-GP', 258, CHH - 12, 1.5, 'left'); spaced(c, 'CHART No. 21-GP', 8, CHH - 12, 1.5, 'left');
  // sprocket holes
  for (let x = 25; x < 500; x += 50) for (const y of [16, CHH - 16]) {
    if (y > 100 && ((x > 0 && x < 130) || (x > 250 && x < 380))) continue;         // leave room for the chart number
    c.fillStyle = 'rgba(120,100,60,.28)'; c.beginPath(); c.arc(x + 0.8, y + 1.2, 8.2, 0, TAU); c.fill();
    c.fillStyle = '#121714'; c.beginPath(); c.arc(x, y, 7.2, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 7.6, 0.2, 1.9); c.stroke();
  }
  // edge shading
  let g = c.createLinearGradient(0, 0, 0, 10); g.addColorStop(0, 'rgba(90,70,30,.30)'); g.addColorStop(1, 'rgba(90,70,30,0)'); c.fillStyle = g; c.fillRect(0, 0, 500, 10);
  g = c.createLinearGradient(0, CHH - 10, 0, CHH); g.addColorStop(0, 'rgba(90,70,30,0)'); g.addColorStop(1, 'rgba(90,70,30,.30)'); c.fillStyle = g; c.fillRect(0, CHH - 10, 500, 10);
}

function makeStamp(lines, o = {}) {
  const pad = o.pad || [16, 11], col = o.color || C.violet, m = 8, gap = 9;
  const tc = mk(8, 8).getContext('2d'); let w = 0, h = 0; const metr = [];
  for (const ln of lines) {
    tc.font = F.bc(ln.px, 700); const ch = [...ln.t], ws = ch.map((k) => tc.measureText(k).width);
    const tot = ws.reduce((a, b) => a + b, 0) + (ln.sp || 0) * (ch.length - 1);
    metr.push({ ch, ws, tot }); w = Math.max(w, tot); h += ln.px * 0.72;
  }
  h += (lines.length - 1) * gap;
  const bw = Math.ceil(w + pad[0] * 2), bh = Math.ceil(h + pad[1] * 2), cv = mk(bw + m * 2, bh + m * 2), c = cv.getContext('2d');
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = o.lw || 4; rr(c, m + 2, m + 2, bw - 4, bh - 4, o.r == null ? 7 : o.r); c.stroke();
  if (o.double) { c.lineWidth = 1.6; rr(c, m + 8.5, m + 8.5, bw - 17, bh - 17, 3); c.stroke(); }
  let y = m + pad[1];
  lines.forEach((ln, i) => {
    c.font = F.bc(ln.px, 700); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; y += ln.px * 0.72;
    let x = m + (bw - metr[i].tot) / 2; metr[i].ch.forEach((k, j) => { c.fillText(k, x, y); x += metr[i].ws[j] + (ln.sp || 0); });
    y += gap;
  });
  const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data, sd = o.seed || 1;   // worn-rubber ink texture
  for (let yy = 0; yy < cv.height; yy++) for (let xx = 0; xx < cv.width; xx++) {
    const i = (yy * cv.width + xx) * 4 + 3; if (!d[i]) continue;
    const n = noise2(xx / 10, yy / 10, sd) * 0.6 + noise2(xx / 2.4, yy / 2.4, sd + 3) * 0.5, f = clamp((n + 0.66) / 0.5);
    d[i] = d[i] * (0.5 + 0.5 * f) * (0.88 + 0.12 * hash(xx, yy, sd));
  }
  c.putImageData(img, 0, 0);
  return { cv, w: cv.width, h: cv.height };
}
function drawStamp(c, st, x, y, rot, tApp, t) {
  const p = seg(t, tApp, tApp + 0.15, ease.out); if (p <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rad(rot)); const k = lerp(1.28, 1, p); c.scale(k, k);
  c.globalAlpha = p * 0.94; c.globalCompositeOperation = 'multiply'; c.drawImage(st.cv, -st.w / 2, -st.h / 2); c.restore();
}

function panelTexture(c) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#303d37'); g.addColorStop(0.5, '#28332f'); g.addColorStop(1, '#1e2724');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = rng(21);
  for (let i = 0; i < 11000; i++) {       // hammertone enamel
    const x = r() * W, y = r() * H, s = 1.4 + r() * 5.2;
    c.fillStyle = r() < 0.5 ? `rgba(255,255,255,${0.012 + r() * 0.028})` : `rgba(0,0,0,${0.02 + r() * 0.05})`;
    c.beginPath(); c.ellipse(x, y, s, s * (0.55 + r() * 0.6), r() * 3, 0, TAU); c.fill();
  }
  const v = c.createRadialGradient(W / 2, 900, 520, W / 2, 900, 1300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.38)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
function seam(c, y) { c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, y, W, 3); c.fillStyle = 'rgba(255,255,255,.09)'; c.fillRect(0, y + 3, W, 1.5); }

function arcText(c, str, cx, cy, r, midDeg, sp = 0) {   // text along a circle; midDeg clockwise from 12 o'clock
  const ch = [...str], ws = ch.map((k) => c.measureText(k).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1);
  let a = rad(midDeg) - tot / (2 * r); c.textAlign = 'center';
  ch.forEach((k, i) => { const aa = a + ws[i] / 2 / r; c.save(); c.translate(cx + Math.sin(aa) * r, cy - Math.cos(aa) * r); c.rotate(aa); c.fillText(k, 0, 0); c.restore(); a += (ws[i] + sp) / r; });
}
const dialAng = (s) => rad(-100 + 200 * clamp(s / S3));       // radians clockwise from 12 o'clock
function watchStatic(c) {
  const { cx, cy, R } = WATCH;
  c.save();
  // bow
  c.strokeStyle = '#8f9795'; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy - R - 43, 14, 0, TAU); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy - R - 43, 15.5, 3.6, 5.4); c.stroke();
  // case
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 22; c.shadowOffsetY = 9;
  let g = c.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, '#e2e5e2'); g.addColorStop(0.35, '#9aa2a0'); g.addColorStop(0.6, '#5d6664'); g.addColorStop(1, '#b4bbb9');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.shadowColor = 'transparent';
  g = c.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, '#59615f'); g.addColorStop(0.5, '#c9cfcd'); g.addColorStop(1, '#4a5250');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R - 7, 0, TAU); c.fill();
  // dial
  const rd = R - 12;
  g = c.createRadialGradient(cx - 20, cy - 30, 10, cx, cy, R); g.addColorStop(0, '#fbf6e6'); g.addColorStop(1, '#e8dfc5');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rd, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(40,35,25,.6)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, rd, 0, TAU); c.stroke();
  // scale: the same composite time axis as the chart
  c.strokeStyle = 'rgba(37,33,28,.8)'; c.lineWidth = 1.4; c.beginPath(); c.arc(cx, cy, rd - 9, dialAng(0) - Math.PI / 2, dialAng(S2) - Math.PI / 2); c.stroke();
  c.strokeStyle = 'rgba(37,33,28,.45)'; c.setLineDash([3, 6]); c.beginPath(); c.arc(cx, cy, rd - 9, dialAng(S2) - Math.PI / 2, dialAng(S3) - Math.PI / 2); c.stroke(); c.setLineDash([]);   // past 24 h: nothing recorded
  c.strokeStyle = C.red; c.lineWidth = 6; c.globalAlpha = 0.9; c.beginPath(); c.arc(cx, cy, rd - 5, dialAng(S45) - Math.PI / 2, dialAng(S10) - Math.PI / 2); c.stroke(); c.globalAlpha = 1;
  const tick = (s, len, lw, col) => { const a = dialAng(s), r1 = rd - 9, r0 = r1 - len; c.strokeStyle = col || C.ink; c.lineWidth = lw; c.beginPath(); c.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); c.lineTo(cx + Math.sin(a) * r1, cy - Math.cos(a) * r1); c.stroke(); };
  for (let k = 0; k <= 10; k++) tick(MINPX * k, k % 5 === 0 ? 9 : 5, 1.5);
  for (let h = 1; h <= 24; h++) tick(sHr(h), h % 5 === 0 ? 9 : 5, 1.5);
  tick(0, 14, 3); tick(S1, 14, 3); tick(S2, 14, 3);
  // read-out window
  rr(c, cx - 64, cy + 28, 128, 44, 5); c.fillStyle = '#efe6cb'; c.fill(); c.strokeStyle = 'rgba(40,35,25,.65)'; c.lineWidth = 1.5; c.stroke();
  g = c.createLinearGradient(0, cy + 28, 0, cy + 40); g.addColorStop(0, 'rgba(60,45,20,.28)'); g.addColorStop(1, 'rgba(60,45,20,0)'); c.fillStyle = g; c.fillRect(cx - 63, cy + 29, 126, 11);
  c.restore();
}

function makeBG() {
  bg = mk(W, H); const c = bg.getContext('2d');
  panelTexture(c);
  // ── top of the instrument (under the Reels header) ──
  seam(c, 222);
  for (let i = 0; i < 26; i++) { const x = 150 + i * 30; rr(c, x, 52, 12, 64, 6); c.fillStyle = 'rgba(0,0,0,.6)'; c.fill(); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x + 12, 58, 1.5, 54); }
  engr(c, 'STRIP-CHART DILATOMETER', W / 2, 172, 36, { sp: 7, align: 'center', alpha: 0.8 });
  engr(c, 'MODEL GP-21  ·  2-PEN RECORDER', W / 2, 206, 21, { sp: 4, align: 'center', alpha: 0.5, w: 500 });
  for (const [x, y] of [[40, 40], [1040, 40], [40, 190], [1040, 190]]) screw(c, x, y, 11, hash(x, y) * 3);
  // ── title card ──
  card(c, TITLE, 3); mounts(c, TITLE);
  const tx = TITLE.x + 30;
  c.font = F.bc(20, 600); c.fillStyle = C.pre; c.textBaseline = 'alphabetic';
  const w1 = spaced(c, 'SPECIMEN', tx, TITLE.y + 48, 2.2);
  tw(c, 'WARM GUTTA-PERCHA', tx + w1 + 14, TITLE.y + 50, 44, { bold: 1, seed: 4 });
  const hw = 15 * 26 * ADV, hx = TITLE.x + TITLE.w - 30 - hw;
  tw(c, '@natebrooksendo', hx, TITLE.y + 48, 26, { color: C.dim, seed: 6 });
  c.fillStyle = 'rgba(78,124,98,.8)'; c.fillRect(TITLE.x + 26, TITLE.y + 61, TITLE.w - 52, 1.6); c.fillRect(TITLE.x + 26, TITLE.y + 65, TITLE.w - 52, 0.8);
  c.font = F.title(100); const mw = c.measureText('STOP SHRINKING?').width / 100; titlePx = Math.min(90, Math.floor(880 / mw));
  c.font = F.title(titlePx); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const ty1 = TITLE.y + 140, ty2 = TITLE.y + 220;
  c.fillStyle = C.ink; c.fillText('WHEN DOES IT', tx - 2, ty1);
  c.fillStyle = C.red; c.fillText('STOP SHRINKING?', tx - 2, ty2);
  // ── specimen card (contents are dynamic) ──
  card(c, SPEC, 8);
  // ── stopwatch ──
  watchStatic(c);
  // ── legend engraved above the chart ──
  c.fillStyle = C.blue; c.beginPath(); c.arc(76, LEG_Y - 10, 8, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; c.stroke();
  let lx = 94 + engr(c, 'TEMP', 94, LEG_Y, 30, { sp: 2 }) + 30;
  c.fillStyle = C.red; c.beginPath(); c.arc(lx, LEG_Y - 10, 8, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.stroke();
  engr(c, 'GP SIZE', lx + 18, LEG_Y, 30, { sp: 2 });
  engr(c, 'SCHEMATIC CURVES  ·  2 BENCH STUDIES (IN VITRO)', 1012, LEG_Y - 1, 26, { sp: 1.2, align: 'right', alpha: 0.85, w: 500 });
  // ── chart bed ──
  c.fillStyle = '#101512'; c.fillRect(0, CHY - 18, W, CHH + 36);
  let g = c.createLinearGradient(0, CHY - 18, 0, CHY); g.addColorStop(0, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, CHY - 18, W, 18);
  c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, CHY + CHH + 18, W, 1.5);
  // ── caption card ──
  card(c, CAP, 13); mounts(c, CAP);
  c.font = F.bc(19, 600); c.fillStyle = C.pre; spaced(c, 'READING', CAP.x + 30, CAP.y + 27, 2.4);
  c.fillStyle = 'rgba(78,124,98,.7)'; c.fillRect(CAP.x + 108, CAP.y + 20, CAP.w - 138, 1.2);
  // ── control panel (under the Reels caption area) ──
  seam(c, 1592);
  engr(c, 'CHART SPEED', 210, 1640, 26, { sp: 4, align: 'center', alpha: 0.8 });
  for (const [a, s] of [[-52, 'cm/min'], [0, 'cm/h'], [52, 'cm/day']]) {
    const x = 210 + Math.sin(rad(a)) * 118, y = 1800 - Math.cos(rad(a)) * 112;
    engr(c, s, x, y + 6, 24, { sp: 1, align: 'center', alpha: 0.75, w: 500 });
    c.strokeStyle = 'rgba(221,215,194,.7)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(210 + Math.sin(rad(a)) * 76, 1800 - Math.cos(rad(a)) * 76); c.lineTo(210 + Math.sin(rad(a)) * 88, 1800 - Math.cos(rad(a)) * 88); c.stroke();
  }
  engr(c, 'RECORD', 540, 1850, 24, { sp: 3, align: 'center', alpha: 0.75 });
  engr(c, 'PEN LIFT', 800, 1850, 24, { sp: 3, align: 'center', alpha: 0.75 });
  for (const [x, y] of [[40, 1630], [1040, 1630], [40, 1880], [1040, 1880]]) screw(c, x, y, 11, hash(x, y) * 3);
}

function makeOverlay() {                // static parts that sit above the paper
  overlay = mk(W, H); const c = overlay.getContext('2d');
  // paper guide rails
  for (const y of [CHY - 10, CHY + CHH - 5]) {
    const g = c.createLinearGradient(0, y, 0, y + 15); g.addColorStop(0, '#c9cfcc'); g.addColorStop(0.45, '#8a9290'); g.addColorStop(1, '#4b5351');
    c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 6; c.shadowOffsetY = y < CHY ? 3 : -2; c.fillStyle = g; c.fillRect(0, y, W, 15); c.restore();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(0, y + 1, W, 1.2);
    for (const x of [140, 480, 820]) screw(c, x, y + 7.5, 5.2, hash(x, y) * 3);
  }
  // scale plate at the pen station
  const px0 = PENX + 9, pw = 63, py0 = CHY + 9, py1 = CHY + LN.vol + LN.volH + 12;
  let g = c.createLinearGradient(px0 - 16, 0, px0, 0); g.addColorStop(0, 'rgba(40,30,10,0)'); g.addColorStop(1, 'rgba(40,30,10,.32)'); c.fillStyle = g; c.fillRect(px0 - 16, py0, 16, py1 - py0);
  g = c.createLinearGradient(px0, 0, px0 + pw, 0); g.addColorStop(0, '#f4f1e6'); g.addColorStop(0.12, '#e7e3d5'); g.addColorStop(1, '#cfcab9');
  c.fillStyle = g; c.fillRect(px0, py0, pw, py1 - py0); c.strokeStyle = 'rgba(30,30,25,.6)'; c.lineWidth = 1.5; c.strokeRect(px0 + 0.75, py0 + 0.75, pw - 1.5, py1 - py0 - 1.5);
  for (let y = LN.temp; y <= LN.vol + LN.volH + 0.1; y += 10) { const maj = (y - LN.temp) % 50 === 0; c.fillStyle = 'rgba(37,33,28,.75)'; c.fillRect(px0 + 2, CHY + y - 0.7, maj ? 11 : 6, 1.4); }
  c.fillStyle = 'rgba(37,33,28,.8)'; c.fillRect(px0 + 2, CHY + LN.vol - 1, pw - 4, 2);
  // temperature anchors (the only numbers on the scale): start of Lottanti's controlled drop, and body temperature
  c.font = F.bc(30, 700); c.textBaseline = 'alphabetic'; c.fillStyle = C.blue; c.textAlign = 'left';
  const y75 = CHY + LN.temp + TMP0, y37 = y75 + (LN.tempH - 42);
  c.fillText('75°C', px0 + 10, y75 - 20); c.fillText('37°C', px0 + 10, y37 - 15);          // both labels sit ABOVE their blue tick, inside the temperature lane
  c.fillRect(px0 + 2, y75 - 1.5, 18, 3); c.fillRect(px0 + 2, y37 - 1.5, 18, 3);
  c.fillStyle = C.red; c.fillRect(px0 + 2, CHY + LN.vol + VOL0 - 1.5, 18, 3);               // starting size (no scale: schematic)
  c.beginPath(); c.moveTo(px0 + 38, CHY + LN.vol + 204); c.lineTo(px0 + 38, CHY + LN.vol + 238); c.strokeStyle = C.red; c.lineWidth = 3; c.stroke();
  c.beginPath(); c.moveTo(px0 + 30, CHY + LN.vol + 230); c.lineTo(px0 + 38, CHY + LN.vol + 242); c.lineTo(px0 + 46, CHY + LN.vol + 230); c.closePath(); c.fill();
  // pen-drive housing (right)
  const hx = PENX + 72, hy = CHY - 24, hh = CHH + 48;
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 14; c.shadowOffsetX = -5;
  g = c.createLinearGradient(hx, 0, W, 0); g.addColorStop(0, '#56645d'); g.addColorStop(0.08, '#47544e'); g.addColorStop(1, '#333e39');
  c.fillStyle = g; c.fillRect(hx, hy, W - hx, hh); c.restore();
  c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(hx, hy, 2, hh); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(hx, hy, W - hx, 1.5);
  rr(c, hx + 22, CHY + LN.temp - 8, 12, LN.tempH + LN.volH + 16, 6); c.fillStyle = '#0d110f'; c.fill();
  c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(hx + 34, CHY + LN.temp - 2, 1.2, LN.tempH + LN.volH + 4);
  screw(c, hx + 80, hy + 20, 8, 0.4); screw(c, hx + 80, hy + hh - 20, 8, 2.1);
  engr(c, 'REC', hx + 62, CHY + 22, 20, { sp: 2, alpha: 0.7 });
  engr(c, 'PEN 2', hx + 50, CHY + LN.temp + 66, 20, { sp: 2, alpha: 0.6 });
  engr(c, 'PEN 1', hx + 50, CHY + LN.vol + 130, 20, { sp: 2, alpha: 0.6 });
  // soft lighting on the paper
  shade = mk(PW, CHH); const s = shade.getContext('2d');
  g = s.createLinearGradient(0, 0, 60, 0); g.addColorStop(0, 'rgba(40,30,10,.20)'); g.addColorStop(1, 'rgba(40,30,10,0)'); s.fillStyle = g; s.fillRect(0, 0, 60, CHH);
  g = s.createLinearGradient(0, 0, 0, CHH); g.addColorStop(0, 'rgba(40,30,10,.10)'); g.addColorStop(0.12, 'rgba(40,30,10,0)'); g.addColorStop(0.88, 'rgba(40,30,10,0)'); g.addColorStop(1, 'rgba(40,30,10,.12)'); s.fillStyle = g; s.fillRect(0, 0, PW, CHH);
}

// ───────────────────────── chart paper (paper coordinates) ─────────────────────────
function strokeTrace(c, fn, s1, color, lw) {
  c.beginPath(); c.moveTo(0, fn(0)); for (let s = 1.5; s < s1; s += 1.5) c.lineTo(s, fn(s)); c.lineTo(s1, fn(s1));
  c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = color;
  c.globalAlpha = 0.16; c.lineWidth = lw + 4; c.stroke(); c.globalAlpha = 0.95; c.lineWidth = lw; c.stroke(); c.globalAlpha = 1;
}
function markLine(c, s, tA, t) {
  const p = seg(t, tA, tA + 0.2, ease.out); if (p <= 0) return;
  const y0 = LN.temp - 10, y1 = LN.ru + LN.ruH - 8; c.fillStyle = C.black; c.globalAlpha = 0.9;
  c.fillRect(s - 6.2, y0, 2.2, (y1 - y0) * p); c.fillRect(s - 1.6, y0, 2.2, (y1 - y0) * p);
  c.beginPath(); c.moveTo(s - 11, y0 - 11); c.lineTo(s + 5, y0 - 11); c.lineTo(s - 3, y0 + 1); c.closePath(); c.fill(); c.globalAlpha = 1;
}
function note(c, s, tA, t) {            // operator's typed note at a speed-change mark
  const n = Math.floor(seg(t, tA, tA + 0.42) * 19); if (n <= 0) return;
  tw(c, 'CHART SPEED', s - 13, LN.vol + 37, 30, { bold: 1, align: 'right', reveal: n, seed: 31 });
  tw(c, 'CHANGED', s - 13, LN.vol + 71, 30, { bold: 1, align: 'right', reveal: n - 11, seed: 32 });
}
function drawPaper(c, S, t) {
  const off = PENX - S; let x0 = (((off % 500) + 500) % 500) - 500;
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  for (let x = x0; x < PW; x += 500) c.drawImage(tile, x, 0);
  if (off + S3 + 60 < 0) return;                         // everything has scrolled off
  c.save(); c.translate(off, 0); c.globalCompositeOperation = 'multiply';
  // ── printed by the recorder: appears at the pen station ──
  c.save(); c.beginPath(); c.rect(-4000, 0, 4000 + S + 3, CHH); c.clip();
  const sr = Math.min(S, S2), down = seg(t, EV.penDown[0] + 0.12, EV.penDown[1]);
  if (down > 0) {
    c.fillStyle = C.blue; c.globalAlpha = 0.9 * down; c.beginPath(); c.arc(0, yTmp(0), 3.1, 0, TAU); c.fill();
    c.fillStyle = C.red; c.beginPath(); c.arc(0, yVol(0), 3.4, 0, TAU); c.fill(); c.globalAlpha = 1;
  }
  if (sr > 0) {
    strokeTrace(c, yTmp, sr, C.blue, 3.6); strokeTrace(c, yVol, sr, C.red, 4.4);
    if (S >= S2 && t > EV.lift[0]) { c.fillStyle = C.red; c.beginPath(); c.arc(S2, yVol(S2), 3.6, 0, TAU); c.fill(); c.fillStyle = C.blue; c.beginPath(); c.arc(S2, yTmp(S2), 3.2, 0, TAU); c.fill(); }
  }
  // time marks
  c.fillStyle = C.black; c.globalAlpha = 0.85;
  const tick = (s, len) => c.fillRect(s - 0.9, LN.ru, 1.8, len);
  if (t >= T.start) { for (let k = 0; k <= 10; k++) tick(23 * k, k % 5 === 0 ? 17 : 9); for (let h = 1; h <= 24; h++) tick(sHr(h), h % 5 === 0 ? 17 : 9); for (let dd = 2; dd <= 6; dd++) tick(S2 + (dd - 1) * DAYPX, 13); }
  c.globalAlpha = 1;
  if (t >= T.start) {
    tw(c, '0', 5, LN.ru + 49, 30, { bold: 1, seed: 21 });
    tw(c, '10 min', S1 - 12, LN.ru + 49, 30, { bold: 1, align: 'right', seed: 22 });
    tw(c, '24 h', S2 - 12, LN.ru + 49, 30, { bold: 1, align: 'right', seed: 23 });
    tw(c, 'days ?', S2 + 14, LN.ru + 49, 30, { bold: 1, seed: 24 });
  }
  markLine(c, S1, EV.mark1, t); markLine(c, S2, EV.mark2, t);
  c.restore();
  // ── added by the operator: stamps, typed notes, bracket ──
  drawStamp(c, STAMP.cool, 108, LN.vol + 206, -4, EV.cool, t);
  note(c, S1, EV.note1, t);
  const bp = seg(t, EV.brk, EV.brk + 0.45, ease.inOut);
  if (bp > 0) {
    const by = LN.br + 15, xe = lerp(S45, S10, bp);
    c.strokeStyle = C.red; c.lineWidth = 3; c.lineCap = 'butt'; c.globalAlpha = 0.92;
    c.beginPath(); c.moveTo(S45, by); c.lineTo(xe, by); c.moveTo(S45, by - 9); c.lineTo(S45, by + 9); if (bp >= 1) { c.moveTo(S10, by - 9); c.lineTo(S10, by + 9); } c.stroke();
    c.lineWidth = 1.6; c.setLineDash([5, 5]); c.globalAlpha = 0.7 * seg(t, EV.brk + 0.3, EV.brk + 0.7);
    c.beginPath(); c.moveTo(S45, by - 12); c.lineTo(S45, yVol(S45) + 6); c.moveTo(S10, by - 12); c.lineTo(S10, yVol(S10) + 6); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    tw(c, '45 min–10 h', S1 + 9, LN.br + 53, 30, { bold: 1, color: C.red, reveal: Math.floor(seg(t, EV.brkLab, EV.brkLab + 0.35) * 11), seed: 41 });
  }
  drawStamp(c, STAMP.cryst, 357, LN.vol + 101, 4, EV.cryst, t);
  drawStamp(c, STAMP.stable, 538, LN.vol + 240, -3, EV.stable, t);
  note(c, S2, EV.note2, t);
  const hp = seg(t, EV.nodata - 0.05, EV.nodata + 0.3);
  if (hp > 0) {
    c.save(); c.beginPath(); c.rect(S2 + 8, LN.temp + 2, S3 - S2 - 8, LN.tempH + LN.volH - 4); c.clip();
    c.strokeStyle = 'rgba(60,54,48,1)'; c.globalAlpha = 0.2 * hp; c.lineWidth = 1.6; c.beginPath();
    for (let k = -30; k < 24; k++) { c.moveTo(S2 + k * 15, LN.vol + LN.volH); c.lineTo(S2 + k * 15 + 380, LN.temp); } c.stroke(); c.restore();
  }
  drawStamp(c, STAMP.nodata, (S2 + S3) / 2 - 2, LN.vol + 104, -8, EV.nodata, t);
  c.restore();
}

// ───────────────────────── pens ─────────────────────────
function drawPen(y, color, lift, light) {
  const c = ctx, ox = lift * 3, oy = -lift * 7, x = PENX + ox, yy = y + oy, hx = PENX + 94;
  c.save();
  c.shadowColor = `rgba(30,22,8,${0.42 - 0.16 * lift})`; c.shadowBlur = 5 + 9 * lift; c.shadowOffsetX = 3 + 7 * lift; c.shadowOffsetY = 5 + 11 * lift;
  // arm
  let g = c.createLinearGradient(0, yy - 4, 0, yy + 4); g.addColorStop(0, '#eef0ee'); g.addColorStop(0.5, '#a7aeac'); g.addColorStop(1, '#646c6a');
  c.fillStyle = g; rr(c, x + 30, yy - 3.5, hx - x - 26, 7, 3); c.fill();
  // cartridge
  g = c.createLinearGradient(0, yy - 11, 0, yy + 11); g.addColorStop(0, light); g.addColorStop(0.45, color); g.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = color; c.beginPath(); c.moveTo(x + 1, yy); c.quadraticCurveTo(x + 9, yy - 3, x + 16, yy - 10.5); c.lineTo(x + 31, yy - 10.5); c.arc(x + 31, yy, 10.5, -Math.PI / 2, Math.PI / 2); c.lineTo(x + 16, yy + 10.5); c.quadraticCurveTo(x + 9, yy + 3, x + 1, yy); c.closePath(); c.fill();
  c.shadowColor = 'transparent'; c.fillStyle = g; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
  c.fillStyle = 'rgba(255,255,255,.55)'; rr(c, x + 17, yy - 7.5, 15, 3, 1.5); c.fill();
  c.fillStyle = '#2b2f2e'; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + 8, yy - 3); c.lineTo(x + 8, yy + 3); c.closePath(); c.fill();
  // index on the scale plate + carriage on the housing
  c.fillStyle = color; c.fillRect(PENX + 60 + ox, yy - 1.5, 12, 3);
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 6; c.shadowOffsetY = 3;
  g = c.createLinearGradient(0, yy - 15, 0, yy + 15); g.addColorStop(0, '#7b8683'); g.addColorStop(1, '#3a4340'); c.fillStyle = g; rr(c, hx - 4 + ox, yy - 15, 34, 30, 4); c.fill();
  c.shadowColor = 'transparent'; c.fillStyle = color; c.beginPath(); c.arc(hx + 13 + ox, yy, 5.5, 0, TAU); c.fill();
  c.restore();
}

function drawChart(t, S) {
  const Sp = paperS(Math.max(0, t - 1 / 30)), n = clamp(Math.ceil(Math.abs(S - Sp) / 5), 1, 10);
  if (n === 1) { drawPaper(pcx, S, t); ctx.drawImage(pc, 0, CHY); }
  else {                                                   // fast paper feed → motion blur
    for (let i = 0; i < n; i++) { pcx.save(); drawPaper(pcx, lerp(Sp, S, (i + 1) / n), t); pcx.restore(); accx.globalAlpha = 1 / (i + 1); accx.drawImage(pc, 0, 0); }
    ctx.drawImage(acc, 0, CHY);
  }
  ctx.drawImage(shade, 0, CHY);
  ctx.drawImage(overlay, 0, 0);
  // REC lamp
  const rec = Math.min(seg(t, T.start - 0.1, T.start + 0.05), 1 - seg(t, EV.lift[0], EV.lift[0] + 0.2));
  const lx = PENX + 72 + 44, ly = CHY + 15;
  ctx.save(); ctx.fillStyle = '#3a1512'; ctx.beginPath(); ctx.arc(lx, ly, 8, 0, TAU); ctx.fill();
  if (rec > 0) { ctx.globalAlpha = rec; ctx.shadowColor = 'rgba(255,60,30,.9)'; ctx.shadowBlur = 16; ctx.fillStyle = '#ff5136'; ctx.beginPath(); ctx.arc(lx, ly, 7, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,230,210,.8)'; ctx.beginPath(); ctx.arc(lx - 2, ly - 2.5, 2.2, 0, TAU); ctx.fill(); }
  ctx.restore();
  // pens
  const lift = t < EV.lift[0] ? 1 - seg(t, EV.penDown[0], EV.penDown[1], ease.inOut) : seg(t, EV.lift[0], EV.lift[1], ease.inOut);
  const back = seg(t, EV.reset[0], EV.reset[1], ease.inOut), sr = Math.min(S, S2);
  const yb = CHY + lerp(yTmp(sr), yTmp(0), back), yr = CHY + lerp(yVol(sr), yVol(0), back);
  drawPen(yb, C.blue, lift, '#8fb8ee'); drawPen(yr, C.red, lift, '#f39a8c');
}

// ───────────────────────── specimen card ─────────────────────────
const SP = { cx: 160, yT: 44, yB: 262, lx: 424, ly: 131, lr: 94 };
const halfW = (y) => lerp(60, 44, (y - SP.yT) / (SP.yB - SP.yT));
const PART = (() => { const r = rng(77), a = []; for (let k = 0; k < 60; k++) a.push([r(), r(), r(), r()]); return a; })();
function gpColors(heat) {
  const m = (a, b) => { const A = Kit.hex(a), B = Kit.hex(b); return `rgb(${lerp(A[0], B[0], heat) | 0},${lerp(A[1], B[1], heat) | 0},${lerp(A[2], B[2], heat) | 0})`; };
  return { edge: m('#cc6c58', '#ff7a2a'), mid: m('#f3ab95', '#ffe08f'), line: m('#974636', '#d95a14') };
}
function dentinPath(c, sg) {
  const { cx, yT, yB } = SP;
  c.beginPath(); c.moveTo(cx + sg * 138, yT); c.lineTo(cx + sg * halfW(yT), yT); c.lineTo(cx + sg * halfW(yB), yB); c.lineTo(cx + sg * 138, yB); c.closePath();
}
/** st: {mode:'A'|'B', heat 0-1, g 0-1 (gap), plug: tip y | null, t} — local card coordinates */
function drawSpec(c, st) {
  const { cx, yT, yB, lx, ly, lr } = SP, B = st.mode === 'B', col = gpColors(st.heat), film = 6;
  // header
  c.font = F.bc(22, 600); c.fillStyle = C.pre; c.textBaseline = 'alphabetic'; spaced(c, B ? 'CANAL · COMPACTION + SEALER' : 'CANAL CUTAWAY · SCHEMATIC', 548, 27, 1.6, 'right');
  // dentin (sectioned → hatched)
  for (const sg of [-1, 1]) {
    dentinPath(c, sg); c.fillStyle = C.dentin; c.fill();
    c.save(); c.clip(); c.strokeStyle = C.dentinLn; c.lineWidth = 1.3; c.globalAlpha = 0.8; c.beginPath();
    for (let k = -30; k < 40; k++) { c.moveTo(cx + k * 12, yB + 4); c.lineTo(cx + k * 12 + (yB - yT + 8), yT - 4); } c.stroke(); c.restore();
    dentinPath(c, sg); c.strokeStyle = C.ink; c.lineWidth = 2.6; c.lineJoin = 'round'; c.stroke();
  }
  // lumen
  c.beginPath(); c.moveTo(cx - halfW(yT), yT); c.lineTo(cx + halfW(yT), yT); c.lineTo(cx + halfW(yB), yB); c.lineTo(cx - halfW(yB), yB); c.closePath(); c.fillStyle = C.voidc; c.fill();
  // sealer film on the walls (mode B)
  if (B) {
    for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(cx + sg * halfW(yT + 12), yT + 12); c.lineTo(cx + sg * halfW(yB), yB); c.lineTo(cx + sg * (halfW(yB) - film), yB); c.lineTo(cx + sg * (halfW(yT + 12) - film), yT + 12); c.closePath(); c.fillStyle = C.sealer; c.fill(); c.strokeStyle = C.sealerLn; c.lineWidth = 1; c.stroke(); }
  }
  // gutta-percha
  const inset = B ? film : 0, shr = (B ? 0.03 : 0.17) * st.g;
  const top0 = yT + 26, top = B ? top0 : top0 + 12 * st.g, tip = B && st.plug != null ? st.plug : null;
  const gx = (y, sg) => cx + sg * ((halfW(y) - inset) * (1 - shr));
  c.beginPath();
  if (tip != null && tip > top0) {         // compacted: flat under the plugger, slight upwelling beside it
    const up = top0 - (tip - top0) * 0.4; c.moveTo(gx(up, -1), up); c.lineTo(cx - 30, up); c.lineTo(cx - 30, tip); c.lineTo(cx + 30, tip); c.lineTo(cx + 30, up); c.lineTo(gx(up, 1), up);
  } else { c.moveTo(gx(top, -1), top); c.quadraticCurveTo(cx, top - 7 * (1 - (B ? 0 : st.g * 0.5)), gx(top, 1), top); }
  c.lineTo(gx(yB, 1), yB); c.lineTo(gx(yB, -1), yB); c.closePath();
  const g = c.createLinearGradient(cx - 60, 0, cx + 60, 0); g.addColorStop(0, col.edge); g.addColorStop(0.45, col.mid); g.addColorStop(1, col.edge);
  c.save(); if (st.heat > 0.02) { c.shadowColor = `rgba(255,140,30,${0.9 * st.heat})`; c.shadowBlur = 24 + 6 * Math.sin((TAU * 12 * st.t) / T.dur); }
  c.fillStyle = g; c.fill(); c.restore();
  c.strokeStyle = col.line; c.lineWidth = 1.8; c.stroke();
  // heat shimmer above the orifice
  if (st.heat > 0.03) {
    c.save(); c.strokeStyle = '#e8701a'; c.lineWidth = 2.6; c.lineCap = 'round';
    for (let k = -1; k <= 1; k++) {
      c.globalAlpha = 0.55 * st.heat; c.beginPath();
      for (let y = yT - 5; y >= 9; y -= 3) { const x = cx + k * 30 + 5 * Math.sin(y / 8 + (TAU * 20 * st.t) / T.dur + k * 1.7) * ((yT - y) / 30); if (y === yT - 5) c.moveTo(x, y); else c.lineTo(x, y); }
      c.stroke();
    }
    c.restore();
  }
  // plugger (mode B)
  if (B && st.plug != null) {
    const py = st.plug, pg = c.createLinearGradient(cx - 30, 0, cx + 30, 0); pg.addColorStop(0, '#5f6866'); pg.addColorStop(0.3, '#e4e8e6'); pg.addColorStop(0.62, '#9ba3a1'); pg.addColorStop(1, '#4a5351');
    c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 8; c.shadowOffsetX = 3;
    c.fillStyle = pg; c.beginPath(); c.moveTo(cx - 25, -20); c.lineTo(cx - 29, py - 4); c.lineTo(cx - 26, py); c.lineTo(cx + 26, py); c.lineTo(cx + 29, py - 4); c.lineTo(cx + 25, -20); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = 'rgba(30,35,34,.8)'; c.lineWidth = 1.5; c.stroke();
    for (let k = 0; k < 4; k++) { const yy = py - 44 - k * 12; if (yy > 2) { c.fillStyle = 'rgba(30,35,34,.4)'; c.fillRect(cx - 27, yy, 54, 2); } }
  }
  // detail circle on the right wall + leader lines
  const dy = 158, dx = cx + halfW(dy) - (B ? 3 : 0);
  c.strokeStyle = C.ink; c.lineWidth = 1.8; c.beginPath(); c.arc(dx, dy, 15, 0, TAU); c.stroke();
  c.lineWidth = 1.3; c.beginPath(); c.moveTo(dx + 5, dy - 14); c.lineTo(lx - (lr + 4) * Math.cos(rad(32)), ly - (lr + 4) * Math.sin(rad(32))); c.moveTo(dx + 5, dy + 14); c.lineTo(lx - (lr + 4) * Math.cos(rad(32)), ly + (lr + 4) * Math.sin(rad(32))); c.stroke();
  // ── loupe ──
  c.save(); c.beginPath(); c.arc(lx, ly, lr, 0, TAU); c.clip();
  const wallX = lx - 36;
  c.fillStyle = C.dentin; c.fillRect(lx - lr, ly - lr, wallX - (lx - lr), lr * 2);
  c.strokeStyle = C.dentinLn; c.lineWidth = 1.3; c.globalAlpha = 0.9;                       // dentinal tubules
  for (let y = ly - lr; y < ly + lr; y += 8) { c.beginPath(); c.moveTo(lx - lr, y + 7); c.bezierCurveTo(lx - lr + 20, y + 1, wallX - 22, y + 6, wallX, y); c.stroke(); }
  c.globalAlpha = 1;
  const sw = B ? 16 : 0, gw = B ? 7 * st.g : 50 * st.g;
  c.fillStyle = C.voidc; c.fillRect(wallX, ly - lr, lr * 2, lr * 2);
  if (B) { c.fillStyle = C.sealer; c.fillRect(wallX, ly - lr, sw, lr * 2); c.fillStyle = 'rgba(92,110,124,.35)'; for (let k = 0; k < 10; k++) { c.beginPath(); c.arc(wallX + 4 + PART[k][0] * 14, ly - lr + 8 + k * 19, 1.4 + PART[k][1] * 1.6, 0, TAU); c.fill(); } c.fillStyle = C.sealerLn; c.fillRect(wallX + sw - 1, ly - lr, 1.6, lr * 2); }
  const ge = (y) => wallX + sw + gw + (gw > 0.5 ? 2.2 * noise1(y / 13, 4) * Math.min(1, gw / 8) : 0);
  c.beginPath(); c.moveTo(ge(ly - lr), ly - lr); for (let y = ly - lr; y <= ly + lr; y += 4) c.lineTo(ge(y), y); c.lineTo(lx + lr, ly + lr); c.lineTo(lx + lr, ly - lr); c.closePath();
  const lg = c.createLinearGradient(wallX, 0, lx + lr, 0); lg.addColorStop(0, col.edge); lg.addColorStop(1, col.mid);
  c.fillStyle = lg; c.fill(); c.strokeStyle = col.line; c.lineWidth = 2; c.stroke();
  for (const [a, b, d, e] of PART) {                                                         // filler particles
    const px = wallX + sw + 58 + a * (lx + lr - wallX - 60), py = ly - lr + b * lr * 2;
    c.fillStyle = d < 0.5 ? 'rgba(255,255,255,.32)' : 'rgba(120,50,30,.15)'; c.beginPath(); c.arc(px, py, 1.3 + e * 1.8, 0, TAU); c.fill();
  }
  c.strokeStyle = C.ink; c.lineWidth = 2.6; c.beginPath(); c.moveTo(wallX, ly - lr); c.lineTo(wallX, ly + lr); c.stroke();
  if (!B && gw > 16) {                                                                     // gap dimension
    const a = clamp((gw - 16) / 10); c.globalAlpha = a; c.strokeStyle = '#ff5a48'; c.fillStyle = '#ff5a48'; c.lineWidth = 2.6;
    const x1 = wallX + 4, x2 = wallX + gw - 3, yy = ly + 40; c.beginPath(); c.moveTo(x1 + 6, yy); c.lineTo(x2 - 6, yy); c.stroke();
    c.beginPath(); c.moveTo(x1, yy); c.lineTo(x1 + 9, yy - 6); c.lineTo(x1 + 9, yy + 6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x2, yy); c.lineTo(x2 - 9, yy - 6); c.lineTo(x2 - 9, yy + 6); c.closePath(); c.fill(); c.globalAlpha = 1;
  }
  if (st.heat > 0.02) { const hg = c.createRadialGradient(lx + 40, ly, 10, lx + 40, ly, 130); hg.addColorStop(0, `rgba(255,225,130,${0.4 * st.heat})`); hg.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = hg; c.fillRect(wallX + sw + gw, ly - lr, lr * 2, lr * 2); }
  if (B) {                                                                                  // sealer call-out
    tw(c, 'sealer', lx - 12, ly + 9, 30, { bold: 1, seed: 51 });
    c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(lx - 15, ly - 1); c.lineTo(wallX + 12, ly - 1); c.stroke(); c.fillStyle = C.ink; c.beginPath(); c.arc(wallX + 11, ly - 1, 3.6, 0, TAU); c.fill();
  }
  c.restore();
  // lens rim
  const rg = c.createLinearGradient(lx - lr, ly - lr, lx + lr, ly + lr); rg.addColorStop(0, '#e3e6e4'); rg.addColorStop(0.4, '#8c9492'); rg.addColorStop(0.7, '#5a6260'); rg.addColorStop(1, '#b9bfbd');
  c.save(); c.shadowColor = 'rgba(40,30,10,.4)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.strokeStyle = rg; c.lineWidth = 8; c.beginPath(); c.arc(lx, ly, lr, 0, TAU); c.stroke(); c.restore();
  c.strokeStyle = 'rgba(30,30,25,.7)'; c.lineWidth = 1.2; c.beginPath(); c.arc(lx, ly, lr - 4.5, 0, TAU); c.stroke(); c.beginPath(); c.arc(lx, ly, lr + 4.5, 0, TAU); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(lx, ly, lr - 16, rad(205), rad(250)); c.stroke(); c.lineCap = 'butt';
  // label
  tw(c, B ? 'schematic' : 'gap exaggerated', lx - 8, 263, 29, { bold: 1, align: 'center', seed: 52, color: C.ink });
}
function specState(t, S) {
  const sr = clamp(S, 0, S2);
  return { mode: 'A', heat: 1 - tmp(sr), g: vol(sr) / VTOT, plug: null, t };
}
function specStateB(t) {
  const a = EV.slideB[1];
  const plug = lerp(-30, SP.yT + 26, seg(t, a - 0.05, a + 0.55, ease.inOut)) + 18 * seg(t, a + 0.6, a + 1.4, ease.inOut);
  return { mode: 'B', heat: 1 - seg(t, a + 1.0, a + 2.7, ease.smooth), g: seg(t, a + 1.9, a + 2.9, ease.smooth), plug, t };
}
function drawSpecimenCard(t, S) {
  const c = ctx; c.save(); c.beginPath(); c.rect(SPEC.x + 3, SPEC.y + 3, SPEC.w - 6, SPEC.h - 6); c.clip(); c.translate(SPEC.x, SPEC.y);
  const pB = seg(t, EV.slideB[0], EV.slideB[1], ease.inOut), pA = seg(t, EV.slideA[0], EV.slideA[1], ease.inOut);
  if (pB <= 0) drawSpec(c, specState(t, S));
  else if (pB < 1) { c.save(); c.translate(-pB * SPEC.w, 0); drawSpec(c, specState(t, S)); c.restore(); c.save(); c.translate((1 - pB) * SPEC.w, 0); divider(c); drawSpec(c, specStateB(t)); c.restore(); }
  else if (pA <= 0) drawSpec(c, specStateB(t));
  else if (pA < 1) { c.save(); c.translate(-pA * SPEC.w, 0); drawSpec(c, specStateB(t)); c.restore(); c.save(); c.translate((1 - pA) * SPEC.w, 0); divider(c); drawSpec(c, { mode: 'A', heat: 1, g: 0, plug: null, t }); c.restore(); }
  else drawSpec(c, { mode: 'A', heat: 1, g: 0, plug: null, t });
  c.restore(); mounts(c, SPEC);
}
function divider(c) { c.fillStyle = 'rgba(90,70,30,.35)'; c.fillRect(-2, 0, 2, SPEC.h); }

// ───────────────────────── stopwatch ─────────────────────────
function drawWatch(t, S) {
  const c = ctx, { cx, cy, R } = WATCH, back = seg(t, EV.reset[0] - 0.05, EV.reset[1] - 0.1, ease.inOut);
  const sc = clamp(S, 0, S3) * (1 - back);
  // crown (pressed at start and at reset)
  const press = 5 * (Math.sin(Math.PI * seg(t, 0.8, 1.02)) + Math.sin(Math.PI * seg(t, EV.reset[0] - 0.12, EV.reset[0] + 0.1)));
  c.save();
  let g = c.createLinearGradient(cx - 18, 0, cx + 18, 0); g.addColorStop(0, '#5d6664'); g.addColorStop(0.35, '#e6e9e7'); g.addColorStop(1, '#6c7573');
  c.fillStyle = '#6f7876'; c.fillRect(cx - 7, cy - R - 12 + press * 0.3, 14, 14);
  c.fillStyle = g; rr(c, cx - 17, cy - R - 30 + press, 34, 20, 4); c.fill();
  c.strokeStyle = 'rgba(30,35,34,.55)'; c.lineWidth = 1.2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(cx + k * 4.6, cy - R - 28 + press); c.lineTo(cx + k * 4.6, cy - R - 12 + press); c.stroke(); }
  // zone names along the scale (active zone printed dark)
  const zone = sc < S1 - 0.01 ? 0 : sc < S2 - 0.01 ? 1 : 2;
  c.font = F.bc(28, 700); c.textBaseline = 'alphabetic'; c.fillStyle = C.ink;
  [['MIN', -72], ['HOURS', 4], ['DAYS', 77]].forEach(([s, deg], i) => { c.globalAlpha = i === zone ? 0.95 : 0.3; arcText(c, s, cx, cy, 53, deg, 1.5); });
  c.globalAlpha = 1;
  // read-out
  let txt;
  if (sc < S1 - 0.01) txt = Math.floor(sc / 23 + 0.02) + ' min';
  else if (sc <= S2 + 0.01) { const h = 1 / 6 + ((sc - S1) / (S2 - S1)) * (24 - 1 / 6); txt = h < 1 ? Math.floor((h * 60) / 10 + 0.01) * 10 + ' min' : Math.min(24, Math.floor(h + 0.01)) + ' h'; }
  else txt = Math.floor(1 + (sc - S2) / DAYPX + 0.03) + ' d';
  tw(c, txt, cx, cy + 60, 30, { bold: 1, align: 'center', seed: 61 });
  // hand
  c.translate(cx, cy); c.rotate(dialAng(sc));
  c.shadowColor = 'rgba(30,22,8,.4)'; c.shadowBlur = 4; c.shadowOffsetX = 2; c.shadowOffsetY = 3;
  c.fillStyle = '#1d2a3d'; c.beginPath(); c.moveTo(-3.2, 18); c.lineTo(-1.1, -(R - 24)); c.lineTo(1.1, -(R - 24)); c.lineTo(3.2, 18); c.closePath(); c.fill();
  c.shadowColor = 'transparent'; g = c.createRadialGradient(-2, -2, 1, 0, 0, 8); g.addColorStop(0, '#f0dba0'); g.addColorStop(1, '#8a7038'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 7.5, 0, TAU); c.fill();
  c.restore();
  // glass highlight
  c.save(); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, R - 30, rad(196), rad(236)); c.stroke(); c.restore();
}

// ───────────────────────── captions (typed on the READING card) ─────────────────────────
const CAPS = [
  { a: 1.4, b: 5.75, lines: [
    { y: 80, px: 48, bold: 1, segs: [['1.0–2.3 %', C.red], [' linear shrinkage', C.ink]] },
    { y: 122, px: 32, segs: [['in 10 min · 75→37 °C · in vitro', C.ink]] }],
    src: 'Lottanti 2014 J Endod' },
  { a: 6.1, b: 10.9, lines: [
    { y: 80, px: 48, bold: 1, segs: [['Keeps shrinking: ', C.ink], ['45 min–10 h', C.red]] },
    { y: 122, px: 32, segs: [['held at 37 °C · in vitro', C.ink]] }],
    src: 'Lee 1997 J Endod  ·  4 products  ·  mechanism inferred (Grassi 1989 J Endod)' },
  { a: 11.3, b: 15.3, lines: [
    { y: 80, px: 48, bold: 1, segs: [['Then stable to 24 h.', C.ink]] },
    { y: 122, px: 32, at: 12.6, segs: [['After 24 h: ', C.ink], ['no data found', C.red]] }],
    src: 'Lee 1997 J Endod  ·  in vitro' },
  { a: 15.7, b: 19.6, lines: [
    { y: 78, px: 58, bold: 1, segs: [['Compact it warm.', C.ink]] },
    { y: 134, px: 58, bold: 1, segs: [['Use sealer.', C.ink]] },
    { y: 134, px: 32, x: 440, at: 16.1, segs: [['(in vitro)', C.dim]] }],
    src: 'Marlin 1971 thesis (publ. OOO 1973)  ·  Wu 2000 Int Endod J' },
];
function drawCaption(t) {
  const c = ctx;
  for (const cp of CAPS) {
    if (t < cp.a || t > cp.b + 0.25) continue;
    const out = 1 - seg(t, cp.b, cp.b + 0.25); let t0 = cp.a;
    cp.lines.forEach((ln, i) => {
      const n = ln.segs.reduce((k, s) => k + s[0].length, 0), ta = ln.at != null ? ln.at : t0, dur = Math.min(0.5, n * 0.016);
      if (ln.at == null) t0 += dur;
      tw(c, ln.segs, CAP.x + (ln.x || 30), CAP.y + ln.y, ln.px, { bold: ln.bold, reveal: Math.floor(seg(t, ta, ta + dur) * n + 0.001), alpha: out, seed: 70 + i + Math.round(cp.a * 10) });
    });
    c.save(); c.globalAlpha = out * seg(t, cp.a + 0.3, cp.a + 0.6) * 0.9; c.font = F.bc(25, 500); c.fillStyle = C.dim; c.textBaseline = 'alphabetic'; spaced(c, cp.src, CAP.x + 30, CAP.y + CAP.h - 12, 0.6); c.restore();
  }
}

// ───────────────────────── controls (decorative; under the Reels UI) ─────────────────────────
function drawControls(t) {
  const c = ctx, back = seg(t, EV.reset[0], EV.reset[1], ease.inOut);
  const a = (-52 + 52 * seg(t, EV.mark1 + 0.05, EV.mark1 + 0.45, ease.inOut) + 52 * seg(t, EV.mark2 + 0.05, EV.mark2 + 0.45, ease.inOut)) * (1 - back);
  c.save(); c.translate(210, 1800);
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 16; c.shadowOffsetY = 8;
  let g = c.createLinearGradient(-64, -64, 64, 64); g.addColorStop(0, '#4d5856'); g.addColorStop(1, '#151a19'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 64, 0, TAU); c.fill();
  c.shadowColor = 'transparent'; g = c.createLinearGradient(-50, -50, 50, 50); g.addColorStop(0, '#2b3331'); g.addColorStop(1, '#3f4947'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 50, 0, TAU); c.fill();
  c.rotate(rad(a)); c.fillStyle = '#efe9d5'; rr(c, -3.5, -60, 7, 30, 3); c.fill();
  c.restore();
  // REC lamp + pen-lift toggle
  const rec = Math.min(seg(t, T.start - 0.1, T.start + 0.05), 1 - seg(t, EV.lift[0], EV.lift[0] + 0.2));
  c.save(); c.fillStyle = '#141917'; c.beginPath(); c.arc(540, 1770, 30, 0, TAU); c.fill(); c.fillStyle = '#4a1a15'; c.beginPath(); c.arc(540, 1770, 21, 0, TAU); c.fill();
  if (rec > 0) { c.globalAlpha = rec; c.shadowColor = 'rgba(255,60,30,.9)'; c.shadowBlur = 30; c.fillStyle = '#ff5136'; c.beginPath(); c.arc(540, 1770, 20, 0, TAU); c.fill(); }
  c.restore();
  const lift = t < EV.lift[0] ? 1 - seg(t, EV.penDown[0], EV.penDown[1], ease.inOut) : seg(t, EV.lift[0], EV.lift[1], ease.inOut);
  c.save(); c.fillStyle = '#141917'; rr(c, 778, 1722, 44, 96, 22); c.fill();
  g = c.createLinearGradient(0, 1730, 0, 1810); g.addColorStop(0, '#eef0ee'); g.addColorStop(1, '#7c8583'); c.fillStyle = g; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 8; c.shadowOffsetY = 4;
  c.beginPath(); c.arc(800, lerp(1794, 1746, lift), 17, 0, TAU); c.fill(); c.restore();
}

// ───────────────────────── reel ─────────────────────────
window.REEL = {
  title: 'Warm GP: when does it stop shrinking?',
  duration: T.dur,
  poster: 19.2,
  canvas,
  fonts: ['400 80px "Special Elite"', '700 48px "Courier Prime"', '400 32px "Courier Prime"', '700 34px "Barlow Condensed"', '600 26px "Barlow Condensed"', '500 26px "Barlow Condensed"'],
  setup() {
    makeTile();
    STAMP.cool = makeStamp([{ t: 'COOLING', px: 40, sp: 3 }], { seed: 2 });
    STAMP.cryst = makeStamp([{ t: 'CRYSTALLIZING', px: 34, sp: 1.6 }], { seed: 5, pad: [13, 11] });
    STAMP.stable = makeStamp([{ t: 'STABLE', px: 38, sp: 3 }, { t: 'IN VITRO', px: 27, sp: 2 }], { seed: 9, pad: [15, 10] });
    STAMP.nodata = makeStamp([{ t: 'NO DATA', px: 42, sp: 2 }, { t: 'FOUND', px: 42, sp: 4 }], { seed: 13, color: C.black, double: true, pad: [18, 16], r: 4 });
    makeBG(); makeOverlay();
    pc = mk(PW, CHH); pcx = pc.getContext('2d', { alpha: false });
    acc = mk(PW, CHH); accx = acc.getContext('2d', { alpha: false });
  },
  render(t) {
    t = clamp(t, 0, T.dur);
    const S = paperS(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(bg, 0, 0);
    drawSpecimenCard(t, S);
    drawWatch(t, S);
    drawChart(t, S);
    drawCaption(t);
    drawControls(t);
  },
};
Kit.boot(window.REEL);
})();
