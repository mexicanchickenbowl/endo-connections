/*
 * 37 · Bioceramics: bactericidal or bacteriostatic — and for how long?
 * Style: AGAR PLATE LAB BENCH (top-down petri dishes on a matte black bench, grease pencil + label tape).
 * Single full-frame canvas; render(t) is a pure function of t. Evidence: RESEARCH.md / NOTES.md.
 *
 * World: four dishes in a 2 x 2 grid; a camera visits them one by one, then pulls back for the verdict.
 * v2 (review pass): see NOTES.md "Review changes".
 *   plate 1 FRESH      plate 2 SET
 *   plate 3 TUBULES    plate 4 CIDAL | STATIC
 */
(function () {
  const { canvas, ctx } = Kit.createCanvas();
  const { seg, ease, clamp, lerp, hash, rng, W, H } = Kit;
  const S = window.SPR37, { R, RA, SP, SC, RL, MS, MC } = S;
  const TAU = Math.PI * 2, DEG = Math.PI / 180;
  const D = 24.4;
  let A = null, benchPat = null, waxPat = null;
  const [wk, wg] = S.mk(SP, SP); // work canvas: lawn with a cleared zone

  // ---------- palette ----------
  const WAXW = '#f4f1e7', WAXY = '#ffd75e', WAXK = '#17130e';
  const TAPEW = '#efece0', TAPEY = '#f2d34e', INK = '#17181b', INKR = '#bd2c22', INKB = '#1d4fae';
  const HAND = '"Patrick Hand"', MONO = '"IBM Plex Mono"';

  // ---------- world + camera ----------
  const PL = [[0, 0], [1000, 0], [0, 1060], [1000, 1060]];
  const NOMX = 540, NOMY = 880; // where the active dish sits on screen
  // [t, camX, camY, zoom, screenY of the look-at point]; the reel opens on a slow 2.5% push-in (Z0 -> 1)
  const Z0 = 0.975;
  const CAMK = [
    [0, 0, 0, Z0, NOMY], [2.0, 0, 0, 1, NOMY], [6.6, 0, 0, 1, NOMY], [7.3, 1000, 0, 1, NOMY], [11.0, 1000, 0, 1, NOMY], [11.7, 0, 1060, 1, NOMY],
    [15.0, 0, 1060, 1, NOMY], [15.7, 1000, 1060, 1, NOMY], [18.9, 1000, 1060, 1, NOMY], [19.7, 548, 530, 0.49, 1056],
    [23.6, 548, 530, 0.49, 1056], [24.25, 0, 0, Z0, NOMY], [D, 0, 0, Z0, NOMY],
  ];
  let cam = { x: 0, y: 0, z: 1, cy: NOMY };
  function camAt(t) {
    let i = 0; while (i < CAMK.length - 2 && t >= CAMK[i + 1][0]) i++;
    const a = CAMK[i], b = CAMK[i + 1], u0 = seg(t, a[0], b[0]), u = i === 0 ? 1 - (1 - u0) * (1 - u0) : ease.inOut(u0);
    return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), cy: lerp(a[4], b[4], u) };
  }
  const w2s = (wx, wy) => [NOMX + (wx - cam.x) * cam.z, cam.cy + (wy - cam.y) * cam.z];

  // ---------- text helpers ----------
  const waxCache = new Map();
  function waxSprite(text, size, color) {
    const key = text + '|' + size + '|' + color;
    let s = waxCache.get(key); if (s) return s;
    const font = `400 ${size}px ${HAND}`;
    ctx.save(); ctx.font = font; const tw = ctx.measureText(text).width; ctx.restore();
    const pad = Math.ceil(size * 0.4), w = Math.ceil(tw) + pad * 2, h = Math.ceil(size * 1.4) + pad * 2;
    const [c, g] = S.mk(w, h);
    g.font = font; g.textBaseline = 'alphabetic'; g.fillStyle = color; g.strokeStyle = color; g.lineJoin = 'round';
    const bx = pad, by = pad + size;
    g.lineWidth = size * 0.05; g.globalAlpha = 0.9; g.strokeText(text, bx, by);   // fat, waxy stroke
    g.globalAlpha = 1; g.fillText(text, bx, by);
    g.globalAlpha = 0.5; g.fillText(text, bx + size * 0.016, by + size * 0.012);
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out'; g.fillStyle = waxPat; g.fillRect(0, 0, w, h);
    s = { c, w, h, pad, tw, size }; waxCache.set(key, s); return s;
  }
  /** grease-pencil text; (x,y) = baseline, left/centre/right. o: {color, align, reveal, alpha, rot} */
  function wax(text, x, y, size, o = {}) {
    const rv = o.reveal == null ? 1 : o.reveal, al = o.alpha == null ? 1 : o.alpha;
    if (rv <= 0 || al <= 0.003) return 0;
    const s = waxSprite(text, size, o.color || WAXW);
    let dx = -s.pad; if (o.align === 'center') dx -= s.tw / 2; else if (o.align === 'right') dx -= s.tw;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    const sw = rv >= 1 ? s.w : Math.max(1, Math.min(s.w, s.pad + s.tw * rv));
    ctx.drawImage(s.c, 0, 0, sw, s.h, dx, -s.pad - size, sw, s.h);
    ctx.restore();
    return s.tw;
  }
  /** one handwritten line in several colours, revealed left to right */
  function waxLine(parts, x, y, size, o = {}) {
    const ws = parts.map((p) => waxSprite(p[0], size, p[1] || WAXW).tw), total = ws.reduce((a, b) => a + b, 0);
    let x0 = o.align === 'center' ? x - total / 2 : x, acc = 0; const rv = o.reveal == null ? 1 : o.reveal;
    parts.forEach((p, i) => { wax(p[0], x0 + acc, y, size, { color: p[1] || WAXW, alpha: o.alpha, reveal: clamp((rv * total - acc) / ws[i]) }); acc += ws[i]; });
    return total;
  }
  function mono(text, x, y, size, wt, color, align, ls) {
    ctx.font = `${wt} ${size}px ${MONO}`; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = (ls || 0) + 'px'; ctx.fillText(text, x, y); ctx.letterSpacing = '0px';
  }
  const monoW = (text, size, wt) => { ctx.font = `${wt} ${size}px ${MONO}`; return ctx.measureText(text).width; };
  /** fine print: small grease pencil written straight on the bench */
  function fine(text, x, y, a, align) { wax(text, x, y, 32, { align: align || 'center', alpha: a * 0.86 }); }
  /** grease-pencil curly brace "}" from y0 to y1, drawn top to bottom */
  function brace(x, y0, y1, u, col) {
    if (u <= 0) return;
    const w = 13, ym = (y0 + y1) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 8, y0 - 8, w * 2 + 16, (y1 - y0 + 16) * u); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha *= 0.92;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + w, y0, x + w, y0 + w); ctx.lineTo(x + w, ym - w);
    ctx.quadraticCurveTo(x + w, ym, x + 2 * w, ym); ctx.quadraticCurveTo(x + w, ym, x + w, ym + w); ctx.lineTo(x + w, y1 - w);
    ctx.quadraticCurveTo(x + w, y1, x, y1); ctx.stroke(); ctx.restore();
  }
  function arrow(x1, y1, x2, y2, col, lw, head) {
    const a = Math.atan2(y2 - y1, x2 - x1), hd = head || lw * 3.4;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hd * 0.6, y2 - Math.sin(a) * hd * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(a - 0.45) * hd, y2 - Math.sin(a - 0.45) * hd); ctx.lineTo(x2 - Math.cos(a + 0.45) * hd, y2 - Math.sin(a + 0.45) * hd); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- lab label tape / index card ----------
  function tapePath(w, h, tooth) {
    const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, n = Math.max(3, Math.round(h / 11));
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
    for (let i = 0; i < n; i++) { ctx.lineTo(x1 + tooth, y0 + (i + 0.5) * h / n); ctx.lineTo(x1, y0 + (i + 1) * h / n); }
    ctx.lineTo(x0, y0 + h);
    for (let i = n - 1; i >= 0; i--) { ctx.lineTo(x0 - tooth, y0 + (i + 0.5) * h / n); ctx.lineTo(x0, y0 + i * h / n); }
    ctx.closePath();
  }
  /** o: {rot, color, pop (0..1 stick-on), alpha, card} — fn draws the content in tape-local coords (0,0 = centre) */
  function tape(cx, cy, w, h, o, fn) {
    const pop = o.pop == null ? 1 : o.pop, al = (o.alpha == null ? 1 : o.alpha) * clamp(pop * 2.2);
    if (al <= 0.003) return;
    const lift = 1 - clamp(pop);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(cx, cy - lift * 20); ctx.rotate(o.rot || 0); const sc = 1 + 0.06 * lift; ctx.scale(sc, sc);
    const path = () => { if (o.card) { ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 5); } else tapePath(w, h, 4); };
    ctx.save(); ctx.translate(3 + lift * 6, 6 + lift * 14); ctx.fillStyle = 'rgba(0,0,0,0.42)'; path(); ctx.fill(); ctx.translate(3, 5); ctx.fillStyle = 'rgba(0,0,0,0.16)'; path(); ctx.fill(); ctx.restore();
    ctx.fillStyle = o.color || TAPEW; path(); ctx.fill();
    ctx.save(); ctx.clip();
    const gr = ctx.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, 'rgba(255,255,255,0.28)'); gr.addColorStop(0.25, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(60,50,20,0.16)');
    ctx.fillStyle = gr; ctx.fillRect(-w / 2 - 6, -h / 2, w + 12, h);
    ctx.strokeStyle = 'rgba(90,80,50,0.07)'; ctx.lineWidth = 1; // paper fibres
    const n = Math.round(h / 7); for (let i = 1; i < n; i++) { const yy = -h / 2 + i * h / n + (hash(i, w | 0) - 0.5) * 3; ctx.beginPath(); ctx.moveTo(-w / 2 - 6, yy); ctx.lineTo(w / 2 + 6, yy + (hash(i, 3) - 0.5) * 2); ctx.stroke(); }
    ctx.restore();
    if (fn) fn();
    ctx.restore();
  }
  const pop = (t, t0, d) => { const u = seg(t, t0, t0 + (d || 0.4)); return u <= 0 ? 0 : ease.outBack(u) * 0.999 + 0.001; };

  // ---------- bench timer ----------
  function dial(cx, cy, a, u, stops, label) {
    if (a <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy);
    ctx.drawImage(A.dial, -145, -145);
    const ang = (180 + 180 * clamp(u)) * DEG;
    ctx.strokeStyle = 'rgba(200,50,40,0.30)'; ctx.lineWidth = 9; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(0, 0, 66, Math.PI, ang + 0.0001); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
    for (const s of stops) { const aa = (180 + 180 * s) * DEG; ctx.beginPath(); ctx.moveTo(Math.cos(aa) * 72, Math.sin(aa) * 72); ctx.lineTo(Math.cos(aa) * 91, Math.sin(aa) * 91); ctx.stroke(); }
    mono(label, 0, 62, 32, 700, INK, 'center');
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-Math.cos(ang) * 16 + 3, -Math.sin(ang) * 16 + 4); ctx.lineTo(Math.cos(ang) * 68 + 3, Math.sin(ang) * 68 + 4); ctx.stroke();
    ctx.strokeStyle = '#cf3329'; ctx.lineWidth = 5.5; ctx.beginPath(); ctx.moveTo(-Math.cos(ang) * 16, -Math.sin(ang) * 16); ctx.lineTo(Math.cos(ang) * 68, Math.sin(ang) * 68); ctx.stroke();
    ctx.fillStyle = '#1b1c1f'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(-3, -3, 3, 0, TAU); ctx.fill();
    ctx.drawImage(A.dialGlass, -145, -145);
    ctx.restore();
  }

  // ---------- bench ----------
  const SCRATCH = (() => { const r = rng(515), o = []; for (let i = 0; i < 34; i++) o.push([-750 + r() * 2500, -950 + r() * 3300, r() * Math.PI, 60 + r() * 260, 0.02 + r() * 0.04, (r() - 0.5) * 0.004]); return o; })();
  function drawBench() {
    ctx.fillStyle = '#0f0f11'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(NOMX - cam.x * cam.z, cam.cy - cam.y * cam.z); ctx.scale(cam.z, cam.z);
    const x0 = cam.x - NOMX / cam.z, y0 = cam.y - cam.cy / cam.z;
    ctx.fillStyle = benchPat; ctx.fillRect(x0 - 4, y0 - 4, W / cam.z + 8, H / cam.z + 8);
    ctx.lineCap = 'round';
    for (const [x, y, a, l, al, curv] of SCRATCH) { // fine wipe marks
      ctx.strokeStyle = `rgba(255,255,255,${al})`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + curv * l * l, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.022)'; ctx.lineWidth = 7; // old dish ring
    ctx.beginPath(); ctx.arc(520, 2200, 380, 0, TAU); ctx.stroke();
    ctx.save(); ctx.translate(500, 1945); ctx.rotate(-6 * DEG); ctx.drawImage(A.pencil, -320, -45); ctx.restore();
    ctx.restore();
    // overhead light pool
    const lg = ctx.createRadialGradient(470, 760, 60, 470, 760, 1250);
    lg.addColorStop(0, 'rgba(255,246,228,0.105)'); lg.addColorStop(0.5, 'rgba(255,246,228,0.045)'); lg.addColorStop(1, 'rgba(255,246,228,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  }
  function vignette() {
    const vg = ctx.createRadialGradient(540, 930, 640, 540, 930, 1260);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  // ---------- plate building blocks (plate-local coords, 0,0 = dish centre) ----------
  function halo(hR, a) { // schematic "pH indicator" pink around the material
    if (a <= 0.003 || hR < 78) return;
    const g = ctx.createRadialGradient(0, 0, 60, 0, 0, hR);
    g.addColorStop(0, `rgba(236,40,138,${a})`); g.addColorStop(0.45, `rgba(232,46,140,${a * 0.6})`); g.addColorStop(0.8, `rgba(228,60,150,${a * 0.2})`); g.addColorStop(1, 'rgba(228,60,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, hR, 0, TAU); ctx.fill();
  }
  /** lawn at density a; inside radius zR it is thinner by the factor (1 - depth): a zone of NO GROWTH, crisp edge */
  function drawLawn(spr, zR, a, depth) {
    if (zR > 76 && depth > 0.003) {
      wg.globalCompositeOperation = 'copy'; wg.globalAlpha = a; wg.drawImage(spr, 0, 0); wg.globalAlpha = 1;
      wg.globalCompositeOperation = 'destination-out';
      const g = wg.createRadialGradient(SC, SC, Math.max(0, zR - 9), SC, SC, zR + 1); g.addColorStop(0, `rgba(0,0,0,${depth})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      wg.fillStyle = g; wg.beginPath(); wg.arc(SC, SC, zR + 2, 0, TAU); wg.fill();
      ctx.drawImage(wk, -SC, -SC);
      // growth piles up slightly at the edge of a zone
      ctx.strokeStyle = `rgba(252,245,220,${0.2 * depth})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, zR + 6, 0, TAU); ctx.stroke();
    } else { ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(spr, -SC, -SC); ctx.restore(); }
  }
  function ions(t, hR, a, n, speed) { // hydroxyl ions leaving the material (schematic)
    if (a <= 0.003 || hR < 96) return;
    for (let i = 0; i < n; i++) {
      const th = (i + 0.8 * hash(i, 7)) / n * TAU + 0.07 * Math.sin(t * 1.1 + i), f = (hash(i, 8) + t * (0.15 + 0.12 * hash(i, 9)) * speed) % 1;
      const r = 80 + f * (hR - 84), al = Math.sin(Math.PI * f) * a, x = Math.cos(th) * r, y = Math.sin(th) * r;
      ctx.fillStyle = `rgba(255,150,205,${al * 0.32})`; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,244,250,${al * 0.95})`; ctx.beginPath(); ctx.arc(x, y, 3.1, 0, TAU); ctx.fill();
    }
  }

  // ---------- plate 1: freshly mixed ----------
  // the plates are rewound for the loop while the camera is still pulled back (seen small: "plate swapped")
  const resetK = (t) => seg(t, 23.35, 23.8, ease.inOut);
  const LAWN0 = 0.34; // a freshly seeded, still faint lawn
  function plate1(t) {
    const k = 1 - resetK(t);
    const hR = lerp(86, 302, seg(t, 0.25, 5.4, ease.out) * k), hA = seg(t, 0.25, 1.0) * k;
    // agar diffusion picture: the lawn GROWS everywhere except in the zone (nothing grown is erased)
    const g = seg(t, 0.5, 5.0, ease.inOut) * k, a = lerp(LAWN0, 1, g), inside = lerp(LAWN0, 0.1, g);
    ctx.drawImage(A.agarA, -SC, -SC);
    halo(hR, hA * 0.82);
    drawLawn(A.lawn1, 188, a, 1 - inside / a);
    halo(hR, hA * 0.3);
    ions(t, hR, seg(t, 0.25, 0.9) * k, 64, 1);
    ctx.drawImage(A.cementFresh, -120, -120);
  }
  function lid1(t) {
    wax('fresh', -300, 204, 84, { color: WAXK, rot: -9 * DEG });
    const a = seg(t, 0.4, 0.7) * (1 - resetK(t));
    if (a > 0) {
      ctx.save(); ctx.globalAlpha *= a;
      const u = seg(t, 0.4, 1.0, ease.out);
      arrow(66, -62, lerp(72, 156, u), lerp(-68, -148, u), WAXK, 5.5, 20);
      wax('OH', 166, -164, 62, { color: WAXK, reveal: seg(t, 0.8, 1.15) });
      if (t > 1.1) { ctx.strokeStyle = WAXK; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(227, -203); ctx.lineTo(245, -204); ctx.stroke(); }
      ctx.restore();
    }
  }

  // ---------- plate 2: set material, day 1 -> day 7 ----------
  function plate2(t) {
    const u = seg(t, 8.2, 9.0, ease.inOut); // day 1 -> day 7: the residual halo (schematic) fades with the timer
    const hR = lerp(134, 98, u), hA = lerp(0.62, 0.18, u);
    ctx.drawImage(A.agarB, -SC, -SC);
    halo(hR, hA * 0.82);
    drawLawn(A.lawn2, 0, 1, 0);
    halo(hR, hA * 0.3);
    ions(t, hR, lerp(0.5, 0.05, u), 9, 0.45);
    ctx.drawImage(A.cementSet, -120, -120);
  }
  function lid2(t) {
    wax('set', -292, 204, 84, { color: WAXK, rot: -9 * DEG }); // no zone: the measured finding (Farrugia 2017)
  }

  // ---------- plate 3: root slice + loupe on the tubules ----------
  const LX = 66, LY = 70, RSX = -184, RSY = -192;
  const deadFrac = (t) => lerp(0.14 + 0.39 * seg(t, 12.9, 13.9, ease.inOut), 0.14, resetK(t)); // one sweep, day 1 -> day 30
  function plate3(t) {
    ctx.drawImage(A.agarPaper, -SC, -SC);
    ctx.drawImage(A.root, RSX - 130, RSY - 130);
  }
  function lid3(t) {
    // region of interest on the canal wall + zoom lines to the loupe
    const rx = RSX + 30, ry = RSY + 10, ph = Math.atan2(ry - LY, rx - LX);
    ctx.save(); ctx.strokeStyle = 'rgba(20,20,22,0.7)'; ctx.lineWidth = 2;
    ctx.strokeRect(rx - 9, ry - 9, 18, 18);
    ctx.setLineDash([7, 6]);
    for (const s of [-1, 1]) { const a = ph + s * 0.62; ctx.beginPath(); ctx.moveTo(rx + (s > 0 ? -9 : 9), ry + (s > 0 ? 9 : -9)); ctx.lineTo(LX + Math.cos(a) * (RL + 24), LY + Math.sin(a) * (RL + 24)); ctx.stroke(); }
    ctx.restore();
    ctx.drawImage(A.loupeShadow, LX - RL - 100 + 10, LY - RL - 100 + 18);
    ctx.drawImage(A.micro, LX - MC, LY - MC);
    // live (green) / membrane-damaged "dead" (red) cocci — schematic
    const f = deadFrac(t);
    ctx.save(); ctx.translate(LX, LY);
    for (const b of A.bact) {
      const d = clamp((f - b.h) / 0.035), tw = 0.86 + 0.14 * Math.sin(t * 2.2 + b.x * 0.13 + b.y * 0.07);
      if (d < 1) { ctx.globalAlpha = (1 - d) * tw; ctx.drawImage(A.glowG, b.x - 13, b.y - 13, 26, 26); }
      if (d > 0) { ctx.globalAlpha = d * (0.9 + 0.1 * tw); ctx.drawImage(A.glowR, b.x - 13, b.y - 13, 26, 26); }
    }
    ctx.globalAlpha = 1;
    // in-field label
    ctx.save(); ctx.translate(-203, 0); ctx.rotate(-Math.PI / 2); mono('SEALER', 0, 11, 32, 600, 'rgba(236,244,247,0.92)', 'center', 3); ctx.restore();
    ctx.restore();
    ctx.drawImage(A.loupe, LX - RL - 60, LY - RL - 60);
  }

  // ---------- plate 4: divided dish, cidal | static ----------
  function plate4(t) {
    ctx.drawImage(A.agarBlood, -SC, -SC);
    // divider wall
    const sg = ctx.createLinearGradient(7, 0, 30, 0); sg.addColorStop(0, 'rgba(0,0,0,0.5)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, RA - 2, 0, TAU); ctx.clip();
    ctx.fillStyle = sg; ctx.fillRect(7, -RA, 24, 2 * RA);
    const dg = ctx.createLinearGradient(-7, 0, 7, 0); dg.addColorStop(0, 'rgba(235,245,250,0.75)'); dg.addColorStop(0.2, 'rgba(60,20,24,0.9)'); dg.addColorStop(0.55, 'rgba(150,120,125,0.55)'); dg.addColorStop(0.85, 'rgba(40,10,14,0.9)'); dg.addColorStop(1, 'rgba(235,245,250,0.5)');
    ctx.fillStyle = dg; ctx.fillRect(-7, -RA, 14, 2 * RA);
    ctx.restore();
    for (const c of A.sites) {
      let d = 0;
      if (c.side < 0 && c.h < 0.87) { const tau = 16.1 + 0.9 * Math.pow(c.h / 0.87, 1.45); d = seg(t, tau, tau + 0.4, ease.smooth); }
      const s = 44 * c.s;
      if (d > 0) { ctx.globalAlpha = d; ctx.drawImage(A.ghost, c.x - s / 2, c.y - s / 2, s, s); }
      if (d < 1) { ctx.globalAlpha = 1 - d; const ss = s * (1 - 0.12 * d); ctx.drawImage(A.colony, c.x - ss / 2, c.y - ss / 2, ss, ss); }
    }
    ctx.globalAlpha = 1;
  }
  function lid4(t) {
    // where the evidence sits: both flags stay wholly on the cidal half (set = partial kill; "static" was never measured)
    tape(-200, 30, 228, 84, { rot: -4 * DEG, color: TAPEW, pop: pop(t, 17.4, 0.4) }, () => mono('FRESH', 0, 21, 60, 700, INK, 'center', 1));
    tape(-174, 150, 296, 76, { rot: 3 * DEG, color: TAPEY, pop: pop(t, 17.75, 0.4) }, () => mono('SET: LESS', 0, 17, 48, 700, INK, 'center', 1));
  }

  const CONTENT = [plate1, plate2, plate3, plate4], LID = [lid1, lid2, lid3, lid4];
  function drawPlate(i, t) {
    const [sx, sy] = w2s(PL[i][0], PL[i][1]), z = cam.z, ext = (R + 150) * z;
    if (sx < -ext || sx > W + ext || sy < -ext || sy > H + ext) return;
    ctx.save(); ctx.translate(sx, sy); ctx.scale(z, z);
    ctx.drawImage(A.shadow, -540 + 14, -540 + 30);
    CONTENT[i](t);
    ctx.drawImage(A.glass, -SC, -SC);
    LID[i](t);
    ctx.restore();
  }

  // ---------- label groups: bench notes that belong to one dish (drawn in nominal screen coords) ----------
  function group(i, a, fn) {
    if (a <= 0.003) return;
    const [sx, sy] = w2s(PL[i][0], PL[i][1]);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(cam.z, cam.z); ctx.translate(-NOMX, -NOMY); ctx.globalAlpha = a; fn(); ctx.restore();
  }

  /** the handle: a tape scrap on the bench, one per dish group + one for the end card, so it pans with the bench */
  function handleTape(a) {
    tape(178, 1558, 246, 36, { rot: -1.5 * DEG, color: '#d9d6ca', alpha: 0.9 * a }, () => mono('@natebrooksendo', 0, 8, 23, 500, 'rgba(23,24,27,0.9)', 'center'));
  }

  function labels1(t) {
    const late = t > 12;                        // the loop: bench objects return first, the hook last
    const obj = late ? seg(t, 23.3, 23.6) : 1;  // timer + handle: back (small) before the push-in starts
    const hk = late ? seg(t, 24.2, 24.38) : 1 - seg(t, 2.1, 2.4);
    if (hk > 0) {
      tape(540, 274, 440, 62, { rot: -1.2 * DEG, alpha: hk }, () => mono('BIOCERAMICS', 4, 16, 46, 700, INK, 'center', 7));
      wax('bactericidal', 540, 392, 94, { align: 'center', alpha: hk });
      wax('or bacteriostatic?', 540, 474, 94, { align: 'center', alpha: hk, color: WAXY });
    }
    if (!late) {
      // the sourced kill: fresh iRoot SP, planktonic cells, direct contact — written only after the pH story is done
      waxLine([['Fresh iRoot SP: free-floating']], 540, 322, 66, { align: 'center', reveal: seg(t, 2.45, 2.9) });
      waxLine([['E. faecalis ', WAXW], ['dead in 2 min', WAXY]], 540, 398, 66, { align: 'center', reveal: seg(t, 2.75, 3.15) });
      fine('direct contact test · in vitro · Zhang 2009 J Endod', 540, 446, seg(t, 3.15, 3.45));
    }
    // timer: mixing -> 3 h
    const du = late ? 0 : seg(t, 1.2, 2.3, ease.inOut);
    dial(178, 1412, obj, du, [0, 1], du > 0.985 ? '3 h' : '0 h');
    handleTape(obj);
    if (!late) {
      // pH readout (MTA cement, pH meter) — two measured points, no interpolation
      tape(650, 1376, 548, 172, { rot: 1 * DEG, pop: pop(t, 0.8) }, () => {
        mono('MTA', -250, -24, 34, 600, INK, 'left'); mono('pH', -250, 14, 34, 600, INK, 'left');
        mono('10.2', -160, -6, 58, 700, INK, 'left');
        mono('mix', -92, 34, 30, 500, 'rgba(23,24,27,0.8)', 'center');
        if (du > 0) arrow(-8, -26, lerp(-4, 62, du), -26, INKR, 6, 20);
        const p = pop(t, 2.3, 0.35);
        if (p > 0) { ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate(152, -26); ctx.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p); mono('12.5', 0, 20, 58, 700, INKR, 'center'); ctx.restore(); mono('3 h', 152, 34, 30, 500, 'rgba(23,24,27,0.8)', 'center'); }
        mono('Torabinejad 1995 J Endod', 0, 72, 22, 500, 'rgba(23,24,27,0.7)', 'center');
      });
      tape(668, 1500, 512, 44, { rot: -0.8 * DEG, color: TAPEY, pop: pop(t, 1.3) }, () => mono('agar zone = no growth · schematic', 0, 8, 24, 500, INK, 'center'));
    }
  }

  function labels2(t) {
    waxLine([['Set: ', WAXW], ['partial, fading', WAXY]], 540, 368, 108, { align: 'center', reveal: seg(t, 7.25, 7.9) });
    fine('aged in water · E. faecalis · in vitro · halo schematic', 540, 440, seg(t, 7.9, 8.3));
    const du = seg(t, 8.2, 9.0, ease.inOut);
    dial(178, 1412, 1, du, [0, 1], du > 0.985 ? 'DAY 7' : 'DAY 1');
    handleTape(1);
    tape(650, 1404, 568, 232, { rot: -0.8 * DEG, pop: pop(t, 7.35) }, () => {
      mono('SET MTA · 1 H CONTACT · KILLED', 0, -70, 30, 600, INK, 'center');
      mono('Farrugia 2017 Sci Rep', 0, 100, 22, 500, 'rgba(23,24,27,0.7)', 'center');
      const rows = [['DAY 1', 97, seg(t, 7.9, 8.3, ease.out), 0], ['DAY 7', 82, seg(t, 8.9, 9.3, ease.out), 56]];
      for (const [lab, v, u, dy] of rows) {
        const y = -22 + dy;
        ctx.save(); ctx.globalAlpha *= lab === 'DAY 7' ? 0.35 + 0.65 * clamp(u * 3) : 1;
        mono(lab, -262, y + 12, 34, 700, INK, 'left');
        ctx.fillStyle = 'rgba(23,24,27,0.13)'; ctx.fillRect(-140, y - 14, 290, 28);
        ctx.fillStyle = lab === 'DAY 1' ? INKR : '#d9783a'; ctx.fillRect(-140, y - 14, 290 * v / 100 * u, 28);
        ctx.strokeStyle = 'rgba(23,24,27,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(-140, y - 14, 290, 28);
        if (u > 0.02) mono(Math.round(v * u) >= v ? v + '%' : '', 266, y + 14, 40, 700, INK, 'right');
        ctx.restore();
      }
    });
  }

  function labels3(t) {
    waxLine([['In dentin tubules:']], 540, 322, 76, { align: 'center', reveal: seg(t, 11.6, 12.2) });
    waxLine([['slow, partial kill', WAXY]], 540, 404, 76, { align: 'center', reveal: seg(t, 12.0, 12.6) });
    fine('sealers on infected dentin · in vitro · Wang 2014 J Endod', 540, 452, seg(t, 12.55, 12.85));
    const u = seg(t, 12.9, 13.9, ease.inOut);   // one sweep, after the text is written
    dial(178, 1412, 1, u, [0, 1], u > 0.985 ? 'DAY 30' : 'DAY 1');
    handleTape(1);
    tape(640, 1378, 500, 92, { rot: 1.2 * DEG, pop: pop(t, 11.85) }, () => {
      ctx.fillStyle = '#17a045'; ctx.beginPath(); ctx.arc(-196, 0, 15, 0, TAU); ctx.fill();
      mono('LIVE', -168, 15, 42, 700, INK, 'left', 1);
      ctx.fillStyle = '#de3024'; ctx.beginPath(); ctx.arc(34, 0, 15, 0, TAU); ctx.fill();
      mono('DEAD', 62, 15, 42, 700, INK, 'left', 1);
    });
    tape(640, 1480, 500, 44, { rot: -1 * DEG, color: TAPEY, pop: pop(t, 12.2) }, () => mono('live/dead stain · counts schematic', 0, 8, 22, 500, INK, 'center'));
  }

  function chart(kind, u) { // tiny count-vs-time sketch on an index card
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-150, -78); ctx.lineTo(-150, 62); ctx.lineTo(164, 62); ctx.stroke();
    if (kind === 'cidal') mono('count', -138, -66, 30, 500, INK, 'left');
    arrow(120, 62, 172, 62, INK, 3, 14);
    ctx.setLineDash([6, 7]); ctx.strokeStyle = 'rgba(23,24,27,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-148, -22); ctx.lineTo(160, -22); ctx.stroke(); ctx.setLineDash([]);
    if (u <= 0) return;
    // the falling curve stops clearly above the axis: "falls", not "to zero"
    const col = kind === 'cidal' ? INKR : INKB, f = (s) => kind === 'cidal' ? -22 + 54 * (1 - Math.exp(-3.6 * s)) / (1 - Math.exp(-3.6)) : -22;
    ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const s = i / 40 * u, x = -138 + 290 * s, y = f(s); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-138 + 290 * u, f(u), 9, 0, TAU); ctx.fill();
  }
  function labels4(t) {
    tape(300, 298, 336, 68, { rot: -1.5 * DEG, pop: pop(t, 15.5) }, () => mono('BACTERICIDAL', 0, 14, 40, 700, INK, 'center'));
    tape(762, 298, 384, 68, { rot: 1.2 * DEG, pop: pop(t, 15.7) }, () => mono('BACTERIOSTATIC', 0, 14, 40, 700, INK, 'center'));
    wax('count falls', 300, 432, 78, { align: 'center', color: WAXY, reveal: seg(t, 15.85, 16.3) });
    wax('count held', 762, 432, 78, { align: 'center', color: WAXY, reveal: seg(t, 16.0, 16.45) });
    const cu = seg(t, 16.1, 17.4, ease.inOut); // definition finishes before the FRESH / SET flags land (17.4, 17.75)
    tape(292, 1408, 392, 224, { rot: -1.2 * DEG, card: true, pop: pop(t, 15.75) }, () => chart('cidal', cu));
    tape(724, 1408, 392, 224, { rot: 1 * DEG, card: true, pop: pop(t, 15.9) }, () => chart('static', cu));
    fine('curves + colonies schematic', 640, 1562, seg(t, 16.4, 16.8));
    handleTape(1);
  }

  // end card, written as the camera finishes pulling back (after dishes 1 and 2 have slid clear of the text
  // area, about 19.4 s); complete by 20.5 s and held until 23.3 s
  function verdict(t) {
    const out = 1 - seg(t, 23.3, 23.6);
    if (t < 19.3 || out <= 0) return;
    const X = 78, SZ = 64;
    ctx.save(); ctx.globalAlpha = out;
    tape(300, 270, 440, 62, { rot: -1.2 * DEG, pop: pop(t, 19.38, 0.35) }, () => mono('BIOCERAMICS', 4, 16, 46, 700, INK, 'center', 7));
    const w1 = waxLine([['Fresh: ', WAXY], ['bactericidal on contact', WAXW]], X, 378, SZ, { reveal: seg(t, 19.4, 19.8) });
    const w2 = waxLine([['Set: ', WAXY], ['partial, fades', WAXW]], X, 456, SZ, { reveal: seg(t, 19.65, 20.05) });
    const w3 = waxLine([['Healing: ', WAXY], ['comparable', WAXW]], X, 534, SZ, { reveal: seg(t, 19.9, 20.3) });
    // evidence type, per line: lines 1-2 are laboratory findings, line 3 is the clinical one
    const bx = X + Math.max(w1, w2) + 14;
    brace(bx, 334, 470, seg(t, 20.05, 20.3, ease.out), WAXY);
    tape(bx + 34 + 92, 402, 184, 58, { rot: 4 * DEG, color: TAPEY, pop: pop(t, 20.1, 0.35) }, () => mono('IN VITRO', 0, 11, 32, 700, INK, 'center', 1));
    tape(X + w3 + 30 + 92, 514, 184, 58, { rot: -2 * DEG, color: TAPEY, pop: pop(t, 20.2, 0.3) }, () => mono('CLINICAL', 0, 11, 32, 700, INK, 'center', 1));
    fine('single-cone trials · Sabeti 2024 J Endod', X + 4, 580, seg(t, 20.25, 20.5), 'left');
    handleTape(seg(t, 19.3, 19.6));
    ctx.restore();
  }

  // ---------- frame ----------
  function render(t) {
    t = clamp(t, 0, D);
    cam = camAt(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    drawBench();
    for (let i = 0; i < 4; i++) drawPlate(i, t);
    if (t < 7.4 || t > 23.25) group(0, 1, () => labels1(t));
    if (t > 6.5 && t < 11.8) group(1, 1, () => labels2(t));
    if (t > 10.9 && t < 15.8) group(2, 1, () => labels3(t));
    if (t > 14.9 && t < 19.2) group(3, 1 - seg(t, 18.9, 19.15), () => labels4(t));
    verdict(t);
    vignette();
  }

  window.REEL = {
    title: 'Bioceramics: bactericidal or bacteriostatic?',
    duration: D,
    poster: 22.4,
    canvas,
    fonts: [`400 60px ${HAND}`, `400 28px ${MONO}`, `500 28px ${MONO}`, `600 34px ${MONO}`, `700 48px ${MONO}`],
    async setup() {
      A = S.build();
      benchPat = ctx.createPattern(A.bench, 'repeat');
      waxPat = ctx.createPattern(A.waxTile, 'repeat');
    },
    render,
  };
  Kit.boot(window.REEL);
})();
