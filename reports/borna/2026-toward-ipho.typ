#import "../lib.typ": report

#let data = (
  student: "Borna Curic",
  mentor:  "Mark Eichenlaub",
  cycle:   "Spring–Summer 2026 · Toward the IPhO",
  summary: (
    "29 sessions since early March, twice a week, aimed squarely at the International Physics Olympiad — Borna is at the competition now, and we are waiting on his results over the coming days.",
    "He has moved through essentially the entire olympiad syllabus — quantum mechanics, statistical mechanics, thermodynamics, special relativity, electromagnetism, optics, waves, and experimental physics — and, more importantly, can put those results to work on unfamiliar problems.",
    "The clearest growth this stretch has been in estimation and mathematical sense-making: knowing roughly what an answer should be and using that to catch his own mistakes.",
    "The summer was a heavy problem-solving push — dozens of full IPhO and USAPhO papers worked to completion across every topic, much of it with Borna running problems independently between sessions."
  ),
  goals: (
    "Command of the full IPhO/USAPhO syllabus — not just familiarity with the results, but the fluency to deploy them on new, unfamiliar problems.",
    "Sharper physical and mathematical judgment: estimating answers, sanity-checking against limiting cases, and finding one's own errors before the mentor does.",
    "Readiness for the IPhO itself, and a foundation deep enough to keep building on across his remaining years of eligibility."
  ),
  progress: (
    "What stands out first about Borna is how much of the curriculum he simply owns. He knows the results across the whole olympiad syllabus, and — more to the point — he knows how to use them. He is very strong at the classic IPhO-style problem: the kind that hands you an unfamiliar setup, a new relation or two, a fresh piece of data, and asks you to fold all of it into what you already know, carry the calculation through, and arrive at an answer. That is the backbone of the exam, and Borna is dependable at it. He is also good at the harder-to-teach side of physics — explaining what is physically happening in a scenario and building a mechanism for it in words before any algebra starts. On the white-dwarf problem, for instance, he could say why electron degeneracy pressure holds the star up before we balanced a single equation.",
    "The area where I have seen the most growth is estimation and mathematical sense-making. When we started, a problem was largely a chain of algebra to be executed; now Borna carries a sense of what the answer ought to look like and uses it to catch his own mistakes. The nonlinear-oscillator work in April was a good marker — he derived the period scaling T ∝ A^((1−α)/2) by pure dimensional analysis, then checked it himself by confirming that α = 1 reproduces simple harmonic motion and α = −2 reproduces Kepler's third law. That instinct to verify against a case you already trust is what separates a solver who happens to be right from one who knows he is right. This skill matters on the IPhO, and it will matter even more in competitions like the European Physics Olympiad, which he may take in future years and where the problems tend to be more open-ended.",
    "The most recent sessions pushed into the deeper end of the syllabus — statistical mechanics and the thermodynamics of entropy and free energy, and a return to special relativity through spacetime diagrams, rapidity, and the four-vector formalism. We looked at problems that collapse to a single line with four-vectors where the brute-force approach runs a full page. Borna can currently reach the answer either way, but the elegant tools are not yet automatic for him — so he tends to smash through the longer algebra. That is exactly the frontier worth working on: turning powerful formalisms from things he understands into things he reaches for by instinct under time pressure. The same is true of connecting each new problem back to the ones he has already solved — recognizing a technique when it reappears in an unfamiliar disguise. It is the skill I most want to keep developing with him, and one the IPhO rewards immediately."
  ),
  plan: (
    "Go deeper into the advanced topics we have opened up: statistical mechanics, and the thermodynamics of entropy and free energies, where real fluency pays off on the hardest theory problems.",
    "Keep building the relativity toolkit — spacetime diagrams, four-vectors, and invariants — until the one-line solution is the one Borna reaches for rather than the page of algebra.",
    "Continue extending quantum mechanics beyond the foundations we have laid.",
    "Deliberately link each new problem back to our tagged archive of past problems, so a technique seen in one context is recognized instantly the next time it shows up in a different one — the single highest-leverage habit for him right now.",
    "Introduce full mock exams under genuine test conditions — not just solving old papers, but practicing the triage: scanning the set, judging which problems he is strong on and which need more time, spending his effort in the right places, and then debriefing that process together. We held this off while building the foundation; now that the topics are in place, it is the natural next focus."
  ),
  resources: (
    "IPhO, USAPhO, and EuPhO past papers remain the core diet — now assembled into timed mock exams built from complete sets.",
    "Kalda's problem collections and Irodov for targeted drill on the topics we are deepening.",
    "Standard references for the advanced material: Blundell & Blundell for statistical and thermal physics, Griffiths for quantum mechanics, and a dedicated treatment of four-vectors and spacetime geometry for the relativity work."
  ),
  support: (
    "Celebrate the IPhO for what it is — a milestone Borna earned a place at — regardless of how the scores land; the experience itself is a real part of the education.",
    "Protect his sleep and a steady rhythm around the heavier prep weeks; this work rewards stamina far more than cramming.",
    "Ask him to explain one problem from the week out loud at home — teaching it back is one of the strongest ways to make a technique stick.",
    "Keep the long view in mind: Borna has two more years of IPhO eligibility ahead, and the foundation is now in place to make each of them count."
  ),
  sessions: (
    ("Mar 10, 2026", "Quantum harmonic oscillator energy levels and wavefunctions, plus Bragg diffraction as a wave-interference warm-up into the time-independent Schrödinger equation.", ""),
    ("Mar 11, 2026", "Time-dependent Schrödinger equation, the Bohr model, and boundary-condition matching for the finite square well.", ""),
    ("Mar 12, 2026", "Heisenberg uncertainty, wave packets as superpositions of plane waves, and the Fourier link between position and momentum representations.", ""),
    ("Mar 13, 2026", "Energy-time uncertainty and the COW neutron interferometry experiment — measuring g from a quantum phase shift.", ""),
    ("Mar 16, 2026", "Boltzmann factor, entropy, density of states, and the canonical partition function tying microstates to thermodynamics.", ""),
    ("Mar 17, 2026", "Working session — no whiteboard content recorded.", ""),
    ("Mar 18, 2026", "Special relativity via the Lorentz factor and rapidity, energy-momentum relation, and 4-momentum formalism.", ""),
    ("Mar 19, 2026", "Light-clock derivation of time dilation, Minkowski diagrams, and the invariant spacetime interval.", ""),
    ("Mar 20, 2026", "White-dwarf capstone balancing electron degeneracy pressure against gravity to find the equilibrium radius.", ""),
    ("Mar 24, 2026", "1D random walk, mean-square displacement, and the connection to diffusion and the central limit theorem.", ""),
    ("Mar 26, 2026", "Error propagation foundations — quadrature for uncorrelated uncertainties applied to a kinematics example.", ""),
    ("Mar 30, 2026", "Working session — no whiteboard content recorded.", ""),
    ("Apr 7, 2026", "Nonlinear oscillators by dimensional analysis: deriving T ∝ A^((1−α)/2) and checking SHM and Kepler as limits.", ""),
    ("Apr 8, 2026", "Continuation of the nonlinear-oscillator scaling, consolidating the dimensional-analysis argument.", ""),
    ("Apr 9, 2026", "Rindler coordinates for uniform acceleration, finite-amplitude pendulum, and Snell's-law refraction of plane waves.", ""),
    ("Apr 15, 2026", "IPhO gravimeter problem — optimizing a zero-length spring on a rotating arm via first and second derivatives of U(θ).", ""),
    ("Apr 16, 2026", "Method of images for a 90° conducting corner and the Apollonius-sphere boundary condition.", ""),
    ("Apr 24, 2026", "Error-propagation drill: c = d/t, power-law uncertainties, and recovering an index of refraction n ≈ 1.0002 from data.", ""),
    ("Apr 30, 2026", "Snell's law and Huygens' rope analogy, mirages, and a refraction lab with a linear fit yielding n ≈ 1.30 and θ = 19.3° ± 0.6°.", "IPhO 2019 E1 — Optical Measurements"),
    ("May 5, 2026", "USAPhO 'Electric Slide': space-charge-limited current via Child-Langmuir, then the diffusion regime via Fick's law and the Einstein relation.", "USAPhO 2019 A3 — Electric Slide"),
    ("May 7, 2026", "Working session — no whiteboard content recorded.", ""),
    ("May 19, 2026", "IPhO biophysics: hierarchical arteriole branching (Murray's law) and apparent-depth image formation through a planar refracting surface.", "IPhO 2018 T3 — Physics of Live Systems"),
    ("May 21, 2026", "Optics framed through the principle of least time.", ""),
    ("May 26, 2026", "Linear and circular polarization, opening the Tokyo 2023 birefringence experiment.", "IPhO 2023 E2 — Birefringence"),
    ("May 27, 2026", "Opening of the circuits unit: impedance, equivalent circuits, resistivity, and power dissipation.", "Balkan 2022 1 — Resistor Circuit"),
    ("Jun 16, 2026", "Statistical mechanics from the ground up: microstate counting, the Boltzmann factor, the barometric formula and Maxwell-Boltzmann distribution, and entropy as S = k ln Ω.", "USAPhO 2024 B3 — Quality Quest"),
    ("Jun 19, 2026", "The chimney 'stack effect' — using hydrostatics and buoyancy to find the temperature-driven pressure difference that drives exhaust up and out.", "USAPhO 2021 B2 — Hot Pocket"),
    ("Jun 23, 2026", "Special relativity: the Lorentz transformation, classifying spacelike and lightlike intervals, and the link between boosts and hyperbolic functions.", "USAPhO 2013 A3 — Relativistic Muon Decay"),
    ("Jun 25, 2026", "Lorentz boosts in rapidity form on a Minkowski diagram, then a pivot into rotational mechanics and angular momentum L = Iω.", "USAPhO 2024 B1 — The Muon Shot"),
  ),
)

#report(data)
