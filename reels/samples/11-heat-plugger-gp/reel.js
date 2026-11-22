/*
 * Reel 11 — "How far past the plugger tip does gutta-percha soften?"
 * Style: SIMULATED thermal (infrared) camera — ironbow palette, °C colour bar, spot meters, isotherm overlay,
 * edge-enhanced ("MSX-like") outlines, sensor noise, Share Tech Mono HUD. Labelled on screen as a simulation.
 * The temperature field is a precomputed toy heat model (sim.js); render(t) is a pure function of t.
 */
(function () {
  const { W, H, clamp, lerp, seg, env, ease } = Kit;
  const { canvas, ctx } = Kit.createCanvas();

  // ---------------------------------------------------------------- style
  const MONO = '"Share Tech Mono", "JetBrains Mono", "DejaVu Sans Mono", monospace';
  const F = (px) => `400 ${px}px ${MONO}`;
  const COL = {
    cyan: '#46f8d4', cyanRGB: [70, 248, 212], hot: '#ffd35c', white: '#f7f3ff', amber: '#ffb04a',
    dim: 'rgba(236,230,255,0.82)', faint: 'rgba(236,230,255,0.66)', fine: 'rgba(236,230,255,0.84)', panel: 'rgba(8,3,19,0.80)',
    red: '#ff4b4b', pink: '#ff8f8f', halo: 'rgba(8,3,19,0.72)',
  };

  // ---------------------------------------------------------------- palette (ironbow, log-like scale)
  const T0 = 25, A = 5, TMAX = 200, LNR = Math.log((TMAX - T0) / A);
  const vOf = (T) => (T <= T0 + A ? 0 : Math.min(1, Math.log((T - T0) / A) / LNR));
  const IRONBOW = [[0, '#000000'], [0.07, '#0a0526'], [0.17, '#25095f'], [0.27, '#560e89'], [0.37, '#8c1488'],
    [0.47, '#bf275f'], [0.56, '#df4530'], [0.66, '#f17612'], [0.77, '#faae1c'], [0.88, '#fde36c'], [1, '#ffffff']];
  const LUT_T0 = 15, LUT_STEP = 0.05, LUT_N = Math.round((230 - LUT_T0) / LUT_STEP);
  const LUT = new Uint8ClampedArray(LUT_N * 3);
  for (let k = 0; k < LUT_N; k++) {
    const c = Kit.colormap(IRONBOW, vOf(LUT_T0 + k * LUT_STEP));
    LUT[3 * k] = c[0]; LUT[3 * k + 1] = c[1]; LUT[3 * k + 2] = c[2];
  }
  const ISO_T = 60;

  // ---------------------------------------------------------------- timeline (reel seconds)
  const TL = {
    dur: 24, heatOn: 2.4,
    plugA: 0.3, plugB: 1.6,            // cold plugger descends to the orifice (whole-tooth view)
    kbA: 0.5, kbB: 2.4,                // slow Ken-Burns push-in during the hook
    zoomA: 2.4, zoomB: 4.4,            // plunge-locked zoom (camera follows the tip)
    hook: [0, 4.05], s2: [4.05, 9.45], s3: [9.45, 13.75], s4: [13.75, 18.95], s5: [18.95, 24.3],
    offA: 23.6, offB: 23.97,           // camera power-down (loops black-to-black into the boot)
  };
  const RATE = 0.65;                       // playback rate after the plunge (slow motion)
  const B1 = 1.8, B2 = 2.3, BL = B2 - B1, TAU_B2 = B1 + BL - (1 - RATE) * BL / 2;
  function tauAt(t) {                      // reel time -> model (physical) time
    if (t < TL.heatOn) return 0;
    const a = t - TL.heatOn;
    if (a < B1) return a;
    if (a < B2) { const x = a - B1; return B1 + x - (1 - RATE) * x * x / (2 * BL); }
    return TAU_B2 + (a - B2) * RATE;
  }
  function reelAt(tau) {                   // inverse of tauAt
    if (tau < B1) return TL.heatOn + tau;
    if (tau < TAU_B2) { const d = tau - B1, q = (1 - RATE) / (2 * BL); return TL.heatOn + B1 + (1 - Math.sqrt(1 - 4 * q * d)) / (2 * q); }
    return TL.heatOn + B2 + (tau - TAU_B2) / RATE;
  }
  const rateAt = (t) => { const a = t - TL.heatOn; return a < B1 ? 1 : a < B2 ? 1 - (1 - RATE) * (a - B1) / BL : RATE; };

  // ---------------------------------------------------------------- model + precomputed series
  let SIM, P, nx, ny, N, OFF, cur, blend, holdBuf, REACH, REACHMAX, SP1, SP2, TMAXF, HOLD, T_OFF, T_STALL, AX1, AX2, HOLD_U74;
  const SP1_POS = [0.05, 2.0];
  let SP2_POS;
  const RS = 4, FW = W / RS, FH = H / RS;  // field raster resolution (270 x 480), upscaled -> soft IR look
  const fcan = document.createElement('canvas'); fcan.width = FW; fcan.height = FH;
  const fctx = fcan.getContext('2d');
  const img = fctx.createImageData(FW, FH);
  const VIG = new Float32Array(FW * FH), FPN = new Float32Array(FW);

  // camera: hook = whole tooth with a slow push-in; then a zoom locked to the plunging tip; final = apical ~10 mm
  const VF = { S: 100, X0: 470, Y0: 1400 };
  const VK = { S: 36, yOr: 940 };          // end of the hook push-in
  function tipAt(t, tau) {
    if (t < TL.heatOn) return lerp(37, P.wStart, seg(t, TL.plugA, TL.plugB, ease.out));
    return SIM.plugState(tau).wTip;
  }
  function viewAt(t) {
    if (t < TL.zoomA) {
      const u = seg(t, TL.kbA, TL.kbB, ease.inOut);
      const S = lerp(34, VK.S, u);
      const yOr = lerp(966.8, VK.yOr, u);                            // orifice screen y
      return { S, X0: 540, Y0: yOr + 14 * S };
    }
    const u = seg(t, TL.zoomA, TL.zoomB, ease.inOut);
    const S = Math.exp(lerp(Math.log(VK.S), Math.log(VF.S), u));
    const wTip = SIM.plugState(tauAt(Math.min(t, TL.zoomB))).wTip;
    const yTip = lerp(VK.yOr, VF.Y0 - P.wEnd * VF.S, u);           // keep the tip at y ~940-1000 during the plunge
    let X0 = lerp(540, VF.X0, u);
    X0 += 50 * seg(t, TL.s5[0], TL.s5[0] + 0.7, ease.inOut);       // small pan right for the takeaway labels
    return { S, X0, Y0: yTip + wTip * S };
  }
  const sx = (v, u) => v.X0 + u * v.S;
  const sy = (v, w) => v.Y0 - w * v.S;

  function h3(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1440662683)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296;
  }

  function fieldAt(tau) {
    if (tau <= 0) return SIM.base;
    const f = tau / SIM.snapDt; const k = Math.floor(f); const n = SIM.snaps.length;
    if (k >= n - 1) return SIM.snaps[n - 1];
    const a = SIM.snaps[k], b = SIM.snaps[k + 1], u = f - k;
    for (let c = 0; c < N; c++) cur[c] = a[c] + (b[c] - a[c]) * u;
    return cur;
  }
  function holdAt(tau) {                   // camera max-hold (reset at the end of the plunge)
    const f = clamp(tau / SIM.snapDt, 0, HOLD.length - 1); const k = Math.floor(f);
    if (k >= HOLD.length - 1) return HOLD[HOLD.length - 1];
    const a = HOLD[k], b = HOLD[k + 1], u = f - k;
    for (let c = 0; c < N; c++) holdBuf[c] = a[c] + (b[c] - a[c]) * u;
    return holdBuf;
  }
  function sampleField(Fd, u, w) {
    u = Math.abs(u);
    const fi = u / P.dx - 0.5, fj = (w - P.w0) / P.dx - 0.5;
    let i0 = Math.floor(fi); const fx = fi - i0; const i1 = i0 + 1; if (i0 < 0) i0 = 0;
    const j0 = Math.floor(fj), fy = fj - j0;
    const c00 = j0 * nx + i0, c10 = j0 * nx + i1;
    const a = Fd[c00] * (1 - fx) + Fd[c10] * fx, b = Fd[c00 + nx] * (1 - fx) + Fd[c10 + nx] * fx;
    return a + (b - a) * fy;
  }
  const series = (arr, tau) => {          // interpolate a per-snapshot series at model time tau
    const f = clamp(tau / SIM.snapDt, 0, arr.length - 1); const k = Math.floor(f);
    return k >= arr.length - 1 ? arr[arr.length - 1] : lerp(arr[k], arr[k + 1], f - k);
  };

  function setup() {
    SIM = HeatSim.run();
    P = SIM.P; nx = SIM.nx; ny = SIM.ny; N = nx * ny;
    cur = new Float32Array(N); blend = new Float32Array(N); holdBuf = new Float32Array(N);
    // apparent-temperature offsets (emissivity contrast) so anatomy reads at body temperature
    OFF = new Float32Array(N);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const c = j * nx + i, m = SIM.mat[c];
      const u = P.u0 + (i + 0.5) * P.dx, w = P.w0 + (j + 0.5) * P.dx;
      const n = Kit.noise2(u * 1.4, w * 1.4, 7) * 0.5 + Kit.noise2(u * 4, w * 4, 3) * 0.2;
      OFF[c] = m === SIM.MAT.TISSUE ? -0.95 + 0.35 * n : m === SIM.MAT.DENTIN ? 0.15 * n : m === SIM.MAT.GP ? 1.8 : 0;
    }
    SP2_POS = [SIM.rootHalf(4.75) + 0.15, 4.75];
    const n = SIM.snaps.length;
    REACH = new Float32Array(n); REACHMAX = new Float32Array(n); SP1 = new Float32Array(n); SP2 = new Float32Array(n);
    let mx = 0;
    TMAXF = new Float32Array(N).fill(-1e9);
    HOLD = [];
    AX1 = 0; AX2 = 0;
    for (let k = 0; k < n; k++) {
      const Fd = SIM.snaps[k], tau = k * SIM.snapDt, tip = SIM.plugState(tau).wTip;
      let r = 0;
      if (tau >= P.tPlunge) {
        for (let d = 0.02; d < 3; d += 0.01) { if (sampleField(Fd, 0.05, tip - d) >= ISO_T) r = d; else break; }
        mx = Math.max(mx, r);
        for (let c = 0; c < N; c++) if (Fd[c] > TMAXF[c]) TMAXF[c] = Fd[c];
        AX1 = Math.max(AX1, sampleField(Fd, 0.05, P.wEnd - 1)); AX2 = Math.max(AX2, sampleField(Fd, 0.05, P.wEnd - 2));
      }
      HOLD.push(tau >= P.tPlunge ? TMAXF.slice() : Fd);
      REACH[k] = r; REACHMAX[k] = mx;
      SP1[k] = sampleField(Fd, SP1_POS[0], SP1_POS[1]);
      SP2[k] = sampleField(Fd, SP2_POS[0], SP2_POS[1]);
    }
    T_OFF = reelAt(P.tOff);
    HOLD_U74 = 0.05; while (HOLD_U74 < 3 && sampleField(TMAXF, HOLD_U74 + 0.02, 7.4) >= ISO_T) HOLD_U74 += 0.02;
    let kS = n - 1; while (kS > 0 && REACHMAX[kS - 1] > REACHMAX[n - 1] - 0.005) kS--;
    T_STALL = reelAt(kS * SIM.snapDt);
    for (let py = 0; py < FH; py++) for (let px = 0; px < FW; px++) {
      const dx = (px - FW / 2) / (FW / 2), dy = (py - FH / 2) / (FH / 2);
      VIG[py * FW + px] = 1 - 0.26 * Math.pow(Math.min(1, (dx * dx * 0.9 + dy * dy * 0.6)), 1.4);
    }
    const r = Kit.rng(11);
    for (let px = 0; px < FW; px++) FPN[px] = (r() - 0.5) * 0.18;
    window.__REEL11 = { T_OFF, T_STALL, AX1, AX2, HOLD_U74, reach: REACHMAX[n - 1], sp1: Math.max(...SP1) - 37, sp2: Math.max(...SP2) - 37 };
  }

  // ---------------------------------------------------------------- plugger (analytic shape, model temperature)
  const plugTemp = (d, tau) => P.T_body + (SIM.plugState(tau).Tsrc - P.T_body) * SIM.plugProfile(d);
  const plugTempMax = (d) => P.T_body + (SIM.plugState(P.tOff - 1e-6).Tsrc - P.T_body) * SIM.plugProfile(d);

  // ---------------------------------------------------------------- thermal raster
  function rasterField(t, v, Fd, tau, wTip, hatchA, mh, cut) {
    const data = img.data, fr = Math.round(t * 30);
    const dxm = P.dx;
    for (let py = 0; py < FH; py++) {
      const y = py * RS + RS / 2, w = (v.Y0 - y) / v.S;
      const hidden = y > cut;
      const o0 = 4 * py * FW;
      if (hidden) { for (let px = 0; px < FW; px++) { const o = o0 + 4 * px; data[o] = data[o + 1] = data[o + 2] = 0; data[o + 3] = 255; } continue; }
      const fj = (w - P.w0) / dxm - 0.5, j0 = Math.floor(fj), fy = fj - j0;
      const jOK = j0 >= 0 && j0 + 1 < ny;
      const d = w - wTip, ph = d >= 0 ? SIM.plugHalf(d) : -1;
      const pT = d >= 0 ? lerp(plugTemp(d, tau), plugTempMax(d), mh) : 0;
      const gumRow = w > P.crest - 0.3 && w < P.crest + 1.8;
      const Rt = w <= P.cej ? SIM.rootHalf(w) : SIM.crownHalf(w);
      const gpHalf = w >= 0 && w <= P.orifice ? SIM.canalHalf(w) + 0.02 : -1;   // hatch only inside the GP column
      for (let px = 0; px < FW; px++) {
        const x = px * RS + RS / 2, u = Math.abs(x - v.X0) / v.S;
        let T, plug = false;
        if (u < ph) { T = pT; plug = true; }
        else if (gumRow && u > Rt + 0.03) {                     // soft-tissue margin, drawn analytically (smooth)
          const b = clamp((w - SIM.gumLine(u) + 0.06) / 0.12);
          T = 36.05 + (P.T_air - 36.05) * b;
        }
        else if (jOK && u < 5.85) {
          const fi = u / dxm - 0.5; let i0 = Math.floor(fi); const fx = fi - i0; const i1 = i0 + 1; if (i0 < 0) i0 = 0;
          const c00 = j0 * nx + i0, c10 = j0 * nx + i1, c01 = c00 + nx, c11 = c10 + nx;
          const a = (Fd[c00] + OFF[c00]) * (1 - fx) + (Fd[c10] + OFF[c10]) * fx;
          const b = (Fd[c01] + OFF[c01]) * (1 - fx) + (Fd[c11] + OFF[c11]) * fx;
          T = a + (b - a) * fy;
        } else T = w < SIM.gumLine(u) ? 36.05 : P.T_air;
        T += (h3(px, py, fr) - 0.5) * 0.75 + FPN[px];          // sensor noise (temporal + fixed pattern)
        let k = ((T - LUT_T0) / LUT_STEP) | 0; if (k < 0) k = 0; else if (k >= LUT_N) k = LUT_N - 1;
        let r = LUT[3 * k], g = LUT[3 * k + 1], b = LUT[3 * k + 2];
        if (hatchA > 0 && !plug && u < gpHalf && T >= ISO_T && ((px + py) & 7) < 3) {  // isotherm hatch (GP only)
          const m = 0.42 * hatchA; r += (COL.cyanRGB[0] - r) * m; g += (COL.cyanRGB[1] - g) * m; b += (COL.cyanRGB[2] - b) * m;
        }
        const vg = VIG[py * FW + px], o = o0 + 4 * px;
        data[o] = r * vg; data[o + 1] = g * vg; data[o + 2] = b * vg; data[o + 3] = 255;
      }
    }
    fctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(fcan, 0, 0, W, H);
  }
  function scanLine(yy, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, yy - 60, 0, yy + 4);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,240,220,0.35)');
    ctx.fillStyle = g; ctx.fillRect(0, yy - 60, W, 64); ctx.restore();
  }

  // ---------------------------------------------------------------- overlays
  function polyline(v, pts, sign) {
    ctx.beginPath();
    pts.forEach(([u, w], i) => { const X = sx(v, sign * u), Y = sy(v, w); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  }
  let OUTLINE = null;
  function outlines() {
    if (OUTLINE) return OUTLINE;
    // outer: occlusal rim -> cusp tip -> buccal/lingual profile -> CEJ -> root -> foramen (one continuous side)
    const outer = SIM.CROWN_OUTER.slice().reverse();
    for (let w = P.cej - 0.1; w > SIM.W_FOR + 0.25; w -= 0.1) outer.push([SIM.rootHalf(w), w]);
    for (let w = SIM.W_FOR + 0.25; w > SIM.W_FOR; w -= 0.02) outer.push([SIM.rootHalf(w), w]);
    outer.push([SIM.apicalHalf(SIM.W_FOR), SIM.W_FOR]);
    // canal: rim -> access funnel -> prepared canal -> apical seat at WL -> unprepared apical canal -> foramen
    const canal = SIM.ACCESS_WALL.slice();
    for (let w = P.orifice - 0.1; w > 0; w -= 0.1) canal.push([SIM.canalHalf(w), w]);
    canal.push([SIM.canalHalf(0), 0], [SIM.apicalHalf(-0.001), 0]);
    for (let w = -0.1; w > SIM.W_FOR; w -= 0.1) canal.push([SIM.apicalHalf(w), w]);
    canal.push([SIM.apicalHalf(SIM.W_FOR), SIM.W_FOR]);
    const gp = [];                              // GP column polygon (for clipping the isotherm)
    for (let w = 0; w <= P.orifice + 1e-6; w += 0.1) gp.push([SIM.canalHalf(w), w]);
    OUTLINE = { outer, canal, gp };
    return OUTLINE;
  }
  function drawAnatomy(v, a) {
    const { outer, canal } = outlines();
    ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 7;
    for (const s of [1, -1]) { polyline(v, outer, s); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.lineWidth = 2;
    for (const s of [1, -1]) { polyline(v, outer, s); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 1.6;
    for (const s of [1, -1]) { polyline(v, canal, s); ctx.stroke(); }
    // apical end of the GP at WL (against the apical seat)
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(sx(v, -SIM.apicalHalf(-0.001)), sy(v, 0)); ctx.lineTo(sx(v, SIM.apicalHalf(-0.001)), sy(v, 0)); ctx.stroke();
    // alveolar crest (bone margin)
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
    for (const s of [1, -1]) {
      ctx.beginPath(); ctx.moveTo(sx(v, s * (SIM.rootHalf(P.crest) + 0.15)), sy(v, P.crest));
      ctx.quadraticCurveTo(sx(v, s * 4.2), sy(v, P.crest - 0.6), sx(v, s * 7), sy(v, P.crest - 0.9)); ctx.stroke();
    }
    ctx.restore();
  }
  function drawPlugger(v, wTip, a) {
    const pts = [];
    const dTop = (v.Y0 / v.S) - wTip + 1;   // up to above the top of the screen
    for (let d = 0; d <= dTop; d += d < 0.3 ? 0.02 : 0.25) pts.push([SIM.plugHalf(d), wTip + d]);
    ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.62)'; ctx.lineWidth = 2;
    for (const s of [1, -1]) { polyline(v, pts, s); ctx.stroke(); }
    ctx.restore();
  }

  // marching squares on the mirrored axisymmetric grid -> isotherm polyline segments (screen coords)
  function isoSegments(v, Fd, level) {
    const segs = [];
    const wA = (v.Y0 - (H + 40)) / v.S, wB = (v.Y0 + 40) / v.S;         // visible w range (bottom, top)
    const jMin = Math.max(0, Math.floor((Math.min(wA, wB) - P.w0) / P.dx) - 1);
    const jMax = Math.min(ny - 2, Math.ceil((Math.max(wA, wB) - P.w0) / P.dx) + 1);
    const iMax = 48;
    const val = (ii, j) => Fd[j * nx + (ii < 0 ? -ii - 1 : ii)];
    const X = (ii) => sx(v, (ii + 0.5) * P.dx), Y = (j) => sy(v, P.w0 + (j + 0.5) * P.dx);
    const LUTS = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 2], [0, 1]], 6: [[0, 2]], 7: [[3, 2]],
      8: [[2, 3]], 9: [[0, 2]], 10: [[0, 3], [1, 2]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[0, 3]] };
    for (let j = jMin; j < jMax; j++) {
      for (let ii = -iMax; ii < iMax - 1; ii++) {
        const a = val(ii, j), b = val(ii + 1, j), c = val(ii + 1, j + 1), d = val(ii, j + 1);
        const idx = (a >= level ? 1 : 0) | (b >= level ? 2 : 0) | (c >= level ? 4 : 0) | (d >= level ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        const x0 = X(ii), x1 = X(ii + 1), y0 = Y(j), y1 = Y(j + 1);
        const e = [
          [lerp(x0, x1, (level - a) / (b - a)), y0],   // bottom edge (a-b)
          [x1, lerp(y0, y1, (level - b) / (c - b))],   // right edge (b-c)
          [lerp(x0, x1, (level - d) / (c - d)), y1],   // top edge (d-c)
          [x0, lerp(y0, y1, (level - a) / (d - a))],   // left edge (a-d)
        ];
        for (const [p, q] of LUTS[idx]) segs.push(e[p][0], e[p][1], e[q][0], e[q][1]);
      }
    }
    return segs;
  }
  function gpPath(v) {
    const { gp } = outlines();
    ctx.beginPath();
    gp.forEach(([u, w], i) => (i ? ctx.lineTo(sx(v, u), sy(v, w)) : ctx.moveTo(sx(v, u), sy(v, w))));
    for (let i = gp.length - 1; i >= 0; i--) ctx.lineTo(sx(v, -gp[i][0]), sy(v, gp[i][1]));
    ctx.closePath();
  }
  // isotherm: full strength inside the GP column only; the dentin part of the same line is drawn faint
  function drawIso(v, Fd, a, ghost = false) {
    if (a <= 0) return;
    const s = isoSegments(v, Fd, ISO_T);
    if (!s.length) return;
    const path = () => { ctx.beginPath(); for (let i = 0; i < s.length; i += 4) { ctx.moveTo(s[i], s[i + 1]); ctx.lineTo(s[i + 2], s[i + 3]); } };
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
    // outside the GP column (dentin): faint
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); gpPathAppend(v); ctx.clip('evenodd');
    path(); ctx.strokeStyle = 'rgba(70,248,212,0.34)'; ctx.lineWidth = 2; if (ghost) ctx.setLineDash([2, 8]); ctx.stroke();
    ctx.restore();
    // inside the GP column: strong
    ctx.save(); gpPath(v); ctx.clip();
    if (ghost) {
      path(); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 6; ctx.stroke();
      path(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3.4; ctx.setLineDash([2, 8]); ctx.stroke();
    } else {
      path(); ctx.strokeStyle = 'rgba(70,248,212,0.25)'; ctx.lineWidth = 11; ctx.stroke();
      path(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3.4; ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }
  function gpPathAppend(v) {               // same polygon as gpPath, appended to the current path
    const { gp } = outlines();
    gp.forEach(([u, w], i) => (i ? ctx.lineTo(sx(v, u), sy(v, w)) : ctx.moveTo(sx(v, u), sy(v, w))));
    for (let i = gp.length - 1; i >= 0; i--) ctx.lineTo(sx(v, -gp[i][0]), sy(v, gp[i][1]));
    ctx.closePath();
  }

  // ---------------------------------------------------------------- text helpers
  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function txt(s, x, y, px, color, align = 'left', spacing = 0, halo = false) {
    ctx.font = F(px); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = spacing + 'px';
    if (halo) { ctx.save(); ctx.strokeStyle = COL.halo; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); ctx.restore(); }
    ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
  }
  const ftxt = (s, x, y, px, color, align = 'left') => txt(s, x, y, px, color, align, 0, true);   // in-field label
  function rich(parts, x, y, px, halo = false) {   // [[text, color], ...] on one line, left aligned
    ctx.font = F(px); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
    let cx = x;
    for (const [s, c] of parts) {
      if (halo) { ctx.save(); ctx.strokeStyle = COL.halo; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeText(s, cx, y); ctx.restore(); }
      ctx.fillStyle = c; ctx.fillText(s, cx, y); cx += ctx.measureText(s).width;
    }
    return cx;
  }
  function panel(y, h, a, accent = COL.cyan) {
    if (a <= 0) return;
    const x = 64, w = 952;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = COL.panel; rr(x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = accent; ctx.fillRect(x, y + 18, 6, h - 36);
    ctx.strokeStyle = accent; ctx.lineWidth = 3; const c = 22;
    ctx.beginPath(); ctx.moveTo(x + w - c, y + 1.5); ctx.lineTo(x + w - 1.5, y + 1.5); ctx.lineTo(x + w - 1.5, y + c);
    ctx.moveTo(x + w - 1.5, y + h - c); ctx.lineTo(x + w - 1.5, y + h - 1.5); ctx.lineTo(x + w - c, y + h - 1.5); ctx.stroke();
    ctx.restore();
  }
  const sceneA = (t, [a, b]) => env(t, a, b, 0.35, 0.35);
  const slide = (t, [a]) => (1 - seg(t, a, a + 0.45, ease.out)) * 16;
  function leader(x1, y1, x2, y2, color = 'rgba(255,255,255,0.8)', dot = true) {
    ctx.save(); ctx.strokeStyle = 'rgba(8,3,19,0.55)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    if (dot) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x2, y2, 4.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  // ---------------------------------------------------------------- HUD
  function drawFrameHUD(t, tau, mh) {
    ctx.save();
    const gt = ctx.createLinearGradient(0, 0, 0, 310);
    gt.addColorStop(0, 'rgba(4,2,10,0.62)'); gt.addColorStop(0.72, 'rgba(4,2,10,0.42)'); gt.addColorStop(1, 'rgba(4,2,10,0)');
    ctx.fillStyle = gt; ctx.fillRect(0, 0, W, 310);
    // viewfinder corners around the safe area
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; const L = 46;
    const box = [40, 226, 1040, 1596];
    const corner = (x, y, dx, dy) => { ctx.beginPath(); ctx.moveTo(x + dx * L, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * L); ctx.stroke(); };
    corner(box[0], box[1], 1, 1); corner(box[2], box[1], -1, 1); corner(box[0], box[3], 1, -1); corner(box[2], box[3], -1, -1);
    // status row: this is a simulation, not a recording
    const yy = 270;
    ctx.fillStyle = 'rgba(70,248,212,0.95)'; ctx.beginPath(); ctx.arc(80, yy - 10, 8, 0, Math.PI * 2); ctx.fill();
    txt('SIM', 98, yy, 30, COL.white, 'left', 2);
    txt('IR · IRONBOW', 172, yy, 30, COL.faint, 'left', 1);
    if (mh > 0) {                                   // camera max-hold mode tag
      ctx.globalAlpha = mh; ctx.fillStyle = 'rgba(70,248,212,0.18)'; rr(398, yy - 30, 140, 40, 6); ctx.fill();
      ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.5; ctx.stroke();
      txt('MAX HOLD', 468, yy - 1, 26, COL.cyan, 'center', 1); ctx.globalAlpha = 1;
    }
    // heat status chip
    const heating = tau > 0 && tau < P.tOff;
    const cx = 640;
    ctx.fillStyle = heating ? 'rgba(255,75,75,0.92)' : 'rgba(255,255,255,0.10)';
    rr(cx - 62, yy - 30, 124, 40, 6); ctx.fill();
    txt(heating ? 'HEAT ON' : 'HEAT OFF', cx, yy - 1, 26, heating ? '#1a0505' : COL.faint, 'center', 1);
    // model clock (standby until heat-on)
    const r = rateAt(t);
    if (t < TL.heatOn) txt('STBY', 1000, yy, 30, COL.faint, 'right', 2);
    else txt(`t ${tau.toFixed(2).padStart(5, '0')} s`, 1000, yy, 30, COL.white, 'right');
    if (t > TL.heatOn && r < 0.99) txt(`${r.toFixed(2)}x`, 840, yy, 26, COL.faint, 'right');
    ctx.restore();
  }

  function drawColourBar(a) {
    if (a <= 0) return;
    const x = 984, w = 22, yT = 790, yB = 1040;
    const yOf = (T) => yB - vOf(T) * (yB - yT);
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, yB, 0, yT);
    for (let k = 0; k <= 40; k++) { const v = k / 40; const c = Kit.colormap(IRONBOW, v); g.addColorStop(v, `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`); }
    ctx.fillStyle = g; ctx.fillRect(x, yT, w, yB - yT);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(x, yT, w, yB - yT);
    txt('°C', x + w / 2, yT - 14, 26, COL.white, 'center');
    for (const T of [200, 120, 80, 60, 47, 37, 30]) {
      const y = yOf(T), col = T === 60 ? COL.cyan : T === 47 ? COL.pink : COL.dim;
      ctx.strokeStyle = col; ctx.lineWidth = T === 60 || T === 47 ? 2.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + (T === 60 || T === 47 ? w : 0), y); ctx.stroke();
      txt(String(T), x - 14, y + 9, 25, col, 'right', 0, true);
    }
    txt('log', x + w, yB + 30, 22, COL.faint, 'right');
    txt('scale', x + w, yB + 54, 22, COL.faint, 'right');
    ctx.restore();
  }

  function crosshair(x, y, a, color = COL.white) {
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 6;
    const draw = () => {
      ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(x + dx * 8, y + dy * 8); ctx.lineTo(x + dx * 30, y + dy * 30); }
      ctx.stroke();
    };
    draw(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; draw();
    ctx.restore();
  }
  // readout: big = temperature rise (what the captions talk about), small = absolute
  function readoutBox(x, y, w, label, big, small, a, color) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(8,3,19,0.80)'; rr(x, y, w, 134, 8); ctx.fill();
    ctx.strokeStyle = color; ctx.globalAlpha = a * 0.6; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = a;
    txt(label, x + 14, y + 33, 30, COL.dim, 'left', 0);
    txt(big, x + 14, y + 80, 42, color);
    txt(small, x + 14, y + 118, 30, COL.white);
    ctx.restore();
  }
  const liveVal = (arr, t, id) => {        // camera-style readout: refreshes at 10 Hz, tiny jitter
    const tq = Math.floor(t * 10) / 10;
    return series(arr, tauAt(tq)) + (h3(Math.round(tq * 10), id, 5) - 0.5) * 0.08;
  };

  // ---------------------------------------------------------------- ruler & annotations
  function drawRuler(v, a) {
    if (a <= 0) return;
    const x = sx(v, 2.6);
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 6;
    const ticks = () => {
      ctx.beginPath(); ctx.moveTo(x, sy(v, 0)); ctx.lineTo(x, sy(v, 6));
      for (let k = 0; k <= 12; k++) { const w = k / 2, y = sy(v, w); ctx.moveTo(x, y); ctx.lineTo(x - (k % 2 ? 12 : 24), y); }
      ctx.stroke();
    };
    ticks(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.2; ticks();
    for (let k = 0; k <= 6; k++) ftxt(k === 0 ? 'WL' : String(k), x + 14, sy(v, k) + 10, 30, COL.white);
    ftxt('mm to WL', x - 6, sy(v, 6) - 24, 30, COL.dim, 'left');
    ctx.restore();
  }
  function dashed(x1, y1, x2, y2, color, lw = 2.2, dash = [8, 7]) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
  function drawReach(v, a, t, tau, wTip, liveA) {
    if (a <= 0) return;
    const stalled = t >= T_STALL;
    const rmax = series(REACHMAX, stalled ? tauAt(T_STALL) : tau), rnow = series(REACH, tau);
    const xr = sx(v, 2.6), yTip = sy(v, wTip), yMax = sy(v, wTip - rmax);
    ctx.save(); ctx.globalAlpha = a;
    dashed(sx(v, 0.42), yTip, xr - 26, yTip, 'rgba(255,255,255,0.85)');
    ftxt('tip', xr - 30, yTip - 10, 30, COL.white, 'right');
    if (rmax > 0.02) {
      dashed(sx(v, 0.42), yMax, xr - 26, yMax, COL.cyan, 2.6);
      const bx = sx(v, 1.55);
      ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - 12, yTip); ctx.lineTo(bx, yTip); ctx.lineTo(bx, yMax); ctx.lineTo(bx - 12, yMax); ctx.stroke();
    }
    // live measurement: dim while it grows, solid + one pulse when it stalls
    const lx = xr + 60, ly = yMax + 58;
    const s = seg(t, T_STALL, T_STALL + 0.3);
    const valCol = stalled ? COL.cyan : 'rgba(70,248,212,0.62)';
    txt(`${rmax.toFixed(1)} mm`, lx, ly, 46, valCol, 'left', 0, true);
    ftxt('past tip', lx, ly + 36, 32, COL.dim);
    ftxt('(model)', lx, ly + 66, 26, COL.dim);
    if (stalled) {
      const pulse = Math.sin(Math.PI * s);                 // one-time outline pulse (0.3 s), no strobe
      ctx.save(); ctx.font = F(46); const wv = ctx.measureText(`${rmax.toFixed(1)} mm`).width; ctx.restore();
      if (pulse > 0.01) { ctx.save(); ctx.globalAlpha = a * pulse; ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; rr(lx - 12, ly - 46, wv + 24, 60, 8); ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = a * seg(t, T_STALL, T_STALL + 0.25);
      ctx.fillStyle = COL.cyan; rr(lx, ly + 82, 118, 40, 6); ctx.fill();
      txt('STALLS', lx + 59, ly + 112, 30, '#04130f', 'center', 1);
      ctx.restore();
    }
    const mhA = seg(t, T_OFF, T_OFF + 0.5);
    if (mhA > 0) { ctx.save(); ctx.globalAlpha = a * mhA; txt('MAX HOLD', lx, ly - 54, 26, COL.cyan, 'left', 1, true); ctx.restore(); }
    // isotherm tag next to the live front
    if (rnow > 0.05 && liveA > 0) {
      const yF = sy(v, wTip - rnow);
      ctx.save(); ctx.globalAlpha = a * liveA; ftxt('60 °C', sx(v, -0.6), yF + 34, 30, COL.cyan, 'right'); ctx.restore();
    }
    ctx.restore();
  }

  function drawChart(x, y, w, h, tau, a, sweep) {
    if (a <= 0) return;
    const yMin = 36, yMax = 48.5, tMax = 12;
    const X = (tt) => x + (tt / tMax) * w, Y = (T) => y + h - ((T - yMin) / (yMax - yMin)) * h;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke();
    dashed(x, Y(37), x + w, Y(37), 'rgba(255,255,255,0.35)', 1.5, [4, 6]);
    txt('37', x - 12, Y(37) + 9, 26, COL.dim, 'right');
    dashed(x, Y(47), x + w, Y(47), COL.pink, 2.6, [10, 7]);
    txt('47', x - 12, Y(47) + 9, 26, COL.pink, 'right');
    txt('+10 °C limit (47 °C)', x + 12, Y(47) - 12, 30, COL.pink, 'left');
    const tEnd = Math.min(tau, tMax) * sweep;
    ctx.strokeStyle = COL.white; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let tt = 0; tt <= tEnd + 1e-6; tt += 0.05) { const T = series(SP2, tt); tt ? ctx.lineTo(X(tt), Y(T)) : ctx.moveTo(X(tt), Y(T)); }
    ctx.stroke();
    const Tn = series(SP2, tEnd);
    ctx.fillStyle = COL.pink; ctx.strokeStyle = 'rgba(8,3,19,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(tEnd), Y(Tn), 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    txt('0 s', x, y + h + 28, 26, COL.faint, 'center');
    txt(`${tMax} s`, x + w, y + h + 28, 26, COL.faint, 'center');
    txt('Sp2 · model · downpack only', x + w / 2, y + h + 28, 26, COL.faint, 'center');
    ctx.restore();
  }

  // ---------------------------------------------------------------- scenes (captions)
  function sceneHook(t) {
    const a = 1 - seg(t, TL.hook[1] - 0.35, TL.hook[1]);
    if (a <= 0) return;
    const y = 300;
    panel(y, 330, a);
    ctx.save(); ctx.globalAlpha = a;
    txt('THERMAL VIEW · WARM VERTICAL', 100, y + 52, 30, COL.cyan, 'left', 3);
    txt('How far past the', 100, y + 142, 80, COL.white);
    txt('plugger tip does', 100, y + 230, 80, COL.white);
    txt('GP soften?', 100, y + 318, 80, COL.hot);
    ctx.restore();
  }
  function sceneSoften(t) {
    const a = sceneA(t, TL.s2); if (a <= 0) return;
    const y = 300 + slide(t, TL.s2);
    panel(y, 318, a);
    ctx.save(); ctx.globalAlpha = a;
    txt('CYAN LINE = 60 °C ISOTHERM', 100, y + 50, 30, COL.cyan, 'left', 3);
    rich([['GP reaches flow temp ', COL.white], ['(≥60 °C)', COL.cyan]], 100, y + 120, 52);
    rich([['only ', COL.white], ['~1 mm', COL.cyan], [' past the tip', COL.white]], 100, y + 184, 52);
    txt('Bench IR imaging: Yu 2023 J Dent Sci · Briseño Marroquín 2015 J Endod', 100, y + 230, 23, COL.fine);
    txt('Model tip 150 °C: real tips often run below the dial (Atmeh 2020 IEJ)', 100, y + 260, 23, COL.faint);
    txt('Model heat held 1.8 s at depth (simplified; no separation burst)', 100, y + 290, 23, COL.faint);
    ctx.restore();
  }
  function sceneSpot1(t) {
    const a = sceneA(t, TL.s3); if (a <= 0) return;
    const y = 300 + slide(t, TL.s3);
    panel(y, 262, a, COL.hot);
    ctx.save(); ctx.globalAlpha = a;
    txt('SPOT METER Sp1 · IN GP', 100, y + 50, 30, COL.hot, 'left', 3);
    txt('2 mm past the tip:', 100, y + 122, 56, COL.white);
    rich([['only ', COL.white], ['~4 °C', COL.hot], [' warmer', COL.white]], 100, y + 188, 56);
    txt('Villegas 2005 IEJ (plugger at WL−4 mm; canal-wall thermocouples, ex vivo)', 100, y + 234, 23, COL.fine);
    ctx.restore();
  }
  function sceneSurface(t, tau) {
    const a = sceneA(t, TL.s4); if (a <= 0) return;
    const y = 300 + slide(t, TL.s4);
    panel(y, 448, a, COL.pink);
    ctx.save(); ctx.globalAlpha = a;
    txt('SPOT Sp2 · OUTER ROOT SURFACE', 100, y + 50, 30, COL.pink, 'left', 3);
    txt('Root surface: usually', 100, y + 112, 52, COL.white);
    const xe = rich([['under ', COL.white], ['+10 °C', COL.pink]], 100, y + 172, 52);
    txt('at a 200 °C dial (ex vivo)', xe + 24, y + 172, 30, COL.dim);
    ctx.restore();
    drawChart(160, y + 212, 790, 100, tau, a, seg(t, TL.s4[0] + 0.05, TL.s4[0] + 1.1, ease.inOut));
    ctx.save(); ctx.globalAlpha = a;
    txt('Under +10 °C: Sweatman 2001, Lee 1998 (System B, ex vivo)', 100, y + 376, 23, COL.fine);
    txt('Over +10 °C: Lipski 2005 (thin roots), Mc Cullagh 2000', 100, y + 404, 23, COL.fine);
    txt('47 °C for 1 min injures bone (rabbit): Eriksson & Albrektsson 1983/1984', 100, y + 432, 23, COL.fine);
    ctx.restore();
  }
  function sceneTakeaway(t) {
    const a = Math.min(sceneA(t, TL.s5), 1 - seg(t, TL.offA, TL.offA + 0.3)); if (a <= 0) return;
    const y = 300 + slide(t, TL.s5);
    panel(y, 296, a);
    ctx.save(); ctx.globalAlpha = a;
    txt('TAKEAWAY', 100, y + 50, 30, COL.cyan, 'left', 4);
    txt('Heat stays local.', 100, y + 128, 66, COL.white);
    rich([['Downpack to ~', COL.white], ['3–5 mm', COL.cyan], [' short of WL.', COL.white]], 100, y + 196, 50);
    txt('Ex vivo adaptation: Smith 2000 · Guess 2003 J Endod · Zhang 2011 IEJ', 100, y + 242, 23, COL.fine);
    txt('Apical canal wall: +4 ± 1 °C at 2 mm past the tip (Villegas 2005)', 100, y + 272, 23, COL.faint);
    ctx.restore();
  }
  function takeawayMarks(v, a, wTip) {
    if (a <= 0) return;
    const x = sx(v, 2.6);
    ctx.save(); ctx.globalAlpha = a;
    // 3–5 mm downpack band on the ruler
    const yb5 = sy(v, 5), yb3 = sy(v, 3);
    ctx.fillStyle = 'rgba(70,248,212,0.15)'; ctx.fillRect(x - 30, yb5, 30, yb3 - yb5);
    ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.strokeRect(x - 30, yb5, 30, yb3 - yb5);
    txt('3–5', x + 70, sy(v, 4) - 4, 44, COL.cyan, 'left', 0, true);
    ftxt('mm', x + 70, sy(v, 4) + 32, 30, COL.cyan);
    // left labels: what happens below the tip (model peaks)
    const yT = sy(v, wTip), y1 = sy(v, wTip - 1), y2 = sy(v, wTip - 2), yW = sy(v, 0);
    const lx = sx(v, -2.15), tx = lx - 14;
    const brk = (ya, yb, col) => {
      ctx.strokeStyle = 'rgba(8,3,19,0.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(lx + 10, ya); ctx.lineTo(lx, ya); ctx.lineTo(lx, yb); ctx.lineTo(lx + 10, yb); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx + 10, ya); ctx.lineTo(lx, ya); ctx.lineTo(lx, yb); ctx.lineTo(lx + 10, yb); ctx.stroke();
    };
    brk(yT, y1 - 4, COL.cyan);
    brk(y1 + 4, y2 - 4, COL.amber);
    brk(y2 + 4, yW, 'rgba(255,255,255,0.8)');
    ftxt('softened', tx, (yT + y1) / 2 - 2, 30, COL.cyan, 'right');
    ftxt('~1 mm', tx, (yT + y1) / 2 + 28, 30, COL.cyan, 'right');
    ftxt('warm', tx, (y1 + y2) / 2 - 16, 30, COL.amber, 'right');
    ftxt(`${Math.round(AX2)}–${Math.round(AX1)} °C`, tx, (y1 + y2) / 2 + 14, 30, COL.amber, 'right');
    ftxt('(model)', tx, (y1 + y2) / 2 + 43, 26, COL.amber, 'right');
    const ym = (y2 + yW) / 2;
    ftxt('compacted', tx, ym - 16, 30, COL.white, 'right');
    ftxt('near body', tx, ym + 18, 30, COL.white, 'right');
    ftxt('temp', tx, ym + 52, 30, COL.white, 'right');
    // max-hold contour label (outside the root, clear of the outline)
    const yP = sy(v, 7.4);
    leader(sx(v, -2.55) + 8, yP - 10, sx(v, -HOLD_U74), yP, 'rgba(70,248,212,0.85)');
    ftxt('peak 60 °C', sx(v, -2.55), yP, 30, COL.cyan, 'right');
    ftxt('(max hold)', sx(v, -2.55), yP + 32, 26, COL.cyan, 'right');
    ctx.restore();
  }
  function anatomyLabels(v, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const lab = (s, xL, yL, xP, yP) => {        // label right-aligned at xL, leader to the point (xP, yP)
      leader(xL + 12, yL - 10, xP, yP);
      ftxt(s, xL, yL, 30, COL.white, 'right');
    };
    lab('dentin', 300, 1080, sx(v, -1.5), sy(v, 10.0));
    lab('bone', 300, 1180, sx(v, -(SIM.rootHalf(7) + 1.3)), sy(v, 7));
    lab('gutta-percha', 300, 1290, sx(v, -0.1), sy(v, 4.6));
    ctx.restore();
  }
  function pluggerLabel(t, v, wTip) {
    let a = env(t, 0.5, 2.65, 0.25, 0.3);
    const tipY = sy(v, wTip);
    a *= clamp((tipY - 650) / 60);
    if (a <= 0) return;
    const yA = Math.min(700, tipY - 20), wA = (v.Y0 - yA) / v.S;
    const xA = sx(v, SIM.plugHalf(Math.max(0, wA - wTip))) + 3;
    ctx.save(); ctx.globalAlpha = a;
    leader(xA + 136, yA - 6, xA, yA);
    ftxt('heat plugger', xA + 146, yA - 2, 30, COL.white);
    ftxt('(room temp)', xA + 146, yA + 32, 30, COL.dim);
    ctx.restore();
  }
  function plungeTag(t, v, tau, wTip) {
    const a = env(t, TL.heatOn, 5.35, 0.25, 0.4);
    if (a <= 0) return;
    const yT = sy(v, wTip), x = v.X0 - 120;
    const on = tau < P.tOff;
    ctx.save(); ctx.globalAlpha = a;
    leader(x + 8, yT - 40, sx(v, -0.3), yT + 4, 'rgba(255,255,255,0.7)', false);
    ftxt(on ? '● HEAT ON' : 'HEAT OFF', x, yT - 150, 34, on ? COL.red : COL.dim, 'right');
    ftxt('dial 200 °C', x, yT - 112, 30, COL.white, 'right');
    ftxt('model tip 150 °C', x, yT - 77, 30, COL.dim, 'right');
    ftxt('tip to WL', x, yT - 30, 30, COL.dim, 'right');
    ftxt(`${Math.max(P.wEnd, wTip).toFixed(1)} mm`, x, yT + 14, 40, COL.hot, 'right');
    ctx.restore();
  }

  // ---------------------------------------------------------------- render
  function render(t) {
    const tau = tauAt(t), v = viewAt(t);
    const wTip = tipAt(t, tau);
    const live = fieldAt(tau);
    let Fd = live;
    const mh = seg(t, TL.s5[0], TL.s5[0] + 0.8, ease.inOut);        // takeaway: blend to camera max-hold
    if (mh > 0) { for (let c = 0; c < N; c++) blend[c] = Fd[c] + (TMAXF[c] - Fd[c]) * mh; Fd = blend; }
    const isoA = seg(t, TL.heatOn + 0.2, TL.heatOn + 0.7) * (1 - seg(t, T_OFF, T_OFF + 0.5));
    let holdA = lerp(1, 0.5, seg(t, TL.s3[0], TL.s3[0] + 0.5));          // max-hold contour: dimmer during the spot meters
    holdA = lerp(holdA, 0.95, seg(t, TL.s5[0], TL.s5[0] + 0.6)) * seg(t, T_OFF, T_OFF + 0.5) * (1 - seg(t, TL.offA, TL.offA + 0.3));
    // boot (scan line reveals downwards) and power-down (scan line sweeps upwards and blacks out)
    const cut = Math.min(seg(t, 0, 0.5, ease.out) * (H + 80), (1 - seg(t, TL.offA, TL.offB, ease.smooth)) * (H + 80));
    rasterField(t, v, Fd, tau, wTip, Math.max(isoA, mh), mh, cut);
    const zoomed = seg(t, TL.zoomB - 0.6, TL.zoomB);
    drawAnatomy(v, lerp(0.8, 1, zoomed));
    drawPlugger(v, wTip, 1);
    drawIso(v, live, isoA);
    if (holdA > 0) drawIso(v, holdAt(tau), holdA, true);

    // ruler + reach measurement
    const rulerA = seg(t, 4.4, 4.9) * (1 - seg(t, TL.s4[0] - 0.3, TL.s4[0] + 0.1)) + seg(t, TL.s5[0] + 0.2, TL.s5[0] + 0.7);
    drawRuler(v, clamp(rulerA));
    drawReach(v, seg(t, 4.6, 5.1) * (1 - seg(t, TL.s2[1] - 0.4, TL.s2[1])), t, tau, wTip, isoA);
    anatomyLabels(v, env(t, 0.4, 2.9, 0.3, 0.3));
    pluggerLabel(t, v, wTip);
    plungeTag(t, v, tau, wTip);

    // spot meter Sp1 (2 mm past the tip, in GP)
    const s1a = sceneA(t, TL.s3);
    if (s1a > 0) {
      const X = sx(v, 0), Y = sy(v, SP1_POS[1]);
      crosshair(X, Y, s1a, COL.hot);
      const val = liveVal(SP1, t, 1);
      ctx.save(); ctx.globalAlpha = s1a; ctx.strokeStyle = 'rgba(255,211,92,0.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X - 32, Y); ctx.lineTo(358, Y); ctx.stroke(); ctx.restore();
      readoutBox(64, Y - 67, 294, 'Sp1 · GP (model)', `+${(val - 37).toFixed(1)} °C`, `${val.toFixed(1)} °C`, s1a, COL.hot);
    }
    // spot meter Sp2 (outer root surface / PDL)
    const s2a = env(t, TL.s4[0] - 0.1, TL.s4[1], 0.4, 0.4);
    if (s2a > 0) {
      const X = sx(v, -SP2_POS[0]), Y = sy(v, SP2_POS[1]);
      crosshair(X, Y, s2a, COL.pink);
      const val = liveVal(SP2, t, 2);
      ctx.save(); ctx.globalAlpha = s2a; ctx.strokeStyle = 'rgba(255,143,143,0.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X - 10, Y + 28); ctx.lineTo(160, Y + 84); ctx.stroke(); ctx.restore();
      readoutBox(64, Y + 84, 362, 'Sp2 · SURFACE (model)', `+${(val - 37).toFixed(1)} °C`, `${val.toFixed(1)} °C`, s2a, COL.pink);
    }
    takeawayMarks(v, seg(t, TL.s5[0] + 0.3, TL.s5[0] + 1.0, ease.out) * (1 - seg(t, TL.offA, TL.offA + 0.3)), wTip);

    // black out everything below the scan line (boot / power-down), then the scan-line glow
    if (cut < H) { ctx.fillStyle = '#000'; ctx.fillRect(0, Math.max(0, cut), W, H); }
    scanLine(cut, t < 0.55 ? 1 : seg(t, TL.offA, TL.offA + 0.05) * (1 - seg(t, TL.offB - 0.05, TL.offB)));

    drawColourBar(seg(t, 0.2, 0.7) * (1 - seg(t, TL.offA, TL.offB)));
    drawFrameHUD(t, tau, mh * (1 - seg(t, TL.offA, TL.offB)));

    sceneHook(t);
    sceneSoften(t);
    sceneSpot1(t);
    sceneSurface(t, tau);
    sceneTakeaway(t);

    // fine print + handle (soft dark backing for legibility)
    const gb = ctx.createLinearGradient(0, 1470, 0, 1600);
    gb.addColorStop(0, 'rgba(4,2,10,0)'); gb.addColorStop(0.45, 'rgba(4,2,10,0.42)'); gb.addColorStop(1, 'rgba(4,2,10,0.5)');
    ctx.fillStyle = gb; ctx.fillRect(0, 1470, W, 130);
    txt('SIMULATED IR VIEW · TOY HEAT MODEL · NOT REAL FOOTAGE', 64, 1512, 26, COL.fine, 'left', 1);
    txt('TUNED AT 3 EX VIVO POINTS · OTHER TEMPERATURES ILLUSTRATIVE', 64, 1540, 24, COL.fine, 'left', 1);
    txt('@natebrooksendo', 64, 1572, 26, 'rgba(255,255,255,0.85)', 'left', 1);
  }

  window.REEL = {
    title: 'Heat plugger: how far does GP soften?',
    duration: TL.dur,
    poster: 6.95,
    canvas,
    fonts: ['400 80px "Share Tech Mono"', '400 30px "JetBrains Mono"'],
    setup,
    render,
  };
  Kit.boot(window.REEL);
})();
