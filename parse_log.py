import json

with open('/Users/nettolimited/.gemini/antigravity/brain/45c30b2d-72b5-494f-9f2e-c38bb7bdfdce/.system_generated/logs/transcript.jsonl') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT' and 'อาการบาดเจ็บวันที่ 6' in data.get('content', ''):
            print(f"FOUND USER INPUT AT INDEX {i}")
            # print next 10 lines
            for j in range(1, 10):
                if i+j < len(lines):
                    next_data = json.loads(lines[i+j])
                    print(f"  [{j}] {next_data.get('type')} {next_data.get('source')}: {str(next_data.get('content'))[:100]}")
    except Exception:
        pass
