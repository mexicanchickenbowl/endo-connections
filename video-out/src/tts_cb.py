"""Chatterbox (default voice) narration: two takes per line, Whisper transcript check picks the clean one.
Lines where neither take is clean are re-voiced (two more takes per round)."""
import json, os, re, sys, difflib
import numpy as np
import soundfile as sf
import torch

HERE = os.path.dirname(os.path.abspath(__file__))
TAKES = os.path.join(HERE, "takes"); os.makedirs(TAKES, exist_ok=True)
LOG = os.path.join(HERE, "takes_log.json")
LINE_GAP, SCENE_GAP, LEAD_IN, TAIL = 0.22, 0.50, 0.35, 1.6
TAKES_PER_ROUND, MAX_ROUNDS = 2, 5

torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
from faster_whisper import WhisperModel
tts = ChatterboxTTS.from_pretrained(device="cpu")
SR = tts.sr
asr = WhisperModel("small.en", device="cpu", compute_type="int8")
script = json.load(open(os.path.join(HERE, "script.json")))

NUM = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"}
NAME = {"mainkar", "maincar", "main", "car", "kar", "manker", "mankar", "minecar", "kim", "chem", "kem"}


def tok(word):
    w = word.lower().replace("’", "'").replace("'", "").replace("-", "")
    w = re.sub(r"[^a-z0-9]", "", w)
    return NUM.get(w, w)


def norm(text):
    t = text.lower().replace("%", " percent ").replace("co-resident", "coresident").replace("co resident", "coresident")
    toks = [tok(w) for w in t.split()]
    toks = [w for w in toks if w and w not in NAME and w != "percent"]
    s = " ".join(toks)
    s = s.replace("1 hundred", "100").replace("a hundred", "100")
    return s.split()


def wer(ref, hyp):
    if "".join(ref) == "".join(hyp):  # same words, only spacing differs ("72 93" vs "7293", "co -resident")
        return 0.0
    sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
    errs = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal")
    return errs / max(1, len(ref))


def trim(x, thresh=0.012, pad=0.05):
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(pad * SR)): min(len(x), idx[-1] + int(pad * SR))]


def to16k(x):
    n = int(len(x) * 16000 / SR)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype("float32")


def transcribe(x):
    segs, _ = asr.transcribe(to16k(x), word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    words = []
    for s in segs:
        for w in (s.words or []):
            words.append({"w": w.word.strip(), "s": float(w.start), "e": float(w.end)})
    return words


log = json.load(open(LOG)) if os.path.exists(LOG) else {}
for sc in script:
    for li, ln in enumerate(sc["lines"]):
        key = f"{sc['id']}.{li}"
        if key in log and log[key].get("chosen") is not None:
            continue
        ref = norm(ln["show"])
        expect = 0.33 + 0.068 * len(ln["say"])  # rough seconds, to catch run-on / truncated takes
        entry = {"say": ln["say"], "takes": [], "chosen": None, "rounds": 0}
        for rnd in range(MAX_ROUNDS):
            entry["rounds"] = rnd + 1
            for k in range(TAKES_PER_ROUND):
                n = rnd * TAKES_PER_ROUND + k
                torch.manual_seed(1000 * (abs(hash(key)) % 997) + n)
                wav = tts.generate(ln["say"])
                x = trim(wav.squeeze(0).cpu().numpy().astype("float32"))
                path = os.path.join(TAKES, f"{key}_t{n}.wav")
                sf.write(path, x, SR)
                words = transcribe(x)
                hyp_text = " ".join(w["w"] for w in words)
                e = wer(ref, norm(hyp_text))
                dur = len(x) / SR
                dur_ok = 0.5 * expect <= dur <= 1.9 * expect + 0.6
                entry["takes"].append({"n": n, "file": os.path.basename(path), "dur": round(dur, 2), "heard": hyp_text, "wer": round(e, 3), "dur_ok": dur_ok, "clean": e == 0 and dur_ok, "words": words})
                print(f"{key} take{n} dur={dur:.2f} wer={e:.2f} clean={e == 0 and dur_ok} | {hyp_text}", flush=True)
            clean = [t for t in entry["takes"] if t["clean"]]
            if clean:
                # among clean takes prefer the one whose pace is closest to the expected pace
                entry["chosen"] = min(clean, key=lambda t: abs(t["dur"] - expect))["n"]
                break
            print(f"{key}: no clean take in round {rnd + 1}, re-voicing", flush=True)
        if entry["chosen"] is None:
            best = min(entry["takes"], key=lambda t: (t["wer"], abs(t["dur"] - expect)))
            entry["chosen"] = best["n"]; entry["forced"] = True
            print(f"{key}: NO CLEAN TAKE after {MAX_ROUNDS} rounds; using best wer={best['wer']}", flush=True)
        log[key] = entry
        json.dump(log, open(LOG, "w"), indent=1)

# ---------- assemble narration + timeline ----------
def weight(tk):
    core = re.sub(r"[^\w%]", "", tk)
    if re.fullmatch(r"\d{4}", core): w = 14
    elif re.fullmatch(r"\d+%?", core):
        n = int(core.rstrip("%")); w = 4 if n < 10 else (9 if n % 10 == 0 or n < 20 else 12)
        if core.endswith("%"): w += 7
    else: w = len(core) + 1.5
    if tk[-1] in ",:": w += 3
    if tk[-1] in ".?!": w += 5
    return w


def align(show_words, heard, dur):
    """word timings for the on-screen caption words, anchored on Whisper word timestamps."""
    st = [tok(w.replace("%", "")) for w in show_words]
    ht = [tok(w["w"].replace("%", "")) for w in heard]
    starts = [None] * len(st)
    sm = difflib.SequenceMatcher(None, st, ht, autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for i in range(n):
            starts[a + i] = min(max(heard[b + i]["s"], 0.0), dur)
    starts[0] = 0.0 if starts[0] is None else min(starts[0], 0.12)
    # fill gaps by weight interpolation between anchors
    anchors = [(i, s) for i, s in enumerate(starts) if s is not None] + [(len(st), dur)]
    for (i0, s0), (i1, s1) in zip(anchors, anchors[1:]):
        ws = [weight(show_words[i]) for i in range(i0, i1)]
        tot, acc = sum(ws), 0.0
        for j, i in enumerate(range(i0, i1)):
            starts[i] = s0 + (s1 - s0) * acc / tot
            acc += ws[j]
    for i in range(1, len(starts)):
        starts[i] = max(starts[i], starts[i - 1] + 0.03)
    return starts


audio = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
t = LEAD_IN
scenes = []
for si, sc in enumerate(script):
    lines = []
    for li, ln in enumerate(sc["lines"]):
        e = log[f"{sc['id']}.{li}"]
        tk = next(x for x in e["takes"] if x["n"] == e["chosen"])
        x, _ = sf.read(os.path.join(TAKES, tk["file"]), dtype="float32")
        rms = np.sqrt(np.mean(x ** 2)) + 1e-9
        x = np.clip(x * (0.075 / rms), -0.98, 0.98)
        fade = int(0.012 * SR)
        x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
        dur = len(x) / SR
        toks = ln["show"].split()
        st = align(toks, tk["words"], dur)
        words = [{"w": w, "s": round(t + st[i], 3), "e": round(t + (st[i + 1] if i + 1 < len(toks) else dur), 3)} for i, w in enumerate(toks)]
        lines.append({"s": round(t, 3), "e": round(t + dur, 3), "show": ln["show"], "words": words})
        last_line, last_scene = li == len(sc["lines"]) - 1, si == len(script) - 1
        gap = 0 if (last_line and last_scene) else (SCENE_GAP if last_line else LINE_GAP)
        audio += [x, np.zeros(int(gap * SR), dtype=np.float32)]
        t += dur + gap
    scenes.append({"id": sc["id"], "s": lines[0]["s"], "e": lines[-1]["e"], "lines": lines})
audio.append(np.zeros(int(TAIL * SR), dtype=np.float32))
full = np.concatenate(audio)
full = full / max(1e-6, np.max(np.abs(full))) * 0.89
sf.write(os.path.join(HERE, "narration.wav"), full, SR)
json.dump({"total": round(len(full) / SR, 3), "scenes": scenes}, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)

nlines = len(log)
revoiced = [k for k, v in log.items() if v["rounds"] > 1]
onebad = [k for k, v in log.items() if v["rounds"] == 1 and any(not t["clean"] for t in v["takes"])]
forced = [k for k, v in log.items() if v.get("forced")]
print(f"SUMMARY lines={nlines} total={len(full) / SR:.1f}s revoiced={revoiced} one_take_rejected={onebad} forced={forced}")
