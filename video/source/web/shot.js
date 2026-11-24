const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await p.goto(process.argv[2]); await p.waitForFunction(() => window.READY === true); await p.screenshot({ path: process.argv[3] }); await b.close(); })();
