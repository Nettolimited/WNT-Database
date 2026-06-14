import json, re

with open('src/data.jsx', 'r', encoding='utf-8') as f:
    data = f.read()

match = re.search(r'const\s+PLAYERS\s*=\s*(\[.*\]);', data, re.DOTALL)
if match:
    players = json.loads(match.group(1))
else:
    players = []

for p in players:
    name = p.get('name', '').lower()
    if 'panita' in name or 'pree' in name or 'kwan' in name or 'nata' in name or 'chonticha' in name:
        print(f"[{p.get('id')}] {p.get('name')} / {p.get('thaiName')} - {p.get('pos')}")
