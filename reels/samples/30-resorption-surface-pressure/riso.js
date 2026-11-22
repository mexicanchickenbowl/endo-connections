/*
 * Sample 30 — two-colour risograph print pipeline.
 *
 * Everything is drawn on two "plates" (one per spot ink). A plate is a transparent canvas whose alpha is the ink
 * coverage. Per frame: draw shapes on the plates -> punch print grain out of each plate -> multiply both plates onto
 * the paper, the pink one slightly out of register. Where the inks overlap they overprint to a third, dark tone.
 * Tints are real halftone dot screens (no alpha tints). Deterministic: no Math.random, no clocks.
 */
(function () {
  'use strict';
  const { W, H, hash, noise2 } = Kit;
  const PAPER = '#f2e8d3', PINK = '#ff4aa8', TEAL = '#1d6a8a';
  const TAU = Math.PI * 2;
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  const main = Kit.createCanvas();
  const plateT = mk(), plateP = mk(), sheetBuf = mk();
  const T = plateT.getContext('2d'), P = plateP.getContext('2d'), SB = sheetBuf.getContext('2d', { alpha: false });
  T.ink = TEAL; P.ink = PINK;
  let paper = null, grainT = null, grainP = null;

  /* ---------- textures (built once) ---------- */
  function buildPaper() {
    const c = mk(), g = c.getContext('2d');
    const [r0, g0, b0] = Kit.hex(PAPER);
    const id = g.createImageData(W, H), d = id.data;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
      const n = (hash(x, y, 71) - 0.5) * 9 + (hash(x >> 1, y >> 1, 72) - 0.5) * 6;
      d[i] = r0 + n; d[i + 1] = g0 + n; d[i + 2] = b0 + n * 1.15; d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    // soft mottling
    const lw = 108, lh = 192, l = mk(lw, lh), lg = l.getContext('2d'), li = lg.createImageData(lw, lh);
    for (let y = 0, i = 0; y < lh; y++) for (let x = 0; x < lw; x++, i += 4) {
      const n = noise2(x / 9, y / 9, 5) * 0.6 + noise2(x / 3.1, y / 3.1, 6) * 0.4;
      li.data[i] = 120; li.data[i + 1] = 92; li.data[i + 2] = 50; li.data[i + 3] = Math.max(0, n) * 34;
    }
    lg.putImageData(li, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(l, 0, 0, W, H);
    // fibres and flecks of an uncoated stock
    const R = Kit.rng(907);
    g.lineCap = 'round';
    for (let k = 0; k < 1500; k++) {
      const x = R() * W, y = R() * H, a = R() * TAU, len = 5 + R() * 20, dark = R() < 0.6;
      g.strokeStyle = dark ? `rgba(110,84,48,${0.05 + R() * 0.09})` : `rgba(255,252,242,${0.2 + R() * 0.3})`;
      g.lineWidth = 0.8 + R() * 0.9;
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (R() - 0.5) * 6, y + Math.sin(a) * len * 0.5 + (R() - 0.5) * 6, x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.stroke();
    }
    for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(96,70,40,${0.08 + R() * 0.14})`; g.beginPath(); g.arc(R() * W, R() * H, 0.6 + R() * 1.3, 0, TAU); g.fill(); }
    return c;
  }
  /* grain = alpha mask that is punched OUT of a plate: fine tooth + pinholes + slow density drift */
  function buildGrain(seed) {
    const c = mk(), g = c.getContext('2d');
    const id = g.createImageData(W, H), d = id.data;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
      const h1 = hash(x, y, seed), h2 = hash(x >> 1, y >> 1, seed + 3);
      let a = 0.03 + 0.11 * h1;
      if (h2 > 0.915) a += 0.22 + 0.5 * hash(x >> 1, y >> 1, seed + 9);
      else if (h2 < 0.05) a += 0.16;
      d[i + 3] = Math.min(255, a * 255);
    }
    g.putImageData(id, 0, 0);
    const lw = 135, lh = 240, l = mk(lw, lh), lg = l.getContext('2d'), li = lg.createImageData(lw, lh);
    for (let y = 0, i = 0; y < lh; y++) for (let x = 0; x < lw; x++, i += 4) {
      const n = noise2(x / 6, y / 6, seed + 20) * 0.5 + 0.5, m = noise2(x / 1.7, y / 1.7, seed + 21) * 0.5 + 0.5;
      li.data[i + 3] = (n * n * 0.2 + m * m * 0.07) * 255;
    }
    lg.putImageData(li, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(l, 0, 0, W, H);
    return c;
  }

  /* ---------- halftone screens ---------- */
  function dots(c, cell, cov, ang, color) {
    const k = mk(cell * 2, cell * 2), g = k.getContext('2d');   // 2x2 dots per tile, drawn at 1:1
    g.fillStyle = color || c.ink;
    const r = cell * Math.sqrt(cov / Math.PI);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { g.beginPath(); g.arc(cell * (a + 0.5), cell * (b + 0.5), r, 0, TAU); g.fill(); }
    const p = c.createPattern(k, 'repeat');
    p.setTransform(new DOMMatrix().rotateSelf(ang));
    return p;
  }
  function lines(c, cell, th, ang, color) {
    const k = mk(cell, cell), g = k.getContext('2d');
    g.fillStyle = color || c.ink; g.fillRect(0, (cell - th) / 2, cell, th);
    const p = c.createPattern(k, 'repeat');
    p.setTransform(new DOMMatrix().rotateSelf(ang));
    return p;
  }

  /* ---------- per-frame ---------- */
  function begin() {
    for (const c of [T, P]) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, W, H);
      c.fillStyle = c.ink; c.strokeStyle = c.ink; c.lineCap = 'round'; c.lineJoin = 'round'; c.letterSpacing = '0px';
    }
  }
  /* reg = {dx, dy, rot}: misregistration of the pink plate against the teal one */
  function compose(g, reg) {
    for (const [c, gr] of [[T, grainT], [P, grainP]]) {
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'destination-out';
      c.drawImage(gr, 0, 0); c.restore();
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over'; g.drawImage(paper, 0, 0);
    g.globalCompositeOperation = 'multiply';
    g.drawImage(plateT, 0, 0);
    g.translate(W / 2, H / 2); g.rotate(reg.rot); g.translate(-W / 2 + reg.dx, -H / 2 + reg.dy);
    g.drawImage(plateP, 0, 0);
    g.restore();
  }
  function setup() { paper = buildPaper(); grainT = buildGrain(101); grainP = buildGrain(202); }

  /* ---------- small drawing helpers ---------- */
  const ink = (c) => { c.fillStyle = c.ink; c.strokeStyle = c.ink; };
  /** knock-out: whatever fn draws is removed from plate c (paper shows through) */
  function ko(c, fn) { c.save(); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.fillStyle = '#000'; c.strokeStyle = '#000'; fn(c); c.restore(); }
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.fill(); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function poly(c, pts) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); }
  /** text in the plate's ink (opts.keep: keep current fillStyle, used inside ko()) */
  function txt(c, s, x, y, font, o = {}) {
    c.save(); c.font = font; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic'; c.letterSpacing = o.ls || '0px';
    if (!o.keep) c.fillStyle = c.ink;
    c.fillText(s, x, y); c.restore();
  }
  function tw(s, font, ls) { T.save(); T.font = font; T.letterSpacing = ls || '0px'; const w = T.measureText(s).width; T.restore(); return w; }
  /** block arrow from (x0,y0) to (x1,y1) */
  function arrow(c, x0, y0, x1, y1, sw, hw, hl) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const bx = x1 - ux * hl, by = y1 - uy * hl;
    poly(c, [[x0 + nx * sw / 2, y0 + ny * sw / 2], [bx + nx * sw / 2, by + ny * sw / 2], [bx + nx * hw / 2, by + ny * hw / 2], [x1, y1],
      [bx - nx * hw / 2, by - ny * hw / 2], [bx - nx * sw / 2, by - ny * sw / 2], [x0 - nx * sw / 2, y0 - ny * sw / 2]]);
    c.closePath(); c.fill();
  }

  window.Riso = { PAPER, PINK, TEAL, TAU, mk, main, T, P, SB, sheetBuf, plateT, plateP, setup, begin, compose, dots, lines, ink, ko, circ, rr, poly, txt, tw, arrow };
})();
