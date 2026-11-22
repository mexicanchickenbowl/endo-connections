/*
 * 05 · Fiber vs metal post — where the stress goes. FEA-software look, split-screen.
 * Pure function of time: REEL.render(t). See NOTES.md for sources + what is schematic.
 */
(function () {
  const { canvas, ctx } = Kit.createCanvas();
  const { W, H, clamp, lerp, seg, ease } = Kit;
  const g = GEO;
  const MONO = '"IBM Plex Mono", "DejaVu Sans Mono", monospace';

  // ---------------- layout ----------------
  const S = 26.5;                 // px per mm
  const PW = 432;                 // panel width
  const VT = 470, CT = 514, VB = 1214, CH = VB - CT; // viewport top, content top, bottom
  const Y0 = 548;                 // screen y of the incisal edge
  const PANELS = [
    { x0: 64, kind: 'metal', tag: 'A', name: 'PREFAB METAL POST' },
    { x0: 584, kind: 'fiber', tag: 'B', name: 'GLASS-FIBER POST' },
  ];
  const LX = (x) => PW / 2 + x * S, LY = (y) => (Y0 - CT) + y * S;      // mm -> panel-local px
  const MMX = (lx) => (lx - PW / 2) / S, MMY = (ly) => (ly - (Y0 - CT)) / S;
  const DOCK = { x: 64, y: 1232, w: 952, h: 340 };

  // ---------------- timeline (s) ----------------
  const T = {
    geom: [0, 0.6], mesh: [0.1, 1.0], mat: [0.6, 1.2], labels: [0.7, 3.6],
    chart: [1.2, 5.4], load: [4.7, 5.1], cbar: [5.0, 5.45], flood: [5.4, 6.9],
    capsA: [6.0, 10.9], capsB: [6.9, 10.9], mxA: [6.2, 10.9], mxB: [7.1, 10.9],
    over: [10.8, 11.3], crackA: [11.0, 11.9], crackB: [11.9, 12.8], failA: [11.7, 16.8], failB: [12.6, 16.8],
    caveat: [13.2, 16.8], ferrule: [15.4, 16.0], dialog: [16.7, 17.1], line1: [16.75, 17.15], line2: [18.1, 18.45],
    outro: [21.5, 21.95], end: 22,
  };
  const fadeWin = (t, a, b, f = 0.3) => Math.min(seg(t, a, a + f, ease.smooth), 1 - seg(t, b - f, b, ease.smooth));

  // ---------------- colours ----------------
  const C = {
    app: '#101215', panelTop: '#2b2f36', panelBot: '#16181c', line: '#2e333b', text: '#e8ebef', dim: '#9aa3ad',
    faint: '#6b7480', amber: '#ffc24b', red: '#ff6b6b', green: '#52e3a4', teal: '#3ad0d8', tealL: '#86e8ee', metal: '#a9c1da', fiber: '#f0dfa6', load: '#ff5ac8',
  };
  const hex = Kit.hex;
  const MAT = {
    common: { 1: hex('#41464e'), 2: hex('#c4b08b'), 3: hex('#d3d8de'), 4: hex('#8f81b6'), 6: hex('#d27a35') },
    metal: hex('#8ea4bb'), fiber: hex('#eadcab'),
  };

  // turbo colormap (polynomial approx.), banded like FEA contour plots
  function turbo(t) {
    t = clamp(t);
    const r = 0.13572138 + t * (4.61539260 + t * (-42.66032258 + t * (132.13108234 + t * (-152.94239396 + t * 59.28637943))));
    const gg = 0.09140261 + t * (2.19418839 + t * (4.84296658 + t * (-14.18503333 + t * (4.27729857 + t * 2.82956604))));
    const b = 0.10667330 + t * (12.64194608 + t * (-60.58204836 + t * (110.36276771 + t * (-89.90310912 + t * 27.34824973))));
    return [clamp(r) * 255, clamp(gg) * 255, clamp(b) * 255];
  }
  const NB = 12;
  const bandCol = (k) => turbo(0.07 + 0.9 * (k + 0.5) / NB);
  const LUTN = 1024, LR = new Uint8Array(LUTN), LG = new Uint8Array(LUTN), LB = new Uint8Array(LUTN);
  for (let i = 0; i < LUTN; i++) { const k = Math.min(NB - 1, Math.floor((i / (LUTN - 1)) * NB)); const c = bandCol(k); LR[i] = c[0]; LG[i] = c[1]; LB[i] = c[2]; }

  // ---------------- precomputed data (setup) ----------------
  let ids, distL, shade, stripe, mesh, outlinePaths, panelsData, crackData, MXPOS, frame0, NODES = 0, ELEMS = 0;

  function polyPath(poly, closed = true) {
    const p = new Path2D();
    poly.forEach(([x, y], i) => (i ? p.lineTo(LX(x), LY(y)) : p.moveTo(LX(x), LY(y))));
    if (closed) p.closePath();
    return p;
  }
  function pip(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  function exactId(x, y) {
    if (pip(g.POST, x, y)) return 5;
    if (pip(g.GP, x, y)) return 6;
    if (pip(g.CORE, x, y)) return 4;
    if (pip(g.CROWN, x, y)) return 3;
    if (pip(g.OUTER, x, y)) return 2;
    if (pip(g.BONE, x, y)) return 1;
    return 0;
  }

  function buildMaterialMap() {
    const rc = document.createElement('canvas'); rc.width = PW; rc.height = CH;
    const r = rc.getContext('2d');
    const fill = (poly, id) => { r.fillStyle = `rgb(${id * 40},0,0)`; r.fill(polyPath(poly)); };
    fill(g.BONE, 1); fill(g.OUTER, 2); fill(g.CROWN, 3); fill(g.CORE, 4); fill(g.GP, 6); fill(g.POST, 5);
    const d = r.getImageData(0, 0, PW, CH).data;
    ids = new Uint8Array(PW * CH);
    for (let i = 0; i < PW * CH; i++) {
      const R = d[i * 4], A = d[i * 4 + 3];
      const k = Math.round(R / 40);
      if (A > 250 && Math.abs(R - k * 40) < 4) ids[i] = k;
      else if (A < 4) ids[i] = 0;
      else { const lx = i % PW, ly = (i / PW) | 0; ids[i] = exactId(MMX(lx + 0.5), MMY(ly + 0.5)); }
    }
  }

  function buildFields() {
    const N = PW * CH;
    distL = new Float32Array(N); shade = new Float32Array(N); stripe = new Float32Array(N).fill(1);
    const fM = new Float32Array(N), fF = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const id = ids[i]; if (!id) continue;
      const lx = i % PW, ly = (i / PW) | 0, x = MMX(lx + 0.5), y = MMY(ly + 0.5);
      distL[i] = Math.hypot(x - g.LOAD.x, y - g.LOAD.y);
      let s = 1;
      if (id === 1) { // trabecular-ish bone texture
        const n = Kit.noise2(x * 2.2, y * 2.2, 3) * 0.6 + Kit.noise2(x * 5.5, y * 5.5, 9) * 0.4;
        s = 0.86 + 0.22 * Math.abs(n);
      } else if (id === 2) s = 0.97 + 0.05 * Kit.noise2(x * 3, y * 3, 5);
      else if (id === 3) s = 0.95 + 0.07 * (1 - Math.abs(x) / 3.5);
      else if (id === 5) { const u = clamp(Math.abs(x) / g.PHW0); s = 1.12 - 0.42 * u * u; stripe[i] = 0.9 + 0.1 * Math.cos((x / 0.2) * Math.PI * 2) + 0.03 * Kit.noise1(y * 3, 4); }
      else if (id === 6) s = 0.92 + 0.12 * Kit.noise2(x * 4, y * 4, 2);
      shade[i] = s;
      if (id !== 1) { fM[i] = g.field('metal', id, x, y); fF[i] = g.field('fiber', id, x, y); }
    }
    // MX probe = location of the maximum of the plotted result (dentin only) in each panel
    MXPOS = {};
    for (const [kind, f] of [['metal', fM], ['fiber', fF]]) {
      let best = -1, bi = 0;
      for (let i = 0; i < N; i++) if (ids[i] === 2 && f[i] > best) { best = f[i]; bi = i; }
      MXPOS[kind] = { x: MMX((bi % PW) + 0.5), y: MMY(((bi / PW) | 0) + 0.5), v: best };
    }
    panelsData = PANELS.map((p) => {
      const oc = document.createElement('canvas'); oc.width = PW; oc.height = CH;
      const octx = oc.getContext('2d');
      return { ...p, oc, octx, img: octx.createImageData(PW, CH), base: p.kind === 'metal' ? fM : fF, postCol: p.kind === 'metal' ? MAT.metal : MAT.fiber };
    });
  }

  // ---------------- mesh (variable-density Poisson + Delaunay) ----------------
  function idAtMM(x, y) {
    const lx = Math.floor(LX(x)), ly = Math.floor(LY(y));
    if (lx < 0 || ly < 0 || lx >= PW || ly >= CH) return 0;
    return ids[ly * PW + lx];
  }
  function hAt(x, y) {
    const id = idAtMM(x, y);
    if (id === 1) return 0.85;
    if (id === 0) return 0.55;
    let h = id === 3 ? 0.48 : id === 4 ? 0.44 : id === 5 ? 0.36 : id === 6 ? 0.34 : 0.47;
    if (id === 2) {
      const dp = g.distToPost(x, y);
      if (dp < 0.9) h = Math.min(h, 0.31 + 0.15 * clamp(dp / 0.9));
      if (y > 8.6 && y < 13) h = Math.min(h, 0.36);
    }
    return h;
  }
  function buildMesh() {
    const rnd = Kit.rng(505);
    const pts = [], cell = 0.25, grid = new Map();
    const key = (i, j) => i * 100003 + j;
    const add = (x, y) => { pts.push([x, y]); const i = Math.floor(x / cell), j = Math.floor(y / cell); const k = key(i, j); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(pts.length - 1); };
    const ok = (x, y, r) => {
      const i0 = Math.floor((x - r) / cell), i1 = Math.floor((x + r) / cell), j0 = Math.floor((y - r) / cell), j1 = Math.floor((y + r) / cell);
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const a = grid.get(key(i, j)); if (!a) continue; for (const q of a) { const p = pts[q]; if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < r * r) return false; } }
      return true;
    };
    const coreLine = [g.CORE[0], g.CORE[g.CORE.length - 1]];
    const box = [[-g.BONE_W, g.BONE_B], [g.BONE_W, g.BONE_B]];
    const contours = [[g.POST, true], [g.GP, true], [g.OUTER, true], [g.PREP, false], [coreLine, false], [g.BONE, true], [box, false]];
    for (const [poly, closed] of contours) {
      const P = closed ? [...poly, poly[0]] : poly;
      let carry = 0;
      for (let i = 0; i < P.length - 1; i++) {
        const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        let s = carry;
        while (s < L) {
          const u = s / L, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), h = hAt(x, y) * 0.78;
          if (ok(x, y, h * 0.62)) add(x, y);
          s += h;
        }
        carry = s - L;
      }
    }
    const NB0 = pts.length;
    const cand = [];
    for (let y = -0.4; y < g.BONE_B; y += 0.11) for (let x = -g.BONE_W; x <= g.BONE_W; x += 0.11) cand.push([x + (rnd() - 0.5) * 0.1, y + (rnd() - 0.5) * 0.1]);
    for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tmp = cand[i]; cand[i] = cand[j]; cand[j] = tmp; }
    for (const [x, y] of cand) { if (!idAtMM(x, y)) continue; const h = hAt(x, y); if (ok(x, y, h * 0.93)) add(x, y); }
    // Delaunay in panel px
    const flat = pts.map(([x, y]) => [LX(x), LY(y)]);
    const del = d3.Delaunay.from(flat);
    const tri = del.triangles, tris = [];
    for (let k = 0; k < tri.length; k += 3) {
      const a = tri[k], b = tri[k + 1], c = tri[k + 2];
      const A = flat[a], B = flat[b], Cc = flat[c];
      const cx = (A[0] + B[0] + Cc[0]) / 3, cy = (A[1] + B[1] + Cc[1]) / 3;
      const id = ids[Math.floor(cy) * PW + Math.floor(cx)] || 0;
      if (!id) continue;
      const maxE = Math.max(Math.hypot(A[0] - B[0], A[1] - B[1]), Math.hypot(B[0] - Cc[0], B[1] - Cc[1]), Math.hypot(Cc[0] - A[0], Cc[1] - A[1])) / S;
      if (maxE > (id === 1 ? 2.0 : 1.15)) continue;
      // reject triangles whose edge midpoints fall in another region class (tooth vs bone vs gap)
      const cls = (q) => { const v = ids[Math.floor(q[1]) * PW + Math.floor(q[0])] || 0; return v === 0 ? 0 : v === 1 ? 1 : 2; };
      const mid = (P, Q) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
      const cc = id === 1 ? 1 : 2;
      if ([mid(A, B), mid(B, Cc), mid(Cc, A)].some((m) => cls(m) !== cc && cls(m) === 0)) continue;
      const ty = MMY(cy);
      const ta = T.mesh[0] + (T.mesh[1] - T.mesh[0] - 0.25) * clamp(0.8 * (ty + 0.5) / 26.5 + 0.2 * Kit.hash(k, 7));
      // element quality = min interior angle / 60 deg
      const ang = (P, Q, R) => { const ux = Q[0] - P[0], uy = Q[1] - P[1], vx = R[0] - P[0], vy = R[1] - P[1]; return Math.acos(clamp((ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)), -1, 1)); };
      const q = Math.min(ang(A, B, Cc), ang(B, Cc, A), ang(Cc, A, B)) / (Math.PI / 3);
      tris.push({ a, b, c, id, cx, cy, ta, q });
    }
    ELEMS = tris.length;
    // unique edges -> time buckets
    const NBK = 28, edges = new Map();
    tris.forEach((t, ti) => {
      for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) {
        const k = u < v ? u * 1e6 + v : v * 1e6 + u;
        const e = edges.get(k);
        if (!e) edges.set(k, { u, v, ta: t.ta, bone: t.id === 1 });
        else { e.ta = Math.min(e.ta, t.ta); e.bone = e.bone && t.id === 1; }
      }
    });
    const bucketsTooth = Array.from({ length: NBK }, () => new Path2D()), bucketsBone = Array.from({ length: NBK }, () => new Path2D());
    const allTooth = new Path2D(), allBone = new Path2D();
    const bt = (ta) => Math.min(NBK - 1, Math.floor(((ta - T.mesh[0]) / (T.mesh[1] - T.mesh[0])) * NBK));
    for (const e of edges.values()) {
      const P = flat[e.u], Q = flat[e.v], b = bt(e.ta);
      const tgt = e.bone ? bucketsBone[b] : bucketsTooth[b], all = e.bone ? allBone : allTooth;
      tgt.moveTo(P[0], P[1]); tgt.lineTo(Q[0], Q[1]); all.moveTo(P[0], P[1]); all.lineTo(Q[0], Q[1]);
    }
    const qc = new Array(28).fill(0);
    for (const tr of tris) qc[Math.min(27, Math.max(0, Math.floor(((tr.q - 0.25) / 0.75) * 28)))]++;
    // first-appearance time of each node (for the live node / element counters)
    const nodeTa = new Float32Array(pts.length).fill(1e9);
    for (const tr of tris) for (const v of [tr.a, tr.b, tr.c]) nodeTa[v] = Math.min(nodeTa[v], tr.ta);
    NODES = 0; for (let i = 0; i < nodeTa.length; i++) if (nodeTa[i] < 1e9) NODES++;
    mesh = { pts, flat, tris, NBK, bucketsTooth, bucketsBone, allTooth, allBone, NB0, qmax: Math.max(...qc), nodeTa };
  }

  function buildCracks() {
    const mk = (branches, allowed) => {
      const br = branches.map(({ pts, s0, s1 }) => {
        const px = pts.map(([x, y]) => [LX(x), LY(y)]);
        const cum = [0]; for (let i = 1; i < px.length; i++) cum.push(cum[i - 1] + Math.hypot(px[i][0] - px[i - 1][0], px[i][1] - px[i - 1][1]));
        return { px, cum, L: cum[cum.length - 1], s0, s1 };
      });
      // elements that get "eroded" along the crack (FEA element deletion look)
      const del = [];
      for (const t of mesh.tris) {
        if (!allowed.includes(t.id)) continue;
        let best = 1e9, bs = 0;
        for (const b of br) for (let i = 0; i < b.px.length - 1; i++) {
          const P = b.px[i], Q = b.px[i + 1], dx = Q[0] - P[0], dy = Q[1] - P[1], L2 = dx * dx + dy * dy;
          const u = clamp(((t.cx - P[0]) * dx + (t.cy - P[1]) * dy) / L2), d = Math.hypot(P[0] + dx * u - t.cx, P[1] + dy * u - t.cy);
          if (d < best) { best = d; bs = b.s0 + ((b.cum[i] + u * Math.sqrt(L2)) / b.L) * (b.s1 - b.s0); }
        }
        if (best < 0.3 * S) del.push({ t, s: bs, d: best });
      }
      return { br, del };
    };
    crackData = { metal: mk(g.CRACK_METAL, [2]), fiber: mk(g.CRACK_FIBER, [2, 3, 4, 5]) };
  }

  function buildOutlines() {
    const coreLine = new Path2D(); coreLine.moveTo(LX(g.CORE[0][0]), LY(g.CORE[0][1])); coreLine.lineTo(LX(g.CORE[g.CORE.length - 1][0]), LY(g.CORE[g.CORE.length - 1][1]));
    outlinePaths = {
      outer: polyPath(g.OUTER), prep: polyPath(g.PREP, false), core: coreLine, post: polyPath(g.POST), gp: polyPath(g.GP),
      bone: polyPath(g.BONE.slice(1, g.BONE.length - 1), false),
    };
    const len = (poly) => { let L = 0; for (let i = 1; i < poly.length; i++) L += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]); return L * S; };
    outlinePaths.lens = { outer: len(g.OUTER) + 10, prep: len(g.PREP), post: len(g.POST) + 10, gp: len(g.GP) + 10, bone: len(g.BONE) };
  }

  // ---------------- drawing helpers ----------------
  function text(s, x, y, size, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.font = `${o.weight || 400} ${size}px ${MONO}`;
    ctx.fillStyle = o.color || C.text;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'alphabetic';
    if (o.ls) ctx.letterSpacing = o.ls + 'px';
    ctx.fillText(s, x, y);
    const w = ctx.measureText(s).width;
    ctx.restore();
    return w;
  }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  const rgb = (c, a = 1) => Kit.rgba(c, a);

  function drawArrow(x1, y1, x2, y2, col, width, head) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * head * 0.8, y2 - Math.sin(a) * head * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head);
    ctx.lineTo(x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // ---------------- scene pieces ----------------
  function drawChrome(t) {
    ctx.fillStyle = C.app; ctx.fillRect(0, 0, W, H);
    // window title bar
    ctx.fillStyle = '#0b0c0e'; ctx.fillRect(0, 0, W, 60);
    ['#e0605a', '#d9a640', '#4fb35c'].forEach((c, i) => { ctx.fillStyle = rgb(c, 0.75); ctx.beginPath(); ctx.arc(34 + i * 26, 30, 8, 0, Math.PI * 2); ctx.fill(); });
    text('FEA·lab  —  post_compare.fem', W / 2, 38, 22, { color: '#7d8691', align: 'center' });
    // menu
    ctx.fillStyle = '#14161a'; ctx.fillRect(0, 60, W, 50);
    let mx = 28; for (const m of ['File', 'Edit', 'Geometry', 'Mesh', 'Loads', 'Solve', 'Results', 'View']) mx += text(m, mx, 93, 22, { color: '#9aa3ad' }) + 30;
    // toolbar
    ctx.fillStyle = '#181b1f'; ctx.fillRect(0, 110, W, 76);
    const tools = 9;
    for (let i = 0; i < tools; i++) {
      const x = 24 + i * 64, y = 122, act = (i === 2 && t < T.mat[1]) || (i === 4 && t >= T.load[0] && t < T.flood[0]) || (i === 6 && t >= T.flood[0]);
      rrect(x, y, 52, 52, 8); ctx.fillStyle = act ? '#2a4152' : '#22262c'; ctx.fill();
      ctx.strokeStyle = act ? '#4cc9f0' : '#30353d'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.save(); ctx.translate(x + 26, y + 26); ctx.strokeStyle = act ? '#bfe9fb' : '#7d8691'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2;
      ctx.beginPath();
      if (i === 0) { ctx.rect(-12, -12, 24, 24); }
      else if (i === 1) { ctx.arc(0, 0, 12, 0, Math.PI * 2); }
      else if (i === 2) { ctx.moveTo(-13, 11); ctx.lineTo(0, -12); ctx.lineTo(13, 11); ctx.closePath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(0, 11); ctx.closePath(); }
      else if (i === 3) { ctx.moveTo(-12, 12); ctx.lineTo(-12, -12); ctx.lineTo(12, -12); ctx.moveTo(-6, 6); ctx.lineTo(6, -6); }
      else if (i === 4) { ctx.moveTo(10, -10); ctx.lineTo(-8, 8); ctx.moveTo(-8, 8); ctx.lineTo(-8, -1); ctx.moveTo(-8, 8); ctx.lineTo(1, 8); }
      else if (i === 5) { ctx.moveTo(-8, -12); ctx.lineTo(12, 0); ctx.lineTo(-8, 12); ctx.closePath(); }
      else if (i === 6) { for (let k = 0; k < 4; k++) ctx.rect(-12 + k * 6, -12, 5, 24); }
      else if (i === 7) { ctx.arc(-2, -2, 9, 0, Math.PI * 2); ctx.moveTo(5, 5); ctx.lineTo(12, 12); }
      else { ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.moveTo(0, -12); ctx.lineTo(0, 12); }
      ctx.stroke(); ctx.restore();
    }
    // tabs
    ctx.fillStyle = '#121418'; ctx.fillRect(0, 186, W, 48);
    const tabs = ['Geometry', 'Mesh', 'Setup', 'Results'];
    const active = t < T.geom[1] ? 0 : t < T.mat[1] ? 1 : t < T.flood[0] ? 2 : 3;
    let tx = 28;
    tabs.forEach((s, i) => { const w = text(s, tx, 218, 22, { color: i === active ? '#e8ebef' : '#6b7480', weight: i === active ? 600 : 400 }); if (i === active) { ctx.fillStyle = '#4cc9f0'; ctx.fillRect(tx, 228, w, 3); } tx += w + 40; });
    // console region under the dock (covered by IG caption area: decorative only)
    ctx.fillStyle = '#0d0f12'; ctx.fillRect(0, 1586, W, 274);
    const logs = [
      [0.2, '> geometry: 2-D labio-palatal section, max. central incisor'],
      [1.0, `> mesh: ${ELEMS.toLocaleString('en-US')} tri elements, ${NODES.toLocaleString('en-US')} nodes`],
      [1.3, '> materials: linear elastic, isotropic (E approx.)'],
      [4.8, '> load case 1: 100 N @ 45 deg, palatal surface'],
      [5.5, '> results (dentin): SCHEMATIC pattern, not a solve'],
      [10.8, '> load case 2: lab-style overload (illustrative)'],
      [16.9, '> summary written'],
    ];
    let ly = 1622;
    for (const [ts, s] of logs) { if (t < ts) break; text(s, 28, ly, 21, { color: '#56606b', alpha: seg(t, ts, ts + 0.3) }); ly += 32; }
    // status bar (live counts while meshing, matching the histogram)
    let ne = ELEMS, nn = NODES;
    if (t < T.mesh[1] + 0.3) {
      ne = 0; for (const tr of mesh.tris) if (tr.ta <= t) ne++;
      nn = 0; for (let i = 0; i < mesh.nodeTa.length; i++) if (mesh.nodeTa[i] <= t) nn++;
    }
    ctx.fillStyle = '#0a0b0d'; ctx.fillRect(0, 1868, W, 52);
    text(`Nodes ${nn.toLocaleString('en-US')}  ·  Elements ${ne.toLocaleString('en-US')}  ·  2-D plane, linear static  ·  schematic`, 28, 1900, 20, { color: '#5d6670' });
  }

  function drawTitle() {
    // always fully visible (hook readable at frame 0; no blink at the loop point)
    text('STUDY 05  ·  RESTORED ROOT  ·  2-D SECTION', 64, 274, 24, { color: '#6f7984', ls: 1 });
    text('METAL vs FIBER POST', 64, 340, 72, { weight: 700, color: '#f4f6f8' });
    text('where does the stress go?', 64, 394, 42, { weight: 500, color: '#5fd0ff' });
  }

  function drawChip(t) {
    // only two states: load case 1 (pending -> applied) and load case 2
    const a2 = seg(t, T.over[0], T.over[0] + 0.35, ease.smooth);
    const applied = seg(t, T.load[0], T.load[1]);
    const d1 = Kit.mix('#7d8691', C.load, applied), dot = Kit.mix(d1, C.red, a2);
    rrect(64, 412, 952, 46, 10); ctx.fillStyle = '#181b20'; ctx.fill(); ctx.strokeStyle = '#2c3139'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = rgb(dot); ctx.beginPath(); ctx.arc(90, 435, 8, 0, Math.PI * 2); ctx.fill();
    if (a2 < 1) text('LOAD CASE 1 · 100 N @ 45°', 110, 445, 30, { weight: 500, color: '#dfe4ea', alpha: 1 - a2 });
    if (a2 > 0) text('LOAD CASE 2 · lab-style overload (illustrative)', 110, 445, 30, { weight: 500, color: '#dfe4ea', alpha: a2 });
  }

  function drawPanelFrame(p, t) {
    const x0 = p.x0;
    const grad = ctx.createLinearGradient(0, VT, 0, VB);
    grad.addColorStop(0, C.panelTop); grad.addColorStop(1, C.panelBot);
    ctx.fillStyle = grad; ctx.fillRect(x0, VT, PW, VB - VT);
    // engineering grid (1 mm)
    ctx.save(); ctx.beginPath(); ctx.rect(x0, CT, PW, CH); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let gx = -8; gx <= 8; gx++) { const X = x0 + LX(gx) + 0.5; ctx.moveTo(X, CT); ctx.lineTo(X, VB); }
    for (let gy = -1; gy <= 26; gy++) { const Y = CT + LY(gy) + 0.5; ctx.moveTo(x0, Y); ctx.lineTo(x0 + PW, Y); }
    ctx.stroke(); ctx.restore();
    // header strip
    ctx.fillStyle = '#1d2126'; ctx.fillRect(x0, VT, PW, CT - VT);
    ctx.fillStyle = p.kind === 'metal' ? '#8ea4bb' : '#eadcab'; ctx.fillRect(x0 + 16, VT + 14, 16, 16);
    text(`${p.tag} · ${p.name}`, x0 + 42, VT + 32, 30, { weight: 700, color: '#eef1f4' });
    ctx.strokeStyle = '#2f343c'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, VT + 1, PW - 2, VB - VT - 2);
  }

  function renderField(pd, st) {
    // result scoped to DENTIN: other bodies keep their material colour, dimmed slightly ("not plotted")
    const data = pd.img.data, base = pd.base, mc0 = MAT.common, pc = pd.postCol;
    const R = st.R, L = st.L, front = st.front, N = PW * CH;
    for (let i = 0; i < N; i++) {
      const id = ids[i], a = i * 4;
      if (!id) { data[a + 3] = 0; continue; }
      const mc = id === 5 ? pc : mc0[id], sh = id === 5 && pd.kind === 'fiber' ? shade[i] * stripe[i] : shade[i];
      let r = mc[0] * sh, gg = mc[1] * sh, b = mc[2] * sh;
      if (id !== 1 && R > 0) {
        const fd = R - distL[i];
        if (fd > 0) {
          const rv = fd > 1.3 ? 1 : fd / 1.3;
          if (id === 2) {
            let v = base[i] * L; v = v < 0 ? 0 : v > 1 ? 1 : v;
            const k = (v * (LUTN - 1)) | 0;
            r += (LR[k] - r) * rv; gg += (LG[k] - gg) * rv; b += (LB[k] - b) * rv;
            if (front > 0 && fd < 0.7) { const gl = (1 - fd / 0.7) * 0.45 * front; r += (255 - r) * gl; gg += (255 - gg) * gl; b += (255 - b) * gl; }
          } else {
            const dm = 1 - 0.22 * rv; r *= dm; gg *= dm; b *= dm;
          }
        }
      }
      data[a] = r; data[a + 1] = gg; data[a + 2] = b; data[a + 3] = 255;
    }
    pd.octx.putImageData(pd.img, 0, 0);
  }

  function drawOutlines(t, x0) {
    const op = outlinePaths, gp = seg(t, T.geom[0], T.geom[1], ease.inOut), mf = seg(t, T.mat[0], T.mat[1]);
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 2, CT, PW - 4, CH - 2); ctx.clip(); ctx.translate(x0, CT);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const col = `rgba(${lerp(200, 8, mf) | 0},${lerp(225, 10, mf) | 0},${lerp(240, 14, mf) | 0},${lerp(0.9, 0.85, mf)})`;
    ctx.strokeStyle = col; ctx.lineWidth = lerp(1.6, 2.2, mf);
    if (gp <= 0) { ctx.restore(); return; }
    for (const k of ['bone', 'outer', 'prep', 'post', 'gp']) {
      const L = op.lens[k];
      ctx.setLineDash(gp < 1 ? [L * gp, L] : []);
      ctx.stroke(op[k]);
    }
    ctx.setLineDash([]);
    if (mf > 0) { ctx.globalAlpha = mf; ctx.stroke(op.core); }
    ctx.restore();
  }

  function drawMesh(t, x0, darkness) {
    const m = mesh, mf = seg(t, T.mat[0], T.mat[1]);
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 2, CT, PW - 4, CH - 2); ctx.clip();
    ctx.translate(x0, CT); ctx.lineWidth = 1;
    const done = t > T.mesh[1] + 0.3;
    const drawSet = (buckets, all, styleFn) => {
      if (done) { styleFn(1); ctx.stroke(all); return; }
      for (let b = 0; b < m.NBK; b++) {
        const tb = T.mesh[0] + (b / m.NBK) * (T.mesh[1] - T.mesh[0]);
        const a = seg(t, tb, tb + 0.28);
        if (a <= 0) continue;
        styleFn(a); ctx.stroke(buckets[b]);
      }
    };
    // tooth mesh: light on bare background, dark once materials are shown
    drawSet(m.bucketsTooth, m.allTooth, (a) => {
      const l = 1 - mf;
      ctx.strokeStyle = `rgba(${lerp(10, 205, l) | 0},${lerp(12, 220, l) | 0},${lerp(16, 236, l) | 0},${a * lerp(darkness, 0.5, l)})`;
    });
    drawSet(m.bucketsBone, m.allBone, (a) => { ctx.strokeStyle = `rgba(200,212,228,${a * lerp(0.4, 0.13, mf)})`; });
    ctx.restore();
  }

  const crackWin = (kind) => (kind === 'metal' ? T.crackA : T.crackB);
  function crackProgress(t, kind) { const w = crackWin(kind); return seg(t, w[0], w[1], ease.out); }

  function drawCrack(pd, t, x0) {
    const cp = crackProgress(t, pd.kind); if (cp <= 0) return;
    const cd = crackData[pd.kind], w = crackWin(pd.kind);
    ctx.save(); ctx.translate(x0, CT);
    // eroded (deleted) elements along the crack, with a thin red element edge (explicit-FEA look)
    const er = new Path2D();
    for (const { t: tr, s } of cd.del) {
      if (s > cp) continue;
      const A = mesh.flat[tr.a], B = mesh.flat[tr.b], Cc = mesh.flat[tr.c];
      er.moveTo(A[0], A[1]); er.lineTo(B[0], B[1]); er.lineTo(Cc[0], Cc[1]); er.closePath();
    }
    ctx.fillStyle = 'rgba(12,13,15,0.9)'; ctx.fill(er);
    ctx.strokeStyle = 'rgba(255,107,107,0.6)'; ctx.lineWidth = 1; ctx.stroke(er);
    const open = seg(t, w[0] + 0.3, w[1] + 0.6, ease.out);
    // crack line (each branch grows within its share of the progress)
    for (const b of cd.br) {
      const bp = clamp((cp - b.s0) / (b.s1 - b.s0)); if (bp <= 0) continue;
      const Lc = b.L * bp;
      ctx.beginPath(); ctx.moveTo(b.px[0][0], b.px[0][1]);
      let tipx = b.px[0][0], tipy = b.px[0][1];
      for (let i = 1; i < b.px.length; i++) {
        if (b.cum[i] <= Lc) { ctx.lineTo(b.px[i][0], b.px[i][1]); tipx = b.px[i][0]; tipy = b.px[i][1]; }
        else { const u = (Lc - b.cum[i - 1]) / (b.cum[i] - b.cum[i - 1]); tipx = lerp(b.px[i - 1][0], b.px[i][0], u); tipy = lerp(b.px[i - 1][1], b.px[i][1], u); ctx.lineTo(tipx, tipy); break; }
      }
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 8; ctx.stroke();
      ctx.strokeStyle = '#040404'; ctx.lineWidth = 4 + 3 * open; ctx.stroke();
      ctx.save(); ctx.translate(-1, -1);
      ctx.strokeStyle = 'rgba(255,248,240,0.9)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      if (bp < 1) { const gr = ctx.createRadialGradient(tipx, tipy, 0, tipx, tipy, 16); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(tipx, tipy, 16, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }

  function loadState(t) {
    const pulse = t > T.load[1] ? 0.5 - 0.5 * Math.cos(2 * Math.PI * 0.8 * (t - T.load[1])) : 0;
    const over = seg(t, T.over[0], T.over[1], ease.inOut);
    return { pulse, over };
  }

  function drawLoad(t, x0) {
    const a = seg(t, T.load[0], T.load[1], ease.out); if (a <= 0) return;
    const { pulse, over } = loadState(t);
    const dir = [-Math.SQRT1_2, Math.SQRT1_2];
    const tipX = x0 + LX(g.LOAD.x) + 4, tipY = CT + LY(g.LOAD.y) - 4;
    const L = (100 + 22 * pulse * (1 - over) + 46 * over) * a;
    const fade = 1 - seg(t, T.dialog[0], T.dialog[1]) * 0.6;
    ctx.save(); ctx.globalAlpha = fade;
    // glow
    ctx.shadowColor = rgb(C.load, 0.7); ctx.shadowBlur = 10 + 14 * pulse;
    drawArrow(tipX - dir[0] * (L + 34), tipY - dir[1] * (L + 34), tipX, tipY, C.load, 7 + 4 * over, 26 + 6 * over);
    ctx.shadowBlur = 0;
    // contact marker
    ctx.strokeStyle = C.load; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tipX, tipY, 6, 0, Math.PI * 2); ctx.stroke();
    // label: anchored beside (left of / above) the arrow tail, not on it; does not wobble with the pulse
    const Lb = (100 + 46 * over) * a + 34;
    const tx = tipX - dir[0] * Lb - 24, ty = Math.max(CT + 30, tipY - dir[1] * Lb - 16);
    if (over < 1) text('100 N', tx, ty, 30, { weight: 700, color: C.load, align: 'right', alpha: a * (1 - seg(over, 0.3, 0.7)) });
    if (over > 0) text('OVERLOAD', tx, ty, 30, { weight: 700, color: C.load, align: 'right', alpha: a * seg(over, 0.3, 0.7) });
    // 45 deg reference
    ctx.globalAlpha = fade * a * 0.55 * (1 - over);
    ctx.strokeStyle = C.load; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX, tipY - 92); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(tipX, tipY, 46, -Math.PI / 2, -Math.PI / 4); ctx.stroke();
    ctx.restore();
  }

  function drawPanelDecor(p, t) {
    const x0 = p.x0;
    // axes triad (bottom-left, over bone)
    const ox = x0 + 34, oy = VB - 34;
    ctx.save(); ctx.globalAlpha = 0.9;
    drawArrow(ox, oy, ox + 44, oy, '#ff6b6b', 2.5, 10);
    drawArrow(ox, oy, ox, oy - 44, '#57d68d', 2.5, 10);
    ctx.fillStyle = '#5fa8ff'; ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2); ctx.fill();
    text('X', ox + 50, oy + 7, 20, { weight: 700, color: '#ff8a8a' });
    text('Y', ox - 6, oy - 52, 20, { weight: 700, color: '#7fe3a8' });
    ctx.restore();
    const ill = fadeWin(t, crackWin(p.kind)[0], T.dialog[1], 0.3);
    if (ill < 1) text('2-D · not to scale', ox + 82, VB - 22, 22, { color: '#9aa4ae', alpha: 0.95 * (1 - ill) });
    // 18 chars like "2-D · not to scale": panel B's copy must end left of x 960 (Reels button column)
    if (ill > 0) text('illustrative crack', ox + 82, VB - 22, 22, { color: '#d6dde4', alpha: ill });
    // fixed-support symbols along the bone sides
    ctx.save(); ctx.strokeStyle = 'rgba(160,172,186,0.55)'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 6; k++) {
      const y = CT + LY(14.2 + k * 1.75);
      for (const side of [0, 1]) {
        const x = side ? x0 + PW - 6 : x0 + 6, s = side ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 12 * s, y); ctx.lineTo(x, y + 9); ctx.closePath(); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function labelLeader(tx, ty, lx, ly, s, col, size = 28, align = 'left', alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.strokeStyle = rgb(col, 0.9); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const w = text(s, align === 'left' ? lx - 4 : lx + 4, ly + 10, size, { color: col, align: align === 'left' ? 'right' : 'left', weight: 600, alpha });
    return w;
  }

  function drawMaterialLabels(t) {
    const a = fadeWin(t, T.labels[0], T.labels[1], 0.35); if (a <= 0) return;
    const x0 = PANELS[0].x0, X = (x) => x0 + LX(x), Y = (y) => CT + LY(y);
    const lab = (s, mx, my, ly) => {
      const lx = x0 + 16;
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(236,240,244,0.85)'; ctx.lineWidth = 1.5;
      const w = (() => { ctx.font = `600 30px ${MONO}`; return ctx.measureText(s).width; })();
      ctx.beginPath(); ctx.moveTo(lx + w + 8, Y(ly)); ctx.lineTo(X(mx), Y(my)); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(X(mx), Y(my), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      rrect(lx - 6, Y(ly) - 23, w + 12, 38, 6); ctx.fillStyle = `rgba(14,16,19,${0.72 * a})`; ctx.fill();
      text(s, lx, Y(ly) + 10, 30, { weight: 600, color: '#eef1f4', alpha: a });
    };
    lab('crown', -2.75, 5.6, 5.0);
    lab('core', -1.15, 6.9, 6.75);
    lab('post', -0.15, 10.8, 10.0);
    lab('dentin', -2.1, 15.6, 15.0);
    lab('GP', 0, 20.4, 20.0);
    text('bone', x0 + PW - 30, Y(13.75), 30, { weight: 600, color: '#c3cbd4', align: 'right', alpha: a });
  }

  function drawMX(t) {
    for (const p of PANELS) {
      const w = p.kind === 'metal' ? T.mxA : T.mxB;
      const a = fadeWin(t, w[0], w[1], 0.35); if (a <= 0) continue;
      const pop = seg(t, w[0], w[0] + 0.45, ease.outBack);
      const m = MXPOS[p.kind];
      const X = p.x0 + LX(m.x), Y = CT + LY(m.y);
      const side = m.x >= 0 ? 1 : -1;
      const tagX = p.x0 + LX(side * 5.25), tagY = p.kind === 'metal' ? CT + LY(m.y + 2.9) : CT + LY(m.y + 2.2);
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(tagX, tagY); ctx.stroke();
      ctx.beginPath(); ctx.arc(X, Y, 10 * pop, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X, Y, 10 * pop, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X - 15 * pop, Y); ctx.lineTo(X + 15 * pop, Y); ctx.moveTo(X, Y - 15 * pop); ctx.lineTo(X, Y + 15 * pop); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(tagX, tagY); ctx.stroke();
      rrect(tagX - 40, tagY - 22, 80, 44, 7); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
      text('MX', tagX, tagY + 11, 30, { weight: 700, color: '#d7263d', align: 'center', alpha: a });
    }
  }

  function drawCrackTags(t) {
    // two-line tags placed in free space beside the root, leader to the crack exit
    const tags = [
      { p: PANELS[0], w: T.failA, tx: -2.6, ty: 16.66, cx: -5.3, cy: 18.75, l1: 'below', l2: 'crest', col: '#ff8f8f' },
      { p: PANELS[1], w: T.failB, tx: 3.18, ty: 10.05, cx: 5.45, cy: 7.6, l1: 'above', l2: 'crest', col: C.tealL },
    ];
    const bw = 124, bh = 82;
    for (const k of tags) {
      const a = fadeWin(t, k.w[0], T.dialog[1], 0.35); if (a <= 0) continue;
      const X = k.p.x0 + LX(k.tx), Y = CT + LY(k.ty), CX = k.p.x0 + LX(k.cx), CY = CT + LY(k.cy);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = k.col; ctx.lineWidth = 2;
      const ey = CY + (Y > CY ? bh / 2 : -bh / 2), ex = CX + (X > CX ? 20 : -20);
      ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = k.col; ctx.beginPath(); ctx.arc(X, Y, 4.5, 0, Math.PI * 2); ctx.fill();
      rrect(CX - bw / 2, CY - bh / 2, bw, bh, 8); ctx.fillStyle = 'rgba(10,11,13,0.9)'; ctx.fill();
      ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      text(k.l1, CX, CY - 6, 32, { weight: 700, color: k.col, align: 'center', alpha: a });
      text(k.l2, CX, CY + 28, 32, { weight: 700, color: k.col, align: 'center', alpha: a });
    }
  }

  // ferrule: amber outline of the dentin collar on both panels + label (seen before it is read in the dialog)
  function drawFerrule(t) {
    const a = seg(t, T.ferrule[0], T.ferrule[1], ease.smooth); if (a <= 0) return;
    for (const p of PANELS) {
      ctx.save(); ctx.translate(p.x0, CT); ctx.globalAlpha = a;
      for (const poly of g.FERRULE) {
        ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(LX(x), LY(y)) : ctx.moveTo(LX(x), LY(y)))); ctx.closePath();
        ctx.fillStyle = 'rgba(255,194,75,0.28)'; ctx.fill();
        ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 6; ctx.stroke();
        ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.restore();
    }
    // label above-left of the crown on panel A (free space; no crack there), leader down to the labial collar.
    // Fades out with the dialog's arrival (its box sits partly left of the dialog edge and would peek out).
    const la = a * (1 - seg(t, T.dialog[0], T.dialog[1], ease.smooth)); if (la <= 0) return;
    const p = PANELS[0], x0 = p.x0;
    const lx = x0 + 16, ly = CT + LY(1.9), tx = x0 + LX(-2.15), ty = CT + LY(9.55);
    ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx + 70, ly + 14); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(tx, ty, 4.5, 0, Math.PI * 2); ctx.fill();
    rrect(lx - 7, ly - 30, 148, 44, 7); ctx.fillStyle = 'rgba(10,11,13,0.9)'; ctx.fill(); ctx.stroke();
    ctx.restore();
    text('ferrule', lx + 2, ly + 2, 32, { weight: 700, color: C.amber, alpha: la });
  }

  function drawCenter(t) {
    const cx = 540;
    ctx.fillStyle = '#121418'; ctx.fillRect(496, VT, 88, VB - VT);
    const vsA = 1 - seg(t, T.cbar[0], T.cbar[1]);
    if (vsA > 0) {
      ctx.save(); ctx.globalAlpha = vsA; ctx.strokeStyle = '#2a2f36'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, VT + 20); ctx.lineTo(cx, VB - 20); ctx.stroke(); ctx.restore();
      rrect(cx - 30, 820, 60, 44, 8); ctx.fillStyle = rgb('#1b1f24', vsA); ctx.fill();
      text('vs', cx, 851, 30, { weight: 700, color: '#aab3bd', align: 'center', alpha: vsA });
    }
    const a = seg(t, T.cbar[0], T.cbar[1], ease.out); if (a <= 0) return;
    const top = 612, bot = 1052, bx = 544, bw = 24;
    const grow = a;
    for (let k = 0; k < NB; k++) {
      const y1 = bot - ((k + 1) / NB) * (bot - top), y0 = bot - (k / NB) * (bot - top);
      const vis = clamp(grow * NB - k);
      if (vis <= 0) continue;
      const c = bandCol(k);
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
      ctx.fillRect(bx, y1 + (y0 - y1) * (1 - vis), bw, (y0 - y1) * vis + 0.5);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1;
    for (let k = 1; k < NB; k++) { const y = bot - (k / NB) * (bot - top); ctx.beginPath(); ctx.moveTo(bx, y + 0.5); ctx.lineTo(bx + bw + 5, y + 0.5); ctx.stroke(); }
    ctx.strokeStyle = '#cfd6de'; ctx.lineWidth = 1.5; ctx.strokeRect(bx, top, bw, bot - top);
    text('MAX', bx + bw / 2, top - 16, 28, { weight: 700, color: '#ff8a7a', align: 'center', alpha: a });
    text('MIN', bx + bw / 2, bot + 38, 28, { weight: 700, color: '#7fb2ff', align: 'center', alpha: a });
    ctx.save(); ctx.translate(519, (top + bot) / 2); ctx.rotate(-Math.PI / 2);
    text('von Mises (schematic, relative)', 0, 8, 23, { color: '#c3cbd4', align: 'center', alpha: a });
    ctx.restore();
  }

  // ---------------- dock (bottom band) ----------------
  function dockFrame(titles) {
    const d = DOCK;
    rrect(d.x, d.y, d.w, d.h, 10); ctx.fillStyle = '#16191d'; ctx.fill(); ctx.strokeStyle = '#2c3139'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.roundRect(d.x, d.y, d.w, 48, [10, 10, 0, 0]); ctx.fillStyle = '#1e2227'; ctx.fill(); ctx.restore();
    for (const [s, a] of titles) if (a > 0) text(s, d.x + 20, d.y + 35, 30, { weight: 700, color: '#c3ccd6', alpha: a });
    text('@natebrooksendo', 940, d.y + 32, 22, { color: '#7f8995', align: 'right' });
  }

  function drawChart(t) {
    const a = fadeWin(t, T.chart[0], T.chart[1], 0.3); if (a <= 0) return;
    const rows = [
      { lab: 'Dentin', lo: 18, hi: 25, val: '18–25', col: '#c9b48e' },
      { lab: 'Fiber post', lo: 20, hi: 40, val: '20–40', note: '(axial)', col: '#eadcab' },
      { lab: 'Gold alloy', lo: 90, val: '~90', col: '#d8b04a' },
      { lab: 'Titanium', lo: 110, val: '~110', col: '#a5b6c7' },
      { lab: 'Steel/zirconia', lo: 200, val: '~200', col: '#dfe4ea' },
    ];
    const x0 = 372, k = 2.1, y0 = 1316, dy = 42;
    // dentin reference band
    const bandA = seg(t, 1.45, 1.9) * a;
    ctx.fillStyle = `rgba(201,180,142,${0.16 * bandA})`; ctx.fillRect(x0 + 18 * k, y0 - 28, 7 * k, dy * 4 + 50);
    ctx.save(); ctx.globalAlpha = bandA * 0.8; ctx.strokeStyle = '#c9b48e'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0 + 18 * k + 0.5, y0 - 28); ctx.lineTo(x0 + 18 * k + 0.5, y0 + dy * 4 + 22); ctx.stroke(); ctx.restore();
    // axis
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#3a4048'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0 - 28); ctx.lineTo(x0, y0 + dy * 4 + 22); ctx.stroke(); ctx.restore();
    rows.forEach((r, i) => {
      const yc = y0 + i * dy, st = 1.3 + 0.12 * i;
      const la = seg(t, st - 0.05, st + 0.25) * a, gr = seg(t, st, st + 0.85, ease.outQuint);
      text(r.lab, 84, yc + 11, 32, { color: '#dfe4ea', alpha: la, weight: 500 });
      ctx.save(); ctx.globalAlpha = a;
      const wLo = r.lo * k * gr;
      ctx.fillStyle = r.col; rrect(x0, yc - 13, Math.max(1, wLo), 26, 3); ctx.fill();
      let end = wLo;
      if (r.hi) {
        const wHi = (r.hi - r.lo) * k * gr;
        ctx.save(); ctx.beginPath(); ctx.rect(x0 + wLo, yc - 13, wHi, 26); ctx.clip();
        ctx.fillStyle = rgb(r.col, 0.35); ctx.fillRect(x0 + wLo, yc - 13, wHi, 26);
        ctx.strokeStyle = rgb(r.col, 0.9); ctx.lineWidth = 2;
        for (let hx = -30; hx < wHi + 30; hx += 7) { ctx.beginPath(); ctx.moveTo(x0 + wLo + hx, yc + 13); ctx.lineTo(x0 + wLo + hx + 14, yc - 13); ctx.stroke(); }
        ctx.restore();
        end = wLo + wHi;
      }
      ctx.restore();
      const va = seg(t, st + 0.5, st + 0.8) * a;
      const vw = text(r.val, x0 + end + 12, yc + 11, 32, { weight: 700, color: r.col, alpha: va });
      if (r.note) text(r.note, x0 + end + 12 + vw + 10, yc + 10, 24, { color: '#aeb7c2', alpha: va });
    });
    text('Metal/zirconia ≈ 4–11× dentin', 84, 1535, 36, { weight: 600, color: C.amber, alpha: seg(t, 2.4, 2.7) * a });
    text('Typical FEA input values: Kinney 2003 · Nokar 2018', 84, 1562, 22, { color: '#7a838e', alpha: seg(t, 2.4, 2.7) * a });
  }

  function drawStressCaps(t) {
    const a = fadeWin(t, T.capsA[0], T.capsA[1], 0.35), a2 = fadeWin(t, T.capsB[0], T.capsB[1], 0.35);
    if (a <= 0 && a2 <= 0) return;
    const sl = (w) => 16 * (1 - seg(t, w[0], w[0] + 0.45, ease.out));
    const yA = 1334 + sl(T.capsA), yB = 1334 + sl(T.capsB);
    text('METAL', 84, yA, 40, { weight: 700, color: C.metal, alpha: a });
    text('along the post–', 84, yA + 50, 36, { weight: 500, alpha: a });
    text('dentin interface', 84, yA + 94, 36, { weight: 500, alpha: a });
    text('FIBER', 548, yB, 40, { weight: 700, color: C.fiber, alpha: a2 });
    text('cervical dentin,', 548, yB + 50, 36, { weight: 500, alpha: a2 });
    text('like natural teeth', 548, yB + 94, 36, { weight: 500, alpha: a2 });
    ctx.save(); ctx.globalAlpha = a * 0.7; ctx.fillStyle = '#2c3139'; ctx.fillRect(522, 1300, 2, 140); ctx.restore();
    text('Schematic, not a solve · relative scale, contrast exaggerated', 84, 1530, 22, { color: '#8a939e', alpha: a });
    text('Patterns after Pegoretti 2002 · Adanir & Belli 2007 · Nokar 2018', 84, 1561, 22, { color: '#7a838e', alpha: a });
  }

  // small drawn icons (no glyph fallback): cross and tick
  function iconX(cx, cy, r, col, a) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r); ctx.stroke(); ctx.restore();
  }
  function iconTick(cx, cy, r, col, a) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - r, cy + 1); ctx.lineTo(cx - r * 0.25, cy + r * 0.8); ctx.lineTo(cx + r, cy - r * 0.85); ctx.stroke(); ctx.restore();
  }

  function drawFailBand(t) {
    const a = fadeWin(t, T.failA[0], T.failA[1], 0.3); if (a <= 0) return;
    iconX(100, 1314, 11, C.red, a);
    text('ROOT FRACTURE', 128, 1327, 38, { weight: 700, color: C.red, alpha: a });
    text('often non-restorable', 84, 1374, 36, { weight: 500, alpha: a });
    const a2 = fadeWin(t, T.failB[0], T.failB[1], 0.3);
    iconTick(564, 1314, 12, C.teal, a2);
    text('CORE / CERVICAL', 592, 1327, 38, { weight: 700, color: C.teal, alpha: a2 });
    text('often restorable', 548, 1374, 36, { weight: 500, alpha: a2 });
    ctx.save(); ctx.globalAlpha = a * 0.7; ctx.fillStyle = '#2c3139'; ctx.fillRect(530, 1294, 2, 92); ctx.fillRect(84, 1398, 856, 2); ctx.restore();
    const c = fadeWin(t, T.caveat[0], T.caveat[1], 0.3);
    text('Caveat — clinical studies:', 84, 1446, 36, { weight: 600, color: C.amber, alpha: c });
    text('root-fracture rates similar', 84, 1490, 36, { weight: 500, alpha: c });
    text('Cast posts often fail at higher loads, but less favourably.', 84, 1530, 22, { color: '#8a939e', alpha: a });
    text('Akkayan 2002 · Fokkinga 2004 · Figueiredo 2015 · Martins 2021', 84, 1561, 22, { color: '#7a838e', alpha: a });
  }

  function drawSummaryDock(t) {
    const a = seg(t, T.dialog[0] + 0.2, T.dialog[1] + 0.4); if (a <= 0) return;
    text('Stress maps: schematic pattern, not a solve.', 84, 1372, 26, { color: '#aeb7c2', alpha: a });
    text('Real FEA differences are modest; studies disagree.', 84, 1418, 26, { color: '#aeb7c2', alpha: a });
    text('Full sources in the caption.', 84, 1464, 26, { color: '#7f8995', alpha: a });
  }

  function drawQuality(t) {
    const a = 1 - seg(t, T.chart[0] - 0.25, T.chart[0], ease.smooth); if (a <= 0) return;
    const NBIN = 28, q0 = 0.25, cnt = new Array(NBIN).fill(0);
    let n = 0;
    for (const tr of mesh.tris) { if (tr.ta > t) continue; n++; const k = Math.min(NBIN - 1, Math.max(0, Math.floor(((tr.q - q0) / (1 - q0)) * NBIN))); cnt[k]++; }
    const maxC = mesh.qmax, x0 = 120, x1 = 930, yb = 1500, hmax = 170, bw = (x1 - x0) / NBIN;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(76,201,240,0.45)';
    for (let k = 0; k < NBIN; k++) { const h = (cnt[k] / maxC) * hmax; if (h > 0) ctx.fillRect(x0 + k * bw + 2, yb - h, bw - 4, h); }
    ctx.strokeStyle = '#3a4048'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, yb + 0.5); ctx.lineTo(x1, yb + 0.5); ctx.stroke();
    ctx.restore();
    text('element quality (min angle / 60°)', x0, yb + 34, 22, { color: '#7f8995', alpha: a });
    text('poor', x0, yb - hmax - 4, 22, { color: '#7f8995', alpha: a });
    text('ideal', x1, yb - hmax - 4, 22, { color: '#7f8995', alpha: a, align: 'right' });
    text(`n = ${n.toLocaleString('en-US')}`, x1, yb + 34, 22, { color: '#aeb7c2', alpha: a, align: 'right' });
  }

  function drawDock(t) {
    // each title is tied to its body's fade, so a header never sits over an empty panel
    const titles = [
      ['MESH · element quality', 1 - seg(t, T.chart[0] - 0.25, T.chart[0], ease.smooth)],
      ['Elastic modulus E (GPa, approx.)', fadeWin(t, T.chart[0], T.chart[1], 0.3)],
      ['RESULTS · von Mises in dentin', fadeWin(t, T.capsA[0], T.capsA[1], 0.35)],
      ['FAILURE MODE · lab tests', fadeWin(t, T.failA[0], T.failA[1], 0.3)],
      ['SUMMARY', seg(t, T.dialog[0] + 0.2, T.dialog[1] + 0.4)],
    ];
    dockFrame(titles);
    drawQuality(t); drawChart(t); drawStressCaps(t); drawFailBand(t); drawSummaryDock(t);
  }

  // ---------------- final dialog ----------------
  function miniTooth(cx, top, s, a, fer, glow = 0) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, top); ctx.scale(s, s);
    const P = (poly, closed = true) => { ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (closed) ctx.closePath(); };
    P(g.OUTER); ctx.fillStyle = '#c4b08b'; ctx.fill();
    P(g.CROWN); ctx.fillStyle = '#d3d8de'; ctx.fill();
    P(g.CORE); ctx.fillStyle = '#8f81b6'; ctx.fill();
    // ferrule collar fills amber in sync with the "Ferrule + remaining dentin" line
    if (fer > 0) {
      ctx.save(); ctx.globalAlpha = a * fer;
      ctx.fillStyle = 'rgba(255,194,75,0.95)'; ctx.shadowColor = 'rgba(255,194,75,0.9)'; ctx.shadowBlur = 16 * glow;
      for (const poly of g.FERRULE) { P(poly); ctx.fill(); }
      ctx.restore();
    }
    P(g.GP); ctx.fillStyle = '#d27a35'; ctx.fill();
    P(g.POST); ctx.fillStyle = '#8b95a1'; ctx.fill();
    ctx.lineWidth = 1.6 / s; ctx.strokeStyle = '#0b0c0e'; P(g.OUTER); ctx.stroke(); P(g.PREP, false); ctx.stroke(); P(g.POST); ctx.stroke();
    ctx.restore();
  }

  function drawDialog(t) {
    const a = seg(t, T.dialog[0], T.dialog[1], ease.out); if (a <= 0) return;
    // dim the viewports
    ctx.fillStyle = `rgba(8,9,11,${0.66 * a})`; ctx.fillRect(64, VT, 952, VB - VT);
    const x = 84, y = 556 + 26 * (1 - a), w = 912, h = 566;
    ctx.save(); ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    rrect(x, y, w, h, 14); ctx.fillStyle = '#1a1d22'; ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#3a4048'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.roundRect(x, y, w, 52, [14, 14, 0, 0]); ctx.fillStyle = '#23272d'; ctx.fill();
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x + 28, y + 26, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.amber; ctx.fillRect(x, y + 52, 6, h - 52);
    ctx.restore();
    text('RESULT SUMMARY', x + 48, y + 37, 30, { weight: 700, color: '#e8ebef', alpha: a });
    text('×', x + w - 28, y + 37, 30, { color: '#7f8995', align: 'center', alpha: a });
    // beat 1: what a post does (and doesn't)
    const b = seg(t, T.line1[0], T.line1[1], ease.out), sl1 = 14 * (1 - b);
    text('A post retains', x + 36, y + 128 + sl1, 58, { weight: 700, color: '#ffffff', alpha: b });
    text('the core.', x + 36, y + 192 + sl1, 58, { weight: 700, color: '#ffffff', alpha: b });
    text("It doesn't reinforce", x + 36, y + 254 + sl1, 40, { weight: 500, color: '#c3cbd4', alpha: b });
    text('the root.', x + 36, y + 302 + sl1, 40, { weight: 500, color: '#c3cbd4', alpha: b });
    // beat 2: what matters (ferrule collar fills in sync)
    const b2 = seg(t, T.line2[0], T.line2[1], ease.out), sl2 = 14 * (1 - b2);
    ctx.save(); ctx.globalAlpha = b2; ctx.fillStyle = '#343a42'; ctx.fillRect(x + 36, y + 334, 560, 2); ctx.restore();
    text('Ferrule + remaining', x + 36, y + 396 + sl2, 44, { weight: 700, color: C.amber, alpha: b2 });
    text('dentin matter most.', x + 36, y + 450 + sl2, 44, { weight: 700, color: C.amber, alpha: b2 });
    text('With a 1.5–2 mm ferrule, post type matters less.', x + 36, y + 504, 22, { color: '#8a939e', alpha: b2 });
    text('Clinical evidence: limited.', x + 36, y + 534, 22, { color: '#8a939e', alpha: b2 });
    const ms = 17, mcx = x + w - 116, mtop = y + 86;
    const glow = 0.5 - 0.5 * Math.cos(2 * Math.PI * 0.45 * Math.max(0, t - T.line2[1]));
    miniTooth(mcx, mtop, ms, b, b2, glow);
    // ferrule callout: bracket on the labial side + label
    const fy0 = mtop + g.FERRULE_Y * ms, fy1 = mtop + 10.45 * ms, fx = mcx + g.XL(9.5) * ms - 9, fm = (fy0 + fy1) / 2;
    ctx.save(); ctx.globalAlpha = b2; ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(fx + 7, fy0); ctx.lineTo(fx, fy0); ctx.lineTo(fx, fy1); ctx.lineTo(fx + 7, fy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx, fm); ctx.lineTo(fx - 20, fm); ctx.stroke(); ctx.restore();
    text('ferrule', fx - 26, fm + 11, 32, { weight: 700, color: C.amber, align: 'right', alpha: b2 });
  }

  // ---------------- main render ----------------
  function renderScene(t) {
    drawChrome(t);
    drawTitle();
    drawChip(t);
    const mf = seg(t, T.mat[0], T.mat[1]);
    const { pulse, over } = loadState(t);
    const R = 27 * seg(t, T.flood[0], T.flood[1], (u) => 1 - Math.pow(1 - u, 2.2));
    const front = 1 - seg(t, T.flood[1] - 0.3, T.flood[1] + 0.2);
    const L = R > 0 ? (0.95 + 0.05 * pulse) * (1 - over) + 1.32 * over : 0;
    for (const pd of panelsData) {
      drawPanelFrame(pd, t);
      if (mf > 0) {
        renderField(pd, { R, L, front });
        ctx.save(); ctx.globalAlpha = mf; ctx.drawImage(pd.oc, pd.x0, CT); ctx.restore();
      }
      drawMesh(t, pd.x0, 0.32);
      drawOutlines(t, pd.x0);
      drawCrack(pd, t, pd.x0);
      drawPanelDecor(pd, t);
      drawLoad(t, pd.x0);
    }
    drawFerrule(t);
    drawMaterialLabels(t);
    drawMX(t);
    drawCrackTags(t);
    drawCenter(t);
    drawDock(t);
    drawDialog(t);
  }

  function render(t) {
    t = clamp(t, 0, T.end);
    renderScene(Math.min(t, T.outro[0]));
    // outro: dissolve into the exact first frame so the reel loops seamlessly
    const u = seg(t, T.outro[0], T.outro[1], ease.inOut);
    if (u > 0 && frame0) { ctx.save(); ctx.globalAlpha = u; ctx.drawImage(frame0, 0, 0); ctx.restore(); }
  }

  window.REEL = {
    title: 'Fiber vs metal post: where the stress goes',
    duration: T.end,
    poster: 14.3,
    canvas,
    fonts: ['700 72px "IBM Plex Mono"', '600 30px "IBM Plex Mono"', '500 36px "IBM Plex Mono"', '400 22px "IBM Plex Mono"'],
    async setup() {
      buildMaterialMap();
      buildFields();
      buildMesh();
      buildCracks();
      buildOutlines();
      renderScene(0);
      frame0 = document.createElement('canvas'); frame0.width = W; frame0.height = H;
      frame0.getContext('2d').drawImage(canvas, 0, 0);
    },
    render,
  };
  Kit.boot(REEL);
})();
