"""Hero bannery v2: fotky (Higgsfield, src/hero/*.png) a výrezy produktov (img/hero/cut-*.png) → img/hero/*.webp."""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "img", "hero")
RED, DARK, PAPER = (217, 24, 15), (17, 17, 17), (250, 248, 245)


def photo_banner(name, photo, bg, size=(2400, 1029), x0=None, fade=420, crop=None, transparent_left=False):
    W, H = size
    im = Image.open(os.path.join(HERE, photo)).convert("RGB")
    if crop:  # orez okrajov (filmový rám)
        w, h = im.size
        im = im.crop((int(w * crop), int(h * crop), int(w * (1 - crop)), int(h * (1 - crop))))
    s = H / im.height
    im = im.resize((round(im.width * s), H), Image.LANCZOS)
    if x0 is None:
        x0 = W - im.width
    base = Image.new("RGBA", (W, H), (*bg, 0 if transparent_left else 255))
    mask = Image.new("L", im.size, 255)
    d = ImageDraw.Draw(mask)
    for x in range(fade):
        d.line([(x, 0), (x, H)], fill=round(255 * (x / fade) ** 1.6))
    base.paste(im, (x0, 0), mask)
    base.convert("RGB").save(os.path.join(OUT, name), quality=80, method=6)
    print(name, base.size)


def cut_banner(name, cuts, bg, size=(2400, 1029), panel=None, alpha=False):
    """cuts: [(súbor, stred_x, stred_y, výška, natočenie)] v px plátna"""
    W, H = size
    base = Image.new("RGBA", (W, H), (*bg, 0) if alpha else (*bg, 255))
    if panel:  # (x0, y0, x1, y1, farba, polomer)
        x0, y0, x1, y1, col, r = panel
        ImageDraw.Draw(base).rounded_rectangle((x0, y0, x1, y1), r, fill=col)
    for f, cx, cy, h, rot in cuts:
        c = Image.open(os.path.join(OUT, f)).convert("RGBA")
        s = h / c.height
        c = c.resize((round(c.width * s), round(h)), Image.LANCZOS)
        if rot:
            c = c.rotate(rot, resample=Image.BICUBIC, expand=True)
        # jemný tieň pod produktom
        sh = Image.new("RGBA", c.size, (0, 0, 0, 0))
        sh.putalpha(c.getchannel("A").point(lambda a: int(a * .28)))
        sh = sh.filter(ImageFilter.GaussianBlur(18))
        px, py = round(cx - c.width / 2), round(cy - c.height / 2)
        base.alpha_composite(sh, (px + 10, py + 26))
        base.alpha_composite(c, (px, py))
    if alpha:
        base.save(os.path.join(OUT, name), quality=86, method=6)
    else:
        base.convert("RGB").save(os.path.join(OUT, name), quality=84, method=6)
    print(name, base.size)


# ---------- úvodný carousel: 1560×1040 (≈ pomer viditeľnej plochy slidu), text vľavo, objekt v pravej polovici ----------
C = (1560, 1040)


def left_fade(name, photo, bg, size=C, solid=560, fade=360):
    W, H = size
    im = Image.open(os.path.join(HERE, photo)).convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im = im.crop((im.width - W, (im.height - H) // 2, im.width, (im.height - H) // 2 + H))
    ov = Image.new("RGBA", (W, H), (*bg, 0))
    d = ImageDraw.Draw(ov)
    for x in range(W):
        a = 255 if x < solid else max(0, round(255 * (1 - ((x - solid) / fade)) ** 1.5)) if x < solid + fade else 0
        d.line([(x, 0), (x, H)], fill=(*bg, a))
    out = im.convert("RGBA"); out.alpha_composite(ov)
    out.convert("RGB").save(os.path.join(OUT, name), quality=80, method=6); print(name, out.size)


left_fade("ban2-gastro.webp", "chef2.png", RED)
left_fade("ban2-pracovne.webp", "work2.png", DARK)
left_fade("ban2-firmy.webp", "emb.png", PAPER, solid=600, fade=300)
cut_banner("ban2-obuv.webp", [("cut-evo-s3s.png", 1150, 560, 560, -8)], RED, size=C, alpha=True)
cut_banner("ban2-zdrav.webp", [("cut-cesare-set.png", 1175, 530, 560, 0)], PAPER, size=C,
           panel=(830, 120, 1520, 940, (243, 223, 228), 48))

# ---------- banner v hlavičke kategórie (2400×923 = 2,6 : 1) ----------
K = (2400, 923)
photo_banner("kat-gastro.webp", "chef1.png", RED, size=K, x0=1010, fade=420)
photo_banner("kat-pracovne.webp", "work1.png", DARK, size=K, x0=1000, fade=420, crop=.012)
cut_banner("kat-obuv.webp", [("cut-evo-s3s.png", 1760, 470, 600, -8)], (236, 232, 226), size=K)
cut_banner("kat-doplnky.webp", [("cut-roxy-winter.png", 1580, 470, 700, -10), ("cut-double-roxy.png", 1990, 480, 700, 9)], (239, 230, 216), size=K)
cut_banner("kat-zdrav.webp", [("cut-cesare-set.png", 1750, 470, 640, 0)], (243, 223, 228), size=K)

# ---------- podstránky ----------
cut_banner("zdrav-set.webp", [("cut-cesare-set.png", 800, 520, 760, 0)], (243, 223, 228), size=(1600, 1040))
photo_banner("firmy-vysivka.webp", "emb.png", PAPER, size=(1600, 1060), x0=0, fade=1)
