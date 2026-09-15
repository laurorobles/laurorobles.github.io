with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Align #dock-menu, #omni-player, #btn-return-origin
css = css.replace('bottom: 44px; right: 12px;', 'bottom: 12px; right: 12px;')
css = css.replace('bottom: 44px; left: 12px;', 'bottom: 12px; left: 12px;')
css = css.replace('bottom: 8px; left: 50%; transform: translateX(-50%);', 'bottom: 12px; left: 50%; transform: translateX(-50%);')

# Add matrix-flash animation
flash_css = """
@keyframes matrix-flash {
  0% { filter: invert(1) hue-rotate(180deg) brightness(2); transform: scale(1.02); }
  50% { filter: invert(0) hue-rotate(90deg) brightness(1.5); }
  100% { filter: none; transform: scale(1); }
}
.matrix-flash-active {
  animation: matrix-flash 0.6s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
}
"""
css += flash_css

with open('src/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
