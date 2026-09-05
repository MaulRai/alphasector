import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('exploration', 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pages = [
  { name: '01_landing.png', url: 'http://localhost:3000/' },
  { name: '02_copilot.png', url: 'http://localhost:3000/copilot' },
  { name: '03_battle.png', url: 'http://localhost:3000/battle' },
  { name: '04_screener.png', url: 'http://localhost:3000/screener' },
  { name: '05_company_360.png', url: 'http://localhost:3000/company/BBCA' },
  { name: '06_smart_money.png', url: 'http://localhost:3000/smart-money' },
  { name: '07_settings.png', url: 'http://localhost:3000/settings' }
];

console.log('Capturing screenshots with local Chrome headless...');

for (const p of pages) {
  const targetFile = path.join(outDir, p.name);
  console.log(`Taking screenshot for ${p.url} -> ${p.name}...`);
  try {
    const cmd = `"${chromePath}" --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=2500 --run-all-compositor-stages-before-draw --screenshot="${targetFile}" "${p.url}"`;
    execSync(cmd, { stdio: 'inherit', timeout: 20000 });
  } catch (err) {
    console.error(`Error capturing ${p.name}:`, err.message);
  }
}

console.log('Finished capturing all screenshots!');
