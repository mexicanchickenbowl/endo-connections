import json, re, sys, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, "..", "models")
SPEED = 1.04
LINE_GAP = 0.22
SCENE_GAP = 0.50
LEAD_IN = 0.35
TAIL = 1.6

kokoro = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
script = json.load(open(os.path.join(HERE, "script.json")))


def trim(x, sr, thresh=0.012, pad=0.04):
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]


def weight(tok):
    core = re.sub(r"[^\w%]", "", tok)
    w = 0.0
    if re.fullmatch(r"\d{4}", core):
        w = 14
    elif re.fullmatch(r"\d+%?", core):
        n = int(core.rstrip("%"))
        w = 4 if n < 10 else (9 if n % 10 == 0 or n < 20 else 12)
        if n == 100:
            w = 10
        if core.endswith("%"):
            w += 7
    else:
        w = len(core) + 1.5
    if tok[-1] in ",:":
        w += 3
    if tok[-1] in ".?!":
        w += 5
    return w


sr_out = None
audio = []
t = LEAD_IN
scenes = []
for si, sc in enumerate(script):
    lines = []
    for li, ln in enumerate(sc["lines"]):
        x, sr = kokoro.create(ln["say"], voice="af_heart", speed=SPEED, lang="en-us")
        x = trim(np.asarray(x, dtype=np.float32), sr)
        if sr_out is None:
            sr_out = sr
            audio.append(np.zeros(int(LEAD_IN * sr), dtype=np.float32))
        dur = len(x) / sr
        toks = ln["show"].split()
        ws = [weight(k) for k in toks]
        tot = sum(ws)
        words, acc = [], 0.0
        for k, w in zip(toks, ws):
            words.append({"w": k, "s": round(t + dur * acc / tot, 3), "e": round(t + dur * (acc + w) / tot, 3)})
            acc += w
        lines.append({"s": round(t, 3), "e": round(t + dur, 3), "show": ln["show"], "words": words})
        audio.append(x)
        last_line = li == len(sc["lines"]) - 1
        last_scene = si == len(script) - 1
        gap = 0 if (last_line and last_scene) else (SCENE_GAP if last_line else LINE_GAP)
        audio.append(np.zeros(int(gap * sr), dtype=np.float32))
        t += dur + gap
        print(f"{sc['id']}.{li} {dur:.2f}s  {ln['say']}", flush=True)
    scenes.append({"id": sc["id"], "s": lines[0]["s"], "e": lines[-1]["e"], "lines": lines})

audio.append(np.zeros(int(TAIL * sr_out), dtype=np.float32))
full = np.concatenate(audio)
full = full / max(1e-6, np.max(np.abs(full))) * 0.89
sf.write(os.path.join(HERE, "narration.wav"), full, sr_out)
total = len(full) / sr_out
json.dump({"total": round(total, 3), "scenes": scenes}, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
print("TOTAL", total)
