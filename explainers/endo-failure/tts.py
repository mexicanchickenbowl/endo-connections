"""Synthesise narration with the default Chatterbox voice, with automatic QA.

For every chunk: generate -> trim -> transcribe (Whisper words + wav2vec2 IPA)
-> must pass the chunk's IPA regex checks and roughly match the caption.
Failing takes are regenerated with a new seed (best take kept).

Usage: python tts.py OUT_DIR [content_module]
"""
import difflib, hashlib, importlib, json, os, re, sys, time

import librosa, numpy as np, soundfile as sf, torch
from transformers.utils import logging as tl

tl.set_verbosity_error()
from chatterbox.tts import ChatterboxTTS
from faster_whisper import WhisperModel
from transformers import AutoModelForCTC, Wav2Vec2FeatureExtractor
from huggingface_hub import hf_hub_download

sys.path.insert(0, os.path.dirname(__file__))
SCENES = importlib.import_module(sys.argv[2] if len(sys.argv) > 2 else "content").SCENES

OUT = sys.argv[1]
os.makedirs(f"{OUT}/chunks", exist_ok=True)
MAX_TRIES, MIN_SIM = 5, 0.8

tts = ChatterboxTTS.from_pretrained(device="cpu")  # no audio prompt => default voice
SR = tts.sr
wm = WhisperModel("small.en", device="cpu", compute_type="int8")
R = "facebook/wav2vec2-lv-60-espeak-cv-ft"
pm = AutoModelForCTC.from_pretrained(R)
fe = Wav2Vec2FeatureExtractor.from_pretrained(R)
inv = {v: k for k, v in json.load(open(hf_hub_download(R, "vocab.json"))).items()}


def ipa(y):
    y16 = librosa.resample(y, orig_sr=SR, target_sr=16000)
    with torch.no_grad():
        ids = pm(**fe(y16, sampling_rate=16000, return_tensors="pt")).logits.argmax(-1)[0].tolist()
    out, prev = [], None
    for i in ids:
        if i != prev and inv[i] not in ("<pad>", "<s>", "</s>"):
            out.append(inv[i])
        prev = i
    return "".join(out)


def words(s):
    return re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("-", " ")).split()


def sim(a, b):
    return difflib.SequenceMatcher(None, words(a), words(b)).ratio()


manifest = []
t0 = time.time()
for si, sc in enumerate(SCENES):
    for ci, ch in enumerate(sc["chunks"]):
        key = hashlib.md5(ch["say"].encode()).hexdigest()[:10]
        path = f"{OUT}/chunks/{sc['id']}_{ci}_{key}.wav"
        meta_path = path + ".json"
        if os.path.exists(meta_path):
            manifest.append(json.load(open(meta_path)))
            continue
        best = None
        for attempt in range(MAX_TRIES):
            seed = 1000 * si + 10 * ci + attempt
            torch.manual_seed(seed)
            y = tts.generate(ch["say"]).squeeze(0).numpy()
            y, _ = librosa.effects.trim(y, top_db=38)
            p = ipa(y)
            segs, _ = wm.transcribe(librosa.resample(y, orig_sr=SR, target_sr=16000), beam_size=5,
                                    word_timestamps=True)
            segs = list(segs)
            heard = " ".join(s.text.strip() for s in segs)
            wts = [(w.word.strip(), round(w.start, 3), round(w.end, 3)) for s_ in segs for w in (s_.words or [])]
            passed = [bool(re.search(c, p)) for c in ch["checks"]]
            s = sim(heard, ch["cap"])
            # guard against runaway/garbled takes: plausible speaking rate
            dur = len(y) / SR
            wps = len(words(ch["cap"])) / max(dur, 0.1)
            ok_rate = 1.4 < wps < 4.2
            score = sum(passed) - len(passed) + s + (0 if ok_rate else -1)
            take = dict(scene=sc["id"], idx=ci, seed=seed, sim=round(s, 3), checks=passed, heard=heard,
                        ipa=p, dur=round(dur, 3), wps=round(wps, 2), score=score, y=y, words=wts)
            if best is None or score > best["score"]:
                best = take
            print(f"[{time.time()-t0:6.0f}s] {sc['id']}#{ci} try{attempt} sim={s:.2f} checks={passed} "
                  f"wps={wps:.1f} :: {heard}", flush=True)
            if all(passed) and s >= MIN_SIM and ok_rate:
                break
        y = best.pop("y")
        fade = int(0.015 * SR)
        y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
        sf.write(path, y, SR)
        best.update(path=path, cap=ch["cap"], say=ch["say"], sr=SR,
                    passed_all=all(best["checks"]) and best["sim"] >= MIN_SIM)
        json.dump(best, open(meta_path, "w"), indent=1)
        manifest.append(best)

json.dump(manifest, open(f"{OUT}/manifest.json", "w"), indent=1)
bad = [m for m in manifest if not m["passed_all"]]
print(f"DONE {len(manifest)} chunks, {sum(m['dur'] for m in manifest):.1f}s speech; "
      f"{len(bad)} below threshold: {[(m['scene'], m['idx'], m['sim'], m['checks']) for m in bad]}")
