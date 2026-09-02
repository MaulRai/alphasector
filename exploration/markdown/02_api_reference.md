# Sectors Financial API v2 - Complete API Reference

**Version:** 2.0.0  
**Base URL:** `https://api.sectors.app/v2/`

## Billing & Credit System

Financial data API for IDX, SGX, and KLSE listed companies, including mining sector data.

## Billing & Credits

Credits/quota are consumed as a function of the HTTP response status, so the same status always bills the same way:

| Response | Consumes credits? |
|---|---|
| **2xx** (success) | Yes — the endpoint's stated cost (most cost 1; multi-section reports, multi-classification rankings, and some feeds cost more, as noted on each endpoint). |
| **404** (addressed resource not found) | Yes — 1 credit. Your request was well-formed and we ran the lookup, but the specific resource you addressed doesn't exist (e.g. an unknown `symbol`/`slug`). You are billed for the lookup, not the result. |
| **400** (bad request) | No — free. Malformed input (missing/invalid parameters, unknown sections, bad date formats, invalid slugs) is rejected before any lookup runs. |
| **401 / 403** (auth) | No — free. |
| **429** (rate limit / quota exhausted) | No — free. |
| **5xx** (server error) | No — free. A failure on our side is never billed. |

### Empty results

**List and filter endpoints return `200` with an empty result when nothing matches** — an empty collection is a valid answer, not an error. For example, a screener/ranking whose filters match no companies returns `200` with empty arrays (and a `message` explaining why), and a date-range feed with no rows in the window returns `200` with an empty list. These still consume credits (the query ran). A `404` is reserved for when the **specific resource you addressed** (a `symbol`, `slug`, `index_code`, etc.) does not exist at all.

**One exception:** the Company Screener endpoints charge **1 credit on a `400`** *only* when using the natural-language `?q=` parameter and the failure occurs after the query has been sent to the language model (e.g. an untranslatable query). This recovers the model cost already incurred. A `400` from a structured (`where` / `order_by`) query, or any validation failure before the model runs, is free. A successful `?q=` screen costs 3 credits; a successful structured screen costs 1.

---

## 🏛️ Indonesia (IDX)

### 📂 Company Screener

#### `GET` `/v2/companies/` - Companies Screener

High-performance API for filtering and sorting IDX-listed companies. Supports both structured SQL-like queries (`where`, `order_by`) and natural language queries (`q`). Returns a paginated list of companies.

**Query modes** (mutually exclusive — `q` overrides all others):
- `q`: Natural language, e.g. `top 10 tech companies by revenue in 2023`
- `where` + `order_by`: SQL-like structured query

<Note>For the most precise natural language results, filter by sector/industry slugs. Retrieve the complete slug list from the [Subsectors](./helper-list/subsectors), [Industries](./helper-list/industries), or [Subindustries](./helper-list/subindustries) endpoints.</Note>

<Accordion title="Smart FY Handling">
To account for reporting lags, 'latest year' queries made between January and April default to the previous audited year (e.g. a query in early 2026 uses 2024 data).
</Accordion>

<Accordion title="Syntax and Operators">
**Operators:** `=`, `!=`, `>`, `>=`, `<`, `<=`, `like`, `in`

**Logic:** combine conditions with `and` and `or`

**String values:** use single or double quotes — `sector = 'Technology'`

**Lists (for `in`):** `tags in ['blue-chip', 'dividend']`
</Accordion>

<Accordion title="Yearly and Forecast Data">
Access historical or forecast data using bracket notation: `field[YYYY]`

Examples: `revenue[2023] > 100000000000` or `forecast_eps_growth[2025] > 0.15`
</Accordion>

<Accordion title="Arithmetic Expressions">
Perform calculations within your query on both sides of a condition.

Examples: `revenue[2024] / total_assets[2024] > 0.5` or `revenue[2024] > revenue[2023] * 1.2`
</Accordion>

<Accordion title="Available Fields">
<AccordionGroup>

<Accordion title="Direct Fields (Top-level columns)">
**How to Use:** Query these fields directly using standard operators (`=`, `!=`, `>`, `<`, `LIKE`, `IN`). String comparisons are case-insensitive.

<Accordion title="Examples">
- `where=market_cap > 500000000000000`
- `where=company_name like '%energi%'`
- `where=sector = 'Financials' and listing_date > '2005-01-01'`
</Accordion>

- **symbol**: IDX ticker symbol (e.g. BBCA, TLKM)
- **company_name**: Full registered company name
- **listing_board**: IDX board: Main, Development, or Acceleration
- **industry**: IDX industry classification
- **sub_industry**: IDX sub-industry classification
- **sector**: IDX sector classification (broader than industry)
- **sub_sector**: IDX sub-sector classification
- **market_cap**: Market capitalisation in IDR
- **market_cap_rank**: Rank by market cap among all IDX companies (1 = largest)
- **employee_num**: Total number of employees
- **employee_num_rank**: Rank by employee count among all IDX companies
- **listing_date**: Date the company was first listed on IDX
- **last_ex_dividend_date**: Most recent ex-dividend date
- **last_close_price**: Latest closing price in IDR
- **daily_close_change**: Day-over-day closing price change as a decimal
- **forward_pe**: Forward price-to-earnings ratio based on next year earnings estimate
- **intrinsic_value**: Estimated intrinsic value per share in IDR
- **esg_score**: ESG (Environmental, Social, Governance) composite score
- **yield_ttm**: Dividend yield over the trailing twelve months
- **dividend_ttm**: Total dividends paid per share over the trailing twelve months in IDR
- **payout_ratio**: Proportion of earnings paid out as dividends
- **cash_payout_ratio**: Proportion of free cash flow paid out as dividends
- **yoy_quarter_earnings_growth**: Year-over-year earnings growth based on the most recent quarter
- **yoy_quarter_revenue_growth**: Year-over-year revenue growth based on the most recent quarter
</Accordion>

<Accordion title="Array Fields">
**How to Use:** Query using the `in` operator to check if any of the provided values exist in the array.

<Accordion title="Examples">
- `where=indices in ['LQ45', 'IDX30']`
- `where=tags in ['52-w-high', 'public-float-under-25']`
</Accordion>

- **tags**: Analyst sentiment tags (e.g. 'bullish'). Filter with `in` operator.
- **indices**: IDX indices this stock belongs to (e.g. LQ45, IDX30). Filter with `in` operator.
- **affiliates**: Related company tickers (affiliates/group entities)
</Accordion>

<Accordion title="JSON Object Fields (Most Recent Data)">
**How to Use:** Query as if they were direct fields — the parser automatically extracts the value from the underlying JSON.

<Accordion title="Examples">
- `where=pe_ttm < 15 and roe_ttm > 0.1`
- `where=last_close_price < all_time_high_price`
- `where=ytd_low_date > '2025-03-01'`
</Accordion>

- **pe_ttm**: Price-to-earnings ratio (trailing twelve months)
- **pb_mrq**: Price-to-book ratio (most recent quarter)
- **ps_ttm**: Price-to-sales ratio (trailing twelve months)
- **dar_mrq**: Debt-to-assets ratio (most recent quarter)
- **der_mrq**: Debt-to-equity ratio (most recent quarter)
- **roa_ttm**: Return on assets (trailing twelve months)
- **roe_ttm**: Return on equity (trailing twelve months)
- **total_assets_mrq**: Total assets in IDR (most recent quarter)
- **total_equity_mrq**: Total shareholders equity in IDR (most recent quarter)
- **total_revenue_mrq**: Total revenue in IDR (most recent quarter)
- **earnings_mrq**: Net profit/loss in IDR (most recent quarter)
- **total_liabilities_mrq**: Total liabilities in IDR (most recent quarter)
- **yearly_mcap_change**: Year-over-year market cap change as a decimal
- **dividend_yield_avg_period**: Number of years used to compute average dividend yield
- **dividend_yield_avg**: Average annual dividend yield over the period
- **ytd_low_price**: Year-to-date lowest closing price in IDR
- **ytd_low_date**: Date of the year-to-date lowest closing price
- **ytd_high_price**: Year-to-date highest closing price in IDR
- **ytd_high_date**: Date of the year-to-date highest closing price
- **52_w_low_price**: 52-week lowest closing price in IDR
- **52_w_low_date**: Date of the 52-week lowest closing price
- **52_w_high_price**: 52-week highest closing price in IDR
- **52_w_high_date**: Date of the 52-week highest closing price
- **90_d_low_price**: 90-day lowest closing price in IDR
- **90_d_low_date**: Date of the 90-day lowest closing price
- **90_d_high_price**: 90-day highest closing price in IDR
- **90_d_high_date**: Date of the 90-day highest closing price
- **all_time_low_price**: All-time lowest closing price in IDR
- **all_time_low_date**: Date of the all-time lowest closing price
- **all_time_high_price**: All-time highest closing price in IDR
- **all_time_high_date**: Date of the all-time highest closing price
</Accordion>

<Accordion title="Yearly JSON Fields (Historical & Forecast Data)">
**How to Use:** Must use bracket notation `field[YYYY]` to access data for a specific year. Supports all numeric operators, field-to-field comparisons, and arithmetic expressions.

<Accordion title="Examples">
- `where=revenue[2023] > earnings[2023] * 5`
- `where=roe[2023] > 0.15 and roe[2022] > 0.15`
- `where=pe[2024] < pe_peer_avg[2024]`
</Accordion>

- **eps**: Earnings per share for the year. Use: `eps[2024]`.
- **eps_growth**: Year-over-year EPS growth rate. Use: `eps_growth[2024]`.
- **total_dividend**: Total dividends paid per share for the year. Use: `total_dividend[2024]`.
- **total_yield**: Total dividend yield for the year. Use: `total_yield[2024]`.
- **earnings**: Annual net profit/loss in IDR. Use: `earnings[2024]`.
- **allowance_for_loans**: Allowance for loan losses in IDR. Use: `allowance_for_loans[2024]`. (banking)
- **capital_expenditure**: Capital expenditure in IDR. Use: `capital_expenditure[2024]`.
- **cash_and_equivalents**: Cash and cash equivalents in IDR. Use: `cash_and_equivalents[2024]`.
- **cash_inflow**: Total cash inflow in IDR. Use: `cash_inflow[2024]`.
- **cash_only**: Cash excluding equivalents in IDR. Use: `cash_only[2024]`.
- **cash_outflow**: Total cash outflow in IDR. Use: `cash_outflow[2024]`.
- **core_capital_tier1**: Tier 1 core capital in IDR. Use: `core_capital_tier1[2024]`. (banking)
- **cost_of_revenue**: Cost of goods sold / cost of revenue in IDR. Use: `cost_of_revenue[2024]`.
- **credit_rwa**: Credit risk-weighted assets in IDR. Use: `credit_rwa[2024]`. (banking)
- **current_account**: Current account deposits in IDR. Use: `current_account[2024]`. (banking)
- **current_assets**: Total current assets in IDR. Use: `current_assets[2024]`.
- **current_liabilities**: Total current liabilities in IDR. Use: `current_liabilities[2024]`.
- **earnings_before_tax**: Earnings before income tax in IDR. Use: `earnings_before_tax[2024]`.
- **ebit**: Earnings before interest and tax in IDR. Use: `ebit[2024]`.
- **ebitda**: Earnings before interest, tax, depreciation and amortisation in IDR. Use: `ebitda[2024]`.
- **end_cash_position**: Ending cash position from the cash flow statement in IDR. Use: `end_cash_position[2024]`.
- **financing_cash_flow**: Net cash from financing activities in IDR. Use: `financing_cash_flow[2024]`.
- **fixed_assets**: Net property, plant and equipment in IDR. Use: `fixed_assets[2024]`.
- **free_cash_flow**: Operating cash flow minus capex in IDR. Use: `free_cash_flow[2024]`.
- **gross_loan**: Gross loan portfolio before allowances in IDR. Use: `gross_loan[2024]`. (banking)
- **gross_profit**: Revenue minus cost of revenue in IDR. Use: `gross_profit[2024]`.
- **high_quality_liquid_asset**: High-quality liquid assets (HQLA) held in IDR. Use: `high_quality_liquid_asset[2024]`. (banking)
- **interest_expense**: Total interest expense in IDR. Use: `interest_expense[2024]`.
- **interest_expense_non_operating**: Non-operating interest expense in IDR. Use: `interest_expense_non_operating[2024]`.
- **interest_income**: Total interest income in IDR. Use: `interest_income[2024]`.
- **inventories**: Inventories on the balance sheet in IDR. Use: `inventories[2024]`.
- **investing_cash_flow**: Net cash from investing activities in IDR. Use: `investing_cash_flow[2024]`.
- **market_rwa**: Market risk-weighted assets in IDR. Use: `market_rwa[2024]`. (banking)
- **net_cash_flow**: Net change in cash for the period in IDR. Use: `net_cash_flow[2024]`.
- **net_interest_income**: Interest income minus interest expense in IDR. Use: `net_interest_income[2024]`. (banking)
- **net_loan**: Net loans after allowances in IDR. Use: `net_loan[2024]`. (banking)
- **net_premium_income**: Net insurance premium income in IDR. Use: `net_premium_income[2024]`. (insurance)
- **non_current_liabilities**: Long-term liabilities in IDR. Use: `non_current_liabilities[2024]`.
- **non_interest_bearing_liabilities**: Liabilities that do not accrue interest in IDR. Use: `non_interest_bearing_liabilities[2024]`. (banking)
- **non_interest_income**: Fee and commission income outside of interest in IDR. Use: `non_interest_income[2024]`. (banking)
- **non_loan_assets**: Total assets excluding loans in IDR. Use: `non_loan_assets[2024]`. (banking)
- **non_loan_earning_assets**: Interest-earning assets excluding loans in IDR. Use: `non_loan_earning_assets[2024]`. (banking)
- **non_loan_non_earning_assets**: Non-earning assets excluding loans in IDR. Use: `non_loan_non_earning_assets[2024]`. (banking)
- **non_operating_income_or_loss**: Income or losses outside core operations in IDR. Use: `non_operating_income_or_loss[2024]`.
- **operating_cash_flow**: Net cash generated from core operations in IDR. Use: `operating_cash_flow[2024]`.
- **operating_expense**: Total operating expenses in IDR. Use: `operating_expense[2024]`.
- **operating_pnl**: Operating profit/loss (revenue minus operating expenses) in IDR. Use: `operating_pnl[2024]`.
- **operational_rwa**: Operational risk-weighted assets in IDR. Use: `operational_rwa[2024]`. (banking)
- **other_interest_bearing_liabilities**: Other interest-bearing liabilities excluding deposits in IDR. Use: `other_interest_bearing_liabilities[2024]`. (banking)
- **outstanding_shares**: Total shares outstanding. Use: `outstanding_shares[2024]`.
- **prepaid_assets**: Prepaid expenses and other current assets in IDR. Use: `prepaid_assets[2024]`.
- **premium_expense**: Insurance premium expenses in IDR. Use: `premium_expense[2024]`. (insurance)
- **premium_income**: Gross insurance premium income in IDR. Use: `premium_income[2024]`. (insurance)
- **provision**: Provision for loan losses or liabilities in IDR. Use: `provision[2024]`.
- **realized_capital_goods_investment**: Realised investment in capital goods in IDR. Use: `realized_capital_goods_investment[2024]`.
- **retained_earnings**: Cumulative retained earnings on balance sheet in IDR. Use: `retained_earnings[2024]`.
- **revenue**: Annual total revenue in IDR. Use: `revenue[2024]`.
- **savings_account**: Savings account deposits in IDR. Use: `savings_account[2024]`. (banking)
- **supplementary_capital_tier2**: Tier 2 supplementary capital in IDR. Use: `supplementary_capital_tier2[2024]`. (banking)
- **tax**: Income tax expense in IDR. Use: `tax[2024]`.
- **time_deposit**: Time deposit liabilities in IDR. Use: `time_deposit[2024]`. (banking)
- **total_assets**: Total assets on the balance sheet in IDR. Use: `total_assets[2024]`.
- **total_capital**: Total regulatory capital in IDR. Use: `total_capital[2024]`. (banking)
- **total_cash_and_due_from_banks**: Cash and amounts due from other banks in IDR. Use: `total_cash_and_due_from_banks[2024]`. (banking)
- **total_debt**: Total interest-bearing debt in IDR. Use: `total_debt[2024]`.
- **total_deposit**: Total customer deposits in IDR. Use: `total_deposit[2024]`. (banking)
- **total_equity**: Total shareholders equity in IDR. Use: `total_equity[2024]`.
- **total_liabilities**: Total liabilities on the balance sheet in IDR. Use: `total_liabilities[2024]`.
- **total_risk_weighted_asset**: Total risk-weighted assets in IDR. Use: `total_risk_weighted_asset[2024]`. (banking)
- **special_mention_loan**: Special mention (watch-list) loans in IDR. Use: `special_mention_loan[2024]`. (banking)
- **non_performing_loan**: Non-performing loans (NPL) in IDR. Use: `non_performing_loan[2024]`. (banking)
- **restructured_loan_current**: Restructured loans currently performing in IDR. Use: `restructured_loan_current[2024]`. (banking)
- **forecast_eps_growth**: Analyst consensus EPS growth forecast. Use: `forecast_eps_growth[2025]`.
- **forecast_revenue_growth**: Analyst consensus revenue growth forecast. Use: `forecast_revenue_growth[2025]`.
- **forecast_eps_estimate**: Analyst consensus EPS estimate in IDR. Use: `forecast_eps_estimate[2025]`.
- **forecast_revenue_estimate**: Analyst consensus revenue estimate in IDR. Use: `forecast_revenue_estimate[2025]`.
- **pe**: Price-to-earnings ratio for the year. Use: `pe[2024]`.
- **pb**: Price-to-book ratio for the year. Use: `pb[2024]`.
- **ps**: Price-to-sales ratio for the year. Use: `ps[2024]`.
- **pcf**: Price-to-cash-flow ratio for the year. Use: `pcf[2024]`.
- **peg**: Price/earnings-to-growth ratio for the year. Use: `peg[2024]`.
- **enterprise_to_ebitda**: Enterprise value to EBITDA for the year. Use: `enterprise_to_ebitda[2024]`.
- **enterprise_to_revenue**: Enterprise value to revenue for the year. Use: `enterprise_to_revenue[2024]`.
- **pb_peer_avg**: Peer average price-to-book ratio for the year. Use: `pb_peer_avg[2024]`.
- **pe_peer_avg**: Peer average price-to-earnings ratio for the year. Use: `pe_peer_avg[2024]`.
- **ps_peer_avg**: Peer average price-to-sales ratio for the year. Use: `ps_peer_avg[2024]`.
- **debt_to_asset_ratio**: Total debt divided by total assets. Use: `debt_to_asset_ratio[2024]`.
- **debt_to_equity_ratio**: Total debt divided by shareholders equity. Use: `debt_to_equity_ratio[2024]`.
- **cash_flow_to_debt_ratio**: Operating cash flow divided by total debt. Use: `cash_flow_to_debt_ratio[2024]`.
- **interest_coverage_ratio**: EBIT divided by interest expense. Use: `interest_coverage_ratio[2024]`.
- **current_ratio**: Current assets divided by current liabilities. Use: `current_ratio[2024]`.
- **operating_cash_flow_margin**: Operating cash flow as a percentage of revenue. Use: `operating_cash_flow_margin[2024]`.
- **fixed_asset_turnover**: Revenue divided by net fixed assets. Use: `fixed_asset_turnover[2024]`.
- **total_asset_turnover**: Revenue divided by total assets. Use: `total_asset_turnover[2024]`.
- **roa**: Return on assets for the year. Use: `roa[2024]`.
- **roe**: Return on equity for the year. Use: `roe[2024]`.
- **net_profit_margin**: Net profit as a percentage of revenue. Use: `net_profit_margin[2024]`.
- **gross_profit_margin**: Gross profit as a percentage of revenue. Use: `gross_profit_margin[2024]`.
- **operating_profit_margin**: Operating profit as a percentage of revenue. Use: `operating_profit_margin[2024]`.
- **capital_adequacy_ratio**: Regulatory capital as a percentage of risk-weighted assets. Use: `capital_adequacy_ratio[2024]`. (banking)
- **casa_ratio**: Current and savings account deposits as a share of total deposits. Use: `casa_ratio[2024]`. (banking)
- **leverage_ratio**: Tier 1 capital divided by total exposure. Use: `leverage_ratio[2024]`. (banking)
- **loan_to_deposit_ratio**: Net loans divided by total deposits. Use: `loan_to_deposit_ratio[2024]`. (banking)
- **liquidity_coverage_ratio**: HQLA divided by net cash outflows over 30 days. Use: `liquidity_coverage_ratio[2024]`. (banking)
- **efficiency_ratio**: Operating expenses divided by net revenue. Use: `efficiency_ratio[2024]`.
- **net_interest_margin**: Net interest income as a percentage of earning assets. Use: `net_interest_margin[2024]`. (banking)
- **cost_to_income_ratio**: Operating costs divided by operating income. Use: `cost_to_income_ratio[2024]`.
</Accordion>

<Accordion title="Quarterly Financial Data">
**How to Use:** Must use bracket notation `field[Qi-YYYY]` to access data for a specific quarter.

<Accordion title="Examples">
- `where=revenue_q[Q1-2024] > 1000000000`
- `where=earnings_q[Q4-2023] > earnings_q[Q3-2023]`
</Accordion>

- **revenue_q**: Quarterly revenue in IDR. Use: `revenue_q[Q1-2024]`.
- **earnings_q**: Quarterly net profit/loss in IDR. Use: `earnings_q[Q1-2024]`.
- **net_loan_q**: Quarterly net loans in IDR. Use: `net_loan_q[Q1-2024]`. (banking)
- **gross_profit_q**: Quarterly gross profit in IDR. Use: `gross_profit_q[Q1-2024]`.
- **time_deposit_q**: Quarterly time deposits in IDR. Use: `time_deposit_q[Q1-2024]`. (banking)
- **operating_pnl_q**: Quarterly operating profit/loss in IDR. Use: `operating_pnl_q[Q1-2024]`.
- **total_deposit_q**: Quarterly total deposits in IDR. Use: `total_deposit_q[Q1-2024]`. (banking)
- **ebit_q**: Quarterly EBIT in IDR. Use: `ebit_q[Q1-2024]`.
- **ebitda_q**: Quarterly EBITDA in IDR. Use: `ebitda_q[Q1-2024]`.
- **earnings_before_tax_q**: Quarterly earnings before tax in IDR. Use: `earnings_before_tax_q[Q1-2024]`.
- **tax_q**: Quarterly income tax expense in IDR. Use: `tax_q[Q1-2024]`.
- **cost_of_revenue_q**: Quarterly cost of revenue in IDR. Use: `cost_of_revenue_q[Q1-2024]`.
- **current_account_q**: Quarterly current account deposits in IDR. Use: `current_account_q[Q1-2024]`. (banking)
- **interest_income_q**: Quarterly interest income in IDR. Use: `interest_income_q[Q1-2024]`. (banking)
- **premium_expense_q**: Quarterly premium expenses in IDR. Use: `premium_expense_q[Q1-2024]`. (insurance)
- **savings_account_q**: Quarterly savings account deposits in IDR. Use: `savings_account_q[Q1-2024]`. (banking)
- **interest_expense_q**: Quarterly interest expense in IDR. Use: `interest_expense_q[Q1-2024]`.
- **operating_expense_q**: Quarterly operating expenses in IDR. Use: `operating_expense_q[Q1-2024]`.
- **non_operating_income_or_loss_q**: Quarterly non-operating income/loss in IDR. Use: `non_operating_income_or_loss_q[Q1-2024]`.
- **interest_expense_non_operating_q**: Quarterly non-operating interest expense in IDR. Use: `interest_expense_non_operating_q[Q1-2024]`.
- **non_interest_bearing_liabilities_q**: Quarterly non-interest-bearing liabilities in IDR. Use: `non_interest_bearing_liabilities_q[Q1-2024]`. (banking)
- **realized_capital_goods_investment_q**: Quarterly realised capital goods investment in IDR. Use: `realized_capital_goods_investment_q[Q1-2024]`.
- **other_interest_bearing_liabilities_q**: Quarterly other interest-bearing liabilities in IDR. Use: `other_interest_bearing_liabilities_q[Q1-2024]`. (banking)
- **total_assets_q**: Quarterly total assets in IDR. Use: `total_assets_q[Q1-2024]`.
- **current_assets_q**: Quarterly current assets in IDR. Use: `current_assets_q[Q1-2024]`.
- **total_liabilities_q**: Quarterly total liabilities in IDR. Use: `total_liabilities_q[Q1-2024]`.
- **net_premium_income_q**: Quarterly net premium income in IDR. Use: `net_premium_income_q[Q1-2024]`. (insurance)
- **allowance_for_loans_q**: Quarterly allowance for loan losses in IDR. Use: `allowance_for_loans_q[Q1-2024]`. (banking)
- **current_liabilities_q**: Quarterly current liabilities in IDR. Use: `current_liabilities_q[Q1-2024]`.
- **non_current_liabilities_q**: Quarterly non-current liabilities in IDR. Use: `non_current_liabilities_q[Q1-2024]`.
- **total_equity_q**: Quarterly total equity in IDR. Use: `total_equity_q[Q1-2024]`.
- **total_debt_q**: Quarterly total debt in IDR. Use: `total_debt_q[Q1-2024]`.
- **cash_only_q**: Quarterly cash (excluding equivalents) in IDR. Use: `cash_only_q[Q1-2024]`.
- **provision_q**: Quarterly provision for losses in IDR. Use: `provision_q[Q1-2024]`.
- **gross_loan_q**: Quarterly gross loans before allowances in IDR. Use: `gross_loan_q[Q1-2024]`. (banking)
- **total_cash_and_due_from_banks_q**: Quarterly cash and amounts due from banks in IDR. Use: `total_cash_and_due_from_banks_q[Q1-2024]`. (banking)
- **operating_cash_flow_q**: Quarterly operating cash flow in IDR. Use: `operating_cash_flow_q[Q1-2024]`.
- **investing_cash_flow_q**: Quarterly investing cash flow in IDR. Use: `investing_cash_flow_q[Q1-2024]`.
- **financing_cash_flow_q**: Quarterly financing cash flow in IDR. Use: `financing_cash_flow_q[Q1-2024]`.
- **net_interest_income_q**: Quarterly net interest income in IDR. Use: `net_interest_income_q[Q1-2024]`. (banking)
- **non_interest_income_q**: Quarterly non-interest income in IDR. Use: `non_interest_income_q[Q1-2024]`. (banking)
- **free_cash_flow_q**: Quarterly free cash flow in IDR. Use: `free_cash_flow_q[Q1-2024]`.
- **premium_income_q**: Quarterly gross premium income in IDR. Use: `premium_income_q[Q1-2024]`. (insurance)
- **capital_expenditure_q**: Quarterly capital expenditure in IDR. Use: `capital_expenditure_q[Q1-2024]`.
</Accordion>

<Accordion title="JSON List Fields">
**How to Use:** The query checks if **any** object in the list matches the condition. Use `=` or `like` for strings, numeric operators for numbers.

<Accordion title="Examples">
- `where=major_shareholders_name like 'PT%' and major_shareholders_share_percentage > 0.1`
- `where=key_executives_name = 'Prajogo Pangestu'`
</Accordion>

- **key_executives_name**: Filter by executive name in the key_executives list. Use `like` operator.
- **key_executives_position**: Filter by executive position/title in the key_executives list. Use `like` operator.
- **executives_shareholdings_name**: Filter by executive name in the shareholdings list.
- **executives_shareholdings_share_amount**: Filter by executive share amount (number of shares).
- **executives_shareholdings_share_percentage**: Filter by executive ownership percentage.
- **major_shareholders_name**: Filter by major shareholder name. Use `like` operator.
- **major_shareholders_share_value**: Filter by major shareholder share value in IDR.
- **major_shareholders_share_amount**: Filter by major shareholder number of shares.
- **major_shareholders_share_percentage**: Filter by major shareholder ownership percentage.
- **free_float**: Public (non-insider) ownership percentage from major_shareholders. Value is a decimal (0.45 = 45%).
</Accordion>

</AccordionGroup>
</Accordion>

<Info>Costs 1 API credit for structured queries. Using the natural-language `?q=` parameter costs 3 API credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `where` | query | `string` | No | SQL-like conditions for advanced filtering. Ignored if `q` is present. Supports operators `=`, `!=`, `>`, `>=`, `<`, `<=`, `like`, `in` combined with `and`/`or`. Use bracket notation for yearly fields: `revenue[2024] > 1000000000000`. Supports arithmetic on both sides: `revenue[2024] / total_assets[2024] > 0.5`. |
| `q` | query | `string` | No | A natural language query (e.g. `top 10 tech companies by revenue in 2023`). When `q` is provided, all other query parameters (`where`, `order_by`, etc.) are ignored as the LLM will generate them. |
| `order_by` | query | `string` | No | Field to sort results by. Use `-` prefix for descending order (e.g. `-market_cap`). Supports arithmetic expressions (e.g. `-(earnings[2024]/earnings[2023])`). Ignored if `q` is present. |
| `desc` | query | `boolean` | No | Sort in descending order. Ignored if `q` is present. |
| `limit` | query | `integer` | No | Maximum number of results to return. Max: 200. Ignored if `q` is present. |
| `offset` | query | `integer` | No | Number of results to skip for pagination. Ignored if `q` is present. |
| `include_query_values` | query | `boolean` | No | If `true`, the response includes a `query_values` object showing the interpreted year and country extracted from the query. |


---

#### `GET` `/v2/free-float/` - Free Float Market Analysis

Returns the free float percentage for IDX-listed companies, optionally filtered by one level of the sector taxonomy. Results are ordered by `free_float` descending.

<Note>Free float is calculated as the `share_percentage` of the **Public** entry in a company's major shareholders list.</Note>

<Warning>Query parameters are **mutually exclusive**. Provide at most one filter parameter per request.</Warning>

<Info>Costs 1 API credit per 100 companies returned, rounded up.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sector` | query | `string` | No | Kebab-case sector slug. E.g. `infrastructures`, `healthcare`, `transportation-logistic`. Retrieve valid values from the [Subsectors](./helper-list/subsectors) endpoint. |
| `sub_sector` | query | `string` | No | Kebab-case subsector slug. E.g. `banks`, `basic-materials`, `food-beverage`. Retrieve valid values from the [Subsectors](./helper-list/subsectors) endpoint. |
| `industry` | query | `string` | No | Kebab-case industry slug. E.g. `oil-gas`, `electrical`, `chemicals`. Retrieve valid values from the [Industries](./helper-list/industries) endpoint. |
| `sub_industry` | query | `string` | No | Kebab-case sub-industry slug. E.g. `coal-production`, `gold`, `healthcare-providers`. Retrieve valid values from the [Subindustries](./helper-list/subindustries) endpoint. |


---

### 📂 Helper Lists

#### `GET` `/v2/companies/list_companies_with_segments/` - Companies with Revenue Segments

Returns a dictionary of all companies that have revenue and cost segment data available, along with their available financial years.

**Used by:** [Company Revenue and Cost Segments](../report/company-segments)

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/companies/quarterly-financial-dates/` - Latest Quarterly Financial Dates (Universe)

Returns the **latest** available quarterly report date (and its quarter label) for **every** IDX company in one paginated feed — instead of calling the per-symbol [Quarterly Financial Dates](./company-quarterly-dates) helper once per ticker.

Built for **freshness polling**: store the dates you've seen, then re-poll with `?since=` to fetch only the companies that have since reported a new quarter, keeping repeat polls cheap.

**Related:** [Quarterly Financials](../report/quarterly-financials) for the actual figures on a given `report_date`.

<Note>One row per company (~950), sorted by symbol. Companies with no quarterly data are omitted.</Note>

<Info>Costs 1 API credit per page. The full universe is ~32 pages at the maximum `limit` of 30 (~32 credits per full sweep). Use `since` to poll incrementally for far fewer credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `year` | query | `integer` | No | Restrict to report dates within this calendar year, then return each company's latest quarter within it (e.g. `2024`). |
| `limit` | query | `integer` | No | Maximum number of companies to return per page. Max: 30. |
| `offset` | query | `integer` | No | Number of companies to skip for pagination. |
| `since` | query | `string` | No | Return only companies whose latest quarter-end date is on or after this date (`YYYY-MM-DD`). Use it to poll for newly-reported quarters. A future date returns an empty result set. |


---

#### `GET` `/v2/company/get_quarterly_financial_dates/{symbol}/` - Quarterly Financial Dates

Returns all available quarterly financial report dates for a given symbol, grouped by year. Use the `report_date` values returned here as inputs to the `report_date` parameter in the Quarterly Financials endpoint.

**Used by:** [Company Quarterly Financials](../report/quarterly-financials)

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `ASII`, `BBCA`, `BMRI`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol symbol. E.g. `ASII`, `BBCA`. |


---

#### `GET` `/v2/industries/` - Industries

Returns all available subsector/industry pairs as kebab-case slugs. Use these values as inputs to the `industry` parameter.

**Used by:** [Companies Screener](../companies), [Free Float Market Analysis](../free-float)

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/subindustries/` - Subindustries

Returns all available industry/sub-industry pairs as kebab-case slugs. Use these values as inputs to the `sub_industry` parameter.

**Used by:** [Companies Screener](../companies), [Free Float Market Analysis](../free-float)

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/subsectors/` - Subsectors

Returns all available sector/subsector pairs as kebab-case slugs. Use these values as inputs to `sector` and `sub_sector` parameters.

**Used by:** [Companies Screener](../companies), [Sector Report](../report/sector-report), [Free Float Market Analysis](../free-float)

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/tags/` - News Tags

Returns a sorted alphabetical array of all available tag slugs used across news articles and company filings. Use these values as inputs to the `tags` parameter.

**Used by:** [News Articles](../news/news), [Company Filings](../news/filings)

<Info>Costs 1 API credit.</Info>


---

### 📂 Detailed Reports

#### `GET` `/v2/company/corporate-actions/{symbol}/` - Corporate Actions

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `BMRI`, `TLKM`.</Note>

Returns all corporate action history for a given IDX-listed company: stock splits, right issues, warrants, bonus shares, AGM events, upcoming dividends, and historical dividends.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol. E.g. `BBCA`, `BMRI`. |


---

#### `GET` `/v2/company/get-segments/{symbol}/` - Company Revenue Segments

Returns a Sankey-graph-ready revenue and cost segment breakdown for a given company and financial year. Not all companies have segment data — use the [Companies with Revenue Segments](../helper-list/companies-segments-list) endpoint to check availability.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BUMI`, `TLKM`, `ASII`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol symbol. E.g. `BUMI`, `TLKM`. Not all companies have segment data — check the [Companies with Revenue Segments](../helper-list/companies-segments-list) helper first. |
| `financial_year` | query | `integer` | No | Financial year to retrieve. Defaults to the latest available year. |


---

#### `GET` `/v2/company/report/` - Company Report

Returns a comprehensive company report organized into distinct sections. By default all sections are included. Use `sections` to request only the data you need and reduce response size.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BREN`, `BBCA`, `TLKM`.</Note>

<Accordion title="Available sections">
- **overview**: Company identity, market cap, price history, ESG score, tags, indices, affiliates
- **valuation**: Close price, forward PE, intrinsic value, historical valuation (PB, PE, PS, PCF, PEG by year)
- **future**: Analyst forecasts, EPS growth estimates
- **peers**: Peer comparison within the same subsector
- **financials**: Historical annual financials (revenue, earnings, assets, equity, margins)
- **dividend**: Dividend history, yield, payout ratio
- **management**: Key executives and their shareholdings
- **ownership**: Major shareholders and ownership structure
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 8 sections) consumes 8 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol symbol. E.g. `BREN`, `BBCA`. |
| `sections` | query | `array` | No | Comma-separated list of sections to include. Default to all. |


---

#### `GET` `/v2/company/report/{symbol}/` - Company Report

Returns a comprehensive company report organized into distinct sections. By default all sections are included. Use `sections` to request only the data you need and reduce response size.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BREN`, `BBCA`, `TLKM`.</Note>

<Accordion title="Available sections">
- **overview**: Company identity, market cap, price history, ESG score, tags, indices, affiliates
- **valuation**: Close price, forward PE, intrinsic value, historical valuation (PB, PE, PS, PCF, PEG by year)
- **future**: Analyst forecasts, EPS growth estimates
- **peers**: Peer comparison within the same subsector
- **financials**: Historical annual financials (revenue, earnings, assets, equity, margins)
- **dividend**: Dividend history, yield, payout ratio
- **management**: Key executives and their shareholdings
- **ownership**: Major shareholders and ownership structure
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 8 sections) consumes 8 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol symbol. E.g. `BREN`, `BBCA`. |
| `sections` | query | `array` | No | Comma-separated list of sections to include. Default to all. |


---

#### `GET` `/v2/company/shareholders-composition/{symbol}/` - Shareholders Composition

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `BMRI`, `TLKM`.</Note>

Returns monthly shareholder composition snapshots for a given IDX-listed company within a single calendar year, broken down by investor category (insurance, corporate, pension fund, financial institutions, individual, mutual fund, securities companies, foundation, other) for both local (`_l`) and foreign (`_f`) investors.

<Note>Data is available from 2021 onwards. Querying earlier years returns an empty `data` array.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol. E.g. `BBCA`, `BMRI`. |
| `year` | query | `integer` | No | Calendar year (e.g. `2025`). Defaults to the current year. Data is available from 2021; earlier years return an empty `data` array. Future years are rejected. |


---

#### `GET` `/v2/financials/quarterly/{symbol}/` - Company Quarterly Financials

Returns quarterly financial data for a given IDX symbol. Fields vary by sector — financial-sector companies (banks, insurance) have additional metrics like `net_interest_income`, `gross_loan`, `total_deposit`.

<Note>Use the [Quarterly Financial Dates](../helper-list/company-quarterly-dates) endpoint to get valid `report_date` values for a symbol.</Note>

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BMRI`, `BBCA`, `TLKM`.</Note>

<Info>Costs 1 API credit per quarter returned.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol symbol. E.g. `BMRI`, `BBCA`. |
| `report_date` | query | `string` | No | Specific report date (YYYY-MM-DD). Use the [Quarterly Financial Dates](../helper-list/company-quarterly-dates) endpoint to get valid values. |
| `approx` | query | `boolean` | No | If `true` (default), use approximate quarter matching when an exact date is not found. |
| `n_quarters` | query | `integer` | No | Number of most recent quarters to return. |


---

#### `GET` `/v2/subsector/report/` - Subsector Report

Returns a comprehensive report for an IDX subsector, organized into distinct sections. Use `sections` to fetch only the data you need.

<Note>The `sub_sector` path parameter must be in **kebab-case** format. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint. E.g. `banks`, `utilities`, `food-beverage`.</Note>

<Accordion title="Available sections">
- **statistics**: Company count, median PE, weighted avg PE, min/max PE
- **market_cap**: Total and avg market cap, quarterly market cap trend, mcap change (1w/1y/YTD)
- **stability**: Weighted max drawdown, weighted relative standard deviation
- **valuation**: Historical PB, PE, PS, PCF by year
- **growth**: Weighted avg revenue and earnings growth
- **companies**: List of companies in the subsector with key metrics
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 6 sections) consumes 6 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sub_sector` | path | `string` | ✅ Yes | Kebab-case subsector slug. E.g. `banks`, `utilities`. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint. |
| `sections` | query | `array` | No | Comma-separated sections to include. Default to all. |


---

#### `GET` `/v2/subsector/report/{sub_sector}/` - Subsector Report

Returns a comprehensive report for an IDX subsector, organized into distinct sections. Use `sections` to fetch only the data you need.

<Note>The `sub_sector` path parameter must be in **kebab-case** format. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint. E.g. `banks`, `utilities`, `food-beverage`.</Note>

<Accordion title="Available sections">
- **statistics**: Company count, median PE, weighted avg PE, min/max PE
- **market_cap**: Total and avg market cap, quarterly market cap trend, mcap change (1w/1y/YTD)
- **stability**: Weighted max drawdown, weighted relative standard deviation
- **valuation**: Historical PB, PE, PS, PCF by year
- **growth**: Weighted avg revenue and earnings growth
- **companies**: List of companies in the subsector with key metrics
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 6 sections) consumes 6 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sub_sector` | path | `string` | ✅ Yes | Kebab-case subsector slug. E.g. `banks`, `utilities`. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint. |
| `sections` | query | `array` | No | Comma-separated sections to include. Default to all. |


---

### 📂 Transaction Data

#### `GET` `/v2/close/` - Daily Full-Universe Close

Returns the daily closing price for **every** IDX ticker on a single trading day, in one paginated feed — instead of calling the per-symbol [Daily Transaction Data](./daily) endpoint once per ticker.

<Note>Defaults to the most recent trading day. Pass `date` (`YYYY-MM-DD`) to pull a specific day. Future dates return 400.</Note>

<Note>Tickers with no recorded close for the requested day are omitted.</Note>

<Info>Costs 1 API credit per page. The full ~950-ticker universe is ~32 pages at the maximum `limit` of 30 (~32 credits per full pull).</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | `integer` | No | Maximum number of tickers to return per page. Max: 30. |
| `offset` | query | `integer` | No | Number of tickers to skip for pagination. |
| `date` | query | `string` | No | Trading day to pull, in `YYYY-MM-DD` format. Defaults to the most recent trading day with data. Future dates return 400. |


---

#### `GET` `/v2/daily/{symbol}/` - Daily Transaction Data

Returns daily close price, volume, and market cap for a given IDX symbol over a date range of up to 90 days.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `GOTO`, `TLKM`.</Note>

<Note>Date range: defaults to last 30 days. Max window 90 days; wider ranges are clamped to the most recent 90 days ending at `end`. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol. E.g. `BBCA`, `GOTO`, `TLKM`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Defaults to 30 days before `end`. Wider ranges are clamped to the most recent 90 days. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Defaults to today. Future dates return 400. |


---

#### `GET` `/v2/idx-total/` - IDX Market Summary

Returns historical total IDX market capitalization for a date range of up to 90 days.

<Note>Earliest available data is from **January 1, 2021**. Requesting earlier dates returns 400.</Note>

<Note>Date range: defaults to last 30 days. Max window 90 days; wider ranges are clamped to the most recent 90 days ending at `end`. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Earliest valid: `2021-01-01`. Defaults to 30 days before `end`. Wider ranges are clamped to the most recent 90 days. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Defaults to today. Future dates return 400. |


---

#### `GET` `/v2/index-daily/{index_code}/` - Index Daily Transaction Data

Returns daily closing price for a given IDX index over a date range of up to 90 days.

<Note>Earliest available data is from **January 2, 2019**.</Note>

<Accordion title="Available index codes">
`ftse`, `idx30`, `idxbumn20`, `idxesgl`, `idxg30`, `idxhidiv20`, `idxq30`, `idxv30`, `ihsg`, `jii70`, `kompas100`, `lq45`, `sminfra18`, `srikehati`, `sti`, `economic30`, `idxvesta28`
</Accordion>

<Note>Date range: defaults to last 30 days. Max window 90 days; wider ranges are clamped to the most recent 90 days ending at `end`. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `index_code` | path | `string` | ✅ Yes | Index code. E.g. `lq45`, `ihsg`, `idx30`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Defaults to 30 days before `end`. Wider ranges are clamped to the most recent 90 days. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Defaults to today. Future dates return 400. |


---

### 📂 Rankings

#### `GET` `/v2/companies/top-changes/` - Top Company Movers

Returns top gainers and losers across multiple time periods. Supports two classifications (`top_gainers`, `top_losers`) and five periods (`1d`, `7d`, `14d`, `30d`, `365d`).

<Info>Costs 1 API credit per requested classification × period combination. Default behavior (2 classifications × 5 periods) consumes 10 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sub_sector` | query | `string` | No | Filter by kebab-case subsector slug. E.g. `banks`. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint. |
| `n_stock` | query | `integer` | No | Number of companies per period. Default 5, max 10. |
| `classifications` | query | `array` | No | Comma-separated. Choices: `top_gainers`, `top_losers`. Default: both. |
| `periods` | query | `array` | No | Comma-separated periods. Choices: `1d`, `7d`, `14d`, `30d`, `365d`. Default: all. |
| `min_mcap_billion` | query | `integer` | No | Minimum market cap filter in billion IDR. Default 5000. |


---

#### `GET` `/v2/most-traded/` - Most Traded Stocks

Returns the most traded IDX stocks by transaction volume over a date range of up to 90 days. Results are keyed by date.

<Note>Date range: defaults to last 30 days. Max window 90 days; wider ranges are clamped to the most recent 90 days ending at `end`. Future `end` dates return 400.</Note>

<Info>Costs 2 API credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sub_sector` | query | `string` | No | Filter by kebab-case subsector slug. E.g. `banks`. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Defaults to 30 days before `end`. Wider ranges are clamped to the most recent 90 days. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Defaults to today. Future dates return 400. |
| `adjusted` | query | `boolean` | No | If `true`, rank by volume × closing price instead of raw volume. |
| `n_stock` | query | `integer` | No | Number of tickers per day. Default 5, max 10. |


---

### 📂 IPO & Performance

#### `GET` `/v2/listing-performance/{symbol}/` - Company IPO & Listing Performance

Returns price change percentages since listing date for a given IDX-listed symbol, across 7, 30, 90, and 365-day windows.

<Note>Listing performance data is only available for tickers listed **after May 2005**.</Note>

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `GOTO`, `BREN`, `BUKA`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX symbol symbol. E.g. `ARTO`, `BREN`, `GOTO`. |


---

### 📂 News & Filings

#### `GET` `/v2/filings/` - Company Filings

Returns IDX insider trading filings — buy/sell transactions by company insiders and major shareholders. Supports filtering by sector, subsector, tags, symbol, transaction type, holder_type, and date range.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `BMRI`, `TLKM`.</Note>

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | No | IDX symbol symbol to filter by. E.g. `BBCA`, `BMRI`. |
| `sector` | query | `string` | No | Kebab-case sector slug. E.g. `healthcare`, `financials`. Get valid values from the [Subsectors](../helper-list/subsectors) endpoint. |
| `sub_sector` | query | `string` | No | Kebab-case subsector slug. E.g. `banks`, `tobacco`. Get valid values from the [Subsectors](../helper-list/subsectors) endpoint. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `timestamp`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Number of results to return. Maximum: 30. |
| `offset` | query | `integer` | No | Number of results to skip for pagination. |
| `transaction_type` | query | `string` | No | Filter by transaction direction: `buy`, `sell`, or `others`. |
| `tags` | query | `string` | No | Comma-separated tag slugs. E.g. `Bullish,insider-trading`. Get valid values from the [News Tags](../helper-list/tags) endpoint. |
| `holder_type` | query | `string` | No | Filter by holder type (case-insensitive). |


---

#### `GET` `/v2/news/` - News Articles

Returns paginated news articles from either the IDX (Indonesian Stock Exchange) or mining news sources. Use the `extension` parameter to choose the data source — each extension has its own set of valid filter parameters.

<Warning>Mixing IDX and mining parameters will return a 400 error. E.g. passing `sector` with `extension=mining` is invalid.</Warning>

<Accordion title="IDX Extension Parameters (extension=idx)">
- **sector**: Comma-separated sector slugs (kebab-case). Get values from the [Subsectors](./helper-list/subsectors) endpoint.
- **sub_sector**: Comma-separated subsector slugs (kebab-case). E.g. `banks`, `insurance`, `retailing`. Get valid values from the [Subsectors](./helper-list/subsectors) endpoint.
- **tags**: Comma-separated tag slugs. Get values from the [News Tags](./helper-list/tags) endpoint.
- **symbols**: Comma-separated IDX symbols. E.g. `BBCA,BBRI,BMRI`.
- **keyword**: Case-insensitive substring match on article title.
</Accordion>

<Accordion title="Mining Extension Parameters (extension=mining)">
- **keyword**: Case-insensitive substring match on article title.
- **commodity_type**: Filter by commodity. E.g. `Coal`, `Nickel`, `Gold`.
</Accordion>

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sector` | query | `string` | No | **IDX only.** Comma-separated sector slugs (kebab-case). |
| `sub_sector` | query | `string` | No | **IDX only.** Comma-separated subsector slugs (kebab-case). |
| `commodity_type` | query | `string` | No | **Mining only.** Filter by commodity type. E.g. `Coal`, `Nickel`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `timestamp`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Items per page. Max 30. |
| `offset` | query | `integer` | No | Items to skip for pagination. |
| `tags` | query | `string` | No | **IDX only.** Comma-separated tag slugs. Get valid values from the [News Tags](../helper-list/tags) endpoint. |
| `extension` | query | `string` | No | Data source. Default `idx`. |
| `keyword` | query | `string` | No | Case-insensitive substring match on article title. Works for both IDX and mining. |
| `symbols` | query | `string` | No | **IDX only.** Comma-separated IDX symbols. E.g. `BBCA,BBRI`. |


---

#### `GET` `/v2/suspensions/` - Stock Suspensions

Returns a paginated list of historical IDX-listed stock suspensions, including the date a stock was suspended, the official reason, and a link to the IDX PDF notice. Filter by `symbol` to look up a specific company's suspension history, or by `start` / `end` to scope to a date window.

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | No | Optional filter by IDX symbol (case-insensitive). E.g. `BBCA`, `GOTO`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `suspension_date`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Items per page. Max 30. |
| `offset` | query | `integer` | No | Number of items to skip. |


---

### 📂 Brokers

#### `GET` `/v2/broker-activity/{broker_code}/` - Broker Activity By Code

All (stock, day) trading activity for one broker over a date range up to 14 days, grouped by date. Optionally filter to a single stock via `symbol`. Each entry in `data` lists every stock the broker touched that day with buy/sell/net values.

<Note>Broker codes are the two-letter exchange-member identifiers (e.g. `MG`, `AK`, `CC`). Retrieve the full list of valid codes from the [Broker Registry](./broker-registry) endpoint.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `broker_code` | path | `string` | ✅ Yes | Broker code. E.g. `MG`, `AK`, `CC`. |
| `symbol` | query | `string` | No | Optional filter to a single stock ticker (e.g. `BBCA`). |
| `start` | query | `string` | No | Start date (YYYY-MM-DD). Default: end - 14 days. |
| `end` | query | `string` | No | End date (YYYY-MM-DD). Default: today. |


---

#### `GET` `/v2/broker-activity/{broker_code}/top/` - Top Accumulations and Distributions Per Broker

Returns the stocks a single broker has been most actively accumulating and distributing over a date range. `top_accumulations` ranks stocks the broker has net bought (largest positive net IDR first); `top_distributions` ranks stocks the broker has net sold (largest negative net IDR first). Useful for tracking a specific broker's directional positioning across the IDX universe.

<Note>Broker codes are the two-letter exchange-member identifiers (e.g. `MG`, `AK`, `CC`). Retrieve the full list of valid codes from the [Broker Registry](./broker-registry) endpoint.</Note>

<Info>Costs 2 API credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `broker_code` | path | `string` | ✅ Yes | Broker code. E.g. `MG`, `AK`, `CC`. |
| `start` | query | `string` | No | Start date (YYYY-MM-DD). Default: end - 30 days. |
| `end` | query | `string` | No | End date (YYYY-MM-DD). Default: today. |
| `n_brokers` | query | `integer` | No | How many accumulations and distributions to return each (default 10, max 90). |


---

#### `GET` `/v2/broker-summary/{symbol}/` - Broker Activity Per Symbol

Per-broker daily trading rows for one IDX ticker over a date range up to 14 days, grouped by date. Optionally filter to a single broker via `broker_code`. Each entry in `data` lists every broker active on that day with buy/sell/net values, lots, frequency, and weighted avg price per share.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `GOTO`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX ticker symbol. E.g. `BBCA`, `GOTO`. |
| `broker_code` | query | `string` | No | Optional filter to a single broker code (e.g. `MG`). |
| `start` | query | `string` | No | Start date (YYYY-MM-DD). Default: end - 14 days. |
| `end` | query | `string` | No | End date (YYYY-MM-DD). Default: today. |


---

#### `GET` `/v2/broker-summary/{symbol}/top/` - Top Buyers and Sellers Per Symbol

Returns the brokers most actively accumulating and distributing a single IDX ticker over a date range. `top_buyers` ranks brokers by net buy value (largest positive net IDR first); `top_sellers` ranks brokers by net sell value (largest negative net IDR first). Useful for spotting institutional accumulation or distribution patterns on a specific stock.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `GOTO`.</Note>

<Info>Costs 2 API credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX ticker symbol. E.g. `BBCA`, `GOTO`. |
| `start` | query | `string` | No | Start date (YYYY-MM-DD). Default: end - 30 days. |
| `end` | query | `string` | No | End date (YYYY-MM-DD). Default: today. |
| `cohort` | query | `string` | No | Filter brokers by cohort (case-insensitive). Default `all`. |
| `n_brokers` | query | `integer` | No | How many buyers and sellers to return each (default 10, max 90). |
| `origin` | query | `string` | No | Filter brokers by origin. Default `all`. |


---

#### `GET` `/v2/brokers/` - Broker Registry

Curated registry of IDX exchange-member brokers with name, origin (foreign / domestic), cohort (retail / mixed / institutional / unknown), and license type. Use this as the authoritative source for valid broker codes when calling broker-scoped endpoints such as `/v2/broker-activity/{broker_code}/`.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `cohort` | query | `string` | No | Optional filter by broker cohort (case-insensitive). |
| `origin` | query | `string` | No | Optional filter by broker origin. |


---

#### `GET` `/v2/brokers/top/` - Top Brokers Daily Ranking

Brokers ranked by gross trade value (default) or absolute net flow for a single date. Optionally filter by `origin` (foreign/domestic) and `cohort` (retail/mixed/institutional/unknown). Returns all matching brokers if `n_brokers` is omitted.

<Note>Origin and cohort classifications come from the broker registry. Retrieve the full list with these classifications from the [Broker Registry](./broker-registry) endpoint.</Note>

<Info>Costs 2 API credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `cohort` | query | `string` | No | Filter by broker cohort (case-insensitive). Default `all`. |
| `date` | query | `string` | No | Target date (YYYY-MM-DD). Default: latest available. |
| `metric` | query | `string` | No | `gross` ranks by total buy + sell value; `net` ranks by absolute net flow. Default `gross`. |
| `n_brokers` | query | `integer` | No | How many brokers to return. Default: all matching (~88 total). Max 90. |
| `origin` | query | `string` | No | Filter by broker origin. Default `all`. |


---

#### `GET` `/v2/foreign-flow/{symbol}/` - Daily Net Foreign Inflow

Daily net foreign-broker inflow (IDR) for one IDX ticker over a date range up to 90 days. Positive `net_foreign_inflow` means foreign brokers were net buyers that day; negative means foreign brokers were net sellers. Useful for tracking foreign sentiment and capital flow on a specific stock.

<Note>IDX symbol: 4 letters, optionally followed by `.jk` (case-insensitive). E.g. `BBCA`, `GOTO`.</Note>

<Note>Only foreign flow is returned because the exchange is a closed market: for any `(symbol, date)`, foreign and domestic net values always sum to zero, so domestic flow is simply `-net_foreign_inflow`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | IDX ticker symbol. E.g. `BBCA`, `GOTO`. |
| `start` | query | `string` | No | Start date (YYYY-MM-DD). Default: end - 30 days. |
| `end` | query | `string` | No | End date (YYYY-MM-DD). Default: today. |


---

## 🏛️ Singapore (SGX)

### 📂 SGX - Company Screener

#### `GET` `/v2/sgx/companies/` - SGX Companies Screener

High-performance API for filtering and sorting SGX-listed companies. Supports both structured SQL-like queries (`where`, `order_by`) and natural language queries (`q`). Returns a paginated list of companies.

**Query modes** (mutually exclusive — `q` overrides all others):
- `q`: Natural language, e.g. `top 5 SGX banks by market cap`
- `where` + `order_by`: SQL-like structured query

<Note>SGX symbol: 3 characters (letters or digits). E.g. `D05`, `U11`, `Z74`. No suffix.</Note>

<Note>SGX sector column contains duplicate variants (e.g. `Consumer Cyclical` / `Consumer Cyclicals`, `Financial Services` / `Financials`, `Real Estate` / `Properties & Real Estate` / `REIT`) pending upstream cleanup. To capture all matching companies, query with `OR` (e.g. `sector = 'Real Estate' OR sector = 'Properties & Real Estate' OR sector = 'REIT'`).</Note>

<Accordion title="Smart FY Handling">
To account for reporting lags, 'latest year' queries made between January and April default to the previous audited year (e.g. a query in early 2026 uses 2024 data).
</Accordion>

<Accordion title="Syntax and Operators">
**Operators:** `=`, `!=`, `>`, `>=`, `<`, `<=`, `like`, `in`

**Logic:** combine conditions with `and` and `or`

**String values:** use single or double quotes — `sector = 'Technology'`

**Lists (for `in`):** `tags in ['blue-chip', 'dividend']`
</Accordion>

<Accordion title="Yearly Data">
Access historical data using bracket notation: `field[YYYY]`

Examples: `revenue[2023] > 1000000000` or `total_yield[2024] > 0.05`

**Note:** SGX data is annual only — there is no quarterly data.
</Accordion>

<Accordion title="Arithmetic Expressions">
Perform calculations within your query on both sides of a condition.

Examples: `earnings[2024] > earnings[2023] * 1.25` or `revenue[2024] / revenue[2023] > 1.5`
</Accordion>

<Accordion title="SGX-Specific Limitations">
Some IDX screener features are **not available** for SGX due to data scope:

- **No person / entity ownership queries** — no `executives`, `major_shareholders`, or `affiliates` fields.
- **No peer averages** — no `pe_peer_avg`, `pb_peer_avg`, etc.
- **No `free_float` field**.
- **No quarterly data** — only annual fields like `revenue[2024]`.
- **Coverage caveats**: yearly fields marked `[Big caps only]` are populated only for ~22 large-caps; fields marked `[Banks only]` are populated only for DBS / OCBC / UOB.
</Accordion>

<Accordion title="Available Fields">
<AccordionGroup>

<Accordion title="Direct Fields (Top-level columns)">
**How to Use:** Query these fields directly using standard operators (`=`, `!=`, `>`, `<`, `LIKE`, `IN`). String comparisons are case-insensitive.

<Accordion title="Examples">
- `where=market_cap > 500000000000000`
- `where=company_name like '%energi%'`
- `where=sector = 'Financials' and listing_date > '2005-01-01'`
</Accordion>

- **symbol**: SGX ticker symbol (3 characters, e.g. `D05`, `U11`, `Z74`)
- **company_name**: Full registered company name
- **sector**: SGX sector classification. NB: source data contains duplicate labels (e.g. `Consumer Cyclical` vs `Consumer Cyclicals`, `Financial Services` vs `Financials`) — pending upstream cleanup.
- **sub_sector**: SGX sub-sector classification (126 distinct values)
- **market_cap**: Market capitalisation in SGD
- **volume**: Recent average daily trading volume (shares)
- **last_close_price**: Most recent close price in SGD
- **employee_num**: Total number of employees
- **pe**: Price-to-earnings ratio
- **eps**: Earnings per share (SGD)
- **beta**: Beta vs SGX market
- **ps**: Price-to-sales ratio
- **pcf**: Price-to-cash-flow ratio
- **pb**: Price-to-book ratio
- **gross_margin**: Gross profit margin (decimal, e.g. 0.45 = 45%)
- **operating_margin**: Operating profit margin (decimal)
- **net_profit_margin**: Net profit margin (decimal)
- **quick_ratio**: Quick ratio (acid test)
- **current_ratio**: Current ratio
- **debt_to_equity**: Debt-to-equity ratio
- **one_year_eps_growth**: 1-year EPS growth (decimal)
- **one_year_sales_growth**: 1-year sales (revenue) growth (decimal)
- **forward_dividend**: Forward annual dividend per share in SGD
- **forward_dividend_yield**: Forward annual dividend yield (decimal)
- **dividend_ttm**: Trailing-twelve-month dividend per share in SGD
- **dividend_yield_5y_avg**: 5-year average dividend yield (decimal)
- **dividend_growth_rate**: Year-over-year dividend growth rate (decimal)
- **payout_ratio**: Dividend payout ratio (decimal)
- **change_1d**: 1-day price change (decimal)
- **change_7d**: 7-day price change (decimal)
- **change_1m**: 1-month price change (decimal)
- **change_ytd**: Year-to-date price change (decimal)
- **change_1y**: 1-year price change (decimal)
- **change_3y**: 3-year price change (decimal)
</Accordion>

<Accordion title="Array Fields">
**How to Use:** Query using the `in` operator to check if any of the provided values exist in the array.

<Accordion title="Examples">
- `where=indices in ['LQ45', 'IDX30']`
- `where=tags in ['52-w-high', 'public-float-under-25']`
</Accordion>

- **tags**: Analyst sentiment / classification tags
</Accordion>

<Accordion title="JSON Object Fields (Most Recent Data)">
**How to Use:** Query as if they were direct fields — the parser automatically extracts the value from the underlying JSON.

<Accordion title="Examples">
- `where=pe_ttm < 15 and roe_ttm > 0.1`
- `where=last_close_price < all_time_high_price`
- `where=ytd_low_date > '2025-03-01'`
</Accordion>

- **ytd_low_price**: Year-to-date lowest closing price in SGD
- **ytd_low_date**: Date of the year-to-date lowest closing price
- **ytd_high_price**: Year-to-date highest closing price in SGD
- **ytd_high_date**: Date of the year-to-date highest closing price
- **52_w_low_price**: 52-week lowest closing price in SGD
- **52_w_low_date**: Date of the 52-week lowest closing price
- **52_w_high_price**: 52-week highest closing price in SGD
- **52_w_high_date**: Date of the 52-week highest closing price
- **90_d_low_price**: 90-day lowest closing price in SGD
- **90_d_low_date**: Date of the 90-day lowest closing price
- **90_d_high_price**: 90-day highest closing price in SGD
- **90_d_high_date**: Date of the 90-day highest closing price
- **all_time_low_price**: All-time lowest closing price in SGD
- **all_time_low_date**: Date of the all-time lowest closing price
- **all_time_high_price**: All-time highest closing price in SGD
- **all_time_high_date**: Date of the all-time highest closing price
</Accordion>

<Accordion title="Yearly JSON Fields (Historical & Forecast Data)">
**How to Use:** Must use bracket notation `field[YYYY]` to access data for a specific year. Supports all numeric operators, field-to-field comparisons, and arithmetic expressions.

<Accordion title="Examples">
- `where=revenue[2023] > earnings[2023] * 5`
- `where=roe[2023] > 0.15 and roe[2022] > 0.15`
- `where=pe[2024] < pe_peer_avg[2024]`
</Accordion>

- **revenue**: Annual revenue in SGD. Use: `revenue[2024]`.
- **earnings**: Annual net profit/loss in SGD. Use: `earnings[2024]`.
- **total_dividend**: Total dividends paid per share for the year (SGD). Use: `total_dividend[2024]`.
- **total_yield**: Total dividend yield for the year (decimal). Use: `total_yield[2024]`.
- **operating_cash_flow**: Operating cash flow in SGD. Use: `operating_cash_flow[2024]`. _(coverage: Big caps only)_
- **investing_cash_flow**: Investing cash flow in SGD. Use: `investing_cash_flow[2024]`. _(coverage: Big caps only)_
- **financing_cash_flow**: Financing cash flow in SGD. Use: `financing_cash_flow[2024]`. _(coverage: Big caps only)_
- **free_cash_flow**: Free cash flow in SGD. Use: `free_cash_flow[2024]`. _(coverage: Big caps only)_
- **net_cash_flow**: Net cash flow in SGD. Use: `net_cash_flow[2024]`. _(coverage: Big caps only)_
- **capital_expenditure**: Capital expenditure in SGD. Use: `capital_expenditure[2024]`. _(coverage: Big caps only)_
- **ebit**: EBIT (earnings before interest and tax) in SGD. Use: `ebit[2024]`. _(coverage: Big caps only)_
- **ebitda**: EBITDA in SGD. Use: `ebitda[2024]`. _(coverage: Big caps only)_
- **gross_income**: Gross income in SGD. Use: `gross_income[2024]`. _(coverage: Big caps only)_
- **cost_of_revenue**: Cost of revenue in SGD. Use: `cost_of_revenue[2024]`. _(coverage: Big caps only)_
- **operating_income**: Operating income in SGD. Use: `operating_income[2024]`. _(coverage: Big caps only)_
- **operating_expense**: Operating expense in SGD. Use: `operating_expense[2024]`. _(coverage: Big caps only)_
- **pretax_income**: Pre-tax income in SGD. Use: `pretax_income[2024]`. _(coverage: Big caps only)_
- **income_taxes**: Income taxes paid in SGD. Use: `income_taxes[2024]`. _(coverage: Big caps only)_
- **total_asset**: Total assets in SGD. Use: `total_asset[2024]`. _(coverage: Big caps only)_
- **total_equity**: Total equity in SGD. Use: `total_equity[2024]`. _(coverage: Big caps only)_
- **total_liabilities**: Total liabilities in SGD. Use: `total_liabilities[2024]`. _(coverage: Big caps only)_
- **working_capital**: Working capital in SGD. Use: `working_capital[2024]`. _(coverage: Big caps only)_
- **total_current_asset**: Total current assets in SGD. Use: `total_current_asset[2024]`. _(coverage: Big caps only)_
- **total_non_current_asset**: Total non-current assets in SGD. Use: `total_non_current_asset[2024]`. _(coverage: Big caps only)_
- **net_interest_income**: Net interest income in SGD. Use: `net_interest_income[2024]`. _(coverage: Banks only)_
- **interest_income**: Total interest income in SGD. Use: `interest_income[2024]`. _(coverage: Banks only)_
- **interest_expense**: Total interest expense in SGD. Use: `interest_expense[2024]`. _(coverage: Banks only)_
- **net_fee_and_commission_income**: Net fee and commission income in SGD. Use: `net_fee_and_commission_income[2024]`. _(coverage: Banks only)_
- **net_trading_income**: Net trading income in SGD. Use: `net_trading_income[2024]`. _(coverage: Banks only)_
- **net_loan**: Net loans outstanding in SGD. Use: `net_loan[2024]`. _(coverage: Banks only)_
- **gross_loan**: Gross loans outstanding in SGD. Use: `gross_loan[2024]`. _(coverage: Banks only)_
- **total_deposit**: Total customer deposits in SGD. Use: `total_deposit[2024]`. _(coverage: Banks only)_
- **core_capital_tier1**: Core capital (Tier 1) in SGD. Use: `core_capital_tier1[2024]`. _(coverage: Banks only)_
- **total_risk_weighted_asset**: Total risk-weighted assets in SGD. Use: `total_risk_weighted_asset[2024]`. _(coverage: Banks only)_
</Accordion>

<Accordion title="Quarterly Financial Data">
**How to Use:** Must use bracket notation `field[Qi-YYYY]` to access data for a specific quarter.

<Accordion title="Examples">
- `where=revenue_q[Q1-2024] > 1000000000`
- `where=earnings_q[Q4-2023] > earnings_q[Q3-2023]`
</Accordion>


</Accordion>

<Accordion title="JSON List Fields">
**How to Use:** The query checks if **any** object in the list matches the condition. Use `=` or `like` for strings, numeric operators for numbers.

<Accordion title="Examples">
- `where=major_shareholders_name like 'PT%' and major_shareholders_share_percentage > 0.1`
- `where=key_executives_name = 'Prajogo Pangestu'`
</Accordion>


</Accordion>

</AccordionGroup>
</Accordion>

<Info>Costs 1 API credit for structured queries. Using the natural-language `?q=` parameter costs 3 API credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `where` | query | `string` | No | SQL-like conditions for advanced filtering. Ignored if `q` is present. Supports operators `=`, `!=`, `>`, `>=`, `<`, `<=`, `like`, `in` combined with `and`/`or`. Use bracket notation for yearly fields: `revenue[2024] > 1000000000`. Supports arithmetic on both sides: `earnings[2024] / earnings[2023] > 1.25`. |
| `q` | query | `string` | No | A natural language query (e.g. `top 5 SGX banks by market cap`). When `q` is provided, all other query parameters (`where`, `order_by`, etc.) are ignored as the LLM will generate them. |
| `order_by` | query | `string` | No | Field to sort results by. Use `-` prefix for descending order (e.g. `-market_cap`). Supports arithmetic expressions (e.g. `-(earnings[2024]/earnings[2023])`). Ignored if `q` is present. |
| `desc` | query | `boolean` | No | Sort in descending order. Ignored if `q` is present. |
| `limit` | query | `integer` | No | Maximum number of results to return. Max: 200. Ignored if `q` is present. |
| `offset` | query | `integer` | No | Number of results to skip for pagination. Ignored if `q` is present. |
| `include_query_values` | query | `boolean` | No | If `true`, the response includes a `query_values` object showing the field values used in filtering/sorting. |


---

### 📂 SGX - Helper Lists

#### `GET` `/v2/sgx/sectors/` - List all SGX sectors

Returns all available SGX sector slugs as a flat array.

**Used by:** [SGX Companies](../singapore/sgx-companies), [SGX Top Companies](../singapore/sgx-top-companies)

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/sgx/subsectors/` - SGX Subsectors

Returns all available SGX sector/subsector pairs as kebab-case slugs. Use these values as inputs to `sector` and `sub_sector` parameters.

**Used by:** [SGX Companies](../singapore/sgx-companies)

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/sgx/tags/` - SGX News Tags

Returns the complete list of distinct tag slugs found across all SGX news articles. Use these values with the `tags` parameter of the [SGX News](../singapore/sgx-news) endpoint.

<Info>Costs 1 API credit.</Info>


---

### 📂 SGX - Detailed Reports

#### `GET` `/v2/sgx/company/report/` - Full company report for an SGX-listed symbol

<Note>SGX symbol: 3 characters (letters or digits), optionally followed by `.si` (case-insensitive). E.g. `D05`, `U11`, `Z74`.</Note>

Returns a comprehensive company report organized into distinct sections. Use `sections` to fetch only the data you need and reduce response size.

<Accordion title="Available sections">
- **overview**: Market cap, volume, sector, sub-sector, price changes (1d/7d/1m/1y/3y/ytd), all-time price highs/lows
- **valuation**: PE, PS, PCF, PB ratios
- **financials**: Historical revenue and earnings by year, EPS, margins, ratios
- **dividend**: Dividend yield, growth rate, payout ratio, historical dividends
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 4 sections) consumes 4 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | SGX symbol symbol. E.g. `D05`, `U11`, `Z74`. |
| `sections` | query | `array` | No | Comma-separated sections to include. Options: `overview`, `valuation`, `financials`, `dividend`. Default: all sections. |


---

#### `GET` `/v2/sgx/company/report/{symbol}/` - Full company report for an SGX-listed symbol

<Note>SGX symbol: 3 characters (letters or digits), optionally followed by `.si` (case-insensitive). E.g. `D05`, `U11`, `Z74`.</Note>

Returns a comprehensive company report organized into distinct sections. Use `sections` to fetch only the data you need and reduce response size.

<Accordion title="Available sections">
- **overview**: Market cap, volume, sector, sub-sector, price changes (1d/7d/1m/1y/3y/ytd), all-time price highs/lows
- **valuation**: PE, PS, PCF, PB ratios
- **financials**: Historical revenue and earnings by year, EPS, margins, ratios
- **dividend**: Dividend yield, growth rate, payout ratio, historical dividends
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 4 sections) consumes 4 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | SGX symbol symbol. E.g. `D05`, `U11`, `Z74`. |
| `sections` | query | `array` | No | Comma-separated sections to include. Options: `overview`, `valuation`, `financials`, `dividend`. Default: all sections. |


---

### 📂 SGX - Transaction Data

#### `GET` `/v2/sgx/buybacks/` - SGX Share Buybacks

Returns SGX share buyback records. Each row includes the purchase date, buyback type, price range, total value, total shares purchased, treasury shares after purchase, and mandate details.

<Note>SGX symbol: 3 characters (letters or digits). E.g. `D05`, `U11`, `Z74`.</Note>

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | No | SGX symbol to filter by. E.g. `D05`, `U11`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `purchase_date`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Items per page. Max 30. |
| `offset` | query | `integer` | No | Number of items to skip. |


---

#### `GET` `/v2/sgx/daily/{symbol}/` - SGX Daily Price Data

Returns daily close price and volume for a given SGX-listed company over a date range of up to 90 days.

<Note>SGX symbol: 3 characters (letters or digits). E.g. `D05`, `U11`, `Z74`.</Note>

<Note>Date range: defaults to last 30 days. Max window 90 days; wider ranges are clamped to the most recent 90 days ending at `end`. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | SGX symbol. E.g. `D05`, `U11`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Defaults to 30 days before `end`. Wider ranges are clamped to the most recent 90 days. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Defaults to today. Future dates return 400. |


---

#### `GET` `/v2/sgx/short-sell/` - SGX Short Sell

Returns SGX short sell data. Supports filtering by symbol and date range.

<Note>SGX symbol: 3 characters (letters or digits). E.g. `D05`, `U11`, `Z74`.</Note>

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | No | SGX symbol to filter by. E.g. `D05`, `U11`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `date`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Items per page. Max 30. |
| `offset` | query | `integer` | No | Number of items to skip. |


---

### 📂 SGX - Rankings

#### `GET` `/v2/sgx/companies/top/` - Top SGX companies by classification

Returns top SGX-listed companies ranked by one or more classifications.

<Accordion title="Available classifications">
`dividend_yield`, `revenue`, `earnings`, `market_cap`, `pe`
</Accordion>

<Note>Get valid sector slugs from the [SGX Sectors](../singapore/sgx-sectors) endpoint.</Note>

<Info>Costs 1 API credit per requested classification. Default behavior (all 5 classifications) consumes 5 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sector` | query | `string` | No | Filter by sector slug. E.g. `financial-services`, `technology`. Default: all sectors. |
| `n_stock` | query | `integer` | No | Number of top companies to return per classification. Max 10. Default: 5. |
| `classifications` | query | `array` | No | Comma-separated list of classifications. Options: `dividend_yield`, `revenue`, `earnings`, `market_cap`, `pe`. Default: all. |
| `min_mcap_million` | query | `integer` | No | Minimum market cap in million SGD. Default: 1000. |


---

### 📂 SGX - News & Filings

#### `GET` `/v2/sgx/filings/` - SGX Insider Filings

Returns SGX insider trading filings — buy/sell transactions by company insiders and major shareholders. Supports filtering by symbol, transaction type, holder type, and date range.

<Note>SGX symbol: 3 characters (letters or digits). E.g. `D05`, `U11`, `Z74`.</Note>

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | query | `string` | No | SGX symbol to filter by. E.g. `D05`, `U11`. |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `timestamp`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Number of results to return. Maximum: 30. |
| `offset` | query | `integer` | No | Number of results to skip for pagination. |
| `transaction_type` | query | `string` | No | Filter by transaction type (case-insensitive). |
| `holder_type` | query | `string` | No | Filter by holder type (case-insensitive). |


---

#### `GET` `/v2/sgx/news/` - SGX News

Returns paginated SGX news articles. Supports filtering by sector, sub-sector, tags, symbols, and date range.

<Note>SGX symbol: 3 characters (letters or digits). E.g. `D05`, `U11`, `Z74`.</Note>

<Note>Date filters: both `start` and `end` are independent and optional — omit either side to leave that bound unconstrained. Future `end` dates return 400.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sector` | query | `string` | No | Filter by sector (case-insensitive). |
| `sub_sector` | query | `string` | No | Filter by sub-sector (case-insensitive). |
| `start` | query | `string` | No | Start date in `YYYY-MM-DD` format. Optional; if omitted, no lower bound is applied. Filters on `timestamp`. |
| `end` | query | `string` | No | End date in `YYYY-MM-DD` format. Optional; if omitted, no upper bound is applied. Future dates return 400. |
| `limit` | query | `integer` | No | Items per page. Max 30. |
| `offset` | query | `integer` | No | Number of items to skip. |
| `tags` | query | `string` | No | Comma-separated tag slugs. Get values from [SGX Tags](../singapore/sgx-tags). |
| `symbols` | query | `string` | No | Comma-separated SGX symbols. E.g. `D05,U11`. |


---

## 🏛️ Malaysia (KLSE)

### 📂 KLSE

#### `GET` `/v2/klse/companies/` - List KLSE companies filtered by sector

Returns all KLSE-listed companies in a given sector as `symbol` + `company_name` pairs.

<Note>Get valid sector slugs from the [KLSE Sectors](../malaysia/klse-sectors) endpoint. Format: **kebab-case** (lowercase, hyphen-separated). E.g. `financials`, `healthcare`, `consumer-cyclicals`.</Note>

**Used by:** [KLSE Company Report](../malaysia/klse-report)

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sector` | query | `string` | ✅ Yes | Kebab-case sector slug. E.g. `financials`, `healthcare`. Get valid values from the [KLSE Sectors](../malaysia/klse-sectors) endpoint. |


---

#### `GET` `/v2/klse/companies/top/` - Top KLSE companies by classification

Returns top KLSE-listed companies ranked by one or more classifications.

<Accordion title="Available classifications">
`dividend_yield`, `revenue`, `earnings`, `market_cap`, `pe`
</Accordion>

<Note>Get valid sector slugs from the [KLSE Sectors](../malaysia/klse-sectors) endpoint.</Note>

<Info>Costs 1 API credit per requested classification. Default behavior (all 5 classifications) consumes 5 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `sector` | query | `string` | No | Filter by sector slug. E.g. `financials`, `healthcare`. Default: all sectors. |
| `n_stock` | query | `integer` | No | Number of top companies to return per classification. Max 10. Default: 5. |
| `classifications` | query | `array` | No | Comma-separated list of classifications. Options: `dividend_yield`, `revenue`, `earnings`, `market_cap`, `pe`. Default: all. |
| `min_mcap_million` | query | `integer` | No | Minimum market cap in million MYR. Default: 1000. |


---

#### `GET` `/v2/klse/company/report/` - Full company report for a KLSE-listed symbol

<Note>KLSE symbol: 4-digit numeric code. E.g. `1155`, `4197`, `5225`.</Note>

Returns a comprehensive company report organized into distinct sections. Use `sections` to fetch only the data you need and reduce response size.

<Accordion title="Available sections">
- **overview**: Market cap, volume, sector, sub-sector, price changes (1d/7d)
- **valuation**: PE, PB, PS, PCF ratios (TTM and historical)
- **financials**: Historical revenue and earnings by year, EPS, margins, ratios
- **dividend**: Dividend history and yield
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 4 sections) consumes 4 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | KLSE symbol symbol (4-digit numeric code). E.g. `1155`, `4197`. |
| `sections` | query | `array` | No | Comma-separated sections to include. Options: `overview`, `valuation`, `financials`, `dividend`. Default: all sections. |


---

#### `GET` `/v2/klse/company/report/{symbol}/` - Full company report for a KLSE-listed symbol

<Note>KLSE symbol: 4-digit numeric code. E.g. `1155`, `4197`, `5225`.</Note>

Returns a comprehensive company report organized into distinct sections. Use `sections` to fetch only the data you need and reduce response size.

<Accordion title="Available sections">
- **overview**: Market cap, volume, sector, sub-sector, price changes (1d/7d)
- **valuation**: PE, PB, PS, PCF ratios (TTM and historical)
- **financials**: Historical revenue and earnings by year, EPS, margins, ratios
- **dividend**: Dividend history and yield
</Accordion>

<Info>Costs 1 API credit per requested section. Default behavior (all 4 sections) consumes 4 credits.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `symbol` | path | `string` | ✅ Yes | KLSE symbol symbol (4-digit numeric code). E.g. `1155`, `4197`. |
| `sections` | query | `array` | No | Comma-separated sections to include. Options: `overview`, `valuation`, `financials`, `dividend`. Default: all sections. |


---

#### `GET` `/v2/klse/sectors/` - List all KLSE sectors

Returns all available KLSE sector slugs as a flat array.

**Used by:** [KLSE Companies](../malaysia/klse-companies), [KLSE Top Companies](../malaysia/klse-top-companies)

<Info>Costs 1 API credit.</Info>


---

## 🏛️ Mining (Extension)

### 📂 Companies

#### `GET` `/v2/mining/companies/` - List Mining Companies

Searches for Indonesian mining companies by name, symbol, slug, or key operation. Supports filtering by commodity type and company type.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `commodity_type` | query | `string` | No | Filter by commodity. E.g. `Coal`, `Nickel`, `Gold`. |
| `limit` | query | `integer` | No | Results per page. Default 20. |
| `offset` | query | `integer` | No | Items to skip for pagination. |
| `keyword` | query | `string` | No | Search across company name, IDX symbol, slug, and key operations (case-insensitive). |
| `company_type` | query | `string` | No | Filter by company type. |
| `has_financials` | query | `boolean` | No | If `true`, return only companies with financial data available. |


---

#### `GET` `/v2/mining/companies/{slug}/` - Mining Company Detail

Returns comprehensive operational details for a single mining company including activities, commodity types, licenses, contracts, and site count.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `slug` | path | `string` | ✅ Yes | Company slug. Get valid slugs from the [Mining Companies List](./mining-companies) endpoint. |


---

#### `GET` `/v2/mining/companies/financials/{slug}/` - Mining Company Financials

Returns annual financial records (assets, revenue, profit with breakdowns) for a mining company. All monetary values are in USD millions. Defaults to the latest available year.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `slug` | path | `string` | ✅ Yes | Company slug. |
| `year` | query | `integer` | No | Year to retrieve. Defaults to the latest available year. |


---

#### `GET` `/v2/mining/companies/ownership/{slug}/` - Mining Company Ownership

Returns the corporate ownership tree for a mining company — showing parent companies (who owns it) and subsidiaries (what it owns) with percentage stakes.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `slug` | path | `string` | ✅ Yes | Company slug. |


---

#### `GET` `/v2/mining/companies/performance/{slug}/` - Mining Company Performance

Returns production volume, sales volume, strip ratio, and resources/reserves data for a mining company for a given year. Defaults to the latest available year.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `slug` | path | `string` | ✅ Yes | Company slug. |
| `commodity_type` | query | `string` | No | Filter by commodity. E.g. `Coal`, `Nickel`. Case-insensitive. |
| `year` | query | `integer` | No | Year to retrieve. Defaults to the latest available year. |


---

### 📂 Commodities & Trade

#### `GET` `/v2/mining/commodities/` - List Commodities

Lists all commodities available in the price database with coverage metadata. Use this as a discovery endpoint before querying [Commodity Price History](../commodities-trade/commodity-price) endpoint.

<Note>
Most commodities only have data in the price table. Cross-table data (production, exports, reserves, sites) is limited to: **Coal**, **Gold**, **Nickel**, **Copper** — and partially Silver, Cobalt, Bauxite.
</Note>

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/mining/commodities/{commodity_name}/price/` - Commodity Price History

Retrieves historical price data for a commodity by year range. Data is monthly (bi-weekly for recent Coal entries). Maximum range: 3 years.

<Note>Use [List Commodities](../commodities-trade/commodities) to discover all available commodity names.</Note>

<Warning>Requesting more than 3 years will return a 400 error.</Warning>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `commodity_name` | path | `string` | ✅ Yes | The commodity name (e.g., `Gold`, `Coal`). Get valid names from the [List Commodities](../commodities-trade/commodities) endpoint. |
| `start_year` | query | `integer` | No | Start year (e.g., `2022`). Defaults to current year − 2. |
| `end_year` | query | `integer` | No | End year inclusive (e.g., `2024`). Defaults to current year. Maximum 3-year range from `start_year`. |


---

#### `GET` `/v2/mining/exports/` - Top Export Destinations

Ranks countries by total export value for a given year and commodity, showing the top destinations for Indonesian commodity exports.

<Note>Available `commodity_type` values: `Gold`, `Copper`, `Coal`.</Note>

`export_usd` is in base USD. Volume unit is specified per row in `volume_unit` (typically `Mt`). Two volume sources are provided: **BPS** (Badan Pusat Statistik) and **ESDM** (Energi Sumber Daya Mineral) — values may differ due to methodology.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `commodity_type` | query | `string` | ✅ Yes | The commodity to analyze (e.g., `Gold`, `Coal`). |
| `year` | query | `integer` | ✅ Yes | The year to analyze export data for (e.g., `2024`). |
| `limit` | query | `integer` | No | Number of top countries to return. Maximum: 30. |


---

#### `GET` `/v2/mining/global-commodity/` - Global Commodity Data

Retrieves global commodity data including production, reserves, and trade information. At least one of `commodity_type` or `country` must be provided.

<Note>Available `commodity_type` values: `Coal`, `Gold`, `Nickel`, `Copper`, `Bauxite`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `commodity_type` | query | `string` | No | Filter by commodity type. Required if `country` not provided. |
| `country` | query | `string` | No | Filter by country (exact match, e.g., `Australia`). Required if `commodity_type` not provided. |
| `limit` | query | `integer` | No | Number of results to return. Maximum: 30. |


---

#### `GET` `/v2/mining/sales-destination/{slug}/` - Company Sales Destinations

Retrieves sales destination breakdown for a specific mining company by its slug, showing revenue and volume distribution by country for a specific year. Defaults to the latest available year if none is specified.

`revenue_usd` is in base USD. Volume unit is specified per country entry in `unit` (e.g., `Mt`).

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `slug` | path | `string` | ✅ Yes | The company's unique identifier slug (e.g., `adaro-energy`). |
| `year` | query | `integer` | No | The year to retrieve. Defaults to the latest available year. |


---

### 📂 Production & Sites

#### `GET` `/v2/mining/resources-reserves/` - Resources & Reserves Index

Discovery index showing which provinces, years, and commodities have resources and reserves data available. Use this before querying the detail endpoint to confirm data availability.

<Note>This index endpoint does not accept any query parameters.</Note>

Use [Resources & Reserves Detail](../sites-production/commodity-resources-reserves-detail) to retrieve actual values.

<Info>Costs 1 API credit.</Info>


---

#### `GET` `/v2/mining/resources-reserves/{province}/` - Resources & Reserves Detail

Returns resources and reserves data for a single province, nested by year then by commodity. Each commodity entry contains the full breakdown: `exploration_target`, `total_inventory`, `resources`, `reserves`, and `unit`.

<Note>Available `commodity_type` values: `Coal`, `Gold`, `Silver`, `Copper`, `Nickel`, `Cobalt`, `Tin`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `province` | path | `string` | ✅ Yes | Exact province name (e.g., `Kalimantan Timur`). Case-insensitive. |
| `commodity_type` | query | `string` | No | Restrict results to a specific commodity. |
| `year` | query | `integer` | No | Restrict results to a specific year. |


---

#### `GET` `/v2/mining/sites/` - Mining Sites

Lists mining sites with advanced filtering for location, commodity type, and production volume, plus sorting capabilities and detailed site information.

<Note>Available `commodity_type` values: `Coal`, `Gold`, `Nickel`, `Copper`.</Note>

Prefix `order_by` with `-` for descending order (e.g. `-production_volume`).

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `province` | query | `string` | No | Filter by exact province name (e.g., `Kalimantan Timur`). |
| `commodity_type` | query | `string` | No | Filter by commodity type. Case-insensitive. |
| `company` | query | `string` | No | Filter by company slug. |
| `year` | query | `integer` | No | Filter by reporting year. |
| `order_by` | query | `string` | No | Sort field. Prefix with `-` for descending. Default: `-year`. |
| `min_production` | query | `number` | No | Filter for sites with `production_volume` ≥ this value. |
| `limit` | query | `integer` | No | Number of results to return. Maximum: 30. |
| `offset` | query | `integer` | No | Number of results to skip. |


---

#### `GET` `/v2/mining/sites/{slug}/` - Mining Site Detail

Returns full details for a single mining site by its slug, including parsed resources/reserves and location (with latitude and longitude).

Use [Mining Sites](../sites-production/mining-sites) to discover site slugs.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `slug` | path | `string` | ✅ Yes | URL-friendly identifier for the mining site. |


---

#### `GET` `/v2/mining/total-production/` - Total Commodity Production

Returns total national production for a commodity across all years, including year-over-year percentage change. Results are ordered by year descending.

<Note>Available `commodity_type` values: `Coal`, `Nickel`, `Gold`, `Copper`.</Note>

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `commodity_type` | query | `string` | ✅ Yes | The commodity to analyze (e.g., `Coal`). Required. |


---

### 📂 Contracts & Licenses

#### `GET` `/v2/mining/contracts/` - Mining Contracts

Returns active mining contracts linking mine owners to their service contractors. Optionally filter by owner or contractor slug.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `contractor` | query | `string` | No | Filter by contractor company slug. |
| `mine_owner` | query | `string` | No | Filter by mine owner company slug. |


---

#### `GET` `/v2/mining/license-auctions/` - Mining License Auctions

Lists mining license auctions scraped from the ESDM Minerba portal. Phases and participants are omitted from list results — use the detail endpoint for the full auction record.

<Note>Available `commodity_type` values: `Nickel`, `Coal`, `Gold`, `Copper`.</Note>

Use `participant` + `qualified=true` to find auctions where a specific company passed pre-qualification.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `province` | query | `string` | No | Filter by province (e.g., `Sulawesi Selatan`). Case-insensitive. |
| `commodity_type` | query | `string` | No | Filter by commodity (e.g., `Nickel`, `Coal`). Case-insensitive. |
| `order_by` | query | `string` | No | Sort field. Prefix with `-` for descending. Default: `-winner_date`. |
| `limit` | query | `integer` | No | Number of results to return. Maximum: 30. |
| `offset` | query | `integer` | No | Number of results to skip. |
| `area_type` | query | `string` | No | Filter by area type (e.g., `WIUPK`). Case-insensitive. |
| `status` | query | `string` | No | Filter by auction status (e.g., `Lelang Selesai`). Case-insensitive. |
| `participant` | query | `string` | No | Filter auctions where a company name (partial match) participated. |
| `qualified` | query | `boolean` | No | When `true`, only return auctions where the `participant` passed qualification. Requires `participant`. |
| `min_participants` | query | `integer` | No | Only return auctions with at least this many participants. |


---

#### `GET` `/v2/mining/license-auctions/{wiup_code}/` - Mining License Auction Detail

Retrieves the full record for a single mining license auction by its WIUP code, including the parsed phases timeline and participant qualification list.

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `wiup_code` | path | `string` | ✅ Yes | The unique WIUP code identifier for the auction. |


---

#### `GET` `/v2/mining/licenses/` - Mining Licenses

Lists mining licenses (IUP/IUPK) from the ESDM Minerba portal with filters for status, commodity, location, and expiry date.

<Note>Top `commodity_type` values: `Coal`, `Nickel`, `Non-Metallic Mineral`, `Sand/Stone/Gravel`, `Limestone`, `Gold`, `Tin`, `Iron`, `Bauxite`, `Clay`, `Copper`.</Note>

Prefix `order_by` with `-` for descending order. Default sort: `license_expiry_date` (soonest expiring first).

<Info>Costs 1 API credit.</Info>

**Parameters:**

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `province` | query | `string` | No | Filter by province. Exact match. |
| `commodity_type` | query | `string` | No | Filter by commodity. Case-insensitive. |
| `company` | query | `string` | No | Filter by company slug. |
| `order_by` | query | `string` | No | Sort field. Prefix with `-` for descending. Default: `license_expiry_date`. |
| `limit` | query | `integer` | No | Number of results to return. Maximum: 30. |
| `offset` | query | `integer` | No | Number of results to skip. |
| `expiring_soon` | query | `boolean` | No | Set to `true` to find licenses expiring within the next 365 days. |
| `license_type` | query | `string` | No | Filter by license type (e.g., `IUP`, `IUPK`). Case-insensitive. |
| `activity` | query | `string` | No | Filter by activity stage (e.g., `Eksplorasi`, `Operasi Produksi`). Case-insensitive. |
| `cnc` | query | `boolean` | No | Filter by Clear & Clean status. Case-insensitive. |


---
