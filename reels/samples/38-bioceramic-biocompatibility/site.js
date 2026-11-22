/*
 * Reel 38 — construction-site diorama: palette, flat-vector primitives, workers, props, backdrop.
 * Canvas 2D, fully deterministic (everything is a function of t passed in by the caller).
 */
const { canvas, ctx } = Kit.createCanvas();
const { seg, ease, clamp, lerp, hash } = Kit;
const W = 1080, H = 1920, TAU = Math.PI * 2;
const G = 1168;                       // baseline the figures stand on
const BAND_T = 1146, BAND_B = 1216;   // top surface of the ground slab (long shadows fall here)
const FACE_B = 1300;                  // bottom of the cut face of the slab

const C = {
  sky0: '#54B1E9', sky1: '#8CCFF3', sky2: '#D6F0FB',
  far: '#C3E4F5', far2: '#A9D5EC',
  orange: '#FF7A1A', orangeD: '#DB5A00', orangeL: '#FFA55E',
  yellow: '#FFC928', yellowD: '#E6A800', yellowL: '#FFE382',
  navy: '#1D2936', navy2: '#2C3B4D', steel: '#647A90', steelL: '#8CA0B3',
  conc: '#B8BEC5', concL: '#D3D7DC', concD: '#98A0AA', concX: '#7B848E',
  dentin: '#F3E3B5', dentinL: '#FBF1D2', dentinD: '#DCC78C', gp: '#F08A62', gpL: '#F6A683',
  cem: '#FFBE55', cemL: '#FFD88E', cemD: '#DE9423',
  bone: '#E9D8AC', boneD: '#CDB983', boneN: '#FFF8E3', boneNL: '#E5D6A9', marrow: '#EEA78F',
  sand: '#EBD2A4', sandL: '#F6E5C2', soil: '#C6935F', soilD: '#AE7B49', deep: '#212B38', deep2: '#2A3645',
  red: '#E5383B', redD: '#B4232B', green: '#1FA35B', greenD: '#157C45', white: '#FFFFFF', paper: '#FFFDF4',
  wood: '#D9A65E', woodD: '#B98440',
  skin: ['#F4C59C', '#D99F72', '#A66E48', '#7A4A2B', '#EBB58A'],
  hair: ['#3A2A20', '#1E1A18', '#7A4A22', '#C9973F', '#4A3524'],
};
const F = {
  osw7: (px) => `700 ${px}px Oswald`,
  osw5: (px) => `500 ${px}px Oswald`,
  bc5: (px) => `500 ${px}px "Barlow Condensed"`,
  bc6: (px) => `600 ${px}px "Barlow Condensed"`,
  bc7: (px) => `700 ${px}px "Barlow Condensed"`,
  bci: (px) => `italic 500 ${px}px "Barlow Condensed"`,
  b5: (px) => `500 ${px}px Barlow`,
};

// ---------------------------------------------------------------- primitives
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); }
function fillRR(x, y, w, h, r, c) { rr(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function strokeRR(x, y, w, h, r, c, lw) { rr(x, y, w, h, r); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function line(x1, y1, x2, y2, c, lw, cap) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = cap || 'round'; ctx.stroke(); }
function circ(x, y, r, c) { if (r <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function poly(p, c) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
function txt(s, x, y, font, c, align, ls) {
  ctx.font = font; ctx.fillStyle = c; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = (ls || 0) + 'px'; ctx.fillText(s, x + (align === 'center' ? (ls || 0) / 2 : 0), y); ctx.letterSpacing = '0px';
}
function tw(s, font, ls) { ctx.font = font; ctx.letterSpacing = (ls || 0) + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
function fit(s, maxW, px, fontFn, ls) { let p = px; while (p > 20 && tw(s, fontFn(p), ls) > maxW) p -= 2; return p; }
/** draw fn() scaled about (x,y) with an overshoot pop; u in 0..1 */
function popAt(x, y, u, fn) {
  if (u <= 0) return; const k = ease.outBack(clamp(u));
  ctx.save(); ctx.globalAlpha *= Math.min(1, u * 3); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); fn(); ctx.restore();
}

// ---------------------------------------------------------------- draw queue (shadows first, then z-sorted objects)
let Q = [];
function add(z, dr, sh) { Q.push({ z, dr, sh, i: Q.length }); }
function flush() {
  for (const q of Q) if (q.sh) q.sh();
  Q.sort((a, b) => a.z - b.z || a.i - b.i);
  for (const q of Q) q.dr();
  Q = [];
}
// long soft shadow: silhouette sheared down-right onto the ground band, fading with height
const SH_KX = 1.35, SH_KY = 0.42;
let ZS = 1;                           // zoom of the plot being drawn (set by render)
function shadow(x0, y0, h, fn, a) {
  ctx.save();
  const yt = G + (BAND_T + 5 - G) / ZS, yb = G + (BAND_B - G) / ZS;
  ctx.beginPath(); ctx.rect(-400, yt, 1900, yb - yt); ctx.clip();
  ctx.translate(x0, y0); ctx.transform(1, 0, -SH_KX, -SH_KY, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, -Math.min(h, 125));
  g.addColorStop(0, `rgba(60,48,70,${a || 0.26})`); g.addColorStop(1, 'rgba(60,48,70,0.03)');
  ctx.fillStyle = g; fn(); ctx.restore();
}
function boxShadow(x, y, w, h, a) { shadow(x, y, h, () => ctx.fillRect(0, -h, w, h), a); }

// ---------------------------------------------------------------- backdrop
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, BAND_T);
  g.addColorStop(0, C.sky0); g.addColorStop(0.5, C.sky1); g.addColorStop(1, C.sky2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, BAND_T + 2);
  circ(176, 676, 156, 'rgba(255,250,215,0.15)'); circ(176, 676, 112, 'rgba(255,250,215,0.24)'); circ(176, 676, 72, '#FFF6CB');
}
function cloud(x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.93)';
  rr(x, y, 236 * s, 50 * s, 25 * s); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 72 * s, y + 6 * s, 38 * s, 0, TAU); ctx.arc(x + 132 * s, y - 8 * s, 50 * s, 0, TAU); ctx.arc(x + 182 * s, y + 12 * s, 30 * s, 0, TAU); ctx.fill();
}
const CLOUDS = [[70, 610, 0.95], [600, 706, 0.7], [850, 596, 0.85], [360, 818, 0.5], [690, 912, 0.46]];
function drawClouds(cam, t) {
  CLOUDS.forEach((c, i) => {
    const drift = 9 * Math.sin(TAU * t / 24 + i * 1.7);
    let x = ((c[0] - cam * 0.2 + drift) % 1080 + 1080) % 1080;
    cloud(x, c[1], c[2]); cloud(x - 1080, c[1], c[2]);
  });
}
function skyLayer(off, period, col, seed, maxH, winA) {
  const o = ((off % period) + period) % period;
  for (let x0 = -o; x0 < W; x0 += period) {
    let x = 0, i = 0;
    while (x < period) {
      const w = 56 + hash(i, seed) * 96, h = 46 + hash(i, seed + 7) * maxH, gap = hash(i, seed + 3) < 0.28 ? 26 + hash(i, seed + 5) * 70 : 0;
      const sx = x0 + x;
      if (sx < W && sx + w > 0) {
        rect(sx, 1150 - h, w + 1, h, col);
        const k = hash(i, seed + 11);
        if (k < 0.3) rect(sx + w * 0.3, 1150 - h - 16, w * 0.4, 16, col);            // plant room
        else if (k < 0.45) rect(sx + w * 0.5 - 2, 1150 - h - 34, 4, 34, col);         // mast
        if (winA && h > 90) {                                                          // window grid
          ctx.fillStyle = `rgba(255,255,255,${winA})`;
          for (let wy = 1150 - h + 14; wy < 1090; wy += 22) for (let wx = sx + 10; wx < sx + w - 14; wx += 18) if (hash(i, wx | 0, wy | 0) > 0.35) ctx.fillRect(wx, wy, 9, 11);
        }
      }
      x += w + gap; i++;
    }
  }
}
function drawSkyline(cam) {
  skyLayer(cam * 0.4, 2160, C.far, 3, 250, 0.28);
  skyLayer(cam * 0.6 + 300, 3240, C.far2, 17, 150, 0.22);
}
/** ground slab in world coordinates (ctx already translated by -cam) */
function drawGround(cam) {
  const x0 = cam - 30, w = W + 60, SK = 3 * 1080;
  rect(x0, BAND_T, w, BAND_B - BAND_T, C.sand); rect(x0, BAND_T, w, 5, C.sandL);
  rect(SK, BAND_T, 1080, BAND_B - BAND_T, '#F5C3AE'); rect(SK, BAND_T, 1080, 7, '#E99F87');           // skin plot
  for (let i = Math.floor(x0 / 45); i < (x0 + w) / 45; i++) {
    const m = ((i % 120) + 120) % 120, h1 = hash(m, 91);
    if (h1 < 0.5) { const x = i * 45 + h1 * 40, y = BAND_T + 14 + hash(m, 92) * (BAND_B - BAND_T - 26), sk = x > SK && x < SK + 1080; fillRR(x, y, 9 + hash(m, 93) * 18, 4, 2, sk ? 'rgba(205,110,90,0.25)' : 'rgba(170,125,70,0.26)'); }
  }
  // cut face of the slab
  rect(x0, BAND_B, w, 40, C.soil); rect(x0, BAND_B + 40, w, FACE_B - BAND_B - 40, C.soilD); rect(x0, BAND_B, w, 5, 'rgba(110,70,30,0.22)');
  rect(SK, BAND_B, 1080, FACE_B - BAND_B, '#EFA58D'); rect(SK, BAND_B, 1080, 8, '#D98470');
  for (let i = Math.floor(x0 / 45); i < (x0 + w) / 45; i++) {
    const m = ((i % 120) + 120) % 120, x = i * 45 + hash(m, 51) * 30, sk = x > SK - 10 && x < SK + 1080;
    if (sk) { circ(x, 1280 - hash(m, 52) * 12, 15 + hash(m, 53) * 9, '#FFDD95'); circ(x + 22, 1290, 12, '#FFD27F'); }         // fat lobules
    else if (hash(m, 54) < 0.6) fillRR(x, BAND_B + 14 + hash(m, 55) * 52, 12 + hash(m, 56) * 20, 8 + hash(m, 57) * 7, 5, hash(m, 58) < 0.5 ? 'rgba(255,235,200,0.35)' : 'rgba(110,70,35,0.3)');
  }
  // underground
  rect(x0, FACE_B, w, H - FACE_B, C.deep);
  for (let i = Math.floor(x0 / 90); i < (x0 + w) / 90; i++) {
    const m = ((i % 60) + 60) % 60;
    fillRR(i * 90 + hash(m, 61) * 60, 1610 + hash(m, 62) * 260, 26 + hash(m, 63) * 50, 14 + hash(m, 64) * 16, 9, C.deep2);
  }
}
/** pale site hoarding along the back of a plot (local coords) */
function fence(x0, x1) {
  add(0, () => {
    for (let x = x0, i = 0; x < x1; x += 120, i++) {
      rect(x, 1092, 120, 58, i % 2 ? '#DCE8EF' : '#E6EFF4'); rect(x, 1092, 4, 58, '#C6D5DF');
    }
    rect(x0, 1086, x1 - x0, 8, '#FFC9A0');
  });
}
function lattice(x, y0, y1, w, col, lw) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y0); ctx.lineTo(x - w / 2, y1); ctx.moveTo(x + w / 2, y0); ctx.lineTo(x + w / 2, y1);
  for (let y = y1, i = 0; y > y0; y -= w, i++) {
    const yy = Math.max(y0, y - w);
    if (i % 2) { ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, yy); } else { ctx.moveTo(x + w / 2, y); ctx.lineTo(x - w / 2, yy); }
    ctx.moveTo(x - w / 2, yy); ctx.lineTo(x + w / 2, yy);
  }
  ctx.stroke();
}
function latticeH(x0, x1, y, h, col, lw) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.moveTo(x0, y + h); ctx.lineTo(x1, y + h);
  const n = Math.max(1, Math.round(Math.abs(x1 - x0) / h)), dx = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const a = x0 + i * dx; if (i % 2) { ctx.moveTo(a, y); ctx.lineTo(a + dx, y + h); } else { ctx.moveTo(a, y + h); ctx.lineTo(a + dx, y); } }
  ctx.stroke();
}
/** small pale tower crane in the back: mast base (x, 1150), jib at yJ; hook hangs at xH down to yH carrying a pallet */
function towerCrane(x, yJ, reach, xH, yH, col) {
  lattice(x, yJ + 26, 1150, 30, col, 3.5);
  fillRR(x - 20, yJ - 6, 40, 34, 5, col); rect(x - 12, yJ + 2, 16, 14, 'rgba(255,255,255,0.65)');
  latticeH(x + 20, x + reach, yJ, 18, col, 3); latticeH(x - 20, x - reach * 0.3, yJ, 18, col, 3);
  fillRR(x - reach * 0.3 - 8, yJ + 14, 44, 30, 4, '#B9C6D1');
  poly([x - 6, yJ - 6, x + 6, yJ - 6, x, yJ - 66], col);
  line(x, yJ - 62, x + reach * 0.72, yJ, col, 2.5); line(x, yJ - 62, x - reach * 0.3, yJ, col, 2.5);
  fillRR(xH - 13, yJ + 14, 26, 12, 3, '#8FA2B4'); line(xH, yJ + 24, xH, yH, '#8FA2B4', 2.5);
  line(xH, yH, xH - 26, yH + 20, '#8FA2B4', 2); line(xH, yH, xH + 26, yH + 20, '#8FA2B4', 2);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) fillRR(xH - 27 + c * 18, yH + 20 + r * 11, 17, 10, 2, r ? '#F3E2B0' : '#FBF0CC');
  rect(xH - 30, yH + 42, 60, 5, C.woodD);
}

// ---------------------------------------------------------------- props
function block(x, y, w, h, label, seed, labelPx) {
  fillRR(x, y, w, h, 5, C.conc);
  ctx.save(); rr(x, y, w, h, 5); ctx.clip();
  rect(x, y, w, 9, C.concL); rect(x + w - 12, y, 12, h, C.concD); rect(x, y + h - 8, w, 8, C.concD);
  const n = Math.round(w * h / 1500);
  for (let i = 0; i < n; i++) {
    const px = x + 8 + hash(i, seed) * (w - 28), py = y + 16 + hash(i, seed + 1) * (h - 30), r = 2 + hash(i, seed + 2) * 4.5;
    circ(px, py, r, hash(i, seed + 3) < 0.5 ? 'rgba(125,134,144,0.55)' : 'rgba(225,229,233,0.8)');
  }
  rect(x, y + h * 0.5, w - 12, 2.5, 'rgba(125,134,144,0.35)');
  ctx.restore();
  if (label) { const px = labelPx || 44; txt(label, x + (w - 12) / 2, y + h * 0.5 - 14, F.osw7(px), '#6C7681', 'center', 2); }
}
function cone(x, y, s) {
  s = s || 1;
  fillRR(x - 19 * s, y - 6 * s, 38 * s, 7 * s, 3 * s, C.orangeD);
  poly([x - 13 * s, y - 6 * s, x + 13 * s, y - 6 * s, x + 4 * s, y - 46 * s, x - 4 * s, y - 46 * s], C.orange);
  poly([x - 9.5 * s, y - 20 * s, x + 9.5 * s, y - 20 * s, x + 7.2 * s, y - 31 * s, x - 7.2 * s, y - 31 * s], '#FFF6E6');
}
function pallet(x, y, col, colD, rows) {
  rect(x - 44, y - 6, 88, 6, C.woodD); rect(x - 40, y, 12, 8, C.woodD); rect(x - 6, y, 12, 8, C.woodD); rect(x + 28, y, 12, 8, C.woodD);
  rows = rows || 3;
  for (let r = 0; r < rows; r++) for (let c = 0; c < 3 - (r === rows - 1 ? 1 : 0); c++) {
    const bx = x - 40 + c * 27 + (r % 2) * 8 + (r === rows - 1 ? 8 : 0), by = y - 6 - (r + 1) * 15;
    fillRR(bx, by, 25, 14, 3, col); rect(bx + 2, by + 10, 21, 3, colD);
  }
}
function ladder(x, yT, yB, w) {
  line(x, yT - 26, x, yB, C.steel, 5, 'butt'); line(x + w, yT - 26, x + w, yB, C.steel, 5, 'butt');
  for (let y = yB - 16; y > yT - 20; y -= 22) line(x, y, x + w, y, C.steelL, 4, 'butt');
}
/** scaffold bay: standards at xa/xb from ground to yTop, plank deck at yDeck, guard rails above */
function scaffoldBay(xa, xb, yDeck, yTop, base) {
  const yB = base || G + 2;
  line(xa, yB, xa, yTop, C.steel, 6, 'butt'); line(xb, yB, xb, yTop, C.steel, 6, 'butt');
  line(xa, yDeck + 13, xb, yDeck + 13, C.steel, 5, 'butt');
  line(xa, yDeck - 52, xb, yDeck - 52, C.steelL, 4, 'butt'); line(xa, yTop + 6, xb, yTop + 6, C.steelL, 4, 'butt');
  line(xa, yB - 4, xb, yDeck + 13, C.steelL, 3.5, 'butt');
  fillRR(xa - 9, yDeck, xb - xa + 18, 10, 3, C.wood); rect(xa - 9, yDeck + 7, xb - xa + 18, 3, C.woodD);
  for (const x of [xa, xb]) { fillRR(x - 6, yDeck + 8, 12, 11, 3, C.orange); fillRR(x - 6, yDeck - 57, 12, 10, 3, C.orange); fillRR(x - 9, yB - 5, 18, 6, 2, C.navy2); }
}
function beacon(x, y, t, I) {
  const p = 0.5 + 0.5 * Math.sin(t * 4.4);
  circ(x, y - 76, 30 + 16 * p, `rgba(229,56,59,${0.20 * I})`); circ(x, y - 76, 19 + 6 * p, `rgba(229,56,59,${0.30 * I})`);
  line(x, y - 62, x - 16, y, C.navy2, 4); line(x, y - 62, x + 16, y, C.navy2, 4); line(x, y - 62, x, y - 6, C.navy2, 4);
  fillRR(x - 9, y - 70, 18, 9, 3, C.navy);
  ctx.beginPath(); ctx.arc(x, y - 70, 11, Math.PI, 0); ctx.closePath(); ctx.fillStyle = Kit.rgba(Kit.mix('#8D3A40', C.red, 0.35 + 0.65 * I)); ctx.fill();
  circ(x - 3, y - 76, 3, `rgba(255,255,255,${0.35 + 0.4 * I * p})`);
}
function wheelbarrow(x, y, col, load) {
  line(x + 52, y - 36, x + 6, y - 22, C.steel, 4); line(x + 20, y - 18, x + 26, y, C.steel, 4);
  poly([x - 30, y - 40, x + 26, y - 40, x + 16, y - 16, x - 18, y - 16], col); rect(x - 30, y - 40, 56, 5, C.orangeD);
  if (load) for (let i = 0; i < 3; i++) fillRR(x - 24 + i * 16, y - 52 + (i % 2) * 3, 15, 12, 3, load);
  circ(x - 20, y - 9, 10, C.navy); circ(x - 20, y - 9, 4, C.concL);
}
/** site board on two posts */
function postBoard(x, y, w, h, yGround, face, border, post) {
  rect(x + 26, y + h - 4, 10, yGround - y - h + 4, post || '#A9B8C5'); rect(x + w - 36, y + h - 4, 10, yGround - y - h + 4, post || '#A9B8C5');
  fillRR(x + 7, y + 9, w, h, 10, 'rgba(25,45,75,0.16)');
  fillRR(x, y, w, h, 10, border); fillRR(x + 7, y + 7, w - 14, h - 14, 5, face);
}

// ---------------------------------------------------------------- workers (cells)
const ROLE = {
  builder: { helmet: C.yellow, helmetD: C.yellowD, vest: C.orange, vestD: C.orangeD, stripe: '#FFF3C4', sleeve: '#3E5C82', pants: '#2F4156', pantsD: '#263649' },
  red: { helmet: C.red, helmetD: C.redD, vest: '#C7353A', vestD: '#A1262C', stripe: '#F3A7A6', sleeve: '#8E2329', pants: '#3B2C36', pantsD: '#30232C' },
  hire: { helmet: null, vest: '#B3C3D1', vestD: '#97A9BA', stripe: null, sleeve: '#B3C3D1', pants: '#56697D', pantsD: '#49596B' },
  foreman: { helmet: '#FFFFFF', helmetD: '#D2DAE2', vest: '#24486D', vestD: '#1B3856', stripe: C.yellow, sleeve: '#24486D', pants: '#2B3440', pantsD: '#222A34' },
  sil: { helmet: C.red, helmetD: C.redD, vest: '#768A9E', vestD: '#66798C', stripe: null, sleeve: '#768A9E', pants: '#5F7388', pantsD: '#566A7E', skin: '#93A6B8' },
};
function workerShadow(x, y, s) {
  s = s || 1;
  shadow(x, y, 110 * s, () => { ctx.beginPath(); ctx.roundRect(-14 * s, -84 * s, 28 * s, 84 * s, 8 * s); ctx.fill(); ctx.beginPath(); ctx.arc(0, -96 * s, 14 * s, 0, TAU); ctx.fill(); }, 0.24);
}
/**
 * o: {x,y,s,dir,role,skinI,hairI,leg (swing rad),armF,armB (raise angle: 0 down, PI/2 forward, PI up),bob,
 *     carry:'brick'|'trowel'|'mega'|'flagpole', recruit:0..1 (hire -> builder), helmetDrop:0..1, brickCol}
 */
function worker(o) {
  const s = o.s || 1, dir = o.dir || 1, R = ROLE[o.role], B = ROLE.builder;
  const rec = o.recruit || 0;
  const mixc = (a, b) => rec > 0 ? Kit.rgba(Kit.mix(a, b, rec)) : a;
  const vest = o.role === 'hire' ? mixc(R.vest, B.vest) : R.vest;
  const sleeve = o.role === 'hire' ? mixc(R.sleeve, B.sleeve) : R.sleeve;
  const pants = o.role === 'hire' ? mixc(R.pants, B.pants) : R.pants, pantsD = o.role === 'hire' ? mixc(R.pantsD, B.pantsD) : R.pantsD;
  const skin = R.skin || C.skin[(o.skinI || 0) % C.skin.length];
  const leg = o.leg || 0, aF = o.armF != null ? o.armF : -leg * 0.8, aB = o.armB != null ? o.armB : leg * 0.8;
  ctx.save(); ctx.translate(o.x, o.y - (o.bob || 0)); ctx.scale(s * dir, s);
  const arm = (a, col, item) => {
    ctx.save(); ctx.translate(0, -75); ctx.rotate(-a);
    fillRR(-4.6, -3, 9.2, 31, 4.6, col); circ(0, 29, 5.3, skin);
    if (item === 'brick') { fillRR(-4, 30, 22, 12, 3, o.brickCol || C.boneN); rect(-2, 39, 18, 2.5, 'rgba(0,0,0,0.12)'); }
    if (item === 'trowel') { line(0, 29, 6, 40, C.woodD, 4); poly([3, 38, 16, 44, 4, 54], '#C9D1D9'); }
    ctx.restore();
  };
  const legD = (a, col) => { ctx.save(); ctx.translate(0, -42); ctx.rotate(-a); fillRR(-6.2, -2, 12.4, 38, 5, col); fillRR(-6.2, 32, 18, 10, 4.5, '#18212B'); ctx.restore(); };
  arm(aB, o.role === 'hire' ? sleeve : R.vestD, null);
  legD(-leg, pantsD); legD(leg, pants);
  fillRR(-15, -84, 30, 46, 10, vest);                                         // torso
  const st = R.stripe || (rec > 0.5 ? B.stripe : null);
  if (st) { ctx.save(); if (!R.stripe) ctx.globalAlpha *= clamp((rec - 0.5) * 2); rect(-15, -66, 30, 5, st); rect(-15, -55, 30, 5, st); ctx.restore(); }
  rect(-4, -88, 8, 8, skin);                                                  // neck
  circ(1, -97, 12.6, skin);                                                   // head
  circ(7.2, -98, 1.7, 'rgba(30,25,25,0.75)');                                 // eye
  const hd = o.helmetDrop != null ? o.helmetDrop : 1;
  const hasHelmet = R.helmet || o.role === 'hire' && o.helmetDrop != null && o.helmetDrop > 0;
  if (!R.helmet) { ctx.beginPath(); ctx.arc(0.2, -99, 13.2, Math.PI * 0.98, Math.PI * 1.98); ctx.closePath(); ctx.fillStyle = C.hair[(o.hairI || 0) % C.hair.length]; ctx.fill(); }
  if (hasHelmet) {
    const hc = R.helmet || B.helmet, hcD = R.helmetD || B.helmetD;
    const k = R.helmet ? 1 : ease.outBack(clamp(hd)), yy = R.helmet ? 0 : -(1 - k) * 90;
    ctx.save(); ctx.translate(0, yy); ctx.globalAlpha *= R.helmet ? 1 : Math.min(1, hd * 4);
    ctx.beginPath(); ctx.arc(0.6, -100, 14.6, Math.PI, 0); ctx.closePath(); ctx.fillStyle = hc; ctx.fill();
    fillRR(-14.6, -102, 37, 5.6, 2.8, hcD); fillRR(-2.4, -116.4, 6, 7, 2.4, hcD);
    ctx.beginPath(); ctx.arc(0.6, -100, 10.5, Math.PI * 1.12, Math.PI * 1.4); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
  }
  if (o.carry === 'mega') { poly([15, -94, 44, -110, 44, -76], C.orange); fillRR(42, -112, 6, 38, 3, '#FFF6E6'); fillRR(10, -98, 8, 9, 3, C.navy2); }
  arm(aF, sleeve, o.carry === 'mega' ? null : o.carry);
  ctx.restore();
}
/** convenience: queue a worker with its shadow */
function W_(z, o, noShadow) { add(z, () => worker(o), noShadow ? null : () => workerShadow(o.x, o.y > G - 6 ? o.y : G, o.s)); }
/** walking helper: returns {x, moving} for a walk from x0 to x1 between t0 and t1 */
function walk(t, x0, x1, t0, t1) { const u = seg(t, t0, t1); const e = u < 0.85 ? u / 0.925 : (0.85 + (u - 0.85) * (2 - (u - 0.85) / 0.15) / 2) / 0.925; return { x: lerp(x0, x1, e), moving: u > 0 && u < 1, u }; }
const stride = (x) => Math.sin(x / 15) * 0.55;
