/*
 * Sample 33 — Resorption 5/5 · External cervical resorption.  Style: CBCT VIEWER.
 * One full-frame canvas; render(t) is a pure function of t. The grey-scale panes are real slices / a ray-march /
 * a projection of ONE procedural volume (volume.js), so the three planes, the 3-D pane and the periapical agree.
 * SCHEMATIC anatomy and lesion — not a patient scan. See NOTES.md for every on-screen claim and its source.
 */
(function () {
  'use strict';
  const { canvas, ctx } = Kit.createCanvas();
  const { seg, ease, clamp, lerp, env, W, H } = Kit;
  const V = window.Vol;
  const SANS = '"IBM Plex Sans", sans-serif', MONO = '"IBM Plex Mono", monospace';
  const C = {
    bg: '#06080b', panel: '#0a0e13', line: '#1c242d', line2: '#2a3540',
    text: '#eef3f8', sub: '#c3cfdb', dim: '#8696a8', dimmer: '#566576',
    cyan: '#2fd3ff', magenta: '#ff62d0', yellow: '#ffd640',
    orange: '#ff8a2b', mint: '#56f0b2', ivory: '#f3e6c4', blue: '#8fd0ff',
  };
  const DUR = 24;
  // scene starts
  const TB = 2.3, TC = 5.3, TC2 = 8.0, TD = 10.7, TE1 = 13.3, TE2 = 16.5, TEND = 19.7;

  // ---------- small helpers ----------
  function kf(t, keys, e) {
    e = e || ease.inOut;
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]); return lerp(keys[i - 1][1], keys[i][1], e(u)); }
    return keys[keys.length - 1][1];
  }
  const fade = (t, a, b, fi = 0.25, fo = 0.25) => clamp(env(t, a, b, fi, fo));
  function txt(s, x, y, font, color, align, alpha, ls) {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    if (alpha != null) ctx.globalAlpha *= alpha;
    if (ls != null && 'letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
    ctx.fillText(s, x, y); ctx.restore();
  }
  function widthOf(s, font, ls) { ctx.save(); ctx.font = font; if (ls != null && 'letterSpacing' in ctx) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
  /** coloured runs on one baseline. runs: [{t, c, w}] ; returns total width */
  function runs(arr, x, y, size, align, alpha) {
    let tot = 0;
    for (const r of arr) tot += widthOf(r.t, `${r.w || 400} ${size}px ${SANS}`);
    let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
    for (const r of arr) { const f = `${r.w || 400} ${size}px ${SANS}`; txt(r.t, cx, y, f, r.c || C.sub, 'left', alpha); cx += widthOf(r.t, f); }
    return tot;
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  /** annotation chip (dark backing + text lines). anchor = top-left. returns box */
  function chip(x, y, lines, o) {
    o = o || {};
    const padX = o.padX != null ? o.padX : 14, padY = o.padY != null ? o.padY : 9, lh = o.lh || 38;
    let w = 0; for (const l of lines) w = Math.max(w, widthOf(l.t, l.f));
    const bw = w + padX * 2, bh = lines.length * lh + padY * 2 - 6;
    if (o.right) x -= bw; if (o.bottom) y -= bh;
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    rr(x, y, bw, bh, 8); ctx.fillStyle = o.bg || 'rgba(5,8,11,0.86)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.14)'; ctx.stroke();
    lines.forEach((l, i) => txt(l.t, x + padX, y + padY + lh * (i + 1) - 12, l.f, l.c));
    ctx.restore();
    return { x, y, w: bw, h: bh };
  }

  // ---------- layout ----------
  const LG = { ax: [56, 486, 481, 440], sag: [543, 486, 481, 440], cor: [56, 932, 318, 386], v3: [380, 932, 318, 386], pa: [704, 932, 320, 386] };
  const LX = { ax: [56, 486, 644, 558], sag: [706, 486, 318, 558], cor: [56, 1050, 318, 268], v3: [380, 1050, 320, 268], pa: [706, 1050, 318, 268] };
  const LP = { ax: LX.ax, sag: LX.pa, cor: LX.cor, v3: LX.v3, pa: LX.sag };
  function rect(name, t) {
    const s1 = seg(t, TC - 0.15, TC + 0.75, ease.inOut), s2 = seg(t, TE2 - 0.1, TE2 + 0.7, ease.inOut);
    const a = LG[name], b = LX[name], c = LP[name];
    const r = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) r[i] = lerp(lerp(a[i], b[i], s1), c[i], s2);
    return { x: Math.round(r[0]), y: Math.round(r[1]), w: Math.round(r[2]), h: Math.round(r[3]) };
  }

  // ---------- time → model state ----------
  function lesionP(t) { return 0.17 * seg(t, 2.8, TC, ease.smooth) + 0.83 * seg(t, TC, 14.3, (u) => 1 - Math.pow(1 - u, 1.55)); }
  function repairQ(t) { return 0.78 * seg(t, TD + 0.15, TE1, ease.smooth) + 0.22 * seg(t, TE1, 15.3, ease.smooth); }
  const sliceZ = (t) => kf(t, [[2.4, 7.4], [4.1, V.PZ], [5.4, V.PZ], [6.9, 2.4], [11.0, 2.4], [11.9, 1.2], [12.9, 2.4]]);

  // ---------- offscreen buffers (cached by parameter key) ----------
  const OFF = {};
  function off(name, bw, bh) {
    let o = OFF[name];
    if (!o) { const c = document.createElement('canvas'); o = OFF[name] = { c, x: c.getContext('2d'), img: null, key: '' }; }
    if (o.c.width !== bw || o.c.height !== bh) { o.c.width = bw; o.c.height = bh; o.img = o.x.createImageData(bw, bh); o.key = ''; }
    return o;
  }
  function blit(o, r, RS, alpha) {
    ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    ctx.fillStyle = '#000'; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(o.c, 0, 0, o.c.width, o.c.height, r.x + (r.w - o.c.width * RS) / 2, r.y + (r.h - o.c.height * RS) / 2, o.c.width * RS, o.c.height * RS);
    ctx.restore();
  }
  function mpr(name, plane, r, view, sl, p, q, tint, front, alpha) {
    const RS = 2, bw = Math.ceil(r.w / RS), bh = Math.ceil(r.h / RS);
    const o = off(name, bw, bh);
    const key = [plane, view.cu.toFixed(4), view.cv.toFixed(4), view.ppm.toFixed(3), sl.toFixed(3), p.toFixed(4), q.toFixed(4), tint.toFixed(2), front.toFixed(2)].join('|');
    if (o.key !== key) { V.renderSlice(o.img.data, bw, bh, plane, view.cu, view.cv, sl, RS / view.ppm, p, q, tint, front, plane * 977 + Math.round(sl * 8)); o.x.putImageData(o.img, 0, 0); o.key = key; }
    blit(o, r, RS, alpha);
  }
  // world → pane pixel
  const PX = (r, v, u) => r.x + r.w / 2 + (u - v.cu) * v.ppm;
  const PY = (r, v, w) => r.y + r.h / 2 + (w - v.cv) * v.ppm;

  // ---------- pane chrome ----------
  function clipPane(r) { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); }
  function paneFrame(r, label, color, readout, a) {
    ctx.save(); ctx.globalAlpha = a;
    // label backing gradient
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + 62); g.addColorStop(0, 'rgba(0,0,0,0.78)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, 62);
    ctx.fillStyle = color; ctx.fillRect(r.x + 14, r.y + 17, 13, 13);
    txt(label, r.x + 36, r.y + 37, `500 30px ${MONO}`, color, 'left', 0.96, 0.5);
    if (readout) txt(readout, r.x + r.w - 12, r.y + 33, `400 22px ${MONO}`, C.dim, 'right', 0.95);
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.line2; ctx.lineWidth = 2; ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    ctx.globalAlpha = 0.9; ctx.fillStyle = color; ctx.fillRect(r.x, r.y, r.w, 3);
    ctx.restore();
  }
  function orient(r, l, rt, tp, bt, a) {
    const f = `500 22px ${MONO}`;
    ctx.save(); ctx.globalAlpha = a * 0.8; ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
    if (l) txt(l, r.x + 12, r.y + r.h / 2 + 8, f, C.dim, 'left');
    if (rt) txt(rt, r.x + r.w - 12, r.y + r.h / 2 + 8, f, C.dim, 'right');
    if (tp) txt(tp, r.x + r.w / 2, r.y + 30, f, C.dim, 'center');
    if (bt) txt(bt, r.x + r.w / 2, r.y + r.h - 12, f, C.dim, 'center');
    ctx.restore();
  }
  /** crosshair: one vertical + one horizontal reference line with a gap around the centre */
  function cross(r, px, py, colV, colH, gapX, gapY, a) {
    ctx.save(); ctx.globalAlpha = a * 0.78; ctx.lineWidth = 2;
    // vertical line (x = px)
    ctx.strokeStyle = colV; ctx.beginPath();
    ctx.moveTo(px, r.y + 4); ctx.lineTo(px, Math.max(r.y + 4, py - gapY)); ctx.moveTo(px, Math.min(r.y + r.h - 4, py + gapY)); ctx.lineTo(px, r.y + r.h - 4); ctx.stroke();
    ctx.fillStyle = colV; ctx.beginPath(); ctx.moveTo(px - 7, r.y + r.h - 3); ctx.lineTo(px + 7, r.y + r.h - 3); ctx.lineTo(px, r.y + r.h - 14); ctx.fill();
    // horizontal line (y = py)
    ctx.strokeStyle = colH; ctx.beginPath();
    ctx.moveTo(r.x + 4, py); ctx.lineTo(Math.max(r.x + 4, px - gapX), py); ctx.moveTo(Math.min(r.x + r.w - 4, px + gapX), py); ctx.lineTo(r.x + r.w - 4, py); ctx.stroke();
    ctx.fillStyle = colH; ctx.beginPath(); ctx.moveTo(r.x + 3, py - 7); ctx.lineTo(r.x + 3, py + 7); ctx.lineTo(r.x + 14, py); ctx.fill();
    ctx.restore();
  }
  function ringMark(x, y, t, a, col) {
    const ph = (t * 1.25) % 1;
    ctx.save(); ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
    ctx.globalAlpha = a; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = a * (1 - ph) * 0.9; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 17 + 24 * ease.out(ph), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // ---------- measurement caches ----------
  let spreadKey = '', spreadVal = { ling: 0, bucc: 0 };
  function spread(z, p) { const k = z.toFixed(3) + '|' + p.toFixed(4); if (k !== spreadKey) { spreadVal = V.measureSpread(z, p); spreadKey = k; } return spreadVal; }
  let heightKey = '', heightVal = { zmax: 0, zmin: 0 };
  function height(p) { const k = p.toFixed(4); if (k !== heightKey) { heightVal = V.measureHeight(p); heightKey = k; } return heightVal; }

  // =====================================================================================================
  function render(t) {
    const p = lesionP(t), q = repairQ(t), zs = sliceZ(t);
    const boot = (k) => seg(t, 0.05 + 0.07 * k, 0.6 + 0.07 * k, ease.out) * (1 - seg(t, DUR - 0.45, DUR - 0.05, ease.inOut));
    const tint = 0.82, front = 1 - seg(t, 14.0, 15.0);

    // ---- workspace ----
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    drawChrome(t);

    // ---- views ----
    const rAx = rect('ax', t), rSag = rect('sag', t), rCor = rect('cor', t), r3 = rect('v3', t), rPa = rect('pa', t);
    const a1 = TC - 0.15, a2 = TC + 0.75;
    const vAx = { cu: 0, cv: 0, ppm: kf(t, [[2.4, 26.5], [4.2, 46], [a1, 46], [a2, 64]]) };
    const vSag = {
      cu: kf(t, [[2.4, 0], [4.2, -0.5], [a1, -0.5], [a2, -0.2], [TE1, -0.2], [TE1 + 0.9, 0.9], [TE2 - 0.1, 0.9], [TE2 + 0.7, 0]]),
      cv: kf(t, [[2.4, 3.5], [4.2, 0.9], [a1, 0.9], [a2, 1.3], [TE1, 1.3], [TE1 + 0.9, 4.5], [TE2 - 0.1, 4.5], [TE2 + 0.7, 1.2]]),
      ppm: kf(t, [[2.4, 16.2], [4.2, 40], [a1, 40], [a2, 37], [TE1, 37], [TE1 + 0.9, 23.8], [TE2 - 0.1, 23.8], [TE2 + 0.7, 30]]),
    };
    const vCor = { cu: 0, cv: kf(t, [[2.4, 3.5], [4.2, 1.0], [a1, 1.0], [a2, 1.2]]), ppm: kf(t, [[2.4, 14.2], [4.2, 30], [a1, 30], [a2, 29]]) };
    const v3 = { cz: kf(t, [[2.4, 3.0], [4.2, 1.6], [a1, 1.6], [a2, 1.0]]), ppm: kf(t, [[2.4, 15.4], [4.2, 22], [a1, 22], [a2, 19.5]]) };
    const vPa = { cu: 0, cv: kf(t, [[a1, 3.4], [a2, 1.6], [TE2 - 0.1, 1.6], [TE2 + 0.7, 2.6]]), ppm: kf(t, [[a1, 14.6], [a2, 23], [TE2 - 0.1, 23], [TE2 + 0.7, 30]]) };

    // viewer backing
    ctx.fillStyle = C.panel; ctx.fillRect(48, 478, 984, 848);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.strokeRect(48, 478, 984, 848);

    const sliceNo = (z) => String(Math.round((z - V.Z0) / V.VS)).padStart(3, '0') + '/' + V.NZ;

    // ---- CORONAL (bucco-lingual view, plane x = 0) ----
    mpr('cor', 2, rCor, vCor, 0, p, q, tint, front, boot(2));
    clipPane(rCor);
    cross(rCor, PX(rCor, vCor, 0), PY(rCor, vCor, zs), C.yellow, C.cyan, 4.3 * vCor.ppm, 0.34 * rCor.h, boot(2));
    orient(rCor, 'B', 'L', null, null, boot(2));
    ctx.restore();
    paneFrame(rCor, 'CORONAL', C.magenta, null, 1);

    // ---- 3-D ----
    {
      const RS = 1.6, bw = Math.ceil(r3.w / RS), bh = Math.ceil(r3.h / RS);
      const o = off('v3', bw, bh);
      const az = (-115 - 360 * t / DUR) * Math.PI / 180;
      const key = [az.toFixed(5), v3.cz.toFixed(3), v3.ppm.toFixed(3), p.toFixed(4), q.toFixed(4)].join('|');
      if (o.key !== key) { V.render3D(o.img.data, bw, bh, az, 0.17, 0, 0, v3.cz, RS / v3.ppm, p, q); o.x.putImageData(o.img, 0, 0); o.key = key; }
      blit(o, r3, RS, boot(3));
      clipPane(r3);
      const la = boot(3) * seg(t, 3.2, 4.0);
      ctx.save(); ctx.globalAlpha = la;
      const ly = r3.y + r3.h - 18;
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(r3.x + 22, ly - 7, 6, 0, 7); ctx.fill();
      txt('lesion', r3.x + 34, ly, `400 22px ${MONO}`, C.sub);
      ctx.fillStyle = C.mint; ctx.beginPath(); ctx.arc(r3.x + 138, ly - 7, 6, 0, 7); ctx.fill();
      txt('pulp', r3.x + 150, ly, `400 22px ${MONO}`, C.sub);
      ctx.restore();
      ctx.restore();
      paneFrame(r3, '3-D', C.sub, null, 1);
    }

    // ---- SAGITTAL (mesio-distal view, plane y = 0) ----
    mpr('sag', 1, rSag, vSag, 0, p, q, tint, front, boot(1));
    clipPane(rSag);
    cross(rSag, PX(rSag, vSag, 0), PY(rSag, vSag, zs), C.magenta, C.cyan, 3.6 * vSag.ppm, 0.36 * rSag.h, boot(1) * (1 - 0.6 * seg(t, TE1, TE1 + 0.6) * (1 - seg(t, TE2, TE2 + 0.6))));
    orient(rSag, 'M', 'D', null, null, boot(1));
    drawSagAnnotations(t, rSag, vSag, p);
    ctx.restore();
    paneFrame(rSag, 'SAGITTAL', C.yellow, null, 1);

    // ---- PERIAPICAL (2-D projection of the same volume) ----
    {
      const RS = 2, bw = Math.ceil(rPa.w / RS), bh = Math.ceil(rPa.h / RS);
      const o = off('pa', bw, bh);
      const ov = seg(t, TE2 + 1.5, TE2 + 2.2, ease.smooth);
      const key = [vPa.cv.toFixed(4), vPa.ppm.toFixed(3), p.toFixed(4), q.toFixed(4), ov.toFixed(3)].join('|');
      if (o.key !== key) { V.updatePA(p, q); V.renderPA(o.img.data, bw, bh, vPa.cu, vPa.cv, RS / vPa.ppm, ov, 5); o.x.putImageData(o.img, 0, 0); o.key = key; }
      blit(o, rPa, RS, boot(4));
      clipPane(rPa);
      drawPaAnnotations(t, rPa, vPa, ov);
      ctx.restore();
      paneFrame(rPa, 'PERIAPICAL', C.text, '2-D', 1);
    }

    // ---- AXIAL (plane z = zs) ----
    mpr('ax', 0, rAx, vAx, zs, p, q, tint, front, boot(0));
    clipPane(rAx);
    {
      const g = Math.min(0.42 * Math.min(rAx.w, rAx.h), 4.6 * vAx.ppm);
      cross(rAx, PX(rAx, vAx, 0), PY(rAx, vAx, 0), C.magenta, C.yellow, g, g, boot(0));
      orient(rAx, 'M', 'D', 'B', 'L', boot(0));
      drawAxAnnotations(t, rAx, vAx, zs, p);
    }
    ctx.restore();
    paneFrame(rAx, 'AXIAL', C.cyan, sliceNo(zs), 1);

    drawCaptions(t);
    drawDock(t, p, q);
    drawEnd(t);
  }

  // =====================================================================================================
  function drawChrome(t) {
    // application bar (decorative, under the Instagram header)
    const g = ctx.createLinearGradient(0, 0, 0, 226); g.addColorStop(0, '#0b0f14'); g.addColorStop(1, '#090c11');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 226);
    ctx.fillStyle = C.line; ctx.fillRect(0, 225, W, 2);
    // logo: three plane lines
    ctx.save(); ctx.translate(82, 184); ctx.lineWidth = 3;
    ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke();
    ctx.strokeStyle = C.magenta; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 16); ctx.stroke();
    ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.stroke();
    ctx.restore();
    txt('MPR VIEWER', 112, 192, `500 24px ${MONO}`, C.dim, 'left', 1, 1.5);
    txt('3 planes · 3-D · periapical', 282, 192, `400 22px ${MONO}`, C.dimmer, 'left');
    // tool glyphs
    ctx.save(); ctx.strokeStyle = C.dimmer; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { const x = 800 + i * 46; rr(x, 168, 34, 34, 6); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(817, 185, 7, 0, 7); ctx.moveTo(863, 176); ctx.lineTo(863, 194); ctx.moveTo(854, 185); ctx.lineTo(872, 185);
    ctx.moveTo(901, 193); ctx.lineTo(917, 177); ctx.moveTo(946, 192); ctx.lineTo(955, 177); ctx.lineTo(964, 192); ctx.rect(993, 178, 16, 14); ctx.stroke();
    ctx.restore();
    // series tag + handle (inside the safe area)
    ctx.fillStyle = C.orange; ctx.fillRect(64, 250, 14, 14);
    txt('RESORPTION 5/5 · EXTERNAL CERVICAL', 90, 268, `500 28px ${MONO}`, '#c9d5e1', 'left', 1, 0.6);
    txt('@natebrooksendo', 1016, 268, `400 25px ${MONO}`, C.dim, 'right');
    ctx.fillStyle = C.line; ctx.fillRect(64, 290, 952, 2);
    // status bar (decorative, under the Instagram footer)
    ctx.fillStyle = C.line; ctx.fillRect(0, 1592, W, 2);
    txt('LINKED CROSSHAIR  ·  TIME-LAPSE  ·  SCHEMATIC VOLUME', 64, 1630, `400 22px ${MONO}`, C.dimmer, 'left', 1, 1);
    ctx.save(); ctx.fillStyle = C.dimmer; ctx.globalAlpha = 0.5;
    for (let i = 0; i < 24; i++) for (let j = 0; j < 5; j++) ctx.fillRect(64 + i * 41.4, 1680 + j * 44, 2, 2);
    ctx.restore();
  }

  // ---------- captions (top zone) ----------
  function head(t, a, b, num, title, size, yOff) {
    const al = fade(t, a, b); if (al <= 0) return;
    const y = 366 + (yOff || 0);
    ctx.save(); ctx.globalAlpha = al;
    let x = 64;
    if (num) {
      rr(64, y - 50, 56, 60, 10); ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke();
      txt(num, 92, y - 6, `600 40px ${MONO}`, C.cyan, 'center');
      x = 140;
    }
    let s = size || 58, f = `600 ${s}px ${SANS}`;
    while (widthOf(title, f) > 1016 - x && s > 40) { s -= 2; f = `600 ${s}px ${SANS}`; }
    txt(title, x, y, f, C.text);
    ctx.restore();
  }
  function sub(t, a, b, arr) { const al = fade(t, a, b); if (al > 0) runs(arr, 64, 434, 38, 'left', al); }
  function drawCaptions(t) {
    // title: present at t = 0 and again on the end card, so the loop is seamless
    const titleA = Math.max(1 - seg(t, TB - 0.3, TB - 0.05), seg(t, TEND + 0.1, TEND + 0.4));
    if (titleA > 0) { ctx.save(); ctx.globalAlpha = titleA; txt('External cervical resorption', 64, 368, `600 62px ${SANS}`, C.text); ctx.restore(); }
    sub(t, 0.1, TB - 0.05, [{ t: 'What the ' }, { t: 'periapical', c: C.text, w: 600 }, { t: ' misses' }]);
    // 1 · initiation
    head(t, TB + 0.1, TC - 0.05, '1', 'Initiation');
    sub(t, TB + 0.1, TC - 0.05, [{ t: 'Entry', c: C.orange, w: 600 }, { t: ' just below the ' }, { t: 'epithelial attachment', c: C.blue, w: 600 }]);
    // 2 · resorption
    head(t, TC + 0.1, TD - 0.05, '2', 'Resorption');
    sub(t, TC + 0.1, TC2 - 0.1, [{ t: 'It spreads ' }, { t: 'around the canal', c: C.orange, w: 600 }]);
    sub(t, TC2 + 0.1, TD - 0.05, [{ t: 'Pulp ' }, { t: 'walled off', c: C.mint, w: 600 }, { t: ' — until late' }]);
    // 3 · repair
    head(t, TD + 0.1, TE1 - 0.05, '3', 'Repair');
    sub(t, TD + 0.1, TE1 - 0.05, [{ t: 'Bone-like tissue', c: C.ivory, w: 600 }, { t: ' grows in' }]);
    // classification
    head(t, TE1 + 0.1, TE2 - 0.05, null, 'Patel 3-D classification', 58);
    sub(t, TE1 + 0.1, TE2 - 0.05, [{ t: 'read off the CBCT, axis by axis', c: C.dim }]);
    // 2-D vs 3-D
    head(t, TE2 + 0.1, TEND - 0.05, null, 'The periapical underestimates it', 58);
    sub(t, TE2 + 0.1, TEND - 0.05, [{ t: 'Canal outline', c: C.blue, w: 600 }, { t: ' often still traceable' }]);
  }

  // ---------- axial annotations ----------
  function drawAxAnnotations(t, r, v, zs, p) {
    const cx = PX(r, v, 0), cy = PY(r, v, 0);
    // portal marker (scene 1)
    const pm = fade(t, 3.9, TC + 0.5, 0.3, 0.4);
    if (pm > 0) ringMark(PX(r, v, -V.outerA(zs)), cy, t, pm, C.orange);
    // advancing-front arrowheads (scene 2)
    const ar = fade(t, TC + 0.9, TD - 0.1, 0.4, 0.5);
    if (ar > 0) {
      const sp = spread(zs, p), ca = V.canalA(zs), cb = V.canalB(zs);
      ctx.save(); ctx.fillStyle = C.orange; ctx.shadowColor = C.orange; ctx.shadowBlur = 10;
      for (const sgn of [1, -1]) {
        const reach = sgn > 0 ? sp.ling : sp.bucc; if (reach < 0.25) continue;
        const ang = sgn * (reach + 0.13);
        const dx = -Math.cos(ang), dy = Math.sin(ang);
        const Rc = 1 / Math.sqrt((dx / ca) * (dx / ca) + (dy / cb) * (dy / cb)) + V.TS + 0.42;
        const x = cx + Rc * dx * v.ppm, y = cy + Rc * dy * v.ppm;
        // tangent in the direction of increasing |ang|
        let tx = Math.sin(ang) * sgn, ty = Math.cos(ang) * sgn;
        const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
        ctx.globalAlpha = ar * (0.75 + 0.25 * Math.sin(t * 6));
        ctx.beginPath(); ctx.moveTo(x + tx * 15, y + ty * 15); ctx.lineTo(x - tx * 7 - ty * 10, y - ty * 7 + tx * 10); ctx.lineTo(x - tx * 7 + ty * 10, y - ty * 7 - tx * 10); ctx.fill();
      }
      ctx.restore();
    }
    // the pericanalar sheet (from scene 2b on)
    const sh = seg(t, TC2 - 0.1, TC2 + 0.5, ease.out);
    if (sh > 0) {
      const ca = V.canalA(zs) * v.ppm, cb = V.canalB(zs) * v.ppm, ts = V.TS * v.ppm;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
      const kick = fade(t, TE1 + 2.5, TE1 + 3.1, 0.2, 0.4);
      ctx.save(); ctx.globalAlpha = sh;
      ctx.beginPath(); ctx.ellipse(cx, cy, ca + ts, cb + ts, 0, 0, Math.PI * 2); ctx.ellipse(cx, cy, ca + 1, cb + 1, 0, 0, Math.PI * 2, true);
      ctx.fillStyle = Kit.rgba(C.mint, 0.22 + 0.10 * pulse + 0.3 * kick); ctx.fill();
      ctx.shadowColor = C.mint; ctx.shadowBlur = 10 + 8 * pulse + 16 * kick; ctx.strokeStyle = C.mint; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, ca + ts + 1, cb + ts + 1, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // label chip + leader
      const ca2 = seg(t, TC2 + 0.25, TC2 + 0.7, ease.out);
      if (ca2 > 0) {
        const bx = r.x + 16, by = r.y + r.h - 16;
        const box = chip(bx, by, [{ t: 'resorption-resistant sheet', f: `600 30px ${SANS}`, c: C.mint }, { t: 'avg ≈ 0.2 mm · ex vivo', f: `400 30px ${SANS}`, c: C.text }], { bottom: true, alpha: ca2, stroke: Kit.rgba(C.mint, 0.5) });
        const ang = 2.25, dx = -Math.cos(ang), dy = Math.sin(ang);   // point on the sheet, lingual-distal side (no lesion there)
        const Rr = 1 / Math.sqrt((dx / (ca + ts * 0.5)) * (dx / (ca + ts * 0.5)) + (dy / (cb + ts * 0.5)) * (dy / (cb + ts * 0.5)));
        const sx = cx + Rr * dx, sy = cy + Rr * dy, ex = box.x + box.w - 40, ey = box.y;
        ctx.save(); ctx.globalAlpha = ca2; ctx.strokeStyle = C.mint; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(lerp(ex, sx, ca2), lerp(ey, sy, ca2)); ctx.stroke();
        ctx.fillStyle = C.mint; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 7); ctx.fill();
        ctx.restore();
      }
    }
    // angle tool (classification scene → end)
    const an = seg(t, TE1 + 1.6, TE1 + 2.45, ease.inOut);
    if (an > 0) {
      const sp = spread(zs, 1);
      const R = (Math.max(V.outerA(zs), V.outerB(zs)) + 0.5) * v.ppm;
      const a0 = Math.PI + sp.bucc, a1 = a0 - (sp.bucc + sp.ling) * an;      // sweep from the buccal end round to the lingual end
      ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 4; ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(cx, cy, R, a1, a0, false); ctx.stroke();
      ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * (R + 10), cy + Math.sin(a0) * (R + 10)); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a1) * (R + 10), cy + Math.sin(a1) * (R + 10)); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
      ctx.restore();
      const deg = Math.round((sp.bucc + sp.ling) * an * 180 / Math.PI);
      chip(r.x + 16, r.y + 70, [{ t: '≈ ' + deg + '°', f: `600 34px ${MONO}`, c: C.orange }], { alpha: Math.min(1, an * 4), lh: 42, stroke: Kit.rgba(C.orange, 0.55) });
    }
    // class badge
    const cb2 = seg(t, TE1 + 3.0, TE1 + 3.3, ease.out);
    if (cb2 > 0) chip(r.x + r.w - 14, r.y + 46, [{ t: 'Patel 2Cp', f: `600 30px ${MONO}`, c: C.text }], { right: true, alpha: cb2, lh: 40, stroke: Kit.rgba(C.orange, 0.7) });
  }

  // ---------- sagittal annotations ----------
  function drawSagAnnotations(t, r, v, p) {
    // epithelial attachment bracket + entry marker (scene 1)
    const ba = fade(t, 3.4, TC + 0.5, 0.35, 0.4);
    if (ba > 0) {
      ctx.save(); ctx.globalAlpha = ba; ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.shadowColor = C.blue; ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const z = -0.72 + 0.66 * i / 8; const x = PX(r, v, -V.outerA(z)) - 8, y = PY(r, v, z); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.lineWidth = 3;
      for (const z of [-0.72, -0.06]) { const x = PX(r, v, -V.outerA(z)) - 8, y = PY(r, v, z); ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 5, y); ctx.stroke(); }
      ctx.restore();
    }
    const pm = fade(t, 3.9, TC + 0.5, 0.3, 0.4);
    if (pm > 0) ringMark(PX(r, v, -V.outerA(V.PZ)), PY(r, v, V.PZ), t + 0.4, pm, C.orange);
    // sheet line on the lesion side
    const sh = seg(t, TC2 - 0.1, TC2 + 0.5, ease.out) * (1 - seg(t, TE1, TE1 + 0.4) * (1 - seg(t, TE2 + 0.3, TE2 + 0.8)));
    if (sh > 0) {
      const hh = height(p);
      ctx.save(); ctx.globalAlpha = sh * 0.95; ctx.strokeStyle = C.mint; ctx.lineWidth = 3; ctx.shadowColor = C.mint; ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) { const z = lerp(hh.zmin - 0.2, hh.zmax + 0.2, i / 24); const x = PX(r, v, -(V.canalA(z) + V.TS * 0.5)), y = PY(r, v, z); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
    // height ruler (classification scene)
    const ru = fade(t, TE1 + 0.75, TE2 + 0.05, 0.35, 0.25);
    if (ru > 0) {
      const hh = height(1);
      const L = V.ROOT_LEN, zc = 1.48;
      const bounds = [-0.1, zc, L / 3, 2 * L / 3, L], zone = hh.zmax <= zc ? 0 : hh.zmax <= L / 3 ? 1 : hh.zmax <= 2 * L / 3 ? 2 : 3;
      const xr = PX(r, v, 4.25);
      const lit = seg(t, TE1 + 1.3, TE1 + 1.55);
      ctx.save(); ctx.globalAlpha = ru; ctx.strokeStyle = '#dfe7ef'; ctx.lineWidth = 2.5; ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(xr, PY(r, v, bounds[0])); ctx.lineTo(xr, PY(r, v, bounds[4]));
      for (const b of bounds) { ctx.moveTo(xr - 12, PY(r, v, b)); ctx.lineTo(xr + 12, PY(r, v, b)); }
      ctx.stroke();
      // bone-crest reference (zone 1 | 2)
      ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.globalAlpha = ru * 0.7;
      ctx.beginPath(); ctx.moveTo(PX(r, v, -3.4), PY(r, v, zc)); ctx.lineTo(xr - 12, PY(r, v, zc)); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 4; i++) {
        const ym = (PY(r, v, bounds[i]) + PY(r, v, bounds[i + 1])) / 2, on = i === zone ? lit : 0;
        ctx.save(); ctx.globalAlpha = ru;
        if (on > 0) { rr(xr + 18, ym - 21, 40, 42, 7); ctx.fillStyle = Kit.rgba(C.orange, on); ctx.fill(); }
        txt(String(i + 1), xr + 38, ym + 11, `600 30px ${MONO}`, on > 0.5 ? '#170a02' : '#dfe7ef', 'center');
        ctx.restore();
      }
      // deepest point of the lesion → ruler
      const dl = seg(t, TE1 + 0.95, TE1 + 1.4, ease.out);
      if (dl > 0) {
        const y = PY(r, v, hh.zmax), x0 = PX(r, v, -(V.canalA(hh.zmax) + V.TS + 0.5));
        ctx.save(); ctx.globalAlpha = ru; ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.setLineDash([9, 6]);
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, xr - 14, dl), y); ctx.stroke();
        ctx.setLineDash([]); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x0, y, 5, 0, 7); ctx.fill();
        ctx.restore();
      }
    }
  }

  // ---------- periapical annotations ----------
  function drawPaAnnotations(t, r, v, ov) {
    // trace of the canal outline through the lesion
    const tr = seg(t, TE2 + 0.75, TE2 + 1.5, ease.inOut);
    if (tr > 0) {
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]); ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        const z0 = -3.2, z1 = lerp(z0, 6.2, tr);
        for (let i = 0; i <= 30; i++) { const z = lerp(z0, z1, i / 30); const x = PX(r, v, sgn * (V.canalA(z) + 0.1)), y = PY(r, v, z); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
    }
    if (ov > 0) {
      ctx.save(); ctx.globalAlpha = ov;
      const g = ctx.createLinearGradient(0, r.y + r.h - 56, 0, r.y + r.h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = g; ctx.fillRect(r.x, r.y + r.h - 56, r.w, 56);
      ctx.fillStyle = C.orange; ctx.fillRect(r.x + 14, r.y + r.h - 30, 14, 14);
      txt('extent on CBCT', r.x + 36, r.y + r.h - 16, `400 24px ${MONO}`, C.text);
      ctx.restore();
    }
  }

  // ---------- dock: stage timeline → classification strip ----------
  const ROWS = [1358, 1406, 1454];
  function drawDock(t, p, q) {
    // stage timeline (scenes 1-3)
    const ga = fade(t, TB + 0.15, TE1 - 0.05, 0.35, 0.3);
    if (ga > 0) {
      const lx = 300, x1 = 944, T0 = 2.8, T1 = TE1;
      const tm = (tt) => lx + (x1 - lx) * clamp((tt - T0) / (T1 - T0));
      const lanes = [
        { n: '1', name: 'Initiation', c: C.blue, a: 2.8, b: TC },
        { n: '2', name: 'Resorption', c: C.orange, a: TC - 0.25, b: 99 },
        { n: '3', name: 'Repair', c: C.ivory, a: TD + 0.15, b: 99 },
      ];
      ctx.save(); ctx.globalAlpha = ga;
      lanes.forEach((L, i) => {
        const y = ROWS[i], on = seg(t, L.a - 0.1, L.a + 0.25);
        const la = 0.36 + 0.64 * on;
        txt(L.n, 64, y + 11, `600 30px ${MONO}`, L.c, 'left', la);
        txt(L.name, 96, y + 11, `500 30px ${SANS}`, C.text, 'left', la);
        ctx.fillStyle = C.line; rr(lx, y - 3, x1 - lx, 6, 3); ctx.fill();
        if (t > L.a) {
          const xa = tm(L.a), xb = tm(Math.min(t, L.b));
          ctx.save(); ctx.fillStyle = L.c; rr(xa, y - 7, Math.max(8, xb - xa), 14, 7); ctx.fill();
          if (t < L.b) { ctx.shadowColor = L.c; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(xb, y, 10, 0, 7); ctx.fill(); }
          ctx.restore();
        }
      });
      // playhead
      const xp = tm(t);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xp, ROWS[0] - 24); ctx.lineTo(xp, ROWS[2] + 24); ctx.stroke();
      ctx.restore();
    }
    // Patel 3-D classification strip
    const sa = fade(t, TE1 + 0.15, TEND + 0.1, 0.35, 0.3);
    if (sa > 0) {
      const rowsDef = [
        { label: 'HEIGHT', chips: ['1', '2', '3', '4'], on: 1, at: TE1 + 1.4, min: 58 },
        { label: 'SPREAD', chips: ['A ≤90°', 'B ≤180°', 'C ≤270°', 'D >270°'], on: 2, at: TE1 + 2.45 },
        { label: 'PROXIMITY', chips: ['d dentin only', 'p probable pulp involvement'], on: 1, at: TE1 + 2.9 },
      ];
      ctx.save(); ctx.globalAlpha = sa;
      rowsDef.forEach((R, i) => {
        const y = ROWS[i];
        txt(R.label, 64, y + 10, `500 28px ${MONO}`, C.dim, 'left', 1, 0.5);
        let x = 246;
        R.chips.forEach((c, j) => {
          const f = `500 30px ${SANS}`, w = Math.max(R.min || 0, widthOf(c, f) + 26);
          const on = j === R.on ? seg(t, R.at, R.at + 0.25, ease.out) : 0;
          rr(x, y - 21, w, 42, 8);
          if (on > 0) { ctx.fillStyle = Kit.rgba(C.orange, on); ctx.fill(); }
          ctx.strokeStyle = on > 0 ? C.orange : C.line2; ctx.lineWidth = 2; ctx.stroke();
          txt(c, x + w / 2, y + 11, on > 0.5 ? `600 30px ${SANS}` : f, on > 0.5 ? '#170a02' : '#a9b7c6', 'center');
          x += w + 8;
        });
      });
      // running result
      const parts = [['2', TE1 + 1.4], ['C', TE1 + 2.45], ['p', TE1 + 2.9]];
      txt('CLASS', 600, ROWS[0] + 10, `500 28px ${MONO}`, C.dim, 'left', 1, 0.5);
      let x = 706;
      for (const [ch, at] of parts) { const on = seg(t, at, at + 0.25, ease.out); txt(on > 0.5 ? ch : '·', x, ROWS[0] + 15, `600 46px ${MONO}`, on > 0.5 ? C.orange : C.dimmer, 'left'); x += 30; }
      ctx.restore();
    }
    // one small source line per scene
    const src = [
      [TB + 0.15, TC - 0.05, 'Mavridou et al., J Endod 2016'],
      [TC + 0.1, TC2 - 0.1, 'Mavridou et al., J Endod 2016 · Patel et al., Int Endod J 2022'],
      [TC2 + 0.1, TD - 0.05, 'Mavridou et al., J Endod 2016 · Heithersay, Quintessence Int 1999'],
      [TD + 0.1, TE1 - 0.05, 'Mavridou et al., J Endod 2016 · proposed 3-stage model'],
      [TE1 + 0.15, TE2 - 0.05, 'Patel et al., Int Endod J 2018'],
      [TE2 + 0.1, TEND - 0.05, 'Patel K et al., J Endod 2016 · Heithersay, Quintessence Int 1999'],
    ];
    for (const [a, b, s] of src) { const al = fade(t, a, b); if (al > 0) txt(s, 64, 1516, `400 25px ${SANS}`, C.dim, 'left', al); }
    txt('SCHEMATIC · not a patient scan · not to scale', 64, 1558, `400 24px ${MONO}`, C.dim, 'left', 0.95);
  }

  // ---------- end card ----------
  function drawEnd(t) {
    const a = seg(t, TEND + 0.1, TEND + 0.5, ease.out) * (1 - seg(t, DUR - 0.5, DUR - 0.12, ease.inOut));
    if (a <= 0) return;
    const x = 56, y = 1050, w = 968, h = 444;
    ctx.save(); ctx.globalAlpha = a;
    rr(x, y, w, h, 4); ctx.fillStyle = 'rgba(8,11,15,0.97)'; ctx.fill(); ctx.strokeStyle = C.line2; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.cyan; ctx.fillRect(x, y, w, 3);
    txt('TAKE-HOME', x + 28, y + 50, `500 28px ${MONO}`, C.cyan, 'left', 1, 1.5);
    const lines = ['Recognize it early', 'Consider CBCT before you treat', 'Treatment depends on extent'];
    lines.forEach((s, i) => {
      const li = seg(t, TEND + 0.35 + i * 0.3, TEND + 0.75 + i * 0.3, ease.out);
      const yy = y + 134 + i * 100, dx = (1 - li) * 26;
      ctx.save(); ctx.globalAlpha = a * li;
      rr(x + 28 + dx, yy - 44, 52, 56, 9); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.stroke();
      txt(String(i + 1), x + 54 + dx, yy - 3, `600 36px ${MONO}`, C.orange, 'center');
      txt(s, x + 104 + dx, yy, `600 50px ${SANS}`, C.text);
      ctx.restore();
    });
    txt('Patel et al., Int Endod J 2018 · Patel K et al., J Endod 2016', x + 28, y + h - 26, `400 25px ${SANS}`, C.dim, 'left');
    ctx.restore();
  }

  window.REEL = {
    title: 'External cervical resorption — CBCT viewer',
    duration: DUR,
    poster: 22.6,
    canvas,
    fonts: [`600 62px ${SANS}`, `500 30px ${SANS}`, `400 38px ${SANS}`, `400 22px ${MONO}`, `500 28px ${MONO}`, `600 30px ${MONO}`],
    setup() { V.build(); },
    render,
  };
  Kit.boot(window.REEL);
})();
