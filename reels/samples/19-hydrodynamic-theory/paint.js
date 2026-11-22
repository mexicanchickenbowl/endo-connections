/*
 * Sample 19 — watercolour painting engine + "plates" for a powers-of-ten zoom.
 *
 * World coordinates are micrometres (µm). The world origin F = (0,0) is the pulpal end of ONE dentinal
 * tubule on the buccal (left) cervical root wall of a premolar, at the pulp–dentine border (mineralisation
 * front). +x points toward the pulp (lingual), +y points apically. Every plate is painted once in setup()
 * from the SAME geometry functions, so nested plates line up during the continuous zoom.
 *
 *   Plate A  whole tooth in longitudinal section     0.12 px/µm   (~13 x 26 mm)
 *   Plate B  cervical wall: exposed root dentine     0.60 px/µm   (r ≈ 2.2 mm around F)
 *   Plate C  inner dentine, odontoblast layer, pulp  5.0  px/µm   (r ≈ 260 µm)
 *   Plate D  single tubule + odontoblast palisade    40   px/µm   (r ≈ 26 µm)
 *
 * Watercolour technique: layered translucent fills of recursively deformed polygons (Hobbs-style
 * "layered deformation"), pigment pooling at edges (blurred dark stroke), granulation speckle,
 * back-run blooms and delicate pen lines. All randomness is seeded (Kit.rng) → deterministic.
 */
(function () {
  'use strict';
  const { clamp, lerp, rng, hash, noise1, noise2 } = Kit;
  const P = {};

  // ------------------------------------------------------------------ palette
  P.C = {
    paper: '#f4ecdf', ink: '#2c2738', ink2: '#5b5468',
    enamel: '#eef2f3', enamelS: '#a9bccb',
    dent: '#efd5a6', dent2: '#dfb47a', sepia: '#8f6440', dentLight: '#f8e8c8',
    pulp: '#eaa29c', pulp2: '#cf6c73', vessel: '#b13c52', rbc: '#c8475a',
    nerve: '#e3ac36', nerve2: '#f6d77c', glow: '#ffd76a',
    odonto: '#c9b2dd', odonto2: '#9c7dc3', nuc: '#6a5296',
    gum: '#eea7a3', gum2: '#d77a80',
    bone: '#e9dabf', bone2: '#c9ad85',
    cold: '#5aaee0', cold2: '#a9dcf3', cold3: '#276fa6',
    crystal: '#c4e6dc', crystal2: '#5e9f91',
    lumen: '#c9b08a', rim: '#fbf0d8', fluid: '#e3eef0',
  };
  const C = P.C;

  // ------------------------------------------------------------------ basic helpers
  P.gauss = (r) => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  P.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const smoothstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  P.smoothstep = smoothstep;

  /** Catmull-Rom spline through pts → dense polyline */
  P.spline = (pts, closed = false, n = 10) => {
    const out = [], N = pts.length;
    const get = (i) => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        });
      }
    }
    if (!closed) out.push({ x: pts[N - 1].x, y: pts[N - 1].y });
    return out;
  };

  /** monotone cubic (Fritsch–Carlson) interpolant; flatEnds → zero slope at both ends */
  P.mono = (xs, ys, flatEnds = false) => {
    const n = xs.length, d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = flatEnds ? 0 : d[0]; m[n - 1] = flatEnds ? 0 : d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { const tt = 3 / Math.sqrt(h); m[i] = tt * a * d[i]; m[i + 1] = tt * b * d[i]; }
    }
    return (x) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  };

  P.path = (ctx, pts, closed = true) => {
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (closed) ctx.closePath();
  };

  /** recursive midpoint deformation (each midpoint displaced by gaussian ∝ edge length × local variance) */
  P.deform = (pts, depth, r) => {
    let Q = pts;
    for (let d = 0; d < depth; d++) {
      const out = [];
      for (let i = 0; i < Q.length; i++) {
        const a = Q[i], b = Q[(i + 1) % Q.length];
        out.push(a);
        const len = Math.hypot(b.x - a.x, b.y - a.y), v = (a.v + b.v) / 2;
        out.push({ x: (a.x + b.x) / 2 + P.gauss(r) * len * v, y: (a.y + b.y) / 2 + P.gauss(r) * len * v, v: v * (0.55 + 0.9 * r()) });
      }
      Q = out;
    }
    return Q;
  };

  /**
   * Watercolour wash. pts in current ctx coordinates.
   * o: {seed, v (variance), bd (base depth), ld (layer depth), layers, a (alpha per layer), op,
   *     edge (alpha of pigment-pooling edge), edgeColor, ew (edge width, ctx units), eb (edge blur px)}
   */
  P.wash = (ctx, pts, color, o = {}) => {
    const r = rng(o.seed || 7);
    const base = P.deform(pts.map((p) => ({ x: p.x, y: p.y, v: o.v != null ? o.v : 0.05 })), o.bd != null ? o.bd : 2, r);
    ctx.save();
    if (o.op) ctx.globalCompositeOperation = o.op;
    ctx.fillStyle = color;
    ctx.globalAlpha = o.a != null ? o.a : 0.1;
    const L = o.layers != null ? o.layers : 10;
    for (let i = 0; i < L; i++) { P.path(ctx, P.deform(base, o.ld != null ? o.ld : 2, r)); ctx.fill(); }
    if (o.edge) {
      ctx.globalAlpha = o.edge; ctx.strokeStyle = o.edgeColor || color; ctx.lineWidth = o.ew || 2; ctx.lineJoin = 'round';
      if (o.eb) ctx.filter = `blur(${o.eb}px)`;
      P.path(ctx, base); ctx.stroke(); ctx.filter = 'none';
    } else if (o.pool !== false && typeof color === 'string' && color[0] === '#') {
      // pigment pooling: every wash dries with a slightly darker rim (2–3 device px, ~0.3 alpha of the wash body)
      const tr = ctx.getTransform(), sc = Math.hypot(tr.a, tr.b) || 1;
      const acc = 1 - Math.pow(1 - (o.a != null ? o.a : 0.1), L);
      ctx.globalAlpha = 0.34 * acc * (o.poolA != null ? o.poolA : 1);
      ctx.strokeStyle = P.darken(color, 0.74); ctx.lineJoin = 'round';
      P.path(ctx, base); ctx.lineWidth = 2.6 / sc; ctx.stroke();
      ctx.globalAlpha *= 0.4; ctx.lineWidth = 6 / sc; ctx.stroke();
    }
    ctx.restore();
    return base;
  };
  P.darken = (col, f) => { const [r, g, b] = Kit.hex(col); return `rgb(${(r * f) | 0},${(g * f) | 0},${(b * f) | 0})`; };

  /** watercolour / ink line: several jittered passes of an open polyline; ink wobbles ~1–2 device px */
  P.line = (ctx, pts, color, o = {}) => {
    const r = rng(o.seed || 3);
    const tr = ctx.getTransform(), sc = Math.hypot(tr.a, tr.b) || 1;
    const wob = (o.wob != null ? o.wob : 1.4) / sc, wl = 42 / sc, sd = (o.seed || 3) + 911;
    let q0 = pts;
    if (wob > 0 && pts.length > 2) {
      let s = 0;
      q0 = pts.map((p, i) => { if (i) s += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); return { x: p.x + wob * noise1(s / wl, sd), y: p.y + wob * noise1(s / wl + 17.3, sd + 1) }; });
    }
    ctx.save();
    ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.op) ctx.globalCompositeOperation = o.op;
    const passes = o.passes || 3, j = o.jit || 0;
    for (let p = 0; p < passes; p++) {
      ctx.globalAlpha = (o.a != null ? o.a : 0.5) * (p === 0 ? 1 : 0.6);
      ctx.lineWidth = (o.w || 1) * (p === 0 ? 1 : 0.55 + 0.6 * r());
      const ox = (r() - 0.5) * j, oy = (r() - 0.5) * j;
      ctx.beginPath();
      q0.forEach((q, i) => (i ? ctx.lineTo(q.x + ox, q.y + oy) : ctx.moveTo(q.x + ox, q.y + oy)));
      ctx.stroke();
    }
    ctx.restore();
  };

  /** circle-ish blob points */
  P.blob = (cx, cy, rx, ry, n = 18, seed = 1, wob = 0.15, rot = 0) => {
    const out = [], cs = Math.cos(rot), sn = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, f = 1 + wob * noise1(i * 0.9 + seed * 3.1, seed);
      const x = Math.cos(a) * rx * f, y = Math.sin(a) * ry * f;
      out.push({ x: cx + x * cs - y * sn, y: cy + x * sn + y * cs });
    }
    return out;
  };

  // ------------------------------------------------------------------ shared textures
  /** granulation speckle tile (transparent with dark specks) */
  P.grainTile = (seed, size = 256, density = 0.18, col = [90, 60, 40]) => {
    const c = P.canvas(size, size), x = c.getContext('2d');
    const img = x.createImageData(size, size), d = img.data;
    for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
      const n = hash(i, j, seed), m = 0.5 + 0.5 * noise2(i / 9, j / 9, seed + 1);
      const a = n < density * m ? (0.35 + 0.65 * hash(i, j, seed + 2)) : 0;
      const k = (j * size + i) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = a * 255;
    }
    x.putImageData(img, 0, 0);
    return c;
  };

  /** paper grain to multiply over the whole frame (screen space, 1080x1920) */
  P.paperGrain = () => {
    const W = 1080, H = 1920;
    const c = P.canvas(W, H), x = c.getContext('2d');
    const img = x.createImageData(W, H), d = img.data;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const g = hash(i >> 1, j >> 1, 41) * 0.5 + hash(i >> 2, j >> 2, 42) * 0.5;
      const v = 255 * (1 - 0.051 * g - 0.012 * hash(i, j, 45)); // grain ×1.5 + ~1 % static dither (anti-banding)
      const k = (j * W + i) * 4; d[k] = v; d[k + 1] = v * 0.996; d[k + 2] = v * 0.985; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    { const tmp = P.canvas(W, H), tx = tmp.getContext('2d'); tx.filter = 'blur(0.9px)'; tx.drawImage(c, 0, 0); x.drawImage(tmp, 0, 0); }
    // soft mottling (cold-press paper tooth)
    const sm = P.canvas(54, 96), sx = sm.getContext('2d'), si = sx.createImageData(54, 96);
    for (let j = 0; j < 96; j++) for (let i = 0; i < 54; i++) {
      const v = 255 * (1 - 0.075 * (0.5 + 0.5 * noise2(i / 3, j / 3, 43)));
      const k = (j * 54 + i) * 4; si.data[k] = v; si.data[k + 1] = v; si.data[k + 2] = v * 0.99; si.data[k + 3] = 255;
    }
    sx.putImageData(si, 0, 0);
    x.globalCompositeOperation = 'multiply';
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(sm, 0, 0, W, H);
    // a few fibres
    const r = rng(44);
    x.strokeStyle = 'rgba(120,100,80,0.06)'; x.lineWidth = 1;
    for (let i = 0; i < 260; i++) {
      const px = r() * W, py = r() * H, a = r() * Math.PI, L = 10 + r() * 40;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + (r() - 0.5) * 8, py + Math.sin(a) * L * 0.5 + (r() - 0.5) * 8, px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke();
    }
    return c;
  };

  /** warm vignette (multiply) */
  P.vignette = () => {
    const c = P.canvas(1080, 1920), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, 1080, 1920);
    const g = x.createRadialGradient(540, 900, 520, 540, 960, 1250);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(214,196,172,1)');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    return c;
  };

  /** soft bokeh disc sprite (white; tint via drawing colour layer) */
  P.bokehSprite = (rgb) => {
    const S = 128, c = P.canvas(S, S), x = c.getContext('2d');
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    const [r, gg, b] = rgb;
    g.addColorStop(0, `rgba(${r},${gg},${b},0.55)`);
    g.addColorStop(0.72, `rgba(${r},${gg},${b},0.62)`);
    g.addColorStop(0.86, `rgba(${r},${gg},${b},0.75)`);
    g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); x.fill();
    return c;
  };
  /** soft glow sprite */
  P.glowSprite = (rgb) => {
    const S = 128, c = P.canvas(S, S), x = c.getContext('2d');
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    const [r, gg, b] = rgb;
    g.addColorStop(0, `rgba(${r},${gg},${b},1)`); g.addColorStop(0.25, `rgba(${r},${gg},${b},0.55)`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    return c;
  };

  /** paper-coloured watercolour card (behind captions) */
  P.cardWash = (w, h, seed, color = '#f7f0e4', edgeCol = '#d9c6a8') => {
    const pad = 60, c = P.canvas(w + pad * 2, h + pad * 2), x = c.getContext('2d');
    const rr = Math.min(60, h * 0.35), pts = [];
    const corner = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * Math.PI / 2; pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }); } };
    corner(pad + w - rr, pad + rr, -Math.PI / 2); corner(pad + w - rr, pad + h - rr, 0); corner(pad + rr, pad + h - rr, Math.PI / 2); corner(pad + rr, pad + rr, Math.PI);
    const dense = P.spline(pts, true, 4);
    P.wash(x, dense, color, { seed, v: 0.035, bd: 2, ld: 2, layers: 16, a: 0.16, edge: 0.22, edgeColor: edgeCol, ew: 3, eb: 2 });
    // inner fill to guarantee legibility
    x.save(); x.globalAlpha = 0.55; x.fillStyle = color;
    P.path(x, P.spline(pts.map((p) => ({ x: lerp(p.x, pad + w / 2, 0.06), y: lerp(p.y, pad + h / 2, 0.12) })), true, 4)); x.filter = 'blur(10px)'; x.fill(); x.restore();
    return { canvas: c, pad };
  };

  // ------------------------------------------------------------------ tooth geometry (world µm)
  const AX = 900; // tooth long axis (pulp centre-line) x
  const G = { AX };
  const rel = (arr) => arr.map((v) => v + AX);
  const WS = 1.16; // width scale of the outer contour (premolar ~8.5 mm bucco-lingually)
  const relW = (arr) => arr.map((v) => v * WS + AX);
  G.outerL = P.mono([-1500, 0, 3000, 6000, 9000, 11500, 12450], relW([-2600, -2550, -2300, -1900, -1300, -700, -120]));
  G.outerR = P.mono([-1600, 0, 3000, 6000, 9000, 11500, 12450], relW([2700, 2600, 2350, 1900, 1300, 700, 120]));
  G.pulpL = P.mono([-3600, -2000, 0, 4000, 8000, 11000, 12300], rel([-900, -950, -900, -650, -400, -210, -70]));
  G.pulpR = P.mono([-3600, -2000, 0, 4000, 8000, 11000, 12300], rel([1000, 950, 900, 650, 400, 210, 70]));
  G.CEJ = -1500;
  G.gumMarginL = 1800;  // receded gingival margin (buccal) → exposed root 1500..1800 apical to CEJ … here y∈[-1500,1800]
  G.boneCrestL = 3900;
  G.gumMarginR = -2050;
  G.boneCrestR = 300;
  G.PRED = 14;   // predentine thickness used at cellular scale (µm; typical 10–40 µm)
  G.ODO = 23;    // odontoblast cell body length (µm; jittered ±12 % per cell)
  G.odoLen = (k) => G.ODO * (1 + 0.12 * noise1(k * 1.71 + 0.3, 21));
  G.TUB = 4.7;   // centre spacing of tubules near pulp (≈ 1/sqrt(45 000 per mm²))
  G.wallX = (y) => G.pulpL(y); // pulp–dentine border (mineralisation front) on the buccal wall

  const crownOuterRel = [
    [-2600, -1500], [-3120, -2600], [-3380, -3900], [-3360, -5400], [-3060, -6850], [-2480, -8200], [-1950, -9100], [-1500, -9480],
    [-1050, -9250], [-480, -8450], [120, -7720], [700, -8180], [1250, -8650], [1650, -8780], [2250, -8380], [2850, -7450],
    [3200, -6200], [3260, -4700], [3000, -2900], [2700, -1600],
  ];
  const dejRel = [
    [-2600, -1500], [-2720, -2700], [-2740, -4200], [-2580, -5800], [-2170, -7100], [-1640, -8000], [-1420, -8140], [-1120, -7900],
    [-520, -7120], [120, -6820], [650, -7200], [1180, -7620], [1460, -7700], [1980, -7230], [2430, -6050], [2560, -4600],
    [2470, -3000], [2700, -1600],
  ];
  const pRel = (a) => a.map(([x, y]) => ({ x: x + AX, y }));
  const pRelW = (a) => a.map(([x, y]) => ({ x: x * WS + AX, y }));
  G.dentineThickness = Math.round(G.pulpL(0) - G.outerL(0)) ; // at F (µm)
  G.toothOutline = () => {
    const crown = P.spline(pRelW(crownOuterRel), false, 8);
    const right = []; for (let y = -1600; y <= 12450; y += 120) right.push({ x: G.outerR(y), y });
    const apex = []; for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; apex.push({ x: AX + Math.cos(a) * 139, y: 12450 + Math.sin(a) * 120 }); }
    const left = []; for (let y = 12450; y >= -1500; y -= 120) left.push({ x: G.outerL(y), y });
    return crown.concat(right, apex, left);
  };
  G.dentineBody = () => {
    const dej = P.spline(pRelW(dejRel), false, 8);
    const right = []; for (let y = -1600; y <= 12450; y += 120) right.push({ x: G.outerR(y), y });
    const apex = []; for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; apex.push({ x: AX + Math.cos(a) * 139, y: 12450 + Math.sin(a) * 120 }); }
    const left = []; for (let y = 12450; y >= -1500; y -= 120) left.push({ x: G.outerL(y), y });
    return dej.concat(right, apex, left);
  };
  G.pulpOutline = () => {
    const left = []; for (let y = 12300; y >= -3600; y -= 100) left.push({ x: G.pulpL(y), y });
    const roof = P.spline(pRel([[-900, -3600], [-880, -4350], [-790, -5250], [-660, -5600], [-450, -5250], [-150, -4720], [250, -4620],
      [600, -4920], [860, -5180], [960, -4900], [1000, -4300], [1000, -3600]]), false, 8);
    const right = []; for (let y = -3600; y <= 12300; y += 100) right.push({ x: G.pulpR(y), y });
    return left.concat(roof, right);
  };
  /** focal-region tubule centre-line (cellular plates): tubule k, at depth x (x<wall) */
  G.tubY = (k) => (k === 0 ? 0 : k * G.TUB + 0.55 * noise1(k * 1.37, 5));
  G.tubCentre = (k, x) => G.tubY(k) * (1 - x * 0.00022) + (k === 0 ? 0 : 0.35 * noise1(x / 30 + k * 2.1, 6) * smoothstep(0, -30, x));
  P.G = G;

  // ------------------------------------------------------------------ plate infrastructure
  function makePlate(ox, oy, wUm, hUm, k) {
    const c = P.canvas(wUm * k, hUm * k), x = c.getContext('2d');
    x.setTransform(k, 0, 0, k, -ox * k, -oy * k);
    return { canvas: c, ctx: x, ox, oy, k, px: 1 / k };
  }
  /** feather plate alpha with a radial mask around world point (cx,cy) */
  function featherRadial(pl, cx, cy, r0, r1) {
    const x = pl.ctx; x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 1; x.globalCompositeOperation = 'destination-in';
    const X = (cx - pl.ox) * pl.k, Y = (cy - pl.oy) * pl.k;
    const g = x.createRadialGradient(X, Y, r0 * pl.k, X, Y, r1 * pl.k);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, pl.canvas.width, pl.canvas.height); x.restore();
  }
  function grainOver(pl, tile, alpha, scale = 1) {
    const x = pl.ctx; x.save(); x.setTransform(scale, 0, 0, scale, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = alpha;
    x.fillStyle = x.createPattern(tile, 'repeat'); x.fillRect(0, 0, pl.canvas.width / scale, pl.canvas.height / scale); x.restore();
  }
  /** back-run blooms: lighter cauliflower patches inside existing paint */
  function blooms(pl, n, rMin, rMax, seed, alpha = 0.12, col = '#fff7e8') {
    const x = pl.ctx, r = rng(seed); x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < n; i++) {
      const cx = r() * pl.canvas.width, cy = r() * pl.canvas.height, rad = rMin + r() * (rMax - rMin);
      P.wash(x, P.blob(cx, cy, rad, rad * (0.7 + 0.5 * r()), 14, i + seed, 0.25), col, { seed: seed + i, v: 0.08, bd: 2, ld: 2, layers: 4, a: alpha, edge: alpha * 0.9, edgeColor: '#b08a60', ew: 1.2 });
    }
    x.restore();
  }
  function blurred(pl, f = 4, px = 5) {
    const w = Math.ceil(pl.canvas.width / f), h = Math.ceil(pl.canvas.height / f);
    const c = P.canvas(w, h), x = c.getContext('2d');
    x.filter = `blur(${px}px)`; x.imageSmoothingQuality = 'high';
    x.drawImage(pl.canvas, 0, 0, w, h);
    return { canvas: c, k: pl.k / f };
  }
  function finish(pl, feather, f, px) {
    pl.ctx.globalAlpha = 1;
    const out = { canvas: pl.canvas, ox: pl.ox, oy: pl.oy, k: pl.k, feather };
    out.blur = blurred(pl, f, px);
    delete pl.ctx;
    return out;
  }

  // ------------------------------------------------------------------ PLATE A — whole tooth
  P.buildA = () => {
    const k = 0.12, ox = -5600, oy = -11400, wU = 13400, hU = 26200;
    const pl = makePlate(ox, oy, wU, hU, k), x = pl.ctx, px = pl.px;
    const grain = P.grainTile(11, 256, 0.16);

    // ---- alveolar bone (thin buccal / lingual plates around the root) with cancellous texture
    const obL = P.mono([G.boneCrestL, G.boneCrestL + 800, G.boneCrestL + 2600, 15000], [170, 850, 1150, 1250]);
    const obR = P.mono([G.boneCrestR, G.boneCrestR + 800, G.boneCrestR + 2600, 15000], [170, 850, 1150, 1250]);
    const boneOutL = (y) => G.outerL(y) - obL(y), boneOutR = (y) => G.outerR(y) + obR(y);
    const boneL = [], boneR = [];
    for (let y = G.boneCrestL; y <= 15000; y += 200) boneL.push({ x: G.outerL(y) - 160, y });
    for (let y = 15000; y >= G.boneCrestL; y -= 200) boneL.push({ x: boneOutL(y), y });
    for (let y = G.boneCrestR; y <= 15000; y += 200) boneR.push({ x: G.outerR(y) + 160, y });
    for (let y = 15000; y >= G.boneCrestR; y -= 200) boneR.push({ x: boneOutR(y), y });
    const boneApex = [{ x: boneOutL(12300), y: 12300 }, { x: G.outerL(12200) - 160, y: 12200 }, { x: AX, y: 12780 }, { x: G.outerR(12200) + 160, y: 12200 }, { x: boneOutR(12300), y: 12300 }, { x: boneOutR(15000), y: 15000 }, { x: boneOutL(15000), y: 15000 }];
    for (const [poly, sd] of [[boneL, 21], [boneR, 22], [boneApex, 24]]) P.wash(x, poly, C.bone, { seed: sd, v: 0.02, layers: 10, a: 0.18, edge: 0.45, edgeColor: C.bone2, ew: 7 * px, eb: 1.5 });
    { // marrow spaces between trabeculae
      const r = rng(23);
      for (const poly of [boneL, boneR, boneApex]) {
        x.save(); P.path(x, poly); x.clip();
        let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity; for (const q of poly) { bx0 = Math.min(bx0, q.x); bx1 = Math.max(bx1, q.x); by0 = Math.min(by0, q.y); by1 = Math.max(by1, q.y); }
        for (let i = 0; i < 34; i++) { const cx = bx0 + r() * (bx1 - bx0), cy = by0 + 300 + r() * (by1 - by0), rr = 90 + r() * 220; P.wash(x, P.blob(cx, cy, rr, rr * (0.6 + r() * 0.6), 12, i, 0.3, r() * 3), '#e8c2ab', { seed: 100 + i, v: 0.06, layers: 3, a: 0.2, edge: 0.3, edgeColor: C.bone2, ew: 4 * px }); }
        x.restore();
      }
    }
    { const pdlL = [], pdlR = []; for (let y = G.boneCrestL; y <= 12300; y += 150) pdlL.push({ x: G.outerL(y) - 80, y }); for (let y = G.boneCrestR; y <= 12300; y += 150) pdlR.push({ x: G.outerR(y) + 80, y });
      P.line(x, pdlL, '#e9a7a0', { w: 8 * px, a: 0.55, passes: 2, seed: 25 }); P.line(x, pdlR, '#e9a7a0', { w: 8 * px, a: 0.55, passes: 2, seed: 26 }); }

    // ---- gingiva / mucosa hugging the bone (buccal margin receded → exposed root; lingual margin normal)
    const ogL = P.mono([G.gumMarginL, G.gumMarginL + 220, G.gumMarginL + 800, G.boneCrestL, G.boneCrestL + 1500, 15000], [25, 330, 720, 1150, 1650, 1850]);
    const ogR = P.mono([G.gumMarginR, G.gumMarginR + 220, G.gumMarginR + 800, G.boneCrestR, G.boneCrestR + 1500, 15000], [25, 330, 720, 1150, 1650, 1850]);
    const gumL = [], gumR = [];
    for (let y = G.gumMarginL; y <= G.boneCrestL; y += 120) gumL.push({ x: G.outerL(y) - 25, y });
    for (let y = G.boneCrestL; y <= 15000; y += 250) gumL.push({ x: boneOutL(y) - 10, y });
    for (let y = 15000; y >= G.gumMarginL; y -= 120) gumL.push({ x: G.outerL(y) - ogL(y), y });
    for (let y = G.gumMarginR; y <= G.boneCrestR; y += 120) gumR.push({ x: G.outerR(y) + 25, y });
    for (let y = G.boneCrestR; y <= 15000; y += 250) gumR.push({ x: boneOutR(y) + 10, y });
    for (let y = 15000; y >= G.gumMarginR; y -= 120) gumR.push({ x: G.outerR(y) + ogR(y), y });
    for (const [poly, sd] of [[gumL, 31], [gumR, 32]]) {
      P.wash(x, poly, C.gum, { seed: sd, v: 0.01, layers: 12, a: 0.15, edge: 0.5, edgeColor: C.gum2, ew: 8 * px, eb: 1.5 });
      P.line(x, poly.slice(Math.floor(poly.length * 0.55)), C.gum2, { w: 2 * px, a: 0.4, passes: 2, jit: 8, seed: sd + 5 });
    }

    // ---- tooth: enamel cap, dentine body, cementum, pulp
    const outline = G.toothOutline();
    P.wash(x, outline, C.enamel, { seed: 41, v: 0.006, layers: 12, a: 0.2, edge: 0.45, edgeColor: C.enamelS, ew: 8 * px, eb: 1.2 });
    // enamel cool shading toward the outside + prism strokes
    x.save(); P.path(x, outline); x.clip();
    { const r = rng(42); const p = P.spline(pRelW(crownOuterRel), false, 8); for (let i = 0; i < 140; i++) { const a = r(); const q = p[Math.floor(a * (p.length - 1))]; const cx = AX - 200, cy = -5200; const dx = q.x - cx, dy = q.y - cy, L = Math.hypot(dx, dy); x.globalAlpha = 0.08; x.strokeStyle = C.enamelS; x.lineWidth = 9 * px; x.beginPath(); x.moveTo(q.x, q.y); x.lineTo(q.x - dx / L * 900, q.y - dy / L * 900); x.stroke(); } }
    x.restore();
    const body = G.dentineBody();
    P.wash(x, body, C.dent, { seed: 43, v: 0.006, layers: 12, a: 0.17, edge: 0.4, edgeColor: C.dent2, ew: 10 * px, eb: 1.5 });
    // deeper tone toward pulp + tubule hairlines
    x.save(); P.path(x, body); x.clip();
    { const pulp = G.pulpOutline(); x.save(); x.filter = 'blur(10px)'; x.globalAlpha = 0.22; x.strokeStyle = C.dent2; x.lineWidth = 600; P.path(x, pulp); x.stroke(); x.restore(); }
    { const r = rng(44); x.strokeStyle = C.sepia; x.lineWidth = 1.1 * px; x.globalAlpha = 0.11;
      for (let y0 = -6600; y0 <= 11800; y0 += 95) { // root + cervical: from pulp wall outward on both sides
        for (const side of [-1, 1]) {
          const xp = side < 0 ? G.pulpL(y0) : G.pulpR(y0), xo = side < 0 ? G.outerL(y0) : G.outerR(y0);
          if (y0 < -3600) continue;
          x.beginPath();
          for (let i = 0; i <= 10; i++) { const u = i / 10; const yy = y0 - 260 * u * u - 160 * u * (y0 < 0 ? 1 : 0.3) + 60 * Math.sin(Math.PI * 2 * u) * u + (r() - 0.5) * 20; const xx = lerp(xp, xo, u); i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
          x.stroke();
        }
      }
      // crown: S-curved tubules from pulp chamber roof to the DEJ
      const dej = P.spline(pRelW(dejRel), false, 8), roof = G.pulpOutline().filter((p) => p.y < -3000);
      for (let i = 0; i < 120; i++) {
        const a = i / 119, q = dej[Math.floor(lerp(4, dej.length - 5, a))], pr = roof[Math.floor(lerp(0, roof.length - 1, a))];
        x.beginPath();
        for (let j = 0; j <= 10; j++) { const u = j / 10; const xx = lerp(pr.x, q.x, u) + 140 * Math.sin(Math.PI * 2 * u); const yy = lerp(pr.y, q.y, u); j ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
        x.stroke();
      }
    }
    x.restore();
    // exposed root dentine (buccal cervical): slightly richer ochre band at the surface
    { const band = []; for (let y = G.CEJ + 80; y <= G.gumMarginL + 60; y += 100) band.push({ x: G.outerL(y) + 10, y }); for (let y = G.gumMarginL + 60; y >= G.CEJ + 80; y -= 100) band.push({ x: G.outerL(y) + 170 + 60 * Math.sin(y / 500), y });
      x.save(); x.filter = 'blur(2px)'; P.wash(x, band, '#dc9f55', { seed: 45, v: 0.05, layers: 6, a: 0.14 }); x.restore(); }
    // cementum: thin band on root surfaces (absent on the exposed buccal cervical area)
    const cemL = [], cemR = [];
    for (let y = G.gumMarginL - 100; y <= 12300; y += 150) cemL.push({ x: G.outerL(y) + 40 + 60 * (y / 12300), y });
    for (let y = -1600; y <= 12300; y += 150) cemR.push({ x: G.outerR(y) - 40 - 60 * (y / 12300), y });
    P.line(x, cemL, '#c49a62', { w: 9 * px, a: 0.45, passes: 2, seed: 46 });
    P.line(x, cemR, '#c49a62', { w: 9 * px, a: 0.45, passes: 2, seed: 47 });
    // pulp
    const pulp = G.pulpOutline();
    P.wash(x, pulp, C.pulp, { seed: 51, v: 0.008, layers: 12, a: 0.17, edge: 0.45, edgeColor: C.pulp2, ew: 9 * px, eb: 1.2 });
    x.save(); P.path(x, pulp); x.clip();
    { // vessels + nerve up the canal, branching into the horns
      const vessel = (xo, seed, col, w) => { const pts = []; for (let y = 12300; y >= -4700; y -= 250) { const half = (G.pulpR(y) - G.pulpL(y)) / 2; pts.push({ x: AX + xo * half * 0.62 + 60 * noise1(y / 900, seed), y }); } P.line(x, pts, col, { w, a: 0.55, passes: 3, jit: 30, seed }); };
      vessel(-0.65, 61, C.vessel, 7 * px); vessel(0.6, 62, C.vessel, 7 * px); vessel(0.05, 63, C.nerve, 10 * px); vessel(-0.2, 64, '#8a4a9c', 5 * px);
      const r = rng(65); for (let i = 0; i < 10; i++) { const y = -4600 + r() * 9000, xo = AX + (r() - 0.5) * 900; P.line(x, [{ x: xo, y }, { x: xo + (r() - 0.5) * 700, y: y - 500 - r() * 600 }], C.vessel, { w: 4 * px, a: 0.4, passes: 2, seed: 70 + i }); }
    }
    x.restore();
    // pen lines (delicate ink)
    P.line(x, outline.concat([outline[0]]), C.ink, { w: 2.2 * px, a: 0.38, passes: 2, jit: 6, seed: 81 });
    P.line(x, P.spline(pRelW(dejRel), false, 8), C.sepia, { w: 1.6 * px, a: 0.35, passes: 2, jit: 6, seed: 82 });
    P.line(x, pulp.concat([pulp[0]]), C.pulp2, { w: 1.8 * px, a: 0.42, passes: 2, jit: 6, seed: 83 });
    grainOver(pl, grain, 0.3);
    blooms(pl, 9, 25, 60, 84, 0.055);
    { // wet-edge back-runs ("cauliflowers") inside the big washes: dentine, pulp, gingiva
      const bloomIn = (region, cx, cy, rx, ry, fill, edgeCol, a, seed) => {
        x.save(); P.path(x, region); x.clip();
        const pts = P.wash(x, P.blob(cx, cy, rx, ry, 22, seed, 0.2), fill, { seed, v: 0.07, bd: 2, ld: 2, layers: 5, a, pool: false });
        // the back-run's signature: a darker, irregular "cauliflower" tide-line
        x.save(); x.strokeStyle = edgeCol; x.lineJoin = 'round'; x.globalAlpha = 0.32; x.lineWidth = 2.4 * px; P.path(x, pts); x.stroke();
        x.globalAlpha = 0.12; x.lineWidth = 6 * px; x.stroke(); x.restore();
        x.restore();
      };
      bloomIn(body, AX - 1500, -5600, 700, 560, '#fbf0da', '#b98242', 0.06, 861);
      bloomIn(body, AX + 1350, 4300, 520, 900, '#fbf0da', '#b98242', 0.06, 862);
      bloomIn(body, AX + 1900, -3200, 420, 520, '#fbf0da', '#b98242', 0.05, 866);
      bloomIn(pulp, AX + 120, -1800, 380, 700, '#f7cfc8', '#b04a58', 0.06, 863);
      bloomIn(pulp, AX - 60, 6500, 260, 900, '#f7cfc8', '#b04a58', 0.05, 867);
      bloomIn(gumL, G.outerL(6500) - 700, 6500, 420, 700, '#f8cfca', '#b44c5a', 0.06, 864);
      bloomIn(gumR, G.outerR(2600) + 650, 2600, 420, 600, '#f8cfca', '#b44c5a', 0.06, 865);
    }
    // edge fade so gum/bone dissolve into the paper
    { const xx = pl.ctx; xx.save(); xx.setTransform(1, 0, 0, 1, 0, 0); xx.globalCompositeOperation = 'destination-in';
      const W = pl.canvas.width, H = pl.canvas.height;
      const gh = xx.createLinearGradient(0, 0, W, 0); gh.addColorStop(0, 'rgba(0,0,0,0)'); gh.addColorStop(0.16, 'rgba(0,0,0,1)'); gh.addColorStop(0.84, 'rgba(0,0,0,1)'); gh.addColorStop(1, 'rgba(0,0,0,0)');
      xx.fillStyle = gh; xx.fillRect(0, 0, W, H);
      const gv = xx.createLinearGradient(0, 0, 0, H); gv.addColorStop(0, 'rgba(0,0,0,1)'); gv.addColorStop(0.86, 'rgba(0,0,0,1)'); gv.addColorStop(1, 'rgba(0,0,0,0)');
      xx.fillStyle = gv; xx.fillRect(0, 0, W, H); xx.restore(); }
    return finish(pl, null, 2, 2);
  };

  // ------------------------------------------------------------------ PLATE B — cervical wall (exposed root dentine)
  P.buildB = () => {
    const k = 0.6, R = 2350, ox = -R - 400, oy = -R, wU = 2 * R, hU = 2 * R;
    const pl = makePlate(ox, oy, wU, hU, k), x = pl.ctx, px = pl.px;
    const y0 = oy - 50, y1 = oy + hU + 50;
    // gingiva (lower-left) + sulcus
    const gum = [{ x: G.outerL(G.gumMarginL) - 25, y: G.gumMarginL }];
    for (let y = G.gumMarginL + 120; y <= y1 + 200; y += 120) gum.push({ x: G.outerL(y) - 40, y });
    gum.push({ x: ox - 300, y: y1 + 200 }, { x: ox - 300, y: 2700 }, { x: -2350, y: 2350 }, { x: -1950, y: 1950 });
    P.wash(x, P.spline(gum, true, 3), C.gum, { seed: 301, v: 0.02, layers: 10, a: 0.15, edge: 0.4, edgeColor: C.gum2, ew: 6 * px, eb: 2 });
    { const r = rng(302); x.save(); P.path(x, gum); x.clip(); for (let i = 0; i < 60; i++) { const cx = ox + r() * 900, cy = 1900 + r() * 600; P.wash(x, P.blob(cx, cy, 18 + r() * 30, 12 + r() * 20, 10, i, 0.3), '#e48d90', { seed: 303 + i, layers: 2, a: 0.18 }); } x.restore(); }
    // enamel wedge above the CEJ
    const enamel = P.spline(pRelW(crownOuterRel.slice(0, 4)), false, 8).concat(P.spline(pRelW(dejRel.slice(0, 4)), false, 8).reverse());
    P.wash(x, enamel, C.enamel, { seed: 305, v: 0.01, layers: 10, a: 0.22, edge: 0.45, edgeColor: C.enamelS, ew: 4 * px, eb: 1.5 });
    // dentine walls (left wall + start of right wall)
    const wallLeft = []; for (let y = y0; y <= y1; y += 40) wallLeft.push({ x: G.outerL(y), y });
    for (let y = y1; y >= y0; y -= 40) wallLeft.push({ x: G.pulpL(y), y });
    const enamelTop = []; // DEJ above CEJ belongs to dentine too
    P.wash(x, wallLeft, C.dent, { seed: 306, v: 0.004, layers: 12, a: 0.18, edge: 0.3, edgeColor: C.dent2, ew: 6 * px, eb: 2 });
    const dejPts = P.spline(pRelW(dejRel.slice(0, 4)), false, 8).filter((p) => p.y >= y0);
    if (dejPts.length > 2) { const crownDent = dejPts.concat([{ x: G.pulpL(y0), y: y0 }, { x: G.pulpL(G.CEJ), y: G.CEJ }]); P.wash(x, crownDent, C.dent, { seed: 307, v: 0.004, layers: 8, a: 0.18 }); }
    const wallRight = []; for (let y = y0; y <= y1; y += 40) wallRight.push({ x: G.pulpR(y), y });
    for (let y = y1; y >= y0; y -= 40) wallRight.push({ x: G.outerR(y), y });
    P.wash(x, wallRight, C.dent, { seed: 308, v: 0.004, layers: 12, a: 0.18, edge: 0.3, edgeColor: C.dent2, ew: 6 * px, eb: 2 });
    // deeper wet tone toward the pulp (more & wider tubules)
    x.save(); P.path(x, wallLeft); x.clip();
    { const g = x.createLinearGradient(-1650, 0, 0, 0); g.addColorStop(0, 'rgba(223,180,122,0)'); g.addColorStop(0.65, 'rgba(223,180,122,0.18)'); g.addColorStop(1, 'rgba(196,146,96,0.42)'); x.fillStyle = g; x.fillRect(ox, oy, wU, hU); }
    // tubules: every tubule as a faint hairline (density texture) + every 4th as a clear representative line,
    // so they read as tubules from the ~300 µm field onward; darker toward the pulp (more & wider tubules)
    { const r = rng(309);
      let n = 0;
      for (let yy = y0; yy <= y1; yy += 4.7, n++) {
        const xp = G.pulpL(yy), xo = G.outerL(yy), strong = n % 4 === 0;
        const pts = [];
        for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push({ x: lerp(xp, xo, u), y: yy - 260 * u * u + 90 * u * Math.sin(2 * Math.PI * u) + 3 * noise1(yy * 0.05 + u * 4, 7) }); }
        const k0 = 0.75 + 0.5 * r();
        for (let i = 1; i < pts.length; i++) {
          const u = i / 16, a = (strong ? 0.36 + 0.3 * (1 - u) : 0.09 + 0.12 * (1 - u)) * k0;
          if (strong) { x.globalAlpha = a * 0.7; x.strokeStyle = '#fff3dc'; x.lineWidth = (3.4 - 1.2 * u) * px; x.beginPath(); x.moveTo(pts[i - 1].x, pts[i - 1].y + 1.6); x.lineTo(pts[i].x, pts[i].y + 1.6); x.stroke(); }
          x.globalAlpha = a; x.strokeStyle = strong ? '#7d5530' : C.sepia; x.lineWidth = (strong ? 1.9 - 0.7 * u : 1.1 - 0.4 * u) * px;
          x.beginPath(); x.moveTo(pts[i - 1].x, pts[i - 1].y); x.lineTo(pts[i].x, pts[i].y); x.stroke();
        }
      }
      x.globalAlpha = 1;
    }
    x.restore();
    x.save(); P.path(x, wallRight); x.clip();
    for (let yy = y0; yy <= y1; yy += 5) { x.beginPath(); x.moveTo(G.pulpR(yy), yy); x.lineTo(G.outerR(yy), yy - 300); x.globalAlpha = 0.12; x.strokeStyle = C.sepia; x.lineWidth = 0.8 * px; x.stroke(); }
    x.restore();
    // exposed surface: open tubule orifices (dots) + slightly roughened edge
    { const r = rng(310); for (let yy = G.CEJ; yy <= G.gumMarginL; yy += 14) { const X = G.outerL(yy) + 6 + r() * 30; x.globalAlpha = 0.25; x.fillStyle = '#9b6e40'; x.beginPath(); x.arc(X, yy + r() * 6, (1.2 + r()) * px, 0, Math.PI * 2); x.fill(); } x.globalAlpha = 1; }
    // cementum below the gingival margin
    const cem = []; for (let y = G.gumMarginL - 60; y <= y1; y += 40) cem.push({ x: G.outerL(y) + 30, y });
    P.line(x, cem, '#c08f55', { w: 50, a: 0.45, passes: 3, jit: 6, seed: 311 });
    // predentine (pale) + odontoblast layer (mauve) + pulp
    const pulpBand = []; for (let y = y0; y <= y1; y += 40) pulpBand.push({ x: G.pulpL(y) + 2, y });
    for (let y = y1; y >= y0; y -= 40) pulpBand.push({ x: G.pulpR(y) - 2, y });
    P.wash(x, pulpBand, C.pulp, { seed: 312, v: 0.004, layers: 12, a: 0.16 });
    for (const side of [-1, 1]) {
      const f = side < 0 ? G.pulpL : G.pulpR;
      const pre = [], odo = [];
      for (let y = y0; y <= y1; y += 40) { pre.push({ x: f(y) - side * G.PRED / 2, y }); odo.push({ x: f(y) - side * (G.PRED + G.ODO / 2), y }); }
      P.line(x, pre, '#fbe9dd', { w: G.PRED + 2, a: 0.9, passes: 2, seed: 313 + side });
      P.line(x, odo, C.odonto2, { w: 22, a: 0.55, passes: 3, jit: 4, seed: 315 + side });
      const cr = []; for (let y = y0; y <= y1; y += 40) cr.push({ x: f(y) - side * 90, y });
      P.line(x, cr, '#c98aa8', { w: 60, a: 0.12, passes: 2, jit: 10, seed: 317 + side });
    }
    // pulp vessels + nerve bundle
    { const r = rng(320);
      const vline = (xo, seed, col, w, a) => { const pts = []; for (let y = y0; y <= y1; y += 60) pts.push({ x: lerp(G.pulpL(y), G.pulpR(y), xo) + 50 * noise1(y / 500, seed), y }); P.line(x, pts, col, { w, a, passes: 3, jit: 8, seed }); return pts; };
      vline(0.22, 321, C.vessel, 30, 0.5); vline(0.78, 322, C.vessel, 26, 0.5); vline(0.5, 323, C.nerve, 60, 0.6); vline(0.36, 324, '#8a4a9c', 18, 0.35);
      for (let i = 0; i < 16; i++) { const y = y0 + r() * (y1 - y0), xs = lerp(G.pulpL(y), G.pulpR(y), 0.5); const xe = G.pulpL(y) + 45; P.line(x, P.spline([{ x: xs, y: y + 260 }, { x: lerp(xs, xe, 0.45), y: y + 150 }, { x: lerp(xs, xe, 0.85), y: y + 30 }, { x: xe, y }], false, 8), C.nerve, { w: 6, a: 0.35, passes: 2, seed: 330 + i }); }
      for (let i = 0; i < 260; i++) { const y = y0 + r() * (y1 - y0), xx = lerp(G.pulpL(y) + 30, G.pulpR(y) - 30, r()); x.globalAlpha = 0.25; x.fillStyle = C.nuc; x.beginPath(); x.ellipse(xx, y, 6, 4, r() * 3, 0, Math.PI * 2); x.fill(); } x.globalAlpha = 1;
    }
    P.line(x, wallLeft.slice(0, Math.floor(wallLeft.length / 2)), C.ink, { w: 2.2 * px, a: 0.35, passes: 2, jit: 2, seed: 340 });
    grainOver(pl, P.grainTile(12, 256, 0.14), 0.3);
    featherRadial(pl, -400, 0, 1800, 2350);
    return finish(pl, { cx: -400, cy: 0, r0: 1800 }, 2, 2);
  };

  // ------------------------------------------------------------------ shared pulp-side geometry (x is an OFFSET from the pulp wall, µm)
  // Cells, tubules, capillaries and nerve fibres are generated once here and drawn by every cellular plate,
  // so plates B2 → C → D agree where they overlap during the zoom.
  G.cellHalf = (k) => { const Y = G.tubY(k); return { lo: (G.tubY(k - 1) + Y) / 2 + 0.16, hi: (G.tubY(k + 1) + Y) / 2 - 0.16 }; };
  G.gap0 = G.tubY(-1) / 2; // gap between odontoblast 0 and -1 (the focal fibre runs here)
  G.caps = (() => {
    const out = [], r = rng(611), rx = (y) => 62 + 5 * noise1(y / 45, 31);
    const rail = []; for (let y = -680; y <= 680; y += 5) rail.push({ x: rx(y), y }); out.push(rail);
    for (let yc = -650; yc <= 650; yc += 46 + r() * 16) {
      const reach = 31 + r() * 6 - (r() < 0.22 ? 12 : 0), w = 12 + r() * 6;
      out.push(P.spline([{ x: rx(yc - w), y: yc - w }, { x: lerp(rx(yc), reach, 0.55), y: yc - w * 0.82 }, { x: reach + 2.5, y: yc - w * 0.4 }, { x: reach, y: yc },
        { x: reach + 2.5, y: yc + w * 0.4 }, { x: lerp(rx(yc), reach, 0.55), y: yc + w * 0.82 }, { x: rx(yc + w), y: yc + w }], false, 8));
    }
    for (let yc = -620; yc <= 620; yc += 150 + r() * 40) out.push(P.spline([{ x: 240, y: yc + 70 }, { x: 165, y: yc + 36 }, { x: 105, y: yc + 10 }, { x: rx(yc), y: yc }], false, 10));
    return out;
  })();
  // Nerve fibres (x = offset from the mineralisation front, µm). ROOT dentine: endings stay at the pulp–dentine
  // border (odontoblast layer / predentine) and never enter the mineralised dentine (Lilja 1979; Byers & Dong 1983).
  // tipX ≥ PRED + 2 → the fibre ends between odontoblasts; otherwise it runs on into the predentine beside the
  // tubule's pulpal opening (y = ny) and ends at tipX (≥ 1 µm, i.e. still in predentine).
  const fibreCtrl = (Y, gy, y0, tipX, ny) => {
    const P0 = G.PRED;
    const pts = [{ x: 330, y: y0 }, { x: 255, y: lerp(y0, gy, 0.28) }, { x: 170, y: lerp(y0, gy, 0.6) }, { x: 96, y: lerp(y0, gy, 0.86) }, { x: 56, y: gy + 5 },
      { x: P0 + 26, y: gy + 1.2 }, { x: P0 + 15, y: gy }];
    if (tipX >= P0 + 2) { pts.push({ x: lerp(P0 + 15, tipX, 0.5), y: gy }, { x: tipX, y: gy + 0.05 }); return pts; }
    pts.push({ x: P0 + 5, y: gy }, { x: P0 + 1.4, y: gy + 0.04 }, { x: P0 - 1.0, y: lerp(gy, ny, 0.45) }, { x: P0 - 3.2, y: lerp(gy, ny, 0.85) }, { x: P0 - 5.6, y: ny },
      { x: lerp(P0 - 5.6, tipX, 0.5), y: ny + 0.02 }, { x: tipX, y: ny });
    return pts;
  };
  G.fibres = (() => {
    const out = [], r = rng(621);
    for (const kk of [4, -12, 22, -33, 45, -57, 70, -84, 101, -118]) { // sparse in root (Byers & Dong 1983)
      const Y = G.tubY(kk), gy = (G.tubY(kk - 1) + Y) / 2;
      const sd = r() * 50, tip = r() < 0.5 ? G.PRED + 3 + r() * 8 : 2 + r() * (G.PRED - 8);
      out.push(P.spline(fibreCtrl(Y, gy, gy + 135 + r() * 60, tip, Y - 1.0), false, 8).map((p) => ({ x: p.x, y: p.y + 5 * smoothstep(58, 120, p.x) * noise1(p.x / 34 + sd, 13) })));
    }
    for (let i = 0; i < 6; i++) { // a sparse subodontoblastic plexus (it is profuse mainly in the crown)
      const y0 = -600 + r() * 1200, L = 60 + r() * 120, pts = [];
      for (let s2 = 0; s2 <= 12; s2++) pts.push({ x: 46 + 6 * noise1(s2 * 0.5 + i * 3, 12), y: y0 + (L * s2) / 12 });
      out.push(pts);
    }
    return out;
  })();
  G.FTIP = 1.2; // focal ending: tip 1.2 µm pulpal to the mineralisation front, i.e. in predentine
  G.focalFibre = P.spline(fibreCtrl(0, G.gap0, G.gap0 + 160, G.FTIP, -1.0), false, 10).map((p) => ({ x: p.x, y: p.y + 5 * smoothstep(58, 120, p.x) * noise1(p.x / 34 + 7, 13) }));
  G.fibroblasts = (() => { const r = rng(631), out = []; for (let i = 0; i < 2600; i++) { const y = -620 + r() * 1240, z = r(); const xo = z < 0.55 ? 52 + r() * 40 : 92 + r() * 520; out.push({ x: xo, y, a: r() * 3, s: 0.8 + 0.5 * r() }); } return out; })();
  const W_ = (y, xo) => G.wallX(y) + xo; // offset → world x

  // ------------------------------------------------------------------ cellular painter (level 0 = B2, 1 = C, 2 = D)
  // xt (optional, level 0): separate overlay ctx that receives the tubule striations, so reel.js can fade their
  // contrast in only once their on-screen pitch is large enough (no moiré / corduroy during the fast zoom).
  function paintCellular(x, R, cx0, level, xt) {
    const yMin = -R - 2, yMax = R + 2, xMin = cx0 - R - 2, xMax = cx0 + R + 2;
    const kMin = Math.floor(yMin / G.TUB) - 1, kMax = Math.ceil(yMax / G.TUB) + 1;
    const wall = G.wallX, ST = R / 60;
    const inX = (X) => X > xMin - 20 && X < xMax + 20;
    const info = { cells: [], procs: [] };
    // --- pulp base + zones
    const pulpPoly = [];
    for (let y = yMin; y <= yMax; y += ST) pulpPoly.push({ x: wall(y) + G.PRED - 0.5, y });
    pulpPoly.push({ x: xMax + 5, y: yMax }, { x: xMax + 5, y: yMin });
    P.wash(x, pulpPoly, '#f4d3c8', { seed: 401 + level, v: 0.002, layers: 8, a: 0.24 });
    if (level < 2) {
      const band = (o0, o1, col, a, sd) => { const p = []; for (let y = yMin; y <= yMax; y += ST) p.push({ x: W_(y, o0), y }); for (let y = yMax; y >= yMin; y -= ST) p.push({ x: W_(y, o1), y }); P.wash(x, p, col, { seed: sd, v: 0.01, layers: 5, a }); };
      band(G.PRED + 40, G.PRED + 82, '#e9b2b4', 0.12, 405 + level);   // cell-rich zone
      band(G.PRED + 82, 640, '#f7e0d6', 0.12, 407 + level);  // pulp core (looser)
    }
    // --- dentine base
    const dentPoly = [];
    for (let y = yMin; y <= yMax; y += ST) dentPoly.push({ x: wall(y), y });
    dentPoly.push({ x: xMin - 5, y: yMax }, { x: xMin - 5, y: yMin });
    P.wash(x, dentPoly, '#f1dcb2', { seed: 402 + level, v: 0.002, layers: 10, a: 0.24 });
    x.save(); P.path(x, dentPoly); x.clip();
    const xs = xt || x;
    if (xt) { xt.save(); P.path(xt, dentPoly); xt.clip(); }
    { const g = x.createLinearGradient(xMin, 0, 0, 0); g.addColorStop(0, 'rgba(226,186,128,0.05)'); g.addColorStop(1, 'rgba(214,170,114,0.22)'); x.fillStyle = g; x.fillRect(xMin - 5, yMin, xMax - xMin + 10, yMax - yMin); }
    { // intertubular collagen / mineral texture
      const r = rng(403 + level), n = [2600, 1500, 900][level], L0 = [3, 2.2, 0.9][level];
      x.strokeStyle = '#c89a62';
      for (let i = 0; i < n; i++) { const X = xMin + r() * (2 * R), Y = yMin + r() * (2 * R), L = L0 * (0.5 + r()), a = Math.PI / 2 + (r() - 0.5) * 1.1; x.globalAlpha = 0.06 + 0.08 * r(); x.lineWidth = [0.5, 0.25, 0.05][level]; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L); x.stroke(); }
      x.globalAlpha = 1;
    }
    // --- tubules (mineralised dentine)
    const LC = level === 1 ? 0.6 : 1; // plate C: ~40 % less stripe contrast
    for (let kk = kMin; kk <= kMax; kk++) {
      const step = [5, 2, 0.35][level], pts = [];
      for (let X = wall(G.tubY(kk)) + 0.1; X >= xMin - 4; X -= step) pts.push({ x: X, y: G.tubCentre(kk, X) });
      if (pts.length < 2) continue;
      const rad = (X) => 1.25 * (1 - 0.0005 * Math.max(0, -X)); // Ø ≈ 2.5 µm at the pulp, narrowing outward
      if (level === 0) {
        P.line(xs, pts, '#fbf0d8', { w: 3.6, a: 0.36, passes: 1, seed: 410 + kk, wob: 0 });
        P.line(xs, pts, '#a9845c', { w: 2.3, a: 0.32, passes: 1, seed: 411 + kk, wob: 0 });
        const proc = pts.filter((p) => p.x > -260);
        for (let i = 1; i < proc.length; i++) { xs.globalAlpha = 0.32 * smoothstep(-260, -20, proc[i].x); xs.strokeStyle = '#9c7dc3'; xs.lineWidth = 0.9; xs.beginPath(); xs.moveTo(proc[i - 1].x, proc[i - 1].y); xs.lineTo(proc[i].x, proc[i].y); xs.stroke(); }
        xs.globalAlpha = 1;
        continue;
      }
      const top = pts.map((p) => ({ x: p.x, y: p.y - rad(p.x) })), bot = pts.map((p) => ({ x: p.x, y: p.y + rad(p.x) }));
      const lumen = top.concat(bot.slice().reverse());
      // fluid-filled lumen
      P.wash(x, lumen, level === 2 ? (kk === 0 ? '#bcdbe4' : '#d3e6e7') : '#c6b394', { seed: 412 + kk * 7 + level, v: level === 2 ? 0.003 : 0.006, bd: 1, ld: 1, layers: level === 2 ? 6 : 4, a: level === 2 ? 0.3 : 0.2, pool: level === 2 });
      if (level === 1) { x.save(); x.globalAlpha = 0.18; x.fillStyle = '#d8e9ea'; P.path(x, lumen); x.fill(); x.restore(); }
      if (level === 2) {
        x.save(); x.globalAlpha = kk === 0 ? 0.4 : 0.55; x.fillStyle = '#e4f1f3'; P.path(x, lumen.map((p) => ({ x: p.x, y: lerp(p.y, G.tubCentre(kk, p.x), 0.35) }))); x.fill(); x.restore();
        if (kk === 0) { // soft shading of fluid against the tubule wall
          P.line(x, pts.map((p) => ({ x: p.x, y: p.y - rad(p.x) + 0.16 })), '#8ebccb', { w: 0.28, a: 0.45, passes: 1, seed: 415 });
          P.line(x, pts.map((p) => ({ x: p.x, y: p.y + rad(p.x) - 0.16 })), '#8ebccb', { w: 0.28, a: 0.45, passes: 1, seed: 416 });
        }
      }
      // peritubular (hypermineralised) rim + ink wall
      const rw = level === 2 ? 0.28 : 0.55, iw = level === 2 ? 0.07 : 0.22;
      const off = (s, d) => pts.map((p) => ({ x: p.x, y: p.y + s * (rad(p.x) + d) }));
      P.line(x, off(-1, rw / 2), '#fff5df', { w: rw, a: 0.9 * LC, passes: 2, seed: 420 + kk });
      P.line(x, off(1, rw / 2), '#fff5df', { w: rw, a: 0.9 * LC, passes: 2, seed: 421 + kk });
      P.line(x, off(-1, 0), '#7d5a3a', { w: kk === 0 && level === 2 ? 0.09 : iw, a: (kk === 0 && level === 2 ? 0.8 : 0.6) * LC, passes: 1, seed: 422 + kk });
      P.line(x, off(1, 0), '#7d5a3a', { w: kk === 0 && level === 2 ? 0.09 : iw, a: (kk === 0 && level === 2 ? 0.8 : 0.6) * LC, passes: 1, seed: 423 + kk });
      // odontoblast process (neighbours; the focal one is drawn live in reel.js)
      if (!(kk === 0 && level === 2)) {
        const pr = pts.filter((p) => p.x > (level === 2 ? -40 : -170));
        if (level === 2) {
          const pw = (X) => lerp(0.3, 0.44, clamp(1 + X / 16));
          const t2 = pr.map((p) => ({ x: p.x, y: p.y + 0.12 - pw(p.x) })), b2 = pr.map((p) => ({ x: p.x, y: p.y + 0.12 + pw(p.x) }));
          const poly = t2.concat(b2.reverse());
          x.save(); x.globalAlpha = 0.34; x.fillStyle = '#c9b5e3'; P.path(x, poly); x.fill(); x.globalAlpha = 0.35; x.strokeStyle = '#6f53a0'; x.lineWidth = 0.045; x.stroke(); x.restore();
          info.procs.push(poly);
        } else {
          for (let i = 1; i < pr.length; i++) { x.globalAlpha = 0.55 * LC * smoothstep(-170, -25, pr[i].x); x.strokeStyle = '#9c7dc3'; x.lineWidth = 1.0; x.beginPath(); x.moveTo(pr[i - 1].x, pr[i - 1].y + 0.25); x.lineTo(pr[i].x, pr[i].y + 0.25); x.stroke(); }
          x.globalAlpha = 1;
        }
      }
      // lateral branches (canaliculi)
      { const r = rng(430 + kk), nb = level === 2 ? 3 : 2;
        for (let b = 0; b < nb; b++) {
          const X = -(level === 2 ? 2 + r() * 22 : 15 + r() * 160), Yc = G.tubCentre(kk, X), dir = r() < 0.5 ? -1 : 1;
          if (!inX(X)) continue;
          P.line(x, [{ x: X, y: Yc + dir * rad(X) }, { x: X - (level === 2 ? 0.8 : 2.5) * (0.5 + r()), y: Yc + dir * (G.TUB - rad(X)) * (0.55 + 0.4 * r()) }], '#8a6440', { w: level === 2 ? 0.07 : 0.3, a: 0.22, passes: 1, seed: 440 + kk + b });
        } }
    }
    x.restore();
    if (xt) xt.restore();
    // --- predentine (unmineralised; wide enough to hold the root's nerve endings)
    const pre = [];
    for (let y = yMin; y <= yMax; y += ST) pre.push({ x: wall(y) - 0.15, y });
    for (let y = yMax; y >= yMin; y -= ST) pre.push({ x: wall(y) + G.PRED, y });
    P.wash(x, pre, '#f7e3dc', { seed: 450 + level, v: 0.002, layers: 8, a: 0.26 });
    if (level === 2) {
      const r = rng(451); x.strokeStyle = '#d9b9b0';
      for (let i = 0; i < 900; i++) { const y = yMin + r() * 2 * R, X = wall(y) + r() * G.PRED, a = r() * Math.PI; x.globalAlpha = 0.2; x.lineWidth = 0.04; x.beginPath(); x.moveTo(X, y); x.lineTo(X + Math.cos(a) * 0.8, y + Math.sin(a) * 0.8); x.stroke(); }
      x.globalAlpha = 1;
      // predentinal tubules: the lumen continues (unmineralised walls, no peritubular rim), a little wider near the cells
      for (let kk = kMin; kk <= kMax; kk++) {
        const Y = G.tubY(kk), x0 = wall(Y) - 0.05, x1 = wall(Y) + G.PRED + 0.4, hw = (X) => lerp(1.25, 1.65, smoothstep(0, 4, X - x0));
        const tp = [], bp = [];
        for (let X = x0; X <= x1; X += 0.25) { tp.push({ x: X, y: Y - hw(X) }); bp.push({ x: X, y: Y + hw(X) }); }
        P.wash(x, tp.concat(bp.slice().reverse()), kk === 0 ? '#c7e1e8' : '#dde9ea', { seed: 456 + kk * 5, v: 0.003, bd: 1, ld: 1, layers: 5, a: kk === 0 ? 0.3 : 0.22 });
        P.line(x, tp, '#b49a8c', { w: 0.06, a: kk === 0 ? 0.45 : 0.3, passes: 1, seed: 457 + kk });
        P.line(x, bp, '#b49a8c', { w: 0.06, a: kk === 0 ? 0.45 : 0.3, passes: 1, seed: 458 + kk });
      }
    }
    if (level >= 1) { // mineralisation front with calcospherites
      const front = []; for (let y = yMin; y <= yMax; y += ST * 0.5) front.push({ x: wall(y) + 0.1, y });
      P.line(x, front, '#a37a52', { w: level === 2 ? 0.08 : 0.4, a: 0.55, passes: 2, jit: level === 2 ? 0.04 : 0.2, seed: 452 });
      const r = rng(453); x.strokeStyle = '#b48a60';
      for (let i = 0; i < (level === 2 ? 70 : 260); i++) { const y = yMin + r() * 2 * R, rr = (level === 2 ? 0.25 : 0.9) * (0.6 + r()); x.globalAlpha = 0.35; x.lineWidth = level === 2 ? 0.04 : 0.2; x.beginPath(); x.arc(wall(y) + rr * 0.6, y, rr, Math.PI * 0.5, Math.PI * 1.5); x.stroke(); }
      x.globalAlpha = 1;
    }
    // processes crossing the predentine
    for (let kk = kMin; kk <= kMax; kk++) {
      if (kk === 0 && level === 2) continue;
      const Y = G.tubY(kk);
      P.line(x, [{ x: wall(Y), y: Y + 0.25 }, { x: wall(Y) + G.PRED + 0.6, y: Y + 0.2 }], '#9c7dc3', { w: level === 2 ? 1.0 : 1.3, a: level === 2 ? 0.45 : 0.45, passes: 2, seed: 455 + kk });
    }
    // --- odontoblast palisade: columnar cells, apical ends joined (junctional complexes) against the predentine;
    //     length / width jittered ±12 % so the row is not a barcode
    for (let kk = kMin; kk <= kMax; kk++) {
      const Y = G.tubY(kk), h = G.cellHalf(kk), x0 = wall(Y) + G.PRED, x1 = x0 + G.odoLen(kk);
      const wj = 1 + 0.1 * noise1(kk * 2.3 + 5, 22), hiB = Y + (h.hi - Y) * wj, loB = Y + (h.lo - Y) * wj;
      if (level === 0) {
        x.save(); x.globalAlpha = 0.62; x.fillStyle = '#c4abdb'; x.beginPath(); x.roundRect(x0 + 0.2, h.lo - 0.1, x1 - x0, h.hi - h.lo + 0.2, 1.6); x.fill();
        x.globalAlpha = 0.65; x.fillStyle = C.nuc; x.beginPath(); x.ellipse(x1 - 4.2, Y, 2.3, 1.4, 0, 0, Math.PI * 2); x.fill(); x.restore();
        continue;
      }
      const hiA = h.hi + 0.13, loA = h.lo - 0.13; // apical corners nearly touch the neighbours
      const cell = P.spline([{ x: x0 + 0.04, y: Y }, { x: x0 + 0.06, y: lerp(Y, hiA, 0.8) }, { x: x0 + 0.4, y: hiA }, { x: x0 + 3.2, y: lerp(hiA, hiB, 0.7) }, { x: x1 - 4.5, y: hiB - 0.05 }, { x: x1 - 1.3, y: lerp(Y, hiB, 0.72) },
        { x: x1 + 0.2, y: Y }, { x: x1 - 1.3, y: lerp(Y, loB, 0.72) }, { x: x1 - 4.5, y: loB + 0.05 }, { x: x0 + 3.2, y: lerp(loA, loB, 0.7) }, { x: x0 + 0.4, y: loA }, { x: x0 + 0.06, y: lerp(Y, loA, 0.8) }], true, 6);
      info.cells.push({ kk, poly: cell });
      P.wash(x, cell, '#c9b3e0', { seed: 460 + kk * 3 + level, v: 0.01, bd: 1, ld: 2, layers: 7, a: 0.2 });
      x.save(); P.path(x, cell); x.clip(); { const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(236,226,248,0.55)'); g.addColorStop(0.45, 'rgba(200,180,226,0)'); g.addColorStop(1, 'rgba(120,90,170,0.3)'); x.fillStyle = g; x.fillRect(x0 - 1, h.lo - 1, x1 - x0 + 3, h.hi - h.lo + 2); } x.restore();
      x.save(); x.globalAlpha = 0.6; x.strokeStyle = '#6f53a0'; x.lineWidth = level === 2 ? 0.07 : 0.3; P.path(x, cell); x.stroke(); x.restore();
      P.wash(x, P.blob(x1 - 4.2, Y + 0.1 * noise1(kk, 9), 2.4, Math.min(1.5, (h.hi - h.lo) * 0.36), 16, kk + 40, 0.1), C.nuc, { seed: 470 + kk + level, v: 0.02, layers: 6, a: 0.25, edge: 0.45, edgeColor: '#4b3570', ew: level === 2 ? 0.08 : 0.3 });
      const r = rng(480 + kk);
      for (let i = 0; i < (level === 2 ? 40 : 10); i++) { x.globalAlpha = 0.3; x.fillStyle = '#7f62ad'; x.beginPath(); x.arc(x0 + 1.5 + r() * (x1 - x0 - 7), lerp(h.lo, h.hi, 0.15 + 0.7 * r()), level === 2 ? 0.07 + 0.08 * r() : 0.35, 0, Math.PI * 2); x.fill(); }
      x.globalAlpha = 1;
      P.line(x, [{ x: x0 + 0.05, y: hiA }, { x: x0 + 0.9, y: hiA - 0.02 }], '#5b4182', { w: level === 2 ? 0.12 : 0.35, a: 0.4, passes: 1, seed: 490 + kk, wob: 0 }); // junctional complex
    }
    if (level === 2) return info;
    // --- capillaries (shared)
    for (let i = 0; i < G.caps.length; i++) {
      const pts = G.caps[i].map((p) => ({ x: W_(p.y, p.x), y: p.y })).filter((p) => p.y > yMin - 40 && p.y < yMax + 40);
      if (pts.length < 2) continue;
      P.line(x, pts, '#e7a0a6', { w: 8, a: 0.55, passes: 2, jit: 0.4, seed: 510 + i });
      P.line(x, pts, '#f6cfd0', { w: 5.4, a: 0.7, passes: 1, seed: 520 + i });
      const L = pts.length;
      for (let j = 2; j < L - 2; j += level === 1 ? 2 : 3) { const a = Math.atan2(pts[j + 1].y - pts[j - 1].y, pts[j + 1].x - pts[j - 1].x); x.globalAlpha = 0.75; x.fillStyle = C.rbc; x.beginPath(); x.ellipse(pts[j].x, pts[j].y, 2.6, 1.3, a + Math.PI / 2, 0, Math.PI * 2); x.fill(); }
      x.globalAlpha = 1;
      P.line(x, pts.map((p) => ({ x: p.x + 0.3, y: p.y })), C.vessel, { w: 0.5, a: 0.35, passes: 1, seed: 530 + i });
    }
    // --- fibroblasts (cell-rich zone + core)
    for (const f of G.fibroblasts) {
      if (f.y < yMin || f.y > yMax || f.x > xMax + 10) continue;
      const X = W_(f.y, f.x);
      if (!inX(X)) continue;
      x.globalAlpha = 0.45; x.fillStyle = '#7a5fa6'; x.beginPath(); x.ellipse(X, f.y, 2.2 * f.s, 1.0 * f.s, f.a, 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
    if (level === 0) { // larger vessels + the nerve bundle in the pulp core
      const vline = (xo, w, col, a, seed) => { const pts = []; for (let y = yMin; y <= yMax; y += 6) pts.push({ x: W_(y, xo + 8 * noise1(y / 160, seed)), y }); P.line(x, pts, col, { w, a, passes: 3, jit: 1.5, seed }); return pts; };
      vline(235, 42, '#c9566a', 0.5, 541); vline(235, 16, '#f2c9cc', 0.8, 542);           // arteriole (thick wall, narrow lumen)
      vline(470, 92, '#c25a6c', 0.3, 543); vline(470, 80, '#d9707f', 0.35, 544);        // venule (thin wall, RBC-filled)
      const bun = vline(330, 54, '#f3d88e', 0.65, 545);
      for (const d of [-16, -6, 5, 15]) P.line(x, bun.map((p) => ({ x: p.x + d + 1.5 * noise1(p.y / 30, d), y: p.y })), C.nerve, { w: 2.4, a: 0.5, passes: 1, seed: 546 + d });
      P.line(x, bun.map((p) => ({ x: p.x - 27, y: p.y })), '#c8962f', { w: 1.0, a: 0.5, passes: 1, seed: 551 });
      P.line(x, bun.map((p) => ({ x: p.x + 27, y: p.y })), '#c8962f', { w: 1.0, a: 0.5, passes: 1, seed: 552 });
    }
    // --- nerve fibres (sparse plexus + endings at the pulp–dentine border), focal fibre last
    const drawFib = (pts, sd, focal) => {
      const q = pts.map((p) => ({ x: W_(p.y, p.x), y: p.y, o: p.x })).filter((p) => p.y > yMin - 30 && p.y < yMax + 30 && p.x < xMax + 30);
      if (q.length < 2) return;
      P.line(x, q, '#f6dc94', { w: level === 0 ? 3.4 : 2.0, a: 0.35, passes: 1, seed: sd });
      P.line(x, q, C.nerve, { w: level === 0 ? 1.5 : (focal ? 0.55 : 0.45), a: 0.85, passes: 2, seed: sd + 1 });
      if (level === 1) { const tip = q.filter((p) => p.o < G.PRED - 5); for (let j = 0; j < tip.length; j += 4) { x.globalAlpha = 0.9; x.fillStyle = C.nerve; x.beginPath(); x.ellipse(tip[j].x, tip[j].y, 0.45, 0.35, 0, 0, Math.PI * 2); x.fill(); } x.globalAlpha = 1; }
    };
    G.fibres.forEach((f, i) => drawFib(f, 560 + i * 3, false));
    drawFib(G.focalFibre, 640, true);
    return info;
  }

  // ------------------------------------------------------------------ PLATE B2 — inner dentine, odontoblast layer and pulp (r 600 µm)
  P.buildB2 = () => {
    const k = 2.5, R = 600, ox = -R, oy = -R;
    const pl = makePlate(ox, oy, 2 * R, 2 * R, k), plT = makePlate(ox, oy, 2 * R, 2 * R, k);
    paintCellular(pl.ctx, R, 0, 0, plT.ctx);
    grainOver(pl, P.grainTile(15, 256, 0.1), 0.18);
    blooms(pl, 18, 70, 200, 581, 0.05);
    featherRadial(pl, 0, 0, 470, R); featherRadial(plT, 0, 0, 470, R);
    const out = finish(pl, { cx: 0, cy: 0, r0: 470 }, 2, 2);
    out.over = finish(plT, { cx: 0, cy: 0, r0: 470 }, 2, 2);
    return out;
  };
  // ------------------------------------------------------------------ PLATE C — dentine near the pulp (r 190 µm)
  P.buildC = () => {
    const k = 8, R = 190, ox = -R, oy = -R;
    const pl = makePlate(ox, oy, 2 * R, 2 * R, k);
    paintCellular(pl.ctx, R, 0, 1);
    grainOver(pl, P.grainTile(13, 256, 0.1), 0.16);
    blooms(pl, 16, 80, 220, 601, 0.05);
    featherRadial(pl, 0, 0, 150, R);
    return finish(pl, { cx: 0, cy: 0, r0: 150 }, 2, 2);
  };
  // ------------------------------------------------------------------ PLATE D — single tubule close-up background (r 26 µm)
  P.buildD = () => {
    const k = 52, R = 26, ox = -R, oy = -R;
    const pl = makePlate(ox, oy, 2 * R, 2 * R, k);
    const info = paintCellular(pl.ctx, R, 0, 2);
    grainOver(pl, P.grainTile(14, 256, 0.08), 0.12);
    blooms(pl, 10, 150, 380, 701, 0.045);
    { // depth of field: the focal tubule + its odontoblast stay sharp; neighbouring tubules blur strongly,
      // the cell-body band only half as much (so the lower frame reads as painted, not out of focus)
      const w = pl.canvas.width, h = pl.canvas.height;
      const fy = (yy) => (yy - oy) / (2 * R), fx = (xx) => (xx - ox) / (2 * R);
      const layer = (blurPx, keepCells) => {
        const bc = P.canvas(w, h), bx = bc.getContext('2d');
        bx.filter = `blur(${blurPx}px)`; bx.drawImage(pl.canvas, 0, 0); bx.filter = 'none';
        bx.globalCompositeOperation = 'destination-in';
        const g = bx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(fy(-4.9), 'rgba(0,0,0,1)'); g.addColorStop(fy(-2.75), 'rgba(0,0,0,0)');
        g.addColorStop(fy(2.55), 'rgba(0,0,0,0)'); g.addColorStop(fy(4.7), 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,1)');
        bx.fillStyle = g; bx.fillRect(0, 0, w, h);
        const gx = bx.createLinearGradient(0, 0, w, 0), a0 = keepCells ? 0 : 1;
        gx.addColorStop(0, `rgba(0,0,0,${a0})`); gx.addColorStop(fx(G.PRED - 1), `rgba(0,0,0,${a0})`); gx.addColorStop(fx(G.PRED + 2.5), `rgba(0,0,0,${1 - a0})`); gx.addColorStop(1, `rgba(0,0,0,${1 - a0})`);
        bx.fillStyle = gx; bx.fillRect(0, 0, w, h);
        bx.globalCompositeOperation = 'source-atop'; bx.globalAlpha = 0.22; bx.fillStyle = '#f4ead9'; bx.fillRect(0, 0, w, h);
        return bc;
      };
      const far = layer(20, false), near = layer(10, true);
      const x = pl.ctx; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.drawImage(far, 0, 0); x.drawImage(near, 0, 0); x.restore();
      // pigment-pooled rims on the soft neighbours (wet-in-wet look rather than "out of focus")
      x.save(); x.lineJoin = 'round';
      for (const cl of info.cells) if (Math.abs(G.tubY(cl.kk)) > 3) { x.globalAlpha = 0.3; x.strokeStyle = '#7a5ea6'; x.lineWidth = 3 / k; P.path(x, cl.poly); x.stroke(); x.globalAlpha = 0.12; x.lineWidth = 7 / k; x.stroke(); }
      for (const poly of info.procs) { x.globalAlpha = 0.22; x.strokeStyle = '#8a6cb8'; x.lineWidth = 2.6 / k; P.path(x, poly); x.stroke(); }
      x.restore();
    }
    featherRadial(pl, 0, 0, 19.5, R);
    return finish(pl, { cx: 0, cy: 0, r0: 19.5 }, 2, 2);
  };

  window.WC = P;
})();
