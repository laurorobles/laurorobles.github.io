import re
import urllib.request
import urllib.error

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Extract all soundcloud.com URLs
sc_urls = re.findall(r'(https://soundcloud\.com/[^\s"\'\]\}]+)', js)
sc_urls = list(set(sc_urls))

for url in sc_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"[OK] {url}")
    except urllib.error.HTTPError as e:
        print(f"[404] {url}")
    except Exception as e:
        print(f"[ERR] {url} : {e}")
