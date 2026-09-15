import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('hqdefault.jpg', 'mqdefault.jpg')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('hqdefault.jpg', 'mqdefault.jpg')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
