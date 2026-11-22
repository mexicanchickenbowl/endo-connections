/*
 * volume.js — procedural, deterministic "CBCT" volume for sample 33 (external cervical resorption).
 * SCHEMATIC anatomy: a single-rooted mandibular tooth (crown up), two neighbours, alveolar bone, gingiva.
 * Everything is analytic + seeded noise: no Math.random, no clock. Works in the browser (window.Vol) and in node.
 *
 * Axes (mm): x = mesio-distal (mesial −, distal +), y = bucco-lingual (buccal −, lingual +),
 *            z = along the tooth (0 = CEJ, coronal −, apical +).
 */
(function (root) {
  'use strict';
  const NX = 128, NY = 128, NZ = 208, VS = 0.125, INV = 1 / VS;
  const X0 = -8, Y0 = -8, Z0 = -9.5;
  const N = NX * NY * NZ, NXY = NX * NY;
  const FOV_R = 7.75;                     // cylindrical field of view (axial radius, mm)
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const mix = (a, b, u) => a + (b - a) * u;
  const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  const smax = (a, b, k) => -smin(-a, -b, k);
  const cov = (sd) => sstep(-0.085, 0.085, sd);

  // ---------- tiling 3-D value noise (seeded table, no hashing at run time) ----------
  const NT = 32, NM = NT - 1;
  const tab = new Float32Array(NT * NT * NT);
  (function () { let s = 0x2545f491 | 0; for (let i = 0; i < tab.length; i++) { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; tab[i] = ((s >>> 0) / 4294967296) * 2 - 1; } })();
  function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    let fx = x - xi, fy = y - yi, fz = z - zi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const x0 = xi & NM, x1 = (xi + 1) & NM, y0 = (yi & NM) * NT, y1 = ((yi + 1) & NM) * NT, z0 = (zi & NM) * NT * NT, z1 = ((zi + 1) & NM) * NT * NT;
    const a = tab[z0 + y0 + x0], b = tab[z0 + y0 + x1], c = tab[z0 + y1 + x0], d = tab[z0 + y1 + x1];
    const e = tab[z1 + y0 + x0], f = tab[z1 + y0 + x1], g = tab[z1 + y1 + x0], h = tab[z1 + y1 + x1];
    const ab = a + (b - a) * fx, cd = c + (d - c) * fx, ef = e + (f - e) * fx, gh = g + (h - g) * fx;
    const lo = ab + (cd - ab) * fy, hi = ef + (gh - ef) * fy;
    return lo + (hi - lo) * fz;
  }

  // ---------- tooth geometry (radial profiles) ----------
  const EXPN = 2.3;          // superellipse exponent of the root/crown cross-section
  const TS = 0.32;           // DRAWN thickness of the pericanalar sheet (schematic; published average is 0.21 mm)
  const PZ = 0.9;            // portal of entry: mm apical to the CEJ (just below the epithelial attachment, supracrestal)
  const RP = 0.55;           // portal radius (mm)
  const TH_L = 2.50, TH_B = 1.85;   // final angular reach of the lingual / buccal arm (rad) at the inner ring
  const ZD_A = 3.5, ZD_C = 3.0;     // final apical / coronal reach from the portal level (mm)
  const ASC = 1.3;           // arrival-time scale stored in the A volume (A8 = a / ASC * 255)
  const AK = 255 / ASC;
  const RCUT = 0.70;         // repair reaches voxels resorbed before p = RCUT (scaled by q)
  const ROOT_LEN = 14.5;

  function outerA(z) { // mesio-distal half width
    if (z >= 0) { const u = z / 14.6; return u >= 1 ? 0 : 2.8 * Math.pow(1 - Math.pow(u, 1.5), 0.8); }
    return 2.8 + 0.8 * Math.sin(Math.PI * clamp(-z / 9.2));
  }
  function outerB(z) { // bucco-lingual half width
    if (z >= 0) { const u = z / 14.6; return u >= 1 ? 0 : 3.4 * Math.pow(1 - Math.pow(u, 1.5), 0.8); }
    if (z > -6.4) return 3.4 + 0.5 * Math.sin(Math.PI * (-z / 6.4));
    return 3.4 - 0.5 * Math.pow((-z - 6.4) / 2, 1.5);
  }
  function canalA(z) {
    if (z >= 0) return 0.12 + 0.78 * Math.pow(clamp(1 - z / 14.2), 0.9);
    return 0.90 + 0.5 * Math.sin(0.5 * Math.PI * clamp(-z / 4.8));
  }
  function canalB(z) {
    if (z >= 0) return 0.12 + 1.2 * Math.pow(clamp(1 - z / 14.2), 1.15);
    return 1.32 + 0.48 * Math.sin(0.5 * Math.PI * clamp(-z / 4.8));
  }
  function ztop(x, y) {
    const b = (y + 1.7) / 1.5, l = (y - 2.1) / 1.2, m = x / 3.4;
    return -5.9 - 2.6 * Math.exp(-b * b) - 1.4 * Math.exp(-l * l) + 1.5 * m * m;
  }
  function zroof(x, y) {
    const b = (y + 1.25) / 0.75, bx = x / 0.9, l = (y - 1.3) / 0.6, lx = x / 0.8;
    return -3.6 - 1.7 * Math.exp(-b * b - bx * bx) - 0.8 * Math.exp(-l * l - lx * lx) + 0.45 * x * x;
  }
  function enamelT(z) { return z >= 0 ? 0 : 1.25 * sstep(0, 4.2, -z); }
  function superR(a, b, c, s) { return 1 / Math.pow(Math.pow(c / a, EXPN) + Math.pow(s / b, EXPN), 1 / EXPN); }

  // results of tooth(): signed "depths" (mm, + inside) and the radial quantities used by the lesion model
  let tSd = -1, tPulp = -5, tEn = -5, tRo = 0, tRc = 0, tR = 0, tTe = 0;
  function tooth(x, y, z) {
    const r = Math.sqrt(x * x + y * y);
    tR = r;
    if (z > 15 || z < -9 || r > 4.9) { tSd = -1.2; tPulp = -5; tEn = -5; tRo = 0; tRc = 0; tTe = 0; return; }
    const a = outerA(z), b = outerB(z);
    let c = 1, s = 0;
    if (r > 1e-6) { c = Math.abs(x) / r; s = Math.abs(y) / r; }
    const Ro = a < 0.02 ? 0 : superR(a, b, c, s);
    tRo = Ro;
    let sd = Ro - r, dTop = 99;
    if (z < -3.2) { dTop = z - ztop(x, y); sd = smin(sd, dTop, 0.9); }
    tSd = sd;
    if (z < 0) {
      const te = enamelT(z); tTe = te;
      let e = te - (Ro - r);
      if (z < -3.2) e = smax(e, 1.5 - dTop, 0.7);
      tEn = e;
    } else { tEn = -5; tTe = 0; }
    const pa = canalA(z), pb = canalB(z);
    const Rc = 1 / Math.sqrt((c / pa) * (c / pa) + (s / pb) * (s / pb));
    tRc = Rc;
    let sp = Rc - r;
    if (z < -2.2) sp = smin(sp, z - zroof(x, y), 0.5);
    if (z > 13.0) sp = smin(sp, 14.0 - z, 0.3);
    tPulp = sp;
  }

  // ---------- volumes ----------
  let Base, A, M, RM, RG, T, P;      // Uint8 volumes
  let S0, dS, cnt;                   // periapical projection (NX × NZ)
  const MU = new Float32Array(256);  // grey → attenuation
  for (let g = 0; g < 256; g++) MU[g] = g < 12 ? 0 : Math.pow((g - 10) / 245, 2.1);
  const LES_G = 56;                  // grey of the resorptive (soft) tissue
  // lesion bounding box (voxel indices)
  const LB = { x0: 0, x1: 0, y0: 0, y1: 0, z0: 0, z1: 0 };
  const vi = (v, o) => Math.floor((v - o) * INV);

  const GREY = { air: 0.03, soft: 0.215, dentin: 0.725, enamel: 0.955, pulp: 0.165, cortical: 0.635 };

  function build() {
    Base = new Uint8Array(N); A = new Uint8Array(N); M = new Uint8Array(N); RM = new Uint8Array(N); RG = new Uint8Array(N);
    T = new Uint8Array(N); P = new Uint8Array(N);
    A.fill(255);
    LB.x0 = Math.max(0, vi(-3.7, X0)); LB.x1 = Math.min(NX - 1, vi(3.7, X0));
    LB.y0 = Math.max(0, vi(-4.3, Y0)); LB.y1 = Math.min(NY - 1, vi(4.3, Y0));
    LB.z0 = Math.max(0, vi(-3.6, Z0)); LB.z1 = Math.min(NZ - 1, vi(5.6, Z0));
    const SP = 7.15;                    // tooth spacing (mm)
    let i = 0;
    for (let k = 0; k < NZ; k++) {
      const z = Z0 + (k + 0.5) * VS;
      for (let j = 0; j < NY; j++) {
        const y = Y0 + (j + 0.5) * VS;
        for (let ii = 0; ii < NX; ii++, i++) {
          const x = X0 + (ii + 0.5) * VS;
          // --- soft tissue envelope (gingiva over the alveolar process) ---
          const arch = 0.022 * x * x;                 // gentle curvature of the arch
          const ya = y - arch;
          const wz = clamp((z + 1.25) / 3.0), zz = Math.max(z, 1.75);
          const ybs = -(4.3 + wz * (4.75 + 0.10 * zz + 1.4 - 4.3)), yls = 4.3 + wz * (4.95 + 0.20 * zz + 1.4 - 4.3);
          const sdS = smin(smin(z + 1.25, ya - ybs, 0.8), yls - ya, 0.8);
          // rotated coordinates for all textures (keeps the noise lattice off the slice / projection axes)
          const rx = 0.836 * x + 0.342 * y + 0.429 * z, ry = -0.471 * x + 0.845 * y + 0.253 * z, rz = -0.276 * x - 0.413 * y + 0.868 * z;
          let g = mix(GREY.air, GREY.soft + 0.012 * noise3(rx * 0.9, ry * 0.9, rz * 0.9), cov(sdS));
          // --- teeth: target + two neighbours ---
          tooth(x, y, z);
          const sdT = tSd, spT = tPulp, enT = tEn, Ro = tRo, Rc = tRc, rr = tR, te = tTe;
          let dMax = sdT;
          let nSd = -9, nPulp = -9, nEn = -9;
          if (x < -2.4) { tooth(x + SP, y - 0.95, (z + 0.45) * 0.93); nSd = tSd; nPulp = tPulp; nEn = tEn; }
          else if (x > 2.4) { tooth(x - SP, y - 1.25, (z - 0.25) * 1.04); nSd = tSd; nPulp = tPulp; nEn = tEn; }
          if (nSd > dMax) dMax = nSd;
          // --- bone ---
          const cs = Math.cos(Math.PI * x / SP);
          const crest = 1.95 + 0.15 * cs * cs;           // gently scalloped margin, ~2 mm apical to the CEJ (supracrestal attachment zone above it)
          const yb = -(4.75 + 0.10 * z), yl = 4.95 + 0.20 * z;
          const dLat = Math.min(ya - yb, yl - ya), dCr = z - crest;
          const sdB0 = smin(smin(dCr, ya - yb, 0.9), yl - ya, 0.9);
          const dSock = -dMax - 0.24;                  // distance from the socket wall (PDL space 0.24 mm)
          const sdB = Math.min(sdB0, dSock);
          if (sdB > -0.2) {
            const n1 = noise3(rx * 1.35 + 2.2, ry * 1.35 + 7.7, rz * 1.2 + 1.3) + 0.5 * noise3(rx * 2.9 + 11, ry * 2.9, rz * 2.7 + 4);
            const ridge = 1 - sstep(0.04, 0.40, Math.abs(n1));
            const trab = 0.315 + 0.27 * ridge + 0.035 * noise3(rx * 5.7, ry * 5.7 + 3, rz * 5.7);
            const cort = Math.max(1 - sstep(0.75, 1.3, dLat), 1 - sstep(0.22, 0.6, dCr)), lam = 1 - sstep(0.2, 0.45, dSock);
            const bg = mix(trab, GREY.cortical + 0.02 * noise3(rx * 2, ry * 2, rz * 2 + 9), Math.max(cort, lam * 0.88));
            g = mix(g, bg, cov(sdB));
          }
          // --- tooth greys ---
          if (sdT > -0.2) {
            let tg = GREY.dentin + 0.014 * noise3(rx * 1.7 + 5, ry * 1.7, rz * 1.7);
            tg = mix(tg, GREY.enamel, cov(enT));
            tg = mix(tg, GREY.pulp, cov(spT));
            g = mix(g, tg, cov(sdT));
          }
          if (nSd > -0.2) {
            let tg = GREY.dentin + 0.014 * noise3(rx * 1.7 + 5, ry * 1.7, rz * 1.7);
            tg = mix(tg, GREY.enamel, cov(nEn));
            tg = mix(tg, GREY.pulp, cov(nPulp));
            g = mix(g, tg, cov(nSd));
          }
          Base[i] = clamp(g) * 255;
          T[i] = clamp(128 + sdT * 100, 0, 255);
          P[i] = clamp(128 + spT * 100, 0, 255);
          // --- lesion model (target tooth only) ---
          if (ii >= LB.x0 && ii <= LB.x1 && j >= LB.y0 && j <= LB.y1 && k >= LB.z0 && k <= LB.z1 && sdT > -0.45 && Ro > 0.5) {
            const ang = Math.atan2(y, -x);                 // 0 = mesial (portal side); + toward lingual
            const inner = Rc + TS;
            const shN = noise3(rx * 0.85 + 50, ry * 0.85 + 60, rz * 0.85 + 70) + 0.45 * noise3(rx * 2.1 + 9, ry * 2.1 + 3, rz * 2.1 + 1);
            const shell = 0.40 + 0.62 * sstep(-0.55, 0.75, shN);       // irregular outer limit (intact outer dentin shell)
            const outer0 = Ro - Math.max(shell, te + 0.12);
            const dz = z - PZ;
            const dt = Math.sqrt(rr * rr * ang * ang + dz * dz);
            const tube = 1 - sstep(RP - 0.12, RP + 0.3, dt);
            const outer = mix(outer0, Ro + 0.06, tube);
            let sdBand = Math.min(rr - inner, outer - rr);
            const ni = noise3(rx * 1.6 + 3.1, ry * 1.6 + 9.2, rz * 1.6 + 5.5);
            sdBand = Math.min(sdBand, (0.33 - ni) * 0.9 + tube * 2 + 0.3 * sstep(0.32, 0, rr - inner));
            M[i] = cov(sdBand) * 255;
            const TH = ang > 0 ? TH_L : TH_B, ZD = dz > 0 ? ZD_A : ZD_C;
            const pa = ang / TH, pz = dz / ZD;
            const path = Math.sqrt(pa * pa + pz * pz);
            const w = clamp((rr - inner) / Math.max(0.2, Ro - 0.4 - inner));
            const nA = noise3(rx * 1.15 + 20, ry * 1.15 + 4, rz * 1.15 + 13) + 0.5 * noise3(rx * 2.4, ry * 2.4 + 8, rz * 2.4);
            let a = 0.16 + 0.84 * (path + 0.40 * w) + 0.10 * nA * sstep(0.0, 0.3, path);
            const q0 = dt / RP;
            const at = 0.02 + 0.14 * clamp((Ro - rr) / Math.max(0.3, Ro - inner)) + 0.09 * q0 * q0;
            a = smin(a, at, 0.04);
            A[i] = clamp(a / ASC) * 254;
            const nr = noise3(rx * 0.95 + 40, ry * 0.95 + 17, rz * 0.95 + 29) + 0.4 * noise3(rx * 2.6 + 5, ry * 2.6 + 31, rz * 2.6 + 2);
            RM[i] = cov((nr + 0.04) * 0.6) * 255;
            RG[i] = clamp(0.50 + 0.12 * noise3(rx * 5.2 + 1, ry * 5.2 + 2, rz * 5.2 + 3) + 0.05 * noise3(rx * 11, ry * 11, rz * 11)) * 255;
          }
        }
      }
    }
    // periapical base projection (sum of attenuation along the bucco-lingual axis)
    S0 = new Float32Array(NX * NZ); dS = new Float32Array(NX * NZ); cnt = new Float32Array(NX * NZ);
    i = 0;
    for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) { const row = k * NX; for (let ii = 0; ii < NX; ii++, i++) S0[row + ii] += MU[Base[i]] * VS; }
  }

  // ---------- samplers ----------
  function tri(vol, x, y, z) {
    let fx = (x - X0) * INV - 0.5, fy = (y - Y0) * INV - 0.5, fz = (z - Z0) * INV - 0.5;
    let ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
    if (ix < 0) { ix = 0; fx = 0; } else if (ix > NX - 2) { ix = NX - 2; fx = NX - 1; }
    if (iy < 0) { iy = 0; fy = 0; } else if (iy > NY - 2) { iy = NY - 2; fy = NY - 1; }
    if (iz < 0) { iz = 0; fz = 0; } else if (iz > NZ - 2) { iz = NZ - 2; fz = NZ - 1; }
    const wx = fx - ix, wy = fy - iy, wz = fz - iz;
    const i0 = ix + NX * (iy + NY * iz), i1 = i0 + NXY;
    const a = vol[i0] + (vol[i0 + 1] - vol[i0]) * wx, b = vol[i0 + NX] + (vol[i0 + NX + 1] - vol[i0 + NX]) * wx;
    const c = vol[i1] + (vol[i1 + 1] - vol[i1]) * wx, d = vol[i1 + NX] + (vol[i1 + NX + 1] - vol[i1 + NX]) * wx;
    const lo = a + (b - a) * wy, hi = c + (d - c) * wy;
    return lo + (hi - lo) * wz;
  }

  /**
   * Multiplanar slice into an RGBA buffer.
   * plane 0 = axial (u = x, v = y, slice = z) · 1 = sagittal/MD view (u = x, v = z, slice = y) · 2 = coronal/BL view (u = y, v = z, slice = x)
   * (cu, cv) = world coords at the buffer centre, mpp = mm per buffer pixel, pr = lesion progress, q = repair progress,
   * tint = strength of the lesion overlay (0..1), front = strength of the advancing-front glow.
   */
  function renderSlice(data, bw, bh, plane, cu, cv, sl, mpp, pr, q, tint, front, seed, rb) {
    rb = rb || 0;                    // brief brightening of the repair tissue as it appears
    const pA = pr * AK, qA = q * RCUT * AK, SOFT = 0.03 * AK, FW = 0.022 * AK;
    const lx0 = X0 + LB.x0 * VS, lx1 = X0 + (LB.x1 + 1) * VS, ly0 = Y0 + LB.y0 * VS, ly1 = Y0 + (LB.y1 + 1) * VS, lz0 = Z0 + LB.z0 * VS, lz1 = Z0 + (LB.z1 + 1) * VS;
    const zMin = Z0, zMax = Z0 + NZ * VS, R2 = FOV_R * FOV_R;
    const lesOn = pr > 0.001;
    let o = 0;
    let hs = (seed | 0) * 7919 + 13;
    for (let j = 0; j < bh; j++) {
      const v = cv + (j + 0.5 - bh / 2) * mpp;
      for (let i = 0; i < bw; i++, o += 4) {
        const u = cu + (i + 0.5 - bw / 2) * mpp;
        let x, y, z;
        if (plane === 0) { x = u; y = v; z = sl; } else if (plane === 1) { x = u; z = v; y = sl; } else { y = u; z = v; x = sl; }
        const r2 = x * x + y * y;
        if (r2 > R2 || z < zMin || z > zMax) { data[o] = 3; data[o + 1] = 4; data[o + 2] = 6; data[o + 3] = 255; continue; }
        // trilinear base
        let fx = (x - X0) * INV - 0.5, fy = (y - Y0) * INV - 0.5, fz = (z - Z0) * INV - 0.5;
        let ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
        if (ix < 0) { ix = 0; fx = 0; } else if (ix > NX - 2) { ix = NX - 2; fx = NX - 1; }
        if (iy < 0) { iy = 0; fy = 0; } else if (iy > NY - 2) { iy = NY - 2; fy = NY - 1; }
        if (iz < 0) { iz = 0; fz = 0; } else if (iz > NZ - 2) { iz = NZ - 2; fz = NZ - 1; }
        const wx = fx - ix, wy = fy - iy, wz = fz - iz;
        const i0 = ix + NX * (iy + NY * iz), i1 = i0 + NXY, i2 = i0 + NX, i3 = i1 + NX;
        let a0 = Base[i0] + (Base[i0 + 1] - Base[i0]) * wx, b0 = Base[i2] + (Base[i2 + 1] - Base[i2]) * wx;
        let c0 = Base[i1] + (Base[i1 + 1] - Base[i1]) * wx, d0 = Base[i3] + (Base[i3 + 1] - Base[i3]) * wx;
        let lo = a0 + (b0 - a0) * wy, hi = c0 + (d0 - c0) * wy;
        let g = lo + (hi - lo) * wz;
        let tr = 0, tg = 0, tb = 0;
        if (lesOn && x > lx0 && x < lx1 && y > ly0 && y < ly1 && z > lz0 && z < lz1) {
          a0 = M[i0] + (M[i0 + 1] - M[i0]) * wx; b0 = M[i2] + (M[i2 + 1] - M[i2]) * wx;
          c0 = M[i1] + (M[i1 + 1] - M[i1]) * wx; d0 = M[i3] + (M[i3 + 1] - M[i3]) * wx;
          lo = a0 + (b0 - a0) * wy; hi = c0 + (d0 - c0) * wy;
          const m = (lo + (hi - lo) * wz) / 255;
          if (m > 0.01) {
            a0 = A[i0] + (A[i0 + 1] - A[i0]) * wx; b0 = A[i2] + (A[i2 + 1] - A[i2]) * wx;
            c0 = A[i1] + (A[i1 + 1] - A[i1]) * wx; d0 = A[i3] + (A[i3 + 1] - A[i3]) * wx;
            lo = a0 + (b0 - a0) * wy; hi = c0 + (d0 - c0) * wy;
            const av = lo + (hi - lo) * wz;
            let e = (pA - av) / SOFT + 0.5; e = e < 0 ? 0 : e > 1 ? 1 : e;
            const les = m * e;
            if (les > 0.003) {
              let lg = LES_G, rep = 0;
              if (q > 0.001) {
                let er = (qA - av) / SOFT + 0.5; er = er < 0 ? 0 : er > 1 ? 1 : er;
                if (er > 0) {
                  a0 = RM[i0] + (RM[i0 + 1] - RM[i0]) * wx; b0 = RM[i2] + (RM[i2 + 1] - RM[i2]) * wx;
                  c0 = RM[i1] + (RM[i1 + 1] - RM[i1]) * wx; d0 = RM[i3] + (RM[i3 + 1] - RM[i3]) * wx;
                  lo = a0 + (b0 - a0) * wy; hi = c0 + (d0 - c0) * wy;
                  rep = er * (lo + (hi - lo) * wz) / 255;
                  if (rep > 0.003) {
                    a0 = RG[i0] + (RG[i0 + 1] - RG[i0]) * wx; b0 = RG[i2] + (RG[i2 + 1] - RG[i2]) * wx;
                    c0 = RG[i1] + (RG[i1 + 1] - RG[i1]) * wx; d0 = RG[i3] + (RG[i3 + 1] - RG[i3]) * wx;
                    lo = a0 + (b0 - a0) * wy; hi = c0 + (d0 - c0) * wy;
                    lg = LES_G + ((lo + (hi - lo) * wz) - LES_G) * rep;
                  }
                }
              }
              g = g + (lg - g) * les;
              const act = les * (1 - rep) * tint;
              tr = 96 * act; tg = 34 * act; tb = -6 * act;
              if (front > 0.001) { const dd = (pA - av) / FW; const f = m * Math.exp(-dd * dd) * front * (dd > -1.2 ? 1 : 0); tr += 92 * f; tg += 52 * f; tb += 6 * f; }
              if (rep > 0.003) { const rr2 = rep * les * tint * (1 + rb); g += 26 * rb * rep * les; tr += 44 * rr2; tg += 33 * rr2; tb += 2 * rr2; }
            }
          }
        }
        // acquisition grain (static per pixel + slice)
        hs = Math.imul(i * 374761393 + j * 668265263 + (seed | 0) * 1274126177, 1103515245);
        hs ^= hs >>> 15; hs = Math.imul(hs, 2246822519); hs ^= hs >>> 13;
        g += ((hs >>> 0) / 4294967296 - 0.5) * 13;
        // soft fade at the edge of the cylindrical field of view
        if (r2 > R2 * 0.94) g *= clamp((R2 - r2) / (R2 * 0.06)) * 0.9 + 0.1;
        // display window (slightly cool grey)
        g = (g - 6) * 1.03;
        data[o] = g * 0.97 + tr; data[o + 1] = g + tg; data[o + 2] = g * 1.035 + tb; data[o + 3] = 255;
      }
    }
  }

  // ---------- lesion measurements on the model (what the on-screen tools read) ----------
  /** angular reach (rad) of the lingual and buccal arms at axial level z for progress pr */
  function measureSpread(z, pr) {
    const pA = pr * AK;
    const a = outerA(z), b = outerB(z), ca = canalA(z), cb = canalB(z);
    const res = { ling: 0, bucc: 0 };
    for (let side = 0; side < 2; side++) {
      let best = 0;
      for (let d = 0; d <= 179; d += 1) {
        const ang = (side === 0 ? 1 : -1) * d * Math.PI / 180;
        const cx = -Math.cos(ang), sy = Math.sin(ang);
        const Ro = superR(a, b, Math.abs(cx), Math.abs(sy));
        const Rc = 1 / Math.sqrt((cx / ca) * (cx / ca) + (sy / cb) * (sy / cb));
        let hit = false;
        for (let s = 0; s < 7 && !hit; s++) {
          const r = Rc + TS + 0.06 + (Ro - 0.5 - Rc - TS - 0.06) * (s / 6);
          const x = r * cx, y = r * sy;
          if (tri(M, x, y, z) > 150 && tri(A, x, y, z) < pA) hit = true;
        }
        if (hit) best = d;
      }
      if (side === 0) res.ling = best * Math.PI / 180; else res.bucc = best * Math.PI / 180;
    }
    return res;
  }
  /** most apical and most coronal level (mm) reached in the sagittal plane y = 0 on the mesial side */
  function measureHeight(pr) {
    const pA = pr * AK; let zmax = PZ, zmin = PZ;
    for (let z = -3.4; z <= 5.4; z += 0.05) {
      const Ro = outerA(z), Rc = canalA(z);
      let hit = false;
      for (let s = 0; s < 8 && !hit; s++) { const r = Rc + TS + 0.05 + (Ro - 0.3 - Rc - TS) * (s / 7); if (tri(M, -r, 0, z) > 150 && tri(A, -r, 0, z) < pA) hit = true; }
      if (hit) { if (z > zmax) zmax = z; if (z < zmin) zmin = z; }
    }
    return { zmax, zmin };
  }

  // ---------- 3-D pane: orthographic ray-march (glass tooth, lesion, pulp) ----------
  function render3D(data, bw, bh, az, el, cx, cy, cz, mpp, pr, q) {
    const pA = pr * AK, qA = q * RCUT * AK;
    const ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    const Dx = -ca * ce, Dy = -sa * ce, Dz = se;           // view direction (into the screen)
    const Rx = -sa, Ry = ca;                                // screen right
    const Ux = -ca * se, Uy = -sa * se, Uz = -ce;           // screen up (coronal)
    // light from upper left, toward the viewer
    let Lx = Rx * -0.5 + Ux * 0.55 - Dx * 0.75, Ly = Ry * -0.5 + Uy * 0.55 - Dy * 0.75, Lz = Uz * 0.55 - Dz * 0.75;
    const ll = Math.hypot(Lx, Ly, Lz); Lx /= ll; Ly /= ll; Lz /= ll;
    const RB = 4.5, RB2 = RB * RB, ZA = -8.9, ZB = 14.9, DS = 0.105;
    const aq = Dx * Dx + Dy * Dy;
    const E = 0.16;
    let o = 0;
    for (let j = 0; j < bh; j++) {
      const v = (j + 0.5 - bh / 2) * mpp;
      for (let i = 0; i < bw; i++, o += 4) {
        const u = (i + 0.5 - bw / 2) * mpp;
        const ox = cx + Rx * u - Ux * v, oy = cy + Ry * u - Uy * v, oz = cz - Uz * v;
        // background (subtle vignette)
        const vg = 1 - 0.55 * ((i / bw - 0.5) * (i / bw - 0.5) + (j / bh - 0.5) * (j / bh - 0.5)) * 2.2;
        let cr = 9 * vg, cg = 13 * vg, cb = 18 * vg;
        const bq = ox * Dx + oy * Dy, cq = ox * ox + oy * oy - RB2;
        const disc = bq * bq - aq * cq;
        if (disc > 0) {
          const sq = Math.sqrt(disc);
          let s0 = (-bq - sq) / aq, s1 = (-bq + sq) / aq;
          if (Dz > 1e-6) { s0 = Math.max(s0, (ZA - oz) / Dz); s1 = Math.min(s1, (ZB - oz) / Dz); }
          else if (Dz < -1e-6) { s0 = Math.max(s0, (ZB - oz) / Dz); s1 = Math.min(s1, (ZA - oz) / Dz); }
          let sT = 1e9, sL = 1e9, sP = 1e9, rep = 0;
          // coarse search for the tooth, then fine steps through it
          let s = s0, found = false;
          for (; s < s1; s += 0.3) {
            const x = ox + Dx * s, y = oy + Dy * s, z = oz + Dz * s;
            const ix = ((x - X0) * INV) | 0, iy = ((y - Y0) * INV) | 0, iz = ((z - Z0) * INV) | 0;
            if (ix < 0 || iy < 0 || iz < 0 || ix >= NX || iy >= NY || iz >= NZ) continue;
            if (T[ix + NX * (iy + NY * iz)] > 108) { found = true; break; }
          }
          if (found) {
            let inside = false, outN = 0;
            for (s = Math.max(s0, s - 0.3); s < s1; s += DS) {
              const x = ox + Dx * s, y = oy + Dy * s, z = oz + Dz * s;
              const ix = ((x - X0) * INV) | 0, iy = ((y - Y0) * INV) | 0, iz = ((z - Z0) * INV) | 0;
              if (ix < 0 || iy < 0 || iz < 0 || ix >= NX || iy >= NY || iz >= NZ) continue;
              const id = ix + NX * (iy + NY * iz);
              if (T[id] > 128) {
                inside = true; outN = 0;
                if (sT > 1e8) { // refine the surface hit
                  let lo = s - DS, hi = s;
                  for (let b2 = 0; b2 < 3; b2++) { const md = (lo + hi) * 0.5; if (tri(T, ox + Dx * md, oy + Dy * md, oz + Dz * md) > 128) hi = md; else lo = md; }
                  sT = hi;
                }
                if (sL > 1e8 && pr > 0.001 && M[id] > 90 && A[id] < pA + 10) {
                  if (Math.min(tri(M, x, y, z) - 127.5, pA - tri(A, x, y, z)) > 0) {
                    let lo = s - DS, hi = s;
                    for (let b2 = 0; b2 < 3; b2++) { const md = (lo + hi) * 0.5; const mx = ox + Dx * md, my = oy + Dy * md, mz = oz + Dz * md; if (Math.min(tri(M, mx, my, mz) - 127.5, pA - tri(A, mx, my, mz)) > 0) hi = md; else lo = md; }
                    sL = hi;
                    rep = (q > 0.001 && tri(RM, x, y, z) > 127 && tri(A, x, y, z) < qA) ? 1 : 0;
                  }
                }
                if (P[id] > 128) {
                  let lo = s - DS, hi = s;
                  for (let b2 = 0; b2 < 3; b2++) { const md = (lo + hi) * 0.5; if (tri(P, ox + Dx * md, oy + Dy * md, oz + Dz * md) > 128) hi = md; else lo = md; }
                  sP = hi; break;
                }
              } else if (inside && ++outN > 8) break;
            }
          }
          if (sT < 1e8) {
            let have = false;
            if (sP < 1e8) {
              const x = ox + Dx * sP, y = oy + Dy * sP, z = oz + Dz * sP;
              let nx = tri(P, x - E, y, z) - tri(P, x + E, y, z), ny = tri(P, x, y - E, z) - tri(P, x, y + E, z), nz = tri(P, x, y, z - E) - tri(P, x, y, z + E);
              const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
              const df = Math.max(0, nx * Lx + ny * Ly + nz * Lz), sh = 0.30 + 0.78 * df;
              cr = 52 * sh + 60 * df * df * df; cg = 226 * sh + 30 * df * df * df; cb = 158 * sh + 40 * df * df * df; have = true;
            }
            if (sL < 1e8) {
              const x = ox + Dx * sL, y = oy + Dy * sL, z = oz + Dz * sL;
              const f = (xx, yy, zz) => Math.min((tri(M, xx, yy, zz) - 127.5) * 0.6, (pA - tri(A, xx, yy, zz)) * 2.2);
              let nx = f(x - E, y, z) - f(x + E, y, z), ny = f(x, y - E, z) - f(x, y + E, z), nz = f(x, y, z - E) - f(x, y, z + E);
              const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
              const df = Math.max(0, nx * Lx + ny * Ly + nz * Lz), sh = 0.34 + 0.8 * df;
              let lr, lg2, lb;
              if (rep) { lr = 240 * sh; lg2 = 226 * sh; lb = 192 * sh; } else { lr = 255 * sh; lg2 = 128 * sh + 30 * df * df; lb = 36 * sh; }
              const al = have ? 0.80 : 0.93;
              cr = cr + (lr - cr) * al; cg = cg + (lg2 - cg) * al; cb = cb + (lb - cb) * al;
            }
            // glass shell of the tooth
            const x = ox + Dx * sT, y = oy + Dy * sT, z = oz + Dz * sT;
            let nx = tri(T, x - E, y, z) - tri(T, x + E, y, z), ny = tri(T, x, y - E, z) - tri(T, x, y + E, z), nz = tri(T, x, y, z - E) - tri(T, x, y, z + E);
            const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
            const facing = Math.abs(nx * Dx + ny * Dy + nz * Dz);
            const df = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
            const en = z < -0.15 ? 1 : 0;
            const hx = Lx - Dx, hy = Ly - Dy, hz = Lz - Dz, hl = Math.hypot(hx, hy, hz) || 1;
            const spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 28);
            let aS = 0.16 + 0.62 * Math.pow(1 - facing, 2.2) + en * 0.17 + 0.5 * spec;
            if (aS > 0.9) aS = 0.9;
            const rim = Math.pow(1 - facing, 3);
            const sv = 0.66 + 0.5 * df;
            const sr = Math.min(255, (en ? 226 : 196) * sv + 70 * rim + 120 * spec), sg = Math.min(255, (en ? 238 : 216) * sv + 70 * rim + 120 * spec), sb = Math.min(255, (en ? 250 : 236) * sv + 70 * rim + 120 * spec);
            cr = cr + (sr - cr) * aS; cg = cg + (sg - cg) * aS; cb = cb + (sb - cb) * aS;
          }
        }
        data[o] = cr; data[o + 1] = cg; data[o + 2] = cb; data[o + 3] = 255;
      }
    }
  }

  // ---------- periapical radiograph (2-D projection of the same volume) ----------
  let paKey = '';
  function updatePA(pr, q) {
    const key = pr.toFixed(4) + '|' + q.toFixed(4);
    if (key === paKey) return; paKey = key;
    const pA = pr * AK, qA = q * RCUT * AK;
    for (let k = LB.z0; k <= LB.z1; k++) { const row = k * NX; for (let ii = LB.x0; ii <= LB.x1; ii++) { dS[row + ii] = 0; cnt[row + ii] = 0; } }
    if (pr <= 0.001) return;
    for (let k = LB.z0; k <= LB.z1; k++) {
      const row = k * NX;
      for (let j = LB.y0; j <= LB.y1; j++) {
        let id = LB.x0 + NX * (j + NY * k);
        for (let ii = LB.x0; ii <= LB.x1; ii++, id++) {
          const m = M[id];
          if (m > 24) {
            const a = A[id];
            if (a < pA) {
              const les = m / 255;
              let lg = LES_G;
              if (a < qA) { const rep = RM[id] / 255; lg = LES_G + (RG[id] - LES_G) * rep; }
              dS[row + ii] += les * (MU[lg | 0] - MU[Base[id]]) * VS;
              cnt[row + ii] += les * VS;
            }
          }
        }
      }
    }
  }
  let PA_T0 = 0.9, PA_T1 = 2.6;      // mm of lesion along the beam: below T0 invisible, full contrast above T1
  let PA_C0 = 0.25;                  // outline threshold: mm of lesion along the beam (2 voxels)
  function setPAT(a, b, c) { PA_T0 = a; PA_T1 = b; if (c != null) PA_C0 = c; }
  function bil(arr, fx, fz) {
    let ix = Math.floor(fx), iz = Math.floor(fz);
    if (ix < 0) { ix = 0; fx = 0; } else if (ix > NX - 2) { ix = NX - 2; fx = NX - 1; }
    if (iz < 0) { iz = 0; fz = 0; } else if (iz > NZ - 2) { iz = NZ - 2; fz = NZ - 1; }
    const wx = fx - ix, wz = fz - iz, i0 = ix + NX * iz;
    const a = arr[i0] + (arr[i0 + 1] - arr[i0]) * wx, b = arr[i0 + NX] + (arr[i0 + NX + 1] - arr[i0 + NX]) * wx;
    return a + (b - a) * wz;
  }
  /** (cu, cv) = world (x, z) at buffer centre. ov = strength of the orange "extent on CBCT" overlay. */
  function renderPA(data, bw, bh, cu, cv, mpp, ov, seed) {
    let o = 0;
    const xMin = X0 + 0.3, xMax = X0 + NX * VS - 0.3, zMin = Z0 + 0.2, zMax = Z0 + NZ * VS - 0.2;
    const oxa = X0 + LB.x0 * VS - 0.4, oxb = X0 + (LB.x1 + 1) * VS + 0.4, oza = Z0 + LB.z0 * VS - 0.4, ozb = Z0 + (LB.z1 + 1) * VS + 0.4;
    for (let j = 0; j < bh; j++) {
      const z = cv + (j + 0.5 - bh / 2) * mpp;
      for (let i = 0; i < bw; i++, o += 4) {
        const x = cu + (i + 0.5 - bw / 2) * mpp;
        if (x < xMin || x > xMax || z < zMin || z > zMax) { data[o] = 4; data[o + 1] = 5; data[o + 2] = 7; data[o + 3] = 255; continue; }
        const fx = (x - X0) * INV - 0.5, fz = (z - Z0) * INV - 0.5;
        // thin lesion margins (short path through the lesion) stay below visible contrast: detection threshold (schematic)
        const cL = bil(cnt, fx, fz);
        const S = bil(S0, fx, fz) + bil(dS, fx, fz) * sstep(PA_T0, PA_T1, cL);
        let v = 1 - Math.exp(-0.36 * S);
        v = Math.pow(v, 1.5) * 1.27;
        v = v * v * (3 - 2 * Math.min(1, v)) * 0.55 + v * 0.45;     // gentle S-curve
        let h = Math.imul(i * 374761393 + j * 668265263 + (seed | 0) * 1274126177, 1103515245);
        h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13;
        let g = v * 238 + ((h >>> 0) / 4294967296 - 0.5) * 11 + 8;
        // soft edge of the "film"
        const ex = Math.min(x - xMin, xMax - x, z - zMin, zMax - z);
        if (ex < 0.5) g *= ex / 0.5;
        let r = g * 0.99, gg = g, b = g * 1.03;
        if (ov > 0.001 && x > oxa && x < oxb && z > oza && z < ozb) {
          // contour of the projected lesion (path length through the lesion = PA_C0 mm), drawn as a line of constant
          // width: distance to the contour = (c - C0) / |grad c|. Outline only: the radiolucency inside stays gray.
          const gx = (bil(cnt, fx + 1, fz) - bil(cnt, fx - 1, fz)) * (0.5 * INV), gz = (bil(cnt, fx, fz + 1) - bil(cnt, fx, fz - 1)) * (0.5 * INV);
          const d = Math.abs(cL - PA_C0) / Math.max(Math.sqrt(gx * gx + gz * gz), 0.45);
          const k2 = ov * (1 - sstep(0.7 * mpp, 1.8 * mpp, d));
          if (k2 > 0.003) { r += (255 - r) * k2; gg += (138 - gg) * k2; b += (40 - b) * k2; }
        }
        data[o] = r; data[o + 1] = gg; data[o + 2] = b; data[o + 3] = 255;
      }
    }
  }

  const Vol = {
    NX, NY, NZ, VS, X0, Y0, Z0, FOV_R, TS, PZ, RP, ROOT_LEN, GREY,
    build, renderSlice, render3D, updatePA, renderPA, setPAT, get cnt() { return cnt; }, measureSpread, measureHeight, tri,
    outerA, outerB, canalA, canalB, enamelT, superR, ztop,
    get Base() { return Base; }, get A() { return A; }, get M() { return M; }, get RM() { return RM; }, get T() { return T; }, get P() { return P; },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Vol; else root.Vol = Vol;
})(typeof window !== 'undefined' ? window : globalThis);
