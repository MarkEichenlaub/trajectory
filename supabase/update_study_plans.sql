-- Archive any existing active plans for these students
update public.study_plans
set status = 'archived'
where student_id in ('leo', 'borna', 'india')
  and status = 'active';

-- Insert new active plans
insert into public.study_plans (student_id, content, status, proposed_by) values
('leo', $plan$
Leo Li-Savarese — Study Plan
Updated May 2026

Where We Are

Leo recently completed the Art of Problem Solving mechanics course, finishing 7th out of 78 students overall and climbing to 3rd in the second half (91%). He has a solid foundation in non-calculus mechanics and shows an unusually early comfort with qualitative and extreme-case reasoning — a skill that typically takes much longer to develop.

His mechanics knowledge is complete but not yet automatic. Every step is still somewhat deliberate: resolving vectors, applying Newton's laws, tracking energy. The next phase focuses on repetition across diverse problem types until these operations become fast and reliable.

Goals

Short-term (12 months): Pass the F=ma exam and qualify for the next round of US Physics Team selection. The F=ma is a 25-question multiple-choice test in non-calculus mechanics — a realistic target for Leo over the coming year.

Long-term (2–3 years): Compete in the USAPhO, a three-hour free-response exam covering calculus-based physics, electromagnetism, thermodynamics, and modern physics.

Skills We Are Building

Automaticity in mechanics. Basic operations — resolving vectors, applying Newton's laws, using energy or momentum conservation — need to become fast enough that they stop consuming mental effort. Then Leo can direct his attention to higher-level pattern recognition.

Top-down problem solving. Before doing any algebra, identify the governing principle. Recognizing at a glance that a problem is about energy conservation, or angular momentum, or dimensional analysis, is a learnable pattern. We are building this systematically.

Extreme-case reasoning. Check answers and develop physical intuition by examining what happens at limits. Leo already has strong instincts here — we are refining the technique into a reliable tool.

Organizing written solutions. Communicating the reasoning behind a solution clearly and in order, not just arriving at the right answer.

Calculus

Leo will self-study calculus through Khan Academy. In our sessions, calculus ideas will come up naturally as they arise in the physics — we won't set aside dedicated time to work through calculus as its own subject. This approach captures the parts of calculus most useful for physics: derivatives and integrals as they appear in mechanics, rates of change, and the connection between a formula and its limiting behavior. By staying focused on physics, Leo will build fluency with the mathematical tools that matter most while keeping physics at the center of the work.

Coursework

AoPS F=ma Problem Series (course 4775): Jun 7 – Aug 30, 2026, Sundays 7:30–9:00 PM ET, instructor Jon Joseph. Structured problem sets and walkthroughs designed specifically for the F=ma exam, complementing our 1-on-1 sessions.

Materials

David Morin, Problems and Solutions in Introductory Mechanics — the best available collection of F=ma-level problems, ramping gradually to full exam difficulty. Leo has begun this book.

Halliday, Resnick & Krane, Physics 5th ed. — our main text for the transition to calculus-based physics. Covers mechanics through E&M, thermodynamics, and modern physics. Will carry Leo for the next two years.

Math and Research

I am also available as a sounding board for Leo's nuclear fusion research and the technical materials he encounters through his work at NIF.
$plan$, 'active', 'admin'),

('borna', $plan$
Borna — Study Plan
Updated May 2026

Competition Targets

8th Balkan Physics Olympiad (BPO8): June 27–30, 2026, Istanbul, Turkey
56th International Physics Olympiad (IPhO): July 4–12, 2026, Bucaramanga, Colombia

After BPO8, there are approximately four days before IPhO. Sessions are focused on high-leverage preparation in Borna's areas of greatest growth potential.

Upcoming: Borna has an intensive experimental training week with the Croatian national team coming up before the competitions.

Topics of Study

The primary focus is circuits (especially nonlinear elements and AC circuits), optics, and waves. We work from IPhO past problems and IPhO-level support materials. Problems are selected by topic to build recognition of how each subject appears in competition, and full solutions — including reasoning — are written out carefully.

Circuits: IPhO Syllabus Items

- Kirchhoff's current law and voltage law
- Thevenin and Norton equivalent circuits; superposition
- RC circuits: time constant, charging and discharging; energy stored in a capacitor
- RL circuits: time constant; energy stored in an inductor
- AC circuits: phasors; complex impedance (R, jωL, 1/jωC); series and parallel combinations
- Series and parallel RLC resonance: resonant frequency ω₀ = 1/√(LC), quality factor Q, bandwidth
- AC power: rms values; real, reactive, and apparent power; power factor
- Transformers: voltage and current ratios; efficiency
- Nonlinear elements: diode I-V characteristic curve; operating point and load line analysis; half-wave and full-wave rectification
- Transistor in simplified models: BJT as a switch; small-signal amplifier model

Optics: IPhO Syllabus Items

- Laws of reflection and refraction; Snell's law
- Critical angle; total internal reflection
- Thin lens equation and sign convention; lensmaker's equation
- Image formation; magnification; mirrors
- Optical instruments: magnifying glass, compound microscope, refracting telescope
- Interference: path difference; constructive and destructive conditions; Young's double-slit fringe spacing Δy = λL/d
- Single-slit diffraction: positions of minima; central maximum width
- Diffraction grating: grating equation d sinθ = mλ; resolving power R = mN
- Thin-film interference: phase shifts at interfaces; optical path length
- Rayleigh criterion for angular resolution: θ ≈ 1.22λ/D
- Polarization: Malus's law I = I₀cos²θ; Brewster's angle tanθ_B = n
- Dispersion; chromatic aberration

Waves: IPhO Syllabus Items

- Wave parameters: frequency, wavelength, period, amplitude, phase velocity; v = fλ
- Transverse and longitudinal waves; displacement and pressure in sound
- Superposition; constructive and destructive interference
- Standing waves on strings: boundary conditions; harmonics f_n = nv/2L
- Standing waves in pipes: open pipe (harmonics nv/2L); closed pipe (odd harmonics (2n−1)v/4L)
- Doppler effect: formula for moving source and/or observer; relativistic Doppler shift
- Beats: beat frequency |f₁ − f₂|
- Sound intensity; decibels; inverse-square law
- Energy and intensity of a wave: intensity proportional to amplitude squared
- Reflection and transmission at boundaries; phase shift on reflection from denser medium

Further Topics (as time allows before IPhO)

We will spend additional time on special relativity, statistical mechanics, and quantum mechanics as the competition approaches. These are assessed at IPhO and represent areas where additional practice will improve Borna's score.

Experimental Skills

Olympiad experiments test measurement technique, uncertainty estimation, linearizing data for log-log or semi-log plots, and writing organized experimental accounts under time pressure. We are treating this as an active skill set — reading instruments precisely, propagating errors correctly, and producing clean and legible write-ups. Checking extreme cases and dimensional analysis before finalizing any result.

Problem Strategy

Our main working material is IPhO past problems, selected by topic, to build recognition of how these subjects appear in competition. Full solutions — including reasoning, not just final answers — are written out carefully. We also review experimental problems from past IPhOs to prepare for that component.

Habits

Writing organized, clearly structured solutions under time pressure.
Checking dimensions and extreme cases before committing to a final answer.
Separating "what is the physics here" from "what is the calculation" at the start of each problem.
$plan$, 'active', 'admin'),

('india', $plan$
India — Study Plan
Updated May 2026

We are in the early stages of working with India, exploring her interests and finding what she is most motivated to study. Our sessions challenge her with interesting problems in physics and mathematics as we discover where she wants to go.

India will be working through Khan Academy Calculus on her own. In our sessions, we will use that foundation and push further into whatever areas of physics and math capture her attention.
$plan$, 'active', 'admin');
