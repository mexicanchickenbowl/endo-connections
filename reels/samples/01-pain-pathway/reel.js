/*
 * 01 · Pain pathway — NEON NEURO.  Deterministic: everything is a pure function of t.
 * Two impulses (A-delta = cyan, C = magenta) race from a lower-molar pulp to the cortex.
 * Toy model for the clocks: 150 mm first-order path, A-delta 15 m/s, C 1 m/s (typical values).
 * v2 (review pass): corrected cause of the dull-pain lag, honest time-scale pills, de-cluttered central relay,
 * C routed to S2/cingulate, wider "well-localized" reticle, seamless loop. See NOTES.md "Review changes".
 */
(function () {
  const { W, H, clamp, lerp, seg, env, ease, rgba } = Kit;
  const G = window.GEO;
  const TAU = Math.PI * 2;
  const SX = 540, SY = 940; // screen point the camera centre maps to

  const { canvas, ctx } = Kit.createCanvas();
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
  const [glowC, g] = mk(W, H);
  const [b1C, b1] = mk(W / 4, H / 4);
  const [b2C, b2] = mk(108, 192);
  const [noiseC, nz] = mk(W, H);

  // palette
  const CY = [56, 238, 255], MG = [255, 66, 204], VI = [190, 168, 255], WH = [236, 246, 255], LINE = [92, 138, 236], DIM = [150, 176, 222];
  const CY2 = [150, 245, 255], MG2 = [255, 140, 226]; // lighter tints for 2nd/3rd-order neurons
  const F = {
    hook: '700 118px "Space Grotesk", "Inter"',
    cap: '600 66px "Space Grotesk", "Inter"',
    sub: '400 40px "Space Grotesk", "Inter"',
    big: '700 150px "Space Grotesk", "Inter"',
    cardName: '700 54px "Space Grotesk", "Inter"',
    cardNum: '700 72px "JetBrains Mono"',
    cardUnit: '500 34px "Space Grotesk", "Inter"',
    m40: '700 40px "JetBrains Mono"', m34: '500 34px "JetBrains Mono"', m30: '500 30px "JetBrains Mono"', m30b: '700 30px "JetBrains Mono"',
    m26: '500 26px "JetBrains Mono"', m24: '400 24px "JetBrains Mono"', m22: '400 22px "JetBrains Mono"',
  };
  const capFont = (px) => `600 ${px}px "Space Grotesk", "Inter"`;

  // ---------------- timeline (seconds) ----------------
  // Caption chain (each window = Kit.readSecs + 0.5 s of fades): 5.33 | 7.85 | 10.37 | 12.89 | 15.71 | 18.23 | 21.35 | 24.77
  const T = {
    dur: 29.6,
    stim: 2.85, launch: 3.4, aCaud: 7.8, msScale: 0.44,      // 10 ms of model time shown over 4.4 s  (=> slowed 440x)
    inset0: 7.8, inset1: 10.1, cross0: 8.0, cross1: 8.8, dim0: 7.95, dim1: 9.35, // midline inset plays while Aδ waits at caudalis
    a2: 8.95, aVPM: 10.2, a3: 10.3, aS1: 10.95,
    sharp: 12.89,
    ff0: 15.45,
    conv0: 21.35, convLaunch: 21.5, convArrive: 22.6, convUp: 22.7, convVPM: 23.05, convS1: 23.35,
    take: 24.8,
  };
  const PATH_MM = 150, VA = 15, VC = 1, FF_X = 15; // toy model; FF_X = average slow-down during the C catch-up
  const M0 = (T.ff0 - T.launch) / T.msScale;
  T.cCaud = T.ff0 + ((PATH_MM / VC - M0) * FF_X) / 1000; // ~17.29 s
  T.c2 = T.cCaud + 0.15; T.cVPM = T.cCaud + 0.6; T.c3 = T.cVPM + 0.05; T.cS1 = T.cVPM + 0.36;
  function msAt(t) {
    if (t <= T.launch) return 0;
    if (t <= T.ff0) return (t - T.launch) / T.msScale;
    if (t <= T.cCaud) return M0 + (PATH_MM / VC - M0) * ease.smooth(seg(t, T.ff0, T.cCaud));
    return PATH_MM / VC;
  }

  // ---------------- geometry (built in setup) ----------------
  const P = {};
  let L = 1;
  const NODE = 21, MY0 = 16; // myelin internode spacing (world px); myelin starts at the canal orifice (only the coronal terminal is bare)
  const sA = (t) => Math.min(1, (msAt(t) * VA) / PATH_MM) * L;
  const sC = (t) => Math.min(1, msAt(t) / (PATH_MM / VC)) * L;
  function salt(s) { // saltatory display position: dwell at a node, then jump
    if (s <= MY0 || s >= L) return s;
    const k = (s - MY0) / NODE, i = Math.floor(k), f = k - i;
    return Math.min(L, MY0 + (i + ease.smooth(clamp((f - 0.5) / 0.5))) * NODE);
  }
  const tAat = (s) => T.launch + (s / L) * ((PATH_MM / VA) * T.msScale);
  function tCat(s) { // invert sC by bisection
    let lo = T.launch, hi = T.cCaud;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (sC(m) < s) lo = m; else hi = m; }
    return hi;
  }
  const ARR = {}; // arrival times per station

  // ---------------- camera ----------------
  function interp(stops, x) {
    if (x <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (x <= stops[i][0]) return lerp(stops[i - 1][1], stops[i][1], ease.smooth((x - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    return stops[stops.length - 1][1];
  }
  function follow(t) {
    const s = sA(Math.min(t + 0.3, T.aCaud));
    const p = G.at(P.route, s);
    return { x: p.x + 10, y: p.y, z: interp([[0, 3.5], [90, 3.0], [250, 2.5], [470, 2.2], [L, 2.05]], s) };
  }
  const push = (z, t, a, b) => z * (1 + 0.03 * ease.smooth(seg(t, a, b))); // slow 3% push-in during hold beats
  const SHOTS = [
    [0, 0, (t) => ({ x: 540, y: 940, z: 1 + 0.03 * ease.smooth(seg(t, 0, 2.2)) })],
    [2.15, 3.35, () => ({ x: 356, y: 1214, z: 3.5 })],
    [3.35, 4.3, follow],
    [7.55, 8.9, () => ({ x: 612, y: 960, z: 1.7 })],
    [10.55, 11.9, (t) => ({ x: 505, y: 995, z: push(1.2, t, 11.9, T.ff0) })],
    [T.ff0 - 0.3, T.ff0 + 0.7, () => ({ x: 520, y: 1005, z: 1.27 })],
    [T.cS1 - 0.15, T.cS1 + 0.85, (t) => ({ x: 512, y: 985, z: push(1.15, t, T.cS1 + 0.85, T.conv0) })],
    [T.conv0 - 0.25, T.conv0 + 0.9, () => ({ x: 548, y: 1000, z: 1.32 })],
    [T.take - 0.25, T.take + 0.9, () => ({ x: 540, y: 940, z: 1.0 })],
  ];
  function camAt(t) {
    let c = SHOTS[0][2](t);
    for (let i = 1; i < SHOTS.length; i++) {
      const [a, b, f] = SHOTS[i];
      if (t < a) break;
      const w = ease.inOut(seg(t, a, b)), s = f(t);
      c = { x: lerp(c.x, s.x, w), y: lerp(c.y, s.y, w), z: Math.exp(lerp(Math.log(c.z), Math.log(s.z), w)) };
    }
    return c;
  }
  let cam = { x: 540, y: 940, z: 1 };
  const ws = (x, y) => [(x - cam.x) * cam.z + SX, (y - cam.y) * cam.z + SY];
  const px = (n) => n / cam.z; // screen px -> world units

  // ---------------- small drawing helpers ----------------
  function stroke(c, path, col, lw, u = 1, pts) {
    c.beginPath(); G.traceRange(c, path, 0, u * path.len, pts); c.strokeStyle = col; c.lineWidth = lw; c.stroke();
  }
  function strokeRange(c, path, s0, s1, col, lw, pts) {
    if (s1 <= s0) return;
    c.beginPath(); G.traceRange(c, path, s0, s1, pts); c.strokeStyle = col; c.lineWidth = lw; c.stroke();
  }
  function fillPoly(c, path, col) { c.beginPath(); G.traceRange(c, path, 0, path.len); c.closePath(); c.fillStyle = col; c.fill(); }
  function glowDot(c, x, y, r, rgb, a = 1, core = 0.0) {
    const gr = c.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(core ? WH : rgb, a));
    gr.addColorStop(core ? 0.12 : 0.0, rgba(rgb, a * 0.9));
    gr.addColorStop(0.45, rgba(rgb, a * 0.22));
    gr.addColorStop(1, rgba(rgb, 0));
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function ring(c, x, y, r, col, lw) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); }
  function ellipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); }

  function txt(c, s, x, y, o = {}) {
    c.save();
    c.font = o.font || F.m30; c.fillStyle = o.color || '#fff'; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    c.letterSpacing = (o.ls || 0) + 'px';
    c.globalAlpha *= o.alpha != null ? o.alpha : 1;
    if (o.glow) { c.shadowColor = o.glowColor || o.color; c.shadowBlur = o.glow; c.fillText(s, x, y); c.shadowBlur = 0; }
    c.fillText(s, x, y);
    c.restore();
  }
  function measure(c, s, font, ls = 0) { c.save(); c.font = font; c.letterSpacing = ls + 'px'; const w = c.measureText(s).width; c.restore(); return w; }
  /** largest font (from start px downwards) whose width fits maxW */
  function fit(c, s, mkFont, start, maxW) { let p = start; while (p > 30 && measure(c, s, mkFont(p)) > maxW) p -= 2; return mkFont(p); }
  /** draw an arrow glyph (→) of given height, returns width */
  function arrowGlyph(c, x, y, h, col, a = 1, lw) {
    const w = h * 0.95; c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = lw || Math.max(2.5, h * 0.09); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x + h * 0.08, y); c.lineTo(x + w, y); c.moveTo(x + w - h * 0.32, y - h * 0.3); c.lineTo(x + w, y); c.lineTo(x + w - h * 0.32, y + h * 0.3); c.stroke(); c.restore();
    return w + h * 0.18;
  }
  /** rich line: parts = [{s, color, glow}] | {arrow:true,color} | {dot:true}; centred or left at x. measureOnly -> width */
  function rich(c, parts, x, y, font, align = 'center', alpha = 1, arrowH = 40, measureOnly = false) {
    const widths = parts.map((p) => (p.arrow ? arrowH * 1.13 + 16 : p.dot ? arrowH * 1.0 : measure(c, p.s, font)));
    const total = widths.reduce((a, b) => a + b, 0);
    if (measureOnly) return total;
    let cx = align === 'center' ? x - total / 2 : x;
    parts.forEach((p, i) => {
      if (p.arrow) arrowGlyph(c, cx + 8, y - arrowH * 0.36, arrowH, p.color || '#fff', alpha);
      else if (p.dot) { c.save(); c.globalAlpha *= alpha; c.fillStyle = '#9fb6e8'; c.beginPath(); c.arc(cx + widths[i] / 2, y - arrowH * 0.4, arrowH * 0.12, 0, TAU); c.fill(); c.restore(); }
      else txt(c, p.s, cx, y, { font, color: p.color || '#fff', alpha, glow: p.glow || 0, glowColor: p.glowColor });
      cx += widths[i];
    });
    return total;
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

  // variable-offset parallel copy of a path: d(s) world px at arclength s (same point count as the spine)
  function offsetVar(path, dfn) {
    const p = path.p, n = p.length;
    return p.map((q, i) => {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], Ln = Math.hypot(dx, dy) || 1, d = dfn(path.cum[i]);
      return [q[0] - (dy / Ln) * d, q[1] + (dx / Ln) * d];
    });
  }

  // ---------------- setup ----------------
  let DUST = [], GYRI = [];
  function setup() {
    const mp = G.mkPath;
    P.head = mp(G.HEAD, 8); P.ear = mp(G.EAR, 6); P.eyeU = mp(G.EYE_U, 6); P.eyeL = mp(G.EYE_L, 6); P.brow = mp(G.BROW, 6);
    P.brain = mp(G.BRAIN, 8, true); P.sulci = G.SULCI.map((s) => mp(s, 8)); P.s1band = mp(G.S1_BAND, 4, true);
    P.cereb = mp(G.CEREBELLUM, 8, true); P.folia = G.FOLIA.map((s) => mp(s, 8));
    P.stemF = mp(G.STEM_FRONT, 8); P.stemB = mp(G.STEM_BACK, 8); P.pons = mp(G.PONS_BULGE, 8);
    P.mand = mp(G.MANDIBLE, 8); P.ramus = mp(G.RAMUS_FRONT, 8); P.maxilla = mp(G.MAXILLA, 8);
    P.canalA = mp(G.CANAL_A, 8); P.canalB = mp(G.CANAL_B, 8);
    P.teeth = [];
    G.LOWER_TEETH.forEach(([x, w, k, ch, rl]) => P.teeth.push({ path: mp(G.toothPts(x, G.OCC_LOW, w, ch, rl, k, false), 4, true), x, low: true, k }));
    G.UPPER_TEETH.forEach(([x, w, k, ch, rl]) => P.teeth.push({ path: mp(G.toothPts(x, G.OCC_UP, w, ch, rl, k, true), 4, true), x, low: false, k }));
    P.pulpL = mp(G.PULP_LM1, 4, true); P.pulpU = mp(G.PULP_UM1, 4, true);
    P.v1 = mp(G.V1, 8); P.v2 = mp(G.V2, 8);
    P.route = mp(G.ROUTE, 12); L = P.route.len;
    // A-delta and C wires: tight inside the narrow canal, 10 px apart once out of the tooth (so the C race reads on its own)
    const sep = (s) => lerp(2.5, 5, ease.smooth(seg(s, 50, 110)));
    P.rA = offsetVar(P.route, (s) => -sep(s)); P.rC = offsetVar(P.route, (s) => sep(s));
    P.asc = mp(G.ASC, 12); P.ascA = G.offsetPts(P.asc, -2.4); P.ascC = G.offsetPts(P.asc, 2.4);
    P.tc = mp(G.TC, 12); P.tcA = G.offsetPts(P.tc, -2.2);
    P.cing = mp(G.CING, 12);
    P.full = G.withCum(P.route.p.concat(P.asc.p, P.tc.p));
    P.inputs = G.INPUTS.map((inp, i) => { const path = mp(inp.pts, 10); return { path, pts: G.offsetPts(path, [-7, 7, -10, 10][i]) }; });
    // intrapulpal endings: A-delta to the pulp periphery / odontoblast layer, C deeper in the pulp core (Nair 1995)
    P.endA = [[[351, 1197], [345, 1192], [340, 1189]], [[351, 1197], [352, 1191], [356, 1188], [361, 1187]], [[347, 1200], [341, 1196], [338, 1198]], [[355, 1199], [360, 1195], [363, 1197]]].map((s) => mp(s, 6));
    P.endC = [[[351, 1197], [348, 1203]], [[351, 1197], [354, 1205]], [[349, 1202], [346, 1209]], [[353, 1203], [357, 1210]], [[351, 1197], [351, 1206], [350, 1214]], [[352, 1199], [358, 1201]]].map((s) => mp(s, 6));
    P.distal = mp([[355, 1201], [358, 1222], [362, 1250], [366, 1266], [380, 1274]], 8);

    // station arclengths + arrival times
    const nearest = (pt) => { let best = 0, bd = 1e9; P.route.p.forEach((q, i) => { const d = Math.hypot(q[0] - pt[0], q[1] - pt[1]); if (d < bd) { bd = d; best = i; } }); return P.route.cum[best]; };
    ARR.sGang = nearest(G.ST.ganglion);
    ARR.A = { pulp: T.launch, gang: tAat(ARR.sGang), caud: T.aCaud, vpm: T.aVPM, s1: T.aS1 };
    ARR.C = { pulp: T.launch, gang: tCat(ARR.sGang), caud: T.cCaud, vpm: T.cVPM, s1: T.cS1 };

    const r = Kit.rng(11);
    DUST = Array.from({ length: 110 }, () => ({ x: r() * 1400 - 160, y: r() * 2300 - 190, s: 0.6 + r() * 1.8, a: 0.12 + r() * 0.4, p: 0.25 + r() * 0.5, ph: r() * TAU, sp: 4 + r() * 10 }));
    GYRI = []; // faint extra wiggles inside the cerebrum for texture
    const r2 = Kit.rng(5);
    for (let i = 0; i < 14; i++) {
      const cx = 380 + r2() * 440, cy = 640 + r2() * 260, ang = r2() * Math.PI, len = 40 + r2() * 60;
      const pts = []; for (let k = 0; k <= 5; k++) { const u = k / 5 - 0.5; pts.push([cx + Math.cos(ang) * u * len + Math.sin(ang) * Kit.noise1(k * 0.9, i) * 9, cy + Math.sin(ang) * u * len - Math.cos(ang) * Kit.noise1(k * 0.9, i + 50) * 9]); }
      if (inBrain(cx, cy)) GYRI.push(G.mkPath(pts, 6));
    }
    // static luminance dither (0-4 levels) to break gradient banding after Instagram's re-encode
    const id = nz.createImageData(W, H), dd = id.data;
    for (let i = 0, q = 0; i < W * H; i++, q += 4) { const v = (Kit.hash(i, 77) * 5) | 0; dd[q] = dd[q + 1] = dd[q + 2] = v; dd[q + 3] = 255; }
    nz.putImageData(id, 0, 0);
  }
  function inBrain(x, y) { // crude test: inside brain polygon and away from S1 strip
    const poly = G.BRAIN; let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins; }
    return ins && Math.abs(x - 610) > 70 && y < 900;
  }

  // ---------------- background ----------------
  function background(t, dim) {
    const c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    const gr = c.createRadialGradient(560, 900, 60, 540, 960, 1250);
    gr.addColorStop(0, '#0c1838'); gr.addColorStop(0.45, '#071027'); gr.addColorStop(1, '#020409');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter'; c.drawImage(noiseC, 0, 0); c.globalCompositeOperation = 'source-over';
    // parallax dot lattice
    const z2 = 1 + (cam.z - 1) * 0.35, gx = cam.x * 0.35, gy = cam.y * 0.35, sp = 46 * z2;
    const ox = ((SX - gx * z2) % sp + sp) % sp, oy = ((SY - gy * z2) % sp + sp) % sp;
    c.fillStyle = rgba([110, 150, 240], 0.075 * dim);
    for (let y = oy; y < H; y += sp) for (let x = ox; x < W; x += sp) c.fillRect(x - 1, y - 1, 2, 2);
    // drifting dust (parallax layer). Drift and twinkle are periodic in T.dur so the last frame matches frame 0.
    for (const d of DUST) {
      const cx = lerp(540, cam.x, d.p), cy = lerp(940, cam.y, d.p), zz = lerp(1, cam.z, d.p);
      const sx = SX + (d.x - cx) * zz;
      const drift = d.sp * 4.5 * Math.sin((TAU * t) / T.dur + d.ph);
      const sy = ((SY + (d.y - drift - cy) * zz) % 2200 + 2200) % 2200 - 140;
      const a = d.a * (0.6 + 0.4 * Math.sin((TAU * 4 * t) / T.dur + d.ph)) * dim;
      c.fillStyle = rgba([150, 190, 255], a);
      c.beginPath(); c.arc(sx, sy, d.s * Math.min(2.2, zz), 0, TAU); c.fill();
    }
  }

  // ---------------- world layer (glow canvas) ----------------
  function setCam(c) { c.setTransform(cam.z, 0, 0, cam.z, SX - cam.x * cam.z, SY - cam.y * cam.z); }

  function lineArt(c, t, la) {
    const lw = (2.0 * Math.pow(cam.z, 0.4)) / cam.z;
    c.lineCap = 'round'; c.lineJoin = 'round';
    const col = (a) => rgba(LINE, a * la);
    fillPoly(c, P.brain, rgba([40, 70, 160], 0.06 * la));
    stroke(c, P.head, col(0.85), lw * 1.35);
    stroke(c, P.ear, col(0.2), lw);
    stroke(c, P.eyeU, col(0.55), lw); stroke(c, P.eyeL, col(0.35), lw); stroke(c, P.brow, col(0.3), lw);
    stroke(c, P.brain, col(0.6), lw * 1.1);
    P.sulci.forEach((s, i) => stroke(c, s, col(i < 2 ? 0.42 : 0.26), lw * 0.85));
    GYRI.forEach((s) => stroke(c, s, col(0.12), lw * 0.75));
    fillPoly(c, P.s1band, rgba(CY, 0.02 * la));
    stroke(c, P.cereb, col(0.45), lw); P.folia.forEach((s) => stroke(c, s, col(0.22), lw * 0.8));
    stroke(c, P.stemF, col(0.5), lw); stroke(c, P.stemB, col(0.5), lw); stroke(c, P.pons, col(0.4), lw);
    c.save(); ellipse(c, G.ST.thal[0], G.ST.thal[1], 36, 19, -0.25); c.strokeStyle = col(0.45); c.lineWidth = lw; c.stroke(); c.restore();
    c.save(); ellipse(c, G.ST.ganglion[0], G.ST.ganglion[1] + 1, 21, 10, 0.1); c.strokeStyle = col(0.55); c.lineWidth = lw; c.stroke(); c.restore();
    c.save(); ellipse(c, 652, 1112, 8, 32, -0.2); c.strokeStyle = col(0.45); c.lineWidth = lw; c.stroke(); c.restore();
    stroke(c, P.mand, col(0.65), lw * 1.1); stroke(c, P.ramus, col(0.5), lw); stroke(c, P.maxilla, col(0.3), lw);
    stroke(c, P.canalA, col(0.22), lw * 0.8); stroke(c, P.canalB, col(0.22), lw * 0.8);
    const tcol = (a) => rgba([150, 205, 255], a * la);
    P.teeth.forEach((tt) => stroke(c, tt.path, tcol(tt.k === 'm' && tt.x < 360 ? 0.75 : 0.42), lw * (tt.k === 'm' && tt.x < 360 ? 1.15 : 0.9)));
    stroke(c, P.pulpL, rgba([255, 140, 220], 0.45 * la), lw * 0.9);
    stroke(c, P.pulpU, rgba([255, 140, 220], 0.22 * la), lw * 0.8);
    stroke(c, P.v1, rgba(DIM, 0.16 * la), lw); stroke(c, P.v2, rgba(DIM, 0.2 * la), lw);
    // fade the neck out softly instead of stopping on a hard line
    c.save(); c.globalCompositeOperation = 'destination-out';
    const ng = c.createLinearGradient(0, 1380, 0, 1490); ng.addColorStop(0, 'rgba(0,0,0,0)'); ng.addColorStop(1, 'rgba(0,0,0,1)');
    c.fillStyle = ng; c.fillRect(-400, 1380, 2000, 600); c.restore();
  }

  function nerves(c, t, wa, fa, kA) {
    const lw = (1.6 * Math.pow(cam.z, 0.45)) / cam.z;
    const wireA = seg(t, 1.0, 2.2) * wa;
    // dim base wires
    stroke(c, P.route, rgba(CY, 0.2 * wireA * kA), lw, 1, P.rA);
    stroke(c, P.route, rgba(MG, 0.24 * wireA), lw * 0.85, 1, P.rC);
    stroke(c, P.asc, rgba(CY2, 0.24 * wireA), lw);           // 2nd-order neuron: solid, lighter tint, no myelin dashes
    stroke(c, P.tc, rgba(CY2, 0.2 * wireA), lw * 0.9);
    stroke(c, P.cing, rgba(MG2, 0.12 * wireA), lw * 0.8);
    stroke(c, P.distal, rgba(DIM, 0.18 * wireA), lw * 0.7);
    P.endA.forEach((e) => stroke(c, e, rgba(CY, 0.4 * wireA), lw * 0.7));
    P.endC.forEach((e) => stroke(c, e, rgba(MG, 0.4 * wireA), lw * 0.6));
    // synapse 1: primary terminal bouton, a visible gap, then the 2nd-order cell body
    const end = G.at(P.route, L, P.rA);
    c.fillStyle = rgba(CY, 0.5 * wireA); c.beginPath(); c.arc(end.x, end.y, px(2.6), 0, TAU); c.fill();
    c.fillStyle = rgba(CY2, 0.6 * wireA); c.beginPath(); c.arc(G.ASC[0][0], G.ASC[0][1], px(3.6), 0, TAU); c.fill();
    // myelin sheaths along the A-delta fibre (internodes), flash at nodes as the impulse passes
    const head = sA(t);
    c.lineCap = 'round';
    for (let s = MY0; s < L - 4; s += NODE) {
      const passed = head >= s;
      const tp = tAat(s);
      const flash = passed ? Math.exp(-(t - tp) * 3.5) : 0;
      const a = (0.2 + (passed ? 0.22 : 0) + flash * 0.6) * wireA * fa * kA;
      strokeRange(c, P.route, s + 3.2, s + NODE - 3.2, rgba(CY, a), px(6.5), P.rA);
      if (flash > 0.02) { const q = G.at(P.route, s, P.rA); glowDot(c, q.x, q.y, px(16), CY, flash * 0.8 * fa * kA); }
    }
  }

  function litTrail(c, path, pts, s0, sHead, rgb, tail, a = 1, wpx = 4.2, baseA = 0.42, baseW = 2.4) {
    if (sHead <= s0) return;
    strokeRange(c, path, s0, sHead, rgba(rgb, baseA * a), px(baseW), pts);
    const N = 12;
    for (let i = 0; i < N; i++) {
      const e0 = sHead - (tail * (i + 1)) / N, e1 = sHead - (tail * i) / N;
      if (e1 <= s0) break;
      const k = 1 - i / N;
      strokeRange(c, path, Math.max(s0, e0), e1, rgba(rgb, Math.pow(k, 1.6) * 0.95 * a), px(wpx * (0.55 + 0.45 * k)), pts);
    }
  }
  function pulse(c, x, y, rgb, scale = 1, a = 1, flare = false) {
    glowDot(c, x, y, px(52 * scale), rgb, 0.9 * a, 1);
    c.fillStyle = rgba(WH, a); c.beginPath(); c.arc(x, y, px(5 * scale), 0, TAU); c.fill();
    if (flare) {
      c.save(); c.translate(x, y);
      const fl = px(64 * scale);
      const gr = c.createLinearGradient(-fl, 0, fl, 0); gr.addColorStop(0, rgba(rgb, 0)); gr.addColorStop(0.5, rgba(WH, 0.85 * a)); gr.addColorStop(1, rgba(rgb, 0));
      c.fillStyle = gr; c.fillRect(-fl, -px(1.2), fl * 2, px(2.4));
      const gv = c.createLinearGradient(0, -fl * 0.6, 0, fl * 0.6); gv.addColorStop(0, rgba(rgb, 0)); gv.addColorStop(0.5, rgba(WH, 0.6 * a)); gv.addColorStop(1, rgba(rgb, 0));
      c.fillStyle = gv; c.fillRect(-px(1), -fl * 0.6, px(2), fl * 1.2);
      c.restore();
    }
  }
  function shock(c, x, y, t0, t, rgb, maxR = 70, a = 1) {
    const k = seg(t, t0, t0 + 0.9);
    if (k <= 0 || k >= 1) return;
    ring(c, x, y, px(12 + maxR * ease.out(k)), rgba(rgb, (1 - k) * 0.85 * a), px(2.5 * (1 - k) + 0.6));
  }
  const NEVER = 1e9;
  function station(c, t, pos, tA, tC, fa, kA = 1) {
    const [x, y] = pos;
    const lit = (t0) => (t >= t0 ? 0.55 + 0.45 * Math.exp(-(t - t0) * 2.2) : 0);
    const a = lit(tA) * fa * kA, m = lit(tC) * fa;
    ring(c, x, y, px(10), rgba(DIM, 0.35 * fa * seg(t, 1.0, 2.2)), px(1.4)); // appears with the wires (frame 0 == last frame)
    if (a > 0) { glowDot(c, x, y, px(34), CY, 0.7 * a); ring(c, x, y, px(12), rgba(CY, 0.9 * a), px(2)); }
    if (m > 0) { glowDot(c, x, y, px(30), MG, 0.7 * m); ring(c, x, y, px(7), rgba(MG, 0.95 * m), px(2)); }
    shock(c, x, y, tA, t, CY, 70, fa); shock(c, x, y, tC, t, MG, 70, fa);
  }

  function world(t) {
    const c = g;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    setCam(c);
    c.globalCompositeOperation = 'lighter';
    const endK = seg(t, T.dur - 0.45, T.dur - 0.05);            // loop: return to the frame-0 state
    const live = 1 - endK;
    const dimTake = 1 - 0.62 * seg(t, T.take - 0.1, T.take + 0.7);
    const la = Math.min(dimTake, lerp(0.38, 1, ease.smooth(seg(t, 0, 1.0)))); // 0.38 at t=0 == 0.38 at the end
    const convDim = 1 - 0.8 * seg(t, T.conv0, T.conv0 + 0.6) * (1 - seg(t, T.take - 0.2, T.take + 0.6));
    const kA = 1 - 0.7 * seg(t, T.ff0 - 0.3, T.ff0 + 0.3);      // let the C race read on its own
    const ffK = seg(t, T.ff0 - 0.3, T.ff0 + 0.3);
    lineArt(c, t, la);
    const fa = convDim * dimTake * live;
    nerves(c, t, la * live, fa, kA);

    // teaser: a cyan comet sweeps the whole route while a magenta one lags far behind
    const pvFade = seg(t, 0.35, 0.8) * (1 - seg(t, 2.55, 3.0));
    if (pvFade > 0) {
      const pa = seg(t, 0.45, 2.45, ease.inOut), pc = 0.32 * seg(t, 0.45, 2.9, ease.inOut);
      const sa = pa * P.full.len, sc = pc * P.full.len;
      litTrail(c, P.full, null, Math.max(0, sc - 100), sc, MG, 100, 0.7 * pvFade, 3.2);
      litTrail(c, P.full, null, Math.max(0, sa - 180), sa, CY, 180, 0.8 * pvFade, 3.8);
      let q = G.at(P.full, sc); pulse(c, q.x, q.y, MG, 0.75, 0.9 * pvFade);
      q = G.at(P.full, sa); pulse(c, q.x, q.y, CY, 0.85, 1.0 * pvFade, true);
    }
    // molar beacon during the hook
    const beacon = (1 - seg(t, 2.6, 3.3)) * seg(t, 0.2, 0.8);
    if (beacon > 0) glowDot(c, 351, 1200, px(46 + 8 * Math.sin(t * 4)), [255, 120, 220], 0.35 * beacon);

    // intense cold stimulus at the crown (icy rays + small snowflake)
    const st = seg(t, T.stim, T.stim + 0.9);
    if (st > 0 && st < 1) {
      const k = ease.out(st);
      for (let i = 0; i < 10; i++) {
        const ang = -Math.PI / 2 + (i - 4.5) * 0.24;
        const r0 = px(10 + 40 * k), r1 = px(26 + 70 * k);
        c.beginPath(); c.moveTo(351 + Math.cos(ang) * r0, 1176 + Math.sin(ang) * r0); c.lineTo(351 + Math.cos(ang) * r1, 1176 + Math.sin(ang) * r1);
        c.strokeStyle = rgba([200, 240, 255], (1 - st) * 0.9); c.lineWidth = px(2.2); c.stroke();
      }
      glowDot(c, 351, 1180, px(40), [200, 240, 255], (1 - st) * 0.6);
    }
    const sf = env(t, T.stim - 0.1, T.launch + 1.2, 0.3, 0.5) * fa;
    if (sf > 0) {
      const fx = 351, fy = 1176 - px(192), R = px(17);
      c.strokeStyle = rgba([210, 245, 255], 0.9 * sf); c.lineWidth = px(2.2); c.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const an = (i * Math.PI) / 3 + Math.PI / 2, ex = fx + Math.cos(an) * R, ey = fy + Math.sin(an) * R;
        c.beginPath(); c.moveTo(fx, fy); c.lineTo(ex, ey);
        const bx = fx + Math.cos(an) * R * 0.6, by = fy + Math.sin(an) * R * 0.6;
        c.moveTo(bx, by); c.lineTo(bx + Math.cos(an + 0.7) * R * 0.35, by + Math.sin(an + 0.7) * R * 0.35);
        c.moveTo(bx, by); c.lineTo(bx + Math.cos(an - 0.7) * R * 0.35, by + Math.sin(an - 0.7) * R * 0.35);
        c.stroke();
      }
    }
    // pulp lights up at launch
    const pl = seg(t, T.launch - 0.25, T.launch + 0.2) * (1 - 0.6 * seg(t, T.launch + 0.6, T.launch + 2.0));
    if (pl > 0) fillPoly(c, P.pulpL, rgba([255, 120, 220], 0.35 * pl * la));

    // ---- primary afferents ----
    const hA = salt(sA(t)), hC = sC(t);
    if (t >= T.launch) {
      const endA = seg(t, T.launch - 0.1, T.launch + 0.4);
      P.endA.forEach((e) => stroke(c, e, rgba(CY, 0.9 * endA * (1 - 0.6 * seg(t, T.launch + 1, T.launch + 3)) * fa), px(2.2)));
      P.endC.forEach((e) => stroke(c, e, rgba(MG, 0.9 * endA * (1 - 0.5 * seg(t, T.launch + 1, T.launch + 3)) * fa), px(1.8)));
      litTrail(c, P.route, P.rA, 0, hA, CY, 150, fa * kA, 4.6);
      litTrail(c, P.route, P.rC, 0, hC, MG, t > T.ff0 ? 200 : 60, fa, lerp(3.6, 5.2, ffK), lerp(0.42, 0.9, ffK), lerp(2.4, 4.2, ffK));
      const aA = 1 - seg(t, T.aCaud, T.aCaud + 0.25);
      if (aA > 0) { const q = G.at(P.route, hA, P.rA); pulse(c, q.x, q.y, CY, 1.0, aA * fa, true); }
      const aC = 1 - seg(t, T.cCaud, T.cCaud + 0.25);
      if (aC > 0) { const q = G.at(P.route, hC, P.rC); pulse(c, q.x, q.y, MG, lerp(0.9, 1.05, ffK), aC * fa); }
    }
    // synapse 1 flash (primary terminal -> 2nd-order cell body)
    const syn = Math.max(t >= T.aCaud ? Math.exp(-(t - T.aCaud) * 1.6) : 0, t >= T.cCaud ? Math.exp(-(t - T.cCaud) * 1.6) : 0);
    if (syn > 0.01) glowDot(c, 649, 1122, px(22), WH, 0.55 * syn * fa);
    // ---- 2nd & 3rd order neurons (A-delta-driven = light cyan, C-driven = light magenta -> deep/medial cortex) ----
    const a2 = seg(t, T.a2, T.aVPM) * P.asc.len, a3 = seg(t, T.a3, T.aS1) * P.tc.len;
    const c2 = seg(t, T.c2, T.cVPM) * P.asc.len, c3 = seg(t, T.c3, T.cS1) * P.cing.len;
    litTrail(c, P.asc, P.ascA, 0, a2, CY2, 110, fa * kA, 4.2);
    litTrail(c, P.tc, P.tcA, 0, a3, CY2, 80, fa * kA, 4.2);
    litTrail(c, P.asc, P.ascC, 0, c2, MG2, 110, fa, 4.8, 0.8, 3.4);
    litTrail(c, P.cing, null, 0, c3, MG2, 80, fa, 4.8, 0.8, 3.4);
    if (t > T.a2 && t < T.aVPM + 0.2) { const q = G.at(P.asc, a2, P.ascA); pulse(c, q.x, q.y, CY2, 0.85, (1 - seg(t, T.aVPM, T.aVPM + 0.2)) * fa, true); }
    if (t > T.a3 && t < T.aS1 + 0.2) { const q = G.at(P.tc, a3, P.tcA); pulse(c, q.x, q.y, CY2, 0.85, (1 - seg(t, T.aS1, T.aS1 + 0.2)) * fa, true); }
    if (t > T.c2 && t < T.cVPM + 0.2) { const q = G.at(P.asc, c2, P.ascC); pulse(c, q.x, q.y, MG, 0.9, (1 - seg(t, T.cVPM, T.cVPM + 0.2)) * fa); }
    if (t > T.c3 && t < T.cS1 + 0.2) { const q = G.at(P.cing, c3); pulse(c, q.x, q.y, MG, 0.9, (1 - seg(t, T.cS1, T.cS1 + 0.2)) * fa); }

    // ---- stations ----
    const ST = G.ST;
    const gA = t >= ARR.A.gang ? 1 : 0, gC = t >= ARR.C.gang ? 1 : 0;
    if (gA || gC) {
      c.save(); ellipse(c, ST.ganglion[0], ST.ganglion[1] + 1, 21, 10, 0.1);
      c.fillStyle = rgba(gC ? [200, 140, 255] : CY, 0.16 * fa); c.fill(); c.restore();
      for (let i = 0; i < 6; i++) { const x = ST.ganglion[0] - 13 + i * 5.2, y = ST.ganglion[1] + 1 + Math.sin(i * 1.7) * 4; c.fillStyle = rgba(WH, 0.5 * fa); c.beginPath(); c.arc(x, y, px(2.2), 0, TAU); c.fill(); }
    }
    station(c, t, ST.ganglion, ARR.A.gang, ARR.C.gang, fa, kA);
    station(c, t, ST.caudalis, ARR.A.caud, ARR.C.caud, fa, kA);
    station(c, t, ST.vpm, ARR.A.vpm, ARR.C.vpm, fa, kA);
    station(c, t, ST.s1, ARR.A.s1, NEVER, fa, kA);   // second pain is not routed to the S1 face-area node
    if (t >= T.aCaud) { c.save(); ellipse(c, 652, 1112, 8, 32, -0.2); c.fillStyle = rgba(CY, 0.12 * fa * kA); c.fill(); c.restore(); }
    if (t >= T.aVPM) { c.save(); ellipse(c, ST.thal[0], ST.thal[1], 36, 19, -0.25); c.fillStyle = rgba(CY, 0.08 * fa * kA); c.fill(); c.restore(); }
    // C arrival: broad deep/medial cortical glow (S2 + anterior cingulate, schematic)
    if (t >= T.cS1) {
      const cg = 0.55 + 0.45 * Math.exp(-(t - T.cS1) * 2.2);
      c.save(); c.translate(ST.cing[0], ST.cing[1]); c.scale(1.6, 1);
      glowDot(c, 0, 0, 62, MG, 0.42 * cg * fa); c.restore();
      shock(c, ST.cing[0], ST.cing[1], T.cS1, t, MG, 110, fa);
    }

    // ---- SHARP: crisp S1 face-area burst, then a reticle on the molar region (well-localized, not one-tooth exact) ----
    const sh = seg(t, T.aS1, T.aS1 + 0.3) * (1 - seg(t, T.ff0 - 0.2, T.ff0 + 0.4));
    if (sh > 0) {
      c.beginPath(); c.moveTo(628, 728); c.quadraticCurveTo(618, 770, 603, 808);
      c.strokeStyle = rgba(CY, 0.22 * sh * fa); c.lineWidth = px(26); c.stroke();
      c.strokeStyle = rgba(CY, 0.5 * sh * fa); c.lineWidth = px(10); c.stroke();
      c.strokeStyle = rgba(WH, 0.85 * sh * fa); c.lineWidth = px(2.2); c.stroke();
      const kb = seg(t, T.aS1, T.aS1 + 1.1);
      if (kb < 1) for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU + 0.2, r0 = px(14 + 30 * ease.out(kb)), r1 = px(30 + 80 * ease.out(kb));
        c.beginPath(); c.moveTo(ST.s1[0] + Math.cos(ang) * r0, ST.s1[1] + Math.sin(ang) * r0); c.lineTo(ST.s1[0] + Math.cos(ang) * r1, ST.s1[1] + Math.sin(ang) * r1);
        c.strokeStyle = rgba(CY, (1 - kb) * 0.95 * fa); c.lineWidth = px(2); c.stroke();
      }
    }
    const rcx = 356, rcy = 1200;
    const rt = seg(t, T.sharp - 0.05, T.sharp + 0.3) * (1 - seg(t, T.ff0 - 0.2, T.ff0 + 0.4));
    if (rt > 0) {
      const kr = seg(t, T.sharp, T.sharp + 0.6, ease.outBack);
      const R = lerp(130, 62, kr);
      ring(c, rcx, rcy, R, rgba(CY, 0.95 * rt * fa), px(2.4));
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        c.beginPath(); c.moveTo(rcx + Math.cos(ang) * (R + px(4)), rcy + Math.sin(ang) * (R + px(4))); c.lineTo(rcx + Math.cos(ang) * (R + px(16)), rcy + Math.sin(ang) * (R + px(16)));
        c.strokeStyle = rgba(CY, 0.95 * rt * fa); c.lineWidth = px(2.4); c.stroke();
      }
      glowDot(c, 351, 1196, px(18), CY, 0.5 * rt * fa, 1);
    }
    // ---- DULL: diffuse breathing clouds (jaw + broad deep cortex) ----
    const du = seg(t, T.cS1, T.cS1 + 1.0) * (1 - 0.7 * seg(t, T.conv0, T.conv0 + 0.8)) * (1 - seg(t, T.take - 0.2, T.take + 0.5)) * live;
    if (du > 0) {
      const br = 0.75 + 0.25 * Math.sin((t - T.cS1) * TAU * 0.55 - Math.PI / 2);
      glowDot(c, 385, 1205, 175, MG, 0.5 * du * br);
      glowDot(c, 470, 1150, 120, MG, 0.25 * du * br);
      glowDot(c, 545, 812, 165, MG, 0.4 * du * br);
      glowDot(c, 470, 770, 115, MG, 0.22 * du * br);
      glowDot(c, 630, 845, 105, MG, 0.2 * du * br);
      ring(c, rcx, rcy, 62, rgba(CY, 0.25 * du), px(1.6)); // faint ghost of the sharp reticle for comparison
    }
    // ---- convergence ----
    const cv = seg(t, T.conv0, T.conv0 + 0.5) * (1 - seg(t, T.take - 0.1, T.take + 0.5));
    if (cv > 0) {
      const k = seg(t, T.convLaunch, T.convArrive);
      P.inputs.forEach((inp) => {
        stroke(c, inp.path, rgba(VI, 0.28 * cv), px(1.6), 1, inp.pts);
        const sH = k * inp.path.len;
        litTrail(c, inp.path, inp.pts, 0, sH, VI, 110, cv, 3.4);
        if (k > 0 && k < 1) { const q = G.at(inp.path, sH, inp.pts); pulse(c, q.x, q.y, VI, 0.7, cv); }
      });
      // distinct origin of each input
      const oa = cv * seg(t, T.conv0, T.convLaunch + 0.3);
      P.inputs.forEach((inp) => {
        const [x, y] = inp.pts[0];
        glowDot(c, x, y, px(26), VI, 0.5 * oa);
        ring(c, x, y, px(9), rgba(VI, 0.9 * oa), px(2));
        c.fillStyle = rgba(WH, 0.9 * oa); c.beginPath(); c.arc(x, y, px(3), 0, TAU); c.fill();
      });
      if (t >= T.convArrive) {
        const kk = Math.exp(-(t - T.convArrive) * 1.5);
        glowDot(c, ST.caudalis[0], ST.caudalis[1], px(50 + 25 * kk), VI, 0.6 * cv, 0);
        shock(c, ST.caudalis[0], ST.caudalis[1], T.convArrive, t, VI, 110);
      }
      const u2 = seg(t, T.convUp, T.convVPM) * P.asc.len, u3 = seg(t, T.convVPM, T.convS1) * P.tc.len;
      litTrail(c, P.asc, P.asc.p, 0, u2, VI, 100, cv, 4);
      litTrail(c, P.tc, P.tc.p, 0, u3, VI, 80, cv, 4);
      if (t > T.convUp && t < T.convVPM) { const q = G.at(P.asc, u2); pulse(c, q.x, q.y, VI, 0.8, cv); }
      if (t > T.convVPM && t < T.convS1) { const q = G.at(P.tc, u3); pulse(c, q.x, q.y, VI, 0.8, cv); }
      // which tooth? ambiguous halos alternate over candidate teeth
      if (t > T.convS1 - 0.6) {
        const q = seg(t, T.convS1 - 0.6, T.convS1);
        [[350, 1150], [351, 1205], [397, 1205], [317, 1200]].forEach(([x, y], i) => {
          const w = 0.5 + 0.5 * Math.sin((t - T.convS1) * 3.2 - i * 1.6);
          glowDot(c, x, y, px(40), VI, 0.55 * q * cv * w);
          ring(c, x, y, px(24), rgba(VI, 0.5 * q * cv * w), px(1.6));
        });
        glowDot(c, 602, 785, 110, VI, 0.2 * q * cv);
      }
    }
  }

  // ---------------- bloom composite ----------------
  function composite() {
    b1.setTransform(1, 0, 0, 1, 0, 0); b1.globalCompositeOperation = 'copy'; b1.filter = 'blur(3px)'; b1.drawImage(glowC, 0, 0, b1C.width, b1C.height); b1.filter = 'none';
    b2.setTransform(1, 0, 0, 1, 0, 0); b2.globalCompositeOperation = 'copy'; b2.filter = 'blur(3px)'; b2.drawImage(glowC, 0, 0, b2C.width, b2C.height); b2.filter = 'none';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.85; ctx.drawImage(b2C, 0, 0, W, H);
    ctx.globalAlpha = 0.9; ctx.drawImage(b1C, 0, 0, W, H);
    ctx.globalAlpha = 1; ctx.drawImage(glowC, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------------- UI layer ----------------
  // Captions say what HAPPENS at each relay (the HUD route map already names the stations).
  const CAPS = [
    { a: 5.33, b: 7.85, title: [{ s: 'Cell bodies, no synapse' }] },
    { a: 7.85, b: 10.37, title: [{ s: 'Synapse 1' }, { dot: true }, { s: 'crosses midline' }] },
    { a: 10.37, b: 12.89, title: [{ s: 'Synapse 2 (VPM)' }, { arrow: true, color: '#9fb6e8' }, { s: 'cortex' }] },
    { a: 12.89, b: 15.71, title: [{ s: '1st pain: ' }, { s: 'SHARP', color: rgba(CY), glow: 22 }], sub: 'brief, well-localized' },
    { a: 15.71, b: 18.23, title: [{ s: 'C fibers arrive ' }, { s: 'later', color: rgba(MG), glow: 22 }],
      fine: ['real teeth: the dull pain lags by seconds,', 'mostly the time for cold to reach the pulp', 'Jyväsjärvi 1987 · Mengel 1993'] },
    { a: 18.23, b: 21.35, title: [{ s: '2nd pain: ' }, { s: 'DULL', color: rgba(MG), glow: 22 }], sub: 'aching, poorly localized' },
    { a: 21.35, b: 24.79, title: [{ s: 'Why so diffuse?' }], sub: 'partly: convergence in caudalis' },
  ];
  const TAGS = [
    { a: 2.85, b: 5.08, s: 'intense cold stimulus', at: [351, 1176], off: [0, -120], col: WH },
    { a: 4.7, b: 7.22, s: 'inferior alveolar n. (V3)', at: [523, 1052], off: [-250, -40], col: DIM },
    { a: 11.0, b: 13.25, s: 'S1 face area', at: [611, 770], off: [-290, -70], col: CY },
    { a: 18.3, b: 20.55, s: 'S2 + cingulate', at: [540, 816], off: [-250, -60], col: MG },
    { a: 22.8, b: 24.79, s: 'which tooth?', at: [372, 1160], off: [-40, -190], col: VI },
  ];
  const STAGE = { x0: 72, x1: 1008, y0: 572, y1: 1262 };

  function scrims(t) {
    const c = ctx;
    let gr = c.createLinearGradient(0, 0, 0, 600);
    gr.addColorStop(0, 'rgba(2,4,10,0.96)'); gr.addColorStop(0.62, 'rgba(2,4,10,0.82)'); gr.addColorStop(1, 'rgba(2,4,10,0)');
    c.fillStyle = gr; c.fillRect(0, 0, W, 600);
    const cb = env(t, 3.2, T.take + 0.3, 0.5, 0.5);
    gr = c.createLinearGradient(0, 1290, 0, H);
    gr.addColorStop(0, 'rgba(2,4,10,0)'); gr.addColorStop(0.18, `rgba(2,4,10,${0.78 * cb + 0.2})`); gr.addColorStop(1, 'rgba(2,4,10,0.96)');
    c.fillStyle = gr; c.fillRect(0, 1290, W, H - 1290);
  }

  function chrome() {
    const c = ctx;
    c.save();
    c.fillStyle = rgba(CY, 0.9); c.shadowColor = rgba(CY); c.shadowBlur = 10; c.beginPath(); c.arc(76, 262, 5, 0, TAU); c.fill(); c.restore();
    txt(c, '@natebrooksendo', 92, 271, { font: F.m26, color: 'rgba(205,225,255,0.82)' });
    txt(c, 'schematic · not to scale', 1012, 271, { font: F.m22, color: 'rgba(170,190,230,0.62)', align: 'right' });
  }

  function hook(t) {
    const c = ctx;
    const a = Math.max(1 - seg(t, 3.05, 3.3), seg(t, T.dur - 0.4, T.dur - 0.02)); // fades back in for a seamless loop
    if (a <= 0) return;
    const kw = measure(c, 'TOOTH', F.m30b, 8) + 70 + measure(c, 'BRAIN', F.m30b, 8);
    let x = 540 - kw / 2;
    txt(c, 'TOOTH', x, 332, { font: F.m30b, color: rgba(CY, 0.85), ls: 8, alpha: a });
    x += measure(c, 'TOOTH', F.m30b, 8) + 10;
    arrowGlyph(c, x + 4, 321, 40, rgba(CY, 0.85), a, 3);
    txt(c, 'BRAIN', x + 60, 332, { font: F.m30b, color: rgba(CY, 0.85), ls: 8, alpha: a });
    const pulseA = 0.8 + 0.2 * Math.sin((TAU * 11 * t) / T.dur); // periodic in T.dur
    rich(c, [{ s: 'Sharp', color: rgba(CY), glow: 30 * pulseA }, { s: ' or ', color: '#ffffff' }, { s: 'dull?', color: rgba(MG), glow: 30 * pulseA }], 540, 452, F.hook, 'center', a);
    txt(c, 'Two fibers. Two speeds.', 540, 518, { font: F.sub, color: 'rgba(214,228,255,0.9)', align: 'center', alpha: a });
  }

  function captions(t) {
    const c = ctx;
    for (const cp of CAPS) {
      if (t < cp.a || t > cp.b) continue;
      const a = env(t, cp.a, cp.b, 0.25, 0.25);
      const dy = (1 - ease.out(seg(t, cp.a, cp.a + 0.35))) * 14;
      const w = rich(c, cp.title, 0, 0, F.cap, 'center', 1, 46, true);
      const font = w > 930 ? capFont(Math.floor((66 * 930) / w)) : F.cap;
      rich(c, cp.title, 540, 468 + dy, font, 'center', a, 46);
      if (cp.sub) txt(c, cp.sub, 540, 528 + dy, { font: F.sub, color: 'rgba(200,216,248,0.92)', align: 'center', alpha: a });
      if (cp.fine) {
        const fw = Math.max(...cp.fine.map((s) => measure(c, s, F.m24))) + 36;
        c.save(); c.globalAlpha = a; roundRect(c, 540 - fw / 2, 490 + dy, fw, 28 * cp.fine.length + 16, 14); c.fillStyle = 'rgba(4,8,22,0.78)'; c.fill(); c.restore();
        cp.fine.forEach((s, i) => txt(c, s, 540, 516 + dy + i * 28, { font: F.m24, color: i === cp.fine.length - 1 ? 'rgba(170,186,226,0.85)' : 'rgba(236,214,250,0.95)', align: 'center', alpha: a }));
      }
    }
  }

  function hud(t) {
    const c = ctx;
    const a = env(t, 3.3, T.take + 0.1, 0.45, 0.45);
    if (a <= 0) return;
    const xs = [130, 330, 540, 750, 950], y = 318, labels = ['PULP', 'GANGLION', 'CAUDALIS', 'THALAMUS', 'CORTEX'];
    const prog = (s, t2, t3, s2t, s3t) => { // map to 0..1 along hud
      const f = s / L; let p = f <= ARR.sGang / L ? (0.25 * f) / (ARR.sGang / L) : 0.25 + (0.25 * (f - ARR.sGang / L)) / (1 - ARR.sGang / L);
      if (t >= t2) p = 0.5 + 0.25 * seg(t, t2, s2t); if (t >= t3) p = 0.75 + 0.25 * seg(t, t3, s3t);
      return p;
    };
    const pA = prog(sA(t), T.a2, T.a3, T.aVPM, T.aS1), pC = prog(sC(t), T.c2, T.c3, T.cVPM, T.cS1);
    const X = (p) => lerp(xs[0], xs[4], p);
    c.save(); c.globalAlpha = a;
    c.strokeStyle = 'rgba(120,150,210,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(xs[0], y); c.lineTo(xs[4], y); c.stroke();
    c.lineCap = 'round';
    c.shadowBlur = 12;
    c.shadowColor = rgba(CY); c.strokeStyle = rgba(CY); c.lineWidth = 4; c.beginPath(); c.moveTo(xs[0], y - 5); c.lineTo(X(pA), y - 5); c.stroke();
    c.shadowColor = rgba(MG); c.strokeStyle = rgba(MG); c.beginPath(); c.moveTo(xs[0], y + 5); c.lineTo(X(Math.max(0.001, pC)), y + 5); c.stroke();
    c.shadowBlur = 0;
    const reachedA = [T.launch, ARR.A.gang, T.aCaud, T.aVPM, T.aS1], reachedC = [T.launch, ARR.C.gang, T.cCaud, T.cVPM, T.cS1];
    xs.forEach((x, i) => {
      const ra = t >= reachedA[i], rc = t >= reachedC[i];
      c.fillStyle = '#060b18'; c.beginPath(); c.arc(x, y, 11, 0, TAU); c.fill();
      c.lineWidth = 2.5; c.strokeStyle = ra ? rgba(CY) : 'rgba(130,160,220,0.55)'; if (ra) { c.shadowColor = rgba(CY); c.shadowBlur = 14; }
      c.beginPath(); c.arc(x, y, 11, 0, TAU); c.stroke(); c.shadowBlur = 0;
      if (rc) { c.fillStyle = rgba(MG); c.shadowColor = rgba(MG); c.shadowBlur = 12; c.beginPath(); c.arc(x, y, 5.5, 0, TAU); c.fill(); c.shadowBlur = 0; }
      else if (ra) { c.fillStyle = rgba(CY, 0.9); c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); }
      const active = (ra && (i === 4 || t < reachedA[i + 1])) || (rc && t > T.ff0 && (i === 4 || t < reachedC[i + 1]));
      txt(c, labels[i], x, y + 47, { font: F.m30, color: active ? 'rgba(235,245,255,0.95)' : 'rgba(150,172,215,0.72)', align: 'center', ls: 1 });
    });
    c.restore();
  }

  function tags(t) {
    const c = ctx;
    for (const tg of TAGS) {
      const a = env(t, tg.a, tg.b, 0.25, 0.25);
      if (a <= 0) continue;
      const [x, y] = ws(tg.at[0], tg.at[1]);
      const w = measure(c, tg.s, F.m30) + 28, h = 46;
      const lx = clamp(x + tg.off[0] - w / 2, STAGE.x0, STAGE.x1 - w), ly = clamp(y + tg.off[1] - h / 2, STAGE.y0, STAGE.y1 - h);
      c.save(); c.globalAlpha = a;
      const ex = clamp(x, lx, lx + w), ey = clamp(y, ly, ly + h);
      c.strokeStyle = rgba(tg.col, 0.65); c.lineWidth = 1.6; c.setLineDash([4, 5]);
      c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
      c.fillStyle = rgba(tg.col); c.beginPath(); c.arc(x, y, 3.5, 0, TAU); c.fill();
      roundRect(c, lx, ly, w, h, 10); c.fillStyle = 'rgba(4,8,22,0.86)'; c.fill();
      c.strokeStyle = rgba(tg.col, 0.55); c.lineWidth = 1.5; c.stroke();
      c.restore();
      txt(c, tg.s, lx + 14, ly + 32, { font: F.m30, color: rgba(tg.col.map((v) => Math.min(255, v + 30))), alpha: a });
    }
    // racer tags following the impulses (clamped to the frame with an arrow when off-screen)
    const racer = (s, pts, label, col, a, below) => {
      if (a <= 0) return;
      const q = G.at(P.route, s, pts); const [x, y] = ws(q.x, q.y);
      const inside = x > STAGE.x0 && x < STAGE.x1 && y > STAGE.y0 && y < STAGE.y1;
      const w = measure(c, label, F.m30b) + 24, h = 42;
      let lx, ly;
      c.save(); c.globalAlpha = a;
      if (inside) { lx = below ? x - 30 : label === 'C' ? x + 34 : x + 26; ly = below ? y + 190 : label === 'C' ? y - 8 : y - 64; }
      else {
        const cx = clamp(x, STAGE.x0 + 30, STAGE.x1 - 30), cy = clamp(y, STAGE.y0 + 30, STAGE.y1 - 30);
        const ang = Math.atan2(y - cy, x - cx);
        c.fillStyle = rgba(col); c.save(); c.translate(cx, cy); c.rotate(ang); c.beginPath(); c.moveTo(14, 0); c.lineTo(-6, -10); c.lineTo(-6, 10); c.closePath(); c.fill(); c.restore();
        lx = cx - Math.cos(ang) * 30 - w / 2; ly = cy - Math.sin(ang) * 30 - h / 2;
      }
      lx = clamp(lx, STAGE.x0, STAGE.x1 - w); ly = clamp(ly, STAGE.y0, STAGE.y1 - 12 - h);
      if (inside && below) { // dashed leader from the pulse (in the pulp) down to its qualifier label
        c.strokeStyle = rgba(col, 0.7); c.lineWidth = 1.6; c.setLineDash([4, 5]);
        c.beginPath(); c.moveTo(x, y); c.lineTo(clamp(x, lx + 16, lx + w - 16), ly); c.stroke(); c.setLineDash([]);
      }
      roundRect(c, lx, ly, w, h, 21); c.fillStyle = 'rgba(4,8,22,0.85)'; c.fill(); c.strokeStyle = rgba(col, 0.9); c.lineWidth = 2; c.stroke();
      c.restore();
      txt(c, label, lx + 12, ly + 30, { font: F.m30b, color: rgba(col), alpha: a, glow: 8 });
    };
    const ra = env(t, T.launch + 0.3, T.aCaud + 0.1, 0.3, 0.3);
    // C: long qualifier first (C endings fire only when the stimulus reaches the pulp proper), then a short tag;
    // hidden during the SHARP beat so it never covers the reticle.
    const rcLong = env(t, 3.72, 7.17, 0.25, 0.25);
    const hideC = Math.min(1, (1 - seg(t, T.aS1 - 0.4, T.aS1 - 0.1)) + seg(t, T.ff0, T.ff0 + 0.3));
    const rcShort = env(t, 7.12, T.cCaud + 0.1, 0.3, 0.3) * hideC;
    racer(sC(t), P.rC, 'C: fires only if pulp is reached', MG, rcLong, true);
    racer(sC(t), P.rC, 'C', MG, rcShort);
    racer(sA(t), P.rA, 'Aδ', CY, ra); // smooth position (the pulse dot itself hops node to node)
  }

  function insetCross(t) {
    const a = env(t, T.inset0, T.inset1, 0.35, 0.35);
    if (a <= 0) return;
    const c = ctx, cx = 776, cy = 1068, r = 150, S = r / 116;
    const [nx, ny] = ws(654, 1120);
    c.save(); c.globalAlpha = a;
    c.strokeStyle = rgba(CY, 0.5); c.lineWidth = 1.5; c.setLineDash([4, 5]);
    const ang = Math.atan2(ny - cy, nx - cx);
    c.beginPath(); c.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); c.lineTo(nx, ny); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fillStyle = 'rgba(4,8,22,0.94)'; c.fill();
    c.strokeStyle = rgba(CY, 0.7); c.lineWidth = 2; c.shadowColor = rgba(CY); c.shadowBlur = 12; c.stroke(); c.shadowBlur = 0;
    c.beginPath(); c.arc(cx, cy, r - 1, 0, TAU); c.clip();
    // medulla cross-section (dorsal = up)
    c.beginPath();
    c.moveTo(cx, cy - 48 * S); c.bezierCurveTo(cx + 40 * S, cy - 70 * S, cx + 82 * S, cy - 40 * S, cx + 74 * S, cy + 4 * S); c.bezierCurveTo(cx + 66 * S, cy + 50 * S, cx + 28 * S, cy + 66 * S, cx, cy + 60 * S);
    c.bezierCurveTo(cx - 28 * S, cy + 66 * S, cx - 66 * S, cy + 50 * S, cx - 74 * S, cy + 4 * S); c.bezierCurveTo(cx - 82 * S, cy - 40 * S, cx - 40 * S, cy - 70 * S, cx, cy - 48 * S); c.closePath();
    c.fillStyle = 'rgba(60,90,170,0.12)'; c.fill();
    c.strokeStyle = 'rgba(120,160,235,0.8)'; c.lineWidth = 2.2; c.stroke();
    c.setLineDash([7, 7]); c.strokeStyle = 'rgba(200,215,245,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx, cy + r); c.stroke(); c.setLineDash([]);
    // L / R (the reel shows the patient's left side; caudalis on the stimulated side)
    txt(c, 'L', cx - 124, cy + 52, { font: F.m30b, color: 'rgba(200,215,245,0.9)', align: 'center' });
    txt(c, 'R', cx + 124, cy + 52, { font: F.m30b, color: 'rgba(200,215,245,0.9)', align: 'center' });
    // caudalis region (dorsolateral) on the stimulated side
    c.beginPath(); c.ellipse(cx - 46 * S, cy - 18 * S, 16 * S, 26 * S, -0.5, 0, TAU); c.fillStyle = rgba(CY, 0.25); c.fill(); c.strokeStyle = rgba(CY, 0.9); c.lineWidth = 2.4; c.stroke();
    // crossing 2nd-order axon -> contralateral tract, then up to the thalamus
    const k = seg(t, T.cross0, T.cross1, ease.inOut);
    const x3 = cx + 36 * S, y3 = cy + 18 * S;
    const bz = (u) => { const x0 = cx - 46 * S, y0 = cy - 18 * S, x1 = cx - 30 * S, y1 = cy + 44 * S, x2 = cx + 24 * S, y2 = cy + 42 * S; const m = 1 - u; return [m * m * m * x0 + 3 * m * m * u * x1 + 3 * m * u * u * x2 + u * u * u * x3, m * m * m * y0 + 3 * m * m * u * y1 + 3 * m * u * u * y2 + u * u * u * y3]; };
    c.lineCap = 'round';
    c.beginPath(); for (let i = 0; i <= 30; i++) { const [x, y] = bz(i / 30); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = rgba(CY2, 0.25); c.lineWidth = 3; c.stroke();
    c.beginPath(); for (let i = 0; i <= 30 * k; i++) { const [x, y] = bz(i / 30); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = rgba(CY2, 0.95); c.lineWidth = 5; c.shadowColor = rgba(CY); c.shadowBlur = 14; c.stroke(); c.shadowBlur = 0;
    if (k > 0 && k < 1) { const [x, y] = bz(k); c.fillStyle = '#fff'; c.shadowColor = rgba(CY); c.shadowBlur = 18; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); c.shadowBlur = 0; }
    const ke = seg(t, T.cross1 - 0.05, T.cross1 + 0.3, ease.out);
    const yTop = cy - 66;
    c.strokeStyle = rgba(CY2, 0.25 + 0.7 * ke); c.lineWidth = 5; c.beginPath(); c.moveTo(x3, y3); c.lineTo(x3, lerp(y3, yTop, Math.max(0.02, ke))); c.stroke();
    c.fillStyle = rgba(CY2, 0.25 + 0.7 * ke); c.beginPath(); const ty = lerp(y3, yTop, Math.max(0.02, ke)); c.moveTo(x3, ty - 14); c.lineTo(x3 - 11, ty + 4); c.lineTo(x3 + 11, ty + 4); c.closePath(); c.fill();
    const lw2 = measure(c, 'to thalamus', F.m30) + 20;
    roundRect(c, cx + 8 - lw2 / 2, cy - 112, lw2, 40, 10); c.fillStyle = 'rgba(4,8,22,0.9)'; c.fill();
    txt(c, 'to thalamus', cx + 8, cy - 82, { font: F.m30, color: rgba(CY2), align: 'center', alpha: 0.4 + 0.6 * ke });
    c.restore();
    // label above: what caudalis is (and the hedge: the MAIN relay, not the only one)
    txt(ctx, 'caudalis: main pain relay', cx, cy - r - 20, { font: F.m30, color: rgba([150, 245, 255]), align: 'center', alpha: a, glow: 6 });
  }

  function insetConv(t) {
    const a = env(t, T.convLaunch, T.take + 0.05, 0.4, 0.35);
    if (a <= 0) return;
    const c = ctx, cx = 806, cy = 850, r = 175;
    const [nx, ny] = ws(654, 1120);
    c.save(); c.globalAlpha = a;
    const ang = Math.atan2(ny - cy, nx - cx);
    c.strokeStyle = rgba(VI, 0.6); c.lineWidth = 1.6; c.setLineDash([4, 5]);
    c.beginPath(); c.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); c.lineTo(nx, ny); c.stroke(); c.setLineDash([]);
    c.fillStyle = rgba(VI); c.beginPath(); c.arc(nx, ny, 4, 0, TAU); c.fill();
    c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fillStyle = 'rgba(4,8,22,0.94)'; c.fill();
    c.strokeStyle = rgba(VI, 0.8); c.lineWidth = 2; c.shadowColor = rgba(VI); c.shadowBlur = 14; c.stroke(); c.shadowBlur = 0;
    c.beginPath(); c.arc(cx, cy, r - 1, 0, TAU); c.clip();
    const sx = cx + 66, sy = cy + 6;
    const labels = ['tooth', 'tooth', 'skin', 'jaw'];
    const k = seg(t, T.convLaunch + 0.1, T.convArrive, ease.inOut);
    labels.forEach((lb, i) => {
      const yy = cy - 78 + i * 52, x0 = cx - 34;
      const bz = (u) => { const m = 1 - u; const x1 = x0 + 56, y1 = yy, x2 = sx - 52, y2 = sy, x3 = sx - 17, y3 = sy; return [m * m * m * x0 + 3 * m * m * u * x1 + 3 * m * u * u * x2 + u * u * u * x3, m * m * m * yy + 3 * m * m * u * y1 + 3 * m * u * u * y2 + u * u * u * y3]; };
      c.beginPath(); for (let j = 0; j <= 24; j++) { const [x, y] = bz(j / 24); j ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.strokeStyle = rgba(VI, 0.3); c.lineWidth = 2; c.stroke();
      c.beginPath(); for (let j = 0; j <= 24 * k; j++) { const [x, y] = bz(j / 24); j ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.strokeStyle = rgba(VI, 0.95); c.lineWidth = 3.2; c.shadowColor = rgba(VI); c.shadowBlur = 10; c.stroke(); c.shadowBlur = 0;
      c.fillStyle = rgba(VI, 0.9); c.beginPath(); c.arc(x0, yy, 4, 0, TAU); c.fill();
      txt(c, lb, x0 - 14, yy + 10, { font: F.m30, color: 'rgba(228,220,255,0.98)', align: 'right' });
    });
    const sg = seg(t, T.convArrive - 0.05, T.convArrive + 0.25);
    c.fillStyle = rgba(WH, 0.55 + 0.45 * sg); c.shadowColor = rgba(VI); c.shadowBlur = 20 + 24 * sg;
    c.beginPath(); c.arc(sx, sy, 17, 0, TAU); c.fill(); c.shadowBlur = 0;
    // single output axon (to thalamus)
    const ko = seg(t, T.convUp, T.convVPM);
    c.strokeStyle = rgba(VI, 0.3 + 0.65 * ko); c.lineWidth = 3.2; c.beginPath(); c.moveTo(sx + 6, sy - 16); c.lineTo(sx + 32, sy - 84); c.stroke();
    c.fillStyle = rgba(VI, 0.3 + 0.65 * ko); c.save(); c.translate(sx + 35, sy - 92); c.rotate(Math.atan2(-68, 26) + Math.PI / 2);
    c.beginPath(); c.moveTo(0, -4); c.lineTo(-10, 13); c.lineTo(10, 13); c.closePath(); c.fill(); c.restore();
    c.restore();
    // label clear of the ascending tract and the S1 node: two short lines above the circle, right of the tract
    txt(ctx, 'many inputs,', 690, cy - r - 58, { font: F.m30, color: 'rgba(228,220,255,0.98)', alpha: a, glow: 6 });
    txt(ctx, 'one neuron', 690, cy - r - 22, { font: F.m30, color: 'rgba(228,220,255,0.98)', alpha: a, glow: 6 });
  }

  function card(t, x, y, w, h, col, name, myel, speed, range, ms, prog, arrivedT, a) {
    const c = ctx;
    c.save(); c.globalAlpha = a;
    roundRect(c, x, y, w, h, 20); c.fillStyle = 'rgba(5,10,26,0.88)'; c.fill();
    c.strokeStyle = rgba(col, 0.75); c.lineWidth = 2; c.shadowColor = rgba(col); c.shadowBlur = 16; c.stroke(); c.shadowBlur = 0;
    c.restore();
    txt(c, name, x + 24, y + 62, { font: F.cardName, color: rgba(col), glow: 14, alpha: a });
    txt(c, myel, x + 30 + measure(c, name, F.cardName), y + 58, { font: F.m30, color: 'rgba(200,215,245,0.9)', alpha: a });
    // speed readout (a property of the fibre: shown at full value, mono numerals)
    const sv = String(speed);
    txt(c, sv, x + 24, y + 142, { font: F.cardNum, color: '#ffffff', alpha: a, glow: 10, glowColor: rgba(col, 0.8) });
    txt(c, 'm/s', x + 34 + measure(c, sv, F.cardNum), y + 142, { font: F.cardUnit, color: 'rgba(210,225,250,0.92)', alpha: a });
    // arrival clock
    txt(c, 'to brainstem', x + w - 22, y + 100, { font: F.m30, color: 'rgba(176,196,236,0.9)', align: 'right', alpha: a });
    const done = t >= arrivedT;
    txt(c, ms, x + w - 22, y + 142, { font: F.m40, color: done ? rgba(col) : '#ffffff', align: 'right', alpha: a, glow: done ? 10 : 0 });
    // progress track
    const tx0 = x + 24, tx1 = x + w - 24, ty = y + 170;
    c.save(); c.globalAlpha = a;
    c.strokeStyle = 'rgba(120,150,210,0.35)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx0, ty); c.lineTo(tx1, ty); c.stroke();
    const gx = lerp(tx0, tx1, ARR.sGang / L);
    c.fillStyle = 'rgba(150,175,225,0.7)'; c.fillRect(gx - 1, ty - 8, 2, 16); c.fillRect(tx1 - 1, ty - 8, 2, 16);
    c.strokeStyle = rgba(col); c.lineWidth = 4; c.shadowColor = rgba(col); c.shadowBlur = 10; c.beginPath(); c.moveTo(tx0, ty); c.lineTo(lerp(tx0, tx1, Math.max(0.004, prog)), ty); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(lerp(tx0, tx1, prog), ty, 5, 0, TAU); c.fill(); c.shadowBlur = 0;
    c.restore();
    txt(c, range, x + 24, y + 206, { font: F.m26, color: 'rgba(160,182,226,0.85)', alpha: a });
  }
  function cards(t) {
    const a = env(t, 3.7, T.take + 0.25, 0.45, 0.45);
    if (a <= 0) return;
    const m = msAt(t);
    const msA = Math.min(m, 10), msC = Math.min(m, 150);
    const fA = (msA < 10 ? msA.toFixed(1) : '10') + ' ms';
    const fC = (msC < 100 ? msC.toFixed(1) : msC.toFixed(0)) + ' ms';
    card(t, 64, 1352, 428, 216, CY, 'Aδ', 'myelinated', 15, 'typical ~5–30 m/s', fA, sA(t) / L, T.aCaud, a);
    card(t, 512, 1352, 428, 216, MG, 'C', 'unmyelinated', 1, 'typical ~0.5–2 m/s', fC, sC(t) / L, T.cCaud, a);
    // toy-model footnote on its own dark pill so line art never runs through it
    const fn = 'toy model: 15 cm nerve, typical speeds · clocks: periphery only', fw = measure(ctx, fn, F.m22) + 24;
    ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 56, 1314, fw, 32, 16); ctx.fillStyle = 'rgba(4,8,22,0.88)'; ctx.fill(); ctx.restore();
    txt(ctx, fn, 68, 1337, { font: F.m22, color: 'rgba(176,194,232,0.9)', alpha: a });
  }

  function pills(t) {
    const c = ctx;
    const slow = env(t, T.launch + 0.6, T.ff0, 0.3, 0.2), ff = env(t, T.ff0, T.cCaud + 0.35, 0.2, 0.35);
    const draw = (label, col, a) => {
      if (a <= 0) return null;
      const w = measure(c, label, F.m30, 2) + 56, h = 44, x = 940 - w, y = 1262;
      c.save(); c.globalAlpha = a;
      roundRect(c, x, y, w, h, 22); c.fillStyle = 'rgba(4,8,22,0.9)'; c.fill(); c.strokeStyle = rgba(col, 0.8); c.lineWidth = 1.8; c.stroke();
      c.fillStyle = rgba(col); c.beginPath(); c.arc(x + 24, y + 22, 6, 0, TAU); c.fill();
      c.restore();
      txt(c, label, x + 40, y + 32, { font: F.m30, color: 'rgba(235,245,255,0.95)', ls: 2, alpha: a });
      return x;
    };
    draw('SLOW-MO ×440', CY, slow);
    draw('SLOW-MO ~×15', MG, ff); // C catch-up: 27 -> 150 ms of model time over ~1.8 s = still ~15x slower than real time (average)
    // (the footnote states that the clocks time the peripheral nerve only; central relays are not timed)
  }

  function takeaway(t) {
    const c = ctx;
    const out = 1 - seg(t, T.dur - 0.45, T.dur - 0.15);
    const a0 = seg(t, T.take, T.take + 0.35) * out;
    if (a0 <= 0) return;
    txt(c, 'THE TAKEAWAY', 540, 452, { font: F.m30b, color: 'rgba(210,228,255,0.9)', align: 'center', ls: 8, alpha: a0 });
    const row = (y, t0, col, big, line1, line2) => {
      const a = seg(t, t0, t0 + 0.35, ease.out) * out;
      if (a <= 0) return;
      const dx = (1 - a) * -40;
      c.save(); c.globalAlpha = a;
      roundRect(c, 84 + dx, y, 876, 236, 28); c.fillStyle = 'rgba(4,8,22,0.82)'; c.fill();
      c.strokeStyle = rgba(col, 0.8); c.lineWidth = 2.2; c.shadowColor = rgba(col); c.shadowBlur = 24; c.stroke(); c.shadowBlur = 0;
      c.restore();
      txt(c, big, 196 + dx, y + 170, { font: F.big, color: rgba(col), align: 'center', alpha: a, glow: 34 });
      txt(c, line1, 330 + dx, y + 108, { font: fit(c, line1, capFont, 60, 600), color: '#ffffff', alpha: a });
      txt(c, line2, 332 + dx, y + 166, { font: F.m30, color: rgba(col.map((v) => Math.min(255, v + 40))), alpha: a });
    };
    row(612, T.take + 0.1, CY, 'Aδ', 'Sharp, well-localized', 'dentin stimuli: cold, air, probe');
    row(892, T.take + 0.35, MG, 'C', 'Dull, diffuse ache', 'likely the ache of pulpitis');
    const af0 = seg(t, T.take + 0.45, T.take + 0.8) * out;
    txt(c, 'inflammation also sensitizes A fibers · Närhi 1994', 522, 1104, { font: F.m22, color: 'rgba(196,180,232,0.85)', align: 'center', alpha: af0 });
    const a3 = seg(t, T.take + 0.6, T.take + 0.95, ease.out) * out;
    if (a3 > 0) {
      const dx = (1 - a3) * -40;
      c.save(); c.globalAlpha = a3;
      roundRect(c, 84 + dx, 1160, 876, 132, 28); c.fillStyle = 'rgba(4,8,22,0.82)'; c.fill();
      c.strokeStyle = rgba(VI, 0.55); c.lineWidth = 1.8; c.shadowColor = rgba(VI); c.shadowBlur = 16; c.stroke(); c.shadowBlur = 0;
      c.restore();
      txt(c, 'Convergence in caudalis', 522 + dx, 1214, { font: F.m34, color: 'rgba(226,216,255,0.98)', align: 'center', alpha: a3, glow: 4, glowColor: rgba(VI, 0.6) });
      txt(c, 'helps explain referred pain', 522 + dx, 1258, { font: F.m34, color: 'rgba(226,216,255,0.98)', align: 'center', alpha: a3, glow: 4, glowColor: rgba(VI, 0.6) });
    }
    const af = seg(t, T.take + 0.9, T.take + 1.3) * out;
    txt(c, 'Nair 1995 · Närhi 1992, 1994 · Jyväsjärvi 1987 · Mengel 1993', 512, 1500, { font: F.m22, color: 'rgba(160,182,226,0.8)', align: 'center', alpha: af });
    txt(c, 'Sessle 1986 (animal data) · Ploner 2002 · Basbaum 2009', 512, 1530, { font: F.m22, color: 'rgba(160,182,226,0.8)', align: 'center', alpha: af });
  }

  // ---------------- REEL ----------------
  window.REEL = {
    title: 'Pain pathway: tooth to brain (Neon Neuro)',
    duration: T.dur,
    poster: 2.2,
    canvas,
    fonts: ['700 118px "Space Grotesk"', '600 66px "Space Grotesk"', '500 34px "Space Grotesk"', '400 40px "Space Grotesk"',
      '700 150px Inter', '600 66px Inter', '500 34px Inter', '400 40px Inter',
      '400 22px "JetBrains Mono"', '500 30px "JetBrains Mono"', '700 30px "JetBrains Mono"'],
    setup,
    T, CAPS, TAGS, // exposed for timing checks
    render(t) {
      t = clamp(t, 0, T.dur);
      cam = camAt(t);
      const endK = seg(t, T.dur - 0.45, T.dur - 0.05);
      const dim = 1 - 0.4 * seg(t, T.take, T.take + 0.8) * (1 - endK);
      background(t, dim);
      world(t);
      composite();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // central relay: dim the main view while the midline inset plays (one moving thing at a time)
      const rd = 0.5 * (seg(t, T.dim0, T.dim0 + 0.3) - seg(t, T.dim1 - 0.3, T.dim1));
      if (rd > 0) { ctx.fillStyle = `rgba(2,4,10,${rd})`; ctx.fillRect(0, 0, W, H); }
      scrims(t);
      hud(t);
      hook(t);
      captions(t);
      tags(t);
      insetCross(t);
      insetConv(t);
      pills(t);
      cards(t);
      takeaway(t);
      chrome();
    },
  };
  Kit.boot(REEL);
})();
