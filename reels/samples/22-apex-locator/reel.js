/*
 * 22 · How an electronic apex locator works — PRINTED CIRCUIT BOARD / SCHEMATIC style.
 * One full-frame 2D canvas; render(t) is a pure function of t. Static board art is pre-rendered once in setup().
 * Everything electrical is a labelled schematic (see NOTES.md): no component values, no quotient digits.
 */
(() => {
  'use strict';
  const K = Kit, { W, H, clamp, lerp, seg, env, ease, rgba, mix, hash, noise2 } = K;
  const { canvas, ctx } = K.createCanvas();
  const TAU = Math.PI * 2;
  const FH = '"Share Tech Mono", "IBM Plex Mono", monospace';   // silkscreen
  const FM = '"IBM Plex Mono", "Share Tech Mono", monospace';   // fine print

  const P = {
    silk: '#f1f6ec', gold: '#edbd52', goldHi: '#fff3c4', goldDim: '#84713a',
    pink: '#ff7cc4', cyan: '#62e2ff',
    lcdInk: [22, 36, 26], chipInk: '#d5dbd6',
    saline: '#9fcdff', naocl: '#f7f08c',
  };

  // ------------------------------------------------------------------ geometry
  const CX = 540;
  const TIP_PARK = 1130, TIP_A = 1185, TIP_B = 1271, FORAMEN = 1372, FILE_L = 517, PX_MM = 45;
  const LCD = { x: 64, y: 456, w: 406, h: 246 };
  const SCO = { x: 640, y: 456, w: 376, h: 246 };
  const CHIP = { x: 690, y: 748, w: 304, h: 256 };
  const SRC_A = { x: 130, y: 800 }, SRC_B = { x: 270, y: 800 }, SRC_R = 34;

  const TOOTH_D = 'M454 1050 C430 1024 414 982 420 946 C426 912 446 892 472 887 C492 884 506 892 520 898 L560 898 C574 892 588 884 608 887 C634 892 654 912 660 946 C666 982 650 1024 626 1050 C618 1120 606 1200 592 1270 C582 1320 570 1356 556 1374 C550 1382 530 1382 524 1374 C510 1356 498 1320 488 1270 C474 1200 462 1120 454 1050 Z';
  const toothOuter = new Path2D(TOOTH_D);
  const GLINT = { L: 1, top: 0, apex: 1 };                     // outline length and the arc positions of crown top / apex (filled in setup)
  const pulp = new Path2D('M520 893 L520 950 C500 952 486 962 490 984 C492 1010 506 1040 526 1074 L534 1368 L534 1392 L546 1392 L546 1368 L554 1074 C574 1040 588 1010 590 984 C594 962 580 952 560 950 L560 893 Z');
  const pulpWallL = new Path2D('M520 899 L520 950 C500 952 486 962 490 984 C492 1010 506 1040 526 1074 L534 1371');
  const pulpWallR = new Path2D('M560 899 L560 950 C580 952 594 962 590 984 C588 1010 574 1040 554 1074 L546 1371');
  const dejL = new Path2D('M460 1042 C444 1020 434 986 439 953 C445 925 458 910 477 905 C492 903 504 909 518 915');
  const socket = new Path2D('M452 1048 C420 1044 402 1060 404 1086 C410 1160 426 1240 446 1300 C462 1352 496 1426 540 1426 C584 1426 618 1352 634 1300 C654 1240 668 1170 672 1106 Q674 1096 686 1096 L893 1096 Q905 1096 905 1084 L905 1058 Q905 1046 893 1046 L640 1046 L628 1050 L540 1200 Z');
  const BODY_PATH = [[540, 1380], [540, 1404], [572, 1400], [598, 1342], [618, 1272], [634, 1185], [648, 1112], [676, 1071], [905, 1071]];

  // ------------------------------------------------------------------ small helpers
  const trace = (g, pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
  const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  function cham(pts, c = 16) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1), cc = Math.min(c, l1 / 2, l2 / 2);
      out.push([x1 - (x1 - x0) / l1 * cc, y1 - (y1 - y0) / l1 * cc], [x1 + (x2 - x1) / l2 * cc, y1 + (y2 - y1) / l2 * cc]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  function txt(g, s, x, y, size, color, o = {}) {
    g.font = `${o.w || 400} ${size}px ${o.f || FH}`; g.fillStyle = color; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
    g.letterSpacing = (o.ls || 0) + 'px'; g.fillText(s, x, y); g.letterSpacing = '0px';
  }
  function tw(g, s, size, o = {}) { g.font = `${o.w || 400} ${size}px ${o.f || FH}`; g.letterSpacing = (o.ls || 0) + 'px'; const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; }

  /** exposed gold trace. b = brightness 0..1 (energised), p = fraction of the length that is energised */
  function goldTrace(g, pts, w, b = 0, p = 1) {
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    trace(g, pts);
    g.strokeStyle = 'rgba(2,20,13,0.62)'; g.lineWidth = w + 4; g.stroke();
    g.strokeStyle = P.goldDim; g.lineWidth = w; g.stroke();
    g.strokeStyle = 'rgba(196,176,104,0.6)'; g.lineWidth = Math.max(1.2, w * 0.28); g.stroke();
    if (b > 0.01 && p > 0.002) {
      const L = plen(pts);
      if (p < 0.999) g.setLineDash([L * p, L * 3]);
      g.strokeStyle = rgba('#ffd66e', 0.08 * b); g.lineWidth = w + 22; g.stroke();
      g.strokeStyle = rgba('#ffd66e', 0.15 * b); g.lineWidth = w + 10; g.stroke();
      g.strokeStyle = rgba(mix(P.goldDim, P.gold, b)); g.lineWidth = w; g.stroke();
      g.strokeStyle = rgba(mix('#c4b068', P.goldHi, b), 0.95); g.lineWidth = Math.max(1.2, w * 0.3); g.stroke();
      g.setLineDash([]);
    }
    g.restore();
  }
  /** moving dashes ("current") along a path. off = distance travelled (px) */
  function flow(g, pts, color, off, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0.01) return;
    const w = o.w || 5;
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    trace(g, pts);
    g.setLineDash([o.dash || 12, o.gap || 84]); g.lineDashOffset = -off;
    g.strokeStyle = rgba(color, a * 0.3); g.lineWidth = w + 9; g.stroke();
    g.strokeStyle = rgba(color, a); g.lineWidth = w; g.stroke();
    g.strokeStyle = rgba('#ffffff', a * 0.85); g.lineWidth = w * 0.4; g.stroke();
    g.restore();
  }
  function pad(g, x, y, w, h, b = 0, r = 4) {
    g.save();
    rr(g, x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, r + 2); g.fillStyle = 'rgba(2,20,13,0.6)'; g.fill();
    const gr = g.createLinearGradient(x, y - h / 2, x, y + h / 2);
    gr.addColorStop(0, rgba(mix('#b79c50', '#fff0b4', b))); gr.addColorStop(1, rgba(mix('#7a6830', '#dba93f', b)));
    rr(g, x - w / 2, y - h / 2, w, h, r); g.fillStyle = gr; g.fill();
    g.restore();
  }
  function via(g, x, y, r = 9, b = 0) {
    g.save();
    g.beginPath(); g.arc(x, y, r + 2.5, 0, TAU); g.fillStyle = 'rgba(2,20,13,0.6)'; g.fill();
    if (b > 0.01) { g.beginPath(); g.arc(x, y, r + 12, 0, TAU); g.fillStyle = rgba('#ffd66e', 0.16 * b); g.fill(); }
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = rgba(mix('#9c8442', '#f6cf68', b)); g.fill();
    g.beginPath(); g.arc(x, y, r * 0.42, 0, TAU); g.fillStyle = '#04150e'; g.fill();
    g.restore();
  }
  function leader(g, x1, y1, x2, y2, a) {
    g.save(); g.globalAlpha *= a; g.strokeStyle = P.silk; g.fillStyle = P.silk; g.lineWidth = 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.beginPath(); g.arc(x2, y2, 4.5, 0, TAU); g.fill(); g.restore();
  }

  // ------------------------------------------------------------------ static board art
  let base, vign, pourDim, pourLit;
  const FRAME = cham([[980, 458], [980, 438], [44, 438], [44, 800], [96, 800]], 18);
  const CHAIN_OUT = cham([[676, 790], [618, 790], [618, 474], [470, 474]], 14);
  const CHAIN_P = [[760, 702], [760, 736]], CHAIN_C = [[800, 702], [800, 736]];

  function maskTrace(g, pts, w = 5) {
    g.lineJoin = 'round'; g.lineCap = 'round'; trace(g, pts);
    g.strokeStyle = 'rgba(3,26,17,0.55)'; g.lineWidth = w + 3; g.stroke();
    g.strokeStyle = '#13573d'; g.lineWidth = w; g.stroke();
    g.strokeStyle = 'rgba(70,170,120,0.22)'; g.lineWidth = 1.2; g.stroke();
  }
  function maskVia(g, x, y, r = 6) {
    g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.fillStyle = 'rgba(3,26,17,0.55)'; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#17644a'; g.fill();
    g.beginPath(); g.arc(x, y, r * 0.4, 0, TAU); g.fillStyle = '#052016'; g.fill();
  }
  function smd(g, x, y, w, h, kind, rot = 0) {      // decorative passive
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = 'rgba(2,20,13,0.5)'; g.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
    g.fillStyle = '#b9bcb4'; g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle = kind === 'c' ? '#a98d62' : '#17191a'; g.fillRect(-w / 2 + w * 0.22, -h / 2, w * 0.56, h);
    g.strokeStyle = 'rgba(241,246,236,0.35)'; g.lineWidth = 1.5; g.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
    g.restore();
  }
  function mountHole(g, x, y) {
    g.beginPath(); g.arc(x, y, 37, 0, TAU); g.fillStyle = 'rgba(2,20,13,0.5)'; g.fill();
    const gr = g.createRadialGradient(x - 8, y - 10, 4, x, y, 34); gr.addColorStop(0, '#f6dc93'); gr.addColorStop(1, '#a8873a');
    g.beginPath(); g.arc(x, y, 33, 0, TAU); g.fillStyle = gr; g.fill();
    g.beginPath(); g.arc(x, y, 17, 0, TAU); g.fillStyle = '#020a07'; g.fill();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * 25, y + Math.sin(a) * 25, 2.6, 0, TAU); g.fillStyle = '#3d2f10'; g.fill(); }
  }

  function buildBase() {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, W * 0.6, H); gr.addColorStop(0, '#0f5039'); gr.addColorStop(0.5, '#0c4632'); gr.addColorStop(1, '#093a29');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // low-frequency mask mottling
    const n = document.createElement('canvas'); n.width = 54; n.height = 96; const ng = n.getContext('2d');
    for (let y = 0; y < 96; y++) for (let x = 0; x < 54; x++) { const v = noise2(x * 0.16, y * 0.16, 7) * 0.6 + noise2(x * 0.5, y * 0.5, 3) * 0.4; ng.fillStyle = v > 0 ? `rgba(120,255,190,${v * 0.07})` : `rgba(0,0,0,${-v * 0.16})`; ng.fillRect(x, y, 1, 1); }
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(n, 0, 0, W, H);
    // glass-fibre weave
    const wv = document.createElement('canvas'); wv.width = 8; wv.height = 8; const wg = wv.getContext('2d');
    wg.fillStyle = 'rgba(255,255,255,0.028)'; wg.fillRect(0, 0, 8, 1); wg.fillRect(0, 0, 1, 8); wg.fillStyle = 'rgba(0,0,0,0.05)'; wg.fillRect(0, 4, 8, 1); wg.fillRect(4, 0, 1, 8);
    g.fillStyle = g.createPattern(wv, 'repeat'); g.fillRect(0, 0, W, H);

    // ---- decorative, mask-covered routing (dead zones only: top band, bottom band, right column, far left)
    for (let i = 0; i < 9; i++) {
      const y0 = 34 + i * 14, j = 300 + i * 14;
      maskTrace(g, [[-10, y0], [j, y0], [j + 96, y0 + 96], [760 - i * 10, y0 + 96], [800 - i * 10 + 0, y0 + 96 + (i % 3) * 0]], 5);
      maskVia(g, 800 - i * 10, y0 + 96, 6);
    }
    for (let i = 0; i < 6; i++) { const y0 = 52 + i * 15; maskTrace(g, [[W + 10, y0], [900 - i * 15, y0], [860 - i * 15, y0 + 40], [860 - i * 15, 150 + i * 6]], 5); maskVia(g, 860 - i * 15, 150 + i * 6, 6); }
    // card-edge fingers + fan-out
    for (let i = 0; i < 24; i++) {
      const x = 92 + i * 39, up = 1752 - (i % 4) * 13, tx = lerp(x, 540 + (i - 11.5) * 15, 0.72), ty = 1640 + (i % 5) * 9;
      maskTrace(g, [[x, 1800], [x, up], [tx, up - Math.abs(tx - x)], [tx, ty]], 5);
      maskVia(g, tx, ty, 6);
      const fg = g.createLinearGradient(0, 1800, 0, 1920); fg.addColorStop(0, '#f2d27c'); fg.addColorStop(0.5, '#d2a646'); fg.addColorStop(1, '#a37f30');
      g.fillStyle = 'rgba(2,20,13,0.5)'; rr(g, x - 13, 1796, 26, 140, 12); g.fill();
      g.fillStyle = fg; rr(g, x - 11, 1800, 22, 140, 10); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x - 8, 1812, 3, 100);
    }
    for (let i = 0; i < 5; i++) {
      const x = 986 + i * 15;
      maskTrace(g, [[x, 1130 + i * 10], [x, 1330], [x + 26, 1356], [x + 26, 1560], [x, 1586], [x, 1640 - i * 8]], 5);
      maskVia(g, x, 1130 + i * 10, 6); maskVia(g, x, 1640 - i * 8, 6);
    }
    maskTrace(g, [[14, 240], [14, 1700]], 5); maskTrace(g, [[27, 300], [27, 1330], [14 + 13, 1330]], 4);
    maskTrace(g, [[1066, 250], [1066, 1090]], 5);
    // a few quiet runs behind the content
    // (final QA: the short run at x 330-392, y 950-1010 was removed; it ran under "CONFIRM WITH A RADIOGRAPH")
    maskTrace(g, [[64, 1066], [300, 1066]], 4); maskVia(g, 300, 1066, 5);
    maskTrace(g, [[660, 1128], [720, 1128], [740, 1108]], 4);
    // decorative parts
    smd(g, 300, 196, 34, 16, 'r'); smd(g, 360, 196, 34, 16, 'c'); smd(g, 420, 196, 34, 16, 'r');
    smd(g, 180, 1668, 34, 16, 'c'); smd(g, 240, 1668, 34, 16, 'r'); smd(g, 880, 1668, 34, 16, 'c'); smd(g, 940, 1700, 16, 34, 'r');
    smd(g, 1040, 1240, 16, 34, 'c'); smd(g, 1040, 1300, 16, 34, 'r');
    // small SOIC in the top band
    g.fillStyle = '#121516'; rr(g, 560, 150, 130, 62, 5); g.fill();
    for (let i = 0; i < 7; i++) { g.fillStyle = '#b9bcb4'; g.fillRect(568 + i * 17, 140, 9, 10); g.fillRect(568 + i * 17, 212, 9, 10); }
    g.beginPath(); g.arc(574, 200, 4, 0, TAU); g.fillStyle = '#2a2f30'; g.fill();
    mountHole(g, 66, 110); mountHole(g, 1014, 110); mountHole(g, 66, 1716); mountHole(g, 1014, 1716);
    // fiducials
    for (const [fx, fy] of [[168, 150], [1040, 1820]]) { g.beginPath(); g.arc(fx, fy, 15, 0, TAU); g.fillStyle = '#0a2f21'; g.fill(); g.beginPath(); g.arc(fx, fy, 7, 0, TAU); g.fillStyle = '#d8b55c'; g.fill(); }
    txt(g, 'EAL PRINCIPLE BOARD', 196, 158, 20, 'rgba(241,246,236,0.42)', { f: FM, w: 500, ls: 2 });
    txt(g, 'RATIO METHOD · 2 FREQ', 320, 1776, 20, 'rgba(241,246,236,0.4)', { f: FM, w: 500, ls: 2 });

    // ---- silkscreen part outlines + designators (fine, decorative)
    g.strokeStyle = 'rgba(241,246,236,0.5)'; g.lineWidth = 2;
    const corner = (x, y, sx, sy) => { g.beginPath(); g.moveTo(x, y + sy * 22); g.lineTo(x, y); g.lineTo(x + sx * 22, y); g.stroke(); };
    for (const m of [LCD, SCO]) { corner(m.x - 8, m.y - 8, 1, 1); corner(m.x + m.w + 8, m.y - 8, -1, 1); corner(m.x - 8, m.y + m.h + 8, 1, -1); corner(m.x + m.w + 8, m.y + m.h + 8, -1, -1); }

    // ---- LCD module shell
    g.fillStyle = 'rgba(2,14,9,0.55)'; rr(g, LCD.x - 3, LCD.y - 1, LCD.w + 6, LCD.h + 8, 16); g.fill();
    let bg = g.createLinearGradient(0, LCD.y, 0, LCD.y + LCD.h); bg.addColorStop(0, '#1f2426'); bg.addColorStop(1, '#101314');
    g.fillStyle = bg; rr(g, LCD.x, LCD.y, LCD.w, LCD.h, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 1.5; rr(g, LCD.x + 1, LCD.y + 1, LCD.w - 2, LCD.h - 2, 13); g.stroke();
    const GL = { x: LCD.x + 18, y: LCD.y + 18, w: LCD.w - 36, h: 184 };
    g.fillStyle = '#060808'; rr(g, GL.x - 5, GL.y - 5, GL.w + 10, GL.h + 10, 9); g.fill();
    bg = g.createLinearGradient(GL.x, GL.y, GL.x + GL.w * 0.5, GL.y + GL.h); bg.addColorStop(0, '#c9d6b1'); bg.addColorStop(1, '#a7b78e');
    g.fillStyle = bg; rr(g, GL.x, GL.y, GL.w, GL.h, 5); g.fill();
    bg = g.createLinearGradient(0, GL.y, 0, GL.y + 22); bg.addColorStop(0, 'rgba(20,30,20,0.28)'); bg.addColorStop(1, 'rgba(20,30,20,0)');
    g.fillStyle = bg; rr(g, GL.x, GL.y, GL.w, 22, 5); g.fill();
    bg = g.createLinearGradient(GL.x, GL.y, GL.x + 14, GL.y); bg.addColorStop(0, 'rgba(20,30,20,0.2)'); bg.addColorStop(1, 'rgba(20,30,20,0)');
    g.fillStyle = bg; g.fillRect(GL.x, GL.y, 14, GL.h);
    K.handle(g, GL.x, LCD.y + LCD.h - 21, { font: `500 24px ${FM}`, color: '#b4bdb7', alpha: 0.95 });

    // ---- scope module shell
    g.fillStyle = 'rgba(2,14,9,0.55)'; rr(g, SCO.x - 3, SCO.y - 1, SCO.w + 6, SCO.h + 8, 16); g.fill();
    bg = g.createLinearGradient(0, SCO.y, 0, SCO.y + SCO.h); bg.addColorStop(0, '#1f2426'); bg.addColorStop(1, '#101314');
    g.fillStyle = bg; rr(g, SCO.x, SCO.y, SCO.w, SCO.h, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 1.5; rr(g, SCO.x + 1, SCO.y + 1, SCO.w - 2, SCO.h - 2, 13); g.stroke();
    const SG = { x: SCO.x + 18, y: SCO.y + 18, w: SCO.w - 36, h: 196 };
    g.fillStyle = '#020605'; rr(g, SG.x, SG.y, SG.w, SG.h, 7); g.fill();
    g.save(); rr(g, SG.x, SG.y, SG.w, SG.h, 7); g.clip();
    g.strokeStyle = 'rgba(90,230,170,0.085)'; g.lineWidth = 1;
    for (let x = SG.x + 20; x < SG.x + SG.w; x += 20) { g.beginPath(); g.moveTo(x, SG.y); g.lineTo(x, SG.y + SG.h); g.stroke(); }
    for (let y = SG.y + 20; y < SG.y + SG.h; y += 20) { g.beginPath(); g.moveTo(SG.x, y); g.lineTo(SG.x + SG.w, y); g.stroke(); }
    g.restore();
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(SCO.x + 30 + i * 22, SCO.y + SCO.h - 16, 5, 0, TAU); g.fillStyle = '#2a3032'; g.fill(); }

    // ---- ratio IC shell (QFP)
    g.fillStyle = 'rgba(2,14,9,0.5)'; rr(g, CHIP.x - 18, CHIP.y - 18, CHIP.w + 36, CHIP.h + 40, 8); g.fill();
    const pin = (x, y, w, h) => { const pg = g.createLinearGradient(x, y, x + w, y + h); pg.addColorStop(0, '#e7e9e2'); pg.addColorStop(1, '#8f948c'); g.fillStyle = pg; g.fillRect(x, y, w, h); };
    for (let i = 0; i < 12; i++) { const u = (i + 0.5) / 12; pin(CHIP.x + 16 + u * (CHIP.w - 32) - 5, CHIP.y - 14, 10, 15); pin(CHIP.x + 16 + u * (CHIP.w - 32) - 5, CHIP.y + CHIP.h - 1, 10, 15); }
    for (let i = 0; i < 10; i++) { const u = (i + 0.5) / 10; pin(CHIP.x - 14, CHIP.y + 16 + u * (CHIP.h - 32) - 5, 15, 10); pin(CHIP.x + CHIP.w - 1, CHIP.y + 16 + u * (CHIP.h - 32) - 5, 15, 10); }
    bg = g.createLinearGradient(CHIP.x, CHIP.y, CHIP.x + CHIP.w, CHIP.y + CHIP.h); bg.addColorStop(0, '#1d2123'); bg.addColorStop(1, '#0d0f10');
    g.fillStyle = bg; rr(g, CHIP.x, CHIP.y, CHIP.w, CHIP.h, 9); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.09)'; g.lineWidth = 2; rr(g, CHIP.x + 5, CHIP.y + 5, CHIP.w - 10, CHIP.h - 10, 6); g.stroke();
    base = c;

    // vignette
    const v = document.createElement('canvas'); v.width = W; v.height = H; const vg = v.getContext('2d');
    const rg = vg.createRadialGradient(W / 2, H * 0.5, 520, W / 2, H * 0.5, 1180); rg.addColorStop(0, 'rgba(0,10,6,0)'); rg.addColorStop(1, 'rgba(0,10,6,0.5)');
    vg.fillStyle = rg; vg.fillRect(0, 0, W, H); vign = v;

    // hatched copper pour ("the patient"): dim (mask-covered) and lit (gold) versions
    const mk = (lit) => {
      const pc = document.createElement('canvas'); pc.width = W; pc.height = H; const pg = pc.getContext('2d');
      pg.save(); pg.clip(socket);
      pg.fillStyle = lit ? '#2a4a2a' : '#0f4c36'; pg.fillRect(380, 1030, 560, 420);
      pg.lineWidth = 3; pg.strokeStyle = lit ? 'rgba(240,196,92,0.95)' : 'rgba(44,132,94,0.9)';
      for (let k = -520; k < 620; k += 15) { pg.beginPath(); pg.moveTo(380 + k, 1030); pg.lineTo(380 + k + 420, 1450); pg.stroke(); pg.beginPath(); pg.moveTo(380 + k + 420, 1030); pg.lineTo(380 + k, 1450); pg.stroke(); }
      pg.restore();
      pg.lineJoin = 'round'; pg.strokeStyle = 'rgba(2,20,13,0.6)'; pg.lineWidth = 8; pg.stroke(socket);
      pg.strokeStyle = lit ? '#f1c45c' : '#2f8a62'; pg.lineWidth = 4; pg.stroke(socket);
      return pc;
    };
    pourDim = mk(false); pourLit = mk(true);
  }

  // ------------------------------------------------------------------ timeline + toy model
  const D = 24;
  const HEAD = [
    { a: -1, b: 3.45, l: [[['HOW DOES AN APEX', 0]], [['LOCATOR ', 0], ['FIND THE END?', 1]]] },
    { a: 3.55, b: 7.25, l: [[['THE PATIENT', 0]], [['IS THE ', 0], ['CIRCUIT', 1]]] },
    { a: 7.4, b: 10.8, l: [[['2 AC SIGNALS,', 0]], [['1 ', 0], ['RATIO', 1]]] },
    { a: 10.95, b: 14.1, l: [[['FLUID SHIFTS BOTH:', 0]], [['RATIO BARELY MOVES', 1]]] },
    { a: 14.25, b: 17.15, l: [[['LAST ~1 mm:', 0]], [['RATIO DROPS', 1]]] },
    { a: 17.3, b: 23.35, l: [[['IT SENSES THE', 0]], [['FORAMEN REGION', 1]]] },
    { a: 23.55, b: 99, l: [[['HOW DOES AN APEX', 0]], [['LOCATOR ', 0], ['FIND THE END?', 1]]] },
  ];
  const SOURCES = [
    { a: 3.75, b: 7.2, s: 'Nekoofar et al., Int Endod J 2006' },
    { a: 7.6, b: 10.8, s: 'Kobayashi & Suda 1994 \u00b7 Oishi et al. 2002, J Endod' },
    { a: 11.15, b: 14.1, s: 'Kobayashi & Suda, J Endod 1994' },
    { a: 14.45, b: 17.15, s: 'Rambo et al., Biomed Eng Online 2010 \u00b7 in vivo, 7\u201321 canals' },
    { a: 17.5, b: 18.95, s: 'Ounsi & Naaman 1999, Int Endod J (in vitro) \u00b7 Martins 2014' },
    { a: 19.1, b: 23.3, s: 'Root ZX II instructions \u00b7 St\u00f6ber 2011, De-Deus 2023, J Endod' },
  ];
  /**
   * toy quotient vs distance from the foramen (mm, schematic). Shape follows Rambo 2010, Table 2 (8 kHz / 0.5 kHz):
   * of the fall from -3 mm to 0, about 15% happens from -3 to -1 mm, 10% from -1 to -0.5 mm and 75% in the last 0.5 mm
   * (this function: 14% / 11% / 75%). Never shown as digits.
   */
  const Q0 = 0.455;                                            // toy set point
  const qOf = (d) => { const x = Math.max(d, 0); return Q0 + 0.165 * (1 - Math.exp(-x / 0.2)) + 0.081 * (1 - Math.exp(-x / 2.5)); };
  const QN = qOf((FORAMEN - TIP_A) / PX_MM);                   // value where the reading starts (coronal plateau)
  const qn = (q) => clamp((q - Q0) / (QN - Q0));               // 0 at the set point, 1 on the plateau
  // schematic gains: NaOCl is more conductive than saline (Shin et al., Restor Dent Endod 2012)
  const FLUIDS = [P.saline, P.naocl], FLUID_GAIN = [1, 0.75];

  function state(t) {
    const io = ease.inOut, s = { t };
    const rst = 1 - seg(t, 23.35, 23.92, io);               // global return-to-start for the loop
    const txo = 1 - seg(t, 23.1, 23.4);                     // text out before the loop
    s.rst = rst; s.txo = txo;
    s.power = seg(t, 0.2, 1.5, io) * rst;
    let tip = TIP_PARK;
    tip = lerp(tip, TIP_A, seg(t, 1.7, 3.1, io));          // the file goes in under the title
    tip = lerp(tip, TIP_B, seg(t, 9.0, 10.7, io));
    tip = lerp(tip, FORAMEN, seg(t, 14.2, 16.4, io));
    s.tip = lerp(TIP_PARK, tip, rst); s.d = (FORAMEN - s.tip) / PX_MM; s.q = qOf(s.d);
    s.eLead = seg(t, 3.2, 3.8) * rst; s.eCanal = seg(t, 3.8, 4.2) * rst; s.ePour = seg(t, 4.2, 4.9, io) * rst;
    s.clip = seg(t, 4.7, 5.2, io) * rst; s.eRet = seg(t, 5.2, 5.7) * rst; s.loop = seg(t, 5.6, 6.0) * rst;
    s.rc = seg(t, 6.25, 7.0, ease.out) * (1 - seg(t, 16.7, 17.1));
    // loop: APEX and the AC stage go out first (with the text), then rst retracts the file and de-energises the board
    s.acA = seg(t, 7.4, 7.9) * txo; s.acB = seg(t, 8.0, 8.5) * txo; s.freq = seg(t, 8.3, 8.6) * txo;
    s.rat = seg(t, 8.6, 9.1) * rst;
    s.f = seg(t, 12.4, 12.9, io) * rst;                         // fluid index 0..1: one switch, after the headline has been read
    s.jump = env(t, 10.95, 14.1, 0.35, 0.3);
    s.hold = env(t, 12.25, 13.75, 0.25, 0.4);                   // "the ratio did not move" bracket on the LCD bar
    s.apex = seg(t, 16.3, 16.4) * txo;
    s.era = t < 5.6 ? -1 : t < 7.4 ? 0 : t < 8.6 ? 1 : 2;       // history strip: DC, AC, ratio
    s.ring = seg(t, 17.0, 17.5) * txo; s.tag = seg(t, 17.75, 18.1) * txo; s.stat = seg(t, 18.3, 18.65) * txo; s.xray = seg(t, 19.7, 20.05) * txo;
    s.div = 1 - seg(t, 18.0, 18.3) + seg(t, 23.45, 23.8);
    // fluid colour + gain
    s.fluid = mix(FLUIDS[0], FLUIDS[1], s.f); s.gain = lerp(FLUID_GAIN[0], FLUID_GAIN[1], s.f);
    // the two potentials (schematic, arbitrary units). Floor kept high so the slow trace stays readable at the foramen.
    const z = 0.8 + 0.2 * clamp(s.d / 4.2);
    s.aLo = z * s.gain; s.aHi = s.aLo * (s.q / QN) * 0.86;
    s.refLo = z; s.refHi = z * (s.q / QN) * 0.86; s.refA = env(t, 12.2, 14.1, 0.3, 0.3);      // 'before' marks while the fluid changes
    // LCD bar: linear in the quotient
    s.bar = clamp(2 + (1 - qn(s.q)) * 13, 0, 15) * s.rat;
    return s;
  }

  // ------------------------------------------------------------------ dynamic layers
  function fileLeadPts(s) { const ht = s.tip - FILE_L - 60; return cham([[304, 800], [488, 800], [488, 520], [540, 520], [540, ht - 6]], 16); }
  function retLeadPts(s) { const dx = (1 - s.clip) * 64; return cham([[958 + dx, 1071], [1034, 1071], [1034, 722], [980, 722], [980, 700]], 16); }

  function drawTraces(s, t) {
    const g = ctx, pw = s.power, v = 150, off = t * v;
    goldTrace(g, FRAME, 7, pw, pw);
    goldTrace(g, [[164, 800], [304, 800]], 7, pw, 1);
    const lead = fileLeadPts(s), ret = retLeadPts(s);
    goldTrace(g, lead, 7, Math.max(s.eLead, 0.001) > 0.001 ? 1 : 0, s.eLead);
    goldTrace(g, ret, 7, s.eRet > 0.001 ? 1 : 0, s.eRet);
    goldTrace(g, CHAIN_OUT, 5, s.rat, s.rat);
    // the two measured potentials feeding the divider
    for (const [pts, col, a] of [[CHAIN_P, P.pink, s.acA], [CHAIN_C, P.cyan, s.acB]]) {
      g.save(); g.lineCap = 'round'; trace(g, pts); g.strokeStyle = 'rgba(2,20,13,0.62)'; g.lineWidth = 10; g.stroke();
      g.strokeStyle = rgba(mix(P.goldDim, col, a * s.rat)); g.lineWidth = 6; g.stroke(); g.restore();
    }
    // terminals
    pad(g, 96, 800, 16, 16, pw, 8); pad(g, 164, 800, 16, 16, pw, 8); pad(g, 236, 800, 16, 16, pw, 8); pad(g, 304, 800, 16, 16, Math.max(pw * 0.6, s.eLead), 8);
    pad(g, 980, 706, 22, 12, s.eRet); pad(g, 980, 452, 22, 12, pw); pad(g, 474, 474, 12, 20, s.rat); pad(g, 760, 706, 14, 10, s.acA * s.rat); pad(g, 800, 706, 14, 10, s.acB * s.rat);
    via(g, 618, 790, 7, s.rat); via(g, 488, 800, 7, s.eLead); via(g, 1034, 722, 7, s.eRet);

    // moving current. DC stage: gold dashes; AC stage: pink + cyan dashes (two superimposed signals)
    if (s.loop > 0.01) {
      const segs = [[[164, 800], [304, 800]], lead, null, null, ret, FRAME];           // null = file / canal+body drawn elsewhere
      const lens = [140, plen(lead), s.tip - (s.tip - FILE_L - 60), 0, plen(ret), plen(FRAME)];
      lens[3] = (FORAMEN - s.tip) + plen(BODY_PATH);
      let cum = 0; s.cum = [];
      for (let i = 0; i < segs.length; i++) { s.cum.push(cum); cum += lens[i]; }
      const dc = (1 - s.acA) * s.loop, per = 96;
      for (let i = 0; i < segs.length; i++) {
        if (!segs[i]) continue;
        const o = off - s.cum[i];
        flow(g, segs[i], '#fff6d2', o, { alpha: dc, dash: 14, gap: per - 14 });
        flow(g, segs[i], P.pink, o, { alpha: s.acA * s.loop, dash: 24, gap: 168 });
        flow(g, segs[i], P.cyan, o - 46, { alpha: s.acB * s.loop, dash: 7, gap: 57 });
      }
    }
  }

  function drawLCD(s, t) {
    const g = ctx, GL = { x: LCD.x + 18, y: LCD.y + 18, w: LCD.w - 36, h: 184 };
    const ink = (a) => rgba(P.lcdInk, a);
    // boot sweep (hook): a 3-segment window runs once along the bar
    const boot = seg(t, 0.45, 1.55), bootOn = t > 0.45 && t < 1.55 ? 1 : 0;
    const n = 15, x0 = GL.x + 20, pitch = 21.2, yb = GL.y + 98;
    for (let i = 0; i < n; i++) {
      const h = lerp(26, 78, i / (n - 1));
      let on = clamp(s.bar - i);
      if (bootOn) on = Math.max(on, clamp(1.6 - Math.abs(boot * (n + 3) - 1.5 - i)) * 0.9);
      g.fillStyle = ink(lerp(0.075, 0.93, on));
      g.fillRect(x0 + i * pitch, yb - h, 15.4, h);
    }
    g.fillStyle = ink(0.5); g.fillRect(x0, yb + 6, n * pitch - 5.8, 3);
    // target mark above the last segment
    const tx = x0 + (n - 1) * pitch + 7.7, ty = yb - 86;
    g.beginPath(); g.moveTo(tx - 9, ty - 12); g.lineTo(tx + 9, ty - 12); g.lineTo(tx, ty); g.closePath(); g.fillStyle = ink(lerp(0.3, 0.95, s.apex)); g.fill();
    // annunciators: one sine per signal
    const icon = (x, cyc, on) => { g.beginPath(); for (let k = 0; k <= 40; k++) { const u = k / 40, px = x + u * 54, py = GL.y + 148 - Math.sin(u * cyc * TAU) * 13; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.lineWidth = 4.2; g.lineJoin = 'round'; g.strokeStyle = ink(lerp(0.075, 0.9, on)); g.stroke(); };
    icon(x0, 1, s.acA); icon(x0 + 72, 3, s.acB);
    // APEX
    const pulse = 0.92 + 0.08 * Math.cos((t - 16.4) * TAU * 0.8);
    txt(g, 'APEX', GL.x + GL.w - 20, GL.y + 166, 54, ink(lerp(0.038, 0.93, s.apex * pulse)), { f: FM, w: 700, align: 'right', ls: 3 });
    // fluid beat: gold bracket on the bar = "this did not move"
    if (s.hold > 0.01) {
      const bx0 = x0 - 10, bx1 = x0 + n * pitch + 4, by0 = yb - 88, by1 = yb + 18, c = 20, pu = 0.8 + 0.2 * Math.sin((t - 12.25) * TAU * 1.1);
      g.save(); g.globalAlpha = s.hold * pu; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(bx0, by0 + c); g.lineTo(bx0, by0); g.lineTo(bx0 + c, by0); g.moveTo(bx1 - c, by0); g.lineTo(bx1, by0); g.lineTo(bx1, by0 + c);
      g.moveTo(bx1, by1 - c); g.lineTo(bx1, by1); g.lineTo(bx1 - c, by1); g.moveTo(bx0 + c, by1); g.lineTo(bx0, by1); g.lineTo(bx0, by1 - c);
      g.strokeStyle = 'rgba(20,30,20,0.55)'; g.lineWidth = 9; g.stroke();
      g.strokeStyle = rgba('#ffd66e', 0.35); g.lineWidth = 13; g.stroke();
      g.strokeStyle = '#ffcf4a'; g.lineWidth = 5; g.stroke();
      g.restore();
    }
    // glass sheen
    const sh = g.createLinearGradient(GL.x, GL.y, GL.x + GL.w, GL.y + GL.h); sh.addColorStop(0.2, 'rgba(255,255,255,0)'); sh.addColorStop(0.45, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.fillStyle = sh; rr(g, GL.x, GL.y, GL.w, GL.h, 5); g.fill();
    // status LED on the bezel
    const lx = LCD.x + LCD.w - 34, ly = LCD.y + LCD.h - 21, on = Math.max(s.apex * pulse, 0);
    g.fillStyle = '#2b3032'; rr(g, lx - 13, ly - 8, 26, 16, 3); g.fill();
    if (on > 0.01) { g.beginPath(); g.arc(lx, ly, 26, 0, TAU); g.fillStyle = rgba('#ffd66e', 0.22 * on); g.fill(); }
    g.fillStyle = rgba(mix('#5b5332', '#ffe48a', on)); rr(g, lx - 8, ly - 6, 16, 12, 3); g.fill();
    // power LED
    const px = lx - 44; g.fillStyle = '#2b3032'; rr(g, px - 13, ly - 8, 26, 16, 3); g.fill();
    if (s.power > 0.01) { g.beginPath(); g.arc(px, ly, 20, 0, TAU); g.fillStyle = rgba('#7dffb0', 0.16 * s.power); g.fill(); }
    g.fillStyle = rgba(mix('#2f4a3a', '#8dffbc', s.power)); rr(g, px - 8, ly - 6, 16, 12, 3); g.fill();
  }

  function drawScope(s, t) {
    const g = ctx, SG = { x: SCO.x + 18, y: SCO.y + 18, w: SCO.w - 36, h: 196 };
    g.save(); rr(g, SG.x, SG.y, SG.w, SG.h, 7); g.clip();
    const xa = SG.x + 20, xb = SG.x + SG.w - 44, yP = SG.y + 52, yC = SG.y + 144;
    const glowLine = (col, a, w = 3.2) => { g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = rgba(col, 0.2 * a); g.lineWidth = w + 9; g.stroke(); g.strokeStyle = rgba(col, 0.95 * a); g.lineWidth = w; g.stroke(); g.strokeStyle = rgba('#ffffff', 0.7 * a); g.lineWidth = w * 0.35; g.stroke(); };
    // DC stage: one flat level
    const dc = (1 - s.acA) * s.power;
    if (dc > 0.01) {
      const lvl = s.loop * 34, y = SG.y + SG.h / 2 + 22 - lvl;
      g.beginPath(); g.moveTo(SG.x + 16, y); g.lineTo(SG.x + SG.w - 16, y); glowLine('#ffe08a', dc * lerp(0.35, 1, s.loop));
    }
    // AC stage: the two potentials
    const wave = (yc, amp, lam, sp, col, a, ref) => {
      if (a <= 0.01) return;
      g.strokeStyle = rgba(col, 0.22 * a); g.lineWidth = 1.5; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(xa, yc); g.lineTo(xb, yc); g.stroke(); g.setLineDash([]);
      g.beginPath();
      for (let x = xa; x <= xb; x += 1) { const y = yc - amp * Math.sin((x - xa) / lam * TAU - t * sp * TAU); x === xa ? g.moveTo(x, y) : g.lineTo(x, y); }
      glowLine(col, a);
      // amplitude bar at the right
      const bx = SG.x + SG.w - 26;
      g.fillStyle = rgba(col, 0.18 * a); g.fillRect(bx, yc - 42, 12, 84);
      g.fillStyle = rgba(col, 0.95 * a); g.fillRect(bx, yc - amp, 12, amp * 2);
      if (s.refA > 0.01) { g.fillStyle = rgba('#ffffff', 0.9 * a * s.refA); g.fillRect(bx - 5, yc - ref - 1.5, 22, 3); g.fillRect(bx - 5, yc + ref - 1.5, 22, 3); }
    };
    wave(yP, 40 * s.aLo, 230, 0.9, P.pink, s.acA, 40 * s.refLo);
    wave(yC, 40 * s.aHi, 23, 1.7, P.cyan, s.acB, 40 * s.refHi);
    g.restore();
  }

  function drawChip(s, t) {
    const g = ctx, cx = CHIP.x + CHIP.w / 2, cy = CHIP.y + CHIP.h / 2;
    const a1 = s.div, on = s.rat;
    g.beginPath(); g.arc(CHIP.x + 24, CHIP.y + 24, 7, 0, TAU); g.fillStyle = rgba('#060707', clamp(a1)); g.fill();   // pin-1 dot (clears for the marking)
    if (a1 > 0.01) {                                            // divider face: (8 kHz dot) over (0.4 kHz dot)
      g.save(); g.globalAlpha = a1;
      const ink = rgba(mix('#3a4042', P.chipInk, on));
      g.fillStyle = ink; rr(g, cx - 74, cy - 7, 148, 14, 7); g.fill();
      const rc = lerp(19, lerp(10.5, 19, qn(s.q)), on);         // the numerator (8 kHz) dot shrinks with the quotient
      for (const [dy, col, r] of [[-52, P.cyan, rc], [52, P.pink, 19]]) {
        if (on > 0.01) { g.beginPath(); g.arc(cx, cy + dy, r + 13, 0, TAU); g.fillStyle = rgba(col, 0.14 * on); g.fill(); }
        if (r < 18.5) { g.beginPath(); g.arc(cx, cy + dy, 19, 0, TAU); g.strokeStyle = rgba(col, 0.4 * on); g.lineWidth = 1.6; g.setLineDash([3, 5]); g.stroke(); g.setLineDash([]); }
        g.beginPath(); g.arc(cx, cy + dy, r, 0, TAU); g.fillStyle = rgba(mix('#3a4042', col, on)); g.fill();
      }
      txt(g, 'U1', CHIP.x + CHIP.w - 22, CHIP.y + CHIP.h - 18, 22, 'rgba(213,219,214,0.4)', { f: FM, w: 500, align: 'right' });
      g.restore();
    }
    if (s.stat > 0.01) {                                        // laser-marked accuracy line
      g.save(); g.globalAlpha = s.stat;
      const x = CHIP.x + 22;
      txt(g, 'ROOT ZX, IN VIVO', x, CHIP.y + 52, 30, P.chipInk);
      txt(g, '~70–100%', x - 2, CHIP.y + 124, 62, '#ffd76a');
      txt(g, 'WITHIN ±0.5 mm', x, CHIP.y + 172, 33, P.chipInk);
      g.fillStyle = 'rgba(213,219,214,0.35)'; g.fillRect(x, CHIP.y + 192, CHIP.w - 44, 2);
      txt(g, 'RANGE OF 16 STUDIES', x, CHIP.y + 229, 24, 'rgba(213,219,214,0.82)');      // fine print: the denominator
      g.restore();
    }
  }

  function drawSources(s, t) {
    const g = ctx;
    const sym = (c, col, pop, ac, dcA) => {
      if (pop <= 0.01) return;
      const k = ease.outBack(pop);
      g.save(); g.translate(c.x, c.y); g.scale(k, k); g.globalAlpha = clamp(pop * 2);
      g.beginPath(); g.arc(0, 0, SRC_R + 3, 0, TAU); g.fillStyle = '#062619'; g.fill();
      if (ac > 0.01) { g.beginPath(); g.arc(0, 0, SRC_R + 12, 0, TAU); g.fillStyle = rgba(col, 0.13 * ac); g.fill(); }
      g.beginPath(); g.arc(0, 0, SRC_R, 0, TAU); g.lineWidth = 4.5; g.strokeStyle = P.silk; g.stroke();
      if (dcA > 0.01) {                                        // DC source: + / − marks
        g.globalAlpha = clamp(pop * 2) * dcA; g.strokeStyle = P.silk; g.lineWidth = 4.5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(7, 0); g.lineTo(23, 0); g.moveTo(15, -8); g.lineTo(15, 8); g.moveTo(-23, 0); g.lineTo(-7, 0); g.stroke();
      }
      if (ac > 0.01) {
        g.globalAlpha = clamp(pop * 2) * ac; g.beginPath();
        const cyc = col === P.pink ? 1 : 3;
        for (let i = 0; i <= 48; i++) { const u = i / 48, x = -20 + u * 40, y = -Math.sin(u * cyc * TAU) * 12; i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.lineWidth = 4.5; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = col; g.stroke();
      }
      g.restore();
    };
    sym(SRC_A, P.pink, 1, s.acA, 1 - s.acA);
    sym(SRC_B, P.cyan, s.acB, s.acB, 0);
    if (s.freq > 0.01) {
      g.save(); g.globalAlpha = s.freq;
      let x = 64; const y = 886, put = (str, col) => { txt(g, str, x, y, 30, col); x += tw(g, str, 30); };
      put('ROOT ZX: ', P.silk); put('0.4', P.pink); put(' + ', P.silk); put('8', P.cyan); put(' kHz', P.silk);
      g.restore();
    }
  }

  function drawBody(s, t) {
    const g = ctx;
    g.drawImage(pourDim, 380, 1030, 560, 420, 380, 1030, 560, 420);
    if (s.ePour > 0.005) {
      g.save(); g.beginPath(); g.arc(CX, 1380, 20 + s.ePour * 500, 0, TAU); g.clip();
      g.drawImage(pourLit, 380, 1030, 560, 420, 380, 1030, 560, 420);
      g.restore();
    }
    if (s.loop > 0.01) {
      const o = t * 150 - (s.cum ? s.cum[3] + (FORAMEN - s.tip) : 0);
      const dc = (1 - s.acA) * s.loop;
      flow(g, BODY_PATH, '#fff6d2', o, { alpha: dc, dash: 14, gap: 82 });
      flow(g, BODY_PATH, P.pink, o, { alpha: s.acA * s.loop, dash: 24, gap: 168 });
      flow(g, BODY_PATH, P.cyan, o - 46, { alpha: s.acB * s.loop, dash: 7, gap: 57 });
    }
  }

  function drawTooth(s, t) {
    const g = ctx;
    // insulating hard tissue = bare board keep-out with a silkscreen outline
    g.save();
    g.fillStyle = '#072b1d'; g.fill(toothOuter);
    g.save(); g.clip(toothOuter);
    g.strokeStyle = 'rgba(241,246,236,0.05)'; g.lineWidth = 1.5;
    for (let k = -600; k < 400; k += 11) { g.beginPath(); g.moveTo(400 + k, 870); g.lineTo(400 + k + 320, 1400); g.stroke(); }
    const ig = g.createLinearGradient(400, 0, 680, 0); ig.addColorStop(0, 'rgba(0,0,0,0.25)'); ig.addColorStop(0.5, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,0.25)');
    g.fillStyle = ig; g.fillRect(400, 870, 280, 520);
    g.restore();
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = 'rgba(2,20,13,0.7)'; g.lineWidth = 9; g.stroke(toothOuter);
    g.strokeStyle = P.silk; g.lineWidth = 4.5; g.stroke(toothOuter);
    g.strokeStyle = 'rgba(241,246,236,0.42)'; g.lineWidth = 2.2; g.setLineDash([3, 7]);
    g.stroke(dejL); g.save(); g.translate(1080, 0); g.scale(-1, 1); g.stroke(dejL); g.restore(); g.setLineDash([]);
    // hook: a glint runs down both sides of the outline and meets at the apex ("find the end?")
    const gu = seg(t, 1.55, 2.9, ease.inOut), ga = Math.min(seg(t, 1.55, 1.8), 1 - seg(t, 3.0, 3.5));
    if (ga > 0.01) {
      const pos = lerp(GLINT.top, GLINT.apex, gu), dl = 90;
      for (const mir of [0, 1]) {
        g.save(); if (mir) { g.translate(1080, 0); g.scale(-1, 1); }
        g.setLineDash([Math.max(1, pos - GLINT.top), GLINT.L * 2]); g.lineDashOffset = -GLINT.top;
        g.strokeStyle = rgba('#ffd76a', 0.5 * ga); g.lineWidth = 4.5; g.stroke(toothOuter);                 // trail
        if (gu < 1) {
          g.setLineDash([dl, GLINT.L * 2]); g.lineDashOffset = -(pos - dl);
          g.strokeStyle = rgba('#ffd66e', 0.28 * ga); g.lineWidth = 18; g.stroke(toothOuter);
          g.strokeStyle = rgba('#fff3c4', ga); g.lineWidth = 6; g.stroke(toothOuter);
        }
        g.restore();
      }
      g.setLineDash([]);
    }
    // pulp space with canal fluid (conductor)
    g.fillStyle = '#03110c'; g.fill(pulp);
    const lit = Math.max(s.eCanal, 0.0);
    g.save(); g.clip(pulp);
    g.fillStyle = rgba(s.fluid, lerp(0.68, 0.84, s.f)); g.fillRect(480, 926, 120, 474);   // whole canal is wet
    if (lit > 0.01) {                                                             // the stretch that carries the current: file tip -> foramen
      const y0 = lerp(s.tip, s.tip, 1), y1 = lerp(s.tip, 1394, lit);
      const fg = g.createLinearGradient(0, y0 - 10, 0, y0 + 14); fg.addColorStop(0, rgba(s.fluid, 0)); fg.addColorStop(1, rgba(s.fluid, 0.92));
      g.fillStyle = fg; g.fillRect(480, y0 - 10, 120, Math.max(0, y1 - y0 + 10));
      g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(CX - 2, y0, 4, Math.max(0, y1 - y0));
    }
    g.restore();
    g.strokeStyle = 'rgba(2,20,13,0.7)'; g.lineWidth = 6; g.stroke(pulpWallL); g.stroke(pulpWallR);
    g.strokeStyle = 'rgba(241,246,236,0.8)'; g.lineWidth = 2.6; g.stroke(pulpWallL); g.stroke(pulpWallR);
    g.restore();
    // current in the canal fluid
    if (s.loop > 0.01 && FORAMEN - s.tip > 6) {
      const pts = [[CX, s.tip], [CX, FORAMEN + 8]], o = t * 150 - (s.cum ? s.cum[3] : 0), dc = (1 - s.acA) * s.loop;
      flow(g, pts, '#fff6d2', o, { alpha: dc, dash: 14, gap: 82, w: 4 });
      flow(g, pts, P.pink, o, { alpha: s.acA * s.loop, dash: 24, gap: 168, w: 4 });
      flow(g, pts, P.cyan, o - 46, { alpha: s.acB * s.loop, dash: 7, gap: 57, w: 4 });
    }
    // schematic symbols: R along the canal column, C across the root wall
    if (s.rc > 0.01) {
      g.save(); g.globalAlpha = s.rc; g.lineJoin = 'round'; g.lineCap = 'round';
      const top = s.tip + 12, bot = 1360, step = 9;
      if (bot - top > step) {
        const yStart = lerp(bot, top, s.rc);
        g.beginPath(); g.moveTo(CX, bot + 8); g.lineTo(CX, bot);
        let k = 0; for (let y = bot - step / 2; y > yStart; y -= step, k++) g.lineTo(CX + (k % 2 ? -11 : 11), y);
        g.lineTo(CX, Math.max(yStart - 4, top - 6));
        g.strokeStyle = 'rgba(2,14,9,0.85)'; g.lineWidth = 8; g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = 3.6; g.stroke();
      }
      const cy = 1216, xw0 = 551, xw1 = 601, xp0 = 569, xp1 = 583;
      const cap = () => { g.beginPath(); g.moveTo(xw0, cy); g.lineTo(xp0, cy); g.moveTo(xp0, cy - 22); g.lineTo(xp0, cy + 22); g.moveTo(xp1, cy - 22); g.lineTo(xp1, cy + 22); g.moveTo(xp1, cy); g.lineTo(xw1 + 4, cy); };
      cap(); g.strokeStyle = 'rgba(2,14,9,0.85)'; g.lineWidth = 9; g.stroke();
      cap(); g.strokeStyle = '#ffffff'; g.lineWidth = 4.2; g.stroke();
      g.restore();
    }
    // foramen via
    via(g, CX, 1381, 10, Math.max(s.eCanal, s.apex));
    for (const [t0, k] of [[2.85, 0.8], [16.3, 1]]) {             // soft pings: the glints meet (hook); the set point is reached
      const fl = seg(t, t0, t0 + 0.9);
      if (fl > 0 && fl < 1) { g.save(); g.beginPath(); g.arc(CX, 1378, lerp(12, 96 * k, ease.out(fl)), 0, TAU); g.strokeStyle = rgba('#ffe48a', (1 - fl) * 0.85); g.lineWidth = lerp(7, 2, fl); g.stroke(); g.restore(); }
    }
    if (s.ring > 0.01) {                                        // "foramen region"
      const pul = 0.75 + 0.25 * Math.sin(t * TAU * 0.6);
      g.save(); g.globalAlpha = s.ring;
      const rg = g.createRadialGradient(CX, 1372, 6, CX, 1372, 84); rg.addColorStop(0, rgba('#ffd66e', 0.34 * pul)); rg.addColorStop(1, rgba('#ffd66e', 0));
      g.fillStyle = rg; g.beginPath(); g.arc(CX, 1372, 84, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(CX, 1368, 64, 50, 0, 0, TAU); g.setLineDash([12, 9]); g.lineDashOffset = -t * 16; g.lineCap = 'butt';
      g.strokeStyle = 'rgba(2,14,9,0.8)'; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#fff9df'; g.lineWidth = 3.6; g.stroke();
      g.restore();
    }
  }

  function drawFile(s, t) {
    const g = ctx, tip = s.tip, hb = tip - FILE_L, ht = hb - 60, e = s.eLead;
    g.save();
    if (e > 0.01) { g.strokeStyle = rgba('#ffd66e', 0.2 * e); g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX, hb); g.lineTo(CX, tip); g.stroke(); }
    // shaft (tapered)
    g.beginPath(); g.moveTo(CX - 4.2, hb); g.lineTo(CX + 4.2, hb); g.lineTo(CX + 1.6, tip - 6); g.lineTo(CX, tip); g.lineTo(CX - 1.6, tip - 6); g.closePath();
    g.fillStyle = 'rgba(2,14,9,0.75)'; g.strokeStyle = 'rgba(2,14,9,0.75)'; g.lineWidth = 4; g.stroke();
    const sg = g.createLinearGradient(CX - 4, 0, CX + 4, 0); sg.addColorStop(0, '#9aa4a8'); sg.addColorStop(0.45, '#ffffff'); sg.addColorStop(1, '#aeb7ba');
    g.fillStyle = sg; g.fill();
    g.strokeStyle = 'rgba(40,50,55,0.55)'; g.lineWidth = 1.4;
    for (let y = tip - 14; y > tip - 250; y -= 9) { const w = lerp(1.8, 4, clamp((tip - y) / 400)); g.beginPath(); g.moveTo(CX - w, y + 2.5); g.lineTo(CX + w, y - 2.5); g.stroke(); }
    // silicone stop
    g.fillStyle = 'rgba(2,14,9,0.6)'; rr(g, CX - 19, hb + 21, 38, 15, 6); g.fill();
    g.fillStyle = '#4aa8ff'; rr(g, CX - 17, hb + 23, 34, 11, 5); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(CX - 12, hb + 25, 24, 2.5);
    // handle (ISO white)
    g.fillStyle = 'rgba(2,14,9,0.6)'; rr(g, CX - 28, ht - 2, 56, 64, 11); g.fill();
    const hg = g.createLinearGradient(CX - 26, 0, CX + 26, 0); hg.addColorStop(0, '#c9d0c8'); hg.addColorStop(0.4, '#ffffff'); hg.addColorStop(1, '#bcc4bb');
    g.fillStyle = hg; rr(g, CX - 26, ht, 52, 60, 9); g.fill();
    g.fillStyle = 'rgba(60,72,66,0.35)'; for (let i = 0; i < 4; i++) g.fillRect(CX - 20, ht + 13 + i * 10, 40, 3);
    pad(g, CX, ht - 5, 22, 12, e);
    g.restore();
  }

  function drawClip(s, t) {
    const g = ctx, dx = (1 - s.clip) * 64, op = (1 - s.clip) * 9, b = s.eRet;
    g.save(); g.translate(dx, 0); g.lineJoin = 'round'; g.lineCap = 'round';
    const jaw = () => { g.beginPath(); g.moveTo(882, 1037 - op); g.lineTo(944, 1037 - op); g.quadraticCurveTo(958, 1037 - op, 958, 1052); g.lineTo(958, 1090); g.quadraticCurveTo(958, 1105 + op, 944, 1105 + op); g.lineTo(882, 1105 + op); };
    jaw(); g.strokeStyle = 'rgba(2,14,9,0.7)'; g.lineWidth = 18; g.stroke();
    if (b > 0.01) { jaw(); g.strokeStyle = rgba('#ffd66e', 0.16 * b); g.lineWidth = 30; g.stroke(); }
    jaw(); g.strokeStyle = rgba(mix('#b7b9aa', '#f3cc68', b)); g.lineWidth = 12; g.stroke();
    jaw(); g.strokeStyle = rgba(mix('#f0f2ea', '#fff6d0', b), 0.9); g.lineWidth = 3.2; g.stroke();
    g.restore();
    pad(g, 962 + dx, 1071, 14, 22, b);
  }

  function drawChart(s, t) {
    const a = s.rat * s.txo;
    const g = ctx, X0 = 100, X1 = 322, Y0 = TIP_A, Y1 = FORAMEN;
    const xq = (q) => 150 + qn(q) * 142;                       // conventional axis: the ratio increases to the right, so a drop moves left
    g.save(); g.globalAlpha = lerp(0.3, 1, a);               // the axes are pre-printed silkscreen; they brighten when used
    g.strokeStyle = 'rgba(241,246,236,0.75)'; g.lineWidth = 2.5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(X0, Y1 + 6); g.lineTo(X0, 1166); g.lineTo(X1, 1166); g.stroke();
    g.beginPath(); g.moveTo(X1 - 10, 1160); g.lineTo(X1, 1166); g.lineTo(X1 - 10, 1172); g.stroke();
    if (a > 0.01) { g.globalAlpha = a; txt(g, 'RATIO', X0 - 2, 1144, 34, P.silk); g.globalAlpha = lerp(0.3, 1, a); }   // the word appears with the first reading
    // target line (the device's set point)
    const xt = xq(Q0);
    g.setLineDash([6, 7]); g.strokeStyle = rgba('#ffd76a', 0.75); g.lineWidth = 2.5; g.beginPath(); g.moveTo(xt, 1174); g.lineTo(xt, Y1 + 6); g.stroke(); g.setLineDash([]);
    if (a <= 0.01) { g.restore(); return; }
    g.globalAlpha = a;
    // curve up to the current file position
    g.beginPath();
    for (let y = Y0; y <= Math.max(Y0, s.tip); y += 1) { const x = xq(qOf((FORAMEN - y) / PX_MM)); y === Y0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.strokeStyle = 'rgba(2,14,9,0.7)'; g.lineWidth = 9; g.stroke();
    g.strokeStyle = rgba('#ffd66e', 0.25); g.lineWidth = 13; g.stroke();
    g.strokeStyle = '#ffd76a'; g.lineWidth = 4.5; g.stroke();
    // cursor from the file tip + live dot (tiny wobble when the fluid changes: "only negligibly influenced")
    const wob = env(t, 12.35, 13.6, 0.25, 0.7) * 6 * Math.sin((t - 12.35) * 8.5);
    const ty = Math.max(Y0, s.tip), dx = xq(s.q) + wob;
    g.setLineDash([3, 8]); g.strokeStyle = 'rgba(241,246,236,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(dx + 14, ty); g.lineTo(CX - 18, ty); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(dx, ty, 15, 0, TAU); g.fillStyle = rgba('#ffd66e', 0.25); g.fill();
    g.beginPath(); g.arc(dx, ty, 8.5, 0, TAU); g.fillStyle = '#fff6d6'; g.fill(); g.strokeStyle = '#b98a22'; g.lineWidth = 2; g.stroke();
    g.restore();
  }

  function drawJumper(s, t) {
    const g = ctx;
    if (s.jump > 0.01) {
      g.save(); g.globalAlpha = s.jump;
      const names = ['SALINE', 'NaOCl'], y0 = 960, pitch = 46;
      g.strokeStyle = 'rgba(241,246,236,0.6)'; g.lineWidth = 2; rr(g, 66, y0 - 24, 76, pitch + 48, 6); g.stroke();
      for (let i = 0; i < 2; i++) {
        const y = y0 + i * pitch, sel = clamp(1 - Math.abs(s.f - i));
        pad(g, 88, y, 14, 14, 0.4, 7); pad(g, 120, y, 14, 14, 0.4, 7);
        g.beginPath(); g.arc(88, y, 3, 0, TAU); g.arc(120, y, 3, 0, TAU); g.fillStyle = '#3d2f10'; g.fill();
        txt(g, names[i], 160, y + 12, 34, rgba(mix('#8fa397', FLUIDS[i], sel)));
      }
      const yj = y0 + s.f * pitch;                               // the jumper cap slides between rows
      g.fillStyle = 'rgba(2,14,9,0.6)'; rr(g, 72, yj - 15, 64, 30, 6); g.fill();
      const jg = g.createLinearGradient(0, yj - 13, 0, yj + 13); jg.addColorStop(0, '#5c6468'); jg.addColorStop(1, '#262b2d');
      g.fillStyle = jg; rr(g, 74, yj - 13, 60, 26, 5); g.fill();
      g.fillStyle = rgba(s.fluid, 0.95); rr(g, 96, yj - 5, 16, 10, 3); g.fill();
      g.restore();
    }
    if (s.xray > 0.01) {
      g.save(); g.globalAlpha = s.xray; g.translate(0, (1 - ease.out(s.xray)) * 10);
      // silkscreen caution triangle
      g.lineJoin = 'round'; g.strokeStyle = '#ffd76a'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(96, 938); g.lineTo(128, 996); g.lineTo(64 + 2, 996); g.closePath(); g.stroke();
      g.fillStyle = '#ffd76a'; g.fillRect(93.5, 958, 5, 20); g.beginPath(); g.arc(96, 986, 3.2, 0, TAU); g.fill();
      txt(g, 'CONFIRM WITH', 146, 964, 36, P.silk); txt(g, 'A RADIOGRAPH', 146, 1006, 36, P.silk);
      g.restore();
    }
  }

  function drawLabels(s, t) {
    const g = ctx, lab = (str, x, y, a, tx, ty, o = {}) => {
      if (a <= 0.01) return;
      g.save(); g.globalAlpha = a;
      if (tx != null) leader(g, x - 10, y - 11, tx, ty, 1);
      txt(g, str, x, y + (1 - ease.out(a)) * 8, o.size || 32, o.color || P.silk);
      g.restore();
    };
    const den = env(t, 4.3, 6.4, 0.3, 0.25);
    if (den > 0.01) { g.save(); g.globalAlpha = den; leader(g, 720, 1222, 590, 1236, 1); txt(g, 'DENTIN =', 730, 1220, 32, P.silk); txt(g, 'INSULATOR', 730, 1258, 32, P.silk); g.restore(); }
    const rcl = seg(t, 6.5, 6.9) * (1 - seg(t, 16.7, 17.05));
    lab('CAPACITOR', 730, 1227, rcl, 608, 1216);
    lab('RESISTOR', 730, 1312, rcl * clamp((1360 - (s.tip + 12)) / 40), 556, Math.min(1345, Math.max(s.tip + 40, 1300)));   // goes with its symbol
    lab('FORAMEN', 730, 1392, seg(t, 4.7, 5.0) * s.txo, 554, 1381);
    const lc = seg(t, 5.1, 5.4) * s.txo;
    lab('LIP CLIP', 764, 1152, lc, null);
    if (lc > 0.01) leader(g, 900, 1126, 918, 1112, lc);
    // "not millimeters" under the LCD
    if (s.tag > 0.01) {
      g.save(); g.globalAlpha = s.tag; g.translate(0, (1 - ease.out(s.tag)) * -8);
      g.strokeStyle = '#ffd76a'; g.lineWidth = 3.5; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(78, 744); g.lineTo(78, 714); g.moveTo(69, 724); g.lineTo(78, 714); g.lineTo(87, 724); g.stroke();
      txt(g, 'NOT MILLIMETERS', 100, 742, 36, '#ffd76a');
      g.restore();
    }
    // persistent honesty tag
    txt(g, 'SCHEMATIC · NOT TO SCALE', 950, 1446, 23, 'rgba(241,246,236,0.72)', { f: FM, w: 500, align: 'right', ls: 1 });
  }

  // ---- history strip (board-edge silkscreen) -----------------------------------------------------------------
  const HIST = [{ s: '1918 CUSTER', k: 'dc' }, { s: '1962 SUNADA', k: 'dc' }, { s: 'AC IMPEDANCE', k: 'ac' }, { s: '1994 RATIO', k: 'ratio' }];
  const HIST_ERA = [0, 0, 1, 2];
  let histSize = 32;
  function layoutHist() {
    const avail = 956 - 64;
    for (histSize = 32; histSize >= 30; histSize -= 0.5) { const sum = HIST.reduce((a, h) => a + tw(ctx, h.s, histSize), 0); if (sum + 3 * 24 <= avail) break; }
    const sum = HIST.reduce((a, h) => a + tw(ctx, h.s, histSize), 0), gap = (avail - sum) / 3;
    let x = 64; for (const h of HIST) { h.x = x; h.w = tw(ctx, h.s, histSize); x += h.w + gap; }
  }
  function drawHistory(s, t) {
    const g = ctx, yI = 1484, yT = 1528;
    // future eras are faint pre-printed silkscreen, past eras plain white, the active era gold with an underline
    const k = [seg(t, 5.6, 6.0), seg(t, 7.4, 7.8), seg(t, 8.6, 9.0)].map((v) => v * s.rst);
    const act = [k[0] * (1 - k[1]), k[1] * (1 - k[2]), k[2]];
    const lit = HIST_ERA.map((e) => k[e]), cur = HIST_ERA.map((e) => act[e]);
    g.save();
    g.strokeStyle = 'rgba(241,246,236,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, yI); g.lineTo(956, yI); g.stroke();
    HIST.forEach((h, i) => {
      const a = lerp(0.35, lerp(0.8, 1, cur[i]), lit[i]), cx = h.x + 26, ink = rgba(mix(P.silk, '#ffd76a', cur[i]));
      g.globalAlpha = 1; g.fillStyle = '#0b4430'; g.fillRect(h.x - 6, yI - 17, 64, 34);
      g.globalAlpha = a; g.strokeStyle = ink; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
      if (h.k === 'dc') {                                      // cell symbol
        g.beginPath(); g.moveTo(h.x, yI); g.lineTo(cx - 5, yI); g.moveTo(cx - 5, yI - 13); g.lineTo(cx - 5, yI + 13); g.moveTo(cx + 5, yI); g.lineTo(h.x + 52, yI); g.stroke();
        g.lineWidth = 5; g.beginPath(); g.moveTo(cx + 5, yI - 7); g.lineTo(cx + 5, yI + 7); g.stroke();
      } else {
        const wave = (x0, cyc, col) => { g.beginPath(); for (let k = 0; k <= 30; k++) { const u = k / 30, x = x0 + u * 40, y = yI - Math.sin(u * cyc * TAU) * 10; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.strokeStyle = col; g.stroke(); };
        if (h.k === 'ac') wave(h.x + 4, 1, ink);
        else { g.globalAlpha = a; wave(h.x + 4, 1, rgba(mix(P.silk, P.pink, lit[i]))); g.lineWidth = 2.4; wave(h.x + 4, 3, rgba(mix(P.silk, P.cyan, lit[i]))); }
      }
      g.globalAlpha = a;
      txt(g, h.s, h.x, yT, histSize, ink);
      if (cur[i] > 0.01) { g.globalAlpha = cur[i]; g.fillStyle = '#ffd76a'; rr(g, h.x, yT + 9, h.w * ease.out(cur[i]), 4, 2); g.fill(); }
    });
    g.restore();
  }
  function drawSourceLine(s, t) {
    for (const o of SOURCES) { const a = env(t, o.a, o.b, 0.3, 0.25); if (a > 0.01) txt(ctx, o.s, 64, 1568, 24, rgba(P.silk, 0.78 * a), { f: FM, w: 500 }); }
  }

  function drawHeadline(s, t) {
    const g = ctx, size = 76, x0 = 64, ys = [326, 408];
    // scene test points (top right): one pad per beat
    const starts = [0, 3.55, 7.4, 10.95, 14.25, 17.3];
    for (let i = 0; i < 6; i++) {
      const on = i === 0 ? 1 : seg(t, starts[i], starts[i] + 0.3) * (1 - seg(t, 23.4, 23.7));
      pad(g, 1008 - (5 - i) * 31, 264, 15, 15, on, 4);
    }
    for (const h of HEAD) {
      const a = Math.min(h.a < 0 ? 1 : seg(t, h.a, h.a + 0.32), 1 - seg(t, h.b - 0.24, h.b)); if (a <= 0.01) continue;
      const wipe = h.a < 0 ? 1 : seg(t, h.a, h.a + 0.42, ease.out);
      g.save(); g.beginPath(); g.rect(0, 230, x0 + 960 * wipe + 12, 200); g.clip(); g.globalAlpha = a;
      h.l.forEach((line, li) => { let x = x0; for (const [str, hi] of line) { txt(g, str, x, ys[li], size, hi ? '#ffd76a' : P.silk, { ls: 0.5 }); x += tw(g, str, size, { ls: 0.5 }); } });
      g.restore();
    }
  }

  // ------------------------------------------------------------------ frame
  function render(t) {
    const s = state(t), g = ctx;
    g.globalAlpha = 1; g.setLineDash([]);
    g.drawImage(base, 0, 0);
    drawTraces(s, t);
    drawLCD(s, t); drawScope(s, t); drawChip(s, t); drawSources(s, t);
    drawBody(s, t); drawTooth(s, t); drawClip(s, t); drawFile(s, t);
    drawChart(s, t); drawJumper(s, t); drawLabels(s, t);
    drawHistory(s, t); drawSourceLine(s, t);
    drawHeadline(s, t);
    g.drawImage(vign, 0, 0);
  }

  window.REEL = {
    title: 'How an apex locator works',
    duration: D,
    poster: 21.6,
    canvas,
    fonts: ['400 76px "Share Tech Mono"', '500 24px "IBM Plex Mono"', '500 30px "IBM Plex Mono"', '600 24px "IBM Plex Mono"', '700 54px "IBM Plex Mono"'],
    setup() {
      buildBase(); layoutHist();
      const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path'); sp.setAttribute('d', TOOTH_D);
      const L = sp.getTotalLength(); let top = 0, apex = 0, yMax = -1, dTop = 1e9;
      for (let i = 0; i <= 2000; i++) { const l = L * i / 2000, p = sp.getPointAtLength(l); if (p.y > yMax) { yMax = p.y; apex = l; } const d = Math.hypot(p.x - 540, p.y - 898); if (d < dTop) { dTop = d; top = l; } }
      GLINT.L = L; GLINT.top = top; GLINT.apex = apex;
    },
    render,
  };
  Kit.boot(window.REEL);
})();
