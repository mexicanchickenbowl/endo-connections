/*
 * 41 · Seven factors influencing periapical healing after nonsurgical root canal treatment.
 * Style: stained-glass rose window in a dark stone wall. One Canvas 2D frame, deterministic render(t).
 * Source of the list: Ng & Gulabivala, "Evaluation of Outcomes", ch. 17 in Cohen's Pathways of the Pulp, 12th ed.
 *
 * Everything in the window is drawn in "design units" (glass radius 372) and scaled by WIN.S.
 * Glass is built once in setup(): every piece is clipped, filled with a tonal gradient, mottled and streaked with
 * procedural noise, edge-shaded and bevel-lit; lead cames and painted lines go on a separate layer that stays dark.
 */
(() => {
  'use strict';
  const { W, H, clamp, lerp, seg, ease, hash } = Kit;
  const { canvas, ctx } = Kit.createCanvas();
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ content
  const PANES = [
    { col: '#c8182f', deep: '#7a0c1e', pale: '#f3d3d3', txt: '#ff8492' }, // 1 ruby
    { col: '#eaa21e', deep: '#a5620b', pale: '#f8e6b4', txt: '#ffc85a' }, // 2 amber
    { col: '#1f9c5b', deep: '#0d5a35', pale: '#d3ecd6', txt: '#68e3a5' }, // 3 emerald
    { col: '#2c62d6', deep: '#16398c', pale: '#d2ddf6', txt: '#8ab7ff' }, // 4 sapphire
    { col: '#8746c4', deep: '#4e2482', pale: '#e1d3f3', txt: '#cda6ff' }, // 5 amethyst
    { col: '#14a0a8', deep: '#09616b', pale: '#daeff0', txt: '#66e2e8' }, // 6 teal
    { col: '#d4447f', deep: '#8a1e4d', pale: '#f6d4e1', txt: '#ff97c4' }, // 7 rose
  ];
  const ROWS = [
    { name: 'Periapical lesion: presence, size', good: 'none, or smaller' },
    { name: 'Patency at the canal terminus', good: 'achieved' },
    { name: 'Apical extent of preparation', good: 'flush', sub: 'flush: root filling 0–2 mm within the radiographic apex' },
    { name: 'Intraoperative culture test', good: 'negative', sub: 'a prognostic factor, though not routine practice' },
    { name: 'Iatrogenic perforation', good: 'none' },
    { name: 'Root-filling quality on radiograph', good: 'good, no voids' },
    { name: 'Final coronal restoration', good: 'good quality' },
  ];
  const SOURCE = 'Ng & Gulabivala, in Cohen’s Pathways of the Pulp, 12th ed., ch. 17';

  // ------------------------------------------------------------------ timeline
  // each pane/row holds the stage for a time in proportion to the words it carries (rows 3 and 4 have a second line)
  const T0 = 1.0, SLOTS = [3.2, 2.9, 5.0, 4.2, 2.3, 3.2, 1.9];
  const STARTS = SLOTS.map((_, k) => +(T0 + SLOTS.slice(0, k).reduce((a, b) => a + b, 0)).toFixed(3));
  const start = (k) => STARTS[k];
  const TALL = start(6) + SLOTS[6];    // all seven have had their turn
  const OUT0 = TALL + 0.8 + 4.0;       // end of the summary hold (4.0 s with every pane fully lit)
  const DUR = OUT0 + 0.8;

  // ------------------------------------------------------------------ geometry
  const WIN = { cx: 540, cy: 747, S: 0.84 };
  const RG = 372, RS = 411;            // glass radius, stone surround radius (design units)
  const RC = 88, RCR = 101;            // centre disc, centre border ring
  const N = 7, SEC = TAU / N, HALF = SEC / 2;
  const ALPHA = HALF - 0.03, PIN = 108, PTOP = 362;
  const PD = PTOP / (1 + Math.sin(ALPHA)), PR = PD * Math.sin(ALPHA);
  const MED = { d: 258, ro: 95, ri: 84 };
  const NUM = { d: 139, r: 27 };
  const OS = Math.ceil((RS + 70) * WIN.S) * 2;
  const TB = { x: 60, y: 1102, w: 944, h: 452 };
  const XN = 96, XT = 126, XR = 954;   // tablet columns: numeral, factor name, right edge of the direction
  const FLOOR = 1662;                  // where the wall meets the floor (decoration only, below the safe area)
  const rowY = (i) => TB.y + 49 + 36 + i * 47 + (i > 2 ? 35 : 0) + (i > 3 ? 35 : 0);

  const GOLD = '#f3c24d', IVORY = '#efd493', CANAL = '#6a2a22';
  const CREAM = '#f5eddb', GILT = '#f0cd78';

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function shade(c, f) {
    const [r, g, b] = Kit.hex(c);
    if (f >= 1) { const u = Math.min(1, f - 1); return `rgb(${(r + (255 - r) * u) | 0},${(g + (255 - g) * u) | 0},${(b + (255 - b) * u) | 0})`; }
    return `rgb(${(r * f) | 0},${(g * f) | 0},${(b * f) | 0})`;
  }

  // periodic value noise (tiles with period P) so textures can be used as repeating patterns
  function pnoise(x, y, P, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const m = (n) => ((n % P) + P) % P;
    const a = hash(m(xi), m(yi), seed), b = hash(m(xi + 1), m(yi), seed), c = hash(m(xi), m(yi + 1), seed), d = hash(m(xi + 1), m(yi + 1), seed);
    return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
  }
  function makeTex(size, fn) {
    const c = mk(size, size), x = c.getContext('2d'), im = x.createImageData(size, size), d = im.data;
    for (let j = 0, p = 0; j < size; j++) for (let i = 0; i < size; i++, p += 4) {
      const v = clamp(fn(i, j)) * 255; d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = 255;
    }
    x.putImageData(im, 0, 0); return c;
  }

  // ------------------------------------------------------------------ glass builder
  let L = null, seedCtr = 1, patMottle = null, patStreak = null;
  const CAME = [];
  /** one piece of glass: path(c) builds the outline; o.clip optionally intersects it */
  function G(path, col, o = {}) {
    const g = L, seed = o.seed != null ? o.seed : seedCtr++, M = g.getTransform();
    g.save();
    if (o.clip) { g.beginPath(); o.clip(g); g.clip(); }
    g.beginPath(); path(g); g.clip();
    const R = o.R || 110, ox = o.ox || 0, oy = o.oy || 0, a = hash(seed, 11) * TAU;
    const gr = g.createLinearGradient(ox - Math.cos(a) * R, oy - Math.sin(a) * R, ox + Math.cos(a) * R, oy + Math.sin(a) * R);
    gr.addColorStop(0, shade(col, 1 + (o.hi != null ? o.hi : 0.2)));
    gr.addColorStop(0.5, col);
    gr.addColorStop(1, shade(col, 1 - (o.lo != null ? o.lo : 0.24)));
    g.fillStyle = gr; g.fillRect(-900, -900, 1800, 1800);
    // mottling and streaks (procedural noise, different offset / direction per piece)
    g.globalCompositeOperation = 'overlay';
    patMottle.setTransform(new DOMMatrix().translateSelf(hash(seed, 1) * 400, hash(seed, 2) * 400).rotateSelf(hash(seed, 3) * 360).scaleSelf(0.75 + hash(seed, 6) * 0.6));
    g.globalAlpha = o.mottle != null ? o.mottle : 0.62; g.fillStyle = patMottle; g.fillRect(-900, -900, 1800, 1800);
    patStreak.setTransform(new DOMMatrix().translateSelf(hash(seed, 4) * 400, hash(seed, 5) * 400).rotateSelf(hash(seed, 7) * 360));
    g.globalAlpha = o.streak != null ? o.streak : 0.5; g.fillStyle = patStreak; g.fillRect(-900, -900, 1800, 1800);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // darker toward the leads, then a thin bevel highlight on the upper-left inner edge
    g.beginPath(); path(g);
    g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 9; g.strokeStyle = 'rgba(0,0,0,0.42)'; g.lineWidth = 4; g.stroke();
    g.shadowColor = 'transparent'; g.shadowBlur = 0;
    g.translate(3.3, 3.3); g.beginPath(); path(g);
    g.strokeStyle = 'rgba(255,255,255,0.34)'; g.lineWidth = 1.5; g.stroke();
    g.restore();
    // a piece hides the leads of whatever lies under it (painter's order), then gets its own lead
    CAME.push({ M, path, clip: o.clip, w: o.lead === 0 ? 0 : (o.lead || 4.5), cover: o.lead !== 0 || !!o.cover });
  }
  /** dark vitreous paint line (never lit) */
  const paint = (path, w = 2.6, color = '#2a1610', clip) => CAME.push({ M: L.getTransform(), path, clip, w, color, paint: true });
  /** lead line that is not the outline of a piece */
  const leadLine = (path, w, clip) => CAME.push({ M: L.getTransform(), path, clip, w });

  function renderCames(c) {
    for (const k of CAME) {
      c.save(); c.setTransform(k.M);
      if (k.clip) { c.beginPath(); k.clip(c); c.clip(); }
      if (k.draw) k.draw(c);
      else {
        if (k.cover) { c.globalCompositeOperation = 'destination-out'; c.beginPath(); k.path(c); c.fill(); c.globalCompositeOperation = 'source-over'; }
        if (k.w > 0) {
          c.beginPath(); k.path(c); c.lineWidth = k.w; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = k.color || '#0b0a0d'; c.stroke();
          if (!k.paint && k.w >= 4) { // faint sheen along the lead
            c.translate(-0.9, -0.9); c.beginPath(); k.path(c); c.lineWidth = 1; c.strokeStyle = 'rgba(160,168,190,0.34)'; c.stroke();
          }
        }
      }
      c.restore();
    }
  }

  // ------------------------------------------------------------------ shapes
  function sectorPath(c, r0, r1, a0, a1) { c.arc(0, 0, r1, a0, a1, false); c.arc(0, 0, r0, a1, a0, true); c.closePath(); }
  /** petal in its own frame (axis = -y): radial sides, round-arched head */
  function petalPath(c, inset = 0) {
    const a = ALPHA, u = [Math.sin(a), -Math.cos(a)], n = [-Math.cos(a), -Math.sin(a)];
    const rt = PD * Math.cos(a), ri = PIN + inset;
    const p = (r, s) => [s * (r * u[0] + inset * n[0]), r * u[1] + inset * n[1]];
    const [x0, y0] = p(ri, 1), [x1, y1] = p(rt, 1), [x2, y2] = p(ri, -1);
    c.moveTo(x0, y0); c.lineTo(x1, y1);
    c.arc(0, -PD, PR - inset, a, Math.PI - a, true);
    c.lineTo(x2, y2);
    c.arc(0, 0, Math.hypot(x2, y2), Math.atan2(y2, x2), Math.atan2(y0, x0), false);
    c.closePath();
  }
  /** tapered root with a rounded apex whose tip is at y = apex */
  function root(c, x, top, apex, wt, wa) {
    const cy = apex - wa;
    c.moveTo(x - wt, top);
    c.bezierCurveTo(x - wt, lerp(top, cy, 0.55), x - wa * 1.7, lerp(top, cy, 0.82), x - wa, cy);
    c.arc(x, cy, wa, Math.PI, 0, true);
    c.bezierCurveTo(x + wa * 1.7, lerp(top, cy, 0.82), x + wt, lerp(top, cy, 0.55), x + wt, top);
    c.closePath();
  }
  function star(c, x, y, ro, ri, n) {
    for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    c.closePath();
  }
  function zig(c, x0, y0, x1, y1, n, amp) {
    const dx = (x1 - x0) / n, dy = (y1 - y0) / n, len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    c.moveTo(x0 + nx * amp, y0 + ny * amp);
    for (let i = 1; i <= n; i++) { const s = i % 2 ? -1 : 1; c.lineTo(x0 + dx * i + nx * amp * s, y0 + dy * i + ny * amp * s); }
  }

  // ------------------------------------------------------------------ pictograms (medallion frame, disc radius MED.ri)
  const DISC = (c) => c.arc(0, 0, MED.ri, 0, TAU);
  const g2 = (path, col, o = {}) => G(path, col, { clip: DISC, R: 95, ...o });
  const p2 = (path, w, color) => paint(path, w, color, DISC);
  const PICTO = [
    // 1 · periapical lesion: presence and size (small and large radiolucency around the apex)
    () => {
      g2((c) => c.arc(0, 24, 53, 0, TAU), '#f4a0ad', { lead: 3.5 });
      g2((c) => c.arc(0, 24, 29, 0, TAU), '#c8182f', { lead: 3.5 });
      g2((c) => root(c, 0, -96, 30, 33, 11), IVORY);
      p2((c) => { c.moveTo(0, -90); c.lineTo(0, 17); }, 3.2, '#2a110b');
    },
    // 2 · patency: a fine file passes through the canal terminus
    () => {
      g2((c) => root(c, 0, -96, 40, 52, 16), IVORY);
      g2((c) => root(c, 0, -96, 42, 19, 7.5), CANAL, { lead: 3 });
      g2((c) => { c.moveTo(-6, -96); c.lineTo(6, -96); c.lineTo(2.6, 60); c.lineTo(0, 70); c.lineTo(-2.6, 60); c.closePath(); }, '#eef3fb', { lead: 2, mottle: 0.25, streak: 0.2, hi: 0.3, lo: 0.1 });
      p2((c) => { for (let y = -86; y < 44; y += 13) { const w = lerp(4.6, 2.2, (y + 86) / 130); c.moveTo(-w, y); c.lineTo(w, y + 6); } }, 1.2, '#2c3648');
    },
    // 3 · apical extent of the preparation measured against the radiographic apex
    () => {
      g2((c) => root(c, -18, -96, 44, 41, 13), IVORY);
      g2((c) => root(c, -18, -96, 32, 13, 5), '#1f9c5b', { lead: 3 });
      g2((c) => c.rect(33, -74, 25, 138), GOLD, { lead: 3.5 });
      p2((c) => { for (let i = 0; i < 10; i++) { const y = 44 - i * 12; c.moveTo(33, y); c.lineTo(33 + (i % 2 ? 9 : 16), y); } }, 2.2, '#3a2408');
      p2((c) => { for (let x = -16; x < 30; x += 9) { c.moveTo(x, 44); c.lineTo(x + 4.5, 44); } }, 2.4, '#3a2408');
    },
    // 4 · culture test: a streaked plate
    () => {
      g2((c) => c.arc(0, 0, 73, 0, TAU), '#bcd4f4', { lead: 4 });
      g2((c) => c.arc(0, 0, 63, 0, TAU), '#c9432c', { lead: 3.2, hi: 0.12 });
      // one serpentine streak with colonies thinning out along it
      p2((c) => { c.moveTo(-46, -26); c.bezierCurveTo(-10, -52, 30, -44, 42, -22); c.bezierCurveTo(52, -2, -40, -14, -42, 10); c.bezierCurveTo(-44, 34, 34, 12, 38, 30); c.bezierCurveTo(40, 44, 6, 50, -12, 46); }, 2.4, '#3a1208');
      const dots = [[-44, -27, 9.5], [-22, -42, 9], [2, -45, 8.5], [25, -39, 8], [42, -20, 7.5], [22, -8, 6.5], [-8, -6, 6], [-36, 2, 5.5], [-30, 26, 5], [0, 22, 4.5], [30, 20, 4], [22, 42, 3.5]];
      for (const [x, y, r] of dots) { g2((c) => c.arc(x, y, r, 0, TAU), '#fff3c8', { lead: 0, cover: true, mottle: 0.15, streak: 0.15, hi: 0.3, lo: 0.08 }); p2((c) => c.arc(x, y, r, 0, TAU), 1.5, '#3a1208'); }
    },
    // 5 · iatrogenic perforation through the root wall
    () => {
      g2((c) => root(c, -8, -96, 72, 42, 13), IVORY);
      g2((c) => root(c, -8, -96, 58, 12, 4.5), CANAL, { lead: 3 });
      g2((c) => { c.moveTo(-10, -30); c.lineTo(34, -6); c.lineTo(30, 10); c.lineTo(-12, -12); c.closePath(); }, CANAL, { lead: 2.6 });
      g2((c) => star(c, 43, 5, 27, 12, 8), '#e2203f', { lead: 3 });
      g2((c) => c.arc(43, 5, 6.5, 0, TAU), '#ffd766', { lead: 2 });
    },
    // 6 · root-filling quality as seen on the radiograph: a dense, even filling
    () => {
      g2(DISC, '#17223f', { lead: 0, R: 90 });
      g2((c) => root(c, 0, -96, 62, 45, 14), '#5a79b4');
      g2((c) => root(c, 0, -96, 50, 14, 5), '#fffbe8', { lead: 3, mottle: 0.2, streak: 0.2, hi: 0.3, lo: 0.08 });
    },
    // 7 · final coronal restoration over the root-filled tooth
    () => {
      g2((c) => {
        c.moveTo(-46, -8); c.lineTo(46, -8); c.bezierCurveTo(48, 30, 42, 70, 32, 100); c.lineTo(17, 100);
        c.bezierCurveTo(15, 62, 10, 36, 0, 30); c.bezierCurveTo(-10, 36, -15, 62, -17, 100); c.lineTo(-32, 100);
        c.bezierCurveTo(-42, 70, -48, 30, -46, -8); c.closePath();
      }, IVORY);
      for (const s of [-1, 1]) g2((c) => { c.moveTo(s * 15, -8); c.lineTo(s * 25, -8); c.quadraticCurveTo(s * 31, 40, s * 27, 100); c.lineTo(s * 22, 100); c.quadraticCurveTo(s * 24, 40, s * 15, -8); c.closePath(); }, '#ea6a4f', { lead: 2.4 });
      g2((c) => {
        c.moveTo(-51, -5); c.bezierCurveTo(-67, -30, -58, -64, -37, -66); c.bezierCurveTo(-24, -68, -15, -55, 0, -55);
        c.bezierCurveTo(15, -55, 24, -68, 37, -66); c.bezierCurveTo(58, -64, 67, -30, 51, -5); c.closePath();
      }, GOLD, { lead: 4.5 });
      p2((c) => { c.moveTo(-40, -22); c.quadraticCurveTo(0, -12, 40, -22); }, 2, '#4a3003');
    },
  ];

  // ------------------------------------------------------------------ layers built in setup()
  let bg, dimWin, cameLayer, paneLit = [], paneBloom = [], beams = [], pools = [];

  function buildWindow() {
    const mottle = makeTex(256, (x, y) => 0.5 + 0.34 * pnoise(x / 32, y / 32, 8, 1) + 0.2 * pnoise(x / 12.8, y / 12.8, 20, 2) + 0.1 * pnoise(x / 4, y / 4, 64, 3));
    const streak = makeTex(256, (x, y) => 0.5 + 0.3 * pnoise(x / 64, y / 4, 4, 4) + 0.2 * pnoise(x / 32, y / 2, 8, 5) + 0.08 * pnoise(x / 2, y / 2, 128, 6));
    const lit = mk(OS, OS); L = lit.getContext('2d');
    patMottle = L.createPattern(mottle, 'repeat'); patStreak = L.createPattern(streak, 'repeat');
    L.translate(OS / 2, OS / 2); L.scale(WIN.S, WIN.S);
    const up = -Math.PI / 2;

    for (let k = 0; k < N; k++) {
      const P = PANES[k], ak = up + k * SEC;
      L.save(); L.rotate(ak + Math.PI / 2);
      // ground of the pane in its own deep jewel tone, with a small gold boss in each spandrel
      G((c) => sectorPath(c, RCR, RG, up - HALF, up + HALF), P.deep, { R: 280, oy: -240, lead: 0, lo: 0.3, hi: 0.12 });
      for (const s of [-1, 1]) { const a = up + s * (HALF - 0.115); G((c) => c.arc(Math.cos(a) * 337, Math.sin(a) * 337, 10.5, 0, TAU), GOLD, { R: 14, ox: Math.cos(a) * 337, oy: Math.sin(a) * 337, lead: 3 }); }
      // petal: cobalt border band, bright field, a slightly different tone at the foot
      G((c) => petalPath(c, 0), '#1c2e8a', { R: 150, oy: -235, lead: 6.5 });
      G((c) => petalPath(c, 10), P.col, { R: 150, oy: -235, lead: 3.2, hi: 0.3 });
      G((c) => petalPath(c, 10), shade(P.col, 0.82), { clip: (c) => c.arc(0, 0, 170, 0, TAU), R: 70, oy: -140, lead: 0 });
      leadLine((c) => c.arc(0, 0, 170, up - HALF, up + HALF), 3.2, (c) => petalPath(c, 10));
      L.restore();
      // pictogram medallion (upright)
      L.save(); L.translate(Math.cos(ak) * MED.d, Math.sin(ak) * MED.d);
      G((c) => c.arc(0, 0, MED.ro, 0, TAU), GOLD, { R: MED.ro, lead: 5.5 });
      G(DISC, P.pale, { R: MED.ri, lead: 4, hi: 0.3, lo: 0.14, mottle: 0.5 });
      PICTO[k]();
      L.restore();
      // numeral roundel
      L.save(); L.translate(Math.cos(ak) * NUM.d, Math.sin(ak) * NUM.d);
      G((c) => c.arc(0, 0, NUM.r, 0, TAU), '#ffe7a0', { R: NUM.r, lead: 4.5, mottle: 0.35, streak: 0.3 });
      CAME.push({ M: L.getTransform(), draw: (c) => { c.font = '700 41px Fraunces'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = '#1a0e07'; c.fillText(String(k + 1), 0, 14.5); } });
      L.restore();
    }

    // centre pane: a root apex with the periapical tissues as a golden nimbus
    const CD = (c) => c.arc(0, 0, RC, 0, TAU);
    for (let i = 0; i < 14; i++) G((c) => sectorPath(c, RC, RCR, i * TAU / 14, (i + 1) * TAU / 14), i % 2 ? '#c8182f' : GOLD, { R: 105, lead: 2.6 });
    const qa = Array.from({ length: 10 }, (_, i) => i * TAU / 9 + (hash(i, 55) - 0.5) * 0.3 + 0.2);
    for (let i = 0; i < 9; i++) G((c) => { c.moveTo(0, 14); c.arc(0, 14, 220, qa[i], i === 8 ? qa[0] + TAU : qa[i + 1]); c.closePath(); }, ['#1b5f93', '#2478aa', '#1a4f86'][i % 3], { clip: CD, R: 95, lead: 2.8 });
    for (let i = 0; i < 16; i++) G((c) => { c.moveTo(0, 16); c.arc(0, 16, 58, i * TAU / 16, (i + 1) * TAU / 16); c.closePath(); }, i % 2 ? '#ffc93e' : '#ffe58a', { clip: CD, R: 60, oy: 16, lead: 2.2, mottle: 0.4 });
    G((c) => c.arc(0, 16, 37, 0, TAU), '#fff8dc', { clip: CD, R: 40, oy: 16, lead: 3, mottle: 0.3, streak: 0.3, hi: 0.4, lo: 0.06 });
    G((c) => root(c, 0, -100, 22, 35, 11.5), IVORY, { clip: CD, R: 80, oy: -40, lead: 4.5 });
    G((c) => root(c, 0, -100, 12, 9, 3.4), '#b5142b', { clip: CD, R: 60, oy: -40, lead: 2.2 });

    // structural leads on top
    for (let k = 0; k < N; k++) { const a = up + HALF + k * SEC; leadLine((c) => { c.moveTo(Math.cos(a) * RCR, Math.sin(a) * RCR); c.lineTo(Math.cos(a) * RG, Math.sin(a) * RG); }, 9); }
    leadLine((c) => c.arc(0, 0, RC, 0, TAU), 5);
    leadLine((c) => c.arc(0, 0, RCR, 0, TAU), 8);
    leadLine((c) => c.arc(0, 0, RG - 2, 0, TAU), 9);

    cameLayer = mk(OS, OS);
    const cc = cameLayer.getContext('2d');
    renderCames(cc);
    // soft shadow cast by the stone reveal onto the rim of the glass
    cc.setTransform(WIN.S, 0, 0, WIN.S, OS / 2, OS / 2);
    const rs = cc.createRadialGradient(8, 10, RG - 46, 0, 0, RG);
    rs.addColorStop(0, 'rgba(0,0,0,0)'); rs.addColorStop(1, 'rgba(0,0,0,0.55)');
    cc.fillStyle = rs; cc.beginPath(); cc.arc(0, 0, RG, 0, TAU); cc.fill();

    // per-pane lit sprites (0 = centre, 1..7 = petals) and their blurred bloom
    for (let k = 0; k <= N; k++) {
      const c = mk(OS, OS), x = c.getContext('2d');
      x.translate(OS / 2, OS / 2); x.scale(WIN.S, WIN.S); x.beginPath();
      if (k === 0) x.arc(0, 0, RCR, 0, TAU);
      else { const a = up + (k - 1) * SEC; sectorPath(x, RCR, RG, a - HALF, a + HALF); }
      x.clip(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(lit, 0, 0);
      paneLit.push(c);
      const b = mk(OS / 2, OS / 2), bx = b.getContext('2d');
      bx.filter = 'blur(11px) saturate(1.3)'; bx.drawImage(c, 0, 0, OS / 2, OS / 2);
      paneBloom.push(b);
    }
    // unlit window: the same glass seen with no light behind it
    dimWin = mk(OS, OS);
    const d = dimWin.getContext('2d');
    d.drawImage(lit, 0, 0);
    d.globalCompositeOperation = 'source-atop';
    d.fillStyle = 'rgba(7,9,20,0.84)'; d.fillRect(0, 0, OS, OS);
    const sh = d.createLinearGradient(OS * 0.2, OS * 0.1, OS * 0.8, OS * 0.9);
    sh.addColorStop(0, 'rgba(150,170,220,0.10)'); sh.addColorStop(0.35, 'rgba(150,170,220,0.02)'); sh.addColorStop(0.6, 'rgba(150,170,220,0.07)'); sh.addColorStop(1, 'rgba(150,170,220,0)');
    d.fillStyle = sh; d.fillRect(0, 0, OS, OS);
    L = null;
  }

  function buildLight() {
    // soft shaft of light, drawn once in white and tinted per pane
    const bw = 460, bh = 820, raw = mk(bw, bh), r = raw.getContext('2d');
    for (let i = 0; i < 9; i++) {
      const u = (i + 0.5) / 9 - 0.5, w0 = 7 + hash(i, 91) * 11, a = 0.25 + hash(i, 92) * 0.5;
      const gr = r.createLinearGradient(0, 40, 0, bh - 30);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.16, `rgba(255,255,255,${a})`); gr.addColorStop(0.55, `rgba(255,255,255,${a * 0.4})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      r.fillStyle = gr; r.beginPath();
      r.moveTo(bw / 2 + u * 150 - w0, 40); r.lineTo(bw / 2 + u * 150 + w0, 40);
      r.lineTo(bw / 2 + u * 330 + w0 * 2.4, bh - 30); r.lineTo(bw / 2 + u * 330 - w0 * 2.4, bh - 30); r.fill();
    }
    const soft = mk(bw, bh), s = soft.getContext('2d');
    s.filter = 'blur(9px)'; s.drawImage(raw, 0, 0);
    const pw = 560, ph = 250, pr = mk(pw, ph), p = pr.getContext('2d');
    p.translate(pw / 2, ph / 2); p.scale(1, ph / pw);
    const pg = p.createRadialGradient(0, 0, 0, 0, 0, pw / 2);
    pg.addColorStop(0, 'rgba(255,255,255,1)'); pg.addColorStop(0.45, 'rgba(255,255,255,0.42)'); pg.addColorStop(1, 'rgba(255,255,255,0)');
    p.fillStyle = pg; p.beginPath(); p.arc(0, 0, pw / 2, 0, TAU); p.fill();
    const tint = (src, col) => { const c = mk(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; };
    const cols = ['#ffe9a8', ...PANES.map((P) => shade(P.col, 1.25))];
    beams = cols.map((c) => tint(soft, c)); pools = cols.map((c) => tint(pr, c));
  }

  function buildBackground() {
    bg = mk(W, H);
    const b = bg.getContext('2d');
    const grain = makeTex(256, (x, y) => 0.5 + 0.2 * pnoise(x / 2, y / 2, 128, 21) + 0.2 * pnoise(x / 6.4, y / 6.4, 40, 22) + 0.16 * pnoise(x / 32, y / 32, 8, 23));
    const cloud = makeTex(256, (x, y) => 0.5 + 0.32 * pnoise(x / 64, y / 64, 4, 31) + 0.2 * pnoise(x / 25.6, y / 25.6, 10, 32));
    const pg = b.createPattern(grain, 'repeat'), pc = b.createPattern(cloud, 'repeat');
    pc.setTransform(new DOMMatrix().scaleSelf(3.4, 2.6));
    const overlay = (pat, alpha, x, y, w, h) => { b.save(); b.globalCompositeOperation = 'overlay'; b.globalAlpha = alpha; b.fillStyle = pat; b.fillRect(x, y, w, h); b.restore(); };
    // ashlar courses of varying height
    b.fillStyle = '#1d1c21'; b.fillRect(0, 0, W, H);
    for (let row = 0, y = -30; y < FLOOR; row++) {
      const ch = 104 + Math.round(hash(row, 300) * 34);
      let x = -hash(row, 301) * 240;
      for (let i = 0; x < W; i++) {
        const w = 200 + hash(row, i, 302) * 170, v = hash(row, i, 303);
        b.fillStyle = Kit.rgba(Kit.mix('#242228', '#35323a', v)); b.fillRect(x, y, w, ch);
        const gl = b.createLinearGradient(0, y, 0, y + ch);
        gl.addColorStop(0, 'rgba(255,255,255,0.05)'); gl.addColorStop(0.1, 'rgba(255,255,255,0)'); gl.addColorStop(0.88, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,0.25)');
        b.fillStyle = gl; b.fillRect(x, y, w, ch);
        b.fillStyle = '#100f13'; b.fillRect(x - 1.5, y, 3, ch);
        b.fillStyle = 'rgba(255,255,255,0.04)'; b.fillRect(x + 1.5, y + 3, 1.5, ch - 6);
        x += w;
      }
      b.fillStyle = '#100f13'; b.fillRect(0, y - 1.5, W, 3);
      y += ch;
    }
    // stone floor in shallow perspective (below the safe area: decoration only)
    const fg = b.createLinearGradient(0, FLOOR, 0, H); fg.addColorStop(0, '#16151a'); fg.addColorStop(1, '#2b2930');
    b.fillStyle = fg; b.fillRect(0, FLOOR, W, H - FLOOR);
    b.strokeStyle = 'rgba(0,0,0,0.6)'; b.lineWidth = 2.5;
    for (let i = 1; i < 6; i++) { const y = FLOOR + (H - FLOOR + 60) * Math.pow(i / 6, 1.7); b.beginPath(); b.moveTo(0, y); b.lineTo(W, y); b.stroke(); }
    for (let i = -7; i <= 7; i++) { b.beginPath(); b.moveTo(540 + i * 118, FLOOR); b.lineTo(540 + i * 330, H + 40); b.stroke(); }
    const fs = b.createLinearGradient(0, FLOOR, 0, FLOOR + 70); fs.addColorStop(0, 'rgba(0,0,0,0.75)'); fs.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = fs; b.fillRect(0, FLOOR, W, 70);
    b.fillStyle = 'rgba(255,250,235,0.06)'; b.fillRect(0, FLOOR - 1, W, 1.5);
    overlay(pc, 0.55, 0, 0, W, H);
    overlay(pg, 0.7, 0, 0, W, H);
    // falloff: a little ambient light near the window, dark toward the edges
    const v = b.createRadialGradient(WIN.cx, WIN.cy, 300, WIN.cx, WIN.cy + 120, 1250);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.55, 'rgba(0,0,0,0.36)'); v.addColorStop(1, 'rgba(0,0,0,0.78)');
    b.fillStyle = v; b.fillRect(0, 0, W, H);
    const top = b.createLinearGradient(0, 0, 0, 440); top.addColorStop(0, 'rgba(8,8,12,0.72)'); top.addColorStop(1, 'rgba(8,8,12,0)');
    b.fillStyle = top; b.fillRect(0, 0, W, 440);

    // carved stone surround of the rose: fillet, bead moulding, roll, splayed reveal
    const rg = RG * WIN.S, rs = RS * WIN.S, cx = WIN.cx, cy = WIN.cy;
    const halo = b.createRadialGradient(cx, cy + 10, rs - 4, cx, cy + 10, rs + 52);
    halo.addColorStop(0, 'rgba(0,0,0,0.62)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = halo; b.beginPath(); b.arc(cx, cy + 10, rs + 52, 0, TAU); b.fill();
    b.save(); b.beginPath(); b.arc(cx, cy, rs, 0, TAU); b.arc(cx, cy, rg - 2, 0, TAU, true); b.clip('evenodd');
    b.fillStyle = '#514c45'; b.fillRect(cx - rs, cy - rs, rs * 2, rs * 2);
    b.globalCompositeOperation = 'overlay'; b.globalAlpha = 0.85; b.fillStyle = pg; b.fillRect(cx - rs, cy - rs, rs * 2, rs * 2);
    b.globalAlpha = 0.5; b.fillStyle = pc; b.fillRect(cx - rs, cy - rs, rs * 2, rs * 2);
    b.restore();
    const lin = (c0, c1) => { const g = b.createLinearGradient(cx - rs * 0.7, cy - rs * 0.7, cx + rs * 0.7, cy + rs * 0.7); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
    const ring = (r, w, style) => { b.beginPath(); b.arc(cx, cy, r, 0, TAU); b.lineWidth = w; b.strokeStyle = style; b.stroke(); };
    const LIGHT = 'rgba(255,248,230,', DARK = 'rgba(0,0,0,';
    ring(rs - 1.5, 3, lin(LIGHT + '0.36)', DARK + '0.6)'));            // outer arris
    ring(rs - 8.5, 2, DARK + '0.5)');                                   // quirk
    const rb = rs - 14;                                                 // bead moulding
    ring(rb, 9, DARK + '0.3)');
    const nb = 84;
    for (let i = 0; i < nb; i++) {
      const a = i * TAU / nb, x = cx + Math.cos(a) * rb, y = cy + Math.sin(a) * rb;
      const g = b.createRadialGradient(x - 1.4, y - 1.4, 0.3, x, y, 4.4);
      g.addColorStop(0, '#9a927f'); g.addColorStop(0.6, '#5a554c'); g.addColorStop(1, '#27241f');
      b.fillStyle = g; b.beginPath(); b.arc(x, y, 4.2, 0, TAU); b.fill();
    }
    ring(rs - 20, 2, DARK + '0.5)');                                    // quirk
    ring(rg + 8.5, 8, lin(LIGHT + '0.3)', DARK + '0.45)'));             // roll
    ring(rg + 2.5, 5, lin(DARK + '0.65)', LIGHT + '0.2)'));             // reveal, lit from the opposite side
    b.fillStyle = '#060609'; b.beginPath(); b.arc(cx, cy, rg - 1, 0, TAU); b.fill();

    // carved tablet for the list
    const { x, y, w, h } = TB;
    const tsh = b.createLinearGradient(0, y + h, 0, y + h + 26); tsh.addColorStop(0, 'rgba(0,0,0,0.5)'); tsh.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = tsh; b.fillRect(x - 6, y + h, w + 12, 26);
    b.save(); b.beginPath(); b.roundRect(x, y, w, h, 7); b.clip();
    b.fillStyle = '#33302c'; b.fillRect(x, y, w, h);
    b.globalCompositeOperation = 'overlay'; b.globalAlpha = 0.7; b.fillStyle = pg; b.fillRect(x, y, w, h);
    b.globalAlpha = 0.35; b.fillStyle = pc; b.fillRect(x, y, w, h);
    b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1;
    const tg = b.createLinearGradient(0, y, 0, y + h); tg.addColorStop(0, 'rgba(255,255,255,0.05)'); tg.addColorStop(1, 'rgba(0,0,0,0.2)');
    b.fillStyle = tg; b.fillRect(x, y, w, h);
    b.restore();
    b.lineWidth = 2; b.strokeStyle = 'rgba(255,250,235,0.2)'; b.beginPath(); b.moveTo(x + 1, y + h - 5); b.lineTo(x + 1, y + 6); b.quadraticCurveTo(x + 1, y + 1, x + 6, y + 1); b.lineTo(x + w - 5, y + 1); b.stroke();
    b.strokeStyle = 'rgba(0,0,0,0.6)'; b.beginPath(); b.moveTo(x + w - 1, y + 5); b.lineTo(x + w - 1, y + h - 6); b.quadraticCurveTo(x + w - 1, y + h - 1, x + w - 6, y + h - 1); b.lineTo(x + 5, y + h - 1); b.stroke();
    // incised rule under the header
    b.fillStyle = 'rgba(0,0,0,0.55)'; b.fillRect(x + 22, y + 49, w - 44, 2);
    b.fillStyle = 'rgba(255,250,235,0.1)'; b.fillRect(x + 22, y + 51, w - 44, 1);
  }

  // ------------------------------------------------------------------ per-frame helpers
  function carved(text, x, y, font, color, alpha = 1, align = 'left', spacing = 0) {
    if (alpha <= 0.003) return;
    ctx.save(); ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    if (spacing) ctx.letterSpacing = spacing + 'px';
    ctx.globalAlpha = alpha * 0.6; ctx.fillStyle = '#000'; ctx.fillText(text, x, y - 1.6);
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillText(text, x, y);
    ctx.restore();
  }
  const medPx = (k) => { const a = -Math.PI / 2 + k * SEC; return [WIN.cx + Math.cos(a) * MED.d * WIN.S, WIN.cy + Math.sin(a) * MED.d * WIN.S]; };

  function render(t) {
    const out = seg(t, OUT0, DUR - 0.12, ease.inOut);       // lights go down for the loop
    const fin = seg(t, TALL, TALL + 0.8, ease.inOut);       // all seven together
    const breathe = 1 + (0.025 * Math.sin(t * 1.9) + 0.015 * Math.sin(t * 3.1 + 1)) * seg(t, 0.3, 1.5) * (1 - out);
    // light level and "active" level for each petal
    const lit = [], act = [];
    for (let k = 0; k < N; k++) {
      const s = start(k), up = seg(t, s, s + 0.85, ease.inOut);
      const a = up * (1 - seg(t, s + SLOTS[k], s + SLOTS[k] + 0.6, ease.inOut));
      act.push(a * (1 - fin));
      lit.push(clamp(up * lerp(lerp(0.74, 1, a), 1, fin) * (1 - out) * breathe));
    }
    const litC = clamp(lerp(lerp(lerp(0.22, 0.6, seg(t, 0.15, 1.3, ease.inOut)), 1, fin) * breathe, 0.22, out));
    const nShown = lit.filter((v, k) => t >= start(k)).length;

    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(bg, 0, 0);

    // coloured light pooling on the stone below the window
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < N; k++) if (lit[k] > 0.01) {
      const [mx, my] = medPx(k);
      ctx.globalAlpha = 0.07 * lit[k] + 0.05 * act[k];
      ctx.drawImage(pools[k + 1], 540 + (mx - WIN.cx) * 1.05 - 26 - 280, 1250 + (my - WIN.cy) * 0.36 - 125);
      ctx.globalAlpha = 0.34 * lit[k] + 0.14 * act[k];        // on the floor, as a foreshortened image of the window
      ctx.drawImage(pools[k + 1], 500 + (mx - WIN.cx) * 1.25 - 230, 1800 + (my - WIN.cy) * 0.3 - 80, 460, 160);
    }
    ctx.globalAlpha = 0.22 * litC; ctx.drawImage(pools[0], 500 - 150, 1800 - 55, 300, 110);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

    // the window
    const ox = WIN.cx - OS / 2, oy = WIN.cy - OS / 2;
    ctx.drawImage(dimWin, ox, oy);
    ctx.globalAlpha = litC; ctx.drawImage(paneLit[0], ox, oy);
    for (let k = 0; k < N; k++) if (lit[k] > 0.004) { ctx.globalAlpha = lit[k]; ctx.drawImage(paneLit[k + 1], ox, oy); }
    ctx.globalAlpha = 1;
    ctx.drawImage(cameLayer, ox, oy);
    // bloom: glass glows from within and spills onto leads and stone
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.25 * litC; ctx.drawImage(paneBloom[0], ox, oy, OS, OS);
    for (let k = 0; k < N; k++) if (lit[k] > 0.004) { ctx.globalAlpha = (0.23 + 0.07 * act[k]) * lit[k]; ctx.drawImage(paneBloom[k + 1], ox, oy, OS, OS); }
    // shafts of light
    for (let k = 0; k < N; k++) {
      const a = (0.5 * act[k] + 0.13 * fin * (1 - out)) * lit[k];
      if (a < 0.004) continue;
      const [mx, my] = medPx(k);
      ctx.save(); ctx.translate(mx, my); ctx.rotate(0.2 + 0.03 * Math.sin(t * 0.7 + k)); ctx.globalAlpha = a; ctx.drawImage(beams[k + 1], -230, 10); ctx.restore();
    }
    // one slow pass of brighter light across the finished window
    const sw = seg(t, TALL + 0.9, TALL + 3.9);
    if (sw > 0 && sw < 1) {
      const rg = RG * WIN.S, x = WIN.cx - rg * 1.5 + sw * rg * 3;
      const gs = ctx.createLinearGradient(x - 150, 0, x + 150, 60);
      gs.addColorStop(0, 'rgba(255,244,214,0)'); gs.addColorStop(0.5, 'rgba(255,244,214,0.16)'); gs.addColorStop(1, 'rgba(255,244,214,0)');
      ctx.save(); ctx.beginPath(); ctx.arc(WIN.cx, WIN.cy, rg - 4, 0, TAU); ctx.clip(); ctx.fillStyle = gs; ctx.fillRect(WIN.cx - rg, WIN.cy - rg, rg * 2, rg * 2); ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

    // ---- title block
    Kit.handle(ctx, 66, 252, { font: '500 24px Inter', color: '#cfc5ad', alpha: 0.62 });
    carved('Periapical healing', 62, 336, '600 82px Fraunces', CREAM);
    carved('after nonsurgical root canal treatment', 66, 385, 'italic 400 36px Fraunces', '#d4c6a4');
    // counter: "7 factors" at rest, "n / 7" while the panes light up
    const cb = seg(t, T0 - 0.05, T0 + 0.25) * (1 - seg(t, OUT0 + 0.05, OUT0 + 0.3));
    const c7 = (1 - seg(t, T0 - 0.4, T0 - 0.1)) + seg(t, OUT0 + 0.35, OUT0 + 0.65);     // never both at once
    carved('7', 1012, 338, '700 104px Fraunces', GILT, c7, 'right');
    if (cb > 0) {
      ctx.save(); ctx.font = '500 50px Fraunces'; const wTail = ctx.measureText(' / 7').width; ctx.restore();
      carved(' / 7', 1012, 338, '500 50px Fraunces', '#d4c6a4', cb, 'right');
      const n = Math.max(1, nShown), s = start(n - 1), u = n > 1 ? seg(t, s, s + 0.3, ease.out) : 1;
      if (u < 1) carved(String(n - 1), 1012 - wTail, 338 - 26 * u, '700 104px Fraunces', PANES[n - 2].txt, cb * (1 - u), 'right');
      carved(String(n), 1012 - wTail, 338 + 26 * (1 - u), '700 104px Fraunces', n ? PANES[n - 1].txt : GILT, cb * u, 'right');
    }
    carved('FACTORS', 1013, 385, '600 30px Inter', '#d4c6a4', 1, 'right', 3);

    // ---- tablet
    carved('FACTOR', XT, TB.y + 37, '600 30px Inter', '#bdb096', 1, 'left', 2);
    carved('BETTER HEALING ASSOCIATED WITH', XR, TB.y + 37, '600 30px Inter', '#bdb096', 1, 'right', 1.2);
    const rowsOut = 1 - seg(t, OUT0, OUT0 + 0.55);
    for (let k = 0; k < N; k++) {
      const s = start(k), y = rowY(k), P = PANES[k], R = ROWS[k];
      const u = seg(t, s + 0.25, s + 0.7, ease.out) * rowsOut;
      const hot = Math.max(act[k], fin * (1 - out) * 0.0);
      // slot marker before the row is carved
      carved(String(k + 1), XN, y, '700 38px Fraunces', '#8d8576', 0.4 * (1 - u), 'center');
      if (u <= 0) continue;
      if (hot > 0.01) { // the pane's colour falls on its row
        const gl = ctx.createLinearGradient(TB.x, 0, TB.x + TB.w, 0);
        gl.addColorStop(0, Kit.rgba(P.col, 0.34 * hot)); gl.addColorStop(0.7, Kit.rgba(P.col, 0.1 * hot)); gl.addColorStop(1, Kit.rgba(P.col, 0));
        ctx.fillStyle = gl; ctx.fillRect(TB.x + 4, y - 35, TB.w - 8, 47 + (R.sub ? 35 : 0));
      }
      const base = lerp(0.86, 1, Math.max(hot, fin));
      carved(String(k + 1), XN, y, '700 38px Fraunces', P.txt, u, 'center');
      ctx.save(); ctx.beginPath(); ctx.rect(TB.x, y - 44, 72 + (TB.w - 72) * seg(t, s + 0.25, s + 0.8, ease.out) + 2, 96); ctx.clip();
      carved(R.name, XT, y, '600 36px Fraunces', CREAM, u * base);
      carved(R.good, XR, y + 0.5, '600 31px Inter', GILT, u * base * seg(t, s + 0.55, s + 0.9), 'right');
      ctx.restore();
      if (R.sub) carved(R.sub, XT, y + 35, 'italic 500 30px Fraunces', P.txt, seg(t, s + 0.9, s + 1.3, ease.out) * rowsOut * 0.95);
    }
    carved(SOURCE, 64, 1577, '400 23px Inter', '#b9ae98', 0.72);
  }

  window.REEL = {
    title: 'Seven factors in periapical healing',
    duration: +DUR.toFixed(2),
    poster: +(TALL + 4.5).toFixed(2),
    canvas,
    fonts: ['600 82px Fraunces', '700 104px Fraunces', '500 50px Fraunces', 'italic 400 36px Fraunces', 'italic 500 30px Fraunces',
      '600 30px Inter', '500 24px Inter', '400 23px Inter'],
    setup() { buildWindow(); buildLight(); buildBackground(); },
    render,
  };
  Kit.boot(REEL);
})();
