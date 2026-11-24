"""Vox-style vertical cut for Instagram Reels (1080x1920, 30 fps).

Usage: python render_reel.py BUILD_DIR OUT_PREFIX [--preview] [--guides]
  writes OUT_PREFIX.mp4 (music bed + sfx) and OUT_PREFIX_nomusic.mp4 (voice + sfx,
  for adding Instagram audio in-app). --preview writes stills only; --guides draws
  the Reels UI safe zones on the stills.
"""
import difflib, json, math, os, random, re, subprocess, sys

import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from content_reel import SCENES  # noqa: E402
from toothsvg import tooth_svg  # noqa: E402

BUILD, OUT = sys.argv[1], sys.argv[2]
PREVIEW, GUIDES = "--preview" in sys.argv, "--guides" in sys.argv
FPS, W, H, SR = 30, 1080, 1920, 48000
SPEED = 1.08                      # narration tempo-up (pitch preserved)
LEAD, GAP, TAIL, TR = 0.22, 0.16, 0.32, 0.30

# ------------------------------------------------------------------ narration + timeline
man = {(m["scene"], m["idx"]): m for m in json.load(open(f"{BUILD}/manifest.json"))}


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def align(cap, words, dur):
    """Map caption words to whisper word start times (interpolating misses)."""
    cw = cap.split()
    a, b = [norm(w) for w in cw], [norm(w[0]) for w in words]
    t = [None] * len(cw)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            t[blk.a + k] = words[blk.b + k][1]
    known = [(i, x) for i, x in enumerate(t) if x is not None]
    anchors = [(-1, 0.0)] + known + [(len(cw), dur)]
    for (i0, t0), (i1, t1) in zip(anchors, anchors[1:]):
        for i in range(i0 + 1, i1):
            t[i] = t0 + (t1 - t0) * (i - i0) / (i1 - i0)
    t = [max(0.0, min(x, dur)) for x in t]
    for i in range(1, len(t)):
        t[i] = max(t[i], t[i - 1] + 0.04)
    return list(zip(cw, t))


chunks_audio, timeline, t = [], [], 0.0
for sc in SCENES:
    start = t
    t += LEAD
    chs = []
    for ci, ch in enumerate(sc["chunks"]):
        m = man[(sc["id"], ci)]
        y, sr0 = sf.read(m["path"], dtype="float32")
        dur = len(y) / sr0
        chunks_audio.append((t, m["path"]))
        chs.append({"t": t - start, "dur": dur, "cap": ch["cap"], "words": align(ch["cap"], m.get("words", []), dur)})
        t += dur + (GAP if ci < len(sc["chunks"]) - 1 else 0)
    t += TAIL
    timeline.append({"id": sc["id"], "start": start, "end": t, "chunks": chs})
TOTAL = t / SPEED
# speed everything
for s in timeline:
    s["start"] /= SPEED; s["end"] /= SPEED
    for c in s["chunks"]:
        c["t"] /= SPEED; c["dur"] /= SPEED
        c["words"] = [(w, c["t"] + x / SPEED) for w, x in c["words"]]

# narration at original tempo -> atempo + 48k via ffmpeg
SR0 = sf.info(chunks_audio[0][1]).samplerate
raw = np.zeros(int((TOTAL * SPEED + 1) * SR0), np.float32)
for at, pth in chunks_audio:
    y, _ = sf.read(pth, dtype="float32"); i = int(at * SR0); raw[i:i + len(y)] += y
sf.write(f"{BUILD}/narr_raw.wav", raw, SR0)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{BUILD}/narr_raw.wav", "-af",
                f"atempo={SPEED},aresample={SR}", f"{BUILD}/narr.wav"], check=True)
print(f"timeline {TOTAL:.1f}s")

# ------------------------------------------------------------------ html helpers
SCN = {}          # scene id -> timeline entry
for s in timeline:
    SCN[s["id"]] = s
SFX = []          # (abs time, kind)
CUR = {"s": None}


def tm(spec):
    """'s+0.2' | 'c1' | 'c1w3' | 'c0f0.6', each with optional '+x' -> scene-local seconds."""
    s = SCN[CUR["s"]]
    off = 0.0
    if "+" in spec[1:]:
        spec, o = spec.split("+", 1) if not spec.startswith("s+") else ("s", spec[2:])
        off = float(o)
    if spec == "s":
        return off
    m = re.fullmatch(r"c(\d+)(?:w(\d+)|f([\d.]+))?", spec)
    c = s["chunks"][int(m.group(1))]
    if m.group(2):
        base = c["words"][int(m.group(2))][1]
    elif m.group(3):
        base = c["t"] + c["dur"] * float(m.group(3))
    else:
        base = c["t"]
    return base + off


def A(anim, at, dur=None, rot=0, sfx=None):
    t0 = tm(at)
    if sfx:
        SFX.append((SCN[CUR["s"]]["start"] + t0, sfx))
    d = dur or {"draw": 0.6, "hl": 0.4, "stamp": 0.22, "slap": 0.28, "pop": 0.4}.get(anim, 0.45)
    return f'data-a="{anim}" data-t="{t0:.3f}" data-d="{d}" data-r="{rot}"'


def wobble(cx, cy, rx, ry, seed=1, turns=1.12, jitter=0.06):
    r = random.Random(seed)
    n = 26
    a0 = r.uniform(0, 2 * math.pi)
    pts = []
    for i in range(int(n * turns) + 1):
        a = a0 + 2 * math.pi * i / n
        k = 1 + r.uniform(-jitter, jitter) + 0.05 * i / n
        pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1, len(pts) - 1):
        p0, p1, p2 = pts[i - 1], pts[i], pts[i + 1]
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        d += f" Q{p1[0]:.1f},{p1[1]:.1f} {mx:.1f},{my:.1f}"
    return d


def circle_svg(vb, cx, cy, rx, ry, at, seed=1, color="#d8352a"):
    return (f'<svg class="anno" viewBox="{vb}" preserveAspectRatio="xMidYMid meet">'
            f'<path d="{wobble(cx, cy, rx, ry, seed)}" pathLength="1" fill="none" stroke="{color}" '
            f'stroke-width="7" stroke-linecap="round" {A("draw", at)}/></svg>')


def tooth_print(mode, zoom, x, y, w, rot, anno=None, steps=None, tapes=True):
    svg = tooth_svg(mode, steps or {}, zoom=zoom)
    CUR["k"] = CUR.get("k", 0) + 1
    for i_ in ("bone", "soft", "s2", "clip"):
        svg = svg.replace(f'id="{i_}"', f'id="{i_}{CUR["k"]}"').replace(f"url(#{i_})", f"url(#{i_}{CUR['k']})")
    # overlay steps -> timed fades
    def sub(m):
        k = int(m.group(1))
        return "" if k == 0 else A("fade", {1: "c0+0.45", 2: "c0+1.4"}.get(k, "c0f0.7"), 0.5)
    svg = re.sub(r'data-step="(\d+)"', sub, svg)
    vb = "60 330 300 390" if zoom else "0 0 420 720"
    an = circle_svg(vb, *anno) if anno else ""
    tp = ('<i class="tape" style="left:-30px;top:-14px;transform:rotate(-38deg)"></i>'
          '<i class="tape" style="right:-30px;top:-14px;transform:rotate(36deg)"></i>') if tapes else ""
    return (f'<div class="print" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)">'
            f'<div class="ph">{svg}{an}</div>{tp}</div>')


LETTERS = [("I", "If"), ("E", "Endo"), ("F", "Fails"), ("C", "Consider"), ("C", "Cysts"), ("S", "Scars")]
ORDER = ["I", "E", "F", "C1", "C2", "S"]


def strip(active):
    return '<div class="strip">' + "".join(
        f'<div class="tile{" on" if ORDER[i] == active else ""}"><b>{l}</b>{w}</div>'
        for i, (l, w) in enumerate(LETTERS)) + "</div>"


def head(sc):
    return (f'{strip(sc["id"])}<div class="badge" {A("slap", "s+0.12", rot=-3, sfx="thump")}>{sc["letter"]}</div>'
            f'<h2 class="ctitle" {A("slide", "s+0.05")}><span class="hl" {A("hl", "c0+0.35")}>{sc["title"]}</span></h2>')


ANNO = {"intra": (210, 538, 70, 62), "extra": (210, 612, 118, 66), "foreign": (210, 612, 112, 62),
        "chol": (210, 618, 110, 58), "scar": (210, 610, 110, 58)}


def scene_html(sc):
    CUR["s"] = sc["id"]
    L = sc["layout"]
    nch = len(sc["chunks"])
    if L == "hook":
        return f'''
<h1 class="hook">WHY ROOT CANALS <span class="hl" {A("hl", "s+0.35", 0.5)}>FAIL</span></h1>
{tooth_print("base", False, 345, 560, 370, -2.5, anno=(210, 604, 120, 86, "c2w4", 3))}
<div class="stamp green" style="left:600px;top:590px" {A("stamp", "c0w2", rot=10, sfx="thump")}>TEXTBOOK</div>
<div class="sticky" style="left:56px;top:760px" {A("slap", "c1w1", rot=-7, sfx="thump")}>shaping ✓</div>
<div class="sticky" style="left:770px;top:880px" {A("slap", "c1w5", rot=6, sfx="thump")}>fill ✓</div>
<div class="qmark" style="left:720px;top:930px" {A("stamp", "c2w6", rot=8)}>?</div>'''
    if L == "paper":
        return f'''
<div class="journal" style="transform:rotate(-1.2deg)">
 <div class="jh">INTERNATIONAL ENDODONTIC JOURNAL · 2006 · 39:249–281</div>
 <div class="jt">On the causes of persistent apical periodontitis: a review</div>
 <div class="ja">P. N. R. Nair <svg class="uline" viewBox="0 0 300 20"><path d="M4,12 C80,4 180,18 296,8" pathLength="1" fill="none" stroke="#d8352a" stroke-width="5" stroke-linecap="round" {A("draw", "c0w3", 0.5)}/></svg></div>
 <div class="jr"></div>
 <p class="jb">…Even when the most stringent procedures are followed, apical periodontitis may still persist as asymptomatic radiolucencies… During the 1990s, a series of investigations have shown that there are <span class="hl" {A("hl", "c1w2", 0.55)}>six biological factors</span> that lead to asymptomatic radiolucencies persisting after root canal treatment.</p>
</div>
<div class="sticky small" style="left:640px;top:330px" {A("slap", "c0w6", rot=5, sfx="thump")}>decades of histology</div>
<div class="six" {A("stamp", "c1w3+0.15", rot=-10, sfx="thump")}>6</div>'''
    if L == "mnemonic":
        idx = [3, 4, 5, 6, 7, 9]
        rows = "".join(
            f'<div class="mrow" style="top:{330 + i * 148}px" {A("pop", f"c0w{idx[i]}", rot=(-1.5 if i % 2 else 1.5), sfx="thump")}>'
            f'<b>{l}</b><span>{w}</span></div>' for i, (l, w) in enumerate(LETTERS))
        ghost = "".join(f'<div class="mrow ghost" style="top:{330 + i * 148}px"><b>{l}</b><span>{w}</span></div>'
                        for i, (l, w) in enumerate(LETTERS))
        return f'<div class="kick" {A("fade", "s")}>the mnemonic</div>{ghost}{rows}'
    if L == "cause":
        zoom = sc["tooth"] != "intra"
        steps = {"intra": {"bugs": 1, "leak": 2}, "extra": {"colonies": 1}, "foreign": {"blob": 1, "particles": 2, "cells": 2},
                 "chol": {"clefts": 1, "giant": 2}, "scar": {"fibres": 1}}[sc["tooth"]]
        w = 360 if not zoom else 470
        x = 120 if not zoom else 80
        cx, cy, rx, ry = ANNO[sc["tooth"]]
        fact_at = "c1w0" if nch > 1 else "c0f0.62"
        return f'''{head(sc)}
{tooth_print(sc["tooth"], zoom, x, 585, w, -2, anno=(cx, cy, rx, ry, "c0+0.9", 5), steps=steps)}
<div class="note" style="left:{x + w + 40}px;top:690px" {A("fade", "c0+1.1")}>
 <svg viewBox="0 0 120 80" class="arrow"><path d="M110,10 C80,10 40,30 14,66 M14,66 L16,40 M14,66 L38,58" pathLength="1" fill="none" stroke="#d8352a" stroke-width="6" stroke-linecap="round" {A("draw", "c0+1.1", 0.5)}/></svg>
 {sc["note"]}</div>
<div class="sticky big" style="left:{x + w + 30}px;top:960px" {A("slap", fact_at, rot=4, sfx="thump")}>{sc["fact"]}</div>'''
    if L == "cysts":
        def apex(true):
            sac = ('<path d="M118,250 C58,250 48,400 160,420 C272,430 290,262 206,250" fill="#161c26"/>'
                   '<path d="M118,250 C58,250 48,400 160,420 C272,430 290,262 206,250" fill="none" stroke="#f472b6" stroke-width="10"/>'
                   if not true else
                   '<ellipse cx="160" cy="352" rx="104" ry="70" fill="#161c26"/>'
                   '<ellipse cx="160" cy="352" rx="104" ry="70" fill="none" stroke="#f472b6" stroke-width="10"/>')
            return (f'<svg viewBox="0 0 320 450"><rect width="320" height="450" fill="#56606d"/>'
                    f'<path d="M90,0 L230,0 L205,240 C195,262 125,262 115,240 Z" fill="#d3d9e0"/>'
                    f'<path d="M156,0 L164,0 L162,250 L158,250 Z" fill="#fff"/>{sac}</svg>')
        return f'''{head(sc)}
<div class="polaroid" style="left:80px;top:575px" {A("slap", "c1w0", rot=-3, sfx="thump")}>{apex(False)}<div class="pl">pocket cyst</div></div>
<div class="polaroid" style="left:590px;top:565px" {A("slap", "c0w1", rot=2.5, sfx="thump")}>{apex(True)}<div class="pl">true cyst</div></div>
<div class="stamp" style="left:650px;top:610px" {A("stamp", "c0w3", rot=-12)}>SEALED</div>
<div class="stamp green" style="left:120px;top:650px" {A("stamp", "c1w3", rot=-8, sfx="thump")}>CAN HEAL</div>
<div class="stamp" style="left:640px;top:730px" {A("stamp", "c1w8", rot=7, sfx="thump")}>SURGERY</div>'''
    if L == "suspects":
        cards = [("c1w0", "↓", "OVERFILL", "feeds <b>F</b> — and usually rides with infection", -1.5),
                 ("c2w0", "?", "WRONG TOOTH", "misdiagnosis · test the neighbors", 1.2),
                 ("c3w2", "⚡", "CRACKED ROOT", "vertical root fracture", -1)]
        html = "".join(
            f'<div class="card" style="top:{520 + i * 245}px" {A("slap", at, rot=r, sfx="thump")}>'
            f'<div class="ic">{ic}</div><div><div class="ct">{t1}</div><div class="cs">{t2}</div></div></div>'
            for i, (at, ic, t1, t2, r) in enumerate(cards))
        return f'''<h2 class="big">THE CLINICAL <span class="hl" {A("hl", "c0w2", 0.45)}>CULPRITS</span></h2>{html}
<div class="stamp" style="left:640px;top:1105px" {A("stamp", "c3w9", rot=-9, sfx="thump")}>HOPELESS</div>'''
    if L == "triage":
        rows = [("INFECTION INSIDE", "#d8352a", "c0w1", "RETREAT", "c0w3"),
                ("OUTSIDE THE ROOT", "#e89a1c", "c0w4", "SURGERY", "c0w5"),
                ("CRACKED", "#5b4bd6", "c0w6", "EXTRACT", "c0w7")]
        html = "".join(
            f'<div class="trow" style="top:{560 + i * 230}px"><div class="pill" style="background:{c}" {A("slide", a1)}>{p}</div>'
            f'<div class="tans" {A("stamp", a2, rot=-4, sfx="thump")}>→ {ans}</div></div>'
            for i, (p, c, a1, ans, a2) in enumerate(rows))
        return f'<h2 class="big">THE <span class="hl" {A("hl", "s+0.2", 0.4)}>FIX</span></h2>{html}'
    if L == "cta":
        words = ["If", "Endo", "Fails,", "Consider", "Cysts", "&amp;", "Scars"]
        lines = [[0, 1, 2], [3], [4, 5, 6]]
        out = ""
        for li, ln in enumerate(lines):
            out += f'<div class="cline" style="top:{360 + li * 175}px">'
            for wi in ln:
                w = words[wi]
                first = f'<b>{w[0]}</b>{w[1:]}' if w[0].isalpha() else w
                out += f'<span {A("pop", f"c0w{wi}", rot=0)}>{first}</span> '
            out += "</div>"
        return f'''<div class="kick" {A("fade", "s")}>remember</div>{out}
<div class="save" {A("slap", "c0w7", rot=-2, sfx="thump")}>🔖 SAVE FOR BOARDS</div>
<div class="src" {A("fade", "c0w7")}>Source: Nair PNR. Int Endod J 2006;39:249–81</div>'''
    raise ValueError(L)


# ------------------------------------------------------------------ captions
def groups(c):
    out, cur = [], []
    for w, t in c["words"]:
        txt = " ".join(x for x, _ in cur + [(w, t)])
        if cur and (len(cur) >= 3 or len(txt) > 17):
            out.append(cur); cur = []
        cur.append((w, t))
        if re.search(r"[.,:?!]$", w):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    res = []
    for i, g in enumerate(out):
        t1 = out[i + 1][0][1] if i + 1 < len(out) else c["t"] + c["dur"] + 0.12
        res.append({"t0": g[0][1], "t1": t1, "w": [[re.sub(r"[,:;]$", "", w), round(t, 3)] for w, t in g]})
    return res


CAPS = [[g for c in s["chunks"] for g in groups(c)] for s in timeline]

fontdir = "file://" + os.path.join(HERE, "fonts")
NOISE = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>"
         "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>"
         "<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 0'/></filter>"
         "<rect width='100%' height='100%' filter='url(%23n)'/></svg>")
FIBRE = NOISE.replace(".9' numOctaves='2'", ".012 .08' numOctaves='3'").replace("320", "900")

CSS = f"""
@font-face{{font-family:Caveat;src:url({fontdir}/Caveat-Bold.woff2)}}
@font-face{{font-family:Marker;src:url({fontdir}/PermanentMarker.woff2)}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:#ece5d6;font-family:Inter,sans-serif;color:#141414}}
.scene{{position:absolute;inset:0;display:none;overflow:hidden;background:#ece5d6}}
.scene:before{{content:'';position:absolute;inset:0;background:url("{FIBRE}");opacity:.10}}
.cam{{position:absolute;inset:0;transform-origin:50% 42%}}
#grain{{position:absolute;inset:0;background:url("{NOISE}");opacity:.13;mix-blend-mode:multiply;pointer-events:none}}
#vig{{position:absolute;inset:0;background:radial-gradient(130% 90% at 50% 45%,transparent 55%,#3a2a1033 100%)}}
.hl{{background:linear-gradient(100deg,#ffd31a 0,#ffdc3c 100%) no-repeat 0 60%;background-size:0% 88%;padding:0 .08em;
  box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:4px}}
h1.hook{{position:absolute;left:66px;top:290px;width:960px;font:900 104px/0.98 'Inter Display';letter-spacing:-.03em}}
.print{{position:absolute;background:#fbfaf6;padding:14px;box-shadow:0 18px 40px #3b2a1240,0 2px 6px #0003}}
.ph{{position:relative}} .ph svg.tooth{{display:block;width:100%;height:auto;border-radius:0;outline:none;filter:none}}
.anno{{position:absolute;inset:0;width:100%;height:100%;overflow:visible}}
.anno path{{stroke-dasharray:1;stroke-dashoffset:1}}
.tape{{position:absolute;width:120px;height:38px;background:#f6f1e2b8;box-shadow:0 1px 3px #0002}}
.sticky{{position:absolute;background:#ffe45c;padding:18px 26px;font:700 58px/1 Caveat;color:#222;box-shadow:0 10px 22px #4a3a1040}}
.sticky.small{{font-size:46px;width:330px;line-height:1.05}}
.sticky.big{{font-size:62px;max-width:360px;line-height:1.02;padding:26px 28px}}
.stamp{{position:absolute;font:400 64px/1 Marker;color:#d8352a;border:6px solid #d8352a;padding:10px 20px 4px;border-radius:10px;
  background:#ece5d6cc;letter-spacing:.02em}}
.stamp.green{{color:#23885a;border-color:#23885a}}
.qmark{{position:absolute;font:400 210px/1 Marker;color:#d8352a}}
.journal{{position:absolute;left:84px;top:430px;width:912px;background:#fdfcf8;padding:54px 56px 60px;font-family:'Bitstream Charter',Caladea,serif;
  box-shadow:0 22px 50px #3b2a1245}}
.jh{{font:700 22px Inter;letter-spacing:.16em;color:#7a6a52}}
.jt{{font-weight:700;font-size:58px;line-height:1.08;margin:26px 0 18px;color:#111}}
.ja{{font-style:italic;font-size:36px;position:relative;display:inline-block}}
.uline{{position:absolute;left:-6px;bottom:-16px;width:240px;height:20px;overflow:visible}}
.uline path,.arrow path{{stroke-dasharray:1;stroke-dashoffset:1}}
.jr{{height:2px;background:#d9cfbd;margin:34px 0 26px}}
.jb{{font-size:35px;line-height:1.48;color:#2a2a2a}}
.six{{position:absolute;left:640px;top:1035px;width:170px;height:170px;border:8px solid #d8352a;border-radius:50%;font:400 120px/150px Marker;
  color:#d8352a;text-align:center}}
.kick{{position:absolute;left:0;right:0;top:250px;text-align:center;font:700 56px Caveat;color:#d8352a}}
.mrow{{position:absolute;left:150px;display:flex;align-items:center;gap:34px}}
.mrow b{{width:124px;height:124px;background:#ffd31a;font:900 96px/124px 'Inter Display';text-align:center;box-shadow:0 8px 0 #141414}}
.mrow.ghost{{opacity:.13}}
.mrow span{{font:900 106px 'Inter Display';letter-spacing:-.03em;text-transform:uppercase}}
.strip{{position:absolute;top:240px;left:60px;right:60px;display:flex;gap:9px}}
.tile{{flex:1;height:58px;border:3px solid #14141433;border-radius:8px;font:700 21px/52px Inter;text-align:center;color:#14141488}}
.tile b{{font-weight:900;margin-right:5px}}
.tile.on{{background:#141414;color:#ffd31a;border-color:#141414}}
.badge{{position:absolute;left:66px;top:340px;width:140px;height:140px;background:#ffd31a;font:900 112px/140px 'Inter Display';
  text-align:center;box-shadow:0 9px 0 #141414}}
h2.ctitle{{position:absolute;left:236px;top:336px;width:790px;font:900 80px/.98 'Inter Display';letter-spacing:-.025em;text-transform:uppercase}}
.note{{position:absolute;width:330px;font:700 54px/1 Caveat;color:#d8352a;transform:rotate(-4deg)}}
.arrow{{display:block;width:120px;height:80px;margin:0 0 8px -20px;overflow:visible}}
.polaroid{{position:absolute;width:400px;background:#fbfaf6;padding:16px 16px 0;box-shadow:0 18px 40px #3b2a1240}}
.polaroid svg{{display:block;width:100%}}
.pl{{font:700 56px/90px Caveat;text-align:center}}
h2.big{{position:absolute;left:66px;top:300px;width:960px;font:900 108px/.95 'Inter Display';letter-spacing:-.03em}}
.card{{position:absolute;left:62px;width:956px;height:210px;background:#fbfaf6;display:flex;align-items:center;gap:30px;padding:0 34px;
  box-shadow:0 14px 30px #3b2a1238}}
.ic{{flex:none;width:130px;height:130px;background:#141414;color:#ffd31a;font:400 84px/130px Marker;text-align:center}}
.ct{{font:900 62px/1 'Inter Display';letter-spacing:-.02em}}
.cs{{font:600 33px/1.25 Inter;color:#4a4339;margin-top:10px}}
.trow{{position:absolute;left:62px;right:50px;height:170px;display:flex;align-items:center;gap:26px}}
.pill{{flex:none;width:440px;padding:26px 28px;color:#fff;font:900 46px/1.05 'Inter Display';letter-spacing:-.01em;box-shadow:0 8px 0 #141414}}
.tans{{font:400 70px/1 Marker;color:#141414}}
.cline{{position:absolute;left:0;right:0;text-align:center;font:900 112px/1 'Inter Display';letter-spacing:-.035em;text-transform:uppercase}}
.cline span{{display:inline-block}}
.cline b{{background:#ffd31a;padding:0 .06em;font-weight:900}}
.save{{position:absolute;left:150px;width:780px;top:950px;padding:34px 0;background:#141414;color:#fff;text-align:center;
  font:900 62px 'Inter Display';letter-spacing:.01em;border-radius:22px;box-shadow:0 10px 0 #d8352a}}
.src{{position:absolute;left:0;right:0;top:1160px;text-align:center;font:600 28px Inter;color:#6a5e4c}}
#cap{{position:absolute;left:60px;width:900px;top:1286px;text-align:center;font:900 70px/1.12 'Inter Display';letter-spacing:-.015em;
  text-transform:uppercase;transform-origin:50% 50%}}
#cap span{{display:inline-block;padding:2px 12px;margin:0 2px;border-radius:8px}}
#cap span.on{{background:#ffd31a;transform:rotate(-1.5deg) scale(1.06)}}
#cap span.past{{color:#141414}} #cap span.fut{{color:#14141455}}
.guide{{position:absolute;background:#ff00ff22;border:2px dashed #f0f}}
"""

JS = """
const TL=__TL__, CAPS=__CAPS__, TR=__TR__;
const S=[...document.querySelectorAll('.scene')];
const E=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
const B=x=>{x=Math.min(1,Math.max(0,x));const c1=1.9,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function apply(i,lt){
  const sc=S[i], d=TL[i].end-TL[i].start, k=Math.min(1,lt/d);
  sc.querySelector('.cam').style.transform=`scale(${1+0.055*k}) translateY(${-18*k}px) rotate(${0.4*k}deg)`;
  sc.querySelectorAll('[data-a]').forEach(el=>{
    const a=el.dataset.a,t0=+el.dataset.t,du=+el.dataset.d,r=+el.dataset.r,p=(lt-t0)/du,e=E(p),on=p>0?1:0;
    if(a==='fade'){el.style.opacity=e}
    else if(a==='slide'){el.style.opacity=Math.min(1,Math.max(0,p*2.5));el.style.transform=`translateY(${(1-e)*80}px) rotate(${r}deg)`}
    else if(a==='pop'){el.style.opacity=on;el.style.transform=`scale(${0.4+0.6*B(p)}) rotate(${r}deg)`}
    else if(a==='slap'){el.style.opacity=on;el.style.transform=`scale(${1+0.55*(1-e)}) rotate(${r+(1-e)*-6}deg)`}
    else if(a==='stamp'){el.style.opacity=Math.min(1,Math.max(0,p*4));el.style.transform=`scale(${2.4-1.4*e}) rotate(${r}deg)`}
    else if(a==='draw'){el.style.strokeDashoffset=1-e;el.style.opacity=on}
    else if(a==='hl'){el.style.backgroundSize=`${e*100}% 88%`}
  });
}
let lastKey='';
window.setT=t=>{
  let i=TL.findIndex(s=>t>=s.start&&t<s.end); if(i<0)i=TL.length-1;
  const lt=t-TL[i].start, tr=i>0&&lt<TR;
  S.forEach((s,j)=>s.style.display=(j===i||(tr&&j===i-1))?'block':'none');
  apply(i,lt);
  if(tr){const e=E(lt/TR);apply(i-1,TL[i-1].end-TL[i-1].start);
    S[i-1].style.transform=`translateX(${-e*105}%) rotate(${-e*3}deg)`;
    S[i].style.transform=`translateX(${(1-e)*105}%) rotate(${(1-e)*3}deg)`;}
  else S[i].style.transform='none';
  const fr=Math.floor(t*15);
  document.getElementById('grain').style.backgroundPosition=`${(fr*137)%320}px ${(fr*211)%320}px`;
  const cap=document.getElementById('cap'), g=CAPS[i].find(g=>lt>=g.t0&&lt<g.t1);
  if(!g){cap.innerHTML='';lastKey='';return;}
  const key=i+':'+g.t0; let ai=-1; g.w.forEach((w,k)=>{if(lt>=w[1])ai=k});
  if(key!==lastKey){cap.innerHTML=g.w.map(w=>`<span>${w[0]}</span>`).join(' ');lastKey=key;}
  [...cap.children].forEach((s,k)=>s.className=k===ai?'on':(k<ai?'past':'past'));
  const pe=E((lt-g.t0)/0.14); cap.style.transform=`scale(${0.86+0.14*pe})`; cap.style.opacity=pe;
};
"""

guides = ""
if GUIDES:
    guides = ('<div class="guide" style="left:0;right:0;top:0;height:220px"></div>'
              '<div class="guide" style="left:0;right:0;bottom:0;height:420px"></div>'
              '<div class="guide" style="right:0;width:130px;top:1050px;height:450px"></div>')

body = "".join(f"<section class='scene'><div class='cam'>{scene_html(sc)}</div></section>" for sc in SCENES)
tl_js = [{"start": s["start"], "end": s["end"]} for s in timeline]
html = (f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}"
        f"<div id='vig'></div><div id='grain'></div><div id='cap'></div>{guides}"
        f"<script>{JS.replace('__TL__', json.dumps(tl_js)).replace('__CAPS__', json.dumps(CAPS)).replace('__TR__', str(TR))}</script></body></html>")
open(f"{BUILD}/reel.html", "w").write(html)
for s in timeline[1:]:
    SFX.append((s["start"], "whoosh"))

# ------------------------------------------------------------------ audio: music bed + sfx
rng = np.random.default_rng(3)
n = int(TOTAL * SR) + SR
narr, _ = sf.read(f"{BUILD}/narr.wav", dtype="float32")
narr = np.pad(narr, (0, max(0, n - len(narr))))[:n]


def lp(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")


sfx = np.zeros(n, np.float32)
for at, kind in SFX:
    i = int(at * SR)
    if kind == "whoosh":
        L = int(0.55 * SR); nz = rng.standard_normal(L)
        band = lp(nz, 6) - lp(nz, 60)
        env = np.concatenate([np.linspace(0, 1, int(L * .65)) ** 2, np.linspace(1, 0, L - int(L * .65)) ** 1.5])
        seg = band * env * 0.22; i -= int(L * .6)
    else:  # thump: soft paper slap
        L = int(0.16 * SR); tt = np.arange(L) / SR
        seg = (np.sin(2 * np.pi * 95 * tt) * np.exp(-tt * 28) * 0.32 +
               lp(rng.standard_normal(L), 3) * np.exp(-tt * 70) * 0.10)
    i = max(0, i); seg = seg[: n - i]; sfx[i:i + len(seg)] += seg.astype(np.float32)

# original underscore: Am-F-C-G pad + plucked arpeggio + soft kick, 100 bpm
bpm, beat = 100, 60 / 100
tt = np.arange(n) / SR
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
bar = 4 * beat
pad = np.zeros(n, np.float32); arp = np.zeros(n, np.float32); kick = np.zeros(n, np.float32)
for b in range(int(TOTAL / bar) + 2):
    ch = CH[b % 4]; s0 = int(b * bar * SR); L = int(bar * SR * 1.15); seg_t = np.arange(L) / SR
    if s0 >= n:
        break
    env = np.minimum(1, seg_t / 0.35) * np.minimum(1, (bar * 1.15 - seg_t) / 0.4)
    v = sum(np.sin(2 * np.pi * hz(m - 12) * seg_t * (1 + d)) for m in ch for d in (-.002, .002)) * env / 6
    e = min(n, s0 + L); pad[s0:e] += v[: e - s0].astype(np.float32)
    for k in range(8):
        m = ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12
        s1 = int((b * bar + k * beat / 2) * SR); L2 = int(0.4 * SR); t2 = np.arange(L2) / SR
        v2 = (np.sin(2 * np.pi * hz(m) * t2) + .3 * np.sin(4 * np.pi * hz(m) * t2)) * np.exp(-t2 * 9) * .5
        e2 = min(n, s1 + L2)
        if s1 < n: arp[s1:e2] += v2[: e2 - s1].astype(np.float32)
    for k in (0, 2):
        s2 = int((b * bar + k * beat) * SR); L3 = int(.25 * SR); t3 = np.arange(L3) / SR
        v3 = np.sin(2 * np.pi * (52 + 60 * np.exp(-t3 * 30)) * t3) * np.exp(-t3 * 14)
        e3 = min(n, s2 + L3)
        if s2 < n: kick[s2:e3] += v3[: e3 - s2].astype(np.float32)
music = pad * 0.55 + lp(arp, 4) * 0.35 + kick * 0.45
music *= np.minimum(1, tt / 1.0) * np.minimum(1, (TOTAL - tt) / 1.5).clip(0)
env = np.sqrt(lp(narr ** 2, int(0.08 * SR))); env /= env.max() + 1e-9
music *= (1 - 0.55 * np.clip(env * 3, 0, 1))          # duck under voice
voice_rms = np.sqrt(np.mean(narr[np.abs(narr) > 0.01] ** 2))
music *= (voice_rms * 10 ** (-17 / 20)) / (np.sqrt(np.mean(music ** 2)) + 1e-9)   # bed ~17 dB under voice
sfx *= (voice_rms * 10 ** (-9 / 20)) / (np.max(np.abs(sfx)) * 0.5 + 1e-9)
mix = narr + music + sfx
mix_nm = narr + sfx
for arr, name in ((mix, "mix.wav"), (mix_nm, "mix_nomusic.wav")):
    sf.write(f"{BUILD}/{name}", (arr / max(1.0, np.abs(arr).max() / 0.95))[: int(TOTAL * SR)], SR)
print("audio written; sfx events:", len(SFX))

# ------------------------------------------------------------------ frames
from playwright.sync_api import sync_playwright  # noqa: E402

with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={"width": W, "height": H})
    pg.goto("file://" + os.path.abspath(f"{BUILD}/reel.html"))
    pg.wait_for_timeout(800)
    if PREVIEW:
        os.makedirs(f"{BUILD}/rprev", exist_ok=True)
        for s in timeline:
            for ci, c in enumerate(s["chunks"]):
                pg.evaluate(f"setT({s['start'] + c['t'] + c['dur'] * 0.95})")
                pg.screenshot(path=f"{BUILD}/rprev/{s['id']}_{ci}.png")
        pg.evaluate("setT(0.02)"); pg.screenshot(path=f"{BUILD}/rprev/000_first.png")
        pg.evaluate(f"setT({timeline[1]['start'] + 0.15})"); pg.screenshot(path=f"{BUILD}/rprev/001_transition.png")
        print("preview written"); sys.exit()
    vid = f"{BUILD}/reel_video.mp4"
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "4500k", "-bufsize", "9000k",
                           "-profile:v", "high", "-pix_fmt", "yuv420p", vid],
                          stdin=subprocess.PIPE)
    N = int(TOTAL * FPS)
    for f in range(N):
        pg.evaluate(f"setT({f / FPS})")
        ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
        if f % 300 == 0:
            print(f"frame {f}/{N}", flush=True)
    ff.stdin.close(); ff.wait(); br.close()

for wav, out in (("mix.wav", f"{OUT}.mp4"), ("mix_nomusic.wav", f"{OUT}_nomusic.mp4")):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", vid, "-i", f"{BUILD}/{wav}", "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", "-shortest", out], check=True)
    print("wrote", out)
