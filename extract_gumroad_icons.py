from PIL import Image

img = Image.open('gumroad_grid.png').convert('RGB')
w, h = img.size
pixels = img.load()

# To reliably find the images, let's find the colored pixels!
# The background is white/light gray. The borders are gray/black. 
# The icons themselves are colorful (green, yellow, etc.)
# Let's find bounding boxes of colorful regions.

def is_colorful(p):
    r, g, b = p
    # if it's not grayscale (max - min > 30) and it's not too dark
    return max(r, g, b) - min(r, g, b) > 30 and sum(p) > 100

colorful_pixels = []
for y in range(h):
    for x in range(w):
        if is_colorful(pixels[x, y]):
            colorful_pixels.append((x, y))

# Group them into clusters (bounding boxes)
boxes = []
for x, y in colorful_pixels:
    # check if it belongs to an existing box
    found = False
    for i, b in enumerate(boxes):
        bx, by, bw, bh = b
        # distance threshold 50 pixels
        if bx - 50 <= x <= bx + bw + 50 and by - 50 <= y <= by + bh + 50:
            # expand box
            new_bx = min(bx, x)
            new_by = min(by, y)
            new_max_x = max(bx + bw, x)
            new_max_y = max(by + bh, y)
            boxes[i] = (new_bx, new_by, new_max_x - new_bx, new_max_y - new_by)
            found = True
            break
    if not found:
        boxes.append((x, y, 1, 1))

# Merge overlapping/close boxes
merged = True
while merged:
    merged = False
    new_boxes = []
    while len(boxes) > 0:
        b1 = boxes.pop(0)
        bx1, by1, bw1, bh1 = b1
        merged_with_something = False
        for i, b2 in enumerate(boxes):
            bx2, by2, bw2, bh2 = b2
            if not (bx1 + bw1 + 50 < bx2 or bx2 + bw2 + 50 < bx1 or by1 + bh1 + 50 < by2 or by2 + bh2 + 50 < by1):
                # merge
                new_bx = min(bx1, bx2)
                new_by = min(by1, by2)
                new_max_x = max(bx1 + bw1, bx2 + bw2)
                new_max_y = max(by1 + bh1, by2 + bh2)
                boxes[i] = (new_bx, new_by, new_max_x - new_bx, new_max_y - new_by)
                merged = True
                merged_with_something = True
                break
        if not merged_with_something:
            new_boxes.append(b1)
    boxes = new_boxes

# Filter small boxes
boxes = [b for b in boxes if b[2] > 40 and b[3] > 40]

print(f"Found {len(boxes)} icon regions")

# Sort by Y then X
boxes.sort(key=lambda b: (b[1] // 100, b[0]))

for i, b in enumerate(boxes):
    print(f"Icon {i}: {b}")
    bx, by, bw, bh = b
    
    # We want a nice square crop centered around the icon.
    # Gumroad image areas are perfectly square. 
    # Let's find the card borders containing this icon.
    # Search left for dark border
    cx, cy = bx + bw//2, by + bh//2
    left = bx
    while left > 0 and sum(pixels[left, cy]) > 400: left -= 1
    right = bx + bw
    while right < w-1 and sum(pixels[right, cy]) > 400: right += 1
    top = by
    while top > 0 and sum(pixels[cx, top]) > 400: top -= 1
    bottom = by + bh
    # card images are usually at the top of the card. The border below the image is also dark.
    while bottom < h-1 and sum(pixels[cx, bottom]) > 400: bottom += 1
    
    # Let's just crop a square of size (right - left)
    card_w = right - left
    # Actually, the border might be light gray. 
    # Let's just use the colorful box and pad it by 15% to make it square!
    side = max(bw, bh) + 30
    cx, cy = bx + bw//2, by + bh//2
    crop_box = (cx - side//2, cy - side//2, cx + side//2, cy + side//2)
    thumb = img.crop(crop_box)
    thumb.save(f'public/images/covers/gumroad_real_{i}.jpg')
