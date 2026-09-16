#!/usr/bin/env python3
"""
Normalizes robot walking sprite frames to match the 320x320 canvas,
exact visual character scale, and feet baseline of the idle breathing frames.
"""

from PIL import Image
import os
import glob
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROBOT_DIR = os.path.join(BASE_DIR, 'public', 'sprites', 'robot')
BACKUP_DIR = os.path.join(ROBOT_DIR, 'backup_walking_original')

# Reference character measurements from idle (320x320 canvas, baseline maxY = 296, center cx = 160.0):
# - idle_baixo:   h = 262, maxY = 296, cx = 160.0
# - idle_cima:    h = 236, maxY = 296, cx = 159.5
# - idle_direita: h = 260, maxY = 296, cx = 160.0
# - idle_esquerda:h = 260, maxY = 296, cx = 160.0
DIRECTION_CONFIG = {
    'baixo': {
        'scale': 262.0 / 218.0,
        'base_max_y': 296,
        'center_x': 160.0,
    },
    'cima': {
        'scale': 236.0 / 199.0,
        'base_max_y': 296,
        'center_x': 160.0,
    },
    'direita': {
        'scale': 260.0 / 217.0,
        'base_max_y': 296,
        'center_x': 160.0,
    },
    'esquerda': {
        'scale': 260.0 / 217.0,
        'base_max_y': 296,
        'center_x': 160.0,
    },
}

def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    print("Normalizing walking sprites to match idle breathing dimensions (320x320)...")

    for direction, cfg in DIRECTION_CONFIG.items():
        pattern = os.path.join(ROBOT_DIR, f"{direction}_*.png")
        files = sorted(glob.glob(pattern))
        print(f"\n--- Processing {direction} (scale={cfg['scale']:.4f}) ---")

        for file_path in files:
            file_name = os.path.basename(file_path)
            backup_path = os.path.join(BACKUP_DIR, file_name)

            # Back up original if not already backed up
            if not os.path.exists(backup_path):
                shutil.copy2(file_path, backup_path)

            img = Image.open(backup_path).convert('RGBA')
            bbox = img.getbbox()
            if not bbox:
                print(f"Skipping empty image: {file_name}")
                continue

            content = img.crop(bbox)
            cw, ch = content.size

            # Scale content with Lanczos
            scale = cfg['scale']
            new_w = max(1, int(round(cw * scale)))
            new_h = max(1, int(round(ch * scale)))
            scaled = content.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Create 320x320 transparent canvas
            canvas = Image.new('RGBA', (320, 320), (0, 0, 0, 0))

            # Center horizontally, align feet at base_max_y
            paste_x = int(round(cfg['center_x'] - new_w / 2.0))
            paste_y = cfg['base_max_y'] - new_h

            canvas.paste(scaled, (paste_x, paste_y), scaled)

            # Save normalized image
            canvas.save(file_path, format='PNG', optimize=True)

            # Inspect and print result
            res_bbox = canvas.getbbox()
            rw = res_bbox[2] - res_bbox[0]
            rh = res_bbox[3] - res_bbox[1]
            rcx = (res_bbox[0] + res_bbox[2]) / 2.0
            print(f"  {file_name:16}: canvas=320x320, bbox={res_bbox}, w={rw}, h={rh}, cx={rcx:.1f}, maxY={res_bbox[3]}")

    print("\nAll walking sprite frames successfully normalized to 320x320 matching idle!")

if __name__ == '__main__':
    main()
