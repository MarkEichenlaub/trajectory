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
# Case-insensitive on purpose: the AoPS practice exam labels its options (a)-(e)
# while the real F=ma uses (A)-(E). An uppercase-only pattern silently failed to
# recognise AoPS choices, so the choice text was never excluded and ended up
# baked into the cropped figure -- showing "(a) (b) (c)" next to the portal's
# own A/B/C radio buttons.
CHOICE_RE = re.compile(r"^\s*\(([A-Ea-e])\)")
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


def _near(a, b, gap):
    """Overlap test that works on degenerate rects.

    A plain axis line or tick has zero width or height, and PyMuPDF treats such
    a rect as empty -- Rect.intersects() is False for it no matter where it sits.
    Clustering on intersects() therefore left every axis and tick as its own
    group, which is why whole choice panels went missing.
    """
    return (a.x0 - gap <= b.x1 and b.x0 <= a.x1 + gap and
            a.y0 - gap <= b.y1 and b.y0 <= a.y1 + gap)


def cluster(rects, gap=14):
    """Merge rects that touch or nearly touch into connected groups."""
    boxes = [fitz.Rect(r) for r in rects]
    changed = True
    while changed:
        changed = False
        merged = []
        for b in boxes:
            for i, o in enumerate(merged):
                if _near(b, o, gap):
                    merged[i] = o | b
                    changed = True
                    break
            else:
                merged.append(fitz.Rect(b))
        boxes = merged
    return boxes


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


MARKER_WORD_RE = re.compile(r"^\(([A-Ea-e])\)$")


def standalone_choice_markers(page, top, bottom):
    """[(letter, Rect)] for choice markers that label a picture, not text.

    Word-level rather than block-level: the AoPS exam puts all five captions in
    one text block ("(a) (b) (c) (d) (e)") while F=ma gives each its own, and
    only words carry per-marker positions. "Standalone" means nothing follows the
    marker on its line -- which is what distinguishes a caption under a diagram
    from "(A) 2πL/v", and keeps text options from being mistaken for panels.
    """
    words = [w for w in page.get_text("words") if top - 2 <= w[1] and w[3] <= bottom + 2]
    out = []
    for w in words:
        m = MARKER_WORD_RE.match(w[4].strip())
        if not m:
            continue
        followed = any(
            o is not w
            and abs(o[1] - w[1]) < 5              # same line
            and 0 < o[0] - w[2] < 45              # close to its right
            and not MARKER_WORD_RE.match(o[4].strip())
            for o in words
        )
        if not followed:
            out.append((m.group(1).upper(), fitz.Rect(w[0], w[1], w[2], w[3])))
    # Keep one per letter, in A..E order.
    seen = {}
    for letter, rect in out:
        seen.setdefault(letter, rect)
    return [(l, seen[l]) for l in "ABCDE" if l in seen]


def split_choice_panels(page, top, bottom):
    """{'A': Rect, ...} for a question whose options are diagrams.

    These render as five little plots each captioned "(a)".."(e)" (AoPS) or
    "(A)".."(E)" (F=ma). Keeping them as one image forces the portal to show the
    source's own lettering beside its A-E radio buttons, and on AoPS that
    lettering is lowercase. Splitting one panel per choice lets each option carry
    its own picture, so the only label anywhere is the portal's.
    """
    markers = standalone_choice_markers(page, top, bottom)
    if len(markers) != 5:
        return {}

    parts = [r for r in figure_rects(page) if r.y0 >= top - 4 and r.y1 <= bottom + 4]
    if not parts:
        return {}
    full = parts[0]
    for r in parts[1:]:
        full = full | r
    # Include the panels' own axis labels in the overall extent.
    for b in page.get_text("blocks"):
        r = fitz.Rect(b[0], b[1], b[2], b[3])
        text = b[4].strip()
        if not text or len(text) > 12 or CHOICE_RE.match(b[4]):
            continue
        if r.y0 >= top and r.y1 <= bottom and _near(full, r, 12):
            full = full | r

    # These layouts are always a row or a column of equal panels, so slice the
    # figure on the midpoints between captions. That's far steadier than trying
    # to cluster each panel: axes and ticks are degenerate rects that cluster
    # unpredictably, and one stray tick would silently drop a whole option.
    xs = [(m[1].x0 + m[1].x1) / 2 for m in markers]
    ys = [(m[1].y0 + m[1].y1) / 2 for m in markers]
    # Only a single row of panels with the caption centred beneath each one is
    # safe to slice this way. In a stacked layout the "(A)" sits partway down its
    # panel, so midpoints between captions don't line up with panel edges and
    # each slice ends up straddling two options. Those fall back to one image --
    # harmless, because every exam except the AoPS practice test already labels
    # its panels (A)-(E), which is exactly what the portal shows.
    horizontal = max(ys) - min(ys) < 8
    if not horizontal:
        return {}

    order = sorted(range(5), key=lambda i: xs[i])
    centres = [xs[i] for i in order]
    lo, hi = full.x0, full.x1
    edges = [lo] + [(centres[i] + centres[i + 1]) / 2 for i in range(4)] + [hi]

    out = {}
    for slot, i in enumerate(order):
        letter = markers[i][0]
        box = fitz.Rect(full)
        box.x0, box.x1 = edges[slot], edges[slot + 1]
        box.x0 -= PAD / 2; box.y0 -= PAD / 2; box.x1 += PAD / 2; box.y1 += PAD / 2
        # Clip the caption off AFTER padding -- padding applied afterwards just
        # lets a sliver of the "(a)" back into frame.
        box.y1 = min(box.y1, min(m[1].y0 for m in markers) - 2)
        box = box & page.rect
        if box.width < 20 or box.height < 20:
            return {}
        out[letter] = box

    return out if len(out) == 5 else {}


def crop_exam(exam_id):
    doc = fitz.open(PDF_DIR / f"{exam_id}.pdf")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    figures = {}         # question_num -> output filename
    choice_figures = {}  # question_num -> {'A': filename, ...} when options are diagrams
    shared = {}          # question_num -> question_num that owns the shared figure

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

            # Options that are diagrams become one image per choice. Gated on
            # split_choice_panels' own standalone-marker test rather than
            # choices_are_figures, which counts "(D) 2" as a bare marker.
            if kind == "question":
                panels = split_choice_panels(page, top, bottom)
                if panels:
                    for letter, box in panels.items():
                        out = OUT_DIR / f"{exam_id}-q{payload:02d}{letter}.png"
                        page.get_pixmap(clip=box, dpi=DPI).save(out)
                    choice_figures[payload] = {L: f"{exam_id}-q{payload:02d}{L}.png" for L in panels}
                    continue

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

    print(f"{exam_id}: {len(mapping)} with figures -> {sorted(mapping)}")
    if choice_figures:
        print(f"{' ' * len(exam_id)}  {len(choice_figures)} with per-choice diagrams -> {sorted(choice_figures)}")
    return {"figures": mapping, "choiceFigures": choice_figures}


if __name__ == "__main__":
    exams = sys.argv[1:] or [p.stem for p in sorted(PDF_DIR.glob("fma-*.pdf"))]
    all_maps = {e: crop_exam(e) for e in exams}
    (OUT_DIR / "figure_map.json").write_text(json.dumps(all_maps, indent=1))
    print(f"\nwrote {OUT_DIR / 'figure_map.json'}")
