import re

with open('src/main.js', 'r') as f:
    js = f.read()

# For atlacoya
atlacoya_gallery = 'gallery: ["/images/projects/atlacoya_1.jpg", "/images/projects/atlacoya_2.png"],\n            details:'
js = js.replace('details: [\n                "Festival: Festival TONO', atlacoya_gallery + ' [\n                "Festival: Festival TONO')

# For venice
venice_gallery = 'gallery: ["/images/projects/culebra_1.png", "/images/projects/culebra_2.png", "/images/projects/culebra_3.png"],\n            details:'
js = js.replace('details: [\n                "Institución: La Biennale', venice_gallery + ' [\n                "Institución: La Biennale')

with open('src/main.js', 'w') as f:
    f.write(js)
