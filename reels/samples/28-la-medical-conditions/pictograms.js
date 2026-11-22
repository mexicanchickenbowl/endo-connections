/*
 * Sample 28 — AIRLINE SAFETY CARD pictogram library.
 * Flat pictograms in four flat colours (ink navy, figure blue, pale glass, coral highlight) plus the three
 * signage colours (amber = limit, red = avoid, green = OK). Everything is drawn with canvas paths; nothing
 * here depends on time except the explicit animation parameters passed in.
 * Defines window.Pic.
 */
(function () {
  'use strict';
  const { clamp, lerp, seg, ease, rgba, mix } = Kit;

  const C = {
    ink: '#17324D',        // outlines, type
    inkSoft: '#3E5A78',
    blue: '#7FA9D1',       // figures
    blueDeep: '#5E8DBB',
    pale: '#D6E5F2',       // tints
    glass: '#EEF5FB',
    liquid: '#CFE2F2',
    silver: '#B5C3CF',
    rubber: '#52667A',
    coral: '#F0705A',      // organ / highlight colour
    brown: '#6B4330',      // methemoglobin "chocolate"
    amber: '#F7B21C',
    red: '#D7263D',
    green: '#17A05A',
    white: '#FFFFFF',
  };
  const COND = '"Barlow Condensed", Barlow, sans-serif';
  const SANS = 'Barlow, sans-serif';

  // ------------------------------------------------------------------ primitives
  function rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  /** fill and/or stroke the current path in the house style */
  function fs(g, fill, lw = 3, stroke = C.ink) {
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  }
  /** scale-in about (cx, cy) with a small overshoot; u = 0..1 */
  function grow(g, u, cx, cy, fn) {
    if (u <= 0) return;
    const s = u >= 1 ? 1 : Math.max(0.001, ease.outBack(u));
    g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); fn(); g.restore();
  }

  // ------------------------------------------------------------------ text (with a hand-drawn "≈" and subscripts)
  function approxGlyph(g, x, y, size, color) {
    const w = size * 0.36, x0 = x + size * 0.04, a = size * 0.062;
    g.save(); g.strokeStyle = color; g.lineWidth = size * 0.088; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const k of [0.455, 0.255]) {
      const yy = y - size * k;
      g.beginPath(); g.moveTo(x0, yy + a * 0.55);
      g.bezierCurveTo(x0 + w * 0.22, yy - a * 1.5, x0 + w * 0.42, yy - a * 0.6, x0 + w * 0.5, yy);
      g.bezierCurveTo(x0 + w * 0.58, yy + a * 0.6, x0 + w * 0.78, yy + a * 1.5, x0 + w, yy - a * 0.55);
      g.stroke();
    }
    g.restore();
  }
  /** draw text; "≈" is drawn by hand (not in the Barlow subsets). o: {size, weight, fam, color, align, ls}. Returns width. */
  function text(g, str, x, y, o = {}) {
    const size = o.size || 30, weight = o.weight || 700, fam = o.fam || COND;
    g.save();
    g.font = `${weight} ${size}px ${fam}`;
    if ('letterSpacing' in g) g.letterSpacing = (o.ls || 0) + 'px';
    g.fillStyle = o.color || C.ink; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    const parts = String(str).split('≈'), aw = size * 0.44;
    const ws = parts.map((p) => g.measureText(p).width);
    const w = ws.reduce((a, b) => a + b, 0) + (parts.length - 1) * aw;
    let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    parts.forEach((p, i) => {
      g.fillText(p, cx, y); cx += ws[i];
      if (i < parts.length - 1) { approxGlyph(g, cx, y, size, g.fillStyle); cx += aw; }
    });
    g.restore();
    return w;
  }
  function textWidth(g, str, o = {}) {
    g.save(); g.font = `${o.weight || 700} ${o.size || 30}px ${o.fam || COND}`;
    if ('letterSpacing' in g) g.letterSpacing = (o.ls || 0) + 'px';
    const parts = String(str).split('≈');
    const w = parts.reduce((a, p) => a + g.measureText(p).width, 0) + (parts.length - 1) * (o.size || 30) * 0.44;
    g.restore(); return w;
  }
  /** "SO3" with a real subscript, centred on x */
  function so3(g, x, y, size, color) {
    g.save(); g.fillStyle = color; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.font = `700 ${size}px ${COND}`; const w1 = g.measureText('SO').width;
    g.font = `700 ${size * 0.66}px ${COND}`; const w2 = g.measureText('3').width;
    const x0 = x - (w1 + w2 + 1) / 2;
    g.font = `700 ${size}px ${COND}`; g.fillText('SO', x0, y);
    g.font = `700 ${size * 0.66}px ${COND}`; g.fillText('3', x0 + w1 + 1, y + size * 0.17);
    g.restore();
  }

  // ------------------------------------------------------------------ signs
  function prohibit(g, x, y, r) {
    g.save();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.lineWidth = r * 0.3; g.strokeStyle = C.red; g.lineCap = 'butt';
    g.beginPath(); g.arc(x, y, r * 0.85, 0, Math.PI * 2); g.stroke();
    const k = r * 0.82 * Math.SQRT1_2;
    g.beginPath(); g.moveTo(x - k, y - k); g.lineTo(x + k, y + k); g.stroke();
    g.restore();
  }
  function check(g, x, y, r) {
    g.save();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = C.green; g.fill();
    g.beginPath(); g.moveTo(x - r * 0.46, y + r * 0.04); g.lineTo(x - r * 0.13, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34);
    g.lineWidth = r * 0.27; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
    g.restore();
  }
  function limit(g, x, y, r) {
    g.save();
    const R = r * 1.02, cy = y + r * 0.2;
    const tri = () => { g.beginPath(); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3; g[i ? 'lineTo' : 'moveTo'](x + R * Math.cos(a), cy + R * Math.sin(a)); } g.closePath(); };
    g.lineJoin = 'round';
    tri(); g.lineWidth = r * 0.42 + 6; g.strokeStyle = C.ink; g.stroke();
    tri(); g.lineWidth = r * 0.42; g.strokeStyle = C.amber; g.stroke(); g.fillStyle = C.amber; g.fill();
    // "!"
    g.fillStyle = C.ink;
    rr(g, x - r * 0.105, cy - R * 0.62, r * 0.21, R * 0.68, r * 0.1); g.fill();
    g.beginPath(); g.arc(x, cy + R * 0.3, r * 0.125, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  const SIGN = { avoid: prohibit, ok: check, limit };
  const SIGN_COLOR = { avoid: C.red, ok: C.green, limit: C.amber };

  /** a sign that is "stamped" on: u = 0..1 appearance, flash = 0..1 ring flash, pulse = 0..1 roll-call bump */
  function stamp(g, kind, x, y, r, u, flash = 1, pulse = 0) {
    if (u <= 0) return;
    const col = SIGN_COLOR[kind];
    for (const [f, k] of [[flash, 1], [pulse, 0.9]]) {
      if (f > 0 && f < 1) {
        g.beginPath(); g.arc(x, y, r * (1.05 + 0.75 * ease.out(f)), 0, Math.PI * 2);
        g.lineWidth = 5 * (1 - f) + 0.5; g.strokeStyle = rgba(col, 0.55 * k * (1 - f)); g.stroke();
      }
    }
    const bump = Math.sin(Math.PI * clamp(pulse)) ** 2;
    const s = lerp(2.0, 1, ease.out(clamp(u))) * (1 + 0.2 * bump);
    g.save(); g.globalAlpha *= clamp(u * 2.6); g.translate(x, y); g.scale(s, s); SIGN[kind](g, 0, 0, r); g.restore();
  }

  // ------------------------------------------------------------------ arrow
  function arrow(g, x0, x1, y, u = 1) {
    if (u <= 0) return;
    const x = lerp(x0 + 18, x1, ease.out(clamp(u)));
    g.save(); g.globalAlpha *= clamp(u * 4);
    g.beginPath(); g.moveTo(x0, y); g.lineTo(x - 12, y); g.lineWidth = 8; g.strokeStyle = C.ink; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.moveTo(x + 2, y); g.lineTo(x - 15, y - 14); g.lineTo(x - 15, y + 14); g.closePath();
    g.fillStyle = C.ink; g.fill(); g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
    g.restore();
  }

  // ------------------------------------------------------------------ dental cartridge (horizontal)
  /**
   * x,y = left end / mid-height. L = total length, h = height.
   * o: {label, size, ghost, chip:'SO3', alpha}
   */
  function cartridge(g, x, y, L, h, o = {}) {
    const capW = h * 0.36, neckW = h * 0.2, bodyL = L - capW - neckW, stop = h * 0.42, r = h * 0.14;
    if (o.ghost) {
      g.save(); g.setLineDash([8, 7]); g.lineDashOffset = 2;
      rr(g, x, y - h / 2, bodyL, h, r); fs(g, rgba('#ffffff', 0.5), 3, rgba(C.ink, 0.42));
      rr(g, x + bodyL, y - h * 0.3, neckW + capW, h * 0.6, 3); fs(g, null, 3, rgba(C.ink, 0.42));
      g.restore(); return;
    }
    // glass tube with liquid, highlight and rubber stopper
    rr(g, x, y - h / 2, bodyL, h, r); g.fillStyle = C.glass; g.fill();
    g.save(); rr(g, x, y - h / 2, bodyL, h, r); g.clip();
    g.fillStyle = C.liquid; g.fillRect(x + stop, y - h / 2, bodyL - stop, h);
    g.fillStyle = 'rgba(255,255,255,0.85)'; rr(g, x + stop + 6, y - h / 2 + 4.5, bodyL - stop - 14, 3.6, 1.8); g.fill();
    g.fillStyle = C.rubber; g.fillRect(x, y - h / 2, stop, h);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + stop * 0.3, y - h / 2, 2.2, h); g.fillRect(x + stop * 0.62, y - h / 2, 2.2, h);
    g.restore();
    g.beginPath(); g.moveTo(x + stop, y - h / 2); g.lineTo(x + stop, y + h / 2); fs(g, null, 2.5);
    rr(g, x, y - h / 2, bodyL, h, r); fs(g, null, 3);
    // neck + aluminum cap with diaphragm
    g.beginPath(); g.rect(x + bodyL, y - h * 0.27, neckW + 2, h * 0.54); fs(g, C.glass, 3);
    rr(g, x + bodyL + neckW, y - h * 0.4, capW, h * 0.8, 3.5); fs(g, C.silver, 3);
    g.beginPath(); g.moveTo(x + bodyL + neckW + capW * 0.5, y - h * 0.2); g.lineTo(x + bodyL + neckW + capW * 0.5, y + h * 0.2); fs(g, null, 2.2, rgba(C.ink, 0.55));
    // label
    const zx = x + stop + (bodyL - stop) / 2, size = o.size || 30, base = y + size * 0.355;
    if (o.chip === 'SO3') {
      const w1 = textWidth(g, o.label, { size }), cw = 58, gap = 8, x0 = zx - (w1 + gap + cw) / 2;
      text(g, o.label, x0, base, { size });
      rr(g, x0 + w1 + gap, y - 16, cw, 32, 8); g.fillStyle = C.coral; g.fill();
      so3(g, x0 + w1 + gap + cw / 2, y + 10, 30, '#fff');
    } else if (o.label) {
      text(g, o.label, zx, base, { size, align: 'center' });
    }
  }

  /** topical gel tube (benzocaine) */
  function tube(g, x, y, L, h, o = {}) {
    const crimp = 10, sh = 17, cap = 14, bodyR = x + L - sh - cap;
    g.beginPath();
    g.moveTo(x + crimp, y - h / 2); g.lineTo(bodyR, y - h / 2 + 1.5);
    g.lineTo(bodyR + sh, y - h * 0.2); g.lineTo(bodyR + sh, y + h * 0.2);
    g.lineTo(bodyR, y + h / 2 - 1.5); g.lineTo(x + crimp, y + h / 2); g.closePath();
    fs(g, '#FFFFFF', 3);
    // coral end band + crimp
    g.save(); g.beginPath(); g.rect(x + crimp, y - h / 2, 6.5, h); g.clip(); g.fillStyle = C.coral; g.fillRect(x, y - h / 2 + 1.5, 40, h - 3); g.restore();
    rr(g, x, y - h / 2 - 2, crimp, h + 4, 2.5); fs(g, C.silver, 3);
    g.beginPath(); g.moveTo(x + crimp / 2, y - h / 2 + 4); g.lineTo(x + crimp / 2, y + h / 2 - 4); fs(g, null, 2, rgba(C.ink, 0.5));
    rr(g, bodyR + sh - 1, y - h * 0.27, cap, h * 0.54, 3); fs(g, C.ink, 3);
    const size = o.size || 30;
    text(g, o.label, (x + crimp + 6.5 + bodyR + 5) / 2, y + size * 0.355, { size, align: 'center' });
  }

  // ------------------------------------------------------------------ figures
  /** head-and-shoulders pictogram, box about 100 x 116 centred on (cx, cy) */
  function bust(g, cx, cy, o = {}) {
    const nw = o.neckW || 10, sh = o.sh != null ? o.sh : -10, bot = cy + 56, hw = 49;
    g.beginPath();
    g.moveTo(cx - hw, bot); g.lineTo(cx - hw, cy + sh + 34);
    g.bezierCurveTo(cx - hw, cy + sh + 9, cx - 30, cy + sh + 1, cx - nw, cy + sh);
    g.lineTo(cx - nw, cy - 26); g.lineTo(cx + nw, cy - 26); g.lineTo(cx + nw, cy + sh);
    g.bezierCurveTo(cx + 30, cy + sh + 1, cx + hw, cy + sh + 9, cx + hw, cy + sh + 34);
    g.lineTo(cx + hw, bot); g.closePath(); fs(g, C.blue);
    g.beginPath(); g.arc(cx, cy - 36, o.headR || 21, 0, Math.PI * 2); fs(g, C.blue);
  }
  function heartPath(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * 0.4);
    g.bezierCurveTo(x - s * 0.7, y - s * 0.02, x - s * 0.42, y - s * 0.62, x, y - s * 0.22);
    g.bezierCurveTo(x + s * 0.42, y - s * 0.62, x + s * 0.7, y - s * 0.02, x, y + s * 0.4);
    g.closePath();
  }
  /** 1 · heart disease: bust with a heart and an ECG trace. beat = 0..1 */
  function condHeart(g, cx, cy, a = {}) {
    grow(g, a.fig, cx, cy + 10, () => bust(g, cx, cy));
    const hx = cx + 6, hy = cy + 26, s = 50;
    grow(g, a.organ, hx, hy, () => {
      g.save(); g.translate(hx, hy); const k = 1 + 0.13 * (a.beat || 0); g.scale(k, k); g.translate(-hx, -hy);
      heartPath(g, hx, hy, s); fs(g, C.coral);
      g.save(); heartPath(g, hx, hy, s); g.clip();
      g.beginPath();
      const y0 = hy - 3;
      g.moveTo(hx - s * 0.6, y0); g.lineTo(hx - s * 0.2, y0); g.lineTo(hx - s * 0.1, y0 - 12); g.lineTo(hx + s * 0.02, y0 + 11);
      g.lineTo(hx + s * 0.12, y0 - 5); g.lineTo(hx + s * 0.2, y0); g.lineTo(hx + s * 0.6, y0);
      fs(g, null, 3.4, '#fff');
      g.restore(); g.restore();
    });
  }

  /** pill bottle; symbol: 'beta' | 'tricyclic' */
  function bottle(g, bx, cy, symbol) {
    // cap
    rr(g, bx - 29, cy - 56, 58, 24, 6); fs(g, C.ink);
    g.save(); g.strokeStyle = rgba('#ffffff', 0.28); g.lineWidth = 2.4; g.lineCap = 'round';
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(bx + i * 10, cy - 50); g.lineTo(bx + i * 10, cy - 38); g.stroke(); }
    g.restore();
    // neck + body
    g.beginPath(); g.rect(bx - 23, cy - 33, 46, 10); fs(g, C.liquid);
    rr(g, bx - 36, cy - 25, 72, 81, 10); fs(g, C.blue);
    // label
    g.save(); rr(g, bx - 36, cy - 25, 72, 81, 10); g.clip(); g.fillStyle = '#fff'; g.fillRect(bx - 36, cy - 8, 72, 50); g.restore();
    g.beginPath(); g.moveTo(bx - 36, cy - 8); g.lineTo(bx + 36, cy - 8); g.moveTo(bx - 36, cy + 42); g.lineTo(bx + 36, cy + 42); fs(g, null, 2.6);
    rr(g, bx - 36, cy - 25, 72, 81, 10); fs(g, null, 3);
    const ly = cy + 17;
    if (symbol === 'beta') {
      g.save(); g.font = '700 44px Inter, "DejaVu Sans", sans-serif'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillText('β', bx + 1, ly + 13); g.restore();
    } else {
      // dibenzazepine-like skeleton: two benzene rings fused to a central seven-membered ring, side chain on N
      const R = 10.5, w = R * Math.sqrt(3), gap = 17, y = ly - 3;
      const hex = (x) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; g[i ? 'lineTo' : 'moveTo'](x + R * Math.cos(a), y + R * Math.sin(a)); } g.closePath(); fs(g, null, 2.6); };
      const xl = bx - gap / 2 - w / 2, xr = bx + gap / 2 + w / 2;
      hex(xl); hex(xr);
      g.beginPath();
      g.moveTo(xl + w / 2, y - R / 2); g.lineTo(bx - 5.5, y - R / 2 - 8.5); g.lineTo(bx + 5.5, y - R / 2 - 8.5); g.lineTo(xr - w / 2, y - R / 2);
      g.moveTo(xl + w / 2, y + R / 2); g.lineTo(bx, y + R / 2 + 7); g.lineTo(xr - w / 2, y + R / 2);
      g.moveTo(bx, y + R / 2 + 7); g.lineTo(bx, y + R / 2 + 15);
      fs(g, null, 2.6);
    }
  }
  function capsule(g, x, y, len, r, ang, colA, colB) {
    g.save(); g.translate(x, y); g.rotate(ang);
    rr(g, -len / 2, -r, len, r * 2, r); g.fillStyle = colB; g.fill();
    g.save(); rr(g, -len / 2, -r, len, r * 2, r); g.clip(); g.fillStyle = colA; g.fillRect(-len / 2, -r, len / 2, r * 2); g.restore();
    rr(g, -len / 2, -r, len, r * 2, r); fs(g, null, 2.8);
    g.beginPath(); g.moveTo(0, -r); g.lineTo(0, r); fs(g, null, 2.2);
    g.restore();
  }
  /** 2 / 3 · pill bottle + pills. a: {fig, pills} */
  function condBottle(g, cx, cy, symbol, a = {}) {
    const bx = cx - 14;
    grow(g, a.fig, bx, cy + 10, () => bottle(g, bx, cy, symbol));
    const p = clamp(a.pills || 0);
    if (p > 0) {
      const drop = (1 - ease.out(p)) * -34;
      g.save(); g.globalAlpha *= clamp(p * 3);
      const col = symbol === 'beta' ? C.blueDeep : C.coral;
      capsule(g, cx + 45, cy + 42 + drop, 36, 8.5, -0.62, col, '#fff'); capsule(g, cx + 46, cy + 12 + drop * 1.4, 30, 7.5, 0.5, col, '#fff');
      g.restore();
    }
  }

  /** 4 · recent cocaine use: head in profile, powder lines, "recent" clock. a: {fig, powder, sniff(0..1 loop), clock, hand} */
  function condCocaine(g, cx, cy, a = {}) {
    const hx = cx - 12;
    grow(g, a.fig, hx, cy + 8, () => {
      g.beginPath();
      g.moveTo(hx - 34, cy + 56); g.lineTo(hx - 34, cy + 30);
      g.bezierCurveTo(hx - 54, cy + 12, hx - 56, cy - 22, hx - 40, cy - 40);
      g.bezierCurveTo(hx - 26, cy - 58, hx + 8, cy - 60, hx + 22, cy - 42);
      g.bezierCurveTo(hx + 30, cy - 32, hx + 29, cy - 22, hx + 28, cy - 15);
      g.lineTo(hx + 44, cy + 7);
      g.quadraticCurveTo(hx + 46, cy + 14, hx + 36, cy + 14);
      g.lineTo(hx + 30, cy + 15);
      g.bezierCurveTo(hx + 33, cy + 21, hx + 33, cy + 25, hx + 29, cy + 29);
      g.bezierCurveTo(hx + 33, cy + 37, hx + 28, cy + 47, hx + 16, cy + 46);
      g.lineTo(hx + 6, cy + 44);
      g.bezierCurveTo(hx, cy + 46, hx - 2, cy + 50, hx - 2, cy + 56);
      g.closePath(); fs(g, C.blue);
      // ear + closed eye
      g.beginPath(); g.arc(hx - 14, cy - 4, 8, -Math.PI * 0.55, Math.PI * 0.75); fs(g, null, 2.8);
      g.beginPath(); g.moveTo(hx + 12, cy - 16); g.quadraticCurveTo(hx + 17, cy - 12, hx + 22, cy - 15); fs(g, null, 2.8);
    });
    // powder on a slab + particles drawn up to the nostril
    const p = clamp(a.powder || 0);
    if (p > 0) {
      grow(g, p, hx + 56, cy + 48, () => {
        rr(g, hx + 30, cy + 39, 52, 19, 5); fs(g, C.ink, 0);
        g.beginPath(); g.moveTo(hx + 37, cy + 45.5); g.lineTo(hx + 75, cy + 45.5); g.moveTo(hx + 37, cy + 52); g.lineTo(hx + 66, cy + 52);
        fs(g, null, 3.4, '#fff');
      });
      for (let i = 0; i < 3; i++) {
        const u = ((a.sniff || 0) + i / 3) % 1;
        const x = lerp(hx + 60, hx + 41, ease.smooth(u)) + Math.sin(u * Math.PI) * 9;
        const y = lerp(cy + 38, cy + 17, u);
        g.beginPath(); g.arc(x, y, 3.8 * (1 - 0.35 * u), 0, Math.PI * 2);
        g.globalAlpha = p * (0.35 + 0.65 * Math.sin(u * Math.PI));
        fs(g, '#fff', 2.2); g.globalAlpha = 1;
      }
    }
    // "recent" clock (history icon)
    grow(g, a.clock, hx + 60, cy - 38, () => {
      const x = hx + 60, y = cy - 38, r = 18;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); fs(g, '#fff', 3);
      const h = a.hand != null ? a.hand : 1;                 // minute hand sweeps back to "just now"
      const am = -Math.PI / 2 - (1 - h) * Math.PI * 1.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(am) * 11.5, y + Math.sin(am) * 11.5);
      g.moveTo(x, y); g.lineTo(x + 7.5, y + 3.5); fs(g, null, 3);
      // counter-clockwise arrow hugging the dial
      g.beginPath(); g.arc(x, y, r + 7, Math.PI * 1.08, Math.PI * 1.62); fs(g, null, 3, C.coral);
      const ax = x + (r + 7) * Math.cos(Math.PI * 1.08), ay = y + (r + 7) * Math.sin(Math.PI * 1.08);
      g.beginPath(); g.moveTo(ax - 6.5, ay - 5); g.lineTo(ax - 0.5, ay + 4.5); g.lineTo(ax + 6, ay - 5); fs(g, null, 3, C.coral);
    });
  }

  /** 5 · uncontrolled hyperthyroidism: bust with a long neck, butterfly gland, radiating "overactive" marks */
  function condThyroid(g, cx, cy, a = {}) {
    grow(g, a.fig, cx, cy + 10, () => bust(g, cx, cy, { neckW: 15, sh: 16, headR: 22 }));
    const ty = cy + 0;
    grow(g, a.organ, cx, ty, () => {
      const k = 1 + 0.1 * (a.beat || 0);
      g.save(); g.translate(cx, ty); g.scale(k, k); g.translate(-cx, -ty);
      const shape = () => {
        g.beginPath();
        g.ellipse(cx - 10.5, ty, 8.5, 14, 0.22, 0, Math.PI * 2);
        g.ellipse(cx + 10.5, ty, 8.5, 14, -0.22, 0, Math.PI * 2);
        g.rect(cx - 7, ty + 2, 14, 8);
      };
      shape(); g.lineWidth = 6; g.strokeStyle = C.ink; g.lineJoin = 'round'; g.stroke();
      shape(); g.fillStyle = C.coral; g.fill();
      g.restore();
    });
    // radiating marks
    const r = clamp(a.rays || 0);
    if (r > 0) {
      g.save(); g.lineCap = 'round'; g.lineWidth = 4; g.strokeStyle = C.coral;
      const out = (a.rayPhase || 0) * 5;
      for (const side of [-1, 1]) for (const ang of [-0.6, 0, 0.6]) {
        const r0 = 26 + out, r1 = r0 + 9 * r;
        const dx = Math.cos(ang) * side, dy = Math.sin(ang);
        g.beginPath(); g.moveTo(cx + dx * r0, ty + dy * r0); g.lineTo(cx + dx * r1, ty + dy * r1); g.stroke();
      }
      g.restore();
    }
  }

  function dropPath(g, x, y, w, h) {
    const r = w / 2, cyc = y + h / 2 - r, top = y - h / 2;
    g.beginPath();
    g.moveTo(x, top);
    g.bezierCurveTo(x + r * 0.3, top + (cyc - top) * 0.5, x + r, cyc - r * 0.85, x + r, cyc);
    g.arc(x, cyc, r, 0, Math.PI);
    g.bezierCurveTo(x - r, cyc - r * 0.85, x - r * 0.3, top + (cyc - top) * 0.5, x, top);
    g.closePath();
  }
  function drop(g, x, y, w, h, fill) {
    dropPath(g, x, y, w, h); fs(g, fill);
    const r = w / 2, cyc = y + h / 2 - r;
    g.beginPath(); g.arc(x, cyc, r * 0.58, Math.PI * 0.62, Math.PI * 0.98); fs(g, null, 3.2, 'rgba(255,255,255,0.8)');
  }
  /** 6 · methemoglobinemia: a red drop turns chocolate brown. a: {fig, turn(0..1)} */
  function condMetHb(g, cx, cy, a = {}) {
    const t = clamp(a.turn || 0);
    const rx = lerp(cx, cx - 33, ease.inOut(clamp(t * 1.6)));
    grow(g, a.fig, rx, cy, () => drop(g, rx, cy - 6, 46, 66, C.coral));
    if (t > 0) {
      const u = ease.inOut(clamp(t * 1.25));
      const bx = lerp(cx - 20, cx + 30, u), col = rgba(mix(C.coral, C.brown, clamp((t - 0.2) / 0.6)));
      const s = lerp(0.72, 1, u);
      g.save(); g.globalAlpha *= clamp(t * 5);
      drop(g, bx, cy + 4, 62 * s, 88 * s, col);
      g.restore();
      const ar = seg(t, 0.55, 0.9);
      if (ar > 0) {
        g.save(); g.globalAlpha *= ar;
        g.beginPath(); g.moveTo(cx - 14, cy - 38); g.quadraticCurveTo(cx + 2, cy - 54, cx + 17, cy - 44); fs(g, null, 3.4);
        g.beginPath(); g.moveTo(cx + 20, cy - 42); g.lineTo(cx + 8, cy - 39); g.lineTo(cx + 15, cy - 52); g.closePath(); fs(g, C.ink, 2.5);
        g.restore();
      }
    }
  }

  /** 7 · sulfite allergy: bust with hives and an "SO3" tag. a: {fig, dots(0..1), tag} */
  function condSulfite(g, cx, cy, a = {}) {
    const bx = cx - 12;
    grow(g, a.fig, bx, cy + 10, () => bust(g, bx, cy));
    const pts = [[-26, 22], [-5, 12], [16, 26], [-14, 40], [30, 12], [6, 44], [33, 38], [-34, 44]];
    const d = clamp(a.dots || 0);
    pts.forEach(([dx, dy], i) => {
      const u = clamp(d * (pts.length + 2) - i);
      if (u > 0) { g.beginPath(); g.arc(bx + dx, cy + dy, (i % 2 ? 4.6 : 5.6) * ease.outBack(u), 0, Math.PI * 2); fs(g, C.coral, 2.2); }
    });
    grow(g, a.tag, cx + 34, cy - 42, () => {
      rr(g, cx + 4, cy - 62, 62, 40, 10); fs(g, C.ink, 0);
      // little tail towards the patient
      g.beginPath(); g.moveTo(cx + 12, cy - 26); g.lineTo(cx + 4, cy - 14); g.lineTo(cx + 26, cy - 26); g.closePath(); fs(g, C.ink, 0);
      so3(g, cx + 35, cy - 31, 31, '#fff');
    });
  }

  /** 8 · pregnancy: standing figure in profile. a: {fig, organ, beat} */
  function condPregnant(g, cx, cy, a = {}) {
    const x = cx - 6;
    grow(g, a.fig, x, cy + 8, () => {
      g.beginPath();
      g.moveTo(x - 25, cy + 56); g.lineTo(x - 25, cy - 2);
      g.bezierCurveTo(x - 27, cy - 18, x - 20, cy - 27, x - 7, cy - 27);
      g.bezierCurveTo(x + 5, cy - 27, x + 11, cy - 20, x + 13, cy - 9);
      g.bezierCurveTo(x + 18, cy - 3, x + 42, cy + 4, x + 42, cy + 25);
      g.bezierCurveTo(x + 42, cy + 42, x + 26, cy + 48, x + 16, cy + 49);
      g.lineTo(x + 16, cy + 56); g.closePath(); fs(g, C.blue);
      g.beginPath(); g.arc(x - 5, cy - 42, 17.5, 0, Math.PI * 2); fs(g, C.blue);
      // hair bun
      g.beginPath(); g.arc(x - 22, cy - 50, 7.5, 0, Math.PI * 2); fs(g, C.blue);
      // arm resting on the bump
      const arm = () => { g.beginPath(); g.moveTo(x - 8, cy - 12); g.quadraticCurveTo(x - 10, cy + 12, x + 2, cy + 14); g.lineTo(x + 19, cy + 13); };
      arm(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 12.5; g.strokeStyle = C.ink; g.stroke();
      arm(); g.lineWidth = 6.5; g.strokeStyle = C.blue; g.stroke();
    });
    const hx = x + 25, hy = cy + 31;
    grow(g, a.organ, hx, hy, () => {
      const k = 1 + 0.16 * (a.beat || 0);
      g.save(); g.translate(hx, hy); g.scale(k, k); g.translate(-hx, -hy);
      heartPath(g, hx, hy, 19); fs(g, C.coral, 2.4);
      g.restore();
    });
  }

  // ------------------------------------------------------------------ small instruments
  /** aneroid blood-pressure dial; needle 0..1 */
  function gauge(g, x, y, r, needle = 0.6) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); fs(g, '#fff', 3);
    g.save(); g.strokeStyle = rgba(C.ink, 0.75); g.lineWidth = 2.2; g.lineCap = 'round';
    for (let i = 0; i <= 6; i++) { const a = Math.PI * 0.8 + (i / 6) * Math.PI * 1.4; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62); g.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); g.stroke(); }
    g.restore();
    const a = Math.PI * 0.8 + needle * Math.PI * 1.4;
    g.beginPath(); g.moveTo(x - Math.cos(a) * 4, y - Math.sin(a) * 4); g.lineTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7); fs(g, null, 3.4, C.coral);
    g.beginPath(); g.arc(x, y, 3.4, 0, Math.PI * 2); fs(g, C.ink, 0);
    // tube stub to the cuff
    g.beginPath(); g.moveTo(x - 6, y + r + 1); g.lineTo(x - 6, y + r + 7); g.moveTo(x + 6, y + r + 1); g.lineTo(x + 6, y + r + 7); fs(g, null, 3);
  }
  /** circular "repeat" arrow; rot = extra rotation */
  function loopArrow(g, x, y, r, rot = 0) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.beginPath(); g.arc(0, 0, r, -Math.PI * 0.35, Math.PI * 1.25); fs(g, null, 4.2);
    const a = -Math.PI * 0.35, ax = Math.cos(a) * r, ay = Math.sin(a) * r;
    g.beginPath(); g.moveTo(ax + 7.5, ay + 5.5); g.lineTo(ax - 7, ay - 1.5); g.lineTo(ax + 2.5, ay - 9); g.closePath(); fs(g, C.ink, 2.4);
    g.restore();
  }
  /** small molar pictogram (brand mark on the index strip) */
  function tooth(g, x, y, s, fill = '#fff') {
    g.beginPath();
    g.moveTo(x - s * 0.5, y - s * 0.28);
    g.bezierCurveTo(x - s * 0.5, y - s * 0.62, x - s * 0.14, y - s * 0.56, x, y - s * 0.44);
    g.bezierCurveTo(x + s * 0.14, y - s * 0.56, x + s * 0.5, y - s * 0.62, x + s * 0.5, y - s * 0.28);
    g.bezierCurveTo(x + s * 0.5, y + s * 0.05, x + s * 0.4, y + s * 0.2, x + s * 0.36, y + s * 0.55);
    g.bezierCurveTo(x + s * 0.33, y + s * 0.72, x + s * 0.2, y + s * 0.7, x + s * 0.17, y + s * 0.5);
    g.bezierCurveTo(x + s * 0.14, y + s * 0.28, x + s * 0.08, y + s * 0.14, x, y + s * 0.14);
    g.bezierCurveTo(x - s * 0.08, y + s * 0.14, x - s * 0.14, y + s * 0.28, x - s * 0.17, y + s * 0.5);
    g.bezierCurveTo(x - s * 0.2, y + s * 0.7, x - s * 0.33, y + s * 0.72, x - s * 0.36, y + s * 0.55);
    g.bezierCurveTo(x - s * 0.4, y + s * 0.2, x - s * 0.5, y + s * 0.05, x - s * 0.5, y - s * 0.28);
    g.closePath(); fs(g, fill, 3);
  }

  window.Pic = {
    C, COND, SANS, rr, fs, grow, text, textWidth, so3, stamp, SIGN, SIGN_COLOR, arrow, cartridge, tube,
    condHeart, condBottle, condCocaine, condThyroid, condMetHb, condSulfite, condPregnant, gauge, loopArrow, tooth,
  };
})();
