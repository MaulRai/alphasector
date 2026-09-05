import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('exploration', 'screenshots', 'unlocked');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Logging in as demo@alphasector.id via backend API...');
  const loginRes = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@alphasector.id', password: 'alphasector123' })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }

  const authData = await loginRes.json();
  console.log('Login successful for:', authData.user.email, authData.user.full_name);

  console.log('Launching Chrome from:', chromePath);
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
  console.log('Injected auth token & user to localStorage successfully.');

  // 01. Landing Page
  console.log('Capturing 01_landing.png ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '01_landing.png') });

  // 02. Copilot Main View
  console.log('Capturing 02_copilot_ready.png ...');
  await page.goto('http://localhost:3000/copilot', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outDir, '02_copilot_ready.png') });

  // 03. Copilot with Artifacts Drawer Open
  console.log('Capturing 03_copilot_artifacts_drawer.png ...');
  try {
    const artifactBtn = page.locator('button:has-text("Artifacts")');
    if (await artifactBtn.isVisible()) {
      await artifactBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, '03_copilot_artifacts_drawer.png') });
    }
  } catch (e) {
    console.warn('Artifacts drawer step error:', e.message);
  }

  // 04. Copilot with Reasoning Trace Audit Log Open
  console.log('Capturing 04_copilot_reasoning_trace.png ...');
  try {
    const traceHeader = page.locator('text=Reasoning Trace').first();
    if (await traceHeader.isVisible()) {
      await traceHeader.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, '04_copilot_reasoning_trace.png') });
    }
  } catch (e) {
    console.warn('Reasoning trace step error:', e.message);
  }

  // 05. Peer Battle Overview
  console.log('Capturing 05_battle_overview.png ...');
  await page.goto('http://localhost:3000/battle', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, '05_battle_overview.png') });

  // 06. Peer Battle 4-Way Big 4 Banks Active Matrix
  console.log('Capturing 06_battle_4banks_active.png ...');
  try {
    await page.goto('http://localhost:3000/battle?tickers=BBCA,BBRI,BMRI,BBNI&autorun=true', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(outDir, '06_battle_4banks_active.png') });
  } catch (e) {
    console.warn('Battle autorun step error:', e.message);
  }

  // 07. Screener Pro with Results Table
  console.log('Capturing 07_screener_pro_table.png ...');
  try {
    await page.goto('http://localhost:3000/screener', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Click Revenue Titans preset
    const presetBtn = page.locator('text=Revenue Titans').first();
    if (await presetBtn.isVisible()) {
      await presetBtn.click();
      await page.waitForTimeout(4000);
    } else {
      const applyBtn = page.locator('text=Terapkan Filter').first();
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await page.waitForTimeout(4000);
      }
    }
    await page.screenshot({ path: path.join(outDir, '07_screener_pro_table.png') });
  } catch (e) {
    console.warn('Screener step error:', e.message);
  }

  // 08. Company 360: BBCA
  console.log('Capturing 08_company_bbca.png ...');
  await page.goto('http://localhost:3000/company/BBCA', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outDir, '08_company_bbca.png') });

  // 09. Company 360: Notion Export Modal
  console.log('Capturing 09_notion_export_modal.png ...');
  try {
    const notionBtn = page.locator('button:has-text("Sync to Notion")').first();
    if (await notionBtn.isVisible()) {
      await notionBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, '09_notion_export_modal.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.warn('Notion modal step error:', e.message);
  }

  // 10. Company 360: TLKM
  console.log('Capturing 10_company_tlkm.png ...');
  await page.goto('http://localhost:3000/company/TLKM', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outDir, '10_company_tlkm.png') });

  // 11. Smart Money Flow Active Analysis
  console.log('Capturing 11_smart_money_active.png ...');
  try {
    await page.goto('http://localhost:3000/smart-money?ticker=TLKM', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const runSmBtn = page.locator('button:has-text("Jalankan Analisis Smart Money")').first();
    if (await runSmBtn.isVisible()) {
      await runSmBtn.click();
      await page.waitForTimeout(6000);
    }
    await page.screenshot({ path: path.join(outDir, '11_smart_money_active.png') });
  } catch (e) {
    console.warn('Smart money step error:', e.message);
  }

  // 12. Settings Unlocked (BYOK & Profile)
  console.log('Capturing 12_settings_unlocked.png ...');
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, '12_settings_unlocked.png') });

  // 13. Command Palette Modal
  console.log('Capturing 13_command_palette.png ...');
  try {
    await page.goto('http://localhost:3000/copilot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.keyboard.press('Control+KeyK');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '13_command_palette.png') });
  } catch (e) {
    console.warn('Command palette step error:', e.message);
  }

  await browser.close();
  console.log('All 13 unlocked screenshots captured successfully in exploration/screenshots/unlocked/ !');
}

run().catch(console.error);
