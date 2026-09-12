import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('exploration', 'screenshots');

async function run() {
  const email = process.env.SECTORS_ADMIN_EMAIL || process.env.TEST_AUTH_EMAIL || 'demo@alphasector.id';
  const password = process.env.SECTORS_ADMIN_PASSWORD || process.env.TEST_AUTH_PASSWORD || 'alphasector123';
  
  const loginRes = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const authData = await loginRes.json();

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('alphasector_auth_token', token);
    localStorage.setItem('alphasector_user', JSON.stringify(user));
  }, { token: authData.access_token, user: authData.user });

  await page.goto('http://localhost:3000/copilot?session_id=eddfffdd-b6ec-497c-b171-6b0b79fe743e', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Find the markdown table inside prose
  const markdownTables = page.locator('.prose table');
  const count = await markdownTables.count();
  console.log(`Found ${count} prose markdown tables`);

  if (count > 0) {
    const firstTable = markdownTables.first();
    await firstTable.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const p1 = path.join(outDir, 'table_npl_view1.png');
    await page.screenshot({ path: p1 });
    console.log('Saved:', p1);

    // Get the scroll container for this table
    const scrollContainer = firstTable.locator('xpath=ancestor::div[contains(@class, "overflow-x-auto")]').first();
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 350;
    });
    await page.waitForTimeout(1000);

    const p2 = path.join(outDir, 'table_npl_view2_scrolled.png');
    await page.screenshot({ path: p2 });
    console.log('Saved:', p2);
  }

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
