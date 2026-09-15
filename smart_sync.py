import re
from bs4 import BeautifulSoup

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

covers_js = {}
items = re.findall(r'"([a-zA-Z0-9_-]+)":\s*\{[^}]*?cover:\s*"([^"]+)"', js)
for item_id, cover in items:
    covers_js[item_id] = cover
    
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
cards = soup.find_all(class_='clickable-item')

html_changed = False
js_changed = False

for card in cards:
    item_id = card.get('data-item-id')
    img = card.find('img')
    if item_id and img and img.has_attr('src'):
        html_src = img['src']
        js_src = covers_js.get(item_id)
        
        if html_src.startswith('https://img.youtube.com'):
            continue
            
        if js_src and html_src != js_src:
            print(f"Mismatch {item_id}: HTML={html_src} | JS={js_src}")
            # Decision logic:
            if item_id.startswith('mix-') and 'perfil' not in html_src and 'catedral' not in html_src:
                # HTML has the good mix cover
                print(f"  -> Applying HTML to JS for {item_id} ({html_src})")
                pattern = r'("' + item_id + r'":\s*\{[^}]*?cover:\s*")([^"]+)(")'
                js = re.sub(pattern, r'\g<1>' + html_src + r'\g<3>', js)
                js_changed = True
            else:
                # Default: JS has the authoritative source (Art, Gumroad, Press, etc)
                print(f"  -> Applying JS to HTML for {item_id} ({js_src})")
                img['src'] = js_src
                html_changed = True

if html_changed:
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(soup.encode(formatter="html5").decode('utf-8'))
if js_changed:
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(js)
