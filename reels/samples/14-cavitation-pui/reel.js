/*
 * Sample 14 — Ultrasonic activation: acoustic streaming vs cavitation.
 * Style: simulated HIGH-SPEED CAMERA footage — backlit shadowgraph (bright field, dark silhouettes),
 * fixed-pattern sensor grain + illumination flicker, burned-in IBM Plex Mono HUD (frame counter, µs timestamp, fps, scale bar).
 *
 * "1,000,000 fps (simulated)": one footage frame = 1 µs, played back at 30 fps, so a 30 kHz file
 * completes one oscillation every 33.3 video frames (~1.1 s). Footage is quantised to whole frames.
 * During the ROI step-through each camera frame is held for 4 video frames (7.5 frames/s).
 * Lateral geometry ~1 px = 1 µm (file Ø150 µm, tip amplitude 25 / 75 µm); the axial mode shape and
 * canal taper are compressed ~3× (labelled on the scale bar). See NOTES.md for sources.
 */
(() => {
  'use strict';
  const { canvas, ctx: mainCtx } = Kit.createCanvas();
  let ctx = mainCtx; // swapped to the ROI canvas while the 3× inset is rendered
  const { W, H, clamp, lerp, seg, ease, rng, hash } = Kit;

  // ------------------------------------------------------------------ type & palette
  const MONO = '"IBM Plex Mono", "IBM Plex Sans", "DejaVu Sans Mono", monospace';
  const SANS = '"IBM Plex Sans", "DejaVu Sans", sans-serif';
  const font = (w, s, fam) => `${w} ${s}px ${fam || MONO}`;
  const INK = '#111111';
  const PAPER = 'rgba(244,244,240,0.95)';
  const LIGHT = '#f4f4f0';

  // ------------------------------------------------------------------ physics / geometry
  const F_KHZ = 30;
  const T_PER = 1000 / F_KHZ;             // frames (µs) per oscillation = 33.33
  const OMEGA = (2 * Math.PI) / T_PER;     // rad per frame
  const CX = 540;                          // canal axis
  const XF = 558;                          // file axis (slightly off-centre → near-wall approach on the right)
  const Y_TIP = 1080;
  const K_MODE = 1.04 / 300;               // free-end flexural mode, axially compressed (first node 300 px above tip)
  const Y_NODE = Y_TIP - 300;
  const Y_A2 = Y_TIP - 2.356 / K_MODE;     // second antinode (~y 400)
  const PH = { A: 0, B: 7 };              // oscillation phase offset per recording (frames)
  const AMP = { A: 25, B: 75 };            // tip displacement amplitude (µm ≈ px)
  const phi = (xi) => {
    if (xi <= 0) return 1;
    const x = K_MODE * xi;
    const w = ((Math.cos(x) - Math.sin(x) + Math.exp(-x)) / 2) * (1 - 0.25 * Math.min(1, xi / 700));
    return w * lerp(1, 0.55, clamp((xi - 300) / 250)); // stiffer-looking shank above the node (axis is compressed)
  };
  const hc = (y) => 290 - 0.085 * Math.min(y, 1700);            // canal inner half-width
  const hwBase = (y) => 75 + 0.01 * Math.max(0, Y_TIP - y);      // file half-width (size 15, .02 taper)
  const TIPLEN = 66;
  const hwF = (y) => { const xi = Y_TIP - y; if (xi <= 0) return 0; const b = hwBase(y); return xi < TIPLEN ? b * Math.pow(xi / TIPLEN, 0.62) : b; };
  const wallX = (y, side) => CX + side * hc(y);
  const APEX_Y = 1700;

  // ------------------------------------------------------------------ timeline (s)
  const DUR = 19.5;
  const FREEZE_F = 118;
  const SLOW = { f0: 84, f1: 94, hold: 4 / 30 };  // ROI step-through: camera frames 84…93, each held 4 video frames
  const HOOK_H = 384;
  const TL = {
    hook: [0, 2.42],
    flow: [0.5, 5.9],
    capA: [2.3, 5.75],
    track: [2.6, 5.8],
    legend: [2.9, 5.75],
    power: [5.62, 7.6],
    dip: [6.0, 6.45],
    cut: 6.22,
    recB: 6.4,
    capB: [7.35, 0],
    cloudL: 7.6,
    antiL: 8.0,
    roi: [8.85, 11.05],
  };
  TL.slow0 = TL.recB + SLOW.f0 / 30;                          // 9.20 s
  TL.slow1 = TL.slow0 + (SLOW.f1 - SLOW.f0) * SLOW.hold;      // 10.53 s
  TL.freeze = TL.slow1 + (FREEZE_F - SLOW.f1) / 30;           // 11.33 s
  TL.bern = [TL.freeze, TL.freeze + 4.6];
  TL.take = TL.bern[1];                                       // 15.93 s
  TL.capB[1] = TL.freeze;
  TL.loop = DUR - 0.35;                                       // takeaway → hook crossfade (loop seam)

  function footage(t) {
    if (t < TL.cut) return { rec: 'A', f: Math.floor(t * 30 + 1e-6) };
    if (t < TL.freeze) {
      if (t < TL.slow0) return { rec: 'B', f: Math.max(0, Math.floor((t - TL.recB) * 30 + 1e-6)) };
      if (t < TL.slow1) return { rec: 'B', f: SLOW.f0 + Math.floor((t - TL.slow0) / SLOW.hold + 1e-6), slow: true };
      return { rec: 'B', f: Math.min(FREEZE_F - 1, SLOW.f1 + Math.floor((t - TL.slow1) * 30 + 1e-6)) };
    }
    if (t < TL.take) return { rec: 'B', f: FREEZE_F, frozen: true };
    return { rec: 'A', f: Math.floor((t - DUR) * 30 + 1e-6) }; // pre-trigger frames −107…−1 → loops seamlessly into frame 0
  }
  const vis = (t, a, b, fi = 0.25, fo = 0.25) => Math.min(seg(t, a, a + fi, ease.out), 1 - seg(t, b - fo, b, ease.in));

  // ------------------------------------------------------------------ steady-streaming field (schematic)
  // Cellular stream function in the side view. Near the file the time-averaged flow runs from the antinodes
  // (tip, A2) toward the node (Boutsioukis et al. 2022), returns along the wall; beyond the tip it runs apically
  // along the axis. Cells carrying flow toward the apex are a little stronger (k) → slight apical preference.
  const CELLS = [
    { y1: -150, y2: Y_A2, s: 1, k: 0.85 },
    { y1: Y_A2, y2: Y_NODE, s: -1, k: 1.2 },
    { y1: Y_NODE, y2: Y_TIP, s: 1, k: 0.85 },
    { y1: Y_TIP, y2: 1650, s: -1, k: 1.2, below: true },
  ];
  const cellAt = (y) => { for (const c of CELLS) if (y >= c.y1 && y < c.y2) return c; return null; };
  function gapInfo(y, side, c) {
    const wall = wallX(y, side);
    const edge = c.below ? XF : XF + side * hwBase(y);
    return [edge, Math.abs(wall - edge)];
  }
  function psiAt(x, y, U) {
    const c = cellAt(y); if (!c) return 0;
    const side = x >= XF ? 1 : -1;
    const [edge, gap] = gapInfo(y, side, c);
    const xt = (side * (x - edge)) / gap; if (xt <= 0 || xt >= 1) return 0;
    const yt = (y - c.y1) / (c.y2 - c.y1);
    return side * c.s * c.k * U * gap / Math.PI * Math.sin(Math.PI * xt) * Math.sin(Math.PI * yt);
  }
  function vel(x, y, U) {
    const h = 1.5;
    return [(psiAt(x, y + h, U) - psiAt(x, y - h, U)) / (2 * h), -(psiAt(x + h, y, U) - psiAt(x - h, y, U)) / (2 * h)];
  }

  // ------------------------------------------------------------------ precomputed assets
  const NP = 190, NPO = 44;
  let PLATE, SPR = {}, GRAIN = [], SIM = {}, META = [], TRACK = [], TRACK2 = [], STREAMS = [], EVENTS = [], CLOUD = [];
  let ROI_CANVAS, ROI_CTX, ROI_EVENT;

  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

  function outline() {
    // canal outline with outward normals: left wall ↓, apical arc, right wall ↑
    const pts = [];
    const wob = (y, s) => Kit.noise1(y / 37, s) * 1.4 + Kit.noise1(y / 9, s + 3) * 0.5;
    for (let y = -60; y <= APEX_Y; y += 8) pts.push([CX - hc(y) + wob(y, 11), y, -1, 0]);
    const r = hc(APEX_Y);
    for (let k = 1; k < 40; k++) { const a = Math.PI - (k / 40) * Math.PI; pts.push([CX + r * Math.cos(a), APEX_Y + r * Math.sin(a), Math.cos(a), Math.sin(a)]); }
    for (let y = APEX_Y; y >= -60; y -= 8) pts.push([CX + hc(y) + wob(y, 23), y, 1, 0]);
    return pts;
  }
  function pathOffset(g, pts, off, close) {
    g.beginPath();
    pts.forEach((p, i) => { const x = p[0] + p[2] * off, y = p[1] + p[3] * off; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }

  function buildPlate() {
    const [c, g] = mk(W, H);
    let gr = g.createRadialGradient(540, 860, 40, 540, 920, 1280);
    gr.addColorStop(0, '#f0f0eb'); gr.addColorStop(0.5, '#e3e3dd'); gr.addColorStop(0.82, '#c6c6c0'); gr.addColorStop(1, '#93938e');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // low-frequency mottling of the transparent model block / illumination
    const sw = 108, sh = 192; const [sc, sg] = mk(sw, sh); const id = sg.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const n = Kit.noise2(x / 10, y / 10, 7) * 0.6 + Kit.noise2(x / 3.2, y / 3.2, 8) * 0.4;
      const v = 128 + n * 46, i = (y * sw + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    sg.putImageData(id, 0, 0);
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.2; g.drawImage(sc, 0, 0, W, H); g.restore();
    // canal lumen (liquid) a touch brighter than the block
    const pts = outline();
    pathOffset(g, pts, 0, true); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fill();
    // wall: refraction shadow band outside, crisp edge, bright inner fringe
    g.save(); g.filter = 'blur(10px)'; g.strokeStyle = 'rgba(22,22,22,0.62)'; g.lineWidth = 30; pathOffset(g, pts, 17); g.stroke(); g.restore();
    g.save(); g.filter = 'blur(3px)'; g.strokeStyle = 'rgba(20,20,20,0.85)'; g.lineWidth = 12; pathOffset(g, pts, 6); g.stroke(); g.restore();
    g.save(); g.filter = 'blur(0.8px)'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; pathOffset(g, pts, 1); g.stroke(); g.restore();
    g.save(); g.filter = 'blur(1.2px)'; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2.5; pathOffset(g, pts, -5); g.stroke(); g.restore();
    // a few out-of-focus dust motes on the optics + one fibre (fixed in frame — authentic camera dirt)
    const R = rng(77);
    const motes = [[170, 620, 13], [905, 410, 9], [880, 1460, 15], [230, 1520, 8], [960, 760, 6], [110, 980, 7]];
    for (const [x, y, r] of motes) {
      const m = g.createRadialGradient(x, y, 0, x, y, r * 2);
      m.addColorStop(0, `rgba(30,30,30,${0.18 + R() * 0.12})`); m.addColorStop(0.55, 'rgba(30,30,30,0.10)'); m.addColorStop(1, 'rgba(30,30,30,0)');
      g.fillStyle = m; g.beginPath(); g.arc(x, y, r * 2, 0, 7); g.fill();
    }
    g.save(); g.filter = 'blur(2px)'; g.strokeStyle = 'rgba(40,40,40,0.22)'; g.lineWidth = 3; g.beginPath();
    g.moveTo(40, 1690); g.bezierCurveTo(120, 1650, 150, 1760, 250, 1720); g.stroke(); g.restore();
    // extra vignette
    gr = g.createRadialGradient(540, 960, 700, 540, 960, 1250);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.22)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return c;
  }

  function buildSprites() {
    // shadowgraph bubble: thick dark ring, bright focal spot, faint bright diffraction halo
    let [c, g] = mk(240, 240);
    let gr = g.createRadialGradient(120, 120, 92, 120, 120, 118);
    gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(120, 120, 118, 0, 7); g.fill();
    gr = g.createRadialGradient(120, 120, 0, 120, 120, 100);
    gr.addColorStop(0, '#f4f4f0'); gr.addColorStop(0.12, '#d6d6d2'); gr.addColorStop(0.24, '#707070'); gr.addColorStop(0.38, '#262626');
    gr.addColorStop(0.9, '#131313'); gr.addColorStop(0.97, '#202020'); gr.addColorStop(1, '#3a3a3a');
    g.fillStyle = gr; g.beginPath(); g.arc(120, 120, 100, 0, 7); g.fill();
    SPR.bub = c;
    // in-focus tracer (hollow glass sphere): dark disc with bright centre
    [c, g] = mk(64, 64);
    gr = g.createRadialGradient(31, 31, 0, 32, 32, 26);
    gr.addColorStop(0, '#c8c8c4'); gr.addColorStop(0.22, '#8a8a88'); gr.addColorStop(0.42, '#2a2a2a'); gr.addColorStop(0.82, '#1c1c1c'); gr.addColorStop(1, 'rgba(28,28,28,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.fill();
    SPR.dot = c;
    // out-of-focus tracer: soft grey disc with lighter core
    [c, g] = mk(96, 96);
    gr = g.createRadialGradient(48, 48, 0, 48, 48, 44);
    gr.addColorStop(0, 'rgba(60,60,60,0.10)'); gr.addColorStop(0.55, 'rgba(40,40,40,0.24)'); gr.addColorStop(0.8, 'rgba(30,30,30,0.32)'); gr.addColorStop(1, 'rgba(30,30,30,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill();
    SPR.blur = c;
  }

  function buildGrain() {
    // film-grain specks: dark and light grains with alpha ∝ |n| (reads on a bright backlit field, unlike overlay)
    for (let k = 0; k < 1; k++) {
      const [c, g] = mk(256, 256); const id = g.createImageData(256, 256); const R = rng(900 + k);
      for (let i = 0; i < 256 * 256; i++) {
        const n = (R() + R() + R() - 1.5) * 2;
        const v = n < 0 ? 12 : 250;
        id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = clamp(Math.abs(n) * (n < 0 ? 150 : 110), 0, 255);
      }
      g.putImageData(id, 0, 0);
      GRAIN.push(mainCtx.createPattern(c, 'repeat'));
    }
  }

  function simulate(seed, f0, f1, U) {
    const R = rng(seed), n = NP + NPO, nf = f1 - f0 + 1;
    const pos = new Float32Array(nf * n * 2), P = [];
    for (let i = 0; i < n; i++) {
      let x = CX, y = 600;
      for (let k = 0; k < 400; k++) {
        y = -30 + R() * 1690; x = CX + (R() * 2 - 1) * hc(y) * 0.93;
        if (y < Y_TIP + 10 && Math.abs(x - XF) < hwBase(y) + 12) continue;
        if (y > 1640) continue;
        break;
      }
      P.push([x, y]);
    }
    for (let fi = 0; fi < nf; fi++) {
      for (let i = 0; i < n; i++) { pos[(fi * n + i) * 2] = P[i][0]; pos[(fi * n + i) * 2 + 1] = P[i][1]; }
      for (let i = 0; i < n; i++) {
        let [x, y] = P[i];
        for (let s = 0; s < 2; s++) { const dt = 0.5; const [u1, v1] = vel(x, y, U); const [u2, v2] = vel(x + u1 * dt / 2, y + v1 * dt / 2, U); x += u2 * dt; y += v2 * dt; }
        P[i][0] = x; P[i][1] = y;
      }
    }
    return { f0, nf, n, pos };
  }
  function simPos(rec, f, i) {
    const S = SIM[rec]; const fi = clamp(f - S.f0, 0, S.nf - 1); const k = (fi * S.n + i) * 2;
    return [S.pos[k], S.pos[k + 1]];
  }
  // oscillatory (30 kHz) displacement of the liquid near the file, decaying away from it
  function oscDx(x, y, amp, sinv) {
    if (y < Y_TIP) {
      const d = Math.abs(x - XF) - hwBase(y);
      return amp * phi(Y_TIP - y) * sinv * Math.exp(-Math.max(0, d) / 46);
    }
    const d = Math.hypot(x - XF, y - Y_TIP);
    return amp * sinv * Math.exp(-d / 52);
  }

  function buildStreamlines() {
    const out = [];
    for (const c of CELLS) for (const side of [-1, 1]) for (const lam of [0.2, 0.5, 0.8]) {
      const pts = [];
      for (let k = 0; k < 80; k++) {
        const a = (k / 80) * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
        let lo = 0, hi = 0.5 / Math.max(Math.abs(ca), Math.abs(sa));
        for (let it = 0; it < 28; it++) { const m = (lo + hi) / 2; const v = Math.cos(Math.PI * m * ca) * Math.cos(Math.PI * m * sa); if (v > lam) lo = m; else hi = m; }
        const xt = 0.5 + lo * ca, yt = 0.5 + lo * sa;
        const y = c.y1 + yt * (c.y2 - c.y1);
        const [edge, gap] = gapInfo(y, side, c);
        pts.push([edge + side * xt * gap, y]);
      }
      // flow direction relative to point order
      const [x0, y0] = pts[10], [x1, y1] = pts[11];
      const [u, v] = vel(x0, y0, 1);
      out.push({ pts, dir: Math.sign(u * (x1 - x0) + v * (y1 - y0)) || 1, lam, k: c.k });
    }
    return out;
  }

  function genEvents() {
    const R = rng(14014), E = []; const T = T_PER, A = AMP.B;
    const xFileAt = (y, tau) => XF + A * phi(Y_TIP - y) * Math.sin(OMEGA * (tau + PH.B));
    let id = 0;
    for (let n = -1; n <= 5; n++) {
      const base = n * T - PH.B;                 // file passes centre moving right
      for (const side of [1, -1]) {
        const open0 = base + (side > 0 ? T / 4 : (3 * T) / 4); // file at extreme toward `side` → that gap starts opening
        const openMax = open0 + T / 2;
        const big = side > 0;
        // wall-attached bubble near the tip (narrow gap, file swings close to the wall); the right-wall site recurs
        const yw = R();
        E.push({ id: id++, type: 'wall', main: true, n, side, y: big ? Y_TIP - 40 + (yw - 0.5) * 8 : Y_TIP - 24 - yw * 44, Rmax: big ? 32 + R() * 8 : 21 + R() * 7, tNuc: open0 + 1.2 + R() * 1.2, tMax: openMax + R() * 0.5, col: 5.2 + R() * 0.8, after: 13 });
        if (R() < (big ? 0.95 : 0.55)) E.push({ id: id++, type: 'wall', side, y: Y_TIP - 170 - R() * 90, Rmax: 14 + R() * 8, tNuc: open0 + 2.5 + R() * 2, tMax: openMax - 0.5 + R(), col: 4.4, after: 10 });
        // tip cloud: microbubbles in the wake of the receding tip — soft, longer-lived (Macedo 2014: no SCL from the cloud)
        for (let k = 0; k < 26; k++) {
          const tN = open0 + 0.5 + R() * 4.5;
          const u = R(), yy = Y_TIP - 70 + u * u * 150;   // denser just beside/below the tip
          const xt = XF + A * Math.sin(OMEGA * (tN + PH.B));
          const hwl = yy < Y_TIP ? hwF(yy) : 0;
          const xx = xt + side * (hwl + 5 + Math.pow(R(), 1.6) * 34) + (yy > Y_TIP ? (R() - 0.5) * 36 : 0);
          E.push({ id: id++, type: 'free', cloud: true, x: xx, y: yy, Rmax: 5 + R() * 12, tNuc: tN, tMax: openMax - 1 + R() * 1.2, col: 4.5 + R() * 2.5, after: 5 });
        }
        // second antinode: moves opposite to the tip → the gap on −side opens there; crisp, violent collapses (SCL source)
        for (let k = 0; k < 3; k++) {
          const tN = open0 + 1 + R() * 3, yy = Y_A2 + (R() - 0.5) * 110, s2 = -side;
          const xa = xFileAt(yy, tN);
          E.push({ id: id++, type: 'free', anti: true, x: xa + s2 * (hwBase(yy) + 6 + R() * 16), y: yy, Rmax: 12 + R() * 11, tNuc: tN, tMax: openMax - 0.5 + R(), col: 1.8 + R() * 0.6, after: 4 });
        }
      }
    }
    for (const e of E) { e.tCol = e.tMax + e.col; e.tEnd = e.tCol + e.after; }
    return E;
  }

  // ------------------------------------------------------------------ drawing: footage
  function drawParticles(rec, f, amp, sinv) {
    const n = NP + NPO;
    for (let i = NP; i < n; i++) { // out of focus first (other depth planes)
      const [x, y] = simPos(rec, f, i); const m = META[i];
      const dx = oscDx(x, y, amp, sinv) * 0.6;
      ctx.globalAlpha = m.a; const r = m.r;
      ctx.drawImage(SPR.blur, x + dx - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    const big = rec === 'A' && TRACK.length ? TRACK[0].i : -1;
    for (let i = 0; i < NP; i++) {
      if (rec === 'B' && hash(i, 55) < 0.4) continue;
      const [x, y] = simPos(rec, f, i); const m = META[i];
      const dx = oscDx(x, y, amp, sinv); const r = m.r * (i === big ? 1.4 : 1);
      ctx.drawImage(SPR.dot, x + dx - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
    }
  }

  function drawFile(amp, sinv, alpha = 1, ghost = false) {
    const fl = (y, off) => { const xi = Y_TIP - y; const depth = 7 * clamp((xi - 40) / 60); const s = ((y / 58 + off) % 1 + 1) % 1; return depth * (s < 0.72 ? s / 0.72 : (1 - s) / 0.28); };
    const pts = [];
    for (let y = -40; y < Y_TIP; y += 4) { const xc = XF + amp * phi(Y_TIP - y) * sinv; pts.push([xc + hwF(y) - fl(y, 0), y]); }
    pts.push([XF + amp * sinv, Y_TIP]);
    for (let y = Y_TIP - 4; y >= -40; y -= 4) { const xc = XF + amp * phi(Y_TIP - y) * sinv; pts.push([xc - hwF(y) + fl(y, 0.5), y]); }
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (!ghost) { ctx.strokeStyle = 'rgba(255,255,255,0.38)'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.stroke(); }
    ctx.fillStyle = ghost ? '#2a2a2a' : '#121212'; ctx.fill();
    if (!ghost) { ctx.strokeStyle = 'rgba(70,70,70,0.9)'; ctx.lineWidth = 1.4; ctx.stroke(); }
    ctx.restore();
  }

  function roundBubble(x, y, r, a = 1) {
    if (r < 0.7) return;
    const g0 = ctx.globalAlpha; ctx.globalAlpha = g0 * a; // relative to the current alpha (panels fade correctly)
    if (r < 3.2) { ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    else ctx.drawImage(SPR.bub, x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
    ctx.globalAlpha = g0;
  }
  function dentedPath(x, y, r, side, dent) {
    const far = side > 0 ? Math.PI : 0; // side facing away from the wall
    ctx.beginPath();
    for (let k = 0; k <= 56; k++) {
      const a = (k / 56) * 2 * Math.PI; const c = Math.max(0, Math.cos(a - far));
      const rr = r * Math.max(0.1, 1 - dent * Math.pow(c, 2.4));
      const px = x + rr * Math.cos(a), py = y + rr * Math.sin(a) * (1 + 0.1 * dent);
      if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  function drawWallBubble(e, f) {
    if (f < e.tNuc || f > e.tEnd) return;
    const side = e.side, xw = wallX(e.y, side) - side * 1.5;
    if (f <= e.tMax) {
      const s = (f - e.tNuc) / (e.tMax - e.tNuc); const r = e.Rmax * Math.pow(Math.sin((Math.PI / 2) * s), 0.55);
      roundBubble(xw - side * (r + 3), e.y, r); return;
    }
    if (f < e.tCol) { // asymmetric collapse next to the wall: flatten → involute → re-entrant micro-jet toward the wall
      const c = (f - e.tMax) / (e.tCol - e.tMax);
      const r = e.Rmax * (1 - 0.7 * Math.pow(c, 1.3));
      const dent = 1.55 * ease.smooth(clamp((c - 0.15) / 0.65));
      const x = xw - side * (r * (1 - 0.2 * dent) + 2);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 5;
      ctx.fillStyle = '#151515'; dentedPath(x, e.y, r, side, dent); ctx.fill(); ctx.restore();
      if (dent < 0.9 && r > 6) { ctx.fillStyle = `rgba(230,230,226,${0.85 - dent})`; ctx.beginPath(); ctx.ellipse(x + side * r * 0.12 * dent, e.y - r * 0.05, r * 0.16, r * 0.2, 0, 0, 7); ctx.fill(); }
      if (c > 0.42) { // jet: forms in the dent, crosses the bubble interior toward the wall (bright column in shadowgraph)
        const k = (c - 0.42) / 0.58;
        const xs = x - side * r * Math.max(0.1, 1 - dent) * 0.95;
        const xe = lerp(xs, xw, 0.2 + 0.8 * k);
        ctx.save(); dentedPath(x, e.y, r * 1.02, side, dent); ctx.clip();
        ctx.strokeStyle = 'rgba(236,236,232,0.95)'; ctx.fillStyle = 'rgba(236,236,232,0.95)'; ctx.lineCap = 'round';
        const lw = Math.max(1.1, r * 0.075);
        const ah = lw * 1.9; // small arrowhead pointing at the wall
        ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(xs, e.y); ctx.lineTo(xe - side * ah * 1.5, e.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xe, e.y); ctx.lineTo(xe - side * ah * 2.2, e.y - ah); ctx.lineTo(xe - side * ah * 2.2, e.y + ah); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      return;
    }
    // aftermath: jet impact spreads along the wall (wall jet), toroidal remnant, fragments swept along the wall
    const k = (f - e.tCol) / (e.tEnd - e.tCol);
    const r0 = e.Rmax * 0.3;
    if (k < 0.45) {
      const a = 1 - k / 0.45, spread = 6 + 70 * k;
      ctx.globalAlpha = a; ctx.strokeStyle = '#121212'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(xw - side * 3, e.y - 3); ctx.lineTo(xw - side * 3, e.y - spread); ctx.moveTo(xw - side * 3, e.y + 3); ctx.lineTo(xw - side * 3, e.y + spread); ctx.stroke();
      ctx.globalAlpha = 1;
      roundBubble(xw - side * r0 * 0.9, e.y - r0 * (0.9 + k), r0 * 0.7 * (1 - k), 1);
      roundBubble(xw - side * r0 * 0.9, e.y + r0 * (0.9 + k), r0 * 0.7 * (1 - k), 1);
    }
    for (let j = 0; j < 8; j++) {
      const h1 = hash(e.id, j, 1), h2 = hash(e.id, j, 2), h3 = hash(e.id, j, 3);
      const yy = e.y + (h1 - 0.5) * (14 + 120 * k * (0.5 + h2));
      const xx = xw - side * (3 + h2 * 9 + 6 * k);
      roundBubble(xx, yy, (1.6 + 3.6 * h3) * (1 - 0.85 * k), 1 - k * k);
    }
    // shock front: visible in a single frame (it crosses the field of view in ~1 µs)
    if (f === Math.ceil(e.tCol) && e.main) {
      const rr = 130 + hash(e.id, 9) * 40;
      ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(25,25,25,0.42)'; ctx.beginPath(); ctx.arc(xw - side * 6, e.y, rr, 0, 7); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(xw - side * 6, e.y, rr - 3, 0, 7); ctx.stroke();
    }
  }
  function bubbleR(e, f) {
    if (f < e.tNuc || f > e.tEnd) return 0;
    if (f <= e.tMax) return e.Rmax * Math.pow(Math.sin((Math.PI / 2) * (f - e.tNuc) / (e.tMax - e.tNuc)), 0.55);
    if (f < e.tCol) { const c = (f - e.tMax) / (e.tCol - e.tMax); return e.Rmax * Math.pow(1 - c, e.cloud ? 0.85 : 0.5); }
    const k = (f - e.tCol) / (e.tEnd - e.tCol);
    if (e.cloud) return e.Rmax * 0.25 * (1 - k);
    return e.Rmax * 0.36 * Math.max(0, Math.sin(Math.PI * Math.min(1, k * 1.3))); // rebound after a violent collapse
  }
  function drawFreeBubble(e, f) {
    const r = bubbleR(e, f);
    if (r > 0) roundBubble(e.x, e.y, r, e.cloud ? 0.72 : 1);
    if (e.anti && e.Rmax > 16 && f === Math.ceil(e.tCol)) { // faint one-frame pressure ring from the antinode collapse
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(25,25,25,0.3)'; ctx.beginPath(); ctx.arc(e.x, e.y, e.Rmax * 3, 0, 7); ctx.stroke();
    }
  }
  function cloudHaze(e, f) { // unresolved micro-bubbles around the cloud: soft dark haze
    if (f < e.tNuc || f > e.tCol) return;
    const g = f <= e.tMax ? Math.sin((Math.PI / 2) * (f - e.tNuc) / (e.tMax - e.tNuc)) : 1 - (f - e.tMax) / (e.tCol - e.tMax);
    const r = e.Rmax * 3.4 * (0.4 + 0.6 * g);
    ctx.globalAlpha = 0.46 * g; ctx.drawImage(SPR.blur, e.x - r, e.y - r, r * 2, r * 2); ctx.globalAlpha = 1;
  }
  function drawBubbles(f) {
    for (const e of CLOUD) cloudHaze(e, f);
    for (const e of EVENTS) if (e.type === 'free') drawFreeBubble(e, f);
    for (const e of EVENTS) if (e.type === 'wall') drawWallBubble(e, f);
  }
  // radius-weighted centroid of the active tip-cloud bubbles, smoothed over f−3…f+3
  function cloudCentroid(f) {
    let sx = 0, sy = 0, sa = 0, sr = 0;
    for (let d = -3; d <= 3; d++) for (const e of CLOUD) {
      const ff = f + d; if (ff < e.tNuc || ff > e.tCol) continue;
      const r = bubbleR(e, ff), w = r * r; sx += w * e.x; sy += w * e.y; sa += w; sr += r;
    }
    return sa > 0 ? [sx / sa, sy / sa, sr / 7] : null; // area-weighted position; mean summed radius for the fade
  }

  function drawGrain(seed) {
    // fixed-pattern sensor noise (as on CMOS high-speed cameras): visible on the bright field and cheap to encode.
    // Frame-to-frame life comes from the per-frame illumination flicker. A re-seeded temporal grain was tested and
    // dropped: even at 1–2 grey levels it took the MP4 from ~11 to 14–37 MB and would not survive Instagram's re-encode.
    const p = GRAIN[0];
    p.setTransform(new DOMMatrix().scale(2.2));
    ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = p; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  
  function drawFootage(rec, f, amp, sinv, grain = true) {
    ctx.drawImage(PLATE, 0, 0);
    const fl = (hash(f + 3000, rec === 'A' ? 1 : 2) - 0.5) * 0.028;
    ctx.fillStyle = fl > 0 ? `rgba(255,255,255,${fl})` : `rgba(0,0,0,${-fl})`; ctx.fillRect(0, 0, W, H);
    drawParticles(rec, f, amp, sinv);
    if (rec === 'B') drawBubbles(f);
    drawFile(amp, sinv);
    if (grain) drawGrain(0);
  }

  // ------------------------------------------------------------------ drawing: overlays / typography
  function txt(s, x, y, o = {}) {
    ctx.font = o.font || font(500, 30); ctx.fillStyle = o.color || INK;
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
    if (o.max) { const w = ctx.measureText(s).width; if (w > o.max) console.warn(`text overflow (${Math.round(w)} > ${o.max}): ${s}`); }
    ctx.fillText(s, x, y);
    return ctx.measureText(s).width;
  }
  function chip(s, x, y, o = {}) {
    const size = o.size || 30, pad = o.pad || 12;
    ctx.font = font(o.weight || 500, size);
    const w = ctx.measureText(s).width + pad * 2, h = Math.round(size * 1.45);
    const X = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    ctx.fillStyle = o.bg || INK; ctx.fillRect(X, y, w, h);
    ctx.fillStyle = o.fg || LIGHT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(s, X + pad, y + h / 2 + 1);
    return { x: X, y, w, h };
  }
  function panel(x, y, w, h) {
    ctx.fillStyle = PAPER; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    // registration ticks
    ctx.fillStyle = INK;
    for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      ctx.fillRect(px - (sx < 0 ? 18 : 0), py - (sy < 0 ? 5 : 0), 18, 5); ctx.fillRect(px - (sx < 0 ? 5 : 0), py - (sy < 0 ? 18 : 0), 5, 18);
    }
  }
  function upArrow(x, y, s, color) { // drawn glyph (font-independent)
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y - s * 0.5); ctx.lineTo(x + s * 0.42, y); ctx.lineTo(x + s * 0.15, y); ctx.lineTo(x + s * 0.15, y + s * 0.5);
    ctx.lineTo(x - s * 0.15, y + s * 0.5); ctx.lineTo(x - s * 0.15, y); ctx.lineTo(x - s * 0.42, y); ctx.closePath(); ctx.fill();
  }
  function leader(x0, y0, x1, y1, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.arc(x1, y1, 6, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }
  function label(lines, x, y, ax, ay, a, anchorSide = 'left') {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const size = 30, pad = 12; ctx.font = font(500, size);
    const w = Math.max(...lines.map((s) => ctx.measureText(s).width)) + pad * 2, lh = 38, h = lines.length * lh + 12;
    const lx = anchorSide === 'left' ? x : x + w, ly = y + h / 2;
    leader(lx, ly, ax, ay, 1);
    ctx.fillStyle = INK; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = LIGHT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    lines.forEach((s, i) => ctx.fillText(s, x + pad, y + 6 + lh * (i + 0.5) + 1));
    ctx.restore();
  }

  function drawStreamlines(t, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(17,17,17,0.62)'; ctx.setLineDash([13, 11]);
    for (const s of STREAMS) {
      ctx.lineDashOffset = -s.dir * s.k * t * 34;
      ctx.beginPath(); s.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke();
    }
    ctx.setLineDash([]);
    // chevrons on the middle contour of each cell
    ctx.fillStyle = 'rgba(17,17,17,0.85)';
    for (const s of STREAMS) {
      if (s.lam !== 0.5) continue;
      for (const k0 of [20, 60]) {
        const p = s.pts[k0], q = s.pts[(k0 + s.dir + 80) % 80];
        if (p[1] < 340 || p[1] > 1560) continue;
        const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
        ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-7, -8); ctx.lineTo(-3, 0); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawTracking(rec, f, amp, a, list, trail = 60) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    for (const tr of list) {
      // trail: last 60 frames (oscillation + slow drift)
      ctx.strokeStyle = 'rgba(17,17,17,0.9)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
      for (let k = trail; k >= 0; k--) {
        const ff = f - k; const [x, y] = simPos(rec, ff, tr.i);
        const dx = oscDx(x, y, amp, Math.sin(OMEGA * (ff + PH[rec])));
        if (k === trail) ctx.moveTo(x + dx, y); else ctx.lineTo(x + dx, y);
      }
      ctx.stroke();
      const [x, y] = simPos(rec, f, tr.i); const X = x + oscDx(x, y, amp, Math.sin(OMEGA * (f + PH[rec])));
      tr.cur = [X, y];
      const s = 26, L = 10; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.moveTo(X + sx * s, y + sy * (s - L)); ctx.lineTo(X + sx * s, y + sy * s); ctx.lineTo(X + sx * (s - L), y + sy * s); }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHUD(t, fs, a = 1) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(244,244,240,0.86)'; ctx.fillRect(52, 236, 976, 92);
    ctx.fillStyle = INK; ctx.fillRect(52, 236, 976, 3); ctx.fillRect(52, 325, 976, 3);
    const y1 = 270, y2 = 308;
    if (fs.frozen) {
      ctx.fillStyle = INK; ctx.fillRect(68, y1 - 13, 8, 24); ctx.fillRect(82, y1 - 13, 8, 24);
      txt('PAUSED · ANALYSIS', 104, y1, { font: font(600, 30), base: 'middle' });
    } else if (fs.slow) {
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(70, y1 - 13); ctx.lineTo(90, y1); ctx.lineTo(70, y1 + 13); ctx.closePath(); ctx.fill();
      txt('STEP · 1 µs/frame', 104, y1, { font: font(600, 30), base: 'middle' });
    } else {
      ctx.fillStyle = '#c21d1d'; ctx.beginPath(); ctx.arc(80, y1, 10, 0, 7); ctx.fill();
      let x = 102 + txt(`REC ${fs.rec}`, 102, y1, { font: font(600, 30), base: 'middle' }) + 16;
      const nOn = fs.rec === 'A' ? 2 : 5;
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.setLineDash([]);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = INK; if (k < nOn) ctx.fillRect(x + k * 15, y1 - 12, 10, 24); else ctx.strokeRect(x + k * 15 + 1, y1 - 11, 8, 22); }
      x += 6 * 15 + 10;
      txt(fs.rec === 'A' ? 'LOW' : 'HIGH', x, y1, { font: font(600, 30), base: 'middle' });
    }
    txt('1,000,000 fps (simulated)', 1012, y1, { font: font(500, 30), align: 'right', base: 'middle' });
    const sgn = fs.f < 0 ? '−' : '';
    txt(`FRAME ${sgn}${String(Math.abs(fs.f)).padStart(4, '0')}`, 68, y2, { font: font(400, 30), base: 'middle' });
    txt(`t = ${sgn}${String(Math.abs(fs.f)).padStart(3, '0')} µs`, 1012, y2, { font: font(400, 30), align: 'right', base: 'middle' });
    txt('@natebrooksendo', 540, y2, { font: font(400, 24), align: 'center', base: 'middle', color: '#555' });
    ctx.restore();
    // viewfinder corner brackets (decorative)
    ctx.fillStyle = 'rgba(17,17,17,0.8)';
    for (const [x, y, sx, sy] of [[28, 206, 1, 1], [1052, 206, -1, 1], [28, 1650, 1, -1], [1052, 1650, -1, -1]]) {
      ctx.fillRect(x - (sx < 0 ? 46 : 0), y - (sy < 0 ? 4 : 0), 46, 4); ctx.fillRect(x - (sx < 0 ? 4 : 0), y - (sy < 0 ? 46 : 0), 4, 46);
    }
  }

  function drawScaleBar(a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const x0 = 92, y = 1140;
    ctx.fillStyle = 'rgba(244,244,240,0.72)'; ctx.fillRect(72, 1078, 232, 166);
    txt('100 µm', x0 + 50, 1116, { font: font(600, 30), align: 'center' });
    ctx.fillStyle = INK; ctx.fillRect(x0, y - 3, 100, 6); ctx.fillRect(x0, y - 11, 4, 22); ctx.fillRect(x0 + 96, y - 11, 4, 22);
    txt('(lateral)', 82, 1180, { font: font(400, 22), color: '#222' });
    txt('axial compressed', 82, 1206, { font: font(400, 22), color: '#222', max: 214 });
    txt('~3× · schematic', 82, 1232, { font: font(400, 22), color: '#222', max: 214 });
    ctx.restore();
  }

  // caption panel anchored to the bottom of the safe area, clear of the right-hand Reels UI column (x ≤ 944)
  function captionPanel(a, o) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const x = 64, w = 880, bottom = 1570;
    ctx.font = font(400, 40, SANS);
    const sub = Kit.wrap(ctx, o.sub, w - 56);
    const fine = [].concat(o.fine);
    const h = 26 + 44 + 18 + 62 + 12 + sub.length * 50 + 10 + fine.length * 28 + 16;
    const y = bottom - h + (1 - a) * 18;
    panel(x, y, w, h);
    const c = chip(o.chip, x + 26, y + 24, { size: 28, weight: 600 });
    let yy = y + 24 + c.h + 18 + 50;
    txt(o.title, x + 26, yy, { font: font(700, 60, SANS), max: w - 52 });
    yy += 14;
    sub.forEach((s) => { yy += 48; txt(s, x + 26, yy, { font: font(400, 40, SANS), color: '#1c1c1c', max: w - 52 }); });
    fine.forEach((s, i) => txt(s, x + 26, y + h - 18 - (fine.length - 1 - i) * 28, { font: font(400, 22), color: '#444', max: w - 52 }));
    ctx.restore();
  }

  function drawHook(a, withPanel = true) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const x = 64, y = 352, w = 952, h = HOOK_H;
    if (withPanel) panel(x, y, w, h);
    chip('ULTRASONIC ACTIVATION · 30 kHz', x + 26, y + 24, { size: 28, weight: 600 });
    // fit the title lines to the panel
    let fsz = 96; ctx.font = font(700, fsz, SANS);
    const l1 = 'Streaming', l2 = 'or cavitation?';
    while (Math.max(ctx.measureText('Streaming or').width, ctx.measureText(l2).width) > 880 && fsz > 50) { fsz -= 2; ctx.font = font(700, fsz, SANS); }
    txt(l1, x + 26, y + 80 + fsz, { font: font(700, fsz, SANS) });
    txt(l2, x + 26, y + 80 + fsz * 2.0, { font: font(700, fsz, SANS) });
    txt('simulated slow motion · schematic', x + 26, y + h - 52, { font: font(400, 24), color: '#333', max: w - 52 });
    txt('free-swinging file · straight model canal', x + 26, y + h - 22, { font: font(400, 24), color: '#333', max: w - 52 });
    ctx.restore();
  }

  function drawPower(t) {
    const a = vis(t, TL.power[0], TL.power[1], 0.2, 0.25);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const w = 520, h = 196, x = 540 - w / 2, y = 400 + (1 - a) * 12;
    ctx.fillStyle = INK; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = LIGHT; ctx.lineWidth = 2; ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
    txt('POWER', 540 - 40, y + 96, { font: font(700, 72), color: LIGHT, align: 'center' });
    upArrow(540 + 160, y + 70, 62, LIGHT);
    txt('25 → 75 µm', 540, y + 160, { font: font(500, 40), color: LIGHT, align: 'center', max: w - 40 });
    ctx.restore();
  }

  // ---- ROI inset: camera-software 3× zoom on one wall-bubble collapse, stepped at 1 µs/frame ----
  function drawROI(t, f, sinv, a) {
    if (a <= 0 || !ROI_EVENT) return;
    const e = ROI_EVENT, Z = 3, S = 110, B = S * Z;
    const sx = wallX(e.y, 1) - 40 - S / 2, sy = e.y - S / 2;
    const bx = 600, by = 560;
    ctx = ROI_CTX;
    ctx.setTransform(Z, 0, 0, Z, -Z * sx, -Z * sy);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    drawFootage('B', f, AMP.B, sinv, false);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawGrain(0);
    ctx = mainCtx;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.setLineDash([9, 7]);
    ctx.strokeRect(sx, sy, S, S);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, by + B); ctx.moveTo(sx + S, sy); ctx.lineTo(bx + B, by + B); ctx.stroke();
    ctx.setLineDash([]);
    ctx.drawImage(ROI_CANVAS, bx, by);
    ctx.lineWidth = 4; ctx.strokeRect(bx - 2, by - 2, B + 4, B + 4);
    chip('ROI ×3', bx + 10, by + 10, { size: 30, weight: 600 });
    chip('micro-jet → wall', bx + 10, by + B - 54, { size: 30, weight: 500 });
    ctx.restore();
  }

  // ---- Bernoulli back-of-envelope overlay ----
  // ghost extremes of the file + cursors measuring the tip displacement (drawn under the HUD)
  function drawMeasure(t) {
    const a = vis(t, TL.bern[0] + 0.05, TL.bern[1], 0.3, 0.3);
    if (a <= 0) return;
    const tt = t - TL.bern[0];
    const ca = seg(tt, 0.05, 0.45, ease.out) * (1 - 0.35 * seg(tt, 1.05, 1.35, ease.inOut));
    ctx.save(); ctx.globalAlpha = a * 0.2 * ca;
    drawFile(AMP.B, 1, 1, true);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = a * ca;
    const xl = XF - AMP.B, xr = XF + AMP.B, yTop = 960, yBot = 1150;
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]);
    for (const x of [xl, xr]) { ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(xl + 4, yBot - 14); ctx.lineTo(xr - 4, yBot - 14); ctx.stroke();
    ctx.fillStyle = INK;
    for (const [x, s] of [[xl + 2, 1], [xr - 2, -1]]) { ctx.beginPath(); ctx.moveTo(x, yBot - 14); ctx.lineTo(x + s * 14, yBot - 22); ctx.lineTo(x + s * 14, yBot - 6); ctx.closePath(); ctx.fill(); }
    chip('2A = 150 µm', XF, yBot + 4, { size: 30, weight: 600, align: 'center' });
    ctx.restore();
  }

  function drawBernoulli(t) {
    const a = vis(t, TL.bern[0] + 0.05, TL.bern[1], 0.3, 0.3);
    if (a <= 0) return;
    const tt = t - TL.bern[0];
    const dimTop = 1 - 0.45 * seg(tt, 1.05, 1.35, ease.inOut); // one focal point: top recedes when the gauge arrives
    ctx.save(); ctx.globalAlpha = a;
    // top panel: the estimate
    const pa = seg(tt, 0.05, 0.3, ease.out);
    if (pa > 0) {
      ctx.save(); ctx.globalAlpha = a * pa;
      const x = 64, y = 352 + (1 - pa) * 14, w = 952, h = 280;
      panel(x, y, w, h);
      ctx.globalAlpha = a * pa * dimTop;
      chip('ORDER-OF-MAGNITUDE ESTIMATE · Bernoulli', x + 26, y + 24, { size: 28, weight: 600 });
      const l1 = seg(tt, 0.1, 0.3), l2 = seg(tt, 0.5, 0.7);
      ctx.globalAlpha = a * pa * dimTop * l1;
      txt('v = 2π·f·A ≈ 14 m/s', x + 26, y + 124, { font: font(600, 56), max: w - 52 });
      txt('f = 30 kHz · A = 75 µm · ρ ≈ 1000 kg/m³', x + 28, y + 160, { font: font(400, 22), color: '#333', max: w - 56 });
      ctx.globalAlpha = a * pa * dimTop * l2;
      txt('Δp ≈ ½ρv² ≈ 100 kPa ≈ 1 atm', x + 26, y + 226, { font: font(600, 46), max: w - 52 });
      txt('≈ size of the pressure swing near the tip', x + 28, y + 262, { font: font(400, 22), color: '#333', max: w - 56 });
      ctx.restore();
    }

    // bottom panel: local pressure gauge (absolute pressure, 0…101 kPa)
    const ga = seg(tt, 1.05, 1.25, ease.out);
    if (ga > 0) {
      ctx.save(); ctx.globalAlpha = a * ga;
      const x = 64, w = 880, h = 300, y = 1572 - h + (1 - ga) * 14;
      panel(x, y, w, h);
      chip('LOCAL PRESSURE NEAR TIP · kPa', x + 26, y + 22, { size: 28, weight: 600 });
      const X0 = 130, X1 = 870, kx = (X1 - X0) / 101, px = (p) => X0 + p * kx;
      const yb = y + 150, bh = 40, PV = 6.3;
      const u = seg(tt, 1.3, 1.8, ease.inOut), p = lerp(101, PV, u);
      ctx.fillStyle = 'rgba(17,17,17,0.06)'; ctx.fillRect(X0, yb - bh / 2, X1 - X0, bh);
      // hatched = pressure drop (gap between the remaining pressure and ambient)
      ctx.save(); ctx.beginPath(); ctx.rect(px(p), yb - bh / 2, X1 - px(p), bh); ctx.clip();
      ctx.strokeStyle = 'rgba(17,17,17,0.3)'; ctx.lineWidth = 2;
      for (let xx = X0 - bh; xx < X1 + bh; xx += 12) { ctx.beginPath(); ctx.moveTo(xx, yb + bh / 2); ctx.lineTo(xx + bh, yb - bh / 2); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = '#1b1b1b'; ctx.fillRect(X0, yb - bh / 2, px(p) - X0, bh);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(X0, yb - bh / 2, X1 - X0, bh);
      // vapour-pressure band 2.3–6.3 kPa (20–37 °C)
      ctx.fillStyle = 'rgba(17,17,17,0.16)'; ctx.fillRect(px(2.3), yb - bh / 2 - 10, px(PV) - px(2.3), bh + 14);
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
      for (const v of [2.3, PV]) { ctx.beginPath(); ctx.moveTo(px(v), yb - bh / 2 - 10); ctx.lineTo(px(v), yb + bh / 2 + 4); ctx.stroke(); }
      ctx.setLineDash([]);
      txt('2–6 kPa (20–37 °C)', px(2.3) - 8, y + 106, { font: font(500, 30) });
      txt('ambient', X1, y + 106, { font: font(500, 30), align: 'right' });
      // ticks: absolute pressure at the bar ends
      txt('0', X0 - 12, yb + 1, { font: font(500, 30), align: 'right', base: 'middle' });
      txt('101', X1 + 10, yb + 1, { font: font(500, 30), base: 'middle' });
      // live value under the bar end while it drops, then the punchline
      if (u > 0.02 && u < 1) txt(`≈ ${Math.round(p)} kPa`, clamp(px(p), X0 + 90, X1 - 90), y + 218, { font: font(600, 30), align: 'center' });
      if (u >= 1) {
        const k = seg(tt, 1.8, 2.0, ease.outBack);
        roundBubble(px(PV) + 22, y + 207, 15 * clamp(k, 0, 1.2));
        ctx.save(); ctx.globalAlpha *= clamp(k);
        txt('reaches vapour p. → bubbles', px(PV) + 46, y + 218, { font: font(600, 30), max: X1 - px(PV) - 46 });
        ctx.restore();
      }
      txt('order of magnitude only · inertial term is as large or larger', x + 26, y + h - 46, { font: font(400, 22), color: '#444', max: w - 52 });
      txt('cavitation is detectable even at low power (Macedo 2014)', x + 26, y + h - 18, { font: font(400, 22), color: '#444', max: w - 52 });
      ctx.restore();
    }
    ctx.restore();
  }

  // ---- takeaway ----
  function eddyIcon(cx, cy, r) {
    // mini file silhouette with a steady eddy on each side (dashed loops + chevrons)
    ctx.save();
    ctx.fillStyle = INK; ctx.beginPath();
    ctx.moveTo(cx - 9, cy - r); ctx.lineTo(cx + 9, cy - r); ctx.lineTo(cx + 7, cy + r * 0.72); ctx.lineTo(cx, cy + r * 0.92); ctx.lineTo(cx - 7, cy + r * 0.72); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.setLineDash([9, 7]);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * r * 0.58, cy, r * 0.34, r * 0.7, 0, 0, 7); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const s of [-1, 1]) {
      for (const [yy, d] of [[-1, s], [1, -s]]) {
        const x = cx + s * r * 0.58, y = cy + yy * r * 0.7;
        ctx.save(); ctx.translate(x, y); ctx.rotate(d > 0 ? 0 : Math.PI);
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, -9); ctx.lineTo(-3, 0); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  }
  function drawTakeaway(a, withPanel = true) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const x = 64, y = 352, w = 952, h = 640;
    if (withPanel) panel(x, y, w, h);
    chip('TAKEAWAY', x + 26, y + 24, { size: 28, weight: 600 });
    // row 1
    eddyIcon(x + 108, y + 180, 62);
    txt('Streaming', x + 200, y + 172, { font: font(700, 78, SANS) });
    txt('always on', x + 202, y + 232, { font: font(400, 50, SANS), color: '#222' });
    ctx.fillStyle = INK; ctx.fillRect(x + 26, y + 290, w - 52, 2);
    // row 2
    roundBubble(x + 108, y + 392, 44);
    roundBubble(x + 150, y + 352, 13); roundBubble(x + 72, y + 446, 9);
    txt('Cavitation', x + 200, y + 390, { font: font(700, 78, SANS) });
    txt('real, but patchy', x + 202, y + 450, { font: font(400, 50, SANS), color: '#222' });
    txt('tip · antinodes · walls · ↑ with amplitude', x + 26, y + 530, { font: font(500, 30), color: '#1c1c1c', max: w - 52 });
    txt('Verhaagen 2014 · Macedo 2014a,b · Boutsioukis 2013/2022 · Ohl 2006', x + 26, y + h - 22, { font: font(400, 22), color: '#444', max: w - 52 });
    ctx.restore();
  }

  // ------------------------------------------------------------------ REEL
  window.REEL = {
    title: 'Ultrasonic activation: streaming vs cavitation',
    duration: DUR,
    poster: 10.05,
    canvas,
    fonts: ['700 74px "IBM Plex Sans"', '400 40px "IBM Plex Sans"', '600 30px "IBM Plex Mono"', '500 30px "IBM Plex Mono"', '400 30px "IBM Plex Mono"', '700 72px "IBM Plex Mono"'],
    async setup() {
      PLATE = buildPlate();
      buildSprites();
      buildGrain();
      [ROI_CANVAS, ROI_CTX] = mk(330, 330);
      const R = rng(5);
      for (let i = 0; i < NP + NPO; i++) META.push(i < NP ? { r: 3.8 + R() * 1.8 } : { r: 9 + R() * 10, a: 0.35 + R() * 0.35 });
      SIM.A = simulate(101, -180, 200, 1.5);   // low power: slow steady streaming (pre-trigger frames for the takeaway + trails)
      SIM.B = simulate(202, 0, 125, 4.2);      // high power: faster (∝A² in theory; capped for legibility)
      const pick = (frame, targets, out) => {
        for (const [tx, ty] of targets) {
          let best = 0, bd = 1e9;
          for (let i = 0; i < NP; i++) { const [x, y] = simPos('A', frame, i); const d = Math.hypot(x - tx, y - ty); if (d < bd && !out.some((q) => q.i === i)) { bd = d; best = i; } }
          out.push({ i: best });
        }
      };
      pick(70, [[402, 610], [690, 905], [470, 1230]], TRACK);      // PTV boxes during REC A
      pick(-50, [[455, 1170], [650, 1320], [505, 1470]], TRACK2);  // PTV boxes under the takeaway (live eddies)
      STREAMS = buildStreamlines();
      EVENTS = genEvents();
      CLOUD = EVENTS.filter((e) => e.cloud);
      ROI_EVENT = EVENTS.find((e) => e.type === 'wall' && e.main && e.side > 0 && e.tMax > SLOW.f0 - 4 && e.tMax < SLOW.f0 + 6);
    },
    render(t) {
      const fs = footage(t);
      const rec = fs.rec, f = fs.f, amp = AMP[rec];
      const sinv = Math.sin(OMEGA * (f + PH[rec]));
      ctx = mainCtx;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawFootage(rec, f, amp, sinv);

      // grading: analysis dim / takeaway wash / cut dip
      if (fs.frozen) { ctx.fillStyle = `rgba(20,20,20,${0.1 * seg(t, TL.freeze, TL.freeze + 0.3)})`; ctx.fillRect(0, 0, W, H); }
      const wash = 0.3 * seg(t, TL.take - 0.3, TL.take + 0.05) * (1 - seg(t, DUR - 0.6, DUR));
      if (wash > 0) { ctx.fillStyle = `rgba(238,238,233,${wash})`; ctx.fillRect(0, 0, W, H); }
      const dip = Math.min(seg(t, TL.dip[0], TL.dip[0] + 0.14, ease.inOut), 1 - seg(t, TL.dip[1] - 0.14, TL.dip[1], ease.inOut));
      if (dip > 0) { ctx.fillStyle = `rgba(8,8,8,${0.6 * dip})`; ctx.fillRect(0, 0, W, H); }

      // analysis overlays — REC A (low power) and the takeaway's live pre-trigger footage
      if (rec === 'A' && t < TL.take) {
        const sa = 0.9 * vis(t, TL.flow[0], TL.flow[1], 0.6, 0.3);
        if (t < TL.hook[1] + 0.5) { // under the hook: only below the hook panel, the rest fades in as the hook leaves
          const hb = 352 + HOOK_H + 6;
          ctx.save(); ctx.beginPath(); ctx.rect(0, hb, W, H - hb); ctx.clip(); drawStreamlines(t, sa); ctx.restore();
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hb); ctx.clip(); drawStreamlines(t, sa * seg(t, TL.hook[1] - 0.2, TL.hook[1] + 0.45)); ctx.restore();
        } else drawStreamlines(t, sa);
        const ta = vis(t, TL.track[0], TL.track[1], 0.4, 0.3);
        drawTracking(rec, f, amp, ta, TRACK);
        if (ta > 0 && TRACK[0].cur) label(['10 µm tracer'], 74, 520, TRACK[0].cur[0] - 22, TRACK[0].cur[1] - 12, ta, 'right');
        const la = vis(t, TL.legend[0], TL.legend[1], 0.4, 0.3);
        if (la > 0) {
          ctx.save(); ctx.globalAlpha = la;
          ctx.fillStyle = INK; ctx.fillRect(72, 800, 200, 140);
          ctx.strokeStyle = LIGHT; ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 34;
          ctx.beginPath(); ctx.moveTo(86, 826); ctx.lineTo(236, 826); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.moveTo(256, 826); ctx.lineTo(238, 816); ctx.lineTo(243, 826); ctx.lineTo(238, 836); ctx.closePath(); ctx.fill();
          txt('mean flow', 86, 874, { font: font(500, 30), color: LIGHT });
          txt('pattern', 86, 904, { font: font(400, 22), color: '#cfcfca' });
          txt('schematic', 86, 928, { font: font(400, 22), color: '#cfcfca' });
          ctx.restore();
        }
      }
      if (rec === 'A' && t >= TL.take) {
        const ka = seg(t, TL.take, TL.take + 0.4) * (1 - seg(t, DUR - 0.6, DUR));
        drawStreamlines(t, 0.55 * ka);
        drawTracking(rec, f, amp, 0.85 * ka, TRACK2);
      }
      if (rec === 'B' && !fs.frozen) {
        const roiA = vis(t, TL.roi[0], TL.roi[1], 0.25, 0.25);
        const dim = 1 - 0.65 * roiA;
        const cc = cloudCentroid(f);
        if (cc) label(['tip cloud'], 768, 1166, cc[0], cc[1], vis(t, TL.cloudL, TL.freeze, 0.3, 0.25) * dim * clamp(cc[2] / 12), 'left');
        const xa = XF + amp * phi(Y_TIP - Y_A2) * sinv - hwBase(Y_A2) - 12;
        label(['antinode ·', 'max swing'], 74, 470, xa, Y_A2, vis(t, TL.antiL, TL.freeze, 0.3, 0.25) * dim, 'right');
        drawROI(t, f, sinv, roiA);
      }

      if (fs.frozen) drawMeasure(t);
      drawScaleBar(1);
      drawHUD(t, fs);

      drawHook(vis(t, -1, TL.hook[1], 0.25, 0.25));
      captionPanel(vis(t, TL.capA[0], TL.capA[1]), {
        chip: 'LOW POWER · TIP AMPLITUDE ≈ 25 µm', title: 'Acoustic streaming',
        sub: 'Tracers loop in steady eddies',
        fine: ['schematic, values illustrative · Boutsioukis 2022; Malki 2012', 'cavitation detectable even at low power (Macedo 2014)'],
      });
      drawPower(t);
      captionPanel(vis(t, TL.capB[0], TL.capB[1]), {
        chip: 'HIGH POWER · TIP AMPLITUDE ≈ 75 µm', title: '+ Cavitation',
        sub: 'Streaming speeds up;\nbubbles grow, then implode',
        fine: 'schematic, values illustrative · Macedo 2014; Ohl 2006',
      });
      drawBernoulli(t);
      if (t < TL.loop) drawTakeaway(seg(t, TL.take, TL.take + 0.25, ease.out));
      else { // loop seam: the takeaway card shrinks into the hook card in place (slide change on the same card)
        ctx.globalAlpha = 1;
        const ph = lerp(640, HOOK_H, seg(t, TL.loop, DUR - 0.05, ease.inOut));
        panel(64, 352, 952, ph);
        // keep the fading takeaway text inside the shrinking card (its source line used to spill below the border)
        ctx.save(); ctx.beginPath(); ctx.rect(64, 352, 952, ph - 4); ctx.clip();
        drawTakeaway(1 - seg(t, TL.loop, TL.loop + 0.15), false);
        ctx.restore();
        drawHook(seg(t, DUR - 0.2, DUR - 0.02), false);
      }
    },
  };
  Kit.boot(REEL);
})();
