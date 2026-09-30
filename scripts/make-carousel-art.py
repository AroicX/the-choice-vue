"""
Turns photos into Choice9ja halftone art: the home carousel slides and the
topic library used for discussion-room covers.

Each photo is cropped to the banner shape, contrast-boosted, and redrawn as a
rotated grid of dots (brighter areas -> bigger dots) in the slide's accent
colour on the slide's background colour. Output: public/carousel/<slide>.webp

Room covers are drawn the same way but as a transparent mask (white dots, no
background), so the app can colour one image with any palette at runtime.
Output: public/covers/<topic>.webp

    python3 scripts/make-carousel-art.py

Sources are Unsplash photos (Unsplash License: free to use, no attribution
required; credited in src/components/home/civic-carousel.tsx anyway). They are
downloaded on first run into scripts/.carousel-src/ (gitignored).
"""
import math
import os
import urllib.request

from PIL import Image, ImageDraw, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "scripts", ".carousel-src")
OUT_DIR = os.path.join(ROOT, "public", "carousel")

OUT_W, OUT_H = 1400, 560  # 2.5:1, ~2x the rendered banner
SPACING = 11  # dot pitch in output pixels
ANGLE = math.radians(30)
SUPERSAMPLE = 3

SLIDES = [
    # id, unsplash id, background, dots, vertical focus (0 top .. 1 bottom), invert
    # "pulse" is inverted: its bright sky otherwise floods the frame with dots
    # and the crowd (the subject) disappears into the background colour.
    ("pulse", "nmLJAvTfanU", "#0B2E22", "#6EE7A0", 0.7, True),
    ("rate", "Ciba8rvHYng", "#141A2B", "#93A8D8", 0.5, False),
    ("report", "cFT_Xq4XyA0", "#4A2419", "#F0A585", 0.5, False),
]


def source(unsplash_id):
    os.makedirs(SRC_DIR, exist_ok=True)
    path = os.path.join(SRC_DIR, f"{unsplash_id}.jpg")
    if not os.path.exists(path):
        url = f"https://unsplash.com/photos/{unsplash_id}/download?w=2000"
        urllib.request.urlretrieve(url, path)
    return path


def crop_to_banner(image, focus_y):
    target = OUT_W / OUT_H
    w, h = image.size
    if w / h > target:
        new_w = int(h * target)
        left = (w - new_w) // 2
        return image.crop((left, 0, left + new_w, h))
    new_h = int(w / target)
    top = int((h - new_h) * focus_y)
    return image.crop((0, top, w, top + new_h))


def halftone(path, background, dots, focus_y, invert):
    photo = crop_to_banner(Image.open(path).convert("L"), focus_y)
    photo = ImageOps.autocontrast(photo.resize((OUT_W, OUT_H), Image.LANCZOS), cutoff=2)
    if invert:
        photo = ImageOps.invert(photo)

    scale = SUPERSAMPLE
    mode = "RGBA" if isinstance(background, tuple) and len(background) == 4 else "RGB"
    canvas = Image.new(mode, (OUT_W * scale, OUT_H * scale), background)
    draw = ImageDraw.Draw(canvas)
    pixels = photo.load()

    cos_a, sin_a = math.cos(ANGLE), math.sin(ANGLE)
    reach = int(math.hypot(OUT_W, OUT_H) / SPACING) + 2
    max_r = SPACING * 0.5 * 1.05
    for i in range(-reach, reach):
        for j in range(-reach, reach):
            # Rotated lattice point in output space.
            x = (i * cos_a - j * sin_a) * SPACING + OUT_W / 2
            y = (i * sin_a + j * cos_a) * SPACING + OUT_H / 2
            if not (0 <= x < OUT_W and 0 <= y < OUT_H):
                continue
            lum = pixels[int(x), int(y)] / 255
            r = max_r * (lum ** 1.1)
            if r < 0.6:
                continue
            cx, cy, rr = x * scale, y * scale, r * scale
            draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=dots)

    return canvas.resize((OUT_W, OUT_H), Image.LANCZOS)


# Room-cover topics: id, unsplash id, vertical focus, invert. Photos whose
# subject is darker than a bright sky are inverted so the subject gets the dots.
COVERS = [
    ("power", "igTOxfI7I08", 0.5, True),
    ("economy", "ZP7cq__1kAc", 0.5, False),
    ("education", "JwdHpCUmpg8", 0.5, False),
    ("health", "sA679DVxlSg", 0.7, False),
    ("infrastructure", "kF0-RhpHhRA", 0.55, True),
    ("environment", "h-4U0rQX7gk", 0.6, False),
    ("government", "MxDF3-ysw_g", 0.45, True),
    ("local", "cFT_Xq4XyA0", 0.5, False),
    ("elections", "nmLJAvTfanU", 0.7, True),
    ("general", "Ciba8rvHYng", 0.5, False),
]
COVERS_DIR = os.path.join(ROOT, "public", "covers")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(COVERS_DIR, exist_ok=True)
    for topic, unsplash_id, focus_y, invert in COVERS:
        art = halftone(source(unsplash_id), (0, 0, 0, 0), (255, 255, 255, 255), focus_y, invert)
        out = os.path.join(COVERS_DIR, f"{topic}.webp")
        art.save(out, "WEBP", quality=80, method=6)
        print(f"{out}  {os.path.getsize(out) // 1024} KB")
    for slide_id, unsplash_id, background, dots, focus_y, invert in SLIDES:
        art = halftone(source(unsplash_id), background, dots, focus_y, invert)
        out = os.path.join(OUT_DIR, f"{slide_id}.webp")
        art.save(out, "WEBP", quality=82, method=6)
        print(f"{out}  {os.path.getsize(out) // 1024} KB")


if __name__ == "__main__":
    main()
