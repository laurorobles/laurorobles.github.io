from PIL import Image

img = Image.open('gumroad_grid.png').convert('RGB')

# Define boxes (left, upper, right, lower)
# Row 1 (y: 49 to 151)
# Col 1: 588 to 690, Col 2: 690 to 799, Col 3: 799 to 908
img.crop((588, 49, 690, 151)).save('public/images/covers/gumroad_real_amen.jpg')
img.crop((690, 49, 799, 151)).save('public/images/covers/gumroad_real_clubcode1.jpg')
img.crop((799, 49, 908, 151)).save('public/images/covers/gumroad_real_capitalwobble.jpg')

# Row 2 (y: 225 to 334)
img.crop((588, 225, 690, 334)).save('public/images/covers/gumroad_real_spectral.jpg')
img.crop((690, 225, 799, 334)).save('public/images/covers/gumroad_real_guaracha.jpg')

# Row 3 (y: 409 to 517)
img.crop((588, 409, 690, 517)).save('public/images/covers/gumroad_real_selvakit.jpg')
img.crop((799, 409, 908, 517)).save('public/images/covers/gumroad_real_clubcode2.jpg')

print("Cropped successfully!")
