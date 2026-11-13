"""One-off: freeze the current forest layout into data the LibreSprite programs draw from.

Reads the legacy forest-ground.png / forest-scenery.png and writes
data/forest-layout.json with:
  - terrain: 64x48 grid of 16px tiles ('g' grass, 'p' path, 'w' water)
  - anchors: per scenery frame, the trunk/foundation base inside its 176x160 cell
Run it only against the legacy art (git show HEAD:public/assets/mundinho/...).
"""
import json
import sys
from pathlib import Path
from PIL import Image

ground_path, scenery_path, geometry_path, out_path = sys.argv[1:5]
TILE = 16
ground = Image.open(ground_path).convert('RGB')
W, H = ground.size
cols, rows = W // TILE, H // TILE


def classify(r, g, b):
    if b > r + 18 and b > g - 10:
        return 'w'
    if r > 140 and g > 110 and b < 130 and r > g:
        return 'p'
    return 'g'


grid = []
for ty in range(rows):
    row = ''
    for tx in range(cols):
        counts = {'g': 0, 'p': 0, 'w': 0}
        for y in range(ty * TILE, ty * TILE + TILE, 2):
            for x in range(tx * TILE, tx * TILE + TILE, 2):
                counts[classify(*ground.getpixel((x, y)))] += 1
        total = sum(counts.values())
        # A tile becomes path/water when that terrain covers a good part of it.
        if counts['w'] >= total * 0.35:
            row += 'w'
        elif counts['p'] >= total * 0.4:
            row += 'p'
        else:
            row += 'g'
    grid.append(row)

geometry = json.loads(Path(geometry_path).read_text(encoding='utf-8'))
sc = geometry['scenery']
sheet = Image.open(scenery_path).convert('RGBA')
anchors = []
for frame in range(sc['columns'] * sc['rows']):
    ox = (frame % sc['columns']) * sc['width']
    oy = (frame // sc['columns']) * sc['height']
    cellimg = sheet.crop((ox, oy, ox + sc['width'], oy + sc['height']))
    alpha = cellimg.split()[3]
    bottom = None
    for y in range(sc['height'] - 1, -1, -1):
        xs = [x for x in range(sc['width']) if alpha.getpixel((x, y)) == 255]
        if xs:
            bottom = (y, xs)
            break
    if bottom is None:
        anchors.append(None)
        continue
    y, xs = bottom
    anchors.append({'x': round(sum(xs) / len(xs)), 'y': y})

objects = {o['frame']: o for o in sc['objects']}
kinds = [objects[f]['id'].rstrip('0123456789-') if f in objects else None for f in range(len(anchors))]
Path(out_path).write_text(
    json.dumps({'tile': TILE, 'cols': cols, 'rows': rows, 'terrain': grid, 'anchors': anchors, 'kinds': kinds}, indent=1),
    encoding='utf-8',
)
print('terrain', {k: sum(r.count(k) for r in grid) for k in 'gpw'}, 'anchors', sum(a is not None for a in anchors))
