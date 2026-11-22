/* 02 · How ibuprofen turns down pulpal pain (COX inhibition)
 * Style: flat pastel vector — cream/peach ground, rounded shapes, mint / coral / lilac / butter, crisp offset shadows, Nunito.
 * Story: hook (what ibuprofen can't undo) -> dive into the pulp -> inside a pulp cell: PLA2 frees arachidonic acid -> AA snakes
 *        into the COX channel -> PGH2 -> PGE synthase stamps PGE2 -> PGE2 leaves the cell and lands on nociceptor EP receptors
 *        -> threshold drops, firing meter "turns up" -> ibuprofen reversibly plugs the channel (one AA slips through when it
 *        unbinds) -> much less new PGE2, existing PGE2 clears -> nerve calms (partly: other mediators still act) -> takeaway.
 * Everything is a pure function of t (deterministic). See NOTES.md for sources.
 */
(() => {
  const { canvas, ctx: mainCtx } = Kit.createCanvas();
  let ctx = mainCtx; // drawing target; temporarily swapped to the layer canvas for dimmed (non-focal) groups
  const { seg, ease, clamp, lerp, W, H, hash, noise1 } = Kit;
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ palette & type
  const C = {
    bgTop: '#FFF7EE', bgBot: '#FFE6D4',
    ink: '#3A2E4D', ink2: '#66587A', ink3: '#9C8FAB',
    mint: '#A8E6CF', mintMid: '#8FD9BE', mintGroove: '#7DCDB0', mintDeep: '#3E9C80', mintText: '#215E4C',
    coral: '#FF8E7A', coralLight: '#FFC6B8', coralDark: '#D5543D', coralText: '#B8432E',
    pgh: '#FFE6DE', pghDark: '#E7AE9F',
    lilac: '#CDB8F4', lilacMid: '#B49DEA', lilacDark: '#7B60C2',
    butter: '#FFDE85', butterDark: '#D7A02A', butterLight: '#FFF1C4',
    sky: '#A2CDF7', skyDark: '#4A84CC', skyLight: '#DCEBFC',
    peach: '#FFD5BE', tail: '#F0C2A0', belt: '#EBC6AD', beltStripe: '#F7DECD', roller: '#D9A98A',
    door: '#F3B496', doorDark: '#D58E6C',
  };
  const FONT = 'Nunito, "DejaVu Sans", sans-serif';
  const F = (w, s) => `${w} ${s}px ${FONT}`;

  const sine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
  const tri = (t, a, b, c) => (t <= a || t >= c ? 0 : t < b ? (t - a) / (b - a) : 1 - (t - b) / (c - b));
  const outBack = ease.outBack;

  // ------------------------------------------------------------------ timeline
  const TL = {
    T0: 3.0, dt: 0.85, maxQueue: 2,
    block: 11.05,                 // ibuprofen A seats in the channel mouth
    ibA: [10.3, 11.05], ibB: [10.5, 11.3],
    pop: 12.3,                    // A unbinds (reversible) ...
    slip: [12.35, 12.85],         // ... the first queued AA slips in to the active site ...
    ibBseat: [12.55, 12.95],      // ... and the waiting ibuprofen B re-plugs the channel
    advance: [12.6, 13.05],       // second queued AA moves up to the plug
    punch: [11.0, 11.6],
    clear0: 13.4,
    card: 16.8, fadeOut: 21.72, loopEnd: 21.97, end: 22,
  };
  // caption beats: hook | AA | COX | threshold | ibuprofen | calms | card
  const BEATS = [2.45, 5.35, 7.45, 10.3, 13.5, TL.card];
  const CAPS = [
    { a: 0.0, b: BEATS[0], text: 'What ibuprofen\n*can’t* undo', size: 78, lh: 90, y0: 352, hi: C.sky },
    { a: BEATS[0], b: BEATS[1], text: 'Inflamed pulp frees\n*arachidonic acid*', hi: C.butter },
    { a: BEATS[1], b: BEATS[2], text: '*COX* makes prostaglandins', hi: C.mint },
    { a: BEATS[2], b: BEATS[3], text: 'PGE_2 *lowers* the\nfiring threshold', hi: C.coralLight },
    { a: BEATS[3], b: BEATS[4], text: '*Ibuprofen* reversibly plugs\nthe COX channel', hi: C.sky },
    { a: BEATS[4], b: BEATS[5], text: 'Less new PGE_2 ->\nnerve *calms*', hi: C.lilac },
  ];
  // focus: alpha of each group per beat (hook, B1..B5, card); one focal point at a time
  const FOC = {
    mem: [1, 1, 0.4, 0.4, 0.4, 0.4, 0.4],
    aa: [1, 1, 0.55, 0.4, 1, 0.45, 0.45],
    cox: [1, 0.4, 1, 0.45, 1, 0.6, 0.6],
    nerve: [1, 0.4, 0.45, 1, 0.4, 1, 1],
    ibu: [1, 1, 1, 1, 1, 0.65, 0.65],
  };
  function foc(g, t) {
    const a = FOC[g]; let v = a[0];
    for (let i = 0; i < BEATS.length; i++) v = lerp(v, a[i + 1], ease.smooth(seg(t, BEATS[i] - 0.15, BEATS[i] + 0.15)));
    return v;
  }

  // ------------------------------------------------------------------ small drawing helpers
  function shadowOn(dy = 8, a = 0.15) { ctx.shadowColor = `rgba(150,92,70,${a})`; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = dy; ctx.shadowBlur = 0; }
  function shadowOff() { ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowOffsetY = 0; }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function circle(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
  function poly(pts, w, col) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
    ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function chevron(x, y, dir, size, col, w = 6) { // dir 1 = down, -1 = up
    poly([[x - size, y - dir * size * 0.55], [x, y + dir * size * 0.55], [x + size, y - dir * size * 0.55]], w, col);
  }
  function bez(p0, p1, p2, p3, n = 32) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      out.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
        v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]);
    }
    return out;
  }
  function line(a, b, n = 8) { const o = []; for (let i = 0; i <= n; i++) o.push([lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); return o; }
  function join(...arrs) { const o = []; arrs.forEach((a, k) => a.forEach((p, i) => { if (k && !i) return; o.push(p); })); return o; }
  class Path {
    constructor(pts) {
      this.p = pts; this.c = [0];
      for (let i = 1; i < pts.length; i++) this.c.push(this.c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      this.len = this.c[this.c.length - 1];
    }
    at(s) {
      const p = this.p, c = this.c, n = p.length;
      if (s <= 0) { const a = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]); return [p[0][0] + Math.cos(a) * s, p[0][1] + Math.sin(a) * s, a]; }
      if (s >= this.len) { const a = Math.atan2(p[n - 1][1] - p[n - 2][1], p[n - 1][0] - p[n - 2][0]); const e = s - this.len; return [p[n - 1][0] + Math.cos(a) * e, p[n - 1][1] + Math.sin(a) * e, a]; }
      let lo = 0, hi = n - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
      const u = (s - c[lo]) / (c[hi] - c[lo] || 1);
      return [lerp(p[lo][0], p[hi][0], u), lerp(p[lo][1], p[hi][1], u), Math.atan2(p[hi][1] - p[lo][1], p[hi][0] - p[lo][0])];
    }
    sAtX(x) { let best = 0, bd = 1e9; for (let i = 0; i < this.p.length; i++) { const d = Math.abs(this.p[i][0] - x); if (d < bd) { bd = d; best = this.c[i]; } } return best; }
  }

  // ---- rich text: *highlight*, _2 subscript, -> drawn arrow, ↑ ↓ drawn arrows (Nunito lacks ₂ and arrows, so we draw them)
  function parseRich(str) {
    const out = []; let hi = false, buf = '';
    const push = () => { if (buf) out.push({ k: 't', s: buf, hi }); buf = ''; };
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === '*') { push(); hi = !hi; continue; }
      if (c === '_') { push(); let s = ''; while (i + 1 < str.length && /\d/.test(str[i + 1])) s += str[++i]; out.push({ k: 's', s, hi }); continue; }
      if (c === '-' && str[i + 1] === '>') { push(); out.push({ k: 'a', hi }); i++; continue; }
      if (c === '↑' || c === '↓') { push(); out.push({ k: c === '↑' ? 'u' : 'd', hi }); continue; }
      buf += c;
    }
    push(); return out;
  }
  function tokW(tk, size, weight) {
    if (tk.k === 'a') return size * 0.98;
    if (tk.k === 'u' || tk.k === 'd') return size * 0.62;
    ctx.font = F(weight, tk.k === 's' ? Math.round(size * 0.64) : size);
    return ctx.measureText(tk.s).width + (tk.k === 's' ? size * 0.05 : 0);
  }
  function richWidth(str, size, weight = 900) { return parseRich(str).reduce((w, tk) => w + tokW(tk, size, weight), 0); }
  function drawRich(str, x, y, o) {
    const size = o.size, weight = o.weight || 900, toks = parseRich(str);
    const ws = toks.map((tk) => tokW(tk, size, weight));
    const total = ws.reduce((a, b) => a + b, 0);
    let x0 = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    if (o.hiBg) { // highlighter swash behind *runs*
      let cx = x0, run = null; const runs = [];
      toks.forEach((tk, i) => { if (tk.hi) { if (!run) run = [cx, cx]; run[1] = cx + ws[i]; } else if (run) { runs.push(run); run = null; } cx += ws[i]; });
      if (run) runs.push(run);
      const p = o.hiProg == null ? 1 : o.hiProg;
      runs.forEach(([a, b]) => {
        const pad = size * 0.14, w = (b - a + pad * 2) * p;
        if (w <= 1) return;
        rr(a - pad, y - size * 0.47, w, size * 0.58, size * 0.16); ctx.fillStyle = o.hiBg; ctx.fill();
      });
    }
    let cx = x0;
    toks.forEach((tk, i) => {
      const col = tk.hi && o.hiColor ? o.hiColor : o.color;
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      if (tk.k === 't') { ctx.font = F(weight, size); ctx.fillText(tk.s, cx, y); }
      else if (tk.k === 's') { ctx.font = F(weight, Math.round(size * 0.64)); ctx.fillText(tk.s, cx + size * 0.02, y + size * 0.2); }
      else if (tk.k === 'a') {
        const ay = y - size * 0.3, ax0 = cx + size * 0.14, ax1 = cx + size * 0.84, hs = size * 0.2;
        ctx.lineWidth = Math.max(3, size * 0.085); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.moveTo(ax1 - hs, ay - hs); ctx.lineTo(ax1, ay); ctx.lineTo(ax1 - hs, ay + hs); ctx.stroke();
      } else { // vertical arrow
        const ax = cx + size * 0.31, top = y - size * 0.68, bot = y + size * 0.02, hs = size * 0.19, dn = tk.k === 'd';
        ctx.lineWidth = Math.max(3, size * 0.09); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, bot);
        if (dn) { ctx.moveTo(ax - hs, bot - hs); ctx.lineTo(ax, bot); ctx.lineTo(ax + hs, bot - hs); }
        else { ctx.moveTo(ax - hs, top + hs); ctx.lineTo(ax, top); ctx.lineTo(ax + hs, top + hs); }
        ctx.stroke();
      }
      cx += ws[i];
    });
    return total;
  }

  // ---- label pill (white, rounded, coloured dot) centred at x,y
  function pill(x, y, text, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha;
    if (a <= 0.01) return;
    const size = o.size || 32, dot = o.dot;
    const tw = richWidth(text, size, 800);
    const w = tw + size * 1.1 + (dot ? size * 0.78 : 0), h = size * 1.6;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
    const sc = o.scale == null ? 1 : o.scale; ctx.scale(sc, sc);
    shadowOn(5, 0.14); rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.bg || '#FFFFFF'; ctx.fill(); shadowOff();
    let tx = -w / 2 + size * 0.55;
    if (dot) { circle(tx + size * 0.24, 0, size * 0.24, dot); tx += size * 0.78; }
    drawRich(text, tx, size * 0.36, { size, weight: 800, color: o.color || C.ink, align: 'left' });
    ctx.restore();
    return w;
  }
  const life = (t, a, b, fi = 0.35, fo = 0.3) => (t < a || t > b ? 0 : Math.min(seg(t, a, a + fi, ease.out), 1 - seg(t, b - fo, b)));
  const popS = (t, a) => 0.82 + 0.18 * outBack(seg(t, a, a + 0.4));

  // ---- layers: a dimmed group is drawn on an offscreen canvas, then composited once at its focus alpha
  let layer = null, layerCtx = null;
  function group(alpha, fn) {
    if (alpha <= 0.01) return;
    if (alpha >= 0.995) { fn(); return; }
    ctx = layerCtx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); shadowOff();
    fn();
    ctx = mainCtx;
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(layer, 0, 0); ctx.restore();
  }

  // ------------------------------------------------------------------ geometry
  const MEM = { topY: 478, botY: 594, r: 19, sp: 44, x0: 20, n: 25, clipY: 548 };
  const LM = { topY: 1044, botY: 1088, r: 12, sp: 34, x0: 14, n: 31, doorX: 921, doorL: 884, doorR: 958 }; // lower cell membrane
  const DOOR = [LM.doorX, 1066];
  const SLOT_X = [240, 284];
  const M = [452, 737], A = [580, 806], E = [772, 858], BELT_END = [968, 852];
  const DOCK = [448, 720], DOCK_ANG = 0.52, DOCK_SC = 1.35;
  const STAMP_X = 902;
  const L_AA = 96, HEAD0 = 95, HEAD_T = 1.45;
  const tunnelPts = join(bez(M, [512, 770], [536, 806], A, 24), bez(A, [646, 806], [704, 858], E, 24));
  const aaPaths = SLOT_X.map((x) => new Path(join(line([x, 500], [x, 640], 14), bez([x, 640], [x, 702], [M[0] - 92, M[1] - 52], M, 30), bez(M, [512, 770], [536, 806], A, 24))));
  const S_MOUTH = aaPaths.map((p) => p.c[14 + 30]);
  const S_A = aaPaths.map((p) => p.len);
  const PLUG_GAP = 114; // queued AA head stops this far (arc length) before the mouth: it bumps the docked plug's tail
  const Q = new Path(join(bez(A, [646, 806], [704, 858], E, 24), line([E[0], E[1] - 6], BELT_END, 20)));
  const S_STAMP = Q.sAtX(STAMP_X);
  const tHead = (slot, s) => { const v = clamp((s - HEAD0) / (S_A[slot] - HEAD0)); return HEAD_T * (Math.acos(1 - 2 * v) / Math.PI); };

  // nerve (outside the cell, below the lower membrane)
  const NV = {
    main: join(line([-70, 1292], [600, 1292], 20), bez([600, 1292], [704, 1292], [832, 1262], [842, 1190], 24)),
    b1: bez([262, 1292], [322, 1292], [352, 1234], [356, 1174], 20),
    b2: bez([410, 1292], [478, 1292], [516, 1222], [520, 1158], 20),
    b3: bez([540, 1292], [618, 1290], [672, 1230], [680, 1166], 20),
  };
  const tipsOf = [NV.b1, NV.b2, NV.b3, NV.main].map((pts) => {
    const n = pts.length, a = Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]);
    return { x: pts[n - 1][0], y: pts[n - 1][1], a };
  });
  const RECEPT = [];
  tipsOf.forEach((tp) => [-0.86, 0.86].forEach((d) => { const a = tp.a + d; RECEPT.push({ x: tp.x + Math.cos(a) * 37, y: tp.y + Math.sin(a) * 37, a }); }));
  const pulsePath = new Path(join(NV.b2.slice().reverse(), line([410, 1292], [-80, 1292], 20)));
  // one bound PGE2 per ending tip (cup index into RECEPT)
  const BIND = [1, 3, 5, 7]; // all on the up-right cup so bound molecules never point at each other
  const FREE = [[432, 1202], [420, 1250], [598, 1200], [582, 1250], [748, 1232]]; // free PGE2 sit in the gaps between endings

  // ------------------------------------------------------------------ molecule schedule (precomputed, deterministic)
  const P = { pop: 0.12, stamp: 0.38, made: 0.45, off: 0.52, drop: 0.7, land: 1.65 }; // product timing after the active site
  const mols = [];
  (function schedule() {
    let q = 0, prod = 0;
    for (let i = 0; i < 40; i++) {
      const s = TL.T0 + i * TL.dt, slot = i % 2;
      const m = { i, s, slot, path: aaPaths[slot] };
      if (s + tHead(slot, S_MOUTH[slot] - PLUG_GAP) > TL.block - 0.1) {
        if (q >= TL.maxQueue) break;
        m.queued = true; m.q = q++;
        m.sStop = S_MOUTH[slot] - PLUG_GAP - m.q * (L_AA + 44);
        m.tStop = s + tHead(slot, m.sStop);
        if (m.q === 0) { m.slipper = true; m.tA = TL.slip[1]; m.k = prod++; }
        else { m.sStop2 = S_MOUTH[slot] - PLUG_GAP; }
      } else { m.k = prod++; m.tA = s + HEAD_T; }
      mols.push(m);
    }
  })();
  const PROD = mols.filter((m) => m.k != null).sort((a, b) => a.k - b.k);
  const REG = PROD.filter((m) => !m.slipper);
  const SLIP = PROD.find((m) => m.slipper);
  const NREG = REG.length;
  const spawnTimes = mols.map((m) => m.s);
  (function targets() {
    const order = (k) => (k * 4) % NREG;
    REG.forEach((m) => {
      if (m.k < BIND.length) m.cup = BIND[m.k]; else { const f = FREE[(m.k - BIND.length) % FREE.length]; m.tx = f[0]; m.ty = f[1]; m.ta = (hash(m.k, 11) - 0.5) * 0.9; }
      m.clear = TL.clear0 + 1.6 * (order(m.k) / Math.max(1, NREG - 1));
    });
    SLIP.cup = BIND[REG.find((m) => order(m.k) === 0).k]; SLIP.clear = 1e9; // re-binds the first receptor to be cleared, stays (residual)
    PROD.forEach((m) => {
      m.made = m.tA + P.made; m.land = m.tA + P.land;
      if (m.cup != null) { const r = RECEPT[m.cup]; m.tx = r.x + Math.cos(r.a) * 34; m.ty = r.y + Math.sin(r.a) * 34; m.ta = r.a; m.bound = true; }
      const dx = m.tx - DOOR[0];
      m.fall = new Path(join(bez(BELT_END, [994, 920], [DOOR[0], 980], DOOR, 18), bez(DOOR, [DOOR[0], 1128], [m.tx - dx * 0.25, m.ty - 70], [m.tx, m.ty], 30)));
      m.sDoor = m.fall.c[18];
    });
  })();
  TL.lastMade = Math.max(...REG.map((m) => m.made));
  const LAST_K = NREG - 1;
  const PAUSES = [[TL.lastMade, TL.pop], [SLIP.made, 99]]; // counter paused (pause badge) intervals

  // machine speed (belt, gear, lamps) and its integral, tabulated once (deterministic)
  function speed(t) {
    const a = seg(t, TL.T0 - 0.2, TL.T0 + 0.2) * (1 - seg(t, TL.lastMade + 0.15, TL.lastMade + 0.65));
    const b = seg(t, SLIP.tA - 0.15, SLIP.tA) * (1 - seg(t, SLIP.made + 0.15, SLIP.made + 0.65));
    return Math.max(a, b);
  }
  const GA = []; { let acc = 0; for (let k = 0; k <= 22 * 240; k++) { GA.push(acc); acc += 2.4 * speed(k / 240) / 240; } }
  const gearAngle = (t) => { const x = clamp(t, 0, 22) * 240, i = Math.floor(x); return lerp(GA[i], GA[Math.min(i + 1, GA.length - 1)], x - i); };

  // sensitisation S(t) from PGE2 present near the nerve (toy model)
  function presence(m, t) { return seg(t, m.land - 0.25, m.land + 0.05) * (1 - seg(t, m.clear, m.clear + 0.6)); }
  function sens(t) { let s = 0; for (const m of PROD) s += presence(m, t); return clamp(s / 8); }
  // sensitisation already established (and other mediators) keeps the threshold from fully recovering (toy model)
  const floorS = (t) => 0.55 * seg(t, 9.0, 12.5, ease.smooth); // -> threshold settles ~0.60 (peak 0.40, start 0.88)
  const thresh = (t) => lerp(0.88, 0.4, ease.smooth(Math.max(sens(t), floorS(t))));
  const BUMP = 0.19;
  const BR = Kit.rng(1500), BJ = [], BA = []; // seed chosen so firing starts ~8 s, is dense 9.5-13.5 s and settles to ~1 spike per 1-1.5 s
  for (let j = 0; j < 220; j++) { BJ.push((BR() - 0.5) * 0.07); BA.push(0.1 + 0.7 * BR()); }
  const bumpT = (j) => j * BUMP + (j >= 0 && j < 220 ? BJ[j] : 0);
  const bumpA = (j) => (j >= 0 && j < 220 ? BA[j] : 0.2);
  const spikeCache = new Map();
  function isSpike(j) {
    if (spikeCache.has(j)) return spikeCache.get(j);
    const b = bumpT(j); const v = b > 4.5 && bumpA(j) > thresh(b);
    spikeCache.set(j, v); return v;
  }

  // ------------------------------------------------------------------ molecule art
  function pentagon(r) { const o = []; for (let k = 0; k < 5; k++) { const a = Math.PI + (k * TAU) / 5; o.push([Math.cos(a) * r, Math.sin(a) * r]); } return o; }
  const PENT = pentagon(19);
  const PG_UP = [[15, -11], [29, -22], [45, -12], [61, -24], [77, -14], [93, -26], [106, -19]];
  const PG_LO = [[15, 11], [29, 22], [45, 14], [61, 26], [77, 16], [93, 28], [104, 22]];
  function pentPath() { ctx.beginPath(); PENT.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
  function drawPG(x, y, ang, sc, kind, alpha = 1, key = 0) {
    if (alpha <= 0.01 || sc <= 0.01) return;
    const E2 = kind === 'E';
    const fill = E2 ? C.coral : C.pgh, dark = E2 ? C.coralDark : C.pghDark;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc); ctx.translate(-44, 0);
    if (key > 0) { // white keyline (key = screen px)
      const kw = (key * 2) / sc;
      poly(PG_UP, 14 + kw, '#FFFFFF'); poly(PG_LO, 14 + kw, '#FFFFFF');
      pentPath(); ctx.lineWidth = 7 + kw; ctx.strokeStyle = '#FFFFFF'; ctx.lineJoin = 'round'; ctx.stroke();
      if (E2) { circle(-11, -35, 7.5 + kw / 2, '#FFFFFF'); circle(-11, 33, 6 + kw / 2, '#FFFFFF'); } else { circle(-20, -8, 6 + kw / 2, '#FFFFFF'); circle(-20, 8, 6 + kw / 2, '#FFFFFF'); }
      circle(63, 41, 5.5 + kw / 2, '#FFFFFF'); circle(108, -19, 6.5 + kw / 2, '#FFFFFF');
    }
    shadowOn(4, 0.14);
    poly(PG_UP, 14, dark); poly(PG_LO, 14, dark);
    pentPath(); ctx.lineWidth = 7; ctx.strokeStyle = dark; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fillStyle = dark; ctx.fill();
    shadowOff();
    if (E2) {
      poly([[-6, -18], [-10, -31]], 9, dark); circle(-11, -35, 7.5, dark); circle(-11, -35, 4, '#FFF4EF'); // C9 =O
      poly([[-6, 18], [-10, 30]], 9, dark); circle(-11, 33, 6, dark); circle(-11, 33, 3, '#FFF4EF'); // C11 -OH
      poly([[61, 26], [63, 39]], 8, dark); circle(63, 41, 5.5, dark); circle(63, 41, 2.6, '#FFF4EF'); // C15 -OH
    } else {
      ctx.beginPath(); ctx.moveTo(-6, -18); ctx.quadraticCurveTo(-34, 0, -6, 18); ctx.lineWidth = 9; ctx.strokeStyle = dark; ctx.stroke(); // endoperoxide bridge
      circle(-20, -8, 6, dark); circle(-20, 8, 6, dark); circle(-20, -8, 3, '#FFF4EF'); circle(-20, 8, 3, '#FFF4EF');
      poly([[61, 26], [63, 39]], 8, dark); circle(63, 41, 5.5, dark); circle(63, 41, 2.6, '#FFF4EF');
    }
    poly(PG_UP, 7, fill); poly(PG_LO, 7, fill);
    pentPath(); ctx.fillStyle = fill; ctx.fill();
    circle(-4, -4, 5, 'rgba(255,255,255,0.55)');
    circle(108, -19, 6.5, dark); // COOH end
    ctx.restore();
  }

  const IB_L = [[-22, 0], [-38, -10], [-54, 0], [-70, -10]], IB_L2 = [[-54, 0], [-56, 18]];
  const IB_R = [[22, 0], [38, -10], [56, 0]], IB_ME = [[38, -10], [38, -29]];
  const HEX = []; for (let k = 0; k < 6; k++) HEX.push([Math.cos((k * TAU) / 6) * 23, Math.sin((k * TAU) / 6) * 23]);
  function drawIbu(x, y, ang, sc, alpha = 1) {
    if (alpha <= 0.01 || sc <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
    shadowOn(5, 0.15);
    [IB_L, IB_L2, IB_R, IB_ME].forEach((p) => poly(p, 15, C.skyDark));
    ctx.beginPath(); HEX.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.lineWidth = 7; ctx.strokeStyle = C.skyDark; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fillStyle = C.skyDark; ctx.fill();
    shadowOff();
    [IB_L, IB_L2, IB_R, IB_ME].forEach((p) => poly(p, 8, C.sky));
    ctx.beginPath(); HEX.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = C.sky; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    circle(60, 1, 9, C.skyDark); circle(60, 1, 4, '#EAF4FF'); // COOH
    ctx.restore();
  }

  function snakePts(path, sHead, L, phase) {
    const pts = [], n = 26;
    for (let k = 0; k <= n; k++) {
      const s = sHead - L + (L * k) / n; const [x, y, a] = path.at(s);
      const w = Math.sin(s * 0.2 + phase) * 6.5 * Math.min(1, Math.sin((Math.PI * k) / n) * 2.2 + 0.25);
      pts.push([x - Math.sin(a) * w, y + Math.cos(a) * w]);
    }
    return pts;
  }
  function drawAA(pts, alpha = 1) {
    if (alpha <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    shadowOn(4, 0.14); poly(pts, 19, C.butterDark); shadowOff();
    poly(pts, 11, C.butter);
    poly(pts.slice(4, 14).map((p) => [p[0] - 1.5, p[1] - 2.5]), 3, 'rgba(255,255,255,0.6)');
    circle(pts[0][0], pts[0][1], 9.5, C.butterDark); circle(pts[0][0], pts[0][1], 4.2, '#FFF6DA'); // -COOH end trails (it stays at the channel entrance, Arg-120)
    ctx.restore();
  }

  // ------------------------------------------------------------------ background (dot grid built once; blobs loop every 22 s)
  let bgDots = null;
  function buildBg() {
    bgDots = document.createElement('canvas'); bgDots.width = W; bgDots.height = H;
    const g = bgDots.getContext('2d');
    for (let y = 24; y < H; y += 48) for (let x = 24 + ((y / 48) % 2) * 24; x < W; x += 48) { g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fillStyle = 'rgba(214,160,124,0.16)'; g.fill(); }
    layer = document.createElement('canvas'); layer.width = W; layer.height = H; layerCtx = layer.getContext('2d');
  }
  function drawBackground(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.bgTop); g.addColorStop(1, C.bgBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const blobs = [[-40, 300, 230, C.mint, 0.32], [1110, 250, 190, C.butter, 0.34], [1130, 1150, 260, C.lilac, 0.26], [-30, 1720, 270, C.coralLight, 0.34], [980, 1830, 200, C.mint, 0.26]];
    const ph = (TAU * t) / TL.end;
    blobs.forEach(([x, y, r, c, a], i) => {
      ctx.globalAlpha = a; circle(x + Math.sin(ph + i * 1.7) * 18, y + Math.cos(ph * 2 + i * 2.3) * 14, r, c);
    });
    ctx.globalAlpha = 1;
    ctx.drawImage(bgDots, 0, 0);
  }

  // ------------------------------------------------------------------ hook: inflamed molar + ibuprofen; zoom into the pulp
  const TOOTH = { x: 540, y: 950, chamberY: -56 };
  function toothPath() {
    ctx.beginPath();
    ctx.moveTo(-170, -140);
    ctx.bezierCurveTo(-182, -232, -122, -262, -72, -250); ctx.bezierCurveTo(-42, -243, -24, -226, 0, -229);
    ctx.bezierCurveTo(24, -226, 42, -243, 72, -250); ctx.bezierCurveTo(122, -262, 182, -232, 170, -140);
    ctx.bezierCurveTo(165, -82, 150, -42, 136, -12); ctx.bezierCurveTo(126, 40, 120, 140, 96, 238);
    ctx.bezierCurveTo(86, 270, 54, 268, 50, 238); ctx.bezierCurveTo(42, 170, 30, 92, 0, 72);
    ctx.bezierCurveTo(-30, 92, -42, 170, -50, 238); ctx.bezierCurveTo(-54, 268, -86, 270, -96, 238);
    ctx.bezierCurveTo(-120, 140, -126, 40, -136, -12); ctx.bezierCurveTo(-150, -42, -165, -82, -170, -140);
    ctx.closePath();
  }
  function pulpPath() { // chamber roof lowered: roof dentin ~ as thick as the chamber is tall; horns under the cusps
    ctx.beginPath();
    ctx.moveTo(-80, -98); ctx.quadraticCurveTo(-78, -140, -60, -128); ctx.quadraticCurveTo(-30, -106, 0, -108);
    ctx.quadraticCurveTo(30, -106, 60, -128); ctx.quadraticCurveTo(78, -140, 80, -98);
    ctx.quadraticCurveTo(84, -60, 70, -36); ctx.quadraticCurveTo(84, 60, 74, 222); ctx.quadraticCurveTo(70, 232, 66, 222);
    ctx.quadraticCurveTo(56, 70, 40, -4); ctx.quadraticCurveTo(0, 8, -40, -4);
    ctx.quadraticCurveTo(-56, 70, -66, 222); ctx.quadraticCurveTo(-70, 232, -74, 222); ctx.quadraticCurveTo(-84, 60, -70, -36);
    ctx.quadraticCurveTo(-84, -60, -80, -98); ctx.closePath();
  }
  function drawToothArt(t) {
    shadowOn(14, 0.16); toothPath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); shadowOff();
    ctx.save(); toothPath(); ctx.clip(); ctx.beginPath(); ctx.ellipse(-205, 10, 120, 330, 0.04, 0, TAU); ctx.fillStyle = '#FFEFE1'; ctx.fill(); ctx.restore();
    toothPath(); ctx.lineWidth = 4; ctx.strokeStyle = '#F1D6C3'; ctx.stroke();
    rr(104, -222, 22, 70, 11); ctx.fillStyle = '#FFF4EA'; ctx.fill();
    const pulse = 0.5 + 0.5 * Math.sin(t * 5.2); // gentle warm pulse (no flashing)
    ctx.save(); pulpPath(); ctx.fillStyle = C.coral; ctx.fill();
    ctx.clip(); const rg = ctx.createRadialGradient(0, -80, 10, 0, -80, 170); rg.addColorStop(0, `rgba(255,236,170,${0.55 + 0.25 * pulse})`); rg.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = rg; ctx.fillRect(-120, -200, 240, 460); ctx.restore();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.save(); ctx.globalAlpha *= 1 - seg(t, 1.4, 1.62);
    [[-230, -170, -0.5], [230, -170, 0.5], [0, -330, 0]].forEach(([x, y, r], i) => { // throb marks
      const k = 0.85 + 0.15 * Math.sin(t * 5.2 - i);
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(k, k);
      ctx.beginPath(); ctx.moveTo(-10, -34); ctx.lineTo(8, -10); ctx.lineTo(-8, 6); ctx.lineTo(10, 32);
      ctx.lineWidth = 11; ctx.strokeStyle = C.coralDark; ctx.stroke(); ctx.restore();
    });
    ctx.restore();
  }
  function drawHook(t) {
    if (t > 2.3) return;
    const z = 1 + 6 * ease.inOut(seg(t, 1.45, 2.15));
    const ax = TOOTH.x, ay = TOOTH.y + TOOTH.chamberY; // zoom about the pulp chamber
    const ta = 1 - seg(t, 1.95, 2.2);
    if (ta > 0.01) {
      ctx.save(); ctx.globalAlpha = ta;
      ctx.translate(ax, ay); ctx.scale(z, z); ctx.translate(0, -TOOTH.chamberY);
      drawToothArt(t);
      ctx.restore();
    }
    const zr = seg(t, 1.55, 2.2, ease.out);
    if (zr > 0 && zr < 1) {
      ctx.save(); ctx.globalAlpha = (1 - zr) * 0.7; ctx.beginPath(); ctx.arc(ax, ay, 40 + zr * 900, 0, TAU);
      ctx.lineWidth = 14 * (1 - zr) + 2; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); ctx.restore();
    }
    const pa = 1 - seg(t, 1.25, 1.45);
    pill(540, 1290, 'inflamed pulp', { dot: C.coral, alpha: pa });
    // the protagonist: ibuprofen waits beside the tooth, then flies off as we dive in (it returns at 10.3 s)
    const fu = ease.in(seg(t, 1.35, 1.85));
    drawIbu(838 + 520 * fu, 1072 + Math.sin(t * 2.4) * 6 - 260 * fu, -0.25 + 0.9 * fu, 1.3);
    pill(838, 1164, 'ibuprofen', { dot: C.sky, alpha: pa });
  }
  function drawDive(t) { // the coral pulp fills the frame at max zoom, then crossfades to the cell scene
    const a = seg(t, 1.8, 2.02) * (1 - seg(t, 2.05, 2.42, ease.inOut));
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.coral; ctx.fillRect(0, 0, W, H);
    const cy = TOOTH.y + TOOTH.chamberY - 24 * 7;
    const rg = ctx.createRadialGradient(540, cy, 40, 540, cy, 1200); rg.addColorStop(0, 'rgba(255,236,170,0.65)'); rg.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  // ------------------------------------------------------------------ pulp-cell membranes + PLA2
  function slotTailAlpha(slot, t) {
    let a = 1;
    for (const m of mols) {
      if (m.slot !== slot) continue;
      if (t >= m.s && t < m.s + 0.8) a = Math.min(a, seg(t, m.s + 0.45, m.s + 0.75));
    }
    return a;
  }
  function drawMembrane(t) {
    const build = (j) => outBack(seg(t, 2.1 + j * 0.016, 2.5 + j * 0.016));
    const bandA = seg(t, 2.1, 2.45);
    if (bandA <= 0) return;
    ctx.globalAlpha = bandA; ctx.fillStyle = '#FCDCC8'; ctx.fillRect(0, 500, W, 72); ctx.globalAlpha = 1;
    for (let j = 0; j <= MEM.n; j++) {
      const p = build(j); if (p <= 0.01) continue;
      const x = MEM.x0 + j * MEM.sp, bob = noise1(t * 0.7 + j * 0.37, 4) * 2.2;
      ctx.save(); ctx.globalAlpha = clamp(p);
      for (const side of [-1, 1]) {
        const tx = x + side * 6;
        poly([[tx, 497 + bob], [tx + side * 2, 508 + bob], [tx - side * 2, 520 + bob], [tx, 534 + bob]], 6, C.tail);
        const slot = SLOT_X.indexOf(x);
        if (slot >= 0 && side === 1) {
          const ta = slotTailAlpha(slot, t);
          poly([[tx, 575 - bob], [tx + 3, 563 - bob], [tx - 3, 551 - bob], [tx + 1, 540 - bob]], 6, C.tail);
          if (ta > 0.01) { ctx.globalAlpha = clamp(p) * ta; poly([[tx, 575 - bob], [tx + 4, 564 - bob], [tx - 3, 552 - bob], [tx + 1, 541 - bob]], 9, C.butterDark); poly([[tx, 575 - bob], [tx + 4, 564 - bob], [tx - 3, 552 - bob], [tx + 1, 541 - bob]], 5, C.butter); ctx.globalAlpha = clamp(p); }
        } else poly([[tx, 575 - bob], [tx - side * 2, 563 - bob], [tx + side * 2, 551 - bob], [tx, 538 - bob]], 6, C.tail);
      }
      ctx.restore();
      const hc = [C.coralLight, '#FFD0C2', '#FFBCAB'][(hash(j, 2) * 3) | 0];
      const hc2 = [C.coralLight, '#FFD0C2', '#FFBCAB'][(hash(j, 5) * 3) | 0];
      for (const [hy, col] of [[MEM.topY + bob, hc], [MEM.botY - bob, hc2]]) {
        ctx.save(); ctx.translate(x, hy); ctx.scale(p, p);
        shadowOn(4, 0.12); circle(0, 0, MEM.r, col); shadowOff();
        circle(-6, -6, 5, 'rgba(255,255,255,0.6)');
        ctx.restore();
      }
    }
  }
  function doorOpen(t) {
    let o = 0;
    for (const m of PROD) {
      const r = t - m.tA; if (r < P.drop || r > P.land) continue;
      const s = sine(seg(r, P.drop, P.land)) * m.fall.len;
      o = Math.max(o, 1 - clamp(Math.abs(s - m.sDoor) / 70));
    }
    return ease.smooth(o);
  }
  function drawLowerMembrane(t) { // the pulp cell's lower boundary: PGE2 must leave the cell to reach the nerve
    const bandA = seg(t, 2.15, 2.5);
    if (bandA <= 0) return;
    ctx.globalAlpha = bandA; ctx.fillStyle = '#FCDCC8';
    ctx.fillRect(0, 1054, LM.doorL - 4, 26); ctx.fillRect(LM.doorR + 4, 1054, W, 26); ctx.globalAlpha = 1;
    for (let j = 0; j <= LM.n; j++) {
      const x = LM.x0 + j * LM.sp; if (x > LM.doorL - 12 && x < LM.doorR + 12) continue;
      const p = outBack(seg(t, 2.15 + j * 0.01, 2.5 + j * 0.01)); if (p <= 0.01) continue;
      const bob = noise1(t * 0.7 + j * 0.41, 7) * 1.6;
      ctx.save(); ctx.globalAlpha = clamp(p);
      for (const side of [-1, 1]) {
        const tx = x + side * 4.5;
        poly([[tx, 1054 + bob], [tx + side * 2, 1061 + bob], [tx, 1068 + bob]], 5, C.tail);
        poly([[tx, 1080 - bob], [tx - side * 2, 1073 - bob], [tx, 1068 - bob]], 5, C.tail);
      }
      ctx.restore();
      const hc = [C.coralLight, '#FFD0C2', '#FFBCAB'][(hash(j, 12) * 3) | 0];
      const hc2 = [C.coralLight, '#FFD0C2', '#FFBCAB'][(hash(j, 15) * 3) | 0];
      for (const [hy, col] of [[LM.topY + bob, hc], [LM.botY - bob, hc2]]) {
        ctx.save(); ctx.translate(x, hy); ctx.scale(p, p);
        shadowOn(3, 0.12); circle(0, 0, LM.r, col); shadowOff();
        circle(-4, -4, 3.5, 'rgba(255,255,255,0.6)');
        ctx.restore();
      }
    }
    // exit "door" (generic membrane channel) that opens as each PGE2 passes
    const p = outBack(seg(t, 2.3, 2.7)); if (p <= 0.01) return;
    const o = doorOpen(t) * 9;
    ctx.save(); ctx.translate(LM.doorX, 1066); ctx.scale(p, p);
    for (const sgn of [-1, 1]) {
      const x0 = sgn < 0 ? -6 - 26 - o : 6 + o;
      shadowOn(4, 0.14); rr(x0, -44, 26, 88, 13); ctx.fillStyle = C.door; ctx.fill(); shadowOff();
      rr(x0 + 6, -36, 7, 30, 3.5); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
    }
    ctx.restore();
  }
  function drawPLA2(t) { // scissor-shaped enzyme that snips the AA tail out of the lipid
    const p = outBack(seg(t, 2.45, 2.85)); if (p <= 0.01) return;
    let chomp = 0;
    for (const s of spawnTimes) chomp = Math.max(chomp, tri(t, s - 0.1, s + 0.03, s + 0.3));
    const x = 202, y = 642, open = 0.42 - 0.36 * chomp;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate(-0.74);
    for (const sgn of [-1, 1]) {
      ctx.save(); ctx.rotate(sgn * open);
      shadowOn(4, 0.14);
      // blade
      ctx.beginPath(); ctx.moveTo(4, -15 * sgn); ctx.quadraticCurveTo(58, -10 * sgn, 92, 0); ctx.quadraticCurveTo(54, 13 * sgn, 4, 15 * sgn); ctx.closePath();
      ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.butterDark; ctx.lineJoin = 'round'; ctx.stroke();
      shadowOff();
      // ring handle on the opposite side
      ctx.beginPath(); ctx.arc(-40, 13 * sgn, 13, 0, TAU); ctx.lineWidth = 9; ctx.strokeStyle = C.butterDark; ctx.stroke();
      ctx.beginPath(); ctx.arc(-40, 13 * sgn, 13, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = C.butter; ctx.stroke();
      poly([[-6, 6 * sgn], [-28, 11 * sgn]], 10, C.butterDark); poly([[-6, 6 * sgn], [-28, 11 * sgn]], 5, C.butter);
      ctx.restore();
    }
    shadowOn(4, 0.15); circle(0, 0, 15, C.butter); shadowOff();
    circle(0, 0, 6, C.butterDark); circle(-4, -5, 3.5, 'rgba(255,255,255,0.7)');
    ctx.restore();
    for (const m of mols) { // snip burst at the lipid being cut
      const u = seg(t, m.s - 0.02, m.s + 0.3); if (u <= 0 || u >= 1) continue;
      const sx = SLOT_X[m.slot] + 2, sy = 606;
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(sx, sy);
      for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU + 0.3; const r0 = 12 + u * 10, r1 = 22 + u * 16; poly([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], 5, C.butterDark); }
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------ COX machine, conveyor, stamp
  function convFlash(t) { let f = 0; for (const m of PROD) f = Math.max(f, tri(t, m.tA - 0.03, m.tA + 0.05, m.tA + 0.3)); return f; }
  function drawCOX(t) {
    const p = outBack(seg(t, 2.2, 2.65)); if (p <= 0.01) return;
    const cx = 565, cy = 862;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); ctx.translate(-cx, -cy);
    const ga = gearAngle(t);
    ctx.save(); ctx.translate(770, 972); ctx.rotate(ga);
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const a0 = (k / 10) * TAU; ctx.arc(0, 0, 40, a0, a0 + 0.3); ctx.arc(0, 0, 30, a0 + 0.38, a0 + 0.62); }
    ctx.closePath(); ctx.fillStyle = C.mintDeep; ctx.fill(); circle(0, 0, 12, C.mint); ctx.restore();
    const sp = speed(t);
    [650, 686, 722].forEach((lx, k) => {
      const on = sp > 0.5 && Math.floor(t * 7) % 3 === k;
      ctx.beginPath(); ctx.arc(lx, 716, 12, Math.PI, 0); ctx.fillStyle = on ? C.butter : sp > 0.5 ? '#C6E9DA' : '#BBD6CB'; ctx.fill();
      if (on) { ctx.globalAlpha = 0.35; circle(lx, 712, 20, C.butter); ctx.globalAlpha = 1; }
    });
    shadowOn(12, 0.16); rr(360, 715, 410, 295, 72); ctx.fillStyle = C.mint; ctx.fill(); shadowOff();
    ctx.save(); rr(360, 715, 410, 295, 72); ctx.clip();
    ctx.fillStyle = C.mintMid; ctx.fillRect(360, 962, 410, 60);
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; rr(560, 726, 190, 16, 8); ctx.fill();
    poly(tunnelPts, 50, '#93DBC1'); poly(tunnelPts, 36, C.mintGroove);
    poly(tunnelPts.map((q) => [q[0], q[1] - 9]), 5, 'rgba(255,255,255,0.25)');
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(770, 858, 10, 24, 0, 0, TAU); ctx.fillStyle = C.mintDeep; ctx.fill();
    const fl = convFlash(t);
    circle(A[0], A[1], 20, '#68BFA0');
    ctx.beginPath(); ctx.arc(A[0], A[1], 20, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
    if (fl > 0) {
      ctx.save(); ctx.globalAlpha = fl; ctx.translate(A[0], A[1]);
      for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + 0.2; poly([[Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a) * (40 + 10 * fl), Math.sin(a) * (40 + 10 * fl)]], 6, '#FFFFFF'); }
      ctx.restore();
    }
    ctx.beginPath(); ctx.ellipse(M[0], 727, 50, 22, 0.08, 0, TAU); ctx.fillStyle = C.mintDeep; ctx.fill();
    ctx.beginPath(); ctx.ellipse(M[0], 731, 38, 14, 0.08, 0, TAU); ctx.fillStyle = '#2E7A63'; ctx.fill();
    drawRich('COX-1 / COX-2', 565, 948, { size: 46, weight: 900, color: C.mintText, align: 'center' });
    drawRich('AA -> PGG_2 -> PGH_2', 565, 990, { size: 30, weight: 800, color: C.mintText, align: 'center' });
    ctx.restore();
    // sticker: COX-2 is induced in inflamed pulp (mainly fibroblasts)
    const sa = life(t, 5.5, TL.card + 0.3) * clamp(p);
    if (sa > 0.01) {
      const k = popS(t, 5.5);
      ctx.save(); ctx.globalAlpha *= sa; ctx.translate(460, 866); ctx.rotate(-0.05); ctx.scale(k, k);
      shadowOn(5, 0.16); rr(-120, -38, 240, 76, 20); ctx.fillStyle = '#FFFFFF'; ctx.fill(); shadowOff();
      drawRich('COX-2 ↑', 0, -4, { size: 30, weight: 900, color: C.coralText, align: 'center' });
      drawRich('in inflamed pulp', 0, 27, { size: 26, weight: 800, color: C.ink2, align: 'center' });
      ctx.restore();
    }
  }
  function stampPress(t) { let pr = 0; for (const m of PROD) pr = Math.max(pr, tri(t, m.tA + 0.36, m.tA + P.made - 0.01, m.tA + 0.58)); return pr; }
  function drawBelt(t) {
    const p = outBack(seg(t, 2.3, 2.7)); if (p <= 0.01) return;
    ctx.save(); ctx.translate(870, 880); ctx.scale(p, p); ctx.translate(-870, -880);
    shadowOn(6, 0.14); rr(768, 872, 214, 24, 12); ctx.fillStyle = C.belt; ctx.fill(); shadowOff();
    ctx.save(); rr(768, 872, 214, 24, 12); ctx.clip();
    const off = (gearAngle(t) * 30) % 28;
    for (let x = 740 + off; x < 1000; x += 28) { ctx.beginPath(); ctx.moveTo(x, 872); ctx.lineTo(x + 12, 872); ctx.lineTo(x + 4, 896); ctx.lineTo(x - 8, 896); ctx.closePath(); ctx.fillStyle = C.beltStripe; ctx.fill(); }
    ctx.restore();
    [782, 968].forEach((x) => { circle(x, 884, 9, C.roller); circle(x, 884, 3.5, '#FFF0E4'); });
    ctx.restore();
  }
  function drawStamp(t) {
    const p = outBack(seg(t, 2.35, 2.75)); if (p <= 0.01) return;
    const pr = stampPress(t), x = STAMP_X;
    ctx.save(); ctx.translate(x, 780); ctx.scale(p, p); ctx.translate(-x, -780);
    ctx.fillStyle = '#C99A3A'; ctx.fillRect(x - 6, 790, 12, 12 + pr * 14);
    shadowOn(5, 0.14); rr(x - 40, 800 + pr * 14, 80, 18, 8); ctx.fillStyle = C.butterDark; ctx.fill(); shadowOff();
    shadowOn(6, 0.15); rr(x - 50, 750, 100, 46, 16); ctx.fillStyle = C.butter; ctx.fill(); shadowOff();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; rr(x - 38, 758, 44, 9, 4.5); ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------ molecules in flight
  function aaHead(m, t) {
    const u = (t - m.s) / HEAD_T; const h = lerp(HEAD0, S_A[m.slot], sine(u));
    if (!m.queued) return h;
    if (m.slipper && t >= TL.slip[0]) return lerp(m.sStop, S_A[m.slot], ease.inOut(seg(t, TL.slip[0], TL.slip[1])));
    const bonk = (d) => -9 * Math.exp(-d * 5) * Math.sin(d * 16);
    if (m.sStop2 != null && t >= TL.advance[0]) {
      if (t <= TL.advance[1]) return lerp(m.sStop, m.sStop2, ease.inOut(seg(t, TL.advance[0], TL.advance[1])));
      return m.sStop2 + bonk(t - TL.advance[1]);
    }
    if (t > m.tStop) return m.sStop + bonk(t - m.tStop);
    return Math.min(h, m.sStop);
  }
  function drawAAs(t) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, MEM.clipY, W, H); ctx.clip();
    for (const m of mols) {
      if (t < m.s) continue;
      const producing = m.k != null;
      if (producing && t > m.tA + 0.17) continue;
      const h = aaHead(m, t);
      const fade = producing ? 1 - seg(t, m.tA, m.tA + 0.15) : 1 - seg(t, TL.card + 0.2, TL.card + 0.7);
      const idle = m.queued && !(m.slipper && t >= TL.slip[0]) && t > m.tStop ? Math.sin((t - m.tStop) * 3 + m.q) * 0.8 : 0;
      const L = L_AA * (producing ? 1 - 0.5 * seg(t, m.tA - 0.03, m.tA + 0.15) : 1);
      drawAA(snakePts(m.path, h, L, 0.6 + idle), fade);
    }
    ctx.restore();
  }
  function drawProducts(t) {
    for (const m of PROD) {
      const r = t - m.tA;
      if (r < 0 || r > P.drop) continue;
      const key = m.k === LAST_K && r < P.made + 0.3 ? 3 : 0; // the last molecule already inside when the plug seats
      if (r < P.pop) {
        drawPG(A[0], A[1], 0, 0.78 * outBack(seg(r, 0, P.pop)), 'H', seg(r, 0, 0.06), key);
      } else if (r < P.stamp) {
        const s = lerp(0, S_STAMP, sine(seg(r, P.pop, P.stamp))); const [x, y, a] = Q.at(s);
        drawPG(x, y - 4, a * 0.5, 0.78, 'H', 1, key);
      } else if (r < P.off) {
        const [x, y] = Q.at(S_STAMP);
        const pop = 1 + 0.2 * tri(r, P.made - 0.01, P.made + 0.05, P.made + 0.22);
        drawPG(x, y - 4, 0, 0.78 * pop, r >= P.made ? 'E' : 'H', 1, key);
      } else {
        const s = lerp(S_STAMP, Q.len, seg(r, P.off, P.drop, ease.in)); const [x, y] = Q.at(s);
        drawPG(x, y - 4, 0, 0.78, 'E', 1, key);
      }
      const pu = seg(r, P.made, P.made + 0.32); // butter "puff" at the colour flip
      if (pu > 0 && pu < 1) {
        const [x, y] = Q.at(S_STAMP);
        ctx.save(); ctx.globalAlpha = 1 - pu;
        for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU + 0.4; circle(x + Math.cos(a) * (26 + 34 * pu), y - 4 + Math.sin(a) * (20 + 26 * pu), 7 * (1 - 0.5 * pu), C.butter); }
        ctx.restore();
      }
    }
  }
  function boundPose(m, t) {
    const pa = 1 - seg(t, m.clear, m.clear + 0.6);
    const dx = m.bound ? 0 : noise1(t * 0.5, m.k) * 8, dy = m.bound ? 0 : noise1(t * 0.45, m.k + 50) * 6;
    const ang = m.bound ? m.ta : m.ta + noise1(t * 0.4, m.k + 9) * 0.22;
    return { x: m.tx + dx, y: m.ty + dy, ang, sc: (m.bound ? 0.6 : 0.5) * (0.75 + 0.25 * pa), pa };
  }
  function drawPGE2Field(t) { // bound (one per ending, white keyline) + free PGE2 near the nerve
    for (const m of PROD) {
      if (t < m.land) continue;
      const q = boundPose(m, t); if (q.pa <= 0.01) continue;
      if (m.bound) { ctx.globalAlpha = 0.3 * q.pa; const r = RECEPT[m.cup]; circle(r.x, r.y, 24, C.coral); ctx.globalAlpha = 1; }
      drawPG(q.x, q.y, q.ang, q.sc, 'E', q.pa, m.bound ? 3 : 0);
    }
  }
  function drawFalling(t, ps = 1) { // PGE2 leaves the cell through the exit and drops onto the nerve (ps: punch, blended)
    for (const m of PROD) {
      const r = t - m.tA; if (r < P.drop || r >= P.land) continue;
      const u = sine(seg(r, P.drop, P.land)); const [x, y, a] = m.fall.at(u * m.fall.len);
      const endSc = m.bound ? 0.6 : 0.5;
      const sc = u < 0.4 ? lerp(0.78, 0.66, u / 0.4) : lerp(0.66, endSc, (u - 0.4) / 0.6);
      const k = seg(u, 0.72, 1), z = 1 + (ps - 1) * (1 - u);
      drawPG(DOCK[0] + (x - DOCK[0]) * z, DOCK[1] + (y - DOCK[1]) * z, lerp(a, m.ta, k), sc * z, 'E', 1, m.bound ? 3 * k : 0);
    }
  }

  // ------------------------------------------------------------------ counter
  function drawCounter(t) {
    const p = outBack(seg(t, 2.4, 2.85)); if (p <= 0.01) return;
    let n = 0, last = -9; for (const m of PROD) if (t >= m.made) { n++; last = Math.max(last, m.made); }
    let pk = 0, paused = false;
    for (const [a, b] of PAUSES) { if (t >= a && t < b) paused = true; pk = Math.max(pk, Math.min(outBack(seg(t, a, a + 0.4)), 1 - seg(t, b, b + 0.2))); }
    ctx.save(); ctx.translate(195, 877); ctx.scale(p, p); ctx.translate(-195, -877);
    shadowOn(8, 0.15); rr(70, 792, 250, 170, 36); ctx.fillStyle = '#FFFFFF'; ctx.fill(); shadowOff();
    drawRich('PGE_2 made', 195, 846, { size: 30, weight: 800, color: C.ink2, align: 'center' });
    const bump = 1 + 0.2 * (1 - seg(t, last, last + 0.3, ease.out));
    ctx.save(); ctx.translate(195, 917); ctx.scale(bump, bump);
    ctx.font = F(900, 86); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = paused ? C.ink3 : C.coralText; ctx.fillText(String(n), 0, 4);
    ctx.restore();
    if (pk > 0.01) { // pause badge at the counter's top centre
      ctx.save(); ctx.translate(195, 780); ctx.scale(pk, pk);
      shadowOn(5, 0.16); circle(0, 0, 40, C.sky); shadowOff();
      ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; rr(-14, -16, 10, 32, 5); ctx.fill(); rr(4, -16, 10, 32, 5); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ nerve
  function drawNerve(t) {
    const g = seg(t, 4.4, 5.0, ease.inOut); if (g <= 0) return;
    const S = sens(t);
    ctx.save(); ctx.beginPath(); ctx.rect(-80, 0, -80 + (W + 260) * g, H); ctx.clip();
    const fill = Kit.rgba(Kit.mix(C.lilac, '#F4AAC6', S * 0.6));
    if (S > 0.01) for (const tp of tipsOf) { const rg = ctx.createRadialGradient(tp.x, tp.y, 6, tp.x, tp.y, 70); rg.addColorStop(0, `rgba(255,150,130,${0.32 * S})`); rg.addColorStop(1, 'rgba(255,150,130,0)'); ctx.fillStyle = rg; ctx.fillRect(tp.x - 70, tp.y - 70, 140, 140); }
    shadowOn(7, 0.13);
    poly(NV.main, 38, C.lilacDark); [NV.b1, NV.b2, NV.b3].forEach((b) => poly(b, 28, C.lilacDark));
    tipsOf.forEach((tp) => circle(tp.x, tp.y, 23, C.lilacDark));
    shadowOff();
    RECEPT.forEach((r) => {
      const bx = r.x - Math.cos(r.a) * 14, by = r.y - Math.sin(r.a) * 14;
      poly([[r.x - Math.cos(r.a) * 30, r.y - Math.sin(r.a) * 30], [bx, by]], 7, C.lilacDark);
      ctx.beginPath(); ctx.arc(r.x, r.y, 12, r.a + Math.PI - 1.95, r.a + Math.PI + 1.95); ctx.lineWidth = 7; ctx.strokeStyle = C.lilacDark; ctx.lineCap = 'round'; ctx.stroke();
    });
    poly(NV.main, 27, fill); [NV.b1, NV.b2, NV.b3].forEach((b) => poly(b, 18, fill));
    tipsOf.forEach((tp) => circle(tp.x, tp.y, 17, fill));
    poly(NV.main.slice(0, 18).map((q) => [q[0], q[1] - 6]), 5, 'rgba(255,255,255,0.45)');
    const j0 = Math.floor((t - 0.9) / BUMP) - 1, j1 = Math.ceil(t / BUMP) + 1; // action potentials travelling toward the brain
    for (let j = j0; j <= j1; j++) {
      if (!isSpike(j)) continue; const b = bumpT(j); const u = (t - b) / 0.9; if (u < 0 || u > 1) continue;
      const [x, y] = pulsePath.at(u * pulsePath.len);
      ctx.globalAlpha = 0.45 * (1 - u); circle(x, y, 22, '#FFFFFF'); ctx.globalAlpha = 1;
      circle(x, y, 10, C.butterLight); circle(x, y, 6, '#FFFFFF');
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ meter
  const MT = { x: 80, y: 1318, w: 860, h: 220, x0: 116, x1: 560, base: 1520, hTr: 126, win: 3.0, over: 1.1 };
  function drawMeter(t) {
    const p = seg(t, 4.55, 5.15, ease.outQuint); if (p <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 60);
    shadowOn(10, 0.15); rr(MT.x, MT.y, MT.w, MT.h, 40); ctx.fillStyle = '#FFFFFF'; ctx.fill(); shadowOff();
    ctx.font = F(800, 32); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('nerve firing', MT.x0, 1356);
    const fa = life(t, BEATS[4] + 0.3, 99, 0.4);
    if (fa > 0.01) { ctx.save(); ctx.globalAlpha *= fa; drawRich('other mediators (e.g. substance P) still act', 912, 1356, { size: 24, weight: 700, color: C.ink2, align: 'right' }); ctx.restore(); }
    const tw = MT.x1 - MT.x0, tStart = t - MT.win;
    const xOf = (tt) => MT.x0 + ((tt - tStart) / MT.win) * tw;
    const j0 = Math.floor((tStart - 0.3) / BUMP), j1 = Math.ceil(t / BUMP);
    const bumps = [];
    for (let j = j0; j <= j1; j++) { const b = bumpT(j); if (b > t || b < 0) continue; bumps.push({ x: xOf(b), a: bumpA(j), sp: isSpike(j), b }); }
    const pts = [];
    for (let x = MT.x0; x <= Math.min(MT.x1, xOf(t)); x += 2.5) {
      let v = 0;
      for (const bp of bumps) {
        const d = x - bp.x;
        if (bp.sp) { if (d >= 5 && d < 18) v = Math.min(v, -0.12 * Math.sin(((d - 5) / 13) * Math.PI)); }
        else v = Math.max(v, bp.a * Math.exp(-(d * d) / 34));
      }
      pts.push([x, MT.base - v * MT.hTr]);
    }
    if (pts.length > 1) {
      ctx.save(); ctx.globalAlpha *= 0.75; poly(pts, 3, C.lilacMid); ctx.restore();
      for (const bp of bumps) if (bp.sp && bp.x > MT.x0 && bp.x < MT.x1) {
        poly([[bp.x - 5, MT.base], [bp.x, MT.base - MT.hTr * MT.over], [bp.x + 5, MT.base]], 6, C.coralDark);
        circle(bp.x, MT.base - MT.hTr * MT.over, 6.5, C.coral);
      }
      const last = pts[pts.length - 1]; circle(last[0], last[1], 7, C.lilacDark);
    }
    const thPts = []; for (let x = MT.x0; x <= MT.x1; x += 8) { const tt = tStart + ((x - MT.x0) / tw) * MT.win; thPts.push([x, MT.base - thresh(Math.max(0, tt)) * MT.hTr]); }
    ctx.setLineDash([12, 10]); poly(thPts, 4, C.coralDark); ctx.setLineDash([]);
    const thy = MT.base - thresh(t) * MT.hTr;
    ctx.font = F(800, 30); ctx.fillStyle = C.coralText; ctx.textAlign = 'left'; ctx.fillText('threshold', MT.x1 + 14, thy + 10);
    const lw = ctx.measureText('threshold').width;
    const dn = life(t, BEATS[2] + 0.2, BEATS[3], 0.3, 0.3), up = life(t, 14.0, 16.5, 0.3, 0.3);
    const bobC = Math.sin(t * 6) * 3;
    if (dn > 0.01) { ctx.save(); ctx.globalAlpha *= dn; chevron(MT.x1 + 30 + lw, thy + 1 + bobC, 1, 11, C.coralDark); ctx.restore(); }
    if (up > 0.01) { ctx.save(); ctx.globalAlpha *= up; chevron(MT.x1 + 30 + lw, thy + 1 - bobC, -1, 11, C.coralDark); ctx.restore(); }
    // speaker + level bars ("volume" = recent spike count)
    let rate = 0; for (const bp of bumps) if (bp.sp && bp.b > t - 2.0) rate++;
    const bars = Math.min(5, rate);
    let recent = 0; for (const bp of bumps) if (bp.sp) recent = Math.max(recent, 1 - clamp((t - bp.b) / 0.35));
    const sx = 788, sy = 1460;
    ctx.fillStyle = C.ink2; rr(sx - 22, sy - 12, 16, 24, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx - 8, sy - 12); ctx.lineTo(sx + 8, sy - 26); ctx.lineTo(sx + 8, sy + 26); ctx.lineTo(sx - 8, sy + 12); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 2; k++) { ctx.save(); ctx.globalAlpha *= recent * (1 - k * 0.35); ctx.beginPath(); ctx.arc(sx + 10, sy, 22 + k * 13, -0.7, 0.7); ctx.lineWidth = 5; ctx.strokeStyle = C.coralDark; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
    for (let k = 0; k < 5; k++) { const bh = 22 + k * 14, bx = 846 + k * 18; rr(bx, 1500 - bh, 14, bh, 7); ctx.fillStyle = k < bars ? C.coral : '#EFE3DA'; ctx.fill(); }
    ctx.restore();
  }

  // ------------------------------------------------------------------ ibuprofen
  const PATH_A = new Path(bez([1190, 652], [960, 630], [650, 648], DOCK, 30));
  const PATH_B = new Path(bez([1200, 700], [1080, 690], [930, 664], [834, 662], 30));
  const PATH_BSEAT = new Path(bez([834, 662], [740, 712], [560, 716], DOCK, 30));
  function ibPoses(t) {
    const out = [];
    if (t >= TL.ibA[0]) { // A: docks, then unbinds (reversible) and drifts away
      const u = seg(t, TL.ibA[0], TL.ibA[1], ease.inOut);
      const [x, y] = PATH_A.at(u * PATH_A.len);
      let ang = lerp(-2.0, DOCK_ANG, u), sc = lerp(0.95, DOCK_SC, seg(u, 0.55, 1)), al = 1, px = x, py = y;
      if (t > TL.ibA[1] && t < TL.pop) { const s = Math.sin((t - TL.ibA[1]) * 2.6) * 1.8; px += Math.cos(DOCK_ANG) * s; py += Math.sin(DOCK_ANG) * s; }
      if (t >= TL.pop) { const v = seg(t, TL.pop, TL.pop + 0.45, ease.out); px += 26 * v; py -= 46 * v; ang += 0.7 * v; sc *= 1 + 0.15 * v; al = 1 - seg(t, TL.pop + 0.12, TL.pop + 0.45); }
      out.push({ x: px, y: py, ang, sc, al });
    }
    if (t >= TL.ibB[0]) { // B: waits nearby, then re-plugs the channel
      let x, y, ang, sc = 0.92;
      if (t < TL.ibBseat[0]) {
        const u = seg(t, TL.ibB[0], TL.ibB[1], ease.inOut); [x, y] = PATH_B.at(u * PATH_B.len);
        const w = t > TL.ibB[1] ? 1 : 0;
        y += w * Math.sin((t - TL.ibB[1]) * 2.2) * 5; ang = lerp(1.6, -0.12, u) + w * Math.sin(t * 1.4) * 0.08;
      } else {
        const u = seg(t, TL.ibBseat[0], TL.ibBseat[1], ease.inOut); [x, y] = PATH_BSEAT.at(u * PATH_BSEAT.len);
        ang = lerp(-0.12, DOCK_ANG, u); sc = lerp(0.92, DOCK_SC, u);
        if (t > TL.ibBseat[1]) { const s = Math.sin((t - TL.ibBseat[1]) * 2.6) * 1.8; x += Math.cos(DOCK_ANG) * s; y += Math.sin(DOCK_ANG) * s; }
      }
      out.push({ x, y, ang, sc, al: 1 });
    }
    return out;
  }
  function clickBurst(t, t0, big) {
    const cb = seg(t, t0, t0 + 0.45); if (cb <= 0 || cb >= 1) return;
    ctx.save(); ctx.globalAlpha *= 1 - cb; ctx.translate(DOCK[0], DOCK[1] + 4);
    const R = big ? 1 : 0.8;
    for (let k = 0; k < 7; k++) { const a = -Math.PI + (k / 6) * Math.PI; const r0 = (60 + cb * 18) * R, r1 = (80 + cb * 34) * R; poly([[Math.cos(a) * r0, Math.sin(a) * r0 * 0.8], [Math.cos(a) * r1, Math.sin(a) * r1 * 0.8]], 7, C.skyDark); }
    ctx.restore();
  }
  function drawIbuprofen(t) {
    const fadeAll = 1 - seg(t, TL.card + 0.2, TL.card + 0.7);
    if (t < TL.ibA[0] || fadeAll <= 0) return;
    clickBurst(t, TL.ibA[1], true); clickBurst(t, TL.ibBseat[1], false);
    ibPoses(t).forEach((q) => drawIbu(q.x, q.y, q.ang, q.sc, q.al * fadeAll));
  }
  const punch = (t) => 1 + 0.1 * Math.sin(Math.PI * ease.smooth(seg(t, TL.punch[0], TL.punch[1])));

  // ------------------------------------------------------------------ labels (dimmed with their group)
  function drawLabels(t, f, part) {
    const end = TL.card + 0.3;
    if (part === 'lower') {
      pill(206, 1066, 'out of the cell ↓', { size: 30, dot: C.peach, alpha: life(t, 5.2, end) * (t < BEATS[2] + 0.15 ? f.fall : f.nerve), scale: popS(t, 5.2) });
      pill(180, 1150, 'EP receptors', { size: 30, dot: C.lilacDark, alpha: life(t, 7.6, end) * f.nerve, scale: popS(t, 7.6) });
      pill(176, 1224, 'nociceptor', { dot: C.lilac, alpha: life(t, 7.8, end) * f.nerve, scale: popS(t, 7.8) });
      return;
    }
    pill(812, 536, 'pulp cell membrane', { dot: C.coralLight, alpha: life(t, 2.55, end) * f.mem, scale: popS(t, 2.55) });
    pill(140, 734, 'PLA_2', { dot: C.butter, alpha: life(t, 2.8, BEATS[3]) * f.mem, scale: popS(t, 2.8) });
    pill(590, 652, 'arachidonic acid', { dot: C.butter, alpha: life(t, 3.2, BEATS[3]) * f.aa, scale: popS(t, 3.2) });
    pill(890, 712, 'PGE synthase', { size: 30, dot: C.butterDark, alpha: life(t, 5.4, BEATS[3]) * f.cox, scale: popS(t, 5.4) });
    const ia = life(t, 11.15, end) * f.ibu;
    if (ia > 0.01) { // ibuprofen label sits beside the plug, with a short leader to it
      ctx.save(); ctx.globalAlpha *= ia; poly([[548, 676], [486, 704]], 3, C.ink3); ctx.restore();
      pill(650, 656, 'ibuprofen', { dot: C.sky, alpha: ia, scale: popS(t, 11.15) });
    }
  }

  // ------------------------------------------------------------------ captions
  function drawCaptions(t) {
    for (const c of CAPS) {
      if (t < c.a - 0.01 || t > c.b) continue;
      const size = c.size || 58, lh = c.lh || 70;
      const ain = c.a === 0 ? 1 : seg(t, c.a, c.a + 0.2, ease.out);
      const aout = seg(t, c.b - 0.15, c.b, ease.in);
      const a = ain * (1 - aout); if (a <= 0.01) continue;
      const dy = (1 - ain) * 24 - aout * 14;
      const lines = c.text.split('\n');
      const y0 = (c.y0 || 361 - ((lines.length - 1) * lh) / 2) + dy;
      const hp = c.a === 0 ? 1 : seg(t, c.a + 0.1, c.a + 0.5, ease.out);
      ctx.save(); ctx.globalAlpha = a;
      lines.forEach((ln, i) => drawRich(ln, W / 2, y0 + i * lh, { size, weight: 900, color: C.ink, align: 'center', hiBg: c.hi, hiProg: hp }));
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------ takeaway card
  function drawCard(t) {
    const v = seg(t, TL.card, TL.card + 0.45, ease.out); if (v <= 0) return;
    ctx.save(); ctx.globalAlpha = v * 0.97; // veil over the upper art; the nerve + meter stay visible below
    const g = ctx.createLinearGradient(0, 0, 0, 1135); g.addColorStop(0, C.bgTop); g.addColorStop(0.93, '#FFF0E4'); g.addColorStop(1, 'rgba(255,240,228,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1135); ctx.restore();
    const p = outBack(seg(t, TL.card + 0.05, TL.card + 0.5)); if (p <= 0.01) return;
    ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate(540, 670); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p); ctx.translate(-540, -670);
    shadowOn(14, 0.16); rr(92, 300, 896, 740, 52); ctx.fillStyle = '#FFFFFF'; ctx.fill(); shadowOff();
    ctx.letterSpacing = '5px'; ctx.font = F(900, 30); ctx.fillStyle = C.coralText; ctx.textAlign = 'center'; ctx.fillText('THE TAKEAWAY', 540, 366); ctx.letterSpacing = '0px';
    // mini icon: plugged COX -> fewer new PGE2
    const ia = seg(t, TL.card + 0.2, TL.card + 0.5, ease.out);
    ctx.save(); ctx.globalAlpha *= ia;
    shadowOn(6, 0.14); rr(372, 412, 170, 88, 30); ctx.fillStyle = C.mint; ctx.fill(); shadowOff();
    ctx.beginPath(); ctx.ellipse(418, 428, 26, 11, 0, 0, TAU); ctx.fillStyle = C.mintDeep; ctx.fill();
    drawRich('COX', 480, 476, { size: 30, weight: 900, color: C.mintText, align: 'center' });
    drawIbu(416, 424, 0.5, 0.56);
    ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(566, 456); ctx.lineTo(618, 456); ctx.moveTo(604, 444); ctx.lineTo(618, 456); ctx.lineTo(604, 468); ctx.stroke();
    drawPG(684, 458, 0, 0.66, 'E', 0.45);
    shadowOn(4, 0.14); circle(752, 448, 23, C.coral); shadowOff();
    drawRich('↓', 752, 461, { size: 34, weight: 900, color: '#FFFFFF', align: 'center' });
    ctx.restore();
    const a1 = seg(t, TL.card + 0.15, TL.card + 0.45, ease.out);
    ctx.save(); ctx.globalAlpha *= a1;
    drawRich('Ibuprofen cuts', 540, 590, { size: 68, weight: 900, color: C.ink, align: 'center' });
    drawRich('*NEW* prostaglandins', 540, 666, { size: 68, weight: 900, color: C.ink, align: 'center', hiBg: C.butter, hiProg: seg(t, TL.card + 0.4, TL.card + 0.75, ease.out) });
    ctx.restore();
    const a2 = seg(t, TL.card + 0.4, TL.card + 0.7, ease.out);
    ctx.save(); ctx.globalAlpha *= a2;
    drawRich('It can’t erase the ones', 540, 746, { size: 44, weight: 700, color: C.ink2, align: 'center' });
    drawRich('already made.', 540, 798, { size: 44, weight: 700, color: C.ink2, align: 'center' });
    ctx.restore();
    const a3 = seg(t, TL.card + 0.65, TL.card + 0.95, ease.out);
    ctx.save(); ctx.globalAlpha *= a3;
    ctx.setLineDash([2, 14]); poly([[200, 836], [880, 836]], 5, '#F0CDB8'); ctx.setLineDash([]);
    drawRich('-> one rationale for dosing *before treatment*†', 540, 896, { size: CARD_RAT_SIZE, weight: 800, color: C.mintText, align: 'center', hiBg: C.mint, hiProg: seg(t, TL.card + 0.85, TL.card + 1.2, ease.out) });
    ctx.restore();
    const a4 = seg(t, TL.card + 0.8, TL.card + 1.1, ease.out);
    ctx.save(); ctx.globalAlpha *= a4;
    drawRich('†pre-op NSAIDs aid IANB success; post-op pain benefit unclear', 540, 946, { size: 26, weight: 700, color: C.ink2, align: 'center' });
    drawRich('Vane 1971 · Selinsky 2001 · Shirvani 2017 · de Geus 2018 · Nguyen 2020', 540, 996, { size: 22, weight: 700, color: C.ink3, align: 'center' });
    ctx.restore();
    ctx.restore();
  }
  let CARD_RAT_SIZE = 40;

  function drawFooter(t) {
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.font = F(800, 26); ctx.fillStyle = C.ink2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('@natebrooksendo', 82, 1566);
    ctx.globalAlpha = seg(t, 2.4, 2.8) * 0.9; ctx.font = F(700, 23); ctx.textAlign = 'right';
    ctx.fillText('schematic · time & size not to scale · toy counts', 940, 1566);
    ctx.restore();
  }

  // ------------------------------------------------------------------ frame
  function drawScene(t) {
    const ps = punch(t);
    ctx.setTransform(ps, 0, 0, ps, DOCK[0] * (1 - ps), DOCK[1] * (1 - ps)); // punch-in on the lock-and-key moment
    const f = { mem: foc('mem', t), aa: foc('aa', t), cox: foc('cox', t), nerve: foc('nerve', t), ibu: foc('ibu', t) };
    f.fall = Math.max(f.cox, f.nerve);
    const P1 = () => ctx.setTransform(ps, 0, 0, ps, DOCK[0] * (1 - ps), DOCK[1] * (1 - ps)), P0 = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
    group(f.mem, () => { drawMembrane(t); drawPLA2(t); });
    group(f.cox, () => { drawCOX(t); drawBelt(t); });
    group(f.aa, () => drawAAs(t));
    group(f.cox, () => { drawProducts(t); drawStamp(t); drawCounter(t); });
    P0(); // the nerve side stays put during the punch-in
    group(f.mem, () => drawLowerMembrane(t));
    group(f.nerve, () => { drawNerve(t); drawPGE2Field(t); drawMeter(t); });
    group(f.fall, () => drawFalling(t, ps));
    drawLabels(t, f, 'lower');
    P1();
    group(f.ibu, () => drawIbuprofen(t));
    drawLabels(t, f, 'upper');
    P0();
  }
  function drawHookFrame() { // exactly frame 0 (used for the loop crossfade)
    drawBackground(0); drawHook(0); drawCaptions(0); drawFooter(0);
  }
  function render(t) {
    ctx = mainCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; shadowOff(); ctx.setLineDash([]);
    drawBackground(t);
    drawHook(t);
    if (t > 2.05) drawScene(t);
    drawDive(t);
    drawCaptions(t);
    drawCard(t);
    drawFooter(t);
    const fo = seg(t, TL.fadeOut, TL.loopEnd, ease.inOut); // crossfade back into the hook so the loop is seamless
    if (fo > 0) {
      ctx = layerCtx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); shadowOff();
      drawHookFrame();
      ctx = mainCtx; ctx.save(); ctx.globalAlpha = fo; ctx.drawImage(layer, 0, 0); ctx.restore();
    }
  }

  window.REEL = {
    title: 'How ibuprofen turns down pulpal pain',
    duration: TL.end,
    poster: 1.2,
    canvas,
    fonts: ['900 78px Nunito', '800 32px Nunito', '700 44px Nunito', '600 24px Nunito'],
    setup() {
      buildBg();
      // fit the rationale line inside the card
      ctx = mainCtx; while (CARD_RAT_SIZE > 34 && richWidth('-> one rationale for dosing *before treatment*†', CARD_RAT_SIZE, 800) > 800) CARD_RAT_SIZE -= 1;
    },
    render,
  };
  Kit.boot(REEL);
})();
