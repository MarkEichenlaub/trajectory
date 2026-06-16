-- Kevin Zhou IPhO handouts
-- Source: https://knzhou.github.io/
-- These are the complete set of curriculum handouts used for USAPhO/IPhO training.

INSERT INTO handouts (id, source, name, description, topics, tags, pdf_url, solution_url, resource_type, year, status)
VALUES

-- Problem Solving
('kz-p1', 'Kevin Zhou', 'P1: Problem Solving I',
  'Dimensional analysis, limiting cases, series expansions, differentials, iterative solutions.',
  ARRAY['Mechanics'], ARRAY['problem solving', 'dimensional analysis', 'limiting cases', 'series expansions', 'estimation', 'differentials'],
  'https://knzhou.github.io/handouts/P1.pdf', 'https://knzhou.github.io/handouts/P1Sol.pdf',
  'handout', 0, 'active'),

('kz-p2', 'Kevin Zhou', 'P2: Problem Solving II',
  'Probability, error analysis, data analysis, and estimation.',
  ARRAY[]::text[], ARRAY['problem solving', 'probability', 'error analysis', 'data analysis', 'estimation', 'statistics'],
  'https://knzhou.github.io/handouts/P2.pdf', 'https://knzhou.github.io/handouts/P2Sol.pdf',
  'handout', 0, 'active'),

-- Mechanics
('kz-m1', 'Kevin Zhou', 'M1: Kinematics',
  'Solving F = ma, projectile motion, and optimal launching angles.',
  ARRAY['Mechanics'], ARRAY['kinematics', 'projectile motion', 'Newton''s laws', 'F=ma'],
  'https://knzhou.github.io/handouts/M1.pdf', 'https://knzhou.github.io/handouts/M1Sol.pdf',
  'handout', 0, 'active'),

('kz-m2', 'Kevin Zhou', 'M2: Statics',
  'Force and torque balance, extended bodies, pressure, and surface tension.',
  ARRAY['Mechanics'], ARRAY['statics', 'torque', 'equilibrium', 'pressure', 'surface tension', 'hydrostatics'],
  'https://knzhou.github.io/handouts/M2.pdf', 'https://knzhou.github.io/handouts/M2Sol.pdf',
  'handout', 0, 'active'),

('kz-m3', 'Kevin Zhou', 'M3: Dynamics',
  'Momentum, energy and center-of-mass energy, and collisions.',
  ARRAY['Mechanics'], ARRAY['momentum', 'energy', 'collisions', 'center of mass', 'conservation laws', 'impulse'],
  'https://knzhou.github.io/handouts/M3.pdf', 'https://knzhou.github.io/handouts/M3Sol.pdf',
  'handout', 0, 'active'),

('kz-m4', 'Kevin Zhou', 'M4: Oscillations',
  'Damped and driven oscillators, normal modes, small oscillations, and adiabaticity.',
  ARRAY['Mechanics', 'Waves & Oscillations'], ARRAY['oscillations', 'damped oscillations', 'driven oscillations', 'normal modes', 'resonance', 'SHM', 'adiabatic'],
  'https://knzhou.github.io/handouts/M4.pdf', 'https://knzhou.github.io/handouts/M4Sol.pdf',
  'handout', 0, 'active'),

('kz-m5', 'Kevin Zhou', 'M5: Rotation',
  'Angular kinematics, angular impulse, and physical pendulums.',
  ARRAY['Mechanics'], ARRAY['rotation', 'angular momentum', 'moment of inertia', 'torque', 'rigid body', 'physical pendulum', 'rolling'],
  'https://knzhou.github.io/handouts/M5.pdf', 'https://knzhou.github.io/handouts/M5Sol.pdf',
  'handout', 0, 'active'),

('kz-m6', 'Kevin Zhou', 'M6: Gravity',
  'Kepler''s laws, rocket science, non-inertial frames, and tides.',
  ARRAY['Mechanics'], ARRAY['gravity', 'Kepler''s laws', 'orbital mechanics', 'non-inertial frames', 'tides', 'rocketry', 'centrifugal force', 'Coriolis'],
  'https://knzhou.github.io/handouts/M6.pdf', 'https://knzhou.github.io/handouts/M6Sol.pdf',
  'handout', 0, 'active'),

('kz-m7', 'Kevin Zhou', 'M7: Fluids',
  'Buoyancy, Bernoulli''s principle, viscosity, and surface tension.',
  ARRAY['Mechanics'], ARRAY['fluids', 'buoyancy', 'Bernoulli', 'viscosity', 'fluid dynamics', 'surface tension', 'Archimedes'],
  'https://knzhou.github.io/handouts/M7.pdf', 'https://knzhou.github.io/handouts/M7Sol.pdf',
  'handout', 0, 'active'),

('kz-m8', 'Kevin Zhou', 'M8: Advanced Mechanics',
  '3D rotation, precession, and challenging synthesis problems.',
  ARRAY['Mechanics'], ARRAY['3D rotation', 'precession', 'gyroscope', 'Euler angles', 'advanced mechanics', 'inertia tensor'],
  'https://knzhou.github.io/handouts/M8.pdf', 'https://knzhou.github.io/handouts/M8Sol.pdf',
  'handout', 0, 'active'),

-- Thermodynamics
('kz-t1', 'Kevin Zhou', 'T1: Ideal Gases',
  'Ideal gases, statistical mechanics, kinetic theory, and the atmosphere.',
  ARRAY['Thermodynamics'], ARRAY['ideal gas', 'statistical mechanics', 'kinetic theory', 'atmosphere', 'Maxwell-Boltzmann', 'equipartition'],
  'https://knzhou.github.io/handouts/T1.pdf', 'https://knzhou.github.io/handouts/T1Sol.pdf',
  'handout', 0, 'active'),

('kz-t2', 'Kevin Zhou', 'T2: Laws of Thermodynamics',
  'Laws of thermodynamics, quantum statistical mechanics, radiation, and heat conduction.',
  ARRAY['Thermodynamics'], ARRAY['laws of thermodynamics', 'entropy', 'heat engines', 'Carnot cycle', 'radiation', 'heat conduction', 'blackbody'],
  'https://knzhou.github.io/handouts/T2.pdf', 'https://knzhou.github.io/handouts/T2Sol.pdf',
  'handout', 0, 'active'),

('kz-t3', 'Kevin Zhou', 'T3: Phase Transitions',
  'Surface tension, real fluids, phase transitions, and compressible flow.',
  ARRAY['Thermodynamics'], ARRAY['phase transitions', 'surface tension', 'real fluids', 'compressible flow', 'van der Waals'],
  'https://knzhou.github.io/handouts/T3.pdf', 'https://knzhou.github.io/handouts/T3Sol.pdf',
  'handout', 0, 'active'),

-- Electromagnetism
('kz-e1', 'Kevin Zhou', 'E1: Electrostatics',
  'Coulomb''s law, Gauss''s law, electric potentials, and conductors.',
  ARRAY['Electromagnetism'], ARRAY['electrostatics', 'Coulomb''s law', 'Gauss''s law', 'electric potential', 'conductors', 'electric field'],
  'https://knzhou.github.io/handouts/E1.pdf', 'https://knzhou.github.io/handouts/E1Sol.pdf',
  'handout', 0, 'active'),

('kz-e2', 'Kevin Zhou', 'E2: DC Circuits and Capacitors',
  'Image charges, capacitors, conduction, and DC circuits.',
  ARRAY['Electromagnetism'], ARRAY['capacitors', 'DC circuits', 'image charges', 'resistors', 'Kirchhoff''s laws', 'conduction'],
  'https://knzhou.github.io/handouts/E2.pdf', 'https://knzhou.github.io/handouts/E2Sol.pdf',
  'handout', 0, 'active'),

('kz-e3', 'Kevin Zhou', 'E3: Magnetostatics',
  'Advanced circuits, Biot-Savart law, Ampere''s law, dipoles, and solenoids.',
  ARRAY['Electromagnetism'], ARRAY['Biot-Savart law', 'Ampere''s law', 'magnetic dipoles', 'solenoids', 'magnetostatics', 'magnetic field'],
  'https://knzhou.github.io/handouts/E3.pdf', 'https://knzhou.github.io/handouts/E3Sol.pdf',
  'handout', 0, 'active'),

('kz-e4', 'Kevin Zhou', 'E4: Lorentz Force',
  'Dynamic charges, Lorentz force, permanent magnets, and solid state physics.',
  ARRAY['Electromagnetism'], ARRAY['Lorentz force', 'Hall effect', 'magnetic force', 'charged particle motion', 'cyclotron', 'permanent magnets'],
  'https://knzhou.github.io/handouts/E4.pdf', 'https://knzhou.github.io/handouts/E4Sol.pdf',
  'handout', 0, 'active'),

('kz-e5', 'Kevin Zhou', 'E5: Electromagnetic Induction',
  'Faraday''s law, inductors, dynamos, and superconductors.',
  ARRAY['Electromagnetism'], ARRAY['Faraday''s law', 'inductors', 'electromagnetic induction', 'EMF', 'superconductors', 'eddy currents', 'dynamo'],
  'https://knzhou.github.io/handouts/E5.pdf', 'https://knzhou.github.io/handouts/E5Sol.pdf',
  'handout', 0, 'active'),

('kz-e6', 'Kevin Zhou', 'E6: AC Circuits',
  'RLC circuits, filters, normal modes, and diodes.',
  ARRAY['Electromagnetism', 'Waves & Oscillations'], ARRAY['AC circuits', 'RLC circuits', 'filters', 'impedance', 'resonance', 'diodes', 'phasors'],
  'https://knzhou.github.io/handouts/E6.pdf', 'https://knzhou.github.io/handouts/E6Sol.pdf',
  'handout', 0, 'active'),

('kz-e7', 'Kevin Zhou', 'E7: Electrodynamics',
  'Displacement current, Maxwell''s equations, radiation, and electromagnetic field energy.',
  ARRAY['Electromagnetism'], ARRAY['Maxwell''s equations', 'displacement current', 'radiation', 'electromagnetic waves', 'Poynting vector', 'field energy'],
  'https://knzhou.github.io/handouts/E7.pdf', 'https://knzhou.github.io/handouts/E7Sol.pdf',
  'handout', 0, 'active'),

('kz-e8', 'Kevin Zhou', 'E8: Advanced Electromagnetism',
  'Electromagnetic fields in matter and challenging synthesis problems.',
  ARRAY['Electromagnetism'], ARRAY['electromagnetic fields in matter', 'dielectrics', 'magnetic materials', 'advanced electromagnetism', 'polarization'],
  'https://knzhou.github.io/handouts/E8.pdf', 'https://knzhou.github.io/handouts/E8Sol.pdf',
  'handout', 0, 'active'),

-- Relativity
('kz-r1', 'Kevin Zhou', 'R1: Special Relativity — Kinematics',
  'Lorentz transformations, Doppler effect, relativistic acceleration, and classic paradoxes.',
  ARRAY['Relativity'], ARRAY['special relativity', 'Lorentz transformation', 'time dilation', 'length contraction', 'Doppler effect', 'paradoxes', 'simultaneity'],
  'https://knzhou.github.io/handouts/R1.pdf', 'https://knzhou.github.io/handouts/R1Sol.pdf',
  'handout', 0, 'active'),

('kz-r2', 'Kevin Zhou', 'R2: Special Relativity — Dynamics',
  'Relativistic momentum, energy, four-vectors, forces, and relativistic strings.',
  ARRAY['Relativity'], ARRAY['special relativity', 'relativistic momentum', 'relativistic energy', 'four-vectors', 'E=mc2', 'relativistic dynamics'],
  'https://knzhou.github.io/handouts/R2.pdf', 'https://knzhou.github.io/handouts/R2Sol.pdf',
  'handout', 0, 'active'),

('kz-r3', 'Kevin Zhou', 'R3: Relativistic Fields',
  'Electromagnetic field transformations and the equivalence principle.',
  ARRAY['Relativity', 'Electromagnetism'], ARRAY['special relativity', 'electromagnetic field transformation', 'equivalence principle', 'general relativity', 'tensor'],
  'https://knzhou.github.io/handouts/R3.pdf', 'https://knzhou.github.io/handouts/R3Sol.pdf',
  'handout', 0, 'active'),

-- Waves
('kz-w1', 'Kevin Zhou', 'W1: Waves',
  'Wave equation, standing waves, music, and interferometry.',
  ARRAY['Waves & Oscillations'], ARRAY['wave equation', 'standing waves', 'acoustics', 'interferometry', 'superposition', 'reflection', 'transmission'],
  'https://knzhou.github.io/handouts/W1.pdf', 'https://knzhou.github.io/handouts/W1Sol.pdf',
  'handout', 0, 'active'),

('kz-w2', 'Kevin Zhou', 'W2: Interference and Diffraction',
  'Interference, diffraction, crystallography, and real-world examples.',
  ARRAY['Waves & Oscillations', 'Optics'], ARRAY['diffraction', 'interference', 'crystallography', 'optics', 'double slit', 'diffraction grating', 'Bragg diffraction'],
  'https://knzhou.github.io/handouts/W2.pdf', 'https://knzhou.github.io/handouts/W2Sol.pdf',
  'handout', 0, 'active'),

('kz-w3', 'Kevin Zhou', 'W3: Geometrical Optics and Polarization',
  'Sound waves, water waves, polarization, and geometrical optics.',
  ARRAY['Waves & Oscillations', 'Optics'], ARRAY['sound waves', 'water waves', 'polarization', 'geometric optics', 'lenses', 'mirrors', 'Snell''s law', 'total internal reflection'],
  'https://knzhou.github.io/handouts/W3.pdf', 'https://knzhou.github.io/handouts/W3Sol.pdf',
  'handout', 0, 'active'),

-- Modern Physics
('kz-x1', 'Kevin Zhou', 'X1: Quantum Mechanics',
  'Semiclassical quantum mechanics, bosons, and fermions.',
  ARRAY['Quantum Physics'], ARRAY['quantum mechanics', 'wave-particle duality', 'Schrödinger equation', 'bosons', 'fermions', 'Planck''s constant', 'photoelectric effect', 'de Broglie'],
  'https://knzhou.github.io/handouts/X1.pdf', 'https://knzhou.github.io/handouts/X1Sol.pdf',
  'handout', 0, 'active'),

('kz-x2', 'Kevin Zhou', 'X2: Nuclear and Particle Physics',
  'Nuclear, particle, and atomic physics.',
  ARRAY['Nuclear/Particle', 'Quantum Physics'], ARRAY['nuclear physics', 'particle physics', 'atomic physics', 'radioactive decay', 'fission', 'fusion', 'Standard Model'],
  'https://knzhou.github.io/handouts/X2.pdf', 'https://knzhou.github.io/handouts/X2Sol.pdf',
  'handout', 0, 'active'),

('kz-x3', 'Kevin Zhou', 'X3: Astrophysics and Condensed Matter',
  'Condensed matter, astrophysics, and cosmology.',
  ARRAY['Astrophysics', 'Quantum Physics'], ARRAY['condensed matter', 'astrophysics', 'cosmology', 'stars', 'black holes', 'solid state', 'semiconductors'],
  'https://knzhou.github.io/handouts/X3.pdf', 'https://knzhou.github.io/handouts/X3Sol.pdf',
  'handout', 0, 'active'),

-- Review sets
('kz-mrev', 'Kevin Zhou', 'Mechanics Review',
  'Comprehensive review of all mechanics topics covered in M1–M8.',
  ARRAY['Mechanics'], ARRAY['review', 'mechanics review', 'comprehensive'],
  'https://knzhou.github.io/handouts/MRev.pdf', 'https://knzhou.github.io/handouts/MRevSol.pdf',
  'handout', 0, 'active'),

('kz-erev', 'Kevin Zhou', 'Electromagnetism Review',
  'Comprehensive review of all electromagnetism topics covered in E1–E8.',
  ARRAY['Electromagnetism'], ARRAY['review', 'electromagnetism review', 'comprehensive'],
  'https://knzhou.github.io/handouts/ERev.pdf', 'https://knzhou.github.io/handouts/ERevSol.pdf',
  'handout', 0, 'active'),

('kz-xrev', 'Kevin Zhou', 'Everything Else Review',
  'Comprehensive review of thermodynamics, relativity, waves, and modern physics.',
  ARRAY['Thermodynamics', 'Relativity', 'Waves & Oscillations', 'Quantum Physics', 'Nuclear/Particle', 'Astrophysics'], ARRAY['review', 'comprehensive', 'thermodynamics review', 'relativity review', 'waves review', 'modern physics review'],
  'https://knzhou.github.io/handouts/XRev.pdf', 'https://knzhou.github.io/handouts/XRevSol.pdf',
  'handout', 0, 'active'),

-- USAPhO Practice
('kz-usapho-m', 'Kevin Zhou', 'USAPhO Practice: Mechanics',
  'USAPhO-style practice exam focused on mechanics.',
  ARRAY['Mechanics'], ARRAY['USAPhO', 'practice exam', 'mechanics', 'competition'],
  'https://knzhou.github.io/handouts/USAPhOM.pdf', 'https://knzhou.github.io/handouts/USAPhOMSol.pdf',
  'exam', 0, 'active'),

('kz-usapho-e', 'Kevin Zhou', 'USAPhO Practice: Electromagnetism',
  'USAPhO-style practice exam focused on electromagnetism.',
  ARRAY['Electromagnetism'], ARRAY['USAPhO', 'practice exam', 'electromagnetism', 'competition'],
  'https://knzhou.github.io/handouts/USAPhOE.pdf', 'https://knzhou.github.io/handouts/USAPhOESol.pdf',
  'exam', 0, 'active'),

('kz-usapho-x', 'Kevin Zhou', 'USAPhO Practice: Everything Else',
  'USAPhO-style practice exam covering thermodynamics, relativity, waves, and modern physics.',
  ARRAY['Thermodynamics', 'Relativity', 'Waves & Oscillations', 'Quantum Physics'], ARRAY['USAPhO', 'practice exam', 'thermodynamics', 'relativity', 'waves', 'modern physics', 'competition'],
  'https://knzhou.github.io/handouts/USAPhOX.pdf', 'https://knzhou.github.io/handouts/USAPhOXSol.pdf',
  'exam', 0, 'active'),

('kz-usapho-a', 'Kevin Zhou', 'USAPhO Practice Exam A',
  'Full USAPhO-style mixed practice exam.',
  ARRAY['Mechanics', 'Electromagnetism'], ARRAY['USAPhO', 'practice exam', 'competition', 'mixed'],
  'https://knzhou.github.io/handouts/USAPhOA.pdf', 'https://knzhou.github.io/handouts/USAPhOASol.pdf',
  'exam', 0, 'active'),

('kz-usapho-b', 'Kevin Zhou', 'USAPhO Practice Exam B',
  'Full USAPhO-style mixed practice exam.',
  ARRAY['Mechanics', 'Electromagnetism'], ARRAY['USAPhO', 'practice exam', 'competition', 'mixed'],
  'https://knzhou.github.io/handouts/USAPhOB.pdf', 'https://knzhou.github.io/handouts/USAPhOBSol.pdf',
  'exam', 0, 'active'),

('kz-usapho-c', 'Kevin Zhou', 'USAPhO Practice Exam C',
  'Full USAPhO-style mixed practice exam.',
  ARRAY['Mechanics', 'Electromagnetism'], ARRAY['USAPhO', 'practice exam', 'competition', 'mixed'],
  'https://knzhou.github.io/handouts/USAPhOC.pdf', 'https://knzhou.github.io/handouts/USAPhOCSol.pdf',
  'exam', 0, 'active'),

('kz-usapho-d', 'Kevin Zhou', 'USAPhO Practice Exam D',
  'Full USAPhO-style mixed practice exam.',
  ARRAY['Mechanics', 'Electromagnetism'], ARRAY['USAPhO', 'practice exam', 'competition', 'mixed'],
  'https://knzhou.github.io/handouts/USAPhOD.pdf', 'https://knzhou.github.io/handouts/USAPhODSol.pdf',
  'exam', 0, 'active'),

('kz-expt', 'Kevin Zhou', 'Experimental Physics',
  'Experimental physics techniques, measurement, and data analysis.',
  ARRAY['Experimental Methods'], ARRAY['experimental physics', 'measurement', 'data analysis', 'error analysis', 'lab skills'],
  'https://knzhou.github.io/handouts/Expt.pdf', 'https://knzhou.github.io/handouts/ExptSol.pdf',
  'handout', 0, 'active'),

('kz-final', 'Kevin Zhou', 'Final Practice Exam',
  'Comprehensive final practice exam covering all topics.',
  ARRAY['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Waves & Oscillations'], ARRAY['practice exam', 'comprehensive', 'final exam', 'competition', 'mixed'],
  'https://knzhou.github.io/handouts/Final.pdf', 'https://knzhou.github.io/handouts/FinalSol.pdf',
  'exam', 0, 'active')

ON CONFLICT (id) DO NOTHING;
