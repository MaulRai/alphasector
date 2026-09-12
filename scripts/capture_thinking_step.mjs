import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('exploration', 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const email = process.env.SECTORS_ADMIN_EMAIL || process.env.TEST_AUTH_EMAIL || 'demo@alphasector.id';
  const password = process.env.SECTORS_ADMIN_PASSWORD || process.env.TEST_AUTH_PASSWORD || 'alphasector123';
  
  console.log(`Authenticating via backend API as ${email}...`);
  const loginRes = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }

  const authData = await loginRes.json();
  console.log('Login successful for:', authData.user.email);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('alphasector_auth_token', token);
    localStorage.setItem('alphasector_user', JSON.stringify(user));
  }, { token: authData.access_token, user: authData.user });

  console.log('Navigating to Copilot...');
  await page.goto('http://localhost:3000/copilot', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Typing screening query...');
  const textarea = page.locator('textarea');
  await textarea.waitFor({ state: 'visible' });
  await textarea.fill('Screen 5 emiten dividen yield tertinggi IDX');

  console.log('Sending query...');
  await page.keyboard.press('Enter');

  // Wait 2.2s for early step (Step 2 Screen Companies Universe)
  await page.waitForTimeout(2200);
  const earlyPath = path.join(outDir, 'thinking_step_early.png');
  await page.screenshot({ path: earlyPath });
  console.log('Saved:', earlyPath);

  // Wait another 3.8s (total ~6s) for mid step (Step 4 Auto-Enrich Top Screened Emitens)
  await page.waitForTimeout(3800);
  const midPath = path.join(outDir, 'thinking_step_mid.png');
  await page.screenshot({ path: midPath });
  console.log('Saved:', midPath);

  // Wait another 3.5s (total ~9.5s) for Step 5 Deterministic Engine
  await page.waitForTimeout(3500);
  const latePath = path.join(outDir, 'thinking_step_late.png');
  await page.screenshot({ path: latePath });
  console.log('Saved:', latePath);

  await browser.close();
  console.log('Done capturing thinking steps!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
