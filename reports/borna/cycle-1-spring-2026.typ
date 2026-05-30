#import "../lib.typ": report

#let data = (
  student: "Borna",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Spring 2026",
  summary: (
    "25 sessions covering an unusually broad sweep of IPhO-level physics: quantum mechanics, statistical mechanics, special relativity, astrophysics, oscillations, electrostatics, and optics.",
    "Completed 17 IPhO and USAPhO problems in a focused problem-solving push, with new circuits, birefringence, and piezoelectric problems now queued up.",
    "Built real experimental-physics skill: error propagation became automatic, and a hands-on refraction lab was fit to R² = 0.9996 with full uncertainty analysis.",
    "Closed the cycle by opening two new fronts — polarization/birefringence and the start of circuits (impedance, Thevenin, equivalent circuits)."
  ),
  goals: (
    "Build IPhO-level fluency across the core theory domains — quantum mechanics, statistical mechanics, relativity, and optics — through past-paper problem solving.",
    "Develop experimental-physics technique (error propagation, data fitting, uncertainty analysis) to match the strength of the theory work."
  ),
  progress: (
    "This was Borna's first cycle with me, and he came in ready to move fast. Over twenty-five sessions we covered an enormous amount of ground. We started in quantum mechanics, building the harmonic oscillator's energy levels and wavefunctions ψ₀–ψ₅ from scratch, and within a few weeks he was comfortable with the time-dependent Schrödinger equation, the uncertainty principle through wave packets and Fourier analysis, and even the COW neutron-interferometry experiment, where a gravitational phase shift lets you measure g with matter waves. From there we moved into statistical mechanics, special relativity, and astrophysics without losing momentum; the white-dwarf session, where he balanced electron degeneracy pressure against gravitational collapse to pin down the equilibrium radius, was a highlight — it pulled together Fermi-Dirac statistics, mechanics, and dimensional reasoning in a single problem.",
    "What stands out most is how Borna checks his own work. When we used dimensional analysis on nonlinear oscillators to predict how the period scales with amplitude, T ∝ A^((1−α)/2), he didn't just accept the result — he immediately tested it against cases he already knew, confirming that α = 1 gives simple harmonic motion with no amplitude dependence and that α = −2 reproduces Kepler's third law. That instinct to verify a formula against its limiting cases is exactly the habit that separates strong olympiad competitors from the rest, and for Borna it's already second nature.",
    "The back half of the cycle leaned into experimental physics, which is often where strong theory students most need to grow. We drilled error propagation until the quadrature rule was automatic, and in the refraction lab he fit real cable-position data to a line with R² = 0.9996, extracted an index of refraction, and carried the uncertainty all the way through to θ = 19.3° ± 0.6°. By late May he had completed a substantial batch of IPhO and USAPhO problems, and we'd opened polarization and birefringence alongside the first ideas of circuits — impedance, equivalent circuits, and power dissipation — which sets up the next cycle nicely."
  ),
  plan: (
    "Build out circuits as the next major topic: DC networks and Thevenin/Norton equivalents first, then AC and complex impedance, working through the assigned Balkan and IPhO circuit problems.",
    "Finish the birefringence and polarization thread (Tokyo 2023 / IPhO 2023 E2) and keep alternating theory problems with experimental ones so the data-analysis skills stay sharp."
  ),
  resources: (
    "IPhO and USAPhO past-paper archives (theory and experimental rounds) — our primary problem bank this cycle and next.",
    "Balkan Physics Olympiad problems for circuits practice (Balkan 2021 #4 — Electric Circuit with Lamp; Balkan 2022 #1 — Resistor Circuit)."
  ),
  support: (
    "Ask Borna to explain a recent concept to you in plain language — teaching it back is one of the best ways to cement it, and he enjoys it.",
    "Protect unhurried blocks of time for problem solving; these olympiad problems reward sustained focus far more than speed.",
    "Celebrate the persistence and the process, not just the correct answer — these problems are designed to be hard, and getting stuck is part of the work.",
    "Keep plenty of scratch paper or a whiteboard handy; a lot of Borna's best thinking is visual and diagrammatic."
  ),
  sessions: (
    ("Mar 10, 2026", "We dug into the quantum harmonic oscillator, building up the energy levels and wavefunctions ψ₀–ψ₅, then connected Bragg diffraction to wave interference.", ""),
    ("Mar 11, 2026", "We extended to the time-dependent Schrödinger equation and complex time evolution, then worked the Bohr model and wavefunction matching in the finite square well.", ""),
    ("Mar 12, 2026", "We tackled the Heisenberg uncertainty principle through wave packets and the Fourier relationship between position and momentum.", ""),
    ("Mar 13, 2026", "We derived the full time-dependent Schrödinger equation and explored the COW neutron-interferometry experiment that measures g from a gravitational quantum phase shift.", ""),
    ("Mar 16, 2026", "We opened statistical mechanics with the Boltzmann factor, entropy S = k_B ln Ω, and the partition function linking microscopic states to thermodynamics.", ""),
    ("Mar 17, 2026", "Working session — no whiteboard content was recorded.", ""),
    ("Mar 18, 2026", "We built special relativity from the Lorentz factor and rapidity, arriving at the 4-momentum formalism and E = γmc².", ""),
    ("Mar 19, 2026", "We derived time dilation from the light-clock thought experiment and read it off a Minkowski diagram via the invariant spacetime interval.", ""),
    ("Mar 20, 2026", "We modeled a white dwarf, balancing electron degeneracy pressure against gravitational collapse to find the equilibrium radius.", "USAPhO 2019 B2 — Stellar Black Box"),
    ("Mar 24, 2026", "We analyzed the 1D random walk, deriving ⟨x²⟩ = nL² and connecting it to diffusion and the central limit theorem.", ""),
    ("Mar 26, 2026", "We practiced error propagation on the kinematics formula x = v₀t + ½at² using the quadrature rule for uncorrelated uncertainties.", ""),
    ("Mar 30, 2026", "Working session — no whiteboard content was recorded.", ""),
    ("Apr 7, 2026", "We used dimensional analysis on nonlinear oscillators F = −kx^α to find the period scaling, checking it against SHM and Kepler's law.", ""),
    ("Apr 8, 2026", "We continued the nonlinear-oscillator analysis, confirming the T ∝ A^((1−α)/2) scaling against its known limiting cases.", ""),
    ("Apr 9, 2026", "We covered Rindler coordinates for an accelerating observer, the finite-amplitude pendulum, and wave refraction via Snell's law.", ""),
    ("Apr 15, 2026", "We worked the IPhO gravimeter problem, optimizing a zero-length spring's sensitivity through the equilibrium and inflection conditions.", ""),
    ("Apr 16, 2026", "We applied the method of images to a charge near a conducting corner and to the Apollonius sphere as a zero-potential surface.", "IPhO 2021 T2 — Electrostatic Lens"),
    ("Apr 24, 2026", "We drilled error propagation across products, power laws, and combined quadrature, extracting an index of refraction from measured data.", ""),
    ("Apr 30, 2026", "We connected Snell's law to Huygens' principle and ran the refraction lab, fitting cable-position data to R² = 0.9996 and propagating the angle uncertainty to θ = 19.3° ± 0.6°.", "IPhO 2017 E1 — Optics of a Salt Solution"),
    ("May 5, 2026", "We solved 'Electric Slide' across both regimes — space-charge-limited current with Child-Langmuir scaling and the diffusion limit via the Einstein relation.", "USAPhO 2019 A3 — Electric Slide"),
    ("May 7, 2026", "Working session — no whiteboard content was recorded.", ""),
    ("May 19, 2026", "We worked an IPhO biophysics problem on vascular branching (Murray's law) and the apparent-depth image formed through a water surface.", "IPhO 2018 T3 — Physics of Live Systems"),
    ("May 21, 2026", "We studied optics through Fermat's principle of least time.", ""),
    ("May 26, 2026", "We introduced linear and circular polarization and began the Tokyo 2023 birefringence experiment.", "IPhO 2023 E2 — Birefringence"),
    ("May 27, 2026", "We began circuits — impedance, equivalent circuits, resistivity, and power dissipation.", "Balkan 2022 1 — Resistor Circuit"),
  ),
)

#report(data)
