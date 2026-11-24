"""Procedural soft music bed + paper whooshes, ducked under the narration. Writes mix.wav and captions.srt."""
import json, os
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
tl = json.load(open(os.path.join(HERE, "timeline.json")))
voice, vsr = sf.read(os.path.join(HERE, "narration.wav"), dtype="float32")
if voice.ndim > 1:
    voice = voice.mean(1)
n_out = int(len(voice) * SR / vsr)
voice = np.interp(np.linspace(0, len(voice) - 1, n_out), np.arange(len(voice)), voice).astype("float32")
N = len(voice)
t = np.arange(N) / SR
rng = np.random.default_rng(3)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(0, len(x), 4096):  # block-wise python loop is slow; use lfilter-like via cumulative trick
        pass
    # vectorised one-pole via scipy-free recursion using np.frompyfunc is slow; use FFT lowpass instead
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x)).astype("float32")


# chords (D major, gentle): Dmaj9, Bm7, Gmaj7, A6sus
CH = [[50, 57, 62, 66, 69, 76], [47, 54, 62, 66, 69, 74], [43, 55, 62, 66, 71, 74], [45, 57, 61, 64, 69, 76]]
BPM = 70
beat = 60 / BPM
bar = 4 * beat
pad = np.zeros(N, "float32")
for b in range(int(N / SR / bar) + 2):
    notes = CH[b % 4]
    s0 = b * bar
    i0 = int(max(0, (s0 - 0.6) * SR)); i1 = min(N, int((s0 + bar + 1.2) * SR))
    if i0 >= N:
        break
    tt = t[i0:i1] - s0
    env = np.clip((tt + 0.6) / 1.2, 0, 1) * np.clip((bar + 1.2 - tt) / 1.4, 0, 1)
    env = env ** 1.5
    seg = np.zeros(i1 - i0, "float32")
    for j, m in enumerate(notes):
        f = midi(m + 12 if j == 0 else m)
        amp = 0.55 if j == 0 else 0.32
        for det in (-0.0025, 0.0, 0.0028):
            ph = rng.random() * 6.28
            seg += amp * (np.sin(2 * np.pi * f * (1 + det) * tt + ph) + 0.18 * np.sin(4 * np.pi * f * (1 + det) * tt + ph))
    # slow tremolo for movement
    seg *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * (tt + s0))
    pad[i0:i1] += seg * env
pad = onepole(pad, 1400)

# soft felt-piano-ish plucks on an arpeggio, eighth notes, sparse
pl = np.zeros(N, "float32")
PAT = [0, 2, 3, 4, 3, 2, 4, 5]
for b in range(int(N / SR / bar) + 1):
    notes = CH[b % 4]
    for k in range(8):
        if (b * 8 + k) % 3 == 2:
            continue
        st = b * bar + k * beat / 2
        i0 = int(st * SR)
        if i0 >= N:
            break
        L = min(int(1.6 * SR), N - i0)
        tt = np.arange(L) / SR
        f = midi(notes[PAT[k] % len(notes)] + 12)
        e = np.exp(-tt * 3.2) * np.clip(tt / 0.006, 0, 1)
        pl[i0:i0 + L] += (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 6)) * e * 0.33
pl = onepole(pl, 2600)

music = pad * 0.6 + pl
# reverb: convolve with decaying noise IR
L = int(2.2 * SR)
ir = rng.normal(0, 1, L).astype("float32") * np.exp(-np.arange(L) / SR * 3.0).astype("float32")
ir[0] = 0
ir = onepole(ir, 3500)
nfft = 1 << int(np.ceil(np.log2(N + L)))
wet = np.fft.irfft(np.fft.rfft(music, nfft) * np.fft.rfft(ir, nfft), nfft)[:N].astype("float32")
wet /= np.max(np.abs(wet)) + 1e-9
music = music / (np.max(np.abs(music)) + 1e-9)
music = 0.55 * music + 0.75 * wet

# fades
fi = np.clip(t / 2.0, 0, 1); fo = np.clip((t[-1] - t) / 3.0, 0, 1)
music *= fi * fo

# whooshes at scene changes (paper slide)
wh = np.zeros(N, "float32")
for sc in tl["scenes"][1:]:
    c = sc["s"] - 0.18
    Lw = int(0.6 * SR); i0 = int((c - 0.3) * SR)
    if i0 < 0 or i0 + Lw > N:
        continue
    x = rng.normal(0, 1, Lw).astype("float32")
    X = np.fft.rfft(x); f = np.fft.rfftfreq(Lw, 1 / SR)
    X *= np.exp(-((np.log(f + 1) - np.log(1800)) ** 2) / 0.9)
    x = np.fft.irfft(X, Lw).astype("float32")
    tt = np.arange(Lw) / Lw
    env = np.sin(np.pi * tt ** 0.7) ** 2
    wh[i0:i0 + Lw] += x / (np.max(np.abs(x)) + 1e-9) * env

# ducking from the voice envelope
win = int(0.05 * SR)
ve = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
ve = np.clip(ve / (np.percentile(ve[ve > 1e-4], 90) + 1e-9), 0, 1)
# attack fast, release slow
rel = np.exp(-1 / (0.45 * SR / 64)); att = np.exp(-1 / (0.04 * SR / 64))
ds = ve[::64].copy(); g = 0.0
for i in range(len(ds)):
    a = att if ds[i] > g else rel
    g = a * g + (1 - a) * ds[i]; ds[i] = g
duck = np.interp(np.arange(N), np.arange(len(ds)) * 64, ds)
mgain = 1 - 0.55 * duck

vrms = np.sqrt(np.mean(voice[np.abs(voice) > 0.02] ** 2))
mrms = np.sqrt(np.mean(music ** 2)) + 1e-9
music = music / mrms * vrms * 0.20 * mgain
wh = wh / (np.sqrt(np.mean(wh[wh != 0] ** 2)) + 1e-9) * vrms * 0.10
mix = voice + music + wh
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
sf.write(os.path.join(HERE, "mix.wav"), np.stack([mix, mix], 1), SR)
sf.write(os.path.join(HERE, "voice48.wav"), voice, SR)


def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


out = []
i = 1
for sc in tl["scenes"]:
    for ln in sc["lines"]:
        words = ln["words"]
        # split long lines at sentence ends into cues of <= ~12 words
        cur = []
        for k, w in enumerate(words):
            cur.append(w)
            if (w["w"][-1] in ".?!" and len(cur) >= 3) or len(cur) >= 12 or k == len(words) - 1:
                out.append(f"{i}\n{ts(cur[0]['s'])} --> {ts(cur[-1]['e'] + 0.15)}\n{' '.join(x['w'] for x in cur)}\n")
                i += 1; cur = []
open(os.path.join(HERE, "captions.srt"), "w").write("\n".join(out))
print("mix ok", N / SR)
