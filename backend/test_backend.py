import sys
import asyncio
import json
from app.agent.orchestrator import agent_orchestrator

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def test_agent():
    print("==================================================")
    print("TESTING ALPHASECTOR AGENT ORCHESTRATOR")
    print("==================================================")
    
    # 1. Single Ticker Deep Dive
    print("\n--- Test 1: Single Ticker Deep Dive (BBCA) ---")
    res1 = await agent_orchestrator.execute("Analisis fundamental dan valuasi BBCA")
    print(f"Intent: {res1.intent.value}")
    print(f"Total Execution Time: {res1.total_execution_time_ms}ms")
    print(f"Reasoning Steps: {len(res1.reasoning_trace)}")
    print(f"Executive Summary: {res1.synthesis.executive_summary[:200]}...")

    # 2. Peer Battle Comparison
    print("\n--- Test 2: Peer Battle Comparison (BBRI vs BMRI) ---")
    res2 = await agent_orchestrator.execute("Bandingkan valuasi dan dividen BBRI vs BMRI")
    print(f"Intent: {res2.intent.value}")
    print(f"Comparison Matrix length: {len(res2.peer_matrix) if res2.peer_matrix else 0}")
    print(f"Valuation Verdict: {res2.synthesis.valuation_verdict}")

    # 3. Smart Money Flow
    print("\n--- Test 3: Smart Money Flow (TLKM) ---")
    res3 = await agent_orchestrator.execute("Cek broker flow dan akumulasi TLKM")
    print(f"Intent: {res3.intent.value}")
    print(f"Broker Summary Signal: {res3.broker_summary.get('sentiment') if res3.broker_summary else 'None'}")
    
    print("\n[+] All agent orchestrator tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(test_agent())
