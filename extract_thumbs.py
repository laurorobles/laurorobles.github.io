from PIL import Image

img = Image.open('/Users/babyonk1/.gemini/antigravity/brain/965d1772-94c6-4911-8587-9dabb4bf174f/.user_uploaded/media_1789490930372.png')
# Convert to RGB just in case
img = img.convert('RGB')
w, h = img.size

# We need to find the 5 square images. 
# They all have the same x-coordinate and are roughly the same size.
# They are bordered by a circuit color (var(--circuit)) or they are just squares.
# Let's search for a vertical column of pixels that has high variance (the images).
# Or just use the known layout. The window is centered.
# We can just crop out 5 regions and save them as A, B, C, D, E and I can inspect them.
# The layout looks like:
# Image 1 is around y=250?
# Let's just crop 10 squares along the left side.
# Let's use a simpler heuristic: find all pixels that are #00ffff (the cyan text)? No.
# Instead of guessing coords, I will use OpenCV or skimage if available? No, PIL is fine.

# Let's just output some regions:
for i in range(5):
    # Rough guess of Y coordinates based on typical spacing.
    # Total height 937. The list starts maybe around 25% down.
    # Height of each row is about 130px.
    # Image size is about 70x70.
    y_start = 245 + i * 135
    box = (100, y_start, 175, y_start + 75)
    thumb = img.crop(box)
    thumb.save(f'public/images/covers/thumb_{i}.jpg')
