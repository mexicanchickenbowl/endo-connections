/*
 * Reel 38 — the five plots of the building site. Each plot is drawn in local coordinates (0..1080) for global time t.
 * Plot 0: root end (hook + BIOCOMPATIBLE)   Plot 1: cement in bone (OSTEOCONDUCTIVE)
 * Plot 2: cell-culture dish (OSTEOINDUCTIVE? lab signal)   Plot 3: non-bony site (strict test)   Plot 4: site notice board (verdict)
 */
const TL = {
  b1: 2.4, pan1: 7.2, b2: 7.85, pan2: 11.2, b3a: 11.85, pan3: 15.2, b3b: 15.85, pan4: 18.9, end: 19.6, wrap: 23.3, dur: 24,
  course0: 3.5, courseDt: 0.22,          // cementum course
  bone0: 8.3, boneDt: 0.23,              // new bone rows
  recruit0: 12.55, recruitDt: 0.25,      // helmets on
  stamp: 16.4,
};

// each plot is drawn zoomed about the ground line: screen x = (local x - xa) * s
const ZOOM = [{ s: 1.3, xa: 28 }, { s: 1.3, xa: 117 }, { s: 1.3, xa: 36 }, { s: 1.3, xa: 96 }, { s: 1, xa: 0 }];

// =========================================================================== PLOT 0 — root end
function rootPipe() {
  const xL = -90, xR = 330, yT = 856, yB = G + 2;
  rect(xL, yT, xR - xL, yB - yT, C.dentin);
  ctx.save(); ctx.beginPath(); ctx.rect(xL, yT, xR - xL, yB - yT); ctx.clip();
  ctx.strokeStyle = 'rgba(220,199,140,0.55)'; ctx.lineWidth = 2;
  for (let x = xL - 60; x < xR + 60; x += 15) { ctx.beginPath(); ctx.moveTo(x, yT); ctx.lineTo(x + 26, yT + 104); ctx.moveTo(x + 26, yB - 104); ctx.lineTo(x, yB); ctx.stroke(); }
  ctx.restore();
  rect(xL, yT, xR - xL, 9, C.dentinL); rect(xL, yB - 11, xR - xL, 11, C.dentinD);
  rect(xL, 960, 290, 104, C.gp); rect(xL, 960, 290, 10, C.gpL); rect(xL, 1052, 290, 12, '#D8714B');       // root filling in the canal
  for (let x = xL + 30; x < 190; x += 44) rect(x, 990, 26, 4, 'rgba(255,255,255,0.22)');
  block(196, 936, 134, 152, 'MTA', 5, 42);                                                                 // root-end filling
  rect(196, 936, 3, 152, 'rgba(120,100,60,0.35)');
  txt('ROOT', 112, 921, F.osw5(34), '#7A5F1E', 'center', 4);
}
function billboard(u, t) {
  const k = 0.8 + 0.2 * ease.out(clamp(u));
  ctx.save(); ctx.globalAlpha *= Math.min(1, u * 2.5); ctx.translate(681, 1150); ctx.scale(k, k); ctx.translate(-681, -1150);
  rect(578, 930, 11, 222, '#A3B5C5'); rect(774, 930, 11, 222, '#A3B5C5');
  ctx.save(); ctx.translate(540, 714); ctx.scale(0.86, 0.86); ctx.translate(-596, -604);
  fillRR(603, 613, 330, 256, 12, 'rgba(25,45,75,0.16)');
  fillRR(596, 604, 330, 256, 12, C.navy); fillRR(604, 612, 314, 240, 6, '#DCE8F0');
  ctx.save(); rr(604, 612, 314, 240, 6); ctx.clip();
  rect(604, 612, 314, 56, C.navy);
  rect(604, 822, 314, 30, '#B8C9D6');
  rect(604, 716, 104, 106, '#93A7B9'); rect(604, 716, 104, 6, '#A8BACA'); rect(604, 752, 66, 34, '#7C93A9');
  fillRR(668, 744, 40, 50, 3, '#3C4755'); rect(672, 748, 6, 42, 'rgba(255,255,255,0.22)');                // amalgam root-end filling
  for (const y of [716, 730, 794, 808]) { fillRR(708, y + 1, 10, 12, 2.5, C.cem); rect(709, y + 2, 8, 3, C.cemL); }   // cementum on the cut dentin only, none over the amalgam (Torabinejad 1997)
  beacon(828, 822, t, 0.6);
  [[748, 1, 0.0], [792, -1, 1.3], [872, -1, 2.4]].forEach((m) => worker({ x: m[0], y: 822, s: 0.52, dir: m[1], role: 'sil', armF: 0.35 + 0.12 * Math.sin(t * 2.1 + m[2]), armB: 0.1 }));
  ctx.restore();
  txt('AMALGAM', 761, 655, F.osw5(37), '#FFFFFF', 'center', 4);
  ctx.restore();
  ctx.restore();
}
function plot0(t) {
  fence(16, 880);
  add(1, () => { ctx.globalAlpha = 0.9; lattice(842, -20, 1150, 36, '#F0C64E', 3.5); ctx.globalAlpha = 1; fillRR(816, 1130, 52, 20, 4, '#C5CCD3'); });
  const bu = seg(t, 2.5, 3.0);                                             // standing prop: in with the beat sign
  if (bu > 0) add(2, () => billboard(bu, t));
  add(6, () => { pallet(752, G - 18, C.cem, C.cemD); }, () => { boxShadow(708, G - 10, 88, 52); });
  add(10, rootPipe, () => boxShadow(-90, G + 2, 420, 312));

  // cementum course over the cut root end and the filling
  for (let i = 0; i < 13; i++) {
    const u = seg(t, TL.course0 + i * TL.courseDt, TL.course0 + i * TL.courseDt + 0.32);
    if (u <= 0) break;
    add(12, () => {
      const k = ease.outBack(u), y = G + 2 - 24 * (i + 1);
      ctx.save(); ctx.globalAlpha = Math.min(1, u * 3); ctx.translate((1 - k) * 30, 0);
      fillRR(332, y + 1, 24, 22, 4, C.cem); rect(334, y + 2, 20, 5, C.cemL); rect(334, y + 18, 20, 3, C.cemD);
      ctx.restore();
    });
  }
  const done = seg(t, 6.45, 7.0);
  if (done > 0 && done < 1) add(13, () => { const y = lerp(G, 850, done); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(332, y - 26, 24, 26); });

  // scaffold tower + ladder
  add(14, () => { scaffoldBay(372, 478, 1012, 948); ladder(488, 1012, G, 22); });

  // early inflammation crew (red helmets): two of three leave, one lingers
  const I = 1 - 0.72 * seg(t, 2.6, 5.4, ease.smooth);
  add(18, () => beacon(502, G - 8, t, I, 1 + 0.5 * (1 - seg(t, 1.0, 1.9, ease.smooth))), () => boxShadow(494, G - 8, 16, 70, 0.16));
  const r1 = walk(t, 442, 965, 2.5, 5.0), r2 = walk(t, 562, 965, 2.9, 5.0), r3 = walk(t, 652, 592, 3.3, 3.9);   // r3 stays, steps up to the root
  W_(20, { x: r1.x, y: G - 4, role: 'red', skinI: 2, dir: r1.u > 0 ? 1 : -1, leg: r1.moving ? stride(r1.x) : 0, armF: r1.moving ? undefined : 0.5 + 0.12 * Math.sin(t * 2.3), armB: r1.moving ? undefined : 0.05 });
  W_(20, { x: r2.x, y: G - 2, role: 'red', skinI: 0, dir: 1, leg: r2.moving ? stride(r2.x) : 0, armF: r2.moving ? undefined : 0.3 + 0.1 * Math.sin(t * 1.9 + 1), armB: r2.moving ? undefined : 0.0 });
  W_(20, { x: r3.x, y: G - 6, role: 'red', skinI: 4, dir: -1, leg: r3.moving ? stride(r3.x) : 0, armF: r3.moving ? undefined : 0.25 + 0.08 * Math.sin(t * 1.6 + 2), armB: r3.moving ? undefined : 0.1 });

  // builders (cementoblasts) arrive and stay
  const a = walk(t, 890, 400, 0.0, 2.7), aWork = t > TL.course0 - 0.05 && t < TL.course0 + 6 * TL.courseDt + 0.1;
  W_(24, { x: a.x, y: G, role: 'builder', skinI: 1, dir: -1, leg: a.moving ? stride(a.x) : 0, armF: aWork ? 1.3 + 0.5 * Math.sin(t * 2 * Math.PI / TL.courseDt) : (a.moving ? undefined : 0.55 + 0.07 * Math.sin(t * 2)), armB: a.moving ? undefined : 0.1, carry: aWork ? 'brick' : (a.u >= 1 ? 'trowel' : null), brickCol: C.cem });
  const b = walk(t, 930, 499, 0.3, 3.0), cl = seg(t, 3.4, 4.3), b2 = walk(t, 499, 412, 4.3, 4.75);
  const bx = cl < 1 ? b.x : b2.x, by = lerp(G, 1012, cl), bClimb = cl > 0 && cl < 1;
  const bWork = t > TL.course0 + 6 * TL.courseDt && t < TL.course0 + 13 * TL.courseDt + 0.15;
  W_(26, { x: bx, y: by, role: 'builder', skinI: 3, dir: -1, leg: b.moving || b2.moving ? stride(bx) : bClimb ? 0.5 * Math.sin(t * 9) : 0, armF: bClimb ? 2.5 + 0.4 * Math.sin(t * 9) : bWork ? 1.5 + 0.55 * Math.sin(t * 2 * Math.PI / TL.courseDt) : (b.moving || b2.moving ? undefined : 0.6 + 0.07 * Math.sin(t * 2.2)), armB: bClimb ? 2.5 - 0.4 * Math.sin(t * 9) : (b.moving || b2.moving ? undefined : 0.1), carry: bWork ? 'brick' : (b2.u >= 1 ? 'trowel' : null), brickCol: C.cem });
  const c = walk(t, 1010, 716, 0.8, 3.3);
  add(25, () => wheelbarrow(c.x - 62, G + 6, C.steelL, C.cem), () => boxShadow(c.x - 92, G + 6, 56, 40, 0.18));
  W_(25, { x: c.x, y: G + 6, role: 'builder', skinI: 0, dir: -1, leg: c.moving ? stride(c.x) : 0, armF: c.moving ? 0.75 : 0.3 + 0.06 * Math.sin(t * 1.7), armB: c.moving ? 0.6 : 0.05 });
}

// =========================================================================== PLOT 1 — cement implanted in bone
function oldBone(x0, x1, yT, seed) {
  rect(x0, yT, x1 - x0, G + 2 - yT, C.bone);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, yT - 40, x1 - x0, G + 42 - yT); ctx.clip();
  for (let r = 0, y = G + 2 - 34; y > yT - 40; y -= 34, r++) {
    for (let x = x0 - (r % 2) * 34 - 10, c = 0; x < x1; x += 68, c++) {
      const top = y < yT;                              // ragged top course
      if (top && hash(r, c, seed) < 0.45) continue;
      if (top) rect(x, y, 68, 34, C.bone);
      ctx.strokeStyle = C.boneD; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, 68, 34);
      if (!top && hash(r, c, seed + 1) < 0.2) fillRR(x + 12, y + 8, 44, 18, 9, C.marrow);                 // marrow space
    }
  }
  ctx.restore();
}
function apatiteSkin(u, t) {
  // crystalline layer on the two side faces and the top of the block (block: x 440..640, y 868..)
  const crystals = (n, at) => { for (let i = 0; i < n; i++) { const g = clamp(u * 1.35 - (i / n) * 0.35); if (g <= 0) continue; at(i, g); } };
  const tri = (ax, ay, bx, by, px, py) => { poly([ax, ay, bx, by, px, py], '#8DE6F7'); ctx.strokeStyle = '#1FA6C9'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke(); poly([ax, ay, (ax + bx) / 2, (ay + by) / 2, px, py], 'rgba(255,255,255,0.55)'); };
  crystals(21, (i, g) => { const y = G + 2 - i * 14.3, d = (8 + 4 * hash(i, 71)) * g; tri(440, y, 440, y - 14.3, 440 - d, y - 7); tri(640, y, 640, y - 14.3, 640 + d, y - 7); });
  crystals(14, (i, g) => { const x = 440 + i * 14.3, d = (11 + 6 * hash(i, 72)) * clamp(u * 1.6 - 0.6) ; if (d > 0) tri(x, 868, x + 14.3, 868, x + 7, 868 - d); });
  for (let i = 0; i < 6; i++) {                                                                          // sparkles
    const ph = (t * 0.9 + i * 0.37) % 1, a = Math.sin(ph * Math.PI) * u, sx = i % 2 ? 652 : 428, sy = 900 + hash(i, 73) * 230, r = 9 * a;
    if (i === 4) { poly([540, 852 - r, 543, 852, 540, 852 + r, 537, 852], `rgba(255,255,255,${a})`); continue; }
    poly([sx, sy - r, sx + 2.5, sy, sx, sy + r, sx - 2.5, sy], `rgba(255,255,255,${a})`); poly([sx - r, sy, sx, sy - 2.5, sx + r, sy, sx, sy + 2.5], `rgba(255,255,255,${a})`);
  }
}
function boneBrickTime(r, j, n) { return TL.bone0 + r * TL.boneDt + (r === 0 ? (n - 1 - j) * 0.09 : j * 0.09); }
function newBone(t, side) {
  // side -1: gap x 250..430 (block to the right); side +1: gap x 650..830. Column j = 0 touches the cement.
  for (let r = 0; r < 10; r++) {
    const odd = r % 2, widths = odd ? [22.5, 45, 45, 45, 22.5] : [45, 45, 45, 45];
    let off = 0;
    for (let j = 0; j < widths.length; j++) {
      const w = widths[j], t0 = boneBrickTime(r, j, widths.length), u = seg(t, t0, t0 + 0.3);
      const x = side < 0 ? 430 - off - w : 650 + off, y = G + 2 - 28 * (r + 1);
      off += w;
      if (u <= 0) continue;
      const k = ease.outBack(u), fresh = 1 - seg(t, t0 + 0.2, t0 + 1.7);
      ctx.save(); ctx.globalAlpha = Math.min(1, u * 3); ctx.translate(x + w / 2, y + 14 - (1 - k) * 22); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
      fillRR(-w / 2 + 1, -13, w - 2, 26, 4, C.boneN); rect(-w / 2 + 3, 9, w - 6, 3, C.boneNL); strokeRR(-w / 2 + 2, -12, w - 4, 24, 3.5, '#D8C48A', 2.5);
      if (fresh > 0) fillRR(-w / 2 + 1, -13, w - 2, 26, 4, `rgba(255,201,40,${0.55 * fresh})`);
      ctx.restore();
    }
  }
  // contact seam: bone laid directly against the cement surface
  const rows = clamp((t - TL.bone0 - 0.25) / TL.boneDt, 0, 10);
  if (rows > 0) { const x = side < 0 ? 427 : 646; rect(x, G + 2 - rows * 28, 7, rows * 28, C.orange); rect(x + (side < 0 ? 5 : 0), G + 2 - rows * 28, 2, rows * 28, C.orangeD); }
}
function plot1(t) {
  fence(110, 970);
  add(1, () => { ctx.globalAlpha = 0.92; towerCrane(184, 704, 440, 300, 742 + 30 * seg(t, 8.2, 11.0, ease.inOut), '#F0C64E'); ctx.globalAlpha = 1; });
  add(4, () => { oldBone(96, 250, 772, 1); oldBone(830, 990, 772, 2); fillRR(166, 808, 84, 42, 6, C.bone); txt('BONE', 208, 840, F.osw5(31), '#6E5A24', 'center', 3); },
    () => { boxShadow(830, G + 2, 160, 300); });
  add(8, () => { rect(250, BAND_T + 6, 580, 26, 'rgba(120,90,60,0.12)'); });
  add(10, () => block(440, 868, 200, G + 2 - 868, 'MTA', 9, 50));
  const au = seg(t, 7.75, 8.6);
  add(11, () => apatiteSkin(au, t));
  add(12, () => { newBone(t, -1); newBone(t, 1); });
  // scaffolding stands clear of the cement faces so the bone-to-cement contact line is unobstructed
  add(14, () => { scaffoldBay(258, 396, 1012, 888); scaffoldBay(684, 822, 1012, 888); ladder(264, 1012, G, 22); ladder(794, 1012, G, 22); });
  // apatite tag
  const tu = seg(t, 8.25, 8.65);
  if (tu > 0) add(30, () => popAt(540, 840, tu, () => {
    line(540, 822, 540, 856, C.navy, 4, 'butt'); circ(540, 858, 6, C.navy);
    fillRR(352, 762, 376, 62, 10, C.navy); fillRR(358, 768, 364, 50, 6, C.paper);
    const a = 'apatite layer ', b = '(in vitro)', wa = tw(a, F.bc6(36)), wb = tw(b, F.bci(36)), x0 = 540 - (wa + wb) / 2;
    txt(a, x0, 806, F.bc6(36), C.navy); txt(b, x0 + wa, 806, F.bci(36), '#0E7C9A');
  }));
  // builders (osteoblasts)
  const lay = (ph) => 1.35 + 0.5 * Math.sin((t - TL.bone0) * 2 * Math.PI / TL.boneDt + ph);
  const working = t > TL.bone0 - 0.1 && t < TL.bone0 + 10 * TL.boneDt + 0.5, low = t < TL.bone0 + 4 * TL.boneDt + 0.3;
  const idle = (ph) => 0.55 + 0.08 * Math.sin(t * 2 + ph);
  W_(24, { x: 352, y: G, role: 'builder', skinI: 2, dir: 1, armF: working && low ? lay(0) : idle(0), armB: 0.1, carry: working && low ? 'brick' : 'trowel' });
  W_(24, { x: 728, y: G, role: 'builder', skinI: 0, dir: -1, armF: working && low ? lay(1.5) : idle(1), armB: 0.1, carry: working && low ? 'brick' : 'trowel' });
  W_(26, { x: 376, y: 1012, role: 'builder', skinI: 4, dir: 1, armF: working && !low ? lay(0.6) + 0.25 : idle(2), armB: 0.1, carry: working && !low ? 'brick' : 'trowel' });
  W_(26, { x: 704, y: 1012, role: 'builder', skinI: 3, dir: -1, armF: working && !low ? lay(2.2) + 0.25 : idle(3), armB: 0.1, carry: working && !low ? 'brick' : 'trowel' });
  const cl = seg(t, 7.9, 9.1, ease.inOut), cy = lerp(G, 1012, cl), w3 = walk(t, 275, 306, 9.1, 9.5);
  W_(27, { x: cl < 1 ? 275 : w3.x, y: cy, role: 'builder', skinI: 1, dir: 1, leg: cl > 0 && cl < 1 ? 0.5 * Math.sin(t * 9) : w3.moving ? stride(w3.x) : 0, armF: cl < 1 ? 2.5 + 0.4 * Math.sin(t * 9) : (working && !low ? lay(3.4) + 0.2 : idle(4)), armB: cl < 1 ? 2.5 - 0.4 * Math.sin(t * 9) : 0.1, carry: cl >= 1 && working && !low ? 'brick' : null });
  add(22, () => { pallet(902, G + 4, C.boneN, C.boneNL); cone(586, G + 20, 0.8); });
}

// =========================================================================== PLOT 2 — cell culture
function dial(cx, cy, r, u, label, up) {
  circ(cx, cy, r + 8, '#0F1821'); circ(cx, cy, r, C.paper);
  const a0 = Math.PI * 5 / 6, sw = Math.PI * 4 / 3;
  const arc = (f0, f1, col) => { ctx.beginPath(); ctx.arc(cx, cy, r - 11, a0 + sw * f0, a0 + sw * f1); ctx.strokeStyle = col; ctx.lineWidth = 11; ctx.lineCap = 'butt'; ctx.stroke(); };
  arc(0, 0.42, '#CBD3DB'); arc(0.42, 0.7, C.yellow); arc(0.7, 1, C.orange);
  for (let i = 0; i <= 8; i++) { const a = a0 + sw * i / 8; line(cx + Math.cos(a) * (r - 26), cy + Math.sin(a) * (r - 26), cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20), '#8492A0', 2.2, 'butt'); }
  const a = a0 + sw * u;
  line(cx - Math.cos(a) * 8, cy - Math.sin(a) * 8, cx + Math.cos(a) * (r - 17), cy + Math.sin(a) * (r - 17), C.navy, 5);
  circ(cx, cy, 8.5, C.orange); circ(cx, cy, 3.5, C.navy);
  const ax = cx + r - 6, ay = cy - r + 6;
  if (up > 0) popAt(ax, ay, up, () => { circ(ax, ay, 19, C.green); poly([ax, ay - 12, ax + 11, ay + 1, ax + 4.5, ay + 1, ax + 4.5, ay + 12, ax - 4.5, ay + 12, ax - 4.5, ay + 1, ax - 11, ay + 1], '#FFFFFF'); });
  txt(label, cx, cy + r + 41, F.bc6(29), '#FFFFFF', 'center', 0.8);
}
// needles all settle at the same height: direction only, the three markers come from different cell systems
const GAUGES = [{ cx: 458, label: 'BMP-2', t0: 12.75, hi: 0.8 }, { cx: 592, label: 'ALP', t0: 13.05, hi: 0.8 }, { cx: 726, label: 'OSTEOCALCIN', t0: 13.35, hi: 0.8 }];
function plot2(t) {
  fence(20, 880);
  // gauge board
  add(2, () => {
    rect(424, 890, 11, 262, '#A3B5C5'); rect(778, 890, 11, 262, '#A3B5C5');
    fillRR(397, 711, 428, 196, 14, 'rgba(25,45,75,0.16)'); fillRR(390, 702, 428, 196, 14, C.navy); strokeRR(397, 709, 414, 182, 9, C.navy2, 2.5);
    GAUGES.forEach((g) => { const u = 0.1 + (g.hi - 0.1) * seg(t, g.t0, g.t0 + 0.85, ease.outBack) + 0.012 * Math.sin(t * 5 + g.cx); dial(g.cx, 776, 50, u, g.label, seg(t, g.t0 + 0.6, g.t0 + 0.95)); });
  });
  // culture dish: back glass
  add(3, () => { fillRR(60, 1100, 900, 84, 16, 'rgba(255,255,255,0.35)'); });
  // cement block + foreman
  add(10, () => block(150, 932, 200, 244, null, 13), () => boxShadow(150, G + 8, 200, 240));
  const sig = seg(t, 11.5, 12.0) * (1 - seg(t, 15.3, 15.8));
  add(12, () => {                                                                                         // megaphone signal arcs
    for (let i = 0; i < 3; i++) { const ph = ((t * 1.25 + i / 3) % 1), r = 18 + ph * 62; ctx.beginPath(); ctx.arc(316, 838, r, -0.6, 0.6); ctx.strokeStyle = `rgba(255,122,26,${(1 - ph) * 0.85 * sig})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); }
  });
  // Ca2+ flag + wire to the BMP-2 gauge only
  const fl = 0.05 * Math.sin(t * 2.4);
  add(13, () => {
    ctx.beginPath(); ctx.moveTo(222, 722); ctx.quadraticCurveTo(306, 792, 398, 776);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 4.5; ctx.setLineDash([13, 9]); ctx.lineDashOffset = -t * 55; ctx.lineCap = 'butt'; ctx.stroke(); ctx.setLineDash([]);
    circ(399, 776, 7, C.yellow);
    ctx.save(); ctx.translate(222, 720); ctx.rotate(fl);
    poly([0, 0, -124, 6, -116, 37, -124, 68, 0, 64], C.navy); poly([-6, 6, -114, 11, -107, 37, -114, 62, -6, 58], C.yellow);
    txt('Ca', -100, 49, F.osw7(38), C.navy); txt('2+', -57, 33, F.osw7(23), C.navy);
    ctx.restore();
  });
  W_(14, { x: 266, y: 932, role: 'foreman', skinI: 1, dir: 1, armF: 2.05 + 0.05 * Math.sin(t * 3), armB: -2.6 - fl * 0.6, carry: 'mega', bob: 0 }, true);
  add(13.5, () => { line(256, 870, 222, 720, C.navy2, 5, 'butt'); circ(222, 718, 5, C.navy2); });
  // released ions drifting through the medium
  add(16, () => {
    for (let i = 0; i < 9; i++) {
      const ph = ((t * 0.34 + i / 9) % 1), x = 356 + ph * 480, y = 1130 + 12 * Math.sin(ph * 9 + i) - 60 * Math.sin(ph * Math.PI) * hash(i, 31), a = Math.sin(ph * Math.PI) * sig;
      circ(x, y, 6.5, `rgba(255,201,40,${a})`); circ(x - 2, y - 2, 2.2, `rgba(255,255,255,${a * 0.8})`);
    }
  });
  // new hires -> builders
  for (let i = 0; i < 4; i++) {
    const xf = 462 + i * 98, w = walk(t, 960 + i * 86, xf, 9.8, 12.05 + i * 0.12);
    const t0 = TL.recruit0 + i * TL.recruitDt, hd = seg(t, t0, t0 + 0.4), rec = seg(t, t0 + 0.15, t0 + 0.6), cheer = seg(t, t0 + 0.3, t0 + 0.55) * (1 - seg(t, t0 + 0.9, t0 + 1.3));
    W_(22 + i * 0.1, { x: w.x, y: G + (i % 2) * 5, role: 'hire', skinI: i + 2, hairI: i, dir: -1, leg: w.moving ? stride(w.x) : 0, armF: w.moving ? undefined : 0.2 + 2.6 * cheer + 0.06 * Math.sin(t * 2 + i), armB: w.moving ? undefined : 0.1 + 2.3 * cheer, helmetDrop: hd > 0 ? hd : null, recruit: rec, bob: 9 * Math.sin(cheer * Math.PI), carry: rec >= 1 && cheer <= 0 ? 'trowel' : null });
    if (hd > 0 && hd < 1) add(21, () => { ctx.beginPath(); ctx.arc(w.x, G - 98, 20 + hd * 34, 0, TAU); ctx.strokeStyle = `rgba(255,201,40,${(1 - hd) * 0.9})`; ctx.lineWidth = 6; ctx.stroke(); });
  }
  // culture dish: medium + front glass
  add(40, () => {
    ctx.save(); rr(60, 1100, 900, 84, 16); ctx.clip();
    rect(60, 1132, 900, 60, 'rgba(244,120,160,0.42)'); rect(60, 1132, 900, 3.5, 'rgba(255,255,255,0.55)');
    ctx.restore();
    strokeRR(60, 1100, 900, 84, 16, 'rgba(255,255,255,0.95)', 5); strokeRR(64, 1104, 892, 76, 13, 'rgba(120,190,220,0.6)', 2);
    line(84, 1114, 84, 1162, 'rgba(255,255,255,0.8)', 4.5);
  });
}

// =========================================================================== PLOT 3 — non-bony site (the strict test)
const PEBBLES = [[428, G + 8, 13], [404, G + 14, 10], [664, G + 10, 14], [690, G + 20, 9], [486, 976, 11], [530, 974, 8], [600, 976, 12], [442, G - 4, 9], [650, G - 6, 10], [712, G + 4, 11], [380, G + 6, 8], [566, 977, 7], [416, G - 10, 7], [676, G - 8, 8], [736, G + 14, 7], [362, G + 18, 6]];
function stampBoard(t) {
  const u = seg(t, TL.stamp, TL.stamp + 0.22, ease.in);
  if (u <= 0) return;
  const settle = seg(t, TL.stamp + 0.22, TL.stamp + 0.6), k = lerp(2.3, 1, u) * (1 + 0.05 * Math.sin(settle * Math.PI) * (1 - settle));
  const cx = 652, cy = 880;
  if (u >= 1) for (let i = 0; i < 2; i++) {                                                              // impact rings
    const p = seg(t, TL.stamp + 0.2 + i * 0.1, TL.stamp + 0.75 + i * 0.1, ease.out);
    if (p > 0 && p < 1) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.105); strokeRR(-215 - p * 26, -74 - p * 22, 430 + p * 52, 148 + p * 44, 16 + p * 14, `rgba(214,40,57,${(1 - p) * 0.5})`, 5); ctx.restore(); }
  }
  ctx.save(); ctx.globalAlpha = Math.min(1, u * 1.6); ctx.translate(cx, cy); ctx.rotate(-0.105); ctx.scale(k, k);
  fillRR(-209, -65, 430, 148, 14, 'rgba(25,45,75,0.20)');
  fillRR(-215, -74, 430, 148, 14, '#D62839'); fillRR(-208, -67, 416, 134, 8, C.paper); strokeRR(-201, -60, 402, 120, 5, '#D62839', 3);
  txt('ECTOPIC BONE:', 0, -11, F.osw7(45), '#D62839', 'center', 2.2);
  txt('NOT SHOWN', 0, 43, F.osw7(53), '#D62839', 'center', 3.2);
  ctx.restore();
}
function plot3(t) {
  fence(80, 940);
  // site sign
  add(2, () => {
    postBoard(138, 704, 272, 122, 1150, C.paper, C.orange);
    txt('NON-BONY SITE', 274, 757, F.osw7(36), C.navy, 'center', 1);
    txt('rat · subcutaneous', 274, 801, F.bc6(fit('rat · subcutaneous', 240, 36, F.bc6, 0.5)), '#C2470A', 'center', 0.5);
  });
  // ghost outline of the bone that would count as ectopic bone
  add(5, () => {
    const a = 0.55 + 0.18 * Math.sin(t * 2.2);
    ctx.save(); ctx.setLineDash([14, 10]); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3.5; ctx.lineCap = 'butt';
    ctx.strokeRect(338, 906, 92, G - 904); ctx.strokeRect(660, 906, 92, G - 904);
    ctx.lineWidth = 2.2; ctx.setLineDash([9, 9]);
    for (let y = G - 32; y > 908; y -= 34) { ctx.beginPath(); ctx.moveTo(338, y); ctx.lineTo(430, y); ctx.moveTo(660, y); ctx.lineTo(752, y); ctx.stroke(); }
    ctx.restore();
  });
  add(10, () => block(450, 978, 190, G + 6 - 978, 'MTA', 21, 46), () => boxShadow(450, G + 6, 190, 196));
  // mineral deposits (dystrophic calcification), not bone
  PEBBLES.forEach((p, i) => {
    const u = seg(t, 15.6 + i * 0.045, 15.9 + i * 0.045);
    if (u > 0) add(p[1] > 1000 ? 16 : 11, () => popAt(p[0], p[1], u, () => { poly([p[0] - p[2], p[1], p[0] - p[2] * 0.5, p[1] - p[2] * 1.1, p[0] + p[2] * 0.6, p[1] - p[2] * 1.2, p[0] + p[2], p[1]], '#F7F9FA'); poly([p[0] - p[2], p[1], p[0] + p[2], p[1], p[0] + p[2] * 0.6, p[1] - p[2] * 0.45, p[0] - p[2] * 0.4, p[1] - p[2] * 0.35], '#C5CDD5'); }));
  });
  // immature cells stay immature; a reaction lingers
  W_(22, { x: 760, y: G + 4, role: 'hire', skinI: 3, hairI: 1, dir: -1, armF: 0.12 + 0.05 * Math.sin(t * 1.7), armB: 0.1 });
  W_(22, { x: 836, y: G - 2, role: 'hire', skinI: 0, hairI: 3, dir: -1, armF: 0.2 + 0.05 * Math.sin(t * 1.4 + 1), armB: 0.05 });
  add(18, () => beacon(250, G + 4, t, 0.5), () => boxShadow(242, G + 4, 16, 70, 0.16));
  W_(20, { x: 190, y: G, role: 'red', skinI: 2, dir: 1, armF: 0.3 + 0.08 * Math.sin(t * 1.9), armB: 0.05 });
  add(50, () => stampBoard(t));
}

// =========================================================================== PLOT 4 — site notice board (verdict)
const ROWS = [
  { term: 'BIOCOMPATIBLE', def: 'tissue tolerates it', tag: 'ANIMAL + HUMAN HISTOLOGY', ok: true },
  { term: 'OSTEOCONDUCTIVE', def: 'bone grows on it', tag: 'ANIMAL HISTOLOGY', ok: true },
  { term: 'OSTEOINDUCTIVE', def: 'cell-culture signals', def2: 'ectopic bone: not shown', ok: false },
];
function plot4(t) {
  fence(-20, 1100);
  add(1, () => { ctx.globalAlpha = 0.9; lattice(1046, -20, 1150, 44, '#F0C64E', 4.5); ctx.globalAlpha = 1; fillRR(1014, 1126, 64, 24, 4, '#C5CCD3'); });
  add(4, () => {
    rect(150, 1000, 18, 152, C.navy2); rect(908, 1000, 18, 152, C.navy2);
    fillRR(86, 280, 928, 756, 20, 'rgba(25,45,75,0.18)');
    fillRR(74, 266, 928, 756, 20, C.navy);
    txt('MTA-TYPE CALCIUM SILICATE CEMENTS', 538, 319, F.osw5(fit('MTA-TYPE CALCIUM SILICATE CEMENTS', 850, 37, F.osw5, 4)), C.yellow, 'center', 4);
    ROWS.forEach((r, i) => {
      const y = 338 + i * 226, h = 216, mk = seg(t, TL.end + 0.05 + i * 0.18, TL.end + 0.45 + i * 0.18);
      fillRR(90, y, 896, h, 10, C.paper);
      ctx.save(); rr(90, y, 896, h, 10); ctx.clip(); ctx.beginPath(); ctx.rect(90, y, 168, h); ctx.clip();
      if (r.ok) rect(90, y, 168, h, '#DDF3E6');
      else { rect(90, y, 168, h, C.yellow); for (let k = -6; k < 6; k++) poly([90 + k * 44, y + h, 112 + k * 44, y + h, 232 + k * 44, y, 210 + k * 44, y], C.navy); fillRR(106, y + 16, 136, h - 32, 8, C.yellow); }
      ctx.restore();
      popAt(174, y + 108, mk, () => {
        if (r.ok) { circ(174, y + 108, 56, C.green); ctx.beginPath(); ctx.moveTo(147, y + 110); ctx.lineTo(166, y + 130); ctx.lineTo(203, y + 88); ctx.strokeStyle = '#fff'; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
        else { circ(174, y + 108, 56, C.orange); txt('?', 175, y + 142, F.osw7(92), '#FFFFFF', 'center'); }
      });
      const px = fit(r.term, 680, 74, F.osw7, 1);
      txt(r.term, 284, y + (r.def2 ? 80 : 86), F.osw7(px), C.navy, 'left', 1);
      if (r.def2) { txt(r.def, 286, y + 134, F.bc6(48), '#B84A00'); txt(r.def2, 286, y + 187, F.bc6(48), '#B84A00'); }
      else {
        txt(r.def, 286, y + 142, F.bc6(52), C.navy2);
        const wT = tw(r.tag, F.bc6(30), 1.5) + 30; fillRR(284, y + 158, wT, 42, 8, '#E3ECF2'); txt(r.tag, 299, y + 189, F.bc6(30), '#3F556B', 'left', 1.5);
      }
    });
    for (const x of [200, 876]) { fillRR(x - 22, 248, 44, 20, 6, C.navy2); poly([x - 30, 268, x + 30, 268, x + 20, 282, x - 20, 282], C.yellow); }
  }, () => { boxShadow(150, G - 14, 18, 120, 0.2); boxShadow(908, G - 14, 18, 120, 0.2); });
  const up = seg(t, TL.end + 0.5, TL.end + 0.9) * (1 - seg(t, TL.end + 2.2, TL.end + 2.6));
  const S = 1.3;
  W_(22, { x: 262, y: G + 4, s: S, role: 'builder', skinI: 1, dir: 1, armF: 0.4 + 2.5 * up + 0.05 * Math.sin(t * 2), armB: 0.1, carry: 'trowel', bob: 6 * Math.sin(up * Math.PI) });
  W_(22, { x: 372, y: G - 4, s: S, role: 'builder', skinI: 3, dir: -1, armF: 0.3 + 0.05 * Math.sin(t * 2 + 1), armB: 0.1 });
  W_(22, { x: 556, y: G + 6, s: S, role: 'foreman', skinI: 0, dir: 1, armF: 2.3 + 0.08 * Math.sin(t * 2.5), armB: 0.1 });
  W_(22, { x: 744, y: G - 2, s: S, role: 'hire', skinI: 2, hairI: 2, dir: -1, armF: 0.2 + 0.05 * Math.sin(t * 1.5), armB: 0.1 });
  W_(22, { x: 846, y: G + 6, s: S, role: 'hire', skinI: 4, hairI: 0, dir: -1, armF: 0.9 + 0.3 * Math.sin(t * 2.2), armB: 0.1 });
  add(21, () => { cone(654, G + 16, 1.1); });
}
const PLOTS = [plot0, plot1, plot2, plot3, plot4];
