#import "../lib.typ": report

#let data = (
  student: "Test Student",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Summer 2026",
  summary: (
    "Five sessions between July 16 and August 13 took us through the backbone of mechanics: kinematics graphs, energy methods, momentum and collisions, circular motion, and forces with friction.",
    "Test Student completed four olympiad problems this cycle - two USAPhO (Circus Act, Fast and Furious) and two IPhO (Carrying a Bar, Rotating Rod) - all turned in within a week of being assigned.",
    "The biggest shift I saw was strategic rather than computational: by August, Test Student was choosing between energy, momentum, and Newton's second law before writing anything down, instead of defaulting to force equations.",
    "Three USAPhO problems and an F=ma practice set are currently in flight and will carry us into next cycle."
  ),
  goals: (
    "Build a working command of the standard mechanics toolkit - kinematics, energy, momentum, and forces - to the point where choosing the right method is automatic rather than a guess.",
    "Get comfortable with multi-part olympiad-style problems, where the algebra is long enough that a clean setup is the difference between finishing and stalling."
  ),
  progress: (
    "We opened on July 16 with position, velocity, and acceleration graphs for one-dimensional motion, and Test Student took to the slope-and-area relationships almost immediately - the two-stage acceleration problem at the end of that session came together with very little help from me. That gave me a good read on the starting point: the mechanics of graph reading were solid, and what we needed to build was the judgment layer on top of it.",
    "The following week is the one I keep coming back to. When we introduced the work-energy theorem, the sticking point turned out to be a question left over from our kinematics-only approach: why the normal force does no work on a block sliding down an incline. We spent a real chunk of that session on it, and I was glad we did, because the idea that a force perpendicular to the displacement contributes nothing kept paying off. It showed up again on July 30 when we derived conservation of momentum from Newton's third law, and again on August 6 in the loop-the-loop problem, where Test Student was the one who pointed out that we could get the minimum speed at the top from energy conservation rather than grinding through the dynamics. That is exactly the goal of this cycle in miniature - not knowing more formulas, but knowing which one to reach for.",
    "The collisions session gave us the other highlight. Working elastic and inelastic collisions in the lab frame produces algebra that is genuinely unpleasant, so we tried the center-of-mass frame instead, and watching the equations collapse to something manageable clearly landed. By our last session on August 13, working systems of blocks on inclines with friction, Test Student was picking coordinate axes aligned with the incline before I said anything, which is the same instinct applied to a different problem. Speed is up, the free body diagrams are labeled carefully, and the errors I am seeing now are arithmetic slips rather than conceptual misunderstandings."
  ),
  plan: (
    "Move into rotational mechanics properly - torque, moment of inertia, and angular momentum. We have already touched it sideways through the IPhO problems on the carried bar and the rotating rod, so the formal treatment should feel like naming things Test Student has half-met already.",
    "Add rolling motion and the parallel axis theorem, then connect angular momentum conservation back to the collision work from July 30.",
    "Begin dedicated F=ma preparation: the exam rewards fast estimation and eliminating wrong answers, which is a different skill from the long-form olympiad problems we have been doing. The fma-practice-aops set assigned August 19 is the start of that.",
    "Finish and review the three USAPhO problems currently outstanding - Moment of Clarity, Death Metal, and Black Tides."
  ),
  resources: (
    "Morin, Introduction to Classical Mechanics - the rotation and angular momentum chapters, with the starred problems as a stretch.",
    "The AoPS F=ma practice set (fma-practice-aops) for timed multiple-choice work.",
    "The AAPT problem archive for past F=ma and USAPhO exams, which is where our assigned problems are drawn from."
  ),
  support: (
    "Ask Test Student to explain one problem from the week out loud to you - you do not need to follow the physics, and in fact it works better if you do not, since teaching an interested non-expert is the fastest way to find the gaps.",
    "Protect one uninterrupted two-hour block for the assigned problem rather than several short sittings. These take sustained attention, and the completed work this cycle suggests that is already happening.",
    "If Test Student gets stuck for more than about twenty minutes, encourage setting it down and coming back the next day rather than pushing through. Nearly every breakthrough I have seen comes after a break.",
    "No need to check answers or correctness at home - getting a problem wrong and bringing it to me is more useful than getting it right alone."
  ),
  sessions: (
    ("Jul 16, 2026", "We built position, velocity, and acceleration graphs for 1D motion and practiced translating between them; Test Student picked up the slope and area relationships quickly and handled a two-stage acceleration problem nearly independently.", "USAPhO 2023 A1"),
    ("Jul 23, 2026", "We introduced the work-energy theorem and worked conservation problems on inclines and springs, spending extra time on why the normal force does no work - the leftover sticking point from our kinematics-only approach.", "USAPhO 2023 B2"),
    ("Jul 30, 2026", "We derived conservation of momentum from Newton's third law and worked elastic and inelastic collisions, including a center-of-mass frame trick that made the algebra dramatically cleaner.", "IPhO 1970 T1"),
    ("Aug 6, 2026", "We covered centripetal acceleration, banked curves, and vertical circles, and Test Student solved the classic loop-the-loop minimum-speed problem by connecting it back to the energy methods from two weeks earlier.", "IPhO 1975 T1"),
    ("Aug 13, 2026", "We worked systems of blocks on inclines with friction, drawing free body diagrams for each block and applying the second law component-wise; Test Student is now fast at choosing coordinate axes that simplify the algebra.", "USAPhO 2022 A1; USAPhO 2022 A2; USAPhO 2025 A2; AoPS Practice Exam 1"),
  ),
)

#report(data)
