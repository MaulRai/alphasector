import { createRequire } from 'module';
const require = createRequire('C:/Users/User/.gemini/config/skills/playwright-browser-tester/package.json');
const { chromium } = require('playwright');
import fs from 'fs';

// Token for test@alphasector.com
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJhZG1pbkBhbHBoYXNlY3Rvci5jb20iLCJleHAiOjE3OTE3MTQxMTB9.a0OUAdE0MtdWJIaEaWnOCY_z0K_kt-iptjK8uNlUhBA';

const ROOMS = [
  { id: 'a7f8649b-3a89-434c-868c-523cedaaa760', name: 'room_1_esg_leaders' },
  { id: '5f6a2fd1-a2c0-4d66-a4cc-9bb1a0edc024', name: 'room_2_revenue_growth' },
  { id: 'cd5a1e4e-e238-43cc-857e-305d732be1a9', name: 'room_3_large_shareholder' },
  { id: 'c4848f09-fe99-453b-a600-825f4343d593', name: 'room_4_efficient_operators' }
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Navigate to localhost:3000 to set localStorage
  await page.goto('http://localhost:3000');
  await page.evaluate((token) => {
    localStorage.setItem('alphasector_auth_token', token);
    localStorage.setItem('alphasector_protocol_mode', 'mcp');
  }, TOKEN);

  console.log('Auth token set in localStorage. Capturing rooms...');

  for (const room of ROOMS) {
    console.log(`Navigating to room: ${room.name} (${room.id})...`);
    await page.goto(`http://localhost:3000/alpha-agent?session=${room.id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Allow chat stream and cards to settle

    const screenshotPath = `scratch/${room.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot to ${screenshotPath}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
