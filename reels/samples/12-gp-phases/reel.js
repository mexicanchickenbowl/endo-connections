/*
 * 12 · Why warm gutta-percha shrinks — its phases (β → α → amorphous → β)
 * Style: clean journal figure. White page, thin black axes, Inter + IBM Plex Sans,
 * three accents (blue β, orange α, grey amorphous), panel letters A/B/C, figure-legend captions.
 * Three synchronised panels driven by one temperature timeline T(t):
 *   A  schematic volume–temperature loop with a moving dot (heating, then cooling)
 *   B  schematic chain packing that morphs β → α → amorphous, then a cooling-rate fork (α | β)
 *   C  a GP cone in a canal, heated from the orifice (apical GP stays cooler), compacted while warm,
 *      pressure held through cooling; a dashed ghost shows where it would shrink to without pressure
 * Colour code is never blended: every element switches hard between blue / orange / grey.
 * A per-beat focus envelope dims the panels that are not the point of the current beat.
 * Deterministic: everything is a pure function of t.
 */
(function () {
  'use strict';
  const { canvas, ctx: mainCtx } = Kit.createCanvas();
  let ctx = mainCtx;                      // swapped to an offscreen layer while a dimmed panel is drawn
  const layerCanvas = document.createElement('canvas'); layerCanvas.width = Kit.W; layerCanvas.height = Kit.H;
  const layerCtx = layerCanvas.getContext('2d');
  // draw a panel at full opacity into a layer, then composite it with the focus alpha (no see-through overlaps)
  function inLayer(alpha, r, fn) {
    if (alpha >= 0.995) { fn(); return; }
    if (alpha <= 0.005) return;
    layerCtx.setTransform(1, 0, 0, 1, 0, 0); layerCtx.globalAlpha = 1; layerCtx.clearRect(r.x, r.y, r.w, r.h);
    layerCtx.save(); layerCtx.beginPath(); layerCtx.rect(r.x, r.y, r.w, r.h); layerCtx.clip();
    const prev = ctx; ctx = layerCtx;
    try { fn(); } finally { ctx = prev; layerCtx.restore(); }
    mainCtx.save(); mainCtx.globalAlpha = alpha; mainCtx.drawImage(layerCanvas, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h); mainCtx.restore();
  }
  const { clamp, lerp, seg, ease, W, H } = Kit;

  const DUR = 22.0;
  const L0 = 21.6, L1 = 21.95;           // loop-out window: everything returns to the frame-0 state
  const SANS = 'Inter, "IBM Plex Sans", "DejaVu Sans", sans-serif';
  const PLEX = '"IBM Plex Sans", Inter, "DejaVu Sans", sans-serif';
  const font = (w, s, fam = SANS) => `${w} ${s}px ${fam}`;
  const fontI = (w, s) => `italic ${w} ${s}px ${SANS}`;
  const COL = {
    bg: '#ffffff', ink: '#14171c', ink2: '#525963', ink3: '#7d838c', hair: '#d3d7dd',
    beta: '#1f5fae', alpha: '#e07300', amor: '#8c929b', amorText: '#6b717a', fine: '#6c727b',
    dentin: '#eff1f4', hatch: '#dde1e6',
  };
  const PCOL = { b: COL.beta, a: COL.alpha, m: COL.amor };
  const PRGB = { b: Kit.hex(COL.beta), a: Kit.hex(COL.alpha), m: Kit.hex(COL.amor) };
  const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const rgbStr = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const tint = (c, u) => c.map((v) => lerp(v, 255, u));
  const PFILL = { b: rgbStr(tint(PRGB.b, 0.64)), a: rgbStr(tint(PRGB.a, 0.64)), m: rgbStr(tint(PRGB.m, 0.64)) };
  // dominant phase (hard switch, no colour blending)
  const dom = (wB, wA, wM) => (wM >= wA && wM >= wB ? 'm' : wA >= wB ? 'a' : 'b');

  // ---------------------------------------------------------------- timeline
  // Monotone cubic through temperature keyframes → smooth, overshoot-free motion of the dot.
  function monotone(pts) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), n = xs.length, d = [], m = new Array(n);
    for (let k = 0; k < n - 1; k++) d.push((ys[k + 1] - ys[k]) / (xs[k + 1] - xs[k]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2;
    for (let k = 0; k < n - 1; k++) {
      if (d[k] === 0) { m[k] = 0; m[k + 1] = 0; continue; }
      const a = m[k] / d[k], b = m[k + 1] / d[k], s = a * a + b * b;
      if (s > 9) { const tau = 3 / Math.sqrt(s); m[k] = tau * a * d[k]; m[k + 1] = tau * b * d[k]; }
    }
    return (x) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let k = 0; while (x > xs[k + 1]) k++;
      const h = xs[k + 1] - xs[k], u = (x - xs[k]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * ys[k] + (u3 - 2 * u2 + u) * h * m[k] + (-2 * u3 + 3 * u2) * ys[k + 1] + (u3 - u2) * h * m[k + 1];
    };
  }
  const T_PEAK_T = 8.2;          // heating → cooling branch switch (inside the 70 °C hold)
  const Tof = monotone([[0, 22], [1.0, 22], [2.4, 42], [4.1, 49], [4.9, 53], [6.7, 59], [7.8, 70], [8.6, 70],
    [10.2, 52], [12.2, 47], [14.6, 40], [15.6, 37.8], [17.6, 37.2], [DUR, 37]]);

  // Phase fractions
  const fAof = (T) => sm((T - 42) / 7);   // β→α across ~42–49 °C (Schilder et al. 1974)
  const fMof = (T) => sm((T - 53) / 6);   // α→amorphous across ~53–59 °C
  const XMAX = 0.5;                       // recrystallisation is still incomplete when the dot reaches 37 °C
  const xRel = (T) => sm((47.5 - T) / 9.5);  // gradual, schematic recrystallisation on cooling
  const fXof = (T) => XMAX * xRel(T);

  // Schematic volume (arbitrary units, raised off the axis; axis is broken): steps at transitions, hysteresis
  const Vb = (T) => 0.28 + 0.0035 * (T - 18);
  const Va = (T) => Vb(T) + 0.06;
  const VM53 = Va(53) + 0.24;
  const Vm = (T) => VM53 + 0.006 * (T - 53);
  function Vheat(T) { const a = fAof(T), m = fMof(T); return (1 - a) * (1 - m) * Vb(T) + a * (1 - m) * Va(T) + m * Vm(T); }
  function Vcool(T) { const x = fXof(T); return (1 - x) * Vm(T) + x * Vb(T); }
  const V_HOT = Vm(70), V_END = Vcool(37), V_START = Vheat(22);

  function state(t) {
    const T = Tof(t), heat = t < T_PEAK_T;
    let wB, wA, wM, V, ph;
    if (heat) { const a = fAof(T), m = fMof(T); wM = m; wA = a * (1 - m); wB = (1 - a) * (1 - m); V = Vheat(T); ph = dom(wB, wA, wM); }
    else { const xr = xRel(T); wM = 1 - XMAX * xr; wA = 0; wB = XMAX * xr; V = Vcool(T); ph = xr >= 0.5 ? 'b' : 'm'; }
    return { T, heat, wB, wA, wM, V, ph };
  }
  // times at which the dot's dominant phase flips (pulse ring + colour wipe)
  function crossing(Tc, t0, t1, up) { let a = t0, b = t1; for (let i = 0; i < 50; i++) { const mid = (a + b) / 2; ((Tof(mid) < Tc) === up) ? (a = mid) : (b = mid); } return (a + b) / 2; }
  const EVENTS = [
    { t: crossing(45.5, 1.0, 4.1, true), from: 'b', to: 'a' },
    { t: crossing(56, 4.9, 6.7, true), from: 'a', to: 'm' },
    { t: crossing(42.75, 12.2, 14.6, false), from: 'm', to: 'b' },
  ];

  // per-beat focus envelope: [start, [A, B, C]] — non-focal panels are dimmed (0.3 s ease)
  const FOCUS = [[0, [1, 1, 0.55]], [6.45, [0.55, 0.4, 1]], [8.9, [0.55, 1, 0.55]], [12.5, [1, 0.4, 1]],
    [15.55, [0.4, 0.4, 1]], [L0, [1, 1, 0.55]]];
  function focus(t) {
    let cur = FOCUS[0][1].slice();
    for (let i = 1; i < FOCUS.length; i++) {
      const u = seg(t, FOCUS[i][0], FOCUS[i][0] + 0.3, ease.inOut);
      if (u <= 0) break;
      cur = cur.map((v, k) => lerp(v, FOCUS[i][1][k], u));
    }
    return { A: cur[0], B: cur[1], C: cur[2] };
  }

  // ---------------------------------------------------------------- layout
  const M = 64, MR = 1016;
  const PA = { x0: 182, x1: 990, y0: 506, y1: 846, T0: 18, T1: 74, V1: 0.9 };
  const X = (T) => PA.x0 + (T - PA.T0) / (PA.T1 - PA.T0) * (PA.x1 - PA.x0);
  const Y = (V) => PA.y1 - V / PA.V1 * (PA.y1 - PA.y0);
  const BOX = { x: 76, y: 1006, w: 500, h: 296 };
  const BL = { x: 76, y: 1006, w: 232, h: 296 };
  const BR = { x: 344, y: 1006, w: 232, h: 296 };
  const LABEL_Y = BOX.y + BOX.h + 48;     // 1350
  const SUB_Y = LABEL_Y + 34;             // 1384
  const CC = { cx: 800, yTop: 1006, yEnd: 1300 };
  const SX = 1.2;                         // panel C drawn 1.2× wider than v1

  // ---------------------------------------------------------------- text helpers
  function txt(s, x, y, f, c, align = 'left', a = 1, base = 'alphabetic') {
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.font = f; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.fillText(s, x, y); ctx.restore();
  }
  // text on a white knock-out (so guide lines pass behind it)
  function txtBg(s, x, y, f, c, align, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.font = f; const w = ctx.measureText(s).width, sz = parseFloat(f.match(/(\d+)px/)[1]);
    const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    ctx.globalAlpha *= a; ctx.fillStyle = COL.bg; ctx.fillRect(x0 - 5, y - sz * 0.8, w + 10, sz * 1.05); ctx.restore();
    txt(s, x, y, f, c, align, a);
  }
  // mini markup: **bold**, {b:β} {a:α} {m:amorphous} coloured bold spans
  function parse(markup) {
    const segs = []; let bold = false, i = 0, buf = '';
    const push = () => { if (buf) segs.push({ s: buf, bold, color: null }); buf = ''; };
    while (i < markup.length) {
      if (markup.startsWith('**', i)) { push(); bold = !bold; i += 2; continue; }
      if (markup[i] === '{' && markup[i + 2] === ':') {
        push(); const k = markup[i + 1], j = markup.indexOf('}', i);
        segs.push({ s: markup.slice(i + 3, j), bold: true, color: k === 'b' ? COL.beta : k === 'a' ? COL.alpha : COL.amorText });
        i = j + 1; continue;
      }
      buf += markup[i++];
    }
    push();
    return segs;
  }
  const plain = (markup) => parse(markup).map((s) => s.s).join('');
  function rich(markup, x, y, maxW, size, lh, a = 1, baseColor = COL.ink, align = 'left') {
    if (a <= 0.002) return 0;
    const toks = [];
    for (const sg of parse(markup)) for (const p of sg.s.split(/(\s+)/)) if (p) toks.push({ ...sg, s: p });
    const lines = [[]], widths = [0];
    ctx.save();
    for (const tk of toks) {
      ctx.font = font(tk.bold ? 700 : 400, size);
      const tw = ctx.measureText(tk.s).width; tk.w = tw;
      const isSpace = /^\s+$/.test(tk.s), L = lines.length - 1;
      if (!isSpace && widths[L] + tw > maxW && lines[L].length) { lines.push([]); widths.push(0); }
      const L2 = lines.length - 1;
      if (isSpace && widths[L2] === 0) continue;
      lines[L2].push(tk); widths[L2] += tw;
    }
    ctx.globalAlpha *= a; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    lines.forEach((ln, li) => {
      while (ln.length && /^\s+$/.test(ln[ln.length - 1].s)) widths[li] -= ln.pop().w;
      let xx = align === 'center' ? x - widths[li] / 2 : x;
      for (const tk of ln) { ctx.font = font(tk.bold ? 700 : 400, size); ctx.fillStyle = tk.color || baseColor; ctx.fillText(tk.s, xx, y + li * lh); xx += tk.w; }
    });
    ctx.restore();
    return lines.length;
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function arrow(x0, y0, x1, y1, hs = 7) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hs * 0.6, y1 - Math.sin(a) * hs * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hs * Math.cos(a - 0.5), y1 - hs * Math.sin(a - 0.5)); ctx.lineTo(x1 - hs * Math.cos(a + 0.5), y1 - hs * Math.sin(a + 0.5)); ctx.closePath(); ctx.fill();
  }

  // ---------------------------------------------------------------- lattice (panel B)
  const ZZ = 6, BEAD = 11;
  function buildLattice(box, rows, units, UL, seed) {
    const n = 2 * units + 1, len = units * UL, x0 = box.x + (box.w - len) / 2, rnd = Kit.rng(seed), chains = [];
    const pad = 18;
    for (let i = 0; i < rows; i++) {
      const yr = box.y + (i + 1) * box.h / (rows + 1);
      const beta = [], alpha = [], amor = [], sA = [], sM = [];
      const off = (i % 2 ? 1 : -1) * UL * 0.25;
      for (let j = 0; j < n; j++) {
        const k = Math.floor(j / 2);
        // β: aligned rows, every isoprene unit alike (one-unit repeat)
        beta.push([x0 + j * UL / 2, yr + (j % 2 ? -ZZ : ZZ)]);
        // α: oblique (staggered) rows, two-unit repeat (alternating conformation)
        const kink = (j % 2 ? -ZZ : ZZ) * (k % 2 ? 1.3 : 0.7);
        alpha.push([x0 + off + j * UL / 2, yr + kink + (k % 2 ? 3 : -3)]);
        sA.push(k % 2 ? -1 : 1);
      }
      // amorphous: bounded random walk (deterministic)
      let px = box.x + pad + (0.15 + 0.7 * rnd()) * (box.w - 2 * pad), py = box.y + pad + ((i + 0.2 + 0.6 * rnd()) / rows) * (box.h - 2 * pad);
      let th = rnd() * Math.PI * 2;
      for (let j = 0; j < n; j++) {
        amor.push([px, py]); sM.push(rnd() < 0.5 ? 1 : -1);
        th += (rnd() - 0.5) * 1.5;
        for (let tries = 0; tries < 6; tries++) {
          const nx = px + Math.cos(th) * UL / 2, ny = py + Math.sin(th) * UL / 2;
          let ok = true;
          if (nx < box.x + pad || nx > box.x + box.w - pad) { th = Math.PI - th; ok = false; }
          if (ny < box.y + pad || ny > box.y + box.h - pad) { th = -th; ok = false; }
          if (ok) { px = nx; py = ny; break; }
        }
      }
      chains.push({ beta, alpha, amor, sA, sM, h: Kit.hash(i, seed), n });
    }
    return chains;
  }
  const LAT_FULL = buildLattice(BOX, 6, 10, 42, 11);
  // fork lattices sit 34 px lower so the α / β tags in the top-right corner never touch a chain
  const subBox = (b) => ({ x: b.x, y: b.y + 34, w: b.w, h: b.h - 34 });
  const LAT_L = buildLattice(subBox(BL), 6, 5, 38, 23);
  const LAT_R = buildLattice(subBox(BR), 6, 5, 38, 37);

  // staggered local progress: a front that sweeps left → right (plus a little per-chain variation)
  const stag = (P, xn, h) => sm(P * 1.7 - 0.7 * (0.8 * xn + 0.2 * h));
  const tempAmpOf = (T) => 0.5 + 1.8 * clamp((T - 22) / 32);
  const jigAt = (ci, j, t, amp) => [Kit.noise2(ci * 7.31 + j * 0.43, t * 1.25, 5) * amp, Kit.noise2(ci * 5.17 + j * 0.47, t * 1.25 + 40, 9) * amp];
  // thermal jiggle; over the loop-out window it blends into the t = 0 noise so the last frame equals the first
  const jig = (ci, j, t, amp) => {
    const w = seg(t, L0, DUR, ease.inOut), p = jigAt(ci, j, t, amp);
    if (w <= 0) return p;
    const q = jigAt(ci, j, t - DUR, amp); return [lerp(p[0], q[0], w), lerp(p[1], q[1], w)];
  };

  // stroke one chain: each half-segment in its own bead's phase colour (no blending)
  function strokeChain(pts, codes, sgn, sideA) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.2;
    for (let j = 0; j < pts.length - 1; j++) {
      const mx = (pts[j][0] + pts[j + 1][0]) / 2, my = (pts[j][1] + pts[j + 1][1]) / 2;
      ctx.strokeStyle = PCOL[codes[j]]; ctx.beginPath(); ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(mx, my); ctx.stroke();
      ctx.strokeStyle = PCOL[codes[j + 1]]; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(pts[j + 1][0], pts[j + 1][1]); ctx.stroke();
    }
    // methyl side group on every isoprene unit
    for (let j = 1; j < pts.length - 1; j += sideA ? 1 : 2) {
      const sa = sideA ? sideA[j] : 1;
      if (sa <= 0.01) continue;
      const tx = pts[j + 1][0] - pts[j - 1][0], ty = pts[j + 1][1] - pts[j - 1][1], L = Math.hypot(tx, ty) || 1;
      const nx = ty / L, ny = -tx / L;
      const bx = pts[j][0] + nx * BEAD * sgn[j], by = pts[j][1] + ny * BEAD * sgn[j];
      ctx.save(); ctx.globalAlpha *= sa;
      ctx.strokeStyle = PCOL[codes[j]]; ctx.fillStyle = PCOL[codes[j]]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(bx, by); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by, 4.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawLattice(chains, box, st, t, opts) {
    const { alphaMul = 1, target = 'beta', mode, P = 0 } = opts;
    if (alphaMul <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alphaMul;
    ctx.beginPath(); ctx.rect(box.x + 2, box.y + 2, box.w - 4, box.h - 4); ctx.clip();
    const tempAmp = tempAmpOf(st.T);
    const Pa = clamp((st.T - 42) / 7), Pm = clamp((st.T - 53) / 6);
    chains.forEach((ch, ci) => {
      const pts = [], codes = [], sgn = [];
      for (let j = 0; j < ch.n; j++) {
        const xn = j / (ch.n - 1);
        let wB, wA, wM;
        if (mode === 'heat') {
          const la = stag(Pa, xn, ch.h), lm = stag(Pm, xn, ch.h);
          wM = lm; wA = la * (1 - lm); wB = (1 - la) * (1 - lm);
        } else {
          const lx = stag(P, xn, ch.h);
          wM = 1 - lx; wB = target === 'beta' ? lx : 0; wA = target === 'alpha' ? lx : 0;
        }
        const b = ch.beta[j], a = ch.alpha[j], m = ch.amor[j];
        const [jx, jy] = jig(ci, j, t, tempAmp * (1 - wM) + 4.2 * wM);
        pts.push([b[0] * wB + a[0] * wA + m[0] * wM + jx, b[1] * wB + a[1] * wA + m[1] * wM + jy]);
        codes.push(dom(wB, wA, wM));
        sgn.push(wB * 1 + wA * ch.sA[j] + wM * ch.sM[j]);
      }
      strokeChain(pts, codes, sgn);
    });
    ctx.restore();
  }
  // loop merge: the β fork box widens back into the single β box; chain points glide to their frame-0 spots
  function drawMerge(u, st, t) {
    const bx = lerp(BR.x, BOX.x, u), bw = lerp(BR.w, BOX.w, u);
    ctx.save();
    ctx.beginPath(); ctx.rect(bx + 2, BOX.y + 2, bw - 4, BOX.h - 4); ctx.clip();
    const amp = lerp(tempAmpOf(st.T), tempAmpOf(22), u);
    LAT_FULL.forEach((F, ci) => {
      const R = LAT_R[ci], pts = [], codes = [], sgn = [], sideA = [];
      for (let j = 0; j < F.n; j++) {
        // each frame-0 point starts on the fork chain at the matching fraction of its length
        const f = j * (R.n - 1) / (F.n - 1), k = Math.min(Math.floor(f), R.n - 2), q = f - k;
        const s = [lerp(R.beta[k][0], R.beta[k + 1][0], q), lerp(R.beta[k][1], R.beta[k + 1][1], q)], e = F.beta[j];
        const [jx, jy] = jig(ci, j, t, amp);
        pts.push([lerp(s[0], e[0], u) + jx, lerp(s[1], e[1], u) + jy]);
        codes.push('b'); sgn.push(1);
        // fork side groups (riding on even points) fade out while the frame-0 side groups fade in
        sideA.push(j % 2 ? u : ((j / 2) % 2 ? 1 - u : 0));
      }
      strokeChain(pts, codes, sgn, sideA);
    });
    ctx.restore();
  }
  function frame(box, a = 1) {
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= a; roundRect(box.x, box.y, box.w, box.h, 12);
    ctx.fillStyle = '#fbfbfc'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = COL.hair; ctx.stroke(); ctx.restore();
  }
  function badge(s, x, y, c, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 21, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke();
    ctx.restore();
    txt(s, x, y + 1, font(700, 30), c, 'center', a, 'middle');
  }

  function drawPanelB(t, st) {
    const uL = seg(t, L0, L1, ease.inOut);
    const split = st.heat ? 0 : seg(t, 9.05, 9.65, ease.inOut);       // cooling fork: one box → two
    const fullA = st.heat ? 1 : 1 - seg(t, 9.05, 9.3);                   // sequenced, never more than two layers
    const forkA = st.heat ? 0 : seg(t, 9.25, 9.65);
    const labA = st.heat ? 0 : seg(t, 9.5, 9.75) * (1 - seg(t, L0, L0 + 0.2));
    const P = seg(t, 9.9, 11.9, ease.inOut);                            // crystallisation in the fork (time compressed)
    // frames
    if (st.heat || t < 9.05) frame(BOX, 1);
    else if (uL <= 0) {
      const w = lerp(BOX.w, BL.w, split);
      frame({ x: BL.x, y: BOX.y, w, h: BOX.h }, 1);
      frame({ x: lerp(BOX.x, BR.x, split), y: BOX.y, w, h: BOX.h }, 1);
    } else {
      frame(BL, 1 - uL);
      frame({ x: lerp(BR.x, BOX.x, uL), y: BOX.y, w: lerp(BR.w, BOX.w, uL), h: BOX.h }, 1);
    }
    // lattices
    if (st.heat) drawLattice(LAT_FULL, BOX, st, t, { mode: 'heat' });
    else {
      drawLattice(LAT_FULL, BOX, st, t, { mode: 'cool', P: 0, alphaMul: fullA });
      if (uL <= 0) {
        drawLattice(LAT_L, BL, st, t, { mode: 'cool', target: 'alpha', P, alphaMul: forkA });
        drawLattice(LAT_R, BR, st, t, { mode: 'cool', target: 'beta', P, alphaMul: forkA });
      } else {
        drawLattice(LAT_L, BL, st, t, { mode: 'cool', target: 'alpha', P, alphaMul: 1 - uL });
        drawMerge(uL, st, t);
      }
    }
    // main state label (dominant phase; fades through the midpoint of each transition)
    const set = [['β crystal', COL.beta, st.wB], ['α crystal', COL.alpha, st.wA], ['amorphous (melt)', COL.amorText, st.wM]];
    const s2 = set.slice().sort((a, b) => b[2] - a[2]);
    const la = sm((s2[0][2] - s2[1][2]) * 2.2) * (st.heat ? 1 : 1 - seg(t, 8.9, 9.15));
    txt(s2[0][0], BOX.x + BOX.w / 2, LABEL_Y, font(700, 38), s2[0][1], 'center', la);
    if (uL > 0) txt('β crystal', BOX.x + BOX.w / 2, LABEL_Y, font(700, 38), COL.beta, 'center', sm((uL - 0.3) / 0.7));
    if (labA > 0) {
      const cl = BL.x + BL.w / 2, cr = BR.x + BR.w / 2;
      txt('very slow', cl, LABEL_Y - 2, font(700, 32), COL.ink, 'center', labA);
      txt('~0.5 °C/h', cl, SUB_Y, font(400, 30), COL.ink2, 'center', labA);
      txt('normal cooling', cr, LABEL_Y - 2, font(700, 32), COL.ink, 'center', labA);
      txt('over minutes–hours', cr, SUB_Y, font(400, 30), COL.ink2, 'center', labA);
      txt('or', (BL.x + BL.w + BR.x) / 2, BOX.y + BOX.h / 2 + 10, font(600, 30), COL.ink3, 'center', labA);
      const ra = labA * sm((P - 0.2) * 3);
      badge('α', BL.x + BL.w - 30, BL.y + 28, COL.alpha, ra);
      badge('β', BR.x + BR.w - 30, BR.y + 28, COL.beta, ra);
    }
  }

  // ---------------------------------------------------------------- canal (panel C)
  const Y0 = CC.yTop;
  const cw = (y) => SX * lerp(52, 6, clamp((y - Y0) / (CC.yEnd - Y0)));
  const bulge = (y) => SX * 15 * Math.exp(-Math.pow((y - (Y0 + 160)) / 25, 2));
  const FILLER = (() => { const r = Kit.rng(77), a = []; for (let i = 0; i < 130; i++) a.push([r() * 1.7 - 0.85, 0.02 + r() * 0.95, 1.7 + r() * 0.9]); return a; })();
  const gTop0 = Y0 + 40, gB = Y0 + 272;
  const dOf = (y) => (y - gTop0) / (gB - gTop0);                 // 0 = coronal end of the GP, 1 = apical end
  // local heating profile: heat enters from the orifice; the apical ~quarter never passes ~41 °C
  const prof = (d) => 1 - 0.6 * sm((d - 0.6) / 0.14);
  const zone = (d) => 1 - sm((d - 0.6) / 0.12);                  // 1 where the GP melts, 0 apically
  function cPhase(d, st) {
    const p = prof(d), Tl = 22 + (st.T - 22) * p;
    if (st.heat) { const a = fAof(Tl), m = fMof(Tl); return dom((1 - a) * (1 - m), a * (1 - m), m); }
    const Tmax = 22 + 48 * p;
    if (fMof(Tmax) >= 0.5) return xRel(Tl) >= 0.5 ? 'b' : 'm';  // melted: recrystallises (deepest first)
    if (fAof(Tmax) >= 0.5) return 'a';                           // only reached α: stays α
    return 'b';
  }
  function rootOutline() {
    const { cx } = CC;
    ctx.moveTo(cx - 120 * SX, Y0);
    ctx.quadraticCurveTo(cx - 112 * SX, Y0 + 168, cx - 28 * SX, Y0 + 284);
    ctx.quadraticCurveTo(cx, Y0 + 312, cx + 28 * SX, Y0 + 284);
    ctx.quadraticCurveTo(cx + 112 * SX, Y0 + 168, cx + 120 * SX, Y0);
  }
  function canalPath() {
    const { cx } = CC;
    ctx.beginPath();
    ctx.moveTo(cx - cw(Y0), Y0 - 2);
    for (let y = Y0; y <= Y0 + 308; y += 4) ctx.lineTo(cx - Math.max(4.5, cw(y)), y);
    for (let y = Y0 + 308; y >= Y0; y -= 4) ctx.lineTo(cx + Math.max(4.5, cw(y)) + bulge(y), y);
    ctx.lineTo(cx + cw(Y0), Y0 - 2);
    ctx.closePath();
  }

  function drawPanelC(t, st) {
    const { cx } = CC;
    const uL = seg(t, L0, L1, ease.inOut);
    ctx.save();
    ctx.beginPath(); ctx.rect(610, Y0 - 8, 350, 352); ctx.clip();
    // dentine (section) with hatch
    ctx.beginPath(); rootOutline(); ctx.closePath(); ctx.fillStyle = COL.dentin; ctx.fill();
    ctx.save(); ctx.beginPath(); rootOutline(); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = COL.hatch; ctx.lineWidth = 1.2;
    for (let k = -460; k < 460; k += 12) { ctx.beginPath(); ctx.moveTo(cx + k - 150, Y0 - 10); ctx.lineTo(cx + k + 230, Y0 + 370); ctx.stroke(); }
    ctx.restore();
    canalPath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = COL.ink; ctx.beginPath(); rootOutline(); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#3a3f47';
    ctx.beginPath(); for (let y = Y0; y <= Y0 + 298; y += 4) { const x = cx - Math.max(4.5, cw(y)); y === Y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    ctx.beginPath(); for (let y = Y0; y <= Y0 + 298; y += 4) { const x = cx + Math.max(4.5, cw(y)) + bulge(y); y === Y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    ctx.strokeStyle = COL.ink3; ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(cx - 132 * SX, Y0); ctx.lineTo(cx - cw(Y0) - 2, Y0); ctx.moveTo(cx + cw(Y0) + 2, Y0); ctx.lineTo(cx + 132 * SX, Y0); ctx.stroke();
    ctx.setLineDash([]);

    // --- gutta-percha geometry
    const pIn = seg(t, 6.45, 7.05, ease.out);                  // plugger arrives while the GP is hot
    const compR = seg(t, 7.05, 8.3, ease.inOut);               // compaction under load (mouldable → adapted)
    const comp = compR * (1 - uL);
    const expand = st.heat ? clamp((st.V - V_START) / (V_HOT - V_START)) : 1;
    const shrinkF = st.heat ? 0 : clamp((V_HOT - st.V) / (V_HOT - V_END));
    let gT = gTop0 - 6 * expand * (1 - compR) + 12 * compR + 20 * shrinkF;   // plugger follows the shrinking top
    gT = lerp(gT, gTop0, uL);
    const hw0 = (y) => Math.max(3, cw(y) - lerp(6 * SX, 1.5, clamp((y - Y0) / (gB - Y0))));
    const adaptAt = (y) => comp * zone(dOf(y));
    const edgeL = (y) => cx - lerp(hw0(y), cw(y), adaptAt(y));
    const edgeR = (y) => cx + lerp(hw0(y), cw(y), adaptAt(y)) + bulge(y) * adaptAt(y);
    // phase by depth → hard-stop vertical gradient (top-down heating front, bottom-up recrystallisation)
    const g1 = gB + 8;
    const gf = ctx.createLinearGradient(0, gT, 0, g1), gl = ctx.createLinearGradient(0, gT, 0, g1);
    let prev = null;
    for (let y = gT; y <= g1 + 0.01; y += 2) {
      const c = uL > 0.5 ? 'b' : cPhase(dOf(Math.min(y, gB)), st);
      if (c !== prev) {
        const off = clamp((y - 1 - gT) / (g1 - gT));
        if (prev) { gf.addColorStop(off, PFILL[prev]); gl.addColorStop(off, PCOL[prev]); }
        gf.addColorStop(prev ? off : 0, PFILL[c]); gl.addColorStop(prev ? off : 0, PCOL[c]);
        prev = c;
      }
    }
    gf.addColorStop(1, PFILL[prev]); gl.addColorStop(1, PCOL[prev]);
    ctx.beginPath();
    ctx.moveTo(edgeL(gT), gT);
    for (let y = gT; y <= gB; y += 3) ctx.lineTo(edgeL(y), y);
    ctx.quadraticCurveTo(cx, gB + 7, edgeR(gB), gB);
    for (let y = gB; y >= gT; y -= 3) ctx.lineTo(edgeR(y), y);
    ctx.closePath();
    ctx.fillStyle = gf; ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = gl; ctx.stroke();
    // filler particles (ZnO-rich) in the GP matrix
    ctx.fillStyle = 'rgba(64,70,80,0.45)';
    for (const [u, v, r] of FILLER) {
      const y = lerp(gT + 7, gB - 4, v), l = edgeL(y), rr = edgeR(y), mid = (l + rr) / 2, hw = (rr - l) / 2 - 4;
      if (hw < 1.5) continue;
      ctx.beginPath(); ctx.arc(mid + u * hw, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // counterfactual: where the GP would pull back to if pressure were NOT held (dashed ghost)
    const cf = Kit.env(t, 12.95, 16.7, 0.4, 0.4);
    if (cf > 0.01) {
      const gap = (y) => 26 * zone(dOf(y));
      const cL = (y) => Math.min(edgeL(y) + gap(y), cx - 3), cR = (y) => Math.max(edgeR(y) - gap(y) - bulge(y) * adaptAt(y) * 0.6, cx + 3);
      const cT = gT + 24;
      ctx.save(); ctx.globalAlpha *= cf;
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.moveTo(cL(cT), cT);
      for (let y = cT; y <= gB; y += 3) ctx.lineTo(cL(y), y);
      ctx.quadraticCurveTo(cx, gB + 7, cR(gB), gB);
      for (let y = gB; y >= cT; y -= 3) ctx.lineTo(cR(y), y);
      ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = COL.ink; ctx.lineWidth = 3;
      for (const y of [Y0 + 98, Y0 + 150]) { arrow(edgeL(y) + 2, y, cL(y) - 2, y, 10); arrow(edgeR(y) - 2, y, cR(y) + 2, y, 10); }
      ctx.restore();
    }
    // heat enters at the orifice (before the plugger)
    const heatA = Kit.env(t, 1.0, 6.4, 0.4, 0.4);
    if (heatA > 0.01) {
      ctx.save(); ctx.globalAlpha *= heatA; ctx.strokeStyle = COL.alpha; ctx.fillStyle = COL.alpha; ctx.lineWidth = 2.4;
      arrow(cx - 30, Y0 - 6, cx - 30, gT - 6, 10);
      ctx.restore();
      txt('heat', cx - 16, Y0 + 26, font(600, 30), COL.alpha, 'left', heatA);
    }
    // plugger: tapered shank, rounded working end, fades in from above the panel
    if (pIn > 0 && uL < 1) {
      const tipY = lerp(Y0 - 40, gT, pIn) - 70 * uL;
      if (tipY > Y0 - 6) {
        const topY = Y0 - 12, hwTip = 36, hwTop = 42;
        ctx.save(); ctx.globalAlpha *= 1 - uL;
        ctx.beginPath();
        ctx.moveTo(cx - hwTop, topY); ctx.lineTo(cx - hwTip, tipY - 3);
        ctx.quadraticCurveTo(cx - hwTip, tipY, cx - hwTip + 3, tipY); ctx.lineTo(cx + hwTip - 3, tipY);
        ctx.quadraticCurveTo(cx + hwTip, tipY, cx + hwTip, tipY - 3); ctx.lineTo(cx + hwTop, topY); ctx.closePath();
        const g = ctx.createLinearGradient(cx - hwTop, 0, cx + hwTop, 0);
        g.addColorStop(0, '#9aa2ad'); g.addColorStop(0.35, '#eceef1'); g.addColorStop(1, '#a3abb5');
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = '#4a5059'; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.save(); ctx.clip();
        const fg = ctx.createLinearGradient(0, Y0 - 8, 0, Y0 + 32);
        fg.addColorStop(0, 'rgba(255,255,255,1)'); fg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = fg; ctx.fillRect(cx - hwTop - 4, Y0 - 12, 2 * hwTop + 8, 46);
        ctx.restore();
        // held pressure: two chevrons on the shank
        const ca = seg(t, 7.0, 7.3);
        if (ca > 0 && tipY - 40 > Y0 - 8) {
          ctx.globalAlpha *= ca; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          for (let k = 0; k < 2; k++) { const yy = tipY - 12 - k * 15 + 2.5 * Math.sin(t * 3); ctx.beginPath(); ctx.moveTo(cx - 11, yy - 9); ctx.lineTo(cx, yy); ctx.lineTo(cx + 11, yy - 9); ctx.stroke(); }
        }
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- panel A
  function drawPanelA(t, st) {
    const uL = seg(t, L0, L1, ease.inOut), endFade = 1 - uL;
    // transition bands (Schilder et al. 1974 ranges); tint switches hard at the band midpoint, like the trace
    const bands = [[42, 49, 'b', 'a', '42–49 °C', 2.1, 4.5], [53, 59, 'a', 'm', '53–59 °C', 4.6, 7.0]];
    for (const [a, b, c0, c1, lab, ta, tb] of bands) {
      const act = sm(Kit.env(t, ta, tb, 0.4, 0.5)), al = 0.08 + 0.1 * act, mid = (X(a) + X(b)) / 2;
      ctx.fillStyle = rgbStr(PRGB[c0], al); ctx.fillRect(X(a), PA.y0, mid - X(a), PA.y1 - PA.y0);
      ctx.fillStyle = rgbStr(PRGB[c1], al); ctx.fillRect(mid, PA.y0, X(b) - mid, PA.y1 - PA.y0);
      ctx.strokeStyle = 'rgba(150,156,165,0.55)'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(X(a), PA.y0); ctx.lineTo(X(a), PA.y1); ctx.moveTo(X(b), PA.y0); ctx.lineTo(X(b), PA.y1); ctx.stroke(); ctx.setLineDash([]);
      txt(lab, mid, PA.y0 - 14, font(act > 0.5 ? 700 : 600, 30), act > 0.5 ? COL.ink : COL.ink2, 'center');
    }
    // body temperature marker
    const bodyA = seg(t, 1.0, 1.6) * endFade;
    if (bodyA > 0) {
      ctx.save(); ctx.globalAlpha *= bodyA; ctx.strokeStyle = COL.ink3; ctx.lineWidth = 1.4; ctx.setLineDash([2, 6]);
      ctx.beginPath(); ctx.moveTo(X(37), PA.y1); ctx.lineTo(X(37), PA.y0 + 110); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      txt('body', X(37) - 9, PA.y1 - 14, font(500, 30), COL.ink2, 'right', bodyA);
    }
    // axes (left + bottom only) with a y-axis break: the volume axis does not start at zero
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(PA.x0, PA.y0 - 18); ctx.lineTo(PA.x0, PA.y1); ctx.lineTo(PA.x1 + 6, PA.y1); ctx.stroke();
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(PA.x0, PA.y0 - 30); ctx.lineTo(PA.x0 - 7, PA.y0 - 14); ctx.lineTo(PA.x0 + 7, PA.y0 - 14); ctx.closePath(); ctx.fill();
    const yb = PA.y1 - 36;
    ctx.fillStyle = COL.bg; ctx.fillRect(PA.x0 - 6, yb - 6, 12, 12);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(PA.x0 - 11, yb - 2); ctx.lineTo(PA.x0 + 11, yb - 12); ctx.moveTo(PA.x0 - 11, yb + 12); ctx.lineTo(PA.x0 + 11, yb + 2); ctx.stroke();
    for (let T = 20; T <= 70; T += 10) {
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(T), PA.y1); ctx.lineTo(X(T), PA.y1 + 11); ctx.stroke();
      txt(String(T), X(T), PA.y1 + 44, font(400, 30, PLEX), COL.ink, 'center');
    }
    for (let T = 25; T <= 70; T += 10) { ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(T), PA.y1); ctx.lineTo(X(T), PA.y1 + 6); ctx.stroke(); }
    txt('Temperature (°C)', (PA.x0 + PA.x1) / 2, PA.y1 + 86, font(500, 30), COL.ink, 'center');
    ctx.save(); ctx.translate(PA.x0 - 34, (PA.y0 + PA.y1) / 2); ctx.rotate(-Math.PI / 2);
    txt('Volume (not to scale)', 0, 0, font(500, 30), COL.ink, 'center'); ctx.restore();

    // --- traces (heating, then cooling) coloured by dominant phase (hard switch at each band midpoint)
    ctx.save(); ctx.globalAlpha *= endFade;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 4.4;
    const Theat = st.heat ? st.T : 70, stepT = 0.25;
    if (Theat > 22.05) {
      for (let T = 22; T < Theat - 1e-6; T += stepT) {
        const T2 = Math.min(Theat, T + stepT), Tm = (T + T2) / 2, a = fAof(Tm), m = fMof(Tm);
        ctx.strokeStyle = PCOL[dom((1 - a) * (1 - m), a * (1 - m), m)];
        ctx.beginPath(); ctx.moveTo(X(T), Y(Vheat(T))); ctx.lineTo(X(T2), Y(Vheat(T2))); ctx.stroke();
      }
    }
    if (!st.heat && st.T < 69.95) {
      for (let T = 70; T > st.T + 1e-6; T -= stepT) {
        const T2 = Math.max(st.T, T - stepT), Tm = (T + T2) / 2;
        ctx.strokeStyle = PCOL[xRel(Tm) >= 0.5 ? 'b' : 'm'];
        ctx.beginPath(); ctx.moveTo(X(T), Y(Vcool(T))); ctx.lineTo(X(T2), Y(Vcool(T2))); ctx.stroke();
      }
    }
    const chev = (T, V, dT, dV, c, a) => {
      if (a <= 0) return;
      const ang = Math.atan2(Y(V + dV) - Y(V), X(T + dT) - X(T));
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(X(T), Y(V)); ctx.rotate(ang);
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-7, -8.5); ctx.lineTo(-3, 0); ctx.lineTo(-7, 8.5); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    chev(33, Vb(33), 1, 0.0035, COL.beta, sm((Theat - 34) / 2));
    if (!st.heat) chev(50.5, Vm(50.5), -1, -0.006, COL.amor, sm((50 - st.T) / 2));

    // direct labels on the curves
    const labA = (s, T, V, c, a, sz = 36, dy = 26, ko = false) => (ko ? txtBg : txt)(s, X(T), Y(V) - dy, font(700, sz), c, 'center', a);
    labA('β', 27.5, Vb(27.5), COL.beta, seg(t, 0.25, 0.6));
    // final QA: 'amorphous' sits left of / above the 70 °C peak so the dot never covers it
    labA('amorphous', 62, Vm(62), COL.amorText, st.heat ? sm((st.T - 60) / 2) : 1, 32, 34);

    // shrinkage bracket: its lower end tracks the dot as it cools
    const shA = seg(t, 12.6, 13.2, ease.out);
    if (shA > 0) {
      const xb = X(72.4), y0 = Y(V_HOT), yc = Y(st.V), yF = Y(V_END), ym = (y0 + yF) / 2;
      ctx.save(); ctx.globalAlpha *= shA;
      ctx.strokeStyle = COL.ink3; ctx.lineWidth = 1.4; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(X(70) + 14, y0); ctx.lineTo(xb + 10, y0); ctx.moveTo(X(st.T) + 20, yc); ctx.lineTo(xb + 10, yc); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = COL.ink; ctx.fillStyle = COL.ink; ctx.lineWidth = 2.6;
      if (yc - y0 > 14) arrow(xb, y0 + 2, xb, yc - 2, 10);
      ctx.restore();
      txtBg('shrinks', xb - 16, ym - 18, font(700, 32), COL.ink, 'right', shA);
      txtBg('on cooling', xb - 16, ym + 16, font(400, 30), COL.ink2, 'right', shA);
      txtBg('exaggerated', xb - 16, ym + 50, fontI(400, 30), COL.ink3, 'right', shA);
    }
    // α label drawn after the bracket guide, on a white knock-out, so the moving dashed guide passes behind it
    labA('α', 51, Va(51), COL.alpha, st.heat ? sm((st.T - 48.5) / 1.5) : 1, 36, 26, true);
    // dotted tail: shrinkage continues for minutes–hours after it reaches body temperature (Lee et al. 1997)
    const tailA = seg(t, 14.7, 15.2);
    if (tailA > 0 && !st.heat) {
      const x = X(st.T), ya = Y(st.V) + 19, yb2 = Y(Vb(st.T)) - 2;
      ctx.save(); ctx.globalAlpha *= tailA;
      if (yb2 - ya > 10) {
        ctx.strokeStyle = COL.ink; ctx.fillStyle = COL.ink; ctx.lineWidth = 2.4; ctx.setLineDash([2, 5]); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb2 - 6); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x, yb2); ctx.lineTo(x - 6, yb2 - 9); ctx.lineTo(x + 6, yb2 - 9); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      txt('keeps shrinking', X(37) + 16, PA.y1 - 70, font(600, 30), COL.ink, 'left', tailA);
      txt('for minutes–hours', X(37) + 16, PA.y1 - 36, font(400, 30), COL.ink2, 'left', tailA);
    }
    // pulse rings at each phase flip
    for (const ev of EVENTS) {
      const u = (t - ev.t) / 0.9;
      if (u <= 0 || u >= 1) continue;
      ctx.save(); ctx.globalAlpha *= (1 - u) * 0.8; ctx.strokeStyle = PCOL[ev.to]; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(X(st.T), Y(st.V), 16 + 46 * ease.out(u), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    // the moving dot: colour flips by a radial wipe at each event (never an in-between colour)
    const dotA = seg(t, 0.05, 0.35);
    if (dotA > 0) {
      const dx = X(st.T), dy = Y(st.V);
      let wipe = null;
      for (const ev of EVENTS) { const w = (t - (ev.t - 0.1)) / 0.2; if (w > 0 && w < 1) wipe = { ev, w }; }
      const c = wipe ? (wipe.w < 0.5 ? wipe.ev.from : wipe.ev.to) : st.ph;
      ctx.save(); ctx.globalAlpha *= dotA;
      const g = ctx.createRadialGradient(dx, dy, 4, dx, dy, 42);
      g.addColorStop(0, rgbStr(PRGB[c], 0.3)); g.addColorStop(1, rgbStr(PRGB[c], 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dx, dy, 15.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PCOL[wipe ? wipe.ev.from : c]; ctx.beginPath(); ctx.arc(dx, dy, 11.5, 0, Math.PI * 2); ctx.fill();
      if (wipe) { ctx.fillStyle = PCOL[wipe.ev.to]; ctx.beginPath(); ctx.arc(dx, dy, 11.5 * ease.out(wipe.w), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();

    // temperature readout (fades in at frame 0 and out at the loop so first and last frames match)
    const roA = seg(t, 0, 0.25) * endFade;
    txt(`${Math.round(st.T)} °C`, PA.x0 + 26, PA.y0 + 40, font(600, 52, PLEX), COL.ink, 'left', roA);
    const status = t < 1.0 ? 'room temp.' : st.heat ? (t > 7.75 ? 'peak' : 'heating') : (t < 8.75 ? 'peak' : (st.T < 37.6 ? '≈ body temp.' : 'cooling'));
    txt(status, PA.x0 + 28, PA.y0 + 80, font(500, 30), COL.ink2, 'left', roA);
  }

  // ---------------------------------------------------------------- captions / legend
  const CAPS = [
    [0.15, 2.48, '**As supplied:** mostly {b:β} phase.'],
    [2.75, 5.4, '**~42–49 °C:** {b:β} converts to {a:α}.'],
    [5.67, 8.92, '**~53–59 °C:** {m:amorphous}, flows under pressure.'],
    [9.19, 12.45, '**Cooling rate** picks the crystal; it forms slowly.'],
    [12.72, 15.4, '**Shrinkage.** It contracts as it cools.'],
  ];
  const TAKE = [15.7, L0];
  const TAKE_HEAD = '**Compact while it** {b:cools}**.**';
  const TAKE_SUB = 'Warm techniques: held pressure helps compensate.';
  const FINE1 = 'Schematic · not to scale · time compressed · ranges vary by brand · dots = ZnO filler';
  const SOURCES = [
    [0, 2.55, 'Cones ≈ 8–22 % GP, mostly ZnO (Friedman 1977; Liao 2021) · β form: Combe 2001'],
    [2.55, 5.5, 'Transitions: Schilder et al. 1974 · melt peak ≈60 °C by DSC (Liao et al. 2021)'],
    [5.5, 8.75, 'C: heating is local; apical GP stays ≲45 °C (Goodman 1981; Schilder 1985)'],
    [8.75, 12.45, 'Recrystallisation is slow & product-dependent (Liao 2021; Hsu 2020; Lee 1997)'],
    [12.45, L1, 'Hsu et al. J Dent Sci 2020; Lottanti et al. J Endod 2014; Schilder et al. 1985'],
  ];
  const STATE_C = [
    [0, 2.95, 'solid', COL.beta], [3.15, 5.65, 'softening', COL.alpha], [5.85, 7.15, 'mouldable', COL.amorText],
    [7.3, 8.6, 'compacting', COL.ink], [8.8, 16.7, 'pressure held', COL.ink], [16.9, 21.8, 'adapted', COL.beta],
    [21.75, DUR + 1, 'solid', COL.beta],
  ];
  const windowAlpha = (t, a, b, f = 0.2) => seg(t, a, a + f) * (1 - seg(t, b - f, b));

  function drawStateC(t) {
    for (const [a, b, s, c] of STATE_C) {
      const al = a <= 0 ? 1 - seg(t, b - 0.2, b) : windowAlpha(t, a, b);
      if (al > 0) txt(s, CC.cx, LABEL_Y, font(700, 36), c, 'center', al);
    }
    txt('as it cools', CC.cx, SUB_Y, font(400, 30), COL.ink2, 'center', windowAlpha(t, 8.8, 12.8));
    const ka = windowAlpha(t, 12.95, 16.7, 0.3);
    if (ka > 0) {
      const w = 34 + 10 + 169, x0 = CC.cx - w / 2;
      ctx.save(); ctx.globalAlpha *= ka; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.moveTo(x0, SUB_Y - 10); ctx.lineTo(x0 + 34, SUB_Y - 10); ctx.stroke(); ctx.restore();
      txt('no pressure', x0 + 44, SUB_Y, font(400, 30), COL.ink2, 'left', ka);
    }
  }

  function drawCaptions(t) {
    const y0 = 1458;
    for (const [a, b, s] of CAPS) {
      const inA = seg(t, a - 0.14, a, ease.out), al = inA * (1 - seg(t, b, b + 0.12, ease.in));
      if (al <= 0) continue;
      rich(s, M, y0 + 8 * (1 - inA), 896, 40, 50, al);
    }
    const ta = seg(t, TAKE[0] - 0.16, TAKE[0], ease.out) * (1 - seg(t, L0, L0 + 0.25, ease.in));
    if (ta > 0) {
      const dy = 10 * (1 - seg(t, TAKE[0] - 0.16, TAKE[0], ease.out));
      rich(TAKE_HEAD, M, 1462 + dy, 896, 62, 66, ta);
      txt(TAKE_SUB, M, 1514 + dy, font(400, 36), COL.ink2, 'left', ta);
    }
    txt(FINE1, M, 1550, font(400, 22), COL.fine, 'left');
    for (const [a, b, s] of SOURCES) { const al = windowAlpha(t, a, b); if (al > 0) txt(s, M, 1574, font(400, 22), COL.fine, 'left', al); }
  }

  // ---------------------------------------------------------------- frame
  function render(t) {
    t = clamp(t, 0, DUR);
    const st = state(t), F = focus(t);
    ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);

    // running head + handle (below the 3:4 grid-crop line at y 240)
    rich('**Fig. 1**  |  Endodontic materials', M, 270, 700, 26, 30, 1, COL.ink2);
    Kit.handle(ctx, MR, 262, { align: 'right', color: COL.ink3, font: `500 26px ${SANS}`, alpha: 1 });
    // title + subtitle (the hook: readable from frame 0)
    txt('Why warm GP shrinks', M, 352, font(700, 74), COL.ink, 'left');
    rich('2 crystal forms + melt: {b:β} → {a:α} → {m:amorphous} → {b:β} on cooling', M, 398, 952, 32, 38, 1, COL.ink2);
    ctx.fillStyle = COL.ink; ctx.fillRect(M, 420, MR - M, 2);

    // panel letters + headers
    txt('A', M, 470, font(700, 44), COL.ink);
    txt('Heat, then cool', M + 42, 468, font(500, 30), COL.ink2);
    txt('B', M, 986, font(700, 44), COL.ink);
    txt('trans', M + 42, 984, fontI(500, 30), COL.ink2);
    ctx.font = fontI(500, 30); const wTrans = ctx.measureText('trans').width;
    txt('-1,4-polyisoprene chains', M + 42 + wTrans, 984, font(500, 30), COL.ink2);
    txt('C', 612, 986, font(700, 44), COL.ink);
    txt('In the canal (schematic)', 612 + 40, 984, font(500, 30), COL.ink2);

    inLayer(F.A, { x: 0, y: 436, w: W, h: 516 }, () => drawPanelA(t, st));
    inLayer(F.B, { x: 56, y: 996, w: 550, h: 404 }, () => drawPanelB(t, st));
    inLayer(F.C, { x: 606, y: 990, w: 420, h: 410 }, () => { drawPanelC(t, st); drawStateC(t); });

    ctx.fillStyle = COL.hair; ctx.fillRect(M, 1402, 896, 1.5);
    drawCaptions(t);
  }

  window.REEL = {
    title: 'Why warm GP shrinks',
    duration: DUR,
    poster: 15.3,
    canvas,
    fonts: ['700 74px Inter', '600 30px Inter', '500 30px Inter', 'italic 500 30px Inter', 'italic 400 30px Inter', '400 40px Inter',
      '700 40px Inter', '600 52px "IBM Plex Sans"', '400 30px "IBM Plex Sans"'],
    render,
    _debug: { state, CAPS, plain, EVENTS, focus, V_END, V_HOT, TAKE_HEAD, TAKE_SUB },
  };
  Kit.boot(window.REEL);
})();
