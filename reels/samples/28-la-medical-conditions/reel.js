/*
 * Sample 28 — "Before you inject": medical conditions and drugs that change the local anesthetic choice.
 * Style: AIRLINE SAFETY CARD. A laminated card is pulled out of a seat-back pocket; eight numbered pictogram
 * panels pop in one at a time (lifted while in focus, then docked into the grid); the full card is held as a
 * screenshot-ready study aid; the card slides back into the pocket and the loop restarts.
 * One 2D canvas; render(t) is a pure function of t. Pictograms live in pictograms.js (window.Pic).
 */
(() => {
  'use strict';
  const { W, H, clamp, lerp, seg, ease, rgba } = Kit;
  const P = Pic, C = P.C, COND = P.COND, SANS = P.SANS;
  const { canvas, ctx: g } = Kit.createCanvas();

  // ------------------------------------------------------------------ layout
  const CARD = { x: 40, y: 190, w: 1004, h: 1760, r: 42 };       // laminate outline (bottom is hidden in the pocket)
  const SHEET = { x: 47, y: 197, w: 990, r: 35 };                // printed sheet inside the clear rim
  const HEAD = { y0: 197, y1: 372 };                             // navy header band
  const INDEX_X = 976;                                           // right-hand index strip (decorative, x 976-1037)
  const GX0 = 66, GAP = 12, PW = 440, PH = 268, GY0 = 392;
  const GX1 = GX0 + 2 * PW + GAP;                                // 958  (keeps clear of the button column x > 960)
  const GY1 = GY0 + 4 * PH + 3 * GAP;                            // 1500
  const LIFT = 1.42;                                             // scale of the panel in focus
  const PEEK = 1274;                                             // card offset when it sits in the pocket (header peeks out)
  const POCKET = { x0: 22, x1: 1058, y: 1640, sag: 44 };

  // panel-local layout (panel box = PW x PH)
  const CX = 76, CY = 118, AX0 = 142, AX1 = 178, IX = 186, BX = 400, CL = 182;
  const STRIP = { x: 10, y: 184, w: PW - 20, h: 76, r: 14 };

  // ------------------------------------------------------------------ timeline (seconds)
  const DUR = 25;
  const RISE = [0.0, 0.82];
  const T0 = 1.45, STEP = 2.2;                                   // panel i starts at T0 + i * STEP
  const TEND = T0 + 8 * STEP;                                    // 19.05: last panel starts to dock
  const FINE = [TEND + 0.3, TEND + 0.8];                         // fine print
  const SHEEN2 = [TEND + 0.7, TEND + 2.1];
  const ROLL = TEND + 1.3;                                             // sign roll-call
  const EXIT = [DUR - 0.74, DUR - 0.07];

  const softBack = (x) => { const c1 = 0.75, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  function cardOffset(t) {
    const up = softBack(seg(t, RISE[0], RISE[1]));
    const down = seg(t, EXIT[0], EXIT[1], ease.inOut);
    return PEEK * (1 - up) + PEEK * down;
  }
  const beat = (tau, times, w = 0.085) => times.reduce((s, ti) => s + Math.exp(-(((tau - ti) / w) ** 2)), 0);

  // ------------------------------------------------------------------ panels
  /** helper bound to the panel-local time */
  const A = (tau) => (t0, d = 0.34) => seg(tau, t0, t0 + d);

  const PANELS = [
    {
      title: 'SIGNIFICANT HEART DISEASE', kind: 'limit', lines: ['LIMIT EPI ≈ 0.04 mg', '≈ 2 CARTRIDGES'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condHeart(g, CX, CY, { fig: a(0.1), organ: a(0.28), beat: beat(tau, [0.72, 1.12, 1.52]) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        const L = 160, h = 34;
        P.grow(g, a(0.6), IX + L / 2, CY - 40, () => P.cartridge(g, IX, CY - 40, L, h, { label: '1:100,000' }));
        P.grow(g, a(0.74), IX + L / 2, CY, () => P.cartridge(g, IX, CY, L, h, { label: '1:100,000' }));
        P.grow(g, a(0.88), IX + L / 2, CY + 40, () => P.cartridge(g, IX, CY + 40, L, h, { ghost: true }));
        const b = a(0.92, 0.2);
        if (b > 0) {                                             // bracket: "these two"
          const x = IX + L + 10, y0 = CY - 55, y1 = lerp(y0, CY + 15, ease.out(b));
          g.beginPath(); g.moveTo(x - 7, y0); g.lineTo(x, y0); g.lineTo(x, y1); g.lineTo(x - 7, y1); P.fs(g, null, 3.6);
        }
        P.stamp(g, 'limit', BX - 3, CY - 23, 24, a(1.0, 0.26), seg(tau, 1.12, 1.62), pulse);
      },
    },
    {
      title: 'NON-SELECTIVE BETA-BLOCKER', kind: 'limit', lines: ['SMALL DOSE · ASPIRATE', 'RECHECK BP'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condBottle(g, CX, CY, 'beta', { fig: a(0.1), pills: a(0.3, 0.4) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.6), IX + CL / 2, CY - 31, () => P.cartridge(g, IX, CY - 31, CL, 42, { label: 'EPI' }));
        P.stamp(g, 'limit', BX, CY - 33, 23, a(0.8, 0.26), seg(tau, 0.92, 1.42), pulse);
        // then: blood-pressure dial -> repeat -> next cartridge
        const k = Math.max(0, tau - 1.3);
        const needle = 0.2 + 0.44 * ease.out(seg(tau, 0.9, 1.3)) + (tau > 1.3 ? 0.07 * Math.sin(k * 9) * Math.exp(-k * 3.2) : 0);
        P.grow(g, a(0.88), IX + 27, CY + 29, () => P.gauge(g, IX + 27, CY + 29, 23, needle));
        P.grow(g, a(0.98), IX + 80, CY + 31, () => P.loopArrow(g, IX + 80, CY + 31, 14, -2.4 * (1 - ease.out(seg(tau, 0.98, 1.75)))));
        P.grow(g, a(1.06), IX + 164, CY + 31, () => P.cartridge(g, IX + 106, CY + 31, 126, 32, { ghost: true }));
      },
    },
    {
      title: 'TRICYCLIC ANTIDEPRESSANT', kind: 'split', lines: ['EPI: LOW DOSE', 'AVOID LEVONORDEFRIN'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condBottle(g, CX, CY, 'tricyclic', { fig: a(0.1), pills: a(0.3, 0.4) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.6), IX + CL / 2, CY - 31, () => P.cartridge(g, IX, CY - 31, CL, 42, { label: 'EPI' }));
        P.stamp(g, 'limit', BX, CY - 33, 23, a(0.8, 0.26), seg(tau, 0.92, 1.42), pulse);
        P.grow(g, a(0.84), IX + CL / 2, CY + 31, () => P.cartridge(g, IX, CY + 31, CL, 42, { label: 'LEVO' }));
        P.stamp(g, 'avoid', BX, CY + 31, 24, a(1.04, 0.26), seg(tau, 1.16, 1.66), pulse);
      },
    },
    {
      title: 'RECENT COCAINE USE', kind: 'avoid', lines: ['NO VASOCONSTRICTOR'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condCocaine(g, CX, CY, { fig: a(0.1), powder: a(0.28), sniff: (Math.min(tau, 2.35) * 0.85) % 1, clock: a(0.38), hand: seg(tau, 0.45, 1.25, ease.inOut) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.6), IX + CL / 2, CY - 31, () => P.cartridge(g, IX, CY - 31, CL, 42, { label: 'EPI' }));
        P.stamp(g, 'avoid', BX, CY - 31, 24, a(0.8, 0.26), seg(tau, 0.92, 1.42), pulse);
        P.grow(g, a(0.78), IX + CL / 2, CY + 31, () => P.cartridge(g, IX, CY + 31, CL, 42, { label: 'LEVO' }));
        P.stamp(g, 'avoid', BX, CY + 31, 24, a(0.98, 0.26), seg(tau, 1.1, 1.6), pulse);
      },
    },
    {
      title: 'UNCONTROLLED HYPERTHYROIDISM', kind: 'avoid', lines: ['AVOID EPI'],
      draw(tau, pulse) {
        const a = A(tau);
        const k = Math.max(0, tau - 0.5);
        const ph = tau > 0.5 ? Math.max(0, Math.sin(k * 7.5)) * Math.exp(-k * 1.5) : 0;
        P.condThyroid(g, CX, CY, { fig: a(0.1), organ: a(0.28), beat: beat(tau, [0.7, 1.1, 1.5]), rays: a(0.42, 0.3), rayPhase: ph });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.62), IX + 88, CY, () => P.cartridge(g, IX, CY, 176, 52, { label: 'EPI', size: 38 }));
        P.stamp(g, 'avoid', BX, CY, 29, a(0.86, 0.26), seg(tau, 0.98, 1.5), pulse);
      },
    },
    {
      title: 'METHEMOGLOBINEMIA RISK', kind: 'avoid', lines: ['AVOID BOTH'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condMetHb(g, CX, CY, { fig: a(0.1), turn: seg(tau, 0.34, 1.15) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.6), IX + CL / 2, CY - 31, () => P.cartridge(g, IX, CY - 31, CL, 42, { label: 'PRILOCAINE' }));
        P.stamp(g, 'avoid', BX, CY - 31, 24, a(0.8, 0.26), seg(tau, 0.92, 1.42), pulse);
        P.grow(g, a(0.78), IX + CL / 2, CY + 31, () => P.tube(g, IX, CY + 31, CL, 42, { label: 'BENZOCAINE' }));
        P.stamp(g, 'avoid', BX, CY + 31, 24, a(0.98, 0.26), seg(tau, 1.1, 1.6), pulse);
      },
    },
    {
      title: 'SULFITE ALLERGY', kind: 'ok', lines: ['USE PLAIN'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condSulfite(g, CX, CY, { fig: a(0.1), dots: seg(tau, 0.26, 0.7), tag: a(0.4) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.6), IX + CL / 2, CY - 31, () => P.cartridge(g, IX, CY - 31, CL, 42, { label: 'EPI', chip: 'SO3' }));
        P.stamp(g, 'avoid', BX, CY - 31, 24, a(0.8, 0.26), seg(tau, 0.92, 1.42), pulse);
        P.grow(g, a(0.84), IX + CL / 2, CY + 31, () => P.cartridge(g, IX, CY + 31, CL, 42, { label: 'PLAIN' }));
        P.stamp(g, 'ok', BX, CY + 31, 23, a(1.04, 0.26), seg(tau, 1.16, 1.66), pulse);
      },
    },
    {
      title: 'PREGNANCY', kind: 'ok', lines: ['CONSIDERED SAFE'],
      draw(tau, pulse) {
        const a = A(tau);
        P.condPregnant(g, CX, CY, { fig: a(0.1), organ: a(0.32), beat: beat(tau, [0.8, 1.15, 1.5]) });
        P.arrow(g, AX0, AX1, CY, a(0.46, 0.24));
        P.grow(g, a(0.6), IX + CL / 2, CY - 31, () => P.cartridge(g, IX, CY - 31, CL, 42, { label: 'LIDOCAINE' }));
        P.stamp(g, 'ok', BX, CY - 31, 23, a(0.8, 0.26), seg(tau, 0.92, 1.42), pulse);
        P.grow(g, a(0.78), IX + CL / 2, CY + 31, () => P.cartridge(g, IX, CY + 31, CL, 42, { label: 'LIDO + EPI' }));
        P.stamp(g, 'ok', BX, CY + 31, 23, a(0.98, 0.26), seg(tau, 1.1, 1.6), pulse);
      },
    },
  ];
  const STRIP_AT = 1.1;

  /** coloured action strip at the bottom of a panel, wiped in from the left */
  function drawStrip(p, tau) {
    const { x, y, w, h, r } = STRIP;
    const wipe = (t0) => seg(tau, t0, t0 + 0.34, ease.out);
    const u = wipe(STRIP_AT);
    if (u <= 0) return;
    g.save(); P.rr(g, x, y, w, h, r); g.clip();
    if (p.kind === 'split') {
      const u2 = wipe(STRIP_AT + 0.16), hh = h / 2;
      g.save(); g.beginPath(); g.rect(x, y, w * u, hh); g.clip();
      g.fillStyle = C.amber; g.fillRect(x, y, w, hh);
      P.text(g, p.lines[0], x + w / 2, y + hh / 2 + 11.5, { size: 33, align: 'center', color: C.ink });
      g.restore();
      if (u2 > 0) {
        g.save(); g.beginPath(); g.rect(x, y + hh, w * u2, hh); g.clip();
        g.fillStyle = C.red; g.fillRect(x, y + hh, w, hh);
        P.text(g, p.lines[1], x + w / 2, y + hh + hh / 2 + 11.5, { size: 33, align: 'center', color: '#fff' });
        g.restore();
      }
    } else {
      g.beginPath(); g.rect(x, y, w * u, h); g.clip();
      const bg = p.kind === 'limit' ? C.amber : p.kind === 'avoid' ? C.red : C.green;
      const fg = p.kind === 'limit' ? C.ink : '#fff';
      g.fillStyle = bg; g.fillRect(x, y, w, h);
      if (p.lines.length === 1) P.text(g, p.lines[0], x + w / 2, y + h / 2 + 15.5, { size: 44, align: 'center', color: fg });
      else {
        P.text(g, p.lines[0], x + w / 2, y + 33, { size: 37, align: 'center', color: fg });
        P.text(g, p.lines[1], x + w / 2, y + 66, { size: 31, align: 'center', color: fg });
      }
    }
    g.restore();
  }

  /** panel chrome + content in panel-local coordinates */
  function drawPanelLocal(i, tau, pulse, lift) {
    const p = PANELS[i];
    // base with thick rounded border (+ shadow while lifted)
    g.save();
    if (lift > 0.001) { g.shadowColor = rgba('#0E2238', 0.4 * lift); g.shadowBlur = 44 * lift; g.shadowOffsetY = 16 * lift; }
    P.rr(g, 2.5, 2.5, PW - 5, PH - 5, 22); g.fillStyle = '#fff'; g.fill();
    g.restore();
    P.rr(g, 2.5, 2.5, PW - 5, PH - 5, 22); P.fs(g, null, 5);
    // number badge + condition title
    const nb = seg(tau, 0.06, 0.36);
    P.grow(g, nb, 32, 30, () => {
      g.beginPath(); g.arc(32, 30, 19, 0, Math.PI * 2); g.fillStyle = C.ink; g.fill();
      P.text(g, String(i + 1), 32, 41, { size: 32, align: 'center', color: '#fff' });
    });
    const tw = seg(tau, 0.1, 0.46, ease.out);
    if (tw > 0) {
      g.save(); g.beginPath(); g.rect(56, 6, (PW - 66) * tw, 46); g.clip();
      P.text(g, p.title, 60, 41, { size: p.titleSize, ls: p.titleLs, color: C.ink });
      g.restore();
      g.beginPath(); g.moveTo(14, 55); g.lineTo(14 + (PW - 28) * tw, 55); P.fs(g, null, 2.5, C.pale);
    }
    p.draw(tau, pulse);
    drawStrip(p, tau);
  }

  /** where panel i sits for a given lift (0 = docked in its slot, 1 = in focus) */
  function panelBox(i, lift) {
    const col = i % 2, row = (i / 2) | 0;
    const x = GX0 + col * (PW + GAP), y = GY0 + row * (PH + GAP);
    const s = 1 + (LIFT - 1) * lift, w = PW * s, h = PH * s;
    const lx = clamp(x + PW / 2 - w / 2, GX0 - 4, GX1 + 4 - w);
    const ly = clamp(y + PH / 2 - h / 2, GY0 - 2, GY1 + 6 - h);
    return { x: lx, y: ly, s, w, h };
  }
  const slot = (i) => ({ x: GX0 + (i % 2) * (PW + GAP), y: GY0 + ((i / 2) | 0) * (PH + GAP) });

  function drawPanel(i, t) {
    const tau = t - (T0 + i * STEP);
    if (tau <= 0) return;
    const lift = 1 - seg(tau, STEP - 0.05, STEP + 0.42, ease.inOut);
    const pop = seg(tau, 0, 0.42);
    const sPop = 0.7 + 0.3 * ease.outBack(pop);
    const b = panelBox(i, lift);
    const pulse = seg(t, ROLL + i * 0.2, ROLL + i * 0.2 + 0.55);
    g.save();
    g.globalAlpha = clamp(pop * 9);
    g.translate(b.x + b.w / 2, b.y + b.h / 2); g.scale(b.s * sPop, b.s * sPop); g.translate(-PW / 2, -PH / 2);
    drawPanelLocal(i, tau, pulse, lift);
    // docked panels step back while another one is in focus
    const focus = seg(t, T0, T0 + 0.3) * (1 - seg(t, TEND - 0.05, TEND + 0.42));
    const dim = 0.4 * focus * (1 - lift);
    if (dim > 0.003) { P.rr(g, 0, 0, PW, PH, 24); g.fillStyle = rgba('#F4F8FB', dim); g.fill(); }
    g.restore();
  }

  // ------------------------------------------------------------------ the card
  function clipSheet() { P.rr(g, SHEET.x, SHEET.y, SHEET.w, CARD.h - 14, SHEET.r); g.clip(); }

  function drawHeader(t) {
    g.fillStyle = C.ink; g.fillRect(SHEET.x, HEAD.y0, SHEET.w, HEAD.y1 - HEAD.y0);
    g.fillStyle = C.amber; g.fillRect(SHEET.x, HEAD.y1, SHEET.w, 7);
    P.text(g, 'BEFORE YOU INJECT', 72, 316, { size: 90, color: '#fff', ls: 0.5 });
    P.text(g, 'LOCAL ANESTHETIC SAFETY CARD', 75, 353, { size: 30, weight: 600, fam: SANS, color: C.amber, ls: 1.6 });
    // legend: the three signs used on the card
    const items = [['limit', 'LIMIT'], ['avoid', 'AVOID'], ['ok', 'OK']];
    g.beginPath(); g.moveTo(838, 244); g.lineTo(838, 360); P.fs(g, null, 2.5, rgba('#ffffff', 0.22));
    items.forEach(([kind, word], i) => {
      const y = 261 + i * 41, x = 878;
      const bump = Math.sin(Math.PI * seg(t, 0.85 + i * 0.24, 1.4 + i * 0.24)) ** 2;
      g.save(); g.translate(x, y); g.scale(1 + 0.32 * bump, 1 + 0.32 * bump);
      P.SIGN[kind](g, 0, kind === 'limit' ? -3 : 0, kind === 'limit' ? 14 : 15.5);
      g.restore();
      P.text(g, word, x + 30, y + 10.5, { size: 31, weight: 600, color: bump > 0.02 ? rgba(Kit.mix('#ffffff', P.SIGN_COLOR[kind] === C.red ? '#FF8C96' : P.SIGN_COLOR[kind], bump * 0.8)) : '#fff', ls: 0.6 });
    });
  }

  function drawIndexStrip() {
    g.fillStyle = '#DDE9F3'; g.fillRect(INDEX_X, HEAD.y1 + 7, SHEET.x + SHEET.w - INDEX_X, CARD.h);
    g.beginPath(); g.moveTo(INDEX_X, HEAD.y1 + 7); g.lineTo(INDEX_X, CARD.y + CARD.h); P.fs(g, null, 2, rgba(C.ink, 0.16));
    const cx = (INDEX_X + SHEET.x + SHEET.w) / 2 - 2;
    P.tooth(g, cx, 436, 34, '#fff');
    g.save(); g.translate(cx + 6, 690); g.rotate(-Math.PI / 2);
    P.text(g, '@natebrooksendo', 0, 0, { size: 27, weight: 600, fam: SANS, color: rgba(C.ink, 0.82), align: 'center', ls: 0.8 });
    g.restore();
    // decorative tick marks, one per row of panels
    for (let r = 0; r < 4; r++) {
      const y = GY0 + r * (PH + GAP) + PH / 2;
      if (r === 0 || r === 1) continue;                          // rows 1-2 carry the tooth mark and the handle
      g.beginPath(); g.moveTo(cx - 10, y + 6); g.lineTo(cx, y - 6); g.lineTo(cx + 10, y + 6); P.fs(g, null, 3, rgba(C.ink, 0.22));
    }
  }

  function drawPlaceholders(t) {
    for (let i = 0; i < 8; i++) {
      const ti = T0 + i * STEP;
      const a = seg(t, 0.5 + i * 0.05, 0.85 + i * 0.05) * (1 - seg(t, ti, ti + 0.16));
      if (a <= 0) continue;
      const s = slot(i);
      g.save(); g.globalAlpha = a;
      g.setLineDash([12, 10]); P.rr(g, s.x + 4, s.y + 4, PW - 8, PH - 8, 20); P.fs(g, '#F3F7FA', 3, '#C3D3E1'); g.setLineDash([]);
      P.text(g, String(i + 1), s.x + PW / 2, s.y + PH / 2 + 52, { size: 150, align: 'center', color: '#DCE7F0' });
      g.restore();
    }
  }

  function drawFinePrint(t) {
    const a = seg(t, FINE[0], FINE[1]);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    const dy = (1 - ease.out(a)) * 8;
    P.text(g, 'Conventional precautions, not trial-proven limits · check current references', GX0 + 2, 1535 + dy, { size: 25, weight: 600, fam: SANS, color: C.ink });
    P.text(g, 'Becker & Reed, Anesth Prog 2012 · Yagiela, JADA 1999 · Guay, Anesth Analg 2009 · full refs in caption', GX0 + 2, 1568 + dy, { size: 25, weight: 500, color: rgba(C.ink, 0.78), ls: 0.2 });
    g.restore();
  }

  /** laminate gloss: two fixed soft streaks + a moving sheen (u = 0..1 or -1 for none) */
  function drawGloss(u) {
    const band = (x, w, a) => {
      g.save(); g.transform(1, 0, -0.36, 1, 0, 0);
      const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x - w / 2, CARD.y - 20, w, CARD.h + 40);
      g.restore();
    };
    band(700, 260, 0.085); band(1500, 120, 0.07);
    if (u > 0 && u < 1) band(lerp(-150, 1950, ease.inOut(u)), 300, 0.42 * Math.sin(Math.PI * u));
  }

  function drawCard(t) {
    // laminate: soft shadow, clear rim, printed sheet
    g.save(); g.shadowColor = 'rgba(22,44,66,0.30)'; g.shadowBlur = 46; g.shadowOffsetY = 14;
    P.rr(g, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r); g.fillStyle = '#E9F0F5'; g.fill(); g.restore();
    P.rr(g, CARD.x + 1.5, CARD.y + 1.5, CARD.w - 3, CARD.h - 3, CARD.r - 1); P.fs(g, null, 3, 'rgba(255,255,255,0.9)');
    P.rr(g, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r); P.fs(g, null, 1.2, 'rgba(60,90,120,0.35)');
    g.save(); clipSheet();
    g.fillStyle = '#FBFDFE'; g.fillRect(SHEET.x, SHEET.y, SHEET.w, CARD.h);
    drawHeader(t);
    drawIndexStrip();
    g.restore();
    drawPlaceholders(t);
    // docked panels first, then whatever is lifted (newest on top)
    const lifted = [];
    for (let i = 0; i < 8; i++) {
      const tau = t - (T0 + i * STEP);
      if (tau <= 0) continue;
      if (tau >= STEP + 0.42) drawPanel(i, t); else lifted.push(i);
    }
    for (const i of lifted) drawPanel(i, t);
    drawFinePrint(t);
    g.save(); P.rr(g, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r); g.clip();
    const s1 = seg(t, 0.3, 1.4), s2 = seg(t, SHEEN2[0], SHEEN2[1]);
    drawGloss(s1 > 0 && s1 < 1 ? s1 : s2);
    g.restore();
  }

  // ------------------------------------------------------------------ seat back + literature pocket (cached layers)
  function pocketTop(c, dy = 0) { c.moveTo(POCKET.x0, POCKET.y + dy); c.quadraticCurveTo(W / 2, POCKET.y + POCKET.sag + dy, POCKET.x1, POCKET.y + dy); }
  function makeLayer(draw) { const c = document.createElement('canvas'); c.width = W; c.height = H; draw(c.getContext('2d')); return c; }

  function drawSeat(c) {
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#CDD9E2'); gr.addColorStop(1, '#BDCBD6');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    // moulded-plastic speckle
    const r = Kit.rng(2828);
    for (let i = 0; i < 3200; i++) { const x = r() * W, y = r() * H, v = r(); c.fillStyle = v < 0.5 ? 'rgba(255,255,255,0.11)' : 'rgba(30,55,80,0.05)'; c.fillRect(x, y, 2, 2); }
    // side shading
    const sg = c.createLinearGradient(0, 0, W, 0);
    sg.addColorStop(0, 'rgba(30,55,80,0.16)'); sg.addColorStop(0.09, 'rgba(30,55,80,0)'); sg.addColorStop(0.91, 'rgba(30,55,80,0)'); sg.addColorStop(1, 'rgba(30,55,80,0.16)');
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    // stowed tray table with latch (top, under the Reels UI — decoration only)
    const sh = c.createLinearGradient(0, 150, 0, 186); sh.addColorStop(0, 'rgba(30,55,80,0.20)'); sh.addColorStop(1, 'rgba(30,55,80,0)');
    c.fillStyle = sh; c.fillRect(56, 150, 968, 36);
    P.rr(c, 52, -90, 976, 242, 52); c.fillStyle = '#D6E0E8'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#A7B7C5'; c.stroke();
    P.rr(c, 70, -90, 940, 224, 40); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
    P.rr(c, 476, 84, 128, 44, 22); c.fillStyle = '#8EA2B4'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#74899C'; c.stroke();
    P.rr(c, 500, 95, 80, 22, 11); c.fillStyle = '#A9BAC8'; c.fill();
    c.beginPath(); c.arc(540, 106, 6, 0, Math.PI * 2); c.fillStyle = '#74899C'; c.fill();
    // dark inside of the pocket mouth: a lens between the back lip and the sagging hem (the card slides in front of it)
    c.beginPath(); c.moveTo(POCKET.x0 + 2, POCKET.y + 2); c.quadraticCurveTo(W / 2, POCKET.y - 30, POCKET.x1 - 2, POCKET.y + 2);
    c.quadraticCurveTo(W / 2, POCKET.y + POCKET.sag + 14, POCKET.x0 + 2, POCKET.y + 2); c.closePath();
    c.fillStyle = '#2B4057'; c.fill();
  }

  function drawPocket(c) {
    const path = () => { c.beginPath(); pocketTop(c); c.lineTo(POCKET.x1, H + 60); c.lineTo(POCKET.x0, H + 60); c.closePath(); };
    const gr = c.createLinearGradient(0, POCKET.y, 0, H); gr.addColorStop(0, '#5A7792'); gr.addColorStop(1, '#425A73');
    c.save(); c.shadowColor = 'rgba(15,30,50,0.35)'; c.shadowBlur = 24; c.shadowOffsetY = -6; path(); c.fillStyle = gr; c.fill(); c.restore();
    c.save(); path(); c.clip();
    // fabric weave
    c.lineWidth = 1.2;
    for (let k = -H; k < W + H; k += 9) {
      c.strokeStyle = 'rgba(255,255,255,0.045)'; c.beginPath(); c.moveTo(k, POCKET.y - 10); c.lineTo(k + 400, POCKET.y + 390); c.stroke();
      c.strokeStyle = 'rgba(10,25,45,0.05)'; c.beginPath(); c.moveTo(k + 400, POCKET.y - 10); c.lineTo(k, POCKET.y + 390); c.stroke();
    }
    // elastic hem + stitching
    c.beginPath(); pocketTop(c, 19); c.lineWidth = 40; c.strokeStyle = '#6E8CA9'; c.stroke();
    c.beginPath(); pocketTop(c, 41); c.lineWidth = 6; c.strokeStyle = 'rgba(15,30,50,0.16)'; c.stroke();
    c.setLineDash([15, 10]); c.lineWidth = 2.6; c.strokeStyle = 'rgba(255,255,255,0.55)';
    c.beginPath(); pocketTop(c, 31); c.stroke(); c.beginPath(); pocketTop(c, 9); c.stroke();
    c.beginPath(); c.moveTo(POCKET.x0 + 16, POCKET.y + 46); c.lineTo(POCKET.x0 + 16, H); c.moveTo(POCKET.x1 - 16, POCKET.y + 46); c.lineTo(POCKET.x1 - 16, H); c.stroke();
    c.setLineDash([]);
    // embossed placard (tone on tone; sits under the Reels UI)
    c.font = `700 54px ${COND}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    if ('letterSpacing' in c) c.letterSpacing = '9px';
    c.fillStyle = 'rgba(12,28,48,0.28)'; c.fillText('LITERATURE ONLY', W / 2 + 4, 1806 + 2.5);
    c.fillStyle = 'rgba(255,255,255,0.20)'; c.fillText('LITERATURE ONLY', W / 2 + 4, 1806);
    c.restore();
    c.beginPath(); pocketTop(c, 0); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,0.4)'; c.stroke();
  }

  let seatLayer, pocketLayer;

  // ------------------------------------------------------------------ REEL
  window.REEL = {
    title: 'Before you inject — LA safety card',
    duration: DUR,
    poster: 23.4,
    canvas,
    fonts: [
      '700 90px "Barlow Condensed"', '600 31px "Barlow Condensed"', '500 25px "Barlow Condensed"',
      '600 30px Barlow', '500 25px Barlow', '700 44px Inter',
    ],
    setup() {
      seatLayer = makeLayer(drawSeat);
      pocketLayer = makeLayer(drawPocket);
      // fit each condition title on one line (never below 30 px)
      const avail = PW - 60 - 13;
      for (const p of PANELS) {
        p.titleSize = 32; p.titleLs = 0;
        while (p.titleSize > 30 && P.textWidth(g, p.title, { size: p.titleSize }) > avail) p.titleSize -= 0.5;
        const w = P.textWidth(g, p.title, { size: p.titleSize });
        if (w > avail) p.titleLs = Math.max(-0.8, (avail - w) / (p.title.length - 1));
      }
    },
    render(t) {
      t = clamp(t, 0, DUR);
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
      g.drawImage(seatLayer, 0, 0);
      const off = cardOffset(t);
      g.save();
      g.translate(W / 2, 1760 + off * 0.2); g.rotate(-0.02 * (off / PEEK)); g.translate(-W / 2, -(1760 + off * 0.2));
      g.translate(0, off);
      drawCard(t);
      g.restore();
      g.drawImage(pocketLayer, 0, 0);
    },
  };
  Kit.boot(REEL);
})();
