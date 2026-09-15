from bs4 import BeautifulSoup
import json
import re

# 1. Update index.html
with open('index.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Update Atlacoya image
atlacoya_items = soup.find_all(attrs={"data-item-id": "art-tono-atlacoya"})
for item in atlacoya_items:
    img = item.find('img')
    if img:
        img['src'] = '/images/projects/atlacoya_1.jpg'

# Update Venice image
venice_items = soup.find_all(attrs={"data-item-id": "art-bienal-venecia"})
for item in venice_items:
    img = item.find('img')
    if img:
        img['src'] = '/images/projects/culebra_1.png'

# Add the two YouTube videos to win-videos
video_list = soup.find(id='video-items-list')
if video_list:
    # Check if they exist
    if not video_list.find(attrs={"data-yt-id": "c6f3BDGNfHI"}):
        new_video_1 = BeautifulSoup(f"""
        <div class="video-card clickable-item" data-item-id="video-venice-1" data-yt-id="c6f3BDGNfHI" data-yt-title="Lao | La Culebra en Bienal de Venecia 2024 (1)">
            <div class="video-thumb-wrap">
                <img alt="La Culebra Venice 1" class="video-thumb-img" loading="lazy" src="https://img.youtube.com/vi/c6f3BDGNfHI/hqdefault.jpg"/>
                <span class="video-duration">PERFORMANCE</span>
            </div>
            <div class="video-info">
                <div class="flex justify-between items-center mb-0.5">
                    <span class="video-badge-tag">BIENAL DE VENECIA</span>
                    <span class="text-[9.5px] opacity-70 font-mono">2024</span>
                </div>
                <strong class="video-title text-[var(--accent)] block text-[12.5px]">Lao | La Culebra (Bienal de Venecia 2024) - Pt. 1</strong>
                <p class="video-desc text-[11px] opacity-80">Registro en vivo del performance de clausura en el Arsenale.</p>
                <div class="mt-1 flex justify-end">
                    <a class="text-[10.5px] text-[var(--main)] font-bold hover:underline" href="https://www.youtube.com/watch?v=c6f3BDGNfHI" target="_blank">[ VER EN YOUTUBE ↗ ]</a>
                </div>
            </div>
        </div>
        """, 'html.parser').div
        video_list.insert(0, new_video_1)

    if not video_list.find(attrs={"data-yt-id": "cVxSdlLuH1Q"}):
        new_video_2 = BeautifulSoup(f"""
        <div class="video-card clickable-item" data-item-id="video-venice-2" data-yt-id="cVxSdlLuH1Q" data-yt-title="Lao | La Culebra en Bienal de Venecia 2024 (2)">
            <div class="video-thumb-wrap">
                <img alt="La Culebra Venice 2" class="video-thumb-img" loading="lazy" src="https://img.youtube.com/vi/cVxSdlLuH1Q/hqdefault.jpg"/>
                <span class="video-duration">PERFORMANCE</span>
            </div>
            <div class="video-info">
                <div class="flex justify-between items-center mb-0.5">
                    <span class="video-badge-tag">BIENAL DE VENECIA</span>
                    <span class="text-[9.5px] opacity-70 font-mono">2024</span>
                </div>
                <strong class="video-title text-[var(--accent)] block text-[12.5px]">Lao | La Culebra (Bienal de Venecia 2024) - Pt. 2</strong>
                <p class="video-desc text-[11px] opacity-80">Registro en vivo del performance de clausura en el Arsenale.</p>
                <div class="mt-1 flex justify-end">
                    <a class="text-[10.5px] text-[var(--main)] font-bold hover:underline" href="https://www.youtube.com/watch?v=cVxSdlLuH1Q" target="_blank">[ VER EN YOUTUBE ↗ ]</a>
                </div>
            </div>
        </div>
        """, 'html.parser').div
        video_list.insert(0, new_video_2)

# Write back index.html
with open('index.html', 'w') as f:
    f.write(str(soup))

# 2. Update src/main.js
with open('src/main.js', 'r') as f:
    js = f.read()

# Update cover logic
js = js.replace('cover: "/images/covers/sendero.jpg",\n            desc: "Creación conceptual y diseño sonoro inmersivo para la ópera experimental', 'cover: "/images/projects/atlacoya_1.jpg",\n            desc: "Creación conceptual y diseño sonoro inmersivo para la ópera experimental')
js = js.replace('cover: "/images/covers/chapultepec.jpg",\n            desc: "Dirección y composición musical para el performance oficial de clausura', 'cover: "/images/projects/culebra_1.png",\n            desc: "Dirección y composición musical para el performance oficial de clausura')

# Make absolutely sure terminal dimensions are fixed
# Also make sure the windows are NOT hidden manually
# Wait, my fix earlier changed win-terminal sizes. Let's make sure win-terminal text is really 13/14px. I already did that in index.html.

with open('src/main.js', 'w') as f:
    f.write(js)

