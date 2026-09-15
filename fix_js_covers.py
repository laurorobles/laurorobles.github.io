import re
from bs4 import BeautifulSoup

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
cards = soup.find_all(class_='clickable-item')

html_covers = {}
for card in cards:
    item_id = card.get('data-item-id')
    img = card.find('img')
    if item_id and img and img.has_attr('src'):
        src = img['src']
        if not src.startswith('https://img.youtube.com'):
            html_covers[item_id] = src

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# For gumroad items, let's just make them all clasicos_vol1 in JS since the user noticed they mismatch.
# Wait, "genera los thumbnails correctos para gumroad sound packs" means they might have specific thumbnails!
# Do I have gumroad specific thumbnails in /images/covers/? Let me check later.
# For now, update JS with HTML covers for everything.
for item_id, html_src in html_covers.items():
    # Regex to find cover in JS for this specific item
    pattern = r'("' + item_id + r'":\s*\{[^}]*?cover:\s*")([^"]+)(")'
    def repl(m):
        if m.group(2) != html_src:
            print(f"Updating JS cover for {item_id}: {m.group(2)} -> {html_src}")
        return m.group(1) + html_src + m.group(3)
    js = re.sub(pattern, repl, js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

