import math
from typing import List, Dict, Any, Optional

class FinancialEngine:
    """
    Deterministic Financial Intelligence Engine.
    Computes rigorous, fact-grounded quantitative metrics directly from historical data:
    1. Piotroski F-Score (0 to 9 accounting health rating)
    2. Historical P/E Standard Deviation Band (Mean, +/- 1SD valuation positioning)
    3. Benjamin Graham Number valuation anchor
    """

    @staticmethod
    def compute_piotroski_f_score(historical_financials: Optional[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Calculates the Piotroski F-Score (0-9) based on annual historical financials.
        Piotroski F-Score assesses:
        - Profitability (4 points): Positive ROA, Positive CFO, Delta ROA > 0, CFO > Net Income (Quality of Earnings)
        - Leverage & Liquidity (3 points): Lower Debt/Equity, Higher/Stable Solvency, No Share Dilution
        - Operating Efficiency (2 points): Delta Margin > 0, Delta Asset Turnover > 0
        """
        default_result = {
            "score": None,
            "max_score": 9,
            "rating": "N/A",
            "signals": [],
            "criteria_met": [],
            "criteria_failed": []
        }

        if not historical_financials or not isinstance(historical_financials, list) or len(historical_financials) == 0:
            return default_result

        # Sort financials chronologically by year if available
        sorted_fin = sorted(
            [f for f in historical_financials if isinstance(f, dict)],
            key=lambda x: x.get("year") or 0
        )

        if not sorted_fin:
            return default_result

        curr = sorted_fin[-1]
        prev = sorted_fin[-2] if len(sorted_fin) >= 2 else None

        score = 0
        criteria_met = []
        criteria_failed = []

        # Current period metrics
        net_income_curr = curr.get("earnings") if curr.get("earnings") is not None else curr.get("net_income")
        cfo_curr = curr.get("operating_cash_flow") or curr.get("cash_inflow")
        assets_curr = curr.get("total_assets")
        revenue_curr = curr.get("revenue")
        equity_curr = curr.get("total_equity")
        debt_curr = curr.get("total_debt") if curr.get("total_debt") is not None else curr.get("total_liabilities")
        shares_curr = curr.get("outstanding_shares")

        # --- A. PROFITABILITY (4 Points) ---
        # 1. Positive Net Income / ROA
        if net_income_curr is not None and net_income_curr > 0:
            score += 1
            criteria_met.append("Laba bersih positif (Positive ROA)")
        else:
            criteria_failed.append("Laba bersih negatif atau nol")

        # 2. Positive Operating Cash Flow (CFO)
        if cfo_curr is not None and cfo_curr > 0:
            score += 1
            criteria_met.append("Arus kas operasi positif (Positive CFO)")
        elif cfo_curr is not None:
            criteria_failed.append("Arus kas operasi negatif")
        else:
            # Fallback if CFO is missing: check net income
            if net_income_curr is not None and net_income_curr > 0:
                score += 1
                criteria_met.append("Laba operasional terkonfirmasi positif")

        # 3. Delta ROA > 0 (YoY Growth in ROA)
        if prev and assets_curr and assets_curr > 0:
            assets_prev = prev.get("total_assets")
            net_income_prev = prev.get("earnings") if prev.get("earnings") is not None else prev.get("net_income")
            if assets_prev and assets_prev > 0 and net_income_curr is not None and net_income_prev is not None:
                roa_curr = net_income_curr / assets_curr
                roa_prev = net_income_prev / assets_prev
                if roa_curr > roa_prev:
                    score += 1
                    criteria_met.append("ROA bertumbuh secara tahunan (YoY ROA Growth)")
                else:
                    criteria_failed.append("ROA menurun dibandingkan tahun sebelumnya")
        elif net_income_curr is not None and net_income_curr > 0:
            # Single-year baseline
            score += 1
            criteria_met.append("ROA berada di area positif")

        # 4. Accrual / Earnings Quality (CFO > Net Income)
        if cfo_curr is not None and net_income_curr is not None:
            if cfo_curr > net_income_curr:
                score += 1
                criteria_met.append("Kualitas laba prima (Cash Flow dari Operasi > Net Income)")
            else:
                criteria_failed.append("Cash Flow dari Operasi lebih kecil dari Laba Bersih")
        else:
            # Default point if CFO is healthy
            if cfo_curr is not None and cfo_curr > 0:
                score += 1
                criteria_met.append("Likuiditas kas operasional terbukti sehat")

        # --- B. LEVERAGE, LIQUIDITY & SOURCE OF FUNDS (3 Points) ---
        # 5. Lower Leverage YoY (Debt-to-Equity Ratio decreased or zero debt)
        if prev and equity_curr and equity_curr > 0:
            equity_prev = prev.get("total_equity")
            debt_prev = prev.get("total_debt") if prev.get("total_debt") is not None else prev.get("total_liabilities")
            if equity_prev and equity_prev > 0 and debt_curr is not None and debt_prev is not None:
                der_curr = debt_curr / equity_curr
                der_prev = debt_prev / equity_prev
                if der_curr <= der_prev:
                    score += 1
                    criteria_met.append("Rasio leverage utang menurun atau terkendali YoY")
                else:
                    criteria_failed.append("Rasio utang terhadap ekuitas (DER) meningkat")
            elif debt_curr is not None and debt_curr <= equity_curr:
                score += 1
                criteria_met.append("Struktur modal sehat (DER <= 1.0x)")
        elif debt_curr is not None and equity_curr and equity_curr > 0:
            if debt_curr <= equity_curr:
                score += 1
                criteria_met.append("Struktur permodalan konservatif (DER <= 1.0x)")
            else:
                criteria_failed.append("Leverage utang melebihi total ekuitas")

        # 6. Solvency / Asset Coverage
        if assets_curr and debt_curr is not None and assets_curr > debt_curr:
            score += 1
            criteria_met.append("Solvabilitas terjaga (Total Aset melampaui Total Liabilitas)")
        elif assets_curr:
            score += 1
            criteria_met.append("Solvabilitas aset terkonfirmasi positif")

        # 7. No Share Dilution (Shares outstanding did not increase YoY)
        if prev and shares_curr:
            shares_prev = prev.get("outstanding_shares")
            if shares_prev:
                if shares_curr <= shares_prev:
                    score += 1
                    criteria_met.append("Tidak ada dilusi saham (No Share Dilution)")
                else:
                    criteria_failed.append("Terjadi penambahan lembar saham beredar (Dilusi)")
            else:
                score += 1
                criteria_met.append("Struktur kepemilikan saham stabil")
        else:
            score += 1
            criteria_met.append("Struktur lembar saham beredar stabil")

        # --- C. OPERATING EFFICIENCY (2 Points) ---
        # 8. Higher Profit Margin YoY
        if prev and revenue_curr and revenue_curr > 0 and net_income_curr is not None:
            rev_prev = prev.get("revenue")
            net_prev = prev.get("earnings") if prev.get("earnings") is not None else prev.get("net_income")
            if rev_prev and rev_prev > 0 and net_prev is not None:
                margin_curr = net_income_curr / revenue_curr
                margin_prev = net_prev / rev_prev
                if margin_curr > margin_prev:
                    score += 1
                    criteria_met.append("Margin profitabilitas ekspansi YoY")
                else:
                    criteria_failed.append("Margin profitabilitas tertekan dibanding tahun lalu")
            elif margin_curr > 0.05:
                score += 1
                criteria_met.append("Margin laba bersih sehat (> 5%)")
        elif revenue_curr and revenue_curr > 0 and net_income_curr is not None and (net_income_curr / revenue_curr) > 0:
            score += 1
            criteria_met.append("Margin profitabilitas berada di level positif")

        # 9. Higher Asset Turnover YoY (Efficiency in using assets)
        if prev and assets_curr and assets_curr > 0 and revenue_curr and revenue_curr > 0:
            assets_prev = prev.get("total_assets")
            rev_prev = prev.get("revenue")
            if assets_prev and assets_prev > 0 and rev_prev and rev_prev > 0:
                turnover_curr = revenue_curr / assets_curr
                turnover_prev = rev_prev / assets_prev
                if turnover_curr >= turnover_prev:
                    score += 1
                    criteria_met.append("Efisiensi perputaran aset meningkat YoY (Asset Turnover)")
                else:
                    criteria_failed.append("Perputaran aset (Asset Turnover) menurun")
            else:
                score += 1
                criteria_met.append("Rasio utilisasi aset stabil")
        else:
            score += 1
            criteria_met.append("Utilisasi aset produktif")

        # Normalize score between 0 and 9
        score = max(0, min(9, score))

        # Categorize Rating
        if score >= 8:
            rating = "PRIMA" # Very Healthy
        elif score >= 5:
            rating = "MODERAT" # Stable
        else:
            rating = "RENTAN" # Weak / Distress Risk

        return {
            "score": score,
            "max_score": 9,
            "rating": rating,
            "criteria_met": criteria_met,
            "criteria_failed": criteria_failed
        }

    @staticmethod
    def compute_pe_historical_band(
        historical_valuation: Optional[List[Dict[str, Any]]], 
        current_pe: Optional[float]
    ) -> Dict[str, Any]:
        """
        Calculates Historical P/E Standard Deviation Band:
        - Mean P/E across multi-year history
        - Standard Deviation (+/- 1SD and +/- 2SD)
        - Valuation status: UNDERVALUED (<= -0.5SD), FAIR_VALUE (-0.5SD to +0.5SD), OVERVALUED (>= +0.5SD)
        - Discount / Premium percentage compared to historical mean
        """
        default_result = {
            "current_pe": round(current_pe, 2) if isinstance(current_pe, (int, float)) else None,
            "mean_pe": None,
            "std_dev": None,
            "plus_1sd": None,
            "minus_1sd": None,
            "status": "NEUTRAL",
            "discount_pct": None,
            "years_analyzed": 0,
            "historical_pes": []
        }

        if not historical_valuation or not isinstance(historical_valuation, list):
            return default_result

        # Extract valid historical positive PE ratios
        valid_pes = []
        for v in historical_valuation:
            if isinstance(v, dict):
                pe_val = v.get("pe")
                if isinstance(pe_val, (int, float)) and 0 < pe_val < 300: # Exclude extreme outliers
                    valid_pes.append(round(float(pe_val), 2))

        if not valid_pes:
            return default_result

        n = len(valid_pes)
        mean_pe = sum(valid_pes) / n
        
        # Calculate sample standard deviation
        if n >= 2:
            variance = sum((x - mean_pe) ** 2 for x in valid_pes) / (n - 1)
            std_dev = math.sqrt(variance)
        else:
            std_dev = mean_pe * 0.15 # Default 15% dispersion if only 1 sample

        effective_curr_pe = current_pe if isinstance(current_pe, (int, float)) and current_pe > 0 else valid_pes[-1]

        plus_1sd = mean_pe + std_dev
        minus_1sd = max(0.1, mean_pe - std_dev)

        # Determine valuation positioning relative to standard deviation band
        if effective_curr_pe <= (mean_pe - (0.5 * std_dev)):
            status = "UNDERVALUED"
        elif effective_curr_pe >= (mean_pe + (0.5 * std_dev)):
            status = "OVERVALUED"
        else:
            status = "FAIR_VALUE"

        discount_pct = round(((effective_curr_pe - mean_pe) / mean_pe) * 100, 1) if mean_pe > 0 else 0.0

        return {
            "current_pe": round(effective_curr_pe, 2),
            "mean_pe": round(mean_pe, 2),
            "std_dev": round(std_dev, 2),
            "plus_1sd": round(plus_1sd, 2),
            "minus_1sd": round(minus_1sd, 2),
            "status": status,
            "discount_pct": discount_pct,
            "years_analyzed": n,
            "historical_pes": valid_pes
        }

    @staticmethod
    def compute_graham_number(eps: Optional[float], bvps: Optional[float]) -> Optional[float]:
        """
        Calculates Benjamin Graham Fair Value Number: sqrt(22.5 * EPS * BVPS).
        Only valid when both EPS and BVPS are positive.
        """
        if eps and bvps and eps > 0 and bvps > 0:
            try:
                return round(math.sqrt(22.5 * eps * bvps), 2)
            except Exception:
                return None
        return None

financial_engine = FinancialEngine()
