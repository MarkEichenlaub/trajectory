// Common substances. Properties (only where they apply / are commonly tabulated):
//   c            specific heat capacity (J/(kg K))
//   Lf, Lv       latent heat of fusion / vaporization (J/kg)
//   Tmelt, Tboil melting / boiling point (K, at 1 atm)
//   rho          density (kg/m^3)
//   n            refractive index (dimensionless)
//   resistivity  electrical resistivity (ohm m)
//   vsound       speed of sound in the medium (m/s)
//   gamma        adiabatic index (dimensionless)
// Liquid mercury is "Hg" (the planet owns "mercury").
export default {
  category: 'materials',
  objects: {
    water: {
      label: 'Water (liquid)',
      props: {
        c: { value: '4186 J/(kg K)', label: 'specific heat' },
        Lf: { value: '3.34e5 J/kg', label: 'latent heat of fusion' },
        Lv: { value: '2.26e6 J/kg', label: 'latent heat of vaporization' },
        rho: { value: '1000 kg/m^3', label: 'density' },
        n: { value: '1.33', label: 'refractive index' },
        Tmelt: { value: '273.15 K', label: 'melting point' },
        Tboil: { value: '373.15 K', label: 'boiling point' },
        vsound: { value: '1480 m/s', label: 'speed of sound' },
      },
    },
    ice: {
      label: 'Ice',
      props: {
        c: { value: '2090 J/(kg K)', label: 'specific heat' },
        rho: { value: '917 kg/m^3', label: 'density' },
        n: { value: '1.31', label: 'refractive index' },
      },
    },
    steam: {
      label: 'Steam (water vapor)',
      props: {
        c: { value: '2010 J/(kg K)', label: 'specific heat' },
        rho: { value: '0.6 kg/m^3', label: 'density (100 °C, 1 atm)' },
      },
    },
    air: {
      label: 'Air (20 °C, 1 atm)',
      props: {
        c: { value: '1005 J/(kg K)', label: 'specific heat (cp)' },
        rho: { value: '1.204 kg/m^3', label: 'density' },
        vsound: { value: '343 m/s', label: 'speed of sound' },
        n: { value: '1.000293', label: 'refractive index' },
        gamma: { value: '1.4', label: 'adiabatic index' },
      },
    },
    aluminum: {
      label: 'Aluminum',
      props: {
        c: { value: '900 J/(kg K)', label: 'specific heat' },
        rho: { value: '2700 kg/m^3', label: 'density' },
        resistivity: { value: '2.65e-8 ohm m', label: 'resistivity' },
        Tmelt: { value: '933.5 K', label: 'melting point' },
        Lf: { value: '3.97e5 J/kg', label: 'latent heat of fusion' },
      },
    },
    copper: {
      label: 'Copper',
      props: {
        c: { value: '385 J/(kg K)', label: 'specific heat' },
        rho: { value: '8960 kg/m^3', label: 'density' },
        resistivity: { value: '1.68e-8 ohm m', label: 'resistivity' },
        Tmelt: { value: '1357.8 K', label: 'melting point' },
        Lf: { value: '2.05e5 J/kg', label: 'latent heat of fusion' },
      },
    },
    iron: {
      label: 'Iron',
      props: {
        c: { value: '450 J/(kg K)', label: 'specific heat' },
        rho: { value: '7870 kg/m^3', label: 'density' },
        resistivity: { value: '9.7e-8 ohm m', label: 'resistivity' },
        Tmelt: { value: '1811 K', label: 'melting point' },
        Lf: { value: '2.47e5 J/kg', label: 'latent heat of fusion' },
      },
    },
    steel: {
      label: 'Steel (carbon)',
      props: {
        c: { value: '490 J/(kg K)', label: 'specific heat' },
        rho: { value: '7850 kg/m^3', label: 'density' },
        resistivity: { value: '1.43e-7 ohm m', label: 'resistivity' },
      },
    },
    lead: {
      label: 'Lead',
      props: {
        c: { value: '128 J/(kg K)', label: 'specific heat' },
        rho: { value: '11340 kg/m^3', label: 'density' },
        Tmelt: { value: '600.6 K', label: 'melting point' },
        Lf: { value: '2.45e4 J/kg', label: 'latent heat of fusion' },
        resistivity: { value: '2.2e-7 ohm m', label: 'resistivity' },
      },
    },
    gold: {
      label: 'Gold',
      props: {
        c: { value: '129 J/(kg K)', label: 'specific heat' },
        rho: { value: '19300 kg/m^3', label: 'density' },
        resistivity: { value: '2.44e-8 ohm m', label: 'resistivity' },
        Tmelt: { value: '1337.3 K', label: 'melting point' },
      },
    },
    silver: {
      label: 'Silver',
      props: {
        c: { value: '235 J/(kg K)', label: 'specific heat' },
        rho: { value: '10490 kg/m^3', label: 'density' },
        resistivity: { value: '1.59e-8 ohm m', label: 'resistivity' },
        Tmelt: { value: '1234.9 K', label: 'melting point' },
      },
    },
    tungsten: {
      label: 'Tungsten',
      props: {
        c: { value: '134 J/(kg K)', label: 'specific heat' },
        rho: { value: '19250 kg/m^3', label: 'density' },
        resistivity: { value: '5.6e-8 ohm m', label: 'resistivity' },
        Tmelt: { value: '3695 K', label: 'melting point' },
      },
    },
    nichrome: {
      label: 'Nichrome',
      props: {
        c: { value: '450 J/(kg K)', label: 'specific heat' },
        rho: { value: '8400 kg/m^3', label: 'density' },
        resistivity: { value: '1.1e-6 ohm m', label: 'resistivity' },
      },
    },
    glass: {
      label: 'Glass (crown)',
      props: {
        c: { value: '840 J/(kg K)', label: 'specific heat' },
        rho: { value: '2500 kg/m^3', label: 'density' },
        n: { value: '1.52', label: 'refractive index' },
      },
    },
    diamond: {
      label: 'Diamond',
      props: {
        c: { value: '509 J/(kg K)', label: 'specific heat' },
        rho: { value: '3510 kg/m^3', label: 'density' },
        n: { value: '2.42', label: 'refractive index' },
      },
    },
    ethanol: {
      label: 'Ethanol',
      props: {
        c: { value: '2440 J/(kg K)', label: 'specific heat' },
        rho: { value: '789 kg/m^3', label: 'density' },
        Lv: { value: '8.55e5 J/kg', label: 'latent heat of vaporization' },
        Tboil: { value: '351.4 K', label: 'boiling point' },
        n: { value: '1.36', label: 'refractive index' },
      },
    },
    Hg: {
      label: 'Mercury (liquid metal)',
      props: {
        c: { value: '140 J/(kg K)', label: 'specific heat' },
        rho: { value: '13534 kg/m^3', label: 'density' },
        Tmelt: { value: '234.3 K', label: 'melting point' },
        Tboil: { value: '629.9 K', label: 'boiling point' },
      },
    },
    helium: {
      label: 'Helium gas',
      props: {
        c: { value: '5193 J/(kg K)', label: 'specific heat (cp)' },
        rho: { value: '0.1786 kg/m^3', label: 'density (0 °C, 1 atm)' },
        gamma: { value: '1.66', label: 'adiabatic index' },
        vsound: { value: '972 m/s', label: 'speed of sound (0 °C)' },
      },
    },
    hydrogen: {
      label: 'Hydrogen gas',
      props: {
        c: { value: '14300 J/(kg K)', label: 'specific heat (cp)' },
        rho: { value: '0.0899 kg/m^3', label: 'density (0 °C, 1 atm)' },
        gamma: { value: '1.41', label: 'adiabatic index' },
      },
    },
    nitrogen: {
      label: 'Nitrogen gas',
      props: {
        c: { value: '1040 J/(kg K)', label: 'specific heat (cp)' },
        rho: { value: '1.2506 kg/m^3', label: 'density (0 °C, 1 atm)' },
        gamma: { value: '1.4', label: 'adiabatic index' },
      },
    },
    oxygen: {
      label: 'Oxygen gas',
      props: {
        c: { value: '918 J/(kg K)', label: 'specific heat (cp)' },
        rho: { value: '1.429 kg/m^3', label: 'density (0 °C, 1 atm)' },
        gamma: { value: '1.4', label: 'adiabatic index' },
      },
    },
    concrete: {
      label: 'Concrete',
      props: {
        c: { value: '880 J/(kg K)', label: 'specific heat' },
        rho: { value: '2400 kg/m^3', label: 'density' },
      },
    },
    wood: {
      label: 'Wood (typical)',
      props: {
        c: { value: '1700 J/(kg K)', label: 'specific heat' },
        rho: { value: '700 kg/m^3', label: 'density' },
      },
    },
    granite: {
      label: 'Granite',
      props: {
        c: { value: '790 J/(kg K)', label: 'specific heat' },
        rho: { value: '2700 kg/m^3', label: 'density' },
      },
    },
    sand: {
      label: 'Sand',
      props: {
        c: { value: '830 J/(kg K)', label: 'specific heat' },
        rho: { value: '1600 kg/m^3', label: 'density' },
      },
    },
  },
}
