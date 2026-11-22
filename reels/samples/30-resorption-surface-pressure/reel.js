/*
 * Sample 30 — Resorption 2/5 · External surface + pressure resorption.  Style: RISOGRAPH DUOTONE PRINT.
 * Three "sheets" come off the stack: 1 SURFACE (micro close-up) · 2 PRESSURE (whole tooth) · 3 summary card.
 * All drawing goes through the two ink plates in riso.js (T = teal, P = fluorescent pink).
 * Pure function of t.  Cells, sizes and timing are schematic (labelled on screen).
 */
(function () {
  'use strict';
  const { W, H, clamp, lerp, seg, ease, noise1 } = Kit;
  const { T, P, SB, sheetBuf, TAU, ink, ko, circ, rr, poly, txt, tw, arrow } = Riso;
  const ctx = Riso.main.ctx;

  const DUR = 22, SL = 0.55, S1E = 8.5, S2E = 17.1, S3E = DUR - 0.45;
  const FT = (px) => `400 ${px}px "Archivo Black"`;
  const FG = (w, px) => `${w} ${px}px "Space Grotesk"`;
  const TAG = 'RESORPTION 2/5 · SURFACE + PRESSURE';
  const ARW = { arw: 1 };
  let PAT = null;

  function buildPatterns() {
    PAT = {
      Tbone: Riso.dots(T, 14, 0.40, 22),
      Trest: Riso.dots(T, 9, 0.36, 22),
      Tfilm: Riso.dots(T, 8, 0.30, 22),
      T50: Riso.dots(T, 8, 0.5, 22),
      Pdecor: Riso.dots(P, 12, 0.22, 68),
      Pdent: Riso.dots(P, 10, 0.20, 68),
      Pmarrow: Riso.dots(P, 10, 0.13, 68),
      Pgum: Riso.dots(P, 9, 0.40, 68),
      Pclock: Riso.dots(P, 9, 0.36, 68),
      P50: Riso.dots(P, 8, 0.5, 68),
      KOtrab: Riso.dots(T, 13, 0.20, 40, '#000'),
    };
  }

  /* ================= shared furniture ================= */
  function regMark(x, y) {
    for (const c of [T, P]) {
      ink(c); c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(x - 26, y); c.lineTo(x + 26, y); c.moveTo(x, y - 26); c.lineTo(x, y + 26); c.stroke();
    }
  }
  function furniture() {
    // halftone "sun" behind the header
    P.fillStyle = PAT.Pdecor; circ(P, 918, 446, 150);
    // corner tag (reversed out of a teal label) + handle
    const fTag = FG(700, 30), w = tw(TAG, fTag, '1px');
    ink(T); rr(T, 64, 238, w + 40, 52, 9); T.fill();
    ko(T, (c) => txt(c, TAG, 84, 275, fTag, { ls: '1px', keep: true }));
    txt(T, '@natebrooksendo', 1016, 273, FG(500, 25), { align: 'right' });
    // printer's marks in the margins (decoration, outside the safe area)
    regMark(540, 150); regMark(540, 1668);
    ink(T); T.lineWidth = 2.5;
    for (const [x, y, sx, sy] of [[36, 204, 1, 1], [1044, 204, -1, 1], [36, 1716, 1, -1], [1044, 1716, -1, -1]]) {
      T.beginPath(); T.moveTo(x, y - sy * 34); T.lineTo(x, y - sy * 8); T.moveTo(x - sx * 30, y); T.lineTo(x - sx * 4, y); T.stroke();
    }
    txt(T, 'FLUO PINK + TEAL · 2-COLOR', 64, 158, FG(500, 22), { ls: '2px' });
    const bx = 64, by = 1648, bs = 40;
    ink(P); P.fillRect(bx, by, bs, bs); P.fillStyle = PAT.P50; P.fillRect(bx + bs, by, bs, bs);
    ink(T); T.fillRect(bx + 2 * bs, by, bs, bs); T.fillStyle = PAT.T50; T.fillRect(bx + 3 * bs, by, bs, bs);
    ink(T); T.fillRect(bx + 4 * bs, by, bs, bs); ink(P); P.fillRect(bx + 4 * bs, by, bs, bs);
    txt(T, 'No. 30', 1016, 1678, FG(500, 22), { align: 'right', ls: '2px' });
  }

  /** CAUSE switch -> CLASTS dial. cause 0..1 (knob), act 0..1 (needle), word '', 'working' or 'stopped' */
  function gauge(cause, act, word, wordIn = 1) {
    const yb = 1486;
    txt(T, 'CAUSE', 64, yb, FG(700, 32), { ls: '2px' });
    const px = 204, pw = 132, ph = 64, py = 1440, kr = 21;
    const kx = px + ph / 2 + cause * (pw - ph), ky = py + ph / 2;
    if (cause > 0.02) { P.save(); rr(P, px, py, pw, ph, ph / 2); P.clip(); ink(P); P.fillRect(px, py, kx - px + ph / 2, ph); P.restore(); }
    ink(T); T.lineWidth = 6; rr(T, px, py, pw, ph, ph / 2); T.stroke();
    ko(P, (c) => circ(c, kx, ky, kr + 3));
    ink(T); circ(T, kx, ky, kr);
    ko(T, (c) => circ(c, kx, ky, 7));
    txt(T, cause > 0.5 ? 'ON' : 'OFF', px + pw + 18, yb + 3, FT(40));
    // connector
    ink(T); T.lineWidth = 6; T.beginPath(); T.moveTo(470, 1472); T.lineTo(498, 1472); T.stroke();
    poly(T, [[496, 1457], [518, 1472], [496, 1487]]); T.closePath(); T.fill();
    // dial
    const cx = 634, cy = 1532, R = 104, r = 70, split = Math.PI * 1.55;
    const band = (c, a0, a1) => { c.beginPath(); c.arc(cx, cy, R, a0, a1); c.arc(cx, cy, r, a1, a0, true); c.closePath(); c.fill(); };
    T.fillStyle = PAT.Trest; band(T, Math.PI, split);
    ink(P); band(P, split, TAU);
    ink(T); T.lineWidth = 5; T.lineCap = 'butt';
    T.beginPath(); T.arc(cx, cy, R, Math.PI, TAU); T.stroke();
    T.beginPath(); T.arc(cx, cy, r, Math.PI, TAU); T.stroke();
    for (let k = 0; k <= 6; k++) { const a = Math.PI + k * Math.PI / 6; T.beginPath(); T.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); T.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); T.stroke(); }
    T.lineCap = 'round';
    const ang = Math.PI * (1.07 + 0.86 * clamp(act));
    const ux = Math.cos(ang), uy = Math.sin(ang);
    for (const c of [T, P]) { ink(c); poly(c, [[cx - uy * 9, cy + ux * 9], [cx + ux * 96, cy + uy * 96], [cx + uy * 9, cy - ux * 9]]); c.closePath(); c.fill(); circ(c, cx, cy, 15); }
    ko(T, (c) => circ(c, cx, cy, 5)); ko(P, (c) => circ(c, cx, cy, 5));
    // label + state
    txt(T, 'CLASTS', 756, 1470, FG(700, 32), { ls: '2px' });
    if (word && wordIn > 0) {
      const f = FT(34), ww = tw(word, f);
      for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(744, 1476, (ww + 30) * wordIn, 56); c.clip(); }
      if (word === 'working') { ink(P); rr(P, 746, 1482, ww + 22, 46, 8); P.fill(); }
      txt(T, word, 757, 1518, f);
      T.restore(); P.restore();
    }
  }

  /** two-line caption under the picture; parts: 'text' | ARW | {s, hl, font} */
  function caption(t, tin, tout, lines, px = 60) {
    const b = seg(t, tin, tin + 0.34, ease.out), a = seg(t, tout - 0.26, tout, ease.in);
    if (b <= 0 || a >= 1) return;
    const X = 64, ys = [1304, 1378];
    const L = lines.map((parts) => { let x = 0; const items = []; for (const p of parts) { if (p === ARW) { items.push({ arw: 1, x: x + 16, w: 62 }); x += 96; } else { const s = typeof p === 'string' ? p : p.s, font = p.font || FT(px), w = tw(s, font); items.push({ s, x, w, font, hl: p.hl }); x += w; } } return items; });
    for (const c of [T, P]) {
      c.save(); c.beginPath(); c.rect(40 + 990 * a, 1232, 990 * (b - a), 168); c.clip();
      L.forEach((items, i) => items.forEach((it) => {
        const y = ys[i];
        if (it.arw) { if (c === P) { ink(P); arrow(P, X + it.x, y - px * 0.34, X + it.x + it.w, y - px * 0.34, 16, 46, 30); } }
        else if (c === T) txt(T, it.s, X + it.x, y, it.font);
        else if (it.hl) { ink(P); rr(P, X + it.x - 8, y - px * 0.32, it.w + 16, px * 0.5, 8); P.fill(); }
      }));
      c.restore();
    }
  }
  function sourceLine(t, tin, tout, s) {
    const b = seg(t, tin, tin + 0.3, ease.out), a = seg(t, tout - 0.25, tout, ease.in);
    if (b <= 0 || a >= 1) return;
    T.save(); T.beginPath(); T.rect(40 + 930 * a, 1544, 930 * (b - a), 36); T.clip();
    txt(T, s, 64, 1570, FG(500, 24)); T.restore();
  }
  const schematic = (x = 950, y = 1570) => txt(T, 'schematic · not to scale', x, y, FG(500, 24), { align: 'right' });

  /** big section numeral + word */
  function header(num, word, r) {
    if (r <= 0) return;
    for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(40, 296, 1010 * r, 296); c.clip(); }
    const fN = FT(250), by = 548;
    txt(P, num, 58, by, fN);
    T.save(); T.font = fN; ink(T); T.lineWidth = 7; T.lineJoin = 'round'; T.strokeText(num, 58 + 8, by + 7); T.restore();
    const nx = 58 + tw(num, fN) + 38;
    txt(T, word, nx, 470, FT(96));
    txt(T, 'resorption', nx + 4, 538, FG(600, 52));
    T.restore(); P.restore();
  }
  function chipLabel(s, x, y, align) {
    const f = FG(700, 30), w = tw(s, f, '1px'), x0 = align === 'right' ? x - w : x;
    for (const c of [T, P]) ko(c, (k) => { rr(k, x0 - 12, y - 34, w + 24, 48, 9); k.fill(); });
    txt(T, s, x0, y, f, { ls: '1px' });
  }

  /* ================= SHEET 1 · surface resorption (micro close-up of the root surface) ================= */
  const M = { Y0: 598, Y1: 1215, yB: 728, yS: 915, yC: 995 };
  const CL = [{ x: 392, w: 80, d: 46 }, { x: 560, w: 90, d: 60 }, { x: 728, w: 78, d: 50 }];
  const KN = { x: 560, y: 880 };
  const lacD = (k, x) => { const u = (x - CL[k].x) / CL[k].w; return Math.abs(u) >= 1 ? 0 : CL[k].d * Math.pow(1 - u * u, 0.7); };
  const waveB = (x) => M.yB + 3 * Math.sin(x / 61) + 2 * Math.sin(x / 23);
  const cdj = (x) => M.yC + 4 * Math.sin(x / 85) + 2.5 * Math.sin(x / 31 + 1);
  const bez = (p0, p1, p2, p3, s) => { const m = 1 - s, a = m * m * m, b = 3 * m * m * s, c = 3 * m * s * s, d = s * s * s; return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]; };
  const FIB = (() => { const R = Kit.rng(31), a = [], N = 54; for (let i = 0; i < N; i++) { const xb = -70 + i * (W + 150) / N + (R() - 0.5) * 9 + (i % 3 === 0 ? 6 : 0); a.push({ xb, xc: xb + 84 + (R() - 0.5) * 10, j1: (R() - 0.5) * 22, j2: (R() - 0.5) * 22, lw: 2.8 + R() * 1.4, fr: 0.34 + R() * 0.2 }); } return a; })();
  const CB = (() => { const R = Kit.rng(77), a = []; for (let x = 14; x < W + 20; x += 41) a.push({ x: x + (R() - 0.5) * 8, h: R() }); return a; })();
  const MARROW = [[118, 656, 80, 30, -0.1], [378, 668, 92, 27, 0.08], [644, 654, 72, 31, -0.05], [912, 666, 98, 29, 0.1]];
  const VES = [[246, 806, 36], [934, 800, 30]];

  function s1(t) {
    const st = {
      e: CL.map((c, k) => seg(t, 3.4 + k * 0.12, 5.0 + k * 0.06, ease.inOut)),
      f: CL.map((c, k) => 0.9 * seg(t, 6.3 + k * 0.12, 8.0 + k * 0.06, ease.inOut)),
      app: CL.map((c, k) => seg(t, 2.85 + k * 0.12, 3.4 + k * 0.12, ease.outBack)),
      leave: CL.map((c, k) => seg(t, 5.25 + k * 0.12, 6.0 + k * 0.12, ease.inOut)),
      tear: seg(t, 2.08, 2.5, ease.out) * (1 - seg(t, 7.0, 8.3, ease.inOut)),
      knock: seg(t, 2.0, 2.22, ease.outBack) * (1 - seg(t, 2.62, 2.92, ease.in)),
    };
    st.surf = (x) => { let y = M.yS; for (let k = 0; k < 3; k++) y += st.e[k] * lacD(k, x) * (1 - st.f[k]); return y; };
    return st;
  }

  function clastPath(cx, cy, a, h, bd, ph, sc) {
    const p = new Path2D(), n = 26;
    p.moveTo(cx - a * sc, cy);
    p.bezierCurveTo(cx - a * sc * 1.04, cy - h * 1.32 * sc, cx + a * sc * 1.04, cy - h * 1.32 * sc, cx + a * sc, cy);
    for (let i = 1; i < n; i++) { const u = 1 - 2 * i / n, yy = bd * Math.pow(1 - u * u, 0.7) + 3.2 * Math.sin(i * 2.1 + ph) * Math.min(1, (1 - u * u) * 3); p.lineTo(cx + a * u * sc, cy + yy * sc); }
    p.closePath(); return p;
  }

  function micro(t) {
    const { Y0, Y1, yB, yS } = M, st = s1(t);
    for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(0, Y0, W, Y1 - Y0); c.clip(); }

    /* bone: coarse teal screen, marrow spaces, bundle-bone edge */
    T.fillStyle = PAT.Tbone; T.fillRect(0, Y0, W, yB - Y0);
    for (const m of MARROW) {
      ko(T, (c) => { c.beginPath(); c.ellipse(m[0], m[1], m[2], m[3], m[4], 0, TAU); c.fill(); });
      ink(T); T.lineWidth = 5; T.beginPath(); T.ellipse(m[0], m[1], m[2], m[3], m[4], 0, TAU); T.stroke();
      P.fillStyle = PAT.Pmarrow; P.beginPath(); P.ellipse(m[0], m[1], m[2] - 5, m[3] - 5, m[4], 0, TAU); P.fill();
    }
    ink(T); T.beginPath(); T.moveTo(-10, yB - 15);
    for (let x = W + 10; x >= -10; x -= 18) T.lineTo(x, waveB(x));
    T.lineTo(-10, yB - 15); T.lineTo(W + 10, yB - 15); T.closePath(); T.fill();
    T.fillRect(0, Y0, W, 7);

    /* dentin: light pink screen + teal tubules */
    P.fillStyle = PAT.Pdent; P.beginPath(); P.moveTo(-10, Y1 + 5);
    for (let x = -10; x <= W + 10; x += 18) P.lineTo(x, cdj(x) - 1);
    P.lineTo(W + 10, Y1 + 5); P.closePath(); P.fill();
    ink(T); T.lineWidth = 2.3;
    for (let i = 0; i < 44; i++) { const x0 = -30 + i * 26.5 + 5 * Math.sin(i * 1.7); T.beginPath(); T.moveTo(x0, cdj(x0)); T.bezierCurveTo(x0 - 9, M.yC + 80, x0 + 15, Y1 - 70, x0 + 5, Y1 + 5); T.stroke(); }
    T.fillRect(0, Y1 - 7, W, 7);

    /* cementum: solid teal, incremental lines knocked out */
    ink(T); T.beginPath(); T.moveTo(-10, yS);
    for (let x = -10; x <= W + 10; x += 18) T.lineTo(x, yS + 1.5 * Math.sin(x / 47));
    for (let x = W + 10; x >= -10; x -= 18) T.lineTo(x, cdj(x));
    T.closePath(); T.fill();
    ko(T, (c) => { c.lineWidth = 2; for (const dy of [28, 54]) { c.beginPath(); for (let x = -10; x <= W + 10; x += 16) c.lineTo(x, yS + dy + 3 * Math.sin(x / 70 + dy)); c.stroke(); } });

    /* lacunae (knocked out of the cementum) and the new cementum that relines them (overprint = dark) */
    for (let k = 0; k < 3; k++) {
      const e = st.e[k], f = st.f[k], c0 = CL[k]; if (e <= 0) continue;
      const top = [], floor = [], lvl = [];
      for (let i = 0; i <= 32; i++) { const x = c0.x - c0.w + 2 * c0.w * i / 32, d = e * lacD(k, x); top.push([x, yS - 5]); floor.push([x, yS + d]); lvl.push([x, yS + d * (1 - f)]); }
      ko(T, (c) => { poly(c, [...top, ...floor.slice().reverse()]); c.closePath(); c.fill(); });
      if (f > 0.01) for (const c of [T, P]) { ink(c); poly(c, [...lvl, ...floor.slice().reverse()]); c.closePath(); c.fill(); }
    }

    /* PDL fibres (torn over the injured patch, re-attached at the end) */
    ink(T);
    for (const fb of FIB) {
      const zone = Math.abs(fb.xc - KN.x) < 264, fr = zone ? 1 - (1 - fb.fr) * st.tear : 1;
      const p0 = [fb.xb, waveB(fb.xb) - 2], p3 = [fb.xc, st.surf(fb.xc) - 2], p1 = [fb.xb + 16 + fb.j1, yB + 66], p2 = [fb.xc - 16 + fb.j2, yS - 66];
      T.lineWidth = fb.lw; T.beginPath();
      for (let i = 0; i <= 14; i++) { const q = bez(p0, p1, p2, p3, fr * i / 14); i ? T.lineTo(q[0], q[1]) : T.moveTo(q[0], q[1]); }
      T.stroke();
    }

    /* vessels */
    VES.forEach((v, vi) => {
      ko(T, (c) => circ(c, v[0], v[1], v[2] + 9));
      P.fillStyle = PAT.Pclock; circ(P, v[0], v[1], v[2]);
      ink(P); P.lineWidth = 9; P.beginPath(); P.arc(v[0], v[1], v[2], 0, TAU); P.stroke();
      for (let j = 0; j < 3; j++) { const a = t * 0.9 + j * TAU / 3 + vi; circ(P, v[0] + Math.cos(a) * v[2] * 0.42, v[1] + Math.sin(a) * v[2] * 0.42, 7); }
    });

    /* cementoblasts lining the root surface */
    for (const cb of CB) {
      const dist = Math.abs(cb.x - KN.x); let p = 1;
      if (dist < 258) { const gone = seg(t, 2.08 + dist / 1100, 2.34 + dist / 1100, ease.in), back = seg(t, 5.95 + cb.h * 0.5, 6.4 + cb.h * 0.5, ease.outBack); p = Math.max(1 - gone, back); }
      if (p <= 0.02) continue;
      const y = st.surf(cb.x) - 9, sl = Math.atan2(st.surf(cb.x + 6) - st.surf(cb.x - 6), 12);
      ink(T); T.beginPath(); T.ellipse(cb.x, y, 14.5 * p, 8.5 * p, sl, 0, TAU); T.fill();
      ko(T, (c) => circ(c, cb.x + 2, y, 3.2 * p));
    }

    /* clast precursors leave the vessel and gather on the denuded patch */
    for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) {
      const u = seg(t, 2.42 + k * 0.1 + j * 0.14, 3.0 + k * 0.1 + j * 0.14, ease.inOut); if (u <= 0 || u >= 1) continue;
      const a = [VES[0][0] + 30, VES[0][1]], b = [CL[k].x + (j ? 22 : -22), yS - 22], m = [(a[0] + b[0]) / 2, 772 - j * 14];
      const x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * m[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * m[1] + u * u * b[1];
      const r = 10 * Math.min(1, u * 5);
      ko(T, (c) => circ(c, x, y, r + 3)); ink(P); circ(P, x, y, r); ink(T); circ(T, x, y, 3.6);
    }

    /* clastic cells: pink, multinucleated (dark = overprint), ruffled border in the lacuna */
    for (let k = 0; k < 3; k++) {
      const sc = st.app[k] * (1 - st.leave[k]); if (sc <= 0.02) continue;
      const c0 = CL[k], e = st.e[k], a = c0.w * 0.92, h = 36, bd = Math.max(6, e * c0.d - 2) * (1 - st.leave[k]);
      const cx = c0.x + 2.5 * Math.sin(t * 5 + k * 2) * e * (1 - st.leave[k]), cy = yS - 3 - 52 * st.leave[k];
      const wob = 1 + 0.03 * Math.sin(t * 7 + k);
      const path = clastPath(cx, cy, a * wob, h / wob, bd, t * 6 + k * 1.7, sc);
      ko(T, (c) => { c.lineWidth = 4; c.fill(path); c.stroke(path); });
      ink(P); P.fill(path);
      ink(T); for (const [nx, ny] of [[-0.5, 0.36], [-0.17, 0.6], [0.18, 0.52], [0.5, 0.3]]) circ(T, cx + a * sc * nx, cy - h * sc * ny, 8.5 * sc);
      if (bd > 22) ko(P, (c) => { circ(c, cx - a * 0.28 * sc, cy + bd * 0.34 * sc, 4.5 * sc); circ(c, cx + a * 0.3 * sc, cy + bd * 0.42 * sc, 3.6 * sc); });
    }

    /* the small injury */
    if (st.knock > 0.01) {
      const R1 = 122 * st.knock;
      const star = (c, grow) => { c.beginPath(); for (let i = 0; i < 24; i++) { const a = 0.2 + i * Math.PI / 12, r = (i % 2 ? R1 * 0.6 : R1 * (i % 4 === 0 ? 1 : 0.84)) + grow; c.lineTo(KN.x + Math.cos(a) * r, KN.y + Math.sin(a) * r); } c.closePath(); c.fill(); };
      ko(T, (c) => star(c, 6)); ink(P); star(P, 0);
      ink(T); T.lineWidth = 11 * st.knock;
      for (let i = 0; i < 3; i++) { const a = 0.35 + i * Math.PI / 3, l = 30 * st.knock; T.beginPath(); T.moveTo(KN.x - Math.cos(a) * l, KN.y - Math.sin(a) * l); T.lineTo(KN.x + Math.cos(a) * l, KN.y + Math.sin(a) * l); T.stroke(); }
    }
    T.restore(); P.restore();

    /* layer labels */
    chipLabel('PDL', 78, 838);
    ko(T, (c) => txt(c, 'cementum', 78, 966, FG(700, 30), { ls: '1px', keep: true }));
    chipLabel('dentin', 78, 1124);
  }

  function clock(t) {
    const a = seg(t, 5.3, 5.65, ease.outBack); if (a <= 0) return;
    const cx = 884, cy = 432, R = 92 * a;
    for (const c of [T, P]) ko(c, (k) => circ(k, cx, cy, R + 9));
    const th = seg(t, 5.65, 8.3, ease.inOut) * TAU * 0.9;
    P.fillStyle = PAT.Pclock; P.beginPath(); P.moveTo(cx, cy); P.arc(cx, cy, R * 0.74, -Math.PI / 2, -Math.PI / 2 + th); P.closePath(); P.fill();
    ink(T); T.lineWidth = 9; T.beginPath(); T.arc(cx, cy, R, 0, TAU); T.stroke();
    T.lineCap = 'butt';
    for (let k = 0; k < 12; k++) { const an = k * TAU / 12, big = k % 3 === 0; T.lineWidth = big ? 8 : 4.5; T.beginPath(); T.moveTo(cx + Math.cos(an) * R * (big ? 0.72 : 0.78), cy + Math.sin(an) * R * (big ? 0.72 : 0.78)); T.lineTo(cx + Math.cos(an) * R * 0.9, cy + Math.sin(an) * R * 0.9); T.stroke(); }
    T.lineCap = 'round';
    const ha = -Math.PI / 2 + th, ux = Math.cos(ha), uy = Math.sin(ha);
    ink(P); poly(P, [[cx - uy * 9, cy + ux * 9], [cx + ux * R * 0.7, cy + uy * R * 0.7], [cx + uy * 9, cy - ux * 9], [cx - ux * 16, cy - uy * 16]]); P.closePath(); P.fill();
    ink(T); circ(T, cx, cy, 10 * a);
    T.save(); T.globalAlpha = clamp(a); txt(T, 'WEEKS', cx, cy + 92 + 44, FG(700, 30), { align: 'center', ls: '3px' }); T.restore();
  }

  function title(t) {
    const out = seg(t, 2.9, 3.15, ease.in); if (out >= 1) return;
    const px = 86, lh = 90, x = 64, y0 = 386, f = FT(px);
    const b = seg(t, 0.12, 0.62, ease.out), w0 = tw('stops', f), wC = tw('cause ', f);
    for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(40 + 1010 * out, 290, 1010 * (1 - out), 304); c.clip(); }
    ink(P);
    const bar = (bx, by, u) => { if (u <= 0) return; rr(P, bx - 10, by - px * 0.8, (w0 + 20) * u, px * 1.02, 10); P.fill(); };
    bar(x, y0 + lh, seg(b, 0, 0.62)); bar(x + wC, y0 + 2 * lh, seg(b, 0.38, 1));
    ['Resorption that', 'stops when the', 'cause stops'].forEach((s, i) => txt(T, s, x, y0 + i * lh, f));
    T.restore(); P.restore();
  }

  function sheet1(t) {
    title(t);
    header('1', 'SURFACE', seg(t, 3.15, 3.55, ease.out));
    micro(t);
    clock(t);
    caption(t, 2.5, 5.45, [['Small injury', ARW], [{ s: 'shallow lacunae', hl: 1 }]]);
    caption(t, 5.45, 99, [['No infection', ARW], ['new cementum in ', { s: 'weeks', hl: 1 }]]);
    const cause = seg(t, 2.02, 2.16, ease.out) * (1 - seg(t, 2.78, 2.96, ease.inOut));
    const up = seg(t, 2.9, 3.6, ease.out), dn = seg(t, 5.25, 6.7, ease.inOut);
    const act = 0.74 * up * (1 - dn) + 0.03 * Math.sin(t * 9) * up * (1 - dn);
    gauge(cause, act, t < 2.95 ? '' : (t < 6.45 ? 'working' : 'stopped'), t < 6.45 ? seg(t, 2.95, 3.2, ease.out) : seg(t, 6.45, 6.7, ease.out));
    sourceLine(t, 2.6, 99, 'Abbott & Lin, Dent Traumatol 2022');
    schematic();
  }

  /* ================= SHEET 2 · pressure resorption (whole tooth) ================= */
  const TO = { cx: 492, cy: 1008 };
  const UV = (() => { const a = -38 * Math.PI / 180; return [Math.cos(a), Math.sin(a)]; })();

  /** tooth outline from a half-width profile. v = distance from the cervix toward the apex. Crown points down. */
  function toothGeom(cx, cy, s, blunt, scoop) {
    const L0 = 385 * s, rw = 74 * s, cw = 90 * s, ch = 196 * s;
    const wall = (v) => rw * (1 - 0.72 * Math.pow(clamp(v / L0), 1.4));
    const vEnd = L0 * (1 - 0.19 * blunt), r = lerp(26, 19, blunt) * s, vb = vEnd - r, A = wall(vb);
    const vq = 0.52 * L0, hq = 66 * s * (0.55 + 0.45 * scoop), dq = 27 * s * scoop;
    const dep = (v) => { const u = (v - vq) / hq; return Math.abs(u) >= 1 ? 0 : dq * Math.pow(1 - u * u, 1.3); };
    const hwR = (v) => wall(v) - dep(v);
    const N = 44, left = [], right = [], cap = [];
    for (let i = 0; i <= N; i++) { const v = vb * i / N; left.push([cx - wall(v), cy - v]); right.push([cx + hwR(v), cy - v]); }
    for (let i = 0; i <= 20; i++) { const th = Math.PI * i / 20; cap.push([cx - A * Math.cos(th), cy - vb - r * Math.sin(th)]); }
    const pts = [...left, ...cap.slice(1, -1), ...right.slice().reverse()];
    const root = new Path2D(), all = new Path2D();
    pts.forEach((p, i) => { if (i) { root.lineTo(p[0], p[1]); all.lineTo(p[0], p[1]); } else { root.moveTo(p[0], p[1]); all.moveTo(p[0], p[1]); } });
    root.closePath();
    all.bezierCurveTo(cx + rw + 14 * s, cy + 0.2 * ch, cx + cw + 4 * s, cy + 0.5 * ch, cx + cw, cy + 0.8 * ch);
    all.quadraticCurveTo(cx + cw - s, cy + ch, cx + cw - 24 * s, cy + ch);
    all.lineTo(cx - cw + 24 * s, cy + ch);
    all.quadraticCurveTo(cx - cw + s, cy + ch, cx - cw, cy + 0.8 * ch);
    all.bezierCurveTo(cx - cw - 4 * s, cy + 0.5 * ch, cx - rw - 14 * s, cy + 0.2 * ch, cx - rw, cy);
    all.closePath();
    // pulp: chamber in the crown, canal tapering to just short of the apex
    const canal = new Path2D(), vC = vb - 10 * s, v0 = -0.44 * ch, cl = [], cr = [];
    const cwf = (v) => {
      if (v < 0) { const q = (v - v0) / -v0; return s * (19 * Math.pow(q, 0.5) + 8 * Math.sin(q * Math.PI)); }
      let w = s * (4 + 15 * Math.pow(1 - v / L0, 1.3));
      if (v > vC - 10 * s) w *= Math.sqrt(Math.max(0, 1 - Math.pow((v - (vC - 10 * s)) / (10 * s), 2)));
      return w;
    };
    for (let i = 0; i <= 44; i++) { const v = v0 + (vC - v0) * i / 44, w = cwf(v); cl.push([cx - w, cy - v]); cr.push([cx + w, cy - v]); }
    [...cl, ...cr.reverse()].forEach((p, i) => (i ? canal.lineTo(p[0], p[1]) : canal.moveTo(p[0], p[1]))); canal.closePath();
    const scoopPts = []; for (let i = 0; i <= 24; i++) { const v = vq - hq + 2 * hq * i / 24; scoopPts.push([cx + hwR(v), cy - v]); }
    return { all, root, canal, cap, scoopPts, hwR, wall, vq, hq, vb, r, A, vEnd, L0, rw, cw, ch, cx, cy, s };
  }
  function canineGeom(tip) {
    const hwc = (a) => (a < 170 ? 80 * Math.pow(Math.sin(Math.min(1, a / 170) * Math.PI / 2), 0.62) : a < 235 ? lerp(80, 60, ease.smooth((a - 170) / 65)) : lerp(60, 34, clamp((a - 235) / 330)));
    const loc = (a, b) => [tip[0] + UV[0] * a - UV[1] * b, tip[1] + UV[1] * a + UV[0] * b];
    const s1_ = [], s2_ = [];
    for (let a = 0; a <= 620; a += 5) { const w = hwc(a); s1_.push(loc(a, w)); s2_.push(loc(a, -w)); }
    const body = new Path2D(); [...s1_, ...s2_.reverse()].forEach((p, i) => (i ? body.lineTo(p[0], p[1]) : body.moveTo(p[0], p[1]))); body.closePath();
    // enamel cap line (DEJ) inside the crown
    const dej = new Path2D();
    for (let a = 26; a <= 232; a += 6) { const w = Math.max(0, hwc(a) - 17) * (a < 60 ? (a - 26) / 34 : 1); const p = loc(a, w); a === 26 ? dej.moveTo(p[0], p[1]) : dej.lineTo(p[0], p[1]); }
    for (let a = 232; a >= 26; a -= 6) { const w = Math.max(0, hwc(a) - 17) * (a < 60 ? (a - 26) / 34 : 1); const p = loc(a, -w); dej.lineTo(p[0], p[1]); }
    dej.closePath();
    return { body, dej, loc };
  }
  function miniClast(x, y, ang, sc, ph) {
    if (sc <= 0.03) return;
    const a = 25 * sc, b = 14.5 * sc, ca = Math.cos(ang), sa = Math.sin(ang), pth = new Path2D(), n = 20;
    for (let i = 0; i < n; i++) { const th = i / n * TAU, k = 1 + 0.11 * Math.sin(th * 5 + ph), lx = Math.cos(th) * a * k, ly = Math.sin(th) * b * k; const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca; i ? pth.lineTo(X, Y) : pth.moveTo(X, Y); }
    pth.closePath();
    ko(T, (c) => { c.lineWidth = 5; c.fill(pth); c.stroke(pth); });
    ink(P); P.fill(pth);
    ink(T); for (const k of [-0.46, 0.02, 0.48]) circ(T, x + ca * a * k, y + sa * a * k, 4.4 * sc);
  }

  function s2(t) {
    const on1 = seg(t, 9.25, 9.6, ease.out), off = seg(t, 13.1, 13.5, ease.inOut), pressing = on1 * (1 - off);
    const pulse = pressing * (0.5 + 0.5 * Math.sin((t - 9.25) * TAU * 1.2 - Math.PI / 2));
    return {
      on1, off, pressing, pulse,
      push: 5 * pressing + 3 * pulse,
      blunt: seg(t, 9.9, 12.9, ease.smooth), scoop: seg(t, 11.3, 13.0, ease.smooth),
      cin: seg(t, 10.0, 10.9, ease.out), cout: seg(t, 13.25, 14.3, ease.inOut),
      on2: seg(t, 10.8, 11.12, ease.outBack) * (1 - off),
      apexCl: (k) => seg(t, 9.6 + k * 0.15, 10.1 + k * 0.15, ease.outBack) * (1 - seg(t, 13.7 + k * 0.2, 14.5 + k * 0.2, ease.inOut)),
      conCl: (k) => seg(t, 10.95 + k * 0.2, 11.4 + k * 0.2, ease.outBack) * (1 - seg(t, 13.8 + k * 0.25, 14.7 + k * 0.25, ease.inOut)),
      lining: seg(t, 14.6, 16.1, ease.inOut),
      wire: seg(t, 13.3, 13.9, ease.inOut), bracket: 1 - seg(t, 13.5, 13.85, ease.in),
    };
  }

  function macro(t) {
    const st = s2(t), { Y0, Y1 } = M, { cx, cy } = TO, crest = cy - 26, pdl = 11;
    const g = toothGeom(cx, cy, 1, st.blunt, st.scoop);              // socket follows the root (bone remodels)
    const gt = toothGeom(cx, cy - st.push, 1, st.blunt, st.scoop);   // the tooth, nudged by the force
    const g0 = toothGeom(cx, cy - st.push, 1, 0, 0);                 // original outline (ghost)
    for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(0, Y0, W, Y1 - Y0); c.clip(); }

    /* bone */
    T.save(); T.beginPath(); T.rect(0, Y0, W, crest - Y0); T.clip();
    T.fillStyle = PAT.Tbone; T.fillRect(0, Y0, W, crest - Y0);
    for (const m of [[120, 700, 74, 30, 0.2], [262, 868, 62, 26, -0.3], [96, 910, 50, 24, 0.1], [300, 668, 46, 22, -0.1], [884, 878, 72, 24, 0.12], [1010, 760, 44, 30, 0.5]]) {
      if (!m[2]) continue;
      ko(T, (c) => { c.beginPath(); c.ellipse(m[0], m[1], m[2], m[3], m[4], 0, TAU); c.fill(); });
      ink(T); T.lineWidth = 5; T.beginPath(); T.ellipse(m[0], m[1], m[2], m[3], m[4], 0, TAU); T.stroke();
      P.fillStyle = PAT.Pmarrow; P.beginPath(); P.ellipse(m[0], m[1], m[2] - 5, m[3] - 5, m[4], 0, TAU); P.fill();
    }
    ink(T); T.fillRect(0, crest - 9, W, 9); T.fillRect(0, Y0, W, 7);
    T.lineWidth = 2 * pdl + 12; T.stroke(g.root);                     // lamina dura
    T.restore();
    ko(T, (c) => { c.save(); c.beginPath(); c.rect(0, Y0, W, crest + 2 - Y0); c.clip(); c.lineWidth = 2 * pdl; c.stroke(g.root); c.fill(g.root); c.restore(); });

    /* impacted canine: position (slides in along its axis, presses, later moves away) */
    const wq = [cx + g.hwR(g.vq), cy - g.vq];
    const gap = 9 + 205 * (1 - st.cin) + 130 * st.cout - 2 * st.pulse * st.cin;
    const tip = [wq[0] + UV[0] * gap, wq[1] + UV[1] * gap], can = canineGeom(tip);
    ko(T, (c) => { c.lineWidth = 28; c.stroke(can.body); c.fill(can.body); });   // crypt

    /* gingiva */
    const gy = (x) => cy + 34 - 44 * Math.exp(-Math.pow((x - cx) / 108, 2));
    P.fillStyle = PAT.Pgum; P.beginPath(); P.moveTo(-10, crest - 12); P.lineTo(W + 10, crest - 12);
    for (let x = W + 10; x >= -10; x -= 14) P.lineTo(x, gy(x));
    P.closePath(); P.fill();
    ink(T); T.lineWidth = 5; T.beginPath(); for (let x = -10; x <= W + 10; x += 14) T.lineTo(x, gy(x)); T.stroke();

    /* the tooth */
    ko(P, (c) => c.fill(gt.all)); ko(T, (c) => c.fill(gt.all));
    P.fillStyle = PAT.Pdent; P.fill(gt.all);
    ko(P, (c) => { c.save(); c.beginPath(); c.rect(0, cy - st.push + 10, W, 400); c.clip(); c.lineWidth = 36; c.stroke(gt.all); c.restore(); });   // enamel
    ink(P); P.fill(gt.canal);                                         // pulp: the same living pink throughout
    ink(T); T.lineWidth = 6; T.stroke(gt.all);

    /* ghost of the original root where it has been lost (dashed, dark) */
    if (st.blunt > 0.04 || st.scoop > 0.04) for (const c of [T, P]) {
      c.save();
      const lost = new Path2D();
      lost.rect(cx - 90, Y0, 180, (gt.cy - gt.vb + 2) - Y0);
      if (st.scoop > 0.04) lost.rect(cx + 8, gt.cy - gt.vq - gt.hq + 8, 90, 2 * gt.hq - 16);
      c.clip(lost);
      const out = new Path2D(); out.rect(0, Y0, W, Y1 - Y0); out.addPath(gt.root); c.clip(out, 'evenodd');
      ink(c); c.lineWidth = 4.5; c.lineCap = 'butt'; c.setLineDash([11, 9]); c.stroke(g0.root); c.restore();
    }
    /* new cementum relining the resorbed surfaces (overprint = dark) */
    if (st.lining > 0.01) for (const c of [T, P]) {
      ink(c); c.lineWidth = 9 * st.lining; c.lineCap = 'round';
      poly(c, gt.cap); c.stroke();
      poly(c, gt.scoopPts.slice(2, -2)); c.stroke();
    }

    /* bracket + archwire */
    const by = cy - st.push + 0.63 * 196;
    if (st.bracket > 0.02) {
      const k = st.bracket, bw = 70 * k, bh = 58 * k;
      ko(P, (c) => { rr(c, cx - bw / 2 - 2, by - bh / 2 - 2, bw + 4, bh + 4, 9 * k); c.fill(); });
      ink(T); rr(T, cx - bw / 2, by - bh / 2, bw, bh, 9 * k); T.fill();
      ko(T, (c) => { c.fillRect(cx - bw / 2 - 1, by - 8 * k, bw + 2, 16 * k); c.fillRect(cx - 4 * k, by - bh / 2 - 1, 8 * k, bh + 2); });
    }
    if (st.wire < 0.99) { T.save(); T.beginPath(); T.rect(0, by - 20, (W + 10) * (1 - st.wire), 40); T.clip(); ink(T); T.lineWidth = 7; T.lineCap = 'butt'; T.beginPath(); T.moveTo(-10, by); T.lineTo(W + 10, by); T.stroke(); T.restore(); }

    /* canine drawn */
    P.fillStyle = PAT.Pdent; P.fill(can.body);
    ko(P, (c) => { c.save(); c.clip(can.body); c.fill(can.dej); c.restore(); });
    P.save(); P.clip(can.dej); P.fillStyle = PAT.Pdent; P.fillRect(0, Y0, W, Y1 - Y0); P.restore();
    ko(P, (c) => { c.save(); c.clip(can.body); c.lineWidth = 15; c.stroke(can.dej); c.restore(); });
    ink(T); T.lineWidth = 6; T.stroke(can.body);

    /* force arrows (pink), teal knocked out beneath */
    if (st.pressing > 0.02) {
      const k = st.pressing, ax = cx - 196, y0 = cy + 196 - 10 * st.pulse, y1 = y0 - 132 * k;
      ko(T, (c) => arrow(c, ax, y0 + 3, ax, y1 - 4, 44, 96, 62 * k));
      ink(P); arrow(P, ax, y0, ax, y1, 36, 86, 56 * k);
      // squeeze marks over the apex
      ink(P); P.lineWidth = 7; P.lineCap = 'round';
      const ay = gt.cy - gt.vb;
      for (let i = 0; i < 2; i++) { const rr_ = gt.r + 30 + i * 17 + 4 * st.pulse; P.globalAlpha = k; P.beginPath(); P.arc(cx, ay, rr_, -Math.PI / 2 - 0.62 + i * 0.12, -Math.PI / 2 + 0.62 - i * 0.12); P.stroke(); }
      P.globalAlpha = 1;
    }
    if (st.on2 > 0.02) {
      const k = st.on2, a0 = can.loc(214 - 8 * st.pulse, 0), a1 = can.loc(214 - 8 * st.pulse - 138 * k, 0);
      ko(T, (c) => arrow(c, a0[0], a0[1], a1[0], a1[1], 40, 90, 56 * k));
      ink(P); arrow(P, a0[0], a0[1], a1[0], a1[1], 34, 82, 52 * k);
    }

    /* clastic cells at the pressed surfaces */
    const ay = gt.cy - gt.vb;
    [-56, 0, 56].forEach((deg, k) => { const ph = deg * Math.PI / 180, sc = st.apexCl(k) * (0.92 + 0.07 * Math.sin(t * 8 + k * 2)); miniClast(cx + (gt.A + 8) * Math.sin(ph), ay - (gt.r + 8) * Math.cos(ph) + 2, ph, sc, t * 7 + k); });
    [0.72, -0.72].forEach((f, k) => { const v = gt.vq + f * gt.hq, sc = st.conCl(k) * (0.92 + 0.07 * Math.sin(t * 8 + k * 2 + 1)); miniClast(cx + gt.hwR(v) + 9, gt.cy - v, Math.PI / 2 + f * 0.25, sc, t * 7 + k + 3); });

    T.restore(); P.restore();
  }

  function labelWipe(t, tin, tout, x, y, w, fn) {
    const b = seg(t, tin, tin + 0.3, ease.out), a = seg(t, tout - 0.25, tout, ease.in);
    if (b <= 0 || a >= 1) return;
    for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(x + w * a, y - 44, w * (b - a), 66); c.clip(); }
    fn(); T.restore(); P.restore();
  }

  function sheet2(t) {
    header('2', 'PRESSURE', 1);
    macro(t);
    labelWipe(t, 9.45, 13.3, 60, 1160, 230, () => txt(T, 'ortho force', 264, 1160, FG(700, 32), { align: 'right', ls: '1px' }));
    labelWipe(t, 10.9, 13.3, 660, 960, 320, () => chipLabel('impacted tooth', 690, 960));
    caption(t, 9.2, 13.15, [[{ s: 'Pressure', hl: 1 }, ' keeps'], ['them working']]);
    caption(t, 13.3, 99, [['Pressure off', ARW, { s: 'it stops.', hl: 1 }], [{ s: 'A shortened root stays short.', font: FG(700, 46) }]], 56);
    const cause = seg(t, 9.28, 9.44, ease.out) * (1 - seg(t, 13.12, 13.3, ease.inOut));
    const up = seg(t, 9.55, 10.3, ease.out), dn = seg(t, 13.7, 15.0, ease.inOut);
    const act = 0.86 * up * (1 - dn) + 0.03 * Math.sin(t * 9) * up * (1 - dn);
    gauge(cause, act, t < 9.6 ? '' : (t < 14.75 ? 'working' : 'stopped'), t < 14.75 ? seg(t, 9.6, 9.85, ease.out) : seg(t, 14.75, 15.0, ease.out));
    sourceLine(t, 9.3, 13.2, 'Fuss et al., Dent Traumatol 2003');
    sourceLine(t, 13.4, 99, 'Patel et al., Int Endod J 2022');
    schematic();
  }

  /* ================= SHEET 3 · summary card ================= */
  function film(x0, y0, w, h, o) {
    const hb = 62, frame = new Path2D(); frame.roundRect(x0, y0, w, h, 20);
    ink(T); T.fill(frame);
    P.save(); P.clip(frame); ink(P); P.fillRect(x0, y0 + hb, w, h - hb); P.restore();
    // title bar
    ko(T, (c) => circ(c, x0 + 38, y0 + hb / 2, 23)); ink(P); circ(P, x0 + 38, y0 + hb / 2, 23);
    txt(T, o.num, x0 + 38, y0 + hb / 2 + 13, FT(36), { align: 'center' });
    ko(T, (c) => { txt(c, o.title, x0 + 74, y0 + 44, FT(34), { keep: true }); if (o.sub) txt(c, o.sub, x0 + 74 + tw(o.title, FT(34)) + 12, y0 + 43, FG(600, 30), { keep: true }); });
    // the radiograph
    const cx = x0 + w / 2, s = 0.66, cyv = y0 + hb + 36 + 385 * s, crest = cyv - 16, top = y0 + hb;
    const g = toothGeom(cx, cyv, s, o.blunt, 0);
    for (const c of [T, P]) { c.save(); c.clip(frame); c.beginPath(); c.rect(x0, top, w, h - hb); c.clip(); }
    ko(P, (c) => c.fillRect(x0, top, w, crest - top));                               // bone = teal only (mid-gray)
    ko(T, (c) => { c.fillStyle = PAT.KOtrab; c.fillRect(x0, top, w, crest - top); });  // trabecular speckle
    T.save(); T.beginPath(); T.rect(x0, top, w, crest - top); T.clip();
    ko(T, (c) => { c.lineWidth = 18; c.stroke(g.root); });                            // lamina dura (bright)
    T.restore();
    for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(x0, top, w, crest - top); c.clip(); ink(c); c.lineWidth = 9; c.stroke(g.root); c.restore(); }   // PDL space (dark)
    ko(P, (c) => c.fill(g.all)); ko(T, (c) => c.fill(g.all));
    T.fillStyle = PAT.Tfilm; T.fill(g.all);
    ko(T, (c) => { c.save(); c.beginPath(); c.rect(x0, cyv + 6, w, 300); c.clip(); c.lineWidth = 24; c.stroke(g.all); c.restore(); });   // enamel (brightest)
    ink(T); T.lineWidth = 3; T.stroke(g.all);
    ko(T, (c) => c.fill(g.canal)); ink(P); P.fill(g.canal);                           // pulp drawn alive
    if (o.bracket) {
      const by = cyv + 0.63 * 196 * s;
      for (const c of [T, P]) ko(c, (k) => { rr(k, cx - 23, by - 19, 46, 38, 6); k.fill(); k.fillRect(x0, by - 3, w, 6); });
    }
    if (o.ring > 0) {
      const ay = cyv - g.vb + 4, a0 = -Math.PI * 0.5, a1 = a0 + TAU * o.ring;
      ko(T, (c) => { c.lineWidth = 15; c.beginPath(); c.arc(cx, ay, 58, a0, a1); c.stroke(); });
      ink(P); P.lineWidth = 9; P.beginPath(); P.arc(cx, ay, 58, a0, a1); P.stroke();
    }
    T.restore(); P.restore();
  }

  function sheet3(t) {
    const f = FT(100);
    ink(P); rr(P, 52, 395 - 84, tw('No', f) + 24, 104, 10); P.fill();
    txt(T, 'No root canal', 64, 395, f); txt(T, 'treatment.', 64, 497, f);
    // pulp line with a "normal" tick
    ink(P); circ(P, 90, 553, 25);
    ink(T); T.lineWidth = 8; T.beginPath(); T.moveTo(78, 554); T.lineTo(87, 564); T.lineTo(104, 542); T.stroke();
    txt(T, 'Pulp tests normal.', 128, 571, FG(700, 50));
    // two radiograph icons
    const fy = 606, fh = 536, fw = 426;
    film(64, fy, fw, fh, { num: '1', title: 'SURFACE', blunt: 0, ring: 0 });
    film(526, fy, fw, fh, { num: '2', title: 'PRESSURE', sub: '· ortho', blunt: 1, bracket: 1, ring: seg(t, 18.45, 18.9, ease.inOut) });
    const fc = FG(700, 36);
    labelWipe(t, 17.8, 99, 64, 1198, fw, () => txt(T, 'X-ray: usually nothing', 64 + fw / 2, 1198, fc, { align: 'center' }));
    labelWipe(t, 18.0, 99, 526, 1198, fw, () => txt(T, 'X-ray: blunted apex', 526 + fw / 2, 1198, fc, { align: 'center' }));
    // call to action
    const fa = FT(54), wa = tw('Remove the cause.', fa), r = seg(t, 18.25, 18.6, ease.out);
    if (r > 0) {
      for (const c of [T, P]) { c.save(); c.beginPath(); c.rect(50, 1236, (wa + 80) * r, 110); c.clip(); }
      ink(P); rr(P, 64, 1242, wa + 48, 92, 14); P.fill();
      txt(T, 'Remove the cause.', 88, 1307, fa);
      T.restore(); P.restore();
    }
    gauge(0, 0, 'stopped', 1);
    sourceLine(t, 0, 99, 'Abbott & Lin, Dent Traumatol 2022; Patel et al., Int Endod J 2022');
    schematic(950, 1396);
  }

  /* ================= sheets, stack and loop ================= */
  const REG = { 1: [3.2, -2.4, 0.0011], 2: [-3.0, 2.6, -0.001], 3: [2.6, 2.8, 0.0009] };
  const reg = (n, t) => ({ dx: REG[n][0] + 0.9 * noise1(t * 0.35, n), dy: REG[n][1] + 0.9 * noise1(t * 0.35 + 40, n), rot: REG[n][2] });
  function drawSheet(n, t) {
    Riso.begin(); furniture();
    if (n === 1) sheet1(t); else if (n === 2) sheet2(t); else sheet3(t);
  }

  function render(t) {
    t = clamp(t, 0, DUR - 1e-4);
    let cur, nxt = 0, sl = 0, tn = 0;
    if (t < S1E) cur = 1;
    else if (t < S1E + SL) { cur = 1; nxt = 2; sl = (t - S1E) / SL; tn = t; }
    else if (t < S2E) cur = 2;
    else if (t < S2E + SL) { cur = 2; nxt = 3; sl = (t - S2E) / SL; tn = t; }
    else if (t < S3E) cur = 3;
    else { cur = 3; nxt = 1; sl = (t - S3E) / (DUR - S3E); tn = 0; }
    if (!nxt) { drawSheet(cur, t); Riso.compose(ctx, reg(cur, t)); return; }
    // the printed sheet on top is pulled away upward, revealing the next print underneath
    drawSheet(nxt, tn); Riso.compose(ctx, reg(nxt, tn));
    drawSheet(cur, t); Riso.compose(SB, reg(cur, t));
    const off = Math.round(ease.inOut(sl) * (H + 40)), edge = H - off;
    if (edge < H) {
      const gr = ctx.createLinearGradient(0, edge, 0, edge + 90);
      gr.addColorStop(0, 'rgba(24,20,56,0.34)'); gr.addColorStop(0.35, 'rgba(24,20,56,0.12)'); gr.addColorStop(1, 'rgba(24,20,56,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, Math.max(0, edge), W, 90);
    }
    ctx.drawImage(sheetBuf, 0, -off);
    if (edge > 0 && edge < H) { ctx.fillStyle = 'rgba(60,44,30,0.35)'; ctx.fillRect(0, edge - 1, W, 2); }
  }

  window.REEL = {
    title: 'Resorption 2/5 · Surface + pressure',
    duration: DUR,
    poster: 20.6,
    canvas: Riso.main.canvas,
    fonts: ['400 86px "Archivo Black"', '700 32px "Space Grotesk"', '600 52px "Space Grotesk"', '500 25px "Space Grotesk"'],
    setup() { Riso.setup(); buildPatterns(); },
    render,
  };
  Kit.boot(window.REEL);
})();
