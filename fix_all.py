import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Sets thumbnails and dates
# Anahuacalli
js = js.replace('id: "art-anahuacalli-2020"', 'id: "art-anahuacalli-2022"')
js = js.replace('Museo Anahuacalli: Noche de Museos (2020)', 'Museo Anahuacalli: Noche de Museos (2022)')
js = js.replace('year: "2020"', 'year: "2022"')
js = js.replace('Fecha: Enero 2020', 'Fecha: 21 de enero de 2022')
html = html.replace('data-item-id="art-anahuacalli-2020"', 'data-item-id="art-anahuacalli-2022"')
html = html.replace('Museo Anahuacalli (2020)', 'Museo Anahuacalli (2022)')
html = html.replace('Noche de Museos', '21 Enero 2022')

# 2. Atlacoya & La Culebra descriptions
atlacoya_desc_old = 'Obra colaborativa multidisciplinaria que entrelaza la escultura prehispánica con la síntesis digital interactiva.'
atlacoya_desc_new = 'Obra colaborativa multidisciplinaria que entrelaza la escultura prehispánica con la síntesis digital interactiva. Concepto e idea original de Lauro Robles.'
js = js.replace(atlacoya_desc_old, atlacoya_desc_new)

culebra_desc_old = 'Evolución del concepto de escultura sónica. Una estructura serpenteante de resonadores acústicos que reaccionan a estímulos electromagnéticos.'
culebra_desc_new = 'Evolución del concepto de escultura sónica. Una estructura serpenteante de resonadores acústicos que reaccionan a estímulos electromagnéticos. Derivado conceptual con idea original de Lauro Robles.'
js = js.replace(culebra_desc_old, culebra_desc_new)

# 3. DSP links (remove bandcamp, add gumroad)
js = js.replace('bc: "https://extasisrecords.bandcamp.com"', 'gumroad: "https://laurorobles.gumroad.com"')
# We also have streamType: null so they don't load in omni-player, which is fine. But wait, in html we have <a href="https://extasisrecords.bandcamp.com">
html = re.sub(r'href="https://extasisrecords\.bandcamp\.com"[^>]*>BC &nearrow;</a>', r'href="https://laurorobles.gumroad.com" target="_blank">GUMROAD ↗</a>', html)
# Let's just make sure all plugin links point to gumroad instead of BC
html = html.replace('>BC ↗</a>', '>GUMROAD ↗</a>') # Wait, this will change music links too!
# Instead, target only the DSP section. I'll do this carefully in JS.

# 4. Venice Videos instead of Deconstrucción
duro_old = r'"tut-duro-masterclass":\s*\{.*?"tut-latin-rhythms":\s*\{.*?\}'

venice_new = """        "venice-2024-pt1": {
            id: "venice-2024-pt1",
            title: "Live Act — Biennale di Venezia 2024 (Pt. 1)",
            subtitle: "Presentación en Pabellón / Asistente Cam",
            type: "LIVE PERFORMANCE",
            year: "2024",
            cover: "https://img.youtube.com/vi/c6f3BDGNfHI/hqdefault.jpg",
            desc: "Registro en video tomado por un asistente durante la presentación en vivo de Lauro Robles en Venecia 2024, entrelazando síntesis modular y secuencias percusivas.",
            details: [
                "Lugar: Biennale di Venezia 2024",
                "Formato: Live Act Hardware"
            ],
            streamType: "youtube",
            streamPayload: "c6f3BDGNfHI",
            links: {
                youtube: "https://www.youtube.com/watch?v=c6f3BDGNfHI"
            }
        },
        "venice-2024-pt2": {
            id: "venice-2024-pt2",
            title: "Live Act — Biennale di Venezia 2024 (Pt. 2)",
            subtitle: "Presentación en Pabellón / Asistente Cam",
            type: "LIVE PERFORMANCE",
            year: "2024",
            cover: "https://img.youtube.com/vi/cVxSdlLuH1Q/hqdefault.jpg",
            desc: "Segunda parte del registro en video de la presentación en Venecia 2024.",
            details: [
                "Lugar: Biennale di Venezia 2024",
                "Formato: Live Act Hardware"
            ],
            streamType: "youtube",
            streamPayload: "cVxSdlLuH1Q",
            links: {
                youtube: "https://www.youtube.com/watch?v=cVxSdlLuH1Q"
            }
        }"""
js = re.sub(duro_old, venice_new, js, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
