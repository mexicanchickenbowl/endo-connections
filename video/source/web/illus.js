/* Illustration module: occlusal dental arches, molar cross-section, head profile. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#151413";
  function E(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  // Catmull-Rom -> cubic Bezier. points: [x,y] or [x,y,'c'] for a sharp corner.
  function cr(pts, closed = true, k = 1 / 6) {
    const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const t1 = p1[2] === 'c' ? [0, 0] : [(p2[0] - p0[0]) * k, (p2[1] - p0[1]) * k];
      const t2 = p2[2] === 'c' ? [0, 0] : [(p3[0] - p1[0]) * k, (p3[1] - p1[1]) * k];
      d += ` C${(p1[0] + t1[0]).toFixed(1)},${(p1[1] + t1[1]).toFixed(1)} ${(p2[0] - t2[0]).toFixed(1)},${(p2[1] - t2[1]).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + (closed ? 'Z' : '');
  }
  let seed = 11; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  function grad(defs, id, stops, type = 'linear', attrs = {}) {
    const g = E(type === 'linear' ? 'linearGradient' : 'radialGradient', Object.assign({ id }, type === 'linear' ? { x1: 0, y1: 0, x2: 0, y2: 1 } : {}, attrs), defs);
    stops.forEach(([o, c, op]) => E('stop', { offset: o, 'stop-color': c, 'stop-opacity': op == null ? 1 : op }, g)); return g;
  }

  /* ================= OCCLUSAL ARCHES (viewBox 1200x560) ================= */
  function buildArch(svg) {
    const uid = 'oa' + Math.floor(rnd() * 1e6);
    const defs = E('defs', {}, svg);
    grad(defs, uid + 't', [[0, '#FFFFFF'], [.62, '#F8F2E6'], [1, '#E2D5BC']], 'radial', { cx: .45, cy: .4, r: .65 });
    grad(defs, uid + 'g', [[0, '#EE9C93'], [1, '#D77870']]);
    const W = [50, 41, 46, 41, 41, 62, 57, 50], D = [30, 29, 41, 46, 46, 60, 57, 53], T = ['I', 'I', 'C', 'P', 'P', 'M', 'M', 'M'];
    const teeth = {}, groups = {};
    // half-arch centerline (viewer's right side), incisors at (600,0)
    const half = [[600, 0], [700, 9], [775, 36], [820, 77], [848, 120], [870, 165], [886, 204]];
    function sampler(pts) { // dense polyline + cumulative length
      const tmp = E('path', { d: cr(pts, false) }, svg); const L = tmp.getTotalLength(); const f = s => tmp.getPointAtLength(Math.min(L, s)); return { L, f, rm: () => tmp.remove() };
    }
    function shape(type, w, d) {
      if (type === 'I') return [[-w / 2, -d * .1], [-w * .34, -d * .48], [0, -d * .56], [w * .34, -d * .48], [w / 2, -d * .1], [w * .26, d * .32], [0, d * .5], [-w * .26, d * .32]];
      if (type === 'C') return [[-w / 2, 0], [-w * .3, -d * .42], [0, -d * .52], [w * .3, -d * .42], [w / 2, 0], [w * .28, d * .38], [0, d * .5], [-w * .28, d * .38]];
      if (type === 'P') return [[-w / 2, 0], [-w * .38, -d * .42], [0, -d * .52], [w * .38, -d * .42], [w / 2, 0], [w * .36, d * .4], [0, d * .5], [-w * .36, d * .4]];
      return [[-w / 2, -d * .06], [-w * .42, -d * .42], [-w * .08, -d * .52], [w * .22, -d * .5], [w * .45, -d * .38], [w / 2, d * .02], [w * .44, d * .4], [w * .12, d * .52], [-w * .2, d * .5], [-w * .45, d * .36]];
    }
    function details(g, type, w, d, lower) {
      const gs = { stroke: '#B7A47F', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' };
      if (type === 'I') E('path', Object.assign({ d: `M${-w * .38},${-d * .2} Q0,${-d * .34} ${w * .38},${-d * .2}` }, gs), g);
      else if (type === 'C') { E('path', Object.assign({ d: `M${-w * .36},${-d * .05} L0,${-d * .18} L${w * .36},${-d * .05} M0,${-d * .18} L0,${d * .32}` }, gs), g); }
      else if (type === 'P') { E('path', Object.assign({ d: `M${-w * .3},${d * .02} Q0,${d * .1} ${w * .3},${d * .02}` }, gs), g); [-.3, .3].forEach(x => E('circle', { cx: w * x, cy: d * .02, r: 2.4, fill: '#B7A47F' }, g)); }
      else {
        E('path', Object.assign({ d: `M${-w * .36},${d * .02} L${-w * .12},${-d * .04} L${w * .1},${d * .06} L${w * .36},${d * .0}` }, gs), g);
        E('path', Object.assign({ d: `M${-w * .02},${-d * .02} L${-w * .04},${-d * .44}` }, gs), g);
        E('path', Object.assign({ d: `M${w * .06},${d * .06} L${w * .08},${d * .46}` }, gs), g);
        if (lower) E('path', Object.assign({ d: `M${w * .24},${d * .02} L${w * .32},${-d * .36}` }, gs), g);
        [[-w * .26, -d * .22], [w * .16, -d * .24], [-w * .24, d * .26], [w * .22, d * .26]].forEach(([x, y]) => E('ellipse', { cx: x, cy: y, rx: w * .12, ry: d * .1, fill: '#FFFFFF', opacity: .55 }, g));
      }
    }
    for (const jaw of ['U', 'L']) {
      const G = E('g', {}, svg); groups[jaw] = G;
      const y0 = jaw === 'U' ? 16 : 544, sy = jaw === 'U' ? 1 : -1;
      const pts = half.map(([x, y]) => [x, y0 + sy * y]);
      const full = pts.slice().reverse().map(([x, y]) => [1200 - x, y]).concat(pts.slice(1));
      // palate or tongue
      if (jaw === 'U') {
        E('path', { d: cr(full, false) + ` Q600,${y0 + sy * 150} ${full[0][0]},${full[0][1]} Z`, fill: '#F2B0A6' }, G);
        E('path', { d: `M600,${y0 + 40} L600,${y0 + 200}`, stroke: '#D98A80', 'stroke-width': 3, 'stroke-dasharray': '1 9', 'stroke-linecap': 'round' }, G);
        for (let r = 0; r < 3; r++) for (const s of [-1, 1]) E('path', { d: `M${600 + s * 14},${y0 + 58 + r * 26} q${s * 22},${-8} ${s * 40},${4} q${s * 14},${6} ${s * 30},${-2}`, stroke: '#D98A80', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, G);
      } else {
        E('path', { d: cr([[600, y0 - 66], [700, y0 - 92], [752, y0 - 146], [736, y0 - 196], [600, y0 - 214], [464, y0 - 196], [448, y0 - 146], [500, y0 - 92]]), fill: '#DE7C76', stroke: '#B65952', 'stroke-width': 3 }, G);
        E('path', { d: `M600,${y0 - 86} L600,${y0 - 200}`, stroke: '#B65952', 'stroke-width': 4, 'stroke-linecap': 'round' }, G);
      }
      // gum band
      const gd = cr(full, false);
      E('path', { d: gd, fill: 'none', stroke: INK, 'stroke-width': 104, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
      E('path', { d: gd, fill: 'none', stroke: `url(#${uid}g)`, 'stroke-width': 96, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
      E('path', { d: gd, fill: 'none', stroke: '#F4B4AB', 'stroke-width': 3, opacity: .7, transform: `translate(0,${sy * -26})` }, G);
      // teeth along each side
      for (const side of [-1, 1]) {
        const sp = sampler(side > 0 ? pts : pts.map(([x, y]) => [1200 - x, y]));
        let s = 2;
        for (let i = 0; i < 8; i++) {
          const w = W[i], d = D[i]; const mid = s + w / 2;
          const p = sp.f(mid), a = sp.f(mid - 2), b = sp.f(mid + 2);
          let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
          // local +y must point toward the arch interior (lingual)
          const tx = b.x - a.x, ty = b.y - a.y; const nx = -ty, ny = tx; // left normal
          const toC = (600 - p.x) * nx + ((jaw === 'U' ? y0 + 130 : y0 - 130) - p.y) * ny;
          const flip = toC < 0 ? -1 : 1;
          const g = E('g', { transform: `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(1,${flip})` }, G);
          const shp = shape(T[i], w, d);
          const path = E('path', { d: cr(shp), fill: `url(#${uid}t)`, stroke: INK, 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, g);
          details(g, T[i], w, d, jaw === 'L');
          const id = jaw + (side < 0 ? 'R' : 'L') + (i + 1);
          teeth[id] = { p: path, g, x: p.x, y: p.y, w, h: d };
          s += w + 3;
        }
        sp.rm();
      }
    }
    teeth._groups = groups;
    return teeth;
  }

  /* ================= MOLAR CROSS-SECTION (viewBox 600x960) ================= */
  function buildTooth(svg) {
    const defs = E('defs', {}, svg);
    // shorten roots (y below CEJ scaled) and splay them apart below the furcation
    const RT = ([x, y, c]) => { if (y <= 340) return c ? [x, y, c] : [x, y]; const ny = 340 + (y - 340) * 0.74; const div = y > 440 ? Math.min(1, (y - 440) / 360) * 16 * (x < 300 ? -1 : 1) : 0; return c ? [x + div, ny, c] : [x + div, ny]; };
    grad(defs, 'enG', [[0, '#FFFFFF'], [.7, '#F6F0E3'], [1, '#E6DAC2']]);
    grad(defs, 'deG', [[0, '#F9EDD2'], [1, '#E9D3A6']]);
    grad(defs, 'puG', [[0, '#F7A08F'], [.6, '#E46A59'], [1, '#C4473A']], 'radial', { cx: .5, cy: .25, r: .8 });
    grad(defs, 'boG', [[0, '#E8DABF'], [1, '#DCC8A4']]);
    grad(defs, 'gmG', [[0, '#EFA39A'], [1, '#D9776F']]);
    const crown = [[172, 332], [160, 292], [151, 248], [150, 208], [157, 176], [174, 152], [198, 134], [226, 124], [250, 133], [274, 153], [300, 166], [326, 153], [350, 135], [374, 125], [402, 134], [426, 152], [443, 176], [450, 208], [449, 248], [440, 292], [428, 332]];
    const distalRoot = [[432, 400], [434, 480], [430, 570], [422, 660], [410, 740], [398, 790], [384, 806], [368, 800], [360, 760], [354, 680], [348, 590], [340, 510], [328, 456], [314, 428], [300, 422]];
    const mesialRoot = [[286, 428], [270, 456], [258, 510], [252, 590], [246, 680], [238, 760], [228, 800], [212, 812], [196, 804], [184, 762], [174, 680], [166, 590], [162, 500], [164, 420]];
    distalRoot.splice(0, distalRoot.length, ...distalRoot.map(RT)); mesialRoot.splice(0, mesialRoot.length, ...mesialRoot.map(RT));
    const sil = crown.concat(distalRoot, mesialRoot);
    const dej = [[172, 332], [176, 292], [178, 252], [181, 218], [193, 198], [214, 186], [238, 189], [264, 203], [300, 213], [336, 203], [362, 189], [386, 186], [407, 198], [419, 218], [422, 252], [424, 292], [428, 332]];
    const dent = dej.concat(distalRoot, mesialRoot);
    const pulpPts = [[242, 262], [256, 276], [276, 288], [300, 292], [324, 288], [344, 278], [358, 264], [364, 290], [366, 330], [364, 372], [362, 402],
      [380, 460], [390, 560], [394, 660], [394, 740], [390, 790], [386, 798, 'c'], [381, 792], [380, 740], [378, 660], [372, 560], [366, 470], [352, 428], [324, 410], [300, 406], [276, 410], [250, 428],
      [226, 470], [220, 560], [214, 660], [208, 740], [204, 792], [200, 799, 'c'], [194, 791], [196, 740], [200, 660], [204, 560], [208, 470], [220, 420], [234, 396], [236, 360], [236, 320], [238, 286]];
    for (let i = 0; i < pulpPts.length; i++) pulpPts[i] = RT(pulpPts[i]);
    const crestY = 372;
    const boneD = `M20,440 C70,410 120,386 168,${crestY} L432,${crestY} C480,386 530,410 580,440 L580,840 C520,856 460,830 400,846 C330,862 270,834 200,850 C130,864 70,840 20,854 Z`;
    const G = {};
    // bone
    const boneG = E('g', { opacity: 0 }, svg); G.bone = boneG;
    E('path', { d: boneD, fill: 'url(#boG)' }, boneG);
    const bclip = E('clipPath', { id: 'boneClip' }, defs); E('path', { d: boneD }, bclip);
    const trab = E('g', { 'clip-path': 'url(#boneClip)' }, boneG);
    seed = 7;
    for (let k = 0; k < 230; k++) {
      const cx = 30 + rnd() * 540, cy = 390 + rnd() * 470, r = 8 + rnd() * 16; const pts = [];
      for (let j = 0; j < 7; j++) { const a = j / 7 * Math.PI * 2; const rr = r * (.7 + rnd() * .5); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8]); }
      E('path', { d: cr(pts), fill: '#CDB68E', opacity: .55, stroke: '#BFA57A', 'stroke-width': 1.2 }, trab);
    }
    E('path', { d: boneD, fill: 'none', stroke: '#C7AE84', 'stroke-width': 22, opacity: .7, 'clip-path': 'url(#boneClip)' }, boneG); // cortical rim
    // inferior alveolar canal
    const ian = E('g', {}, boneG);
    E('ellipse', { cx: 300, cy: 784, rx: 54, ry: 38, fill: '#C2A578', stroke: INK, 'stroke-width': 3 }, ian);
    E('circle', { cx: 284, cy: 786, r: 17, fill: '#FFDD1F', stroke: INK, 'stroke-width': 2.5 }, ian);
    E('circle', { cx: 314, cy: 774, r: 9, fill: '#C8392B', stroke: INK, 'stroke-width': 2 }, ian);
    E('circle', { cx: 318, cy: 798, r: 10, fill: '#3B6FD0', stroke: INK, 'stroke-width': 2 }, ian);
    E('path', { d: boneD, fill: 'none', stroke: INK, 'stroke-width': 3.5 }, boneG);
    // lamina dura + PDL (root surface below crest)
    const rootD = cr(sil);
    const below = E('clipPath', { id: 'belowCrest' }, defs); E('rect', { x: 0, y: crestY, width: 600, height: 600 }, below);
    const pdlG = E('g', { 'clip-path': 'url(#belowCrest)', opacity: 0 }, svg); G.pdlG = pdlG;
    E('path', { d: rootD, fill: 'none', stroke: '#BFA57A', 'stroke-width': 22, 'stroke-linejoin': 'round' }, pdlG);
    E('path', { d: rootD, fill: 'none', stroke: '#1E8C82', 'stroke-width': 12, 'stroke-linejoin': 'round' }, pdlG);
    // tooth
    const outer = E('path', { d: rootD, fill: 'url(#enG)', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, svg);
    const dentin = E('path', { d: cr(dent), fill: 'url(#deG)', stroke: '#9C8355', 'stroke-width': 2, opacity: 0 }, svg);
    // cementum hint on root surface
    const dclip = E('clipPath', { id: 'dentClip' }, defs); E('path', { d: cr(dent) }, dclip);
    const tub = E('g', { opacity: 0, 'clip-path': 'url(#dentClip)' }, svg);
    for (let k = 0; k < 56; k++) { const a = Math.PI * (1.02 + k / 55 * .96); const x0 = 300 + Math.cos(a) * 60, y0 = 340 + Math.sin(a) * 56; E('path', { d: `M${x0},${y0} q${Math.cos(a) * 50 + 10},${Math.sin(a) * 50} ${Math.cos(a) * 190},${Math.sin(a) * 190}`, stroke: '#CDAE76', 'stroke-width': 1.4, fill: 'none', opacity: .65 }, tub); }
    for (let k = 0; k < 17; k++) { const y = 430 + k * 16; E('path', { d: `M140,${y} q60,-6 130,${4}`, stroke: '#CDAE76', 'stroke-width': 1.3, fill: 'none', opacity: .5 }, tub); E('path', { d: `M330,${y} q60,-6 130,${4}`, stroke: '#CDAE76', 'stroke-width': 1.3, fill: 'none', opacity: .5 }, tub); }
    E('path', { d: cr(sil), fill: 'none', stroke: '#E6D3A6', 'stroke-width': 5, 'clip-path': 'url(#belowCrest)', opacity: .9 }, tub); // cementum
    // enamel gloss
    const gloss = E('path', { d: 'M172,196 C180,170 198,150 222,142', stroke: '#FFFFFF', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, svg); G.gloss = gloss;
    const pulp = E('path', { d: cr(pulpPts), fill: 'url(#puG)', stroke: '#8E2A1F', 'stroke-width': 3, opacity: 0 }, svg);
    // odontoblast layer hint
    const odo = E('path', { d: cr(pulpPts), fill: 'none', stroke: '#F6B2A3', 'stroke-width': 3, opacity: 0, transform: 'translate(0,0)' }, svg); G.odo = odo;
    // gingiva
    const gumD = 'M156,300 C148,320 128,348 98,372 C70,392 44,404 20,412 L20,440 C70,410 120,386 168,' + crestY + ' L172,332 L164,306 C162,300 159,298 156,300 Z M444,300 C452,320 472,348 502,372 C530,392 556,404 580,412 L580,440 C530,410 480,386 432,' + crestY + ' L428,332 L436,306 C438,300 441,298 444,300 Z';
    const gum = E('path', { d: gumD, fill: 'url(#gmG)', stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round', opacity: 0 }, svg);
    // nerves & vessels: crown -> apex -> IAN
    const mN = [[250, 280], [262, 330], [252, 392], [230, 432], [216, 470], [211, 560], [206, 660], [202, 740], [200, 795]].map(RT).concat([[196, 730], [226, 764], [266, 780]]);
    const dN = [[350, 282], [338, 330], [348, 392], [366, 432], [375, 470], [381, 560], [386, 660], [387, 740], [386, 795]].map(RT).concat([[402, 730], [372, 762], [330, 776]]);
    const nervePaths = [cr(mN, false), cr(dN, false), cr([[256, 300], [300, 286], [344, 300]], false)];
    const vessels = [mN, dN].map((pts, i) => E('path', { d: cr(pts.map(([x, y], j) => [x + (i ? -5 : 5), y + (j > 8 ? 5 : 0)]), false), fill: 'none', stroke: i ? '#3B6FD0' : '#B3261B', 'stroke-width': 3, opacity: 0 }, svg));
    const pdlPts = [[434, crestY], [432, 400]].concat(distalRoot.slice(1), mesialRoot, [[166, crestY]]);
    return { outer, dentin, pulp, gum, tub, vessels, nervePaths, pdlD: cr(pdlPts, false), G, defs };
  }

  /* ================= HEAD PROFILE (viewBox 600x700), facing left ================= */
  function buildHead(svg) {
    const defs = E('defs', {}, svg);
    grad(defs, 'skG', [[0, '#F6D3B3'], [1, '#EDBF99']]);
    grad(defs, 'hrG', [[0, '#3A322D'], [1, '#221D1A']]);
    const skinPts = [[330, 58], [420, 78], [480, 128], [512, 198], [520, 278], [510, 350], [492, 408], [472, 450], [462, 520], [468, 600], [480, 700, 'c'],
      [248, 700, 'c'], [246, 626], [236, 584], [212, 562], [180, 553], [152, 542], [134, 522], [131, 500], [141, 482], [133, 467], [127, 454], [137, 443], [127, 433], [128, 419], [139, 405],
      [120, 399], [99, 386], [101, 368], [122, 330], [145, 292], [141, 270], [145, 230], [157, 170], [190, 110], [250, 72]];
    const headD = cr(skinPts);
    const clip = E('clipPath', { id: 'hc' }, defs); E('path', { d: headD }, clip);
    E('path', { d: headD, fill: 'url(#skG)' }, svg);
    const deco = E('g', { 'clip-path': 'url(#hc)' }, svg);
    // under-jaw / neck shade
    E('path', { d: cr([[150, 548], [260, 536], [372, 494], [470, 470], [480, 600], [250, 600]]), fill: '#E2AE88', opacity: .75 }, deco);
    // cheek blush & cheekbone
    E('ellipse', { cx: 236, cy: 382, rx: 52, ry: 30, fill: '#EBA98E', opacity: .45 }, deco);
    // shirt
    E('path', { d: cr([[150, 700, 'c'], [240, 640], [360, 652], [480, 630], [600, 660], [600, 720, 'c'], [150, 720, 'c']]), fill: '#1E8C82' }, deco);
    E('path', { d: 'M238,642 C300,676 410,676 482,632', fill: 'none', stroke: INK, 'stroke-width': 5 }, deco);
    // x-ray jaw and teeth (revealed by caller)
    const xr = E('g', { opacity: .6 }, deco);
    const xs = { fill: 'none', stroke: '#B57E5C', 'stroke-width': 5, 'stroke-dasharray': '1 10', 'stroke-linecap': 'round' };
    E('path', Object.assign({ d: cr([[146, 528], [220, 520], [300, 510], [366, 488], [390, 440], [398, 392], [404, 362]], false) }, xs), xr);
    E('path', Object.assign({ d: cr([[146, 410], [220, 408], [300, 402], [350, 380], [370, 352]], false) }, xs), xr);
    const tw = [12, 12, 13, 14, 15, 20, 20];
    let x = 168; const upT = {}, loT = {};
    tw.forEach((w, k) => {
      E('rect', { x, y: 416, width: w, height: 22 - (k > 4 ? 2 : 0), rx: 5, fill: '#FFF8EC', stroke: '#B57E5C', 'stroke-width': 2.2 }, xr);
      E('rect', { x: x + 2, y: 444, width: w, height: 20 - (k > 4 ? 2 : 0), rx: 5, fill: '#FFF8EC', stroke: '#B57E5C', 'stroke-width': 2.2 }, xr);
      if (k === 5) { upT.x = x + w / 2; upT.y = 427; loT.x = x + 2 + w / 2; loT.y = 454; }
      x += w + 2;
    });
    const blobG = E('g', { 'clip-path': 'url(#hc)', style: 'mix-blend-mode:multiply' }, svg);
    // hair
    const hair = E('path', { d: cr([[158, 182], [166, 136], [204, 92], [264, 62], [334, 50], [428, 70], [492, 122], [524, 196], [532, 280], [520, 360], [500, 420], [480, 456], [462, 430], [450, 384], [442, 330], [432, 290], [404, 272], [382, 280], [378, 318, 'c'], [366, 316], [356, 270], [322, 230], [268, 208], [214, 198], [178, 198]]), fill: 'url(#hrG)', 'clip-path': 'url(#hc)' }, svg);
    ['M400,150 C360,118 300,108 246,126', 'M478,250 C460,196 426,164 382,152', 'M506,362 C502,320 492,288 476,266'].forEach(d => E('path', { d, stroke: '#4E443D', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'clip-path': 'url(#hc)' }, svg));
    // outline
    E('path', { d: headD, fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, svg);
    // ear
    E('path', { d: cr([[394, 296], [418, 284], [442, 300], [448, 334], [438, 366], [422, 388], [404, 394], [392, 380], [390, 352], [386, 320]]), fill: '#F1C4A0', stroke: INK, 'stroke-width': 5 }, svg);
    E('path', { d: cr([[404, 306], [426, 306], [432, 336], [420, 362], [408, 368]], false), fill: 'none', stroke: '#C98C6A', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, svg);
    E('path', { d: 'M392,336 C400,332 404,342 398,350', fill: 'none', stroke: '#C98C6A', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    // brow, eye, nostril, lips
    E('path', { d: 'M164,268 C178,258 204,256 222,262', fill: 'none', stroke: '#2A2522', 'stroke-width': 9, 'stroke-linecap': 'round' }, svg);
    E('path', { d: 'M160,296 C170,286 186,284 200,290', fill: 'none', stroke: INK, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, svg);
    E('path', { d: 'M162,298 C170,304 182,306 192,302', fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .7 }, svg);
    E('ellipse', { cx: 170, cy: 296, rx: 5, ry: 7, fill: INK }, svg);
    E('path', { d: 'M114,392 C120,398 130,398 134,392', fill: 'none', stroke: '#B97A5C', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    E('path', { d: cr([[139, 407], [128, 420], [127, 433], [137, 443], [154, 440], [150, 420]]), fill: '#D98479', opacity: .85 }, svg);
    E('path', { d: cr([[137, 443], [127, 454], [133, 467], [150, 464], [154, 448]]), fill: '#D98479', opacity: .85 }, svg);
    E('path', { d: 'M137,443 C144,445 150,444 156,441', fill: 'none', stroke: '#8E3D35', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, svg);
    return { headD, blobG, upT, loT, xr };
  }

  window.ILLUS = { buildArch, buildTooth, buildHead, cr };
})();
