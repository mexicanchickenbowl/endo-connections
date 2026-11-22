/*
 * 35 · art.js — drawing primitives (typewriter text, marker, pins, string, evidence markers, the fluted file)
 * and the static card sprites of the evidence board. Defines window.ART. Deterministic.
 */
(function () {
  const { rng, hash, clamp, lerp } = Kit;
  const { C, rr, mk } = TX;
  const TAU = Math.PI * 2;
  const A = {};

  // ------------------------------------------------------------------ text
  const TWF = (px) => `${px}px "Special Elite"`;
  const GE = '≥';                                   // not in the typewriter font: drawn by hand
  A.typedW = function (g, text, px) {
    g.save(); g.font = TWF(px); let w = 0;
    for (const ch of text) w += g.measureText(ch === GE ? '>' : ch).width;
    g.restore(); return w;
  };
  /** typewriter text, one glyph at a time (uneven ink and baseline). n = glyphs shown. Returns end x. */
  A.typed = function (g, text, x, y, px, n, o = {}) {
    if (n == null) n = text.length;
    g.save(); g.font = TWF(px); g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = o.color || C.ink;
    const seed = o.seed || 1, al = o.alpha == null ? 1 : o.alpha;
    let cx = x, i = 0;
    for (const ch of text) {
      if (i >= n) break;
      const w = g.measureText(ch === GE ? '>' : ch).width;
      if (ch !== ' ') {
        g.globalAlpha = al * (0.82 + 0.18 * hash(i, seed, 3));
        const dy = (hash(i, seed, 7) - 0.5) * px * 0.05;
        if (ch === GE) {
          const x0 = cx + w * 0.06, x1 = cx + w * 0.98, yy = y + dy;
          g.save(); g.strokeStyle = g.fillStyle; g.lineWidth = px * 0.085; g.lineCap = 'round'; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(x0, yy - px * 0.64); g.lineTo(x1, yy - px * 0.43); g.lineTo(x0, yy - px * 0.22); g.moveTo(x0, yy - px * 0.05); g.lineTo(x1, yy - px * 0.05); g.stroke(); g.restore();
        }
        else g.fillText(ch, cx, y + dy);
      }
      cx += w; i++;
    }
    g.restore(); return cx;
  };
  /** marker handwriting revealed left to right (u 0..1) */
  A.marker = function (g, text, x, y, px, u, o = {}) {
    if (u <= 0) return 0;
    g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
    g.font = `${px}px "Permanent Marker"`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    const w = g.measureText(text).width;
    if (u < 1) { g.beginPath(); g.rect(-6, -px * 1.05, (w + 12) * clamp(u), px * 1.5); g.clip(); }
    g.fillStyle = o.color || C.black; g.globalAlpha = o.alpha == null ? 0.94 : o.alpha;
    g.fillText(text, 0, 0);
    g.restore(); return w;
  };
  /** hand-drawn marker stroke through pts, revealed by length fraction u */
  A.stroke = function (g, pts, u, o = {}) {
    if (u <= 0 || pts.length < 2) return;
    const d = []; let tot = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); d.push(l); tot += l; }
    let rem = tot * clamp(u);
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = o.w || 5; g.strokeStyle = o.color || C.red; g.globalAlpha = o.alpha == null ? 0.92 : o.alpha;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    let last = pts[0];
    for (let i = 0; i < d.length; i++) {
      if (rem >= d[i]) { g.lineTo(pts[i + 1][0], pts[i + 1][1]); rem -= d[i]; last = pts[i + 1]; }
      else { const k = d[i] ? rem / d[i] : 0; last = [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; g.lineTo(last[0], last[1]); break; }
    }
    g.stroke(); g.restore();
    return last;
  };
  /** points of a slightly wobbly ellipse (hand-drawn ring that overshoots its start) */
  A.ring = function (cx, cy, rx, ry, o = {}) {
    const n = o.n || 56, a0 = o.a0 == null ? -2.3 : o.a0, turns = o.turns || 1.08, seed = o.seed || 3, wob = o.wob == null ? 0.05 : o.wob, pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + u * turns * TAU, k = 1 + wob * Math.sin(a * 2 + seed) + (u - 0.5) * 0.06;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return pts;
  };
  /** quadratic curve sampled to points (for arrows / ticks) */
  A.quad = function (p0, p1, p2, n = 18) {
    const pts = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; pts.push([a * a * p0[0] + 2 * a * u * p1[0] + u * u * p2[0], a * a * p0[1] + 2 * a * u * p1[1] + u * u * p2[1]]); } return pts;
  };

  // ------------------------------------------------------------------ pins, string, evidence markers
  const PINS = {
    red: ['#ff9a86', '#d2362a', '#7a140e'], yellow: ['#fff0a8', '#edb91f', '#8f6a08'], blue: ['#a9c8ff', '#2f5fb5', '#12295a'],
    white: ['#ffffff', '#e4e1d8', '#8d8a82'], green: ['#b6f0c8', '#2f8a58', '#114428'],
  };
  A.pin = function (g, x, y, col, k) {
    if (k != null && k <= 0) return;
    const [hi, mid, dark] = PINS[col || 'red'], r = 8.5;
    g.save(); g.translate(x, y); if (k != null) g.scale(k, k);
    g.fillStyle = 'rgba(25,12,3,0.42)'; g.beginPath(); g.ellipse(4.2, 6.6, r * 0.98, r * 0.8, 0.5, 0, TAU); g.fill();
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, hi); gr.addColorStop(0.5, mid); gr.addColorStop(1, dark);
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = 0.8; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r * 0.5, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.88)'; g.beginPath(); g.ellipse(-r * 0.36, -r * 0.42, r * 0.22, r * 0.13, -0.6, 0, TAU); g.fill();
    g.restore();
  };
  /** sampled points of a thread hung between pins (slight sag; bow = sideways slack for vertical runs) */
  A.threadPts = function (pins, sag, bow) {
    const out = [], k = sag == null ? 0.035 : sag, bw = bow || 0;
    for (let i = 0; i < pins.length - 1; i++) {
      const [x0, y0] = pins[i], [x1, y1] = pins[i + 1], len = Math.hypot(x1 - x0, y1 - y0) || 1;
      const mx = (x0 + x1) / 2 + bw * Math.abs(y1 - y0) / len, my = (y0 + y1) / 2 + Math.abs(x1 - x0) * k + 1.5;
      const n = Math.max(6, Math.round(len / 7));
      for (let j = i ? 1 : 0; j <= n; j++) { const u = j / n, a = 1 - u; out.push([a * a * x0 + 2 * a * u * mx + u * u * x1, a * a * y0 + 2 * a * u * my + u * u * y1]); }
    }
    return out;
  };
  /** red twisted thread with its shadow, revealed by u */
  A.thread = function (g, pts, u, o = {}) {
    if (u <= 0) return null;
    g.save(); g.translate(2.6, 4.2);
    A.stroke(g, pts, u, { color: 'rgba(30,10,4,1)', w: 4.2, alpha: 0.3 });
    g.restore();
    const end = A.stroke(g, pts, u, { color: o.color || C.string, w: 3.7, alpha: 1 });
    g.save(); g.setLineDash([2.4, 4.4]); g.lineDashOffset = 1;
    A.stroke(g, pts, u, { color: o.hi || '#e87b6e', w: 1.5, alpha: 0.85 });
    g.restore();
    return end;
  };
  /** small loop of thread around a pin */
  A.knot = function (g, x, y, k = 1) {
    if (k <= 0) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = C.string; g.lineWidth = 3; g.beginPath(); g.ellipse(x + 0.5, y + 1.5, 9.5, 8, 0.3, 0, TAU); g.stroke();
    g.strokeStyle = '#e87b6e'; g.lineWidth = 1; g.setLineDash([2, 4]); g.stroke(); g.restore();
  };
  /** yellow numbered evidence marker (tent card); (x,y) = middle of its base */
  A.tent = function (g, x, y, label, k) {
    if (k != null && k <= 0) return;
    g.save(); g.translate(x, y); if (k != null) g.scale(k, k);
    g.fillStyle = 'rgba(25,12,3,0.4)'; g.beginPath(); g.ellipse(7, 3, 31, 6.5, 0, 0, TAU); g.fill();
    g.fillStyle = C.yellowD; g.beginPath(); g.moveTo(23, 0); g.lineTo(31, -7); g.lineTo(25, -45); g.lineTo(19, -44); g.closePath(); g.fill();
    const lg = g.createLinearGradient(0, -44, 0, 0); lg.addColorStop(0, '#ffd84a'); lg.addColorStop(1, '#eab520');
    g.fillStyle = lg; g.beginPath(); g.moveTo(-25, 0); g.lineTo(23, 0); g.lineTo(19, -44); g.lineTo(-21, -44); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,84,0,0.55)'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-20, -43); g.lineTo(18.5, -43); g.stroke();
    g.fillStyle = '#17130c'; g.font = '31px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(label, -1, -10);
    g.restore();
  };

  // ------------------------------------------------------------------ the instrument
  function atPhase(P, v) {
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      if ((a.ph <= v && v <= b.ph) || (b.ph <= v && v <= a.ph)) {
        const k = b.ph === a.ph ? 0 : (v - a.ph) / (b.ph - a.ph);
        return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), nx: lerp(a.nx, b.nx, k), ny: lerp(a.ny, b.ny, k), hw: lerp(a.hw, b.hw, k), s: lerp(a.s, b.s, k) };
      }
    }
    return null;
  }
  /**
   * Tapered fluted instrument along an axis. ax(s) -> {x,y,nx,ny} at distance s from the tip.
   * hw(s) half-width, ph(s) flute phase in turns (monotonic in s), o.flEnd = where the flutes stop (plain shaft beyond).
   */
  A.file = function (g, ax, s0, s1, hw, ph, o = {}) {
    const step = o.step || 2, P = [];
    for (let s = s0; s < s1; s += step) { const p = ax(s); P.push({ s, x: p.x, y: p.y, nx: p.nx, ny: p.ny, hw: hw(s), ph: ph(s) }); }
    { const p = ax(s1); P.push({ s: s1, x: p.x, y: p.y, nx: p.nx, ny: p.ny, hw: hw(s1), ph: ph(s1) }); }
    if (P.length < 2) return;
    const flEnd = o.flEnd == null ? 1e9 : o.flEnd, amp = o.amp == null ? 0.17 : o.amp;
    const edge = (p, side) => { const fl = clamp((flEnd - p.s) / 8); const w = p.hw * (1 - side * amp * fl * Math.cos(p.ph * TAU)); return [p.x + side * p.nx * w, p.y + side * p.ny * w]; };
    const Lp = P.map((p) => edge(p, 1)), Rp = P.map((p) => edge(p, -1));
    const body = () => { g.beginPath(); g.moveTo(Lp[0][0], Lp[0][1]); for (let i = 1; i < Lp.length; i++) g.lineTo(Lp[i][0], Lp[i][1]); for (let i = Rp.length - 1; i >= 0; i--) g.lineTo(Rp[i][0], Rp[i][1]); g.closePath(); };
    const strip = (a, b, col) => {
      g.beginPath();
      P.forEach((p, i) => { const x = p.x + p.nx * p.hw * a, y = p.y + p.ny * p.hw * a; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; g.lineTo(p.x + p.nx * p.hw * b, p.y + p.ny * p.hw * b); }
      g.closePath(); g.fillStyle = col; g.fill();
    };
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    body(); g.fillStyle = o.fill || C.steel; g.fill();
    g.save(); body(); g.clip();
    strip(-1.4, -0.42, 'rgba(58,68,80,0.42)');
    strip(0.16, 0.6, 'rgba(255,255,255,0.6)');
    strip(0.92, 1.4, 'rgba(70,80,92,0.22)');
    if (o.tint) { body(); g.fillStyle = o.tint; g.fill(); }
    // flute edges across the visible face: from the -n side at phase k to the +n side at phase k + 0.5 (right-handed helix)
    const phA = Math.min(P[0].ph, P[P.length - 1].ph), phB = Math.max(P[0].ph, P[P.length - 1].ph);
    for (let k = Math.ceil(phA - 0.5); k <= Math.floor(phB); k++) {
      const a = atPhase(P, k), b = atPhase(P, k + 0.5);
      if (!a && !b) continue;
      const aa = a || P[P[0].ph < P[P.length - 1].ph ? 0 : P.length - 1], bb = b || P[P[0].ph < P[P.length - 1].ph ? P.length - 1 : 0];
      if (Math.min(aa.s, bb.s) > flEnd) continue;
      const x0 = aa.x - aa.nx * aa.hw * 1.2, y0 = aa.y - aa.ny * aa.hw * 1.2, x1 = bb.x + bb.nx * bb.hw * 1.2, y1 = bb.y + bb.ny * bb.hw * 1.2;
      const lw = clamp((aa.hw + bb.hw) * 0.085, 0.8, 1.9);
      g.strokeStyle = 'rgba(52,62,74,0.85)'; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      const tx = (y1 - y0), ty = -(x1 - x0), tl = Math.hypot(tx, ty) || 1, off = lw * 1.1;
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = lw * 0.7; g.beginPath(); g.moveTo(x0 + tx / tl * off, y0 + ty / tl * off); g.lineTo(x1 + tx / tl * off, y1 + ty / tl * off); g.stroke();
    }
    g.restore();
    body(); g.strokeStyle = o.line || 'rgba(34,42,52,0.95)'; g.lineWidth = o.lw || 1.2; g.stroke();
    g.restore();
  };

  // ------------------------------------------------------------------ exhibit geometry (photo-local coordinates, 260 x 300)
  const PH = { w: 260, h: 300 };
  A.PH = PH;
  /** half-width of the schematic file at distance s from its tip */
  A.hwFile = (s) => (s <= 190 ? 2.7 + 0.046 * s : lerp(11.44, 9.6, clamp((s - 190) / 12)));
  A.FL_END = 190;
  // Exhibit A: straight canal that grips the last part of the file ("tip binds")
  A.DA = 232;                                         // tip depth when seated (bound)
  A.pathA = (d) => ({ x: 130, y: d, tx: 0, ty: 1, nx: 1, ny: 0 });
  A.hwCanalA = (d) => {
    const s = A.DA - d;
    if (s < 0) return 2.5;
    if (s <= 26) return A.hwFile(s) + 0.5;
    return A.hwFile(Math.min(s, 190)) + 0.5 + (s - 26) * 0.06 + Math.min(3, (s - 26) * 0.12);
  };
  // Exhibit B: canal with a curve (file is loose in it; it only has to bend)
  const B = { xs: 88, Ls: 132, R: 74, phi: 62 * Math.PI / 180, tail: 62 };
  B.arc = B.R * B.phi; B.end = B.Ls + B.arc + B.tail; B.mid = B.Ls + B.arc / 2;
  A.B = B; A.DB = B.Ls + B.arc + 30;
  A.pathB = (d) => {
    if (d <= B.Ls) return { x: B.xs, y: d, tx: 0, ty: 1, nx: 1, ny: 0 };
    const a = Math.min((d - B.Ls) / B.R, B.phi), cx = B.xs + B.R, cy = B.Ls;
    let x = cx - B.R * Math.cos(a), y = cy + B.R * Math.sin(a); const tx = Math.sin(a), ty = Math.cos(a);
    const over = d - B.Ls - B.arc; if (over > 0) { x += tx * over; y += ty * over; }
    return { x, y, tx, ty, nx: ty, ny: -tx };
  };
  A.hwCanalB = (d) => lerp(21, 7, clamp(d / B.end));

  function scaleL(g, x, y, sx, sy) {                    // forensic L-shaped photo scale (no units: schematic)
    g.save(); g.translate(x, y); g.scale(sx, sy);
    const arm = 54, wd = 9;
    g.fillStyle = 'rgba(248,246,240,0.96)'; g.fillRect(0, 0, arm, wd); g.fillRect(0, 0, wd, arm);
    g.fillStyle = '#15171a';
    for (let i = 0; i < 6; i++) { if (i % 2 === 0) { g.fillRect(wd + i * 7.5, 0, 7.5, wd * 0.55); g.fillRect(0, wd + i * 7.5, wd * 0.55, 7.5); } else { g.fillRect(wd + i * 7.5, wd * 0.55, 7.5, wd * 0.45); g.fillRect(wd * 0.55, wd + i * 7.5, wd * 0.45, 7.5); } }
    g.beginPath(); g.arc(wd / 2, wd / 2, 3, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 0.6; g.strokeRect(0, 0, arm, wd); g.strokeRect(0, 0, wd, arm);
    g.restore();
  }
  /** static part of an exhibit photo: dentin with the canal lumen */
  function photoBG(g, which) {
    const path = which === 'A' ? A.pathA : A.pathB, hwC = which === 'A' ? A.hwCanalA : A.hwCanalB, dMax = which === 'A' ? PH.h + 6 : B.end;
    const r = rng(which === 'A' ? 91 : 92);
    const lg = g.createLinearGradient(0, 0, PH.w, PH.h); lg.addColorStop(0, '#d9c198'); lg.addColorStop(0.55, '#c8ab7f'); lg.addColorStop(1, '#b3946a');
    g.fillStyle = lg; g.fillRect(0, 0, PH.w, PH.h);
    // faint dentinal striations running away from the canal
    g.lineCap = 'round';
    for (let i = 0; i < 520; i++) {
      const d = r() * dMax, p = path(d), side = r() < 0.5 ? 1 : -1, hw = hwC(d), a = hw + 2 + r() * 90, len = 8 + r() * 26, sl = (r() - 0.5) * 0.5;
      g.strokeStyle = r() < 0.5 ? 'rgba(255,240,205,0.11)' : 'rgba(96,66,30,0.10)'; g.lineWidth = 0.6 + r() * 0.9;
      g.beginPath(); g.moveTo(p.x + side * p.nx * a + p.tx * 0, p.y + side * p.ny * a); g.lineTo(p.x + side * p.nx * (a + len) + p.tx * len * sl, p.y + side * p.ny * (a + len) + p.ty * len * sl); g.stroke();
    }
    // lumen
    const Lp = [], Rp = [];
    for (let d = -8; d <= dMax; d += 2.5) { const p = path(d), hw = hwC(d); Lp.push([p.x + p.nx * hw, p.y + p.ny * hw]); Rp.push([p.x - p.nx * hw, p.y - p.ny * hw]); }
    const lumen = () => {
      g.beginPath(); g.moveTo(Lp[0][0], Lp[0][1]); for (const q of Lp) g.lineTo(q[0], q[1]);
      if (which === 'B') { const e = path(dMax), hw = hwC(dMax); g.arc(e.x, e.y, hw, Math.atan2(e.ny, e.nx), Math.atan2(-e.ny, -e.nx), false); }
      for (let i = Rp.length - 1; i >= 0; i--) g.lineTo(Rp[i][0], Rp[i][1]); g.closePath();
    };
    g.save(); g.shadowColor = 'rgba(70,44,16,0.55)'; g.shadowBlur = 5 * TX.SPR; lumen(); g.fillStyle = C.lumen; g.fill(); g.restore();
    g.save(); lumen(); g.clip();
    const lum = g.createLinearGradient(0, 0, PH.w, 0); lum.addColorStop(0, '#120d0a'); lum.addColorStop(0.5, '#241a13'); lum.addColorStop(1, '#120d0a'); g.fillStyle = lum; g.fillRect(0, 0, PH.w, PH.h);
    g.restore();
    lumen(); g.strokeStyle = 'rgba(88,60,30,0.9)'; g.lineWidth = 1.6; g.stroke();
    // lens vignette + grain
    const vg = g.createRadialGradient(PH.w / 2, PH.h / 2, 60, PH.w / 2, PH.h / 2, 230); vg.addColorStop(0, 'rgba(20,10,2,0)'); vg.addColorStop(1, 'rgba(20,10,2,0.5)');
    g.fillStyle = vg; g.fillRect(0, 0, PH.w, PH.h);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = TX.grainPat(g, 1 / TX.SPR); g.fillRect(0, 0, PH.w, PH.h); g.globalCompositeOperation = 'source-over';
    if (which === 'A') { scaleL(g, PH.w - 8, PH.h - 8, -1, -1); A.typed(g, 'schematic', 10, 250, 22, null, { color: '#fbf6ea', alpha: 0.9, seed: 4 }); }
    else { scaleL(g, PH.w - 8, 8, -1, 1); A.typed(g, 'schematic', PH.w - 10 - A.typedW(g, 'schematic', 22), PH.h - 12, 22, null, { color: '#fbf6ea', alpha: 0.9, seed: 5 }); }
  }

  // ------------------------------------------------------------------ static cards
  A.G = {
    title: { w: 346, h: 208 },
    radio: { w: 340, h: 328, film: { x: 12, y: 12, w: 316, h: 258 } },
    ex: { w: 284, h: 552, photo: { x: 12, y: 16 }, stamp: [150, 342], cap: [412, 448], note: 492, pinTop: [14, 12], pinBot: [16, 540], tent: [36, 322] },
    sus: { h: 130 },
    prev: { w: 346, h: 218, rows: [90, 152, 191], fine: 116, box: 16, tx: 68, stamp: [238, 38] },
    bag: { w: 334, h: 126 },
    prog: { w: 528, h: 180, x0: 18, W100: 396, bars: [60, 106], bh: 40, stamp: [112, 34], head: [230, 45] },
    dec: { w: 528, h: 172, tabs: [[10, 119], [141, 135], [288, 231]], tabH: 46, bodyY: 42, strip: [12, 53, 504, 113] },
    pay: { w: 800, h: 66 },
  };
  const G = A.G;

  A.titleCard = function () {
    return TX.sprite(G.title.w, G.title.h, (g, w, h) => {
      TX.paper(g, 0, 0, w, h, C.cream, { r: 2 });
      // punched index holes + a red rule, like a file label
      g.strokeStyle = 'rgba(179,38,30,0.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(10, 14); g.lineTo(w - 10, 14); g.moveTo(10, 17.5); g.lineTo(w - 10, 17.5); g.stroke();
      A.typed(g, 'THE', 15, 68, 60, null, { seed: 21 });
      A.typed(g, 'SEPARATED', 15, 131, 60, null, { seed: 22 });
      const ex = A.typed(g, 'FILE', 15, 194, 60, null, { seed: 23 });
      // ink sketch: a file in two pieces
      g.save(); g.translate(ex + 14, 176); g.rotate(-0.04);
      const fl = { fill: '#e9e2cf', line: C.ink, lw: 1.5, amp: 0.2 };
      g.save(); g.translate(-2, 3); g.rotate(0.13);
      A.file(g, (s) => ({ x: s, y: 0, nx: 0, ny: 1 }), 0, 24, (s) => 1.5 + 0.055 * s, (s) => s / 8, fl);
      g.restore();
      A.file(g, (s) => ({ x: 34 + s, y: 0, nx: 0, ny: 1 }), 0, 106, (s) => 1.5 + 0.055 * (s + 26), (s) => (s + 26) / 8, fl);
      for (const [an, l] of [[-1.25, 12], [-1.8, 9], [1.2, 11], [1.85, 8]]) A.stroke(g, [[29 + Math.cos(an) * 8, Math.sin(an) * 8], [29 + Math.cos(an) * (8 + l), Math.sin(an) * (8 + l)]], 1, { w: 3, color: C.red });
      g.restore();
    });
  };

  /** schematic periapical film: lower molar with a short radiopaque fragment in the curved mesial canal */
  A.film = function () {
    const FW = G.radio.film.w, FH = G.radio.film.h, S = 3;
    const out = mk(FW * S, FH * S), g = out.getContext('2d'); g.scale(S, S);
    const an = mk(FW * S, FH * S), q = an.getContext('2d'); q.scale(S, S);
    const r = rng(41);
    const bez = (P, u) => { const a = 1 - u; return [a * a * a * P[0][0] + 3 * a * a * u * P[1][0] + 3 * a * u * u * P[2][0] + u * u * u * P[3][0], a * a * a * P[0][1] + 3 * a * a * u * P[1][1] + 3 * a * u * u * P[2][1] + u * u * u * P[3][1]]; };
    const frame = (P, u) => { const p = bez(P, u), p2 = bez(P, Math.min(1, u + 0.01)), p1 = bez(P, Math.max(0, u - 0.01)); const tx = p2[0] - p1[0], ty = p2[1] - p1[1], l = Math.hypot(tx, ty) || 1; return { x: p[0], y: p[1], nx: ty / l, ny: -tx / l }; };
    const rootPoly = (P, w0, w1) => { const Lp = [], Rp = [], n = 30; for (let i = 0; i <= n; i++) { const u = i / n, f = frame(P, u), hw = lerp(w0, w1, Math.pow(u, 1.5)) * (u > 0.94 ? Math.sqrt(Math.max(0.05, (1 - u) / 0.06)) * 0.75 + 0.25 : 1); Lp.push([f.x + f.nx * hw, f.y + f.ny * hw]); Rp.push([f.x - f.nx * hw, f.y - f.ny * hw]); } return Lp.concat(Rp.reverse()); };
    const poly = (c, pts) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
    const canal = (c, P, w0, w1, col, u0 = 0.03, u1 = 0.965) => { c.strokeStyle = col; c.lineCap = 'round'; const n = 40; for (let i = 0; i < n; i++) { const a = lerp(u0, u1, i / n), b = lerp(u0, u1, (i + 1) / n), pa = bez(P, a), pb = bez(P, b); c.lineWidth = lerp(w0, w1, i / n); c.beginPath(); c.moveTo(pa[0], pa[1]); c.lineTo(pb[0], pb[1]); c.stroke(); } };

    q.fillStyle = '#0c1216'; q.fillRect(0, 0, FW, FH);
    const st = q.createLinearGradient(0, 40, 0, 125); st.addColorStop(0, 'rgba(40,50,58,0)'); st.addColorStop(1, 'rgba(40,50,58,0.85)'); q.fillStyle = st; q.fillRect(0, 40, FW, 90);
    const crest = (x) => 121 + 4 * Math.sin(x / 31 + 1);
    q.beginPath(); q.moveTo(0, crest(0)); for (let x = 0; x <= FW; x += 6) q.lineTo(x, crest(x)); q.lineTo(FW, FH); q.lineTo(0, FH); q.closePath();
    q.fillStyle = '#434f58'; q.fill();
    q.save(); q.clip();
    for (let i = 0; i < 1700; i++) { const x = r() * FW, y = 116 + r() * (FH - 116), rad = 1.1 + r() * 3.8; q.globalAlpha = 0.16 + r() * 0.3; q.fillStyle = r() < 0.52 ? '#202a31' : '#74838d'; q.beginPath(); q.ellipse(x, y, rad, rad * (0.4 + r() * 0.6), r() * 3, 0, 7); q.fill(); }
    q.globalAlpha = 1; q.restore();

    const ENAMEL = '#cdd6db', DENTIN = '#93a1aa', ROOT = '#8a98a1';
    const Pm = [[126, 112], [116, 158], [101, 212], [134, 244]], Pd = [[196, 112], [200, 158], [208, 206], [199, 245]];
    const tooth = (roots, crown, inner, trunk, pulp, canals) => {
      // periodontal ligament space + lamina dura around each root (below the crest only)
      q.save(); q.beginPath(); q.rect(0, 122, FW, FH); q.clip();
      for (const R of roots) { const pp = rootPoly(R[0], R[1] + 2.6, R[2] + 2.6); q.lineJoin = 'round'; poly(q, pp); q.strokeStyle = 'rgba(128,142,152,0.75)'; q.lineWidth = 2.8; q.stroke(); poly(q, pp); q.fillStyle = '#242e35'; q.fill(); }
      q.restore();
      for (const R of roots) { poly(q, rootPoly(R[0], R[1], R[2])); q.fillStyle = ROOT; q.fill(); }
      if (trunk) { poly(q, trunk); q.fillStyle = ROOT; q.fill(); }
      q.beginPath(); crown(q); q.fillStyle = ENAMEL; q.fill();
      q.beginPath(); inner(q); q.fillStyle = DENTIN; q.fill();
      if (pulp) { q.beginPath(); pulp(q); q.fillStyle = '#3b464e'; q.fill(); }
      for (const cn of canals) canal(q, cn[0], cn[1], cn[2], cn[3]);
    };
    // neighbours (cropped by the film edge)
    tooth([[[[28, 112], [26, 160], [21, 212], [27, 247]], 27, 5]],
      (c) => { c.moveTo(61, 114); c.bezierCurveTo(69, 96, 71, 74, 61, 56); c.bezierCurveTo(52, 43, 30, 40, 15, 48); c.bezierCurveTo(-1, 57, -9, 82, -4, 114); c.closePath(); },
      (c) => { c.moveTo(55, 114); c.bezierCurveTo(62, 96, 63, 76, 55, 61); c.bezierCurveTo(47, 50, 30, 47, 18, 54); c.bezierCurveTo(4, 62, -2, 86, 2, 114); c.closePath(); },
      null, (c) => { c.ellipse(29, 88, 7, 17, 0, 0, 7); }, [[[[29, 100], [27, 150], [22, 205], [26, 240]], 4.2, 1.4, '#3b464e']]);
    tooth([[[[272, 112], [268, 160], [264, 208], [275, 242]], 22, 5], [[[322, 112], [326, 160], [330, 208], [324, 244]], 22, 5]],
      (c) => { c.moveTo(253, 114); c.bezierCurveTo(245, 96, 243, 72, 251, 55); c.bezierCurveTo(259, 42, 284, 38, 300, 44); c.bezierCurveTo(318, 50, 334, 70, 336, 114); c.closePath(); },
      (c) => { c.moveTo(259, 114); c.bezierCurveTo(252, 96, 251, 74, 258, 61); c.bezierCurveTo(266, 49, 286, 46, 300, 51); c.bezierCurveTo(315, 57, 328, 78, 330, 114); c.closePath(); },
      [[250, 108], [336, 108], [336, 128], [300, 130], [296, 126], [292, 130], [252, 128]],
      (c) => { c.moveTo(274, 98); c.bezierCurveTo(272, 82, 278, 70, 286, 70); c.lineTo(316, 70); c.lineTo(318, 104); c.lineTo(296, 110); c.closePath(); },
      [[[[274, 104], [268, 160], [264, 208], [274, 238]], 4, 1.4, '#3b464e']]);
    // the case tooth
    tooth([[Pm, 25, 4.6], [Pd, 23, 5]],
      (c) => { c.moveTo(99, 114); c.bezierCurveTo(92, 100, 86, 84, 90, 66); c.bezierCurveTo(92, 52, 100, 42, 112, 38); c.bezierCurveTo(124, 34, 132, 42, 141, 44); c.lineTo(181, 44); c.bezierCurveTo(190, 42, 198, 34, 210, 38); c.bezierCurveTo(222, 42, 230, 52, 232, 66); c.bezierCurveTo(236, 84, 230, 100, 223, 114); c.closePath(); },
      (c) => { c.moveTo(105, 114); c.bezierCurveTo(99, 100, 95, 84, 98, 68); c.bezierCurveTo(100, 56, 108, 48, 118, 46); c.bezierCurveTo(126, 44, 132, 49, 140, 50); c.lineTo(182, 50); c.bezierCurveTo(190, 49, 196, 44, 204, 46); c.bezierCurveTo(214, 48, 222, 56, 224, 68); c.bezierCurveTo(227, 84, 223, 100, 217, 114); c.closePath(); },
      [[100, 108], [222, 108], [220, 128], [167, 131], [160, 126], [153, 131], [102, 128]],
      (c) => { c.moveTo(133, 98); c.bezierCurveTo(131, 80, 135, 66, 142, 62); c.lineTo(180, 62); c.bezierCurveTo(187, 66, 191, 80, 189, 98); c.bezierCurveTo(187, 110, 181, 117, 173, 115); c.lineTo(160, 110); c.lineTo(147, 115); c.bezierCurveTo(139, 117, 135, 110, 133, 98); c.closePath(); },
      [[Pm, 3.6, 1.5, '#333e46'], [Pd, 5.6, 2.3, '#2a343c']]);
    // open access cavity
    q.fillStyle = '#1b2329'; q.beginPath(); q.moveTo(143, 34); q.lineTo(179, 34); q.lineTo(183, 70); q.lineTo(139, 70); q.closePath(); q.fill();

    g.filter = `blur(${0.85 * S}px)`; g.drawImage(an, 0, 0, FW, FH); g.filter = 'none';
    // the separated instrument: short, radiopaque, at the apical curve
    const fu0 = 0.66, fu1 = 0.86, Fp = [];
    { const Lp = [], Rp = [], n = 14; for (let i = 0; i <= n; i++) { const u = lerp(fu0, fu1, i / n), f = frame(Pm, u), hw = lerp(2.0, 1.05, i / n); Lp.push([f.x + f.nx * hw, f.y + f.ny * hw]); Rp.push([f.x - f.nx * hw, f.y - f.ny * hw]); } Fp.push(...Lp, ...Rp.reverse()); }
    g.save(); g.shadowColor = 'rgba(235,245,255,0.9)'; g.shadowBlur = 5 * S; poly(g, Fp); g.fillStyle = '#f7fbfd'; g.fill(); g.shadowBlur = 0; g.fill(); g.restore();
    // film grain, burn-in at the edges, orientation dot
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.5; const np = g.createPattern(TX.noiseTile(256, 53, 70, 190), 'repeat'); np.setTransform(new DOMMatrix().scale(1.5 / S, 1.5 / S)); g.fillStyle = np; g.fillRect(0, 0, FW, FH);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const vg = g.createRadialGradient(FW / 2, FH / 2, 90, FW / 2, FH / 2, 235); vg.addColorStop(0, 'rgba(4,8,12,0)'); vg.addColorStop(1, 'rgba(4,8,12,0.62)'); g.fillStyle = vg; g.fillRect(0, 0, FW, FH);
    g.fillStyle = 'rgba(120,150,170,0.10)'; g.fillRect(0, 0, FW, FH);
    g.strokeStyle = 'rgba(200,215,225,0.55)'; g.lineWidth = 1.2; g.beginPath(); g.arc(FW - 16, 15, 4.2, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(200,215,225,0.2)'; g.fill();
    const fc = bez(Pm, (fu0 + fu1) / 2);
    return { c: out, w: FW, h: FH, frag: fc };
  };

  A.radioCard = function (film) {
    const R = G.radio;
    return TX.sprite(R.w, R.h, (g, w, h) => {
      TX.paper(g, 0, 0, w, h, C.paper, { r: 3 });
      g.save(); rr(g, R.film.x, R.film.y, R.film.w, R.film.h, 9); g.clip(); g.drawImage(film.c, R.film.x, R.film.y, R.film.w, R.film.h); g.restore();
      g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 1; rr(g, R.film.x, R.film.y, R.film.w, R.film.h, 9); g.stroke();
      const t = 'schematic', tw = A.typedW(g, t, 23);
      A.typed(g, t, w - 16 - tw, h - 20, 23, null, { alpha: 0.78, seed: 31 });
    });
  };

  A.exCard = function (which) {
    const E = G.ex;
    return TX.sprite(E.w, E.h, (g, w, h) => {
      TX.paper(g, 0, 0, w, h, C.paper, { r: 3 });
      g.save(); g.translate(E.photo.x, E.photo.y); g.beginPath(); g.rect(0, 0, PH.w, PH.h); g.clip(); photoBG(g, which); g.restore();
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1; g.strokeRect(E.photo.x, E.photo.y, PH.w, PH.h);
      if (which === 'A') { const t = 'Sattapan 2000, J Endod', tw = A.typedW(g, t, 22); A.typed(g, t, w - 12 - tw, h - 17, 22, null, { alpha: 0.75, seed: 33 }); }
    });
  };

  // ---- suspect (risk factor) index cards ----
  function indexCard(g, w, h) {
    TX.paper(g, 0, 0, w, h, C.index, { r: 3 });
    g.strokeStyle = 'rgba(70,110,170,0.20)'; g.lineWidth = 1;
    for (let y = 34; y < h - 6; y += 22) { g.beginPath(); g.moveTo(4, y); g.lineTo(w - 4, y); g.stroke(); }
    g.strokeStyle = 'rgba(179,38,30,0.5)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(4, 13); g.lineTo(w - 4, 13); g.stroke();
  }
  const INKW = 2.7;
  const ink = (g, w) => { g.strokeStyle = C.ink; g.fillStyle = C.ink; g.lineWidth = w || INKW; g.lineCap = 'round'; g.lineJoin = 'round'; };
  function canalIcon(g, R, fileHW) {                     // canal with a bend of radius R in a ~92 px box; optional file inside
    const xs = 24, top = 2, Ls = 30, cw = 9.5, ang = Math.PI / 2, tail = 92 - xs - R;
    const P = (d) => { if (d <= Ls) return { x: xs, y: top + d, nx: 1, ny: 0, tx: 0, ty: 1 }; const a = Math.min((d - Ls) / R, ang), tx = Math.sin(a), ty = Math.cos(a); let x = xs + R - R * Math.cos(a), y = top + Ls + R * Math.sin(a); const ov = d - Ls - R * ang; if (ov > 0) { x += tx * ov; y += ty * ov; } return { x, y, nx: ty, ny: -tx, tx, ty }; };
    const end = Ls + R * ang + tail;
    const wall = (side) => { g.beginPath(); for (let d = 0; d <= end; d += 2) { const p = P(d); const x = p.x + side * p.nx * cw, y = p.y + side * p.ny * cw; if (d) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); };
    g.save();
    g.beginPath(); for (let d = 0; d <= end; d += 2) { const p = P(d); g.lineTo(p.x + p.nx * cw, p.y + p.ny * cw); } for (let d = end; d >= 0; d -= 2) { const p = P(d); g.lineTo(p.x - p.nx * cw, p.y - p.ny * cw); } g.closePath(); g.fillStyle = 'rgba(207,180,138,0.55)'; g.fill();
    ink(g); wall(1); wall(-1);
    g.restore();
    return { P, end, Ls, R, xs, top };
  }
  const ICON = {
    curve(g) {
      const k = canalIcon(g, 24);
      const cx = k.xs + k.R, cy = k.top + k.Ls, a = Math.PI / 4, px = cx - k.R * Math.cos(a), py = cy + k.R * Math.sin(a);
      ink(g, 2); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, py); g.stroke(); g.setLineDash([]);
      g.beginPath(); g.arc(cx, cy, 2.6, 0, TAU); g.fill();
      g.font = 'italic 700 24px "Courier Prime"'; g.textBaseline = 'alphabetic'; g.fillText('r', cx + 4, cy - 6);
      const pts = []; for (let i = 0; i <= 14; i++) { const t = (i / 14) * Math.PI / 2, rr2 = k.R + 17; pts.push([cx - rr2 * Math.cos(t), cy + rr2 * Math.sin(t)]); }
      A.stroke(g, pts, 1, { w: 5, color: C.red });
    },
    big(g) {
      const k = canalIcon(g, 34);
      const D = k.Ls + k.R * Math.PI / 2 + 12;
      A.file(g, (s) => { const p = k.P(D - s); return { x: p.x, y: p.y, nx: p.nx, ny: p.ny }; }, 0, D - 1, (s) => 4.2 + 0.035 * s, (s) => s / 11, { fill: '#b9c0c8', line: C.ink, lw: 1.3, amp: 0.14 });
      // width callipers
      ink(g, 2.2); const y = 16; g.beginPath(); g.moveTo(44, y); g.lineTo(60, y); g.moveTo(44, y - 6); g.lineTo(44, y + 6); g.stroke();
      g.beginPath(); g.moveTo(36, y); g.lineTo(44, y - 4.5); g.lineTo(44, y + 4.5); g.closePath(); g.fill();
    },
    noglide(g) {
      g.save(); g.translate(46, 46); g.rotate(-0.72);
      // hand file: handle + stop + fine shaft
      ink(g, 2.2); rr(g, -38, -9, 26, 18, 5); g.fillStyle = '#e6dcc0'; g.fill(); g.stroke();
      g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(-33 + i * 5.5, -6); g.lineTo(-33 + i * 5.5, 6); } g.stroke();
      g.fillStyle = C.ink; g.beginPath(); g.moveTo(-12, -2.2); g.lineTo(40, -0.4); g.lineTo(40, 0.4); g.lineTo(-12, 2.2); g.closePath(); g.fill();
      rr(g, 0, -6, 5, 12, 2); g.fillStyle = '#8a8f96'; g.fill(); g.stroke();
      g.restore();
      A.stroke(g, A.ring(46, 46, 40, 40, { a0: -0.9, turns: 1.02, wob: 0.02, seed: 2 }), 1, { w: 6, color: C.red });
      A.stroke(g, [[18, 18], [74, 74]], 1, { w: 6, color: C.red });
    },
    force(g) {
      // file pushed apically: bold arrow on the handle
      A.file(g, (s) => ({ x: 46, y: 90 - s, nx: 1, ny: 0 }), 0, 44, (s) => 1.6 + 0.07 * s, (s) => s / 8, { fill: '#b9c0c8', line: C.ink, lw: 1.2, amp: 0.16 });
      ink(g, 2.2); rr(g, 39, 34, 14, 13, 2); g.fillStyle = '#d7d2c4'; g.fill(); g.stroke();
      g.fillStyle = C.ink; g.beginPath(); g.moveTo(37, 0); g.lineTo(55, 0); g.lineTo(55, 14); g.lineTo(66, 14); g.lineTo(46, 32); g.lineTo(26, 14); g.lineTo(37, 14); g.closePath(); g.fill();
      for (const sx of [-1, 1]) { A.stroke(g, [[46 + sx * 12, 80], [46 + sx * 24, 74]], 1, { w: 3.6, color: C.red }); A.stroke(g, [[46 + sx * 13, 90], [46 + sx * 27, 91]], 1, { w: 3.6, color: C.red }); }
    },
    reuse(g) {
      ink(g, 4.6); const r = rng(7);
      const bar = (x, y0, y1) => { g.beginPath(); g.moveTo(x + (r() - 0.5) * 3, y0); g.lineTo(x + (r() - 0.5) * 3, y1); g.stroke(); };
      for (let i = 0; i < 4; i++) bar(12 + i * 13, 22, 76);
      g.beginPath(); g.moveTo(3, 66); g.lineTo(60, 30); g.stroke();
      bar(76, 22, 76); bar(89, 24, 75); bar(102, 22, 77);
    },
    operator(g) {
      g.save(); rr(g, 0, 0, 100, 92, 2); g.clip();
      g.fillStyle = '#d8d0bd'; g.fillRect(0, 0, 100, 92);
      g.strokeStyle = 'rgba(43,37,32,0.55)'; g.lineWidth = 1.2; for (let y = 12; y < 92; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(100, y); g.stroke(); }
      g.fillStyle = '#34363b';
      g.beginPath(); g.moveTo(6, 92); g.bezierCurveTo(8, 68, 26, 62, 40, 60); g.lineTo(60, 60); g.bezierCurveTo(74, 62, 92, 68, 94, 92); g.closePath(); g.fill();
      g.fillRect(42, 50, 16, 14);
      g.beginPath(); g.ellipse(50, 35, 16.5, 20, 0, 0, TAU); g.fill();
      g.fillStyle = '#5d6168'; g.beginPath(); g.ellipse(50, 23, 17.5, 10, 0, Math.PI, TAU); g.fill();          // cap
      g.fillStyle = '#7d8189'; g.beginPath(); g.moveTo(36, 38); g.quadraticCurveTo(50, 34, 64, 38); g.lineTo(62, 50); g.quadraticCurveTo(50, 57, 38, 50); g.closePath(); g.fill();   // mask
      g.restore();
      g.strokeStyle = C.ink; g.lineWidth = 1.4; rr(g, 0, 0, 100, 92, 2); g.stroke();
    },
  };
  /** spec: {w, icon, lines:[..], lx, ix, fine} */
  A.susCard = function (spec) {
    return TX.sprite(spec.w, G.sus.h, (g, w, h) => {
      indexCard(g, w, h);
      g.save(); g.translate(spec.ix == null ? 20 : spec.ix, spec.fine ? 19 : 25); g.scale(0.88, 0.88); ICON[spec.icon](g); g.restore();
      const one = spec.lines.length === 1, px = one ? 37 : 31;
      const ys = one ? [spec.fine ? 78 : 84] : (spec.fine ? [55, 89] : [62, 98]);
      spec.lines.forEach((t, i) => A.typed(g, t, spec.lx, ys[i], px, null, { seed: 40 + i + spec.w }));
      if (spec.fine) A.typed(g, spec.fine, 16, h - 8, 22, null, { alpha: 0.75, seed: 47 });
    });
  };
  A.srcStrip = function (text, px) {
    const m = mk(4, 4).getContext('2d'), tw = A.typedW(m, text, px), w = tw + 20, h = px + 9;
    return TX.sprite(w, h, (g) => { TX.paper(g, 0, 0, w, h, '#ece4d0', { r: 1, blur: 4, dx: 1.5, dy: 3, sh: 0.4, edge: 0.5 }); A.typed(g, text, 10, h - 8, px, null, { alpha: 0.82, seed: 61 }); }, { pad: 12 });
  };

  A.prevCard = function () {
    const P = G.prev;
    return TX.sprite(P.w, P.h, (g, w, h) => {
      TX.paper(g, 0, 0, w, h, C.legal, { r: 2 });
      g.strokeStyle = 'rgba(60,110,170,0.33)'; g.lineWidth = 1;
      for (const y of [62, P.fine + 8, P.rows[1] + 9, P.rows[2] + 9]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.strokeStyle = 'rgba(190,60,50,0.5)'; g.lineWidth = 1.1; for (const x of [54, 57.5]) { g.beginPath(); g.moveTo(x, 18); g.lineTo(x, h); g.stroke(); }
      // gummed binding at the top
      const bg = g.createLinearGradient(0, 0, 0, 18); bg.addColorStop(0, '#7a2a1d'); bg.addColorStop(1, '#5a1c12'); g.fillStyle = bg; g.fillRect(0, 0, w, 18);
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 2, w, 2);
      ink(g, 2.2);
      for (const b of P.rows) { g.strokeRect(P.box + (hash(b, 3) - 0.5) * 2, b - 25, 27, 27); }
    });
  };

  A.bagCard = function () {
    const Bg = G.bag;
    return TX.sprite(Bg.w, Bg.h, (g, w, h) => {
      g.save(); g.shadowColor = 'rgba(26,13,4,0.45)'; g.shadowBlur = 8 * TX.SPR; g.shadowOffsetX = 3 * TX.SPR; g.shadowOffsetY = 5 * TX.SPR;
      rr(g, 0, 0, w, h, 5); g.fillStyle = 'rgba(226,232,228,0.62)'; g.fill(); g.restore();
      g.save(); rr(g, 0, 0, w, h, 5); g.clip();
      g.fillStyle = '#a8231c'; g.fillRect(0, 0, w, 30);
      g.fillStyle = '#fff5e8'; g.font = '21px Anton'; g.textBaseline = 'alphabetic'; let x = 12; for (const ch of 'EVIDENCE') { g.fillText(ch, x, 23); x += g.measureText(ch).width + 3; }
      g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(150 + i * 20, 6); g.lineTo(162 + i * 20, 24); g.stroke(); }
      g.strokeStyle = 'rgba(40,60,90,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 35); g.lineTo(w, 35); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 37.5); g.lineTo(w, 37.5); g.stroke();
      // the label
      g.fillStyle = '#f7f3ea'; g.fillRect(10, 44, 232, 36); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.strokeRect(10, 44, 232, 36);
      A.typed(g, '@natebrooksendo', 20, 70, 25, null, { seed: 71 });
      // the two pieces
      g.save(); g.translate(14, 103); g.rotate(-0.018);
      A.file(g, (s) => ({ x: 236 - s, y: 0, nx: 0, ny: -1 }), 0, 236, (s) => (s < 170 ? 2.6 + 0.03 * s : 6.6), (s) => s / 10, { fill: '#c9d0d6', lw: 1.1, amp: 0.15, flEnd: 170 });
      rr(g, -4, -8.5, 30, 17, 3); g.fillStyle = '#9aa1a8'; g.fill(); g.strokeStyle = 'rgba(34,42,52,0.9)'; g.lineWidth = 1.1; g.stroke();
      g.restore();
      g.save(); g.translate(266, 100); g.rotate(0.2);
      A.file(g, (s) => ({ x: 36 - s, y: 0, nx: 0, ny: -1 }), 0, 36, (s) => 1.5 + 0.03 * s, (s) => s / 10, { fill: '#c9d0d6', lw: 1.1, amp: 0.15 });
      g.restore();
      // plastic sheen
      const sh = g.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.42, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.56, 'rgba(255,255,255,0.05)'); sh.addColorStop(0.7, 'rgba(255,255,255,0.22)'); sh.addColorStop(0.76, 'rgba(255,255,255,0)');
      g.fillStyle = sh; g.fillRect(0, 30, w, h);
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.2; rr(g, 0.6, 0.6, w - 1.2, h - 1.2, 5); g.stroke();
      g.strokeStyle = 'rgba(60,70,80,0.35)'; g.lineWidth = 1; rr(g, 3.5, 3.5, w - 7, h - 7, 3); g.stroke();
    });
  };

  A.progCard = function () {
    const P = G.prog;
    return TX.sprite(P.w, P.h, (g, w, h) => {
      TX.paper(g, 0, 0, w, h, '#f6f2e8', { r: 2 });
    });
  };

  /** empty 0-100 % bar tracks + the source line of the prognosis card (fade in with the scene) */
  A.progForm = function (g, a) {
    if (a <= 0) return;
    const P = G.prog;
    g.save(); g.globalAlpha = a;
    for (const y of P.bars) {
      g.fillStyle = 'rgba(60,48,36,0.07)'; g.fillRect(P.x0, y, P.W100, P.bh);
      g.strokeStyle = 'rgba(43,37,32,0.35)'; g.lineWidth = 1; g.strokeRect(P.x0, y, P.W100, P.bh);
    }
    g.strokeStyle = 'rgba(43,37,32,0.6)'; g.lineWidth = 1.2;
    for (const f of [0, 0.5, 1]) { const x = P.x0 + P.W100 * f; g.beginPath(); g.moveTo(x, P.bars[1] + P.bh); g.lineTo(x, P.bars[1] + P.bh + 5); g.stroke(); }
    g.restore();
    A.typed(g, 'Spili 2005, J Endod · 146 matched pairs', P.x0, P.h - 9, 22, null, { alpha: 0.75 * a, seed: 81 });
  };

  function tabPath(g, x, w, h, top) { const s = 9; g.beginPath(); g.moveTo(x - s, top + h); g.lineTo(x + 2, top + 5); g.quadraticCurveTo(x + 4, top, x + 10, top); g.lineTo(x + w - 10, top); g.quadraticCurveTo(x + w - 4, top, x + w - 2, top + 5); g.lineTo(x + w + s, top + h); g.closePath(); }
  A.tabSprite = function (i, label) {
    const D = G.dec, [x, w] = D.tabs[i];
    return TX.sprite(D.w, D.tabH + 10, (g) => {
      TX.paper(g, x - 12, 0, w + 24, D.tabH + 10, i === 2 ? '#dccba2' : C.manila, { r: 0, blur: 5, dx: 1.5, dy: 2, sh: 0.4, path: (c) => tabPath(c, x, w, D.tabH + 10, 0) });
      g.fillStyle = C.ink; g.globalAlpha = 0.93; g.font = '32px Anton'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
      g.fillText(label, x + w / 2, 35);
    }, { pad: 14 });
  };
  A.decBody = function () {
    const D = G.dec, [sx, sy, sw, sh] = D.strip;
    return TX.sprite(D.w, D.h, (g, w, h) => {
      TX.paper(g, 0, D.bodyY, w, h - D.bodyY, C.manila, { r: 3 });
      g.strokeStyle = 'rgba(120,86,40,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, D.bodyY + 6); g.lineTo(w, D.bodyY + 6); g.stroke();
      g.save(); g.translate(sx + sw / 2, sy + sh / 2); g.rotate(0.004); g.translate(-sw / 2, -sh / 2);
      TX.paper(g, 0, 0, sw, sh, '#f6f2e8', { r: 1, blur: 4, dx: 1.5, dy: 2.5, sh: 0.4, edge: 0.6 });
      g.restore();
    });
  };
  /** tiny canal-with-a-bend pictogram; pos = 'before' | 'beyond' (where the fragment sits relative to the curve) */
  A.posIcon = function (g, x, y, pos, k) {
    if (k <= 0) return;
    g.save(); g.translate(x + 23, y + 22); g.scale(k, k); g.translate(-23, -22);
    const pts = [[9, 1], [9, 16]]; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI / 2; pts.push([9 + 16 - 16 * Math.cos(a), 16 + 16 * Math.sin(a)]); } pts.push([45, 32]);
    A.stroke(g, pts, 1, { w: 13, color: C.ink, alpha: 1 }); A.stroke(g, pts, 1, { w: 8.4, color: '#efe2c4', alpha: 1 });
    const f = pos === 'before' ? [[9, 3], [9, 15]] : [[30, 32], [43, 32]];
    A.stroke(g, f, 1, { w: 5.2, color: C.red, alpha: 1 });
    g.restore();
  };

  A.payCard = function () {
    const P = G.pay;
    return TX.sprite(P.w, P.h, (g, w, h) => {
      const r = rng(19);
      const torn = (c) => { c.beginPath(); c.moveTo(4, 0); c.lineTo(w - 3, 0); for (let y = 0; y <= h; y += 5) c.lineTo(w - 2 - r() * 5, y); c.lineTo(3, h); for (let y = h; y >= 0; y -= 5) c.lineTo(2 + r() * 5, y); c.closePath(); };
      const pts = []; torn({ beginPath() {}, closePath() {}, moveTo: (x, y) => pts.push([x, y]), lineTo: (x, y) => pts.push([x, y]) });
      const path = (c) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
      TX.paper(g, 0, 0, w, h, '#f1e7c9', { r: 0, path, blur: 6, dx: 2, dy: 4, sh: 0.45, edge: 0.5 });
      g.save(); path(g); g.clip();
      g.strokeStyle = 'rgba(150,120,70,0.10)'; g.lineWidth = 1; for (let y = 3; y < h; y += 3) { g.beginPath(); g.moveTo(0, y + r()); g.lineTo(w, y + r()); g.stroke(); }
      g.restore();
    }, { pad: 18 });
  };

  window.ART = A;
})();
