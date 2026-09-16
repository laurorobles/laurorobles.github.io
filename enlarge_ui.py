import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Enlarge windows
replacements = {
    r'id="win-bio" style="top: \d+px; left: \d+px; width: 480px; height: 430px;"': r'id="win-bio" style="top: 2040px; left: 1960px; width: 680px; height: 580px;"',
    r'id="win-radar" style="top: \d+px; left: \d+px; width: 900px; height: 580px;"': r'id="win-radar" style="top: 1980px; left: 1020px; width: 1050px; height: 750px;"',
    r'id="win-music" style="top: \d+px; left: \d+px; width: 560px; height: 460px;"': r'id="win-music" style="top: 2020px; left: 2470px; width: 750px; height: 650px;"',
    r'id="win-mixes" style="top: \d+px; left: \d+px; width: 460px; height: 420px;"': r'id="win-mixes" style="top: 2040px; left: 1470px; width: 650px; height: 550px;"',
    r'id="win-art" style="top: \d+px; left: \d+px; width: 560px; height: 400px;"': r'id="win-art" style="top: 2500px; left: 2470px; width: 750px; height: 550px;"',
    r'id="win-plugins" style="top: \d+px; left: \d+px; width: 520px; height: 430px;"': r'id="win-plugins" style="top: 1560px; left: 2470px; width: 750px; height: 600px;"',
    r'id="win-pedagogy" style="top: \d+px; left: \d+px; width: 460px; height: 460px;"': r'id="win-pedagogy" style="top: 2490px; left: 1470px; width: 650px; height: 600px;"',
    r'id="win-services" style="top: \d+px; left: \d+px; width: 420px; height: 360px;"': r'id="win-services" style="top: 2020px; left: 3060px; width: 600px; height: 500px;"',
    r'id="win-videos" style="top: \d+px; left: \d+px; width: 480px; height: 450px;"': r'id="win-videos" style="top: 1560px; left: 1960px; width: 650px; height: 550px;"',
    r'id="win-oracle" style="top: \d+px; left: \d+px; width: 480px; height: 420px;"': r'id="win-oracle" style="top: 2730px; left: 1960px; width: 650px; height: 550px;"',
    r'id="win-terminal" style="top: \d+px; left: \d+px; width: 560px; height: 350px;"': r'id="win-terminal" style="top: 2320px; left: 2220px; width: 750px; height: 450px;"',
    r'id="win-labyrinth" style="top: \d+px; left: \d+px; width: 440px; height: 340px;"': r'id="win-labyrinth" style="top: 2930px; left: 2470px; width: 600px; height: 450px;"',
    r'id="win-contact" style="top: \d+px; left: \d+px; width: 380px; height: 300px;"': r'id="win-contact" style="top: 2890px; left: 2940px; width: 500px; height: 400px;"',
    r'id="win-sigil" style="top: \d+px; left: \d+px; width: 420px; height: 450px;"': r'id="win-sigil" style="top: 2410px; left: 3060px; width: 600px; height: 550px;"',
    r'id="win-press" style="top: \d+px; left: \d+px; width: 620px; height: 530px;"': r'id="win-press" style="top: 1580px; left: 1470px; width: 850px; height: 700px;"',
}

for old, new in replacements.items():
    html = re.sub(old, new, html)

# Also fix the #win-player to #omni-player bug from earlier!
html = html.replace('#win-player', '#omni-player')
# But wait, omni-player doesn't have class "drag-window", so `.drag-window:not(#omni-player)` is fine.
# Let's double check if omni-player is draggable. In main.js it uses interact.js on #omni-player.

# 2. Enlarge typography.
# We will step up the text-[Xpx] classes by about 4-5px so it's readable.
text_replacements = {
    'text-[7px]': 'text-[10px]',
    'text-[7.5px]': 'text-[10px]',
    'text-[8px]': 'text-[11px]',
    'text-[8.5px]': 'text-[12px]',
    'text-[9px]': 'text-[13px]',
    'text-[9.5px]': 'text-[13px]',
    'text-[10px]': 'text-[14px]',
    'text-[10.5px]': 'text-[14px]',
    'text-[11px]': 'text-[15px]',
    'text-[11.5px]': 'text-[15px]',
    'text-[12px]': 'text-[16px]',
    'text-[12.5px]': 'text-[16px]',
    'text-[13px]': 'text-[17px]',
    'text-[14px]': 'text-[18px]',
}

for old, new in text_replacements.items():
    # Only replace exact class matches
    html = html.replace(old, new)

# And text-xs / text-sm inside windows
# Actually, text-xs is 12px (0.75rem), text-sm is 14px (0.875rem)
# If we replace text-xs with text-sm, and text-sm with text-base it might be better,
# but it's simpler just to do it manually for specific components if needed.
# Since most of the site uses explicitly small sizes (like 8px, 9px, 10px), replacing those will fix 90% of the issues.

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Windows and fonts enlarged in HTML!")
