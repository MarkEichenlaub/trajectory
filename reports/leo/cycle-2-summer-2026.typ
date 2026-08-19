#import "../lib.typ": report

#let data = (
  student: "Leo Li-Savarese",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 2 · Summer 2026",

  summary: (
    "Leo is preparing for the F=ma exam in February.",
    "He is nearly finished with the AoPS F=ma course, and has a very high homework score.",
    "Four of this cycle's ten sessions went to mathematics rather than physics, preparing Leo for a placement test at school — so this cycle covers less physics than a typical one.",
    "Leo still needs a second, systematic pass through the material. We'll do this with a series of Fundamentals sessions stretching up to the exam.",
    "In parallel, Leo is ready to begin a series of Practice Test sessions.",
    "In Practice Tests, we'll track Leo's progress, record his accuracy and time taken, break questions down by topic, and link related questions to give Leo personalized, targeted practice.",
    "With two modes of study — Fundamentals and Practice Tests — we could do either one or two sessions per week.",
  ),

  goals: (
    "Make basic calculations — vector components, algebra, unit tracking — automatic, so attention is free for strategy rather than mechanics.",
    "Build the speed and accuracy competition physics requires: roughly three minutes per question on the real F=ma.",
    "Move from recognizing a problem's topic to reflexively knowing the standard approach for it.",
  ),

  progress: (
    "Leo's effort on the AoPS course has been outstanding — every single graded week came back rated \"exceeds expectations,\" and the scores back that up: near-perfect across the board. The homework isn't done under test conditions. We need to replicate Leo's accuracy on the homework in an environment with no outside resources and tight time constraints.",
    "One scheduling note that shapes this cycle: four of our ten sessions, running through April, went to mathematics rather than physics, to prepare Leo for a placement test at school. We worked on logarithms, combinatorics, polygon geometry and trigonometry, and complex numbers — all of it useful groundwork, and Leo handled it well. It does mean the physics preparation described below rests on six sessions rather than ten, and that some of the F=ma topics I'd hoped to reach this cycle have moved into the next one.",
    "The most encouraging development this cycle is one we've been watching for since we started working together: Leo is catching and correcting his own mistakes. This past session he mixed up an \"m\" for mass with an \"m\" for meters in the middle of a derivation — an easy slip — and caught it himself within a few seconds. That kind of self-correction only happens when a student is tracking the physical meaning behind the symbols, not just pushing them around algebraically. It's one of the hardest habits to build and one of the most important, and it's now showing up reliably.",
    "Leo is also already doing one of the genuinely hard things on a test like the F=ma: reading a problem and quickly identifying what it's actually about — dimensional analysis, energy conservation, a force problem — before doing any computation. That recognition skill is usually the last thing to develop, and he's most of the way there.",
    "These improvements are in progress. For example, Leo is catching mistakes with dimensions quickly, but still developing a sense of extreme case reasoning to catch other mistakes. He recognizes the gist of a problem quickly for some topics, but we still need practice with topics like rotation and oscillations.",
    "Looking back through this cycle's homework for patterns, the wobbles cluster in a useful way. In the Data Analysis week, every problem Leo lost partial credit on was about combining or propagating measurement uncertainty — a specific, nameable skill rather than a general weak spot. Elsewhere the slips were split between one subtle conceptual trap (a Newton's-third-law-pairs problem involving very different masses) and a couple of computation-heavy rotational-dynamics problems. That matches what session time already suggested: the physics reasoning is largely there, and what's costing points is a mix of algebraic fluency, calculation speed, and a handful of specific results Leo hasn't yet nailed down cold.",
    "None of this is a surprise for where he is in preparation, but it does mean the plan for the next stretch is now fairly targeted, which is exactly what we want with the real exam six months out.",
  ),

  plan: (
    "A lot of doing well on the F=ma exam is about familiarity with the limited set of tricks the test writers use. The core is a high volume of practice, but we'll be targeted in that to get as much as we can from each practice problem.",
    "We'll start with a baseline: Leo will take the AoPS-authored F=ma practice exam under test conditions as a diagnostic before we set precise targets for the cycles ahead.",
    "Leo will work through real AAPT F=ma exams on a ramping schedule — one every two weeks to start, moving to weekly as February approaches — administered through the Eichenlaub Physics portal's exam system under simulated test conditions: timed, scratch work saved, auto-graded.",
    "In Practice Tests, we'll review these exams together. When a question takes a long time, we'll identify shorter strategies. For example, in our most recent session, instead of testing the dimensions of all five answer choices, we tested choice (a), then realized it was fast and easy to construct and select the answer from there, skipping three more answer choices worth of repetitive calculation. For questions Leo gets wrong, we'll link them back to similar questions we've already done and related questions he hasn't seen for targeted practice.",
    "Practice Tests will work on Leo's speed, accuracy, and familiarity with the questions. He'll know when and how to make an educated guess, how to manage his time, and which topics he's strongest and weakest at.",
    "In parallel, the Fundamentals sessions will work through the roughly 12 core F=ma topics (energy conservation, force balancing, Kepler's laws, and so on), at about two weeks per topic.",
    "These sessions will help Leo know all the fundamental results, or be able to quickly rederive them because he understands where they come from. For example, we recently worked on contrasting the potential energy formulas for gravity and an ideal spring. Leo will have these memorized by the test simply through repeated use in problems, but he also now intuitively understands why one grows more quickly with displacement than the other, which solves some problems without any calculation. We do some calculation, but also a lot of plotting, thought experiments, and diagram-drawing in these sessions.",
    "Leo will benefit significantly from better accuracy and speed with algebra. A little of this is knowing when to write things down versus do them in your head. More of it is consistent practice. Going back to school and resuming regular physics sessions will do a lot for Leo's accuracy, which has gone down a bit over the summer.",
    "Given that we're taking a two-pronged approach, Leo might want to move to two sessions a week — one Fundamentals and one Practice Tests — if logistics and time allow. Otherwise, we can alternate weeks. This will allow one meeting per topic for the Fundamentals, which will only let us cover part of the material in each topic together.",
  ),

  resources: (
    "Problems and Solutions in Introductory Mechanics (Morin) — closest in style to the real F=ma, and more systematic than the exam itself. We will use this as the core of the Fundamentals sessions.",
    "The full archive of real AAPT F=ma exams, 2008–2025, now hosted in the portal.",
    "AoPS's own F=ma practice exam, used as the baseline diagnostic.",
    "The portal's Practice Tests system: timed attempts, auto-grading, scratch-work upload, a topic-tagged question bank for targeted follow-up practice, and a timestamp on every answer choice, so we can see how long each question actually took.",
  ),

  support: (
    "Protect Leo's practice time, especially around Practice Tests sessions — a full practice test is 75 minutes.",
    "When he takes a practice exam at home, encourage him to treat it like the real thing: timed, no notes, scratch work saved (the portal records this automatically now).",
    "Leo is still quite young and new to physics compared to most students who pass the F=ma exam. If he makes progress and learns new techniques, this year is a success.",
    "His interest in nuclear physics is still a driving force, so any opportunities for him to keep exploring that will help his practice stay interesting and rewarding.",
  ),

  // The ten sessions this cycle covers, oldest first. Each line condenses the
  // session summary recorded in the portal at the time.
  sessions: (
    ("Apr 1, 2026", "Logarithm product, quotient, and power rules, plus the change-of-base formula, applied to evaluating logarithms by hand.", ""),
    ("Apr 15, 2026", "Combinatorics — permutations versus combinations, and deriving the formula for n choose k — alongside continued work on logarithm rules.", ""),
    ("Apr 22, 2026", "Derived the interior-angle formula for regular polygons, and used a right-triangle construction to find a sine from a given tangent.", ""),
    ("Apr 29, 2026", "Complex numbers: the Argand diagram, conjugates, division, powers of i via periodicity, and the complex conjugate root theorem.", ""),
    ("May 27, 2026", "Constant-speed motion along a curved path via velocity components, and a first look at the epsilon-delta definition of a limit.", "Blue Morin — read Chapter 1, work problems 1-8"),
    ("Jun 4, 2026", "Derived the Taylor series for sine and cosine from first principles, then used the cosine series to show a pendulum behaves like a spring at small angles.", ""),
    ("Jun 8, 2026", "Worked through Blue Morin, beginning Taylor series.", "Blue Morin — read Appendix B on Taylor Series; Taylor Series for the F = ma Exam"),
    ("Jun 10, 2026", "Applied Taylor series to practical estimation: first-order kinematics, the binomial approximation, and square roots without a calculator.", ""),
    ("Jul 14, 2026", "Measurement uncertainty, and how error propagates when many uncertain quantities are added together.", ""),
    ("Aug 18, 2026", "Two Morin mechanics problems: maximum speed of a mass on a spring by energy conservation, and terminal velocity under linear drag analyzed with a Taylor expansion.", "Blue Morin — finish Ch. 1; AoPS Practice Exam 1 — baseline diagnostic, under test conditions from the F=ma Progress tab"),
  ),
)

#report(data)
