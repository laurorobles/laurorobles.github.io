import urllib.request
import re
import json

url = "https://laurorobles.gumroad.com/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

# Search for product image URLs
# The JSON might be in data-page attribute of <div id="app">
match = re.search(r'data-page="([^"]+)"', html)
if match:
    import html as html_lib
    data_str = html_lib.unescape(match.group(1))
    data = json.loads(data_str)
    products = data.get('props', {}).get('products', [])
    for p in products:
        print(f"ID: {p.get('id')} | Name: {p.get('name')} | Preview: {p.get('preview_url')}")
else:
    print("No data-page found.")
