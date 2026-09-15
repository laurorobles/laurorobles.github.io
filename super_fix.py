from bs4 import BeautifulSoup
import re

# 1. Update index.html
with open('index.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Remove top terminal button
btn_top_term = soup.find(id='btn-top-terminal')
if btn_top_term:
    btn_top_term.decompose()

# Remove numbers from dock menus
for btn in soup.find_all(class_='dock-item'):
    if btn.find(class_='dock-status'):
        text_node = btn.find(class_='dock-status').next_sibling
        if text_node and isinstance(text_node, str):
            # Regex to remove "01.", "12.", etc.
            new_text = re.sub(r'^\d{2}\.', '', text_node).strip()
            text_node.replace_with(new_text)

# Fix sets (mixes) thumbnails
mix_img_map = {
    'mix-japan-2024': '/images/covers/mix_japan.jpg',
    'mix-boiler-room-cdmx': '/images/covers/mix_cdmx.jpg',
    'mix-boiler-room-bcn': '/images/covers/mix_bcn.jpg',
    'mix-boiler-room-shenzhen': '/images/covers/mix_shenzhen.jpg',
    'mix-id-mag': '/images/covers/mix_id.jpg',
    'mix-seoul-community-radio': '/images/covers/perfil.jpg',
    'mix-yeyojungle': '/images/covers/yeyojungle.png',
}

for item_id, img_src in mix_img_map.items():
    item = soup.find(attrs={"data-item-id": item_id})
    if item:
        img = item.find('img')
        if img:
            img['src'] = img_src

# Make sure all clickable-item in art/press/mixes have an image (user req: "para todos los elementos trata de generar thumbnails")
# We already did this, but let's double check if there are any without an img.
for win_id in ['win-press', 'win-art', 'win-mixes', 'win-pedagogy', 'win-music']:
    win = soup.find(id=win_id)
    if not win: continue
    items = win.find_all(class_='clickable-item')
    for item in items:
        img = item.find('img')
        if not img:
            # Fallback
            img = soup.new_tag('img', src="/images/covers/perfil.jpg")
            img['class'] = ['w-10', 'h-10', 'object-cover', 'border', 'border-[var(--circuit)]']
            item.insert(0, img)

with open('index.html', 'w') as f:
    f.write(str(soup))


# 2. Update src/main.js
with open('src/main.js', 'r') as f:
    js = f.read()

# Fix youtube URLs
js = re.sub(
    r'`https://www\.youtube-nocookie\.com/embed/\$\{item\.streamPayload\}\?autoplay=1&enablejsapi=1`',
    r'`https://www.youtube-nocookie.com/embed/${item.streamPayload}${item.streamPayload.includes("?") ? "&" : "?"}autoplay=1&enablejsapi=1`',
    js
)
js = re.sub(
    r'`https://www\.youtube-nocookie\.com/embed/\$\{ytId\}\?autoplay=\$\{autoPlay \? 1 : 0\}`',
    r'`https://www.youtube-nocookie.com/embed/${ytId}${ytId.includes("?") ? "&" : "?"}autoplay=${autoPlay ? 1 : 0}`',
    js
)
js = re.sub(
    r'`https://www\.youtube-nocookie\.com/embed/\$\{ytId\}\?autoplay=1`',
    r'`https://www.youtube-nocookie.com/embed/${ytId}${ytId.includes("?") ? "&" : "?"}autoplay=1`',
    js
)

with open('src/main.js', 'w') as f:
    f.write(js)

