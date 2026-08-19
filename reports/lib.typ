// ============================================================================
// Eichenlaub Physics — Progress Report layout library
//
// Exposes `report(data)`, which renders a full report from a data dictionary.
// Per-student files import this and supply their own `data` (see template.typ).
// Image/font paths resolve relative to THIS file, so reports can live in
// subfolders (e.g. reports/leo/2026-fall.typ) and still find the logo.
// ============================================================================

// ---- Brand ----------------------------------------------------------------
#let navy   = rgb("#2a4a6d")
#let cream  = rgb("#f4efe3")
#let border = rgb("#e2d8c4")
#let ink    = rgb("#2a3142")
#let dim    = rgb("#6b7280")

#let heading-font = ("Spectral", "Georgia", "Times New Roman")
#let body-font    = ("IBM Plex Sans", "Helvetica", "Arial")
#let mono-font    = ("IBM Plex Mono", "DejaVu Sans Mono", "Courier New")

// ---- Report renderer ------------------------------------------------------
// `data` fields (all optional except student/mentor/cycle):
//   student, mentor, cycle           — strings
//   summary, goals, plan, resources,
//   support                          — arrays of strings (bullets)
//   progress                         — array of strings (paragraphs)
//   sessions                         — array of (date, summary, assignment) tuples
#let report(data) = {
  set page(
    paper: "us-letter",
    margin: (x: 1in, y: 0.9in),
    footer: context [
      #set text(font: mono-font, size: 8pt, fill: dim)
      #grid(columns: (1fr, auto),
        [eichenlaubphysics.com],
        [#counter(page).display("1")],
      )
    ],
  )
  set text(font: body-font, size: 10.5pt, fill: ink)
  set par(justify: true, leading: 0.7em)

  let section(title) = {
    v(8pt)
    block(below: 8pt)[
      #set text(font: heading-font, size: 15pt, weight: 600, fill: navy)
      #title
      #v(3pt)
      #line(length: 100%, stroke: 0.75pt + border)
    ]
  }

  let subsection(title) = {
    block(above: 12pt, below: 7pt)[
      #set text(font: heading-font, size: 11.5pt, weight: 600, fill: navy)
      #title
    ]
  }

  let bullets(items) = {
    for it in items {
      grid(columns: (12pt, 1fr), gutter: 0pt, text(fill: navy)[•], [#it])
      v(3pt)
    }
  }

  // ---- Title block ----
  grid(
    columns: (auto, 1fr),
    column-gutter: 14pt,
    align: (horizon, horizon),
    image("eichenlaub_icon.png", width: 46pt),
    [
      #set text(font: heading-font, fill: navy)
      #text(size: 20pt, weight: 700)[Physics Mentorship: Progress Report]
      #v(2pt)
      #set text(font: body-font, size: 10.5pt, fill: ink)
      *Student:* #data.student #h(10pt) — #h(10pt) *Mentor:* #data.mentor
      #v(1pt)
      #text(font: mono-font, size: 9pt, fill: dim)[#upper(data.cycle)]
    ],
  )
  v(4pt)
  line(length: 100%, stroke: 1.5pt + navy)
  v(6pt)

  if "summary" in data {
    section("Summary")
    bullets(data.summary)
  }
  if "goals" in data {
    section("Goals at the Outset")
    bullets(data.goals)
  }
  if "progress" in data {
    section("Progress Made")
    for p in data.progress {
      p
      v(5pt)
    }
  }
  if "plan" in data {
    section("Plan for Next Cycle")
    bullets(data.plan)
    if "resources" in data {
      subsection("Resources")
      bullets(data.resources)
    }
  }
  if "support" in data {
    section("How to Support at Home")
    bullets(data.support)
  }

  // ---- Appendix: session log ----
  if "sessions" in data and data.sessions.len() > 0 {
    pagebreak()
    section("Appendix: Session Log")

    // Only show the Assignment column when something was actually assigned.
    // It also has to be a fraction, not `auto`: `auto` sizes to the longest
    // assignment, which squeezes the summary column down to one word per line.
    let has-assignments = data.sessions.any(s => s.at(2).trim() != "")

    if has-assignments {
      table(
        columns: (auto, 1.7fr, 1fr),
        inset: (x: 8pt, y: 6pt),
        align: (left + top, left + top, left + top),
        stroke: 0.5pt + border,
        fill: (_, row) => if row == 0 { navy } else if calc.even(row) { cream } else { white },
        table.header(
          text(fill: cream, weight: 600)[Date],
          text(fill: cream, weight: 600)[Session summary],
          text(fill: cream, weight: 600)[Assignment],
        ),
        ..data.sessions.map(s => (
          text(font: mono-font, size: 9pt)[#s.at(0)],
          [#s.at(1)],
          text(size: 9pt)[#s.at(2)],
        )).flatten(),
      )
    } else {
      table(
        columns: (auto, 1fr),
        inset: (x: 8pt, y: 6pt),
        align: (left + top, left + top),
        stroke: 0.5pt + border,
        fill: (_, row) => if row == 0 { navy } else if calc.even(row) { cream } else { white },
        table.header(
          text(fill: cream, weight: 600)[Date],
          text(fill: cream, weight: 600)[Session summary],
        ),
        ..data.sessions.map(s => (
          text(font: mono-font, size: 9pt)[#s.at(0)],
          [#s.at(1)],
        )).flatten(),
      )
    }
  }
}
