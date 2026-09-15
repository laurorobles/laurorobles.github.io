from bs4 import BeautifulSoup
import re

with open('index.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

def extract_year(text):
    match = re.search(r'\b(20\d{2})\b', text)
    if match:
        return int(match.group(1))
    return 0

def sort_container(container_id, selector):
    container = soup.find(id=container_id)
    if not container: return
    items = container.find_all(class_=lambda c: c and selector in c.split(), recursive=False)
    if not items: return
    
    def get_sort_key(item):
        text = item.get_text()
        years = re.findall(r'\b(20\d{2})\b', text)
        if years:
            return max(int(y) for y in years)
        return 0

    sorted_items = sorted(items, key=get_sort_key, reverse=True)
    for item in items:
        item.extract()
    for item in sorted_items:
        container.append(item)

# 1. Art Basel Miami 2016
art_list = soup.find(id='win-art').find('div', class_=lambda c: c and 'space-y-1.5' in c.split())
if not art_list.find(attrs={"data-item-id": "art-basel-miami-2016"}):
    new_art = BeautifulSoup(f"""
    <div class="clickable-item p-1.5 border border-[var(--circuit)] flex gap-2" data-item-id="art-basel-miami-2016">
        <img src="/images/covers/perfil.jpg" class="w-12 h-12 object-cover border border-[var(--circuit)] flex-shrink-0 hidden sm:block">
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
                <span class="inspector-badge text-[7.5px] mb-0.5">SHOWCASE & INSTALACIÓN</span>
                <span class="text-[8px] opacity-75">Miami, USA</span>
            </div>
            <strong class="text-[var(--main)] block text-[10px] mb-0.5">Art Basel Miami (2016) — 12 Hours of NAAFI</strong>
            <p class="opacity-80 text-[8.5px]">Red Bull Music Academy & Sangre.</p>
        </div>
    </div>
    """, 'html.parser').div
    art_list.append(new_art)

# 2. Anahuacalli 2020
if not art_list.find(attrs={"data-item-id": "art-anahuacalli-2020"}):
    new_art2 = BeautifulSoup(f"""
    <div class="clickable-item p-1.5 border border-[var(--circuit)] flex gap-2" data-item-id="art-anahuacalli-2020">
        <img src="/images/covers/perfil.jpg" class="w-12 h-12 object-cover border border-[var(--circuit)] flex-shrink-0 hidden sm:block">
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
                <span class="inspector-badge text-[7.5px] mb-0.5">LIVE PERFORMANCE</span>
                <span class="text-[8px] opacity-75">CDMX</span>
            </div>
            <strong class="text-[var(--accent)] block text-[10px] mb-0.5">Museo Anahuacalli (2020) — Noche de Museos</strong>
            <p class="opacity-80 text-[8.5px]">Cerámica Sónica & Electrónica Prehispánica.</p>
        </div>
    </div>
    """, 'html.parser').div
    art_list.append(new_art2)

# 3. Forbes 2019
press_list = soup.find(id='press-cards-list')
if press_list and not press_list.find(attrs={"data-item-id": "press-forbes-naafi"}):
    new_press = BeautifulSoup(f"""
    <div class="press-card clickable-item flex gap-2" data-categories="all interviews" data-item-id="press-forbes-naafi">
        <img src="/images/covers/perfil.jpg" class="w-12 h-12 object-cover border border-[var(--circuit)] flex-shrink-0 hidden sm:block">
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
                <span class="inspector-badge text-[8px]">ENTREVISTA / REPORTAJE</span>
                <span class="text-[9px] opacity-75">Forbes México</span>
            </div>
            <strong class="text-[var(--accent)] block text-[13px]">Forbes: N.A.A.F.I, La fiesta como periferia infinita (2019)</strong>
            <div class="press-quote">"Impacto de NAAFI en la música global y la reconfiguración de la periferia."</div>
        </div>
    </div>
    """, 'html.parser').div
    press_list.append(new_press)

# Sorting Art
items = art_list.find_all(class_='clickable-item', recursive=False)
if items:
    sorted_items = sorted(items, key=lambda i: max([int(y) for y in re.findall(r'\b(20\d{2})\b', i.get_text())] + [0]), reverse=True)
    for i in items: i.extract()
    for i in sorted_items: art_list.append(i)

# Sort others via function
sort_container('press-cards-list', 'clickable-item')
sort_container('mixes-items-list', 'clickable-item')

with open('index.html', 'w') as f:
    f.write(str(soup))

