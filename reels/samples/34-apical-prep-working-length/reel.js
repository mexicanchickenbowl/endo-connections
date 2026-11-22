/*
 * Reel 34 — Working length and apical preparation size: what the evidence says.
 * Style: whiteboard marker talk. One full-frame canvas; render(t) is a pure function of t.
 * Layers per frame: static board (bg) -> highlighter -> marker ink (per scene, erasable) -> glare -> paper props -> eraser.
 */
(function () {
  const { clamp, lerp, seg, ease, hash, noise1, noise2, rng } = Kit;
  const { S, Scene, INK, FONT, trace, drawText, textWidth, layout, paper, magnet, tape, eraser, hl, rr } = WB;
  const W = 1080, H = 1920, DUR = 25.6;
  const { canvas, ctx } = Kit.createCanvas();
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const bg = mk(), ink = mk(), tex = mk(), glare = mk();
  const ig = ink.getContext('2d');

  // ---------------- timeline (seconds) ----------------
  const P1 = 3.4;      // part 1 "where to stop" begins
  const W1 = 12.0;     // first wipe (eraser's first sweep starts)
  const B0 = 12.5;     // part 2 "how big" begins
  const W2 = 18.6;     // second wipe
  const C0 = 19.1;     // summary begins
  const W3 = 24.52;    // last wipe (board is clean again exactly at DUR)
  const LIFT = 0.3, SW = 0.16, ROWDT = 0.205, WIPE = ROWDT * 3 + SW;   // sweep time, row period, total erase time
  const ROWS = [478, 790, 1102, 1414], EXR = 940, EXL = 140, REST = { x: 852, y: 1663 };

  // ---------------- geometry helpers ----------------
  /** Catmull-Rom through pts (any dimension), ~one sample every `per` px */
  function cr(pts, per = 12) {
    const out = [], n = pts.length, D = pts[0].length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      const m = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / per));
      for (let k = 0; k < m; k++) {
        const u = k / m, u2 = u * u, u3 = u2 * u, q = [];
        for (let d = 0; d < D; d++) q.push(0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3));
        out.push(q);
      }
    }
    out.push(pts[n - 1].slice()); return out;
  }
  /** keep one point every `step` px of arclength (plus both ends) */
  function dec(pts, step) {
    const out = [pts[0]]; let acc = 0;
    for (let i = 1; i < pts.length - 1; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc >= step) { out.push(pts[i]); acc = 0; } }
    out.push(pts[pts.length - 1]); return out.map((p) => [p[0], p[1]]);
  }
  const flat = (pts) => { const a = []; for (const p of pts) a.push(p[0], p[1]); return a; };

  // =====================================================================================
  //  SCENE A — the apex sketch + part 1 "where to stop"
  // =====================================================================================
  const MM = 170;                     // px per millimetre in the apex sketch (schematic)
  const A = new Scene();
  const GA = {};                      // geometry shared with props / dynamic items
  let GHOST = false;                  // true while the static ghost layer is being built (skips moving items)
  function buildA() {
    // canal centre line with half-width (x, y, w): minor constriction at the narrowest point, then the funnel to the foramen
    const C = [[446, 404, 46], [446, 590, 43], [445, 770, 38], [438, 915, 30], [420, 1000, 22], [397, 1056, 13], [366, 1101, 22], [338, 1137, 37]];
    const cl = cr(C, 7), n = cl.length;
    const wIn = [], wOut = [], cum = [0];
    for (let i = 0; i < n; i++) {
      const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const tx = (b[0] - a[0]) / L, ty = (b[1] - a[1]) / L, lx = -ty, ly = tx;        // (lx,ly) points to the viewer's... see note
      // heading down the page (ty>0): (-ty, tx) = (-1, 0) -> screen left = inner side of the curve
      const w = cl[i][2];
      wIn.push([cl[i][0] + lx * w, cl[i][1] + ly * w]); wOut.push([cl[i][0] - lx * w, cl[i][1] - ly * w]);
      cl[i].push(tx, ty);
      if (i) cum.push(cum[i - 1] + Math.hypot(cl[i][0] - cl[i - 1][0], cl[i][1] - cl[i - 1][1]));
    }
    let iC = 0; for (let i = 0; i < n; i++) if (cl[i][2] < cl[iC][2]) iC = i;       // constriction
    let iJ = iC; while (iJ < n - 1 && cum[iJ] - cum[iC] < 24) iJ++;                 // cementum reaches a little way in
    const U = wIn[n - 1], Lw = wOut[n - 1];                                          // lips of the major foramen
    const outL = cr([[250, 404], [253, 590], [262, 770], [279, 915], [297, 1030], U], 10);
    const outR = cr([Lw, [398, 1200], [440, 1225], [488, 1214], [542, 1172], [587, 1092], [613, 975], [628, 800], [636, 600], [640, 404]], 10);
    let tip = outR[0]; for (const p of outR) if (p[1] > tip[1]) tip = p;
    const cdjL = cr([[263, 404], [267, 590], [277, 770], [296, 915], [316, 1005], [338, 1045], [357, 1062], wIn[iJ]], 10);
    const cdjR = cr([[627, 404], [623, 600], [614, 800], [598, 970], [570, 1085], [524, 1158], [476, 1187], [440, 1185], [418, 1160], [407, 1122], wOut[iJ]], 10);
    Object.assign(GA, { cl, cum, iC, tip, U, Lw, yTip: tip[1], xTip: tip[0], con: cl[iC], wIn, wOut, y0: tip[1], y2: tip[1] - 2 * MM, y3: tip[1] - 3 * MM });
    A.fn((g, t) => { if (!GHOST) band(g, t); });      // green highlighter (under the marker ink)

    // ---- anatomy, black marker ----
    A.stroke(S.curve(dec(outL, 80), { roughness: 1.5 }), { t0: 0.12, d: 0.7, w: 8 });
    A.stroke(S.curve(dec(outR, 80), { roughness: 1.5 }), { t0: 0.72, d: 0.85, w: 8 });
    A.stroke(S.curve([[236, 410], [296, 396], [356, 414], [430, 398], [500, 416], [574, 398], [654, 408]], { roughness: 1.4 }), { t0: 1.5, d: 0.3, w: 6 });
    A.stroke(S.curve(dec(wIn, 46), { roughness: 0.8 }), { t0: 1.35, d: 0.55, w: 6.5 });
    A.stroke(S.curve(dec(wOut, 46), { roughness: 0.8 }), { t0: 1.5, d: 0.55, w: 6.5 });
    A.stroke(S.curve(dec(cdjL, 70), { roughness: 0.8 }), { t0: 1.95, d: 0.35, w: 3.6, a: 0.85 });
    A.stroke(S.curve(dec(cdjR, 70), { roughness: 0.8 }), { t0: 2.05, d: 0.45, w: 3.6, a: 0.85 });
    const dL = wIn.slice(0, iJ + 1).concat(cdjL.slice().reverse()), dR = wOut.slice(0, iJ + 1).concat(cdjR.slice().reverse());
    A.stroke(S.hatch(dec(dL, 16), { hachureGap: 19, hachureAngle: -48, roughness: 1.3 }), { t0: 2.15, d: 0.7, w: 3, a: 0.42, e: ease.linear });
    A.stroke(S.hatch(dec(dR, 16), { hachureGap: 19, hachureAngle: -48, roughness: 1.3 }), { t0: 2.25, d: 0.75, w: 3, a: 0.42, e: ease.linear });
    // cementum: finer cross-hatch the other way, so it reads as a separate layer lining the surface and the foramen funnel
    const cemL = outL.concat(wIn.slice(iJ).reverse(), cdjL.slice().reverse()), cemR = outR.concat(cdjR, wOut.slice(iJ));
    A.stroke(S.hatch(dec(cemL, 12), { hachureGap: 12, hachureAngle: 42, roughness: 0.8 }), { t0: 2.5, d: 0.4, w: 2.2, a: 0.34, e: ease.linear });
    A.stroke(S.hatch(dec(cemR, 12), { hachureGap: 12, hachureAngle: 42, roughness: 0.8 }), { t0: 2.6, d: 0.5, w: 2.2, a: 0.34, e: ease.linear });
    // socket wall (lamina dura) around the apex, light
    A.stroke(S.curve([[236, 905], [246, 1010], [258, 1102], [300, 1196], [372, 1250], [446, 1264], [516, 1250], [580, 1200], [628, 1106], [650, 1000]], { roughness: 1.3 }), { t0: 2.6, d: 0.55, w: 4, c: 's', a: 0.55 });

    // ---- labels, blue marker ----
    const lab = (lines, x, y, align, t0, lead, o = {}) => {
      lines.forEach((s, i) => A.text(s, x, y + i * 40, Object.assign({ c: 'b', s: 38, align, t0: t0 + i * 0.16 }, o)));
      if (lead) { A.stroke(S.line(lead[0], lead[1], lead[2], lead[3], { roughness: 0.7 }), { c: 'b', w: 4, t0: t0 + 0.12, d: 0.25 }); A.dot(lead[2], lead[3], 7, { c: 'b', t0: t0 + 0.35 }); }
    };
    const con = cl[iC];
    lab(['minor', 'constriction'], 236, 946, 'right', 2.3, [244, 962, wIn[iC][0] - 2, wIn[iC][1] - 1]);
    lab(['CDJ'], 236, 1070, 'right', 2.65, [244, 1058, wIn[iJ][0] - 3, wIn[iJ][1]]);
    lab(['major', 'foramen'], 236, 1140, 'right', 2.9, [244, 1150, 320, 1132]);
    lab(['radiographic apex'], 478, 1304, 'left', 3.15, [472, 1286, tip[0] + 2, tip[1] + 3]);
    A.text('schematic · not to scale', 70, 392, { c: 's', s: 26, t0: 1.2, d: 0.4, a: 0.9 });

    // ---- part 1, on the sketch ----
    const y0 = tip[1], y2 = y0 - 2 * MM, y3 = y0 - 3 * MM;
    A.stroke(S.line(tip[0] + 14, y0, 664, y0, { roughness: 0.5, bowing: 0.3 }), { c: 'b', w: 4, t0: P1 + 0.7, d: 0.25, dash: [14, 13] });
    // the file (blue), slides down the canal and settles at the constriction, 1 mm short on the ruler
    A.fn((g, t) => {
      const u = GHOST ? 0 : seg(t, P1 + 1.3, P1 + 2.15, ease.out); if (u <= 0) return;
      const sTip = lerp(30, cum[iC] - 3, u);
      const at = (s) => { let i = 1; while (i < n - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1); const a = cl[i - 1], b = cl[i]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[3], b[3], f), lerp(a[4], b[4], f)]; };
      const hw = (d) => 3 + 0.03 * d;
      // edges use the local normal (-ty, tx)
      const eL = [], eR = [];
      for (let s = sTip; s > -60; s -= 9) { const q = at(Math.max(0, s)), w = hw(sTip - s), ext = s < 0 ? s : 0; eL.push([q[0] - q[3] * w, q[1] + q[2] * w + ext]); eR.push([q[0] + q[3] * w, q[1] - q[2] * w + ext]); }
      g.save(); g.beginPath(); g.rect(0, 362, W, 1200); g.clip(); g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(eL[0][0], eL[0][1]); for (const p of eL) g.lineTo(p[0], p[1]); for (let i = eR.length - 1; i >= 0; i--) g.lineTo(eR[i][0], eR[i][1]); g.closePath();
      g.fillStyle = 'rgba(255,255,255,0.9)'; g.fill(); g.fillStyle = 'rgba(26,85,181,0.14)'; g.fill();
      g.strokeStyle = INK.b; g.lineWidth = 4.2; g.beginPath(); for (let i = eL.length - 1; i >= 0; i--) g.lineTo(eL[i][0], eL[i][1]); for (const p of eR) g.lineTo(p[0], p[1]); g.stroke();
      g.lineWidth = 3.4; g.beginPath();                                   // flutes travel with the file
      for (let d = 26; d < sTip + 50; d += 30) { const s1 = sTip - d, s2 = sTip - d - 20; if (s2 < -44) break; const a = at(Math.max(0, s1)), b = at(Math.max(0, s2)), wa = hw(d), wb = hw(d + 20); g.moveTo(a[0] - a[3] * wa, a[1] + a[2] * wa + Math.min(0, s1)); g.lineTo(b[0] + b[3] * wb, b[1] - b[2] * wb + Math.min(0, s2)); }
      g.stroke(); g.restore();
    });
    // emphasis during the hold: the target is circled in green
    A.stroke(S.ellipse(cl[iC][0] + 4, cl[iC][1] - 6, 92, 76, { roughness: 1.3 }), { c: 'g', w: 5.5, t0: P1 + 6.4, d: 0.45 });
    // "long": material beyond the foramen (red)
    const blob = [[326, 1120], [302, 1138], [282, 1168], [280, 1196], [300, 1210], [326, 1198], [346, 1172], [356, 1150]];
    A.stroke(S.hatch(blob, { hachureGap: 8, hachureAngle: 30, roughness: 1 }), { c: 'r', w: 3.6, t0: P1 + 2.55, d: 0.3, e: ease.linear });
    A.stroke(S.curve(blob.concat([blob[0]]), { roughness: 0.9 }), { c: 'r', w: 5, t0: P1 + 2.7, d: 0.3 });
    A.stroke(S.arrow(206, 1290, 268, 1226, { roughness: 0.8, head: 20 }), { c: 'r', w: 5, t0: P1 + 3.05, d: 0.25 });
    // per-millimetre note: a brace spanning one millimetre above the target zone
    const bx = 750;
    A.stroke(S.curve([[bx, y3 + 4], [bx + 9, y3 + 14], [bx + 9, (y2 + y3) / 2 - 12], [bx + 20, (y2 + y3) / 2], [bx + 9, (y2 + y3) / 2 + 12], [bx + 9, y2 - 14], [bx, y2 - 4]], { roughness: 0.6 }), { c: 'r', w: 5, t0: P1 + 4.75, d: 0.3 });
    A.text('per mm short', 894, y3 + 44, { c: 'r', s: 38, align: 'center', t0: P1 + 4.95, d: 0.3 });
    A.text('~12–14%', 894, y3 + 106, { c: 'r', f: 'pm', s: 52, align: 'center', t0: P1 + 5.2, d: 0.3 });
    A.text('lower odds', 894, y3 + 152, { c: 'r', s: 38, align: 'center', t0: P1 + 5.45, d: 0.25 });
    // denominator for the three slips
    A.text('healed · necrotic + lesion · 8–10 yr', 372, 1408, { c: 'k', s: 38, t0: P1 + 4.1, d: 0.55 });
    A.text('Sjögren 1990, J Endod · Chugal 2003, OOOOE · Ng 2011, Int Endod J', 70, 1530, { c: 's', s: 26, t0: P1 + 5.6, d: 0.45 });
  }

  // =====================================================================================
  //  SCENE B — part 2 "how big"
  // =====================================================================================
  const B = new Scene();
  const GB = { cxL: 262, cxR: 800, yT: 440, yWL: 1000, yApex: 1047, tipY: 690 };
  function buildB() {
    const { cxL, cxR, yT, yWL, yApex } = GB;
    const NH = 13;                                   // needle half-width (same needle in both canals)
    const defs = [{ cx: cxL, wt: 33, wa: 11 }, { cx: cxR, wt: 56, wa: 31 }];
    GB.defs = defs;
    defs.forEach((D, k) => {
      const { cx, wt, wa } = D, t0 = B0 + 0.05 + k * 0.12;
      D.w = (y) => lerp(wt, wa, clamp((y - yT) / (yWL - yT)));
      for (const sgn of [-1, 1]) {
        const outer = cr([[cx + sgn * 165, yT - 6], [cx + sgn * 159, 620], [cx + sgn * 141, 800], [cx + sgn * 109, 930], [cx + sgn * 62, 1016], [cx + sgn * 12, yApex]], 10);
        const wall = cr(wa > 16 ? [[cx + sgn * wt, yT - 6], [cx + sgn * D.w(720), 720], [cx + sgn * wa, yWL], [cx + sgn * 13, yWL + 13], [cx + sgn * 9, yWL + 28], [cx + sgn * 12, yApex]]
          : [[cx + sgn * wt, yT - 6], [cx + sgn * D.w(720), 720], [cx + sgn * wa, yWL], [cx + sgn * 9, yWL + 24], [cx + sgn * 12, yApex]], 8);
        B.stroke(S.curve(dec(outer, 80), { roughness: 1.2 }), { t0: t0 + (sgn > 0 ? 0.25 : 0), d: 0.6, w: 8 });
        B.stroke(S.curve(dec(wall, wa > 16 ? 30 : 60), { roughness: 0.6 }), { t0: t0 + 0.55 + (sgn > 0 ? 0.1 : 0), d: 0.45, w: 6.5 });
        B.stroke(S.hatch(dec(outer.concat(wall.slice().reverse()), 16), { hachureGap: 19, hachureAngle: -48, roughness: 1.3 }), { t0: t0 + 0.95 + (sgn > 0 ? 0.12 : 0), d: 0.6, w: 3, a: 0.42, e: ease.linear });
      }
      B.stroke(S.curve([[cx - 180, yT], [cx - 110, yT - 14], [cx - 40, yT + 4], [cx + 40, yT - 12], [cx + 110, yT + 6], [cx + 180, yT - 6]], { roughness: 1.4 }), { t0: t0 + 0.85, d: 0.3, w: 6 });
      // irrigant stream lines (dense, own geometry; dashes march along them in render)
      const ret = (y) => (k === 0 ? (y < GB.tipY ? (D.w(y) + NH) / 2 + 1 : D.w(y) - 7) : D.w(y) - 11);
      D.flow = [-1, 1].map((sgn) => {
        const p = k === 0
          ? [[cx + sgn * 4, GB.tipY + 6], [cx + sgn * 5, 736], [cx + sgn * 9, 760], [cx + sgn * ret(742), 742], [cx + sgn * ret(GB.tipY - 4), GB.tipY - 4], [cx + sgn * ret(600), 600], [cx + sgn * ret(500), 500], [cx + sgn * ret(yT + 12), yT + 12]]
          : [[cx + sgn * 5, GB.tipY + 6], [cx + sgn * 6, 850], [cx + sgn * 9, 946], [cx + sgn * (wa - 11), 982], [cx + sgn * ret(940), 940], [cx + sgn * ret(800), 800], [cx + sgn * ret(650), 650], [cx + sgn * ret(520), 520], [cx + sgn * ret(yT + 12), yT + 12]];
        return WB.mkPolys([flat(cr(p, 8))]);
      });
      // debris specks
      const R = rng(40 + k * 7); D.specks = [];
      for (let i = 0; i < 17; i++) {
        const y = 708 + (i / 16) * 282 + (R() - 0.5) * 14, hw = Math.max(2, D.w(Math.min(y, yWL)) - 9), x = cx + (R() * 2 - 1) * hw;
        D.specks.push({ x, y, r: 4.6 + R() * 2.6, sgn: x < cx ? -1 : 1, stay: k === 0 ? y > 772 : (i === 16 || i === 13), ph: R() });
      }
    });
    // needles + flow + debris (dynamic)
    B.fn((g, t) => {
      if (GHOST) return;
      const uN = seg(t, B0 + 1.15, B0 + 1.75, ease.out), tF = B0 + 1.8;
      g.save(); g.beginPath(); g.rect(0, 366, W, 1300); g.clip();
      defs.forEach((D, k) => {
        const { cx } = D;
        // debris first (under the needle outline)
        const aS = seg(t, B0 + 1.0 + k * 0.1, B0 + 1.45 + k * 0.1);
        if (aS > 0) for (const sp of D.specks) {
          let x = sp.x, y = sp.y, a = aS;
          if (!sp.stay) {
            const te = tF + (k === 0 ? 0.32 : 1.25 * (0.4 + 0.42 * clamp((990 - sp.y) / 290))) + sp.ph * 0.12, tau = t - te;
            if (tau > 0) { const v = tau * tau * 520 + tau * 60; y = sp.y - v; const lane = k === 0 ? (D.w(y) + NH) / 2 : D.w(y) - 12; x = lerp(sp.x, cx + sp.sgn * lane, clamp(tau / 0.35)); a *= clamp((y - 452) / 60); }
          }
          if (a <= 0 || y < 440) continue;
          g.globalAlpha = a; g.fillStyle = INK.r; g.beginPath(); g.ellipse(x, y, sp.r, sp.r * 0.82, sp.ph * 3, 0, 7); g.fill();
        }
        g.globalAlpha = 1;
        // needle: same gauge, same depth in both canals; open-ended (flat) tip
        if (uN > 0) {
          const dy = (1 - uN) * -340, y1 = GB.tipY + dy, yTop = 330 + dy;
          g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(cx - NH, yTop, NH * 2, y1 - yTop);
          g.fillStyle = 'rgba(29,31,37,0.08)'; g.fillRect(cx - NH, yTop, NH * 2, y1 - yTop);
          g.strokeStyle = INK.k; g.lineWidth = 4.6; g.lineCap = 'round'; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(cx - NH + noise1(1.3, k) * 1.5, yTop); g.lineTo(cx - NH - 0.5, y1); g.lineTo(cx + NH + 0.5, y1 + 1); g.lineTo(cx + NH + noise1(2.1, k) * 1.5, yTop); g.stroke();
        }
        // irrigant
        const uF = seg(t, tF, tF + (k === 0 ? 0.5 : 1.25), ease.inOut);
        if (uF > 0) {
          g.strokeStyle = INK.b; g.lineWidth = k === 0 ? 4 : 5.5; g.lineCap = 'round'; g.setLineDash(k === 0 ? [11, 13] : [15, 15]); g.lineDashOffset = -(t - tF) * (k === 0 ? 60 : 150);
          for (const P of D.flow) { trace(g, P, uF); g.stroke(); }
          g.setLineDash([]);
        }
      });
      g.restore();
    });
    // labels
    B.text('<#30', cxL, 1128, { f: 'pm', s: 64, align: 'center', t0: B0 + 1.3, d: 0.3 });
    B.text('≥#30', cxR, 1128, { f: 'pm', s: 64, align: 'center', t0: B0 + 1.5, d: 0.3 });
    B.text('irrigant', 531, 792, { c: 'b', s: 40, align: 'center', t0: B0 + 2.5, d: 0.25 });
    B.text('reaches', 531, 836, { c: 'b', s: 40, align: 'center', t0: B0 + 2.72, d: 0.22 });
    B.text('apical third', 531, 880, { c: 'b', s: 40, align: 'center', t0: B0 + 2.9, d: 0.3 });
    B.stroke(S.carrow([[620, 884], [690, 906], [cxR - 34, 946]], { roughness: 0.7, head: 20 }), { c: 'b', w: 5, t0: B0 + 3.15, d: 0.3 });
    B.text('(in vitro)', 531, 930, { c: 'k', s: 38, align: 'center', t0: B0 + 3.3, d: 0.25 });
    B.text('debris', 482, 1042, { c: 'r', s: 38, align: 'center', t0: B0 + 2.05, d: 0.2 });
    B.stroke(S.carrow([[428, 1026], [360, 1000], [cxL + 20, 962]], { roughness: 0.7, head: 18 }), { c: 'r', w: 4.5, t0: B0 + 2.2, d: 0.25 });
    B.text('schematic · not to scale', 531, 420, { c: 's', s: 26, align: 'center', t0: B0 + 1.2, d: 0.4, a: 0.9 });
    B.text('Khademi 2006 · Boutsioukis 2021 · Saini 2012, J Endod', 70, 1530, { c: 's', s: 26, t0: B0 + 4.2, d: 0.4 });
  }

  // =====================================================================================
  //  SCENE C — summary board
  // =====================================================================================
  const Cs = new Scene();
  const GC = {};
  function buildC() {
    const l1 = 'Infected canals: stop 0–2 mm short', l2 = 'Binding file +3 sizes beat +2';
    const num = (ch, y, t0) => {
      Cs.stroke(S.ellipse(100, y - 19, 62, 60, { roughness: 1.1 }), { c: 'r', w: 5, t0, d: 0.25 });
      Cs.text(ch, 100, y - 2, { f: 'pm', s: 42, c: 'r', align: 'center', t0: t0 + 0.05, d: 0.15 });
    };
    const L = layout(l1, 'ph', 58), i0 = l1.indexOf('0–2'), hx0 = 148 + L.xs[i0] - 8, hx1 = 148 + L.w + 10;
    Cs.fn((g, t) => { if (!GHOST) hl(g, hx0, 414, hx1, 411, 60, 'rgba(255,230,50,0.72)', seg(t, C0 + 0.66, C0 + 0.92, ease.inOut), 8); });
    num('1', 432, C0);
    Cs.text(l1, 148, 432, { s: 58, t0: C0 + 0.08, d: 0.55 });
    Cs.text('healed · necrotic + lesion · 8–10 yr', 84, 712, { s: 38, t0: C0 + 0.9, d: 0.4 });
    const a = 'per mm short: ', b = '~12–14%', c = ' lower odds (2 cohorts)';
    const wa = textWidth(a, 'ph', 40), wb = textWidth(b, 'pm', 46);
    Cs.text(a, 84, 776, { c: 'r', s: 40, t0: C0 + 1.15, d: 0.2 });
    Cs.text(b, 84 + wa, 778, { c: 'r', f: 'pm', s: 46, t0: C0 + 1.3, d: 0.2 });
    Cs.text(c, 84 + wa + wb, 776, { c: 'r', s: 40, t0: C0 + 1.45, d: 0.2 });
    const L2 = layout(l2, 'ph', 58), j0 = l2.indexOf('+3'), j1 = l2.indexOf(' beat');
    Cs.fn((g, t) => { if (!GHOST) hl(g, 148 + L2.xs[j0] - 8, 854, 148 + L2.xs[j1] + 8, 851, 60, 'rgba(255,230,50,0.72)', seg(t, C0 + 2.55, C0 + 2.8, ease.inOut), 9); });
    num('2', 872, C0 + 1.45);
    Cs.text(l2, 148, 872, { s: 58, t0: C0 + 1.52, d: 0.45 });
    Cs.text('≥#30: irrigant reaches apical third (in vitro)', 148, 1196, { c: 'b', s: 38, t0: C0 + 1.85, d: 0.35 });
    Cs.text('Sjögren 1990 · Saini 2012 · Khademi 2006 · Sabeti 2024, J Endod · Chugal 2003, OOOOE · Ng 2011, Int Endod J', 70, 1530, { c: 's', s: 22, t0: C0 + 2.1, d: 0.4 });
  }

  // =====================================================================================
  //  paper props
  // =====================================================================================
  const SLIPS = {
    s94: { w: 244, h: 176, num: '94%', nc: 'g', lab: '0–2 mm short', mag: 'g', seed: 3 },
    s76: { w: 244, h: 176, num: '76%', nc: 'r', lab: 'long', mag: 'r', seed: 5 },
    s68: { w: 244, h: 176, num: '68%', nc: 'r', lab: '>2 mm short', mag: 'r', seed: 8 },
  };
  function drawNumSlip(g, def, st) {
    g.save(); g.translate(st.x, st.y); g.rotate(st.rot); g.scale(st.sc, st.sc); g.globalAlpha = st.al;
    paper(g, def.w, def.h, { lift: st.lift, seed: def.seed, curl: 15 });
    drawText(g, { str: def.num, x: 0, y: 30, f: 'pm', s: 90, c: def.nc, align: 'center', jit: 0.004 }, 1);
    drawText(g, { str: def.lab, x: 0, y: 72, f: 'ph', s: 37, c: 'k', align: 'center' }, 1);
    magnet(g, 0, -def.h / 2 + 21, 19, def.mag, st.pop);
    g.restore();
  }
  /** snap-on state: appears at tIn, slides off (dx) at tOut */
  function snap(t, tIn, tOut, x, y, rot, dx) {
    if (t < tIn || t > tOut + 0.36) return null;
    const u = seg(t, tIn, tIn + 0.3), o = seg(t, tOut, tOut + 0.3, ease.in);
    return { x: x + dx * o, y: y - 26 * (1 - ease.out(u)), rot: (rot + 3 * (1 - ease.out(u)) + o * 5 * Math.sign(dx)) * Math.PI / 180, sc: lerp(1.16, 1, ease.outBack(u)), al: clamp(u * 4), lift: lerp(1, 0.22, ease.out(u)) + o * 0.5, pop: ease.outBack(seg(t, tIn + 0.14, tIn + 0.34)) };
  }
  /** slide-in state (summary): flies in from the right, slides off at tOut */
  function slide(t, tIn, tOut, x, y, rot, dxOut) {
    if (t < tIn || t > tOut + 0.36) return null;
    const u = seg(t, tIn, tIn + 0.5, ease.outQuint), o = seg(t, tOut, tOut + 0.3, ease.in);
    return { x: x + (1 - u) * 760 + dxOut * o, y: y + (1 - u) * 30, rot: (rot + (1 - u) * 7) * Math.PI / 180, sc: 1, al: 1, lift: lerp(0.9, 0.22, u) + o * 0.5, pop: 1 };
  }
  function drawRuler(g, t) {
    if (t < P1 + 0.05 || t > W1 + 0.4) return;
    const u = seg(t, P1 + 0.05, P1 + 0.7, ease.outQuint), o = seg(t, W1 - 0.3, W1 + 0.02, ease.in);
    const { y0 } = GA, cx = 704, top = y0 - 4.32 * MM, bot = y0 + 40, h = bot - top, cy = (top + bot) / 2;
    g.save(); g.translate(cx + (1 - u) * 470 + o * 480, cy); g.rotate(((1 - u) * 5 + 0.5) * Math.PI / 180);
    paper(g, 76, h, { lift: lerp(0.8, 0.2, u), seed: 12 });
    // green target band on the paper (same swipes as on the board)
    g.save(); g.beginPath(); g.rect(-38, -h / 2, 76, h); g.clip(); g.translate(-cx, -cy); band(g, t); g.restore();
    // ticks + numbers (black marker on paper)
    g.strokeStyle = INK.k; g.lineCap = 'round';
    for (let k = 0; k <= 7; k++) {
      const y = y0 - k * MM / 2 - cy, big = k % 2 === 0;
      g.lineWidth = big ? 5 : 3.5; g.beginPath(); g.moveTo(-38, y + noise1(k * 1.7, 4)); g.lineTo(-38 + (big ? 27 : 15), y + noise1(k * 1.7 + 9, 4) * 1.5); g.stroke();
      if (big) drawText(g, { str: String(k / 2), x: 12, y: y + 13, f: 'pm', s: 36, c: 'k', align: 'center', jit: 0.004 }, 1);
    }
    drawText(g, { str: 'mm', x: 0, y: -h / 2 + 88, f: 'ph', s: 36, c: 'k', align: 'center' }, 1);
    magnet(g, 0, -h / 2 + 24, 16, 'b', 1);
    g.restore();
  }
  /** green highlighter band, 0-2 mm short of the radiographic apex: three swipes */
  function band(g, t) {
    const { y0, y2 } = GA, rh = (y0 - y2) / 3, col = 'rgba(105,224,130,0.5)';
    for (let i = 0; i < 3; i++) {
      const u = seg(t, P1 + 0.9 + i * 0.2, P1 + 1.1 + i * 0.2, ease.inOut), y = y2 + rh * (i + 0.5);
      if (i % 2 === 0) hl(g, 744, y, 264, y + 2, rh + 3, col, u, 20 + i); else hl(g, 264, y, 744, y - 2, rh + 3, col, u, 20 + i);
    }
  }
  /** the wide RCT slip: appears in part 2, then moves up into the summary */
  function drawRct(g, t) {
    const tIn = B0 + 3.9; if (t < tIn || t > W3 + 0.4) return;
    const u = seg(t, tIn, tIn + 0.3), m = seg(t, W2 - 0.1, W2 + 0.55, ease.inOut), o = seg(t, W3 - 0.14, W3 + 0.18, ease.in);
    const x = lerp(520, 512, m) - o * 900, y = lerp(1322, 1026, m) - 26 * (1 - ease.out(u)), sc = lerp(1.14, 1, ease.outBack(u)) * lerp(1, 0.94, m);
    g.save(); g.translate(x, y); g.rotate((-0.8 + 3 * (1 - ease.out(u)) + Math.sin(m * Math.PI) * 1.5 - o * 5) * Math.PI / 180); g.scale(sc, sc); g.globalAlpha = clamp(u * 4);
    paper(g, 700, 252, { lift: lerp(1, 0.22, ease.out(u)) + Math.sin(m * Math.PI) * 0.5 + o * 0.5, seed: 21, curl: 18 });
    drawText(g, { str: 'RCT · mand. molars · healed at 12 mo', x: 0, y: -74, f: 'ph', s: 36, c: '#39434f', align: 'center' }, 1);
    drawText(g, { str: 'binding file +2 →', x: -4, y: -2, f: 'ph', s: 44, c: 'k', align: 'right' }, 1);
    drawText(g, { str: '48%', x: 22, y: 8, f: 'pm', s: 78, c: 'r', jit: 0.004 }, 1);
    drawText(g, { str: '+3 or more →', x: -4, y: 86, f: 'ph', s: 44, c: 'k', align: 'right' }, 1);
    drawText(g, { str: '71–92%', x: 22, y: 96, f: 'pm', s: 78, c: 'g', jit: 0.004 }, 1);
    const pop = ease.outBack(seg(t, tIn + 0.14, tIn + 0.34));
    magnet(g, -306, -98, 18, 'b', pop); magnet(g, 306, -98, 18, 'b', pop);
    g.restore();
  }
  function drawTag(g, t) {
    const tIn = C0 + 2.05; if (t < tIn || t > W3 + 0.5) return;
    const u = seg(t, tIn, tIn + 0.3), o = seg(t, W3 - 0.06, W3 + 0.26, ease.in);
    g.save(); g.translate(520 + o * 900, 1352 - 26 * (1 - ease.out(u))); g.rotate((1.2 + 3 * (1 - ease.out(u)) + o * 5) * Math.PI / 180); const sc = lerp(1.16, 1, ease.outBack(u)); g.scale(sc, sc); g.globalAlpha = clamp(u * 4);
    paper(g, 640, 214, { color: '#ffe566', top: '#fff29a', lift: lerp(1, 0.25, ease.out(u)) + o * 0.5, seed: 31, curl: 22 });
    const a = 'Certainty: ', b = 'LOW', wa = textWidth(a, 'pm', 56), wb = textWidth(b, 'pm', 74), x0 = -(wa + wb) / 2;
    drawText(g, { str: a, x: x0, y: 14, f: 'pm', s: 56, c: 'k' }, 1);
    drawText(g, { str: b, x: x0 + wa, y: 18, f: 'pm', s: 74, c: 'r', jit: 0.004 }, 1);
    g.strokeStyle = INK.r; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + wa - 2, 32); g.quadraticCurveTo(x0 + wa + wb / 2, 27, x0 + wa + wb + 4, 31); g.stroke();
    drawText(g, { str: 'cohorts · in vitro · small RCTs', x: 0, y: 78, f: 'ph', s: 42, c: 'k', align: 'center' }, 1);
    magnet(g, 0, -107 + 22, 20, 'k', ease.outBack(seg(t, tIn + 0.14, tIn + 0.34)));
    g.restore();
  }
  function drawProps(g, t) {
    drawRuler(g, t);
    let st;
    if ((st = snap(t, P1 + 1.95, W1 - 0.26, 888, 1008, -1.5, 480))) drawNumSlip(g, SLIPS.s94, st);
    if ((st = snap(t, P1 + 2.95, W1 - 0.2, 200, 1380, -2.2, -480))) drawNumSlip(g, SLIPS.s76, st);
    if ((st = snap(t, P1 + 3.7, W1 - 0.32, 888, 548, 1.8, 480))) drawNumSlip(g, SLIPS.s68, st);
    if ((st = slide(t, C0 + 0.4, W3 - 0.24, 214, 566, -1.6, 1150))) drawNumSlip(g, SLIPS.s94, st);
    if ((st = slide(t, C0 + 0.5, W3 - 0.29, 522, 570, 1.2, 1150))) drawNumSlip(g, SLIPS.s76, st);
    if ((st = slide(t, C0 + 0.6, W3 - 0.34, 830, 564, -0.8, 1150))) drawNumSlip(g, SLIPS.s68, st);
    if (!(t > W2 && t < W2 + WIPE + 0.3)) drawRct(g, t);
    drawTag(g, t);
    tape(g, 176, 1572, 232, 40, -0.02, '@natebrooksendo');
  }

  // =====================================================================================
  //  eraser
  // =====================================================================================
  function eraserAt(t) {
    for (const Wk of [W1, W2, W3]) {
      const a = t - Wk; if (a < -LIFT || a > WIPE + 0.3) continue;
      if (a < 0) { const u = ease.inOut((a + LIFT) / LIFT); return { x: lerp(REST.x, EXR, u), y: lerp(REST.y, ROWS[0], u), rot: u * Math.PI / 2, flip: u }; }
      if (a < WIPE) {
        const i = Math.min(3, Math.floor(a / ROWDT)), s = a - i * ROWDT, xa = i % 2 ? EXL : EXR, xb = i % 2 ? EXR : EXL;
        if (s <= SW) return { x: lerp(xa, xb, ease.smooth(s / SW)), y: ROWS[i], rot: Math.PI / 2, flip: 1 };
        return { x: xb, y: lerp(ROWS[i], ROWS[i + 1], ease.smooth((s - SW) / (ROWDT - SW))), rot: Math.PI / 2, flip: 1 };
      }
      const u = ease.inOut((a - WIPE) / 0.28); return { x: lerp(EXR, REST.x, u), y: lerp(ROWS[3], REST.y, u), rot: (1 - u) * Math.PI / 2, flip: 1 - u };
    }
    return { x: REST.x, y: REST.y, rot: 0, flip: 0 };
  }
  /** rub out the scene ink where the eraser has been (a = seconds since the first sweep began) */
  function eraseMask(g, a) {
    if (a <= 0) return;
    g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 328; g.lineCap = 'butt'; g.strokeStyle = '#000'; g.beginPath();
    for (let i = 0; i < 4; i++) {
      const s = a - i * ROWDT; if (s <= 0) break;
      const xa = i % 2 ? EXL : EXR, xb = i % 2 ? EXR : EXL, x0 = i % 2 ? -30 : W + 30;
      const x1 = s >= SW ? (i % 2 ? W + 30 : -30) : lerp(xa, xb, ease.smooth(s / SW));
      g.moveTo(x0, ROWS[i]); g.lineTo(x1, ROWS[i]);
    }
    g.stroke(); g.restore();
  }

  // =====================================================================================
  //  static board
  // =====================================================================================
  const HDR = { y: 306, s: 62, a: 'WHERE TO STOP?', b: 'HOW BIG?' };
  function makeTex() {
    const hw = W / 2, hh = H / 2, c = mk(hw, hh), g = c.getContext('2d'), id = g.createImageData(hw, hh), d = id.data;
    for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) {
      const n = noise2(x * 0.22 + y * 0.16, y * 0.035 - x * 0.02, 3) * 0.5 + 0.5, f = hash(x, y, 9);
      d[(y * hw + x) * 4 + 3] = (0.03 + 0.15 * n * n + 0.06 * f) * 255;
    }
    g.putImageData(id, 0, 0);
    const tg = tex.getContext('2d'); tg.imageSmoothingEnabled = true; tg.drawImage(c, 0, 0, W, H);
    const R = rng(77); tg.strokeStyle = '#000'; tg.lineCap = 'round';
    for (let i = 0; i < 900; i++) { const x = R() * W, y = R() * H, l = 20 + R() * 90, a = -0.6 + (R() - 0.5) * 0.5; tg.globalAlpha = 0.04 + R() * 0.12; tg.lineWidth = 0.8 + R() * 1.6; tg.beginPath(); tg.moveTo(x, y); tg.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); tg.stroke(); }
  }
  const inkTexture = () => { ig.save(); ig.globalCompositeOperation = 'destination-out'; ig.drawImage(tex, 0, 0); ig.restore(); };
  const clearInk = () => { ig.setTransform(1, 0, 0, 1, 0, 0); ig.globalAlpha = 1; ig.globalCompositeOperation = 'source-over'; ig.setLineDash([]); ig.clearRect(0, 0, W, H); };
  const stamp = (g, alpha = 1) => { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = alpha; g.drawImage(ink, 0, 0); g.restore(); };

  function drawMarker(g, x, y, col, rot, flipX) {
    const L = 148, D = 27;
    g.save(); g.translate(x, y); g.rotate(rot); if (flipX) g.scale(-1, 1);
    g.fillStyle = 'rgba(20,28,36,0.28)'; g.beginPath(); g.ellipse(2, D / 2 + 1, L / 2 - 4, 5, 0, 0, 7); g.fill();
    const cyl = (x0, w, d, base, r) => { const gr = g.createLinearGradient(0, -d / 2, 0, d / 2); gr.addColorStop(0, base[0]); gr.addColorStop(0.3, base[1]); gr.addColorStop(1, base[2]); g.fillStyle = gr; rr(g, x0, -d / 2, w, d, r); g.fill(); };
    cyl(-L / 2 + 6, L - 52, D, ['#ffffff', '#f1f2f3', '#b4bbc1'], 5); g.strokeStyle = 'rgba(60,70,82,0.55)'; g.lineWidth = 1.3; g.stroke();   // barrel
    g.fillStyle = col; g.globalAlpha = 0.9; g.fillRect(-L / 2 + 34, -D / 2 + 1, 46, D - 2); g.globalAlpha = 1;   // label band
    const sh = g.createLinearGradient(0, -D / 2, 0, D / 2); sh.addColorStop(0, 'rgba(255,255,255,0.45)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.28)');
    g.fillStyle = sh; g.fillRect(-L / 2 + 34, -D / 2 + 1, 46, D - 2);
    g.fillStyle = col; rr(g, -L / 2, -D / 2 + 3, 10, D - 6, 3); g.fill();              // end plug
    g.fillStyle = col; rr(g, L / 2 - 50, -D / 2 - 1.5, 50, D + 3, 6); g.fill();         // cap
    g.fillStyle = sh; rr(g, L / 2 - 50, -D / 2 - 1.5, 50, D + 3, 6); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.16)'; for (let i = 0; i < 4; i++) g.fillRect(L / 2 - 44 + i * 6, -D / 2 - 1, 2, D + 2);
    g.restore();
  }

  function paintBg() {
    const g = bg.getContext('2d');
    // wall
    let gr = g.createLinearGradient(0, 1600, 0, H); gr.addColorStop(0, '#c2cbd0'); gr.addColorStop(1, '#a4b0b6'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // board shadow on the wall
    gr = g.createLinearGradient(0, 1640, 0, 1700); gr.addColorStop(0, 'rgba(30,40,50,0.4)'); gr.addColorStop(1, 'rgba(30,40,50,0)'); g.fillStyle = gr; g.fillRect(0, 1640, W, 60);
    // aluminium frame
    gr = g.createLinearGradient(0, 0, W, 0);
    [[0, '#9aa3a9'], [0.006, '#e9edef'], [0.014, '#cdd3d7'], [0.022, '#aab2b8'], [0.978, '#aab2b8'], [0.986, '#d5dadd'], [0.994, '#eef1f2'], [1, '#9aa3a9']].forEach(([p, c]) => gr.addColorStop(p, c));
    g.fillStyle = gr; g.fillRect(0, 0, W, 1642);
    gr = g.createLinearGradient(0, 0, 0, 24); gr.addColorStop(0, '#9aa3a9'); gr.addColorStop(0.3, '#eef1f2'); gr.addColorStop(1, '#b3bbc0'); g.fillStyle = gr; g.fillRect(8, 0, W - 16, 24);
    gr = g.createLinearGradient(0, 1616, 0, 1642); gr.addColorStop(0, '#b9c0c5'); gr.addColorStop(0.35, '#f0f2f3'); gr.addColorStop(1, '#98a1a7'); g.fillStyle = gr; g.fillRect(8, 1616, W - 16, 26);
    // board surface
    const bx = 24, by = 24, bw = W - 48, bh = 1592;
    g.fillStyle = '#f5f6f4'; g.fillRect(bx, by, bw, bh);
    gr = g.createRadialGradient(430, 700, 80, 520, 860, 1150); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(250,251,250,0.6)'); gr.addColorStop(1, 'rgba(222,227,228,0.9)'); g.fillStyle = gr; g.fillRect(bx, by, bw, bh);
    // inner edge shadows
    const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => { const e = g.createLinearGradient(x0, y0, x1, y1); e.addColorStop(0, 'rgba(40,50,60,0.22)'); e.addColorStop(1, 'rgba(40,50,60,0)'); g.fillStyle = e; g.fillRect(rx, ry, rw, rh); };
    edge(bx, 0, bx + 12, 0, bx, by, 12, bh); edge(bx + bw, 0, bx + bw - 10, 0, bx + bw - 10, by, 10, bh); edge(0, by, 0, by + 14, bx, by, bw, 14); edge(0, by + bh, 0, by + bh - 8, bx, by + bh - 8, bw, 8);
    // eraser dust smears + old residue
    g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip(); g.filter = 'blur(26px)';
    const R = rng(5);
    for (let i = 0; i < 26; i++) { const y = 330 + R() * 1240, x = 60 + R() * 300, l = 380 + R() * 560; g.strokeStyle = `rgba(70,85,105,${0.006 + R() * 0.01})`; g.lineWidth = 60 + R() * 120; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + (R() - 0.5) * 120, x + l, y + (R() - 0.5) * 60); g.stroke(); }
    g.restore(); g.filter = 'none';
    // ghosting: faint residue of everything that gets written here (so the loop is seamless)
    const gh = mk(), gg = gh.getContext('2d');
    GHOST = true;
    for (const [sc, tEnd] of [[A, W1 - 0.01], [B, W2 - 0.01], [Cs, W3 - 0.01]]) {
      clearInk(); sc.draw(ig, tEnd);
      gg.globalAlpha = 0.35; gg.drawImage(ink, -5, 0); gg.globalAlpha = 1; gg.drawImage(ink, 0, 0);
    }
    GHOST = false;
    gg.globalAlpha = 1; gg.globalCompositeOperation = 'destination-out'; gg.filter = 'blur(10px)';
    const R2 = rng(19);
    for (let i = 0; i < 70; i++) { const y = 330 + R2() * 1260, x = -100 + R2() * 800, l = 300 + R2() * 600; gg.strokeStyle = `rgba(0,0,0,${0.4 + R2() * 0.55})`; gg.lineWidth = 30 + R2() * 80; gg.lineCap = 'round'; gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + l, y + (R2() - 0.5) * 50); gg.stroke(); }
    gg.filter = 'none';
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.026; g.filter = 'blur(1.6px)'; g.drawImage(gh, 0, 0); g.restore(); g.filter = 'none';

    // header: highlighter + black marker
    const wa = HDR.wa, wb = HDR.wb;
    hl(g, HDR.x1 - 14, HDR.y - 24, HDR.x1 + wa + 16, HDR.y - 27, 66, 'rgba(255,230,50,0.72)', 1, 3);
    hl(g, HDR.x2 - 14, HDR.y - 26, HDR.x2 + wb + 14, HDR.y - 23, 66, 'rgba(255,230,50,0.72)', 1, 4);
    clearInk();
    drawText(ig, { str: HDR.a, x: HDR.x1, y: HDR.y, f: 'pm', s: HDR.s, c: 'k', rot: -0.004 }, 1);
    drawText(ig, { str: HDR.b, x: HDR.x2, y: HDR.y, f: 'pm', s: HDR.s, c: 'k', rot: 0.004 }, 1);
    inkTexture(); stamp(g);

    magnet(g, 912, 118, 17, 'y', 1); magnet(g, 958, 126, 17, 'b', 1); magnet(g, 1002, 116, 17, 'k', 1); magnet(g, 866, 124, 17, 'g', 1);

    // tray
    gr = g.createLinearGradient(0, 1716, 0, 1830); gr.addColorStop(0, 'rgba(25,35,45,0.42)'); gr.addColorStop(1, 'rgba(25,35,45,0)'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(52, 1716); g.lineTo(1040, 1716); g.lineTo(1066, 1830); g.lineTo(80, 1830); g.closePath(); g.fill();
    gr = g.createLinearGradient(0, 1640, 0, 1692); gr.addColorStop(0, '#c9cfd3'); gr.addColorStop(0.2, '#e6e9eb'); gr.addColorStop(1, '#d2d7da'); g.fillStyle = gr; g.fillRect(44, 1640, W - 88, 52);
    gr = g.createLinearGradient(0, 1640, 0, 1654); gr.addColorStop(0, 'rgba(30,40,50,0.3)'); gr.addColorStop(1, 'rgba(30,40,50,0)'); g.fillStyle = gr; g.fillRect(44, 1640, W - 88, 14);
    gr = g.createLinearGradient(0, 1690, 0, 1718); gr.addColorStop(0, '#f4f6f7'); gr.addColorStop(0.12, '#c3c9cd'); gr.addColorStop(1, '#8e979d'); g.fillStyle = gr; g.fillRect(44, 1690, W - 88, 28);
    g.fillStyle = '#4b535a'; rr(g, 34, 1634, 18, 86, 5); g.fill(); rr(g, W - 52, 1634, 18, 86, 5); g.fill();
    g.fillStyle = '#4b535a'; g.fillRect(0, 1612, 26, 30); g.fillRect(W - 26, 1612, 26, 30);
    drawMarker(g, 150, 1672, INK.k, 0.012, false); drawMarker(g, 306, 1673, INK.r, -0.02, true); drawMarker(g, 462, 1672, INK.b, 0.008, false); drawMarker(g, 616, 1673, INK.g, -0.012, false);

    // glare (drawn over the ink each frame)
    const gl = glare.getContext('2d'); gl.save(); gl.beginPath(); gl.rect(bx, by, bw, bh); gl.clip();
    const band2 = (x0, wd, al) => { const e = gl.createLinearGradient(x0, 0, x0 + wd, wd * 0.35); e.addColorStop(0, 'rgba(255,255,255,0)'); e.addColorStop(0.5, `rgba(255,255,255,${al})`); e.addColorStop(1, 'rgba(255,255,255,0)'); gl.fillStyle = e; gl.fillRect(0, 0, W, H); };
    band2(-80, 520, 0.13); band2(560, 260, 0.07);
    gl.restore();
  }

  // =====================================================================================
  //  frame
  // =====================================================================================
  function underline(sc, x, w, t0) {
    sc.stroke(S.line(x - 4, HDR.y + 27, x + w + 6, HDR.y + 23, { roughness: 1.1 }), { c: 'r', w: 6, t0, d: 0.22 });
    sc.stroke(S.line(x + w * 0.2, HDR.y + 39, x + w + 2, HDR.y + 35, { roughness: 1.1 }), { c: 'r', w: 5, t0: t0 + 0.16, d: 0.18 });
  }
  function drawScene(g, sc, t, wipeAt) {
    clearInk(); sc.draw(ig, t); inkTexture(); if (wipeAt != null) eraseMask(ig, t - wipeAt); stamp(g);
  }

  window.REEL = {
    title: 'Working length & apical size',
    duration: DUR,
    poster: 23.7,
    canvas,
    fonts: ['400 62px "Permanent Marker"', '400 40px "Patrick Hand"'],
    setup() {
      HDR.wa = textWidth(HDR.a, 'pm', HDR.s); HDR.wb = textWidth(HDR.b, 'pm', HDR.s); HDR.x1 = 72; HDR.x2 = 1008 - HDR.wb;
      makeTex(); buildA(); buildB(); buildC();
      underline(A, HDR.x1, HDR.wa, P1 - 0.05);
      underline(B, HDR.x2, HDR.wb, B0 - 0.05);
      underline(Cs, HDR.x1, HDR.wa, C0); underline(Cs, HDR.x2, HDR.wb, C0 + 1.4);
      paintBg();
    },
    render(t) {
      t = ((t % DUR) + DUR) % DUR;
      const g = ctx;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      g.drawImage(bg, 0, 0);
      // ink
      if (t < W1 + WIPE + 0.02) drawScene(g, A, t, W1);
      if (t > B0 - 0.1 && t < W2 + WIPE + 0.02) drawScene(g, B, t, W2);
      if (t > C0 - 0.05) drawScene(g, Cs, t, W3);
      g.drawImage(glare, 0, 0);
      drawProps(g, t);
      // eraser (with a short motion trail while it sweeps)
      const e = eraserAt(t);
      if (e.flip > 0.98) for (let k = 3; k >= 1; k--) { const p = eraserAt(t - k / 110); eraser(g, p.x, p.y, p.rot, p.flip, 0.16); }
      eraser(g, e.x, e.y, e.rot, e.flip, 1);
      if (t > W2 && t < W2 + WIPE + 0.3) drawRct(g, t);
    },
  };
  Kit.boot(REEL);
})();
