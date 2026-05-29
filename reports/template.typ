// ============================================================================
// Eichenlaub Physics — Progress Report template (Typst)
//
// Compile:  typst compile template.typ report.pdf
// Watch:    typst watch template.typ report.pdf   (live PDF preview)
//
// Fill in the `data` dictionary below (an AI draft can populate it from the
// portal DB), then edit prose by hand. Everything downstream is automatic.
// ============================================================================

// ---- Brand ----------------------------------------------------------------
#let navy   = rgb("#2a4a6d")
#let cream  = rgb("#f4efe3")
#let border = rgb("#e2d8c4")
#let ink    = rgb("#2a3142")
#let dim    = rgb("#6b7280")

// Heading / body fonts. These match the site; Typst falls back gracefully if a
// face isn't installed locally. Install IBM Plex Sans / Spectral for exact match.
#let heading-font = ("Spectral", "Georgia", "Times New Roman")
#let body-font    = ("IBM Plex Sans", "Helvetica", "Arial")
#let mono-font    = ("IBM Plex Mono", "DejaVu Sans Mono", "Courier New")

// ---- Report data ----------------------------------------------------------
// One cycle = one block of 10 sessions.
#let data = (
  student:  "Leo Li-Savarese",
  mentor:   "Mark Eichenlaub",
  cycle:    "Cycle 1 · Spring 2026",

  // Summary as bullets — see note in the workflow doc on why bullets win here.
  summary: (
    "Completed the Art of Problem Solving mechanics course with a top-10 finish (85%; 3rd-highest score in the second half).",
    "Solved 293 of 297 assigned problems and attended every session.",
    "Already capable of a 5/5 on the non-calculus AP Mechanics exam with light test-specific practice.",
  ),

  // Goals the student is working toward this cycle.
  goals: (
    "Make basic calculations (vector components, algebraic limits) automatic so attention is free for strategy.",
    "Begin reasoning top-down: identify principles first, then structure, then computation.",
    "Build the speed and accuracy that competition physics requires.",
  ),

  // Narrative paragraphs — observations, anecdotes, relation to goals.
  progress: (
    "What strikes me most about Leo is his cognitive flexibility. I recently walked him through extreme-case reasoning in a simple mechanical system — an exercise that blends physical intuition with abstract math and deliberately avoids procedural steps. Leo understood almost immediately what we were trying to do. This is typically the hardest skill to teach and the last to develop.",
    "He is also strikingly metacognitive. Leo regularly notices how earlier lessons set up later ones — pointing out the very scaffolding I designed into the course — and uses those observations to direct his own effort.",
    "As expected at this stage, the material isn't yet automatic. Leo knows every idea in the course, but each step still takes effort. The next phase focuses on solving many problems where the same techniques recur in slightly different contexts, so those steps fade into the background.",
  ),

  // Plan for next cycle: skills, topics, resources, what they're preparing for.
  plan: (
    "Take one more focused pass through mechanics, emphasizing recognition — spotting at a glance whether a problem is about energy conservation, dimensional analysis, and so on.",
    "Drill standard procedures (solving equations, force analysis) to reliable speed.",
    "Begin the long ramp toward the F = ma exam over the next ~11 months; introduce USAPhO-level breadth in the following year.",
  ),
  resources: (
    "Physics, 5th ed. (Halliday, Resnick, Krane) — calculus-based bridge to olympiad problems.",
    "Problems and Solutions in Introductory Mechanics (Morin) — best F = ma-style problem collection.",
    "AoPS F = ma prep course (Summer/Fall) as a structured supplement.",
  ),

  // Appendix session log: (date, one-sentence summary, assignment).
  sessions: (
    ("Feb 4, 2026",  "Kinematics review with extreme-case reasoning on a pulley system.", "Morin 2.1–2.6"),
    ("Feb 11, 2026", "Newton's laws; free-body diagrams under constraint.",               "HRK Ch. 5 problems"),
    ("Feb 18, 2026", "Energy methods and when to prefer them over forces.",               "Morin 5.x selected"),
    ("Feb 25, 2026", "Momentum and collisions; symmetry shortcuts.",                       "HRK Ch. 9 problems"),
    ("Mar 4, 2026",  "Rotational dynamics introduction.",                                  "Morin 7.1–7.4"),
  ),
)

// ---- Page setup -----------------------------------------------------------
#set page(
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
#set text(font: body-font, size: 10.5pt, fill: ink)
#set par(justify: true, leading: 0.7em)

// Section heading style
#let section(title) = {
  v(8pt)
  block(below: 8pt)[
    #set text(font: heading-font, size: 15pt, weight: 600, fill: navy)
    #title
    #v(3pt)
    #line(length: 100%, stroke: 0.75pt + border)
  ]
}

#let subsection(title) = {
  block(above: 12pt, below: 7pt)[
    #set text(font: heading-font, size: 11.5pt, weight: 600, fill: navy)
    #title
  ]
}

// Bulleted list helper
#let bullets(items) = {
  for it in items [
    #grid(columns: (12pt, 1fr), gutter: 0pt,
      text(fill: navy)[•], [#it])
    #v(3pt)
  ]
}

// ---- Title block ----------------------------------------------------------
#grid(
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
#v(4pt)
#line(length: 100%, stroke: 1.5pt + navy)
#v(6pt)

// ---- Summary --------------------------------------------------------------
#section("Summary")
#bullets(data.summary)

// ---- Goals this cycle -----------------------------------------------------
#section("Goals This Cycle")
#bullets(data.goals)

// ---- Progress made --------------------------------------------------------
#section("Progress Made")
#for p in data.progress [
  #p
  #v(5pt)
]

// ---- Plan for next cycle --------------------------------------------------
#section("Plan for Next Cycle")
#bullets(data.plan)
#subsection("Resources")
#bullets(data.resources)

// ---- Appendix: session log ------------------------------------------------
#pagebreak()
#section("Appendix: Session Log")
#table(
  columns: (auto, 1fr, auto),
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
    text(size: 9.5pt)[#s.at(2)],
  )).flatten(),
)
