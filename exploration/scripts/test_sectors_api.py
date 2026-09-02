import os
import json
import time
from pathlib import Path
import requests
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

API_KEY = os.getenv("SECTORS_API_KEY")
BASE_URL = "https://api.sectors.app/v2"

HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

SAMPLES_DIR = ROOT_DIR / "exploration" / "sample_responses"
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

test_results = []

def test_endpoint(name, method, endpoint, params=None, save_sample_name=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"\n==================================================")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    if params:
        print(f"Params: {params}")
    
    start_time = time.time()
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=HEADERS, params=params, timeout=15)
        elif method.upper() == "POST":
            response = requests.post(url, headers=HEADERS, json=params, timeout=15)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        elapsed_ms = int((time.time() - start_time) * 1000)
        status = response.status_code
        print(f"Status: {status} ({elapsed_ms}ms)")
        
        try:
            data = response.json()
            is_json = True
        except Exception:
            data = response.text
            is_json = False
            
        result_item = {
            "name": name,
            "method": method.upper(),
            "endpoint": endpoint,
            "params": params,
            "status": status,
            "latency_ms": elapsed_ms,
            "success": 200 <= status < 300,
            "sample_file": save_sample_name if save_sample_name else None
        }
        test_results.append(result_item)
        
        if save_sample_name and is_json:
            sample_path = SAMPLES_DIR / f"{save_sample_name}.json"
            with open(sample_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Saved sample response to {sample_path}")
            
        if is_json:
            if isinstance(data, list):
                print(f"Response (List, length {len(data)}): {json.dumps(data[:2], indent=2)[:300]}...")
            elif isinstance(data, dict):
                keys = list(data.keys())
                print(f"Response (Dict, keys: {keys}): {json.dumps({k: data[k] for k in keys[:4]}, indent=2)[:300]}...")
        else:
            print(f"Response: {str(data)[:200]}")
            
        return data
    except Exception as e:
        print(f"Error during request: {e}")
        test_results.append({
            "name": name,
            "method": method.upper(),
            "endpoint": endpoint,
            "params": params,
            "status": "ERROR",
            "latency_ms": int((time.time() - start_time) * 1000),
            "success": False,
            "error": str(e)
        })
        return None

def main():
    if not API_KEY:
        print("ERROR: SECTORS_API_KEY not found in .env!")
        return

    print(f"Using API Key: {API_KEY[:8]}...{API_KEY[-6:]}")
    
    # 1. Helper Lists: Subsectors
    test_endpoint(
        name="IDX Subsectors List",
        method="GET",
        endpoint="/subsectors/",
        save_sample_name="idx_subsectors"
    )
    
    # 2. Company Screener (Structured Query using `where` and `order_by`)
    test_endpoint(
        name="IDX Company Screener (Structured Query: Banks ordered by -market_cap)",
        method="GET",
        endpoint="/companies/",
        params={
            "where": "sub_sector = 'banks'",
            "order_by": "-market_cap",
            "limit": 5
        },
        save_sample_name="idx_screener_structured_banks"
    )
    
    # 3. Company Screener (Natural Language Query `q`)
    test_endpoint(
        name="IDX Company Screener (Natural Language Query: top 3 coal mining companies by revenue)",
        method="GET",
        endpoint="/companies/",
        params={
            "q": "top 3 coal mining companies by revenue in 2023"
        },
        save_sample_name="idx_screener_nl_query"
    )
    
    # 4. Detailed Company Report (BBCA)
    test_endpoint(
        name="IDX Company Report (BBCA)",
        method="GET",
        endpoint="/company/report/BBCA/",
        params={
            "sections": "overview,valuation,financials,peers"
        },
        save_sample_name="idx_company_report_bbca"
    )

    # 5. Broker Registry (Curated list of IDX brokers)
    test_endpoint(
        name="IDX Broker Registry",
        method="GET",
        endpoint="/brokers/",
        save_sample_name="idx_brokers_registry"
    )

    # 6. Top Brokers Daily Ranking
    test_endpoint(
        name="IDX Top Brokers Daily Ranking",
        method="GET",
        endpoint="/brokers/top/",
        save_sample_name="idx_top_brokers"
    )
    
    # 7. Broker Summary Top (BBCA)
    test_endpoint(
        name="IDX Broker Summary Top (BBCA)",
        method="GET",
        endpoint="/broker-summary/BBCA/top/",
        save_sample_name="idx_broker_summary_top_bbca"
    )

    # 8. Top Movers (Gainers & Losers)
    test_endpoint(
        name="IDX Top Movers",
        method="GET",
        endpoint="/companies/top-changes/",
        params={"periods": "7d", "n_stock": 5},
        save_sample_name="idx_top_movers_7d"
    )
    
    # 9. Singapore SGX Screener
    test_endpoint(
        name="SGX Companies Screener",
        method="GET",
        endpoint="/sgx/companies/",
        save_sample_name="sgx_screener"
    )
    
    # 10. SGX Company Report (D05 - DBS Group)
    test_endpoint(
        name="SGX Company Report (D05)",
        method="GET",
        endpoint="/sgx/company/report/D05/",
        save_sample_name="sgx_report_d05"
    )

    # 11. Malaysia KLSE Sectors
    test_endpoint(
        name="KLSE Sectors",
        method="GET",
        endpoint="/klse/sectors/",
        save_sample_name="klse_sectors"
    )

    # 12. Mining Extension: Commodities List
    test_endpoint(
        name="Mining Extension: Commodities List",
        method="GET",
        endpoint="/mining/commodities/",
        save_sample_name="mining_commodities"
    )

    # 13. Mining Extension: Mining Sites
    test_endpoint(
        name="Mining Extension: Mining Sites",
        method="GET",
        endpoint="/mining/sites/",
        save_sample_name="mining_sites"
    )
    
    # Save overall summary report
    summary_path = ROOT_DIR / "exploration" / "sample_responses" / "test_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(test_results, f, indent=2)
    print(f"\nCompleted {len(test_results)} test requests. Summary saved to {summary_path}")

if __name__ == "__main__":
    main()
