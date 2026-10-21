# EPT explainer — "Is it dark magic?"

A narrated, captioned animation on how an electric pulp tester works, in two cuts:

- **1-minute cut** — `ept-explainer-1min.mp4` (61 s): the circuit, the ramping pulse train,
  Ohm's law, A-δ fibers firing, and why the number isn't a grade.
- **Full cut** — `ept-explainer-full.mp4` (5:22): adds dentinal tubules and probe placement,
  A-δ vs C fibers, sensibility vs vitality, false positives/negatives, accuracy (Petersson 1999,
  Jespersen 2014) and pacemakers (Wilson 2006).

`index.html` plays either cut interactively (chapters, captions toggle, transcript, sources):
the 1-minute cut by default, the full cut with `?cut=full`.

## Rebuilding

Each cut is generated from its script — `script-1min.json` or `script.json` — whose `{marker}`
beats drive the shared scene animations.

```sh
# 1. narration (local Kokoro-82M TTS; model files from github.com/thewh1teagle/kokoro-onnx releases)
pip install kokoro-onnx soundfile
python3 tools/narrate.py kokoro-v1.0.onnx voices-v1.0.bin /tmp/ept-1min --script script-1min.json --speed 1.05

# 2. timeline-1min.js + narration-1min.mp3
python3 tools/build_timeline.py build /tmp/ept-1min --script script-1min.json

# 3. video (Playwright Chromium + ffmpeg)
NODE_PATH=$(npm root -g) node tools/render.cjs video ept-explainer-1min.mp4 --cut 1min
```

For the full cut, drop `--script` / `--speed` and use `--cut full`.
`node tools/render.cjs snap OUT_DIR --cut 1min 12.5 40 …` renders PNG stills for checking layout.
