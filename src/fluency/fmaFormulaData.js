// Formula cards for the "F=ma formulas" fluency skill.
//
// Provenance: every formula here was harvested from the worked solutions of
// the 22 real F=ma papers digitized in scripts/fma_exams/ (2010-2023 plus the
// four PhysicsWOOT practice exams) -- i.e. these are formulas the official
// solutions actually cite, not a textbook's table of contents. The genuinely
// obvious ones (F = ma, v = d/t, p = mv, kinematics with all four variables)
// are deliberately absent; Mark picked the final list by hand on 2026-09-16.
//
// A card is:
//   key    unique slug
//   cat    topic bucket -- also the pool the "name this formula" distractors
//          are drawn from, so cards in the same cat should be confusable
//   tier   0 = core, 1 = second wave, 2 = harder. The drill only offers
//          tier <= level, so early levels stay on the bread-and-butter ones.
//   ask    the recall prompt: a situation, ending in "is" / "are"
//   name   short noun phrase, used as an option in reverse mode
//   tex    the correct formula (KaTeX, no $$)
//   wrong  exactly 3 hand-written near-misses. Hand-written rather than
//          generated because the whole value of the card is that the wrong
//          options are the mistakes you'd actually make -- v/r^2 for v^2/r,
//          sqrt(m/k) for sqrt(k/m), 2/3 vs 2/5 for a sphere.
//   why    one-line explanation shown after grading
//   concept  (instead of tex/wrong) for the handful of items that are a rule
//          rather than an equation -- tipping, Kepler's second law, the shell
//          theorem. { correct, wrong: [3] } of plain-text options.
//   apply  (rng, h) => { promptMd, raw, explanationMd } -- optional numeric
//          drill. Numbers are chosen so the arithmetic is mental; g = 10.
//
// h is { randInt, randChoice, randDec, r2 } passed in from generators.js so
// this file stays pure data with no imports.

export const FMA_FORMULAS = [
  // ── Kinematics ────────────────────────────────────────────────────────
  {
    key: 'free-fall-speed', cat: 'kinematics', tier: 0,
    ask: 'An object is dropped from rest and falls a height $$h$$. Its speed when it lands is',
    name: 'speed after falling a height h from rest',
    tex: 'v = \\sqrt{2gh}',
    wrong: ['v = \\sqrt{gh}', 'v = 2gh', 'v = \\sqrt{\\dfrac{gh}{2}}'],
    why: 'Set $$mgh = \\tfrac12 mv^2$$ and solve for $$v$$. The mass cancels.',
    apply: (rng, h) => {
      const v = h.randChoice(rng, [10, 20, 30, 40])
      const hh = (v * v) / 20
      return {
        promptMd: `A ball is dropped from rest from a height of ${hh} m. How fast is it going when it hits the ground? (Take $$g = 10$$ m/s².)`,
        raw: v,
        explanationMd: `$$v = \\sqrt{2gh} = \\sqrt{2(10)(${hh})} = \\sqrt{${2 * 10 * hh}} = ${v}$$ m/s.`,
      }
    },
  },
  {
    key: 'projectile-range', cat: 'kinematics', tier: 1,
    ask: 'A projectile is launched at speed $$v_0$$ and angle $$\\theta$$ over level ground. Its range is',
    name: 'range of a projectile on level ground',
    tex: 'R = \\dfrac{v_0^2 \\sin 2\\theta}{g}',
    wrong: ['R = \\dfrac{v_0^2 \\sin\\theta}{g}', 'R = \\dfrac{2v_0^2 \\sin\\theta}{g}', 'R = \\dfrac{v_0^2 \\sin^2 2\\theta}{g}'],
    why: 'Range is horizontal speed times time of flight: $$(v_0\\cos\\theta)(2v_0\\sin\\theta/g)$$. It peaks at $$\\theta = 45°$$.',
    apply: (rng, h) => {
      const v0 = h.randChoice(rng, [10, 20, 30])
      const R = (v0 * v0) / 10
      return {
        promptMd: `A projectile is launched at ${v0} m/s at 45° over level ground. How far does it land from the launch point, in meters? (Take $$g = 10$$ m/s².)`,
        raw: R,
        explanationMd: `At 45°, $$\\sin 2\\theta = 1$$, so $$R = v_0^2/g = ${v0}^2/10 = ${R}$$ m.`,
      }
    },
  },
  {
    key: 'projectile-height', cat: 'kinematics', tier: 1,
    ask: 'A projectile is launched with vertical velocity component $$v_{0y}$$. Its maximum height above the launch point is',
    name: 'maximum height of a projectile',
    tex: 'h = \\dfrac{v_{0y}^2}{2g}',
    wrong: ['h = \\dfrac{v_{0y}^2}{g}', 'h = \\dfrac{v_{0y}}{2g}', 'h = \\dfrac{2v_{0y}^2}{g}'],
    why: 'The vertical motion is the same as a ball thrown straight up at $$v_{0y}$$, so $$\\tfrac12 v_{0y}^2 = gh$$.',
    apply: (rng, h) => {
      const vy = h.randChoice(rng, [10, 20, 30, 40])
      const hh = (vy * vy) / 20
      return {
        promptMd: `A ball is launched with a vertical velocity component of ${vy} m/s. How high does it rise, in meters? (Take $$g = 10$$ m/s².)`,
        raw: hh,
        explanationMd: `$$h = v_{0y}^2/2g = ${vy}^2/20 = ${hh}$$ m.`,
      }
    },
  },
  {
    key: 'projectile-flight-time', cat: 'kinematics', tier: 1,
    ask: 'A projectile launched with vertical velocity component $$v_{0y}$$ returns to its launch height after a time',
    name: 'time of flight of a projectile',
    tex: 't = \\dfrac{2v_{0y}}{g}',
    wrong: ['t = \\dfrac{v_{0y}}{g}', 't = \\dfrac{v_{0y}}{2g}', 't = \\dfrac{2g}{v_{0y}}'],
    why: 'It takes $$v_{0y}/g$$ to reach the top, and the same again to come back down.',
  },

  // ── Circular motion ───────────────────────────────────────────────────
  {
    key: 'centripetal-v-r', cat: 'circular', tier: 0,
    ask: 'An object moves in a circle of radius $$r$$ at speed $$v$$. Its acceleration is',
    name: 'centripetal acceleration in terms of v and r',
    tex: 'a = \\dfrac{v^2}{r}',
    wrong: ['a = \\dfrac{v}{r^2}', 'a = \\dfrac{v^2}{r^2}', 'a = \\dfrac{2v^2}{r}'],
    why: 'The acceleration points at the center and has magnitude $$v^2/r$$, whatever is supplying the force.',
    apply: (rng, h) => {
      const v = h.randChoice(rng, [4, 6, 8, 10, 12])
      const r = h.randChoice(rng, [2, 4, 5, 8])
      return {
        promptMd: `A car rounds a circular track of radius ${r} m at ${v} m/s. What is its centripetal acceleration, in m/s²?`,
        raw: (v * v) / r,
        explanationMd: `$$a = v^2/r = ${v}^2/${r} = ${(v * v) / r}$$ m/s².`,
      }
    },
  },
  {
    key: 'centripetal-omega-r', cat: 'circular', tier: 0,
    ask: 'An object moves in a circle of radius $$r$$ at angular speed $$\\omega$$. Its acceleration is',
    name: 'centripetal acceleration in terms of omega and r',
    tex: 'a = \\omega^2 r',
    wrong: ['a = \\omega r^2', 'a = \\dfrac{\\omega^2}{r}', 'a = \\omega r'],
    why: 'Substitute $$v = \\omega r$$ into $$a = v^2/r$$. This is the more useful form when the rotation rate is what you know.',
    apply: (rng, h) => {
      const w = h.randChoice(rng, [2, 3, 4, 5])
      const r = h.randChoice(rng, [2, 3, 4, 6])
      return {
        promptMd: `A point on a turntable sits ${r} m from the axis, which spins at $$\\omega = ${w}$$ rad/s. What is the point's centripetal acceleration, in m/s²?`,
        raw: w * w * r,
        explanationMd: `$$a = \\omega^2 r = ${w}^2 \\times ${r} = ${w * w * r}$$ m/s².`,
      }
    },
  },
  {
    key: 'v-omega-r', cat: 'circular', tier: 0,
    ask: 'A point a distance $$r$$ from a rotation axis turning at angular speed $$\\omega$$ moves at speed',
    name: 'speed of a rotating point in terms of omega and r',
    tex: 'v = \\omega r',
    wrong: ['v = \\dfrac{\\omega}{r}', 'v = \\omega r^2', 'v = \\omega^2 r'],
    why: 'In one radian of rotation the point travels an arc of length $$r$$, so speed is $$\\omega r$$.',
  },
  {
    key: 'omega-period', cat: 'circular', tier: 0,
    ask: 'Something goes around once every $$T$$ seconds, or $$f$$ times per second. Its angular speed is',
    name: 'angular speed from period or frequency',
    tex: '\\omega = \\dfrac{2\\pi}{T} = 2\\pi f',
    wrong: ['\\omega = \\dfrac{T}{2\\pi} = \\dfrac{f}{2\\pi}', '\\omega = 2\\pi T = \\dfrac{2\\pi}{f}', '\\omega = \\dfrac{1}{2\\pi T}'],
    why: 'One full turn is $$2\\pi$$ radians, and it takes time $$T$$.',
    apply: (rng, h) => {
      const T = h.randChoice(rng, [2, 4, 0.5, 0.25, 8])
      return {
        promptMd: `A wheel turns once every ${T} s. What is its angular speed, in rad/s?`,
        raw: (2 * Math.PI) / T,
        explanationMd: `$$\\omega = 2\\pi/T = 2\\pi/${T} \\approx ${h.r2((2 * Math.PI) / T, 3)}$$ rad/s.`,
      }
    },
  },

  // ── Forces ────────────────────────────────────────────────────────────
  {
    key: 'max-static-friction', cat: 'forces', tier: 0,
    ask: 'A block sits on a surface that pushes up on it with normal force $$N$$. The largest friction force the surface can supply is',
    name: 'maximum static friction force',
    tex: 'f_{\\max} = \\mu_s N',
    wrong: ['f_{\\max} = \\mu_s m g', 'f_{\\max} = \\dfrac{N}{\\mu_s}', 'f_{\\max} = \\mu_s N^2'],
    why: 'Friction is tied to the *normal* force, not the weight. On an incline or with something pressing down, $$N \\ne mg$$.',
  },
  {
    key: 'angle-of-repose', cat: 'forces', tier: 1,
    ask: 'A block on a ramp just begins to slide when the ramp reaches angle $$\\theta$$. The coefficient of static friction is',
    name: 'coefficient of friction from the angle a block starts to slide',
    tex: '\\mu_s = \\tan\\theta',
    wrong: ['\\mu_s = \\sin\\theta', '\\mu_s = \\cos\\theta', '\\mu_s = \\dfrac{1}{\\tan\\theta}'],
    why: 'At the tipping point $$mg\\sin\\theta = \\mu_s\\, mg\\cos\\theta$$, and the $$mg$$ cancels.',
    apply: (rng, h) => {
      const th = h.randChoice(rng, [30, 45, 60])
      const mu = Math.tan((th * Math.PI) / 180)
      return {
        promptMd: `A block starts to slide when its ramp is tilted to ${th}°. What is $$\\mu_s$$?`,
        raw: mu,
        explanationMd: `$$\\mu_s = \\tan ${th}° \\approx ${h.r2(mu, 3)}$$.`,
      }
    },
  },
  {
    key: 'incline-along', cat: 'forces', tier: 0,
    ask: 'A block of mass $$m$$ sits on an incline of angle $$\\theta$$. The component of gravity pointing down the slope is',
    name: 'gravity component along an incline',
    tex: 'mg\\sin\\theta',
    wrong: ['mg\\cos\\theta', 'mg\\tan\\theta', '\\dfrac{mg}{\\sin\\theta}'],
    why: 'Sine goes with the along-the-slope direction: at $$\\theta = 90°$$ the whole weight pulls it along, and $$\\sin 90° = 1$$.',
  },
  {
    key: 'incline-normal', cat: 'forces', tier: 0,
    ask: 'A block of mass $$m$$ sits on an incline of angle $$\\theta$$. The normal force on it is',
    name: 'normal force on an incline',
    tex: 'N = mg\\cos\\theta',
    wrong: ['N = mg\\sin\\theta', 'N = mg\\tan\\theta', 'N = \\dfrac{mg}{\\cos\\theta}'],
    why: 'At $$\\theta = 0$$ the surface carries the full weight, and $$\\cos 0 = 1$$. This is the $$N$$ that goes into $$\\mu N$$.',
  },
  {
    key: 'atwood-a', cat: 'forces', tier: 1,
    ask: 'Two masses $$m_1 > m_2$$ hang from a light string over a frictionless pulley. Their acceleration is',
    name: 'acceleration of an Atwood machine',
    tex: 'a = \\dfrac{(m_1-m_2)g}{m_1+m_2}',
    wrong: ['a = \\dfrac{(m_1-m_2)g}{m_1 m_2}', 'a = \\dfrac{(m_1+m_2)g}{m_1-m_2}', 'a = \\dfrac{m_1 g}{m_1+m_2}'],
    why: 'Net force is $$(m_1-m_2)g$$ and the total mass being accelerated is $$m_1+m_2$$.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[3, 1], [5, 3], [7, 1], [9, 3], [4, 2]])
      const a = ((m1 - m2) * 10) / (m1 + m2)
      return {
        promptMd: `Masses of ${m1} kg and ${m2} kg hang over a frictionless pulley. What is their acceleration, in m/s²? (Take $$g = 10$$ m/s².)`,
        raw: a,
        explanationMd: `$$a = \\dfrac{(${m1}-${m2})(10)}{${m1}+${m2}} = ${h.r2(a, 3)}$$ m/s².`,
      }
    },
  },
  {
    key: 'atwood-tension', cat: 'forces', tier: 2,
    ask: 'Two masses hang from a light string over a frictionless pulley. The tension in the string is',
    name: 'string tension in an Atwood machine',
    tex: 'T = \\dfrac{2m_1m_2 g}{m_1+m_2}',
    wrong: ['T = \\dfrac{m_1m_2 g}{m_1+m_2}', 'T = \\dfrac{(m_1+m_2)g}{2}', 'T = \\dfrac{2m_1m_2 g}{m_1-m_2}'],
    why: 'It is $$2g$$ times the reduced mass. Sanity check: with $$m_1 = m_2 = m$$ it gives $$T = mg$$, as it must.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[3, 1], [5, 3], [4, 2], [6, 3]])
      const T = (2 * m1 * m2 * 10) / (m1 + m2)
      return {
        promptMd: `Masses of ${m1} kg and ${m2} kg hang over a frictionless pulley. What is the tension in the string, in newtons? (Take $$g = 10$$ m/s².)`,
        raw: T,
        explanationMd: `$$T = \\dfrac{2(${m1})(${m2})(10)}{${m1}+${m2}} = ${h.r2(T, 3)}$$ N.`,
      }
    },
  },
  {
    key: 'springs-parallel', cat: 'forces', tier: 1,
    ask: 'Two springs $$k_1$$ and $$k_2$$ are attached side by side to the same mass, so both stretch the same amount. The effective spring constant is',
    name: 'effective spring constant for springs in parallel',
    tex: 'k_{\\text{eff}} = k_1 + k_2',
    wrong: ['k_{\\text{eff}} = \\dfrac{k_1k_2}{k_1+k_2}', 'k_{\\text{eff}} = \\dfrac{k_1+k_2}{2}', 'k_{\\text{eff}} = \\sqrt{k_1k_2}'],
    why: 'Same stretch, so the forces add. Parallel springs are stiffer than either one alone.',
  },
  {
    key: 'springs-series', cat: 'forces', tier: 1,
    ask: 'Two springs $$k_1$$ and $$k_2$$ are joined end to end, so both carry the same force. The effective spring constant obeys',
    name: 'effective spring constant for springs in series',
    tex: '\\dfrac{1}{k_{\\text{eff}}} = \\dfrac{1}{k_1} + \\dfrac{1}{k_2}',
    wrong: ['k_{\\text{eff}} = k_1 + k_2', 'k_{\\text{eff}} = \\sqrt{k_1k_2}', 'k_{\\text{eff}} = \\dfrac{k_1+k_2}{k_1k_2}'],
    why: 'Same force, so the stretches add. Springs in series are floppier than either one alone.',
    apply: (rng, h) => {
      const [k1, k2] = h.randChoice(rng, [[6, 3], [12, 6], [4, 4], [10, 15], [20, 5]])
      const k = (k1 * k2) / (k1 + k2)
      return {
        promptMd: `Springs of ${k1} N/m and ${k2} N/m are joined end to end. What is the effective spring constant, in N/m?`,
        raw: k,
        explanationMd: `$$k_{\\text{eff}} = \\dfrac{k_1k_2}{k_1+k_2} = \\dfrac{(${k1})(${k2})}{${k1 + k2}} = ${h.r2(k, 3)}$$ N/m.`,
      }
    },
  },

  // ── Energy and power ──────────────────────────────────────────────────
  {
    key: 'spring-pe', cat: 'energy', tier: 0,
    ask: 'A spring of constant $$k$$ is stretched a distance $$x$$ from its natural length. The energy stored in it is',
    name: 'potential energy stored in a spring',
    tex: 'U = \\tfrac12 k x^2',
    wrong: ['U = kx^2', 'U = \\tfrac12 kx', 'U = \\tfrac12 k^2 x'],
    why: 'The force builds up linearly from 0 to $$kx$$, so the work done is the average force $$\\tfrac12 kx$$ times $$x$$.',
    apply: (rng, h) => {
      const k = h.randChoice(rng, [50, 100, 200, 400])
      const x = h.randChoice(rng, [0.2, 0.3, 0.4, 0.5])
      const U = 0.5 * k * x * x
      return {
        promptMd: `A spring with $$k = ${k}$$ N/m is stretched ${x} m. How much energy is stored in it, in joules?`,
        raw: U,
        explanationMd: `$$U = \\tfrac12 kx^2 = \\tfrac12(${k})(${x})^2 = ${h.r2(U, 3)}$$ J.`,
      }
    },
  },
  {
    key: 'power-fv', cat: 'energy', tier: 0,
    ask: 'A force $$F$$ acts on something moving at speed $$v$$ in the same direction. The power it delivers is',
    name: 'power delivered by a force',
    tex: 'P = Fv',
    wrong: ['P = \\dfrac{F}{v}', 'P = \\tfrac12 Fv', 'P = Fv^2'],
    why: 'Work per unit time: in time $$dt$$ the force does $$F\\,v\\,dt$$ of work. Useful for drag and for cars at constant speed.',
    apply: (rng, h) => {
      const F = h.randChoice(rng, [50, 120, 250, 400])
      const v = h.randChoice(rng, [4, 5, 8, 10])
      return {
        promptMd: `A car's engine pushes it forward with ${F} N while it travels at ${v} m/s. What power is the engine delivering, in watts?`,
        raw: F * v,
        explanationMd: `$$P = Fv = (${F})(${v}) = ${F * v}$$ W.`,
      }
    },
  },
  {
    key: 'ke-from-p', cat: 'energy', tier: 1,
    ask: 'An object of mass $$m$$ has momentum of magnitude $$p$$. Its kinetic energy is',
    name: 'kinetic energy in terms of momentum',
    tex: 'K = \\dfrac{p^2}{2m}',
    wrong: ['K = \\dfrac{p^2}{m}', 'K = \\dfrac{2p^2}{m}', 'K = \\dfrac{p}{2m}'],
    why: 'Substitute $$v = p/m$$ into $$\\tfrac12 mv^2$$. This form is what you want whenever momentum is the conserved quantity.',
    apply: (rng, h) => {
      const m = h.randChoice(rng, [2, 3, 4, 5])
      const p = h.randChoice(rng, [6, 12, 20, 30])
      const K = (p * p) / (2 * m)
      return {
        promptMd: `A ${m} kg object has momentum ${p} kg·m/s. What is its kinetic energy, in joules?`,
        raw: K,
        explanationMd: `$$K = p^2/2m = ${p}^2/(2 \\times ${m}) = ${h.r2(K, 3)}$$ J.`,
      }
    },
  },

  // ── Momentum and collisions ───────────────────────────────────────────
  {
    key: 'impulse', cat: 'momentum', tier: 0,
    ask: 'An average force $$F$$ acts for a time $$\\Delta t$$. The change in the object\'s momentum is',
    name: 'impulse-momentum theorem',
    tex: '\\Delta p = F\\,\\Delta t',
    wrong: ['\\Delta p = \\dfrac{F}{\\Delta t}', '\\Delta p = \\tfrac12 F\\,\\Delta t', '\\Delta p = F\\,\\Delta t^2'],
    why: 'The area under a force-vs-time graph is the momentum change. This is the tool for collisions, bats, and bouncing balls.',
    apply: (rng, h) => {
      const F = h.randChoice(rng, [20, 50, 80, 100])
      const dt = h.randChoice(rng, [0.2, 0.4, 0.5, 0.8])
      const m = h.randChoice(rng, [2, 4, 5])
      const v = (F * dt) / m
      return {
        promptMd: `A ${m} kg puck at rest is hit with an average force of ${F} N for ${dt} s. How fast is it moving afterward, in m/s?`,
        raw: v,
        explanationMd: `$$\\Delta p = F\\Delta t = (${F})(${dt}) = ${h.r2(F * dt, 3)}$$ kg·m/s, so $$v = \\Delta p/m = ${h.r2(v, 3)}$$ m/s.`,
      }
    },
  },
  {
    key: 'elastic-v1', cat: 'momentum', tier: 1,
    ask: 'A mass $$m_1$$ moving at $$v_1$$ hits a stationary $$m_2$$ head-on and elastically. The incoming mass ends up moving at',
    name: 'final speed of the incoming mass in an elastic collision',
    tex: "v_1' = \\dfrac{m_1-m_2}{m_1+m_2}\\,v_1",
    wrong: ["v_1' = \\dfrac{m_1+m_2}{m_1-m_2}\\,v_1", "v_1' = \\dfrac{m_2-m_1}{m_1+m_2}\\,v_1", "v_1' = \\dfrac{2m_2}{m_1+m_2}\\,v_1"],
    why: 'Check the limits: equal masses gives 0 (it stops dead), and a wall ($$m_2 \\to \\infty$$) gives $$-v_1$$.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[3, 1], [5, 3], [1, 3], [6, 2]])
      const v1 = h.randChoice(rng, [4, 8, 12])
      const out = ((m1 - m2) / (m1 + m2)) * v1
      return {
        promptMd: `A ${m1} kg ball moving at ${v1} m/s hits a stationary ${m2} kg ball head-on and elastically. What is the ${m1} kg ball's velocity afterward, in m/s? (Negative means it bounces back.)`,
        raw: out,
        explanationMd: `$$v_1' = \\dfrac{${m1}-${m2}}{${m1}+${m2}}(${v1}) = ${h.r2(out, 3)}$$ m/s.`,
      }
    },
  },
  {
    key: 'elastic-v2', cat: 'momentum', tier: 1,
    ask: 'A mass $$m_1$$ moving at $$v_1$$ hits a stationary $$m_2$$ head-on and elastically. The struck mass ends up moving at',
    name: 'final speed of the struck mass in an elastic collision',
    tex: "v_2' = \\dfrac{2m_1}{m_1+m_2}\\,v_1",
    wrong: ["v_2' = \\dfrac{2m_2}{m_1+m_2}\\,v_1", "v_2' = \\dfrac{m_1}{m_1+m_2}\\,v_1", "v_2' = \\dfrac{2m_1}{m_1-m_2}\\,v_1"],
    why: 'A very light target ($$m_2 \\to 0$$) flies off at $$2v_1$$, twice the incoming speed. That factor of 2 is the thing to remember.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[3, 1], [1, 3], [5, 5], [2, 6]])
      const v1 = h.randChoice(rng, [4, 8, 12])
      const out = ((2 * m1) / (m1 + m2)) * v1
      return {
        promptMd: `A ${m1} kg ball moving at ${v1} m/s hits a stationary ${m2} kg ball head-on and elastically. How fast is the ${m2} kg ball moving afterward, in m/s?`,
        raw: out,
        explanationMd: `$$v_2' = \\dfrac{2(${m1})}{${m1}+${m2}}(${v1}) = ${h.r2(out, 3)}$$ m/s.`,
      }
    },
  },
  {
    key: 'elastic-relative-speed', cat: 'momentum', tier: 1,
    ask: 'Two objects collide elastically in one dimension. Besides momentum and kinetic energy, what else is unchanged by the collision?',
    name: 'relative-speed rule for elastic collisions',
    concept: {
      correct: 'The relative speed of the two objects — they separate as fast as they approached',
      wrong: [
        'The speed of each object individually',
        'The relative speed, but only if the masses are equal',
        'The total momentum of the lighter object alone',
      ],
    },
    why: 'Speed of separation = speed of approach. It replaces the messy kinetic-energy equation with a linear one, which is usually much faster.',
  },
  {
    key: 'inelastic-v', cat: 'momentum', tier: 0,
    ask: 'A mass $$m_1$$ moving at $$v_1$$ hits a stationary $$m_2$$ and the two stick together. They move off at',
    name: 'final speed in a perfectly inelastic collision',
    tex: 'v = \\dfrac{m_1 v_1}{m_1+m_2}',
    wrong: ['v = \\dfrac{m_1 v_1}{m_2}', 'v = \\dfrac{(m_1+m_2)v_1}{m_1}', 'v = \\dfrac{m_2 v_1}{m_1+m_2}'],
    why: 'Momentum is conserved and the final mass is $$m_1+m_2$$. Kinetic energy is not conserved.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[2, 6], [3, 1], [4, 4], [1, 9]])
      const v1 = h.randChoice(rng, [5, 8, 10, 20])
      const v = (m1 * v1) / (m1 + m2)
      return {
        promptMd: `A ${m1} kg lump of clay moving at ${v1} m/s hits a stationary ${m2} kg block and sticks to it. How fast do they move off, in m/s?`,
        raw: v,
        explanationMd: `$$v = \\dfrac{(${m1})(${v1})}{${m1}+${m2}} = ${h.r2(v, 3)}$$ m/s.`,
      }
    },
  },
  {
    key: 'inelastic-ke-lost', cat: 'momentum', tier: 2,
    ask: 'A mass $$m_1$$ hits a stationary $$m_2$$ and sticks. The fraction of the kinetic energy that is lost is',
    name: 'fraction of kinetic energy lost when two objects stick together',
    tex: '\\dfrac{m_2}{m_1+m_2}',
    wrong: ['\\dfrac{m_1}{m_1+m_2}', '\\dfrac{m_1-m_2}{m_1+m_2}', '\\dfrac{m_2}{m_1}'],
    why: 'A heavy target eats almost all the energy; a light one barely any. Equivalently, the fraction *kept* is $$m_1/(m_1+m_2)$$.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[1, 3], [2, 2], [1, 4], [3, 1]])
      const f = m2 / (m1 + m2)
      return {
        promptMd: `A ${m1} kg object hits a stationary ${m2} kg object and sticks to it. What fraction of the kinetic energy is lost?`,
        raw: f,
        explanationMd: `Fraction lost $$= \\dfrac{m_2}{m_1+m_2} = \\dfrac{${m2}}{${m1 + m2}} = ${h.r2(f, 3)}$$.`,
      }
    },
  },
  {
    key: 'center-of-mass', cat: 'momentum', tier: 0,
    ask: 'For a set of masses $$m_i$$ at positions $$x_i$$, the center of mass is at',
    name: 'position of the center of mass',
    tex: 'x_{\\text{cm}} = \\dfrac{\\sum m_i x_i}{\\sum m_i}',
    wrong: ['x_{\\text{cm}} = \\dfrac{\\sum m_i x_i}{N}', 'x_{\\text{cm}} = \\dfrac{\\sum x_i}{\\sum m_i}', 'x_{\\text{cm}} = \\sum \\dfrac{m_i}{x_i}'],
    why: 'A mass-weighted average. With no external force its velocity never changes, which is what makes it the right frame for collision problems.',
    apply: (rng, h) => {
      const m1 = h.randChoice(rng, [1, 2, 3])
      const m2 = h.randChoice(rng, [3, 4, 6])
      const d = h.randChoice(rng, [4, 6, 10])
      const x = (m2 * d) / (m1 + m2)
      return {
        promptMd: `A ${m1} kg mass sits at $$x = 0$$ and a ${m2} kg mass sits at $$x = ${d}$$ m. Where is the center of mass, in meters?`,
        raw: x,
        explanationMd: `$$x_{\\text{cm}} = \\dfrac{(${m1})(0)+(${m2})(${d})}{${m1}+${m2}} = ${h.r2(x, 3)}$$ m.`,
      }
    },
  },
  {
    key: 'reduced-mass', cat: 'momentum', tier: 2,
    ask: 'Two masses $$m_1$$ and $$m_2$$ interact only with each other. The reduced mass of the pair is',
    name: 'reduced mass of a two-body system',
    tex: '\\mu = \\dfrac{m_1 m_2}{m_1+m_2}',
    wrong: ['\\mu = m_1 + m_2', '\\mu = \\dfrac{m_1+m_2}{m_1m_2}', '\\mu = \\dfrac{m_1m_2}{m_1-m_2}'],
    why: 'It turns a two-body problem into a one-body problem: two masses on a spring oscillate at $$\\omega = \\sqrt{k/\\mu}$$. Note $$\\mu$$ is always smaller than either mass.',
    apply: (rng, h) => {
      const [m1, m2] = h.randChoice(rng, [[3, 6], [2, 2], [4, 12], [1, 3], [6, 3]])
      const mu = (m1 * m2) / (m1 + m2)
      return {
        promptMd: `Masses of ${m1} kg and ${m2} kg are connected by a spring. What is their reduced mass, in kg?`,
        raw: mu,
        explanationMd: `$$\\mu = \\dfrac{(${m1})(${m2})}{${m1}+${m2}} = ${h.r2(mu, 3)}$$ kg.`,
      }
    },
  },

  // ── Rotation ──────────────────────────────────────────────────────────
  {
    key: 'torque-ialpha', cat: 'rotation', tier: 0,
    ask: 'A net torque $$\\tau$$ acts on a body with moment of inertia $$I$$. Its angular acceleration obeys',
    name: "Newton's second law for rotation",
    tex: '\\tau = I\\alpha',
    wrong: ['\\tau = I\\omega', '\\tau = \\dfrac{I}{\\alpha}', '\\tau = \\tfrac12 I\\alpha'],
    why: 'The rotational version of $$F = ma$$, with $$I$$ playing the role of mass.',
  },
  {
    key: 'torque-lever-arm', cat: 'rotation', tier: 1,
    ask: 'A force $$F$$ is applied at a point a distance $$r$$ from the pivot, at angle $$\\theta$$ to the line joining them. The torque is',
    name: 'torque from a force and a lever arm',
    tex: '\\tau = rF\\sin\\theta',
    wrong: ['\\tau = rF\\cos\\theta', '\\tau = rF\\tan\\theta', '\\tau = \\dfrac{rF}{\\sin\\theta}'],
    why: 'Only the perpendicular component of the force twists. A force aimed straight at the pivot ($$\\theta = 0$$) does nothing.',
    apply: (rng, h) => {
      const r = h.randChoice(rng, [2, 3, 4])
      const F = h.randChoice(rng, [10, 20, 50])
      const th = h.randChoice(rng, [30, 90, 150])
      const t = r * F * Math.sin((th * Math.PI) / 180)
      return {
        promptMd: `A force of ${F} N is applied ${r} m from a pivot, at ${th}° to the line from the pivot. What is the torque, in N·m?`,
        raw: t,
        explanationMd: `$$\\tau = rF\\sin\\theta = (${r})(${F})\\sin ${th}° = ${h.r2(t, 3)}$$ N·m.`,
      }
    },
  },
  {
    key: 'angular-momentum-rigid', cat: 'rotation', tier: 0,
    ask: 'A rigid body with moment of inertia $$I$$ spins at angular speed $$\\omega$$. Its angular momentum is',
    name: 'angular momentum of a spinning rigid body',
    tex: 'L = I\\omega',
    wrong: ['L = I\\alpha', 'L = \\tfrac12 I\\omega^2', 'L = \\dfrac{I}{\\omega}'],
    why: 'The rotational analog of $$p = mv$$. Conserved when there is no external torque, which is why the skater spins faster with arms in.',
  },
  {
    key: 'angular-momentum-point', cat: 'rotation', tier: 1,
    ask: 'A particle of mass $$m$$ moves at speed $$v$$ past a point, missing it by a perpendicular distance $$r_\\perp$$. Its angular momentum about that point is',
    name: 'angular momentum of a particle moving in a straight line',
    tex: 'L = m v r_\\perp',
    wrong: ['L = \\tfrac12 m v r_\\perp', 'L = m v^2 r_\\perp', 'L = m v r_\\perp^2'],
    why: 'A particle moving in a straight line still has angular momentum about a point it does not pass through, and that is usually how these problems start.',
  },
  {
    key: 'rotational-ke', cat: 'rotation', tier: 0,
    ask: 'A body with moment of inertia $$I$$ spins at angular speed $$\\omega$$. Its kinetic energy is',
    name: 'rotational kinetic energy',
    tex: 'K = \\tfrac12 I\\omega^2',
    wrong: ['K = I\\omega^2', 'K = \\tfrac12 I\\omega', 'K = \\tfrac12 I^2\\omega'],
    why: 'Same shape as $$\\tfrac12 mv^2$$ with $$I$$ for $$m$$ and $$\\omega$$ for $$v$$.',
  },
  {
    key: 'rolling-constraint', cat: 'rotation', tier: 0,
    ask: 'A wheel of radius $$R$$ rolls without slipping. Its center moves at speed',
    name: 'rolling-without-slipping constraint',
    tex: 'v = \\omega R',
    wrong: ['v = \\dfrac{\\omega}{R}', 'v = \\omega R^2', 'v = \\tfrac12 \\omega R'],
    why: 'This is the condition that ties the spin to the translation. Without it a rolling problem has one equation too few.',
  },
  {
    key: 'rolling-ke', cat: 'rotation', tier: 2,
    ask: 'An object of mass $$m$$ and moment of inertia $$I$$ rolls without slipping at speed $$v$$. Its total kinetic energy is',
    name: 'total kinetic energy of a rolling object',
    tex: 'K = \\tfrac12 mv^2\\left(1 + \\dfrac{I}{mR^2}\\right)',
    wrong: ['K = \\tfrac12 mv^2\\left(1 - \\dfrac{I}{mR^2}\\right)', 'K = \\tfrac12 mv^2 \\cdot \\dfrac{I}{mR^2}', 'K = mv^2\\left(1 + \\dfrac{I}{mR^2}\\right)'],
    why: 'Translation plus rotation, with $$\\omega = v/R$$ substituted in. The bracket is 1.5 for a disk and 1.4 for a solid sphere.',
    apply: (rng, h) => {
      const shapes = [
        { name: 'solid sphere', c: 2 / 5 },
        { name: 'solid disk', c: 1 / 2 },
        { name: 'hoop', c: 1 },
      ]
      const s = h.randChoice(rng, shapes)
      const m = h.randChoice(rng, [2, 4, 6])
      const v = h.randChoice(rng, [2, 3, 5])
      const K = 0.5 * m * v * v * (1 + s.c)
      return {
        promptMd: `A ${m} kg ${s.name} rolls without slipping at ${v} m/s. What is its total kinetic energy, in joules?`,
        raw: K,
        explanationMd: `For a ${s.name}, $$I/mR^2 = ${h.r2(s.c, 3)}$$, so $$K = \\tfrac12(${m})(${v})^2(1+${h.r2(s.c, 3)}) = ${h.r2(K, 3)}$$ J.`,
      }
    },
  },
  {
    key: 'parallel-axis', cat: 'rotation', tier: 1,
    ask: 'A body of mass $$M$$ has moment of inertia $$I_{\\text{cm}}$$ about an axis through its center of mass. About a parallel axis a distance $$d$$ away, its moment of inertia is',
    name: 'parallel-axis theorem',
    tex: 'I = I_{\\text{cm}} + Md^2',
    wrong: ['I = I_{\\text{cm}} - Md^2', 'I = I_{\\text{cm}} + Md', 'I = I_{\\text{cm}} + \\tfrac12 Md^2'],
    why: 'Only works from the center-of-mass axis, and only to a parallel one. It is also why the center-of-mass axis always gives the smallest $$I$$.',
    apply: (rng, h) => {
      const M = h.randChoice(rng, [3, 6, 12])
      const L = h.randChoice(rng, [2, 4, 6])
      const I = (M * L * L) / 12 + M * (L / 2) ** 2
      return {
        promptMd: `A uniform rod of mass ${M} kg and length ${L} m has $$I = \\tfrac1{12}ML^2$$ about its center. What is its moment of inertia about one end, in kg·m²?`,
        raw: I,
        explanationMd: `$$I = \\tfrac1{12}(${M})(${L})^2 + (${M})(${L / 2})^2 = ${h.r2(I, 3)}$$ kg·m² — which is $$\\tfrac13 ML^2$$, as expected.`,
      }
    },
  },
  {
    key: 'moi-rod-center', cat: 'rotation', tier: 0,
    ask: 'A uniform rod of mass $$M$$ and length $$L$$, rotating about a perpendicular axis through its center, has moment of inertia',
    name: 'moment of inertia of a rod about its center',
    tex: 'I = \\tfrac1{12} M L^2',
    wrong: ['I = \\tfrac13 M L^2', 'I = \\tfrac12 M L^2', 'I = \\tfrac1{12} M L'],
    why: 'The 12 in the denominator is the one to memorize; the end-axis version ($$\\tfrac13$$) follows from the parallel-axis theorem.',
  },
  {
    key: 'moi-rod-end', cat: 'rotation', tier: 1,
    ask: 'A uniform rod of mass $$M$$ and length $$L$$, rotating about a perpendicular axis through one end, has moment of inertia',
    name: 'moment of inertia of a rod about its end',
    tex: 'I = \\tfrac13 M L^2',
    wrong: ['I = \\tfrac1{12} M L^2', 'I = \\tfrac25 M L^2', 'I = \\tfrac12 M L^2'],
    why: '$$\\tfrac1{12}ML^2 + M(L/2)^2 = \\tfrac13 ML^2$$. Four times the center value, since the mass is further out.',
  },
  {
    key: 'moi-disk', cat: 'rotation', tier: 0,
    ask: 'A uniform solid disk (or cylinder) of mass $$M$$ and radius $$R$$, about its symmetry axis, has moment of inertia',
    name: 'moment of inertia of a solid disk or cylinder',
    tex: 'I = \\tfrac12 M R^2',
    wrong: ['I = M R^2', 'I = \\tfrac25 M R^2', 'I = \\tfrac23 M R^2'],
    why: 'Between a hoop (1) and a solid sphere ($$\\tfrac25$$), which is the sanity check if you blank on it.',
  },
  {
    key: 'moi-hoop', cat: 'rotation', tier: 0,
    ask: 'A thin hoop or ring of mass $$M$$ and radius $$R$$, about its symmetry axis, has moment of inertia',
    name: 'moment of inertia of a hoop',
    tex: 'I = M R^2',
    wrong: ['I = \\tfrac12 M R^2', 'I = \\tfrac23 M R^2', 'I = 2 M R^2'],
    why: 'All the mass is at radius $$R$$, so there is no fraction at all. It is the largest $$I$$ any shape of that radius can have.',
  },
  {
    key: 'moi-sphere', cat: 'rotation', tier: 0,
    ask: 'A uniform solid sphere of mass $$M$$ and radius $$R$$, about an axis through its center, has moment of inertia',
    name: 'moment of inertia of a solid sphere',
    tex: 'I = \\tfrac25 M R^2',
    wrong: ['I = \\tfrac23 M R^2', 'I = \\tfrac12 M R^2', 'I = \\tfrac35 M R^2'],
    why: 'Two fifths for solid, two thirds for hollow. Mixing those two up is the single most common rotation slip on this exam.',
  },
  {
    key: 'moi-shell', cat: 'rotation', tier: 1,
    ask: 'A thin spherical shell of mass $$M$$ and radius $$R$$, about an axis through its center, has moment of inertia',
    name: 'moment of inertia of a spherical shell',
    tex: 'I = \\tfrac23 M R^2',
    wrong: ['I = \\tfrac25 M R^2', 'I = \\tfrac12 M R^2', 'I = \\tfrac34 M R^2'],
    why: 'Bigger than the solid sphere\'s $$\\tfrac25$$, since the mass is all out at the surface.',
  },
  {
    key: 'tipping', cat: 'rotation', tier: 2,
    ask: 'A block is tilted further and further on one edge. At what point does it tip over?',
    name: 'tipping condition for a rigid body',
    concept: {
      correct: 'When its center of mass passes outside the pivot edge',
      wrong: [
        'When its center of mass rises above its starting height',
        'When the normal force exceeds its weight',
        'When the friction force reaches mu-N',
      ],
    },
    why: 'Up to that point gravity gives a restoring torque about the edge; past it, gravity torques it over.',
  },

  // ── Simple harmonic motion ────────────────────────────────────────────
  {
    key: 'shm-spring-omega', cat: 'shm', tier: 0,
    ask: 'A mass $$m$$ on a spring of constant $$k$$ oscillates with angular frequency',
    name: 'angular frequency of a mass on a spring',
    tex: '\\omega = \\sqrt{\\dfrac{k}{m}}',
    wrong: ['\\omega = \\sqrt{\\dfrac{m}{k}}', '\\omega = \\dfrac{k}{m}', '\\omega = \\sqrt{km}'],
    why: 'Stiffer spring, faster. Heavier mass, slower. That is enough to reconstruct which way up the fraction goes.',
    apply: (rng, h) => {
      const m = h.randChoice(rng, [2, 4, 5])
      const w = h.randChoice(rng, [2, 3, 5, 10])
      const k = m * w * w
      return {
        promptMd: `A ${m} kg mass on a spring with $$k = ${k}$$ N/m oscillates. What is $$\\omega$$, in rad/s?`,
        raw: w,
        explanationMd: `$$\\omega = \\sqrt{k/m} = \\sqrt{${k}/${m}} = \\sqrt{${k / m}} = ${w}$$ rad/s.`,
      }
    },
  },
  {
    key: 'shm-spring-period', cat: 'shm', tier: 0,
    ask: 'A mass $$m$$ on a spring of constant $$k$$ oscillates with period',
    name: 'period of a mass on a spring',
    tex: 'T = 2\\pi\\sqrt{\\dfrac{m}{k}}',
    wrong: ['T = 2\\pi\\sqrt{\\dfrac{k}{m}}', 'T = \\sqrt{\\dfrac{m}{k}}', 'T = \\dfrac{1}{2\\pi}\\sqrt{\\dfrac{m}{k}}'],
    why: '$$T = 2\\pi/\\omega$$, so the fraction flips relative to the $$\\omega$$ formula. A heavier mass takes longer.',
  },
  {
    key: 'shm-pendulum', cat: 'shm', tier: 0,
    ask: 'A simple pendulum of length $$L$$ swings through small angles with angular frequency',
    name: 'angular frequency of a simple pendulum',
    tex: '\\omega = \\sqrt{\\dfrac{g}{L}}',
    wrong: ['\\omega = \\sqrt{\\dfrac{L}{g}}', '\\omega = \\sqrt{gL}', '\\omega = \\dfrac{g}{L}'],
    why: 'The mass does not appear. Only small angles, where $$\\sin\\theta \\approx \\theta$$.',
    apply: (rng, h) => {
      const w = h.randChoice(rng, [1, 2, 5])
      const L = 10 / (w * w)
      return {
        promptMd: `A simple pendulum has length ${h.r2(L, 3)} m. What is its angular frequency, in rad/s? (Take $$g = 10$$ m/s².)`,
        raw: w,
        explanationMd: `$$\\omega = \\sqrt{g/L} = \\sqrt{10/${h.r2(L, 3)}} = ${w}$$ rad/s.`,
      }
    },
  },
  {
    key: 'shm-physical-pendulum', cat: 'shm', tier: 2,
    ask: 'A rigid body of mass $$m$$ swings about a pivot a distance $$d$$ from its center of mass, with moment of inertia $$I$$ about the pivot. Its angular frequency is',
    name: 'angular frequency of a physical pendulum',
    tex: '\\omega = \\sqrt{\\dfrac{mgd}{I}}',
    wrong: ['\\omega = \\sqrt{\\dfrac{I}{mgd}}', '\\omega = \\sqrt{\\dfrac{mgd}{I^2}}', '\\omega = \\dfrac{mgd}{I}'],
    why: 'Restoring torque over inertia, the rotational version of $$\\sqrt{k/m}$$. With a point mass on a string, $$I = mL^2$$ and $$d = L$$ give back $$\\sqrt{g/L}$$.',
    apply: (rng, h) => {
      const L = h.randChoice(rng, [1.5, 3, 6])
      const w = Math.sqrt((3 * 10) / (2 * L))
      return {
        promptMd: `A uniform rod of length ${L} m swings from one end ($$I = \\tfrac13 mL^2$$, $$d = L/2$$). What is its angular frequency, in rad/s? (Take $$g = 10$$ m/s².)`,
        raw: w,
        explanationMd: `$$\\omega = \\sqrt{\\dfrac{mg(L/2)}{\\tfrac13 mL^2}} = \\sqrt{\\dfrac{3g}{2L}} = \\sqrt{\\dfrac{30}{${2 * L}}} \\approx ${h.r2(w, 3)}$$ rad/s.`,
      }
    },
  },
  {
    key: 'shm-vmax', cat: 'shm', tier: 1,
    ask: 'An oscillator of amplitude $$A$$ and angular frequency $$\\omega$$ has maximum speed',
    name: 'maximum speed of an oscillator',
    tex: 'v_{\\max} = \\omega A',
    wrong: ['v_{\\max} = \\omega^2 A', 'v_{\\max} = \\dfrac{\\omega}{A}', 'v_{\\max} = \\tfrac12 \\omega A'],
    why: 'Differentiate $$A\\cos\\omega t$$ once. It happens at the equilibrium point, where all the energy is kinetic.',
    apply: (rng, h) => {
      const w = h.randChoice(rng, [2, 4, 5, 10])
      const A = h.randChoice(rng, [0.1, 0.2, 0.5, 3])
      return {
        promptMd: `An oscillator has amplitude ${A} m and $$\\omega = ${w}$$ rad/s. What is its maximum speed, in m/s?`,
        raw: w * A,
        explanationMd: `$$v_{\\max} = \\omega A = (${w})(${A}) = ${h.r2(w * A, 3)}$$ m/s.`,
      }
    },
  },
  {
    key: 'shm-amax', cat: 'shm', tier: 2,
    ask: 'An oscillator of amplitude $$A$$ and angular frequency $$\\omega$$ has maximum acceleration',
    name: 'maximum acceleration of an oscillator',
    tex: 'a_{\\max} = \\omega^2 A',
    wrong: ['a_{\\max} = \\omega A', 'a_{\\max} = \\omega A^2', 'a_{\\max} = \\dfrac{\\omega^2}{A}'],
    why: 'Differentiate twice. It happens at the turning points, where the displacement is largest.',
    apply: (rng, h) => {
      const w = h.randChoice(rng, [2, 3, 5, 10])
      const A = h.randChoice(rng, [0.1, 0.2, 0.5, 2])
      return {
        promptMd: `An oscillator has amplitude ${A} m and $$\\omega = ${w}$$ rad/s. What is its maximum acceleration, in m/s²?`,
        raw: w * w * A,
        explanationMd: `$$a_{\\max} = \\omega^2 A = (${w})^2(${A}) = ${h.r2(w * w * A, 3)}$$ m/s².`,
      }
    },
  },

  // ── Gravity and orbits ────────────────────────────────────────────────
  {
    key: 'grav-pe', cat: 'gravity', tier: 0,
    ask: 'Two masses $$M$$ and $$m$$ are a distance $$r$$ apart. Their gravitational potential energy (taken as zero at infinity) is',
    name: 'gravitational potential energy of two masses',
    tex: 'U = -\\dfrac{GMm}{r}',
    wrong: ['U = +\\dfrac{GMm}{r}', 'U = -\\dfrac{GMm}{r^2}', 'U = -\\tfrac12\\dfrac{GMm}{r}'],
    why: 'One power of $$r$$, not two, and negative because gravity is attractive and $$U \\to 0$$ at infinity.',
  },
  {
    key: 'orbit-speed', cat: 'gravity', tier: 0,
    ask: 'A satellite is in a circular orbit of radius $$r$$ around a mass $$M$$. Its speed is',
    name: 'speed in a circular orbit',
    tex: 'v = \\sqrt{\\dfrac{GM}{r}}',
    wrong: ['v = \\sqrt{\\dfrac{2GM}{r}}', 'v = \\sqrt{\\dfrac{GM}{r^2}}', 'v = \\dfrac{GM}{r}'],
    why: 'Set $$GMm/r^2 = mv^2/r$$. Farther out means slower, which surprises people.',
  },
  {
    key: 'orbit-period', cat: 'gravity', tier: 1,
    ask: 'A satellite orbits a mass $$M$$ in a circle of radius $$r$$. Its period satisfies',
    name: 'period of a circular orbit',
    tex: 'T^2 = \\dfrac{4\\pi^2 r^3}{GM}',
    wrong: ['T^2 = \\dfrac{4\\pi^2 r^2}{GM}', 'T^2 = \\dfrac{4\\pi^2 r^3}{(GM)^2}', 'T = \\dfrac{2\\pi r^3}{GM}'],
    why: 'Kepler\'s third law with the constant filled in. The orbiting mass does not appear.',
  },
  {
    key: 'kepler-third', cat: 'gravity', tier: 1,
    ask: 'For any two objects orbiting the same central mass, their periods and semi-major axes satisfy',
    name: "Kepler's third law",
    tex: 'T^2 \\propto a^3',
    wrong: ['T \\propto a^3', 'T^3 \\propto a^2', 'T^2 \\propto a^2'],
    why: 'Works for ellipses too, with $$a$$ the semi-major axis. Handy as a ratio: quadruple the radius and the period goes up by 8.',
    apply: (rng, h) => {
      const f = h.randChoice(rng, [4, 9, 16, 25])
      return {
        promptMd: `A satellite is moved to a new circular orbit with ${f} times its old radius. By what factor does its orbital period increase?`,
        raw: f ** 1.5,
        explanationMd: `$$T \\propto r^{3/2}$$, so the period grows by $$${f}^{3/2} = ${h.r2(f ** 1.5, 3)}$$.`,
      }
    },
  },
  {
    key: 'kepler-second', cat: 'gravity', tier: 1,
    ask: "What does Kepler's second law say about a planet in an elliptical orbit?",
    name: "Kepler's second law",
    concept: {
      correct: 'It sweeps out equal areas in equal times — which is just conservation of angular momentum',
      wrong: [
        'It moves at constant speed around the ellipse',
        'It sweeps out equal angles in equal times',
        'Its kinetic energy stays constant',
      ],
    },
    why: 'Gravity pulls straight at the Sun, so it exerts no torque about the Sun and $$L$$ is conserved. That is why the planet speeds up near perihelion.',
  },
  {
    key: 'vis-viva', cat: 'gravity', tier: 2,
    ask: 'An object is a distance $$r$$ from mass $$M$$, on an orbit of semi-major axis $$a$$. Its speed satisfies',
    name: 'vis-viva equation',
    tex: 'v^2 = GM\\left(\\dfrac{2}{r} - \\dfrac{1}{a}\\right)',
    wrong: ['v^2 = GM\\left(\\dfrac{1}{r} - \\dfrac{2}{a}\\right)', 'v^2 = GM\\left(\\dfrac{2}{r} + \\dfrac{1}{a}\\right)', 'v^2 = GM\\left(\\dfrac{2}{a} - \\dfrac{1}{r}\\right)'],
    why: 'Covers every orbit at once. Put $$r = a$$ to get the circular-orbit speed, or $$a \\to \\infty$$ to get escape speed.',
  },
  {
    key: 'escape-speed', cat: 'gravity', tier: 1,
    ask: 'The speed needed to escape from the surface of a body of mass $$M$$ and radius $$R$$ is',
    name: 'escape speed',
    tex: 'v = \\sqrt{\\dfrac{2GM}{R}}',
    wrong: ['v = \\sqrt{\\dfrac{GM}{R}}', 'v = \\sqrt{\\dfrac{2GM}{R^2}}', 'v = 2\\sqrt{\\dfrac{GM}{R}}'],
    why: 'Set $$\\tfrac12 mv^2 = GMm/R$$. It is exactly $$\\sqrt2$$ times the circular-orbit speed at the same radius.',
    apply: (rng, h) => {
      const v = h.randChoice(rng, [4, 6, 8, 10])
      return {
        promptMd: `A satellite circles a planet just above its surface at ${v} km/s. What is the escape speed from that surface, in km/s?`,
        raw: v * Math.SQRT2,
        explanationMd: `Escape speed is $$\\sqrt2$$ times the circular-orbit speed: $$${v}\\sqrt2 \\approx ${h.r2(v * Math.SQRT2, 3)}$$ km/s.`,
      }
    },
  },
  {
    key: 'orbit-energy', cat: 'gravity', tier: 2,
    ask: 'A satellite of mass $$m$$ is in a circular orbit of radius $$r$$ around a mass $$M$$. Its total energy is',
    name: 'total energy of a circular orbit',
    tex: 'E = -\\dfrac{GMm}{2r}',
    wrong: ['E = -\\dfrac{GMm}{r}', 'E = +\\dfrac{GMm}{2r}', 'E = -\\dfrac{GMm}{4r}'],
    why: 'The kinetic energy is exactly half the magnitude of the potential energy, so $$E = \\tfrac12 U = -K$$. Raising an orbit takes energy even though the satellite ends up slower.',
  },
  {
    key: 'shell-theorem', cat: 'gravity', tier: 2,
    ask: 'What is the gravitational field inside a hollow uniform spherical shell?',
    name: 'shell theorem',
    concept: {
      correct: 'Zero everywhere inside, no matter where you stand',
      wrong: [
        'Zero only at the exact center',
        'It points toward the nearest wall',
        'The same as if all the mass were at the center',
      ],
    },
    why: 'The nearer patch of shell is smaller but closer, and the two effects cancel exactly. From outside, the same shell acts like a point mass at its center.',
  },
  {
    key: 'inside-uniform-sphere', cat: 'gravity', tier: 2,
    ask: 'At a distance $$r$$ from the center of a uniform solid sphere of mass $$M$$ and radius $$R$$ (with $$r < R$$), the gravitational field is',
    name: 'gravitational field inside a uniform solid sphere',
    tex: 'g = \\dfrac{GMr}{R^3}',
    wrong: ['g = \\dfrac{GM}{r^2}', 'g = \\dfrac{GMR}{r^3}', 'g = \\dfrac{GMr^2}{R^3}'],
    why: 'Only the mass inside radius $$r$$ counts, and that grows as $$r^3$$. The field is proportional to $$r$$, so a ball dropped down a tunnel through the planet does simple harmonic motion.',
  },

  // ── Fluids ────────────────────────────────────────────────────────────
  {
    key: 'hydrostatic-pressure', cat: 'fluids', tier: 0,
    ask: 'At a depth $$h$$ below the surface of a fluid of density $$\\rho$$, the pressure is',
    name: 'pressure at depth in a fluid',
    tex: 'P = P_0 + \\rho g h',
    wrong: ['P = P_0 + \\dfrac{\\rho g}{h}', 'P = P_0 + \\rho h g^2', 'P = \\rho g h - P_0'],
    why: 'It depends only on depth, not on the shape or width of the container.',
    apply: (rng, h) => {
      const d = h.randChoice(rng, [2, 3, 5, 10])
      return {
        promptMd: `How much does the pressure increase ${d} m below the surface of water ($$\\rho = 1000$$ kg/m³), in pascals? (Take $$g = 10$$ m/s².)`,
        raw: 1000 * 10 * d,
        explanationMd: `$$\\Delta P = \\rho g h = (1000)(10)(${d}) = ${1000 * 10 * d}$$ Pa.`,
      }
    },
  },
  {
    key: 'buoyancy', cat: 'fluids', tier: 0,
    ask: 'An object displaces a volume $$V$$ of fluid of density $$\\rho_f$$. The buoyant force on it is',
    name: "buoyant force (Archimedes' principle)",
    tex: 'F_B = \\rho_f V g',
    wrong: ['F_B = \\rho_{\\text{obj}} V g', 'F_B = \\rho_f V g^2', 'F_B = \\dfrac{\\rho_f V}{g}'],
    why: 'The weight of the *displaced fluid*, so it is the fluid\'s density that matters, not the object\'s.',
    apply: (rng, h) => {
      const V = h.randChoice(rng, [0.002, 0.005, 0.01, 0.02])
      return {
        promptMd: `An object displaces ${V} m³ of water ($$\\rho = 1000$$ kg/m³). What is the buoyant force on it, in newtons? (Take $$g = 10$$ m/s².)`,
        raw: 1000 * V * 10,
        explanationMd: `$$F_B = \\rho_f V g = (1000)(${V})(10) = ${h.r2(1000 * V * 10, 3)}$$ N.`,
      }
    },
  },
  {
    key: 'floating-fraction', cat: 'fluids', tier: 1,
    ask: 'An object floats in a fluid. The fraction of its volume that is submerged is',
    name: 'submerged fraction of a floating object',
    tex: '\\dfrac{\\rho_{\\text{obj}}}{\\rho_f}',
    wrong: ['\\dfrac{\\rho_f}{\\rho_{\\text{obj}}}', '1 - \\dfrac{\\rho_{\\text{obj}}}{\\rho_f}', '\\dfrac{\\rho_{\\text{obj}}}{\\rho_f + \\rho_{\\text{obj}}}'],
    why: 'Floating means buoyancy equals weight, so $$\\rho_f V_{\\text{sub}} = \\rho_{\\text{obj}} V$$. Ice at 917 kg/m³ in water sits 92% under.',
    apply: (rng, h) => {
      const ro = h.randChoice(rng, [400, 600, 750, 900])
      return {
        promptMd: `A block of density ${ro} kg/m³ floats in water ($$\\rho = 1000$$ kg/m³). What fraction of its volume is below the surface?`,
        raw: ro / 1000,
        explanationMd: `Submerged fraction $$= \\rho_{\\text{obj}}/\\rho_f = ${ro}/1000 = ${ro / 1000}$$.`,
      }
    },
  },
  {
    key: 'continuity', cat: 'fluids', tier: 0,
    ask: 'An incompressible fluid flows through a pipe that changes cross-sectional area. At any two points,',
    name: 'continuity equation for fluid flow',
    tex: 'A_1 v_1 = A_2 v_2',
    wrong: ['\\dfrac{A_1}{v_1} = \\dfrac{A_2}{v_2}', 'A_1 v_1^2 = A_2 v_2^2', 'A_1 + v_1 = A_2 + v_2'],
    why: 'Volume per second is the same everywhere, so a narrower pipe means faster flow.',
    apply: (rng, h) => {
      const f = h.randChoice(rng, [2, 3, 4])
      return {
        promptMd: `A pipe narrows so that its radius is cut to $$1/${f}$$ of its original value. By what factor does the flow speed increase?`,
        raw: f * f,
        explanationMd: `Area goes as $$r^2$$, so the area drops by $$${f}^2 = ${f * f}$$ and the speed rises by the same factor, $$${f * f}$$.`,
      }
    },
  },
  {
    key: 'bernoulli', cat: 'fluids', tier: 1,
    ask: 'Along a streamline in steady, incompressible, non-viscous flow, the conserved combination is',
    name: "Bernoulli's equation",
    tex: 'P + \\tfrac12\\rho v^2 + \\rho g y = \\text{const}',
    wrong: ['P + \\rho v^2 + \\rho g y = \\text{const}', 'P + \\tfrac12\\rho v + \\rho g y = \\text{const}', 'P + \\tfrac12\\rho v^2 + \\rho g y^2 = \\text{const}'],
    why: 'Energy per unit volume. Faster flow means lower pressure, which is why it explains lift and the shower curtain.',
  },
  {
    key: 'torricelli', cat: 'fluids', tier: 1,
    ask: 'Water drains from a small hole a depth $$h$$ below the surface of an open tank. The exit speed is',
    name: "Torricelli's law for a draining tank",
    tex: 'v = \\sqrt{2gh}',
    wrong: ['v = \\sqrt{gh}', 'v = \\sqrt{\\dfrac{2P}{\\rho}}', 'v = 2gh'],
    why: 'Bernoulli from surface to hole gives exactly the free-fall answer: the water comes out as fast as if it had been dropped from the surface.',
  },
  {
    key: 'drag', cat: 'fluids', tier: 1,
    ask: 'The drag force on an object of cross-sectional area $$A$$ moving fast through a fluid of density $$\\rho$$ is',
    name: 'quadratic drag force',
    tex: 'F = \\tfrac12 \\rho C_d A v^2',
    wrong: ['F = \\tfrac12 \\rho C_d A v', 'F = \\rho C_d A v^2', 'F = \\tfrac12 \\rho C_d A^2 v^2'],
    why: 'Goes as $$v^2$$, so doubling the speed quadruples the drag. Slow, small, or viscous cases instead give drag proportional to $$v$$.',
    apply: (rng, h) => {
      const f = h.randChoice(rng, [2, 3, 4, 5])
      return {
        promptMd: `A car's speed is multiplied by ${f}. By what factor does the air drag on it increase?`,
        raw: f * f,
        explanationMd: `$$F \\propto v^2$$, so the drag goes up by $$${f}^2 = ${f * f}$$.`,
      }
    },
  },

  // ── Approximations and scaling ────────────────────────────────────────
  {
    key: 'small-angle', cat: 'math', tier: 0,
    ask: 'For a small angle $$\\theta$$ in radians,',
    name: 'small-angle approximations',
    tex: '\\sin\\theta \\approx \\theta,\\quad \\cos\\theta \\approx 1 - \\tfrac12\\theta^2',
    wrong: [
      '\\sin\\theta \\approx 1 - \\tfrac12\\theta^2,\\quad \\cos\\theta \\approx \\theta',
      '\\sin\\theta \\approx \\theta,\\quad \\cos\\theta \\approx 1 - \\theta',
      '\\sin\\theta \\approx \\tfrac12\\theta^2,\\quad \\cos\\theta \\approx 1',
    ],
    why: 'Cosine needs the second-order term: to first order it is just 1, which throws away the whole effect in a pendulum energy problem.',
  },
  {
    key: 'binomial', cat: 'math', tier: 0,
    ask: 'For small $$x$$ and any exponent $$n$$ (positive, negative, or fractional),',
    name: 'binomial approximation',
    tex: '(1+x)^n \\approx 1 + nx',
    wrong: ['(1+x)^n \\approx 1 + x^n', '(1+x)^n \\approx n + nx', '(1+x)^n \\approx 1 + \\dfrac{x}{n}'],
    why: 'The workhorse approximation on this exam. It covers $$\\sqrt{1+x}$$, $$1/(1+x)$$, and the relativistic $$\\gamma$$ all at once.',
  },
  {
    key: 'geometric-series', cat: 'math', tier: 2,
    ask: 'For $$|r| < 1$$, the infinite sum $$a + ar + ar^2 + \\cdots$$ equals',
    name: 'sum of an infinite geometric series',
    tex: '\\dfrac{a}{1-r}',
    wrong: ['\\dfrac{a}{1+r}', '\\dfrac{ar}{1-r}', '\\dfrac{1}{1-ar}'],
    why: 'Shows up whenever something repeats with a constant ratio — a ball bouncing to a fixed fraction of its height, or an infinite chain of collisions.',
    apply: (rng, h) => {
      const hgt = h.randChoice(rng, [1, 2, 5, 10])
      const f = h.randChoice(rng, [0.25, 0.5, 0.75])
      const total = (hgt * (1 + f)) / (1 - f)
      return {
        promptMd: `A ball is dropped from ${hgt} m and each bounce returns it to a fraction ${f} of its previous height. What total distance does it travel before coming to rest, in meters?`,
        raw: total,
        explanationMd: `The first drop is $$${hgt}$$, then each later height is counted twice: $$${hgt} + 2(${hgt})\\dfrac{${f}}{1-${f}} = ${hgt}\\dfrac{1+${f}}{1-${f}} = ${h.r2(total, 3)}$$ m.`,
      }
    },
  },
  {
    key: 'scaling', cat: 'math', tier: 2,
    ask: 'A quantity depends on a length as $$Q \\propto L^n$$. If the length is multiplied by $$c$$, then $$Q$$ is multiplied by',
    name: 'scaling a power-law relationship',
    tex: 'c^n',
    wrong: ['n^c', 'cn', 'c^{1/n}'],
    why: 'Turning a formula into a ratio kills every constant, so $$G$$, $$\\pi$$ and the masses never have to be looked up. Most "by what factor" questions are one line this way.',
    apply: (rng, h) => {
      const c = h.randChoice(rng, [4, 9, 16, 25])
      return {
        promptMd: `A pendulum's length is multiplied by ${c}. By what factor does its period change?`,
        raw: Math.sqrt(c),
        explanationMd: `$$T \\propto \\sqrt{L}$$, so the period changes by $$\\sqrt{${c}} = ${h.r2(Math.sqrt(c), 3)}$$.`,
      }
    },
  },
]
