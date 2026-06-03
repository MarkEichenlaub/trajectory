// Tag ontology for the Trajectory portal.
// Directed acyclic graph: tags can have multiple parents and multiple children.
// Node IDs match exact portal tag strings so usage counts join correctly.
// PRIMARY parent = first parent listed in EDGES for that node (used for tree layout).

export const NODES = [
  // ── Root ────────────────────────────────────────────────────────────────────
  { id: 'ipho',                         label: 'IPhO Syllabus' },

  // ── Main IPhO areas ─────────────────────────────────────────────────────────
  { id: 'mechanics',                    label: 'Mechanics' },
  { id: 'electromagnetism',             label: 'Electromagnetism' },
  { id: 'waves & oscillations',         label: 'Waves & Oscillations' },
  { id: 'optics',                       label: 'Optics' },
  { id: 'thermodynamics',               label: 'Thermodynamics' },
  { id: 'quantum physics',              label: 'Quantum Physics' },
  { id: 'relativity',                   label: 'Relativity' },
  { id: 'nuclear & particle',           label: 'Nuclear & Particle' },
  { id: 'astrophysics',                 label: 'Astrophysics' },
  { id: 'experimental',                 label: 'Experimental' },

  // ── Mechanics: Kinematics ────────────────────────────────────────────────────
  { id: 'kinematics',                   label: 'Kinematics' },
  { id: '1D kinematics',                label: '1D Kinematics' },
  { id: 'projectile motion',            label: 'Projectile Motion' },
  { id: 'relative motion',              label: 'Relative Motion' },
  { id: 'relative velocity',            label: 'Relative Velocity' },
  { id: 'circular motion',              label: 'Circular Motion' },
  { id: 'centripetal acceleration',     label: 'Centripetal Acceleration' },
  { id: 'centripetal force',            label: 'Centripetal Force' },
  { id: 'angular velocity',             label: 'Angular Velocity' },
  { id: 'angular acceleration',         label: 'Angular Acceleration' },
  { id: 'constant acceleration',        label: 'Constant Acceleration' },
  { id: 'trajectory',                   label: 'Trajectory' },

  // ── Mechanics: Statics ───────────────────────────────────────────────────────
  { id: 'statics',                      label: 'Statics' },
  { id: 'torque',                       label: 'Torque' },
  { id: 'center of mass',               label: 'Center of Mass' },
  { id: 'equilibrium',                  label: 'Equilibrium' },
  { id: 'static equilibrium',           label: 'Static Equilibrium' },
  { id: "Hooke's law",                  label: "Hooke's Law" },
  { id: "Young's modulus",              label: "Young's Modulus" },
  { id: 'static friction',              label: 'Static Friction' },
  { id: 'normal force',                 label: 'Normal Force' },

  // ── Mechanics: Dynamics ──────────────────────────────────────────────────────
  { id: 'dynamics',                     label: 'Dynamics' },
  { id: "Newton's laws",                label: "Newton's Laws" },
  { id: "Newton's second law",          label: "Newton's Second Law" },
  { id: 'momentum',                     label: 'Momentum' },
  { id: 'momentum conservation',        label: 'Momentum Conservation' },
  { id: 'angular momentum',             label: 'Angular Momentum' },
  { id: 'energy conservation',          label: 'Energy Conservation' },
  { id: 'kinetic energy',               label: 'Kinetic Energy' },
  { id: 'potential energy',             label: 'Potential Energy' },
  { id: 'work-energy theorem',          label: 'Work-Energy Theorem' },
  { id: 'impulse',                      label: 'Impulse' },
  { id: 'collision',                    label: 'Collision' },
  { id: 'elastic collision',            label: 'Elastic Collision' },
  { id: 'inelastic collision',          label: 'Inelastic Collision' },
  { id: 'friction',                     label: 'Friction' },
  { id: 'non-inertial frame',           label: 'Non-Inertial Frame' },

  // ── Mechanics: Rotation ──────────────────────────────────────────────────────
  { id: 'rotation',                     label: 'Rotation' },
  { id: 'moment of inertia',            label: 'Moment of Inertia' },
  { id: 'rotational dynamics',          label: 'Rotational Dynamics' },
  { id: 'rolling motion',               label: 'Rolling Motion' },
  { id: 'rigid body',                   label: 'Rigid Body' },
  { id: 'gyroscope',                    label: 'Gyroscope' },
  { id: 'precession',                   label: 'Precession' },

  // ── Mechanics: Celestial Mechanics ──────────────────────────────────────────
  { id: 'celestial mechanics',          label: 'Celestial Mechanics' },
  { id: "Kepler's laws",                label: "Kepler's Laws" },
  { id: 'orbital mechanics',            label: 'Orbital Mechanics' },
  { id: 'orbital period',               label: 'Orbital Period' },
  { id: 'orbital speed',                label: 'Orbital Speed' },
  { id: 'escape velocity',              label: 'Escape Velocity' },
  { id: 'Hohmann transfer',             label: 'Hohmann Transfer' },
  { id: 'gravitational potential',      label: 'Gravitational Potential' },
  { id: 'Newtonian gravity',            label: 'Newtonian Gravity' },
  { id: 'gravity assist',               label: 'Gravity Assist' },

  // ── Mechanics: Hydrodynamics ─────────────────────────────────────────────────
  { id: 'hydrodynamics',                label: 'Hydrodynamics' },
  { id: 'Bernoulli equation',           label: 'Bernoulli Equation' },
  { id: 'surface tension',              label: 'Surface Tension' },
  { id: 'viscosity',                    label: 'Viscosity' },
  { id: 'buoyancy',                     label: 'Buoyancy' },
  { id: 'fluid dynamics',               label: 'Fluid Dynamics' },
  { id: 'continuity equation',          label: 'Continuity Equation' },
  { id: 'capillary',                    label: 'Capillary' },
  { id: 'hydrostatics',                 label: 'Hydrostatics' },
  { id: 'Poiseuille',                   label: 'Poiseuille' },

  // ── Electromagnetism: Electrostatics ─────────────────────────────────────────
  { id: 'electrostatics',               label: 'Electrostatics' },
  { id: "Coulomb's law",                label: "Coulomb's Law" },
  { id: "Gauss's law",                  label: "Gauss's Law" },
  { id: 'electric field',               label: 'Electric Field' },
  { id: 'electric potential',           label: 'Electric Potential' },
  { id: 'capacitance',                  label: 'Capacitance' },
  { id: 'capacitor',                    label: 'Capacitor' },
  { id: 'electric dipole',              label: 'Electric Dipole' },
  { id: 'point charge',                 label: 'Point Charge' },

  // ── Electromagnetism: Magnetostatics ─────────────────────────────────────────
  { id: 'magnetostatics',               label: 'Magnetostatics' },
  { id: 'Biot-Savart law',              label: 'Biot-Savart Law' },
  { id: "Ampere's law",                 label: "Ampere's Law" },
  { id: 'Lorentz force',                label: 'Lorentz Force' },
  { id: 'magnetic field',               label: 'Magnetic Field' },
  { id: 'magnetic dipole',              label: 'Magnetic Dipole' },
  { id: 'magnetic force',               label: 'Magnetic Force' },
  { id: 'magnetic flux',                label: 'Magnetic Flux' },

  // ── Electromagnetism: Induction ──────────────────────────────────────────────
  { id: 'induction',                    label: 'Induction' },
  { id: "Faraday's law",                label: "Faraday's Law" },
  { id: 'eddy currents',                label: 'Eddy Currents' },
  { id: 'inductance',                   label: 'Inductance' },
  { id: 'self-inductance',              label: 'Self-Inductance' },
  { id: 'mutual inductance',            label: 'Mutual Inductance' },
  { id: 'motional EMF',                 label: 'Motional EMF' },
  { id: 'electromagnetic induction',    label: 'Electromagnetic Induction' },

  // ── Electromagnetism: Circuits ───────────────────────────────────────────────
  { id: 'circuits',                     label: 'Circuits' },
  { id: "Ohm's law",                    label: "Ohm's Law" },
  { id: "Kirchhoff's laws",             label: "Kirchhoff's Laws" },
  { id: 'resistance',                   label: 'Resistance' },
  { id: 'resistor networks',            label: 'Resistor Networks' },
  { id: 'Joule heating',                label: 'Joule Heating' },
  { id: 'Thevenin equivalent',          label: 'Thévenin Equivalent' },
  { id: 'Wheatstone bridge',            label: 'Wheatstone Bridge' },
  { id: 'diode',                        label: 'Diode' },

  { id: 'AC circuits',                  label: 'AC Circuits' },
  { id: 'AC impedance',                 label: 'AC Impedance' },
  { id: 'AC power',                     label: 'AC Power' },
  { id: 'RMS',                          label: 'RMS' },
  { id: 'impedance',                    label: 'Impedance' },
  { id: 'power factor',                 label: 'Power Factor' },
  { id: 'Q factor',                     label: 'Q Factor' },

  { id: 'RC circuit',                   label: 'RC Circuit' },
  { id: 'time constant',                label: 'Time Constant' },
  { id: 'RC filter',                    label: 'RC Filter' },
  { id: 'RC transient',                 label: 'RC Transient' },

  { id: 'RL circuit',                   label: 'RL Circuit' },

  { id: 'LC circuit',                   label: 'LC Circuit' },
  { id: 'LCR circuit',                  label: 'LCR Circuit' },
  { id: 'RLC circuit',                  label: 'RLC Circuit' },

  { id: "Maxwell's equations",          label: "Maxwell's Equations" },
  { id: 'image charge',                 label: 'Image Charges' },

  // ── Waves & Oscillations: SHM ────────────────────────────────────────────────
  { id: 'simple harmonic motion',       label: 'Simple Harmonic Motion' },
  { id: 'SHM',                          label: 'SHM' },
  { id: 'pendulum',                     label: 'Pendulum' },
  { id: 'physical pendulum',            label: 'Physical Pendulum' },
  { id: 'harmonic oscillator',          label: 'Harmonic Oscillator' },
  { id: 'small oscillations',           label: 'Small Oscillations' },
  { id: 'oscillation period',           label: 'Oscillation Period' },

  { id: 'damped oscillation',           label: 'Damped Oscillation' },
  { id: 'damped oscillator',            label: 'Damped Oscillator' },

  { id: 'forced oscillation',           label: 'Forced Oscillation' },
  { id: 'driven oscillator',            label: 'Driven Oscillator' },

  { id: 'resonance',                    label: 'Resonance' },
  { id: 'acoustic resonance',           label: 'Acoustic Resonance' },

  // ── Waves & Oscillations: Wave Propagation ───────────────────────────────────
  { id: 'wave propagation',             label: 'Wave Propagation' },
  { id: 'wavelength',                   label: 'Wavelength' },
  { id: 'phase velocity',               label: 'Phase Velocity' },
  { id: 'group velocity',               label: 'Group Velocity' },

  // ── Waves & Oscillations: Sound ──────────────────────────────────────────────
  { id: 'sound',                        label: 'Sound' },
  { id: 'acoustics',                    label: 'Acoustics' },
  { id: 'speed of sound',               label: 'Speed of Sound' },
  { id: 'Mach number',                  label: 'Mach Number' },
  { id: 'Mach cone',                    label: 'Mach Cone' },
  { id: 'sonic boom',                   label: 'Sonic Boom' },
  { id: 'Helmholtz resonator',          label: 'Helmholtz Resonator' },

  { id: 'Doppler effect',               label: 'Doppler Effect' },

  // ── Waves & Oscillations: Superposition / Interference / Diffraction ─────────
  { id: 'superposition',                label: 'Superposition' },
  { id: 'coherence',                    label: 'Coherence' },
  { id: 'beats',                        label: 'Beats' },

  { id: 'interference',                 label: 'Interference' },
  { id: "Young's double slit",          label: "Young's Double Slit" },
  { id: 'double-slit interference',     label: 'Double-Slit Interference' },
  { id: 'thin film interference',       label: 'Thin Film Interference' },
  { id: 'Fabry-Perot',                  label: 'Fabry-Pérot' },

  { id: 'standing waves',               label: 'Standing Waves' },

  { id: 'diffraction',                  label: 'Diffraction' },
  { id: 'diffraction grating',          label: 'Diffraction Grating' },
  { id: 'diffraction limit',            label: 'Diffraction Limit' },
  { id: "Bragg's law",                  label: "Bragg's Law" },

  // ── Optics: Geometrical Optics ───────────────────────────────────────────────
  { id: 'geometrical optics',           label: 'Geometrical Optics' },
  { id: "Snell's law",                  label: "Snell's Law" },
  { id: "Fermat's principle",           label: "Fermat's Principle" },
  { id: 'refraction',                   label: 'Refraction' },
  { id: 'reflection',                   label: 'Reflection' },
  { id: 'total internal reflection',    label: 'Total Internal Reflection' },
  { id: "Brewster's angle",             label: "Brewster's Angle" },
  { id: 'ray optics',                   label: 'Ray Optics' },

  { id: 'thin lens',                    label: 'Thin Lens' },
  { id: 'thin lens equation',           label: 'Thin Lens Equation' },
  { id: 'focal length',                 label: 'Focal Length' },
  { id: 'magnification',                label: 'Magnification' },

  // ── Optics: Wave Optics ──────────────────────────────────────────────────────
  { id: 'wave optics',                  label: 'Wave Optics' },
  { id: 'Fresnel equations',            label: 'Fresnel Equations' },
  { id: 'anti-reflection coating',      label: 'Anti-Reflection Coating' },
  { id: 'birefringence',                label: 'Birefringence' },

  { id: 'polarization',                 label: 'Polarization' },
  { id: "Malus's law",                  label: "Malus's Law" },

  { id: 'dispersion',                   label: 'Dispersion' },
  { id: 'refractive index',             label: 'Refractive Index' },

  { id: 'photometry',                   label: 'Photometry' },

  { id: 'optical instruments',          label: 'Optical Instruments' },
  { id: 'telescope',                    label: 'Telescope' },
  { id: 'resolving power',              label: 'Resolving Power' },

  // ── Thermodynamics: Ideal Gas ────────────────────────────────────────────────
  { id: 'ideal gas',                    label: 'Ideal Gas' },
  { id: 'ideal gas law',                label: 'Ideal Gas Law' },
  { id: 'kinetic theory',               label: 'Kinetic Theory' },
  { id: 'equipartition',                label: 'Equipartition' },
  { id: 'Maxwell-Boltzmann distribution', label: 'Maxwell-Boltzmann Distribution' },
  { id: "Avogadro's number",            label: "Avogadro's Number" },
  { id: 'mean free path',               label: 'Mean Free Path' },
  { id: 'effusion',                     label: 'Effusion' },
  { id: 'PV diagram',                   label: 'PV Diagram' },

  // ── Thermodynamics: Processes ────────────────────────────────────────────────
  { id: 'thermodynamic processes',      label: 'Thermodynamic Processes' },
  { id: 'isothermal',                   label: 'Isothermal' },
  { id: 'adiabatic',                    label: 'Adiabatic' },
  { id: 'adiabatic process',            label: 'Adiabatic Process' },
  { id: 'isobaric',                     label: 'Isobaric' },
  { id: 'isochoric',                    label: 'Isochoric' },

  // ── Thermodynamics: Heat Engines ─────────────────────────────────────────────
  { id: 'heat engine',                  label: 'Heat Engine' },
  { id: 'Carnot',                       label: 'Carnot' },
  { id: 'Carnot engine',                label: 'Carnot Engine' },
  { id: 'Otto cycle',                   label: 'Otto Cycle' },
  { id: 'thermodynamic cycle',          label: 'Thermodynamic Cycle' },
  { id: 'efficiency',                   label: 'Efficiency' },
  { id: 'heat pump',                    label: 'Heat Pump' },

  { id: 'entropy',                      label: 'Entropy' },

  // ── Thermodynamics: Heat Transfer ────────────────────────────────────────────
  { id: 'heat transfer',                label: 'Heat Transfer' },
  { id: 'thermal conductivity',         label: 'Thermal Conductivity' },
  { id: 'convection',                   label: 'Convection' },
  { id: "Fourier's law",                label: "Fourier's Law" },
  { id: "Newton's cooling",             label: "Newton's Cooling" },
  { id: 'thermal equilibrium',          label: 'Thermal Equilibrium' },

  // ── Thermodynamics: Phase Transitions ───────────────────────────────────────
  { id: 'phase transition',             label: 'Phase Transitions' },
  { id: 'latent heat',                  label: 'Latent Heat' },
  { id: 'Clausius-Clapeyron',           label: 'Clausius-Clapeyron' },
  { id: 'vapor pressure',               label: 'Vapor Pressure' },
  { id: 'triple point',                 label: 'Triple Point' },

  // ── Thermodynamics: Statistical Mechanics ────────────────────────────────────
  { id: 'statistical mechanics',        label: 'Statistical Mechanics' },
  { id: 'Boltzmann',                    label: 'Boltzmann' },
  { id: 'Maxwell-Boltzmann',            label: 'Maxwell-Boltzmann' },
  { id: 'partition function',           label: 'Partition Function' },

  // ── Thermodynamics: Blackbody ────────────────────────────────────────────────
  { id: 'blackbody radiation',          label: 'Blackbody Radiation' },
  { id: 'Stefan-Boltzmann law',         label: 'Stefan-Boltzmann Law' },
  { id: "Wien's law",                   label: "Wien's Law" },
  { id: 'blackbody',                    label: 'Blackbody' },
  { id: "Planck's constant",            label: "Planck's Constant" },

  // ── Quantum Physics ──────────────────────────────────────────────────────────
  { id: 'wave-particle duality',        label: 'Wave-Particle Duality' },
  { id: 'de Broglie wavelength',        label: 'de Broglie Wavelength' },
  { id: 'matter wave interference',     label: 'Matter Wave Interference' },
  { id: 'Heisenberg uncertainty',       label: 'Heisenberg Uncertainty' },

  { id: 'atomic spectra',               label: 'Atomic Spectra' },
  { id: 'Bohr model',                   label: 'Bohr Model' },
  { id: 'Bohr quantization',            label: 'Bohr Quantization' },
  { id: 'hydrogen atom',                label: 'Hydrogen Atom' },
  { id: 'spectroscopy',                 label: 'Spectroscopy' },

  { id: 'photoelectric effect',         label: 'Photoelectric Effect' },

  { id: 'Compton effect',               label: 'Compton Effect' },

  { id: 'quantum tunneling',            label: 'Quantum Tunneling' },
  { id: 'WKB approximation',            label: 'WKB Approximation' },

  { id: 'uncertainty principle',        label: 'Uncertainty Principle' },

  // ── Quantum / Nuclear Physics ────────────────────────────────────────────────
  { id: 'nuclear physics',              label: 'Nuclear Physics' },
  { id: 'binding energy',               label: 'Binding Energy' },
  { id: 'nuclear energy',               label: 'Nuclear Energy' },
  { id: 'nuclear stability',            label: 'Nuclear Stability' },
  { id: 'Q-value',                      label: 'Q-Value' },
  { id: 'semi-empirical mass formula',  label: 'Semi-Empirical Mass Formula' },
  { id: 'radioactive decay',            label: 'Radioactive Decay' },
  { id: 'alpha decay',                  label: 'Alpha Decay' },
  { id: 'beta decay',                   label: 'Beta Decay' },
  { id: 'gamma ray',                    label: 'Gamma Ray' },
  { id: 'half-life',                    label: 'Half-Life' },
  { id: 'exponential decay',            label: 'Exponential Decay' },
  { id: 'activity',                     label: 'Activity' },
  { id: 'decay chain',                  label: 'Decay Chain' },
  { id: 'nuclear fission',              label: 'Nuclear Fission' },
  { id: 'nuclear fusion',               label: 'Nuclear Fusion' },
  { id: 'mass defect',                  label: 'Mass Defect' },

  // ── Relativity ───────────────────────────────────────────────────────────────
  { id: 'special relativity',           label: 'Special Relativity' },
  { id: 'Lorentz factor',               label: 'Lorentz Factor' },
  { id: 'relativistic kinematics',      label: 'Relativistic Kinematics' },
  { id: 'relativistic dynamics',        label: 'Relativistic Dynamics' },
  { id: 'energy-momentum',              label: 'Energy-Momentum' },
  { id: 'four-momentum',                label: 'Four-Momentum' },
  { id: 'proper time',                  label: 'Proper Time' },
  { id: 'invariant mass',               label: 'Invariant Mass' },
  { id: 'simultaneity',                 label: 'Simultaneity' },
  { id: 'rest energy',                  label: 'Rest Energy' },

  { id: 'Lorentz transformation',       label: 'Lorentz Transformation' },
  { id: 'time dilation',                label: 'Time Dilation' },
  { id: 'length contraction',           label: 'Length Contraction' },

  { id: 'mass-energy equivalence',      label: 'Mass-Energy Equivalence' },

  { id: 'spacetime',                    label: 'Spacetime' },
  { id: 'spacetime diagram',            label: 'Spacetime Diagram' },
  { id: 'spacetime interval',           label: 'Spacetime Interval' },

  // ── Nuclear & Particle ───────────────────────────────────────────────────────
  { id: 'particle physics',             label: 'Particle Physics' },
  { id: 'muon',                         label: 'Muon' },
  { id: 'neutrino',                     label: 'Neutrino' },
  { id: 'Cherenkov radiation',          label: 'Cherenkov Radiation' },
  { id: 'pair production',              label: 'Pair Production' },
  { id: 'annihilation',                 label: 'Annihilation' },
  { id: 'pion production',              label: 'Pion Production' },

  // ── Experimental ─────────────────────────────────────────────────────────────
  { id: 'measurement',                  label: 'Measurement' },

  { id: 'error analysis',               label: 'Error Analysis' },
  { id: 'uncertainty',                  label: 'Uncertainty' },
  { id: 'measurement error',            label: 'Measurement Error' },
  { id: 'measurement accuracy',         label: 'Measurement Accuracy' },
  { id: 'systematic error',             label: 'Systematic Error' },

  { id: 'data analysis',                label: 'Data Analysis' },
  { id: 'graphical analysis',           label: 'Graphical Analysis' },
  { id: 'linear regression',            label: 'Linear Regression' },
  { id: 'graphical linearization',      label: 'Graphical Linearization' },
]

// Each {parent, child} pair is one directed edge in the DAG.
// For nodes with multiple parents, the FIRST parent listed here is the
// "primary parent" used for tree layout — the node renders once under it
// and shows other parents as "also under: …".
export const EDGES = [
  // ── Root → main areas ──────────────────────────────────────────────────────
  { parent: 'ipho',                    child: 'mechanics' },
  { parent: 'ipho',                    child: 'electromagnetism' },
  { parent: 'ipho',                    child: 'waves & oscillations' },
  { parent: 'ipho',                    child: 'optics' },
  { parent: 'ipho',                    child: 'thermodynamics' },
  { parent: 'ipho',                    child: 'quantum physics' },
  { parent: 'ipho',                    child: 'relativity' },
  { parent: 'ipho',                    child: 'nuclear & particle' },
  { parent: 'ipho',                    child: 'astrophysics' },
  { parent: 'ipho',                    child: 'experimental' },

  // ── Mechanics → sub-areas ──────────────────────────────────────────────────
  { parent: 'mechanics',               child: 'kinematics' },
  { parent: 'mechanics',               child: 'statics' },
  { parent: 'mechanics',               child: 'dynamics' },
  { parent: 'mechanics',               child: 'celestial mechanics' },  // primary
  { parent: 'mechanics',               child: 'hydrodynamics' },

  // kinematics children
  { parent: 'kinematics',              child: '1D kinematics' },
  { parent: 'kinematics',              child: 'projectile motion' },
  { parent: 'kinematics',              child: 'relative motion' },
  { parent: 'kinematics',              child: 'relative velocity' },
  { parent: 'kinematics',              child: 'circular motion' },
  { parent: 'kinematics',              child: 'centripetal acceleration' },
  { parent: 'kinematics',              child: 'centripetal force' },
  { parent: 'kinematics',              child: 'angular velocity' },
  { parent: 'kinematics',              child: 'angular acceleration' },
  { parent: 'kinematics',              child: 'constant acceleration' },
  { parent: 'kinematics',              child: 'trajectory' },

  // statics children
  { parent: 'statics',                 child: 'torque' },
  { parent: 'statics',                 child: 'center of mass' },
  { parent: 'statics',                 child: 'equilibrium' },
  { parent: 'statics',                 child: 'static equilibrium' },
  { parent: 'statics',                 child: "Hooke's law" },
  { parent: 'statics',                 child: "Young's modulus" },
  { parent: 'statics',                 child: 'static friction' },
  { parent: 'statics',                 child: 'normal force' },

  // dynamics children
  { parent: 'dynamics',                child: "Newton's laws" },
  { parent: 'dynamics',                child: "Newton's second law" },
  { parent: 'dynamics',                child: 'momentum' },
  { parent: 'dynamics',                child: 'momentum conservation' },
  { parent: 'dynamics',                child: 'angular momentum' },
  { parent: 'dynamics',                child: 'energy conservation' },
  { parent: 'dynamics',                child: 'kinetic energy' },
  { parent: 'dynamics',                child: 'potential energy' },
  { parent: 'dynamics',                child: 'work-energy theorem' },
  { parent: 'dynamics',                child: 'impulse' },
  { parent: 'dynamics',                child: 'collision' },
  { parent: 'dynamics',                child: 'elastic collision' },
  { parent: 'dynamics',                child: 'inelastic collision' },
  { parent: 'dynamics',                child: 'friction' },
  { parent: 'dynamics',                child: 'non-inertial frame' },
  { parent: 'dynamics',                child: 'rotation' },

  // rotation children
  { parent: 'rotation',                child: 'moment of inertia' },
  { parent: 'rotation',                child: 'rotational dynamics' },
  { parent: 'rotation',                child: 'rolling motion' },
  { parent: 'rotation',                child: 'rigid body' },
  { parent: 'rotation',                child: 'gyroscope' },
  { parent: 'rotation',                child: 'precession' },

  // celestial mechanics children
  { parent: 'celestial mechanics',     child: "Kepler's laws" },
  { parent: 'celestial mechanics',     child: 'orbital mechanics' },
  { parent: 'celestial mechanics',     child: 'orbital period' },
  { parent: 'celestial mechanics',     child: 'orbital speed' },
  { parent: 'celestial mechanics',     child: 'escape velocity' },
  { parent: 'celestial mechanics',     child: 'Hohmann transfer' },
  { parent: 'celestial mechanics',     child: 'gravitational potential' },
  { parent: 'celestial mechanics',     child: 'Newtonian gravity' },
  { parent: 'celestial mechanics',     child: 'gravity assist' },

  // hydrodynamics children
  { parent: 'hydrodynamics',           child: 'Bernoulli equation' },
  { parent: 'hydrodynamics',           child: 'surface tension' },
  { parent: 'hydrodynamics',           child: 'viscosity' },
  { parent: 'hydrodynamics',           child: 'buoyancy' },
  { parent: 'hydrodynamics',           child: 'fluid dynamics' },
  { parent: 'hydrodynamics',           child: 'continuity equation' },
  { parent: 'hydrodynamics',           child: 'capillary' },
  { parent: 'hydrodynamics',           child: 'hydrostatics' },
  { parent: 'hydrodynamics',           child: 'Poiseuille' },

  // ── Electromagnetism → sub-areas ───────────────────────────────────────────
  { parent: 'electromagnetism',        child: 'electrostatics' },
  { parent: 'electromagnetism',        child: 'magnetostatics' },
  { parent: 'electromagnetism',        child: 'induction' },
  { parent: 'electromagnetism',        child: 'circuits' },
  { parent: 'electromagnetism',        child: "Maxwell's equations" },
  { parent: 'electromagnetism',        child: 'image charge' },

  // electrostatics children
  { parent: 'electrostatics',          child: "Coulomb's law" },
  { parent: 'electrostatics',          child: "Gauss's law" },
  { parent: 'electrostatics',          child: 'electric field' },
  { parent: 'electrostatics',          child: 'electric potential' },
  { parent: 'electrostatics',          child: 'capacitance' },
  { parent: 'electrostatics',          child: 'capacitor' },
  { parent: 'electrostatics',          child: 'electric dipole' },
  { parent: 'electrostatics',          child: 'point charge' },

  // magnetostatics children
  { parent: 'magnetostatics',          child: 'Biot-Savart law' },
  { parent: 'magnetostatics',          child: "Ampere's law" },
  { parent: 'magnetostatics',          child: 'Lorentz force' },
  { parent: 'magnetostatics',          child: 'magnetic field' },
  { parent: 'magnetostatics',          child: 'magnetic dipole' },
  { parent: 'magnetostatics',          child: 'magnetic force' },
  { parent: 'magnetostatics',          child: 'magnetic flux' },

  // induction children
  { parent: 'induction',               child: "Faraday's law" },
  { parent: 'induction',               child: 'eddy currents' },
  { parent: 'induction',               child: 'inductance' },
  { parent: 'induction',               child: 'self-inductance' },
  { parent: 'induction',               child: 'mutual inductance' },
  { parent: 'induction',               child: 'motional EMF' },
  { parent: 'induction',               child: 'electromagnetic induction' },

  // circuits children
  { parent: 'circuits',                child: "Ohm's law" },
  { parent: 'circuits',                child: "Kirchhoff's laws" },
  { parent: 'circuits',                child: 'resistance' },
  { parent: 'circuits',                child: 'resistor networks' },
  { parent: 'circuits',                child: 'Joule heating' },
  { parent: 'circuits',                child: 'Thevenin equivalent' },
  { parent: 'circuits',                child: 'Wheatstone bridge' },
  { parent: 'circuits',                child: 'diode' },
  { parent: 'circuits',                child: 'AC circuits' },
  { parent: 'circuits',                child: 'RC circuit' },
  { parent: 'circuits',                child: 'RL circuit' },
  { parent: 'circuits',                child: 'LC circuit' },

  // AC circuits children
  { parent: 'AC circuits',             child: 'AC impedance' },
  { parent: 'AC circuits',             child: 'AC power' },
  { parent: 'AC circuits',             child: 'RMS' },
  { parent: 'AC circuits',             child: 'impedance' },
  { parent: 'AC circuits',             child: 'power factor' },
  { parent: 'AC circuits',             child: 'Q factor' },
  { parent: 'AC circuits',             child: 'resonance' },  // secondary (primary = waves & osc.)

  // RC circuit children
  { parent: 'RC circuit',              child: 'time constant' },
  { parent: 'RC circuit',              child: 'RC filter' },
  { parent: 'RC circuit',              child: 'RC transient' },

  // LC circuit children
  { parent: 'LC circuit',              child: 'LCR circuit' },
  { parent: 'LC circuit',              child: 'RLC circuit' },
  { parent: 'LC circuit',              child: 'resonance' },  // secondary (primary = waves & osc.)

  // ── Waves & Oscillations → sub-areas ───────────────────────────────────────
  { parent: 'waves & oscillations',    child: 'simple harmonic motion' },
  { parent: 'waves & oscillations',    child: 'damped oscillation' },
  { parent: 'waves & oscillations',    child: 'forced oscillation' },
  { parent: 'waves & oscillations',    child: 'resonance' },   // primary
  { parent: 'waves & oscillations',    child: 'wave propagation' },
  { parent: 'waves & oscillations',    child: 'sound' },
  { parent: 'waves & oscillations',    child: 'Doppler effect' },
  { parent: 'waves & oscillations',    child: 'superposition' },
  { parent: 'waves & oscillations',    child: 'diffraction' }, // primary

  // simple harmonic motion children
  { parent: 'simple harmonic motion',  child: 'SHM' },
  { parent: 'simple harmonic motion',  child: 'pendulum' },
  { parent: 'simple harmonic motion',  child: 'physical pendulum' },
  { parent: 'simple harmonic motion',  child: 'harmonic oscillator' },
  { parent: 'simple harmonic motion',  child: 'small oscillations' },
  { parent: 'simple harmonic motion',  child: 'oscillation period' },

  // damped oscillation children
  { parent: 'damped oscillation',      child: 'damped oscillator' },

  // forced oscillation children
  { parent: 'forced oscillation',      child: 'driven oscillator' },

  // resonance children
  { parent: 'resonance',               child: 'acoustic resonance' },

  // wave propagation children
  { parent: 'wave propagation',        child: 'wavelength' },
  { parent: 'wave propagation',        child: 'phase velocity' },
  { parent: 'wave propagation',        child: 'group velocity' },

  // sound children
  { parent: 'sound',                   child: 'acoustics' },
  { parent: 'sound',                   child: 'speed of sound' },
  { parent: 'sound',                   child: 'Mach number' },
  { parent: 'sound',                   child: 'Mach cone' },
  { parent: 'sound',                   child: 'sonic boom' },
  { parent: 'sound',                   child: 'Helmholtz resonator' },

  // superposition children
  { parent: 'superposition',           child: 'interference' },  // primary
  { parent: 'superposition',           child: 'standing waves' },
  { parent: 'superposition',           child: 'coherence' },
  { parent: 'superposition',           child: 'beats' },

  // interference children
  { parent: 'interference',            child: "Young's double slit" },
  { parent: 'interference',            child: 'double-slit interference' },
  { parent: 'interference',            child: 'thin film interference' },
  { parent: 'interference',            child: 'Fabry-Perot' },

  // diffraction children
  { parent: 'diffraction',             child: 'diffraction grating' },
  { parent: 'diffraction',             child: 'diffraction limit' },
  { parent: 'diffraction',             child: "Bragg's law" },

  // ── Optics → sub-areas ─────────────────────────────────────────────────────
  { parent: 'optics',                  child: 'geometrical optics' },
  { parent: 'optics',                  child: 'wave optics' },
  { parent: 'optics',                  child: 'polarization' },
  { parent: 'optics',                  child: 'dispersion' },
  { parent: 'optics',                  child: 'photometry' },
  { parent: 'optics',                  child: 'optical instruments' },

  // wave optics cross-refs (primary parents are superposition and waves & oscillations)
  { parent: 'wave optics',             child: 'interference' },  // secondary
  { parent: 'wave optics',             child: 'diffraction' },   // secondary
  { parent: 'wave optics',             child: 'Fresnel equations' },
  { parent: 'wave optics',             child: 'anti-reflection coating' },
  { parent: 'wave optics',             child: 'birefringence' },

  // geometrical optics children
  { parent: 'geometrical optics',      child: "Snell's law" },
  { parent: 'geometrical optics',      child: "Fermat's principle" },
  { parent: 'geometrical optics',      child: 'refraction' },
  { parent: 'geometrical optics',      child: 'reflection' },
  { parent: 'geometrical optics',      child: 'total internal reflection' },
  { parent: 'geometrical optics',      child: "Brewster's angle" },
  { parent: 'geometrical optics',      child: 'ray optics' },
  { parent: 'geometrical optics',      child: 'thin lens' },

  // thin lens children
  { parent: 'thin lens',               child: 'thin lens equation' },
  { parent: 'thin lens',               child: 'focal length' },
  { parent: 'thin lens',               child: 'magnification' },

  // polarization children
  { parent: 'polarization',            child: "Malus's law" },

  // dispersion children
  { parent: 'dispersion',              child: 'refractive index' },

  // optical instruments children
  { parent: 'optical instruments',     child: 'telescope' },
  { parent: 'optical instruments',     child: 'resolving power' },

  // ── Thermodynamics → sub-areas ─────────────────────────────────────────────
  { parent: 'thermodynamics',          child: 'ideal gas' },
  { parent: 'thermodynamics',          child: 'thermodynamic processes' },
  { parent: 'thermodynamics',          child: 'heat engine' },
  { parent: 'thermodynamics',          child: 'entropy' },
  { parent: 'thermodynamics',          child: 'heat transfer' },
  { parent: 'thermodynamics',          child: 'phase transition' },
  { parent: 'thermodynamics',          child: 'statistical mechanics' },
  { parent: 'thermodynamics',          child: 'blackbody radiation' },  // primary
  { parent: 'statistical mechanics',   child: 'blackbody radiation' },  // secondary
  { parent: 'quantum physics',         child: 'blackbody radiation' },  // secondary

  // ideal gas children
  { parent: 'ideal gas',               child: 'ideal gas law' },
  { parent: 'ideal gas',               child: 'kinetic theory' },
  { parent: 'ideal gas',               child: 'equipartition' },
  { parent: 'ideal gas',               child: 'Maxwell-Boltzmann distribution' },
  { parent: 'ideal gas',               child: "Avogadro's number" },
  { parent: 'ideal gas',               child: 'mean free path' },
  { parent: 'ideal gas',               child: 'effusion' },
  { parent: 'ideal gas',               child: 'PV diagram' },

  // thermodynamic processes children
  { parent: 'thermodynamic processes', child: 'isothermal' },
  { parent: 'thermodynamic processes', child: 'adiabatic' },
  { parent: 'thermodynamic processes', child: 'adiabatic process' },
  { parent: 'thermodynamic processes', child: 'isobaric' },
  { parent: 'thermodynamic processes', child: 'isochoric' },

  // heat engine children
  { parent: 'heat engine',             child: 'Carnot' },
  { parent: 'heat engine',             child: 'Carnot engine' },
  { parent: 'heat engine',             child: 'Otto cycle' },
  { parent: 'heat engine',             child: 'thermodynamic cycle' },
  { parent: 'heat engine',             child: 'efficiency' },
  { parent: 'heat engine',             child: 'heat pump' },

  // heat transfer children
  { parent: 'heat transfer',           child: 'thermal conductivity' },
  { parent: 'heat transfer',           child: 'convection' },
  { parent: 'heat transfer',           child: "Fourier's law" },
  { parent: 'heat transfer',           child: "Newton's cooling" },
  { parent: 'heat transfer',           child: 'thermal equilibrium' },

  // phase transition children
  { parent: 'phase transition',        child: 'latent heat' },
  { parent: 'phase transition',        child: 'Clausius-Clapeyron' },
  { parent: 'phase transition',        child: 'vapor pressure' },
  { parent: 'phase transition',        child: 'triple point' },

  // statistical mechanics children
  { parent: 'statistical mechanics',   child: 'Boltzmann' },
  { parent: 'statistical mechanics',   child: 'Maxwell-Boltzmann' },
  { parent: 'statistical mechanics',   child: 'partition function' },

  // blackbody radiation children
  { parent: 'blackbody radiation',     child: 'Stefan-Boltzmann law' },
  { parent: 'blackbody radiation',     child: "Wien's law" },
  { parent: 'blackbody radiation',     child: 'blackbody' },
  { parent: 'blackbody radiation',     child: "Planck's constant" },

  // ── Quantum Physics → sub-areas ────────────────────────────────────────────
  { parent: 'quantum physics',         child: 'wave-particle duality' },
  { parent: 'quantum physics',         child: 'atomic spectra' },
  { parent: 'quantum physics',         child: 'photoelectric effect' },
  { parent: 'quantum physics',         child: 'Compton effect' },
  { parent: 'quantum physics',         child: 'quantum tunneling' },
  { parent: 'quantum physics',         child: 'uncertainty principle' },
  { parent: 'quantum physics',         child: 'nuclear physics' },  // primary

  // wave-particle duality children
  { parent: 'wave-particle duality',   child: 'de Broglie wavelength' },
  { parent: 'wave-particle duality',   child: 'matter wave interference' },
  { parent: 'wave-particle duality',   child: 'Heisenberg uncertainty' },  // primary
  { parent: 'uncertainty principle',   child: 'Heisenberg uncertainty' },  // secondary

  // atomic spectra children
  { parent: 'atomic spectra',          child: 'Bohr model' },
  { parent: 'atomic spectra',          child: 'Bohr quantization' },
  { parent: 'atomic spectra',          child: 'hydrogen atom' },
  { parent: 'atomic spectra',          child: 'spectroscopy' },

  // quantum tunneling children
  { parent: 'quantum tunneling',       child: 'WKB approximation' },

  // nuclear physics children (primary parent = quantum physics)
  { parent: 'nuclear physics',         child: 'binding energy' },
  { parent: 'nuclear physics',         child: 'nuclear energy' },
  { parent: 'nuclear physics',         child: 'nuclear stability' },
  { parent: 'nuclear physics',         child: 'Q-value' },
  { parent: 'nuclear physics',         child: 'semi-empirical mass formula' },
  { parent: 'nuclear physics',         child: 'radioactive decay' },
  { parent: 'nuclear physics',         child: 'nuclear fission' },
  { parent: 'nuclear physics',         child: 'nuclear fusion' },
  { parent: 'nuclear physics',         child: 'mass defect' },

  // radioactive decay children
  { parent: 'radioactive decay',       child: 'alpha decay' },
  { parent: 'radioactive decay',       child: 'beta decay' },
  { parent: 'radioactive decay',       child: 'gamma ray' },
  { parent: 'radioactive decay',       child: 'half-life' },
  { parent: 'radioactive decay',       child: 'exponential decay' },
  { parent: 'radioactive decay',       child: 'activity' },
  { parent: 'radioactive decay',       child: 'decay chain' },

  // ── Relativity → sub-areas ─────────────────────────────────────────────────
  { parent: 'relativity',              child: 'special relativity' },
  { parent: 'relativity',              child: 'Lorentz transformation' },
  { parent: 'relativity',              child: 'mass-energy equivalence' },
  { parent: 'relativity',              child: 'spacetime' },

  // special relativity children
  { parent: 'special relativity',      child: 'Lorentz factor' },
  { parent: 'special relativity',      child: 'relativistic kinematics' },
  { parent: 'special relativity',      child: 'relativistic dynamics' },
  { parent: 'special relativity',      child: 'energy-momentum' },
  { parent: 'special relativity',      child: 'four-momentum' },
  { parent: 'special relativity',      child: 'proper time' },
  { parent: 'special relativity',      child: 'invariant mass' },
  { parent: 'special relativity',      child: 'simultaneity' },
  { parent: 'special relativity',      child: 'rest energy' },

  // Lorentz transformation children
  { parent: 'Lorentz transformation',  child: 'time dilation' },
  { parent: 'Lorentz transformation',  child: 'length contraction' },

  // spacetime children
  { parent: 'spacetime',               child: 'spacetime diagram' },
  { parent: 'spacetime',               child: 'spacetime interval' },

  // ── Nuclear & Particle ─────────────────────────────────────────────────────
  { parent: 'nuclear & particle',      child: 'nuclear physics' },  // secondary parent
  { parent: 'nuclear & particle',      child: 'particle physics' },

  // particle physics children
  { parent: 'particle physics',        child: 'muon' },
  { parent: 'particle physics',        child: 'neutrino' },
  { parent: 'particle physics',        child: 'Cherenkov radiation' },
  { parent: 'particle physics',        child: 'pair production' },
  { parent: 'particle physics',        child: 'annihilation' },
  { parent: 'particle physics',        child: 'pion production' },

  // ── Astrophysics ───────────────────────────────────────────────────────────
  { parent: 'astrophysics',            child: 'celestial mechanics' },  // secondary

  // ── Experimental → sub-areas ───────────────────────────────────────────────
  { parent: 'experimental',            child: 'measurement' },
  { parent: 'experimental',            child: 'error analysis' },
  { parent: 'experimental',            child: 'data analysis' },

  // error analysis children
  { parent: 'error analysis',          child: 'uncertainty' },
  { parent: 'error analysis',          child: 'measurement error' },
  { parent: 'error analysis',          child: 'measurement accuracy' },
  { parent: 'error analysis',          child: 'systematic error' },

  // data analysis children
  { parent: 'data analysis',           child: 'graphical analysis' },
  { parent: 'data analysis',           child: 'linear regression' },
  { parent: 'data analysis',           child: 'graphical linearization' },
]

// ── Build lookup maps ────────────────────────────────────────────────────────

const _nodeMap    = {}
const _childrenMap = {}
const _parentsMap  = {}

for (const node of NODES) {
  _nodeMap[node.id]     = node
  _childrenMap[node.id] = []
  _parentsMap[node.id]  = []
}

for (const { parent, child } of EDGES) {
  if (_childrenMap[parent]) _childrenMap[parent].push(child)
  if (_parentsMap[child])   _parentsMap[child].push(parent)
}

export function getNode(id)     { return _nodeMap[id] || null }
export function getChildren(id) { return _childrenMap[id] || [] }
export function getParents(id)  { return _parentsMap[id] || [] }
export function getRoots()      { return NODES.filter(n => (_parentsMap[n.id] || []).length === 0).map(n => n.id) }

// All node IDs in the ontology — used to detect orphan tags
export const ONTOLOGY_IDS = new Set(NODES.map(n => n.id))
