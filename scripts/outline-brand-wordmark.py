"""Build native/static wordmark outlines in Sora SemiBold 600.

Usage: python scripts/outline-brand-wordmark.py <Sora.ttf>
Requires fonttools; font license lives in public/brand/OFL-Sora.txt.
Only the suffix is regenerated; the supplied monogram geometry is preserved.
Web renders the same face at 1.36 times the monogram height and -0.02em tracking.
"""
import ast
import json
import math
import re
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": 600})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
geometry_file = Path("src/lib/brand-geometry.ts")
source = geometry_file.read_text()

# Accept both generator JSON and the TypeScript spelling produced by Prettier.
def read_value(key):
    match = re.search(r"[\"']?" + re.escape(key) + r"[\"']?\s*:\s*('[^']*'|\"[^\"]*\"|[\d.]+)", source)
    if not match:
        raise ValueError(f"Missing existing monogram field: {key}")
    return ast.literal_eval(match.group(1))

geometry = {key: read_value(key) for key in ["viewBox", "width", "height", "path"]}
scale = 1.36 * geometry["height"] / font["head"].unitsPerEm
baseline = font["OS/2"].sCapHeight * scale + 8

# Sora's Latin kerning is GPOS PairPos. Preserve it in the outlined signature,
# then add the requested CSS-equivalent letter spacing between glyphs only.
kern_lookups = []
if "GPOS" in font:
    gpos = font["GPOS"].table
    indices = set()
    for record in gpos.FeatureList.FeatureRecord:
        if record.FeatureTag == "kern":
            indices.update(record.Feature.LookupListIndex)
    kern_lookups = [gpos.LookupList.Lookup[index] for index in sorted(indices)]

def kerning(left, right):
    total = 0
    for lookup in kern_lookups:
        if lookup.LookupType != 2:
            continue
        for table in lookup.SubTable:
            if left not in table.Coverage.glyphs:
                continue
            value = None
            if table.Format == 1:
                index = table.Coverage.glyphs.index(left)
                for pair in table.PairSet[index].PairValueRecord:
                    if pair.SecondGlyph == right:
                        value = pair.Value1
                        break
                if value is None:
                    continue
            elif table.Format == 2:
                first = table.ClassDef1.classDefs.get(left, 0)
                second = table.ClassDef2.classDefs.get(right, 0)
                value = table.Class1Record[first].Class2Record[second].Value1
            else:
                continue
            total += getattr(value, "XAdvance", 0) if value else 0
            break
    return total

pen = SVGPathPen(glyphs, ntos=lambda n: f"{n:.3f}".rstrip("0").rstrip(".") or "0")
bounds = BoundsPen(glyphs)
x = 0
previous = None
tracking = -0.02 * 1.36 * geometry["height"]
text = "tacklyst"
for index, char in enumerate(text):
    name = cmap[ord(char)]
    glyph = glyphs[name]
    if previous:
        x += kerning(previous, name) * scale
    transform = (scale, 0, 0, -scale, x, baseline)
    glyph.draw(TransformPen(pen, transform))
    glyph.draw(TransformPen(bounds, transform))
    x += glyph.width * scale
    if index < len(text) - 1:
        x += tracking
    previous = name

geometry["suffixPath"] = pen.getCommands()
geometry["wordmarkWidth"] = math.ceil(geometry["width"] + 36 + bounds.bounds[2] + 8)
geometry["wordmarkHeight"] = math.ceil(max(geometry["height"], bounds.bounds[3]) + 8)
geometry["suffixFontFamily"] = "Sora"
geometry["suffixFontWeight"] = 600
geometry["suffixLetterSpacingEm"] = -0.02
content = ("// Supplied monogram + Sora SemiBold 600 outlines; see public/brand/OFL-Sora.txt.\n"
           "export const brandGeometry = " + json.dumps(geometry, indent=2) + " as const;\n")
for file in [geometry_file, Path("apps/mobile/src/components/brand-geometry.ts")]:
    file.write_text(content)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {geometry["wordmarkWidth"]} {geometry["wordmarkHeight"]}">'
       f'<title>Stacklyst</title><path d="{geometry["path"]}" fill="#0083fe"/>'
       f'<path d="{geometry["suffixPath"]}" transform="translate({geometry["width"] + 36} 0)" fill="#0083fe"/></svg>')
for file in ["wordmark.svg", "wordmark-light.svg"]:
    Path("public/brand", file).write_text(svg)
print(json.dumps({"font": "Sora SemiBold", "weight": 600, "trackingEm": -0.02,
                  "bounds": bounds.bounds, "canvas": [geometry["wordmarkWidth"], geometry["wordmarkHeight"]]}))
