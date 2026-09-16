import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I will replace the incorrect URLs with the correct ones we scraped!
replacements = {
    # Tejido Tropico
    r'streamPayload:\s*"https://soundcloud.com/lao/tejido-tropico-lao-edit"': 'streamPayload: "https://soundcloud.com/lao/tejido-tropico"',
    r'title:\s*"Tejido Trópico \(Lao Edit\)"': 'title: "Tejido Trópico"',
    
    # Wave Mambo
    r'streamPayload:\s*"https://soundcloud.com/lao/wave-mambo-lao-fix"': 'streamPayload: "https://soundcloud.com/lao/100-wave-mambo-v1"',
    
    # Belinda Jackpot
    r'streamPayload:\s*"https://soundcloud.com/lao/belinda-jackpot-lao-remix"': 'streamPayload: "https://soundcloud.com/lao/belinda-ft-kenia-os-jackpot"',
    
    # Haddaway
    r'streamPayload:\s*"https://soundcloud.com/lao/haddaway-what-is-love-lao-edit"': 'streamPayload: "https://soundcloud.com/lao/haddaway-what-is-love-lao"',
    
    # Escuadron del Ritmo
    r'streamPayload:\s*"https://soundcloud.com/lao/escuadron-del-ritmo-lao-club-tool"': 'streamPayload: "https://soundcloud.com/lao/escuadron-del-ritmo"',
    
    # Sophie BIPP
    r'streamPayload:\s*"https://soundcloud.com/lao/sophie-bipp-lao-pirata-edit"': 'streamPayload: "https://soundcloud.com/lao/sophie-bipp-lao-bootleg"',
    
    # Yeyo Jungle (remove duplicate /2026 if it exists)
    r'streamPayload:\s*"https://soundcloud.com/lao/yeyojungle-2026-bootleg"': 'streamPayload: "https://soundcloud.com/lao/yeyojungle-lao-bootleg"'
}

for old, new in replacements.items():
    js = re.sub(old, new, js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Replaced known good URLs")
