"""Crop the real figure out of each F=ma exam page.

The first pass at digitizing these exams attached a whole rendered page image to
every question, so the portal showed the statement and the five choices twice --
once as typed text, once inside a 1275x1650 page scan -- and a page shared by two
or three questions let the student read ahead. This finds the actual figure for
each question instead.

The exams are LaTeX output: figures are vector drawings whose axis labels are
separate text objects sitting inside or beside the drawing. Three layouts have to
be handled:

  * figure under the question's own statement (the common case);
  * figure under a shared preamble -- "The following information applies to
    problems 21 and 22" -- in which case it belongs to every question in the
    range, and sits ABOVE the first of them;
  * figure that IS the answer choices, where the choice text is just "(see
    figure)" and each option is a diagram labelled (A)..(E). There the choice
    markers have to stay inside the crop.

Usage:
    python scripts/crop_fma_figures.py                # all exams -> work/fma/crops
    python scripts/crop_fma_figures.py fma-2025       # one exam
"""

import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

PDF_DIR = Path("work/fma")
OUT_DIR = Path("work/fma/crops")
DPI = 200

QUESTION_RE = re.compile(r"^\s*(\d{1,2})\.\s")
CHOICE_RE = re.compile(r"^\s*\((A|B|C|D|E)\)")
# "The following information applies to problems 2 and 3." (2024/2025) and
# "The following information is used for questions 2 and 3." (2008/2009).
PREAMBLE_RE = re.compile(
    r"following information\s+(?:applies to|is used for|is for|pertains to)\s+"
    r"(?:problems?|questions?)\s+(\d{1,2})\s*(?:and|,|-|through|&)\s*(\d{1,2})",
    re.I | re.S,
)

TOP_MARGIN = 45      # below the running header and its rule
BOTTOM_MARGIN = 60   # above the copyright line
PAGE_RULE_MIN_WIDTH = 450
PAD = 6


def document_anchors(doc):
    """{page_index: [(y_top, kind, payload)]} for the whole document.

    Question starts are matched line by line and only in strict 1,2,3... order.
    Block-level matching missed "23." when a stray fragment of the previous
    question's math shared its block, and sequence-checking keeps a "12." inside
    a sentence from being mistaken for a question.
    """
    per_page = {i: [] for i in range(len(doc))}
    expected = 1
    for pno in range(len(doc)):
        page = doc[pno]
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            # Spans split mid-word, so join within a line without a separator and
            # only put spaces between lines -- otherwise "following" can arrive
            # as "follo wing" and the preamble regex silently never matches.
            btext = " ".join("".join(s["text"] for s in l["spans"]) for l in block["lines"])
            pm = PREAMBLE_RE.search(btext)
            if pm:
                lo, hi = int(pm.group(1)), int(pm.group(2))
                per_page[pno].append(
                    (block["bbox"][1], "preamble", list(range(min(lo, hi), max(lo, hi) + 1)))
                )
                continue
            for line in block["lines"]:
                ltext = "".join(s["text"] for s in line["spans"])
                m = QUESTION_RE.match(ltext)
                if m and line["bbox"][0] < 120 and int(m.group(1)) == expected:
                    per_page[pno].append((line["bbox"][1], "question", expected))
                    expected += 1
    for pno in per_page:
        per_page[pno].sort(key=lambda t: t[0])
    return per_page


def looks_like_equation(parts, box):
    """True when the 'drawing' is really a displayed formula.

    Fraction bars and radical overlines are vector objects, so a centred
    equation reads as a figure. A real diagram has some vertical structure --
    an axis, a curve, a box -- rather than only paper-thin horizontal rules.
    """
    tallest = max((r.height for r in parts), default=0)
    return tallest < 8 and box.height < 45


def figure_rects(page):
    out = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.y0 < TOP_MARGIN or r.y1 > page.rect.height - BOTTOM_MARGIN:
            continue
        # The full-width rule under the running header.
        if r.width > PAGE_RULE_MIN_WIDTH and r.height < 2.5:
            continue
        out.append(fitz.Rect(r))
    return out


def choice_region_top(page, top, bottom):
    """y of the first answer-choice line in this span, or None.

    Fraction bars and radical overlines inside the choices are real drawing
    objects; without this they drag the figure box down over the options.
    """
    ys = [b[1] for b in page.get_text("blocks")
          if top <= b[1] and b[3] <= bottom and CHOICE_RE.match(b[4])]
    return min(ys) if ys else None


def choices_are_figures(page, top, bottom):
    """True when the answer options are diagrams, not text.

    Such a question has choice blocks that carry no content beyond the "(A)"
    marker itself -- the option is the picture next to it.
    """
    bodies = []
    for b in page.get_text("blocks"):
        if b[1] < top or b[3] > bottom:
            continue
        if CHOICE_RE.match(b[4]):
            bodies.append(CHOICE_RE.sub("", b[4]).strip())
    return len(bodies) >= 3 and all(len(x) <= 2 for x in bodies)


def grow_over_labels(page, box, top, bottom, keep_choice_markers):
    """Expand the box over figure text (axis labels) but not prose."""
    blocks = page.get_text("blocks")
    changed = True
    while changed:
        changed = False
        for b in blocks:
            r = fitz.Rect(b[0], b[1], b[2], b[3])
            text = b[4].strip()
            if not text or r.y0 < top or r.y1 > bottom:
                continue
            if QUESTION_RE.match(b[4]) or PREAMBLE_RE.search(b[4]):
                continue
            if CHOICE_RE.match(b[4]) and not keep_choice_markers:
                continue
            if box.contains(r):
                continue
            probe = fitz.Rect(box)
            probe.x0 -= 16; probe.y0 -= 10; probe.x1 += 16; probe.y1 += 10
            if not probe.intersects(r):
                continue
            # Axis labels are short; a long line is prose sitting near the figure.
            if len(text) > 40 and not CHOICE_RE.match(b[4]):
                continue
            merged = box | r
            if merged != box:
                box, changed = merged, True
    return box


def crop_exam(exam_id):
    doc = fitz.open(PDF_DIR / f"{exam_id}.pdf")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    figures = {}   # question_num -> output path
    shared = {}    # question_num -> question_num that owns the shared figure

    per_page = document_anchors(doc)
    for pno in range(len(doc)):
        page = doc[pno]
        marks = per_page[pno]
        if not marks:
            continue
        for i, (y, kind, payload) in enumerate(marks):
            top = y
            bottom = marks[i + 1][0] if i + 1 < len(marks) else page.rect.height - BOTTOM_MARGIN

            keep_markers = kind == "question" and choices_are_figures(page, top, bottom)

            # A question span holds at most one figure, so union every drawing in
            # it rather than clustering: the parts are often bare lines with zero
            # width or height, which no per-piece size filter would survive.
            parts = [b for b in figure_rects(page) if b.y0 >= top - 4 and b.y1 <= bottom + 4]
            if not keep_markers:
                cut = choice_region_top(page, top, bottom)
                if cut is not None:
                    parts = [b for b in parts if b.y1 <= cut - 2]
            if not parts:
                continue
            box = parts[0]
            for b in parts[1:]:
                box = box | b
            if looks_like_equation(parts, box):
                continue
            box = grow_over_labels(page, box, top, bottom, keep_markers)
            box.x0 -= PAD; box.y0 -= PAD; box.x1 += PAD; box.y1 += PAD
            box = box & page.rect
            if box.width < 40 or box.height < 30:
                continue

            owner = payload[0] if kind == "preamble" else payload
            out = OUT_DIR / f"{exam_id}-q{owner:02d}.png"
            page.get_pixmap(clip=box, dpi=DPI).save(out)
            figures[owner] = out
            if kind == "preamble":
                for q in payload:
                    shared[q] = owner

    # Every question in a shared-preamble range gets the same figure.
    mapping = {q: figures[q].name for q in figures}
    for q, owner in shared.items():
        if owner in figures:
            mapping[q] = figures[owner].name

    print(f"{exam_id}: {len(mapping)} questions with figures -> {sorted(mapping)}")
    return mapping


if __name__ == "__main__":
    exams = sys.argv[1:] or [p.stem for p in sorted(PDF_DIR.glob("fma-*.pdf"))]
    all_maps = {e: crop_exam(e) for e in exams}
    (OUT_DIR / "figure_map.json").write_text(json.dumps(all_maps, indent=1))
    print(f"\nwrote {OUT_DIR / 'figure_map.json'}")
