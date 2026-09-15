import re
from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    html = f.read()

# Add button
new_button = '<button class="radar-filter-btn px-2 py-1 border border-[var(--circuit)] text-[10.5px] cursor-pointer" data-region="giras" type="button">🚌 GIRAS/TOURS</button>\n'
html = html.replace('data-region="asia" type="button">🌏 ASIA/INDIA (9)</button>', 'data-region="asia" type="button">🌏 ASIA/INDIA (9)</button>\n' + new_button)

# Remove the art-naafi-2014 block
soup = BeautifulSoup(html, 'html.parser')
naafi_node = soup.find('div', attrs={'data-item-id': 'art-naafi-2014'})
if naafi_node:
    naafi_node.extract()

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(soup.encode(formatter="html5").decode('utf-8'))
