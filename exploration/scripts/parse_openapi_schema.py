import json
import os
from pathlib import Path

SCHEMA_FILE = Path(r"C:\Users\User\.gemini\antigravity-ide\brain\466007fb-fdfd-4700-afdb-37187bc18cba\.system_generated\steps\20\content.md")
OUTPUT_MD = Path(r"d:\Projects\Web Shi\sectors-hackathon\exploration\markdown\02_api_reference.md")

def parse_schema():
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Strip markdown header before json
    json_start = content.find("{")
    data = json.loads(content[json_start:])
    
    info = data.get("info", {})
    tag_groups = info.get("x-tagGroups", [])
    paths = data.get("paths", {})
    
    lines = []
    lines.append("# Sectors Financial API v2 - Complete API Reference\n")
    lines.append(f"**Version:** {info.get('version', '2.0.0')}  ")
    lines.append(f"**Base URL:** `https://api.sectors.app/v2/`\n")
    lines.append("## Billing & Credit System\n")
    lines.append(info.get("description", ""))
    lines.append("\n---\n")
    
    # Organize endpoints by Tag Group & Tag
    endpoints_by_tag = {}
    for path, methods in paths.items():
        for method, details in methods.items():
            tags = details.get("tags", ["General"])
            for tag in tags:
                if tag not in endpoints_by_tag:
                    endpoints_by_tag[tag] = []
                endpoints_by_tag[tag].append({
                    "path": path,
                    "method": method.upper(),
                    "summary": details.get("summary", ""),
                    "description": details.get("description", ""),
                    "parameters": details.get("parameters", []),
                    "operationId": details.get("operationId", "")
                })
                
    for group in tag_groups:
        group_name = group.get("name")
        lines.append(f"## 🏛️ {group_name}\n")
        for tag in group.get("tags", []):
            lines.append(f"### 📂 {tag}\n")
            if tag in endpoints_by_tag:
                for ep in endpoints_by_tag[tag]:
                    lines.append(f"#### `{ep['method']}` `{ep['path']}` - {ep['summary']}\n")
                    lines.append(f"{ep['description']}\n")
                    if ep["parameters"]:
                        lines.append("**Parameters:**\n")
                        lines.append("| Parameter | In | Type | Required | Description |")
                        lines.append("|---|---|---|---|---|")
                        for p in ep["parameters"]:
                            p_name = p.get("name")
                            p_in = p.get("in")
                            p_type = p.get("schema", {}).get("type", "string")
                            p_req = "✅ Yes" if p.get("required") else "No"
                            p_desc = p.get("description", "").replace("\n", " ")
                            lines.append(f"| `{p_name}` | {p_in} | `{p_type}` | {p_req} | {p_desc} |")
                        lines.append("")
                    lines.append("\n---\n")
            else:
                lines.append("*No endpoints listed under this tag.*\n")
    
    OUTPUT_MD.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
        
    print(f"Generated API Reference at {OUTPUT_MD} with {len(paths)} endpoints!")

if __name__ == "__main__":
    parse_schema()
