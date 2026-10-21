#!/usr/bin/env node
// Render the explainer to MP4 by stepping the canvas frame by frame in headless Chromium.
//
//   NODE_PATH=$(npm root -g) node tools/render.cjs video  ept-explainer-1min.mp4 [--cut 1min|full] [--fps 30] [--jobs 4]
//   NODE_PATH=$(npm root -g) node tools/render.cjs snap   OUT_DIR [--cut 1min|full] 12.5 40 61.2 ...   (PNG stills)
//
// Needs Playwright's Chromium and ffmpeg on PATH. Web fonts are blocked so frames use the
// locally installed Inter / JetBrains Mono.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let URL_ = 'file://' + path.join(ROOT, 'index.html') + '?render';

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForFunction(() => window.READY === true);
  return page;
}

async function frameJpeg(page, t) {
  const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95).slice(23); }, t);
  return Buffer.from(b64, 'base64');
}

async function snap(outDir, times) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await openPage(browser);
  for (const t of times) {
    const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/png').slice(22); }, t);
    const f = path.join(outDir, `t${String(t.toFixed(2)).padStart(7, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(b64, 'base64'));
    console.log(f);
  }
  await browser.close();
}

function ffmpegSegment(file, fps) {
  return spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-tune', 'animation', '-crf', '20', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'inherit', 'inherit'] });
}

async function video(out, fps, jobs) {
  const browser = await chromium.launch();
  const probe = await openPage(browser);
  const [duration, narration] = await probe.evaluate(() => [window.TIMELINE_DURATION, window.NARRATION]);
  await probe.close();
  const total = Math.ceil(duration * fps), per = Math.ceil(total / jobs);
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ept-render-'));
  let done = 0; const t0 = Date.now();
  const parts = await Promise.all(Array.from({ length: jobs }, async (_, j) => {
    const from = j * per, to = Math.min(total, from + per), file = path.join(tmp, `part${j}.mp4`);
    const page = await openPage(browser), ff = ffmpegSegment(file, fps);
    for (let f = from; f < to; f++) {
      const buf = await frameJpeg(page, f / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 300 === 0) console.log(`${done}/${total} frames (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
    await page.close();
    return file;
  }));
  await browser.close();
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
  await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
    '-i', path.join(ROOT, narration), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out],
    { stdio: 'inherit' }).on('close', c => c === 0 ? res() : rej(new Error('mux exit ' + c))));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`wrote ${out}: ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

(async () => {
  const [mode, target, ...rest] = process.argv.slice(2);
  const take = k => { const i = rest.indexOf(k); if (i < 0) return undefined; const v = rest[i + 1]; rest.splice(i, 2); return v; };
  const cut = take('--cut');
  if (cut) URL_ += '&cut=' + cut;
  const opt = (k, d) => { const v = take(k); return v === undefined ? d : Number(v); };
  if (mode === 'snap') await snap(target, rest.map(Number));
  else if (mode === 'video') await video(target, opt('--fps', 30), opt('--jobs', 4));
  else { console.error('usage: render.cjs video OUT.mp4 [--fps 30] [--jobs 4] | snap OUT_DIR t1 t2 ...'); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
