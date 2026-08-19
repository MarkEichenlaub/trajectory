#import "../lib.typ": report

#let data = (
  student: "Leo Li-Savarese",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 2 · Summer 2026",

  summary: (
    "Ten sessions since the Spring 2026 report, spanning the tail end of the AoPS F=ma Problem Series course and the shift into direct F=ma preparation.",
    "Excellent, consistent effort on assigned coursework — every graded week of the AoPS course rated \"exceeds expectations,\" with scores at or near full marks.",
    "Nearly finished the AoPS course (9 of 12 weeks graded); a busy summer schedule cost us some sessions, so we're taking a second, more systematic pass through the material rather than rushing past the gaps.",
    "Started Problems and Solutions in Introductory Mechanics (Morin — \"Blue Morin\") for more F=ma-style, systematic technique practice.",
    "Built out a full F=ma practice-exam system in the portal: the entire archive of real AAPT F=ma exams (2008–2025) is loaded, with 2024 and 2025 fully digitized into individually-graded, topic-tagged questions as a pilot for the rest.",
  ),

  goals: (
    "Make basic calculations — vector components, algebra, unit tracking — automatic, so attention is free for strategy rather than mechanics.",
    "Build the speed and accuracy competition physics requires: roughly three minutes per question on the real F=ma.",
    "Move from recognizing a problem's topic to reflexively knowing the standard approach for it.",
  ),

  progress: (
    "Leo's effort on the AoPS course has been outstanding — every single graded week came back rated \"exceeds expectations,\" and the scores back that up: near-perfect across the board. The last few weeks of the course were disrupted by his summer schedule, which is why weeks 10–12 don't have scores yet. Rather than treat that as a gap to paper over, we're using it as an opportunity: a second, more careful pass through the material, this time through Morin's problem book, which drills the same fundamental techniques in a more systematic, F=ma-shaped way.",
    "The most encouraging development this cycle is one we've been watching for since we started working together: Leo is catching and correcting his own mistakes. This past session he mixed up an \"m\" for mass with an \"m\" for meters in the middle of a derivation — an easy slip — and caught it himself within a few seconds. That kind of self-correction only happens when a student is tracking the physical meaning behind the symbols, not just pushing them around algebraically. It's one of the hardest habits to build and one of the most important, and it's now showing up reliably.",
    "Leo is also already doing one of the genuinely hard things on a test like the F=ma: reading a problem and quickly identifying what it's actually about — dimensional analysis, energy conservation, a force problem — before doing any computation. That recognition skill is usually the last thing to develop, and he's most of the way there. What's still missing is a little different: a small set of core results he should simply have memorized (spring potential energy is the standard example), and a much larger volume of practice so that the initial \"what is this problem?\" hesitation fades into instant recognition.",
    "Looking back through this cycle's homework for patterns, the wobbles cluster in a useful way. In the Data Analysis week, every problem Leo lost partial credit on was about combining or propagating measurement uncertainty — a specific, nameable skill rather than a general weak spot. Elsewhere the slips were split between one subtle conceptual trap (a Newton's-third-law-pairs problem involving very different masses) and a couple of computation-heavy rotational-dynamics problems. That matches what session time already suggested: the physics reasoning is largely there, and what's costing points is a mix of algebraic fluency, calculation speed, and a handful of specific results Leo hasn't yet nailed down cold.",
    "None of this is a surprise for where he is in preparation, but it does mean the plan for the next stretch is now fairly targeted, which is exactly what we want with the real exam six months out.",
  ),

  plan: (
    "Baseline first: Leo will take the AoPS-authored F=ma practice exam under test conditions through the portal as a diagnostic before we set precise targets for the cycles ahead.",
    "Real AAPT F=ma exams on a ramping schedule — one every two weeks to start, moving to weekly as February approaches — administered through the portal's new exam system under simulated test conditions: timed, scratch work saved, auto-graded.",
    "In parallel, a second full pass through the roughly 12 core F=ma topics (energy conservation, force balancing, Kepler's laws, and so on), at about two weeks per topic given the volume of problems and ideas each one covers.",
    "Use the portal's topic tags to pull follow-up problems for anything Leo gets wrong, gets stuck on, or spends too long on — closing the loop between what a practice test reveals and what he actually practices next.",
    "Three-pronged focus for the exam itself: (1) algebra and computation speed and accuracy — currently the single biggest point-cost; (2) a small set of core formulas plus enough problem volume that recognition becomes reflexive, not effortful; (3) test-taking strategy — sizing up a problem in the first ~10 seconds to decide whether to attempt or skip it, including topics we haven't drilled much yet, like graph interpretation.",
    "Recommend two sessions a week going forward — one exam-focused (working practice tests, drilling whatever the data shows is weakest), one fundamentals-focused (the topic-by-topic pass) — so both tracks move in parallel. We'll revisit the cadence once Leo's baseline score is in hand.",
  ),

  resources: (
    "Problems and Solutions in Introductory Mechanics (Morin) — closest in style to the real F=ma, and more systematic than the exam itself.",
    "The full archive of real AAPT F=ma exams, 2008–2025, now hosted in the portal.",
    "AoPS's own F=ma practice exam, used as the baseline diagnostic.",
    "The portal's new F=ma practice-test system: timed attempts, auto-grading, scratch-work upload, a topic-tagged question bank for targeted follow-up practice, and — as of this cycle — a timestamp on every answer choice, so we can see roughly how long each question actually took.",
  ),

  support: (
    "Protect Leo's practice time, especially around the exam-track sessions — a full practice test plus review takes real sustained focus.",
    "When he takes a practice exam at home, encourage him to treat it like the real thing: timed, no notes, scratch work saved (the portal records this automatically now).",
    "Let me know about his schedule as February approaches so we can plan the exam cadence around it — the summer's disruptions are exactly what we want to avoid heading into the real test.",
  ),
)

#report(data)
