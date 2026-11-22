/*
 * 35 · Principles of file separation — FORENSIC CASE FILE / EVIDENCE BOARD
 *
 * One full-frame canvas; everything is a pure function of t (see render()).
 * The "world" is the finished evidence board at exactly 1080 x 1920 (so the last frame = the whole board,
 * every word >= 30 px). The camera zooms into clusters of that board and follows the red thread.
 * Every on-screen statement and number is listed with its source in NOTES.md (evidence brief: RESEARCH.md).
 * Both mechanism diagrams, the radiograph and all pictograms are schematic and labelled so on screen.
 */
(function () {
  const { canvas, ctx } = Kit.createCanvas();
  const { seg, ease, clamp, lerp, hash, mix, W, H } = Kit;
  const { C } = TX, A = ART, G = A.G, TAU = Math.PI * 2, RAD = Math.PI / 180;
  const DUR = 24.0;

  // ------------------------------------------------------------------ layout (world px == final frame px)
  const mkCard = (x, y, w, h, rot) => ({ x, y, w, h, cx: x + w / 2, cy: y + h / 2, r: rot * RAD });
  const toW = (c, lx, ly) => { const dx = lx - c.w / 2, dy = ly - c.h / 2, co = Math.cos(c.r), si = Math.sin(c.r); return [c.cx + dx * co - dy * si, c.cy + dx * si + dy * co]; };
  const K = {
    title: mkCard(66, 250, G.title.w, G.title.h, -1.0),
    radio: mkCard(70, 474, G.radio.w, G.radio.h, 1.3),
    exA: mkCard(428, 250, G.ex.w, G.ex.h, 0.8),
    exB: mkCard(726, 250, G.ex.w, G.ex.h, -0.7),
    reuse: mkCard(66, 824, 346, G.sus.h, -0.9), operator: mkCard(66, 966, 346, G.sus.h, 0.8),
    noglide: mkCard(428, 824, 284, G.sus.h, 1.0), force: mkCard(428, 966, 284, G.sus.h, -0.8),
    curve: mkCard(726, 824, 284, G.sus.h, -1.1), big: mkCard(726, 966, 284, G.sus.h, 0.9),
    prev: mkCard(66, 1122, G.prev.w, G.prev.h, -1.1),
    bag: mkCard(72, 1354, G.bag.w, G.bag.h, 1.0),
    prog: mkCard(428, 1122, G.prog.w, G.prog.h, 0.5),
    dec: mkCard(428, 1312, G.dec.w, G.dec.h, -0.4),
    pay: mkCard(70, 1498, G.pay.w, G.pay.h, -0.7),
  };

  // ------------------------------------------------------------------ timeline (seconds)
  const T = {
    stampCase: 0.3, circle: [0.5, 1.1], tent1: 1.15, th1: [1.55, 2.5],
    // exhibits: the stamp names the mechanism as the card lands, the captions follow at once, then the diagram plays
    A: 2.15, tauA: 2.75, tent2: 2.7, stampA: 2.95, capA1: [3.0, 3.3], capA2: [3.3, 3.6], noteA: [3.7, 4.0], th2: [4.6, 4.95], th3: [4.85, 5.5],
    B: 5.15, tauB: 5.7, tent3: 5.65, stampB: 5.9, capB1: [5.95, 6.25], capB2: [6.25, 6.5], noteB: [7.1, 7.4], th4: [7.5, 7.85],
    curve: 8.3, th5: [8.25, 8.45], big: 8.7, th6: [8.75, 9.0], noglide: 9.15, th7: [9.1, 9.3], tent4: 9.4, force: 9.55, th8: [9.6, 9.85], th9: [9.45, 10.0],
    reuse: 10.6, operator: 10.85, th10: [10.75, 11.05], th11: [11.0, 11.25], ring: [11.25, 11.6],
    stampP: 12.5, tent5: 12.55, rows: [[12.6, 12.85, 12.9], [13.0, 13.25, 13.3], [13.4, 13.65, 13.7]],
    stampG: 15.4, tent6: 15.45, head: [15.5, 15.9], bar1: [15.8, 16.5], bar2: [16.1, 16.8], ns: [16.85, 17.25],
    tabs: [17.1, 17.2, 17.3], rem: [17.4, 17.8], brk: [17.8, 18.0], u1: 17.9, u2: 18.3,
    pay: 20.4, payText: [20.75, 21.25], payLine: [21.25, 21.5],
  };
  // camera: [t, cx, cy, zoom, roll°]; segments alternate hold (slow linear drift) / move (eased)
  const CAM = [
    [0.0, 250, 560, 2.10, -0.5], [2.0, 247, 551, 2.20, -0.3],          // the case opens: title + radiograph
    [2.7, 570, 550, 2.20, 0.3], [5.0, 570, 556, 2.25, 0.4],            // exhibit: torsion
    [5.65, 834, 550, 2.20, -0.3], [7.85, 832, 558, 2.24, -0.4],        // exhibit: fatigue
    [8.5, 732, 888, 1.55, 0.2], [10.25, 728, 894, 1.57, 0.25],         // suspects under both exhibits
    [10.85, 322, 990, 1.95, -0.3], [11.85, 320, 996, 1.98, -0.35],     // ... pushing in on reuse + operator
    [12.5, 240, 1210, 2.30, 0.3], [14.7, 240, 1216, 2.34, 0.35],       // prevention checklist
    [15.4, 706, 1330, 1.72, -0.2], [20.0, 706, 1345, 1.70, -0.1],      // prognosis + decision, held until the strip has been read
    [20.8, 540, 960, 1.0, 0], [DUR, 540, 960, 1.0, 0],                 // the whole board
  ];
  function camera(t) {
    let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1];
    let u = clamp((t - a[0]) / (b[0] - a[0]));
    if (i % 2 === 1) u = ease.smooth(u);          // smoothstep: peak speed 1.5x the mean (cubic in-out strobed on card edges)
    const z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u));
    return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z, roll: lerp(a[4], b[4], u) };
  }
  const THUMPS = [T.stampCase, T.stampA, T.stampB, T.stampP, T.stampG];
  function shake(t) { let y = 0; for (const s of THUMPS) { const d = t - s - 0.12; if (d > 0 && d < 0.35) y += 3 * Math.exp(-d / 0.06) * Math.cos(d * 52); } return y; }

  // ------------------------------------------------------------------ sprites (built once in setup)
  let bg, film, SP = {}, ST = {};
  const SUS = {
    reuse: { w: 346, icon: 'reuse', lines: ['reuse'], lx: 162, ix: 22 },
    operator: { w: 346, icon: 'operator', lines: ['operator'], lx: 132, ix: 18, fine: 'Parashos 2004, J Endod' },
    noglide: { w: 284, icon: 'noglide', lines: ['no glide', 'path'], lx: 126 },
    force: { w: 284, icon: 'force', lines: ['forced'], lx: 126 },
    curve: { w: 284, icon: 'curve', lines: ['tight', 'curve'], lx: 130, fine: 'Pruett 1997, in vitro' },
    big: { w: 284, icon: 'big', lines: ['big file'], lx: 114, fine: 'Pruett 1997, in vitro' },   // same in vitro fatigue source as 'tight curve'
  };
  function decor(g) {                                  // things already lying about on the board (no reading needed)
    for (const [x, y, c] of [[905, 92, 'yellow'], [948, 118, 'blue'], [992, 84, 'white'], [96, 1668, 'green'], [140, 1700, 'red'], [186, 1662, 'white'], [560, 1690, 'yellow']]) A.pin(g, x, y, c);
    // a spare length of plain white string hanging in the empty right-hand strip (not the narrative red thread)
    const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([992 + Math.sin(u * 5.2) * 13 * u, 1150 + u * 400]); }
    const WS = { color: '#d9d2c0', hi: '#ffffff' };
    A.thread(g, pts, 1, WS); A.pin(g, 992, 1150, 'white');
    const loop = []; for (let i = 0; i <= 50; i++) { const a = i / 50 * TAU * 2.2; loop.push([990 + Math.cos(a) * (10 + i * 0.22), 1562 + Math.sin(a) * (7 + i * 0.16)]); }
    A.thread(g, loop, 1, WS);
    // magnifying glass resting on the bottom ledge
    {
      const x = 800, y = 1752, r = 72;
      g.save(); g.translate(x, y); g.rotate(0.62);
      g.fillStyle = 'rgba(25,12,3,0.35)'; g.beginPath(); g.ellipse(8, 12, r + 6, r + 4, 0, 0, TAU); g.fill(); g.fillRect(r, 2, 170, 30);
      const hg = g.createLinearGradient(0, -14, 0, 14); hg.addColorStop(0, '#5b3320'); hg.addColorStop(0.35, '#8a5433'); hg.addColorStop(1, '#3a1e10');
      g.fillStyle = hg; TX.rr(g, r + 14, -14, 158, 28, 12); g.fill();
      const fg = g.createLinearGradient(0, -11, 0, 11); fg.addColorStop(0, '#f1e3b0'); fg.addColorStop(0.5, '#b8963e'); fg.addColorStop(1, '#6e5518');
      g.fillStyle = fg; g.fillRect(r - 2, -11, 22, 22);
      g.restore();
      const gl = g.createRadialGradient(x - 22, y - 26, 6, x, y, r); gl.addColorStop(0, 'rgba(255,250,235,0.34)'); gl.addColorStop(0.6, 'rgba(255,244,214,0.10)'); gl.addColorStop(1, 'rgba(60,40,20,0.22)');
      g.fillStyle = gl; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      const rg = g.createLinearGradient(x - r, y - r, x + r, y + r); rg.addColorStop(0, '#f6e9ba'); rg.addColorStop(0.45, '#b08e3a'); rg.addColorStop(1, '#5e4712');
      g.strokeStyle = rg; g.lineWidth = 9; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(30,18,4,0.6)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r + 4.5, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, r - 4.5, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r - 16, -2.5, -1.6); g.stroke();
    }
    // strips of old masking tape
    for (const [x, y, w, r] of [[640, 120, 150, -0.08], [270, 1740, 190, 0.05]]) { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = 'rgba(238,226,190,0.82)'; g.fillRect(0, 0, w, 34); g.strokeStyle = 'rgba(120,90,40,0.25)'; g.strokeRect(0, 0, w, 34); g.restore(); }
  }
  function setup() {
    bg = TX.cork(-60, -60, 1200, 2040, 1.6);
    const bx = bg.getContext('2d'); bx.setTransform(1.6, 0, 0, 1.6, 96, 96); decor(bx);
    film = A.film();
    SP.title = A.titleCard(); SP.radio = A.radioCard(film); SP.exA = A.exCard('A'); SP.exB = A.exCard('B');
    for (const k of Object.keys(SUS)) SP[k] = A.susCard(SUS[k]);
    SP.prev = A.prevCard(); SP.bag = A.bagCard(); SP.prog = A.progCard(); SP.dec = A.decBody(); SP.pay = A.payCard();
    SP.tabs = ['BYPASS', 'RETRIEVE', 'LEAVE + MONITOR'].map((s, i) => A.tabSprite(i, s));
    ST.caseNotes = TX.stamp('CASE NOTES', C.red, { size: 24, double: true, seed: 3, padX: 12, padY: 7, ls: 1.6, frame: 2.6 });
    ST.torsion = TX.stamp('TORSION', C.red, { size: 42, seed: 7 });
    ST.fatigue = TX.stamp('FATIGUE', C.red, { size: 42, seed: 9 });
    ST.prevention = TX.stamp('PREVENTION', C.green, { size: 36, seed: 12 });
    ST.prognosis = TX.stamp('PROGNOSIS', C.navy, { size: 36, seed: 15 });
  }

  // ------------------------------------------------------------------ helpers
  const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const nType = (t, a, b, text) => Math.floor(seg(t, a, b) * text.length + 1e-6);
  function card(c, spr, a, fn) {                       // a: drop-in progress (>= 1 once pinned)
    if (a <= 0) return;
    const k = ease.out(clamp(a)), sc = lerp(1.13, 1, k);
    ctx.save();
    ctx.translate(c.cx, c.cy - (1 - k) * 18); ctx.rotate(c.r + (1 - k) * 0.06 * (c.r >= 0 ? 1 : -1)); ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(a * 3.5);
    ctx.drawImage(spr.c, -c.w / 2 - spr.pad, -c.h / 2 - spr.pad, c.w + 2 * spr.pad, c.h + 2 * spr.pad);
    if (fn) { ctx.translate(-c.w / 2, -c.h / 2); fn(ctx); }
    ctx.restore();
  }
  const drop = (t, t0, d) => (t - t0) / (d || 0.36);
  function stamp(g, st, x, y, rotDeg, t, t0) {
    const u = seg(t, t0, t0 + 0.13); if (u <= 0) return;
    const sc = lerp(1.8, 1, ease.out(u)) * (1 + 0.035 * Math.sin(clamp((t - t0 - 0.13) / 0.2) * Math.PI));
    g.save(); g.translate(x, y); g.rotate(rotDeg * RAD); g.scale(sc, sc); g.globalAlpha = clamp(u * 1.5) * 0.93; g.globalCompositeOperation = 'multiply';
    g.drawImage(st.c, -st.w / 2, -st.h / 2, st.w, st.h); g.restore();
  }
  function rotArrow(g, x, y, rx, ry, rot, alpha) {      // "the shaft keeps turning"
    if (alpha <= 0.01) return;
    g.save(); g.globalAlpha = alpha; g.lineCap = 'round';
    const a0 = 0.2, a1 = Math.PI - 0.42;
    for (const [col, lw] of [['rgba(20,12,4,0.55)', 6.2], ['#ffd23f', 3.4]]) {
      g.strokeStyle = col; g.lineWidth = lw; g.setLineDash([10, 7]); g.lineDashOffset = -rot * 68;
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, a0, a1); g.stroke(); g.setLineDash([]);
    }
    const px = x + rx * Math.cos(a1), py = y + ry * Math.sin(a1), tx = -rx * Math.sin(a1), ty = ry * Math.cos(a1), tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl;
    const head = (s, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(px + ux * 11 * s, py + uy * 11 * s); g.lineTo(px - uy * 6.5 * s - ux * 2, py + ux * 6.5 * s - uy * 2); g.lineTo(px + uy * 6.5 * s - ux * 2, py - ux * 6.5 * s - uy * 2); g.closePath(); g.fill(); };
    head(1.25, 'rgba(20,12,4,0.55)'); head(1, '#ffd23f');
    g.restore();
  }
  function burst(g, x, y, u) {                          // small snap mark at the moment of fracture
    if (u <= 0 || u >= 1) return;
    g.save(); g.globalAlpha = 1 - u; g.strokeStyle = '#fff4c2'; g.lineWidth = 2.6; g.lineCap = 'round';
    const k = ease.out(u);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3, r0 = 9 + k * 6, r1 = 13 + k * 20 * (i % 2 ? 1 : 0.6); g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }

  // ------------------------------------------------------------------ the two mechanism diagrams (schematic)
  const OMEGA = 2.3, PITCH = 16.5;                                    // turns per second (slowed for visibility), flute pitch in px
  const rotOf = (tau, stop) => { tau = Math.max(0, tau); if (tau <= stop) return OMEGA * tau; const u = clamp((tau - stop) / 0.9); return OMEGA * stop + OMEGA * 0.9 * (u - u * u / 2); };
  const spinOf = (tau, stop) => (tau <= 0 ? 0 : clamp(tau / 0.2) * (tau <= stop ? 1 : 1 - clamp((tau - stop) / 0.9)));

  /** TORSION: the tip binds, the shaft keeps turning -> the flutes unwind (plastic deformation) -> fracture near the tip */
  function drawTorsion(g, tau) {
    const TL = 0.55, TF = 1.5, S1 = 26, S2 = 100, SF = 30, STOP = 2.5, hw = A.hwFile;
    const tip = lerp(A.DA - 36, A.DA, ease.out(clamp(tau / TL)));
    const rot = rotOf(tau, STOP), rotL = rotOf(TL, STOP), rotF = rotOf(TF, STOP);
    const locked = tau >= TL, broken = tau >= TF;
    const twist = locked ? Math.min(rot, rotF) - rotL : 0;          // turns the shaft has made relative to the bound tip
    const theta = (s) => (!locked ? rot : rotL + twist * sm((s - S1) / (S2 - S1)) + (broken && s >= SF ? rot - rotF : 0));
    const ph = (s) => s / PITCH - theta(s);
    let base = tip;
    if (!broken) A.file(g, (s) => A.pathA(tip - s), 0, tip + 10, hw, ph, { flEnd: A.FL_END });
    else {
      base = A.DA - 20 * ease.out(clamp((tau - TF) / 0.5));
      A.file(g, (s) => A.pathA(A.DA - s), 0, SF, hw, ph, { flEnd: A.FL_END, tint: 'rgba(214,60,40,0.30)' });
      A.file(g, (s) => A.pathA(base - s), SF + 0.01, base + 10, hw, ph, { flEnd: A.FL_END });
    }
    if (locked) {                                                    // strained, unwinding zone
      const k = twist / (rotF - rotL), y0 = base - S2, y1 = base - S1, lg = g.createLinearGradient(0, y0, 0, y1);
      lg.addColorStop(0, 'rgba(255,150,30,0)'); lg.addColorStop(0.55, `rgba(255,150,30,${0.42 * k})`); lg.addColorStop(1, 'rgba(255,150,30,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(130 - hw(S2) - 2, y0); g.lineTo(130 + hw(S2) + 2, y0); g.lineTo(130 + hw(S1) + 2, y1); g.lineTo(130 - hw(S1) - 2, y1); g.closePath(); g.fill();
      // the grip on the tip
      const a = clamp((tau - TL) / 0.18), pul = 1.5 * Math.sin(Math.min(tau - TL, 0.9) * 14) * (1 - clamp((tau - TL) / 0.9));
      g.save(); g.globalAlpha = a; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const sd of [-1, 1]) {
        const x = 130 + sd * (hw(13) + 9 + pul), y = A.DA - 13;
        for (const [col, lw] of [['rgba(30,10,4,0.6)', 7], ['#ff4b36', 4.2]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x + sd * 12, y - 9); g.lineTo(x, y); g.lineTo(x + sd * 12, y + 9); g.stroke(); }
      }
      g.restore();
    }
    burst(g, 130, A.DA - SF, (tau - TF) / 0.4);
    rotArrow(g, 130, 27, 31, 10.5, rot, spinOf(tau, STOP));
  }

  /** FATIGUE: the file turns while bent -> every turn is a tension/compression cycle at the curve -> crack -> fracture at mid-curve, no change of shape first */
  function drawFatigue(g, tau) {
    const TF = 1.35, STOP = 2.4, B = A.B, hw = A.hwFile, SC = A.DB - B.mid;
    const D = lerp(A.DB - 34, A.DB, ease.out(clamp(tau / 0.5)));
    const rot = rotOf(tau, STOP), rotF = rotOf(TF, STOP), broken = tau >= TF;
    const back = broken ? 17 * ease.out(clamp((tau - TF) / 0.5)) : 0, Dc = broken ? A.DB - back : D;
    if (!broken) A.file(g, (s) => A.pathB(D - s), 0, D + 10, hw, (s) => s / PITCH - rot, { flEnd: A.FL_END });
    else {
      A.file(g, (s) => A.pathB(A.DB - s), 0, SC, hw, (s) => s / PITCH - rotF, { flEnd: A.FL_END, tint: 'rgba(214,60,40,0.30)' });
      A.file(g, (s) => A.pathB(Dc - s), SC + 0.01, Dc + 10, hw, (s) => s / PITCH - rot, { flEnd: A.FL_END });
    }
    // bending stress on the curve: outside of the bend in tension (warm), inside in compression (cool)
    const glow = broken ? 1 - clamp((tau - TF) / 0.3) : clamp((tau - 0.15) / 0.4);
    if (glow > 0) {
      g.save(); g.lineCap = 'round';
      const n = 16;
      for (const [side, col] of [[-1, '255,88,56'], [1, '70,160,255']]) {
        for (const [lw, al] of [[9, 0.22], [3.6, 0.95]]) {
          for (let i = 0; i < n; i++) {
            const v0 = i / n, v1 = (i + 1) / n, d0 = B.Ls + B.arc * v0, d1 = B.Ls + B.arc * v1, p0 = A.pathB(d0), p1 = A.pathB(d1), h0 = hw(D - d0) + 3.2, h1 = hw(D - d1) + 3.2;
            g.strokeStyle = `rgba(${col},${al * glow * Math.pow(Math.sin(Math.PI * (v0 + v1) / 2), 0.8)})`; g.lineWidth = lw;
            g.beginPath(); g.moveTo(p0.x + side * p0.nx * h0, p0.y + side * p0.ny * h0); g.lineTo(p1.x + side * p1.nx * h1, p1.y + side * p1.ny * h1); g.stroke();
          }
        }
      }
      g.restore();
    }
    // fatigue crack growing in from the tension side, at the point of maximum flexure
    if (!broken && tau > 0.55) {
      const cr = 0.74 * Math.pow(clamp((tau - 0.55) / (TF - 0.55)), 1.5), p = A.pathB(D - SC), h = hw(SC);
      const ox = p.x - p.nx * h, oy = p.y - p.ny * h, len = 2 * h * cr;
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      const pts = [[ox, oy], [ox + p.nx * len * 0.4 + p.tx * 1.4, oy + p.ny * len * 0.4 + p.ty * 1.4], [ox + p.nx * len * 0.75 - p.tx * 1.0, oy + p.ny * len * 0.75 - p.ty * 1.0], [ox + p.nx * len, oy + p.ny * len]];
      g.strokeStyle = '#120c08'; g.lineWidth = 2.2; g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
      g.restore();
    }
    // a paint mark on the file: once per turn it passes from the tension side to the compression side
    {
      const sd = SC + 19, p = A.pathB(Dc - sd), h = hw(sd) * 0.8, c = Math.cos(rot * TAU), front = Math.sin(rot * TAU) >= 0;
      const x = p.x - p.nx * h * c, y = p.y - p.ny * h * c, col = mix('#46a0ff', '#ff5838', (c + 1) / 2);
      g.save(); g.globalAlpha = (front ? 1 : 0.3) * clamp(tau / 0.3);
      g.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; g.beginPath(); g.arc(x, y, 3.6, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.3; g.stroke();
      g.restore();
    }
    const pm = A.pathB(B.mid);
    burst(g, pm.x, pm.y, (tau - TF) / 0.4);
    rotArrow(g, B.xs, 27, 31, 10.5, rot, spinOf(tau, STOP));
  }

  // ------------------------------------------------------------------ card overlays (card-local coordinates)
  function titleOverlay(g, t) { stamp(g, ST.caseNotes, 266, 46, 8, t, T.stampCase); }
  function radioOverlay(g, t) {
    const F = G.radio.film, fx = F.x + film.frag[0], fy = F.y + film.frag[1];
    A.stroke(g, A.ring(fx, fy, 32, 27, { a0: -1.9, turns: 1.09, seed: 2, wob: 0.045 }), seg(t, T.circle[0], T.circle[1], ease.inOut), { color: '#ee4734', w: 5.5, alpha: 0.96 });
  }
  function exOverlay(g, isA, t) {
    const E = G.ex;
    g.save(); g.translate(E.photo.x, E.photo.y); g.beginPath(); g.rect(0, 0, A.PH.w, A.PH.h); g.clip();
    if (isA) drawTorsion(g, t - T.tauA); else drawFatigue(g, t - T.tauB);
    g.restore();
    const c1 = isA ? T.capA1 : T.capB1, c2 = isA ? T.capA2 : T.capB2, l1 = isA ? 'tip binds,' : 'flexing in', l2 = isA ? 'shaft turns' : 'a curve';
    A.typed(g, l1, 18, E.cap[0], 31, nType(t, c1[0], c1[1], l1), { seed: isA ? 101 : 111 });
    A.typed(g, l2, 18, E.cap[1], 31, nType(t, c2[0], c2[1], l2), { seed: isA ? 102 : 112 });
    const nt = isA ? T.noteA : T.noteB;
    if (isA) A.marker(g, 'may unwind', 18, E.note, 35, seg(t, nt[0], nt[1]), { rot: -2.5 });
    else A.marker(g, 'often no warning', 13, E.note, 30, seg(t, nt[0], nt[1]), { rot: -1.5 });
    stamp(g, isA ? ST.torsion : ST.fatigue, E.stamp[0] + (isA ? 2 : -4), E.stamp[1], isA ? -6 : 5, t, isA ? T.stampA : T.stampB);
  }
  function operatorOverlay(g, t) {                     // ringed, not ranked: Parashos 2004 compared the operator with instrument design only
    A.stroke(g, A.ring(216, 66, 97, 30, { a0: -2.6, turns: 1.1, seed: 5, wob: 0.04 }), seg(t, T.ring[0], T.ring[1], ease.inOut), { color: C.red, w: 5 });
  }
  const PREV_ITEMS = ['glide path', 'light touch', 'discard early'];
  function prevOverlay(g, t) {
    const P = G.prev;
    stamp(g, ST.prevention, P.stamp[0], P.stamp[1], -4, t, T.stampP);
    PREV_ITEMS.forEach((txt, i) => {
      const [a, b, c] = T.rows[i], y = P.rows[i];
      A.typed(g, txt, P.tx, y, 31, nType(t, a, b, txt), { seed: 120 + i });
      A.stroke(g, [[P.box + 3, y - 15], [P.box + 12, y - 3], [P.box + 35, y - 35]], seg(t, c, c + 0.2, ease.out), { color: C.green, w: 6 });
    });
    // the source belongs to the first row only (resin blocks, ProTaper): it appears with that row, directly under it
    const fa = seg(t, T.rows[0][0], T.rows[0][0] + 0.3);
    if (fa > 0) A.typed(g, 'Berutti 2004, in vitro', P.tx, P.fine, 22, null, { alpha: 0.75 * fa, seed: 63 });
  }
  function progOverlay(g, t) {
    const P = G.prog;
    A.progForm(g, seg(t, T.stampG, T.stampG + 0.3));                   // empty tracks + source line arrive with the scene
    stamp(g, ST.prognosis, P.stamp[0], P.stamp[1], -3.5, t, T.stampG);
    const hd = 'healed, ≥ 1 yr';
    A.typed(g, hd, P.head[0], P.head[1], 31, nType(t, T.head[0], T.head[1], hd), { seed: 131 });
    [['fragment', 91.8, C.red, T.bar1], ['control', 94.5, C.navy, T.bar2]].forEach(([lab, val, col, tt], i) => {
      const u = seg(t, tt[0], tt[1], ease.inOut); if (u <= 0) return;
      const y = P.bars[i], wFull = P.W100 * val / 100;                 // bars are drawn to the true values (0-100 % scale)
      g.save(); g.beginPath(); g.rect(P.x0, y, wFull * u, P.bh); g.clip();
      g.fillStyle = col; g.globalAlpha = 0.94; g.fillRect(P.x0, y, wFull, P.bh);
      g.globalAlpha = 0.14; g.strokeStyle = '#fff'; g.lineWidth = 1.2;
      for (let k = 0; k < 7; k++) { const yy = y + 3 + k * 5.6 + hash(k, i) * 2; g.beginPath(); g.moveTo(P.x0, yy); g.lineTo(P.x0 + wFull, yy + (hash(k, i, 2) - 0.5) * 3); g.stroke(); }
      g.globalAlpha = 1;
      A.typed(g, lab, P.x0 + 10, y + 30, 31, null, { color: '#fbf5e6', seed: 140 + i });
      g.restore();
      const v = seg(t, tt[1] - 0.04, tt[1] + 0.14);                    // the number appears only once the bar has reached its value
      if (v > 0) { const s = val.toFixed(1) + '%', tw = A.typedW(g, s, 31); A.typed(g, s, P.x0 + wFull - 9 - tw, y + 30, 31, null, { color: '#ffffff', alpha: v, seed: 150 + i }); }
    });
    const bx = P.x0 + P.W100 + 12;
    A.stroke(g, [[bx - 6, P.bars[0] + 6], [bx + 4, P.bars[0] + 9], [bx + 5, P.bars[1] + P.bh - 9], [bx - 6, P.bars[1] + P.bh - 6]], seg(t, T.ns[0], T.ns[0] + 0.22, ease.out), { color: C.red, w: 4.5 });
    A.marker(g, 'n.s.', bx + 15, P.bars[1] + 13, 40, seg(t, T.ns[0] + 0.15, T.ns[1]), { color: C.red, rot: -3 });
  }
  function decOverlay(g, t) {
    const D = G.dec, [sx, sy] = D.strip;
    A.stroke(g, [[13, 40], [14, 49], [150, 50], [276, 49], [277, 40]], seg(t, T.brk[0], T.brk[1], ease.inOut), { color: C.red, w: 4.5 });
    g.save(); g.translate(sx, sy);
    const r = 'removed or bypassed, by curve:';
    A.typed(g, r, 9, 33, 31, nType(t, T.rem[0], T.rem[1], r), { seed: 161 });
    const sa = seg(t, T.rem[0], T.rem[0] + 0.3);
    if (sa > 0) A.typed(g, 'Shen 2004, Oral Surg · 72 teeth in all', 14, D.strip[3] - 7, 22, null, { alpha: 0.75 * sa, seed: 83 });
    for (const [x, lab, num, t0] of [[12, 'before', '100%', T.u1], [262, 'beyond', '31%', T.u2]]) {
      A.posIcon(g, x, 40, lab, ease.outBack(seg(t, t0, t0 + 0.2)));
      A.typed(g, lab, x + 50, 75, 31, nType(t, t0 + 0.05, t0 + 0.25, lab), { seed: 170 + x });
      const k = ease.outBack(seg(t, t0 + 0.22, t0 + 0.42));
      if (k > 0) { const lw = A.typedW(g, lab, 31); g.save(); g.translate(x + 50 + lw + 8, 77); g.scale(k, k); g.font = '34px Anton'; g.fillStyle = C.ink; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.globalAlpha = 0.95; g.fillText(num, 0, 0); g.restore(); }
    }
    g.restore();
  }
  function payOverlay(g, t) {
    A.marker(g, 'Infection drives the outcome.', 36, 47, 50, seg(t, T.payText[0], T.payText[1]));
    const pts = []; for (let i = 0; i <= 24; i++) pts.push([38 + i * (720 / 24), 57 + Math.sin(i * 0.9) * 1.3]);
    A.stroke(g, pts, seg(t, T.payLine[0], T.payLine[1], ease.inOut), { color: C.red, w: 5 });
  }

  // ------------------------------------------------------------------ pins, threads, markers (world coordinates)
  const P = {
    radio: toW(K.radio, 326, 14), aTop: toW(K.exA, -5, 12), aBot: toW(K.exA, -5, 536), bTop: toW(K.exB, -5, 12), bBot: toW(K.exB, -5, 536),
    curve: toW(K.curve, -5, 11), big: toW(K.big, -5, 11), noglide: toW(K.noglide, -5, 11), force: toW(K.force, -5, 11),
    reuse: toW(K.reuse, 334, 11), operator: toW(K.operator, 334, 11),
  };
  const THREADS = [
    [A.threadPts([P.radio, P.aTop], 0.03, -3), T.th1], [A.threadPts([P.aTop, P.aBot], 0, -5), T.th2], [A.threadPts([P.aTop, P.bTop], 0.02), T.th3],
    [A.threadPts([P.bTop, P.bBot], 0, -5), T.th4], [A.threadPts([P.bBot, P.curve], 0, -2), T.th5], [A.threadPts([P.curve, P.big], 0, -4), T.th6],
    [A.threadPts([P.aBot, P.noglide], 0, -2), T.th7], [A.threadPts([P.noglide, P.force], 0, -4), T.th8], [A.threadPts([P.big, P.force], 0.018), T.th9],
    [A.threadPts([P.force, P.operator], 0.03), T.th10], [A.threadPts([P.reuse, P.operator], 0, 4), T.th11],
  ];
  const PINS = [
    [toW(K.title, 173, 10), 'yellow', -1], [toW(K.radio, 170, 9), 'white', -1], [P.radio, 'red', -1], [toW(K.bag, 320, 13), 'white', -1],
    [toW(K.prev, 173, 9), 'blue', -1], [toW(K.prog, 264, 9), 'yellow', -1], [toW(K.dec, 514, 152), 'white', -1],
    [P.aTop, 'red', T.A + 0.3], [toW(K.exA, 270, 12), 'blue', T.A + 0.34], [P.aBot, 'red', T.A + 0.38],
    [P.bTop, 'red', T.B + 0.3], [toW(K.exB, 270, 12), 'green', T.B + 0.34], [P.bBot, 'red', T.B + 0.38],
    [P.curve, 'red', T.curve + 0.3], [P.big, 'red', T.big + 0.3], [P.noglide, 'red', T.noglide + 0.3], [P.force, 'red', T.force + 0.3],
    [P.reuse, 'red', T.reuse + 0.3], [P.operator, 'red', T.operator + 0.3],
  ];
  const KNOTS = [[P.radio, T.th1[0]], [P.aTop, T.th1[1]], [P.aBot, T.th2[1]], [P.bTop, T.th3[1]], [P.bBot, T.th4[1]], [P.curve, T.th5[1]], [P.big, T.th6[1]], [P.noglide, T.th7[1]], [P.force, T.th8[1]], [P.operator, T.th10[1]], [P.reuse, T.th11[0]]];
  const TENTS = [
    [toW(K.radio, 40, 324), '1', T.tent1], [toW(K.exA, 36, 322), '2', T.tent2], [toW(K.exB, 36, 322), '3', T.tent3],
    [toW(K.noglide, 256, 12), '4', T.tent4], [toW(K.prev, 30, 14), '5', T.tent5], [toW(K.prog, 498, 24), '6', T.tent6],
  ];

  function light(z) {                                   // desk lamp: warm pool around the centre of attention, darker edges
    const wide = clamp((2.0 - z) / 1.0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const cx = 540, cy = lerp(850, 900, wide);
    ctx.globalCompositeOperation = 'multiply';
    const gr = ctx.createRadialGradient(cx, cy, lerp(240, 560, wide), cx, cy, lerp(1280, 1560, wide));
    gr.addColorStop(0, '#fff3de'); gr.addColorStop(0.45, wide > 0.5 ? '#e9d2b0' : '#d9bd97'); gr.addColorStop(1, wide > 0.5 ? '#7a5a3e' : '#4f3622');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    const gl = ctx.createRadialGradient(cx, cy - 120, 0, cx, cy - 120, 900); gl.addColorStop(0, 'rgba(255,214,150,0.10)'); gl.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ------------------------------------------------------------------ frame
  function render(t) {
    const cam = camera(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#2a1a0d'; ctx.fillRect(0, 0, W, H);
    ctx.translate(540, 960 + shake(t)); ctx.rotate(cam.roll * RAD); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bg, -60, -60, 1200, 2040);

    // forms that are on the board from the start and get filled in as the case builds
    card(K.bag, SP.bag, 1);
    card(K.prev, SP.prev, 1, (g) => prevOverlay(g, t));
    SP.tabs.forEach((s, i) => {                          // folder tabs slide up from behind the folder
      const u = ease.outBack(seg(t, T.tabs[i], T.tabs[i] + 0.3)); if (u <= 0) return;
      ctx.save(); ctx.translate(K.dec.cx, K.dec.cy); ctx.rotate(K.dec.r); ctx.translate(-K.dec.w / 2, -K.dec.h / 2 + (1 - u) * 44);
      ctx.drawImage(s.c, -s.pad, -s.pad, s.w + 2 * s.pad, s.h + 2 * s.pad); ctx.restore();
    });
    card(K.dec, SP.dec, 1, (g) => decOverlay(g, t));
    card(K.prog, SP.prog, 1, (g) => progOverlay(g, t));
    // the case
    card(K.title, SP.title, 1, (g) => titleOverlay(g, t));
    card(K.radio, SP.radio, 1, (g) => radioOverlay(g, t));
    card(K.exA, SP.exA, drop(t, T.A), (g) => exOverlay(g, true, t));
    card(K.exB, SP.exB, drop(t, T.B), (g) => exOverlay(g, false, t));
    // suspects
    for (const k of ['curve', 'big', 'noglide', 'force', 'reuse']) card(K[k], SP[k], drop(t, T[k], 0.32));
    card(K.operator, SP.operator, drop(t, T.operator, 0.32), (g) => operatorOverlay(g, t));
    card(K.pay, SP.pay, drop(t, T.pay, 0.3), (g) => payOverlay(g, t));

    // red thread, knots, pins, evidence markers
    for (const [pts, tt] of THREADS) A.thread(ctx, pts, seg(t, tt[0], tt[1], ease.inOut));
    for (const [p, t0] of KNOTS) A.knot(ctx, p[0], p[1], seg(t, t0, t0 + 0.12));
    for (const [p, col, t0] of PINS) A.pin(ctx, p[0], p[1], col, t0 < 0 ? 1 : ease.outBack(seg(t, t0, t0 + 0.18)));
    for (const [p, lab, t0] of TENTS) { const u = seg(t, t0, t0 + 0.3); if (u > 0) A.tent(ctx, p[0], p[1] - (1 - ease.out(u)) * 26, lab, ease.outBack(u)); }
    light(cam.z);
  }

  window.REEL = {
    title: 'The separated file — case notes',
    duration: DUR,
    poster: 1.5,
    canvas,
    fonts: ['60px "Special Elite"', '50px "Permanent Marker"', '42px Anton', '31px "Archivo Black"', '700 24px "Courier Prime"', 'italic 700 24px "Courier Prime"'],
    setup,
    render,
  };
  Kit.boot(window.REEL);
})();
