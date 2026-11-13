# Rebuilding Mundinho sprites

Run the central entry point from the repository root:

```powershell
node scripts/mundinho-sprites/build.mjs --dry-run
node scripts/mundinho-sprites/build.mjs
node scripts/mundinho-sprites/build.mjs hero-body
node scripts/mundinho-sprites/build.mjs portrait-eyes
node scripts/mundinho-sprites/build.mjs creatures forest-scenery
```

No selection builds the complete catalog. `--dry-run` prints the selected generators,
dimensions, palettes and editable sources without writing files or running LibreSprite.
Unknown asset names fail instead of silently producing an empty build.

The hero family imports the supplied tutorial player strips from `artifacts/mundinho/tutorial-source/`. Each motion uses six native frames in each direction. The 48px cells preserve the entire sword arc and a fixed ground anchor. Selecting `hero` or any hero layer builds the complete family. The editable exports are in `artifacts/mundinho/libresprite/refined/`. Run `npm run test:mundinho-sprites` to compare all 96 default poses against their source pixels.

Selecting `portraits` or any `portrait-*` layer rebuilds all six portrait layers once
through `scripts/build-mundinho-portraits.mjs`. Drawing geometry lives in
`scripts/lib/mundinho-portrait-art.mjs`, with accessory art in the generator. Sources
live in `artifacts/mundinho/libresprite/portraits/`.

Hero accessories belong to the hero family too, so they share its walk bob.
Scenery, habitats, creatures and the tileset reference continue to
use this directory's AAP-64 drawing programs and `artifacts/mundinho/libresprite-v2/`.
The authored hero/portrait families retain the saved avatar colors and neutral hair
ramp instead of being quantized to AAP-64. All families preserve their cell dimensions,
direction order and hard transparency. Hairstyle counts come from
`src/lib/mundinho/hairstyles.json`: nine cuts, six color slots each, with the
original six saved indices retained. World hair has 54 variants; front/back
portrait hair has nine frames each. Every actual build writes `artifacts/mundinho/sprite-build-manifest.json`
with the authoritative generator and ASE source for each PNG.

The central builder passes an isolated temporary `APPDATA` profile to LibreSprite
and child generators so batch exports do not modify the desktop artist's settings.
