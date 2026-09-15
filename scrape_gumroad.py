import urllib.request
from bs4 import BeautifulSoup
import json
import re

url = "https://laurorobles.gumroad.com/"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    
    # Gumroad uses Inertia.js, so the data is in data-page attribute
    soup = BeautifulSoup(html, 'html.parser')
    div = soup.find('div', id='app')
    if div and div.has_attr('data-page'):
        data = json.loads(div['data-page'])
        products = data.get('props', {}).get('products', [])
        for p in products:
            print(f"Product: {p.get('name')} | Image: {p.get('preview_url')}")
    else:
        print("Couldn't find Inertia data.")
        # Try regex
        urls = re.findall(r'"preview_url":"(https://[^"]+)"', html)
        names = re.findall(r'"name":"([^"]+)"', html)
        for i in range(min(len(urls), len(names))):
            print(f"Product: {names[i]} | Image: {urls[i]}")

except Exception as e:
    print("Error:", e)
