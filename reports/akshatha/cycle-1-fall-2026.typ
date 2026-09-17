#import "../lib.typ": report

#let data = (
  student: "Akshatha Arunkumar",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Fall 2026",
  summary: (
    "We've had nine sessions since late August, moving from dimensional analysis and scaling through oscillations, rotation, and gravitation - roughly half the content of the F=ma exam.",
    "On the practice F=ma, Akshatha scored above the qualifying bar, and her algebra was fast and clean. She's missed mostly hard conceptual questions on topics that we haven't covered together yet.",
    "We've gone over specific F=ma strategies and are still refining how the practice F=ma exams work, focusing on timing, speed, and process of elimination.",
    "Akshatha is comfortable enough with calculus that we set up and integrated the shell theorem by hand, which is a USAPhO-level exercise.",
    "In the next cycle, we'll finish Kepler's laws, then work on fluids and error analysis to finish F=ma prep, then move on to understanding the USAPhO, a completely new test type."
  ),
  goals: (
    "Long term: qualify for USAPhO, then earn USAPhO Gold or better.",
    "Conduct mock F=ma exams to test where Akshatha is in her prep and find weak points to practice.",
    "Practice reasoning tools useful in physics: checking limiting cases, using dimensional analysis, analytical approximations, and numerical estimation."
  ),
  progress: (
    [Akshatha came in with strong, fluent math and has spent this cycle applying it to mechanics. Our first few sessions were about scaling and dimensional analysis. We tackled problems we couldn't approach otherwise, e.g. finding the oscillation frequency of a water droplet. We introduced first-order Taylor series to relate things like small proportional changes in the surface tension and radius of hanging water drops. From there we moved into oscillations and rotation. We studied spring energy and why a linear spring's period doesn't depend on amplitude, moments of inertia by integration, the parallel axis theorem, rolling without slipping, and angular momentum. Akshatha has been working on checking her results, not just finishing a calculation. For example, we derived the acceleration of a rolling object, $a = g sin(theta) / (1 + k)$, with $k$ a parameter depending on how mass is distributed. Akshatha practiced understanding the $k -> 0$ and $k -> infinity$ cases intuitively and matching that intuition to the equation.],
    "In the gravitation session on September 10, Akshatha worked on proving Newton's Shell Theorem with calculus. She hadn't set up an integral like that before, so we built it piece by piece. She got the ring area to within a factor she spotted herself once I pointed her at the dimensions. We missed an algebra step, so we continued with what we knew was the right answer, and then we corrected the algebra step with a separate handout afterwards. When I told her that g actually increases (as opposed to our model's result of decreasing) as you descend into a real mine, she realized the discrepancy was because of the model's assumption of uniform density.",
    "The September 15 session was about turning what Akshatha knows into points on a timed exam. She had gone past 75 minutes on the practice test, so we talked about pacing: give a problem five minutes, then mark it, put something down, and come back. Akshatha was worried that if she guesses on mock exams, her score might come out artificially high. I introduced a feature on the exams where she can star problems she's guessing on. Each exam now generates three scores: a score earned in 75 minutes, ignoring her guesses; a score earned in 75 minutes, including her guesses; and a score earned after using extra time. We'll track all three, aiming to get the first score up above the passing threshold on F=ma every time. Akshatha's practice exam showed she wasn't familiar with the physical pendulum or the analytic approximations related to small oscillations, so we worked through those in two problems."
  ),
  plan: (
    "Keep doing full-length F=ma practice exams. We've adjusted the timer to put more time pressure on her. In reviews, we'll take the problems that took her the most time and find shorter ways to do the calculation.",
    "Practice eliminating answer choices with dimensions and limiting cases. This sometimes solves a whole problem, and other times narrows five answer choices down to two.",
    "Finish Kepler's laws and orbital mechanics, then move into fluids, error analysis, and the rest of the topics the F=ma exam reaches beyond pure mechanics.",
    "Start folding in USAPhO-style free-response work, where setting up an integral correctly matters more than picking from five choices."
  ),
  resources: (
    "The F=ma AoPS material and past exams in the portal, worked as timed sets rather than untimed problem practice.",
    "Her mechanics textbook (Blue Morin), one chapter at a time alongside the sessions. She has been reading ahead and doing the multiple choice.",
    "We will begin working through my USAPhO-specific handouts this upcoming cycle."
  ),
  support: (
    "Ask her what a result means physically rather than whether she got it right. She's practicing going beyond completing a calculation successfully, since intuition will answer a lot of F=ma questions quickly.",
    "Protect one uninterrupted 75-minute block for a practice exam over the weekend.",
    "Reading ahead in the textbook between sessions is making a real difference, so it's a good idea to keep that going even in weeks when school gets busy.",
  ),
  sessions: (
    ("Aug 21, 2026", "First meeting, where we talked about the F=ma exam and got a sense of what she already knew.", "2011 F=ma; Blue Morin — Chapter 1", "free"),
    ("Aug 27, 2026", "We used dimensional analysis to build the oscillation frequency of a water droplet out of surface tension, density, and radius, then practiced turning small percent changes into answers with the binomial approximation.", "", 1),
    ("Aug 28, 2026", "We worked through spring energy and simple harmonic motion, landing on why the period of a linear spring doesn't depend on amplitude, and then asked what changes when the restoring force isn't linear.", "AoPS Practice Exam 1", 1),
    ("Aug 31, 2026", "We calculated moments of inertia by integration, checked them against the parallel axis theorem, and used the results to say which shapes roll down an incline fastest.", "Blue Morin — Ch 7, read and multiple choice problems", 1),
    ("Sep 1, 2026", "We derived the acceleration of a rolling sphere and tested it in limiting cases, then estimated the tension in a biceps tendon during a curl at around 200 pounds using torque about the elbow.", "Rolling Without Slipping; Blue Morin — Read ch 8, no need to do the problems yet", 1),
    ("Sep 2, 2026", "We found the minimum friction needed to keep a rolling object from slipping, then moved to angular momentum and split a spinning disc's into an orbital piece and a spin piece.", "", 1),
    ("Sep 8, 2026", "We worked two rotational collisions from Morin, found the fastest and slowest safe speeds on a banked curve, traced the tension along a rope draped over a pulley, and finished on a chain sliding off a table, where the motion runs away exponentially instead of oscillating.", "PhysicsWOOT 2 Practice F=ma Exam 1; Blue Morin — Read Ch 11. Do multiple choice. If done, try some problems; F=ma Rotational Motion & Angular Momentum (online quiz) — Akshatha Arunkumar", 1.5),
    ("Sep 10, 2026", "We built gravitational potential energy from scratch, set up and integrated the shell theorem ring by ring, sketched gravity inside a planet, and computed the 83-minute period of a low Earth orbit from nothing but g and the Earth's radius.", "Gravity from a Spherical Shell — Follow-up from our session: the shell-theorem integral done all the way through, plus the two lines where our algebra went off. Reading only", 1.5),
    ("Sep 15, 2026", "We reviewed her practice F=ma exam, worked the physical pendulum and the swinging semicircular disc, and practiced eliminating answer choices with limiting cases instead of full calculations.", "F=ma Gravity & Kepler's Laws (online quiz) — Akshatha Arunkumar", 1.5),
  ),
)

#report(data)
