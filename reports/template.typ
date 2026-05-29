// ============================================================================
// Eichenlaub Physics — Progress Report (worked sample / template)
//
// Copy this file to reports/<student>/<cycle>.typ, edit the `data` block, then:
//   typst compile <file>.typ <file>.pdf      (one-off)
//   typst watch   <file>.typ <file>.pdf      (live preview while editing)
//
// The layout lives in lib.typ — you only ever edit `data`. The drafting script
// (draft.mjs) generates a file in exactly this shape from portal DB data.
//
// One cycle = one block of 10 sessions.
// ============================================================================

#import "lib.typ": report

#let data = (
  student: "Leo Li-Savarese",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Spring 2026",

  // Summary as bullets — parents skim; bullets surface the headline facts fast.
  summary: (
    "Completed the Art of Problem Solving mechanics course with a top-10 finish (85%; 3rd-highest score in the second half).",
    "Solved 293 of 297 assigned problems and attended every session.",
    "Already capable of a 5/5 on the non-calculus AP Mechanics exam with light test-specific practice.",
  ),

  goals: (
    "Make basic calculations (vector components, algebraic limits) automatic so attention is free for strategy.",
    "Begin reasoning top-down: identify principles first, then structure, then computation.",
    "Build the speed and accuracy that competition physics requires.",
  ),

  progress: (
    "What strikes me most about Leo is his cognitive flexibility. I recently walked him through extreme-case reasoning in a simple mechanical system — an exercise that blends physical intuition with abstract math and deliberately avoids procedural steps. Leo understood almost immediately what we were trying to do. This is typically the hardest skill to teach and the last to develop.",
    "He is also strikingly metacognitive. Leo regularly notices how earlier lessons set up later ones — pointing out the very scaffolding I designed into the course — and uses those observations to direct his own effort.",
    "As expected at this stage, the material isn't yet automatic. Leo knows every idea in the course, but each step still takes effort. The next phase focuses on solving many problems where the same techniques recur in slightly different contexts, so those steps fade into the background.",
  ),

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

  // Parent-facing: concrete, low-pressure ways to help between sessions.
  support: (
    "Protect a consistent ~3 hours/week of quiet problem-solving time — steady reps matter more than long crams.",
    "Encourage Leo to attempt every problem fully before checking the solution; struggle is where the learning happens.",
    "Ask him to explain one problem to you each week out loud — teaching it back is the fastest way to cement an idea.",
    "Let me know about upcoming tests, travel, or schedule crunches so we can plan the workload around them.",
  ),

  sessions: (
    ("Feb 4, 2026",  "Kinematics review with extreme-case reasoning on a pulley system.", "Morin 2.1–2.6"),
    ("Feb 11, 2026", "Newton's laws; free-body diagrams under constraint.",               "HRK Ch. 5 problems"),
    ("Feb 18, 2026", "Energy methods and when to prefer them over forces.",               "Morin 5.x selected"),
    ("Feb 25, 2026", "Momentum and collisions; symmetry shortcuts.",                       "HRK Ch. 9 problems"),
    ("Mar 4, 2026",  "Rotational dynamics introduction.",                                  "Morin 7.1–7.4"),
  ),
)

#report(data)
