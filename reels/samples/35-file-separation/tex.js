/*
 * 35 · tex.js — procedural textures and small canvas helpers (all deterministic: Kit.rng / Kit.hash only).
 * Defines window.TX. Loaded before art.js and reel.js.
 */
(function () {
  const { rng, clamp, lerp } = Kit;
  const TX = {};
  TX.SPR = 2.5;                       // sprite pixels per world pixel (cards are zoomed up to ~2.3x)

  TX.C = {
    ink: '#2b2520', inkSoft: '#4a4038',
    red: '#b3261e', redHi: '#dc5546', string: '#b0211a',
    navy: '#1f3a63', green: '#2a6a4b', black: '#16191f',
    yellow: '#f0bf2c', yellowD: '#c9961a',
    paper: '#f4efe4', cream: '#efe5cc', index: '#f6f0dd', manila: '#e2c389', manilaD: '#cfab6c', legal: '#f5e78f',
    steel: '#c5ccd3', steelD: '#55606a', steelH: '#f6f9fb',
    dentin: '#cfb48a', dentinD: '#a98a60', lumen: '#17110d',
  };

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  TX.mk = mk;

  function rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
    g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
  }
  TX.rr = rr;

  /** grey noise tile (opaque) with values in [lo,hi] */
  TX.noiseTile = function (size, seed, lo, hi) {
    const c = mk(size, size), g = c.getContext('2d'), id = g.createImageData(size, size), r = rng(seed);
    for (let i = 0; i < size * size; i++) { const v = lo + (hi - lo) * r(); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    g.putImageData(id, 0, 0); return c;
  };
  let grainTile = null, grainSoft = null;
  /** multiply-grain pattern; scale = how many canvas px one noise px should cover in the *current* transform */
  TX.grainPat = function (g, inv, soft) {
    if (!grainTile) { grainTile = TX.noiseTile(256, 11, 205, 255); grainSoft = TX.noiseTile(256, 23, 232, 255); }
    const p = g.createPattern(soft ? grainSoft : grainTile, 'repeat');
    p.setTransform(new DOMMatrix().scale(inv, inv));
    return p;
  };

  /**
   * Paper sheet with baked soft shadow, grain and aged edges. Drawn in a context already scaled by TX.SPR.
   * o: {r, shadow, sh, blur, dx, dy, edge, path(g) custom outline}
   */
  TX.paper = function (g, x, y, w, h, col, o = {}) {
    const S = o.S || TX.SPR, r = o.r == null ? 3 : o.r;
    const outline = () => { if (o.path) o.path(g); else rr(g, x, y, w, h, r); };
    g.save();
    if (o.shadow !== false) {
      g.shadowColor = `rgba(26,13,4,${o.sh == null ? 0.52 : o.sh})`; g.shadowBlur = (o.blur == null ? 9 : o.blur) * S;
      g.shadowOffsetX = (o.dx == null ? 3 : o.dx) * S; g.shadowOffsetY = (o.dy == null ? 6 : o.dy) * S;
    }
    outline(); g.fillStyle = col; g.fill();
    g.restore();
    g.save(); outline(); g.clip();
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = TX.grainPat(g, 1 / S, o.softGrain); g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.globalCompositeOperation = 'source-over';
    const e = o.edge == null ? 1 : o.edge;
    if (e > 0) {
      g.strokeStyle = `rgba(120,86,40,${0.10 * e})`; g.lineWidth = 16; outline(); g.stroke();
      g.strokeStyle = `rgba(110,76,34,${0.16 * e})`; g.lineWidth = 5; outline(); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${0.35})`; g.lineWidth = 1; outline(); g.stroke();
    }
    g.restore();
  };

  /** sprite = offscreen canvas holding a card of world size w x h plus padding for its shadow */
  TX.sprite = function (w, h, draw, o = {}) {
    const S = o.S || TX.SPR, pad = o.pad == null ? 26 : o.pad;
    const c = mk((w + 2 * pad) * S, (h + 2 * pad) * S), g = c.getContext('2d');
    g.scale(S, S); g.translate(pad, pad);
    draw(g, w, h);
    return { c, w, h, pad };
  };

  /** rubber stamp: bold condensed caps inside a rounded frame, with uneven ink */
  TX.stamp = function (text, color, o = {}) {
    const S = 3, fs = o.size || 42, ls = o.ls == null ? 2.2 : o.ls, font = `${fs}px Anton`;
    const m = mk(4, 4).getContext('2d'); m.font = font;
    let tw = 0; for (const ch of text) tw += m.measureText(ch).width + ls; tw -= ls;
    const padX = o.padX == null ? 15 : o.padX, padY = o.padY == null ? 8 : o.padY;
    const capH = fs * 0.815;
    const w = tw + padX * 2, h = capH + padY * 2;
    const M = 5;
    const c = mk((w + 2 * M) * S, (h + 2 * M) * S), g = c.getContext('2d');
    g.scale(S, S); g.translate(M, M);
    g.strokeStyle = color; g.fillStyle = color; g.lineJoin = 'round';
    g.lineWidth = o.frame == null ? 3.4 : o.frame; rr(g, 1.7, 1.7, w - 3.4, h - 3.4, 6); g.stroke();
    if (o.double) { g.lineWidth = 1.1; rr(g, 6.2, 6.2, w - 12.4, h - 12.4, 3); g.stroke(); }
    g.font = font; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    let x = padX; const by = padY + capH;
    for (const ch of text) { g.fillText(ch, x, by); x += m.measureText(ch).width + ls; }
    // uneven ink: speckles, dry streaks and a faded corner
    const r = rng(o.seed || 5);
    g.globalCompositeOperation = 'destination-out';
    const n = Math.round(w * h * 0.11);
    for (let i = 0; i < n; i++) { g.globalAlpha = 0.35 + 0.65 * r(); g.beginPath(); g.arc(r() * w, r() * h, 0.25 + r() * r() * 1.5, 0, 7); g.fill(); }
    for (let i = 0; i < 7; i++) {
      const y0 = r() * h, x0 = r() * w * 0.8, len = 20 + r() * w * 0.5; g.globalAlpha = 0.16 + 0.22 * r(); g.lineWidth = 0.6 + r() * 1.6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + len, y0 + (r() - 0.5) * 5); g.stroke();
    }
    const cx = r() < 0.5 ? w * 0.08 : w * 0.9, cy = r() < 0.5 ? h * 0.15 : h * 0.85;
    const fd = g.createRadialGradient(cx, cy, 0, cx, cy, w * 0.3); fd.addColorStop(0, 'rgba(0,0,0,0.5)'); fd.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1; g.fillStyle = fd; g.fillRect(-M, -M, w + 2 * M, h + 2 * M);
    return { c, w: w + 2 * M, h: h + 2 * M };
  };

  /** the cork board itself, with its wooden frame. World rect [x0,x0+W] x [y0,y0+H]; S px per world unit. */
  TX.cork = function (x0, y0, W, H, S) {
    const c = mk(W * S, H * S), g = c.getContext('2d');
    g.scale(S, S); g.translate(-x0, -y0);
    g.fillStyle = '#b58653'; g.fillRect(x0, y0, W, H);
    const r = rng(77);
    const pal = ['#caa06c', '#bd905a', '#aa7b49', '#d5ae7c', '#9a713f', '#c2955f', '#8c6436', '#b98a55', '#dcb988'];
    const n = Math.round(W * H / 30);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * W, y = y0 + r() * H, rad = 1.1 + r() * r() * 4.6;
      g.fillStyle = pal[(r() * pal.length) | 0]; g.globalAlpha = 0.3 + r() * 0.55;
      g.beginPath(); g.ellipse(x, y, rad, rad * (0.5 + r() * 0.5), r() * Math.PI, 0, 7); g.fill();
    }
    // dark pits between granules + pale flecks
    for (let i = 0; i < n * 0.5; i++) {
      const x = x0 + r() * W, y = y0 + r() * H;
      g.fillStyle = r() < 0.72 ? '#5b3d20' : '#ecd3a6'; g.globalAlpha = 0.25 + r() * 0.5;
      g.beginPath(); g.ellipse(x, y, 0.5 + r() * 1.5, 0.4 + r() * 0.9, r() * 3, 0, 7); g.fill();
    }
    // calm the speckle (about one third less contrast): it costs bitrate and competes with the cards
    g.globalAlpha = 0.32; g.fillStyle = '#b58653'; g.fillRect(x0, y0, W, H);
    g.globalAlpha = 1;
    // broad tonal drift
    for (let i = 0; i < 26; i++) {
      const x = x0 + r() * W, y = y0 + r() * H, rad = 120 + r() * 260, dark = r() < 0.55;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, dark ? 'rgba(70,40,12,0.13)' : 'rgba(255,226,170,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.globalCompositeOperation = 'multiply'; g.fillStyle = TX.grainPat(g, 1 / S, true); g.fillRect(x0, y0, W, H);
    g.globalCompositeOperation = 'source-over';
    // old pin holes
    for (let i = 0; i < 70; i++) {
      const x = 40 + r() * 1000, y = 40 + r() * 1840;
      g.fillStyle = 'rgba(40,22,8,0.75)'; g.beginPath(); g.arc(x, y, 1.5, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,230,180,0.35)'; g.beginPath(); g.arc(x + 0.9, y + 1.1, 1.3, 0, 7); g.fill();
    }
    // ---- wooden frame (outer edge of the world) ----
    const FW = 30;
    const wood = (fx, fy, fw, fh, horiz) => {
      g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
      const lg = horiz ? g.createLinearGradient(0, fy, 0, fy + fh) : g.createLinearGradient(fx, 0, fx + fw, 0);
      lg.addColorStop(0, '#3c2413'); lg.addColorStop(0.18, '#6a4526'); lg.addColorStop(0.5, '#59391f'); lg.addColorStop(0.85, '#4a2e18'); lg.addColorStop(1, '#2c190c');
      g.fillStyle = lg; g.fillRect(fx, fy, fw, fh);
      const m = Math.round((horiz ? fw : fh) / 3);
      for (let i = 0; i < m; i++) {
        g.strokeStyle = r() < 0.5 ? 'rgba(30,15,5,0.35)' : 'rgba(170,120,70,0.22)'; g.lineWidth = 0.4 + r() * 1.1;
        const a = r(), len = 40 + r() * 260, o = r();
        g.beginPath();
        if (horiz) { const yy = fy + a * fh, xx = fx + o * fw; g.moveTo(xx, yy); g.bezierCurveTo(xx + len * 0.3, yy + (r() - 0.5) * 3, xx + len * 0.7, yy + (r() - 0.5) * 3, xx + len, yy + (r() - 0.5) * 2); }
        else { const xx = fx + a * fw, yy = fy + o * fh; g.moveTo(xx, yy); g.bezierCurveTo(xx + (r() - 0.5) * 3, yy + len * 0.3, xx + (r() - 0.5) * 3, yy + len * 0.7, xx + (r() - 0.5) * 2, yy + len); }
        g.stroke();
      }
      g.restore();
    };
    wood(x0, y0, W, FW - y0, true); wood(x0, 1920 - FW, W, y0 + H - (1920 - FW), true);
    wood(x0, y0, FW - x0, H, false); wood(1080 - FW, y0, x0 + W - (1080 - FW), H, false);
    // mitre lines + inner bevel
    g.strokeStyle = 'rgba(20,10,3,0.55)'; g.lineWidth = 1.2;
    for (const [ax, ay, bx, by] of [[x0, y0, FW, FW], [1080 - x0, y0, 1080 - FW, FW], [x0, 1920 - y0, FW, 1920 - FW], [1080 - x0, 1920 - y0, 1080 - FW, 1920 - FW]]) { g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    g.strokeStyle = 'rgba(255,214,160,0.28)'; g.lineWidth = 1.5; g.strokeRect(FW - 1, FW - 1, 1080 - 2 * FW + 2, 1920 - 2 * FW + 2);
    // shadow the frame casts onto the cork
    const sh = (gx0, gy0, gx1, gy1, rx, ry, rw, rh) => { const q = g.createLinearGradient(gx0, gy0, gx1, gy1); q.addColorStop(0, 'rgba(30,14,3,0.55)'); q.addColorStop(1, 'rgba(30,14,3,0)'); g.fillStyle = q; g.fillRect(rx, ry, rw, rh); };
    sh(0, FW, 0, FW + 30, FW, FW, 1080 - 2 * FW, 30); sh(FW, 0, FW + 22, 0, FW, FW, 22, 1920 - 2 * FW);
    sh(1080 - FW, 0, 1080 - FW - 12, 0, 1080 - FW - 12, FW, 12, 1920 - 2 * FW); sh(0, 1920 - FW, 0, 1920 - FW - 10, FW, 1920 - FW - 10, 1080 - 2 * FW, 10);
    return c;
  };

  window.TX = TX;
})();
