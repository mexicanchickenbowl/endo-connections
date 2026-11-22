/*
 * 39 · alley.js — the 3-D bowling alley (three.js): ten glossy pins on a polished maple pin deck,
 * with real reflections (mirrored pass under a semi-transparent lane), one shadow-casting key light and a
 * moving "active" spotlight. Everything is a pure function of the state passed to render().
 * Units are inches. The camera looks down -Z; the head pin stands at the origin, rows recede to -Z.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const { lerp, clamp, rng } = window.Kit;

/* ---------- regulation tenpin profile: [height, diameter] in inches ---------- */
const PROFILE = [
  [0, 2.03], [0.25, 2.40], [0.75, 2.83], [1.5, 3.42], [2.25, 3.91], [3.375, 4.51], [4.5, 4.77], [5.875, 4.56],
  [7.25, 3.70], [8.625, 2.47], [9.375, 1.97], [10, 1.80], [10.875, 1.87], [11.75, 2.09], [12.625, 2.41], [13.5, 2.55],
];
function radiusAt(h) {                     // non-uniform Catmull-Rom through the profile
  const P = PROFILE; let i = 0;
  while (i < P.length - 2 && h > P[i + 1][0]) i++;
  const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
  const u = clamp((h - p1[0]) / (p2[0] - p1[0]));
  const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0] || 1) * (p2[0] - p1[0]);
  const m2 = (p3[1] - p1[1]) / (p3[0] - p1[0] || 1) * (p2[0] - p1[0]);
  const u2 = u * u, u3 = u2 * u;
  return 0.5 * ((2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2);
}
function pinGeometry() {
  const pts = [];
  pts.push(new THREE.Vector2(0.001, 0));
  for (let h = 0; h <= 13.4001; h += 0.2) pts.push(new THREE.Vector2(radiusAt(h), h));
  const R = 1.275, c = 15 - R, a0 = Math.asin((13.5 - c) / R);
  for (let k = 0; k <= 12; k++) { const a = lerp(a0, Math.PI / 2, k / 12); pts.push(new THREE.Vector2(Math.max(0.001, R * Math.cos(a)), c + R * Math.sin(a))); }
  const g = new THREE.LatheGeometry(pts, 64);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, pos.getY(i) / 15);   // v = height / 15 so the texture is isotropic at the belly
  uv.needsUpdate = true;
  return g;
}

/* ---------- textures ---------- */
function pinTexture(label, band) {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  const yOf = (h) => (1 - h / 15) * S;
  const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#fbf7ee'); g.addColorStop(1, '#efe8d9');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.fillStyle = band;
  x.fillRect(0, yOf(9.95), S, yOf(9.2) - yOf(9.95));      // two neck stripes
  x.fillRect(0, yOf(11.15), S, yOf(10.4) - yOf(11.15));
  x.fillRect(0, yOf(0.55), S, S - yOf(0.55));              // base ring
  // numeral on the belly, facing the camera (u = 0.5)
  x.fillStyle = '#1c1915'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  let fs = 170; x.font = `400 ${fs}px Anton`;
  let m = x.measureText(label);
  const targetH = label.length > 1 ? 104 : 120;
  fs *= targetH / (m.actualBoundingBoxAscent || 120); x.font = `400 ${fs}px Anton`; m = x.measureText(label);
  const w = m.width, maxW = 132, sx = Math.min(1, maxW / w);
  x.save(); x.translate(S / 2, yOf(5.15) + targetH / 2); x.scale(sx, 1); x.fillText(label, 0, 0); x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping;
  return t;
}

function laneTexture(geom, pins) {
  const CW = 1024, CH = Math.round(1024 * geom.len / geom.width), c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const x = c.getContext('2d'), r = rng(3907), ppi = CW / geom.width;
  const yOf = (z) => (z - geom.zFar) * ppi, xOf = (wx) => (wx + geom.width / 2) * ppi;
  const boards = 39, bw = CW / boards;
  for (let b = 0; b < boards; b++) {
    const k = r(), tone = [lerp(214, 232, k), lerp(160, 184, k), lerp(96, 120, r())];
    // each board is made of a few planks end to end
    let y = -r() * 500;
    while (y < CH) {
      const L = 520 + r() * 900, j = (r() - 0.5) * 16;
      x.fillStyle = `rgb(${tone[0] + j | 0},${tone[1] + j | 0},${tone[2] + j * 0.6 | 0})`;
      x.fillRect(b * bw, y, bw + 1, L);
      x.fillStyle = 'rgba(70,40,14,0.35)'; x.fillRect(b * bw, y + L - 1.5, bw, 1.5);
      y += L;
    }
    x.fillStyle = 'rgba(70,40,14,0.30)'; x.fillRect(b * bw - 0.75, 0, 1.5, CH);
  }
  // grain
  for (let i = 0; i < 2600; i++) {
    const gx = r() * CW, gy = r() * CH, gl = 60 + r() * 380;
    x.strokeStyle = `rgba(${r() < 0.5 ? '90,52,18' : '255,236,200'},${0.03 + r() * 0.07})`; x.lineWidth = 0.6 + r() * 1.2;
    x.beginPath(); x.moveTo(gx, gy); x.bezierCurveTo(gx + (r() - 0.5) * 5, gy + gl * 0.3, gx + (r() - 0.5) * 5, gy + gl * 0.7, gx + (r() - 0.5) * 3, gy + gl); x.stroke();
  }
  // pin spots
  for (const p of pins) {
    x.fillStyle = 'rgba(40,26,14,0.55)'; x.beginPath(); x.arc(xOf(p.x), yOf(p.z), 1.25 * ppi, 0, 7); x.fill();
  }
  // target arrows (seven darts in a V, pointing at the pins) — decorative, real ones sit nearer the foul line
  for (let k = -3; k <= 3; k++) {
    const ax = xOf(k * 5 * (geom.width / boards)), az = 20 + Math.abs(k) * 4.2, ay = yOf(az), hw = 0.62 * ppi, L = 6.2 * ppi;
    x.fillStyle = '#5a2414';
    x.beginPath(); x.moveTo(ax, ay - L * 0.55); x.lineTo(ax + hw, ay + L * 0.45); x.lineTo(ax, ay + L * 0.28); x.lineTo(ax - hw, ay + L * 0.45); x.closePath(); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function poolTexture() {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(0.7, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

/* ---------- scene ---------- */
export function buildAlley(o) {
  const { W, H, pins, cam: C } = o;          // pins: [{x, z, label, band}]  (x, z in inches)
  const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
  const Q = new URLSearchParams(location.search), q = (k, d) => (Q.has(k) ? +Q.get(k) : d);
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: !!q('aa', 1), alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !!q('sh', 1); renderer.shadowMap.type = q('soft', 1) ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
  renderer.autoClear = false; renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  if (q('env', 1)) scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  const camera = new THREE.PerspectiveCamera(C.fov, W / H, 20, 900);
  const tgt = new THREE.Vector3(C.tx || 0, C.ty, C.tz);
  const cp = C.pitch * Math.PI / 180, cy = (C.yaw || 0) * Math.PI / 180;
  camera.position.set(tgt.x + C.dist * Math.sin(cy) * Math.cos(cp), tgt.y + C.dist * Math.sin(cp), tgt.z + C.dist * Math.cos(cy) * Math.cos(cp));
  camera.lookAt(tgt); camera.updateMatrixWorld(true); camera.updateProjectionMatrix();

  const geom = { width: 41.5, zNear: 78, zFar: -36.5 }; geom.len = geom.zNear - geom.zFar;
  const statics = new THREE.Group(); scene.add(statics);
  const world = new THREE.Group(); scene.add(world);      // pins + lights: mirrored (scale.y = -1) for the reflection pass

  // lane
  const laneGeo = new THREE.PlaneGeometry(geom.width, geom.len); laneGeo.rotateX(-Math.PI / 2); laneGeo.translate(0, 0, (geom.zNear + geom.zFar) / 2);
  const laneMat = new THREE.MeshStandardMaterial({ map: laneTexture(geom, pins), roughness: 0.2, metalness: 0, transparent: true, opacity: 0.8, envMapIntensity: 1 });
  const lane = new THREE.Mesh(laneGeo, laneMat); lane.receiveShadow = true; statics.add(lane);
  const sub = new THREE.Mesh(laneGeo, new THREE.MeshBasicMaterial({ color: 0x06080a, depthTest: false, depthWrite: false })); sub.renderOrder = -10; scene.add(sub);

  // gutters, lane edges, kickbacks, pit, curtain
  const dark = (hex, rough = 0.6) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 });
  const box = (w, h, d, x, y, z, mat, shadow) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.receiveShadow = !!shadow; statics.add(m); return m; };
  const zc = (geom.zNear + geom.zFar) / 2;
  for (const s of [-1, 1]) {
    box(9.25, 0.4, geom.len, s * (geom.width / 2 + 4.625), -1.9, zc, dark(0x0d0f12, 0.35), true);          // gutter floor
    box(0.5, 2.2, geom.len, s * (geom.width / 2 + 0.25), -1.1, zc, dark(0x2a1a0e, 0.5));                   // lane edge
    box(1.6, 22, 64, s * (geom.width / 2 + 9.25 + 0.8), 9, -10, dark(0x10262b, 0.45), true);               // kickback wall (teal enamel)
    box(1.9, 1.0, 64, s * (geom.width / 2 + 9.25 + 0.8), 20.4, -10, dark(0xb9a37c, 0.3));                   // cream cap rail
    box(12, 3.2, geom.len, s * (geom.width / 2 + 9.25 + 6), -0.4, zc, dark(0x1c120c, 0.4));                 // division capping
  }
  box(70, 6, 30, 0, -5.2, geom.zFar - 15, dark(0x050607, 0.9));                                             // pit floor
  box(70, 60, 1, 0, 20, geom.zFar - 22, dark(0x0a1418, 0.95));                                              // pit curtain

  // light pools under lit pins
  const poolTex = poolTexture(), pools = [];
  for (const p of pins) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(8.2, 40), new THREE.MeshBasicMaterial({ map: poolTex, color: 0xffd9a6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.04, p.z + 1.2); m.renderOrder = 2; statics.add(m); pools.push(m);
  }

  // pins
  const pg = pinGeometry(), meshes = [];
  for (const p of pins) {
    const tex = pinTexture(p.label, p.band);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.26, metalness: 0, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0, envMapIntensity: 1 });
    const m = new THREE.Mesh(pg, mat); m.position.set(p.x, 0, p.z);
    m.rotation.y = Math.PI + Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
    m.castShadow = true; world.add(m); meshes.push(m);
  }

  // lights
  const hemi = new THREE.HemisphereLight(0x9fb6d6, 0x24160a, 0.5); hemi.position.set(0, 1, 0); world.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dd, 1.5); key.position.set(-34, 78, 46); key.target.position.set(0, 0, -15); world.add(key); world.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(q('sm', 2048), q('sm', 2048)); key.shadow.radius = 5; key.shadow.bias = -0.0008; key.shadow.normalBias = 0.05;
  const sc = key.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 40; sc.bottom = -30; sc.near = 20; sc.far = 220; sc.updateProjectionMatrix();
  const spot = new THREE.SpotLight(0xffe6c2, 0, 0, 0.115, 0.85, 0); world.add(spot); world.add(spot.target);
  const fill = new THREE.DirectionalLight(0x86a8d8, 0.25); fill.position.set(40, 30, 60); fill.target.position.set(0, 4, -15); world.add(fill); world.add(fill.target);

  const DARK = new THREE.Color(0.20, 0.235, 0.31), LIT = new THREE.Color(1, 1, 1), tmpC = new THREE.Color();
  const v = new THREE.Vector3();
  /** world (inches) -> pixel in the GL canvas */
  function project(x, y, z) { v.set(x, y, z).project(camera); return { x: (v.x * 0.5 + 0.5) * W, y: (1 - (v.y * 0.5 + 0.5)) * H }; }

  /**
   * state: { lit: number[10] 0..1, spot: {x, z, k}, house: 0..1 }
   */
  function render(state) {
    for (let i = 0; i < pins.length; i++) {
      const l = clamp(state.lit[i]);
      tmpC.copy(DARK).lerp(LIT, l); meshes[i].material.color.copy(tmpC);
      meshes[i].material.emissiveIntensity = 0.02 + 0.2 * l;
      pools[i].material.opacity = 0.34 * l;
    }
    key.intensity = lerp(0.85, 1.55, state.house);
    hemi.intensity = lerp(0.42, 0.6, state.house);
    spot.intensity = 5.5 * state.spot.k;
    spot.position.set(state.spot.x - 4, 86, state.spot.z + 30); spot.target.position.set(state.spot.x, 5, state.spot.z);
    // pass 1 — reflection: mirror pins + lights below the lane
    renderer.clear();
    if (q('mir', 1)) {
    statics.visible = false; sub.visible = true; world.scale.y = -1;
    renderer.render(scene, camera);
    }
    // pass 2 — the real scene over it (lane is 80% opaque, so 20% of the mirror image shows through)
    renderer.clearDepth();
    statics.visible = true; sub.visible = false; world.scale.y = 1;
    if (!q('shs', 0) || !render.done) renderer.shadowMap.needsUpdate = true;
    render.done = true;
    renderer.render(scene, camera);
  }

  return { canvas: glc, render, project, camera };
}
