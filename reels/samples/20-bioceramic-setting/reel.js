/*
 * 20 · How a calcium-silicate (bioceramic) sealer sets and forms apatite-like mineral (in vitro)
 * Style: isometric 3-D diorama on a pastel gradient, drawn on canvas 2D with a true isometric projection.
 * Pure render(t): everything is derived from t and seeded tables built once at load.
 */
(() => {
  'use strict';
  const { canvas, ctx } = Kit.createCanvas();
  const { W, H, clamp, lerp, seg, env, ease, rng, hash, noise1 } = Kit;
  const F = '"Space Grotesk", "DejaVu Sans", sans-serif';
  const ISO = 0.8660254, SPH = 1.2247449; // iso x-factor; projected radius of a unit sphere

  // ---------------------------------------------------------------- timeline
  const T1 = 3.4, T2 = 7.3, T3 = 10.9, T4 = 15.1, T5 = 18.9, DUR = 24;

  // ---------------------------------------------------------------- palette
  const C = {
    ink: '#1b2045', ink2: '#454c7a', mute: '#5d6390',
    plinT: '#f6f3fd', plinL: '#e1dbf2', plinR: '#cfc6e8',
    denT: '#f8eedb', denL: '#efdcbb', denR: '#ddc59c',
    tubD: '#a9895d', tubM: '#c9ab7f', tubL: '#ead8b6',
    fluD: '#3e9fe0', fluL: '#9ad6fb',
    grain: '#5b6ae0', grainHi: '#b3bcff', grainLo: '#323d9e',
    grainH: '#7d7de8', grainHHi: '#e2e0ff', grainHLo: '#4b4aa6',
    csh: '#a28aff', cshHi: '#f1ecff',
    chT: '#fff4cf', chL: '#f6dc96', chR: '#e3bf63',
    water: '#ff5b5b', waterHi: '#ffc2c2', waterLo: '#c93636',
    ca: '#16b886', caHi: '#9ff3d4', caLo: '#0b7d5a',
    oh: '#3a5bd9', ohHi: '#bfcdff', ohLo: '#1f358f',
    poL: '#ffbd6b', poR: '#f08a24', poD: '#c96a12',
    apW: '#ffffff', apM: '#cdf3ea', apE: '#6cc9b6',
    s1: '#2f86e6', s2: '#7656f0', s3: '#0fa577', s4: '#ea7f16',
    // text-only variants with >= 3.6:1 contrast on the pale background (particles keep the bright colours)
    tCa: '#087a57', tPo: '#b35500', tOh: '#3a5bd9', tKick: '#5a3fd8',
  };

  // ---------------------------------------------------------------- geometry (world units)
  const DX = 6.4, DY = 4.4, DZ = 2.0, SZ = 1.4, ZT = DZ + SZ, TR = 0.18;
  const FL = [0.6, 1.5, 2.4, 3.3, 4.2, 5.1, 6.0];   // channels cut in the y = DY face (x positions)
  const FR = [0.62, 1.55, 2.48, 3.42];               // channels cut in the x = DX face (y positions)
  const channels = [
    ...FL.map((x) => ({ face: 'L', x, y: DY })),
    ...FR.map((y) => ({ face: 'R', x: DX, y })),
  ];
  // tag depth per channel (0 = no tag in that tubule): irregular and shallow, like the "tag-like structures"
  const TAG = [0.42, 0.3, 0, 0.22, 0, 0.46, 0.27, 0.36, 0, 0.24, 0.4];
  const openings = [];
  [0.55, 1.45, 2.35, 3.25, 4.05].forEach((y, j) => {
    for (let i = 0; i < 8; i++) { const x = 0.55 + i * 0.9 + (j % 2) * 0.45; if (x <= 6.05) openings.push({ x, y }); }
  });

  // ---------------------------------------------------------------- camera
  // base camera (zoom 1) is shifted 10 px left so the plinth corner clears the IG button column;
  // moves are composed as screen-space scales about pivots.
  const S0 = 86, OX0 = 455.5, OY0 = 818;
  let S = S0, OX = OX0, OY = OY0, ZOOM = 1, CAM = { sc: 1, tx: 0, ty: 0 };
  function camReset() { CAM = { sc: 1, tx: 0, ty: 0 }; }
  function camScale(s, px, py) { CAM = { sc: CAM.sc * s, tx: px + s * (CAM.tx - px), ty: py + s * (CAM.ty - py) }; }
  function camApply() { ZOOM = CAM.sc; S = S0 * CAM.sc; OX = OX0 * CAM.sc + CAM.tx; OY = OY0 * CAM.sc + CAM.ty; }
  const P = (X, Y, Z) => [OX + (X - Y) * ISO * S, OY + (X + Y) * 0.5 * S - Z * S];
  const PV = (dx, dy, dz) => [(dx - dy) * ISO, (dx + dy) * 0.5 - dz];       // projected direction (unit length ≤ 1.22)
  const VIEW = (dx, dy, dz) => (dx + dy + dz) * 0.57735;                    // >0 = towards viewer

  // ---------------------------------------------------------------- seeded scene tables
  const R = rng(2005), RF = rng(77), RB = rng(91);
  const grains = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
    grains.push({ x: 0.62 + i * 0.98 + (R() - 0.5) * 0.22 + (j % 2) * 0.22, y: 0.62 + j * 1.04 + (R() - 0.5) * 0.18, z: DZ + 0.44, r: 0.3 + R() * 0.07, layer: 0 });
  }
  // a few small grains resting on top of bottom-layer grains: on screen they fall into the gaps (no "snowmen")
  [1, 3, 8, 10, 13, 15, 16, 20, 22].forEach((gi) => {
    const g = grains[gi], r = 0.16 + R() * 0.05;
    grains.push({ x: g.x + 0.49 + (R() - 0.5) * 0.06, y: g.y + (R() - 0.5) * 0.06, z: g.z + 0.3, r, layer: 1 });
  });
  grains.forEach((g, i) => {
    g.i = i;
    g.appear = 0.45 + 1.25 * ((g.x + g.y) / 11 * 0.6 + R() * 0.4) + g.layer * 0.25;
    g.h0 = T2 + 0.1 + g.layer * 0.8 + R() * 0.75;
    g.fib = [];
    for (let k = 0; k < 40; k++) {
      const u = RF() * 2 - 1, a = RF() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      g.fib.push({ d: [s * Math.cos(a), s * Math.sin(a), u], L: 0.18 + RF() * 0.22, bend: (RF() - 0.5) * 0.6 });
    }
    g.hits = [];
  });
  const nearestGrain = (x, y, z, layer) => {
    let best = null, bd = 1e9;
    for (const g of grains) { if (layer != null && g.layer !== layer) continue; const d = (g.x - x) ** 2 + (g.y - y) ** 2 + (g.z - z) ** 2; if (d < bd) { bd = d; best = g; } }
    return best;
  };
  // gel bridges between neighbouring grains (a mesh, so C–S–H reads as a matrix, not as spiky particles)
  const bridges = [];
  for (let a = 0; a < grains.length; a++) for (let b = a + 1; b < grains.length; b++) {
    const A = grains[a], B = grains[b];
    const d = Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z);
    if (d < 1.3) for (let k = 0; k < 6; k++) bridges.push({ A, B, bulge: [(RB() - 0.5) * 0.36, (RB() - 0.5) * 0.36, (RB() - 0.5) * 0.28], o: RB() });
  }
  // Ca(OH)2 plates in the pores
  const plates = [];
  for (let tries = 0; tries < 600 && plates.length < 13; tries++) {
    const p = { x: 0.45 + R() * 5.6, y: 0.45 + R() * 3.5, z: DZ + 0.25 + R() * 0.95 };
    let ok = true;
    for (const g of grains) if (Math.hypot(g.x - p.x, g.y - p.y, g.z - p.z) < g.r + 0.3) { ok = false; break; }
    for (const q of plates) if (Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) < 0.85) { ok = false; break; }
    if (ok) { p.rad = 0.17 + R() * 0.08; p.rot = R() * Math.PI; p.t0 = T2 + 1.3 + R() * 2.0; plates.push(p); }
  }

  // water molecules: up the channels or out of interior openings, into a grain
  const waters = [];
  channels.forEach((c, k) => {
    const n = k % 3 === 0 ? 2 : 1;
    for (let m = 0; m < n; m++) {
      const top = c.face === 'L' ? [c.x, DY - 0.05, DZ] : [DX - 0.05, c.y, DZ];
      const g = nearestGrain(top[0], top[1], DZ + 0.4, 0);
      const ts = T1 + 0.2 + R() * 1.7 + m * 0.7;
      waters.push({ kind: 'ch', c, top, g, ts, d1: 1.05 + R() * 0.3, d2: 0.75 + R() * 0.2, sd: R() * 100 });
    }
  });
  openings.forEach((o) => {
    if (R() < 0.3) return;
    const g = nearestGrain(o.x, o.y, DZ + 0.4, 0);
    waters.push({ kind: 'op', o, g, ts: T1 + 0.8 + R() * 2.1, d2: 0.9 + R() * 0.3, sd: R() * 100 });
  });
  waters.forEach((w) => {
    const from = w.kind === 'ch' ? w.top : [w.o.x, w.o.y, DZ];
    const dx = from[0] - w.g.x, dy = from[1] - w.g.y, dz = from[2] - w.g.z, dl = Math.hypot(dx, dy, dz) || 1;
    w.end = [w.g.x + dx / dl * w.g.r * 0.95, w.g.y + dy / dl * w.g.r * 0.95, w.g.z + dz / dl * w.g.r * 0.95];
    w.ta = w.ts + (w.kind === 'ch' ? w.d1 : 0) + w.d2;
    w.g.hits.push(w.ta);
  });

  // ions released in step 3
  const sources = [...plates.map((p) => [p.x, p.y, p.z]), ...grains.filter((g, i) => i % 3 === 0).map((g) => [g.x, g.y, g.z + g.r * 0.6])];
  const ions = [];
  let si = 0;
  const src = () => sources[(si++ * 7) % sources.length];
  // channel-bound Ca2+ (wait in the tubule mouth for phosphate); tubules without a tag get none
  channels.forEach((c, k) => {
    if (!TAG[k]) { R(); R(); return; }
    for (let m = 0; m < 2; m++) {
      const s0 = src();
      ions.push({ sp: 'ca', kind: 'ch', c, k, s0, tb: T3 + 0.15 + R() * 2.0, zEnd: 1.92 - m * 0.2 - R() * 0.1, sd: R() * 100 });
    }
    if (k % 2 === 0) ions.push({ sp: 'oh', kind: 'ch', c, k, s0: src(), tb: T3 + 0.4 + R() * 2.0, zEnd: 1.5 - R() * 0.3, sd: R() * 100 });
  });
  // escaping ions (leave the sealer through the top / front faces)
  for (let m = 0; m < 30; m++) {
    const s0 = src();
    const side = m % 3;
    const e = side === 0 ? [s0[0] + (R() - 0.5) * 1.2, s0[1] + (R() - 0.5) * 1.2, ZT + 0.2 + R() * 0.35]
      : side === 1 ? [s0[0] + (R() - 0.5) * 0.8, DY + 0.5 + R() * 0.5, s0[2] + (R() - 0.3) * 0.5]
        : [DX + 0.5 + R() * 0.5, s0[1] + (R() - 0.5) * 0.8, s0[2] + (R() - 0.3) * 0.5];
    ions.push({ sp: m % 5 < 3 ? 'oh' : 'ca', kind: 'esc', s0, e, tb: T3 + 0.1 + R() * 3.0, sd: R() * 100 });
  }
  // interface Ca2+ (settle on the dentin surface near openings)
  const opClusters = openings.map((o) => ({ ...o, e: T4 + 0.55 + R() * 1.9, n: 6, seeds: Array.from({ length: 7 }, () => [R(), R(), R()]) }));
  opClusters.forEach((o, i) => {
    if (i % 2) return;
    ions.push({ sp: 'ca', kind: 'if', s0: src(), e: [o.x + (R() - 0.5) * 0.25, o.y + (R() - 0.5) * 0.25, DZ + 0.1 + R() * 0.08], tb: T3 + 0.3 + R() * 2.4, consume: o.e, sd: R() * 100 });
  });
  // phosphate rising up the channels in step 4 (route schematic: in the lab the whole specimen sat in PBS)
  const phos = [];
  const chanEvent = channels.map(() => 99);
  channels.forEach((c, k) => {
    if (!TAG[k]) return;
    for (let m = 0; m < 2; m++) {
      const tp = T4 + 0.05 + R() * 0.8 + m * 0.4;
      const d = 1.0 + R() * 0.2;
      phos.push({ c, k, tp, d, zEnd: 1.6 + R() * 0.15, sd: R() * 100 });
      chanEvent[k] = Math.min(chanEvent[k], tp + d);
    }
  });
  const opPhos = opClusters.filter((o, i) => i % 2 === 1).map((o) => ({ o, tp: o.e - 0.5 }));
  // surface crystal clusters between openings
  const surfClusters = [];
  for (let tries = 0; tries < 400 && surfClusters.length < 20; tries++) {
    const p = { x: 0.3 + R() * 5.8, y: 0.3 + R() * 3.9 };
    if (openings.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < 0.35)) continue;
    if (surfClusters.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 0.6)) continue;
    p.e = T4 + 0.9 + R() * 2.0; p.n = 4; p.seeds = Array.from({ length: 5 }, () => [R(), R(), R()]);
    surfClusters.push(p);
  }
  const film = Array.from({ length: 70 }, () => ({ x: 0.15 + R() * 6.1, y: 0.15 + R() * 4.1, r: 0.03 + R() * 0.05, t: R() }));

  // ---------------------------------------------------------------- drawing primitives
  function poly(pts, fill, stroke, lw) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  }
  function lgrad(a, b, stops) { const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function sphere(x, y, r, base, hi, lo, a = 1) {
    if (r <= 0.3) return;
    ctx.save(); ctx.globalAlpha *= a;
    const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.05, x - r * 0.1, y - r * 0.1, r * 1.25);
    g.addColorStop(0, hi); g.addColorStop(0.42, base); g.addColorStop(1, lo);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha *= 0.75; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x - r * 0.36, y - r * 0.42, r * 0.22, r * 0.15, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function isoEllipse(X, Y, Z, r) { const [x, y] = P(X, Y, Z); ctx.beginPath(); ctx.ellipse(x, y, r * SPH * S, r * 0.7071 * S, 0, 0, Math.PI * 2); }
  function waterMol(x, y, k, ang, a = 1) {
    const rO = 0.125 * SPH * S * k, rH = 0.078 * SPH * S * k;
    for (const s of [-1, 1]) {
      const aa = ang + s * 0.92;
      const hx = x + Math.cos(aa) * rO * 0.98, hy = y + Math.sin(aa) * rO * 0.98;
      ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(60,70,120,0.35)'; ctx.beginPath(); ctx.arc(hx, hy, rH + 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      sphere(hx, hy, rH, '#f4f6ff', '#ffffff', '#aab1d6', a);
    }
    sphere(x, y, rO, C.water, C.waterHi, C.waterLo, a);
  }
  function ohIon(x, y, k, ang, a = 1) {
    const rO = 0.115 * SPH * S * k, rH = 0.07 * SPH * S * k;
    sphere(x + Math.cos(ang) * rO * 0.95, y + Math.sin(ang) * rO * 0.95, rH, '#f4f6ff', '#ffffff', '#b9bfdc', a);
    sphere(x, y, rO, C.oh, C.ohHi, C.ohLo, a);
  }
  function caIon(x, y, k, a = 1) { sphere(x, y, 0.115 * SPH * S * k, C.ca, C.caHi, C.caLo, a); }
  function tetra(x, y, k, a = 1) {
    const s = 0.15 * S * k; if (s < 0.5) return;
    ctx.save(); ctx.globalAlpha *= a;
    const ap = [x, y - s * 1.05], l = [x - s, y + s * 0.45], r = [x + s, y + s * 0.45], f = [x + s * 0.12, y + s * 0.8];
    poly([ap, l, f], C.poL); poly([ap, f, r], C.poR);
    poly([ap, l, f, r], null, 'rgba(120,60,0,0.35)', 1.2);
    ctx.restore();
  }
  function needle(b, tp, w, a = 1) {
    let dx = tp[0] - b[0], dy = tp[1] - b[1]; const L = Math.hypot(dx, dy); if (L < 0.8) return;
    dx /= L; dy /= L; const nx = -dy, ny = dx, hw = w / 2;
    const tip = [tp[0] + dx * w * 0.7, tp[1] + dy * w * 0.7];
    ctx.save(); ctx.globalAlpha *= a;
    poly([b, [b[0] + nx * hw, b[1] + ny * hw], [tp[0] + nx * hw, tp[1] + ny * hw], tip], C.apW);
    poly([b, tip, [tp[0] - nx * hw, tp[1] - ny * hw], [b[0] - nx * hw, b[1] - ny * hw]], C.apM);
    poly([[b[0] + nx * hw, b[1] + ny * hw], [tp[0] + nx * hw, tp[1] + ny * hw], tip, [tp[0] - nx * hw, tp[1] - ny * hw], [b[0] - nx * hw, b[1] - ny * hw]], null, C.apE, 1.1);
    ctx.restore();
  }
  function hexPlate(X, Y, Z, rad, th, rot, k = 1, a = 1) {
    if (k <= 0.01) return;
    const rr = rad * k, tt = th * Math.max(0.3, k);
    const top = [], bot = [];
    for (let i = 0; i < 6; i++) {
      const an = rot + i * Math.PI / 3;
      top.push(P(X + Math.cos(an) * rr, Y + Math.sin(an) * rr, Z + tt));
      bot.push(P(X + Math.cos(an) * rr, Y + Math.sin(an) * rr, Z));
    }
    ctx.save(); ctx.globalAlpha *= a;
    for (let i = 0; i < 6; i++) {
      const j = (i + 1) % 6, mid = rot + (i + 0.5) * Math.PI / 3, nx = Math.cos(mid), ny = Math.sin(mid);
      if (nx + ny <= 0) continue;
      poly([top[i], top[j], bot[j], bot[i]], ny > nx ? C.chL : C.chR);
    }
    poly(top, C.chT, 'rgba(170,120,30,0.45)', 1.2);
    ctx.restore();
  }

  // ---------------------------------------------------------------- rich text (sub/sup, colour spans, drawn arrows)
  function parseRich(str) {
    const runs = [], stack = [null]; let buf = '', i = 0;
    const push = () => { if (buf) runs.push({ t: buf, m: 'n', c: stack[stack.length - 1] }); buf = ''; };
    while (i < str.length) {
      const ch = str[i];
      if (ch === '[') { const j = str.indexOf(']', i); const tag = str.slice(i + 1, j); push(); if (tag === '/') stack.pop(); else stack.push(tag); i = j + 1; continue; }
      if ((ch === '^' || ch === '_') && str[i + 1] === '{') { push(); const j = str.indexOf('}', i); runs.push({ t: str.slice(i + 2, j), m: ch === '^' ? 'sup' : 'sub', c: stack[stack.length - 1] }); i = j + 1; continue; }
      if (ch === '→') { push(); runs.push({ t: '→', m: 'arrow', c: stack[stack.length - 1] }); i++; continue; }
      buf += ch; i++;
    }
    push();
    return runs;
  }
  function runFont(m, size, weight) { return `${weight} ${m === 'sub' || m === 'sup' ? Math.round(size * 0.62) : size}px ${F}`; }
  function runsWidth(runs, size, weight) {
    let w = 0;
    for (const r of runs) { if (r.m === 'arrow') { w += size * 0.95; continue; } ctx.font = runFont(r.m, size, weight); w += ctx.measureText(r.t).width; }
    return w;
  }
  function drawRuns(runs, x, y, size, weight, color) {
    for (const r of runs) {
      const col = r.c || color;
      if (r.m === 'arrow') {
        const aw = size * 0.95, cy = y - size * 0.3;
        ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(2, size * 0.075); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + aw * 0.14, cy); ctx.lineTo(x + aw * 0.7, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + aw * 0.86, cy); ctx.lineTo(x + aw * 0.56, cy - size * 0.2); ctx.lineTo(x + aw * 0.56, cy + size * 0.2); ctx.closePath(); ctx.fill();
        ctx.restore(); x += aw; continue;
      }
      ctx.font = runFont(r.m, size, weight); ctx.fillStyle = col;
      const dy = r.m === 'sub' ? size * 0.2 : r.m === 'sup' ? -size * 0.36 : 0;
      ctx.fillText(r.t, x, y + dy); x += ctx.measureText(r.t).width;
    }
    return x;
  }
  /** draws multi-line rich text; o: {size, weight, color, align, lh, maxW}. returns {w, size} */
  function rich(str, x, y, o) {
    const lines = str.split('\n').map(parseRich);
    let size = o.size;
    if (o.maxW) { const mw = Math.max(...lines.map((l) => runsWidth(l, size, o.weight))); if (mw > o.maxW) size = Math.floor(size * o.maxW / mw); }
    const lh = (o.lh || 1.18) * size;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    let maxw = 0;
    lines.forEach((l, i) => {
      const w = runsWidth(l, size, o.weight); maxw = Math.max(maxw, w);
      const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
      drawRuns(l, x0, y + i * lh, size, o.weight, o.color);
    });
    return { w: maxw, size, h: lines.length * lh };
  }

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function pill(x, y, w, h, fill, shadowA = 0.16, rad) {
    ctx.save();
    ctx.shadowColor = `rgba(58,44,130,${shadowA})`; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    rr(x, y, w, h, rad != null ? rad : h / 2); ctx.fillStyle = fill; ctx.fill();
    ctx.restore();
  }
  /** centred lines of plain text that shrink to fit maxW */
  function fitLine(txt, x, y, size, weight, color, maxW) {
    ctx.font = `${weight} ${size}px ${F}`;
    const w = ctx.measureText(txt).width;
    if (w > maxW) ctx.font = `${weight} ${Math.floor(size * maxW / w)}px ${F}`;
    ctx.fillStyle = color; ctx.fillText(txt, x, y);
  }

  // ---------------------------------------------------------------- static sprites (built in setup)
  let bg = null, floorShadow = null, contactShadow = null, loopImg = null, CAMT = [1, 0, 0];
  function buildSprites() {
    bg = document.createElement('canvas'); bg.width = W; bg.height = H;
    const b = bg.getContext('2d');
    const g = b.createLinearGradient(0, 0, W * 0.35, H);
    g.addColorStop(0, '#bfe3fc'); g.addColorStop(0.55, '#ccd3f8'); g.addColorStop(1, '#ddcbf5');
    b.fillStyle = g; b.fillRect(0, 0, W, H);
    const rg = b.createRadialGradient(540, 930, 40, 540, 930, 760);
    rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    b.fillStyle = rg; b.fillRect(0, 0, W, H);
    // isometric dot lattice
    b.fillStyle = 'rgba(70,60,150,0.10)';
    for (let i = -30; i <= 30; i++) for (let j = -30; j <= 30; j++) {
      const x = 465.5 + (i - j) * ISO * 86 * 0.5, y = 818 + (i + j) * 0.5 * 86 * 0.5 + 30;
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      b.beginPath(); b.arc(x, y, 2.2, 0, Math.PI * 2); b.fill();
    }
    // soft floor shadow (base camera)
    floorShadow = document.createElement('canvas'); floorShadow.width = W; floorShadow.height = H;
    const f = floorShadow.getContext('2d');
    camReset(); camApply();
    f.filter = 'blur(26px)';
    f.fillStyle = 'rgba(60,40,140,0.30)';
    const sh = [P(-0.1, -0.1, -0.36), P(DX + 0.5, -0.1, -0.36), P(DX + 0.6, DY + 0.75, -0.36), P(-0.1, DY + 0.6, -0.36)].map(([x, y]) => [x + 18, y + 26]);
    f.beginPath(); f.moveTo(...sh[0]); sh.slice(1).forEach((p) => f.lineTo(...p)); f.closePath(); f.fill();
    f.filter = 'none';
    contactShadow = document.createElement('canvas'); contactShadow.width = W; contactShadow.height = H;
    const cs = contactShadow.getContext('2d');
    cs.filter = 'blur(9px)'; cs.fillStyle = 'rgba(70,50,140,0.32)';
    const cp = [P(0.05, 0.05, 0), P(DX + 0.12, 0.05, 0), P(DX + 0.15, DY + 0.22, 0), P(0.05, DY + 0.18, 0)];
    cs.beginPath(); cs.moveTo(...cp[0]); cp.slice(1).forEach((p) => cs.lineTo(...p)); cs.closePath(); cs.fill();
  }

  // ---------------------------------------------------------------- scene drawing
  function drawPlinth() {
    const x0 = -0.3, y0 = -0.22, x1 = DX + 0.15, y1 = DY + 0.3, z0 = -0.38, z1 = 0;
    const top = [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)];
    const left = [P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0)];
    const right = [P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0), P(x1, y0, z0)];
    poly(top, C.plinT); poly(left, C.plinL); poly(right, C.plinR);
    // contact shadow of the dentin block on the plinth (pre-blurred sprite, follows the camera)
    ctx.save(); ctx.setTransform(CAMT[0], 0, 0, CAMT[0], CAMT[1], CAMT[2]); ctx.drawImage(contactShadow, 0, 0); ctx.restore();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(...left[3]); ctx.lineTo(...left[0]); ctx.lineTo(...top[0]); ctx.lineTo(...top[1]); ctx.lineTo(...right[3]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...left[0]); ctx.lineTo(...left[1]); ctx.lineTo(...right[0]); ctx.moveTo(...left[1]); ctx.lineTo(...left[2]); ctx.stroke();
  }

  function chanStrip(c, za, zb, wFrac = 1) {
    const r = TR * wFrac;
    if (c.face === 'L') return [P(c.x - r, DY, zb), P(c.x + r, DY, zb), P(c.x + r, DY, za), P(c.x - r, DY, za)];
    return [P(DX, c.y + r, zb), P(DX, c.y - r, zb), P(DX, c.y - r, za), P(DX, c.y + r, za)];
  }
  const chanPt = (c, z, off = 0) => (c.face === 'L' ? P(c.x + off, DY, z) : P(DX, c.y - off, z));

  function drawDentine(t, dz, fluid) {
    const top = [P(0, 0, dz), P(DX, 0, dz), P(DX, DY, dz), P(0, DY, dz)];
    const left = [P(0, DY, dz), P(DX, DY, dz), P(DX, DY, 0), P(0, DY, 0)];
    const right = [P(DX, 0, dz), P(DX, DY, dz), P(DX, DY, 0), P(DX, 0, 0)];
    poly(top, lgrad(P(0, 0, dz), P(DX, DY, dz), [[0, '#fbf3e3'], [1, C.denT]]));
    poly(left, lgrad(P(0, DY, dz), P(0, DY, 0), [[0, C.denL], [1, '#e2cba3']]));
    poly(right, lgrad(P(DX, 0, dz), P(DX, 0, 0), [[0, C.denR], [1, '#cfb486']]));
    // faint incremental lines on the faces (dentin texture)
    ctx.save(); ctx.strokeStyle = 'rgba(150,110,60,0.10)'; ctx.lineWidth = 1.2;
    for (let z = 0.25; z < dz - 0.1; z += 0.33) {
      ctx.beginPath(); ctx.moveTo(...P(0, DY, z)); ctx.lineTo(...P(DX, DY, z)); ctx.lineTo(...P(DX, 0, z)); ctx.stroke();
    }
    ctx.restore();
    // tubule openings on the top face
    for (const o of openings) {
      isoEllipse(o.x, o.y, dz, TR); ctx.fillStyle = C.tubD; ctx.fill();
      isoEllipse(o.x + 0.03, o.y + 0.03, dz, TR * 0.78);
      ctx.fillStyle = fluid > 0.6 ? Kit.rgba(Kit.mix(C.tubM, C.fluD, seg(fluid, 0.6, 1)), 1) : C.tubM; ctx.fill();
    }
    // cut channels on the two visible faces
    const lvl = fluid * dz;
    for (const c of channels) {
      const st = chanStrip(c, 0, dz);
      const l = c.face === 'L' ? P(c.x - TR, DY, dz) : P(DX, c.y + TR, dz), r = c.face === 'L' ? P(c.x + TR, DY, dz) : P(DX, c.y - TR, dz);
      const lh = [l[0], 0], rh = [r[0], 0];
      poly(st, lgrad(lh, rh, [[0, C.tubD], [0.5, C.tubM], [1, C.tubL]]));
      if (lvl > 0.01) {
        poly(chanStrip(c, 0, lvl), lgrad(lh, rh, [[0, Kit.rgba(C.fluD, 0.85)], [0.45, Kit.rgba('#6bbcf2', 0.85)], [1, Kit.rgba(C.fluL, 0.9)]]));
        const m1 = chanPt(c, lvl, -TR), m2 = chanPt(c, lvl, TR);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...m1); ctx.lineTo(...m2); ctx.stroke();
      }
      // half-opening notch on the top face
      const pts = [];
      for (let k = 0; k <= 10; k++) { const th = Math.PI * k / 10; pts.push(c.face === 'L' ? P(c.x + TR * Math.cos(th), DY - TR * Math.sin(th), dz) : P(DX - TR * Math.sin(th), c.y + TR * Math.cos(th), dz)); }
      poly(pts, lvl >= dz - 0.02 ? C.fluD : C.tubD);
    }
    // ambient occlusion at the base of the faces
    poly([P(0, DY, 0.35), P(DX, DY, 0.35), P(DX, DY, 0), P(0, DY, 0)], lgrad(P(0, DY, 0.35), P(0, DY, 0), [[0, 'rgba(80,50,20,0)'], [1, 'rgba(80,50,20,0.16)']]));
    poly([P(DX, 0, 0.35), P(DX, DY, 0.35), P(DX, DY, 0), P(DX, 0, 0)], lgrad(P(DX, 0, 0.35), P(DX, 0, 0), [[0, 'rgba(80,50,20,0)'], [1, 'rgba(80,50,20,0.18)']]));
    // edge highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...left[0]); ctx.lineTo(...left[1]); ctx.lineTo(...right[0]); ctx.moveTo(...left[1]); ctx.lineTo(...left[2]); ctx.stroke();
  }

  // ---- per-frame state helpers
  const hyd = (g, t) => ease.inOut(seg(t, g.h0, g.h0 + 2.4));
  const plateK = (p, t) => ease.outBack(seg(t, p.t0, p.t0 + 0.7)) * (1 - 0.22 * seg(t, T3, T4 + 1));
  let WF = 0, WFA = 0; // water-front height (0..1) and its alpha, set per frame

  function grainDraw(g, t, appearK) {
    const h = hyd(g, t);
    const drop = (1 - ease.out(appearK)) * 0.55;
    const [sx, sy] = P(g.x, g.y, g.z + drop);
    const Rpx = g.r * SPH * S * ease.outBack(appearK);
    if (Rpx < 0.5) return;
    const coreR = Rpx * (1 - 0.22 * h);
    // soft gel rim
    if (h > 0.01) {
      const rO = coreR + Rpx * 0.55 * h;
      const hg = ctx.createRadialGradient(sx, sy, coreR * 0.85, sx, sy, rO);
      hg.addColorStop(0, `rgba(176,156,255,${0.2 * h})`); hg.addColorStop(1, 'rgba(176,156,255,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(sx, sy, rO, 0, Math.PI * 2); ctx.fill();
    }
    const fib = (front) => {
      if (h <= 0.01) return;
      ctx.lineCap = 'round';
      for (const f of g.fib) {
        const v = VIEW(...f.d);
        if ((v >= 0) !== front) continue;
        const [px, py] = PV(...f.d);
        const L = f.L * Rpx * h;
        const ax = sx + px * coreR / SPH, ay = sy + py * coreR / SPH;
        const bx = sx + px * (coreR + L) / SPH, by = sy + py * (coreR + L) / SPH;
        const mx = (ax + bx) / 2 - py * f.bend * L * 0.5, my = (ay + by) / 2 + px * f.bend * L * 0.5;
        ctx.strokeStyle = front ? 'rgba(162,138,255,0.95)' : 'rgba(150,126,240,0.5)'; ctx.lineWidth = (front ? 2.2 : 1.8) * ZOOM;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(mx, my, bx, by); ctx.stroke();
      }
    };
    fib(false);
    // water hits: soft ring
    for (const th of g.hits) {
      const u = (t - th) / 0.5;
      if (u > 0 && u < 1) { ctx.strokeStyle = `rgba(62,159,224,${0.7 * (1 - u)})`; ctx.lineWidth = 3 * ZOOM; ctx.beginPath(); ctx.arc(sx, sy, coreR * (1 + 0.5 * u), 0, Math.PI * 2); ctx.stroke(); }
    }
    const base = Kit.rgba(Kit.mix(C.grain, C.grainH, h)), hi = Kit.rgba(Kit.mix(C.grainHi, C.grainHHi, h)), lo = Kit.rgba(Kit.mix(C.grainLo, C.grainHLo, h));
    sphere(sx, sy, coreR, base, hi, lo);
    // blue rim as the soaking water front passes this grain
    if (WFA > 0 && WF > 0) {
      const zt = DZ + SZ * 0.96 * WF, d = Math.abs(g.z - zt);
      if (d < 0.32) {
        ctx.save(); ctx.strokeStyle = `rgba(62,159,224,${0.85 * (1 - d / 0.32) * WFA})`; ctx.lineWidth = 3.5 * ZOOM;
        ctx.beginPath(); ctx.arc(sx, sy, coreR + 1.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }
    fib(true);
  }

  function bridgeDraw(b, t) {
    const a = clamp((Math.min(hyd(b.A, t), hyd(b.B, t)) - 0.45 - b.o * 0.15) / 0.35);
    if (a <= 0) return;
    const A = b.A, B = b.B;
    const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z, d = Math.hypot(dx, dy, dz);
    const p0 = P(A.x + dx / d * A.r * 0.75, A.y + dy / d * A.r * 0.75, A.z + dz / d * A.r * 0.75);
    const p1 = P(B.x - dx / d * B.r * 0.75, B.y - dy / d * B.r * 0.75, B.z - dz / d * B.r * 0.75);
    const m = P((A.x + B.x) / 2 + b.bulge[0], (A.y + B.y) / 2 + b.bulge[1], (A.z + B.z) / 2 + b.bulge[2]);
    ctx.strokeStyle = `rgba(160,136,250,${0.5 * a})`; ctx.lineWidth = 1.5 * ZOOM; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...p0); ctx.quadraticCurveTo(m[0], m[1], p1[0], p1[1]); ctx.stroke();
  }

  function cluster(o, t, up, scaleL) {
    const out = [];
    const u0 = seg(t, o.e, o.e + 1.6);
    if (u0 <= 0) return out;
    for (let i = 0; i < o.n; i++) {
      const s = o.seeds[i];
      const gu = ease.out(seg(t, o.e + s[2] * 0.6, o.e + s[2] * 0.6 + 1.4));
      if (gu <= 0) continue;
      const az = s[0] * Math.PI * 2, tilt = 0.25 + s[1] * 0.55;
      const d = [Math.cos(az) * Math.sin(tilt), Math.sin(az) * Math.sin(tilt), Math.cos(tilt) * (up ? 1 : -1)];
      const L = (0.14 + s[1] * 0.22) * scaleL * gu;
      const bx = o.x + Math.cos(az) * 0.06, by = o.y + Math.sin(az) * 0.06;
      out.push({ depth: bx + by + DZ + d[2] * L * 0.5, draw: () => needle(P(bx, by, DZ), P(bx + d[0] * L, by + d[1] * L, DZ + d[2] * L), 7 * ZOOM) });
    }
    return out;
  }

  // ion position along its path at t (null if not alive)
  function ionState(io, t) {
    const u = (t - io.tb);
    if (u < 0) return null;
    const wob = (k) => noise1(t * 1.3 + io.sd + k * 17, 3) * 0.05;
    if (io.kind === 'ch') {
      const c = io.c;
      const top = c.face === 'L' ? [c.x, DY - 0.06, DZ + 0.05] : [DX - 0.06, c.y, DZ + 0.05];
      const d1 = 0.8, d2 = 1.3;
      let pos, inChan = false;
      if (u < d1) { const e = ease.inOut(u / d1); pos = [lerp(io.s0[0], top[0], e), lerp(io.s0[1], top[1], e), lerp(io.s0[2], top[2], e)]; }
      else { const e = ease.out(clamp((u - d1) / d2)); pos = [top[0], top[1], lerp(top[2], io.zEnd, e) + wob(1) * 0.6]; inChan = true; }
      const end = io.sp === 'ca' ? chanEvent[io.k] : T4 + 2.6;
      const a = Math.min(seg(u, 0, 0.25), 1 - seg(t, end, end + 0.35));
      if (a <= 0) return null;
      return { pos, a, inChan };
    }
    if (io.kind === 'esc') {
      const d = 2.3, e = ease.out(clamp(u / d));
      const pos = [lerp(io.s0[0], io.e[0], e) + wob(1), lerp(io.s0[1], io.e[1], e) + wob(2), lerp(io.s0[2], io.e[2], e) + wob(3)];
      const a = Math.min(seg(u, 0, 0.25), 1 - seg(u, d * 0.7, d));
      if (a <= 0) return null;
      return { pos, a };
    }
    // interface ion
    const d = 1.8, e = ease.out(clamp(u / d));
    const pos = [lerp(io.s0[0], io.e[0], e) + wob(1), lerp(io.s0[1], io.e[1], e) + wob(2), lerp(io.s0[2], io.e[2], e)];
    const a = Math.min(seg(u, 0, 0.25), 1 - seg(t, io.consume, io.consume + 0.3));
    if (a <= 0) return null;
    return { pos, a };
  }
  function ionDraw(io, x, y, a, t, k) {
    if (io.sp === 'ca') caIon(x, y, k, a); else ohIon(x, y, k, io.sd + t * 1.5, a);
  }

  // ---------------------------------------------------------------- UI pieces
  /** labelled pointer pill; txt may use rich markup; optional 26 px sub-line */
  function callout(txt, anchor, lx, ly, a, col, sub) {
    if (a <= 0.001) return;
    ctx.save(); ctx.globalAlpha = a;
    const runs = parseRich(txt);
    const tw = runsWidth(runs, 32, 600);
    let sw = 0;
    if (sub) { ctx.font = `500 26px ${F}`; sw = ctx.measureText(sub).width; }
    const w = Math.max(tw, sw) + 66, h = sub ? 90 : 54;
    const x0 = lx - w / 2, y0 = ly - h / 2;
    const sxp = clamp(anchor[0], x0 + 28, x0 + w - 28), syp = anchor[1] < y0 ? y0 : anchor[1] > y0 + h ? y0 + h : ly;
    const k = ease.out(clamp(a * 1.2));
    const ex = lerp(sxp, anchor[0], k), ey = lerp(syp, anchor[1], k);
    ctx.strokeStyle = 'rgba(27,32,69,0.55)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(sxp, syp); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey, 6.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    pill(x0, y0, w, h, 'rgba(255,255,255,0.95)', 0.16, 27);
    const my = sub ? y0 + 29 : ly;
    ctx.beginPath(); ctx.arc(x0 + 28, my, 8, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    drawRuns(runs, x0 + 46, my + 11, 32, 600, C.ink);
    if (sub) { ctx.font = `500 26px ${F}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(sub, x0 + 46, y0 + 72); }
    ctx.restore();
  }

  const STEPS = [
    { a: T1, b: T2, col: C.s1, tag: 'WATER IN', time: 'minutes–hours', cap: 'Premixed sealer: water from\nthe dentin soaks in', src: 'Xuereb et al. 2015 J Endod · Antunes et al. 2026 Aust Endod J' },
    { a: T2, b: T3, col: C.s2, tag: 'HYDRATION', time: 'hours–days', cap: 'Silicate grains hydrate:\nC–S–H gel + Ca(OH)_{2}', src: 'Camilleri 2011 Dent Mater (simplified) · final set ≥168 h: Loushine 2011' },
    { a: T3, b: T4, col: C.s3, tag: 'IONS OUT', time: 'from minutes', cap: `[${C.tCa}]Ca^{2+}[/] and [${C.tOh}]OH^{−}[/] leach out;\npH climbs`, src: '' },
    { a: T4, b: T5, col: C.s4, tag: 'APATITE', time: 'days–months (lab)', cap: `[${C.tPo}]Phosphate[/] + [${C.tCa}]Ca^{2+}[/] →\napatite-like layer`, src: 'Han & Okiji 2013 IEJ (incl. a premixed sealer, in PBS)\nXuereb 2015 J Endod · MTA: Sarkar 2005 J Endod' },
  ];

  function clockIcon(x, y, r, col) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.58); ctx.lineTo(x, y); ctx.lineTo(x + r * 0.45, y + r * 0.25); ctx.stroke();
    ctx.restore();
  }
  function stepChip(i, x, y, a) {
    const s = STEPS[i];
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `700 30px ${F}`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s.tag).width;
    ctx.font = `600 30px ${F}`; ctx.letterSpacing = '0px';
    const ow = ctx.measureText(s.time).width;
    const w = 58 + tw + 16 + 2 + 18 + 24 + 10 + ow + 28, h = 56, x0 = x - w / 2;
    pill(x0, y - h / 2, w, h, 'rgba(255,255,255,0.92)', 0.12);
    ctx.beginPath(); ctx.arc(x0 + 29, y, 18, 0, Math.PI * 2); ctx.fillStyle = s.col; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `700 24px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x0 + 29, y + 1);
    ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.font = `700 30px ${F}`; ctx.letterSpacing = '3px';
    ctx.fillText(s.tag, x0 + 58, y + 2);
    ctx.letterSpacing = '0px';
    let xx = x0 + 58 + tw + 16;
    ctx.fillStyle = 'rgba(27,32,69,0.22)'; ctx.fillRect(xx, y - 14, 2, 28);
    xx += 2 + 18;
    clockIcon(xx + 12, y, 11, C.mute);
    xx += 24 + 10;
    ctx.fillStyle = C.mute; ctx.font = `600 30px ${F}`;
    ctx.fillText(s.time, xx, y + 2);
    ctx.restore();
  }

  // little icon set for the legends
  function icon(kind, x, y) {
    const k = 1 / ZOOM; // icons are drawn in screen px independent of camera
    if (kind === 'grain') sphere(x, y, 19, C.grain, C.grainHi, C.grainLo);
    else if (kind === 'water') waterMol(x, y, 1.25 * k, -Math.PI / 2);
    else if (kind === 'csh') {
      ctx.lineCap = 'round';
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.2; ctx.strokeStyle = C.csh; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); ctx.stroke(); }
      sphere(x, y, 12, C.grainH, C.grainHHi, C.grainHLo);
    } else if (kind === 'ch') {
      const pts = [], bot = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; pts.push([x + Math.cos(a) * 21, y + Math.sin(a) * 11 - 4]); bot.push([x + Math.cos(a) * 21, y + Math.sin(a) * 11 + 5]); }
      for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; if (Math.sin(i * Math.PI / 3 + 0.3 + Math.PI / 6) > 0) poly([pts[i], pts[j], bot[j], bot[i]], i < 2 ? C.chR : C.chL); }
      poly(pts, C.chT, 'rgba(170,120,30,0.5)', 1.2);
    } else if (kind === 'ca') caIon(x, y, 1.5 * k);
    else if (kind === 'oh') ohIon(x, y, 1.45 * k, -0.7);
    else if (kind === 'po4') tetra(x, y, 1.45 * k);
    else if (kind === 'ap') { needle([x - 12, y + 16], [x - 4, y - 14], 9); needle([x + 2, y + 17], [x + 13, y - 10], 9); needle([x - 4, y + 17], [x + 3, y - 18], 9); }
  }
  /** row of [icon,label,(sub)] / operator items centred at (cx, y) */
  function legend(items, cx, y, a, size = 32) {
    if (a <= 0.001) return;
    ctx.save(); ctx.globalAlpha = a;
    const parts = items.map((it) => {
      if (typeof it === 'string') { const runs = parseRich(it); return { op: true, runs, w: runsWidth(runs, size, 700) + 16 }; }
      const runs = parseRich(it[1]); return { ic: it[0], runs, sub: it[2], w: 54 + runsWidth(runs, size, 600) + 8 };
    });
    const hasSub = parts.some((p) => p.sub);
    const total = parts.reduce((s, p) => s + p.w, 0);
    const padX = 26, h = hasSub ? 104 : 76, ry = hasSub ? y - 13 : y;
    pill(cx - total / 2 - padX, y - h / 2, total + padX * 2, h, 'rgba(255,255,255,0.9)', 0.12, 38);
    let x = cx - total / 2;
    for (const p of parts) {
      if (p.op) { drawRuns(p.runs, x + 8, ry + size * 0.36, size, 700, C.mute); }
      else {
        icon(p.ic, x + 22, ry); drawRuns(p.runs, x + 54, ry + size * 0.36, size, 600, C.ink);
        if (p.sub) { ctx.font = `500 24px ${F}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(p.sub, x + 2, ry + 50); }
      }
      x += p.w;
    }
    ctx.restore();
  }

  function phBar(t, a) {
    if (a <= 0.001) return;
    const v = 7 + 4.6 * ease.inOut(seg(t, T3 + 0.35, T3 + 1.5));
    ctx.save(); ctx.globalAlpha = a;
    const x0 = 140, x1 = 880, y = 1432, h = 28;
    const X = (p) => lerp(x0, x1, (p - 7) / 6);
    ctx.save(); ctx.shadowColor = 'rgba(58,44,130,0.12)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    rr(84, 1354, 856, 178, 34); ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill(); ctx.restore();
    ctx.font = `700 40px ${F}`; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('pH', x0 - 6, 1390);
    // "rising…" fades out completely before the result label fades in (no ghosting)
    const qa = 1 - seg(t, T3 + 0.9, T3 + 1.1);
    const ra = seg(t, T3 + 1.15, T3 + 1.5);
    ctx.font = `600 30px ${F}`; ctx.textAlign = 'right';
    if (qa > 0) { ctx.globalAlpha = a * qa; ctx.fillStyle = C.ink2; ctx.fillText(v < 7.05 ? 'neutral' : 'rising…', x1, 1392); }
    if (ra > 0) { ctx.globalAlpha = a * ra; ctx.fillStyle = C.tCa; ctx.font = `700 30px ${F}`; ctx.fillText('~10–12 in lab tests (water)', x1, 1392); }
    ctx.globalAlpha = a;
    // track
    rr(x0, y - h / 2, x1 - x0, h, h / 2); ctx.fillStyle = 'rgba(40,40,90,0.10)'; ctx.fill();
    // fill
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#7fd18b'); g.addColorStop(0.35, '#3fbcc4'); g.addColorStop(0.68, '#4d77ee'); g.addColorStop(1, '#7a4fe0');
    ctx.save(); rr(x0, y - h / 2, x1 - x0, h, h / 2); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(x0, y - h / 2, X(v) - x0, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x0, y - h / 2, X(v) - x0, h * 0.35);
    ctx.restore();
    // literature range band 10–12 (drawn on the track); the knob fades out as it appears (end point is illustrative)
    if (ra > 0) {
      ctx.globalAlpha = a * ra;
      rr(X(10), y - h / 2 - 7, X(12) - X(10), h + 14, (h + 14) / 2);
      ctx.strokeStyle = C.s3; ctx.lineWidth = 3.5; ctx.setLineDash([9, 7]); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = a;
    }
    const ka = 1 - seg(t, T3 + 1.55, T3 + 2.05);
    if (ka > 0) {
      ctx.globalAlpha = a * ka;
      ctx.beginPath(); ctx.arc(X(v), y, 20, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.globalAlpha = a;
    }
    // ticks
    ctx.font = `600 30px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink2;
    for (const p of [7, 9, 11, 13]) ctx.fillText(String(p), X(p), y + 38);
    ctx.fillStyle = 'rgba(27,32,69,0.35)'; for (let p = 8; p <= 12; p += 2) ctx.fillRect(X(p) - 1, y + 20, 2, 9);
    // overlap note + source (fine print inside the card)
    ctx.textBaseline = 'alphabetic';
    fitLine('Steps overlap: pH rises within minutes, before setting · Lee 2017', 512, 1512, 26, 500, C.ink2, 800);
    ctx.restore();
    return v;
  }

  // ---------------------------------------------------------------- main frame
  function render(t) {
    t = clamp(t, 0, DUR);
    // camera: hook view sits a little lower/smaller, settles, pushes in for the apatite step, eases back for the takeaway
    camReset();
    const hb = 1 - ease.inOut(seg(t, 2.5, 3.9));
    if (hb > 0) camScale(lerp(1, 0.95 - 0.025 * (1 - ease.out(seg(t, 0, 2.5))), hb), 540, 1100);
    const back = ease.inOut(seg(t, T5 - 0.2, T5 + 1.0));
    const push = ease.inOut(seg(t, T4 - 0.2, T4 + 1.2)) * (1 - back);
    if (push > 0) camScale(1 + 0.07 * push, 540, 520);
    if (back > 0) camScale(1 - 0.03 * back, 540, 1300);
    camApply();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(bg, 0, 0);
    CAMT = [CAM.sc, CAM.tx, CAM.ty];
    ctx.save();
    ctx.setTransform(CAMT[0], 0, 0, CAMT[0], CAMT[1], CAMT[2]);
    ctx.drawImage(floorShadow, 0, 0);
    ctx.restore();

    drawPlinth();
    const dz = DZ * ease.outQuint(seg(t, -0.35, 0.9));
    const fluid = ease.inOut(seg(t, T1 + 0.05, T1 + 1.5));
    drawDentine(t, dz, fluid);

    // focus: sealer contents recede during steps 3–4 so the ions and the cut faces are the subject
    const dimA = 1 - 0.5 * ease.inOut(seg(t, T3 + 0.3, T3 + 1.1)) * (1 - ease.inOut(seg(t, T5, T5 + 0.8)));
    const ionK = 1 + 0.5 * ease.inOut(seg(t, T3, T3 + 0.6)) * (1 - ease.inOut(seg(t, T5, T5 + 0.6)));
    const chK = 1 + (ionK - 1) * 0.55; // ions inside the narrow channels grow less

    // ---- items that live inside the cut channels (face plane)
    const faceItems = [];
    for (const w of waters) {
      if (w.kind !== 'ch') continue;
      const u = t - w.ts; if (u < 0 || u > w.d1) continue;
      const e = ease.inOut(u / w.d1);
      const z = lerp(0.12, DZ, e);
      const p = chanPt(w.c, z, noise1(t * 2 + w.sd, 1) * 0.04);
      faceItems.push(() => waterMol(p[0], p[1], 1, w.sd + t * 2, Math.min(1, u / 0.2)));
    }
    const ionStates = ions.map((io) => ionState(io, t));
    ions.forEach((io, i) => {
      const s = ionStates[i]; if (!s || !s.inChan) return;
      const p = P(...s.pos);
      faceItems.push(() => ionDraw(io, p[0], p[1], s.a, t, chK));
    });
    for (const ph of phos) {
      const u = t - ph.tp; if (u < 0) continue;
      const e = ease.inOut(clamp(u / ph.d));
      const a = Math.min(seg(u, 0, 0.25), 1 - seg(u, ph.d, ph.d + 0.25));
      if (a <= 0) continue;
      const p = chanPt(ph.c, lerp(0.1, ph.zEnd, e), noise1(t * 2 + ph.sd, 2) * 0.04);
      faceItems.push(() => tetra(p[0], p[1], ionK, a));
    }
    // tags (Ca–P plugs growing down into some of the channel mouths; depth varies, some tubules stay empty)
    const bursts = [];
    channels.forEach((c, k) => {
      if (!TAG[k]) return;
      const e = chanEvent[k];
      const g = ease.out(seg(t, e, e + 2.2));
      if (g <= 0) return;
      const L = TAG[k] * g;
      const za = DZ - L, zb = DZ;
      const left = c.face === 'L' ? (z) => P(c.x - TR * 0.82, DY, z) : (z) => P(DX, c.y + TR * 0.82, z);
      const right = c.face === 'L' ? (z) => P(c.x + TR * 0.82, DY, z) : (z) => P(DX, c.y - TR * 0.82, z);
      const nT = 4, jag = Math.min(0.08, L * 0.3);
      const pts = [left(zb), right(zb), right(za + jag)];
      for (let i = nT; i >= 0; i--) {
        const f = i / nT, zz = za + (i % 2 ? jag : 0) + (i === 2 ? -jag * 0.5 : 0) + hash(k, i) * jag * 0.5;
        pts.push(c.face === 'L' ? P(c.x - TR * 0.82 + f * TR * 1.64, DY, zz) : P(DX, c.y + TR * 0.82 - f * TR * 1.64, zz));
      }
      pts.push(left(za + jag));
      poly(pts, lgrad(left(zb), left(za), [[0, '#ffffff'], [1, C.apM]]), C.apE, 1.4);
      ctx.strokeStyle = 'rgba(108,201,182,0.55)'; ctx.lineWidth = 1.2;
      for (let i = 1; i < 3; i++) { const f = i / 3; const a1 = c.face === 'L' ? P(c.x - TR * 0.82 + f * TR * 1.64, DY, zb) : P(DX, c.y + TR * 0.82 - f * TR * 1.64, zb); const a2 = c.face === 'L' ? P(c.x - TR * 0.82 + f * TR * 1.64, DY, za + jag * 1.2) : P(DX, c.y + TR * 0.82 - f * TR * 1.64, za + jag * 1.2); ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...a2); ctx.stroke(); }
      // meeting burst (drawn after the channel contents)
      const fu = (t - e) / 0.8;
      if (fu > 0 && fu < 1) bursts.push({ p: chanPt(c, DZ - 0.3), fu });
    });
    faceItems.forEach((f) => f());
    for (const b of bursts) {
      const r = (14 + 40 * ease.out(b.fu)) * ZOOM, al = Math.min(1, b.fu * 6) * Math.pow(1 - b.fu, 1.4);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const rg = ctx.createRadialGradient(b.p[0], b.p[1], 0, b.p[0], b.p[1], r);
      rg.addColorStop(0, `rgba(255,255,255,${0.95 * al})`); rg.addColorStop(0.4, `rgba(108,201,182,${0.65 * al})`); rg.addColorStop(1, 'rgba(108,201,182,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(b.p[0], b.p[1], r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ---- interface film on the dentin top (under the sealer)
    const filmK = ease.inOut(seg(t, T4 + 0.7, T4 + 3.2));
    if (filmK > 0) {
      poly([P(0, 0, DZ), P(DX, 0, DZ), P(DX, DY, DZ), P(0, DY, DZ)], `rgba(205,243,234,${0.55 * filmK})`);
      for (const f of film) { if (f.t > filmK) continue; isoEllipse(f.x, f.y, DZ, f.r); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill(); }
    }

    // ---- sealer volume tint (paste -> continuous translucent gel)
    const appearAll = seg(t, 0.4, 2.4);
    if (appearAll > 0) {
      let hs = 0; for (const g of grains) hs += hyd(g, t); hs /= grains.length;
      const col = Kit.mix([226, 232, 248], [196, 180, 255], hs);
      const sil = [P(0, 0, ZT), P(DX, 0, ZT), P(DX, 0, DZ), P(DX, DY, DZ), P(0, DY, DZ), P(0, DY, ZT)];
      poly(sil, Kit.rgba(col, (0.2 + 0.12 * hs) * ease.out(appearAll) * dimA));
      poly([P(0, 0, ZT), P(DX, 0, ZT), P(DX, 0, DZ), P(0, 0, DZ)], Kit.rgba(col, 0.18 * ease.out(appearAll) * dimA));
      poly([P(0, 0, ZT), P(0, DY, ZT), P(0, DY, DZ), P(0, 0, DZ)], Kit.rgba(col, 0.22 * ease.out(appearAll) * dimA));
    }

    // ---- water front soaking up into the paste (step 1), fades as the gel forms
    WF = ease.inOut(seg(t, T1 + 0.8, T2 + 0.5)); WFA = 1 - seg(t, T2 + 0.8, T3 - 0.2);
    if (WF > 0.005 && WFA > 0) {
      const zt = DZ + SZ * 0.96 * WF;
      const sil = [P(0, 0, zt), P(DX, 0, zt), P(DX, 0, DZ), P(DX, DY, DZ), P(0, DY, DZ), P(0, DY, zt)];
      poly(sil, lgrad(P(DX, DY, DZ), P(DX, DY, zt), [[0, `rgba(80,170,240,${0.50 * WFA})`], [1, `rgba(80,170,240,${0.18 * WFA})`]]));
      poly([P(0, 0, zt), P(DX, 0, zt), P(DX, DY, zt), P(0, DY, zt)], `rgba(140,205,250,${0.16 * WFA})`);
      ctx.strokeStyle = `rgba(255,255,255,${0.95 * WFA})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(...P(0, DY, zt)); ctx.lineTo(...P(DX, DY, zt)); ctx.lineTo(...P(DX, 0, zt)); ctx.stroke();
    }

    // ---- depth-sorted sealer contents
    const items = [];
    for (const g of grains) {
      const ak = seg(t, g.appear, g.appear + 0.55);
      if (ak <= 0) continue;
      items.push({ d: g.x + g.y + g.z, f: () => grainDraw(g, t, ak), dim: true });
      if (g.layer === 0) items.push({ d: -100, dim: true, f: () => {
        const [x, y] = P(g.x + 0.1, g.y + 0.1, DZ), rx = g.r * SPH * S;
        ctx.save(); ctx.globalAlpha *= 0.3 * ease.out(ak); ctx.translate(x, y); ctx.scale(1, 0.577);
        const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        sg.addColorStop(0, 'rgba(50,36,130,0.75)'); sg.addColorStop(0.55, 'rgba(50,36,130,0.35)'); sg.addColorStop(1, 'rgba(50,36,130,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } });
    }
    for (const b of bridges) items.push({ d: (b.A.x + b.A.y + b.A.z + b.B.x + b.B.y + b.B.z) / 2 - 0.05, f: () => bridgeDraw(b, t), dim: true });
    for (const p of plates) {
      const k = plateK(p, t); if (k <= 0.01) continue;
      items.push({ d: p.x + p.y + p.z, f: () => hexPlate(p.x, p.y, p.z, p.rad, 0.07, p.rot, k), dim: true });
    }
    for (const w of waters) {
      let pos, k = 1, a = 1;
      if (w.kind === 'ch') {
        const u = t - w.ts - w.d1; if (u < 0 || u > w.d2 + 0.3) continue;
        const e = ease.inOut(clamp(u / w.d2));
        pos = [lerp(w.top[0], w.end[0], e), lerp(w.top[1], w.end[1], e), lerp(w.top[2], w.end[2], e)];
        if (u > w.d2) { k = 1 - (u - w.d2) / 0.3; a = k; }
      } else {
        const u = t - w.ts; if (u < 0 || u > w.d2 + 0.3) continue;
        const e = ease.inOut(clamp(u / w.d2));
        pos = [lerp(w.o.x, w.end[0], e), lerp(w.o.y, w.end[1], e), lerp(DZ - 0.05, w.end[2], e) + Math.sin(e * Math.PI) * 0.15];
        k = Math.min(1, u / 0.2);
        if (u > w.d2) { k = 1 - (u - w.d2) / 0.3; a = k; }
      }
      const p = P(...pos);
      items.push({ d: pos[0] + pos[1] + pos[2] + 0.2, f: () => waterMol(p[0], p[1], k, w.sd + t * 2, a) });
    }
    const outside = [];
    ions.forEach((io, i) => {
      const s = ionStates[i]; if (!s || s.inChan) return;
      const p = P(...s.pos);
      const it = { d: s.pos[0] + s.pos[1] + s.pos[2] + 0.2, f: () => ionDraw(io, p[0], p[1], s.a, t, ionK) };
      if (s.pos[0] > DX || s.pos[1] > DY || s.pos[2] > ZT) outside.push(it); else items.push(it);
    });
    for (const q of opPhos) {
      const u = t - q.tp; if (u < 0 || u > 0.9) continue;
      const e = ease.out(clamp(u / 0.6));
      const a = Math.min(seg(u, 0, 0.2), 1 - seg(u, 0.6, 0.9));
      const p = P(q.o.x, q.o.y, DZ - 0.05 + 0.2 * e);
      items.push({ d: q.o.x + q.o.y + DZ + 0.1, f: () => tetra(p[0], p[1], ionK, a) });
    }
    for (const o of opClusters) items.push(...cluster(o, t, true, 1.0).map((c) => ({ d: c.depth, f: c.draw })));
    for (const o of surfClusters) items.push(...cluster(o, t, true, 0.75).map((c) => ({ d: c.depth, f: c.draw })));
    items.sort((a, b) => a.d - b.d);
    for (const it of items) { ctx.globalAlpha = it.dim ? dimA : 1; it.f(); }
    ctx.globalAlpha = 1;

    // ---- interfacial band on the two visible faces (mineral layer at the dentin wall)
    if (filmK > 0) {
      const thk = 0.18 * filmK;
      const band = (face) => {
        const pts = [];
        const n = face === 'L' ? 40 : 28, len = face === 'L' ? DX : DY, sd = face === 'L' ? 1 : 2;
        for (let i = 0; i <= n; i++) {
          const s = i / n * len, hgt = DZ + thk * (0.75 + 0.35 * noise1(i * 0.7, sd));
          pts.push(face === 'L' ? P(s, DY, hgt) : P(DX, DY - s, hgt));
        }
        if (face === 'L') { pts.push(P(DX, DY, DZ - 0.01), P(0, DY, DZ - 0.01)); }
        else { pts.push(P(DX, 0, DZ - 0.01), P(DX, DY, DZ - 0.01)); }
        const a0 = face === 'L' ? P(0, DY, DZ + thk) : P(DX, 0, DZ + thk), a1 = face === 'L' ? P(0, DY, DZ) : P(DX, 0, DZ);
        poly(pts, lgrad(a0, a1, [[0, '#ffffff'], [1, '#bdeee2']]), C.apE, 1.3);
        // a few short crystal facet ticks
        ctx.save(); ctx.strokeStyle = 'rgba(108,201,182,0.4)'; ctx.lineWidth = 1.4;
        for (const f of [0.14, 0.37, 0.61, 0.84]) {
          const s = f * len, top = DZ + thk * 0.62;
          const p0 = face === 'L' ? P(s, DY, DZ + 0.02) : P(DX, DY - s, DZ + 0.02);
          const p1 = face === 'L' ? P(s + 0.09, DY, top) : P(DX, DY - s - 0.09, top);
          ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke();
        }
        ctx.restore();
      };
      band('L'); band('R');
    }

    // ---- sealer glass (front faces + edges)
    const ga = ease.out(seg(t, 1.5, 2.5));
    if (ga > 0) {
      ctx.save(); ctx.globalAlpha = ga;
      const topF = [P(0, 0, ZT), P(DX, 0, ZT), P(DX, DY, ZT), P(0, DY, ZT)];
      const leftF = [P(0, DY, ZT), P(DX, DY, ZT), P(DX, DY, DZ), P(0, DY, DZ)];
      const rightF = [P(DX, 0, ZT), P(DX, DY, ZT), P(DX, DY, DZ), P(DX, 0, DZ)];
      poly(topF, lgrad(topF[0], topF[2], [[0, 'rgba(255,255,255,0.30)'], [1, 'rgba(255,255,255,0.10)']]));
      poly(leftF, lgrad(leftF[0], leftF[3], [[0, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0.04)']]));
      poly(rightF, lgrad(rightF[0], rightF[3], [[0, 'rgba(235,240,255,0.10)'], [1, 'rgba(235,240,255,0.02)']]));
      poly([P(0.7, DY, ZT), P(1.4, DY, ZT), P(0.9, DY, DZ), P(0.2, DY, DZ)], 'rgba(255,255,255,0.13)');
      poly([P(1.7, DY, ZT), P(1.95, DY, ZT), P(1.45, DY, DZ), P(1.2, DY, DZ)], 'rgba(255,255,255,0.10)');
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(...P(0, 0, ZT)); ctx.lineTo(...P(0, 0, DZ)); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
      ctx.beginPath(); topF.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
      ctx.moveTo(...leftF[0]); ctx.lineTo(...leftF[3]); ctx.moveTo(...leftF[1]); ctx.lineTo(...leftF[2]); ctx.moveTo(...rightF[0]); ctx.lineTo(...rightF[3]);
      ctx.stroke();
      ctx.restore();
    }
    outside.sort((a, b) => a.d - b.d).forEach((it) => it.f());

    // ---- glint travelling along the new mineral layer (takeaway beat)
    const gu = seg(t, T5 + 0.3, T5 + 1.9);
    if (gu > 0 && gu < 1) {
      const e = ease.inOut(gu), L = DX + DY, s0 = e * L;
      const gp = s0 < DX ? P(s0, DY, DZ + 0.1) : P(DX, DY - (s0 - DX), DZ + 0.1);
      const ga2 = Math.sin(gu * Math.PI);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const rg = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], 46 * ZOOM);
      rg.addColorStop(0, `rgba(255,255,255,${0.8 * ga2})`); rg.addColorStop(0.35, `rgba(200,255,240,${0.35 * ga2})`); rg.addColorStop(1, 'rgba(200,255,240,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(gp[0], gp[1], 46 * ZOOM, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    drawUI(t);

    // ---- loop: dissolve into frame 0 over the last 0.5 s
    const lx = seg(t, DUR - 0.5, DUR);
    if (loopImg && lx > 0) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = ease.inOut(lx); ctx.drawImage(loopImg, 0, 0); ctx.restore();
    }
  }

  // ---------------------------------------------------------------- text & UI layer
  function drawUI(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // ---- hook (fully opaque on frame 0)
    const hookA = 1 - seg(t, T1 - 0.35, T1);
    if (hookA > 0) {
      ctx.save(); ctx.globalAlpha = hookA * seg(t, -0.3, 0.0);
      const y0 = 4 * (1 - hookA);
      ctx.font = `700 30px ${F}`; ctx.letterSpacing = '4px'; ctx.fillStyle = C.tKick; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('PREMIXED CALCIUM-SILICATE SEALERS', 542, 290 - y0);
      ctx.letterSpacing = '0px';
      rich('How a bioceramic\nsealer sets', 540, 378 - y0, { size: 86, weight: 700, color: C.ink, align: 'center', lh: 1.04 });
      rich('…and what can form at the wall', 540, 520 - y0, { size: 40, weight: 500, color: C.ink2, align: 'center', maxW: 940 });
      ctx.restore();
    }
    // ---- callouts (screen positions from current camera); they arrive after the title has been read
    const cEnd = T2 - 0.2;
    callout('root dentin', P(1.2, DY, 0.95), 192, 1188, env(t, 2.3, cEnd, 0.5, 0.4), C.denR);
    callout('sealer', P(0.95, DY, 2.75), 170, 612, env(t, 2.5, cEnd, 0.5, 0.4), C.grain, 'canal side');
    callout('tubules', P(DX, 2.48, 1.0), 786, 1292, env(t, 2.7, cEnd, 0.5, 0.4), C.fluD, 'toward root surface');
    callout('phosphate from tissue fluid', P(1.5, DY, 0.3), 326, 1322, env(t, T4 - 0.05, T4 + 2.65, 0.35, 0.3), C.poR, 'lab: PBS bath · route schematic');
    callout('tag-like Ca–P deposits', P(5.1, DY, 1.86), 300, 1332, env(t, T4 + 2.65, DUR + 1, 0.45, 0.4), C.apE);
    callout('apatite-like layer', P(DX, 2.02, DZ + 0.08), 778, 1332, env(t, T4 + 1.6, DUR + 1, 0.5, 0.4), C.apE);

    // ---- step chip + caption
    for (let i = 0; i < 4; i++) {
      const s = STEPS[i];
      const inn = ease.out(seg(t, s.a, s.a + 0.35)), out = seg(t, s.b - 0.25, s.b);
      const a = inn * (1 - out);
      if (a <= 0) continue;
      const dy = 22 * (1 - inn) - 14 * out;
      stepChip(i, 540, 288 + dy * 0.5, a);
      ctx.save(); ctx.globalAlpha = a;
      rich(s.cap, 540, 390 + dy, { size: 54, weight: 700, color: C.ink, align: 'center', lh: 1.14, maxW: 950 });
      ctx.restore();
      if (s.src) {
        ctx.save(); ctx.globalAlpha = a * 0.85; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        const lines = s.src.split('\n');
        lines.forEach((l, j) => fitLine(l, 540, 1528 - (lines.length - 1 - j) * 28, 23, 500, C.ink2, 820));
        ctx.restore();
      }
    }
    // ---- bottom info per step
    legend([['water', 'Very dry canal → may stay unset']], 540, 1420, env(t, T1 + 0.2, T2, 0.35, 0.25), 32);
    legend([['grain', 'C_{3}S/C_{2}S', 'tri-/dicalcium silicate'], '+', ['water', 'H_{2}O'], '→', ['csh', 'C–S–H'], '+', ['ch', 'Ca(OH)_{2}']], 540, 1418, env(t, T2 + 0.4, T3, 0.45, 0.3), 30);
    phBar(t, env(t, T3 + 0.3, T4, 0.45, 0.3));
    legend([['po4', 'phosphate'], '+', ['ca', 'Ca^{2+}'], '+', ['oh', 'OH^{−}'], '→', ['ap', 'apatite-like']], 528, 1430, env(t, T4 + 0.45, T5, 0.45, 0.3), 30);

    // ---- final takeaway
    const fa = ease.out(seg(t, T5 + 0.05, T5 + 0.45));
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha = fa;
      const dy = 20 * (1 - fa);
      ctx.font = `700 28px ${F}`; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lab = 'BIOCERAMIC SEALERS · TAKEAWAY';
      const tw = ctx.measureText(lab).width;
      pill(540 - tw / 2 - 30, 290 - 25 + dy * 0.4, tw + 60, 50, C.ink, 0.15);
      ctx.fillStyle = '#fff'; ctx.fillText(lab, 540 + 2, 292 + dy * 0.4);
      ctx.letterSpacing = '0px';
      rich(`Water sets it.\nIn vitro, [${C.tCa}]calcium[/] + [${C.tPo}]phosphate[/]\nform apatite-like mineral.`, 540, 378 + dy, { size: 56, weight: 700, color: C.ink, align: 'center', lh: 1.1, maxW: 940 });
      ctx.restore();
      const sa = ease.out(seg(t, T5 + 0.5, T5 + 0.95));
      ctx.save(); ctx.globalAlpha = sa; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      fitLine('Premixed sealers set slowly (days) and need dentin moisture.', 540, 1418, 26, 500, C.ink2, 820);
      fitLine('Ion release = some solubility; long-term seal effect debated.', 540, 1454, 26, 500, C.ink2, 820);
      fitLine('Xuereb 2015 J Endod · Han & Okiji 2013 IEJ · Donnermeyer 2019 Odontology', 540, 1496, 23, 500, C.ink2, 820);
      ctx.restore();
    }
    // ---- handle + persistent disclaimer
    ctx.save();
    ctx.font = `600 26px ${F}`; ctx.fillStyle = 'rgba(27,32,69,0.62)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('@natebrooksendo', 64, 1566);
    ctx.font = `500 23px ${F}`; ctx.textAlign = 'right'; ctx.fillText('schematic · not to scale · time compressed', 940, 1566);
    ctx.restore();
  }

  window.REEL = {
    title: 'How a bioceramic sealer sets',
    duration: DUR,
    poster: 23.2,
    canvas,
    fonts: [`700 86px "Space Grotesk"`, `600 32px "Space Grotesk"`, `500 23px "Space Grotesk"`],
    async setup() {
      buildSprites();
      render(0);
      loopImg = document.createElement('canvas'); loopImg.width = W; loopImg.height = H;
      loopImg.getContext('2d').drawImage(canvas, 0, 0);
    },
    render,
  };
  Kit.boot(REEL);
})();
