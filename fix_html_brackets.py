import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('Amen EP [FILTRO.016] [2006]', 'Amen EP')
html = html.replace('Amen EP [FILTRO.016]', 'Amen EP')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
