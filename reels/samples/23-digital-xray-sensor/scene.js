/*
 * Sample 23 — the 3-D teardown (three.js r169, vendored). Everything is a pure function of t.
 * World units are schematic: the sensor's active area is AW x AD = 3.4 x 2.55 (4:3); nothing is to scale.
 * Layer order follows White & Pharoah 7e, Fig. 4-3: housing / scintillator / fiber-optic plate / CMOS chip / electronics.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { T, GW, GH, AW, AD } from './timeline.js';
import { buildRadiograph, trace, TEETH, RW, RH } from './radiograph.js';

const { clamp, lerp, seg, ease, hash, rng } = Kit;
const W = 1080, H = 1920, DEG = Math.PI / 180;
const io = ease.inOut;
const lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };   // sRGB hex -> linear working space

/* ---------- palette (linear RGB for the sprite shader) ---------- */
const C = {
  xray: lin(0xff8a00), xrayHot: lin(0xffd27a),
  light: lin(0x00b956), lightHot: lin(0xe9fff1),
  charge: lin(0x1f7dff), chargeHot: lin(0x8fd4ff),
  data: lin(0xffffff),
  laser: lin(0xff2a1f), violet: lin(0x6a4dff), violetHot: lin(0xcfc6ff),
};

/* ---------- layout constants ---------- */
const OW = 4.3, OD = 3.3, OR = 0.4;                 // housing outline
const LAY = {                                       // local y of each layer's underside: closed, open; h = thickness
  pcb: { c: 0.11, o: 0.80, h: 0.06 },
  chip: { c: 0.31, o: 1.80, h: 0.07 },
  fop: { c: 0.39, o: 3.85, h: 0.21 },
  scint: { c: 0.61, o: 4.90, h: 0.06 },
  lid: { c: 0.45, o: 6.20, h: 0.35 },
};
const ORDER = ['lid', 'scint', 'fop', 'chip', 'pcb'];
const YAW_M = 26 * DEG;                             // where the monitor stands (in front of the stack, toward the camera)
const FWD = new THREE.Vector3(Math.sin(YAW_M), 0, Math.cos(YAW_M)), LAT = new THREE.Vector3(Math.cos(YAW_M), 0, -Math.sin(YAW_M));
const DART_V = 9, DART_T = 0.3;                                   // world units / s
const PLATE_TOP = 0.205;                            // PSP phosphor surface (bed 0.14 + plate 0.065)
const SY_END = 5.3, PLATE_END_Y = 1.1;              // end card: the closed sensor and the plate float one above the other

/* camera keys: t, yaw°, elevation°, px per world unit at the target, target screen x / y, target world y, easing into this key */
const CAM = [
  [0, 40, 30, 150, 540, 1085, 0.5, 0],
  [T.explode[0], 37.5, 30, 150, 540, 1085, 0.5, 0],
  [T.explode[1], 34, 25, 95, 700, 790, 3.6, 1],               // teardown: a slow 11 degree orbit, elevation fixed
  [T.sensorOut[0], 23, 25, 95, 700, 790, 3.6, 0],
  [T.pspIn[1], 22, 32, 101, 728, 800, 1.4, 1],
  [T.family[0], 19.5, 32, 101, 728, 800, 1.4, 0],
  [T.family[1], 19, 25, 104, 735, 865, 3.4, 1],               // end card: closed sensor above, plate below
  [T.loop[0], 17, 25, 104, 735, 865, 3.4, 0],
  [T.loop[1], 40, 30, 150, 540, 1085, 0.5, 1],
];
function camAt(t) {
  let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1]; let u = clamp((t - a[0]) / (b[0] - a[0])); if (b[7]) u = io(u);
  const o = []; for (let k = 1; k <= 6; k++) o.push(lerp(a[k], b[k], u));
  o[2] = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u));       // zoom interpolated geometrically
  return o;
}

/* ---------- geometry helpers ---------- */
function rrShape(w, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + d - r); s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + d); s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  return s;
}
/** rounded slab lying flat: footprint w x d (x, z), from y = 0 to y = h. Optional rounded hole (ring). */
function slabGeo(w, d, h, r, bevel = 0.025, hole) {
  const s = rrShape(w, d, r);
  if (hole) s.holes.push(new THREE.Path(rrShape(hole[0], hole[1], hole[2]).getPoints(8)));
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(1e-3, h - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: 10 });
  g.rotateX(-Math.PI / 2); g.translate(0, bevel, 0);
  return g;
}
/** rounded panel standing up: w x h in x, y; thickness t along +z from 0 */
function panelGeo(w, h, t, r, bevel = 0.02) {
  const g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: t - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: 10 });
  g.translate(0, 0, bevel); return g;
}
function flatPlane(w, d) { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); return g; }   // canvas top row = far side (-z)
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* ---------- instanced sprite system (billboards or flat-on-the-surface), per-instance colour / alpha / shape ---------- */
class Sprites {
  constructor(max, flat, order) {
    const base = new THREE.PlaneGeometry(2, 2), g = new THREE.InstancedBufferGeometry();
    g.index = base.index; g.setAttribute('position', base.attributes.position);
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.size = new Float32Array(max * 2); this.col = new Float32Array(max * 4); this.shape = new Float32Array(max);
    const A = (arr, n) => { const a = new THREE.InstancedBufferAttribute(arr, n); a.setUsage(THREE.DynamicDrawUsage); return a; };
    g.setAttribute('iPos', this.aPos = A(this.pos, 3)); g.setAttribute('iSize', this.aSize = A(this.size, 2));
    g.setAttribute('iCol', this.aCol = A(this.col, 4)); g.setAttribute('iShape', this.aShape = A(this.shape, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, defines: flat ? { FLAT: 1 } : {},
      vertexShader: `
        attribute vec3 iPos; attribute vec2 iSize; attribute vec4 iCol; attribute float iShape;
        varying vec2 vP; varying vec4 vCol; varying float vShape;
        void main() {
          vP = position.xy; vCol = iCol; vShape = iShape;
          #ifdef FLAT
            gl_Position = projectionMatrix * viewMatrix * vec4(iPos + vec3(position.x * iSize.x, 0.0, -position.y * iSize.y), 1.0);
          #else
            vec4 mv = viewMatrix * vec4(iPos, 1.0); mv.xy += position.xy * iSize; gl_Position = projectionMatrix * mv;
          #endif
        }`,
      fragmentShader: `
        varying vec2 vP; varying vec4 vCol; varying float vShape;
        void main() {
          float r = length(vP), a;
          if (vShape < 0.5) { a = smoothstep(1.0, 0.0, r); a *= a; }                        // 0 soft glow
          else if (vShape < 1.5) { a = 1.0 - smoothstep(0.80, 1.0, r); }                     // 1 crisp disc
          else if (vShape < 2.5) {                                                           // 2 dart: head down, tail fading up
            float y = vP.y * 0.5 + 0.5, w = mix(1.0, 0.22, y);
            a = (1.0 - smoothstep(w * 0.45, w, abs(vP.x))) * pow(1.0 - y, 1.25) * smoothstep(0.0, 0.07, y);
          } else { a = step(abs(vP.x), 0.88) * step(abs(vP.y), 0.88); }                      // 3 square
          gl_FragColor = vec4(vCol.rgb, vCol.a * a);
          #include <colorspace_fragment>
        }`,
    });
    this.geo = g; this.mesh = new THREE.Mesh(g, mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = order;
  }
  begin() { this.n = 0; }
  add(x, y, z, sx, sy, c, a, shape = 0) {
    if (a <= 0.004 || this.n >= this.max) return; const i = this.n++;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z; this.size[i * 2] = sx; this.size[i * 2 + 1] = sy;
    this.col[i * 4] = c[0]; this.col[i * 4 + 1] = c[1]; this.col[i * 4 + 2] = c[2]; this.col[i * 4 + 3] = Math.min(1, a); this.shape[i] = shape;
  }
  end() { this.geo.instanceCount = this.n; this.aPos.needsUpdate = this.aSize.needsUpdate = this.aCol.needsUpdate = this.aShape.needsUpdate = true; this.mesh.visible = this.n > 0; }
}

/* ---------- flexible cable (rebuilt only when an end moves) ---------- */
function makeCable(mat, radius = 0.055) {
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); mesh.frustumCulled = false;
  let key = '', curve = null;
  return {
    mesh,
    set(A, dir, B) {
      const k = [A.x, A.y, A.z, B.x, B.y, B.z].map((v) => v.toFixed(3)).join(',');
      if (k === key) return curve; key = k;
      const fy = radius + 0.004, a1 = A.clone().addScaledVector(dir, 0.42);
      const f1 = new THREE.Vector3(A.x + dir.x * (1.15 + 0.25 * A.y), fy, A.z + dir.z * (1.15 + 0.25 * A.y) + 0.45);
      const toB = B.clone().sub(f1); toB.y = 0; const L = toB.length() || 1; toB.multiplyScalar(1 / L);
      const perp = new THREE.Vector3(toB.z, 0, -toB.x);
      const m1 = f1.clone().addScaledVector(toB, L * 0.38).addScaledVector(perp, Math.min(0.9, L * 0.09));
      const m2 = f1.clone().addScaledVector(toB, L * 0.74).addScaledVector(perp, -Math.min(0.5, L * 0.05));
      const pts = [A.clone(), a1, f1, m1, m2, new THREE.Vector3(B.x, fy, B.z)];
      if (A.y > 0.9) pts.splice(2, 0, new THREE.Vector3(lerp(a1.x, f1.x, 0.45), lerp(A.y, fy, 0.62), lerp(a1.z, f1.z, 0.5)));
      curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      mesh.geometry.dispose(); mesh.geometry = new THREE.TubeGeometry(curve, 84, radius, 8, false);
      return curve;
    },
    draw(u) { mesh.geometry.setDrawRange(0, Math.round(clamp(u) * 84) * 48); },      // show the first fraction u (from end A)
  };
}
function polyAt(P, s, out) {            // point at arc length s along a polyline of Vector3
  for (let i = 0; i < P.length - 1; i++) { const l = P[i].distanceTo(P[i + 1]); if (s <= l || i === P.length - 2) return out.lerpVectors(P[i], P[i + 1], clamp(s / (l || 1))); s -= l; }
  return out.copy(P[P.length - 1]);
}
const polyLen = (P) => { let l = 0; for (let i = 0; i < P.length - 1; i++) l += P[i].distanceTo(P[i + 1]); return l; };

export function buildScene(glc) {
  const QS = new URLSearchParams(location.search);
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: QS.get('aa') !== '0', alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ENV = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const env = (m, k = 0.8) => { m.envMap = ENV; m.envMapIntensity = k; return m; };
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(-7, 14, 9); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 0.9); rim.position.set(9, 6, -10); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d1dc, 1.15));
  const camera = new THREE.PerspectiveCamera(20, W / H, 2, 300);

  const R = buildRadiograph();

  /* ---------- materials ---------- */
  const S = (o) => new THREE.MeshStandardMaterial(o);
  const P = QS.get('phys') === '0' ? (o) => { const c = { ...o }; delete c.clearcoat; delete c.clearcoatRoughness; return new THREE.MeshStandardMaterial(c); } : (o) => new THREE.MeshPhysicalMaterial(o);
  const M = {
    shell: env(P({ color: 0x2a2e36, roughness: 0.44, clearcoat: 0.4, clearcoatRoughness: 0.42 })),
    shellIn: S({ color: 0x17191e, roughness: 0.85 }),
    accent: env(S({ color: 0x8c96a4, roughness: 0.35, metalness: 0.85 })),
    silver: env(S({ color: 0xc5cbd4, roughness: 0.32, metalness: 0.9 })),
    chipBody: env(S({ color: 0x1a2033, roughness: 0.3, metalness: 0.45 })),
    pcbBody: S({ color: 0x0f2f29, roughness: 0.6 }),
    ic: S({ color: 0x17191d, roughness: 0.45 }),
    gold: env(S({ color: 0xe0ad4a, roughness: 0.3, metalness: 1.0 })),
    cable: S({ color: 0x24272d, roughness: 0.5 }),
    glass: env(S({ color: 0x9fbcd9, roughness: 0.1, transparent: true, opacity: 0.5, depthWrite: false }), 1.0),
    bezel: env(S({ color: 0x25282e, roughness: 0.32, metalness: 0.7 })),
  };

  /* ---------- soft contact shadows (pre-blurred textures on the floor) ---------- */
  const shTex = canvasTex(256, 256, (g) => { g.filter = 'blur(20px)'; g.fillStyle = '#202838'; g.beginPath(); g.roundRect(56, 56, 144, 144, 30); g.fill(); });
  function shadow(w, d) {
    const m = new THREE.Mesh(flatPlane(w * 1.78, d * 1.78), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.5 }));
    m.position.y = 0.003; m.renderOrder = -5; scene.add(m); return m;
  }
  const shSensor = shadow(OW, OD), shMon = shadow(4.2, 0.9), shPsp = shadow(4.9, 3.9), shPlate = shadow(4.1, 3.1);

  /* =====================================================================================
   *  SENSOR
   * ===================================================================================== */
  const sensor = new THREE.Group(); scene.add(sensor);
  const mesh = (geo, mat, parent, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; parent.add(m); return m; };

  // back shell (tray) + cable boss
  const back = new THREE.Group(); sensor.add(back);
  mesh(slabGeo(OW, OD, 0.1, OR, 0.035), M.shell, back, 0);
  mesh(slabGeo(OW, OD, 0.37, OR, 0.02, [OW - 0.26, OD - 0.26, OR - 0.13]), M.shell, back, 0.08);
  mesh(slabGeo(OW - 0.26, OD - 0.26, 0.012, OR - 0.13, 0), M.shellIn, back, 0.1);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16), M.accent, back, 0.115); p.position.x = sx * 1.7; p.position.z = sz * 1.2; }
  const BOSS = new THREE.Vector3(OW / 2 + 0.46, 0.235, 0.72);            // where the cable leaves the strain relief (sensor-local)
  { const b1 = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 24), M.shell, back, 0.235); b1.rotation.z = Math.PI / 2; b1.position.x = OW / 2 + 0.08; b1.position.z = BOSS.z;
    const b2 = mesh(new THREE.CylinderGeometry(0.075, 0.15, 0.3, 24), M.cable, back, 0.235); b2.rotation.z = Math.PI / 2; b2.position.x = OW / 2 + 0.31; b2.position.z = BOSS.z; }

  // read-out electronics
  const pcb = new THREE.Group(); sensor.add(pcb);
  mesh(slabGeo(3.9, 2.9, LAY.pcb.h, 0.26, 0.012), M.pcbBody, pcb);
  const pcbTex = canvasTex(1040, 780, (g, w, h) => {
    const r = rng(41); g.fillStyle = '#103a31'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let k = 0; k < 70; k++) {                                         // manhattan traces
      let x = 40 + r() * (w - 80), y = 40 + r() * (h - 80); g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 3 + r() * 3; s++) { const l = 30 + r() * 150; if (s % 2 === (k % 2)) x = clamp(x + (r() < 0.5 ? -l : l), 30, w - 30); else y = clamp(y + (r() < 0.5 ? -l : l), 30, h - 30); g.lineTo(x, y); }
      g.strokeStyle = k % 9 === 0 ? '#c79a45' : '#1c5d4c'; g.lineWidth = k % 9 === 0 ? 3 : 4; g.stroke();
      g.fillStyle = '#d9ad55'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.fillStyle = '#0c2a23'; g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(230,240,235,.5)'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
  });
  mesh(flatPlane(3.72, 2.72), S({ map: pcbTex, roughness: 0.55 }), pcb, LAY.pcb.h + 0.002);
  const ADC = new THREE.Vector3(1.2, LAY.pcb.h, 0.95);                  // ADC package centre (pcb-local)
  { const adcTex = canvasTex(256, 256, (g) => {
      g.fillStyle = '#181a1f'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#3a3e47'; g.lineWidth = 6; g.strokeRect(14, 14, 228, 228);
      g.fillStyle = '#c9ced6'; g.font = '700 84px "Space Grotesk", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ADC', 128, 136);
      g.beginPath(); g.arc(44, 44, 10, 0, 7); g.fillStyle = '#6d7480'; g.fill(); });
    const ic = mesh(new THREE.BoxGeometry(0.78, 0.11, 0.78), [M.ic, M.ic, S({ map: adcTex, roughness: 0.45 }), M.ic, M.ic, M.ic], pcb, LAY.pcb.h + 0.055); ic.position.x = ADC.x; ic.position.z = ADC.z;
    const legs = mesh(new THREE.BoxGeometry(0.9, 0.025, 0.9), M.silver, pcb, LAY.pcb.h + 0.013); legs.position.x = ADC.x; legs.position.z = ADC.z;
    const parts = [[-0.25, 0.98, 0.5, 0.08, 0.5, M.ic], [-1.25, 0.9, 0.34, 0.07, 0.6, M.ic], [0.42, 1.08, 0.2, 0.09, 0.2, M.silver], [-0.85, -0.6, 0.6, 0.08, 0.4, M.ic], [0.9, -0.5, 0.3, 0.1, 0.3, M.silver], [1.72, 0.25, 0.18, 0.11, 0.7, M.accent]];
    for (const [x, z, w, hh, d, m] of parts) { const b = mesh(new THREE.BoxGeometry(w, hh, d), m, pcb, LAY.pcb.h + hh / 2); b.position.x = x; b.position.z = z; }
    for (let k = 0; k < 7; k++) { const b = mesh(new THREE.BoxGeometry(0.07, 0.05, 0.12), k % 2 ? M.gold : S({ color: 0xbfa58a, roughness: 0.6 }), pcb, LAY.pcb.h + 0.025); b.position.x = -1.7 + k * 0.17; b.position.z = 1.2; } }

  // CMOS chip: pixel array texture, transistor overlay, charge "wells" (bars), row select line
  const chip = new THREE.Group(); sensor.add(chip);
  mesh(slabGeo(3.84, 2.9, LAY.chip.h, 0.1, 0.012), M.chipBody, chip);
  const CELL = 20, cw = AW / GW;
  const chipTex = canvasTex(GW * CELL, GH * CELL, (g, w, h) => {
    g.fillStyle = '#0b1120'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const x = i * CELL, y = j * CELL;
      g.fillStyle = '#1b2a52'; g.fillRect(x + 6, y + 6, 13, 13);            // photodiode
      g.fillStyle = '#24376a'; g.fillRect(x + 7, y + 7, 11, 4);
      g.fillStyle = '#65739c'; g.fillRect(x + 1, y + 1, 4, 4);              // the pixel's transistor
      g.fillStyle = '#2b3a63'; g.fillRect(x, y + 5, CELL, 1); g.fillRect(x + 5, y, 1, CELL);   // row / column lines
    }
  });
  mesh(flatPlane(AW, AD), S({ map: chipTex, roughness: 0.32, metalness: 0.35 }), chip, LAY.chip.h + 0.002);
  const trTex = canvasTex(GW * CELL, GH * CELL, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { g.fillStyle = 'rgba(255,196,72,.55)'; g.fillRect(i * CELL - 1, j * CELL - 1, 9, 9); g.fillStyle = '#fff3cf'; g.fillRect(i * CELL + 1, j * CELL + 1, 5, 5); }
  });
  const trMat = new THREE.MeshBasicMaterial({ map: trTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const trPlane = mesh(flatPlane(AW, AD), trMat, chip, LAY.chip.h + 0.004); trPlane.renderOrder = 2;
  { const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 0.012, 0.075), M.gold, 36), d = new THREE.Object3D();
    for (let k = 0; k < 18; k++) for (const sx of [-1, 1]) { d.position.set(sx * 1.81, LAY.chip.h + 0.006, -1.19 + k * 0.14); d.updateMatrix(); pads.setMatrixAt(k * 2 + (sx > 0 ? 1 : 0), d.matrix); }
    chip.add(pads); }
  const barGeo = new THREE.BoxGeometry(1, 1, 1); barGeo.translate(0, 0.5, 0);
  const bars = new THREE.InstancedMesh(barGeo, S({ color: 0xffffff, roughness: 0.28, metalness: 0.1, emissive: 0x1557e0, emissiveIntensity: 0.45 }), GW * GH);
  bars.position.y = LAY.chip.h + 0.003; bars.frustumCulled = false; chip.add(bars);
  { const lo = new THREE.Color(0x1a3fd0), hi = new THREE.Color(0x53d2ff), c = new THREE.Color(), m = bars.instanceMatrix.array; m.fill(0);
    for (let k = 0; k < GW * GH; k++) { bars.setColorAt(k, c.lerpColors(lo, hi, Math.pow(R.E[k], 1.1))); m[k * 16 + 15] = 1; } bars.instanceColor.needsUpdate = true; }
  const BAR_H = 0.66, bw = cw * 0.56;
  const rowLine = mesh(new THREE.BoxGeometry(AW + 0.12, 0.014, cw * 0.9), new THREE.MeshBasicMaterial({ color: 0xbff0ff, toneMapped: false }), chip, LAY.chip.h + 0.012);

  // fiber-optic plate: glass block, vertical fibers inside, fiber ends on top
  const fop = new THREE.Group(); sensor.add(fop);
  const fopSlab = mesh(slabGeo(3.72, 2.84, LAY.fop.h, 0.1, 0.02), M.glass, fop); fopSlab.renderOrder = 3;
  { const pts = [], nx = 44, nz = 33; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = ((i + 0.5 + (j % 2) * 0.5) / nx - 0.5) * 3.6, z = ((j + 0.5) / nz - 0.5) * 2.72; pts.push(x, 0.012, z, x, LAY.fop.h - 0.012, z); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false })); l.renderOrder = 2; fop.add(l);
    const dots = canvasTex(880, 660, (g2, w, h) => { g2.clearRect(0, 0, w, h); g2.fillStyle = 'rgba(255,255,255,.75)'; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { g2.beginPath(); g2.arc((i + 0.5 + (j % 2) * 0.5) * 20, (j + 0.5) * 20, 5.2, 0, 7); g2.fill(); } });
    const top = mesh(flatPlane(3.6, 2.72), new THREE.MeshBasicMaterial({ map: dots, transparent: true, opacity: 0.42, depthWrite: false }), fop, LAY.fop.h + 0.003); top.renderOrder = 4; }

  // scintillator screen
  const scintMat = S({ color: 0xbfe6cf, roughness: 0.8, emissive: 0x18c26a, emissiveIntensity: 0,
    map: canvasTex(256, 256, (g) => { const im = g.createImageData(256, 256); for (let i = 0; i < 256 * 256; i++) { const v = 222 + hash(i, 5) * 33; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }) });
  scintMat.map.wrapS = scintMat.map.wrapT = THREE.RepeatWrapping; scintMat.map.repeat.set(3, 3);
  const scint = new THREE.Group(); sensor.add(scint); mesh(slabGeo(3.72, 2.84, LAY.scint.h, 0.1, 0.012), scintMat, scint);

  // front housing (lid)
  const lid = new THREE.Group(); sensor.add(lid);
  mesh(slabGeo(OW, OD, 0.27, OR, 0.02, [OW - 0.26, OD - 0.26, OR - 0.13]), M.shell, lid, 0);
  mesh(slabGeo(OW, OD, 0.1, OR, 0.04), M.shell, lid, 0.25);
  mesh(slabGeo(AW + 0.2, AD + 0.2, 0.006, 0.09, 0, [AW + 0.13, AD + 0.13, 0.06]), M.accent, lid, 0.349);
  { const d = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 20), M.accent, lid, 0.35); d.position.set(-OW / 2 + 0.2, 0.35, -OD / 2 + 0.2); }

  const sensorCable = makeCable(M.cable); scene.add(sensorCable.mesh);

  /* ---------- ghost teeth (the object in the beam) ---------- */
  const ghost = new THREE.Group(); scene.add(ghost);
  const gMat = {
    body: S({ color: 0xf3e9d2, roughness: 0.55, transparent: true, opacity: 0.9, depthWrite: false }),
    enamel: S({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.96, depthWrite: false }),
    pulp: S({ color: 0xe58a86, roughness: 0.6, transparent: true, opacity: 0.9, depthWrite: false }),
  };
  const G_OP = { body: 0.9, enamel: 0.96, pulp: 0.9 }, G_H = 0.1;
  { const toW = (p) => [(p[0] / RW - 0.5) * AW, -(p[1] / RH - 0.5) * AD];
    const ext = (shape, depth, bevel, mat, order) => { const g = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2, curveSegments: 14 }); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.y = bevel; m.renderOrder = order; ghost.add(m); };
    for (const t of TEETH) {
      const mk = (cmds) => { const sh = new THREE.Shape(); trace(sh, cmds, (x, y) => toW(t.xf(x, y))); return sh; };
      ext(mk(t.out), 0.07, 0.02, gMat.body, 5);
      for (const p of t.pulp) ext(mk(p), 0.078, 0, gMat.pulp, 6);
      for (const cn of t.canals) { const sh = new THREE.Shape(); R.canalPoly(cn, t.xf).map(toW).forEach((p, i) => (i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]))); sh.closePath(); ext(sh, 0.078, 0, gMat.pulp, 6); }
      ext(mk(t.en), G_H, 0.025, gMat.enamel, 7);
    } }

  /* ---------- the small screen ---------- */
  const mon = new THREE.Group(); mon.rotation.order = 'YXZ'; mon.rotation.y = YAW_M; scene.add(mon);
  const scr = document.createElement('canvas'); scr.width = RW; scr.height = RH; const sg = scr.getContext('2d');
  const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 8;
  { const tilt = new THREE.Group(); tilt.rotation.x = -9 * DEG; tilt.position.y = 0.3; mon.add(tilt);
    const bz = new THREE.Mesh(panelGeo(4.24, 3.24, 0.16, 0.18), M.bezel); bz.position.set(0, 1.62, -0.08); tilt.add(bz);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(3.96, 2.97), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false })); sp.position.set(0, 1.62, 0.083); tilt.add(sp);
    mesh(slabGeo(1.7, 1.0, 0.07, 0.2, 0.02), M.bezel, mon, 0).position.z = -0.25;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.1), M.bezel); neck.position.set(0, 0.19, -0.17); mon.add(neck); }

  /* =====================================================================================
   *  PSP plate + schematic scanner
   * ===================================================================================== */
  const psp = new THREE.Group(); scene.add(psp);
  mesh(slabGeo(4.9, 3.9, 0.14, 0.34, 0.03), M.shell, psp, 0);
  mesh(slabGeo(4.24, 3.24, 0.006, 0.36, 0, [4.14, 3.14, 0.33]), M.accent, psp, 0.139);
  const plate = new THREE.Group(); plate.rotation.order = 'YXZ'; scene.add(plate);
  mesh(slabGeo(4.1, 3.1, 0.05, 0.32, 0.012), S({ color: 0x1b2740, roughness: 0.5 }), plate, 0);
  const phosMat = env(S({ color: 0xe3e9f6, roughness: 0.36 }), 1.0);
  mesh(slabGeo(4.0, 3.0, 0.015, 0.28, 0.004), phosMat, plate, 0.05);
  { const d = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.004, 20), M.accent, plate, 0.066); d.position.set(1.72, 0.066, 1.24); }
  // phosphor face detail (so the plate is not a blank white card): fine grain + inset line, and a soft moving sheen
  { const face = canvasTex(800, 600, (g, w, h) => {
      g.clearRect(0, 0, w, h); const r = rng(77);
      for (let k = 0; k < 5200; k++) { g.fillStyle = r() < 0.5 ? 'rgba(70,95,150,.10)' : 'rgba(255,255,255,.5)'; g.fillRect(r() * w, r() * h, 2, 2); }
      g.strokeStyle = 'rgba(60,84,140,.34)'; g.lineWidth = 3; g.beginPath(); g.roundRect(26, 26, w - 52, h - 52, 40); g.stroke();
      g.strokeStyle = 'rgba(60,84,140,.16)'; g.lineWidth = 2; for (let x = 70; x < w - 60; x += 22) { g.beginPath(); g.moveTo(x, h - 44); g.lineTo(x, h - 36); g.stroke(); }
    });
    const f = mesh(flatPlane(3.9, 2.9), new THREE.MeshBasicMaterial({ map: face, transparent: true, depthWrite: false }), plate, 0.0654); f.renderOrder = 1; }
  const sheenTex = canvasTex(512, 64, (g, w, h) => { const lg = g.createLinearGradient(0, 0, w, 0); lg.addColorStop(0.3, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,.9)'); lg.addColorStop(0.7, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h); });
  sheenTex.rotation = 0.5; sheenTex.center.set(0.5, 0.5);
  const sheenMat = new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  { const f = mesh(flatPlane(3.9, 2.9), sheenMat, plate, 0.0658); f.renderOrder = 2; }

  // carriage: light-collecting guide (bar), photomultiplier tube, laser on an arm
  const car = new THREE.Group(); psp.add(car);
  const BAR_Y = PLATE_TOP + 0.3;                                           // underside of the light guide
  { const bar = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.26, 0.4), M.silver); bar.position.y = BAR_Y + 0.13; car.add(bar);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 2.9, 20), M.silver); post.position.set(-2.15, BAR_Y + 0.26 + 1.45, 0); car.add(post);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.1, 24), M.shell); foot.position.set(-2.15, BAR_Y + 0.31, 0); car.add(foot);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 20), M.shell); collar.position.set(-2.15, BAR_Y + 3.1, 0); car.add(collar);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.11, 0.11), M.silver); arm.position.set(-1.07, BAR_Y + 3.1, 0.16); arm.rotation.y = -0.14; car.add(arm);
    const head = new THREE.Mesh(slabGeo(0.62, 0.54, 0.4, 0.14, 0.05), M.shell); head.position.set(0, BAR_Y + 2.84, 0.32); car.add(head);     // laser head: rounded charcoal housing
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 24), M.shell); barrel.position.set(0, BAR_Y + 2.77, 0.32); car.add(barrel);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.07, 24), M.accent); lens.position.set(0, BAR_Y + 2.675, 0.32); car.add(lens); }
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x3a3f4a, toneMapped: false });
  { const slot = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.06, 0.02), slotMat); slot.position.set(0, BAR_Y + 0.05, 0.205); car.add(slot); }
  const pmtGlow = S({ color: 0x1f222a, roughness: 0.2, metalness: 0.3, emissive: 0x6a4dff, emissiveIntensity: 0 });
  const PMT_X = 1.72;
  { const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 28), M.shell); base.position.set(PMT_X, BAR_Y + 0.34, 0); car.add(base);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.86, 28), pmtGlow); tube.position.set(PMT_X, BAR_Y + 0.85, 0); car.add(tube);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 28), M.silver); cap.position.set(PMT_X, BAR_Y + 1.33, 0); car.add(cap);
    for (let k = 0; k < 3; k++) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.03, 28), M.gold); ring.position.set(PMT_X, BAR_Y + 0.62 + k * 0.23, 0); car.add(ring); } }
  const LASER_Y = BAR_Y + 2.7;
  const fanGeo = new THREE.BufferGeometry(); fanGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3));
  const fan = new THREE.Mesh(fanGeo, new THREE.MeshBasicMaterial({ color: 0xff2a1f, transparent: true, opacity: 0.11, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); fan.frustumCulled = false; fan.renderOrder = 8; scene.add(fan);
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); beamGeo.translate(0, 0.5, 0);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xff3324, toneMapped: false })); beam.frustumCulled = false; scene.add(beam);
  const scanLine = new THREE.Mesh(new THREE.BoxGeometry(AW + 0.3, 0.004, 0.03), new THREE.MeshBasicMaterial({ color: 0xff4a3a, toneMapped: false })); scene.add(scanLine);
  const pspCable = makeCable(M.cable); scene.add(pspCable.mesh);

  /* ---------- particles ---------- */
  const fl = new Sprites(1700, true, 9), bb = new Sprites(900, false, 10); scene.add(fl.mesh, bb.mesh);
  function makeDarts(seed, n, tA, tB) {
    const r = rng(seed), out = [];
    for (let k = 0; k < n; k++) {
      const u = r(), v = r(), t0 = lerp(tA, tB, (k + r()) / n), tn = R.sampleT(u, v) / R.tmax;
      out.push({ x: (u - 0.5) * AW, z: (v - 0.5) * AD, t0, pass: r() < Math.pow(tn, 0.7), h: r() });
    }
    return out;
  }
  const dartsS = makeDarts(7, 760, 0.3, T.exposeEnd), dartsP = makeDarts(19, 120, T.pspExpose[0] + 0.12, T.pspExpose[1]);

  /* ---------- helpers that depend on t ---------- */
  function layerE(i, t) {                                 // explode amount of layer ORDER[i]
    const st = (u) => io(clamp(u * 1.3 - i * 0.07));
    if (t < 9) return st(seg(t, T.explode[0], T.explode[1]));
    if (t < 15.5) return st(1 - seg(t, T.sensorOut[0], T.sensorOut[0] + 0.62));
    return 0;                                             // end card: the sensor comes back closed (thick body + cable)
  }
  const v3 = new THREE.Vector3(), q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
  const proj = (x, y, z) => { v3.set(x, y, z).project(camera); return [(v3.x * 0.5 + 0.5) * W, (1 - (v3.y * 0.5 + 0.5)) * H]; };
  const tA = new THREE.Vector3(), tB = new THREE.Vector3(), tP = new THREE.Vector3();
  const DIRX = new THREE.Vector3(1, 0, 0);
  const rowZ = (j) => ((j + 0.5) / GH - 0.5) * AD;

  // idle glass = standby (dark gray with a soft studio reflection), so the empty screen does not pull the eye
  const standby = sg.createLinearGradient(0, 0, RW, RH); standby.addColorStop(0, '#363d49'); standby.addColorStop(0.55, '#232831'); standby.addColorStop(1, '#1b1f27');
  const glare = sg.createLinearGradient(RW * 0.1, 0, RW * 0.62, RH); glare.addColorStop(0.3, 'rgba(255,255,255,0)'); glare.addColorStop(0.5, 'rgba(255,255,255,.07)'); glare.addColorStop(0.56, 'rgba(255,255,255,0)');
  function drawScreen(t) {
    sg.globalAlpha = 1; sg.fillStyle = '#06080b'; sg.fillRect(0, 0, RW, RH);
    const bw2 = RW / GW, bh2 = RH / GH; let live;
    if (t < T.sensorOut[0] + 0.6) {
      live = seg(t, T.read[0] + T.lag - 0.3, T.read[0] + T.lag - 0.05) * (1 - seg(t, T.sensorOut[0], T.sensorOut[0] + 0.5));
      const rf = ((t - T.lag - T.read[0]) / (T.read[1] - T.read[0])) * GH;
      if (rf > 0) {
        for (let j = 0; j < Math.min(GH, Math.ceil(rf)); j++) {
          const n = j < Math.floor(rf) ? GW : Math.ceil((rf - j) * GW);
          for (let i = 0; i < n; i++) { const g = Math.round(R.blockGray[j * GW + i] * 255); sg.fillStyle = `rgb(${g},${g},${g})`; sg.fillRect(Math.floor(i * bw2), Math.floor(j * bh2), Math.ceil(bw2), Math.ceil(bh2)); }
        }
        const a = seg(t, T.refine[0], T.refine[1], ease.smooth); if (a > 0) { sg.globalAlpha = a; sg.drawImage(R.hi, 0, 0); sg.globalAlpha = 1; }
      }
    } else {
      live = seg(t, T.pspScan[0], T.pspScan[0] + 0.25);
      const p = seg(t, T.pspScan[0] + 0.25, T.pspScan[1] + 0.25);
      if (p > 0) { const hh = Math.round(RH * p); sg.drawImage(R.hi, 0, 0, RW, hh, 0, 0, RW, hh); if (p < 1) { sg.fillStyle = 'rgba(190,180,255,.9)'; sg.fillRect(0, hh - 2, RW, 3); } }
    }
    if (live < 1) { sg.globalAlpha = 1 - live; sg.fillStyle = standby; sg.fillRect(0, 0, RW, RH); sg.fillStyle = glare; sg.fillRect(0, 0, RW, RH); sg.globalAlpha = 1; }
    sg.strokeStyle = 'rgba(160,170,185,.35)'; sg.lineWidth = 2;                 // viewer chrome: corner ticks
    for (const [x, y, dx, dy] of [[14, 14, 1, 1], [RW - 14, 14, -1, 1], [14, RH - 14, 1, -1], [RW - 14, RH - 14, -1, -1]]) { sg.beginPath(); sg.moveTo(x + 26 * dx, y); sg.lineTo(x, y); sg.lineTo(x, y + 26 * dy); sg.stroke(); }
    scrTex.needsUpdate = true;
  }

  /* =====================================================================================
   *  update(t): pose everything, render, return projected anchors for the 2-D labels
   * ===================================================================================== */
  function update(t, skip3d) {
    /* camera */
    const [yawD, elD, Spx, cx, cy, ty] = camAt(t);
    const yaw = yawD * DEG, el = elD * DEG, dist = (H / 2) / (Spx * Math.tan(10 * DEG));
    camera.position.set(Math.sin(yaw) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.cos(yaw) * Math.cos(el) * dist);
    camera.lookAt(0, ty, 0);
    camera.setViewOffset(W, H, -(cx - W / 2), -(cy - H / 2), W, H); camera.updateMatrixWorld();

    /* sensor pose */
    const ret = io(seg(t, T.family[0] + 0.2, T.family[1]));                        // the sensor returns (closed) for the end card
    const sx = 15 * io(seg(t, T.sensorOut[0] + 0.2, T.sensorOut[1])) - 15 * ret;
    const hov = (t >= T.family[0] ? 1 : 0) * (1 - io(seg(t, T.loop[0], T.loop[0] + 0.55)));   // floats above the plate (it is off screen when this steps)
    const sy = SY_END * hov;
    sensor.position.set(sx, sy, 0);
    const Y = {}; ORDER.forEach((n, i) => { Y[n] = lerp(LAY[n].c, LAY[n].o, layerE(i, t)); });
    lid.position.y = Y.lid; scint.position.y = Y.scint; fop.position.y = Y.fop; chip.position.y = Y.chip; pcb.position.y = Y.pcb;
    const eLid = layerE(0, t);
    const yScintTop = sy + Y.scint + LAY.scint.h, yScintBot = sy + Y.scint, yFopTop = sy + Y.fop + LAY.fop.h, yFopBot = sy + Y.fop, yChipTop = sy + Y.chip + LAY.chip.h, yPcbTop = sy + Y.pcb + LAY.pcb.h;

    /* monitor */
    const kM = lerp(24, 9, io(seg(t, T.monitorIn[0], T.monitorIn[1])));
    const lat = -1.15 * io(seg(t, T.sensorOut[0], T.pspIn[1]));
    const pxOut = -16 * io(seg(t, T.family[0], T.family[0] + 0.5));                // scanner, its cable and the screen leave together, to the left
    mon.position.set(FWD.x * kM + LAT.x * lat + pxOut, 0, FWD.z * kM + LAT.z * lat); mon.visible = kM < 23.5 && pxOut > -15.9;
    drawScreen(t);
    const monBase = tB.set(mon.position.x - pxOut - FWD.x * 0.55, 0, mon.position.z - FWD.z * 0.55);

    /* PSP rig */
    const pxIn = -16 * (1 - io(seg(t, T.pspIn[0], T.pspIn[1]))), px = pxIn + pxOut;
    psp.position.set(px, 0, 0); psp.visible = pxIn > -15.9 && pxOut > -15.9;
    const scanP = seg(t, T.pspScan[0], T.pspScan[1]);
    const zScan = lerp(-AD / 2 - 0.08, AD / 2 + 0.08, scanP);
    // the read-out carriage (laser, light guide, photomultiplier) is out of frame during the exposure: two places, two steps
    const carX = -15 * (1 - io(seg(t, T.carriageIn[0], T.carriageIn[1]))), zc = zScan - 0.34;
    car.position.set(carX, 0, zc); car.visible = carX > -14.9;
    const beamOn = Kit.env(t, T.pspScan[0], T.pspScan[1], 0.12, 0.1);
    const xSpot = -AW / 2 + AW * (0.5 - 0.5 * Math.cos(Math.PI * scanP * 5));
    slotMat.color.setHex(0x3a3f4a).lerp(new THREE.Color(0x7a5cff), beamOn);
    pmtGlow.emissiveIntensity = 1.6 * beamOn * (0.75 + 0.25 * Math.sin(t * 40));
    fan.visible = beam.visible = scanLine.visible = beamOn > 0.01;
    if (beamOn > 0.01) {
      const p = fanGeo.attributes.position.array; p.set([px, LASER_Y, zScan, px - AW / 2 - 0.15, PLATE_TOP + 0.004, zScan, px + AW / 2 + 0.15, PLATE_TOP + 0.004, zScan]); fanGeo.attributes.position.needsUpdate = true;
      fan.material.opacity = 0.11 * beamOn;
      tA.set(px, LASER_Y, zScan); tP.set(px + xSpot, PLATE_TOP, zScan); v3.copy(tP).sub(tA); const L = v3.length();
      beam.position.copy(tA); beam.quaternion.setFromUnitVectors(UP, v3.multiplyScalar(1 / L)); beam.scale.set(0.014, L, 0.014);
      scanLine.position.set(px, PLATE_TOP + 0.004, zScan);
    }
    // plate: on the bed, then lifted and tilted toward the camera for the end card, then out
    // (1) it lifts off the bed while the scanner slides away, (2) it rises to float level under the sensor: thin, flat, rigid
    const lift = io(seg(t, T.family[0], T.family[0] + 0.35)), pe = io(seg(t, T.family[0] + 0.25, T.family[1])), pOut = io(seg(t, T.loop[0], T.loop[0] + 0.5));
    const rock = Math.sin((t - T.family[1]) * 1.25);
    plate.position.set(pxIn + 16 * pOut, lerp(lerp(0.14, 0.55, lift), PLATE_END_Y, pe), 0);
    plate.rotation.set((9 + 4.5 * rock) * DEG * pe, 0, 0); plate.visible = pxIn > -15.9 && pOut < 0.999;
    sheenMat.opacity = 0.5 * pe * (1 - pOut); sheenTex.offset.x = 0.42 * rock;

    /* ghost teeth */
    let gO, gx, gy;
    if (t < 10) { gO = 1 - seg(t, T.ghostOut[0], T.ghostOut[1]); gx = sx; gy = sy + Y.lid + LAY.lid.h + 0.7 + 0.2 * eLid; }
    else if (t < 20) { gO = seg(t, T.pspIn[1] - 0.3, T.pspExpose[0]) * (1 - seg(t, T.pspExpose[1] + 0.05, T.pspExpose[1] + 0.4)); gx = px; gy = 1.6; }
    else { gO = seg(t, T.loop[0] + 0.3, T.loop[1] - 0.1); gx = sx; gy = sy + Y.lid + LAY.lid.h + 0.7; }
    ghost.visible = gO > 0.01; ghost.position.set(gx, gy, 0);
    gMat.body.opacity = G_OP.body * gO; gMat.enamel.opacity = G_OP.enamel * gO; gMat.pulp.opacity = G_OP.pulp * gO;

    /* cables */
    const cA = tA.set(sx + BOSS.x, sy + BOSS.y, BOSS.z);
    let cB;
    if (t < T.family[0] - 0.15) cB = v3.set(monBase.x + sx, 0, monBase.z);
    else { const w = io(seg(t, T.loop[0], T.loop[0] + 0.6)); cB = v3.set(lerp(sx + 11, FWD.x * 23.45, w), 0, lerp(2.4, FWD.z * 23.45, w)); }
    const sCurve = sensorCable.set(cA, DIRX, cB);
    sensorCable.mesh.visible = sx < 14.9;
    // scanner cable: drawn on from the carriage to the screen once the carriage has arrived (no loose end), leaves with the rig
    const cab = seg(t, T.carriageIn[1] - 0.15, T.carriageIn[1] + 0.15);
    pspCable.mesh.visible = psp.visible && cab > 0; pspCable.mesh.position.x = pxOut;
    let pCurve = null;
    if (pspCable.mesh.visible) { pCurve = pspCable.set(tP.set(2.35, BAR_Y + 0.13, zc), DIRX, v3.set(monBase.x, 0, monBase.z)); pspCable.draw(cab); }

    /* charge wells (bars), transistor overlay, row select */
    const m = bars.instanceMatrix.array; let any = false;
    const fillOn = t > T.cmos && t < T.read[1] + 0.3;
    if (fillOn) for (let j = 0; j < GH; j++) {
      const tr = lerp(T.read[0], T.read[1], j / GH), drain = 1 - seg(t, tr, tr + 0.11);
      for (let i = 0; i < GW; i++) {
        const k = j * GW + i, f = ease.out(seg(t, T.cmos + 0.25 + 0.5 * hash(k, 3), T.exposeEnd + 0.25 + 0.5 * hash(k, 3)));
        const h = BAR_H * R.E[k] * f * drain, o = k * 16;
        m[o] = h > 0.002 ? bw : 0; m[o + 5] = Math.max(h, 1e-4); m[o + 10] = h > 0.002 ? bw : 0;
        m[o + 12] = ((i + 0.58) / GW - 0.5) * AW; m[o + 14] = ((j + 0.58) / GH - 0.5) * AD;
        if (h > 0.002) any = true;
      }
    }
    bars.visible = fillOn && any; if (fillOn) bars.instanceMatrix.needsUpdate = true;
    trMat.opacity = Math.max(Kit.env(t, T.cmos2 - 0.05, T.cmos2 + 0.9, 0.3, 0.5), 0.5 * seg(t, T.cmos2, T.cmos2 + 0.4)) * (1 - seg(t, T.sensorOut[0], T.sensorOut[0] + 0.3)); trPlane.visible = trMat.opacity > 0.01;
    const rf = ((t - T.read[0]) / (T.read[1] - T.read[0])) * GH;
    rowLine.visible = rf > 0 && rf < GH; if (rowLine.visible) rowLine.position.z = rowZ(Math.floor(rf));

    /* shadows */
    shSensor.position.set(sx, 0.003, 0); shSensor.material.opacity = (0.62 - 0.2 * eLid) * (1 - 0.8 * hov); shSensor.scale.setScalar(1 + 0.12 * eLid + 0.3 * hov); shSensor.visible = sx < 14.9;
    shMon.position.set(mon.position.x, 0.003, mon.position.z - 0.2); shMon.rotation.y = YAW_M; shMon.visible = mon.visible; shMon.material.opacity = 0.5;
    shPsp.position.set(px, 0.003, 0); shPsp.visible = psp.visible; shPsp.material.opacity = 0.6;
    shPlate.position.set(plate.position.x, 0.003, 0); shPlate.visible = lift > 0.02 && plate.visible; shPlate.material.opacity = 0.4 * lift * (1 - pOut);

    /* ---------- particles ---------- */
    fl.begin(); bb.begin();
    // X-ray darts on the sensor (t wraps for the loop: the last 0.75 s replays the approach to t = 0)
    const td = t > T.loop[0] ? t - T.dur : t;
    const yGhostMid = gy + G_H, yClip = lerp(yScintBot, yFopTop, seg(t, T.scint + 0.75, T.fop)) + (yFopBot - yFopTop) * seg(t, T.fop + 0.1, T.cmos - 0.25) + (yChipTop - yFopBot) * seg(t, T.cmos - 0.25, T.cmos + 0.1);
    const flashOn = seg(t, T.scint - 0.2, T.scint + 0.1) * (eLid > 0.9 ? 1 : 0);
    const dartDim = lerp(1, 0.35, seg(td, T.cmos - 0.3, T.cmos + 0.5));              // the chip is the focal point from here on
    if (td < T.exposeEnd + 0.9 && sx < 1) for (const d of dartsS) {
      const dt = d.t0 - td;
      if (dt > DART_T) continue;
      if (dt >= 0) {                                                                // in flight
        const yEnd = d.pass ? yScintTop : yGhostMid, y = yEnd + DART_V * dt;
        let a = Math.min(1, (DART_T - dt) / 0.09) * 0.95 * dartDim; if (!d.pass) a *= clamp(dt / 0.05);
        if (eLid > 0.3) a *= clamp((proj(sx + d.x, y + 0.3, d.z)[1] - 296) / 50);   // darts appear below the header lines (y > 300 px), never across the kicker / handle
        bb.add(sx + d.x, y + 0.3, d.z, 0.05, 0.3, C.xray, a, 2); bb.add(sx + d.x, y + 0.04, d.z, 0.03, 0.03, C.xrayHot, a, 0);
      } else if (d.pass && flashOn > 0) {
        const age = -dt;
        if (age < 0.5) { const u = age / 0.5, s = 0.08 + 0.24 * ease.out(u), a = flashOn * Math.pow(1 - u, 1.2); fl.add(sx + d.x, yScintTop + 0.004, d.z, s, s, C.light, a, 0); fl.add(sx + d.x, yScintTop + 0.005, d.z, s * 0.4, s * 0.4, C.lightHot, a, 0); }
        const yl = yScintBot - 3.4 * (age - 0.03);                                  // visible light heading for the chip
        if (age > 0.03 && yl > yClip && yl > yChipTop) {
          bb.add(sx + d.x, yl + 0.15, d.z, 0.042, 0.16, C.light, 0.95, 2);
          if (yl < yFopTop + 0.1 && yl > yFopBot - 0.25) {                           // the fiber it travels in lights up
            const yb = Math.max(yFopBot, yClip); if (yFopTop - yb > 0.02) bb.add(sx + d.x, (yFopTop + yb) / 2, d.z, 0.016, (yFopTop - yb) / 2, C.light, 0.75, 3);
          }
        }
      }
    }
    scintMat.emissiveIntensity = 0.28 * flashOn * (1 - seg(t, T.exposeEnd, T.exposeEnd + 0.5));

    // read-out: charge packets leave the chip (blue), numbers leave the ADC (white squares)
    if (t > T.read[0] - 0.1 && t < T.read[1] + 2.2 && sx < 1) {
      const xe = AW / 2 + 0.12, yc = yChipTop + 0.03, yp = yPcbTop + 0.14, zA = ADC.z;
      for (let te = T.read[0]; te < T.read[1]; te += 0.04) {
        const age = t - te; if (age < 0 || age > 1.2) continue;
        const z0 = rowZ(clamp(Math.floor(((te - T.read[0]) / (T.read[1] - T.read[0])) * GH), 0, GH - 1));
        const Pth = [tA.set(xe, yc, z0), tP.set(xe, yc, zA), new THREE.Vector3(xe, yp, zA), new THREE.Vector3(ADC.x + 0.4, yp, zA)];
        const s = age * 5.5, L = polyLen(Pth); if (s > L) continue;
        polyAt(Pth, s, v3); bb.add(v3.x, v3.y, v3.z, 0.12, 0.12, C.charge, 0.95, 0); bb.add(v3.x, v3.y, v3.z, 0.045, 0.045, C.chargeHot, 1, 1);
      }
      if (sCurve) {
        const P2 = [new THREE.Vector3(ADC.x + 0.42, yp, zA), new THREE.Vector3(1.9, yp, BOSS.z), new THREE.Vector3(BOSS.x - 0.3, BOSS.y + 0.2, BOSS.z)];
        const Lp = polyLen(P2), Lc = sCurve.getLength(), Lt = Lp + Lc, gap = 0.42;
        const front = 34 * (t - (T.read[0] + 0.3)), tail = 34 * (t - (T.read[1] + 0.45)), ph = (t * 7) % gap;
        for (let s = ph; s < Lt; s += gap) {
          if (s > front || s < tail) continue;
          if (s < Lp) polyAt(P2, s, v3); else { sCurve.getPointAt(clamp((s - Lp) / Lc), v3); v3.y += 0.07; }
          bb.add(v3.x, v3.y, v3.z, 0.05, 0.05, C.data, 0.95, 3);
        }
      }
    }

    // PSP: exposure -> trapped electrons, laser read-out
    if (psp.visible || plate.visible) {
      const grow = seg(t, T.pspExpose[0] + 0.18, T.pspExpose[1] + 0.12, ease.smooth), erase = 1 - seg(t, T.family[0] - 0.05, T.family[0] + 0.25, ease.smooth);   // dots fade as the plate leaves the scanner
      if (grow > 0 && erase > 0) for (let j = 0; j < GH; j++) {
        const z = rowZ(j), sf = 1 - 0.58 * clamp((zScan - z) / 0.14) * (t >= T.pspScan[0] ? 1 : 0);
        for (let i = 0; i < GW; i++) {
          const k = j * GW + i, g1 = clamp(grow * 1.5 - 0.5 * hash(k, 9)), s = cw * 0.47 * Math.sqrt(R.E[k]) * g1 * sf * erase;
          if (s > 0.004) fl.add(pxIn + ((i + 0.5) / GW - 0.5) * AW, plate.position.y + 0.068, z, s, s, C.charge, 0.95, 1);
        }
      }
      for (const d of dartsP) {
        const dt = d.t0 - t; if (dt > DART_T || dt < -0.3) continue;
        if (dt >= 0) { const yEnd = d.pass ? PLATE_TOP : 1.6 + G_H, y = yEnd + DART_V * dt; let a = Math.min(1, (DART_T - dt) / 0.09) * 0.95; if (!d.pass) a *= clamp(dt / 0.05);
          bb.add(px + d.x, y + 0.3, d.z, 0.05, 0.3, C.xray, a, 2); bb.add(px + d.x, y + 0.04, d.z, 0.03, 0.03, C.xrayHot, a, 0);
        } else if (d.pass) { const u = -dt / 0.3; fl.add(px + d.x, PLATE_TOP + 0.005, d.z, 0.05 + 0.12 * u, 0.05 + 0.12 * u, C.chargeHot, 0.8 * (1 - u), 0); }
      }
      if (beamOn > 0.01) {
        fl.add(px + xSpot, PLATE_TOP + 0.006, zScan, 0.34, 0.26, C.violet, 0.9 * beamOn, 0);
        bb.add(px + xSpot, PLATE_TOP + 0.03, zScan, 0.15, 0.15, C.laser, 0.9 * beamOn, 0); bb.add(px + xSpot, PLATE_TOP + 0.03, zScan, 0.05, 0.05, C.data, beamOn, 0);
        for (let te = Math.floor(t / 0.035) * 0.035; te > t - 0.3; te -= 0.035) {        // blue-violet light hopping into the guide
          if (te < T.pspScan[0]) break; const u = (t - te) / 0.3, sp = seg(te, T.pspScan[0], T.pspScan[1]);
          const x0 = -AW / 2 + AW * (0.5 - 0.5 * Math.cos(Math.PI * sp * 5)), z0 = lerp(-AD / 2 - 0.08, AD / 2 + 0.08, sp);
          bb.add(px + x0, lerp(PLATE_TOP + 0.03, BAR_Y + 0.05, u) + 0.1 * Math.sin(u * Math.PI), lerp(z0, z0 - 0.13, u), 0.055, 0.055, C.violet, 0.95 * (1 - u * u), 0);
        }
        bb.add(px + PMT_X, BAR_Y + 0.85, zc, 0.5, 0.75, C.violet, 0.35 * beamOn, 0);
      }
      if (pCurve && t > T.pspScan[0] && t < T.pspScan[1] + 1.2) {
        const Lc = pCurve.getLength(), gap = 0.42, front = 34 * (t - (T.pspScan[0] + 0.15)), tail = 34 * (t - (T.pspScan[1] + 0.2)), ph = (t * 7) % gap;
        for (let s = ph; s < Lc; s += gap) { if (s > front || s < tail) continue; pCurve.getPointAt(clamp(s / Lc), v3); bb.add(v3.x, v3.y + 0.07, v3.z, 0.05, 0.05, C.data, 0.95, 3); }
      }
    }
    fl.end(); bb.end();

    if (!skip3d) renderer.render(scene, camera);

    /* ---------- anchors for the 2-D overlay (pixels) ---------- */
    const cx0 = sx - OW / 2 + 0.16, cz0 = OD / 2 - 0.16, ix = sx - 1.86 + 0.1, iz = 1.42 - 0.1;
    return {
      lid: proj(cx0, sy + Y.lid + LAY.lid.h, cz0), scint: proj(ix, yScintTop, iz), fop: proj(ix, yFopTop, iz), chip: proj(sx - 1.92 + 0.08, yChipTop, 1.45 - 0.08),
      pcb: proj(sx - 1.95 + 0.14, yPcbTop, 1.45 - 0.14), back: proj(cx0, sy + 0.45, cz0),
      mon: (() => { v3.set(-2.12, 0.3 + 1.62, 0.08).applyEuler(mon.rotation).add(mon.position); return proj(v3.x, v3.y, v3.z); })(),
      plate: (() => { v3.set(-2.05 + 0.2, 0.066, 1.55 - 0.2).applyEuler(plate.rotation).add(plate.position); return proj(v3.x, v3.y, v3.z); })(),
      pmt: proj(px + carX + PMT_X, BAR_Y + 1.4, zc), laser: proj(px, LASER_Y + 0.4, zScan),
      sensorX: sx, explode: eLid,
    };
  }

  return { update, renderer, scene, camera };
}
