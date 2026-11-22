/*
 * 36 · EdgeFile X7 shaping route — TRANSIT MAP
 * One full-frame canvas; render(t) is a pure function of t (no clocks, no randomness outside Kit.rng).
 * Layers: bg (cached: paper, header, key, ghost network, line-info card)  ->  live layer (offscreen, cross-fades back
 * to the ghost map before the loop)  ->  train marker + intro ornaments.
 */
(function () {
  'use strict';
  const { canvas, ctx } = Kit.createCanvas();
  const { W, H, clamp, lerp, seg, ease } = Kit;

  const DUR = 23.6;
  const C = {
    paper: '#F6F3EC', ink: '#17202F', sub: '#465064', fine: '#667085',
    ghost: '#DDD8CD', ghostRing: '#C6C0B3', white: '#FFFFFF',
    L1: '#1F6FD6', L2: '#E2433B', L3: '#7C48C2', L4: '#12976A',
    ev: '#FFC933', headTxt: '#C5CEDC', headDim: '#8C97AA',
  };
  const BC = (w, s) => `${w} ${s}px "Barlow Condensed"`;
  const BA = (w, s) => `${w} ${s}px "Barlow"`;
  const LW = 20;                                   // line width of the routes

  // ---------------------------------------------------------------- geometry
  const nrm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  /** polyline with circular fillets at the interior vertices -> dense point list + cumulative length */
  function mk(verts, r = 36) {
    const pts = [];
    const push = (x, y) => { const l = pts[pts.length - 1]; if (!l || Math.hypot(l[0] - x, l[1] - y) > 0.01) pts.push([x, y]); };
    push(verts[0][0], verts[0][1]);
    for (let i = 1; i < verts.length - 1; i++) {
      const [px, py] = verts[i - 1], [vx, vy] = verts[i], [nx, ny] = verts[i + 1];
      const d1 = nrm(vx - px, vy - py), d2 = nrm(nx - vx, ny - vy);
      const l1 = Math.hypot(vx - px, vy - py), l2 = Math.hypot(nx - vx, ny - vy);
      const th = Math.acos(clamp(d1[0] * d2[0] + d1[1] * d2[1], -1, 1));
      if (th < 1e-3) { push(vx, vy); continue; }
      const tl = Math.min(r * Math.tan(th / 2), l1 * 0.5, l2 * 0.5), rad = tl / Math.tan(th / 2);
      const a = [vx - d1[0] * tl, vy - d1[1] * tl];
      const sg = Math.sign(d1[0] * d2[1] - d1[1] * d2[0]);
      const cx = a[0] - d1[1] * rad * sg, cy = a[1] + d1[0] * rad * sg;
      const a0 = Math.atan2(a[1] - cy, a[0] - cx), n = Math.max(4, Math.ceil((th * rad) / 2.5));
      for (let k = 0; k <= n; k++) { const an = a0 + (sg * th * k) / n; push(cx + Math.cos(an) * rad, cy + Math.sin(an) * rad); }
    }
    push(verts[verts.length - 1][0], verts[verts.length - 1][1]);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, total: cum[cum.length - 1] };
  }
  function at(p, s) {
    s = clamp(s, 0, p.total);
    let i = 1; while (i < p.cum.length - 1 && p.cum[i] < s) i++;
    const a = p.pts[i - 1], b = p.pts[i], l = (p.cum[i] - p.cum[i - 1]) || 1, u = (s - p.cum[i - 1]) / l;
    return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  function trace(g, p, s0, s1) {
    s0 = clamp(s0, 0, p.total); s1 = clamp(s1, 0, p.total);
    if (s1 - s0 < 0.05) return false;
    const a = at(p, s0), b = at(p, s1);
    g.beginPath(); g.moveTo(a.x, a.y);
    for (let i = 0; i < p.pts.length; i++) if (p.cum[i] > s0 && p.cum[i] < s1) g.lineTo(p.pts[i][0], p.pts[i][1]);
    g.lineTo(b.x, b.y);
    return true;
  }
  function sNear(p, x, y) { let best = 0, bd = 1e9; for (let s = 0; s <= p.total; s += 0.5) { const q = at(p, s), d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = s; } } return best; }

  // ---------------------------------------------------------------- the network
  const X1 = 140, X2 = 204, XL = 274;
  const YA = 514, YB = 616, YC = 726, YD = 866, YL = 974, YE = 1068;
  const YH = 1258, XF1 = 470, XG = 730, XT = 872, XF2 = 530, YF2 = 1348;

  const P1 = mk([[X1, YA], [X1, YC]]);                                                   // line 1 · negotiate
  const HOP = mk([[X1, YC], [X2, YC]]);                                                   // across the interchange capsule
  const P2 = mk([[X2, YC], [X2, YE]]);                                                    // line 2 · shape
  const PL = mk([[X2, 876], [X2, 898], [XL, 968], [XL, 980], [X2, 1050], [X2, 1066]], 22); // 20/.04 loop
  const P3 = mk([[X2, YE], [X2, 1148], [314, YH], [XG, YH]], 44);                          // line 3 · enlarge (.04 branch)
  const P3B = mk([[306, YH], [340, YH], [430, YF2], [590, YF2], [680, YH], [712, YH]], 36); // .06 branch
  const P4 = mk([[XG, YH], [XT, YH]]);                                                    // line 4 · finish

  const sB = YB - YA, sD = YD - YC, sL = sNear(PL, XL, YL), sF1 = sNear(P3, XF1, YH), sF2 = sNear(P3B, XF2, YF2);
  const ST = {
    A: { x: X1, y: YA, r: 13, pop: 0.5 },
    B: { x: X1, y: YB, r: 13, pop: 2.15 },
    D: { x: X2, y: YD, r: 14, pop: 8.62 },
    L: { x: XL, y: YL, r: 13, pop: 11.75 },
    E: { x: X2, y: YE, r: 17, pop: 10.72 },
    F1: { x: XF1, y: YH, r: 14, pop: 14.4 },
    F2: { x: XF2, y: YF2, r: 14, pop: 14.8 },
    G: { x: XG, y: YH, r: 16, pop: 16.5, dash: true },
    H: { x: XT, y: YH, r: 16, pop: 17.6 },
  };
  const ORDER = ['A', 'B', 'C', 'D', 'L', 'E', 'F1', 'F2', 'G', 'H'];
  const TC = 3.4;                                   // capsule pop

  // train legs: path, from s, to s, t0, t1
  const LEGS = [
    { p: P1, a: 0, b: sB, t0: 1.3, t1: 2.2 },
    { p: P1, a: sB, b: P1.total, t0: 2.5, t1: 3.5 },
    { p: HOP, a: 0, b: HOP.total, t0: 6.1, t1: 6.45 },
    { p: P2, a: 0, b: sD, t0: 7.7, t1: 8.7 },
    { p: P2, a: sD, b: P2.total, t0: 9.8, t1: 10.8 },
    { p: PL, a: PL.total, b: sL, t0: 11.2, t1: 11.85 },
    { p: PL, a: sL, b: PL.total, t0: 12.5, t1: 13.1 },
    { p: P3, a: 0, b: sF1, t0: 13.3, t1: 14.5 },
    { p: P3, a: sF1, b: P3.total, t0: 15.7, t1: 16.6 },
    { p: P4, a: 0, b: P4.total, t0: 16.9, t1: 17.7 },
  ];
  function legPos(t) {
    let L = null;
    for (const l of LEGS) if (t >= l.t0) L = l;
    if (!L) return { x: X1, y: YA, ang: Math.PI / 2, leg: null, u: 0 };
    const u = seg(t, L.t0, L.t1, ease.inOut), q = at(L.p, lerp(L.a, L.b, u));
    return { x: q.x, y: q.y, ang: q.ang + (L.b < L.a ? Math.PI : 0), leg: L, u };
  }
  /** how far (s) a route has been drawn at time t */
  function drawn(p, t) { let s = 0; for (const l of LEGS) if (l.p === p && t >= l.t0) s = Math.max(s, lerp(l.a, l.b, seg(t, l.t0, l.t1, ease.inOut))); return s; }
  /** time at which the train passes s on leg index li (inverse of inOut by bisection) */
  function tPass(li, s) { const l = LEGS[li], tgt = (s - l.a) / (l.b - l.a); let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (ease.inOut(m) < tgt) lo = m; else hi = m; } return lerp(l.t0, l.t1, lo); }

  // "every file" service points (white diamonds between consecutive file stations)
  const DIA = [
    { x: X2, y: 796, t: tPass(3, 796 - YC) },
    { x: X2, y: YL, t: tPass(4, YL - YC) },
    { x: 259, y: 1203, t: 0 },
    { x: 604, y: YH, t: 0 },
  ];
  DIA[2].t = tPass(7, sNear(P3, 259, 1203));
  DIA[3].t = tPass(8, sNear(P3, 604, YH));

  const T = {
    aLab: 0.95, bLab: 2.12, cName: 3.5, cSub: 3.8, cPill: 4.2,
    ev: 4.6, info: 6.3,
    serv: DIA[0].t, dLab: 8.6, eLab: 10.7,
    loop0: 11.1, loop1: 11.9, lLab: 11.8, lSub: 12.0,
    opt: 13.45, f1Lab: 14.42, br0: 14.1, br1: 14.9, br2: 15.55, br3: 16.3, f2Lab: 14.88,
    gLab: 16.52, gTag: 16.8, hLab: 17.62,
    notice: 18.0, inset: 18.8, fine: 19.0, wave: 19.7,
    fade0: DUR - 0.8, fade1: DUR - 0.34, back0: DUR - 0.32, back1: DUR - 0.04,
  };

  // ---------------------------------------------------------------- drawing helpers
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
    g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
  }
  /** text; returns width. o: {align, base, ls, a} */
  function tx(g, str, x, y, font, color, o = {}) {
    const a = o.a == null ? 1 : o.a; if (a <= 0) return 0;
    g.save(); g.globalAlpha *= a; g.font = font; g.fillStyle = color; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'middle';
    if (o.ls != null) g.letterSpacing = o.ls + 'px';
    g.fillText(str, x, y); const w = g.measureText(str).width; g.restore(); return w;
  }
  function mw(g, str, font, ls) { g.save(); g.font = font; if (ls != null) g.letterSpacing = ls + 'px'; const w = g.measureText(str).width; g.restore(); return w; }
  /** rounded tag. x = left edge (or centre / right edge with o.align). returns width */
  function pill(g, str, x, y, o = {}) {
    const font = o.font || BC(700, 28), ls = o.ls == null ? 1.5 : o.ls, h = o.h || 36, px = o.px == null ? 14 : o.px;
    const w = mw(g, str, font, ls) - ls + px * 2;
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    g.save(); rr(g, x0, y - h / 2, w, h, h / 2);
    if (o.bg) { g.fillStyle = o.bg; g.fill(); }
    if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || 3; if (o.dash) g.setLineDash(o.dash); g.stroke(); }
    g.restore();
    tx(g, str, x0 + px, y + 1, font, o.fg || C.ink, { ls });
    return w;
  }
  function arrow(g, x0, y0, x1, y1, w, head, color) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.beginPath(); g.moveTo(x1 - head * Math.cos(a - 0.62), y1 - head * Math.sin(a - 0.62)); g.lineTo(x1, y1); g.lineTo(x1 - head * Math.cos(a + 0.62), y1 - head * Math.sin(a + 0.62)); g.stroke();
    g.restore();
  }
  function ring(g, x, y, r, sc, o = {}) {
    if (sc <= 0) return;
    g.save(); g.translate(x, y); g.scale(sc, sc);
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = o.fill || C.white; g.fill();
    g.lineWidth = o.lw || 6; g.strokeStyle = o.stroke || C.ink; if (o.dash) { g.setLineDash([7.2, 5.4]); g.lineCap = 'butt'; } g.stroke();
    g.restore();
  }
  function capsule(g, sc, ghost) {
    if (sc <= 0) return;
    const cx = (X1 + X2) / 2;
    g.save(); g.translate(cx, YC); g.scale(sc, sc); g.translate(-cx, -YC);
    rr(g, X1 - 18, YC - 18, X2 - X1 + 36, 36, 18); g.fillStyle = C.white; g.fill();
    g.lineWidth = 6; g.strokeStyle = ghost ? C.ghostRing : C.ink; g.stroke();
    if (!ghost) { g.fillStyle = C.L1; g.beginPath(); g.arc(X1, YC, 6, 0, 7); g.fill(); g.fillStyle = C.L2; g.beginPath(); g.arc(X2, YC, 6, 0, 7); g.fill(); }
    g.restore();
  }
  function stroke(g, color, w, cap) { g.strokeStyle = color; g.lineWidth = w; g.lineCap = cap || 'round'; g.lineJoin = 'round'; g.stroke(); }
  const pop = (t, t0, d = 0.38) => (t < t0 ? 0 : ease.outBack(seg(t, t0, t0 + d)));
  /** label reveal: alpha + small slide */
  const rv = (t, t0, d = 0.32) => { const u = seg(t, t0, t0 + d); return { a: u, d: (1 - ease.out(u)) * -14 }; };
  const bump = (t, t0, d = 0.5) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * (t - t0) / d));

  // ---------------------------------------------------------------- pictograms (drawn around 0,0, ~±22)
  function drop(g, x, y, r) {
    g.beginPath(); g.moveTo(x, y - r * 2); g.bezierCurveTo(x + r * 0.35, y - r * 1.1, x + r, y - r * 0.5, x + r, y);
    g.arc(x, y, r, 0, Math.PI); g.bezierCurveTo(x - r, y - r * 0.5, x - r * 0.35, y - r * 1.1, x, y - r * 2); g.fill();
  }
  function sparkle(g, x, y, r) {
    g.beginPath();
    for (let k = 0; k < 8; k++) { const rad = k % 2 ? r * 0.34 : r, an = (k * Math.PI) / 4 - Math.PI / 2; g[k ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rad, y + Math.sin(an) * rad); }
    g.closePath(); g.fill();
  }
  const ICON = {
    irrigate(g) {                                   // syringe + drop
      g.save(); g.translate(-5, -6); g.rotate(-0.66); g.lineWidth = 3.2;
      rr(g, -7, -15, 14, 21, 3); g.stroke();
      g.beginPath(); g.moveTo(-11, -15); g.lineTo(11, -15); g.moveTo(0, -15); g.lineTo(0, -23); g.moveTo(-6, -23); g.lineTo(6, -23); g.moveTo(0, 6); g.lineTo(0, 10); g.stroke();
      g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 10); g.lineTo(0, 21); g.stroke();
      g.restore(); drop(g, 13.5, 19, 4.6);
    },
    recap(g) {                                      // hand file + "go round again" arrow
      const r = 19, a1 = Math.PI * 1.22; g.lineWidth = 3;
      g.beginPath(); g.arc(0, 0, r, -Math.PI * 0.36, a1); g.stroke();
      const hx = Math.cos(a1) * r, hy = Math.sin(a1) * r, ta = a1 + Math.PI / 2;
      g.beginPath(); g.moveTo(hx - 9 * Math.cos(ta - 0.6), hy - 9 * Math.sin(ta - 0.6)); g.lineTo(hx, hy); g.lineTo(hx - 9 * Math.cos(ta + 0.6), hy - 9 * Math.sin(ta + 0.6)); g.stroke();
      rr(g, -5.5, -13, 11, 9, 3); g.fill();
      g.beginPath(); g.moveTo(-2.3, -3); g.lineTo(2.3, -3); g.lineTo(0, 14); g.closePath(); g.fill(); g.lineWidth = 1.6; g.stroke();
    },
    clean(g) {                                      // fluted file + sparkles
      g.save(); g.rotate(-Math.PI / 4); g.lineWidth = 3.2;
      rr(g, -23, -5.5, 11, 11, 3); g.fill();
      g.beginPath(); g.moveTo(-12, 0); for (let i = 0; i < 6; i++) g.lineTo(-8 + i * 5, i % 2 ? -4 : 4); g.lineTo(22, 0); g.stroke();
      g.restore(); sparkle(g, 13, 13, 7); sparkle(g, -12, -13, 5.2);
    },
    inspect(g) {                                    // magnifier over a file tip
      g.lineWidth = 3.4; g.beginPath(); g.arc(-4, -4, 12.5, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 5.5; g.beginPath(); g.moveTo(6, 6); g.lineTo(16, 16); g.stroke();
      g.lineWidth = 2.4; g.beginPath(); g.moveTo(-4, -12); g.lineTo(-6.5, -7.5); g.lineTo(-1.5, -3.5); g.lineTo(-4, 3.5); g.stroke();
    },
    locator(g) {                                    // apex locator
      g.lineWidth = 3; rr(g, -17, -13, 34, 26, 6); g.stroke();
      g.lineWidth = 2.6; g.beginPath(); g.arc(0, 6, 10.5, Math.PI, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(0, 6); g.lineTo(6.5, -2.5); g.stroke();
      g.beginPath(); g.arc(0, 6, 2.4, 0, 7); g.fill();
    },
    xray(g) {                                       // radiograph
      rr(g, -15, -15, 30, 30, 5); g.fill();
      g.fillStyle = C.white; g.beginPath(); g.moveTo(-8, -5);
      g.bezierCurveTo(-8, -12, -2.5, -11, 0, -8.5); g.bezierCurveTo(2.5, -11, 8, -12, 8, -5);
      g.bezierCurveTo(8, 1, 6.5, 3, 5.6, 10.5); g.lineTo(3.3, 10.5); g.bezierCurveTo(2.6, 4.5, 1.4, 2.2, 0, 2.2);
      g.bezierCurveTo(-1.4, 2.2, -2.6, 4.5, -3.3, 10.5); g.lineTo(-5.6, 10.5); g.bezierCurveTo(-6.5, 3, -8, 1, -8, -5); g.fill();
    },
  };
  function icon(g, name, x, y, sc = 1, color = C.ink) {
    g.save(); g.translate(x, y); g.scale(sc, sc); g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
    ICON[name](g); g.restore();
  }
  /** ISO-style "do not re-use" sign (2 struck through) — generic regulatory symbol, drawn here */
  function noReuse(g, x, y, r) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = C.white; g.fill(); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    tx(g, '2', 0, 2, BC(700, r * 1.5), C.ink, { align: 'center' });
    g.lineWidth = 4; g.lineCap = 'butt'; g.beginPath(); g.moveTo(-r * 0.71, -r * 0.71); g.lineTo(r * 0.71, r * 0.71); g.stroke();
    g.restore();
  }
  function diamond(g, x, y, s, fill, strokeC) {
    g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath();
    g.fillStyle = fill; g.fill(); g.lineWidth = 3.4; g.strokeStyle = strokeC; g.lineJoin = 'round'; g.stroke();
  }
  const SHADOW = 'rgba(23,32,47,0.13)';              // flat offset shadow, like a printed map panel
  function panel(g, x, y, w, h, title, o = {}) {
    g.save(); rr(g, x + 6, y + 7, w, h, 16); g.fillStyle = SHADOW; g.fill();
    rr(g, x, y, w, h, 16); g.fillStyle = C.white; g.fill();
    if (title) { g.save(); g.clip(); g.fillStyle = C.ink; g.fillRect(x, y, w, 44); g.restore(); }
    rr(g, x, y, w, h, 16); g.lineWidth = 3; g.strokeStyle = C.ink; if (o.dash) g.setLineDash(o.dash); g.stroke(); g.restore();
    if (title) tx(g, title, x + (o.tx || 18), y + 23, BC(700, 30), C.white, { ls: 3 });
  }

  // ---------------------------------------------------------------- cached background
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const lv = document.createElement('canvas'); lv.width = W; lv.height = H; const lg = lv.getContext('2d');
  const KEY = [['1', 'Negotiate', C.L1], ['2', 'Shape', C.L2], ['3', 'Enlarge', C.L3], ['4', 'Finish', C.L4]];
  const KEYX = [64, 302, 540, 778];
  const INFO = { x: 620, y: 486, w: 396, h: 214 };

  function buildBg() {
    const b = bg.getContext('2d');
    b.fillStyle = C.paper; b.fillRect(0, 0, W, H);
    // paper grain + fold creases (pocket-map feel)
    const rnd = Kit.rng(36);
    for (let i = 0; i < 5200; i++) { b.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(120,105,80,0.045)'; b.fillRect(rnd() * W, 404 + rnd() * (H - 404), 1 + rnd() * 2, 1 + rnd() * 2); }
    const crease = (x0, y0, x1, y1) => {
      const dx = x1 === x0 ? 1 : 0, dy = dx ? 0 : 1;
      b.strokeStyle = 'rgba(90,75,50,0.07)'; b.lineWidth = 2; b.beginPath(); b.moveTo(x0, y0); b.lineTo(x1, y1); b.stroke();
      b.strokeStyle = 'rgba(255,255,255,0.75)'; b.lineWidth = 2; b.beginPath(); b.moveTo(x0 + dx * 2, y0 + dy * 2); b.lineTo(x1 + dx * 2, y1 + dy * 2); b.stroke();
    };
    crease(540, 413, 540, H); crease(0, 905, W, 905); crease(0, 1400, W, 1400);

    // header band (top 230 px sit under the app UI: decoration only)
    b.fillStyle = C.ink; b.fillRect(0, 0, W, 404);
    b.save(); b.lineCap = 'round'; b.lineJoin = 'round';
    const deco = [
      [[-20, 150], [200, 150], [290, 60], [620, 60], [700, 140], [1100, 140]],
      [[-20, 60], [120, 60], [230, 170], [520, 170], [590, 100], [860, 100], [960, 200], [1100, 200]],
      [[420, -20], [420, 60], [520, 170]],
      [[860, -20], [860, 100]],
    ];
    deco.forEach((v) => { const p = mk(v, 30); trace(b, p, 0, p.total); stroke(b, 'rgba(255,255,255,0.055)', 14); });
    [[200, 150], [290, 60], [620, 60], [230, 170], [520, 170], [860, 100], [700, 140], [960, 200], [420, 60]].forEach(([x, y]) => {
      b.beginPath(); b.arc(x, y, 9, 0, 7); b.fillStyle = C.ink; b.fill(); b.lineWidth = 4; b.strokeStyle = 'rgba(255,255,255,0.10)'; b.stroke();
    });
    b.restore();
    [C.L1, C.L2, C.L3, C.L4].forEach((c, i) => { b.fillStyle = c; b.fillRect((i * W) / 4, 404, W / 4 + 1, 9); });
    rr(b, 64, 264, 114, 114, 24); b.fillStyle = C.ev; b.fill();
    tx(b, 'X7', 121, 325, BC(700, 82), C.ink, { align: 'center' });
    tx(b, 'EDGEFILE X7 · SHAPING ROUTE', 206, 283, BA(600, 30), C.headTxt, { ls: 3 });
    tx(b, '@natebrooksendo', 1016, 283, BA(500, 26), C.headDim, { align: 'right' });
    const tf = BC(700, 112);
    let x = 204; x += tx(b, 'ACCESS', x, 381, tf, C.white, { base: 'alphabetic', ls: 1 });
    arrow(b, x + 30, 343, x + 118, 343, 13, 30, C.ev); x += 150;
    tx(b, 'APEX', x, 381, tf, C.white, { base: 'alphabetic', ls: 1 });

    ['A', 'B', 'C', 'D', 'E'].forEach((ch, i) => {
      const gy = 560 + i * 220;
      tx(b, ch, 30, gy, BC(600, 24), C.ghostRing, { align: 'center' }); tx(b, ch, W - 30, gy, BC(600, 24), C.ghostRing, { align: 'center' });
      b.fillStyle = C.ghost; b.fillRect(0, gy - 111, 14, 2); b.fillRect(W - 14, gy - 111, 14, 2);
    });
    // footer (below the safe area: decoration only)
    b.fillStyle = C.ghost; b.fillRect(64, 1622, 952, 3);
    tx(b, 'SCHEMATIC ROUTE MAP · NOT TO SCALE', 64, 1656, BC(600, 26), C.ghostRing, { ls: 4 });
    tx(b, 'X7', 1016, 1656, BC(700, 30), C.ghostRing, { align: 'right', ls: 2 });
    [C.L1, C.L2, C.L3, C.L4].forEach((c, i) => { b.fillStyle = c; b.fillRect((i * W) / 4, H - 12, W / 4 + 1, 12); });

    // key strip
    KEY.forEach(([n, name, col], i) => {
      const kx = KEYX[i];
      rr(b, kx, 424, 38, 38, 10); b.fillStyle = col; b.fill();
      tx(b, n, kx + 19, 444, BC(700, 28), C.white, { align: 'center' });
      tx(b, name, kx + 50, 444, BC(600, 34), C.ink);
      rr(b, kx, 468, 196, 5, 2.5); b.fillStyle = C.ghost; b.fill();
    });

    // ghost network (the planned route)
    b.lineCap = 'round'; b.lineJoin = 'round';
    for (const p of [P3B, P3, P4, PL, P2, P1]) { trace(b, p, 0, p.total); stroke(b, C.ghost, LW); }
    b.fillStyle = C.ghost; b.fillRect(X1 - 17, YA - 31, 34, 7); b.fillRect(XT + 23, YH - 17, 7, 34);
    for (const k of Object.keys(ST)) ring(b, ST[k].x, ST[k].y, ST[k].r, 1, { stroke: C.ghostRing, lw: 5 });
    capsule(b, 1, true);

    // line-info card (static reference, like a timetable box)
    const { x: ix, y: iy, w: iw, h: ih } = INFO;
    panel(b, ix, iy, iw, ih, 'LINE INFO');
    tx(b, 'IFU · DFU', ix + iw - 18, iy + 23, BC(500, 26), C.headTxt, { align: 'right', ls: 1 });
    const lf = BC(600, 30), lab = (s, y) => tx(b, s, ix + 18, y, lf, C.sub, { ls: 1.5 });
    const val = (s, y, f) => tx(b, s, ix + iw - 18, y, f || BC(700, 46), C.ink, { align: 'right' });
    lab('SPEED', iy + 74); val('300–500 rpm', iy + 73);
    b.fillStyle = '#E3DFD6'; b.fillRect(ix + 18, iy + 101, iw - 36, 2); b.fillRect(ix + 18, iy + 169, iw - 36, 2);
    lab('TORQUE LIMIT', iy + 122); val('300 g·cm', iy + 134);
    tx(b, '= 2.94 N·cm', ix + 18, iy + 150, BC(500, 26), C.fine);
    lab('APICAL PRESSURE', iy + 192); val('minimal', iy + 191, BC(700, 40));
  }

  // ---------------------------------------------------------------- live layer
  function drawLive(g, t) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    // ---- routes
    const s1 = drawn(P1, t), s2 = drawn(P2, t), s3 = drawn(P3, t), s4 = drawn(P4, t);
    // .06 branch: out to its station first, then on to the junction as the train gets there
    const sb = sF2 * seg(t, T.br0, T.br1, ease.inOut) + (P3B.total - sF2) * seg(t, T.br2, T.br3, ease.inOut);
    const cond = () => { g.save(); g.setLineDash([9, 13]); stroke(g, C.white, 5, 'butt'); g.restore(); };   // white core = conditional service
    if (trace(g, P3B, 0, sb)) { stroke(g, C.L3, LW); cond(); }
    if (trace(g, P3, 0, s3)) { stroke(g, C.L3, LW); cond(); }
    if (trace(g, P4, 0, s4)) stroke(g, C.L4, LW);
    const ul = seg(t, T.loop0, T.loop1, ease.inOut);
    if (trace(g, PL, PL.total * (1 - ul), PL.total)) {
      stroke(g, C.L2, LW); cond();                                   // "only if needed" service
    }
    if (trace(g, P2, 0, s2)) stroke(g, C.L2, LW);
    if (trace(g, P1, 0, s1)) stroke(g, C.L1, LW);
    // terminus buffers
    const aS = pop(t, ST.A.pop), hS = pop(t, ST.H.pop);
    if (aS > 0) { g.fillStyle = C.ink; g.globalAlpha = clamp(aS); g.fillRect(X1 - 17, YA - 31, 34, 7); g.globalAlpha = 1; }
    if (hS > 0) { g.fillStyle = C.ink; g.globalAlpha = clamp(hS); g.fillRect(XT + 23, YH - 17, 7, 34); g.globalAlpha = 1; }

    // ---- "every file" diamonds on the track
    DIA.forEach((d) => {
      const u = seg(t, d.t - 0.12, d.t + 0.12); if (u <= 0) return;
      const fl = bump(t, d.t - 0.05, 0.9) + bump(t, T.wave + 1.1, 0.6) * 0.8;
      const pg = seg(t, d.t, d.t + 0.8);
      if (pg > 0 && pg < 1) { g.save(); g.globalAlpha = (1 - pg) * 0.9; g.beginPath(); g.arc(d.x, d.y, 12 + 34 * ease.out(pg), 0, Math.PI * 2); g.lineWidth = 5 * (1 - pg) + 1.5; g.strokeStyle = C.ev; g.stroke(); g.restore(); }
      g.save(); g.globalAlpha = u;
      diamond(g, d.x, d.y, 8.5 + 3.5 * fl, `rgb(${Kit.mix(C.white, C.ev, clamp(fl)).map((v) => v | 0).join(',')})`, C.ink);
      g.restore();
    });

    // ---- stations
    ORDER.forEach((k, i) => {
      const w = 1 + 0.2 * bump(t, T.wave + i * 0.085, 0.45);
      if (k === 'C') { capsule(g, pop(t, TC) * w, false); return; }
      const s = ST[k]; ring(g, s.x, s.y, s.r, pop(t, s.pop) * w, { dash: s.dash });
    });

    // ---- station labels
    const NAME = BC(700, 44), SUB = BC(500, 32), FILE = BC(700, 56);
    let r;
    r = rv(t, T.aLab); tx(g, 'ACCESS', 186 + r.d, YA, NAME, C.ink, { a: r.a });
    r = rv(t, T.aLab + 0.15); tx(g, 'straight-line', 186 + r.d, YA + 38, SUB, C.sub, { a: r.a });
    r = rv(t, T.bLab); tx(g, 'SCOUT', 186 + r.d, YB, NAME, C.ink, { a: r.a });
    r = rv(t, T.bLab + 0.15); tx(g, 'hand files', 186 + r.d, YB + 38, SUB, C.sub, { a: r.a });

    r = rv(t, T.cName); tx(g, 'WORKING LENGTH', 250 + r.d, YC, NAME, C.ink, { a: r.a });
    r = rv(t, T.cSub);
    if (r.a > 0) {
      const w = tx(g, '#10 K or larger', 250 + r.d, YC + 39, SUB, C.sub, { a: r.a });
      g.save(); g.globalAlpha = r.a;
      icon(g, 'locator', 250 + w + 38 + r.d, YC + 39, 0.92 * pop(t, T.cSub + 0.15), C.ink);
      icon(g, 'xray', 250 + w + 88 + r.d, YC + 39, 0.92 * pop(t, T.cSub + 0.3), C.ink);
      g.restore();
    }
    r = rv(t, T.cPill);
    let pillW = 0;
    if (r.a > 0) { g.save(); g.globalAlpha = r.a; pillW = pill(g, '= GLIDE PATH', 250 + r.d, YC + 80, { bg: C.L1, fg: C.white, font: BC(700, 30), h: 38 }); g.restore(); }

    r = rv(t, T.dLab); tx(g, '17/.04', 250 + r.d, YD, FILE, C.ink, { a: r.a });
    r = rv(t, T.eLab); tx(g, '25/.04', 250 + r.d, YE, FILE, C.ink, { a: r.a });
    r = rv(t, T.lLab);
    if (r.a > 0) {
      const w = tx(g, '20/.04', 314 + r.d, YL, BC(700, 48), C.ink, { a: r.a });
      // "alternate" double arrow
      const ax = 314 + w + 16 + r.d, pu = 0.5 + 0.5 * Math.sin((t - T.lLab) * 5.2) * (t < 13.3 ? 1 : 0);
      g.save(); g.globalAlpha = r.a;
      arrow(g, ax, YL - 7, ax + 34 + 3 * pu, YL - 7, 4, 9, C.L2); arrow(g, ax + 37, YL + 8, ax + 3 - 3 * pu, YL + 8, 4, 9, C.L2);
      g.restore();
    }
    r = rv(t, T.lSub); tx(g, 'if 25 won’t reach length', 314 + r.d, YL + 38, SUB, C.sub, { a: r.a });

    r = rv(t, T.opt);
    if (r.a > 0) { g.save(); g.globalAlpha = r.a; pill(g, 'IF WANTED', 238 + r.d, 1130, { stroke: C.L3, fg: C.L3, bg: C.white, font: BC(700, 30), h: 38 }); g.restore(); }
    r = rv(t, T.f1Lab); tx(g, 'LARGER .04', XF1, 1178 - r.d * 0.6, NAME, C.ink, { a: r.a, align: 'center' });
    r = rv(t, T.f1Lab + 0.15); tx(g, 'all canals', XF1, 1216 - r.d * 0.6, SUB, C.sub, { a: r.a, align: 'center' });
    r = rv(t, T.f2Lab); tx(g, 'LARGER .06', XF2, 1397 + r.d * 0.6, NAME, C.ink, { a: r.a, align: 'center' });
    r = rv(t, T.f2Lab + 0.15); tx(g, 'straight to mildly curved', XF2, 1433 + r.d * 0.6, SUB, C.sub, { a: r.a, align: 'center' });
    r = rv(t, T.gLab); tx(g, 'IRRIGATE', XG, 1212 - r.d * 0.6, NAME, C.ink, { a: r.a, align: 'center' });
    r = rv(t, T.gTag);
    if (r.a > 0) { g.save(); g.globalAlpha = r.a; pill(g, 'convention', XG, 1168, { align: 'center', stroke: C.sub, fg: C.sub, bg: C.white, dash: [6, 5], font: BC(600, 30), h: 36, lw: 2.5, ls: 0.5 }); g.restore(); }
    r = rv(t, T.hLab); tx(g, 'OBTURATE', 950, 1308 + r.d * 0.6, NAME, C.ink, { a: r.a, align: 'right' });
    r = rv(t, T.hLab + 0.15); tx(g, 'check cone fit', 950, 1346 + r.d * 0.6, SUB, C.sub, { a: r.a, align: 'right' });

    // ---- evidence flag (in vitro) with a leader from the glide-path tag
    evCard(g, t, 250 + pillW);
    servCard(g, t);
    notice(g, t);
    inset(g, t);
    const fa = seg(t, T.fine, T.fine + 0.4);
    if (fa > 0) {
      const s = 'Manufacturer IFU 2026 / US DFU 2023 + evidence-informed habits · no sequence is proven “most efficient”';
      let fs = 24; while (fs > 22 && mw(g, s, BC(500, fs)) > 884) fs -= 0.5;
      tx(g, s, 64, 1564, BC(500, fs), C.fine, { a: fa });
    }
  }

  function evCard(g, t, leadX) {
    const x = 620, y = 724, w = 396, h = 156, py = YC + 80;
    const ul = seg(t, T.ev - 0.25, T.ev + 0.15, ease.inOut);
    if (ul > 0) {                                    // dotted leader
      g.save(); g.strokeStyle = C.ink; g.lineWidth = 3.4; g.lineCap = 'round'; g.setLineDash([0.1, 9]);
      g.beginPath(); g.moveTo(leadX + 12, py); g.lineTo(lerp(leadX + 12, x - 16, ul), py); g.stroke(); g.restore();
    }
    const u = seg(t, T.ev, T.ev + 0.55, ease.out); if (u <= 0) return;
    g.save();
    g.beginPath(); g.rect(x - 20, y - 24, (w + 30) * u + 20, h + 36); g.clip();   // unfurl from the pole side
    // pointer + card
    g.beginPath(); g.moveTo(x - 13, py); g.lineTo(x + 2, py - 12); g.lineTo(x + 2, py + 12); g.closePath(); g.fillStyle = C.ink; g.fill();
    rr(g, x + 6, y + 7, w, h, 16); g.fillStyle = SHADOW; g.fill();
    rr(g, x, y, w, h, 16); g.fillStyle = '#FFFDF4'; g.fill(); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
    pill(g, 'EVIDENCE · IN VITRO', x + 16, y, { bg: C.ev, stroke: C.ink, fg: C.ink, font: BC(700, 28), ls: 2, h: 38 });
    const a = seg(t, T.ev + 0.25, T.ev + 0.6);
    tx(g, 'Glide path first:', x + 18, y + 47, BC(600, 34), C.ink, { a });
    tx(g, 'file lasted about 6× longer', x + 18, y + 84, BC(700, 35), C.ink, { a });
    tx(g, 'ProTaper S1 in resin blocks: mean 59 vs 10', x + 18, y + 115, BC(500, 23), C.fine, { a });
    tx(g, 'Berutti 2004, J Endod', x + 18, y + 138, BC(500, 23), C.fine, { a });
    g.restore();
  }

  const SERV = [['irrigate', ['irrigate']], ['recap', ['recap', '#10/#15']], ['clean', ['clean', 'flutes']], ['inspect', ['inspect']]];
  function servCard(g, t) {
    const x = 620, y = 894, w = 396, h = 204;
    const u = seg(t, T.serv, T.serv + 0.45); if (u <= 0) return;
    g.save(); g.globalAlpha = u; g.translate((1 - ease.out(u)) * 28, 0);
    panel(g, x, y, w, h, 'EVERY FILE', { tx: 48 });
    diamond(g, x + 27, y + 22, 8, C.white, C.white);
    SERV.forEach(([ic, lines], i) => {
      const cx = x + 63 + i * 90, cy = y + 88, t0 = T.serv + 0.3 + i * 0.3;
      const s = pop(t, t0); if (s <= 0) return;
      let lit = bump(t, t0, 0.7);
      for (let k = 1; k < DIA.length; k++) lit = Math.max(lit, bump(t, DIA[k].t + i * 0.13, 0.62));
      lit = Math.max(lit, bump(t, T.wave + 1.1 + i * 0.1, 0.5) * 0.8);
      g.save(); g.translate(cx, cy); g.scale(s * (1 + 0.1 * lit), s * (1 + 0.1 * lit));
      g.beginPath(); g.arc(0, 0, 31, 0, Math.PI * 2); g.fillStyle = `rgb(${Kit.mix(C.white, C.ev, clamp(lit)).map((v) => v | 0).join(',')})`; g.fill();
      g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke(); g.restore();
      icon(g, ic, cx, cy, s, C.ink);
      const la = seg(t, t0 + 0.15, t0 + 0.45);
      lines.forEach((ln, j) => tx(g, ln, cx, y + 140 + j * 32, BC(600, 30), C.ink, { a: la, align: 'center' }));
    });
    g.restore();
  }

  function notice(g, t) {
    const x = 64, y = 1454, w = 886, h = 86;
    const u = seg(t, T.notice, T.notice + 0.5); if (u <= 0) return;
    g.save(); g.globalAlpha = u; g.translate(0, (1 - ease.out(u)) * 24);
    rr(g, x + 6, y + 7, w, h, 16); g.fillStyle = SHADOW; g.fill();
    rr(g, x, y, w, h, 16); g.fillStyle = C.white; g.fill(); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
    noReuse(g, x + 46, y + 43, 25 * (0.85 + 0.15 * pop(t, T.notice + 0.2)));
    tx(g, 'One patient · one procedure · then discard', x + 88, y + 26, BC(700, 37), C.ink);
    tx(g, 'max 4 canals per file — IFU 2026', x + 88, y + 62, BC(500, 31), C.sub);
    const a = seg(t, T.notice + 0.5, T.notice + 0.9);
    g.globalAlpha = u * a; pill(g, 'FOLLOW THE CURRENT DFU', x + w - 12, y + 62, { align: 'right', bg: C.ink, fg: C.white, font: BC(700, 28), ls: 2, h: 38 });
    g.restore();
  }

  function inset(g, t) {
    const x = 64, y = 1298, w = 284, h = 146;
    const u = seg(t, T.inset, T.inset + 0.45); if (u <= 0) return;
    g.save(); g.globalAlpha = u; g.translate((1 - ease.out(u)) * -20, 0);
    rr(g, x, y, w, h, 14); g.fillStyle = 'rgba(255,255,255,0.72)'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.sub; g.setLineDash([7, 6]); g.stroke(); g.setLineDash([]);
    tx(g, 'ALTERNATIVE SERVICE', x + 16, y + 22, BC(600, 22), C.fine, { ls: 2 });
    tx(g, 'CROWN-DOWN', x + 16, y + 52, BC(700, 32), C.ink, { ls: 1 });
    // dotted mini line: 25 -> 20 -> (17)
    const yy = y + 92, f = BC(700, 34);
    let cx = x + 16; cx += tx(g, '25', cx, yy, f, C.ink);
    arrow(g, cx + 12, yy, cx + 50, yy, 3.4, 9, C.sub); cx += 62;
    cx += tx(g, '20', cx, yy, f, C.ink);
    arrow(g, cx + 12, yy, cx + 50, yy, 3.4, 9, C.sub); cx += 62;
    tx(g, '(17)', cx, yy, f, C.ink);
    tx(g, 'to resistance · US DFU 2023', x + 16, y + 126, BC(500, 24), C.fine);
    g.restore();
  }

  // ---------------------------------------------------------------- train marker + intro ornaments
  function train(g, x, y, ang, col, a) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y);
    g.beginPath(); g.arc(0, 0, 36, 0, Math.PI * 2); g.fillStyle = Kit.rgba(col, 0.16); g.fill();
    g.rotate(ang);
    rr(g, -29, -16, 58, 32, 13); g.fillStyle = C.ink; g.fill(); g.lineWidth = 4.5; g.strokeStyle = C.white; g.stroke();
    g.strokeStyle = C.white; g.lineWidth = 4.2; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(4, -7); g.lineTo(13, 0); g.lineTo(4, 7); g.stroke();
    g.beginPath(); g.arc(-13, 0, 5.2, 0, Math.PI * 2); g.fillStyle = col; g.fill();
    g.restore();
  }
  function lineColorAt(t) { return t < 6.28 ? C.L1 : t < 13.3 ? C.L2 : t < 16.75 ? C.L3 : C.L4; }
  function compass(g, a) {                           // intro ornament: "this way to the apex"
    if (a <= 0) return;
    const x = 818, y = 900, col = C.ghostRing;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 118, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 100, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 16; k++) { const an = (k * Math.PI) / 8, r0 = k % 4 === 0 ? 76 : k % 2 === 0 ? 86 : 92; g.lineWidth = k % 4 === 0 ? 4 : 2.5; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * 100, Math.sin(an) * 100); g.stroke(); }
    g.beginPath(); g.moveTo(0, 70); g.lineTo(-22, 0); g.lineTo(0, -12); g.lineTo(22, 0); g.closePath(); g.fill();           // south-pointing needle
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, -12); g.lineTo(-22, 0); g.lineTo(0, -62); g.lineTo(22, 0); g.closePath(); g.stroke();
    tx(g, 'APEX', 0, 152, BC(700, 40), col, { align: 'center', ls: 5 });
    g.restore();
  }
  function bubble(g, a) {
    if (a <= 0) return;
    const x = 196, y = YA;
    g.save(); g.globalAlpha = a;
    g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 2, y - 11); g.lineTo(x + 2, y + 11); g.closePath(); g.fillStyle = C.ink; g.fill();
    pill(g, 'YOU ARE HERE', x, y, { bg: C.ink, fg: C.white, font: BC(700, 30), ls: 2.5, h: 46, px: 18 });
    g.restore();
  }

  // ---------------------------------------------------------------- frame
  function render(t) {
    t = clamp(t, 0, DUR);
    ctx.globalAlpha = 1; ctx.drawImage(bg, 0, 0);
    const live = 1 - seg(t, T.fade0, T.fade1, ease.smooth);
    const back = seg(t, T.back0, T.back1, ease.smooth);          // intro state returning for a clean loop

    // key strip: progress under each line name
    [[P1, C.L1], [P2, C.L2], [P3, C.L3], [P4, C.L4]].forEach(([p, col], i) => {
      const u = drawn(p, t) / p.total; if (u <= 0) return;
      ctx.globalAlpha = live; rr(ctx, KEYX[i], 468, Math.max(5, 196 * u), 5, 2.5); ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
    });
    // line-info ping when the rotary line opens
    const ping = bump(t, T.info, 1.1);
    if (ping > 0) { ctx.save(); ctx.globalAlpha = ping; rr(ctx, INFO.x - 5, INFO.y - 5, INFO.w + 10, INFO.h + 10, 20); ctx.lineWidth = 7; ctx.strokeStyle = C.ev; ctx.stroke(); ctx.restore(); }

    compass(ctx, Math.max(1 - seg(t, 4.0, 4.6), back));

    lg.clearRect(0, 0, W, H); drawLive(lg, t);
    ctx.globalAlpha = live; ctx.drawImage(lv, 0, 0); ctx.globalAlpha = 1;

    const q = legPos(t), breathe = 1 + 0.03 * Math.sin(t * 3.1);
    ctx.save(); ctx.translate(q.x, q.y); ctx.scale(breathe, breathe); ctx.translate(-q.x, -q.y);
    train(ctx, q.x, q.y, q.ang, lineColorAt(t), live * (1 - seg(t, T.notice, T.notice + 0.45)));
    ctx.restore();
    if (back > 0) train(ctx, X1, YA, Math.PI / 2, C.L1, back);
    bubble(ctx, Math.max(1 - seg(t, 0.7, 0.95), back));
  }

  window.REEL = {
    title: 'EdgeFile X7 shaping route — transit map',
    duration: DUR,
    poster: 22.3,
    canvas,
    fonts: ['700 44px "Barlow Condensed"', '600 34px "Barlow Condensed"', '500 32px "Barlow Condensed"',
      '600 30px "Barlow"', '500 26px "Barlow"'],
    setup() { buildBg(); },
    render,
  };
  Kit.boot(window.REEL);
})();
