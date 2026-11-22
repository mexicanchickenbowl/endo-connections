/* 24 · kVp, mA and exposure time: what each setting does inside the X-ray tube head
 * Style: RETRO CONTROL CONSOLE (1970s hi-fi / lab instrument panel). One full-frame 2D canvas; render(t) is a pure
 * function of t. Everything pseudo-random comes from Kit.rng / Kit.hash; the needle, heat and particle schedules are
 * integrated once in setup() so any frame can be drawn in isolation.
 *
 * Physics shown (see NOTES.md / RESEARCH.md): toy spectrum = Kramers (kV/E - 1) x 2 mm Al (NIST mu/rho), schematic.
 */
(() => {
'use strict';
const { canvas, ctx } = Kit.createCanvas();
const { W, H, clamp, lerp, seg, env, ease, rng, hash, noise1 } = Kit;
const TAU = Math.PI * 2, D2R = Math.PI / 180;
const T = 23.4;

/* ------------------------------------------------------------------ timeline */
const SC_MA = [2.2, 6.4], SC_KV = [6.4, 13.6], SC_TS = [13.6, 18.0], END0 = 18.0;
const TURN_MA = [2.7, 4.2], TURN_KV = [7.2, 8.8], TURN_TS = [15.4, 16.1], RESET = [T - 0.9, T - 0.2];
const BEAM = [[0.35, 13.2], [14.5, 15.3], [16.25, 17.85]];        // EXPOSE held, then two timed pulses
const KVB = 9.8, KVC = 11.4;                                        // kVp scene: beat 2 (more photons), beat 3 (less contrast)
const ROW0 = 0.25, ROWD = 0.3;                                      // cheat-sheet rows: first at END0 + ROW0, then every ROWD
const WIG0 = 0.45, WIGD = 0.3, WIGL = 0.6;                          // hook: each knob wiggles once with its lamp
const TURNS = [TURN_MA, TURN_KV, TURN_TS];
const eio = ease.inOut;
const back = (t) => seg(t, RESET[0], RESET[1], eio);
const setMA = (t) => 4 + 4 * (seg(t, TURN_MA[0], TURN_MA[1], eio) - back(t));
const setKV = (t) => 60 + 10 * (seg(t, TURN_KV[0], TURN_KV[1], eio) - back(t));
const setTS = (t) => 0.10 + 0.10 * (seg(t, TURN_TS[0], TURN_TS[1], eio) - back(t));
const beamOn = (t) => BEAM.some(([a, b]) => t >= a && t < b);
// cheat sheet: the dark backdrop closes before the rows appear and opens only after they have faded (no ghosting)
const cheatA = (t) => Math.min(seg(t, END0, END0 + 0.35, ease.smooth), 1 - seg(t, T - 0.8, T - 0.45, ease.smooth));
const cheatTxt = (t) => 1 - seg(t, T - 1.05, T - 0.8, ease.smooth);

/* ------------------------------------------------------------------ toy spectrum (schematic) */
const E_PTS = [10, 15, 20, 30, 40, 50, 60, 80, 100];
const MU_AL = [26.23, 7.955, 3.441, 1.128, 0.5685, 0.3681, 0.2778, 0.2018, 0.1704];   // cm2/g, NIST, aluminum
function muAl(E) {
  let i = 0; while (i < E_PTS.length - 2 && E > E_PTS[i + 1]) i++;
  const f = (Math.log(E) - Math.log(E_PTS[i])) / (Math.log(E_PTS[i + 1]) - Math.log(E_PTS[i]));
  return Math.exp(Math.log(MU_AL[i]) + f * (Math.log(MU_AL[i + 1]) - Math.log(MU_AL[i])));
}
const transAl = (E) => Math.exp(-muAl(E) * 2.70 * 0.2);                    // 2 mm Al
const spec = (E, kv) => (E <= 2 || E >= kv ? 0 : (kv / E - 1) * transAl(E));
let SPEC_MAX = 0; for (let E = 10; E < 70; E += 0.1) SPEC_MAX = Math.max(SPEC_MAX, spec(E, 70));
const specH = (E, kv, ma) => 0.88 * (ma / 8) * spec(E, kv) / SPEC_MAX;     // 0..1 of scope height
const kramersInt = (E, kv) => kv * Math.log(E / 15) - (E - 15);            // unfiltered photons 15 keV..E
function sampleE(kv, r) { const tot = kramersInt(kv, kv); let lo = 15, hi = kv; for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (kramersInt(m, kv) / tot < r) lo = m; else hi = m; } return (lo + hi) / 2; }

/* ------------------------------------------------------------------ pre-integrated state */
const DT = 1 / 240, NS = Math.round(T / DT) + 2;
const simNeedle = new Float32Array(NS), simHeat = new Float32Array(NS), simOn = new Float32Array(NS);
const electrons = [], photons = [];
const tauE = (kv) => lerp(0.48, 0.38, (kv - 60) / 10);      // gap transit time on screen (schematic)
function buildSims() {
  let x = 0, v = 0, h = 0, b = 0, accE = 0.6, accP = 0.4, ne = 0, np = 0;
  for (let i = 0; i < NS; i++) {
    const t = i * DT, on = beamOn(t) ? 1 : 0, kv = setKV(t), ma = setMA(t);
    const target = on * kv * ma / 560;                                       // kV x mA, 1 = 70 x 8
    const w = 12, z = 0.7; v += (w * w * (target * 0.74 - x) - 2 * z * w * v) * DT; x += v * DT; simNeedle[i] = x;
    h += (target - h) * DT / 0.5; simHeat[i] = h;
    b += (on - b) * DT / 0.10; simOn[i] = b;
    // electrons per second follow mA only. The stream is pre-filled (emission starts one transit time early and is
    // drawn only while EXPOSE is on) so that lamp, stream and photons switch together.
    accE += (on || beamOn(t + tauE(kv)) ? 1 : 0) * ma * 2.9 * DT;
    if (accE >= 1) { accE -= 1; electrons.push({ t, lane: ((ne * 0.618034 + 0.17) % 1) * 2 - 1, tau: tauE(kv) * (0.95 + 0.1 * hash(ne, 5)), kvf: (kv - 60) / 10 }); ne++; }
    accP += on * 13 * (ma / 4) * (kramersInt(kv, kv) / kramersInt(60, 60)) * DT;
    if (accP >= 1) { accP -= 1; const E = sampleE(kv, hash(np, 21)); photons.push({ t, th: (((np * 0.618034 + 0.31) % 1) * 2 - 1) * 18 * D2R, E, pass: hash(np, 41) < transAl(E), ph: hash(np, 51) * TAU }); np++; }
  }
}
const sim = (arr, t) => { const f = clamp(t, 0, T) / DT, i = Math.floor(f); return lerp(arr[i], arr[Math.min(i + 1, NS - 1)], f - i); };
function lowerBound(a, t) { let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m].t < t) lo = m + 1; else hi = m; } return lo; }

/* ------------------------------------------------------------------ geometry */
const GL = { x: 64, y: 244, w: 952, h: 158 };            // caption "dial glass"
const TW = { x: 64, y: 426, w: 952, h: 348 };            // tube-head inspection window
const YC = 548, FX = 768, FIL_X = 284, TAN20 = Math.tan(20 * D2R), TAN18 = Math.tan(18 * D2R), TAN12 = Math.tan(12 * D2R);
const faceX = (y) => FX + (y - YC) * TAN20;              // angled target face
const Y_FILT = 642, Y_COLL = 684, Y_EXIT = TW.y + TW.h;
const SCP = { cx: 806, cy: 996, r: 166, rb: 204 };
const VU = { x: 70, y: 802, w: 244, h: 188 };
const IM = { x: 326, y: 802, w: 264, h: 188 };
const EX = { x: 70, y: 1004 };
const STRIP = { x: 44, y: 1206, w: 992, h: 384 };
const KY = 1436, KR = 88;
const KNOBS = [
  { cx: 226, name: 'mA', majors: [2, 4, 6, 8, 10], labels: ['2', '4', '6', '8', '10'], minors: 1, ang: (v) => -120 + (v - 2) / 8 * 240 },
  { cx: 512, name: 'kVp', majors: [50, 60, 70, 80, 90], labels: ['50', '60', '70', '80', '90'], minors: 3, ang: (v) => -120 + (v - 50) / 40 * 240 },
  { cx: 810, name: 'TIME', majors: [0.05, 0.1, 0.2, 0.4], labels: ['0.05', '0.1', '0.2', '0.4'], minors: 2, ang: (v) => -120 + Math.log2(v / 0.05) * 80 },
];
const F = {
  head: '700 62px Oswald', sub: '500 40px "Barlow Condensed"', subB: '600 40px "Barlow Condensed"',
  lab: '600 30px "Barlow Condensed"', fine: '500 24px "Barlow Condensed"',
};
const COL = { cream: '#f3e8cd', amber: '#ffb648', amberHot: '#ffd995', blue: '#a9e0ff', green: '#8dffbb', ink: '#1b1816' };

/* ------------------------------------------------------------------ small helpers */
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function txt(c, s, x, y, font, color, align = 'left', ls = '0px') { c.font = font; c.letterSpacing = ls; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillStyle = color; c.fillText(s, x, y); c.letterSpacing = '0px'; }
function tw(c, s, font, ls = '0px') { c.font = font; c.letterSpacing = ls; const w = c.measureText(s).width; c.letterSpacing = '0px'; return w; }
function engrave(c, s, x, y, font, align = 'left', ls = '1px', col = COL.ink) { txt(c, s, x + 1, y + 1.4, font, 'rgba(255,255,255,0.55)', align, ls); txt(c, s, x, y, font, col, align, ls); }
function glow(c, x, y, r, rgb, a) { if (a <= 0.004) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.35, `rgba(${rgb},${a * 0.42})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
/** rich text: parts = [{t, c} | {t, c, sup:true}] laid out on one baseline; returns width */
function rich(c, parts, x, y, font, align = 'center') {
  c.font = font; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.letterSpacing = '0px';
  const px = parseFloat(font.match(/(\d+(\.\d+)?)px/)[1]); const small = font.replace(/(\d+(\.\d+)?)px/, Math.round(px * 0.62) + 'px');
  const ws = parts.map((p) => { c.font = p.sup ? small : font; return c.measureText(p.t).width; });
  const tot = ws.reduce((a, b) => a + b, 0);
  let x0 = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  parts.forEach((p, i) => { c.font = p.sup ? small : font; c.fillStyle = p.c; c.fillText(p.t, x0, p.sup ? y - px * 0.36 : y); x0 += ws[i]; });
  return tot;
}
function arrowR(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - s * 0.16); c.lineTo(x + s * 0.55, y - s * 0.16); c.lineTo(x + s * 0.55, y - s * 0.5); c.lineTo(x + s, y); c.lineTo(x + s * 0.55, y + s * 0.5); c.lineTo(x + s * 0.55, y + s * 0.16); c.lineTo(x, y + s * 0.16); c.closePath(); c.fill(); }
function arrowUp(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.62, y - s * 0.3); c.lineTo(x + s * 0.2, y - s * 0.3); c.lineTo(x + s * 0.2, y); c.lineTo(x - s * 0.2, y); c.lineTo(x - s * 0.2, y - s * 0.3); c.lineTo(x - s * 0.62, y - s * 0.3); c.closePath(); c.fill(); }

/* brushed aluminum fill of the current rect */
function brushed(c, x, y, w, h, seed) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#e2dfd8'); g.addColorStop(0.5, '#cdcac2'); g.addColorStop(1, '#b6b2aa');
  c.fillStyle = g; c.fillRect(x, y, w, h);
  const r = rng(seed), n = Math.round(h * 13 * (w / 1000));
  for (let i = 0; i < n; i++) { const yy = y + r() * h, xx = x + r() * w, len = 40 + r() * 320; c.globalAlpha = 0.03 + r() * 0.075; c.fillStyle = r() < 0.5 ? '#ffffff' : '#000000'; c.fillRect(xx - len / 2, yy, len, 1); }
  c.globalAlpha = 1;
  g = c.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(0.28, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,255,255,0.16)'); g.addColorStop(0.85, 'rgba(0,0,0,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.14)');
  c.fillStyle = g; c.fillRect(x, y, w, h);
  c.restore();
}
/* aluminum frame around an inner rect, with a dark recess lip */
function aluFrame(c, x, y, w, h, pad, rad, seed) {
  c.save(); c.shadowColor = 'rgba(0,0,0,0.65)'; c.shadowBlur = 16; c.shadowOffsetY = 6; rr(c, x - pad, y - pad, w + 2 * pad, h + 2 * pad, rad + pad * 0.7); c.fillStyle = '#111'; c.fill(); c.restore();
  c.save(); rr(c, x - pad, y - pad, w + 2 * pad, h + 2 * pad, rad + pad * 0.7); c.clip(); brushed(c, x - pad, y - pad, w + 2 * pad, h + 2 * pad, seed); c.restore();
  let g = c.createLinearGradient(0, y - pad, 0, y + h + pad); g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
  c.strokeStyle = g; c.lineWidth = 2; rr(c, x - pad + 1, y - pad + 1, w + 2 * pad - 2, h + 2 * pad - 2, rad + pad * 0.7); c.stroke();
  rr(c, x - 3, y - 3, w + 6, h + 6, rad + 2); c.fillStyle = '#070606'; c.fill();
  g = c.createLinearGradient(0, y - 3, 0, y + h + 3); g.addColorStop(0, 'rgba(0,0,0,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0.35)');
  c.strokeStyle = g; c.lineWidth = 1.5; rr(c, x - 3, y - 3, w + 6, h + 6, rad + 2); c.stroke();
}
function blackBezel(c, x, y, w, h, r) {
  c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 12; c.shadowOffsetY = 5; rr(c, x, y, w, h, r); c.fillStyle = '#0e0c0b'; c.fill(); c.restore();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#3a3531'); g.addColorStop(0.07, '#1b1917'); g.addColorStop(1, '#0b0a09');
  rr(c, x, y, w, h, r); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 1.5; rr(c, x + 1, y + 1, w - 2, h - 2, r - 1); c.stroke();
}
function glassWindow(c, x, y, w, h, r) {            // small black display window recessed in a panel
  rr(c, x - 3, y - 3, w + 6, h + 6, r + 2); c.fillStyle = 'rgba(0,0,0,0.55)'; c.fill();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#060505'); g.addColorStop(1, '#17110d');
  rr(c, x, y, w, h, r); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + r, y + h + 2.5); c.lineTo(x + w - r, y + h + 2.5); c.stroke();
}
function screw(c, x, y, r, ang) {
  c.save(); c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.arc(x + 1.5, y + 2.5, r + 1.5, 0, TAU); c.fill();
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#f6f4ee'); g.addColorStop(0.6, '#aaa69e'); g.addColorStop(1, '#5e5b55');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.translate(x, y); c.rotate(ang); c.fillStyle = 'rgba(22,19,17,0.9)'; c.fillRect(-r * 0.84, -r * 0.14, r * 1.68, r * 0.28); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-r * 0.84, r * 0.14, r * 1.68, 1);
  c.restore();
}
function slot(c, x, y, w, h) {
  rr(c, x, y, w, h, h / 2); c.fillStyle = '#0a0908'; c.fill();
  c.strokeStyle = 'rgba(255,240,220,0.10)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + h / 2, y + h + 1); c.lineTo(x + w - h / 2, y + h + 1); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.moveTo(x + h / 2, y - 1); c.lineTo(x + w - h / 2, y - 1); c.stroke();
}
function jewelBezel(c, x, y, r) {
  c.save(); c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.arc(x + 1, y + 2, r + 6, 0, TAU); c.fill();
  const g = c.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#fbfaf6'); g.addColorStop(0.5, '#8d8982'); g.addColorStop(1, '#4a4742');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r + 5, 0, TAU); c.fill(); c.fillStyle = '#120f0d'; c.beginPath(); c.arc(x, y, r + 1.5, 0, TAU); c.fill(); c.restore();
}
function jewel(c, x, y, r, lit, on = [255, 178, 62], hot = [255, 248, 214], rim = [214, 110, 16]) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.08, x, y, r);
  g.addColorStop(0, Kit.rgba(Kit.mix([on[0] * 0.55, on[1] * 0.5, on[2] * 0.45], hot, lit)));
  g.addColorStop(0.55, Kit.rgba(Kit.mix([on[0] * 0.36, on[1] * 0.3, on[2] * 0.22], on, lit)));
  g.addColorStop(1, Kit.rgba(Kit.mix([on[0] * 0.15, on[1] * 0.12, on[2] * 0.1], rim, lit)));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.34)'; c.beginPath(); c.ellipse(x - r * 0.3, y - r * 0.4, r * 0.32, r * 0.17, -0.6, 0, TAU); c.fill();
  if (lit > 0.01) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, r * 4.4, on.join(','), 0.5 * lit); c.restore(); }
}

/* seven-segment LED readout, right-aligned at xr; y = top; h = digit height */
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function seg7(c, str, xr, y, h, lit = 1, rgb = '255,74,50') {
  const w = h * 0.54, th = h * 0.13, gap = h * 0.24, dpw = h * 0.07, sk = -0.085, q = th / 2;
  let tot = -gap; for (const ch of str) tot += ch === '.' ? dpw : w + gap;
  let x = xr - tot;
  const hl = w / 2 - th * 0.62, vl = h / 4 - th * 0.36;
  const P = { a: [w / 2, -h + q, 1], g: [w / 2, -h / 2, 1], d: [w / 2, -q, 1], f: [q, -h * 0.75 + q / 2, 0], b: [w - q, -h * 0.75 + q / 2, 0], e: [q, -h * 0.25 - q / 2, 0], c: [w - q, -h * 0.25 - q / 2, 0] };
  const bar = (cx, cy, horiz) => { c.beginPath(); if (horiz) { c.moveTo(cx - hl, cy); c.lineTo(cx - hl + q, cy - q); c.lineTo(cx + hl - q, cy - q); c.lineTo(cx + hl, cy); c.lineTo(cx + hl - q, cy + q); c.lineTo(cx - hl + q, cy + q); } else { c.moveTo(cx, cy - vl); c.lineTo(cx + q, cy - vl + q); c.lineTo(cx + q, cy + vl - q); c.lineTo(cx, cy + vl); c.lineTo(cx - q, cy + vl - q); c.lineTo(cx - q, cy - vl + q); } c.closePath(); c.fill(); };
  c.save(); c.translate(0, y + h); c.transform(1, 0, sk, 1, 0, 0);
  for (const pass of [0, 1]) {
    let xx = x;
    if (pass) { c.shadowColor = `rgba(${rgb},${0.9 * lit})`; c.shadowBlur = h * 0.28; }
    for (const ch of str) {
      if (ch === '.') { const onDot = pass && lit > 0.02; if (!pass || onDot) { c.fillStyle = onDot ? `rgba(${rgb},${lit})` : `rgba(${rgb},0.075)`; c.beginPath(); c.arc(xx - gap * 0.46, -q * 0.9, q * 1.0, 0, TAU); c.fill(); } xx += dpw; continue; }
      const set = SEG[ch] || '';
      for (const k in P) { const isOn = set.includes(k); if (pass ? !(isOn && lit > 0.02) : false) continue; c.fillStyle = pass ? `rgba(${rgb},${lit})` : `rgba(${rgb},0.075)`; bar(xx + P[k][0], P[k][1], P[k][2]); }
      xx += w + gap;
    }
  }
  c.restore();
}

/* text on an arc (engraved). angles clockwise from 12 o'clock */
function arcText(c, str, cx, cy, rad, mid, font, track, bottom) {
  c.save(); c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '0px';
  const chars = [...str], ws = chars.map((ch) => c.measureText(ch).width + track), tot = ws.reduce((a, b) => a + b, 0), dir = bottom ? -1 : 1;
  let ang = mid - dir * tot / rad / 2;
  chars.forEach((ch, i) => {
    const half = ws[i] / 2 / rad; ang += dir * half;
    c.save(); c.translate(cx + rad * Math.sin(ang), cy - rad * Math.cos(ang)); c.rotate(bottom ? ang + Math.PI : ang);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText(ch, 0.8, 1.3); c.fillStyle = COL.ink; c.fillText(ch, 0, 0); c.restore();
    ang += dir * half;
  });
  c.restore();
}

/* ------------------------------------------------------------------ static background */
const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
let knobFace = null, radA = null, radB = null, vig = null;

function walnut(c, x, w, seed) {
  c.save(); c.beginPath(); c.rect(x, 0, w, H); c.clip();
  let g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#4a2c17'); g.addColorStop(0.5, '#70452a'); g.addColorStop(1, '#4f2f19');
  c.fillStyle = g; c.fillRect(x, 0, w, H);
  const r = rng(seed);
  for (let i = 0; i < 46; i++) {
    const x0 = x + r() * w, amp = 2 + r() * 5, f = 0.002 + r() * 0.004, ph = r() * 10;
    c.strokeStyle = r() < 0.6 ? `rgba(35,16,6,${0.18 + r() * 0.3})` : `rgba(196,136,80,${0.08 + r() * 0.14})`;
    c.lineWidth = 0.8 + r() * 2.2; c.beginPath();
    for (let y = 0; y <= H; y += 24) { const xx = x0 + amp * Math.sin(y * f + ph) + 2 * noise1(y * 0.01, seed + i); if (y) c.lineTo(xx, y); else c.moveTo(xx, y); }
    c.stroke();
  }
  g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(0,0,0,0.38)'); g.addColorStop(0.4, 'rgba(255,220,170,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
  c.fillStyle = g; c.fillRect(x, 0, w, H);
  c.restore();
}

function copperPath(c) {
  c.beginPath();
  c.moveTo(faceX(YC - 48), YC - 48); c.lineTo(905, YC - 48); c.lineTo(905, YC - 26); c.lineTo(TW.x + TW.w + 4, YC - 26);
  c.lineTo(TW.x + TW.w + 4, YC + 26); c.lineTo(905, YC + 26); c.lineTo(905, YC + 48); c.lineTo(faceX(YC + 48), YC + 48); c.closePath();
}
function tubeLabel(c, s, x, y, align, pts) {
  c.save(); c.strokeStyle = 'rgba(243,232,205,0.75)'; c.lineWidth = 1.8; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
  const e = pts[pts.length - 1]; c.fillStyle = COL.cream; c.beginPath(); c.arc(e[0], e[1], 4, 0, TAU); c.fill();
  c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 6; txt(c, s, x, y, F.lab, COL.cream, align, '2px'); c.restore();
}

function tubeStatic(c) {
  const { x, y, w, h } = TW;
  c.save(); rr(c, x, y, w, h, 8); c.clip();
  // oil-filled housing
  let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2e1c0d'); g.addColorStop(0.5, '#1f1309'); g.addColorStop(1, '#130b05');
  c.fillStyle = g; c.fillRect(x, y, w, h);
  g = c.createRadialGradient(520, YC, 30, 520, YC, 540); g.addColorStop(0, 'rgba(255,170,80,0.11)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
  const r = rng(31);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,190,110,${0.02 + r() * 0.04})`; c.fillRect(x + r() * w, y + r() * h, 1.5, 1.5); }

  // legend: what the three kinds of marks are
  c.save(); c.lineCap = 'round';
  g = c.createLinearGradient(96, 0, 132, 0); g.addColorStop(0, 'rgba(150,210,255,0)'); g.addColorStop(1, 'rgba(190,232,255,0.9)');
  c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(96, 684); c.lineTo(132, 684); c.stroke();
  c.globalCompositeOperation = 'lighter'; glow(c, 132, 684, 13, '140,205,255', 0.6); c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#f2fbff'; c.beginPath(); c.arc(132, 684, 3.6, 0, TAU); c.fill();
  txt(c, 'ELECTRONS', 152, 695, F.lab, COL.blue, 'left', '2px');
  c.beginPath(); for (let q = 0; q <= 40; q++) { const xx = 94 + q, yy = 730 + 5 * Math.sin(Math.PI * q / 40) * Math.sin(q / 40 * TAU * 3.2); if (q) c.lineTo(xx, yy); else c.moveTo(xx, yy); }
  c.strokeStyle = 'rgba(125,255,176,0.25)'; c.lineWidth = 7; c.stroke(); c.strokeStyle = COL.green; c.lineWidth = 2.6; c.stroke();
  txt(c, 'X-RAY PHOTONS', 152, 741, F.lab, COL.green, 'left', '2px');
  c.restore();

  // cathode leads
  c.lineCap = 'butt';
  [-9, 9].forEach((d) => { c.strokeStyle = '#3c3d40'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 2, YC + d); c.lineTo(96, YC + d); c.stroke(); c.strokeStyle = '#96999e'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 2, YC + d - 0.6); c.lineTo(236, YC + d - 0.6); c.stroke(); });

  // exit port: collar, aluminum filter, lead collimator
  [668, 860].forEach((px) => { g = c.createLinearGradient(px, 0, px + 8, 0); g.addColorStop(0, '#4b4f56'); g.addColorStop(1, '#1f2125'); c.fillStyle = g; c.fillRect(px, 632, 8, 150); });
  g = c.createLinearGradient(0, Y_FILT, 0, Y_FILT + 12); g.addColorStop(0, '#f0f2f4'); g.addColorStop(0.5, '#b9bdc3'); g.addColorStop(1, '#868b92');
  c.fillStyle = g; c.fillRect(676, Y_FILT, 184, 12);
  c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(676, Y_FILT, 184, 1.5);
  const apL = FX - (Y_COLL + 9 - YC) * TAN12, apR = FX + (Y_COLL + 9 - YC) * TAN12;
  g = c.createLinearGradient(0, Y_COLL, 0, Y_COLL + 18); g.addColorStop(0, '#727985'); g.addColorStop(0.3, '#4a505a'); g.addColorStop(1, '#23262b');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(676, Y_COLL); c.lineTo(apL - 3, Y_COLL); c.lineTo(apL + 2, Y_COLL + 18); c.lineTo(676, Y_COLL + 18); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(860, Y_COLL); c.lineTo(apR + 3, Y_COLL); c.lineTo(apR - 2, Y_COLL + 18); c.lineTo(860, Y_COLL + 18); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(676, Y_COLL, apL - 3 - 676, 1.5); c.fillRect(apR + 3, Y_COLL, 860 - apR - 3, 1.5);

  // cooling fins on the copper stem (outside the glass)
  [958, 973, 988, 1003].forEach((fx) => { g = c.createLinearGradient(fx, 0, fx + 9, 0); g.addColorStop(0, '#c57a45'); g.addColorStop(1, '#5a2a12'); c.fillStyle = g; c.fillRect(fx, YC - 58, 9, 116); });

  // glass envelope: vacuum
  rr(c, 92, YC - 74, 852, 148, 60); c.fillStyle = 'rgba(5,4,7,0.68)'; c.fill();

  // cathode: glass stem, support, focusing cup
  rr(c, 92, YC - 24, 116, 48, 14); c.fillStyle = 'rgba(170,210,222,0.07)'; c.fill(); c.strokeStyle = 'rgba(200,232,240,0.38)'; c.lineWidth = 2; c.stroke();
  g = c.createLinearGradient(0, YC - 14, 0, YC + 14); g.addColorStop(0, '#34363a'); g.addColorStop(0.4, '#a7abb2'); g.addColorStop(1, '#2a2c30');
  c.fillStyle = g; c.fillRect(196, YC - 14, 34, 28);
  c.fillStyle = '#0c0c0f'; c.fillRect(266, YC - 25, 40, 50);
  g = c.createLinearGradient(0, YC - 46, 0, YC + 46);
  g.addColorStop(0, '#2a2c30'); g.addColorStop(0.2, '#8d9198'); g.addColorStop(0.36, '#cfd3d8'); g.addColorStop(0.62, '#70747b'); g.addColorStop(1, '#202226');
  c.fillStyle = g; c.beginPath();
  c.moveTo(226, YC - 46); c.lineTo(294, YC - 46); c.lineTo(304, YC - 36); c.lineTo(304, YC - 27); c.lineTo(296, YC - 24); c.lineTo(270, YC - 24);
  c.lineTo(270, YC + 24); c.lineTo(296, YC + 24); c.lineTo(304, YC + 27); c.lineTo(304, YC + 36); c.lineTo(294, YC + 46); c.lineTo(226, YC + 46); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.5; c.stroke();

  // copper anode with angled tungsten target
  g = c.createLinearGradient(0, YC - 48, 0, YC + 48);
  g.addColorStop(0, '#6a3216'); g.addColorStop(0.18, '#b9682f'); g.addColorStop(0.36, '#ecaa74'); g.addColorStop(0.56, '#c5743b'); g.addColorStop(0.84, '#874320'); g.addColorStop(1, '#4a210d');
  copperPath(c); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(30,10,3,0.75)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(255,222,180,0.30)'; c.beginPath(); c.moveTo(faceX(YC - 48), YC - 48); c.lineTo(faceX(YC - 48) + 7, YC - 48); c.lineTo(faceX(YC + 48) + 7, YC + 48); c.lineTo(faceX(YC + 48), YC + 48); c.closePath(); c.fill();
  g = c.createLinearGradient(FX - 8, 0, FX + 16, 0); g.addColorStop(0, '#aeb4be'); g.addColorStop(1, '#4b5059');
  c.fillStyle = g; c.beginPath(); c.moveTo(faceX(YC - 28) - 1, YC - 28); c.lineTo(faceX(YC - 28) + 12, YC - 28); c.lineTo(faceX(YC + 28) + 12, YC + 28); c.lineTo(faceX(YC + 28) - 1, YC + 28); c.closePath(); c.fill();
  c.strokeStyle = '#1d2024'; c.lineWidth = 1.5; c.stroke();
  [958, 973, 988, 1003].forEach((fx) => { g = c.createLinearGradient(fx, 0, fx + 9, 0); g.addColorStop(0, '#d58a52'); g.addColorStop(1, '#63301a'); c.fillStyle = g; c.fillRect(fx, YC - 58, 9, 116); });
  g = c.createLinearGradient(0, YC - 34, 0, YC + 34); g.addColorStop(0, '#2b2d31'); g.addColorStop(0.4, '#8e9299'); g.addColorStop(1, '#232528'); c.fillStyle = g; c.fillRect(936, YC - 33, 12, 66);

  // glass shell + highlights
  g = c.createLinearGradient(0, YC - 74, 0, YC + 74); g.addColorStop(0, 'rgba(185,225,235,0.16)'); g.addColorStop(0.22, 'rgba(185,225,235,0)'); g.addColorStop(0.82, 'rgba(185,225,235,0)'); g.addColorStop(1, 'rgba(185,225,235,0.11)');
  rr(c, 92, YC - 74, 852, 148, 60); c.fillStyle = g; c.fill();
  g = c.createLinearGradient(0, YC - 74, 0, YC + 74); g.addColorStop(0, 'rgba(220,242,247,0.8)'); g.addColorStop(0.5, 'rgba(150,190,200,0.34)'); g.addColorStop(1, 'rgba(205,232,240,0.62)');
  c.strokeStyle = g; c.lineWidth = 3.5; rr(c, 92, YC - 74, 852, 148, 60); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 1.5; rr(c, 99, YC - 67, 838, 134, 54); c.stroke();
  c.lineCap = 'round';
  g = c.createLinearGradient(160, 0, 660, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.2, 'rgba(255,255,255,0.42)'); g.addColorStop(0.8, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.strokeStyle = g; c.lineWidth = 5; c.beginPath(); c.moveTo(160, YC - 61); c.lineTo(660, YC - 61); c.stroke();
  g = c.createLinearGradient(200, 0, 600, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(200, YC + 63); c.lineTo(600, YC + 63); c.stroke();
  c.lineCap = 'butt';

  // labels
  tubeLabel(c, 'FILAMENT', FIL_X - 6, 462, 'center', [[FIL_X, 470], [FIL_X, YC - 22]]);
  tubeLabel(c, 'TUNGSTEN TARGET', 796, 462, 'center', [[772, 470], [faceX(YC - 20) + 5, YC - 20]]);
  tubeLabel(c, 'ALUMINUM FILTER', 640, 658, 'right', [[648, 648], [700, 648]]);
  tubeLabel(c, 'COLLIMATOR', 640, 704, 'right', [[648, 693], [700, 693]]);
  txt(c, 'SCHEMATIC', x + w - 12, y + h - 12, '600 22px "Barlow Condensed"', 'rgba(243,232,205,0.62)', 'right', '2.5px');
  c.restore();
}

function scopeStatic(c) {
  const { cx, cy, r, rb } = SCP;
  c.save(); c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 18; c.shadowOffsetY = 7; c.fillStyle = '#111'; c.beginPath(); c.arc(cx, cy, rb, 0, TAU); c.fill(); c.restore();
  let g = c.createConicGradient(-Math.PI * 0.75, cx, cy);
  [[0, '#fbfaf6'], [0.1, '#bdb9b1'], [0.22, '#8b877f'], [0.36, '#d3d0c9'], [0.5, '#f1efea'], [0.62, '#aaa69e'], [0.76, '#807c75'], [0.9, '#cbc8c0'], [1, '#fbfaf6']].forEach(([o, col]) => g.addColorStop(o, col));
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rb, 0, TAU); c.fill();
  for (let rr2 = r + 6; rr2 < rb; rr2 += 3) { c.strokeStyle = `rgba(0,0,0,${0.035 + 0.03 * hash(rr2, 9)})`; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, rr2, 0, TAU); c.stroke(); }
  g = c.createLinearGradient(cx - rb, cy - rb, cx + rb, cy + rb); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
  c.strokeStyle = g; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, rb - 1.5, 0, TAU); c.stroke();
  const ra = (r + rb) / 2 + 1;
  arcText(c, 'X-RAY SPECTRUM', cx, cy, ra, 0, F.lab, 3.4, false);
  arcText(c, 'ENERGY · keV', cx, cy, ra, Math.PI, F.lab, 3.4, true);
  arcText(c, 'PHOTONS', cx, cy, ra, -Math.PI / 2 + 0.04, F.lab, 3.4, false);
  arcText(c, 'SCHEMATIC', cx, cy, ra, Math.PI / 2, F.lab, 3.4, false);
  { const aa = -Math.PI / 2 + 0.47; c.save(); c.translate(cx + ra * Math.sin(aa), cy - ra * Math.cos(aa)); c.rotate(aa + Math.PI / 2); arrowUp(c, 0.8, 9.3, 17, 'rgba(255,255,255,0.6)'); arrowUp(c, 0, 8, 17, COL.ink); c.restore(); }
  [-52, 52, 128, 232].forEach((dg, i) => { const aa = dg * D2R; c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(cx + ra * Math.sin(aa) + 0.8, cy - ra * Math.cos(aa) + 1.2, 3.2, 0, TAU); c.fill(); c.fillStyle = COL.ink; c.beginPath(); c.arc(cx + ra * Math.sin(aa), cy - ra * Math.cos(aa), 3.2, 0, TAU); c.fill(); });
  // inner gasket + screen
  c.fillStyle = '#060605'; c.beginPath(); c.arc(cx, cy, r + 5, 0, TAU); c.fill();
  g = c.createRadialGradient(cx - 20, cy - 30, 10, cx, cy, r); g.addColorStop(0, '#123423'); g.addColorStop(0.6, '#0a1f15'); g.addColorStop(1, '#040d08');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(cx, cy, r - 1, 0, TAU); c.clip();
  c.lineWidth = 1;
  for (let i = -5; i <= 5; i++) { c.strokeStyle = 'rgba(110,235,165,0.11)'; c.beginPath(); c.moveTo(cx + i * 32, cy - r); c.lineTo(cx + i * 32, cy + r); c.stroke(); c.beginPath(); c.moveTo(cx - r, SCOPE.base + i * 32); c.lineTo(cx + r, SCOPE.base + i * 32); c.stroke(); }
  // axis + ticks
  c.strokeStyle = 'rgba(140,255,190,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(SCOPE.x0 - 6, SCOPE.base); c.lineTo(SCOPE.x0 + 80 * SCOPE.kx + 12, SCOPE.base); c.stroke();
  c.beginPath(); c.moveTo(SCOPE.x0, SCOPE.base + 4); c.lineTo(SCOPE.x0, SCOPE.base - SCOPE.hgt - 6); c.stroke();
  for (let E = 10; E <= 80; E += 10) { const xx = SCOPE.x0 + E * SCOPE.kx; c.strokeStyle = 'rgba(140,255,190,0.5)'; c.lineWidth = E % 20 ? 1.2 : 2; c.beginPath(); c.moveTo(xx, SCOPE.base); c.lineTo(xx, SCOPE.base + (E % 20 ? 5 : 9)); c.stroke(); }
  [20, 40].forEach((E) => txt(c, String(E), SCOPE.x0 + E * SCOPE.kx, SCOPE.base + 38, '600 30px "Barlow Condensed"', 'rgba(140,255,190,0.7)', 'center', '1px'));
  arrowUp(c, SCOPE.x0, SCOPE.base - SCOPE.hgt - 4, 13, 'rgba(140,255,190,0.55)');
  c.restore();
}
const SCOPE = { x0: SCP.cx - 126, kx: 3.15, base: SCP.cy + 74, hgt: 172 };

function vuStatic(c) {
  const { x, y, w, h } = VU, px = x + w / 2, py = y + 148, R = 118;
  blackBezel(c, x, y, w, h, 12);
  const fx = x + 12, fy = y + 12, fw = w - 24, fh = 108;
  let g = c.createRadialGradient(px, fy + fh + 30, 10, px, fy + fh, 200); g.addColorStop(0, '#fff7da'); g.addColorStop(0.55, '#f7e6b6'); g.addColorStop(1, '#dbc083');
  rr(c, fx, fy, fw, fh, 4); c.fillStyle = g; c.fill();
  c.save(); rr(c, fx, fy, fw, fh, 4); c.clip();
  const A0 = -48 * D2R, A1 = 48 * D2R, a84 = lerp(A0, A1, 0.86);
  c.strokeStyle = '#2a1b10'; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, R, -Math.PI / 2 + A0, -Math.PI / 2 + a84); c.stroke();
  c.strokeStyle = '#c8321c'; c.lineWidth = 7; c.beginPath(); c.arc(px, py, R + 2.2, -Math.PI / 2 + a84, -Math.PI / 2 + A1); c.stroke();
  for (let i = 0; i <= 20; i++) {
    const f = i / 20, a = lerp(A0, A1, f), major = i % 4 === 0, r1 = R + (major ? 13 : 7);
    c.strokeStyle = f > 0.86 ? '#c8321c' : '#2a1b10'; c.lineWidth = major ? 3 : 1.6;
    c.beginPath(); c.moveTo(px + R * Math.sin(a), py - R * Math.cos(a)); c.lineTo(px + r1 * Math.sin(a), py - r1 * Math.cos(a)); c.stroke();
  }
  g = c.createLinearGradient(0, fy, 0, fy + 26); g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(fx, fy, fw, 26);
  c.restore();
  // lower legend plate
  g = c.createLinearGradient(0, fy + fh, 0, fy + fh + 58); g.addColorStop(0, '#1d1a17'); g.addColorStop(1, '#0d0b0a');
  c.fillStyle = g; c.fillRect(fx, fy + fh, fw, 56);
  c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(fx, fy + fh, fw, 1.5);
  rich(c, [{ t: '~99% ', c: '#ff9a4d' }, { t: 'HEAT', c: COL.cream }], px, fy + fh + 43, '500 36px Oswald');
}

function imageStatic(c) {
  const { x, y, w, h } = IM;
  blackBezel(c, x, y, w, h, 12);
  rr(c, x + 10, y + 40, w - 20, 108, 4); c.fillStyle = '#050505'; c.fill();
}

function exposeStatic(c) {
  const { x, y } = EX;
  // EXPOSE legend tile
  rr(c, x + 1, y + 5, 186, 70, 10); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fill();
  let g = c.createLinearGradient(0, y + 8, 0, y + 72); g.addColorStop(0, '#fbfaf6'); g.addColorStop(0.5, '#8d8982'); g.addColorStop(1, '#4a4742');
  rr(c, x + 4, y + 8, 180, 64, 9); c.fillStyle = g; c.fill();
  rr(c, x + 9, y + 13, 170, 54, 6); c.fillStyle = '#120d08'; c.fill();
  // mAs counter
  txt(c, 'mAs', x + 306, y + 56, '700 40px Oswald', COL.cream, 'right', '1px');
  glassWindow(c, x + 320, y + 8, 196, 64, 6);
  // LED bar ticks + labels
  const bx = x + 12, by = y + 98, pitch = 50;
  c.fillStyle = 'rgba(0,0,0,0.5)'; rr(c, bx - 6, by - 6, 506, 38, 6); c.fill();
  c.strokeStyle = COL.cream; c.lineWidth = 2;
  [[0, '0'], [5, '0.1 s'], [10, '0.2 s']].forEach(([i, s]) => {
    const xx = bx + i * pitch - 3; c.globalAlpha = 0.7; c.beginPath(); c.moveTo(xx, by + 36); c.lineTo(xx, by + 46); c.stroke(); c.globalAlpha = 1;
    txt(c, s, i === 0 ? xx - 4 : i === 10 ? xx + 4 : xx, by + 76, F.lab, COL.cream, i === 0 ? 'left' : i === 10 ? 'right' : 'center', '1px');
  });
}

/* header of each knob column = [lamp] [name] [readout], laid out as one tight group centered on its knob so that a
 * value sits next to its own name (the TIME group is right-anchored at x = 942 to stay clear of the button column) */
function layoutHeaders(c) {
  KNOBS.forEach((K, k) => {
    const wn = tw(c, K.name, '700 40px Oswald', '0.5px'), winW = k === 2 ? 130 : 78, tot = 34 + 6 + wn + 16 + winW;
    const x0 = Math.round(k === 2 ? 942 - tot : K.cx - tot / 2);
    K.hd = { lamp: x0 + 17, name: x0 + 40, win: x0 + 40 + wn + 16, winW };
  });
}
function knobStatic(c, K) {
  const { cx } = K, cy = KY;
  // header: lamp bezel, engraved name, readout window
  jewelBezel(c, K.hd.lamp, 1245, 12);
  engrave(c, K.name, K.hd.name, 1261, '700 40px Oswald', 'left', '0.5px');
  glassWindow(c, K.hd.win, 1216, K.hd.winW, 58, 6);
  // engraved scale
  const dir = (a) => [Math.sin(a * D2R), -Math.cos(a * D2R)];
  const tick = (a, r0, r1, lw) => { const [dx, dy] = dir(a); c.lineCap = 'butt'; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = lw; c.beginPath(); c.moveTo(cx + r0 * dx + 0.8, cy + r0 * dy + 1.2); c.lineTo(cx + r1 * dx + 0.8, cy + r1 * dy + 1.2); c.stroke(); c.strokeStyle = COL.ink; c.beginPath(); c.moveTo(cx + r0 * dx, cy + r0 * dy); c.lineTo(cx + r1 * dx, cy + r1 * dy); c.stroke(); };
  K.majors.forEach((v, i) => {
    const a = K.ang(v), [dx, dy] = dir(a); tick(a, 101, 116, 3.2);
    engrave(c, K.labels[i], cx + 133 * dx, cy + 133 * dy + 11, '500 30px Oswald', 'center', '0px');
    if (i < K.majors.length - 1) { const a2 = K.ang(K.majors[i + 1]); for (let m = 1; m <= K.minors; m++) tick(lerp(a, a2, m / (K.minors + 1)), 101, 110, 1.8); }
  });
  // recess under the knob
  const g = c.createRadialGradient(cx, cy, KR - 4, cx, cy, KR + 11); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, KR + 11, 0, TAU); c.fill();
}

function buildFace() {
  const s = 168, cv = document.createElement('canvas'); cv.width = cv.height = s; const c = cv.getContext('2d'), R = 75, m = s / 2;
  const g = c.createConicGradient(-Math.PI * 0.75, m, m);
  [[0, '#fdfcf8'], [0.09, '#cfccc5'], [0.17, '#8f8b84'], [0.25, '#c9c6bf'], [0.34, '#eeedE8'], [0.42, '#a5a19a'], [0.5, '#e6e4de'], [0.59, '#bcb8b1'], [0.67, '#827e77'], [0.75, '#c2bfb8'], [0.84, '#f4f3ee'], [0.92, '#a9a59e'], [1, '#fdfcf8']].forEach(([o, col]) => g.addColorStop(o, col));
  c.fillStyle = g; c.beginPath(); c.arc(m, m, R, 0, TAU); c.fill();
  for (let r = 5; r < R; r += 3) { c.strokeStyle = `rgba(0,0,0,${0.03 + 0.035 * hash(r, 3)})`; c.lineWidth = 1; c.beginPath(); c.arc(m, m, r, 0, TAU); c.stroke(); }
  const g2 = c.createRadialGradient(m, m, R * 0.72, m, m, R); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = g2; c.beginPath(); c.arc(m, m, R, 0, TAU); c.fill();
  return cv;
}

/* mini radiograph + step wedge. k = contrast of the OBJECT tones about a pivot just under mid-gray; the directly
 * exposed background (gv <= 0.1) is left black at any k: raising kVp never lightens the raw-beam area. The swatch is
 * drawn density-matched, as in textbook step-wedge figures (at unchanged mAs the real image would also be darker). */
function buildRadiograph(k) {
  const w = 244, h = 108, mk = () => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
  const cv = mk(), c = cv.getContext('2d'), lay = mk(), l = lay.getContext('2d');
  const tone = (gv) => { const v = gv <= 0.1 ? gv : clamp(0.45 + (gv - 0.45) * k), L = 255 * Math.pow(v, 1.05); return `rgb(${(L * 0.93) | 0},${(L * 0.97) | 0},${L | 0})`; };
  c.fillStyle = tone(0.07); c.fillRect(0, 0, w, h);
  // soft tissue over the crest, then bone with trabeculae (drawn on a layer and blurred slightly)
  l.fillStyle = tone(0.40); l.beginPath(); l.moveTo(0, 56); l.quadraticCurveTo(45, 51, 90, 55); l.quadraticCurveTo(135, 51, 178, 56); l.lineTo(178, h); l.lineTo(0, h); l.closePath(); l.fill();
  const r = rng(77);
  for (let i = 0; i < 300; i++) { l.fillStyle = tone(0.28 + r() * 0.26); l.beginPath(); l.ellipse(r() * 178, 60 + r() * (h - 60), 1.6 + r() * 3.2, 1.2 + r() * 2.2, r() * 3, 0, TAU); l.fill(); }
  l.strokeStyle = tone(0.54); l.lineWidth = 2; l.beginPath(); l.moveTo(0, 56); l.quadraticCurveTo(45, 51, 90, 55); l.quadraticCurveTo(135, 51, 178, 56); l.stroke();   // crestal cortex
  const tooth = (ox, sc) => {
    l.save(); l.translate(ox, 3); l.scale(sc, 1); l.lineJoin = 'round'; l.lineCap = 'round';
    const root = () => { l.beginPath(); l.moveTo(-32, 44); l.lineTo(32, 44); l.bezierCurveTo(33, 68, 30, 90, 25, 100); l.quadraticCurveTo(20, 107, 15, 99); l.bezierCurveTo(11, 84, 8, 70, 0, 61); l.bezierCurveTo(-8, 70, -11, 84, -15, 99); l.quadraticCurveTo(-20, 107, -25, 100); l.bezierCurveTo(-30, 90, -33, 68, -32, 44); l.closePath(); };
    root(); l.lineWidth = 6.5; l.strokeStyle = tone(0.56); l.stroke();        // lamina dura
    root(); l.lineWidth = 3.4; l.strokeStyle = tone(0.17); l.stroke();        // PDL space
    root(); l.fillStyle = tone(0.64); l.fill();                               // dentin (roots)
    l.beginPath(); l.moveTo(-32, 47); l.bezierCurveTo(-44, 39, -46, 20, -36, 11); l.bezierCurveTo(-28, 4, -13, 5, -6, 11); l.quadraticCurveTo(0, 15, 6, 11); l.bezierCurveTo(13, 5, 28, 4, 36, 11); l.bezierCurveTo(46, 20, 44, 39, 32, 47); l.closePath(); l.fillStyle = tone(0.95); l.fill();   // enamel
    l.beginPath(); l.moveTo(-32, 48); l.bezierCurveTo(-37, 39, -37, 27, -29, 21); l.bezierCurveTo(-22, 16, -12, 17, -6, 21); l.quadraticCurveTo(0, 24, 6, 21); l.bezierCurveTo(12, 17, 22, 16, 29, 21); l.bezierCurveTo(37, 27, 37, 39, 32, 48); l.closePath(); l.fillStyle = tone(0.64); l.fill();   // dentin (crown)
    l.fillStyle = tone(0.30); l.beginPath(); l.moveTo(-16, 44); l.bezierCurveTo(-19, 36, -17, 29, -12, 29); l.quadraticCurveTo(-6, 33, 0, 32); l.quadraticCurveTo(6, 33, 12, 29); l.bezierCurveTo(17, 29, 19, 36, 16, 44); l.closePath(); l.fill();   // pulp chamber with horns
    l.strokeStyle = tone(0.34); l.lineWidth = 2.8; l.beginPath(); l.moveTo(-12, 43); l.bezierCurveTo(-18, 62, -21, 80, -20, 95); l.moveTo(12, 43); l.bezierCurveTo(18, 62, 21, 80, 20, 95); l.stroke();   // canals
    l.restore();
  };
  tooth(88, 1); tooth(-6, 0.82); tooth(182, 0.82);
  c.save(); c.beginPath(); c.rect(0, 0, 178, h); c.clip(); c.filter = 'blur(0.9px)'; c.drawImage(lay, 0, 0); c.restore();
  c.fillStyle = tone(0.07); c.fillRect(178, 0, w - 178, h);
  // step wedge
  [0.92, 0.72, 0.52, 0.32, 0.14].forEach((gv, i) => { c.fillStyle = tone(gv); c.fillRect(192, 8 + i * 18.4, 40, 18.4); });
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.strokeRect(192.5, 8.5, 39, 91);
  // film grain (same seed in both swatches, so the crossfade does not shimmer)
  const id = c.getImageData(0, 0, w, h), d = id.data, g = rng(123);
  for (let i = 0; i < d.length; i += 4) { const n = (g() - 0.5) * (6 + 0.05 * d[i + 2]); d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n, 0, 255); d[i + 2] = clamp(d[i + 2] + n, 0, 255); }
  c.putImageData(id, 0, 0);
  return cv;
}

function buildBG() {
  const c = bg.getContext('2d');
  // charcoal faceplate (fine powder-coat speckle)
  c.fillStyle = '#26221f'; c.fillRect(0, 0, W, H);
  const r = rng(7);
  for (let i = 0; i < 70000; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,238,215,0.045)' : 'rgba(0,0,0,0.13)'; c.fillRect(r() * W, r() * H, 1.4, 1.4); }
  let g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,232,200,0.09)'); g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.26)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  walnut(c, 0, 32, 3); walnut(c, W - 32, 32, 9);
  g = c.createLinearGradient(32, 0, 50, 0); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(32, 0, 18, H);
  g = c.createLinearGradient(W - 50, 0, W - 32, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); c.fillStyle = g; c.fillRect(W - 50, 0, 18, H);

  // ---- top: louvers, model plate, power lamp ----
  for (let i = 0; i < 4; i++) slot(c, 110, 46 + i * 26, 860, 12);
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 8; c.shadowOffsetY = 3; rr(c, 64, 168, 560, 50, 5); c.fillStyle = '#222'; c.fill(); c.restore();
  c.save(); rr(c, 64, 168, 560, 50, 5); c.clip(); brushed(c, 64, 168, 560, 50, 41); c.restore();
  engrave(c, 'X-RAY TUBE HEAD  ·  TEACHING CONSOLE', 344, 202, '600 26px "Barlow Condensed"', 'center', '3px');
  screw(c, 80, 193, 5, 0.4); screw(c, 608, 193, 5, 2.1);
  txt(c, 'POWER', 928, 202, '600 24px "Barlow Condensed"', 'rgba(243,232,205,0.8)', 'right', '3px');
  jewelBezel(c, 962, 193, 12); jewel(c, 962, 193, 12, 1, [255, 80, 50], [255, 220, 200], [190, 30, 12]);
  screw(c, 66, 30, 9, 0.7); screw(c, W - 66, 30, 9, -0.4);

  // ---- caption dial glass ----
  aluFrame(c, GL.x, GL.y, GL.w, GL.h, 10, 6, 51);
  g = c.createLinearGradient(0, GL.y, 0, GL.y + GL.h); g.addColorStop(0, '#080606'); g.addColorStop(0.5, '#120d09'); g.addColorStop(1, '#1b130c');
  rr(c, GL.x, GL.y, GL.w, GL.h, 6); c.fillStyle = g; c.fill();
  g = c.createRadialGradient(540, GL.y + GL.h + 60, 30, 540, GL.y + GL.h, 620); g.addColorStop(0, 'rgba(255,160,60,0.10)'); g.addColorStop(1, 'rgba(255,160,60,0)');
  rr(c, GL.x, GL.y, GL.w, GL.h, 6); c.fillStyle = g; c.fill();
  for (let i = 0; i <= 66; i++) { const xx = GL.x + 270 + i * 10, major = i % 6 === 0; c.fillStyle = `rgba(255,182,72,${major ? 0.55 : 0.3})`; c.fillRect(xx, GL.y + GL.h - (major ? 16 : 11), major ? 2 : 1.4, major ? 11 : 6); }

  // ---- tube-head window ----
  aluFrame(c, TW.x, TW.y, TW.w, TW.h, 12, 8, 61);
  tubeStatic(c);

  // ---- instruments ----
  vuStatic(c); imageStatic(c); exposeStatic(c); scopeStatic(c);

  // ---- knob strip (brushed aluminum) ----
  c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 14; c.shadowOffsetY = 5; rr(c, STRIP.x, STRIP.y, STRIP.w, STRIP.h, 10); c.fillStyle = '#222'; c.fill(); c.restore();
  c.save(); rr(c, STRIP.x, STRIP.y, STRIP.w, STRIP.h, 10); c.clip(); brushed(c, STRIP.x, STRIP.y, STRIP.w, STRIP.h, 71); c.restore();
  g = c.createLinearGradient(0, STRIP.y, 0, STRIP.y + STRIP.h); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  c.strokeStyle = g; c.lineWidth = 2; rr(c, STRIP.x + 1, STRIP.y + 1, STRIP.w - 2, STRIP.h - 2, 9); c.stroke();
  layoutHeaders(c); KNOBS.forEach((K) => knobStatic(c, K));
  [[STRIP.x + 18, STRIP.y + STRIP.h - 60], [STRIP.x + STRIP.w - 18, STRIP.y + 22], [STRIP.x + STRIP.w - 18, STRIP.y + STRIP.h - 60]].forEach(([sx, sy], i) => screw(c, sx, sy, 6.5, 0.5 + i * 1.3));
  { const src = 'McCollough; Zink, Radiographics 1997  ·  Seibert, J Nucl Med Technol 2004  ·  values illustrative';
    let fpx = 25; while (fpx > 22 && tw(c, src, `500 ${fpx}px "Barlow Condensed"`) > 868) fpx -= 0.5;
    engrave(c, src, 72, 1561, `500 ${fpx}px "Barlow Condensed"`, 'left', '0px', '#2a2622'); window.__srcw = [fpx, tw(c, src, `500 ${fpx}px "Barlow Condensed"`)]; }

  // ---- bottom: louvers, feet ----
  rr(c, 108, 1640, 864, 214, 12); c.fillStyle = 'rgba(0,0,0,0.45)'; c.fill();
  g = c.createLinearGradient(0, 1644, 0, 1850); g.addColorStop(0, '#2f2b27'); g.addColorStop(1, '#1d1a18'); rr(c, 112, 1644, 856, 206, 9); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(255,240,220,0.10)'; c.lineWidth = 1.5; rr(c, 112.5, 1644.5, 855, 205, 9); c.stroke();
  for (let row = 0; row < 13; row++) for (let col = 0; col < 58; col++) { const hx = 132 + col * 14.4 + (row % 2 ? 7.2 : 0), hy = 1663 + row * 14; if (hx > 950) continue; c.fillStyle = '#070606'; c.beginPath(); c.arc(hx, hy, 4.1, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,240,220,0.13)'; c.beginPath(); c.arc(hx, hy + 1.2, 4.1, 0.15 * Math.PI, 0.85 * Math.PI); c.fill(); c.fillStyle = '#070606'; c.beginPath(); c.arc(hx, hy, 3.5, 0, TAU); c.fill(); }
  screw(c, 84, 1622, 9, 1.1); screw(c, W - 84, 1622, 9, 0.2); screw(c, 84, 1872, 9, -0.6); screw(c, W - 84, 1872, 9, 2.0);
}

function buildVignette() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const g = c.createRadialGradient(W / 2, H * 0.47, 520, W / 2, H * 0.47, 1180); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}

/* ------------------------------------------------------------------ dynamic layers */
function capGlow(a) { ctx.shadowColor = `rgba(255,150,40,${0.8 * a})`; ctx.shadowBlur = 20; }

function drawCaption(t) {
  const cxm = GL.x + GL.w / 2;
  ctx.save(); rr(ctx, GL.x, GL.y, GL.w, GL.h, 6); ctx.clip();
  // tuner pointer = reel progress
  const px = GL.x + 270 + 660 * (t / T);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, px, GL.y + GL.h - 12, 26, '255,70,40', 0.5); ctx.restore();
  ctx.fillStyle = '#ff5a3c'; ctx.fillRect(px - 1.5, GL.y + GL.h - 24, 3, 22);
  // handle, printed like a brand line on the dial
  const aMA = env(t, SC_MA[0] + 0.1, SC_MA[1], 0.2, 0.2), aKV = env(t, SC_KV[0] + 0.05, SC_KV[1], 0.2, 0.2), aTS = env(t, SC_TS[0] + 0.05, END0 + 0.3, 0.2, 0.2);
  txt(ctx, '@natebrooksendo', GL.x + 20, GL.y + GL.h - 9, '500 25px "Barlow Condensed"', `rgba(255,190,96,${lerp(0.78, 0.58, Math.max(aMA, aKV, aTS))})`, 'left', '1.2px');

  // --- title ---
  const aT = Math.max(1 - seg(t, SC_MA[0] - 0.1, SC_MA[0] + 0.1), seg(t, END0 + 0.35, END0 + 0.7));
  if (aT > 0.003) {
    ctx.save(); ctx.globalAlpha = aT; capGlow(aT);
    const fq = '500 60px "Barlow Condensed"', w1 = tw(ctx, '3 KNOBS', '700 100px Oswald', '2px'), w2 = tw(ctx, 'What does each do?', fq);
    const x0 = cxm - (w1 + 40 + w2) / 2;
    txt(ctx, '3 KNOBS', x0, GL.y + 106, '700 100px Oswald', COL.amber, 'left', '2px');
    ctx.shadowBlur = 12;
    txt(ctx, 'What does each do?', x0 + w1 + 40, GL.y + 99, fq, COL.cream);
    ctx.restore();
  }
  // --- scene captions: headline + one sub line ---
  const head = (a, name, how, extra, shift = 0) => {
    ctx.save(); ctx.globalAlpha = a; capGlow(a);
    const wn = tw(ctx, name, F.head, '1px'), wh = tw(ctx, how, F.head, '1px'), we = extra ? tw(ctx, extra, F.head, '1px') + 26 : 0;
    const tot = wn + 86 + wh + we * shift, x0 = cxm - tot / 2, yb = GL.y + 74;
    txt(ctx, name, x0, yb, F.head, COL.amber, 'left', '1px');
    arrowR(ctx, x0 + wn + 22, yb - 22, 40, COL.amber);
    txt(ctx, how, x0 + wn + 86, yb, F.head, '#fff6e0', 'left', '1px');
    if (extra && shift > 0.01) { ctx.globalAlpha = a * shift; txt(ctx, extra, x0 + wn + 86 + wh + 26, yb, F.head, COL.green, 'left', '1px'); }
    ctx.restore();
  };
  const sub = (a, parts) => { if (a <= 0.003) return; ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = `rgba(255,150,40,${0.55 * a})`; ctx.shadowBlur = 10; rich(ctx, parts, cxm, GL.y + 122, F.sub); ctx.restore(); };
  const C = COL.cream, dotc = 'rgba(243,232,205,0.55)';
  if (aMA > 0.003) { head(aMA, 'mA', 'HOW MANY'); sub(aMA, [{ t: 'more ', c: C }, { t: 'electrons', c: COL.blue }, { t: ', more ', c: C }, { t: 'photons', c: COL.green }, { t: '  ·  ', c: dotc }, { t: 'same energies', c: C }]); }
  if (aKV > 0.003) {
    const sh = seg(t, KVB, KVB + 0.45, ease.smooth);
    head(aKV, 'kVp', 'HOW HARD', '+ HOW MANY', sh);
    sub(aKV * (1 - seg(t, KVB - 0.15, KVB + 0.1)), [{ t: 'max keV = kVp', c: COL.green }]);
    sub(aKV * seg(t, KVB + 0.15, KVB + 0.45), [{ t: 'output ~ kVp', c: C }, { t: '2', c: C, sup: true }]);
  }
  if (aTS > 0.003) { head(aTS, 'TIME', 'HOW LONG'); sub(aTS, [{ t: 'same beam, on longer', c: C }, { t: '  ·  ', c: dotc }, { t: 'mAs = mA × s', c: COL.amberHot }]); }
  // glass sheen
  const g = ctx.createLinearGradient(GL.x, GL.y, GL.x + 420, GL.y + GL.h); g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(0.5, 'rgba(255,255,255,0.015)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(GL.x, GL.y); ctx.lineTo(GL.x + 520, GL.y); ctx.lineTo(GL.x + 380, GL.y + GL.h); ctx.lineTo(GL.x, GL.y + GL.h); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawTube(t) {
  const { x, y, w, h } = TW, ma = setMA(t), kv = setKV(t), kvf = (kv - 60) / 10;
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // filament (brightness follows mA only)
  const fg = clamp((ma - 2) / 6);
  ctx.strokeStyle = Kit.rgba(Kit.mix([220, 96, 26], [255, 246, 214], fg)); ctx.lineWidth = 3.4;
  ctx.beginPath(); for (let i = 0; i <= 44; i++) { const yy = YC - 19 + i * 38 / 44, xx = FIL_X + 6 * Math.sin(i / 44 * Math.PI * 6); if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, FIL_X, YC, 34 + 40 * fg, '255,140,45', 0.40 + 0.5 * fg);
  glow(ctx, FIL_X, YC, 14 + 12 * fg, '255,238,200', 0.25 + 0.55 * fg);
  // space-charge cloud boiled off the filament
  for (let i = 0; i < 20; i++) {
    const a = clamp(ma * 2.3 - i); if (a <= 0) break;
    const px = FIL_X + 9 + 8 * Math.sin(TAU * ((7 + i % 5) * t / T) + i * 2.4) + 3 * Math.sin(TAU * (19 * t / T) + i), py = YC + 16 * Math.sin(TAU * ((9 + i % 7) * t / T) + i * 1.7) + 3 * Math.cos(TAU * (23 * t / T) + i * 0.6);
    glow(ctx, px, py, 7, '150,210,255', 0.55 * a); ctx.fillStyle = `rgba(225,244,255,${0.85 * a})`; ctx.beginPath(); ctx.arc(px, py, 2.1, 0, TAU); ctx.fill();
  }
  // electrons: rate = mA, energy (speed, tail, flash) = kVp
  const vis = sim(simOn, t);
  for (let i = lowerBound(electrons, t - 0.8); i < electrons.length && vis > 0.01; i++) {
    const e = electrons[i]; if (e.t > t) break;
    const s = (t - e.t) / e.tau, yEnd = YC + e.lane * 7, xHit = faceX(yEnd) - 1;
    const pos = (ss) => { const u = Math.pow(clamp(ss), 1.55); return [lerp(FIL_X + 8, xHit, u), YC + e.lane * lerp(17, 7, ease.smooth(u))]; };
    if (s < 1) {
      const [hx, hy] = pos(s), [tx, ty] = pos(s - (0.10 + 0.08 * e.kvf));
      const fade = clamp(s * 8) * vis;
      const g = ctx.createLinearGradient(tx, ty, hx, hy); g.addColorStop(0, 'rgba(150,210,255,0)'); g.addColorStop(1, `rgba(190,232,255,${0.85 * fade})`);
      ctx.strokeStyle = g; ctx.lineWidth = 3 + 1.2 * e.kvf; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      glow(ctx, hx, hy, 12 + 7 * e.kvf, '140,205,255', (0.5 + 0.3 * e.kvf) * fade);
      ctx.fillStyle = `rgba(242,251,255,${fade})`; ctx.beginPath(); ctx.arc(hx, hy, 3.3 + 1.0 * e.kvf, 0, TAU); ctx.fill();
    } else {
      const age = t - e.t - e.tau; if (age < 0.2) { const k = 1 - age / 0.2; glow(ctx, xHit, yEnd, (15 + 16 * e.kvf) * (1 + age * 3.5), '255,225,170', 0.75 * k * k * vis); }
    }
  }
  // knob value shown where it acts: tube current along the stream (mA scene), tube voltage across the gap (kVp scene)
  const gapTag = (aB, lab, volt) => {
    if (aB <= 0.003) return;
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = aB; ctx.lineCap = 'butt';
    const yb = YC + 47, xa = 326, xb = 722, xm = (xa + xb) / 2, f = '700 32px "Barlow Condensed"', wl = tw(ctx, lab, f, '1px');
    ctx.strokeStyle = 'rgba(169,224,255,0.8)'; ctx.fillStyle = '#dff3ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xa + 13, yb); ctx.lineTo(xm - wl / 2 - 14, yb); ctx.moveTo(xm + wl / 2 + 14, yb); ctx.lineTo(xb - 13, yb); ctx.stroke();
    if (volt) [xa, xb].forEach((xx, i) => { ctx.beginPath(); ctx.arc(xx, yb, 12, 0, TAU); ctx.stroke(); ctx.fillRect(xx - 6, yb - 1.2, 12, 2.4); if (i) ctx.fillRect(xx - 1.2, yb - 6, 2.4, 12); });
    else { [xm - wl / 2 - 14, xb + 2].forEach((xx) => { ctx.beginPath(); ctx.moveTo(xx, yb); ctx.lineTo(xx - 15, yb - 7.5); ctx.lineTo(xx - 15, yb + 7.5); ctx.closePath(); ctx.fill(); }); ctx.beginPath(); ctx.arc(xa + 8, yb, 4, 0, TAU); ctx.fill(); }
    txt(ctx, lab, xm, yb + 11, f, '#dff3ff', 'center', '1px');
    ctx.restore();
  };
  gapTag(env(t, SC_MA[0] + 0.2, SC_MA[1] - 0.05, 0.4, 0.35), `${Math.round(ma)} mA`, false);
  gapTag(env(t, SC_KV[0] + 0.2, SC_KV[1] - 0.1, 0.4, 0.4), `${Math.round(kv)} kVp`, true);
  // focal spot + anode heat (follows kV x mA)
  const on = vis, heat = sim(simHeat, t);
  const fs = on * (ma / 8) * Math.pow(kv / 70, 2);
  glow(ctx, FX + 1, YC, 30, '255,190,120', 0.6 * fs); glow(ctx, FX + 1, YC, 11, '255,255,235', 0.9 * fs);
  ctx.save(); copperPath(ctx); ctx.clip();
  let g = ctx.createRadialGradient(FX + 10, YC, 6, FX + 10, YC, 70 + 260 * heat);
  g.addColorStop(0, `rgba(255,160,80,${0.6 * heat})`); g.addColorStop(0.3, `rgba(255,80,20,${0.34 * heat})`); g.addColorStop(1, 'rgba(255,40,0,0)');
  ctx.fillStyle = g; ctx.fillRect(700, YC - 60, 330, 120);
  for (let k = 0; k < 6; k++) {
    const u = (t * 0.24 + k / 6) % 1, xx = 800 + u * 230, a = heat * 0.26 * Math.sin(Math.PI * u);
    const gg = ctx.createLinearGradient(xx - 16, 0, xx + 16, 0); gg.addColorStop(0, 'rgba(255,150,60,0)'); gg.addColorStop(0.5, `rgba(255,176,90,${a})`); gg.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = gg; ctx.fillRect(xx - 16, YC - 60, 32, 120);
  }
  ctx.restore();
  // X-ray beam: soft cone + photon wave packets (wavelength shortens with energy)
  const out = sim(simOn, t - 0.06) * (ma / 8) * Math.pow(kv / 70, 2);
  if (out > 0.004) {
    g = ctx.createLinearGradient(0, YC, 0, Y_COLL); g.addColorStop(0, `rgba(125,255,176,${0.26 * out})`); g.addColorStop(1, `rgba(125,255,176,${0.14 * out})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(FX, YC); ctx.lineTo(FX - (Y_COLL - YC) * TAN18, Y_COLL); ctx.lineTo(FX + (Y_COLL - YC) * TAN18, Y_COLL); ctx.closePath(); ctx.fill();
    g = ctx.createLinearGradient(0, Y_COLL, 0, Y_EXIT); g.addColorStop(0, `rgba(125,255,176,${0.20 * out})`); g.addColorStop(1, `rgba(125,255,176,${0.12 * out})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(FX - (Y_COLL - YC) * TAN12, Y_COLL); ctx.lineTo(FX - (Y_EXIT - YC) * TAN12, Y_EXIT); ctx.lineTo(FX + (Y_EXIT - YC) * TAN12, Y_EXIT); ctx.lineTo(FX + (Y_COLL - YC) * TAN12, Y_COLL); ctx.closePath(); ctx.fill();
  }
  const VP = 400, LP = 36;
  for (let i = lowerBound(photons, t - 0.85); i < photons.length; i++) {
    const p = photons[i]; if (p.t > t) break;
    const d = (t - p.t) * VP, cs = Math.cos(p.th), sn = Math.sin(p.th);
    const dStop = (!p.pass ? Y_FILT + 6 - YC : Math.abs(p.th) > 12 * D2R ? Y_COLL + 4 - YC : Y_EXIT + 50 - YC) / cs;
    if (d - LP > dStop) continue;
    const eN = clamp((p.E - 15) / 55), lam = lerp(26, 8, eN), sA = Math.max(10, d - LP), sB = Math.min(d, dStop);
    if (sB <= sA) continue;
    const a = (0.5 + 0.5 * eN) * clamp(d / 30);
    ctx.beginPath();
    for (let s = sA; s <= sB; s += 1.5) {
      const win = Math.sin(Math.PI * clamp((s - (d - LP)) / LP)), off = 4.2 * win * Math.sin(TAU * (s - d) / lam + p.ph);
      const xx = FX + s * sn + off * cs, yy = YC + s * cs - off * sn; if (s === sA) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = `rgba(125,255,176,${0.22 * a})`; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = `rgba(${lerp(150, 225, eN) | 0},255,${lerp(190, 232, eN) | 0},${a})`; ctx.lineWidth = 2.6; ctx.stroke();
  }
  ctx.restore();
}

function drawCheat(t) {
  const a = cheatA(t); if (a <= 0.003) return;
  const { x, y, w, h } = TW;
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
  ctx.fillStyle = `rgba(10,7,5,${a})`; ctx.fillRect(x, y, w, h);
  const g = ctx.createRadialGradient(540, y + h + 80, 40, 540, y + h, 700); g.addColorStop(0, `rgba(255,160,60,${0.10 * a})`); g.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const rows = [
    { name: 'mA', how: 'HOW MANY', yb: y + 82, right: [[{ t: 'same energies', c: COL.cream }]] },
    { name: 'kVp', how: 'HOW HARD', yb: y + 182, plus: '+ how many', right: [[{ t: 'max keV = kVp', c: COL.green }], [{ t: 'output ~ kVp', c: COL.cream }, { t: '2', c: COL.cream, sup: true }]] },
    { name: 'TIME', how: 'HOW LONG', yb: y + 320, right: [[{ t: 'mAs = mA × s', c: COL.amberHot }]] },
  ];
  ctx.fillStyle = `rgba(255,182,72,${0.22 * a * cheatTxt(t)})`; ctx.fillRect(x + 36, y + 112, w - 72, 2); ctx.fillRect(x + 36, y + 250, w - 72, 2);
  rows.forEach((R, i) => {
    const r0 = END0 + ROW0 + i * ROWD, ra = a * cheatTxt(t) * seg(t, r0, r0 + 0.4, ease.out); if (ra <= 0.003) return;
    const dx = -24 * (1 - seg(t, r0, r0 + 0.5, ease.out));
    ctx.save(); ctx.globalAlpha = ra; ctx.translate(dx, 0); capGlow(ra);
    txt(ctx, R.name, x + 52, R.yb, F.head, COL.amber, 'left', '1px');
    arrowR(ctx, x + 216, R.yb - 22, 40, COL.amber);
    txt(ctx, R.how, x + 284, R.yb, F.head, '#fff6e0', 'left', '1px');
    ctx.shadowBlur = 10;
    if (R.plus) txt(ctx, R.plus, x + 284, R.yb + 52, '500 42px Oswald', COL.green, 'left', '0.5px');
    R.right.forEach((parts, j) => rich(ctx, parts, x + 640, R.yb - 5 + j * 53, '600 46px "Barlow Condensed"', 'left'));
    ctx.restore();
  });
  ctx.restore();
}

function windowGlare() {
  const { x, y, w, h } = TW;
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
  let g = ctx.createLinearGradient(0, y, 0, y + 46); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, 46);
  g = ctx.createLinearGradient(x, 0, x + 30, 0); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 30, h);
  ctx.fillStyle = 'rgba(255,255,255,0.028)'; ctx.beginPath(); ctx.moveTo(x + 150, y); ctx.lineTo(x + 330, y); ctx.lineTo(x + 150, y + h); ctx.lineTo(x - 30, y + h); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 370, y); ctx.lineTo(x + 420, y); ctx.lineTo(x + 240, y + h); ctx.lineTo(x + 190, y + h); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawVU(t) {
  const { x, y, w } = VU, px = x + w / 2, py = y + 148;
  const f = clamp(sim(simNeedle, t), -0.03, 1.03), a = (-48 + 96 * f) * D2R;
  ctx.save(); rr(ctx, x + 12, y + 12, w - 24, 108, 4); ctx.clip();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(40,20,5,0.22)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px + 5, py + 4); ctx.lineTo(px + 5 + 128 * Math.sin(a), py + 4 - 128 * Math.cos(a)); ctx.stroke();
  ctx.strokeStyle = '#1c1410'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 128 * Math.sin(a), py - 128 * Math.cos(a)); ctx.stroke();
  ctx.strokeStyle = '#d2351d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + 96 * Math.sin(a), py - 96 * Math.cos(a)); ctx.lineTo(px + 128 * Math.sin(a), py - 128 * Math.cos(a)); ctx.stroke();
  // glass
  const g = ctx.createLinearGradient(x, y, x + 200, y + 120); g.addColorStop(0, 'rgba(255,255,255,0.30)'); g.addColorStop(0.45, 'rgba(255,255,255,0.03)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 12, y + 12); ctx.lineTo(x + 150, y + 12); ctx.lineTo(x + 70, y + 120); ctx.lineTo(x + 12, y + 120); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawImage_(t) {
  const { x, y, w } = IM, k = clamp((setKV(t) - 60) / 10);
  ctx.drawImage(radA, x + 10, y + 40);
  if (k > 0.002) { ctx.save(); ctx.globalAlpha = k; ctx.drawImage(radB, x + 10, y + 40); ctx.restore(); }
  // screen glass
  ctx.save(); rr(ctx, x + 10, y + 40, w - 20, 108, 4); ctx.clip();
  const g = ctx.createLinearGradient(x, y + 40, x + 160, y + 150); g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(0.5, 'rgba(255,255,255,0.02)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x + 10, y + 40, w - 20, 108); ctx.restore();
  // legends: the plate reads IMAGE until the third beat of the kVp scene, then the claim lights up (one focus at a time);
  // 'exaggerated' is on whenever the flattened swatch is
  const lab = seg(t, KVC, KVC + 0.45) * (1 - back(t)), lit = seg(lab, 0.45, 1), pulse = env(t, KVC + 0.1, KVC + 1.8, 0.4, 0.5);
  const dim = seg(t, SC_KV[1] - 0.3, SC_KV[1]) * (1 - seg(t, END0 + ROW0 + ROWD, END0 + ROW0 + ROWD + 0.4));   // quiet during TIME
  const cx = x + w / 2;
  if (lab < 0.45) txt(ctx, 'IMAGE', cx, y + 31, F.lab, `rgba(243,232,205,${0.7 * (1 - seg(lab, 0, 0.45))})`, 'center', '4px');
  if (lit > 0.003) {
    ctx.save(); ctx.globalAlpha = lit * lerp(1, 0.6, dim); ctx.shadowColor = `rgba(255,150,40,${(0.7 + 0.3 * pulse) * (1 - dim)})`; ctx.shadowBlur = (12 + 14 * pulse) * (1 - dim);
    const f = '600 30px "Barlow Condensed"', w1 = tw(ctx, 'kVp', f), w2 = tw(ctx, 'LESS CONTRAST', f), tot = w1 + 34 + w2, x0 = cx - tot / 2;
    txt(ctx, 'kVp', x0, y + 32, f, COL.amber, 'left'); arrowUp(ctx, x0 + w1 + 14, y + 31, 19, COL.amber);
    txt(ctx, 'LESS CONTRAST', x0 + w1 + 34, y + 32, f, '#fff6e0', 'left');
    ctx.restore();
  }
  const exA = k * lerp(0.62, 0.92, lit) * lerp(1, 0.72, dim);
  if (exA > 0.003) txt(ctx, 'exaggerated', cx, y + 178, '500 30px "Barlow Condensed"', `rgba(243,232,205,${exA})`, 'center', '1.5px');
}

function exposeState(t) {
  // -> {lit: display on, mAs: number, segs: 0..10 (float), on: lamp}
  const p1 = seg(t, BEAM[1][0], BEAM[1][1]), p2 = seg(t, BEAM[2][0], BEAM[2][1]);
  const lit = seg(t, BEAM[1][0] - 0.25, BEAM[1][0] - 0.1) * (1 - seg(t, RESET[0], RESET[0] + 0.3));
  let frac = t < BEAM[2][0] - 0.12 ? p1 * 0.5 : p2;                       // of 0.2 s
  return { lit, mAs: 8 * 0.2 * frac, segs: frac * 10, on: sim(simOn, t) };
}
function drawExpose(t) {
  const { x, y } = EX, S = exposeState(t);
  // legend tile
  const on = S.on;
  if (on > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; rr(ctx, x + 9, y + 13, 170, 54, 6); ctx.fillStyle = `rgba(255,150,40,${0.34 * on})`; ctx.fill(); glow(ctx, x + 94, y + 40, 150, '255,150,40', 0.30 * on); ctx.restore(); }
  ctx.save(); if (on > 0.01) { ctx.shadowColor = `rgba(255,170,60,${on})`; ctx.shadowBlur = 16; }
  txt(ctx, 'EXPOSE', x + 94, y + 54, '700 36px Oswald', Kit.rgba(Kit.mix([120, 74, 24], [255, 236, 190], on)), 'center', '4px'); ctx.restore();
  // mAs counter
  seg7(ctx, S.mAs.toFixed(2), x + 502, y + 17, 46, S.lit);
  // LED bar (each segment = 0.02 s)
  const bx = x + 12, by = y + 98;
  for (let i = 0; i < 10; i++) {
    const l = S.lit * clamp(S.segs - i);
    rr(ctx, bx + i * 50, by, 44, 26, 4); ctx.fillStyle = Kit.rgba(Kit.mix([58, 34, 10], [255, 190, 80], l)); ctx.fill();
    if (l > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, bx + i * 50 + 22, by + 13, 44, '255,150,40', 0.38 * l); ctx.restore(); rr(ctx, bx + i * 50 + 4, by + 3, 36, 8, 3); ctx.fillStyle = `rgba(255,246,214,${0.5 * l})`; ctx.fill(); }
  }
  // peak-hold marker (VU style): where the first, 0.10 s exposure stopped; the second one visibly runs past it
  const hold = S.lit * seg(t, BEAM[1][1] - 0.04, BEAM[1][1] + 0.12);
  if (hold > 0.01) { ctx.save(); ctx.shadowColor = `rgba(255,236,190,${hold})`; ctx.shadowBlur = 9; ctx.fillStyle = `rgba(255,250,232,${hold})`; ctx.fillRect(bx + 245.4, by - 5, 3.2, 36); ctx.restore(); }
}

function tracePath(kv, ma, close) {
  const { x0, kx, base, hgt } = SCOPE;
  ctx.beginPath(); ctx.moveTo(x0 + 6 * kx, base);
  for (let E = 6; E < kv; E += 0.75) ctx.lineTo(x0 + E * kx, base - specH(E, kv, ma) * hgt);
  ctx.lineTo(x0 + kv * kx, base);
  if (close) ctx.closePath();
}
function drawScope(t) {
  const { cx, cy, r } = SCP, { x0, kx, base, hgt } = SCOPE, kv = setKV(t), ma = setMA(t);
  const b = lerp(0.5, 1, sim(simOn, t));
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, TAU); ctx.clip();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // stored "before" traces
  const ghost = (a, gkv, gma) => { if (a <= 0.003) return; ctx.save(); ctx.setLineDash([7, 8]); ctx.strokeStyle = `rgba(140,255,190,${0.55 * a})`; ctx.lineWidth = 2.2; tracePath(gkv, gma, false); ctx.stroke(); ctx.restore(); };
  ghost(env(t, TURN_MA[0], SC_MA[1] + 0.2, 0.3, 0.5), 60, 4);
  ghost(env(t, TURN_KV[0], SC_KV[1] + 0.2, 0.3, 0.5), 60, 8);
  // kVp scene, second beat: the photons gained (area between the stored 60 kVp trace and the live one)
  const gain = env(t, KVB + 0.25, SC_KV[1] - 0.2, 0.6, 0.6) * lerp(1, 0.4, seg(t, KVC - 0.5, KVC, ease.smooth));
  if (gain > 0.003 && kv > 60.5) {
    ctx.beginPath(); ctx.moveTo(x0 + 6 * kx, base);
    for (let E = 6; E < kv; E += 0.75) ctx.lineTo(x0 + E * kx, base - specH(E, kv, ma) * hgt);
    ctx.lineTo(x0 + kv * kx, base); ctx.lineTo(x0 + 60 * kx, base);
    for (let E = 59.9; E >= 6; E -= 0.75) ctx.lineTo(x0 + E * kx, base - specH(E, 60, 8) * hgt);
    ctx.closePath(); ctx.fillStyle = `rgba(150,255,196,${0.34 * gain})`; ctx.fill();
  }
  // live trace
  let g = ctx.createLinearGradient(0, base - hgt, 0, base); g.addColorStop(0, `rgba(110,255,170,${0.34 * b})`); g.addColorStop(1, `rgba(110,255,170,${0.04 * b})`);
  tracePath(kv, ma, true); ctx.fillStyle = g; ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  tracePath(kv, ma, false);
  ctx.strokeStyle = `rgba(90,255,160,${0.16 * b})`; ctx.lineWidth = 13; ctx.stroke();
  ctx.strokeStyle = `rgba(110,255,175,${0.42 * b})`; ctx.lineWidth = 6; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = `rgba(222,255,236,${0.55 + 0.45 * b})`; ctx.lineWidth = 2.6; ctx.stroke();
  // end-point marker: max photon energy = kVp
  const mx = x0 + kv * kx, hi = Math.max(env(t, TURN_MA[1] + 0.1, SC_MA[1] - 0.3, 0.3, 0.4), env(t, TURN_KV[0], KVB + 0.4, 0.3, 0.5));
  ctx.strokeStyle = `rgba(222,255,236,${0.6 + 0.4 * hi})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, base + 2); ctx.lineTo(mx, base - 56); ctx.stroke();
  ctx.fillStyle = '#eafff2'; ctx.beginPath(); ctx.arc(mx, base, 4.5 + 1.5 * hi, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, mx, base, 16 + 10 * hi, '110,255,170', 0.5 + 0.4 * hi); ctx.restore();
  const lx = Math.min(mx, cx + 106);
  for (const pass of [0, 1]) {            // dark halo first (keeps the label clear of the trace), then the phosphor glow
    ctx.save(); if (pass) { ctx.shadowColor = 'rgba(90,255,160,0.9)'; ctx.shadowBlur = 8 + 8 * hi; } else { ctx.shadowColor = 'rgba(4,13,8,0.95)'; ctx.shadowBlur = 7; ctx.lineJoin = 'round'; }
    txt(ctx, 'MAX', lx + 1, base - 104, '600 30px "Barlow Condensed"', pass ? 'rgba(170,255,205,0.92)' : 'rgba(4,13,8,0.9)', 'center', '2px');
    rich(ctx, [{ t: String(Math.round(kv)), c: pass ? '#eafff2' : 'rgba(4,13,8,0.9)' }, { t: ' keV', c: pass ? 'rgba(200,255,224,0.9)' : 'rgba(4,13,8,0.9)' }], lx, base - 68, '700 32px "Barlow Condensed"');
    ctx.restore();
  }
  ctx.restore();
  // CRT glass
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  g = ctx.createRadialGradient(cx, cy, r * 0.62, cx, cy, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  g = ctx.createLinearGradient(cx - r, cy - r, cx, cy); g.addColorStop(0, 'rgba(255,255,255,0.20)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx - 58, cy - 78, 86, 44, -0.62, 0, TAU); ctx.fill();
  ctx.restore();
}

function lampLevel(k, t) {
  const sc = [SC_MA, SC_KV, SC_TS][k];
  return Math.max(env(t, WIG0 + WIGD * k, WIG0 + WIGD * k + WIGL, 0.1, 0.25), env(t, sc[0], sc[1], 0.2, 0.3),
    Math.min(seg(t, END0 + ROW0 + ROWD * k, END0 + ROW0 + 0.25 + ROWD * k), 1 - seg(t, T - 1.05, T - 0.65)));
}
function drawKnobs(t) {
  const vals = [setMA(t), setKV(t), setTS(t)], base = [4, 60, 0.10];
  const strs = [String(Math.round(vals[0])), String(Math.round(vals[1])), vals[2].toFixed(2)];
  KNOBS.forEach((K, k) => {
    const wu = seg(t, WIG0 + WIGD * k, WIG0 + WIGD * k + WIGL), wig = 13 * Math.sin(TAU * wu) * Math.sin(Math.PI * wu);   // hook: +/-10 deg nudge
    const { cx } = K, cy = KY, lit = lampLevel(k, t), aDeg = K.ang(vals[k]), a = (aDeg + wig) * D2R, wr = K.hd.win + K.hd.winW;
    jewel(ctx, K.hd.lamp, 1245, 12, lit);
    // readout
    if (k === 2) { seg7(ctx, strs[k], wr - 29, 1224, 42, 1); txt(ctx, 's', wr - 12, 1264, '600 30px "Barlow Condensed"', 'rgba(255,90,60,0.95)', 'center'); }
    else seg7(ctx, strs[k].padStart(2, ' '), wr - 13, 1224, 42, 1);
    // change arc: from the resting setting to the current one
    const a0 = K.ang(base[k]);
    if (aDeg - a0 > 0.5) {
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx + 0.8, cy + 1.2, KR + 7.5, (a0 - 90) * D2R, (aDeg - 90) * D2R); ctx.stroke();
      ctx.strokeStyle = '#e8501c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, KR + 7.5, (a0 - 90) * D2R, (aDeg - 90) * D2R); ctx.stroke(); ctx.restore();
    }
    // warm ring while this knob is being turned
    const turn = Math.max(Math.sin(Math.PI * seg(t, TURNS[k][0] - 0.25, TURNS[k][1] + 0.45)), 0.7 * Math.sin(Math.PI * wu));
    if (turn > 0.01) { ctx.save(); ctx.strokeStyle = `rgba(255,150,40,${0.5 * turn})`; ctx.lineWidth = 12; ctx.shadowColor = `rgba(255,150,40,${0.9 * turn})`; ctx.shadowBlur = 22; ctx.beginPath(); ctx.arc(cx, cy, KR + 2, 0, TAU); ctx.stroke(); ctx.restore(); }
    // shadow + skirt
    ctx.save();
    let g = ctx.createRadialGradient(cx + 9, cy + 15, KR - 24, cx + 9, cy + 15, KR + 34); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 130, cy - 124, 280, 290);
    ctx.fillStyle = '#211e1b'; ctx.beginPath(); ctx.arc(cx, cy, KR + 3, 0, TAU); ctx.fill();
    // knurled rim (teeth rotate, light stays put)
    g = ctx.createLinearGradient(cx - KR, cy - KR, cx + KR, cy + KR); g.addColorStop(0, '#a8a49c'); g.addColorStop(1, '#3f3c38'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, KR, 0, TAU); ctx.fill();
    const N = 54, d = TAU / N * 0.27, ri = KR - 14.5, ro = KR + 0.5;
    for (let i = 0; i < N; i++) {
      const aa = a + i * TAU / N, L = 0.5 + 0.5 * (-0.707 * Math.sin(aa) + 0.707 * Math.cos(aa));
      ctx.fillStyle = Kit.rgba(Kit.mix([70, 67, 62], [250, 248, 242], 0.12 + 0.86 * L));
      ctx.beginPath(); ctx.moveTo(cx + ri * Math.sin(aa - d), cy - ri * Math.cos(aa - d)); ctx.lineTo(cx + ro * Math.sin(aa - d), cy - ro * Math.cos(aa - d)); ctx.lineTo(cx + ro * Math.sin(aa + d), cy - ro * Math.cos(aa + d)); ctx.lineTo(cx + ri * Math.sin(aa + d), cy - ri * Math.cos(aa + d)); ctx.closePath(); ctx.fill();
    }
    g = ctx.createLinearGradient(cx - ri, cy - ri, cx + ri, cy + ri); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#5d5a54'); ctx.strokeStyle = g; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx, cy, ri, 0, TAU); ctx.stroke();
    const fs = (ri - 1.5) / 75 * 168; ctx.drawImage(knobFace, cx - fs / 2, cy - fs / 2, fs, fs);
    // pointer
    ctx.translate(cx, cy); ctx.rotate(a);
    ctx.fillStyle = '#2a211b'; rr(ctx, -6, -(ri - 3), 12, 46, 6); ctx.fill();
    ctx.fillStyle = lit > 0.5 ? '#ff7a2a' : '#f0601c'; rr(ctx, -3.2, -(ri - 5.5), 6.4, 41, 3.2); ctx.fill();
    ctx.fillStyle = '#e8501c'; ctx.strokeStyle = '#2a211b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -(KR + 11)); ctx.lineTo(-7.5, -(KR - 1)); ctx.lineTo(7.5, -(KR - 1)); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    // fixed specular on the cap
    g = ctx.createRadialGradient(cx - 25, cy - 29, 2, cx - 25, cy - 29, 58); g.addColorStop(0, 'rgba(255,255,255,0.42)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, ri - 2, 0, TAU); ctx.fill();
  });
  // focus: the two knobs that are not being turned sit in slight shade
  const any = seg(t, SC_MA[0], SC_MA[0] + 0.35) * (1 - seg(t, SC_TS[1] - 0.35, SC_TS[1]));
  if (any > 0.003) {
    const act = [SC_MA, SC_KV, SC_TS].map((sc) => seg(t, sc[0] - 0.18, sc[0] + 0.18, ease.smooth) * (1 - seg(t, sc[1] - 0.18, sc[1] + 0.18, ease.smooth)));
    const b = [STRIP.x, (KNOBS[0].cx + KNOBS[1].cx) / 2, (KNOBS[1].cx + KNOBS[2].cx) / 2, STRIP.x + STRIP.w];
    const g = ctx.createLinearGradient(STRIP.x, 0, STRIP.x + STRIP.w, 0), u = (xx) => (xx - STRIP.x) / STRIP.w;
    for (let k = 0; k < 3; k++) { const col = `rgba(24,16,10,${0.26 * any * (1 - act[k])})`; g.addColorStop(u(b[k] + (k ? 16 : 0)), col); g.addColorStop(u(b[k + 1] - (k < 2 ? 16 : 0)), col); }
    ctx.save(); rr(ctx, STRIP.x, STRIP.y, STRIP.w, STRIP.h, 10); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }
}

/* ------------------------------------------------------------------ REEL */
window.REEL = {
  title: 'kVp, mA, time: inside the X-ray tube head',
  duration: T,
  poster: 21.0,
  canvas,
  fonts: ['700 100px Oswald', '500 36px Oswald', '500 40px "Barlow Condensed"', '600 30px "Barlow Condensed"', '700 30px "Barlow Condensed"'],
  setup() { buildSims(); knobFace = buildFace(); radA = buildRadiograph(1); radB = buildRadiograph(0.5); buildBG(); vig = buildVignette(); },
  render(t) {
    t = clamp(t, 0, T);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    ctx.drawImage(bg, 0, 0);
    drawCaption(t);
    drawTube(t); drawCheat(t); windowGlare();
    drawVU(t); drawImage_(t); drawExpose(t); drawScope(t);
    drawKnobs(t);
    ctx.drawImage(vig, 0, 0);
  },
};
Kit.boot(window.REEL);
})();
