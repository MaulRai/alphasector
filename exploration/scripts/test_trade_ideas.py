"""
Trade Ideas Implementation Script
Demonstrates how to fetch and reproduce all curated Trade Ideas from Sectors.app UI using Sectors API v2.
"""

import os
import sys
import json
from pathlib import Path
import requests
from dotenv import load_dotenv
import pandas as pd
from tabulate import tabulate

# Ensure UTF-8 output on Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

API_KEY = os.getenv("SECTORS_API_KEY")
BASE_URL = "https://api.sectors.app/v2"

HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

def query_screener(where_clause, order_by=None, limit=5, title=""):
    url = f"{BASE_URL}/companies/"
    params = {
        "where": where_clause,
        "limit": limit
    }
    if order_by:
        params["order_by"] = order_by
        
    print(f"\n=======================================================")
    print(f"[*] TRADE IDEA: {title}")
    print(f"WHERE: {where_clause}")
    print(f"ORDER BY: {order_by}")
    
    r = requests.get(url, headers=HEADERS, params=params, timeout=15)
    if r.status_code == 200:
        data = r.json()
        results = data.get("results", [])
        if results:
            df = pd.DataFrame(results)
            print(tabulate(df.head(limit), headers="keys", tablefmt="github", showindex=False))
        else:
            print("No matching companies found.")
        return results
    else:
        print(f"Failed ({r.status_code}): {r.text}")
        return None

def main():
    print("=======================================================")
    print("EXECUTING SECTORS.APP TRADE IDEAS VIA API")
    print("=======================================================")
    
    # -------------------------------------------------------------
    # INDONESIA TRADE IDEAS
    # -------------------------------------------------------------
    
    # 1. ESG Leaders
    query_screener(
        where_clause="esg_score IS NOT NULL",
        order_by="-esg_score",
        limit=5,
        title="[IDN] ESG Leaders (Companies with strong ESG practices)"
    )
    
    # 2. Revenue Growth Leaders
    query_screener(
        where_clause="revenue[2024] IS NOT NULL and revenue[2023] IS NOT NULL and revenue[2024] > revenue[2023]",
        order_by="-(revenue[2024]/revenue[2023])",
        limit=5,
        title="[IDN] Revenue Growth Leaders (Highest YoY revenue growth)"
    )
    
    # 3. Large Single-Shareholder
    query_screener(
        where_clause="executives_shareholdings_share_percentage >= 0.70 OR major_shareholders_share_percentage >= 0.70",
        order_by="-market_cap",
        limit=5,
        title="[IDN] Large Single-Shareholder (Single entity owns >= 70% shares)"
    )
    
    # 4. Efficient Operators
    query_screener(
        where_clause="earnings[2024] IS NOT NULL and employee_num IS NOT NULL and employee_num > 50",
        order_by="-(earnings[2024]/employee_num)",
        limit=5,
        title="[IDN] Efficient Operators (Highest net income per employee)"
    )

    # 5. Smart Money Buying (Institutional Broker Inflow)
    print("\n=======================================================")
    print("[*] TRADE IDEA: [IDN] Smart Money Buying (Institutional Brokers Flow)")
    r = requests.get(f"{BASE_URL}/brokers/top/", headers=HEADERS, params={"cohort": "institutional", "metric": "gross"}, timeout=15)
    if r.status_code == 200:
        data = r.json()
        brokers = data.get("results", [])[:5]
        print(f"Date: {data.get('date')}")
        print(tabulate(brokers, headers="keys", tablefmt="github", showindex=False))

    # -------------------------------------------------------------
    # SINGAPORE TRADE IDEAS
    # -------------------------------------------------------------
    
    # 6. SGX Top Dividend Yield (> 5%)
    print("\n=======================================================")
    print("[*] TRADE IDEA: [SGX] High Dividend Yield (> 5%)")
    r_sgx_top = requests.get(f"{BASE_URL}/sgx/companies/top/", headers=HEADERS, timeout=15)
    if r_sgx_top.status_code == 200:
        sgx_data = r_sgx_top.json()
        high_div = sgx_data.get("dividend_yield", [])[:5]
        print(tabulate(high_div, headers="keys", tablefmt="github", showindex=False))
        
    # 7. SGX Earnings Growth Leaders
    print("\n=======================================================")
    print("[*] TRADE IDEA: [SGX] Earnings Growth Leaders")
    if r_sgx_top.status_code == 200:
        sgx_data = r_sgx_top.json()
        earnings_leaders = sgx_data.get("earnings", [])[:5]
        print(tabulate(earnings_leaders, headers="keys", tablefmt="github", showindex=False))

    # 8. SGX Recent Insider Buys
    print("\n=======================================================")
    print("[*] TRADE IDEA: [SGX] Recent Insider Buys (Insider Filings)")
    r_sgx_filings = requests.get(f"{BASE_URL}/sgx/filings/", headers=HEADERS, params={"transaction_type": "buy"}, timeout=15)
    if r_sgx_filings.status_code == 200:
        filings = r_sgx_filings.json().get("results", [])[:5]
        print(tabulate(filings, headers="keys", tablefmt="github", showindex=False))

if __name__ == "__main__":
    main()
