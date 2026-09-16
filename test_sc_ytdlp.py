import re
import subprocess
import time

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

urls = re.findall(r'streamPayload:\s*"([^"]+soundcloud.com[^"]+)"', js)
urls = [u for u in urls if 'w.soundcloud.com' not in u]

print(f"Testing {len(urls)} URLs with yt-dlp...")
for url in urls:
    try:
        # Just fetch metadata
        res = subprocess.run(['yt-dlp', '--dump-json', '--playlist-items', '1', url], capture_output=True, text=True, timeout=10)
        if res.returncode == 0:
            print(f"[EXISTS] {url}")
        else:
            print(f"[MISSING/ERROR] {url}")
    except Exception as e:
        print(f"[ERR] {url} : {e}")
    time.sleep(1) # avoid rate limit
