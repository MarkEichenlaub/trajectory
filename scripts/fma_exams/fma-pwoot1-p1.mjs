// Digitized PhysicsWOOT 1 Practice F=ma Exam 1. Source: AoPS crypt collection 175, document 9207.
//
// Answer key: B D C C B A B D A C D D A B D C E C E A E A D B E
//
// Correct-answer convention: unlike the AAPT exams, this source almost never
// boxes a bare letter. Instead the official solution boxes the answer VALUE
// (e.g. "2.07 m/s", "\dfrac{A}{2\sqrt2}"), which was matched against the five
// \item choices (item 1 = A, ... item 5 = E). Only Q21 boxes a letter directly.
// Three questions (Q7, Q19, Q25) have no \boxed at all and were resolved from
// the solution's concluding prose; see the // why: notes on those lines.
//
// Source oddities found while digitizing (all cosmetic; none change an answer):
//   Q3: the solution writes "We have $v_f = 83.3$" but the problem statement and
//       every later number use 88.3 m/s. 88.3 is the one that reproduces the
//       boxed a = 2.856 m/s^2 and F = 199.9 kN, so 83.3 is a typo in the source.
//       Statement text below preserves the correct 88.3.
//   Q5: the solution's angular-momentum line uses 0.8*cos(30 deg) as the moment
//       arm of the arrow. With the door open at 30 degrees that is the geometry
//       implied by the figure; the boxed 4.0 s reproduces exactly.
//   Q12: choice C is typeset "$\dfrac 2{mv}{l}$" in the source, which renders as
//       2/(mv) followed by l -- almost certainly meant to be 2mv/l. Reproduced
//       here as the evidently-intended $$\dfrac{2mv}{l}$$; it is a distractor.
//   Q13: solution reads "there are so forces" (typo for "no forces").
//   Q14: the solution has three \begin{center} blocks but only two {{FIGURE}}
//       markers -- the third block is empty in the source, so only two solution
//       figures exist.
//   Q19: statement says "as a consequence of the above facts" but no preceding
//       facts are given in this problem; it appears to reference material the
//       original document listed elsewhere. Left as-is.
//   Q25: written in 2019-future tense ("In May 2019, it is expected that...").
//       Left as-is since it is the original wording.

const FIG = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-pwoot1-p1/fma-pwoot1-p1-${n}.png`

export const examId = 'fma-pwoot1-p1'
export const questions = [
  {
    n: 1, correct: 'B',
    statement: `The acceleration vs time graph for an object starting at rest is shown below. What is the speed of the object after 5 seconds?`,
    choices: {
      A: '$$0\\;\\mathrm{m/s}$$',
      B: '$$2.07 \\;\\mathrm{m/s}$$',
      C: '$$3.64\\;\\mathrm{m/s}$$',
      D: '$$4.07\\;\\mathrm{m/s}$$',
      E: '$$5.64 \\;\\mathrm{m/s}$$',
    },
    figures: [FIG('q01-q1')],
    topics: ['Mechanics'],
    tags: ['kinematics-1d', 'graph interpretation', 'integration'],
    solution: `If we have the graph of the acceleration of an object, we can find its change in velocity by taking the integral of the function shown. We can do this by adding the area under the line (or subtracting if the area is below the $$t$$-axis).

The first part of the integral is a 1$$\\times$$1 square, so it has an area of 1. The next part is a right triangle with both legs equal to 1, so its area is $$\\frac 12$$. The next part is a right triangle underneath the $$t$$-axis, so it contributes $$-1$$ to the total. Finally, the last area is a semicircle with radius 1, contributing $$\\frac{\\pi}{2}$$ to the area. In total, we have $$\\frac {1+\\pi}{2} = 2.07$$, so the final speed of the object is $$2.07\\; \\mathrm{m/s}$$.`,
  },
  {
    n: 2, correct: 'D',
    statement: `A massless spring is connected to the stationary floor and to a massive box. The angular frequency of oscillations of the box is $$\\omega$$. The spring is cut in half and each half is connected to both the floor and the box. What is the new angular frequency of oscillations of the box?`,
    choices: {
      A: '$$\\dfrac{\\omega}{2}$$',
      B: '$$\\omega$$',
      C: '$$\\sqrt{2}\\omega$$',
      D: '$$2\\omega$$',
      E: '$$4 \\omega$$',
    },
    figures: [FIG('q02-q1')],
    topics: ['Mechanics'],
    tags: ['oscillations', 'springs', 'scaling'],
    solution: `Suppose you stretch a spring some distance. Then each half of the spring stretches half the distance. But the full tension is felt by each half spring. Each half spring stretches half as much as the entire spring for a given tension. This means the spring constant of a half-spring is double the spring constant of the full spring.

There are two half-springs connected to the box in the second scenario, so the effective spring constant is four times as high as in the first scenario. From $$\\omega = \\sqrt{\\dfrac{k}{m}}$$ we see that this leads to doubling omega, so the answer is $$2\\omega$$.`,
  },
  {
    n: 3, correct: 'C',
    statement: `A plane with a mass of $$70\\,000\\; \\mathrm{kg}$$ has a takeoff speed of $$88.3\\; \\mathrm{m/s}$$ and requires $$1365 \\;\\mathrm{m}$$ to reach that speed. How much thrust do its engines put out, assuming the thrust is constant? Assume negligible rolling friction and drag.`,
    choices: {
      A: '$$2.856 \\; \\mathrm{kN}$$',
      B: '$$99.95\\; \\mathrm{kN}$$',
      C: '$$199.9 \\;\\mathrm{kN}$$',
      D: '$$326.2 \\;\\mathrm{kN}$$',
      E: '$$399.8 \\;\\mathrm{kN}$$',
    },
    topics: ['Mechanics'],
    tags: ['kinematics-1d', "newton's laws", 'estimation'],
    solution: `We know the plane's final velocity, and the distance it has to travel to reach that velocity, so we can use kinematics to find the acceleration.

$$v_f^2= 2a\\Delta x$$

We have $$v_f = 88.3$$ and $$\\Delta x = 1365$$, which gives us

$$7796.89 = 2730a$$

Solving for $$a$$, we find that the acceleration that the plane undergoes while taking off is 2.856 m/s$$^2$$.

Finally, we multiply by the mass of the plane to get the force exerted by its engines. We have $$F = ma = 70{,}000 \\cdot 2.856 = 199920 = 199.9 \\; \\mathrm{kN}$$.`,
  },
  {
    n: 4, correct: 'C',
    statement: `Two planets orbit a star in circular orbits. The masses of the planets are the same. The planet with a larger orbital radius has:`,
    choices: {
      A: 'more kinetic energy, less total energy, less angular momentum',
      B: 'more kinetic energy, more total energy, more angular momentum',
      C: 'less kinetic energy, more total energy, more angular momentum',
      D: 'less kinetic energy, more total energy, less angular momentum',
      E: 'less kinetic energy, less total energy, more angular momentum',
    },
    topics: ['Mechanics'],
    tags: ['gravitation', 'orbits', 'energy', 'angular momentum'],
    solution: `Kepler's third law tells us $$\\omega \\propto r^{-3/2}$$. That means the velocity is $$\\omega r \\propto r^{-1/2}$$, so the planet further out moves slower. That means it has less kinetic energy.

In class, we discussed the virial theorem that the total energy is $$-1$$ times the kinetic energy, so the planet further out has more total energy.

Finally, angular momentum is proportional to the velocity and the distance from the sun, so $$\\omega r^2 \\propto r^{1/2}$$ and the further-out planet has more angular momentum.`,
  },
  {
    n: 5, correct: 'B',
    statement: `A $$20\\, \\mathrm{g}$$ arrow is fired at the left side of a $$0.8 \\; \\mathrm{m}$$ wide, uniform wooden door with mass of $$5 \\, \\mathrm{kg}$$ at a speed of $$50 \\, \\mathrm{m/s}$$. On impact, the arrow embeds itself in the door, and the door begins to swing frictionlessly around the hinge on its right side. If the door was initially open at an angle of 30$$^\\circ$$, how long will it take to collide with the wall it is framed in?`,
    choices: {
      A: '$$2.3 \\;\\mathrm{s}$$',
      B: '$$4.0 \\;\\mathrm{s}$$',
      C: '$$15.2 \\;\\mathrm{s}$$',
      D: '$$22.9 \\;\\mathrm{s}$$',
      E: '$$38.0 \\;\\mathrm{s}$$',
    },
    figures: [FIG('q05-q1')],
    topics: ['Mechanics'],
    tags: ['angular momentum', 'collisions', 'rotational dynamics'],
    solution: `The angular momentum of the arrow about the pivot of the door is $$0.02 \\;\\mathrm{kg} \\cdot 50\\;\\mathrm{m/s}\\cdot 0.8 \\cos(30^\\circ) \\;\\mathrm{m} = 0.693 \\;\\mathrm{kg\\, m^2 s^{-1}}$$.

The moment of inertia of the door is $$\\dfrac{1}{3} 5\\;\\mathrm{kg} \\cdot (0.8 \\;\\mathrm{m})^2 = 1.067 \\; \\mathrm{kg\\, m^2}$$. The mass of the arrow is $$\\frac{1}{250}$$ the mass of the door, so we will ignore it.

The angular velocity of the door is $$\\omega = \\dfrac{L}{I} = 0.65 \\;\\mathrm{s^{-1}}$$. The time for the door to open is $$\\dfrac{5\\pi}{6\\omega} = 4.0 \\;\\mathrm{s}$$.`,
  },
  {
    n: 6, correct: 'A',
    statement: `A sphere of mass $$m$$ and radius $$r$$ has a non-uniform but spherically-symmetric mass distribution, so that its moment of inertia is $$c\\cdot m r^2$$. The sphere is placed on a slope with angle $$\\theta$$ to the horizontal and released from rest. What is the minimum coefficient of static friction $$\\mu$$ so that the sphere rolls without slipping?`,
    choices: {
      A: '$$\\tan\\theta \\left(\\dfrac{c}{c+1}\\right)$$',
      B: '$$\\tan\\theta \\left(\\dfrac{c}{c + 2}\\right)$$',
      C: '$$\\tan\\theta$$',
      D: '$$\\sin\\theta \\left(\\dfrac{c}{c+1}\\right)$$',
      E: '$$\\sin\\theta \\left(\\dfrac{c}{c + 2}\\right)$$',
    },
    topics: ['Mechanics'],
    tags: ['rolling without slipping', 'friction', 'moment of inertia'],
    solution: `When rolling at speed $$v$$, the energy associated with motion of the center of mass is $$\\dfrac12 mv^2$$ and the energy associated with rotation is $$\\dfrac12 cmv^2$$. At a given position on the incline, the energy associated with the motion of the center of mass of the rolling ball is therefore $$\\dfrac{1}{1+c}$$ what it would be on a frictionless plane, due to energy conservation.

The sphere can be thought of as experiencing a force $$mg\\sin\\theta$$ down the plane and a friction force $$f$$ up the plane. Then $$mg\\sin\\theta - f$$ must be a fraction $$\\dfrac{1}{1+c}$$ of $$mg\\sin\\theta$$ so that the motion of the center of mass of the sphere only picks up that same fraction of the energy it would in the frictionless case. This implies $$f = \\dfrac{c}{1+c}mg\\sin\\theta$$.

If the sphere is right on the verge of slipping, then $$f = \\mu N = \\mu mg\\cos\\theta$$. Equating these gives

$$\\mu = \\tan\\theta\\left(\\dfrac{c}{c+1}\\right)$$`,
  },
  {
    n: 7, correct: 'B', // why: no \boxed in the solution; concluding prose says the near-atmospheric-pressure case is realistic, i.e. buoyancy nearly (but not exactly) cancels the added air, so the reading is just above 4.00 g
    statement: `An empty balloon is placed on a scale, and the scale reads $$4.00 \\; \\mathrm{g}$$. The balloon is inflated by mouth with $$8.00 \\; \\mathrm{g}$$ of air, tied shut, and returned to the scale. Which of the following best describes the new reading on the scale?

Atmospheric pressure is approximately $$100 \\; \\mathrm{kPa}$$, and a typical person's lungs can exert approximately $$10 \\; \\mathrm{kPa}$$ of pressure at maximum. Assume the air in the balloon has identical composition and temperature to the atmosphere.`,
    choices: {
      A: '$$4.00 \\; \\mathrm{g}$$',
      B: 'Slightly more than $$4.00 \\; \\mathrm{g}$$',
      C: 'Slightly less than $$12.00 \\; \\mathrm{g}$$',
      D: '$$12.00 \\; \\mathrm{g}$$',
      E: 'Slightly more than $$12.00 \\; \\mathrm{g}$$',
    },
    topics: ['Mechanics'],
    tags: ['buoyancy', 'fluids', 'pressure'],
    solution: `This problem is mostly about the buoyancy of the inflated balloon, but one must remember that due to the elasticity of the balloon the air inside is at a higher pressure than the atmosphere.

On one extreme, if air in the balloon is at a very high pressure, its volume and hence the buoyant force is small. In this case the reading on the scale is near the total mass of the inflated balloon, $$12.00 \\; \\mathrm{g}$$.

On the other extreme, if the air in the balloon is close to atmospheric pressure, its density is close to that of the atmosphere. In this case the balloon displaces a weight of atmosphere close to the weight of the contained air, and the buoyant force nearly cancels the weight of the added air. The reading on the scale is near the original reading, $$4.00 \\; \\mathrm{g}$$.

The pressure in the balloon is at most the pressure used to inflate it, which we are told is small (but not negligible) compared to atmospheric pressure. Therefore the second case is the realistic one: the scale reads slightly more than $$4.00 \\; \\mathrm{g}$$.`,
  },
  {
    n: 8, correct: 'D',
    statement: `Ignore gravity in this problem. A ball with a spring attached collides with a wall. The spring is massless. When the spring impacts the wall, it sticks to the wall. After the impact, the ball oscillates with frequency $$f$$ and amplitude $$A$$. If the initial velocity were the same but the spring instead collided with a stationary ball identical to the ball already attached to the other side of the spring, what would the frequency of oscillations of a single ball be, as viewed in the center-of-mass frame of the ball-spring-ball system?`,
    choices: {
      A: '$$\\dfrac{f}{2}$$',
      B: '$$\\dfrac{f}{\\sqrt{2}}$$',
      C: '$$f$$',
      D: '$$\\sqrt{2} f$$',
      E: '$$2f$$',
    },
    figures: [FIG('q08-q1')],
    topics: ['Mechanics'],
    tags: ['oscillations', 'reduced mass', 'springs'],
    solution: `We can apply the formula $$\\omega = \\sqrt{\\dfrac{k}{m_{\\text{reduced}}}}$$ using the reduced mass $$\\dfrac{m_1m_2}{m_1+m_2} = \\dfrac12 m$$. So the oscillations are the same frequency as for the wall, except the mass is cut in half. The new frequency is therefore $$f\\sqrt{2}$$.`,
  },
  {
    n: 9, correct: 'A',
    statement: `In the previous problem, what would the amplitude of oscillations of a single ball be in the ball-spring-ball system?`,
    choices: {
      A: '$$\\dfrac{A}{2\\sqrt{2}}$$',
      B: '$$\\dfrac{A}{2}$$',
      C: '$$\\dfrac{A}{\\sqrt{2}}$$',
      D: '$$A$$',
      E: '$$\\sqrt{2}A$$',
    },
    topics: ['Mechanics'],
    tags: ['oscillations', 'energy', 'center of mass'],
    solution: `The center of mass frame has the balls initially approach at the same speed, so that speed is half the speed when approaching the stationary wall. With half the speed, any individual ball has $$\\dfrac14$$ the energy.

Additionally, the ball can be thought of as connected to a half-spring that is stationary, so the spring constant is twice as great as in the wall scenario.

The energy of an oscillator is $$\\dfrac12 kA^2$$. Since in this scenario the energy is $$\\dfrac14$$ as much but $$k$$ is twice as much, we must have $$\\dfrac{A}{2\\sqrt{2}}$$ for the amplitude.`,
  },
  {
    n: 10, correct: 'C',
    statement: `A solid disk is placed on an incline. It rolls down without slipping. Then a "wheel" is placed on the incline. A wheel consists of a rim with mass $$m_r$$, massless spokes, and a central hub of mass $$m_h$$ but of negligible radius. If the wheel rolls down the incline without slipping in the same amount of time as the solid disk, what is the ratio of the mass of the hub to the mass of the rim, $$\\dfrac{m_h}{m_r}$$?`,
    choices: {
      A: '$$\\dfrac{1}{3}$$',
      B: '$$\\dfrac{1}{2}$$',
      C: '$$1$$',
      D: '$$2$$',
      E: '$$3$$',
    },
    topics: ['Mechanics'],
    tags: ['moment of inertia', 'rolling without slipping', 'inclined planes'],
    solution: `The solid disk and the wheel must have the same coefficient in front of their moment of inertia. For the disk, $$I = \\dfrac12 mr^2$$.

For the wheel, the central hub mass doesn't contribute to the moment of inertia, while the moment of inertia of a hoop is $$mr^2$$. The hub and rim must have equal mass so the moment of inertia is $$\\dfrac12 mr^2$$ overall. The ratio is $$1$$.`,
  },
  {
    n: 11, correct: 'D',
    statement: `Suppose a particle travels along a one-dimensional track. Its velocity at each point along the track is represented in the plot below. Where was the net force on the particle greatest?`,
    choices: {
      A: 'at point $$A$$',
      B: 'between points $$A$$ and $$B$$',
      C: 'at point $$B$$',
      D: 'between points $$B$$ and $$C$$',
      E: 'at point $$C$$',
    },
    figures: [FIG('q11-q1')],
    topics: ['Mechanics'],
    tags: ['graph interpretation', 'kinematics-1d', "newton's laws"],
    solution: `Point $$B$$ is where the slope of the line is steepest. However, this is a $$v$$ vs $$x$$ plot. $$B$$ is the point where the particle picks up the most speed per centimeter. But we want the particle to pick up the most speed per second.

The faster the particle moves, the faster it gets to locations with higher velocities. So if we go a little bit beyond $$B$$, the particle will be moving faster, resulting in greater acceleration. The change in speed per unit distance does go down slightly, but not to first order because $$B$$ is a maximum of this value.

To be more explicit, the acceleration is $$a = v \\dfrac{\\mathrm{d}v}{\\mathrm{d}x}$$. The maximum occurs when $$\\dfrac{\\mathrm{d}a}{\\mathrm{d}x} = 0$$. This means $$0 = \\left(\\dfrac{\\mathrm{d}v}{\\mathrm{d}x}\\right)^2 + v \\dfrac{\\mathrm{d}^2v}{\\mathrm{d}x^2}$$.

The first term is always positive, so the second term must be negative. $$v$$ is never negative, so the graph must be curving down at the point where the acceleration is maximum. This occurs between $$B$$ and $$C$$.`,
  },
  {
    n: 12, correct: 'D',
    statement: `Two balls, each of mass $$m$$, move in opposite directions at speed $$v$$. They simultaneously strike either end of a uniform stick of mass $$M$$ and length $$l$$. The balls stick to the stick. What is the angular frequency of the rotation of the stick after the collision?`,
    choices: {
      A: '$$0$$',
      B: '$$\\dfrac{mv}{l}$$',
      C: '$$\\dfrac{2mv}{l}$$',
      D: '$$\\dfrac{mv}{l} \\dfrac{12}{M + 6m}$$',
      E: '$$\\dfrac{mv}{l} \\dfrac{24}{M + 12m}$$',
    },
    figures: [FIG('q12-q1')],
    topics: ['Mechanics'],
    tags: ['angular momentum', 'collisions', 'moment of inertia'],
    solution: `The angular momentum of the balls about the center of the stick is $$2 mv \\dfrac{l}{2} = mvl$$.

The moment of inertia of the balls plus stick, again about the center of the stick, is $$\\dfrac{1}{12} M l^2 + 2m \\left(\\dfrac{l}{2}\\right)^2 = l^2\\left(\\dfrac{1}{12} M + \\dfrac12 m\\right)$$.

The angular frequency is

$$\\omega = \\dfrac{L}{I} = \\dfrac{mv}{l} \\dfrac{12}{M + 6m}$$`,
  },
  {
    n: 13, correct: 'A',
    statement: `A rod of length $$l$$ sits above a frictionless horizontal surface, angled at $$\\theta$$ with one side touching the surface. The rod is released. How far does the center of mass of the rod move in the horizontal direction before the rod impacts the surface?`,
    choices: {
      A: '$$0$$',
      B: '$$\\dfrac12 \\cos\\theta \\, l$$',
      C: '$$\\dfrac12 (1 - \\cos\\theta)l$$',
      D: '$$\\dfrac12 l$$',
      E: '$$\\dfrac12 (1 - \\sin\\theta) l$$',
    },
    figures: [FIG('q13-q1')],
    topics: ['Mechanics'],
    tags: ['center of mass', 'rigid body dynamics', 'conservation laws'],
    solution: `The surface is frictionless, so there are no forces in the horizontal direction, so the center of mass can't move in the horizontal direction. The answer is $$0$$.`,
  },
  {
    n: 14, correct: 'B',
    statement: `A construction worker needs to raise the ceiling of a building slightly in order to install equipment. To do this, the worker selects a steel rod, places it against the corner of the building, and pushes horizontally on the bottom, as shown in the diagram.

The ceiling has a height of $$250 \\; \\mathrm{cm}$$, and rods of length $$255 \\; \\mathrm{cm}$$ and $$270 \\; \\mathrm{cm}$$ are available. A vertical force of $$20.0 \\; \\mathrm{kN}$$ (approximately two tons) is required to lift the ceiling. Which rod should the worker select to minimize the horizontal force required, and what is that minimum force? Ignore friction.`,
    choices: {
      A: 'The $$255 \\; \\mathrm{cm}$$ rod; $$3.94 \\; \\mathrm{kN}$$',
      B: 'The $$255 \\; \\mathrm{cm}$$ rod; $$4.02 \\; \\mathrm{kN}$$',
      C: 'The $$255 \\; \\mathrm{cm}$$ rod; $$19.6 \\; \\mathrm{kN}$$',
      D: 'The $$270 \\; \\mathrm{cm}$$ rod; $$8.16 \\; \\mathrm{kN}$$',
      E: 'The $$270 \\; \\mathrm{cm}$$ rod; $$18.5 \\; \\mathrm{kN}$$',
    },
    figures: [FIG('q14-q1')],
    solutionFigures: [FIG('q14-s1'), FIG('q14-s2')],
    topics: ['Mechanics'],
    tags: ['statics', 'torque', 'free-body diagrams'],
    solution: `As shown in the free body diagram, four forces act on the rod: the horizontal force due to the worker, the desired vertical force due to the ceiling, a horizontal force due to the wall, and a vertical force due to the floor.

We can assume the worker pushes slowly enough that any acceleration of the rod is small. Therefore the net force on the rod is zero, so the desired vertical force on the ceiling equals the vertical force due to the floor. The net torque on the rod is also zero about any point; using the point of contact with the ceiling, we see that the two forces acting at the floor must sum along the line of the rod.

The ratio of the horizontal force $$F_h$$ to the vertical force $$F_v$$ is thus minimized when the length of the rod is close to the height of the ceiling. Quantitatively, if the height of the ceiling is $$h$$ and the length of the rod is $$l$$, we have from similar triangles

$$\\frac{F_h}{F_v} = \\frac{\\sqrt{l^2 - h^2}}{h} = \\sqrt{\\left(\\frac{l}{h}\\right)^2 - 1}.$$

Plugging in $$l = 255 \\;\\mathrm{cm}$$, $$h = 250 \\;\\mathrm{cm}$$, and $$F_v = 20.0 \\;\\mathrm{kN}$$, we find $$F_h = 4.02 \\;\\mathrm{kN}$$.`,
  },
  {
    n: 15, correct: 'D',
    statement: `A cylinder of radius $$r$$ floats upright in a cylindrical container with inner radius $$2r$$. The fluid has density $$\\rho$$ and gravitational acceleration is $$g$$. How much force must be applied to the top of the cylinder so that it sinks a small distance $$x$$ below its original position?`,
    choices: {
      A: '$$\\dfrac45 \\pi r^2 x \\rho g$$',
      B: '$$\\dfrac34 \\pi r^2 x \\rho g$$',
      C: '$$\\pi r^2 x \\rho g$$',
      D: '$$\\dfrac43 \\pi r^2 x \\rho g$$',
      E: '$$\\dfrac54 \\pi r^2 x \\rho g$$',
    },
    topics: ['Mechanics'],
    tags: ['buoyancy', 'fluids', 'oscillations'],
    solution: `When we push the cylinder down by a distance $$x$$, the water rises a distance $$\\dfrac{x}{3}$$. This is because the water conserves volume, and the factor of 3 is the ratio of the surface area of the water to the surface area of the cylinder.

The total distance the cylinder is below the surface of the water is $$\\dfrac43 x$$, so the answer is $$\\dfrac43 \\pi r^2 x \\rho g$$.`,
  },
  {
    n: 16, correct: 'C',
    statement: `A pipe consists of two vertical sections connected by a horizontal section of length $$x$$. The width of the pipe is small compared to the length of the sections of pipe. The pipe spins around one of the vertical sections at angular frequency $$\\omega$$. What is the difference in heights of the fluid $$\\Delta y$$ between the vertical segments of pipe?`,
    choices: {
      A: '$$\\Delta y = \\dfrac{\\sqrt{gx}}{\\omega}$$',
      B: '$$\\Delta y = \\omega \\sqrt{\\dfrac{x^3}{g}}$$',
      C: '$$\\Delta y = \\dfrac12 \\dfrac{\\omega^2}{g} x^2$$',
      D: '$$\\Delta y = \\dfrac{\\omega^2}{g} x^2$$',
      E: '$$\\Delta y = 2 \\dfrac{\\omega^2}{g} x^2$$',
    },
    figures: [FIG('q16-q1')],
    topics: ['Mechanics'],
    tags: ['fluids', 'rotating frames', 'circular motion'],
    solution: `We saw in lesson 3 that spinning a free surface of water results in a curve $$y = \\dfrac{\\omega^2 x^2}{2g}$$.

That water was in equilibrium, so inserting some pipes around pieces of it wouldn't affect anything, and once the pipes are in place, we can get rid of the surrounding water without affecting the water in the pipes, so the equation we found in class works just as well here. The answer is

$$\\Delta y = \\dfrac12 \\dfrac{\\omega^2}{g} x^2$$`,
  },
  {
    n: 17, correct: 'E',
    statement: `A solid disk of mass $$m$$ and radius $$r$$ rolls without slipping around the exterior of a fixed hoop of radius $$R$$. The disk makes one complete trip in time $$T$$. What is the kinetic energy of the disk?`,
    choices: {
      A: '$$m \\left(\\dfrac{2\\pi R}{T}\\right)^2$$',
      B: '$$\\dfrac12 m \\left(\\dfrac{2\\pi R}{T}\\right)^2$$',
      C: '$$\\dfrac34 m \\left(\\dfrac{2\\pi R}{T}\\right)^2$$',
      D: '$$\\dfrac12 m \\left(\\dfrac{2\\pi(R+r)}{T}\\right)^2$$',
      E: '$$\\dfrac34 m \\left(\\dfrac{2\\pi(R+r)}{T}\\right)^2$$',
    },
    figures: [FIG('q17-q1')],
    topics: ['Mechanics'],
    tags: ['rolling without slipping', 'energy', 'circular motion'],
    solution: `The center of mass of the disk moves on a circle of radius $$R+r$$, so its speed is $$(R+r)\\dfrac{2\\pi}{T}$$.

The moment of inertia of the disk is $$\\dfrac12 m r^2$$, so the kinetic energy associated with rotation is half that associated with translation. The total kinetic energy is therefore

$$\\dfrac34 m \\left(\\dfrac{2\\pi(R+r)}{T}\\right)^2$$`,
  },
  {
    n: 18, correct: 'C',
    statement: `A hoop is placed on a horizontal surface. The friction coefficient between the hoop and surface is $$\\mu$$. Initially, the translational velocity of the hoop is zero and the angular velocity of the hoop is $$\\omega > 0$$, so the hoop is spinning in place. Friction accelerates the hoop until it rolls without slipping at speed $$v$$. If the coefficient of friction is cut in half, what is the final speed $$v$$?`,
    choices: {
      A: '$$\\dfrac14 v$$',
      B: '$$\\dfrac12 v$$',
      C: '$$v$$',
      D: '$$2v$$',
      E: '$$4v$$',
    },
    topics: ['Mechanics'],
    tags: ['rolling without slipping', 'friction', 'angular momentum'],
    solution: `Because the hoop is spinning, it experiences a constant friction force, and its velocity increases linearly with time. It also experiences a constant torque, so its angular velocity decreases linearly with time. This goes on until $$\\omega r = v$$, at which point the hoop transitions to rolling without slipping.

If the coefficient of friction were cut in half, the acceleration would be cut in half, so it would take twice as long for the hoop to get up to the same speed. It would likewise take twice as long for $$\\omega r$$ to come down to the same speed. They would still meet at the same speed, though. So the answer is $$v$$.`,
  },
  {
    n: 19, correct: 'E', // why: no \boxed in the solution; the concluding prose says the particle is "repelled from the center of the sphere", and the symmetry argument earlier establishes the force must go to zero at (i.e. decrease towards) the center
    statement: `Consider a thin spherical shell of uniform mass density. You may know that as a consequence of the above facts the shell exerts zero net gravitational force on a particle anywhere within the shell.

If the gravitational force still obeyed the law of superposition but instead obeyed an inverse cube law, $$F \\propto m_1 m_2 r^{-3}$$, which of the following would be true?`,
    choices: {
      A: 'A particle within the shell continues to experience zero net gravitational force due to the shell.',
      B: 'A particle within the shell is attracted to its center with a force that increases towards the center.',
      C: 'A particle within the shell is attracted to its center with a force that decreases towards the center.',
      D: 'A particle within the shell is repelled from its center with a force that increases towards the center.',
      E: 'A particle within the shell is repelled from its center with a force that decreases towards the center.',
    },
    solutionFigures: [FIG('q19-s1')],
    topics: ['Mechanics'],
    tags: ['gravitation', 'shell theorem', 'symmetry'],
    solution: `It's straightforward to argue that the given answer is the most plausible one, although a rigorous proof would need to address some technical details. (Behind the scenes the author actually finds the numerical verification most straightforward.)

First, from symmetry we expect the force at the center of the shell to remain zero, so if there is a force at all it should decrease towards the center.

Now, suppose the sphere is centered at the origin and the test particle is somewhere on the positive $$x$$-axis. Divide the sphere into the larger portion to the left of the particle and the smaller portion to the right:

Under the inverse square law, we know that the net force on the particle is zero, which means the force due to the left portion must balance the force due to the right portion. This is possible because the left portion has greater mass but is also farther away from the particle on average.

Under the inverse cube law, the force decays more quickly with distance than before, so now we expect the right portion to exert a greater force than the left portion; the particle is pulled to the right, i.e. repelled from the center of the sphere.`,
  },
  {
    n: 20, correct: 'A',
    statement: `Earth rotates with angular frequency vector $$\\vec{\\omega}$$. Objects moving on Earth experience a Coriolis force $$\\vec{F}_c = -2m \\vec{\\omega}\\times \\vec{v}$$. When a ball is dropped from a tower, it falls almost straight down, but is deflected by the Coriolis force a distance $$x$$ to the East. If the ball is thrown vertically from the bottom of the tower so that it reaches the top of the tower at the apex of its flight, how much and in what direction is it deflected by the Coriolis force before it hits the ground?`,
    choices: {
      A: '$$4x$$ West',
      B: '$$2x$$ West',
      C: '$$x$$ West',
      D: '$$0$$',
      E: '$$x$$ East',
    },
    topics: ['Mechanics'],
    tags: ['rotating frames', 'coriolis force', 'projectile motion'],
    solution: `When the ball is dropped, its velocity vs time plot begins at zero and increases linearly. This is also the shape of the acceleration versus time plot in the horizontal direction. The velocity versus time plot in the horizontal direction is therefore a quadratic beginning at zero and sloping upwards. If the final velocity reached is $$v_h$$ in time $$t$$, the distance displaced is $$\\dfrac13 v_h t$$.

When the ball is thrown up, the direction of travel is reversed, so the Coriolis force pushes in the opposite direction (West). The velocity versus time plot in the vertical direction begins high and comes down to zero in a straight line, so this is what the acceleration versus time plot does in the horizontal direction. The velocity versus time plot in the horizontal direction is again a quadratic, but one that curves down rather than curving up. The displacement is $$\\dfrac23 v_h t$$.

However, on the way back down, the projectile is displaced by the same amount again, making its total displacement $$\\dfrac43 v_h t$$, so the answer is $$4x$$ West.`,
  },
  {
    n: 21, correct: 'E',
    statement: `An astronaut is on a spacewalk doing maintenance on a space station that is in a circular orbit around Earth with period $$T$$. The astronaut loses control of a wrench, which floats away from the space station in the direction directly away from Earth (in the space station's reference frame) with a small velocity. Ignore gravitational interactions between the space station and the wrench. From the astronaut's point of view, what will the wrench's motion look like?`,
    choices: {
      A: 'continue floating away in a straight line indefinitely.',
      B: 'float away, but slow down and come to rest a fixed distance from the space station.',
      C: 'float away in a straight line, but gradually slow down, change directions, and return in a time $$T$$.',
      D: 'follow a curving path and return very near to the space station in a time $$T$$.',
      E: 'follow a curving path and return very near to the space station in a time $$\\dfrac{T}{2}$$.',
    },
    topics: ['Mechanics'],
    tags: ['orbits', 'gravitation', 'rotating frames'],
    solution: `The wrench can be considered to be in orbit around the planet. Its new orbit is slightly elliptical, but follows almost the same path as the space station's orbit. The ellipse will intersect the space station's circular orbit on the other side of the orbit, so it returns in a time $$T/2$$, and the answer is E.`,
  },
  {
    n: 22, correct: 'A',
    statement: `A hoop of mass $$M$$ has a point mass $$m$$ attached to its rim. The hoop is placed on an incline of angle $$\\theta$$ with a very large coefficient of friction. What is the maximum $$m$$ such that the hoop will not ever oscillate?`,
    choices: {
      A: '$$\\dfrac{M\\sin\\theta}{1-\\sin\\theta}$$',
      B: '$$\\dfrac{M\\sin\\theta}{1-\\cos\\theta}$$',
      C: '$$\\dfrac{M\\cos\\theta}{1-\\sin\\theta}$$',
      D: '$$\\dfrac{M\\cos\\theta}{1-\\cos\\theta}$$',
      E: 'The hoop cannot oscillate regardless of $$m$$.',
    },
    figures: [FIG('q22-q1')],
    topics: ['Mechanics'],
    tags: ['torque', 'equilibrium', 'oscillations', 'rolling without slipping'],
    solution: `If there is a stable equilibrium, the hoop can oscillate about that equilibrium point.

The most torque the mass can produce (in the direction that rolls the hoop up the plane) is when the mass is at the far left hand side of the hoop. It then produces a torque of $$mgr(1-\\sin\\theta)$$ about the point of contact with the incline, with $$r$$ the radius of the hoop. The gravitational force on the hoop produces a torque of magnitude $$Mgr\\sin\\theta$$.

Setting these equal, the hoop will be in equilibrium in this position if

$$m = \\dfrac{M\\sin\\theta}{1-\\sin\\theta}$$

If the mass is any heavier than that, there's an equilibrium where the mass is a bit lower, and the hoop can potentially oscillate around that equilibrium (depending on how it's initially set up).`,
  },
  {
    n: 23, correct: 'D',
    statement: `A frictionless half-Atwood machine is set up as shown. The boxes have equal mass and the pulley is massless and frictionless. The upper mass is held in place, and the wave speed on the string is $$v$$. When the system is released, what is the wave speed in the string?`,
    choices: {
      A: 'It begins at $$v$$ and gradually decreases.',
      B: 'It begins at $$v$$ and gradually increases.',
      C: '$$v$$',
      D: '$$\\dfrac{v}{\\sqrt{2}}$$',
      E: '$$\\dfrac{v}{2}$$',
    },
    figures: [FIG('q23-q1')],
    topics: ['Mechanics'],
    tags: ['waves', 'pulleys/tension', "newton's laws"],
    solution: `The speed of a wave is $$v = \\sqrt{\\dfrac{T}{\\rho}}$$. The density doesn't change, but when the half-Atwood machine is released, the tension in the rope gets cut in half, meaning the new wave speed is $$\\dfrac{v}{\\sqrt{2}}$$.`,
  },
  {
    n: 24, correct: 'B',
    statement: `A wire is made of a material with density known to very good accuracy. The length of the wire is also known to very good accuracy. The radius of the wire is uncertain by about 2%. What is the uncertainty in the mass of the wire?`,
    choices: {
      A: 'about 2%',
      B: 'about 4%',
      C: 'about 6%',
      D: 'about 8%',
      E: 'about 10%',
    },
    topics: ['Mechanics'],
    tags: ['uncertainty', 'error propagation', 'dimensional analysis'],
    solution: `The mass of the wire is $$\\rho l \\pi r^2$$. If the radius is off by 2%, the mass is off by $$1.02^2 \\approx 1.04$$, so the answer is about 4%.`,
  },
  {
    n: 25, correct: 'E', // why: no \boxed in the solution; the prose describes the failing set as the one defining h, mu_0 and e alongside c (the fine-structure-constant obstruction). Only choice E contains all four of e, mu_0, h, c, and a dimension-matrix check confirms E is the unique linearly dependent set of the five.
    statement: `In May 2019, it is expected that the scientific community will begin using new definitions of SI units intended to improve their precision and prevent them from drifting over time. Below are some of the statements that have been or could be used to define the SI. (For brevity, we consider only the kilogram, meter, second, and coulomb; the planned update also affects the kelvin and the mole.)

__caesium frequency__: The ground state hyperfine splitting frequency of the caesium-133 atom is exactly $$9\\,192\\,631\\,770 \\; \\mathrm{s}^{-1}$$.

__fundamental charge__: The fundamental charge is exactly $$e = 1.602\\,176\\,634 \\times 10^{-19} \\; \\mathrm{C}$$.

__IPK__: The mass of the international prototype kilogram (a metal cylinder kept in France) is exactly $$1 \\; \\mathrm{kg}$$.

__magnetic constant__: The magnetic constant is exactly $$\\mu_0 = 4 \\pi \\times 10^{-7} \\; \\mathrm{kg}\\,\\mathrm{m}\\,\\mathrm{C}^{-2}$$.

__Planck constant__: Planck's constant is exactly $$h = 6.626\\,070\\,15 \\times 10^{-34} \\; \\mathrm{kg}\\,\\mathrm{m}^2\\,\\mathrm{s}^{-1}$$.

__speed of light__: The speed of light in vacuum is exactly $$299\\,792\\,458 \\; \\mathrm{m}\\,\\mathrm{s}^{-1}$$.

Which of the following combinations could __not__ be used to define the SI? (Among the choices are the actual combination in current use and the one planned for adoption in 2019.)`,
    choices: {
      A: 'caesium frequency, fundamental charge, magnetic constant, Planck constant',
      B: 'caesium frequency, fundamental charge, Planck constant, speed of light',
      C: 'caesium frequency, IPK, magnetic constant, speed of light',
      D: 'fundamental charge, IPK, magnetic constant, Planck constant',
      E: 'fundamental charge, magnetic constant, Planck constant, speed of light',
    },
    topics: ['Mechanics'],
    tags: ['dimensional analysis', 'units', 'fundamental constants'],
    solution: `It must be possible to construct each of the four base units from the chosen defined quantities. Also, the chosen defined quantities must not lead to multiple definitions of any unit. (As it happens, these properties correspond to the linear algebra concepts of span and linear independence; we know that there must be four defined quantities, and if so we always have either both properties or neither. But you don't need to know this to solve the problem.)

In the correct choice, defining $$h$$, $$\\mu_0$$, and $$e$$ leads to a defined speed

$$\\frac{\\mu_0 e^2}{h} \\approx 2.05 \\times 10^{10} \\; \\mathrm{m}\\,\\mathrm{s}^{-1} \\approx 137 \\cdot \\frac{1}{2} c$$

Therefore this set doubly defines the unit of speed (among other things), failing to produce a consistent system of units. You could also show that the meter (e.g.) cannot be defined in terms of the specified values.

The fact that $$h$$, $$\\mu_0$$, $$e$$, and $$c$$ cannot be simultaneously specified when defining a unit system is related to the existence of the fine structure constant

$$\\alpha = \\frac{\\mu_0 e^2 c}{2 h} \\approx \\frac{1}{137}$$

As $$\\alpha$$ is dimensionless, its numerical value is the same regardless of the unit system in use. Conversely, we do not know of a theoretical expression for $$\\alpha$$; its value in our universe must be determined empirically.`,
  },
]
