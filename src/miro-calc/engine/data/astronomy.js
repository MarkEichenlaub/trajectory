// Astronomical bodies. Properties:
//   mass        (kg)
//   radius      mean radius (m)
//   a           orbital semi-major axis (m); for the moon, distance from Earth
//   T           orbital period (s)
//   g           surface gravity (m/s^2)
//   day         sidereal rotation period (s), where commonly used
export default {
  category: 'astronomy',
  objects: {
    sun: {
      label: 'Sun',
      props: {
        mass: { value: '1.989e30 kg', label: 'mass', aliases: ['m_sun'] },
        radius: { value: '6.957e8 m', label: 'mean radius', aliases: ['r_sun'] },
        g: { value: '274 m/s^2', label: 'surface gravity' },
        day: { value: '2.193e6 s', label: 'rotation period (equatorial, ~25.4 d)' },
      },
    },
    mercury: {
      label: 'Mercury (planet)',
      props: {
        mass: { value: '3.301e23 kg', label: 'mass', aliases: ['m_mercury'] },
        radius: { value: '2.4397e6 m', label: 'mean radius', aliases: ['r_mercury'] },
        a: { value: '5.791e10 m', label: 'orbital semi-major axis' },
        T: { value: '7.600e6 s', label: 'orbital period (88.0 d)' },
        g: { value: '3.7 m/s^2', label: 'surface gravity' },
      },
    },
    venus: {
      label: 'Venus',
      props: {
        mass: { value: '4.867e24 kg', label: 'mass', aliases: ['m_venus'] },
        radius: { value: '6.0518e6 m', label: 'mean radius', aliases: ['r_venus'] },
        a: { value: '1.082e11 m', label: 'orbital semi-major axis' },
        T: { value: '1.941e7 s', label: 'orbital period (224.7 d)' },
        g: { value: '8.87 m/s^2', label: 'surface gravity' },
      },
    },
    earth: {
      label: 'Earth',
      props: {
        mass: { value: '5.972e24 kg', label: 'mass', aliases: ['m_earth'] },
        radius: { value: '6.371e6 m', label: 'mean radius', aliases: ['r_earth'] },
        a: { value: '1.496e11 m', label: 'orbital semi-major axis' },
        T: { value: '3.156e7 s', label: 'orbital period (1 yr)' },
        g: { value: '9.81 m/s^2', label: 'surface gravity' },
        day: { value: '8.6164e4 s', label: 'rotation period (sidereal)' },
      },
    },
    moon: {
      label: 'Moon',
      props: {
        mass: { value: '7.342e22 kg', label: 'mass', aliases: ['m_moon'] },
        radius: { value: '1.7374e6 m', label: 'mean radius', aliases: ['r_moon'] },
        a: { value: '3.844e8 m', label: 'mean distance from Earth' },
        T: { value: '2.3606e6 s', label: 'orbital period (27.32 d)' },
        g: { value: '1.62 m/s^2', label: 'surface gravity' },
      },
    },
    mars: {
      label: 'Mars',
      props: {
        mass: { value: '6.417e23 kg', label: 'mass', aliases: ['m_mars'] },
        radius: { value: '3.3895e6 m', label: 'mean radius', aliases: ['r_mars'] },
        a: { value: '2.279e11 m', label: 'orbital semi-major axis' },
        T: { value: '5.936e7 s', label: 'orbital period (687 d)' },
        g: { value: '3.71 m/s^2', label: 'surface gravity' },
        day: { value: '8.8643e4 s', label: 'rotation period (sidereal)' },
      },
    },
    jupiter: {
      label: 'Jupiter',
      props: {
        mass: { value: '1.898e27 kg', label: 'mass', aliases: ['m_jupiter'] },
        radius: { value: '6.9911e7 m', label: 'mean radius', aliases: ['r_jupiter'] },
        a: { value: '7.785e11 m', label: 'orbital semi-major axis' },
        T: { value: '3.743e8 s', label: 'orbital period (11.86 yr)' },
        g: { value: '24.79 m/s^2', label: 'surface gravity' },
      },
    },
    saturn: {
      label: 'Saturn',
      props: {
        mass: { value: '5.683e26 kg', label: 'mass', aliases: ['m_saturn'] },
        radius: { value: '5.8232e7 m', label: 'mean radius', aliases: ['r_saturn'] },
        a: { value: '1.4335e12 m', label: 'orbital semi-major axis' },
        T: { value: '9.292e8 s', label: 'orbital period (29.45 yr)' },
        g: { value: '10.44 m/s^2', label: 'surface gravity' },
      },
    },
    uranus: {
      label: 'Uranus',
      props: {
        mass: { value: '8.681e25 kg', label: 'mass', aliases: ['m_uranus'] },
        radius: { value: '2.5362e7 m', label: 'mean radius', aliases: ['r_uranus'] },
        a: { value: '2.8725e12 m', label: 'orbital semi-major axis' },
        T: { value: '2.651e9 s', label: 'orbital period (84.0 yr)' },
        g: { value: '8.87 m/s^2', label: 'surface gravity' },
      },
    },
    neptune: {
      label: 'Neptune',
      props: {
        mass: { value: '1.024e26 kg', label: 'mass', aliases: ['m_neptune'] },
        radius: { value: '2.4622e7 m', label: 'mean radius', aliases: ['r_neptune'] },
        a: { value: '4.4951e12 m', label: 'orbital semi-major axis' },
        T: { value: '5.200e9 s', label: 'orbital period (164.8 yr)' },
        g: { value: '11.15 m/s^2', label: 'surface gravity' },
      },
    },
    pluto: {
      label: 'Pluto',
      props: {
        mass: { value: '1.303e22 kg', label: 'mass', aliases: ['m_pluto'] },
        radius: { value: '1.1883e6 m', label: 'mean radius', aliases: ['r_pluto'] },
        a: { value: '5.9064e12 m', label: 'orbital semi-major axis' },
        T: { value: '7.824e9 s', label: 'orbital period (247.9 yr)' },
        g: { value: '0.62 m/s^2', label: 'surface gravity' },
      },
    },
  },
}
