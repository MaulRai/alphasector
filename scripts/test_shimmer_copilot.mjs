import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('exploration', 'screenshots', 'shimmer');

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

  console.log('Launching browser...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // 1. Root & inject Auth
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('alphasector_auth_token', token);
    localStorage.setItem('alphasector_user', JSON.stringify(user));
  }, { token: authData.access_token, user: authData.user });

  // Delay the /api/chat endpoints by 2500ms to visually capture the shimmering skeleton!
  await page.route('**/api/chat/**', async (route) => {
    await new Promise((r) => setTimeout(r, 2500));
    await route.continue();
  });

  console.log('Navigating to /copilot with throttled chat loading to capture shimmer...');
  const navPromise = page.goto('http://localhost:3000/copilot');

  // Wait 800ms while loading is active
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'copilot_shimmering_loading.png') });
  console.log('Saved copilot_shimmering_loading.png');

  // Wait for both throttled requests to complete
  await navPromise;
  await page.waitForTimeout(7000);
  await page.screenshot({ path: path.join(outDir, 'copilot_loaded_chat.png') });
  console.log('Saved copilot_loaded_chat.png');

  await browser.close();
  console.log('Test completed successfully!');
}

run().catch(console.error);
