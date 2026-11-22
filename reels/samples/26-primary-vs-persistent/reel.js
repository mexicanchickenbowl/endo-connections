/* Sample 26 — PRIMARY vs PERSISTENT / SECONDARY endodontic infection, as a trading-card table.
   Left column = the untreated necrotic pulp (a big, mixed, mostly anaerobic deck), right column = the previously
   treated tooth (a small hand). A TREATMENT bar sweeps the left column; two cards survive and cross the line.
   Everything is a pure function of t (seconds). Card art lives in cards.js. */
(function () {
  const { W, H, clamp, lerp, seg, ease, rgba, rng } = Kit;
  const { CW, CH, CR, P, BC, IN, rr, rad } = Cards;
  const { canvas, ctx } = Kit.createCanvas();

  // ---------------------------------------------------------------- layout
  const LX = [64, 298], RX = [556, 790];            // card slot x (left edges) in the two columns
  const HEAD_Y = 292, SUB_Y = 330;                  // header baselines
  const HOOK_Y = 742;                               // label baseline above the opening fans
  const PLQ_Y = 344, PLQ_H = 170, COLW = 460;
  const ROW0 = 526, STEP = 185;                     // left cascade
  const R1Y = 526, R2Y = 824, R3Y = 1192;           // right rows
  const HW = 620, HH = 806, HS = HW / CW;           // hero card
  const HERO = { x: 540, y: 912 };
  const HAND_Y = 1292;
  const HS0 = 1.0;                                  // card scale in the opening fans
  const DUR = 24;

  // ---------------------------------------------------------------- timeline (s)
  const T = {
    titleIn: [0, 0.3], titleOut: [2.6, 2.85],
    fold: [2.52, 2.84], move: [2.9, 3.3],
    dealL: 3.38, dealDt: 0.24, fly: 0.44,           // 10 cards, last lands at 5.98
    resL: [6.04, 6.36],                             // the range, its unit and its method appear together
    key: [3.3, 6.4],                                // legend sits on the empty right half while the deck is dealt
    bar: [6.2, 6.6, 8.3],                           // appears, starts sweeping, leaves
    cross: [8.3, 8.5], crossFly: 0.7,
    rPlq: [8.45, 8.8], tagP: 9.2,
    dealE: 9.3, dealC: 9.72, flyR: 0.5,
    sec: [10.3, 11.05], tagS: 10.95,
    resR: [11.35, 11.7],
    hero: [13.3, 14.0], heroBack: [17.9, 18.5],
    gather: 17.9, lines: 18.3,
    out: 23.2,
  };
  const BAR_Y0 = 552, BAR_Y1 = 1660;
  const tFlip = (row) => T.bar[1] + (T.bar[2] - T.bar[1]) * ((ROW0 + row * STEP + 92) - BAR_Y0) / (BAR_Y1 - BAR_Y0);
  const colU = (t) => seg(t, T.move[0], T.move[1] - 0.1, ease.inOut) * (1 - seg(t, T.out + 0.1, T.out + 0.5, ease.inOut)); // 0 = hook layout, 1 = columns

  // ---------------------------------------------------------------- poses
  const DECK_HOOK = { L: { x: 293, y: 1068 }, R: { x: 782, y: 1068 } };
  const DECK_TOP = { L: { x: 120, y: 128 }, R: { x: 960, y: 128 } };
  const fan = (px, py, deg) => ({ x: px + 300 * Math.sin(rad(deg)), y: py - 300 * Math.cos(rad(deg)), rot: deg, s: HS0 });
  const FAN_L = [-18, -9, 0, 9, 18].map((d) => fan(293, 1283, d));
  const FAN_R = [-9, 9].map((d) => fan(782, 1283, d));
  const jr = rng(2607);
  const L_SLOT = Array.from({ length: 10 }, (_, i) => ({ x: LX[i % 2] + CW / 2 + (jr() - 0.5) * 5, y: ROW0 + Math.floor(i / 2) * STEP + CH / 2 + (jr() - 0.5) * 4, rot: (jr() - 0.5) * 4.2 }));
  const R_SLOT = {
    efaec: { x: RX[0] + CW / 2, y: R1Y + CH / 2, rot: -1.4 }, candi: { x: RX[1] + CW / 2, y: R1Y + CH / 2, rot: 1.6 },
    strep: { x: RX[0] + CW / 2, y: R2Y + CH / 2, rot: 1.2 }, pseud: { x: RX[1] + CW / 2, y: R2Y + CH / 2, rot: -1.5 },
    sec: { x: RX[0] + CW / 2, y: R3Y + CH / 2, rot: -2.5 },
  };
  const HAND_L = Array.from({ length: 10 }, (_, h) => ({ x: 64 + CW / 2 + 26 * h, y: HAND_Y + 14 * Math.pow((h - 4.5) / 4.5, 2), rot: (h - 4.5) * 1.3 }));
  const HAND_RX = [0, 32, 64, 96, 168];             // wider last gap: the corner "?" of the unnamed card shows under the top card
  const HAND_R = Array.from({ length: 5 }, (_, h) => ({ x: 556 + CW / 2 + HAND_RX[h], y: HAND_Y + 12 * Math.pow((h - 2) / 2, 2), rot: (h - 2) * 2.0 }));

  // ---------------------------------------------------------------- tracks
  function track(init) {
    const segs = [];
    const api = {
      to(t0, t1, to, e, o = {}) { segs.push({ t0, t1, to, e: e || ease.inOut, ...o }); return api; },
      set(t, to) { segs.push({ t0: t, t1: t, to, e: ease.linear }); return api; },
      at(t) {
        const p = { x: 0, y: 0, rot: 0, s: 1, flip: 0, a: 1, dim: 0, lift: 0, halo: 0, z: 0, ...init };
        for (const s of segs) {
          if (t >= s.t1) { Object.assign(p, s.to); continue; }
          if (t <= s.t0) break;
          const u = (t - s.t0) / (s.t1 - s.t0), k = s.e(u);
          for (const key in s.to) {
            if (key === 'z') continue;
            if (key === 'flip' && s.flipWin) p.flip = lerp(p.flip, s.to.flip, ease.inOut(clamp((u - s.flipWin[0]) / (s.flipWin[1] - s.flipWin[0]))));
            else p[key] = lerp(p[key], s.to[key], k);
          }
          if (s.arc) p.lift += s.arc * Math.sin(Math.PI * u);
          if (s.zFly != null) p.z = s.zFly;
          break;
        }
        return p;
      },
    };
    return api;
  }

  const L_KEYS = ['fuso', 'parvi', 'porph', 'olsen', 'trepo', 'prevo', 'tanne', 'pseud', 'strep', 'diali'];
  const HAND_L_ORDER = ['diali', 'parvi', 'tanne', 'prevo', 'olsen', 'porph', 'pseud2', 'trepo', 'strep2', 'fuso'];
  const HAND_R_ORDER = ['strep', 'pseud', 'candi', 'sec', 'efaec'];
  const foldEnd = (i) => T.fold[1] + 0.02 * i;
  const outT0 = (i) => T.out + 0.1 + 0.015 * i, outT1 = (i) => T.out + 0.62 + 0.015 * i;
  const cards = [];

  L_KEYS.forEach((key, i) => {
    const row = Math.floor(i / 2), tl = T.dealL + i * T.dealDt, surv = key === 'pseud' || key === 'strep';
    const tr = track(i < 5 ? { ...FAN_L[i], z: 10 + i } : { ...DECK_HOOK.L, s: HS0, flip: 1, a: 0, z: 5 });
    if (i < 5) tr.to(T.fold[0] + 0.02 * i, foldEnd(i), { ...DECK_HOOK.L, rot: 0, s: HS0, flip: 1 }).set(foldEnd(i), { a: 0 });
    tr.set(tl, { ...DECK_TOP.L, rot: -5, s: 0.5, flip: 1, a: 1 });
    tr.to(tl, tl + T.fly, { ...L_SLOT[i], s: 1, flip: 0, z: i }, ease.out, { arc: 1, flipWin: [0.1, 0.72], zFly: 100 + i });
    if (!surv) tr.to(tFlip(row), tFlip(row) + 0.34, { flip: 1, dim: 0.62 }, ease.inOut, { arc: 0.45 });
    else {
      const k = key === 'pseud' ? 0 : 1, tc = T.cross[k];
      tr.to(tFlip(row), tFlip(row) + 0.4, { halo: 1 }, ease.out, { arc: 0.5 });
      tr.to(tc, tc + T.crossFly, { ...R_SLOT[key], z: 60 + k }, ease.inOut, { arc: 1.25, zFly: 200 + k });
      tr.to(tc + T.crossFly + 0.25, tc + T.crossFly + 0.8, { halo: 0 }, ease.inOut);
    }
    const hand = surv ? HAND_R[HAND_R_ORDER.indexOf(key)] : HAND_L[HAND_L_ORDER.indexOf(key)];
    const hz = surv ? 400 + HAND_R_ORDER.indexOf(key) : 300 + HAND_L_ORDER.indexOf(key);
    const tg = T.gather + 0.1 + 0.02 * i;
    tr.to(tg, tg + 0.6, { ...hand, s: 1, flip: 0, dim: 0, z: hz }, ease.inOut, { arc: 0.5, zFly: hz });
    if (i < 5) tr.to(outT0(i), outT1(i), { ...FAN_L[i], z: 10 + i }, ease.inOut, { arc: 0.5, zFly: 500 + i });
    else tr.to(outT0(i), outT1(i), { ...DECK_HOOK.L, rot: 0, s: HS0, flip: 1 }, ease.inOut, { zFly: 6 }).set(outT1(i), { a: 0 });
    cards.push({ key, face: key, back: 'back', tr, seed: i * 0.173 });
  });
  // duplicates of the two survivors, so the summary hand of the primary deck is complete again
  ['pseud', 'strep'].forEach((key) => {
    const h = HAND_L_ORDER.indexOf(key + '2');
    const tr = track({ ...HAND_L[h], a: 0, z: 300 + h }).to(T.gather + 0.6, T.gather + 1.0, { a: 1 }).to(T.out, T.out + 0.2, { a: 0 });
    cards.push({ key: key + '2', face: key, back: 'back', tr, seed: h * 0.21 });
  });
  { // E. faecalis (hero) and Candida: dealt from the right-hand deck
    const mkR = (key, fi, tDeal, fz) => {
      const h = HAND_R_ORDER.indexOf(key);
      const tr = track({ ...FAN_R[fi], z: 10 + fi });
      tr.to(T.fold[0] + 0.03 * fi, T.fold[1] + 0.03 * fi, { ...DECK_HOOK.R, rot: 0, s: HS0, flip: 1 }).set(T.fold[1] + 0.03 * fi, { a: 0 });
      tr.set(tDeal, { ...DECK_TOP.R, rot: 5, s: 0.5, flip: 1, a: 1 });
      tr.to(tDeal, tDeal + T.flyR, { ...R_SLOT[key], s: 1, flip: 0, z: fz }, ease.out, { arc: 1, flipWin: [0.1, 0.72], zFly: 150 + fi });
      if (key === 'efaec') {
        tr.to(T.hero[0], T.hero[1], { ...HERO, rot: 0, s: HS, z: 900 }, ease.inOut, { arc: 0.3, zFly: 900 });
        tr.to(T.heroBack[0], T.heroBack[1], { ...HAND_R[h], s: 1, z: 400 + h }, ease.inOut, { zFly: 900 });
      } else tr.to(T.gather + 0.16, T.gather + 0.76, { ...HAND_R[h], s: 1, z: 400 + h }, ease.inOut, { arc: 0.5, zFly: 400 + h });
      tr.to(T.out + 0.12 + 0.03 * fi, T.out + 0.66 + 0.03 * fi, { ...FAN_R[fi], z: 10 + fi }, ease.inOut, { arc: 0.5, zFly: 520 + fi });
      cards.push({ key, face: key, back: 'back', tr, seed: 0.4 + fi * 0.31 });
    };
    mkR('candi', 0, T.dealC, 51); mkR('efaec', 1, T.dealE, 50);
  }
  { // the unnamed card that slides in from off the table = SECONDARY infection
    const h = HAND_R_ORDER.indexOf('sec'), OFF = { x: 1270, y: 1440, rot: 26 };
    const tr = track({ ...OFF, flip: 1, z: 52 });
    tr.to(T.sec[0], T.sec[1], { ...R_SLOT.sec }, ease.out, { arc: 0.5, zFly: 160 });
    tr.to(T.gather + 0.2, T.gather + 0.8, { ...HAND_R[h], z: 400 + h }, ease.inOut, { arc: 0.5, zFly: 400 + h });
    tr.to(T.out - 0.15, T.out + 0.4, { ...OFF }, ease.in);   // leaves first, from under the top card
    cards.push({ key: 'sec', face: 'backQ', back: 'backQ', tr, seed: 0.77 });
  }
  const landedL = (t) => { let n = 0; for (let i = 0; i < 10; i++) if (t >= T.dealL + i * T.dealDt + T.fly * 0.92) n++; return n; };
  const R_LAND = [T.cross[0] + T.crossFly, T.cross[1] + T.crossFly, T.dealE + T.flyR, T.dealC + T.flyR, T.sec[1]];
  const landedR = (t) => R_LAND.filter((x) => t >= x - 0.04).length;
  function deckCount(side, t) {
    if (side === 'L') {
      if (t < T.dealL) { let n = 5; for (let i = 0; i < 5; i++) if (t >= foldEnd(i)) n++; return n; }
      if (t < T.out) { let n = 10; for (let i = 0; i < 10; i++) if (t >= T.dealL + i * T.dealDt) n--; return n; }
      let n = 0; for (let i = 5; i < 10; i++) if (t >= outT1(i)) n++; return n;
    }
    if (t < T.dealE) return (t >= T.fold[1] ? 1 : 0) + (t >= T.fold[1] + 0.03 ? 1 : 0);
    return t < T.dealC ? 1 : 0;
  }
  function deckPose(side, t) { const u = colU(t), a = DECK_HOOK[side], b = DECK_TOP[side]; return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(HS0, 0.5, u) }; }

  // ---------------------------------------------------------------- drawing helpers
  function txt(s, x, y, font, color, o = {}) {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    if (o.ls) ctx.letterSpacing = o.ls + 'px'; if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillText(s, x, y); const w = ctx.measureText(s).width; ctx.restore(); return w;
  }
  function measure(s, font, ls) { ctx.save(); ctx.font = font; if (ls) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
  /** runs of differently styled text on one baseline; align 'left' | 'center' */
  function runs(parts, x, y, align) {
    const ws = parts.map((p) => measure(p.s, p.font, p.ls)); const tot = ws.reduce((a, b) => a + b, 0);
    let cx = align === 'center' ? x - tot / 2 : x;
    parts.forEach((p, i) => { txt(p.s, cx, y, p.font, p.color, { ls: p.ls }); cx += ws[i]; });
    return tot;
  }
  function goldGrad(y0, y1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, P.goldPale); g.addColorStop(0.55, P.gold); g.addColorStop(1, P.goldDeep); return g; }
  const F = {
    name: `700 44px ${BC}`, sub: `500 30px ${IN}`, num: `700 96px ${BC}`, unit: `600 36px ${BC}`, meth: `500 32px ${BC}`,
    term: `700 40px ${BC}`, def: `500 38px ${BC}`, tag: `700 36px ${BC}`, line: `600 52px ${BC}`, key: `600 34px ${IN}`, src: `500 26px ${BC}`,
    handle: `500 26px ${IN}`, note: `italic 500 24px ${IN}`,
  };

  function cardXf(p) { return { x: p.x, y: p.y - 10 * p.lift, s: p.s * (1 + 0.06 * p.lift) }; }
  function shimmerBand(t, seed, x, y, w, h, r, inset, ri, strong) {
    const ph = (t * 0.33 + x * 0.0007 + y * 0.0004 + seed) % 1.85; if (ph > 1) return;
    const d = lerp(-w * 0.95, w * 0.95, ph);
    const pass = (ring, alpha) => {
      ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r);
      if (ring) { ctx.roundRect(-w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, ri); ctx.clip('evenodd'); } else ctx.clip();
      ctx.transform(1, 0, -0.42, 1, 0, 0);
      const bw = w * 0.2, g = ctx.createLinearGradient(d - bw, 0, d + bw, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${alpha})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(d - bw, -h, bw * 2, h * 2); ctx.restore();
    };
    pass(true, strong); pass(false, strong * 0.22);
  }
  function drawCard(c, p, t) {
    if (p.a <= 0.003) return;
    const cs = Math.cos(p.flip * Math.PI), faceUp = cs >= 0, sx = Math.max(Math.abs(cs), 0.03), f = cardXf(p), sh = Cards.shadow;
    ctx.save(); ctx.globalAlpha = p.a;
    ctx.save(); ctx.translate(p.x + 5 + 14 * p.lift, p.y + 9 + 24 * p.lift); ctx.rotate(rad(p.rot)); ctx.scale(f.s * sx, f.s);
    ctx.globalAlpha = p.a * (0.5 - 0.16 * Math.min(1, p.lift)) * (1 - 0.75 * Math.min(1, p.dim / 0.62));
    ctx.drawImage(sh.c, -CW / 2 - sh.pad, -CH / 2 - sh.pad, CW + sh.pad * 2, CH + sh.pad * 2); ctx.restore();
    ctx.translate(f.x, f.y); ctx.rotate(rad(p.rot)); ctx.scale(f.s * sx, f.s);
    ctx.drawImage(Cards.sprites[faceUp ? c.face : c.back], -CW / 2, -CH / 2, CW, CH);
    if (p.dim < 0.3) shimmerBand(t, c.seed, p.x, p.y, CW, CH, CR, 7, 10, faceUp ? 0.6 : 0.4);
    const shade = (1 - Math.abs(cs)) * 0.3 * (1 - p.dim);
    if (shade > 0.01) { rr(ctx, -CW / 2 - 0.5, -CH / 2 - 0.5, CW + 1, CH + 1, CR); ctx.fillStyle = `rgba(4,22,18,${Math.min(0.85, shade)})`; ctx.fill(); }
    if (p.dim > 0.01) { rr(ctx, -CW / 2 - 0.5, -CH / 2 - 0.5, CW + 1, CH + 1, CR); ctx.fillStyle = `rgba(11,50,42,${Math.min(0.85, p.dim)})`; ctx.fill(); } // eliminated: sink into the felt
    if (p.halo > 0.01) {
      ctx.save(); ctx.globalAlpha = p.a * p.halo * (0.8 + 0.2 * Math.sin(t * 7));
      ctx.shadowColor = P.gold; ctx.shadowBlur = 26; ctx.strokeStyle = P.goldPale; ctx.lineWidth = 5; rr(ctx, -CW / 2 - 3, -CH / 2 - 3, CW + 6, CH + 6, CR + 3); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function drawDeck(side, t) {
    const n = deckCount(side, t); if (n <= 0) return;
    const d = deckPose(side, t), sh = Cards.shadow;
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(d.s, d.s);
    ctx.globalAlpha = 0.5; ctx.drawImage(sh.c, -CW / 2 - sh.pad + 6 + n, -CH / 2 - sh.pad + 10 + n * 2, CW + sh.pad * 2, CH + sh.pad * 2); ctx.globalAlpha = 1;
    for (let k = n - 1; k >= 0; k--) ctx.drawImage(Cards.sprites.back, -CW / 2 + k * 1.3, -CH / 2 + k * 3.2, CW, CH);
    ctx.restore();
  }
  /** tiny card icon. g2 = second Gram colour: split diagonally in half, or (corner = true) only a small corner */
  function miniCard(cx, cy, w, h, g, g2, corner) {
    ctx.save(); ctx.translate(cx - w / 2, cy - h / 2);
    Cards.foilBorder(ctx, w, h, 7, g);
    if (g2 && !corner) { ctx.save(); rr(ctx, 0, 0, w, h, 7); ctx.clip(); ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.clip(); Cards.foilBorder(ctx, w, h, 7, g2); ctx.restore(); }
    rr(ctx, 4.5, 4.5, w - 9, h - 9, 4); ctx.fillStyle = rgba(P.paper, 0.9); ctx.fill();
    ctx.fillStyle = g.main; ctx.fillRect(4.5, 4.5, g2 && !corner ? (w - 9) / 2 : w - 9, 9);
    if (g2 && !corner) { ctx.fillStyle = g2.main; ctx.fillRect(w / 2, 4.5, (w - 9) / 2, 9); }
    if (g2 && corner) { const c = w * 0.6; ctx.save(); rr(ctx, 0, 0, w, h, 7); ctx.clip(); ctx.beginPath(); ctx.moveTo(w, h - c); ctx.lineTo(w, h); ctx.lineTo(w - c, h); ctx.closePath(); ctx.fillStyle = g2.main; ctx.fill(); ctx.restore(); }
    ctx.restore();
  }

  // ---------------------------------------------------------------- scene parts
  function drawDivider(t) {
    const u = colU(t), y0 = lerp(716, 240, u), y1 = lerp(1262, 1584, u);
    ctx.save(); ctx.strokeStyle = rgba(P.gold, 0.42); ctx.lineWidth = 3; ctx.setLineDash([14, 11]); ctx.lineCap = 'butt';
    const gap = seg(t, T.lines + 0.6, T.lines + 1.1) * (1 - seg(t, T.out - 0.05, T.out + 0.2));
    ctx.beginPath(); ctx.moveTo(540, y0); ctx.lineTo(540, y1); ctx.stroke(); ctx.setLineDash([]);
    if (gap > 0.01) { ctx.save(); ctx.globalAlpha = gap; ctx.drawImage(Cards.felt, 520, 800, 40, 318, 520, 800, 40, 318); ctx.restore(); }
    for (const y of [y0 - 12, y1 + 12]) { ctx.save(); ctx.translate(540, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = rgba(P.gold, 0.6); ctx.fillRect(-5, -5, 10, 10); ctx.restore(); }
    // flash where a survivor crosses the line
    [[T.cross[0], 0], [T.cross[1], 1]].forEach(([tc, k]) => {
      const a = seg(t, tc + 0.18, tc + 0.36) * (1 - seg(t, tc + 0.36, tc + 0.85));
      if (a > 0.01) { const y = k ? 1180 : 1090, g = ctx.createRadialGradient(540, y, 2, 540, y, 150); g.addColorStop(0, rgba(P.goldPale, 0.75 * a)); g.addColorStop(1, rgba(P.gold, 0)); ctx.fillStyle = g; ctx.fillRect(390, y - 150, 300, 300); }
    });
    ctx.restore();
  }
  function drawSlots(t) {
    const a = seg(t, T.rPlq[0], T.rPlq[1]) * (1 - seg(t, T.gather, T.gather + 0.4)); if (a < 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = rgba(P.gold, 0.3); ctx.lineWidth = 2; ctx.setLineDash([9, 8]);
    for (const k of ['efaec', 'candi', 'strep', 'pseud', 'sec']) { const s = R_SLOT[k]; rr(ctx, s.x - CW / 2 + 4, s.y - CH / 2 + 4, CW - 8, CH - 8, CR - 3); ctx.stroke(); }
    ctx.restore();
  }
  function drawHeaders(t) {
    const late = t > 12;
    const aH = late ? seg(t, T.out + 0.3, T.out + 0.6) : 1 - seg(t, T.move[0] - 0.05, T.move[0] + 0.15);
    const aC = late ? 1 - seg(t, T.out, T.out + 0.25) : seg(t, T.move[1] - 0.15, T.move[1] + 0.1);
    const parts = [{ s: 'PERSISTENT ', font: F.name, color: P.ivory, ls: 1.2 }, { s: '/', font: F.name, color: P.gold, ls: 1.2 }, { s: ' SECONDARY', font: F.name, color: P.ivory, ls: 1.2 }];
    if (aH > 0.01) {
      ctx.save(); ctx.globalAlpha = aH; ctx.translate(0, -14 * (1 - ease.out(aH)));
      txt('PRIMARY', DECK_HOOK.L.x, HOOK_Y, F.name, P.ivory, { ls: 1.2, align: 'center' });
      txt('untreated necrotic pulp', DECK_HOOK.L.x, HOOK_Y + 42, F.sub, P.mint, { align: 'center' });
      runs(parts, DECK_HOOK.R.x, HOOK_Y, 'center');
      ctx.restore();
    }
    if (aC > 0.01) {
      ctx.save(); ctx.globalAlpha = aC; ctx.translate(0, 10 * (1 - ease.out(aC)));
      txt('PRIMARY', 64, HEAD_Y, F.name, P.ivory, { ls: 1.2 });
      txt('untreated necrotic pulp', 64, SUB_Y, F.sub, P.mint);
      runs(parts, 556, HEAD_Y, 'left');
      ctx.restore();
    }
    const na = seg(t, T.move[1], T.move[1] + 0.4) * (1 - seg(t, T.out, T.out + 0.25));
    if (na > 0.01) txt('schematic decks', 524, HEAD_Y - 2, F.note, P.mint, { align: 'right', alpha: 0.75 * na });
  }
  function drawPips(x, y, solid, range) {
    const pw = 18, ph = 16;
    for (let i = 0; i < 20; i++) {
      const px = x + i * 21; rr(ctx, px, y, pw, ph, 4);
      const s = clamp(solid - i), r = clamp(range - i);
      ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fill();
      if (r > 0.01 && s < 0.99) { ctx.save(); ctx.globalAlpha *= r * 0.95; rr(ctx, px + 1, y + 1, pw - 2, ph - 2, 3.5); ctx.strokeStyle = P.gold; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = rgba(P.gold, 0.28); ctx.fill(); ctx.restore(); }
      if (s > 0.01) { ctx.save(); ctx.globalAlpha *= s; rr(ctx, px, y, pw, ph, 4); ctx.fillStyle = goldGrad(y, y + ph); ctx.fill(); ctx.restore(); }
    }
  }
  function drawPlaque(side, t) {
    const L = side === 'L', x0 = L ? 64 : 556;
    const a = (L ? seg(t, T.move[1] - 0.1, T.move[1] + 0.25) : seg(t, T.rPlq[0], T.rPlq[1])) * (1 - seg(t, T.out, T.out + 0.3)); if (a < 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    rr(ctx, x0, PLQ_Y, COLW, PLQ_H, 18); ctx.fillStyle = 'rgba(3,20,17,0.7)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(P.gold, 0.6); ctx.stroke();
    const by = PLQ_Y + 92, nx = x0 + 21;
    ctx.font = F.num; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = goldGrad(PLQ_Y + 30, by);
    let finalW, lab;
    if (L) {
      const n = landedL(t), u = seg(t, T.resL[0], T.resL[1], ease.out), w10 = ctx.measureText('10').width;
      finalW = ctx.measureText('10–20').width;
      if (n > 0) { const s = String(n), w = ctx.measureText(s).width, pop = 1 + 0.16 * (1 - seg(t, T.dealL + (n - 1) * T.dealDt + T.fly * 0.92, T.dealL + (n - 1) * T.dealDt + T.fly * 0.92 + 0.2, ease.out)); ctx.save(); ctx.translate(nx + w10 / 2, by - 30); ctx.scale(pop, pop); ctx.fillText(s, -w / 2, 30); ctx.restore(); }
      if (u > 0) { ctx.save(); ctx.globalAlpha *= u; ctx.fillText('–20', nx + w10 - 14 * (1 - u), by); ctx.restore(); }
      drawPips(nx, PLQ_Y + 138, n, 20 * u); lab = seg(t, T.resL[0], T.resL[1]);
    } else {
      const n = landedR(t), u = seg(t, T.resR[0], T.resR[1], ease.out), wp = ctx.measureText('1–').width, w5 = ctx.measureText('5').width;
      finalW = ctx.measureText('1–5').width;
      if (n > 0) { const s = String(n), w = ctx.measureText(s).width, tl = R_LAND[n - 1] - 0.04, pop = 1 + 0.16 * (1 - seg(t, tl, tl + 0.2, ease.out)); ctx.save(); ctx.translate(nx + wp + w5 / 2, by - 30); ctx.scale(pop, pop); ctx.fillText(s, -w / 2, 30); ctx.restore(); }
      if (u > 0) { ctx.save(); ctx.globalAlpha *= u; ctx.fillText('1–', nx + 14 * (1 - u), by); ctx.restore(); }
      drawPips(nx, PLQ_Y + 138, u > 0 ? lerp(n, 1, u) : n, u > 0 ? 5 : 0); lab = seg(t, T.resR[0], T.resR[1]);
    }
    // while cards are still landing only the bare tally shows: a paused frame never pairs a transient number with the unit
    if (lab > 0.01) {
      txt('taxa per canal', nx + finalW + 16, by, F.unit, P.ivory, { alpha: lab });
      txt(L ? 'molecular studies' : 'adequately treated · culture + PCR', nx, PLQ_Y + 126, F.meth, P.mint, { alpha: lab });
    }
    ctx.restore();
  }
  function drawKey(t) {
    const a = seg(t, T.key[0], T.key[0] + 0.35) * (1 - seg(t, T.key[1], T.key[1] + 0.3)); if (a < 0.01) return;
    const x0 = 596, y0 = 566, w = 380, h = 356;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, 14 * (1 - seg(t, T.key[0], T.key[0] + 0.35, ease.out)));
    rr(ctx, x0, y0, w, h, 22); ctx.fillStyle = 'rgba(3,20,17,0.5)'; ctx.fill(); ctx.setLineDash([10, 8]); ctx.strokeStyle = rgba(P.gold, 0.55); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    const rows = [['neg', 'Gram −'], ['pos', 'Gram +'], ['an', 'anaerobe'], ['fac', 'facultative']];
    rows.forEach(([k, label], i) => {
      const y = y0 + 62 + i * 78, ra = seg(t, T.key[0] + 0.1 + i * 0.07, T.key[0] + 0.4 + i * 0.07);
      ctx.save(); ctx.globalAlpha *= ra;
      if (k === 'neg' || k === 'pos') miniCard(x0 + 64, y, 40, 52, P[k]); else Cards.o2Badge(ctx, x0 + 64, y, 23, k);
      txt(label, x0 + 112, y + 12, F.key, P.ivory); ctx.restore();
    });
    ctx.restore();
  }
  function drawBar(t) {
    const a = seg(t, T.bar[0], T.bar[0] + 0.25) * (1 - seg(t, T.bar[2] - 0.2, T.bar[2])); if (a < 0.01) return;
    const u = clamp((t - T.bar[1]) / (T.bar[2] - T.bar[1])), by = lerp(BAR_Y0, BAR_Y1, u) - 16 * (1 - seg(t, T.bar[0], T.bar[0] + 0.3, ease.out));
    const x0 = 46, w = 496, h = 60;
    ctx.save(); ctx.globalAlpha = a;
    // rinse wake above the bar
    if (u > 0) { const wh = Math.min(170, (by - BAR_Y0) + 10), g = ctx.createLinearGradient(0, by - wh, 0, by); g.addColorStop(0, 'rgba(160,235,245,0)'); g.addColorStop(1, 'rgba(160,235,245,0.26)'); ctx.fillStyle = g; ctx.fillRect(x0 + 8, by - wh, w - 16, wh); }
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    rr(ctx, x0, by - h / 2, w, h, 14); const g = ctx.createLinearGradient(0, by - h / 2, 0, by + h / 2); g.addColorStop(0, '#fffdf4'); g.addColorStop(0.5, P.ivory); g.addColorStop(1, '#d8cfb6'); ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.5; ctx.strokeStyle = P.goldDeep; ctx.stroke();
    // sieve perforations on both wings
    ctx.fillStyle = 'rgba(9,40,34,0.82)';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { for (const sx of [x0 + 26 + i * 19 + (j ? 9.5 : 0), x0 + w - 26 - i * 19 - (j ? 9.5 : 0)]) { ctx.beginPath(); ctx.arc(sx, by - 9 + j * 18, 5.2, 0, Math.PI * 2); ctx.fill(); } }
    txt('TREATMENT', x0 + w / 2 + 3, by + 15, `700 44px ${BC}`, P.navy, { align: 'center', ls: 5 });
    ctx.restore();
  }
  function drawTags(t) {
    const out = 1 - seg(t, T.hero[0], T.hero[0] + 0.3);
    const a1 = seg(t, T.tagP, T.tagP + 0.35) * out;
    if (a1 > 0.01) {
      ctx.save(); ctx.globalAlpha = a1; ctx.translate(0, 8 * (1 - seg(t, T.tagP, T.tagP + 0.35, ease.out)));
      const y = R2Y + CH + 10; ctx.strokeStyle = rgba(P.gold, 0.8); ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(566, y - 7); ctx.lineTo(566, y); ctx.lineTo(1006, y); ctx.lineTo(1006, y - 7); ctx.stroke();
      txt('PERSISTENT', 566, y + 38, F.tag, P.gold, { ls: 0.8 });
      ctx.restore();
    }
    const a2 = seg(t, T.tagS, T.tagS + 0.35) * out;
    if (a2 > 0.01) {
      ctx.save(); ctx.globalAlpha = a2; ctx.translate(10 * (1 - seg(t, T.tagS, T.tagS + 0.35, ease.out)), 0);
      const x = 794, y = R3Y + CH / 2;
      ctx.strokeStyle = rgba(P.gold, 0.8); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 8, y - 30); ctx.lineTo(x - 8, y + 30); ctx.stroke();
      txt('SECONDARY', x + 4, y + 13, F.tag, P.gold, { ls: 0.8 });
      ctx.restore();
    }
  }
  function drawEnd(t) {
    const out = 1 - seg(t, T.out - 0.05, T.out + 0.22); if (t < T.lines - 0.05 || out < 0.01) return;
    const item = (i, fn) => { const t0 = T.lines + i * 0.08, a = seg(t, t0, t0 + 0.32) * out; if (a < 0.01) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, 14 * (1 - seg(t, t0, t0 + 0.32, ease.out))); fn(); ctx.restore(); };
    const LXt = 64 + 62, RXt = 556 + 62;
    item(0, () => { Cards.o2Badge(ctx, 64 + 24, 592, 22, 'an'); txt('mostly obligate', LXt, 610, F.line, P.ivory); txt('anaerobes', LXt, 668, F.line, P.ivory); });
    item(1, () => { Cards.o2Badge(ctx, 556 + 24, 592, 22, 'fac'); txt('more facultatives', RXt, 610, F.line, P.ivory); });
    item(2, () => { miniCard(556 + 24, 674, 38, 50, P.pos, P.neg, true); txt('mostly Gram +', RXt, 692, F.line, P.ivory); });
    item(3, () => { miniCard(64 + 24, 756, 38, 50, P.neg, P.pos); txt('Gram − and +', LXt, 774, F.line, P.ivory); });
    item(4, () => { miniCard(556 + 24, 756, 38, 50, P.yst); txt('sometimes yeast', RXt, 774, F.line, P.ivory); });
    item(5, () => {
      ctx.fillStyle = rgba(P.gold, 0.35); ctx.fillRect(64, 818, 952, 2);
      runs([{ s: 'PERSISTENT:', font: F.term, color: P.gold, ls: 0.6 }, { s: '  survived treatment', font: F.def, color: P.ivory }], 540, 874, 'center');
      runs([{ s: 'SECONDARY:', font: F.term, color: P.gold, ls: 0.6 }, { s: '  got in during or after treatment', font: F.def, color: P.ivory }], 540, 926, 'center');
    });
    item(6, () => {
      rr(ctx, 64, 960, 952, 78, 39); ctx.fillStyle = 'rgba(3,20,17,0.72)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(P.gold, 0.6); ctx.stroke();
      runs([{ s: 'E. faecalis', font: `italic 600 36px ${IN}`, color: P.goldPale }, { s: ':  often found, rarely dominant', font: `600 36px ${IN}`, color: P.goldPale }], 540, 1012, 'center');
      txt('sequencing finds more taxa in both', 540, 1082, `italic 500 30px ${IN}`, P.mint, { align: 'center' });
    });
  }
  function drawFine(t) {
    const a = seg(t, T.resL[0], T.resL[1]) * (1 - seg(t, T.out, T.out + 0.25));
    if (a > 0.01) txt('Siqueira & Rôças, J Oral Microbiol 2009', 556, 1520, F.src, P.mint, { alpha: 0.85 * a });
    txt('@natebrooksendo', 556, 1558, F.handle, P.ivory, { alpha: 0.62 });
  }
  function drawTitle(t) {
    const a = seg(t, T.titleIn[0], T.titleIn[1]) * (1 - seg(t, T.titleOut[0], T.titleOut[1])); if (a < 0.01) return;
    const up = -26 * seg(t, T.titleOut[0], T.titleOut[1], ease.in) + 18 * (1 - seg(t, T.titleIn[0], T.titleIn[1], ease.out));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, up);
    const f = `700 172px ${BC}`;
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    txt('WHO LIVES', 540, 452, f, P.ivory, { align: 'center', ls: 2 });
    ctx.save(); ctx.font = f; ctx.letterSpacing = '2px'; ctx.textAlign = 'center';
    const g = ctx.createLinearGradient(80, 480, 1000, 640), ph = (t * 0.5) % 1.6;
    g.addColorStop(0, P.gold); g.addColorStop(clamp(ph - 0.14), P.gold); g.addColorStop(clamp(ph), '#fffbe6'); g.addColorStop(clamp(ph + 0.14), P.gold); g.addColorStop(1, P.goldDeep);
    ctx.fillStyle = g; ctx.fillText('IN THE CANAL?', 540, 620); ctx.restore();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = rgba(P.gold, 0.6); ctx.fillRect(390, 656, 300, 3);
    ctx.save(); ctx.translate(540, 657.5); ctx.rotate(Math.PI / 4); ctx.fillStyle = P.gold; ctx.fillRect(-8, -8, 16, 16); ctx.restore();
    ctx.restore();
  }

  // ---------------------------------------------------------------- hero card (E. faecalis, drawn live)
  function heroIcon(g) { // art box 556 x 204; lower-right corner left clear for the badge
    const pair = (cx, cy, ang, r = 17) => { const dx = Math.cos(rad(ang)) * r * 0.95, dy = Math.sin(rad(ang)) * r * 0.95; Cards.ovoid(ctx, cx - dx, cy - dy, r, r * 0.86, ang, g); Cards.ovoid(ctx, cx + dx, cy + dy, r, r * 0.86, ang, g); };
    pair(58, 52, 24); pair(150, 40, -32); pair(250, 56, 14); pair(352, 38, 40); pair(452, 52, -18); pair(522, 78, 70, 14);
    pair(52, 142, -20); pair(232, 128, 58); pair(330, 112, -8);
    [[112, 108], [142, 98], [172, 104], [200, 116]].forEach(([a, b]) => Cards.ovoid(ctx, a, b, 16, 14, 12, g));
    [[300, 176], [330, 168], [360, 172]].forEach(([a, b]) => Cards.ovoid(ctx, a, b, 16, 14, -8, g));
    pair(146, 170, 6); pair(420, 132, 30, 15);
  }
  function drawHero(p, alpha, t) {
    if (alpha < 0.01) return;
    const f = cardXf(p), g = P.pos, k = f.s / HS;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(f.x, f.y); ctx.rotate(rad(p.rot)); ctx.scale(k, k); ctx.translate(-HW / 2, -HH / 2);
    Cards.foilBorder(ctx, HW, HH, 42, g);
    rr(ctx, 17, 17, HW - 34, HH - 34, 27); ctx.fillStyle = P.paper; ctx.fill();
    ctx.save(); rr(ctx, 17, 17, HW - 34, HH - 34, 27); ctx.clip();
    const hg = ctx.createLinearGradient(0, 17, 0, 122); hg.addColorStop(0, g.main); hg.addColorStop(1, g.dark); ctx.fillStyle = hg; ctx.fillRect(17, 17, HW - 34, 105);
    ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(17, 17, HW - 34, 8); ctx.restore();
    Cards.obliqueName(ctx, 'Enterococcus faecalis', 42, 94, 64, HW - 84, '#ffffff');
    const ax = 32, ay = 134, aw = HW - 64, ah = 204;
    Cards.artWindow(ctx, ax, ay, aw, ah, 16, g);
    ctx.save(); rr(ctx, ax, ay, aw, ah, 16); ctx.clip(); ctx.translate(ax, ay); heroIcon(g); ctx.restore();
    rr(ctx, ax + 1, ay + 1, aw - 2, ah - 2, 16); ctx.lineWidth = 2; ctx.strokeStyle = rgba(g.dark, 0.35); ctx.stroke();
    Cards.o2Badge(ctx, ax + aw - 56, ay + ah - 52, 38, 'fac');
    // slogan (frame colour and badge already say Gram +, facultative: no type line)
    const s1 = seg(t, T.hero[1] - 0.25, T.hero[1] + 0.1), s2 = seg(t, T.hero[1] + 0.05, T.hero[1] + 0.4);
    txt('Often found.', 40, 434 + 10 * (1 - ease.out(s1)), `700 82px ${BC}`, P.ink, { alpha: s1 });
    txt('Rarely dominant.', 40, 512 + 10 * (1 - ease.out(s2)), `700 82px ${BC}`, g.dark, { alpha: s2 });
    // 29 root-filled teeth with apical periodontitis: 11 positive, 1 dominated by E. faecalis
    const tp = T.hero[1] + 0.25, la = seg(t, tp, tp + 0.3);
    for (let i = 0; i < 29; i++) {
      const row = i < 15 ? 0 : 1, col = row ? i - 15 : i, px = 44 + col * 35.6, py = 538 + row * 43;
      const found = i < 11 ? seg(t, tp + i * 0.03, tp + i * 0.03 + 0.2, ease.out) : 0;
      const dom = i === 0 ? seg(t, tp + 0.5, tp + 0.8, ease.outBack) : 0;
      ctx.save(); ctx.globalAlpha *= s2; ctx.translate(px + 14, py + 17); const sc = 1 + 0.14 * found * (1 - found) * 4 + 0.16 * dom; ctx.scale(sc, sc); ctx.translate(-14, -17);
      Cards.toothPath(ctx, 0, 0, 28, 34);
      ctx.fillStyle = dom > 0.5 ? P.gold : found > 0 ? rgba(g.main, 0.25 + 0.75 * found) : '#efe9dc'; ctx.fill();
      ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.strokeStyle = dom > 0.5 ? P.yst.dark : found > 0.5 ? g.deep : 'rgba(74,72,96,0.5)'; ctx.stroke();
      ctx.restore();
    }
    txt('qPCR, 29 treated teeth:', 44, 668, `600 36px ${IN}`, P.inkSoft, { alpha: la });
    ctx.save(); ctx.globalAlpha *= la;
    const w1 = txt('found in 11, ', 44, 716, `700 40px ${IN}`, g.dark);
    txt('dominant in 1', 44 + w1, 716, `700 40px ${IN}`, P.yst.dark); ctx.restore();
    txt('Rôças & Siqueira, J Clin Microbiol 2012', 44, 764, `500 22px ${IN}`, P.inkSoft, { alpha: 0.9 * la });
    ctx.translate(HW / 2, HH / 2); shimmerBand(t, 0.2, 300, 400, HW, HH, 42, 17, 27, 0.6);
    ctx.restore();
  }

  // ---------------------------------------------------------------- frame
  function render(t) {
    t = clamp(t, 0, DUR);
    ctx.globalAlpha = 1; ctx.drawImage(Cards.felt, 0, 0);
    drawDivider(t); drawSlots(t);
    drawDeck('L', t); drawDeck('R', t);
    drawHeaders(t); drawPlaque('L', t); drawPlaque('R', t); drawKey(t);
    const list = cards.map((c) => ({ c, p: c.tr.at(t) })).sort((a, b) => a.p.z - b.p.z);
    for (const o of list) if (o.p.z < 800) drawCard(o.c, o.p, t);
    drawBar(t); drawTags(t); drawEnd(t); drawFine(t);
    const hu = seg(t, T.hero[0], T.hero[0] + 0.6, ease.smooth) * (1 - seg(t, T.heroBack[0], T.heroBack[0] + 0.5, ease.smooth));
    if (hu > 0.005) { ctx.fillStyle = `rgba(3,14,12,${0.86 * hu})`; ctx.fillRect(0, 0, W, H); }
    // The small sprite and the live hero layout swap while the card is still small (first / last 0.1 s of the move),
    // so the two layouts are never seen double-exposed at full size.
    const ha = seg(t, T.hero[0], T.hero[0] + 0.1) * (1 - seg(t, T.heroBack[1] - 0.1, T.heroBack[1]));
    for (const o of list) if (o.p.z >= 800) {
      if (ha < 0.999) drawCard(o.c, o.p, t);
      drawHero(o.p, ha, t);
    }
    drawTitle(t);
  }

  window.REEL = {
    title: 'Primary vs persistent infection: who lives in the canal',
    duration: DUR,
    poster: 21.6,
    canvas,
    fonts: [`700 172px ${BC}`, `600 52px ${BC}`, `500 32px ${BC}`, `500 30px ${IN}`, `600 32px ${IN}`, `700 30px ${IN}`, `800 22px ${IN}`, `italic 500 22px ${IN}`, `italic 600 36px ${IN}`],
    setup() { Cards.build(); },
    render,
  };
  Kit.boot(REEL);
})();
