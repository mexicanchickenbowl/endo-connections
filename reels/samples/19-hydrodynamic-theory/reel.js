/*
 * Sample 19 — Hydrodynamic theory of dentine sensitivity.
 * Style: POWERS-OF-TEN ZOOM, soft watercolour / organic rendering (Fraunces + Inter, warm paper, bokeh).
 * One continuous camera move (no cuts): whole premolar → exposed cervical root dentine → inner dentine →
 * one dentinal tubule, its odontoblast process and an A-fibre ending at the pulp–dentine border → back out.
 * A live scale bar is computed from the camera scale (µm per px) every frame.
 * render(t) is a pure function of t (no clocks, no Math.random). Plates are painted once in setup().
 */
(() => {
  'use strict';
  const { canvas, ctx } = Kit.createCanvas();
  const { W, H, clamp, lerp, seg, ease, rng, hash, noise1 } = Kit;
  const env = Kit.env;
  let P, G, C; // set in setup (window.WC)

  // ------------------------------------------------------------------ type
  const SERIF = 'Fraunces, "DejaVu Serif", serif';
  const SANS = 'Inter, "DejaVu Sans", sans-serif';
  const F = (w, s, fam = SERIF, it = '') => `${it ? 'italic ' : ''}${w} ${s}px ${fam}`;
  const INK = '#2c2738', INK2 = '#5b5468', COLDINK = '#23679b', GOLDINK = '#9a6a12', CREAM = '#f7f0e4';

  // ------------------------------------------------------------------ timeline (s)
  const DUR = 24;
  // strictly sequential caption slots (0.2 s fades); each caption stays fully visible ≥ Kit.readSecs(text)
  const FADE = 0.2;
  const T = {
    title: [0, 3.4],                  // full 0–3.2     (7 words → 2.92 s)
    glass: [0, 0.3], pour: [0.12, 0.66], splash: 0.66, frost: 0.66, tail: [1.45, 2.05], glassOut: [1.95, 2.55],
    zap: [1.12, 1.82],
    exposed: [1.1, 3.6],              // full 1.35–3.35 (4 → 2.0)
    capA: [4.9, 8.2],                 // full 5.1–8.0   (6 → 2.62)
    labels: [8.6, 12.55], nerveLab: [8.6, 15.05],
    capB: [9.4, 12.75],               // full 9.6–12.55 (7 → 2.92)
    fire0: 12.7,                      // the nerve only fires in the pain beat
    capC: [12.75, 15.85],             // full 12.95–15.65 (6 → 2.62)
    strip: [12.7, 20.65],
    push1: [9.4, 12.5], push2: [12.5, 15.0], pan: [15.0, 15.9],
    capD: [15.85, 20.65],             // full 16.05–20.45 (+ live card)
    occl: [16.5, 17.7], b16: [17.6, 17.8],  // '½ radius → 1/16 the flow' full 17.8–20.45 (6 → 2.62)
    take: [20.65, DUR + 1],           // full 20.85–23.75 (6 → 2.62)
    takeFine: [21.0, 23.75],
    pull: [20.65, 22.9],              // static payoff 22.9–24.0
    seal: [22.15, 22.8],
  };

  // ------------------------------------------------------------------ camera (log-scale zoom)
  // The camera is (zoom z, roll th, world anchor A, screen point Q): A is drawn at Q, so the zoom is centred on A.
  const S0 = 0.068, Z0 = Math.log10(S0), Z1 = Math.log10(64), Z2 = Math.log10(S0 * 1450);
  let zIn, zTub, FS0, BEAD;
  const FS1 = { x: 540, y: 880 }, PANQ = { x: 300, y: 880 }, QB = { x: 484, y: 1000 };
  function cam(t) {
    let th = (Math.PI / 2) * seg(t, 3.5, 6.4, ease.inOut), A = { x: 0, y: 0 };
    const fu = seg(t, 2.4, 6.4, ease.inOut);
    let Q = { x: lerp(FS0.x, FS1.x, fu), y: lerp(FS0.y, FS1.y, fu) };
    let z = t < 8.7 ? zIn(t) : zTub(t);
    const p = seg(t, T.pan[0], T.pan[1], ease.inOut);
    Q = { x: lerp(Q.x, PANQ.x, p), y: lerp(Q.y, PANQ.y, p) };
    const w = seg(t, T.push2[0], T.push2[1], ease.inOut) * (1 - p); // push centred on the outermost bead of the ending
    if (w > 0) { A = { x: BEAD.x * w, y: BEAD.y * w }; Q = { x: lerp(Q.x, QB.x, w), y: lerp(Q.y, QB.y, w) }; }
    const u = seg(t, T.pull[0], T.pull[1], ease.inOut);
    if (u > 0) {
      z = lerp(zTub(T.pull[0]), Z0, u);
      th = (Math.PI / 2) * (1 - seg(u, 0.4, 0.9, ease.inOut));
      const b = seg(u, 0.35, 1.0, ease.inOut);
      Q = { x: lerp(lerp(PANQ.x, FS1.x, seg(u, 0, 0.35, ease.inOut)), FS0.x, b), y: lerp(PANQ.y, FS0.y, b) };
    }
    const s = Math.pow(10, z), cs = Math.cos(th), sn = Math.sin(th);
    return { fs: { x: Q.x - s * (cs * A.x - sn * A.y), y: Q.y - s * (sn * A.x + cs * A.y) }, z, s, th, cs, sn };
  }
  const W2S = (c, wx, wy) => ({ x: c.fs.x + c.s * (c.cs * wx - c.sn * wy), y: c.fs.y + c.s * (c.sn * wx + c.cs * wy) });
  const setWorld = (c) => ctx.setTransform(c.s * c.cs, c.s * c.sn, -c.s * c.sn, c.s * c.cs, c.fs.x, c.fs.y);
  const resetT = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

  // ------------------------------------------------------------------ flow model (schematic) → displacement tables
  const coldOn = (t) => seg(t, 9.8, 10.4, ease.out) * (1 - seg(t, 20.6, 21.0));
  const occl = (t) => 1 - 0.5 * seg(t, T.occl[0], T.occl[1], ease.inOut);           // relative tubule radius r/r0
  const vel = (t) => (0.25 + 9.0 * coldOn(t) * (1 + 0.06 * Math.sin(t * 5.3))) * Math.pow(occl(t), 4); // µm/s (display, not to scale)
  const DT = 1 / 240, NT = Math.ceil((DUR + 1) / DT) + 2;
  let DISP, BEND, CDISP, SPIKES = [], LAST_SPIKE = 0;
  const tab = (A, t) => { const f = clamp(t / DT, 0, NT - 2), i = Math.floor(f), u = f - i; return A[i] * (1 - u) + A[i + 1] * u; };
  function buildFlow() {
    DISP = new Float64Array(NT); BEND = new Float64Array(NT); CDISP = new Float64Array(NT);
    let d = 0, b = 0, ph = 0.62, cd = 0, n = 0;
    for (let i = 0; i < NT; i++) {
      const t = i * DT, v = vel(t);
      DISP[i] = d; d += v * DT;
      CDISP[i] = cd; cd += (t > 15.6 ? Math.pow(occl(t), 4) : 0) * DT;
      b += (clamp((v - 0.8) / 7) - b) * (1 - Math.exp(-DT / 0.42)); BEND[i] = b;
      // toy model: discharge rate rises with the flow-driven tug on the ending (A&M 2000: discharge ∝ flow)
      if (t > T.fire0 && t < 20.6) { ph += Math.max(0, b - 0.55) * 7.6 * DT; if (ph >= 1 + 0.42 * (hash(n, 77) - 0.5)) { SPIKES.push(t); ph = 0; n++; } }
    }
    LAST_SPIKE = SPIKES.length ? SPIKES[SPIKES.length - 1] : 0;
  }

  // ------------------------------------------------------------------ assets built in setup
  let A, B, B2, Cc, D, PAPER, VIG, ATMO, BOKEH_W, BOKEH_C, GLOW_G, GLOW_W;
  let CARD = {}, PARTS, BOK, CPARTS, NPATH, ZB, ZAP, FROST, SEAL, TUBE;
  let XMIN = -16.5, XMAX = 14.6, SPAN = 31.1;

  function atmosphere() {
    const c = P.canvas(W, H), x = c.getContext('2d');
    x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
    P.wash(x, P.blob(220, 380, 520, 380, 20, 3, 0.25), '#f6dcc4', { seed: 901, v: 0.06, layers: 8, a: 0.12 });
    P.wash(x, P.blob(900, 1650, 560, 420, 20, 4, 0.25), '#d9e3ea', { seed: 902, v: 0.06, layers: 8, a: 0.12 });
    P.wash(x, P.blob(980, 520, 300, 260, 18, 5, 0.25), '#efe0ec', { seed: 903, v: 0.06, layers: 6, a: 0.08 });
    return c;
  }

  function buildParticles() {
    const r = rng(77);
    PARTS = [];
    for (let i = 0; i < 84; i++) {
      const lane = i % 3;
      PARTS.push({ lane, j: r(), x0: r() * 40, f: [0.72, 1.0, 0.82][lane] * (0.85 + 0.3 * r()), sz: 0.075 + 0.04 * r() });
    }
    // out-of-focus particles in neighbouring tubules (bokeh)
    BOK = [];
    for (let i = 0; i < 14; i++) BOK.push({ k: [-2, -1, 1, 2][i % 4], j: r() - 0.5, x0: r() * 40, f: 0.6 + 0.5 * r(), sz: 0.38 + 0.3 * r() });
    // tracer particles in the Poiseuille card's tube (laminar profile)
    CPARTS = [];
    for (let i = 0; i < 18; i++) CPARTS.push({ yf: -0.8 + 1.6 * ((i + 0.5 * r()) / 18), x0: r(), sz: 5 + 2.5 * r() });
  }

  // nerve fibril path (world µm): from the pulp, between odontoblasts, into the predentine beside the process
  function buildNervePath() {
    const pts = G.focalFibre.filter((p) => p.x < 40).map((p) => ({ x: G.wallX(p.y) + p.x, y: p.y }));
    pts.reverse(); // index 0 is the tip
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    NPATH = { pts, L, total: L[L.length - 1] };
  }
  const nerveAt = (s) => { // point at arc length s from the tip
    const { pts, L } = NPATH; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const u = clamp((s - L[i - 1]) / (L[i] - L[i - 1] || 1)); return { x: lerp(pts[i - 1].x, pts[i].x, u), y: lerp(pts[i - 1].y, pts[i].y, u) };
  };

  // hook geometry (world µm): zap path, frost film, seal coating
  function buildHookGeometry() {
    const AX = G.AX, yz = -200;
    const nerveX = (y) => { const half = (G.pulpR(y) - G.pulpL(y)) / 2; return AX + 0.05 * half * 0.62 + 60 * noise1(y / 900, 63); };
    const pts = [{ x: G.outerL(yz) + 40, y: yz }];
    for (let i = 1; i <= 10; i++) pts.push({ x: lerp(G.outerL(yz) + 40, G.pulpL(yz) + 20, i / 10), y: yz + 30 * Math.sin(i / 10 * Math.PI) });
    for (let i = 1; i <= 6; i++) pts.push({ x: lerp(G.pulpL(yz) + 20, nerveX(yz + 250), i / 6), y: yz + 250 * (i / 6) });
    for (let y = yz + 400; y <= 6200; y += 200) pts.push({ x: nerveX(y), y });
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    ZAP = { pts, L, total: L[L.length - 1] };
    // frost film over the exposed surface (lens-shaped) + its glow
    const film = [], glow = [], film2 = [];
    for (let y = -1480; y <= 1760; y += 40) { film.push({ x: G.outerL(y) + 10, y }); glow.push({ x: G.outerL(y) + 10, y }); }
    for (let y = 1760; y >= -1480; y -= 40) { const b = Math.sin(Math.PI * (y + 1480) / 3240); film.push({ x: G.outerL(y) - 40 - 220 * Math.pow(b, 0.6) * (1 + 0.15 * noise1(y / 300, 2)), y }); glow.push({ x: G.outerL(y) + 60 + 520 * Math.pow(b, 0.8), y }); }
    for (const p of film) film2.push({ x: p.x + 25, y: p.y });
    FROST = { film, glow, film2 };
    // desensitiser seal: a thin varnish / crystal coat over the same exposed surface
    const seal = [], y0 = G.CEJ + 60, y1 = G.gumMarginL + 40;
    for (let y = y0; y <= y1; y += 50) seal.push({ x: G.outerL(y) + 18, y });
    for (let y = y1; y >= y0; y -= 50) { const b = Math.sin(Math.PI * (y - y0) / (y1 - y0)); seal.push({ x: G.outerL(y) - 50 - 190 * Math.pow(b, 0.5), y }); }
    SEAL = seal;
  }

  // Poiseuille card: static painted tube (screen px, relative to the card's top-left)
  const TB = { x0: 47, x1: 407, cy: 190, Rw: 104, R0: 70 };
  function buildTube() {
    const rect = (xa, ya, xb, yb, step = 18) => { const p = []; for (let x = xa; x < xb; x += step) p.push({ x, y: ya }); for (let y = ya; y < yb; y += step) p.push({ x: xb, y }); for (let x = xb; x > xa; x -= step) p.push({ x, y: yb }); for (let y = yb; y > ya; y -= step) p.push({ x: xa, y }); return p; };
    const w = 454 + 120, h = 360, c = P.canvas(w, h), x = c.getContext('2d'), o = 60; // pad 60
    const { x0, x1, cy, Rw, R0 } = TB;
    P.wash(x, rect(o + x0, o + cy - Rw - 60, o + x1, o + cy - R0 - 60), C.dent, { seed: 1301, v: 0.02, bd: 1, ld: 2, layers: 9, a: 0.2 });
    P.wash(x, rect(o + x0, o + cy + R0 - 60, o + x1, o + cy + Rw - 60), C.dent, { seed: 1302, v: 0.02, bd: 1, ld: 2, layers: 9, a: 0.2 });
    P.wash(x, rect(o + x0, o + cy - R0 - 60, o + x1, o + cy + R0 - 60), '#cfe6f0', { seed: 1303, v: 0.015, bd: 1, ld: 2, layers: 7, a: 0.2 });
    P.line(x, [{ x: o + x0, y: o + cy - R0 - 60 }, { x: o + x1, y: o + cy - R0 - 60 }], '#7d5a3a', { w: 2, a: 0.6, passes: 2, seed: 1304 });
    P.line(x, [{ x: o + x0, y: o + cy + R0 - 60 }, { x: o + x1, y: o + cy + R0 - 60 }], '#7d5a3a', { w: 2, a: 0.6, passes: 2, seed: 1305 });
    // tubule wall texture (collagen strokes)
    const r = rng(1306); x.strokeStyle = '#c89a62';
    for (let i = 0; i < 70; i++) { const X = o + x0 + r() * (x1 - x0), side = r() < 0.5 ? -1 : 1, Y = o + cy - 60 + side * (R0 + 4 + r() * (Rw - R0 - 8)); x.globalAlpha = 0.25; x.lineWidth = 1.2; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + 8 + r() * 10, Y + (r() - 0.5) * 4); x.stroke(); }
    x.globalAlpha = 1;
    TUBE = { canvas: c, pad: o, dy: 60 };
  }

  // ------------------------------------------------------------------ drawing: plates
  function drawPlate(pl, c, alpha, bw0 = 0.3, bw1 = 0.72) {
    if (alpha <= 0.002) return;
    const m = c.s / pl.k, lm = Math.log10(m);
    const bw = seg(lm, bw0, bw1);
    const put = (img, k, a) => {
      if (a <= 0.002) return;
      const sc = c.s / k;
      const e = c.fs.x + c.s * (c.cs * pl.ox - c.sn * pl.oy), f = c.fs.y + c.s * (c.sn * pl.ox + c.cs * pl.oy);
      ctx.setTransform(sc * c.cs, sc * c.sn, -sc * c.sn, sc * c.cs, e, f);
      ctx.globalAlpha = a; ctx.drawImage(img, 0, 0);
    };
    if (bw > 0) put(pl.blur.canvas, pl.blur.k, alpha);
    if (bw < 1) put(pl.canvas, pl.k, alpha * (1 - bw));
    resetT(); ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ drawing: hook (glass, pour, ice, splash, frost, zap)
  const bez = (p0, p1, p2, p3, u) => { const v = 1 - u; return { x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x, y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y }; };
  const GH = 236, GB = 66, GM = 88; // glass height, base and mouth half-widths (px)
  function glassPose(t) {
    const gi = seg(t, T.glass[0], T.glass[1], ease.out), go = seg(t, T.glassOut[0], T.glassOut[1], ease.in);
    const M = { x: lerp(lerp(-110, 236, gi), -230, go), y: lerp(lerp(560, 652, gi), 540, go) };
    const al = (Math.PI / 180) * lerp(lerp(70, 106, gi), 80, go);
    return { M, al, cs: Math.cos(al), sn: Math.sin(al), a: seg(t, 0, 0.14) * (1 - seg(t, 2.3, 2.55)) };
  }
  // local glass frame: base centre at (0,0), mouth centre at (0,-GH); screen = M + Rot(al)·(lx, ly + GH)
  const gTo = (g, lx, ly) => ({ x: g.M.x + g.cs * lx - g.sn * (ly + GH), y: g.M.y + g.sn * lx + g.cs * (ly + GH) });
  let GLASS_BODY, GLASS_IN;
  function drawGlass(t) {
    const g = glassPose(t);
    if (g.a <= 0.003) return;
    if (!GLASS_BODY) {
      GLASS_BODY = P.spline([{ x: -GB + 12, y: 0 }, { x: -GB, y: -14 }, { x: -GM, y: -GH }, { x: GM, y: -GH }, { x: GB, y: -14 }, { x: GB - 12, y: 0 }], true, 6);
      GLASS_IN = P.spline([{ x: -GB + 14, y: -22 }, { x: -GM + 9, y: -GH + 2 }, { x: GM - 9, y: -GH + 2 }, { x: GB - 14, y: -22 }], true, 6);
    }
    ctx.save();
    ctx.setTransform(g.cs, g.sn, -g.sn, g.cs, g.M.x - g.sn * GH, g.M.y + g.cs * GH);
    const ga = g.a;
    P.wash(ctx, GLASS_BODY, '#e4f0f5', { seed: 1401, v: 0.008, bd: 1, ld: 2, layers: 4, a: 0.16 * ga, pool: false });
    // the drink: pooled along the lower wall (local +x), surface level in screen space
    ctx.save(); P.path(ctx, GLASS_IN); ctx.clip();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const lvl = g.M.y + 8, liq = [];
    for (let X = g.M.x - 300; X <= g.M.x + 60; X += 30) liq.push({ x: X, y: lvl + 4 * Math.sin(X * 0.05 + t * 6) });
    liq.push({ x: g.M.x + 60, y: lvl + 260 }, { x: g.M.x - 300, y: lvl + 260 });
    P.wash(ctx, liq, C.cold, { seed: 1402, v: 0.01, bd: 1, ld: 1, layers: 5, a: 0.14 * ga });
    ctx.restore();
    for (const [cx, cy, rot, s] of [[22, -GH + 46, 0.4, 34], [44, -GH + 92, -0.3, 30], [-10, -GH + 70, 0.9, 28]]) iceCube(cx, cy, rot, s, 0.85 * ga);
    // glass: thick base, rim ellipse, two vertical highlights
    ctx.globalAlpha = 0.5 * ga; ctx.strokeStyle = '#6f8b9d'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
    P.path(ctx, GLASS_BODY); ctx.stroke();
    ctx.globalAlpha = 0.3 * ga; ctx.fillStyle = '#b9d3e0'; ctx.beginPath(); ctx.ellipse(0, -9, GB - 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.7 * ga; ctx.beginPath(); ctx.ellipse(0, -GH, GM, 12, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.55 * ga; ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round';
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-GB + 20, -34); ctx.quadraticCurveTo(-GM + 24, -GH * 0.5, -GM + 26, -GH + 28); ctx.stroke();
    ctx.lineWidth = 3.5; ctx.globalAlpha = 0.4 * ga; ctx.beginPath(); ctx.moveTo(-GB + 40, -40); ctx.quadraticCurveTo(-GM + 46, -GH * 0.55, -GM + 50, -GH + 60); ctx.stroke();
    ctx.restore();
  }
  function iceCube(cx, cy, rot, s, a) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.globalAlpha = 0.6 * a; ctx.fillStyle = '#eaf7fc'; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.26); ctx.fill();
    ctx.globalAlpha = 0.45 * a; ctx.fillStyle = '#bcdff0'; ctx.beginPath(); ctx.roundRect(-s / 2 + s * 0.2, -s / 2 + s * 0.2, s * 0.8, s * 0.8, s * 0.22); ctx.fill();
    ctx.globalAlpha = 0.55 * a; ctx.strokeStyle = '#4a86b2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.26); ctx.stroke();
    ctx.globalAlpha = 0.8 * a; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-s * 0.17, -s * 0.2, s * 0.17, s * 0.09, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function pourCurve(t, c) {
    const g = glassPose(t), lip = gTo(g, GM - 8, -GH - 2); // lower lip of the tipped mouth
    const dir = { x: g.sn, y: -g.cs }; // mouth direction
    const I = W2S(c, G.outerL(-200) - 30, -200);
    return { p0: lip, p1: { x: lip.x + 70 * dir.x, y: lip.y + 70 * dir.y }, p2: { x: I.x - 26, y: I.y - 230 }, p3: I, I };
  }
  const streamW = (u, t) => lerp(60, 30, Math.pow(u, 0.8)) * (1 + 0.14 * noise1(u * 9 - t * 5, 7));
  function drawPour(t, c) {
    if (t > 2.7) return;
    drawGlass(t);
    const { p0, p1, p2, p3, I } = pourCurve(t, c);
    const head = seg(t, T.pour[0], T.pour[1], ease.in), tail = seg(t, T.tail[0], T.tail[1], ease.inOut);
    const frame = (u) => { const p = bez(p0, p1, p2, p3, u), q = bez(p0, p1, p2, p3, Math.min(1, u + 0.01)), r0 = bez(p0, p1, p2, p3, Math.max(0, u - 0.01)); const dx = q.x - r0.x, dy = q.y - r0.y, l = Math.hypot(dx, dy) || 1; return { p, nx: -dy / l, ny: dx / l, tx: dx / l, ty: dy / l }; };
    if (head > tail + 0.002) {
      const N = 44, Lp = [], Rp = [], Lc = [], Rc = [];
      for (let i = 0; i <= N; i++) {
        const u = lerp(tail, head, i / N), { p, nx, ny } = frame(u);
        const taper = Math.min(1, (i / N) * 8 + (tail > 0 ? 0 : 1)) * (i === N ? 0.8 : 1);
        const w = streamW(u, t) * Math.max(0.35, taper);
        Lp.push({ x: p.x + nx * w / 2, y: p.y + ny * w / 2 }); Rp.push({ x: p.x - nx * w / 2, y: p.y - ny * w / 2 });
        Lc.push({ x: p.x + nx * w * 0.3, y: p.y + ny * w * 0.3 }); Rc.push({ x: p.x - nx * w * 0.05, y: p.y - ny * w * 0.05 });
      }
      ctx.save();
      P.wash(ctx, Lp.concat(Rp.slice().reverse()), C.cold, { seed: 1601, v: 0.03, bd: 1, ld: 2, layers: 6, a: 0.13, pool: false });
      P.wash(ctx, Lc.concat(Rc.slice().reverse()), '#d8f0fb', { seed: 1602, v: 0.03, bd: 1, ld: 1, layers: 3, a: 0.2, pool: false });
      // shadow-side tide line (one soft edge only, so it reads as liquid, not a tube)
      ctx.globalAlpha = 0.28; ctx.strokeStyle = C.cold3; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; P.path(ctx, Rp, false); ctx.stroke();
      // soft glints sliding down the stream
      ctx.globalCompositeOperation = 'screen';
      for (let k = 0; k < 5; k++) {
        const ph = ((k / 5 + t * 1.1) % 1), u = lerp(tail, head, ph);
        const { p, nx, ny, tx, ty } = frame(u), w = streamW(u, t) * 0.18;
        ctx.save(); ctx.translate(p.x + nx * w, p.y + ny * w); ctx.rotate(Math.atan2(ty, tx));
        ctx.globalAlpha = 0.75 * Math.sin(Math.PI * ph); ctx.drawImage(GLOW_W, -30, -6, 60, 12); ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';
      // a few drops shed from the edges
      const r = rng(1603);
      for (let i = 0; i < 9; i++) {
        const u0 = r(), side = r() < 0.5 ? -1 : 1, ph = ((u0 + t * 0.9) % 1), u = lerp(tail, head, ph);
        if (u > head - 0.02) continue;
        const { p, nx, ny } = frame(u), d = streamW(u, t) * (0.62 + 0.25 * r()), sz = 3 + 3.5 * r();
        ctx.globalAlpha = 0.55 * Math.sin(Math.PI * ph); ctx.fillStyle = C.cold; ctx.beginPath(); ctx.arc(p.x + side * nx * d, p.y + side * ny * d, sz, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    // ice cubes tumbling out of the glass with the pour
    for (const [tr, vx, vy, w0, s] of [[0.3, 120, 30, 3.4, 38], [0.5, 165, 55, -2.7, 32], [0.74, 95, 80, 4.2, 42]]) {
      const tau = t - tr; if (tau < 0) continue;
      const g = glassPose(tr), lip = gTo(g, GM - 18, -GH + 8);
      const x = lip.x + vx * tau, y = lip.y + vy * tau + 0.5 * 1500 * tau * tau;
      const a = 1 - seg(y, 960, 1160);
      if (a <= 0) continue;
      iceCube(x, y, 0.3 + w0 * tau, s, a);
    }
    // splash droplets
    const tau = t - T.splash;
    if (tau > 0 && tau < 1.4) {
      const r = rng(55);
      for (let i = 0; i < 18; i++) {
        const vx = -(70 + 260 * r()), vy = -(80 + 300 * r()), sz = 4.5 + 7 * r(), life = 0.7 + 0.6 * r();
        if (tau > life) continue;
        const px = I.x + vx * tau, py = I.y + vy * tau + 0.5 * 1100 * tau * tau, a = 1 - tau / life;
        ctx.globalAlpha = 0.85 * a; ctx.fillStyle = C.cold; ctx.beginPath(); ctx.arc(px, py, sz * (1 - 0.4 * tau / life), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.7 * a; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px - sz * 0.3, py - sz * 0.3, sz * 0.32, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  function drawFrost(t, c) {
    const fr = seg(t, T.frost, 1.9) * (1 - seg(t, 18.6, 18.9)) * (1 - seg(c.z, 0.25, 0.7));
    if (fr <= 0.002) return;
    setWorld(c);
    P.wash(ctx, FROST.glow, C.cold, { seed: 1701, v: 0.02, bd: 1, ld: 2, layers: 4, a: 0.065 * fr, pool: false });
    P.wash(ctx, FROST.film, C.cold, { seed: 1702, v: 0.02, bd: 1, ld: 2, layers: 5, a: 0.13 * fr });
    P.wash(ctx, FROST.film2, C.cold2, { seed: 1703, v: 0.02, bd: 1, ld: 2, layers: 4, a: 0.14 * fr, pool: false });
    resetT();
    // ice glints
    const r = rng(66);
    for (let i = 0; i < 26; i++) {
      const y = -1400 + r() * 3100, xw = G.outerL(y) - 30 - r() * 160, p = W2S(c, xw, y);
      const tw = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
      ctx.globalAlpha = fr * 0.85 * tw; ctx.fillStyle = '#ffffff';
      const sz = clamp(18 * c.s, 1.2, 7);
      ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // the "zap": a soft gold pulse from the exposed dentine across to the pulp, then down the pulp's nerve
  function drawZap(t, c) {
    const u = seg(t, T.zap[0], T.zap[1], ease.inOut), fade = 1 - seg(t, T.zap[1], T.zap[1] + 0.3);
    if (t < T.zap[0] || fade <= 0) return;
    const at = (s) => { const { pts, L } = ZAP; let i = 1; while (i < L.length - 1 && L[i] < s) i++; const v = clamp((s - L[i - 1]) / (L[i] - L[i - 1] || 1)); return W2S(c, lerp(pts[i - 1].x, pts[i].x, v), lerp(pts[i - 1].y, pts[i].y, v)); };
    const sh = u * ZAP.total, trail = 2600; // µm of trail behind the head
    // spark where the cold hits
    const s0 = env(t, T.zap[0], T.zap[0] + 0.45, 0.08, 0.3);
    if (s0 > 0) { const p = at(0); ctx.globalAlpha = 0.75 * s0; ctx.drawImage(GLOW_G, p.x - 80, p.y - 80, 160, 160); }
    ctx.lineCap = 'round';
    const N = 26; let prev = null;
    for (let i = 0; i <= N; i++) {
      const s = sh - trail * (1 - i / N); if (s < 0) { prev = null; continue; }
      const p = at(s);
      if (prev) { ctx.globalAlpha = fade * 0.3 * (i / N); ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 10 + 18 * (i / N); ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.globalAlpha = fade * 0.85 * (i / N); ctx.strokeStyle = '#eaa21c'; ctx.lineWidth = 3 + 6 * (i / N); ctx.stroke(); }
      prev = p;
    }
    const hp = at(sh), ha = fade * (u < 1 ? 1 : 0.6);
    ctx.globalAlpha = 0.8 * ha; ctx.drawImage(GLOW_G, hp.x - 100, hp.y - 100, 200, 200);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.8 * ha; ctx.drawImage(GLOW_W, hp.x - 30, hp.y - 30, 60, 60);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  function drawSnowflake(t) {
    const a = env(t, 0.25, 2.7, 0.35, 0.4);
    if (a <= 0) return;
    const cx = 92, cy = 846, R = 34, rot = t * 0.25;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = COLDINK; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -R);
      ctx.moveTo(0, -R * 0.55); ctx.lineTo(-R * 0.22, -R * 0.75); ctx.moveTo(0, -R * 0.55); ctx.lineTo(R * 0.22, -R * 0.75); ctx.stroke();
    }
    ctx.restore();
  }
  // end: the exposed surface comes back sealed (the takeaway, shown)
  function drawSeal(t, c) {
    const a = seg(t, T.seal[0], T.seal[1], ease.inOut) * (1 - seg(t, DUR - 0.2, DUR));
    if (a <= 0.003) return;
    setWorld(c);
    P.wash(ctx, SEAL.map((p) => ({ x: p.x - 60, y: p.y })), C.crystal, { seed: 1500, v: 0.03, bd: 2, ld: 2, layers: 4, a: 0.09 * a, pool: false }); // soft sheen
    P.wash(ctx, SEAL, '#86cdb9', { seed: 1501, v: 0.02, bd: 2, ld: 1, layers: 6, a: 0.2 * a });
    P.wash(ctx, SEAL.map((p) => ({ x: p.x + 30, y: p.y })), '#effaf6', { seed: 1502, v: 0.02, bd: 2, ld: 1, layers: 3, a: 0.2 * a, pool: false });
    resetT();
    // shimmer: soft highlight gliding down the coat + twinkles
    ctx.globalCompositeOperation = 'screen';
    for (let k = 0; k < 2; k++) {
      const ph = ((t - T.seal[0]) * 0.6 + k * 0.5) % 1, y = lerp(G.CEJ + 100, G.gumMarginL, ph), p = W2S(c, G.outerL(y) - 40, y);
      ctx.globalAlpha = 0.6 * a * Math.sin(Math.PI * ph); ctx.drawImage(GLOW_W, p.x - 20, p.y - 34, 40, 68);
    }
    const r = rng(1503);
    for (let i = 0; i < 7; i++) {
      const y = lerp(G.CEJ + 150, G.gumMarginL - 60, r()), p = W2S(c, G.outerL(y) - 30 - r() * 90, y), tw = Math.max(0, Math.sin(t * 3.1 + i * 2.3));
      ctx.globalAlpha = a * 0.8 * tw; ctx.drawImage(GLOW_W, p.x - 7, p.y - 7, 14, 14);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ drawing: tubule level (live)
  const procC = (X) => 0.27 + 0.05 * noise1(X / 3, 4);
  const procW = (X) => { const P0 = G.PRED - 0.4; return X <= 0 ? lerp(0.6, 0.42, clamp(-X / 16)) : X <= P0 ? lerp(0.6, 0.76, X / P0) : 0.76 + 0.75 * ease.smooth(clamp((X - P0) / 2.4)); };
  const procCen = (X) => lerp(procC(X), 0, clamp((X - (G.PRED - 0.4)) / 2.4));
  const lumW = (X) => (X > 0 ? lerp(1.25, 1.65, P.smoothstep(0, 4, X)) : 1.25);
  const nDef = (p, bend, t) => { const w = clamp((9.0 - p.x) / 7.8); return { x: p.x - 0.42 * bend * w * w, y: p.y + 0.07 * bend * w * Math.sin(t * 8.5 + p.x * 1.3) }; };
  const liveL = (t, c) => seg(c.z, 1.12, 1.42) * (1 - seg(t, T.pull[0], T.pull[0] + 0.25));
  function drawTubuleLife(t, c) {
    const L = liveL(t, c);
    if (L <= 0.002) return;
    resetT();
    const bend = tab(BEND, t), disp = tab(DISP, t), dispPrev = tab(DISP, t - 1 / 30);
    const PE = G.PRED + 2.4;
    const asp = -0.16 * bend; // slight outward displacement of the process (aspiration)
    // ---- out-of-focus particles in neighbouring tubules (bokeh)
    ctx.globalCompositeOperation = 'screen';
    for (const b of BOK) {
      const X = wrapX(b.x0 - disp * b.f), Yw = G.tubY(b.k) + b.j * 1.2, p = W2S(c, X, Yw), r = b.sz * c.s;
      const a = L * 0.22 * edgeFade(X);
      if (a <= 0.01) continue;
      ctx.globalAlpha = a; ctx.drawImage(BOKEH_C, p.x - r, p.y - r, 2 * r, 2 * r);
    }
    ctx.globalCompositeOperation = 'source-over';
    setWorld(c);
    // ---- odontoblast process (live, slightly aspirated outward with strong flow)
    {
      const top = [], bot = [], ax = (X) => X + asp * clamp(1 - X / PE);
      for (let X = PE; X >= -17; X -= 0.2) { const cX = procCen(X), w = procW(X); top.push({ x: ax(X), y: cX - w }); bot.push({ x: ax(X), y: cX + w }); }
      const poly = top.concat(bot.reverse());
      const g = ctx.createLinearGradient(0, -0.6, 0, 1.2);
      g.addColorStop(0, '#b9a0d6'); g.addColorStop(0.5, '#d9c8ec'); g.addColorStop(1, '#ab8fcd');
      ctx.globalAlpha = 0.95 * L; ctx.fillStyle = g; P.path(ctx, poly); ctx.fill();
      ctx.globalAlpha = 0.55 * L; ctx.strokeStyle = '#6f53a0'; ctx.lineWidth = 0.06; P.path(ctx, top.slice(0, top.length - 4), false); ctx.stroke(); P.path(ctx, bot.slice(4), false); ctx.stroke();
      // blend the flared base into the odontoblast cell body (plate D)
      { const x0 = G.PRED - 0.6, g2 = ctx.createLinearGradient(x0, 0, PE, 0); g2.addColorStop(0, 'rgba(214,198,232,0)'); g2.addColorStop(1, 'rgba(214,198,232,1)');
        const fl = []; for (let X = x0; X <= PE; X += 0.1) fl.push({ x: X, y: procCen(X) - procW(X) - 0.03 }); for (let X = PE; X >= x0; X -= 0.1) fl.push({ x: X, y: procCen(X) + procW(X) + 0.03 });
        ctx.globalAlpha = L; ctx.fillStyle = g2; P.path(ctx, fl); ctx.fill(); }
      // internal texture: microtubule streaks + vesicles
      ctx.globalAlpha = 0.25 * L; ctx.strokeStyle = '#8c6bb5'; ctx.lineWidth = 0.035;
      const X0 = G.PRED - 0.5;
      for (let s = -2; s <= 2; s++) { ctx.beginPath(); for (let X = X0; X >= -17; X -= 0.5) { const yy = procC(X) + s * procW(X) * 0.33 + 0.03 * Math.sin(X * 2 + s); X === X0 ? ctx.moveTo(ax(X), yy) : ctx.lineTo(ax(X), yy); } ctx.stroke(); }
      ctx.globalAlpha = 0.35 * L; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.07;
      ctx.beginPath(); for (let X = X0; X >= -16; X -= 0.5) { const yy = procC(X) + procW(X) * 0.55; X === X0 ? ctx.moveTo(ax(X), yy) : ctx.lineTo(ax(X), yy); } ctx.stroke();
      const r = rng(88); ctx.fillStyle = '#efe6f8';
      for (let i = 0; i < 26; i++) { const X = X0 - r() * (X0 + 16), yy = procC(X) + (r() - 0.5) * procW(X) * 1.1; ctx.globalAlpha = 0.45 * L; ctx.beginPath(); ctx.arc(ax(X), yy, 0.05 + 0.05 * r(), 0, Math.PI * 2); ctx.fill(); }
    }
    // ---- nerve ending (A-fibre terminal in the predentine) with beads; tugged outward by the flow
    let boost = 0;
    for (const ts of SPIKES) { const dt = t - ts; if (dt >= 0 && dt < 0.15) boost = Math.max(boost, 0.3 * (1 - dt / 0.15)); }
    const npts = NPATH.pts.map((p) => nDef(p, bend, t));
    const strokeN = (w, col, a) => { ctx.globalAlpha = Math.min(1, a) * L; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); npts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); };
    strokeN(0.5 + boost, '#f7dc8e', 0.35 + boost); strokeN(0.21, C.nerve, 0.95); strokeN(0.07, '#fff3c4', 0.8 + boost);
    for (const s of [1.0, 2.5, 4.0, 5.6]) {
      const q = nDef(nerveAt(s), bend, t), sx = 0.3 * (1 + 0.55 * bend), sy = 0.24 * (1 - 0.15 * bend);
      ctx.globalAlpha = 0.95 * L; ctx.fillStyle = C.nerve; ctx.beginPath(); ctx.ellipse(q.x, q.y, sx, sy, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.6 * L; ctx.strokeStyle = '#b07d18'; ctx.lineWidth = 0.04; ctx.stroke();
      ctx.globalAlpha = 0.75 * L; ctx.fillStyle = '#fff4cf'; ctx.beginPath(); ctx.ellipse(q.x - sx * 0.25, q.y - sy * 0.3, sx * 0.35, sy * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    }
    resetT();
    // ---- dentinal fluid tracers: lanes stay in the lumen and pass beside the process and the ending
    for (const p of PARTS) {
      const X = wrapX(p.x0 - disp * p.f), Xp = wrapX(p.x0 - dispPrev * p.f);
      const ef = edgeFade(X);
      if (ef <= 0.01) continue;
      const wl = lumW(X), top = procCen(X) - procW(X), bot = procCen(X) + procW(X);
      const nw = P.smoothstep(0.6, 1.4, X) * (1 - P.smoothstep(8.2, 9.2, X)); // nerve alongside → keep the lanes clear of it
      let Yw;
      if (p.lane === 0) Yw = lerp(-wl + 0.1, lerp(-0.95, -1.32, nw), 0.5 + (p.j - 0.5) * 0.6);
      else if (p.lane === 1) Yw = lerp(lerp(-0.78, -0.7, nw), top - 0.07, 0.5 + (p.j - 0.5) * 0.6);
      else Yw = lerp(bot + 0.07, wl - 0.08, 0.5 + (p.j - 0.5) * 0.6);
      const q = W2S(c, X, Yw), rad = clamp(p.sz * c.s, 1.5, 9);
      const dd = (Xp - X); // positive when moving outward (−x)
      if (dd > 0 && dd < 3) {
        const tail = W2S(c, X + dd * 1.0, Yw), len = Math.hypot(tail.x - q.x, tail.y - q.y);
        if (len > 2.5) {
          const g = ctx.createLinearGradient(q.x, q.y, tail.x, tail.y); g.addColorStop(0, 'rgba(52,132,192,0.6)'); g.addColorStop(1, 'rgba(52,132,192,0)');
          ctx.globalAlpha = L * ef; ctx.strokeStyle = g; ctx.lineWidth = rad * 1.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(tail.x, tail.y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.9 * L * ef; ctx.fillStyle = '#3f8fc6'; ctx.beginPath(); ctx.arc(q.x, q.y, rad * 1.15, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = L * ef; ctx.fillStyle = '#eaf7ff'; ctx.beginPath(); ctx.arc(q.x - rad * 0.2, q.y - rad * 0.2, rad * 0.75, 0, Math.PI * 2); ctx.fill();
    }
    // ---- action potentials: flash at the ending + an impulse with a comet trail running to the pulp
    const sOf = (dd) => 1.0 + (NPATH.total - 1.0) * Math.pow(clamp(dd / 1.1), 1.15);
    const ptOf = (s) => { const pn = nDef(nerveAt(s), bend, t); return W2S(c, pn.x, pn.y); };
    for (const ts of SPIKES) {
      const dt = t - ts;
      if (dt < 0 || dt > 1.3) continue;
      if (dt < 0.4) {
        const q = ptOf(1.0), u = dt / 0.4, rr = Math.min(150, (1.0 + 2.0 * u) * c.s);
        ctx.globalAlpha = L * (1 - u) * 0.55; ctx.drawImage(GLOW_G, q.x - rr, q.y - rr, 2 * rr, 2 * rr);
        ctx.globalAlpha = L * (1 - u) * 0.75; ctx.strokeStyle = '#e0a21c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(q.x, q.y, (0.35 + 1.3 * ease.out(u)) * c.s, 0, Math.PI * 2); ctx.stroke();
      }
      const u = clamp(dt / 1.1), a = L * (1 - seg(u, 0.85, 1));
      if (a <= 0.01) continue;
      ctx.lineCap = 'round';
      let prev = null; const N = 10;
      for (let i = 0; i <= N; i++) {
        const dd = dt - 0.25 * (1 - i / N); if (dd < 0) { prev = null; continue; }
        const q = ptOf(sOf(dd));
        if (prev) { ctx.globalAlpha = a * 0.75 * (i / N); ctx.strokeStyle = '#f6c443'; ctx.lineWidth = Math.min(26, 0.34 * c.s) * (0.35 + 0.65 * i / N); ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        prev = q;
      }
      const q = ptOf(sOf(dt)), gr = Math.min(170, 2.6 * c.s), cr = Math.min(26, 0.4 * c.s);
      ctx.globalAlpha = a * 0.7; ctx.drawImage(GLOW_G, q.x - gr, q.y - gr, 2 * gr, 2 * gr);
      const cg = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, cr);
      cg.addColorStop(0, '#fffdf2'); cg.addColorStop(0.45, '#ffe07a'); cg.addColorStop(1, 'rgba(240,170,30,0)');
      ctx.globalAlpha = a * 0.8; ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(q.x, q.y, cr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // ---- cold: only at the exposed surface, ~2 mm away (top band), never reaching the ending
    const cold = coldOn(t) * L * (1 - 0.6 * seg(t, T.occl[0], T.occl[1] + 0.6));
    if (cold > 0.01) {
      const g = ctx.createLinearGradient(0, 0, 0, 640);
      g.addColorStop(0, `rgba(150,200,236,${0.62 * cold})`); g.addColorStop(1, 'rgba(150,200,236,0)');
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 640); ctx.globalCompositeOperation = 'source-over';
    }
    // ---- bold "outward" arrow in the lumen while the cold acts
    const oa = coldOn(t) * L * (1 - seg(t, 12.3, 12.6));
    if (oa > 0.01) { const a0 = W2S(c, -4.0, -0.98), a1 = W2S(c, -5.05, -0.98); ctx.globalAlpha = oa; drawArrow(a0.x, a0.y, a1.x, a1.y, COLDINK, 6); ctx.globalAlpha = 1; }
  }
  const wrapX = (x) => XMIN + ((((x - XMIN) % SPAN) + SPAN) % SPAN);
  const edgeFade = (x) => P.smoothstep(XMIN, XMIN + 1.2, x) * (1 - P.smoothstep(XMAX - 1.6, XMAX, x));

  // ------------------------------------------------------------------ bokeh field (zoom parallax)
  function drawBokeh(t, c) {
    ctx.globalCompositeOperation = 'screen';
    for (const b of ZB) {
      const lk = c.z - b.z; // log10 of apparent magnification of this mote
      const a = 0.17 * P.smoothstep(-0.65, -0.25, lk) * (1 - P.smoothstep(0.3, 0.65, lk)) * b.a;
      if (a <= 0.004) continue;
      const k = Math.pow(10, lk), ang = b.ang + 0.03 * Math.sin(t * 0.4 + b.ang);
      const x = c.fs.x + Math.cos(ang) * b.r * k, y = c.fs.y + Math.sin(ang) * b.r * k * 1.15, s = b.size * Math.pow(k, 0.85);
      if (x < -s || x > W + s || y < -s || y > H + s) continue;
      ctx.globalAlpha = a; ctx.drawImage(b.warm ? BOKEH_W : BOKEH_C, x - s, y - s, 2 * s, 2 * s);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ text helpers
  function rich(segs, x, y, align = 'center') {
    let w = 0;
    for (const s of segs) { if (s.arrow) { s.w = s.arrow * 1.05; } else { ctx.font = s.font; s.w = ctx.measureText(s.t).width; } w += s.w + (s.gap || 0); }
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (const s of segs) {
      if (s.arrow) { drawArrow(cx + 4, y - s.arrow * 0.32, cx + s.arrow - 6, y - s.arrow * 0.32, s.color || INK, s.arrow * 0.085); }
      else {
        ctx.font = s.font; ctx.fillStyle = s.color || INK; ctx.textAlign = 'left'; ctx.fillText(s.t, cx, y + (s.dy || 0));
        if (s.stroke) { ctx.strokeStyle = s.color || INK; ctx.lineWidth = s.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s.t, cx, y + (s.dy || 0)); }
      }
      cx += s.w + (s.gap || 0);
    }
    return w;
  }
  function drawArrow(x0, y0, x1, y1, col, lw) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = lw * 3.4;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hl * 0.5, y1 - Math.sin(a) * hl * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * hl, y1 - Math.sin(a - 0.45) * hl); ctx.lineTo(x1 - Math.cos(a + 0.45) * hl, y1 - Math.sin(a + 0.45) * hl); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /** text with a soft cream stroke underneath (legible over the painting, no boxes) */
  function sText(txt, x, y, font, col, align = 'left', sw = 6) {
    ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round';
    const a = ctx.globalAlpha;
    ctx.globalAlpha = a * 0.92; ctx.strokeStyle = CREAM; ctx.lineWidth = sw; ctx.strokeText(txt, x, y);
    ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillText(txt, x, y);
    return ctx.measureText(txt).width;
  }
  function card(name, x, y, a) {
    const cd = CARD[name]; if (!cd || a <= 0) return;
    ctx.globalAlpha = a; ctx.drawImage(cd.canvas, x - cd.pad, y - cd.pad); ctx.globalAlpha = 1;
  }
  const slot = (t, [a, b], fi = 0.3, fo = 0.3) => Kit.env(t, a, b, fi, fo);

  // ------------------------------------------------------------------ captions & cards
  function drawTitle(t) {
    const a = 1 - seg(t, T.title[1] - FADE, T.title[1]);
    if (a <= 0) return;
    card('title', 60, 250, a);
    ctx.globalAlpha = a;
    rich([{ t: 'Why do cold drinks', font: F(600, 74) }], 540, 345);
    rich([{ t: 'zap', font: F(600, 74, SERIF, 'i'), color: COLDINK }, { t: ' sensitive teeth?', font: F(600, 74) }], 540, 430);
    ctx.font = F(500, 30, SANS); ctx.fillStyle = INK2; ctx.textAlign = 'center';
    ctx.fillText('Dentine hypersensitivity: the hydrodynamic theory, zoomed in', 540, 486);
    ctx.globalAlpha = 1;
  }
  function capCard(t, win, name, lines, fine, h) {
    const a = slot(t, win, FADE, FADE);
    if (a <= 0) return;
    const dy = (1 - a) * 12;
    card(name, 60, 252 + dy, a);
    ctx.globalAlpha = a;
    const y0 = 252 + dy + (lines.length === 1 ? 92 : 84);
    lines.forEach((segs, i) => rich(segs, 540, y0 + i * 76));
    if (fine) {
      const fl = Array.isArray(fine) ? fine : [fine];
      ctx.font = F(500, 24, SANS); ctx.fillStyle = INK2; ctx.textAlign = 'center';
      fl.forEach((f, i) => ctx.fillText(f, 540, 252 + dy + h - 30 - (fl.length - 1 - i) * 30));
    }
    ctx.globalAlpha = 1;
  }

  // labels at the tubule level (anchored to world points). lines: [[text, font, colour], ...]
  function label(c, a, lines, wx, wy, tx, ty, align = 'left', lead = INK) {
    if (a <= 0) return;
    const p = W2S(c, wx, wy);
    ctx.globalAlpha = a;
    let wmax = 0;
    lines.forEach(([txt, font, col], i) => { wmax = Math.max(wmax, sText(txt, tx, ty + i * 34, font, col, align)); });
    const midY = ty - 10 + (lines.length - 1) * 17;
    const sx = align === 'left' ? tx + wmax + 12 : tx - wmax - 12;
    ctx.strokeStyle = lead; ctx.lineWidth = 2.4; ctx.globalAlpha = a * 0.85;
    ctx.beginPath(); ctx.moveTo(sx, midY); ctx.quadraticCurveTo((sx + p.x) / 2, midY, p.x, p.y); ctx.stroke();
    ctx.fillStyle = lead; ctx.beginPath(); ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  function drawLabels(t, c) {
    const base = env(t, T.labels[0], T.labels[1], 0.3, 0.25);
    const st = (d) => base * seg(t, T.labels[0] + d, T.labels[0] + d + 0.3);
    // 'dentinal tubule' bracket across the lumen
    const at = st(0);
    if (at > 0) {
      const xb = -2.7, l = W2S(c, xb, 1.25), r = W2S(c, xb, -1.25), dl = W2S(c, xb + 0.18, 1.25), dr = W2S(c, xb + 0.18, -1.25);
      ctx.globalAlpha = at; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(dl.x, dl.y); ctx.lineTo(l.x, l.y); ctx.lineTo(r.x, r.y); ctx.lineTo(dr.x, dr.y); ctx.stroke();
      label(c, at, [['dentinal tubule', F(700, 30, SANS), INK]], xb, -1.25, 1004, 766, 'right');
    }
    label(c, st(0.15), [['odontoblast process', F(600, 30, SANS), INK]], -1.0, procC(-1.0), 72, 726, 'left');
    label(c, st(0.3), [['dentinal fluid', F(600, 30, SANS), COLDINK]], -1.6, -1.05, 1004, 856, 'right', COLDINK);
    const an = env(t, T.nerveLab[0], T.nerveLab[1], 0.3, 0.25) * seg(t, T.labels[0] + 0.45, T.labels[0] + 0.75);
    const bead = nDef(nerveAt(2.5), tab(BEND, t), t);
    label(c, an, [['A-fibre ending', F(700, 30, SANS), GOLDINK], ['at the pulp–dentine border', F(500, 26, SANS), INK2]], bead.x, bead.y, 1004, 1038, 'right', GOLDINK);
    // where the tubule leads (and where the cold is applied)
    const am = st(0.55);
    if (am > 0) {
      const X0 = Math.min(W2S(c, -6, 0).x + 128, 700);
      ctx.globalAlpha = am;
      drawArrow(X0 + 12, 566, X0 + 12, 512, INK, 4);
      sText('exposed surface', X0 + 36, 548, F(600, 30, SANS), INK);
      sText('~2 mm away', X0 + 36, 582, F(500, 26, SANS), INK2);
      const ca = am * coldOn(t);
      if (ca > 0) { ctx.globalAlpha = ca; sText('cold is applied there', X0 + 36, 614, F(600, 26, SANS), COLDINK); }
      ctx.globalAlpha = 1;
    }
  }

  // live 'nerve firing' trace: ticks once per action potential, goes flat once the tubule is narrowed
  function drawStrip(t) {
    const a = env(t, T.strip[0], T.strip[1], 0.3, FADE);
    if (a <= 0) return;
    const x0 = 636, y0 = 1150;
    card('strip', x0, y0, a);
    ctx.globalAlpha = a;
    ctx.font = F(600, 30, SANS); ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText('nerve firing', x0 + 22, y0 + 40);
    const q = a * seg(t, LAST_SPIKE + 0.45, LAST_SPIKE + 0.75);
    if (q > 0) { ctx.globalAlpha = q; ctx.font = F(600, 32, SERIF, 'i'); ctx.fillStyle = COLDINK; ctx.textAlign = 'right'; ctx.fillText('quiet', x0 + 302, y0 + 40); }
    const tx0 = x0 + 22, tx1 = x0 + 302, base = y0 + 100, Hs = 40, WIN = 2.6, pxs = (tx1 - tx0) / WIN;
    ctx.save(); ctx.beginPath(); ctx.rect(tx0 - 2, y0 + 50, tx1 - tx0 + 4, 70); ctx.clip();
    ctx.globalAlpha = a; ctx.strokeStyle = GOLDINK; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx0, base);
    for (const ts of SPIKES) {
      if (ts > t || ts < t - WIN - 0.1) continue;
      const xs = tx1 - (t - ts) * pxs;
      ctx.lineTo(xs - 6, base); ctx.lineTo(xs - 1.5, base - Hs); ctx.lineTo(xs + 2.5, base + 9); ctx.lineTo(xs + 6, base);
    }
    ctx.lineTo(tx1, base); ctx.stroke();
    ctx.restore();
    // the newest spike glows at the 'now' end
    let g = 0; for (const ts of SPIKES) { const dt = t - ts; if (dt >= 0 && dt < 0.25) g = Math.max(g, 1 - dt / 0.25); }
    ctx.globalAlpha = a * (0.35 + 0.65 * g); ctx.fillStyle = g > 0 ? '#e9ad24' : INK2; ctx.beginPath(); ctx.arc(tx1, base, 4 + 3 * g, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawPoiseuille(t) {
    const a = slot(t, T.capD, FADE, FADE);
    if (a <= 0) return;
    const x0 = 556, w = 454, h = 640, y0 = 470 + (1 - a) * 14;
    card('pois', x0, y0, a);
    ctx.globalAlpha = a;
    const cx = x0 + w / 2, r = occl(t);
    ctx.font = F(600, 30, SANS); ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText('whole tubule narrowed', cx, y0 + 54);
    // painted tube (longitudinal): walls, lumen, deposit narrowing it along its whole length, laminar tracers
    const { x0: tx0, x1: tx1, cy, R0 } = TB, X0 = x0 + tx0, X1 = x0 + tx1, CY = y0 + cy, Rl = R0 * r;
    ctx.drawImage(TUBE.canvas, x0 - TUBE.pad, y0 - TUBE.pad + TUBE.dy);
    ctx.save(); ctx.beginPath(); ctx.rect(X0, CY - R0 - 1, X1 - X0, 2 * R0 + 2); ctx.clip();
    if (r < 0.999) {
      const grow = 1 - r; // 0 → 0.5
      for (const side of [-1, 1]) {
        const poly = [];
        for (let X = X0 - 6; X <= X1 + 6; X += 14) poly.push({ x: X, y: CY + side * (R0 + 2) });
        for (let i = 0, X = X1 + 6; X >= X0 - 6; X -= 9, i++) poly.push({ x: X, y: CY + side * (Rl - (i % 2 ? 0 : 7 * grow * 2) * (0.6 + 0.4 * hash(i, side + 5))) });
        P.wash(ctx, poly, C.crystal, { seed: 1311 + side, v: 0.01, bd: 1, ld: 1, layers: 4, a: 0.32 * a });
      }
      ctx.globalAlpha = a * 0.55 * clamp(grow * 4); ctx.strokeStyle = C.crystal2; ctx.lineWidth = 1.6;
      for (const side of [-1, 1]) { ctx.beginPath(); for (let i = 0, X = X0; X <= X1; X += 9, i++) { const Y = CY + side * (Rl - (i % 2 ? 0 : 7 * grow * 2) * (0.6 + 0.4 * hash(i, side + 9))); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); }
    }
    const cd = tab(CDISP, t), cdp = tab(CDISP, t - 1 / 30);
    for (const p of CPARTS) {
      const sp = 0.45 * (1 - p.yf * p.yf), fr = (((p.x0 + cd * sp) % 1) + 1) % 1, frp = (((p.x0 + cdp * sp) % 1) + 1) % 1;
      const px = lerp(X0, X1, fr), py = CY + p.yf * Rl * 0.92, ef = P.smoothstep(0, 0.06, fr) * (1 - P.smoothstep(0.94, 1, fr));
      const len = (fr - frp) * (X1 - X0);
      if (len > 1 && len < 60) { const g = ctx.createLinearGradient(px, py, px - len * 1.6, py); g.addColorStop(0, 'rgba(52,132,192,0.55)'); g.addColorStop(1, 'rgba(52,132,192,0)'); ctx.globalAlpha = a * ef; ctx.strokeStyle = g; ctx.lineWidth = p.sz * 1.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - len * 1.6, py); ctx.stroke(); }
      ctx.globalAlpha = a * ef * 0.9; ctx.fillStyle = '#3f8fc6'; ctx.beginPath(); ctx.arc(px, py, p.sz, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * ef; ctx.fillStyle = '#eaf7ff'; ctx.beginPath(); ctx.arc(px - p.sz * 0.25, py - p.sz * 0.25, p.sz * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = a;
    // radius marker
    const rx = X0 + 46;
    ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(rx, CY, 4, 0, Math.PI * 2); ctx.fill();
    drawArrow(rx, CY, rx, CY - Rl + 3, INK, 3.4);
    sText('r', rx + 14, CY - Rl / 2 + 12, F(600, 36, SERIF, 'i'), INK, 'left', 5);
    ctx.globalAlpha = a;
    drawArrow(X1 - 70, CY + R0 + 22 + 0, X1 - 14, CY + R0 + 22, COLDINK, 3); // flow direction
    // bars: radius (linear) vs flow (4th power), painted
    const bx = x0 + 44, bw = w - 88;
    const bar = (yy, lab, frac, col, valTxt, seed) => {
      ctx.globalAlpha = a; ctx.font = F(600, 30, SANS); ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(lab, bx, yy);
      ctx.font = F(700, 30, SANS); ctx.textAlign = 'right'; ctx.fillText(valTxt, bx + bw, yy);
      ctx.fillStyle = 'rgba(90,80,100,0.13)'; ctx.beginPath(); ctx.roundRect(bx, yy + 14, bw, 20, 10); ctx.fill();
      const L = Math.max(8, bw * frac), pts = [];
      for (let i = 0; i <= 10; i++) pts.push({ x: bx + L * i / 10, y: yy + 14 });
      pts.push({ x: bx + L, y: yy + 24 });
      for (let i = 10; i >= 0; i--) pts.push({ x: bx + L * i / 10, y: yy + 34 });
      pts.push({ x: bx, y: yy + 24 });
      P.wash(ctx, pts, col, { seed, v: 0.02, bd: 1, ld: 1, layers: 5, a: 0.3 * a });
    };
    const fl = Math.pow(r, 4);
    bar(y0 + 352, 'radius', r, '#8f78b8', Math.round(r * 100) + '%', 1321);
    bar(y0 + 420, 'flow  (∝ r⁴)', fl, C.cold, Math.round(fl * 100) + '%', 1322);
    const b16 = seg(t, T.b16[0], T.b16[1]);
    if (b16 > 0) { ctx.globalAlpha = a * b16; rich([{ t: '½ radius', font: F(600, 32), gap: 10 }, { arrow: 36, color: INK, gap: 10 }, { t: '1/16 the flow', font: F(600, 32), color: COLDINK }], cx, y0 + 528); }
    ctx.globalAlpha = a; ctx.font = F(400, 22, SANS); ctx.fillStyle = INK2; ctx.textAlign = 'center';
    ctx.fillText('toy model · Hagen–Poiseuille:', cx, y0 + 578); ctx.fillText('same pressure, laminar flow', cx, y0 + 604);
    ctx.globalAlpha = 1;
  }
  function drawTakeaway(t) {
    const a = seg(t, T.take[0], T.take[0] + FADE);
    if (a <= 0) return;
    card('title', 60, 250, a); // same card as the title → the loop is only a text change
    const at = a * (1 - seg(t, DUR - 0.25, DUR));
    ctx.globalAlpha = at;
    rich([{ t: 'Seal the tubules,', font: F(600, 74) }], 540, 345);
    rich([{ t: 'still the fluid.', font: F(600, 74, SERIF, 'i'), color: COLDINK }], 540, 430);
    ctx.font = F(500, 30, SANS); ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText('The logic behind tubule-occluding desensitisers', 540, 486);
    const af = env(t, T.takeFine[0], T.takeFine[1], 0.3, 0.3);
    if (af > 0) {
      card('takeFine', 60, 540, af);
      ctx.globalAlpha = af; ctx.textAlign = 'center';
      ctx.font = F(500, 24, SANS); ctx.fillStyle = INK;
      ctx.fillText('Leading model; odontoblasts may also sense cold directly', 540, 580);
      ctx.fillStyle = INK2; ctx.fillText('(TRPC5 channels · Bernal et al. 2021)', 540, 610);
      ctx.font = F(400, 22, SANS);
      ctx.fillText('Brännström 1966 · Pashley 1986 · Absi et al. 1987 · Lilja 1979', 540, 644);
      ctx.fillText('Andrew & Matthews 2000 · schematic, not to scale', 540, 672);
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ UI: live scale bar, zoom factor, handle
  function fmtLen(um) {
    if (um >= 1000) return (um / 1000).toFixed(um >= 10000 ? 0 : 1) + ' mm';
    if (um >= 100) return Math.round(um / 10) * 10 + ' µm';
    if (um >= 10) return Math.round(um) + ' µm';
    return um.toFixed(1) + ' µm';
  }
  function drawUI(t, c) {
    const BAR = 180, x0 = 80, y0 = 1534;
    card('scale', 60, 1462, 1); // painted paper chip (on screen from frame 0 → identical at the loop point)
    ctx.globalAlpha = 1;
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + BAR, y0); ctx.moveTo(x0, y0 - 11); ctx.lineTo(x0, y0 + 11); ctx.moveTo(x0 + BAR, y0 - 11); ctx.lineTo(x0 + BAR, y0 + 11); ctx.stroke();
    ctx.font = F(700, 34, SANS); ctx.fillStyle = INK; ctx.textAlign = 'left';
    ctx.fillText(fmtLen(BAR / c.s), x0, y0 - 22);
    const mag = c.s / S0;
    ctx.font = F(500, 26, SANS); ctx.fillStyle = INK2;
    ctx.fillText('×' + (mag < 10 ? mag.toFixed(1) : Math.round(mag)), x0 + BAR + 20, y0 + 9);
    // schematic flag at the cellular scale
    const sa = seg(c.z, 1.15, 1.45) * (1 - seg(t, T.pull[0], T.pull[0] + 0.3));
    if (sa > 0) { ctx.globalAlpha = sa; sText('schematic · cell shapes & flow speed not to scale', x0 - 6, 1440, F(500, 24, SANS), INK2, 'left', 5); }
    ctx.globalAlpha = 0.85;
    sText('@natebrooksendo', 950, 1541, F(500, 26, SANS), INK2, 'right', 4);
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ surface labels (hook + seal)
  function surfLabel(c, a, l1, l2) {
    if (a <= 0) return;
    const E = W2S(c, G.outerL(700) - 10, 700);
    ctx.globalAlpha = a;
    sText(l1, 72, 1318, F(600, 32, SANS), COLDINK);
    sText(l2, 72, 1354, F(500, 26, SANS), INK2);
    ctx.strokeStyle = COLDINK; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(176, 1284); ctx.quadraticCurveTo(200, E.y + 8, E.x - 8, E.y); ctx.stroke();
    ctx.fillStyle = COLDINK; ctx.beginPath(); ctx.arc(E.x - 4, E.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ REEL
  window.REEL = {
    title: 'Hydrodynamic theory — a powers-of-ten zoom',
    duration: DUR,
    poster: 1.5,
    canvas,
    fonts: ['600 74px Fraunces', 'italic 600 74px Fraunces', '600 62px Fraunces', 'italic 600 62px Fraunces', '600 36px Fraunces', 'italic 600 36px Fraunces', '600 32px Fraunces', 'italic 600 32px Fraunces', '600 40px Fraunces',
      '500 30px Inter', '600 30px Inter', '700 30px Inter', '700 34px Inter', '500 26px Inter', '600 26px Inter', '500 24px Inter', '400 22px Inter', '600 32px Inter'],
    async setup() {
      P = window.WC; G = P.G; C = P.C;
      FS0 = { x: 556 - G.AX * S0, y: 548 + 9500 * S0 };
      zIn = P.mono([0, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2, 8.0, 8.7], [Z0, Z0 + 0.035, Z0 + 0.2, -0.5, 0.0, 0.52, 1.06, 1.5, Z1], true);
      zTub = P.mono([8.7, 9.4, 12.5, 15.0, 15.9, 20.65], [Z1, Z1, Z1 + 0.068, Z2, Z1, Z1 + 0.012], true);
      XMAX = G.PRED + 0.6; SPAN = XMAX - XMIN;
      buildFlow(); buildParticles(); buildNervePath(); buildHookGeometry();
      BEAD = nerveAt(1.0);
      PAPER = P.paperGrain(); VIG = P.vignette(); ATMO = atmosphere();
      BOKEH_W = P.bokehSprite([255, 236, 205]); BOKEH_C = P.bokehSprite([214, 238, 255]);
      GLOW_G = P.glowSprite([255, 206, 92]); GLOW_W = P.glowSprite([255, 255, 255]);
      CARD.title = P.cardWash(960, 268, 1201);
      CARD.capA = P.cardWash(960, 200, 1202);
      CARD.capB = P.cardWash(960, 236, 1204);
      CARD.capC = P.cardWash(960, 270, 1205);
      CARD.capD = P.cardWash(960, 180, 1206);
      CARD.pois = P.cardWash(454, 640, 1207);
      CARD.takeFine = P.cardWash(960, 150, 1209);
      CARD.scale = P.cardWash(330, 100, 1210);
      CARD.strip = P.cardWash(324, 124, 1211);
      buildTube();
      A = P.buildA(); B = P.buildB(); B2 = P.buildB2(); Cc = P.buildC(); D = P.buildD();
      // zoom-parallax motes
      const r = rng(1301); ZB = [];
      for (let i = 0; i < 54; i++) ZB.push({ z: Z0 - 0.4 + (Z1 - Z0 + 0.8) * ((i + r()) / 54), ang: r() * Math.PI * 2, r: 90 + 420 * r(), size: 8 + 18 * r(), a: 0.5 + 0.5 * r(), warm: r() < 0.6 });
    },
    render(t) {
      t = clamp(t, 0, DUR);
      const c = cam(t);
      resetT(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      // paper + atmosphere
      ctx.drawImage(ATMO, 0, 0);
      // plates (nested, crossfaded by zoom level)
      drawPlate(A, c, 1 - seg(c.z, -0.34, -0.1));
      drawPlate(B, c, seg(c.z, -0.85, -0.55) * (1 - seg(c.z, 0.42, 0.62)));
      const b2a = seg(c.z, -0.05, 0.22) * (1 - seg(c.z, 0.92, 1.08));
      drawPlate(B2, c, b2a);
      drawPlate(B2.over, c, b2a * (0.3 + 0.7 * seg(G.TUB * c.s, 7, 12))); // striations: full contrast only at ≥12 px pitch
      drawPlate(Cc, c, seg(c.z, 0.55, 0.8));
      drawPlate(D, c, seg(c.z, 1.2, 1.45), 0.42, 0.8);
      // live: hook, seal + tubule level
      drawFrost(t, c);
      drawSeal(t, c);
      drawTubuleLife(t, c);
      drawBokeh(t, c);
      drawZap(t, c);
      drawPour(t, c);
      drawSnowflake(t);
      // paper texture + vignette over the painting
      resetT();
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1;
      ctx.drawImage(PAPER, 0, 0); ctx.globalAlpha = 0.35; ctx.drawImage(VIG, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      // annotations
      surfLabel(c, slot(t, T.exposed, 0.25, 0.25), 'exposed dentine', '(gingival recession)');
      surfLabel(c, seg(t, T.seal[1] - 0.2, T.seal[1] + 0.1) * (1 - seg(t, DUR - 0.2, DUR)), 'sealed', '(tubule orifices occluded)');
      drawLabels(t, c);
      drawStrip(t);
      drawPoiseuille(t);
      // captions (top band)
      drawTitle(t);
      capCard(t, T.capA, 'capA', [[{ t: 'Dentine is riddled with', font: F(600, 62) }], [{ t: 'fluid-filled tubules', font: F(600, 62, SERIF, 'i'), color: COLDINK }]], null, 200);
      capCard(t, T.capB, 'capB', [[{ t: 'Cold, air & sugar', font: F(600, 62) }], [{ t: 'pull fluid ', font: F(600, 62) }, { t: 'outward', font: F(600, 62, SERIF, 'i'), color: COLDINK }]], 'heat: inward flow, which the nerves respond to less · Andrew & Matthews 2000', 236);
      capCard(t, T.capC, 'capC', [[{ t: 'Flow tugs the nerve', font: F(600, 62) }], [{ arrow: 60, color: GOLDINK, gap: 8 }, { t: 'sharp pain', font: F(600, 62, SERIF, 'i'), color: GOLDINK }]],
        ['mechanosensitive intradental A-fibres (cat) · Andrew & Matthews 2000', 'root dentine: nerve endings stay at the pulp–dentine border · Lilja 1979'], 270);
      capCard(t, T.capD, 'capD', [[{ t: 'Poiseuille: flow ', font: F(600, 62) }, { t: '∝', font: '600 64px "DejaVu Serif", serif', stroke: 0.6 }, { t: ' r', font: F(600, 62, SERIF, 'i'), gap: -4 }, { t: '4', font: F(600, 40), dy: -30 }]], 'sensitive dentine: ~8× more, ~2× wider open tubules · Absi 1987', 180);
      drawTakeaway(t);
      drawUI(t, c);
    },
  };
  Kit.boot(REEL);
})();
