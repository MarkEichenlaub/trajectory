// Physical constants with collision-safe names.
// mathjs reserves: g = gram, e = Euler's number, h = hour, N = newton,
// min = minute, in = inch, T = tesla, F = farad, C = coulomb.
// Note: kB intentionally shadows the kilobyte unit (useless in physics class).
export const CONSTANT_DEFS = [
  { names: ['c', 'speedOfLight'], value: '299792458 m/s', label: 'Speed of light' },
  { names: ['G', 'gravitationConstant'], value: '6.6743e-11 m^3/(kg s^2)', label: 'Gravitational constant' },
  { names: ['g0', 'gee', 'gravity'], value: '9.8 m/s^2', label: 'Gravitational acceleration (class convention 9.8)' },
  { names: ['g_std'], value: '9.80665 m/s^2', label: 'Standard gravity' },
  { names: ['h_', 'planck'], value: '6.62607015e-34 J s', label: 'Planck constant (h_ because h = hour)' },
  { names: ['hbar'], value: '1.054571817e-34 J s', label: 'Reduced Planck constant' },
  { names: ['kB', 'k_B', 'boltzmann'], value: '1.380649e-23 J/K', label: 'Boltzmann constant' },
  { names: ['NA', 'N_A', 'avogadro'], value: '6.02214076e23 mol^-1', label: "Avogadro's number" },
  { names: ['R', 'gasConstant'], value: '8.31446 J/(mol K)', label: 'Ideal gas constant' },
  { names: ['qe', 'q_e', 'echarge'], value: '1.602176634e-19 C', label: 'Elementary charge (qe because e = Euler)' },
  { names: ['eps0', 'epsilon0', 'epsilon_0'], value: '8.8541878128e-12 F/m', label: 'Vacuum permittivity' },
  { names: ['mu0', 'mu_0'], value: '1.25663706212e-6 N/A^2', label: 'Vacuum permeability' },
  // not "kC" — that's a kilocoulomb in mathjs and shadowing it would be a trap
  { names: ['k_e', 'kE', 'coulombConstant'], value: '8.9875517923e9 N m^2/C^2', label: 'Coulomb constant' },
  { names: ['sigma', 'stefanBoltzmann'], value: '5.670374419e-8 W/(m^2 K^4)', label: 'Stefan–Boltzmann constant' },
  { names: ['me', 'm_e'], value: '9.1093837015e-31 kg', label: 'Electron mass' },
  { names: ['mp', 'm_p'], value: '1.67262192369e-27 kg', label: 'Proton mass' },
  { names: ['mn', 'm_n'], value: '1.67492749804e-27 kg', label: 'Neutron mass' },
  { names: ['a0', 'bohrRadius'], value: '5.29177210903e-11 m', label: 'Bohr radius' },
  { names: ['Ry', 'rydberg'], value: '13.605693 eV', label: 'Rydberg energy' },
  { names: ['Patm', 'atmPressure'], value: '101325 Pa', label: 'Standard atmospheric pressure' },
  { names: ['wien'], value: '2.897771955e-3 m K', label: 'Wien displacement constant' },
  { names: ['faraday', 'F_const'], value: '96485.33 C/mol', label: 'Faraday constant' },
  { names: ['vsound'], value: '343 m/s', label: 'Speed of sound in air (20 °C)' },
]
