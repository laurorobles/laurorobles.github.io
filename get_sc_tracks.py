import urllib.request
import re

url = "https://soundcloud.com/lao"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    # Soundcloud HTML has links to tracks
    tracks = re.findall(r'<a itemprop="url" href="([^"]+)">([^<]+)</a>', html)
    print("Found tracks on profile:")
    for t in tracks:
        print(t)
    
    # Let's also look for all hrefs that contain /lao/
    links = set(re.findall(r'href="(/lao/[^"]+)"', html))
    print("All /lao/ links:")
    for l in links:
        print(l)
except Exception as e:
    print(f"Error: {e}")
