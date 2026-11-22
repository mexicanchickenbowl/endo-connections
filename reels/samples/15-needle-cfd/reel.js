/* Reel 15 — Side-vented vs open-ended irrigation needles, CFD-visualisation style.
 * Flow fields: toy 2-D lattice-Boltzmann solution (sim/lbm.cjs -> field.js), schematic.
 * The side-vented needle 1 mm short (final beat) is NOT the toy model: it is a labelled schematic of the
 * published 3-D CFD result (Boutsioukis et al., J Endod 2010;36:1664-8).
 * Everything drawn by render(t) — deterministic, no clocks, no Math.random. */
(function () {
  const { W, H, clamp, lerp, seg, env, ease, hash } = Kit;
  const { canvas, ctx: mainCtx } = Kit.createCanvas();
  let ctx = mainCtx;
  const panelC = document.createElement('canvas'); panelC.width = W; panelC.height = H; const pctx = panelC.getContext('2d');

  // ---------------------------------------------------------------- layout
  const S = 138;          // px per mm (vertical, true scale)
  const KX = 2.2;         // horizontal exaggeration of the canal (not to scale)
  const YWL = 1388;       // working length (apex) in px
  const YTOP = 548;       // top of the viewport (px)
  const CXA = 326, CXB = 760;
  const VMEAN = 5.0;      // m/s — mean lumen speed for 0.15 mL/s through ID 0.196 mm (sets the colour scale only)
  const VREF = 210;       // display px/s for normalised speed 1 (particle playback, slowed)
  const FONT = '"IBM Plex Sans", sans-serif', MONO = '"IBM Plex Mono", monospace';
  const C = {
    bg0: '#25272c', bg1: '#16171a', canal: '#0c0d10', line: '#e9edf2', dim: '#a3abb6', faint: '#8a929e',
    text: '#f3f5f8', cyan: '#62d8ff', hot: '#ff6a4d', gold: '#ffd36e',
  };
  // apical-pressure bar ratio: 3-D CFD, 6 % taper, needle 3 mm short (Singh et al. 2024, Table 2:
  // 42.36 / 103.63 kPa at 0.26 mL/s = 0.41; 8.22 / 17.48 = 0.47 at 0.083 mL/s). NOT the toy ratio (~0.2).
  const P_RATIO_3D = 0.41;

  // ---------------------------------------------------------------- colour maps
  function turbo(x) {
    x = clamp(x);
    const r = 0.13572138 + x * (4.6153926 + x * (-42.66032258 + x * (132.13108234 + x * (-152.94239396 + x * 59.28637943))));
    const g = 0.09140261 + x * (2.19418839 + x * (4.84296658 + x * (-14.18503333 + x * (4.27729857 + x * 2.82956604))));
    const b = 0.1066733 + x * (12.64194608 + x * (-60.58204836 + x * (110.36276771 + x * (-89.90310912 + x * 27.34824973))));
    return [clamp(r) * 255, clamp(g) * 255, clamp(b) * 255];
  }
  const MAGMA = [[0, '#000004'], [0.13, '#1c1044'], [0.25, '#4f127b'], [0.38, '#812581'], [0.5, '#b5367a'], [0.63, '#e55064'], [0.75, '#fb8761'], [0.88, '#fec287'], [1, '#fcfdbf']];
  const magma = (v) => Kit.colormap(MAGMA, clamp(v));
  // velocity colour coordinate: linear, saturating at VHI (relative scale on screen — no numbers shown)
  const VHI = 8;
  const vcoord = (sNorm) => clamp(sNorm * VMEAN / VHI);
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  // ---------------------------------------------------------------- fields
  const F = {};
  function decode(name) {
    const d = window.FIELDS[name];
    const bin = atob(d.q); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const q = new Int16Array(bytes.buffer); const M = d.nx * d.rows;
    const u = new Float32Array(M), v = new Float32Array(M), p = new Float32Array(M);
    for (let n = 0; n < M; n++) { u[n] = q[n] / d.sUV; v[n] = q[M + n] / d.sUV; p[n] = q[2 * M + n] / d.sP; }
    const mb = atob(d.mask); const mask = new Uint8Array(M); for (let i = 0; i < M; i++) mask[i] = mb.charCodeAt(i);
    // light 3x3 (1-2-1) smoothing of the time-averaged velocity inside the fluid (removes averaging noise)
    const nx = d.nx, su = new Float32Array(M), sv = new Float32Array(M);
    // 2 global passes + extra passes only in slow recirculation zones (time-average noise lives there)
    const slow = new Uint8Array(M);
    for (let n = 0; n < M; n++) slow[n] = Math.hypot(u[n], v[n]) < 0.12 ? 1 : 0;
    for (let pass = 0; pass < 8; pass++) {
      for (let j = 1; j < d.rows - 1; j++) for (let i = 1; i < nx - 1; i++) {
        const n = j * nx + i; if (!mask[n]) { su[n] = 0; sv[n] = 0; continue; }
        if (pass >= 2 && !slow[n]) { su[n] = u[n]; sv[n] = v[n]; continue; }
        let a = 0, b = 0, w = 0;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const k = (2 - Math.abs(di)) * (2 - Math.abs(dj)), m = n + dj * nx + di; a += k * u[m]; b += k * v[m]; w += k; }
        su[n] = a / w; sv[n] = b / w;
      }
      u.set(su); v.set(sv);
    }
    return { ...d, u, v, p, mask };
  }
  // sample at sim coords (mm). returns [u, v] normalised (mean inlet = 1)
  function sample(f, x, y, out) {
    const fi = x / f.dx + f.nx / 2 - 0.5, fj = y / f.dx + 0.5;
    const i0 = Math.floor(fi), j0 = Math.floor(fj);
    if (i0 < 0 || j0 < 0 || i0 + 1 >= f.nx || j0 + 1 >= f.rows) { out[0] = 0; out[1] = 0; return false; }
    const a = fi - i0, b = fj - j0, n = j0 * f.nx + i0, nx = f.nx;
    const w00 = (1 - a) * (1 - b), w10 = a * (1 - b), w01 = (1 - a) * b, w11 = a * b;
    out[0] = f.u[n] * w00 + f.u[n + 1] * w10 + f.u[n + nx] * w01 + f.u[n + nx + 1] * w11;
    out[1] = f.v[n] * w00 + f.v[n + 1] * w10 + f.v[n + nx] * w01 + f.v[n + nx + 1] * w11;
    return true;
  }
  function inside(f, x, y) {
    const i = Math.floor(x / f.dx + f.nx / 2), j = Math.floor(y / f.dx + 1);
    if (i < 0 || j < 0 || i >= f.nx || j >= f.rows) return false;
    return f.mask[j * f.nx + i] === 1;
  }
  function pressureAt(f, x, y) {
    const i = Math.floor(x / f.dx + f.nx / 2), j = Math.floor(y / f.dx + 1);
    return f.p[j * f.nx + i];
  }

  // ---------------------------------------------------------------- geometry helpers
  const APEX = 0.45, TAPER = 0.06, NOD = 0.32, NID = 0.196;
  const hw = (y) => (APEX + TAPER * y) / 2;
  const yMmTop = (YWL - YTOP) / S + 0.12;
  const toX = (cx, xmm) => cx + xmm * S * KX;
  const toY = (ymm) => YWL - ymm * S;
  const toMmX = (cx, px) => (px - cx) / (S * KX);
  const toMmY = (py) => (YWL - py) / S;

  function canalPath(cx, ytop = yMmTop) {
    const p = new Path2D(); const FIL = 0.07;
    p.moveTo(toX(cx, -hw(ytop)), toY(ytop));
    p.lineTo(toX(cx, -hw(FIL)), toY(FIL));
    // fillet (elliptical in display space because of KX)
    p.ellipse(toX(cx, -hw(0) + FIL), toY(FIL), FIL * S * KX, FIL * S, 0, Math.PI, Math.PI / 2, true);
    p.lineTo(toX(cx, hw(0) - FIL), toY(0));
    p.ellipse(toX(cx, hw(0) - FIL), toY(FIL), FIL * S * KX, FIL * S, 0, Math.PI / 2, 0, true);
    p.lineTo(toX(cx, hw(ytop)), toY(ytop));
    return p;
  }
  function canalFill(cx) { const p = canalPath(cx); p.closePath(); return p; }

  // ---------------------------------------------------------------- streamlines (Jobard–Lefer, display space)
  function buildStreams(f, cx, opts = {}) {
    const DSEP = opts.dsep || 12, DTEST = DSEP * 0.45, STEP = 1.6;
    const yMin = YTOP - 30, yMax = YWL + 2;
    const cell = DSEP, gw = Math.ceil(W / cell);
    const grid = new Map();
    const tmp = [0, 0];
    const velD = (px, py, out) => {
      const xm = toMmX(cx, px), ym = toMmY(py);
      if (!inside(f, xm, ym)) return false;
      sample(f, xm, ym, tmp);
      out[0] = tmp[0] * KX; out[1] = -tmp[1]; out[2] = Math.hypot(tmp[0], tmp[1]);
      return true;
    };
    const gkey = (x, y) => (Math.floor(y / cell) * gw + Math.floor(x / cell));
    function near(x, y, d, self) {
      const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (let yy = gy - 1; yy <= gy + 1; yy++) for (let xx = gx - 1; xx <= gx + 1; xx++) {
        const arr = grid.get(yy * gw + xx); if (!arr) continue;
        for (let k = 0; k < arr.length; k += 3) {
          if (arr[k + 2] === self) continue;
          const dx = arr[k] - x, dy = arr[k + 1] - y; if (dx * dx + dy * dy < d * d) return true;
        }
      }
      return false;
    }
    function addToGrid(pts, id) { for (let i = 0; i < pts.length; i += 2) { const k = gkey(pts[i], pts[i + 1]); let a = grid.get(k); if (!a) grid.set(k, (a = [])); a.push(pts[i], pts[i + 1], id); } }
    const v1 = [0, 0, 0], v2 = [0, 0, 0];
    function integrate(x, y, dir, id, maxN) {
      const pts = [], sp = [];
      let len = 0;
      for (let n = 0; n < maxN; n++) {
        if (!velD(x, y, v1) || v1[2] < 1e-5) break;
        let m = Math.hypot(v1[0], v1[1]); const hx = x + dir * v1[0] / m * STEP * 0.5, hy = y + dir * v1[1] / m * STEP * 0.5;
        if (!velD(hx, hy, v2)) break; m = Math.hypot(v2[0], v2[1]); if (m < 1e-9) break;
        const nx = x + dir * v2[0] / m * STEP, ny = y + dir * v2[1] / m * STEP;
        if (ny < yMin || ny > yMax) { pts.push(nx, ny); sp.push(v2[2]); break; }
        if (near(nx, ny, DTEST, id)) break;
        // self-approach (loop) detection against own earlier points
        if (len > 4 * DSEP) {
          let hit = false;
          for (let k = 0; k < pts.length - 2 * Math.ceil(3 * DSEP / STEP); k += 2) { const dx = pts[k] - nx, dy = pts[k + 1] - ny; if (dx * dx + dy * dy < DTEST * DTEST) { hit = true; break; } }
          if (hit) { pts.push(nx, ny); sp.push(v2[2]); return { pts, sp, closed: true }; }
        }
        x = nx; y = ny; len += STEP; pts.push(x, y); sp.push(v2[2]);
      }
      return { pts, sp, closed: false };
    }
    const lines = [];
    function trace(sx, sy) {
      if (!velD(sx, sy, v1) || near(sx, sy, DSEP * 0.9, -1)) return null;
      const id = lines.length;
      const fw = integrate(sx, sy, +1, id, 2500);
      let pts, sp, closed = fw.closed;
      if (closed) { pts = [sx, sy, ...fw.pts]; sp = [v1[2], ...fw.sp]; }
      else {
        const bw = integrate(sx, sy, -1, id, 2500);
        pts = []; sp = [];
        for (let k = bw.pts.length - 2; k >= 0; k -= 2) { pts.push(bw.pts[k], bw.pts[k + 1]); sp.push(bw.sp[k / 2]); }
        pts.push(sx, sy); sp.push(v1[2]);
        for (let k = 0; k < fw.pts.length; k++) pts.push(fw.pts[k]);
        sp.push(...fw.sp);
        closed = bw.closed;
      }
      if (pts.length < 2 * (opts.minPts || 14)) return null;
      // cumulative length & time
      const n = pts.length / 2, L = new Float32Array(n), T = new Float32Array(n);
      for (let i = 1; i < n; i++) {
        const dx = pts[2 * i] - pts[2 * i - 2], dy = pts[2 * i + 1] - pts[2 * i - 1]; const d = Math.hypot(dx, dy);
        L[i] = L[i - 1] + d;
        const s = Math.max(1e-4, 0.5 * (sp[i] + sp[i - 1]));
        T[i] = T[i - 1] + d / (s * VREF);
      }
      const line = { id, pts: Float32Array.from(pts), sp: Float32Array.from(sp), L, T, n, closed, len: L[n - 1], dur: T[n - 1] };
      lines.push(line); addToGrid(pts, id);
      return line;
    }
    // seeds: inlet first (fresh irrigant), then grid-filling queue
    const queue = [];
    const lumenY = YTOP - 26;
    for (let k = 0; k < 7; k++) { const xm = (k / 6 - 0.5) * NID * 0.82; queue.push([toX(cx, xm), lumenY]); }
    let qi = 0;
    const pushSeeds = (ln) => {
      for (let i = 4; i < ln.n - 4; i += 5) {
        const x = ln.pts[2 * i], y = ln.pts[2 * i + 1];
        const dx = ln.pts[2 * i + 2] - ln.pts[2 * i - 2], dy = ln.pts[2 * i + 3] - ln.pts[2 * i - 1]; const m = Math.hypot(dx, dy) || 1;
        queue.push([x - dy / m * DSEP, y + dx / m * DSEP], [x + dy / m * DSEP, y - dx / m * DSEP]);
      }
    };
    while (qi < queue.length) { const [sx, sy] = queue[qi++]; const ln = trace(sx, sy); if (ln) pushSeeds(ln); }
    // fill remaining holes with a coarse seed grid
    for (let pass = 0; pass < 2; pass++) {
      for (let py = YTOP; py < YWL; py += DSEP * 0.8) for (let px = cx - 180; px < cx + 180; px += DSEP * 0.8) {
        queue.push([px + (hash(px | 0, py | 0, pass) - 0.5) * 3, py]);
      }
      while (qi < queue.length) { const [sx, sy] = queue[qi++]; const ln = trace(sx, sy); if (ln) pushSeeds(ln); }
    }
    return lines;
  }

  // ---------------------------------------------------------------- wall shear stress (relative) along canal walls
  function wallPolyline() {
    // canal wall (mm) as a continuous path: left wall top->down, left fillet, floor, right fillet, right wall up
    const FIL = 0.07, h0 = hw(0), pts = [];
    for (let y = yMmTop; y > FIL; y -= 0.012) pts.push([-hw(y), y]);
    for (let a = Math.PI; a <= 1.5 * Math.PI + 1e-6; a += Math.PI / 16) pts.push([-(h0 - FIL) + FIL * Math.cos(a), FIL + FIL * Math.sin(a)]);
    for (let x = -(h0 - FIL) + 0.01; x < h0 - FIL; x += 0.01) pts.push([x, 0]);
    for (let a = 1.5 * Math.PI; a <= 2 * Math.PI + 1e-6; a += Math.PI / 16) pts.push([(h0 - FIL) + FIL * Math.cos(a), FIL + FIL * Math.sin(a)]);
    for (let y = FIL + 0.012; y <= yMmTop; y += 0.012) pts.push([hw(y), y]);
    return pts;
  }
  // emphasis weight (1 = shown, 0.25 = desaturated): de-emphasise the 2-D artefacts the review flagged —
  // coronal walls (2-D return flow too fast) and, for the side-vented needle, the wall opposite the vent.
  function wssEmphasis(type, tip, xm, ym) {
    if (type === 'open') return ym <= tip + 0.2 ? 1 : Math.max(0.25, 1 - (ym - tip - 0.2) / 0.8 * 0.75);
    if (xm > 0.02) return 0.25;                       // wall opposite the vent
    const d = Math.abs(ym - (tip + 0.3));             // distance from the vent outlet
    return d <= 1.0 ? 1 : Math.max(0.25, 1 - (d - 1.0) / 0.6 * 0.75);
  }
  function buildWSS(f, cx, type, tip) {
    const wp = wallPolyline(), out = []; const tmp = [0, 0]; const d = 1.6 * f.dx; // probe distance into the fluid
    for (let i = 0; i < wp.length; i++) {
      const a = wp[Math.max(0, i - 1)], b = wp[Math.min(wp.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
      const nx = -ty, ny = tx; // inward normal
      sample(f, wp[i][0] + nx * d, wp[i][1] + ny * d, tmp);
      const ut = Math.abs(tmp[0] * tx + tmp[1] * ty);
      const X0 = toX(cx, wp[i][0]), Y0 = toY(wp[i][1]);
      const dnx = -nx * KX, dny = ny; const dm = Math.hypot(dnx, dny) || 1;
      out.push({ X: X0 + dnx / dm * 6, Y: Y0 + dny / dm * 6, w: ut / d, e: wssEmphasis(type, tip, wp[i][0], wp[i][1]) });
    }
    return out;
  }

  // ---------------------------------------------------------------- contour rasters (banded)
  const HEAT = [[0, '#120e1c'], [0.35, '#3a1240'], [0.6, '#8f1d3f'], [0.8, '#e0523f'], [0.93, '#ff9a55'], [1, '#ffe08a']];
  const PMAX = 3.0; // pressure colour range (units of rho*Um^2, relative to the outlet)
  function buildContour(f, cx, kind = 'vel') {
    const x0 = Math.floor(cx - 170), y0 = YTOP - 60, w = 340, h = YWL - y0 + 8;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); const img = g.createImageData(w, h); const tmp = [0, 0];
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const xm = toMmX(cx, x0 + px + 0.5), ym = toMmY(y0 + py + 0.5);
      if (!inside(f, xm, ym)) continue;
      let col;
      if (kind === 'vel') {
        sample(f, xm, ym, tmp);
        let v = vcoord(Math.hypot(tmp[0], tmp[1]));
        v = Math.floor(v * 16) / 16 + 1 / 32; // contour bands
        col = turbo(v);
      } else {
        let v = clamp(pressureAt(f, xm, ym) / PMAX);
        v = Math.floor(v * 14) / 14 + 1 / 28;
        col = Kit.colormap(HEAT, clamp(v));
      }
      const o = (py * w + px) * 4;
      img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return { c, x0, y0 };
  }

  // static streamline layer
  function buildStreamLayer(lines) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const ln of lines) drawLinePartial(g, ln, ln.len, 1);
    return c;
  }
  function drawLinePartial(g, ln, upto, alpha) {
    g.lineWidth = 1.7;
    let prev = null;
    for (let i = 1; i < ln.n; i++) {
      if (ln.L[i - 1] > upto) break;
      const col = turbo(0.1 + 0.9 * vcoord(ln.sp[i]));
      const key = (col[0] >> 3) + ',' + (col[1] >> 3) + ',' + (col[2] >> 3);
      if (key !== prev) { if (prev) g.stroke(); g.beginPath(); g.strokeStyle = rgb(lift(col), alpha); g.moveTo(ln.pts[2 * i - 2], ln.pts[2 * i - 1]); prev = key; }
      g.lineTo(ln.pts[2 * i], ln.pts[2 * i + 1]);
    }
    if (prev) g.stroke();
  }
  const lift = (c) => [lerp(c[0], 255, 0.16), lerp(c[1], 255, 0.16), lerp(c[2], 255, 0.16)];

  // particle position at time tau along a line
  function posAt(ln, tau, out) {
    const T = ln.T; let lo = 0, hi = ln.n - 1;
    if (tau <= 0) { out[0] = ln.pts[0]; out[1] = ln.pts[1]; return 0; }
    if (tau >= T[hi]) { out[0] = ln.pts[2 * hi]; out[1] = ln.pts[2 * hi + 1]; return hi; }
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= tau) lo = m; else hi = m; }
    const u = (tau - T[lo]) / (T[hi] - T[lo] || 1);
    out[0] = lerp(ln.pts[2 * lo], ln.pts[2 * hi], u); out[1] = lerp(ln.pts[2 * lo + 1], ln.pts[2 * hi + 1], u);
    return lo;
  }

  // ---------------------------------------------------------------- per-case assets
  function buildCase(name, cx, reachMm) {
    const f = F[name] || (F[name] = decode(name));
    const tip = f.tipY, type = f.type;
    const lines = buildStreams(f, cx, { dsep: 13 });
    const layer = buildStreamLayer(lines);
    const contour = buildContour(f, cx);
    const pres = buildContour(f, cx, 'p');
    const wss = buildWSS(f, cx, type, tip);
    // tracer particles = irrigant leaving the needle: only on streamlines that pass through the lumen
    // (released as a dye front), plus closed eddies inside the literature reach zone (fed by the jet).
    // Closed eddies beyond the reach (the side-vented dead zone) get no tracers.
    const lumenLines = [];
    for (const ln of lines) {
      ln.lumen = false;
      if (ln.closed) continue;
      for (let i = 0; i < ln.n; i += 3) {
        const xm = toMmX(cx, ln.pts[2 * i]), ym = toMmY(ln.pts[2 * i + 1]);
        if (Math.abs(xm) < NID / 2 && ym > tip + 0.1) { ln.lumen = true; break; }
      }
      if (ln.lumen) lumenLines.push(ln);
    }
    // arrival time of the dye front at each display row (earliest lumen-line time)
    const arr = new Float32Array(H).fill(1e9);
    for (const ln of lumenLines) for (let i = 0; i < ln.n; i++) { const y = Math.round(ln.pts[2 * i + 1]); if (y >= 0 && y < H && ln.T[i] < arr[y]) arr[y] = ln.T[i]; }
    for (let y = 1; y < H; y++) arr[y] = Math.min(arr[y], Math.max(arr[y - 1], 0)); // monotone fill downward
    const parts = [];
    for (const ln of lines) {
      if (ln.lumen) {
        const n = Math.max(1, Math.round(ln.len / 45));
        for (let k = 0; k < n; k++) parts.push({ ln, kind: 'front', delay: (k + 0.6 * hash(ln.id, k, 7)) * ln.dur / n });
      } else if (ln.closed) {
        let yTop = 1e9, yBot = -1e9;
        for (let i = 0; i < ln.n; i++) { yTop = Math.min(yTop, ln.pts[2 * i + 1]); yBot = Math.max(yBot, ln.pts[2 * i + 1]); }
        if (toMmY(yBot) < tip - reachMm) continue;     // beyond the reach: no tracers
        const n = Math.max(1, Math.round(ln.len / 45));
        const a0 = arr[Math.max(0, Math.min(H - 1, Math.round(yTop)))];
        for (let k = 0; k < n; k++) parts.push({ ln, kind: 'loop', off: (k + 0.6 * hash(ln.id, k, 9)) * ln.dur / n, delay: a0 < 1e8 ? a0 : 3 });
      }
    }
    // time for the central lumen line to reach its deepest point (used to time the dye front)
    let deep = -1, tDeep = 2;
    for (const ln of lumenLines) { let iMax = 0; for (let i = 0; i < ln.n; i++) if (ln.pts[2 * i + 1] > ln.pts[2 * iMax + 1]) iMax = i; if (ln.pts[2 * iMax + 1] > deep) { deep = ln.pts[2 * iMax + 1]; tDeep = ln.T[iMax]; } }
    return { name, f, cx, lines, layer, contour, pres, wss, parts, tip, type, apicalP: f.apicalP, tDeep, nLumen: lumenLines.length };
  }

  // ---------------------------------------------------------------- drawing primitives
  function txt(s, x, y, font, color, align = 'left', alpha = 1, base = 'alphabetic', spacing = 0) {
    if (alpha <= 0.001) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
    if (spacing) { try { ctx.letterSpacing = spacing + 'px'; } catch (e) {} }
    ctx.fillText(s, x, y); ctx.restore();
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  // text on a dark pill (labels that sit on top of the coloured field)
  function pill(s, x, y, font, color, align = 'left', alpha = 1) {
    if (alpha <= 0.001) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font;
    const w = ctx.measureText(s).width, h = parseFloat(font.match(/(\d+)px/)[1]);
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    roundRect(x0 - 6, y - h / 2 - 5, w + 12, h + 10, 6); ctx.fillStyle = 'rgba(12,13,16,0.75)'; ctx.fill();
    ctx.restore();
    txt(s, x, y + 1, font, color, align, alpha, 'middle');
  }
  function pulse(x, y, t, t0, a, color = '#fff', r0 = 14, r1 = 28) {
    if (a <= 0.003) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let k = 0; k < 2; k++) {
      const ph = (((t - t0) / 1.2 + k * 0.5) % 1 + 1) % 1;
      ctx.globalAlpha = a * 0.6 * (1 - ph);
      ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, ph), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.bg1); g.addColorStop(0.35, C.bg0); g.addColorStop(0.75, C.bg0); g.addColorStop(1, C.bg1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const r = ctx.createRadialGradient(W / 2, 960, 200, W / 2, 960, 1100); r.addColorStop(0, 'rgba(255,255,255,0.035)'); r.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }

  function drawChrome(t) {
    // decorative software chrome (outside the safe area)
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(0, 150, W, 52);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, 202, W, 1);
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.5; roundRect(40 + i * 40, 163, 26, 26, 5); ctx.stroke(); }
    txt('needle_irrigation_2D.lbm', 300, 183, `400 22px ${MONO}`, 'rgba(255,255,255,0.38)', 'left', 1, 'middle');
    // solver status (real run length from sim/meta: 115 000 steps, time-averaged; no invented residuals)
    const col = 'rgba(160,220,255,0.6)';
    const steps = `${(window.FIELDS.open3.steps / 1000).toFixed(0)} 000 steps · time-averaged`;
    const sA = env(t, 0.0, 1.15, 0.05, 0.1), sB = env(t, 1.1, 3.0, 0.15, 0.4);
    const sC = env(t, T.P5 + 0.1, T.P5 + 1.15, 0.2, 0.1), sD = env(t, T.P5 + 1.1, T.END - 0.2, 0.2, 0.2);
    txt('solving…', 1040, 183, `400 22px ${MONO}`, col, 'right', sA, 'middle');
    txt(steps, 1040, 183, `400 22px ${MONO}`, col, 'right', sB, 'middle');
    txt('re-meshing… tip 1.0 mm', 1040, 183, `400 22px ${MONO}`, col, 'right', sC, 'middle');
    txt('reference: 3-D CFD', 1040, 183, `400 22px ${MONO}`, col, 'right', sD, 'middle');
    const bar = (p, a) => { if (a > 0.003) { ctx.globalAlpha = a; ctx.fillStyle = 'rgba(98,216,255,0.55)'; ctx.fillRect(0, 200, W * p, 3); ctx.globalAlpha = 1; } };
    bar(seg(t, 0.1, 1.1, ease.inOut), sA);
    bar(seg(t, T.P5 + 0.15, T.P5 + 1.1, ease.inOut), sC);
    // bottom status bar
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(0, 1640, W, 46);
    txt(`LBM D2Q9 · TRT + Smagorinsky · Re ${window.FIELDS.open3.re} (toy) · time-averaged`, 40, 1663, `400 21px ${MONO}`, 'rgba(255,255,255,0.3)', 'left', 1, 'middle');
    // orientation triad (decor)
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(990, 1676); ctx.lineTo(1030, 1676); ctx.moveTo(990, 1676); ctx.lineTo(990, 1636); ctx.stroke();
    txt('x', 1038, 1676, `400 18px ${MONO}`, 'rgba(255,255,255,0.4)', 'left', 1, 'middle'); txt('y', 990, 1626, `400 18px ${MONO}`, 'rgba(255,255,255,0.4)', 'center', 1, 'middle');
    ctx.restore();
  }

  function drawMesh(cx, a, reveal) {
    if (a <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.clip(canalFill(cx));
    const yr = lerp(YTOP - 40, YWL + 5, reveal);
    ctx.beginPath(); ctx.rect(0, YTOP - 60, W, yr - (YTOP - 60)); ctx.clip();
    ctx.strokeStyle = 'rgba(200,225,255,0.55)'; ctx.lineWidth = 1;
    const NI = 14;
    ctx.beginPath();
    for (let i = 0; i <= NI; i++) {
      let s = i / NI; s = 0.5 - 0.5 * Math.cos(Math.PI * s); // cluster near walls
      for (let y = 0; y <= yMmTop; y += 0.05) { const x = (s - 0.5) * 2 * hw(y); const X = toX(cx, x), Y = toY(y); if (y === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    }
    for (let y = 0; y <= yMmTop; y += 0.1) { ctx.moveTo(toX(cx, -hw(y)), toY(y)); ctx.lineTo(toX(cx, hw(y)), toY(y)); }
    ctx.stroke();
    ctx.restore();
  }

  const CAP = 0.05, V0 = 0.05, V1 = 0.55; // closed tip thickness, side vent from tip+V0 to tip+V1 (mm)
  function needleShape(tipY, type) {
    const R = NOD / 2, r = NID / 2, top = yMmTop + 0.3, rects = [];
    if (type === 'open') { rects.push([-R, tipY, -r, top], [r, tipY, R, top]); }
    else {
      rects.push([r, tipY, R, top]);            // right wall
      rects.push([-R, tipY + V1, -r, top]);     // left wall above vent
      rects.push([-R, tipY, -r, tipY + V0]);    // left wall below vent
      rects.push([-r, tipY, r, tipY + CAP]);    // closed tip
    }
    return rects;
  }
  function drawNeedle(cx, tipY, type, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const rects = needleShape(tipY, type);
    const fill = ctx.createLinearGradient(toX(cx, -NOD / 2), 0, toX(cx, NOD / 2), 0);
    fill.addColorStop(0, 'rgba(150,158,170,0.85)'); fill.addColorStop(0.5, 'rgba(205,212,222,0.85)'); fill.addColorStop(1, 'rgba(120,128,140,0.85)');
    ctx.fillStyle = fill;
    for (const [x0, y0, x1, y1] of rects) ctx.fillRect(toX(cx, x0), toY(y1), (x1 - x0) * S * KX, (y1 - y0) * S);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.6;
    for (const [x0, y0, x1, y1] of rects) ctx.strokeRect(toX(cx, x0), toY(y1), (x1 - x0) * S * KX, (y1 - y0) * S);
    ctx.restore();
  }

  function drawCanalOutline(cx, a) {
    ctx.save(); ctx.globalAlpha *= a;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.8; ctx.stroke(canalPath(cx));
    ctx.restore();
  }

  const GREY = [118, 122, 130];
  function drawWSS(cs, a, gmax) {
    if (a <= 0.003) return;
    ctx.save(); ctx.lineWidth = 9; ctx.lineCap = 'round';
    const P = cs.wss, base = ctx.globalAlpha;
    for (let i = 1; i < P.length; i++) {
      const v = Math.pow(clamp(0.5 * (P[i].w + P[i - 1].w) / gmax), 0.55), e = 0.5 * (P[i].e + P[i - 1].e);
      ctx.globalAlpha = base * a * (0.35 + 0.65 * e);
      ctx.strokeStyle = rgb(Kit.mix(GREY, magma(0.2 + 0.8 * v), e), 1);
      ctx.beginPath(); ctx.moveTo(P[i - 1].X, P[i - 1].Y); ctx.lineTo(P[i].X, P[i].Y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawFlow(cs, t, aContour, aLines, aParts, grow, pmix = 0) {
    ctx.save(); ctx.clip(canalFill(cs.cx));
    const base = ctx.globalAlpha;
    const yCut = toY(cs.tip) - 10;   // pressure is shown only apical to the needle tip
    if (aContour > 0.003) { ctx.globalAlpha = base * aContour * 0.55 * (1 - 0.45 * pmix); ctx.drawImage(cs.contour.c, cs.contour.x0, cs.contour.y0); }
    if (aContour > 0.003 && pmix > 0.003) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, yCut, W, H - yCut); ctx.clip();
      ctx.globalAlpha = base * aContour * 0.92 * pmix; ctx.drawImage(cs.pres.c, cs.pres.x0, cs.pres.y0);
      ctx.restore();
      ctx.globalAlpha = base * 0.6 * pmix; ctx.fillStyle = 'rgb(34,36,41)'; ctx.fillRect(0, 0, W, yCut); // grey wash coronally
    }
    aLines *= 1 - 0.75 * pmix; aParts *= 1 - 0.4 * pmix;
    if (aLines > 0.003) {
      ctx.globalAlpha = base * aLines;
      if (grow >= 1) ctx.drawImage(cs.layer, 0, 0);
      else { ctx.lineCap = 'round'; for (const ln of cs.lines) { const local = clamp(grow * 1.35 - (ln.id % 9) * 0.04); if (local > 0) drawLinePartial(ctx, ln, ln.len * ease.out(local), 1); } }
    }
    if (aParts > 0.003) drawParticles(cs, t, aParts * base);
    if (pmix > 0.003) drawLumenMask(cs, base * pmix);
    ctx.restore();
  }

  // pressure view: needle lumens are not coloured (their pressure is set by the needle's own resistance,
  // which the truncated toy domain does not model) — neutral hatched grey instead
  function drawLumenMask(cs, a) {
    const r = NID / 2, yb = toY(cs.type === 'open' ? cs.tip : cs.tip + CAP);
    const x0 = toX(cs.cx, -r), x1 = toX(cs.cx, r), y0 = YTOP - 60;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgb(58,62,70)'; ctx.fillRect(x0, y0, x1 - x0, yb - y0);
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, yb - y0); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let y = y0 - 80; y < yb + 80; y += 14) { ctx.moveTo(x0, y + 60); ctx.lineTo(x1, y); }
    ctx.stroke(); ctx.restore();
  }

  const P = [0, 0], Q = [0, 0];
  let T0 = 1.0; // dye-front release time (set in setup)
  function drawParticles(cs, t, a) {
    ctx.lineCap = 'round';
    for (const pt of cs.parts) {
      const ln = pt.ln; const D = ln.dur; if (!(D > 0)) continue;
      let tau, fa;
      if (pt.kind === 'front') {
        tau = t - T0 - pt.delay; if (tau < 0) continue;
        tau %= D;
        fa = Math.min(seg(tau, 0, Math.min(0.4, D * 0.1)), 1 - seg(tau, D - Math.min(0.4, D * 0.1), D));
      } else {
        tau = ((t + pt.off) % D + D) % D;
        fa = seg(t, T0 + pt.delay, T0 + pt.delay + 0.8);
      }
      if (fa <= 0.01) continue;
      const i = posAt(ln, tau, P); posAt(ln, Math.max(0, tau - 0.11), Q);
      const vc = vcoord(ln.sp[i]); const col = lift(turbo(0.1 + 0.9 * vc));
      const sk = clamp(vc * 6); // slow particles: smaller and dimmer
      ctx.globalAlpha = a * fa * 0.85; ctx.strokeStyle = rgb(col, 1); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(Q[0], Q[1]); ctx.lineTo(P[0], P[1]); ctx.stroke();
      ctx.globalAlpha = a * fa * (0.45 + 0.55 * sk); ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(P[0], P[1], 1.8 + 1.2 * sk, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // colour bars (vertical, ParaView-like horizontal titles above): speed or pressure (left), wall shear (right)
  const CB = { y0: 648, y1: 1058, bw: 18, xl: 66, xr: 1014 - 18 };
  function barTitle(lines, x, align, a) {
    // lines: [[text, size, color]]; the last line sits at y = 618
    let y = 618;
    for (let i = lines.length - 1; i >= 0; i--) { const [s, sz, col] = lines[i]; txt(s, x, y, `500 ${sz}px ${FONT}`, col, align, a, 'middle'); y -= 32; }
  }
  function barBody(x, fn, a) {
    const { y0, y1, bw } = CB;
    ctx.save(); ctx.globalAlpha *= a;
    for (let y = y0; y < y1; y++) { const v = 1 - (y - y0) / (y1 - y0); ctx.fillStyle = rgb(fn(v)); ctx.fillRect(x, y, bw, 1.2); }
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y0 + 0.5, bw, y1 - y0);
    ctx.restore();
  }
  // 'high' / 'low' as end ticks beside the bar (left bar: labels to its right; right bar: to its left)
  function barEnds(xBar, side, a) {
    const { y0, y1, bw } = CB;
    const xt = side > 0 ? xBar + bw : xBar, xl = side > 0 ? xt + 10 : xt - 10, al = side > 0 ? 'left' : 'right';
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#fff';
    ctx.fillRect(side > 0 ? xt : xt - 6, y0 + 10, 6, 1.5); ctx.fillRect(side > 0 ? xt : xt - 6, y1 - 10, 6, 1.5); ctx.restore();
    txt('high', xl, y0 + 11, `500 30px ${FONT}`, C.text, al, a, 'middle');
    txt('low', xl, y1 - 9, `500 30px ${FONT}`, C.text, al, a, 'middle');
  }
  function drawColorbars(aV, aW, aP) {
    const { xl, xr, bw } = CB;
    if (aV > 0.003) {
      barBody(xl, (v) => turbo(Math.min(1, Math.floor(v * 16) / 16 + 1 / 32)), aV);
      barTitle([['speed', 30, C.text], ['relative', 26, C.dim]], xl, 'left', aV); barEnds(xl, 1, aV);
    }
    if (aP > 0.003) {
      barBody(xl, (v) => Kit.colormap(HEAT, Math.min(1, Math.floor(v * 14) / 14 + 1 / 28)), aP);
      barTitle([['pressure', 30, C.text], ['relative', 26, C.dim]], xl, 'left', aP); barEnds(xl, 1, aP);
    }
    if (aW > 0.003) {
      barBody(xr, (v) => magma(0.2 + 0.8 * v), aW);
      barTitle([['wall', 30, C.text], ['shear', 30, C.text], ['relative', 26, C.dim]], xr + bw, 'right', aW); barEnds(xr, -1, aW);
    }
  }

  function callout(ax, ay, lx, ly, label, a, color = C.text, align = 'left') {
    if (a <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.font = `500 30px ${FONT}`; const tw = ctx.measureText(label).width;
    const bx = align === 'left' ? lx : lx - tw - 28, by = ly - 25, bw = tw + 28, bh = 50;
    const ex = align === 'left' ? bx : bx + bw;
    const k = ease.out(clamp(a * 1.4));
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, ex, k), lerp(ay, ly, k)); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.stroke();
    roundRect(bx, by, bw, bh, 8); ctx.fillStyle = 'rgba(14,15,18,0.88)'; ctx.fill(); ctx.strokeStyle = color; ctx.globalAlpha *= 0.8; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha /= 0.8;
    txt(label, bx + 14, ly + 1, `500 30px ${FONT}`, color, 'left', 1, 'middle');
    ctx.restore();
  }

  // ---------------------------------------------------------------- schematic: side-vented 1 mm short (3-D CFD reference)
  function flowArrow(pts, t, a, head = true) {
    // pts in display px; dashed, marching (schematic annotation layer, not toy-model output)
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = 'rgba(205,240,255,0.92)'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 36;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
    ctx.setLineDash([]);
    if (head) {
      const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2]; const ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.fillStyle = 'rgba(205,240,255,0.95)'; ctx.beginPath();
      ctx.moveTo(x1 + Math.cos(ang) * 8, y1 + Math.sin(ang) * 8);
      ctx.lineTo(x1 + Math.cos(ang + 2.5) * 13, y1 + Math.sin(ang + 2.5) * 13);
      ctx.lineTo(x1 + Math.cos(ang - 2.5) * 13, y1 + Math.sin(ang - 2.5) * 13); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function drawSchematicZone(tip, a) {
    if (a <= 0.003) return;
    const cx = CXB;
    ctx.save(); ctx.globalAlpha *= a; ctx.clip(canalFill(cx));
    const yA = toY(tip + V1 + 0.25), yB = YWL;
    const g = ctx.createLinearGradient(0, yA, 0, yB);
    g.addColorStop(0, 'rgba(98,216,255,0)'); g.addColorStop(0.25, 'rgba(98,216,255,0.30)'); g.addColorStop(1, 'rgba(98,216,255,0.20)');
    ctx.fillStyle = g; ctx.fillRect(cx - 200, yA, 400, yB - yA + 12);
    ctx.restore();
  }
  function drawSchematicArrows(tip, a, t) {
    if (a <= 0.003) return;
    const cx = CXB, P2 = (x, y) => [toX(cx, x), toY(y)];
    const gapX = (y, s) => s * (NOD / 2 + hw(y)) / 2;
    flowArrow([P2(0, tip + 2.5), P2(0, tip + 0.75)], t, a);                                          // down the lumen
    flowArrow([P2(-0.02, tip + 0.32), P2(-hw(tip + 0.3) + 0.045, tip + 0.3)], t, a);                    // jet out of the vent
    const up = (s, ya, yb) => { const p = []; for (let y = ya; y <= yb + 1e-6; y += 0.1) p.push(P2(gapX(y, s), y)); return p; };
    flowArrow(up(-1, tip + 0.75, tip + 2.6), t, a * 0.8);                                            // return, vent side
    flowArrow(up(1, tip + 0.15, tip + 2.6), t, a * 0.8);                                             // return, far side
  }

  // ---------------------------------------------------------------- state
  let A3, B3, WMAX = 1;
  async function setup() {
    A3 = buildCase('open3', CXA, 3.0);   // open-ended reach ≈ almost to WL (Int Endod J 2010)
    B3 = buildCase('side3', CXB, 1.25);  // side-vented reach 1–1.5 mm (Int Endod J 2009)
    // global WSS normaliser (98.5th percentile across both cases, robust)
    const all = [...A3.wss, ...B3.wss].map((p) => p.w).sort((a, b) => a - b);
    WMAX = all[Math.floor(all.length * 0.985)] || 1;
    // release the dye front so the open-ended tracers reach their deepest point as the reach arrow lands
    T0 = clamp(T.P1 + 1.8 - A3.tDeep, 0.2, 1.4);
    window.__REEL15 = { T0, tDeepA: A3.tDeep, tDeepB: B3.tDeep, lumenA: A3.nLumen, lumenB: B3.nLumen, partsA: A3.parts.length, partsB: B3.parts.length };
  }

  // ---------------------------------------------------------------- timeline
  const T = { P1: 3.0, P2: 7.4, P4: 12.4, P5: 15.6, END: 22.5 };
  const XO0 = T.END - 0.4, XO1 = T.END - 0.2;  // loop: overlays out
  const CAPS = [
    { a: 0, b: T.P1, lines: ['Where does the', 'irrigant really go?'], size: 66, hook: true },
    { a: T.P1, b: T.P2, lines: ['Open-ended:', 'the jet drives toward WL'], size: 60 },
    { a: T.P2, b: T.P4, lines: ['Side-vented:', 'jet hits the wall, then vortices'], size: 58 },
    { a: T.P4, b: T.P5, lines: ['Open-ended:', 'higher apical pressure'], size: 60 },
    { a: T.P5, b: T.END, lines: ['Tip design guides needle depth'], size: 56, last: true },
  ];

  function drawCaption(t) {
    for (const c of CAPS) {
      let a;
      if (c.hook) a = Math.max(1 - seg(t, c.b - 0.3, c.b), seg(t, T.END - 0.2, T.END));
      else if (c.last) a = Math.min(seg(t, c.a, c.a + 0.3), 1 - seg(t, XO0, XO1));
      else a = env(t, c.a, c.b, 0.3, 0.3);
      if (a <= 0.003) continue;
      const k = ease.out(seg(t, c.a, c.a + 0.45));
      const dy = c.hook ? 0 : (1 - k) * 14;
      const lh = c.size * 1.14;
      const y0 = c.last ? 370 + dy : 374 - (c.lines.length - 1) * lh / 2 + dy + (c.lines.length === 1 ? 10 : 0);
      c.lines.forEach((s, i) => txt(s, W / 2, y0 + i * lh, `600 ${c.size}px ${FONT}`, C.text, 'center', a));
    }
  }

  function render(t) {
    t = clamp(t, 0, T.END);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    drawBackground();
    drawChrome(t);

    // ---- loop back to frame 0 (last 0.4 s): flows drop to the faint frame-0 state, needle B slides back
    const endF = seg(t, T.END - 0.4, T.END, ease.inOut);
    const outO = 1 - seg(t, XO0, XO1);

    // ---- focus / dimming per phase
    const focusA = (1 - 0.68 * env(t, T.P2 - 0.1, T.P4 + 0.1, 0.45, 0.45)) * (1 - 0.45 * env(t, T.P5, T.P5 + 2.2, 0.3, 0.4));
    const focusB = 1 - 0.68 * env(t, T.P1 - 0.1, T.P2 + 0.1, 0.45, 0.45);

    // ---- intro build (coloured field inside the first second; frame 0 = faint field = loop target)
    const meshA = Math.min(seg(t, 0.0, 0.12), 1 - seg(t, 1.0, 1.5)) * 0.9, meshR = seg(t, 0.0, 0.6, ease.inOut);
    const aContour = lerp(0.2 + 0.8 * seg(t, 0.4, 1.1, ease.inOut), 0.2, endF);
    const grow = seg(t, 0.5, 1.8, ease.inOut);
    const aLines = seg(t, 0.5, 0.8) * (1 - endF);
    const aParts = seg(t, 1.4, 2.0) * (1 - endF);
    const aWss = seg(t, 1.4, 2.0, ease.inOut) * (1 - endF);

    // ---- B needle move in P5 (3 -> 1 mm), re-mesh, then the 3-D CFD schematic (no toy flow at 1 mm)
    const move = seg(t, T.P5 + 0.2, T.P5 + 1.1, ease.inOut);
    const swapOut = 1 - seg(t, T.P5 + 0.1, T.P5 + 0.6, ease.inOut);
    const sch = seg(t, T.P5 + 1.1, T.P5 + 1.6, ease.inOut) * (1 - endF);
    const remesh = Math.max(Math.min(seg(t, T.P5 + 0.15, T.P5 + 0.4), 1 - seg(t, T.P5 + 1.1, T.P5 + 1.6)) * 0.8, 0.28 * sch);
    const tipB = lerp(lerp(3, 1, move), 3, endF);

    // ---- panels are drawn into an offscreen layer, then faded at the top of the viewport
    ctx = pctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    for (const cx of [CXA, CXB]) { ctx.fillStyle = C.canal; ctx.fill(canalFill(cx)); }

    // flow layers
    const pmix = env(t, T.P4 + 0.05, T.P5 + 0.25, 0.6, 0.5);
    ctx.save(); ctx.globalAlpha = focusA;
    drawFlow(A3, t, aContour, aLines, aParts, grow, pmix);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = focusB;
    const bContour = t < T.P5 ? aContour : Math.max(aContour * swapOut, 0.2 * endF);
    if (bContour > 0.003) drawFlow(B3, t, bContour, aLines * swapOut, aParts * swapOut, grow, pmix);
    drawSchematicZone(tipB, sch);
    ctx.restore();

    // mesh (intro) + re-mesh of B in P5 (stays as a faint backdrop under the schematic)
    drawMesh(CXA, meshA, meshR);
    drawMesh(CXB, meshA, meshR);
    if (remesh > 0.003) drawMesh(CXB, remesh, seg(t, T.P5 + 0.15, T.P5 + 1.1, ease.inOut));

    // WSS bands + outlines (WSS dimmed to 50 % in the takeaway so the reach/depth labels lead)
    const wssP5 = 1 - 0.5 * seg(t, T.P5, T.P5 + 0.6);
    ctx.save(); ctx.globalAlpha = focusA; drawWSS(A3, aWss * wssP5, WMAX); drawCanalOutline(CXA, 1); ctx.restore();
    ctx.save(); ctx.globalAlpha = focusB; drawWSS(B3, aWss * swapOut, WMAX); drawCanalOutline(CXB, 1); ctx.restore();

    // needles
    ctx.save(); ctx.globalAlpha = focusA; drawNeedle(CXA, 3, 'open', 1); ctx.restore();
    ctx.save(); ctx.globalAlpha = focusB; drawNeedle(CXB, tipB, 'side', 1); drawSchematicArrows(tipB, sch, t); ctx.restore();

    ctx.globalCompositeOperation = 'destination-in';
    const fm = ctx.createLinearGradient(0, YTOP - 36, 0, YTOP + 46); fm.addColorStop(0, 'rgba(0,0,0,0)'); fm.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fm; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx = mainCtx; ctx.globalAlpha = 1; ctx.drawImage(panelC, 0, 0);

    // WL line
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(120, YWL + 0.5); ctx.lineTo(960, YWL + 0.5); ctx.stroke(); ctx.restore();
    txt('WL', W / 2, YWL - 16, `600 30px ${MONO}`, C.dim, 'center');

    // colour bars: velocity <-> pressure swap runs in sequence (no overlapping titles)
    const aVel = (t < T.P4 + 0.3 ? seg(t, 0.4, 1.0) * (1 - seg(t, T.P4 + 0.05, T.P4 + 0.3)) : seg(t, T.P5 + 0.2, T.P5 + 0.5)) * outO;
    const aPres = Math.min(seg(t, T.P4 + 0.3, T.P4 + 0.6), 1 - seg(t, T.P5 - 0.1, T.P5 + 0.15));
    drawColorbars(aVel, seg(t, 1.4, 2.0, ease.out) * outO, aPres);

    // panel labels
    txt('OPEN-ENDED', CXA, 470, `600 36px ${FONT}`, C.text, 'center', 0.55 + 0.45 * focusA, 'alphabetic', 3);
    txt('SIDE-VENTED', CXB, 470, `600 36px ${FONT}`, C.text, 'center', 0.55 + 0.45 * focusB, 'alphabetic', 3);
    txt('tip 3.0 mm short', CXA, 512, `400 30px ${MONO}`, C.dim, 'center', 0.6 + 0.4 * focusA);
    txt(`tip ${tipB.toFixed(1)} mm short`, CXB, 512, `400 30px ${MONO}`, move > 0 && move < 1 ? C.cyan : C.dim, 'center', 0.6 + 0.4 * focusB);

    // header line (after the hook) + handle
    txt('30 G needles · 0.15 mL/s · canal 45/.06', 64, 270, `500 26px ${MONO}`, C.dim, 'left', seg(t, 3.0, 3.5) * outO);
    Kit.handle(ctx, 1016, 262, { align: 'right', color: '#c9d1db', alpha: 0.75, font: `500 26px ${FONT}` });

    drawCaption(t);
    drawPhaseOverlays(t, { focusA, focusB, tipB, sch, outO, pmix });
    drawFootnotes(t, outO);
  }

  function drawPhaseOverlays(t, s) {
    // legend for the encoding (intro -> early P2)
    const lg = env(t, 2.2, T.P2 + 1.9, 0.5, 0.4);
    if (lg > 0.003) {
      ctx.save(); ctx.globalAlpha = lg;
      const y = 1505, x0 = W / 2 - 300;
      const gr = ctx.createLinearGradient(x0, 0, x0 + 56, 0); [0.15, 0.5, 0.85].forEach((v, i) => gr.addColorStop(i / 2, rgb(turbo(v))));
      ctx.strokeStyle = gr; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.bezierCurveTo(x0 + 20, y - 14, x0 + 36, y + 14, x0 + 56, y); ctx.stroke();
      txt('streamline', x0 + 70, y, `400 30px ${FONT}`, C.dim, 'left', 1, 'middle');
      const x1 = x0 + 270;
      ctx.strokeStyle = rgb(turbo(0.7)); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + 28, y); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x1 + 30, y, 4, 0, Math.PI * 2); ctx.fill();
      txt('tracer (from needle)', x1 + 48, y, `400 30px ${FONT}`, C.dim, 'left', 1, 'middle');
      ctx.restore();
    }

    // ---- P1: open-ended reach (ruler lands as the dye front reaches the apex); stays, dimmed, through P2
    const kA = 0.55 + 0.45 * s.focusA;
    const rA = env(t, T.P1 + 0.9, T.P4, 0.4, 0.35) * kA;
    drawRuler(CXA, 3, { a: rA, t, ts: T.P1 + 0.9, reach: 3, arrow: true });
    txt('reach: almost to WL', CXA, 1452, `600 40px ${FONT}`, C.cyan, 'center', env(t, T.P1 + 1.3, T.P4, 0.35, 0.3) * kA);

    // ---- P2: side-vented — wall hit (shear peak), vortex, then reach 1–1.5 mm + dead zone
    const p2a = env(t, T.P2 + 0.4, T.P4, 0.4, 0.3);
    const hsX = toX(CXB, -hw(3.2)), hsY = toY(3.2);
    pulse(hsX, hsY, t, T.P2 + 0.4, p2a * seg(t, T.P2 + 0.6, T.P2 + 0.9), C.gold);
    callout(hsX, hsY, CXB - 127, toY(4.3), 'shear peak', p2a, C.gold, 'right');
    const p2b = env(t, T.P2 + 1.0, T.P4, 0.4, 0.3);
    callout(toX(CXB, -0.16), toY(2.55), CXB - 135, toY(2.75), 'vortex', p2b, C.text, 'right');
    const rB = env(t, T.P2 + 1.8, T.P4, 0.4, 0.35);
    drawRuler(CXB, 3, { a: rB, t, ts: T.P2 + 1.8, range: [1.0, 1.5], hatch: true });
    callout(CXB - 20, toY(0.75), CXB - 108, toY(0.95), 'little exchange', env(t, T.P2 + 2.8, T.P4, 0.4, 0.3), C.text, 'right');
    txt('reach ≈ 1–1.5 mm', CXB, 1452, `600 40px ${FONT}`, C.cyan, 'center', env(t, T.P2 + 2.2, T.P4, 0.35, 0.3));

    // ---- P4: apical pressure. Field re-coloured by pressure apical to the tips (see drawFlow) + probes + bars
    const pr = env(t, T.P4 + 0.2, T.P5, 0.5, 0.35);
    if (pr > 0.003) {
      const bw = 300, gk = ease.out(seg(t, T.P4 + 0.4, T.P4 + 1.2));
      for (const [cx, k] of [[CXA, 1], [CXB, P_RATIO_3D]]) {
        ctx.save(); ctx.globalAlpha = pr;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, YWL - 10, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 16, YWL - 10); ctx.lineTo(cx + 16, YWL - 10); ctx.moveTo(cx, YWL - 26); ctx.lineTo(cx, YWL + 6); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(cx - bw / 2, 1432, bw, 18, 9); ctx.fill();
        ctx.fillStyle = C.hot; roundRect(cx - bw / 2, 1432, Math.max(18, bw * k * gk), 18, 9); ctx.fill();
        ctx.restore();
        pulse(cx, YWL - 10, t, T.P4 + 0.4, pr * seg(t, T.P4 + 0.5, T.P4 + 0.8));
      }
      const ex = Math.min(seg(t, T.P4 + 0.4, T.P4 + 0.7), 1 - seg(t, T.P5 - 0.3, T.P5));
      txt('more extrusion ex vivo', CXA, 1490, `500 30px ${FONT}`, C.hot, 'center', ex);
      txt('lower', CXB, 1490, `500 30px ${FONT}`, C.dim, 'center', ex);
    }

    // ---- P5: takeaway. B at 1 mm = schematic of the 3-D CFD result, reach to WL
    const rB1 = s.sch * s.outO * env(t, T.P5 + 1.5, T.END + 1, 0.4, 0.1);
    drawRuler(CXB, s.tipB, { a: rB1, t, ts: T.P5 + 1.5, reach: s.tipB, arrow: true });
    callout(toX(CXB, -0.1), toY(0.45), CXB - 122, toY(0.78), 'reach: to WL', s.sch * s.outO * env(t, T.P5 + 1.9, T.END + 1, 0.4, 0.1), C.cyan, 'right');
    const tg = s.sch * s.outO * seg(t, T.P5 + 1.6, T.P5 + 2.0);
    txt('schematic of', CXB - 128, 880, `500 26px ${FONT}`, C.dim, 'right', tg);
    txt('3-D CFD result', CXB - 128, 912, `500 26px ${FONT}`, C.dim, 'right', tg);
    const o = s.outO;
    txt('in canals enlarged to ≥ size 30–35', W / 2, 418, `500 30px ${FONT}`, C.dim, 'center', seg(t, T.P5 + 0.5, T.P5 + 0.9) * o);
    txt('2–3 mm short of WL', CXA, 1452, `600 40px ${FONT}`, C.cyan, 'center', seg(t, T.P5 + 0.3, T.P5 + 0.7) * o);
    txt('1 mm short of WL', CXB, 1452, `600 40px ${FONT}`, C.cyan, 'center', seg(t, T.P5 + 1.4, T.P5 + 1.8) * o);
    txt('never let it bind · deeper = more apical pressure', W / 2, 1503, `500 32px ${FONT}`, C.text, 'center', seg(t, T.P5 + 1.7, T.P5 + 2.1) * o);
  }

  // measuring tape from the needle tip toward WL + cyan reach bar
  function drawRuler(cx, tipY, o) {
    const a = o.a; if (a <= 0.003) return;
    const t = o.t;
    ctx.save(); ctx.globalAlpha *= a;
    const k = ease.inOut(seg(t, o.ts, o.ts + 0.9));
    const yTip = toY(tipY), yEnd = lerp(yTip, toY(0), k);
    const x = cx;
    if (o.range && o.hatch) { // hatch beyond the reach: little exchange
      const ha = seg(t, o.ts + 0.8, o.ts + 1.3);
      if (ha > 0) {
        ctx.save(); ctx.globalAlpha *= ha; ctx.clip(canalFill(cx));
        const yh = toY(tipY - o.range[1]);
        ctx.beginPath(); ctx.rect(cx - 150, yh, 300, toY(0) - yh); ctx.clip();
        ctx.fillStyle = 'rgba(10,11,14,0.6)'; ctx.fillRect(cx - 150, yh, 300, 400);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
        ctx.beginPath(); for (let d = -400; d < 400; d += 16) { ctx.moveTo(cx - 150 + d, toY(0)); ctx.lineTo(cx - 150 + d + 300, toY(0) - 300); } ctx.stroke();
        ctx.restore();
      }
    }
    // tape along the canal axis
    ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, yTip); ctx.lineTo(x, yEnd); ctx.stroke();
    const labs = [];
    for (let m = 0; m <= Math.round(tipY * 2); m++) {
      const yy = toY(tipY - m * 0.5), big = m % 2 === 0; if (yy > yEnd + 1) break;
      ctx.beginPath(); ctx.moveTo(x - (big ? 14 : 8), yy); ctx.lineTo(x + (big ? 14 : 8), yy); ctx.stroke();
      if (big && m > 0) labs.push([m === 2 ? '1 mm' : `${m / 2}`, yy]);
    }
    // reach bar
    ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = C.cyan;
    if (o.range) {
      const yR = toY(tipY - o.range[0] * k);
      ctx.beginPath(); ctx.moveTo(x - 30, yTip + 5); ctx.lineTo(x - 30, yR); ctx.stroke();
      const kk = clamp((k - 0.5) / 0.5);
      const ya = toY(tipY - o.range[0]), yb = toY(tipY - o.range[0] - (o.range[1] - o.range[0]) * kk);
      const g = ctx.createLinearGradient(0, ya, 0, toY(tipY - o.range[1])); g.addColorStop(0, C.cyan); g.addColorStop(1, 'rgba(98,216,255,0)');
      ctx.strokeStyle = g; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x - 30, ya); ctx.lineTo(x - 30, yb); ctx.stroke();
    } else {
      const yStop = YWL - 15, yR = lerp(yTip + 5, yStop, k);
      ctx.beginPath(); ctx.moveTo(x - 30, yTip + 5); ctx.lineTo(x - 30, yR); ctx.stroke();
      if (o.arrow) { // arrow head at WL
        ctx.save(); ctx.globalAlpha *= clamp((k - 0.8) / 0.2);
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(x - 30, yR + 13); ctx.lineTo(x - 41, yR - 4); ctx.lineTo(x - 19, yR - 4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
    for (const [s, yy] of labs) pill(s, x + 22, yy, `500 30px ${MONO}`, '#fff', 'left', a);
  }

  const warned = new Set();
  function drawFootnotes(t, outO) {
    const f = `400 22px ${FONT}`;
    const ln = (s, y, a) => {
      if (a <= 0.001) return;
      if (!warned.has(s)) { ctx.font = f; const w = ctx.measureText(s).width; if (w > 820) console.warn(`footnote too wide (${w | 0}px): ${s}`); warned.add(s); }
      txt(s, 530, y, f, C.faint, 'center', a);
    };
    const loopIn = seg(t, T.END - 0.2, T.END);
    // hook + P1 (second line shared, so it does not blink at the beat change)
    ln('Schematic 2-D toy model, width ×2.2 · patterns after Boutsioukis et al. 2010', 1540, Math.max(1 - seg(t, T.P1 - 0.3, T.P1), loopIn));
    ln('Reach: Boutsioukis et al., Int Endod J 2010 · schematic 2-D toy model, width ×2.2', 1540, env(t, T.P1, T.P2, 0.3, 0.3));
    ln('2-D slice exaggerates return flow; 3-D CFD wall speeds ≈ 0–0.7 m/s (Shen 2010)', 1566, Math.max(1 - seg(t, T.P2 - 0.3, T.P2), loopIn));
    // P2
    const p2 = env(t, T.P2, T.P4, 0.3, 0.3);
    ln('Wall shear: one relative scale; studies differ on its peak (Chen 2014; Singh 2024)', 1514, p2 * seg(t, T.P2 + 1.9, T.P2 + 2.3));
    ln('Reach 1–1.5 mm at 0.15–0.2 mL/s: Boutsioukis et al. 2009 · IEJ review 2022', 1540, p2);
    ln('2-D slice exaggerates return flow & coronal shear; 3-D flow spreads around needle', 1566, p2);
    // P4
    const p4 = env(t, T.P4, T.P5, 0.3, 0.3);
    ln('Bars: 3-D CFD ratio ≈ 2–2.5× at 3 mm (Singh 2024); the 2-D toy field exaggerates it', 1540, p4);
    ln('Boutsioukis et al. 2010 · extrusion: Psimma et al. 2013 (ex vivo overestimates it)', 1566, p4);
    // P5
    const p5 = seg(t, T.P5, T.P5 + 0.3) * outO;
    ln('Boutsioukis & Arias-Moliz, IEJ 2022 · Boutsioukis & Gutierrez Nova, J Endod 2021', 1540, p5);
    ln('Side-vented 1 mm: 3-D CFD schematic (Boutsioukis 2010); Singh 2024 disagrees', 1566, p5);
  }

  window.REEL = {
    title: 'Needle CFD: side-vented vs open-ended',
    duration: T.END,
    poster: 2.1,
    canvas,
    fonts: [`600 64px "IBM Plex Sans"`, `500 30px "IBM Plex Sans"`, `400 22px "IBM Plex Sans"`, `400 27px "IBM Plex Mono"`, `500 26px "IBM Plex Mono"`, `600 30px "IBM Plex Mono"`],
    setup,
    render,
  };
})();
Kit.boot(REEL);
