#import "../lib.typ": report

#let data = (
  student: "Akshatha Arunkumar",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Fall 2026",
  summary: (
    "Nine sessions since late August, moving from dimensional analysis and scaling through oscillations, rotation, and gravitation - roughly the full mechanics core of the F=ma exam.",
    "On the practice F=ma she scored above the qualifying bar, and her algebra was fast and clean. What cost her points was conceptual: problems written so the standard formula doesn't quite apply until you rearrange something.",
    "She is comfortable enough with calculus that we set up and integrated the shell theorem by hand, which is a USAPhO-level exercise, not an F=ma one.",
    "Eleven assignments went out this cycle and she completed nine of them, including a full practice exam and several textbook chapters, between sessions."
  ),
  goals: (
    "Qualify for the USAPhO on the F=ma exam, with the longer-term aim of a gold medal or better on the USAPhO itself.",
    "Build the physicist's habits that make hard problems tractable: checking limiting cases, using dimensional analysis, and reading an answer to see whether it's reasonable before trusting it."
  ),
  progress: (
    [Akshatha came in with strong math and has spent this cycle learning to point it at physics. Our first few sessions were about scaling: what happens to a quantity when you change another one a little. We built the oscillation frequency of a water droplet purely out of units, then used the binomial approximation to turn a 1% change in surface tension into a 0.5% change in a hanging drop's radius. From there we moved into oscillations and rotation - spring energy and why a linear spring's period doesn't care about amplitude, moments of inertia by integration, the parallel axis theorem, rolling without slipping, and angular momentum. She picked up the habit of sanity-checking results early. When we derived the acceleration of a rolling sphere, $a = g sin(theta) / (1 + k)$, she was willing to push $k$ to zero and to infinity and see whether the formula still said something sensible.],
    "The gravitation session on September 10 is the one I'd point to. I gave her a spherical shell and asked her to find the force it exerts on an outside point, which is the problem Newton had to solve. She hadn't set up an integral like that before, so we built it piece by piece: slice the shell into rings, find the area of a ring, convert that to mass, write the potential from one ring, then integrate. She got the ring area to within a factor she spotted herself once I pointed her at the dimensions - the expression wasn't an area, so something was missing. Our algebra then went sideways in the last step and we didn't land the clean answer in the session. I told her the honest thing: I knew what the answer had to be, the setup was right, and the error was mine to track down. I wrote up the corrected derivation afterward and sent it to her. She then used the two shell results to sketch gravitational acceleration inside and outside a planet, and when I told her that g actually increases as you descend into a real mine, she found the broken assumption - uniform density - on her own.",
    "The September 15 session was about turning what she knows into points on a timed exam. She had gone past 75 minutes on the practice test, so we talked about pacing: give a problem about five minutes, then mark it, put something down, and come back. She pushed back on guessing, and her reason was good - a lucky guess makes the score look better than her actual understanding. I take that seriously, so I'm adding a way to flag problems in the portal and a separate 75-minute score, so she can guess without muddying the picture of what she knows. We then worked the physical pendulum, a disc pivoted off center, and used the limits to kill three of the five answer choices before doing any real calculation: the period has to blow up as the pivot nears the center, and it has to reduce to an ordinary pendulum when the offset is much larger than the radius. She spotted two of those eliminations herself. We carried the same method to a swinging semicircular disc and found its center of mass with an energy argument rather than an integral."
  ),
  plan: (
    "Keep drilling full-length F=ma practice exams under the 75-minute clock, with a review session on the missed problems and the slow ones.",
    "Make elimination and limiting cases a first move rather than a last resort - on multiple choice, checking what an answer does in an extreme case is often faster than solving.",
    "Finish Kepler's laws and orbital mechanics, then move into fluids, thermodynamics, and the rest of the topics the F=ma exam reaches beyond pure mechanics.",
    "Start folding in USAPhO-style free-response work, where setting up an integral correctly matters more than picking from five choices."
  ),
  resources: (
    "The F=ma problem series and past exams in the portal, worked as timed sets rather than untimed problem practice.",
    "Her mechanics textbook, one chapter at a time alongside the sessions - she has been reading ahead and doing the multiple choice.",
    "The written shell-theorem derivation I sent, as a model for how a long setup-heavy calculation should be laid out."
  ),
  support: (
    "Ask her what a result means physically rather than whether she got it right - explaining out loud why a formula has to look a certain way is most of the skill we're building.",
    "Protect one uninterrupted 75-minute block for a practice exam when one is assigned; taking it in pieces loses the pacing practice that's the whole point.",
    "Reading ahead in the textbook between sessions is making a real difference, so it's a good idea to keep that going even in weeks when school gets busy.",
    "No need to nudge her about effort. She works hard and she's willing to sit with a hard problem for a long time, which is the trait that matters most here."
  ),
  sessions: (
    ("Aug 21, 2026", "First meeting, where we talked about the F=ma exam and got a sense of what she already knew.", "2011 F=ma; Blue Morin — Chapter 1", 0.5),
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
