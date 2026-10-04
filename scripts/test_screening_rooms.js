const fs = require('fs');

const API_BASE = 'http://localhost:8000';

const TESTS = [
  {
    feature: 'ESG Leaders IDX',
    roomTitle: '[Radar] ESG Leaders IDX',
    presetQuery: 'Screening top emiten dengan ESG score terbaik di Indonesia',
    contextTicker: 'BBRI',
    followUpQuery: 'Dari hasil screening ESG Leaders ini, tolong lakukan audit tata kelola mendalam untuk BBRI: periksa riwayat transaksi insider (direksi & komisaris) melalui tool insider filings, serta komposisi pemegang saham institusionalnya. Apakah para direksi sendiri aktif melakukan akumulasi saham belakangan ini?'
  },
  {
    feature: 'Revenue Growth Titans',
    roomTitle: '[Radar] Revenue Growth Titans',
    presetQuery: 'Cari emiten dengan pertumbuhan revenue tertinggi di 2024 dibanding 2023',
    contextTicker: 'DSSA',
    followUpQuery: 'Bandingkan emiten revenue growth unggulan tersebut dengan rival utamanya dalam Peer Battle deterministik: hitung skor Piotroski F-Score (9 kriteria lengkap) dan posisi Historical P/E Standard Deviation Bands untuk memverifikasi apakah lonjakan omset ini diiringi kualitas margin dan solvabilitas yang sehat atau sekadar ekspansi berbahan utang?'
  },
  {
    feature: 'Large Single-Shareholder',
    roomTitle: '[Radar] Large Single-Shareholder',
    presetQuery: 'Cari saham yang kepemilikan single shareholder minimal 70 persen',
    contextTicker: 'BREN',
    followUpQuery: 'Untuk emiten dengan konsentrasi pemegang saham tunggal >= 70% tersebut (seperti BREN atau CUAN), lakukan audit forensik risiko likuiditas: periksa riwayat radar suspensi BEI / UMA, serta bedah konsentrasi akumulasi top 5 broker (Bandarmology) dan net foreign flow 30 hari terakhir untuk mendeteksi apakah ada gejala distribusi masif atau risiko likuiditas tercekik.'
  },
  {
    feature: 'Efficient Operators',
    roomTitle: '[Radar] Efficient Operators',
    presetQuery: 'Cari perusahaan dengan laba bersih per karyawan paling efisien di sektornya',
    contextTicker: 'ADRO',
    followUpQuery: 'Bedah anatomi efisiensi emiten operator terunggul tersebut: ambil rincian breakdown segmen bisnisnya (segmen mana yang menyumbang pendapatan dan laba usaha terbesar), serta evaluasi bagaimana konversi arus kas operasinya untuk memastikan efisiensi laba bersih per karyawan ini berkelanjutan.'
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== Step 1: Logging in as admin@alphasector.com ===');
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@alphasector.com', password: '[PASSWORD]' })
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${errText}`);
  }

  const loginData = await loginRes.json();
  const token = loginData.access_token;
  console.log(`Logged in successfully! User: ${loginData.user.full_name} (ID: ${loginData.user.id})\n`);

  const results = [];

  for (let i = 0; i < TESTS.length; i++) {
    const test = TESTS[i];
    console.log(`\n======================================================`);
    console.log(`[TEST ${i + 1}/4] Running Feature: ${test.feature}`);
    console.log(`======================================================`);

    // 1. Create Room Session
    console.log(`1. Creating chat room: "${test.roomTitle}"...`);
    const sessionRes = await fetch(`${API_BASE}/api/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: test.roomTitle,
        primary_ticker: test.contextTicker
      })
    });
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.session.id;
    console.log(`   Room created! Session ID: ${sessionId}`);

    // 2. Execute Preset Query (1-Click Screening)
    console.log(`2. Executing Preset Query (1-Click Screening): "${test.presetQuery}"`);
    const startPreset = Date.now();
    const presetQueryRes = await fetch(`${API_BASE}/api/agent/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Protocol-Mode': 'mcp'
      },
      body: JSON.stringify({
        query: test.presetQuery,
        session_id: sessionId,
        context_ticker: test.contextTicker
      })
    });

    if (!presetQueryRes.ok) {
      const err = await presetQueryRes.text();
      console.error(`   Error in preset query (${presetQueryRes.status}):`, err);
      results.push({ test, sessionId, error: err });
      continue;
    }

    const presetData = await presetQueryRes.json();
    const presetDuration = Date.now() - startPreset;
    console.log(`   Preset response received in ${presetDuration}ms!`);
    console.log(`   Detected Primary Ticker: ${presetData.primary_ticker}`);
    console.log(`   Reasoning Steps: ${presetData.reasoning_trace?.length || 0}`);
    console.log(`   Tool Calls:`);
    (presetData.reasoning_trace || []).forEach(step => {
      if (step.tool_call) {
        console.log(`     - [${step.tool_call.endpoint}] (${step.tool_call.latency_ms}ms, status: ${step.tool_call.status})`);
      }
    });
    console.log(`   Executive Summary Snippet: ${presetData.synthesis?.executive_summary?.substring(0, 150)}...\n`);

    // Pause slightly between calls
    await sleep(1500);

    // 3. Execute Follow-Up Query (Deep MCP Utilization)
    console.log(`3. Executing Follow-up Query (Deep MCP): "${test.followUpQuery}"`);
    const startFollowUp = Date.now();
    const followUpRes = await fetch(`${API_BASE}/api/agent/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Protocol-Mode': 'mcp'
      },
      body: JSON.stringify({
        query: test.followUpQuery,
        session_id: sessionId,
        context_ticker: presetData.primary_ticker || test.contextTicker
      })
    });

    if (!followUpRes.ok) {
      const err = await followUpRes.text();
      console.error(`   Error in follow-up query (${followUpRes.status}):`, err);
      results.push({ test, sessionId, presetData, error: err });
      continue;
    }

    const followUpData = await followUpRes.json();
    const followUpDuration = Date.now() - startFollowUp;
    console.log(`   Follow-up response received in ${followUpDuration}ms!`);
    console.log(`   Reasoning Steps: ${followUpData.reasoning_trace?.length || 0}`);
    console.log(`   Tool Calls:`);
    (followUpData.reasoning_trace || []).forEach(step => {
      if (step.tool_call) {
        console.log(`     - [${step.tool_call.endpoint}] (${step.tool_call.latency_ms}ms, status: ${step.tool_call.status})`);
      }
    });
    console.log(`   Executive Summary Snippet: ${followUpData.synthesis?.executive_summary?.substring(0, 180)}...\n`);

    results.push({
      feature: test.feature,
      roomTitle: test.roomTitle,
      sessionId,
      preset: {
        query: test.presetQuery,
        durationMs: presetDuration,
        primaryTicker: presetData.primary_ticker,
        toolCalls: (presetData.reasoning_trace || []).map(s => s.tool_call).filter(Boolean),
        summary: presetData.synthesis?.executive_summary,
        reportData: presetData
      },
      followUp: {
        query: test.followUpQuery,
        durationMs: followUpDuration,
        toolCalls: (followUpData.reasoning_trace || []).map(s => s.tool_call).filter(Boolean),
        summary: followUpData.synthesis?.executive_summary,
        reportData: followUpData
      }
    });

    await sleep(2000);
  }

  // Save all results to disk
  fs.writeFileSync('scratch/screening_test_results.json', JSON.stringify(results, null, 2));
  console.log(`\n======================================================`);
  console.log(`ALL 4 TESTS COMPLETED SUCCESSFULLY!`);
  console.log(`Saved detailed logs to scratch/screening_test_results.json`);
  console.log(`======================================================`);
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
