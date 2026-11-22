/*
 * 31 — External inflammatory (infection-related) root resorption
 * Style: hazard signage / emergency placard (safety yellow + black, red accent, blue mandatory sign).
 * One full-frame 2D canvas; render(t) is a pure function of t. See NOTES.md for claims and sources.
 */
'use strict';
(() => {
  const { canvas, ctx } = Kit.createCanvas();
  const { seg, ease, clamp, lerp, W, H, noise1, noise2 } = Kit;
  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  /** decorrelated hash -> [0,1) (Kit.hash is too regular for small consecutive integers) */
  const rnd = (a, b = 0, c = 0) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.5) * 43758.5453123; return v - Math.floor(v); };

  // ------------------------------------------------------------------ palette / type
  const C = {
    Y: '#FFCC00', YL: '#FFD93B', YD: '#E2B100',
    K: '#131313', K2: '#202020', K3: '#2E2E2E',
    R: '#D31F2A', RB: '#EC3540', RD: '#8F1119', RL: '#F6B9B2',
    WH: '#FFFFFF', OW: '#FAF7EE',
    B: '#0B5AA9', BD: '#084784', BL: '#E4EEF9',
    BONE: '#DCD8CE', MARROW: '#C3BEB1', LD: '#77736A',
    DEN: '#FFEFAE', TUB: '#D9A700', CEM: '#2A2A2A', FIB: '#ABA79D',
  };
  const anton = (px) => `400 ${px}px Anton`;
  const bc = (w, px) => `${w} ${px}px "Barlow Condensed"`;

  // ------------------------------------------------------------------ timeline
  const DUR = 21.9, WD = 0.56;
  const S = { eq: 1.9, cut: 5.9, fix: 12.4, end: 17.3 };
  const LIT = [6.8, 8.2, 9.6];           // timer rows light up
  const T_STRIP = 10.7;                  // IADT quote strip
  const T_GEND = 12.1;                   // crater growth ends
  const T_SWEEP = [12.6, 13.4];          // canal dressing front, coronal -> apical
  const T_TAG = 13.2;                    // "stimulus cut" lock-out tag
  const T_FLIP = [13.8, 14.15];          // timer plate -> stat plate
  const WIPES = [
    { t0: S.eq - WD / 2, a: 'hook', b: 'eq' },
    { t0: S.cut - WD / 2, a: 'eq', b: 'cut' },
    { t0: S.end - WD / 2, a: 'cut', b: 'end' },
    { t0: DUR - WD, a: 'end', b: 'hook', tb: 0 },
  ];

  // ------------------------------------------------------------------ layout
  const FACE = { x: 34, y: 214, w: 944, h: 1382, r: 22 };
  const COL = { x0: 64, x1: 950, cx: 507, w: 886 };   // reading column (clear of the IG button column)
  const CONTENT_TOP = 300;

  // ------------------------------------------------------------------ small helpers
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); };
  function roundedPoly(c, pts, r) {
    const n = pts.length;
    c.beginPath();
    c.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) { const p1 = pts[i], p2 = pts[(i + 1) % n]; c.arcTo(p1[0], p1[1], p2[0], p2[1], r); }
    c.closePath();
  }
  function setLS(c, ls) { if ('letterSpacing' in c) c.letterSpacing = ls + 'px'; }
  function txt(s, x, y, font, color, align = 'left', ls = 0) {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    setLS(ctx, ls); ctx.fillText(s, x, y); setLS(ctx, 0);
  }
  function tw(s, font, ls = 0) { ctx.font = font; setLS(ctx, ls); const w = ctx.measureText(s).width; setLS(ctx, 0); return w; }
  const _fit = new Map();
  function fit(s, fontFn, maxW, maxPx, ls = 0) {
    const k = [s, fontFn(10), maxW, maxPx, ls].join('|');
    if (_fit.has(k)) return _fit.get(k);
    const w = tw(s, fontFn(maxPx), ls);
    const px = w > maxW ? Math.floor((maxPx * maxW / w) * 4) / 4 : maxPx;
    _fit.set(k, px); return px;
  }
  const _cap = new Map();
  function capH(font) {
    if (_cap.has(font)) return _cap.get(font);
    ctx.font = font; const m = ctx.measureText('H'); const h = m.actualBoundingBoxAscent; _cap.set(font, h); return h;
  }
  /** "stamp" an element onto the placard: lands slightly oversize and settles */
  function stamp(u, cx, cy, fn, from = 1.26) {
    if (u <= 0) return;
    const sc = lerp(from, 1, ease.outBack(clamp(u)));
    ctx.save(); ctx.globalAlpha *= clamp(u / 0.3);
    ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    fn(); ctx.restore();
  }
  const pu = (t, t0, d = 0.42) => clamp((t - t0) / d);

  function rivet(x, y, r = 6) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, '#8a8a8a'); g.addColorStop(0.6, '#4a4a4a'); g.addColorStop(1, '#1d1d1d');
    ctx.fillStyle = g; circle(ctx, x, y, r); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  function plate(x, y, w, h, o = {}) {
    const r = o.r != null ? o.r : 16;
    ctx.save();
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(40,24,0,0.38)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; }
    ctx.fillStyle = o.fill || C.K; rrect(ctx, x, y, w, h, r); ctx.fill();
    ctx.restore();
    if (o.bevel !== false) {
      ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip();
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(Math.min(0.5, 40 / h), 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
    if (o.line) { ctx.strokeStyle = o.line; ctx.lineWidth = 3; rrect(ctx, x + 9, y + 9, w - 18, h - 18, Math.max(2, r - 6)); ctx.stroke(); }
    if (o.rivets) { const m = 17; rivet(x + m, y + m); rivet(x + w - m, y + m); rivet(x + m, y + h - m); rivet(x + w - m, y + h - m); }
  }

  // ------------------------------------------------------------------ static base (frame + sign face)
  let base;
  function buildBase() {
    base = document.createElement('canvas'); base.width = W; base.height = H;
    const b = base.getContext('2d');
    const fg = b.createLinearGradient(0, 0, 0, H);
    fg.addColorStop(0, '#171717'); fg.addColorStop(0.5, '#0D0D0D'); fg.addColorStop(1, '#151515');
    b.fillStyle = fg; b.fillRect(0, 0, W, H);
    for (let i = 0; i < 300; i++) {            // brushed-steel hairlines on the frame
      b.fillStyle = `rgba(255,255,255,${(0.01 + 0.022 * rnd(i, 12)).toFixed(3)})`;
      b.fillRect(0, Math.floor(rnd(i, 11) * H), W, 1 + Math.round(rnd(i, 13)));
    }
    // sign face
    b.save();
    b.shadowColor = 'rgba(0,0,0,0.7)'; b.shadowBlur = 16; b.shadowOffsetY = 4;
    const g = b.createRadialGradient(470, 720, 60, 506, 900, 1080);
    g.addColorStop(0, '#FFD934'); g.addColorStop(0.5, '#FFCC00'); g.addColorStop(1, '#EFB700');
    b.fillStyle = g; rrect(b, FACE.x, FACE.y, FACE.w, FACE.h, FACE.r); b.fill();
    b.restore();
    b.save(); rrect(b, FACE.x, FACE.y, FACE.w, FACE.h, FACE.r); b.clip();
    // paint mottling (low-frequency value noise, very faint)
    const mw = 236, mh = 346, m = document.createElement('canvas'); m.width = mw; m.height = mh;
    const mc = m.getContext('2d'), id = mc.createImageData(mw, mh);
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const n = 0.65 * noise2(x / 26, y / 26, 3) + 0.35 * noise2(x / 8, y / 8, 5), i = (y * mw + x) * 4;
      if (n < 0) { id.data[i] = 150; id.data[i + 1] = 92; id.data[i + 2] = 0; } else { id.data[i] = 255; id.data[i + 1] = 255; id.data[i + 2] = 230; }
      id.data[i + 3] = Math.abs(n) * 30;
    }
    mc.putImageData(id, 0, 0);
    b.imageSmoothingEnabled = true; b.imageSmoothingQuality = 'high';
    b.drawImage(m, FACE.x, FACE.y, FACE.w, FACE.h);
    // a few scuffs
    b.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const x = FACE.x + rnd(i, 21) * FACE.w, y = FACE.y + rnd(i, 22) * FACE.h, len = 30 + 150 * rnd(i, 23), a = (rnd(i, 24) - 0.5) * 0.5;
      b.strokeStyle = rnd(i, 25) > 0.5 ? 'rgba(120,76,0,0.07)' : 'rgba(255,255,235,0.12)';
      b.lineWidth = 1 + 1.5 * rnd(i, 26);
      b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); b.stroke();
    }
    b.restore();
    // printed key line
    b.strokeStyle = C.K; b.lineWidth = 3; rrect(b, FACE.x + 10, FACE.y + 10, FACE.w - 20, FACE.h - 20, FACE.r - 8); b.stroke();
  }

  function tapeH(y, h, off, dir) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, h); ctx.clip();
    ctx.fillStyle = C.K; ctx.fillRect(0, y, W, h);
    const P = 96, sw = 48, o = ((off % P) + P) % P;
    ctx.fillStyle = C.Y;
    for (let x = -P * 2 + o; x < W + P * 2; x += P) {
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + sw, y + h); ctx.lineTo(x + sw + h * dir, y); ctx.lineTo(x + h * dir, y); ctx.closePath(); ctx.fill();
    }
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = g; ctx.fillRect(0, y, W, h);
    ctx.restore();
  }
  function gutter(off) {
    const x0 = 994, x1 = W, y0 = FACE.y, y1 = FACE.y + FACE.h, mid = (x0 + x1) / 2, P = 72, th = 28, rise = 34;
    ctx.save(); rrect(ctx, x0, y0, x1 - x0 + 30, y1 - y0, 10); ctx.clip();
    ctx.fillStyle = '#0B0B0B'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    const o = ((off % P) + P) % P;
    ctx.fillStyle = C.Y;
    for (let y = y0 - P - o; y < y1 + P; y += P) {
      ctx.beginPath();
      ctx.moveTo(x0 + 10, y + rise); ctx.lineTo(mid, y); ctx.lineTo(x1 - 10, y + rise); ctx.lineTo(x1 - 10, y + rise + th); ctx.lineTo(mid, y + th); ctx.lineTo(x0 + 10, y + rise + th);
      ctx.closePath(); ctx.fill();
    }
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(0.3, 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
  }
  function drawTagRow() {
    const y = 240, h = 52, x = COL.x0, label = 'RESORPTION 3/5 · EXTERNAL INFLAMMATORY', f = bc(700, 30);
    const w = tw(label, f, 1.2);
    ctx.fillStyle = C.K; rrect(ctx, x, y, w + 74, h, 8); ctx.fill();
    const ix = x + 30, iy = y + 27;
    ctx.fillStyle = C.Y; roundedPoly(ctx, [[ix, iy - 16], [ix + 17, iy + 12], [ix - 17, iy + 12]], 3); ctx.fill();
    ctx.fillStyle = C.K; ctx.fillRect(ix - 2, iy - 7, 4, 10); ctx.fillRect(ix - 2, iy + 5.5, 4, 4);
    txt(label, x + 56, y + 37, f, C.Y, 'left', 1.2);
    txt('@natebrooksendo', COL.x1, y + 37, bc(600, 28), 'rgba(19,19,19,0.82)', 'right', 0.6);
  }

  // ------------------------------------------------------------------ pictograms
  function toothPath(c, x, y, s) {      // incisor silhouette, local box 100 x 220 (incisal edge up, apex down)
    const X = (a) => x + a * s, Y = (b) => y + b * s;
    c.beginPath();
    c.moveTo(X(12), Y(9));
    c.quadraticCurveTo(X(12), Y(0), X(21.5), Y(0));
    c.lineTo(X(78.5), Y(0));
    c.quadraticCurveTo(X(88), Y(0), X(88), Y(9));
    c.bezierCurveTo(X(94), Y(31), X(92), Y(59), X(80), Y(83));
    c.bezierCurveTo(X(77.5), Y(89), X(76.5), Y(95), X(76), Y(101));
    c.bezierCurveTo(X(74), Y(147), X(65), Y(198), X(55), Y(216));
    c.bezierCurveTo(X(52), Y(221), X(48), Y(221), X(45), Y(216));
    c.bezierCurveTo(X(35), Y(198), X(26), Y(147), X(24), Y(101));
    c.bezierCurveTo(X(23.5), Y(95), X(22.5), Y(89), X(20), Y(83));
    c.bezierCurveTo(X(8), Y(59), X(6), Y(31), X(12), Y(9));
    c.closePath();
  }
  function canalPath(c, x, y, s, wf = 1, access = false) {
    const X = (a) => x + a * s, Y = (b) => y + b * s;
    c.beginPath();
    if (access) {
      c.moveTo(X(50 - 6.5 * wf), Y(-8)); c.lineTo(X(50 + 6.5 * wf), Y(-8)); c.lineTo(X(50 + 8 * wf), Y(46));
    } else {
      c.moveTo(X(50), Y(30));
      c.bezierCurveTo(X(50 + 12 * wf), Y(30), X(50 + 12.5 * wf), Y(50), X(50 + 10.5 * wf), Y(72));
    }
    if (access) c.lineTo(X(50 + 10.5 * wf), Y(72));
    c.bezierCurveTo(X(50 + 7 * wf), Y(112), X(50 + 4.4 * wf), Y(172), X(50 + 1.8 * wf), Y(206));
    c.lineTo(X(50 - 1.8 * wf), Y(206));
    c.bezierCurveTo(X(50 - 4.4 * wf), Y(172), X(50 - 7 * wf), Y(112), X(50 - 10.5 * wf), Y(72));
    if (access) { c.lineTo(X(50 - 8 * wf), Y(46)); } else c.bezierCurveTo(X(50 - 12.5 * wf), Y(50), X(50 - 12 * wf), Y(30), X(50), Y(30));
    c.closePath();
  }
  function cejLine(x, y, s, color) {     // cervical line: separates crown from root
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3.2 * s; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(x + 18.5 * s, y + 82 * s); ctx.quadraticCurveTo(x + 50 * s, y + 100 * s, x + 81.5 * s, y + 82 * s); ctx.stroke(); ctx.restore();
  }
  /** tooth in its (hatched) bony socket; bowl-shaped lacunae eat root AND bone; red clastic cells (hook / result pictogram) */
  function pictoResorbed(cx, cy, hpx, t, bg, grow = 1) {
    const s = hpx / 220, x = cx - 50 * s, y = cy - 110 * s, X = (a) => x + a * s, Y = (b) => y + b * s;
    const bx0 = -42, bx1 = 142, by0 = 104, by1 = 233;
    // alveolar bone: hazard-hatched block with the socket (PDL space) cut out
    ctx.save();
    rrect(ctx, X(bx0), Y(by0), (bx1 - bx0) * s, (by1 - by0) * s, [0, 0, 7 * s, 7 * s]); ctx.clip();
    ctx.strokeStyle = C.K; ctx.lineWidth = 5 * s; ctx.lineCap = 'butt';
    for (let k = -14; k < 22; k++) { const xx = X(bx0 + k * 11.5); ctx.beginPath(); ctx.moveTo(xx, Y(by1 + 2)); ctx.lineTo(xx + (by1 - by0 + 4) * s, Y(by0 - 2)); ctx.stroke(); }
    ctx.fillStyle = C.K; ctx.fillRect(X(bx0), Y(by0), (bx1 - bx0) * s, 5 * s);
    toothPath(ctx, x, y, s); ctx.strokeStyle = bg; ctx.lineWidth = 15 * s; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    toothPath(ctx, x, y, s); ctx.fillStyle = C.K; ctx.fill();
    cejLine(x, y, s, bg);
    const bites = [[80.5, 131, 18, 0], [73.5, 172, 14, 0.3], [20.5, 150, 16.5, 0.15], [29.5, 189, 11.5, 0.45]];
    const gs = bites.map((b) => clamp((grow - b[3] * 0.55) / (1 - b[3] * 0.55)));
    bites.forEach(([bx, by, br], i) => { ctx.fillStyle = bg; circle(ctx, X(bx), Y(by), br * s * (0.3 + 0.7 * gs[i])); ctx.fill(); });
    bites.forEach(([bx, by, br], i) => {
      const pul = 1 + 0.07 * Math.sin(t * 5.2 + i * 1.9), cr = br * s * 0.56 * pul * (0.55 + 0.45 * gs[i]), px = X(bx), py = Y(by);
      circle(ctx, px, py, cr); ctx.fillStyle = C.R; ctx.fill();
      ctx.lineWidth = Math.max(1.5, s * 1.3); ctx.strokeStyle = C.K; ctx.stroke();
      ctx.fillStyle = '#3A0A0E';
      circle(ctx, px - cr * 0.3, py - cr * 0.2, cr * 0.2); ctx.fill();
      circle(ctx, px + cr * 0.26, py + cr * 0.24, cr * 0.2); ctx.fill();
    });
  }
  /** displaced tooth with denuded (red) strips of root surface + impact rays */
  function pictoDamaged(cx, cy, hpx, t, bg, u = 1) {
    const s = hpx / 220;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-9 * RAD);
    const x = -50 * s, y = -110 * s, X = (a) => x + a * s, Y = (b) => y + b * s;
    toothPath(ctx, x, y, s); ctx.fillStyle = C.K; ctx.fill();
    cejLine(x, y, s, bg);
    ctx.fillStyle = C.R;
    ctx.beginPath(); ctx.moveTo(X(77), Y(104));
    ctx.bezierCurveTo(X(76.5), Y(128), X(74), Y(152), X(68.5), Y(180));
    [[60, 173], [65.5, 163], [57.5, 154], [64.5, 145], [58, 136], [66, 127], [60.5, 118], [69.5, 110]].forEach(([a, b]) => ctx.lineTo(X(a), Y(b)));
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(28.5), Y(160));
    ctx.bezierCurveTo(X(31.5), Y(180), X(36), Y(197), X(42), Y(211));
    [[46.5, 204], [42, 196], [46, 188], [39.5, 181], [43, 173], [36.5, 166]].forEach(([a, b]) => ctx.lineTo(X(a), Y(b)));
    ctx.closePath(); ctx.fill();
    const ox = 88, oy = 142, k = 0.8 + 0.2 * u + 0.05 * Math.sin(t * 4);
    [[-38, 30], [0, 42], [38, 30]].forEach(([deg, len]) => {
      const a = deg * RAD, ca = Math.cos(a), sa = Math.sin(a), r0 = 3, r1 = 3 + len * k, wv = 6.4;
      ctx.beginPath(); ctx.moveTo(X(ox + r0 * ca), Y(oy + r0 * sa));
      ctx.lineTo(X(ox + r1 * ca - wv * sa), Y(oy + r1 * sa + wv * ca)); ctx.lineTo(X(ox + r1 * ca + wv * sa), Y(oy + r1 * sa - wv * ca));
      ctx.closePath(); ctx.fillStyle = C.K; ctx.fill();
    });
    ctx.restore();
  }
  /** tooth whose canal is full of red microbes */
  function pictoInfected(cx, cy, hpx, t, bg) {
    const s = hpx / 220, x = cx - 50 * s, y = cy - 110 * s, X = (a) => x + a * s, Y = (b) => y + b * s;
    toothPath(ctx, x, y, s); ctx.fillStyle = C.K; ctx.fill();
    cejLine(x, y, s, bg);
    canalPath(ctx, x, y, s, 1.8); ctx.fillStyle = bg; ctx.fill();
    const ms = [[50, 41, 0], [41, 52, 1], [59, 53, 0], [49, 64, 1], [57, 76, 0], [43, 78, 0], [51, 92, 1], [46, 108, 0], [54, 119, 1], [49, 135, 0], [51.5, 151, 1], [49.5, 168, 0], [50, 185, 0]];
    ctx.lineCap = 'round';
    ms.forEach(([a, b, kind], i) => {
      const jx = 1.6 * noise1(t * 1.3 + i * 3.1, 3), jy = 1.6 * noise1(t * 1.3 + i * 5.3, 4), k = lerp(1, 0.5, clamp((b - 41) / 144));
      const px = X(a + jx * k), py = Y(b + jy);
      ctx.fillStyle = C.R; ctx.strokeStyle = C.R;
      if (kind === 0) { circle(ctx, px, py, 4.4 * s * k); ctx.fill(); } else {
        const an = rnd(i, 9) * Math.PI + 0.4 * noise1(t * 0.9 + i, 6), dx = Math.cos(an) * 4.6 * s * k, dy = Math.sin(an) * 4.6 * s * k;
        ctx.lineWidth = 5.6 * s * k; ctx.beginPath(); ctx.moveTo(px - dx, py - dy); ctx.lineTo(px + dx, py + dy); ctx.stroke();
      }
    });
  }
  function diamondSign(cx, cy, r, o = {}) {
    const s = r * Math.SQRT2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
    ctx.save();
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(40,24,0,0.36)'; ctx.shadowBlur = r * 0.11; ctx.shadowOffsetY = r * 0.045; }
    ctx.fillStyle = C.WH; rrect(ctx, -s / 2, -s / 2, s, s, s * 0.085); ctx.fill();
    ctx.restore();
    const b1 = s * 0.032, bw = s * 0.095;
    ctx.fillStyle = C.R; rrect(ctx, -s / 2 + b1, -s / 2 + b1, s - 2 * b1, s - 2 * b1, s * 0.065); ctx.fill();
    ctx.fillStyle = C.WH; rrect(ctx, -s / 2 + b1 + bw, -s / 2 + b1 + bw, s - 2 * (b1 + bw), s - 2 * (b1 + bw), s * 0.03); ctx.fill();
    ctx.restore();
  }
  function triSign(cx, top, side, o = {}) {
    const h = side * 0.8660254, cy = top + (h * 2) / 3, band = side * 0.074;
    const base3 = [[cx, top], [cx + side / 2, top + h], [cx - side / 2, top + h]];
    const P = (k) => base3.map((p) => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k]);
    const kOf = (d) => (side - 2 * Math.sqrt(3) * d) / side;
    ctx.save();
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(40,24,0,0.4)'; ctx.shadowBlur = side * 0.05; ctx.shadowOffsetY = side * 0.02; }
    ctx.fillStyle = o.edge || C.WH; roundedPoly(ctx, P(kOf(-(o.edgeW != null ? o.edgeW : side * 0.014))), side * 0.09); ctx.fill();
    ctx.restore();
    ctx.fillStyle = C.K; roundedPoly(ctx, P(1), side * 0.078); ctx.fill();
    ctx.fillStyle = o.fill || C.Y; roundedPoly(ctx, P(kOf(band)), side * 0.03); ctx.fill();
  }
  /** blue mandatory-action sign: endodontic file in the canal */
  function mandSign(cx, cy, R, t) {
    ctx.save(); ctx.shadowColor = 'rgba(40,24,0,0.4)'; ctx.shadowBlur = R * 0.12; ctx.shadowOffsetY = R * 0.05;
    ctx.fillStyle = C.WH; circle(ctx, cx, cy, R); ctx.fill(); ctx.restore();
    const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#1168BE'); g.addColorStop(1, C.B);
    ctx.fillStyle = g; circle(ctx, cx, cy, R * 0.94); ctx.fill();
    const hpx = R * 1.16, s = hpx / 220, x = cx - 50 * s, y = cy - 110 * s + 31 * s, X = (a) => x + a * s, Y = (b) => y + b * s;
    toothPath(ctx, x, y, s); ctx.fillStyle = C.WH; ctx.fill();
    cejLine(x, y, s, C.B);
    canalPath(ctx, x, y, s, 1.7, true); ctx.fillStyle = C.B; ctx.fill();
    const bob = 5 * Math.sin(t * 2.4);
    ctx.lineCap = 'round'; ctx.strokeStyle = C.WH; ctx.lineWidth = 3.4 * s;
    ctx.beginPath(); ctx.moveTo(X(50), Y(-34 + bob)); ctx.lineTo(X(50), Y(192 + bob)); ctx.stroke();
    ctx.fillStyle = C.WH; rrect(ctx, X(39), Y(-66 + bob), 22 * s, 34 * s, 5 * s); ctx.fill();
    ctx.strokeStyle = C.B; ctx.lineWidth = 2.6 * s;
    [-56, -49, -42].forEach((b) => { ctx.beginPath(); ctx.moveTo(X(43), Y(b + bob)); ctx.lineTo(X(57), Y(b + bob)); ctx.stroke(); });
    ctx.fillStyle = C.WH; ctx.beginPath(); ctx.ellipse(X(50), Y(-17 + bob), 9 * s, 4.2 * s, 0, 0, TAU); ctx.fill();
  }

  // ================================================================== SCENE 0 — hook placard
  function sceneHook(th) {
    const cx = COL.cx, top = 318, side = 770, h = side * 0.8660254;
    triSign(cx, top, side, { edge: C.WH });
    const grow = 0.7 + 0.3 * seg(th, 0.1, 1.3, ease.out);
    pictoResorbed(cx, top + h * 0.615, 332, th, C.Y, grow);
    const by = top + h + 34, barH = 92;
    plate(COL.x0, by, COL.w, barH, { r: 10 });
    txt('EXTERNAL', COL.x0 + 30, by + 71, anton(70), C.Y, 'left', 9);
    // chevrons on the bar
    ctx.fillStyle = C.Y;
    for (let i = 0; i < 7; i++) {
      const x = COL.x1 - 46 - i * 46, a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(th * 4.2 + i * 0.8));
      ctx.globalAlpha = a; ctx.beginPath();
      ctx.moveTo(x, by + 24); ctx.lineTo(x + 16, by + 24); ctx.lineTo(x + 36, by + 46); ctx.lineTo(x + 16, by + 68); ctx.lineTo(x, by + 68); ctx.lineTo(x + 20, by + 46);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const p1 = fit('INFLAMMATORY', anton, COL.w - 4, 200), c1 = capH(anton(p1));
    const p2 = fit('RESORPTION', anton, COL.w - 4, 230), c2 = capH(anton(p2));
    const y1 = by + barH + 26 + c1, y2 = y1 + 24 + c2;
    txt('INFLAMMATORY', cx, y1, anton(p1), C.K, 'center');
    txt('RESORPTION', cx, y2, anton(p2), C.K, 'center');
  }

  // ================================================================== SCENE 1 — equation as signage
  function sceneEq(t) {
    const cx = COL.cx, r = 194, dy = 524, d1x = COL.x0 + r + 4, d2x = COL.x1 - r - 4;
    const u1 = pu(t, 1.98), uP = pu(t, 2.35, 0.3), u2 = pu(t, 2.5), uE = pu(t, 3.0, 0.3), uR = pu(t, 3.15, 0.46), aS = seg(t, 3.6, 4.0);
    stamp(u1, d1x, dy, () => { diamondSign(d1x, dy, r); pictoDamaged(d1x - 8, dy + 2, 214, t, C.WH, ease.out(pu(t, 2.1, 0.5))); });
    stamp(u2, d2x, dy, () => { diamondSign(d2x, dy, r); pictoInfected(d2x, dy + 2, 214, t, C.WH); });
    // labels
    const lab = (u, x, l1, l2, sub) => {
      if (u <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(u * 1.4); const off = 14 * (1 - ease.out(clamp(u)));
      txt(l1, x, 786 + off, anton(52), C.K, 'center', 0.5); txt(l2, x, 846 + off, anton(52), C.K, 'center', 0.5);
      if (sub) txt(sub, x, 892 + off, bc(600, 34), 'rgba(19,19,19,0.86)', 'center', 0.4);
      ctx.restore();
    };
    lab(u1, d1x, 'DAMAGED', 'ROOT SURFACE', 'luxation · avulsion');
    lab(u2, d2x, 'INFECTED', 'CANAL');
    // plus
    stamp(uP, cx, dy, () => {
      ctx.fillStyle = C.K; circle(ctx, cx, dy, 42); ctx.fill();
      ctx.fillStyle = C.Y; ctx.fillRect(cx - 24, dy - 6.5, 48, 13); ctx.fillRect(cx - 6.5, dy - 24, 13, 48);
    });
    // equals
    const ey = 966;
    stamp(uE, cx, ey, () => { ctx.fillStyle = C.K; rrect(ctx, cx - 62, ey - 27, 124, 20, 4); ctx.fill(); rrect(ctx, cx - 62, ey + 7, 124, 20, 4); ctx.fill(); });
    // result plate
    const py = 1030, ph = 440;
    stamp(uR, cx, py + ph / 2, () => {
      plate(COL.x0, py, COL.w, ph, { r: 18, rivets: true, line: 'rgba(255,204,0,0.9)' });
      const side = 318, tcx = COL.x0 + 208, ttop = py + 62;
      triSign(tcx, ttop, side, { edge: C.Y, shadow: false, edgeW: 5 });
      pictoResorbed(tcx, ttop + side * 0.866 * 0.61, 138, t, C.Y, 0.35 + 0.65 * seg(t, 3.3, 5.2, ease.out));
      const tx = COL.x0 + 404, wmax = COL.x1 - 44 - tx;
      const p1 = fit('INFLAMMATORY', anton, wmax, 130), p2 = fit('RESORPTION', anton, wmax, 150);
      const c1 = capH(anton(p1)), c2 = capH(anton(p2)), gap = 24, y0 = py + (ph - (c1 + c2 + gap)) / 2;
      txt('INFLAMMATORY', tx, y0 + c1, anton(p1), C.Y); txt('RESORPTION', tx, y0 + c1 + gap + c2, anton(p2), C.Y);
    }, 1.12);
    if (aS > 0) { ctx.save(); ctx.globalAlpha = aS; txt('Fuss, Tsesis & Lin 2003 · Dent Traumatol', COL.x0 + 4, 1522, bc(500, 26), 'rgba(19,19,19,0.85)', 'left', 0.3); ctx.restore(); }
  }

  // ================================================================== SCENE 2/3 — cutaway, timer, the fix
  const CP = { x: 64, y: 306, w: 886, h: 794 };
  const DA = { x0: 74, x1: 940, y0: 316, y1: 1090 };
  const CEMW = 20, PDLW = 62, LINW = 11;
  const xcF = (y) => 232 + 7 * Math.sin(((y - 316) / 774) * 2.6 + 1.2);
  const xsF = (y) => 586 + 9 * Math.sin(((y - 316) / 774) * 3.0 + 0.4);
  const xbF = (y) => xsF(y) + CEMW + PDLW + 5 * Math.sin(y / 70 + 1.0);
  const NY = 156, YS = [], XC = [], XS = [], XBS = [], XE0 = [], XE1 = [];
  for (let i = 0; i < NY; i++) { const y = DA.y0 + ((DA.y1 - DA.y0) * i) / (NY - 1); YS.push(y); XC.push(xcF(y)); XS.push(xsF(y)); XBS.push(xbF(y)); XE0.push(DA.x0 - 6); XE1.push(DA.x1 + 6); }
  const D = new Float32Array(NY), DS = new Float32Array(NY), TMP = new Float32Array(NY), E = new Float32Array(NY), XR = new Float32Array(NY), XB = new Float32Array(NY), PL = new Float32Array(NY), LA = new Float32Array(NY), LB = new Float32Array(NY), LN = new Float32Array(NY);
  const PATCH = [626, 816];
  // two bowl-shaped craters in the root, two facing ones in the bone (depths / growth are schematic)
  const RLOBE = [{ yc: 668, h0: 46, h1: 106, d1: 178, lag: 0 }, { yc: 792, h0: 40, h1: 90, d1: 132, lag: 0.07 }];
  const BLOBE = [{ yc: 652, h0: 50, h1: 112, d1: 118, lag: 0.06 }, { yc: 780, h0: 44, h1: 104, d1: 136, lag: 0.12 }];
  const SCP = 30;   // Howship-lacuna scallop pitch (px)
  function lobeDepth(L, y, G) {
    const g = clamp((G - L.lag) / (1 - L.lag)); if (g <= 0) return 0;
    const h = lerp(L.h0, L.h1, Math.pow(g, 0.8)), u = (y - L.yc) / h; if (Math.abs(u) >= 1) return 0;
    return L.d1 * Math.pow(g, 1.05) * Math.pow(1 - u * u, 0.74);
  }
  const scallop = (d, y, ph) => (d > 5 ? d + 4.5 * Math.abs(Math.sin((Math.PI * (y - ph)) / SCP)) * Math.min(1, (d - 5) / 40) : d);
  function Dfn(y, G) {
    let d = 0; for (const L of RLOBE) d = Math.max(d, lobeDepth(L, y, G));
    if (y > PATCH[0] && y < PATCH[1]) { const e = Math.min(y - PATCH[0], PATCH[1] - y); d = Math.max(d, Math.min(1, e / 9) * (4.6 + 2.4 * noise1(y * 0.11, 7))); }
    return scallop(d, y, 634);
  }
  function Efn(y, G) { let d = 0; for (const L of BLOBE) d = Math.max(d, lobeDepth(L, y, G)); return scallop(d, y, 624); }
  function atY(arr, y) { const f = clamp((y - DA.y0) / (DA.y1 - DA.y0)) * (NY - 1), i = Math.min(NY - 2, Math.floor(f)); return lerp(arr[i], arr[i + 1], f - i); }
  function band(xa, xb, a = 0, b = NY - 1) {
    ctx.beginPath();
    for (let i = a; i <= b; i++) ctx.lineTo(xa[i], YS[i]);
    for (let i = b; i >= a; i--) ctx.lineTo(xb[i], YS[i]);
    ctx.closePath();
  }
  function runs(pred) { const out = []; let s = -1; for (let i = 0; i < NY; i++) { if (pred(i)) { if (s < 0) s = i; } else if (s >= 0) { out.push([s, i - 1]); s = -1; } } if (s >= 0) out.push([s, NY - 1]); return out; }
  // dentinal tubules (gentle S-curve from the canal wall to the root surface)
  const TUBS = [];
  for (let yj = DA.y0 - 6; yj < DA.y1 + 36; yj += 12.4) { const p0 = [xcF(yj) + 1, yj], p3 = [xsF(yj - 16), yj - 16]; TUBS.push({ p0, p1: [p0[0] + 105, yj + 9], p2: [p3[0] - 115, yj - 27], p3, yj, yEnd: yj - 16 }); }
  function bez(T, s) { const m = 1 - s, a = m * m * m, b = 3 * m * m * s, c = 3 * m * s * s, d = s * s * s; return [a * T.p0[0] + b * T.p1[0] + c * T.p2[0] + d * T.p3[0], a * T.p0[1] + b * T.p1[1] + c * T.p2[1] + d * T.p3[1]]; }
  const MIC = []; for (let i = 0; i < 84; i++) MIC.push({ x: 92 + rnd(i, 31) * 118, y: DA.y0 + 14 + rnd(i, 32) * (DA.y1 - DA.y0 - 28), kind: i % 3, a: rnd(i, 33) * TAU, s: 0.8 + 0.5 * rnd(i, 34) });
  const MARROW = []; for (let i = 0; i < 22; i++) MARROW.push({ x: 694 + rnd(i, 41) * 250, y: DA.y0 + rnd(i, 42) * (DA.y1 - DA.y0), rx: 16 + 22 * rnd(i, 43), ry: 10 + 16 * rnd(i, 44), a: (rnd(i, 45) - 0.5) * 1.6 });
  const LDOT = []; for (let i = 0; i < 150; i++) LDOT.push({ x: 330 + rnd(i, 51) * 560, y: 500 + rnd(i, 52) * 440, r: 2.2 + 2 * rnd(i, 53) });
  // clastic cells: lobe index, position along the bowl (u = offset / half-height), arrival time
  const RCELL = [{ L: 0, u: -0.04, t0: 6.0 }, { L: 1, u: 0.02, t0: 6.3 }, { L: 0, u: 0.46, t0: 9.0 }, { L: 0, u: -0.54, t0: 9.8 }, { L: 1, u: 0.55, t0: 10.3 }];
  const BCELL = [{ L: 0, u: 0.0, t0: 6.4 }, { L: 1, u: 0.06, t0: 6.9 }, { L: 1, u: 0.56, t0: 8.9 }, { L: 0, u: -0.52, t0: 9.9 }];
  const lobeH = (L, G) => lerp(L.h0, L.h1, Math.pow(clamp((G - L.lag) / (1 - L.lag)), 0.8));

  /** multinucleated clastic cell: dome sitting on the front `arr` at height y, ruffled border toward the tissue */
  function clast(arr, y, dir, sc, alpha, seed, t, shift = 0) {
    if (alpha <= 0.01 || sc <= 0.05) return;
    const x = atY(arr, y), sl = (atY(arr, y + 7) - atY(arr, y - 7)) / 14;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x, y); ctx.rotate(-Math.atan(sl)); ctx.scale(dir * sc, sc); ctx.translate(1 + shift, 0);
    ctx.beginPath(); ctx.moveTo(0, -27);
    ctx.bezierCurveTo(19, -31, 32, -18, 32, 0); ctx.bezierCurveTo(32, 18, 19, 31, 0, 27);
    for (let i = 0; i < 6; i++) { const y0 = 27 - i * 9, y1 = y0 - 9, w = 4.4 + 1.6 * Math.sin(t * 5 + i * 1.7 + seed); ctx.quadraticCurveTo(-w, (y0 + y1) / 2, 0, y1); }
    ctx.closePath();
    ctx.fillStyle = C.R; ctx.fill(); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = C.K; ctx.stroke();
    ctx.fillStyle = '#3A0A0E';
    [[12, -13.5], [17.5, 0.5], [11.5, 14]].forEach(([nx, ny]) => { circle(ctx, nx, ny, 5); ctx.fill(); });
    ctx.restore();
  }
  function leader(x0, y0, x1, y1) {
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = C.WH; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = C.K; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = C.WH; circle(ctx, x1, y1, 9.5); ctx.fill(); ctx.fillStyle = C.K; circle(ctx, x1, y1, 6.5); ctx.fill();
    ctx.restore();
  }
  function callout(label, x, y) {
    const f = bc(700, 36), padX = 16, h = 56, w = tw(label, f, 0.8) + padX * 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.K; rrect(ctx, x, y, w, h, 7); ctx.fill(); ctx.restore();
    txt(label, x + padX, y + 40, f, C.Y, 'left', 0.8);
    return w;
  }
  function caoh(x, y, px, color, align = 'left') {
    const f = bc(700, px), fs = bc(700, px * 0.64), wa = tw('Ca(OH)', f), wb = tw('2', fs);
    let x0 = x; if (align === 'center') x0 = x - (wa + wb + 1) / 2; else if (align === 'right') x0 = x - (wa + wb + 1);
    txt('Ca(OH)', x0, y, f, color); txt('2', x0 + wa + 1, y + px * 0.17, fs, color);
  }
  function locator(x, y) {     // where on the tooth this cutaway sits
    const w = 124, h = 152;
    ctx.fillStyle = C.K; rrect(ctx, x, y, w, h, 8); ctx.fill();
    const s = 0.57, tx = x + w / 2 - 50 * s - 10, ty = y + 13;
    ctx.save(); rrect(ctx, x + 8, ty + 100 * s, w - 16, 126 * s, [0, 0, 4, 4]); ctx.clip();
    ctx.fillStyle = '#77726a'; ctx.fillRect(x, y, w, h);
    toothPath(ctx, tx, ty, s); ctx.strokeStyle = C.K; ctx.lineWidth = 9 * s; ctx.stroke();
    ctx.restore();
    toothPath(ctx, tx, ty, s); ctx.fillStyle = C.Y; ctx.fill();
    canalPath(ctx, tx, ty, s, 1.4); ctx.fillStyle = C.K; ctx.fill();
    ctx.strokeStyle = C.WH; ctx.lineWidth = 7; ctx.strokeRect(tx + 44 * s, ty + 124 * s, 56 * s, 50 * s);
    ctx.strokeStyle = C.R; ctx.lineWidth = 4; ctx.strokeRect(tx + 44 * s, ty + 124 * s, 56 * s, 50 * s);
  }

  function sceneCut(t) {
    const G = Math.pow(clamp((t - 5.85) / (T_GEND - 5.85)), 1.2);
    const sweepU = seg(t, T_SWEEP[0], T_SWEEP[1]);
    const yf = lerp(DA.y0 - 8, DA.y1 + 8, sweepU);
    const lining = seg(t, 14.1, 15.1, ease.inOut);
    const rp = seg(t, 14.2, 15.9, ease.inOut);
    const la = seg(G, 0, 0.1) * (1 - seg(t, 14.2, 15.5, ease.inOut));
    for (let i = 0; i < NY; i++) { D[i] = Dfn(YS[i], G); E[i] = Efn(YS[i], G); }
    // repair target for the bone front: offset curve of the (lined) root surface, so the re-formed PDL space
    // has a uniform width and follows the crater contour (the defect is lined, not refilled)
    for (let i = 0; i < NY; i++) { const m = clamp(D[i] / 8); XR[i] = XS[i] - D[i]; TMP[i] = lerp(XS[i] + CEMW, XR[i] + LINW, m); }
    const dyS = YS[1] - YS[0], KO = Math.ceil(PDLW / dyS);
    for (let i = 0; i < NY; i++) {
      let mx = -1e9;
      for (let k = -KO; k <= KO; k++) { const j = clamp(i + k, 0, NY - 1), dy = k * dyS; if (Math.abs(dy) < PDLW) mx = Math.max(mx, TMP[j] + Math.sqrt(PDLW * PDLW - dy * dy)); }
      DS[i] = mx + (XBS[i] - XS[i] - CEMW - PDLW);
    }
    for (let i = 0; i < NY; i++) {
      const d = D[i], e = E[i], m = clamp(d / 8);
      XB[i] = lerp(XBS[i] + e, DS[i], rp);
      LN[i] = XR[i] + LINW * lining * m;
      PL[i] = lerp(XS[i] + CEMW, LN[i], m);
      const act = d > 0.01 || e > 0.5, mid = (PL[i] + XB[i]) / 2;
      LA[i] = act ? XR[i] : mid; LB[i] = act ? XB[i] : mid;
    }
    // ---- panel
    plate(CP.x, CP.y, CP.w, CP.h, { r: 14, bevel: false });
    ctx.save(); rrect(ctx, DA.x0, DA.y0, DA.x1 - DA.x0, DA.y1 - DA.y0, 6); ctx.clip();
    ctx.fillStyle = C.OW; ctx.fillRect(DA.x0, DA.y0, DA.x1 - DA.x0, DA.y1 - DA.y0);
    // bone
    ctx.save(); band(XB, XE1); ctx.fillStyle = C.BONE; ctx.fill(); ctx.clip();
    ctx.fillStyle = C.MARROW;
    for (const mb of MARROW) { ctx.beginPath(); ctx.ellipse(mb.x, mb.y, mb.rx, mb.ry, mb.a, 0, TAU); ctx.fill(); }
    ctx.restore();
    // PDL fibers
    ctx.lineCap = 'round'; ctx.lineWidth = 2.2;
    for (let y = DA.y0 + 8; y < DA.y1 + 14; y += 13) {
      const xl = atY(PL, y), xr = atY(XB, y - 12), wdt = xr - xl, a = 1 - seg(wdt, 96, 150);
      if (a <= 0.01) continue;
      ctx.strokeStyle = `rgba(171,167,157,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(xl + 2, y); ctx.lineTo(xr - 3, y - 12); ctx.stroke();
    }
    // lesion (inflamed granulation tissue)
    if (la > 0.005) {
      ctx.save(); band(LA, LB); ctx.globalAlpha = la; ctx.fillStyle = C.RL; ctx.fill(); ctx.clip();
      ctx.fillStyle = 'rgba(160,24,34,0.42)';
      for (const p of LDOT) { circle(ctx, p.x + 3 * noise1(t * 0.6 + p.y * 0.1, 8), p.y + 3 * noise1(t * 0.6 + p.x * 0.1, 9), p.r); ctx.fill(); }
      ctx.restore();
    }
    // lamina dura / bone front
    ctx.strokeStyle = C.LD; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < NY; i++) ctx.lineTo(XB[i], YS[i]);
    ctx.stroke();
    // dentin + tubules
    ctx.save(); band(XC, XR); ctx.fillStyle = C.DEN; ctx.fill(); ctx.clip();
    ctx.strokeStyle = C.TUB; ctx.lineWidth = 1.7;
    for (const T of TUBS) { ctx.beginPath(); ctx.moveTo(T.p0[0], T.p0[1]); ctx.bezierCurveTo(T.p1[0], T.p1[1], T.p2[0], T.p2[1], T.p3[0], T.p3[1]); ctx.stroke(); }
    const flowA = 1 - seg(t, T_SWEEP[1], T_SWEEP[1] + 0.8);
    if (flowA > 0.01) for (const T of TUBS) {
      const open = T.yEnd > DA.y0 && T.yEnd < DA.y1 ? clamp(atY(D, T.yEnd) / 6) : 0; if (open <= 0.01) continue;
      ctx.strokeStyle = `rgba(211,31,42,${(0.3 * open * flowA).toFixed(3)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(T.p0[0], T.p0[1]); ctx.bezierCurveTo(T.p1[0], T.p1[1], T.p2[0], T.p2[1], T.p3[0], T.p3[1]); ctx.stroke();
    }
    ctx.restore();
    // cementum (intact runs) + new cementum-like lining of the crater
    ctx.fillStyle = C.CEM;
    for (const [a, b] of runs((i) => D[i] <= 0.01)) {
      ctx.beginPath();
      for (let i = a; i <= b; i++) ctx.lineTo(XS[i], YS[i]);
      for (let i = b; i >= a; i--) ctx.lineTo(XS[i] + CEMW, YS[i]);
      ctx.closePath(); ctx.fill();
    }
    const crater = runs((i) => D[i] > 0.01);
    if (lining > 0.01) {
      ctx.save(); band(XR, XE1); ctx.clip();
      ctx.strokeStyle = C.CEM; ctx.lineWidth = 2 * LINW * lining; ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
      for (const [a, b] of crater) { ctx.beginPath(); for (let i = a; i <= b; i++) ctx.lineTo(XR[i], YS[i]); ctx.stroke(); }
      ctx.restore();
    }
    // resorbing root front
    ctx.strokeStyle = C.K; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    for (const [a, b] of crater) { ctx.beginPath(); for (let i = a; i <= b; i++) ctx.lineTo(XR[i], YS[i]); ctx.stroke(); }
    // canal: infected / necrotic
    ctx.save(); band(XE0, XC); ctx.fillStyle = '#191919'; ctx.fill(); ctx.clip();
    if (sweepU < 1) {
      ctx.fillStyle = '#3d3d3d';
      for (let i = 0; i < 40; i++) { const x = 84 + rnd(i, 61) * 140, y = DA.y0 + rnd(i, 62) * (DA.y1 - DA.y0); ctx.fillRect(x, y, 3 + 5 * rnd(i, 63), 3 + 4 * rnd(i, 64)); }
      ctx.fillStyle = C.RB; ctx.strokeStyle = C.RB; ctx.lineCap = 'round';
      for (let i = 0; i < MIC.length; i++) {
        const mcb = MIC[i]; if (mcb.y < yf - 6) continue;
        const x = mcb.x + 5 * noise1(t * 0.8 + i * 2.3, 14), y = mcb.y + 5 * noise1(t * 0.8 + i * 3.7, 15), an = mcb.a + 0.6 * noise1(t * 0.5 + i, 16), s = mcb.s;
        const dx = Math.cos(an), dy = Math.sin(an);
        if (mcb.kind === 0) { circle(ctx, x - dx * 5.5 * s, y - dy * 5.5 * s, 5.4 * s); ctx.fill(); circle(ctx, x + dx * 5.5 * s, y + dy * 5.5 * s, 5.4 * s); ctx.fill(); }
        else if (mcb.kind === 1) { ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.moveTo(x - dx * 9 * s, y - dy * 9 * s); ctx.lineTo(x + dx * 9 * s, y + dy * 9 * s); ctx.stroke(); }
        else { for (let k = -1; k <= 1; k++) { circle(ctx, x + dx * k * 9.5 * s, y + dy * k * 9.5 * s + (k === 0 ? 2 : 0), 4.6 * s); ctx.fill(); } }
      }
    }
    // canal: disinfected + calcium hydroxide dressing (above the front)
    if (sweepU > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(DA.x0 - 6, DA.y0 - 10, 260, yf - (DA.y0 - 10)); ctx.clip();
      ctx.fillStyle = C.BL; ctx.fillRect(DA.x0 - 6, DA.y0 - 10, 260, DA.y1 - DA.y0 + 20);
      ctx.fillStyle = 'rgba(11,90,169,0.22)';
      for (let gy = DA.y0 + 6; gy < DA.y1; gy += 21) for (let gx = 84; gx < 240; gx += 21) { const k = (gx * 7 + gy * 13) | 0; circle(ctx, gx + 9 * rnd(k, 71), gy + 9 * rnd(k, 72), 2 + 1.8 * rnd(k, 73)); ctx.fill(); }
      ctx.restore();
      if (sweepU < 1) { ctx.fillStyle = C.B; ctx.fillRect(DA.x0 - 6, yf - 5, 260, 10); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(DA.x0 - 6, yf - 10, 260, 4); }
    }
    ctx.restore();
    ctx.strokeStyle = C.K; ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < NY; i++) ctx.lineTo(XC[i], YS[i]); ctx.stroke();
    // brief highlight of the denuded patch (links back to "damaged root surface")
    const hl = Math.min(seg(t, 5.95, 6.25), 1 - seg(t, 7.0, 7.6));
    if (hl > 0.01) {
      ctx.save(); ctx.globalAlpha = hl; ctx.strokeStyle = C.R; ctx.lineWidth = 5; ctx.setLineDash([14, 9]); ctx.lineDashOffset = -t * 30;
      rrect(ctx, atY(XS, 716) - 22, PATCH[0] - 16, CEMW + 44, PATCH[1] - PATCH[0] + 32, 12); ctx.stroke(); ctx.restore();
    }
    // toxin particles in the tubules (schematic)
    for (let j = 0; j < TUBS.length; j++) {
      const T = TUBS[j], inside = T.yEnd > DA.y0 && T.yEnd < DA.y1, open = inside ? clamp(atY(D, T.yEnd) / 6) : 0;
      const tCut = T_SWEEP[0] + (T_SWEEP[1] - T_SWEEP[0]) * clamp((T.yj - DA.y0) / (DA.y1 - DA.y0));
      for (let k = 0; k < 4; k++) {
        if (k > 0 && open <= 0.01) continue;
        const v = 0.4 + 0.12 * rnd(j, k, 1), s = (t * v + rnd(j, k, 2)) % 1, te = t - s / v;
        if (te > tCut) continue;
        const [px, py] = bez(T, s), xf = atY(XR, py);
        let aOpen = clamp(s / 0.07); if (px > xf) aOpen *= 1 - clamp((px - xf) / 52);
        const aClosed = 0.42 * clamp(s / 0.07) * (1 - seg(s, 0.76, 0.97));
        const a = k === 0 ? lerp(aClosed, aOpen, open) : aOpen * open;
        if (a <= 0.02) continue;
        ctx.globalAlpha = a; ctx.fillStyle = C.R; circle(ctx, px, py, lerp(3.1, 4.9, open)); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // clastic cells
    RCELL.forEach((c, i) => {
      const u = pu(t, c.t0, 0.5), lv = seg(t, 13.45 + i * 0.07, 14.15 + i * 0.07, ease.inOut);
      if (u <= 0 || lv >= 1) return;
      const L = RLOBE[c.L], y = L.yc + c.u * lobeH(L, G);
      clast(XR, y, 1, 0.92 * (1 + 0.04 * Math.sin(t * 3 + i)) * ease.outBack(u) * (1 - 0.4 * lv), clamp(u * 2) * (1 - lv), i * 2.1, t, 36 * lv);
    });
    BCELL.forEach((c, i) => {
      const u = pu(t, c.t0, 0.5), lv = seg(t, 13.5 + i * 0.07, 14.2 + i * 0.07, ease.inOut);
      if (u <= 0 || lv >= 1) return;
      const L = BLOBE[c.L], y = L.yc + c.u * lobeH(L, G);
      clast(XB, y, -1, 0.92 * (1 + 0.04 * Math.sin(t * 3 + i + 2)) * ease.outBack(u) * (1 - 0.4 * lv), clamp(u * 2) * (1 - lv), i * 1.3 + 4, t, 36 * lv);
    });
    // locator + schematic note
    locator(804, 398);
    txt('SCHEMATIC · NOT TO SCALE', DA.x1 - 16, DA.y1 - 16, bc(600, 24), 'rgba(19,19,19,0.78)', 'right', 0.8);
    // fix: blue mandatory header drops in
    const hU = seg(t, S.fix + 0.05, S.fix + 0.4, ease.out);
    if (hU > 0) {
      const hy = DA.y0 - 66 * (1 - hU);
      ctx.fillStyle = C.B; ctx.fillRect(DA.x0, hy, DA.x1 - DA.x0, 64);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(DA.x0, hy + 64, DA.x1 - DA.x0, 4);
      // arrow down into the canal
      ctx.fillStyle = C.WH; const ax = 153, ay = hy + 32;
      ctx.beginPath(); ctx.moveTo(ax - 9, ay - 18); ctx.lineTo(ax + 9, ay - 18); ctx.lineTo(ax + 9, ay); ctx.lineTo(ax + 22, ay); ctx.lineTo(ax, ay + 21); ctx.lineTo(ax - 22, ay); ctx.lineTo(ax - 9, ay); ctx.closePath(); ctx.fill();
      txt('DISINFECT THE CANAL', 250, hy + 47, bc(700, 42), C.WH, 'left', 1.4);
    }
    const aCa = seg(t, 12.95, 13.25);
    if (aCa > 0) { ctx.save(); ctx.globalAlpha = aCa; caoh(153, 470 + 10 * (1 - ease.out(aCa)), 38, C.K, 'center'); ctx.restore(); }
    ctx.restore();   // end drawing-area clip

    // ---- callouts
    const aTox = seg(t, 6.2, 6.55) * (1 - seg(t, S.fix + 0.05, S.fix + 0.35));
    if (aTox > 0) {
      ctx.save(); ctx.globalAlpha = aTox; const ly = 396 - 12 * (1 - ease.out(aTox));
      leader(402, ly + 50, 402, 612); callout('TOXINS VIA TUBULES', 252, ly); ctx.restore();
    }
    const aRB = seg(t, 8.8, 9.15) * (1 - seg(t, 13.3, 13.7));
    if (aRB > 0) {
      ctx.save(); ctx.globalAlpha = aRB; const ly = 962 + 12 * (1 - ease.out(aRB)), f = bc(700, 36), w = tw('ROOT + BONE RESORB', f, 0.8) + 32, lx = 648 - w / 2;
      leader(lx + 44, ly + 6, atY(XR, 842) + 6, 842); leader(lx + w - 44, ly + 6, atY(XB, 852) - 6, 852);
      callout('ROOT + BONE RESORB', lx, ly); ctx.restore();
    }
    // lock-out tag
    const uT = pu(t, T_TAG, 0.4);
    if (uT > 0) stamp(uT, 292, 752, () => {
      ctx.save(); ctx.translate(292, 752); ctx.rotate(4 * RAD);
      const f = anton(44), w = tw('STIMULUS CUT', f, 1) + 100, h = 88;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
      ctx.fillStyle = C.R; rrect(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.restore();
      ctx.strokeStyle = C.WH; ctx.lineWidth = 3; rrect(ctx, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 6); ctx.stroke();
      ctx.fillStyle = C.WH; circle(ctx, -w / 2 + 40, 0, 15); ctx.fill(); ctx.fillStyle = C.K; circle(ctx, -w / 2 + 40, 0, 8); ctx.fill();
      ctx.strokeStyle = C.K; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 40, 0); ctx.quadraticCurveTo(-w / 2 + 34, -74, -w / 2 + 6, -92); ctx.stroke();
      txt('STIMULUS CUT', -w / 2 + 70, 17, f, C.WH, 'left', 1);
      ctx.restore();
    }, 1.5);

    // ---- lower plate: timer, then the outcome plate
    const fu = seg(t, T_FLIP[0], T_FLIP[1]), pcy = TP.y + TP.h / 2;
    const flip = (sy, fn) => { ctx.save(); ctx.translate(0, pcy); ctx.scale(1, Math.max(0.002, sy)); ctx.translate(0, -pcy); fn(); ctx.restore(); };
    if (fu < 0.5) flip(1 - ease.in(fu * 2), () => timerPlate(t)); else flip(ease.out((fu - 0.5) * 2), () => statPlate(t));
    // source line (one per beat)
    const aS1 = seg(t, 6.3, 6.7) * (1 - seg(t, T_FLIP[0] - 0.1, T_FLIP[0] + 0.15)), aS2 = seg(t, T_FLIP[1], T_FLIP[1] + 0.35);
    const srcLine = (s, a) => { if (a <= 0) return; const px = fit(s, (p) => bc(500, p), COL.w - 8, 26, 0.2); ctx.save(); ctx.globalAlpha = a; txt(s, COL.x0 + 4, 1540, bc(500, px), 'rgba(19,19,19,0.86)', 'left', 0.2); ctx.restore(); };
    srcLine('Tubule pathway: Andreasen 1981 J Endod — a theory from monkey histology', aS1);
    srcLine('Cvek 1992 Endod Dent Traumatol · luxated non-vital incisors · calcium hydroxide, then GP · radiographic', aS2);
  }

  // ---- timer plate
  const TP = { x: 64, y: 1124, w: 886, h: 376 };
  const HAND = [[5.9, 0], [6.8, 46], [8.2, 138], [9.6, 246], [T_GEND, 330]];
  function handAng(t) { if (t <= HAND[0][0]) return 0; for (let i = 1; i < HAND.length; i++) if (t <= HAND[i][0]) return lerp(HAND[i - 1][1], HAND[i][1], (t - HAND[i - 1][0]) / (HAND[i][0] - HAND[i - 1][0])); return HAND[HAND.length - 1][1]; }
  function timerPlate(t) {
    plate(TP.x, TP.y, TP.w, TP.h, { r: 16 });
    // dial
    const cx = TP.x + 146, cy = TP.y + 132, R = 98, ang = handAng(t);
    ctx.fillStyle = '#0A0A0A'; circle(ctx, cx, cy, R); ctx.fill();
    ctx.strokeStyle = C.Y; ctx.lineWidth = 7; circle(ctx, cx, cy, R); ctx.stroke();
    if (ang > 0.5) {
      ctx.fillStyle = C.R; ctx.beginPath(); ctx.arc(cx, cy, R - 24, -Math.PI / 2, -Math.PI / 2 + ang * RAD); ctx.arc(cx, cy, 26, -Math.PI / 2 + ang * RAD, -Math.PI / 2, true); ctx.closePath(); ctx.fill();
    }
    ctx.lineCap = 'butt';
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU - Math.PI / 2, big = i % 4 === 0, r0 = R - (big ? 20 : 14), r1 = R - 7;
      ctx.strokeStyle = big ? 'rgba(255,204,0,0.95)' : 'rgba(255,204,0,0.5)'; ctx.lineWidth = big ? 4 : 2.5;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
    }
    // milestone markers
    [46, 138, 246].forEach((deg, k) => {
      const a = deg * RAD - Math.PI / 2, on = t >= LIT[k], col = on ? (k === 2 ? C.RB : C.Y) : '#555';
      const px = cx + Math.cos(a) * (R + 13), py = cy + Math.sin(a) * (R + 13);
      ctx.save(); ctx.translate(px, py); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(-9, -8); ctx.lineTo(9, -8); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    const ha = ang * RAD - Math.PI / 2;
    ctx.lineCap = 'round'; ctx.strokeStyle = C.WH; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(cx - Math.cos(ha) * 16, cy - Math.sin(ha) * 16); ctx.lineTo(cx + Math.cos(ha) * (R - 16), cy + Math.sin(ha) * (R - 16)); ctx.stroke();
    ctx.fillStyle = C.Y; circle(ctx, cx, cy, 13); ctx.fill(); ctx.fillStyle = C.K; circle(ctx, cx, cy, 5); ctx.fill();
    txt('AFTER REPLANTATION', cx, TP.y + 266, bc(600, 23), 'rgba(255,204,0,0.92)', 'center', 1.2);
    txt('TIMELINE SCHEMATIC', cx, TP.y + 292, bc(600, 23), 'rgba(255,255,255,0.72)', 'center', 1.2);
    // rows
    const rows = [['BY WEEK 1', 'histology (monkey)', 'Andreasen 1980', 'Swed Dent J'], ['~1 MONTH', 'usually on X-ray', 'Andreasen et al. 1995', 'Endod Dent Traumatol'], ['MONTHS', 'untreated: root can be lost', 'Patel et al. 2022', 'Int Endod J (review)']];
    const rx = TP.x + 306;
    rows.forEach(([lab, cap, c1, c2], k) => {
      const y0 = TP.y + 18 + k * 91, u = seg(t, LIT[k], LIT[k] + 0.35, ease.out), glow = seg(t, LIT[k], LIT[k] + 0.12) * (1 - seg(t, LIT[k] + 0.12, LIT[k] + 0.7));
      if (glow > 0) { ctx.fillStyle = `rgba(255,204,0,${(0.2 * glow).toFixed(3)})`; rrect(ctx, rx - 12, y0, TP.x + TP.w - 14 - (rx - 12), 86, 8); ctx.fill(); }
      // lamp
      const lcol = k === 2 ? C.RB : C.Y;
      ctx.fillStyle = u > 0 ? lcol : '#3a3a3a'; circle(ctx, rx + 10, y0 + 27, 10); ctx.fill();
      if (u > 0) { ctx.strokeStyle = k === 2 ? 'rgba(236,53,64,0.35)' : 'rgba(255,204,0,0.35)'; ctx.lineWidth = 5; circle(ctx, rx + 10, y0 + 27, 15); ctx.stroke(); }
      const lf = anton(46);
      if (k === 2 && u > 0) {
        const w = tw(lab, lf, 1) + 26; ctx.fillStyle = C.R; ctx.globalAlpha = u; rrect(ctx, rx + 34, y0 + 2, w, 50, 6); ctx.fill(); ctx.globalAlpha = 1;
        txt(lab, rx + 47, y0 + 44, lf, C.WH, 'left', 1);
      } else txt(lab, rx + 36, y0 + 44, lf, u > 0 ? C.Y : '#565656', 'left', 1);
      if (u > 0) {
        ctx.save(); ctx.globalAlpha = u; txt(cap, rx + 36 + 10 * (1 - u), y0 + 80, bc(600, 33), '#F3F1EA', 'left', 0.4);
        const cxr = TP.x + TP.w - 26, cf = bc(500, 23);
        txt(c1, cxr, y0 + 32, cf, 'rgba(255,255,255,0.64)', 'right', 0.3); txt(c2, cxr, y0 + 58, cf, 'rgba(255,255,255,0.64)', 'right', 0.3);
        ctx.restore();
      }
    });
    // IADT quote strip (slot is hatched until it arrives)
    const su = seg(t, T_STRIP, T_STRIP + 0.4, ease.out);
    {
      const sx = TP.x + 14, sy = TP.y + 300, sw = TP.w - 28, sh = 62;
      ctx.save(); rrect(ctx, sx, sy, sw, sh, 8); ctx.clip();
      ctx.fillStyle = '#0c0c0c'; ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#2b2b2b';
      for (let x = sx - sh; x < sx + sw + sh; x += 44) { ctx.beginPath(); ctx.moveTo(x, sy + sh); ctx.lineTo(x + 22, sy + sh); ctx.lineTo(x + 22 + sh, sy); ctx.lineTo(x + sh, sy); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    if (su > 0) {
      const sx = TP.x + 14, sy = TP.y + 300, sw = TP.w - 28, sh = 62;
      ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw * su, sh); ctx.clip();
      ctx.fillStyle = C.R; rrect(ctx, sx, sy, sw, sh, 8); ctx.fill();
      const ix = sx + 36, iy = sy + 32;
      ctx.fillStyle = C.WH; roundedPoly(ctx, [[ix, iy - 19], [ix + 20, iy + 15], [ix - 20, iy + 15]], 3); ctx.fill();
      ctx.fillStyle = C.R; ctx.fillRect(ix - 2.2, iy - 8, 4.4, 12); ctx.fillRect(ix - 2.2, iy + 7, 4.4, 4.4);
      txt('“VERY RAPID IN CHILDREN”', sx + 70, sy + 45, bc(700, 40), C.WH, 'left', 1);
      txt('— IADT 2020', sx + sw - 20, sy + 44, bc(600, 32), 'rgba(255,255,255,0.95)', 'right', 0.6);
      ctx.restore();
    }
  }
  // ---- outcome plate
  function statPlate(t) {
    plate(TP.x, TP.y, TP.w, TP.h, { r: 16 });
    const big = '97%', bf = anton(190);
    const x0 = TP.x + 36, by = TP.y + 36 + capH(bf);
    txt(big, x0, by, bf, C.Y, 'left', 0);
    const bx = x0 + tw('97%', bf) + 34;
    txt('HEALED', bx, TP.y + 36 + capH(anton(98)), anton(98), C.WH, 'left', 2);
    txt('192 of 197 resorbing teeth', bx, by - 2, bc(600, 43), '#F3F1EA', 'left', 0.3);
    // 197-lamp matrix
    const cols = 50, mx0 = TP.x + 40, mx1 = TP.x + TP.w - 40, pitch = (mx1 - mx0) / (cols - 1), my0 = by + 40;
    const lit = Math.round(192 * seg(t, T_FLIP[1], T_FLIP[1] + 1.1, ease.out));
    for (let i = 0; i < 197; i++) {
      const cxp = mx0 + (i % cols) * pitch, cyp = my0 + Math.floor(i / cols) * pitch;
      if (i < 192) { ctx.fillStyle = i < lit ? C.Y : '#3a3a3a'; circle(ctx, cxp, cyp, 5.6); ctx.fill(); }
      else { ctx.strokeStyle = '#B9B4A8'; ctx.lineWidth = 2.4; circle(ctx, cxp, cyp, 4.6); ctx.stroke(); }
    }
    const ly = my0 + 3 * pitch + 44;
    ctx.fillStyle = C.Y; circle(ctx, mx0, ly - 8, 5.6); ctx.fill();
    txt('healed', mx0 + 14, ly, bc(500, 25), 'rgba(255,255,255,0.8)', 'left', 0.4);
    const w1 = tw('healed', bc(500, 25), 0.4);
    ctx.strokeStyle = '#B9B4A8'; ctx.lineWidth = 2.4; circle(ctx, mx0 + w1 + 50, ly - 8, 4.6); ctx.stroke();
    txt('5 went on to ankylosis', mx0 + w1 + 64, ly, bc(500, 25), 'rgba(255,255,255,0.8)', 'left', 0.4);
  }

  // ================================================================== SCENE 4 — end card
  function sceneEnd(t) {
    const cx = COL.cx, t0 = S.end + WD / 2 - 0.12;
    // mini equation recap (pictograms only): no infected canal -> no inflammatory resorption
    const my = 390, r = 64, xs_ = [cx - 240, cx - 52, cx + 164], uS = seg(t, t0 + 0.55, t0 + 0.95, ease.inOut), uS2 = seg(t, t0 + 0.8, t0 + 1.2, ease.inOut);
    diamondSign(xs_[0], my, r, { shadow: false }); pictoDamaged(xs_[0] - 3, my + 1, 70, t, C.WH, 1);
    diamondSign(xs_[1], my, r, { shadow: false }); pictoInfected(xs_[1], my + 1, 70, t, C.WH);
    ctx.fillStyle = C.K; ctx.fillRect(cx - 146 - 18, my - 5.5, 36, 11); ctx.fillRect(cx - 146 - 5.5, my - 18, 11, 36);
    ctx.fillRect(cx + 38, my - 14, 36, 10); ctx.fillRect(cx + 38, my + 4, 36, 10);
    triSign(xs_[2], my - 66, 140, { edge: C.WH, shadow: false, edgeW: 3 }); pictoResorbed(xs_[2], my + 9, 60, t, C.Y, 1);
    const slash = (x, u, len) => {
      if (u <= 0) return; ctx.save(); ctx.lineCap = 'round';
      const x0 = x + len, y0 = my - len, x1 = lerp(x0, x - len, u), y1 = lerp(y0, my + len, u);
      ctx.strokeStyle = C.WH; ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = C.B; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
    };
    slash(xs_[1], uS, 53); slash(xs_[2], uS2, 49);
    // mandatory sign
    const sy = 712, R = 226;
    mandSign(cx, sy, R, t);
    // title
    const p1 = fit('TREAT THE CANAL', anton, COL.w - 6, 150), c1 = capH(anton(p1)), b1 = sy + R + 38 + c1;
    txt('TREAT THE CANAL', cx, b1, anton(p1), C.K, 'center');
    // EARLY block with dial
    const ey = b1 + 26, eh = 138, ef = anton(118), ew = tw('EARLY', ef, 4), bw = ew + 190, ex = cx - bw / 2;
    ctx.save(); ctx.shadowColor = 'rgba(40,24,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.fillStyle = C.R; rrect(ctx, ex, ey, bw, eh, 12); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; rrect(ctx, ex + 8, ey + 8, bw - 16, eh - 16, 7); ctx.stroke();
    const dcx = ex + 78, dcy = ey + eh / 2, dR = 40, da = ((t - S.end) * 70) % 360;
    ctx.fillStyle = C.WH; circle(ctx, dcx, dcy, dR); ctx.fill();
    ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(dcx, dcy); ctx.arc(dcx, dcy, dR - 7, -Math.PI / 2, -Math.PI / 2 + 70 * RAD); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.K; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const ha = (20 + 50 * (0.5 + 0.5 * Math.sin(da * RAD))) * RAD - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(dcx, dcy); ctx.lineTo(dcx + Math.cos(ha) * (dR - 11), dcy + Math.sin(ha) * (dR - 11)); ctx.stroke();
    ctx.fillStyle = C.K; circle(ctx, dcx, dcy, 5); ctx.fill(); ctx.fillRect(dcx - 6, dcy - dR - 9, 12, 9);
    txt('EARLY', ex + 138, ey + (eh + capH(ef)) / 2, ef, C.WH, 'left', 4);
    // guideline plate
    const gy = ey + eh + 28, gh = 158;
    plate(COL.x0, gy, COL.w, gh, { r: 14, rivets: false });
    txt('REPLANTED MATURE TOOTH', COL.x0 + 30, gy + 52, bc(700, 38), C.Y, 'left', 1.6);
    const p2 = fit('START RCT WITHIN 2 WEEKS', anton, COL.w - 60, 72, 1);
    txt('START RCT WITHIN 2 WEEKS', COL.x0 + 30, gy + 134, anton(p2), C.WH, 'left', 1);
    const cf = bc(700, 30), cw = tw('IADT 2020', cf, 1) + 28;
    ctx.fillStyle = C.Y; rrect(ctx, COL.x1 - 22 - cw, gy + 16, cw, 44, 6); ctx.fill();
    txt('IADT 2020', COL.x1 - 22 - cw + 14, gy + 49, cf, C.K, 'left', 1);
    const src = 'Fouad et al. 2020 Dent Traumatol (IADT avulsion guideline) · mature = closed apex';
    txt(src, COL.x0 + 4, gy + gh + 38, bc(500, fit(src, (p) => bc(500, p), COL.w - 8, 26, 0.2)), 'rgba(19,19,19,0.86)', 'left', 0.2);
  }

  // ------------------------------------------------------------------ scene plumbing + hazard-tape wipe
  function clipContent() {
    ctx.beginPath(); ctx.rect(FACE.x, CONTENT_TOP, FACE.w, FACE.y + FACE.h - CONTENT_TOP); ctx.clip();
    rrect(ctx, FACE.x, FACE.y, FACE.w, FACE.h, FACE.r); ctx.clip();
  }
  function sceneRaw(name, t) { if (name === 'hook') sceneHook(t); else if (name === 'eq') sceneEq(t); else if (name === 'cut') sceneCut(t); else sceneEnd(t); }
  function drawScene(name, t) { ctx.save(); clipContent(); sceneRaw(name, t); ctx.restore(); }
  const WA = 24 * RAD, WCOS = Math.cos(WA), WSIN = Math.sin(WA), BW = 290;
  const U0 = FACE.x * WCOS + CONTENT_TOP * WSIN, U1 = (FACE.x + FACE.w) * WCOS + (FACE.y + FACE.h) * WSIN;
  function drawWipe(t, wp) {
    const p = ease.inOut(clamp((t - wp.t0) / WD)), F = lerp(U0 - 12, U1 + BW + 12, p);
    drawScene(wp.a, t);
    ctx.save(); clipContent();
    ctx.save(); ctx.rotate(WA); ctx.beginPath(); ctx.rect(-4000, -4000, 4000 + (F - BW + 2), 8000); ctx.restore(); ctx.clip();
    ctx.drawImage(base, 0, 0);
    sceneRaw(wp.b, wp.tb != null ? wp.tb : t);
    ctx.restore();
    ctx.save(); clipContent(); ctx.rotate(WA);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24;
    ctx.fillStyle = '#0D0D0D'; ctx.fillRect(F - BW, -4000, BW, 8000);
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.rect(F - BW + 18, -4000, BW - 36, 8000); ctx.clip();
    ctx.fillStyle = C.Y; const P = 170;
    for (let y = -4000; y < 4000; y += P) { ctx.beginPath(); ctx.moveTo(F - BW, y); ctx.lineTo(F, y - BW); ctx.lineTo(F, y - BW + P / 2); ctx.lineTo(F - BW, y + P / 2); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  function render(t) {
    t = clamp(t, 0, DUR - 1e-4);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0);
    const k = t / DUR;
    tapeH(150, 52, k * 192, 1); tapeH(1608, 52, -k * 192, -1); gutter(k * 216);
    drawTagRow();
    const wp = WIPES.find((w) => t >= w.t0 && t < w.t0 + WD);
    if (wp) drawWipe(t, wp);
    else drawScene(t < S.eq ? 'hook' : t < S.cut ? 'eq' : t < S.end ? 'cut' : 'end', t);
  }

  window.REEL = {
    title: 'External inflammatory resorption',
    duration: DUR,
    poster: 19.8,
    canvas,
    fonts: ['400 120px Anton', '500 26px "Barlow Condensed"', '600 34px "Barlow Condensed"', '700 36px "Barlow Condensed"'],
    setup() { buildBase(); },
    render,
  };
  Kit.boot(window.REEL);
})();
