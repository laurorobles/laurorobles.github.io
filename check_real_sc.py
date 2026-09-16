import re
import urllib.request

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

urls = re.findall(r'streamPayload:\s*"([^"]+soundcloud.com/lao/[^"]+)"', js)
urls = list(set(urls))

missing = []
for url in urls:
    if url == "https://soundcloud.com/lao":
        continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        if "SoundCloud - Hear the world’s sounds" in html or "SoundCloud - Escucha la música" in html:
            # Means it's the generic 404 page
            print(f"[MISSING] {url}")
            missing.append(url)
        else:
            title = re.search(r'<title>([^<]+)</title>', html)
            print(f"[OK] {url} -> {title.group(1) if title else 'Unknown'}")
    except Exception as e:
        print(f"[ERR] {url} : {e}")

print("\nMissing tracks count:", len(missing))
