#!/usr/bin/env node
/*
 * Toy 2-D lattice-Boltzmann (D2Q9, TRT) solver for syringe irrigation in a tapered root canal.
 * Offline pre-computation for reel 15 (needle CFD). NOT a validated model: a 2-D, low-Reynolds toy
 * that reproduces the qualitative flow patterns reported by Boutsioukis et al. (3-D unsteady CFD).
 *
 *   node sim/lbm.cjs <case> [--re 120] [--steps 60000] [--out sim/out]
 *   case: open3 | side3 | side1
 * Writes <out>/<case>.json (meta) + <case>.bin (Float32 u,v,rho time-averaged) + <case>.ppm preview.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = { _: [] };
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else opt._.push(args[i]); }
const CASE = opt._[0] || 'open3';
const RE = +(opt.re || 120);
const RE0 = +(opt.re0 || 15), S0 = +(opt.s0 || 0), SR = +(opt.sr || 10000);  // continuation: low-Re spin-up, then ramp
const STEPS = S0 + SR + +(opt.steps || 40000);
const AVGN = +(opt.avg || 15000);
const OUT = opt.out || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

// ---------------- geometry (mm) ----------------
const DX = 1 / 80;               // mm per lattice cell
const LEN = 8.0;                 // canal length simulated (mm, from WL)
const NX = 80, NY = Math.round(LEN / DX) + 1; // j=0 solid row below WL
const APEX = 0.45, TAPER = 0.06; // size 45 / .06 taper
const NOD = 0.32, NID = 0.196;   // 30 G needle (Boutsioukis-type dimensions)
const type = CASE.startsWith('open') ? 'open' : 'side';
const tipY = +CASE.replace(/\D/g, '');          // mm short of WL
const CAP = +(opt.cap || 0.05);               // closed-tip thickness (side-vented)
const VENT0 = +(opt.v0 || 0.05), VENT1 = +(opt.v1 || 0.55);// vent span above the tip (mm), schematic
const FIL = 0.07;                // apical corner fillet radius

const xc = (i) => (i + 0.5 - NX / 2) * DX;
const yc = (j) => (j - 1 + 0.5) * DX;
const halfW = (y) => (APEX + TAPER * y) / 2;

function isFluid(i, j) {
  const x = xc(i), y = yc(j);
  if (y < 0) return false;
  const hw = halfW(y);
  if (Math.abs(x) >= hw) return false;
  // apical corner fillets
  if (y < FIL && Math.abs(x) > hw - FIL) { const cx = hw - FIL, dxx = Math.abs(x) - cx, dyy = y - FIL; if (dxx * dxx + dyy * dyy > FIL * FIL) return false; }
  // needle
  if (y >= tipY && Math.abs(x) < NOD / 2) {
    const inLumen = Math.abs(x) < NID / 2 && (type === 'open' ? true : y >= tipY + CAP);
    if (inLumen) return true;
    if (type === 'side' && x < 0 && y >= tipY + VENT0 && y <= tipY + VENT1) return true; // vent faces -x
    return false;
  }
  return true;
}
const isLumen = (i, j) => Math.abs(xc(i)) < NID / 2 && yc(j) >= tipY;

// ---------------- lattice ----------------
const cx = [0, 1, 0, -1, 0, 1, -1, -1, 1];
const cy = [0, 0, 1, 0, -1, 1, 1, -1, -1];
const wq = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
const opp = [0, 3, 4, 1, 2, 7, 8, 5, 6];
const N = NX * NY;
const fluid = new Uint8Array(N);
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) fluid[j * NX + i] = isFluid(i, j) ? 1 : 0;
const cells = []; for (let n = 0; n < N; n++) if (fluid[n]) cells.push(n);
const NC = cells.length;
const idx = new Int32Array(N).fill(-1); cells.forEach((n, k) => (idx[n] = k));
// pull neighbours: src[q*NC+k] = index of source cell for population q, or -1 => bounce-back
const src = new Int32Array(9 * NC);
for (let k = 0; k < NC; k++) {
  const n = cells[k], i = n % NX, j = (n / NX) | 0;
  for (let q = 0; q < 9; q++) {
    const si = i - cx[q], sj = j - cy[q];
    let s = -1;
    if (si >= 0 && si < NX && sj >= 0 && sj < NY && fluid[sj * NX + si]) s = idx[sj * NX + si];
    else if (sj >= NY) s = -2; // from outside top: handled by boundary overwrite
    src[q * NC + k] = s;
  }
}
// top boundary cells
const top = NY - 1;
const inletK = [], inletU = [], outletK = [];
const UM = +(opt.um || 0.05); // mean inlet speed (lattice units)
for (let i = 0; i < NX; i++) {
  const n = top * NX + i; if (!fluid[n]) continue;
  if (isLumen(i, top)) { const r = xc(i) / (NID / 2); inletK.push(idx[n]); inletU.push(1.5 * UM * Math.max(0, 1 - r * r)); }
  else outletK.push(idx[n]);
}
const below = (k) => idx[cells[k] - NX];
const Dcells = NID / DX;
const nuOf = (re) => UM * Dcells / re;
const nu = nuOf(RE);
let tau = 3 * nu + 0.5;
const wp = 1 / tau, lam = 0.25, wm = 1 / (0.5 + lam / (tau - 0.5));
const CS = +(opt.cs || 0.12), CSM = 18 * Math.SQRT2 * CS * CS;
console.log(`${CASE}: NX=${NX} NY=${NY} fluid=${NC} Re=${RE} nu=${nu.toFixed(5)} tau=${tau.toFixed(4)} inlet=${inletK.length} outlet=${outletK.length}`);

let f = new Float32Array(9 * NC), g = new Float32Array(9 * NC);
for (let k = 0; k < NC; k++) for (let q = 0; q < 9; q++) f[q * NC + k] = wq[q];
const rho = new Float32Array(NC), ux = new Float32Array(NC), uy = new Float32Array(NC);
const au = new Float64Array(NC), av = new Float64Array(NC), ar = new Float64Array(NC); let navg = 0;
const feq = new Float64Array(9);
const PAIRS = [[1, 3], [2, 4], [5, 7], [6, 8]];
function eq(r, u, v) { const uu = 1.5 * (u * u + v * v); for (let q = 0; q < 9; q++) { const cu = 3 * (cx[q] * u + cy[q] * v); feq[q] = wq[q] * r * (1 + cu + 0.5 * cu * cu - uu); } }

const AVG_FROM = STEPS - AVGN;
const t0 = Date.now();
for (let step = 0; step <= STEPS; step++) {
  // ramp inlet over first 3000 steps for stability
  const ramp = Math.min(1, step / 3000);
  { const reNow = step < S0 ? RE0 : step < S0 + SR ? RE0 + (RE - RE0) * (step - S0) / SR : RE; tau = 3 * nuOf(S0 > 0 ? reNow : RE) + 0.5; }
  // collide (TRT) f -> f (in place), computing macros
  for (let k = 0; k < NC; k++) {
    const f0 = f[k], f1 = f[NC + k], f2 = f[2 * NC + k], f3 = f[3 * NC + k], f4 = f[4 * NC + k], f5 = f[5 * NC + k], f6 = f[6 * NC + k], f7 = f[7 * NC + k], f8 = f[8 * NC + k];
    const r = f0 + f1 + f2 + f3 + f4 + f5 + f6 + f7 + f8;
    const u = (f1 - f3 + f5 - f6 - f7 + f8) / r, v = (f2 - f4 + f5 + f6 - f7 - f8) / r;
    rho[k] = r; ux[k] = u; uy[k] = v;
    const uu = 1.5 * (u * u + v * v);
    // feq symmetric/antisymmetric parts for each pair (a: +c, b: -c): e+ = w r (1 + 4.5 cu^2 - uu), e- = w r 3 cu
    const w0 = 4 / 9 * r, w1 = r / 9, w2 = r / 36;
    const fp1 = 0.5 * (f1 + f3), fm1 = 0.5 * (f1 - f3), ep1 = w1 * (1 + 4.5 * u * u - uu), em1 = w1 * 3 * u;
    const fp2 = 0.5 * (f2 + f4), fm2 = 0.5 * (f2 - f4), ep2 = w1 * (1 + 4.5 * v * v - uu), em2 = w1 * 3 * v;
    const c5 = u + v, c6 = v - u;
    const fp5 = 0.5 * (f5 + f7), fm5 = 0.5 * (f5 - f7), ep5 = w2 * (1 + 4.5 * c5 * c5 - uu), em5 = w2 * 3 * c5;
    const fp6 = 0.5 * (f6 + f8), fm6 = 0.5 * (f6 - f8), ep6 = w2 * (1 + 4.5 * c6 * c6 - uu), em6 = w2 * 3 * c6;
    // Smagorinsky sub-grid viscosity from the non-equilibrium momentum flux (stabiliser for the toy model)
    const n1 = fp1 - ep1, n2 = fp2 - ep2, n5 = fp5 - ep5, n6 = fp6 - ep6;
    const pxx = 2 * (n1 + n5 + n6), pyy = 2 * (n2 + n5 + n6), pxy = 2 * (n5 - n6);
    const Q = Math.sqrt(pxx * pxx + pyy * pyy + 2 * pxy * pxy);
    const te = 0.5 * (tau + Math.sqrt(tau * tau + CSM * Q / r));
    const op = 1 / te, om = 1 / (0.5 + lam / (te - 0.5));
    f[k] = f0 - op * (f0 - w0 * (1 - uu));
    let dp = op * n1, dm = om * (fm1 - em1); f[NC + k] = f1 - dp - dm; f[3 * NC + k] = f3 - dp + dm;
    dp = op * n2; dm = om * (fm2 - em2); f[2 * NC + k] = f2 - dp - dm; f[4 * NC + k] = f4 - dp + dm;
    dp = op * n5; dm = om * (fm5 - em5); f[5 * NC + k] = f5 - dp - dm; f[7 * NC + k] = f7 - dp + dm;
    dp = op * n6; dm = om * (fm6 - em6); f[6 * NC + k] = f6 - dp - dm; f[8 * NC + k] = f8 - dp + dm;
  }
  if (step >= AVG_FROM && step % 5 === 0) { for (let k = 0; k < NC; k++) { au[k] += ux[k]; av[k] += uy[k]; ar[k] += rho[k]; } navg++; }
  // stream (pull) with bounce-back
  for (let q = 0; q < 9; q++) {
    const base = q * NC, ob = opp[q] * NC;
    for (let k = 0; k < NC; k++) { const s = src[base + k]; g[base + k] = s >= 0 ? f[base + s] : (s === -1 ? f[ob + k] : f[base + k]); }
  }
  // top boundary: equilibrium inlet (velocity) / outlet (pressure)
  for (let m = 0; m < inletK.length; m++) { const k = inletK[m], kb = below(k); let r = 0; for (let q = 0; q < 9; q++) r += g[q * NC + kb]; eq(r, 0, -inletU[m] * ramp); for (let q = 0; q < 9; q++) g[q * NC + k] = feq[q]; }
  for (const k of outletK) { const kb = below(k); let r = 0, mu = 0, mv = 0; for (let q = 0; q < 9; q++) { const fq = g[q * NC + kb]; r += fq; mu += fq * cx[q]; mv += fq * cy[q]; } eq(1, mu / r, mv / r); for (let q = 0; q < 9; q++) g[q * NC + k] = feq[q]; }
  const tmp = f; f = g; g = tmp;
  if (step % (+opt.every || 5000) === 0) {
    let mx = 0, bad = false; for (let k = 0; k < NC; k++) { const s = Math.hypot(ux[k], uy[k]); if (!(s < 10)) bad = true; if (s > mx) mx = s; }
    let rmin = 9, rmax = 0; for (let k = 0; k < NC; k++) { if (rho[k] < rmin) rmin = rho[k]; if (rho[k] > rmax) rmax = rho[k]; }
    console.log(`  step ${step} maxU=${mx.toFixed(4)} inU=${uy[inletK[8]].toFixed(4)} rho=[${rmin.toFixed(4)},${rmax.toFixed(4)}] ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    if (bad) { console.log('  diverged'); process.exit(1); }
  }
}
// ---------------- output ----------------
const U = new Float32Array(N), V = new Float32Array(N), R = new Float32Array(N);
for (let k = 0; k < NC; k++) { const n = cells[k]; U[n] = au[k] / navg / UM; V[n] = av[k] / navg / UM; R[n] = ar[k] / navg; }
// pressure relative to outlet, in units of rho*UM^2 : p = cs^2 (rho-1) / UM^2
const P = new Float32Array(N); for (let n = 0; n < N; n++) P[n] = fluid[n] ? (R[n] - 1) / 3 / (UM * UM) : 0;
const buf = Buffer.alloc(N * 4 * 3 + N);
for (let n = 0; n < N; n++) { buf.writeFloatLE(U[n], n * 4); buf.writeFloatLE(V[n], (N + n) * 4); buf.writeFloatLE(P[n], (2 * N + n) * 4); buf[12 * N + n] = fluid[n]; }
fs.writeFileSync(path.join(OUT, CASE + '.bin'), buf);
// apical pressure (mean over cells at the apex row) & diagnostics
let pa = 0, na = 0; for (let i = 0; i < NX; i++) { const n = 1 * NX + i; if (fluid[n]) { pa += P[n]; na++; } }
// reach: lowest y below the tip where speed > 5% of mean inlet speed, along any column
let reach = null; for (let j = 1; j < NY; j++) { let m = 0; for (let i = 0; i < NX; i++) { const n = j * NX + i; if (fluid[n]) m = Math.max(m, Math.hypot(U[n], V[n])); } if (m > 0.05) { reach = yc(j); break; } }
const meta = { case: CASE, type, tipY, re: RE, re0: RE0, s0: S0, steps: STEPS, um: UM, cs: CS, nx: NX, ny: NY, dx: DX, apex: APEX, taper: TAPER, nod: NOD, nid: NID, cap: CAP, vent0: VENT0, vent1: VENT1, fillet: FIL, apicalP: pa / na, firstFastRow_mm: reach, secs: (Date.now() - t0) / 1000 };
fs.writeFileSync(path.join(OUT, CASE + '.json'), JSON.stringify(meta, null, 1));
console.log(meta);
// preview PPM (log speed), x stretched 3x
const SX = 3, PW = NX * SX, PH = NY;
const img = Buffer.alloc(PW * PH * 3);
for (let j = 0; j < NY; j++) for (let px = 0; px < PW; px++) {
  const n = j * NX + Math.floor(px / SX); const s = fluid[n] ? Math.hypot(U[n], V[n]) : -1;
  let c = [40, 40, 40];
  if (s >= 0) { const v = Math.max(0, Math.min(1, (Math.log10(s + 1e-4) + 3) / 3.3)); c = [255 * v, 255 * Math.sin(Math.PI * v), 255 * (1 - v)]; }
  const o = ((NY - 1 - j) * PW + px) * 3; img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2];
}
fs.writeFileSync(path.join(OUT, CASE + '.ppm'), Buffer.concat([Buffer.from(`P6 ${PW} ${PH} 255\n`), img]));
