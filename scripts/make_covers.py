#!/usr/bin/env python3
"""Генератор обложек для комплектов обоев.

Рисует фигуры и палитру теми же значениями, что использует сам комплект, и
кладёт результат в `wallpapers/<id>/cover.png` (720x1280, соотношение 9:16).

    python3 scripts/make_covers.py

Обложка — приближение, а не снимок с устройства: на телефоне цвета приходят из
системной палитры Monet и будут другими. Скриншот с реального устройства всегда
предпочтительнее, просто положите его на место cover.png.

Требуется Pillow: pip install Pillow
"""

import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

if hasattr(sys.stdout, "reconfigure"):  # консоль Windows по умолчанию не в UTF-8
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WIDTH, HEIGHT = 720, 1280
SS = 2  # суперсэмплинг для сглаживания краёв

# Представительная тёмная палитра Material You. На устройстве значения приходят
# из системы событием wallpaperEngineReady.
BG = (20, 18, 26)
SURFACE = (43, 40, 54)
SURFACE_HIGH = (54, 50, 68)
PRIMARY = (208, 188, 255)

BUNDLES = {
    # id: (список фигур, подпись режима)
    # фигура: (тип, cx, cy, радиус в единицах 720-широкого холста, поворот°, цвет, обводка)
    "m3-shapes-dynamic": [
        ("pill", 200, 250, 78, -18, SURFACE_HIGH, 0),
        ("circle", 520, 190, 92, 0, SURFACE, 0),
        ("squircle", 175, 560, 105, 12, SURFACE, 6),
        ("rounded_diamond", 545, 620, 88, 45, SURFACE_HIGH, 0),
        ("circle", 300, 900, 70, 0, SURFACE_HIGH, 6),
        ("pill", 545, 1030, 84, 24, SURFACE, 0),
    ],
    "m3-shapes-gyro": [
        # Гравитация тянет фигуры вниз и вправо — телефон наклонён.
        ("circle", 470, 980, 96, 0, SURFACE, 0),
        ("squircle", 250, 1060, 88, -14, SURFACE_HIGH, 0),
        ("circle", 560, 760, 78, 0, SURFACE_HIGH, 0),
        ("squircle", 330, 800, 100, 8, SURFACE, 0),
    ],
    "m3-shapes-touch": [
        # Фигуры разбегаются от точки касания в центре.
        ("circle", 210, 430, 88, 0, SURFACE, 0),
        ("squircle", 540, 500, 82, 16, SURFACE_HIGH, 0),
        ("circle", 250, 880, 74, 0, SURFACE_HIGH, 0),
        ("squircle", 520, 930, 96, -10, SURFACE, 0),
    ],
}

TOUCH_POINT = (380, 670)  # центр «касания» для m3-shapes-touch


def rounded_rect(draw, box, radius, fill, outline, width):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_shape(base, kind, cx, cy, radius, rotation, fill, stroke):
    """Рисует фигуру в отдельном слое и накладывает её с поворотом."""
    if kind == "pill":
        w, h = radius * 1.5, radius * 0.85
    elif kind == "rounded_diamond":
        w = h = radius * 0.9
    else:
        w = h = radius

    pad = int(max(w, h) * 2 + stroke * 2 + 8)
    layer = Image.new("RGBA", (pad * 2, pad * 2), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ox = oy = pad

    box = (ox - w, oy - h, ox + w, oy + h)
    outline = PRIMARY if stroke else None

    if kind == "circle":
        ld.ellipse(box, fill=fill, outline=outline, width=stroke)
    elif kind == "squircle":
        rounded_rect(ld, box, radius * 0.45, fill, outline, stroke)
    elif kind == "pill":
        rounded_rect(ld, box, h, fill, outline, stroke)
    else:  # rounded_diamond — скруглённый квадрат, повёрнутый на 45°
        rounded_rect(ld, box, radius * 0.3, fill, outline, stroke)

    if rotation:
        layer = layer.rotate(rotation, resample=Image.BICUBIC, expand=False)

    base.alpha_composite(layer, (int(cx - pad), int(cy - pad)))


def make_cover(bundle_id, shapes):
    canvas = Image.new("RGBA", (WIDTH * SS, HEIGHT * SS), BG + (255,))

    if bundle_id == "m3-shapes-touch":
        # Мягкий ореол вокруг точки касания.
        glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        tx, ty = TOUCH_POINT[0] * SS, TOUCH_POINT[1] * SS
        for step in range(14, 0, -1):
            r = step * 22 * SS
            alpha = int(4 + (14 - step) * 1.5)
            gd.ellipse((tx - r, ty - r, tx + r, ty + r), fill=PRIMARY + (alpha,))
        # Без размытия ступени концентрических кругов видны полосами.
        glow = glow.filter(ImageFilter.GaussianBlur(40 * SS))
        canvas.alpha_composite(glow)

    for kind, cx, cy, radius, rotation, fill, stroke in shapes:
        draw_shape(
            canvas,
            kind,
            cx * SS,
            cy * SS,
            radius * SS,
            rotation,
            fill + (255,),
            stroke * SS,
        )

    return canvas.resize((WIDTH, HEIGHT), Image.LANCZOS).convert("RGB")


def main():
    written = []
    for bundle_id, shapes in BUNDLES.items():
        bundle_dir = os.path.join(ROOT, "wallpapers", bundle_id)
        if not os.path.isdir(bundle_dir):
            print(f"пропуск: нет папки {bundle_dir}")
            continue
        target = os.path.join(bundle_dir, "cover.png")
        make_cover(bundle_id, shapes).save(target, "PNG", optimize=True)
        written.append((os.path.relpath(target, ROOT), os.path.getsize(target)))

    for path, size in written:
        print(f"{path}  {size // 1024} КБ")
    if not written:
        sys.exit(1)


if __name__ == "__main__":
    main()
