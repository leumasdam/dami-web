"""src/*.png (vrstvy z Higgsfieldu) → img/*.webp v správnych veľkostiach pre web."""
import glob, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "img")
SIZES = {"ban-": 2400, "cat-": 820, "tile-": 1200, "stk-": 420, "d-patch": 700, "trousers": 700,
         "vyroba-": 1600, "foto-": 1600}

for f in sorted(glob.glob(os.path.join(HERE, "*.png"))):
    name = os.path.basename(f)[:-4]
    w = next((v for k, v in SIZES.items() if name.startswith(k)), 1600)
    im = Image.open(f)
    if name == "tile-nazuvaky":  # horný okraj obrázka je pripálený, berieme len dolnú časť s nazúvakmi
        im = im.crop((int(im.width * .38), int(im.height * .30), im.width, im.height))
        w = 900
    im = im.convert("RGBA" if im.mode == "RGBA" else "RGB")
    if im.mode == "RGBA":
        im = im.crop(im.getbbox())
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    dst = os.path.join(OUT, name + ".webp")
    im.save(dst, quality=82, method=6)
    print(f"{name}.webp {im.size}")
