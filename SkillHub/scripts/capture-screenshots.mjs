import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('./screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 960, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for entrance animations to settle
  await new Promise((r) => setTimeout(r, 1200));

  // 1. Overview screenshot (Hero + Asymmetric Specimens + Filter bar)
  console.log('Capturing overview screenshot...');
  await page.screenshot({
    path: path.join(outDir, '01-overview-specimens.png'),
  });

  // 2. Hover on the first featured specimen card to demonstrate lift & tilt
  console.log('Hovering on anchor specimen card...');
  const firstCard = await page.$('article');
  if (firstCard) {
    await firstCard.hover();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: path.join(outDir, '02-specimen-hover-lift.png'),
    });
  }

  // 3. Scroll to the ledger index, hover and expand row
  console.log('Interacting with expandable ledger row...');
  const ledgerRows = await page.$$('[role="button"]');
  if (ledgerRows.length > 0) {
    // Scroll row into view
    await ledgerRows[0].evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await new Promise((r) => setTimeout(r, 500));
    // Hover on row
    await ledgerRows[0].hover();
    await new Promise((r) => setTimeout(r, 300));
    // Click to expand
    await ledgerRows[0].click();
    await new Promise((r) => setTimeout(r, 600));

    await page.screenshot({
      path: path.join(outDir, '03-ledger-row-expanded.png'),
    });
  }

  // 4. Click a CopyButton to capture the full morph (Clay tint flash + rotated checkmark + tooltip)
  console.log('Clicking copy button to trigger morph...');
  const copyBtns = await page.$$('button[aria-label^="Copy"]');
  if (copyBtns.length > 0) {
    await copyBtns[0].click();
    // Capture right in the middle of copied state
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({
      path: path.join(outDir, '04-copy-button-morph.png'),
    });
  }

  // 5. Select a category filter to capture the pen-stroke ink underline
  console.log('Clicking category filter chip...');
  const chips = await page.$$('button');
  for (const chip of chips) {
    const text = await chip.evaluate((el) => el.textContent);
    if (text && text.includes('Engineering & QA')) {
      await chip.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({
        path: path.join(outDir, '05-filter-penstroke-ink.png'),
      });
      break;
    }
  }

  console.log('All screenshots captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
