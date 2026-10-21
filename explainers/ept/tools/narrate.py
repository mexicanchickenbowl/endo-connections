#!/usr/bin/env python3
"""Synthesize the narration locally with Kokoro-82M (kokoro-onnx), one clip per scene.

  pip install kokoro-onnx soundfile
  # model files: github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
  python3 tools/narrate.py MODEL.onnx VOICES.bin OUT_DIR [--voice af_heart] [--speed 1.0] [--script script.json]

Each sentence is synthesized separately and joined with a short pause, so OUT_DIR/<scene>.json
records exact sentence spans for build_timeline.py (no silence detection needed).
"""
import argparse, json, os, re
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MARK = re.compile(r"\{(\w+)\}")
PAUSE = 0.38  # seconds between sentences


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model"); ap.add_argument("voices"); ap.add_argument("out")
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--script", default="script.json")
    a = ap.parse_args()
    with open(os.path.join(ROOT, a.script)) as f:
        script = json.load(f)
    subs = script.get("tts_subs", {})
    k = Kokoro(a.model, a.voices)
    os.makedirs(a.out, exist_ok=True)
    for sc in script["scenes"]:
        if a.only and sc["id"] not in a.only:
            continue
        chunks, spans, t, sr = [], [], 0.0, 24000
        for s in sc["sentences"]:
            text = MARK.sub("", s).strip()
            for x, y in subs.items():
                text = text.replace(x, y)
            audio, sr = k.create(text, voice=a.voice, speed=a.speed, lang="en-us")
            audio = trim(audio, sr)
            spans.append([round(t, 3), round(t + len(audio) / sr, 3)])
            chunks += [audio, np.zeros(int(PAUSE * sr), dtype=audio.dtype)]
            t += len(audio) / sr + PAUSE
        wav = np.concatenate(chunks[:-1])
        sf.write(os.path.join(a.out, sc["id"] + ".wav"), wav, sr)
        with open(os.path.join(a.out, sc["id"] + ".json"), "w") as f:
            json.dump({"spans": spans, "duration": round(len(wav) / sr, 3)}, f)
        print(f"{sc['id']}: {len(wav) / sr:.1f}s")


def trim(x, sr, thresh=0.004):
    """Drop leading/trailing near-silence so sentence spans are tight."""
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    pad = int(0.03 * sr)
    return x[max(idx[0] - pad, 0): idx[-1] + pad]


if __name__ == "__main__":
    main()
