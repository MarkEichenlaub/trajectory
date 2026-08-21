// Digitized 2012 F=ma exam questions. Sources:
// Exam: work/fma/fma-2012.pdf (text extracted to work/fma/fma-2012.txt)
// Answer key: work/fma/fma-2012-sol.pdf (←CORRECT markers)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2012.1. through 2012.25.
// Figures: work/figure_manifest.json, key "fma-2012" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions.
// Q14 note: book derives T = W/5 = 3 N, closest answer is A (6 N). The book
// and answer key agree on A.

const F12 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2012/fma-2012-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2012'
export const questions = [
  {
    n: 1, correct: 'D',
    statement: `Consider a dripping faucet, where the faucet is 10 cm above the sink. The time between drops is such that when one drop hits the sink, one is in the air and another is about to drop. At what height above the sink will the drop in the air be right as a drop hits the sink?`,
    choices: {
      A: 'Between 0 and 2 cm',
      B: 'Between 2 and 4 cm',
      C: 'Between 4 and 6 cm',
      D: 'Between 6 and 8 cm',
      E: 'Between 8 and 10 cm',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `Let $$H = 10$$ cm be the height of the faucet and $$T$$ the time for a drop to fall from faucet to sink, so $$H = \\frac{gT^2}{2}$$.

Since when one drop hits the sink another is just starting to fall, drops form at intervals $$t = T/2$$. The drop in the air started falling a time $$t = T/2$$ ago, so it has fallen

$$y = \\frac{gt^2}{2} = \\frac{g(T/2)^2}{2} = \\frac{gT^2}{8} = \\frac{H}{4} = 2.5 \\text{ cm.}$$

Its height above the sink is

$$h = H - y = H - \\frac{H}{4} = \\frac{3H}{4} = 7.5 \\text{ cm,}$$

which is between 6 and 8 cm. The answer is D.`,
  },
  {
    n: 2, correct: 'A',
    statement: `A cannonball is launched with initial velocity of magnitude $$v_0$$ over a horizontal surface. At what minimum angle $$\\theta_{\\min}$$ above the horizontal should the cannonball be launched so that it rises to a height $$H$$ which is larger than the horizontal distance $$R$$ that it will travel when it returns to the ground?`,
    choices: {
      A: '$$\\theta_{\\min} = 76^\\circ$$',
      B: '$$\\theta_{\\min} = 72^\\circ$$',
      C: '$$\\theta_{\\min} = 60^\\circ$$',
      D: '$$\\theta_{\\min} = 45^\\circ$$',
      E: 'There is no such angle, as $$R > H$$ for all range problems.',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d'],
    solution: `The maximum height and horizontal range are

$$H = \\frac{v_0^2 \\sin^2\\theta}{2g}, \\qquad R = \\frac{v_0^2 \\sin 2\\theta}{g}.$$

The condition $$H > R$$ becomes (using $$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$$)

$$\\frac{v_0^2 \\sin^2\\theta}{2g} > \\frac{v_0^2 \\sin 2\\theta}{g} \\implies \\frac{\\sin^2\\theta}{2} > 2\\sin\\theta\\cos\\theta \\implies \\tan\\theta > 4.$$

Therefore $$\\theta_{\\min} = \\arctan 4 \\approx 76^\\circ$$, and the answer is A.`,
  },
  {
    n: 3, correct: 'C',
    statement: `An equilateral triangle is sitting on an inclined plane. Friction is too high for it to slide under any circumstance, but if the plane is sloped enough it can "topple" down the hill. What angle incline is necessary for it to start toppling?`,
    choices: {
      A: '30 degrees',
      B: '45 degrees',
      C: '60 degrees',
      D: 'It will topple at any angle more than zero',
      E: 'It can never topple if it cannot slide',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'center of mass'],
    solution: `An object will not topple as long as its center of mass lies directly above a point within the contact area (base edge). For an equilateral triangle resting on one side, the center of mass is at height $$\\frac{1}{\\sqrt{3}}$$ times the side length above the base, and the base half-width is $$\\frac{1}{2}$$ the side length.

Toppling begins when the vertical through the center of mass passes through the tipping edge. This occurs when the incline angle equals $$60^\\circ$$ with the horizontal. The answer is C.`,
  },
  {
    n: 4, correct: 'B',
    statement: `A particle at rest explodes into three particles of equal mass in the absence of external forces. Two particles emerge at a right angle to each other with equal speed $$v$$. What is the speed of the third particle?`,
    choices: {
      A: '$$v$$',
      B: '$$\\sqrt{2}\\,v$$',
      C: '$$2v$$',
      D: '$$2\\sqrt{2}\\,v$$',
      E: 'The third particle can have a range of different speeds.',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'vectors'],
    solution: `Since there are no external forces, linear momentum is conserved. The initial momentum is zero, so the final total momentum must also be zero.

If the two perpendicular velocities point north and east respectively, each with magnitude $$v$$, their vector sum has magnitude $$v\\sqrt{2}$$ directed northeast. The third particle must have momentum equal and opposite to this sum, so its speed is

$$v_3 = \\sqrt{v^2 + v^2} = \\sqrt{2}\\,v.$$

The answer is B.`,
  },
  {
    n: 5, correct: 'D',
    statement: `A 12 kg block moving east at 4 m/s collides head on with a 6 kg block that is moving west at 2 m/s. The two blocks move together after the collision. What is the loss in kinetic energy in this collision?`,
    choices: {
      A: '36 J',
      B: '48 J',
      C: '60 J',
      D: '72 J',
      E: '96 J',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
    solution: `Let $$m_1 = 12$$ kg, $$v_1 = 4$$ m/s, $$m_2 = 6$$ kg, $$v_2 = -2$$ m/s (opposite direction). This is a perfectly inelastic collision. The general formula for the kinetic energy lost in such a collision is

$$\\Delta E_k = \\frac{m_1 m_2 (v_1 - v_2)^2}{2(m_1 + m_2)} = \\frac{12 \\cdot 6 \\cdot (4-(-2))^2}{2 \\cdot 18} = \\frac{72 \\cdot 36}{36} = 72 \\text{ J.}$$

The answer is D.`,
  },
  {
    n: 6, correct: 'B',
    statement: `Two cannons are arranged vertically, with the lower cannon pointing upward (towards the upper cannon) and the upper cannon pointing downward (towards the lower cannon), 200 m above the lower cannon. Simultaneously, they both fire. The muzzle velocity of the lower cannon is 25 m/s and the muzzle velocity of the upper cannon is 55 m/s.

How long after the cannons fire do the projectiles collide?`,
    choices: {
      A: '2.2 s',
      B: '2.5 s',
      C: '3.6 s',
      D: '6.7 s',
      E: '8.0 s',
    },
    figures: [F12(6)], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `Let $$x = 200$$ m, $$v_1 = 25$$ m/s (upward), $$v_2 = 55$$ m/s (downward), and $$t$$ be the collision time. The lower projectile travels upward a distance $$v_1 t - \\frac{1}{2}gt^2$$ and the upper projectile travels downward $$v_2 t + \\frac{1}{2}gt^2$$. These must sum to $$x$$:

$$x = v_1 t - \\frac{gt^2}{2} + v_2 t + \\frac{gt^2}{2} = (v_1 + v_2)t.$$

The gravity terms cancel, giving

$$t = \\frac{x}{v_1 + v_2} = \\frac{200}{25 + 55} = 2.5 \\text{ s.}$$

The answer is B.`,
  },
  {
    n: 7, correct: 'E',
    statement: `Two cannons are arranged vertically, with the lower cannon pointing upward (towards the upper cannon) and the upper cannon pointing downward (towards the lower cannon), 200 m above the lower cannon. Simultaneously, they both fire. The muzzle velocity of the lower cannon is 25 m/s and the muzzle velocity of the upper cannon is 55 m/s.

How far beneath the top cannon do the projectiles collide?`,
    choices: {
      A: '31 m',
      B: '67 m',
      C: '110 m',
      D: '140 m',
      E: '170 m',
    },
    figures: [F12(6)], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `Using $$t = 2.5$$ s from the previous problem, the upper projectile has traveled downward

$$h = v_2 t + \\frac{gt^2}{2} = 55 \\cdot 2.5 + \\frac{10 \\cdot 2.5^2}{2} = 137.5 + 31.25 = 168.75 \\text{ m.}$$

The closest answer is E (170 m).`,
  },
  {
    n: 8, correct: 'B',
    statement: `A block of mass $$m = 3.0$$ kg is moving on a horizontal surface towards a massless spring with spring constant $$k = 80.0$$ N/m. The coefficient of kinetic friction between the block and the surface is $$\\mu_k = 0.50$$. The block has a speed of 2.0 m/s when it first comes in contact with the spring. How far will the spring be compressed?`,
    choices: {
      A: '0.19 m',
      B: '0.24 m',
      C: '0.39 m',
      D: '0.40 m',
      E: '0.61 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'springs', 'friction', 'work-energy theorem'],
    solution: `The block's kinetic energy is converted into spring potential energy and heat lost to friction:

$$\\frac{mv^2}{2} = \\frac{kx^2}{2} + \\mu_k mg x.$$

Substituting $$m = 3.0$$ kg, $$v = 2.0$$ m/s, $$k = 80.0$$ N/m, $$\\mu_k = 0.50$$, $$g = 10$$ m/s$$^2$$:

$$6 = 40x^2 + 15x \\implies 40x^2 + 15x - 6 = 0.$$

Using the quadratic formula (taking the positive root):

$$x = \\frac{-15 + \\sqrt{225 + 960}}{80} = \\frac{-15 + \\sqrt{1185}}{80} \\approx 0.24 \\text{ m.}$$

The answer is B.`,
  },
  {
    n: 9, correct: 'C',
    statement: `A uniform spherical planet has radius $$R$$ and the acceleration due to gravity at its surface is $$g$$. What is the escape velocity of a particle from the planet's surface?`,
    choices: {
      A: '$$\\frac{1}{2}\\sqrt{gR}$$',
      B: '$$\\sqrt{gR}$$',
      C: '$$\\sqrt{2gR}$$',
      D: '$$2\\sqrt{gR}$$',
      E: 'The escape velocity cannot be expressed in terms of $$g$$ and $$R$$ alone.',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'energy conservation'],
    solution: `To escape the planet's gravity, the particle's initial kinetic energy must equal the gravitational potential energy at the surface (taking zero at infinity):

$$\\frac{mv^2}{2} = \\frac{GmM}{R}.$$

Since $$g = \\frac{GM}{R^2}$$, we have $$GM = gR^2$$, so

$$v = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR}.$$

The answer is C.`,
  },
  {
    n: 10, correct: 'D',
    statement: `Four objects are placed at rest at the top of an inclined plane and allowed to roll without slipping to the bottom in the absence of rolling resistance and air resistance.

- Object A is a solid brass ball of diameter $$d$$.
- Object B is a solid brass ball of diameter $$2d$$.
- Object C is a hollow brass sphere of diameter $$d$$.
- Object D is a solid aluminum ball of diameter $$d$$. (Aluminum is less dense than brass.)

The balls are placed so that their centers of mass all travel the same distance. In each case, the time of motion $$T$$ is measured. Which of the following statements is correct?`,
    choices: {
      A: '$$T_B > T_C > T_A = T_D$$',
      B: '$$T_A = T_B = T_C > T_D$$',
      C: '$$T_B > T_A = T_C = T_D$$',
      D: '$$T_C > T_A = T_B = T_D$$',
      E: '$$T_A = T_B = T_C = T_D$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'energy conservation', 'rotational dynamics'],
    solution: `For an object rolling without slipping with moment of inertia $$I = cmr^2$$, the acceleration down the incline is

$$a = \\frac{g\\sin\\theta}{1 + c}.$$

This depends only on the shape parameter $$c$$, not on mass, density, or radius. The relevant values are: solid ball $$c = 2/5$$, hollow sphere $$c = 2/3$$.

Objects A, B, and D are all solid balls ($$c = 2/5$$), regardless of size or material, so they all have the same acceleration and arrive at the same time. Object C is a hollow sphere ($$c = 2/3$$), giving a smaller acceleration and a longer travel time.

Therefore $$T_C > T_A = T_B = T_D$$, and the answer is D.`,
  },
  {
    n: 11, correct: 'B',
    statement: `As shown below, Lily is using the rope through a fixed pulley to move a box with constant speed $$v$$. The kinetic friction coefficient between the box and the ground is $$\\mu < 1$$; assume that the fixed pulley is massless and there is no friction between the rope and the fixed pulley. Then, while the box is moving, which of the following statements is correct?`,
    choices: {
      A: 'The magnitude of the force on the rope is constant.',
      B: 'The magnitude of friction between the ground and the box is decreasing.',
      C: 'The magnitude of the normal force of the ground on the box is increasing.',
      D: 'The pressure of the box on the ground is increasing.',
      E: 'The pressure of the box on the ground is constant.',
    },
    figures: [F12(11)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'friction', 'tension', 'free-body diagrams'],
    solution: `Let $$\\theta$$ be the angle the rope makes above horizontal, $$m$$ the box mass, and $$T$$ the rope tension. For constant velocity the horizontal components balance:

$$T\\cos\\theta = \\mu(mg - T\\sin\\theta) \\implies T = \\frac{\\mu mg}{\\cos\\theta + \\mu\\sin\\theta}.$$

As the box moves toward the pulley, $$\\theta$$ increases. The friction force is $$F_f = \\mu(mg - T\\sin\\theta)$$. As $$\\theta$$ increases, $$\\sin\\theta$$ increases, so the vertical component $$T\\sin\\theta$$ grows and the normal force $$N = mg - T\\sin\\theta$$ decreases. Therefore friction $$F_f = \\mu N$$ decreases over time.

Checking the other choices: T is not constant (A is wrong); N decreases so the normal force decreases (C and D are wrong; E is wrong). The correct answer is B.`,
  },
  {
    n: 12, correct: 'D',
    statement: `A rigid hoop can rotate about the center. Two massless strings are attached to the hoop, one at A, the other at B. These strings are tied together at the center of the hoop at O, and a weight G is suspended from that point. The strings have a fixed length, regardless of the tension, and the weight G is only supported by the strings. Originally OA is horizontal.

Now, the outer hoop will start to slowly rotate 90° clockwise until OA will become vertical, while keeping the angle between the strings constant and keeping the object static. Which of the following statements about the tensions $$T_1$$ and $$T_2$$ in the two strings is correct?`,
    choices: {
      A: '$$T_1$$ always decreases.',
      B: '$$T_1$$ always increases.',
      C: '$$T_2$$ always increases.',
      D: '$$T_2$$ will become zero at the end of the rotation.',
      E: '$$T_2$$ first increases and then decreases.',
    },
    figures: [F12(12)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'tension', 'vectors'],
    solution: `In the final position, OA is vertical (pointing upward) and OB makes a fixed angle from it. At this final configuration we write equilibrium conditions:

Vertically: $$T_1 - mg - T_2\\cos\\theta = 0$$

Horizontally: $$T_2\\sin\\theta = 0.$$

Since $$\\sin\\theta \\neq 0$$ in general, the horizontal equation forces $$T_2 = 0$$. Thus $$T_2$$ becomes zero at the end of the rotation, and the answer is D.`,
  },
  {
    n: 13, correct: 'E',
    statement: `Shown below is a graph of the $$x$$ component of force versus position for a 4.0 kg cart constrained to move in one dimension on the $$x$$ axis. At $$x = 0$$ the cart has a velocity of $$-3.0$$ m/s (in the negative direction). Which of the following is closest to the maximum speed of the cart?`,
    choices: {
      A: '1.6 m/s',
      B: '2.5 m/s',
      C: '3.0 m/s',
      D: '4.0 m/s',
      E: '4.2 m/s',
    },
    figures: [F12(13)], topics: ['Mechanics'], tags: ['work-energy theorem', 'graph interpretation', 'energy conservation'],
    solution: `The cart starts at $$x = 0$$ with velocity $$-3.0$$ m/s moving left. From the graph, the force is $$-5$$ N for $$x < 0$$, which opposes the leftward motion. The initial kinetic energy is $$E_{k0} = \\frac{1}{2}(4.0)(3.0)^2 = 18$$ J.

The cart decelerates and stops at position $$x$$ where:

$$F \\cdot |x| = E_{k0} \\implies 5|x| = 18 \\implies |x| = 3.6 \\text{ m.}$$

So the cart reaches $$x = -3.6$$ m, then reverses and moves to the right. The maximum speed occurs where the net work is maximized, which is at $$x = 6$$ m where $$F(x) = 0$$ (the cart will be decelerated after that point). The kinetic energy at $$x = 6$$ m equals the area under the $$F$$-vs-$$x$$ graph from $$x = -3.6$$ m to $$x = 6$$ m:

$$E_{k1} = (1 + 3.6) \\times 5 + \\frac{1}{2} \\times 5 \\times 5 = 23 + 12.5 = 35.5 \\text{ J.}$$

Then $$v_{\\max} = \\sqrt{\\frac{2E_{k1}}{m}} = \\sqrt{\\frac{2 \\times 35.5}{4}} = \\sqrt{17.75} \\approx 4.2$$ m/s. The answer is E.`,
  },
  {
    n: 14, correct: 'A',
    statement: `A uniform cylinder of radius $$a$$ originally has a weight of 80 N. After an off-axis cylinder hole at $$2a/5$$ was drilled through it, it weighs 65 N. The axes of the two cylinders are parallel and their centers are at the same height.

A force $$T$$ is applied to the top of the cylinder horizontally. In order to keep the cylinder at rest, the magnitude of the force is closest to:`,
    choices: {
      A: '6 N',
      B: '10 N',
      C: '15 N',
      D: '30 N',
      E: '38 N',
    },
    figures: [F12(14)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'center of mass'],
    solution: `The removed material has weight $$W = 80 - 65 = 15$$ N. To keep the cylinder at rest, we compute torques about the contact point with the ground C (this eliminates the static friction torque).

The force $$T$$ at the top has lever arm $$2a$$, giving torque $$\\tau_1 = 2aT$$.

The hole acts as a negative mass whose center is at horizontal distance $$2a/5$$ from the cylinder axis (at the same height as the axis). The lever arm from C to the hole center is $$2a/5$$, giving torque $$\\tau_2 = W \\cdot \\frac{2a}{5}$$.

Setting $$\\tau_1 = \\tau_2$$:

$$2aT = \\frac{2aW}{5} \\implies T = \\frac{W}{5} = \\frac{15}{5} = 3 \\text{ N.}$$

The closest answer choice is A (6 N).`,
  },
  {
    n: 15, correct: 'A',
    statement: `A car of mass $$m$$ has an engine that provides a constant power output $$P$$. Assuming no friction, what is the maximum constant speed $$v_{\\max}$$ that this car can drive up a long incline that makes an angle $$\\theta$$ with the horizontal?`,
    choices: {
      A: '$$v_{\\max} = \\dfrac{P}{mg\\sin\\theta}$$',
      B: '$$v_{\\max} = \\dfrac{P^2 \\sin\\theta}{mg}$$',
      C: '$$v_{\\max} = \\sqrt{\\dfrac{2P}{mg\\sin\\theta}}$$',
      D: 'There is no maximum constant speed.',
      E: 'The maximum constant speed depends on the length of the incline.',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'work-energy theorem'],
    solution: `For the car to move at constant speed up the incline, the net force must be zero. The engine force $$F$$ must balance the gravitational component along the slope:

$$F = mg\\sin\\theta.$$

Power is $$P = Fv_{\\max}$$, so

$$v_{\\max} = \\frac{P}{F} = \\frac{P}{mg\\sin\\theta}.$$

The answer is A.`,
  },
  {
    n: 16, correct: 'E',
    statement: `Inside a cart that is accelerating horizontally at acceleration $$\\vec{a}$$, there is a block of mass $$M$$ connected to two light springs of force constants $$k_1$$ and $$k_2$$. The block can move without friction horizontally. Find the vibration frequency of the block.`,
    choices: {
      A: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k_1+k_2}{M} + a}$$',
      B: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k_1 k_2}{(k_1+k_2)M}}$$',
      C: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k_1 k_2}{(k_1+k_2)M} + a}$$',
      D: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{|k_1-k_2|}{M}}$$',
      E: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k_1+k_2}{M}}$$',
    },
    figures: [F12(16)], topics: ['Mechanics'], tags: ['springs', 'equations of motion'],
    solution: `Although the two-spring configuration may look like a series connection, it is actually a parallel connection: the full displacement of the mass changes the length of both springs by the same amount. Therefore the equivalent spring constant is $$k = k_1 + k_2$$ and the vibration frequency is

$$f = \\frac{1}{2\\pi}\\sqrt{\\frac{k_1 + k_2}{M}}.$$

The acceleration of the cart only shifts the equilibrium position of the block; it does not affect the oscillation frequency. The answer is E.`,
  },
  {
    n: 17, correct: 'A',
    statement: `Shown below is a log/log plot for the data collected of amplitude and period of oscillation for a certain non-linear oscillator.

According to the data, the relationship between period $$T$$ and amplitude $$A$$ is best given by`,
    choices: {
      A: '$$T = 1000A^2$$',
      B: '$$T = 100A^3$$',
      C: '$$T = 2A + 3$$',
      D: '$$T = 3\\sqrt{A}$$',
      E: 'Period is independent of amplitude for oscillating systems',
    },
    figures: [F12(17)], topics: ['Mechanics'], tags: ['data analysis', 'graph interpretation'],
    solution: `From the log-log graph, the slope is 2 and the vertical intercept is 3, so

$$\\log T = 2\\log A + 3 = \\log A^2 + \\log 10^3 = \\log(1000 A^2).$$

Therefore $$T = 1000A^2$$, and the answer is A.`,
  },
  {
    n: 18, correct: 'B',
    statement: `A mass hangs from the ceiling of a box by an ideal spring. With the box held fixed, the mass is given an initial velocity and oscillates with purely vertical motion. When the mass reaches the lowest point of its motion, the box is released and allowed to fall. To an observer inside the box, which of the following quantities does not change when the box is released? Ignore air resistance.`,
    choices: {
      A: 'The amplitude of the oscillation',
      B: 'The period of the oscillation',
      C: 'The maximum speed reached by the mass',
      D: 'The height at which the mass reaches its maximum speed',
      E: 'The maximum height reached by the mass',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'reference frames', 'equations of motion'],
    solution: `When the box is released and falls freely, the observer inside the box is in a non-inertial reference frame where the effective gravitational acceleration is zero. The spring-mass system now oscillates about a new equilibrium (where the spring is at its natural length). The period of oscillation $$T = 2\\pi\\sqrt{M/k}$$ depends only on the mass and spring constant, not on $$g$$ or the acceleration of the frame. Therefore the period does not change.

All other quantities (amplitude, maximum speed, equilibrium height, maximum height) change because the equilibrium position shifts when effective gravity disappears. The answer is B.`,
  },
  {
    n: 19, correct: 'D',
    statement: `A 1,500 Watt motor is used to pump water a vertical height of 2.0 meters out of a flooded basement through a cylindrical pipe. The water is ejected through the end of the pipe at a speed of 2.5 m/s. Ignoring friction and assuming that all of the energy of the motor goes to the water, which of the following is the closest to the radius of the pipe? The density of water is $$\\rho = 1000$$ kg/m$$^3$$.`,
    choices: {
      A: '1/3 cm',
      B: '1 cm',
      C: '3 cm',
      D: '10 cm',
      E: '30 cm',
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid dynamics', 'energy conservation', 'continuity equation'],
    solution: `Consider a volume $$V$$ of water pumped in time $$\\Delta t$$, with mass $$m = \\rho V = \\rho \\pi r^2 v \\Delta t$$. The motor does work equal to kinetic energy plus potential energy gained:

$$P\\Delta t = mgh + \\frac{mv^2}{2} = \\rho \\pi r^2 v \\Delta t \\left(gh + \\frac{v^2}{2}\\right).$$

Solving for $$r$$:

$$r = \\sqrt{\\frac{P}{\\rho \\pi v \\left(gh + \\frac{v^2}{2}\\right)}}.$$

Substituting $$P = 1500$$ W, $$\\rho = 1000$$ kg/m$$^3$$, $$v = 2.5$$ m/s, $$h = 2.0$$ m, $$g = 10$$ m/s$$^2$$:

$$gh + \\frac{v^2}{2} = 20 + 3.125 = 23.125 \\text{ m}^2/\\text{s}^2,$$

$$r = \\sqrt{\\frac{1500}{1000 \\cdot \\pi \\cdot 2.5 \\cdot 23.125}} \\approx \\sqrt{0.00826} \\approx 0.091 \\text{ m} \\approx 9.1 \\text{ cm.}$$

The closest answer is D (10 cm).`,
  },
  {
    n: 20, correct: 'E',
    statement: `A container of water is sitting on a scale. Originally, the scale reads $$M_1 = 45$$ kg. A block of wood is suspended from a second scale; originally the scale read $$M_2 = 12$$ kg. The density of wood is 0.60 g/cm$$^3$$; the density of the water is 1.00 g/cm$$^3$$. The block of wood is lowered into the water until half of the block is beneath the surface. What is the resulting reading on the scales?`,
    choices: {
      A: '$$M_1 = 45$$ kg and $$M_2 = 2$$ kg',
      B: '$$M_1 = 45$$ kg and $$M_2 = 6$$ kg',
      C: '$$M_1 = 45$$ kg and $$M_2 = 10$$ kg',
      D: '$$M_1 = 55$$ kg and $$M_2 = 6$$ kg',
      E: '$$M_1 = 55$$ kg and $$M_2 = 2$$ kg',
    },
    figures: [F12(20)], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `The buoyant force equals the weight of displaced water. With wood density $$\\rho = 0.60$$ g/cm$$^3$$, water density $$\\rho_0 = 1.00$$ g/cm$$^3$$, wood mass $$M_2 = 12$$ kg, and volume $$V = M_2/\\rho$$, the buoyancy when half-submerged is

$$B = \\rho_0 \\cdot \\frac{V}{2} \\cdot g = \\rho_0 \\cdot \\frac{M_2}{2\\rho} \\cdot g.$$

The mass equivalent of buoyancy is

$$\\Delta M = \\frac{B}{g} = \\frac{\\rho_0 M_2}{2\\rho} = \\frac{1.00 \\times 12}{2 \\times 0.60} = 10 \\text{ kg.}$$

This buoyant force pushes up on the block (reducing the upper scale reading by 10 kg) and pushes down on the water (increasing the lower scale by 10 kg):

$$M_1 = 45 + 10 = 55 \\text{ kg}, \\qquad M_2 = 12 - 10 = 2 \\text{ kg.}$$

The answer is E.`,
  },
  {
    n: 21, correct: 'C',
    statement: `A spring system is set up as follows: a platform with a weight of 10 N is on top of two springs, each with spring constant 75 N/m. On top of the platform is a third spring with spring constant 75 N/m. If a ball with a weight of 5.0 N is then fastened to the top of the third spring and then slowly lowered, by how much does the height of the spring system change?`,
    choices: {
      A: '0.033 m',
      B: '0.067 m',
      C: '0.100 m',
      D: '0.133 m',
      E: '0.600 m',
    },
    figures: [F12(21)], topics: ['Mechanics'], tags: ['springs'],
    solution: `The weight of the platform (10 N) is already supported by the two bottom springs before the ball is added; it does not affect the additional compression. We treat the three springs as an equivalent single spring.

The two bottom springs (each $$k = 75$$ N/m) act in parallel when supporting the platform, giving $$k_{\\text{bottom}} = 150$$ N/m. The top spring ($$k = 75$$ N/m) is in series with this combination, so the equivalent spring constant is

$$\\frac{1}{k'} = \\frac{1}{75} + \\frac{1}{150} = \\frac{2+1}{150} = \\frac{3}{150} \\implies k' = \\frac{150}{3} = 50 \\text{ N/m.}$$

Wait — let us be more careful. The ball is added to the top spring. The top spring compresses by $$W/k_{\\text{top}} = 5/75$$. The force of 5 N is then transmitted to the platform, and from there to the two bottom springs in parallel (effective $$k = 150$$ N/m), compressing them by $$5/150$$.

Total change in height:

$$\\Delta x = \\frac{W}{k_{\\text{top}}} + \\frac{W}{2k} = \\frac{5}{75} + \\frac{5}{150} = \\frac{1}{15} + \\frac{1}{30} = \\frac{2}{30} + \\frac{1}{30} = \\frac{3}{30} = 0.100 \\text{ m.}$$

The answer is C.`,
  },
  {
    n: 22, correct: 'A',
    statement: `The softest audible sound has an intensity of $$I_0 = 10^{-12}$$ W/m$$^2$$. In terms of the fundamental units of kilograms, meters, and seconds, this is equivalent to`,
    choices: {
      A: '$$I_0 = 10^{-12}$$ kg/s$$^3$$',
      B: '$$I_0 = 10^{-12}$$ kg/s',
      C: '$$I_0 = 10^{-12}$$ kg$$^2$$m/s',
      D: '$$I_0 = 10^{-12}$$ kg$$^2$$m/s$$^2$$',
      E: '$$I_0 = 10^{-12}$$ kg/(m$$\\cdot$$s$$^3$$)',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'units'],
    solution: `Power has units W = J/s = kg$$\\cdot$$m$$^2$$/s$$^3$$. Intensity is power per area:

$$[I] = \\frac{\\text{W}}{\\text{m}^2} = \\frac{\\text{kg}\\cdot\\text{m}^2/\\text{s}^3}{\\text{m}^2} = \\frac{\\text{kg}}{\\text{s}^3}.$$

Therefore $$I_0 = 10^{-12}$$ kg/s$$^3$$, and the answer is A.`,
  },
  {
    n: 23, correct: 'C',
    statement: `Which of the following sets of equipment __cannot__ be used to measure the local value of the acceleration due to gravity ($$g$$)?`,
    choices: {
      A: 'A spring scale (which reads in force units) and a known mass.',
      B: 'A rod of known length, an unknown mass, and a stopwatch.',
      C: 'An inclined plane of known inclination, several carts of different known masses, and a stopwatch.',
      D: 'A launcher which launches projectiles at a known speed, a projectile of known mass, and a meter stick.',
      E: 'A motor with a known output power, a known mass, a piece of string of unknown length, and a stopwatch.',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'equations of motion'],
    solution: `(A) With the scale reading $$W$$ and known mass $$m$$: $$g = W/m$$. Works.

(B) A rod of known length swung as a physical pendulum (or, if massless, as a simple pendulum with the unknown mass): the period formula involves $$g$$ and $$L$$, both known or measurable. Works.

(C) The time for a cart to roll down an incline gives the acceleration $$a = g\\sin\\theta$$, so $$g = a/\\sin\\theta$$. However, to find $$a$$ we need both the distance traveled and the time — but no means of measuring distance is provided. The cart masses are irrelevant. This equipment gives no value for $$g$$.

(D) Launch the projectile straight up; measure maximum height $$h$$ with the meter stick. Then $$v^2 = 2gh$$ gives $$g = v^2/(2h)$$. Works.

(E) Use the motor to lift the mass through the (unknown) string length $$L$$ in time $$T_1$$: $$PT_1 = mgL$$. Then drop the mass and measure fall time $$T_2$$: $$L = gT_2^2/2$$. Combining yields $$g$$. Works.

The answer is C.`,
  },
  {
    n: 24, correct: 'C',
    statement: `Three point masses $$m$$ are attached together by identical springs. When placed at rest on a horizontal surface the masses form a triangle with side length $$l$$. When the assembly is rotated about its center at angular velocity $$\\omega$$, the masses form a triangle with side length $$2l$$. What is the spring constant $$k$$ of the springs?`,
    choices: {
      A: '$$2m\\omega^2$$',
      B: '$$\\dfrac{2}{\\sqrt{3}}m\\omega^2$$',
      C: '$$\\dfrac{2}{3}m\\omega^2$$',
      D: '$$\\dfrac{1}{\\sqrt{3}}m\\omega^2$$',
      E: '$$\\dfrac{1}{3}m\\omega^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'springs', 'statics/equilibrium'],
    solution: `When rotating, each mass travels in a circle of radius $$R$$ equal to the distance from the center to a vertex of the triangle. For side length $$2l$$:

$$R = \\frac{2l}{\\sqrt{3}}.$$

The centrifugal force on each mass is $$F_c = m\\omega^2 R$$. Each mass is connected to two springs; by symmetry we need the component of the two spring forces along the radius. For the spring between two adjacent masses, the component pulling a given mass inward along its radius is $$F\\cos 30^\\circ$$, and two springs contribute, giving

$$2F\\cos 30^\\circ = F_c \\implies F = \\frac{F_c}{\\sqrt{3}} = \\frac{m\\omega^2 R}{\\sqrt{3}}.$$

The spring is stretched from $$l$$ to $$2l$$, so extension is $$l$$. The spring force equals

$$k \\cdot l = \\frac{m\\omega^2 R}{\\sqrt{3}} = \\frac{m\\omega^2 \\cdot \\frac{2l}{\\sqrt{3}}}{\\sqrt{3}} = \\frac{2m\\omega^2 l}{3}.$$

Cancelling $$l$$:

$$k = \\frac{2m\\omega^2}{3}.$$

The answer is C.`,
  },
  {
    n: 25, correct: 'C',
    statement: `Consider the two orbits around the sun shown below. Orbit P is circular with radius $$R$$, orbit Q is elliptical such that the farthest point $$b$$ is between $$2R$$ and $$3R$$, and the nearest point $$a$$ is between $$R/3$$ and $$R/2$$. Consider the magnitudes of the velocity of the circular orbit $$v_c$$, the velocity of the comet in the elliptical orbit at the farthest point $$v_b$$, and the velocity of the comet in the elliptical orbit at the nearest point $$v_a$$. Which of the following rankings is correct?`,
    choices: {
      A: '$$v_b > v_c > 2v_a$$',
      B: '$$2v_c > v_b > v_a$$',
      C: '$$10v_b > v_a > v_c$$',
      D: '$$v_c > v_a > 4v_b$$',
      E: '$$2v_a > \\sqrt{2}\\,v_b > v_c$$',
    },
    figures: [F12(25)], topics: ['Mechanics'], tags: ['kepler\'s laws', 'angular momentum conservation', 'energy conservation', 'gravitation'],
    solution: `We eliminate the wrong answers using conservation of angular momentum and energy.

From angular momentum conservation, $$v_b r_b = v_a r_a$$, so $$v_b < v_a$$ (since $$r_b > r_a$$). This eliminates A and B (both require $$v_b > v_a$$).

For the circular orbit at radius $$R$$, $$v_c^2 = GM/R$$. Since $$r_a < R$$, a mass at $$r_a$$ on a circular orbit would have speed $$> v_c$$. Point $$a$$ is the perihelion of an ellipse, so $$v_a$$ is even greater than the circular speed at $$r_a$$. Therefore $$v_a > v_c$$, which eliminates D.

For E: using conservation of angular momentum with $$r_a = kR$$ (where $$k \\in (1/3, 1/2)$$) and $$r_b = KR$$ (where $$K \\in (2, 3)$$): $$v_a = (K/k)v_b$$, so the factor $$K/k$$ is between 4 and 9, meaning $$v_a > 4v_b$$. Also, using energy conservation one can show $$v_c > \\sqrt{2}\\,v_b$$, so E is wrong.

The only remaining answer is C ($$10v_b > v_a > v_c$$), which is consistent with all constraints: $$v_a > v_c$$ (shown above) and $$v_a < 9v_b < 10v_b$$. The answer is C.`,
  },
]
