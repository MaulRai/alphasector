import re
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.agent import AgentIntent, ExecutionPhase, ReasoningStep

# Known Indonesian stock ticker pattern (4 uppercase letters, e.g. BBCA, BBRI, TLKM, ASII, ADRO)
TICKER_REGEX = re.compile(r'\b([A-Z]{4})(?:\.JK)?\b', re.IGNORECASE)

# Keywords to detect intent
PEER_KEYWORDS = ["banding", "bandingkan", "komparasi", "vs", "versus", "compare", "mana yang lebih", "better than", "antara"]
BROKER_KEYWORDS = ["broker", "bandar", "bandarmology", "smart money", "akumulasi", "distribusi", "foreign", "asing", "inflow", "outflow"]
SCREENER_KEYWORDS = [
    "screen", "screener", "cari", "filter", "saham apa", "rekomendasi", "top", 
    "terbaik", "paling tinggi", "tertinggi", "dividend yield", "dividen", "dividend",
    "growth", "titans", "titan", "revenue", "omset", "pendapatan", "laba", "esg", "leaders", "leader",
    "shareholder", "pemegang saham", "pengendali", "kepemilikan", "operator", "operators", 
    "efficient", "efisiensi", "karyawan", "undervalued", "murah", "mahal", "sektor", "sector"
]
COMMODITY_KEYWORDS = ["nikel", "nickel", "emas", "gold", "batubara", "coal", "tembaga", "copper", "timah", "tin", "komoditas", "commodity", "tambang"]

# Comprehensive stopword list of common 4-letter Indonesian and English words that are NOT tickers
STOPWORDS_4 = {
    # Indonesian common 4-letter words & commodity/screener tokens
    "BATU", "BARA", "SAHM", "SAHA", "KOTA", "DANA", "PROS", "CONS", "EMIT", "SEKT", "JASA",
    "LUAR", "BAIK", "JELE", "BESR", "KECI", "KUAT", "LEMA", "MURH", "MAHL", "TING",
    "REND", "SKOR", "HASI", "TAMP", "TIPE", "JENI", "KATA", "BANY", "SEDI", "PERK",
    "SEMI", "GAYA", "TEMA", "MODL", "EFIS", "KARY", "LEAD", "TITN", "GROW", "VALU",
    "DIVI", "YILD", "ROEE", "ROAA", "DERR", "NPMM", "PBVV", "PERR", "MCAP", "CAPS",
    "SEGI", "CARA", "OPSI", "PILI", "MENU", "TABL", "ROWW", "COLL", "KOLO", "SLOT",
    "CARI", "CEK", "LIAT", "BAGI", "BACA", "MAU", "DENG", "DATA", "INFO", "PEER",
    "FLOW", "FUND", "BANK", "LABA", "RUGI", "NAIK", "TURU", "JUAL", "BELI", "RISK",
    "DEBT", "YIEL", "VIEW", "LIST", "HELP", "BEST", "GOOD", "MORE", "LESS", "SHOW",
    "FIND", "RANK", "GAIN", "LOSS", "RATE", "TIME", "DATE", "TEST", "CODE", "TYPE",
    "TEXT", "FREE", "PAGE", "USER", "CHAT", "AUTO", "TERM", "COST", "DEAL", "SEEK",
    "FAST", "SLOW", "TRUE", "ELSE", "NULL", "ITEM", "NEWS", "PORT", "DARI", "YANG",
    "PADA", "BISA", "KITA", "ATAU", "IKUT", "MAKA", "AKAN", "SAAT", "JUGA", "KAMI",
    "ADAK", "POST", "JSON", "HTTP", "REST", "BEDA", "MANA", "BUAT", "PULA", "SAJA",
    "POIN", "SATU", "DUAA", "TIGA", "LIMA", "ENAM", "RIBU", "JUTA", "TRIL", "SINI",
    "SANA", "SITU", "APAL", "AGAR", "BIAR", "SIAP", "PERU", "INDX", "KAYA", "TREN",
    "POLA", "AWAL", "AKHR", "BLAN", "THUN", "HARI", "MING", "TAHN", "KIRA", "SUDA",
    "TELH", "LALU", "KEMU", "KINI", "HANY", "CUMA", "LAIN", "BEBR", "TRUS", "DULU",
    "LGIK", "MASI", "MASA", "SAMA", "SEGI", "RING", "RANG", "KURA", "LEBI", "JELA",
    "BERI", "SIMU", "TADI", "ATAS", "SEMU", "DAMP", "RISI", "STRA", "ALOK", "PERK",
    # English common 4-letter words
    "WITH", "HAVE", "THIS", "THAT", "FROM", "THEY", "SOME", "WHAT", "WHEN", "WHOM",
    "MANY", "EACH", "VERY", "MUCH", "BOTH", "SUCH", "LIKE", "OVER", "INTO", "ALSO",
    "EVEN", "MOST", "ONLY", "SAME", "THAN", "THEN", "JUST", "WELL", "REAL", "FULL",
    "HIGH", "LAST", "LONG", "NEXT", "OPEN", "PAST", "SURE", "ZERO", "BASE", "BOOK",
    "CASE", "FACT", "HEAD", "LINE", "NAME", "PART", "PLAN", "SIDE", "SITE", "STEP",
    "TEAM", "WORK", "AREA", "CITY", "DAYS", "FORM", "HOUR", "LIFE", "MIND", "NOTE",
    "ROAD", "ROOM", "WEEK", "YEAR", "WORD", "LOOK", "MEAN", "NEED", "PLAY", "READ",
    "SEEM", "TELL", "TURN", "WAIT", "WANT", "CALL", "FEEL", "GIVE", "HOLD", "KEEP",
    "MAKE", "MOVE", "PASS", "SAID", "SEND", "TAKE", "TALK", "TOLD", "WALK"
}

def parse_tickers_from_query(query: str, context_ticker: Optional[str] = None) -> List[str]:
    """Extract distinct valid IDX stock tickers mentioned in user query."""
    # Find all 4-letter candidate words
    matches = TICKER_REGEX.findall(query)
    tickers = []
    
    for m in matches:
        ticker = m.upper()
        # Strictly ignore words present in stopwords
        if ticker in STOPWORDS_4:
            continue
        if ticker not in tickers:
            tickers.append(ticker)
            
    if context_ticker:
        clean_ctx = context_ticker.upper().replace(".JK", "")
        if clean_ctx not in STOPWORDS_4 and clean_ctx not in tickers:
            tickers.insert(0, clean_ctx)
            
    return tickers

def contains_keyword(text: str, keywords: List[str]) -> bool:
    """Check if any keyword matches as a distinct word or compound phrase in text."""
    for kw in keywords:
        pattern = r'\b' + re.escape(kw) + r'\b' if len(kw) <= 4 else re.escape(kw)
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

class AgentPlanner:
    """Plans multi-step execution DAG based on query intent & parameters."""
    
    @staticmethod
    def plan(query: str, context_ticker: Optional[str] = None) -> Tuple[AgentIntent, List[str], List[Dict[str, Any]]]:
        tickers = parse_tickers_from_query(query, context_ticker)
        
        # 1. Determine Intent with robust boundary-aware keyword matching
        intent = AgentIntent.GENERAL_FINANCIAL_QUERY
        
        if len(tickers) >= 2 and contains_keyword(query, PEER_KEYWORDS + ["vs", "versus"]):
            intent = AgentIntent.PEER_BATTLE_COMPARISON
        elif len(tickers) >= 2:
            intent = AgentIntent.PEER_BATTLE_COMPARISON
        elif contains_keyword(query, BROKER_KEYWORDS) and len(tickers) >= 1:
            intent = AgentIntent.SMART_MONEY_RADAR
        elif contains_keyword(query, COMMODITY_KEYWORDS) and len(tickers) <= 1:
            intent = AgentIntent.COMMODITY_MACRO_IMPACT
        elif contains_keyword(query, SCREENER_KEYWORDS) and len(tickers) == 0:
            intent = AgentIntent.MARKET_SCREENING_DISCOVERY
        elif len(tickers) == 1 and not contains_keyword(query, ["jelaskan", "mengapa", "kenapa", "bagaimana", "tabel", "pros", "cons", "kelebihan", "kekurangan", "menurutmu", "pendapat", "alokasi", "simulasi", "rangkum", "ringkas"]):
            intent = AgentIntent.SINGLE_TICKER_DEEP_DIVE
        elif len(tickers) == 0:
            intent = AgentIntent.GENERAL_FINANCIAL_QUERY
        else:
            intent = AgentIntent.GENERAL_FINANCIAL_QUERY

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

    classify_and_plan = plan

planner = AgentPlanner()
