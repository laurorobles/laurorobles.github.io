from bs4 import BeautifulSoup
with open('index.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
win = soup.find(id='win-bio')
print(win.find('li'))
