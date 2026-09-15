import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove from VISUAL group
art_btn = '<button class="dock-item w-full text-left" data-target="win-art"><span class="dock-status"></span>ART</button>'
html = html.replace(art_btn + '\n', '')
html = html.replace(art_btn, '')

# Add to INFO group
info_group = r'(<button class="dock-item w-full text-left" data-target="win-pedagogy"><span class="dock-status"></span>PEDAGOGY</button>)'
html = re.sub(info_group, r'\g<1>\n<button class="dock-item w-full text-left" data-target="win-art"><span class="dock-status"></span>ART</button>', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
