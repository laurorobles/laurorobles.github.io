from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

def add_thumbnail(element, default_img="/images/covers/perfil.jpg"):
    if not element.find('img'):
        item_id = element.get('data-item-id', '')
        img_src = default_img
        if "venecia" in item_id or "culebra" in item_id: img_src = "/images/covers/chapultepec.jpg"
        if "tono" in item_id or "atlacoya" in item_id: img_src = "/images/covers/sendero.jpg"
        if "pedagogy" in item_id or "gumroad" in item_id: img_src = "/images/covers/clasicos_vol1.jpg"
        
        # add classes to element
        classes = element.get('class', [])
        if 'flex' not in classes:
            classes.extend(['flex', 'gap-2'])
            element['class'] = classes
            
        # create wrapper for the text
        wrapper = soup.new_tag('div')
        wrapper['class'] = ['flex-1', 'min-w-0']
        
        # move all children into wrapper
        children = [c for c in element.contents]
        for c in children:
            wrapper.append(c.extract())
            
        # create img tag
        img = soup.new_tag('img', src=img_src)
        img['class'] = ['w-12', 'h-12', 'object-cover', 'border', 'border-[var(--circuit)]', 'flex-shrink-0']
        
        element.append(img)
        element.append(wrapper)

# Add thumbnails to all clickable-item in art, press, pedagogy
for win_id in ['win-art', 'win-press', 'win-pedagogy']:
    win = soup.find(id=win_id)
    if win:
        items = win.find_all(class_='clickable-item')
        for item in items:
            add_thumbnail(item)

# Also fix the center logo text which we reverted
logo_node = soup.find(id="center-logo-node")
if logo_node:
    logo_node['class'] = logo_node.get('class', []) + ['cursor-pointer', 'hover:scale-110', 'transition-transform', 'duration-300']
    logo_node['onclick'] = "panTo(2500, 2500);"
    span = logo_node.find('span', class_='center-node-label')
    if span:
        span.decompose()

# Write back
with open('index.html', 'w') as f:
    f.write(str(soup))
