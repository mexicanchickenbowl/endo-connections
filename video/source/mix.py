# Final audio mix: narration + ducked music bed + synthesized SFX, loudness-normalized.
import json, sys, numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt

S = sys.argv[1]; music = sys.argv[2]
SR = 48000
tm = json.loads(open(f"{S}/web/timings.js").read()[len("window.TIMINGS="):-1])
total = tm["total"]; N = int(total * SR)
rng = np.random.default_rng(7)

# --- narration
v, vsr = sf.read(f"{S}/narration.wav")
v = librosa.resample(v, orig_sr=vsr, target_sr=SR)
v = np.pad(v, (0, max(0, N - len(v))))[:N]
# gentle voice polish: high-pass 80 Hz + light presence boost via parallel band
v = sosfilt(butter(2, 80, 'hp', fs=SR, output='sos'), v)
pres = sosfilt(butter(2, [2500, 6000], 'bp', fs=SR, output='sos'), v)
v = v + 0.25 * pres

# --- music
m, msr = librosa.load(f"{S}/music/{music}", sr=SR, mono=False)
if m.ndim == 1: m = np.stack([m, m])
if m.shape[1] < N:
    reps = int(np.ceil(N / m.shape[1])); m = np.tile(m, reps)
m = m[:, :N]
# voice activity envelope (smoothed)
frame = int(.02 * SR)
act = np.abs(v)
env = np.convolve(act, np.ones(frame) / frame, mode='same')
env = (env > 0.01).astype(float)
k = int(.35 * SR); env = np.convolve(env, np.ones(k) / k, mode='same'); env = np.clip(env * 1.6, 0, 1)
gain_db = -17 - 9 * env  # -17 dB in gaps, -26 dB under voice
t = np.arange(N) / SR
# lift during title card and end card
for key, lift in (("title", 7), ("end", 6)):
    a, b = tm["scenes"][key]["s"], tm["scenes"][key]["e"]
    w = np.clip((t - a + .3) / .6, 0, 1) * np.clip((b - t) / 1.2, 0, 1)
    gain_db += lift * w
g = 10 ** (gain_db / 20)
fade_in = np.clip(t / 1.5, 0, 1); fade_out = np.clip((total - t) / 4.0, 0, 1)
m = m * g * fade_in * fade_out

# --- SFX synthesis
def env_ar(n, att, rel):
    e = np.ones(n); a = int(att * SR); r = int(rel * SR)
    e[:a] = np.linspace(0, 1, a) ** 2; e[-r:] = np.linspace(1, 0, r) ** 2; return e
def noise(n): return rng.standard_normal(n)
def bp(x, lo, hi): return sosfiltfilt(butter(2, [lo, hi], 'bp', fs=SR, output='sos'), x)
def whoosh(d=.5, lo=300, hi=3500, lvl=.18):
    n = int(d * SR); x = noise(n)
    # sweep: crossfade between low band and high band
    lowb = bp(x, lo, lo * 3); highb = bp(x, hi / 3, hi)
    s = np.linspace(0, 1, n); y = lowb * (1 - s) + highb * s
    return lvl * y * env_ar(n, d * .6, d * .4) / (np.abs(y).max() + 1e-9)
def marker(): n = int(.28 * SR); y = bp(noise(n), 1800, 5000); return .05 * y * env_ar(n, .05, .2) / np.abs(y).max()
def hit():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    f = 70 * np.exp(-tt * 3) + 38; ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt * 2.6) * .55
    y += .12 * bp(noise(n), 200, 2500) * np.exp(-tt * 14)
    return y
def thump():
    n = int(.35 * SR); tt = np.arange(n) / SR
    return .4 * np.sin(2 * np.pi * (90 * np.exp(-tt * 8) + 45) * tt) * np.exp(-tt * 12) + .08 * bp(noise(n), 400, 3000) * np.exp(-tt * 40)
def buzz():
    out = np.zeros(int(.42 * SR))
    for k, f in enumerate((220, 196)):
        n = int(.16 * SR); tt = np.arange(n) / SR
        tone = .12 * np.sign(np.sin(2 * np.pi * f * tt)) * env_ar(n, .005, .06)
        tone = sosfilt(butter(2, 1500, 'lp', fs=SR, output='sos'), tone)
        o = int(k * .2 * SR); out[o:o + n] += tone
    return out
def pop():
    n = int(.12 * SR); tt = np.arange(n) / SR
    return .22 * np.sin(2 * np.pi * (500 + 900 * tt / .12) * tt) * np.exp(-tt * 30)
def ticks():
    out = np.zeros(int(1.2 * SR))
    for k in range(14):
        n = int(.02 * SR); c = bp(noise(n), 2000, 7000) * np.exp(-np.arange(n) / SR * 300)
        o = int(k * .075 * SR); out[o:o + n] += .05 * c / np.abs(c).max()
    return out
LIB = {"whoosh": lambda: whoosh(), "swoosh": lambda: whoosh(.7, 200, 5000, .26), "marker": marker, "hit": hit,
       "thump": thump, "buzz": buzz, "pop": pop, "ticks": ticks}
fx = np.zeros(N)
for name, ts in json.load(open(f"{S}/sfx.json")):
    y = LIB[name]()
    i = int(max(0, ts) * SR)
    if name in ("whoosh", "swoosh"): i = max(0, i - int(.25 * SR))  # peak lands on the motion
    j = min(N, i + len(y)); fx[i:j] += y[:j - i]

# --- mix & master
mix = np.stack([v + fx * .9, v + fx * .9]) + m
# stereo widen sfx a touch
meter = pyln.Meter(SR)
loud = meter.integrated_loudness(mix.T)
mix = pyln.normalize.loudness(mix.T, loud, -16.0)
from scipy.ndimage import minimum_filter1d, uniform_filter1d
pk = np.abs(mix).max(axis=1)
g = np.minimum(1.0, 0.93 / np.maximum(pk, 1e-9))
g = minimum_filter1d(g, size=int(.012 * SR)); g = uniform_filter1d(g, size=int(.006 * SR))
mix = mix * g[:, None]
peak = np.abs(mix).max()
if peak > .98: mix = mix / peak * .98
sf.write(f"{S}/final_mix.wav", mix, SR, subtype="PCM_24")
print("loudness before", round(loud, 1), "peak", round(peak, 3), "dur", round(total, 2))
