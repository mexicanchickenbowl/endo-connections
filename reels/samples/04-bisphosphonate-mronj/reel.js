/*
 * 04 · Bisphosphonates, osteoclasts & MRONJ — Swiss / Bauhaus poster style.
 * Pure canvas 2D; render(t) is a deterministic function of t (seconds).
 * Palette: off-white paper, black ink, signal red, ochre accent.
 * Type: Archivo Black (display), Bebas Neue (numerals), Inter (labels).
 * v2: review pass (see NOTES.md, "Review changes").
 */
(() => {
  const { canvas, ctx } = Kit.createCanvas();
  const { seg, ease, clamp, lerp, W, H } = Kit;

  // ---------------------------------------------------------------- tokens
  const COL = {
    paper: '#EEE9DD', paperHi: '#F9F6EF', ink: '#121212', red: '#E1251B',
    ochre: '#D6981F', grey: '#5F5B53',
  };
  const FD = '"Archivo Black"', FN = '"Bebas Neue"', FU = 'Inter';
  const M = 64, R = 1016, CW = R - M;      // safe-area margins
  const BY = 1200;                          // bone surface (top of the black "bone" field)
  const AX = 540;                           // shared vertical axis: osteoclast, inset, decision divider (centre gutter)
  const GUT = 24, COLW = (CW - 5 * GUT) / 6; // 6-column Swiss grid

  // scene windows [start, end] in seconds
  const S = {
    hook: [0, 3.2], drug: [3.2, 9.6], oc: [9.6, 14.8], turn: [14.8, 19.2], split: [19.2, 25.4], take: [25.4, 30],
  };
  const DURATION = 30;
  const LEAD = 0.3;      // each plate's type starts entering this long before the cut (overlaps the outgoing type)
  const LOOP0 = 29.5;    // loop tail: the treated tooth leaves and the red plate lifts off the already-composed hook

  // ---------------------------------------------------------------- helpers
  const P = (t, a, d = 0.45) => seg(t, a, a + d);     // linear entry progress
  const Q = (t, b, d = 0.4) => seg(t, b - d, b);      // linear exit progress (ends at b)
  function setF(weight, size, fam, ls = 0) { ctx.font = `${weight} ${size}px ${fam}, sans-serif`; ctx.letterSpacing = ls + 'px'; }
  function tw(s) { return ctx.measureText(s).width; }
  function fit(str, weight, fam, maxW, maxSize, ls = 0) { setF(weight, 100, fam, ls); return Math.min(maxSize, (100 * maxW) / tw(str)); }
  function circle(x, y, r, fill) { if (r <= 0) return; ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function rect(x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }

  /** masked kinetic text: slides up into a clip box (p = entry 0..1), slides up and out (q = exit 0..1) */
  function mtext(str, x, y, o) {
    const { size, fam = FU, weight = 700, color = COL.ink, p = 1, q = 0, align = 'left', ls = 0, asc = 0.8, desc = 0.27, alpha = 1, stroke = 0 } = o;
    if (p <= 0 || q >= 1 || alpha <= 0) return 0;
    setF(weight, size, fam, ls);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w = tw(str) - ls;
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    const top = y - size * asc - 6, h = size * (asc + desc) + 10;
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 - 16, top, w + 32, h); ctx.clip();
    const off = (1 - ease.outQuint(clamp(p))) * h - ease.inOut(clamp(q)) * h;
    ctx.globalAlpha *= alpha;
    if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x0, y + off); }
    else { ctx.fillStyle = color; ctx.fillText(str, x0, y + off); }
    ctx.restore();
    return w;
  }
  /** plain text (no mask) */
  function text(str, x, y, o) {
    const { size, fam = FU, weight = 600, color = COL.ink, align = 'left', ls = 0, alpha = 1, baseline = 'alphabetic' } = o;
    if (alpha <= 0) return 0;
    ctx.save(); setF(weight, size, fam, ls); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
    ctx.textAlign = align; ctx.textBaseline = baseline; ctx.fillText(str, x, y); const w = tw(str); ctx.restore();
    return w;
  }
  /** Bauhaus arrow drawn as geometry: 40×8 shaft + 22 px triangular head, pointing right; y = centre line */
  function arrow(x, y, col, a = 1, len = 40) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    rect(x, y - 4, len, 8, col);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + len - 2, y - 13); ctx.lineTo(x + len + 20, y); ctx.lineTo(x + len - 2, y + 13); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------- bone texture (pre-rendered)
  let boneTex = null;
  function makeBone() {
    const c = document.createElement('canvas'); c.width = W; c.height = H - BY;
    const g = c.getContext('2d');
    g.fillStyle = COL.ink; g.fillRect(0, 0, c.width, c.height);
    const r = 15, dx = r * Math.sqrt(3), dy = r * 1.5;
    for (let row = 0; row * dy < c.height + r; row++) {
      const y = 20 + row * dy; const a = Math.max(0, 1 - y / 460);
      if (a <= 0.02) continue;
      g.strokeStyle = `rgba(238,233,221,${0.11 * a})`; g.lineWidth = 1.6;
      g.beginPath();
      for (let col = -1; col * dx < W + dx; col++) {
        const x = col * dx + (row % 2 ? dx / 2 : 0);
        for (let k = 0; k < 6; k++) {
          const an = Math.PI / 6 + (k * Math.PI) / 3;
          const px = x + (r - 3) * Math.cos(an), py = y + (r - 3) * Math.sin(an);
          if (k) g.lineTo(px, py); else g.moveTo(px, py);
        }
        g.closePath();
      }
      g.stroke();
    }
    boneTex = c;
  }

  // ---------------------------------------------------------------- tooth geometry (local: origin at (cx, BY), crown up)
  const CROWN = new Path2D(), ROOTS = new Path2D(), ACCESS = new Path2D();
  (function () {
    const c = CROWN;
    c.moveTo(-92, 0); c.lineTo(-92, -78);
    c.bezierCurveTo(-92, -128, -72, -142, -46, -142);
    c.bezierCurveTo(-26, -142, -14, -130, 0, -124);
    c.bezierCurveTo(14, -130, 26, -142, 46, -142);
    c.bezierCurveTo(72, -142, 92, -128, 92, -78);
    c.lineTo(92, 0); c.closePath();
    const r = ROOTS;
    r.moveTo(-90, -4); r.lineTo(-76, 162); r.quadraticCurveTo(-60, 192, -40, 166); r.lineTo(-16, 46);
    r.quadraticCurveTo(0, 30, 16, 46); r.lineTo(40, 166); r.quadraticCurveTo(60, 192, 76, 162); r.lineTo(90, -4); r.closePath();
    const a = ACCESS;
    a.moveTo(-34, -126); a.lineTo(34, -126); a.lineTo(26, -86); a.lineTo(-26, -86); a.closePath();
  })();
  const CANALS = [[[-18, -70], [-34, 10], [-58, 172]], [[18, -70], [34, 10], [58, 172]]];
  function canalPoint(c, u) { // quadratic through 3 points
    const [a, b, d] = c; const v = 1 - u;
    return [v * v * a[0] + 2 * v * u * b[0] + u * u * d[0], v * v * a[1] + 2 * v * u * b[1] + u * u * d[1]];
  }
  function strokeCanal(c, u0, u1, lw, col) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const u = lerp(u0, u1, i / 24); const [x, y] = canalPoint(c, u); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
  }
  /** draw a molar. o: {dy, rot, alpha, fill(0..1 obturation), resto(0..1), lesion(0..1)} */
  function tooth(cx, o = {}) {
    const { dy = 0, rot = 0, alpha = 1, fill = 0, resto = 0, lesion = 0 } = o;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, BY + dy); ctx.rotate(rot);
    if (lesion > 0) circle(-58, 196, 34 * lesion, COL.red);
    ctx.lineJoin = 'round';
    ctx.fillStyle = COL.paper; ctx.fill(ROOTS); ctx.lineWidth = 6; ctx.strokeStyle = COL.ink; ctx.stroke(ROOTS);
    ctx.fillStyle = COL.paperHi; ctx.fill(CROWN); ctx.stroke(CROWN);
    // pulp chamber + canals (thin)
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.5; ctx.globalAlpha *= 0.55;
    ctx.beginPath(); ctx.moveTo(-26, -86); ctx.lineTo(26, -86); ctx.lineTo(18, -70); ctx.lineTo(-18, -70); ctx.closePath(); ctx.stroke();
    for (const c of CANALS) strokeCanal(c, 0, 1, 3.5, COL.ink);
    ctx.globalAlpha /= 0.55;
    // obturation
    if (fill > 0) {
      for (const c of CANALS) { strokeCanal(c, 0, ease.inOut(fill), 17, COL.ink); strokeCanal(c, 0, ease.inOut(fill), 10, COL.ochre); }
    }
    if (resto > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(resto * 1.5);
      ctx.fillStyle = COL.ochre; ctx.fill(ACCESS); ctx.lineWidth = 5; ctx.strokeStyle = COL.ink; ctx.stroke(ACCESS);
      ctx.restore();
    }
    ctx.restore();
  }
  /** extraction socket as a HOLE in the bone: paper fill + red rim; new bone (ink) creeps up from the apex (heal 0..1) */
  function socketHole(cx, a, heal) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.rect(0, BY, W, H - BY); ctx.clip();
    ctx.translate(cx, BY);
    ctx.fillStyle = COL.paper; ctx.fill(ROOTS);
    const front = 194 - 200 * heal;          // healing front (local y), rises from the apices
    if (heal > 0) { ctx.save(); ctx.clip(ROOTS); rect(-110, front, 220, 240, COL.ink); rect(-110, front - 2, 220, 5, COL.ochre); ctx.restore(); }
    // red rim only around the still-open part
    ctx.save(); ctx.beginPath(); ctx.rect(-120, -10, 240, front + 12); ctx.clip();
    ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = COL.red; ctx.stroke(ROOTS);
    ctx.restore();
    ctx.restore();
  }

  // ---------------------------------------------------------------- bisphosphonate glyph (P–C–P hook)
  // local origin = centre of the C square; s = unit (px). Rest orientation: phosphonates down (gripping bone).
  function bp(x, y, s, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0 || s <= 0) return;
    const k = o.build;
    const b = (lo, hi, e) => (k == null ? 1 : seg(k, lo, hi, e));
    const bC = b(0, 0.3, ease.outBack), bBar = b(0.2, 0.5, ease.out), bP = b(0.38, 0.72, ease.outBack), bR = b(0.55, 0.82, ease.out), bN = b(0.72, 1, ease.outBack);
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(o.rot || 0);
    const px = 1.25 * s, py = 1.0 * s, pr = 0.55 * s, ny = -1.5 * s, nr = 0.42 * s;
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 0.2 * s; ctx.lineCap = 'butt';
    if (bBar > 0) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-px * bBar, py * bBar); ctx.moveTo(0, 0); ctx.lineTo(px * bBar, py * bBar); ctx.stroke(); }
    if (bR > 0) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, ny * bR); ctx.stroke(); }
    if (bP > 0) { circle(-px, py, pr * bP, COL.red); circle(px, py, pr * bP, COL.red); }
    if (bN > 0) circle(0, ny, nr * bN, COL.ochre);
    if (bC > 0) { const h = 0.5 * s * bC; rect(-h, -h, 2 * h, 2 * h, COL.ink); }
    if (o.letters > 0) {
      ctx.globalAlpha *= o.letters; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; setF(400, 0.62 * s, FD);
      const yo = 0.22 * s;
      ctx.fillStyle = COL.paper; ctx.fillText('C', 0, yo); ctx.fillText('P', -px, py + yo); ctx.fillText('P', px, py + yo);
      setF(400, 0.5 * s, FD); ctx.fillStyle = COL.ink; ctx.fillText('N', 0, ny + 0.18 * s);
    }
    ctx.restore();
  }
  const S_SM = 21;                         // small molecule unit
  const restY = (s) => BY - 1.55 * s;      // C-centre height when both P feet touch the surface
  const SITE = { c: AX, hw: 210 };         // active remodelling site on the bone surface
  const OC = { x: AX, rx: 185, ry: 150 };  // osteoclast: half-dome, flat side down
  const PIT_HW = 150, PIT_D = 58;
  const D0 = S.drug[0], O0 = S.oc[0], T0 = S.turn[0], A4 = S.split[0];
  const T_FLY = [D0 + 2.7, D0 + 3.3];      // hero molecule flight to the bone
  // bound molecules (x, landing time). 6 cluster on the remodelling site (330–750), 2 land sparsely elsewhere.
  const MOLS = [
    { x: 500, t: T_FLY[1], hero: true, swallow: 1 },
    { x: 170, t: D0 + 3.2 }, { x: 905, t: D0 + 3.28 },
    { x: 340, t: D0 + 3.36 }, { x: 740, t: D0 + 3.42 },
    { x: 420, t: D0 + 3.48, swallow: 0 }, { x: 660, t: D0 + 3.54, swallow: 3 }, { x: 580, t: D0 + 3.6, swallow: 2 },
  ];
  const SWALLOW_T = [O0 + 0.75, O0 + 0.85, O0 + 0.95, O0 + 1.05];   // released from the mineral as the pit forms
  const SWALLOW_TARGET = [[-105, -58], [-35, -62], [35, -62], [105, -58]];
  const SWALLOW_ROT = [0.4, -0.25, 0.3, -0.45];
  const NUC = [[-90, -100], [-45, -110], [0, -114], [45, -110], [90, -100]];   // one row of nuclei, upper part of the dome

  // ---------------------------------------------------------------- remodelling-rate toy model (plate 03)
  const RATE_FLOOR = 0.3;   // ~70 % suppression: inside the measured 60–90 %, and never zero
  const rateAt = (t) => lerp(1, RATE_FLOOR, ease.inOut(seg(t, T0 + 0.15, T0 + 1.45)));
  const PULSES = [];
  (function () { let acc = 0; for (let t = T0 - 0.2; t < S.turn[1] - 0.5; t += 0.005) { acc += rateAt(t) * 8 * 0.005; if (acc >= 1) { acc -= 1; PULSES.push(t); } } })();
  function pulseX(j) {
    for (let k = 0; k < 8; k++) { const x = 90 + Kit.hash(j, k, 7) * 840; if (Math.abs(x - OC.x) > 175) return x; }
    return 130;
  }

  // ---------------------------------------------------------------- frame furniture
  function background() {
    rect(0, 0, W, H, COL.paper);
    ctx.fillStyle = 'rgba(18,18,18,0.09)';
    for (let i = 0; i < 6; i++) { const x = M + i * (COLW + GUT); ctx.fillRect(x, 0, 1.5, BY); ctx.fillRect(x + COLW - 1.5, 0, 1.5, BY); }
  }
  function sceneIndex(t) { if (t >= LOOP0) return 0; if (t < S.drug[0]) return 0; if (t < S.oc[0]) return 1; if (t < S.turn[0]) return 2; if (t < S.split[0]) return 3; if (t < S.take[0]) return 4; return 5; }
  function header(t, color, activeCol = COL.red, idxOverride = null) {
    rect(M, 282, CW, 3, color);
    text('BISPHOSPHONATES × MRONJ', M, 266, { size: 24, weight: 800, ls: 3, color });
    const idx = idxOverride == null ? sceneIndex(t) : idxOverride;
    for (let i = 0; i < 5; i++) {
      const x = R - (5 - i) * 32 + 12, y = 246, s = 20;
      const on = i + 1 === idx, done = i + 1 < idx;
      if (on) { rect(x, y, s, s, activeCol); if (activeCol !== COL.red) { ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.strokeRect(x - 3, y - 3, s + 6, s + 6); } }
      else if (done) rect(x, y, s, s, color);
      else { ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.strokeRect(x + 1.25, y + 1.25, s - 2.5, s - 2.5); }
    }
  }
  /** MRONJ spelled out once (hook + plate 01) */
  function subtitle(t) {
    const al = t >= LOOP0 ? 1 : 1 - seg(t, S.oc[0] - LEAD, S.oc[0]);
    if (al <= 0) return;
    text('MRONJ = medication-related osteonecrosis of the jaw', M, 313, { size: 24, weight: 500, color: COL.ink, alpha: 0.82 * al });
  }
  /** Swiss transition: a full-width 26 px ink bar sweeps across under the header at every plate cut */
  const CUTS = [S.drug[0], S.oc[0], S.turn[0], S.split[0]];
  function sweeps(t) {
    for (const T of CUTS) {
      const lead = ease.inOut(seg(t, T - 0.34, T - 0.04)), trail = ease.inOut(seg(t, T - 0.16, T + 0.14));
      if (lead <= 0 || trail >= 1) continue;
      const x0 = W * trail, x1 = W * lead;
      if (x1 > x0) rect(x0, 291, x1 - x0, 26, COL.ink);
    }
  }
  const FINE = [
    [S.drug[0], S.drug[1], 'Schematic, not to scale · R1 (–OH) omitted · Russell et al., Osteoporos Int 2008'],
    [S.oc[0], S.oc[1], 'Schematic · Rogers et al., Bone 2011 · Halasy-Nagy et al., Bone 2001'],
    [S.turn[0], S.turn[1], 'Toy model · Recker 2008 · Khan 1997 (IV, est.) · drug retained ≠ effect lasting'],
    [S.split[0], S.split[1], 'AAOMS 2022: MRONJ = antiresorptive + local infection/inflammation · healing: months'],
    [S.take[0], LOOP0 + 0.05, 'AAE Position Statement 2010 · AAE Guideline 2018 · Ruggiero (AAOMS) 2022'],
  ];
  function footer(t) {
    rect(M, 1480, 950 - M, 2, 'rgba(238,233,221,0.5)');
    text('@natebrooksendo', M, 1566, { size: 26, weight: 600, color: COL.paper, alpha: 0.9 });
    for (const [a0, b0, s] of FINE) {
      const al = Math.min(seg(t, a0, a0 + 0.35), 1 - seg(t, b0 - 0.3, b0));
      if (al <= 0) continue;
      const fs = Math.min(22, fit(s, 500, FU, 950 - M, 22));
      text(s, M, 1517, { size: fs, weight: 500, color: COL.paper, alpha: 0.78 * al });
    }
  }
  function sceneLabel(str, t, a, b, color = COL.red) {
    mtext(str, M, 354, { size: 30, weight: 800, ls: 4, color, p: P(t, a, 0.4), q: Q(t, b, 0.35) });
  }
  /** chapter numerals: ink outline only, so the solid red stays for data */
  function bigNumeral(str, t, a, b) {
    mtext(str, R, 598, { size: 300, fam: FN, weight: 400, color: COL.ink, stroke: 3, p: P(t, a, 0.55), q: Q(t, b, 0.4), align: 'right', asc: 0.72, desc: 0.04 });
  }

  // ---------------------------------------------------------------- SCENE 0 · hook (fully composed at t = 0)
  function sceneHook(t) {
    const [, b] = S.hook;
    if (t > b + 0.15) return;
    // ochre disc: big, deliberately behind the "CT" and bleeding off the right edge
    const discOut = ease.in(seg(t, b - 0.45, b));
    circle(1010, 440, 150 * (1 - discOut), COL.ochre);
    // label row
    const lq = Q(t, b - 0.12, 0.3);
    if (lq < 1) { ctx.save(); ctx.globalAlpha *= 1 - lq; rect(M, 334, 22, 22, COL.red); ctx.restore(); }
    mtext('PATIENT ON A BISPHOSPHONATE', M + 40, 357, { size: 32, weight: 800, ls: 2, q: lq });
    const sE = fit('EXTRACT', 400, FD, CW, 200);
    const yE = 590, sO = Math.round(sE * 0.62), yO = yE + Math.round(sE * 0.9), yN = yO + Math.round(sE * 0.98);
    mtext('EXTRACT', M - 4, yE, { size: sE, fam: FD, weight: 400, q: Q(t, b - 0.08, 0.32), asc: 0.75, desc: 0.04 });
    mtext('OR', M, yO, { size: sO, fam: FD, weight: 400, color: COL.red, q: Q(t, b - 0.04, 0.32), asc: 0.75, desc: 0.04 });
    // black bar (grows from the OR to the right margin)
    setF(400, sO, FD); const wOr = tw('OR');
    const bx = M + wOr + 30, bw = (R - bx) * ease.outQuint(seg(t, 0.05, 0.7)) * (1 - ease.inOut(seg(t, b - 0.4, b)));
    rect(bx, yO - sO * 0.42, bw, 26, COL.ink);
    const qN = Q(t, b, 0.32);
    mtext('ENDO', M - 4, yN, { size: sE, fam: FD, weight: 400, q: qN, asc: 0.75, desc: 0.04 });
    setF(400, sE, FD); const wEndo = tw('ENDO');
    mtext('?', M - 4 + wEndo + 6, yN, { size: sE, fam: FD, weight: 400, color: COL.red, q: qN, asc: 0.75, desc: 0.04 });
    // the tooth in question (periapical lesion) rises into place, then slides out right at the end of the hook
    const out = ease.in(seg(t, b - 0.45, b + 0.1));
    const tin = ease.outQuint(seg(t, 0.0, 0.6));
    tooth(TR + 420 * out, { dy: 80 * (1 - tin), alpha: tin, lesion: ease.outBack(seg(t, 0.35, 0.75)) });
    // three tiny red hooks already sitting on the bone (foreshadowing)
    const hk = [[150, 0.3], [262, 0.42], [390, 0.54]];
    for (const [x, t0] of hk) {
      const u = ease.outBack(seg(t, t0, t0 + 0.35));
      bp(x, restY(20), 20 * u, { alpha: 1 - seg(t, b - 0.35, b) });
    }
  }

  // ---------------------------------------------------------------- SCENE 1 · the drug
  function sceneDrug(t) {
    const [a, b] = S.drug;
    if (t < a - LEAD - 0.05 || t > b + 0.15) return;
    sceneLabel('THE DRUG', t, a - LEAD, b);
    bigNumeral('01', t, a - LEAD + 0.05, b);
    mtext('P–C–P', M - 4, 515, { size: 150, fam: FD, weight: 400, p: P(t, a - LEAD + 0.05, 0.5), q: Q(t, b, 0.35), asc: 0.75, desc: 0.04 });
    mtext('hooks onto bone mineral', M, 584, { size: 40, weight: 600, p: P(t, a - LEAD + 0.2, 0.45), q: Q(t, b, 0.3) });
    mtext('…most where bone remodels', M, 636, { size: 40, weight: 600, color: COL.red, p: P(t, a + 3.3, 0.45), q: Q(t, b, 0.3) });

    // hero molecule build + flight to the bone
    const hb = seg(t, a + 0.0, a + 0.9);
    const fly = ease.inOut(seg(t, T_FLY[0], T_FLY[1]));
    const hx = lerp(AX, MOLS[0].x, fly), hy = lerp(872, restY(S_SM), fly), hs = lerp(88, S_SM, fly);
    if (t < T_FLY[1] + 0.02) {
      // construction lines (Swiss diagram)
      const cl = Math.min(seg(t, a + 0.3, a + 0.8), 1 - seg(t, a + 2.45, a + 2.75));
      if (cl > 0) {
        ctx.save(); ctx.globalAlpha = 0.45 * cl; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.setLineDash([7, 9]);
        ctx.beginPath(); ctx.arc(AX, 872, 205, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(300, 872); ctx.lineTo(780, 872); ctx.moveTo(AX, 660); ctx.lineTo(AX, 1084); ctx.stroke();
        ctx.restore();
      }
      bp(hx, hy, hs, { build: hb, letters: Math.min(seg(hb, 0.85, 1), 1 - seg(t, T_FLY[0], T_FLY[0] + 0.2)) });
      // two anatomy tags only
      const tg = Math.min(seg(t, a + 0.45, a + 0.7), 1 - seg(t, a + 2.55, a + 2.75));
      if (tg > 0) {
        text('P = phosphonate, grips bone', AX, 1112, { size: 32, weight: 700, align: 'center', alpha: tg });
        text('N side chain', AX + 66, 746, { size: 32, weight: 700, alpha: tg });
        text('→ potent N-BP', AX + 66, 786, { size: 32, weight: 700, alpha: tg });
      }
    }
    // remodelling-site marker inside the bone
    const sm = Math.min(ease.outQuint(seg(t, a + 2.85, a + 3.25)), 1 - seg(t, b - 0.2, b + 0.1));
    if (sm > 0) {
      rect(SITE.c - SITE.hw * sm, BY + 4, 2 * SITE.hw * sm, 12, COL.ochre);
      mtext('ACTIVE REMODELLING SITE', SITE.c, BY + 58, { size: 30, weight: 800, ls: 2, color: COL.paper, align: 'center', p: P(t, a + 3.0, 0.4), q: Q(t, b + 0.1, 0.3) });
    }
    // magnified inset (opens after everything has landed): both phosphonates grip calcium on hydroxyapatite
    const ig = ease.outBack(seg(t, a + 3.65, a + 4.05)) * (1 - ease.in(seg(t, b - 0.4, b - 0.05)));
    if (ig > 0) {
      const cxI = AX, cyI = 878, rI = 165, sY = cyI + 44, s = 56;
      const hx0 = MOLS[0].x, hy0 = restY(S_SM);
      // magnifier cone towards the hero molecule on the surface
      ctx.save(); ctx.globalAlpha *= clamp(ig); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 6]);
      const an = Math.PI * 0.30;
      ctx.beginPath();
      ctx.moveTo(cxI - rI * Math.cos(an), cyI + rI * Math.sin(an)); ctx.lineTo(hx0 - 36, hy0 - 28);
      ctx.moveTo(cxI + rI * Math.cos(an), cyI + rI * Math.sin(an)); ctx.lineTo(hx0 + 36, hy0 - 28);
      ctx.stroke(); ctx.restore();
      ctx.save();
      ctx.translate(lerp(hx0, cxI, ig), lerp(hy0, cyI, ig)); ctx.scale(ig, ig); ctx.translate(-cxI, -cyI);
      ctx.beginPath(); ctx.arc(cxI, cyI, rI, 0, Math.PI * 2); ctx.save(); ctx.clip();
      rect(cxI - rI, cyI - rI, 2 * rI, 2 * rI, COL.paperHi);
      rect(cxI - rI, sY, 2 * rI, rI, COL.ink);
      // apatite lattice hint
      ctx.strokeStyle = 'rgba(238,233,221,0.18)'; ctx.lineWidth = 2;
      for (let r = 0; r < 3; r++) for (let k = -4; k <= 4; k++) {
        const x = cxI + k * 70 + (r % 2 ? 35 : 0), y = sY + 46 + r * 40;
        ctx.beginPath(); for (let v = 0; v < 6; v++) { const aa = Math.PI / 6 + v * Math.PI / 3; const px = x + 16 * Math.cos(aa), py = y + 16 * Math.sin(aa); v ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke();
      }
      // Ca2+ sites: off-white squares with an ink stroke (ochre stays reserved for the N side chain here)
      for (let k = -3; k <= 2; k++) {
        const x = cxI + (k + 0.5) * 70;
        rect(x - 13, sY - 13, 26, 26, COL.paperHi); ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.strokeRect(x - 13, sY - 13, 26, 26);
      }
      const pyI = sY - 52;                    // phosphonate centres sit just above the mineral
      bp(cxI, pyI - s, s, { letters: 1 });
      // chelation bonds: each phosphonate to its two calcium neighbours
      const bond = seg(t, a + 3.95, a + 4.3);
      if (bond > 0) {
        ctx.save(); ctx.strokeStyle = COL.red; ctx.lineWidth = 4; ctx.setLineDash([6, 5]); ctx.globalAlpha *= bond;
        for (const sx of [-1, 1]) for (const dk of [-0.5, 0.5]) {
          const px = cxI + sx * 70, ex = px + dk * 70, ey = sY - 13;
          const L = Math.hypot(ex - px, ey - pyI), r0 = 0.55 * s + 2;
          ctx.beginPath(); ctx.moveTo(px + ((ex - px) * r0) / L, pyI + ((ey - pyI) * r0) / L); ctx.lineTo(ex, ey); ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cxI, cyI, rI, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // label
      const lp = P(t, a + 3.85, 0.4), lq = Q(t, b - 0.05, 0.3);
      const lx = 742;
      if (lp > 0 && lq < 1) {
        ctx.save(); ctx.globalAlpha *= clamp(lp * 2) * (1 - lq) * clamp(ig); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(lx - 12, 792); ctx.lineTo(cxI + 105, sY - 15); ctx.stroke(); circle(cxI + 105, sY - 15, 5, COL.ink); ctx.restore();
      }
      const wCa = mtext('Ca', lx, 782, { size: 40, weight: 800, p: lp, q: lq });
      mtext('2+', lx + wCa + 3, 764, { size: 24, weight: 800, p: lp, q: lq });
      mtext('on hydroxyapatite', lx, 820, { size: 30, weight: 600, color: COL.ink, p: P(t, a + 3.95, 0.4), q: lq });
    }
  }

  // remodelling events: ochre blips under the surface whose rate decays (plate 03 toy model); drawn under the molecules
  function blip(x, y, u, alpha = 1) {
    if (u <= 0 || u >= 1) return;
    const rr = 13 * Math.sin(Math.PI * Math.min(1, u * 1.6));
    ctx.save(); ctx.globalAlpha *= alpha;
    circle(x, y, rr, COL.ochre);
    ctx.globalAlpha *= 1 - u; ctx.strokeStyle = COL.ochre; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + 20 * ease.out(u), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function remodelPulses(t) {
    if (t < T0 - 0.25 || t > S.turn[1]) return;
    const fade = 1 - seg(t, S.turn[1] - 0.4, S.turn[1]);
    for (let j = 0; j < PULSES.length; j++) {
      blip(pulseX(j + 1), BY + 34 + 10 * Kit.hash(j, 11), seg(t, PULSES[j], PULSES[j] + 0.55), fade);
    }
  }
  // bound molecules (plates 01–03) — drawn on top of the osteoclast so the drug stays legible
  function boundMolecules(t) {
    const fade = 1 - seg(t, A4 - 0.1, A4 + 0.35);
    if (fade <= 0 || t < D0) return;
    for (let i = 0; i < MOLS.length; i++) {
      const m = MOLS[i];
      if (m.hero && t < m.t) continue;
      if (m.swallow != null && t >= SWALLOW_T[m.swallow]) continue;
      const ry = restY(S_SM);
      let y = ry, rot = 0, al = 1;
      if (!m.hero) {
        const u = seg(t, m.t - 0.5, m.t);
        if (u <= 0) continue;
        y = lerp(ry - 170, ry, ease.in(u)); rot = (Kit.hash(i, 3) - 0.5) * 1.6 * (1 - ease.out(u)); al = clamp(u * 3);
      }
      bp(m.x, y, S_SM, { rot, alpha: al * fade });
      // landing pulse at the two phosphonate feet
      const pu = seg(t, m.t, m.t + 0.5);
      if (pu > 0 && pu < 1) {
        ctx.save(); ctx.globalAlpha = (1 - pu) * fade; ctx.strokeStyle = COL.red; ctx.lineWidth = 3;
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(m.x + sx * 1.25 * S_SM, BY, 8 + 26 * ease.out(pu), Math.PI, 0); ctx.stroke(); }
        ctx.restore();
      }
    }
    // plate 03: a single "still here" ring on one bound molecule when 10+ YEARS lands
    const gu = seg(t, T0 + 1.5, T0 + 2.3);
    if (gu > 0 && gu < 1) {
      ctx.save(); ctx.globalAlpha = (1 - gu) * fade; ctx.strokeStyle = COL.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(340, BY, 30 + 54 * ease.out(gu), Math.PI, 0); ctx.stroke(); ctx.restore();
    }
  }

  // ---------------------------------------------------------------- SCENE 2 · the osteoclast
  const pitMax = (t) => PIT_D * ease.inOut(seg(t, O0 + 0.4, O0 + 1.5));
  const pitDepth = (t) => pitMax(t) * (1 - ease.inOut(seg(t, T0, T0 + 0.7)));      // refills as plate 03 enters
  const cellBase = (t) => BY - 2 + 0.25 * pitDepth(t);
  function domePath(cx, by) { ctx.beginPath(); ctx.ellipse(cx, by, OC.rx, OC.ry, 0, Math.PI, 2 * Math.PI); ctx.closePath(); }
  function drawCell(cx, by, t, o) {
    domePath(cx, by); ctx.fillStyle = COL.ochre; ctx.fill();
    ctx.fillStyle = COL.ink;
    for (const [nx, ny] of NUC) { ctx.beginPath(); ctx.ellipse(cx + nx, by + ny, 15, 10, 0, 0, Math.PI * 2); ctx.fill(); }
    // ruffled border: a dense comb of short ink ticks along the flat (resorbing) face
    if (o.ruffle > 0) {
      const n = 24, span = 290;
      for (let i = 0; i < n; i++) {
        const x = cx - span / 2 + ((i + 0.5) * span) / n;
        const h = (17 + 3 * Math.sin(i * 1.7 + t * 6)) * o.ruffle;
        rect(x - 2, by - 1, 4, h, COL.ink);
      }
    }
    // internalised drug, in a band between the nuclei and the ruffled border
    for (let i = 0; i < 4; i++) {
      if (seg(t, SWALLOW_T[i], SWALLOW_T[i] + 0.8) < 1) continue;
      const [dx, dy] = SWALLOW_TARGET[i];
      bp(cx + dx, by + dy, 12, { rot: SWALLOW_ROT[i] });
    }
  }
  function sceneOC(t) {
    const [a, b] = S.oc;
    if (t < a - LEAD - 0.05 || t > b + 0.15) return;
    sceneLabel('THE OSTEOCLAST', t, a - LEAD, b);
    bigNumeral('02', t, a - LEAD + 0.05, b);
    // title words that light up on their beat
    const words = [['RESORB', a + 0.45], ['SWALLOW', a + 1.2], ['COLLAPSE', a + 2.7]];
    const sz = 84;
    words.forEach(([w, tl], i) => {
      const p = P(t, a - LEAD + i * 0.08, 0.45), q = Q(t, b, 0.35);
      const lit = seg(t, tl, tl + 0.25);
      const y = 452 + i * 92;
      mtext(w, M - 3, y, { size: sz, fam: FD, weight: 400, color: COL.ink, alpha: 0.13 + 0.87 * lit, p, q, asc: 0.75, desc: 0.04 });
      setF(400, sz, FD); const ww = tw(w);
      // the full stop is a red square that pops when the word is lit
      const sq = ease.outBack(lit) * (1 - seg(t, b - 0.35, b - 0.15));
      if (sq > 0) rect(M + ww + 6, y - 20 * sq, 20 * sq, 20 * sq, COL.red);
    });

    const cx = OC.x, by0 = cellBase(t);
    const pop = ease.outBack(seg(t, a + 0.0, a + 0.5));
    const ruffle = seg(t, a + 0.35, a + 0.7) * (1 - seg(t, a + 2.65, a + 3.0));       // ruffled border lost first
    const lift = 18 * ease.inOut(seg(t, a + 2.8, a + 3.2));                          // cell detaches: loss of function
    const by = by0 - lift;
    const col = seg(t, a + 3.2, a + 4.3);                                             // then apoptosis
    if (col <= 0) {
      if (pop > 0) {
        ctx.save(); ctx.translate(cx, by0); ctx.scale(pop, pop); ctx.translate(-cx, -by0);
        drawCell(cx, by, t, { ruffle });
        ctx.restore();
      }
    } else if (col < 1) {
      // 1) the detached cell rounds up; nuclei condense, contents fade
      const r1 = ease.inOut(clamp(col / 0.4)), rc = 92;
      const rx = lerp(OC.rx, rc, r1), ryT = lerp(OC.ry, rc, r1), ryB = Math.max(0.01, lerp(0, rc, r1));
      const cyc = by - ryB;
      // 2) it buds into three plain apoptotic bodies that drift apart and fade
      const sp = ease.inOut(clamp((col - 0.4) / 0.6)), fadeB = 1 - seg(col, 0.78, 1);
      if (sp <= 0) {
        ctx.fillStyle = COL.ochre; ctx.beginPath();
        ctx.ellipse(cx, cyc, rx, ryT, 0, Math.PI, 2 * Math.PI); ctx.ellipse(cx, cyc, rx, ryB, 0, 0, Math.PI); ctx.fill();
        ctx.save(); ctx.globalAlpha *= 1 - r1; ctx.fillStyle = COL.ink;
        for (const [nx, ny] of NUC) { ctx.beginPath(); ctx.ellipse(lerp(cx + nx, cx + nx * 0.25, r1), lerp(by + ny, cyc - 6, r1), lerp(15, 6, r1), lerp(10, 6, r1), 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      } else {
        for (let k = 0; k < 3; k++) {
          const an = -Math.PI / 2 + (k * 2 * Math.PI) / 3;
          const off = lerp(0.42, 1.45, ease.out(sp)) * rc, rr = rc * lerp(0.62, 0.28, sp);
          ctx.save(); ctx.globalAlpha *= fadeB;
          circle(cx + Math.cos(an) * off, cyc + Math.sin(an) * off + 30 * ease.in(sp), rr, COL.ochre);
          ctx.restore();
        }
      }
    }
    // dashed ghost: an inactive, ruffle-less cell outline stays behind
    const gh = seg(t, a + 3.9, a + 4.35) * (1 - Q(t, b, 0.35));
    if (gh > 0) {
      ctx.save(); ctx.globalAlpha = 0.5 * gh; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.setLineDash([8, 9]);
      domePath(cx, by); ctx.stroke(); ctx.restore();
    }
    // drug released from the mineral and taken up during resorption
    for (let i = 0; i < 4; i++) {
      const u = seg(t, SWALLOW_T[i], SWALLOW_T[i] + 0.8);
      if (u <= 0 || u >= 1) continue;
      const m = MOLS.find((mm) => mm.swallow === i);
      const x0 = m.x, y0 = restY(S_SM);
      const [dx, dy] = SWALLOW_TARGET[i];
      const x1 = cx + dx, y1 = by + dy;
      const e = ease.inOut(u);
      const xc = (x0 + x1) / 2, yc = Math.min(y0, y1) - 50;
      const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * xc + e * e * x1;
      const y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * yc + e * e * y1;
      bp(x, y, lerp(S_SM, 12, e), { rot: SWALLOW_ROT[i] * e });
    }
    // label inside the bone, in the same slot as the plate-01 site label
    mtext('OSTEOCLAST', cx, BY + 116, { size: 30, weight: 800, ls: 2, color: COL.paper, align: 'center', p: P(t, a + 0.3, 0.4), q: Q(t, a + 2.95, 0.3) });
    // FPPS callout
    const bxp = ease.outQuint(seg(t, a + 1.5, a + 1.9)), bxq = Q(t, b, 0.35);
    if (bxp > 0 && bxq < 1) {
      const X0 = 600, Y0 = 664, BW = R - X0, BH = 168;
      ctx.save(); ctx.globalAlpha *= 1 - ease.in(bxq);
      // leader from the cell (retracts as the cell detaches)
      const lx0 = cx + 150, ly0 = by0 - 34;
      const lx1 = X0 + 34, ly1 = Y0 + BH;
      const ld = 1 - ease.inOut(seg(t, a + 2.7, a + 3.05));
      if (ld > 0) {
        ctx.save(); ctx.globalAlpha *= ld; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(lerp(lx0, lx1, 1 - ld), lerp(ly0, ly1, 1 - ld)); ctx.lineTo(lerp(lx0, lx1, bxp), lerp(ly0, ly1, bxp)); ctx.stroke();
        circle(lx0, ly0, 6, COL.ink); ctx.restore();
      }
      // box wipes open from the left
      ctx.save();
      ctx.beginPath(); ctx.rect(X0 - 4, Y0 - 4, (BW + 8) * bxp, BH + 8); ctx.clip();
      rect(X0, Y0, BW, BH, COL.paperHi);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.strokeRect(X0 + 2, Y0 + 2, BW - 4, BH - 4);
      text('MEVALONATE PATHWAY', X0 + 24, Y0 + 50, { size: Math.min(30, fit('MEVALONATE PATHWAY', 800, FU, BW - 48, 30)), weight: 800 });
      rect(X0 + 24, Y0 + 66, BW - 48, 2, COL.ink);
      const fs = fit('FPP SYNTHASE', 400, FD, BW - 48 - 70, 50);
      text('FPP SYNTHASE', X0 + 24, Y0 + 134, { size: fs, fam: FD, weight: 400 });
      // red "blocked" sign beside the unstruck enzyme name
      const st = ease.outBack(seg(t, a + 2.0, a + 2.3));
      if (st > 0) {
        const sx = X0 + BW - 24 - 25, sy = Y0 + 134 - fs * 0.36, rr = 25 * st;
        ctx.strokeStyle = COL.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx - rr * 0.7, sy + rr * 0.7); ctx.lineTo(sx + rr * 0.7, sy - rr * 0.7); ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
      // "blocked" tag
      const tg = ease.outQuint(seg(t, a + 2.1, a + 2.45)) * (1 - ease.in(bxq));
      if (tg > 0) {
        setF(800, 30, FU, 1); const tgw = tw('BLOCKED BY N-BPs') + 36;
        ctx.save(); ctx.beginPath(); ctx.rect(R - tgw, Y0 + BH, tgw, 52 * tg); ctx.clip();
        rect(R - tgw, Y0 + BH, tgw, 52, COL.red);
        text('BLOCKED BY N-BPs', R - tgw + 18, Y0 + BH + 37, { size: 30, weight: 800, ls: 1, color: COL.paperHi });
        ctx.restore();
      }
    }
    // consequence caption under the headline: loss of function first, apoptosis second
    const cp = P(t, a + 2.75, 0.4), cq = Q(t, b, 0.35);
    arrow(M, 709, COL.red, clamp(cp * 2) * (1 - cq));
    mtext('LOSS OF FUNCTION', M + 78, 722, { size: 36, weight: 800, ls: 1, p: cp, q: cq });
    mtext('/ APOPTOSIS', M + 78, 768, { size: 30, weight: 800, ls: 1, p: P(t, a + 2.95, 0.4), q: cq });
  }
  function drawPit(t) {
    const dm = pitMax(t), d = pitDepth(t);
    if (dm <= 0.5) return;
    const wOf = (dd) => PIT_HW * (0.55 + 0.45 * ease.out(clamp(dd / PIT_D)));
    // new bone laid down as the pit refills (ochre, then matures to ink)
    if (t > T0 && dm - d > 0.5) {
      const nb = 1 - seg(t, T0 + 0.8, T0 + 1.5);
      if (nb > 0) { ctx.save(); ctx.globalAlpha = nb; ctx.fillStyle = COL.ochre; ctx.beginPath(); ctx.ellipse(OC.x, BY - 1, wOf(dm), dm, 0, 0, Math.PI); ctx.fill(); ctx.restore(); }
    }
    if (d > 0.5) { ctx.fillStyle = COL.paper; ctx.beginPath(); ctx.ellipse(OC.x, BY - 1, wOf(d), d, 0, 0, Math.PI); ctx.fill(); }
  }

  // ---------------------------------------------------------------- SCENE 3 · turnover slows, drug stays
  function sceneTurn(t) {
    const [a, b] = S.turn;
    if (t < a - LEAD - 0.05 || t > b + 0.15) return;
    sceneLabel('THE RESULT', t, a - LEAD, b);
    bigNumeral('03', t, a - LEAD + 0.05, b);
    const s1 = fit('TURNOVER', 400, FD, 640, 120);
    mtext('TURNOVER', M - 4, 470, { size: s1, fam: FD, weight: 400, p: P(t, a - LEAD + 0.05, 0.5), q: Q(t, b, 0.35), asc: 0.75, desc: 0.04 });
    mtext('SLOWS', M - 4, 470 + s1 * 0.95, { size: s1, fam: FD, weight: 400, p: P(t, a - LEAD + 0.15, 0.5), q: Q(t, b, 0.35), asc: 0.75, desc: 0.04 });
    setF(400, s1, FD); const wS = tw('SLOWS');
    const sq = ease.outBack(seg(t, a + 0.2, a + 0.5)) * (1 - seg(t, b - 0.35, b - 0.15));
    if (sq > 0) rect(M + wS + 4, 470 + s1 * 0.95 - 24 * sq, 24 * sq, 24 * sq, COL.red);

    // full-width remodelling-rate bar inside the bone field (toy model)
    const cp = P(t, a - 0.1, 0.45), cq = Q(t, b, 0.35);
    const wl = mtext('REMODELLING RATE', M, BY + 92, { size: 30, weight: 800, ls: 2, color: COL.paper, p: cp, q: cq });
    mtext('· toy model', M + wl + 14, BY + 92, { size: 30, weight: 500, color: COL.paper, alpha: 0.85, p: cp, q: cq });
    const rb = ease.outQuint(seg(t, a - 0.05, a + 0.35)) * (1 - ease.inOut(cq));
    const BX = M, BWID = 950 - M, BTOP = BY + 112, BHT = 60;
    if (rb > 0) {
      ctx.save(); ctx.globalAlpha = rb; rect(BX, BTOP, BWID, BHT, 'rgba(238,233,221,0.13)'); ctx.restore();
      rect(BX, BTOP, BWID * rateAt(t) * rb, BHT, COL.red);
      ctx.save(); ctx.globalAlpha = 0.7 * rb; ctx.fillStyle = COL.paper;
      for (let i = 0; i <= 10; i++) ctx.fillRect(BX + (BWID * i) / 10 - 1, BTOP + BHT + 4, 2, i % 5 ? 10 : 18);
      ctx.restore();
      text('slow', BX, BY + 236, { size: 30, weight: 600, color: COL.paper, alpha: 0.85 * rb });
      text('fast', BX + BWID, BY + 236, { size: 30, weight: 600, color: COL.paper, alpha: 0.85 * rb, align: 'right' });
    }
    mtext('suppressed ~60–90%, not stopped', BX + BWID * RATE_FLOOR + 22, BTOP + 41, { size: 30, weight: 700, color: COL.paper, p: P(t, a + 1.3, 0.4), q: cq });

    // "10+ years" retention (of the drug, not of the effect)
    const rp = P(t, a + 1.4, 0.55), rq = Q(t, b, 0.35);
    mtext('10+', M - 6, 1070, { size: 380, fam: FN, weight: 400, color: COL.red, p: rp, q: rq, asc: 0.72, desc: 0.04 });
    setF(400, 380, FN); const x10 = M - 6 + tw('10+') + 34;
    const sy = fit('YEARS', 400, FD, R - x10, 96);
    mtext('YEARS', x10, 880, { size: sy, fam: FD, weight: 400, p: P(t, a + 1.5, 0.45), q: rq, asc: 0.75, desc: 0.04 });
    const cs = fit('retained in bone', 700, FU, R - x10, 40);
    mtext('retained in bone', x10, 944, { size: cs, weight: 700, p: P(t, a + 1.62, 0.45), q: rq });
    mtext('est. half-life, alendronate', x10, 944 + cs * 1.2, { size: 30, weight: 500, p: P(t, a + 1.72, 0.45), q: rq });
  }

  // ---------------------------------------------------------------- SCENE 4 · the decision split
  const TL = 300, TR = 770; // tooth x (left / right column)
  function sceneSplit(t) {
    const [a, b] = S.split;
    if (t < a - LEAD - 0.05 || t > b + 0.4) return;
    const xq = Q(t, b, 0.4);
    // divider on the shared centre axis
    const dv = ease.inOut(seg(t, a - 0.2, a + 0.3)) * (1 - ease.inOut(seg(t, b - 0.3, b + 0.2)));
    if (dv > 0) {
      rect(AX - 2, 320, 4, (BY - 320) * dv, COL.ink);
      rect(AX - 1, BY, 2, (1470 - BY) * dv, 'rgba(238,233,221,0.45)');
    }
    sceneLabel('THE DECISION', t, a - LEAD, b);
    const hs = fit('EXTRACT', 400, FD, 440, 96);
    mtext('EXTRACT', M - 3, 470, { size: hs, fam: FD, weight: 400, p: P(t, a - LEAD + 0.05, 0.5), q: xq, asc: 0.75, desc: 0.04 });
    // ENDO header: ink on an ochre block (red is reserved for risk on this plate)
    setF(400, hs, FD); const wEn = tw('ENDO');
    const blk = ease.outQuint(seg(t, a - 0.1, a + 0.35)) * (1 - ease.inOut(xq));
    if (blk > 0) rect(560, 470 - hs * 0.75 - 14, (wEn + 26) * blk, hs * 0.75 + 30, COL.ochre);
    mtext('ENDO', 573, 470, { size: hs, fam: FD, weight: 400, color: COL.ink, p: P(t, a - LEAD + 0.12, 0.5), q: xq, asc: 0.75, desc: 0.04 });

    // left column, paired with the extraction (AAOMS 2022 — MRONJ risk after tooth extraction, patients on BPs)
    const l0 = a + 0.7;
    mtext('MRONJ AFTER', M, 548, { size: 32, weight: 800, ls: 1, p: P(t, l0, 0.4), q: xq });
    mtext('EXTRACTION', M, 586, { size: 32, weight: 800, ls: 1, p: P(t, l0 + 0.05, 0.4), q: xq });
    const n1 = fit('1.6–14.8%', 400, FN, 446, 150);
    const yN1 = 604 + n1 * 0.74;
    mtext('1.6–14.8%', M - 2, yN1, { size: n1, fam: FN, weight: 400, color: COL.red, p: P(t, l0 + 0.15, 0.5), q: xq, asc: 0.72, desc: 0.06 });
    const gs = fit('osteoporosis pts on BPs', 700, FU, 452, 34);
    mtext('cancer pts on BPs', M, yN1 + 46, { size: gs, weight: 700, p: P(t, l0 + 0.3, 0.4), q: xq });
    mtext('most estimates 1–5%', M, yN1 + 88, { size: 30, weight: 600, p: P(t, l0 + 0.4, 0.4), q: xq });
    const yN2 = yN1 + 200;
    mtext('0–0.15%', M - 2, yN2, { size: 112, fam: FN, weight: 400, color: COL.ink, p: P(t, l0 + 0.55, 0.5), q: xq, asc: 0.72, desc: 0.06 });
    mtext('osteoporosis pts on BPs', M, yN2 + 44, { size: gs, weight: 700, p: P(t, l0 + 0.7, 0.4), q: xq });

    // right column (lands with the obturation)
    const r0 = a + 1.3;
    mtext('NON-SURGICAL RCT', 572, 548, { size: 32, weight: 800, ls: 1, p: P(t, r0, 0.4), q: xq });
    const ns = fit('SOCKET', 400, FD, 430, 100);
    const yNo = 572 + ns * 0.76, ySo = yNo + ns * 0.98;
    mtext('NO', 568, yNo, { size: ns, fam: FD, weight: 400, color: COL.ink, p: P(t, r0 + 0.1, 0.5), q: xq, asc: 0.75, desc: 0.04 });
    mtext('SOCKET', 568, ySo, { size: ns, fam: FD, weight: 400, color: COL.ink, p: P(t, r0 + 0.18, 0.5), q: xq, asc: 0.75, desc: 0.04 });
    const ob = ease.outQuint(seg(t, r0 + 0.35, r0 + 0.75)) * (1 - ease.inOut(xq));
    if (ob > 0) rect(572, ySo + 18, 230 * ob, 14, COL.ochre);
    mtext('treats the infection', 572, ySo + 84, { size: 34, weight: 700, p: P(t, r0 + 0.3, 0.4), q: xq });
    mtext('MRONJ risk: unknown,', 572, ySo + 130, { size: 30, weight: 600, p: P(t, r0 + 0.45, 0.4), q: xq });
    mtext('likely low; rare', 572, ySo + 168, { size: 30, weight: 600, p: P(t, r0 + 0.5, 0.4), q: xq });
    mtext('case reports', 572, ySo + 206, { size: 30, weight: 600, p: P(t, r0 + 0.55, 0.4), q: xq });

    // left tooth: extraction → socket that repairs slowly
    const slideIn = ease.outQuint(seg(t, a - 0.1, a + 0.5));
    const ext = seg(t, a + 0.55, a + 1.25);
    const leftOut = 1 - seg(t, b - 0.4, b);
    if (ext > 0) circle(TL - 58, BY + 196, 34 * leftOut, COL.red);       // the lesion stays in the bone
    const heal = 0.34 * ease.out(seg(t, a + 1.5, a + 4.6));
    socketHole(TL, ease.out(seg(t, a + 0.7, a + 1.05)) * leftOut, heal);
    // repair blips on the socket wall: they come ever more slowly, then stall
    const BL = [[a + 1.5, -66, 170], [a + 2.3, 64, 150], [a + 3.6, -52, 134]];
    for (const [t0, dx, dy] of BL) blip(TL + dx, BY + dy, seg(t, t0, t0 + 0.9), leftOut);
    if (ext < 1) {
      tooth(TL - 420 * (1 - slideIn), { dy: -240 * ease.in(ext), rot: -0.2 * ease.in(ext), alpha: 1 - seg(t, a + 0.95, a + 1.25), lesion: ext > 0 ? 0 : 1 });
    }
    mtext('slow repair → MRONJ risk', M, BY - 32, { size: 30, weight: 700, p: P(t, a + 1.7, 0.4), q: xq });
    mtext('OPEN SOCKET', TL, BY + 262, { size: 30, weight: 800, ls: 2, color: COL.paper, align: 'center', p: P(t, a + 1.0, 0.4), q: Q(t, b, 0.35) });
    mtext('NO SURGICAL WOUND', 758, BY + 262, { size: 30, weight: 800, ls: 1, color: COL.paper, align: 'center', p: P(t, a + 1.6, 0.4), q: Q(t, b, 0.35) });
    // the right tooth is drawn by persistentTooth()
  }
  // right-column tooth persists from plate 04 into the takeaway, then leaves for the loop
  function persistentTooth(t) {
    if (t < A4 - 0.15) return;
    const slideIn = ease.outQuint(seg(t, A4 - 0.1, A4 + 0.5));
    const fill = seg(t, A4 + 1.3, A4 + 2.1);
    const resto = seg(t, A4 + 2.0, A4 + 2.3);
    const lesion = 1 - 0.65 * ease.inOut(seg(t, A4 + 2.2, A4 + 3.7));   // shrinks to a small remnant (healing takes months)
    const out = ease.in(seg(t, LOOP0 - 0.05, LOOP0 + 0.45));
    if (out >= 1) return;
    tooth(TR + 420 * (1 - slideIn) + 440 * out, { fill, resto, lesion });
  }

  // ---------------------------------------------------------------- SCENE 5 · takeaway (red plate; lifts off at the end to reveal the hook)
  function redHeight(t) {
    const down = ease.inOut(seg(t, S.take[0] - 0.5, S.take[0] - 0.05));
    const up = ease.inOut(seg(t, LOOP0 + 0.05, DURATION));
    return BY * down * (1 - up);
  }
  function sceneTake(t) {
    const hR = redHeight(t);
    if (hR <= 0) return;
    const [a] = S.take, c = COL.paperHi;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hR); ctx.clip();
    rect(0, 0, W, BY, COL.red);
    header(t, COL.paperHi, COL.ochre, 5);
    sceneLabel('TAKEAWAY', t, a - LEAD, 99, c);
    const sq = fit('RESTORABLE, SALVAGEABLE TOOTH?', 800, FU, CW, 42, 2);
    mtext('RESTORABLE, SALVAGEABLE TOOTH?', M, 430, { size: sq, weight: 800, ls: 2, color: c, p: P(t, a - 0.2, 0.45) });
    const se = fit('ENDO', 400, FD, 700, 240);
    mtext('ENDO', M - 6, 640, { size: se, fam: FD, weight: 400, color: c, p: P(t, a - 0.1, 0.55), asc: 0.75, desc: 0.04 });
    setF(400, se, FD); const wE = tw('ENDO');
    circle(M - 6 + wE + se * 0.17, 640 - se * 0.1, se * 0.1 * ease.outBack(seg(t, a + 0.2, a + 0.6)), COL.ochre);
    rect(M, 672, 260 * ease.outQuint(seg(t, a + 0.15, a + 0.6)), 14, COL.ink);
    // risk-stratified rows (Bauhaus markers: filled square = high risk, ring = low risk)
    const m1 = ease.outBack(seg(t, a + 0.25, a + 0.55)), m2 = ease.outBack(seg(t, a + 0.45, a + 0.75));
    if (m1 > 0) rect(M + 13 - 13 * m1, 744 - 26 + 13 - 13 * m1, 26 * m1, 26 * m1, COL.ink);
    if (m2 > 0) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(M + 13, 852 - 13, 11 * m2, 0, Math.PI * 2); ctx.stroke(); }
    mtext('Cancer-dose IV BP or denosumab:', M + 46, 744, { size: 36, weight: 600, color: c, p: P(t, a + 0.25, 0.45) });
    mtext('strongly prefer non-surgical RCT.', M + 46, 792, { size: 40, weight: 800, color: c, p: P(t, a + 0.35, 0.45) });
    mtext('Osteoporosis on BPs: MRONJ risk very low.', M + 46, 852, { size: 36, weight: 600, color: c, p: P(t, a + 0.45, 0.45) });
    // ink band: how to minimise bone trauma
    const bandP = ease.outQuint(seg(t, a + 0.55, a + 0.95));
    if (bandP > 0) rect(0, 900, R * bandP, 146, COL.ink);
    mtext('MINIMISE BONE TRAUMA', M, 946, { size: 30, weight: 800, ls: 2, color: COL.ochre, p: P(t, a + 0.65, 0.4) });
    mtext('No apical surgery, no over-instrumentation,', M, 990, { size: 32, weight: 600, color: c, p: P(t, a + 0.75, 0.45) });
    mtext('careful clamp.', M, 1030, { size: 32, weight: 600, color: c, p: P(t, a + 0.82, 0.45) });
    ctx.restore();
  }

  // ---------------------------------------------------------------- main render
  function render(t) {
    t = clamp(t, 0, DURATION);
    ctx.save();
    background();
    ctx.drawImage(boneTex, 0, BY);
    drawPit(t);
    header(t, COL.ink);
    subtitle(t);
    sweeps(t);
    sceneHook(t >= LOOP0 ? 0 : t);
    sceneDrug(t);
    sceneOC(t);
    remodelPulses(t);
    boundMolecules(t);
    sceneTurn(t);
    sceneSplit(t);
    sceneTake(t);          // red plate on top of everything above the bone
    persistentTooth(t);
    footer(t);
    ctx.restore();
  }

  window.REEL = {
    title: 'Bisphosphonates, osteoclasts & MRONJ',
    duration: DURATION,
    poster: 1.6,
    canvas,
    fonts: ['400 100px "Archivo Black"', '400 100px "Bebas Neue"', '500 30px Inter', '600 30px Inter', '700 30px Inter', '800 30px Inter'],
    async setup() { makeBone(); },
    render,
  };
  Kit.boot(REEL);
})();
