from PIL import Image

img = Image.open('/Users/babyonk1/.gemini/antigravity/brain/965d1772-94c6-4911-8587-9dabb4bf174f/.user_uploaded/media_1789490930372.png')
img = img.convert('RGB')
w, h = img.size
pixels = img.load()

# Background color is likely the pixel at (10, 10) or (50, 50)
bg_color = pixels[50, 50]

# We know the images are aligned on the left, probably between x=50 and x=200
# Let's scan columns x=80 to x=150 to find the rows where there's content
def is_different(p1, p2, threshold=15):
    return abs(p1[0]-p2[0]) > threshold or abs(p1[1]-p2[1]) > threshold or abs(p1[2]-p2[2]) > threshold

rows_with_content = []
for y in range(h):
    has_content = False
    for x in range(80, 130):
        if is_different(pixels[x, y], bg_color):
            has_content = True
            break
    rows_with_content.append(has_content)

# Find contiguous blocks of content
blocks = []
in_block = False
start_y = 0
for y in range(h):
    if rows_with_content[y] and not in_block:
        in_block = True
        start_y = y
    elif not rows_with_content[y] and in_block:
        in_block = False
        blocks.append((start_y, y - 1))
if in_block:
    blocks.append((start_y, h - 1))

# A thumbnail is probably a block with a height of roughly 70-80 pixels
thumbs = [b for b in blocks if 60 < (b[1] - b[0]) < 90]

print(f"Found {len(thumbs)} potential thumbnails:")
for i, (y1, y2) in enumerate(thumbs):
    print(f"Thumb {i}: y={y1} to {y2}")
    
    # Now find exact X boundaries for this block
    min_x, max_x = w, 0
    for y in range(y1, y2 + 1):
        for x in range(w):
            if is_different(pixels[x, y], bg_color):
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                
    # We know it's a square image, so let's enforce width = height
    height = y2 - y1 + 1
    # The x coordinate starts around min_x
    # Let's refine min_x by scanning a bit further right if needed, but it's likely min_x
    # Actually, the border might be slightly off. Let's just use (min_x, y1, min_x + height, y2)
    box = (min_x, y1, min_x + height, y2 + 1)
    print(f"  Cropping box: {box}")
    thumb = img.crop(box)
    thumb.save(f'public/images/covers/gumroad_thumb_{i}.jpg')
