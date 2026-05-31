#import "../lib.typ": report

#let data = (
  student: "Borna Curic",
  mentor:  "Mark Eichenlaub",
  cycle:   "Cycle 1 · Spring 2026",
  summary: (
    "25 sessions across roughly eleven weeks, almost all oriented toward IPhO-level problem solving.",
    "Built out the modern-physics core: a four-session run through quantum mechanics, statistical mechanics, special relativity, and a white-dwarf capstone.",
    "Worked through 17 olympiad problems to completion this cycle, including most of USAPhO 2019 and a strong slice of recent IPhO experiments.",
    "Closed the cycle pivoting into optics and circuits — polarization, Snell's law experiments, and the start of impedance and Thevenin analysis."
  ),
  goals: (
    "Build genuine fluency with the IPhO/USAPhO syllabus across quantum, stat mech, relativity, and experimental physics — not just exposure, but the ability to attack unfamiliar problems.",
    "Develop the experimentalist's toolkit: error propagation, fitting data, and the kind of careful uncertainty reasoning that distinguishes top olympiad scripts."
  ),
  progress: (
    "Borna moved through a remarkable amount of material this cycle. We opened with a concentrated four-session arc on quantum mechanics — quantum harmonic oscillator and Bragg diffraction on Mar 10, the time-dependent Schrödinger equation and finite square well on Mar 11, uncertainty and wave packets on Mar 12, and the COW neutron interferometry experiment on Mar 13. Doing the COW experiment immediately after deriving energy-time uncertainty was the right ordering: Borna could see why a gravitational phase shift on a neutron is a real, measurable thing rather than just a textbook curiosity. From there we threaded into statistical mechanics and relativity, and the Mar 20 white-dwarf session pulled all of it together — Fermi-Dirac statistics, degeneracy pressure, and a hydrostatic-equilibrium argument for the radius. That session was a good measure of how far the quantum and stat-mech material had actually settled in.",
    "The experimental side grew steadily alongside the theory. The Mar 26 error-propagation session was deliberately bookended by the Apr 24 follow-up and the Apr 30 refraction lab, where Borna fit cable-position data to y = 0.771x + 0.101 with R² = 0.9996 and propagated uncertainties through to θ = 19.3° ± 0.6°. That progression — formula, drill, then a real fit with a real uncertainty budget — is exactly the path I want experimentalists to walk. On the theory side, the Apr 7–8 nonlinear-oscillator pair was a favorite of mine: Borna used pure dimensional analysis to derive T ∝ A^((1−α)/2), then verified it by checking that α = 1 reproduces SHM and α = −2 reproduces Kepler's third law. That kind of sanity-check instinct is harder to teach than the algebra.",
    "The last stretch shows the cycle's momentum. The May 5 USAPhO 'Electric Slide' problem combined Gauss's law, drift velocity, and the Einstein relation in one problem — and Borna held all of it together. By May 19 we were into Murray's law and biophysics; by May 26–27 we had pivoted cleanly into polarization, birefringence, and the opening of a serious circuits unit. The 17 completed olympiad problems this cycle, with another seven freshly assigned, are the most concrete evidence of the goal being met: Borna is now solving problems, not just learning topics."
  ),
  plan: (
    "Build out the circuits unit: Thevenin/Norton, AC impedance, transients, then push into the assigned IPhO 2003 piezoelectric resonator and the Balkan circuit problems.",
    "Finish the optics arc with a careful pass through IPhO 2023 Birefringence, tying it back to the May 26 polarization work.",
    "Keep one experimental problem in flight at all times — error propagation should stay a weekly habit, not a unit we leave behind.",
    "Begin staging a mock-exam rhythm in the next cycle so we can see how the theory-plus-experiment toolkit performs under time pressure."
  ),
  resources: (
    "IPhO and USAPhO past papers remain the primary diet — the 2019 USAPhO set was high-value this cycle, and the newly assigned 1971 cube and 1982 fluorescent lamp problems will fill in older-style reasoning.",
    "Griffiths' Introduction to Electrodynamics for the upcoming circuits and AC material; Griffiths' Quantum Mechanics as a reference for the QM material we covered in March.",
    "Irodov for additional drill problems, especially on circuits and optics during the next cycle."
  ),
  support: (
    "Protect Borna's session days from being overloaded — these are dense, and the spacing between Mar 26 and Apr 7, for instance, clearly gave the nonlinear-oscillator material room to land.",
    "Ask Borna to explain one problem from the week at the dinner table — teaching it out loud, even informally, is one of the strongest retention tools we have.",
    "Keep an eye on sleep around the heavier weeks; the quantum stretch in mid-March and the May 5 Electric Slide session both demand real cognitive stamina.",
    "No need to push extra problems at home — the assigned set is already substantial, and steady completion matters more than volume."
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
  ),
)

#report(data)
