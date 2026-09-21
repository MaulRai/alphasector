import { AgentQueryResponse } from './types';

interface PrintDossierOptions {
  query?: string;
  ticker?: string;
  timestamp?: string;
  author?: string;
}

export function printDossier(report: AgentQueryResponse, options?: PrintDossierOptions) {
  if (!report) return;

  const now = new Date();
  const printDate = options?.timestamp || now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const ticker = (options?.ticker || report.primary_ticker || 'IDX UNIVERSE').toUpperCase();
  const query = options?.query || report.query || 'Analisis Riset Pasar Modal';
  const intent = (report.intent || 'EQUITY RESEARCH MEMO').replace(/_/g, ' ').toUpperCase();

  const synthesis = report.synthesis || {
    executive_summary: '',
    key_findings: [],
    valuation_verdict: '',
    smart_money_flow: '',
    catalysts: [],
    risks: [],
    disclaimer: 'DISCLAIMER: Dokumen ini disusun secara otomatis untuk keperluan edukasi dan riset.',
  };

  // Build key findings HTML
  const findingsHtml = synthesis.key_findings && synthesis.key_findings.length > 0
    ? `
      <div class="section">
        <h3 class="section-title">TEMUAN UTAMA (KEY FINDINGS)</h3>
        <ol class="findings-list">
          ${synthesis.key_findings.map((f: string) => `<li>${escapeHtml(f)}</li>`).join('')}
        </ol>
      </div>
    `
    : '';

  // Build smart money HTML
  const smartMoneyHtml = synthesis.smart_money_flow
    ? `
      <div class="section">
        <h3 class="section-title">SMART MONEY FLOW & BROKER ACCUMULATION</h3>
        <div class="box box-smartmoney">
          ${escapeHtml(synthesis.smart_money_flow)}
        </div>
      </div>
    `
    : '';

  // Build valuation verdict HTML
  const valuationHtml = synthesis.valuation_verdict
    ? `
      <div class="section">
        <h3 class="section-title">VALUATION VERDICT & PEER METRICS</h3>
        <div class="box box-valuation">
          ${escapeHtml(synthesis.valuation_verdict)}
        </div>
      </div>
    `
    : '';

  // Build catalysts & risks HTML
  const catalystsHtml = synthesis.catalysts && synthesis.catalysts.length > 0
    ? `
      <div class="column">
        <div class="col-header col-catalyst">
          <span class="icon">▲</span> KATALIS POSITIF
        </div>
        <ul class="bullet-list bullet-catalyst">
          ${synthesis.catalysts.map((c: string) => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const risksHtml = synthesis.risks && synthesis.risks.length > 0
    ? `
      <div class="column">
        <div class="col-header col-risk">
          <span class="icon">▼</span> FAKTOR RISIKO
        </div>
        <ul class="bullet-list bullet-risk">
          ${synthesis.risks.map((r: string) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const catalystsRisksGrid = (catalystsHtml || risksHtml)
    ? `
      <div class="section">
        <h3 class="section-title">ANALISIS KATALIS & FAKTOR RISIKO</h3>
        <div class="columns-grid">
          ${catalystsHtml}
          ${risksHtml}
        </div>
      </div>
    `
    : '';

  // Construct print-ready institutional document
  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>AlphaSector Research Dossier - ${ticker}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Top Institutional Letterhead */
    .memo-header {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-title {
      font-size: 18pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin: 0;
      line-height: 1.1;
    }

    .brand-title span {
      color: #059669;
    }

    .brand-subtitle {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-top: 3px;
    }

    .doc-badge {
      text-align: right;
    }

    .doc-type {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .doc-date {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 4px;
      font-family: monospace;
    }

    /* Meta Table / Grid */
    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .meta-row:last-child {
      margin-bottom: 0;
      padding-top: 6px;
      border-top: 1px dashed #e2e8f0;
    }

    .query-text {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
    }

    .ticker-pill {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 800;
      font-size: 10pt;
      letter-spacing: 0.5px;
    }

    .meta-detail {
      font-size: 8.5pt;
      color: #64748b;
    }

    .meta-detail strong {
      color: #334155;
    }

    /* Sections */
    .section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 9.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #334155;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 0 0 8px 0;
    }

    .box {
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 10pt;
      line-height: 1.55;
    }

    .box-exec {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #059669;
      color: #1e293b;
      font-weight: 500;
    }

    .box-smartmoney {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #d97706;
      color: #78350f;
    }

    .box-valuation {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      color: #14532d;
    }

    /* Findings List */
    .findings-list {
      margin: 0;
      padding-left: 20px;
      font-size: 9.5pt;
      color: #1e293b;
    }

    .findings-list li {
      margin-bottom: 5px;
      line-height: 1.5;
    }

    /* Catalysts & Risks Columns */
    .columns-grid {
      display: flex;
      gap: 12px;
    }

    .column {
      flex: 1;
      border-radius: 6px;
      padding: 10px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
    }

    .col-header {
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .col-catalyst {
      color: #047857;
      border-bottom: 1px solid #a7f3d0;
      padding-bottom: 4px;
    }

    .col-risk {
      color: #b91c1c;
      border-bottom: 1px solid #fecaca;
      padding-bottom: 4px;
    }

    .bullet-list {
      margin: 0;
      padding-left: 16px;
      font-size: 8.5pt;
      color: #334155;
    }

    .bullet-list li {
      margin-bottom: 4px;
      line-height: 1.45;
    }

    .bullet-catalyst li::marker {
      color: #059669;
    }

    .bullet-risk li::marker {
      color: #dc2626;
    }

    /* Formal Disclaimer Footer */
    .disclaimer-box {
      margin-top: 20px;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 6px;
      font-size: 7.5pt;
      color: #64748b;
      line-height: 1.45;
      text-align: justify;
    }

    .memo-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="memo-header">
    <div>
      <h1 class="brand-title">Alpha<span>Sector</span></h1>
      <div class="brand-subtitle">Autonomous Equity Research & Intelligence</div>
    </div>
    <div class="doc-badge">
      <div class="doc-type">Institutional Research Dossier</div>
      <div class="doc-date">Dibuat: ${escapeHtml(printDate)}</div>
    </div>
  </div>

  <div class="meta-card">
    <div class="meta-row">
      <h2 class="query-text">${escapeHtml(query)}</h2>
      <span class="ticker-pill">${escapeHtml(ticker)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-detail">Klasifikasi: <strong>${escapeHtml(intent)}</strong></span>
      <span class="meta-detail">Data Feed: <strong>Bursa Efek Indonesia via Sectors Financial API</strong></span>
      <span class="meta-detail">Engine: <strong>AlphaAgent Autonomous v2.5</strong></span>
    </div>
  </div>

  ${synthesis.executive_summary ? `
    <div class="section">
      <h3 class="section-title">RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)</h3>
      <div class="box box-exec">
        ${escapeHtml(synthesis.executive_summary)}
      </div>
    </div>
  ` : ''}

  ${findingsHtml}
  ${smartMoneyHtml}
  ${valuationHtml}
  ${catalystsRisksGrid}

  <div class="disclaimer-box">
    <strong>DISCLAIMER PASAR MODAL & REGULASI:</strong> 
    ${escapeHtml(synthesis.disclaimer || 'Dokumen riset ini diproduksi secara otonom oleh AlphaSector untuk tujuan analisa dan edukasi semata. Informasi ini BUKAN merupakan ajakan beli/jual saham atau jaminan keuntungan investasi. Keputusan investasi sepenuhnya merupakan tanggung jawab mandiri investor.')}
  </div>

  <div class="memo-footer">
    <span>Dokumen Riset Ekuitas Resmi • AlphaSector Intelligence Platform</span>
    <span>Sectors Hackathon 2026</span>
    <span>Halaman 1 dari 1</span>
  </div>
</body>
</html>
  `;

  // Use hidden iframe to trigger print without affecting the main page DOM or styling
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  printIframe.id = 'alpharsector-dossier-print-frame';

  document.body.appendChild(printIframe);

  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('Failed to open iframe document for printing');
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for iframe styles/content to settle then launch print dialog
  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch (err) {
      console.error('Error triggering iframe print:', err);
    } finally {
      // Remove iframe after user dismisses print dialog
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2000);
    }
  }, 250);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
