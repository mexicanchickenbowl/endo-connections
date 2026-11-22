/*
 * 16 · Why local anesthetic struggles in a "hot" tooth
 * Style: KINETIC TYPOGRAPHY — Bebas Neue + Inter, black / warm yellow / white + one red accent.
 * Everything is drawn on one 2D canvas; render(t) is a pure function of t.
 */
(() => {
  const { canvas, ctx } = Kit.createCanvas();
  const { W, H, clamp, lerp, seg, ease: E, hash } = Kit;

  // ---------------------------------------------------------------- palette & type
  const COL = {
    bg: '#0B0B0A', ink: '#F4F0E6', yel: '#FFCC1F', red: '#FF3B2F', grey: '#958F82',
    mute: '#5E5A51', black: '#0B0B0A', dark: '#14120C', panel: '#FFCC1F',
  };
  const BB = (s) => `400 ${s}px "Bebas Neue"`;
  const IN = (w, s) => `${w} ${s}px Inter`;

  // ---------------------------------------------------------------- chemistry (toy model)
  const PKA = 7.9;                                         // lidocaine, textbook value (texts 7.7–7.9)
  const fBase = (pH) => 1 / (1 + Math.pow(10, PKA - pH));  // Henderson–Hasselbalch, fraction un-ionised

  // ---------------------------------------------------------------- timeline (s)
  const T = {
    hot: 0.04, tooth: 0.16, numb: 0.36,
    w1: [2.4, 2.9],                       // yellow wipe (up)
    lido: 2.72, pka: 2.85, pkaLbl: 3.0, ss: 3.3, half: 3.45,
    regroup: [5.2, 5.8],
    labels: 5.7, baseHead: 5.8, mem: 6.5, baseHeadOut: 9.35,
    slider: 9.27, counter: 9.77, ph1: [10.02, 10.52], ph2: [12.02, 13.12],
    sixx: 13.02, s3out: 16.0,
    w2: [16.0, 16.45],                    // yellow panel from right
    but: 16.45, butUp: [16.85, 17.2], far: 17.15, farCap: 17.35, farOut: 20.6,
    kick: 20.95, list: [21.05, 21.5, 21.95],
    w3: [25.5, 25.95],                    // black panel from bottom
    take: 25.7, plan: 25.9, chips: 26.1, lip: 26.35,
  };
  const DUR = 30.0;

  function pHat(t) {
    if (t < T.ph1[0]) return 7.9;
    if (t < T.ph1[1]) return lerp(7.9, 7.4, E.inOut(seg(t, T.ph1[0], T.ph1[1])));
    if (t < T.ph2[0]) return 7.4;
    return lerp(7.4, 6.5, E.inOut(seg(t, T.ph2[0], T.ph2[1])));
  }
  const pHmoving = (t) => (t > T.ph1[0] && t < T.ph1[1]) || (t > T.ph2[0] && t < T.ph2[1]);

  // ---------------------------------------------------------------- tiny helpers
  function font(f, ls = 0) { ctx.font = f; ctx.letterSpacing = ls + 'px'; }
  function mw(text, f, ls = 0) { font(f, ls); return ctx.measureText(text).width - (ls ? ls : 0); }
  function fill(text, x, y, f, color, align = 'left', ls = 0) {
    font(f, ls); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w = mw(text, f, ls);
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillText(text, x0, y);
    return w;
  }
  function fitSize(text, fontFn, maxW, maxS, ls = 0) {
    const w = mw(text, fontFn(maxS), ls);
    return w <= maxW ? maxS : Math.floor(maxS * maxW / w);
  }
  // rich runs: [{t, f, c, dy, ls, gap, w, draw}]
  function runsW(parts) { let w = 0; for (const p of parts) w += (p.w != null ? p.w : mw(p.t, p.f, p.ls || 0)) + (p.gap || 0); return w; }
  function runs(parts, x, y, align = 'left') {
    const w = runsW(parts);
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (const p of parts) {
      const pw = p.w != null ? p.w : mw(p.t, p.f, p.ls || 0);
      if (p.draw) p.draw(cx, y); else fill(p.t, cx, y + (p.dy || 0), p.f, p.c, 'left', p.ls || 0);
      cx += pw + (p.gap || 0);
    }
    return w;
  }
  const sup = (t, size, c, w = 800) => ({ t, f: IN(w, Math.round(size * 0.62)), c, dy: -size * 0.36 });
  const sub = (t, size, c, w = 800, gap = 0) => ({ t, f: IN(w, Math.round(size * 0.62)), c, dy: size * 0.2, gap });
  // "pKₐ" with a real (drawn) subscript a, in Inter
  const pKa = (size, c, w = 800, gap = 0) => [{ t: 'pK', f: IN(w, size), c }, sub('a', size, c, w, gap)];
  // "Naᵥ" (Na with subscript V)
  const NaV = (size, c, w = 500) => [{ t: 'Na', f: IN(w, size), c }, sub('V', size, c, w)];

  function withAlpha(a, fn) { if (a <= 0.001) return; ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }

  function arrowR(x, y, len, th, color) {
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = th; ctx.lineCap = 'butt';
    const hl = th * 3.0;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len - hl + 1, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + len, y); ctx.lineTo(x + len - hl, y - th * 2.1); ctx.lineTo(x + len - hl, y + th * 2.1); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function arrowUp(cx, yb, len, th, color) {
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = th;
    const hl = th * 2.6;
    ctx.beginPath(); ctx.moveTo(cx, yb); ctx.lineTo(cx, yb - len + hl - 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, yb - len); ctx.lineTo(cx - th * 2, yb - len + hl); ctx.lineTo(cx + th * 2, yb - len + hl); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function neq(cx, cy, w, th, color) {
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.fillRect(cx - w / 2, cy - th * 1.6, w, th); ctx.fillRect(cx - w / 2, cy + th * 0.6, w, th);
    ctx.lineWidth = th * 0.9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - w * 0.22, cy + w * 0.42); ctx.lineTo(cx + w * 0.22, cy - w * 0.42); ctx.stroke();
    ctx.restore();
  }
  function tick(cx, cy, s, color, th = 5) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = th; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - s * 0.5, cy); ctx.lineTo(cx - s * 0.12, cy + s * 0.38); ctx.lineTo(cx + s * 0.55, cy - s * 0.4); ctx.stroke(); ctx.restore();
  }
  function cross(cx, cy, s, color, th = 5) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = th; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - s / 2, cy - s / 2); ctx.lineTo(cx + s / 2, cy + s / 2); ctx.moveTo(cx + s / 2, cy - s / 2); ctx.lineTo(cx - s / 2, cy + s / 2); ctx.stroke(); ctx.restore();
  }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // kinetic line: words rise out of a mask (and leave upward). words: [{t, c, f?, hl?}]
  function kLine(words, o, t) {
    const size = o.size, fontFn = o.font || BB, ls = o.ls || 0;
    const space = o.space != null ? o.space : mw(' ', fontFn(size)) * 1.0;
    const widths = words.map((w) => mw(w.t, (w.f || fontFn)(size), ls));
    const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    let x = o.align === 'center' ? o.x - total / 2 : o.align === 'right' ? o.x - total : o.x;
    const top = o.y - size * (o.ct || 0.86), bot = o.y + size * (o.cb || 0.16);
    const st = o.st != null ? o.st : 0.06, dur = o.dur || 0.5;
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, bot - top); ctx.clip();
    words.forEach((w, i) => {
      const a = (o.tin != null ? o.tin : -9) + i * st;
      const pin = E.outQuint(seg(t, a, a + dur));
      const b = (o.tout != null ? o.tout : 1e9) + i * st * 0.5;
      const pout = E.in(seg(t, b, b + 0.32));
      const dy = (1 - pin) * size * 1.05 - pout * size * 1.05;
      if (pin > 0 && pout < 1) {
        if (w.hl) { // highlight bar sweeps in first
          const hb = E.out(seg(t, a - 0.12, a + 0.22));
          ctx.fillStyle = w.hl; ctx.fillRect(x - size * 0.06, o.y - size * 0.76 + dy, (widths[i] + size * 0.12) * hb, size * 0.86);
        }
        font((w.f || fontFn)(size), ls); ctx.fillStyle = w.c; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(w.t, x, o.y + dy + (w.dy || 0));
      }
      x += widths[i] + space;
    });
    ctx.restore();
    return total;
  }

  // slam: scale from big to 1 with a tiny undershoot + ghost trails
  function slamScale(p, from) {
    if (p <= 0) return from; if (p >= 1) return 1;
    return p < 0.5 ? lerp(from, 0.965, E.out(p / 0.5)) : lerp(0.965, 1, E.smooth((p - 0.5) / 0.5));
  }
  function slam(t, t0, from, cx, cy, fn, dur = 0.34) {
    if (t < t0) return;
    const p = seg(t, t0, t0 + dur), s = slamScale(p, from), a = clamp(p * 4);
    if (p < 0.75) for (let k = 3; k >= 1; k--) {
      ctx.save(); ctx.globalAlpha *= a * 0.13 * (1 - p / 0.75);
      const sk = s * (1 + 0.07 * k * (1 - p));
      ctx.translate(cx, cy); ctx.scale(sk, sk); ctx.translate(-cx, -cy); fn(); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); fn(); ctx.restore();
  }

  const SHAKES = [[T.hot, 8], [T.tooth, 6], [T.pka, 12], [T.but, 11], [T.plan, 8]];
  function shake(t) {
    let x = 0, y = 0;
    for (const [t0, a] of SHAKES) {
      const d = t - t0 - 0.1; if (d < 0 || d > 0.7) continue;
      const k = a * Math.exp(-d * 9);
      x += k * Math.sin(d * 63); y += k * 0.7 * Math.cos(d * 51);
    }
    return { x, y };
  }
  function shaken(t, fn) { const s = shake(t); ctx.save(); ctx.translate(s.x, s.y); fn(); ctx.restore(); }

  // ---------------------------------------------------------------- molecules
  // u = 1 → base (neutral, yellow disc); u = 0 → charged cation (white disc with black +)
  function mol(x, y, r, u, a = 1) {
    if (a <= 0.001) return;
    ctx.save(); ctx.globalAlpha *= a;
    const c = Kit.mix(COL.ink, COL.yel, u);
    ctx.fillStyle = Kit.rgba(c); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (u < 0.999) {
      ctx.globalAlpha *= (1 - u); ctx.fillStyle = COL.black;
      const L = r * 1.08, th = Math.max(2, r * 0.26);
      ctx.fillRect(x - L / 2, y - th / 2, L, th); ctx.fillRect(x - th / 2, y - L / 2, th, L);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- see-saw (Henderson–Hasselbalch balance)
  const SS = { L: 300, hang: 162, r: 15, N: 20, tmax: 13 * Math.PI / 180 };
  // pyramid slots; each row fills from the centre outward, so a lone disc sits centred in its pan
  const SLOTS = (() => {
    const rows = [7, 5, 4, 3, 1], out = [], dx = SS.r * 2 + 3, dy = dx * 0.87;
    rows.forEach((n, k) => {
      const js = [...Array(n).keys()].sort((a, b) => Math.abs(a - (n - 1) / 2) - Math.abs(b - (n - 1) / 2) || a - b);
      for (const j of js) out.push([(j - (n - 1) / 2) * dx, -SS.r - 3 - k * dy]);
    });
    return out;
  })();

  function seesaw(cx, cy, cBase, build) {
    const N = SS.N, b = []; let nb = 0;
    for (let i = 0; i < N; i++) { const v = E.smooth(clamp((cBase - i - 0.5) / 0.45 + 0.5)); b.push(v); nb += v; }
    const th = -SS.tmax * (N - 2 * nb) / N;
    const bl = E.outQuint(seg(build, 0, 0.45));
    const L = SS.L * bl, c = Math.cos(th), s = Math.sin(th);
    const lx = cx - L * c, ly = cy - L * s, rx = cx + L * c, ry = cy + L * s;
    const pa = seg(build, 0.25, 0.55);
    const pdrop = (1 - E.outQuint(seg(build, 0.25, 0.7))) * -40;
    const pl = [lx, ly + SS.hang + pdrop], pr = [rx, ry + SS.hang + pdrop];

    // fulcrum
    withAlpha(seg(build, 0.0, 0.3), () => {
      ctx.fillStyle = COL.ink;
      ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx - 44, cy + 92); ctx.lineTo(cx + 44, cy + 92); ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - 86, cy + 92, 172, 7);
    });
    // strings + pans
    withAlpha(pa, () => {
      for (const [px, py, ex, ey] of [[pl[0], pl[1], lx, ly], [pr[0], pr[1], rx, ry]]) {
        ctx.strokeStyle = Kit.rgba(COL.ink, 0.55); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(px - 124, py - 10); ctx.moveTo(ex, ey); ctx.lineTo(px + 124, py - 10); ctx.stroke();
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px - 130, py - 12); ctx.quadraticCurveTo(px, py + 26, px + 130, py - 12); ctx.stroke();
      }
    });
    // beam
    if (L > 1) {
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
      withAlpha(pa, () => { for (const [x, y] of [[lx, ly], [rx, ry]]) { ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); } });
      ctx.fillStyle = COL.yel; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.fill();
      ctx.fillStyle = COL.black; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
    }
    // molecules
    for (let i = 0; i < N; i++) {
      const pop = E.outBack(seg(build, 0.45 + i * 0.018, 0.45 + i * 0.018 + 0.22));
      if (pop <= 0) continue;
      const sb = SLOTS[i], sc = SLOTS[N - 1 - i];
      const xb = pr[0] + sb[0], yb = pr[1] + sb[1] + 2, xc = pl[0] + sc[0], yc = pl[1] + sc[1] + 2;
      const u = b[i];
      const x = lerp(xc, xb, u), y = lerp(yc, yb, u) - 170 * 4 * u * (1 - u);
      mol(x, y, SS.r * pop, u);
    }
    return { pl, pr, th };
  }

  // ---------------------------------------------------------------- membrane strip
  const MEM = { y: 1388, chx: 862, y0: 1284 };
  const PARTS = [];
  for (let k = 0; k < 400; k++) { const s = T.mem - 1.0 + k * 0.15; if (s > T.s3out + 0.4) break; PARTS.push({ k, s, x: 250 + hash(k, 3) * 440, r: hash(k, 9) }); }

  function membrane(t, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const M = MEM.y;
    // labels (30 px)
    fill('OUTSIDE', 64, 1316, IN(700, 30), COL.grey, 'left', 3);
    fill('INSIDE THE AXON', 64, 1472, IN(700, 30), COL.grey, 'left', 3);
    // particles (behind lipids)
    for (const p of PARTS) {
      const age = t - p.s; if (age < 0 || age > 2.0) continue;
      const isBase = p.r < fBase(pHat(p.s));
      const xd = p.x + 9 * Math.sin(age * 2.2 + p.k);
      const fin = seg(age, 0, 0.18);
      if (isBase) {
        let y, u = 1, al = fin;
        if (age < 0.7) y = lerp(MEM.y0, M - 32, E.inOut(age / 0.7));
        else if (age < 1.05) y = lerp(M - 32, M + 30, E.inOut((age - 0.7) / 0.35));
        else { y = lerp(M + 30, M + 44, E.out(seg(age, 1.05, 1.9))); u = 1 - E.smooth(seg(age, 1.1, 1.45)); al *= 1 - seg(age, 1.45, 1.9); }
        mol(xd, y, 15, u, al);
      } else {
        let y, al = fin;
        if (age < 0.7) y = lerp(MEM.y0, M - 37, E.inOut(age / 0.7));
        else { y = lerp(M - 37, M - 92, E.out(seg(age, 0.7, 1.4))); al *= 1 - seg(age, 0.85, 1.35); }
        mol(xd, y, 15, 0, al);
        // red bounce flash on the lipid heads
        const bm = seg(age, 0.64, 0.72) * (1 - seg(age, 0.72, 1.05));
        if (bm > 0) withAlpha(bm, () => {
          ctx.strokeStyle = COL.red; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(xd, M - 6, 30, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
        });
      }
    }
    // lipid bilayer
    const gap0 = MEM.chx - 64, gap1 = MEM.chx + 64;
    for (let x = 30; x < 1060; x += 17) {
      if (x > gap0 && x < gap1) continue;
      ctx.strokeStyle = Kit.rgba(COL.ink, 0.28); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 2, M - 13); ctx.lineTo(x - 2, M - 2); ctx.moveTo(x + 2, M - 13); ctx.lineTo(x + 2, M - 2);
      ctx.moveTo(x - 2, M + 13); ctx.lineTo(x - 2, M + 2); ctx.moveTo(x + 2, M + 13); ctx.lineTo(x + 2, M + 2); ctx.stroke();
      ctx.fillStyle = Kit.rgba(COL.ink, 0.62);
      ctx.beginPath(); ctx.arc(x, M - 17, 6, 0, 7); ctx.arc(x, M + 17, 6, 0, 7); ctx.fill();
    }
    // Na+ channel (two subunits, 44 × 96)
    const cx = MEM.chx;
    ctx.fillStyle = '#34312A'; ctx.strokeStyle = Kit.rgba(COL.ink, 0.85); ctx.lineWidth = 3;
    rrect(cx - 58, M - 48, 44, 96, 16); ctx.fill(); ctx.stroke();
    rrect(cx + 14, M - 48, 44, 96, 16); ctx.fill(); ctx.stroke();
    // plug (cation inside the pore): occupancy tracks the base fraction (toy) but never drops below 0.45 —
    // a ~6× smaller base fraction means a weaker / slower block, not no block.
    const occ = clamp(fBase(pHat(t)) / 0.24);
    mol(cx, M + 8, 14, 0, 0.45 + 0.55 * occ);
    runs([{ t: 'Na', f: IN(700, 30), c: COL.grey, ls: 2 }, sup('+', 30, COL.grey, 700), { t: ' CHANNEL', f: IN(700, 30), c: COL.grey, ls: 3 }], 960, 1324, 'right');
    const sw = seg(occ, 0.42, 0.58);     // cross-fade below ~pH 7.0
    withAlpha(sw, () => fill('BLOCKED', 960, 1472, IN(800, 30), COL.yel, 'right', 3));
    withAlpha(1 - sw, () => fill('WEAKER / SLOWER BLOCK', 960, 1472, IN(800, 30), COL.red, 'right', 2));
    ctx.restore();
  }

  // ---------------------------------------------------------------- pH slider
  const SL = { x0: 124, x1: 956, y: 480, lo: 6.0, hi: 8.0 };
  const sx = (pH) => lerp(SL.x0, SL.x1, (pH - SL.lo) / (SL.hi - SL.lo));
  function slider(t, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const dr = E.outQuint(seg(t, T.slider, T.slider + 0.7));
    const y = SL.y;
    // acidic band (abscess pus range 6.0–7.3) + the clinical context it models
    const ba = seg(t, T.ph2[0] - 0.3, T.ph2[0] + 0.25);
    if (ba > 0) {
      const xb1 = lerp(sx(6.0), sx(7.3), E.out(ba));
      ctx.fillStyle = Kit.rgba(COL.red, 0.9); ctx.fillRect(sx(6.0), y - 9, xb1 - sx(6.0), 18);
      withAlpha(ba, () => runs([{ t: 'ABSCESS PUS ', f: IN(800, 30), c: COL.red, ls: 1 }, { t: 'pH 6.0–7.3', f: IN(600, 30), c: COL.red }], sx(6.0), 556));
      const ca = E.outQuint(seg(t, T.ph2[0] - 0.15, T.ph2[0] + 0.35));
      withAlpha(ca, () => runs([
        { w: 44, draw: (x, yy) => arrowR(x, yy - 10, 32, 4, COL.ink) },
        { t: 'if you inject ', f: IN(500, 32), c: COL.ink },
        { t: 'INTO', f: IN(800, 32), c: COL.ink },
        { t: ' infected tissue', f: IN(500, 32), c: COL.ink },
      ], sx(6.0), 604 + 12 * (1 - ca)));
    }
    // track
    ctx.fillStyle = Kit.rgba(COL.ink, 0.9); ctx.fillRect(SL.x0, y - 2, (SL.x1 - SL.x0) * dr, 4);
    // ticks
    for (let v = 6.0; v <= 8.001; v += 0.5) {
      const x = sx(v); if (x > SL.x0 + (SL.x1 - SL.x0) * dr + 1) continue;
      ctx.fillStyle = COL.ink; ctx.fillRect(x - 1.5, y - 14, 3, 28);
      fill(v.toFixed(1), x, y + 46, IN(600, 24), COL.grey, 'center');
    }
    for (let v = 6.1; v < 8.0; v += 0.1) { const x = sx(v); if (Math.abs((v * 2) % 1) < 0.01 || x > SL.x0 + (SL.x1 - SL.x0) * dr) continue; ctx.fillStyle = Kit.rgba(COL.ink, 0.45); ctx.fillRect(x - 1, y - 7, 2, 14); }
    // markers
    const pH = pHat(t);
    withAlpha(seg(t, T.ph1[1] - 0.15, T.ph1[1] + 0.25), () => {
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(sx(7.4), y + 14); ctx.lineTo(sx(7.4) - 8, y + 26); ctx.lineTo(sx(7.4) + 8, y + 26); ctx.closePath(); ctx.fill();
      fill('HEALTHY TISSUE', sx(7.4) + 28, 556, IN(800, 30), COL.ink, 'center', 1);
    });
    // knob
    const ka = E.outBack(seg(t, T.slider + 0.25, T.slider + 0.6));
    if (ka > 0) {
      const kx = sx(pH);
      ctx.fillStyle = COL.yel; ctx.beginPath(); ctx.arc(kx, y, 21 * ka, 0, 7); ctx.fill();
      ctx.fillStyle = COL.black; ctx.beginPath(); ctx.arc(kx, y, 8 * ka, 0, 7); ctx.fill();
      // value label: 2 decimals while the knob moves (so a paused frame matches the live %), 1 at rest
      const val = pHmoving(t) ? pH.toFixed(2) : pH.toFixed(1);
      const lab = [{ t: 'pH ', f: IN(800, 34), c: COL.ink }, { t: val, f: BB(70), c: pH < 7.3 ? COL.red : COL.yel }];
      const eq = 1 - seg(t, T.ph1[0], T.ph1[0] + 0.25);
      if (eq > 0) { lab.push({ t: '  = pK', f: IN(800, 30), c: Kit.rgba(COL.grey, eq) }); lab.push(sub('a', 30, Kit.rgba(COL.grey, eq))); }
      const lw = runsW([lab[0], { t: '0.00', f: BB(70) }, ...lab.slice(2)]);
      const lx = clamp(kx - lw / 2, 64, 1016 - lw);
      withAlpha(ka, () => runs(lab, lx, y - 34));
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- scenes
  let HOT = null;   // pre-rendered "HOT" + glow
  const HOOK = {};

  function setupHook() {
    HOOK.size = Math.min(fitSize('TOOTH', BB, 890, 470), 470);
    HOOK.yHot = 880; HOOK.yTooth = 1225;
    HOOK.numbSize = fitSize('WON’T GO NUMB?', BB, 884, 240);
    HOOK.yNumb = HOOK.yTooth + 28 + HOOK.numbSize * 0.72;
    const s = HOOK.size, wHot = mw('HOT', BB(s));
    const pad = 90;
    const c = document.createElement('canvas'); c.width = Math.ceil(wHot + pad * 2); c.height = Math.ceil(s * 0.86 + pad * 2);
    const g = c.getContext('2d'); g.font = BB(s); g.textBaseline = 'alphabetic'; g.fillStyle = COL.red; g.fillText('HOT', pad, pad + s * 0.72);
    const gl = document.createElement('canvas'); gl.width = c.width; gl.height = c.height;
    const gg = gl.getContext('2d'); gg.filter = 'blur(34px)'; gg.drawImage(c, 0, 0);
    HOT = { c, gl, pad, base: pad + s * 0.72, w: wHot };
  }

  // heat haze lives only in the blurred glow; the letterforms themselves stay crisp
  function drawHot(t) {
    const x = 64 - HOT.pad, y = HOOK.yHot - HOT.base;
    withAlpha(0.55 + 0.12 * Math.sin(t * 5.5), () => {
      const amp = 7;
      for (let yy = 0; yy < HOT.gl.height; yy += 4) {
        const off = amp * Math.sin(yy * 0.045 - t * 8.5) * (0.6 + 0.4 * Math.sin(yy * 0.011 + t * 2));
        ctx.drawImage(HOT.gl, 0, yy, HOT.gl.width, 4, x + off, y + yy, HOT.gl.width, 4);
      }
    });
    ctx.drawImage(HOT.c, x, y);
  }

  function scene1(t) {
    if (t > (T.w1[0] + T.w1[1]) / 2) return;
    const push = 1 + 0.03 * E.inOut(seg(t, 0.5, T.w1[1]));
    ctx.save(); ctx.translate(540, 960); ctx.scale(push, push); ctx.translate(-540, -960);
    const s = HOOK.size;
    slam(t, T.hot, 1.8, 64 + HOT.w / 2, HOOK.yHot - s * 0.35, () => drawHot(t));
    slam(t, T.tooth, 1.6, 540, HOOK.yTooth - s * 0.35, () => fill('TOOTH', 64, HOOK.yTooth, BB(s), COL.ink));
    kLine([{ t: 'WON’T', c: COL.ink }, { t: 'GO', c: COL.ink }, { t: 'NUMB?', c: COL.yel }],
      { x: 64, y: HOOK.yNumb, size: HOOK.numbSize, tin: T.numb, st: 0.08 }, t);
    ctx.restore();
  }

  // pKa hero group (S2) — drawn around anchor (540, 1000)
  function pkaGroup(t) {
    kLine([{ t: 'LIDOCAINE', c: COL.ink }], { x: 540, y: 562, size: 100, ls: 14, align: 'center', tin: T.lido, dur: 0.55 }, t);
    const lbl = pKa(150, COL.ink, 800, 34);
    const w1 = runsW(lbl), w2 = mw('7.9', BB(540)), w = w1 + w2, x0 = 540 - w / 2;
    // "pKₐ" slides in from the left
    const pp = E.outQuint(seg(t, T.pkaLbl, T.pkaLbl + 0.5));
    withAlpha(pp, () => runs(lbl, x0 - 60 * (1 - pp), 1000));
    slam(t, T.pka, 2.1, x0 + w1 + w2 / 2, 820, () => fill('7.9', x0 + w1, 1000, BB(540), COL.yel), 0.36);
  }

  function halfLine(t) {
    const a = E.outQuint(seg(t, T.half, T.half + 0.5)) * (1 - E.in(seg(t, T.regroup[0] - 0.1, T.regroup[0] + 0.2)));
    if (a <= 0) return;
    withAlpha(a, () => {
      const parts = [
        { t: 'pH = pK', f: IN(800, 52), c: COL.ink }, sub('a', 52, COL.ink, 800, 26),
        { w: 78, draw: (x, y) => arrowR(x, y - 18, 74, 6, COL.ink), gap: 26 },
        { t: '50 : 50', f: BB(84), c: COL.yel },
      ];
      runs(parts, 540, 1112 + 20 * (1 - a), 'center');
    });
  }

  function header(t, a) {
    if (a <= 0) return;
    withAlpha(a, () => {
      runs([{ t: 'LIDOCAINE', f: BB(54), c: COL.ink, ls: 4, gap: 22 }, ...pKa(34, COL.grey, 800, 12), { t: '7.9', f: BB(54), c: COL.yel }], 64, 362);
      // right tag
      const tag = 'ION TRAPPING · TOY MODEL';
      const tw = mw(tag, IN(800, 22), 2);
      ctx.strokeStyle = Kit.rgba(COL.ink, 0.6); ctx.lineWidth = 2; rrect(1016 - tw - 28, 324, tw + 28, 48, 6); ctx.stroke();
      fill(tag, 1016 - 14 - tw, 356, IN(800, 22), COL.ink, 'left', 2);
    });
  }

  function panLabels(t, cx, cy, m) {
    const ly = cy + lerp(250, 298, m);
    const a2 = seg(t, T.ss + 0.5, T.ss + 0.9);
    const a3 = seg(t, T.labels, T.labels + 0.45);
    const a = Math.max(a2, a3);
    if (a <= 0) return;
    withAlpha(a, () => {
      runs([{ t: 'CHARGED ', f: BB(60), c: COL.ink, ls: 1 }, { t: 'BH', f: IN(800, 34), c: COL.grey }, sup('+', 34, COL.grey)], cx - SS.L, ly, 'center');
      runs([{ t: 'BASE ', f: BB(60), c: COL.yel, ls: 1 }, { t: 'B', f: IN(800, 34), c: COL.grey }], cx + SS.L, ly, 'center');
    });
    withAlpha(a3, () => {
      const dy = 14 * (1 - E.out(a3));
      const l1 = [{ w: 34, draw: (x, y) => cross(x + 12, y - 11, 18, COL.red, 5) }, { t: 'barely crosses membranes', f: IN(500, 30), c: COL.grey }];
      const l2 = [{ w: 38, draw: (x, y) => tick(x + 14, y - 11, 24, COL.yel, 5) }, { t: 'crosses membranes', f: IN(500, 30), c: COL.grey }];
      const w1 = runsW(l1);
      runs(l1, Math.max(64, cx - SS.L - w1 / 2), ly + 42 + dy);
      runs(l2, cx + SS.L, ly + 42 + dy, 'center');
    });
  }

  function counter(t) {
    const a = E.outQuint(seg(t, T.counter, T.counter + 0.45));
    if (a <= 0 || t > T.w2[1]) return;
    const f = fBase(pHat(t));
    const pct = Math.round(f * 100);
    const u = clamp((0.24 - f) / (0.24 - 0.06));
    const col = Kit.rgba(Kit.mix(COL.yel, COL.red, u));
    const base = 1255, size = 280;
    // number (right-aligned at x=500), rises out of a mask; one pulse when the healthy-tissue 24% lands
    ctx.save(); ctx.beginPath(); ctx.rect(0, base - size * 0.78, W, size * 0.9); ctx.clip();
    const dy = (1 - a) * size;
    const pu = 1 + 0.06 * Math.sin(Math.PI * seg(t, T.ph1[1], T.ph1[1] + 0.3));
    ctx.translate(500, base - size * 0.35); ctx.scale(pu, pu); ctx.translate(-500, -(base - size * 0.35));
    fill(pct + '%', 500, base + dy, BB(size), col, 'right');
    ctx.restore();
    // right block
    const bx = 540;
    kLine([{ t: 'OF THE DRUG IS', c: COL.ink }], { x: bx, y: base - 112, size: 64, tin: T.counter + 0.1, tout: T.sixx - 0.35, st: 0.0 }, t);
    kLine([{ t: 'IN BASE FORM', c: COL.yel }], { x: bx, y: base - 44, size: 64, tin: T.counter + 0.18, tout: T.sixx - 0.3, st: 0.0 }, t);
    // payoff block
    kLine([{ t: '~5–6× LESS BASE', c: COL.red }], { x: bx, y: base - 128, size: 64, tin: T.sixx, tout: T.s3out, st: 0 }, t);
    kLine([{ t: 'IN ACIDIC TISSUE', c: COL.ink }], { x: bx, y: base - 60, size: 64, tin: T.sixx + 0.12, tout: T.s3out, st: 0 }, t);
    withAlpha(seg(t, T.sixx + 0.3, T.sixx + 0.6) * (1 - seg(t, T.s3out - 0.1, T.s3out + 0.15)), () => fill('vs. 24% at pH 7.4', bx, base - 8, IN(500, 30), COL.grey));
  }

  function baseHeadline(t) {
    const size = 106, y1 = 1140, y2 = 1252;
    const sz2 = fitSize('CROSSES THE MEMBRANE', BB, 952, size);
    kLine([{ t: 'ONLY', c: COL.ink }, { t: 'THE', c: COL.ink }, { t: 'BASE FORM', c: COL.black, hl: COL.yel }],
      { x: 64, y: y1, size: Math.min(size, sz2), tin: T.baseHead, tout: T.baseHeadOut, st: 0.07 }, t);
    kLine([{ t: 'CROSSES', c: COL.ink }, { t: 'THE', c: COL.ink }, { t: 'MEMBRANE', c: COL.ink }],
      { x: 64, y: y2, size: Math.min(size, sz2), tin: T.baseHead + 0.25, tout: T.baseHeadOut + 0.05, st: 0.07 }, t);
  }

  function lab(t) {
    if (t < T.w1[0] + 0.2 || t > T.w2[1]) return;
    const m = E.inOut(seg(t, T.regroup[0], T.regroup[1]));
    // pKa hero → header
    if (m < 1) {
      ctx.save();
      const ax = 540, ay = 1000, tx = lerp(ax, 330, m), ty = lerp(ay, 360, m), sc = lerp(1, 0.12, m);
      ctx.globalAlpha *= 1 - seg(m, 0.15, 0.6);
      ctx.translate(tx, ty); ctx.scale(sc, sc); ctx.translate(-ax, -ay);
      shaken(t, () => pkaGroup(t));
      ctx.restore();
    }
    halfLine(t);
    header(t, seg(m, 0.62, 1));
    // see-saw
    const cy = lerp(1190, 676, m);
    const cBase = SS.N * fBase(pHat(t));
    seesaw(540, cy, cBase, seg(t, T.ss, T.ss + 1.0));
    panLabels(t, 540, cy, m);
    // S3a: the headline enters alone; the membrane follows once it has landed
    baseHeadline(t);
    membrane(t, seg(t, T.mem, T.mem + 0.5));
    // S3b: the slider arrives just before it moves
    slider(t, seg(t, T.slider, T.slider + 0.3));
    counter(t);
  }

  // ---------------------------------------------------------------- S4: the "But…" turn (yellow)
  function scene4(t) {
    if (t < T.w2[1] - 0.02 || t > T.w3[1]) return;
    const K = COL.black;
    // BUT…
    const sz = 430, wB = mw('BUT…', BB(sz));
    const m = E.inOut(seg(t, T.butUp[0], T.butUp[1]));
    const ax = lerp(540 - wB / 2, 64, m), ay = lerp(1060, 520, m), sc = lerp(1, 0.4, m);
    ctx.save(); ctx.translate(ax, ay); ctx.scale(sc, sc);
    slam(t, T.but, 1.9, wB / 2, -sz * 0.35, () => fill('BUT…', 0, 0, BB(sz), K), 0.34);
    const ul = E.out(seg(t, T.but + 0.2, T.but + 0.55));
    ctx.fillStyle = COL.red; ctx.fillRect(0, 34, wB * 0.98 * ul, 26);
    ctx.restore();

    // kicker next to BUT (list phase) — framed as proposed, not proven
    const kx = 64 + wB * 0.4 + 40;
    kLine([{ t: 'OTHER PROPOSED', c: K }], { x: kx, y: 458, size: 60, tin: T.kick, st: 0 }, t);
    kLine([{ t: 'MECHANISMS', c: K }], { x: kx, y: 518, size: 60, tin: T.kick + 0.1, st: 0 }, t);

    // distance ruler (schematic, not to scale)
    const out = seg(t, T.farOut, T.farOut + 0.35);
    const rd = E.inOut(seg(t, T.far + 0.15, T.far + 0.85)) * (1 - E.in(out));
    const ry = 852;
    kLine([{ t: 'IANB', c: K }], { x: 64, y: 802, size: 140, tin: T.far, tout: T.farOut, st: 0 }, t);
    kLine([{ t: 'HOT', c: K }, { t: 'PULP', c: K }], { x: 1016, y: 802, size: 140, align: 'right', tin: T.far + 0.45, tout: T.farOut, st: 0.06 }, t);
    if (rd > 0) {
      const x0 = 74, x1 = 1006, xe = lerp(x0, x1, rd);
      ctx.fillStyle = K; ctx.fillRect(x0, ry - 3, xe - x0, 6);
      for (let x = x0 + 24; x < xe - 10; x += 24) { const big = Math.round((x - x0) / 24) % 5 === 0; ctx.fillRect(x - 1.5, ry - (big ? 20 : 11), 3, big ? 20 : 11); }
      ctx.beginPath(); ctx.arc(x0, ry, 13, 0, 7); ctx.fill();
      if (rd > 0.95) { ctx.fillStyle = COL.red; const pul = 1 + 0.12 * Math.sin(t * 7); ctx.beginPath(); ctx.arc(x1, ry, 17 * pul, 0, 7); ctx.fill(); ctx.strokeStyle = COL.red; ctx.lineWidth = 3; withAlpha(0.5, () => { ctx.beginPath(); ctx.arc(x1, ry, 30 + 8 * ((t * 1.5) % 1), 0, 7); ctx.stroke(); }); }
    }
    const sa = seg(t, T.far + 0.55, T.far + 0.95) * (1 - out);
    withAlpha(sa, () => {
      fill('normal pH here', 64, ry + 62, IN(700, 34), K);
      fill('inflamed · any pH drop is here', 1016, ry + 62, IN(700, 34), K, 'right');
    });
    const capS = fitSize('EXPLAIN IANB FAILURE.', BB, 884, 126);
    kLine([{ t: 'ACIDITY', c: K }, { t: 'ALONE', c: K }, { t: 'CAN’T', c: K }], { x: 64, y: 1150, size: capS, tin: T.farCap, tout: T.farOut, st: 0.06 }, t);
    kLine([{ t: 'EXPLAIN', c: K }, { t: 'IANB', c: K }, { t: 'FAILURE.', c: K, hl: null }], { x: 64, y: 1150 + capS * 1.0, size: capS, tin: T.farCap + 0.2, tout: T.farOut + 0.05, st: 0.06 }, t);

    // list (proposed mechanisms; sublines only where they carry the logic)
    const S = 34, sc2 = Kit.rgba(K, 0.85);
    const items = [
      { n: '01', h: ['TTX-RESISTANT', 'SODIUM CHANNELS'], up: true, top: 650,
        sub: [[...NaV(S, sc2), { t: '1.8 / ', f: IN(500, S), c: sc2 }, ...NaV(S, sc2), { t: '1.9 · less lidocaine-sensitive', f: IN(500, S), c: sc2 }]] },
      { n: '02', h: ['SENSITIZED NERVES'], top: 960,
        sub: [[{ t: 'harder to block ', f: IN(500, S), c: sc2 }, { t: 'at a distance', f: IN(700, S), c: sc2 }, { t: ' (cat)', f: IN(500, S), c: sc2 }]] },
      { n: '03', h: ['NERVE SPROUTING'], top: 1200, sub: [] },
    ];
    items.forEach((it, i) => {
      const t0 = T.list[i];
      const p = E.outQuint(seg(t, t0, t0 + 0.55));
      if (p <= 0) return;
      const dx = 90 * (1 - p);
      withAlpha(clamp(p * 1.6), () => {
        // number: outlined
        font(BB(160)); ctx.lineWidth = 3.5; ctx.strokeStyle = K; ctx.textAlign = 'left';
        const ns = E.outBack(seg(t, t0, t0 + 0.45));
        ctx.save(); ctx.translate(64 + 60, it.top + 128 - 55); ctx.scale(ns, ns); ctx.translate(-(64 + 60), -(it.top + 128 - 55));
        ctx.strokeText(it.n, 64, it.top + 128); ctx.restore();
        let y = it.top + 70;
        it.h.forEach((line, j) => {
          const w = fill(line, 236 + dx, y, BB(86), K);
          if (it.up && j === it.h.length - 1) arrowUp(236 + dx + w + 36, y - 4, 68, 9, COL.red);
          y += 78;
        });
        y += -78 + 54;
        it.sub.forEach((parts) => { runs(parts, 238 + dx * 1.3, y); y += 42; });
      });
    });
  }

  // ---------------------------------------------------------------- S5: takeaway (black)
  function scene5(t) {
    if (t < T.w3[1] - 0.02) return;
    kLine([{ t: 'HOT', c: COL.red }, { t: 'MANDIBULAR', c: COL.ink }, { t: 'MOLAR?', c: COL.ink }], { x: 64, y: 560, size: 92, tin: T.take, st: 0.07 }, t);
    kLine([{ t: 'HAVE', c: COL.ink }, { t: 'A', c: COL.ink }], { x: 64, y: 720, size: 150, tin: T.take + 0.15, st: 0.07 }, t);
    const ps = fitSize('PLAN B.', BB, 952, 400);
    slam(t, T.plan, 1.8, 64 + mw('PLAN B.', BB(ps)) / 2, 1040 - ps * 0.35, () => fill('PLAN B.', 64, 1040, BB(ps), COL.yel), 0.36);
    // supplemental options (numbers in the footer: none is guaranteed)
    const chips = [['Buccal articaine infiltration'], ['Intraosseous', 'PDL', 'Intrapulpal']];
    let k = 0;
    chips.forEach((row, ri) => {
      let x = 64; const y = 1100 + ri * 84;
      row.forEach((label) => {
        const w = mw(label, IN(700, 34)) + 56;
        const p = E.outBack(seg(t, T.chips + k * 0.08, T.chips + k * 0.08 + 0.4));
        if (p > 0) withAlpha(clamp(p), () => {
          ctx.save(); ctx.translate(x + w / 2, y + 32); ctx.scale(p, p); ctx.translate(-(x + w / 2), -(y + 32));
          ctx.strokeStyle = COL.yel; ctx.lineWidth = 3; rrect(x, y, w, 64, 32); ctx.stroke();
          fill(label, x + 28, y + 44, IN(700, 34), COL.ink);
          ctx.restore();
        });
        x += w + 16; k++;
      });
    });
    // lip numb ≠ pulp numb
    const la = E.outQuint(seg(t, T.lip, T.lip + 0.5));
    withAlpha(la, () => {
      const y = 1350 + 16 * (1 - la);
      runs([{ t: 'Lip numb', f: IN(800, 38), c: COL.ink, gap: 18 }, { w: 34, draw: (x, yy) => neq(x + 17, yy - 13, 30, 5, COL.yel), gap: 18 }, { t: 'pulp numb', f: IN(800, 38), c: COL.ink }], 64, y);
      fill('IANB alone: ~25–28% success in hot mandibular molars', 64, y + 48, IN(500, 32), COL.grey);
    });
  }

  // ---------------------------------------------------------------- chrome: masthead, footer, wipes, grain
  const FOOT = [
    [T.pka + 0.4, T.regroup[0] + 0.2, 'Lidocaine pKa ≈ 7.7–7.9 in texts; measured 7.6 (36 °C) to 8.1 (26 °C, saline) (Sanchez, Arthur & Strichartz, Anesth Analg 1987).'],
    [T.regroup[1], T.ph1[0], 'Schematic, not to scale. The cation is thousands of times less lipid-soluble, so it barely crosses (Sanchez 1987). Inside the axon the cation re-forms and blocks the Na⁺ channel (Becker & Reed, Anesth Prog 2006).'],
    [T.ph1[0], T.s3out, 'Toy model: Henderson–Hasselbalch, pKa 7.9 (with pKa 7.7: 33% vs 6%). Abscess pus pH 6.0–7.3 (Nekoofar, IEJ 2009). Inflamed tissue: ~0.5 pH fall, more buffering (rat; Punnia-Moorthy 1987/88); in-vivo role debated.'],
    [T.far + 0.4, T.farOut + 0.2, 'Schematic, not to scale. An IANB deposits solution near the mandibular foramen, away from the inflamed pulp (Hargreaves & Keiser, Endod Topics 2002; see also Drum et al., JADA 2017).'],
    [T.list[0], T.w3[0], 'Proposed mechanisms; largely lab/animal data. Renton 2005; Wells 2007; Warren 2008 (human pulp) · TTX-R ~4× less sensitive to tonic lidocaine block (rat DRG; Roy & Narahashi 1992) · Wallace 1985; Modaresi 2008 (cat) · Byers 1990 (rat); Rodd & Boissonade 2001 (human carious teeth)'],
    [T.lip + 0.2, DUR + 1, 'Fowler et al., J Endod 2016: n = 375, symptomatic irreversible pulpitis; success = no/mild pain on access. Supplemental success varies: buccal articaine ~42–58%, intraosseous ~88% (Fowler 2016; Matthews 2009; Nusstein 1998). Pre-op NSAID may also help (Pulikkotil, IEJ 2018).'],
  ];
  function footer(t, color) {
    for (const [a, b, text] of FOOT) {
      const al = Math.min(seg(t, a, a + 0.35), 1 - seg(t, b - 0.25, b));
      if (al <= 0) continue;
      withAlpha(al, () => {
        font(IN(500, 22)); const lines = Kit.wrap(ctx, text, 890);
        const y0 = 1566 - (lines.length - 1) * 28;
        lines.forEach((l, i) => fill(l, 64, y0 + i * 28, IN(500, 22), color));
      });
    }
  }
  function masthead(t, color) {
    const a = seg(t, 0.25, 0.7);
    withAlpha(a, () => {
      fill('LOCAL ANESTHESIA × THE HOT TOOTH', 64, 268, IN(800, 22), color, 'left', 3);
      fill('@natebrooksendo', 1016, 268, IN(600, 24), color, 'right');
      ctx.fillStyle = color; ctx.fillRect(64, 286, 952 * E.inOut(seg(t, 0.2, 1.0)), 2);
    });
  }
  // the region currently painted yellow (for colour-switching the chrome)
  function yellowRect(t) {
    if (t < T.w2[0]) return null;
    if (t < T.w3[0]) { const x0 = lerp(W, 0, E.inOut(seg(t, T.w2[0], T.w2[1]))); return [x0, 0, W - x0, H]; }
    const y0 = lerp(H, 0, E.inOut(seg(t, T.w3[0], T.w3[1])));
    return [0, 0, W, y0];
  }
  function chrome(t) {
    const yr = yellowRect(t);
    const light = () => { masthead(t, COL.grey); footer(t, COL.grey); };
    const dark = () => { masthead(t, '#2B2408'); footer(t, '#2B2408'); };
    if (!yr) { light(); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(yr[0], yr[1], yr[2], yr[3]); ctx.clip('evenodd'); light(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(yr[0], yr[1], yr[2], yr[3]); ctx.clip(); dark(); ctx.restore();
  }

  // wipe edges are off-white (red is reserved for "the problem")
  function wipe1(t) {
    if (t < T.w1[0] || t > T.w1[1]) return;
    const p = seg(t, T.w1[0], T.w1[1]);
    // a fixed-height band sweeps up (max ~60% of the frame): it hides the hook→pKa swap without a full-frame yellow flash
    const BAND = 1150, e = E.inOut(p);
    const top = lerp(H, -BAND, e), bot = top + BAND;
    ctx.fillStyle = COL.yel; ctx.fillRect(0, top, W, BAND);
    ctx.fillStyle = COL.ink; ctx.fillRect(0, top - 12, W, 12); ctx.fillRect(0, bot, W, 12);
  }

  let GRAIN = null, VIG = null;
  function makeGrain() {
    const g = document.createElement('canvas'); g.width = g.height = 256;
    const gx = g.getContext('2d'); const id = gx.createImageData(256, 256); const r = Kit.rng(16);
    for (let i = 0; i < id.data.length; i += 4) { const on = r() > 0.5 ? 255 : 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = on; id.data[i + 3] = Math.floor(r() * 18); }
    gx.putImageData(id, 0, 0); return g;
  }
  function grain() { for (let y = 0; y < H; y += 256) for (let x = 0; x < W; x += 256) ctx.drawImage(GRAIN, x, y); }

  // ---------------------------------------------------------------- render
  function render(t) {
    t = clamp(t, 0, DUR);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = VIG; ctx.fillRect(0, 0, W, H);

    shaken(t, () => scene1(t));
    lab(t);
    wipe1(t);

    // yellow chapter
    if (t >= T.w2[0] && t < T.w3[1] + 0.01) {
      const p = E.inOut(seg(t, T.w2[0], T.w2[1]));
      const x0 = lerp(W, 0, p);
      ctx.fillStyle = COL.panel; ctx.fillRect(x0, 0, W - x0, H);
      if (p < 1) { ctx.fillStyle = COL.ink; ctx.fillRect(x0 - 14, 0, 14, H); }
      shaken(t, () => scene4(t));
    }
    // black takeaway
    if (t >= T.w3[0]) {
      const p = E.inOut(seg(t, T.w3[0], T.w3[1]));
      const y0 = lerp(H, 0, p);
      ctx.fillStyle = COL.bg; ctx.fillRect(0, y0, W, H - y0);
      if (p >= 1) { ctx.fillStyle = VIG; ctx.fillRect(0, 0, W, H); }
      if (p < 1) { ctx.fillStyle = COL.ink; ctx.fillRect(0, y0, W, 12); }
      shaken(t, () => scene5(t));
    }
    chrome(t);
    grain();
    // gentle fade at the very end so the loop restarts from black
    const fo = seg(t, DUR - 0.25, DUR);
    if (fo > 0) { ctx.fillStyle = Kit.rgba(COL.bg, fo); ctx.fillRect(0, 0, W, H); }
  }

  window.REEL = {
    title: 'Why LA struggles in a hot tooth',
    duration: DUR,
    poster: 1.9,
    canvas,
    fonts: ['400 100px "Bebas Neue"', '500 30px Inter', '600 30px Inter', '700 30px Inter', '800 30px Inter'],
    async setup() {
      GRAIN = makeGrain();
      const g = ctx.createRadialGradient(540, 900, 300, 540, 960, 1250);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
      VIG = g;
      setupHook();
    },
    render,
  };
  Kit.boot(REEL);
})();
