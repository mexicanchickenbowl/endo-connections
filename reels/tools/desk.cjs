#!/usr/bin/env node
/*
 * Prepare finished reels for the "Reel Production Desk" dashboard artifact.
 *
 *   node reels/tools/desk.cjs 21-gp-shrinkage-time 22-apex-locator ...
 *
 * For each slug: writes a 540x960 review copy + poster to reels/gallery/_desk/ and a project-document
 * skeleton (reels/gallery/_desk/<slug>.json) in the dashboard's schema. The asset ids (videoId, posterId)
 * are filled in after the two files are uploaded to the artifact's asset store.
 */
const fs = require('fs'); const path = require('path'); const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'); const DESK = path.join(ROOT, 'gallery', '_desk');
fs.mkdirSync(DESK, { recursive: true });
const run = (c, a) => { const r = spawnSync(c, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(c + ' failed: ' + r.stderr); return r.stdout; };
const out = [];
for (const slug of process.argv.slice(2)) {
  const mp4 = path.join(ROOT, 'out', slug + '.mp4'), jpg = path.join(ROOT, 'out', slug + '.jpg');
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', slug, 'meta.json'), 'utf8'));
  const dur = +(+run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).trim()).toFixed(1);
  const v = path.join(DESK, slug + '-540p.mp4'), p = path.join(DESK, slug + '-poster.jpg');
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'scale=540:960:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-maxrate', '1600k', '-bufsize', '3200k',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-an', '-movflags', '+faststart', v]);
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', jpg, '-vf', 'scale=540:960:flags=lanczos', '-q:v', '4', p]);
  const doc = {
    title: meta.title, kind: 'Animation', stage: 'review', current: 'v1', length: Math.round(dur) + ' s', voice: 'Silent',
    next: 'Watch it; approve or send notes', date: '', confirmed: true, order: 0, otherFiles: 0, cards: [], assets: [],
    notes: [
      `${meta.style} · silent animated explainer #${meta.id}`,
      meta.topic,
      `Full-quality 1080×1920 master: GitHub repo endo-connections, branch claude/vibrant-hawking-thepcs, reels/out/${slug}.mp4`,
      'Draft caption: ' + String(meta.caption || '').replace(/\s*\n+\s*/g, ' / '),
    ],
    previews: [{ label: 'v1', dur, videoId: '', posterId: '', src: `GitHub endo-connections: reels/out/${slug}.mp4` }],
  };
  fs.writeFileSync(path.join(DESK, slug + '.json'), JSON.stringify(doc, null, 2) + '\n');
  out.push({ slug, docId: 'anim-' + slug, video: path.relative(process.cwd(), v), poster: path.relative(process.cwd(), p), MB: +(fs.statSync(v).size / 1e6).toFixed(2), dur });
}
console.log(JSON.stringify(out, null, 2));
