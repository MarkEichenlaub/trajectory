"""Trim the uniform white border from a rendered Asymptote figure.

Only the empty margin is removed, so positions within the figure are unchanged.
Flattens alpha onto white first, since Asymptote PDFs rasterise with a
transparent background and a naive bbox would then see the whole canvas as ink.

Usage: python trim_png.py <in.png> <out.png> [pad=12]
"""
import sys
from PIL import Image, ImageChops


def main():
    src, dst = sys.argv[1], sys.argv[2]
    pad = int(sys.argv[3]) if len(sys.argv) > 3 else 12

    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        flat = Image.new("RGB", im.size, (255, 255, 255))
        flat.paste(im, mask=im.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")

    bg = Image.new("RGB", im.size, (255, 255, 255))
    bbox = ImageChops.difference(im, bg).convert("L").point(lambda v: 255 if v > 12 else 0).getbbox()

    if bbox:
        left = max(bbox[0] - pad, 0)
        top = max(bbox[1] - pad, 0)
        right = min(bbox[2] + pad, im.width)
        bottom = min(bbox[3] + pad, im.height)
        im = im.crop((left, top, right, bottom))

    im.save(dst, "PNG", optimize=True)


if __name__ == "__main__":
    main()
