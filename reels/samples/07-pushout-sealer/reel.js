/*
 * 07 · Push-out bond strength — LAB INSTRUMENT HUD
 * Silent 22 s reel. One full-frame 2D canvas; render(t) is a pure function of t.
 * Story: slice a filled root -> mount on jig -> plunger loads filling (live F–d curve) -> debond
 *        -> failure-mode inset -> sigma = F / A with live numbers -> honest takeaway.
 */
(function () {
  const { canvas, ctx } = Kit.createCanvas();
  const { clamp, lerp, seg, ease, W, H } = Kit;

  // ------------------------------------------------------------------ palette / type
  const C = {
    panel: '#14171a', panel2: '#1a1e22', line: '#2a3036', line2: '#3a424a',
    txt: '#eaeef1', txt2: '#a9b3bb', dim: '#6f7982', faint: '#454d55',
    amber: '#ffb547', amberD: '#a8731f', teal: '#46e0c7', tealD: '#1f7c6f', red: '#ff6a55',
    dentin: '#e7d9bc', sealer: '#d9ab48', sealerD: '#9c7322', gp: '#e07556', gpD: '#a94a33',
  };
  const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace';
  const F = (w, s) => `${w} ${s}px ${MONO}`;
  const rgb = (a) => `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`;
  const mixc = (a, b, u) => rgb(Kit.mix(a, b, u));

  // ------------------------------------------------------------------ timeline
  const P = { slice: [1.8, 4.78], mount: [4.78, 6.8], load: [6.8, 11.08], inspect: [11.08, 13.68], calc: [13.68, 17.0], result: [17.0, 22.0] };
  const DUR = 22;
  const RATE = 0.5;                 // mm/min (crosshead speed shown)
  const SPEED = 10;                 // time-lapse factor of the simulated test
  const VSIM = (RATE / 60) * SPEED; // mm of crosshead travel per reel-second
  const TC = P.load[0];             // plunger contact / test start (6.8 s)
  const DPK = 0.18, FPK = 8.03, DEND = 0.26; // illustrative peak displacement (mm), peak force (N)
  const TPK = TC + DPK / VSIM;      // 8.96 s
  const TEND = TC + DEND / VSIM;    // 9.92 s (crosshead stops)
  const SLIP = 4;                   // post-debond plug slip drawn x4 (labelled "slip exaggerated")
  const SEC_OUT = 11.05;            // section view exits
  const FLIP = [4.78, 5.5];         // slice tumbles forward: coronal face down, apical face up
  const OUT0 = 21.8;                // loop outro: card + panels ease back to the t = 0 look
  const GEO = { R: 0.45, r: 0.42, h: 1.0 }; // mm (radii), illustrative mid-root slice
  const AREA = Math.PI * (GEO.R + GEO.r) * Math.sqrt((GEO.R - GEO.r) ** 2 + GEO.h ** 2);
  const SIGMA = FPK / AREA;

  const CAPTIONS = [
    { a: 1.78, b: 4.42, s: '1 mm slice of filled root' },
    { a: 4.66, b: 7.6, s: 'Push apical → coronal (toward wider end)' },
    { a: 7.84, b: 10.88, s: 'Force climbs… then drops at debond' },
    { a: 11.24, b: 13.5, s: 'Where did it break?' },
    { a: 13.86, b: 16.86, s: 'Peak force ÷ canal-wall area' },
  ];
  const TABS = ['01 SLICE', '02 MOUNT', '03 LOAD', '04 FAIL', '05 CALC'];
  const TAB_T = [P.slice, P.mount, P.load, P.inspect, P.calc];

  // ------------------------------------------------------------------ layout
  const VP = { x: 64, y: 506, w: 952, h: 590 };       // viewport panel (to y 1096)
  const DA = { x: 64, y: 546, w: 952, h: 488 };       // drawing area inside viewport (to y 1034)
  const RO = { x: 64, y: 1110, w: 886, h: 112 };      // readouts
  const PL = { x: 64, y: 1236, w: 886, h: 340 };      // plot panel (to y 1576)
  const PA = { x0: 150, x1: 916, y0: 1300, y1: 1506, dmax: 0.28, fmax: 10 }; // plot axes

  // ------------------------------------------------------------------ physics (toy model)
  const dispAt = (t) => clamp((t - TC) * VSIM, 0, DEND);
  function forceAt(d) {
    if (d <= 0) return 0;
    if (d <= DPK) {
      const u = d / DPK;
      const base = (1 - Math.exp(-2.0 * u)) / (1 - Math.exp(-2.0));
      const toe = 0.25 + 0.75 * ease.smooth(clamp(u / 0.16));
      let f = FPK * base * toe;
      const k = (u - 0.84) / 0.02; f -= 0.24 * Math.exp(-k * k);      // micro-crack hiccup
      f += 0.14 * u * (1 - u) * Kit.noise1(d * 900, 3);               // sensor noise (0 at peak)
      return Math.max(0, f);
    }
    const dd = d - DPK, drop = 0.0045, fr = 1.85;
    if (dd < drop) return lerp(FPK, fr, ease.out(dd / drop));
    const v = (dd - drop) / (DEND - DPK - drop);
    return Math.max(0, fr * (1 - 0.42 * v) + 0.14 * Kit.noise1(d * 380, 7) + 0.06 * Kit.noise1(d * 1400, 9));
  }
  function forceShown(t) {
    if (t < TC) return 0;
    const f = forceAt(dispAt(t));
    return f * (1 - seg(t, TEND + 0.03, TEND + 0.22, ease.inOut));
  }

  // ------------------------------------------------------------------ drawing helpers
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function T(s, x, y, o = {}) {
    ctx.save();
    ctx.font = o.font || F(400, 30);
    ctx.fillStyle = o.color || C.txt;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'alphabetic';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.ls) ctx.letterSpacing = o.ls + 'px';
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function tw(s, font, ls = 0) { ctx.save(); ctx.font = font; if (ls) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
  function ln(x1, y1, x2, y2, color, w = 1.5, alpha = 1, dash) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
  function head(x, y, ang, s, color, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.55); ctx.lineTo(-s * 0.78, 0); ctx.lineTo(-s, s * 0.55); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function arrow(x1, y1, x2, y2, color, w = 3, s = 16, alpha = 1) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ln(x1, y1, x2 - Math.cos(a) * s * 0.7, y2 - Math.sin(a) * s * 0.7, color, w, alpha);
    head(x2, y2, a, s, color, alpha);
  }
  function brackets(x, y, w, h, len, color, lw = 2, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
    ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
    ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
    ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
    ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
    ctx.stroke(); ctx.restore();
  }
  function panel(x, y, w, h, alpha = 1, fill = C.panel, bcol = C.line2) {
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    brackets(x - 3, y - 3, w + 6, h + 6, 14, bcol, bcol === C.line2 ? 2 : 3, alpha);
  }
  // debond cue: corner brackets of the plot + FORCE readout flash red once, fading over 0.3 s
  const debondBracket = (t) => { const u = t >= TPK ? seg(t, TPK, TPK + 0.3) : 1; return u >= 1 ? C.line2 : mixc(C.red, C.line2, ease.inOut(u)); };
  function tri(x, y, s, color, alpha = 1) { // right-pointing prompt triangle
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 1.2, y); ctx.lineTo(x, y + s); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function dot(x, y, r, color, alpha = 1) { ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  // text with drawn "→" glyphs (the vendored mono subset has no U+2192)
  function richW(s, font) { const parts = s.split('→'); const em = parseFloat(font.split(' ')[1]); return parts.reduce((a, p) => a + tw(p, font), 0) + (parts.length - 1) * em * 1.2; }
  function rich(s, x, y, font, color, alpha = 1) {
    const parts = s.split('→'); const em = parseFloat(font.split(' ')[1]); let cx = x;
    parts.forEach((p, i) => {
      T(p, cx, y, { font, color, alpha }); cx += tw(p, font);
      if (i < parts.length - 1) { const ay = y - em * 0.33; arrow(cx + em * 0.12, ay, cx + em * 1.02, ay, color, Math.max(2, em * 0.08), em * 0.42, alpha); cx += em * 1.2; }
    });
  }
  function leader(pts, color, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
    dot(pts[pts.length - 1][0], pts[pts.length - 1][1], 5, color, alpha);
  }

  // ------------------------------------------------------------------ textures (built once in setup)
  let BG, ROOTT, DISKT, SECT, PLUGT, IFACET;

  function buildBG() {
    const c = mk(W, H), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#131518'); gr.addColorStop(0.5, '#0f1113'); gr.addColorStop(1, '#0a0b0d');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.045)';
    for (let y = 12; y < H; y += 24) for (let x = 12; x < W; x += 24) g.fillRect(x, y, 1.5, 1.5);
    const r = Kit.rng(11);
    for (let i = 0; i < 16000; i++) { g.fillStyle = `rgba(255,255,255,${0.01 + r() * 0.02})`; g.fillRect(r() * W, r() * H, 1, 1); }
    const vg = g.createRadialGradient(W / 2, H * 0.45, 320, W / 2, H * 0.45, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    return c;
  }

  // --- root (side view, macro look). Texture space: 300 x 480, coronal cut at y 40, apex at y 460
  const ROOT = { w: 300, h: 480, top: 40, len: 420, sx: 150, sy: 552, vs: 0.5, th: 32 };
  const rootCx = (v) => 150 + 14 * v * v;
  const rootHw = (v) => { let hw = 70 - 38 * Math.pow(v, 1.7); if (v > 0.84) { const k = (v - 0.84) / 0.16; hw *= Math.sqrt(Math.max(0, 1 - k * k)); } return hw; };
  const rootY = (v) => ROOT.top + ROOT.len * v;

  function cutFace(g, cx, cy, hw, sq, alpha = 1) {
    g.save(); g.globalAlpha *= alpha;
    g.beginPath(); g.ellipse(cx, cy, hw, hw * sq, 0, 0, Math.PI * 2);
    const rg = g.createRadialGradient(cx - hw * 0.25, cy - hw * sq * 0.4, 0, cx, cy, hw * 1.05);
    rg.addColorStop(0, '#f5ecd8'); rg.addColorStop(0.75, '#dfcca7'); rg.addColorStop(1, '#ad9469');
    g.fillStyle = rg; g.fill(); g.strokeStyle = 'rgba(60,45,25,0.55)'; g.lineWidth = 1; g.stroke();
    const cr = hw * 0.22, ox = hw * 0.03;
    g.beginPath(); g.ellipse(cx + ox, cy, cr, cr * sq, 0, 0, Math.PI * 2); g.fillStyle = C.sealer; g.fill();
    g.beginPath(); g.ellipse(cx + ox, cy, cr * 0.7, cr * 0.7 * sq, 0, 0, Math.PI * 2); g.fillStyle = C.gp; g.fill();
    g.restore();
  }

  function buildRoot() {
    const c = mk(ROOT.w, ROOT.h), g = c.getContext('2d');
    const path = new Path2D(), N = 160;
    for (let i = 0; i <= N; i++) { const v = i / N, x = rootCx(v) - rootHw(v), y = rootY(v); i ? path.lineTo(x, y) : path.moveTo(x, y); }
    for (let i = N; i >= 0; i--) { const v = i / N; path.lineTo(rootCx(v) + rootHw(v), rootY(v)); }
    path.closePath();
    g.save(); g.clip(path);
    for (let y = ROOT.top; y <= ROOT.top + ROOT.len; y++) {
      const v = (y - ROOT.top) / ROOT.len, cx = rootCx(v), hw = Math.max(1, rootHw(v));
      const lg = g.createLinearGradient(cx - hw, 0, cx + hw, 0), u = Math.pow(v, 1.4);
      lg.addColorStop(0, mixc('#7c6343', '#6a4e2c', u));
      lg.addColorStop(0.18, mixc('#bea880', '#a98c5c', u));
      lg.addColorStop(0.38, mixc('#f2e8cf', '#dcc596', u));
      lg.addColorStop(0.6, mixc('#d7c39c', '#c0a26e', u));
      lg.addColorStop(1, mixc('#6b5536', '#593f22', u));
      g.fillStyle = lg; g.fillRect(cx - hw - 1, y, 2 * hw + 2, 1.6);
    }
    const r = Kit.rng(21);
    for (let i = 0; i < 170; i++) {
      const u = r() * 2 - 1, v0 = r() * 0.9, v1 = Math.min(1, v0 + 0.08 + r() * 0.5);
      g.beginPath();
      for (let k = 0; k <= 24; k++) { const v = lerp(v0, v1, k / 24), x = rootCx(v) + u * rootHw(v) * 0.96, y = rootY(v); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = r() < 0.55 ? `rgba(90,68,38,${0.05 + r() * 0.08})` : `rgba(255,250,235,${0.04 + r() * 0.07})`;
      g.lineWidth = 0.6 + r() * 1.3; g.stroke();
    }
    for (let i = 0; i < 2800; i++) { const v = r(), u = r() * 2 - 1, x = rootCx(v) + u * rootHw(v), y = rootY(v); g.fillStyle = r() < 0.6 ? `rgba(80,60,35,${0.06 + r() * 0.1})` : `rgba(255,255,240,${0.05 + r() * 0.08})`; g.fillRect(x, y, 1.3, 1.3); }
    const ag = g.createRadialGradient(rootCx(1), rootY(1), 0, rootCx(1), rootY(1), 170); ag.addColorStop(0, 'rgba(100,62,24,0.5)'); ag.addColorStop(1, 'rgba(100,62,24,0)');
    g.fillStyle = ag; g.fillRect(0, 0, ROOT.w, ROOT.h);
    g.restore();
    g.strokeStyle = 'rgba(35,26,15,0.55)'; g.lineWidth = 1.2; g.stroke(path);
    cutFace(g, rootCx(0), rootY(0), rootHw(0), 0.22);
    return c;
  }

  // --- disk (slice) top face texture, 520 x 520, centre (260,260)
  const CANAL = { x: 6, y: -6, r: 50, s: 10 };
  const diskOutline = (th) => {
    const rx = 236 * (1 + 0.025 * Math.cos(3 * th) + 0.012 * Math.sin(5 * th)), ry = 196 * (1 - 0.05 * Math.cos(2 * th));
    return [Math.cos(th) * rx, Math.sin(th) * ry];
  };
  function buildDisk() {
    const c = mk(520, 520), g = c.getContext('2d'), cx = 260, cy = 260, ccx = cx + CANAL.x, ccy = cy + CANAL.y;
    const path = new Path2D();
    for (let i = 0; i <= 200; i++) { const th = (i / 200) * Math.PI * 2, [x, y] = diskOutline(th); i ? path.lineTo(cx + x, cy + y) : path.moveTo(cx + x, cy + y); }
    path.closePath();
    g.save(); g.clip(path);
    const rg = g.createRadialGradient(ccx, ccy, 30, cx, cy, 250);
    rg.addColorStop(0, '#f1e5cb'); rg.addColorStop(0.55, '#e7d7b5'); rg.addColorStop(0.88, '#d7c298'); rg.addColorStop(1, '#ae9568');
    g.fillStyle = rg; g.fillRect(0, 0, 520, 520);
    // mottling
    const im = g.getImageData(0, 0, 520, 520), d = im.data;
    for (let y = 0; y < 520; y++) for (let x = 0; x < 520; x++) {
      const n = Kit.noise2(x / 22, y / 22, 5) * 7 + Kit.noise2(x / 5, y / 5, 6) * 4, i = (y * 520 + x) * 4;
      d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.8;
    }
    g.putImageData(im, 0, 0);
    const r = Kit.rng(33);
    // incremental lines (concentric, faint)
    for (let k = 0; k < 9; k++) { g.beginPath(); g.ellipse(ccx, ccy, 80 + k * 18 + r() * 6, 70 + k * 15 + r() * 6, 0.1, 0, Math.PI * 2); g.strokeStyle = `rgba(120,95,60,${0.04 + r() * 0.03})`; g.lineWidth = 1; g.stroke(); }
    // dentinal tubules: radial, gently S-curved
    for (let i = 0; i < 1100; i++) {
      const a = r() * Math.PI * 2, r0 = CANAL.r + 4 + r() * 12, len = 40 + r() * 210, bend = (r() - 0.5) * 0.25;
      g.beginPath();
      for (let k = 0; k <= 8; k++) { const q = k / 8, rr = r0 + len * q, aa = a + bend * Math.sin(q * Math.PI); const x = ccx + Math.cos(aa) * rr, y = ccy + Math.sin(aa) * rr * 0.86; k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = `rgba(125,96,58,${0.035 + r() * 0.06})`; g.lineWidth = 0.7; g.stroke();
    }
    // saw marks (parallel faint arcs)
    for (let k = 0; k < 46; k++) { g.beginPath(); g.arc(cx - 260, cy + 1500, 1500 - 120 + k * 11 + r() * 4, -Math.PI / 2 - 0.35, -Math.PI / 2 + 0.35); g.strokeStyle = r() < 0.5 ? `rgba(255,255,245,${0.04 + r() * 0.04})` : `rgba(110,85,50,${0.03 + r() * 0.03})`; g.lineWidth = 1 + r(); g.stroke(); }
    g.restore();
    // cementum rim
    g.save(); g.clip(path); g.strokeStyle = 'rgba(150,118,72,0.75)'; g.lineWidth = 16; g.stroke(path); g.strokeStyle = 'rgba(120,92,55,0.5)'; g.lineWidth = 6; g.stroke(path); g.restore();
    // predentin halo around canal
    const ph = g.createRadialGradient(ccx, ccy, CANAL.r, ccx, ccy, CANAL.r + 16); ph.addColorStop(0, 'rgba(170,135,85,0.45)'); ph.addColorStop(1, 'rgba(170,135,85,0)');
    g.fillStyle = ph; g.beginPath(); g.arc(ccx, ccy, CANAL.r + 16, 0, Math.PI * 2); g.fill();
    // sealer ring
    g.beginPath(); g.arc(ccx, ccy, CANAL.r, 0, Math.PI * 2);
    const sg = g.createRadialGradient(ccx - 10, ccy - 10, 10, ccx, ccy, CANAL.r); sg.addColorStop(0, '#f0cf7a'); sg.addColorStop(1, '#c9972f'); g.fillStyle = sg; g.fill();
    for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, rr = CANAL.r - 1 - r() * (CANAL.s - 1); g.fillStyle = r() < 0.7 ? 'rgba(255,245,210,0.55)' : 'rgba(90,60,15,0.5)'; g.fillRect(ccx + Math.cos(a) * rr, ccy + Math.sin(a) * rr, 1.6, 1.6); }
    // GP core
    const gr = CANAL.r - CANAL.s;
    g.beginPath(); g.arc(ccx, ccy, gr, 0, Math.PI * 2);
    const gg = g.createRadialGradient(ccx - 12, ccy - 14, 4, ccx, ccy, gr); gg.addColorStop(0, '#f7a283'); gg.addColorStop(0.6, '#de7254'); gg.addColorStop(1, '#b4503a'); g.fillStyle = gg; g.fill();
    g.save(); g.clip(); for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(cx - 260, cy + 1500, 1500 - 60 + k * 9, -Math.PI / 2 - 0.2, -Math.PI / 2 + 0.2); g.strokeStyle = 'rgba(255,220,200,0.12)'; g.lineWidth = 1.2; g.stroke(); } g.restore();
    // wet specular sheen
    g.save(); g.clip(path); g.globalCompositeOperation = 'screen';
    const hl = g.createRadialGradient(cx - 90, cy - 110, 0, cx - 90, cy - 110, 230); hl.addColorStop(0, 'rgba(255,255,255,0.24)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fillRect(0, 0, 520, 520); g.restore();
    g.strokeStyle = 'rgba(50,38,22,0.6)'; g.lineWidth = 1.5; g.stroke(path);
    return c;
  }

  // --- section view geometry
  const SEC = { cx: 540, y0: 820, y1: 930, ow: 265, rT: 52, rB: 70, s: 10, rp: 42, jx0: 236, jx1: 844, hole: 104, K: 110 };
  const PATCHES = [[-1, 0.0, 0.4], [-1, 0.62, 0.86], [1, 0.1, 0.32], [1, 0.55, 0.92]]; // [side, v0, v1] sealer left on wall
  function buildSection() { // dentin cut-face texture, 530 x 110
    const w = 2 * SEC.ow, h = SEC.y1 - SEC.y0, c = mk(w, h), g = c.getContext('2d');
    const lg = g.createLinearGradient(0, 0, w, 0);
    lg.addColorStop(0, '#9e875f'); lg.addColorStop(0.03, '#cdb98f'); lg.addColorStop(0.2, '#e6d8b9'); lg.addColorStop(0.5, '#eee3c9'); lg.addColorStop(0.8, '#e3d3b2'); lg.addColorStop(0.97, '#c8b288'); lg.addColorStop(1, '#957e57');
    g.fillStyle = lg; g.fillRect(0, 0, w, h);
    const im = g.getImageData(0, 0, w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = Kit.noise2(x / 14, y / 14, 15) * 6 + Kit.noise2(x / 4, y / 4, 16) * 4, i = (y * w + x) * 4; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.8; }
    g.putImageData(im, 0, 0);
    // fine mottling at the macro-slice (buildDisk) scale so both views read as the same material
    const im2 = g.getImageData(0, 0, w, h), d2 = im2.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = Kit.noise2(x / 22, y / 22, 25) * 7 + Kit.noise2(x / 5, y / 5, 26) * 4, i = (y * w + x) * 4; d2[i] += n; d2[i + 1] += n; d2[i + 2] += n * 0.8; }
    g.putImageData(im2, 0, 0);
    const r = Kit.rng(44);
    for (let i = 0; i < 260; i++) { // tubules run from canal outward: short, faint (not wood grain)
      const y = r() * h, x0 = r() * w, len = 12 + r() * 48;
      g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + len * 0.3, y + (r() - 0.5) * 3, x0 + len * 0.7, y + (r() - 0.5) * 3, x0 + len, y + (r() - 0.5) * 2);
      g.strokeStyle = `rgba(120,92,55,${0.03 + r() * 0.04})`; g.lineWidth = 0.8; g.stroke();
    }
    return c;
  }
  function buildPlug() { // sealer + GP trapezoid, drawn at (cx-80, y0)
    const w = 160, h = SEC.y1 - SEC.y0, c = mk(w, h), g = c.getContext('2d'), m = 80;
    const L = (y) => m - lerp(SEC.rT, SEC.rB, y / h);
    g.beginPath(); g.moveTo(L(0), 0); g.lineTo(w - L(0), 0); g.lineTo(w - L(h), h); g.lineTo(L(h), h); g.closePath();
    const sg = g.createLinearGradient(0, 0, w, 0); sg.addColorStop(0, '#c99a37'); sg.addColorStop(0.5, '#e7c066'); sg.addColorStop(1, '#c99a37'); g.fillStyle = sg; g.fill();
    g.beginPath(); g.moveTo(L(0) + SEC.s, 0); g.lineTo(w - L(0) - SEC.s, 0); g.lineTo(w - L(h) - SEC.s, h); g.lineTo(L(h) + SEC.s, h); g.closePath();
    const gg = g.createLinearGradient(0, 0, w, 0); gg.addColorStop(0, '#b9533b'); gg.addColorStop(0.35, '#ee8b6a'); gg.addColorStop(0.65, '#dd7051'); gg.addColorStop(1, '#a9472f'); g.fillStyle = gg; g.fill();
    const r = Kit.rng(55);
    g.save(); g.clip(); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,220,200,${0.08 + r() * 0.1})`; g.fillRect(r() * w, r() * h, 2 + r() * 8, 1); } g.restore();
    for (let i = 0; i < 60; i++) { const y = r() * h, side = r() < 0.5; const x = side ? L(y) + r() * SEC.s : w - L(y) - r() * SEC.s; g.fillStyle = r() < 0.6 ? 'rgba(255,240,200,0.6)' : 'rgba(90,60,15,0.55)'; g.fillRect(x, y, 1.6, 1.6); }
    return c;
  }
  // --- magnified interface for the failure-mode tiles: dentin | sealer | GP, 256 x 270
  const IF = { w: 256, h: 270, a: 106, b: 150 };
  function buildIface() {
    const c = mk(IF.w, IF.h), g = c.getContext('2d'), r = Kit.rng(66);
    const dg = g.createLinearGradient(0, 0, IF.a, 0); dg.addColorStop(0, '#e9dcbf'); dg.addColorStop(1, '#dccaa5'); g.fillStyle = dg; g.fillRect(0, 0, IF.a, IF.h);
    for (let i = 0; i < 26; i++) { // tubules (perpendicular to wall), some with sealer tags
      const y = 6 + i * 10.2 + (r() - 0.5) * 4;
      g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(30, y + 2, 70, y - 2, IF.a, y); g.strokeStyle = 'rgba(120,90,52,0.45)'; g.lineWidth = 2; g.stroke();
      if (r() < 0.6) { const L = 12 + r() * 38; g.beginPath(); g.moveTo(IF.a, y); g.lineTo(IF.a - L, y + (r() - 0.5) * 2); g.strokeStyle = '#d6a43e'; g.lineWidth = 2.6; g.stroke(); }
    }
    const sg = g.createLinearGradient(IF.a, 0, IF.b, 0); sg.addColorStop(0, '#c99a37'); sg.addColorStop(0.5, '#ebc56a'); sg.addColorStop(1, '#cf9f3c'); g.fillStyle = sg; g.fillRect(IF.a, 0, IF.b - IF.a, IF.h);
    for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.65 ? 'rgba(255,245,215,0.7)' : 'rgba(95,62,15,0.6)'; g.fillRect(IF.a + 2 + r() * (IF.b - IF.a - 4), r() * IF.h, 2.2, 2.2); }
    const gg = g.createLinearGradient(IF.b, 0, IF.w, 0); gg.addColorStop(0, '#d66a4c'); gg.addColorStop(0.45, '#f0906f'); gg.addColorStop(1, '#c95d42'); g.fillStyle = gg; g.fillRect(IF.b, 0, IF.w - IF.b, IF.h);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,225,205,${0.1 + r() * 0.12})`; g.fillRect(IF.b + r() * (IF.w - IF.b), r() * IF.h, 3 + r() * 14, 1.5); }
    return c;
  }

  // ------------------------------------------------------------------ scene pieces
  function drawDisk(o) {
    // elev in [0, PI]: past PI/2 the slice has tumbled forward (face still toward camera, side wall shows above it)
    const { x, y, s, elev, tr, a = 1 } = o;
    const sq = Math.max(0, Math.sin(elev)), band = tr * 472 * s * Math.cos(elev), flip = band < 0;
    ctx.save(); ctx.globalAlpha *= a;
    // contact shadow
    ctx.save(); ctx.translate(x, y + Math.max(band, 0) + 196 * s * sq * 0.9 + 6); ctx.scale(1, 0.18 + sq * 0.3);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 260 * s); sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 260 * s, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // side wall (the visible half of the outline: front half normally, back half when tumbled past face-on)
    const top = [], N = 64;
    for (let i = 0; i <= N; i++) { const th = (flip ? Math.PI : 0) + (i / N) * Math.PI, [ox, oy] = diskOutline(th); top.push([x + ox * s, y + oy * s * sq]); }
    ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    for (let i = N; i >= 0; i--) ctx.lineTo(top[i][0], top[i][1] + band);
    ctx.closePath();
    const hw = 236 * s, lg = ctx.createLinearGradient(x - hw, 0, x + hw, 0);
    lg.addColorStop(0, '#5e4b31'); lg.addColorStop(0.2, '#b29b72'); lg.addColorStop(0.4, '#e2d1ad'); lg.addColorStop(0.62, '#c9b28a'); lg.addColorStop(1, '#4f3e27');
    ctx.fillStyle = lg; ctx.fill();
    ctx.save(); ctx.clip();
    const vy1 = y + band + (flip ? -196 : 196) * s * sq;
    const vg = ctx.createLinearGradient(0, y, 0, Math.abs(vy1 - y) < 1 ? y + 1 : vy1); vg.addColorStop(0, 'rgba(255,245,225,0.12)'); vg.addColorStop(1, 'rgba(20,12,4,0.35)');
    ctx.fillStyle = vg; ctx.fillRect(x - hw - 5, y - 200 * s - Math.max(0, -band), hw * 2 + 10, Math.abs(band) + 420 * s);
    for (let k = 1; k < 6; k++) { // saw striations on the side wall
      ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] + band * k / 6) : ctx.moveTo(p[0], p[1] + band * k / 6)));
      ctx.strokeStyle = `rgba(60,45,25,${0.07 + (k % 2) * 0.05})`; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(30,22,12,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    if (sq > 0.006) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s * sq); ctx.drawImage(DISKT, -260, -260); ctx.restore(); }
    ctx.restore();
  }

  // Specimen scene: root on a dark stage (camera feed), sectioning, slice lifts into macro view
  function sliceState(t) {
    const vs = ROOT.vs, ysT = rootY(vs), cxT = rootCx(vs + 0.04);
    const start = { x: ROOT.sx + cxT, y: ROOT.sy + ysT, s: (2 * rootHw(vs + 0.04)) / 472, elev: 0.22, tr: ROOT.th / (2 * rootHw(vs + 0.04) * Math.cos(0.22)) };
    const macro = { x: 640, y: 742, s: 0.74, elev: 0.61, tr: 0.2 };
    // section target: tumbled forward to edge-on (elev = PI) -> coronal face at the bottom, APICAL face up
    const sect = { x: SEC.cx, y: SEC.y1, s: SEC.ow / 236, elev: Math.PI, tr: (SEC.y1 - SEC.y0) / (472 * (SEC.ow / 236)) };
    const u1 = seg(t, 3.1, 4.0, ease.inOut), u2 = seg(t, FLIP[0], FLIP[1], ease.inOut);
    const A = {}; for (const k of ['x', 'y', 's', 'elev', 'tr']) A[k] = lerp(start[k], macro[k], u1);
    const B = {}; for (const k of ['x', 'y', 's', 'elev', 'tr']) B[k] = lerp(A[k], sect[k], u2);
    B.y += -46 * Math.sin(Math.PI * u1) - 40 * Math.sin(Math.PI * u2); // lift arcs
    return { ...B, u1, u2, macro };
  }

  function drawSpecimen(t) {
    const a = 1 - seg(t, 5.42, 5.65);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    // stage light pool
    const rox = 230 * (1 - ease.inOut(seg(t, 1.45, 1.95))), lx0 = ROOT.sx + rox + 150;
    const sp = ctx.createRadialGradient(lerp(lx0, 470, seg(t, 2.8, 4.0, ease.inOut)), 800, 20, lerp(lx0, 470, seg(t, 2.8, 4.0, ease.inOut)), 800, 520); sp.addColorStop(0, `rgba(120,118,110,${0.22 * seg(t, 0, 0.5)})`); sp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sp; ctx.fillRect(DA.x, DA.y, DA.w, DA.h);
    const ra = seg(t, 0.15, 0.7) * (1 - 0.85 * seg(t, 3.1, 3.8)) * (1 - seg(t, 4.8, 5.15));
    const ysT = rootY(ROOT.vs), th = ROOT.th, sep = 11 * seg(t, 2.85, 3.15, ease.out);
    if (ra > 0) {
      ctx.save(); ctx.globalAlpha *= ra;
      const sx = ROOT.sx + rox, sy = ROOT.sy;
      // shadow on stage
      ctx.save(); ctx.translate(sx + 160, sy + 470); ctx.scale(1, 0.12); const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 170); sh.addColorStop(0, 'rgba(0,0,0,0.6)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 170, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      const cut = t >= 2.85;
      if (!cut) ctx.drawImage(ROOTT, sx, sy);
      else {
        { // coronal piece: clip so its cut edge is the front half of an ellipse
          const hw = rootHw(ROOT.vs), ccx = sx + rootCx(ROOT.vs), cy = sy - sep + ysT;
          ctx.save(); ctx.beginPath(); ctx.moveTo(sx - 10, sy - sep - 20); ctx.lineTo(sx + ROOT.w + 10, sy - sep - 20); ctx.lineTo(sx + ROOT.w + 10, cy);
          ctx.lineTo(ccx + hw, cy); ctx.ellipse(ccx, cy, hw, hw * 0.22, 0, 0, Math.PI); ctx.lineTo(sx - 10, cy); ctx.closePath(); ctx.clip();
          ctx.drawImage(ROOTT, sx, sy - sep); ctx.restore();
        }
        ctx.drawImage(ROOTT, 0, ysT + th, ROOT.w, ROOT.h - ysT - th, sx, sy + ysT + th + sep, ROOT.w, ROOT.h - ysT - th); // apical piece
        const v2 = ROOT.vs + th / ROOT.len;
        cutFace(ctx, sx + rootCx(v2), sy + ysT + th + sep, rootHw(v2), 0.22, 1);
      }
      // canal "scan" overlay (HUD augmentation)
      const scan = seg(t, 0.35, 1.5, ease.inOut), ov = seg(t, 0.35, 0.6) * (1 - 0.5 * seg(t, 2.0, 2.6));
      if (ov > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, ROOT.w, ROOT.top + ROOT.len * 0.97 * scan + 2); ctx.clip();
        if (cut) { ctx.beginPath(); ctx.rect(sx, sy - 40, ROOT.w, ysT - sep + 40); ctx.rect(sx, sy + ysT + th + sep, ROOT.w, ROOT.h); ctx.clip(); }
        ctx.beginPath();
        for (let i = 0; i <= 50; i++) { const v = (i / 50) * 0.97, x = sx + rootCx(v) + rootHw(0) * 0.03 - lerp(13, 2, v), y = sy + rootY(v) + (cut && rootY(v) < ysT ? -sep : cut && rootY(v) > ysT + th ? sep : 0); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        for (let i = 50; i >= 0; i--) { const v = (i / 50) * 0.97, x = sx + rootCx(v) + rootHw(0) * 0.03 + lerp(13, 2, v), y = sy + rootY(v) + (cut && rootY(v) < ysT ? -sep : cut && rootY(v) > ysT + th ? sep : 0); ctx.lineTo(x, y); }
        ctx.closePath(); ctx.fillStyle = Kit.rgba(C.gp, 0.42 * ov); ctx.fill();
        ctx.setLineDash([6, 5]); ctx.strokeStyle = Kit.rgba(C.teal, 0.85 * ov); ctx.lineWidth = 1.6; ctx.stroke();
        ctx.restore();
        if (scan > 0 && scan < 1) { const yy = sy + ROOT.top + ROOT.len * scan; ln(sx - 30, yy, sx + ROOT.w + 30, yy, C.teal, 2, 0.9); }
      }
      ctx.restore();
    }
    // label: filled canal
    const la = seg(t, 1.0, 1.35) * (1 - seg(t, 2.6, 2.9));
    if (la > 0) {
      const v = 0.3, px = ROOT.sx + rox + rootCx(v) + 8, py = ROOT.sy + rootY(v), lx = ROOT.sx + rox + 262;
      leader([[lx - 12, 690], [lx - 70, 690], [px, py]], C.teal, la);
      T('filled canal', lx, 700, { font: F(500, 30), color: C.teal, alpha: la });
      T('sealer + gutta-percha', lx, 738, { font: F(400, 26), color: C.txt2, alpha: la });
    }
    // cut planes
    const cutPlane = (y, u) => {
      if (u <= 0) return;
      const x0 = ROOT.sx + 40, x1 = ROOT.sx + 260, xx = lerp(x0, x1, u);
      ln(x0 - 30, y, xx, y, C.teal, 2.5, 0.95);
      if (u < 1) { dot(xx, y, 5, '#ffffff', 0.9); for (let i = 0; i < 6; i++) { const r = Kit.hash(i, Math.floor(t * 30)); dot(xx + 6 + r * 18, y - 4 + Kit.hash(i, 7, Math.floor(t * 30)) * 8, 1.6, C.teal, 0.8); } }
    };
    const fadeCuts = 1 - seg(t, 3.0, 3.3);
    ctx.save(); ctx.globalAlpha *= fadeCuts;
    cutPlane(ROOT.sy + ysT, seg(t, 2.0, 2.4, ease.inOut));
    cutPlane(ROOT.sy + ysT + th, seg(t, 2.35, 2.75, ease.inOut));
    // 1 mm dimension on the root
    const da = seg(t, 2.55, 2.8);
    if (da > 0) {
      const x = ROOT.sx + 260, y0 = ROOT.sy + ysT, y1 = y0 + th;
      ln(x, y0, x, y1, C.teal, 2, da); ln(x - 8, y0, x + 8, y0, C.teal, 2, da); ln(x - 8, y1, x + 8, y1, C.teal, 2, da);
      T('1 mm', x + 18, y0 + th / 2 + 11, { font: F(700, 32), color: C.teal, alpha: da });
    }
    ctx.restore();
    ctx.restore();
    // the slice itself (drawn while t >= cut time, through the morph to section)
    if (t >= 2.85 && t < 5.7) {
      const st = sliceState(t);
      const xa = 1 - seg(t, 5.45, 5.65);
      drawDisk({ x: st.x, y: st.y - (t < 3.1 ? 0 : 0), s: st.s, elev: st.elev, tr: st.tr, a: xa });
      // macro labels
      const ma = seg(t, 3.9, 4.2) * (1 - seg(t, 4.6, 4.78));
      if (ma > 0) {
        const m = st, sq = Math.sin(m.elev);
        const ccx = m.x + CANAL.x * m.s, ccy = m.y + CANAL.y * m.s * sq, cr = CANAL.r * m.s;
        const lx = 862;
        leader([[lx - 12, 632], [790, 632], [m.x + 150 * m.s, m.y - 110 * m.s * sq]], C.teal, ma);
        T('DENTIN', lx, 642, { font: F(600, 30), color: C.txt, alpha: ma });
        leader([[lx - 12, 706], [ccx + cr + 40, 706], [ccx + cr - 3, ccy - 4]], C.teal, ma);
        T('SEALER', lx, 716, { font: F(600, 30), color: C.sealer, alpha: ma });
        leader([[lx - 12, 780], [ccx + 40, 780], [ccx + 8, ccy + 4]], C.teal, ma);
        T('GP CORE', lx, 790, { font: F(600, 30), color: C.gp, alpha: ma });
        // thickness dimension on side wall
        const band = m.tr * 472 * m.s * Math.cos(m.elev), xl = m.x - 236 * m.s - 16, yt = m.y, yb = m.y + band;
        ln(xl, yt, xl, yb, C.teal, 2, ma); ln(xl - 8, yt, xl + 8, yt, C.teal, 2, ma); ln(xl - 8, yb, xl + 8, yb, C.teal, 2, ma);
        T('1 mm', xl - 14, (yt + yb) / 2 + 11, { font: F(700, 30), color: C.teal, align: 'right', alpha: ma });
        brackets(m.x - 236 * m.s - 36, m.y - 196 * m.s * sq - 30, 472 * m.s + 72, 196 * m.s * sq * 2 + band + 60, 22, C.amber, 2, ma * 0.9);
      }
    }
  }

  // Section scene (mount + load)
  function plunger(tipY, a) {
    const { cx, rp } = SEC;
    ctx.save(); ctx.globalAlpha *= a;
    const top = DA.y - 10, collarY = tipY - 175;
    // collet / load-cell adapter
    if (collarY > top) {
      const lg2 = ctx.createLinearGradient(cx - 74, 0, cx + 74, 0);
      lg2.addColorStop(0, '#2b3035'); lg2.addColorStop(0.3, '#7d868e'); lg2.addColorStop(0.45, '#c3cbd2'); lg2.addColorStop(0.7, '#5a636b'); lg2.addColorStop(1, '#23272b');
      ctx.fillStyle = lg2; ctx.fillRect(cx - 74, top, 148, collarY - top);
      for (let y = collarY - 12; y > top; y -= 9) ln(cx - 74, y, cx + 74, y, 'rgba(0,0,0,0.35)', 1.5);
      ctx.fillStyle = '#1d2125'; ctx.fillRect(cx - 74, collarY - 6, 148, 6);
    }
    const y0 = Math.max(top, collarY);
    const lg = ctx.createLinearGradient(cx - rp, 0, cx + rp, 0);
    lg.addColorStop(0, '#3e454c'); lg.addColorStop(0.16, '#99a2aa'); lg.addColorStop(0.33, '#f1f4f6'); lg.addColorStop(0.52, '#b6bfc6'); lg.addColorStop(0.82, '#69727a'); lg.addColorStop(1, '#353b41');
    ctx.fillStyle = lg; ctx.fillRect(cx - rp, y0, rp * 2, tipY - y0);
    for (let i = 0; i < 9; i++) { const x = cx - rp + 6 + i * 9 + Kit.hash(i, 3) * 4; ln(x, y0, x, tipY - 4, 'rgba(255,255,255,0.06)', 1); }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(cx - rp, tipY - 4, rp * 2, 4);
    ctx.restore();
  }

  function drawSection(t) {
    const a = seg(t, 5.32, 5.58) * (1 - seg(t, SEC_OUT, SEC_OUT + 0.18));
    if (a <= 0) return;
    const ox = -120 * ease.in(seg(t, SEC_OUT, SEC_OUT + 0.18));
    const { cx, y0, y1, ow, rT, rB, s, rp, jx0, jx1, hole, K } = SEC;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(ox, 0);
    // drafting grid
    ctx.save(); ctx.globalAlpha *= 0.5; ctx.strokeStyle = 'rgba(70,224,199,0.06)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = DA.x + 16; x < DA.x + DA.w; x += 32) { ctx.moveTo(x, DA.y); ctx.lineTo(x, DA.y + DA.h); }
    for (let y = DA.y + 14; y < DA.y + DA.h; y += 32) { ctx.moveTo(DA.x, y); ctx.lineTo(DA.x + DA.w, y); }
    ctx.stroke(); ctx.restore();

    // --- jig (rises into place)
    const jr = 130 * (1 - seg(t, 5.05, 5.55, ease.out));
    ctx.save(); ctx.translate(0, jr);
    const jb = DA.y + DA.h + 10;
    const bore = ctx.createLinearGradient(cx - hole, 0, cx + hole, 0); bore.addColorStop(0, '#20262c'); bore.addColorStop(0.5, '#090b0d'); bore.addColorStop(1, '#1a1f24');
    ctx.fillStyle = bore; ctx.fillRect(cx - hole, y1, hole * 2, jb - y1);
    const half = (xa, xb) => {
      ctx.save(); ctx.beginPath(); ctx.rect(xa, y1, xb - xa, jb - y1); ctx.fillStyle = '#262c32'; ctx.fill(); ctx.clip();
      ctx.strokeStyle = 'rgba(120,135,148,0.22)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let k = -200; k < 900; k += 15) { ctx.moveTo(xa + k, y1); ctx.lineTo(xa + k - 150, y1 + 150); }
      ctx.stroke(); ctx.restore();
      ln(xa, y1 + 1, xb, y1 + 1, '#7d8994', 2);
    };
    half(jx0, cx - hole); half(cx + hole, jx1);
    ctx.restore();

    // --- loading state. Displacement control: after the peak the plug moves only as far as the crosshead
    // (drawn x SLIP, labelled), then the plunger lifts off and friction holds the partly extruded plug.
    const d = dispAt(t), pre = t < TPK;
    const ind = Math.min(d, DPK) * K * 0.6;                         // GP indentation (stays after debond)
    const plugDy = pre ? 0 : (d - DPK) * K * SLIP;
    // --- dentin walls (cut face)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - ow, y0); ctx.lineTo(cx - rT, y0); ctx.lineTo(cx - rB, y1); ctx.lineTo(cx - ow, y1); ctx.closePath();
    ctx.moveTo(cx + rT, y0); ctx.lineTo(cx + ow, y0); ctx.lineTo(cx + ow, y1); ctx.lineTo(cx + rB, y1); ctx.closePath();
    ctx.save(); ctx.clip(); ctx.drawImage(SECT, cx - ow, y0); ctx.restore();
    ctx.strokeStyle = 'rgba(40,30,16,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
    // canal (empty) background behind plug, visible where the plug has moved
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx - rT, y0); ctx.lineTo(cx + rT, y0); ctx.lineTo(cx + rB, y1); ctx.lineTo(cx - rB, y1); ctx.closePath();
    ctx.fillStyle = '#0d1012'; ctx.fill(); ctx.restore();
    // remnant sealer patches on the wall (mixed failure), revealed as the plug slides
    if (!pre) {
      ctx.save();
      for (const [side, v0, v1] of PATCHES) {
        const wx = (v) => cx + side * lerp(rT, rB, v), wy = (v) => y0 + v * (y1 - y0);
        ctx.beginPath(); ctx.moveTo(wx(v0), wy(v0)); ctx.lineTo(wx(v1), wy(v1));
        ctx.lineTo(wx(v1) - side * 11, wy(v1)); ctx.lineTo(wx(v0) - side * 11, wy(v0)); ctx.closePath();
        ctx.fillStyle = C.sealer; ctx.fill(); ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.restore();
    }
    // --- plug (sealer + GP)
    ctx.save();
    ctx.beginPath(); ctx.rect(DA.x - 200, DA.y, DA.w + 400, DA.h); ctx.clip();
    ctx.drawImage(PLUGT, cx - 80, y0 + plugDy);
    if (ind > 0.5) { // plastic dent in the GP under the plunger tip
      ctx.fillStyle = 'rgba(70,25,12,0.35)'; ctx.beginPath(); ctx.ellipse(cx, y0 + plugDy + ind * 0.5, rp + 4, ind * 0.6 + 2, 0, 0, Math.PI); ctx.fill();
    }
    ctx.restore();
    // --- interface shear glow (pre-debond). Brighter near the loaded (apical) and supported (coronal) edges:
    // interfacial stress is not uniform (FEA), so F/A is only a nominal mean.
    const fr = forceShown(t) / FPK;
    if (pre && t > TC) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const side of [-1, 1]) {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        const aE = 0.2 + 0.62 * fr * fr, aM = 0.07 + 0.2 * fr * fr;
        g.addColorStop(0, Kit.rgba(C.amber, aE)); g.addColorStop(0.22, Kit.rgba(C.amber, (aE + aM) / 2)); g.addColorStop(0.5, Kit.rgba(C.amber, aM));
        g.addColorStop(0.8, Kit.rgba(C.amber, (aE + aM) / 2)); g.addColorStop(1, Kit.rgba(C.amber, aE * 0.9));
        for (let k = 0; k < 3; k++) {
          ctx.save(); ctx.globalAlpha *= 1 / (k + 1); ctx.strokeStyle = g; ctx.lineWidth = 3 + k * 7;
          ctx.beginPath(); ctx.moveTo(cx + side * rT, y0); ctx.lineTo(cx + side * rB, y1); ctx.stroke(); ctx.restore();
        }
      }
      ctx.restore();
      // shear chevrons: filling pushed down, dentin held up
      const ca = clamp(fr * 1.6) * 0.9;
      for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
        const v = 0.3 + k * 0.4, wx = cx + side * lerp(rT, rB, v), yy = y0 + v * (y1 - y0);
        arrow(wx - side * 26, yy - 12, wx - side * 26, yy + 12, C.amber, 2.5, 10, ca);
        arrow(wx + side * 26, yy + 12, wx + side * 26, yy - 12, C.teal, 2.5, 10, ca);
      }
    }
    // --- crack flash at debond (propagates top -> bottom)
    const cr = seg(t, TPK - 0.02, TPK + 0.14), crA = 1 - seg(t, TPK + 0.3, TPK + 0.9);
    if (cr > 0 && crA > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) { const v = (i / 30) * cr, wob = (Kit.noise1(v * 9, side + 4) > 0 ? -1 : 0) * 5; const x = cx + side * (lerp(rT, rB, v) + wob * -1), y = y0 + v * (y1 - y0); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = Kit.rgba('#fff3d6', 0.95 * crA); ctx.lineWidth = 3; ctx.stroke();
        ctx.strokeStyle = Kit.rgba(C.red, 0.5 * crA); ctx.lineWidth = 10; ctx.stroke();
      }
      ctx.restore();
    }
    // --- plunger
    const indPk = DPK * K * 0.6;
    let tipY;
    if (t < TC) tipY = lerp(DA.y - 30, y0, ease.inOut(seg(t, 5.75, 6.75)));
    else if (pre) tipY = y0 + ind;
    else tipY = y0 + indPk + plugDy;
    if (t > TEND) tipY = y0 + indPk + (DEND - DPK) * K * SLIP - 90 * ease.inOut(seg(t, TEND + 0.05, TEND + 0.55));
    plunger(tipY, 1);
    // alignment axis
    const axA = seg(t, 5.55, 5.9) * (1 - seg(t, 6.7, 7.0)) * 0.7;
    if (axA > 0) ln(cx, DA.y, cx, DA.y + DA.h, C.teal, 1.5, axA, [10, 8]);
    // force arrow
    const fa = seg(t, TC, TC + 0.2) * (1 - seg(t, TPK - 0.14, TPK - 0.02));
    if (fa > 0) {
      const L = 50 + 70 * fr, ax = cx + 104, ay1 = Math.min(tipY - 30, y0 - 26);
      arrow(ax, ay1 - L, ax, ay1, C.amber, 5, 22, fa);
      T('F', ax + 18, ay1 - L / 2 + 12, { font: F(800, 36), color: C.amber, alpha: fa });
    }
    // --- labels
    const la = seg(t, 5.6, 5.95);
    if (la > 0) {
      ln(210, y0 + 1, cx - ow - 8, y0 + 1, C.teal, 2, la); T('APICAL', 84, y0 + 11, { font: F(600, 30), color: C.teal, alpha: la });
      ln(232, y1 - 1, cx - ow - 8, y1 - 1, C.teal, 2, la); T('CORONAL', 84, y1 + 9, { font: F(600, 30), color: C.teal, alpha: la });
      arrow(150, y0 + 26, 150, y1 - 28, C.amber, 3, 14, la);
    }
    const pa = seg(t, 6.3, 6.5) * (1 - seg(t, 8.6, 8.9)); // appears once the jogging plunger tip has passed y 700
    if (pa > 0) {
      leader([[700, 640], [660, 640], [cx + rp + 2, Math.min(700, tipY - 12)]], C.teal, pa);
      T('PLUNGER', 712, 650, { font: F(600, 30), color: C.txt, alpha: pa });
      T('Ø < canal Ø', 712, 690, { font: F(500, 30), color: C.teal, alpha: pa });
    }
    const ja = seg(t, 5.65, 6.0) * (1 - seg(t, 8.0, 8.3));
    if (ja > 0) {
      leader([[870, 968], [856, 968], [jx1 - 30, y1 + 30]], C.teal, ja);
      T('SUPPORT', 880, 962, { font: F(600, 28), color: C.txt, alpha: ja });
      T('JIG', 880, 996, { font: F(600, 28), color: C.txt, alpha: ja });
    }
    // DEBOND tag
    const dbA = seg(t, TPK, TPK + 0.12) * (1 - seg(t, TPK + 1.0, TPK + 1.3));
    if (dbA > 0) {
      const bx = cx + 112, by = y0 - 66, s2 = 1 + 0.15 * (1 - ease.out(seg(t, TPK, TPK + 0.3)));
      ctx.save(); ctx.globalAlpha *= dbA; ctx.translate(bx, by); ctx.scale(s2, s2);
      ctx.fillStyle = 'rgba(255,106,85,0.16)'; ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(0, -26, 196, 52, 6); ctx.fill(); ctx.stroke();
      T('DEBOND', 98, 12, { font: F(800, 34), color: C.red, align: 'center' });
      ctx.restore();
    }
    // evidence for the MIXED call: sealer remnants on the exposed wall
    const sl = seg(t, TPK + 0.45, TPK + 0.7);
    if (sl > 0) {
      leader([[470, 762], [480, 762], [491, 832]], C.teal, sl);
      T('sealer left on wall', 462, 772, { font: F(600, 30), color: C.teal, align: 'right', alpha: sl });
    }
    const sx = seg(t, TPK + 0.3, TPK + 0.6);
    if (sx > 0) T('slip exaggerated', cx, y1 + 84, { font: F(500, 22), color: C.txt2, align: 'center', alpha: sx });
    // legend
    const lgA = seg(t, 5.5, 5.85);
    if (lgA > 0) {
      const items = [['dentin', C.dentin], ['sealer', C.sealer], ['GP', C.gp]];
      items.forEach(([n, col], i) => { const y = 572 + i * 42; ctx.save(); ctx.globalAlpha *= lgA; ctx.fillStyle = col; ctx.fillRect(88, y, 24, 24); ctx.restore(); T(n, 124, y + 22, { font: F(500, 30), color: C.txt2, alpha: lgA }); });
    }
    ctx.restore();
  }
  // "flipped" tag: shown while the slice tumbles into Section A–A (coronal face down, apical face up)
  function drawFlipTag(t) {
    const a = seg(t, 4.95, 5.25) * (1 - seg(t, 7.2, 7.45));
    if (a <= 0) return;
    const fnt = F(700, 30), s = 'FLIPPED: APICAL UP', w = tw(s, fnt) + 60, x = 1004 - w, y = 560; // clears the plunger collet (x <= 614)
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = '#10201e'; ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, 46, 6); ctx.fill(); ctx.stroke();
    // flip glyph: half-turn arrow
    const gx = x + 26, gy = y + 23, rot = Math.PI * ease.inOut(seg(t, 4.95, 5.5));
    ctx.translate(gx, gy); ctx.rotate(rot);
    ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 11, -Math.PI * 0.85, Math.PI * 0.35); ctx.stroke();
    ctx.restore();
    const ex = gx + 11 * Math.cos(Math.PI * 0.35 + Math.PI * ease.inOut(seg(t, 4.95, 5.5))), ey = gy + 11 * Math.sin(Math.PI * 0.35 + Math.PI * ease.inOut(seg(t, 4.95, 5.5)));
    head(ex, ey, Math.PI * 0.35 + Math.PI * ease.inOut(seg(t, 4.95, 5.5)) + Math.PI / 2, 10, C.teal, a);
    T(s, x + 50, y + 34, { font: fnt, color: C.teal, alpha: a });
  }

  // Failure-mode tiles
  const CRACK = {
    adhesive: (y) => IF.a + 1.2 * Math.sin(y * 0.21),
    cohesive: (y) => (IF.a + IF.b) / 2 + 3 * Kit.noise1(y * 0.06, 2),
    mixed: (y) => { const sq = ease.smooth(clamp((Math.sin(y * 0.032 + 0.6) + 0.15) * 2.2 * 0.5 + 0.5)); return lerp(IF.a + 1, (IF.a + IF.b) / 2 + 2, sq) + 1.5 * Kit.noise1(y * 0.1, 5); },
  };
  // one magnified band [yA, yB] of the interface: dentin side fixed, the side right of the crack pushed down
  function ifaceBand(ix, iy, yA, yB, fx, open, dmax) {
    const dy = dmax * open, gap = 5 * open;
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy + yA, IF.w, yB - yA); ctx.clip();
    ctx.fillStyle = '#07090a'; ctx.fillRect(ix, iy + yA, IF.w, yB - yA);
    ctx.save(); ctx.beginPath(); ctx.moveTo(ix, iy); for (let yy = 0; yy <= IF.h; yy += 3) ctx.lineTo(ix + fx(yy), iy + yy); ctx.lineTo(ix, iy + IF.h); ctx.closePath(); ctx.clip(); ctx.drawImage(IFACET, ix, iy); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy + yA + dy, IF.w, IF.h); ctx.clip(); // displaced side leaves a gap at the top of its band
    ctx.beginPath(); ctx.moveTo(ix + IF.w, iy + dy); for (let yy = 0; yy <= IF.h; yy += 3) ctx.lineTo(ix + fx(yy) + gap, iy + yy + dy); ctx.lineTo(ix + IF.w, iy + IF.h + dy); ctx.closePath(); ctx.clip(); ctx.drawImage(IFACET, ix + gap, iy + dy); ctx.restore();
    ctx.beginPath(); for (let yy = 0; yy <= IF.h; yy += 3) (yy ? ctx.lineTo : ctx.moveTo).call(ctx, ix + fx(yy) + gap * 0.5, iy + yy);
    ctx.strokeStyle = Kit.rgba(C.red, 0.85 * open); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function tile(x, y, kind, title, sub, highlight, a, open) {
    const w = 288, h = 430, ix = x + 16, iy = y + 66;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = highlight ? 'rgba(255,181,71,0.07)' : C.panel2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = highlight ? C.amber : C.line2; ctx.lineWidth = highlight ? 3 : 1.5; ctx.stroke();
    T(title, x + w / 2, y + 46, { font: F(800, 34), color: highlight ? C.amber : C.txt, align: 'center' });
    if (kind === 'adhesive') {
      // two adhesive sites: top half fails at sealer|dentin, bottom half at sealer|GP
      const mid = IF.h / 2;
      ifaceBand(ix, iy, 0, mid - 2, (yy) => IF.a + 1.2 * Math.sin(yy * 0.21), open, 18);
      ifaceBand(ix, iy, mid + 2, IF.h, (yy) => IF.b + 1.2 * Math.sin(yy * 0.23 + 1), open, 18);
      ctx.fillStyle = C.panel2; ctx.fillRect(ix, iy + mid - 2, IF.w, 4);
      ctx.fillStyle = C.panel2; ctx.strokeStyle = C.line2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(ix + 10, iy + mid - 15, 46, 30, 5); ctx.fill(); ctx.stroke();
      T('or', ix + 33, iy + mid + 8, { font: F(700, 24), color: C.txt, align: 'center' });
    } else {
      ifaceBand(ix, iy, 0, IF.h, CRACK[kind], open, 22);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.strokeRect(ix, iy, IF.w, IF.h);
    // push arrow on the filling side
    arrow(ix + IF.w - 26, iy + 20, ix + IF.w - 26, iy + 70, '#ffffff', 3, 14, 0.8 * open);
    T(sub[0], x + w / 2, y + 366, { font: F(500, 30), color: C.txt2, align: 'center' });
    T(sub[1], x + w / 2, y + 400, { font: F(500, 30), color: C.txt2, align: 'center' });
    ctx.restore();
  }
  function drawInspect(t) {
    const a = seg(t, 11.06, 11.28) * (1 - seg(t, 13.55, 13.8));
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const kinds = [['adhesive', 'ADHESIVE', ['sealer–dentin', 'or sealer–GP']], ['cohesive', 'COHESIVE', ['within sealer,', 'core or dentin']], ['mixed', 'MIXED', ['both', 'patterns']]];
    const yT = 564 - 40 * seg(t, 13.55, 13.8, ease.in);
    kinds.forEach(([k, title, sub], i) => {
      const ti = 11.1 + i * 0.14, ta = seg(t, ti, ti + 0.35, ease.out);
      const x = 80 + i * 312 + 60 * (1 - ta);
      const hl = k === 'mixed' && t > 12.5;
      tile(x, yT, k, title, sub, hl, ta, ease.inOut(seg(t, 11.5 + i * 0.25, 12.1 + i * 0.25)));
    });
    // "this test" chip centred on the MIXED tile's bottom border
    const tg = seg(t, 12.5, 12.8);
    if (tg > 0) {
      const x = 80 + 2 * 312 + 144, y = yT + 430, s2 = 1 + 0.12 * (1 - ease.out(tg));
      ctx.save(); ctx.globalAlpha *= tg; ctx.translate(x, y); ctx.scale(s2, s2);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.roundRect(-105, -21, 210, 42, 7); ctx.fill();
      T('THIS TEST', 0, 10, { font: F(800, 28), color: '#1a1406', align: 'center' });
      ctx.restore();
    }
    ctx.restore();
  }

  // Calculation view
  function radical(x, y, w, sz, color, alpha) { // draws √ with vinculum over width w; returns width of the sign
    const sw = sz * 0.62;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = Math.max(2.5, sz * 0.075); ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - sz * 0.38); ctx.lineTo(x + sw * 0.25, y - sz * 0.45); ctx.lineTo(x + sw * 0.55, y + sz * 0.06); ctx.lineTo(x + sw, y - sz * 0.86); ctx.lineTo(x + sw + w + 4, y - sz * 0.86); ctx.stroke();
    ctx.restore(); return sw + 4;
  }
  const CX = 470;                                       // formula column (calc view)
  const TBOX = { x: CX - 14, y: 944, w: 530, h: 76 };   // tau result box (morphs into the report number)
  const TAU_F = F(800, 50);
  // ghost of the peak-force value flying from the plot's "F max" label to the F line (drawn unclipped)
  function drawFlyGhost(t) {
    const fu = seg(t, 14.55, 15.05), fly = ease.inOut(fu);
    if (fu <= 0 || fu >= 1) return;
    const px0 = PA.x0 + (DPK / PA.dmax) * (PA.x1 - PA.x0) + 20 + tw('F max ', F(700, 30)), py0 = PA.y1 - (FPK / PA.fmax) * (PA.y1 - PA.y0) - 4;
    const gx = lerp(px0, CX + 86, fly), gy = lerp(py0, 800, fly) - 60 * Math.sin(Math.PI * fly), fs = Math.round(lerp(30, 36, fly));
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 12;
    T(FPK.toFixed(2) + ' N', gx, gy, { font: F(800, fs), color: C.amber, alpha: seg(fu, 0, 0.12) * (1 - seg(fu, 0.9, 1)) });
    ctx.restore();
  }
  function drawCalc(t) {
    const a = seg(t, 13.68, 14.0) * (1 - seg(t, P.result[0], P.result[0] + 0.12));
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    // frustum diagram (canal wall inside the slice; apical end up as in Section A–A; taper exaggerated)
    const fx = 290, yt = 650, yb = 860, rt = 56, rb = 104, et = 14, eb = 24, da = seg(t, 13.72, 14.2, ease.out);
    ctx.save(); ctx.globalAlpha *= da;
    ctx.beginPath(); ctx.ellipse(fx, yb, rb, eb, 0, 0, Math.PI); ctx.lineTo(fx - rt, yt); ctx.ellipse(fx, yt, rt, et, 0, Math.PI, 0, true); ctx.closePath();
    const lg = ctx.createLinearGradient(fx - rb, 0, fx + rb, 0); lg.addColorStop(0, 'rgba(255,181,71,0.12)'); lg.addColorStop(0.4, 'rgba(255,181,71,0.42)'); lg.addColorStop(1, 'rgba(255,181,71,0.1)');
    ctx.fillStyle = lg; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke();
    for (let i = 1; i < 10; i++) { const th = Math.PI * i / 10; ln(fx + Math.cos(th) * rt, yt + Math.sin(th) * et, fx + Math.cos(th) * rb, yb + Math.sin(th) * eb, C.amber, 1.2, 0.45); }
    ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(fx, yb, rb, eb, 0, Math.PI, 0); ctx.strokeStyle = Kit.rgba(C.amber, 0.5); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(fx, yt, rt, et, 0, 0, Math.PI * 2); ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke();
    // dims: r = apical radius (top), R = coronal radius (bottom), h = slice thickness
    ln(fx, yt, fx + rt, yt, C.teal, 2.5); dot(fx, yt, 4, C.teal); T('r', fx + rt / 2, yt - et - 10, { font: F(700, 32), color: C.teal, align: 'center' });
    T('apical', fx - rt - 12, yt + 8, { font: F(500, 24), color: C.txt2, align: 'right' });
    ln(fx, yb, fx + rb, yb, C.teal, 2.5); dot(fx, yb, 4, C.teal); T('R', fx + rb / 2, yb + eb + 34, { font: F(700, 32), color: C.teal, align: 'center' });
    T('coronal', fx - rb - 12, yb + 8, { font: F(500, 24), color: C.txt2, align: 'right' });
    const hx = fx + rb + 22; ln(hx, yt, hx, yb, C.teal, 2); ln(hx - 9, yt, hx + 9, yt, C.teal, 2); ln(hx - 9, yb, hx + 9, yb, C.teal, 2);
    T('h', hx + 12, (yt + yb) / 2 + 11, { font: F(700, 32), color: C.teal });
    T('A = canal-wall', fx, yb + 100, { font: F(600, 30), color: C.amber, align: 'center' });
    T('area (nominal)', fx, yb + 136, { font: F(600, 30), color: C.amber, align: 'center' });
    ctx.restore();
    // formulas
    const X = CX;
    const l1 = seg(t, 13.8, 14.1);
    T('τ = F / A', X, 652, { font: F(800, 66), color: C.txt, alpha: l1 });
    const l2 = seg(t, 14.15, 14.45);
    if (l2 > 0) {
      const fnt = F(600, 38); let x = X;
      T('A = π(R+r)', x, 728, { font: fnt, color: C.txt, alpha: l2 }); x += tw('A = π(R+r)', fnt) + 8;
      const inner = '(R−r)²+h²', iw = tw(inner, fnt);
      x += radical(x, 728, iw, 38, C.txt, l2);
      T(inner, x, 728, { font: fnt, color: C.txt, alpha: l2 });
    }
    const dv = seg(t, 14.45, 14.75); ln(X, 752, 1000, 752, C.line2, 1.5, dv);
    // live numbers: F label first; the amber value appears only when the ghost from the plot peak lands
    const l3 = seg(t, 14.55, 14.85);
    if (l3 > 0) {
      T('F =', X, 800, { font: F(600, 36), color: C.txt2, alpha: l3 });
      T('peak force', X + 300, 800, { font: F(400, 26), color: C.txt2, alpha: l3 });
    }
    const va = seg(t, 15.0, 15.08);
    if (va > 0) {
      const pop = 1 + 0.15 * (1 - ease.out(seg(t, 15.0, 15.15))), vx = X + 86, vy = 800;
      ctx.save(); ctx.translate(vx, vy - 12); ctx.scale(pop, pop); ctx.translate(-vx, -(vy - 12));
      T(FPK.toFixed(2) + ' N', vx, vy, { font: F(800, 36), color: C.amber, alpha: va });
      ctx.restore();
    }
    const l4 = seg(t, 15.2, 15.45), l4b = seg(t, 15.3, 15.55);
    if (l4 > 0) T(`r ${GEO.r.toFixed(2)} · R ${GEO.R.toFixed(2)} mm (radii)`, X, 842, { font: F(500, 30), color: C.teal, alpha: l4 });
    if (l4b > 0) rich(`h ${GEO.h.toFixed(2)} mm · Ø ${(2 * GEO.r).toFixed(2)}→${(2 * GEO.R).toFixed(2)}`, X, 880, F(500, 30), C.teal, l4b);
    const l5 = seg(t, 15.6, 15.9);
    if (l5 > 0) { // final value shown directly (no count-up through wrong numbers)
      T('A =', X, 928, { font: F(600, 36), color: C.txt2, alpha: l5 });
      T(AREA.toFixed(2) + ' mm²', X + 86, 928 + 8 * (1 - ease.out(l5)), { font: F(800, 36), color: C.txt, alpha: l5 });
    }
    const l6 = seg(t, 15.95, 16.25);
    if (l6 > 0 && t <= P.result[0]) {
      const pulse = 1 + 0.03 * Math.sin(Math.PI * seg(t, 16.3, 16.6)), pcx = TBOX.x + TBOX.w / 2, pcy = TBOX.y + TBOX.h / 2;
      ctx.save(); ctx.globalAlpha *= l6; ctx.translate(pcx, pcy); ctx.scale(pulse, pulse); ctx.translate(-pcx, -pcy);
      ctx.fillStyle = 'rgba(255,181,71,0.1)'; ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(TBOX.x, TBOX.y, TBOX.w, TBOX.h, 8); ctx.fill(); ctx.stroke();
      T('τ = ' + SIGMA.toFixed(2) + ' MPa', X + 6, TBOX.y + 56 + 6 * (1 - ease.out(l6)), { font: TAU_F, color: C.amber });
      T('1 N/mm²', TBOX.x + TBOX.w - 12, TBOX.y + 32, { font: F(500, 24), color: C.txt2, align: 'right' });
      T('= 1 MPa', TBOX.x + TBOX.w - 12, TBOX.y + 62, { font: F(500, 24), color: C.txt2, align: 'right' });
      ctx.restore();
    }
    T('illustrative values · taper exaggerated', 88, 590, { font: F(400, 24), color: C.dim, alpha: seg(t, 13.9, 14.2) });
    ctx.restore();
  }

  // ------------------------------------------------------------------ HUD chrome
  function phaseIndex(t) { for (let i = TAB_T.length - 1; i >= 0; i--) if (t >= TAB_T[i][0]) return i; return -1; }
  function statusOf(t) {
    if (t < P.slice[0]) return ['READY', C.teal];
    if (t < P.mount[0]) return ['PREP', C.teal];
    if (t < 5.75) return ['MOUNT', C.teal];
    if (t < TC) return ['JOG', C.amber];
    if (t < TPK) return ['RUN', C.amber];
    if (t < TEND) return ['DEBOND', C.red];
    if (t < P.inspect[0]) return ['STOP', C.txt2];
    if (t < P.calc[0]) return ['INSPECT', C.teal];
    if (t < P.result[0]) return ['CALC', C.teal];
    return ['DONE', C.teal];
  }
  function viewLabel(t) {
    if (t < 5.4) return ['CAM 2 · MACRO', ''];
    if (t < 11.08) return ['SECTION A–A', 'SCHEMATIC · NOT TO SCALE'];
    if (t < 13.75) return ['STEREO 40×', 'SCHEMATIC'];
    return ['CALC · WALL AREA', ''];
  }

  // header: identical on every frame (title readable on frame 0; anchors the loop)
  function drawHeader(t) {
    ctx.save(); ctx.globalAlpha *= 0.55; // top machine bar (mostly under IG UI: decorative)
    ln(64, 196, 1016, 196, C.line, 1.5);
    T('UTM-07 // PUSH-OUT FIXTURE', 64, 182, { font: F(500, 22), color: C.dim });
    T('LOAD CELL 500 N · CAL OK', 1016, 182, { font: F(500, 22), color: C.dim, align: 'right' });
    for (let i = 0; i <= 60; i++) ln(64 + i * 15.87, 200, 64 + i * 15.87, i % 5 ? 206 : 212, C.line2, 1);
    ctx.restore();
    const [, sc] = statusOf(t);
    dot(74, 262, 6, sc);
    T('UTM-07 · PUSH-OUT · ROOT FILLING/DENTIN', 92, 270, { font: F(500, 24), color: C.txt2 });
    T('@natebrooksendo', 1016, 270, { font: F(500, 24), color: C.dim, align: 'right' });
    T('PUSH-OUT TEST', 60, 366, { font: F(800, 88), color: C.txt, ls: -1 });
    const sx = 64, s1 = 'What does the ', s2 = 'MPa', s3 = ' actually measure?', sf = F(500, 36);
    T(s1, sx, 418, { font: sf, color: C.txt2 }); T(s2, sx + tw(s1, sf), 418, { font: F(700, 36), color: C.amber }); T(s3, sx + tw(s1 + s2, sf), 418, { font: sf, color: C.txt2 });
  }

  function drawChrome(t) {
    const boot = seg(t, 0, 0.5, ease.out);
    const [st, sc] = statusOf(t);
    // tabs
    const pi = t >= P.result[0] ? 5 : phaseIndex(t);
    for (let i = 0; i < 5; i++) {
      const x = 64 + i * 192, w = 184, y = 444, act = i === pi, done = i < pi;
      ctx.save(); ctx.globalAlpha *= boot;
      ctx.fillStyle = act ? 'rgba(255,181,71,0.13)' : 'rgba(255,255,255,0.025)'; ctx.beginPath(); ctx.roundRect(x, y, w, 46, 5); ctx.fill();
      ctx.strokeStyle = act ? C.amber : C.line; ctx.lineWidth = act ? 2 : 1.2; ctx.stroke();
      if (act) { ctx.fillStyle = C.amber; ctx.fillRect(x + 8, y + 42, w - 16, 4); }
      ctx.restore();
      if (done) dot(x + 16, y + 23, 5, C.teal, boot);
      T(TABS[i], x + w / 2 + (done ? 8 : 0), y + 34, { font: F(act ? 800 : 600, 30), color: act ? C.amber : done ? C.teal : C.dim, align: 'center', alpha: boot });
    }
    // viewport frame
    panel(VP.x, VP.y, VP.w, VP.h, boot, '#0f1214');
    ctx.save(); ctx.globalAlpha *= boot; ctx.fillStyle = C.panel2; ctx.beginPath(); ctx.roundRect(VP.x + 1, VP.y + 1, VP.w - 2, 38, [6, 6, 0, 0]); ctx.fill(); ctx.restore();
    const [vl, vr] = viewLabel(t);
    tri(82, VP.y + 20, 6, C.dim, boot);
    T(vl, 98, VP.y + 28, { font: F(600, 24), color: C.txt2, alpha: boot });
    if (vr) T(vr, 676, VP.y + 28, { font: F(500, 22), color: C.dim, align: 'right', alpha: boot });
    // status chip
    const cw = tw(st, F(800, 24)) + 44;
    ctx.save(); ctx.globalAlpha *= boot; ctx.fillStyle = Kit.rgba(sc, 0.14); ctx.strokeStyle = sc; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(1004 - cw, VP.y + 7, cw, 26, 4); ctx.fill(); ctx.stroke(); ctx.restore();
    dot(1004 - cw + 14, VP.y + 20, 5, sc, boot);
    T(st, 1004 - cw + 26, VP.y + 29, { font: F(800, 22), color: sc, alpha: boot });
    // time-lapse disclosure chip while the test runs
    if (t >= TC - 0.2 && t < P.inspect[0]) {
      const sa = boot * seg(t, TC - 0.2, TC), sf = F(700, 24), sw = tw('SIM ×10', sf) + 22, sx1 = 1004 - cw - 12;
      ctx.save(); ctx.globalAlpha *= sa; ctx.fillStyle = 'rgba(255,181,71,0.1)'; ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(sx1 - sw, VP.y + 7, sw, 26, 4); ctx.fill(); ctx.stroke(); ctx.restore();
      T('SIM ×10', sx1 - sw / 2, VP.y + 29, { font: sf, color: C.amber, align: 'center', alpha: sa });
    }
    // caption bar
    ctx.save(); ctx.globalAlpha *= boot; ctx.fillStyle = C.panel2; ctx.fillRect(VP.x + 1, 1036, VP.w - 2, 59); ln(VP.x + 1, 1036, VP.x + VP.w - 1, 1036, C.line, 1.5); ctx.restore();
  }

  function drawCaption(t) {
    let shown = false;
    for (const c of CAPTIONS) {
      const a = seg(t, c.a - 0.12, c.a) * (1 - seg(t, c.b, c.b + 0.12));
      if (a <= 0) continue; shown = true;
      const dy = 10 * (1 - ease.out(seg(t, c.a - 0.12, c.a)));
      tri(86, 1066 + dy - 1, 9, C.amber, a);
      rich(c.s, 116, 1078 + dy, F(600, 36), C.txt, a);
    }
    if (!shown && t < 1.7) { const sa = seg(t, 0.3, 0.6) * (1 - seg(t, 1.45, 1.6)); tri(86, 1065, 9, C.dim, sa); T('SYSTEM READY · SPECIMEN LOADED', 116, 1074, { font: F(500, 26), color: C.dim, alpha: sa }); }
  }

  function drawReadouts(t) {
    const boot = seg(t, 0.1, 0.6, ease.out), run = t >= TC && t < TEND + 0.2;
    const f = forceShown(t), d = t < TC ? 0 : dispAt(t);
    const boxes = [
      { lab: 'FORCE', unit: 'N', val: f.toFixed(2), col: run ? C.amber : C.txt, br: debondBracket(t) },
      { lab: 'DISPL.', unit: 'mm', val: d.toFixed(3), col: run ? C.amber : C.txt, br: C.line2 },
      { lab: 'RATE', unit: 'mm/min', val: RATE.toFixed(2), col: run ? C.teal : C.txt2, br: C.line2 },
    ];
    boxes.forEach((b, i) => {
      const x = RO.x + i * 300, w = 286, y = RO.y;
      panel(x, y, w, RO.h, boot, C.panel, b.br);
      T(b.lab, x + 16, y + 32, { font: F(600, 28), color: C.txt2, alpha: boot });
      T(b.unit, x + w - 16, y + 32, { font: F(600, 28), color: C.txt2, align: 'right', alpha: boot });
      T(b.val, x + 16, y + 92, { font: F(800, 54), color: b.col, alpha: boot });
    });
    if (t >= TPK) { const pa = seg(t, TPK, TPK + 0.3) * boot; T('PK ' + FPK.toFixed(2), RO.x + 270, RO.y + 92, { font: F(700, 24), color: C.amber, align: 'right', alpha: pa }); }
    if (run) { // real (not time-lapsed) test time at 0.50 mm/min
      const tr = d / (RATE / 60);
      T('real t', RO.x + 600 + 270, RO.y + 64, { font: F(600, 24), color: C.txt2, align: 'right', alpha: boot });
      T(tr.toFixed(1) + ' s', RO.x + 600 + 270, RO.y + 92, { font: F(600, 24), color: C.txt2, align: 'right', alpha: boot });
    }
  }

  const px = (d) => PA.x0 + (d / PA.dmax) * (PA.x1 - PA.x0);
  const py = (f) => PA.y1 - (f / PA.fmax) * (PA.y1 - PA.y0);
  function drawPlot(t) {
    const boot = seg(t, 0.15, 0.7, ease.out);
    panel(PL.x, PL.y, PL.w, PL.h, boot, C.panel, debondBracket(t));
    T('FORCE vs DISPLACEMENT', PL.x + 16, PL.y + 32, { font: F(600, 26), color: C.txt2, alpha: boot });
    T('toy model · values illustrative', PL.x + PL.w - 16, PL.y + 32, { font: F(500, 22), color: C.dim, align: 'right', alpha: boot });
    if (t >= TPK) T('failure load = peak · real curves vary', PL.x + PL.w - 16, PL.y + 58, { font: F(500, 22), color: C.dim, align: 'right', alpha: boot * seg(t, TPK + 0.15, TPK + 0.45) });
    // grid
    ctx.save(); ctx.globalAlpha *= boot;
    const gp = seg(t, 0.2, 1.0, ease.inOut);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let f = 0; f <= 10; f += 1) { const y = py(f); ctx.moveTo(PA.x0, y); ctx.lineTo(lerp(PA.x0, PA.x1, gp), y); }
    for (let dd = 0; dd <= 0.2801; dd += 0.02) { const x = px(dd); ctx.moveTo(x, PA.y1); ctx.lineTo(x, lerp(PA.y1, PA.y0, gp)); }
    ctx.stroke();
    ctx.strokeStyle = C.line2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PA.x0, PA.y0 - 6); ctx.lineTo(PA.x0, PA.y1); ctx.lineTo(PA.x1 + 6, PA.y1); ctx.stroke();
    ctx.restore();
    for (let f = 0; f <= 10; f += 2) T(String(f), PA.x0 - 12, py(f) + 8, { font: F(500, 24), color: C.txt2, align: 'right', alpha: boot });
    for (let dd = 0; dd <= 0.2501; dd += 0.05) T(dd.toFixed(2), px(dd), PA.y1 + 34, { font: F(500, 24), color: C.txt2, align: 'center', alpha: boot });
    T('N', PA.x0 + 12, PA.y0 + 16, { font: F(700, 28), color: C.txt2, alpha: boot });
    T('mm', PA.x1 + 4, PA.y1 + 34, { font: F(700, 28), color: C.txt2, align: 'right', alpha: boot });
    // pre-test preview: faint dashed ghost of the rising curve + "?" where the peak will be
    const ga = boot * seg(t, 0.3, 0.9) * (1 - seg(t, TC, TC + 0.5));
    if (ga > 0) {
      ctx.save(); ctx.globalAlpha *= ga; ctx.beginPath();
      for (let dd = 0; dd <= 0.15 + 1e-9; dd += 0.002) { const x = px(dd), y = py(forceAt(dd)); dd ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.setLineDash([10, 9]); ctx.lineWidth = 3; ctx.strokeStyle = Kit.rgba(C.amber, 0.24); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      const pu = 0.55 + 0.3 * Math.sin((t / 1.3) * Math.PI * 2), mx = px(DPK), my = py(FPK);
      ctx.save(); ctx.globalAlpha *= ga * pu; ctx.translate(mx, my); ctx.rotate(Math.PI / 4); ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.strokeRect(-8, -8, 16, 16); ctx.restore();
      T('? N', mx + 22, my + 10, { font: F(700, 30), color: C.amber, alpha: ga * (0.6 + 0.4 * pu) });
      const ps = 'PEAK FORCE → ? MPa', pf = F(600, 30), pw = richW(ps, pf);
      rich(ps, 720 - pw / 2, 1452, pf, C.txt2, ga);
    }
    if (t < TC) return;
    // curve
    const dNow = dispAt(t), pts = [];
    for (let dd = 0; dd <= dNow + 1e-9; dd += 0.0008) pts.push([px(dd), py(forceAt(dd))]);
    pts.push([px(dNow), py(forceAt(dNow))]);
    const dimAfter = t > P.result[0] ? 0.5 : 1;
    ctx.save(); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.lineJoin = 'round'; ctx.strokeStyle = Kit.rgba(C.amber, 0.22 * dimAfter); ctx.lineWidth = 12; ctx.stroke();
    ctx.strokeStyle = Kit.rgba(C.amber, dimAfter); ctx.lineWidth = 4; ctx.stroke();
    ctx.lineTo(px(dNow), PA.y1); ctx.lineTo(PA.x0, PA.y1); ctx.closePath();
    const fg = ctx.createLinearGradient(0, PA.y0, 0, PA.y1); fg.addColorStop(0, 'rgba(255,181,71,0.16)'); fg.addColorStop(1, 'rgba(255,181,71,0)'); ctx.fillStyle = fg; ctx.fill();
    ctx.restore();
    // live head + crosshair
    if (t < TEND + 0.1) {
      const hx = px(dNow), hy = py(forceAt(dNow));
      ln(hx, hy, hx, PA.y1, C.teal, 1.5, 0.6, [5, 5]); ln(PA.x0, hy, hx, hy, C.teal, 1.5, 0.6, [5, 5]);
      dot(hx, hy, 9, C.amber, 0.3); dot(hx, hy, 5, '#fff7e6');
    }
    // peak marker
    if (t >= TPK) {
      const pa = seg(t, TPK, TPK + 0.25), x = px(DPK), y = py(FPK);
      const pulse = t > 14.5 && t < 15.1 ? 1 + 0.6 * Math.sin(Math.PI * seg(t, 14.5, 15.1)) : 1;
      ctx.save(); ctx.globalAlpha *= pa; ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = C.amber; ctx.fillRect(-7 * pulse, -7 * pulse, 14 * pulse, 14 * pulse); ctx.restore();
      T('F max ' + FPK.toFixed(2) + ' N', x + 20, y - 4, { font: F(700, 30), color: C.amber, alpha: pa });
      const db = seg(t, TPK + 0.05, TPK + 0.3);
      T('debond', px(DPK + 0.006) + 12, py(1.9) - 26, { font: F(700, 30), color: C.red, alpha: db * (t < P.result[0] ? 1 : 0.6) });
    }
  }

  function drawFooter(t, k) { // under IG UI: decorative telemetry
    ctx.save(); ctx.globalAlpha *= 0.6;
    ln(64, 1606, 1016, 1606, C.line, 1.5);
    T('SPECIMEN 07 · MID-ROOT · h 1.00 mm · PLUNGER Ø 0.70 mm · 0.50 mm/min', 64, 1640, { font: F(500, 22), color: C.dim });
    const x0 = 64, x1 = 1016, y = 1672;
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x0, y, x1 - x0, 6);
    ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = C.amber; ctx.fillRect(x0, y, (x1 - x0) * clamp(t / DUR), 6); ctx.restore();
    [P.slice, P.mount, P.load, P.inspect, P.calc, P.result].forEach((p) => ln(x0 + (x1 - x0) * p[0] / DUR, y - 4, x0 + (x1 - x0) * p[0] / DUR, y + 10, C.line2, 2));
    const mm = Math.floor(t / 60), ss = (t % 60).toFixed(1).padStart(4, '0');
    T(`T+0${mm}:${ss}`, 1016, 1712, { font: F(600, 22), color: C.dim, align: 'right', alpha: k });
    ctx.restore();
  }

  // ------------------------------------------------------------------ result card
  const CARD = { x: 96, y: 556, w: 848, h: 992 };
  function drawResult(t, k) {
    const t0 = P.result[0];
    if (t < t0) return;
    const ca = seg(t, t0 + 0.06, t0 + 0.36, ease.out) * k;
    ctx.save(); ctx.globalAlpha *= ca; ctx.fillStyle = 'rgba(9,10,12,0.88)'; ctx.fillRect(0, 440, W, 1160); ctx.restore();
    const { x, y, w, h } = CARD, cx = x + w / 2;
    const nf = F(800, 150), uf = F(700, 56), num = SIGMA.toFixed(2), nw = tw(num, nf), uw = tw('MPa', uf), sx = cx - (nw + 22 + uw) / 2, NY = y + 214;
    ctx.save(); ctx.globalAlpha *= ca;
    ctx.fillStyle = '#121518'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.strokeStyle = C.line2; ctx.lineWidth = 1.5; ctx.stroke();
    brackets(x - 6, y - 6, w + 12, h + 12, 26, C.amber, 3);
    ctx.fillStyle = 'rgba(255,181,71,0.08)'; ctx.fillRect(x + 1, y + 1, w - 2, 60);
    T('REPORT · SPECIMEN 07', x + 28, y + 40, { font: F(700, 26), color: C.amber });
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= k;
    // the calc's tau box morphs into the report number
    const mu = ease.inOut(seg(t, t0, t0 + 0.4));
    if (t < t0 + 0.4) {
      const r0 = TBOX, r1 = { x: sx - 28, y: NY - 132, w: nw + 22 + uw + 56, h: 164 };
      const rx = lerp(r0.x, r1.x, mu), ry = lerp(r0.y, r1.y, mu), rw = lerp(r0.w, r1.w, mu), rh = lerp(r0.h, r1.h, mu), ba = 1 - seg(mu, 0.6, 1);
      ctx.save(); ctx.globalAlpha *= ba; ctx.fillStyle = 'rgba(255,181,71,0.1)'; ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 8); ctx.fill(); ctx.stroke(); ctx.restore();
      const fa = 1 - seg(t, t0, t0 + 0.12), x0 = CX + 6, y0 = TBOX.y + 56;
      T('τ = ', x0, y0, { font: TAU_F, color: C.amber, alpha: fa });
      T(' MPa', x0 + tw('τ = ' + num, TAU_F), y0, { font: TAU_F, color: C.amber, alpha: fa });
      T('1 N/mm²', TBOX.x + TBOX.w - 12, TBOX.y + 32, { font: F(500, 24), color: C.txt2, align: 'right', alpha: fa });
      T('= 1 MPa', TBOX.x + TBOX.w - 12, TBOX.y + 62, { font: F(500, 24), color: C.txt2, align: 'right', alpha: fa });
      const fs = lerp(50, 150, mu), nx = lerp(x0 + tw('τ = ', TAU_F), sx, mu), ny = lerp(y0, NY, mu);
      T(num, nx, ny, { font: F(800, fs.toFixed(1)), color: mixc(C.amber, C.txt, mu) });
    } else {
      T(num, sx, NY, { font: nf, color: C.txt });
    }
    const ua = seg(t, t0 + 0.3, t0 + 0.5, ease.out), sa = seg(t, t0 + 0.35, t0 + 0.55, ease.out), ea = seg(t, t0 + 0.4, t0 + 0.6, ease.out);
    T('MPa', sx + nw + 22, NY, { font: uf, color: C.txt2, alpha: ua });
    { // sub-line: "illustrative" sits right under the number
      const f26 = F(500, 26), s1 = 'illustrative', s2 = ' · τ = F / A · one slice, one lab', ww = tw(s1 + s2, f26), lx = cx - ww / 2;
      T(s1, lx, y + 262, { font: F(600, 26), color: C.amber, alpha: sa }); T(s2, lx + tw(s1, f26), y + 262, { font: f26, color: C.txt2, alpha: sa });
    }
    T('Mean shear stress to dislodge the filling:', cx, y + 318, { font: F(600, 30), color: C.txt, align: 'center', alpha: ea });
    T('adhesion + friction + interlock', cx, y + 356, { font: F(600, 30), color: C.txt, align: 'center', alpha: ea });
    ln(x + 40, y + 390, x + w - 40, y + 390, C.line2, 1.5, ea);
    const r1 = seg(t, t0 + 0.6, t0 + 0.8, ease.out), r2 = seg(t, t0 + 0.75, t0 + 0.95, ease.out), r3 = seg(t, t0 + 0.95, t0 + 1.15, ease.out), r4 = seg(t, t0 + 1.1, t0 + 1.3, ease.out);
    T('A LAB NUMBER.', cx, y + 478 + 12 * (1 - r1), { font: F(800, 76), color: C.amber, align: 'center', alpha: r1 });
    T('Compare within a study,', cx, y + 546 + 12 * (1 - r2), { font: F(600, 46), color: C.txt, align: 'center', alpha: r2 });
    T('not across studies.', cx, y + 602 + 12 * (1 - r2), { font: F(600, 46), color: C.txt, align: 'center', alpha: r2 });
    ln(x + 40, y + 640, x + w - 40, y + 640, C.line2, 1.5, r3);
    T('Clinical relevance: unproven.', cx, y + 696, { font: F(700, 36), color: C.teal, align: 'center', alpha: r3 });
    T('no link to seal or outcomes shown', cx, y + 734, { font: F(500, 26), color: C.txt2, align: 'center', alpha: r3 });
    T('Slice thickness, root third, core material,', cx, y + 794, { font: F(500, 26), color: C.txt2, align: 'center', alpha: r4 });
    T('plunger size, load speed, storage & area', cx, y + 828, { font: F(500, 26), color: C.txt2, align: 'center', alpha: r4 });
    T('formula all shift the MPa.', cx, y + 862, { font: F(500, 26), color: C.txt2, align: 'center', alpha: r4 });
    T('Collares 2016 IEJ · Gesi 2005 JOE · Pane 2013 JOE', cx, y + 914, { font: F(500, 22), color: C.dim, align: 'center', alpha: r4 });
    T('Brichko 2018 JOE · Moinzadeh 2015 IEJ', cx, y + 942, { font: F(500, 22), color: C.dim, align: 'center', alpha: r4 });
    ctx.restore();
  }

  // ------------------------------------------------------------------ frame
  function render(t) {
    t = clamp(t, 0, DUR);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(BG, 0, 0);
    const k = 1 - seg(t, OUT0, DUR, ease.inOut); // outro: everything but the header eases back to the t = 0 look
    drawHeader(t);
    ctx.save(); ctx.globalAlpha = k;
    drawChrome(t);
    ctx.save(); ctx.beginPath(); ctx.rect(DA.x + 1, DA.y, DA.w - 2, DA.h); ctx.clip();
    drawSpecimen(t);
    drawSection(t);
    drawFlipTag(t);
    drawInspect(t);
    drawCalc(t);
    // viewport crop marks / crosshair (camera feel)
    brackets(DA.x + 14, DA.y + 12, DA.w - 28, DA.h - 24, 26, 'rgba(255,255,255,0.18)', 2, seg(t, 0.2, 0.6) * (1 - seg(t, 4.9, 5.3)));
    ctx.restore();
    drawCaption(t);
    drawReadouts(t);
    drawPlot(t);
    drawFlyGhost(t);
    ctx.restore();
    drawFooter(t, k);
    drawResult(t, k);
  }

  window.REEL = {
    title: 'Push-out bond strength',
    duration: DUR,
    poster: 9.3,
    canvas,
    fonts: ['800 88px "JetBrains Mono"', '700 40px "JetBrains Mono"', '600 30px "JetBrains Mono"', '500 26px "JetBrains Mono"', '400 24px "JetBrains Mono"', '600 38px "JetBrains Mono"'],
    setup() {
      BG = buildBG(); ROOTT = buildRoot(); DISKT = buildDisk(); SECT = buildSection(); PLUGT = buildPlug(); IFACET = buildIface();
    },
    render,
  };
  Kit.boot(window.REEL);
})();
