// Digitized 2022 F=ma Exam A questions. Sources:
// Exam: work/fma/fma-2022-a.pdf (text extracted to work/fma/fma-2022-a.txt)
// Solutions: work/fma/fma-2022-a-sol.pdf (text extracted to work/fma/fma-2022-a-sol.txt)
//   — full worked solutions as prose; no AAPT solutions manual for 2022.
//
// Correct answer convention: in the solutions PDF the correct option's letter
// is NOT wrapped in parentheses; all wrong options are listed as "(A)", "(B)",
// etc. That is the signal used here.
//
// Answer key: B D C B D D E E A A D D C C B D B B A B E E C B A
// (questions 1–25)
//
// All 25 answers confirmed by cross-checking boxed letter against solution prose.
// No dual-credit or ambiguous questions were found.
//
// Figures: work/figure_manifest.json, key "fma-2022-a".
// Stem figures on Q4, Q7, Q8, Q10, Q13, Q14, Q15, Q16, Q17, Q19, Q22.
// Q21 has per-choice diagram options (choiceFigures).
// Q4, Q11, Q25 have diagram-style option choices described in text.

const F22 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-a/fma-2022-a-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2022-a'
export const questions = [
  {
    n: 1, correct: 'B',
    statement: `A projectile is thrown upward with speed $$v$$. By the time its speed has decreased to $$v/2$$, it has risen a height $$h$$. Neglecting air resistance, what is the maximum height reached by the projectile?`,
    choices: {
      A: '$$\\dfrac{5h}{4}$$',
      B: '$$\\dfrac{4h}{3}$$',
      C: '$$\\dfrac{3h}{2}$$',
      D: '$$2h$$',
      E: '$$3h$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'energy conservation'],
    solution: `Use the kinematic relation $$v_f^2 = v_i^2 - 2g\\Delta y$$.

The maximum height (where the speed is zero) is $$H_{\\max} = \\dfrac{v^2}{2g}$$.

The height reached when the speed falls to $$v/2$$ is found from $$\\left(\\dfrac{v}{2}\\right)^2 = v^2 - 2gh$$, giving $$h = \\dfrac{v^2 - v^2/4}{2g} = \\dfrac{3v^2}{8g}$$.

Therefore $$H_{\\max} = \\dfrac{v^2}{2g} = \\dfrac{4}{3} \\cdot \\dfrac{3v^2}{8g} = \\dfrac{4h}{3}$$.

The answer is B.`,
  },
  {
    n: 2, correct: 'D',
    statement: `A car is moving at 60 miles per hour (mph), when the driver notices an obstacle ahead. Hitting the brakes, the driver decelerates at a constant rate, and manages to come to a stop just barely before hitting the obstacle. If the car had instead been moving at 70 mph, and started decelerating at the same place and at the same rate, with what speed would it have hit the obstacle?`,
    choices: {
      A: '10 mph',
      B: '14 mph',
      C: '28 mph',
      D: '36 mph',
      E: 'There is not enough information to decide.',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics'],
    solution: `For an object decelerating at constant rate $$a$$ over a distance $$d$$, the initial and final speeds satisfy $$v_f^2 = v_i^2 - 2ad$$.

In the 60 mph case the car just stops, so $$v_1^2 = 2ad$$ where $$v_1 = 60$$ mph.

In the 70 mph case, with the same $$a$$ and $$d$$:
$$v_f^2 = v_2^2 - 2ad = v_2^2 - v_1^2 = 70^2 - 60^2 = 4900 - 3600 = 1300.$$

Therefore $$v_f = \\sqrt{1300} \\approx 36$$ mph.

The answer is D.`,
  },
  {
    n: 3, correct: 'C',
    statement: `Two blocks of mass $$m$$ have an inelastic one-dimensional collision. Initially, the first block is moving with speed 5 m/s, and the second is at rest. After the collision, the first block is moving with speed 2 m/s. What percentage of the system's original kinetic energy was lost during the collision?`,
    choices: {
      A: '16%',
      B: '42%',
      C: '48%',
      D: '52%',
      E: '84%',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'energy conservation', 'momentum conservation'],
    solution: `By momentum conservation, the total momentum before is $$m \\cdot 5 = 5m$$. After the collision the first block moves at 2 m/s, so the second block's speed satisfies $$m \\cdot 2 + m \\cdot v_2 = 5m$$, giving $$v_2 = 3$$ m/s. (If the first block reversed direction it would give $$v_2 = 7$$ m/s, which increases kinetic energy — impossible for an inelastic collision.)

The fraction of kinetic energy lost is:
$$\\frac{KE_i - KE_f}{KE_i} = \\frac{5^2 - 2^2 - 3^2}{5^2} = \\frac{25 - 4 - 9}{25} = \\frac{12}{25} = 48\\%.$$

The answer is C.`,
  },
  {
    n: 4, correct: 'B',
    statement: `A mass on an ideal pendulum is released from rest at point I. It swings over to point II, at which point the string suddenly breaks. Which of the following shows the trajectory of the mass?`,
    choices: {
      A: 'Trajectory curving to the right and upward (parabolic arc upward).',
      B: 'Trajectory falling straight down.',
      C: 'Trajectory curving to the right and downward.',
      D: 'Trajectory moving to the left and downward.',
      E: 'Trajectory moving upward then curving down to the right.',
    },
    figures: [F22(4)], topics: ['Mechanics'], tags: ['energy conservation', 'projectile motion', 'pendulum'],
    solution: `Point II is the highest point on the far side of the pendulum's swing. By energy conservation, the pendulum started from rest at point I, so it momentarily comes to rest at the symmetric point II (equal height). At the moment the string breaks the mass has zero velocity.

With zero initial velocity, the mass simply falls straight down under gravity. The answer is B.`,
  },
  {
    n: 5, correct: 'C',
    statement: `A uniform solid ball with mass $$m = 1$$ kg and radius $$R = 10$$ cm rolls without slipping on a horizontal plane, so that its center of mass has velocity $$v = 1$$ m/s. What is the ball's total kinetic energy?`,
    choices: {
      A: '0.2 J',
      B: '0.5 J',
      C: '0.7 J',
      D: '1 J',
      E: '1.4 J',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'rotational dynamics', 'energy conservation'],
    solution: `The total kinetic energy is the sum of translational and rotational kinetic energy.

The translational kinetic energy is $$\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}(1)(1)^2 = 0.5$$ J.

The moment of inertia of a uniform solid ball is $$I = \\tfrac{2}{5}mR^2$$. For rolling without slipping, $$\\omega = v/R$$, so the rotational kinetic energy is:
$$\\tfrac{1}{2}I\\omega^2 = \\tfrac{1}{2} \\cdot \\tfrac{2}{5}mR^2 \\cdot \\dfrac{v^2}{R^2} = \\tfrac{1}{5}mv^2 = \\tfrac{1}{5}(1)(1)^2 = 0.2 \\text{ J}.$$

Total kinetic energy $$= 0.5 + 0.2 = 0.7$$ J.

The answer is C.`,
  },
  {
    n: 6, correct: 'D',
    statement: `A bob of mass $$m$$ hangs from a rigid, massless rod, forming an ideal pendulum. The rod is held horizontally and released from rest. What is its maximum tension during its swing?`,
    choices: {
      A: '$$mg$$',
      B: '$$\\dfrac{3}{2}mg$$',
      C: '$$2mg$$',
      D: '$$3mg$$',
      E: '$$4mg$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'circular motion', 'tension', 'pendulum'],
    solution: `The maximum tension occurs at the bottom of the swing where the speed is greatest.

By energy conservation (taking the bottom as the reference level), with the rod of length $$\\ell$$ starting horizontally:
$$\\tfrac{1}{2}mv^2 = mg\\ell \\implies v^2 = 2g\\ell.$$

At the bottom, the net upward force provides centripetal acceleration:
$$T - mg = \\dfrac{mv^2}{\\ell} = \\dfrac{m \\cdot 2g\\ell}{\\ell} = 2mg.$$

Therefore $$T = mg + 2mg = 3mg$$.

The answer is D.`,
  },
  {
    n: 7, correct: 'E',
    statement: `The following graph shows the results of measurements of two physical quantities, $$y$$ and $$x$$. What best describes the functional dependence of $$y$$ on $$x$$? Below, $$A$$ and $$B$$ are positive constants.

(The horizontal axis is a linear scale from 0 to ~50; the vertical axis is a logarithmic scale from 1 to 100. The data fall on a straight line with $$y$$ decreasing as $$x$$ increases.)`,
    choices: {
      A: '$$y = Ax + B$$',
      B: '$$y = -Ax + B$$',
      C: '$$y = A/x^B$$',
      D: '$$y = Ae^{Bx}$$',
      E: '$$y = Ae^{-Bx}$$',
    },
    figures: [F22(7)], topics: ['Mechanics'], tags: ['graph interpretation', 'data analysis'],
    solution: `The graph is a semi-log plot: $$x$$ on a linear horizontal axis (0 to ~50) and $$y$$ on a logarithmic vertical axis (1 to 100). A straight line on this type of plot means $$\\log y$$ is linear in $$x$$, i.e., $$y$$ is an exponential function of $$x$$. Since $$y$$ decreases as $$x$$ increases, the exponential must be decaying: $$y = Ae^{-Bx}$$.

The answer is E.`,
  },
  {
    n: 8, correct: 'E',
    statement: `A block of mass $$m$$ is placed on a wedge of mass $$m$$, inclined at an angle $$\\theta$$ to the horizontal. The coefficients of friction between the block and wedge, and the wedge and ground, are high enough for both the block and the wedge to remain static. What is the magnitude of the friction force of the ground on the wedge?`,
    choices: {
      A: '$$mg\\sin\\theta$$',
      B: '$$mg\\cos\\theta$$',
      C: '$$mg\\sin\\theta\\cos\\theta$$',
      D: '$$mg\\tan\\theta$$',
      E: '$$0$$',
    },
    figures: [F22(8)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'friction', 'free-body diagrams', 'newton\'s laws'],
    solution: `Consider the entire system (block + wedge) as a unit. The external forces are: gravity on the block ($$mg$$ down), gravity on the wedge ($$mg$$ down), the normal force from the ground ($$2mg$$ up), and the friction force from the ground.

Since the system is in static equilibrium with no horizontal external forces other than ground friction, and gravity has no horizontal component, the friction force from the ground must be zero.

Alternatively: gravity acts downward on the block, so the wedge must exert an upward force of $$mg$$ on the block (net vertical equilibrium). By Newton's third law, the block exerts $$mg$$ downward on the wedge. Combined with the wedge's own weight $$mg$$ downward, the ground exerts $$2mg$$ upward as the normal force. Neither gravity nor the block's contact force on the wedge has a horizontal component, so no friction is needed from the ground.

The answer is E.`,
  },
  {
    n: 9, correct: 'A',
    statement: `A person is holding a massless rope, on which hangs a mass $$m$$, as shown at left. To pull the end of the rope with constant upward velocity $$v$$, the person must exert a force $$F_v$$. To pull the end of the rope with constant upward acceleration $$a$$, the person must exert a force $$F_a$$.

Now the rope is wrapped around a fixed, massless pulley, and the mass is doubled to $$2m$$, as shown at right.

Compared to the original setup, how do the forces $$F_v$$ and $$F_a$$ needed to pull the end of the rope with a given upward velocity and acceleration change? In both cases, ignore friction and air resistance.`,
    choices: {
      A: '$$F_v$$ stays the same, and $$F_a$$ decreases.',
      B: 'Both $$F_v$$ and $$F_a$$ stay the same.',
      C: '$$F_v$$ stays the same, and $$F_a$$ increases.',
      D: '$$F_v$$ increases, and $$F_a$$ stays the same.',
      E: 'Both $$F_v$$ and $$F_a$$ increase.',
    },
    figures: [], topics: ['Mechanics'], tags: ['newton\'s laws', 'tension', 'constraint kinematics'],
    solution: `__Constant velocity ($$F_v$$):__ In the original setup (no pulley), force balance on mass $$m$$ gives $$F_v = mg$$. With the pulley and mass $$2m$$, the rope now has two segments supporting the mass, so $$2F_v = 2mg$$, giving $$F_v = mg$$. It stays the same.

__Constant acceleration ($$F_a$$):__ In the original setup, the rope pulls the mass directly, so $$F_a - mg = ma$$, giving $$F_a = m(g+a)$$.

With the pulley, when the person pulls the rope with acceleration $$a$$, the mass only rises with acceleration $$a/2$$ (the constraint from the pulley halves the acceleration of the mass). Newton's second law on the mass $$2m$$: $$2F_a - 2mg = 2m(a/2) = ma$$, so $$2F_a = 2mg + ma$$, giving $$F_a = m(g + a/2)$$.

Since $$m(g + a/2) < m(g + a)$$, $$F_a$$ decreases.

The answer is A.`,
  },
  {
    n: 10, correct: 'A',
    statement: `The two ends of a uniform rod of length $$2L$$ are hung on massless strings of length $$L$$. If the strings are attached to the ceiling, and the rod is pulled a small distance horizontally and released as shown, what is the period of oscillation?`,
    choices: {
      A: '$$2\\pi\\sqrt{\\dfrac{L}{g}}$$',
      B: '$$2\\pi\\sqrt{\\dfrac{7L}{6g}}$$',
      C: '$$2\\pi\\sqrt{\\dfrac{4L}{3g}}$$',
      D: '$$2\\pi\\sqrt{\\dfrac{2L}{g}}$$',
      E: '$$2\\pi\\sqrt{\\dfrac{7L}{3g}}$$',
    },
    figures: [F22(10)], topics: ['Mechanics'], tags: ['pendulum', 'oscillations'],
    solution: `This is a bifilar (two-string) suspension. When the rod is displaced horizontally, both strings make the same small angle with the vertical. The sum of the tension forces acts like the tension in an ordinary pendulum of length $$L$$ — both strings are length $$L$$ and both pull at the same angle, so their net restoring force is exactly that of a simple pendulum of length $$L$$.

Crucially, because the two attachment points move in phase and the rod translates without rotating, the moment of inertia of the rod is irrelevant. The equation of motion is that of a simple pendulum of length $$L$$:
$$T = 2\\pi\\sqrt{\\dfrac{L}{g}}.$$

The answer is A.`,
  },
  {
    n: 11, correct: 'D',
    statement: `Two identical spherically symmetric planets, each of mass $$M$$, are somehow held at rest with respect to each other. Each planet has radius $$R$$, and the distance between the centers of the planets is $$4R$$. If a rocket is launched from the surface of one planet with speed $$v$$, what is the minimum speed $$v$$ so that the rocket can reach the other planet?`,
    choices: {
      A: '$$\\sqrt{\\dfrac{2GM}{R}}$$',
      B: '$$\\sqrt{\\dfrac{GM}{R}}$$',
      C: '$$\\sqrt{\\dfrac{3GM}{4R}}$$',
      D: '$$\\sqrt{\\dfrac{2GM}{3R}}$$',
      E: '$$\\sqrt{\\dfrac{GM}{2R}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'energy conservation'],
    solution: `The gravitational force on the rocket vanishes at the midpoint between the two planet centers (distance $$2R$$ from each center). This is a saddle point of the potential — once the rocket passes the midpoint, it will be pulled toward the second planet. So the rocket only needs enough energy to reach the midpoint.

The gravitational potential energy of the rocket (mass $$m$$) at the launch point (surface of planet 1, distance $$R$$ from planet 1's center and $$3R$$ from planet 2's center) is:
$$U_i = -\\dfrac{GMm}{R} - \\dfrac{GMm}{3R} = -\\dfrac{4GMm}{3R}.$$

At the midpoint (distance $$2R$$ from each center):
$$U_f = -\\dfrac{GMm}{2R} - \\dfrac{GMm}{2R} = -\\dfrac{GMm}{R}.$$

Setting the kinetic energy equal to the increase in potential energy (minimum speed means zero velocity at the midpoint):
$$\\tfrac{1}{2}mv^2 = U_f - U_i = -\\dfrac{GMm}{R} + \\dfrac{4GMm}{3R} = \\dfrac{GMm}{3R}.$$

Therefore $$v = \\sqrt{\\dfrac{2GM}{3R}}$$.

The answer is D.`,
  },
  {
    n: 12, correct: 'D',
    statement: `A pulley is constructed by attaching two concentric cylinders, with the larger cylinder having twice the radius. Ropes are wrapped around both cylinders, a mass $$m$$ is hung from each rope, and the system is released from rest.

Neglect the masses of the cylinders and ropes. Each mass experiences both a gravitational and a tension force. If the net force experienced by the left mass is $$F_1$$, and the net force experienced by the right mass is $$F_2$$, what is the ratio $$F_2/F_1$$?`,
    choices: {
      A: '$$\\dfrac{1}{4}$$',
      B: '$$\\dfrac{1}{2}$$',
      C: '$$1$$',
      D: '$$2$$',
      E: '$$4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational dynamics', 'constraint kinematics', 'newton\'s laws'],
    solution: `This device is called a windlass. Let the small cylinder have radius $$r$$ and the large cylinder radius $$2r$$. The angular acceleration of the pulley is $$\\alpha$$.

The mass on the small cylinder (left, say) has linear acceleration $$a_1 = r\\alpha$$, while the mass on the large cylinder (right) has linear acceleration $$a_2 = 2r\\alpha = 2a_1$$.

Since $$F = ma$$ and both masses are equal, $$F_2/F_1 = a_2/a_1 = 2$$.

The answer is D.`,
  },
  {
    n: 13, correct: 'C',
    statement: `Consider a laptop made of two identical uniform plates, each of mass $$m/2$$, connected by a hinge. The hinge is locked when the screen makes an angle $$\\theta$$ to the vertical, as shown, fixing the angle between the two pieces.

Assuming the laptop does not slip, what is the minimum force that can be exerted on the top of the laptop, in the plane of the page, to cause the bottom of the laptop to lift off the ground?`,
    choices: {
      A: '$$\\dfrac{mg(1-\\sin\\theta)}{2}$$',
      B: '$$\\dfrac{mg(\\cos\\theta+\\sin\\theta)}{2}$$',
      C: '$$\\dfrac{mg(1-\\sin\\theta)}{4}$$',
      D: '$$\\dfrac{mg(1+\\sin\\theta)}{4}$$',
      E: '$$\\dfrac{mg(\\cos\\theta+\\sin\\theta)}{4}$$',
    },
    figures: [F22(13)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'free-body diagrams'],
    solution: `When the bottom of the laptop is about to lift off, the normal force from the ground concentrates at the hinge (the pivot point). Take torques about the hinge to find the minimum force.

Let each plate have length $$\\ell$$, with the bottom plate lying flat on the ground and the screen tilted at angle $$\\theta$$ to the vertical. The screen leans back over the hinge — its center of mass is at horizontal distance $$\\frac{\\ell}{2}\\sin\\theta$$ on the opposite side of the hinge from the bottom plate.

__Torque from the bottom plate's weight:__ its center of mass is at horizontal distance $$\\ell/2$$ from the hinge (on the ground-plate side), giving a clockwise torque:
$$\\tau_1 = \\frac{m}{2}g\\cdot\\frac{\\ell}{2} = \\frac{mg\\ell}{4}.$$

__Torque from the screen's weight:__ the screen's center of mass is $$\\frac{\\ell}{2}\\sin\\theta$$ on the opposite side of the hinge, giving a counterclockwise torque that partially cancels $$\\tau_1$$:
$$\\tau_2 = \\frac{m}{2}g\\cdot\\frac{\\ell}{2}\\sin\\theta = \\frac{mg\\ell\\sin\\theta}{4}.$$

__Applied force:__ the minimum force $$F$$ acts at the top of the screen (distance $$\\ell$$ from the hinge). To minimize $$F$$, apply it perpendicular to the screen, giving moment arm $$\\ell$$. This force produces a counterclockwise torque $$F\\ell$$.

__Torque balance:__
$$F\\ell = \\tau_1 - \\tau_2 = \\frac{mg\\ell}{4}(1 - \\sin\\theta).$$

$$F = \\frac{mg(1-\\sin\\theta)}{4}.$$

The answer is C.`,
  },
  {
    n: 14, correct: 'C',
    statement: `A small block is released from rest on the rim of a fixed, frictionless hemispherical bowl. From the time the block is released, until it reaches the bottom of the bowl, which of the following is true?

__I.__ The speed of the block never decreases.

__II.__ The magnitude of the horizontal component of the velocity of the block never decreases.

__III.__ The magnitude of the vertical component of the velocity of the block never decreases.`,
    choices: {
      A: 'Only I.',
      B: 'Only III.',
      C: 'I and II.',
      D: 'I and III.',
      E: 'I, II, and III.',
    },
    figures: [F22(14)], topics: ['Mechanics'], tags: ['energy conservation', 'newton\'s laws', 'free-body diagrams'],
    solution: `__Statement I is true.__ The block slides down a frictionless surface, so it never moves upward and its potential energy never increases. By energy conservation its kinetic energy (and hence speed) never decreases.

__Statement II is true.__ The normal force from the bowl always points radially inward (toward the center of the sphere). Its horizontal component always points toward the vertical axis of the bowl — i.e., the horizontal component of the normal force is always directed inward. The only horizontal force on the block is this component of the normal force, which never pushes the block outward. Therefore the horizontal speed never decreases (it always either increases or stays the same).

__Statement III is false.__ The vertical component of velocity starts at zero (the block is released from rest at the rim, where the surface is vertical and the block starts to move horizontally). It increases as the block descends and then decreases back to zero at the bottom. So the vertical speed increases and then decreases — it does not monotonically increase.

The answer is C.`,
  },
  {
    n: 15, correct: 'B',
    statement: `An egg is launched with speed $$v$$ from the ground, a distance $$d$$ from a vertical wall. If $$v$$ is high enough for the egg to hit the wall, which of the following could describe the angle $$\\theta$$ that maximizes the height $$h$$ at which the egg hits the wall?`,
    choices: {
      A: '$$\\sin\\theta = \\dfrac{v^2}{gd}$$',
      B: '$$\\tan\\theta = \\dfrac{v^2}{gd}$$',
      C: '$$\\sin 2\\theta = \\dfrac{gd}{2v^2}$$',
      D: '$$\\cos\\theta = \\dfrac{gd}{v^2}$$',
      E: '$$\\sin 2\\theta = \\dfrac{v^2}{gd}$$',
    },
    figures: [F22(15)], topics: ['Mechanics'], tags: ['projectile motion', 'extreme cases', 'kinematics-2d'],
    solution: `Use limiting cases to eliminate choices.

__Limit 1: $$v \\to \\infty$$.__ The optimal angle should approach $$90°$$ (launch straight up) since with infinite speed any angle works but higher $$\\theta$$ gives more height. As $$v \\to \\infty$$, we need $$\\theta \\to 90°$$. Check each choice:
- (A): $$\\sin\\theta = v^2/gd \\to \\infty$$ — impossible ($$\\sin\\theta \\leq 1$$). Eliminated.
- (E): $$\\sin 2\\theta = v^2/gd \\to \\infty$$ — impossible. Eliminated.
- (B): $$\\tan\\theta = v^2/gd \\to \\infty$$ implies $$\\theta \\to 90°$$. ✓

__Limit 2: $$v^2 = gd$$.__ At the minimum speed to reach the wall, the only trajectory that reaches the wall is $$\\theta = 45°$$. Check (B): $$\\tan 45° = 1 = v^2/gd = 1$$. ✓ Check (C): $$\\sin 90° = 1 \\neq gd/2v^2 = 1/2$$. Eliminated. Check (D): $$\\cos 45° = 1/\\sqrt{2} \\neq gd/v^2 = 1$$. Eliminated.

Only choice (B) survives both limiting cases.

The answer is B.`,
  },
  {
    n: 16, correct: 'D',
    statement: `A hexagonal pencil of uniform density lies at rest on a horizontal table. It is pushed horizontally with a steadily increasing force halfway up its height, as shown. What is the minimum value of the coefficient of static friction between the floor and pencil, so that the pencil will eventually begin to roll?`,
    choices: {
      A: '$$0$$',
      B: '$$\\dfrac{1}{3}$$',
      C: '$$\\dfrac{1}{2}$$',
      D: '$$\\dfrac{\\sqrt{3}}{3}$$',
      E: '$$\\dfrac{\\sqrt{3}}{2}$$',
    },
    figures: [F22(16)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'friction', 'rolling without slipping'],
    solution: `Just before the pencil begins to roll, it tips about the far bottom corner (the pivot). Just at that point the normal force concentrates at that corner, so take torques about it.

For a regular hexagon with side length $$s$$ lying flat-face-down, the bottom edge runs from $$-s/2$$ to $$+s/2$$ horizontally, and the center is directly above the midpoint at height $$s\\sqrt{3}/2$$. The far bottom corner is therefore at horizontal distance $$s/2$$ from the center, and the force is applied at midheight, which is also $$s\\sqrt{3}/2$$ above the ground.

__Torque balance about the far bottom corner:__

- Weight $$mg$$ acts at the center; its horizontal distance from the corner is $$s/2$$. This produces a restoring (counterclockwise) torque $$mg(s/2)$$.
- The applied force $$F$$ acts horizontally at height $$s\\sqrt{3}/2$$ above the ground (the corner's level). This produces a rolling (clockwise) torque $$F(s\\sqrt{3}/2)$$.

Setting them equal:
$$F\\cdot\\frac{s\\sqrt{3}}{2} = mg\\cdot\\frac{s}{2} \\implies F = \\frac{mg}{\\sqrt{3}}.$$

For rolling to occur before sliding, the friction force must not exceed $$\\mu_s mg$$:
$$\\mu_s \\geq \\frac{F}{mg} = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}.$$

The answer is D.`,
  },
  {
    n: 17, correct: 'B',
    statement: `A thin rod has a nonuniform density. It is mounted on an axle passing perpendicular to it, through its center of mass, as shown, and is then rotated about the axle. The axle divides the rod into two parts, one on each side of it. Which of the following must be true, no matter how the mass in the rod is distributed?`,
    choices: {
      A: 'The two parts have the same mass.',
      B: 'The magnitudes of the momenta of the two parts are equal.',
      C: 'The magnitudes of the angular momenta of the two parts, about the center of mass, are equal.',
      D: 'The kinetic energies of the two parts are equal.',
      E: 'At least two of the above are true.',
    },
    figures: [F22(17)], topics: ['Mechanics'], tags: ['center of mass', 'momentum conservation', 'angular momentum', 'rotational dynamics'],
    solution: `Model the rod as a collection of discrete masses $$m_i$$ at positions $$r_i$$ from the center of mass (CM). By the definition of the center of mass:
$$\\sum_{\\text{left}} m_i r_i = \\sum_{\\text{right}} m_i r_i.$$

The magnitudes of the quantities for each half are:
- __Mass:__ $$\\sum m_i$$ — not necessarily equal (unequal distribution possible).
- __Momentum:__ Each mass $$m_i$$ moves with speed $$\\omega r_i$$, so the total momentum of each half is $$\\omega \\sum m_i r_i$$. Since both sums equal the same quantity (from the CM definition), the momenta are equal. Alternatively, the total momentum of the rod is zero (the CM is the axis), so the two halves must have equal and opposite momenta.
- __Angular momentum:__ $$\\omega \\sum m_i r_i^2$$ — not necessarily equal (depends on distribution of $$r_i^2$$ weighted by mass).
- __Kinetic energy:__ $$\\tfrac{\\omega^2}{2} \\sum m_i r_i^2$$ — same as angular momentum, not necessarily equal.

Only the momenta are necessarily equal.

The answer is B.`,
  },
  {
    n: 18, correct: 'B',
    statement: `A cylindrical piece of cork of density $$\\rho_c$$, height $$h_c$$, and cross-sectional area $$A_c$$ is in a larger empty cylindrical container of cross-sectional area $$A_w$$. Water of density $$\\rho_w > \\rho_c$$ is slowly poured into the empty container. What is the height of the water in the container when the cork starts to float?`,
    choices: {
      A: '$$\\dfrac{h_c \\rho_c A_c}{\\rho_w A_w}$$',
      B: '$$\\dfrac{h_c \\rho_c}{\\rho_w}$$',
      C: '$$\\dfrac{h_c \\rho_w}{\\rho_c}$$',
      D: '$$\\dfrac{h_c \\rho_c A_c}{\\rho_w(A_w - A_c)}$$',
      E: '$$\\dfrac{h_c \\rho_c A_c^2}{\\rho_w A_w^2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `The cork starts floating when the buoyant force equals its weight. The buoyant force equals the weight of water displaced by the submerged portion of the cork.

While the cork is still resting on the bottom, the water level $$H$$ rises around it. The cork starts to float when the upward buoyant force equals the cork's weight:
$$\\rho_w g A_c H = \\rho_c g A_c h_c.$$

Note that the relevant displaced water volume is $$A_c H$$ (the cork's cross-section times the water height), because the water only contacts the sides and top of the cork, and the water height $$H$$ reaches the cork's height before floating begins (since $$\\rho_c < \\rho_w$$ means $$H < h_c$$). Solving:
$$H = \\dfrac{\\rho_c h_c}{\\rho_w}.$$

The answer is B.`,
  },
  {
    n: 19, correct: 'A',
    statement: `A toy elephant is standing on the bottom of a fish tank. The fish tank is filled with water to a depth of 10 cm, completely covering the toy. The elephant's legs are perfectly polished, so that there is no water between the bottom of the legs and the tank's floor, and the total area of contact is $$0.16 \\text{ cm}^2$$. The water has density $$\\rho = 10^3 \\text{ kg/m}^3$$, the toy has uniform density $$2\\rho$$, the atmospheric pressure is $$P_{\\text{atm}} = 10^5 \\text{ Pa}$$, and the toy has total mass 120 g. What is the total hydrostatic force that the water exerts on the toy?`,
    choices: {
      A: '1 N, down',
      B: '0.6 N, down',
      C: '0 N',
      D: '0.6 N, up',
      E: '1 N, up',
    },
    figures: [F22(19)], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics', 'fluid dynamics'],
    solution: `If the elephant's legs were not polished (water could get under the feet), the buoyant force would equal the weight of water displaced. The toy's volume is $$V = m/(2\\rho) = 0.12/(2 \\times 10^3) = 6 \\times 10^{-5} \\text{ m}^3$$. The standard buoyant force would be $$\\rho g V = 10^3 \\times 10 \\times 6 \\times 10^{-5} = 0.6$$ N upward.

However, because the legs make perfect contact with the floor, no water exerts upward pressure on the bottom area of the legs (area $$A = 0.16 \\text{ cm}^2 = 1.6 \\times 10^{-5} \\text{ m}^2$$). The water pressure acts on all surfaces of the toy __except__ the contact area. The missing upward force (that would have acted on the bottom contact area) is approximately:
$$(P_{\\text{atm}} + \\rho g H) \\times A \\approx P_{\\text{atm}} A = 10^5 \\times 1.6 \\times 10^{-5} = 1.6 \\text{ N upward (missing)}.$$

The $$\\rho g H$$ term contributes $$10^3 \\times 10 \\times 0.10 \\times 1.6 \\times 10^{-5} = 0.016$$ N, negligible compared to $$P_{\\text{atm}} A$$.

So the actual hydrostatic force is $$0.6 - 1.6 = -1.0$$ N, i.e., 1 N downward.

The answer is A.`,
  },
  {
    n: 20, correct: 'B',
    statement: `A bead is threaded on a frictionless wire and launched horizontally from height $$h$$ with speed $$v_0$$, as shown. If the shape of the wire is steep, as in curve I, then the normal force from the wire on the bead will point inward. If it is shallow, as in curve II, then the normal force will point outward.

There is exactly one possible shape of wire, shown as a dotted line, for which the normal force of the wire on the bead is always equal to zero. What is the horizontal displacement $$d$$ of the bead when it travels along this wire?`,
    choices: {
      A: '$$v_0\\sqrt{\\dfrac{4g}{h}}$$',
      B: '$$v_0\\sqrt{\\dfrac{2h}{g}}$$',
      C: '$$v_0\\sqrt{\\dfrac{h}{g}}$$',
      D: '$$v_0\\sqrt{\\dfrac{h}{2g}}$$',
      E: '$$v_0\\sqrt{\\dfrac{h}{4g}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'newton\'s laws', 'kinematics-2d'],
    solution: `If the normal force is always zero, the only force on the bead is gravity. This means the bead follows exactly the same trajectory as a freely-launched projectile — the wire's shape is a parabola matching the projectile path.

The bead (treated as a projectile) is launched horizontally with speed $$v_0$$ from height $$h$$. The time to fall height $$h$$ is found from:
$$h = \\tfrac{1}{2}g t^2 \\implies t = \\sqrt{\\dfrac{2h}{g}}.$$

The horizontal displacement is:
$$d = v_0 t = v_0\\sqrt{\\dfrac{2h}{g}}.$$

The answer is B.`,
  },
  {
    n: 21, correct: 'E',
    statement: `A cork floating in a cup filled with a viscous fluid is placed in an elevator. Below is a plot of the velocity $$v$$ of the elevator as a function of time $$t$$. Which of the following plots best describes the height $$h$$ of the cork in the cup as a function of time? Assume that the fluid is viscous enough to dampen all oscillations, that the fluid does not slosh as the elevator accelerates, and that both the cork and fluid are incompressible.`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-a/fma-2022-a-q21A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-a/fma-2022-a-q21B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-a/fma-2022-a-q21C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-a/fma-2022-a-q21D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-a/fma-2022-a-q21E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics', 'reference frames'],
    solution: `By Archimedes' principle, a floating object displaces fluid equal to its own weight. In the elevator's non-inertial reference frame, the effective gravitational acceleration is $$g_{\\text{eff}} = g + a_{\\text{elevator}}$$. Both the weight of the cork and the buoyant force scale with $$g_{\\text{eff}}$$ equally — the buoyant force is $$\\rho_{\\text{fluid}} g_{\\text{eff}} V_{\\text{displaced}}$$ and the cork's weight is $$\\rho_{\\text{cork}} g_{\\text{eff}} V_{\\text{cork}}$$. The equilibrium condition $$\\rho_{\\text{cork}} V_{\\text{cork}} = \\rho_{\\text{fluid}} V_{\\text{displaced}}$$ is independent of $$g_{\\text{eff}}$$.

Therefore the fraction of the cork submerged does not change regardless of the elevator's acceleration. The height of the cork in the cup remains constant — the correct graph is a flat horizontal line.

The answer is E.`,
  },
  {
    n: 22, correct: 'E',
    statement: `A block of mass $$2m$$ is placed symmetrically on two identical wedges of mass $$m$$, as shown. All surfaces are frictionless, and the wedges have angle $$\\theta$$ to the vertical. If the system is released from rest, what is the downward acceleration of the block?`,
    choices: {
      A: '$$g\\sin\\theta$$',
      B: '$$g\\sin(2\\theta)$$',
      C: '$$g\\cos\\theta$$',
      D: '$$g\\cos(2\\theta)$$',
      E: '$$g\\cos^2\\theta$$',
    },
    figures: [F22(22)], topics: ['Mechanics'], tags: ['constraint kinematics', 'energy conservation', 'newton\'s laws'],
    solution: `Use energy methods. If the block moves down with speed $$v$$, by the constraint geometry (wedges slide outward as block descends), the wedges must move horizontally with speed $$v\\tan\\theta$$ (since the wedge angle to the vertical is $$\\theta$$, the ratio of horizontal to vertical speed is $$\\tan\\theta$$).

The total kinetic energy of the system is:
$$K = \\tfrac{1}{2}(2m)v^2 + 2 \\cdot \\tfrac{1}{2}m(v\\tan\\theta)^2 = mv^2\\left(1 + \\tan^2\\theta\\right) = \\dfrac{mv^2}{\\cos^2\\theta}.$$

This is equivalent to a single effective mass $$m_{\\text{eff}} = 2m/\\cos^2\\theta$$ moving with speed $$v$$.

When the block descends by $$\\Delta h$$, the gravitational potential energy released is $$2mg\\Delta h$$. Using the effective mass approach:
$$2mg = m_{\\text{eff}} \\cdot a = \\dfrac{2m}{\\cos^2\\theta} \\cdot a$$

$$\\implies a = g\\cos^2\\theta.$$

The answer is E.`,
  },
  {
    n: 23, correct: 'C',
    statement: `For objects moving through air, the force of air resistance can be modeled as proportional to the speed ("linear drag") or proportional to the square of the speed ("quadratic drag"), depending on the circumstances. Two identical objects, A and B, are dropped from the same height $$h$$ simultaneously, but object A is given an initial horizontal velocity $$v$$. The objects hit the ground at times $$t_A$$ and $$t_B$$. Accounting for air resistance, which of the following is true?`,
    choices: {
      A: 'For both linear drag and quadratic drag, $$t_A = t_B$$.',
      B: 'For linear drag, $$t_A > t_B$$, while for quadratic drag, $$t_A = t_B$$.',
      C: 'For linear drag, $$t_A = t_B$$, while for quadratic drag, $$t_A > t_B$$.',
      D: 'For both linear drag and quadratic drag, $$t_A > t_B$$.',
      E: 'For both linear drag and quadratic drag, the answer depends on $$v$$ and $$h$$.',
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'equations of motion', 'kinematics-2d'],
    solution: `__Linear drag:__ The drag force is $$\\vec{F}_{\\text{drag}} = -b\\vec{v}$$, so the equations of motion separate completely:
$$m\\dot{v}_x = -bv_x, \\quad m\\dot{v}_y = -mg - bv_y.$$

The vertical motion is completely independent of the horizontal motion. The time to fall from height $$h$$ depends only on the vertical equation, which is the same for both A and B (both have zero initial vertical velocity). Therefore $$t_A = t_B$$.

__Quadratic drag:__ The drag force is $$\\vec{F}_{\\text{drag}} = -b|\\vec{v}|\\hat{v}$$, so the vertical component of drag is:
$$F_{y,\\text{drag}} = -bv_y|\\vec{v}| = -bv_y\\sqrt{v_x^2 + v_y^2}.$$

This depends on $$v_x$$. Since object A has a larger total speed than B at all times (due to the initial horizontal velocity), it experiences greater upward drag in the vertical direction. This reduces the net downward acceleration of A compared to B, so A takes longer to fall: $$t_A > t_B$$.

The answer is C.`,
  },
  {
    n: 24, correct: 'B',
    statement: `A satellite is in orbit around a planet of mass $$M$$. Its maximum distance from the center of the planet is $$d$$, and at this point, it is traveling at a speed of $$\\dfrac{1}{2}\\sqrt{\\dfrac{GM}{d}}$$. What is the area of the satellite's orbit?`,
    choices: {
      A: '$$\\dfrac{8}{15}\\sqrt{\\dfrac{2}{15}}\\,\\pi d^2$$',
      B: '$$\\dfrac{4}{7}\\sqrt{\\dfrac{1}{7}}\\,\\pi d^2$$',
      C: '$$\\dfrac{1}{3}\\sqrt{\\dfrac{2}{3}}\\,\\pi d^2$$',
      D: '$$\\dfrac{8}{7}\\sqrt{\\dfrac{1}{7}}\\,\\pi d^2$$',
      E: '$$\\dfrac{2}{3}\\sqrt{\\dfrac{2}{3}}\\,\\pi d^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['kepler\'s laws', 'gravitation', 'energy conservation', 'angular momentum conservation'],
    solution: `Let $$r_1 = d$$ be the apoapsis and $$r_2$$ be the periapsis. The speed at apoapsis is $$v_1 = \\tfrac{1}{2}\\sqrt{GM/d}$$.

__Find $$r_2$$ using conservation of angular momentum and energy:__

Angular momentum: $$mv_1 d = mv_2 r_2 \\implies v_2 = \\dfrac{v_1 d}{r_2}$$.

Energy conservation: $$\\tfrac{1}{2}v_1^2 - \\dfrac{GM}{d} = \\tfrac{1}{2}v_2^2 - \\dfrac{GM}{r_2}$$

$$\\dfrac{1}{2}\\cdot\\dfrac{GM}{4d} - \\dfrac{GM}{d} = \\dfrac{1}{2}\\cdot\\dfrac{v_1^2 d^2}{r_2^2} - \\dfrac{GM}{r_2}$$

$$-\\dfrac{7GM}{8d} = \\dfrac{GM d}{8r_2^2} - \\dfrac{GM}{r_2}$$

Multiply through by $$8r_2^2/(GM)$$:
$$-\\dfrac{7r_2^2}{d} = \\dfrac{d}{1} - 8r_2$$

$$7r_2^2 - 8dr_2 + d^2 = 0 \\implies (7r_2 - d)(r_2 - d) = 0.$$

So $$r_2 = d/7$$ (the other root $$r_2 = d$$ is the apoapsis itself).

__Orbital geometry:__

Semimajor axis: $$a = \\dfrac{r_1 + r_2}{2} = \\dfrac{d + d/7}{2} = \\dfrac{4d}{7}$$.

Semiminor axis: The center of the ellipse is at distance $$a - r_2 = 4d/7 - d/7 = 3d/7$$ from the focus, so $$b^2 = a^2 - c^2 = (4d/7)^2 - (3d/7)^2 = (16 - 9)d^2/49 = d^2/7$$, giving $$b = d/\\sqrt{7}$$.

__Area:__
$$A = \\pi a b = \\pi \\cdot \\dfrac{4d}{7} \\cdot \\dfrac{d}{\\sqrt{7}} = \\dfrac{4\\pi d^2}{7\\sqrt{7}} = \\dfrac{4}{7}\\sqrt{\\dfrac{1}{7}}\\,\\pi d^2.$$

The answer is B.`,
  },
  {
    n: 25, correct: 'A',
    statement: `A cylinder is placed with its axis vertical, and a rubber band of mass $$m$$ and tension $$T$$ is wrapped horizontally around it. What is the minimum coefficient of static friction $$\\mu$$ between the rubber band and the cylinder such that the band will not slide down the cylinder?`,
    choices: {
      A: '$$\\dfrac{mg}{2\\pi T}$$',
      B: '$$\\dfrac{mg}{T}$$',
      C: '$$\\dfrac{4mg}{T}$$',
      D: '$$\\dfrac{2\\pi mg}{T}$$',
      E: '$$\\dfrac{2m^2g^2}{T^2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'tension', 'friction'],
    solution: `Consider a small patch of the rubber band subtending angle $$d\\phi$$. The tension $$T$$ in the band pulls inward on this patch, providing a normal force $$dN = T\\,d\\phi$$ directed radially inward (toward the cylinder axis).

The weight of this patch is $$dW = \\dfrac{mg}{2\\pi}d\\phi$$ (since the total band has length $$2\\pi r$$ and is uniform, each fraction $$d\\phi/(2\\pi)$$ of the band carries that fraction of the total weight).

For the patch not to slide, static friction must support its weight:
$$\\mu\\,dN \\geq dW$$
$$\\mu\\,T\\,d\\phi \\geq \\dfrac{mg}{2\\pi}d\\phi$$
$$\\mu \\geq \\dfrac{mg}{2\\pi T}.$$

The minimum coefficient is $$\\mu = \\dfrac{mg}{2\\pi T}$$.

The answer is A.`,
  },
]
