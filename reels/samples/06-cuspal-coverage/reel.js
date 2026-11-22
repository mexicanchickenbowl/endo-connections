/*
 * 06 · Why cover the cusps? — BLUEPRINT style engineering drawing that animates.
 * Deterministic: everything drawn in render(t) from t only.
 * Geometry is defined in millimetres (x: buccal −, lingual +; y: up, 0 = CEJ) and mapped to px.
 */
(() => {
  const { canvas, ctx } = Kit.createCanvas();
  const { W, H, clamp, lerp, seg, env, ease } = Kit;

  // ------------------------------------------------------------------ palette & type
  const C = {
    bgIn: '#13528f', bgOut: '#072447',
    ink: '#eef7ff', cyan: '#8fdcff', amber: '#ffc95c', coral: '#ff7a68', mint: '#8ff2cf',
    deep: '#0a2a52', paper: '#dff3ff',
  };
  const FH = '"Share Tech Mono", "JetBrains Mono", monospace';
  const FB = '"IBM Plex Mono", "JetBrains Mono", monospace';
  const rgba = Kit.rgba;
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ timeline (s)
  // stage starts: A intact · B access+RCT · C MOD · D onlay · E clinical outcome · F takeaway
  const A0 = 2.0, B0 = 5.05, C0 = 8.67, D0 = 12.42, E0 = 16.72, F0 = 20.57, DUR = 25.6;
  const TB = { plan: [B0 + 0.05, B0 + 0.4], rem: [B0 + 0.4, B0 + 0.85], planFade: [B0 + 0.75, B0 + 1.05], gp: [B0 + 0.85, B0 + 1.25] };
  const TC = {
    zin: [C0, C0 + 0.3], zout: [C0 + 1.25, C0 + 1.55], plan: [C0 + 0.05, C0 + 0.4], rem: [C0 + 0.4, C0 + 0.85], planFade: [C0 + 0.75, C0 + 1.05],
    slot: [C0 + 0.1, C0 + 0.9], snap: [C0 + 0.51, C0 + 0.86], hidden: [C0 + 0.85, C0 + 1.15],
  };
  const TD = {
    plan: [D0 + 0.05, D0 + 0.45], planFade: [D0 + 0.8, D0 + 1.1], rem: [D0 + 0.45, D0 + 0.95], core: [D0 + 0.9, D0 + 1.3],
    onlay: [D0 + 1.3, D0 + 1.9], planOnlay: [D0 + 1.4, D0 + 2.0],
  };
  // load test cycles per stage: approach, ramp, release, retract; bar fills AFTER the load peaks
  const DPX0 = 17; // schematic cusp-tip deflection (px) for the intact tooth; others scale as 1/relative stiffness
  const CYC = [
    { a: [A0, A0 + 0.2], r: [A0 + 0.25, A0 + 0.95], s: [A0 + 2.35, A0 + 2.7], b: [A0 + 2.7, A0 + 2.9], K: DPX0 / 1.00, bar: [A0 + 1.0, A0 + 1.55] },
    { a: [B0 + 1.1, B0 + 1.3], r: [B0 + 1.3, B0 + 1.8], s: [B0 + 2.95, B0 + 3.25], b: [B0 + 3.25, B0 + 3.45], K: DPX0 / 0.95, bar: [B0 + 1.85, B0 + 2.35] },
    { a: [C0 + 1.5, C0 + 1.7], r: [C0 + 1.7, C0 + 2.55], s: [C0 + 3.35, C0 + 3.65], b: [C0 + 3.65, C0 + 3.85], K: DPX0 / 0.37, bar: [C0 + 2.6, C0 + 3.2] },
    { a: [D0 + 2.0, D0 + 2.2], r: [D0 + 2.2, D0 + 2.9], s: null, b: null, K: DPX0 / 2.11, bar: [D0 + 2.95, D0 + 3.45] },
  ];
  const BARS = [
    { k: 'A', v: 100, col: C.ink },
    { k: 'B', v: 95, col: C.cyan },
    { k: 'C', v: 37, col: C.coral },
    { k: 'D', v: 211, col: C.mint },
  ];

  // ------------------------------------------------------------------ section mapping
  const S = 44, OX = 380, OY = 985;     // 1 mm = 44 px ; CEJ centre at (380,985)
  const Y0 = 0.6, YT = 7.5;
  let DEF = 0;                          // current cusp-tip lateral deflection (mm)
  function def(x, y) {
    if (DEF === 0 || y <= Y0) return [x, y];
    const f = Math.pow((y - Y0) / (YT - Y0), 1.6);
    const s = Math.tanh(x / 0.9);
    return [x + DEF * s * f, y - 0.1 * DEF * Math.abs(s) * f];
  }
  const px = (x, y) => { const d = def(x, y); return [OX + d[0] * S, OY - d[1] * S]; };
  const pxRaw = (x, y) => [OX + x * S, OY - y * S];
  const shift = (dy) => (x, y) => px(x, y + dy);

  // ------------------------------------------------------------------ geometry helpers
  function catmull(pts, n = 8, closed = false) {
    const out = [], N = pts.length;
    const g = (i) => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < n; k++) {
        const u = k / n, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    if (!closed) out.push(pts[N - 1].slice());
    return out;
  }
  function cumLen(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function partial(pts, u, cl) {
    if (u >= 1) return pts;
    if (u <= 0) return [];
    cl = cl || cumLen(pts);
    const L = cl[cl.length - 1] * u, out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (cl[i] >= L) { const k = (L - cl[i - 1]) / (cl[i] - cl[i - 1] || 1); out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); break; }
      out.push(pts[i]);
    }
    return out;
  }
  function trace(c, pts, closed, map) {
    c.beginPath();
    for (let i = 0; i < pts.length; i++) { const p = map(pts[i][0], pts[i][1]); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
    if (closed) c.closePath();
  }
  function trace2(c, pts, map) { // add closed subpath without beginPath
    for (let i = 0; i < pts.length; i++) { const p = map(pts[i][0], pts[i][1]); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
    c.closePath();
  }
  function area(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  const orient = (pts) => (area(pts) < 0 ? pts.slice().reverse() : pts);
  function hatchSet(angDeg, sp, bb, step = 0.22) {
    const a = (angDeg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
    const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, dc = cx * nx + cy * ny;
    let mn = Infinity, mx = -Infinity;
    for (const [x, y] of [[bb[0], bb[1]], [bb[2], bb[1]], [bb[0], bb[3]], [bb[2], bb[3]]]) { const d = x * nx + y * ny; mn = Math.min(mn, d); mx = Math.max(mx, d); }
    const L = Math.hypot(bb[2] - bb[0], bb[3] - bb[1]), lines = [];
    for (let d = Math.ceil(mn / sp) * sp; d <= mx; d += sp) {
      const x0 = cx + (d - dc) * nx, y0 = cy + (d - dc) * ny, pts = [];
      for (let s = -L / 2; s <= L / 2; s += step) {
        const x = x0 + dx * s, y = y0 + dy * s;
        if (x >= bb[0] - step && x <= bb[2] + step && y >= bb[1] - step && y <= bb[3] + step) pts.push([x, y]);
      }
      if (pts.length > 1) lines.push(pts);
    }
    return lines;
  }
  function strokeLines(c, lines, map) {
    c.beginPath();
    for (const ln of lines) for (let i = 0; i < ln.length; i++) { const p = map(ln[i][0], ln[i][1]); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
    c.stroke();
  }

  // ------------------------------------------------------------------ tooth geometry (mm)
  const crown = catmull([[-4.0, 0], [-4.42, 1.2], [-4.5, 2.5], [-4.3, 4.0], [-3.78, 5.55], [-3.12, 6.8], [-2.4, 7.5], [-1.72, 7.18], [-0.95, 6.15], [-0.38, 5.32], [0, 5.05],
    [0.38, 5.3], [0.92, 6.0], [1.7, 6.95], [2.4, 7.25], [3.1, 6.62], [3.78, 5.3], [4.28, 3.6], [4.3, 2.2], [4.02, 0.9], [3.8, 0]], 7);
  const rootL = catmull([[3.8, 0], [3.62, -1.5], [3.38, -3], [3.12, -4.6]], 6);
  const rootB = catmull([[-4.0, 0], [-3.82, -1.5], [-3.52, -3], [-3.25, -4.6]], 6);
  const outline = crown.concat(rootL.slice(1), rootB.slice().reverse().slice(0, -1));
  const outlineOpen = rootB.slice().reverse().concat(crown.slice(1), rootL.slice(1)); // for plotter draw-in (bottom-left → bottom-right)
  const outlineOpenCL = cumLen(outlineOpen);
  const dej = catmull([[-4.0, 0], [-3.96, 1.2], [-3.76, 2.6], [-3.3, 4.2], [-2.66, 5.4], [-2.1, 5.85], [-1.45, 5.55], [-0.8, 4.65], [0, 4.18], [0.8, 4.6], [1.45, 5.35],
    [2.05, 5.62], [2.66, 5.1], [3.26, 3.9], [3.62, 2.5], [3.7, 1.1], [3.8, 0]], 6);
  const dejCL = cumLen(dej);
  const enamel = crown.concat(dej.slice().reverse());
  const pulp = catmull([[-0.3, -4.6], [-0.42, -2.5], [-0.62, -0.6], [-0.98, 0.8], [-1.2, 2.2], [-1.26, 3.2], [-1.12, 3.95], [-0.8, 3.72], [-0.3, 3.5], [0, 3.46], [0.3, 3.5],
    [0.8, 3.68], [1.08, 3.85], [1.22, 3.1], [1.16, 2.1], [0.94, 0.8], [0.6, -0.6], [0.4, -2.5], [0.28, -4.6]], 6);
  const pulpCL = cumLen(pulp);
  const cutPts = (w) => [[-w, 12], [-w, 6.5], [-w - 0.01, 5.2], [-w + 0.02, 4.3], [-1.31, 3.25], [-1.25, 2.2], [-1.03, 0.8], [-0.68, 0.14], [-0.45, 0.0],
    [0.45, 0.0], [0.65, 0.14], [0.99, 0.8], [1.21, 2.1], [1.27, 3.15], [w - 0.02, 4.2], [w, 5.2], [w, 6.5], [w, 12]];
  const smoothCut = (p) => [p[0]].concat(catmull(p.slice(1, -1), 5), [p[p.length - 1]]);
  const cutB = orient(smoothCut(cutPts(1.2)));
  const cutC = orient(smoothCut(cutPts(1.38)));
  const redD = orient([[-6.5, 12], [-6.5, 5.0]].concat(catmull([[-3.42, 5.0], [-2.98, 5.42], [-2.4, 5.62], [-1.95, 5.42], [-1.5, 5.3], [-1.0, 5.28], [1.0, 5.2], [1.5, 5.22], [1.95, 5.28], [2.4, 5.4], [2.92, 5.18], [3.52, 4.72]], 5), [[6.5, 4.72], [6.5, 12]]));
  const redLine = catmull([[-4.2, 5.0], [-3.42, 5.0], [-2.98, 5.42], [-2.4, 5.62], [-1.95, 5.42], [-1.38, 5.3]], 6);
  const redLineL = catmull([[1.38, 5.22], [1.95, 5.28], [2.4, 5.4], [2.92, 5.18], [3.52, 4.72], [4.35, 4.72]], 6);
  const YCORE = 3.6;
  // hidden proximal-box edges (behind the section plane) for the MOD stage
  const boxHidden = [
    [[-1.75, 7.2], [-1.75, 1.6], [-1.26, 1.6]],
    [[1.75, 6.98], [1.75, 1.6], [1.2, 1.6]],
  ];
  // hatch sets
  const hDentin = hatchSet(45, 0.42, [-4.8, -4.8, 4.8, 7.8]);
  const hEnamel = hatchSet(45, 0.21, [-4.8, 0, 4.8, 7.8]).concat(hatchSet(-45, 0.42, [-4.8, 0, 4.8, 7.8]));
  const hGP = hatchSet(-60, 0.16, [-1, -4.8, 1, 0.2], 0.3);
  const hOnlay = hatchSet(45, 0.3, [-4.8, 3.4, 4.8, 12]).concat(hatchSet(-45, 0.3, [-4.8, 3.4, 4.8, 12]));
  const hMount = hatchSet(-45, 0.55, [-6.4, -4.8, 6.4, -1.9], 0.5);
  const hBall = hatchSet(45, 0.26, [-2, 5, 2, 12], 0.3);
  const coreDots = [];
  for (let j = 0, y = 0.05; y < YCORE; y += 0.27, j++) for (let x = -1.8 + (j % 2) * 0.135; x < 1.8; x += 0.27) coreDots.push([x, y]);

  // ------------------------------------------------------------------ plan (occlusal) view
  const S2 = 25, PX0 = 860, PY0 = 620;
  const pp = (x, y) => [PX0 + x * S2, PY0 + y * S2];
  const planOutline = [];
  for (let i = 0; i < 160; i++) {
    const th = (i / 160) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
    const x = 4.5 * Math.sign(c) * Math.pow(Math.abs(c), 0.8);
    const b = 3.3 - 0.2 * Math.tanh(x / 1.5);
    planOutline.push([x, b * Math.sign(s) * Math.pow(Math.abs(s), 0.85)]);
  }
  const table = planOutline.map(([x, y]) => [x * 0.6, y * 0.66]);
  const hPlan = hatchSet(45, 0.42, [-4.6, -3.6, 4.6, 3.6], 0.6).concat(hatchSet(-45, 0.42, [-4.6, -3.6, 4.6, 3.6], 0.6));
  const accPts = []; for (let i = 0; i <= 48; i++) { const th = (i / 48) * Math.PI * 2; accPts.push([1.2 * Math.cos(th), 0.8 * Math.sin(th)]); }
  const slot = (hh) => {
    const iy = Math.min(hh, 2.3), pts = [[-1.38, -iy], [1.38, -iy]];
    if (hh > 2.3) pts.splice(1, 0, [-1.38, -2.3], [-1.75, -2.5], [-1.75, -hh], [1.75, -hh], [1.75, -2.5], [1.38, -2.3]);
    const top = pts; const bot = top.map(([x, y]) => [x, -y]).reverse();
    return top.concat(bot);
  };
  const TIE_Y = 2.6, TIE_X = 2.85;
  // zoomed "detail" of the occlusal view during the MOD cut
  const ZX = 745, ZY = 652, ZS = 1.5;
  const zoomAt = (t) => seg(t, TC.zin[0], TC.zin[1], ease.inOut) * (1 - seg(t, TC.zout[0], TC.zout[1], ease.inOut));

  // ------------------------------------------------------------------ canvases
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const layer = document.createElement('canvas'); layer.width = W; layer.height = H;
  const L = layer.getContext('2d');
  const dimMask = document.createElement('canvas'); dimMask.width = W; dimMask.height = H;
  const stamp = document.createElement('canvas'); stamp.width = 320; stamp.height = 120;

  function buildBackground() {
    const b = bg.getContext('2d');
    const g = b.createRadialGradient(540, 860, 80, 540, 900, 1250);
    g.addColorStop(0, C.bgIn); g.addColorStop(0.6, '#0d3d72'); g.addColorStop(1, C.bgOut);
    b.fillStyle = g; b.fillRect(0, 0, W, H);
    // cyanotype mottling (low-freq) + grain
    const sm = document.createElement('canvas'); sm.width = 108; sm.height = 192;
    const sc = sm.getContext('2d'), id = sc.createImageData(108, 192);
    for (let y = 0; y < 192; y++) for (let x = 0; x < 108; x++) {
      const n = Kit.noise2(x / 14, y / 14, 7) * 0.6 + Kit.noise2(x / 5, y / 5, 9) * 0.4;
      const i = (y * 108 + x) * 4, v = n > 0 ? 255 : 0;
      id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v; id.data[i + 3] = Math.abs(n) * 26;
    }
    sc.putImageData(id, 0, 0);
    b.imageSmoothingEnabled = true; b.drawImage(sm, 0, 0, W, H);
    const gr = b.getImageData(0, 0, W, H), d = gr.data;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) { const n = (Kit.hash(p, 3) - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    b.putImageData(gr, 0, 0);
    // grid
    b.lineWidth = 1;
    for (let x = 4; x < W; x += 16) { b.strokeStyle = rgba(C.cyan, (x - 4) % 80 === 0 ? 0.13 : 0.05); b.beginPath(); b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H); b.stroke(); }
    for (let y = 6; y < H; y += 16) { b.strokeStyle = rgba(C.cyan, (y - 6) % 80 === 0 ? 0.13 : 0.05); b.beginPath(); b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); b.stroke(); }
    // vignette
    const v = b.createRadialGradient(540, 900, 500, 540, 900, 1300);
    v.addColorStop(0, 'rgba(0,10,30,0)'); v.addColorStop(1, 'rgba(0,10,30,0.45)');
    b.fillStyle = v; b.fillRect(0, 0, W, H);
    // sheet border with zone markers
    b.strokeStyle = rgba(C.ink, 0.45); b.lineWidth = 1.5; b.strokeRect(22.5, 22.5, W - 45, H - 45);
    b.strokeStyle = rgba(C.ink, 0.75); b.lineWidth = 3; b.strokeRect(42, 42, W - 84, H - 84);
    b.font = `16px ${FH}`; b.fillStyle = rgba(C.ink, 0.5); b.textAlign = 'center'; b.textBaseline = 'middle';
    const cols = 6, rows = 8;
    for (let i = 0; i <= cols; i++) {
      const x = 42 + ((W - 84) * i) / cols;
      b.strokeStyle = rgba(C.ink, 0.45); b.lineWidth = 1.5;
      b.beginPath(); b.moveTo(x, 22); b.lineTo(x, 42); b.moveTo(x, H - 42); b.lineTo(x, H - 22); b.stroke();
      if (i < cols) { b.fillText(String(i + 1), x + (W - 84) / cols / 2, 32); b.fillText(String(i + 1), x + (W - 84) / cols / 2, H - 32); }
    }
    for (let j = 0; j <= rows; j++) {
      const y = 42 + ((H - 84) * j) / rows;
      b.beginPath(); b.moveTo(22, y); b.lineTo(42, y); b.moveTo(W - 42, y); b.lineTo(W - 22, y); b.stroke();
      if (j < rows) { const ch = 'ABCDEFGH'[j], yy = y + (H - 84) / rows / 2; b.fillText(ch, 32, yy); b.fillText(ch, W - 32, yy); }
    }
    // centring marks
    b.strokeStyle = rgba(C.ink, 0.6); b.lineWidth = 2;
    for (const [x0, y0, x1, y1] of [[W / 2, 22, W / 2, 62], [W / 2, H - 22, W / 2, H - 62], [22, H / 2, 62, H / 2], [W - 22, H / 2, W - 62, H / 2]]) { b.beginPath(); b.moveTo(x0, y0); b.lineTo(x1, y1); b.stroke(); }
  }
  function buildDimMask() {
    // full drawing area inside the sheet border, feathered ~40 px
    const m = dimMask.getContext('2d');
    m.clearRect(0, 0, W, H);
    m.save(); m.beginPath(); m.rect(44, 434, W - 88, 762); m.clip();
    m.filter = 'blur(14px)';
    m.fillStyle = '#061a38'; m.fillRect(62, 452, W - 124, 726);
    m.filter = 'none';
    m.restore();
  }
  function buildStamp() {
    const s = stamp.getContext('2d');
    s.clearRect(0, 0, 320, 120);
    s.strokeStyle = C.amber; s.fillStyle = C.amber;
    s.lineWidth = 5; s.strokeRect(14, 14, 292, 92);
    s.lineWidth = 2; s.strokeRect(24, 24, 272, 72);
    s.font = `52px ${FH}`; s.textAlign = 'center'; s.textBaseline = 'middle';
    s.letterSpacing = '5px';
    s.fillText('APPROVED', 162, 62);
    // ink speckle (rubber-stamp texture): punch small holes deterministically
    s.globalCompositeOperation = 'destination-out';
    const r = Kit.rng(606);
    for (let i = 0; i < 420; i++) { const x = r() * 320, y = r() * 120, rr = 0.6 + r() * 1.8; s.globalAlpha = 0.35 + r() * 0.6; s.beginPath(); s.arc(x, y, rr, 0, TAU); s.fill(); }
    s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
  }

  // ------------------------------------------------------------------ text helpers
  function text(c, s, x, y, o = {}) {
    c.save();
    c.font = o.font || `30px ${FH}`; c.fillStyle = o.color || C.ink;
    c.globalAlpha *= o.alpha != null ? o.alpha : 1;
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.ls) c.letterSpacing = o.ls + 'px';
    c.fillText(s, x, y);
    c.restore();
  }
  function textW(s, font, ls = 0) { ctx.save(); ctx.font = font; ctx.letterSpacing = ls ? ls + 'px' : '0px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
  // largest size in [min,max] whose width fits maxW
  function fitSize(s, fam, max, min, maxW) { for (let f = max; f > min; f -= 0.5) if (textW(s, `${f}px ${fam}`) <= maxW) return f; return min; }
  // rich line: segs = [[str, color], ...]; reveal = number of chars visible
  function rich(c, segs, x, y, font, reveal = 1e9, alpha = 1) {
    c.save(); c.font = font; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.globalAlpha *= alpha;
    let cx = x, n = reveal;
    for (const [s, col] of segs) {
      if (n <= 0) break;
      const vis = s.slice(0, Math.max(0, Math.min(s.length, n)));
      c.fillStyle = col; c.fillText(vis, cx, y);
      cx += c.measureText(s).width; n -= s.length;
    }
    c.restore();
  }
  const segLen = (segs) => segs.reduce((a, s) => a + s[0].length, 0);

  function arrowHead(c, x, y, ang, size = 14) {
    c.beginPath(); c.moveTo(x, y);
    c.lineTo(x - size * Math.cos(ang - 0.38), y - size * Math.sin(ang - 0.38));
    c.lineTo(x - size * Math.cos(ang + 0.38), y - size * Math.sin(ang + 0.38));
    c.closePath(); c.fill();
  }
  function arrow(c, x0, y0, x1, y1, col, lw, head, a = 1) {
    if (a <= 0) return;
    const ang = Math.atan2(y1 - y0, x1 - x0);
    c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(ang) * head * 0.6, y1 - Math.sin(ang) * head * 0.6); c.stroke();
    arrowHead(c, x1, y1, ang, head); c.restore();
  }
  function dashLine(c, x0, y0, x1, y1, dash, w, col, a = 1) {
    c.save(); c.setLineDash(dash); c.lineWidth = w; c.strokeStyle = col; c.globalAlpha *= a;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore();
  }
  function leader(c, x0, y0, x1, y1, col, a) { // leader line with dot at target
    c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.beginPath(); c.arc(x1, y1, 3.5, 0, TAU); c.fill(); c.restore();
  }
  function elbow(c, x0, y0, xe, x1, y1, col, a) { // horizontal run to xe, then a short angled run to the target
    c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(xe, y0); c.lineTo(x1, y1); c.stroke();
    c.beginPath(); c.arc(x1, y1, 3.5, 0, TAU); c.fill(); c.restore();
  }
  // drafting revision cloud: scallops along an ellipse, drawn progressively (u 0..1)
  function cloud(c, cx, cy, rx, ry, n, u, col, a, lw = 2.4) {
    if (u <= 0 || a <= 0) return;
    c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath();
    const m = Math.min(n, Math.ceil(n * u - 1e-6));
    for (let k = 0; k < m; k++) {
      const a0 = (k / n) * TAU - Math.PI / 2, a1 = ((k + 1) / n) * TAU - Math.PI / 2;
      const p0 = [cx + rx * Math.cos(a0), cy + ry * Math.sin(a0)], p1 = [cx + rx * Math.cos(a1), cy + ry * Math.sin(a1)];
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, r = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2;
      const st = Math.atan2(p0[1] - my, p0[0] - mx);
      const am = (a0 + a1) / 2, nOut = Math.atan2(Math.sin(am) / ry, Math.cos(am) / rx);
      const ccw = Math.cos(st + Math.PI / 2 - nOut) < 0;
      const frac = k === m - 1 ? clamp(n * u - k) : 1;
      c.moveTo(p0[0], p0[1]); c.arc(mx, my, r, st, ccw ? st - Math.PI * frac : st + Math.PI * frac, ccw);
    }
    c.stroke(); c.restore();
  }
  function triPath(c, x, y, side) { // equilateral triangle centred (centroid) at x,y
    const h = side * Math.sqrt(3) / 2;
    c.beginPath(); c.moveTo(x, y - (2 * h) / 3); c.lineTo(x + side / 2, y + h / 3); c.lineTo(x - side / 2, y + h / 3); c.closePath();
  }
  function triTag(c, x, y, letter, a, side = 36) {
    if (a <= 0) return;
    c.save(); c.globalAlpha *= a;
    triPath(c, x, y, side); c.fillStyle = 'rgba(8,36,70,0.95)'; c.fill(); c.strokeStyle = C.amber; c.lineWidth = 2.2; c.stroke();
    c.restore();
    text(c, letter, x, y + side * 0.2, { font: `${Math.round(side * 0.55)}px ${FH}`, color: C.amber, align: 'center', alpha: a });
  }

  // ------------------------------------------------------------------ time-derived state
  function loadAt(t) {
    if (t >= F0) return 0.8 + 0.2 * Math.cos(Math.PI * (t - F0)); // gentle 0.5 Hz load cycle on the onlay tooth
    let l = 0;
    for (const cy of CYC) { l += seg(t, cy.r[0], cy.r[1], ease.inOut); if (cy.s) l -= seg(t, cy.s[0], cy.s[1], ease.inOut); }
    return clamp(l);
  }
  function liftAt(t) {
    let l = 1;
    for (const cy of CYC) { l -= seg(t, cy.a[0], cy.a[1], ease.inOut); if (cy.b) l += seg(t, cy.b[0], cy.b[1], ease.inOut); }
    return clamp(l);
  }
  // extra lift during REV D so the dropping onlay never meets the sphere
  const highLiftAt = (t) => seg(t, D0 - 0.2, D0 + 0.2, ease.inOut) * (1 - seg(t, D0 + 1.85, D0 + 2.1, ease.inOut));
  const stageIdx = (t) => (t < B0 ? 0 : t < C0 ? 1 : t < D0 ? 2 : 3);

  // ------------------------------------------------------------------ section drawing (tooth layer)
  function drawToothLayer(t, intro) {
    L.setTransform(1, 0, 0, 1, 0, 0);
    L.clearRect(0, 0, W, H);
    L.lineJoin = 'round'; L.lineCap = 'round';
    const hatchU = intro.hatch;
    // --- dentin
    L.save();
    trace(L, outline, true, px); L.clip();
    L.fillStyle = rgba(C.ink, 0.05 * intro.fill); L.fillRect(0, 0, W, H);
    if (hatchU > 0) {
      L.save(); L.beginPath(); L.rect(0, 0, W, 520 + 700 * hatchU); L.clip();
      L.strokeStyle = rgba(C.ink, 0.2); L.lineWidth = 1.3; strokeLines(L, hDentin, px);
      L.restore();
    }
    L.restore();
    // --- enamel
    L.save();
    trace(L, enamel, true, px); L.clip();
    L.fillStyle = rgba(C.ink, 0.09 * intro.fill); L.fillRect(0, 0, W, H);
    if (hatchU > 0) {
      L.save(); L.beginPath(); L.rect(0, 0, W, 520 + 700 * hatchU); L.clip();
      L.strokeStyle = rgba(C.ink, 0.26); L.lineWidth = 1.1; strokeLines(L, hEnamel, px);
      L.restore();
    }
    L.restore();
    // --- pulp void
    const gpU = seg(t, TB.gp[0], TB.gp[1], ease.inOut);
    L.save();
    L.globalCompositeOperation = 'destination-out';
    trace(L, pulp, true, px); L.fillStyle = '#000'; L.fill();
    L.restore();
    L.save(); trace(L, pulp, true, px); L.fillStyle = rgba(C.cyan, 0.07 * intro.pulp); L.fill(); L.restore();
    // --- gutta-percha (obturation, fills from apex up)
    if (gpU > 0) {
      const lvl = lerp(-4.7, 0.05, gpU);
      L.save();
      trace(L, pulp, true, px); L.clip();
      const yTop = OY - Math.min(lvl, 0.05) * S;
      L.beginPath(); L.rect(0, yTop, W, H); L.clip();
      L.fillStyle = rgba(C.amber, 0.28); L.fillRect(0, 0, W, H);
      L.strokeStyle = rgba(C.amber, 0.85); L.lineWidth = 1.4; strokeLines(L, hGP, px);
      L.restore();
    }
    // --- outlines
    L.lineWidth = 3.2; L.strokeStyle = C.ink;
    trace(L, partial(outlineOpen, intro.outline, outlineOpenCL), false, px); L.stroke();
    L.lineWidth = 1.5; L.strokeStyle = rgba(C.ink, 0.7);
    trace(L, partial(dej, intro.dej, dejCL), false, px); L.stroke();
    L.lineWidth = 2; L.strokeStyle = rgba(C.ink, 0.85);
    trace(L, partial(pulp, intro.pulp, pulpCL), false, px); L.stroke();
    if (gpU > 0) { L.strokeStyle = rgba(C.amber, 0.9); L.lineWidth = 2; L.save(); trace(L, pulp, true, px); L.clip(); L.beginPath(); const yy = OY - lerp(-4.7, 0.05, gpU) * S; L.moveTo(OX - 40, yy); L.lineTo(OX + 40, yy); L.stroke(); L.restore(); }

    // --- cuts (material removal)
    const remB = seg(t, TB.rem[0], TB.rem[1], ease.inOut), remC = seg(t, TC.rem[0], TC.rem[1], ease.inOut), remD = seg(t, TD.rem[0], TD.rem[1], ease.inOut);
    const cutDepth = (u) => lerp(7.8, -0.25, u);
    const clipAbove = (c, ymm) => { c.beginPath(); c.rect(0, 0, W, OY - ymm * S); c.clip(); };
    L.save(); L.globalCompositeOperation = 'destination-out'; L.fillStyle = '#000';
    if (remB > 0) { L.save(); clipAbove(L, cutDepth(remB)); trace(L, cutB, true, px); L.fill(); L.restore(); }
    if (remC > 0) { L.save(); clipAbove(L, cutDepth(remC)); trace(L, cutC, true, px); L.fill(); L.restore(); }
    if (remD > 0) { L.globalAlpha = remD; trace(L, redD, true, px); L.fill(); }
    L.restore();
    // --- cut surface edges
    L.save(); trace(L, outline, true, px); L.clip();
    L.lineWidth = 2.6; L.strokeStyle = C.ink;
    if (remB > 0 && remC <= 0) { L.save(); clipAbove(L, cutDepth(remB)); trace(L, cutB, true, px); L.stroke(); L.restore(); }
    if (remC > 0) {
      if (remC < 1) { L.save(); trace(L, cutB, true, px); L.stroke(); L.restore(); }
      L.save(); clipAbove(L, cutDepth(remC)); trace(L, cutC, true, px); L.stroke(); L.restore();
    }
    if (remD > 0) { L.globalAlpha = remD; trace(L, redD, true, px); L.stroke(); L.globalAlpha = 1; }
    L.restore();
    if (remD > 0) { // the remaining crown outline between cavity & reduction must not show above the reduction
      L.save(); L.globalCompositeOperation = 'destination-out'; L.globalAlpha = remD; L.fillStyle = '#000';
      trace(L, redD, true, (x, y) => px(x, y + 0.035)); L.fill(); L.restore();
      L.save(); trace(L, outline, true, px); L.clip(); L.beginPath(); L.rect(0, 0, W, H); trace2(L, cutC, px); L.clip('evenodd');
      L.globalAlpha = remD; L.lineWidth = 2.6; L.strokeStyle = C.ink; trace(L, redD, true, px); L.stroke(); L.restore();
    }

    // --- planned-cut markup (amber dashed), drawn while planning/cutting; clipped to the tooth outline
    const planB = seg(t, TB.plan[0], TB.plan[1]), fadeB = 1 - seg(t, TB.planFade[0], TB.planFade[1]);
    const planC = seg(t, TC.plan[0], TC.plan[1]), fadeC = 1 - seg(t, TC.planFade[0], TC.planFade[1]);
    const planD = seg(t, TD.plan[0], TD.plan[1]), fadeD = 1 - seg(t, TD.planFade[0], TD.planFade[1]);
    L.save(); trace(L, outline, true, px); L.clip();
    L.setLineDash([10, 8]); L.lineWidth = 2.6; L.strokeStyle = C.amber; L.lineDashOffset = -t * 40;
    if (planB > 0 && fadeB > 0) { L.globalAlpha = fadeB; trace(L, partial(cutB, planB), false, px); L.stroke(); }
    if (planC > 0 && fadeC > 0) { L.globalAlpha = fadeC; trace(L, partial(cutC, planC), false, px); L.stroke(); }
    if (planD > 0 && fadeD > 0) { L.globalAlpha = fadeD; trace(L, partial(redLine, planD), false, px); L.stroke(); trace(L, partial(redLineL.slice().reverse(), planD), false, px); L.stroke(); }
    L.restore();

    // --- core build-up (stipple), then onlay
    const coreU = seg(t, TD.core[0], TD.core[1], ease.inOut);
    if (coreU > 0) {
      L.save();
      trace(L, cutC, true, px); L.clip();
      L.beginPath(); L.rect(0, OY - lerp(0, YCORE, coreU) * S, W, H); L.clip();
      L.beginPath(); L.rect(0, OY - YCORE * S, W, YCORE * S); L.clip();
      L.fillStyle = rgba(C.ink, 0.1); L.fillRect(0, 0, W, H);
      L.fillStyle = rgba(C.ink, 0.65);
      for (const [x, y] of coreDots) { const p = px(x, y); L.fillRect(p[0] - 1.2, p[1] - 1.2, 2.4, 2.4); }
      L.restore();
      if (coreU >= 1) { L.save(); trace(L, cutC, true, px); L.clip(); L.lineWidth = 2.2; L.strokeStyle = C.ink; trace(L, [[-2, YCORE], [-1, YCORE], [0, YCORE], [1, YCORE], [2, YCORE]], false, px); L.stroke(); L.restore(); }
    }
    const onU = seg(t, TD.onlay[0], TD.onlay[1], ease.outQuint);
    if (onU > 0) {
      const dy = (1 - onU) * 1.4, m = shift(dy);
      L.save(); L.globalAlpha = seg(t, TD.onlay[0], TD.onlay[0] + 0.2);
      trace(L, outline, true, m); L.clip();
      L.beginPath(); L.rect(0, 0, W, OY - (YCORE + dy) * S); L.clip();
      L.beginPath(); trace2(L, cutC, m); trace2(L, redD, m); L.clip('nonzero');
      L.fillStyle = rgba(C.mint, 0.16); L.fillRect(0, 0, W, H);
      L.strokeStyle = rgba(C.mint, 0.55); L.lineWidth = 1.2; strokeLines(L, hOnlay, m);
      L.lineWidth = 3.4; L.strokeStyle = C.mint; trace(L, crown, false, m); L.stroke();
      L.lineWidth = 2.2; // inner surface = boundary of (cavity ∪ reduction)
      L.save(); L.beginPath(); L.rect(0, 0, W, H); trace2(L, redD, m); L.clip('evenodd'); trace(L, cutC, true, m); L.stroke(); L.restore();
      L.save(); L.beginPath(); L.rect(0, 0, W, H); trace2(L, cutC, m); L.clip('evenodd'); trace(L, redD, true, m); L.stroke(); L.restore();
      L.beginPath(); const a = m(-2, YCORE), b = m(2, YCORE); L.moveTo(a[0], a[1]); L.lineTo(b[0], b[1]); L.stroke();
      L.restore();
    }
  }

  // ------------------------------------------------------------------ main-canvas section extras
  function drawMount(intro) {
    const a = intro.mount;
    if (a <= 0) return;
    const [x0, y0] = pxRaw(-6.2, -2.0), [x1, y1] = pxRaw(6.2, -4.05);
    ctx.save(); ctx.globalAlpha = a;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); trace2(ctx, outline, pxRaw); ctx.clip('evenodd');
    ctx.fillStyle = rgba(C.cyan, 0.06); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = rgba(C.cyan, 0.42); ctx.lineWidth = 1.4; strokeLines(ctx, hMount, pxRaw);
    ctx.restore();
    ctx.strokeStyle = rgba(C.ink, 0.85); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y1); ctx.stroke();
    // break line along the bottom
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 4) { const yy = y1 + Math.sin((x - x0) / 26) * 5; if (x === x0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
    ctx.stroke();
    ctx.restore();
    text(ctx, 'MOUNT', x0 + 14, y0 + 34, { font: `22px ${FH}`, color: C.cyan, alpha: 0.8 * a, ls: 2 });
  }
  function drawCenterline(a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a * 0.55; ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.4; ctx.setLineDash([26, 6, 4, 6]);
    ctx.beginPath(); ctx.moveTo(OX, 450); ctx.lineTo(OX, 1176); ctx.stroke(); ctx.restore();
    text(ctx, '℄', OX + 8, 1188, { font: `22px ${FH}`, color: C.cyan, alpha: a * 0.6 });
  }
  function drawGhost(dpx) {
    const a = clamp(dpx / 12) * 0.75;
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([7, 6]); ctx.lineWidth = 1.6; ctx.strokeStyle = C.cyan;
    trace(ctx, crown, false, pxRaw); ctx.stroke(); ctx.restore();
  }
  function drawStrain(load, K) {
    const s = clamp(load * (K / CYC[2].K));
    if (s <= 0.01) return;
    // schematic strain zones: crisp dashed iso-contours only, at the cusp "hinge" (in dentin) and the cervical surface
    const spots = [[-1.45, 2.1, 1], [1.45, 2.1, 1], [-4.3, 1.25, 0.7], [4.12, 1.25, 0.7]];
    ctx.save(); ctx.strokeStyle = C.coral; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.6;
    for (const [x, y, w] of spots) {
      const p = px(x, y);
      for (let k = 1; k <= 3; k++) {
        ctx.globalAlpha = s * (1.05 - k * 0.25);
        ctx.beginPath(); ctx.ellipse(p[0], p[1], (12 + k * 15) * w * (0.6 + 0.4 * s), (9 + k * 11) * w * (0.6 + 0.4 * s), x < 0 ? -0.5 : 0.5, 0, TAU); ctx.stroke();
      }
    }
    ctx.restore();
  }
  const gaugePos = (dir) => (dir < 0 ? px(-4.42, 1.0) : px(4.06, 1.0));
  function drawGauges(load, K, a) {
    if (a <= 0) return;
    const s = clamp(load * (K / CYC[2].K) * 1.2);
    for (const dir of [-1, 1]) {
      const p = gaugePos(dir);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(p[0], p[1]); ctx.rotate(dir * -0.12);
      ctx.fillStyle = Kit.rgba(Kit.mix(C.cyan, C.amber, s), 0.35 + 0.5 * s); ctx.fillRect(-5, -14, 10, 28);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(-5, -14, 10, 28);
      ctx.beginPath(); for (let k = -10; k <= 10; k += 5) { ctx.moveTo(-3, k); ctx.lineTo(3, k); } ctx.stroke();
      ctx.restore();
    }
  }
  function drawHidden(t) {
    const a = seg(t, TC.hidden[0], TC.hidden[1]) * (1 - seg(t, TD.rem[0], TD.rem[0] + 0.35));
    if (a <= 0) return;
    const strong = 1 - seg(t, C0 + 1.65, C0 + 1.95);
    ctx.save(); ctx.globalAlpha = a * lerp(0.6, 0.9, strong); ctx.setLineDash([9, 7]); ctx.lineWidth = 2.2; ctx.strokeStyle = C.coral;
    for (const ln of boxHidden) { trace(ctx, ln, false, px); ctx.stroke(); }
    ctx.restore();
  }
  function drawHiddenCallout(t) {
    const a = seg(t, C0 + 0.9, C0 + 1.15) * (1 - seg(t, C0 + 1.65, C0 + 1.9));
    if (a <= 0) return;
    const tg = px(-1.75, 5.6);
    leader(ctx, 214, 600, tg[0] - 2, tg[1], C.coral, a * 0.9);
    text(ctx, 'PROX. BOXES', 66, 606, { font: `22px ${FH}`, color: C.coral, alpha: a, ls: 1 });
    text(ctx, '(BEHIND)', 66, 630, { font: `22px ${FH}`, color: C.coral, alpha: a, ls: 1 });
  }
  // loading sphere: rest position solved on the (deformed) crown surface → it touches both inclines
  const BALL_R = 2.0;
  const surfPts = crown.filter(([x, y]) => y > 4.6 && Math.abs(x) < 3.2);
  const wallPts = (cut) => cut.filter(([x, y]) => y > 3.0 && y < 7.6 && Math.abs(x) < 2.2);
  const wallB = wallPts(cutB), wallC = wallPts(cutC);
  const lastBall = [{ cx: 0, cy: 8.25, cl: null, cr: null }, { cx: 0, cy: 7.5, cl: null, cr: null }, { cx: 0, cy: 7.2, cl: null, cr: null }];
  function restBallFor(st) { // st 0 = intact / onlay surface, 1 = access, 2 = MOD
    const w = st === 2 ? 1.38 : st === 1 ? 1.2 : 0;
    let pts = surfPts.filter(([x]) => Math.abs(x) > w);
    if (st === 2) pts = pts.concat(wallC); else if (st === 1) pts = pts.concat(wallB);
    pts = pts.map(([x, y]) => def(x, y));
    let best = { cy: 1e9 };
    for (let cx = -0.6; cx <= 0.6001; cx += 0.01) {
      let cy = -1e9, cl = null, cr = null, ml = -1e9, mr = -1e9;
      for (const [x, y] of pts) {
        const dx = x - cx; if (Math.abs(dx) >= BALL_R) continue;
        const c = y + Math.sqrt(BALL_R * BALL_R - dx * dx);
        if (c > cy) cy = c;
        if (dx < 0 && c > ml) { ml = c; cl = [x, y]; } if (dx > 0 && c > mr) { mr = c; cr = [x, y]; }
      }
      if (cl && cr && cy < best.cy) best = { cx, cy, cl, cr };
    }
    if (best.cy > 1e8) return lastBall[st];
    lastBall[st] = best;
    return best;
  }
  function restBall(t) {
    // the surface under the sphere changes while it is lifted: blend so it never jumps
    const uB = seg(t, TB.rem[0], TB.rem[1], ease.smooth), uC = seg(t, TC.rem[0], TC.rem[1], ease.smooth), uD = seg(t, D0 - 0.1, D0 + 0.3, ease.smooth);
    let s0, s1, u;
    if (uD > 0) { s0 = 2; s1 = 0; u = uD; } else if (uC > 0) { s0 = 1; s1 = 2; u = uC; } else { s0 = 0; s1 = 1; u = uB; }
    if (u <= 0) return restBallFor(s0);
    if (u >= 1) return restBallFor(s1);
    const a = restBallFor(s0), b = restBallFor(s1);
    return { cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), cl: b.cl, cr: b.cr };
  }
  function drawLoad(t, lift, load) {
    // sphere + rod (rigid, not deformed); sphere sinks as the cusps splay
    const B = restBall(t);
    const cy = B.cy + lift * 0.8 + highLiftAt(t) * 0.9;
    const intro = seg(t, 1.25, 2.0, ease.out);
    if (intro <= 0) return;
    const cyI = cy + (1 - intro) * 3.0;
    const [bx, by] = pxRaw(B.cx, cyI), R = BALL_R * S;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 440, W, H); ctx.clip();
    ctx.globalAlpha = intro;
    // rod
    const rw = 0.62 * S, top = 452;
    if (by > top) {
      ctx.save(); ctx.beginPath(); ctx.rect(bx - rw, top, rw * 2, by - top); ctx.clip();
      ctx.fillStyle = 'rgba(9,40,78,0.92)'; ctx.fillRect(bx - rw, top, rw * 2, by - top);
      ctx.strokeStyle = rgba(C.ink, 0.3); ctx.lineWidth = 1.2; strokeLines(ctx, hBall, (x, y) => [bx + x * S, by - (y - 5) * S - 200]);
      ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(bx - rw, top + 8); ctx.lineTo(bx - rw, by); ctx.moveTo(bx + rw, top + 8); ctx.lineTo(bx + rw, by); ctx.stroke();
      // cylinder break symbol at top of rod
      ctx.beginPath(); ctx.moveTo(bx - rw, top + 8);
      ctx.bezierCurveTo(bx - rw * 0.5, top - 6, bx - rw * 0.1, top - 6, bx, top + 8);
      ctx.bezierCurveTo(bx + rw * 0.1, top + 22, bx + rw * 0.5, top + 22, bx + rw, top + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - rw, top + 8); ctx.bezierCurveTo(bx - rw * 0.5, top + 20, bx - rw * 0.1, top + 20, bx, top + 8); ctx.stroke();
    }
    // sphere (sectioned → hatched)
    ctx.save(); ctx.beginPath(); ctx.arc(bx, by, R, 0, TAU); ctx.fillStyle = 'rgba(9,40,78,0.9)'; ctx.fill(); ctx.clip();
    ctx.strokeStyle = rgba(C.ink, 0.28); ctx.lineWidth = 1.1; strokeLines(ctx, hBall, (x, y) => [bx + x * S, by - (y - 7.3) * S]);
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, R, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(C.cyan, 0.8);
    ctx.beginPath(); ctx.moveTo(bx - 14, by); ctx.lineTo(bx + 14, by); ctx.moveTo(bx, by - 14); ctx.lineTo(bx, by + 14); ctx.stroke();
    ctx.restore();
    // contact force vectors (normal to the surface, into the cusp)
    if (load > 0.02 && lift < 0.05) {
      ctx.save(); ctx.globalAlpha = load; ctx.fillStyle = C.amber; ctx.strokeStyle = C.amber; ctx.lineWidth = 3.2;
      for (const c of [B.cl, B.cr]) {
        if (!c) continue;
        const p = [OX + c[0] * S, OY - c[1] * S];
        const ang = Math.atan2(p[1] - by, p[0] - bx);
        const len = 30 + 22 * load;
        const ex = p[0] + Math.cos(ang) * len, ey = p[1] + Math.sin(ang) * len;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(ex - Math.cos(ang) * 8, ey - Math.sin(ang) * 8); ctx.stroke();
        arrowHead(ctx, ex, ey, ang, 14);
      }
      ctx.restore();
    }
    // load arrow + readout ("111 N" only for the J Endod series; REV D's load was not reported)
    const la = intro * (0.35 + 0.65 * load);
    const axX = OX + rw + 30;
    ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = C.amber; ctx.fillStyle = C.amber; ctx.lineWidth = 4;
    const y0 = 456, y1 = 494 + 22 * load;
    ctx.beginPath(); ctx.moveTo(axX, y0); ctx.lineTo(axX, y1 - 10); ctx.stroke(); arrowHead(ctx, axX, y1, Math.PI / 2, 18);
    ctx.restore();
    const fF = `34px ${FH}`, numA = 1 - seg(t, D0 - 0.1, D0 + 0.2);
    text(ctx, 'F', axX + 18, 486, { font: fF, color: C.amber, alpha: la });
    if (numA > 0) text(ctx, `${String(Math.round(111 * load)).padStart(3, ' ')} N`, axX + 18 + textW('F ', fF), 486, { font: fF, color: C.amber, alpha: la * numA });
  }
  function drawDeflectionDims(dpx, a) {
    if (a <= 0.01 || dpx < 0.5) return;
    // cusp tips: buccal (-2.4, 7.5), lingual (2.4, 7.25)
    const yD = 560;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.cyan; ctx.fillStyle = C.cyan; ctx.lineWidth = 1.5;
    for (const [x, y, sg] of [[-2.4, 7.5, -1], [2.4, 7.25, 1]]) {
      const g = pxRaw(x, y), d = px(x, y);
      ctx.beginPath(); ctx.moveTo(g[0], g[1] - 10); ctx.lineTo(g[0], yD - 10); ctx.moveTo(d[0], d[1] - 10); ctx.lineTo(d[0], yD - 10); ctx.stroke();
      const lo = Math.min(g[0], d[0]), hi = Math.max(g[0], d[0]);
      if (sg < 0) { ctx.beginPath(); ctx.moveTo(lo - 24, yD); ctx.lineTo(hi + 12, yD); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(lo - 12, yD); ctx.lineTo(hi + 24, yD); ctx.stroke(); }
      arrowHead(ctx, lo, yD, 0, 11); arrowHead(ctx, hi, yD, Math.PI, 11);
      ctx.font = `30px ${FH}`; ctx.textAlign = 'center';
      ctx.fillText('δ', sg < 0 ? lo - 40 : hi + 40, yD + 10);
    }
    ctx.restore();
  }
  function drawSplayArrows(s) {
    if (s <= 0.02) return;
    ctx.save(); ctx.globalAlpha = s; ctx.strokeStyle = C.coral; ctx.fillStyle = C.coral; ctx.lineWidth = 3.5;
    for (const sg of [-1, 1]) {
      const piv = pxRaw(sg * 2.6, 0.8), q = px(sg * 3.35, 6.5);
      const R = Math.hypot(q[0] - piv[0], q[1] - piv[1]) + 34;
      const aTip = Math.atan2(q[1] - piv[1], q[0] - piv[0]);
      const a0 = aTip + sg * 0.04, a1 = aTip + sg * 0.27;
      ctx.beginPath(); ctx.arc(piv[0], piv[1], R, a0, a1, sg < 0); ctx.stroke();
      const ex = piv[0] + R * Math.cos(a1), ey = piv[1] + R * Math.sin(a1);
      arrowHead(ctx, ex + Math.cos(a1 + sg * Math.PI / 2) * 6, ey + Math.sin(a1 + sg * Math.PI / 2) * 6, a1 + sg * Math.PI / 2, 17);
    }
    ctx.restore();
  }
  // revision cloud around the cusps for REV D (section)
  function drawSectionCloud(t) {
    const u = seg(t, TD.plan[0], TD.plan[1], ease.inOut), a = 1 - seg(t, D0 + 1.1, D0 + 1.4);
    if (u <= 0 || a <= 0) return;
    const c = pxRaw(0, 6.25);
    cloud(ctx, c[0], c[1], 212, 70, 24, u, C.amber, a);
    triTag(ctx, c[0] + 212 * 0.74, c[1] - 70 * 0.68 - 10, 'D', a * seg(t, TD.plan[0] + 0.25, TD.plan[1]));
  }
  // signal wire: lingual strain gauge → chart, while that revision's bar fills (hands the eye over)
  function drawWire(t) {
    for (const cy of CYC) {
      const a = env(t, cy.bar[0] - 0.15, cy.bar[1] + 0.25, 0.15, 0.3);
      if (a <= 0) continue;
      const g = gaugePos(1), x0 = g[0] + 12, y = g[1];
      ctx.save(); ctx.globalAlpha = a * 0.95; ctx.strokeStyle = C.amber; ctx.fillStyle = C.amber; ctx.lineWidth = 2.2;
      ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 70;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(698, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x0, y, 3.5, 0, TAU); ctx.fill();
      arrowHead(ctx, 700, y, 0, 11);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------ plan view
  function planBox(z) { // panel rectangle behind the plan (normal → zoomed detail)
    return [lerp(700, 498, z), lerp(478, 444, z), lerp(1014, 985, z), lerp(748, 852, z)];
  }
  function drawPlan(t, intro, load, k) {
    const a = intro.plan;
    if (a <= 0) return;
    const z = zoomAt(t), sc = lerp(1, ZS, z), cxz = lerp(PX0, ZX, z), cyz = lerp(PY0, ZY, z);
    const zf = (p) => [cxz + (p[0] - PX0) * sc, cyz + (p[1] - PY0) * sc];
    if (z > 0) {
      const [bx0, by0, bx1, by1] = planBox(z);
      ctx.save(); ctx.globalAlpha = z;
      ctx.fillStyle = 'rgb(7,32,64)'; ctx.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
      ctx.strokeStyle = rgba(C.cyan, 0.8); ctx.lineWidth = 1.6; ctx.strokeRect(bx0, by0, bx1 - bx0, by1 - by0);
      ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
      for (const [cx, cy, sx, sy] of [[bx0, by0, 1, 1], [bx1, by0, -1, 1], [bx0, by1, 1, -1], [bx1, by1, -1, -1]]) { ctx.beginPath(); ctx.moveTo(cx + sx * 22, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * 22); ctx.stroke(); }
      ctx.restore();
      text(ctx, 'DETAIL · SCALE 3:2', bx0 + 16, by1 - 14, { font: `22px ${FH}`, color: C.cyan, alpha: 0.9 * seg(z, 0.75, 1), ls: 1.5 });
    }
    text(ctx, 'OCCLUSAL VIEW', lerp(PX0, ZX, z), lerp(500, 476, z), { font: `26px ${FH}`, color: C.cyan, align: 'center', alpha: a, ls: 2 });

    ctx.save();
    ctx.translate(cxz, cyz); ctx.scale(sc, sc); ctx.translate(-PX0, -PY0);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // fill + outline
    ctx.save(); trace(ctx, planOutline, true, pp); ctx.fillStyle = rgba(C.ink, 0.06 * a); ctx.fill(); ctx.restore();
    ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(C.ink, a); trace(ctx, partial(planOutline.concat([planOutline[0]]), intro.planLine), false, pp); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = a * 0.55; ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink; trace(ctx, table, true, pp); ctx.stroke();
    // central groove + cusp tips
    ctx.setLineDash([6, 5]); ctx.beginPath(); let p = pp(0.05, -2.0), q = pp(-0.05, 2.0); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(PX0 + 4, PY0, q[0], q[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = a * 0.9; ctx.lineWidth = 2;
    for (const [x, y] of [[-2.4, 0.15], [2.4, 0]]) { const c = pp(x, y); ctx.beginPath(); ctx.moveTo(c[0] - 8, c[1]); ctx.lineTo(c[0] + 8, c[1]); ctx.moveTo(c[0], c[1] - 8); ctx.lineTo(c[0], c[1] + 8); ctx.stroke(); }
    ctx.restore();
    // access (B) and MOD slot (C)
    const accPlan = seg(t, TB.plan[0], TB.plan[1]), accFill = seg(t, TB.rem[0], TB.rem[1]);
    const slotU = seg(t, TC.slot[0], TC.slot[1], ease.inOut);
    const h = lerp(0.8, 3.9, slotU);
    const onU = seg(t, TD.planOnlay[0], TD.planOnlay[1], ease.inOut);
    ctx.save(); trace(ctx, planOutline, true, pp); ctx.clip();
    if (accFill > 0 || slotU > 0) {
      ctx.fillStyle = 'rgba(6,28,58,0.92)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4;
      if (slotU > 0) { trace(ctx, slot(h), true, pp); ctx.fill(); ctx.stroke(); }
      ctx.globalAlpha = slotU > 0 ? 1 : accFill;
      trace(ctx, accPts, true, pp); ctx.fill(); if (slotU <= 0) ctx.stroke();
      ctx.globalAlpha = 1;
      if (slotU > 0) { // redraw slot outline over access edges
        ctx.save(); trace(ctx, slot(h), true, pp); ctx.clip(); trace(ctx, accPts, true, pp); ctx.fillStyle = 'rgba(6,28,58,1)'; ctx.fill(); ctx.restore();
        trace(ctx, slot(h), true, pp); ctx.stroke();
      }
    }
    ctx.restore();
    if (accPlan > 0 && accFill < 1) {
      ctx.save(); ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = C.amber; ctx.lineWidth = 2.6; ctx.globalAlpha = 1 - accFill;
      trace(ctx, partial(accPts, accPlan), false, pp); ctx.stroke(); ctx.restore();
    }
    // marginal ridges drawn as engineering tie members (cusp ↔ cusp)
    drawTies(t, intro.ridges, load, k);
    // onlay (D): cross-hatched cover plate over the whole occlusal table
    if (onU > 0) {
      ctx.save(); trace(ctx, planOutline, true, pp); ctx.clip();
      ctx.beginPath(); const yy = pp(0, lerp(-3.7, 3.7, onU))[1]; ctx.rect(0, 0, W, yy); ctx.clip();
      ctx.fillStyle = 'rgba(9,48,80,0.95)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = rgba(C.mint, 0.16); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rgba(C.mint, 0.6); ctx.lineWidth = 1.3; strokeLines(ctx, hPlan, pp);
      // the plate now ties the cusps together across the full width
      ctx.strokeStyle = C.mint; ctx.lineWidth = 2.2;
      for (const sy of [-1, 1]) for (const o of [-0.13, 0.13]) { const l0 = pp(-TIE_X, sy * TIE_Y + o), l1 = pp(TIE_X, sy * TIE_Y + o); ctx.beginPath(); ctx.moveTo(l0[0], l0[1]); ctx.lineTo(l1[0], l1[1]); ctx.stroke(); }
      for (const sy of [-1, 1]) for (const sx of [-1, 1]) { const c = pp(sx * TIE_X, sy * TIE_Y); ctx.beginPath(); ctx.arc(c[0], c[1], 4.5, 0, TAU); ctx.fillStyle = C.mint; ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.lineWidth = 3.4; ctx.strokeStyle = C.mint; ctx.globalAlpha = onU; trace(ctx, planOutline, true, pp); ctx.stroke(); ctx.restore();
    }
    // force arrows in plan: ties in tension (A, B) · cusps splaying (C) · plate restraining (D, F)
    if (load > 0.02) {
      if (k <= 1) for (const sy of [-1, 1]) for (const sx of [-1, 1]) { const p0 = pp(sx * 4.0, sy * TIE_Y), p1 = pp(sx * 3.1, sy * TIE_Y); arrow(ctx, p0[0], p0[1], p1[0], p1[1], C.amber, 3, 12, load); }
      if (k === 2) for (const sx of [-1, 1]) { const p0 = pp(sx * 2.75, -0.55), p1 = pp(sx * 3.95, -0.55); arrow(ctx, p0[0], p0[1], p1[0], p1[1], C.coral, 3.4, 13, load); }
      if (k === 3 && onU >= 1) for (const sy of [-1, 1]) for (const sx of [-1, 1]) { const p0 = pp(sx * 4.0, sy * TIE_Y), p1 = pp(sx * 3.1, sy * TIE_Y); arrow(ctx, p0[0], p0[1], p1[0], p1[1], C.mint, 3, 12, load * 0.95); }
    }
    // revision clouds: B around the access, C around both ridges
    {
      const uB = seg(t, TB.plan[0], TB.plan[1] + 0.05, ease.inOut), aB = 1 - seg(t, B0 + 1.15, B0 + 1.45);
      const c = pp(0, 0);
      cloud(ctx, c[0], c[1], 50, 38, 11, uB, C.amber, aB, 2.2);
      triTag(ctx, c[0] + 44, c[1] - 40, 'B', aB * seg(t, TB.plan[0] + 0.2, TB.plan[1] + 0.1), 30);
      const uC = seg(t, C0 + 0.25, C0 + 0.6, ease.inOut), aC = 1 - seg(t, C0 + 1.5, C0 + 1.8);
      for (const sy of [-1, 1]) { const m = pp(0, sy * TIE_Y); cloud(ctx, m[0], m[1], 86, 24, 22, uC, C.amber, aC, 2.0); }
      const tg = pp(3.55, -TIE_Y - 0.9);
      triTag(ctx, tg[0], tg[1], 'C', aC * seg(t, C0 + 0.45, C0 + 0.65), 30);
    }
    // section line 1–1 (view arrows point toward M: viewer looks mesially → buccal on the left, as drawn)
    const sl = intro.secLine;
    if (sl > 0) {
      ctx.save(); ctx.globalAlpha = sl;
      const l0 = pp(-5.4, 0), l1 = pp(5.4, 0);
      dashLine(ctx, l0[0], l0[1], l1[0], l1[1], [16, 5, 3, 5], 1.4, C.cyan, 0.75);
      ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 4;
      for (const sx of [-1, 1]) {
        const e = pp(sx * 5.4, 0), i = pp(sx * 4.6, 0);
        ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(i[0], i[1]); ctx.stroke();
        ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(e[0] - sx * 4, e[1]); ctx.lineTo(e[0] - sx * 4, e[1] - 22); ctx.stroke(); ctx.lineWidth = 4;
        arrowHead(ctx, e[0] - sx * 4, e[1] - 32, -Math.PI / 2, 13);
        text(ctx, '1', e[0] + sx * 13, e[1] + 8, { font: `22px ${FH}`, color: C.ink, align: 'center' });
      }
      ctx.restore();
      const lab = { font: `22px ${FH}`, color: C.cyan, align: 'center', alpha: sl * 0.9 };
      text(ctx, 'B', pp(-5.0, 0)[0], PY0 + 30, lab); text(ctx, 'L', pp(5.0, 0)[0], PY0 + 30, lab);
      // M / D step aside while the REV C revision clouds sit over the ridges (they would collide)
      const labMD = { ...lab, alpha: lab.alpha * (1 - Math.min(seg(t, C0 + 0.12, C0 + 0.3), 1 - seg(t, C0 + 1.7, C0 + 1.95))) };
      text(ctx, 'M', PX0, pp(0, -3.45)[1] - 8, labMD); text(ctx, 'D', PX0, pp(0, 3.45)[1] + 24, labMD);
    }
    ctx.restore();

    // marginal-ridge call-out (screen space; follows the zoom)
    const mrA = intro.ridges * (1 - seg(t, TC.snap[0] - 0.05, TC.snap[0] + 0.05));
    const mrC = seg(t, TC.snap[0], TC.snap[0] + 0.2) * (1 - seg(t, TD.planOnlay[0], TD.planOnlay[0] + 0.3));
    const lx = lerp(738, 600, z), ly = lerp(530, 500, z);
    const two = (l1, l2, col, al, tip) => { leader(ctx, lx + 6, ly + 18, tip[0], tip[1], col, al * 0.9); text(ctx, l1, lx, ly, { font: `22px ${FH}`, color: col, align: 'right', alpha: al, ls: 1 }); text(ctx, l2, lx, ly + 24, { font: `22px ${FH}`, color: col, align: 'right', alpha: al, ls: 1 }); };
    if (mrA > 0) two('MARGINAL', 'RIDGE', C.cyan, mrA, zf(pp(-1.1, -TIE_Y)));
    if (mrC > 0) two('RIDGES', 'CUT', C.coral, mrC, zf(pp(-2.35, -TIE_Y)));
  }
  function drawTies(t, ridgeA, load, k) {
    if (ridgeA <= 0) return;
    const broken = t >= TC.snap[0];
    const gone = seg(t, TD.planOnlay[0], TD.planOnlay[0] + 0.3); // covered by the onlay plate
    const pulse = env(t, A0 + 0.3, A0 + 2.7, 0.5, 0.6);
    const line = (x0, y0, x1, y1) => { const p = pp(x0, y0), q = pp(x1, y1); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
    const pin = (x, y, col) => { const c = pp(x, y); ctx.beginPath(); ctx.arc(c[0], c[1], 4.6, 0, TAU); ctx.fillStyle = 'rgba(8,36,70,1)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); };
    ctx.save(); ctx.globalAlpha = ridgeA * (1 - gone); ctx.lineCap = 'butt';
    for (const sy of [-1, 1]) {
      const y = sy * TIE_Y;
      if (!broken) {
        ctx.lineWidth = 18; ctx.strokeStyle = rgba(C.cyan, 0.08 + 0.16 * pulse); line(-TIE_X, y, TIE_X, y);
        ctx.lineWidth = 7; ctx.strokeStyle = rgba(C.cyan, 0.3); line(-TIE_X, y, TIE_X, y);
        ctx.lineWidth = 2.2; ctx.strokeStyle = C.cyan; line(-TIE_X, y - 0.14, TIE_X, y - 0.14); line(-TIE_X, y + 0.14, TIE_X, y + 0.14);
        pin(-TIE_X, y, C.cyan); pin(TIE_X, y, C.cyan);
      } else {
        // the cut snaps the tie: broken ends spring back to the box walls
        const u = ease.outBack(seg(t, TC.snap[0], TC.snap[1]));
        for (const sx of [-1, 1]) {
          const xin = sx * lerp(0.06, 1.9, u), xo = sx * TIE_X;
          ctx.lineWidth = 7; ctx.strokeStyle = rgba(C.coral, 0.3); line(xo, y, xin, y);
          ctx.lineWidth = 2.2; ctx.strokeStyle = C.coral; line(xo, y - 0.14, xin, y - 0.14); line(xo, y + 0.14, xin, y + 0.14);
          // jagged fracture end
          const j = [[xin, y - 0.24], [xin - sx * 0.12, y - 0.08], [xin + sx * 0.07, y + 0.04], [xin - sx * 0.05, y + 0.24]].map(([a, b]) => pp(a, b));
          ctx.beginPath(); ctx.moveTo(j[0][0], j[0][1]); for (const q of j.slice(1)) ctx.lineTo(q[0], q[1]); ctx.stroke();
          pin(xo, y, C.coral);
        }
      }
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ stiffness chart
  const CH = { x0: 700, x1: 1010, y0: 744, y1: 1096, base: 1020, H100: 120, hdr: 810 };
  const slotW = (CH.x1 - CH.x0 - 20) / 4, BW = 42;
  const barCx = (i) => CH.x0 + 10 + slotW * (i + 0.5);
  const barH = (v) => Math.min(v, 118) / 100 * CH.H100;
  const barLabelY = (v) => (Math.abs(v - 100) < 12 ? CH.base - CH.H100 - 12 : CH.base - barH(v) - 10);
  function planIcon(cx, cy, kind, a) { // tiny occlusal pictogram under each bar letter
    if (a <= 0) return;
    const s = 4.2, m = (x, y) => [cx + x * s, cy + y * s];
    ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round';
    trace(ctx, planOutline, true, m);
    ctx.fillStyle = kind === 3 ? rgba(C.mint, 0.35) : rgba(C.ink, 0.08); ctx.fill();
    ctx.strokeStyle = kind === 3 ? C.mint : C.ink; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = 'rgba(6,28,58,1)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    if (kind === 1) { trace(ctx, accPts, true, m); ctx.fill(); ctx.stroke(); }
    if (kind === 2) { ctx.save(); trace(ctx, planOutline, true, m); ctx.clip(); trace(ctx, slot(3.9), true, m); ctx.fill(); ctx.strokeStyle = C.coral; ctx.stroke(); ctx.restore(); }
    if (kind === 0) { ctx.strokeStyle = rgba(C.ink, 0.6); ctx.beginPath(); const p = m(0, -2), q = m(0, 2); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.restore();
  }
  function rectPerim(x, y, w, h, u) { // partial rectangle outline (clockwise from top-left)
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    const out = partial(pts, u);
    ctx.beginPath(); out.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  }
  function drawChart(t, a) {
    if (a <= 0) return;
    const { x0, x1, y0, y1, base, H100, hdr } = CH;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(6,30,62,0.45)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = rgba(C.ink, 0.85); ctx.lineWidth = 2; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, hdr); ctx.lineTo(x1, hdr); ctx.stroke();
    text(ctx, 'CUSP STIFFNESS', (x0 + x1) / 2, y0 + 32, { font: `30px ${FH}`, color: C.ink, align: 'center', ls: 1 });
    text(ctx, '% of intact tooth', (x0 + x1) / 2, y0 + 58, { font: `24px ${FB}`, color: C.cyan, align: 'center' });
    // axes
    ctx.strokeStyle = rgba(C.ink, 0.8); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x0 + 10, base); ctx.lineTo(x1 - 10, base); ctx.stroke();
    // 100% reference (labels near 100 sit clear above it)
    dashLine(ctx, x0 + 10, base - H100, x1 - 10, base - H100, [6, 5], 1.4, C.cyan, 0.7);
    // D comes from a separate experiment series: divider + tag
    const dA = seg(t, D0 + 2.6, D0 + 2.95);
    if (dA > 0) {
      const xd = x0 + 10 + slotW * 3;
      dashLine(ctx, xd, base - 2, xd, base - 142, [7, 5], 1.6, C.cyan, 0.85 * dA);
      text(ctx, 'other study', xd + 2, hdr + 22, { font: `22px ${FB}`, color: C.cyan, align: 'center', alpha: dA });
    }
    BARS.forEach((b, i) => {
      const cy = CYC[i], u = seg(t, cy.bar[0], cy.bar[1], ease.out);
      const cx = barCx(i);
      const active = stageIdx(t) === i && t < E0;
      const letterA = t >= cy.bar[0] - 0.6 ? 1 : 0.35;
      text(ctx, b.k, cx, base + 30, { font: `30px ${FH}`, color: active ? C.amber : C.ink, align: 'center', alpha: letterA });
      planIcon(cx, base + 57, i, letterA);
      if (u <= 0) return;
      const v = b.v * u;
      const hv = barH(v);
      ctx.save();
      ctx.fillStyle = rgba(b.col, active ? 0.32 : 0.22); ctx.fillRect(cx - BW / 2, base - hv, BW, hv);
      ctx.beginPath(); ctx.rect(cx - BW / 2, base - hv, BW, hv); ctx.clip();
      ctx.strokeStyle = rgba(b.col, 0.75); ctx.lineWidth = 1.4;
      ctx.beginPath(); for (let k = -BW; k < hv + BW; k += 8) { ctx.moveTo(cx - BW / 2, base - k); ctx.lineTo(cx + BW / 2, base - k - BW); } ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = b.col; ctx.lineWidth = 2.4; ctx.strokeRect(cx - BW / 2, base - hv, BW, hv);
      if (v > 108) { // axis-break symbol
        const yb = base - 1.08 * H100;
        ctx.save(); ctx.fillStyle = 'rgba(8,38,72,1)'; ctx.fillRect(cx - BW / 2 - 6, yb - 7, BW + 12, 12);
        ctx.strokeStyle = b.col; ctx.lineWidth = 2;
        for (const o of [-6, 5]) { ctx.beginPath(); ctx.moveTo(cx - BW / 2 - 6, yb + o + 3); ctx.lineTo(cx - 6, yb + o - 3); ctx.lineTo(cx + 6, yb + o + 3); ctx.lineTo(cx + BW / 2 + 6, yb + o - 3); ctx.stroke(); }
        ctx.restore();
      }
      const lab = `${Math.round(v)}%` + (b.k === 'D' && u >= 1 ? '*' : '');
      text(ctx, lab, cx + (b.k === 'D' ? -3 : 0), barLabelY(v), { font: `29px ${FH}`, color: b.col, align: 'center' });
      // amber outline while this bar fills (focus hand-off from the load test)
      const fa = env(t, cy.bar[0] - 0.05, cy.bar[1] + 0.3, 0.1, 0.3);
      if (fa > 0) { ctx.save(); ctx.globalAlpha *= fa; ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.strokeRect(cx - BW / 2 - 6, base - hv - 6, BW + 12, hv + 6); ctx.restore(); }
    });
    // D: mint pulse while it holds, then a mint bracket for the final frame
    const cxD = barCx(3), hvD = barH(211), lyD = barLabelY(211);
    const pa = seg(t, CYC[3].bar[1], CYC[3].bar[1] + 0.2) * (1 - seg(t, E0 - 0.3, E0));
    if (pa > 0) {
      const ph = 0.5 - 0.5 * Math.cos(TAU * (t - CYC[3].bar[1]) / 0.9);
      ctx.save(); ctx.globalAlpha *= pa; ctx.strokeStyle = rgba(C.mint, 0.25 + 0.5 * ph); ctx.lineWidth = 2 + 3 * ph;
      ctx.strokeRect(cxD - BW / 2 - 5, base - hvD - 5, BW + 10, hvD + 5); ctx.restore();
    }
    const br = seg(t, F0 + 0.2, F0 + 0.6, ease.inOut);
    if (br > 0) {
      ctx.save(); ctx.strokeStyle = C.mint; ctx.lineWidth = 2;
      const bx0 = cxD - 46, by0 = lyD - 26; // left edge centred in the gap between the "37%" and "211%*" labels
      rectPerim(bx0, by0, x1 - 4 - bx0, base + 6 - by0, br); ctx.restore();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ caption panel
  const CAPS = [
    { k: 'A', t0: 1.7, t1: B0, tag: 'INTACT', l1: [['Marginal ridges', C.ink]], l2: [['brace the cusps', C.ink]], l2t: null },
    { k: 'B', t0: B0, t1: C0, tag: 'ENDO ACCESS + RCT', l1: [['Ridges intact:', C.ink]], l2: [['only ', C.ink], ['−5%', C.cyan], [' stiffness', C.ink]], l2t: CYC[1].r[0] },
    { k: 'C', t0: C0, t1: D0, tag: 'MOD CAVITY', l1: [['Both marginal ridges cut:', C.ink]], l2: [['−63%', C.coral], [' stiffness', C.ink]], l2t: CYC[2].r[0] },
    { k: 'D', t0: D0, t1: E0, tag: 'CUSPAL-COVERAGE ONLAY (CAST GOLD*)', l1: [['Onlay splints the cusps:', C.ink]], l2: [['stiffness restored*', C.mint]], l2t: CYC[3].r[0] },
  ];
  const BOX = { x0: 64, x1: 950, y0: 1198, y1: 1390 };
  function boxFrame(a, invert) {
    const { x0, x1, y0, y1 } = BOX;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(5,26,54,0.62)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (invert > 0) { ctx.fillStyle = rgba(C.paper, invert); const w = (x1 - x0) * ease.out(invert); ctx.fillRect(x0, y0, w, y1 - y0); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(invert > 0.5 ? C.deep : C.ink, 0.6); ctx.strokeRect(x0 + 7, y0 + 7, x1 - x0 - 14, y1 - y0 - 14);
    // corner ticks
    ctx.strokeStyle = invert > 0.5 ? C.deep : C.amber; ctx.lineWidth = 3;
    for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(cx + sx * 26, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * 26); ctx.stroke();
    }
    ctx.restore();
  }
  function drawCaption(t, frameA) {
    if (frameA <= 0) return;
    const inv = seg(t, F0 - 0.05, F0 + 0.3, ease.inOut);
    boxFrame(frameA, inv);
    const { x0, y0, y1 } = BOX;
    // revision triangle (drafting "delta"): stays put, only its letter is superseded
    const bx = x0 + 78, by = (y0 + y1) / 2 + 4;
    const triA = frameA * (1 - seg(t, E0 - 0.3, E0 - 0.05));
    if (triA > 0) {
      ctx.save(); ctx.globalAlpha = triA; ctx.strokeStyle = C.amber; ctx.lineJoin = 'round';
      ctx.lineWidth = 3; triPath(ctx, bx, by, 126); ctx.stroke();
      ctx.lineWidth = 1.2; triPath(ctx, bx, by, 104); ctx.stroke();
      ctx.restore();
    }
    for (const cp of CAPS) {
      const a = Math.min(seg(t, cp.t0 - 0.08, cp.t0 + 0.1), 1 - seg(t, cp.t1 - 0.3, cp.t1 - 0.06));
      // letter: pops in, later struck through (amber) and replaced by the next revision
      const la = Math.min(seg(t, cp.t0 - 0.05, cp.t0 + 0.1), 1 - seg(t, cp.t1 - 0.2, cp.t1 - 0.05)) * triA;
      if (la > 0) {
        const pop = 0.75 + 0.25 * ease.outBack(seg(t, cp.t0 - 0.05, cp.t0 + 0.2));
        ctx.save(); ctx.translate(bx, by + 4); ctx.scale(pop, pop);
        text(ctx, cp.k, 0, 18, { font: `52px ${FH}`, color: C.amber, align: 'center', alpha: la });
        ctx.restore();
        const st = cp.k === 'D' ? 0 : seg(t, cp.t1 - 0.4, cp.t1 - 0.22, ease.inOut);
        if (st > 0) { ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = C.amber; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(bx - 22, by + 18); ctx.lineTo(bx - 22 + 44 * st, by + 18 - 36 * st); ctx.stroke(); ctx.restore(); }
      }
      if (a <= 0) continue;
      const dy = -14 * ease.in(seg(t, cp.t1 - 0.3, cp.t1 - 0.06));
      const rv = seg(t, cp.t0 - 0.08, cp.t0 + 0.38);
      text(ctx, Kit.type(cp.tag, rv * 1.5), x0 + 160, y0 + 60 + dy, { font: `32px ${FH}`, color: C.cyan, alpha: a, ls: 1.5 });
      const n1 = Math.max(0, rv * 1.6 - 0.25) * (segLen(cp.l1) + (cp.l2t ? 0 : segLen(cp.l2)));
      rich(ctx, cp.l1, x0 + 160, y0 + 118 + dy, `500 41px ${FB}`, n1, a);
      const n2 = cp.l2t ? seg(t, cp.l2t, cp.l2t + 0.3) * segLen(cp.l2) : n1 - segLen(cp.l1);
      rich(ctx, cp.l2, x0 + 160, y0 + 170 + dy, `500 41px ${FB}`, n2, a);
    }
    // E — clinical outcome
    const aE = Math.min(seg(t, E0 - 0.08, E0 + 0.1), 1 - seg(t, F0 - 0.3, F0));
    if (aE > 0) {
      const dy = -12 * ease.in(seg(t, F0 - 0.3, F0));
      const pop = seg(t, E0 - 0.1, E0 + 0.35, ease.outBack);
      ctx.save(); ctx.globalAlpha = aE;
      ctx.translate(x0 + 114, y0 + 156 + dy); ctx.scale(0.7 + 0.3 * pop, 0.7 + 0.3 * pop);
      text(ctx, '6', -30, 0, { font: `184px ${FH}`, color: C.amber, align: 'center' });
      text(ctx, '×', 48, -8, { font: `100px ${FH}`, color: C.amber, align: 'center' });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = aE * 0.6; ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0 + 232, y0 + 30); ctx.lineTo(x0 + 232, y1 - 30); ctx.stroke(); ctx.restore();
      const rv = seg(t, E0 - 0.15, E0 + 0.3);
      const lines = [[['tooth-loss rate', C.ink]], [['when ', C.ink], ['not crowned', C.coral]], [['after RCT', C.ink]]];
      let n = rv * 42;
      lines.forEach((ln, i) => { rich(ctx, ln, x0 + 260, y0 + 72 + i * 47 + dy, `500 41px ${FB}`, n, aE); n -= segLen(ln); });
    }
    // F — takeaway (inverted box), conditional on the mechanism shown: marginal-ridge loss
    const aF = seg(t, F0 - 0.05, F0 + 0.15);
    if (aF > 0) {
      const cx = (x0 + BOX.x1) / 2;
      text(ctx, Kit.type('POSTERIOR ENDO TOOTH, RIDGE LOST?', seg(t, F0, F0 + 0.35)), cx, y0 + 50, { font: `33px ${FH}`, color: C.deep, align: 'center', alpha: aF, ls: 2 });
      const pop = seg(t, F0 + 0.1, F0 + 0.45, ease.outBack);
      ctx.save(); ctx.globalAlpha = aF * seg(t, F0 + 0.1, F0 + 0.25); ctx.translate(cx, y0 + 128); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
      text(ctx, 'COVER THE CUSPS.', 0, 0, { font: `80px ${FH}`, color: C.deep, align: 'center' });
      ctx.restore();
      text(ctx, 'onlay or crown', cx, y0 + 168, { font: `500 32px ${FB}`, color: C.deep, align: 'center', alpha: aF * seg(t, F0 + 0.3, F0 + 0.6) });
    }
  }
  const SOURCES = [
    { t0: 2.2, t1: D0, l: ['Stiffness: Reeh, Messer & Douglas, J Endod 1989', 'in vitro · maxillary premolars · strain gauges, ~111 N'] },
    { t0: D0, t1: E0, l: ['*D: separate in-vitro series · cast-gold onlay = 2.11× intact', 'Reeh, Douglas & Messer, J Dent Res 1989'] },
    { t0: E0, t1: F0, l: ['Aquilino & Caplan, J Prosthet Dent 2002', 'adjusted HR 6.0 (95% CI 3.2–11.3) · 203 teeth', 'retrospective · all tooth types · association only'] },
    { t0: F0, t1: DUR + 1, l: ['Reeh 1989 (J Endod; J Dent Res) · Aquilino 2002', 'Linn & Messer 1994 · ESE position statement 2021'] },
  ];
  function drawSources(t) {
    for (const s of SOURCES) {
      const a = env(t, s.t0, s.t1, 0.3, 0.25);
      if (a <= 0) continue;
      s.l.forEach((ln, i) => { const f = fitSize(ln, FB, 23, 22, 876); text(ctx, ln, 70, 1414 + i * 24, { font: `${f}px ${FB}`, color: C.cyan, alpha: a * 0.95 }); });
    }
  }

  // ------------------------------------------------------------------ E: ratio pictogram over the dimmed drawing
  const PG = { x0: 96, x1: 984, y0: 596, y1: 1052 };
  const iconMap = (cx, cy) => (x, y) => [cx + x * 6, cy - (y - 1.45) * 6];
  function drawIcon(cx, cy, u, col, crowned, a) {
    if (u <= 0 || a <= 0) return;
    const m = iconMap(cx, cy);
    ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (u >= 1) {
      ctx.save(); trace(ctx, outline, true, m); ctx.clip();
      ctx.fillStyle = rgba(col, 0.14); ctx.fillRect(cx - 40, cy - 60, 80, 120);
      if (crowned) { const yc = m(0, 3.3)[1]; ctx.fillStyle = rgba(C.mint, 0.55); ctx.fillRect(cx - 40, cy - 60, 80, yc - (cy - 60)); ctx.strokeStyle = C.mint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 40, yc); ctx.lineTo(cx + 40, yc); ctx.stroke(); }
      ctx.restore();
    }
    ctx.strokeStyle = col; ctx.lineWidth = 2.6; trace(ctx, partial(outlineOpen, u, outlineOpenCL), false, m); ctx.stroke();
    ctx.restore();
  }
  function drawPictogram(t) {
    const a = Math.min(seg(t, E0 - 0.1, E0 + 0.25), 1 - seg(t, F0 - 0.35, F0));
    if (a <= 0) return;
    const { x0, x1, y0, y1 } = PG;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(6,28,58,0.94)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
    for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.beginPath(); ctx.moveTo(cx + sx * 24, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * 24); ctx.stroke(); }
    ctx.strokeStyle = rgba(C.ink, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + 64); ctx.lineTo(x1, y0 + 64); ctx.stroke();
    ctx.restore();
    text(ctx, 'FIELD DATA · TOOTH LOSS, ANY CAUSE', x0 + 30, y0 + 42, { font: `26px ${FH}`, color: C.cyan, alpha: a * seg(t, E0, E0 + 0.25), ls: 2 });
    // rows
    const r1 = 790, r2 = 950, ix = 452, step = 74;
    text(ctx, 'CROWNED', x0 + 30, r1 + 12, { font: `34px ${FH}`, color: C.mint, alpha: a * seg(t, E0 + 0.25, E0 + 0.45), ls: 1 });
    text(ctx, 'NOT', x0 + 30, r2 - 6, { font: `34px ${FH}`, color: C.coral, alpha: a * seg(t, E0 + 0.55, E0 + 0.75), ls: 1 });
    text(ctx, 'CROWNED', x0 + 30, r2 + 30, { font: `34px ${FH}`, color: C.coral, alpha: a * seg(t, E0 + 0.55, E0 + 0.75), ls: 1 });
    ctx.save(); ctx.globalAlpha = a * 0.5 * seg(t, E0 + 0.3, E0 + 0.6); ctx.setLineDash([6, 6]); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0 + 24, (r1 + r2) / 2 - 6); ctx.lineTo(x1 - 24, (r1 + r2) / 2 - 6); ctx.stroke(); ctx.restore();
    const T0 = E0 + 0.4, dt = 0.18;
    let pen = null;
    for (let k = 0; k < 7; k++) {
      const u = seg(t, T0 + k * dt, T0 + (k + 1) * dt, ease.inOut);
      const cx = k === 0 ? ix : ix + (k - 1) * step, cy = k === 0 ? r1 : r2;
      drawIcon(cx, cy, u, k === 0 ? C.mint : C.coral, k === 0, a);
      if (u > 0 && u < 1) { const pt = partial(outlineOpen, u, outlineOpenCL); const l = pt[pt.length - 1]; pen = iconMap(cx, cy)(l[0], l[1]); }
    }
    if (pen) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pen[0], pen[1], 9, 0, TAU); ctx.moveTo(pen[0] - 18, pen[1]); ctx.lineTo(pen[0] + 18, pen[1]); ctx.moveTo(pen[0], pen[1] - 18); ctx.lineTo(pen[0], pen[1] + 18); ctx.stroke(); ctx.restore(); }
    const p1 = seg(t, T0 + 0.15, T0 + 0.4, ease.outBack), p6 = seg(t, T0 + 7 * dt, T0 + 7 * dt + 0.3, ease.outBack);
    if (p1 > 0) { ctx.save(); ctx.translate(x1 - 30, r1 + 20); ctx.scale(0.7 + 0.3 * p1, 0.7 + 0.3 * p1); text(ctx, '1×', 0, 0, { font: `60px ${FH}`, color: C.mint, align: 'right', alpha: a * clamp(p1) }); ctx.restore(); }
    if (p6 > 0) { ctx.save(); ctx.translate(x1 - 30, r2 + 20); ctx.scale(0.7 + 0.3 * p6, 0.7 + 0.3 * p6); text(ctx, '6×', 0, 0, { font: `60px ${FH}`, color: C.coral, align: 'right', alpha: a * clamp(p6) }); ctx.restore(); }
  }

  // ------------------------------------------------------------------ title block
  function drawTitleBlock(a) {
    if (a <= 0) return;
    const x0 = 64, x1 = 950, y0 = 1474, y1 = 1578, ym = 1526;
    const cols = [x0, 352, 760, x1];
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(5,26,54,0.55)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym);
    for (const c of cols.slice(1, -1)) { ctx.moveTo(c, y0); ctx.lineTo(c, y1); }
    ctx.stroke();
    ctx.restore();
    const cell = (lab, val, cx, cy, col = C.ink, fs = 25) => {
      text(ctx, lab, cx + 10, cy + 18, { font: `16px ${FH}`, color: C.cyan, alpha: a * 0.8, ls: 1.5 });
      text(ctx, val, cx + 10, cy + 44, { font: `${fs}px ${FH}`, color: col, alpha: a });
    };
    cell('DRAWING NO.', 'ENDO-06', cols[0], y0);
    cell('TITLE', 'CUSPAL COVERAGE', cols[1], y0);
    cell('SCALE', 'NTS', cols[2], y0);
    cell('DRAWN BY', '@natebrooksendo', cols[0], ym);
    cell('NOTE', 'δ & STRAIN ZONES SCHEMATIC', cols[1], ym, C.amber, 23);
    cell('SHEET', '1 / 1', cols[2], ym);
  }

  // ------------------------------------------------------------------ general notes (decorative fine print below the title block)
  function drawNotes(a) {
    if (a <= 0) return;
    const L = ['GENERAL NOTES', '1. SECTION AND DEFLECTION SCHEMATIC, NOT TO SCALE.', '2. STIFFNESS: IN VITRO STRAIN-GAUGE DATA, PREMOLARS.', '3. 6× = ASSOCIATION, RETROSPECTIVE COHORT.'];
    L.forEach((s, i) => text(ctx, s, 70, 1620 + i * 26, { font: `${i ? 19 : 20}px ${FH}`, color: C.cyan, alpha: a * (i ? 0.55 : 0.7), ls: 1.5 }));
  }

  // ------------------------------------------------------------------ header
  function drawHeader(t) {
    const wipe = seg(t, 0, 0.35, ease.out);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 64 + 960 * wipe, 440); ctx.clip();
    text(ctx, 'LOAD CASE 01 · OCCLUSAL · PREMOLAR · B–L SECTION', 66, 272, { font: `22px ${FH}`, color: C.cyan, ls: 2.5, alpha: 0.9 });
    text(ctx, 'WHY COVER THE CUSPS?', 62, 356, { font: `86px ${FH}`, color: C.ink, ls: 1 });
    ctx.restore();
    text(ctx, Kit.type('cusp flexure in an endo-treated tooth', seg(t, 0.2, 0.8)), 66, 402, { font: `400 32px ${FB}`, color: C.cyan });
    const r = seg(t, 0.1, 0.7, ease.inOut);
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(64, 422); ctx.lineTo(64 + 952 * r, 422); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(64, 429); ctx.lineTo(64 + 952 * r, 429); ctx.stroke(); ctx.restore();
  }

  // ------------------------------------------------------------------ labels around the section
  function drawSectionLabels(t, intro) {
    const a = intro.labels;
    text(ctx, 'SECTION 1–1', 66, 474, { font: `26px ${FH}`, color: C.cyan, ls: 2, alpha: a });
    text(ctx, 'δ ∝ 1/stiffness', 66, 503, { font: `22px ${FB}`, color: C.amber, alpha: a * 0.95 });
    text(ctx, 'exaggerated', 66, 529, { font: `22px ${FB}`, color: C.amber, alpha: a * 0.95 });
    // material call-outs (left margin)
    const lab = (s, x, y, tx, ty, al, col = C.ink) => { if (al <= 0) return; leader(ctx, x, y, tx, ty, col, al * 0.8); text(ctx, s, x - 4, y - 6, { font: `22px ${FH}`, color: col, alpha: al, ls: 1 }); };
    const e = px(-4.12, 4.4), d = px(-3.0, 2.2), g = gaugePos(-1);
    lab('ENAMEL', 70, 772, e[0] + 2, e[1], a);
    lab('DENTIN', 70, 852, d[0], d[1], a);
    // strain gauge
    if (a > 0) { leader(ctx, 70, 942, g[0] - 6, g[1], C.ink, a * 0.8); text(ctx, 'STRAIN', 66, 915, { font: `22px ${FH}`, alpha: a, ls: 1 }); text(ctx, 'GAUGE', 66, 936, { font: `22px ${FH}`, alpha: a, ls: 1 }); }
    // gutta-percha: left column, short leader
    const gpA = seg(t, TB.gp[0] + 0.1, TB.gp[1] + 0.05);
    if (gpA > 0) {
      const gp = px(0.05, -1.25);
      leader(ctx, 156, 1010, gp[0] - 4, gp[1], C.amber, gpA * 0.85);
      text(ctx, 'GUTTA-', 66, 1000, { font: `22px ${FH}`, color: C.amber, alpha: gpA, ls: 1 }); text(ctx, 'PERCHA', 66, 1022, { font: `22px ${FH}`, color: C.amber, alpha: gpA, ls: 1 });
    }
    // right side: pulp, then onlay + core (elbow leaders: horizontal run, then a short angled run)
    const pulpA = a * (1 - seg(t, B0 + 0.25, B0 + 0.55));
    if (pulpA > 0) { const p = px(0.95, 2.6); elbow(ctx, 622, 837, 588, p[0], p[1], C.ink, pulpA * 0.8); text(ctx, 'PULP', 628, 844, { font: `22px ${FH}`, alpha: pulpA, ls: 1 }); }
    const onA = seg(t, D0 + 1.85, D0 + 2.15);
    if (onA > 0) {
      const on = px(3.05, 5.9), co = px(1.1, 3.25);
      leader(ctx, 606, 705, on[0], on[1], C.mint, onA * 0.85); text(ctx, 'ONLAY', 610, 712, { font: `24px ${FH}`, color: C.mint, alpha: onA, ls: 1 });
      elbow(ctx, 622, 785, 566, co[0], co[1], C.ink, onA * 0.8); text(ctx, 'CORE', 628, 792, { font: `22px ${FH}`, alpha: onA, ls: 1 });
    }
    // buccal / lingual under the section (matches the occlusal-view letters)
    const bl = { font: `24px ${FH}`, color: C.cyan, align: 'center', alpha: a * 0.9 };
    text(ctx, 'B', pxRaw(-2.4, 0)[0], 1192, bl); text(ctx, 'L', pxRaw(2.4, 0)[0], 1192, bl);
  }

  // ------------------------------------------------------------------ F: approval stamp
  function drawStamp(t) {
    const u = seg(t, F0 + 1.0, F0 + 1.22, ease.out);
    if (u <= 0) return;
    ctx.save(); ctx.globalAlpha = 0.88 * seg(t, F0 + 1.0, F0 + 1.1);
    ctx.translate(532, 1116); ctx.rotate(-0.1); const s = lerp(1.35, 0.82, u); ctx.scale(s, s);
    ctx.drawImage(stamp, -160, -60);
    ctx.restore();
  }

  // ------------------------------------------------------------------ render
  async function setup() { buildBackground(); buildDimMask(); buildStamp(); }

  function render(t) {
    t = clamp(t, 0, DUR);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(bg, 0, 0);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    const intro = {
      outline: seg(t, 0.35, 1.6, ease.inOut), dej: seg(t, 0.8, 1.7, ease.inOut), pulp: seg(t, 1.0, 1.8, ease.inOut),
      hatch: seg(t, 1.0, 2.0, ease.inOut), fill: seg(t, 0.9, 1.9), mount: seg(t, 0.6, 1.3), plan: seg(t, 0.9, 1.3), planLine: seg(t, 0.9, 1.7, ease.inOut),
      ridges: seg(t, 1.5, 1.9), secLine: seg(t, 1.6, 2.0), labels: seg(t, 1.4, 2.0),
    };
    const k = stageIdx(t), K = CYC[k].K;
    const load = loadAt(t), lift = liftAt(t);
    const dpx = load * K;
    DEF = dpx / S;

    drawHeader(t);
    drawCenterline(seg(t, 0.5, 1.2));
    drawMount(intro);
    drawToothLayer(t, intro);
    {
      const [mx0] = pxRaw(-6.2, 0), [mx1, my1] = pxRaw(6.2, -4.05);
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, my1);
      for (let x = mx1; x >= mx0; x -= 4) ctx.lineTo(x, my1 + Math.sin((x - mx0) / 26) * 5);
      ctx.lineTo(0, my1); ctx.closePath(); ctx.clip();
      ctx.drawImage(layer, 0, 0); ctx.restore();
    }
    drawHidden(t);
    drawStrain(load, K);
    drawGauges(load, K, intro.labels);
    drawGhost(dpx);
    drawLoad(t, lift, load);
    drawDeflectionDims(dpx, clamp(load * 3));
    drawSplayArrows(k === 2 ? load : 0);
    drawSectionLabels(t, intro);
    drawHiddenCallout(t);
    drawSectionCloud(t);
    drawChart(t, seg(t, 1.1, 1.7));
    drawWire(t);
    // MOD cut: the occlusal view becomes the focal point (section and chart dimmed)
    const z = zoomAt(t);
    if (z > 0) { ctx.save(); ctx.globalAlpha = 0.42 * z; ctx.drawImage(dimMask, 0, 0); ctx.restore(); }
    drawPlan(t, intro, load, k);

    // clinical outcome: dim the whole sheet, plot the ratio pictogram
    const dim = env(t, E0 - 0.15, F0 + 0.1, 0.35, 0.4) * 0.65;
    if (dim > 0) { ctx.save(); ctx.globalAlpha = dim; ctx.drawImage(dimMask, 0, 0); ctx.restore(); }
    drawPictogram(t);
    drawStamp(t);

    drawCaption(t, seg(t, 1.6, 2.1));
    drawSources(t);
    drawTitleBlock(seg(t, 0.4, 1.0));
    drawNotes(seg(t, 0.9, 1.5));
    // plotter head cross-hair while the outline is drawn
    if (intro.outline > 0 && intro.outline < 1) {
      const pt = partial(outlineOpen, intro.outline, outlineOpenCL); const last = pt[pt.length - 1]; const p = pxRaw(last[0], last[1]);
      ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, TAU);
      ctx.moveTo(p[0] - 20, p[1]); ctx.lineTo(p[0] + 20, p[1]); ctx.moveTo(p[0], p[1] - 20); ctx.lineTo(p[0], p[1] + 20); ctx.stroke(); ctx.restore();
    }
    // plotter erase → the loop lands on the blank t = 0 sheet
    const e1 = seg(t, DUR - 0.6, DUR - 0.1, ease.inOut), e2 = seg(t, DUR - 0.35, DUR - 0.03, ease.inOut), e3 = seg(t, DUR - 0.45, DUR - 0.05, ease.inOut);
    if (e1 > 0) { ctx.save(); ctx.globalAlpha = e1; ctx.drawImage(bg, 0, 432, W, 764, 0, 432, W, 764); ctx.drawImage(bg, 0, 1600, W, H - 1600, 0, 1600, W, H - 1600); ctx.restore(); }
    if (e2 > 0) { ctx.save(); ctx.globalAlpha = e2; ctx.drawImage(bg, 0, 1196, W, 404, 0, 1196, W, 404); ctx.restore(); }
    if (e3 > 0) { const xw = Math.max(0, lerp(W, 0, e3)); ctx.drawImage(bg, xw, 0, W - xw, 432, xw, 0, W - xw, 432); }
  }

  window.REEL = {
    title: 'Why cover the cusps? (blueprint)',
    duration: DUR,
    poster: 11.95,
    canvas,
    fonts: ['400 86px "Share Tech Mono"', '500 41px "IBM Plex Mono"', '400 32px "IBM Plex Mono"', '400 30px "JetBrains Mono"'],
    setup,
    render,
  };
  Kit.boot(REEL);
})();
