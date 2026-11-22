/* Art for sample 18 — procedural radiograph, H&E-style inset, CBCT-style cross-section, chart.
   Deterministic: all randomness from Kit.rng / Kit.hash / Kit.noise*. Exposes window.Art. */
(function () {
  const { clamp, lerp, seg, ease, rng, hash, noise1, noise2, rgba, mix } = Kit;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  /** cool radiographic grey, v in 0..1 */
  const gv = (v, a = 1) => { v = clamp(v); return `rgba(${Math.round(v * 236)},${Math.round(v * 241)},${Math.round(v * 246)},${a})`; };
  const SANS = '"IBM Plex Sans", "DejaVu Sans", sans-serif';
  const MONO = '"IBM Plex Mono", "DejaVu Sans Mono", monospace';
  const AMBER = '#ffb547';

  // ------------------------------------------------------------ path helpers
  function crPath(c, pts, closed = true) {
    const n = pts.length;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    c.moveTo(pts[0][0], pts[0][1]);
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (closed) c.closePath();
  }
  /** dense polyline of the same closed Catmull-Rom curve crPath draws */
  function crSample(pts, step = 2) {
    const n = pts.length, out = [];
    const P = (i) => pts[(i + n) % n];
    for (let i = 0; i < n; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      const m = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let j = 0; j < m; j++) {
        const s = j / m, a = 1 - s;
        out.push([a * a * a * p1[0] + 3 * a * a * s * c1[0] + 3 * a * s * s * c2[0] + s * s * s * p2[0],
          a * a * a * p1[1] + 3 * a * a * s * c1[1] + 3 * a * s * s * c2[1] + s * s * s * p2[1]]);
      }
    }
    out.push(out[0]);
    return out;
  }
  /** stroke a polyline with a width that wanders ±30 % (soft anatomical bands) */
  function band(g, pts, w, col, seed) {
    g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
    let s = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      s += Math.hypot(b[0] - a[0], b[1] - a[1]);
      g.lineWidth = w * (1 + 0.3 * noise1(s / 16, seed));
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
  }
  /** organic closed blob (periodic noise around the circle) */
  function blobPath(c, cx, cy, R, seed, sy = 0.92) {
    const N = 48;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = R * (1 + 0.07 * noise2(Math.cos(a) * 1.1 + 5, Math.sin(a) * 1.1 + 5, seed) + 0.025 * noise2(Math.cos(a) * 2.6, Math.sin(a) * 2.6, seed + 1));
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * sy;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath();
  }

  // ------------------------------------------------------------ teeth (film-local px)
  // u = fraction of crown width from the tooth axis, k = fraction of crown height (crown) or root length (root)
  function shapeMaker(cx, cej, Wd, Hc, Lr, tilt) {
    return (u, k, root) => { const v = root ? k * Lr : -k * Hc; return [cx + u * Wd + tilt * v, cej + v]; };
  }
  /** a canal as a tapered tube along a centreline given in (u,k) root coordinates */
  function canalPoly(P, pts, w0, w1) {
    const C = pts.map(([u, k]) => P(u, k, 1));
    const n = C.length, L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const hw = lerp(w0, w1, i / (n - 1)) / 2;
      const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const d = Math.hypot(tx, ty) || 1; tx /= d; ty /= d;
      L.push([C[i][0] - ty * hw, C[i][1] + tx * hw]); Rr.push([C[i][0] + ty * hw, C[i][1] - tx * hw]);
    }
    const e = C[n - 1];
    return [...L, [e[0], e[1] + 2], ...Rr.reverse()];
  }
  function premolar(cx, cej, Wd, Hc, Lr, tilt = 0) {
    const P = shapeMaker(cx, cej, Wd, Hc, Lr, tilt);
    const root = [P(.27, .3, 1), P(.18, .62, 1), P(.10, .87, 1), P(.04, .99, 1), P(-.04, .99, 1), P(-.10, .87, 1), P(-.18, .62, 1), P(-.27, .3, 1)];
    const pulp = [P(-.12, .40), P(-.07, .52), P(0, .45), P(.07, .52), P(.12, .40), P(.11, .06), P(.08, .12, 1), P(.05, .45, 1), P(.026, .8, 1), P(.012, .965, 1), P(-.012, .965, 1), P(-.026, .8, 1), P(-.05, .45, 1), P(-.08, .12, 1), P(-.11, .06)];
    return {
      outer: [P(-.34, 0), P(-.47, .42), P(-.485, .66), P(-.40, .86), P(-.22, .96), P(0, 1.0), P(.22, .96), P(.40, .86), P(.485, .66), P(.47, .42), P(.34, 0), ...root],
      dentin: [P(-.332, 0), P(-.43, .40), P(-.43, .62), P(-.33, .78), P(0, .84), P(.33, .78), P(.43, .62), P(.43, .40), P(.332, 0), ...root],
      pulp, pulps: [pulp],
      apex: P(0, .975, 1), cx, cej, Wd, Hc, Lr, P,
    };
  }
  function canine(cx, cej, Wd, Hc, Lr, tilt = 0) {
    const P = shapeMaker(cx, cej, Wd, Hc, Lr, tilt);
    const root = [P(.27, .3, 1), P(.19, .62, 1), P(.10, .87, 1), P(.04, .99, 1), P(-.04, .99, 1), P(-.10, .87, 1), P(-.19, .62, 1), P(-.27, .3, 1)];
    const pulp = [P(-.09, .36), P(0, .54), P(.09, .36), P(.10, .05), P(.075, .12, 1), P(.045, .45, 1), P(.024, .8, 1), P(.01, .965, 1), P(-.01, .965, 1), P(-.024, .8, 1), P(-.045, .45, 1), P(-.075, .12, 1), P(-.10, .05)];
    return {
      outer: [P(-.32, 0), P(-.46, .45), P(-.44, .68), P(-.24, .88), P(0, 1.0), P(.24, .88), P(.44, .68), P(.46, .45), P(.32, 0), ...root],
      dentin: [P(-.312, 0), P(-.42, .43), P(-.40, .64), P(-.2, .80), P(0, .87), P(.2, .80), P(.40, .64), P(.42, .43), P(.312, 0), ...root],
      pulp, pulps: [pulp], cx, cej, Wd, Hc, Lr, P,
    };
  }
  /** lateral incisor: flat incisal edge, narrow single root */
  function incisor(cx, cej, Wd, Hc, Lr, tilt = 0) {
    const P = shapeMaker(cx, cej, Wd, Hc, Lr, tilt);
    const root = [P(.26, .3, 1), P(.19, .62, 1), P(.10, .88, 1), P(.035, .99, 1), P(-.035, .99, 1), P(-.10, .88, 1), P(-.19, .62, 1), P(-.26, .3, 1)];
    const pulp = [P(-.085, .40), P(-.05, .56), P(.05, .56), P(.085, .40), P(.09, .05), P(.07, .12, 1), P(.04, .45, 1), P(.022, .8, 1), P(.01, .965, 1), P(-.01, .965, 1), P(-.022, .8, 1), P(-.04, .45, 1), P(-.07, .12, 1), P(-.09, .05)];
    return {
      outer: [P(-.30, 0), P(-.42, .45), P(-.45, .80), P(-.42, .97), P(-.25, 1.0), P(.25, 1.0), P(.42, .97), P(.45, .80), P(.42, .45), P(.30, 0), ...root],
      dentin: [P(-.292, 0), P(-.39, .43), P(-.41, .74), P(-.34, .86), P(0, .88), P(.34, .86), P(.41, .74), P(.39, .43), P(.292, 0), ...root],
      pulp, pulps: [pulp], cx, cej, Wd, Hc, Lr, P,
    };
  }
  /** mandibular molar: two separate tapered roots, furcation with inter-radicular bone,
      chamber floor above the furcation, one centred canal per root (8 px -> 2 px) */
  function molar(cx, cej, Wd, Hc, Lr, tilt = 0) {
    const P = shapeMaker(cx, cej, Wd, Hc, Lr, tilt);
    const half = (s) => [P(s * .39, .22, 1), P(s * .37, .5, 1), P(s * .335, .8, 1), P(s * .30, .95, 1), P(s * .245, 1.0, 1), P(s * .19, .95, 1), P(s * .145, .8, 1), P(s * .115, .55, 1), P(s * .11, .36, 1), P(s * .065, .265, 1)];
    const roots = [...half(1), P(0, .245, 1), ...half(-1).reverse()];
    const chamber = [P(-.18, .19), P(-.15, .30), P(-.09, .21), P(.09, .21), P(.15, .30), P(.18, .19), P(.18, .0), P(.15, .085, 1), P(.05, .06, 1), P(-.05, .06, 1), P(-.15, .085, 1), P(-.18, .0)];
    const cl = (s) => [[s * .14, .03], [s * .19, .15], [s * .235, .32], [s * .24, .55], [s * .243, .8], [s * .245, .965]];
    const canals = [canalPoly(P, cl(1), 8, 2), canalPoly(P, cl(-1), 8, 2)];
    return {
      outer: [P(-.40, 0), P(-.49, .45), P(-.48, .74), P(-.40, .92), P(-.25, .99), P(-.13, .91), P(0, .95), P(.13, .91), P(.25, .99), P(.40, .92), P(.48, .74), P(.49, .45), P(.40, 0), ...roots],
      dentin: [P(-.392, 0), P(-.45, .44), P(-.44, .66), P(-.33, .78), P(0, .80), P(.33, .78), P(.44, .66), P(.45, .44), P(.392, 0), ...roots],
      pulps: [chamber, ...canals], cx, cej, Wd, Hc, Lr, P,
    };
  }

  // ------------------------------------------------------------ trabecular bone texture (Worley F2-F1, domain-warped)
  // o.mottle: [[scale px, amplitude], ...] low-frequency luminance mottling; o.dens(x,y): extra density
  function trabecular(w, h, seed, cell, base, amp, fine = 0.5, o = {}) {
    const c = mk(w, h), g = c.getContext('2d');
    const img = g.createImageData(w, h), d = img.data;
    const grids = [cell, cell * 0.52].map((cs, gi) => {
      const gw = Math.ceil(w / cs) + 3, gh = Math.ceil(h / cs) + 3, pts = new Float32Array(gw * gh * 2), sh = new Float32Array(gw * gh);
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        pts[(j * gw + i) * 2] = (i - 1 + 0.08 + 0.84 * hash(i, j, seed + gi * 11)) * cs;
        pts[(j * gw + i) * 2 + 1] = (j - 1 + 0.08 + 0.84 * hash(j, i, seed + 5 + gi * 11)) * cs;
        sh[j * gw + i] = hash(i, j, seed + 40 + gi);
      }
      return { cs, gw, pts, sh };
    });
    let shade = 0;
    const edge = (G, x, y) => {
      const gx = Math.floor(x / G.cs) + 1, gy = Math.floor(y / G.cs) + 1;
      let f1 = 1e9, f2 = 1e9, best = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const q = (gy + j) * G.gw + gx + i, k = q * 2, dx = G.pts[k] - x, dy = G.pts[k + 1] - y, dd = dx * dx + dy * dy;
        if (dd < f1) { f2 = f1; f1 = dd; best = q; } else if (dd < f2) f2 = dd;
      }
      shade = G.sh[best];
      return Math.sqrt(f2) - Math.sqrt(f1);
    };
    const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
    const mot = o.mottle || [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const wx = x + 0.5 * cell * noise2(x / (cell * 1.7), y / (cell * 1.7), seed + 1);
      const wy = y + 0.5 * cell * noise2(x / (cell * 1.7) + 9, y / (cell * 1.7) + 9, seed + 2);
      const th = cell * (0.06 + 0.04 * noise2(x / (cell * 2.5), y / (cell * 2.5), seed + 3));
      const e1 = edge(grids[0], wx, wy); const s1 = shade;
      const e2 = edge(grids[1], wx * 1.07 + 3, wy * 0.97 + 5);
      // break the network into struts (real trabeculae are not a closed honeycomb)
      const br1 = sm(-0.35, 0.25, noise2(x / (cell * 0.8), y / (cell * 0.8), seed + 6));
      const br2 = sm(-0.2, 0.3, noise2(x / (cell * 0.5) + 4, y / (cell * 0.5), seed + 7));
      const t1 = Math.exp(-(e1 * e1) / (2 * th * th)) * (0.35 + 0.65 * br1);
      const t2 = Math.exp(-(e2 * e2) / (2 * th * th * 0.45)) * br2;
      const dn = o.dens ? o.dens(x, y) : 0;
      let v = base + dn + amp * (1 + 2 * dn) * (t1 + fine * t2) + 0.05 * (s1 - 0.5) + 0.06 * noise2(x / (cell * 5), y / (cell * 5), seed + 4) + 0.025 * noise2(x / 1.6, y / 1.6, seed + 8);
      for (let m = 0; m < mot.length; m++) v += mot[m][1] * noise2(x / mot[m][0], y / mot[m][0], seed + 20 + m);
      v = clamp(v);
      const k = (y * w + x) * 4;
      d[k] = v * 236; d[k + 1] = v * 241; d[k + 2] = v * 246; d[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // ------------------------------------------------------------ build everything once
  const A = {};
  function build(FILM, PANEL) {
    const W = 1080, H = 1920;
    // ---- frame background: dark reading room
    A.bg = mk(W, H);
    { const g = A.bg.getContext('2d');
      g.fillStyle = '#08090b'; g.fillRect(0, 0, W, H);
      const rg = g.createRadialGradient(520, 860, 80, 520, 860, 1150);
      rg.addColorStop(0, '#191c21'); rg.addColorStop(0.55, '#0f1114'); rg.addColorStop(1, '#060708');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
      const R = rng(18);
      const img = g.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 7; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      g.putImageData(img, 0, 0);
    }

    const w = FILM.w, h = FILM.h;
    // ---- teeth geometry (patient's right mandible, labial mounting: distal on the viewer's left)
    const T47 = molar(64, 246, 194, 112, 214, 0.02);
    const T46 = molar(258, 244, 198, 116, 222, 0.0);
    const T45 = premolar(420, 240, 128, 120, 230, 0.0);
    const T44 = premolar(549, 238, 126, 121, 228, -0.01);
    const T43 = canine(675, 233, 136, 136, 280, -0.03);
    const T42 = incisor(796, 234, 100, 112, 232, -0.04);
    const TEETH = [T47, T46, T45, T44, T43, T42];
    A.t45 = T45;
    A.apex = { x: T45.apex[0], y: T45.apex[1] };
    A.pulpTop = Math.min(...T45.pulp.map((p) => p[1]));
    // scalloped alveolar crest: peaked interdental septa between the teeth
    const SEPTA = [[161, 26], [357, 23], [485, 20], [612, 18], [742, 15]];
    const crest = (x) => { let y = 286; for (const [xm, wd] of SEPTA) y -= 24 * Math.exp(-(((x - xm) / wd) ** 2)); return y + 1.5 * Math.sin(x * 0.11); };
    const boneClip = (g, off = 0) => { g.beginPath(); g.moveTo(0, crest(0) + off); for (let x = 0; x <= w; x += 4) g.lineTo(x, crest(x) + off); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); };

    // ---- bone layer: air / soft tissue / trabecular bone / mandibular canal / mental foramen
    const base0 = mk(w, h);
    { const g = base0.getContext('2d');
      const sg = g.createLinearGradient(0, 0, 0, 290);
      sg.addColorStop(0, gv(0.05)); sg.addColorStop(0.45, gv(0.085)); sg.addColorStop(1, gv(0.17));
      g.fillStyle = sg; g.fillRect(0, 0, w, h);
      // trabecular net at reduced contrast + two octaves of mottling; denser toward the crest and the base
      const tex = trabecular(Math.ceil(w / 2), Math.ceil(h / 2), 4507, 10, 0.37, 0.2 * 0.55, 0.6, {
        mottle: [[9, 0.035], [30, 0.04]],
        dens: (x, y) => 0.05 * Math.exp(-Math.max(0, y * 2 - crest(x * 2)) / 60) + 0.035 * clamp((y * 2 - 380) / 260),
      });
      g.save(); boneClip(g); g.clip();
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.filter = 'blur(1px)'; g.drawImage(tex, 0, 0, w, h); g.filter = 'none';
      // crestal cortical line (follows the scalloped septa)
      g.beginPath(); g.moveTo(0, crest(0) + 1); for (let x = 0; x <= w; x += 4) g.lineTo(x, crest(x) + 1);
      g.strokeStyle = gv(0.56, 0.75); g.lineWidth = 3; g.stroke();
      // mandibular canal (radiolucent band with radiopaque borders), fading out toward the mental foramen
      const cy = (x) => 590 - 0.00016 * (x - 40) * (x - 40) - 0.02 * x;
      const fade = g.createLinearGradient(0, 0, 480, 0);
      fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(0.72, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      const cv = mk(w, h), cg = cv.getContext('2d');
      cg.lineCap = 'round';
      const line = (off, lw, col) => { cg.beginPath(); for (let x = -10; x <= 480; x += 6) { const y = cy(x) + off; x === -10 ? cg.moveTo(x, y) : cg.lineTo(x, y); } cg.strokeStyle = col; cg.lineWidth = lw; cg.stroke(); };
      line(0, 34, gv(0.16, 0.85)); line(-18, 3, gv(0.66, 0.9)); line(18, 3, gv(0.66, 0.9));
      cg.globalCompositeOperation = 'destination-in'; cg.fillStyle = fade; cg.fillRect(0, 0, w, h);
      g.filter = 'blur(1.4px)'; g.drawImage(cv, 0, 0); g.filter = 'none';
      // mental foramen: faint, non-corticated oval below and between the premolar apices (kept clear of the lesion)
      A.mf = { x: 492, y: 532 };
      const mf = g.createRadialGradient(A.mf.x, A.mf.y, 2, A.mf.x, A.mf.y, 17);
      mf.addColorStop(0, 'rgba(10,11,13,0.42)'); mf.addColorStop(0.6, 'rgba(10,11,13,0.3)'); mf.addColorStop(1, 'rgba(10,11,13,0)');
      g.save(); g.translate(A.mf.x, A.mf.y); g.scale(1.2, 0.9); g.translate(-A.mf.x, -A.mf.y);
      g.fillStyle = mf; g.beginPath(); g.arc(A.mf.x, A.mf.y, 17, 0, Math.PI * 2); g.fill(); g.restore();
      g.restore();
    }
    A.filmBone = mk(w, h);
    { const g = A.filmBone.getContext('2d'); g.filter = 'blur(0.6px)'; g.drawImage(base0, 0, 0); }
    // net-free version of the bone: used inside a lesion, where the trabeculae are gone
    A.filmBoneSmooth = mk(w, h);
    { const g = A.filmBoneSmooth.getContext('2d'); g.filter = 'blur(7px)'; g.drawImage(base0, 0, 0); }

    // ---- PDL space (soft dark band ~3 px) + lamina dura (soft light band ~2 px), width wandering ±30 %
    A.filmPDL = mk(w, h);
    { const raw = mk(w, h), g = raw.getContext('2d');
      g.save(); boneClip(g, 5); g.clip();
      TEETH.forEach((T, i) => {
        const pts = crSample(T.outer, 2);
        band(g, pts, 10, gv(0.62), 300 + i);
        band(g, pts, 6, gv(0.16), 400 + i);
      });
      g.restore();
      const o = A.filmPDL.getContext('2d'); o.filter = 'blur(0.9px)'; o.drawImage(raw, 0, 0); }

    // ---- teeth layer
    const teeth0 = mk(w, h);
    { const g = teeth0.getContext('2d');
      for (const T of TEETH) {
        const x0 = T.cx - T.Wd * 0.5, x1 = T.cx + T.Wd * 0.5;
        // enamel cap (brightest natural tissue)
        const eg = g.createLinearGradient(x0, 0, x1, 0);
        eg.addColorStop(0, gv(0.78)); eg.addColorStop(0.18, gv(0.92)); eg.addColorStop(0.5, gv(0.96)); eg.addColorStop(0.82, gv(0.92)); eg.addColorStop(1, gv(0.78));
        g.beginPath(); crPath(g, T.outer); g.fillStyle = eg; g.fill();
        // dentin (cylindrical shading: thinner edges are darker)
        const dg = g.createLinearGradient(x0, 0, x1, 0);
        dg.addColorStop(0, gv(0.55)); dg.addColorStop(0.2, gv(0.71)); dg.addColorStop(0.5, gv(0.79)); dg.addColorStop(0.8, gv(0.71)); dg.addColorStop(1, gv(0.55));
        g.beginPath(); crPath(g, T.dentin); g.fillStyle = dg; g.fill();
        // root dentin a touch darker toward the apex
        const rg = g.createLinearGradient(0, T.cej, 0, T.cej + T.Lr);
        rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.16)');
        g.save(); g.beginPath(); crPath(g, T.dentin); g.clip(); g.fillStyle = rg; g.fillRect(x0 - 20, T.cej, T.Wd + 40, T.Lr + 10); g.restore();
        // cervical burnout: the neck between enamel and crest reads darker
        { const bg = g.createLinearGradient(0, T.cej - 30, 0, T.cej + 40);
          bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.45, 'rgba(0,0,0,0.27)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
          g.save(); g.beginPath(); crPath(g, T.outer); g.clip(); g.fillStyle = bg; g.fillRect(x0 - 20, T.cej - 30, T.Wd + 40, 70); g.restore(); }
        // pulp chamber + canal(s) (radiolucent)
        g.save(); g.filter = 'blur(1px)'; g.fillStyle = gv(0.27);
        for (const p of T.pulps) { g.beginPath(); crPath(g, p); g.fill(); }
        g.restore();
      }
      // 46: occlusal amalgam (radiopaque, crisp)
      { const P = T46.P;
        g.beginPath(); crPath(g, [P(-.27, .93), P(-.12, .86), P(0, .9), P(.13, .86), P(.27, .93), P(.24, .70), P(.08, .64), P(-.07, .66), P(-.22, .70)]);
        g.fillStyle = gv(1.0); g.fill();
        g.strokeStyle = gv(0.9); g.lineWidth = 1; g.stroke(); }
      // 45: deep distal caries reaching the pulp horn (radiolucent)
      { const P = T45.P;
        g.save(); g.beginPath(); crPath(g, T45.outer); g.clip(); g.filter = 'blur(2.2px)';
        g.beginPath(); crPath(g, [P(-.52, .74), P(-.40, .80), P(-.26, .72), P(-.12, .60), P(-.07, .52), P(-.13, .46), P(-.27, .45), P(-.42, .48), P(-.52, .58)]);
        g.fillStyle = gv(0.13, 0.95); g.fill();
        g.restore(); }
    }
    A.filmTeeth = mk(w, h);
    { const g = A.filmTeeth.getContext('2d'); g.globalAlpha = 0.93; g.filter = 'blur(1.05px)'; g.drawImage(teeth0, 0, 0); }

    // ---- grain + vignette
    A.grain = mk(w + 64, h + 64);
    { const g = A.grain.getContext('2d'); const img = g.createImageData(w + 64, h + 64), d = img.data, R = rng(77);
      for (let i = 0; i < d.length; i += 4) { const n = 128 + (R() + R() + R() - 1.5) * 95; d[i] = d[i + 1] = d[i + 2] = n; d[i + 3] = 255; }
      g.putImageData(img, 0, 0);
      const tmp = mk(w + 64, h + 64), tg = tmp.getContext('2d'); tg.filter = 'blur(0.45px)'; tg.drawImage(A.grain, 0, 0);
      g.clearRect(0, 0, w + 64, h + 64); g.drawImage(tmp, 0, 0); }
    A.vignette = mk(w, h);
    { const g = A.vignette.getContext('2d');
      const vg = g.createRadialGradient(w / 2, h * 0.52, w * 0.28, w / 2, h * 0.52, w * 0.74);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      g.fillStyle = vg; g.fillRect(0, 0, w, h); }
    // per-frame scratch canvases
    A.tmpS = mk(260, 260); A.tmpSg = A.tmpS.getContext('2d');
    A.tmpP = mk(w, h); A.tmpPg = A.tmpP.getContext('2d');
    A.tmpW = mk(200, 200); A.tmpWg = A.tmpW.getContext('2d');

    buildHE(PANEL);
    buildXsec(PANEL);
    return A;
  }

  /** radiolucency: darkens bone around the apex (drawn under the teeth layer, so the root stays visible) */
  function lesionDark(f, ap, R, a) {
    const cx = ap.x, cy = ap.y + 5;
    f.save(); f.filter = 'blur(5px)';
    const g = f.createRadialGradient(cx, cy - R * 0.1, 0, cx, cy, R * 1.1);
    g.addColorStop(0, `rgba(12,13,15,${0.72 * a})`); g.addColorStop(0.6, `rgba(12,13,15,${0.62 * a})`); g.addColorStop(0.88, `rgba(12,13,15,${0.3 * a})`); g.addColorStop(1, 'rgba(12,13,15,0)');
    f.beginPath(); blobPath(f, cx, cy, R * 1.08, 11, 0.86); f.fillStyle = g; f.fill();
    f.restore();
  }

  /** film bone + periapical changes + PDL/lamina dura (everything under the teeth layer).
      st = { R: true lesion radius (film px), vis: 0..1 clear radiolucency, subtle: 0..1 early signs } */
  function composeBone(f, st) {
    const ap = A.apex, cx = ap.x, cy = ap.y + 4;
    f.drawImage(A.filmBone, 0, 0);
    const luc = 0.24 * st.subtle + 0.76 * st.vis;
    if (luc > 0.003) {
      const R = Math.max(st.R, 14), S = A.tmpS, g = A.tmpSg, hs = S.width / 2;
      // trabecular net washes out inside the lesion (~70 %)
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, S.width, S.height);
      g.drawImage(A.filmBoneSmooth, cx - hs, cy - hs, S.width, S.height, 0, 0, S.width, S.height);
      g.globalCompositeOperation = 'destination-in';
      const m = g.createRadialGradient(hs, hs, 0, hs, hs, R * 1.05);
      m.addColorStop(0, `rgba(0,0,0,${0.7 * luc})`); m.addColorStop(0.7, `rgba(0,0,0,${0.62 * luc})`); m.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = m; g.fillRect(0, 0, S.width, S.height);
      g.globalCompositeOperation = 'source-over';
      f.drawImage(S, cx - hs, cy - hs);
      lesionDark(f, ap, R, luc);
    }
    // early sign: widened apical PDL space (soft dark band hugging the apex)
    if (st.subtle > 0.003) {
      const T = A.tmpW, g = A.tmpWg, hs = T.width / 2;
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, T.width, T.height);
      g.save(); g.translate(hs - cx, hs - cy);
      g.beginPath(); crPath(g, A.t45.outer); g.strokeStyle = gv(0.1); g.lineWidth = lerp(6, 18, st.subtle); g.stroke();
      g.restore();
      g.globalCompositeOperation = 'destination-in';
      const m = g.createRadialGradient(hs, hs - 10, 0, hs, hs - 10, 46);
      m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.55, 'rgba(0,0,0,0.85)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = m; g.fillRect(0, 0, T.width, T.height);
      g.globalCompositeOperation = 'source-over';
      f.save(); f.globalAlpha = 0.9 * st.subtle; f.filter = 'blur(1.4px)'; f.drawImage(T, cx - hs, cy - hs); f.restore();
    }
    // PDL / lamina dura: broken at the apex in the early phase, erased inside the radiolucency
    const P = A.tmpP, pg = A.tmpPg;
    pg.globalCompositeOperation = 'source-over'; pg.clearRect(0, 0, P.width, P.height);
    pg.drawImage(A.filmPDL, 0, 0);
    const er = Math.max(st.vis, 0.7 * st.subtle);
    if (er > 0.003) {
      pg.globalCompositeOperation = 'destination-out';
      const Re = Math.max(st.R * 1.05 * st.vis, 24);
      const m = pg.createRadialGradient(cx, cy - 4, 0, cx, cy - 4, Re);
      m.addColorStop(0, `rgba(0,0,0,${er})`); m.addColorStop(0.7, `rgba(0,0,0,${0.85 * er})`); m.addColorStop(1, 'rgba(0,0,0,0)');
      pg.fillStyle = m; pg.fillRect(cx - Re, cy - 4 - Re, 2 * Re, 2 * Re);
      pg.globalCompositeOperation = 'source-over';
    }
    f.drawImage(P, 0, 0);
  }

  // ================================================================= H&E-style inset
  const HE = {
    tissue: '#f6d4e2', fiber: '#e8a2c2', nuc: '#6a3a91', rbc: '#df4069',
    dentin: '#e7b3d4', tubule: '#d398c2', cem: '#f0c8dd', canal: '#4a2a6e', bac: '#2f164f',
    bone: '#e07ca7', lam: '#cc6795', ocy: '#5a2f83',
    mac: '#e5c4e6', macM: '#b88ac8', macN: '#55307f',
    lym: '#3a1a62', pla: '#c495cf', plaN: '#4a2373',
    ocl: '#8e3f86', oclM: '#5e1f63', oclN: '#2a0d40',
    cyto: '#7a2bb0', rankl: '#c2185b', opg: '#2c5aa0', ink: '#2a1440',
  };
  const ROOT = [[8, -6], [26, 60], [58, 128], [92, 168], [122, 182], [152, 168], [186, 128], [214, 60], [240, -6]];
  const CANAL = [[100, -6], [108, 80], [114, 140], [118, 176], [126, 176], [131, 140], [138, 80], [146, -6]];
  const COL = { x: 122, y: 197 };
  const MAC = [[252, 142], [312, 208], [378, 132], [252, 216]];
  const LYM = [[332, 160], [300, 254], [420, 182], [446, 270], [282, 100], [470, 118], [214, 262]];
  const PLA = [[362, 250], [482, 226], [214, 122]];
  const STROMA = [[515, 150, 0.45], [590, 236, -0.35], [522, 276, 0.15]];
  const LAC = [128, 208, 288];
  const PMN = [[176, 210], [204, 172], [70, 214], [96, 236]];
  const boneEdgeBase = (y) => 640 + 16 * Math.sin(y * 0.017 + 0.8) + 7 * Math.sin(y * 0.045 + 2.1);

  function buildHE(PANEL) {
    const w = PANEL.w, h = PANEL.h, R = rng(1801);
    A.heBase = mk(w, h);
    const g = A.heBase.getContext('2d');
    g.fillStyle = HE.tissue; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = R() * w, y = R() * h, r = 30 + R() * 90, col = R() < 0.5 ? [251, 230, 239] : [238, 184, 207];
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(col, 0.45)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    g.lineCap = 'round';
    for (let i = 0; i < 170; i++) {
      let x = R() * w, y = R() * h;
      const ang = -0.5 + R() * 1.0 + 0.4 * Math.sin(y / 70), len = 50 + R() * 130;
      g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < len; s += 5) { const a = ang + 0.3 * Math.sin(s / 14 + i); x += Math.cos(a) * 5; y += Math.sin(a) * 5; g.lineTo(x, y); }
      g.strokeStyle = rgba(R() < 0.5 ? '#e497ba' : '#eeb2cd', 0.3 + R() * 0.35); g.lineWidth = 0.8 + R() * 1.6; g.stroke();
    }
    // fibroblast nuclei
    for (let i = 0; i < 55; i++) {
      const x = R() * w, y = R() * h;
      g.save(); g.translate(x, y); g.rotate(-0.5 + R() * 1.0);
      g.beginPath(); g.ellipse(0, 0, 8 + R() * 6, 2.4 + R() * 1.3, 0, 0, Math.PI * 2); g.fillStyle = rgba(HE.nuc, 0.75 + R() * 0.2); g.fill();
      g.restore();
    }
    // capillaries with RBCs
    const vessel = (x, y, rx, ry, rot) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = '#fbe9f1'; g.fill();
      g.strokeStyle = '#d98bb2'; g.lineWidth = 2.5; g.stroke();
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.beginPath(); g.ellipse(Math.cos(a) * rx, Math.sin(a) * ry, 5, 1.8, a + Math.PI / 2, 0, Math.PI * 2); g.fillStyle = HE.nuc; g.fill(); }
      for (let k = 0; k < 5; k++) { g.beginPath(); g.arc((R() - 0.5) * rx, (R() - 0.5) * ry, 4.2, 0, Math.PI * 2); g.fillStyle = HE.rbc; g.fill(); }
      g.restore();
    };
    vessel(440, 300, 24, 14, 0.4); vessel(470, 70, 18, 11, -0.3); vessel(330, 340, 20, 12, 0.1); vessel(40, 330, 18, 12, 0.6);
    // root apex: dentin with tubules, cementum rim, infected canal
    g.save();
    g.beginPath(); crPath(g, ROOT); g.fillStyle = HE.dentin; g.fill();
    g.clip();
    for (let k = -30; k < 60; k++) {
      const yy = k * 5;
      g.beginPath(); g.moveTo(123, yy); g.quadraticCurveTo(70, yy - 8, -10, yy - 40); g.moveTo(123, yy); g.quadraticCurveTo(176, yy - 8, 260, yy - 40);
      g.strokeStyle = rgba(HE.tubule, 0.55); g.lineWidth = 1; g.stroke();
    }
    g.restore();
    g.beginPath(); crPath(g, ROOT); g.strokeStyle = HE.cem; g.lineWidth = 7; g.stroke();
    g.beginPath(); crPath(g, ROOT); g.strokeStyle = '#c47bab'; g.lineWidth = 1.6; g.stroke();
    g.beginPath(); crPath(g, CANAL); g.fillStyle = HE.canal; g.fill();
    for (let i = 0; i < 160; i++) {
      const yy = R() * 180, half = lerp(22, 4, yy / 180);
      const xx = 123 + (R() - 0.5) * 2 * half;
      g.beginPath(); g.arc(xx, yy, 1.2 + R() * 1.4, 0, Math.PI * 2); g.fillStyle = rgba(HE.bac, 0.9); g.fill();
    }
    // bone texture (clipped per frame to the resorbing edge)
    A.heBone = mk(w, h);
    const b = A.heBone.getContext('2d');
    b.fillStyle = HE.bone; b.fillRect(0, 0, w, h);
    for (let k = 0; k < 34; k++) {
      b.beginPath();
      for (let y = -4; y <= h + 4; y += 6) { const x = boneEdgeBase(y) + 10 + k * 7 + 3 * Math.sin(y * 0.05 + k); y === -4 ? b.moveTo(x, y) : b.lineTo(x, y); }
      b.strokeStyle = rgba(HE.lam, 0.35 + 0.25 * hash(k, 2)); b.lineWidth = 1 + hash(k, 3); b.stroke();
    }
    for (let i = 0; i < 30; i++) {
      const y = R() * h, x = boneEdgeBase(y) + 60 + R() * 150;
      b.save(); b.translate(x, y); b.rotate(0.1 + (R() - 0.5) * 0.4);
      b.beginPath(); b.ellipse(0, 0, 8, 4, Math.PI / 2, 0, Math.PI * 2); b.fillStyle = '#f5c6da'; b.fill();
      b.beginPath(); b.ellipse(0, 0, 4.5, 2.2, Math.PI / 2, 0, Math.PI * 2); b.fillStyle = HE.ocy; b.fill();
      b.restore();
    }
  }

  /** resorbing bone surface: Howship's lacunae deepen by ~45 px during step 5 */
  function boneEdge(y, t, STEP) {
    let x = boneEdgeBase(y);
    for (let k = 0; k < LAC.length; k++) {
      const d = 45 * seg(t, STEP[4] + 0.1 * k, STEP[4] + 1.1 + 0.1 * k, ease.inOut);
      const u = (y - LAC[k]) / 48;
      if (Math.abs(u) < 1) x += d * Math.pow(Math.cos((u * Math.PI) / 2), 2);
    }
    return x;
  }

  function cellBlob(c, x, y, r, seed, t, wob = 0.12, sy = 1) {
    c.beginPath();
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const rr = r * (1 + wob * noise2(Math.cos(a) * 1.4 + t * 0.6, Math.sin(a) * 1.4, seed));
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * sy;
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath();
  }
  const macPos = (i, t, STEP) => {
    const [mx, my] = MAC[i];
    const u = seg(t, STEP[1] + i * 0.18, STEP[1] + 1.1 + i * 0.18, ease.out);
    return [lerp(mx + 260, mx, u), lerp(my + 70, my, u), u];
  };
  const oclPos = (k, t, STEP) => [boneEdge(LAC[k], t, STEP) - 20, LAC[k]];
  function badge(c, x, y, n, a) {
    if (a <= 0.01) return;
    c.save(); c.globalAlpha *= a;
    c.beginPath(); c.arc(x, y, 14, 0, Math.PI * 2); c.fillStyle = HE.ink; c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = '#fff'; c.font = `700 18px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(n), x, y + 1);
    c.restore();
  }

  function drawHE(c, t, STEP) {
    const w = 840, h = 386;
    c.drawImage(A.heBase, 0, 0);
    const st = STEP.map((s) => seg(t, s, s + 0.6, ease.out));
    let active = -1; STEP.forEach((s, i) => { if (t >= s) active = i; });

    // ---- bone with Howship's lacunae (step 5)
    c.save();
    c.beginPath(); c.moveTo(boneEdge(-4, t, STEP), -4);
    for (let y = 0; y <= h + 4; y += 4) c.lineTo(boneEdge(y, t, STEP), y);
    c.lineTo(w + 4, h + 4); c.lineTo(w + 4, -4); c.closePath();
    c.save(); c.clip(); c.drawImage(A.heBone, 0, 0); c.restore();
    c.strokeStyle = '#bf5287'; c.lineWidth = 2; c.stroke();
    c.restore();
    // bone-lining cells (flat nuclei) where no resorption is going on
    for (let y = 14; y < h; y += 30) {
      let near = 1e9; LAC.forEach((ly) => { near = Math.min(near, Math.abs(y - ly)); });
      if (near < 48 && t > STEP[4]) continue;
      const x = boneEdge(y, t, STEP) - 5;
      c.beginPath(); c.ellipse(x, y, 2.6, 8, 0.15, 0, Math.PI * 2); c.fillStyle = rgba(HE.nuc, 0.85); c.fill();
    }

    // ---- bacterial colony at the foramen (+ LPS shedding, step 1)
    c.save(); c.filter = 'blur(1.5px)';
    cellBlob(c, COL.x, COL.y - 2, 26, 77, t * 0.3, 0.18, 0.72); c.fillStyle = 'rgba(74,40,112,0.78)'; c.fill();
    c.restore();
    for (let i = 0; i < 90; i++) {
      const a = hash(i, 1) * Math.PI * 2, r = Math.sqrt(hash(i, 2)) * 1.05;
      const x = COL.x + Math.cos(a) * r * 34 + 1.2 * Math.sin(t * 3 + i);
      const y = COL.y + Math.sin(a) * r * 20 + 1.2 * Math.cos(t * 2.6 + i);
      c.save(); c.translate(x, y); c.rotate(hash(i, 3) * 3);
      c.beginPath();
      if (i % 3 === 0) c.ellipse(0, 0, 4.4, 1.9, 0, 0, Math.PI * 2); else c.arc(0, 0, 2.1, 0, Math.PI * 2);
      c.fillStyle = rgba(HE.bac, 0.92); c.fill();
      c.restore();
    }
    if (st[0] > 0) {
      const N = 30;
      for (let i = 0; i < N; i++) {
        const a = -1.0 + hash(i, 7) * 2.7, life = 2.3;
        const ph = ((t - STEP[0]) / life + i / N) % 1;
        const born = seg(t, STEP[0] + (i / N) * 1.0, STEP[0] + (i / N) * 1.0 + 0.3);
        const r = 28 + ph * (150 + 60 * hash(i, 8));
        const x = COL.x + Math.cos(a) * r, y = COL.y + Math.sin(a) * r * 0.8;
        c.beginPath(); c.arc(x, y, 2.8, 0, Math.PI * 2);
        c.fillStyle = rgba('#6b3aa0', 0.85 * born * Math.sin(Math.PI * ph)); c.fill();
      }
    }
    // neutrophils (early innate response)
    PMN.forEach(([x, y], i) => {
      cellBlob(c, x, y, 11, 40 + i, t, 0.08); c.fillStyle = 'rgba(244,214,232,0.95)'; c.fill();
      c.strokeStyle = 'rgba(190,130,175,0.8)'; c.lineWidth = 1; c.stroke();
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + i; c.beginPath(); c.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, 0, Math.PI * 2); c.fillStyle = HE.macN; c.fill(); }
    });

    // ---- macrophages migrate in (step 2)
    MAC.forEach((_, i) => {
      const [x, y, u] = macPos(i, t, STEP);
      if (u <= 0) return;
      c.save(); c.globalAlpha *= clamp(u * 2);
      cellBlob(c, x, y, 27, 60 + i, t + i, 0.16);
      c.fillStyle = HE.mac; c.fill(); c.strokeStyle = HE.macM; c.lineWidth = 1.6; c.stroke();
      for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + 9 * Math.cos(k * 1.7 + i), y + 9 * Math.sin(k * 1.7 + i), 2.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill(); }
      if (u > 0.9) for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x - 10 + k * 4, y + 8 - k * 2, 1.9, 0, Math.PI * 2); c.fillStyle = HE.bac; c.fill(); }
      c.save(); c.translate(x + 4, y - 3); c.rotate(0.5 + i);
      c.beginPath(); c.ellipse(0, 0, 9.5, 6.2, 0, 0.35, Math.PI * 2 - 0.35); c.quadraticCurveTo(2, 0, 9.5 * Math.cos(0.35), 6.2 * Math.sin(0.35));
      c.fillStyle = HE.macN; c.fill(); c.restore();
      c.restore();
    });
    // ---- lymphocytes (T cells; step 2) and plasma cells (step 3): the adaptive, chronic infiltrate
    LYM.forEach(([lx, ly], i) => {
      const u = seg(t, STEP[1] + 0.25 + i * 0.12, STEP[1] + 1.2 + i * 0.12, ease.out);
      if (u <= 0) return;
      const x = lerp(lx + 200, lx, u), y = lerp(ly + 50, ly, u);
      c.save(); c.globalAlpha *= clamp(u * 2);
      c.beginPath(); c.arc(x, y, 8.5, 0, Math.PI * 2); c.fillStyle = '#efd2e6'; c.fill();
      c.beginPath(); c.arc(x + 0.6, y - 0.4, 6.6, 0, Math.PI * 2); c.fillStyle = HE.lym; c.fill();
      c.restore();
    });
    PLA.forEach(([px, py], i) => {
      const u = seg(t, STEP[2] + 0.2 + i * 0.2, STEP[2] + 0.9 + i * 0.2, ease.out);
      if (u <= 0) return;
      c.save(); c.globalAlpha *= u; c.translate(px, py); c.rotate(0.4 + i);
      c.beginPath(); c.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2); c.fillStyle = HE.pla; c.fill();
      c.beginPath(); c.arc(-4.5, 0, 6.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,240,248,0.75)'; c.fill();       // perinuclear halo
      c.beginPath(); c.arc(-5, 0, 5, 0, Math.PI * 2); c.fillStyle = HE.plaN; c.fill();                              // eccentric nucleus
      for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-5 + 2.8 * Math.cos(k * 1.26), 2.8 * Math.sin(k * 1.26), 1.1, 0, Math.PI * 2); c.fillStyle = '#20093a'; c.fill(); }
      c.restore();
    });

    // ---- stromal cells (RANKL+ cells are mostly fibroblast-like) + OPG decoys
    STROMA.forEach(([x, y, rot], i) => {
      c.save(); c.translate(x, y); c.rotate(rot);
      c.beginPath(); c.ellipse(0, 0, 30, 9, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(240,196,220,0.95)'; c.fill();
      c.strokeStyle = 'rgba(176,110,160,0.9)'; c.lineWidth = 1.2; c.stroke();
      c.beginPath(); c.ellipse(0, 0, 12, 4.2, 0, 0, Math.PI * 2); c.fillStyle = HE.nuc; c.fill();
      const n = 10;
      for (let k = 0; k < n; k++) {
        const sk = seg(t, STEP[3] + k * 0.05, STEP[3] + 0.35 + k * 0.05, ease.out);
        if (sk <= 0) continue;
        const a = (k / n) * Math.PI * 2, ex = Math.cos(a) * 30, ey = Math.sin(a) * 9;
        const nx = Math.cos(a) * 9, ny = Math.sin(a) * 30, nl = Math.hypot(nx, ny);
        const L = 10 * sk;
        c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + (nx / nl) * L, ey + (ny / nl) * L);
        c.strokeStyle = HE.rankl; c.lineWidth = 2.2; c.stroke();
        c.beginPath(); c.arc(ex + (nx / nl) * L, ey + (ny / nl) * L, 2.8 * sk, 0, Math.PI * 2); c.fillStyle = HE.rankl; c.fill();
      }
      c.restore();
    });
    const opgA = 1 - 0.6 * seg(t, STEP[3] + 0.1, STEP[3] + 0.9);
    if (opgA > 0.01) for (let i = 0; i < 14; i++) {
      const s = STROMA[i % 3], a = hash(i, 21) * 6.28 + t * 0.4, r = 42 + 18 * hash(i, 22);
      c.beginPath(); c.arc(s[0] + Math.cos(a) * r, s[1] + Math.sin(a) * r * 0.7, 3.6, 0, Math.PI * 2);
      c.fillStyle = rgba(HE.opg, 0.85 * opgA); c.fill();
    }

    // ---- cytokines / PGE2 from macrophages -> stroma (step 3), with short trails
    if (st[2] > 0) {
      const N = 30, life = 1.7;
      for (let i = 0; i < N; i++) {
        const born = seg(t, STEP[2] + (i / N) * 0.9, STEP[2] + (i / N) * 0.9 + 0.25);
        if (born <= 0) continue;
        const m = MAC[i % 4], s = STROMA[i % 3];
        const cx = (m[0] + s[0]) / 2, cy = (m[1] + s[1]) / 2 - 40 + 80 * hash(i, 31);
        for (let k = 3; k >= 0; k--) {
          const ph = ((t - STEP[2]) / life + i / N) % 1 - k * 0.028;
          if (ph < 0) continue;
          const u = ease.inOut(ph);
          const x = (1 - u) * (1 - u) * m[0] + 2 * (1 - u) * u * cx + u * u * s[0];
          const y = (1 - u) * (1 - u) * m[1] + 2 * (1 - u) * u * cy + u * u * s[1];
          c.beginPath(); c.arc(x, y, 6 - k * 1.2, 0, Math.PI * 2);
          c.fillStyle = rgba(HE.cyto, 0.9 * born * Math.sin(Math.PI * clamp(ph)) * (k ? 0.45 / k : 1)); c.fill();
        }
      }
    }

    // ---- osteoclasts in Howship's lacunae (step 5): large, multinucleated, ruffled border on the bone
    LAC.forEach((ly, k) => {
      const u = seg(t, STEP[4] + 0.15 * k, STEP[4] + 0.7 + 0.15 * k, ease.out);
      if (u <= 0) return;
      const [x, y] = oclPos(k, t, STEP);
      c.save(); c.globalAlpha *= u; c.translate(x, y); c.scale(lerp(0.6, 1, u), lerp(0.6, 1, u));
      c.save(); c.scale(0.6, 0.7);
      cellBlob(c, 0, 0, 54, 90 + k, t, 0.07, 1);
      c.restore();
      c.fillStyle = HE.ocl; c.fill(); c.strokeStyle = HE.oclM; c.lineWidth = 1.8; c.stroke();
      // ruffled border facing bone
      c.beginPath();
      for (let yy = -26; yy <= 26; yy += 2) { const xx = 26 + 3 * Math.sin(yy * 1.3 + t * 5) - 0.006 * yy * yy; yy === -26 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); }
      c.strokeStyle = '#f3c3e4'; c.lineWidth = 2; c.stroke();
      for (let n = 0; n < 6; n++) {
        const nx = -11 + (n % 2) * 12, ny = -22 + Math.floor(n / 2) * 20 + (n % 2) * 4;
        c.beginPath(); c.ellipse(nx, ny, 5, 3.8, 0.3, 0, Math.PI * 2); c.fillStyle = HE.oclN; c.fill();
      }
      c.restore();
    });

    // ---- numbered badges on one cell of each type (match the numbered labels)
    const bpos = [
      [COL.x + 34, COL.y - 26],
      (() => { const [x, y] = macPos(2, t, STEP); return [x + 22, y - 24]; })(),
      [452, 198],
      [STROMA[0][0] + 28, STROMA[0][1] - 26],
      (() => { const [x, y] = oclPos(1, t, STEP); return [x - 30, y - 30]; })(),
    ];
    // ---- labels (numbered, accumulate; the newest is emphasised and tied to its cell by a leader)
    const labels = [
      { x: 175, y: 262, parts: [['Bacteria · LPS', HE.ink]] },
      { x: 325, y: 44, parts: [['Macrophages · T cells', HE.ink]] },
      { x: 422, y: 345, parts: [['IL-1β · TNF-α · PGE', HE.cyto], ['2', HE.cyto, 'sub']] },
      { x: 675, y: 52, parts: [['RANKL', HE.rankl], [' : ', HE.ink], ['OPG', HE.opg], [' ↑', HE.ink]], bar: true },
      { x: 718, y: 345, parts: [['Osteoclasts', HE.ink]] },
    ];
    const boxes = labels.map((lb) => pillBox(c, lb));
    labels.forEach((lb, i) => {
      if (st[i] <= 0 || i !== active) return;
      const lead = st[i] * (1 - seg(t, (STEP[i + 1] || 99) - 0.2, STEP[i + 1] || 99));
      const b = boxes[i], [bx, by] = bpos[i];
      const px = clamp(bx, b.x0 + 24, b.x0 + b.w - 24), py = by < b.y0 ? b.y0 : b.y0 + b.h;
      c.save(); c.globalAlpha *= 0.8 * lead; c.strokeStyle = HE.ink; c.lineWidth = 2;
      c.beginPath(); c.moveTo(px, py); c.lineTo(bx, by); c.stroke(); c.restore();
    });
    bpos.forEach(([x, y], i) => badge(c, x, y, i + 1, st[i]));
    labels.forEach((lb, i) => {
      if (st[i] <= 0) return;
      pill(c, lb, i + 1, st[i], i === active, t, STEP);
    });
    // tag, running vertically along the right edge (inside the bone)
    c.save();
    c.font = `500 22px ${SANS}`;
    const tag = 'H&E-style schematic', tw = c.measureText(tag).width;
    // centred in the gap between label 4 (bottom) and label 5 (top) so it never touches either pill
    const gTop = boxes[3].y0 + boxes[3].h, gBot = boxes[4].y0;
    c.translate(w - 24, (gTop + gBot) / 2); c.rotate(-Math.PI / 2);
    c.beginPath(); c.roundRect(-tw / 2 - 8, -16, tw + 16, 32, 8); c.fillStyle = 'rgba(42,20,64,0.72)'; c.fill();
    c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(tag, 0, 1);
    c.restore();
  }

  function richWidth(c, parts) {
    let w = 0;
    for (const [s, , sub] of parts) { c.font = sub ? `600 20px ${SANS}` : `600 30px ${SANS}`; w += c.measureText(s).width; }
    return w;
  }
  function pillBox(c, lb) {
    c.save(); const wText = richWidth(c, lb.parts); c.restore();
    const w = 14 + 30 + 10 + wText + 22, h = lb.bar ? 66 : 48;
    const x0 = clamp(lb.x - w / 2, 6, 840 - 6 - w), y0 = lb.y - h / 2;
    return { x0, y0, w, h, wText };
  }
  function pill(c, lb, num, u, isActive, t, STEP) {
    const { x0, y0, w: pw, h: ph, wText } = pillBox(c, lb);
    c.save();
    const s = lerp(0.85, 1, ease.outBack(u)) * (isActive ? 1.0 : 0.97);
    c.translate(x0 + pw / 2, lb.y); c.scale(s, s); c.translate(-(x0 + pw / 2), -lb.y);
    c.globalAlpha *= clamp(u * 1.5) * (isActive ? 1 : 0.86);
    c.shadowColor = 'rgba(60,20,60,0.25)'; c.shadowBlur = 10; c.shadowOffsetY = 3;
    c.beginPath(); c.roundRect(x0, y0, pw, ph, 14); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
    c.shadowColor = 'transparent';
    if (isActive) { c.strokeStyle = HE.ink; c.lineWidth = 3; c.stroke(); }
    const ty = y0 + 24;
    c.beginPath(); c.arc(x0 + 14 + 15, ty, 15, 0, Math.PI * 2); c.fillStyle = HE.ink; c.fill();
    c.fillStyle = '#fff'; c.font = `700 20px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(num), x0 + 29, ty + 1);
    let x = x0 + 14 + 30 + 10;
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    for (const [str, col, sub] of lb.parts) {
      c.font = sub ? `600 20px ${SANS}` : `600 30px ${SANS}`; c.fillStyle = col;
      c.fillText(str, x, ty + (sub ? 16 : 10));
      x += c.measureText(str).width;
    }
    // RANKL : OPG ratio bar inside label 4 (the ratio tips toward RANKL)
    if (lb.bar) {
      const ratio = lerp(0.5, 0.82, seg(t, STEP[3], STEP[3] + 1.0, ease.inOut));
      const bx = x0 + 54, by = y0 + 46, bw = wText, bh = 10;
      c.beginPath(); c.roundRect(bx, by, bw * ratio, bh, [5, 0, 0, 5]); c.fillStyle = HE.rankl; c.fill();
      c.beginPath(); c.roundRect(bx + bw * ratio, by, bw * (1 - ratio), bh, [0, 5, 5, 0]); c.fillStyle = HE.opg; c.fill();
    }
    c.restore();
  }

  // ================================================================= CBCT-style cross-section (bucco-lingual slice)
  const XS = { lc: { x: 400, y: 198 } };
  const XB = (y) => 330 - 0.07 * (y - 200), XL = (y) => 505 + 0.28 * (y - 200), CT = 18;
  /** adds the slice outline to the current path (caller calls beginPath) */
  function slicePath(c, inset) {
    const top = 46 + inset * 0.55;
    c.moveTo(XB(400) + inset, 400);
    c.lineTo(XB(110) + inset, 110);
    c.quadraticCurveTo(XB(top) + inset, top + 2, XB(top) + inset + 16, top);
    c.lineTo(XL(top) - inset - 16, top - 4);
    c.quadraticCurveTo(XL(top) - inset, top - 2, XL(110) - inset, 110);
    c.lineTo(XL(400) - inset, 400);
    c.closePath();
  }
  const XROOT = [[364, -10], [368, 60], [376, 130], [388, 178], [400, 192], [412, 178], [424, 130], [432, 60], [436, -10]];
  const XCANAL = [[394, -10], [396, 90], [399, 174], [402, 174], [405, 90], [407, -10]];
  const BEAMS = [126, 162, 198, 234, 270];
  function buildXsec(PANEL) {
    const w = PANEL.w, h = PANEL.h;
    const base = mk(w, h);
    const g = base.getContext('2d');
    const sg = g.createRadialGradient(400, 40, 20, 400, 40, 260);
    sg.addColorStop(0, gv(0.2, 0.9)); sg.addColorStop(1, gv(0.2, 0));
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    // cortical plates
    g.beginPath(); slicePath(g, 0); g.fillStyle = gv(0.88); g.fill();
    // cancellous interior
    const tex = trabecular(w, h, 913, 15, 0.34, 0.26, 0.55);
    g.save(); g.beginPath(); slicePath(g, CT); g.clip(); g.drawImage(tex, 0, 0); g.restore();
    g.save(); g.beginPath(); slicePath(g, CT); g.strokeStyle = gv(0.7, 0.8); g.lineWidth = 3; g.stroke(); g.restore();
    // PDL + lamina dura
    g.save(); g.beginPath(); slicePath(g, 4); g.clip();
    g.beginPath(); crPath(g, XROOT, false); g.strokeStyle = gv(0.74); g.lineWidth = 10; g.stroke();
    g.beginPath(); crPath(g, XROOT, false); g.strokeStyle = gv(0.15); g.lineWidth = 5; g.stroke();
    g.restore();
    A.xsBase = mk(w, h);
    { const b = A.xsBase.getContext('2d'); b.filter = 'blur(0.6px)'; b.drawImage(base, 0, 0); }
    A.xsRoot = mk(w, h);
    const r = A.xsRoot.getContext('2d');
    const rg = r.createLinearGradient(364, 0, 436, 0);
    rg.addColorStop(0, gv(0.62)); rg.addColorStop(0.5, gv(0.86)); rg.addColorStop(1, gv(0.62));
    r.beginPath(); crPath(r, XROOT, false); r.closePath(); r.fillStyle = rg; r.fill();
    r.beginPath(); crPath(r, XCANAL, false); r.closePath(); r.fillStyle = gv(0.28); r.fill();
  }

  /** o = { rx, vis, labX, labCanc, labCortex, foot } */
  function drawXsec(c, t, o) {
    const w = 840, h = 386, rx = o.rx;
    c.fillStyle = '#0c0d10'; c.fillRect(0, 0, w, h);
    c.drawImage(A.xsBase, 0, 0);
    const L = XS.lc;
    if (rx > 1) {
      c.save(); c.filter = 'blur(2.5px)';
      const g = c.createRadialGradient(L.x, L.y, 0, L.x, L.y, rx);
      g.addColorStop(0, gv(0.1, 0.95)); g.addColorStop(0.78, gv(0.11, 0.9)); g.addColorStop(1, gv(0.12, 0.0));
      c.beginPath(); blobPath(c, L.x, L.y, rx, 23, 0.95); c.fillStyle = g; c.fill();
      c.restore();
    }
    c.drawImage(A.xsRoot, 0, 0);
    // contact highlight: lesion margin where it erodes the buccal cortex
    const contact = clamp((rx - 50) / 8);
    if (contact > 0) {
      c.save();
      c.beginPath(); slicePath(c, 0); slicePath(c, CT); c.clip('evenodd');
      c.beginPath(); blobPath(c, L.x, L.y, rx + 1, 23, 0.95);
      c.shadowColor = AMBER; c.shadowBlur = 18;
      c.strokeStyle = rgba(AMBER, contact); c.lineWidth = 6; c.stroke();
      c.restore();
    }
    // X-ray beam (buccal -> lingual) and sensor. Exit rays are identical until the cortex is involved;
    // then the rays through the lesion carry more photons (thicker, brighter) -> dark spot on the sensor.
    c.save();
    BEAMS.forEach((y, i) => {
      c.strokeStyle = rgba(AMBER, 0.85); c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(48, y); c.lineTo(XB(y) - 8, y); c.stroke();
      c.strokeStyle = rgba(AMBER, 0.3); c.setLineDash([6, 8]); c.lineDashOffset = -t * 30;
      c.beginPath(); c.moveTo(XB(y) - 8, y); c.lineTo(XL(y) + 8, y); c.stroke(); c.setLineDash([]);
      const boost = i >= 1 && i <= 3 ? contact * (i === 2 ? 1 : 0.8) : 0;
      c.strokeStyle = rgba(AMBER, 0.85 + 0.15 * boost); c.lineWidth = 2.4 + 2.6 * boost;
      c.beginPath(); c.moveTo(XL(y) + 8, y); c.lineTo(700, y); c.stroke();
      if (boost > 0.02) { c.strokeStyle = `rgba(255,255,255,${0.9 * boost})`; c.lineWidth = 1; c.beginPath(); c.moveTo(XL(y) + 8, y); c.lineTo(700, y); c.stroke(); }
      arrow(c, XB(y) - 8, y, 1); arrow(c, 704, y, 1 + 0.4 * boost);
    });
    c.restore();
    // sensor: shows the projected image (radiolucent = dark, as on the film)
    c.save();
    const SX = 710, SW = 28;
    c.beginPath(); c.roundRect(SX, 96, SW, 204, 4); c.fillStyle = gv(0.8); c.fill();
    const faint = 0.16 * clamp(rx / 46);                 // subtle: small cancellous loss barely changes the projection
    if (faint > 0.005) {
      const hh = 36;
      const sg = c.createLinearGradient(0, L.y - hh, 0, L.y + hh);
      sg.addColorStop(0, gv(0.3, 0)); sg.addColorStop(0.5, gv(0.3, faint)); sg.addColorStop(1, gv(0.3, 0));
      c.fillStyle = sg; c.fillRect(SX, L.y - hh, SW, hh * 2);
    }
    if (o.vis > 0.005) {                                   // clear: crisp dark spot once the cortex is involved
      c.beginPath(); c.roundRect(SX + 3, L.y - 40, SW - 6, 80, 6); c.fillStyle = gv(0.06, 0.9 * o.vis); c.fill();
    }
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(SX, 96, SW, 204, 4); c.stroke();
    c.restore();
    // panel title + orientation
    c.save(); c.textBaseline = 'alphabetic';
    c.font = `600 30px ${MONO}`; c.fillStyle = '#e8eef2'; c.letterSpacing = '2px'; c.fillText('CROSS-SECTION', 24, 44);
    c.font = `500 22px ${MONO}`; c.fillStyle = '#9aa3ab'; c.letterSpacing = '1px'; c.fillText('schematic', 24, 72);
    c.restore();
    lab(c, 'B', XB(60) - 22, 78, '#c9d1d7', 'right');
    lab(c, 'L', XL(60) + 20, 78, '#c9d1d7', 'left');
    if (o.labX > 0.01) {
      c.save(); c.globalAlpha *= o.labX;
      lab(c, 'X-ray', 48, 110, AMBER, 'left');
      lab(c, 'sensor', SX + SW / 2, 84, '#e4e9ed', 'center');
      c.restore();
    }
    if (o.labCortex > 0.01) {
      const ccol = rgba(mix('#eef2f5', AMBER, contact));
      c.save(); c.globalAlpha *= o.labCortex;
      c.strokeStyle = ccol; c.lineWidth = 2;
      const cxp = XB(300) + 9;
      c.beginPath(); c.moveTo(cxp, 300); c.lineTo(160, 322); c.stroke();
      c.beginPath(); c.arc(cxp, 300, 4, 0, Math.PI * 2); c.fillStyle = ccol; c.fill();
      lab(c, 'cortex', 48, 332, ccol, 'left');
      c.restore();
    }
    if (o.labCanc > 0.01) {
      c.save(); c.globalAlpha *= o.labCanc;
      c.font = `600 30px ${SANS}`;
      const cw = c.measureText('cancellous').width, px = 434;
      c.beginPath(); c.roundRect(px - cw / 2 - 12, 302, cw + 24, 44, 10); c.fillStyle = 'rgba(8,9,11,0.8)'; c.fill();
      lab(c, 'cancellous', px, 334, '#eef2f5', 'center');
      c.restore();
    }
    if (o.foot > 0.01) {
      c.save(); c.globalAlpha *= o.foot;
      const fg = c.createLinearGradient(0, 348, 0, 362); fg.addColorStop(0, 'rgba(12,13,16,0)'); fg.addColorStop(1, 'rgba(12,13,16,0.92)');
      c.fillStyle = fg; c.fillRect(0, 348, w, h - 348);
      c.font = `400 22px ${SANS}`; c.fillStyle = '#a3acb3'; c.textBaseline = 'alphabetic';
      c.fillText('Digital PAs: lesion size predicts detection better than cortex (Chang 2020)', 24, 374);
      c.restore();
    }
  }
  function arrow(c, x, y, s = 1) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - 11 * s, y - 6 * s); c.lineTo(x - 11 * s, y + 6 * s); c.closePath(); c.fillStyle = rgba(AMBER, 0.95); c.fill();
  }
  function lab(c, s, x, y, col, align, size = 30) {
    c.save(); c.font = `600 ${size}px ${SANS}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic';
    c.shadowColor = 'rgba(0,0,0,0.85)'; c.shadowBlur = 6; c.fillText(s, x, y); c.restore();
  }

  // ================================================================= chart (de Paula-Silva et al. 2009)
  function drawChart(c, t, t0) {
    const w = 840;
    c.fillStyle = '#0c0d10'; c.fillRect(0, 0, w, 386);
    c.save(); c.textBaseline = 'alphabetic';
    c.font = `600 32px ${SANS}`; c.fillStyle = '#f1f4f6'; c.fillText('% of 83 dog roots diagnosed with AP', 32, 48);
    c.font = `400 26px ${SANS}`; c.fillStyle = '#a3acb3'; c.fillText('Histology = reference · de Paula-Silva et al., J Endod 2009', 32, 82);
    const BX = 290, BW = 430;
    const rows = [
      { k: 'Histology (truth)', v: 93, col: ['#f2b0cd', '#df78a5'] },
      { k: 'CBCT', v: 84, col: ['#e3eaef', '#b9c6cf'] },
      { k: 'PA', v: 71, col: ['#9aa1a8', '#6f777e'] },
    ];
    const yOf = (i) => 100 + i * 48;
    rows.forEach((r, i) => {
      const y = yOf(i), u = seg(t, t0 + 0.15 * i, t0 + 0.95 + 0.15 * i, ease.out);
      c.font = `600 30px ${SANS}`; c.fillStyle = '#e7ecef'; c.fillText(r.k, 32, y + 29);
      c.beginPath(); c.roundRect(BX, y + 2, BW, 36, 8); c.fillStyle = 'rgba(255,255,255,0.06)'; c.fill();
      const bw = BW * (r.v / 100) * u;
      if (bw > 2) {
        const g = c.createLinearGradient(BX, 0, BX + bw, 0); g.addColorStop(0, r.col[0]); g.addColorStop(1, r.col[1]);
        c.beginPath(); c.roundRect(BX, y + 2, bw, 36, 8); c.fillStyle = g; c.fill();
      }
      c.font = `700 32px ${SANS}`; c.fillStyle = i === 2 ? AMBER : '#f6f8f9';
      c.save(); c.globalAlpha *= clamp(u * 4); c.textAlign = 'right'; c.fillText(Math.round(r.v * u) + '%', 808, y + 31); c.restore();
    });
    // gap bracket: PA vs histology = roots with AP that the PA missed (PA specificity was 1.0 in this sample)
    const gu = seg(t, t0 + 1.4, t0 + 1.9, ease.out);
    if (gu > 0.01) {
      const xa = BX + BW * 0.71, xb = BX + BW * 0.93, y2 = yOf(2);
      c.save(); c.globalAlpha *= gu;
      c.setLineDash([5, 5]); c.strokeStyle = rgba(AMBER, 0.9); c.lineWidth = 2;
      c.beginPath(); c.moveTo(xb, yOf(0) + 38); c.lineTo(xb, y2 + 2); c.stroke();
      c.beginPath(); c.roundRect(xa, y2 + 2, xb - xa, 36, [0, 8, 8, 0]); c.stroke();
      c.setLineDash([]);
      c.fillStyle = rgba(AMBER, 0.16); c.beginPath(); c.roundRect(xa, y2 + 2, xb - xa, 36, [0, 8, 8, 0]); c.fill();
      const yb = y2 + 46;
      c.lineWidth = 2.5; c.beginPath(); c.moveTo(xa, yb - 6); c.lineTo(xa, yb); c.lineTo(xb, yb); c.lineTo(xb, yb - 6); c.stroke();
      c.font = `600 30px ${SANS}`; c.fillStyle = AMBER; c.textAlign = 'center';
      c.fillText('missed on PA', (xa + xb) / 2, yb + 32);
      c.restore();
    }
    c.font = `400 22px ${SANS}`; c.fillStyle = '#8f989f'; c.textAlign = 'left';
    c.fillText('CBCT finds more lesions: Estrela 2008 (clinical), Patel 2009 (artificial', 32, 322);
    c.fillText('defects), Kanagasingam 2017 (human jaws vs histology)', 32, 348);
    c.fillText('Healing also shows late: review at ≥ 1 yr, up to 4 yrs (Ørstavik, IEJ 1996)', 32, 374);
    c.restore();
  }

  window.Art = { build, lesionDark, composeBone, crPath, blobPath, drawHE, drawXsec, drawChart, XS };
})();
