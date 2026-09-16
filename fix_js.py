import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace win-player with omni-player for the mobile logic
js = js.replace("getElementById('win-player')", "getElementById('omni-player')")
js = js.replace("const playerWinObj = document.getElementById('win-player')", "const playerWinObj = document.getElementById('omni-player')")

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("JS player ID fixed!")
