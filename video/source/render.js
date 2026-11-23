const { chromium } = require('playwright');
const [,, url, mode, a, b, outdir] = process.argv;
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 30000 }).catch(() => errs.push('not ready'));
  if (errs.length) console.log('ERRORS', errs.join('\n'));
  if (mode === 'sfx') { require('fs').writeFileSync(a, JSON.stringify(await page.evaluate(() => window.SFXL))); }
  else if (mode === 'stills') {
    for (const t of a.split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: `${outdir}/still_${t.toFixed(2).padStart(7, '0')}.jpg`, type: 'jpeg', quality: 80 });
    }
  } else {
    const fps = 30, f0 = +a, f1 = +b;
    for (let f = f0; f < f1; f++) {
      await page.evaluate(t => window.seek(t), f / fps);
      await page.screenshot({ path: `${outdir}/f${String(f).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 93 });
    }
  }
  console.log('total', await page.evaluate(() => window.TOTAL));
  await browser.close();
})();
