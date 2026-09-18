import re

# Update main.js
with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Remove the line that auto-opens terminal
js = re.sub(r"openWindow\('win-terminal',\s*false\);", "", js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<div class="player-body" id="player-content">', '<div class="player-body" id="player-content" style="display: none;">')
html = html.replace('id="btn-minimize-player" title="Minimizar / Expandir">_</span>', 'id="btn-minimize-player" title="Minimizar / Expandir">+</span>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updates applied.")
