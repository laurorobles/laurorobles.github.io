import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

mapping = {
    'gumroad-clubcode-vol1': '/images/covers/gumroad_thumb_1.jpg',
    'gumroad-clubcode-vol2': '/images/covers/gumroad_thumb_2.jpg',
    'gumroad-jungle-amen': '/images/covers/gumroad_thumb_3.jpg',
    'gumroad-selva-kit': '/images/covers/gumroad_thumb_4.jpg',
    'gumroad-capital-wobble': '/images/covers/gumroad_thumb_5.jpg',
}

for item_id, thumb_path in mapping.items():
    pattern = r'("' + item_id + r'":\s*\{[^}]*?cover:\s*")([^"]+)(")'
    js = re.sub(pattern, r'\g<1>' + thumb_path + r'\g<3>', js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
