import urllib.request
import re

with open('src/main.js', 'r') as f:
    js = f.read()

ids = set(re.findall(r'streamPayload:\s*"([A-Za-z0-9_-]{11})"', js))
ids.update(re.findall(r'youtube:\s*"https://www.youtube.com/watch\?v=([A-Za-z0-9_-]{11})"', js))
ids.update(["c6f3BDGNfHI", "cVxSdlLuH1Q"]) # new venice videos

for vid in ids:
    try:
        url = f"https://www.youtube.com/watch?v={vid}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        if 'Video unavailable' in html or 'This video is unavailable' in html:
            print(f"UNAVAILABLE: {vid}")
        else:
            print(f"OK: {vid}")
    except Exception as e:
        print(f"ERROR: {vid} - {e}")
