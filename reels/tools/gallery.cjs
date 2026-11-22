#!/usr/bin/env node
/*
 * Build the ranking-gallery bundle from finished samples.
 *
 *   node reels/tools/gallery.cjs
 *
 * Reads  reels/samples/NN-slug/meta.json (+ reels/out/NN-slug.mp4/.jpg)
 * Writes reels/gallery/reels.json
 *        reels/gallery/_publish/videos/NN-slug.mp4   (web preview: 720x1280, size-capped, faststart)
 *        reels/gallery/_publish/posters/NN-slug.jpg  (540x960)
 * Prints the publish plan: artifact `files` maps split so each publish stays under ~60 MB.
 * Previews are only re-encoded when the source MP4 is newer than the preview.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SAMPLES = path.join(ROOT, 'samples');
const OUT = path.join(ROOT, 'out');
const GAL = path.join(ROOT, 'gallery');
const PUB = path.join(GAL, '_publish');
const MAX_FILE = 14.5e6, MAX_PUBLISH = 60e6;

fs.mkdirSync(path.join(PUB, 'videos'), { recursive: true });
fs.mkdirSync(path.join(PUB, 'posters'), { recursive: true });

const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr}`); return r.stdout; };
const probe = (f) => +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).trim();
const newer = (a, b) => !fs.existsSync(b) || fs.statSync(a).mtimeMs > fs.statSync(b).mtimeMs;

const list = [], missing = [];
for (const slug of fs.readdirSync(SAMPLES).filter((d) => /^\d\d-/.test(d) && !d.startsWith('00-')).sort()) {
  const metaF = path.join(SAMPLES, slug, 'meta.json');
  const mp4 = path.join(OUT, slug + '.mp4'), jpg = path.join(OUT, slug + '.jpg');
  if (!fs.existsSync(mp4) || !fs.existsSync(jpg)) { missing.push(slug + ' (no video/poster)'); continue; }
  let meta = {};
  if (fs.existsSync(metaF)) meta = JSON.parse(fs.readFileSync(metaF, 'utf8'));
  else missing.push(slug + ' (no meta.json, using placeholders)');
  const vOut = path.join(PUB, 'videos', slug + '.mp4'), pOut = path.join(PUB, 'posters', slug + '.jpg');
  if (newer(mp4, vOut)) {
    let crf = 24;
    for (;;) {
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
        '-maxrate', '2200k', '-bufsize', '4400k', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-an', '-movflags', '+faststart', vOut]);
      if (fs.statSync(vOut).size <= MAX_FILE || crf >= 34) break;
      crf += 3;
    }
  }
  if (newer(jpg, pOut)) run('ffmpeg', ['-y', '-loglevel', 'error', '-i', jpg, '-vf', 'scale=540:960:flags=lanczos', '-q:v', '4', pOut]);
  list.push({
    id: meta.id || slug.slice(0, 2),
    slug,
    title: meta.title || slug.slice(3).replace(/-/g, ' '),
    style: meta.style || '',
    topic: meta.topic || '',
    duration: +(probe(mp4)).toFixed(1),
    video: `videos/${slug}.mp4`,
    poster: `posters/${slug}.jpg`,
    claims: meta.claims || [],
    caption: meta.caption || '',
  });
}
fs.writeFileSync(path.join(GAL, 'reels.json'), JSON.stringify(list, null, 2) + '\n');

// publish plan: chunk binary files so each publish stays under MAX_PUBLISH
const files = [];
for (const r of list) for (const k of ['video', 'poster']) {
  const src = path.join(PUB, r[k]);
  files.push({ pub: r[k], src: path.relative(process.cwd(), src), size: fs.statSync(src).size });
}
const chunks = []; let cur = [], sum = 0;
for (const f of files) { if (sum + f.size > MAX_PUBLISH && cur.length) { chunks.push(cur); cur = []; sum = 0; } cur.push(f); sum += f.size; }
if (cur.length) chunks.push(cur);
console.log(JSON.stringify({
  reels: list.length, missing,
  totalMB: +(files.reduce((a, f) => a + f.size, 0) / 1e6).toFixed(1),
  biggestMB: +(Math.max(...files.map((f) => f.size)) / 1e6).toFixed(2),
  publishes: chunks.map((c) => ({ MB: +(c.reduce((a, f) => a + f.size, 0) / 1e6).toFixed(1), files: Object.fromEntries(c.map((f) => [f.pub, f.src])) })),
}, null, 2));
