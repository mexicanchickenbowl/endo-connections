# EPT explainer — "Is it dark magic?"

A ~5-minute narrated, captioned animation on how an electric pulp tester works: the circuit,
the ramping pulse train, Ohm's law, dentinal tubules, A-δ vs C fibers, what the number means,
false positives/negatives, and the evidence on accuracy and pacemakers.

- `ept-explainer.mp4` — the rendered video (1080p, 30 fps, narration + burned-in captions)
- `index.html` — the same animation as an interactive player (chapters, captions toggle, transcript, sources)

## Rebuilding

Everything is generated from `script.json` (narration text with `{marker}` beats).

```sh
# 1. narration (local Kokoro-82M TTS; model files from github.com/thewh1teagle/kokoro-onnx releases)
pip install kokoro-onnx soundfile
python3 tools/narrate.py kokoro-v1.0.onnx voices-v1.0.bin /tmp/ept-audio

# 2. timeline.js + narration.mp3
python3 tools/build_timeline.py build /tmp/ept-audio

# 3. video (Playwright Chromium + ffmpeg)
NODE_PATH=$(npm root -g) node tools/render.cjs video ept-explainer.mp4
```

`node tools/render.cjs snap OUT_DIR 12.5 40 …` renders PNG stills for checking layout.
