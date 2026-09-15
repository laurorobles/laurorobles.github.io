import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://archive.org/metadata/filtro016')
with urllib.request.urlopen(req, context=ctx) as response:
    data = json.loads(response.read().decode())

mp3_files = [f for f in data.get('files', []) if f['name'].endswith('.mp3')]
if mp3_files:
    print(f"https://archive.org/download/filtro016/{mp3_files[0]['name']}")
else:
    print("No MP3s found")
