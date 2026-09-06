from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1] / 'qa'
SOURCE = ROOT / "rendered-20260905"
OUTPUT = ROOT / "contact-sheets-20260905"

COLS = 2
ROWS = 2
GAP = 18
LABEL_HEIGHT = 34
BACKGROUND = "#D1D5DB"


def natural_key(path: Path) -> tuple[int, str]:
    suffix = path.stem.rsplit("-", 1)[-1]
    return (int(suffix) if suffix.isdigit() else 0, path.name)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(size=18)

    for document_dir in sorted(path for path in SOURCE.iterdir() if path.is_dir()):
        pages = sorted(document_dir.glob("page-*.png"), key=natural_key)
        if not pages:
            continue

        with Image.open(pages[0]) as first:
            page_width = 460
            page_height = round(first.height * page_width / first.width)
        sheet_width = COLS * page_width + (COLS + 1) * GAP
        sheet_height = ROWS * (page_height + LABEL_HEIGHT) + (ROWS + 1) * GAP

        destination = OUTPUT / document_dir.name
        destination.mkdir(parents=True, exist_ok=True)
        for start in range(0, len(pages), COLS * ROWS):
            batch = pages[start : start + COLS * ROWS]
            canvas = Image.new("RGB", (sheet_width, sheet_height), BACKGROUND)
            draw = ImageDraw.Draw(canvas)
            for index, page_path in enumerate(batch):
                row, col = divmod(index, COLS)
                x = GAP + col * (page_width + GAP)
                y = GAP + row * (page_height + LABEL_HEIGHT + GAP)
                with Image.open(page_path) as page:
                    canvas.paste(page.convert("RGB").resize((page_width, page_height)), (x, y))
                label = f"{document_dir.name[:2]} — página {natural_key(page_path)[0]}"
                draw.text((x, y + page_height + 6), label, fill="#111827", font=font)

            end = start + len(batch)
            output = destination / f"paginas-{start + 1:03d}-{end:03d}.png"
            canvas.save(output, optimize=True)
            print(output)


if __name__ == "__main__":
    main()
