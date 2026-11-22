/*
 * 09 — Calcium hydroxide vs bacteria in dentinal tubules.
 * Style: SIMULATED fluorescence (CLSM live/dead) time-lapse with microscope-software UI.
 * Everything is a pure function of t. Randomness: Kit.rng / Kit.hash / Kit.noise only.
 * v5: re-anchored pH model (Nerwich 1993), partial + slower killing, honesty labels, review fixes.
 */
(() => {
  const { W, H, clamp, lerp, seg, env, ease, rng, hash, noise1, noise2, mix, colormap } = Kit;
  const { canvas, ctx } = Kit.createCanvas();
  const DUR = 28.2;
  const SANS = '"IBM Plex Sans", "DejaVu Sans", sans-serif';
  const MONO = '"IBM Plex Mono", "DejaVu Sans Mono", monospace';
  const TAU = Math.PI * 2;

  // ---------------------------------------------------------------- palette
  const LIVE = [64, 255, 118], DEAD = [255, 46, 66], CYAN = [70, 214, 255], LILAC = [196, 172, 255], SAND = [239, 211, 164];
  const PAL = { cy: '#6fe0ff', g: '#6dff94', r: '#ff5262', am: '#ffc94a', sand: '#efd3a4', w: '#ffffff', dim: '#8d98a5', lil: '#cdb9ff', ui: '#dfe6ee', sub: '#cfd8e2', h: '#ffe7b0' };
  const rgbs = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  // pH look-up table (pseudo-colour channel)
  const LUT = [[7.0, '#000000'], [9.0, '#020818'], [10.0, '#071f5c'], [11.0, '#0d4aa8'], [11.9, '#1890e6'], [12.6, '#4fd6ff']];
  const lut = (p) => colormap(LUT, p);

  // ---------------------------------------------------------------- geometry
  const WALL = 500, BOT = 1320, L = BOT - WALL;        // canal wall → outer dentine (depth axis, NOT to scale)
  const TUBX = [124, 276, 428, 580, 836];              // tubule centre lines (last one sits under the plot panel)
  const yOf = (d) => WALL + d * L;
  const cx = (i, y) => TUBX[i] + 8 * Math.sin(y * 0.0047 + i * 1.7) + 3 * noise1(y * 0.012, i + 3);
  const hw = (y) => 42 - 12 * clamp((y - WALL) / L) + 9 * Math.exp(-Math.max(0, y - WALL) / 16); // lumen half-width (flared orifice)
  // lateral scale: 34 px = 1 µm  (lumen ≈ 2.5 µm → 1.8 µm, coccus ≈ 0.9 µm). Depth is compressed.
  const PXUM = 34;

  // ---------------------------------------------------------------- timeline
  const TL = {
    hookB: 3.2,
    dissA: 1.5, dissB: 4.6,          // canal pH ramp (paste glow starts behind the hook)
    ins0A: 3.35, ins0B: 6.4,
    frontA: 6.4, frontB: 8.6,        // OH- front reaches inner dentine "within hours"
    clk0: 6.4, clk1: 21.2,           // schematic clock: day 0 → day 7
    ins1A: 10.6, ins1B: 13.85,
    bufA: 13.9, bufB: 17.3,
    ins2A: 17.35, ins2B: 21.25,
    finA: 21.4,
    rew: DUR - 0.55,                 // loop rewind
  };
  const CAPS = [
    { a: 3.2, b: 6.5, n: 1, accent: CYAN, eq: 'Ca(OH)_{2} <=> Ca^{2+} + 2OH^{−}', src: 'Mohammadi & Dummer, IEJ 2011' },
    { a: 6.5, b: 10.5, n: 2, accent: DEAD, text: 'OH^{−} diffuses in;\nsome nearby cells turn [r]red[/] (dead)', src: 'red = PI uptake = membrane breached' },
    { a: 10.5, b: 13.9, n: 3, accent: DEAD, text: 'High pH likely damages\nmembranes, proteins, DNA', src: 'proposed · Siqueira & Lopes, IEJ 1999' },
    { a: 13.9, b: 17.3, n: 4, accent: SAND, text: 'Dentine buffers OH^{−}:\nthe pH front stalls', src: 'Haapasalo 2000 · Nerwich 1993' },
    { a: 17.3, b: 21.3, n: 5, accent: LIVE, text: '*E. faecalis* survives pH 11.1;\nproton pumping appears critical', src: 'in vitro · Evans et al., IEJ 2002' },
  ];

  // ---------------------------------------------------------------- model time (loop rewind)
  const rewU = (t) => seg(t, TL.rew, DUR);
  function modelT(t) { // last 0.55 s: the time-lapse rewinds to 0 behind the takeaway card
    if (t <= TL.rew) return t;
    return lerp(TL.clk1 + 0.3, 0, ease.inOut(rewU(t)));
  }
  const days = (te) => 7 * seg(te, TL.clk0, TL.clk1);
  const tOfDay = (dd) => TL.clk0 + dd / 7 * (TL.clk1 - TL.clk0);

  // ---------------------------------------------------------------- pH model (toy, schematic; anchored to Nerwich 1993)
  // steady inner profile: ≥11.5 only at the canal wall / orifice; inner dentine ≈10.8 (cervical value)
  const KN = [[0, 12.5], [0.12, 11.5], [0.25, 10.8], [0.46, 10.3]];
  function Pss(d) {
    if (d <= 0) return 12.5;
    for (let k = 1; k < KN.length; k++) if (d <= KN[k][0]) {
      const u = (d - KN[k - 1][0]) / (KN[k][0] - KN[k - 1][0]);
      return lerp(KN[k - 1][1], KN[k][1], k === 1 ? u : ease.smooth(u));
    }
    return 10.3;
  }
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const canalPH = (te) => lerp(7.2, 12.5, seg(te, TL.dissA, TL.dissB, ease.inOut));
  const frontPos = (te) => 0.5 * seg(te, TL.frontA, TL.frontB, ease.out) + 0.03 * seg(te, TL.frontB, TL.bufB, ease.inOut);
  // outer dentine stays ≈7.2 until day ~1.5, then creeps up (Nerwich: rise after 1–7 d, peak 9.0–9.3 at 2–3 wk)
  const lowPH = (d, te) => 7.2 + 1.3 * seg(days(te), 1.5, 7, ease.smooth) * (1 - 0.3 * clamp(d));
  function pHat(d, te) {
    if (d < 0) return canalPH(te);
    const hi = Pss(d) - (12.5 - canalPH(te)), lo = lowPH(d, te);
    return lo + Math.max(0, hi - lo) * sig((frontPos(te) - d) / 0.05 - 1.5);
  }
  const KILL = 11.5;
  function killDepth(te) {
    if (pHat(0, te) < KILL) return null;
    let a = 0, b = 0.7;
    for (let k = 0; k < 26; k++) { const m = (a + b) / 2; if (pHat(m, te) >= KILL) a = m; else b = m; }
    return (a + b) / 2;
  }
  const clockStr = (te) => `day ${Math.min(7, Math.floor(days(te) + 1e-6))}`;

  // ---------------------------------------------------------------- helpers
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

  // rich text: *italic*, _{sub}, ^{sup}, [cy]colour[/], -> arrow, <=> equilibrium
  function parseRich(s) {
    const out = []; let italic = false, color = null, buf = '', i = 0;
    const push = () => { if (buf) { out.push({ text: buf, italic, mode: 'n', color }); buf = ''; } };
    while (i < s.length) {
      const c = s[i];
      if (c === '*') { push(); italic = !italic; i++; continue; }
      if ((c === '_' || c === '^') && s[i + 1] === '{') { push(); const j = s.indexOf('}', i); out.push({ text: s.slice(i + 2, j), italic, mode: c === '_' ? 'sub' : 'sup', color }); i = j + 1; continue; }
      if (c === '[') { const j = s.indexOf(']', i); push(); const tag = s.slice(i + 1, j); color = tag === '/' ? null : tag; i = j + 1; continue; }
      if (c === '<' && s.slice(i, i + 3) === '<=>') { push(); out.push({ equil: true, color }); i += 3; continue; }
      if (c === '-' && s[i + 1] === '>') { push(); out.push({ arrow: true, color }); i += 2; continue; }
      buf += c; i++;
    }
    push(); return out;
  }
  const fontStr = (o, italic, sc = 1) => `${italic ? 'italic ' : ''}${o.weight || 400} ${Math.round(o.size * sc)}px ${o.mono ? MONO : SANS}`;
  function tokW(tk, o) {
    if (tk.arrow) return o.size * 1.18;
    if (tk.equil) return o.size * 1.4;
    ctx.font = fontStr(o, tk.italic, tk.mode === 'n' ? 1 : 0.62);
    return ctx.measureText(tk.text).width + (tk.mode !== 'n' ? o.size * 0.03 : 0) + (tk.italic && tk.mode === 'n' ? o.size * 0.04 : 0);
  }
  function richWidth(s, o) { return parseRich(s).reduce((w, tk) => w + tokW(tk, o), 0); }
  function rich(s, x, y, o) {
    const toks = parseRich(s);
    let w = 0; for (const tk of toks) { tk.w = tokW(tk, o); w += tk.w; }
    let sx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    for (const tk of toks) {
      const col = tk.color ? PAL[tk.color] : (o.color || '#fff');
      if (tk.arrow) {
        const s = o.size, yy = y - s * 0.31;
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(2, s * 0.07); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx + s * 0.16, yy); ctx.lineTo(sx + s * 0.86, yy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + s * 1.04, yy); ctx.lineTo(sx + s * 0.78, yy - s * 0.17); ctx.lineTo(sx + s * 0.78, yy + s * 0.17); ctx.closePath(); ctx.fill();
      } else if (tk.equil) { // two harpoons ⇌
        const s = o.size, y1 = y - s * 0.42, y2 = y - s * 0.22, x0 = sx + s * 0.2, x1 = sx + s * 1.2;
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, s * 0.06); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1 - s * 0.22, y1 - s * 0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1, y2); ctx.lineTo(x0, y2); ctx.lineTo(x0 + s * 0.22, y2 + s * 0.15); ctx.stroke();
      } else {
        const sc = tk.mode === 'n' ? 1 : 0.62;
        ctx.font = fontStr(o, tk.italic, sc);
        const dy = tk.mode === 'sub' ? o.size * 0.2 : tk.mode === 'sup' ? -o.size * 0.4 : 0;
        if (o.outline) { ctx.lineWidth = o.outline; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(tk.text, sx, y + dy); }
        ctx.fillStyle = col; ctx.fillText(tk.text, sx, y + dy);
      }
      sx += tk.w;
    }
    ctx.restore();
    return w;
  }
  function pill(x, y, w, h, fill = 'rgba(0,0,0,0.72)', stroke = null, r = 8) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function brackets(x, y, w, h, len, col, lw = 2) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
    ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
    ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
    ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
    ctx.stroke();
  }

  // ---------------------------------------------------------------- static assets (built in setup)
  let BG, PASTE, VIG, MASK, TMP, TG, BLR, BLG, RIMS, GRAIN = [], SPR = {}, tKill0 = 99;
  function tubPath(i, extra, yTop = WALL - 14) {
    const p = new Path2D(); const pts = [];
    for (let y = yTop; y <= H + 30; y += 12) pts.push(y);
    pts.forEach((y, k) => { const x = cx(i, y) - hw(y) - extra; k ? p.lineTo(x, y) : p.moveTo(x, y); });
    for (let k = pts.length - 1; k >= 0; k--) { const y = pts[k]; p.lineTo(cx(i, y) + hw(y) + extra, y); }
    p.closePath(); return p;
  }
  function buildBG() {
    const M = 20, BW = W + 2 * M, BH = H + 2 * M;
    const [c, g] = mk(BW, BH);
    const img = g.createImageData(BW, BH), D = img.data, R = rng(5);
    for (let y = 0; y < BH; y++) {
      const Y = y - M;
      for (let x = 0; x < BW; x++) {
        const X = x - M; let r, gg, b;
        const wallY = WALL + 5 * noise1(X * 0.02, 9);
        if (Y < wallY) { // Ca(OH)2 paste: grainy, scattering
          const n = 0.5 + 0.32 * noise2(X / 26, Y / 26, 1) + 0.22 * noise2(X / 7, Y / 7, 2);
          const v = 14 + 24 * n + R() * 9;
          r = v * 0.94; gg = v; b = v * 1.06;
        } else { // dentine autofluorescence + collagen streaks
          const n = 0.55 + 0.25 * noise2(X / 70, Y / 70, 3) + 0.14 * noise2(X / 22, Y / 4.5, 4) + 0.08 * noise2(X / 4, Y / 4, 5);
          const fade = 1 - 0.5 * clamp((Y - WALL) / 1300);
          const v = (7 + 21 * n + R() * 5) * fade;
          r = v * 0.7; gg = v * 0.9; b = v * 1.28;
        }
        const k = (y * BW + x) * 4; D[k] = r; D[k + 1] = gg; D[k + 2] = b; D[k + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    g.translate(M, M);
    // micro-branches (dark fine canaliculi)
    const RB = rng(17);
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 1.6;
    for (let i = 0; i < TUBX.length; i++) for (let k = 0; k < 22; k++) {
      const y = WALL + 30 + RB() * (H - WALL), side = RB() < 0.5 ? -1 : 1;
      const x0 = cx(i, y) + side * hw(y), len = 18 + RB() * 60, a = (0.25 + RB() * 0.7);
      g.beginPath(); g.moveTo(x0, y);
      g.quadraticCurveTo(x0 + side * len * 0.5, y + len * 0.15 * a, x0 + side * len * Math.cos(a * 0.6), y + len * Math.sin(a * 0.6));
      g.stroke();
    }
    // tubule walls (peritubular dentine rim) + dark lumens
    for (let i = 0; i < TUBX.length; i++) {
      g.save(); g.filter = 'blur(4px)'; g.strokeStyle = 'rgba(120,150,190,0.32)'; g.lineWidth = 9; g.stroke(tubPath(i, 3)); g.restore();
      g.save(); g.filter = 'blur(1px)'; g.strokeStyle = 'rgba(150,175,210,0.22)'; g.lineWidth = 2; g.stroke(tubPath(i, 1)); g.restore();
      g.save(); g.filter = 'blur(2px)'; g.fillStyle = 'rgba(1,2,5,0.93)'; g.fill(tubPath(i, 0)); g.restore();
    }
    // paste grains + canal wall rim
    const RG = rng(23);
    for (let k = 0; k < 2600; k++) {
      const x = RG() * W, y = RG() * (WALL - 4), r = 0.6 + RG() * 2.4;
      g.fillStyle = `rgba(215,225,240,${0.04 + RG() * 0.22})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.save(); g.filter = 'blur(3px)'; g.strokeStyle = 'rgba(170,190,215,0.35)'; g.lineWidth = 5; g.beginPath();
    for (let x = -20; x <= W + 20; x += 10) { const y = WALL + 5 * noise1(x * 0.02, 9); x > -20 ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.restore();
    return c;
  }
  function buildPaste() { // additive cyan pH glow of the paste
    const [c, g] = mk(W, WALL + 40);
    const gr = g.createLinearGradient(0, 0, 0, WALL + 40);
    gr.addColorStop(0, 'rgba(40,150,220,0.55)'); gr.addColorStop(0.85, 'rgba(60,200,255,0.75)'); gr.addColorStop(1, 'rgba(60,200,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, WALL + 40);
    const R = rng(41);
    for (let k = 0; k < 3200; k++) {
      const x = R() * W, y = R() * WALL, r = 0.7 + R() * 2.6;
      g.fillStyle = `rgba(150,235,255,${0.08 + R() * 0.4})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    return c;
  }
  function buildMask() {
    const [c, g] = mk(W, H);
    g.filter = 'blur(6px)'; g.fillStyle = '#fff';
    for (let i = 0; i < TUBX.length; i++) g.fill(tubPath(i, 1));
    g.filter = 'none';
    const img = g.getImageData(0, 0, W, H), D = img.data;
    for (let y = WALL - 30; y < H; y++) for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 4 + 3; if (!D[k]) continue;
      D[k] = D[k] * clamp(0.62 + 0.3 * noise2(x / 26, y / 34, 8) + 0.12 * noise2(x / 7, y / 9, 9));
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  function buildRims() { // sand-coloured peritubular rims (lit while dentine "buffers")
    const [c, g] = mk(W, H);
    for (let i = 0; i < 4; i++) {
      g.save(); g.filter = 'blur(6px)'; g.strokeStyle = rgbs(SAND, 0.7); g.lineWidth = 16; g.stroke(tubPath(i, 5)); g.restore();
      g.save(); g.filter = 'blur(1.5px)'; g.strokeStyle = rgbs(mix(SAND, [255, 255, 255], 0.2), 0.95); g.lineWidth = 4; g.stroke(tubPath(i, 3)); g.restore();
    }
    return c;
  }
  function buildVignette() {
    const [c, g] = mk(W, H);
    const gr = g.createRadialGradient(470, 900, 330, 540, 920, 1250);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0.88)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return c;
  }
  function buildGrain() {
    for (let s = 0; s < 6; s++) {
      const [c, g] = mk(256, 256); const img = g.createImageData(256, 256), D = img.data, R = rng(100 + s);
      for (let k = 0; k < 256 * 256; k++) {
        const v = Math.pow(R(), 2.2) * 255;
        D[k * 4] = v * 0.85; D[k * 4 + 1] = v * 0.95; D[k * 4 + 2] = v; D[k * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      GRAIN.push(ctx.createPattern(c, 'repeat'));
    }
  }
  function sprite(w, h, rx, ry, rgb, eb = 0) { // fluorescent cell: soft halo, body, faint core (eb = extra defocus blur)
    const [c, g] = mk(w, h);
    const shape = (ex) => {
      g.beginPath();
      if (ry > rx * 1.6) g.roundRect(w / 2 - rx - ex, h / 2 - ry - ex, 2 * (rx + ex), 2 * (ry + ex), Math.max(1, rx + ex));
      else g.ellipse(w / 2, h / 2, Math.max(1, rx + ex), Math.max(1, ry + ex), 0, 0, Math.PI * 2);
    };
    g.filter = `blur(${10 + eb}px)`; g.fillStyle = rgbs(rgb, 0.5); shape(6); g.fill();
    g.filter = `blur(${2 + eb}px)`; g.fillStyle = rgbs(rgb, 0.92); shape(0); g.fill();
    g.filter = `blur(${3 + eb}px)`; g.fillStyle = rgbs(mix(rgb, [255, 255, 255], 0.3), 0.35); shape(-rx * 0.45); g.fill();
    g.filter = 'none';
    return c;
  }
  function dotSprite(rgb, size, core = 0.9) {
    const [c, g] = mk(size, size);
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, `rgba(255,255,255,${core})`); gr.addColorStop(0.18, rgbs(rgb, 0.95)); gr.addColorStop(0.45, rgbs(rgb, 0.35)); gr.addColorStop(1, rgbs(rgb, 0));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return c;
  }

  // ---------------------------------------------------------------- bacteria
  // Near the canal (≥11.5 zone) a hand-placed mix: rods (other species, all eventually die) and cocci
  // (some die, some survive: killing in tubules is incomplete). Below the kill line: E. faecalis cocci only.
  const ZONE_A = [
    // tubule, depth, lateral offset, type, cells, angle, death day (null = survives, 'roi1' = ROI 1 victim)
    [0, 0.045, -14, 'rod', 1, 0.12, 1.3],
    [0, 0.068, 17, 'coc', 2, 0.2, null],
    [1, 0.028, -12, 'coc', 2, 1.35, 1.8],
    [1, 0.080, 16, 'rod', 1, -0.08, 'roi1'],
    [2, 0.050, 15, 'rod', 1, 0.18, 1.5],
    [2, 0.062, -17, 'coc', 3, 0.08, null],
    [3, 0.030, 18, 'coc', 2, 1.15, 3.4],
    [3, 0.080, -14, 'rod', 1, -0.15, 4.6],
    [3, 0.088, 19, 'coc', 1, 0, null],
  ];
  const bugs = [];
  let roi1 = null, roi2 = null;
  function genBugs() {
    for (const [i, d, off, type, n, ang, dd] of ZONE_A) {
      const b = { i, d, off, type, n, ang, len: type === 'rod' ? 66 : n * 29, sz: 0.96 + 0.08 * hash(bugs.length, 5), id: bugs.length, ph: hash(bugs.length, 6) * TAU, tDeath: Infinity };
      if (dd === 'roi1') { b.tDeath = TL.ins1A + 1.0; roi1 = b; } else if (dd != null) b.tDeath = tOfDay(dd);
      bugs.push(b);
    }
    const R = rng(91);
    for (let i = 0; i < 4; i++) {
      const add = (d) => {
        const y = yOf(d), n = [1, 2, 2, 3, 4][Math.floor(R() * 5)];
        const off = (R() * 2 - 1) * Math.max(0, hw(y) - 19);
        bugs.push({ i, d, off, type: 'coc', n, ang: (R() * 2 - 1) * 0.55, len: n * 29, sz: 0.92 + R() * 0.16, id: bugs.length, ph: R() * TAU, tDeath: Infinity });
      };
      for (let d = 0.165 + R() * 0.05; d < 0.47; d += 0.12 + R() * 0.08) add(d);          // inner dentine
      for (let d = 0.6 + R() * 0.08; d < 1.12; d += 0.22 + R() * 0.16) add(d);           // outer dentine (sparser)
    }
    for (const b of bugs) { b.blur = hash(b.id, 77) < 0.3; b.bright = 0.65 + 0.35 * hash(b.id, 78); }
    // ROI 2: a coccus just below the kill line (pH ≈ 11), tubule 2 or 3
    let bd = 9;
    for (const b of bugs) if ((b.i === 1 || b.i === 2) && b.d > 0.15 && b.d < bd) { bd = b.d; roi2 = b; }
  }
  function bugPos(b, t) {
    const y0 = yOf(b.d);
    return [cx(b.i, y0) + b.off + 0.7 * noise1(t * 0.6, b.id * 3 + 1), y0 + 0.7 * noise1(t * 0.6, b.id * 3 + 2)];
  }
  function bugState(b, te) {
    if (!isFinite(b.tDeath)) return { g: 1, r: 0 };
    return { r: seg(te, b.tDeath, b.tDeath + 1.0, ease.smooth), g: 1 - seg(te, b.tDeath + 0.3, b.tDeath + 1.35, ease.smooth) };
  }
  function bugCells(b, x0, y0) {
    const cells = [];
    if (b.type === 'rod') cells.push([x0, y0]);
    else for (let k = 0; k < b.n; k++) { const o = (k - (b.n - 1) / 2) * 28 * b.sz; cells.push([x0 + Math.sin(b.ang) * o, y0 + Math.cos(b.ang) * o]); }
    return cells;
  }
  function drawBug(b, t, te, mult = 1, deadMult = 1) {
    const [x0, y0] = bugPos(b, t);
    const st = bugState(b, te);
    const breathe = 0.88 + 0.12 * Math.sin(TAU * 7 * t / DUR + b.ph); // periodic over DUR → seamless loop
    const cells = bugCells(b, x0, y0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${0.6 * mult})`;
    for (const [x, y] of cells) { ctx.beginPath(); if (b.type === 'rod') { ctx.save(); ctx.translate(x, y); ctx.rotate(-b.ang); ctx.roundRect(-16, -40, 32, 80, 16); ctx.restore(); } else ctx.arc(x, y, 19, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter';
    const k = b.blur ? 'b' : '';
    const sg = SPR[(b.type === 'rod' ? 'rodG' : 'cocG') + k], sr = SPR[(b.type === 'rod' ? 'rodR' : 'cocR') + k];
    const br = b.bright * mult;
    for (const [x, y] of cells) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-b.ang); ctx.scale(b.sz, b.sz);
      if (st.g > 0.003) { ctx.globalAlpha = st.g * breathe * br; ctx.drawImage(sg, -sg.width / 2, -sg.height / 2); }
      if (st.r > 0.003) { ctx.globalAlpha = st.r * 0.95 * br * deadMult; ctx.drawImage(sr, -sr.width / 2, -sr.height / 2); }
      ctx.restore();
    }
    // membrane-rupture ring
    if (isFinite(b.tDeath)) {
      const u = seg(te, b.tDeath, b.tDeath + 0.8);
      if (u > 0 && u < 1) {
        ctx.globalAlpha = (1 - u) * 0.3 * mult; ctx.strokeStyle = rgbs(DEAD, 1); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x0, y0, 14 + 16 * ease.out(u) + (b.len / 4), 0, 7); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function bugBox(b, t) { // bounding box for ROI frames
    const [x, y] = bugPos(b, t);
    const hl = b.len / 2 + 22, hwid = 34 + Math.abs(Math.sin(b.ang)) * b.len / 2;
    return [x - hwid, y - hl, hwid * 2, hl * 2];
  }

  // ---------------------------------------------------------------- ions
  const ions = [], units = [];
  function genIons() {
    const R = rng(7);
    for (let i = 0; i < 4; i++) for (let k = 0; k < 40; k++) {
      ions.push({ i, tb: TL.frontA - 0.3 + Math.pow(R(), 1.15) * 13.0, lat: R() * 2 - 1, f: 0.25 + R() * 0.85, tau: 0.8 + R() * 1.1, id: ions.length, side: R() < 0.5 ? -1 : 1 });
    }
    const R3 = rng(33);
    for (let k = 0; k < 110; k++) units.push({ x: R3() * W, y: 230 + R3() * 262, ts: TL.dissA + 0.2 + R3() * (TL.dissB - TL.dissA - 0.4), a: R3() * 6.28, id: k });
  }
  function ionState(o, te) {
    const age = te - o.tb; if (age < 0) return null;
    const dmax = 0.55 * o.f;
    let d = -0.03 + (dmax + 0.03) * (1 - Math.exp(-age / o.tau));
    d = Math.min(d, frontPos(te) + 0.04);
    const ta = 2.8 * o.tau; // absorbed into the wall (buffered)
    const absorb = seg(age, ta, ta + 0.55);
    if (absorb >= 1) return { done: true, d, ta };
    return { d, absorb, ta };
  }

  // ---------------------------------------------------------------- drawing: specimen
  function drawSpecimen(t, te, fin, rw) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(BG, -20, -20);

    ctx.globalCompositeOperation = 'lighter';
    // paste pH glow
    const pk = (canalPH(te) - 7.2) / 5.3;
    if (pk > 0) { ctx.globalAlpha = 0.62 * pk; ctx.drawImage(PASTE, 0, 0); ctx.globalAlpha = 1; }
    // intertubular haze
    {
      const gr = ctx.createLinearGradient(0, WALL - 6, 0, BOT + 160);
      for (let k = 0; k <= 16; k++) { const d = k / 16 * 1.19 - 0.005; const f = (yOf(d) - (WALL - 6)) / (BOT + 166 - WALL); gr.addColorStop(clamp(f), rgbs(lut(pHat(d, te)), 0.13)); }
      ctx.fillStyle = gr; ctx.fillRect(-30, WALL - 6, W + 60, BOT + 160 - WALL);
    }
    // tubule lumens (gradient through a soft, noisy lumen mask)
    {
      TG.globalCompositeOperation = 'source-over'; TG.clearRect(0, 0, W, H);
      const gr = TG.createLinearGradient(0, WALL - 20, 0, H);
      for (let k = 0; k <= 30; k++) { const d = k / 30 * 1.25 - 0.02; const f = (yOf(d) - (WALL - 20)) / (H - WALL + 20); gr.addColorStop(clamp(f), rgbs(lut(pHat(Math.max(d, 0), te)), 0.9)); }
      TG.fillStyle = gr; TG.fillRect(0, WALL - 20, W, H - WALL + 20);
      TG.globalCompositeOperation = 'destination-in'; TG.drawImage(MASK, 0, 0);
      ctx.drawImage(TMP, 0, 0);
    }
    const kd = killDepth(te);
    // buffering: peritubular rims glow sand around (and just below) the kill line
    const rimA = env(t, TL.bufA, TL.bufB + 0.2, 0.6, 0.6);
    if (rimA > 0 && kd != null) {
      TG.globalCompositeOperation = 'source-over'; TG.clearRect(0, 0, W, H);
      TG.drawImage(RIMS, 0, 0);
      const y0 = yOf(kd - 0.12), y1 = yOf(kd + 0.14);
      const gm = TG.createLinearGradient(0, y0, 0, y1);
      gm.addColorStop(0, 'rgba(0,0,0,0)'); gm.addColorStop(0.35, 'rgba(0,0,0,1)'); gm.addColorStop(0.6, 'rgba(0,0,0,1)'); gm.addColorStop(1, 'rgba(0,0,0,0)');
      TG.globalCompositeOperation = 'destination-in'; TG.fillStyle = gm; TG.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = rimA * (0.88 + 0.12 * Math.sin(t * 3.2)); ctx.drawImage(TMP, 0, 0); ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
    }
    // dissociating paste glints
    for (const u of units) drawUnit(u, t, te);
    // OH- ions in tubules (hidden during the loop rewind)
    if (rw <= 0) {
      const bufBoost = 1 + 1.2 * env(t, TL.bufA, TL.bufB + 0.4, 0.5, 0.6);
      for (const o of ions) {
        const s = ionState(o, te); if (!s || s.done && seg(te - o.tb, s.ta + 0.55, s.ta + 1.2) >= 1) continue;
        const y = yOf(s.d);
        const hwy = hw(y) - 7;
        const wig = 4 * noise1(t * 1.4 + o.id * 1.7, 5);
        let lat = o.lat * hwy + wig;
        const ab = s.done ? 1 : s.absorb;
        lat = lerp(lat, o.side * (hw(y) + 1), ease.inOut(ab));
        const x = cx(o.i, y) + lat;
        if (!s.done) {
          ctx.globalAlpha = (1 - ab) * clamp((te - o.tb) / 0.3);
          ctx.drawImage(SPR.ion, x - 11, y - 11);
        }
        // buffering flash on the wall (sand = dentine)
        const fu = seg(te - o.tb, s.ta + 0.3, s.ta + 1.0);
        if (fu > 0 && fu < 1) {
          ctx.globalAlpha = Math.min(1, (1 - fu) * 0.5 * bufBoost);
          const s2 = 44 + 14 * fu;
          ctx.drawImage(SPR.flash, x - s2 / 2, y - s2 / 2, s2, s2);
        }
      }
    }
    ctx.globalAlpha = 1;
    // bacteria (clipped to the dentine side of the canal wall)
    const survFocus = seg(t, TL.ins2A - 0.1, TL.ins2A + 0.5) * (1 - rw);
    ctx.save(); ctx.beginPath(); ctx.rect(0, WALL - 6, W, H); ctx.clip();
    for (const b of bugs) drawBug(b, t, te, 1, 1 - 0.35 * survFocus);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    // kill line (pH 11.5 contour)
    if (kd != null && kd >= 0) {
      const ky = yOf(kd);
      const a = seg(te, tKill0, tKill0 + 0.5);
      const stalled = te > TL.frontB + 0.3;
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(255,201,74,0.95)'; ctx.lineWidth = 3; ctx.setLineDash([16, 11]); ctx.lineDashOffset = stalled ? -(TL.frontB + 0.3) * 18 : -te * 18;
      ctx.beginPath(); ctx.moveTo(48, ky); ctx.lineTo(pX(KILL), ky); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
    // survivor brackets: one per tubule around the survivors below the kill line
    const ra = seg(t, TL.ins2A - 0.2, TL.ins2A + 0.3) * (1 - seg(rw, 0, 0.4));
    if (ra > 0 && kd != null) {
      const ky = yOf(kd);
      ctx.save(); ctx.globalAlpha = ra;
      for (let i = 0; i < 4; i++) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const b of bugs) {
          if (b.i !== i || isFinite(b.tDeath) || (b === roi2 && t < TL.ins2B - 0.2)) continue;
          const [bx, by, bw, bh] = bugBox(b, t);
          if (bugPos(b, t)[1] < ky + 20) continue;      // below the kill line only
          if (by + bh > 1060) continue;                 // stay clear of the takeaway card
          x0 = Math.min(x0, bx + 8); y0 = Math.min(y0, by + 8); x1 = Math.max(x1, bx + bw - 8); y1 = Math.max(y1, by + bh - 8);
        }
        if (x1 > x0) brackets(x0, y0, x1 - x0, y1 - y0, 14, 'rgba(120,255,160,0.85)', 2.5);
      }
      ctx.restore();
    }
    ctx.restore();
    return { kd };
  }
  function drawUnit(u, t, te) { // tiny ion glints released in the paste
    const p = seg(te, u.ts, u.ts + 1.3, ease.out);
    if (p <= 0) return;
    const j = (k) => 2.5 * noise1(t * 1.1 + u.id * 3.1 + k * 7.7, 11);
    const sep = 8 + 30 * p;
    const ux = u.x + j(0), uy = u.y + j(1);
    ctx.globalAlpha = 0.85 * (0.45 + 0.4 * p) * p;
    ctx.drawImage(SPR.ca, ux - 8, uy - 8, 16, 16);
    for (let k = 0; k < 2; k++) {
      const a = u.a + k * Math.PI + 0.6 * p * (k ? 1 : -1);
      const ox = ux + Math.cos(a) * sep + j(2 + k), oy = uy + Math.sin(a) * sep * 0.8 + j(4 + k);
      const s2 = 12 + 4 * p;
      ctx.globalAlpha = 0.85 * (0.35 + 0.65 * p) * p;
      ctx.drawImage(SPR.ion, ox - s2 / 2, oy - s2 / 2, s2, s2);
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- pH profile plot (UI)
  const PX0 = 808, PX1 = 946, PANEL = { x: 776, y: 410, w: 184, h: 920 };
  const pX = (p) => PX0 + (clamp(p, 7, 13) - 7) / 6 * (PX1 - PX0);
  function drawPlot(t, te, kd, alpha, fin = 0) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    pill(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 'rgba(3,6,10,0.80)', 'rgba(255,255,255,0.12)', 6);
    rich('pH', PANEL.x + 14, 444, { size: 30, weight: 500, mono: true, color: '#fff' });
    rich('model', PANEL.x + 62, 444, { size: 22, mono: true, color: PAL.dim });
    // axis: 7 · 13 + LUT calibration bar + amber 11.5
    rich('7', PX0, 468, { size: 22, mono: true, color: PAL.dim });
    rich('13', PX1, 468, { size: 22, mono: true, color: PAL.dim, align: 'right' });
    for (let k = 0; k < 46; k++) { const p0 = 7 + k / 46 * 6; ctx.fillStyle = rgbs(lut(Math.min(p0, 12.6)), 1); ctx.fillRect(pX(p0), 474, (PX1 - PX0) / 46 + 0.6, 9); }
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.strokeRect(PX0 - 0.5, 473.5, PX1 - PX0 + 1, 10);
    rich('11.5', pX(KILL) - 4, 498, { size: 22, weight: 500, mono: true, color: PAL.am, align: 'right' });
    ctx.fillStyle = PAL.am; ctx.fillRect(pX(KILL) - 1, 472, 2, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
    for (const v of [7, 9, 11, 13]) { ctx.beginPath(); ctx.moveTo(pX(v), WALL); ctx.lineTo(pX(v), BOT); ctx.stroke(); }
    // 11.5 reference
    ctx.strokeStyle = 'rgba(255,201,74,0.55)'; ctx.setLineDash([6, 7]); ctx.beginPath(); ctx.moveTo(pX(KILL), WALL); ctx.lineTo(pX(KILL), 1236); ctx.stroke(); ctx.setLineDash([]);
    // depth zone ticks + labels (schematic depth)
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    for (const d of [0, 0.12, 0.5]) { ctx.beginPath(); ctx.moveTo(PANEL.x, yOf(d)); ctx.lineTo(PANEL.x + 10, yOf(d)); ctx.stroke(); }
    rich('canal', 846, 528, { size: 22, color: '#a9b4c0' });
    rich('wall', 846, 551, { size: 22, color: '#a9b4c0' });
    rich('inner', 824, yOf(0.3), { size: 22, color: '#a9b4c0' });
    rich('outer', PX1, yOf(0.66), { size: 22, color: '#a9b4c0', align: 'right' });
    rich('dentine', PX1, yOf(0.66) + 24, { size: 22, color: '#a9b4c0', align: 'right' });
    ctx.save(); ctx.translate(PANEL.x + 20, 905); ctx.rotate(Math.PI / 2);
    rich('depth → ~1 mm · not to scale', 0, 0, { size: 22, mono: true, color: '#7f8a97' });
    ctx.restore();
    // curve
    const pts = [];
    for (let k = 0; k <= 90; k++) { const d = k / 90; pts.push([pX(pHat(d, te)), yOf(d)]); }
    const fill = ctx.createLinearGradient(PX0, 0, PX1, 0);
    fill.addColorStop(0, 'rgba(40,120,255,0.02)'); fill.addColorStop(1, 'rgba(70,214,255,0.20)');
    ctx.beginPath(); ctx.moveTo(PX0, WALL); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(PX0, BOT); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(70,214,255,0.25)'; ctx.lineWidth = 9; ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    ctx.strokeStyle = '#8ae8ff'; ctx.lineWidth = 3; ctx.stroke();
    // kill marker
    if (kd != null && kd >= 0) {
      const ky = yOf(kd);
      ctx.globalAlpha = alpha * seg(te, tKill0, tKill0 + 0.5);
      ctx.fillStyle = PAL.am; ctx.beginPath(); ctx.arc(pX(KILL), ky, 7, 0, 7); ctx.fill();
      ctx.globalAlpha = alpha;
    }
    // outer-dentine readout
    const outer = pHat(0.95, te);
    ctx.globalAlpha = alpha * (1 - fin);
    rich('outer pH', PX1, 1266, { size: 22, mono: true, color: PAL.dim, align: 'right' });
    rich(outer.toFixed(1), PX1, 1310, { size: 38, weight: 500, mono: true, color: '#9fb8ff', align: 'right', outline: 5 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- insets
  function insetFrame(x, y, w, h, a) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(1,3,6,0.95)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(210,225,240,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    brackets(x - 4, y - 4, w + 8, h + 8, 22, 'rgba(235,242,250,0.9)', 2.5);
    ctx.restore();
  }
  function leader(ax, ay, aw, ah, bx, by, bw, bh, a, col) {
    // dashed lines connecting box A (ROI in field) to box B (inset)
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
    const below = by > ay;
    ctx.beginPath();
    if (below) { ctx.moveTo(ax, ay + ah); ctx.lineTo(bx, by); ctx.moveTo(ax + aw, ay + ah); ctx.lineTo(bx + bw, by); }
    else { ctx.moveTo(ax, ay); ctx.lineTo(bx, by + bh); ctx.moveTo(ax + aw, ay); ctx.lineTo(bx + bw, by + bh); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(ax, ay, aw, ah);
    ctx.restore();
  }
  function zoomIn(t, A, X0, Y0, IW, IH) {
    const sc = lerp(0.94, 1, ease.out(seg(t, A, A + 0.45)));
    ctx.translate(X0 + IW / 2, Y0 + IH / 2); ctx.scale(sc, sc); ctx.translate(-(X0 + IW / 2), -(Y0 + IH / 2));
  }

  // ROI 0: solid Ca(OH)2 (ionic lattice, low solubility) slowly releasing Ca2+ and OH-
  const LAT = [];
  function genLattice() {
    // layered ionic solid (schematic): Ca2+ rows with OH- above/below, each OH- shared by two Ca2+
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
      const x = (c - 2.5) * 46, y = (r - 0.5) * 84;
      LAT.push({ kind: 'ca', x, y });
      LAT.push({ kind: 'oh', x: x + 23, y: y - 27 });
      LAT.push({ kind: 'oh', x: x - 23, y: y + 27 });
    }
    // surface ions that leave (slow, sustained release); roughly 1 Ca2+ : 2 OH-
    const R = rng(55);
    for (const p of LAT) {
      const edgeCa = p.kind === 'ca' && Math.abs(p.x) > 100;
      const edgeOh = p.kind === 'oh' && (Math.abs(p.y) > 60 || Math.abs(p.x) > 125);
      if (!(edgeCa && R() < 0.8) && !(edgeOh && R() < 0.62)) continue;
      let a = Math.atan2(p.y * 0.6, p.x) + (R() - 0.5) * 0.6;
      if (Math.sin(a) < -0.45) a = Math.atan2(-0.45, Math.cos(a)); // keep released ions clear of the inset header
      p.rel = { ts: 3.3 + R() * 2.4, dist: 90 + R() * 60, a };
    }
  }
  function drawInset0(t, te) {
    const A = TL.ins0A, B = TL.ins0B;
    const o = seg(t, A, A + 0.4, ease.out) * (1 - seg(t, B - 0.35, B));
    if (o <= 0) return;
    const X0 = 236, Y0 = 345, IW = 500, IH = 372;
    // ROI box in the paste (left), leaders to the inset's left corners
    const bx = 104, by = 418, bw = 70, bh = 58;
    ctx.save(); ctx.globalAlpha = o * 0.9; ctx.strokeStyle = 'rgba(160,235,255,0.9)'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(X0, Y0); ctx.moveTo(bx + bw, by + bh); ctx.lineTo(X0, Y0 + IH); ctx.stroke(); ctx.restore();
    ctx.save();
    zoomIn(t, A, X0, Y0, IW, IH);
    insetFrame(X0, Y0, IW, IH, o);
    ctx.globalAlpha = o;
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, IW, IH); ctx.clip();
    const pk = (canalPH(te) - 7.2) / 5.3;
    const CX = X0 + IW / 2, CY = Y0 + 196;
    const hz = ctx.createRadialGradient(CX, CY, 20, CX, CY, 320);
    hz.addColorStop(0, `rgba(60,200,255,${0.05 + 0.2 * pk})`); hz.addColorStop(1, 'rgba(10,40,120,0.03)');
    ctx.fillStyle = hz; ctx.fillRect(X0, Y0, IW, IH);
    // free ions already in solution (more over time)
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 46; k++) {
      const ts = 2.4 + hash(k, 53) * 3.4, p = seg(te, ts, ts + 0.8, ease.out);
      if (p <= 0) continue;
      let ux = X0 + 24 + hash(k, 51) * 452, uy = Y0 + 60 + hash(k, 52) * 250;
      if (Math.abs(ux - CX) < 175 && Math.abs(uy - CY) < 82) continue;
      ux += 6 * noise1(t * 0.8 + k, 56); uy += 6 * noise1(t * 0.8 + k, 57);
      const isCa = hash(k, 54) < 0.33;
      ctx.globalAlpha = o * p * (isCa ? 0.55 : 0.7);
      ctx.drawImage(isCa ? SPR.ca : SPR.ion, ux - 8, uy - 8, 16, 16);
    }
    // lattice bonds (faint) + ions
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = `rgba(200,215,235,${0.22 * o})`; ctx.lineWidth = 2;
    for (const p of LAT) if (p.kind === 'oh' && !(p.rel && te > p.rel.ts)) {
      for (const q of LAT) if (q.kind === 'ca' && !(q.rel && te > q.rel.ts) && Math.hypot(q.x - p.x, q.y - p.y) < 40) {
        ctx.beginPath(); ctx.moveTo(CX + q.x, CY + q.y); ctx.lineTo(CX + p.x, CY + p.y); ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    const lblPos = {};
    for (const p of LAT) {
      let x = CX + p.x, y = CY + p.y, rel = 0;
      if (p.rel) {
        rel = seg(te, p.rel.ts, p.rel.ts + 1.6, ease.out);
        x += Math.cos(p.rel.a) * p.rel.dist * rel + 3 * noise1(t + p.x, 58) * rel;
        y += Math.sin(p.rel.a) * p.rel.dist * rel * 0.8 + 3 * noise1(t + p.y, 59) * rel;
        if (rel > 0.6) { if (p.kind === 'ca' && (!lblPos.ca || x < lblPos.ca[0])) lblPos.ca = [x, y]; if (p.kind === 'oh' && (!lblPos.oh || x > lblPos.oh[0])) lblPos.oh = [x, y]; }
      }
      const s = p.kind === 'ca' ? 50 : 38;
      ctx.globalAlpha = o * (p.kind === 'ca' ? 0.8 : 0.75 + 0.25 * rel);
      ctx.drawImage(p.kind === 'ca' ? SPR.ca : SPR.ion, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore(); // clip
    ctx.globalAlpha = o;
    rich('ROI 0 · paste · schematic', X0 + 18, Y0 + 36, { size: 22, mono: true, color: PAL.dim });
    rich('Ca(OH)_{2} solid', CX, CY - 78, { size: 30, weight: 600, color: '#fff', align: 'center', outline: 5 });
    const lbl = (k, txt, col) => { const q = lblPos[k]; if (!q) return; rich(txt, clamp(q[0], X0 + 60, X0 + IW - 60), clamp(q[1] + 46, Y0 + 96, Y0 + IH - 84), { size: 30, weight: 600, mono: true, color: col, align: 'center', outline: 5, alpha: seg(te, 4.3, 4.7) }); };
    lbl('ca', 'Ca^{2+}', PAL.lil); lbl('oh', 'OH^{−}', PAL.cy);
    // pH readout
    const cp = canalPH(te);
    rich('pH', CX - 70, Y0 + IH - 30, { size: 30, weight: 500, mono: true, color: '#9fe6ff' });
    rich(cp.toFixed(1), CX - 18, Y0 + IH - 28, { size: 46, weight: 600, mono: true, color: cp > 12 ? '#c9f6ff' : '#e6f6ff' });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawInset1(t) { // proposed mechanisms of kill: membrane, proteins, DNA (rod-shaped victim)
    const A = TL.ins1A, B = TL.ins1B;
    const o = seg(t, A, A + 0.45, ease.out) * (1 - seg(t, B - 0.35, B));
    if (o <= 0 || !roi1) return;
    const X0 = 120, Y0 = 730, IW = 640, IH = 440;
    const bb = bugBox(roi1, t);
    leader(bb[0], bb[1], bb[2], bb[3], X0, Y0, IW, IH, o * 0.9, 'rgba(235,242,250,0.85)');
    ctx.save();
    zoomIn(t, A, X0, Y0, IW, IH);
    insetFrame(X0, Y0, IW, IH, o);
    ctx.globalAlpha = o;
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, IW, IH); ctx.clip();
    const CX = X0 + 180, CY = Y0 + 262, RX = 86, RY = 128;
    const u1 = seg(t, A + 0.7, A + 1.6, ease.inOut);   // membrane breaks
    const upi = seg(t, A + 0.9, A + 2.4, ease.inOut);  // PI floods in
    const u2 = seg(t, A + 1.5, A + 2.3, ease.inOut);   // proteins unfold
    const u3 = seg(t, A + 2.1, A + 2.9, ease.inOut);   // DNA fragments
    const hz = ctx.createRadialGradient(CX, CY, RX * 0.6, CX, CY, 360);
    hz.addColorStop(0, 'rgba(60,200,255,0.0)'); hz.addColorStop(0.35, 'rgba(60,190,255,0.20)'); hz.addColorStop(1, 'rgba(20,80,200,0.05)');
    ctx.fillStyle = hz; ctx.fillRect(X0, Y0, IW, IH);
    ctx.globalCompositeOperation = 'lighter';
    // OH- stream toward the cell
    for (let k = 0; k < 30; k++) {
      const a = k / 30 * TAU + hash(k, 2) * 0.3;
      const q = ((t - A) * 0.42 + hash(k, 5)) % 1;
      const r = lerp(2.7, 1.06, ease.in(q));
      const x = CX + Math.cos(a) * RX * r, y = CY + Math.sin(a) * RY * r;
      ctx.globalAlpha = o * Math.sin(Math.PI * q) * 0.95;
      ctx.drawImage(SPR.ion, x - 10, y - 10, 20, 20);
    }
    const col = mix(LIVE, DEAD, upi);
    ctx.globalAlpha = o;
    ctx.fillStyle = rgbs(col, 0.16 + 0.16 * upi);
    ctx.beginPath(); ctx.ellipse(CX, CY, RX - 5, RY - 5, 0, 0, 7); ctx.fill();
    // PI molecules entering through gaps
    for (let k = 0; k < 34; k++) {
      const a = (k * 2.399) % TAU;
      const p = seg(t, A + 0.95 + (k % 12) * 0.07, A + 2.0 + (k % 12) * 0.07, ease.inOut);
      if (p <= 0) continue;
      const r = lerp(1.5, 0.15 + 0.7 * hash(k, 9), p);
      const x = CX + Math.cos(a) * RX * r, y = CY + Math.sin(a) * RY * r;
      ctx.globalAlpha = o * Math.min(1, p * 3) * 0.9;
      ctx.drawImage(SPR.pi, x - 9, y - 9, 18, 18);
    }
    // proteins (folded → unfolded)
    const PR = [[-34, -78, 0.3], [34, -66, 2.0], [-40, 64, 1.1], [36, 76, 4.0], [2, -18, 0.2]];
    ctx.globalAlpha = o * 0.95; ctx.strokeStyle = rgbs(mix([230, 255, 235], [255, 220, 220], upi), 0.9); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    PR.forEach(([px, py, rot], k) => {
      ctx.save(); ctx.translate(CX + px, CY + py); ctx.rotate(rot + u2 * 0.4);
      ctx.beginPath();
      const len = lerp(22, 46, u2), amp = lerp(9, 2.5, u2), per = lerp(1.0, 2.2, u2);
      for (let s = 0; s <= 24; s++) {
        const f = s / 24; const xx = (f - 0.5) * len;
        const yy = Math.sin(f * Math.PI * 2 * per + k) * amp + (1 - u2) * Math.cos(f * Math.PI * 3) * 6;
        s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.stroke(); ctx.restore();
    });
    // DNA (nucleoid coil → fragments)
    ctx.strokeStyle = rgbs(mix(mix(LIVE, [255, 255, 255], 0.45), mix(DEAD, [255, 255, 255], 0.35), upi), 0.95); ctx.lineWidth = 3.4;
    const NSEG = 9;
    for (let sgm = 0; sgm < NSEG; sgm++) {
      const a0 = sgm / NSEG * TAU, a1 = (sgm + 1) / NSEG * TAU;
      const shrink = u3 * 0.22 * (TAU / NSEG);
      const mid = (a0 + a1) / 2;
      const push = u3 * (10 + 16 * hash(sgm, 4));
      const ox = Math.cos(mid) * push, oy = Math.sin(mid) * push;
      ctx.beginPath();
      for (let s = 0; s <= 18; s++) {
        const a = lerp(a0 + shrink, a1 - shrink, s / 18);
        const r = 28 + 8 * Math.sin(a * 7) + 4 * Math.sin(a * 3 + 1);
        const x = CX - 2 + Math.cos(a) * r * 0.95 + ox, y = CY + 30 + Math.sin(a) * r * 1.3 + oy;
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    // membrane (breaking ring)
    const NM = 48;
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = rgbs(col, pass ? 1 : 0.22); ctx.lineWidth = pass ? 8 : 22;
      for (let k = 0; k < NM; k++) {
        const gap = u1 * (0.12 + 0.62 * hash(k, 3));
        const a0 = (k + gap / 2) / NM * TAU, a1 = (k + 1 - gap / 2) / NM * TAU;
        ctx.beginPath(); ctx.ellipse(CX, CY, RX, RY, 0, a0, a1); ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore(); // clip
    ctx.globalAlpha = o;
    pill(X0 + 18, Y0 + 58, 92, 44, 'rgba(0,0,0,0.75)');
    rich('OH^{−}', X0 + 30, Y0 + 91, { size: 30, weight: 500, mono: true, color: PAL.cy });
    rich('ROI 1 · proposed mechanisms · schematic', X0 + 18, Y0 + 36, { size: 22, mono: true, color: PAL.dim });
    const LX = X0 + 330;
    const labs = [
      { a: A + 0.8, y: Y0 + 142, t: 'membrane', s: 'integrity lost', tx: CX + RX * 0.62, ty: CY - RY * 0.78 },
      { a: A + 1.6, y: Y0 + 258, t: 'proteins', s: 'denatured', tx: CX + 46, ty: CY - 66 },
      { a: A + 2.3, y: Y0 + 374, t: 'DNA', s: 'damaged', tx: CX + 30, ty: CY + 40 },
    ];
    for (const lb of labs) {
      const la = seg(t, lb.a, lb.a + 0.35, ease.out) * o;
      if (la <= 0) continue;
      ctx.globalAlpha = la;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(LX - 12, lb.y - 10); ctx.lineTo(lb.tx, lb.ty); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lb.tx, lb.ty, 3.5, 0, 7); ctx.fill();
      rich('[r]×[/] ' + lb.t, LX, lb.y, { size: 30, weight: 500, mono: true, color: '#fff' });
      rich(lb.s, LX + 2, lb.y + 38, { size: 30, color: PAL.sub });
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawInset2(t) { // proton pump (schematic)
    const A = TL.ins2A, B = TL.ins2B;
    const o = seg(t, A, A + 0.45, ease.out) * (1 - seg(t, B - 0.35, B));
    if (o <= 0 || !roi2) return;
    const X0 = 64, Y0 = 776, IW = 600, IH = 340;
    const bb = bugBox(roi2, t);
    leader(bb[0], bb[1], bb[2], bb[3], X0, Y0, IW, IH, o * 0.9, 'rgba(150,255,180,0.85)');
    ctx.save();
    zoomIn(t, A, X0, Y0, IW, IH);
    insetFrame(X0, Y0, IW, IH, o);
    ctx.globalAlpha = o;
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, IW, IH); ctx.clip();
    const C1 = [X0 + 122, Y0 + 162], C2 = [X0 + 232, Y0 + 162], RX = 56, RY = 52;
    const hz = ctx.createRadialGradient(X0 + 177, Y0 + 162, 60, X0 + 177, Y0 + 162, 330);
    hz.addColorStop(0, 'rgba(20,70,200,0.0)'); hz.addColorStop(0.4, 'rgba(20,80,210,0.16)'); hz.addColorStop(1, 'rgba(10,40,140,0.05)');
    ctx.fillStyle = hz; ctx.fillRect(X0, Y0, IW, IH);
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 16; k++) { // a few OH- outside
      const x = X0 + 20 + hash(k, 21) * 560, y = Y0 + 50 + hash(k, 22) * 220;
      const xx = x + 10 * noise1(t * 0.7 + k, 23), yy = y + 10 * noise1(t * 0.7 + k, 24);
      const dc = Math.min(Math.hypot((xx - C1[0]) / RX, (yy - C1[1]) / RY), Math.hypot((xx - C2[0]) / RX, (yy - C2[1]) / RY));
      if (dc < 1.35 || xx > X0 + 300) continue;
      ctx.globalAlpha = o * 0.45; ctx.drawImage(SPR.ion, xx - 8, yy - 8, 16, 16);
    }
    const breathe = 0.9 + 0.1 * Math.sin(t * 2.0);
    for (const [ex, ey] of [C1, C2]) {
      ctx.globalAlpha = o;
      ctx.fillStyle = rgbs(LIVE, 0.2 * breathe); ctx.beginPath(); ctx.ellipse(ex, ey, RX - 4, RY - 4, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = rgbs(LIVE, 0.22); ctx.lineWidth = 22; ctx.beginPath(); ctx.ellipse(ex, ey, RX, RY, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = rgbs(mix(LIVE, [255, 255, 255], 0.15), breathe); ctx.lineWidth = 7; ctx.stroke();
    }
    // pumps on the membrane: inward chevrons; H+ streams outside → inside
    const PUMPS = [[C1, -2.1], [C1, 2.3], [C1, Math.PI], [C2, -0.85], [C2, 0.95], [C2, -Math.PI / 2 - 0.25]];
    let lab = null;
    PUMPS.forEach(([c0, a], k) => {
      const px = c0[0] + Math.cos(a) * RX, py = c0[1] + Math.sin(a) * RY;
      ctx.globalCompositeOperation = 'lighter';
      for (let m = 0; m < 3; m++) {
        const q = ((t - A) * 0.55 + m / 3 + hash(k, 31)) % 1;
        const r = lerp(1.9, 0.5, ease.inOut(q));
        const hx = c0[0] + Math.cos(a) * RX * r, hy = c0[1] + Math.sin(a) * RY * r;
        ctx.globalAlpha = o * Math.min(1, 0.8 + 0.2 * Math.sin(Math.PI * q)) * Math.min(1, Math.sin(Math.PI * q) * 3);
        ctx.drawImage(SPR.h, hx - 18, hy - 18, 36, 36);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(px, py); ctx.rotate(a + Math.PI); // +x points inward
      ctx.globalAlpha = o; ctx.strokeStyle = PAL.h; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const dx of [-10, 2]) { ctx.beginPath(); ctx.moveTo(dx, -11); ctx.lineTo(dx + 11, 0); ctx.lineTo(dx, 11); ctx.stroke(); }
      ctx.restore();
      if (k === 2) lab = [c0[0] - RX * 1.75, c0[1] - 26];
    });
    ctx.restore(); // clip
    ctx.globalAlpha = o;
    if (lab) rich('H^{+}', lab[0], lab[1], { size: 30, weight: 600, mono: true, color: PAL.h, align: 'center', outline: 5 });
    rich('ROI 2 · *E. faecalis* · schematic', X0 + 18, Y0 + 36, { size: 22, mono: true, color: PAL.dim });
    const LX = X0 + 340;
    rich('proton', LX, Y0 + 124, { size: 32, weight: 600, color: '#fff' });
    rich('pump', LX, Y0 + 160, { size: 32, weight: 600, color: '#fff' });
    rich('pumps H^{+} in', LX, Y0 + 200, { size: 30, color: PAL.h });
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
    const pa = -0.85, ppx = C2[0] + Math.cos(pa) * RX + 12, ppy = C2[1] + Math.sin(pa) * RY - 6;
    ctx.beginPath(); ctx.moveTo(LX - 10, Y0 + 114); ctx.lineTo(ppx, ppy); ctx.stroke();
    const foot = 'killed only at pH ≥ [am]11.5[/] (in vitro)';
    let fs = 32; while (fs > 30 && richWidth(foot, { size: fs, weight: 500 }) > IW - 36) fs--;
    rich(foot, X0 + IW / 2, Y0 + IH - 30, { size: fs, weight: 500, color: '#eef3f8', align: 'center' });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- UI chrome
  function drawChrome(t, te, kd, fin, rw) {
    let gr = ctx.createLinearGradient(0, 0, 0, 370);
    gr.addColorStop(0, 'rgba(0,0,0,0.96)'); gr.addColorStop(0.72, 'rgba(0,0,0,0.80)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, 370);
    gr = ctx.createLinearGradient(0, 1300, 0, H);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.2, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = gr; ctx.fillRect(0, 1300, W, H - 1300);
    // row A: handle · file name | objective
    rich('@natebrooksendo', 64, 266, { size: 24, weight: 500, mono: true, color: '#a9b4c0' });
    rich('· CaOH2_tubule_SIM.tif', 64 + richWidth('@natebrooksendo ', { size: 24, weight: 500, mono: true }), 266, { size: 24, mono: true, color: '#5f6a76' });
    rich('CLSM · 63×/1.40 oil', 1016, 266, { size: 24, mono: true, color: '#7f8a97', align: 'right' });
    // row B: channels | simulating chip + schematic clock
    const chip = (x, rgb, label, sub) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(rgb === LIVE ? SPR.dotG : SPR.dotR, x - 14, 296, 28, 28); ctx.restore();
      const w = rich(label, x + 20, 320, { size: 30, weight: 600, color: rgbs(mix(rgb, [255, 255, 255], 0.25)) });
      return x + 20 + w + 10 + rich(sub, x + 20 + w + 10, 320, { size: 22, mono: true, color: '#8d98a5' });
    };
    const x = chip(76, LIVE, 'live', 'SYTO 9');
    chip(x + 40, DEAD, 'dead', 'PI');
    const cs = clockStr(te);
    const cw = rich(cs, 1016, 322, { size: 32, weight: 500, mono: true, color: '#ffffff', align: 'right' });
    rich('schematic clock', 1016, 352, { size: 22, mono: true, color: '#9aa6b2', align: 'right', outline: 5 });
    const simA = Math.max(1 - seg(t, TL.finA, TL.finA + 0.4), seg(rw, 0.3, 0.9));
    if (simA > 0) {
      const pulse = 0.55 + 0.45 * Math.cos(TAU * 25 * t / DUR); // ~0.9 Hz, periodic over DUR
      const sx = 1016 - cw - 28;
      ctx.save(); ctx.globalAlpha = simA;
      const tw = rich('SIMULATING', sx, 320, { size: 22, weight: 500, mono: true, color: '#c4ccd6', align: 'right' });
      ctx.globalAlpha = simA * pulse; ctx.fillStyle = '#ff6a5a';
      ctx.beginPath(); ctx.arc(sx - tw - 16, 312, 7, 0, 7); ctx.fill();
      ctx.restore();
    }
    // paste label (hidden while ROI 0 covers it)
    const pl = 1 - seg(t, TL.ins0A - 0.1, TL.ins0A + 0.2) + seg(t, TL.ins0B - 0.05, TL.ins0B + 0.3);
    const plw = rich('ROOT CANAL · Ca(OH)_{2} paste', 64, 398, { size: 28, weight: 500, mono: true, color: '#d8f6ff', outline: 6, alpha: clamp(pl) });
    const ra = clamp(pl) * seg(te, TL.dissA, TL.dissA + 0.3);
    if (ra > 0) {
      const cp = canalPH(te);
      rich('pH', 64 + plw + 30, 400, { size: 28, weight: 500, mono: true, color: '#9fe6ff', outline: 6, alpha: ra });
      rich(cp.toFixed(1), 64 + plw + 30 + 46, 402, { size: 42, weight: 600, mono: true, color: cp > 12 ? '#bff3ff' : '#e6f6ff', outline: 7, alpha: ra });
    }
    // kill-line tags in the right gutter (between tubule 4 and the plot)
    const GX = 646;
    if (kd != null && kd >= 0) {
      const ky = yOf(kd);
      const a = seg(te, tKill0, tKill0 + 0.5);
      ctx.save(); ctx.globalAlpha = a;
      const w = richWidth('pH 11.5', { size: 30, weight: 600, mono: true });
      pill(GX, ky - 50, w + 24, 44, 'rgba(0,0,0,0.8)', 'rgba(255,201,74,0.6)');
      rich('pH 11.5', GX + 12, ky - 17, { size: 30, weight: 600, mono: true, color: PAL.am });
      const sa = a * seg(te, tKill0 + 0.4, tKill0 + 0.9);
      ctx.globalAlpha = sa;
      pill(GX, ky + 8, 196, 70, 'rgba(0,0,0,0.72)');
      rich('kills *E. faecalis*', GX + 10, ky + 38, { size: 26, color: '#ffe2a0' });
      rich('(in vitro)', GX + 10, ky + 68, { size: 24, color: '#a9b4c0' });
      ctx.restore();
      // C4: stalled + dentine buffers OH-
      const st = env(t, TL.bufA + 0.3, TL.ins2A + 0.1, 0.4, 0.3);
      if (st > 0) {
        ctx.save(); ctx.globalAlpha = st;
        const y0 = ky + 92;
        const stw = richWidth('stalled', { size: 26, weight: 500, mono: true });
        pill(GX, y0, stw + 60, 42, 'rgba(0,0,0,0.8)', 'rgba(255,255,255,0.3)');
        ctx.fillStyle = '#fff'; ctx.fillRect(GX + 16, y0 + 11, 6, 20); ctx.fillRect(GX + 27, y0 + 11, 6, 20);
        rich('stalled', GX + 44, y0 + 30, { size: 26, weight: 500, mono: true, color: '#fff' });
        pill(GX, y0 + 54, 178, 82, 'rgba(0,0,0,0.75)', rgbs(SAND, 0.45));
        rich('dentine', GX + 12, y0 + 88, { size: 30, weight: 500, color: PAL.sand });
        rich('buffers OH^{−}', GX + 12, y0 + 124, { size: 30, weight: 500, color: PAL.sand });
        // leader to a glowing sand rim (tubule 4, right wall)
        const ry = ky + 30, rx = cx(3, ry) + hw(ry) + 4;
        ctx.strokeStyle = rgbs(SAND, 0.8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(GX, y0 + 80); ctx.lineTo(rx + 2, ry); ctx.stroke();
        ctx.fillStyle = PAL.sand; ctx.beginPath(); ctx.arc(rx + 2, ry, 4, 0, 7); ctx.fill();
        ctx.restore();
      }
      // C5 + final: survivors label
      const sv = seg(t, TL.ins2A + 0.1, TL.ins2A + 0.6) * (1 - seg(rw, 0, 0.4));
      if (sv > 0) {
        ctx.save(); ctx.globalAlpha = sv;
        rich('survivors', GX + 4, ky + 132, { size: 30, weight: 600, color: PAL.g, outline: 6 });
        ctx.restore();
      }
    }
    // scale bar (lateral only) + disclaimer
    ctx.save(); ctx.globalAlpha = 0.95 * (1 - fin);
    ctx.fillStyle = '#fff'; ctx.fillRect(64, 1346, 5 * PXUM, 7);
    rich('5 µm', 64 + 5 * PXUM + 14, 1358, { size: 26, weight: 500, mono: true, color: '#fff' });
    rich('(lateral only)', 64 + 5 * PXUM + 92, 1358, { size: 22, mono: true, color: '#a9b4c0' });
    rich('simulated · depth & time compressed', 958, 1358, { size: 22, color: '#a9b4c0', align: 'right' });
    ctx.restore();
  }

  function drawCaptions(t) {
    const last = CAPS[CAPS.length - 1];
    const pa = env(t, CAPS[0].a, last.b, 0.35, 0.3);
    if (pa <= 0) return;
    const X = 48, Y = 1384, PW = 910, PH = 188;
    ctx.save(); ctx.globalAlpha = pa;
    ctx.fillStyle = 'rgba(3,6,10,0.86)'; ctx.fillRect(X, Y, PW, PH);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.strokeRect(X + 0.5, Y + 0.5, PW - 1, PH - 1);
    ctx.restore();
    for (const c of CAPS) {
      // sequential: the outgoing note is gone before the next fades in (no double text)
      const a = env(t, c.a + 0.08, c.b, 0.2, 0.15) * pa;
      if (a <= 0) continue;
      const rise = (1 - ease.out(seg(t, c.a + 0.08, c.a + 0.45))) * 12;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = rgbs(c.accent, 1); ctx.fillRect(X, Y, 6, PH);
      rich(`NOTE ${c.n}/5`, X + 34, Y + 36, { size: 22, mono: true, color: '#7f8a97' });
      rich(c.src, X + PW - 22, Y + 36, { size: 22, color: '#8a95a2', align: 'right' });
      if (c.eq && !c.text) rich(c.eq, X + 34, Y + 128 + rise, { size: 62, weight: 600, color: '#fff' });
      else c.text.split('\n').forEach((ln, k) => rich(ln, X + 34, Y + 98 + k * 56 + rise, { size: 44, weight: 500, color: '#f2f6fa' }));
      ctx.restore();
    }
  }

  function drawHook(t) {
    const a = 1 - seg(t, TL.hookB - 0.4, TL.hookB, ease.inOut);
    if (a <= 0) return;
    const X = 72, Y = 660, CW = 936, CH = 420;
    const s = 1 + 0.04 * (1 - ease.out(seg(t, 0, 0.6)));
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(W / 2, Y + CH / 2); ctx.scale(s, s); ctx.translate(-W / 2, -(Y + CH / 2));
    ctx.fillStyle = 'rgba(2,4,8,0.86)'; ctx.fillRect(X, Y, CW, CH);
    brackets(X, Y, CW, CH, 34, 'rgba(235,242,250,0.85)', 3);
    rich('SIMULATED TIME-LAPSE · LIVE/DEAD STAIN', X + 48, Y + 64, { size: 24, weight: 500, mono: true, color: '#8fdcff' });
    rich('Who survives', X + 48, Y + 170, { size: 96, weight: 600, color: '#fff' });
    rich('[cy]Ca(OH)_{2}[/]?', X + 48, Y + 272, { size: 96, weight: 600, color: '#fff' });
    const sub = 'pH 12.5 paste vs bacteria in dentinal tubules';
    let fs = 38; while (fs > 32 && richWidth(sub, { size: fs }) > CW - 96) fs--;
    rich(sub, X + 48, Y + 352, { size: fs, color: '#cfd8e2' });
    ctx.restore();
  }

  function drawFinal(t) {
    const a = seg(t, TL.finA, TL.finA + 0.45, ease.inOut);
    if (a <= 0) return;
    const X = 48, Y = 1080, CW = 910, CH = 492;
    ctx.save(); ctx.globalAlpha = a;
    const s = 1 + 0.03 * (1 - ease.out(seg(t, TL.finA, TL.finA + 0.7)));
    ctx.translate(W / 2, Y + CH / 2); ctx.scale(s, s); ctx.translate(-W / 2, -(Y + CH / 2));
    ctx.fillStyle = 'rgba(2,4,8,0.965)'; ctx.fillRect(X, Y, CW, CH);
    brackets(X, Y, CW, CH, 34, 'rgba(235,242,250,0.85)', 3);
    rich('Ca(OH)_{2} IN TUBULES · TAKEAWAY', X + 48, Y + 66, { size: 30, weight: 500, mono: true, color: '#8fdcff' });
    const sw = richWidth('SIMULATED', { size: 22, weight: 500, mono: true });
    pill(X + CW - 48 - sw - 24, Y + 38, sw + 24, 38, 'rgba(0,0,0,0)', 'rgba(255,201,74,0.7)', 6);
    rich('SIMULATED', X + CW - 48 - 12, Y + 64, { size: 22, weight: 500, mono: true, color: PAL.am, align: 'right' });
    rich('[cy]pH[/] is the weapon.', X + 48, Y + 166, { size: 82, weight: 600, color: '#fff' });
    rich('[sand]Dentine[/] is the shield.', X + 48, Y + 262, { size: 82, weight: 600, color: '#fff' });
    const sa = seg(t, TL.finA + 0.1, TL.finA + 0.5, ease.out);
    ctx.globalAlpha = a * sa;
    rich('Past the canal wall, *E. faecalis*', X + 48, Y + 334, { size: 40, color: '#d3dbe4' });
    rich('can survive (in vitro).', X + 48, Y + 384, { size: 40, color: '#d3dbe4' });
    rich('Nerwich 1993 · Haapasalo & Ørstavik 1987 · Haapasalo 2000', X + 48, Y + 430, { size: 22, color: '#8a95a2' });
    rich('Evans 2002 · McHugh 2004 · Siqueira & Lopes 1999 · in vitro data', X + 48, Y + 458, { size: 22, color: '#8a95a2' });
    ctx.restore();
  }

  // ---------------------------------------------------------------- frame
  function render(t) {
    t = clamp(t, 0, DUR);
    const te = modelT(t), rw = rewU(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const fin = seg(t, TL.finA, TL.finA + 0.5, ease.inOut);
    const { kd } = drawSpecimen(t, te, fin, rw);
    // microscope focus pull (opening) / defocus (loop rewind)
    const blur = Math.max(lerp(10, 0, seg(t, 0, 1.4, ease.out)), 10 * seg(rw, 0.45, 1, ease.inOut));
    if (blur > 0.2) {
      BLG.globalCompositeOperation = 'copy'; BLG.drawImage(canvas, 0, 0);
      ctx.save(); ctx.filter = `blur(${blur.toFixed(2)}px)`; ctx.drawImage(BLR, 0, 0); ctx.restore();
    }
    ctx.drawImage(VIG, 0, 0);
    drawInset0(t, te);
    drawInset1(t);
    drawInset2(t);
    // grain (sensor noise)
    ctx.save();
    const gf = Math.floor(t * 10), gi = gf % GRAIN.length, ox = Math.floor(hash(gf, 3) * 256) * 2, oy = Math.floor(hash(gf, 4) * 256) * 2;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.05;
    ctx.translate(ox, oy); ctx.scale(2, 2); ctx.fillStyle = GRAIN[gi]; ctx.fillRect(-ox / 2, -oy / 2, W / 2, H / 2);
    ctx.restore();
    // final dim below the evidence (keeps the orifice + survivors readable)
    const dimA = fin * (1 - rw);
    if (dimA > 0) {
      const g = ctx.createLinearGradient(0, 900, 0, 1250);
      g.addColorStop(0, `rgba(0,0,0,${0.12 * dimA})`); g.addColorStop(1, `rgba(0,0,0,${0.7 * dimA})`);
      ctx.fillStyle = g; ctx.fillRect(0, 330, W, H - 330);
    }
    drawPlot(t, te, kd, seg(te, TL.hookB - 0.3, TL.hookB + 0.2) * (1 - 0.35 * fin * (1 - rw)), fin);
    drawChrome(t, te, kd, fin, rw);
    drawCaptions(t);
    drawHook(t);
    drawFinal(t);
  }

  window.REEL = {
    title: 'Ca(OH)₂ vs bacteria — who survives in the tubules?',
    duration: DUR,
    poster: 26.9,
    canvas,
    fonts: ['400 44px "IBM Plex Sans"', '500 44px "IBM Plex Sans"', '600 82px "IBM Plex Sans"', 'italic 400 38px "IBM Plex Sans"', 'italic 500 44px "IBM Plex Sans"', '400 24px "IBM Plex Mono"', '500 30px "IBM Plex Mono"', '600 30px "IBM Plex Mono"'],
    async setup() {
      BG = buildBG(); PASTE = buildPaste(); VIG = buildVignette(); MASK = buildMask(); RIMS = buildRims();
      [TMP, TG] = mk(W, H); [BLR, BLG] = mk(W, H); buildGrain();
      SPR.cocG = sprite(80, 80, 14.5, 16, LIVE); SPR.cocR = sprite(80, 80, 14.5, 16, DEAD);
      SPR.rodG = sprite(72, 124, 11, 33, LIVE); SPR.rodR = sprite(72, 124, 11, 33, DEAD);
      SPR.cocGb = sprite(80, 80, 14.5, 16, LIVE, 1.5); SPR.cocRb = sprite(80, 80, 14.5, 16, DEAD, 1.5);
      SPR.rodGb = sprite(72, 124, 11, 33, LIVE, 1.5); SPR.rodRb = sprite(72, 124, 11, 33, DEAD, 1.5);
      SPR.ion = dotSprite(CYAN, 22); SPR.pale = dotSprite([200, 215, 230], 22, 0.5); SPR.ca = dotSprite(LILAC, 22, 0.7);
      SPR.pi = dotSprite(DEAD, 18, 0.6); SPR.h = dotSprite([255, 214, 140], 24, 0.95); SPR.flash = dotSprite(SAND, 44, 0.85);
      SPR.dotG = dotSprite(LIVE, 28, 0.9); SPR.dotR = dotSprite(DEAD, 28, 0.9);
      genBugs(); genIons(); genLattice();
      for (let t = 0; t < DUR; t += 1 / 60) if (killDepth(t) != null) { tKill0 = t; break; }
      // dev check: caption reading time (equation tokens included)
      const strip = (s) => (s || '').replace(/\[.*?\]|\*|_\{|\^\{|\}/g, '').trim();
      for (const c of CAPS) { const words = [strip(c.eq), strip(c.text)].filter(Boolean).join(' '); const need = Kit.readSecs(words); const have = (c.b - c.a) - 0.43; if (have < need - 1e-6) console.warn(`caption ${c.n}: visible ${have.toFixed(2)}s < read ${need.toFixed(2)}s`); }
      const finWords = 'pH is the weapon. Dentine is the shield. Past the canal wall, E. faecalis can survive (in vitro).';
      const finHave = DUR - (TL.finA + 0.5);
      if (finHave < Kit.readSecs(finWords)) console.warn(`final card: visible ${finHave.toFixed(2)}s < read ${Kit.readSecs(finWords).toFixed(2)}s`);
      console.log('bugs', bugs.length, 'survivors', bugs.filter((b) => !isFinite(b.tDeath)).length, 'tKill0', tKill0.toFixed(2), 'kd@10', killDepth(10).toFixed(3), 'roi2 d', roi2 && roi2.d.toFixed(2));
    },
    render,
  };
  Kit.boot(REEL);
})();
