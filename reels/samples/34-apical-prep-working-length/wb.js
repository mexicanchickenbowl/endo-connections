/*
 * wb.js — tiny "whiteboard marker" engine for reel 34.
 * rough.js (vendored, seeded -> deterministic) supplies the hand-drawn wobble; everything is flattened to polylines
 * so strokes can be drawn on progressively. Text is written on glyph by glyph. Paper slips, magnets, tape and the
 * felt eraser are small canvas props. No clocks, no Math.random.
 */
(function () {
  const { clamp, lerp, ease, hash, noise1 } = Kit;
  const INK = { k: '#1d1f25', r: '#d1263b', b: '#1a55b5', g: '#12934d', s: '#5d6772' };
  const FONT = { pm: '"Permanent Marker"', ph: '"Patrick Hand"' };
  const gen = rough.generator();
  let seedN = 101;
  const ro = (o) => Object.assign({ roughness: 1, bowing: 1, disableMultiStroke: true, seed: (seedN += 13) }, o || {});

  // ---------- polylines ----------
  function mkPolys(list) {
    const out = { list: [], total: 0 };
    for (const p of list) {
      if (p.length < 4) continue;
      const cum = new Float32Array(p.length / 2); let L = 0;
      for (let i = 2; i < p.length; i += 2) { L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); cum[i / 2] = L; }
      out.list.push({ p, cum, len: L }); out.total += L;
    }
    return out;
  }
  function flatten(d, type) {
    const list = []; const want = type || 'path';
    for (const set of d.sets) {
      if (set.type !== want) continue;
      let cur = null, x = 0, y = 0;
      for (const op of set.ops) {
        const a = op.data;
        if (op.op === 'move') { cur = [a[0], a[1]]; list.push(cur); x = a[0]; y = a[1]; }
        else if (op.op === 'lineTo') { cur.push(a[0], a[1]); x = a[0]; y = a[1]; }
        else if (op.op === 'bcurveTo') {
          const n = Math.max(3, Math.ceil((Math.hypot(a[0] - x, a[1] - y) + Math.hypot(a[2] - a[0], a[3] - a[1]) + Math.hypot(a[4] - a[2], a[5] - a[3])) / 7));
          for (let i = 1; i <= n; i++) {
            const u = i / n, v = 1 - u;
            cur.push(v * v * v * x + 3 * v * v * u * a[0] + 3 * v * u * u * a[2] + u * u * u * a[4], v * v * v * y + 3 * v * v * u * a[1] + 3 * v * u * u * a[3] + u * u * u * a[5]);
          }
          x = a[4]; y = a[5];
        }
      }
    }
    return mkPolys(list);
  }
  const join = (...ps) => { const out = { list: [], total: 0 }; for (const p of ps) { out.list.push(...p.list); out.total += p.total; } return out; };
  /** trace the first fraction u (by length) of a polyline set into the current path */
  function trace(g, P, u) {
    let remain = u >= 1 ? Infinity : u * P.total;
    g.beginPath();
    for (const q of P.list) {
      if (remain <= 0) break;
      const p = q.p;
      g.moveTo(p[0], p[1]);
      if (remain >= q.len) { for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); }
      else {
        let i = 2;
        for (; i < p.length && q.cum[i / 2] <= remain; i += 2) g.lineTo(p[i], p[i + 1]);
        if (i < p.length) { const c0 = q.cum[i / 2 - 1], c1 = q.cum[i / 2], f = (remain - c0) / (c1 - c0 || 1); g.lineTo(lerp(p[i - 2], p[i], f), lerp(p[i - 1], p[i + 1], f)); }
      }
      remain -= q.len;
    }
  }

  // ---------- shapes (rough.js) ----------
  const S = {
    line: (x1, y1, x2, y2, o) => flatten(gen.line(x1, y1, x2, y2, ro(o))),
    curve: (pts, o) => flatten(gen.curve(pts, ro(o))),
    path: (pts, o) => flatten(gen.linearPath(pts, ro(o))),
    ellipse: (cx, cy, w, h, o) => flatten(gen.ellipse(cx, cy, w, h, ro(o))),
    rect: (x, y, w, h, o) => flatten(gen.rectangle(x, y, w, h, ro(o))),
    hatch: (pts, o) => flatten(gen.polygon(pts, ro(Object.assign({ fill: '#000', stroke: 'none', hachureGap: 20, hachureAngle: -41, fillWeight: 3 }, o))), 'fillSketch'),
    raw: (list) => mkPolys(list),
    join,
    /** straight arrow with a two-stroke head */
    arrow(x1, y1, x2, y2, o = {}) {
      const h = o.head || 22, a = Math.atan2(y2 - y1, x2 - x1), sp = o.spread || 0.5;
      return join(S.line(x1, y1, x2, y2, o), S.line(x2, y2, x2 - h * Math.cos(a - sp), y2 - h * Math.sin(a - sp), { roughness: 0.5 }), S.line(x2, y2, x2 - h * Math.cos(a + sp), y2 - h * Math.sin(a + sp), { roughness: 0.5 }));
    },
    /** curved arrow through points, head follows the last segment */
    carrow(pts, o = {}) {
      const n = pts.length, h = o.head || 22, sp = o.spread || 0.5;
      const [x2, y2] = pts[n - 1], [x1, y1] = pts[n - 2], a = Math.atan2(y2 - y1, x2 - x1);
      return join(S.curve(pts, o), S.line(x2, y2, x2 - h * Math.cos(a - sp), y2 - h * Math.sin(a - sp), { roughness: 0.5 }), S.line(x2, y2, x2 - h * Math.cos(a + sp), y2 - h * Math.sin(a + sp), { roughness: 0.5 }));
    },
  };

  // ---------- text ----------
  const layCache = new Map();
  const mctx = document.createElement('canvas').getContext('2d');
  const proxy = (s) => s.replace(/≥/g, '>').replace(/→/g, '—');
  function layout(str, f, s) {
    const key = f + s + '|' + str; let L = layCache.get(key);
    if (!L) {
      // per-glyph advances (no kerning / ligatures: every glyph is drawn on its own, like hand lettering)
      mctx.font = `400 ${s}px ${FONT[f]}`; const px = proxy(str); const xs = [0];
      for (let i = 0; i < px.length; i++) xs.push(xs[i] + mctx.measureText(px[i]).width);
      L = { xs, w: xs[px.length] }; layCache.set(key, L);
    }
    return L;
  }
  const textWidth = (str, f, s) => layout(str, f, s).w;
  /** draw (part of) a hand-written line. it: {str,x,y,f,s,c,align,rot,jit}. u = written fraction 0..1 */
  function drawText(g, it, u) {
    if (u <= 0) return;
    const { str, f, s } = it, L = layout(str, f, s), n = str.length;
    const ox = it.align === 'center' ? -L.w / 2 : it.align === 'right' ? -L.w : 0;
    const col = INK[it.c] || it.c, jit = it.jit == null ? (f === 'pm' ? 0.012 : 0.022) : it.jit, sd = it.seed || (str.length * 7 + (it.x | 0));
    g.save(); g.translate(it.x, it.y); if (it.rot) g.rotate(it.rot);
    g.font = `400 ${s}px ${FONT[f]}`; g.fillStyle = col; g.strokeStyle = col; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.lineJoin = 'round'; g.lineCap = 'round';
    const bold = it.bold == null ? (f === 'ph' ? 0.032 : 0) : it.bold;
    const prog = u >= 1 ? n : u * n;
    for (let i = 0; i < n; i++) {
      const fr = clamp(prog - i); if (fr <= 0) break;
      const ch = str[i]; if (ch === ' ') continue;
      const x = ox + L.xs[i], adv = L.xs[i + 1] - L.xs[i], dy = (hash(i, sd) - 0.5) * 2 * s * jit;
      if (fr < 1) { g.save(); g.beginPath(); g.rect(x - 3, -s * 1.15, (adv + 6) * fr, s * 1.7); g.clip(); }
      if (ch === '≥') {
        g.fillText('>', x, dy - s * 0.09);
        g.lineWidth = s * (f === 'pm' ? 0.115 : 0.075); g.beginPath(); g.moveTo(x + adv * 0.1, dy - s * 0.015); g.lineTo(x + adv * 0.9, dy - s * 0.05); g.stroke();
      } else if (ch === '→') {
        const yy = dy - s * 0.3, hx = x + adv * 0.94, hs = s * 0.2;
        g.lineWidth = s * (f === 'pm' ? 0.11 : 0.07); g.beginPath(); g.moveTo(x + adv * 0.08, yy + s * 0.01); g.lineTo(hx, yy); g.moveTo(hx - hs, yy - hs * 0.8); g.lineTo(hx, yy); g.lineTo(hx - hs, yy + hs * 0.8); g.stroke();
      } else {
        g.fillText(ch, x, dy);
        if (bold) { g.lineWidth = s * bold; g.strokeText(ch, x, dy); }
      }
      if (fr < 1) g.restore();
    }
    g.restore();
  }

  // ---------- scene = ordered list of ink items ----------
  class Scene {
    constructor() { this.items = []; }
    stroke(P, o) { this.items.push(Object.assign({ kind: 's', P, c: 'k', w: 7, t0: 0, d: 0.5, a: 1, e: ease.inOut }, o)); return this; }
    text(str, x, y, o) {
      const it = Object.assign({ kind: 't', str, x, y, f: 'ph', s: 38, c: 'k', t0: 0, align: 'left', rot: 0, a: 1 }, o);
      if (it.d == null) it.d = clamp(str.length * 0.032, 0.25, 0.85);
      this.items.push(it); return this;
    }
    dot(x, y, r, o) { this.items.push(Object.assign({ kind: 'd', x, y, r, c: 'k', t0: 0, a: 1 }, o)); return this; }
    fn(fn) { this.items.push({ kind: 'f', fn }); return this; }
    draw(g, t) {
      for (const it of this.items) {
        if (it.kind === 'f') { it.fn(g, t); continue; }
        if (t <= it.t0) continue;
        g.save(); g.globalAlpha = it.a;
        if (it.kind === 's') {
          const u = it.e(clamp((t - it.t0) / it.d));
          g.strokeStyle = INK[it.c] || it.c; g.lineWidth = it.w; g.lineCap = 'round'; g.lineJoin = 'round';
          if (it.dash) g.setLineDash(it.dash);
          trace(g, it.P, u); g.stroke();
        } else if (it.kind === 't') {
          drawText(g, it, clamp((t - it.t0) / it.d));
        } else if (it.kind === 'd') {
          const u = ease.outBack(clamp((t - it.t0) / 0.16));
          g.fillStyle = INK[it.c] || it.c; g.beginPath(); g.arc(it.x, it.y, it.r * u, 0, 7); g.fill();
        }
        g.restore();
      }
    }
  }

  // ---------- props ----------
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  /** a cut paper slip centred on the origin (call inside a transform). lift 0..1 = how far it floats off the board */
  function paper(g, w, h, o = {}) {
    const col = o.color || '#fbf8ee', top = o.top || '#fffefa', lift = o.lift == null ? 0.25 : o.lift, sd = o.seed || 1;
    const j = (i) => (hash(i, sd) - 0.5) * 6;
    const pts = [[-w / 2 + j(1), -h / 2 + j(2)], [w / 2 + j(3), -h / 2 + j(4)], [w / 2 + j(5), h / 2 + j(6)], [-w / 2 + j(7), h / 2 + j(8)]];
    const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < 4; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    g.save(); g.shadowColor = `rgba(25,35,50,${0.26 + 0.1 * lift})`; g.shadowBlur = 8 + 26 * lift; g.shadowOffsetX = 2 + 7 * lift; g.shadowOffsetY = 3 + 16 * lift; g.fillStyle = col; path(); g.fill(); g.restore();
    const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); gr.addColorStop(0, top); gr.addColorStop(1, col); g.fillStyle = gr; path(); g.fill();
    g.strokeStyle = 'rgba(70,80,90,0.16)'; g.lineWidth = 1; path(); g.stroke();
    if (o.curl) { // lifted bottom-right corner
      const c = o.curl, x = pts[2][0], y = pts[2][1];
      g.fillStyle = 'rgba(40,50,60,0.10)'; g.beginPath(); g.moveTo(x - c * 1.25, y); g.lineTo(x, y - c * 1.25); g.lineTo(x - c * 0.2, y - c * 0.2); g.closePath(); g.fill();
      g.fillStyle = top; g.beginPath(); g.moveTo(x - c, y); g.lineTo(x, y - c); g.lineTo(x - c * 0.86, y - c * 0.86); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(70,80,90,0.2)'; g.stroke();
    }
  }
  const MAG = { g: ['#3fd083', '#0d8443'], r: ['#f4687a', '#b41a2f'], b: ['#5b9bf7', '#14449c'], y: ['#ffe066', '#cf9800'], k: ['#6a737e', '#1b1f25'] };
  function magnet(g, x, y, r, c, pop = 1) {
    if (pop <= 0.01) return;
    const [hi, lo] = MAG[c];
    g.save(); g.translate(x, y); g.scale(pop, pop);
    g.save(); g.shadowColor = 'rgba(15,20,30,0.5)'; g.shadowBlur = 9; g.shadowOffsetX = 2; g.shadowOffsetY = 5; g.fillStyle = lo; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore();
    const gr = g.createRadialGradient(-r * 0.3, -r * 0.38, r * 0.08, 0, 0, r * 1.05); gr.addColorStop(0, hi); gr.addColorStop(1, lo); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, r * 0.64, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, r - 0.8, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.78)'; g.beginPath(); g.ellipse(-r * 0.32, -r * 0.4, r * 0.27, r * 0.14, -0.6, 0, 7); g.fill();
    g.restore();
  }
  /** masking-tape label */
  function tape(g, x, y, w, h, rot, str) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.save(); g.shadowColor = 'rgba(25,35,50,0.22)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
    g.fillStyle = 'rgba(238,226,190,0.94)'; g.beginPath(); g.moveTo(-w / 2, -h / 2);
    g.lineTo(w / 2, -h / 2); for (let i = 1; i <= 6; i++) g.lineTo(w / 2 + (i % 2 ? -5 : 1), -h / 2 + (h * i) / 6);
    g.lineTo(-w / 2, h / 2); for (let i = 5; i >= 0; i--) g.lineTo(-w / 2 + (i % 2 ? 5 : -1), -h / 2 + (h * i) / 6);
    g.closePath(); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-w / 2 + 6, -h / 2 + 2, w - 12, h * 0.3);
    g.font = `400 28px ${FONT.ph}`; g.fillStyle = '#3c4654'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, 0, 1);
    g.restore();
  }
  /** felt board eraser. flip 0 = lying on the tray (side view), 1 = pressed on the board (seen from its back) */
  function eraser(g, x, y, rot, flip, alpha = 1) {
    const L = 320, hh = lerp(54, 118, flip);
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= alpha;
    g.save(); g.shadowColor = 'rgba(15,20,30,0.38)'; g.shadowBlur = 12; g.shadowOffsetX = 3; g.shadowOffsetY = lerp(3, 8, flip); rr(g, -L / 2, -hh / 2, L, hh, 12); g.fillStyle = '#30353b'; g.fill(); g.restore();
    // felt
    rr(g, -L / 2, -hh / 2, L, hh, 12); g.fillStyle = '#3b4047'; g.fill();
    g.save(); rr(g, -L / 2, -hh / 2, L, hh, 12); g.clip();
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1;
    for (let i = 0; i < 60; i++) { const fx = -L / 2 + hash(i, 5) * L, fy = -hh / 2 + hash(i, 6) * hh; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + 7, fy + (hash(i, 7) - 0.5) * 5); g.stroke(); }
    g.restore();
    // plastic back / top
    const ix = 7 * flip, it = 7 * flip, ib = lerp(hh * 0.42, 7, flip);
    const px = -L / 2 + ix, py = -hh / 2 + it, pw = L - 2 * ix, ph = hh - it - ib;
    const gr = g.createLinearGradient(0, py, 0, py + ph); gr.addColorStop(0, '#3f78c9'); gr.addColorStop(0.5, '#2c5fae'); gr.addColorStop(1, '#234d92');
    rr(g, px, py, pw, ph, lerp(9, 10, flip)); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 12, py + 3); g.lineTo(px + pw - 12, py + 3); g.stroke();
    if (flip > 0.3) { // grip grooves
      g.globalAlpha *= clamp((flip - 0.3) / 0.4);
      for (let i = -1; i <= 1; i++) { const gy = py + ph / 2 + i * ph * 0.2; g.strokeStyle = 'rgba(10,25,60,0.35)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(px + 60, gy); g.lineTo(px + pw - 60, gy); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px + 60, gy + 3); g.lineTo(px + pw - 60, gy + 3); g.stroke(); }
    }
    g.restore();
  }
  /** highlighter swipe (multiply): straight chisel-tip band with a soft wobble, drawn to progress u */
  function hl(g, x1, y1, x2, y2, w, col, u, seed = 1) {
    if (u <= 0) return;
    g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = col; g.lineCap = 'butt'; g.lineJoin = 'round';
    const pathTo = (off) => { g.beginPath(); const n = 14; for (let i = 0; i <= n; i++) { const f = (i / n) * u, x = lerp(x1, x2, f), y = lerp(y1, y2, f) + noise1(f * 3.3 + off, seed) * w * 0.05; i ? g.lineTo(x, y) : g.moveTo(x, y); } };
    g.lineWidth = w; pathTo(0); g.stroke();
    g.globalAlpha = 0.3; g.lineWidth = w * 0.5; pathTo(0.4); g.stroke();
    g.restore();
  }

  window.WB = { INK, FONT, S, Scene, trace, drawText, textWidth, layout, paper, magnet, tape, eraser, hl, rr, mkPolys };
})();
