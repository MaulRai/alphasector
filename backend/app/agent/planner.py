import re
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.agent import AgentIntent, ExecutionPhase, ReasoningStep

# Known Indonesian stock ticker pattern (4 uppercase letters, e.g. BBCA, BBRI, TLKM, ASII, ADRO)
TICKER_REGEX = re.compile(r'\b([A-Z]{4})(?:\.JK)?\b', re.IGNORECASE)

# Keywords to detect intent
PEER_KEYWORDS = ["banding", "bandingkan", "komparasi", "vs", "versus", "compare", "mana yang lebih", "better than", "antara"]
BROKER_KEYWORDS = ["broker", "bandar", "bandarmology", "smart money", "akumulasi", "distribusi", "foreign", "asing", "inflow", "outflow"]
SCREENER_KEYWORDS = ["screen", "cari", "filter", "saham apa", "rekomendasi", "top", "terbaik", "paling tinggi", "tertinggi", "dividend yield", "dividen"]
COMMODITY_KEYWORDS = ["nikel", "nickel", "emas", "gold", "batubara", "coal", "tembaga", "copper", "timah", "tin", "komoditas", "commodity", "tambang"]

def parse_tickers_from_query(query: str, context_ticker: Optional[str] = None) -> List[str]:
    """Extract distinct IDX stock tickers mentioned in user query."""
    matches = TICKER_REGEX.findall(query)
    tickers = []
    
    # Exclude common Indonesian words that happen to be 4 letters in uppercase
    stopwords = {"DARI", "YANG", "PADA", "BISA", "KITA", "ATAU", "IKUT", "MAKA", "AKAN", "SAAT", "JUGA", "KAMI", "ADAK", "POST", "JSON", "HTTP", "REST"}
    
    for m in matches:
        ticker = m.upper()
        if ticker not in stopwords and ticker not in tickers:
            tickers.append(ticker)
            
    if context_ticker:
        clean_ctx = context_ticker.upper().replace(".JK", "")
        if clean_ctx not in tickers:
            tickers.insert(0, clean_ctx)
            
    return tickers

class AgentPlanner:
    """Plans multi-step execution DAG based on query intent & parameters."""
    
    @staticmethod
    def plan(query: str, context_ticker: Optional[str] = None) -> Tuple[AgentIntent, List[str], List[Dict[str, Any]]]:
        query_lower = query.lower()
        tickers = parse_tickers_from_query(query, context_ticker)
        
        # 1. Determine Intent
        intent = AgentIntent.GENERAL_FINANCIAL_QUERY
        
        if len(tickers) >= 2 or any(k in query_lower for k in PEER_KEYWORDS):
            intent = AgentIntent.PEER_BATTLE_COMPARISON
        elif any(k in query_lower for k in BROKER_KEYWORDS):
            intent = AgentIntent.SMART_MONEY_RADAR
        elif any(k in query_lower for k in COMMODITY_KEYWORDS) and len(tickers) <= 1:
            intent = AgentIntent.COMMODITY_MACRO_IMPACT
        elif len(tickers) == 1:
            intent = AgentIntent.SINGLE_TICKER_DEEP_DIVE
        elif any(k in query_lower for k in SCREENER_KEYWORDS) or len(tickers) == 0:
            intent = AgentIntent.MARKET_SCREENING_DISCOVERY
        else:
            intent = AgentIntent.SINGLE_TICKER_DEEP_DIVE if tickers else AgentIntent.GENERAL_FINANCIAL_QUERY

        # 2. Build Plan Steps (DAG)
        steps: List[Dict[str, Any]] = []
        
        if intent == AgentIntent.SINGLE_TICKER_DEEP_DIVE and tickers:
            ticker = tickers[0]
            steps.append({
                "action": "FETCH_REPORT",
                "ticker": ticker,
                "description": f"Fetch comprehensive company report for {ticker} (overview, valuation, financials, peers)"
            })
            steps.append({
                "action": "FETCH_SEGMENTS",
                "ticker": ticker,
                "description": f"Fetch revenue and cost breakdown segments for {ticker}"
            })
            steps.append({
                "action": "FETCH_BROKER_SUMMARY",
                "ticker": ticker,
                "description": f"Fetch top accumulating/distributing brokers for {ticker}"
            })
            
        elif intent == AgentIntent.PEER_BATTLE_COMPARISON:
            for ticker in tickers[:4]:  # Max 4 tickers at a time
                steps.append({
                    "action": "FETCH_REPORT",
                    "ticker": ticker,
                    "description": f"Fetch company report for {ticker}"
                })
                steps.append({
                    "action": "FETCH_BROKER_SUMMARY",
                    "ticker": ticker,
                    "description": f"Fetch broker accumulation for {ticker}"
                })
            steps.append({
                "action": "COMPUTE_PEER_MATRIX",
                "tickers": tickers[:4],
                "description": f"Compute valuation and profitability comparison matrix across {', '.join(tickers[:4])}"
            })

        elif intent == AgentIntent.SMART_MONEY_RADAR:
            if tickers:
                for ticker in tickers[:2]:
                    steps.append({
                        "action": "FETCH_BROKER_SUMMARY",
                        "ticker": ticker,
                        "description": f"Fetch top institutional buyers and sellers for {ticker}"
                    })
                    steps.append({
                        "action": "FETCH_FOREIGN_FLOW",
                        "ticker": ticker,
                        "description": f"Fetch historical net foreign flow for {ticker}"
                    })
            else:
                steps.append({
                    "action": "FETCH_TOP_INSTITUTIONAL_BROKERS",
                    "description": "Fetch top institutional broker rankings across the market"
                })

        elif intent == AgentIntent.COMMODITY_MACRO_IMPACT:
            steps.append({
                "action": "FETCH_COMMODITY_PRICES",
                "description": "Fetch historical commodity price trends"
            })
            steps.append({
                "action": "FETCH_MINING_SITES",
                "description": "Fetch mining sites & reserves data"
            })
            if tickers:
                steps.append({
                    "action": "FETCH_REPORT",
                    "ticker": tickers[0],
                    "description": f"Fetch company report for mining emiten {tickers[0]}"
                })

        else: # MARKET_SCREENING_DISCOVERY / GENERAL
            steps.append({
                "action": "SCREEN_MARKET",
                "query": query,
                "description": "Execute natural language screener or structured filter on IDX companies universe"
            })
            steps.append({
                "action": "FETCH_TOP_MOVERS",
                "description": "Fetch top gainers & losers for market momentum context"
            })

        return intent, tickers, steps
