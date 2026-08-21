// Digitized 2014 F=ma exam questions. Sources:
// Exam: work/fma/fma-2014.pdf (text extracted to work/fma/fma-2014.txt)
// Answer key: work/fma/fma-2014-sol.pdf (←CORRECT markers)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2014.1. through 2014.25.
// Figures: work/figure_manifest.json, key "fma-2014" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions.
// Q2 note: solution PDF says "CORRECT answer is (E)" (prose, not the ←CORRECT marker
//   convention); confirmed E by book (2014.2).
// Q11 note: ←CORRECT appears after the figure block in the solution PDF with no letter
//   prefix; the solution text says "it is the descending diagonal line of slope magnitude
//   one" which is option E, confirmed by book (2014.11).

const F14 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2014/fma-2014-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2014'
export const questions = [
  {
    n: 1, correct: 'E',
    statement: `A car turning to the right is traveling at constant speed in a circle. From the driver's perspective, the angular momentum vector about the center of the circle points $$X$$ and the acceleration vector of the car points $$Y$$ where`,
    choices: {
      A: '$$X$$ is left, $$Y$$ is left.',
      B: '$$X$$ is forward, $$Y$$ is right.',
      C: '$$X$$ is down, $$Y$$ is forward.',
      D: '$$X$$ is left, $$Y$$ is right.',
      E: '$$X$$ is down, $$Y$$ is right.',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum', 'circular motion', 'vectors'],
    solution: `For uniform circular motion the acceleration is purely centripetal — directed toward the center of the circle. Since the car is turning right, the center is to the right, so $$Y$$ is "right."

For the angular momentum, we use $$\\vec{L} = \\vec{r} \\times (m\\vec{v})$$. With $$\\vec{r}$$ pointing away from the center (to the left of the driver) and $$\\vec{v}$$ pointing forward, the right-hand rule gives $$\\vec{L}$$ pointing downward. Equivalently, curl the fingers of your right hand in the direction the car travels (clockwise when viewed from above), and the thumb points down. So $$X$$ is "down."

The answer is E.`,
  },
  {
    n: 2, correct: 'E',
    statement: `A ball rolls without slipping down an inclined plane as shown in the diagram.

Which of the following vectors best represents the direction of the total force that the ball exerts on the plane?`,
    choices: {
      A: 'Arrow pointing upper-left (steep, into-plane and up-slope).',
      B: 'Arrow pointing left (horizontal).',
      C: 'Arrow pointing lower-left (out of plane and down-slope).',
      D: 'Arrow pointing left and slightly down (nearly horizontal, slight downward).',
      E: 'Arrow pointing straight down.',
    },
    figures: [F14(2)], topics: ['Mechanics'], tags: ['newton\'s laws', 'friction', 'free-body diagrams', 'rolling without slipping'],
    solution: `By Newton's third law, the force the ball exerts on the plane is equal and opposite to the net contact force the plane exerts on the ball. The plane exerts two forces on the ball: a normal force perpendicular to and into the ball (away from the plane surface), and a static friction force directed up the slope (because friction must oppose the tendency of the contact point to slip downward, and it is this friction that provides the torque causing the ball to roll).

The ball exerts on the plane: a normal force perpendicular and __into__ the plane, and a friction force directed __down__ the slope. The combination has both a component into the plane and a component down the slope.

The ball is rolling downward and accelerating, so friction must be less than the gravitational component parallel to the slope (otherwise the ball would accelerate up the slope). Only answer E has the correct combination of into-plane and down-slope. The answer is E.`,
  },
  {
    n: 3, correct: 'D',
    statement: `An object of uniform density floats partially submerged so that 20% of the object is above the water.

A 3 N force presses down on the top of the object so that the object becomes fully submerged. What is the volume of the object? The density of water is $$\\rho_{H_2O} = 1000 \\text{ kg/m}^3$$.`,
    choices: {
      A: '$$V_{\\text{object}} = 0.3 \\text{ L}$$',
      B: '$$V_{\\text{object}} = 0.67 \\text{ L}$$',
      C: '$$V_{\\text{object}} = 1.2 \\text{ L}$$',
      D: '$$V_{\\text{object}} = 1.5 \\text{ L}$$',
      E: '$$V_{\\text{object}} = 3.0 \\text{ L}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `Initially the object floats with 80% submerged, so the buoyant force equals the weight:

$$\\rho_w g (0.8 V) = W.$$

When the object is pressed to become fully submerged, the buoyant force increases to $$\\rho_w g V$$. The extra buoyant force that the applied 3 N force must overcome is

$$F = \\rho_w g V - \\rho_w g (0.8V) = 0.2\\,\\rho_w g V.$$

Setting this equal to 3 N:

$$0.2\\,\\rho_w g V = 3 \\text{ N} \\implies V = \\frac{3}{0.2 \\times 1000 \\times 10} = 0.0015 \\text{ m}^3 = 1.5 \\text{ L.}$$

The answer is D.`,
  },
  {
    n: 4, correct: 'C',
    statement: `What are the correct values of the numbers in the following statements? Assume there are no external forces, and take $$N = 1$$ to mean that the statement cannot be made for any meaningful number of particles.

- If a particle at rest explodes into $$N_1$$ or fewer particles with known masses, and the total kinetic energy of the new particles is known, the kinetic energy of each of the new particles is completely determined.
- If a particle at rest explodes into $$N_2$$ or fewer particles, the velocities of the new particles must lie in a line.
- If a particle at rest explodes into $$N_3$$ or fewer particles, the velocities of the new particles must lie in a plane.`,
    choices: {
      A: '$$N_1 = 2,\\ N_2 = 1,\\ N_3 = 1$$',
      B: '$$N_1 = 1,\\ N_2 = 2,\\ N_3 = 3$$',
      C: '$$N_1 = 2,\\ N_2 = 2,\\ N_3 = 3$$',
      D: '$$N_1 = 3,\\ N_2 = 2,\\ N_3 = 3$$',
      E: '$$N_1 = 2,\\ N_2 = 3,\\ N_3 = 4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'vectors', 'energy conservation'],
    solution: `__$$N_2 = 2$$:__ Since the initial momentum is zero, the daughter momenta must sum to zero. Two non-collinear vectors cannot sum to zero, so two particles must move collinearly (in opposite directions). But three particles can emerge with non-collinear velocities (e.g., equal masses at the corners of an equilateral triangle with equal speeds). Thus $$N_2 = 2$$.

__$$N_3 = 3$$:__ Similarly, three non-coplanar vectors cannot sum to zero, so three particles must have coplanar velocities. Four particles can be non-coplanar (e.g., equal masses at corners of a regular tetrahedron). Thus $$N_3 = 3$$.

__$$N_1 = 2$$:__ For two particles, the collinearity constraint means each moves in opposite directions. Two equations — momentum conservation (total = 0) and total kinetic energy fixed — uniquely determine the two speeds. For three identical particles, one could emerge at rest with the energy split arbitrarily between the other two, giving multiple solutions. Thus $$N_1 = 2$$.

With $$(N_1, N_2, N_3) = (2, 2, 3)$$, the answer is C.`,
  },
  {
    n: 5, correct: 'C',
    statement: `A unicyclist goes around a circular track of radius 30 m at a (amazingly fast!) constant speed of 10 m/s. At what angle to the left (or right) of vertical must the unicyclist lean to avoid falling? Assume that the height of the unicyclist is much smaller than the radius of the track.`,
    choices: {
      A: '$$9.46^\\circ$$',
      B: '$$9.59^\\circ$$',
      C: '$$18.4^\\circ$$',
      D: '$$19.5^\\circ$$',
      E: '$$70.5^\\circ$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'statics/equilibrium', 'non-inertial frames'],
    solution: `The forces acting at the contact point are the normal force (vertical, upward) and static friction (horizontal, centripetal). For the unicyclist to be in rotational equilibrium, the net force must point along the axis of the unicycle (i.e., along the lean direction). The lean angle $$\\theta$$ from the vertical satisfies

$$\\tan\\theta = \\frac{F_{\\text{centripetal}}}{N} = \\frac{mv^2/r}{mg} = \\frac{v^2}{gr} = \\frac{100}{10 \\times 30} = \\frac{1}{3}.$$

Therefore

$$\\theta = \\arctan\\!\\left(\\frac{1}{3}\\right) \\approx 18.4^\\circ.$$

The answer is C.`,
  },
  {
    n: 6, correct: 'B',
    statement: `A cubical box of mass 10 kg with edge length 5 m is free to move on a frictionless horizontal surface. Inside is a small block of mass 2 kg, which moves without friction inside the box. At time $$t = 0$$, the block is moving with velocity 5 m/s directly towards one of the faces of the box, while the box is initially at rest. The coefficient of restitution for any collision between the block and box is 90%, meaning that the relative speed between the box and block immediately after a collision is 90% of the relative speed between the box and block immediately before the collision.

After 1 minute, the block is a displacement $$x$$ from the original position. Which of the following is closest to $$x$$?`,
    choices: {
      A: '0 m',
      B: '50 m',
      C: '100 m',
      D: '200 m',
      E: '300 m',
    },
    figures: [F14(6)], topics: ['Mechanics'], tags: ['momentum conservation', 'collisions', 'center of mass'],
    solution: `By conservation of linear momentum, the center of mass of the block-box system moves at constant velocity throughout. The initial momentum is entirely due to the block:

$$v_{cm} = \\frac{m_{\\text{block}}\\,v_0}{m_{\\text{block}} + m_{\\text{box}}} = \\frac{2 \\times 5}{2 + 10} = \\frac{5}{6} \\text{ m/s.}$$

After $$t = 60$$ s, the center of mass has moved

$$s = v_{cm}\\,t = \\frac{5}{6} \\times 60 = 50 \\text{ m.}$$

Since the block is always inside the box (within ~5 m of the box's center), the block's displacement must be within ~5 m of 50 m. The closest answer is B.`,
  },
  {
    n: 7, correct: 'C',
    statement: `A 1.00 m long stick with uniform density is allowed to rotate about a point 30.0 cm from its end. The stick is perfectly balanced when a 50.0 g mass is placed on the stick 20.0 cm from the same end. What is the mass of the stick?`,
    choices: {
      A: '35.7 g',
      B: '33.3 g',
      C: '25.0 g',
      D: '17.5 g',
      E: '14.3 g',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'center of mass'],
    solution: `Let the pivot be 30 cm from one end (call it the left end). The stick's center of mass is at 50 cm from the left end, which is $$50 - 30 = 20$$ cm to the right of the pivot. The 50 g mass is placed 20 cm from the left end, which is $$30 - 20 = 10$$ cm to the left of the pivot.

Torque balance about the pivot:

$$M \\times 20 \\text{ cm} = 50 \\text{ g} \\times 10 \\text{ cm}$$

$$M = \\frac{50 \\times 10}{20} = 25.0 \\text{ g.}$$

The answer is C.`,
  },
  {
    n: 8, correct: 'D',
    statement: `An object of mass $$M$$ is hung on a vertical spring of spring constant $$k$$ and is set into vertical oscillations. The period of this oscillation is $$T_0$$. The spring is then cut in half and the same mass is attached and the system is set up to oscillate on a frictionless inclined plane making an angle $$\\theta$$ to the horizontal. Determine the period of the oscillations on the inclined plane in terms of $$T_0$$.`,
    choices: {
      A: '$$T_0$$',
      B: '$$T_0/2$$',
      C: '$$2T_0 \\sin\\theta$$',
      D: '$$T_0/\\sqrt{2}$$',
      E: '$$T_0 \\sin\\theta/\\sqrt{2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM'],
    solution: `Cutting a spring in half doubles its spring constant (force constant is inversely proportional to rest length), so the new spring has constant $$k' = 2k$$.

Placing the system on an incline changes the equilibrium position of the mass but does not affect the oscillation period — the restoring force for small displacements from equilibrium is still $$k' \\Delta x$$ regardless of the incline angle.

Therefore the new period is

$$T = 2\\pi\\sqrt{\\frac{M}{2k}} = \\frac{1}{\\sqrt{2}}\\,2\\pi\\sqrt{\\frac{M}{k}} = \\frac{T_0}{\\sqrt{2}}.$$

The answer is D.`,
  },
  {
    n: 9, correct: 'C',
    statement: `A 5.0 kg object undergoes a time-varying force as shown in the graph below. If the velocity at $$t = 0.0$$ s is $$+1.0$$ m/s, what is the velocity of the object at $$t = 7$$ s?`,
    choices: {
      A: '2.45 m/s',
      B: '2.50 m/s',
      C: '3.50 m/s',
      D: '12.5 m/s',
      E: '15.0 m/s',
    },
    figures: [F14(9)], topics: ['Mechanics'], tags: ['1d kinematics', 'impulse', 'graph interpretation'],
    solution: `The impulse equals the area under the $$F$$-vs-$$t$$ graph. From the graph, the force rises linearly from 0 at $$t = 0$$ to 3 N at $$t = 3$$ s, then continues as a trapezoid from $$t = 3$$ s to $$t = 7$$ s with values 3 N and 1 N.

$$\\Delta p = \\frac{1}{2}(3\\text{ s})(3\\text{ N}) + \\frac{1}{2}(3\\text{ N} + 1\\text{ N})(4\\text{ s}) = 4.5 + 8 = 12.5 \\text{ N·s.}$$

The additional velocity is

$$\\Delta v = \\frac{\\Delta p}{m} = \\frac{12.5}{5.0} = 2.5 \\text{ m/s.}$$

Final velocity: $$v = 1.0 + 2.5 = 3.5$$ m/s. The answer is C.`,
  },
  {
    n: 10, correct: 'E',
    statement: `A radio controlled car is attached to a stake in the ground by a 3.00 m long piece of string, and is forced to move in a circular path. The car has an initial angular velocity of 1.00 rad/s and smoothly accelerates at a rate of 4.00 rad/s$$^2$$. The string will break if the centripetal acceleration exceeds $$2.43 \\times 10^2 \\text{ m/s}^2$$. How long can the car accelerate at this rate before the string breaks?`,
    choices: {
      A: '0.25 s',
      B: '0.50 s',
      C: '1.00 s',
      D: '1.50 s',
      E: '2.00 s',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'equations of motion'],
    solution: `The angular velocity as a function of time is $$\\omega(t) = \\omega_0 + \\alpha t$$. The centripetal acceleration is

$$a_c = r\\omega^2 = r(\\omega_0 + \\alpha t)^2.$$

Setting $$a_c = a_{\\max}$$ and solving for $$t$$:

$$\\omega_0 + \\alpha t = \\sqrt{\\frac{a_{\\max}}{r}} = \\sqrt{\\frac{243}{3}} = \\sqrt{81} = 9 \\text{ rad/s.}$$

$$t = \\frac{9 - \\omega_0}{\\alpha} = \\frac{9 - 1}{4} = 2.00 \\text{ s.}$$

The answer is E.`,
  },
  {
    n: 11, correct: 'E',
    statement: `A point mass $$m$$ is connected to an ideal spring on a horizontal frictionless surface. The mass is pulled a short distance and then released.

Which of the following is the most correct plot of the kinetic energy as a function of potential energy?`,
    choices: {
      A: 'A circle centered at the origin.',
      B: 'A diamond (rhombus) shape.',
      C: 'A concave-up curve (arch).',
      D: 'A tent shape (two line segments meeting at a peak, above the axes).',
      E: 'A straight line with negative slope, intercepting both positive axes.',
    },
    figures: [F14(11)], topics: ['Mechanics'], tags: ['energy conservation', 'springs', 'graph interpretation'],
    solution: `Mechanical energy is conserved:

$$E_k + E_p = E_{\\text{total}} = \\text{constant.}$$

Therefore $$E_k = E_{\\text{total}} - E_p$$, which is a straight line of slope $$-1$$ on a graph of $$E_k$$ vs $$E_p$$. The line connects $$(0,\\, E_{\\text{total}})$$ on the $$E_k$$-axis to $$(E_{\\text{total}},\\, 0)$$ on the $$E_p$$-axis. Both energies are non-negative, so the relevant portion lies in the first quadrant.

The answer is E.`,
  },
  {
    n: 12, correct: 'E',
    statement: `__The following information applies to questions 12 and 13.__

A paper helicopter with rotor radius $$r$$ and weight $$W$$ is dropped from a height $$h$$ in air with a density of $$\\rho$$. Assuming that the helicopter quickly reaches terminal velocity, a function for the time of flight $$T$$ can be found in the form

$$T = k\\,h^\\alpha r^\\beta \\rho^\\delta W^\\omega,$$

where $$k$$ is an unknown dimensionless constant (actually, 1.164). $$\\alpha$$, $$\\beta$$, $$\\delta$$, and $$\\omega$$ are constant exponents to be determined.

Determine $$\\alpha$$.`,
    choices: {
      A: '$$\\alpha = -1$$',
      B: '$$\\alpha = -1/2$$',
      C: '$$\\alpha = 0$$',
      D: '$$\\alpha = 1/2$$',
      E: '$$\\alpha = 1$$',
    },
    figures: [F14(12)], topics: ['Mechanics'], tags: ['dimensional analysis', 'drag force'],
    solution: `Since the helicopter quickly reaches terminal velocity and then falls at constant speed $$v$$, the time of flight is simply

$$T = \\frac{h}{v}.$$

Since $$v$$ is a constant determined by the terminal velocity condition (independent of $$h$$), we have $$T \\propto h^1$$, so $$\\alpha = 1$$.

The answer is E.`,
  },
  {
    n: 13, correct: 'D',
    statement: `__The following information applies to questions 12 and 13.__

A paper helicopter with rotor radius $$r$$ and weight $$W$$ is dropped from a height $$h$$ in air with a density of $$\\rho$$. Assuming that the helicopter quickly reaches terminal velocity, a function for the time of flight $$T$$ can be found in the form

$$T = k\\,h^\\alpha r^\\beta \\rho^\\delta W^\\omega,$$

where $$k$$ is an unknown dimensionless constant (actually, 1.164). $$\\alpha$$, $$\\beta$$, $$\\delta$$, and $$\\omega$$ are constant exponents to be determined.

Determine $$\\beta$$.`,
    choices: {
      A: '$$\\beta = 1/3$$',
      B: '$$\\beta = 1/2$$',
      C: '$$\\beta = 2/3$$',
      D: '$$\\beta = 1$$',
      E: '$$\\beta$$ cannot be uniquely determined without more information.',
    },
    figures: [F14(12)], topics: ['Mechanics'], tags: ['dimensional analysis', 'drag force'],
    solution: `From the previous problem $$\\alpha = 1$$, so $$T = k\\,h\\,r^\\beta\\rho^\\delta W^\\omega$$.

Units of $$T$$ are seconds (s). Units of $$h$$ are m. Units of $$r$$ are m. Units of $$\\rho$$ are kg/m$$^3$$. Units of $$W$$ are N = kg$$\\cdot$$m/s$$^2$$.

Matching dimensions:

- For kg: $$\\delta + \\omega = 0 \\implies \\delta = -\\omega.$$
- For s: $$-2\\omega = 1 \\implies \\omega = -1/2,\\ \\delta = 1/2.$$
- For m: $$1 + \\beta - 3\\delta + \\omega = 0 \\implies 1 + \\beta - 3/2 - 1/2 = 0 \\implies \\beta = 1.$$

The answer is D.`,
  },
  {
    n: 14, correct: 'D',
    statement: `A disk of moment of inertia $$I$$, mass $$M$$, and radius $$R$$ has a cord wrapped around it tightly as shown in the diagram. The disk is free to slide on its side as shown in the top down view. A constant force of $$T$$ is applied to the end of the cord and accelerates the disk along a frictionless surface.

After the disk has accelerated some distance, determine the ratio of the translational KE to total KE of the disk,

$$KE_{\\text{translational}}/KE_{\\text{total}} =$$`,
    choices: {
      A: '$$\\dfrac{I}{MR^2}$$',
      B: '$$\\dfrac{MR^2}{I}$$',
      C: '$$\\dfrac{I}{3MR^2}$$',
      D: '$$\\dfrac{I}{MR^2 + I}$$',
      E: '$$\\dfrac{MR^2}{MR^2 + I}$$',
    },
    figures: [F14(14)], topics: ['Mechanics'], tags: ['rotational dynamics', 'energy conservation', 'moment of inertia'],
    solution: `The force $$T$$ acting at the rim produces both a linear acceleration $$a = T/M$$ of the center of mass and an angular acceleration $$\\alpha = TR/I$$ about the center of mass. After time $$t$$:

$$v = at = \\frac{T}{M}t, \\qquad \\omega = \\alpha t = \\frac{TR}{I}t.$$

The translational and rotational kinetic energies are:

$$KE_{\\text{trans}} = \\frac{1}{2}Mv^2 = \\frac{T^2t^2}{2M},$$

$$KE_{\\text{rot}} = \\frac{1}{2}I\\omega^2 = \\frac{T^2R^2t^2}{2I}.$$

The ratio is

$$\\frac{KE_{\\text{trans}}}{KE_{\\text{total}}} = \\frac{\\frac{1}{M}}{\\frac{1}{M} + \\frac{R^2}{I}} = \\frac{I}{I + MR^2}.$$

The answer is D.`,
  },
  {
    n: 15, correct: 'A',
    statement: `The maximum torque output from the engine of a new experimental car of mass $$m$$ is $$\\tau$$. The maximum rotational speed of the engine is $$\\omega$$. The engine is designed to provide a constant power output $$P$$. The engine is connected to the wheels via a perfect transmission that can smoothly trade torque for speed with no power loss. The wheels have a radius $$R$$, and the coefficient of static friction between the wheels and the road is $$\\mu$$.

What is the maximum sustained speed $$v$$ the car can drive up a 30 degree incline? Assume no frictional losses and assume $$\\mu$$ is large enough so that the tires do not slip.`,
    choices: {
      A: '$$v = 2P/(mg)$$',
      B: '$$v = 2P/(\\sqrt{3}\\,mg)$$',
      C: '$$v = 2P/(\\mu mg)$$',
      D: '$$v = \\tau\\omega/(mg)$$',
      E: '$$v = \\tau\\omega/(\\mu mg)$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'power'],
    solution: `At constant (maximum sustained) speed the engine force equals the component of gravity along the incline:

$$F = mg\\sin 30^\\circ = \\frac{mg}{2}.$$

Power equals force times speed:

$$P = Fv \\implies v = \\frac{P}{F} = \\frac{P}{mg/2} = \\frac{2P}{mg}.$$

The extra information about $$\\tau$$, $$\\omega$$, $$R$$, and $$\\mu$$ is irrelevant given that $$\\mu$$ is large enough and no friction losses occur. The answer is A.`,
  },
  {
    n: 16, correct: 'B',
    statement: `An object of mass $$m_1$$ initially moving at speed $$v_0$$ collides with an object of mass $$m_2 = \\alpha m_1$$, where $$\\alpha < 1$$, that is initially at rest. The collision could be completely elastic, completely inelastic, or partially inelastic. After the collision the two objects move at speeds $$v_1$$ and $$v_2$$. Assume that the collision is one dimensional, and that object one cannot pass through object two.

After the collision, the speed ratio $$r_1 = v_1/v_0$$ of object 1 is bounded by`,
    choices: {
      A: '$$\\dfrac{1-\\alpha}{1+\\alpha} \\le r_1 \\le 1$$',
      B: '$$\\dfrac{1-\\alpha}{1+\\alpha} \\le r_1 \\le \\dfrac{1}{1+\\alpha}$$',
      C: '$$\\dfrac{\\alpha}{1+\\alpha} \\le r_1 \\le 1$$',
      D: '$$0 \\le r_1 \\le \\dfrac{2\\alpha}{1+\\alpha}$$',
      E: '$$\\dfrac{1}{1+\\alpha} \\le r_1 \\le \\dfrac{2}{1+\\alpha}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
    solution: `For a __completely elastic__ collision (maximum energy transfer) with $$v_2 = 0$$:

$$r_1 = \\frac{m_1 - m_2}{m_1 + m_2} = \\frac{1 - \\alpha}{1 + \\alpha}.$$

Since $$\\alpha < 1$$, object 1 retains forward motion.

For a __completely inelastic__ collision (minimum post-collision speed of object 1, since the two merge):

$$r_1 = \\frac{m_1}{m_1 + m_2} = \\frac{1}{1 + \\alpha}.$$

All partially inelastic collisions lie between these extremes (object 2 must always move at least as fast as object 1 since object 1 cannot pass through):

$$\\frac{1-\\alpha}{1+\\alpha} \\le r_1 \\le \\frac{1}{1+\\alpha}.$$

The answer is B.`,
  },
  {
    n: 17, correct: 'C',
    statement: `A spherical cloud of dust in space has a uniform density $$\\rho_0$$ and a radius $$R_0$$. The gravitational acceleration of free fall at the surface of the cloud due to the mass of the cloud is $$g_0$$.

A process occurs (heat expansion) that causes the cloud to suddenly grow to a radius $$2R_0$$, while maintaining a uniform (but not constant) density. The gravitational acceleration of free fall at a point $$R_0$$ away from the center of the cloud due to the mass of the cloud is now`,
    choices: {
      A: '$$g_0/32$$',
      B: '$$g_0/16$$',
      C: '$$g_0/8$$',
      D: '$$g_0/4$$',
      E: '$$g_0/2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'shell theorem'],
    solution: `By the shell theorem, the gravitational acceleration at radius $$r$$ inside a uniform sphere depends only on the mass enclosed within $$r$$:

$$g = \\frac{GM_{\\text{enc}}}{r^2} = \\frac{G\\cdot\\frac{4}{3}\\pi r^3\\rho}{r^2} = \\frac{4\\pi G\\rho r}{3}.$$

After expansion to radius $$2R_0$$, the total mass is conserved but the volume increases by $$(2R_0/R_0)^3 = 8$$, so the new density is

$$\\rho' = \\rho_0/8.$$

At the point $$r = R_0$$ (now inside the new cloud of radius $$2R_0$$):

$$g' = \\frac{4\\pi G\\rho' R_0}{3} = \\frac{4\\pi G (\\rho_0/8) R_0}{3} = \\frac{g_0}{8},$$

since $$g_0 = \\frac{4\\pi G\\rho_0 R_0}{3}$$. The answer is C.`,
  },
  {
    n: 18, correct: 'B',
    statement: `Consider the following diagram of a box and two weight scales. Scale A supports the box via a massless rope. A pulley is attached to the top of the box; a second massless rope passes over the pulley, one end is attached to the box and the other end to scale B. The two scales indicate the tensions $$T_A$$ and $$T_B$$ in the ropes. Originally scale A reads 30 Newtons and scale B reads 20 Newtons.

If an additional force pulls down on scale B so that the reading increases to 30 Newtons, what will be the new reading on scale A?`,
    choices: {
      A: '35 Newtons',
      B: '40 Newtons',
      C: '45 Newtons',
      D: '50 Newtons',
      E: '60 Newtons',
    },
    figures: [F14(18)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'pulleys/tension', 'free-body diagrams'],
    solution: `Whatever is inside the box is irrelevant to the overall force balance. The external forces on the entire box-pulley-rope system are: scale A pulling upward with tension $$T_A$$, and the external pull on scale B pulling downward with tension $$T_B$$, plus gravity (the weight of the box system).

For equilibrium, $$T_A = W_{\\text{box}} + T_B$$ (the bottom rope transmits the external pull downward through the pulley back to the box as well). When $$T_B$$ increases by 10 N (from 20 to 30 N), $$T_A$$ must also increase by 10 N:

$$T_A' = 30 + 10 = 40 \\text{ Newtons.}$$

The answer is B.`,
  },
  {
    n: 19, correct: 'B',
    statement: `A helicopter is flying horizontally at constant speed. A perfectly flexible uniform cable is suspended beneath the helicopter; air friction on the cable is __not__ negligible.

Which of the following diagrams best shows the shape of the cable as the helicopter flies through the air to the right?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2014/fma-2014-q19A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2014/fma-2014-q19B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2014/fma-2014-q19C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2014/fma-2014-q19D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2014/fma-2014-q19E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'drag force', 'free-body diagrams'],
    solution: `Consider the tension at any point P on the cable. The portion of cable below P is subject to two distributed forces: gravity (downward) and air friction (backward, opposing motion). Both forces are proportional to the length of cable below P.

Since both force components are proportional to the same quantity (the length below P), their ratio — and therefore the direction of the net tension — is the same at every point on the cable. This means the cable hangs in a __straight diagonal line__, tilted backward (to the left as the helicopter moves right) from the attachment point.

The answer is B. (Note: if air friction were negligible, the answer would be A — straight down. If a heavy weight hung at the bottom with negligible cable friction, the answer would be D — curved near top, straight at bottom.)`,
  },
  {
    n: 20, correct: 'B',
    statement: `A crew of scientists has built a new space station. The space station is shaped like a wheel of radius $$R$$, with essentially all its mass $$M$$ at the rim. When the crew arrives, the station will be set rotating at a rate that causes an object at the rim to have radial acceleration $$g$$, thereby simulating Earth's surface gravity. This is accomplished by two small rockets, each with thrust $$T$$ newtons, mounted on the station's rim. How long a time $$t$$ does one need to fire the rockets to achieve the desired condition?`,
    choices: {
      A: '$$t = \\sqrt{gR^3}\\, M/(2T)$$',
      B: '$$t = \\sqrt{gR}\\, M/(2T)$$',
      C: '$$t = \\sqrt{gR}\\, M/T$$',
      D: '$$t = \\sqrt{gR/\\pi}\\, M/T$$',
      E: '$$t = \\sqrt{gR}\\, M/(\\pi T)$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational dynamics', 'circular motion', 'moment of inertia'],
    solution: `The desired angular velocity satisfies $$\\omega^2 R = g$$, so

$$\\omega = \\sqrt{g/R}.$$

The moment of inertia of the rim-mass station is $$I = MR^2$$. The two rockets each exert thrust $$T$$ tangentially at radius $$R$$, giving total torque

$$\\tau = 2TR.$$

The angular acceleration is

$$\\alpha = \\frac{\\tau}{I} = \\frac{2TR}{MR^2} = \\frac{2T}{MR}.$$

Starting from rest, the time to reach $$\\omega$$ is

$$t = \\frac{\\omega}{\\alpha} = \\frac{\\sqrt{g/R}}{2T/(MR)} = \\frac{\\sqrt{g/R}\\cdot MR}{2T} = \\frac{M\\sqrt{gR}}{2T}.$$

The answer is B.`,
  },
  {
    n: 21, correct: 'A',
    statement: `Two pulleys (shown in figure) are made of the same metal with density $$\\rho$$. Pulley A is a uniform disk with radius $$R$$. Pulley B is identical except a circle of radius $$R/2$$ is removed from the center. When two boxes $$M = \\alpha m$$ ($$\\alpha > 1$$) are connected over the pulleys through a massless rope and move without slipping, what is the ratio between the accelerations in system A and B? The mass of pulley A is $$M + m$$.`,
    choices: {
      A: '$$a_A/a_B = 47/48$$',
      B: '$$a_A/a_B = 31/32$$',
      C: '$$a_A/a_B = 15/16$$',
      D: '$$a_A/a_B = 9/16$$',
      E: '$$a_A/a_B = 3/4$$',
    },
    figures: [F14(21)], topics: ['Mechanics'], tags: ['rotational dynamics', 'moment of inertia', 'pulleys/tension'],
    solution: `For a generalized Atwood machine with pulley moment of inertia $$I$$ and masses $$M > m$$:

$$a = \\frac{(M - m)g}{M + m + I/R^2}.$$

Write $$I = \\beta(M+m)R^2$$; then $$a = \\frac{(M-m)g}{(M+m)(1+\\beta)}$$, and the ratio $$a_A/a_B = (1+\\beta_B)/(1+\\beta_A)$$.

__Pulley A__ (solid disk): $$I_A = \\frac{1}{2}(M+m)R^2 \\implies \\beta_A = \\frac{1}{2}.$$

__Pulley B__ (disk with central hole of radius $$R/2$$): The removed disk has radius $$R/2$$ and therefore mass $$(M+m)/4$$ (mass scales as $$r^2$$ for same material and thickness). Its moment of inertia would have been $$\\frac{1}{2}\\cdot\\frac{M+m}{4}\\cdot\\frac{R^2}{4} = \\frac{(M+m)R^2}{32}$$. So:

$$I_B = \\frac{(M+m)R^2}{2} - \\frac{(M+m)R^2}{32} = \\frac{(M+m)R^2}{2}\\left(1 - \\frac{1}{16}\\right) = \\frac{15(M+m)R^2}{32} \\implies \\beta_B = \\frac{15}{32}.$$

$$\\frac{a_A}{a_B} = \\frac{1 + 15/32}{1 + 1/2} = \\frac{47/32}{3/2} = \\frac{47}{32} \\cdot \\frac{2}{3} = \\frac{47}{48}.$$

The answer is A.`,
  },
  {
    n: 22, correct: 'E',
    statement: `A body of mass $$M$$ and a body of mass $$m \\ll M$$ are in circular orbits about their center of mass under the influence of their mutual gravitational attraction to each other. The distance between the bodies is $$R$$, which is much larger than the size of either body.

A small amount of matter $$\\delta m \\ll m$$ is removed from the body of mass $$m$$ and transferred to the body of mass $$M$$. The transfer is done in such a way so that the orbits of the two bodies remain circular, and remain separated by a distance $$R$$. Which of the following statements is correct?`,
    choices: {
      A: 'The gravitational force between the two bodies increases.',
      B: 'The gravitational force between the two bodies remains constant.',
      C: 'The total angular momentum of the system increases.',
      D: 'The total angular momentum of the system remains constant.',
      E: 'The period of the orbit of two bodies remains constant.',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'orbital mechanics', 'kepler\'s laws', 'angular momentum conservation'],
    solution: `The period of a two-body circular orbit follows from Kepler's third law:

$$T = 2\\pi\\sqrt{\\frac{R^3}{G(M + m)}}.$$

Since both $$R$$ and the total mass $$M + m$$ remain constant after the transfer ($$\\delta m$$ is merely moved, not created or destroyed), the period $$T$$ remains constant.

The other statements are incorrect: the gravitational force $$F = GMm/R^2$$ changes because $$Mm$$ changes (it decreases since $$Mm$$ is maximized when $$M = m$$, but here $$M \\gg m$$ so transferring from $$m$$ to $$M$$ decreases $$Mm$$). The total angular momentum $$L = Mm\\sqrt{GR/(M+m)}$$ also decreases for the same reason ($$Mm$$ decreases while $$M+m$$ and $$R$$ are fixed).

The answer is E.`,
  },
  {
    n: 23, correct: 'A',
    statement: `__The following information applies to questions 23 and 24.__

A 100 kg astronaut carries a launcher loaded with a 10 kg bowling ball; the launcher and the astronaut's spacesuit have negligible mass. The astronaut discovers that firing the launcher results in the ball moving away from her at a relative speed of 50 m/s.

What is the impulse delivered to the astronaut when firing the launcher?`,
    choices: {
      A: '455 N s',
      B: '500 N s',
      C: '550 N s',
      D: '5000 N s',
      E: '5500 N s',
    },
    figures: [], topics: ['Mechanics'], tags: ['impulse', 'momentum conservation'],
    solution: `Work in the center-of-mass frame. Let $$m_1 = 100$$ kg (astronaut) and $$m_2 = 10$$ kg (ball), with the relative speed $$v_r = v_2 - v_1 = 50$$ m/s after firing. Conservation of momentum (initially at rest in the CM frame):

$$m_1 v_1 + m_2 v_2 = 0 \\implies v_2 = -\\frac{m_1}{m_2}v_1.$$

Substituting into the relative speed:

$$v_r = v_2 - v_1 = -\\frac{m_1}{m_2}v_1 - v_1 = -v_1\\frac{m_1 + m_2}{m_2}.$$

The impulse to the astronaut is

$$J = m_1 |v_1| = \\frac{m_1 m_2 v_r}{m_1 + m_2} = \\frac{100 \\times 10 \\times 50}{110} = \\frac{50000}{110} \\approx 454.5 \\text{ N·s.}$$

The closest answer is A (455 N s).`,
  },
  {
    n: 24, correct: 'C',
    statement: `__The following information applies to questions 23 and 24.__

A 100 kg astronaut carries a launcher loaded with a 10 kg bowling ball; the launcher and the astronaut's spacesuit have negligible mass. The astronaut discovers that firing the launcher results in the ball moving away from her at a relative speed of 50 m/s.

The astronaut in the previous situation is now moving at 10 m/s (as measured in a certain frame of reference). She wishes to fire the launcher so that her velocity turns through as large an angle as possible (in this frame of reference). What is this maximum angle? (Hint: a diagram may be useful.)`,
    choices: {
      A: '$$24.4^\\circ$$',
      B: '$$26.6^\\circ$$',
      C: '$$27.0^\\circ$$',
      D: '$$30.0^\\circ$$',
      E: '$$180.0^\\circ$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'impulse', 'vectors', 'kinematics-2d'],
    solution: `The astronaut's final momentum is $$\\vec{p}_f = \\vec{p}_i + \\vec{J}$$, where $$\\vec{p}_i = m_1 v_i = 100 \\times 10 = 1000$$ kg·m/s and $$|\\vec{J}| = 455$$ N·s (from the previous problem; the impulse magnitude is frame-independent).

The tip of $$\\vec{p}_f$$ lies on a circle of radius $$|J| = 455$$ N·s centered at the tip of $$\\vec{p}_i$$. The maximum deflection angle $$\\theta$$ occurs when $$\\vec{p}_f$$ is tangent to this circle, which gives

$$\\sin\\theta_{\\max} = \\frac{|J|}{|p_i|} = \\frac{455}{1000} = 0.455.$$

$$\\theta_{\\max} = \\arcsin(0.455) \\approx 27.0^\\circ.$$

The answer is C.`,
  },
  {
    n: 25, correct: 'A',
    statement: `A block with mass $$m$$ is released from rest at the top of a frictionless ramp. The block starts at a height $$h_1$$ above the base of the ramp, slides down the ramp, and then up a second ramp. The coefficient of kinetic friction between the block and the second ramp is $$\\mu_k$$. If both ramps make an angle of $$\\theta$$ with the horizontal, to what height $$h_2$$ above the base of the second ramp will the block rise?`,
    choices: {
      A: '$$h_2 = \\dfrac{h_1 \\sin\\theta}{\\mu_k \\cos\\theta + \\sin\\theta}$$',
      B: '$$h_2 = \\dfrac{h_1 \\sin\\theta}{\\mu_k + \\sin\\theta}$$',
      C: '$$h_2 = \\dfrac{h_1 \\sin\\theta}{\\mu_k \\cos^2\\theta + \\sin\\theta}$$',
      D: '$$h_2 = \\dfrac{h_1 \\sin\\theta}{\\mu_k \\cos^2\\theta + \\sin^2\\theta}$$',
      E: '$$h_2 = \\dfrac{h_1 \\cos\\theta}{\\mu_k \\sin\\theta + \\cos\\theta}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'friction', 'work-energy theorem'],
    solution: `The block starts with potential energy $$mgh_1$$ and comes to rest at height $$h_2$$ on the second ramp after losing energy to friction. The distance traveled along the second ramp is $$s = h_2/\\sin\\theta$$. The friction force is $$f = \\mu_k mg\\cos\\theta$$. The work done against friction is:

$$W_f = f \\cdot s = \\mu_k mg\\cos\\theta \\cdot \\frac{h_2}{\\sin\\theta}.$$

Energy conservation:

$$mgh_1 = mgh_2 + \\mu_k mg\\cos\\theta \\cdot \\frac{h_2}{\\sin\\theta}.$$

Dividing by $$mg$$ and solving for $$h_2$$:

$$h_1 = h_2\\left(1 + \\frac{\\mu_k \\cos\\theta}{\\sin\\theta}\\right) = h_2\\cdot\\frac{\\sin\\theta + \\mu_k\\cos\\theta}{\\sin\\theta}.$$

$$h_2 = \\frac{h_1 \\sin\\theta}{\\sin\\theta + \\mu_k\\cos\\theta}.$$

The answer is A.`,
  },
]
