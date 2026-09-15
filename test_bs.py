from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

win = soup.find(id='win-press')
el_pais = win.find(attrs={"data-item-id": "press-el-pais"})
parent = el_pais.parent
print(parent.name, parent.get('class'), parent.get('id'))
