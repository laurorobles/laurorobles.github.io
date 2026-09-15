from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

new_item = BeautifulSoup("""
<div class="clickable-item flex items-center gap-3 p-2 bg-[#030006] border border-[#1e2844] hover:border-[#00FFFF] transition-colors group cursor-pointer mb-2" data-item-id="art-naafi-2014">
  <div class="w-16 h-16 flex-shrink-0 bg-black overflow-hidden border border-[#1e2844]">
    <img src="/images/covers/naafi_2014.webp" alt="NAAFI 2014 Tour" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy">
  </div>
  <div class="flex-1 min-w-0">
    <div class="flex justify-between items-start mb-1">
      <span class="text-[9px] font-mono text-[#E6007A] bg-[#E6007A]/10 px-1 border border-[#E6007A]/30">2014</span>
    </div>
    <div class="text-[12px] font-bold text-[#00FFFF] truncate mb-0.5 group-hover:text-white transition-colors">NAAFI USA Tour (Paul Marmota, Lao, Mexican Jihad)</div>
    <div class="text-[10px] text-white/70 truncate mb-1">Costa Oeste USA / San Diego, LA, SF, Portland</div>
    <div class="text-[9px] text-[#00FFFF]/50 truncate">GIRA INTERNACIONAL & SHOWCASES</div>
  </div>
</div>
""", 'html.parser')

art_list = soup.find(id="art-items-list")
if art_list:
    # Insert it chronologically (2014).
    # Find the right spot or just append it and then we will sort.
    art_list.append(new_item)

with open('index.html', 'w') as f:
    f.write(str(soup))
