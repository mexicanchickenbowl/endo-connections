"""Radiograph-style tooth SVG with per-cause overlays (shared by both cuts)."""
import math, random

import numpy as np

rnd = random.Random(7)
TRAB = "".join(
    f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rnd.uniform(5,15):.1f}" ry="{rnd.uniform(3,8):.1f}" '
    f'transform="rotate({rnd.uniform(0,180):.0f} {x:.0f} {y:.0f})"/>'
    for x, y in ((rnd.uniform(0, 420), rnd.uniform(0, 720)) for _ in range(170)))

ROOT = ("M122,205 C112,140 116,62 150,46 C175,36 186,56 210,56 C234,56 245,36 270,46 C304,62 308,140 298,205 "
        "C290,305 258,455 222,560 C217,573 203,573 198,560 C162,455 130,305 122,205 Z")
CROWN = ("M122,205 C112,140 116,62 150,46 C175,36 186,56 210,56 C234,56 245,36 270,46 C304,62 308,140 298,205 "
         "C268,218 152,218 122,205 Z")
CANAL_FULL = ("M182,112 C188,98 232,98 238,112 L236,172 C230,188 218,198 214,232 L211,556 L209,556 L206,232 "
              "C202,198 190,188 184,172 Z")
CANAL_SHORT = CANAL_FULL.replace("L211,556 L209,556", "L212,520 L208,520")


def bug(x, y, r=4.2, rot=0):
    return f'<rect x="{x-r*1.5:.1f}" y="{y-r/1.6:.1f}" width="{r*3:.1f}" height="{r*1.25:.1f}" rx="{r/1.6:.1f}" transform="rotate({rot} {x} {y})"/>'


def tooth_svg(mode, steps, zoom=False):
    """steps: dict overlay-name -> step number at which it appears."""
    s = lambda k: steps.get(k, 0)
    short = mode in ("intra",)
    ov = []
    if mode == "intra":
        # lateral canal + apical delta, infected apical third
        ov.append(f'<g data-step="{s("bugs")}">'
                  '<path d="M210,462 L240,452 M210,505 L232,512 M210,540 L196,560 M210,540 L222,562" '
                  'stroke="#ff6b6b" stroke-width="4.5" fill="none" opacity=".95"/>'
                  '<g fill="#ff6b6b">' + bug(210, 530, 5, 90) + bug(210, 548, 5, 80) + bug(230, 455, 4.5, 20)
                  + bug(224, 510, 4.5, 10) + bug(197, 560, 4.5, 60) + bug(222, 561, 4.5, 120) + '</g>'
                  '<circle cx="210" cy="538" r="44" fill="none" stroke="#ff6b6b" stroke-width="3.5" stroke-dasharray="8 7"/>'
                  '</g>')
        ov.append(f'<g data-step="{s("leak")}" stroke="#ff6b6b" stroke-width="4" fill="none" stroke-linecap="round">'
                  '<path d="M150,30 L176,84 M176,84 l-12,-3 M176,84 l1,-12"/>'
                  '<path d="M270,30 L244,84 M244,84 l12,-3 M244,84 l-1,-12"/>'
                  '<g fill="#ff6b6b" stroke="none">' + bug(160, 26, 3.5, 30) + bug(262, 24, 3.5, -30) + '</g></g>')
    if mode == "extra":
        cols = [(150, 600), (268, 612), (232, 640)]
        g = []
        for (x, y) in cols:
            rays = "".join(f'<line x1="{x}" y1="{y}" x2="{x+20*math.cos(a):.1f}" y2="{y+20*math.sin(a):.1f}"/>'
                           for a in np.linspace(0, 2 * math.pi, 18, endpoint=False))
            g.append(f'<g stroke="#f5b544" stroke-width="2.2">{rays}</g><circle cx="{x}" cy="{y}" r="9" fill="#f5b544"/>')
        ov.append(f'<g data-step="{s("colonies")}">' + "".join(g) + '</g>')
    if mode == "foreign":
        ov.append(f'<g data-step="{s("blob")}"><path d="M204,566 C196,580 200,598 214,600 C228,598 226,580 216,566 Z" fill="#ffffff"/></g>')
        pts = [(160, 598), (172, 626), (250, 604), (262, 632), (230, 646), (186, 650), (148, 620), (276, 590)]
        ov.append(f'<g data-step="{s("particles")}" fill="#ffffff">' +
                  "".join(f'<circle cx="{x}" cy="{y}" r="3.4"/>' for x, y in pts) + '</g>')
        ov.append(f'<g data-step="{s("cells")}" fill="none" stroke="#c084fc" stroke-width="2.6">' +
                  "".join(f'<circle cx="{x+6}" cy="{y-4}" r="11"/>' for x, y in pts[::2]) + '</g>')
    if mode == "chol":
        nd = [(150, 596, 30), (178, 628, -20), (246, 600, 50), (262, 630, 10), (220, 650, -40), (196, 606, 70), (276, 606, -60)]
        ov.append(f'<g data-step="{s("clefts")}" fill="#9be7ff">' +
                  "".join(f'<rect x="{x-17}" y="{y-2.2}" width="34" height="4.4" rx="2.2" transform="rotate({r} {x} {y})"/>'
                          for x, y, r in nd) + '</g>')
        gc = [(166, 610), (254, 618), (212, 640)]
        ov.append(f'<g data-step="{s("giant")}">' + "".join(
            f'<circle cx="{x}" cy="{y}" r="15" fill="none" stroke="#c084fc" stroke-width="2.6"/>'
            + "".join(f'<circle cx="{x+6*math.cos(a):.1f}" cy="{y+6*math.sin(a):.1f}" r="2.3" fill="#c084fc"/>'
                      for a in np.linspace(0, 2 * math.pi, 5, endpoint=False)) for x, y in gc) + '</g>')
    if mode == "scar":
        waves = "".join(f'<path d="M{130},{y} C160,{y-8} 190,{y+8} 210,{y} S260,{y-8} 290,{y}"/>' for y in range(570, 650, 13))
        ov.append(f'<g data-step="{s("fibres")}" stroke="#4fd1c5" stroke-width="2.4" fill="none" opacity=".95">{waves}</g>')
    lesion_op = {"scar": .55, "base": .85}.get(mode, .9)
    vb = "60 330 300 390" if zoom else "0 0 420 720"
    return f'''<svg viewBox="{vb}" class="tooth">
<defs><radialGradient id="bone" cx="50%" cy="60%" r="75%"><stop offset="0" stop-color="#7d8794"/><stop offset="1" stop-color="#3c4552"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="7"/></filter><filter id="s2"><feGaussianBlur stdDeviation="1.3"/></filter>
<clipPath id="clip"><rect width="420" height="720" rx="26"/></clipPath></defs>
<g clip-path="url(#clip)">
<rect width="420" height="720" fill="url(#bone)"/>
<g fill="#2e3642" opacity=".45">{TRAB}</g>
<ellipse cx="210" cy="604" rx="92" ry="64" fill="#141a23" opacity="{lesion_op}" filter="url(#soft)"/>
<path d="{ROOT}" fill="none" stroke="#b4bcc7" stroke-width="15" opacity=".55" filter="url(#s2)"/>
<path d="{ROOT}" fill="none" stroke="#252c37" stroke-width="9"/>
<path d="{ROOT}" fill="#cdd3db" filter="url(#s2)"/>
<path d="{CROWN}" fill="#eef1f5"/>
<path d="{CANAL_SHORT if short else CANAL_FULL}" fill="#ffffff"/>
{'<path d="M210,520 L210,556" stroke="#58606c" stroke-width="3"/>' if short else ''}
<path d="M168,52 C180,40 240,40 252,52 L246,104 C230,96 190,96 174,104 Z" fill="#f8fafc"/>
{''.join(ov)}
</g>
</svg>'''
