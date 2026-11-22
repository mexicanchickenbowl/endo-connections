/*
 * 37 · sprites.js — pre-rendered "photographic" assets for the agar-plate bench:
 * agar discs, stippled lawns, glass lids, cement discs, loupe + fluorescence field, colonies, timer body, bench speckle.
 * Everything is deterministic (Kit.rng / Kit.noise2). Built once in REEL.setup().
 */
(function () {
  const { rng, noise1, noise2, clamp } = Kit;
  const TAU = Math.PI * 2, DEG = Math.PI / 180;
  const R = 390;          // lid outer radius (world px)
  const RA = 366;         // agar radius
  const SP = 860, SC = SP / 2;   // plate sprite size / centre
  const RL = 250;         // loupe inner (glass) radius
  const MS = 2 * RL + 40, MC = MS / 2; // micro-field sprite size / centre

  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

  // ---------- bench speckle tile ----------
  function benchTile() {
    const [c, g] = mk(512, 512); const r = rng(1107);
    for (let i = 0; i < 5200; i++) {
      const x = r() * 512, y = r() * 512, k = r();
      if (k < 0.62) { g.fillStyle = `rgba(255,255,255,${0.025 + 0.06 * r()})`; g.fillRect(x, y, 1, 1); }
      else if (k < 0.9) { g.fillStyle = `rgba(0,0,0,${0.2 + 0.25 * r()})`; g.fillRect(x, y, 1.5, 1.5); }
      else { g.fillStyle = `rgba(205,212,222,${0.05 + 0.08 * r()})`; g.beginPath(); g.arc(x, y, 0.8 + r() * 0.9, 0, TAU); g.fill(); }
    }
    return c;
  }

  // ---------- wax-pencil knock-out texture ----------
  function waxTile() {
    const [c, g] = mk(160, 160); const r = rng(77);
    for (let i = 0; i < 1150; i++) {
      g.fillStyle = `rgba(0,0,0,${0.12 + 0.4 * r()})`;
      const s = 0.7 + r() * 1.5; g.fillRect(r() * 160, r() * 160, s, s);
    }
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { // streaks where the wax skipped
      g.strokeStyle = `rgba(0,0,0,${0.10 + 0.16 * r()})`; g.lineWidth = 0.7 + r();
      const x = r() * 160, y = r() * 160, l = 8 + r() * 26; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y - l * 0.35); g.stroke();
    }
    return c;
  }

  // ---------- soft contact shadow of a dish ----------
  function shadow() {
    const S = 1080, [c, g] = mk(S, S), h = S / 2;
    const gr = g.createRadialGradient(h, h, 300, h, h, 530);
    gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.42, 'rgba(0,0,0,0.78)'); gr.addColorStop(0.62, 'rgba(0,0,0,0.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    return c;
  }

  // ---------- agar disc ----------
  function agar(kind, seed) {
    const [c, g] = mk(SP, SP);
    g.translate(SC, SC);
    g.save(); g.beginPath(); g.arc(0, 0, RA, 0, TAU); g.clip();
    const gr = g.createRadialGradient(-70, -90, 30, 0, 0, RA);
    const stops = kind === 'blood'
      ? [[0, '#a82626'], [0.45, '#8e1b1d'], [0.82, '#6d1215'], [1, '#3d080b']]
      : kind === 'paper' ? [[0, '#e9e7de'], [0.5, '#d8d5cb'], [0.85, '#bdb9ad'], [1, '#8f8b80']]
      : [[0, '#dfaa42'], [0.45, '#cc8f2e'], [0.82, '#ad6e1e'], [1, '#74430d']];
    for (const [p, col] of stops) gr.addColorStop(p, col);
    g.fillStyle = gr; g.fillRect(-RA, -RA, 2 * RA, 2 * RA);
    // low-frequency mottling (small canvas, smooth upscale)
    const n = 96, [mc, mg] = mk(n, n), id = mg.createImageData(n, n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = noise2(x * 0.09, y * 0.09, seed) * 0.6 + noise2(x * 0.27, y * 0.27, seed + 5) * 0.4;
      const i = (y * n + x) * 4;
      if (v > 0) { id.data[i] = 255; id.data[i + 1] = 232; id.data[i + 2] = 170; id.data[i + 3] = v * 26; }
      else { id.data[i] = 40; id.data[i + 1] = kind === 'paper' ? 36 : 10; id.data[i + 2] = kind === 'paper' ? 30 : 0; id.data[i + 3] = -v * (kind === 'paper' ? 26 : 40); }
    }
    mg.putImageData(id, 0, 0); g.imageSmoothingQuality = 'high'; g.drawImage(mc, -RA, -RA, 2 * RA, 2 * RA);
    // wet gloss from the overhead light
    const hl = g.createRadialGradient(-120, -150, 0, -120, -150, 300);
    hl.addColorStop(0, kind === 'paper' ? 'rgba(255,255,255,0.16)' : 'rgba(255,240,205,0.20)'); hl.addColorStop(1, 'rgba(255,240,205,0)');
    g.fillStyle = hl; g.fillRect(-RA, -RA, 2 * RA, 2 * RA);
    g.restore();
    // meniscus where the agar climbs the wall
    g.lineWidth = 7; g.strokeStyle = kind === 'blood' ? 'rgba(30,2,4,0.6)' : kind === 'paper' ? 'rgba(30,28,22,0.5)' : 'rgba(52,26,2,0.55)';
    g.beginPath(); g.arc(0, 0, RA - 3, 0, TAU); g.stroke();
    g.lineWidth = 1.6; g.strokeStyle = kind === 'blood' ? 'rgba(255,170,160,0.22)' : kind === 'paper' ? 'rgba(255,255,255,0.3)' : 'rgba(255,228,165,0.3)';
    g.beginPath(); g.arc(0, 0, RA - 9, -2.9, -1.0); g.stroke();
    g.beginPath(); g.arc(0, 0, RA - 9, 0.3, 1.3); g.stroke();
    return c;
  }

  // ---------- bacterial lawn: matte film + swab streaks + fine stipple ----------
  function lawn(seed) {
    const [c, g] = mk(SP, SP), r = rng(seed);
    g.translate(SC, SC);
    g.beginPath(); g.arc(0, 0, RA - 5, 0, TAU); g.clip();
    g.fillStyle = 'rgba(243,232,198,0.30)'; g.fillRect(-RA, -RA, 2 * RA, 2 * RA);
    g.lineCap = 'round';
    for (let d = 0; d < 3; d++) { // three-direction swab pattern
      g.save(); g.rotate(0.35 + d * 60 * DEG + (r() - 0.5) * 0.1);
      for (let y = -RA; y < RA; y += 6 + r() * 7) {
        g.strokeStyle = `rgba(248,238,205,${0.025 + 0.07 * r()})`; g.lineWidth = 4 + r() * 8;
        const ph = r() * 6, am = 2 + r() * 5;
        g.beginPath();
        for (let x = -RA; x <= RA; x += 30) { const yy = y + am * Math.sin(x * 0.012 + ph); if (x === -RA) g.moveTo(x, yy); else g.lineTo(x, yy); }
        g.stroke();
      }
      g.restore();
    }
    for (let i = 0; i < 34000; i++) {
      const a = r() * TAU, rr = Math.sqrt(r()) * (RA - 5), x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      const s = 0.8 + r() * r() * 2.6;
      g.fillStyle = `rgba(252,245,220,${0.16 + 0.5 * r()})`;
      if (s > 2) { g.beginPath(); g.arc(x, y, s * 0.55, 0, TAU); g.fill(); } else g.fillRect(x, y, s, s);
    }
    for (let i = 0; i < 9000; i++) {
      const a = r() * TAU, rr = Math.sqrt(r()) * (RA - 5);
      g.fillStyle = `rgba(110,62,8,${0.10 + 0.16 * r()})`; g.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, 1.2, 1.2);
    }
    return c;
  }

  // ---------- glass: base wall, lid wall, stacking ridge, soft-box reflections ----------
  function glass(divided) {
    const [c, g] = mk(SP, SP);
    g.translate(SC, SC);
    // glass thickness band
    g.beginPath(); g.arc(0, 0, R - 1, 0, TAU); g.arc(0, 0, RA + 1, 0, TAU, true);
    const band = g.createRadialGradient(0, 0, RA, 0, 0, R);
    band.addColorStop(0, 'rgba(10,14,16,0.5)'); band.addColorStop(0.5, 'rgba(150,180,190,0.26)'); band.addColorStop(1, 'rgba(20,26,30,0.45)');
    g.fillStyle = band; g.fill('evenodd');
    const conic = (a0, hi, lo) => {
      const cg = g.createConicGradient(a0, 0, 0);
      const st = [[0, hi], [0.07, hi * 0.6], [0.2, lo], [0.4, lo * 0.7], [0.5, hi * 0.5], [0.6, lo * 0.7], [0.8, lo], [0.93, hi * 0.6], [1, hi]];
      for (const [p, a] of st) cg.addColorStop(p, `rgba(255,255,255,${a})`);
      return cg;
    };
    g.lineWidth = 3.4; g.strokeStyle = conic(-135 * DEG, 0.95, 0.2); g.beginPath(); g.arc(0, 0, R - 2, 0, TAU); g.stroke();
    g.lineWidth = 1.2; g.strokeStyle = conic(-120 * DEG, 0.35, 0.06); g.beginPath(); g.arc(0, 0, R - 8, 0, TAU); g.stroke();
    g.lineWidth = 2.4; g.strokeStyle = conic(-150 * DEG, 0.7, 0.12); g.beginPath(); g.arc(0, 0, RA + 4, 0, TAU); g.stroke();
    g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.arc(0, 0, RA + 1, 0, TAU); g.stroke();
    // everything below is on the lid's top face
    g.save(); g.beginPath(); g.arc(0, 0, R - 6, 0, TAU); g.clip();
    // stacking ridge
    g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.055)'; g.beginPath(); g.arc(0, 0, 334, 0, TAU); g.stroke();
    g.lineWidth = 1.8; g.strokeStyle = 'rgba(255,255,255,0.34)'; g.beginPath(); g.arc(0, 0, 335, -160 * DEG, -100 * DEG); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.arc(0, 0, 333, 18 * DEG, 62 * DEG); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.20)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 331, -160 * DEG, -100 * DEG); g.stroke();
    // soft-box reflection (two panes) — blurred
    g.filter = 'blur(13px)';
    g.save(); g.translate(-152, -188); g.rotate(-39 * DEG);
    const sb = g.createLinearGradient(0, -60, 0, 60); sb.addColorStop(0, 'rgba(255,255,255,0.30)'); sb.addColorStop(1, 'rgba(255,255,255,0.10)');
    g.fillStyle = sb; g.fillRect(-170, -56, 162, 112); g.fillRect(4, -56, 166, 112);
    g.restore();
    g.save(); g.translate(-232, -62); g.rotate(-64 * DEG);
    g.fillStyle = 'rgba(255,255,255,0.11)'; g.fillRect(-70, -26, 140, 52);
    g.restore();
    g.filter = 'blur(9px)';
    g.lineWidth = 18; g.strokeStyle = 'rgba(255,255,255,0.13)'; g.beginPath(); g.arc(0, 0, 350, 20 * DEG, 68 * DEG); g.stroke();
    g.filter = 'blur(3px)';
    g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.72)'; g.beginPath(); g.arc(0, 0, R - 13, -160 * DEG, -110 * DEG); g.stroke();
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.arc(0, 0, R - 13, 24 * DEG, 58 * DEG); g.stroke();
    // crisp window reflections curving with the lid
    g.filter = 'blur(2.5px)';
    const cres = (r1, r2, a1, a2, al) => {
      const gr = g.createRadialGradient(0, 0, r2, 0, 0, r1); gr.addColorStop(0, `rgba(255,255,255,${al * 0.2})`); gr.addColorStop(1, `rgba(255,255,255,${al})`);
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r1, a1, a2); g.arc(0, 0, r2, a2, a1, true); g.closePath(); g.fill();
    };
    cres(322, 270, -154 * DEG, -119 * DEG, 0.36);
    cres(322, 270, -115.5 * DEG, -104 * DEG, 0.24);
    cres(320, 292, 28 * DEG, 50 * DEG, 0.13);
    g.filter = 'none';
    g.restore();
    // sparkle on the rim
    const sp = g.createRadialGradient(-274, -274, 0, -274, -274, 15);
    sp.addColorStop(0, 'rgba(255,255,255,0.95)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sp; g.fillRect(-292, -292, 36, 36);
    return c;
  }

  // ---------- cement disc (fresh = wet sheen, set = matte with hairlines) ----------
  function cement(fresh) {
    const S = 240, [c, g] = mk(S, S), r = rng(fresh ? 31 : 32);
    g.translate(S / 2, S / 2);
    const sh = g.createRadialGradient(6, 10, 50, 6, 10, 104);
    sh.addColorStop(0, 'rgba(0,0,0,0.6)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(-120, -120, 240, 240);
    const path = () => { g.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU; const rr = 72 + 2.2 * noise1(i / 120 * 9, 5) + 1.2 * noise1(i / 120 * 23, 6); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (!i) g.moveTo(x, y); else g.lineTo(x, y); } g.closePath(); };
    if (fresh) { g.lineWidth = 9; g.strokeStyle = 'rgba(96,52,6,0.30)'; path(); g.stroke(); } // moisture bleeding into the agar
    path(); g.save(); g.clip();
    const gr = g.createRadialGradient(-22, -26, 4, 0, 0, 76);
    if (fresh) { gr.addColorStop(0, '#fdfcf8'); gr.addColorStop(0.55, '#e9e5da'); gr.addColorStop(1, '#bcb6a8'); }
    else { gr.addColorStop(0, '#f1eee7'); gr.addColorStop(0.6, '#dedacf'); gr.addColorStop(1, '#b5afa1'); }
    g.fillStyle = gr; g.fillRect(-80, -80, 160, 160);
    for (let i = 0; i < 1300; i++) {
      const a = r() * TAU, rr = Math.sqrt(r()) * 74;
      g.fillStyle = r() < 0.55 ? `rgba(88,82,70,${0.06 + 0.16 * r()})` : `rgba(255,255,255,${0.2 + 0.4 * r()})`;
      const s = 0.8 + r() * 1.6; g.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, s, s);
    }
    if (!fresh) {
      g.strokeStyle = 'rgba(90,84,72,0.34)'; g.lineWidth = 1; g.lineJoin = 'round';
      for (let k = 0; k < 4; k++) { let x = (r() - 0.5) * 70, y = (r() - 0.5) * 70, a = r() * TAU; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { a += (r() - 0.5) * 1.2; x += Math.cos(a) * 11; y += Math.sin(a) * 11; g.lineTo(x, y); } g.stroke(); }
    } else {
      g.filter = 'blur(5px)'; g.fillStyle = 'rgba(255,255,255,0.85)';
      g.save(); g.translate(-26, -30); g.rotate(-38 * DEG); g.beginPath(); g.ellipse(0, 0, 27, 11, 0, 0, TAU); g.fill(); g.restore();
      g.filter = 'blur(2px)'; g.beginPath(); g.arc(-43, -6, 4.5, 0, TAU); g.fill(); g.beginPath(); g.arc(8, -48, 3, 0, TAU); g.fill();
      g.filter = 'none';
    }
    g.restore();
    g.lineWidth = 2; g.strokeStyle = 'rgba(70,64,54,0.55)'; path(); g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(0, 0, 68, -150 * DEG, -70 * DEG); g.stroke();
    return c;
  }

  // ---------- root slice (dentin ring, sealer + gutta-percha in the canal) on filter paper ----------
  function rootSlice() {
    const S = 260, [c, g] = mk(S, S);
    g.translate(S / 2, S / 2);
    // slice shadow + body
    const sh = g.createRadialGradient(7, 11, 60, 7, 11, 118); sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(-130, -130, 260, 260);
    const body = () => { g.beginPath(); g.ellipse(0, 0, 84, 75, -0.3, 0, TAU); };
    body(); g.save(); g.clip();
    const dg = g.createRadialGradient(-20, -24, 10, 0, 0, 96); dg.addColorStop(0, '#f3e8c9'); dg.addColorStop(0.7, '#dccb9d'); dg.addColorStop(1, '#b59f6c');
    g.fillStyle = dg; g.fillRect(-100, -100, 200, 200);
    g.strokeStyle = 'rgba(120,96,48,0.22)'; g.lineWidth = 0.8;
    for (let i = 0; i < 90; i++) { const a = i / 90 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); g.lineTo(Math.cos(a + 0.05) * 86, Math.sin(a + 0.05) * 86); g.stroke(); }
    g.restore();
    g.lineWidth = 3; g.strokeStyle = 'rgba(128,100,52,0.75)'; body(); g.stroke();
    // canal: sealer + gutta-percha core
    g.fillStyle = '#f7f5ee'; g.beginPath(); g.arc(0, 0, 27, 0, TAU); g.fill();
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(90,84,70,0.6)'; g.stroke();
    const gp = g.createRadialGradient(-4, -5, 2, 0, 0, 16); gp.addColorStop(0, '#f1a48f'); gp.addColorStop(1, '#c9654f');
    g.fillStyle = gp; g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.fill();
    return c;
  }

  // tubule centre-line inside the loupe field
  const NT = 9;
  function tubY(k, x) { return -220 + k * 55 + 12 * Math.sin(x * 0.0105 + k * 1.3) + 5 * Math.sin(x * 0.031 + k * 2.1); }
  const SEALX = -150; // sealer / dentin interface

  // ---------- fluorescence-style field: sealer strip + dentin with tubules ----------
  function micro() {
    const [c, g] = mk(MS, MS), r = rng(909);
    g.translate(MC, MC);
    g.beginPath(); g.arc(0, 0, RL + 2, 0, TAU); g.clip();
    g.fillStyle = '#07120d'; g.fillRect(-MC, -MC, MS, MS);
    // dentin autofluorescence mottling
    for (let i = 0; i < 900; i++) {
      const x = SEALX + r() * (RL - SEALX), y = (r() - 0.5) * 2 * RL;
      g.fillStyle = `rgba(74,120,86,${0.03 + 0.05 * r()})`; g.beginPath(); g.arc(x, y, 6 + r() * 22, 0, TAU); g.fill();
    }
    g.lineCap = 'butt'; g.lineJoin = 'round';
    const tub = (k) => { g.beginPath(); for (let x = SEALX - 6; x <= RL + 10; x += 8) { const y = tubY(k, x); if (x === SEALX - 6) g.moveTo(x, y); else g.lineTo(x, y); } };
    for (let k = 0; k < NT; k++) { g.strokeStyle = 'rgba(120,176,132,0.20)'; g.lineWidth = 27; tub(k); g.stroke(); }
    for (let k = 0; k < NT; k++) { g.strokeStyle = 'rgba(150,205,160,0.16)'; g.lineWidth = 21; tub(k); g.stroke(); g.strokeStyle = '#020705'; g.lineWidth = 17; tub(k); g.stroke(); }
    // sealer mass
    const sg = g.createLinearGradient(-RL, 0, SEALX, 0); sg.addColorStop(0, '#2a343a'); sg.addColorStop(1, '#5d6b73');
    g.fillStyle = sg;
    g.beginPath(); g.moveTo(-RL - 10, -RL - 10);
    for (let y = -RL - 10; y <= RL + 10; y += 8) g.lineTo(SEALX + 4 * noise1(y * 0.06, 3) + 2 * noise1(y * 0.2, 4), y);
    g.lineTo(-RL - 10, RL + 10); g.closePath(); g.fill();
    g.save(); g.clip();
    for (let i = 0; i < 1500; i++) { g.fillStyle = r() < 0.6 ? `rgba(190,210,220,${0.08 + 0.3 * r()})` : `rgba(10,14,16,${0.2 + 0.3 * r()})`; const s = 1 + r() * 3; g.fillRect(-RL + r() * (SEALX + RL), (r() - 0.5) * 2 * RL, s, s); }
    g.restore();
    g.strokeStyle = 'rgba(214,232,238,0.5)'; g.lineWidth = 2;
    g.beginPath(); for (let y = -RL - 10; y <= RL + 10; y += 8) { const x = SEALX + 4 * noise1(y * 0.06, 3) + 2 * noise1(y * 0.2, 4); if (y === -RL - 10) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    // field vignette
    const vg = g.createRadialGradient(0, 0, RL * 0.55, 0, 0, RL + 4); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)');
    g.fillStyle = vg; g.fillRect(-MC, -MC, MS, MS);
    return c;
  }

  // cocci in pairs / short chains inside the tubules
  function bacteria() {
    const r = rng(2025), out = [];
    for (let k = 0; k < NT; k++) {
      let x = SEALX + 22 + r() * 16;
      while (x < RL - 6) {
        const n = 1 + Math.floor(r() * 2.6), off = (r() - 0.5) * 5;
        for (let j = 0; j < n; j++) {
          const xx = x + j * 11.5, yy = tubY(k, xx) + off + (r() - 0.5) * 2;
          if (xx * xx + yy * yy < (RL - 14) * (RL - 14)) out.push({ x: xx, y: yy, h: 0 });
        }
        x += n * 11.5 + 12 + r() * 30;
      }
    }
    // shuffled death order — deliberately independent of distance from the sealer (no depth gradient is claimed)
    const order = out.map((_, i) => i); const r2 = rng(88);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.forEach((idx, rank) => { out[idx].h = (rank + 0.5) / order.length; });
    return out;
  }

  function glow(core, col) {
    const S = 34, [c, g] = mk(S, S), gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, core); gr.addColorStop(0.28, col); gr.addColorStop(0.5, col.replace(/[\d.]+\)$/, '0.35)')); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return c;
  }

  // ---------- loupe ring (anodized metal) + its shadow ----------
  function loupe() {
    const S = 2 * RL + 120, [c, g] = mk(S, S); g.translate(S / 2, S / 2);
    const ro = RL + 24;
    const cg = g.createConicGradient(-140 * DEG, 0, 0);
    const st = [[0, '#c9cfd6'], [0.06, '#5d646c'], [0.22, '#1c1f23'], [0.4, '#30353b'], [0.5, '#8d949c'], [0.58, '#2a2e33'], [0.78, '#15171a'], [0.94, '#5d646c'], [1, '#c9cfd6']];
    for (const [p, col] of st) cg.addColorStop(p, col);
    g.beginPath(); g.arc(0, 0, ro, 0, TAU); g.arc(0, 0, RL, 0, TAU, true); g.fillStyle = cg; g.fill('evenodd');
    g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,0.75)'; g.beginPath(); g.arc(0, 0, RL + 1, 0, TAU); g.stroke();
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.arc(0, 0, ro - 1, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1; for (let i = 0; i < 90; i++) { const a = i / 90 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * (RL + 15), Math.sin(a) * (RL + 15)); g.lineTo(Math.cos(a) * (ro - 2), Math.sin(a) * (ro - 2)); g.stroke(); } // knurling
    // lens glare
    g.save(); g.beginPath(); g.arc(0, 0, RL, 0, TAU); g.clip(); g.filter = 'blur(20px)';
    g.translate(-110, -150); g.rotate(-36 * DEG); g.fillStyle = 'rgba(255,255,255,0.075)'; g.fillRect(-120, -34, 240, 68); g.filter = 'none'; g.restore();
    return c;
  }
  function loupeShadow() {
    const S = 2 * RL + 200, [c, g] = mk(S, S), h = S / 2;
    const gr = g.createRadialGradient(h, h, RL, h, h, RL + 90); gr.addColorStop(0, 'rgba(0,0,0,0.8)'); gr.addColorStop(0.3, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return c;
  }

  // ---------- colonies for the count plate ----------
  function colony() {
    const S = 44, [c, g] = mk(S, S), h = S / 2;
    const sh = g.createRadialGradient(h + 1.5, h + 2.5, 8, h + 1.5, h + 2.5, 20); sh.addColorStop(0, 'rgba(20,0,0,0.6)'); sh.addColorStop(1, 'rgba(20,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, 0, S, S);
    const gr = g.createRadialGradient(h - 4, h - 5, 1, h, h, 14); gr.addColorStop(0, '#fffdf2'); gr.addColorStop(0.5, '#f1e6c2'); gr.addColorStop(1, '#c2ad7b');
    g.fillStyle = gr; g.beginPath(); g.arc(h, h, 13.5, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(h - 5, h - 6, 3.4, 2, -0.6, 0, TAU); g.fill();
    return c;
  }
  function colonyGhost() {
    const S = 44, [c, g] = mk(S, S), h = S / 2;
    g.fillStyle = 'rgba(40,4,6,0.35)'; g.beginPath(); g.arc(h, h, 13, 0, TAU); g.fill();
    g.setLineDash([4, 4]); g.lineWidth = 1.6; g.strokeStyle = 'rgba(255,225,205,0.38)'; g.beginPath(); g.arc(h, h, 12.5, 0, TAU); g.stroke();
    return c;
  }
  function colonySites() {
    const r = rng(4242), out = [];
    for (let side = -1; side <= 1; side += 2) {
      const pts = []; let guard = 0;
      while (pts.length < 44 && guard++ < 6000) {
        const a = r() * TAU, rr = Math.sqrt(r()) * 326, x = Math.abs(Math.cos(a) * rr), y = Math.sin(a) * rr;
        if (x < 30) continue;
        if (pts.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 46 * 46)) continue;
        pts.push({ x, y });
      }
      // same layout mirrored on both halves: equal starting counts
      pts.forEach((p, i) => out.push({ x: side * p.x, y: p.y, s: 0.72 + r() * 0.5, h: (i + 0.5) / pts.length, side }));
    }
    // shuffle death ranks on the left half
    const left = out.filter((c) => c.side < 0), r3 = rng(9);
    const ranks = left.map((_, i) => (i + 0.5) / left.length);
    for (let i = ranks.length - 1; i > 0; i--) { const j = Math.floor(r3() * (i + 1)); [ranks[i], ranks[j]] = [ranks[j], ranks[i]]; }
    left.forEach((c, i) => { c.h = ranks[i]; });
    return out;
  }

  // ---------- bench timer body ----------
  function dial() {
    const S = 290, [c, g] = mk(S, S); g.translate(S / 2, S / 2);
    const sh = g.createRadialGradient(8, 13, 90, 8, 13, 142); sh.addColorStop(0, 'rgba(0,0,0,0.8)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(-S / 2, -S / 2, S, S);
    // push button
    g.fillStyle = '#2b2e33'; g.fillRect(-15, -128, 30, 22); g.fillStyle = '#c9342b'; g.fillRect(-19, -136, 38, 13);
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-19, -136, 38, 3);
    const cg = g.createConicGradient(-140 * DEG, 0, 0);
    const st = [[0, '#b9c0c8'], [0.08, '#555b63'], [0.25, '#1d2024'], [0.45, '#33373d'], [0.52, '#7f868e'], [0.6, '#2a2e33'], [0.8, '#15171a'], [0.94, '#555b63'], [1, '#b9c0c8']];
    for (const [p, col] of st) cg.addColorStop(p, col);
    g.fillStyle = cg; g.beginPath(); g.arc(0, 0, 112, 0, TAU); g.fill();
    g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,0.8)'; g.beginPath(); g.arc(0, 0, 100, 0, TAU); g.stroke();
    const fg = g.createRadialGradient(-28, -34, 10, 0, 0, 100); fg.addColorStop(0, '#fbfaf5'); fg.addColorStop(0.7, '#ebe8de'); fg.addColorStop(1, '#cfcbbf');
    g.fillStyle = fg; g.beginPath(); g.arc(0, 0, 98, 0, TAU); g.fill();
    // inner shadow
    const ig = g.createRadialGradient(0, 0, 84, 0, 0, 99); ig.addColorStop(0, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,0.28)');
    g.fillStyle = ig; g.beginPath(); g.arc(0, 0, 98, 0, TAU); g.fill();
    // minor ticks along the 180-degree scale
    g.strokeStyle = '#5c5f63'; g.lineWidth = 2; g.lineCap = 'butt';
    for (let i = 0; i <= 24; i++) { const a = (180 + i * 7.5) * DEG; g.beginPath(); g.moveTo(Math.cos(a) * 80, Math.sin(a) * 80); g.lineTo(Math.cos(a) * 89, Math.sin(a) * 89); g.stroke(); }
    return c;
  }
  function dialGlass() {
    const S = 290, [c, g] = mk(S, S); g.translate(S / 2, S / 2);
    g.beginPath(); g.arc(0, 0, 98, 0, TAU); g.clip(); g.filter = 'blur(10px)';
    g.translate(-40, -52); g.rotate(-38 * DEG); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-60, -13, 120, 26); g.filter = 'none';
    return c;
  }

  // ---------- grease pencil lying on the bench (decor in the lower no-read zone) ----------
  function pencil() {
    const Wd = 640, Hd = 90, [c, g] = mk(Wd, Hd);
    g.translate(20, Hd / 2);
    g.filter = 'blur(7px)'; g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(6, -6, 580, 34); g.filter = 'none';
    const bg = g.createLinearGradient(0, -17, 0, 17); bg.addColorStop(0, '#d6453a'); bg.addColorStop(0.3, '#e2574b'); bg.addColorStop(0.75, '#a82a22'); bg.addColorStop(1, '#6e1712');
    g.fillStyle = bg; g.beginPath(); g.roundRect(60, -17, 500, 34, 6); g.fill();
    g.strokeStyle = 'rgba(60,8,6,0.5)'; g.lineWidth = 1.5; for (let x = 80; x < 560; x += 26) { g.beginPath(); g.moveTo(x, -17); g.lineTo(x + 14, 17); g.stroke(); } // paper spiral
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(64, -12, 492, 4);
    g.fillStyle = '#efe9da'; g.beginPath(); g.moveTo(60, -17); g.lineTo(34, -9); g.lineTo(34, 9); g.lineTo(60, 17); g.closePath(); g.fill(); // peeled paper cone
    g.fillStyle = '#15130f'; g.beginPath(); g.moveTo(34, -9); g.lineTo(6, -3); g.quadraticCurveTo(0, 0, 6, 3); g.lineTo(34, 9); g.closePath(); g.fill(); // wax tip
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(34, -7); g.lineTo(8, -2); g.lineTo(34, -3); g.closePath(); g.fill();
    return c;
  }

  window.SPR37 = {
    R, RA, SP, SC, RL, MS, MC, NT, SEALX, tubY, mk,
    build() {
      return {
        bench: benchTile(), waxTile: waxTile(), shadow: shadow(),
        agarA: agar('amber', 3), agarB: agar('amber', 14), agarPaper: agar('paper', 21), agarBlood: agar('blood', 33),
        lawn1: lawn(101), lawn2: lawn(202),
        glass: glass(false),
        cementFresh: cement(true), cementSet: cement(false),
        root: rootSlice(), micro: micro(), bact: bacteria(),
        glowG: glow('rgba(232,255,238,1)', 'rgba(60,240,120,0.95)'), glowR: glow('rgba(255,232,226,1)', 'rgba(255,72,56,0.95)'),
        loupe: loupe(), loupeShadow: loupeShadow(),
        colony: colony(), ghost: colonyGhost(), sites: colonySites(),
        dial: dial(), dialGlass: dialGlass(), pencil: pencil(),
      };
    },
  };
})();
