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
    "m3-shapes-lite": [
        # Lite замирает в статике: фигуры разложены ровно, без наклонов.
        ("circle", 230, 320, 84, 0, SURFACE, 0),
        ("squircle", 520, 430, 96, 0, SURFACE_HIGH, 0),
        ("pill", 250, 700, 76, 0, SURFACE_HIGH, 0),
        ("circle", 510, 880, 88, 0, SURFACE, 0),
    ],
    "m3-expressive-shapes": [
        # Экспрессивный вариант: крупнее, с выраженными обводками.
        ("squircle", 210, 300, 112, -10, SURFACE, 8),
        ("circle", 540, 250, 84, 0, SURFACE_HIGH, 0),
        ("rounded_diamond", 300, 620, 104, 30, SURFACE_HIGH, 8),
        ("pill", 545, 700, 92, -20, SURFACE, 0),
        ("circle", 240, 960, 96, 0, SURFACE, 8),
        ("squircle", 540, 1040, 80, 18, SURFACE_HIGH, 0),
    ],
    # Фото-обои рисуются не фигурами, а градиентом по умолчанию — см. GRADIENT_BUNDLES.
    "photo-blur-dynamics": [],
}

TOUCH_POINT = (380, 670)  # центр «касания» для m3-shapes-touch

# Комплекты, у которых обложка — это их собственный фон по умолчанию, а не фигуры.
# Значения взяты из CSS комплекта, чтобы обложка совпадала с тем, что видит
# пользователь до выбора своего фото.
GRADIENT_BUNDLES = {
    "photo-blur-dynamics": {
        "linear": ((79, 55, 139), (0, 0, 0)),      # 225deg #4f378b → #000
        "radial": ((125, 82, 96), (30, 25, 43)),   # circle at 30% 20% #7d5260 → #1e192b
        "radial_center": (0.30, 0.20),
    },
}


def make_gradient_cover(spec):
    """Диагональный градиент с радиальным пятном поверх — как в CSS комплекта."""
    w, h = WIDTH, HEIGHT
    base = Image.new("RGB", (w, h))
    px = base.load()

    (lr0, lg0, lb0), (lr1, lg1, lb1) = spec["linear"]
    (rr0, rg0, rb0), (rr1, rg1, rb1) = spec["radial"]
    cx, cy = spec["radial_center"]
    cx, cy = cx * w, cy * h
    max_r = math.hypot(max(cx, w - cx), max(cy, h - cy)) * 0.6

    for y in range(h):
        for x in range(w):
            # 225deg в CSS идёт из правого верхнего угла в левый нижний.
            t = ((w - x) / w + y / h) / 2
            r = lr0 + (lr1 - lr0) * t
            g = lg0 + (lg1 - lg0) * t
            b = lb0 + (lb1 - lb0) * t

            d = min(math.hypot(x - cx, y - cy) / max_r, 1.0)
            k = 1.0 - d
            r += (rr0 - r) * k * 0.85 + (rr1 - r) * (1 - k) * 0.15
            g += (rg0 - g) * k * 0.85 + (rg1 - g) * (1 - k) * 0.15
            b += (rb0 - b) * k * 0.85 + (rb1 - b) * (1 - k) * 0.15

            px[x, y] = (int(r), int(g), int(b))

    return base.filter(ImageFilter.GaussianBlur(2))


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
        if bundle_id in GRADIENT_BUNDLES:
            cover = make_gradient_cover(GRADIENT_BUNDLES[bundle_id])
        else:
            cover = make_cover(bundle_id, shapes)
        cover.save(target, "PNG", optimize=True)
        written.append((os.path.relpath(target, ROOT), os.path.getsize(target)))

    for path, size in written:
        print(f"{path}  {size // 1024} КБ")
    if not written:
        sys.exit(1)


if __name__ == "__main__":
    main()
