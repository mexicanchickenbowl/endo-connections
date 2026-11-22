/*
 * Print42 — static "offset print" layers for reel 42: warm paper with grain, geometric tile bands in three inks,
 * a halftone dot pattern, and an ink-dropout speckle layer. All deterministic (Kit.rng / Kit.hash), built once.
 */
(function () {
  const W = 1080, H = 1920;
  const INK = {
    paper: '#F2EAD8', paper2: '#E4D8BE', char: '#2A2927',
    teal: '#0E5F64',      // culture-negative
    brick: '#C44C2D',     // culture-positive
    brickD: '#7E2A18',    // halftone dots on the culture-positive ink
    mustard: '#DFA83A',   // accent only (tag, study range)
  };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const P = { INK, paper: null, grain: null, _dots: null };

  /** 45-degree halftone dot lattice used on every culture-positive fill */
  P.dots = (ctx) => {
    if (!P._dots) {
      const c = mk(12, 12), g = c.getContext('2d');
      g.fillStyle = INK.brickD; g.globalAlpha = 0.62;
      for (const [x, y] of [[3, 3], [9, 9]]) { g.beginPath(); g.arc(x, y, 1.75, 0, 7); g.fill(); }
      P._dots = ctx.createPattern(c, 'repeat');
    }
    return P._dots;
  };

  function tile(g, x, y, s, kind, ink, ink2) {
    const mul = (color, a) => { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a == null ? 0.94 : a; g.fillStyle = color; g.fill(); g.restore(); };
    g.save(); g.beginPath(); g.rect(x, y, s, s); g.clip();
    const k = kind % 10;
    if (k === 0 || k === 1 || k === 2 || k === 3) {            // quarter circle from one corner
      const cx = x + (k % 2) * s, cy = y + (k > 1 ? s : 0);
      g.beginPath(); g.arc(cx, cy, s, 0, 7); mul(ink);
      g.beginPath(); g.arc(cx, cy, s * 0.5, 0, 7); mul(ink2, 0.9);
    } else if (k === 4) {                                       // half circle on the floor
      g.beginPath(); g.arc(x + s / 2, y + s, s / 2, 0, 7); mul(ink);
      g.beginPath(); g.arc(x + s / 2, y, s / 4, 0, 7); mul(ink2);
    } else if (k === 5) {                                       // disc on a solid ground
      g.beginPath(); g.rect(x, y, s, s); mul(ink);
      g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.33, 0, 7); g.fillStyle = INK.paper; g.fill();
      g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.13, 0, 7); mul(ink2);
    } else if (k === 6) {                                       // stripes
      for (let i = 0; i < 4; i++) { g.beginPath(); g.rect(x + (i * 2 + 0.5) * s / 8, y, s / 8, s); mul(ink); }
    } else if (k === 7) {                                       // two overlapping discs (overprint)
      g.beginPath(); g.arc(x + s * 0.38, y + s * 0.5, s * 0.3, 0, 7); mul(ink);
      g.beginPath(); g.arc(x + s * 0.62, y + s * 0.5, s * 0.3, 0, 7); mul(ink2);
    } else if (k === 8) {                                       // diagonal half
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y); g.lineTo(x, y + s); g.closePath(); mul(ink);
      g.beginPath(); g.arc(x + s * 0.7, y + s * 0.7, s * 0.16, 0, 7); mul(ink2);
    } else {                                                    // concentric rings
      for (const [r, c] of [[0.46, ink], [0.3, INK.paper], [0.16, ink2]]) {
        g.beginPath(); g.arc(x + s / 2, y + s / 2, s * r, 0, 7);
        if (c === INK.paper) { g.fillStyle = c; g.fill(); } else mul(c);
      }
    }
    g.restore();
  }

  function band(g, y, rows, seed) {
    const n = 8, s = (1016 - 64) / n, inks = [INK.teal, INK.brick, INK.mustard, INK.char];
    for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
      const kind = Math.floor(Kit.hash(i, r, seed) * 10);
      const a = Math.floor(Kit.hash(i, r, seed + 1) * 3), b = (a + 1 + Math.floor(Kit.hash(i, r, seed + 2) * 3)) % 4;
      tile(g, 64 + i * s, y + r * s, s, kind, inks[a], inks[b]);
    }
    g.strokeStyle = INK.char; g.lineWidth = 2.5; g.strokeRect(64, y, 1016 - 64, rows * s);
    g.lineWidth = 1.2; g.globalAlpha = 0.55;
    for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(64 + i * s, y); g.lineTo(64 + i * s, y + rows * s); g.stroke(); }
    for (let r = 1; r < rows; r++) { g.beginPath(); g.moveTo(64, y + r * s); g.lineTo(1016, y + r * s); g.stroke(); }
    g.globalAlpha = 1;
  }

  P.build = () => {
    // ---------- paper
    const paper = mk(W, H), g = paper.getContext('2d', { alpha: false });
    g.fillStyle = INK.paper; g.fillRect(0, 0, W, H);
    // soft mottling (low-res noise, upscaled)
    const lo = mk(135, 240), lg = lo.getContext('2d'), id = lg.createImageData(135, 240);
    for (let y = 0; y < 240; y++) for (let x = 0; x < 135; x++) {
      const n = Kit.noise2(x / 13, y / 13, 3) * 0.6 + Kit.noise2(x / 4.2, y / 4.2, 9) * 0.4;
      const k = (y * 135 + x) * 4, dark = n < 0;
      id.data[k] = dark ? 120 : 255; id.data[k + 1] = dark ? 96 : 250; id.data[k + 2] = dark ? 50 : 232;
      id.data[k + 3] = Math.abs(n) * (dark ? 26 : 34);
    }
    lg.putImageData(id, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(lo, 0, 0, W, H);
    // fibres and specks
    const r = Kit.rng(4242);
    for (let i = 0; i < 900; i++) {
      const x = r() * W, y = r() * H, a = r() * Math.PI, l = 6 + r() * 22;
      g.strokeStyle = r() < 0.5 ? 'rgba(120,96,58,0.07)' : 'rgba(255,252,240,0.16)'; g.lineWidth = 0.7 + r() * 0.5;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 6, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 14000; i++) {
      g.fillStyle = r() < 0.6 ? `rgba(96,78,48,${0.04 + r() * 0.07})` : `rgba(255,253,244,${0.10 + r() * 0.16})`;
      g.fillRect(r() * W, r() * H, 0.8 + r() * 1.2, 0.8 + r() * 1.2);
    }
    // edge toning
    const vg = g.createRadialGradient(W / 2, H / 2, 620, W / 2, H / 2, 1240);
    vg.addColorStop(0, 'rgba(120,90,40,0)'); vg.addColorStop(1, 'rgba(120,90,40,0.13)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    // ---------- decoration outside the reading area (top 230 px, bottom 340 px): geometric tile bands
    band(g, 66, 1, 11);            // y 66-185
    band(g, 1634, 2, 23);          // y 1634-1872
    // registration marks
    const reg = (x, y) => { g.save(); g.strokeStyle = INK.char; g.globalAlpha = 0.6; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, 9, 0, 7); g.moveTo(x - 15, y); g.lineTo(x + 15, y); g.moveTo(x, y - 15); g.lineTo(x, y + 15); g.stroke(); g.restore(); };
    reg(W / 2, 34); reg(W / 2, 1896);
    g.save(); g.strokeStyle = INK.char; g.globalAlpha = 0.6; g.lineWidth = 1.6;
    for (const [x, y, sx, sy] of [[30, 30, 1, 1], [W - 30, 30, -1, 1], [30, H - 30, 1, -1], [W - 30, H - 30, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y + sy * 22); g.lineTo(x, y); g.lineTo(x + sx * 22, y); g.stroke();
    }
    g.restore();
    P.paper = paper;

    // ---------- ink dropout speckle (paper-coloured, so it only shows on printed areas)
    const grain = mk(W, H), q = grain.getContext('2d'), r2 = Kit.rng(977);
    for (let i = 0; i < 34000; i++) {
      q.fillStyle = `rgba(242,234,216,${0.10 + r2() * 0.30})`;
      const s = 0.7 + r2() * 1.3; q.fillRect(r2() * W, r2() * H, s, s);
    }
    for (let i = 0; i < 260; i++) {                      // a few larger hickeys
      q.fillStyle = `rgba(242,234,216,${0.25 + r2() * 0.3})`;
      q.beginPath(); q.arc(r2() * W, r2() * H, 1 + r2() * 1.6, 0, 7); q.fill();
    }
    P.grain = grain;
  };

  window.Print42 = P;
})();
