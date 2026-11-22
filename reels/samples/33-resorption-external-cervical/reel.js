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
  const TB = 2.3, TC = 5.5, TC2 = 8.0, TD = 10.6, TE1 = 13.2, TE2 = 16.2, TEND = 19.2;

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
  const LP = { ax: LX.sag, sag: LX.pa, cor: LX.cor, v3: LX.v3, pa: LX.ax };   // periapical scene: the radiograph is the hero
  function rect(name, t) {
    const s1 = seg(t, TC - 0.1, TC + 0.5, ease.inOut), s2 = seg(t, TE2 - 0.1, TE2 + 0.7, ease.inOut);
    const s3 = t >= DUR - 0.14 ? 1 : 0;     // panes are black by then: slide back to the opening grid for the loop
    const a = LG[name], b = LX[name], c = LP[name];
    const r = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) r[i] = lerp(lerp(lerp(a[i], b[i], s1), c[i], s2), a[i], s3);
    return { x: Math.round(r[0]), y: Math.round(r[1]), w: Math.round(r[2]), h: Math.round(r[3]) };
  }

  // ---------- time → model state ----------
  function lesionP(t) { return 0.17 * seg(t, 1.6, TC, ease.smooth) + 0.83 * seg(t, TC, 14.0, (u) => 1 - Math.pow(1 - u, 2.6)); }
  function repairQ(t) { return 0.78 * seg(t, TD + 0.15, TE1, ease.smooth) + 0.22 * seg(t, TE1, 15.0, ease.smooth); }
  const HOME_Z = 2.5;   // axial 'home' slice: just below the alveolar crest, 1.6 mm apical to the portal
  const sliceZ = (t) => kf(t, [[0.2, 11.2], [4.1, V.PZ], [7.0, V.PZ], [7.9, HOME_Z]]);

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
  function mpr(name, plane, r, view, sl, p, q, tint, front, alpha, rb) {
    rb = rb || 0;
    const RS = 2, bw = Math.ceil(r.w / RS), bh = Math.ceil(r.h / RS);
    const o = off(name, bw, bh);
    const key = [plane, view.cu.toFixed(4), view.cv.toFixed(4), view.ppm.toFixed(3), sl.toFixed(3), p.toFixed(4), q.toFixed(4), tint.toFixed(2), front.toFixed(2), rb.toFixed(2)].join('|');
    if (o.key !== key) { V.renderSlice(o.img.data, bw, bh, plane, view.cu, view.cv, sl, RS / view.ppm, p, q, tint, front, plane * 977 + Math.round(sl * 8), rb); o.x.putImageData(o.img, 0, 0); o.key = key; }
    blit(o, r, RS, alpha);
  }
  // world → pane pixel
  const PX = (r, v, u) => r.x + r.w / 2 + (u - v.cu) * v.ppm;
  const PY = (r, v, w) => r.y + r.h / 2 + (w - v.cv) * v.ppm;

  // ---------- pane chrome ----------
  function clipPane(r) { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); }
  function paneFrame(r, label, color, readout, a) {
    ctx.save(); ctx.globalAlpha = a;
    const lw = widthOf(label, `500 30px ${MONO}`, 0.5);
    ctx.fillStyle = 'rgba(4,6,9,0.84)'; ctx.beginPath(); ctx.roundRect(r.x + 2, r.y + 3, lw + 50, 46, [0, 0, 10, 0]); ctx.fill();
    ctx.fillStyle = color; ctx.fillRect(r.x + 14, r.y + 18, 13, 13);
    txt(label, r.x + 36, r.y + 37, `500 30px ${MONO}`, color, 'left', 0.98, 0.5);
    if (readout) {
      const rw = widthOf(readout, `400 22px ${MONO}`);
      ctx.fillStyle = 'rgba(4,6,9,0.8)'; ctx.beginPath(); ctx.roundRect(r.x + r.w - rw - 24, r.y + 3, rw + 22, 40, [0, 0, 0, 10]); ctx.fill();
      txt(readout, r.x + r.w - 12, r.y + 32, `400 22px ${MONO}`, C.sub, 'right', 0.95);
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.line2; ctx.lineWidth = 2; ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    ctx.globalAlpha = 0.9; ctx.fillStyle = color; ctx.fillRect(r.x, r.y, r.w, 3);
    ctx.restore();
  }
  /** orientation letters. corner = true puts the left/right letters in the bottom corners (long-axis panes) */
  function orient(r, l, rt, tp, bt, a, corner, aBottom) {
    const f = `500 22px ${MONO}`;
    ctx.save(); ctx.globalAlpha = a * 0.9; ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
    const ly = corner ? r.y + r.h - 14 : r.y + r.h / 2 + 38;
    if (l) txt(l, r.x + 12, ly, f, C.sub, 'left');
    if (rt) txt(rt, r.x + r.w - 12, ly, f, C.sub, 'right');
    if (tp) txt(tp, r.x + r.w / 2 + 20, r.y + 34, f, C.sub, 'center');
    if (bt) { ctx.globalAlpha = a * 0.9 * (aBottom == null ? 1 : aBottom); txt(bt, r.x + r.w / 2 + 20, r.y + r.h - 12, f, C.sub, 'center'); }
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
    const boot = (k) => seg(t, 0.02 + 0.04 * k, 0.35 + 0.04 * k, ease.out);
    const endFade = seg(t, DUR - 0.35, DUR - 0.15, ease.inOut);
    const tint = 0.82, front = 1 - seg(t, 13.7, 14.7);
    const rb = 1.5 * fade(t, TD + 0.45, TD + 1.5, 0.35, 0.6);      // repair tissue flashes brighter as it first appears

    // ---- workspace ----
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    drawChrome(t);

    // ---- views ----
    const rAx = rect('ax', t), rSag = rect('sag', t), rCor = rect('cor', t), r3 = rect('v3', t), rPa = rect('pa', t);
    const a1 = TC - 0.1, a2 = TC + 0.5;
    const vAx = { cu: 0, cv: 0, ppm: kf(t, [[2.4, 26.5], [4.2, 46], [a1, 46], [a2, 64], [TE2 - 0.1, 64], [TE2 + 0.7, 42]]) };
    const vSag = {
      cu: kf(t, [[2.4, 0], [4.2, -1.25], [a1, -1.25], [a2, -0.2], [TE1 - 0.1, -0.2], [TE1 + 0.45, 0.9], [TE2 - 0.1, 0.9], [TE2 + 0.7, 0]]),
      cv: kf(t, [[2.4, 3.5], [4.2, 0.35], [a1, 0.35], [a2, 1.3], [TE1 - 0.1, 1.3], [TE1 + 0.45, 4.5], [TE2 - 0.1, 4.5], [TE2 + 0.7, 1.2]]),
      ppm: kf(t, [[2.4, 16.2], [4.2, 46], [a1, 46], [a2, 37], [TE1 - 0.1, 37], [TE1 + 0.45, 23.8], [TE2 - 0.1, 23.8], [TE2 + 0.7, 30]]),
    };
    const vCor = { cu: 0, cv: kf(t, [[2.4, 3.5], [4.2, 1.0], [a1, 1.0], [a2, 1.2]]), ppm: kf(t, [[2.4, 14.2], [4.2, 30], [a1, 30], [a2, 29]]) };
    const v3 = { cz: kf(t, [[2.4, 3.0], [4.2, 1.6], [a1, 1.6], [a2, 1.0]]), ppm: kf(t, [[2.4, 15.4], [4.2, 22], [a1, 22], [a2, 19.5]]) };
    const vPa = { cu: 0, cv: kf(t, [[a1, 3.4], [a2, 1.6], [TE2 - 0.1, 1.6], [TE2 + 0.7, 1.8]]), ppm: kf(t, [[a1, 14.6], [a2, 23], [TE2 - 0.1, 23], [TE2 + 0.7, 44]]) };

    // viewer backing
    ctx.fillStyle = C.panel; ctx.fillRect(48, 478, 984, 848);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.strokeRect(48, 478, 984, 848);

    const sliceNo = (z) => String(Math.round((z - V.Z0) / V.VS)).padStart(3, '0') + '/' + V.NZ;

    // ---- CORONAL (bucco-lingual view, plane x = 0) ----
    mpr('cor', 2, rCor, vCor, 0, p, q, tint, front, boot(2), rb);
    clipPane(rCor);
    cross(rCor, PX(rCor, vCor, 0), PY(rCor, vCor, zs), C.yellow, C.cyan, 4.3 * vCor.ppm, 0.34 * rCor.h, boot(2));
    orient(rCor, 'B', 'L', null, null, boot(2), true);
    ctx.restore();
    paneFrame(rCor, 'CORONAL', C.magenta, null, 1);

    // ---- 3-D ----
    {
      const RS = 1.2, bw = Math.ceil(r3.w / RS), bh = Math.ceil(r3.h / RS);
      const o = off('v3', bw, bh);
      const az = (-115 - 360 * t / DUR) * Math.PI / 180;
      const key = [az.toFixed(5), v3.cz.toFixed(3), v3.ppm.toFixed(3), p.toFixed(4), q.toFixed(4)].join('|');
      if (o.key !== key) { V.render3D(o.img.data, bw, bh, az, 0.17, 0, 0, v3.cz, RS / v3.ppm, p, q); o.x.putImageData(o.img, 0, 0); o.key = key; }
      blit(o, r3, RS, boot(3));
      paneFrame(r3, '3-D', C.sub, null, 1);
    }

    // ---- SAGITTAL (mesio-distal view, plane y = 0) ----
    mpr('sag', 1, rSag, vSag, 0, p, q, tint, front, boot(1), rb);
    clipPane(rSag);
    cross(rSag, PX(rSag, vSag, 0), PY(rSag, vSag, zs), C.magenta, C.cyan, 3.6 * vSag.ppm, 0.36 * rSag.h, boot(1) * (1 - 0.6 * seg(t, TE1, TE1 + 0.6) * (1 - seg(t, TE2, TE2 + 0.6))));
    orient(rSag, 'M', t < TE2 ? 'D' : null, null, null, boot(1), true);     // in the last layout that corner sits under the button column
    drawSagAnnotations(t, rSag, vSag, p);
    ctx.restore();
    paneFrame(rSag, 'SAGITTAL', C.yellow, null, 1);

    // ---- PERIAPICAL (2-D projection of the same volume) ----
    {
      const RS = 2, bw = Math.ceil(rPa.w / RS), bh = Math.ceil(rPa.h / RS);
      const o = off('pa', bw, bh);
      const ov = seg(t, TE2 + 0.9, TE2 + 1.5, ease.smooth);
      const key = [vPa.cv.toFixed(4), vPa.ppm.toFixed(3), p.toFixed(4), q.toFixed(4), ov.toFixed(3)].join('|');
      if (o.key !== key) { V.updatePA(p, q); V.renderPA(o.img.data, bw, bh, vPa.cu, vPa.cv, RS / vPa.ppm, ov, 5); o.x.putImageData(o.img, 0, 0); o.key = key; }
      blit(o, rPa, RS, boot(4));
      clipPane(rPa);
      drawPaAnnotations(t, rPa, vPa, ov);
      ctx.restore();
      paneFrame(rPa, 'PERIAPICAL 2-D', C.text, null, 1);
      const pk = fade(t, TE2 + 0.3, TE2 + 1.3, 0.3, 0.7);
      if (pk > 0) { ctx.save(); ctx.strokeStyle = Kit.rgba('#ffffff', 0.85 * pk); ctx.lineWidth = 4; ctx.shadowColor = '#fff'; ctx.shadowBlur = 18 * pk; ctx.strokeRect(rPa.x + 2, rPa.y + 2, rPa.w - 4, rPa.h - 4); ctx.restore(); }
    }

    // ---- AXIAL (plane z = zs) ----
    mpr('ax', 0, rAx, vAx, zs, p, q, tint, front, boot(0), rb);
    clipPane(rAx);
    {
      const g = Math.min(0.42 * Math.min(rAx.w, rAx.h), 4.6 * vAx.ppm);
      cross(rAx, PX(rAx, vAx, 0), PY(rAx, vAx, 0), C.magenta, C.yellow, g, g, boot(0));
      orient(rAx, 'M', 'D', 'B', 'L', boot(0), false, 1 - seg(t, TC2, TC2 + 0.4));
      drawAxAnnotations(t, rAx, vAx, zs, p);
    }
    ctx.restore();
    paneFrame(rAx, 'AXIAL', C.cyan, sliceNo(zs), 1);
    txt('zoom ×' + (vAx.ppm / 26.5).toFixed(1), rAx.x + rAx.w - 12, rAx.y + rAx.h - 14, `400 22px ${MONO}`, C.sub, 'right', 0.85 * boot(0));

    if (endFade > 0) {
      ctx.save(); ctx.fillStyle = Kit.rgba('#000000', endFade);
      for (const r of [rCor, r3, rSag, rPa, rAx]) ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.restore();
      paneFrame(rCor, 'CORONAL', C.magenta, null, 1); paneFrame(r3, '3-D', C.sub, null, 1); paneFrame(rSag, 'SAGITTAL', C.yellow, null, 1);
      paneFrame(rPa, 'PERIAPICAL 2-D', C.text, null, 1); paneFrame(rAx, 'AXIAL', C.cyan, sliceNo(zs), 1);
    }
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
    ctx.fillStyle = C.orange; ctx.fillRect(64, 249, 15, 15);
    txt('RESORPTION 5/5 · EXTERNAL CERVICAL', 90, 269, `500 30px ${MONO}`, '#c9d5e1', 'left', 1, 0.3);
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
    const al = fade(t, a, b, 0.2, 0.2); if (al <= 0) return;
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
  function sub(t, a, b, arr, size) { const al = fade(t, a, b, 0.2, 0.2); if (al > 0) runs(arr, 64, 434, size || 38, 'left', al); }
  function drawCaptions(t) {
    const F = 0.2;
    // title: present at t = 0 and again on the end card, so the loop is seamless
    const titleA = Math.max(1 - seg(t, TB - F, TB), seg(t, TEND + 0.1, TEND + 0.3));     // headline out 19.1-19.3 -> title in 19.3-19.5: never two texts at once
    if (titleA > 0) { ctx.save(); ctx.globalAlpha = titleA; txt('External cervical resorption', 64, 368, `600 62px ${SANS}`, C.text); ctx.restore(); }
    sub(t, 0.1, TB, [{ t: 'Why ', c: C.text }, { t: '2-D', c: C.orange, w: 600 }, { t: ' underestimates it', c: C.text }], 44);
    // 1 · initiation
    head(t, TB, TC, '1', 'Initiation');
    sub(t, TB, TC, [{ t: 'Entry', c: C.orange, w: 600 }, { t: ' just below the ' }, { t: 'epithelial attachment', c: C.blue, w: 600 }]);
    // 2 · resorption
    head(t, TC, TD, '2', 'Resorption');
    sub(t, TC, TC2, [{ t: 'Spreads ' }, { t: 'around the canal', c: C.orange, w: 600 }]);
    sub(t, TC2, TD, [{ t: 'Pulp ' }, { t: 'walled off', c: C.mint, w: 600 }, { t: ' — until late' }]);
    // 3 · repair
    head(t, TD, TE1, '3', 'Repair');
    sub(t, TD, TE1, [{ t: 'Bone-like tissue', c: C.ivory, w: 600 }, { t: ' grows in' }]);
    // classification
    head(t, TE1, TE2, null, 'Patel 3-D classification', 62, 26);
    // 2-D vs 3-D
    head(t, TE2, TEND + 0.1, null, 'The periapical underestimates it', 60, 26);
  }

  // ---------- axial annotations ----------
  function drawAxAnnotations(t, r, v, zs, p) {
    const cx = PX(r, v, 0), cy = PY(r, v, 0);
    // portal marker (scene 1)
    const pm = fade(t, 3.9, TC, 0.3, 0.25);
    if (pm > 0) ringMark(PX(r, v, -V.outerA(zs)), cy, t, pm, C.orange);
    const dimA = 1 - 0.65 * seg(t, TE2 - 0.1, TE2 + 0.4);       // periapical scene: the axial tools step back
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
    // the pericanalar sheet (from scene 2b on): faint all round, bright along the arc that faces the lesion.
    // It steps back to ~40 % when the 'p' chip lights, so 'intact sheet' and 'probable pulp' are not asserted together.
    const sh = seg(t, TC2 - 0.1, TC2 + 0.5, ease.out) * (1 - 0.6 * seg(t, TE1 + 1.7, TE1 + 2.0));
    if (sh > 0) {
      const ca = V.canalA(zs) * v.ppm, cb = V.canalB(zs) * v.ppm, ts = V.TS * v.ppm;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
      const sp = spread(zs, p), e0 = Math.PI - sp.ling - 0.12, e1 = Math.PI + sp.bucc + 0.12;
      ctx.save(); ctx.globalAlpha = sh;
      ctx.beginPath(); ctx.ellipse(cx, cy, ca + ts, cb + ts, 0, 0, Math.PI * 2); ctx.ellipse(cx, cy, ca + 1, cb + 1, 0, 0, Math.PI * 2, true);
      ctx.fillStyle = Kit.rgba(C.mint, 0.13); ctx.fill();
      ctx.strokeStyle = Kit.rgba(C.mint, 0.4); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, ca + ts + 1, cb + ts + 1, 0, 0, Math.PI * 2); ctx.stroke();
      // lesion-facing arc
      ctx.beginPath(); ctx.ellipse(cx, cy, ca + ts, cb + ts, 0, e0, e1); ctx.ellipse(cx, cy, ca + 1, cb + 1, 0, e1, e0, true); ctx.closePath();
      ctx.fillStyle = Kit.rgba(C.mint, 0.22 + 0.12 * pulse); ctx.fill();
      ctx.shadowColor = C.mint; ctx.shadowBlur = 10 + 8 * pulse; ctx.strokeStyle = C.mint; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy, ca + ts + 1, cb + ts + 1, 0, e0, e1); ctx.stroke();
      ctx.restore();
    }
    // angle tool (classification scene → end): shaded sector + two rays + small arc at the vertex
    const an = seg(t, TE1 + 0.9, TE1 + 1.55, ease.inOut);
    if (an > 0) {
      const sp = spread(zs, 1), tot = sp.bucc + sp.ling;
      const a0 = Math.PI + sp.bucc, a1 = a0 - tot * an;      // sweep from the buccal end round (through mesial) to the lingual end
      const oa = V.outerA(zs), ob = V.outerB(zs);
      const rootR = (ang) => V.superR(oa, ob, Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) * v.ppm;
      ctx.save(); ctx.globalAlpha = dimA;
      // sector, clipped to the root outline
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let i = 0; i <= 80; i++) { const ang = lerp(a0, a1, i / 80), R = rootR(ang) + 5; ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); }
      ctx.closePath(); ctx.fillStyle = Kit.rgba(C.orange, 0.13); ctx.fill();
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const ang = lerp(a0, a1, i / 80), R = rootR(ang) + 5; if (i) ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); else ctx.moveTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); }
      ctx.strokeStyle = Kit.rgba(C.orange, 0.9); ctx.lineWidth = 3; ctx.shadowColor = '#000'; ctx.shadowBlur = 5; ctx.stroke();
      // rays
      ctx.lineWidth = 2.5; ctx.setLineDash([9, 6]); ctx.strokeStyle = '#ffd9b5';
      ctx.beginPath();
      for (const ang of [a0, a1]) { const R = rootR(ang) + 22; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); }
      ctx.stroke(); ctx.setLineDash([]);
      // small arc at the vertex (inside the canal)
      ctx.strokeStyle = C.orange; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 36, a1, a0, false); ctx.stroke();
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, 7); ctx.fill();
      ctx.restore();
      const deg = Math.round(tot * an * 180 / Math.PI);
      chip(r.x + 16, r.y + 70, [{ t: '≈ ' + deg + '°', f: `600 34px ${MONO}`, c: C.orange }], { alpha: Math.min(1, an * 4) * (0.45 + 0.55 * dimA), lh: 42, stroke: Kit.rgba(C.orange, 0.55) });
    }
    // sheet label chip + leader (drawn after the tools so nothing crosses the text)
    const ca2 = seg(t, TC2 + 0.25, TC2 + 0.7, ease.out) * (1 - seg(t, TE1 - 0.25, TE1));   // leaves with the Mavridou source line
    if (ca2 > 0) {
      const ca = V.canalA(zs) * v.ppm, cb = V.canalB(zs) * v.ppm, ts = V.TS * v.ppm;
      const bx = r.x + 16, by = r.y + r.h - 16;
      const ang = 2.25, dx = -Math.cos(ang), dy = Math.sin(ang);   // point on the sheet, lingual-distal side
      const Rr = 1 / Math.sqrt((dx / (ca + ts * 0.5)) * (dx / (ca + ts * 0.5)) + (dy / (cb + ts * 0.5)) * (dy / (cb + ts * 0.5)));
      const sx = cx + Rr * dx, sy = cy + Rr * dy, ex = bx + 352, ey = by - 86;
      ctx.save(); ctx.globalAlpha = ca2; ctx.strokeStyle = C.mint; ctx.lineWidth = 2.5; ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.fillStyle = C.mint; ctx.beginPath(); ctx.arc(sx, sy, 5.5, 0, 7); ctx.fill();
      ctx.restore();
      chip(bx, by, [{ t: 'resorption-resistant sheet', f: `600 30px ${SANS}`, c: C.mint }, { t: 'avg ≈ 0.2 mm · ex vivo', f: `400 30px ${SANS}`, c: C.text }], { bottom: true, alpha: ca2, stroke: Kit.rgba(C.mint, 0.5) });
    }
  }

  // ---------- sagittal annotations ----------
  function drawSagAnnotations(t, r, v, p) {
    // epithelial attachment bracket + entry marker (scene 1)
    const ba = fade(t, 3.4, TC, 0.35, 0.25);
    if (ba > 0) {
      ctx.save(); ctx.globalAlpha = ba; ctx.strokeStyle = C.blue; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.shadowColor = C.blue; ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const z = -0.72 + 0.66 * i / 8; const x = PX(r, v, -V.outerA(z)) - 10, y = PY(r, v, z); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.lineWidth = 4;
      for (const z of [-0.72, -0.06]) { const x = PX(r, v, -V.outerA(z)) - 10, y = PY(r, v, z); ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 5, y); ctx.stroke(); }
      ctx.restore();
    }
    const pm = fade(t, 3.9, TC, 0.3, 0.25);
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
    const ru = fade(t, TE1 + 0.3, TE2 + 0.0, 0.3, 0.25);
    if (ru > 0) {
      const hh = height(1);
      const L = V.ROOT_LEN, zc = 1.97;      // zc = alveolar crest at the mesial root surface
      const bounds = [-0.1, zc, L / 3, 2 * L / 3, L], zone = hh.zmax <= zc ? 0 : hh.zmax <= L / 3 ? 1 : hh.zmax <= 2 * L / 3 ? 2 : 3;
      const xr = PX(r, v, 4.25);
      const lit = seg(t, TE1 + 0.7, TE1 + 0.9);
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
        rr(xr + 18, ym - 21, 40, 42, 7); ctx.fillStyle = 'rgba(5,8,11,0.8)'; ctx.fill();
        if (on > 0) { rr(xr + 18, ym - 21, 40, 42, 7); ctx.fillStyle = Kit.rgba(C.orange, on); ctx.fill(); }
        txt(String(i + 1), xr + 38, ym + 11, `600 30px ${MONO}`, on > 0.5 ? '#170a02' : '#dfe7ef', 'center');
        ctx.restore();
      }
      // deepest point of the lesion → ruler
      const dl = seg(t, TE1 + 0.4, TE1 + 0.7, ease.out);
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
    const tr = seg(t, TE2 + 1.6, TE2 + 2.2, ease.inOut);
    if (tr > 0) {
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.setLineDash([9, 7]); ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        const z0 = -3.2, z1 = lerp(z0, 6.6, tr);
        for (let i = 0; i <= 30; i++) { const z = lerp(z0, z1, i / 30); const x = PX(r, v, sgn * (V.canalA(z) + 0.1)), y = PY(r, v, z); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
    }
    const cc = seg(t, TE2 + 1.9, TE2 + 2.3, ease.out);
    if (cc > 0) {
      const box = chip(r.x + 16, r.y + r.h - 78, [{ t: 'canal outline', f: `600 30px ${SANS}`, c: C.blue }, { t: 'often still traceable', f: `400 30px ${SANS}`, c: C.text }], { bottom: true, alpha: cc, stroke: Kit.rgba(C.blue, 0.5) });
      const tx = PX(r, v, -(V.canalA(4.9) + 0.1)), ty = PY(r, v, 4.9);
      ctx.save(); ctx.globalAlpha = cc; ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.moveTo(box.x + box.w, box.y + box.h / 2); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(tx, ty, 5, 0, 7); ctx.fill();
      ctx.restore();
    }
    if (ov > 0) {
      ctx.save(); ctx.globalAlpha = ov;
      const g = ctx.createLinearGradient(0, r.y + r.h - 70, 0, r.y + r.h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.78)'); g.addColorStop(1, 'rgba(0,0,0,0.88)');
      ctx.fillStyle = g; ctx.fillRect(r.x, r.y + r.h - 70, r.w, 70);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.strokeRect(r.x + 15, r.y + r.h - 34, 16, 16);
      txt('extent on CBCT', r.x + 42, r.y + r.h - 16, `500 30px ${SANS}`, C.text);
      ctx.restore();
    }
  }

  // ---------- dock: stage timeline → classification strip ----------
  const ROWS = [1358, 1406, 1454];
  function drawDock(t, p, q) {
    // stage timeline (scenes 1-3)
    const ga = fade(t, 0.25, TE1 + 0.1, 0.5, 0.25);
    if (ga > 0) {
      const lx = 300, x1 = 944, T0 = 1.6, T1 = TE1;
      const tm = (tt) => lx + (x1 - lx) * clamp((tt - T0) / (T1 - T0));
      const lanes = [
        { n: '1', name: 'Initiation', c: C.blue, a: 1.6, b: TC },
        { n: '2', name: 'Resorption', c: C.orange, a: TC - 0.25, b: 99 },
        { n: '3', name: 'Repair', c: C.ivory, a: TD + 0.15, b: 99 },
      ];
      ctx.save(); ctx.globalAlpha = ga;
      lanes.forEach((L, i) => {
        const y = ROWS[i], on = seg(t, L.a - 0.1, L.a + 0.25);
        const la = 0.4 + 0.6 * on;
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
      ctx.globalAlpha = ga * seg(t, 1.4, 1.8);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xp, ROWS[0] - 24); ctx.lineTo(xp, ROWS[2] + 24); ctx.stroke();
      ctx.restore();
    }
    // Patel 3-D classification strip
    const sa = fade(t, TE1 + 0.05, TEND, 0.3, 0.2) * (1 - 0.65 * seg(t, TE2 - 0.1, TE2 + 0.4));
    if (sa > 0) {
      const rowsDef = [
        { label: 'HEIGHT', chips: ['1', '2', '3', '4'], on: 1, at: TE1 + 0.7, min: 58 },
        { label: 'SPREAD', chips: ['A ≤90°', 'B ≤180°', 'C ≤270°', 'D >270°'], on: 2, at: TE1 + 1.55 },
        { label: 'PROXIMITY', chips: ['d dentin only', 'p probable pulp'], on: 1, at: TE1 + 1.8 },
      ];
      // one row reads at a time (height -> spread -> proximity), then all three hold
      const u = t - TE1, allOn = seg(u, 2.0, 2.25);
      const act = [1 - seg(u, 0.8, 0.95), seg(u, 0.8, 0.95) * (1 - seg(u, 1.65, 1.8)), seg(u, 1.65, 1.8)];
      ctx.save();
      rowsDef.forEach((R, i) => {
        const y = ROWS[i];
        ctx.globalAlpha = sa * (0.4 + 0.6 * Math.max(act[i], allOn));
        txt(R.label, 64, y + 11, `500 30px ${MONO}`, C.dim, 'left', 1, 0);
        let x = 246;
        R.chips.forEach((c, j) => {
          const f = `500 30px ${SANS}`, w = Math.max(R.min || 0, widthOf(c, f) + 26);
          const on = j === R.on ? seg(t, R.at, R.at + 0.2, ease.out) : 0;
          rr(x, y - 21, w, 42, 8);
          if (on > 0) { ctx.fillStyle = Kit.rgba(C.orange, on); ctx.fill(); }
          ctx.strokeStyle = on > 0 ? C.orange : C.line2; ctx.lineWidth = 2; ctx.stroke();
          txt(c, x + w / 2, y + 11, on > 0.5 ? `600 30px ${SANS}` : f, on > 0.5 ? '#170a02' : '#a9b7c6', 'center');
          x += w + 8;
        });
      });
      // running result
      const parts = [['2', TE1 + 0.7], ['C', TE1 + 1.55], ['p', TE1 + 1.8]];
      ctx.globalAlpha = sa;
      txt('CLASS', 596, ROWS[0] + 11, `500 30px ${MONO}`, C.dim, 'left', 1, 0);
      let x = 706;
      for (const [ch, at] of parts) { const on = seg(t, at, at + 0.2, ease.out); txt(on > 0.5 ? ch : '·', x, ROWS[0] + 15, `600 46px ${MONO}`, on > 0.5 ? C.orange : C.dimmer, 'left'); x += 30; }
      ctx.restore();
    }
    // one small source line per scene
    const src = [
      [TB, TE1, 'Mavridou et al., J Endod 2016'],
      [TE1, TE2, 'Patel et al., Int Endod J 2018;51:206'],
      [TE2, TEND, 'Patel K et al., J Endod 2016'],
    ];
    const SF = `400 25px ${SANS}`;
    for (const [a, b, s] of src) { const al = fade(t, a, b, 0.2, 0.2); if (al > 0) txt(s, 64, 1516, SF, C.dim, 'left', al); }
    { const al = fade(t, TD, TE1, 0.2, 0.2); if (al > 0) txt(' · proposed 3-stage model', 64 + widthOf(src[0][2], SF), 1516, SF, C.dim, 'left', al); }
    txt('SCHEMATIC · not a patient scan · not to scale', 64, 1558, `400 24px ${MONO}`, C.dim, 'left', 0.95);
  }

  // ---------- end card ----------
  function drawEnd(t) {
    const out = 1 - seg(t, DUR - 0.35, DUR - 0.15, ease.inOut);
    // 1) the lower panes (and their labels) clear first, so the card never fades in over other text
    const cov = seg(t, TEND - 0.2, TEND) * out;
    if (cov > 0) { ctx.save(); ctx.globalAlpha = cov; ctx.fillStyle = C.panel; ctx.fillRect(50, 1046, 980, 278); ctx.restore(); }
    // 2) opaque panel, 3) then its text
    const a = seg(t, TEND + 0.2, TEND + 0.35, ease.out) * out;
    if (a <= 0) return;
    const x = 48, y = 1050, w = 984, h = 444;
    ctx.save(); ctx.globalAlpha = a;
    rr(x, y, w, h, 4); ctx.fillStyle = '#080b0f'; ctx.fill(); ctx.strokeStyle = C.line2; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.cyan; ctx.fillRect(x, y, w, 3);
    const ta = seg(t, TEND + 0.35, TEND + 0.5);
    txt('TAKE-HOME', x + 36, y + 52, `500 30px ${MONO}`, C.cyan, 'left', ta, 1.5);
    const lines = ['Recognize it early', 'Consider CBCT before you treat', 'Treatment depends on extent'];
    lines.forEach((s, i) => {
      const li = seg(t, TEND + 0.4 + i * 0.2, TEND + 0.7 + i * 0.2, ease.out);
      const yy = y + 134 + i * 100, dx = (1 - li) * 26;
      ctx.save(); ctx.globalAlpha = a * li;
      rr(x + 36 + dx, yy - 44, 52, 56, 9); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.stroke();
      txt(String(i + 1), x + 62 + dx, yy - 3, `600 36px ${MONO}`, C.orange, 'center');
      txt(s, x + 112 + dx, yy, `600 50px ${SANS}`, C.text);
      ctx.restore();
    });
    txt('Patel et al., Int Endod J 2018;51:1224', x + 36, y + h - 26, `400 25px ${SANS}`, C.dim, 'left', ta);
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
