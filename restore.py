import json

with open("/Users/nettolimited/.gemini/antigravity/brain/45c30b2d-72b5-494f-9f2e-c38bb7bdfdce/.system_generated/logs/transcript.jsonl", "r") as f:
    lines = f.readlines()

for line in reversed(lines):
    data = json.loads(line)
    if data.get("type") == "TOOL_RESPONSE":
        content = data.get("content", "")
        if "Total Lines: 832" in content:
            code_lines = []
            found_code = False
            for l in content.split("\n"):
                if l.startswith("The following code has been modified"):
                    found_code = True
                    continue
                if l.startswith("The above content does NOT show"):
                    break
                if found_code:
                    if ": " in l:
                        parts = l.split(": ", 1)
                        if parts[0].isdigit():
                            code_lines.append(parts[1])
                        else:
                            code_lines.append(l)
                    else:
                        code_lines.append(l)
            
            if code_lines:
                with open("src/camp-dashboard.jsx", "w") as out:
                    out.write("\n".join(code_lines))
                print(f"Restored! {len(code_lines)} lines")
            break
