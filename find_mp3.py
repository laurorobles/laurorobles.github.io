import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# search archive.org for "Amen EP" or "Lao"
search_url = 'https://archive.org/advancedsearch.php?q=Lao+Amen+EP&fl[]=identifier&output=json'
req = urllib.request.Request(search_url)
with urllib.request.urlopen(req, context=ctx) as response:
    data = json.loads(response.read().decode())

docs = data.get('response', {}).get('docs', [])
for doc in docs:
    ident = doc['identifier']
    print(f"Found identifier: {ident}")
    meta_url = f'https://archive.org/metadata/{ident}'
    meta_req = urllib.request.Request(meta_url)
    with urllib.request.urlopen(meta_req, context=ctx) as m_resp:
        m_data = json.loads(m_resp.read().decode())
        for f in m_data.get('files', []):
            if f['name'].endswith('.mp3'):
                print(f"https://archive.org/download/{ident}/{f['name']}")
