import re
from bs4 import BeautifulSoup

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Extract items from JS
# Using a crude regex to parse items and covers
covers_js = {}
items = re.findall(r'"([a-zA-Z0-9_-]+)":\s*\{[^}]*?cover:\s*"([^"]+)"', js)
for item_id, cover in items:
    covers_js[item_id] = cover
    
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
cards = soup.find_all(class_='clickable-item')

mismatches = []
for card in cards:
    item_id = card.get('data-item-id')
    img = card.find('img')
    if item_id and img and img.has_attr('src'):
        html_src = img['src']
        js_src = covers_js.get(item_id)
        
        # Youtube thumbs handle differently, check if it's youtube
        if html_src.startswith('https://img.youtube.com'):
            continue
            
        if js_src and html_src != js_src:
            mismatches.append(f"{item_id}: HTML={html_src} | JS={js_src}")

for m in mismatches:
    print(m)
    
if not mismatches:
    print("No mismatches found between HTML and JS covers.")
