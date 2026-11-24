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
from toothsvg import tooth_svg  # noqa: E402

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
