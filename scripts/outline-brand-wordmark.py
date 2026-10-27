"""Build native/static wordmark outlines from a licensed Space Grotesk TTF.

Usage: python scripts/outline-brand-wordmark.py <SpaceGrotesk.ttf>
Requires fonttools; font license lives in public/brand/OFL-SpaceGrotesk.txt.
Run after build-brand-assets.mjs. Web still renders literal, accessible text.
"""
import json
import re
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": 700})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
geometry_file = Path("src/lib/brand-geometry.ts")
geometry = json.loads(re.search(r"= (\{[\s\S]*\}) as const", geometry_file.read_text()).group(1))
scale = 1.36 * geometry["height"] / font["head"].unitsPerEm
baseline = 700 * scale + 8
pen = SVGPathPen(glyphs)
x = 0
for char in "tacklyst":
    glyph = glyphs[cmap[ord(char)]]
    glyph.draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
    x += glyph.width * scale - 0.035 * 1.36 * geometry["height"]
geometry["suffixPath"] = pen.getCommands()
geometry["wordmarkWidth"] = round(geometry["width"] + 36 + x)
geometry["wordmarkHeight"] = round(baseline + 200 * scale + 8)
content = ("// Supplied monogram + Space Grotesk Bold outlines; see public/brand/OFL-SpaceGrotesk.txt.\n"
           "export const brandGeometry = " + json.dumps(geometry, indent=2) + " as const;\n")
for file in [geometry_file, Path("apps/mobile/src/components/brand-geometry.ts")]:
    file.write_text(content)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {geometry["wordmarkWidth"]} {geometry["wordmarkHeight"]}">'
       f'<title>Stacklyst</title><path d="{geometry["path"]}" fill="#0083fe"/>'
       f'<path d="{geometry["suffixPath"]}" transform="translate({geometry["width"] + 36} 0)" fill="#0083fe"/></svg>')
for file in ["wordmark.svg", "wordmark-light.svg"]:
    Path("public/brand", file).write_text(svg)
print("Space Grotesk Bold wordmark generated in monogram blue.")
