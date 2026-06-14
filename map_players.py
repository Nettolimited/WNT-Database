import json, re

with open('src/data.jsx', 'r', encoding='utf-8') as f:
    data = f.read()

match = re.search(r'const\s+PLAYERS\s*=\s*(\[.*\]);', data, re.DOTALL)
if match:
    players = json.loads(match.group(1))
else:
    players = []

thai_names = [
    "ทิชานันท์ สดชื่น", "พนิตา พรมรัต", "ชลธิชา ปัญญารุ้ง",
    "ณัฐชา แก้วอันตา", "สุภาพร อินทรประสิทธิ์", "อุไรพร ยงกุล",
    "ภิญญาพัชญ์ กลิ่นคล้าย", "ชัชวัลย์ รอดทอง", "ปาริชาต ทองรอง",
    "พิสมัย สอนไสย์", "ปณิฏฐา จีรัตนะภวิบูล",
    "ธวันรัตน์ พรมทองมี", "วิรัญญา แกว่นกสิกรรม", "ปลื้มใจ สนธิสวัสดิ์",
    "ปรีชากรณ์ เครือชื่นชม", "ขวัญจิรา งอกวงค์", "พิชญธิดา มะโนวัง",
    "จณิสตา จินันทุยา", "ภัทรนันท์ อุปชัย", "กาญจนธัช พุ่มศรี",
    "เสาวลักษณ์ เพ็งงาม", "จิราภรณ์ มงคลดี", "นาตาลี หงอสุวรรณ"
]

ids = []
not_found = []
for name in thai_names:
    found = False
    for p in players:
        # Match thaiName or handle variations
        db_name = p.get('thaiName', '').strip()
        if db_name == name or db_name.replace('์', '') == name.replace('์', ''):
            ids.append(p['id'])
            found = True
            break
    if not found:
        not_found.append(name)

print("IDs:", json.dumps(ids))
print("Not Found:", not_found)
