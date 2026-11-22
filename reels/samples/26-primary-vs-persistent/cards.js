/* Sample 26 — trading-card art kit: palette, vector helpers, morphology icons, card sprites.
   Everything is drawn once into offscreen canvases (2x supersampled) in Cards.build(), after fonts are loaded. */
(function () {
  const { rgba, rng } = Kit;
  const CW = 226, CH = 294, CR = 16, SS = 2;

  const P = {
    feltA: '#18584a', feltB: '#0d3a31', feltC: '#051b17',
    ivory: '#f7f1e3', paper: '#fbf6ea', ink: '#1b1a2e', inkSoft: '#4a4860',
    mint: '#a9cbbf', gold: '#f1d07c', goldDeep: '#c2933a', goldPale: '#fff4cf',
    neg: { main: '#d93b6e', dark: '#a51d4c', deep: '#7a1236', light: '#f8bccd', tint: '#fdeef2', tint2: '#f8d2dd' },
    pos: { main: '#6c42d6', dark: '#4a2aa3', deep: '#321b78', light: '#cbbbf7', tint: '#f2edfd', tint2: '#dccffa' },
    yst: { main: '#d8922a', dark: '#9c6410', deep: '#6e4508', light: '#f4d9a0', tint: '#fdf4dd', tint2: '#f6e2b4' },
    navy: '#141b3c', navy2: '#26347a',
    o2an: '#141a33', o2fac: '#1b9bd6', slash: '#ff5b4f',
  };
  const BC = '"Barlow Condensed", "DejaVu Sans Condensed", sans-serif';
  const IN = 'Inter, "DejaVu Sans", sans-serif';

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
  const rr = (x, a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); };
  const rad = (d) => d * Math.PI / 180;

  // ------------------------------------------------------------------ cells
  function capsule(x, cx, cy, len, wid, ang, g) {
    x.save(); x.translate(cx, cy); x.rotate(rad(ang));
    rr(x, -len / 2, -wid / 2, len, wid, wid / 2);
    x.fillStyle = g.main; x.fill();
    x.lineWidth = Math.max(1.4, wid * 0.13); x.strokeStyle = g.dark; x.stroke();
    x.beginPath(); x.moveTo(-len / 2 + wid * 0.45, -wid * 0.2); x.lineTo(len / 2 - wid * 0.6, -wid * 0.2);
    x.lineWidth = Math.max(1.2, wid * 0.16); x.lineCap = 'round'; x.strokeStyle = rgba(g.light, 0.75); x.stroke();
    x.restore();
  }
  function spindle(x, cx, cy, len, wid, ang, g, bend = 0) {
    x.save(); x.translate(cx, cy); x.rotate(rad(ang));
    const h = len / 2, w = wid / 2;
    x.beginPath(); x.moveTo(-h, 0);
    x.bezierCurveTo(-h * 0.45, -w * 1.25 + bend, h * 0.45, -w * 1.25 + bend, h, 0);
    x.bezierCurveTo(h * 0.45, w * 1.25 + bend, -h * 0.45, w * 1.25 + bend, -h, 0); x.closePath();
    x.fillStyle = g.main; x.fill(); x.lineJoin = 'round';
    x.lineWidth = Math.max(1.4, wid * 0.13); x.strokeStyle = g.dark; x.stroke();
    x.beginPath(); x.moveTo(-h * 0.55, -w * 0.3 + bend * 0.8); x.quadraticCurveTo(0, -w * 0.62 + bend, h * 0.5, -w * 0.3 + bend * 0.8);
    x.lineWidth = Math.max(1.2, wid * 0.15); x.lineCap = 'round'; x.strokeStyle = rgba(g.light, 0.75); x.stroke();
    x.restore();
  }
  function coccus(x, cx, cy, r, g, ry) {
    x.beginPath(); x.ellipse(cx, cy, r, ry || r, 0, 0, Math.PI * 2);
    x.fillStyle = g.main; x.fill(); x.lineWidth = Math.max(1.3, r * 0.22); x.strokeStyle = g.dark; x.stroke();
    x.beginPath(); x.arc(cx - r * 0.25, cy - r * 0.25, r * 0.42, Math.PI * 1.05, Math.PI * 1.6);
    x.lineWidth = Math.max(1.1, r * 0.2); x.lineCap = 'round'; x.strokeStyle = rgba(g.light, 0.8); x.stroke();
  }
  function ovoid(x, cx, cy, rx, ry, ang, g) {
    x.save(); x.translate(cx, cy); x.rotate(rad(ang)); coccus(x, 0, 0, rx, g, ry); x.restore();
  }
  function wave(x, x0, y0, len, amp, wl, ang, lw, g) {
    x.save(); x.translate(x0, y0); x.rotate(rad(ang));
    const path = () => { x.beginPath(); for (let s = 0; s <= len; s += 1.5) { const e = Math.min(1, s / 10, (len - s) / 10); const yy = Math.sin(s / wl * Math.PI * 2) * amp * (0.55 + 0.45 * e); s === 0 ? x.moveTo(s, yy) : x.lineTo(s, yy); } };
    x.lineCap = 'round'; x.lineJoin = 'round';
    path(); x.lineWidth = lw + lw * 0.5; x.strokeStyle = g.dark; x.stroke();
    path(); x.lineWidth = lw; x.strokeStyle = g.main; x.stroke();
    x.restore();
  }

  // ------------------------------------------------------------------ morphology icons (design box 200 x 126, k = scale)
  // The lower-right corner (x > 148, y > 66) is left clear for the oxygen badge.
  const ICONS = {
    spindles(x, g) { // Fusobacterium — long spindle-shaped rods
      spindle(x, 72, 36, 112, 14, -16, g, -1); spindle(x, 86, 76, 124, 14, 9, g, 1);
      spindle(x, 44, 98, 70, 12, -44, g); spindle(x, 150, 36, 62, 11, 40, g);
    },
    rodsPlump(x, g) { // Porphyromonas — short rods
      [[36, 32, 22], [82, 26, -34], [130, 34, 12], [174, 30, -40], [56, 68, -14], [104, 66, 42], [34, 102, 30], [84, 104, -8], [132, 96, -52]]
        .forEach(([a, b, c]) => capsule(x, a, b, 30, 17, c, g));
    },
    rodsShort(x, g) { // Prevotella — short rods, some end to end
      [[34, 34, -28], [67, 52, -28], [116, 28, 24], [152, 44, 24], [44, 92, 8], [84, 98, 8], [118, 76, -58], [24, 64, 62]]
        .forEach(([a, b, c]) => capsule(x, a, b, 34, 14, c, g));
    },
    spiro(x, g) { // Treponema — spirochetes
      wave(x, 16, 36, 160, 8.5, 25, 7, 5.5, g); wave(x, 20, 88, 116, 8.5, 25, -13, 5.5, g); wave(x, 44, 112, 84, 7.5, 23, -3, 5, g);
    },
    fusiform(x, g) { // Tannerella — fusiform cells
      spindle(x, 52, 34, 72, 19, -22, g); spindle(x, 126, 38, 76, 19, 18, g);
      spindle(x, 70, 82, 74, 19, 6, g); spindle(x, 32, 100, 48, 15, 58, g); spindle(x, 122, 104, 44, 14, -30, g);
    },
    coccobacilli(x, g) { // Dialister — tiny coccobacilli
      const r = rng(77);
      [[28, 28], [48, 36], [84, 24], [104, 34], [140, 26], [164, 38], [36, 66], [58, 74], [92, 62], [116, 72], [142, 60], [30, 102], [52, 108], [86, 98], [112, 106], [70, 48], [126, 44]]
        .forEach(([a, b]) => ovoid(x, a, b, 8.5, 6, (r() - 0.5) * 140, g));
    },
    cocci(x, g) { // Parvimonas — small cocci
      [[30, 30], [45, 34], [60, 30], [112, 28], [126, 36], [164, 30], [150, 40], [36, 72], [50, 80], [64, 72], [57, 62], [98, 70], [112, 76], [30, 106], [84, 104], [98, 110], [128, 100]]
        .forEach(([a, b]) => coccus(x, a, b, 8, g));
    },
    rodsSlender(x, g) { // Pseudoramibacter — slender rods, V-shaped pairs
      const seg2 = (ax, ay, bx, by) => capsule(x, (ax + bx) / 2, (ay + by) / 2, Math.hypot(bx - ax, by - ay), 10, Math.atan2(by - ay, bx - ax) * 180 / Math.PI, g);
      seg2(24, 50, 64, 28); seg2(68, 28, 108, 48); seg2(36, 104, 80, 86); seg2(84, 86, 124, 106);
      seg2(126, 26, 172, 38); seg2(98, 62, 140, 70);
    },
    rodsChain(x, g) { // Olsenella — short rods in pairs / short chains
      const chain = (x0, y0, ang, n) => { for (let i = 0; i < n; i++) capsule(x, x0 + Math.cos(rad(ang)) * 26 * i, y0 + Math.sin(rad(ang)) * 26 * i, 23, 12, ang, g); };
      chain(28, 30, 14, 3); chain(118, 40, -22, 3); chain(34, 76, -6, 4); chain(40, 108, 4, 2); chain(108, 104, -12, 2);
    },
    chains(x, g) { // Streptococcus — cocci in chains
      const chain = (pts) => pts.forEach(([a, b]) => coccus(x, a, b, 8.6, g));
      const arc = (x0, y0, n, a0, da, st) => { const out = []; let a = a0, px = x0, py = y0; for (let i = 0; i < n; i++) { out.push([px, py]); px += Math.cos(rad(a)) * st; py += Math.sin(rad(a)) * st; a += da; } return out; };
      chain(arc(22, 44, 10, -22, 7, 17.2)); chain(arc(26, 104, 8, -30, 8, 17.2));
    },
    diplo(x, g) { // Enterococcus — cocci, pairs and short chains
      const pair = (cx, cy, ang) => { const dx = Math.cos(rad(ang)) * 9.5, dy = Math.sin(rad(ang)) * 9.5; ovoid(x, cx - dx, cy - dy, 10, 8.6, ang, g); ovoid(x, cx + dx, cy + dy, 10, 8.6, ang, g); };
      pair(40, 32, 20); pair(98, 28, -30); pair(154, 36, 35); pair(36, 82, -15); pair(128, 76, 8);
      [[70, 106], [88, 100], [106, 104], [124, 108]].forEach(([a, b]) => ovoid(x, a, b, 9.6, 8.4, 10, g));
      pair(78, 64, 60);
    },
    yeast(x, g) { // Candida — budding yeast cells + a short hyphal form (larger than bacteria; not to scale)
      const cell = (cx, cy, ang, bud) => { ovoid(x, cx, cy, 19, 14.5, ang, g); if (bud) { const a = rad(ang + bud); ovoid(x, cx + Math.cos(a) * 24, cy + Math.sin(a) * 20, 9, 7.5, ang, g); } };
      [[52, 104, 34, 13, -8], [92, 100, 36, 12, -4]].forEach(([a, b, l, w, c]) => capsule(x, a, b, l, w, c, g));
      cell(42, 38, -24, -20); cell(104, 34, 26, 150); cell(160, 40, -10, 200); cell(28, 78, 60, 0); cell(98, 66, -8, 30);
    },
  };

  // ------------------------------------------------------------------ badges
  function o2Badge(x, cx, cy, r, type) {
    x.save();
    x.beginPath(); x.arc(cx, cy, r + r * 0.14, 0, Math.PI * 2); x.fillStyle = P.ivory; x.fill();
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2);
    const gr = x.createLinearGradient(cx, cy - r, cx, cy + r);
    if (type === 'an') { gr.addColorStop(0, '#26305c'); gr.addColorStop(1, P.o2an); } else { gr.addColorStop(0, '#3cc0f2'); gr.addColorStop(1, '#1486c0'); }
    x.fillStyle = gr; x.fill();
    const k = type === 'an' ? 0.84 : 1;                 // anaerobe: slightly smaller letters inside the no-symbol
    if (type === 'an') {                                 // ring + slash first, letters on top, so the "O" stays whole
      x.lineCap = 'round'; x.strokeStyle = P.slash;
      x.beginPath(); x.arc(cx, cy, r * 0.88, 0, Math.PI * 2); x.lineWidth = r * 0.13; x.stroke();
      x.beginPath(); x.moveTo(cx - r * 0.62, cy + r * 0.62); x.lineTo(cx + r * 0.62, cy - r * 0.62); x.lineWidth = r * 0.13; x.stroke();
    }
    x.fillStyle = '#ffffff'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.font = `800 ${r * 0.98 * k}px ${IN}`; const wO = x.measureText('O').width;
    x.font = `800 ${r * 0.58 * k}px ${IN}`; const w2 = x.measureText('2').width;
    const x0 = cx - (wO + w2) / 2 - r * 0.02;
    x.font = `800 ${r * 0.98 * k}px ${IN}`; x.fillText('O', x0, cy + r * 0.3 * k);
    x.font = `800 ${r * 0.58 * k}px ${IN}`; x.fillText('2', x0 + wO + r * 0.02, cy + r * 0.5 * k);
    x.restore();
  }
  function yeastBadge(x, cx, cy, h) {
    x.save(); x.font = `700 ${h * 0.74}px ${BC}`; const w = x.measureText('YEAST').width + h * 0.9;
    rr(x, cx - w / 2 - 3, cy - h / 2 - 3, w + 6, h + 6, h / 2 + 3); x.fillStyle = P.ivory; x.fill();
    rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); const gr = x.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); gr.addColorStop(0, P.yst.main); gr.addColorStop(1, P.yst.dark); x.fillStyle = gr; x.fill();
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('YEAST', cx, cy + h * 0.04);
    x.restore(); return w;
  }
  /** molar silhouette in a w x h box (top-left x0,y0) */
  function toothPath(x, x0, y0, w, h) {
    const p = (u, v) => [x0 + u * w, y0 + v * h];
    x.beginPath(); x.moveTo(...p(0.2, 0.06));
    x.bezierCurveTo(...p(0.04, 0.04), ...p(0.0, 0.3), ...p(0.07, 0.46));
    x.bezierCurveTo(...p(0.13, 0.6), ...p(0.14, 0.8), ...p(0.2, 0.95));
    x.bezierCurveTo(...p(0.23, 1.02), ...p(0.33, 1.0), ...p(0.36, 0.9));
    x.bezierCurveTo(...p(0.4, 0.75), ...p(0.42, 0.62), ...p(0.5, 0.62));
    x.bezierCurveTo(...p(0.58, 0.62), ...p(0.6, 0.75), ...p(0.64, 0.9));
    x.bezierCurveTo(...p(0.67, 1.0), ...p(0.77, 1.02), ...p(0.8, 0.95));
    x.bezierCurveTo(...p(0.86, 0.8), ...p(0.87, 0.6), ...p(0.93, 0.46));
    x.bezierCurveTo(...p(1.0, 0.3), ...p(0.96, 0.04), ...p(0.8, 0.06));
    x.bezierCurveTo(...p(0.68, 0.07), ...p(0.62, 0.15), ...p(0.5, 0.15));
    x.bezierCurveTo(...p(0.38, 0.15), ...p(0.32, 0.07), ...p(0.2, 0.06)); x.closePath();
  }

  // ------------------------------------------------------------------ card faces
  function foilBorder(x, w, h, r, g) {
    const gr = x.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, g.light); gr.addColorStop(0.2, g.main); gr.addColorStop(0.5, g.dark); gr.addColorStop(0.8, g.main); gr.addColorStop(1, g.light);
    x.fillStyle = gr; rr(x, 0, 0, w, h, r); x.fill();
    x.strokeStyle = rgba(g.deep, 0.6); x.lineWidth = 1; rr(x, 0.5, 0.5, w - 1, h - 1, r); x.stroke();
  }
  function artWindow(x, ax, ay, aw, ah, r, g) {
    const gr = x.createRadialGradient(ax + aw * 0.4, ay + ah * 0.35, 4, ax + aw * 0.5, ay + ah * 0.5, aw * 0.75);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, g.tint); gr.addColorStop(1, g.tint2);
    rr(x, ax, ay, aw, ah, r); x.fillStyle = gr; x.fill();
  }
  function obliqueName(x, name, px, py, size, avail, color) {
    x.save(); x.translate(px, py); x.font = `600 ${size}px ${BC}`;
    const w = x.measureText(name).width; if (w > avail) x.scale(avail / w, 1);
    x.transform(1, 0, -0.17, 1, 0, 0); x.fillStyle = color; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(name, 0, 0); x.restore();
  }

  function buildFace(d) {
    const c = mk(CW * SS, CH * SS), x = c.getContext('2d'); x.scale(SS, SS);
    const g = P[d.gram];
    foilBorder(x, CW, CH, CR, g);
    rr(x, 7, 7, CW - 14, CH - 14, 10); x.fillStyle = P.paper; x.fill();
    // name strip
    x.save(); rr(x, 7, 7, CW - 14, CH - 14, 10); x.clip();
    let gr = x.createLinearGradient(0, 7, 0, 58); gr.addColorStop(0, g.main); gr.addColorStop(1, g.dark);
    x.fillStyle = gr; x.fillRect(7, 7, CW - 14, 51);
    x.fillStyle = rgba('#ffffff', 0.13); x.fillRect(7, 7, CW - 14, 4);
    x.restore();
    obliqueName(x, d.name, 16, 43, 30, CW - 30, '#ffffff');
    // art
    const ax = 13, ay = 64, aw = CW - 26, ah = 126;
    artWindow(x, ax, ay, aw, ah, 8, g);
    x.save(); rr(x, ax, ay, aw, ah, 8); x.clip(); x.translate(ax, ay); ICONS[d.icon](x, g); x.restore();
    rr(x, ax + 0.75, ay + 0.75, aw - 1.5, ah - 1.5, 8); x.lineWidth = 1.5; x.strokeStyle = rgba(g.dark, 0.35); x.stroke();
    // type badge (inside the strip of the card that stays visible in a cascade)
    if (d.o2) o2Badge(x, CW - 40, 157, 23, d.o2); else yeastBadge(x, CW - 62, 164, 34);
    // lower block: type line + shape (fine print; repeats the frame colour and the badge)
    const pillTxt = d.gram === 'neg' ? 'GRAM −' : d.gram === 'pos' ? 'GRAM +' : 'FUNGUS';
    x.font = `700 22px ${BC}`; const pw = x.measureText(pillTxt).width + 18;
    rr(x, 16, 203, pw, 30, 15); x.fillStyle = g.main; x.fill();
    x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(pillTxt, 25, 219);
    x.font = `600 24px ${BC}`; x.fillStyle = g.deep; x.textBaseline = 'alphabetic';
    x.fillText(d.o2 === 'an' ? 'ANAEROBE' : d.o2 === 'fac' ? 'FACULTATIVE' : 'YEAST', 16 + pw + 9, 227);
    x.fillStyle = rgba(g.dark, 0.25); x.fillRect(16, 243, CW - 32, 1.5);
    x.font = `italic 500 22px ${IN}`; x.fillStyle = P.inkSoft; x.fillText(d.shape, 16, 272);
    return c;
  }

  function buildBack(mark) {
    const c = mk(CW * SS, CH * SS), x = c.getContext('2d'); x.scale(SS, SS);
    rr(x, 0, 0, CW, CH, CR); x.fillStyle = P.ivory; x.fill();
    x.strokeStyle = 'rgba(40,30,10,.35)'; x.lineWidth = 1; rr(x, 0.5, 0.5, CW - 1, CH - 1, CR); x.stroke();
    x.save(); rr(x, 9, 9, CW - 18, CH - 18, 9); x.clip();
    const gr = x.createLinearGradient(0, 0, CW, CH); gr.addColorStop(0, P.navy2); gr.addColorStop(0.55, P.navy); gr.addColorStop(1, '#0c1128');
    x.fillStyle = gr; x.fillRect(0, 0, CW, CH);
    x.strokeStyle = rgba(P.gold, 0.3); x.lineWidth = 1.2;
    for (let i = -CH; i < CW + CH; i += 21) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + CH, CH); x.stroke(); x.beginPath(); x.moveTo(i, CH); x.lineTo(i + CH, 0); x.stroke(); }
    x.restore();
    rr(x, 17, 17, CW - 34, CH - 34, 6); x.strokeStyle = rgba(P.gold, 0.85); x.lineWidth = 2; x.stroke();
    // medallion
    const cx = CW / 2, cy = CH / 2;
    x.beginPath(); x.arc(cx, cy, 58, 0, Math.PI * 2); x.fillStyle = '#0d1230'; x.fill();
    x.beginPath(); x.arc(cx, cy, 58, 0, Math.PI * 2); x.strokeStyle = P.gold; x.lineWidth = 3; x.stroke();
    x.beginPath(); x.arc(cx, cy, 49, 0, Math.PI * 2); x.strokeStyle = rgba(P.gold, 0.5); x.lineWidth = 1.2; x.stroke();
    if (mark === '?') {
      x.font = `700 84px ${BC}`; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      const g2 = x.createLinearGradient(0, cy - 34, 0, cy + 34); g2.addColorStop(0, P.goldPale); g2.addColorStop(1, P.goldDeep);
      x.fillStyle = g2; x.fillText('?', cx, cy + 29);
    } else {
      toothPath(x, cx - 26, cy - 34, 52, 66); x.strokeStyle = P.gold; x.lineWidth = 3; x.lineJoin = 'round'; x.stroke();
      x.fillStyle = rgba(P.gold, 0.16); x.fill();
    }
    // corner diamonds
    if (mark === '?') { // corner indices, so the card is recognisable when only a sliver shows in a fanned hand
      x.font = `700 34px ${BC}`; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = P.gold;
      x.fillText('?', 34, 52); x.save(); x.translate(CW - 34, CH - 52); x.rotate(Math.PI); x.fillText('?', 0, 0); x.restore();
      [[CW - 30, 30], [30, CH - 30]].forEach(([a, b]) => { x.save(); x.translate(a, b); x.rotate(Math.PI / 4); x.fillRect(-4, -4, 8, 8); x.restore(); });
    } else [[30, 30], [CW - 30, 30], [30, CH - 30], [CW - 30, CH - 30]].forEach(([a, b]) => { x.save(); x.translate(a, b); x.rotate(Math.PI / 4); x.fillStyle = P.gold; x.fillRect(-4, -4, 8, 8); x.restore(); });
    return c;
  }

  function buildShadow() {
    const pad = 44, c = mk((CW + pad * 2), (CH + pad * 2)), x = c.getContext('2d');
    x.filter = 'blur(13px)'; x.fillStyle = 'rgba(0,0,0,0.9)'; rr(x, pad, pad, CW, CH, CR + 4); x.fill();
    return { c, pad };
  }

  function buildFelt() {
    const W = 1080, H = 1920, c = mk(W, H), x = c.getContext('2d');
    const gr = x.createRadialGradient(W / 2, H * 0.46, 80, W / 2, H * 0.5, 1180);
    gr.addColorStop(0, P.feltA); gr.addColorStop(0.5, P.feltB); gr.addColorStop(1, P.feltC);
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    // felt grain: fine deterministic speckle + short fibres
    const id = x.getImageData(0, 0, W, H), d = id.data; let s = 0x2545f491;
    for (let i = 0; i < d.length; i += 4) { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; const n = ((s >>> 0) / 4294967296 - 0.5) * 15; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
    x.putImageData(id, 0, 0);
    const r = rng(2611); x.lineCap = 'round';
    for (let i = 0; i < 2600; i++) { const a = r() * W, b = r() * H, an = r() * Math.PI, l = 3 + r() * 7; x.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'; x.lineWidth = 1; x.beginPath(); x.moveTo(a, b); x.lineTo(a + Math.cos(an) * l, b + Math.sin(an) * l); x.stroke(); }
    // printed table border
    x.strokeStyle = rgba(P.gold, 0.2); x.lineWidth = 2.5; rr(x, 26, 26, W - 52, H - 52, 44); x.stroke();
    x.strokeStyle = rgba(P.gold, 0.11); x.lineWidth = 1.5; rr(x, 38, 38, W - 76, H - 76, 34); x.stroke();
    // vignette
    const vg = x.createRadialGradient(W / 2, H / 2, 620, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    x.fillStyle = vg; x.fillRect(0, 0, W, H);
    return c;
  }

  // ------------------------------------------------------------------ roster
  // Gram stain: genus lists in Siqueira & Rôças, J Oral Microbiol 2009. Oxygen tolerance and shape: see RESEARCH.md section (i).
  const ROSTER = {
    fuso: { name: 'Fusobacterium', gram: 'neg', o2: 'an', icon: 'spindles', shape: 'spindle-shaped' },
    parvi: { name: 'Parvimonas', gram: 'pos', o2: 'an', icon: 'cocci', shape: 'small cocci' },
    porph: { name: 'Porphyromonas', gram: 'neg', o2: 'an', icon: 'rodsPlump', shape: 'short rods' },
    olsen: { name: 'Olsenella', gram: 'pos', o2: 'an', icon: 'rodsChain', shape: 'short rods' },
    trepo: { name: 'Treponema', gram: 'neg', o2: 'an', icon: 'spiro', shape: 'spirochetes' },
    prevo: { name: 'Prevotella', gram: 'neg', o2: 'an', icon: 'rodsShort', shape: 'short rods' },
    tanne: { name: 'Tannerella', gram: 'neg', o2: 'an', icon: 'fusiform', shape: 'fusiform rods' },
    pseud: { name: 'Pseudoramibacter', gram: 'pos', o2: 'an', icon: 'rodsSlender', shape: 'rods' },
    strep: { name: 'Streptococcus', gram: 'pos', o2: 'fac', icon: 'chains', shape: 'cocci in chains' },
    diali: { name: 'Dialister', gram: 'neg', o2: 'an', icon: 'coccobacilli', shape: 'coccobacilli' },
    efaec: { name: 'E. faecalis', gram: 'pos', o2: 'fac', icon: 'diplo', shape: 'cocci' },
    candi: { name: 'Candida', gram: 'yst', o2: null, icon: 'yeast', shape: 'budding yeast' },
  };

  const Cards = {
    CW, CH, CR, SS, P, BC, IN, ROSTER, ICONS, mk, rr, rad, o2Badge, yeastBadge, toothPath, foilBorder, artWindow, obliqueName, capsule, coccus, ovoid,
    sprites: {},
    build() {
      for (const k in ROSTER) this.sprites[k] = buildFace(ROSTER[k]);
      this.sprites.back = buildBack('tooth');
      this.sprites.backQ = buildBack('?');
      this.shadow = buildShadow();
      this.felt = buildFelt();
    },
  };
  window.Cards = Cards;
})();
