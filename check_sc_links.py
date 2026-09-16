import re
import urllib.request
import urllib.error

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# find all soundcloud URLs in streamPayload
urls = re.findall(r'streamPayload:\s*"([^"]+soundcloud[^"]+)"', js)
# also look at links: { sc: "..." } if they are track-specific
sc_links = re.findall(r'sc:\s*"([^"]+)"', js)

all_urls = set(urls + sc_links)
print(f"Testing {len(all_urls)} soundcloud URLs...")

for url in all_urls:
    if url == "https://soundcloud.com/lao":
        continue # main profile is fine
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"[OK] {url}")
    except urllib.error.HTTPError as e:
        print(f"[ERROR {e.code}] {url}")
    except Exception as e:
        print(f"[ERROR] {url} : {e}")

