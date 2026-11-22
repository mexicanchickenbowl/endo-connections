/*
 * 05 · geometry + mesh + schematic stress fields for a 2-D labio-palatal section of a
 * crowned, post-restored maxillary central incisor. Units: mm. x<0 labial, x>0 palatal,
 * y = 0 at the incisal edge, increasing toward the apex (screen-down).
 * Everything is deterministic (Kit.rng / Kit.hash only).
 * NOTE: the stress fields below are SCHEMATIC analytic fields shaped after published FEA patterns
 * (see NOTES.md) — they are NOT the output of a finite-element solve.
 */
(function () {
  const { clamp, lerp } = Kit;
  const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const G = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));

  // ---------- spline helper ----------
  function catmull(pts, n = 10, closed = false) {
    const out = [], N = pts.length;
    const get = (i) => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    if (!closed) out.push(pts[N - 1].slice());
    return out;
  }

  // ---------- tooth outline (closed): incisal edge -> labial -> apex -> palatal -> back ----------
  const OUTER_CP = [
    [-0.42, 0.16], [-1.22, 1.30], [-2.02, 3.00], [-2.75, 5.20], [-3.25, 7.40], [-3.45, 9.20], [-3.38, 10.50],
    [-3.22, 12.00], [-2.95, 14.00], [-2.55, 16.50], [-2.05, 19.00], [-1.45, 21.30], [-0.78, 22.90], [0.00, 23.50],
    [0.74, 22.90], [1.36, 21.30], [1.95, 19.00], [2.45, 16.50], [2.85, 14.00], [3.10, 12.00], [3.24, 10.25],
    [3.38, 9.05], [3.20, 7.80], [2.55, 6.60], [1.95, 5.30], [1.47, 3.60], [1.02, 1.80], [0.66, 0.62], [0.30, 0.06], [-0.06, 0.0],
  ];
  const OUTER = catmull(OUTER_CP, 10, true);

  // crown preparation (inner crown surface), labial margin -> over the top -> palatal margin
  const PREP_CP = [
    [-2.45, 10.45], [-2.36, 9.00], [-2.15, 7.40], [-1.85, 5.80], [-1.45, 4.40], [-1.00, 3.60], [-0.40, 3.22],
    [0.25, 3.22], [0.62, 3.62], [0.92, 4.60], [1.32, 6.00], [1.78, 7.40], [2.25, 8.80], [2.35, 10.15],
  ];
  const PREP = catmull(PREP_CP, 8, false);
  const FERRULE_Y = 8.5;          // top of the dentin collar (ferrule ~1.7–2 mm above the margin)
  const CREST_Y = 12.6;           // alveolar crest (~2 mm below CEJ)
  const PDL = 0.22;

  // margin indices on OUTER
  let iL = 0, iP = 0;
  for (let i = 0; i < OUTER.length; i++) if (OUTER[i][0] < 0 && OUTER[i][1] >= 10.45) { iL = i; break; }
  for (let i = OUTER.length - 1; i >= 0; i--) if (OUTER[i][0] > 0 && OUTER[i][1] >= 10.15) { iP = i; break; }
  const CROWN = [...OUTER.slice(iP), ...OUTER.slice(0, iL + 1), ...PREP.slice()];

  // core = PREP above the ferrule line, closed along y = FERRULE_Y
  function clipAbove(poly, yc) {
    const out = [];
    for (let i = 0; i < poly.length - 1; i++) {
      const a = poly[i], b = poly[i + 1];
      if (a[1] <= yc) out.push(a);
      if ((a[1] - yc) * (b[1] - yc) < 0) { const u = (yc - a[1]) / (b[1] - a[1]); out.push([lerp(a[0], b[0], u), yc]); }
    }
    return out;
  }
  const CORE = clipAbove(PREP, FERRULE_Y);

  // post: tapered rod with a near-flat end that sits directly on the gutta-percha (no gap)
  const POST_TOP = 5.0, POST_T1 = 18.1, POST_TIP = 18.3, PHW0 = 0.80, PHW1 = 0.52;
  const postHW = (y) => lerp(PHW0, PHW1, clamp((y - POST_TOP) / (POST_T1 - POST_TOP)));
  // end cap (shared with the GP top so the two bodies abut exactly), left -> right
  const CAP = [];
  for (let k = 1; k < 12; k++) { const a = Math.PI * (k / 12); CAP.push([-PHW1 * Math.cos(a), POST_T1 + (POST_TIP - POST_T1) * Math.sin(a)]); }
  const POST = (() => {
    const L = [], R = [];
    for (let y = POST_TOP; y <= POST_T1 + 1e-6; y += 0.25) { L.push([-postHW(y), y]); R.push([postHW(y), y]); }
    if (L[L.length - 1][1] < POST_T1 - 1e-6) { L.push([-PHW1, POST_T1]); R.push([PHW1, POST_T1]); }
    return [[-PHW0 + 0.08, POST_TOP - 0.08], ...L, ...CAP, ...R.reverse(), [PHW0 - 0.08, POST_TOP - 0.08]];
  })();
  function distToPost(x, y) { // approximate signed distance (mm), >0 outside
    if (y < POST_TOP) return Math.hypot(Math.max(Math.abs(x) - PHW0, 0), POST_TOP - y);
    if (y <= POST_T1) return Math.abs(x) - postHW(y);
    const ey = (y - POST_T1) / (POST_TIP - POST_T1), ex = x / PHW1;
    if (Math.abs(x) > PHW1) return Math.hypot(Math.abs(x) - PHW1, y - POST_T1);
    return y - (POST_T1 + (POST_TIP - POST_T1) * Math.sqrt(Math.max(0, 1 - ex * ex)));
  }

  // gutta-percha: starts exactly at the post end (top edge = post cap), ~4.6 mm of residual filling
  const GP_END = 22.9;
  const GP = (() => {
    const y0 = POST_T1, y1 = GP_END, L = [], R = [];
    for (let y = y0; y <= y1 + 1e-6; y += 0.25) { const u = (y - y0) / (y1 - y0), w = lerp(PHW1, 0.13, Math.pow(u, 0.9)); L.push([-w, y]); R.push([w, y]); }
    if (L[L.length - 1][1] < y1 - 1e-6) { L.push([-0.13, y1]); R.push([0.13, y1]); }
    return [...L, [0, y1 + 0.1], ...R.reverse(), ...CAP.slice().reverse()];
  })();

  // outer x at height y (labial XL<0, palatal XP>0), via a lookup table
  const XLUT = (() => {
    const n = 261, xl = new Float32Array(n), xp = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const y = k * 0.1; let l = 0, p = 0;
      for (let i = 0; i < OUTER.length; i++) {
        const a = OUTER[i], b = OUTER[(i + 1) % OUTER.length];
        if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) {
          const x = lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
          if (x < l) l = x; if (x > p) p = x;
        }
      }
      xl[k] = l; xp[k] = p;
    }
    return { xl, xp };
  })();
  const XL = (y) => XLUT.xl[Math.max(0, Math.min(260, Math.round(y * 10)))];
  const XP = (y) => XLUT.xp[Math.max(0, Math.min(260, Math.round(y * 10)))];

  // root offset by PDL (for the bone socket), below the crest
  function offsetOut(poly, d) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[Math.max(0, i - 1)], b = poly[Math.min(poly.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
      // OUTER runs labial-down then palatal-up (counter-clockwise on screen) -> outward normal = (-ty, tx)
      out.push([poly[i][0] - ty * d, poly[i][1] + tx * d]);
    }
    return out;
  }
  const BONE_W = 8.3, BONE_B = 26.5;
  const BONE = (() => {
    const root = OUTER.filter((p, i) => i > iL - 2 && i < iP + 2 && p[1] >= CREST_Y - 0.25);
    const sock = offsetOut(root, PDL);
    const crestL = [], crestR = [];
    for (let k = 0; k <= 10; k++) { const u = k / 10; const x = lerp(-BONE_W, sock[0][0], u); crestL.push([x, CREST_Y + 0.42 * (1 - u) ** 1.6 - 0.05]); }
    for (let k = 0; k <= 10; k++) { const u = k / 10; const x = lerp(sock[sock.length - 1][0], BONE_W, u); crestR.push([x, CREST_Y + 0.42 * u ** 1.6 - 0.05]); }
    return [[-BONE_W, BONE_B], ...crestL, ...sock, ...crestR, [BONE_W, BONE_B]];
  })();

  // ---------- crack paths (mm) ----------
  function jag(points, seed, amp = 0.09, step = 0.18) {
    const out = [points[0]]; let k = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
      const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
      for (let j = 1; j <= n; j++) {
        const u = j / n, j2 = (i === points.length - 2 && j === n) ? 0 : 1;
        const o = (Kit.noise1(k * 0.9, seed) * amp + (Kit.hash(k, seed) - 0.5) * amp * 0.9) * j2; k++;
        out.push([lerp(a[0], b[0], u) + nx * o, lerp(a[1], b[1], u) + ny * o]);
      }
    }
    return out;
  }
  // metal: oblique root fracture (lab-style): starts at the palatal cervical tension side, runs obliquely through
  // the dentin past the post (debonding at the interface) and exits labially well BELOW the alveolar crest.
  // Each branch: { pts, s0, s1 } = its share of the crack-progress timeline.
  const CRACK_METAL = [
    { pts: jag([[3.16, 11.7], [2.45, 12.15], [1.8, 12.62], [1.2, 13.08], [0.64, 13.45]], 11), s0: 0, s1: 0.42 },
    { pts: jag([[0.64, 13.45], [0.625, 13.75], [0.615, 14.0]], 5, 0.02, 0.12), s0: 0.42, s1: 0.5 },
    { pts: jag([[-0.62, 13.9], [-1.2, 14.6], [-1.8, 15.4], [-2.3, 16.15], [-2.6, 16.66]], 23), s0: 0.5, s1: 1 },
  ];
  // fiber: core / cervical fracture at the core–dentin level, above the bone crest
  const CRACK_FIBER = [
    { pts: jag([[3.18, 10.05], [2.55, 9.55], [1.85, 9.05], [1.1, 8.62], [0.2, 8.45], [-0.8, 8.30], [-1.7, 8.05], [-2.36, 7.85]], 37), s0: 0, s1: 1 },
  ];

  // ferrule: the dentin collar between the crown preparation and the post, from FERRULE_Y down to the margins
  function ferruleWall(side) {
    const pts = side < 0 ? PREP.slice() : PREP.slice().reverse(); // start at that side's margin
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      if (a[1] < FERRULE_Y) { const b = pts[i - 1], u = (FERRULE_Y - b[1]) / (a[1] - b[1]); out.push([lerp(b[0], a[0], u), FERRULE_Y]); break; }
      out.push(a);
    }
    const my = out[0][1];
    out.push([side * postHW(FERRULE_Y), FERRULE_Y], [side * postHW(my), my]);
    return out;
  }
  const FERRULE = [ferruleWall(-1), ferruleWall(1)];

  // ---------- schematic stress fields ----------
  const LOAD = { x: 1.66, y: 4.65 };
  function bend(x, y) {
    const xl = XL(y), xp = XP(y), xc = (xl + xp) / 2, hw = Math.max(0.3, (xp - xl) / 2);
    const r = Math.min(1, Math.abs(x - xc) / hw);
    const M = sm(3.4, 11.6, y) * (y < CREST_Y ? 1 : Math.exp(-(y - CREST_Y) / 3.1));
    return M * Math.pow(r, 1.35);
  }
  // material ids
  const ID = { NONE: 0, BONE: 1, DENTIN: 2, CROWN: 3, CORE: 4, POST: 5, GP: 6 };
  // Results are scoped to DENTIN (as FEA software does when a result is plotted on one body).
  // Metal: highest dentin stress in a band along the post–dentin interface (cervical/middle third), plus the cervical
  //        bending band.  Fiber: cervical dentin carries the peak (like a natural tooth), weak interface band.
  // After Pegoretti 2002, Adanir & Belli 2007, Lanza 2005, Nokar 2018, Sorrentino 2007 — see NOTES.md.
  function field(kind, id, x, y) {
    const b = bend(x, y), dp = Math.max(0, distToPost(x, y));
    const contact = 0.78 * G(x, y, LOAD.x, LOAD.y, 0.6, 0.6);
    if (kind === 'metal') {
      switch (id) {
        case ID.DENTIN: return 0.70 * b
          + 0.95 * Math.exp(-((dp / 0.7) ** 2)) * Math.exp(-(((y - 12.8) / 3.0) ** 2)) * (x > 0 ? 1.07 : 1)
          + 0.08 * G(x, y, 0, POST_TIP, 0.9, 0.9);
        case ID.POST: return 0.60 + 0.30 * G(0, y, 0, 12.2, 1, 4.2);
        case ID.CORE: return 0.16 + 0.12 * b;
        case ID.CROWN: return 0.06 + 0.30 * b + contact;
        case ID.GP: return 0.03;
      }
    } else {
      switch (id) {
        case ID.DENTIN: return 0.95 * b
          + 0.30 * G(x, y, XP(10.35) - 0.25, 10.4, 0.8, 1.3)
          + 0.22 * G(x, y, XL(10.9) + 0.25, 10.9, 0.8, 1.4)
          + 0.14 * Math.exp(-((dp / 0.5) ** 2)) * (1 - sm(10.5, 15, y));
        case ID.POST: return 0.12 + 0.30 * (1 - sm(9.5, 17, y));
        case ID.CORE: return 0.28 + 0.25 * b + 0.42 * G(x, y, 1.9, 8.4, 1.0, 0.7);
        case ID.CROWN: return 0.06 + 0.38 * b + contact;
        case ID.GP: return 0.03;
      }
    }
    return 0;
  }

  window.GEO = {
    sm, G, catmull, OUTER, PREP, CROWN, CORE, POST, GP, BONE, FERRULE_Y, CREST_Y, BONE_W, BONE_B,
    XL, XP, distToPost, postHW, field, ID, LOAD, CRACK_METAL, CRACK_FIBER, FERRULE, PHW0, PHW1, POST_TOP, POST_T1, POST_TIP, GP_END,
  };
})();
