import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

mapping = {
    'gumroad-clubcode-vol1': '/images/covers/gumroad_real_clubcode1.jpg',
    'gumroad-clubcode-vol2': '/images/covers/gumroad_real_clubcode2.jpg',
    'gumroad-jungle-amen': '/images/covers/gumroad_real_amen.jpg',
    'gumroad-selva-kit': '/images/covers/gumroad_real_selvakit.jpg',
    'gumroad-capital-wobble': '/images/covers/gumroad_real_capitalwobble.jpg',
    'gumroad-spectral-resonator': '/images/covers/gumroad_real_spectral.jpg',
    'gumroad-guaracha-bass': '/images/covers/gumroad_real_guaracha.jpg'
}

for item_id, thumb_path in mapping.items():
    pattern = r'("' + item_id + r'":\s*\{[^}]*?cover:\s*")([^"]+)(")'
    js = re.sub(pattern, r'\g<1>' + thumb_path + r'\g<3>', js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
