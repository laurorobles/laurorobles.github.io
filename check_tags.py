from bs4 import BeautifulSoup
import re

with open('index.html', 'r') as f:
    html = f.read()

# Let's count divs from <div id="world">
world_idx = html.find('id="world"')
# We want to see if the world div is prematurely closed.
# It's better to just use an HTML parser and see who is the parent of win-terminal.
soup = BeautifulSoup(html, 'html.parser')
win = soup.find(id='win-terminal')
if win:
    print(f"win-terminal parent is: {win.parent.name}, id: {win.parent.get('id', 'None')}")
    # Also find #world and see its children
    world = soup.find(id='world')
    print("Children of #world that are drag-windows:")
    for child in world.find_all('div', class_='drag-window', recursive=False):
        print(f" - {child.get('id')}")
else:
    print("win-terminal not found")

