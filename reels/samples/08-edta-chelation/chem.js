/*
 * chem.js — schematic geometry for sample 08 (EDTA chelation). Pure JS, no three.js, deterministic.
 * Units: ångström. Builds a Ca–EDTA(4−) complex by constraint relaxation so that bond lengths and
 * bond angles are plausible (N–C 1.47, C–C 1.52, C–O 1.26, Ca–N 2.60, Ca–O 2.40 Å; sp3 / sp2 angles),
 * then exposes a pose(arm angles) function that opens / closes the four carboxylate arms ("claw").
 * Real CaEDTA²⁻ crystal structures usually add 1–2 water molecules (CN 7–8); the six-donor
 * octahedral-ish cage here is schematic.
 */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addv = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const dist = (a, b) => len(sub(a, b));
/** rotate point p about axis (unit) through origin o by angle th (Rodrigues) */
function rot(p, o, axis, th) {
  const v = sub(p, o), c = Math.cos(th), s = Math.sin(th);
  const r = addv(addv(mul(v, c), mul(cross(axis, v), s)), mul(axis, dot(axis, v) * (1 - c)));
  return addv(o, r);
}
const law = (a, b, deg) => Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((deg * Math.PI) / 180));

export const BOND = { NC: 1.47, CC: 1.52, CO: 1.26, CaN: 2.6, CaO: 2.4, CH: 1.09 };

export function buildComplex() {
  const atoms = []; // {el, p}
  const A = (el, p) => (atoms.push({ el, p: p.slice() }), atoms.length - 1);
  const Ca = A('Ca', [0, 0, 0]);
  const N1 = A('N', [1.35, 2.2, 0]);
  const N2 = A('N', [-1.35, 2.2, 0]);
  const C1 = A('C', [0.72, 3.35, 0.5]);
  const C2 = A('C', [-0.72, 3.35, -0.5]);
  // donor O targets (initial guesses): G arms equatorial-low, R arms axial (±z). C2 symmetry about +y.
  const OG1 = [2.15, -1.05, 0.15], OR1 = [0.55, 0.25, 2.32];
  const OG2 = [-2.15, -1.05, -0.15], OR2 = [-0.55, 0.25, -2.32];
  const arms = [];
  for (const [N, O] of [[N1, OG1], [N1, OR1], [N2, OG2], [N2, OR2]]) {
    const n = atoms[N].p, out = norm(mul(addv(n, O), 0.5));
    const ca = A('C', addv(addv(n, mul(sub(O, n), 0.3)), mul(out, 1.05)));
    const cc = A('C', addv(addv(n, mul(sub(O, n), 0.72)), mul(out, 1.0)));
    const oa = A('O', O);
    const ob = A('O', addv(atoms[cc].p, mul(out, 1.15)));
    arms.push({ N, ca, cc, oa, ob, H: [] });
  }
  // ---------- constraints ----------
  const eq = []; // [i, j, d]
  const B = (i, j, d) => eq.push([i, j, d]);
  const aNC = law(BOND.NC, BOND.NC, 110), aCaNC = law(BOND.CaN, BOND.NC, 108);
  B(Ca, N1, BOND.CaN); B(Ca, N2, BOND.CaN);
  B(N1, C1, BOND.NC); B(N2, C2, BOND.NC); B(C1, C2, BOND.CC);
  B(N1, C2, law(BOND.NC, BOND.CC, 110)); B(N2, C1, law(BOND.NC, BOND.CC, 110));
  B(Ca, C1, aCaNC); B(Ca, C2, aCaNC);
  for (const a of arms) {
    B(Ca, a.oa, BOND.CaO);
    B(a.N, a.ca, BOND.NC); B(a.ca, a.cc, BOND.CC); B(a.cc, a.oa, BOND.CO); B(a.cc, a.ob, BOND.CO);
    B(Ca, a.ca, aCaNC);
    B(a.N, a.cc, law(BOND.NC, BOND.CC, 112));
    B(a.ca, a.oa, law(BOND.CC, BOND.CO, 117)); B(a.ca, a.ob, law(BOND.CC, BOND.CO, 117));
    B(a.oa, a.ob, law(BOND.CO, BOND.CO, 125));
    B(Ca, a.cc, law(BOND.CaO, BOND.CO, 120));
  }
  // angles around each N (tetrahedral-ish): partners of N1 = C1, arm0.ca, arm1.ca ; N2 = C2, arm2.ca, arm3.ca
  for (const [N, list] of [[N1, [C1, arms[0].ca, arms[1].ca]], [N2, [C2, arms[2].ca, arms[3].ca]]]) {
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) B(list[i], list[j], aNC);
  }
  const fixed = new Set([eq.map((e) => e[0] + ',' + e[1]), eq.map((e) => e[1] + ',' + e[0])].flat());
  const heavy = atoms.map((_, i) => i).filter((i) => i !== Ca);
  const minPairs = [];
  for (let i = 0; i < heavy.length; i++) for (let j = i + 1; j < heavy.length; j++) {
    const a = heavy[i], b = heavy[j];
    if (fixed.has(a + ',' + b)) continue;
    const bothO = atoms[a].el === 'O' && atoms[b].el === 'O';
    minPairs.push([a, b, bothO ? 2.75 : 2.55]);
  }
  // ---------- relax (position-based projection), Ca pinned ----------
  for (let it = 0; it < 6000; it++) {
    const k = it < 4000 ? 0.5 : 0.25;
    for (const [i, j, d] of eq) {
      const pi = atoms[i].p, pj = atoms[j].p, v = sub(pj, pi), L = len(v) || 1e-6, c = ((L - d) / L) * k;
      if (i === Ca) { atoms[j].p = sub(pj, mul(v, c * 2)); }
      else if (j === Ca) { atoms[i].p = addv(pi, mul(v, c * 2)); }
      else { atoms[i].p = addv(pi, mul(v, c)); atoms[j].p = sub(pj, mul(v, c)); }
    }
    for (const [i, j, d] of minPairs) {
      const pi = atoms[i].p, pj = atoms[j].p, v = sub(pj, pi), L = len(v) || 1e-6;
      if (L >= d) continue;
      const c = ((L - d) / L) * 0.3;
      atoms[i].p = addv(pi, mul(v, c)); atoms[j].p = sub(pj, mul(v, c));
    }
    // keep C2 symmetry about the y axis (x,y,z)->(-x,y,-z): average each atom with its partner's image
    if (it % 10 === 0) {
      const pairs = [[N1, N2], [C1, C2], [arms[0].ca, arms[2].ca], [arms[0].cc, arms[2].cc], [arms[0].oa, arms[2].oa], [arms[0].ob, arms[2].ob],
        [arms[1].ca, arms[3].ca], [arms[1].cc, arms[3].cc], [arms[1].oa, arms[3].oa], [arms[1].ob, arms[3].ob]];
      for (const [a, b] of pairs) {
        const pa = atoms[a].p, pb = atoms[b].p, ib = [-pb[0], pb[1], -pb[2]];
        const m = mul(addv(pa, ib), 0.5);
        atoms[a].p = m; atoms[b].p = [-m[0], m[1], -m[2]];
      }
    }
  }
  // ---------- hydrogens on sp3 carbons (2 each) ----------
  const hOn = (c, n1, n2) => {
    const pc = atoms[c].p, a = atoms[n1].p, b = atoms[n2].p;
    const bis = norm(addv(norm(sub(pc, a)), norm(sub(pc, b))));
    const nrm = norm(cross(sub(a, pc), sub(b, pc)));
    const cs = 0.5774, sn = 0.8165;
    return [A('H', addv(pc, mul(addv(mul(bis, cs), mul(nrm, sn)), BOND.CH))), A('H', addv(pc, mul(addv(mul(bis, cs), mul(nrm, -sn)), BOND.CH)))];
  };
  const hC1 = hOn(C1, N1, C2), hC2 = hOn(C2, N2, C1);
  for (const a of arms) a.H = hOn(a.ca, a.N, a.cc);
  // ---------- bonds (covalent) and coordination bonds ----------
  const bonds = [[N1, C1], [N2, C2], [C1, C2], ...hC1.map((h) => [C1, h]), ...hC2.map((h) => [C2, h])];
  for (const a of arms) { bonds.push([a.N, a.ca], [a.ca, a.cc], [a.cc, a.oa], [a.cc, a.ob], ...a.H.map((h) => [a.ca, h])); }
  const coord = [[Ca, N1], [Ca, N2], ...arms.map((a) => [Ca, a.oa])];
  // ---------- open conformation: same covalent constraints, no Ca, arm tips pulled out & down ----------
  const closed = atoms.map((a) => a.p.slice());
  const heavyN = atoms.findIndex((a) => a.el === 'H');           // first H index (heavy atoms come first)
  const eqCov = eq.filter(([i, j]) => i !== Ca && j !== Ca);
  const pin = new Set([C1, C2]);
  const mv = (P, i, j, v, c) => {
    const pi = pin.has(i), pj = pin.has(j);
    if (pi && pj) return;
    if (pi) P[j] = sub(P[j], mul(v, 2 * c));
    else if (pj) P[i] = addv(P[i], mul(v, 2 * c));
    else { P[i] = addv(P[i], mul(v, c)); P[j] = sub(P[j], mul(v, c)); }
  };
  const project = (P, iters, targets) => {
    for (let it = 0; it < iters; it++) {
      for (const [i, j, d] of eqCov) {
        const v = sub(P[j], P[i]), L = len(v) || 1e-6;
        mv(P, i, j, v, ((L - d) / L) * 0.5);
      }
      for (const [i, j, d] of minPairs) {
        const v = sub(P[j], P[i]), L = len(v) || 1e-6;
        if (L >= d) continue;
        mv(P, i, j, v, ((L - d) / L) * 0.3);
      }
      if (targets) for (const [i, tp, w] of targets) if (!pin.has(i)) P[i] = addv(P[i], mul(sub(tp, P[i]), w));
    }
    return P;
  };
  const OPEN_R = 5.6, OPEN_Y = 1.8;
  const targets = [];
  arms.forEach((a) => {
    const o = closed[a.oa], az = Math.atan2(o[2], o[0]);
    targets.push([a.oa, [OPEN_R * Math.cos(az), OPEN_Y, OPEN_R * Math.sin(az)], 0.08]);
    targets.push([a.ob, [(OPEN_R + 1.4) * Math.cos(az), OPEN_Y + 0.9, (OPEN_R + 1.4) * Math.sin(az)], 0.04]);
  });
  const openP = project(closed.map((p) => p.slice()), 3000, targets);
  project(openP, 400, null);
  // re-centre the open molecule so the N–N midpoint stays where it is in the complex
  const hPlace = (P) => {
    const hs = (c, n1, n2, h1, h2) => {
      const pc = P[c], a = P[n1], b = P[n2];
      const bis = norm(addv(norm(sub(pc, a)), norm(sub(pc, b))));
      const nrm = norm(cross(sub(a, pc), sub(b, pc)));
      P[h1] = addv(pc, mul(addv(mul(bis, 0.5774), mul(nrm, 0.8165)), BOND.CH));
      P[h2] = addv(pc, mul(addv(mul(bis, 0.5774), mul(nrm, -0.8165)), BOND.CH));
    };
    hs(C1, N1, C2, hC1[0], hC1[1]); hs(C2, N2, C1, hC2[0], hC2[1]);
    for (const a of arms) hs(a.ca, a.N, a.cc, a.H[0], a.H[1]);
    return P;
  };
  hPlace(openP);
  const armOf = new Array(closed.length).fill(-1);
  arms.forEach((a, k) => { for (const i of [a.ca, a.cc, a.oa, a.ob]) armOf[i] = k; });
  /** positions for arm openness u[k] in 0..1 (0 = closed around Ca, 1 = open claw). Pure function of u. */
  function pose(u) {
    const ub = (u[0] + u[1] + u[2] + u[3]) / 4;
    const P = closed.map((p, i) => {
      if (i === Ca) return p.slice();
      const w = armOf[i] >= 0 ? u[armOf[i]] : ub;
      return [p[0] + (openP[i][0] - p[0]) * w, p[1] + (openP[i][1] - p[1]) * w, p[2] + (openP[i][2] - p[2]) * w];
    });
    if (ub > 0 && ub < 1 || u.some((x) => x > 0 && x < 1)) project(P, 40, null);
    return hPlace(P);
  }
  return { atoms, closed, open: openP, bonds, coord, arms, pose, heavyN, idx: { Ca, N1, N2, C1, C2 } };
}

/** report of bond lengths / angles for QA (node) */
export function report(cx) {
  const P = cx.closed, el = cx.atoms.map((a) => a.el);
  const lines = [];
  for (const [i, j] of cx.bonds) if (el[i] !== 'H' && el[j] !== 'H') lines.push(`${el[i]}${i}-${el[j]}${j} ${dist(P[i], P[j]).toFixed(2)}`);
  for (const [i, j] of cx.coord) lines.push(`coord ${el[j]}${j} ${dist(P[i], P[j]).toFixed(2)}`);
  const donors = cx.coord.map((c) => c[1]);
  const ang = [];
  for (let a = 0; a < donors.length; a++) for (let b = a + 1; b < donors.length; b++) {
    const u = norm(P[donors[a]]), v = norm(P[donors[b]]);
    ang.push(`${el[donors[a]]}${donors[a]}-Ca-${el[donors[b]]}${donors[b]} ${(Math.acos(dot(u, v)) * 180 / Math.PI).toFixed(0)}`);
  }
  let minD = 99, pair = '';
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    if (cx.bonds.some((b) => (b[0] === i && b[1] === j) || (b[0] === j && b[1] === i))) continue;
    if (el[i] === 'H' || el[j] === 'H') continue;
    const d = dist(P[i], P[j]); if (d < minD && i !== 0 && j !== 0) { minD = d; pair = `${el[i]}${i}-${el[j]}${j}`; }
  }
  return lines.join('\n') + '\n' + ang.join('\n') + `\nmin nonbonded heavy ${minD.toFixed(2)} ${pair}`;
}
export const vec = { sub, addv, mul, dot, cross, len, norm, dist, rot };
