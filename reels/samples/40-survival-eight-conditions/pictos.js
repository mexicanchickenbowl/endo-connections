/*
 * Reel 40 — engraved pictograms for the eight conditions. Each is authored in a 200 x 200 box centred on (0,0)
 * (usable radius ~76) and drawn with gold line work; `k` thickens strokes for the small summary medallions.
 * Globals expected: ctx, C (palette). Pure drawing, no state.
 */
const PIC = (() => {
  const TAU = Math.PI * 2;
  const gold = (a = 1) => `rgba(236,201,116,${a})`;
  const hi = (a = 1) => `rgba(252,236,184,${a})`;
  const red = (a = 1) => `rgba(238,124,92,${a})`;

  function stroke(col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  function fill(col) { ctx.fillStyle = col; ctx.fill(); }

  /** single-rooted tooth with one cusp, crown up; (x, y) = cusp tip */
  function single(x, y, w, h) {
    const cw = w / 2, ch = h * 0.42, rh = h - ch;
    ctx.beginPath();
    ctx.moveTo(x - cw * 0.8, y + ch);
    ctx.bezierCurveTo(x - cw * 1.0, y + ch * 0.8, x - cw * 1.04, y + ch * 0.45, x - cw * 0.78, y + ch * 0.24);
    ctx.bezierCurveTo(x - cw * 0.54, y + ch * 0.06, x - cw * 0.22, y, x, y);
    ctx.bezierCurveTo(x + cw * 0.22, y, x + cw * 0.54, y + ch * 0.06, x + cw * 0.78, y + ch * 0.24);
    ctx.bezierCurveTo(x + cw * 1.04, y + ch * 0.45, x + cw * 1.0, y + ch * 0.8, x + cw * 0.8, y + ch);
    ctx.bezierCurveTo(x + cw * 0.74, y + ch + rh * 0.5, x + cw * 0.36, y + ch + rh * 0.88, x + cw * 0.06, y + h);
    ctx.quadraticCurveTo(x, y + h * 1.012, x - cw * 0.06, y + h);
    ctx.bezierCurveTo(x - cw * 0.36, y + ch + rh * 0.88, x - cw * 0.74, y + ch + rh * 0.5, x - cw * 0.8, y + ch);
    ctx.closePath();
  }
  /** cervical line of a single-rooted tooth */
  function cej(x, y, w, h) { const cw = w / 2, ch = h * 0.42; ctx.beginPath(); ctx.moveTo(x - cw * 0.8, y + ch); ctx.quadraticCurveTo(x, y + ch * 1.16, x + cw * 0.8, y + ch); }
  /** two-rooted molar, crown up; (x, y) = top centre */
  function molar(x, y, w, h) {
    const cw = w / 2, ch = h * 0.43;
    ctx.beginPath();
    ctx.moveTo(x - cw * 0.84, y + ch);
    ctx.bezierCurveTo(x - cw * 1.14, y + ch * 0.62, x - cw * 1.06, y + ch * 0.1, x - cw * 0.62, y + ch * 0.03);
    ctx.quadraticCurveTo(x - cw * 0.28, y - ch * 0.02, x, y + ch * 0.2);
    ctx.quadraticCurveTo(x + cw * 0.28, y - ch * 0.02, x + cw * 0.62, y + ch * 0.03);
    ctx.bezierCurveTo(x + cw * 1.06, y + ch * 0.1, x + cw * 1.14, y + ch * 0.62, x + cw * 0.84, y + ch);
    ctx.bezierCurveTo(x + cw * 0.96, y + h * 0.7, x + cw * 0.84, y + h * 0.92, x + cw * 0.7, y + h);
    ctx.bezierCurveTo(x + cw * 0.54, y + h * 0.96, x + cw * 0.46, y + h * 0.72, x, y + ch * 1.24);
    ctx.bezierCurveTo(x - cw * 0.46, y + h * 0.72, x - cw * 0.54, y + h * 0.96, x - cw * 0.7, y + h);
    ctx.bezierCurveTo(x - cw * 0.84, y + h * 0.92, x - cw * 0.96, y + h * 0.7, x - cw * 0.84, y + ch);
    ctx.closePath();
  }
  /** engraver's hatching inside the current path (call right after building the path) */
  function hatch(col, lw, step = 9, slope = 1) {
    ctx.save(); ctx.clip();
    ctx.beginPath();
    for (let d = -220; d <= 220; d += step) { ctx.moveTo(d - 110 * slope, 110); ctx.lineTo(d + 110 * slope, -110); }
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'butt'; ctx.stroke();
    ctx.restore();
  }
  /** rubric "absent / not" stroke across the medallion */
  function slash(k) {
    ctx.beginPath(); ctx.moveTo(58, -58); ctx.lineTo(-58, 58);
    stroke('rgba(8,12,40,0.9)', 13 * k);
    ctx.beginPath(); ctx.moveTo(58, -58); ctx.lineTo(-58, 58);
    stroke(red(1), 6.5 * k);
  }

  const P = [];
  // 1 — nonmolar tooth: one single-rooted tooth
  P[1] = (k) => {
    single(0, -76, 86, 154); fill(gold(0.16));
    single(0, -76, 86, 154); hatch(gold(0.4), 1.3 * k, 8);
    single(0, -76, 86, 154); stroke(hi(1), 3.6 * k);
    cej(0, -76, 86, 154); stroke(hi(0.9), 2.2 * k);
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.bezierCurveTo(-4, 24, -2, 52, 0, 70); stroke(gold(0.8), 1.8 * k);   // canal
  };
  // 2 — both mesial and distal adjacent teeth present
  P[2] = (k) => {
    for (const x of [-56, 56]) {
      single(x, -52, 50, 118); fill(gold(0.07));
      single(x, -52, 50, 118); stroke(gold(0.72), 2.6 * k);
    }
    single(0, -58, 54, 128); fill(gold(0.38));
    single(0, -58, 54, 128); hatch(hi(0.35), 1.2 * k, 8);
    single(0, -58, 54, 128); stroke(hi(1), 3.6 * k);
    for (const x of [-28, 28]) {                                    // contact points
      ctx.beginPath(); ctx.moveTo(x, -37); ctx.lineTo(x + 6, -29); ctx.lineTo(x, -21); ctx.lineTo(x - 6, -29); ctx.closePath();
      fill('#fff6d6');
    }
    ctx.beginPath(); ctx.moveTo(-84, -4); ctx.bezierCurveTo(-56, -14, -28, 2, 0, -8); ctx.bezierCurveTo(28, 2, 56, -14, 84, -4);
    stroke(gold(0.45), 1.6 * k);                                        // gingival line
  };
  // 3 — not the distal-most tooth: arch seen from the occlusal; the last tooth on each side is ruled out
  P[3] = (k) => {
    const n = 14, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (158 + (224 * i) / (n - 1)) * Math.PI / 180;
      const post = Math.min(i, n - 1 - i);
      pts.push({ x: 60 * Math.cos(a), y: 8 + 74 * Math.sin(a), r: post < 3 ? 11.5 : post < 5 ? 9 : 7.6, a, post });
    }
    pts.forEach((p, i) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a + Math.PI / 2);
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.82, 0, 0, TAU);
      if (i === 11) { fill(hi(0.95)); ctx.beginPath(); ctx.ellipse(0, 0, p.r + 5, p.r * 0.82 + 5, 0, 0, TAU); stroke(hi(0.9), 2 * k); }
      else if (p.post === 0) { fill('rgba(238,124,92,0.14)'); ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.82, 0, 0, TAU); stroke(red(1), 2.8 * k); }
      else { fill(gold(0.1)); ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.82, 0, 0, TAU); stroke(gold(0.78), 2.2 * k); }
      ctx.restore();
    });
    for (const i of [0, n - 1]) {                                        // rubric stroke through each terminal tooth
      const p = pts[i]; ctx.beginPath(); ctx.moveTo(p.x - 15, p.y + 15); ctx.lineTo(p.x + 15, p.y - 15); stroke(red(1), 4.4 * k);
    }
  };
  // 4 — molar with a cast restoration: full crown in solid gold
  P[4] = (k) => {
    const x = 0, y = -70, w = 112, h = 146;
    molar(x, y, w, h); fill(gold(0.08));
    molar(x, y, w, h); hatch(gold(0.32), 1.2 * k, 8);
    ctx.save(); molar(x, y, w, h); ctx.clip();
    const g = ctx.createLinearGradient(-60, -74, 60, -6);
    g.addColorStop(0, '#fff3c4'); g.addColorStop(0.35, '#f2cf78'); g.addColorStop(0.7, '#c99a3e'); g.addColorStop(1, '#f0d48a');
    ctx.fillStyle = g; ctx.fillRect(-80, -90, 160, 90 - 70 + h * 0.43 - 6);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-30, -44, 7, 17, 0.5, 0, TAU); ctx.fill();
    ctx.restore();
    molar(x, y, w, h); stroke(hi(1), 3.6 * k);
    ctx.beginPath(); ctx.moveTo(-50, -70 + h * 0.43 - 6); ctx.quadraticCurveTo(0, -70 + h * 0.43 + 4, 50, -70 + h * 0.43 - 6);
    stroke('rgba(60,40,10,0.9)', 2.4 * k);                                // crown margin
  };
  // 5 — no cast post and core required
  P[5] = (k) => {
    single(0, -76, 86, 154); fill(gold(0.08));
    single(0, -76, 86, 154); stroke(gold(0.85), 3 * k);
    cej(0, -76, 86, 154); stroke(gold(0.6), 1.8 * k);
    const pc = () => { ctx.beginPath(); ctx.moveTo(-17, -56); ctx.lineTo(17, -56); ctx.lineTo(25, -20); ctx.lineTo(8, -12); ctx.lineTo(4, 44); ctx.lineTo(-4, 44); ctx.lineTo(-8, -12); ctx.lineTo(-25, -20); ctx.closePath(); };
    pc(); fill(gold(0.62));                                               // core + post in one cast piece
    pc(); stroke(hi(0.95), 2.2 * k);
    slash(k);
  };
  // 6 — not an abutment for a fixed prosthesis: three-unit bridge
  P[6] = (k) => {
    for (const x of [-50, 50]) {                                          // abutment roots
      ctx.beginPath(); ctx.moveTo(x - 17, -6); ctx.bezierCurveTo(x - 15, 30, x - 6, 58, x, 68);
      ctx.bezierCurveTo(x + 6, 58, x + 15, 30, x + 17, -6); stroke(gold(0.8), 2.8 * k);
    }
    ctx.beginPath();                                                      // one-piece bridge: retainer, pontic, retainer
    ctx.moveTo(-76, -6); ctx.bezierCurveTo(-82, -30, -76, -54, -58, -56); ctx.quadraticCurveTo(-42, -60, -27, -50);
    ctx.quadraticCurveTo(-13, -60, 0, -56); ctx.quadraticCurveTo(13, -60, 27, -50);
    ctx.quadraticCurveTo(42, -60, 58, -56); ctx.bezierCurveTo(76, -54, 82, -30, 76, -6);
    ctx.lineTo(26, -6); ctx.quadraticCurveTo(0, 6, -26, -6); ctx.closePath();
    fill(gold(0.34));
    ctx.save(); ctx.clip();
    ctx.beginPath(); for (let d = -220; d <= 220; d += 8) { ctx.moveTo(d - 110, 110); ctx.lineTo(d + 110, -110); }
    ctx.strokeStyle = hi(0.3); ctx.lineWidth = 1.2 * k; ctx.stroke(); ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-76, -6); ctx.bezierCurveTo(-82, -30, -76, -54, -58, -56); ctx.quadraticCurveTo(-42, -60, -27, -50);
    ctx.quadraticCurveTo(-13, -60, 0, -56); ctx.quadraticCurveTo(13, -60, 27, -50);
    ctx.quadraticCurveTo(42, -60, 58, -56); ctx.bezierCurveTo(76, -54, 82, -30, 76, -6);
    ctx.lineTo(26, -6); ctx.quadraticCurveTo(0, 6, -26, -6); ctx.closePath();
    stroke(hi(1), 3.2 * k);
    for (const x of [-26.5, 26.5]) { ctx.beginPath(); ctx.moveTo(x, -49); ctx.lineTo(x, -8); stroke(hi(0.8), 1.8 * k); }
    ctx.beginPath(); ctx.moveTo(-90, 12); ctx.bezierCurveTo(-50, 2, -30, 16, 0, 14); ctx.bezierCurveTo(30, 16, 50, 2, 90, 12);
    stroke(gold(0.45), 1.6 * k);                                          // ridge line
    slash(k);
  };
  // 7 — no preoperative deep probing defect (probe sunk into a narrow, deep defect), pain (bolt), sinus tract (dotted
  //     track to a stoma) or perforation (track through a gap in the root wall): all four shown, one "absent" stroke
  P[7] = (k) => {
    single(16, -74, 86, 152); fill(gold(0.08));
    single(16, -74, 86, 152); stroke(gold(0.85), 3 * k);
    cej(16, -74, 86, 152); stroke(gold(0.6), 1.8 * k);
    ctx.beginPath(); ctx.moveTo(-100, -4); ctx.quadraticCurveTo(-64, -16, -40, -8);          // soft tissue, then the narrow defect
    ctx.bezierCurveTo(-36, 14, -30, 40, -19, 54); ctx.bezierCurveTo(-17, 30, -14, 6, -12, -12);
    stroke(gold(0.7), 2 * k);
    ctx.beginPath(); ctx.moveTo(58, -10); ctx.quadraticCurveTo(78, -18, 100, -6); stroke(gold(0.55), 1.8 * k);
    ctx.save(); ctx.translate(-27, -6); ctx.rotate(0.12);                 // periodontal probe
    ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 54); stroke('rgba(8,12,40,0.9)', 8 * k);
    ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 54); stroke('#fff6d6', 4 * k);
    ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(-52, -92); stroke('#fff6d6', 6.5 * k);
    for (const y of [40, 26, 4, -10]) { ctx.beginPath(); ctx.moveTo(-7, y); ctx.lineTo(7, y); stroke('#fff6d6', 3 * k); }
    ctx.restore();
    // the other three preoperative findings of item 7, so that no part of the item is left out of the picture:
    ctx.beginPath();                                                      // pain: bolt in the crown
    ctx.moveTo(8, -64); ctx.lineTo(-7, -44); ctx.lineTo(1, -44); ctx.lineTo(-5, -27); ctx.lineTo(11, -49); ctx.lineTo(3, -49); ctx.closePath();
    fill('#fff6d6');
    ctx.save(); ctx.setLineDash([1, 7.5 * k]);                            // sinus tract: dotted track from the apex to a stoma on the gingiva
    ctx.beginPath(); ctx.moveTo(24, 72); ctx.bezierCurveTo(50, 66, 69, 30, 72, -6); stroke(hi(1), 3.4 * k);
    ctx.restore();
    ctx.beginPath(); ctx.arc(72, -14, 6.5, 0, TAU); fill('rgba(8,12,40,0.95)');
    ctx.beginPath(); ctx.arc(72, -14, 6.5, 0, TAU); stroke(hi(1), 2.6 * k);
    ctx.beginPath(); ctx.arc(72, -14, 2.2, 0, TAU); fill('#fff6d6');
    ctx.beginPath(); ctx.arc(45, 23, 7, 0, TAU); fill('rgba(8,12,40,0.95)'); // perforation: a hole through the root wall
    ctx.beginPath(); ctx.moveTo(33, 19); ctx.lineTo(58, 28); stroke('#fff6d6', 3 * k);
    slash(k);
  };
  // 8 — patency at the canal terminus and no root-filling extrusion: file tip exactly at the terminus, nothing beyond
  P[8] = (k) => {
    const wall = () => { ctx.beginPath(); ctx.moveTo(-66, -120); ctx.bezierCurveTo(-58, -20, -32, 34, -9, 56); ctx.quadraticCurveTo(0, 64, 9, 56); ctx.bezierCurveTo(32, 34, 58, -20, 66, -120); };
    wall(); ctx.closePath(); fill(gold(0.12));
    wall(); ctx.closePath(); hatch(gold(0.3), 1.2 * k, 8);
    ctx.beginPath(); ctx.moveTo(-20, -120); ctx.bezierCurveTo(-15, -30, -7, 28, -2.5, 60); ctx.lineTo(2.5, 60);
    ctx.bezierCurveTo(7, 28, 15, -30, 20, -120); ctx.closePath(); fill('rgba(6,10,36,0.92)');
    ctx.beginPath(); ctx.moveTo(-20, -120); ctx.bezierCurveTo(-15, -30, -7, 28, -2.5, 60); stroke(gold(0.75), 1.8 * k);
    ctx.beginPath(); ctx.moveTo(20, -120); ctx.bezierCurveTo(15, -30, 7, 28, 2.5, 60); stroke(gold(0.75), 1.8 * k);
    wall(); stroke(hi(0.95), 3.2 * k);
    ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, 60); stroke('#fff6d6', 3 * k);                           // file
    for (let y = -90; y < 48; y += 13) { ctx.beginPath(); ctx.moveTo(-5, y + 5); ctx.lineTo(5, y - 5); stroke(hi(0.95), 1.9 * k); }
    ctx.beginPath(); ctx.arc(0, 61, 10, 0, TAU); stroke(hi(1), 2.8 * k);                                         // terminus mark
    ctx.beginPath(); ctx.moveTo(-38, 61); ctx.lineTo(-17, 61); ctx.moveTo(17, 61); ctx.lineTo(38, 61); stroke(hi(0.9), 2.4 * k);
  };

  /** draw pictogram n centred on (x, y); `scale` 1 = 200 px box; `k` = stroke multiplier */
  function draw(n, x, y, scale, alpha, k = 1) {
    if (alpha <= 0.004) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha *= alpha;
    P[n](k);
    ctx.restore();
  }
  return { draw, single, molar };
})();
