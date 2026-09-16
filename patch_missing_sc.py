import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

missing_urls = [
    "https://soundcloud.com/lao/naafi-pirata-highlights",
    "https://soundcloud.com/lao/hasta-que-te-conoci-lao-bootleg",
    "https://soundcloud.com/lao/vordhosbn-aphex-twin-lao-fix",
    "https://soundcloud.com/lao/fiebre-latina-lao-edit",
    "https://soundcloud.com/lao/culebritica-lao-tool",
    "https://soundcloud.com/lao/trono-de-hierro-lao-tool",
    "https://soundcloud.com/lao/ventura-lao-dub",
    "https://soundcloud.com/lao/clandestino-jungle-fix",
    "https://soundcloud.com/lao/flute-gasp-lao-edit"
]

for url in missing_urls:
    js = js.replace(f'streamPayload: "{url}"', 'streamPayload: "https://soundcloud.com/lao"')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
    
print("Patched missing URLs")
