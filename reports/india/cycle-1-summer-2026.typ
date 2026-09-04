#import "../lib.typ": report

#let data = (
  student: "India Ewald",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Summer 2026",

  summary: (
    "India is working through the Art of Problem Solving Physics 1: Mechanics course, which covers about the same material as an AP-level first course in physics, but with more challenging problems.",
    "We've finished 4 of the course's 24 weeks since June 9, with about a month off in the middle. We're starting week 5, Forms of Energy, now.",
    "We aren't holding to a fixed schedule. We move on when India masters a topic. She's moving along steadily.",
    "She's doing extraordinarily well. Her math is fluent, and she sees the overall shape of a problem rather than just its steps.",
  ),

  goals: (
    "Learn the introductory concepts of mechanics: velocity, acceleration, projectile motion, energy.",
    "Learn fundamental ideas of physics, especially dimensional analysis.",
    "Recognize which physical idea a problem calls for, and switch between kinematics and energy conservation as the problem demands.",
    "Tie the equations to physical intuition, and use extreme cases to check an answer.",
  ),

  progress: (
    "India is doing extraordinarily well. The hardest part of a physics problem is usually not any single step in it. It's coming out the far end of a long calculation still knowing what you were doing and why. India does this quickly and easily. She can look back at a problem we just spent half an hour on and tell me what the overall approach was.",
    "She also picks the right tool. We've got two big ideas on the table now, kinematics and energy conservation, and different problems want different ones. India recognizes which problem is which, and she moves between the two without getting stuck.",
    "The math isn't slowing her down. She keeps track of the quantities she's working with, and her written work stays organized enough that she can always reach back for the one she needs. That's what keeps a long problem from falling apart in the middle.",
    "We spend a lot of time matching the equations up with physical intuition. India thinks about this without my prompting sometimes. Last session we worked out how far a cart shoots off the end of a ramp after sliding down from a height h. The distance doesn't depend on the strength of gravity at all. India found that surprising, and she wasn't willing to let the algebra be the only reason for it.",
    "So we dug in. Making gravity stronger does two things that work against each other. The cart's moving faster when it leaves the ramp, since it fell through the same height with a bigger pull. But it also comes back down to the ground sooner once it's in the air. Those two effects cancel exactly, and the cart lands in the same place. Once India had that picture, we went back and found it in the algebra.",
    "Checking an answer is becoming a habit rather than something I have to ask for. On the Atwood machine we derived an acceleration and then looked at two extremes, one where the hanging weight is tiny and one where it's enormous, and confirmed the formula gave zero and g. She's comfortable with dimensional analysis too, which catches a different set of mistakes.",
    "On pace: We've covered 4 weeks of 24 since June 9, or one-sixth of the course, and a month of that stretch was a break. That's good progress. If the rate holds we'll finish somewhere near the end of the school year. I'd rather move at the speed India is actually learning than aim at a date.",
  ),

  plan: (
    "Continue through the AoPS sequence in order. Week 5 is Forms of Energy, and after that come simple machines, circular motion, and simple harmonic motion.",
    "Keep pairing every result with a physical reason for it, the way we did with the ramp. India asks for this on her own, so it's easy to build in.",
    "Make the end-of-problem check routine: an extreme case, a limit, or a look at the units before calling a problem finished.",
    "Move into problems where the setup takes as much thought as the algebra, since that's where the AoPS course is headed from here.",
  ),

  resources: (
    "The AoPS Physics 1: Mechanics course materials, which we're following week by week.",
    "The handouts and homework packets in the portal. They follow the course, and they print cleanly if India would rather work on paper.",
  ),

  support: (
    "Protect a steady block of time for the homework each week.",
    "If India gets stuck on a problem, it's fine to leave it and bring it in. The stuck problems are usually the most useful ones for us to work through together.",
    "Ask her to explain a problem out loud sometimes.",
    "Let me know about school tests, travel, or busy weeks so we can plan the workload around them.",
  ),

  sessions: (
    ("Jun 2, 2026", "Half-hour introductory meeting to talk through the course and how we'd work together.", "Physics 1: Mechanics Pre-Test; Velocity and Kinematics"),
    ("Jun 9, 2026", "Unit conversions and estimation, including reading a cyclist's speed off a video and diagnosing a rental-car bill that came from confusing miles with kilometers.", "Velocity: Class Problems"),
    ("Jun 12, 2026", "Orbital geometry and the seasons, then scientific notation and powers of ten, used to turn 3.09 x 10^17 seconds into about 9.5 billion years.", "Mechanics HW set: Velocity"),
    ("Jul 8, 2026", "Average speed over legs traveled at different rates, using t = d/v and adding the times as fractions, with a first look at acceleration.", "Acceleration"),
    ("Jul 15, 2026", "Constant acceleration read off position-time tables, noticing that successive one-second intervals cover distances in the ratio 1, 3, 5.", "Acceleration, Practice Problems 1; Projectile Motion; MCH02: Acceleration - Homework Problems"),
    ("Aug 14, 2026", "A cannonball problem: the minimum launch speed and the horizontal distance that follows, using the free-fall drop 1/2 g t^2.", "Flying Cars and Archer Fish"),
    ("Aug 20, 2026", "The vomit-comet weightlessness graph, which we showed was inconsistent with its own numbers, then the projectile range formula and why 45 degrees is the best launch angle.", "Projectile Motion Homework; Energy Conservation"),
    ("Aug 26, 2026", "Odysseus shooting an arrow through the axe heads: a vertical-drop constraint gives a minimum speed, compared against the speed implied by a 300 m shot.", "Energy Conservation: Class Problems"),
    ("Aug 28, 2026", "Energy conservation for falling and thrown objects, linearizing a data set as y = av^2 + b, and using an Atwood machine to measure g.", "Energy Conservation Homework"),
    ("Sep 4, 2026", "A modified Atwood machine checked in two limiting cases, then a ramp-and-jump problem where energy conservation and projectile motion combine.", "Forms of Energy; Forms of Energy: Class Problems"),
  ),
)

#report(data)
