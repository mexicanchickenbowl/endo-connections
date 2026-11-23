// usage: node render.js stills v 1.5,6,12   |   node render.js frames v
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const TL = JSON.parse(fs.readFileSync(path.join(HERE, 'timeline.json'), 'utf8'));
const FPS = 30;
const SIZE = { v: { width: 1080, height: 1920 }, h: { width: 1920, height: 1080 } };

async function mkPage(browser, fmt) {
  const ctx = await browser.newContext({ viewport: SIZE[fmt], deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exitCode = 1; });
  await page.addInitScript(tl => { window.TL = tl; }, TL);
  await page.goto('file://' + path.join(HERE, 'video.html') + '?fmt=' + fmt);
  await page.waitForFunction('window.READY === true', null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

(async () => {
  const [mode, fmt, arg] = process.argv.slice(2);
  const browser = await chromium.launch();
  if (mode === 'stills') {
    const page = await mkPage(browser, fmt);
    const out = path.join(HERE, 'stills'); fs.mkdirSync(out, { recursive: true });
    for (const ts of arg.split(',')) {
      await page.evaluate(t => window.renderAt(t), +ts);
      await page.screenshot({ path: path.join(out, `${fmt}_${String(ts).padStart(6, '0')}.png`) });
    }
  } else {
    const out = path.join(HERE, 'frames_' + fmt); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    const N = Math.ceil(TL.total * FPS);
    const WORKERS = 4;
    let next = 0;
    await Promise.all([...Array(WORKERS)].map(async () => {
      const page = await mkPage(browser, fmt);
      while (true) {
        const i = next++;
        if (i >= N) break;
        await page.evaluate(t => window.renderAt(t), i / FPS);
        await page.screenshot({ path: path.join(out, `f_${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
        if (i % 500 === 0) console.log(fmt, i, '/', N);
      }
    }));
    console.log('done', fmt, N);
  }
  await browser.close();
})();
