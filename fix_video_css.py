with open('src/style.css', 'r') as f:
    css = f.read()

# Make video thumbnails wider
css = css.replace('width: 150px; flex-shrink: 0; aspect-ratio: 16/9; overflow: hidden;', 'width: 180px; flex-shrink: 0; aspect-ratio: 16/9; overflow: hidden;')

with open('src/style.css', 'w') as f:
    f.write(css)
