import json
import difflib
import re

with open('src/data.jsx', 'r', encoding='utf-8') as f:
    data = f.read()

# Extract json array
match = re.search(r'const\s+PLAYERS\s*=\s*(\[.*\]);', data, re.DOTALL)
if match:
    players = json.loads(match.group(1))
else:
    # fallback if format is different
    players = []

targets = ["พนิตา พรมรัตน์", "ชลธิชา ปัญญารุ้ง", "ปรีชากรณ์ เครือชื่นชม", "ขวัญจิรา งอกวงค์", "นาตาลี หงอสุวรรณ"]

for t in targets:
    print(f"\nTarget: {t}")
    scores = []
    for p in players:
        name_en = p.get('name', '')
        name_th = p.get('thaiName', '')
        score_th = difflib.SequenceMatcher(None, t, name_th).ratio()
        score_en = difflib.SequenceMatcher(None, t, name_en).ratio()
        scores.append((max(score_th, score_en), name_th, name_en, p.get('id'), p.get('pos')))
    
    scores.sort(reverse=True)
    for s in scores[:5]:
        print(f"  [{s[4]}] {s[1]} / {s[2]} (Score: {s[0]:.2f}) - {s[3]}")
