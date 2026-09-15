import re
from bs4 import BeautifulSoup

# 1. Add to HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

forbes_html = """
<div class="press-card clickable-item" data-item-id="press-forbes">
<div class="press-date-line">
<span class="inspector-badge text-[7px]">FORBES</span>
<span class="text-[8px] opacity-75 font-mono">2016</span>
</div>
<div class="flex gap-2">
<img alt="Forbes" class="w-10 h-10 object-cover border border-[var(--circuit)] flex-shrink-0" loading="lazy" src="/images/covers/perfil.jpg">
<div>
<strong class="text-[var(--main)] block text-[10.5px]">N.A.A.F.I: La fiesta perif&eacute;rica infinita</strong>
<p class="opacity-80 text-[9px] mt-0.5">Forbes M&eacute;xico analiza el impacto cultural del colectivo.</p>
</div>
</div>
</div>
"""

# Insert it inside #press-items-list
soup = BeautifulSoup(html, 'html.parser')
press_list = soup.find(id='press-items-list')
if press_list:
    forbes_soup = BeautifulSoup(forbes_html, 'html.parser')
    press_list.insert(0, forbes_soup.div) # Insert at top
    
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(soup.encode(formatter="html5").decode('utf-8'))

# 2. Add to JS
with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

forbes_js = """        "press-forbes": {
            id: "press-forbes",
            title: "N.A.A.F.I: La fiesta periférica infinita",
            subtitle: "Forbes México",
            type: "ARTÍCULO DE PRENSA",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Reportaje especial en Forbes México sobre el crecimiento y modelo autogestivo del colectivo NAAFI. Analizan cómo transformaron la periferia musical de la Ciudad de México en un movimiento global de club.",
            details: [
                "Publicación: Forbes México",
                "Fecha: 2016",
                "Temas: Modelo de negocio, música independiente, globalización cultural"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                web: "https://forbes.com.mx/n-a-a-f-i-la-fiesta-periferia-infinita/"
            }
        },
"""

# Insert before "press-duro-2022"
js = js.replace('"press-duro-2022": {', forbes_js + '\n        "press-duro-2022": {')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
