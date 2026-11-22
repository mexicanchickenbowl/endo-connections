/*
 * 25 · Endo outcome numbers — SPLIT-FLAP DEPARTURE BOARD
 * One full-frame canvas. Everything is a pure function of t (see render()).
 * Every number on the board is listed with its source in NOTES.md / RESEARCH.md. No illustrative numbers:
 * spinning flaps only ever show letters or blanks, never digits. The surgery SURVIVAL cell holds a dim "– – %"
 * placeholder (no verified pooled figure), never a number.
 */
(function () {
  const { canvas, ctx } = Kit.createCanvas();
  const { seg, ease, clamp, lerp, hash, W, H } = Kit;

  const D = 24;            // loop length (s)
  const T_CLEAR = 23.4;    // every flap flips back to blank from here, so the last frame equals the first

  // ---------------------------------------------------------------- palette
  const COL = {
    ink: '#f4efe1',        // numbers
    soft: '#ddd7c7',       // criteria chips
    amber: '#ffb629',      // row names, modifier labels
    dim: '#a39d8f',        // the retained "traditional" figure
    dimAmber: '#cc9a3a',
    src: '#a29c8d',        // fine-print sources
    icon: '#0b0b0c',
  };
  const BC = (wt, px) => `${wt} ${px}px "Barlow Condensed"`;
  const CLS = {
    big:  { w: 94, h: 132, gap: 6, px: 132, font: BC(700, 132), r: 7, hinge: 3, pin: [5, 14] },
    mid:  { w: 58, h: 76,  gap: 4, px: 78,  font: BC(700, 78),  r: 5, hinge: 2, pin: [4, 10] },
    sm:   { w: 50, h: 70,  gap: 4, px: 70,  font: BC(700, 70),  r: 5, hinge: 2, pin: [3, 9] },
    name: { w: 38, h: 52,  gap: 4, px: 46,  font: BC(600, 46),  r: 4, hinge: 2, pin: [3, 7] },
    chip: { h: 48, px: 34, font: BC(600, 34), r: 4, hinge: 1, ha: 0.62, pin: [3, 7], padX: 9, ls: 0.8, soft: 1 },
    tag:  { h: 76, px: 46, font: BC(600, 46), r: 5, hinge: 2, pin: [4, 10], padX: 13, ls: 1 },
    src:  { h: 32, px: 24, font: BC(500, 24), r: 3, hinge: 1, ha: 0.5, pin: [2, 5], padX: 9, ls: 0.7, soft: 1 },
  };
  // letters a flap passes on its way to the target (no digits, and none that read as digits: O I S B Z G Q D)
  const SCR = 'ACEFHJKLMNPRTUVWXY';
  const BLANK = { text: '', color: COL.ink };

  // ---------------------------------------------------------------- small drawing helpers
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
    g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
  }
  const NEQ = '≠';   // not in the Barlow Condensed subset: drawn by hand
  function measureRich(g, text, px) {
    const parts = text.split(NEQ); let w = 0;
    parts.forEach((p, i) => { w += g.measureText(p).width; if (i < parts.length - 1) w += px * 0.5; });
    return w;
  }
  function fillRich(g, text, x, y, px) {
    const parts = text.split(NEQ);
    parts.forEach((p, i) => {
      g.fillText(p, x, y); x += g.measureText(p).width;
      if (i < parts.length - 1) {
        const w = px * 0.44, th = Math.max(2, px * 0.09), x0 = x + px * 0.01;
        g.fillRect(x0, y - px * 0.47, w, th); g.fillRect(x0, y - px * 0.27, w, th);
        g.save(); g.strokeStyle = g.fillStyle; g.lineWidth = th * 0.95; g.beginPath();
        g.moveTo(x0 + w * 0.2, y - px * 0.08); g.lineTo(x0 + w * 0.8, y - px * 0.6); g.stroke(); g.restore();
        x += px * 0.5;
      }
    });
  }
  const mcv = document.createElement('canvas').getContext('2d');
  const capCache = {};
  function capH(font) {
    if (capCache[font] == null) { mcv.font = font; capCache[font] = mcv.measureText('H').actualBoundingBoxAscent; }
    return capCache[font];
  }
  function textW(cls, text) {
    const k = CLS[cls]; mcv.font = k.font; mcv.letterSpacing = (k.ls || 0) + 'px';
    const w = measureRich(mcv, text, k.px) - (k.ls || 0); mcv.letterSpacing = '0px';
    return w;
  }
  const wordW = (cls, ...texts) => Math.ceil(Math.max(...texts.map((s) => textW(cls, s))) + 2 * CLS[cls].padX);

  // ---------------------------------------------------------------- flap cards (pre-rendered faces)
  const cards = new Map();
  function getCard(cls, w, text, color, char) {
    const key = cls + '|' + w + '|' + text + '|' + color;
    let c = cards.get(key);
    if (c) return c;
    const k = CLS[cls], h = k.h;
    c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.save(); rr(g, 0, 0, w, h, k.r); g.clip();
    const fine = cls === 'src';
    const gr = g.createLinearGradient(0, 0, 0, h);
    if (fine) { gr.addColorStop(0, '#1d1e20'); gr.addColorStop(0.5, '#18191b'); gr.addColorStop(0.5, '#141517'); gr.addColorStop(1, '#111214'); }
    else { gr.addColorStop(0, '#2e2f33'); gr.addColorStop(0.497, '#25262a'); gr.addColorStop(0.503, '#1d1e21'); gr.addColorStop(1, '#17181a'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // soft side falloff + top lip highlight + shadow the upper leaf throws on the lower one
    const sg = g.createLinearGradient(0, 0, w, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0.22)'); sg.addColorStop(Math.min(0.2, 10 / w), 'rgba(0,0,0,0)');
    sg.addColorStop(1 - Math.min(0.2, 10 / w), 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.22)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(0, 0, w, 1.5);
    const sh = g.createLinearGradient(0, h / 2, 0, h / 2 + h * 0.16);
    sh.addColorStop(0, `rgba(0,0,0,${k.soft ? 0.2 : 0.38})`); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, h / 2, w, h * 0.16);
    if (text) {
      g.font = k.font; g.fillStyle = color; g.textBaseline = 'alphabetic';
      const by = Math.round(h / 2 + capH(k.font) / 2);
      if (char) {
        g.textAlign = 'center';
        const tw = g.measureText(text).width, max = w - 10;
        g.save(); g.translate(w / 2, by); if (tw > max) g.scale(max / tw, 1);
        g.fillText(text, 0, 0); g.restore();
      } else {
        g.textAlign = 'left'; g.letterSpacing = (k.ls || 0) + 'px';
        fillRich(g, text, k.padX, by, k.px);
        g.letterSpacing = '0px';
      }
      // very light print wear so the glyphs do not look like a UI font
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = `rgba(0,0,0,${k.soft ? 0.04 : 0.10})`; g.fillRect(0, h / 2, w, h / 2);
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
    cards.set(key, c);
    return c;
  }

  // ---------------------------------------------------------------- units + their flip scripts
  const units = [], tiles = [], lamps = [];
  function addUnit(u) { u.id = units.length; u.events = []; u.tone = hash(u.id, 7) * 0.07; units.push(u); return u; }
  function charRow(cls, x, y, n) {
    const k = CLS[cls], row = [];
    for (let i = 0; i < n; i++) row.push(addUnit({ cls, char: true, x: x + i * (k.w + k.gap), y, w: k.w, h: k.h }));
    return row;
  }
  const wordFlap = (cls, x, y, w) => addUnit({ cls, char: false, x, y, w, h: CLS[cls].h });
  /** schedule a run of n flips ending on `final`; intermediate leaves are letters (char flaps) or blanks (word flaps) */
  function flip(u, t, final, n, step, plain) {
    const idx = u.events.length, seq = [];
    if (u.char && !plain) {
      const picks = [];
      for (let k = 0; k < n - 1; k++) picks.push(Math.floor(hash(u.id, idx, k) * SCR.length));
      picks.sort((a, b) => a - b);                       // a real module runs through its alphabet in order
      for (const p of picks) seq.push({ text: final.text ? SCR[p] : '', color: final.color });
    } else for (let k = 0; k < n - 1; k++) seq.push(BLANK);
    seq.push(final);
    u.events.push({ t, seq, step });
  }
  function setChars(row, t0, text, o = {}) {
    const { stagger = 0.05, n = 4, grow = 1, step = 0.085, color = COL.ink, plain = false } = o;
    [...text].forEach((ch, i) => { if (ch !== ' ') flip(row[i], t0 + i * stagger, { text: ch, color }, n + Math.round(i * grow), step, plain); });
  }
  const setWord = (u, t0, text, o = {}) => flip(u, t0, { text, color: o.color || COL.soft }, o.n || 2, o.step || 0.1);
  function chips(x, y, list, t0, color) {
    let cx = x;
    list.forEach((txt, i) => { const w = wordW('chip', txt); setWord(wordFlap('chip', cx, y, w), t0 + i * 0.12, txt, { color }); cx += w + 6; });
    return cx - 6;
  }
  function source(x, y, txt, t0) { const u = wordFlap('src', x, y, wordW('src', txt)); setWord(u, t0, txt, { color: COL.src }); return u; }

  // ---------------------------------------------------------------- layout
  const SX = 64, VX = 556;                 // SUCCESS column, SURVIVAL column
  const NAME_X = 128, NAME_N = 14;       // 14 = 'APICAL SURGERY', the longest row name
  const Y = { head: 236, colh: 392, s1: 410, m1: 708, s2: 872, s3: 1172, foot: 1526 };
  const warn = [];
  const DX = 374;                          // small dim slot that keeps the traditional figure

  function nameRow(y, text, icon, tOn, tSteady, stagger) {
    tiles.push({ x: SX, y, s: 52, icon, on: tOn });
    setChars(charRow('name', NAME_X, y, NAME_N), tOn + 0.12, text, { stagger, n: 3, grow: 0.2, step: 0.08, color: COL.amber });
    lamps.push({ x: 974, y: y + 26, r: 9, on: tOn, steady: tSteady, ph: 0 }, { x: 1001, y: y + 26, r: 9, on: tOn, steady: tSteady, ph: 0.5 });
  }
  const NUM = { stagger: 0.1, n: 4, grow: 1, step: 0.085 };   // 4, 5, 6 leaves: a figure settles in about 0.7 s

  function build() {
    // ---- 1 · PRIMARY NSRCT ("RCT" alone can be misread as randomized controlled trial) -------------------------------------------------
    let y0 = Y.s1;
    nameRow(y0, 'PRIMARY NSRCT', 'rct', 0.3, 4.0, 0.035);
    setChars(charRow('big', SX, y0 + 62, 3), 0.5, '82%', NUM);          // the first figure spins inside the first second
    chips(SX, y0 + 202, ['STRICT', 'POOLED', '1 YR+'], 1.3);
    source(SX, y0 + 254, 'BURNS 2022 · INT ENDOD J', 1.7);
    setChars(charRow('big', VX, y0 + 62, 3), 2.3, '97%', NUM);
    chips(VX, y0 + 202, ['RETAINED', '8 YR', '1.46M TEETH'], 3.1);
    source(VX, y0 + 254, 'SALEHRABI 2004 · J ENDOD', 3.5);

    // ---- modifier 1 · apical lesion at the start --------------------------
    const my = Y.m1, la = my + 12, lb = my + 66;
    tiles.push({ x: 82, y: la, s: 48, icon: 'lesion', on: 4.3 });
    const qt = 'APICAL LESION AT START?';
    const q = wordFlap('chip', 140, la, wordW('chip', qt)); setWord(q, 4.4, qt, { color: COL.amber });
    let x = 140;
    const no = wordFlap('tag', x, lb, wordW('tag', 'NO')); setWord(no, 5.45, 'NO', { color: COL.amber }); x += no.w + 10;
    setChars(charRow('mid', x, lb, 4), 5.55, '>96%', { stagger: 0.1, n: 4, grow: 1, step: 0.085 }); x += 4 * 62 - 4 + 36;
    const yes = wordFlap('tag', x, lb, wordW('tag', 'YES')); setWord(yes, 6.45, 'YES', { color: COL.amber }); x += yes.w + 10;
    setChars(charRow('mid', x, lb, 3), 6.55, '86%', { stagger: 0.1, n: 4, grow: 1, step: 0.085 });
    const cEnd = chips(q.x + q.w + 10, la, ['SUCCESS', '8–10 YR'], 4.75);
    const st = 'SJÖGREN 1990 · J ENDOD', sw = wordW('src', st);
    source(1008 - sw, la + 8, st, 5.1);
    if (cEnd > 1008 - sw - 10) warn.push('M1: chips collide with the source');
    lamps.push({ x: 1001, y: lb + 38, r: 9, on: 4.3, steady: 7.7, ph: 0 });

    // ---- 2 · RETREATMENT --------------------------------------------------
    y0 = Y.s2;
    nameRow(y0, 'RETREATMENT', 'retx', 8.0, 12.0, 0.04);
    setChars(charRow('big', SX, y0 + 62, 3), 8.4, '77%', NUM);
    chips(SX, y0 + 202, ['STRICT', 'POOLED', '6 MO+'], 9.2);
    source(SX, y0 + 254, 'NG 2008 · INT ENDOD J', 9.6);
    setChars(charRow('big', VX, y0 + 62, 3), 10.2, '89%', NUM);
    chips(VX, y0 + 202, ['RETAINED', '5 YR', '4,744 TEETH'], 11.0);
    source(VX, y0 + 254, 'SALEHRABI 2010 · J ENDOD', 11.4);

    // ---- 3 · APICAL SURGERY (traditional, then modifier 2: microsurgery) ---
    y0 = Y.s3;
    nameRow(y0, 'APICAL SURGERY', 'surg', 12.2, 17.5, 0.04);
    tiles.push({ x: SX, y: y0 + 62, s: 48, icon: 'micro', on: 15.9 });
    const bigLab = wordFlap('chip', SX + 54, y0 + 62, wordW('chip', 'TRADITIONAL', 'MICROSURGERY'));
    setWord(bigLab, 12.55, 'TRADITIONAL', { color: COL.amber });
    setWord(bigLab, 16.0, 'MICROSURGERY', { color: COL.amber, n: 3 });
    const big = charRow('big', SX, y0 + 116, 3);
    setChars(big, 12.65, '59%', NUM);                                   // settled 13.4 to 16.05
    setChars(big, 16.05, '94%', NUM);
    // the traditional figure moves aside: its small dim slot starts turning just before the big flaps leave
    setWord(wordFlap('chip', DX, y0 + 62, wordW('chip', 'TRADITIONAL')), 15.85, 'TRADITIONAL', { color: COL.dimAmber });
    setChars(charRow('sm', DX, y0 + 116, 3), 15.85, '59%', { stagger: 0.08, n: 2, grow: 1, step: 0.08, color: COL.dim });
    // SURVIVAL cell of this row: no verified pooled figure -> a dim "not posted" placeholder (dashes, no digits, no words)
    setChars(charRow('big', VX, y0 + 116, 3), 16.9, '––%', { stagger: 0.08, n: 2, grow: 0, step: 0.1, color: COL.dim, plain: true });
    chips(SX, y0 + 256, ['SUCCESS', 'POOLED', '6 MO+'], 13.4);
    source(SX, y0 + 308, 'SETZER 2010 · J ENDOD', 13.8);

    // ---- footer ------------------------------------------------------------
    const ft = 'SUCCESS ' + NEQ + ' SURVIVAL · NOT HEAD-TO-HEAD';
    setWord(wordFlap('chip', SX, Y.foot, wordW('chip', ft)), 17.1, ft, { color: COL.soft });

    // ---- loop: everything turns back to blank ------------------------------
    for (const u of units) {
      const last = u.events.length ? u.events[u.events.length - 1].seq.slice(-1)[0] : BLANK;
      if (!last.text) continue;
      u.live = true;
      // the digits and the '%' of a figure leave in the same frame, so no frame of the wipe can show a figure that is not on the board
      const num = u.char && u.cls !== 'name';
      const tc = T_CLEAR + clamp((u.y - 400) / 1200) * 0.15 + (num ? 0.03 : hash(u.id, 99) * 0.04);
      flip(u, tc, BLANK, num ? 2 : 1, 0.09);
    }
    // ---- layout guard (prints as a console warning in the render tool) -----
    for (const u of units) {
      if (!u.live) continue;
      const r = u.x + u.w, b = u.y + u.h;
      if (u.x < 64 || r > 1016 || u.y < 230 || b > 1580) warn.push(`unit ${u.id} (${u.cls}) outside safe area: x ${u.x}-${r}, y ${u.y}-${b}`);
      if (b > 1095 && r > 958) warn.push(`unit ${u.id} (${u.cls}) in the button column: x ${u.x}-${r}, y ${u.y}-${b}`);
    }
    if (warn.length) console.warn('LAYOUT: ' + warn.join(' | '));
  }

  function stateOf(u, t) {
    let cur = BLANK;
    for (const e of u.events) {
      if (t < e.t) break;
      const f = (t - e.t) / e.step, k = Math.floor(f);
      if (k >= e.seq.length) { cur = e.seq[e.seq.length - 1]; continue; }
      return { a: k === 0 ? cur : e.seq[k - 1], b: e.seq[k], p: f - k };
    }
    return { a: cur, b: null, p: 0 };
  }

  function drawUnit(u, t) {
    const k = CLS[u.cls], st = stateOf(u, t), x = u.x, y = u.y, w = u.w, h = u.h, hh = h / 2;
    const A = getCard(u.cls, w, st.a.text, st.a.color, u.char);
    if (!st.b) ctx.drawImage(A, x, y);
    else {
      const B = getCard(u.cls, w, st.b.text, st.b.color, u.char), p = Math.pow(st.p, 1.15);
      ctx.drawImage(B, 0, 0, w, hh, x, y, w, hh);              // upper leaf of the next card, already in place
      ctx.drawImage(A, 0, hh, w, hh, x, y + hh, w, hh);        // lower leaf of the old card, still hanging
      if (p < 0.5) {                                           // old upper leaf falls forward
        const s = Math.cos(p * Math.PI), dh = Math.max(0.6, hh * s);
        ctx.fillStyle = `rgba(0,0,0,${0.34 * (1 - s)})`; ctx.fillRect(x, y + hh, w, hh * (1 - s * 0.6));
        ctx.drawImage(A, 0, 0, w, hh, x, y + hh - dh, w, dh);
        ctx.fillStyle = `rgba(255,255,255,${0.10 * (1 - s)})`; ctx.fillRect(x, y + hh - dh, w, dh);
      } else {                                                 // its back (the next lower leaf) swings down
        const s = Math.sin((p - 0.5) * Math.PI), dh = Math.max(0.6, hh * s);
        ctx.fillStyle = `rgba(0,0,0,${0.30 * (1 - s)})`; ctx.fillRect(x, y + hh, w, hh);
        ctx.drawImage(B, 0, hh, w, hh, x, y + hh, w, dh);
        ctx.fillStyle = `rgba(0,0,0,${0.55 * (1 - s)})`; ctx.fillRect(x, y + hh, w, dh);
      }
    }
    if (u.tone > 0.004) { ctx.fillStyle = `rgba(0,0,0,${u.tone})`; ctx.fillRect(x, y, w, h); }
    // hinge + axle pins
    ctx.fillStyle = `rgba(0,0,0,${k.ha || 0.92})`; ctx.fillRect(x, y + hh - k.hinge / 2, w, k.hinge);
    ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.fillRect(x, y + hh + k.hinge / 2, w, 1);
    ctx.fillStyle = '#030303';
    ctx.fillRect(x - 1, y + hh - k.pin[1] / 2, k.pin[0], k.pin[1]); ctx.fillRect(x + w - k.pin[0] + 1, y + hh - k.pin[1] / 2, k.pin[0], k.pin[1]);
  }

  // ---------------------------------------------------------------- pictograms (original, signage style)
  function tooth(g, x, y, s) {
    const X = (u) => x + u * s, Yv = (v) => y + v * s;
    g.beginPath();
    g.moveTo(X(.17), Yv(.30));
    g.bezierCurveTo(X(.17), Yv(.09), X(.37), Yv(.05), X(.50), Yv(.14));
    g.bezierCurveTo(X(.63), Yv(.05), X(.83), Yv(.09), X(.83), Yv(.30));
    g.bezierCurveTo(X(.83), Yv(.48), X(.77), Yv(.56), X(.74), Yv(.70));
    g.bezierCurveTo(X(.72), Yv(.82), X(.70), Yv(.95), X(.64), Yv(.95));
    g.bezierCurveTo(X(.58), Yv(.95), X(.58), Yv(.70), X(.50), Yv(.62));
    g.bezierCurveTo(X(.42), Yv(.70), X(.42), Yv(.95), X(.36), Yv(.95));
    g.bezierCurveTo(X(.30), Yv(.95), X(.28), Yv(.82), X(.26), Yv(.70));
    g.bezierCurveTo(X(.23), Yv(.56), X(.17), Yv(.48), X(.17), Yv(.30));
    g.closePath();
  }
  function icon(g, name, x, y, s, cut) {
    const X = (u) => x + u * s, Yv = (v) => y + v * s;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.fillStyle = COL.icon; g.strokeStyle = COL.icon;
    if (name === 'tooth') { tooth(g, x, y, s); g.fill(); }
    else if (name === 'rct') {
      tooth(g, x, y, s); g.fill();
      g.strokeStyle = cut; g.fillStyle = cut; g.lineWidth = s * 0.06;
      rr(g, X(.36), Yv(.25), s * .28, s * .13, s * .05); g.fill();
      g.beginPath(); g.moveTo(X(.41), Yv(.34)); g.lineTo(X(.365), Yv(.82)); g.moveTo(X(.59), Yv(.34)); g.lineTo(X(.635), Yv(.82)); g.stroke();
    } else if (name === 'retx') {
      tooth(g, x, y, s); g.fill();
      g.strokeStyle = cut; g.fillStyle = cut; g.lineWidth = s * 0.065;
      const cx = X(.5), cy = Yv(.36), r = s * .16;
      g.beginPath(); g.arc(cx, cy, r, -Math.PI * 0.25, Math.PI * 1.25); g.stroke();
      const ax = cx + r * Math.cos(-Math.PI * 0.25), ay = cy + r * Math.sin(-Math.PI * 0.25);
      g.beginPath(); g.moveTo(ax + s * .10, ay + s * .015); g.lineTo(ax - s * .045, ay - s * .075); g.lineTo(ax - s * .04, ay + s * .085); g.closePath(); g.fill();
    } else if (name === 'surg') {
      // root-end resection: the right root is cut on a bevel and its tip sits just below the cut
      g.save(); g.beginPath(); g.rect(x - s, y - s, s * 3, s * 3);
      g.moveTo(X(.52), Yv(.78)); g.lineTo(X(.86), Yv(.64)); g.lineTo(X(.86), Yv(1.05)); g.lineTo(X(.52), Yv(1.05)); g.closePath();
      g.clip('evenodd'); tooth(g, x, y - s * 0.03, s); g.fill(); g.restore();
      g.beginPath(); g.moveTo(X(.60), Yv(.865)); g.lineTo(X(.775), Yv(.795));
      g.quadraticCurveTo(X(.76), Yv(.985), X(.675), Yv(.985)); g.quadraticCurveTo(X(.615), Yv(.975), X(.60), Yv(.865)); g.closePath(); g.fill();
    } else if (name === 'lesion') {
      const sc = 0.84, ox = x + s * 0.02, oy = y - s * 0.02;
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = s * 0.06;
      g.beginPath(); g.arc(ox + .64 * s * sc, oy + .93 * s * sc, s * .17, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = COL.icon; tooth(g, ox, oy, s * sc); g.fill();
    } else if (name === 'micro') {
      g.lineWidth = s * 0.09;
      rr(g, X(.20), Yv(.82), s * .60, s * .09, s * .04); g.fill();                       // foot
      g.beginPath(); g.moveTo(X(.66), Yv(.84)); g.bezierCurveTo(X(.86), Yv(.66), X(.82), Yv(.36), X(.62), Yv(.30)); g.stroke();   // arm
      g.lineCap = 'butt'; g.lineWidth = s * 0.17;
      g.beginPath(); g.moveTo(X(.36), Yv(.17)); g.lineTo(X(.50), Yv(.56)); g.stroke();   // body tube
      g.lineWidth = s * 0.10;
      g.beginPath(); g.moveTo(X(.315), Yv(.06)); g.lineTo(X(.36), Yv(.18)); g.stroke(); // eyepiece
      g.beginPath(); g.moveTo(X(.50), Yv(.56)); g.lineTo(X(.525), Yv(.63)); g.stroke(); // objective
      g.lineWidth = s * 0.06;
      g.beginPath(); g.moveTo(X(.30), Yv(.70)); g.lineTo(X(.70), Yv(.70)); g.stroke();   // stage
    }
    g.restore();
  }
  function tile(g, x, y, s, name, lit) {
    const c = Kit.mix('#2a2213', '#ffb629', lit), fill = Kit.rgba(c, 1);
    g.save();
    if (lit > 0.02) { g.shadowColor = `rgba(255,170,30,${0.5 * lit})`; g.shadowBlur = 18 * lit; }
    rr(g, x, y, s, s, s * 0.17); g.fillStyle = fill; g.fill();
    g.shadowBlur = 0; g.shadowColor = 'transparent';
    const hg = g.createLinearGradient(0, y, 0, y + s);
    hg.addColorStop(0, `rgba(255,255,255,${0.20 * lit + 0.03})`); hg.addColorStop(0.5, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(0,0,0,0.16)');
    rr(g, x, y, s, s, s * 0.17); g.fillStyle = hg; g.fill();
    icon(g, name, x + s * 0.06, y + s * 0.06, s * 0.88, fill);
    g.restore();
  }

  // ---------------------------------------------------------------- static layers
  let bg, fg;
  const CLOCK = { x: 956, y: 293, r: 50 };
  function buildBg() {
    bg = document.createElement('canvas'); bg.width = W; bg.height = H;
    const g = bg.getContext('2d');
    // concourse behind the board
    const hall = g.createLinearGradient(0, 0, 0, H);
    hall.addColorStop(0, '#0d1015'); hall.addColorStop(0.12, '#090b0e'); hall.addColorStop(0.85, '#07080a'); hall.addColorStop(1, '#0c0d10');
    g.fillStyle = hall; g.fillRect(0, 0, W, H);
    const rnd = Kit.rng(2511);
    const bokeh = (n, y0, y1) => {
      for (let i = 0; i < n; i++) {
        const x = rnd() * W, y = lerp(y0, y1, rnd()), r = 14 + rnd() * 46, warm = rnd() < 0.6;
        const c = warm ? [255, 186, 80] : [190, 205, 230], a = 0.05 + rnd() * 0.09;
        const rg = g.createRadialGradient(x, y, r * 0.2, x, y, r);
        rg.addColorStop(0, `rgba(${c},${a})`); rg.addColorStop(0.8, `rgba(${c},${a * 0.7})`); rg.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    };
    bokeh(16, 10, 170); bokeh(18, 1660, 1900);
    // floor glow under the board
    const fl = g.createRadialGradient(540, 1640, 20, 540, 1640, 620);
    fl.addColorStop(0, 'rgba(255,176,50,0.13)'); fl.addColorStop(1, 'rgba(255,176,50,0)');
    g.save(); g.translate(0, 1640); g.scale(1, 0.34); g.translate(0, -1640); g.fillStyle = fl; g.fillRect(0, 900, W, 1500); g.restore();
    // hanger rods
    for (const hx of [236, 844]) {
      const rg = g.createLinearGradient(hx - 9, 0, hx + 9, 0);
      rg.addColorStop(0, '#16171a'); rg.addColorStop(0.35, '#55585e'); rg.addColorStop(0.6, '#2c2e32'); rg.addColorStop(1, '#101113');
      g.fillStyle = rg; g.fillRect(hx - 9, 0, 18, 200);
      g.fillStyle = '#1c1d20'; rr(g, hx - 30, 170, 60, 34, 5); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(hx - 28, 171, 56, 1.5);
    }
    // housing
    const FX = 22, FY = 190, FW = 1036, FH = 1418;
    g.save(); g.shadowColor = 'rgba(0,0,0,0.75)'; g.shadowBlur = 50; g.shadowOffsetY = 18;
    const fr = g.createLinearGradient(0, FY, 0, FY + FH);
    fr.addColorStop(0, '#565a60'); fr.addColorStop(0.03, '#34373b'); fr.addColorStop(0.5, '#25272a'); fr.addColorStop(0.97, '#1b1c1f'); fr.addColorStop(1, '#3a3d41');
    rr(g, FX, FY, FW, FH, 18); g.fillStyle = fr; g.fill(); g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1.5; rr(g, FX + 1, FY + 1, FW - 2, FH - 2, 17); g.stroke();
    // matte panel
    const PX = FX + 12, PY = FY + 12, PW = FW - 24, PH = FH - 24;
    rr(g, PX, PY, PW, PH, 9); g.fillStyle = '#0d0e0f'; g.fill();
    g.save(); rr(g, PX, PY, PW, PH, 9); g.clip();
    const nz = document.createElement('canvas'); nz.width = nz.height = 192;
    const ng = nz.getContext('2d'), id = ng.createImageData(192, 192), nr = Kit.rng(77);
    for (let i = 0; i < id.data.length; i += 4) { const v = nr(); id.data[i] = id.data[i + 1] = id.data[i + 2] = v < 0.5 ? 0 : 255; id.data[i + 3] = Math.floor(nr() * 9); }
    ng.putImageData(id, 0, 0);
    g.fillStyle = g.createPattern(nz, 'repeat'); g.fillRect(PX, PY, PW, PH);
    const top = g.createLinearGradient(0, PY, 0, PY + 420);
    top.addColorStop(0, 'rgba(255,255,255,0.05)'); top.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = top; g.fillRect(PX, PY, PW, 420);
    g.strokeStyle = 'rgba(0,0,0,0.9)'; g.lineWidth = 6; rr(g, PX, PY, PW, PH, 9); g.stroke();
    g.restore();
    // corner screws
    for (const [sx, sy] of [[FX + 6, FY + 6], [FX + FW - 6, FY + 6], [FX + 6, FY + FH - 6], [FX + FW - 6, FY + FH - 6]]) {
      g.fillStyle = '#17181a'; g.beginPath(); g.arc(sx, sy, 3.2, 0, Math.PI * 2); g.fill();
    }

    // ---- printed header --------------------------------------------------
    tile(g, SX, 244, 100, 'tooth', 1);
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.font = '700 82px Oswald'; g.letterSpacing = '2px'; g.fillStyle = COL.ink;
    g.fillText('ENDO OUTCOMES', 188, 309);
    g.font = BC(600, 35); g.letterSpacing = '6.5px'; g.fillStyle = COL.amber;
    g.fillText('NUMBERS TO KNOW', 190, 345);
    g.letterSpacing = '0px';
    // clock dial (the amber hand makes one turn per loop)
    const { x: cx, y: cy, r: cr } = CLOCK;
    const bz = g.createLinearGradient(0, cy - cr, 0, cy + cr); bz.addColorStop(0, '#7a7e85'); bz.addColorStop(1, '#2a2c2f');
    g.fillStyle = bz; g.beginPath(); g.arc(cx, cy, cr, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ece7d9'; g.beginPath(); g.arc(cx, cy, cr - 5, 0, Math.PI * 2); g.fill();
    const dsh = g.createRadialGradient(cx, cy - 10, cr * 0.2, cx, cy, cr - 5); dsh.addColorStop(0, 'rgba(0,0,0,0)'); dsh.addColorStop(1, 'rgba(0,0,0,0.20)');
    g.fillStyle = dsh; g.beginPath(); g.arc(cx, cy, cr - 5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#141416'; g.lineCap = 'butt';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, major = i % 3 === 0;
      g.lineWidth = major ? 4 : 2.2;
      g.beginPath(); g.moveTo(cx + Math.sin(a) * (cr - 9), cy - Math.cos(a) * (cr - 9)); g.lineTo(cx + Math.sin(a) * (cr - (major ? 20 : 16)), cy - Math.cos(a) * (cr - (major ? 20 : 16))); g.stroke();
    }

    // ---- column heads ------------------------------------------------------
    g.font = BC(600, 36); g.letterSpacing = '5px';
    for (const [hx, label] of [[SX, 'SUCCESS'], [VX, 'SURVIVAL']]) {
      g.fillStyle = COL.amber; g.beginPath(); g.moveTo(hx, Y.colh - 23); g.lineTo(hx + 18, Y.colh - 23); g.lineTo(hx + 9, Y.colh - 8); g.closePath(); g.fill();
      g.fillStyle = '#ece6d6'; g.fillText(label, hx + 28, Y.colh - 1);
      g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(hx, Y.colh + 6, 394, 2);
    }
    g.letterSpacing = '0px';

    // ---- modifier strip: inset remark panel hanging off row 1 --------------
    g.save();
    rr(g, SX, Y.m1, 952, 154, 8); g.fillStyle = '#151618'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = COL.amber; rr(g, SX, Y.m1 + 10, 5, 134, 2.5); g.fill();
    g.restore();
    // row rules
    g.fillStyle = 'rgba(255,255,255,0.07)';
    for (const ry of [Y.s2 - 12, Y.s3 - 12, Y.foot - 12]) g.fillRect(SX, ry, 952, 1.5);

    // ---- wells behind every flap -------------------------------------------
    for (const u of units) {
      const k = CLS[u.cls];
      rr(g, u.x - 2, u.y - 2, u.w + 4, u.h + 4, k.r + 2); g.fillStyle = '#040405'; g.fill();
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(u.x + k.r, u.y + u.h + 1.5, u.w - 2 * k.r, 1);
    }
    // handle, printed on the bottom rail of the panel
    g.font = BC(500, 28); g.letterSpacing = '1.6px'; g.textAlign = 'right'; g.fillStyle = 'rgba(244,239,225,0.62)';
    g.fillText('@natebrooksendo', 952, Y.foot + 33);
    g.letterSpacing = '0px'; g.textAlign = 'left';
  }
  function buildFg() {
    fg = document.createElement('canvas'); fg.width = W; fg.height = H;
    const g = fg.getContext('2d');
    // glass sheen
    g.save(); rr(g, 34, 202, 1012, 1394, 9); g.clip();
    const sh = g.createLinearGradient(0, 200, 700, 1300);
    sh.addColorStop(0, 'rgba(255,255,255,0.045)'); sh.addColorStop(0.28, 'rgba(255,255,255,0.012)'); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.restore();
    // vignette
    const v = g.createRadialGradient(540, 900, 520, 540, 900, 1250);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.42)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }

  // ---------------------------------------------------------------- dynamic bits
  const off = (t) => 1 - seg(t, T_CLEAR, T_CLEAR + 0.45, ease.smooth);
  function drawLamp(l, t) {
    let lvl = 0;
    if (t >= l.on) {
      const pulse = 0.5 + 0.5 * (0.5 - 0.5 * Math.cos((t - l.on) * Math.PI * 2 * 1.1 + l.ph * Math.PI * 2));
      lvl = seg(t, l.on, l.on + 0.3, ease.smooth) * lerp(pulse, 1, seg(t, l.steady - 0.6, l.steady, ease.smooth)) * off(t);
    }
    const { x, y, r } = l;
    ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.fill();
    const c = Kit.mix('#33240a', '#ffb629', lvl);
    const lg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    lg.addColorStop(0, Kit.rgba(Kit.mix(c, '#fff3cf', 0.25 + 0.5 * lvl), 1)); lg.addColorStop(1, Kit.rgba(c, 1));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (lvl > 0.02) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gg = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 4.2);
      gg.addColorStop(0, `rgba(255,170,40,${0.34 * lvl})`); gg.addColorStop(1, 'rgba(255,170,40,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  // house lights: the section being filled stays lit, the rest of the board sits slightly in shadow until the end
  const FOCUS = [[0.3, Y.s1 - 10, Y.s1 + 296], [4.3, Y.m1 - 2, Y.m1 + 156], [8.0, Y.s2 - 10, Y.s2 + 296], [12.2, Y.s3 - 10, Y.s3 + 350]];
  function drawFocus(t) {
    const k = seg(t, 0.3, 1.1, ease.smooth) * (1 - seg(t, 17.1, 18.0, ease.smooth));
    if (k < 0.003) return;
    let y0 = FOCUS[0][1], y1 = FOCUS[0][2];
    for (let i = 1; i < FOCUS.length; i++) {
      const u = seg(t, FOCUS[i][0] - 0.2, FOCUS[i][0] + 0.5, ease.inOut);
      y0 = lerp(y0, FOCUS[i][1], u); y1 = lerp(y1, FOCUS[i][2], u);
    }
    const T = 402, B = 1596, F = 56, A = 0.32 * k;
    const a = (y) => A * clamp(Math.max((y0 - y) / F, (y - y1) / F));
    const g = ctx.createLinearGradient(0, T, 0, B);
    for (const y of [T, y0 - F, y0, y1, y1 + F, B]) { const yy = clamp(y, T, B); g.addColorStop((yy - T) / (B - T), `rgba(0,0,0,${a(yy).toFixed(4)})`); }
    ctx.fillStyle = g; ctx.fillRect(34, T, 1012, B - T);
  }
  // one slow pass of light across the glass once the board is complete
  function drawSheen(t) {
    const u = seg(t, 18.2, 20.4);
    if (u <= 0 || u >= 1) return;
    const cx = lerp(-260, 1340, ease.inOut(u)), a = 0.075 * Math.sin(Math.PI * u);
    ctx.save(); rr(ctx, 34, 202, 1012, 1394, 9); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    ctx.transform(1, 0, -0.32, 1, 0, 0);
    const g = ctx.createLinearGradient(cx - 170 + 290, 0, cx + 170 + 290, 0);
    g.addColorStop(0, 'rgba(255,236,200,0)'); g.addColorStop(0.5, `rgba(255,236,200,${a.toFixed(4)})`); g.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = g; ctx.fillRect(-400, 150, 2400, 1500);
    ctx.restore();
  }
  function drawClock(t) {
    const { x, y, r } = CLOCK;
    const hand = (a, len, wd, col, tail = 0) => {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(x - Math.sin(a) * tail, y + Math.cos(a) * tail); ctx.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); ctx.stroke();
    };
    hand((10.15 / 12) * Math.PI * 2, r * 0.48, 6, '#141416', 6);
    hand((9 / 60) * Math.PI * 2, r * 0.70, 4.5, '#141416', 7);
    hand((t / D) * Math.PI * 2, r * 0.76, 2.4, '#d98a00', 12);
    ctx.fillStyle = '#d98a00'; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();
  }

  window.REEL = {
    title: 'Endo outcome numbers — split-flap board',
    duration: D,
    poster: 21.4,
    canvas,
    fonts: ['700 82px Oswald', '700 132px "Barlow Condensed"', '600 46px "Barlow Condensed"', '500 24px "Barlow Condensed"'],
    async setup() {
      const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%>+·–,.?@ö-=';
      await Promise.all(REEL.fonts.map((f) => document.fonts.load(f, glyphs).catch(() => {})));
      await document.fonts.ready;
      build(); buildBg(); buildFg();
    },
    render(t) {
      t = ((t % D) + D) % D;
      ctx.drawImage(bg, 0, 0);
      for (const tl of tiles) tile(ctx, tl.x, tl.y, tl.s, tl.icon, seg(t, tl.on, tl.on + 0.45, ease.smooth) * off(t));
      for (const u of units) drawUnit(u, t);
      drawFocus(t);
      for (const l of lamps) drawLamp(l, t);
      drawClock(t);
      drawSheen(t);
      ctx.drawImage(fg, 0, 0);
    },
  };
  Kit.boot(REEL);
})();
