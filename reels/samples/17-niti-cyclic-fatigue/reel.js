/* 17 · Why NiTi rotary files fracture in curved canals — cyclic fatigue.
 * Style: green-phosphor vector oscilloscope / CRT. Pure render(t); all randomness seeded.
 * See NOTES.md for sources and what is schematic.
 */
'use strict';
(function () {
  const { clamp, lerp, seg, ease, W, H } = Kit;
  const DUR = 22.0;
  const TAU = Math.PI * 2;
  const { canvas, ctx } = Kit.createCanvas();

  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  const LAYER = mk(W, H), L = LAYER.getContext('2d');          // phosphor vector layer (additive)
  const BL1 = mk(W / 4, H / 4), b1 = BL1.getContext('2d');     // wide bloom
  const BL2 = mk(W / 2, H / 2), b2 = BL2.getContext('2d');     // tight bloom
  const FR = mk(W, H), F = FR.getContext('2d');                // composed screen
  let BODY, SCREEN_BG, SCAN;

  // ---------------------------------------------------------------- palette / fonts
  const PH = [70, 255, 138], HOT = [218, 255, 228];
  function pc(i, a = 1) {
    i = Math.max(0, i);
    const w = clamp((i - 0.78) / 0.6);
    return `rgba(${lerp(PH[0], HOT[0], w) | 0},${lerp(PH[1], HOT[1], w) | 0},${lerp(PH[2], HOT[2], w) | 0},${(clamp(i) * a).toFixed(3)})`;
  }
  const VT = (s) => `${s}px VT323, "JetBrains Mono", monospace`;
  const MONO = (s) => `${s}px "Share Tech Mono", "JetBrains Mono", monospace`;
  const CAPH = {};
  function capH(font) {
    if (!(font in CAPH)) { L.save(); L.font = font; CAPH[font] = L.measureText('H').actualBoundingBoxAscent || parseFloat(font) * 0.6; L.restore(); }
    return CAPH[font];
  }

  // ---------------------------------------------------------------- layout
  const SCR = { x: 28, y: 222, w: 1024, h: 1376, r: 44 };
  const DA = { x: 64, y: 494, w: 952, h: 474 };        // display A: canal + section
  const DB = { x: 64, y: 984, w: 952, h: 382 };        // display B: strain trace
  const GB = { x: 150, y: 1036, w: 800, h: 320 };      // graticule (10 x 4 div, 80 px/div)
  const FP = { x: 64, y: 1380, w: 952, h: 156 };       // formula panel
  const YC = GB.y + GB.h / 2;
  const STRAIN_PX = 80 / 0.04;                          // 4 %/div

  // ---------------------------------------------------------------- timeline
  const TL = {
    on: 0.36, ins0: 0.5, ins1: 1.2, eps0: 0.75, eps1: 1.25,
    rot0: 1.2, rot1: 1.6, acc0: 10.65, acc1: 11.9, frac: 14.55,
    R0: 7.6, R1: 8.8, d0: 9.1, d1: 9.9, wMax: 240,
    secOn: 1.8, morph0: 10.55, morph1: 11.25, dimOn: 7.1, dimOff: 10.7, life0: 10.8, mv0: 6.9, mv1: 7.45,
    take0: 17.75, off0: 21.62, off1: 21.82, off2: 21.98,
  };
  const CAPS = [
    { t0: 0.12, t1: 3.4, size: 104, top: 296, lines: ['WHY NiTi FILES', 'SNAP IN CURVES'],
      sub: 'mechanism 1 of 2: cyclic fatigue · the other: torsion', subSize: 30 },
    { t0: 3.4, t1: 6.9, size: 76, lines: ['Every turn = one', 'tension–compression cycle'] },
    { t0: 6.9, t1: 10.6, size: 76, lines: ['Tighter curve, thicker file', '→ more strain'] },
    { t0: 10.6, t1: 14.45, size: 76, lines: ['Surface flaw → microcrack,', 'grows every cycle'] },
    { t0: 14.45, t1: 17.75, size: 76, lines: ['Then: sudden fracture,', 'often without warning'] },
    { t0: 17.75, t1: 21.62, size: 92, top: 310, lines: ['EVERY TURN IN A CURVE', 'SPENDS [FATIGUE LIFE]*'], hold: true,
      sub: '*above ~0.7% strain (fatigue limit) · Cheung & Darvell IEJ 2007', subSize: 24 },
  ];
  const SOURCES = [
    [0, 6.9, 'rotating-bending fatigue test: Pruett et al. J Endod 1997'],
    [6.9, 10.6, 'ε ≈ d/(2R): outer-fibre strain, simple beam bending'],
    [10.6, 14.45, 'Anderson J Endod 2007 · Cheung & Darvell IEJ 2007 · Cheung IEJ 2005'],
    [14.45, 17.75, 'Sattapan et al. J Endod 2000 · Shen et al. J Endod 2006'],
    [17.75, 99, 'Pruett et al. J Endod 1997 · Cheung & Darvell IEJ 2007'],
  ];

  const Rmm = (t) => lerp(5.0, 3.0, ease.inOut(seg(t, TL.R0, TL.R1)));
  const Dmm = (t) => lerp(0.30, 0.36, ease.inOut(seg(t, TL.d0, TL.d1)));
  function wRaw(t) {                       // rotations per second of the (displayed) file
    if (t < TL.rot0) return 0;
    if (t < TL.rot1) return ease.smooth(seg(t, TL.rot0, TL.rot1));
    if (t < TL.acc0) return 1;
    if (t < TL.acc1) return Math.pow(TL.wMax, ease.inOut(seg(t, TL.acc0, TL.acc1)));
    if (t < TL.frac) return TL.wMax;
    return 0;
  }
  // tables: phase (cycles), strain amplitude, toy damage integral
  const DT = 1 / 1000, NT = Math.ceil(DUR / DT) + 4;
  const T_PHI = new Float64Array(NT), T_W = new Float64Array(NT), T_E = new Float64Array(NT), T_I = new Float64Array(NT);
  (function build() {
    for (let i = 0; i < NT; i++) { const t = i * DT; T_W[i] = wRaw(t); T_E[i] = Dmm(t) / (2 * Rmm(t)); }
    for (let i = 1; i < NT; i++) {
      const t = i * DT;
      T_PHI[i] = T_PHI[i - 1] + 0.5 * (T_W[i] + T_W[i - 1]) * DT;
      // toy Miner sum with N_f ∝ ε^-2 (fatigue-ductility exponent ≈ -0.5, Cheung & Darvell 2007)
      T_I[i] = T_I[i - 1] + (t <= TL.frac ? 0.5 * (T_W[i] * T_E[i] * T_E[i] + T_W[i - 1] * T_E[i - 1] * T_E[i - 1]) * DT : 0);
    }
  })();
  const look = (arr, t) => { const x = clamp(t, 0, DUR + 0.002) / DT; const i = Math.floor(x), f = x - i; return arr[i] + (arr[i + 1] - arr[i]) * f; };
  const K_LIFE = look(T_I, TL.frac);
  const phiAt = (t) => look(T_PHI, t);
  const epsAt = (t) => look(T_E, t);
  const wAt = (t) => look(T_W, t);
  const lifeAt = (t) => clamp(look(T_I, t) / K_LIFE);
  const N_FRAC = Math.floor(phiAt(TL.frac));
  const PHI_FRAC = phiAt(TL.frac);
  // bending strain appears as the file is pushed through the curve, then alternates once per turn
  const bendAt = (t) => ease.smooth(seg(t, TL.eps0, TL.eps1));          // file bends into the curve during insertion
  const strainAt = (t) => (t >= TL.frac ? 0 : bendAt(t) * epsAt(t) * Math.cos(TAU * phiAt(t)));
  const crackAt = (t) => { const D = lifeAt(t); return D < 0.008 ? 0 : 0.05 + 0.95 * Math.pow((D - 0.008) / 0.992, 1.25); };

  // ---------------------------------------------------------------- drawing helpers
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function line(g, x1, y1, x2, y2, I, w = 2) { g.strokeStyle = pc(I); g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  function poly(g, pts, I, w = 2, close = false) {
    if (pts.length < 2) return;
    g.strokeStyle = pc(I); g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    if (close) g.closePath(); g.stroke();
  }
  function dot(g, x, y, r, I) { g.fillStyle = pc(I); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  function text(g, s, x, y, font, I, align = 'left') { g.font = font; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillStyle = pc(I); g.fillText(s, x, y); }

  // text with hand-drawn / substituted special glyphs (VT323 has no ε ≈ →)
  function rich(g, str, x, y, size, I, o = {}) {
    const font = o.font || VT(size);
    const ch = capH(font);
    const toks = []; let buf = '';
    for (const c of str) { if ('ε≈→▶■'.includes(c)) { if (buf) toks.push({ s: buf }); buf = ''; toks.push({ sym: c }); } else buf += c; }
    if (buf) toks.push({ s: buf });
    const efont = `500 ${Math.round(ch * (o.epsScale || 1.42))}px "JetBrains Mono", monospace`;
    for (const tk of toks) {
      if (tk.s != null) { g.font = font; tk.w = g.measureText(tk.s).width; }
      else if (tk.sym === 'ε') { g.font = efont; tk.w = g.measureText('ε').width * 0.92; }
      else if (tk.sym === '≈') tk.w = ch * 1.05;
      else if (tk.sym === '→') tk.w = ch * 1.45;
      else tk.w = ch * 1.0;
    }
    const total = toks.reduce((a, b) => a + b.w, 0);
    if (o.measure) return total;
    let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = o.color || pc(I); g.strokeStyle = o.color || pc(I);
    const lw = Math.max(2, ch * 0.13);
    for (const tk of toks) {
      if (tk.s != null) { g.font = font; g.fillText(tk.s, cx, y); }
      else if (tk.sym === 'ε') { g.font = efont; g.fillText('ε', cx - tk.w * 0.02, y); }
      else if (tk.sym === '≈') {
        g.lineWidth = lw; g.lineCap = 'round';
        for (const hy of [0.32, 0.62]) {
          g.beginPath();
          for (let k = 0; k <= 16; k++) { const u = k / 16; const px = cx + ch * 0.12 + u * ch * 0.8; const py = y - ch * hy - Math.sin(u * TAU) * ch * 0.09; k ? g.lineTo(px, py) : g.moveTo(px, py); }
          g.stroke();
        }
        g.lineCap = 'butt';
      } else if (tk.sym === '→') {
        const yy = y - ch * 0.48, x0 = cx + ch * 0.12, x1 = cx + ch * 1.3;
        g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.moveTo(x1 - ch * 0.38, yy - ch * 0.32); g.lineTo(x1, yy); g.lineTo(x1 - ch * 0.38, yy + ch * 0.32); g.stroke();
        g.lineCap = 'butt';
      } else if (tk.sym === '▶') {
        g.beginPath(); g.moveTo(cx + ch * 0.1, y - ch * 0.95); g.lineTo(cx + ch * 0.85, y - ch * 0.47); g.lineTo(cx + ch * 0.1, y); g.closePath(); g.fill();
      } else if (tk.sym === '■') {
        g.fillRect(cx + ch * 0.1, y - ch * 0.85, ch * 0.75, ch * 0.75);
      }
      cx += tk.w;
    }
    return total;
  }
  // inverse-video label. Only a dim block goes on the phosphor layer (it feeds the bloom halo); the solid block and
  // its dark letters are painted on the composed frame AFTER the bloom (drawInverseTop), so glow cannot fill the letters.
  const INV = [];
  function inverse(g, s, x, y, size, I, o = {}) {
    const font = o.font || VT(size);
    const ch = capH(font);
    const w = rich(g, s, 0, 0, size, I, { font, measure: true });
    const padX = o.padX != null ? o.padX : ch * 0.35, padY = o.padY != null ? o.padY : ch * 0.32;
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    const box = [x0 - padX, y - ch - padY, w + padX * 2, ch + padY * 2];
    g.fillStyle = pc(0.5 * I); g.fillRect(box[0], box[1], box[2], box[3]);
    INV.push({ s, x0, y, size, font, box, I });
    return w + padX * 2;
  }
  function drawInverseTop(g) {
    for (const v of INV) {
      g.globalAlpha = clamp(v.I);
      g.fillStyle = 'rgb(110,255,160)'; g.fillRect(v.box[0], v.box[1], v.box[2], v.box[3]);
      rich(g, v.s, v.x0, v.y, v.size, 1, { font: v.font, color: '#021a0c' });
      g.globalAlpha = 1;
    }
  }

  // outlined tag: box + bright text (reads better than inverse at small sizes under bloom)
  function tag(g, s, x, y, size, I, o = {}) {
    const font = o.font || VT(size), ch = capH(font);
    const w = rich(g, s, 0, 0, size, I, { font, measure: true });
    const padX = ch * 0.45, padY = ch * 0.38;
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    rr(g, x0 - padX, y - ch - padY, w + 2 * padX, ch + 2 * padY, 5);
    g.fillStyle = pc(0.1 * I); g.fill();
    g.strokeStyle = pc(0.85 * I); g.lineWidth = 2.5; g.stroke();
    rich(g, s, x0, y, size, I, { font });
    return w + 2 * padX;
  }

  // ---------------------------------------------------------------- canal / file geometry (display A)
  const GEO = { S: 50, X: 2.4, x0: 300, yTop: 470, y0: 620, A: Math.PI / 3, La: 125, step: 3 };
  function geom(t) {
    const R = Rmm(t), d = Dmm(t), S = GEO.S;
    const Rp = R * S, Ls = GEO.y0 - GEO.yTop, Larc = Rp * GEO.A, total = Ls + Larc + GEO.La;
    const ex = GEO.x0 + Rp - Rp * Math.cos(GEO.A), ey = GEO.y0 + Rp * Math.sin(GEO.A);
    function P(u) {
      let x, y, tx, ty;
      if (u <= Ls) { x = GEO.x0; y = GEO.yTop + u; tx = 0; ty = 1; }
      else if (u <= Ls + Larc) { const th = (u - Ls) / Rp; x = GEO.x0 + Rp - Rp * Math.cos(th); y = GEO.y0 + Rp * Math.sin(th); tx = Math.sin(th); ty = Math.cos(th); }
      else { const ue = u - Ls - Larc; x = ex + ue * Math.sin(GEO.A); y = ey + ue * Math.cos(GEO.A); tx = Math.sin(GEO.A); ty = Math.cos(GEO.A); }
      return { x, y, tx, ty, nx: -ty, ny: tx };     // n = outer normal (away from centre of curvature)
    }
    const uMid = Ls + Larc / 2;
    const hwc = d * S * GEO.X / 2;                   // exaggerated half-width at the curve
    const tipU = total - 6;
    const vMid = tipU - uMid;                        // distance from file tip to curve midpoint
    const hwF = (v) => { let h = hwc * (1 + 0.0011 * (v - vMid)); if (v < 24) h *= 0.25 + 0.75 * Math.sqrt(Math.max(0, v) / 24); return h; };
    const cw = (u) => hwc * (1 + 0.0011 * (tipU - u - vMid)) + 6;
    const rw = (u) => lerp(118, 40, clamp(u / total));
    return { R, d, Rp, Ls, Larc, total, uMid, hwc, tipU, vMid, hwF, cw, rw, P, C: { x: GEO.x0 + Rp, y: GEO.y0 } };
  }
  function offsetPath(G, u0, u1, offFn, side) {
    const pts = []; const n = Math.max(2, Math.ceil((u1 - u0) / GEO.step));
    for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n); const p = G.P(u); const o = offFn(u) * side; pts.push([p.x + p.nx * o, p.y + p.ny * o]); }
    return pts;
  }
  // closed outline: side +1 down, cap around end, side -1 back up
  function tubePath(g, G, u0, u1, offFn) {
    const a = offsetPath(G, u0, u1, offFn, 1), b = offsetPath(G, u0, u1, offFn, -1);
    const E = G.P(u1), r = offFn(u1);
    g.beginPath(); g.moveTo(a[0][0], a[0][1]);
    for (const p of a) g.lineTo(p[0], p[1]);
    const an = Math.atan2(E.ny, E.nx);
    g.arc(E.x, E.y, r, an, an + Math.PI, (E.nx * E.ty - E.ny * E.tx) < 0);
    for (let i = b.length - 1; i >= 0; i--) g.lineTo(b[i][0], b[i][1]);
  }

  // file (coronal part [vA..vB] measured from tip; position along canal u = shift + tipU - v)
  function drawFile(g, G, vA, vB, phase, blurRevs, I, shiftU = 0) {
    const step = 3, n = Math.max(2, Math.ceil((vB - vA) / step));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const v = lerp(vA, vB, i / n); const u = G.tipU - v - shiftU; const p = G.P(u); const hw = G.hwF(v);
      pts.push({ v, x: p.x, y: p.y, nx: p.nx, ny: p.ny, hw });
    }
    // outline
    const L1 = pts.map((p) => [p.x + p.nx * p.hw, p.y + p.ny * p.hw]);
    const L2 = pts.map((p) => [p.x - p.nx * p.hw, p.y - p.ny * p.hw]);
    poly(g, L1, 0.85 * I, 2.4); poly(g, L2, 0.85 * I, 2.4);
    if (vA <= 0.5) { const p = pts[0]; line(g, L1[0][0], L1[0][1], L2[0][0], L2[0][1], 0.85 * I, 2.4); dot(g, p.x, p.y, 1.5, I); }
    // flutes (3-start helix, pitch 46 px), motion-blurred by sub-phase sampling
    const M = clamp(Math.ceil(blurRevs * 14), 1, 14);
    const pitch = 46;
    for (let m = 0; m < M; m++) {
      const ph = phase - (M > 1 ? (m / M) * Math.min(blurRevs, 1.0) : 0);
      const aF = (M > 1 ? 1.3 / M : 1) * I;
      for (let k = 0; k < 3; k++) {
        const front = [], back = [];
        let cur = null, curFront = null;
        for (const p of pts) {
          const psi = TAU * (p.v / pitch) + (TAU * k) / 3 - TAU * ph;
          const c = Math.cos(psi), s = Math.sin(psi);
          const x = p.x + p.nx * p.hw * c * 0.96, y = p.y + p.ny * p.hw * c * 0.96;
          const isF = s > 0;
          if (cur && isF === curFront) cur.push([x, y]);
          else { if (cur) { cur.push([x, y]); (curFront ? front : back).push(cur); } cur = [[x, y]]; curFront = isF; }
        }
        if (cur) (curFront ? front : back).push(cur);
        for (const pl of front) poly(g, pl, 0.95 * aF, 2);
        for (const pl of back) poly(g, pl, 0.22 * aF, 1.6);
      }
    }
  }

  // ---------------------------------------------------------------- static layers
  function buildStatic() {
    // screen background (phosphor black + faint tube glow)
    SCREEN_BG = mk(W, H); { const g = SCREEN_BG.getContext('2d');
      g.fillStyle = '#010302'; g.fillRect(0, 0, W, H);
      const rg = g.createRadialGradient(540, 900, 40, 540, 900, 900); rg.addColorStop(0, 'rgba(18,60,34,0.55)'); rg.addColorStop(0.6, 'rgba(6,22,12,0.35)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    // scanlines + vignette + tube edge shading (drawn over the phosphor)
    SCAN = mk(W, H); { const g = SCAN.getContext('2d');
      for (let y = SCR.y; y < SCR.y + SCR.h; y += 4) { g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(0, y + 3, W, 1); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y + 2, W, 1); }
      const vg = g.createRadialGradient(540, 910, 380, 540, 910, 1050); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
      g.save(); g.filter = 'blur(22px)'; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.lineWidth = 48; rr(g, SCR.x, SCR.y, SCR.w, SCR.h, SCR.r); g.stroke(); g.restore();
      // faint glass sheen
      const sh = g.createLinearGradient(0, SCR.y, 700, SCR.y + 700); sh.addColorStop(0, 'rgba(200,255,220,0.035)'); sh.addColorStop(0.5, 'rgba(200,255,220,0.0)');
      g.fillStyle = sh; g.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
    }
    // instrument body with the screen cut out (drawn last)
    BODY = mk(W, H); { const g = BODY.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#0e1210'); grd.addColorStop(0.5, '#090b0a'); grd.addColorStop(1, '#0d100e');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      const rn = Kit.rng(17); for (let y = 0; y < H; y += 2) { g.fillStyle = `rgba(255,255,255,${(rn() * 0.014).toFixed(4)})`; g.fillRect(0, y, W, 1); }
      // bezel
      rr(g, SCR.x - 16, SCR.y - 16, SCR.w + 32, SCR.h + 32, SCR.r + 14); g.fillStyle = '#050706'; g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2; g.stroke();
      rr(g, SCR.x - 4, SCR.y - 4, SCR.w + 8, SCR.h + 8, SCR.r + 3); g.strokeStyle = 'rgba(0,0,0,0.9)'; g.lineWidth = 6; g.stroke();
      // screws
      for (const [x, y] of [[44, 44], [1036, 44], [44, 1876], [1036, 1876]]) {
        const sg = g.createRadialGradient(x - 3, y - 3, 1, x, y, 13); sg.addColorStop(0, '#2a302c'); sg.addColorStop(1, '#0c0f0d');
        g.fillStyle = sg; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill();
        g.strokeStyle = '#050605'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 7, y - 3); g.lineTo(x + 7, y + 3); g.stroke();
      }
      // top strip labels (decorative; under the Reels UI)
      g.font = MONO(22); g.fillStyle = 'rgba(150,190,165,0.30)'; g.textAlign = 'center';
      g.fillText('VECTOR STRAIN MONITOR   ·   P31 PHOSPHOR', 540, 150);
      // bottom control panel (decorative)
      const knobs = [['INTENSITY', 170], ['FOCUS', 355], ['POSITION', 540], ['TIME/DIV', 725], ['CH1 %/DIV', 910]];
      for (const [lab, x] of knobs) {
        const y = 1760;
        g.font = MONO(20); g.fillStyle = 'rgba(150,190,165,0.30)'; g.textAlign = 'center'; g.fillText(lab, x, y - 62);
        const kg = g.createRadialGradient(x - 10, y - 12, 4, x, y, 44); kg.addColorStop(0, '#2b322e'); kg.addColorStop(1, '#0b0e0c');
        g.fillStyle = kg; g.beginPath(); g.arc(x, y, 40, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 2; g.stroke();
        for (let k = 0; k < 36; k++) { const a = (k / 36) * TAU; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + Math.cos(a) * 34, y + Math.sin(a) * 34); g.lineTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40); g.stroke(); }
        const a = -2.2 + (x / 1080) * 3.2; g.strokeStyle = 'rgba(200,230,210,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke();
        for (let k = 0; k <= 10; k++) { const aa = -3.9 + (k / 10) * 4.66; g.strokeStyle = 'rgba(150,190,165,0.22)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + Math.cos(aa) * 48, y + Math.sin(aa) * 48); g.lineTo(x + Math.cos(aa) * 55, y + Math.sin(aa) * 55); g.stroke(); }
      }
      // power LED
      const lg = g.createRadialGradient(80, 1660, 0, 80, 1660, 22); lg.addColorStop(0, 'rgba(120,255,160,0.9)'); lg.addColorStop(0.3, 'rgba(60,220,120,0.5)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = lg; g.beginPath(); g.arc(80, 1660, 22, 0, TAU); g.fill();
      g.font = MONO(18); g.fillStyle = 'rgba(150,190,165,0.30)'; g.textAlign = 'left'; g.fillText('POWER', 108, 1666);
      // cut the screen out
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; rr(g, SCR.x, SCR.y, SCR.w, SCR.h, SCR.r); g.fill(); g.globalCompositeOperation = 'source-over';
    }
  }

  // ---------------------------------------------------------------- scene pieces
  function frameBox(g, b, I, label) {
    rr(g, b.x, b.y, b.w, b.h, 14); g.strokeStyle = pc(I); g.lineWidth = 2; g.stroke();
    // corner brackets
    const c = 22; g.strokeStyle = pc(I * 1.8); g.lineWidth = 3;
    for (const [x, y, sx, sy] of [[b.x, b.y, 1, 1], [b.x + b.w, b.y, -1, 1], [b.x, b.y + b.h, 1, -1], [b.x + b.w, b.y + b.h, -1, -1]]) {
      g.beginPath(); g.moveTo(x + sx * 6, y + sy * (c + 6)); g.lineTo(x + sx * 6, y + sy * 6); g.lineTo(x + sx * (c + 6), y + sy * 6); g.stroke();
    }
  }

  function drawStatus(g, t, a) {
    if (a <= 0) return;
    text(g, 'CH1 ▪ NiTi CYCLIC FATIGUE', 70, 270, MONO(28), 0.5 * a);
    text(g, '@natebrooksendo', 1010, 270, MONO(28), 0.55 * a, 'right');
    // tiny run indicator
    const run = t < TL.frac ? 'RUN' : 'STOP';
    const x = 640; dot(g, x - 16, 261, 6, (t < TL.frac ? 0.9 : 0.45) * a);
    text(g, run, x, 270, MONO(28), 0.55 * a);
  }

  function drawCaption(g, t) {
    for (const c of CAPS) {
      if (t < c.t0 - 0.01 || t > c.t1 + 0.01) continue;
      const total = c.lines.reduce((n, l) => n + l.replace(/[\[\]]/g, '').length, 0);
      const typeDur = c.size > 100 ? 0.3 : 0.32, eraseDur = 0.2;
      let n;
      if (t < c.t0 + typeDur) n = Math.floor(total * seg(t, c.t0, c.t0 + typeDur));
      else if (!c.hold && t > c.t1 - eraseDur) n = Math.ceil(total * (1 - seg(t, c.t1 - eraseDur, c.t1)));
      else n = total;
      const font = VT(c.size), ch = capH(font);
      const lh = c.size * 0.86;
      const nl = c.lines.length;
      const yMid = 392;
      const y0 = c.top != null ? c.top + ch : yMid - ((nl - 1) * lh) / 2 + ch / 2;
      let used = 0, curX = 76, curY = y0;
      for (let li = 0; li < nl; li++) {
        const raw = c.lines[li];
        const y = y0 + li * lh;
        // split into normal / inverse segments
        const parts = []; let inv = false, buf = '';
        for (const chh of raw) { if (chh === '[' || chh === ']') { if (buf) parts.push({ s: buf, inv }); buf = ''; inv = chh === '['; } else buf += chh; }
        if (buf) parts.push({ s: buf, inv });
        let x = 76;
        for (const p of parts) {
          const avail = Math.max(0, Math.min(p.s.length, n - used));
          const s = p.s.slice(0, avail);
          used += avail;
          if (!s.length) continue;
          let w;
          if (p.inv) w = inverse(g, s, x + ch * 0.3, y, c.size, 1.0, { padX: ch * 0.3, padY: ch * 0.28 });
          else w = rich(g, s, x, y, c.size, 1.0);
          x += w;
          curX = x; curY = y;
        }
        if (used >= n) break;
      }
      // block cursor
      const typing = n < total;
      const blink = typing || Math.floor((t - c.t0) * 2.2) % 2 === 0;
      if (blink && n > 0) { g.fillStyle = pc(0.9); g.fillRect(curX + 8, curY - ch, ch * 0.55, ch); }
      // secondary line under the caption (typed after it, erased with it)
      if (c.sub) {
        const sf = MONO(c.subSize || 30);
        const u = seg(t, c.t0 + 0.32, c.t0 + 0.62) * (c.hold ? 1 : 1 - seg(t, c.t1 - eraseDur, c.t1));
        const sy = y0 + (nl - 1) * lh + (c.subSize || 30) + 10;
        if (u > 0) rich(g, Kit.type(c.sub, u), 78, sy, c.subSize || 30, c.subSize >= 30 ? 0.82 : 0.6, { font: sf, epsScale: 1.25 });
      }
    }
  }

  function drawSource(g, t, a) {
    for (const [t0, t1, s] of SOURCES) {
      const e = Math.min(seg(t, t0 + 0.2, t0 + 0.6), 1 - seg(t, t1 - 0.25, t1));
      if (e > 0) rich(g, s, 70, 1570, 24, 0.5 * e * a, { font: MONO(24), epsScale: 1.25 });
    }
  }

  function drawGridA(g, a) {
    for (let x = DA.x + 56; x < DA.x + DA.w - 20; x += 80)
      for (let y = DA.y + 40; y < DA.y + DA.h - 20; y += 80) { g.fillStyle = pc(0.16 * a); g.fillRect(x - 1.5, y - 1.5, 3, 3); }
  }

  function drawCanal(g, t, G, a) {
    const draw = ease.inOut(seg(t, 0.3, 1.05));
    if (draw <= 0) return;
    g.save();
    rr(g, DA.x + 2, DA.y + 2, DA.w - 4, DA.h - 4, 12); g.clip();
    const dash = (I, w, fn, len) => { g.setLineDash([len * draw, 1e5]); tubePath(g, G, 0, G.total + 10, fn); g.strokeStyle = pc(I * a); g.lineWidth = w; g.stroke(); g.setLineDash([]); };
    // root outline + one dentine contour
    dash(0.42, 2, (u) => G.rw(u), 1600);
    dash(0.13, 1.5, (u) => lerp(G.cw(u), G.rw(u), 0.5), 1500);
    // canal wall
    tubePath(g, G, 0, G.total, (u) => G.cw(u));
    g.setLineDash([1400 * draw, 1e5]); g.strokeStyle = pc(0.62 * a); g.lineWidth = 2.2; g.stroke(); g.setLineDash([]);
    g.restore();
  }

  // ---------------------------------------------------------------- display A: file, point, tags, dims, crack
  function drawDisplayA(g, t, G, a) {
    g.save();
    rr(g, DA.x + 2, DA.y + 2, DA.w - 4, DA.h - 4, 12); g.clip();
    const ins = ease.out(seg(t, TL.ins0, TL.ins1));
    if (ins > 0) {
      const tipNow = lerp(-80, G.tipU, ins);
      const shift = G.tipU - tipNow;                 // file not yet fully inserted
      const vTop = G.tipU + 40;                       // above the display top
      const w = wAt(t), blur = w / 30;
      const ph = phiAt(Math.min(t, TL.frac));
      const crack = crackAt(t);
      if (t < TL.frac) {
        drawFile(g, G, 0, vTop, ph, blur, a, shift);
      } else {
        const dt = t - TL.frac;
        const wc = TL.wMax * Math.exp(-dt / 0.3);
        const phc = PHI_FRAC + TL.wMax * 0.3 * (1 - Math.exp(-dt / 0.3));
        const retract = 130 * ease.out(seg(t, TL.frac + 0.2, TL.frac + 0.9));   // brief frozen beat, then the shank pulls away
        const hot = 1 + 0.3 * (1 - seg(t, TL.frac, TL.frac + 0.5));
        drawFile(g, G, 0, G.vMid - 1, PHI_FRAC, 0, a * hot, 0);                 // fragment stays in canal
        drawFile(g, G, G.vMid + 1, vTop + 40, phc, wc / 30, a, retract);         // shank spins out
        // fracture faces (both bright: the gap reads as a break)
        const pm = G.P(G.uMid); const hw = G.hwF(G.vMid);
        jag(g, pm, hw, 1.3 * a, 0);
        const pr = G.P(G.uMid - retract); jag(g, pr, hw, 1.3 * a, 1);
        // burst ring
        const k = seg(t, TL.frac, TL.frac + 0.6);
        if (k < 1) { g.strokeStyle = pc((1 - k) * 1.4 * a); g.lineWidth = 5; g.beginPath(); g.arc(pm.x, pm.y, 12 + 110 * ease.out(k), 0, TAU); g.stroke(); }
      }
      // crack before fracture: starts at the outer surface, depth ~ the inset's crack extent (fraction of Ø)
      if (t < TL.frac && crack > 0.02) {
        const pm = G.P(G.uMid), hw = G.hwF(G.vMid);
        const L0 = 0.8 * hw * crack + 3;
        const pts = []; const nseg = 5;
        for (let i = 0; i <= nseg; i++) {
          const f = i / nseg; const o = hw + 2 - L0 * f;
          const j = (i === 0 || i === nseg) ? 0 : (i % 2 ? 1 : -1) * (1.6 + Kit.hash(i, 7) * 1.4);
          pts.push([pm.x + pm.nx * o + pm.tx * j, pm.y + pm.ny * o + pm.ty * j]);
        }
        // thin, hot, zig-zag line from the outer surface inward (stays short of the file axis)
        poly(g, pts, 1.7 * a, 3.2);
        dot(g, pts[nseg][0], pts[nseg][1], 2.4, 1.6 * a);
      }
      // focus ring around the crack site while it grows
      const ring = seg(t, 11.3, 11.8) * (1 - seg(t, TL.frac, TL.frac + 0.15)) * a;
      if (ring > 0) {
        const pm = G.P(G.uMid);
        g.setLineDash([7, 7]); g.strokeStyle = pc(0.75 * ring); g.lineWidth = 2.4;
        g.beginPath(); g.arc(pm.x, pm.y, 52, 0, TAU); g.stroke(); g.setLineDash([]);
      }
      // marked point at the curve + persistence trail
      const pa = seg(t, TL.secOn - 0.2, TL.secOn + 0.3) * (1 - seg(t, TL.morph0, TL.morph0 + 0.5)) * a;
      if (pa > 0 && t < TL.frac) {
        const pm = G.P(G.uMid), hw = G.hwF(G.vMid);
        const K = 26, win = 0.32;
        let prev = null;
        for (let i = K; i >= 0; i--) {
          const tau = t - (i / K) * win; if (tau < TL.rot0 - 0.5) { prev = null; continue; }
          const ph2 = phiAt(tau); const c = Math.cos(TAU * ph2);
          const q = [pm.x + pm.nx * hw * c, pm.y + pm.ny * hw * c];
          if (prev) line(g, prev[0], prev[1], q[0], q[1], (1 - i / K) * 0.8 * pa, 4);
          prev = q;
        }
        const c = Math.cos(TAU * ph), s = Math.sin(TAU * ph);
        const q = [pm.x + pm.nx * hw * c, pm.y + pm.ny * hw * c];
        dot(g, q[0], q[1], 8, (s >= 0 ? 1.3 : 0.55) * pa);
        g.strokeStyle = pc(0.7 * pa); g.lineWidth = 2; g.beginPath(); g.arc(q[0], q[1], 14, 0, TAU); g.stroke();
      }
    }
    g.restore();

    // "microscopic" tag next to the focus ring (fatigue cracks need high-power SEM to see)
    const mt = seg(t, 11.5, 12.0) * (1 - seg(t, TL.frac, TL.frac + 0.3)) * a;
    if (mt > 0) {
      const pm = G.P(G.uMid);
      text(g, 'microscopic,', 80, 792, MONO(30), 0.9 * mt);
      text(g, 'not visible', 80, 828, MONO(30), 0.9 * mt);
      text(g, 'clinically', 80, 864, MONO(30), 0.9 * mt);
      const sx0 = 236, sy0 = 764, dx = sx0 - pm.x, dy = sy0 - pm.y, dl = Math.hypot(dx, dy);
      const ex = pm.x + (dx / dl) * 56, ey = pm.y + (dy / dl) * 56;
      line(g, sx0, sy0, ex, ey, 0.5 * mt, 1.8);
    }

    // section cut at the curve midpoint (dashed, with end ticks)
    const cutA = seg(t, TL.secOn - 0.3, TL.secOn + 0.3) * a;
    if (cutA > 0) {
      const pm = G.P(G.uMid), e = G.rw(G.uMid) + 14, c0 = G.cw(G.uMid) + 6;
      g.setLineDash([10, 8]);
      line(g, pm.x + pm.nx * c0, pm.y + pm.ny * c0, pm.x + pm.nx * e, pm.y + pm.ny * e, 0.45 * cutA, 2);
      line(g, pm.x - pm.nx * c0, pm.y - pm.ny * c0, pm.x - pm.nx * e, pm.y - pm.ny * e, 0.45 * cutA, 2);
      g.setLineDash([]);
      for (const sd of [1, -1]) {
        const bx = pm.x + pm.nx * e * sd, by = pm.y + pm.ny * e * sd;
        line(g, bx - pm.tx * 9, by - pm.ty * 9, bx + pm.tx * 9, by + pm.ty * 9, 0.7 * cutA, 2.5);
      }
    }

    // TENSION / COMPRESSION tags beside the curve (scene 1–2); the passive side stays legible
    const tagA = seg(t, TL.secOn, TL.secOn + 0.5) * (1 - seg(t, TL.dimOn - 0.3, TL.dimOn + 0.1)) * a;
    if (tagA > 0) {
      const pm = G.P(G.uMid), c = Math.cos(TAU * phiAt(t));
      const off = G.rw(G.uMid) + 60;
      const To = [pm.x + pm.nx * off, pm.y + pm.ny * off], Co = [pm.x - pm.nx * off, pm.y - pm.ny * off];
      const iT = 0.62 + 0.55 * Math.max(0, c), iC = 0.62 + 0.55 * Math.max(0, -c);
      text(g, 'TENSION +', To[0] + 20, To[1] + 30, MONO(32), iT * tagA, 'right');
      text(g, 'STRETCHED', To[0] + 20, To[1] + 66, MONO(30), 0.8 * iT * tagA, 'right');
      text(g, '− COMPRESSION', Co[0] - 6, Co[1] - 36, MONO(32), iC * tagA, 'left');
      text(g, 'SQUEEZED', Co[0] - 6, Co[1], MONO(30), 0.8 * iC * tagA, 'left');
    }

    // R and d dimension call-outs + plain-word definitions (scene 3)
    const dimA = seg(t, TL.dimOn, TL.dimOn + 0.5) * (1 - seg(t, TL.dimOff - 0.3, TL.dimOff)) * a;
    if (dimA > 0) {
      const C = G.C;
      const rActive = seg(t, TL.R0 - 0.1, TL.R0) * (1 - seg(t, TL.R1 + 0.2, TL.R1 + 0.5));
      const dActive = seg(t, TL.d0 - 0.1, TL.d0) * (1 - seg(t, TL.d1 + 0.2, TL.d1 + 0.5));
      // centre cross
      line(g, C.x - 12, C.y, C.x + 12, C.y, 0.9 * dimA, 2.5); line(g, C.x, C.y - 12, C.x, C.y + 12, 0.9 * dimA, 2.5);
      // dotted circle of curvature (partial)
      g.setLineDash([3, 9]); g.strokeStyle = pc(0.32 * dimA); g.lineWidth = 2; g.beginPath(); g.arc(C.x, C.y, G.Rp, Math.PI * 0.62, Math.PI * 1.16); g.stroke(); g.setLineDash([]);
      // radius line to the file / canal centreline (R is the radius of the file's axis)
      const uR = G.Ls + G.Larc * 0.82, pR = G.P(uR);
      const tip = [pR.x, pR.y];
      line(g, C.x, C.y, tip[0], tip[1], 1.0 * dimA, 3);
      const ang = Math.atan2(tip[1] - C.y, tip[0] - C.x);
      g.fillStyle = pc(1.0 * dimA); g.beginPath(); g.moveTo(tip[0], tip[1]);
      g.lineTo(tip[0] - Math.cos(ang - 0.35) * 18, tip[1] - Math.sin(ang - 0.35) * 18); g.lineTo(tip[0] - Math.cos(ang + 0.35) * 18, tip[1] - Math.sin(ang + 0.35) * 18); g.closePath(); g.fill();
      dot(g, tip[0], tip[1], 3.5, 1.1 * dimA);
      // labels
      rich(g, 'R ' + G.R.toFixed(1) + ' mm', C.x + 22, C.y - 18, 52, (0.85 + 0.35 * rActive) * dimA);
      // d: dimension bracket across the file just coronal of the curve
      const ud = G.uMid - 70, p = G.P(ud), hw = G.hwF(G.tipU - ud);
      const ox = p.nx, oy = p.ny;
      const A1 = [p.x + ox * hw, p.y + oy * hw], A2 = [p.x - ox * hw, p.y - oy * hw];
      const ext = 36;
      line(g, A1[0], A1[1], A1[0] + ox * ext, A1[1] + oy * ext, 0.5 * dimA, 1.5);
      const bI = (0.8 + 0.2 * dActive) * dimA;
      line(g, A1[0] + p.tx * -14, A1[1] + p.ty * -14, A2[0] + p.tx * -14, A2[1] + p.ty * -14, bI, 2.5);
      line(g, A1[0] + p.tx * -8, A1[1] + p.ty * -8, A1[0] + p.tx * -28, A1[1] + p.ty * -28, bI, 2.5);
      line(g, A2[0] + p.tx * -8, A2[1] + p.ty * -8, A2[0] + p.tx * -28, A2[1] + p.ty * -28, bI, 2.5);
      rich(g, 'd ' + G.d.toFixed(2) + ' mm', A1[0] + ox * ext - 4, A1[1] + oy * ext + 16, 46, (0.85 + 0.35 * dActive) * dimA, { align: 'right' });
      // definitions (in the space the old ε-vs-R plot used)
      text(g, 'R = radius of curvature', 604, 826, MONO(30), (0.8 + 0.3 * rActive) * dimA);
      text(g, 'd = file Ø at the curve', 604, 866, MONO(30), (0.8 + 0.3 * dActive) * dimA);
    }

    // speed / state tag (top-left)
    const tg = seg(t, TL.rot0, TL.rot0 + 0.4) * a;
    if (tg > 0) {
      if (t < TL.acc0 + 0.1) rich(g, '▶ SLOW-MO', 452, 538, 40, 0.8 * tg);
      else if (t < TL.frac) tag(g, '▶▶ FAST-FWD', 466, 538, 40, 1.1 * tg);
      else tag(g, '■ SEPARATED', 466, 538, 40, 1.15 * tg);
    }
    // cyclic vs torsional note (after fracture)
    const tn = seg(t, TL.frac + 0.9, TL.frac + 1.4) * a;
    if (tn > 0) {
      text(g, 'no unwinding first,', 84, 868, MONO(36), 0.9 * tn);
      text(g, 'unlike many torsional failures', 84, 910, MONO(36), 0.9 * tn);
    }
    // fine print
    const fp = seg(t, 1.0, 1.6) * a;
    if (fp > 0) text(g, 'schematic · not to scale', 84, DA.y + DA.h - 18, MONO(24), 0.45 * fp);
  }

  function jag(g, p, hw, I, seed) {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const f = i / 6, o = hw - 2 * hw * f, j = (i === 0 || i === 6) ? 0 : (Kit.hash(i, 11 + seed) - 0.5) * 8;
      pts.push([p.x + p.nx * o + p.tx * j, p.y + p.ny * o + p.ty * j]);
    }
    poly(g, pts, I, 2.6);
  }

  // ---------------------------------------------------------------- section inset (T/C → fractography)
  const DIMPLES = (() => { const r = Kit.rng(1717); const out = []; for (let i = 0; i < 400 && out.length < 120; i++) { const a = r() * TAU, rad = Math.sqrt(r()); out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, s: 0.02 + r() * 0.028, k: r() }); } return out; })();
  // inset orientation: in the T/C view the tension side faces the outer normal at mid-curve (as in the canal);
  // during the morph it turns a further 30° so the fracture origin sits on the left, next to its labels
  const ROT_TC = Math.atan2(Math.sin(GEO.A / 2), -Math.cos(GEO.A / 2)) + Math.PI / 2;
  const ROT_FR = Math.PI * 1.5;
  function drawSection(g, t, G, a) {
    const app = seg(t, TL.secOn, TL.secOn + 0.6, ease.out) * a;
    if (app <= 0) return;
    const m = seg(t, TL.morph0, TL.morph1, ease.inOut);
    const mv = seg(t, TL.mv0, TL.mv1, ease.inOut);                 // scene B (big, centred) → scene C (smaller, top)
    const cx = lerp(836, 832, m), cy = lerp(lerp(724, 636, mv), 660, m), r = lerp(lerp(106, 86, mv), 125, m) * lerp(0.6, 1, app);
    const rot = lerp(ROT_TC, ROT_FR, m), cs = Math.cos(rot), sn = Math.sin(rot);
    const S = (lx, ly) => [cx + lx * cs - ly * sn, cy + lx * sn + ly * cs];   // inset-local → screen
    const ph = phiAt(Math.min(t, TL.frac));
    // title (gone before the fractography labels arrive)
    const tA = (1 - seg(t, TL.morph0, TL.morph0 + 0.25)) * app;
    if (tA > 0) text(g, 'SECTION AT CURVE', cx, cy - r - 26, MONO(30), 0.8 * tA, 'center');
    // outline
    g.strokeStyle = pc(0.95 * app); g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();

    // --- T/C state
    const sA = (1 - m) * app;
    if (sA > 0) {
      // dashed leader: section cut (inner-side tick) → inset (scene 2 only)
      const lk = sA * (1 - seg(t, TL.dimOn - 0.4, TL.dimOn));
      if (lk > 0) {
        const pm = G.P(G.uMid), e = G.rw(G.uMid) + 24;
        g.setLineDash([6, 6]); line(g, pm.x - pm.nx * e, pm.y - pm.ny * e, cx - r - 10, cy, 0.35 * lk, 2); g.setLineDash([]);
      }
      g.save(); g.beginPath(); g.arc(cx, cy, r - 3, 0, TAU); g.clip();
      g.translate(cx, cy); g.rotate(rot);
      for (let y = -r + 10; y < r; y += 12) {
        const f = -y / r;                            // +1 tension side … −1 compression side
        if (Math.abs(f) < 0.06) continue;
        g.setLineDash(f > 0 ? [] : [6, 6]);
        line(g, -r, y, r, y, (0.08 + 0.32 * Math.abs(f)) * sA, 2);
      }
      g.setLineDash([]);
      g.restore();
      g.save(); g.translate(cx, cy); g.rotate(rot);
      g.setLineDash([8, 6]); line(g, -r - 14, 0, r + 14, 0, 0.55 * sA, 2); g.setLineDash([]);
      g.restore();
      const pT = S(0, -0.45 * r), pC = S(0, 0.45 * r), p0 = S(-(r + 30), 0);
      const c56 = capH(VT(56)), c36 = capH(VT(36));
      text(g, 'T', pT[0], pT[1] + c56 / 2, VT(56), 0.9 * sA, 'center');
      text(g, 'C', pC[0], pC[1] + c56 / 2, VT(56), 0.9 * sA, 'center');
      text(g, '0', p0[0], p0[1] + c36 / 2, VT(36), 0.6 * sA, 'center');
      // rotating marker + persistence arc (local angle 0 = tension side, clockwise)
      const ang = TAU * ph;
      const K = 22, win = 0.32;
      for (let i = 0; i < K; i++) {
        const t1 = t - (i / K) * win, t2 = t - ((i + 1) / K) * win;
        if (t2 < TL.rot0 - 0.5) break;
        const a1 = TAU * phiAt(t1) - Math.PI / 2 + rot, a2 = TAU * phiAt(t2) - Math.PI / 2 + rot;
        if (a1 - a2 > TAU) { g.strokeStyle = pc(0.5 * (1 - i / K) * sA); g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); break; }
        g.strokeStyle = pc(0.9 * (1 - i / K) * sA); g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r, a2, a1); g.stroke();
      }
      const [mx, my] = S(Math.sin(ang) * r, -Math.cos(ang) * r);
      line(g, cx, cy, mx, my, 0.35 * sA, 2);
      dot(g, mx, my, 9, 1.35 * sA);
    }

    // --- fractography state (schematic). At high strain the critical fatigue-crack extent is small, so the
    // striated zone is a peripheral crescent and most of the face is dimpled overload (Cheung & Darvell 2007, 2008).
    const fA = m * app;
    if (fA > 0) {
      const [Ox, Oy] = S(0, -r);
      const inw = rot + Math.PI / 2;               // direction from the origin into the section
      const aMax = 0.42 * r;
      const crack = crackAt(t);
      const aNow = aMax * crack;
      g.save(); g.beginPath(); g.arc(cx, cy, r - 2, 0, TAU); g.clip();
      if (aNow > 2) { g.fillStyle = pc(0.08 * fA); g.beginPath(); g.arc(Ox, Oy, aNow, 0, TAU); g.fill(); }
      // river marks
      for (let k = 0; k < 7; k++) {
        const an = inw + (k / 6 - 0.5) * Math.PI * 0.7;
        line(g, Ox, Oy, Ox + Math.cos(an) * aNow, Oy + Math.sin(an) * aNow, 0.16 * fA, 1.5);
      }
      // striations (spacing widens as the crack grows)
      const n = 11;
      for (let k = 1; k <= n; k++) {
        const rk = aMax * Math.pow(k / n, 1.35);
        if (rk > aNow) break;
        g.strokeStyle = pc(0.45 * fA); g.lineWidth = 1.6; g.beginPath(); g.arc(Ox, Oy, rk, inw - Math.PI / 2, inw + Math.PI / 2); g.stroke();
      }
      if (aNow > 2 && t < TL.frac) { g.strokeStyle = pc(1.25 * fA); g.lineWidth = 3; g.beginPath(); g.arc(Ox, Oy, aNow, inw - Math.PI / 2, inw + Math.PI / 2); g.stroke(); }
      // overload dimples after fracture
      if (t >= TL.frac) {
        g.strokeStyle = pc(1.0 * fA); g.lineWidth = 3; g.beginPath(); g.arc(Ox, Oy, aMax, inw - Math.PI / 2, inw + Math.PI / 2); g.stroke();
        for (const d of DIMPLES) {
          const x = cx + d.x * (r - 8), y = cy + d.y * (r - 8);
          if (Math.hypot(x - Ox, y - Oy) < aMax + 8) continue;
          const k = seg(t, TL.frac + 0.05 + d.k * 0.45, TL.frac + 0.2 + d.k * 0.45);
          if (k <= 0) continue;
          g.strokeStyle = pc(0.6 * k * fA); g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, d.s * r * k, 0, TAU); g.stroke();
        }
      }
      g.restore();
      // surface-flaw notch at the origin (points into the section)
      const ux = Math.cos(inw), uy = Math.sin(inw);
      g.fillStyle = pc(1.2 * fA); g.beginPath();
      g.moveTo(Ox - ux * 3 - uy * 10, Oy - uy * 3 + ux * 10); g.lineTo(Ox + ux * 12, Oy + uy * 12); g.lineTo(Ox - ux * 3 + uy * 10, Oy - uy * 3 - ux * 10); g.closePath(); g.fill();
      // labels (left of the inset, each with a leader); they arrive after the old title has gone
      const lb = seg(t, TL.morph0 + 0.4, TL.morph1) * app;
      if (lb > 0) {
        const lx = Ox - 56;
        text(g, 'ORIGIN:', lx, Oy - 6, MONO(30), 0.95 * lb, 'right');
        text(g, 'SURFACE FLAW', lx, Oy + 28, MONO(30), 0.95 * lb, 'right');
        line(g, lx + 10, Oy + 1, Ox - 9, Oy, 0.55 * lb, 1.8); dot(g, Ox - 9, Oy, 3.5, 0.9 * lb);
      }
      const sl = clamp((crack - 0.3) / 0.12) * fA;
      if (sl > 0) {
        const tx = Ox - 17, ty = Oy - 66;
        text(g, 'STRIATIONS', tx, ty, MONO(30), 0.9 * sl, 'right');
        const rr0 = Math.min(0.42 * aMax, 0.75 * aNow);
        const px = Ox + Math.cos(inw - 0.75) * rr0, py = Oy + Math.sin(inw - 0.75) * rr0;
        line(g, tx + 8, ty - 8, px, py, 0.45 * sl, 1.8); dot(g, px, py, 3.5, 0.8 * sl);
      }
      const ol = seg(t, TL.frac + 0.35, TL.frac + 0.8) * fA;
      if (ol > 0) {
        const tx = Ox - 17, ty = Oy + 84;
        text(g, 'OVERLOAD', tx, ty, MONO(30), 0.9 * ol, 'right');
        const px = cx + r * 0.05, py = cy + r * 0.62;
        line(g, tx + 8, ty - 9, px, py, 0.45 * ol, 1.8); dot(g, px, py, 3.5, 0.8 * ol);
      }
    }
  }

  // ---------------------------------------------------------------- fatigue-life meter (toy)
  function drawLife(g, t, a) {
    const A = seg(t, TL.life0, TL.life0 + 0.5) * a;
    if (A <= 0) return;
    const D = lifeAt(t);
    const x = 690, y = 888, w = 190, h = 30;
    text(g, 'FATIGUE LIFE USED', x, y - 16, MONO(30), 0.85 * A);
    rr(g, x, y, w, h, 3); g.strokeStyle = pc(0.6 * A); g.lineWidth = 2; g.stroke();
    const nSeg = 14, sw = (w - 8) / nSeg;
    for (let i = 0; i < nSeg; i++) {
      const f = clamp(D * nSeg - i);
      if (f <= 0) break;
      g.fillStyle = pc((0.55 + 0.6 * (i / nSeg)) * A * f); g.fillRect(x + 4 + i * sw + 1, y + 5, sw - 3, h - 10);
    }
    const pct = Math.round(D * 100);
    if (t >= TL.frac) tag(g, '100%', x + w + 58, y + 26, 44, 1.15 * A, { align: 'center' });
    else text(g, pct + '%', x + w + 96, y + 27, VT(48), 1.0 * A, 'right');
    text(g, 'toy model', x, y + h + 30, MONO(24), 0.45 * A);
  }

  // ---------------------------------------------------------------- display B: strain trace
  const TS = 2.0, SWEEP0 = 0.55;
  function drawGraticule(g, a) {
    for (let i = 0; i <= 10; i++) { const x = GB.x + i * 80; g.setLineDash(i === 0 || i === 10 ? [] : [2, 6]); line(g, x, GB.y, x, GB.y + GB.h, (i === 0 || i === 10 ? 0.35 : 0.2) * a, 1.5); }
    for (let j = 0; j <= 4; j++) { const y = GB.y + j * 80; g.setLineDash(j === 0 || j === 4 ? [] : [2, 6]); line(g, GB.x, y, GB.x + GB.w, y, (j === 0 || j === 4 ? 0.35 : 0.2) * a, 1.5); }
    g.setLineDash([]);
    line(g, GB.x, YC, GB.x + GB.w, YC, 0.3 * a, 1.5);
    for (let k = 0; k <= 50; k++) { const x = GB.x + k * 16; const l = k % 5 === 0 ? 9 : 5; line(g, x, YC - l, x, YC + l, 0.32 * a, 1.5); }
    for (let k = 0; k <= 20; k++) { const y = GB.y + k * 16; const l = k % 5 === 0 ? 9 : 5; line(g, GB.x + 400 - l, y, GB.x + 400 + l, y, 0.32 * a, 1.5); }
  }
  function drawTrace(g, t, a) {
    if (t < SWEEP0) return;
    const ncol = 400, step = GB.w / ncol;
    const xb = (((t - SWEEP0) / TS) % 1) * GB.w;
    let prev = null, prevBack = 0;
    for (let c = 0; c <= ncol; c++) {
      const x = c * step;
      let back = xb - x; if (back < 0) back += GB.w;
      const tau = t - (back / GB.w) * TS;
      if (tau < SWEEP0) { prev = null; continue; }
      const age = t - tau;
      const I = Math.exp(-age / 1.1) * a;
      const w = tau < TL.frac ? wAt(tau) : 0;
      const cpc = (w * TS) / ncol;
      const mBand = clamp((cpc - 0.12) / 0.38);
      const X = GB.x + x;
      // band (dense oscillation paints the envelope)
      if (mBand > 0) {
        const e = epsAt(tau) * STRAIN_PX;
        line(g, X, YC - e, X, YC + e, 0.012 * I * mBand, step + 0.6);
        dot(g, X, YC - e, 2.2, 0.45 * I * mBand); dot(g, X, YC + e, 2.2, 0.45 * I * mBand);
      }
      // waveform with sub-column sampling
      const sub = clamp(Math.ceil(cpc * 26), 1, 14);
      const pts = [];
      if (prev && Math.abs(back - prevBack) < step * 2) pts.push(prev);
      for (let k = 0; k < sub; k++) {
        const tt = tau - ((sub - 1 - k) / sub) * (step / GB.w) * TS;
        const xx = X - ((sub - 1 - k) / sub) * step;
        pts.push([xx, YC - strainAt(tt) * STRAIN_PX]);
      }
      if (pts.length > 1) poly(g, pts, lerp(1.05, 0.1, mBand) * I, lerp(3, 1.1, mBand));
      prev = pts[pts.length - 1]; prevBack = back;
    }
    // beam head
    const s = strainAt(t);
    const w = t < TL.frac ? wAt(t) : 0;
    const mB = clamp(((w * TS) / ncol - 0.12) / 0.38);
    const hx = GB.x + xb;
    if (mB < 1) dot(g, hx, YC - s * STRAIN_PX, 6, 1.4 * a);
    if (mB > 0) { const e = epsAt(t) * STRAIN_PX; line(g, hx, YC - e, hx, YC + e, 0.9 * mB * a, 3); }
  }
  function drawDisplayB(g, t, a) {
    frameBox(g, DB, 0.26 * a);
    drawGraticule(g, a);
    // header
    tag(g, 'CH1', 96, 1020, 40, 1.0 * a);
    text(g, 'STRAIN  4%/div', 164, 1018, MONO(30), 0.8 * a);
    const N = Math.floor(phiAt(Math.min(t, TL.frac)));
    text(g, 'CYCLES', 742, 1018, MONO(30), 0.6 * a, 'right');
    text(g, String(N).padStart(6, '0'), 1000, 1022, VT(60), 1.0 * a, 'right');
    // margin labels
    text(g, 'T+', 126, YC - 80 + 14, VT(48), 0.85 * a, 'center');
    text(g, '0', 126, YC + 14, VT(44), 0.55 * a, 'center');
    text(g, 'C−', 126, YC + 80 + 14, VT(48), 0.85 * a, 'center');
    g.save(); g.beginPath(); g.rect(GB.x - 4, GB.y - 2, GB.w + 8, GB.h + 4); g.clip();
    drawTrace(g, t, a);
    g.restore();
    // fracture marker + its qualifier; the band behind is cleared so nothing pierces the tag
    const fa = seg(t, TL.frac + 0.05, TL.frac + 0.25) * a;
    if (fa > 0) {
      const s = 'FRACTURE AT N = ' + N_FRAC + '*', font = VT(54), ch = capH(font);
      const w = rich(g, s, 0, 0, 54, 1, { font, measure: true });
      const xc = GB.x + GB.w / 2, y = GB.y + 66, padX = ch * 0.45, padY = ch * 0.38;
      g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = `rgba(0,0,0,${clamp(fa).toFixed(3)})`;
      g.fillRect(xc - w / 2 - padX - 8, y - ch - padY - 8, w + 2 * padX + 16, ch + 2 * padY + 52); g.restore();
      tag(g, s, xc, y, 54, 1.25 * fa, { align: 'center' });
      text(g, '*toy model · values illustrative', xc, y + padY + 34, MONO(26), 0.62 * fa, 'center');
    }
    // fine print
    text(g, 'values illustrative', GB.x + GB.w - 6, GB.y + GB.h - 12, MONO(24), 0.42 * a, 'right');
  }

  // ---------------------------------------------------------------- formula panel
  function knob(g, x, y, r, v, I) {
    g.strokeStyle = pc(0.75 * I); g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
    for (let k = 0; k <= 8; k++) { const aa = -3.93 + (k / 8) * 4.71; line(g, x + Math.cos(aa) * (r + 5), y + Math.sin(aa) * (r + 5), x + Math.cos(aa) * (r + 10), y + Math.sin(aa) * (r + 10), 0.4 * I, 2); }
    const aa = -3.93 + clamp(v) * 4.71;
    line(g, x, y, x + Math.cos(aa) * (r - 4), y + Math.sin(aa) * (r - 4), 1.1 * I, 3.5);
  }
  function drawFormula(g, t, a) {
    frameBox(g, FP, 0.26 * a);
    const R = Rmm(t), d = Dmm(t), e = d / (2 * R);
    const fm = seg(t, TL.mv0 + 0.2, TL.mv0 + 0.55);   // formula reveal (types in after label fades)
    const fo = seg(t, TL.mv0, TL.mv0 + 0.18);
    const yy = 1458;
    // left: label → formula
    if (fo < 1) text(g, 'PEAK STRAIN', 92, yy - 6, VT(72), 0.75 * (1 - fo) * a);
    if (fm > 0) {
      const s = 'ε ≈ d / (2R)';
      const n = Math.ceil(s.length * fm);
      rich(g, s.slice(0, n), 92, yy, 104, 1.05 * a);
    }
    // right: live value
    // before the formula: live peak strain, rising as the file bends into the curve
    const big = fm > 0.5 ? '= ' + (e * 100).toFixed(1) + '%' : '± ' + (bendAt(t) * e * 100).toFixed(1) + '%';
    const va = seg(t, 0.6, 1.2) * a;
    const live = seg(t, TL.R0, TL.R0 + 0.2) * (1 - seg(t, TL.d1 + 0.3, TL.d1 + 0.8));
    if (va > 0) text(g, big, 946, yy, VT(104), (1.0 + 0.3 * live) * va, 'right');
    // knobs row
    const ka = seg(t, 1.2, 1.8) * a;
    if (ka > 0) {
      const ky = 1506;
      const rAct = seg(t, TL.R0 - 0.1, TL.R0) * (1 - seg(t, TL.R1 + 0.2, TL.R1 + 0.5));
      const dAct = seg(t, TL.d0 - 0.1, TL.d0) * (1 - seg(t, TL.d1 + 0.2, TL.d1 + 0.5));
      knob(g, 112, ky, 19, (R - 2) / 4, (0.75 + 0.4 * rAct) * ka);
      rich(g, 'R ' + R.toFixed(1) + ' mm', 146, ky + 15, 50, (0.8 + 0.4 * rAct) * ka);
      knob(g, 420, ky, 19, (d - 0.2) / 0.25, (0.75 + 0.4 * dAct) * ka);
      rich(g, 'd ' + d.toFixed(2) + ' mm', 454, ky + 15, 50, (0.8 + 0.4 * dAct) * ka);
      text(g, 'example values', 946, ky + 12, MONO(24), 0.5 * ka, 'right');
    }
  }

  // ---------------------------------------------------------------- frame
  function renderLayer(t) {
    const g = L;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    g.lineJoin = 'round';
    g.textRendering = 'optimizeSpeed';   // no ligatures (terminal look)
    const boot = seg(t, 0.15, 0.9, ease.out);
    const takeDim = 1 - 0.3 * seg(t, TL.take0, TL.take0 + 0.6, ease.inOut);
    INV.length = 0;
    drawStatus(g, t, boot);
    drawCaption(g, t);
    // displays
    const dA = seg(t, 0.25, 0.8) * takeDim;
    frameBox(g, DA, 0.26 * dA);
    drawGridA(g, dA);
    const G = geom(t);
    drawCanal(g, t, G, takeDim);
    drawDisplayA(g, t, G, takeDim);
    drawSection(g, t, G, takeDim);
    drawLife(g, t, takeDim);
    let dB = seg(t, 0.4, 1.0) * takeDim;
    dB *= 1 - 0.45 * seg(t, 7.4, 7.7) * (1 - seg(t, 10.1, 10.4));                 // scene 3: eye goes canal → formula
    dB *= 1 - 0.4 * seg(t, 12.0, 12.4) * (1 - seg(t, TL.frac, TL.frac + 0.3));    // fast-forward: the crack is the focus
    if (dB > 0) drawDisplayB(g, t, dB);
    const dF = seg(t, 0.6, 1.2);
    if (dF > 0) drawFormula(g, t, dF * (0.75 + 0.25 * takeDim));
    drawSource(g, t, boot);
  }

  function render(t) {
    t = clamp(t, 0, DUR);
    renderLayer(t);
    // compose screen
    F.globalCompositeOperation = 'source-over'; F.globalAlpha = 1;
    F.drawImage(SCREEN_BG, 0, 0);
    F.globalCompositeOperation = 'lighter';
    F.drawImage(LAYER, 0, 0);
    b2.clearRect(0, 0, BL2.width, BL2.height); b2.filter = 'blur(3px)'; b2.drawImage(LAYER, 0, 0, BL2.width, BL2.height); b2.filter = 'none';
    b1.clearRect(0, 0, BL1.width, BL1.height); b1.filter = 'blur(4px)'; b1.drawImage(BL2, 0, 0, BL1.width, BL1.height); b1.filter = 'none';
    F.globalAlpha = 0.75; F.drawImage(BL2, 0, 0, W, H);
    F.globalAlpha = 0.9; F.drawImage(BL1, 0, 0, W, H);
    // payoff inverse-video label: solid block + dark letters, painted after the bloom
    F.globalAlpha = 1; F.globalCompositeOperation = 'source-over';
    drawInverseTop(F);
    F.globalCompositeOperation = 'lighter';
    // slow refresh band
    const by = SCR.y - 300 + (((t / 7.2) % 1) * (SCR.h + 300));
    const bg = F.createLinearGradient(0, by, 0, by + 300); bg.addColorStop(0, 'rgba(70,255,140,0)'); bg.addColorStop(0.5, 'rgba(70,255,140,0.022)'); bg.addColorStop(1, 'rgba(70,255,140,0)');
    F.globalAlpha = 1; F.fillStyle = bg; F.fillRect(SCR.x, by, SCR.w, 300);
    F.globalCompositeOperation = 'source-over';
    F.drawImage(SCAN, 0, 0);

    // power on / off squash
    let sy = 1, sx = 1;
    if (t < TL.on) {        // mirror of the power-off: dot → line (0–0.1 s), then the line opens up
      if (t < 0.1) { sy = 0.004; sx = lerp(0.2, 1, ease.out(seg(t, 0, 0.1))); }
      else sy = Math.max(0.004, ease.outQuint(seg(t, 0.1, TL.on)));
    }
    if (t > TL.off0) { sy = Math.max(0.004, 1 - ease.in(seg(t, TL.off0, TL.off1))); sx = 1 - ease.in(seg(t, TL.off1, TL.off2)) * 0.995; }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#010302'; ctx.fillRect(0, 0, W, H);
    const cy = SCR.y + SCR.h / 2, cx = W / 2;
    if (sy >= 1 && sx >= 1) ctx.drawImage(FR, 0, 0);
    else {
      const hh = SCR.h * sy, ww = W * sx;
      ctx.drawImage(FR, 0, SCR.y, W, SCR.h, cx - ww / 2, cy - hh / 2, ww, hh);
      // beam line glow
      ctx.globalCompositeOperation = 'lighter';
      const b = 1 - clamp((sy - 0.004) / 0.12);          // beam line only while (nearly) collapsed
      if (b > 0) {
        const gl = ctx.createLinearGradient(0, cy - 26, 0, cy + 26); gl.addColorStop(0, 'rgba(70,255,140,0)'); gl.addColorStop(0.5, `rgba(120,255,170,${(0.35 * b).toFixed(3)})`); gl.addColorStop(1, 'rgba(70,255,140,0)');
        ctx.fillStyle = gl; ctx.fillRect(cx - ww / 2, cy - 26, ww, 52);
        ctx.fillStyle = `rgba(200,255,220,${(0.75 * b).toFixed(3)})`; ctx.fillRect(cx - ww / 2, cy - 1.5, ww, 3);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.drawImage(BODY, 0, 0);
  }

  window.REEL = {
    title: 'Why NiTi files snap in curves',
    duration: DUR,
    poster: 19.4,
    canvas,
    fonts: ['400 100px VT323', '400 30px "Share Tech Mono"', '500 80px "JetBrains Mono"'],
    async setup() { buildStatic(); F.textRendering = 'optimizeSpeed'; },
    render,
  };
  Kit.boot(window.REEL);
})();
