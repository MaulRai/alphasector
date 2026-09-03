from typing import List, Dict, Any, Optional

class QuantitativeComparator:
    """Performs deterministic financial ratio & peer comparison calculations."""

    @staticmethod
    def build_peer_matrix(reports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Builds a structured side-by-side comparison matrix from company reports."""
        matrix = []
        for rep in reports:
            if not rep or not isinstance(rep, dict):
                continue

            symbol = rep.get("symbol", "").replace(".JK", "")
            name = rep.get("company_name", symbol)
            overview = rep.get("overview", {}) or {}
            valuation = rep.get("valuation", {}) or {}
            financials = rep.get("financials", {}) or {}

            # Extract valuation multiples (check historical_valuation latest item first)
            hist_val = valuation.get("historical_valuation", []) or []
            latest_val = hist_val[-1] if hist_val and isinstance(hist_val, list) else {}

            pe = latest_val.get("pe") or valuation.get("pe") or valuation.get("forward_pe")
            pbv = latest_val.get("pb") or valuation.get("pbv") or valuation.get("pb")
            pe_peer_avg = latest_val.get("pe_peer_avg")
            pb_peer_avg = latest_val.get("pb_peer_avg")

            # Extract financials (check historical_financials latest item)
            hist_fin = financials.get("historical_financials", []) if isinstance(financials, dict) else []
            if not hist_fin and isinstance(financials, list):
                hist_fin = financials
            latest_fin = hist_fin[-1] if hist_fin and isinstance(hist_fin, list) else (financials if isinstance(financials, dict) else {})

            revenue = latest_fin.get("revenue") if isinstance(latest_fin, dict) else None
            net_income = (latest_fin.get("earnings") or latest_fin.get("net_income")) if isinstance(latest_fin, dict) else None
            total_equity = latest_fin.get("total_equity") if isinstance(latest_fin, dict) else None
            total_debt = latest_fin.get("total_debt") if latest_fin.get("total_debt") is not None else latest_fin.get("total_liabilities")

            # Calculate derived ratios if not explicitly present
            roe = None
            if net_income and total_equity and total_equity > 0:
                roe = round((net_income / total_equity) * 100, 2)

            npm = None
            if net_income and revenue and revenue > 0:
                npm = round((net_income / revenue) * 100, 2)

            der = None
            if total_debt and total_equity and total_equity > 0:
                der = round(total_debt / total_equity, 2)

            # Check tags for dividend clues
            tags = overview.get("tags", []) or []
            has_high_div = any("dividend" in t for t in tags)

            matrix.append({
                "symbol": symbol,
                "company_name": name,
                "sector": overview.get("sector", "-"),
                "sub_sector": overview.get("sub_sector", "-"),
                "last_close_price": overview.get("last_close_price") or valuation.get("last_close_price"),
                "market_cap": overview.get("market_cap"),
                "pe": round(pe, 2) if isinstance(pe, (int, float)) else None,
                "pbv": round(pbv, 2) if isinstance(pbv, (int, float)) else None,
                "pe_peer_avg": round(pe_peer_avg, 2) if isinstance(pe_peer_avg, (int, float)) else None,
                "pb_peer_avg": round(pb_peer_avg, 2) if isinstance(pb_peer_avg, (int, float)) else None,
                "roe": roe,
                "npm": npm,
                "der": der,
                "revenue": revenue,
                "net_income": net_income,
                "has_high_dividend_tag": has_high_div,
                "tags": tags[:5]
            })

        # Calculate best in class badges
        if len(matrix) >= 2:
            # Lowest PE (Valuation winner among positive PEs)
            valid_pes = [x for x in matrix if x["pe"] and x["pe"] > 0]
            if valid_pes:
                min_pe_symbol = min(valid_pes, key=lambda x: x["pe"])["symbol"]
                for x in matrix:
                    x["is_lowest_pe"] = (x["symbol"] == min_pe_symbol)

            # Highest ROE (Profitability winner)
            valid_roes = [x for x in matrix if x["roe"] is not None]
            if valid_roes:
                max_roe_symbol = max(valid_roes, key=lambda x: x["roe"])["symbol"]
                for x in matrix:
                    x["is_highest_roe"] = (x["symbol"] == max_roe_symbol)

            # Lowest PBV
            valid_pbvs = [x for x in matrix if x["pbv"] is not None and x["pbv"] > 0]
            if valid_pbvs:
                min_pbv_symbol = min(valid_pbvs, key=lambda x: x["pbv"])["symbol"]
                for x in matrix:
                    x["is_lowest_pbv"] = (x["symbol"] == min_pbv_symbol)

        return matrix

    @staticmethod
    def analyze_broker_sentiment(broker_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Evaluates accumulation vs distribution ratio from broker summary."""
        if not broker_data:
            return {"sentiment": "NEUTRAL", "top_buyers": [], "top_sellers": []}

        top_buyers = broker_data.get("top_buyers", []) or []
        top_sellers = broker_data.get("top_sellers", []) or []

        total_buy_val = sum(b.get("net_buy_value", 0) or b.get("buy_val", 0) or b.get("net_val", 0) for b in top_buyers[:3])
        total_sell_val = abs(sum(s.get("net_sell_value", 0) or s.get("sell_val", 0) or s.get("net_val", 0) for s in top_sellers[:3]))

        if total_buy_val > total_sell_val * 1.25:
            sentiment = "STRONG_ACCUMULATION"
        elif total_buy_val > total_sell_val * 1.05:
            sentiment = "MODERATE_ACCUMULATION"
        elif total_sell_val > total_buy_val * 1.25:
            sentiment = "STRONG_DISTRIBUTION"
        elif total_sell_val > total_buy_val * 1.05:
            sentiment = "MODERATE_DISTRIBUTION"
        else:
            sentiment = "NEUTRAL"

        return {
            "sentiment": sentiment,
            "top_buyers": top_buyers[:5],
            "top_sellers": top_sellers[:5],
            "buyer_concentration": round(total_buy_val / (total_buy_val + total_sell_val + 1e-9) * 100, 1)
        }

comparator = QuantitativeComparator()
