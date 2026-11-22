/*
 * Sample 23 — 2-D layer: studio backdrop, title, tidy teardown call-outs with thin leader lines, end card.
 * All positions in 1080 x 1920 px. Must-read text >= 30 px; fine print 24-26 px. Pure function of t.
 */
import { T } from './timeline.js';
const { seg, env, ease, clamp, lerp } = Kit;
const W = 1080, H = 1920;
const INK = '#14171c', MUTE = '#5b6370', AMBER = '#c26400', GREEN = '#0a9451', BLUE = '#1565d8', RED = '#d02a22', VIOLET = '#5a43e6';
const SG = '"Space Grotesk", sans-serif', IN = 'Inter, sans-serif';
const X0 = 64, XE = 416;                                    // label column: left edge, elbow of the leader lines

/* ---------- backdrop (drawn once) ---------- */
let bg = null;
export function drawBackground(ctx) {
  if (!bg) {
    bg = document.createElement('canvas'); bg.width = W; bg.height = H; const g = bg.getContext('2d');
    const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, '#f7f8fa'); lg.addColorStop(0.55, '#eceef2'); lg.addColorStop(1, '#d9dde4');
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    const rg = g.createRadialGradient(660, 760, 60, 660, 760, 980); rg.addColorStop(0, 'rgba(255,255,255,.85)'); rg.addColorStop(0.5, 'rgba(255,255,255,.25)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(540, 900, 700, 540, 900, 1350); vg.addColorStop(0, 'rgba(120,130,150,0)'); vg.addColorStop(1, 'rgba(120,130,150,.16)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
  ctx.globalAlpha = 1; ctx.drawImage(bg, 0, 0);
}

/* ---------- text helpers ---------- */
function rich(ctx, segs, x, y, font, a) {            // [[text, color], ...] on one baseline
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; let cx = x;
  for (const [txt, col] of segs) { ctx.fillStyle = col || INK; ctx.globalAlpha = a; ctx.fillText(txt, cx, y); cx += ctx.measureText(txt).width; }
  return cx - x;
}
function spaced(ctx, txt, x, y, font, color, a, ls = 3, align = 'left') {
  ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.globalAlpha = a; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = ls + 'px'; ctx.fillText(txt, x, y); ctx.restore();
}
function pathPart(ctx, pts, u) {                     // stroke the first fraction u of a polyline
  let tot = 0; const L = []; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); L.push(l); tot += l; }
  let rem = tot * clamp(u); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < L.length && rem > 0; i++) { const f = Math.min(1, rem / (L[i] || 1)); ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)); rem -= L[i]; }
  ctx.stroke();
}

/**
 * teardown call-out: index + hairline that runs to the part, name under the line, function lines below.
 * c: { idx, name, y, anchor:[x,y], a (0..1 appear), on (0..1 emphasis), lines:[{segs, a, font?, lh?}], size?, tag? }
 */
function callout(ctx, c) {
  if (c.a <= 0.004) return;
  const a = c.a, on = c.on == null ? 1 : c.on;
  ctx.save();
  // index
  ctx.font = `600 22px ${SG}`; ctx.fillStyle = MUTE; ctx.globalAlpha = a * lerp(0.75, 1, on); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1px'; ctx.fillText(c.idx, X0, c.y + 1); const iw = c.idx ? ctx.measureText(c.idx).width + 12 : 0; ctx.letterSpacing = '0px';
  // hairline + leader + terminal
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = a * lerp(0.42, 0.85, on);
  const g = ease.out(clamp(a * 1.15));
  pathPart(ctx, [[X0 + iw, c.y], [XE, c.y], c.anchor], g);
  if (g > 0.92) {
    const k = (g - 0.92) / 0.08; ctx.globalAlpha = a * k;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(c.anchor[0], c.anchor[1], 8.5, 0, 7); ctx.fill();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(c.anchor[0], c.anchor[1], 4.6, 0, 7); ctx.fill();
  }
  // name
  const ns = c.size || 38;
  ctx.globalAlpha = a * lerp(0.72, 1, on); ctx.fillStyle = INK; ctx.font = `600 ${ns}px ${SG}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(c.name, X0, c.y + ns + 8 - 6 * (1 - a));
  if (c.tag) { const nw = ctx.measureText(c.name).width; ctx.font = `500 26px ${IN}`; ctx.fillStyle = MUTE; ctx.fillText(c.tag, X0 + nw + 14, c.y + ns + 8); }
  // function lines
  let yy = c.y + ns + 8;
  for (const ln of c.lines || []) {
    yy += ln.lh || 40; if (ln.a <= 0.004) continue;
    rich(ctx, ln.segs, X0 + 8 * (1 - ease.out(ln.a)), yy, ln.font || `500 30px ${IN}`, a * ln.a * lerp(0.6, 1, on));
  }
  ctx.restore();
}

const ARROW = [' → ', MUTE];

export function drawOverlay(ctx, t, A) {
  ctx.save();
  const loopIn = seg(t, T.loop[0] + 0.3, T.loop[1] - 0.08, ease.smooth);

  /* ---------- header: kicker, schematic note, handle ---------- */
  const kick = [
    ['DIGITAL INTRAORAL X-RAY SENSOR', Math.max(1 - seg(t, T.sensorOut[0], T.sensorOut[0] + 0.35), loopIn)],
    ['PHOSPHOR PLATE (PSP) + SCANNER', env(t, T.pspTitle - 0.15, T.pspOut + 0.2, 0.35, 0.35)],
    ['TWO DETECTORS, SIDE BY SIDE', env(t, T.endText[0], T.endText[1], 0.4, 0.35)],
  ];
  for (const [txt, a] of kick) if (a > 0.004) spaced(ctx, txt, X0, 272, `600 24px ${SG}`, MUTE, a, 2.6);
  ctx.globalAlpha = 1; ctx.font = `400 26px ${IN}`; ctx.fillStyle = MUTE; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('schematic · not to scale', X0, 310);
  ctx.textAlign = 'right'; ctx.font = `500 26px ${IN}`; ctx.globalAlpha = 0.8; ctx.fillText('@natebrooksendo', 1016, 272);

  /* ---------- hook title ---------- */
  const ta = Math.max(1 - seg(t, T.hook[1] - 0.3, T.hook[1] + 0.05), loopIn);
  if (ta > 0.004) {
    const dy = -14 * seg(t, T.hook[1] - 0.3, T.hook[1] + 0.05) * (t < 5 ? 1 : 0);
    ctx.textAlign = 'left'; ctx.globalAlpha = ta; ctx.fillStyle = INK; ctx.font = `700 112px ${SG}`; ctx.letterSpacing = '-3px';
    ctx.fillText('From X-ray', X0 - 4, 444 + dy); ctx.fillText('to pixel', X0 - 4, 556 + dy); ctx.letterSpacing = '0px';
    ctx.fillStyle = AMBER; ctx.fillRect(X0, 596 + dy, 92, 7);
  }

  /* ---------- sensor call-outs ---------- */
  const out = 1 - seg(t, T.labelsOut, T.labelsOut + 0.35);
  if (t > T.names - 0.05 && out > 0.004) {
    const nm = (i) => seg(t, T.names + i * 0.15, T.names + i * 0.15 + 0.45) * out;
    const all = Math.max(1 - seg(t, T.scint - 0.2, T.scint + 0.1), seg(t, T.refine[0], T.refine[1]));          // everything at full ink before the first beat and for the summary frame
    const foc = (a, b) => Math.max(all, env(t, a - 0.15, b + 0.15, 0.3, 0.3));
    const li = (t0) => seg(t, t0, t0 + 0.35);
    const F = `500 30px ${IN}`, Fm = `400 30px ${IN}`;
    callout(ctx, { idx: '01', name: 'Housing', y: 462, anchor: A.lid, a: nm(0), on: all });
    callout(ctx, { idx: '02', name: 'Scintillator', y: 592, anchor: A.scint, a: nm(1), on: foc(T.scint, T.fop), lines: [
      { segs: [['X-ray', AMBER], ARROW, ['visible light', GREEN]], a: li(T.scint), font: F },
      { segs: [['CsI or Gd oxysulfide', MUTE]], a: li(T.scint + 0.35), font: Fm, lh: 38 }] });
    callout(ctx, { idx: '03', name: 'Fiber-optic plate', y: 746, anchor: A.fop, a: nm(2), on: foc(T.fop, T.cmos), lines: [
      { segs: [['guides light, less noise', INK]], a: li(T.fop), font: F }] });
    callout(ctx, { idx: '04', name: 'CMOS chip', y: 900, anchor: A.chip, a: nm(3), on: foc(T.cmos, T.adc), lines: [
      { segs: [['light', GREEN], ARROW, ['charge', BLUE]], a: li(T.cmos), font: F },
      { segs: [['a transistor at', INK]], a: li(T.cmos2), font: F, lh: 38 },
      { segs: [['every pixel', INK]], a: li(T.cmos2 + 0.1), font: F, lh: 38 }] });
    callout(ctx, { idx: '05', name: 'Read-out + ADC', y: 1090, anchor: A.pcb, a: nm(4), on: foc(T.adc, T.refine[0]), lines: [
      { segs: [['charge', BLUE], ARROW, ['number', INK]], a: li(T.adc), font: F },
      { segs: [['8–16 bit', MUTE]], a: li(T.adc + 0.3), font: F, lh: 38 }] });
    callout(ctx, { idx: '06', name: 'Image', y: 1296, anchor: A.mon, a: seg(t, T.img - 0.5, T.img - 0.05) * out, on: foc(T.img, T.refine[0]), lines: [
      { segs: [['number', INK], ARROW, ['gray level', MUTE]], a: li(T.img), font: F }] });
  }

  /* ---------- PSP: plate call-out, numbered steps, photomultiplier tag ---------- */
  const pa = env(t, T.pspTitle, T.pspOut + 0.25, 0.4, 0.35);
  if (pa > 0.004) {
    const steps = [
      { n: '1', t0: T.pspExpose[0], t1: T.pspScan[0] - 0.1, l1: [['X-rays', AMBER], ARROW], l2: [['trapped electrons', BLUE]] },
      { n: '2', t0: T.pspScan[0] - 0.1, t1: T.pspScan[1], l1: [['red laser', RED], ARROW], l2: [['blue-violet light', VIOLET]] },
      { n: '3', t0: T.eraseLabel, t1: T.pspOut + 0.3, l1: [['bright light erases', INK]], l2: [] },
    ];
    steps.forEach((s, i) => {
      const a = seg(t, s.t0 - 0.1, s.t0 + 0.3) * pa; if (a <= 0.004) return;
      const on = lerp(0.62, 1, env(t, s.t0 - 0.2, s.t1 + 0.15, 0.25, 0.3)), y = 470 + i * 132, sl = 8 * (1 - ease.out(a / pa));
      ctx.globalAlpha = a * on; ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(X0 + 21, y - 11, 21, 0, 7); ctx.stroke();
      ctx.fillStyle = INK; ctx.font = `600 26px ${SG}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.n, X0 + 21, y - 10);
      rich(ctx, s.l1, X0 + 60 + sl, y, `500 32px ${IN}`, a * on); rich(ctx, s.l2, X0 + 60 + sl, y + 42, `500 32px ${IN}`, a * on);
    });
    callout(ctx, { idx: '', name: 'PSP plate', y: 968, anchor: A.plate, a: pa, on: 1, size: 40, lines: [
      { segs: [['Eu-doped barium', MUTE]], a: seg(t, T.pspTitle + 0.3, T.pspTitle + 0.7), font: `400 30px ${IN}` },
      { segs: [['fluorohalide', MUTE]], a: seg(t, T.pspTitle + 0.4, T.pspTitle + 0.8), font: `400 30px ${IN}`, lh: 38 }] });
    const ma = env(t, T.pspScan[0] + 0.15, T.pspOut - 0.9, 0.35, 0.3) * pa;
    if (ma > 0.004) {
      const tx = 1012, ty = A.pmt[1] - 112, tw = 222;
      ctx.globalAlpha = ma * 0.8; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(tx - tw, ty + 14); ctx.lineTo(A.pmt[0] + 4, ty + 14); ctx.lineTo(A.pmt[0], A.pmt[1] - 4); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(A.pmt[0], A.pmt[1], 8.5, 0, 7); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(A.pmt[0], A.pmt[1], 4.6, 0, 7); ctx.fill();
      ctx.globalAlpha = ma; ctx.font = `600 30px ${SG}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = INK; ctx.fillText('photomultiplier', tx, ty);
    }
  }

  /* ---------- end card ---------- */
  const ea = env(t, T.endText[0], T.endText[1], 0.45, 0.35);
  if (ea > 0.004) {
    const F = `500 34px ${IN}`, li = (d) => seg(t, T.endText[0] + d, T.endText[0] + d + 0.4);
    callout(ctx, { idx: 'A', name: 'Sensor', tag: 'CMOS · CCD', y: 520, anchor: A.lid, a: ea, on: 1, size: 48, lines: [
      { segs: [['instant image', INK]], a: li(0.15), font: F, lh: 50 }, { segs: [['rigid', INK]], a: li(0.3), font: F, lh: 44 }] });
    callout(ctx, { idx: 'B', name: 'PSP plate', y: 1010, anchor: A.plate, a: ea, on: 1, size: 48, lines: [
      { segs: [['thin, film-sized', INK]], a: li(0.45), font: F, lh: 50 }, { segs: [['wide latitude', INK]], a: li(0.6), font: F, lh: 44 }, { segs: [['needs a scanner', INK]], a: li(0.75), font: F, lh: 44 }] });
  }

  /* ---------- one source line per scene (two short rows, bottom of the label column) ---------- */
  const src = [
    [['White & Pharoah,', 'Oral Radiology 7e (textbook)'], env(t, T.names + 0.4, T.labelsOut + 0.3, 0.4, 0.35)],
    [['White & Pharoah 7e (textbook)', 'Leblans 2011, Materials'], env(t, T.pspTitle + 0.2, T.pspOut + 0.25, 0.4, 0.35)],
    [['White & Pharoah 7e (textbook)', 'Berkhout 2004, DMFR'], ea],
  ];
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `400 24px ${IN}`; ctx.fillStyle = MUTE;
  for (const [rows, a] of src) if (a > 0.004) { ctx.globalAlpha = a * 0.95; ctx.fillText(rows[0], X0, 1532); ctx.fillText(rows[1], X0, 1564); }
  ctx.restore();
}
