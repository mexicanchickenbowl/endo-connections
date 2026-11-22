/*
 * panels.js — the six panels of reel 27. Each panel is drawn in its own 900 x 1286 space:
 *   bg()   static artwork (cached once in ink mode)
 *   fg(lt) everything that moves, as a pure function of the panel's local time lt (seconds since the camera arrived)
 *   head() Bangers header
 * All geometry is schematic (not to scale); see NOTES.md.
 */
(function () {
  'use strict';
  const { clamp, lerp, seg, ease, hash, noise1 } = Kit;
  const X = Comic, P = Comic.P, INK = Comic.INK, TAU = Math.PI * 2;
  const PW = 900, PH = 1286;
  const H = (k, l) => X.HT(k, l);
  let c = null;
  function setC(ctx) { c = ctx; X.use(ctx); }
  const poly = (pts, close) => { c.beginPath(); pts.forEach((p, k) => (k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); if (close) c.closePath(); };
  const qb = (p0, pc, p1, s) => { const m = 1 - s; return [m * m * p0[0] + 2 * m * s * pc[0] + s * s * p1[0], m * m * p0[1] + 2 * m * s * pc[1] + s * s * p1[1], Math.atan2(2 * m * (pc[1] - p0[1]) + 2 * s * (p1[1] - pc[1]), 2 * m * (pc[0] - p0[0]) + 2 * s * (p1[0] - pc[0]))]; };
  const pop = (lt, t0, d = 0.35) => ease.outBack(seg(lt, t0, t0 + d));

  /** bone: cream base, key-dot shading, marrow spaces, osteocyte lacunae */
  function boneFill(pathFn, marrow, seed, lw = 5.5) {
    X.shape(pathFn, P.Y0, { lw: 0 });
    c.save(); pathFn(); c.clip();
    X.htGrad('K', 11, 0.785, 0, 0, PW, PH + 200, (x, y) => 0.035 + 0.11 * (0.5 + 0.5 * noise1(x / 120 + y / 160, seed)));
    for (const m of marrow) X.shape(() => X.blob(m[0], m[1], m[2], { n: 9, amp: 0.26, seed: seed + m[0] }), P.P0, { pat: H('R', 1), lw: 3.6 });
    for (let k = 0; k < 90; k++) {
      const x = hash(k, seed, 1) * PW, y = hash(k, seed, 2) * (PH + 100);
      if (marrow.some((m) => Math.hypot(m[0] - x, m[1] - y) < m[2] + 16)) continue;
      X.ell(x, y, 6.5, 2.8, hash(k, seed, 3) * 3.14); X.fl(P.K);
    }
    c.restore();
    if (lw) { pathFn(); X.st(lw); }
  }
  /** small lettered label (ink mode only) */
  function tag(text, x, y, s, o = {}) {
    if (s <= 0.02 || X.isPencil()) return;
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.rot || 0);
    c.font = '700 32px "Comic Neue"'; const w = c.measureText(text).width + 30, h = 50;
    if (o.ptr) { c.beginPath(); c.moveTo(o.ptr[0], o.ptr[1]); c.lineTo(-w * 0.3 - 13, -h / 2 + 4); c.lineTo(-w * 0.3 + 13, -h / 2 + 4); c.closePath(); X.fl(P.white); X.st(4); }
    c.fillStyle = P.K; c.fillRect(-w / 2 + 5, -h / 2 + 6, w, h);
    c.fillStyle = P.white; c.fillRect(-w / 2, -h / 2, w, h); c.lineWidth = 4; c.strokeStyle = P.K; c.strokeRect(-w / 2, -h / 2, w, h);
    if (o.ptr) { c.fillStyle = P.white; c.fillRect(-w * 0.3 - 10, -h / 2 - 1, 20, 6); }
    c.fillStyle = P.K; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 2);
    c.restore();
  }

  // =====================================================================================
  // 1 · SENSE — dentin tubules + odontoblasts (TLR2 / TLR4)
  // =====================================================================================
  const p1 = (() => {
    const N = 7, X0 = 66, DX = 128, PRE = 592, ODT = 630, LUM = 52;
    const tx = (i, y) => X0 + i * DX + 12 * Math.sin(((y - 120) / 480) * Math.PI * 1.1 + i * 0.85);
    const tipY = (i) => 322 + 54 * hash(i, 3);
    const botY = (i) => 872 + (i % 2 ? 16 : -12);
    const yc = (x) => 132 + 24 * noise1(x / 55, 9);
    const wall = (i, sg, y0, y1, n = 16) => { const a = []; for (let k = 0; k <= n; k++) { const y = lerp(y0, y1, k / n); a.push([tx(i, y) + (sg * LUM) / 2, y]); } return a; };
    const pw = (i, y) => lerp(26, 11, clamp((ODT + 4 - y) / (ODT + 4 - tipY(i)))) / 2;      // half-width of the process
    const actT = (i, k) => 0.82 + 0.075 * ((i * 3 + k * 4) % 7);

    function bg() {
      c.fillStyle = P.Y1; c.fillRect(0, 0, PW, PRE);
      X.htGrad('R', 10, 0.32, 0, 100, PW, PRE, (x, y) => clamp(0.3 - (y - 110) / 1000, 0, 0.34));
      c.fillStyle = P.Y0; c.fillRect(0, PRE, PW, 70);
      c.fillStyle = P.M0; c.fillRect(0, ODT + 22, PW, PH - ODT);
      X.fpRect(H('M', 1), 0, ODT + 22, PW, PH - ODT);
      X.vessel([[-30, 1004], [190, 962], [450, 1002], [700, 954], [930, 986]], 30);
      for (let k = 0; k < 7; k++) X.rbc(60 + k * 130, 990 - 30 * Math.sin((60 + k * 130) / 150 + 1.1) + (k % 2 ? 6 : -6) - 8, 13, 0.2 * (k % 3 - 1));
      for (let k = 0; k < 9; k++) X.fibro(60 + k * 100 + 40 * hash(k, 1), 912 + 40 * hash(k, 2) + (k % 2) * 110, 62, (hash(k, 4) - 0.5) * 0.9);
      for (let i = 0; i < N; i++) {
        const L = wall(i, -1, -10, ODT + 8), R = wall(i, 1, -10, ODT + 8);
        poly(L.concat(R.slice().reverse()), true); X.fl(P.white);
        poly(L); X.st(4); poly(R); X.st(4);
      }
      for (let i = -1; i < N; i++) {
        const xa = i < 0 ? -10 : tx(i, PRE) + LUM / 2, xb = i >= N - 1 ? PW + 10 : tx(i + 1, PRE) - LUM / 2;
        c.beginPath(); c.moveTo(xa, PRE); c.quadraticCurveTo((xa + xb) / 2, PRE + 9, xb, PRE); X.st(3, P.K2);
      }
      const car = () => { c.beginPath(); c.moveTo(-10, -10); c.lineTo(PW + 10, -10); for (let x = PW + 10; x >= -10; x -= 18) c.lineTo(x, yc(x)); c.closePath(); };
      X.shape(car, P.BR, { pat: H('K', 2), lw: 5 });
      for (let k = 0; k < 46; k++) {
        const x = 20 + hash(k, 11) * 860, y = 16 + hash(k, 12) * (yc(x) - 44), a = hash(k, 13) * 3.14;
        if (k % 3) X.cocci(x, y, 2 + (k % 3), a, 8.5); else X.rod(x, y, 34, 13, a);
      }
    }

    function odonto(i, alarm) {
      const cx = X0 + i * DX, nx = tx(i, ODT), bot = botY(i), tip = tipY(i);
      const body = () => {
        c.beginPath(); c.moveTo(nx - 13, ODT - 3); c.bezierCurveTo(nx - 16, ODT + 24, cx - 55, ODT + 8, cx - 56, ODT + 54);
        c.lineTo(cx - 56, bot - 42); c.quadraticCurveTo(cx - 54, bot, cx, bot + 2); c.quadraticCurveTo(cx + 54, bot, cx + 56, bot - 42);
        c.lineTo(cx + 56, ODT + 54); c.bezierCurveTo(cx + 55, ODT + 8, nx + 16, ODT + 24, nx + 13, ODT - 3); c.closePath();
      };
      const proc = () => {
        const n = 14, L = [], R = [];
        for (let k = 0; k <= n; k++) { const y = lerp(ODT + 6, tip, k / n), w = pw(i, y); L.push([tx(i, y) - w, y]); R.push([tx(i, y) + w, y]); }
        c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (let k = 1; k <= n; k++) c.lineTo(L[k][0], L[k][1]);
        c.quadraticCurveTo(tx(i, tip), tip - 16, R[n][0], R[n][1]); for (let k = n - 1; k >= 0; k--) c.lineTo(R[k][0], R[k][1]); c.closePath();
      };
      const fill = X.isPencil() ? P.C1 : Kit.rgba(Kit.mix(INK.C1, INK.C, 0.34 * alarm));
      X.union([proc, body], fill, 5);
      X.crescent(body, H('C', 3), -15, -8, fill);
      X.shape(() => X.ell(cx, bot - 84 - (i % 2) * 22, 30, 42), P.B, { lw: 3.5 });
      X.circle(cx + 8, bot - 92 - (i % 2) * 22, 7); X.fl(P.B1);
    }
    function receptor(px, py, sg, lit, flash, rot) {
      const cx = px + sg * 19;
      if (lit > 0.02 && !X.isPencil()) {
        if (flash > 0.04) { c.save(); c.globalAlpha = Math.min(1, flash * 1.6); X.focusLines(cx, py, 40, 40 + 34 * flash + 14, 9, 3 + rot * 10, P.K, 3.2); c.restore(); }
        X.burst(cx, py, (25 + 13 * flash) * lit, (12.5 + 4 * flash) * lit, 8, { rot, lw: 3.2 });
      }
      c.beginPath(); c.moveTo(px - sg * 2, py); c.lineTo(px + sg * 10, py);
      if (sg > 0) { c.moveTo(cx, py + 9); c.arc(cx, py, 9, Math.PI / 2, Math.PI * 1.5); } else { c.moveTo(cx, py - 9); c.arc(cx, py, 9, -Math.PI / 2, Math.PI / 2); }
      X.st(8.5);
      if (lit > 0.5 && !X.isPencil()) X.stRaw(3.4, P.white);
    }

    function fg(lt) {
      const alarm = seg(lt, 1.3, 1.6);
      // bacteria move down the tubules
      for (let i = 0; i < N; i++) for (let j = 0; j < 3; j++) {
        const h1 = hash(i, j, 21), yT = [170 + 38 * h1, 232 + 40 * h1, 282 + 26 * h1][j];
        if (j === 2 && (hash(i, 22) < 0.45 || yT > tipY(i) - 30)) continue;
        const y = lerp(yT - 150 - 40 * j, yT, ease.out(seg(lt, 0.02 + 0.08 * j, 0.95 + 0.1 * j)));
        const x = tx(i, y) + (hash(i, j, 23) - 0.5) * 12, a = Math.PI / 2 + (hash(i, j, 24) - 0.5) * 0.9;
        if ((i * 2 + j) % 3) X.cocci(x, y, 2 + ((i + j) % 2), a, 8.5, { bend: 0.4 }); else X.rod(x, y, 32, 13, a);
      }
      for (let i = 0; i < N; i++) odonto(i, alarm);
      // receptors on the processes + bacterial products arriving
      for (let i = 0; i < N; i++) for (let k = 0; k < 2; k++) {
        const yr = tipY(i) + 58 + k * 88, sg = (k ? -1 : 1) * (i % 2 ? -1 : 1), ta = actT(i, k), px = tx(i, yr) + sg * pw(i, yr);
        const lit = seg(lt, ta, ta + 0.12), flash = lit * (1 - seg(lt, ta + 0.1, ta + 0.6));
        receptor(px, yr, sg, lit, flash, 0.2 + 0.3 * hash(i, k, 5));
        for (let w = 0; w < 4; w++) {
          const arrive = w < 3 ? ta + 0.42 * w : 2.45 + 0.1 * k, cap = w < 3 ? 1 : 0.3 + 0.45 * hash(i, k, 7);
          const u = Math.min(seg(lt, arrive - 0.55, arrive), cap); if (u <= 0 || u >= 1) continue;
          const y = lerp(250 + 8 * w, yr, u), x = tx(i, y) + sg * (LUM / 2 - 9) * ease.out(Math.min(1, u * 3));
          X.circle(x, y, 5.5); X.fl(P.M); X.st(2);
        }
      }
      // odontoblasts answer: signal dots released toward the pulp
      for (let i = 0; i < N; i++) for (let k = 0; k < 5; k++) {
        const t0 = 1.4 + 0.11 * k + 0.05 * (i % 4), u = seg(lt, t0, t0 + 0.9); if (u <= 0) continue;
        const e = ease.out(u), x = X0 + i * DX + (hash(i, k, 31) - 0.5) * 96 * e, y = botY(i) + 10 + (36 + 150 * hash(i, k, 32)) * e;
        X.circle(x, y, 6.5 * Math.min(1, u * 5)); X.fl(P.C); X.st(2.4);
      }
    }
    return { bg, fg, head: (lt) => X.sfx(['SENSE!'], 62, 138, 124, { s: pop(lt, 0.05) }) };
  })();

  // =====================================================================================
  // 2 · RALLY — dendritic cells sample; T cells, macrophages, neutrophils move in
  // =====================================================================================
  const p2 = (() => {
    const PRE = 250, ODT = 284, BRX = 600;
    const front = (x, G) => 78 + 30 * noise1(x / 60, 5) + G * (28 + 222 * Math.exp(-Math.pow((x - BRX) / 165, 2)));
    const ven = [[-30, 1012], [220, 985], [470, 950], [700, 925], [930, 890]];
    let venS = null;
    const bact = [];
    for (let k = 0; k < 84; k++) bact.push([hash(k, 31) * 900, 14 + hash(k, 32) * 320, hash(k, 33) * 3.14, k % 3]);
    const DC = [250, 600];
    const A1 = { c: [196, 420], to: [231, 196] }, A2 = { c: [345, 440], to: [329, 214] };

    function bg() {
      c.fillStyle = P.Y1; c.fillRect(0, 0, PW, PRE);
      X.htGrad('R', 10, 0.32, 0, 0, PW, PRE, (x, y) => clamp(0.26 - y / 900, 0, 0.3));
      for (let k = -1; k < 19; k++) {
        const x0 = k * 50 + 22;
        c.beginPath(); c.moveTo(x0 + 34, -5); c.lineTo(x0, PRE + 20); X.stRaw(13, P.white);
        c.beginPath(); c.moveTo(x0 + 27, -5); c.lineTo(x0 - 7, PRE + 20); c.moveTo(x0 + 41, -5); c.lineTo(x0 + 7, PRE + 20); X.st(2.6, P.K2);
      }
      c.fillStyle = P.Y0; c.fillRect(0, PRE, PW, 40);
      c.beginPath(); for (let x = -10; x <= PW + 10; x += 30) { const y = PRE + 4 * Math.sin(x / 37); if (x < 0) c.moveTo(x, y); else c.lineTo(x, y); } X.st(3, P.K2);
      c.fillStyle = P.M0; c.fillRect(0, ODT + 6, PW, PH); X.fpRect(H('M', 1), 0, ODT + 6, PW, PH);
      for (let k = 0; k < 16; k++) X.fibro(40 + hash(k, 51) * 820, 470 + hash(k, 52) * 380 + (k % 4 === 0 ? 640 - 380 : 0), 58, (hash(k, 53) - 0.5) * 1.2);
      X.vessel(ven, 100);
      const vs = X.sample(ven, 10);
      for (let k = 0; k < 9; k++) { const p = X.along(vs, (k + 0.5) / 9), sgn = k % 2 ? 1 : -1; X.ell(p[0] - Math.sin(p[2]) * sgn * 47, p[1] + Math.cos(p[2]) * sgn * 47, 15, 5.5, p[2]); X.fl(P.B); }
      for (let k = 0; k < 18; k++) {
        const cx = 25 + k * 50, bot = 404 + (k % 2 ? 9 : -5);
        const body = () => {
          c.beginPath(); c.moveTo(cx - 7, ODT - 6); c.bezierCurveTo(cx - 8, ODT + 12, cx - 22, ODT + 6, cx - 22, ODT + 28);
          c.lineTo(cx - 22, bot - 18); c.quadraticCurveTo(cx - 21, bot, cx, bot); c.quadraticCurveTo(cx + 21, bot, cx + 22, bot - 18);
          c.lineTo(cx + 22, ODT + 28); c.bezierCurveTo(cx + 22, ODT + 6, cx + 8, ODT + 12, cx + 7, ODT - 6); c.closePath();
        };
        X.shape(body, P.C1, { lw: 3.6 });
        X.ell(cx, bot - 34 - (k % 2) * 14, 12, 19); X.fl(P.B);
      }
    }

    function fg(lt) {
      const G = ease.inOut(seg(lt, 0.2, 2.4)), ph = lt * 1.4;
      if (!venS) venS = X.sample(ven, 12);
      // red cells drifting along the venule
      for (let k = 0; k < 8; k++) { const p = X.along(venS, ((k / 8 + lt * 0.03) % 1) * 0.96 + 0.02); X.rbc(p[0], p[1] + (k % 2 ? 17 : -17), 18, p[2] + 0.3 * (k % 3 - 1)); }
      // where the front reaches the pulp, the odontoblast layer is lost
      const dz = seg(G, 0.5, 0.95);
      if (dz > 0 && !X.isPencil()) { c.save(); c.globalAlpha = dz; X.shape(() => X.blob(BRX, 356, 96, { n: 10, amp: 0.2, seed: 8, sy: 0.74 }), P.M0, { pat: H('M', 2), lw: 0 }); c.restore(); }
      // carious dentin advancing
      const car = () => { c.beginPath(); c.moveTo(-10, -10); c.lineTo(PW + 10, -10); for (let x = PW + 10; x >= -10; x -= 15) c.lineTo(x, front(x, G)); c.closePath(); };
      X.shape(car, P.BR, { pat: H('K', 2), lw: 5 });
      for (const b of bact) { if (b[1] > front(b[0], G) - 17) continue; if (b[3]) X.cocci(b[0], b[1], 1 + b[3], b[2], 7.5); else X.rod(b[0], b[1], 28, 11, b[2]); }
      // bacteria in the tubules ahead of the front, and the first ones reaching pulp tissue
      [[236, 158], [333, 176], [140, 150], [436, 172]].forEach((p, k) => X.cocci(p[0], p[1], 2, 1.45, 5.2, { s: seg(G, 0.1 + 0.1 * k, 0.3 + 0.1 * k), lw: 2.2 }));
      [[566, 346], [614, 368], [648, 344], [590, 398], [634, 404]].forEach((p, k) => { const a = ease.outBack(seg(G, 0.84 + 0.02 * k, 0.99)); if (k % 2) X.rod(p[0], p[1], 26, 11, k * 0.9, { s: a }); else X.cocci(p[0], p[1], 2, k * 0.8, 7.5, { s: a }); });
      // T cells
      [[112, 772], [222, 812], [402, 770]].forEach((p, k) => { const a = seg(lt, 0.95 + 0.2 * k, 1.4 + 0.2 * k); if (a > 0) X.lymphocyte(p[0], p[1] + 80 * (1 - ease.out(a)), 31, 'T', { s: ease.outBack(a) }); });
      // dendritic cell: two arms reach between the odontoblasts into the tubules
      const e1 = lerp(0.42, 1, ease.out(seg(lt, 0.15, 0.95))), e2 = lerp(0.4, 1, ease.out(seg(lt, 0.3, 1.1)));
      X.dendritic(DC[0], DC[1], 46, [
        { c: A1.c, to: A1.to, w: 34, e: e1, knob: 9 }, { c: A2.c, to: A2.to, w: 32, e: e2, knob: 9 },
        { c: [150, 560], to: [60, 644], w: 30, knob: 7 }, { c: [350, 560], to: [440, 652], w: 30, knob: 7 },
        { c: [272, 690], to: [316, 752], w: 27, knob: 7 }, { c: [176, 508], to: [108, 474], w: 24, knob: 6 },
      ], { ph: ph * 0.4 });
      for (let k = 0; k < 3; k++) { const u = seg(lt, 0.95 + 0.24 * k, 1.75 + 0.24 * k); if (u <= 0 || u >= 1) continue; const p = qb(DC, A1.c, A1.to, 1 - u); X.circle(p[0], p[1], 6.5); X.fl(P.M); X.st(2.4); }
      // macrophage crawls in and engulfs
      const am = ease.out(seg(lt, 1.3, 2.1));
      if (am > 0) X.macrophage(lerp(1010, 776, am), lerp(700, 632, am), 62, { seed: 4, ph, vac: seg(lt, 2.6, 3.4) * 2.4, reach: { ang: 4.07, len: 118, e: seg(lt, 2.0, 2.6) } });
      // neutrophils leave the venule and head for the breach
      const NS = [[430, 962], [520, 948], [620, 936], [470, 958], [700, 928]], NF = [[520, 452], [596, 476], [668, 440], [548, 538], [630, 554]];
      NF.forEach((f, k) => {
        const t0 = 1.85 + 0.17 * k, u = seg(lt, t0, t0 + 0.95); if (u <= 0) return;
        const e = ease.inOut(u), sq = seg(u, 0, 0.32), s0 = NS[k];
        const x = lerp(s0[0], f[0], e) + 24 * Math.sin(e * Math.PI) * (k % 2 ? 1 : -1), y = lerp(s0[1], f[1], e), ang = Math.atan2(f[1] - s0[1], f[0] - s0[0]);
        if (u > 0.12 && u < 0.95) X.speedLines(x - Math.cos(ang) * 30, y - Math.sin(ang) * 30, ang, 60 * Math.sin(Math.PI * u), 3, 11, 3.6);
        X.neutrophil(x, y, 30, { seed: k + 1, ph, rot: (1 - sq) * (ang + Math.PI / 2), sx: lerp(0.62, 1, sq), sy: lerp(1.4, 1, sq), s: ease.out(seg(u, 0, 0.15)), eat: k < 2 ? Math.round(seg(lt, 3.1 + 0.2 * k, 3.4 + 0.2 * k)) : 0 });
      });
    }
    return { bg, fg, head: (lt) => X.sfx(['RALLY!'], 62, 138, 124, { s: pop(lt, 0.05) }) };
  })();

  // =====================================================================================
  // tooth geometry shared by panels 3 and 6 (single-rooted tooth, long section, schematic)
  // =====================================================================================
  const TOOTH = {
    outline(nb) {
      if (!nb) c.beginPath(); c.moveTo(300, 400); c.bezierCurveTo(258, 330, 270, 215, 350, 170); c.quadraticCurveTo(400, 172, 450, 206); c.quadraticCurveTo(500, 172, 550, 170);
      c.bezierCurveTo(630, 215, 642, 330, 600, 400); c.bezierCurveTo(592, 520, 560, 740, 486, 872); c.bezierCurveTo(470, 902, 430, 902, 414, 872); c.bezierCurveTo(340, 740, 308, 520, 300, 400); c.closePath();
    },
    enamel() {
      c.beginPath(); c.moveTo(300, 400); c.bezierCurveTo(258, 330, 270, 215, 350, 170); c.quadraticCurveTo(400, 172, 450, 206); c.quadraticCurveTo(500, 172, 550, 170);
      c.bezierCurveTo(630, 215, 642, 330, 600, 400); c.bezierCurveTo(610, 330, 595, 250, 540, 212); c.quadraticCurveTo(498, 208, 450, 240); c.quadraticCurveTo(402, 208, 360, 212); c.bezierCurveTo(305, 250, 290, 330, 300, 400); c.closePath();
    },
    pulp() {
      c.beginPath(); c.moveTo(396, 272); c.bezierCurveTo(412, 300, 432, 310, 450, 310); c.bezierCurveTo(468, 310, 488, 300, 504, 272); c.bezierCurveTo(528, 320, 512, 390, 490, 425);
      c.bezierCurveTo(484, 560, 474, 740, 463, 878); c.lineTo(450, 897); c.lineTo(437, 878); c.bezierCurveTo(426, 740, 416, 560, 410, 425); c.bezierCurveTo(388, 390, 372, 320, 396, 272); c.closePath();
    },
    caries() { c.beginPath(); c.moveTo(452, 205); c.quadraticCurveTo(500, 174, 548, 172); c.bezierCurveTo(562, 215, 542, 262, 506, 282); c.bezierCurveTo(486, 268, 462, 240, 452, 205); c.closePath(); },
    socket() { c.beginPath(); c.moveTo(280, 470); c.bezierCurveTo(290, 560, 322, 750, 396, 884); c.bezierCurveTo(416, 928, 484, 928, 504, 884); c.bezierCurveTo(578, 750, 610, 560, 620, 470); c.closePath(); },
    bone() {
      c.beginPath(); c.moveTo(-60, 480); c.lineTo(232, 470); c.quadraticCurveTo(268, 450, 280, 470); c.bezierCurveTo(290, 560, 322, 750, 396, 884); c.bezierCurveTo(416, 928, 484, 928, 504, 884);
      c.bezierCurveTo(578, 750, 610, 560, 620, 470); c.quadraticCurveTo(632, 450, 668, 470); c.lineTo(960, 480); c.lineTo(960, PH + 60); c.lineTo(-60, PH + 60); c.closePath();
    },
    ging(m) { const f = (x) => (m ? 900 - x : x); c.beginPath(); c.moveTo(f(-60), 362); c.bezierCurveTo(f(120), 350, f(240), 354, f(296), 376); c.lineTo(f(302), 405); c.lineTo(f(300), 500); c.lineTo(f(-60), 500); c.closePath(); },
  };
  let pulpSeeds = null;
  function initSeeds() {
    const g = document.createElement('canvas').getContext('2d'), save = c; setC(g); TOOTH.pulp(); pulpSeeds = [];
    for (let k = 0; pulpSeeds.length < 58 && k < 1400; k++) {
      const x = 368 + hash(k, 41) * 164, y = 286 + hash(k, 42) * 600, m = 9;
      if (!(g.isPointInPath(x - m, y) && g.isPointInPath(x + m, y) && g.isPointInPath(x, y - m) && g.isPointInPath(x, y + m))) continue;
      if (pulpSeeds.every((s) => Math.hypot(s[0] - x, s[1] - y) > 22)) pulpSeeds.push([x, y, hash(k, 43), hash(k, 44)]);
    }
    if (save) setC(save);
  }
  /** jaw + tooth hard tissues (static). opts.access: draw an access cavity instead of caries */
  function toothBG(marrow, seed, opts = {}) {
    X.shape(TOOTH.socket, P.C0, { lw: 0 });
    X.shape(() => TOOTH.ging(0), P.M1, { cres: [H('M', 3), 0, -16], lw: 5 });
    X.shape(() => TOOTH.ging(1), P.M1, { cres: [H('M', 3), 0, -16], lw: 5 });
    boneFill(TOOTH.bone, marrow, seed);
    // periodontal ligament fibres
    for (let k = 1; k < 13; k++) {
      const s = k / 13, a = qb([300, 400], [318, 640], [414, 872], s), b = qb([280, 470], [300, 660], [396, 884], Math.max(0, s - 0.06));
      if (a[1] < 478) continue;
      c.beginPath(); c.moveTo(a[0] + 2, a[1]); c.lineTo(b[0] + 2, b[1] + 6); c.moveTo(900 - a[0] - 2, a[1]); c.lineTo(900 - b[0] - 2, b[1] + 6); X.st(2.4, P.K2);
    }
    X.shape(() => TOOTH.outline(), P.Y1, { lw: 0 });
    c.save(); TOOTH.outline(); c.clip();
    X.htGrad('R', 10, 0.32, 250, 160, 650, 910, (x, y) => clamp((x - 470) / 620 + 0.03, 0, 0.26));
    c.restore();
    X.shape(TOOTH.enamel, P.white, { cres: [H('C', 2), -11, -7], lw: 4 });
    if (opts.access) {
      c.save(); TOOTH.outline(); c.clip();
      X.shape(() => poly([[410, 150], [490, 150], [480, 318], [420, 318]], true), P.K0, { lw: 0 });
      c.beginPath(); c.moveTo(411, 190); c.lineTo(420, 316); c.moveTo(489, 190); c.lineTo(480, 316); X.st(4);
      c.restore();
    } else {
      X.shape(TOOTH.caries, P.BR, { pat: H('K', 2), lw: 4 });
      [[486, 206, 0.3], [524, 196, 1.2], [508, 236, 2.0], [532, 228, 0.6], [498, 262, 1.5], [474, 224, 2.5]].forEach((b, k) => (k % 2 ? X.cocci(b[0], b[1], 2, b[2], 5.5, { lw: 2.2 }) : X.rod(b[0], b[1], 20, 8.5, b[2], { lw: 2.2 })));
    }
    TOOTH.outline(); X.st(6);
  }

  // =====================================================================================
  // 3 · NECROSIS — the pulp dies from the crown toward the apex; the canal becomes a reservoir
  // =====================================================================================
  const p3 = (() => {
    const marrow = [[92, 612, 44], [180, 772, 36], [84, 905, 48], [205, 1032, 42], [108, 1162, 50], [318, 1152, 38], [812, 600, 42], [742, 752, 38], [824, 892, 50], [704, 1012, 40], [806, 1152, 48], [590, 1142, 40]];
    const DEF = [[452, 470, 3], [446, 606, 4], [452, 730, 5]];
    function bg() {
      c.fillStyle = P.C0; c.fillRect(0, 0, PW, 520);
      X.htGrad('C', 11, 0.32, 0, 0, PW, 500, (x, y) => clamp(0.44 - y / 640, 0, 0.44));
      X.focusLines(450, 300, 240, 1100, 30, 3, P.white, 1.5);
      toothBG(marrow, 31);
      X.vessel([[486, PH + 10], [488, 1130], [446, 1030], [452, 942]], 16, { fill: P.R });
    }
    function fg(lt) {
      const yN = lerp(258, 918, ease.smooth(seg(lt, 0.3, 2.3))), ph = lt * 1.4, wav = (x) => yN + 7 * Math.sin(x / 13 + lt * 5);
      // periapical tissue reacts before the whole pulp is necrotic
      const flush = seg(lt, 1.05, 2.4);
      if (flush > 0) {
        c.save(); c.beginPath(); c.rect(0, 0, PW, PH); TOOTH.outline(true); c.clip('evenodd');
        X.shape(() => X.blob(450, 914, 40 + 52 * ease.out(flush), { n: 12, amp: 0.13, seed: 6, sy: 0.9 }), P.M0, { pat: H('M', 3), lw: 4.5 });
        c.restore();
      }
      c.save(); TOOTH.pulp(); c.clip();
      c.fillStyle = P.M1; c.fillRect(350, 250, 200, 700); X.fpRect(H('M', 3), 350, 250, 200, 700);
      [[[452, 900], [446, 760], [458, 600], [440, 440], [420, 340], [404, 292]], [[448, 900], [458, 720], [460, 500], [480, 350], [498, 294]]].forEach((v) => { X.smoothOpen(v); X.stRaw(X.isPencil() ? 3 : 9.5, P.K); if (!X.isPencil()) { X.smoothOpen(v); X.stRaw(4.6, P.R); } });
      DEF.forEach((d) => { if (yN < d[1] - 6) X.neutrophil(d[0], d[1], 19, { seed: d[2], ph }); });
      // necrotic part (above the advancing front)
      c.save(); c.beginPath(); c.moveTo(340, 240); c.lineTo(560, 240); c.lineTo(560, yN); for (let x = 560; x >= 340; x -= 10) c.lineTo(x, wav(x)); c.closePath(); c.clip();
      c.fillStyle = P.K1; c.fillRect(340, 240, 220, 700); X.fpRect(H('K', 3), 340, 240, 220, 700);
      for (let k = 0; k < 40; k++) { const x = 372 + hash(k, 71) * 156, y = 280 + hash(k, 72) * 610, a = hash(k, 73) * 3.14; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11); X.st(2.6, P.K2); }
      DEF.forEach((d) => { if (yN >= d[1] - 6) X.neutrophil(d[0], d[1], 19, { seed: d[2], dead: true, rot: 0.6 }); });
      for (const s of pulpSeeds) { const a = seg(yN, s[1] + 14, s[1] + 62); if (a <= 0) continue; const e = ease.outBack(a); if (s[2] > 0.62) X.rod(s[0], s[1], 21, 9, s[3] * 3.14, { s: e, lw: 2.3 }); else X.cocci(s[0], s[1], s[2] > 0.3 ? 2 : 1, s[3] * 3.14, 6.2, { s: e, lw: 2.3 }); }
      c.restore();
      if (yN < 905) { c.beginPath(); for (let x = 350; x <= 550; x += 8) { if (x === 350) c.moveTo(x, wav(x)); else c.lineTo(x, wav(x)); } X.st(4.5); }
      c.restore();
      TOOTH.pulp(); X.st(4.5);
      // leukocytes arrive by the blood supply of the bone and stop at the foramen
      const AP = [[[512, 1096], [486, 950]], [[392, 1104], [416, 952]], [[474, 1170], [452, 994]]];
      AP.forEach((p, k) => {
        const t0 = 1.85 + 0.22 * k, u = seg(lt, t0, t0 + 0.85); if (u <= 0) return;
        const e = ease.out(u), b = k < 2 ? Math.sin(seg(lt, t0 + 0.85, t0 + 1.3) * Math.PI) * 10 : 0, ang = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]);
        const x = lerp(p[0][0], p[1][0], e), y = lerp(p[0][1], p[1][1], e) + b;
        if (u < 0.9) X.speedLines(x - Math.cos(ang) * 22, y - Math.sin(ang) * 22, ang, 40 * Math.sin(Math.PI * u), 3, 9, 3);
        X.neutrophil(x, y, 22, { seed: k + 2, ph, s: ease.out(seg(u, 0, 0.2)) });
      });
      const im = pop(lt, 2.75, 0.3);
      if (im > 0 && !X.isPencil()) { X.burst(450, 921, 30 * im, 13 * im, 7, { fill: P.white, rot: 0.3, lw: 3.2 }); }
    }
    return { bg, fg, head: (lt) => X.sfx(['NECROSIS'], 60, 136, 116, { s: pop(lt, 0.05), fill: P.white }) };
  })();

  // =====================================================================================
  // 4 · HOLD THE LINE — the periapical defence: neutrophils, macrophages, T + B cells, plasma cells, antibodies
  // =====================================================================================
  const p4 = (() => {
    const F = [610, 301], LC = [455, 570], RX = 385, RY = 352;
    const root = (nb) => { if (!nb) c.beginPath(); c.moveTo(440, -10); c.bezierCurveTo(455, 120, 520, 240, 585, 292); c.quadraticCurveTo(610, 310, 635, 292); c.bezierCurveTo(700, 240, 765, 120, 780, -10); c.closePath(); };
    const canal = () => { c.beginPath(); c.moveTo(578, -10); c.bezierCurveTo(584, 120, 592, 230, 597, 313); c.lineTo(623, 313); c.bezierCurveTo(628, 230, 636, 120, 642, -10); c.closePath(); };
    const lesion = () => { c.beginPath(); const n = 140; for (let i = 0; i <= n; i++) { const a = (i / n) * TAU, sc = 1 - 0.04 * Math.abs(Math.sin(a * 9)) + 0.03 * noise1(a * 2.2, 4), x = LC[0] + Math.cos(a) * RX * sc, y = LC[1] + Math.sin(a) * RY * sc; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.closePath(); };
    const marrow = [[60, 250, 30], [46, 960, 38], [176, 1030, 44], [424, 1070, 42], [654, 1050, 44], [846, 980, 40], [866, 250, 28], [330, 1190, 48], [566, 1206, 44], [786, 1190, 48], [118, 1170, 42]];
    const LK = [[598, 338], [626, 346], [606, 372], [584, 366], [634, 380], [612, 402]];
    const PL = [[246, 752, -0.5], [484, 772, 0.15], [736, 742, 0.6]];
    function bg() {
      boneFill(() => { c.beginPath(); c.rect(-10, -10, PW + 20, PH + 20); }, marrow, 14, 0);
      X.shape(() => { c.beginPath(); c.moveTo(416, -10); c.bezierCurveTo(430, 132, 498, 258, 575, 312); c.lineTo(645, 312); c.bezierCurveTo(722, 258, 790, 132, 804, -10); c.closePath(); }, P.C0, { lw: 5 });
      X.shape(lesion, P.M0, { pat: H('M', 1), lw: 0 });
      c.save(); lesion(); c.clip();
      X.htGrad('M', 10, 1.25, 50, 200, 860, 940, (x, y) => clamp((Math.hypot((x - LC[0]) / RX, (y - LC[1]) / RY) - 0.7) * 0.95, 0, 0.3));
      for (let k = 0; k < 14; k++) X.fibro(110 + hash(k, 81) * 700, 330 + hash(k, 82) * 520, 56, (hash(k, 83) - 0.5) * 1.6);
      X.vessel([[60, 800], [150, 700], [130, 580], [196, 470]], 20); X.vessel([[850, 760], [800, 640], [826, 540]], 18);
      c.restore();
      lesion(); X.st(6);
      X.shape(() => root(), P.Y1, { lw: 0 });
      c.save(); root(); c.clip();
      X.htGrad('R', 10, 0.32, 430, 0, 790, 320, (x, y) => clamp((x - 610) / 420 + 0.04, 0, 0.3));
      root(); X.stRaw(X.isPencil() ? 0.01 : 22, P.P1);
      c.restore();
      root(); X.st(6);
      X.shape(canal, P.K1, { pat: H('K', 3), lw: 0 });
      c.beginPath(); c.moveTo(578, -10); c.bezierCurveTo(584, 120, 592, 230, 597, 313); c.moveTo(642, -10); c.bezierCurveTo(636, 120, 628, 230, 623, 313); X.st(4.5);
      for (let k = 0; k < 22; k++) { const y = 14 + k * 13.4 + 6 * hash(k, 91), hw = lerp(24, 7, y / 310), x = 610 + (hash(k, 92) - 0.5) * 2 * hw; if (k % 3) X.cocci(x, y, 1 + (k % 2), hash(k, 93) * 3, 6, { lw: 2.3 }); else X.rod(x, y, 19, 8.5, hash(k, 93) * 3, { lw: 2.3 }); }
    }
    function fg(lt) {
      const ph = lt * 1.4;
      // bacteria and fragments leak through the foramen
      LK.forEach((p, k) => { const a = seg(lt, 0.06 + 0.07 * k, 0.4 + 0.07 * k); if (a <= 0) return; const e = ease.out(a), x = lerp(F[0], p[0], e), y = lerp(F[1] + 4, p[1], e); if (k % 2) X.rod(x, y, 24, 10.5, k, { s: e }); else X.cocci(x, y, 2, k * 1.1, 7.2, { s: e }); });
      for (let k = 0; k < 7; k++) { const a = seg(lt, 0.2 + 0.05 * k, 0.6 + 0.05 * k); if (a > 0) { X.circle(F[0] + (hash(k, 95) - 0.5) * 90 * a, F[1] + 26 + hash(k, 96) * 90 * a, 4.2); X.fl(P.M); X.st(1.8); } }
      // neutrophils mass below the foramen
      [14, 44, 74, 106, 136, 166].forEach((deg, k) => {
        const a = (deg * Math.PI) / 180, u = seg(lt, 0.3 + 0.08 * k, 0.9 + 0.08 * k); if (u <= 0) return;
        const R = lerp(340, 134, ease.outBack(u)), x = F[0] + Math.cos(a) * R, y = F[1] + Math.sin(a) * R;
        if (u < 0.8) X.speedLines(x + Math.cos(a) * 30, y + Math.sin(a) * 30, a + Math.PI, 56 * Math.sin(Math.PI * u), 3, 11, 3.6);
        X.neutrophil(x, y, 30, { seed: k + 1, ph, s: ease.out(seg(u, 0, 0.25)), eat: k === 2 || k === 4 ? Math.round(seg(lt, 2.5, 2.8)) : 0 });
      });
      // macrophages
      [[392, 468, 56, 3], [600, 556, 60, 7], [772, 492, 52, 9]].forEach((m, k) => {
        const u = seg(lt, 0.85 + 0.15 * k, 1.5 + 0.15 * k); if (u <= 0) return;
        const e = ease.out(u), dx = m[0] - F[0], dy = m[1] - F[1], d = Math.hypot(dx, dy);
        X.macrophage(m[0] + (dx / d) * 230 * (1 - e), m[1] + (dy / d) * 230 * (1 - e), m[2], { seed: m[3], ph, s: ease.out(seg(u, 0, 0.3)), vac: seg(lt, 2.0 + 0.2 * k, 2.8 + 0.2 * k) * (k === 1 ? 3 : 2) });
      });
      // lymphocytes
      [[215, 512, 'T'], [300, 640, 'T'], [470, 688, 'T'], [732, 652, 'T'], [158, 644, 'B'], [628, 716, 'B']].forEach((p, k) => { const a = seg(lt, 1.3 + 0.09 * k, 1.65 + 0.09 * k); if (a > 0) X.lymphocyte(p[0], p[1], 31, p[2], { s: ease.outBack(a) }); });
      // plasma cells
      PL.forEach((p, k) => { const a = seg(lt, 1.7 + 0.12 * k, 2.1 + 0.12 * k); if (a > 0) X.plasma(p[0], p[1], 40, { rot: p[2], s: ease.outBack(a) }); });
      // antibodies leave the plasma cells and tag what leaks out
      for (let j = 0; j < 3; j++) for (let k = 0; k < 4; k++) {
        const idx = j * 4 + k, t0 = 2.15 + 0.16 * k + 0.07 * j, stick = k < 2, tgt = LK[(idx * 5 + j) % 6];
        const u = Math.min(seg(lt, t0, t0 + 1.0), stick ? 1 : 0.28 + 0.5 * hash(idx, 61)); if (u <= 0) continue;
        const p0 = [PL[j][0] + 20 * Math.cos(PL[j][2]), PL[j][1] - 34], dx = tgt[0] - p0[0], dy = tgt[1] - p0[1], d = Math.hypot(dx, dy);
        const p1 = [tgt[0] - (dx / d) * 24 + (hash(idx, 62) - 0.5) * 16, tgt[1] - (dy / d) * 24 + (hash(idx, 63) - 0.5) * 16];
        const pc = [(p0[0] + p1[0]) / 2 - (dy / d) * 150 * (hash(idx, 64) - 0.5), (p0[1] + p1[1]) / 2 + (dx / d) * 150 * (hash(idx, 64) - 0.5)];
        const q = qb(p0, pc, p1, ease.inOut(u));
        X.antibody(q[0], q[1], 21, q[2] + Math.PI / 2, { s: ease.out(seg(u, 0, 0.12)) });
      }
      tag('mostly IgG', 610, 866, pop(lt, 2.5), { ptr: [-112, -72] });
    }
    return { bg, fg, head: (lt) => X.sfx(['HOLD THE', 'LINE!'], 54, 128, 108, { s: pop(lt, 0.05), indent: [0, 8] }) };
  })();

  // =====================================================================================
  // 5 · THE COST — IL-1, TNF, PGE2, RANKL: osteoclasts resorb bone
  // =====================================================================================
  const p5 = (() => {
    const XO = 450;
    const yF = (x, E) => 700 + E * (94 * Math.exp(-Math.pow((x - XO) / 225, 2)) + 50 * Math.exp(-Math.pow((x - 852) / 80, 2))) + 13 * Math.abs(Math.sin((Math.PI * x) / 78 + 0.5));
    const marrow = [[90, 910, 44], [262, 1014, 42], [472, 972, 46], [692, 1024, 44], [842, 916, 38], [150, 1154, 50], [402, 1184, 46], [642, 1194, 50], [832, 1144, 44]];
    const BL = [['IL-1', 'C'], ['TNF', 'M'], ['PGE', 'Y'], ['RANKL', 'K']];
    const boltPath = () => { poly([[-74, -44], [-50, -90], [-28, -58], [0, -110], [28, -58], [50, -90], [74, -44], [74, 46], [84, 46], [0, 126], [-84, 46], [-74, 46]], true); };
    function bolt(x, y, b, s) {
      if (s <= 0.02) return;
      c.save(); c.translate(x, y); c.scale(s, s);
      X.shape(boltPath, P[b[1]], { sh: [7, 9], lw: 6 });
      if (!X.isPencil()) {
        if (b[1] === 'K') { c.save(); c.scale(0.86, 0.9); boltPath(); X.stRaw(3, P.white); c.restore(); } else X.crescent(boltPath, H(b[1] === 'Y' ? 'R' : 'K', 1), -12, -16, P[b[1]]);
        boltPath(); X.st(6);
      }
      c.fillStyle = b[1] === 'K' && !X.isPencil() ? P.white : P.K; c.textBaseline = 'alphabetic';
      let fs = 60; c.font = `400 ${fs}px Bangers`;
      const full = b[0] === 'PGE' ? 'PGE2' : b[0], w0 = c.measureText(full).width; if (w0 > 128) { fs = Math.floor((fs * 128) / w0); c.font = `400 ${fs}px Bangers`; }
      if (b[0] === 'PGE') { const w1 = c.measureText('PGE').width; c.font = `400 ${Math.round(fs * 0.68)}px Bangers`; const w2 = c.measureText('2').width; c.font = `400 ${fs}px Bangers`; c.textAlign = 'left'; c.fillText('PGE', -(w1 + w2) / 2 - 1, 22); c.font = `400 ${Math.round(fs * 0.68)}px Bangers`; c.fillText('2', -(w1 + w2) / 2 + w1 + 1, 30); } else { c.textAlign = 'center'; c.fillText(b[0], 0, 22); }
      c.restore();
    }
    function bg() {
      c.fillStyle = P.M0; c.fillRect(0, 0, PW, PH); X.fpRect(H('M', 1), 0, 0, PW, PH);
      X.htGrad('M', 10, 1.25, 0, 0, PW, 700, (x, y) => clamp(0.24 - y / 1500, 0, 0.24));
      for (let k = 0; k < 12; k++) X.fibro(60 + hash(k, 101) * 780, 330 + hash(k, 102) * 300, 56, (hash(k, 103) - 0.5) * 1.4);
      boneFill(() => { c.beginPath(); c.rect(-10, 640, PW + 20, PH); }, marrow, 23, 0);
      // root tip, top right
      const tip = () => { c.beginPath(); c.moveTo(628, -10); c.bezierCurveTo(640, 44, 700, 98, 758, 104); c.bezierCurveTo(816, 98, 876, 44, 888, -10); c.closePath(); };
      X.shape(tip, P.Y1, { lw: 6 });
      X.shape(() => poly([[742, -10], [774, -10], [768, 108], [748, 108]], true), P.K1, { pat: H('K', 3), lw: 0 });
      c.beginPath(); c.moveTo(742, -10); c.lineTo(748, 106); c.moveTo(774, -10); c.lineTo(768, 106); X.st(4.5);
      [[758, 30, 1], [756, 70, 2.2], [760, 118, 0.4], [748, 136, 1.7]].forEach((b) => X.cocci(b[0], b[1], 2, b[2], 5.6, { lw: 2.2 }));
    }
    function fg(lt) {
      const E = ease.inOut(seg(lt, 1.85, 3.15)), ph = lt * 1.4, act = seg(lt, 1.5, 1.9);
      // inflammatory tissue takes the place of resorbed bone
      const over = () => { c.beginPath(); c.moveTo(-10, 620); c.lineTo(PW + 10, 620); for (let x = PW + 10; x >= -10; x -= 6) c.lineTo(x, yF(x, E)); c.closePath(); };
      X.shape(over, P.M0, { pat: H('M', 1), lw: 0 });
      c.beginPath(); for (let x = -10; x <= PW + 10; x += 6) { const y = yF(x, E); if (x === -10) c.moveTo(x, y); else c.lineTo(x, y); } X.st(6);
      for (let k = 0; k < 9; k++) { const u = seg(lt, 1.9 + 0.12 * k, 2.75 + 0.12 * k); if (u <= 0 || u >= 1) continue; const x = 262 + k * 46, y = yF(x, E) - 12 - 46 * ease.out(u); c.save(); c.translate(x, y); c.rotate(k + u * 3); c.beginPath(); c.rect(-6, -5, 12 * (1 - u * 0.6), 10 * (1 - u * 0.6)); X.fl(P.Y0); X.st(2.4); c.restore(); }
      // cells of the lesion (unranked crowd)
      X.macrophage(152, 262, 50, { seed: 5, ph, vac: 2 }); X.lymphocyte(286, 250, 30, 'T'); X.neutrophil(396, 276, 29, { seed: 2, ph });
      X.macrophage(520, 256, 46, { seed: 8, ph, vac: 1 }); X.lymphocyte(634, 276, 30, 'B'); X.plasma(790, 262, 34, { rot: 0.4 });
      // osteoclasts on the bone surface
      const y1 = yF(215, E) - 10, sag1 = Math.max(8, yF(XO, E) - yF(215, E) + 6);
      if (act > 0.02 && act < 1 || (lt > 1.5 && lt < 2.5)) { const f = act * (1 - seg(lt, 1.9, 2.5)); if (f > 0.02 && !X.isPencil()) { c.save(); c.globalAlpha = Math.min(1, f * 1.5); X.focusLines(XO, 640, 330, 330 + 90 * act, 26, 9, P.K, 1.5); c.restore(); } }
      X.osteoclast(852, yF(790, E) - 6, 150, 74, { act, ph, seed: 5, nuc: 3, sag: Math.max(6, yF(852, E) - yF(790, E)) });
      X.osteoclast(XO, y1, 584, 164, { act, ph, seed: 2, nuc: 7, sag: sag1 });
      // four signals, side by side
      BL.forEach((b, i) => {
        const t0 = 0.4 + 0.24 * i, u = seg(lt, t0, t0 + 0.5); if (u <= 0) return;
        const x = 192 + i * 172, y = lerp(300, 418, ease.outBack(u)) + E * 10;
        if (u < 1) X.speedLines(x, y - 120, -Math.PI / 2 + Math.PI, 0, 0);
        if (u > 0.05 && u < 0.98) { c.save(); for (let q = -1; q <= 1; q++) { c.beginPath(); c.moveTo(x + q * 34, y - 118); c.lineTo(x + q * 34, y - 118 - 70 * Math.sin(Math.PI * u)); X.st(4); } c.restore(); }
        bolt(x, y, b, ease.out(seg(u, 0, 0.45)));
        const hit = pop(lt, t0 + 0.42, 0.25) * (1 - seg(lt, t0 + 0.7, t0 + 1.0));
        if (hit > 0.02) X.burst(x, y + 132, 26 * hit, 11 * hit, 7, { fill: P.white, rot: i, lw: 3 });
      });
    }
    return { bg, fg, head: (lt) => X.sfx(['THE COST'], 58, 136, 122, { s: pop(lt, 0.05), fill: P.Y }) };
  })();

  // =====================================================================================
  // 6 · STANDOFF — the lesion holds the infection; only treatment reaches the canal
  // =====================================================================================
  const p6 = (() => {
    const TS = 1.1, TY = 30, FY = (897 + TY) * TS;           // foramen y in panel space
    const T = (f) => { c.save(); c.translate(450, 0); c.scale(TS, TS); c.translate(-450, TY); f(); c.restore(); };
    const marrow = [[92, 612, 44], [180, 772, 36], [812, 600, 42], [742, 752, 38], [84, 905, 48], [824, 892, 50], [150, 1080, 44], [760, 1070, 44]];
    const LCY = FY + 34, LR = 152;
    const lesion = () => { c.beginPath(); const n = 110; for (let i = 0; i <= n; i++) { const a = (i / n) * TAU, sc = 1 - 0.06 * Math.abs(Math.sin(a * 7)), x = 450 + Math.cos(a) * LR * sc, y = LCY + Math.sin(a) * LR * 0.96 * sc; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.closePath(); };
    function bg() {
      c.fillStyle = P.C0; c.fillRect(0, 0, PW, 620);
      X.htGrad('C', 11, 0.32, 0, 0, PW, 600, (x, y) => clamp(0.44 - y / 720, 0, 0.44));
      X.focusLines(450, 380, 300, 1200, 30, 7, P.white, 1.5);
      T(() => toothBG(marrow, 37, { access: true }));
      // the lesion: inflammatory tissue where bone used to be (drawn around the apex, tooth stays on top)
      c.save(); c.beginPath(); c.rect(0, 0, PW, PH); c.translate(450, 0); c.scale(TS, TS); c.translate(-450, TY); TOOTH.outline(true); c.setTransform(c.getTransform().multiply(new DOMMatrix([1 / TS, 0, 0, 1 / TS, 0, 0]).translate(450 * TS - 450, -TY * TS))); c.clip('evenodd');
      c.restore();
    }
    function lesionLayer() {
      c.save(); c.beginPath(); c.rect(-20, -20, PW + 40, PH + 40);
      // subtract the tooth (in its own transform) with an even-odd clip
      const m = [[414, 872], [340, 740], [308, 520], [300, 400]];
      c.moveTo(450 + (300 - 450) * TS, (400 + TY) * TS);
      const tp = (x, y) => [450 + (x - 450) * TS, (y + TY) * TS];
      const B = (a, b, d) => { const p = tp(a[0], a[1]), q = tp(b[0], b[1]), r = tp(d[0], d[1]); c.bezierCurveTo(p[0], p[1], q[0], q[1], r[0], r[1]); };
      B([258, 330], [270, 215], [350, 170]); { const p = tp(400, 172), q = tp(450, 206); c.quadraticCurveTo(p[0], p[1], q[0], q[1]); } { const p = tp(500, 172), q = tp(550, 170); c.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
      B([630, 215], [642, 330], [600, 400]); B([592, 520], [560, 740], [486, 872]); B([470, 902], [430, 902], [414, 872]); B(m[1], m[2], m[3]); c.closePath();
      c.clip('evenodd');
      X.shape(lesion, P.M0, { pat: H('M', 2), lw: 6 });
      c.restore();
    }
    function fg(lt) {
      const ph = lt * 1.4;
      lesionLayer();
      const yt = lerp(-60, 968, ease.inOut(seg(lt, 1.55, 2.5))), tipT = yt / TS - TY;
      // canal contents: necrotic debris + bacteria; the file removes most (not all) of what it reaches
      T(() => {
        c.save(); TOOTH.pulp(); c.clip();
        c.fillStyle = P.K1; c.fillRect(340, 240, 220, 700); X.fpRect(H('K', 3), 340, 240, 220, 700);
        pulpSeeds.forEach((s, k) => { const gone = hash(k, 77) < 0.8 ? seg(tipT, s[1] - 4, s[1] + 46) : 0, a = 1 - gone; if (a <= 0.02) return; if (s[2] > 0.62) X.rod(s[0], s[1], 23, 10, s[3] * 3.14, { s: a, lw: 2.4 }); else X.cocci(s[0], s[1], s[2] > 0.3 ? 2 : 1, s[3] * 3.14, 6.8, { s: a, lw: 2.4 }); });
        c.restore();
        TOOTH.pulp(); X.st(4.5);
      });
      // the defence line around the foramen
      [[450, FY + 20, 0.5], [462, FY + 40, 2]].forEach((b) => X.cocci(b[0], b[1], 2, b[2], 7, {}));
      const ring = [[24, 'n'], [57, 'm'], [90, 't'], [123, 'p'], [156, 'n']];
      ring.forEach((q, k) => {
        const a = (q[0] * Math.PI) / 180, R = 100 + 5 * Math.sin(lt * 3.2 + k * 1.7), x = 450 + Math.cos(a) * R, y = FY + 4 + Math.sin(a) * R;
        if (q[1] === 'n') X.neutrophil(x, y, 27, { seed: k + 1, ph }); else if (q[1] === 'm') X.macrophage(x, y, 31, { seed: 4, ph, vac: 1 }); else if (q[1] === 't') X.lymphocyte(x, y, 26, 'T'); else X.plasma(x, y, 24, { rot: 0.9 });
      });
      X.antibody(434, FY + 44, 17, 0.5); X.antibody(476, FY + 26, 17, -0.9);
      // endodontic file (schematic)
      if (yt > -50) {
        const work = () => poly([[450, yt], [441, yt - 60], [437, yt - 560], [463, yt - 560], [459, yt - 60]], true);
        X.shape(work, P.white, { lw: 4.5 });
        if (!X.isPencil()) { c.save(); work(); c.clip(); for (let y = yt - 30; y > yt - 560; y -= 30) { c.beginPath(); c.moveTo(434, y); c.lineTo(466, y - 20); X.st(3.2, P.K); } c.restore(); }
        X.shape(() => { c.beginPath(); c.rect(443, yt - 782, 14, 224); }, P.K0, { lw: 4.5 });
        X.shape(() => X.ell(450, yt - 742, 27, 10), P.C, { lw: 4 });
        X.shape(() => { c.beginPath(); c.roundRect(408, yt - 904, 84, 126, 16); }, P.Y, { sh: [6, 8], lw: 5 });
        for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(416, yt - 884 + k * 28); c.lineTo(484, yt - 884 + k * 28); X.st(3.5); }
        const u = seg(lt, 1.55, 2.5); if (u > 0.05 && u < 0.97) for (let q = -1; q <= 1; q += 2) { c.beginPath(); c.moveTo(450 + q * 62, yt - 900); c.lineTo(450 + q * 62, yt - 900 - 120 * Math.sin(Math.PI * u)); X.st(4.5); }
      }
    }
    return { bg, fg, head: (lt) => X.sfx(['STANDOFF'], 50, 132, 104, { s: pop(lt, 0.25), fill: P.Y }) };
  })();

  // =====================================================================================
  const panels = [p1, p2, p3, p4, p5, p6];
  const bgCache = [];
  const dur = [3.4, 4.4, 3.9, 4.3, 4.4, 9];
  function init() { initSeeds(); }
  /** draw panel i (0..5) at local time lt into ctx (already transformed to panel space). pen = blue-line rough */
  function render(i, ctx, lt, pen) {
    const p = panels[i]; lt = clamp(lt, 0, dur[i]);
    if (!pen && !bgCache[i]) { const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; setC(cv.getContext('2d')); X.mode(false); p.bg(); bgCache[i] = cv; }
    setC(ctx); X.mode(!!pen);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip();
    if (pen) p.bg(); else ctx.drawImage(bgCache[i], 0, 0);
    p.fg(lt); p.head(lt);
    ctx.restore(); X.mode(false);
  }
  window.Panels = { PW, PH, dur, init, render };
})();
