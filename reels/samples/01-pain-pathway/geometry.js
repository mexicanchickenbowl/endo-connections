/*
 * 01 · Pain pathway — geometry.
 * World coordinates == screen coordinates of the full-head shot (camera centre 540,940 at zoom 1).
 * Lateral (sagittal-projection) schematic of an adult head facing left. NOT to scale; landmarks approximate.
 */
(function () {
  const { clamp, lerp } = Kit;

  // ---------- spline + arclength helpers ----------
  function catmull(pts, res = 8, closed = false) {
    const out = [], n = pts.length;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let k = 0; k < res; k++) {
        const t = k / res, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(closed ? out[0].slice() : pts[n - 1].slice());
    return out;
  }
  function withCum(p) {
    const cum = [0];
    for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    return { p, cum, len: cum[cum.length - 1] };
  }
  const mkPath = (pts, res = 10, closed = false) => withCum(catmull(pts, res, closed));
  function idxAt(cum, s) {
    let lo = 0, hi = cum.length - 1;
    if (s <= 0) return [0, 1, 0];
    if (s >= cum[hi]) return [hi - 1, hi, 1];
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    return [lo, hi, (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1)];
  }
  /** point + unit tangent at arclength s (pts may be an offset copy sharing the spine's cum) */
  function at(path, s, pts) {
    pts = pts || path.p;
    const [a, b, u] = idxAt(path.cum, clamp(s, 0, path.len));
    const x = lerp(pts[a][0], pts[b][0], u), y = lerp(pts[a][1], pts[b][1], u);
    const dx = pts[b][0] - pts[a][0], dy = pts[b][1] - pts[a][1], L = Math.hypot(dx, dy) || 1;
    return { x, y, tx: dx / L, ty: dy / L };
  }
  /** parallel copy (same point count, so it can share the spine's arclength table) */
  function offsetPts(path, d) {
    const p = path.p, n = p.length;
    return p.map((q, i) => {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      return [q[0] - (dy / L) * d, q[1] + (dx / L) * d];
    });
  }
  /** add the sub-polyline between arclengths s0..s1 to the current path */
  function traceRange(c, path, s0, s1, pts, move = true) {
    pts = pts || path.p;
    s0 = clamp(s0, 0, path.len); s1 = clamp(s1, 0, path.len);
    if (s1 <= s0) return;
    const A = at(path, s0, pts), B = at(path, s1, pts);
    if (move) c.moveTo(A.x, A.y); else c.lineTo(A.x, A.y);
    const [, i0] = idxAt(path.cum, s0), [j1] = idxAt(path.cum, s1);
    for (let i = i0; i <= j1; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineTo(B.x, B.y);
  }

  // ---------- anatomy (approximate, schematic) ----------
  const HEAD = [
    [842, 1500], [842, 1390], [848, 1280], [862, 1180], [880, 1095], [902, 1012], [915, 920], [911, 820], [888, 722],
    [842, 642], [772, 586], [692, 553], [600, 543], [512, 550], [432, 575], [364, 618], [312, 680], [279, 750],
    [263, 825], [259, 880], [266, 906], [253, 940], [229, 985], [200, 1030], [181, 1058], [186, 1078], [212, 1090],
    [234, 1098], [232, 1118], [221, 1140], [226, 1157], [239, 1168], [227, 1182], [223, 1200], [236, 1224],
    [243, 1240], [237, 1262], [236, 1290], [252, 1318], [286, 1336], [340, 1347], [398, 1353], [428, 1385], [438, 1500],
  ];
  const EAR = [[596, 944], [620, 952], [632, 986], [628, 1026], [612, 1056], [597, 1063], [588, 1049], [597, 1030], [606, 1000], [600, 972], [589, 960]];
  const EYE_U = [[279, 952], [299, 941], [322, 949]];
  const EYE_L = [[281, 954], [302, 960], [320, 951]];
  const BROW = [[270, 925], [300, 918], [330, 924]];

  const BRAIN = [
    [300, 900], [294, 820], [318, 740], [365, 672], [432, 622], [512, 592], [600, 583], [690, 592], [770, 625],
    [832, 680], [870, 750], [884, 830], [874, 898], [842, 930], [780, 937], [720, 939], [668, 960], [610, 982],
    [548, 990], [492, 982], [452, 960], [436, 930], [400, 915], [350, 914],
  ];
  const SULCI = [
    [[640, 590], [630, 640], [614, 690], [598, 740], [584, 790], [570, 832]],            // central
    [[690, 602], [678, 650], [662, 700], [646, 750], [630, 800], [618, 826]],            // postcentral
    [[592, 592], [580, 640], [566, 690], [550, 740], [536, 790], [524, 836]],            // precentral
    [[440, 912], [478, 882], [530, 858], [590, 838], [650, 820], [692, 802]],            // lateral (Sylvian)
    [[470, 942], [530, 918], [600, 898], [670, 878], [732, 852]],                         // sup. temporal
    [[332, 760], [380, 702], [440, 662], [500, 642], [545, 630]],                         // sup. frontal
    [[320, 842], [370, 803], [430, 778], [490, 768], [522, 772]],                         // inf. frontal
    [[704, 688], [744, 700], [784, 732], [822, 782]],                                     // intraparietal
    [[800, 834], [838, 846], [866, 866]],                                                 // occipital
    [[360, 880], [400, 862], [440, 858]],
    [[740, 900], [790, 905], [840, 900]],
  ];
  // postcentral gyrus (S1) band: between central and postcentral sulci
  const S1_BAND = SULCI[0].concat(SULCI[1].slice().reverse());

  const CEREBELLUM = [[690, 952], [730, 942], [800, 946], [850, 966], [868, 1000], [850, 1036], [800, 1053], [740, 1051], [702, 1031], [686, 996]];
  const FOLIA = [
    [[706, 975], [760, 962], [830, 978], [856, 1000]],
    [[700, 998], [760, 988], [830, 1002], [860, 1012]],
    [[708, 1020], [770, 1014], [834, 1026], [850, 1030]],
  ];
  const STEM_FRONT = [[574, 888], [584, 918], [582, 945], [584, 976], [594, 1006], [610, 1040], [624, 1080], [632, 1130], [638, 1200], [644, 1300], [648, 1500]];
  const STEM_BACK = [[620, 884], [630, 914], [642, 946], [652, 986], [662, 1030], [669, 1080], [675, 1140], [679, 1220], [683, 1320], [687, 1500]];
  const PONS_BULGE = [[584, 928], [572, 950], [570, 975], [580, 1000], [596, 1010]];

  // mandible + teeth
  const MANDIBLE = [[548, 1000], [561, 1012], [559, 1036], [552, 1082], [548, 1142], [545, 1200], [539, 1248], [526, 1281],
    [498, 1300], [440, 1311], [380, 1318], [320, 1322], [272, 1322], [249, 1308], [241, 1282], [244, 1252], [250, 1222]];
  const RAMUS_FRONT = [[541, 1007], [532, 1030], [520, 1042], [503, 1026], [491, 1022], [480, 1056], [468, 1104], [452, 1158], [430, 1196]];
  const MAXILLA = [[236, 1112], [262, 1132], [320, 1138], [380, 1132], [430, 1120], [470, 1100]];
  const CANAL_A = [[505, 1146], [482, 1210], [436, 1258], [380, 1270], [340, 1266], [296, 1252]];
  const CANAL_B = [[513, 1150], [490, 1218], [440, 1270], [380, 1282], [338, 1278], [294, 1262]];

  function toothPts(cx, y0, w, ch, rl, kind, up) {
    const s = up ? -1 : 1, hw = w / 2;
    const P = (dx, dy) => [cx + dx, y0 + s * dy];
    if (kind === 'm') {
      return [P(-hw, ch * 0.28), P(-hw * 0.86, ch * 0.03), P(-hw * 0.56, -ch * 0.05), P(-hw * 0.26, ch * 0.07), P(0, -ch * 0.03),
        P(hw * 0.3, ch * 0.07), P(hw * 0.6, -ch * 0.05), P(hw * 0.88, ch * 0.03), P(hw, ch * 0.3), P(hw * 0.96, ch * 0.78),
        P(hw * 0.86, ch), P(hw * 0.8, ch + rl * 0.6), P(hw * 0.62, ch + rl), P(hw * 0.4, ch + rl * 0.93), P(hw * 0.22, ch + rl * 0.48),
        P(0, ch + rl * 0.26), P(-hw * 0.22, ch + rl * 0.48), P(-hw * 0.4, ch + rl * 0.95), P(-hw * 0.62, ch + rl), P(-hw * 0.82, ch + rl * 0.6),
        P(-hw * 0.88, ch), P(-hw * 0.97, ch * 0.78)];
    }
    const tip = kind === 'c' ? -ch * 0.12 : kind === 'i' ? 0 : -ch * 0.04;
    return [P(-hw, ch * 0.35), P(-hw * 0.7, ch * 0.05), P(0, tip), P(hw * 0.7, ch * 0.05), P(hw, ch * 0.35), P(hw * 0.92, ch),
      P(hw * 0.55, ch + rl * 0.7), P(hw * 0.12, ch + rl), P(-hw * 0.12, ch + rl), P(-hw * 0.55, ch + rl * 0.7), P(-hw * 0.92, ch)];
  }
  const LOWER_TEETH = [[256, 12, 'i', 24, 36], [274, 16, 'c', 26, 44], [295, 20, 'p', 26, 40], [317, 20, 'p', 26, 40], [351, 44, 'm', 28, 50], [397, 40, 'm', 27, 46]];
  const UPPER_TEETH = [[251, 14, 'i', 26, 38], [271, 16, 'c', 27, 46], [294, 20, 'p', 25, 38], [316, 20, 'p', 25, 38], [350, 44, 'm', 27, 44], [396, 40, 'm', 26, 42]];
  const OCC_LOW = 1176, OCC_UP = 1174;
  // lower first molar pulp (chamber + two canals)
  const PULP_LM1 = [[338, 1190], [341, 1185], [346, 1191], [351, 1188], [356, 1191], [361, 1185], [364, 1190], [363, 1201],
    [361, 1222], [364, 1250], [360, 1251], [356, 1222], [351, 1210], [346, 1222], [342, 1251], [338, 1250], [341, 1222], [339, 1201]];
  const PULP_UM1 = [[338, 1160], [341, 1165], [346, 1159], [351, 1162], [356, 1159], [361, 1165], [364, 1160], [362, 1150],
    [360, 1130], [362, 1110], [358, 1109], [355, 1130], [351, 1140], [347, 1130], [343, 1109], [339, 1110], [341, 1130], [339, 1150]];

  // other trigeminal trunks (context only)
  const V2 = [[356, 1108], [400, 1074], [450, 1036], [500, 1002], [536, 980], [562, 964]];
  const V1 = [[318, 936], [380, 935], [440, 940], [500, 948], [548, 958]];

  // ---------- signal route ----------
  // primary afferent (spine): molar pulp -> mesial canal -> apex -> mandibular canal -> mandibular foramen -> V3 ->
  // foramen ovale -> trigeminal ganglion -> root -> pons -> spinal trigeminal tract -> subnucleus caudalis
  const ROUTE = [
    [351, 1196], [345, 1214], [341, 1234], [340, 1250], [346, 1266], [372, 1275], [410, 1274], [448, 1262], [480, 1236],
    [500, 1198], [507, 1156], [512, 1106], [522, 1056], [534, 1014], [543, 991], [553, 974], [566, 962], [586, 961],
    [604, 967], [618, 990], [631, 1030], [642, 1074], [650, 1108], [654, 1124],
  ];
  // 2nd order (trigeminothalamic): starts at a 2nd-order cell body just anterior to the primary terminal (visible synaptic gap)
  // and climbs ~15-20 px anterior of the descending spinal trigeminal tract so it never reads as the same wire reversing.
  const ASC = [[645, 1121], [637, 1106], [626, 1080], [613, 1046], [600, 1008], [590, 970], [585, 934], [585, 904], [587, 882]];
  const TC = [[587, 880], [593, 852], [600, 820], [606, 794], [611, 772]];                                                   // 3rd order
  // 3rd-order branch for second (C) pain: thalamus -> deep/medial cortex (S2 + anterior cingulate; Ploner 2002), schematic
  const CING = [[587, 880], [578, 862], [566, 845], [552, 830], [540, 818]];

  const ST = { // stations
    pulp: [351, 1196], ganglion: [566, 962], caudalis: [654, 1120], vpm: [587, 880], s1: [611, 770],
    thal: [580, 870], cing: [540, 816],
  };

  // convergence inputs (other afferents that end on the same caudalis neurons)
  const TAIL_FROM_GANGLION = [[586, 961], [604, 967], [618, 990], [631, 1030], [642, 1074], [650, 1108], [654, 1124]];
  const TAIL_FROM_CANAL = [[410, 1274], [448, 1262], [480, 1236], [500, 1198], [507, 1156], [512, 1106], [522, 1056], [534, 1014], [543, 991], [553, 974], [566, 962]].concat(TAIL_FROM_GANGLION);
  const INPUTS = [
    { name: 'upper molar', pts: [[350, 1156], [351, 1132], [352, 1110], [380, 1082], [424, 1050], [470, 1016], [516, 988], [546, 970], [566, 962]].concat(TAIL_FROM_GANGLION) },
    { name: 'premolar', pts: [[317, 1196], [317, 1222], [318, 1246], [330, 1266], [362, 1276]].concat(TAIL_FROM_CANAL) },
    { name: 'jaw muscle', pts: [[452, 1150], [474, 1096], [500, 1046], [528, 1004], [550, 978], [566, 962]].concat(TAIL_FROM_GANGLION) },
    { name: 'skin', pts: [[300, 1036], [340, 1012], [400, 998], [468, 988], [530, 974], [566, 962]].concat(TAIL_FROM_GANGLION) },
  ];

  window.GEO = {
    catmull, withCum, mkPath, at, offsetPts, traceRange, toothPts,
    HEAD, EAR, EYE_U, EYE_L, BROW, BRAIN, SULCI, S1_BAND, CEREBELLUM, FOLIA, STEM_FRONT, STEM_BACK, PONS_BULGE,
    MANDIBLE, RAMUS_FRONT, MAXILLA, CANAL_A, CANAL_B, LOWER_TEETH, UPPER_TEETH, OCC_LOW, OCC_UP, PULP_LM1, PULP_UM1,
    V1, V2, ROUTE, ASC, TC, CING, ST, INPUTS,
  };
})();
