/*
 * Kit — tiny shared helpers for reel samples. Classic script: defines window.Kit.
 * Everything here is deterministic (no Date.now / Math.random).
 * See reels/SPEC.md for the page contract.
 */
(function () {
  const W = 1080, H = 1920;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const invlerp = (a, b, x) => (x - a) / (b - a);
  /** progress of t through [a,b], clamped to 0..1, optionally eased */
  const seg = (t, a, b, e) => { const u = clamp((t - a) / (b - a)); return e ? e(u) : u; };
  /** 0→1→0 envelope: fade in over [a,a+fi], hold, fade out over [b-fo,b] */
  const env = (t, a, b, fi = 0.4, fo = 0.4) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
  const ease = {
    linear: (x) => x,
    smooth: (x) => x * x * (3 - 2 * x),
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    out: (x) => 1 - Math.pow(1 - x, 3),
    in: (x) => x * x * x,
    outQuint: (x) => 1 - Math.pow(1 - x, 5),
    outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    outElastic: (x) => (x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  };
  /** seeded PRNG (xorshift32) → function returning [0,1) */
  function rng(seed) { let s = (seed | 0) ^ 0x9e3779b9; if (!s) s = 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
  /** hash of integers → [0,1) */
  function hash(...n) { let h = 2166136261; for (const v of n) { h ^= (v | 0) + 0x9e3779b9; h = Math.imul(h, 16777619); h ^= h >>> 13; } return (h >>> 0) / 4294967296; }
  /** smooth 1-D value noise in [-1,1] */
  function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u); }
  /** smooth 2-D value noise in [-1,1] */
  function noise2(x, y, seed = 0) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed), c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
    return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
  }
  /** colour helpers */
  function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(c, a = 1) { const [r, g, b] = typeof c === 'string' ? hex(c) : c; return `rgba(${r | 0},${g | 0},${b | 0},${a})`; }
  function mix(c1, c2, u) { const a = typeof c1 === 'string' ? hex(c1) : c1, b = typeof c2 === 'string' ? hex(c2) : c2; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
  /** piecewise colormap: stops = [[v,'#hex'],...] sorted by v */
  function colormap(stops, v) {
    if (v <= stops[0][0]) return hex(stops[0][1]);
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], invlerp(stops[i - 1][0], stops[i][0], v));
    return hex(stops[stops.length - 1][1]);
  }

  /** canvas text: word-wrap into lines that fit maxWidth (uses current ctx.font) */
  function wrap(ctx, text, maxWidth) {
    const out = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const w of para.split(' ')) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxWidth && line) { out.push(line); line = w; } else line = test; }
      out.push(line);
    }
    return out;
  }
  /** draw wrapped text block; returns height used. opts: {maxWidth, lineHeight, align, font, color, alpha} */
  function textBlock(ctx, text, x, y, o = {}) {
    ctx.save();
    if (o.font) ctx.font = o.font;
    if (o.color) ctx.fillStyle = o.color;
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'alphabetic';
    const lines = wrap(ctx, text, o.maxWidth || 900);
    const lh = o.lineHeight || parseFloat(ctx.font) * 1.2;
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    ctx.restore();
    return lines.length * lh;
  }
  /** typewriter: substring of text revealed by progress u in [0,1] */
  const type = (text, u) => text.slice(0, Math.round(clamp(u) * text.length));
  /** reading time helper: seconds a caption of n words should stay fully visible (~3.3 words/s + 0.8s) */
  const readSecs = (text) => 0.8 + String(text).split(/\s+/).length / 3.3;

  /** create the standard full-frame canvas inside #stage (creates #stage if absent) */
  function createCanvas(opts = {}) {
    const stage = ensureStage();
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px';
    stage.appendChild(canvas);
    const ctx = canvas.getContext('2d', { alpha: false, ...opts });
    return { canvas, ctx };
  }
  function ensureStage() {
    let s = document.getElementById('stage');
    if (!s) { s = document.createElement('div'); s.id = 'stage'; document.body.appendChild(s); }
    s.style.position = 'relative'; s.style.width = W + 'px'; s.style.height = H + 'px'; s.style.overflow = 'hidden';
    return s;
  }

  /** Instagram handle watermark. opts: {color, font, align, alpha} */
  function handle(ctx, x, y, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha != null ? o.alpha : 0.85;
    ctx.font = o.font || '500 26px Inter, sans-serif';
    ctx.fillStyle = o.color || '#ffffff';
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.text || '@natebrooksendo', x, y);
    ctx.restore();
  }

  /** wait for fonts used by the sample. specs: ['700 64px "Bebas Neue"', ...] */
  async function loadFonts(specs = []) {
    await Promise.all(specs.map((s) => document.fonts.load(s, 'AaΔµ₂⁻°→').catch(() => {})));
    await document.fonts.ready;
  }

  /**
   * Boot a reel: runs REEL.setup(), loads REEL.fonts, marks ready.
   * In normal browsing (not render mode) it also scales #stage to the window and autoplays in a loop.
   * Click = pause/play, ←/→ = seek 1s, Home = restart, ?t=5 starts paused at t=5.
   */
  async function boot(REEL) {
    ensureStage();
    document.documentElement.style.background = '#000';
    document.body.style.margin = '0';
    if (REEL.fonts) await loadFonts(REEL.fonts);
    if (REEL.setup) await REEL.setup();
    await REEL.render(0);
    REEL._ready = true;
    if (window.__RENDER__) return;
    // ---- preview mode ----
    const stage = document.getElementById('stage');
    document.body.style.cssText = 'margin:0;background:#000;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center';
    const fit = () => { const s = Math.min(innerWidth / W, innerHeight / H); stage.style.transform = `scale(${s})`; stage.style.transformOrigin = 'center center'; stage.style.flex = '0 0 auto'; stage.style.margin = `${(H * s - H) / 2}px ${(W * s - W) / 2}px`; };
    fit(); addEventListener('resize', fit);
    const q = new URLSearchParams(location.search);
    let t = q.has('t') ? +q.get('t') : 0, playing = !q.has('t'), last = null;
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;bottom:0;height:4px;background:#fff8;width:0;z-index:9;pointer-events:none';
    document.body.appendChild(bar);
    addEventListener('click', () => { playing = !playing; last = null; });
    addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') t += 1; if (e.key === 'ArrowLeft') t -= 1; if (e.key === 'Home') t = 0; if (e.key === ' ') playing = !playing; t = (t + REEL.duration) % REEL.duration; });
    const loop = async (now) => {
      if (playing) { if (last != null) t = (t + (now - last) / 1000) % REEL.duration; last = now; } else last = null;
      await REEL.render(t);
      bar.style.width = (100 * t / REEL.duration) + '%';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  window.Kit = { W, H, clamp, lerp, invlerp, seg, env, ease, rng, hash, noise1, noise2, hex, rgba, mix, colormap, wrap, textBlock, type, readSecs, createCanvas, ensureStage, handle, loadFonts, boot };
})();
