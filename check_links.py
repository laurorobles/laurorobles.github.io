import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Very crude block parser to extract id and links object
# Since JSON is not strict (JS object), we use regex
items = re.findall(r'"([a-zA-Z0-9_-]+)":\s*\{(.*?)\n        \}', js, re.DOTALL)

print("--- LINK REPORT ---")
for item_id, content in items:
    # Find links block
    links_match = re.search(r'links:\s*\{([^}]+)\}', content)
    if links_match:
        links_text = links_match.group(1).strip()
        print(f"[{item_id}] -> {links_text}")
    else:
        print(f"[{item_id}] -> NO LINKS")

