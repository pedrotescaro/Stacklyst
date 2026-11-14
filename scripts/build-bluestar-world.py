"""Compose the BlueStar world from the owner's extracted tiles. Run from repo root."""

import json
import math
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SRC = Path("artifacts/mundinho/bluestar-source")
OUT = Path("public/assets/mundinho")
N = Image.Resampling.NEAREST
rng = random.Random(3127)


def load(name):
    return Image.open(SRC / (name + ".png")).convert("RGBA")


def blank(w, h):
    return Image.new("RGBA", (w, h))


def save(im, name):
    im.save(OUT / ("blue-" + name + ".png"), optimize=True)


def scaled(im, size):
    return im.resize(size, N)


def ellipse(draw, xy, color):
    draw.ellipse(xy, fill=color)


def poly(draw, xy, color):
    draw.polygon(xy, fill=color)


def pasted(im, sprite, x, y):
    im.alpha_composite(sprite, (int(x), int(y)))


def tree(seed):
    r = random.Random(seed)
    im = blank(80, 76)
    d = ImageDraw.Draw(im)
    poly(
        d,
        [
            (32, 74),
            (35, 53),
            (32, 43),
            (44, 42),
            (42, 60),
            (47, 74),
            (42, 71),
            (37, 73),
        ],
        "#423129",
    )
    d.line([(37, 69), (39, 51), (36, 44)], fill="#926745", width=2)
    for cx, cy, rx, ry in [
        (31, 43, 21, 16),
        (51, 40, 20, 16),
        (23, 32, 17, 16),
        (40, 22, 23, 20),
        (53, 29, 16, 16),
    ]:
        ellipse(d, (cx - rx, cy - ry, cx + rx, cy + ry), "#203f33")
        ellipse(d, (cx - rx + 2, cy - ry + 1, cx + rx - 1, cy + ry - 4), "#2c623c")
        ellipse(d, (cx - rx + 2, cy - ry + 1, cx + rx - 4, cy + ry - 8), "#4b893d")
        for _ in range(18):
            a = r.uniform(0, 6.28)
            v = r.random() ** 0.6
            xx = int(cx - 3 + math.cos(a) * (rx - 5) * v)
            yy = int(cy - 4 + math.sin(a) * (ry - 7) * v)
            col = r.choice(["#619f40", "#77b646", "#90cb51"]) if yy < cy else "#417b3f"
            d.line([(xx - 2, yy + 1), (xx, yy), (xx + 2, yy)], fill=col, width=2)
    return im


def cabin():
    im = blank(88, 80)
    d = ImageDraw.Draw(im)
    d.rectangle((12, 45, 76, 77), fill="#44283a")
    d.rectangle((15, 46, 73, 74), fill="#cf8950")
    for y in [49, 58, 67]:
        d.line((15, y, 73, y), fill="#c07d49")
    for x in [15, 71]:
        d.rectangle((x, 46, x + 2, 76), fill="#764433")
    d.rectangle((12, 75, 77, 78), fill="#634739")
    for x in [19, 58]:
        d.rectangle((x - 2, 53, x + 11, 65), fill="#724134")
        d.rectangle((x, 54, x + 9, 63), fill="#40394c")
        d.rectangle((x + 1, 55, x + 8, 58), fill="#e4b584")
        d.line((x + 4, 54, x + 4, 63), fill="#875841")
        d.line((x, 59, x + 9, 59), fill="#926044")
        d.line((x - 2, 65, x + 11, 65), fill="#f0ae67")
    d.rectangle((35, 52, 52, 77), fill="#6d3931")
    d.rectangle((38, 54, 49, 76), fill="#af653c")
    for x in (39, 44, 48):
        d.line((x, 55, x, 75), fill="#925232")
    d.point((47, 65), fill="#f6cd7e")
    # Stepped rows of overlapping curved clay tiles, cropped to a pitched roof.
    roof = blank(88, 80)
    rd = ImageDraw.Draw(roof)
    for y in range(3, 50, 6):
        for x in range(-12 + (y // 6 % 2) * 5, 90, 10):
            poly(
                rd,
                [(x + 3, y), (x + 10, y), (x + 9, y + 6), (x + 5, y + 8), (x, y + 7)],
                "#612336",
            )
            poly(
                rd,
                [
                    (x + 4, y),
                    (x + 9, y),
                    (x + 7, y + 5),
                    (x + 4, y + 6),
                    (x + 1, y + 5),
                ],
                rng.choice(["#cb3d50", "#b53450", "#d54a54"]),
            )
            rd.line((x + 4, y + 1, x + 2, y + 4), fill="#f17370")
    mask = Image.new("L", im.size)
    md = ImageDraw.Draw(mask)
    md.polygon([(15, 5), (69, 5), (85, 48), (83, 50), (3, 50)], fill=255)
    im.paste(roof, (0, 0), mask)
    poly(d, [(20, 49), (44, 27), (68, 49)], "#593241")
    poly(d, [(25, 48), (44, 31), (63, 48)], "#d99957")
    d.line((28, 46, 44, 32, 60, 46), fill="#93563d", width=2)
    d.rectangle((40, 37, 48, 46), fill="#663b3b")
    d.rectangle((42, 39, 46, 43), fill="#efc68e")
    return im


def terrain():
    layout = json.load(open("scripts/mundinho-sprites/data/forest-layout.json"))
    tiles = layout["terrain"]
    w, h = 512, 384
    ground = Image.new("RGBA", (w, h), "#499d36")
    d = ImageDraw.Draw(ground)
    grass = load("ts_grama-flat")
    for y in range(0, h, 16):
        for x in range(0, w, 16):
            i = rng.choice([1, 1, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 20, 21])
            # Seven columns of contiguous reference meadow in the upper tile rows.
            col = i % 7
            row = i // 7
            tile = grass.crop((col * 16, row * 16, col * 16 + 16, row * 16 + 16))
            if row or col:
                pasted(ground, tile, x, y)
    for typ, edge, fill in [("p", "#bd824e", "#e4ad70"), ("w", "#d1b274", "#4184af")]:
        mask = Image.new("L", (w, h))
        mm = ImageDraw.Draw(mask)
        for y, line in enumerate(tiles):
            for x, ch in enumerate(line):
                if ch == typ:
                    mm.rectangle((x * 8, y * 8, x * 8 + 7, y * 8 + 7), fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(3)).point(
            lambda v: 255 if v >= 124 else 0
        )
        ground.paste(edge, (0, 0, w, h), mask.filter(ImageFilter.MaxFilter(3)))
        ground.paste(fill, (0, 0, w, h), mask)
        inner = mask.filter(ImageFilter.MinFilter(5))
        if typ == "w":
            ground.paste("#325f9b", (0, 0, w, h), inner)
        for _ in range(5000 if typ == "p" else 1500):
            x, y = rng.randrange(w), rng.randrange(h)
            if inner.getpixel((x, y)):
                d.line(
                    (x, y, x + rng.choice([1, 2, 4]), y),
                    fill=rng.choice(
                        ["#d59d63", "#edba7d"] if typ == "p" else ["#4d83b4", "#3c70a9"]
                    ),
                )
    flowers = load("spr_tile_flores")
    stones = load("spr_tile_pedra")
    for _ in range(52):
        x, y = rng.randrange(15, w - 16), rng.randrange(10, h - 16)
        if tiles[y // 8][x // 8] != "g":
            continue
        strip = stones if x % 5 == 0 else flowers
        col = rng.randrange(strip.width // 16) * 16
        # Preserve the random draws, but stones now have complete 32px cells
        # and explicit positions shared by rendering and collision geometry.
        if strip is flowers:
            pasted(ground, strip.crop((col, 0, col + 16, 16)), x - 8, y - 8)
    # A planted kitchen garden beside the guide's cottage.
    garden = load("TileSet9-flat")
    for x, y in [
        (297, 114),
        (306, 114),
        (315, 114),
        (297, 123),
        (306, 123),
        (315, 123),
    ]:
        d.rectangle((x - 4, y - 2, x + 4, y + 3), fill="#bc824a")
        d.line((x - 4, y + 3, x + 4, y + 3), fill="#97633e")
        crop = garden.crop((16, 0, 32, 16))
        pasted(ground, scaled(crop, (8, 8)), x - 4, y - 6)
    flowers = load("ts_casa2-flat").crop((111, 28, 128, 47))
    for x, y in [
        (292, 116),
        (321, 119),
        (345, 110),
        (367, 112),
        (185, 213),
        (108, 218),
    ]:
        pasted(ground, scaled(flowers, (8, 9)), x, y)
    return scaled(ground, (1024, 768))


geometry = json.load(open("src/lib/mundinho/geometry.json"))
rock_geometry = geometry["rocks"]
rocks = blank(rock_geometry["width"] * rock_geometry["columns"], rock_geometry["height"])
stone_source = load("spr_tile_pedra")
for frame, left in enumerate((16, 48)):
    # Each full stone crosses a 16px tile boundary in the original strip.
    pasted(
        rocks,
        scaled(stone_source.crop((left, 0, left + 32, 16)), (64, 32)),
        frame * rock_geometry["width"],
        0,
    )
save(rocks, "rocks")
ground = terrain()
scenery = blank(1408, 1760)
preview = ground.copy()
for item in rock_geometry["objects"]:
    left = item["frame"] * rock_geometry["width"]
    pasted(
        preview,
        rocks.crop((left, 0, left + rock_geometry["width"], rock_geometry["height"])),
        item["x"],
        item["y"],
    )
geom = geometry["scenery"]
for item in sorted(geom["objects"], key=lambda o: o["y"]):
    f = item["frame"]
    cell = blank(176, 160)
    if item["id"] == "cabin":
        pasted(cell, scaled(cabin(), (164, 150)), 12, 9)
    else:
        if f % 5 == 0:
            art = load("spr_arvore")
            width, height = 65 + f % 7, 96 + f % 13
        else:
            art = tree(f)
            width, height = 95 + f % 15, 93 + f % 19
        pasted(cell, scaled(art, (width, height)), 78 - width // 2, 156 - height)
    pasted(scenery, cell, (f % 8) * 176, (f // 8) * 160)
    pasted(preview, cell, item["x"], item["y"])
save(ground, "meadow")
save(scenery, "grove")
save(preview, "clearing")


def forest_fringe():
    # A seamless continuation beyond the playable clearing. Use a separate seed
    # and the finished atlas so the map, collisions and other art stay identical.
    border_rng = random.Random(7319)
    im = Image.new("RGBA", (256, 192), "#499d36")
    grass = load("ts_grama-flat")
    for y in range(0, im.height, 16):
        for x in range(0, im.width, 16):
            tile = border_rng.choice([1, 1, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 20, 21])
            left, top = (tile % 7) * 16, (tile // 7) * 16
            pasted(im, grass.crop((left, top, left + 16, top + 16)), x, y)
    im = scaled(im, (512, 384))
    trees = []
    for row in range(4):
        for column in range(6):
            frame = border_rng.randrange(76)
            left = (frame % geom["columns"]) * geom["width"]
            top = (frame // geom["columns"]) * geom["height"]
            art = scenery.crop((left, top, left + geom["width"], top + geom["height"]))
            x = (column * 86 + 26 + (row % 2) * 43 + border_rng.randrange(-12, 13)) % im.width
            y = row * 96 + 70 + border_rng.randrange(-10, 11)
            # Wrapped copies make crowns and trunks continuous across repeats.
            for dy in (-im.height, 0, im.height):
                for dx in (-im.width, 0, im.width):
                    trees.append((y + dy, x + dx, art))
    for y, x, art in sorted(trees, key=lambda item: item[0]):
        pasted(im, art, x - geom["profiles"]["tree"]["anchor"]["x"],
               y - geom["profiles"]["tree"]["anchor"]["y"])
    return im


save(forest_fringe(), "forest-fringe")


def battle():
    im = Image.new("RGBA", (240, 100), "#a9d9cd")
    d = ImageDraw.Draw(im)
    d.rectangle((0, 18, 240, 39), fill="#c9e4c9")
    d.rectangle((0, 35, 240, 100), fill="#89b45d")
    for x in range(-12, 248, 13):
        y = rng.randint(21, 33)
        ellipse(d, (x - 12, y - 8, x + 20, 44), "#82ae83")
    for x in range(-6, 246, 15):
        y = rng.randint(32, 39)
        ellipse(d, (x - 9, y - 6, x + 18, 47), "#568e62")
    for x in range(-12, 246, 12):
        art = scaled(tree(x + 120), (20, 24))
        pasted(im, art, x, 24 + (x % 5))
    for x in [-14, 2, 214, 228]:
        pasted(im, scaled(tree(x), (39, 49)), x, -2 + rng.randrange(7))
    poly(
        d,
        [
            (116, 44),
            (132, 44),
            (147, 60),
            (135, 73),
            (180, 99),
            (90, 99),
            (117, 70),
            (129, 59),
        ],
        "#cfb17b",
    )
    for _ in range(300):
        x, y = rng.randrange(240), rng.randrange(46, 99)
        if im.getpixel((x, y))[:3] == (137, 180, 93):
            d.line((x, y, x + 2, y - 1), fill=rng.choice(["#79a855", "#afc975"]))
    for cx, cy, rx, ry in [(182, 36, 41, 7), (56, 82, 53, 11)]:
        for dy, dr, col in [
            (2, 0, "#537641"),
            (0, 0, "#72974a"),
            (-1, 2, "#a8bf6a"),
            (-2, 6, "#c6cc84"),
        ]:
            ellipse(d, (cx - rx + dr, cy - ry + dy, cx + rx - dr, cy + ry + dy), col)
    for x, y in [
        (12, 76),
        (20, 80),
        (93, 76),
        (99, 82),
        (145, 37),
        (205, 36),
        (219, 72),
        (6, 54),
    ]:
        d.line((x, y + 2, x + 2, y - 1), fill="#608447")
        d.line((x + 2, y - 1, x + 4, y - 1), fill="#f1da93")
    return scaled(im, (480, 200))


save(battle(), "battle")


def pit(hidden=False):
    sheet = blank(384, 48)
    for f in range(6):
        im = blank(32, 24)
        d = ImageDraw.Draw(im)
        for box, col in [
            ((2, 9, 29, 21), ("#36663d" if hidden else "#565061")),
            ((3, 7, 28, 19), "#89724e"),
            ((4, 6, 27, 17), "#bc9b63"),
            ((6, 7, 25, 16), "#40343e"),
            ((7, 8, 24, 15), "#211e30"),
        ]:
            ellipse(d, box, col)
        for j in range(3):
            d.line(
                (10 + j, 14 - j * 2, 20 - j, 14 - j * 2),
                fill=["#9c8666", "#70696a", "#474456"][j],
            )
        for x, y in [(2, 13), (6, 7), (25, 10), (24, 16)]:
            d.line((x, y, x + 2, y - 3), fill="#547943")
            d.point((x + 1, y - 3), fill="#99ad5c")
        d.point((15 + f % 3, 9 + f // 3), fill="#a998d6" if hidden else "#a3c6bd")
        if hidden:
            for x, y in [(4, 10), (7, 8), (24, 13), (21, 17)]:
                ellipse(d, (x - 2, y - 1, x + 2, y + 1), "#517739")
        pasted(sheet, scaled(im, (64, 48)), f * 64, 0)
    return sheet


save(pit(), "stairs")
save(pit(True), "rift")
sign = blank(24, 24)
d = ImageDraw.Draw(sign)
poly(d, [(10, 6), (13, 6), (13, 22), (10, 22)], "#643e30")
d.line((11, 10, 11, 21), fill="#b58149")
poly(d, [(2, 4), (18, 3), (22, 7), (18, 11), (2, 12)], "#603b30")
poly(d, [(3, 5), (17, 4), (20, 7), (17, 9), (3, 10)], "#d59b59")
d.line((5, 6, 15, 5), fill="#f2c783")
d.line((9, 8, 16, 7), fill="#774732")
save(scaled(sign, (48, 48)), "sign")


def arena():
    im = Image.new("RGBA", (384, 256), "#1e1d37")
    d = ImageDraw.Draw(im)
    for z, col in [(0, "#38304c"), (13, "#4a3856"), (30, "#57465d")]:
        for x in range(-12, 400, 14):
            h = rng.randrange(10, 50)
            poly(d, [(x, 0), (x + 24, 0), (x + 12, h + z), (x + 3, h + z - 8)], col)
    for x, y in [
        (32, 85),
        (71, 57),
        (145, 48),
        (245, 51),
        (309, 62),
        (354, 98),
        (36, 204),
        (348, 223),
    ]:
        for j in range(4):
            xx = x + rng.randrange(-9, 10)
            h = rng.randrange(8, 24)
            poly(
                d,
                [
                    (xx - 4, y),
                    (xx - 5, y - h),
                    (xx - 1, y - h - 5),
                    (xx + 3, y - h + 1),
                    (xx + 3, y - 2),
                ],
                "#617f94",
            )
            poly(
                d,
                [(xx - 4, y), (xx - 5, y - h), (xx - 1, y - h - 5), (xx - 1, y - 3)],
                "#a4d2bf",
            )
    for j, col in [
        (13, "#2d2b41"),
        (10, "#665568"),
        (6, "#a99088"),
        (4, "#574d64"),
        (0, "#747082"),
    ]:
        ellipse(d, (52 - j, 76 - j, 332 + j, 220 + j), col)
    for y in range(84, 219, 8):
        for x in range(54, 331):
            if ((x - 192) / 139) ** 2 + ((y - 148) / 70) ** 2 < 1:
                d.point((x, y), fill="#635f74")
                if (x + (y // 8 % 2) * 12) % 24 == 0:
                    d.line((x, y - 5, x, y), fill="#635f74")
    for radius, col in [(47, "#b8a293"), (44, "#625d76"), (30, "#91849a")]:
        d.ellipse(
            (192 - radius, 148 - radius // 2, 192 + radius, 148 + radius // 2),
            outline=col,
            width=1,
        )
    for a in range(8):
        xx = 192 + int(50 * math.cos(a * math.pi / 4))
        yy = 148 + int(26 * math.sin(a * math.pi / 4))
        poly(d, [(xx, yy - 2), (xx + 3, yy), (xx, yy + 2), (xx - 3, yy)], "#caaf92")
    for x, y in [(47, 119), (72, 79), (302, 78), (336, 119), (50, 188), (330, 190)]:
        ellipse(d, (x - 8, y - 1, x + 9, y + 3), "#302c45")
        d.rectangle((x - 5, y - 19, x + 5, y), fill="#595369")
        d.rectangle((x - 4, y - 18, x - 2, y - 2), fill="#867b89")
        d.rectangle((x - 7, y - 21, x + 7, y - 18), fill="#a29298")
        poly(
            d,
            [
                (x - 5, y - 22),
                (x - 3, y - 29),
                (x, y - 32),
                (x + 4, y - 27),
                (x + 4, y - 22),
            ],
            "#80b5ac",
        )
        d.line((x - 3, y - 23, x, y - 30), fill="#d6ecbd")
    for _ in range(95):
        x, y = rng.randint(2, 381), rng.randint(4, 250)
        if ((x - 192) / 160) ** 2 + ((y - 148) / 84) ** 2 > 1.15:
            d.line((x, y, x + 2, y - 1), fill="#564763")
    pasted(im, pit().crop((0, 0, 64, 48)).resize((36, 26), N), 174, 204)
    return scaled(im, (768, 512))


save(arena(), "arena")
# New eight-frame encounters. Slimes retain the original animation and palette ramp.
art = load("spr_slime_grande_andando")
beasts = blank(192, 144)
for row in range(6):
    for f in range(8):
        im = blank(24, 24)
        d = ImageDraw.Draw(im)
        bob = [0, -1, -1, 0, 1, -2, -3, 0][f]
        cx = 12 + (2 if f in (5, 6) else 0)
        cy = 14 + bob

        def oval(box, col):
            ellipse(d, box, col)

        def eyes(x, y, col="#f8e6a1"):
            for xx in [x - 3, x + 2]:
                d.rectangle((xx, y, xx + 1, y + 2), fill="#2b2134")
                d.point((xx, y), fill=col)

        if row < 2:
            idx = [0, 1, 3, 5, 0, 2, 4, 5][f]
            sl = art.crop((idx * 14, 0, idx * 14 + 14, 12))
            if row:
                sl.putdata(
                    [
                        (
                            int(g * 0.40),
                            min(255, int(g * 0.88)),
                            min(255, int(g * 1.2)),
                            a,
                        )
                        if a and g > r
                        else (r, g, b, a)
                        for r, g, b, a in sl.getdata()
                    ]
                )
            pasted(im, sl, cx - 7, cy - 5)
            if row:
                poly(d, [(cx - 3, cy - 4), (cx, cy - 8), (cx + 2, cy - 4)], "#92e4ea")
                d.point((cx, cy - 6), fill="#eaf9e4")
        elif row == 2:
            poly(
                d,
                [
                    (cx - 7, cy + 4),
                    (cx - 8, cy - 1),
                    (cx - 4, cy - 6),
                    (cx - 2, cy - 11),
                    (cx + 1, cy - 7),
                    (cx + 4, cy - 9),
                    (cx + 5, cy - 4),
                    (cx + 8, cy - 2),
                    (cx + 7, cy + 4),
                    (cx + 3, cy + 7),
                    (cx - 4, cy + 7),
                ],
                "#853441",
            )
            oval((cx - 6, cy - 5, cx + 6, cy + 5), "#eb7737")
            poly(
                d,
                [
                    (cx - 4, cy + 4),
                    (cx - 4, cy - 2),
                    (cx, cy - 5),
                    (cx + 1, cy - 7),
                    (cx + 4, cy - 1),
                    (cx + 3, cy + 4),
                ],
                "#ffd269",
            )
            eyes(cx, cy)
        elif row == 3:
            for x in [cx - 8, cx + 7]:
                for j in [-2, 2, 5]:
                    d.line(
                        (x, cy + j, x + (1 if x > cx else -1), cy + j + 2),
                        fill="#483344",
                    )
            oval((cx - 8, cy - 7, cx + 7, cy + 6), "#34233f")
            oval((cx - 7, cy - 6, cx + 6, cy + 4), "#745083")
            oval((cx - 5, cy - 5, cx - 1, cy + 2), "#b292ac")
            d.line((cx, cy - 6, cx, cy + 3), fill="#463048")
            oval((cx - 5, cy + 2, cx + 5, cy + 7), "#41324d")
            eyes(cx, cy + 3, "#f9cd73")
        elif row == 4:
            oval((cx - 6, cy - 4, cx + 6, cy + 6), "#513e31")
            oval((cx - 5, cy - 3, cx + 5, cy + 5), "#af884b")
            poly(
                d,
                [
                    (cx - 8, cy - 7),
                    (cx - 3, cy - 7),
                    (cx, cy - 3),
                    (cx + 3, cy - 8),
                    (cx + 8, cy - 9),
                    (cx + 7, cy - 4),
                    (cx + 2, cy - 1),
                    (cx - 2, cy),
                    (cx - 7, cy - 3),
                ],
                "#448452",
            )
            d.line((cx, cy - 2, cx + 6, cy - 7), fill="#bbd56b")
            eyes(cx, cy + 1)
        else:
            poly(
                d,
                [
                    (cx - 8, cy + 6),
                    (cx - 7, cy - 4),
                    (cx - 3, cy - 8),
                    (cx + 3, cy - 8),
                    (cx + 7, cy - 4),
                    (cx + 8, cy + 5),
                    (cx + 4, cy + 3),
                    (cx + 2, cy + 7),
                    (cx, cy + 5),
                    (cx - 3, cy + 7),
                    (cx - 5, cy + 4),
                ],
                "#503b65",
            )
            oval((cx - 6, cy - 6, cx + 5, cy + 2), "#86769f")
            oval((cx - 4, cy - 3, cx + 4, cy + 2), "#392c50")
            d.line((cx - 3, cy - 1, cx - 2, cy), fill="#f4d7a2")
            d.line((cx + 2, cy, cx + 3, cy - 1), fill="#f4d7a2")
        pasted(beasts, im, 24 * f, 24 * row)
save(beasts, "creatures")
