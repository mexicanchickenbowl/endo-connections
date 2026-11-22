"""Quick diagnostic preview of a toy LBM field: speed colour + streamlines. Usage: python3 -I preview.py out/side3"""
import sys, json, numpy as np
from PIL import Image, ImageDraw

base = sys.argv[1]
meta = json.load(open(base + '.json'))
NX, NY = meta['nx'], meta['ny']
N = NX * NY
raw = open(base + '.bin', 'rb').read()
U = np.frombuffer(raw[:4 * N], dtype='<f4').reshape(NY, NX)
V = np.frombuffer(raw[4 * N:8 * N], dtype='<f4').reshape(NY, NX)
P = np.frombuffer(raw[8 * N:12 * N], dtype='<f4').reshape(NY, NX)
F = np.frombuffer(raw[12 * N:13 * N], dtype='u1').reshape(NY, NX)
ymax_mm = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
J = int(ymax_mm / meta['dx']) + 2
SX, SY = 8, 2  # px per cell
W, H = NX * SX, J * SY
spd = np.hypot(U, V)

def cmap(v):
    v = np.clip(v, 0, 1)
    r = np.clip(1.5 - abs(4 * v - 3), 0, 1); g = np.clip(1.5 - abs(4 * v - 2), 0, 1); b = np.clip(1.5 - abs(4 * v - 1), 0, 1)
    return np.stack([r, g, b], -1)

img = np.zeros((H, W, 3))
for j in range(J):
    row = cmap(spd[j] / 1.5) * 0.55
    row[F[j] == 0] = 0.12
    img[(J - 1 - j) * SY:(J - j) * SY] = np.repeat(row, SX, axis=0)[None]
im = Image.fromarray((img * 255).astype('u1'))
d = ImageDraw.Draw(im)

def vel(x, y):  # x,y in cell coords (continuous); bilinear
    i = x - 0.5; j = y - 0.5
    i0 = int(np.floor(i)); j0 = int(np.floor(j)); fi = i - i0; fj = j - j0
    if i0 < 0 or j0 < 0 or i0 + 1 >= NX or j0 + 1 >= NY: return None
    if not (F[j0, i0] or F[j0, i0 + 1] or F[j0 + 1, i0] or F[j0 + 1, i0 + 1]): return None
    u = (U[j0, i0] * (1 - fi) + U[j0, i0 + 1] * fi) * (1 - fj) + (U[j0 + 1, i0] * (1 - fi) + U[j0 + 1, i0 + 1] * fi) * fj
    v = (V[j0, i0] * (1 - fi) + V[j0, i0 + 1] * fi) * (1 - fj) + (V[j0 + 1, i0] * (1 - fi) + V[j0 + 1, i0 + 1] * fi) * fj
    return u, v

def trace(x, y, sgn, n=4000):
    pts = [(x, y)]
    for _ in range(n):
        a = vel(x, y)
        if a is None: break
        s = np.hypot(*a)
        if s < 1e-5: break
        h = 0.4 / s * sgn
        b = vel(x + a[0] * h / 2, y + a[1] * h / 2)
        if b is None: break
        x += b[0] * h; y += b[1] * h
        pts.append((x, y))
        if y > J: break
    return pts

seeds = []
for i in range(NX):
    for j in range(2, J, 14):
        if F[j, i] and (i % 5 == 2): seeds.append((i + 0.5, j + 0.5))
for (x, y) in seeds:
    for sgn in (1, -1):
        pts = trace(x, y, sgn, 1500)
        if len(pts) > 2:
            d.line([(px * SX, (J - py) * SY) for px, py in pts], fill=(255, 255, 255), width=1)
im.save(base + '_stream.png')
print('saved', base + '_stream.png', im.size, 'max speed', spd.max())

# inlet-connected reach: trace from inlet seeds forward, record min y (mm)
tip = meta['tipY']; dx = meta['dx']
miny = 1e9
jin = int((tip + 2.0) / dx) + 1
for i in range(NX):
    if F[jin, i] and abs((i + 0.5 - NX / 2) * dx) < 0.09:
        for sub in (0.25, 0.5, 0.75):
            pts = trace(i + sub, jin + 0.5, 1, 20000)
            for px, py in pts: miny = min(miny, (py - 1) * dx)
print('inlet-connected min y (mm above WL): %.2f ; reach below tip: %.2f mm' % (miny, tip - miny))
