from bs4 import BeautifulSoup
with open('index.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
win = soup.find(id='win-music')
print(win.find(class_='music-card'))
