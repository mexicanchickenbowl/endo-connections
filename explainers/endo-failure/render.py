"""Render the explainer video from content.py + the TTS manifest.

Usage: python render.py BUILD_DIR OUT.mp4 [--preview]
  --preview  only writes one still per step to BUILD_DIR/preview/
"""
import json, math, os, random, subprocess, sys

import numpy as np, soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from content import SCENES

BUILD, OUT = sys.argv[1], sys.argv[2]
PREVIEW = "--preview" in sys.argv
FPS, W, H = 30, 1920, 1080
LEAD, GAP, TAIL, FADE, RAMP = 0.55, 0.42, 0.95, 0.35, 0.55

# ---------------------------------------------------------------- timeline
if os.path.exists(f"{BUILD}/manifest.json"):
    manifest = json.load(open(f"{BUILD}/manifest.json"))
else:  # layout preview before narration exists: silent placeholders sized by word count
    os.makedirs(f"{BUILD}/dummy", exist_ok=True); manifest = []
    for sc in SCENES:
        for ci, ch in enumerate(sc["chunks"]):
            pth = f"{BUILD}/dummy/{sc['id']}_{ci}.wav"
            sf.write(pth, np.zeros(int(24000 * len(ch["cap"].split()) / 2.6), np.float32), 24000)
            manifest.append({"scene": sc["id"], "idx": ci, "path": pth, "sr": 24000})
byk = {(m["scene"], m["idx"]): m for m in manifest}
SR = manifest[0]["sr"]
timeline, audio, t = [], [], 0.0
for sc in SCENES:
    start = t
    t += LEAD
    chunks, step = [], 0
    for ci, ch in enumerate(sc["chunks"]):
        m = byk[(sc["id"], ci)]
        y, _ = sf.read(m["path"], dtype="float32")
        if ch["step"]:
            step += 1
        chunks.append({"t": round(t - start, 3), "step": step, "cap": ch["cap"]})
        audio.append((t, y))
        t += len(y) / SR + (GAP if ci < len(sc["chunks"]) - 1 else 0)
    t += TAIL
    timeline.append({"id": sc["id"], "start": round(start, 3), "end": round(t, 3), "chunks": chunks})
TOTAL = t
track = np.zeros(int(math.ceil(TOTAL * SR)) + SR, dtype=np.float32)
for at, y in audio:
    i = int(round(at * SR)); track[i:i + len(y)] += y
track = track[: int(TOTAL * SR)]
track *= 0.89 / max(1e-6, np.abs(track).max())
sf.write(f"{BUILD}/narration.wav", track, SR)
print(f"timeline {TOTAL:.1f}s, {len(timeline)} scenes")

# ---------------------------------------------------------------- tooth svg
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


# ---------------------------------------------------------------- scenes
WORDS = [("I", "If", "Intraradicular infection"), ("E", "Endo", "Extraradicular infection"),
         ("F", "Fails", "Foreign body reaction"), ("C", "Consider", "Cholesterol crystals"),
         ("C", "Cysts", "True cysts"), ("S", "Scars", "Scar tissue")]
CAUSE_IDS = ["I", "E", "F", "C1", "C2", "S"]
BSTEPS = {"big": [1, 2, 3], "I": [1, 2, 3, 4], "E": [1, 2, 3, 4], "F": [2, 3, 4, 5], "C1": [2, 3, 4], "S": [2, 2, 3]}
TSTEPS = {"title": {}, "big": {"bugs": 1, "leak": 2}, "I": {"bugs": 2, "leak": 4}, "E": {"colonies": 1},
          "F": {"blob": 2, "particles": 4, "cells": 4}, "C1": {"clefts": 2, "giant": 3}, "S": {"fibres": 2}}


def strip(active):
    cells = "".join(f'<div class="sl{" on" if CAUSE_IDS[i] == active else ""}"><b>{l}</b>{w}</div>'
                    for i, (l, w, _) in enumerate(WORDS))
    return f'<div class="strip">{cells}</div>'


def scene_html(sc):
    L, sid = sc["layout"], sc["id"]
    if L == "title":
        return f'''<div class="title-wrap"><div class="kicker" data-step="0">Endodontics · Board review</div>
<h1 data-step="0">{sc["title"]}</h1><p class="sub" data-step="2">{sc["sub"]}</p>
<div class="pill" data-step="3">+ a mnemonic</div></div>
<div class="tooth-wrap right">{tooth_svg("base", {})}<div class="tag" data-step="1">persistent radiolucency</div></div>'''
    if L in ("bullets", "cause"):
        bl = "".join(f'<li data-step="{BSTEPS[sid][i]}">{b}</li>' for i, b in enumerate(sc["bullets"]))
        head = (f'<div class="kicker">{sc["kicker"]}</div>' if L == "bullets" else
                f'<div class="badge">{sc["letter"]}</div><div class="kicker">{sc["word"]} →</div>')
        return f'''{strip(sid) if L == "cause" else ""}<div class="left {'cause' if L == 'cause' else ''}">{head}
<h2>{sc["title"]}</h2><ul>{bl}</ul></div><div class="tooth-wrap right">{tooth_svg(sc["tooth"], TSTEPS.get(sid, {}), zoom=sid in ("E", "F", "C1", "S"))}</div>'''
    if L == "mnemonic":
        cols = "".join(f'''<div class="mcol"><div class="ml" data-step="1">{l}</div><div class="mw" data-step="1">{w}</div>
<div class="mx" data-step="{2 if i < 3 else 3}">{x}</div></div>''' for i, (l, w, x) in enumerate(WORDS))
        return f'<div class="kicker center" data-step="0">The mnemonic</div><div class="mgrid">{cols}</div>'
    if L == "cysts":
        def apex(true):
            sac = ('<path d="M120,250 C60,250 50,400 160,420 C270,430 290,260 210,250" fill="#141a23"/>'
                   '<path d="M120,250 C60,250 50,400 160,420 C270,430 290,260 210,250" fill="none" stroke="#f472b6" stroke-width="9"/>'
                   if not true else
                   '<ellipse cx="160" cy="350" rx="105" ry="72" fill="#141a23"/>'
                   '<ellipse cx="160" cy="350" rx="105" ry="72" fill="none" stroke="#f472b6" stroke-width="9"/>')
            return f'''<svg viewBox="0 0 320 450" class="apex"><rect width="320" height="450" rx="22" fill="#4a5360"/>
<path d="M90,0 L230,0 L205,240 C195,262 125,262 115,240 Z" fill="#cdd3db"/>
<path d="M156,0 L164,0 L162,250 L158,250 Z" fill="#ffffff"/>{sac}
<text x="160" y="440" text-anchor="middle" class="svgt">{"lumen sealed off" if true else "lumen opens to canal"}</text></svg>'''
        return f'''{strip("C2")}<div class="badge abs">C</div><div class="kicker abs2">Cysts →</div><h2 class="abs3">{sc["title"]}</h2>
<div class="stat" data-step="2">≈15% of apical lesions are cysts <span>(Nair: ~9% true, ~6% pocket)</span></div>
<div class="cpair"><div class="card" data-step="3">{apex(False)}<h3>Pocket (bay) cyst</h3><p>Open to the canal → <b class="ok">can heal</b> after nonsurgical RCT</p></div>
<div class="card" data-step="4">{apex(True)}<h3>True cyst</h3><p>Fully epithelium-enclosed → <b class="bad">needs surgery</b></p></div></div>
<div class="warn" data-step="5">Indistinguishable on a radiograph</div>'''
    if L == "suspects":
        return f'''<div class="kicker center">{sc["kicker"]}</div><h2 class="center">Wrong tooth · Overfill · Crack</h2>
<div class="cards3">
<div class="card c3" data-step="2"><div class="ico">⬇</div><h3>Overfill</h3><p>Feeds <b>F</b> — foreign body</p><p class="dim">…but often marks an unshaped, unsealed canal → infection (<b>I</b>) rides along</p></div>
<div class="card c3" data-step="3"><div class="ico">?</div><h3>Wrong tooth</h3><p>Misdiagnosis — neighbor or non-endodontic lesion</p><p class="dim">Test adjacent teeth · CBCT</p></div>
<div class="card c3" data-step="4"><div class="ico">⚡</div><h3>Crack (VRF)</h3>
<p data-step="5">Isolated deep, narrow pocket<br>Sinus tract near gingival margin<br>J-shaped / “halo” radiolucency</p>
<p class="bad big" data-step="6">Hopeless → root must go</p></div></div>'''
    if L == "triage":
        colors = ["#ff6b6b", "#f5b544", "#c084fc", "#4fd1c5"]
        st = [2, 3, 4, 4]
        rows = "".join(f'<div class="trow" data-step="{st[i]}"><div class="tl" style="border-color:{colors[i]}">{a}</div>'
                       f'<div class="arrow">→</div><div class="tr">{b}</div></div>' for i, (a, b) in enumerate(sc["rows"]))
        return f'<div class="kicker center">{sc["kicker"]}</div><h2 class="center" data-step="1">{sc["title"]}</h2><div class="tri">{rows}</div>'
    if L == "recap":
        cols = "".join(f'<div class="mcol"><div class="ml">{l}</div><div class="mw">{w}</div><div class="mx">{x}</div></div>'
                       for l, w, x in WORDS)
        return f'<div class="kicker center">Remember</div><div class="mgrid recap">{cols}</div>'
    if L == "refs":
        rl = "".join(f"<li>{r}</li>" for r in sc["refs"])
        return f'''<div class="kicker">References</div><ol class="refs">{rl}</ol>
<p class="foot">Mnemonic “If Endo Fails, Consider Cysts &amp; Scars” is a study aid built on Nair’s six factors.</p>'''
    raise ValueError(L)


CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden;background:#0b1220;font-family:Inter,sans-serif;color:#e8edf5}
#bg{position:absolute;inset:0;background:radial-gradient(1200px 800px at 75% 40%,#16233a 0%,#0b1220 60%),#0b1220}
.scene{position:absolute;inset:0;padding:110px 120px 190px;opacity:0}
.kicker{font:600 30px Inter;letter-spacing:.14em;text-transform:uppercase;color:#f5b544;margin-bottom:22px}
.center{text-align:center}
h1{font:800 132px/1.02 'Inter Display',Inter;letter-spacing:-.03em;max-width:1000px}
h2{font:800 84px/1.05 'Inter Display',Inter;letter-spacing:-.02em;margin-bottom:38px}
.sub{font:500 46px/1.3 Inter;color:#b9c4d6;margin-top:34px;max-width:960px}
.pill{display:inline-block;margin-top:46px;padding:16px 34px;border-radius:99px;border:2px solid #f5b544;color:#f5b544;font:700 34px Inter}
.title-wrap{position:absolute;left:120px;top:250px}
.tooth-wrap{position:absolute;top:120px;height:760px}
.cause~.tooth-wrap{top:140px}
.tooth-wrap.right{right:150px}
.tooth{height:100%;border-radius:26px;outline:2px solid #ffffff22;outline-offset:-2px;filter:drop-shadow(0 30px 60px #0008)}
.tag{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:#0b1220cc;border:1.5px solid #ffffff33;padding:10px 22px;border-radius:12px;font:600 26px Inter;color:#cbd5e1;white-space:nowrap}
.left{position:absolute;left:120px;top:150px;width:1080px}
.left.cause{top:300px}
ul{list-style:none}
li{font:500 40px/1.32 Inter;color:#d6deea;margin:0 0 28px;padding-left:46px;position:relative}
li:before{content:'';position:absolute;left:0;top:19px;width:18px;height:18px;border-radius:5px;background:#f5b544}
b{color:#fff;font-weight:700} i{color:#ffd99a}
.badge{position:absolute;left:-2px;top:-150px;width:104px;height:104px;border-radius:24px;background:#f5b544;color:#0b1220;font:900 76px/104px 'Inter Display';text-align:center}
.left.cause .kicker{position:absolute;left:130px;top:-112px}
.strip{position:absolute;top:40px;left:120px;right:120px;display:flex;gap:14px}
.sl{flex:1;padding:12px 0;border-radius:12px;background:#ffffff0d;text-align:center;font:600 24px Inter;color:#7b8799}
.sl b{color:#9aa6b8;margin-right:6px;font-weight:900}
.sl.on{background:#f5b544;color:#0b1220}.sl.on b{color:#0b1220}
.mgrid{display:flex;gap:26px;margin-top:70px}
.mcol{flex:1;text-align:center}
.ml{font:900 190px/1 'Inter Display';color:#f5b544}
.mw{font:800 52px Inter;margin-top:12px}
.mx{font:500 32px/1.25 Inter;color:#b9c4d6;margin-top:34px;padding-top:26px;border-top:2px solid #ffffff22}
.mgrid.recap{margin-top:120px}
.abs2{position:absolute;left:430px;top:112px}.abs3{position:absolute;left:430px;top:146px}
.badge.abs{position:absolute;top:110px;left:300px}
.stat{position:absolute;left:300px;top:272px;font:600 38px Inter}.stat span{color:#9aa6b8;font-weight:500}
.cpair{position:absolute;left:300px;right:300px;top:350px;display:flex;gap:60px}
.card{flex:1;background:#ffffff0b;border:1.5px solid #ffffff1c;border-radius:26px;padding:30px 36px;display:flex;flex-direction:column}
.cpair .card{align-items:center;text-align:center;padding:24px 30px}
.cpair .card h3{margin:14px 0 8px}.cpair .card p{font-size:32px}
.apex{height:330px;flex:none}
.svgt{font:600 22px Inter;fill:#e8edf5}
h3{font:800 46px Inter;margin-bottom:16px}
.card p{font:500 34px/1.35 Inter;color:#d6deea;margin-bottom:12px}
.ok{color:#4fd1c5}.bad{color:#ff6b6b}
.warn{position:absolute;left:0;right:0;top:905px;text-align:center;font:700 38px Inter;color:#f5b544}
.cards3{display:flex;gap:40px;margin-top:20px}
.c3{min-height:560px}
.ico{font:800 64px Inter;color:#f5b544;margin-bottom:14px}
.dim{color:#9aa6b8 !important}
.big{font-weight:800 !important;font-size:38px !important;margin-top:auto}
.tri{margin:20px auto 0;width:1500px}
.trow{display:flex;align-items:center;gap:30px;margin-bottom:30px}
.tl{flex:1.25;font:600 38px Inter;padding:24px 30px;background:#ffffff0b;border-left:10px solid;border-radius:14px}
.arrow{font:800 50px Inter;color:#6b778a}
.tr{flex:1;font:800 40px Inter}
.refs{margin-top:20px;padding-left:40px}.refs li{font:500 34px/1.4 Inter;padding-left:10px}
.refs li:before{display:none}
.foot{margin-top:40px;font:500 28px Inter;color:#8b97aa}
#cap{position:absolute;left:160px;right:160px;bottom:58px;text-align:center;font:500 36px/1.35 Inter;color:#f1f5fb;
  text-shadow:0 2px 12px #000a}
#capbg{position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(transparent,#05080fcc)}
"""

JS = """
const TL = %s, FADE=%s, RAMP=%s;
const scenes=[...document.querySelectorAll('.scene')];
const ease=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
let lastCap=-1;
window.setT=(t)=>{
  let si=TL.findIndex(s=>t>=s.start && t<s.end); if(si<0) si=TL.length-1;
  const s=TL[si], lt=t-s.start, dur=s.end-s.start;
  scenes.forEach((el,i)=>el.style.opacity=i===si?Math.min(ease(lt/FADE),ease((dur-lt)/FADE)):0);
  const stepStart={0:0}; let ci=-1;
  s.chunks.forEach((c,i)=>{ if(!(c.step in stepStart)) stepStart[c.step]=c.t; if(lt>=c.t) ci=i; });
  scenes[si].querySelectorAll('[data-step]').forEach(el=>{
    const k=+el.dataset.step, st=stepStart[k];
    const p=(st===undefined)?0:ease((lt-st)/RAMP);
    el.style.opacity=p; el.style.transform=`translateY(${(1-p)*18}px)`;
  });
  const cap=document.getElementById('cap');
  if(ci>=0){ cap.textContent=s.chunks[ci].cap; cap.style.opacity=Math.min(ease((lt-s.chunks[ci].t)/0.25), ease((dur-lt)/FADE)); }
  else cap.style.opacity=0;
};
"""

html = (f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div id='bg'></div>"
        + "".join(f"<section class='scene' id='s-{sc['id']}'>{scene_html(sc)}</section>" for sc in SCENES)
        + "<div id='capbg'></div><div id='cap'></div>"
        + f"<script>{JS % (json.dumps(timeline), FADE, RAMP)}</script></body></html>")
open(f"{BUILD}/slides.html", "w").write(html)

# ---------------------------------------------------------------- frames
from playwright.sync_api import sync_playwright

events = []
for s in timeline:
    events += [s["start"], s["end"] - FADE] + [s["start"] + c["t"] for c in s["chunks"]]
events.sort()


def animating(t):
    return any(e - 1 / FPS <= t <= e + max(RAMP, FADE) + 2 / FPS for e in events)


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": W, "height": H})
    pg.goto("file://" + os.path.abspath(f"{BUILD}/slides.html"))
    pg.wait_for_timeout(500)
    if PREVIEW:
        os.makedirs(f"{BUILD}/preview", exist_ok=True)
        for s in timeline:
            for c in s["chunks"]:
                pg.evaluate(f"setT({s['start'] + c['t'] + 0.9})")
                pg.screenshot(path=f"{BUILD}/preview/{s['id']}_{c['step']}.png")
        print("preview written"); sys.exit()
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                           "-i", f"{BUILD}/narration.wav", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                           "-pix_fmt", "yuv420p", "-tune", "stillimage", "-c:a", "aac", "-b:a", "160k",
                           "-movflags", "+faststart", "-shortest", OUT], stdin=subprocess.PIPE)
    n = int(TOTAL * FPS); last = None; shots = 0
    for f in range(n):
        t = f / FPS
        if last is None or animating(t):
            pg.evaluate(f"setT({t})"); last = pg.screenshot(type="png"); shots += 1
        ff.stdin.write(last)
        if f % 900 == 0:
            print(f"frame {f}/{n} ({shots} screenshots)", flush=True)
    ff.stdin.close(); ff.wait(); b.close()
print("wrote", OUT)
