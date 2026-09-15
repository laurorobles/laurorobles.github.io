from bs4 import BeautifulSoup
import re

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

def get_year(item):
    year_span = item.find('span', class_=re.compile(r'text-\[9px\].*?font-mono'))
    if year_span:
        text = year_span.get_text(strip=True)
        if text.isdigit():
            return int(text)
    return 0

art_list = soup.find(id="art-items-list")
if art_list:
    items = art_list.find_all('div', class_='clickable-item', recursive=False)
    for item in items:
        item.extract()
    items.sort(key=get_year, reverse=True)
    for item in items:
        art_list.append(item)

with open('index.html', 'w', encoding='utf-8') as f:
    # Use formatter to prevent messed up tags
    f.write(soup.encode(formatter="html5").decode('utf-8'))
