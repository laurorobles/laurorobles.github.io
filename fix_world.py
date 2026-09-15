from bs4 import BeautifulSoup

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

world = soup.find(id='world')
body = soup.find('body')

# Find all windows that accidentally became children of body instead of world
windows_to_move = [
    'win-oracle',
    'win-terminal',
    'win-labyrinth',
    'win-contact',
    'win-sigil',
    'win-press'
]

for win_id in windows_to_move:
    win = soup.find(id=win_id)
    if win and win.parent.name == 'body':
        win.extract()
        world.append(win)

# We should also clean up any stray extra closing tags if they broke anything else, 
# but BeautifulSoup usually sanitizes the tree when parsing and writing.
# Let's save the cleaned tree.
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(soup.encode(formatter="html5").decode('utf-8'))

