/*
 * comic.js — ink + halftone drawing kit for reel 27 (silent comic strip).
 * Four-colour print palette (C, M, Y, K on newsprint), overprints (R, G, B) and Ben-Day dot screens.
 * Everything is deterministic. Two modes: 'ink' (final art) and 'pencil' (blue-line rough: outlines only).
 */
(function () {
  'use strict';
  const { clamp, lerp, hash, noise1 } = Kit;
  const TAU = Math.PI * 2;
  let c = null, pencil = false;

  const INK = {
    paper: '#f2e8d4', white: '#fbf6e9', K: '#1c1916', K2: '#6e675d', K1: '#b9b1a2', K0: '#dcd4c2',
    C: '#1ea5d9', C1: '#9dd6ec', C0: '#d3ebef',
    M: '#e2338a', M1: '#f2a0c4', M0: '#f8d5df',
    Y: '#fbd32a', Y1: '#fbe289', Y0: '#fbeec0',
    R: '#e4492d', R1: '#f09175', P1: '#f6bd93', P0: '#f9ddc2',
    G: '#43a650', G1: '#a3d398', G0: '#d2e7c3',
    B: '#4a4da4', B1: '#b2b1dc', B0: '#dcdaec',
    BR: '#a9693f',
  };
  const PEN = {};
  Object.keys(INK).forEach((k) => (PEN[k] = '#f8f2e4'));
  Object.assign(PEN, { K: '#5a93cf', K2: '#86afdb', K1: '#aecbe6', K0: '#e2e9ec', paper: INK.paper });
  const P = Object.assign({}, INK);
  function mode(pen) { pencil = !!pen; Object.assign(P, pencil ? PEN : INK); }
  function use(ctx) { c = ctx; }
  const isPencil = () => pencil;

  // ---------- Ben-Day dot screens (rational-tangent lattices so the tile repeats exactly) ----------
  const LAT = { C: [3, 1, 3], M: [1, 3, 3], Y: [1, 0, 9], K: [1, 1, 7], R: [2, 1, 4], G: [1, 2, 4], B: [2, 1, 4], W: [1, 1, 7], BR: [1, 2, 4] };
  const RF = [0, 0.16, 0.23, 0.3, 0.38, 0.46];
  const pats = {};
  function makeDots(color, a, b, u, rf) {
    const n = a * a + b * b, T = Math.round(n * u), p = u * Math.sqrt(n), r = rf * p;
    const cv = document.createElement('canvas'); cv.width = cv.height = T * 2;
    const g = cv.getContext('2d'); g.scale(2, 2); g.fillStyle = color;
    const m = n + 3;
    for (let i = -m; i <= m; i++) for (let j = -m; j <= m; j++) {
      const x = (i * a - j * b) * u, y = (i * b + j * a) * u;
      if (x < -r || y < -r || x > T + r || y > T + r) continue;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    const pat = g.createPattern(cv, 'repeat');
    pat.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]));
    return pat;
  }
  /** halftone screen of ink `key` at level 1..5 (null in pencil mode) */
  function HT(key, lvl = 2) {
    if (pencil) return null;
    const id = key + lvl;
    if (!pats[id]) { const L = LAT[key] || [2, 1, 4]; pats[id] = makeDots(key === 'W' ? INK.white : INK[key], L[0], L[1], L[2], RF[lvl]); }
    return pats[id];
  }
  /** graded halftone: dots whose size follows cov(x,y) in 0..~0.8 (static backgrounds only) */
  function htGrad(key, pitch, ang, x0, y0, x1, y1, cov) {
    if (pencil) return;
    const cs = Math.cos(ang), sn = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const n = Math.ceil((Math.hypot(x1 - x0, y1 - y0) / 2 + pitch) / pitch);
    c.fillStyle = INK[key] || key; c.beginPath();
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
      const u = i * pitch, v = j * pitch, x = cx + u * cs - v * sn, y = cy + u * sn + v * cs;
      if (x < x0 - pitch || x > x1 + pitch || y < y0 - pitch || y > y1 + pitch) continue;
      const k = cov(x, y); if (k <= 0.012) continue;
      const r = pitch * Math.sqrt(Math.min(k, 0.85) / Math.PI);
      c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
    }
    c.fill();
  }

  // ---------- paths ----------
  function smoothClosed(pts) {
    const n = pts.length; c.beginPath();
    const p0 = pts[n - 1], p1 = pts[0]; c.moveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    c.closePath();
  }
  function smoothOpen(pts, cont) {
    const n = pts.length; if (!cont) c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    if (n === 2) { c.lineTo(pts[1][0], pts[1][1]); return; }
    for (let i = 1; i < n - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (i === n - 2) c.quadraticCurveTo(a[0], a[1], b[0], b[1]);
      else c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
  }
  /** sample the same spline smoothOpen draws: returns [[x,y],...] */
  function sample(pts, per = 10) {
    const n = pts.length, out = [];
    if (n === 2) { for (let k = 0; k <= per; k++) out.push([lerp(pts[0][0], pts[1][0], k / per), lerp(pts[0][1], pts[1][1], k / per)]); return out; }
    let s = pts[0];
    for (let i = 1; i < n - 1; i++) {
      const a = pts[i], b = pts[i + 1], e = i === n - 2 ? b : [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      for (let k = i === 1 ? 0 : 1; k <= per; k++) { const u = k / per, m = 1 - u; out.push([m * m * s[0] + 2 * m * u * a[0] + u * u * e[0], m * m * s[1] + 2 * m * u * a[1] + u * u * e[1]]); }
      s = e;
    }
    return out;
  }
  /** point + tangent angle at fraction u (0..1) of a sampled polyline */
  function along(arr, u) {
    const f = clamp(u) * (arr.length - 1), i = Math.min(arr.length - 2, Math.floor(f)), k = f - i, a = arr[i], b = arr[i + 1];
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  function blob(x, y, r, o = {}) {
    const n = o.n || 10, amp = o.amp == null ? 0.1 : o.amp, seed = o.seed || 1, ph = o.ph || 0, sx = o.sx || 1, sy = o.sy || 1, rot = o.rot || 0, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rot, rr = r * (1 + amp * noise1(i * 1.37 + ph, seed)); pts.push([x + Math.cos(a) * rr * sx, y + Math.sin(a) * rr * sy]); }
    smoothClosed(pts);
  }
  function bean(x, y, rx, ry, rot = 0, notch = 0.36) {
    const pts = [], n = 12, cs = Math.cos(rot), sn = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU; let d = Math.abs(a - Math.PI * 1.5); d = Math.min(d, TAU - d);
      const k = 1 - notch * Math.exp(-Math.pow(d / 0.6, 2)), px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k;
      pts.push([x + px * cs - py * sn, y + px * sn + py * cs]);
    }
    smoothClosed(pts);
  }
  function circle(x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); }
  function ell(x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
  /** tapered limb along a quadratic bezier p0 -(pc)-> p1, drawn up to extension e. Returns the tip point. */
  function taper(p0, pc, p1, w0, w1, e = 1, N = 12) {
    const L = [], R = []; let tip = p0;
    for (let i = 0; i <= N; i++) {
      const s = (i / N) * e, m = 1 - s;
      const x = m * m * p0[0] + 2 * m * s * pc[0] + s * s * p1[0], y = m * m * p0[1] + 2 * m * s * pc[1] + s * s * p1[1];
      let dx = 2 * m * (pc[0] - p0[0]) + 2 * s * (p1[0] - pc[0]), dy = 2 * m * (pc[1] - p0[1]) + 2 * s * (p1[1] - pc[1]);
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = lerp(w0, w1, Math.pow(i / N, 0.7)) / 2;
      L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]); tip = [x, y];
    }
    c.beginPath(); c.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i <= N; i++) c.lineTo(L[i][0], L[i][1]);
    for (let i = N; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
    c.closePath();
    return tip;
  }

  // ---------- ink ----------
  function st(lw, col) { c.lineWidth = pencil ? Math.max(1.6, lw * 0.5) : lw; c.strokeStyle = col || P.K; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  function stRaw(lw, col) { c.lineWidth = lw; c.strokeStyle = col || P.K; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  function fl(col) { c.fillStyle = col; c.fill(); }
  function fp(pat) { if (pat) { c.fillStyle = pat; c.fill(); } }
  function fpRect(pat, x, y, w, h) { if (pat) { c.fillStyle = pat; c.fillRect(x, y, w, h); } }
  function crescent(pathFn, pat, dx, dy, base) {
    if (!pat) return;
    c.save(); pathFn(); c.clip(); c.fillStyle = pat; c.fillRect(-4000, -4000, 8000, 8000);
    c.translate(dx, dy); pathFn(); c.fillStyle = base; c.fill(); c.restore();
  }
  /** filled + outlined shape. o: {lw, stroke, sh:[dx,dy] drop ink, pat, cres:[pat,dx,dy]} */
  function shape(pathFn, fill, o = {}) {
    if (o.sh && !pencil) { c.save(); c.translate(o.sh[0], o.sh[1]); pathFn(); c.fillStyle = P.K; c.fill(); c.restore(); }
    pathFn(); if (fill) { c.fillStyle = fill; c.fill(); }
    if (o.pat && !pencil) { c.fillStyle = o.pat; c.fill(); }
    if (o.cres && !pencil) crescent(pathFn, o.cres[0], o.cres[1], o.cres[2], fill);
    if (o.lw !== 0) { pathFn(); st(o.lw || 5, o.stroke); }
  }
  /** several overlapping parts drawn as one outlined silhouette */
  function union(parts, fill, lw = 5) {
    for (const p of parts) { p(); st(lw * 2); }
    for (const p of parts) { p(); c.fillStyle = fill; c.fill(); }
  }

  // ---------- comic effects ----------
  function burstPath(x, y, r1, r2, n, rot = 0, seed = 0) {
    c.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (i / (n * 2)) * TAU, r = (i % 2 ? r2 : r1) * (1 + (seed ? 0.16 * (hash(i, seed) - 0.5) : 0));
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath();
  }
  function burst(x, y, r1, r2, n, o = {}) {
    if (r1 < 0.5) return;
    shape(() => burstPath(x, y, r1, r2, n, o.rot || 0, o.seed || 0), o.fill || P.Y, { lw: o.lw == null ? 3.5 : o.lw, sh: o.sh });
  }
  /** parallel speed lines trailing behind a point moving in direction ang */
  function speedLines(x, y, ang, len, n = 3, gap = 9, lw = 3.5) {
    if (len < 3) return;
    c.save(); c.translate(x, y); c.rotate(ang);
    for (let i = 0; i < n; i++) { const off = (i - (n - 1) / 2) * gap, l = len * (1 - 0.28 * Math.abs(i - (n - 1) / 2)); c.beginPath(); c.moveTo(-6, off); c.lineTo(-6 - l, off); st(lw); }
    c.restore();
  }
  /** radiating wedge lines around a centre (comic focus lines) */
  function focusLines(x, y, r0, r1, n, seed = 1, col, wdeg = 1.6) {
    c.fillStyle = col || P.K; c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + (hash(i, seed) - 0.5) * (TAU / n) * 0.8, w = (wdeg * Math.PI / 180) * (0.5 + hash(i, seed + 1)), ri = r0 * (1 + 0.5 * hash(i, seed + 2));
      c.moveTo(x + Math.cos(a) * ri, y + Math.sin(a) * ri);
      c.lineTo(x + Math.cos(a - w) * r1, y + Math.sin(a - w) * r1);
      c.lineTo(x + Math.cos(a + w) * r1, y + Math.sin(a + w) * r1);
      c.closePath();
    }
    c.fill();
  }
  /** Bangers sound-effect lettering: thick key outline, drop ink, flat fill */
  function sfx(lines, x, y, size, o = {}) {
    const s = o.s == null ? 1 : o.s; if (s <= 0.01) return;
    c.save(); c.translate(x, y); c.rotate(o.rot == null ? -0.045 : o.rot); c.scale(s, s);
    c.font = `400 ${size}px Bangers`; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    try { c.letterSpacing = (size * (o.track == null ? 0.035 : o.track)).toFixed(1) + 'px'; } catch (e) { /* older engines */ }
    const lh = size * 0.9, ow = size * (o.ow == null ? 0.17 : o.ow);
    lines.forEach((ln, i) => {
      const yy = i * lh, xx = o.indent ? o.indent[i] || 0 : 0;
      if (!pencil) { c.lineWidth = ow; c.strokeStyle = P.K; c.fillStyle = P.K; c.strokeText(ln, xx + size * 0.055, yy + size * 0.07); }
      c.lineWidth = pencil ? 3 : ow; c.strokeStyle = P.K; c.strokeText(ln, xx, yy);
      c.fillStyle = o.fill || P.Y; c.fillText(ln, xx, yy);
    });
    try { c.letterSpacing = '0px'; } catch (e) { /* */ }
    c.restore();
  }

  // ---------- microbes ----------
  function cocci(x, y, n, ang, r, o = {}) {
    const s = o.s == null ? 1 : o.s; if (s <= 0.02) return;
    const dx = Math.cos(ang) * r * 1.75, dy = Math.sin(ang) * r * 1.75;
    for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2, bend = o.bend ? Math.sin(i * 1.3) * r * o.bend : 0; circle(x + dx * k - Math.sin(ang) * bend, y + dy * k + Math.cos(ang) * bend, r * s); fl(o.fill || P.M); st(o.lw || 2.8); }
  }
  function rod(x, y, len, w, ang, o = {}) {
    const s = o.s == null ? 1 : o.s; if (s <= 0.02) return;
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
    c.beginPath(); c.roundRect(-len / 2, -w / 2, len, w, w / 2); fl(o.fill || P.M); st(o.lw || 2.8); c.restore();
  }

  // ---------- cells (no faces; shapes follow standard histology) ----------
  /** neutrophil: small cell, 3–4 lobed nucleus */
  function neutrophil(x, y, r, o = {}) {
    const seed = o.seed || 1, s = o.s == null ? 1 : o.s; if (s <= 0.02) return;
    c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s * (o.sx || 1), s * (o.sy || 1));
    const body = () => blob(0, 0, r, { n: 9, amp: 0.1, seed, ph: o.ph || 0 });
    shape(body, o.dead ? P.K0 : P.Y1, { sh: [r * 0.08, r * 0.12], cres: [HT(o.dead ? 'K' : 'R', 2), -r * 0.3, -r * 0.32], lw: Math.max(3.5, r * 0.15) });
    const nl = 3 + (seed % 2), a0 = -Math.PI / 2 + (hash(seed, 7) - 0.5) * 1.3, sp = nl === 3 ? 1.2 : 0.95, lr = r * (nl === 3 ? 0.3 : 0.26), L = [];
    for (let k = 0; k < nl; k++) { const a = a0 + (k - (nl - 1) / 2) * sp; L.push([Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4 + r * 0.1]); }
    c.beginPath(); L.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); st(r * 0.2);
    for (const p of L) { circle(p[0], p[1], lr); fl(o.dead ? P.K2 : P.B); st(Math.max(2.4, r * 0.09)); }
    const ne = o.eat || 0;
    for (let k = 0; k < ne; k++) { circle(-r * 0.3 + k * r * 0.5, r * 0.5, r * 0.13); fl(P.M); st(2); }
    c.restore();
  }
  /** lymphocyte: small round cell, nucleus nearly fills it; letter = 'T' or 'B' */
  function lymphocyte(x, y, r, letter, o = {}) {
    const s = o.s == null ? 1 : o.s; if (s <= 0.02) return;
    const isT = letter === 'T';
    c.save(); c.translate(x, y); c.scale(s, s);
    const body = () => circle(0, 0, r);
    shape(body, isT ? P.C1 : P.B1, { sh: [r * 0.09, r * 0.12], lw: Math.max(3.5, r * 0.15) });
    const nuc = () => circle(r * 0.04, r * 0.03, r * 0.74);
    shape(nuc, isT ? P.C : P.B, { cres: [HT('K', 2), -r * 0.2, -r * 0.22], lw: Math.max(2.6, r * 0.1) });
    if (letter && !pencil) {
      c.font = `400 ${Math.round(r * 1.2)}px Bangers`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillStyle = isT ? P.K : P.white; c.fillText(letter, r * 0.05, r * 0.45);
    }
    c.restore();
  }
  /** plasma cell: oval, eccentric clock-face (cartwheel) nucleus, pale perinuclear zone */
  function plasma(x, y, r, o = {}) {
    const s = o.s == null ? 1 : o.s; if (s <= 0.02) return;
    c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
    const body = () => { const pts = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU, k = 1 + 0.1 * Math.cos(a); pts.push([Math.cos(a) * r * 1.36 * k, Math.sin(a) * r * 0.98]); } smoothClosed(pts); };
    shape(body, P.B1, { sh: [r * 0.08, r * 0.11], cres: [HT('B', 2), -r * 0.24, -r * 0.3], lw: Math.max(3.5, r * 0.13) });
    ell(r * 0.3, 0, r * 0.26, r * 0.5); fl(P.B0);                                   // pale Golgi zone next to the nucleus
    c.beginPath(); c.arc(r * 0.72, 0, r * 0.52, -0.9, 0.9); st(2.4, P.B);            // rough ER arcs
    c.beginPath(); c.arc(r * 0.6, 0, r * 0.82, -0.6, 0.6); st(2.4, P.B);
    const nx = -r * 0.58, rn = r * 0.6;
    circle(nx, 0, rn); fl(P.white); st(Math.max(2.8, r * 0.1));
    c.fillStyle = P.B;                                                               // clock-face chromatin
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU + 0.3, w = 0.3;
      c.beginPath(); c.moveTo(nx + Math.cos(a) * rn * 0.36, Math.sin(a) * rn * 0.36);
      c.lineTo(nx + Math.cos(a - w) * rn * 0.9, Math.sin(a - w) * rn * 0.9);
      c.arc(nx, 0, rn * 0.9, a - w, a + w); c.closePath(); c.fill();
    }
    circle(nx, 0, rn * 0.17); c.fill();
    c.restore();
  }
  /** macrophage: large, kidney nucleus, vacuoles with engulfed material. o.vac 0..3, o.reach {ang,len,e} */
  function macrophage(x, y, r, o = {}) {
    const seed = o.seed || 3, s = o.s == null ? 1 : o.s; if (s <= 0.02) return;
    c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
    const body = () => blob(0, 0, r, { n: 12, amp: 0.2, seed, ph: o.ph || 0, sx: 1.08, sy: 0.94 });
    const parts = [body];
    if (o.reach && o.reach.e > 0.02) { const a = o.reach.ang, L = o.reach.len; parts.push(() => taper([Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5], [Math.cos(a + 0.35) * L * 0.6, Math.sin(a + 0.35) * L * 0.6], [Math.cos(a) * L, Math.sin(a) * L], r * 0.62, r * 0.2, o.reach.e)); }
    if (!pencil) { c.save(); c.translate(r * 0.06, r * 0.1); body(); c.lineWidth = 5; c.strokeStyle = P.K; c.stroke(); fl(P.K); c.restore(); }
    union(parts, P.P1, 5);
    crescent(body, HT('R', 2), -r * 0.2, -r * 0.24, P.P1);
    for (let k = 0; k < 3; k++) { const a = 0.5 + k * 0.55; c.beginPath(); c.arc(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2, r * 0.66, a - 0.2, a + 0.22); st(2.4, P.R); }
    const V = [[0.44, 0.3, 0.21], [-0.12, 0.5, 0.18], [0.55, -0.2, 0.16]], nv = o.vac || 0;
    V.forEach((v, i) => { const a = clamp(nv - i); if (a <= 0.02) return; circle(v[0] * r, v[1] * r, v[2] * r * a); fl(P.white); st(3); circle(v[0] * r, v[1] * r, v[2] * r * a * 0.45); fl(P.M); st(1.8); });
    shape(() => bean(-r * 0.22, -r * 0.14, r * 0.44, r * 0.31, -0.5), P.B, { lw: 3.5 });
    c.restore();
  }
  /** dendritic cell: stellate body with long tapering arms. arms: [{from?,c,to,w,e,knob}] in panel coords */
  function dendritic(x, y, r, arms, o = {}) {
    const body = () => blob(x, y, r, { n: 9, amp: 0.16, seed: o.seed || 5, ph: o.ph || 0 });
    const tips = [];
    const parts = [];
    arms.forEach((a, i) => { const e = a.e == null ? 1 : a.e; if (e > 0.03) parts.push(() => { tips[i] = taper(a.from || [x, y], a.c, a.to, a.w || r * 0.75, a.tw || 8, e); }); });
    parts.push(body);
    union(parts, P.G1, 5);
    crescent(body, HT('G', 3), -r * 0.24, -r * 0.28, P.G1);
    arms.forEach((a, i) => { if (a.knob && tips[i]) { circle(tips[i][0], tips[i][1], a.knob); fl(P.G1); st(3.2); } });
    shape(() => bean(x - r * 0.05, y, r * 0.5, r * 0.36, o.nrot || 0.4, 0.25), P.B, { lw: 3.5 });
    return tips;
  }
  /** osteoclast: giant multinucleated cell with a ruffled border facing bone (local +y). act 0..1 */
  function osteoclast(x, y, w, h, o = {}) {
    const act = o.act || 0, seed = o.seed || 2, ph = o.ph || 0, sag = o.sag == null ? h * 0.22 : o.sag;
    c.save(); c.translate(x, y); c.rotate(o.rot || 0);
    const body = () => {
      const pts = [], n = 16;
      c.beginPath();
      for (let i = 0; i <= n; i++) { const u = i / n, a = Math.PI + u * Math.PI, bump = 1 + 0.07 * noise1(i * 1.9 + ph, seed); pts.push([Math.cos(a) * w / 2, Math.sin(a) * h * bump]); }
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n; i++) c.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
      c.lineTo(w / 2, 0);
      const m = 22, amp = 5 + 9 * act;                                                // ruffled border
      for (let i = 1; i <= m; i++) { const u = i / m, xx = w / 2 - u * w, base = sag * (1 - Math.pow(2 * u - 1, 2)); c.lineTo(xx + w / m / 2, base + (i % 2 ? amp : 0) * (u > 0.08 && u < 0.92 ? 1 : 0.2)); c.lineTo(xx, base); }
      c.closePath();
    };
    const col = pencil ? P.P1 : Kit.rgba(Kit.mix(INK.P0, INK.R1, act));
    shape(body, col, { sh: [5, 8], cres: [HT('R', act > 0.5 ? 3 : 2), -w * 0.03, -h * 0.2], lw: 5.5 });
    const nn = o.nuc || 6, rn = Math.min(h * 0.19, w * 0.062);
    for (let k = 0; k < nn; k++) { const u = (k + 0.5) / nn, nx = (u - 0.5) * w * 0.72, ny = -h * (0.5 + 0.16 * Math.sin(u * Math.PI) + 0.1 * (hash(k, seed) - 0.5)); circle(nx, ny, rn); fl(P.B1); st(3.2); circle(nx + rn * 0.2, ny + rn * 0.1, rn * 0.3); fl(P.B); }
    for (let k = 0; k < 5; k++) { const u = (k + 0.5) / 5; circle((u - 0.5) * w * 0.6, -h * 0.12 + sag * 0.3, 4 + 3 * hash(k, seed + 3)); fl(P.white); st(2.2); }
    c.restore();
  }
  /** antibody: a bold Y (arms point along -y before rotation) */
  function antibody(x, y, s, rot, o = {}) {
    const k = o.s == null ? 1 : o.s; if (k <= 0.02) return;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
    const p = () => { c.beginPath(); c.moveTo(0, s * 0.95); c.lineTo(0, 0); c.lineTo(-s * 0.62, -s * 0.72); c.moveTo(0, 0); c.lineTo(s * 0.62, -s * 0.72); };
    p(); st(s * 0.44); if (!pencil) { p(); stRaw(s * 0.17, o.col || P.C); }
    c.restore();
  }
  function rbc(x, y, r, rot = 0) { ell(x, y, r, r * 0.62, rot); fl(P.R); st(2.6); ell(x, y, r * 0.45, r * 0.24, rot); fl(P.R1); }
  /** blood vessel as a fat ink stroke with a coloured lumen */
  function vessel(pts, w, o = {}) {
    smoothOpen(pts); stRaw(w + (pencil ? 5 : 11), P.K);
    smoothOpen(pts); stRaw(w, o.fill || P.R1);
    if (!pencil && o.shine !== false) { c.save(); c.translate(0, -w * 0.24); smoothOpen(pts); stRaw(Math.max(2, w * 0.12), P.P0); c.restore(); }
  }
  function fibro(x, y, len, rot) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); c.moveTo(-len / 2, 0); c.quadraticCurveTo(0, -len * 0.14, len / 2, 0); c.quadraticCurveTo(0, len * 0.14, -len / 2, 0); fl(P.M1); st(2.4, P.K2);
    ell(0, 0, len * 0.12, len * 0.06); fl(P.B); c.restore();
  }

  window.Comic = {
    TAU, INK, P, mode, use, isPencil, HT, htGrad,
    smoothClosed, smoothOpen, sample, along, blob, bean, circle, ell, taper,
    st, stRaw, fl, fp, fpRect, crescent, shape, union,
    burstPath, burst, speedLines, focusLines, sfx,
    cocci, rod, neutrophil, lymphocyte, plasma, macrophage, dendritic, osteoclast, antibody, rbc, vessel, fibro,
    get ctx() { return c; },
  };
})();
