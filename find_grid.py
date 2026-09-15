from PIL import Image

img = Image.open('gumroad_grid.png').convert('RGB')
w, h = img.size
pixels = img.load()

# Find horizontal lines of the grid
row_ys = []
for y in range(h):
    # A grid line is dark gray on a white background
    dark_count = 0
    for x in range(550, 950):
        if sum(pixels[x, y]) < 650:
            dark_count += 1
    if dark_count > 300: # almost solid dark line
        if not row_ys or y - row_ys[-1] > 10:
            row_ys.append(y)
            
col_xs = []
for x in range(w):
    dark_count = 0
    for y in range(50, 500):
        if sum(pixels[x, y]) < 650:
            dark_count += 1
    if dark_count > 400:
        if not col_xs or x - col_xs[-1] > 10:
            col_xs.append(x)
            
print("Row Ys:", row_ys)
print("Col Xs:", col_xs)
