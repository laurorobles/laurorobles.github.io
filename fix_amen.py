import re
from bs4 import BeautifulSoup

# Fix HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the specific block of Amen EP
# Find `<div class="music-card clickable-item" ... data-item-id="amen_ep"`
soup = BeautifulSoup(html, 'html.parser')
amen_cards = soup.find_all('div', attrs={'data-item-id': 'amen_ep'})
for amen in amen_cards:
    amen['data-title'] = "Amen EP [FILTRO.016] [2006]"
    amen['data-bc-id'] = ""
    amen['data-ext'] = "https://netlabelarchive.org/2006/04/28/filtro-016/"
    
    title_div = amen.find('div', class_='music-card-title')
    if title_div: title_div.string = "Amen EP [FILTRO.016]"
    
    meta_div = amen.find('div', class_='music-card-meta')
    if meta_div: meta_div.string = "2006 • Filtro Netlabel"
    
    desc_div = amen.find('div', class_='music-card-desc')
    if desc_div: desc_div.string = "Debut EP / Dub místico"

    # Replace the BC link with an Archive.org link
    a_tag = amen.find('a', class_='act-cue')
    if a_tag:
        a_tag['href'] = "https://netlabelarchive.org/2006/04/28/filtro-016/"
        a_tag.string = "WEB ↗"

# Also add the favicon
head = soup.find('head')
if head and not head.find('link', attrs={'rel': 'icon'}):
    favicon = soup.new_tag('link', rel='icon', type='image/png', href='/images/extasis.png')
    head.append(favicon)

# Fix Oracle Layout
oracle = soup.find(id='win-oracle')
if oracle:
    win_body = oracle.find('div', class_='win-body')
    if win_body and 'flex' not in win_body.get('class', []):
        win_body['class'] = win_body.get('class', []) + ['flex', 'flex-col', 'h-[calc(100%-26px)]']

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(soup.encode(formatter="html5").decode('utf-8'))

# Fix JS
with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace Amen EP streamType
js = js.replace('"streamType": "bandcamp"', 'streamType: "bandcamp"')
js = js.replace('streamType: "bandcamp",\n            streamPayload: "238116672"', 
                'streamType: "direct_audio",\n            streamPayload: "https://archive.org/download/filtro.016/01%20-%20Glory%20Sat..mp3"')
# Also fix the title if it had brackets? The user said "no incluyas los simbolos { en el nombre."
js = js.replace('Amen EP [FILTRO.016]', 'Amen EP')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
