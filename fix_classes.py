import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the double class
bad_string = '<button class="hud-action-btn font-bold text-[var(--accent)]" id="mobile-menu-btn" class="md:hidden font-bold text-[var(--accent)] border border-[var(--accent)] px-1.5 py-0.5 hover:bg-[var(--accent)] hover:text-black transition-colors mr-2">'
good_string = '<button id="mobile-menu-btn" class="md:hidden font-bold text-[var(--accent)] border border-[var(--accent)] px-1.5 py-0.5 hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors mr-2">'

html = html.replace(bad_string, good_string)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
