/*
 * Toy heat model for reel 11: axisymmetric (r, z) section of a schematic single-rooted tooth.
 * Explicit finite-volume diffusion on a 0.1 mm grid with a moving, temperature-controlled plugger
 * (Dirichlet cells behind a contact conductance), perfused periodontal / periapical tissue (relaxes to 37 °C)
 * and insulating air.
 * Parameters were tuned (see NOTES.md) at three ex vivo anchor points only: with the plugger 4 mm short of WL,
 * the 60 °C zone in GP reaches ~1 mm past the tip, GP 2 mm past the tip warms by ~4 °C, and the outer root
 * surface rises well under 10 °C. Every other temperature is illustrative. Not a validated thermal model.
 * Units: mm, s, °C.  Deterministic.  Works in the browser (window.HeatSim) and in node (module.exports).
 */
(function (root) {
  const P = {
    dx: 0.1, u0: 0, u1: 6, w0: -2.5, w1: 24,
    // anatomy (w = mm coronal from working length; WL = apical end of the GP, at the apical seat)
    cej: 14, crest: 12.6, orifice: 14, apex: -0.85,
    T_body: 37, T_air: 31, T_room: 24,
    // conductivity (relative) and volumetric heat capacity (relative) — TUNING PARAMETERS, not measured values
    // GP: gp = axial (effective: lumps conduction + apical flow of softened GP pushed by the plugger), gpR = radial
    k: { tissue: 0.5, dentin: 0.40, gp: 1.8, gpR: 0.45, plug: 0 },
    C: { tissue: 3.8, dentin: 2.8, gp: 2.0 },
    kPlugFilm: 0.25,   // plugger -> dentin where no GP cell separates them (unresolved GP film)
    kPlug: 1.2,        // plugger -> neighbour face conductance (contact resistance; lower = cooler contact)
    perf: 0.15,        // 1/s, perfusion relaxation in PDL / bone / periapical tissue
    kScale: 1.0,       // overall scale (mm^2/s per unit k/C)
    // heating schedule (physical seconds)
    tOn: 0.0, tPlunge: 2.0, tOff: 3.8, tauCool: 1.4,
    Tdial: 200, Ttip: 150,   // model tip temperature: below the 200 °C dial, as measured tips run (Atmeh 2020)
    wStart: 14.0, wEnd: 4.0, // plugger tip travel (orifice -> WL-4)
    hotLen: 1.0, hotDecay: 2.5,
    tipR0: 0.1, tipLen: 0.2,  // plugger tip: rounded end, 0.48 mm diameter
    tEnd: 15.0, snapDt: 1 / 15,
  };

  // ---- root: C1-continuous taper that rounds into the apex (no shoulder)
  const W_CAP = 1.1;
  const rootTaper = (w) => 0.78 + 2.32 * Math.pow(Math.max(0, (w - P.apex) / (P.cej - P.apex)), 0.78);
  const rootHalf = (w) => {           // outer root half-width
    if (w <= P.apex) return 0;
    if (w >= W_CAP) return rootTaper(w);
    const q = (W_CAP - w) / (W_CAP - P.apex);
    return rootTaper(w) * Math.sqrt(Math.max(0, 1 - q * q));
  };
  // ---- unprepared apical canal beyond WL: minor constriction (~0.22 mm) widening to the foramen
  const apicalHalf = (w) => (w >= 0 ? 0 : 0.11 + 0.05 * Math.min(1, -w / -P.apex));
  // foramen: where the apical canal meets the root surface
  let W_FOR = P.apex;
  for (let w = 0; w > P.apex; w -= 0.002) if (rootHalf(w) <= apicalHalf(w)) { W_FOR = w; break; }

  // ---- crown: buccal / lingual convex profiles with a cusp tip each side, access flared occlusally (funnel)
  const RIM = [1.18, 21.2];
  const accessHalf = (w) => {         // access cavity half-width, orifice -> occlusal rim
    const r0 = 0.2 + 0.03 * P.orifice;
    const s = Math.max(0, Math.min(1, (w - P.orifice) / (RIM[1] - P.orifice)));
    return r0 + (RIM[0] - r0) * Math.pow(s, 2.2);
  };
  const CROWN_CTRL = [[3.10, 14.0], [3.45, 15.0], [3.72, 16.3], [3.84, 17.7], [3.76, 19.1], [3.52, 20.3],
    [3.12, 21.25], [2.62, 21.78], [2.12, 21.7], [1.62, 21.42], RIM];
  function catmull(pts, n) {          // centripetal-ish uniform Catmull-Rom through the control points
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }
  const CROWN_OUTER = catmull(CROWN_CTRL, 12);           // CEJ (outer) -> cusp tip -> access rim
  const ACCESS_WALL = [];                                 // rim -> orifice
  for (let k = 0; k <= 40; k++) { const w = RIM[1] - (RIM[1] - P.orifice) * k / 40; ACCESS_WALL.push([accessHalf(w), w]); }
  const CROWN_POLY = [[accessHalf(P.orifice), P.cej], ...CROWN_OUTER, ...ACCESS_WALL.slice(1)];
  function inPoly(poly, x, y) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  const inCrown = (au, w) => w > P.cej && inPoly(CROWN_POLY, au, w);
  const crownHalf = (w) => {          // outer crown half-width (for the soft-tissue margin test)
    for (let i = 1; i < CROWN_OUTER.length; i++) {
      const a = CROWN_OUTER[i - 1], b = CROWN_OUTER[i];
      if (b[1] < a[1]) break;
      if (w >= a[1] && w <= b[1]) return a[0] + (b[0] - a[0]) * (w - a[1]) / (b[1] - a[1] || 1);
    }
    return 0;
  };
  const canalHalf = (w) => {          // prepared canal: size 40, .06 taper (GP); access cavity above the orifice
    if (w < 0) return 0;
    if (w <= P.orifice) return 0.2 + 0.03 * w;
    if (w <= RIM[1]) return accessHalf(w);
    return 0;
  };
  const plugHalf = (d) => (d < 0 ? 0 : (d < P.tipLen ? P.tipR0 + (0.24 - P.tipR0) * Math.sqrt(Math.max(0, d / P.tipLen)) : 0.24 + 0.022 * (d - P.tipLen)));

  // plugger tip position and source temperature vs physical time tau
  function plugState(tau) {
    const a = Math.max(0, Math.min(1, (tau - P.tOn) / (P.tPlunge - P.tOn)));
    const e = a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;  // ease in-out
    const wTip = tau <= P.tOn ? P.wStart : P.wStart + (P.wEnd - P.wStart) * e;
    let Tsrc;
    if (tau < P.tOn) Tsrc = P.T_room;
    else if (tau < P.tOff) Tsrc = P.T_room + (P.Ttip - P.T_room) * (1 - Math.exp(-(tau - P.tOn) / 0.25));
    else {
      const Ton = P.T_room + (P.Ttip - P.T_room) * (1 - Math.exp(-(P.tOff - P.tOn) / 0.25));
      Tsrc = P.T_body + (Ton - P.T_body) * Math.exp(-(tau - P.tOff) / P.tauCool);
    }
    return { wTip, Tsrc };
  }
  const plugProfile = (d) => (d < P.hotLen ? 1 : Math.max(0.3, Math.exp(-(d - P.hotLen) / P.hotDecay)));

  const MAT = { AIR: 0, TISSUE: 1, DENTIN: 2, GP: 3, ACCESS: 4 };
  // soft-tissue margin: hugs the tooth up to ~the CEJ and falls off laterally to the bone crest level
  const gumLine = (au) => P.crest + 1.45 * Math.exp(-Math.max(0, au - 3.0) / 1.3);

  function matAt(au, w) {
    if (w <= P.cej) {
      if (au < rootHalf(w)) {
        if (w >= 0) return au < canalHalf(w) ? MAT.GP : MAT.DENTIN;
        return au < apicalHalf(w) ? MAT.TISSUE : MAT.DENTIN;        // periapical tissue in the apical canal
      }
      return w < gumLine(au) ? MAT.TISSUE : MAT.AIR;
    }
    if (inCrown(au, w)) return MAT.DENTIN;
    if (au < accessHalf(w) && w <= RIM[1]) return MAT.ACCESS;
    return w < gumLine(au) ? MAT.TISSUE : MAT.AIR;
  }

  function build() {
    const nx = Math.round((P.u1 - P.u0) / P.dx), ny = Math.round((P.w1 - P.w0) / P.dx);
    const mat = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++) {
      const w = P.w0 + (j + 0.5) * P.dx;
      for (let i = 0; i < nx; i++) mat[j * nx + i] = matAt(Math.abs(P.u0 + (i + 0.5) * P.dx), w);
    }
    return { nx, ny, mat };
  }

  /** run the simulation; returns {nx, ny, mat, snaps: Float32Array[], snapDt, ...} */
  function run(opts = {}) {
    for (const key of Object.keys(opts)) {
      if (opts[key] && typeof opts[key] === 'object' && !Array.isArray(opts[key])) Object.assign(P[key], opts[key]);
      else P[key] = opts[key];
    }
    const { nx, ny, mat } = build();
    const N = nx * ny;
    let T = new Float32Array(N), Tn = new Float32Array(N);
    const kc = new Float32Array(N), kr = new Float32Array(N), Cc = new Float32Array(N), cond = new Uint8Array(N);
    for (let c = 0; c < N; c++) {
      const m = mat[c];
      T[c] = m === MAT.AIR || m === MAT.ACCESS ? P.T_air : P.T_body;
      if (m === MAT.TISSUE) { kc[c] = P.k.tissue; Cc[c] = P.C.tissue; cond[c] = 1; }
      else if (m === MAT.DENTIN) { kc[c] = P.k.dentin; Cc[c] = P.C.dentin; cond[c] = 1; }
      else if (m === MAT.GP) { kc[c] = P.k.gp; Cc[c] = P.C.gp; cond[c] = 1; }
      kr[c] = m === MAT.GP && P.k.gpR != null ? P.k.gpR : kc[c];   // GP: radial conductivity may differ (see NOTES)
    }
    const base = T.slice();
    const dx2 = P.dx * P.dx;
    let maxD = 0; for (let c = 0; c < N; c++) if (cond[c]) maxD = Math.max(maxD, P.kScale * Math.max(kc[c], P.kPlug) / Cc[c]);
    const dt = Math.min(0.2 * dx2 / maxD, 0.01);
    const snaps = []; const nSnap = Math.round(P.tEnd / P.snapDt) + 1;
    const plugMask = new Uint8Array(N);
    let tau = 0, nextSnap = 0;
    const halfI = (u) => Math.floor((u - P.u0) / P.dx);
    while (snaps.length < nSnap) {
      // plugger cells
      const ps = plugState(tau);
      plugMask.fill(0);
      if (tau >= P.tOn - 1e-9) {
        const j0 = Math.max(0, Math.floor((ps.wTip - P.w0) / P.dx));
        for (let j = j0; j < ny; j++) {
          const w = P.w0 + (j + 0.5) * P.dx, d = w - ps.wTip;
          if (d < 0) continue;
          const ph = plugHalf(d);
          if (w > P.w1 - 0.2) break;
          const Tp = P.T_body + (ps.Tsrc - P.T_body) * plugProfile(d);
          for (let i = 0; i <= halfI(ph); i++) {
            if (i < 0 || i >= nx) continue;
            const u = P.u0 + (i + 0.5) * P.dx; if (Math.abs(u) > ph) continue;
            const c = j * nx + i; plugMask[c] = 1; T[c] = Tp;
          }
        }
      }
      if (tau >= nextSnap - 1e-9) { snaps.push(T.slice()); nextSnap += P.snapDt; if (snaps.length >= nSnap) break; }
      // diffusion step: axisymmetric finite volume (r = u >= 0), harmonic-mean face conductivity
      for (let j = 1; j < ny - 1; j++) {
        for (let i = 0; i < nx - 1; i++) {
          const c = j * nx + i;
          if (!cond[c] || plugMask[c]) { Tn[c] = T[c]; continue; }
          const Tc = T[c];
          const ri = i + 0.5;               // radius in cell units
          let flux = 0;
          // radial faces (weights r_{i±1/2}/r_i); axis has zero area
          const nbs = [c + 1, c - 1, c - nx, c + nx];
          const wts = [(ri + 0.5) / ri, i > 0 ? (ri - 0.5) / ri : 0, 1, 1];
          for (let q = 0; q < 4; q++) {
            if (!wts[q]) continue;
            const n = nbs[q];
            const radial = q < 2, kC = radial ? kr[c] : kc[c];
            let kf;
            // contact conductance at the plugger surface; where the grid puts dentin right against the plugger,
            // a thin (sub-grid) GP/sealer film is assumed between them
            if (plugMask[n]) kf = mat[c] === MAT.DENTIN ? P.kPlugFilm : Math.min(P.kPlug, 2 * kC);
            else if (cond[n]) { const kn = radial ? kr[n] : kc[n]; kf = 2 * kC * kn / (kC + kn); }
            else continue;
            flux += wts[q] * kf * (T[n] - Tc);
          }
          let dT = P.kScale * flux / (Cc[c] * dx2);
          if (mat[c] === MAT.TISSUE) dT -= P.perf * (Tc - P.T_body);
          Tn[c] = Tc + dt * dT;
        }
      }
      // boundaries: tissue edges fixed at body temp, others copy
      for (let i = 0; i < nx; i++) { Tn[i] = T[i]; Tn[(ny - 1) * nx + i] = T[(ny - 1) * nx + i]; }
      for (let j = 0; j < ny; j++) Tn[j * nx + nx - 1] = T[j * nx + nx - 1];
      const tmp = T; T = Tn; Tn = tmp;
      tau += dt;
    }
    return { gumLine, nx, ny, mat, base, snaps, snapDt: P.snapDt, dt, P, plugState, plugProfile, rootHalf, crownHalf, canalHalf, apicalHalf, accessHalf, plugHalf, MAT, W_FOR, RIM, CROWN_OUTER, ACCESS_WALL };
  }

  const api = { P, run, gumLine, rootHalf, crownHalf, canalHalf, apicalHalf, accessHalf, plugHalf, plugState, plugProfile, MAT, W_FOR, RIM, CROWN_OUTER, ACCESS_WALL, matAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HeatSim = api;
})(typeof window !== 'undefined' ? window : globalThis);
