"""Preview composed heroes: python preview-hero.py <out.png> [attack]

Rows: several (skin, female, outfit, eyes, hair style, hair color, accessory) combos.
Columns: the 4 directions at frame 0, then the 8 walk (or attack) frames facing down.
"""
import sys
from PIL import Image

base = 'public/assets/mundinho/'
out_path = sys.argv[1]
attack = len(sys.argv) > 2 and sys.argv[2] == 'attack'
layers = {name: Image.open(f'{base}hero-{name}.png').convert('RGBA') for name in
          ['body', 'body-attack', 'outfit', 'outfit-attack', 'eyes', 'hair', 'accessory']}
combos = [
    (0, False, 0, 0, 0, 0, 0),
    (2, True, 1, 1, 4, 2, 1),
    (8, False, 3, 2, 3, 0, 3),
    (5, True, 5, 3, 5, 5, 5),
    (6, False, 7, 4, 1, 1, 4),
    (3, True, 10, 2, 2, 4, 2),
]


def tile(name, value, d, f):
    return layers[name].crop((f * 32, (value * 4 + d) * 32, f * 32 + 32, (value * 4 + d) * 32 + 32))


def hero(combo, d, f):
    skin, female, outfit, eyes, style, color, acc = combo
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    body = 'body-attack' if attack else 'body'
    clothes = 'outfit-attack' if attack else 'outfit'
    for name, value in [(body, skin + (9 if female else 0)), (clothes, outfit),
                        ('eyes', eyes + (5 if female else 0)), ('hair', style * 6 + color), ('accessory', acc)]:
        img.alpha_composite(tile(name, value, d, f))
    return img


sheet = Image.new('RGBA', (32 * 12, 32 * len(combos)), (26, 122, 62, 255))
for row, combo in enumerate(combos):
    for d in range(4):
        sheet.alpha_composite(hero(combo, d, 0), (d * 32, row * 32))
    for f in range(8):
        sheet.alpha_composite(hero(combo, 0 if not attack else 1, f), ((4 + f) * 32, row * 32))
sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(out_path)
