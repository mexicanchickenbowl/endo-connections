#!/usr/bin/env node
/*
 * Reel renderer: deterministic frame-by-frame capture of a sample page -> stills / contact sheet / MP4.
 *
 *   node reels/tools/render.cjs stills <sampleDir> [--n 8] [--times 0.5,3,7.25] [--safe] [--out <dir>]
 *       -> <sampleDir>/_stills/f_00.jpg ... (full 1080x1920) + <sampleDir>/_stills/sheet.jpg (labelled grid)
 *   node reels/tools/render.cjs video  <sampleDir> [--fps 30]
 *       -> reels/out/<slug>.mp4  (H.264, yuv420p, silent AAC track) + reels/out/<slug>.jpg (poster)
 *
 * The page must define window.REEL and call Kit.boot(REEL) (see reels/SPEC.md).
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..'); // reels/
const W = 1080, H = 1920;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.glsl': 'text/plain', '.txt': 'text/plain',
};

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, path.normalize(p));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; o[k] = v; }
    else o._.push(a);
  }
  return o;
}

async function openPage(sampleDir) {
  const abs = path.resolve(sampleDir);
  if (!abs.startsWith(ROOT)) throw new Error('sampleDir must be inside ' + ROOT);
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/GL Driver Message|GPU stall|ReadPixels/.test(m.text())) errors.push(`console.${m.type()}: ${m.text()}`); });
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`); });
  await page.addInitScript(() => { window.__RENDER__ = true; });
  await page.goto(`http://127.0.0.1:${port}/${rel}/index.html`, { waitUntil: 'load' });
  try {
    await page.waitForFunction(() => window.REEL && window.REEL._ready === true, null, { timeout: 45000 });
  } catch (e) {
    console.error('REEL never became ready (did the page call Kit.boot(REEL)?). Errors so far:\n' + errors.join('\n'));
    await browser.close(); srv.close(); process.exit(2);
  }
  const meta = await page.evaluate(() => ({ duration: REEL.duration, fps: REEL.fps || 30, title: REEL.title || '', poster: REEL.poster, hasCanvas: !!REEL.canvas }));
  if (!(meta.duration >= 5 && meta.duration <= 40)) errors.push(`REEL.duration looks wrong: ${meta.duration}`);
  // Font warm-up: web fonts with unicode-range subsets load lazily the first time a glyph/weight is drawn, so the first
  // frame that uses it would otherwise be drawn with a fallback font. Render the whole timeline once (coarsely), wait for
  // every font face to finish loading, then capture. Faces that loaded late are reported (not an error).
  const late = await page.evaluate(async () => {
    const key = (f) => `${f.family} ${f.weight} ${f.style}`;
    const before = new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => key(f) + f.unicodeRange));
    for (let t = 0; t <= REEL.duration; t += 0.25) await REEL.render(t);
    await REEL.render(REEL.duration - 0.01);
    await document.fonts.ready;
    const out = new Set();
    for (const f of document.fonts) if (f.status === 'loaded' && !before.has(key(f) + f.unicodeRange)) out.add(key(f));
    await REEL.render(0);
    return [...out];
  });
  if (late.length) process.stderr.write(`  font warm-up loaded: ${late.join(', ')}\n`);
  return { page, browser, srv, errors, meta, rel };
}

async function renderAt(page, t) {
  await page.evaluate(async (t) => { await window.REEL.render(t); }, t);
}

async function stills(sampleDir, args) {
  const { page, browser, srv, errors, meta } = await openPage(sampleDir);
  const outDir = args.out ? path.resolve(String(args.out)) : path.join(path.resolve(sampleDir), '_stills');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  let times;
  if (args.times) times = String(args.times).split(',').map(Number);
  else { const n = +(args.n || 8); times = Array.from({ length: n }, (_, i) => +(((i + 0.5) / n) * meta.duration).toFixed(2)); times[n - 1] = +(meta.duration - 0.05).toFixed(2); }
  if (args.safe) {
    await page.evaluate(() => {
      const d = document.createElement('div');
      d.id = '__safe';
      d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
      d.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:230px;background:rgba(255,0,0,.25)"></div>' +
        '<div style="position:absolute;left:0;right:0;bottom:0;height:340px;background:rgba(255,0,0,.25)"></div>' +
        '<div style="position:absolute;right:0;width:120px;top:1100px;bottom:340px;background:rgba(255,0,0,.25)"></div>' +
        '<div style="position:absolute;left:0;right:0;top:240px;height:1440px;outline:3px dashed rgba(0,255,255,.8)"></div>';
      document.body.appendChild(d);
    });
  }
  const files = [];
  for (let i = 0; i < times.length; i++) {
    await renderAt(page, times[i]);
    const f = path.join(outDir, `f_${String(i).padStart(2, '0')}.jpg`);
    await page.screenshot({ path: f, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
    files.push({ f, t: times[i] });
  }
  await browser.close(); srv.close();
  // labelled contact sheet
  const cols = Math.min(4, files.length), rows = Math.ceil(files.length / cols);
  const thumbs = [];
  for (const { f, t } of files) {
    const th = f.replace('.jpg', '_th.jpg');
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f, '-vf',
      `scale=360:640,drawbox=x=0:y=0:w=110:h=34:color=black@0.7:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='t=${t}s':x=6:y=7:fontsize=20:fontcolor=yellow`, th]);
    thumbs.push(th);
  }
  while (thumbs.length < cols * rows) thumbs.push(thumbs[thumbs.length - 1]);
  const inputs = thumbs.flatMap((t) => ['-i', t]);
  const layout = thumbs.map((_, i) => `${(i % cols) * 364}_${Math.floor(i / cols) * 644}`).join('|');
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex',
    `${thumbs.map((_, i) => `[${i}:v]`).join('')}xstack=inputs=${thumbs.length}:layout=${layout}:fill=gray`, path.join(outDir, 'sheet.jpg')]);
  if (r.status !== 0) console.error(String(r.stderr));
  for (const t of new Set(thumbs)) fs.rmSync(t, { force: true });
  console.log(JSON.stringify({ title: meta.title, duration: meta.duration, stills: files.map((x) => ({ t: x.t, file: path.relative(process.cwd(), x.f) })), sheet: path.relative(process.cwd(), path.join(outDir, 'sheet.jpg')), errors }, null, 2));
}

async function video(sampleDir, args) {
  const t0 = Date.now();
  const { page, browser, srv, errors, meta } = await openPage(sampleDir);
  const fps = +(args.fps || meta.fps || 30);
  const slug = path.basename(path.resolve(sampleDir));
  const outDir = path.join(ROOT, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const mp4 = path.join(outDir, `${slug}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-map', '0:v', '-map', '1:a', '-shortest',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps),
    '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(meta.duration * fps);
  const useCanvas = meta.hasCanvas && !args.screenshot;
  for (let i = 0; i < N; i++) {
    const t = i / fps;
    let buf;
    if (useCanvas) {
      const b64 = await page.evaluate(async (t) => { await window.REEL.render(t); return window.REEL.canvas.toDataURL('image/jpeg', 0.94).split(',')[1]; }, t);
      buf = Buffer.from(b64, 'base64');
    } else {
      await renderAt(page, t);
      buf = await page.screenshot({ type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: W, height: H } });
    }
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) process.stderr.write(`  frame ${i}/${N}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  // poster
  const pt = meta.poster != null ? meta.poster : meta.duration * 0.65;
  await renderAt(page, pt);
  const poster = path.join(outDir, `${slug}.jpg`);
  await page.screenshot({ path: poster, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
  await browser.close(); srv.close();
  const size = fs.statSync(mp4).size;
  console.log(JSON.stringify({ mp4: path.relative(process.cwd(), mp4), poster: path.relative(process.cwd(), poster), frames: N, fps, duration: meta.duration, sizeMB: +(size / 1e6).toFixed(2), seconds: Math.round((Date.now() - t0) / 1000), mode: useCanvas ? 'canvas' : 'screenshot', errors }, null, 2));
}

(async () => {
  const a = parseArgs(process.argv.slice(2));
  const [cmd, dir] = a._;
  if (!cmd || !dir) { console.error('usage: render.cjs stills|video <sampleDir> [options]'); process.exit(1); }
  if (cmd === 'stills') await stills(dir, a);
  else if (cmd === 'video') await video(dir, a);
  else { console.error('unknown command ' + cmd); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
