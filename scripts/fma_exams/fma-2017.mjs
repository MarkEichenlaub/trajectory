// Digitized 2017 F=ma exam questions. Sources:
// Exam: work/fma/fma-2017.pdf (text extracted to work/fma/fma-2017.txt)
// Answer key: work/fma/fma-2017-sol.pdf (←CORRECT markers)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2017.1. through 2017.25.
// Figures: work/figure_manifest.json, key "fma-2017" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions.
// No disagreements found between the AAPT key and the book.

const F17 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2017/fma-2017-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2017'
export const questions = [
  {
    n: 1, correct: 'D',
    statement: `A motorcycle rides on the vertical walls around the perimeter of a large circular room. The friction coefficient between the motorcycle tires and the walls is $$\\mu$$. How does the minimum $$\\mu$$ needed to prevent the motorcycle from slipping downwards change with the motorcycle's speed, $$s$$?`,
    choices: {
      A: '$$\\mu \\propto s^0$$',
      B: '$$\\mu \\propto s^{-1/2}$$',
      C: '$$\\mu \\propto s^{-1}$$',
      D: '$$\\mu \\propto s^{-2}$$',
      E: 'none of these',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'friction'],
    solution: `The wall's static friction is the force preventing the motorcyclist from slipping downward. Let $$m$$ be the total mass of the motorcycle and cyclist. The normal force $$N$$ on the motorcyclist provides a constant centripetal acceleration:

$$N = ma_c = \\frac{mv^2}{r}.$$

The motorcyclist does not slip downward only when its weight is less than the maximum force of static friction $$\\mu N$$, so

$$mg < \\mu N = \\frac{\\mu mv^2}{r} \\implies \\mu > \\frac{gr}{v^2}.$$

The minimum value of $$\\mu$$ is proportional to $$v^{-2}$$, so the answer is D.`,
  },
  {
    n: 2, correct: 'B',
    statement: `A mass $$m$$ hangs from a massless spring connected to the roof of a box of mass $$M$$. When the box is held stationary, the mass-spring system oscillates vertically with angular frequency $$\\omega$$. If the box is dropped and falls freely under gravity, how will the angular frequency change?`,
    choices: {
      A: '$$\\omega$$ will be unchanged',
      B: '$$\\omega$$ will increase',
      C: '$$\\omega$$ will decrease',
      D: 'Oscillations are impossible under these conditions',
      E: '$$\\omega$$ will increase or decrease depending on the values of $$M$$ and $$m$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'equations of motion'],
    solution: `A mass-spring system with a constant external force (such as gravity) has the same frequency of oscillation; only the equilibrium length changes. It is tempting to conclude the frequency is unchanged, but this ignores the role of the box.

When the box is held stationary the system is a spring with one mass and one fixed end. When the box is dropped, it is no longer fixed, so the system becomes a spring with two masses $$m$$ and $$M$$ on either end. Letting $$x$$ be the displacement of the spring from its equilibrium length, the acceleration of $$m$$ in the box's reference frame is

$$a = -\\frac{F}{m} - \\frac{F}{M} = -kx\\left(\\frac{1}{m} + \\frac{1}{M}\\right).$$

The angular frequency increases from $$\\sqrt{k/m}$$ to $$\\sqrt{k/m + k/M}$$. The answer is B.`,
  },
  {
    n: 3, correct: 'B',
    statement: `A ball of radius $$R$$ and mass $$m$$ is magically put inside a thin shell of the same mass and radius $$2R$$. The system is at rest on a horizontal frictionless surface initially. When the ball is, again magically, released inside the shell, it sloshes around in the shell and eventually stops at the bottom of the shell. How far does the shell move from its initial contact point with the surface?`,
    choices: {
      A: '$$R$$',
      B: '$$R/2$$',
      C: '$$R/4$$',
      D: '$$3R/8$$',
      E: '$$R/8$$',
    },
    figures: [F17(3)], topics: ['Mechanics'], tags: ['center of mass', 'momentum conservation'],
    solution: `Since the system begins at rest and there is zero net external force in the horizontal direction, the $$x$$-coordinate of the center of mass must remain constant by Newton's First Law.

When the ball eventually reaches its final position at the bottom of the shell, the contact point of the shell with the surface is vertically aligned with the center of mass by symmetry. Setting the initial contact point as $$x_i = 0$$, the center of mass is at

$$x_{cm} = \\frac{m \\cdot 0 + m \\cdot R}{m + m} = \\frac{R}{2}.$$

(The shell's center started at height $$2R$$ directly above $$x = 0$$, and the ball's center started at $$x = 0$$. After the ball settles at the bottom, its center is at height $$R$$ above the new contact point, and the shell's center is at height $$2R$$ above the contact point, both sharing the same $$x$$-coordinate as the contact point.)

Since the center of mass stays at $$x = R/2$$, the shell moves $$R/2$$ from its initial contact point. The answer is B.`,
  },
  {
    n: 4, correct: 'B',
    statement: `Several identical cars are standing at a red light on a one-lane road, one behind the other, with negligible (and equal) distance between adjacent cars. When the green light comes up, the first car takes off to the right with constant acceleration. The driver in the second car reacts and does the same 0.2 s later. The third driver starts moving 0.2 s after the second one and so on. All cars accelerate until they reach the speed limit of 45 km/hr, after which they move to the right at a constant speed. Consider the following patterns of cars.

I, II, III, and IV show different gap-spacing patterns (see figure).

Just before the first car starts accelerating to the right, the car pattern will qualitatively look like pattern I. After that, the pattern will qualitatively evolve according to`,
    choices: {
      A: 'First I, then II, and then III.',
      B: 'First I, then II, and then IV.',
      C: 'First I, and then IV, with neither II nor III as intermediate stage.',
      D: 'First I, and then II.',
      E: 'First I, and then III.',
    },
    figures: [F17(4)], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `At any time during the motion, the speed of a given car equals the speed of the car directly in front of it 0.2 s ago. As a corollary, the gap between any two adjacent cars equals the distance spanned by the next gap 0.2 s earlier.

A quick observation shows that the gap between any two cars begins at a constant $$x_i$$, increases over a short time, then remains constant again at some distance $$x_f > x_i$$. Examining each figure:

1. Figure I shows the beginning of the process, when each gap is at its minimum $$x_i$$.
2. Figure II shows an intermediate stage, as the second and third gaps are increasing while the first gap is already at its maximum distance.
3. Figure III does not show a step of this process, since gaps to the right (in front) are smaller than gaps behind, contradicting the fact that gaps increase over time.
4. Figure IV shows the end of the process, when all gaps are at their final distance $$x_f$$.

The answer is B.`,
  },
  {
    n: 5, correct: 'C',
    statement: `A projectile is launched with speed $$v_0$$ off the edge of a cliff of height $$h$$, at an angle $$\\theta$$ from the horizontal. Air friction is negligible. To maximize the horizontal range of the projectile, $$\\theta$$ should satisfy`,
    choices: {
      A: '$$45^\\circ < \\theta < 90^\\circ$$',
      B: '$$\\theta = 45^\\circ$$',
      C: '$$0^\\circ < \\theta < 45^\\circ$$',
      D: '$$\\theta = 0^\\circ$$',
      E: '$$\\theta < 45^\\circ$$ or $$\\theta > 45^\\circ$$, depending on the values of $$h$$ and $$v_0$$.',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'extreme cases'],
    solution: `We can immediately eliminate $$\\theta = 0^\\circ$$ (choice D), since for small $$h$$ the projectile clearly travels farther with a positive launch angle.

Divide the motion into a first phase (elevation above the launch height) and a second phase (elevation below the launch height). Let the total horizontal distance be $$d(\\theta) = d_1(\\theta) + d_2(\\theta)$$.

The first phase is a symmetric level-ground problem, so

$$d_1(\\theta) = \\frac{v_0^2 \\sin 2\\theta}{g},$$

which is maximized at $$\\theta = 45^\\circ$$ and strictly decreasing on $$(45^\\circ, 90^\\circ]$$.

At the start of the second phase the speed equals $$v_0$$ (energy conservation), but the vertical component is directed downward. A larger $$\\theta$$ gives a steeper downward angle, reducing both flight time and horizontal speed, so $$d_2(\\theta)$$ is strictly decreasing in $$\\theta$$.

Therefore $$d(\\theta)$$ is strictly decreasing on $$[45^\\circ, 90^\\circ]$$ and cannot achieve its maximum for $$\\theta \\geq 45^\\circ$$. The answer is C.`,
  },
  {
    n: 6, correct: 'E',
    statement: `In the mobile below, the two cross beams and the seven supporting strings are all massless. The hanging objects are $$M_1 = 400$$ g, $$M_2 = 200$$ g, and $$M_4 = 500$$ g. What is the value of $$M_3$$ for the system to be in static equilibrium?`,
    choices: {
      A: '300 g',
      B: '400 g',
      C: '500 g',
      D: '600 g',
      E: '700 g',
    },
    figures: [F17(6)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque'],
    solution: `Let the $$x$$-coordinate of the top supporting string be 0. Computing torques about this axis for both crossbeams (counterclockwise positive), the torque balance on the upper beam gives

$$(0.4\\text{ m})M_1 g + (0.1\\text{ m})T_1 - (0.2\\text{ m})T_2 - (0.5\\text{ m})M_2 g = 0,$$

and on the lower beam

$$(0.2\\text{ m})M_3 g - (0.1\\text{ m})T_1 + (0.2\\text{ m})T_2 - (0.4\\text{ m})M_4 g = 0,$$

where $$T_1$$ and $$T_2$$ are the tensions in the connecting strings. Adding these two equations eliminates the tensions:

$$4M_1 - 5M_2 + 2M_3 - 4M_4 = 0.$$

Plugging in the known masses:

$$4(400) - 5(200) + 2M_3 - 4(500) = 0 \\implies 1600 - 1000 + 2M_3 - 2000 = 0 \\implies M_3 = 700 \\text{ g.}$$

The answer is E.`,
  },
  {
    n: 7, correct: 'D',
    statement: `__The following information applies to questions 7 and 8.__

A train, originally of mass $$M$$, is traveling on a frictionless straight horizontal track with constant speed $$v$$. Snow starts to fall vertically and sticks to the train at a rate of $$\\rho$$, where $$\\rho$$ has units of kilograms per second. The train's engine keeps the train moving at constant speed $$v$$ as snow accumulates on the train.

The rate at which the kinetic energy of the train and snow increases is`,
    choices: {
      A: '$$0$$',
      B: '$$Mgv$$',
      C: '$$\\tfrac{1}{2}Mv^2$$',
      D: '$$\\tfrac{1}{2}\\rho v^2$$',
      E: '$$\\rho v^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'momentum conservation'],
    solution: `The kinetic energy of the train at time $$t$$ is

$$K(t) = \\tfrac{1}{2}(M + \\rho t)v^2.$$

This is linear in $$t$$ with slope $$\\frac{1}{2}\\rho v^2$$. The rate of increase is therefore $$\\tfrac{1}{2}\\rho v^2$$, so the answer is D.`,
  },
  {
    n: 8, correct: 'E',
    statement: `__The following information applies to questions 7 and 8.__

A train, originally of mass $$M$$, is traveling on a frictionless straight horizontal track with constant speed $$v$$. Snow starts to fall vertically and sticks to the train at a rate of $$\\rho$$, where $$\\rho$$ has units of kilograms per second. The train's engine keeps the train moving at constant speed $$v$$ as snow accumulates on the train.

The minimum power required from the engine to keep the train traveling at a constant speed $$v$$ is`,
    choices: {
      A: '$$0$$',
      B: '$$Mgv$$',
      C: '$$\\tfrac{1}{2}Mv^2$$',
      D: '$$\\tfrac{1}{2}\\rho v^2$$',
      E: '$$\\rho v^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['power', 'momentum conservation', 'impulse'],
    solution: `Over a short time interval $$\\Delta t$$, the momentum of the train increases by

$$\\Delta p = \\Delta m \\cdot v = \\rho v \\,\\Delta t.$$

By Newton's Second Law, the impulse from the engine equals the change in momentum, so the engine force is

$$F = \\frac{\\Delta p}{\\Delta t} = \\rho v.$$

The power generated by the engine is

$$P = Fv = \\rho v^2,$$

so the answer is E. Note that this is greater than the rate of kinetic energy increase ($$\\tfrac{1}{2}\\rho v^2$$) because some power is lost to the inelastic collisions between the falling snow and the train.`,
  },
  {
    n: 9, correct: 'D',
    statement: `Flasks A, B, and C each have a circular base with a radius of 2 cm. An equal volume of water is poured into each flask, and none overflow. Rank the force of water $$F$$ on the base of the flask from greatest to least.`,
    choices: {
      A: '$$F_A > F_B > F_C$$',
      B: '$$F_A > F_C > F_B$$',
      C: '$$F_B > F_C > F_A$$',
      D: '$$F_C > F_A > F_B$$',
      E: '$$F_A = F_B = F_C$$',
    },
    figures: [F17(9)], topics: ['Mechanics'], tags: ['pressure', 'fluid statics'],
    solution: `Gauge pressure at any point in water depends solely on the depth $$h$$: $$P = \\rho g h$$. It is tempting to assume $$F = PA$$ is equal for all flasks since the base radius is the same, but the problem specifies that an __equal volume__ of water is poured into each flask.

Since the flasks have differing cross-sectional areas at mid-height, the water level is highest in flask C (narrowest above the base) and lowest in flask B (widest above the base). Because pressure is proportional to depth, $$F_C > F_A > F_B$$, so the answer is D.`,
  },
  {
    n: 10, correct: 'B',
    statement: `The handle of a gallon of milk is plugged by a manufacturing defect. After removing the cap and pouring out some milk, the level of milk in the main part of the jug is lower than in the handle, as shown in the figure. Which statement is true of the gauge pressure $$P$$ of the milk at the bottom of the jug? $$\\rho$$ is the density of the milk.`,
    choices: {
      A: '$$P = \\rho g h$$',
      B: '$$P = \\rho g H$$',
      C: '$$\\rho g H < P < \\rho g h$$',
      D: '$$P > \\rho g h$$',
      E: '$$P < \\rho g H$$',
    },
    figures: [F17(10)], topics: ['Mechanics'], tags: ['pressure', 'fluid statics'],
    solution: `Gauge pressure is referenced against ambient atmospheric pressure. The larger part of the milk container is open to the atmosphere, so the gauge pressure is zero at height $$H$$ (the milk surface in the main part of the jug). Therefore, at the bottom of the jug

$$P = \\rho g H,$$

and the answer is B.

Note: The gauge pressure at the milk surface in the plugged handle is __negative__ — a region of low-pressure air trapped by the plug acts as suction, pulling milk up into the handle above the level in the main jug.`,
  },
  {
    n: 11, correct: 'B',
    statement: `__The following information applies to questions 11 and 12.__

A small hard solid sphere of mass $$m$$ and negligible radius is connected to a thin rod of length $$L$$ and mass $$2m$$. A second small hard solid sphere, of mass $$M$$ and negligible radius, is fired perpendicularly at the rod at a distance $$h$$ above the sphere attached to the rod, and sticks to it.

In order for the rod not to rotate after the collision, the second sphere should hit the thin rod at`,
    choices: {
      A: '$$h = 0$$',
      B: '$$h = L/3$$',
      C: '$$h = L/2$$',
      D: '$$h = L$$',
      E: 'Any location will work',
    },
    figures: [F17(11)], topics: ['Mechanics'], tags: ['center of mass', 'rotational dynamics', 'collisions'],
    solution: `In the absence of external horizontal forces, the system rotates about its center of mass. For the rod not to rotate after the collision, the impulse must be applied at the center of mass of the rod-plus-sphere system.

The center of mass of the rod (mass $$2m$$, center at $$L/2$$ above the small sphere) and the small sphere (mass $$m$$, at position 0) is

$$h_{cm} = \\frac{m \\cdot 0 + 2m \\cdot (L/2)}{m + 2m} = \\frac{L}{3}.$$

Therefore the second sphere should strike at $$h = L/3$$, and the answer is B.`,
  },
  {
    n: 12, correct: 'E',
    statement: `__The following information applies to questions 11 and 12.__

A small hard solid sphere of mass $$m$$ and negligible radius is connected to a thin rod of length $$L$$ and mass $$2m$$. A second small hard solid sphere, of mass $$M$$ and negligible radius, is fired perpendicularly at the rod at a distance $$h$$ above the sphere attached to the rod, and sticks to it.

In order for the rod not to rotate after the collision, the second sphere should have a mass $$M$$ given by`,
    choices: {
      A: '$$M = m$$',
      B: '$$M = 1.5m$$',
      C: '$$M = 2m$$',
      D: '$$M = 3m$$',
      E: 'Any mass $$M$$ will work.',
    },
    figures: [F17(12)], topics: ['Mechanics'], tags: ['center of mass', 'rotational dynamics', 'collisions'],
    solution: `No matter the magnitude of the applied force, as long as it is applied at the center of mass of the system, the net torque about the center of mass is zero. Therefore any mass $$M$$ will work, and the answer is E.`,
  },
  {
    n: 13, correct: 'D',
    statement: `A massless rope passes over a frictionless pulley. Particles of mass $$M$$ and $$M + m$$ are suspended from the two different ends of the rope. If $$m = 0$$, the tension $$T$$ in the pulley rope is $$Mg$$. If instead the value $$m$$ increases to infinity, the value of the tension`,
    choices: {
      A: 'stays constant',
      B: 'decreases, approaching a nonzero constant',
      C: 'decreases, approaching zero',
      D: 'increases, approaching a finite constant',
      E: 'increases to infinity',
    },
    figures: [], topics: ['Mechanics'], tags: ['pulleys/tension', 'extreme cases'],
    solution: `The acceleration of the Atwood machine is

$$a = \\frac{(M + m)g - Mg}{2M + m} = \\frac{mg}{2M + m}.$$

Applying Newton's second law to the block of mass $$M$$:

$$T - Mg = Ma \\implies T = 2M\\,\\frac{M + m}{2M + m}\\,g = 2Mg\\left(1 - \\frac{M}{2M + m}\\right).$$

As $$m \\to \\infty$$, the fraction $$\\frac{M}{2M + m} \\to 0$$, so $$T \\to 2Mg$$. The tension increases and approaches the finite constant $$2Mg$$. The answer is D.`,
  },
  {
    n: 14, correct: 'A',
    statement: `__The following information applies to questions 14 and 15.__

An object starting from rest can roll without slipping down an incline.

Which of the following four objects, each with mass $$M$$ and radius $$R$$, would have the largest acceleration down the incline?`,
    choices: {
      A: 'A uniform solid sphere',
      B: 'A uniform solid disk',
      C: 'A hollow spherical shell',
      D: 'A hoop',
      E: 'All objects would have the same acceleration.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'rotational dynamics'],
    solution: `Let the moment of inertia about the center of mass be $$I_c = cMR^2$$. The object rolling without slipping can be treated as rotating instantaneously about its contact point with the incline. By the parallel axis theorem the moment about that contact point is $$(1 + c)MR^2$$, giving acceleration

$$a = \\frac{MgR^2 \\sin\\theta}{(1 + c)MR^2} = \\frac{g\\sin\\theta}{1 + c}.$$

Objects with lower $$c$$ accelerate faster. The values are: solid sphere $$c = 2/5$$, solid disk $$c = 1/2$$, hollow shell $$c = 2/3$$, hoop $$c = 1$$. The solid sphere has the smallest $$c$$, so the answer is A.`,
  },
  {
    n: 15, correct: 'E',
    statement: `__The following information applies to questions 14 and 15.__

An object starting from rest can roll without slipping down an incline.

Which of the following four objects, each a uniform solid sphere released from rest, would have the largest speed after the center of mass has moved through a vertical distance $$h$$?`,
    choices: {
      A: 'A sphere of mass $$M$$ and radius $$R$$.',
      B: 'A sphere of mass $$2M$$ and radius $$\\tfrac{1}{2}R$$.',
      C: 'A sphere of mass $$M/2$$ and radius $$2R$$.',
      D: 'A sphere of mass $$3M$$ and radius $$3R$$.',
      E: 'All objects would have the same speed.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'energy conservation'],
    solution: `By the kinematic formula for constant acceleration,

$$v = \\sqrt{v_0^2 + 2ad} = \\sqrt{\\frac{2ah}{\\sin\\theta}} \\propto \\sqrt{a}.$$

So we need the object with the highest acceleration $$a = g\\sin\\theta/(1+c)$$. Since all four answer choices are solid spheres, $$c = 2/5$$ for each of them regardless of mass, radius, or density. Therefore all have the same acceleration and the same final speed. The answer is E.`,
  },
  {
    n: 16, correct: 'D',
    statement: `A rod moves freely between the horizontal floor and the slanted wall. When the end in contact with the floor is moving at $$v$$, what is the speed of the end in contact with the wall?`,
    choices: {
      A: '$$\\dfrac{v\\sin\\theta}{\\cos(\\alpha - \\theta)}$$',
      B: '$$\\dfrac{v\\sin(\\alpha - \\theta)}{\\cos(\\alpha + \\theta)}$$',
      C: '$$\\dfrac{v\\cos(\\alpha - \\theta)}{\\sin(\\alpha + \\theta)}$$',
      D: '$$\\dfrac{v\\cos\\theta}{\\cos(\\alpha - \\theta)}$$',
      E: '$$\\dfrac{v\\sin\\theta}{\\cos(\\alpha + \\theta)}$$',
    },
    figures: [F17(16)], topics: ['Mechanics'], tags: ['constraint kinematics', 'rigid body kinematics'],
    solution: `Let $$u$$ be the speed of the end in contact with the wall. For the length of the rod to remain constant, the component of velocity of each end __along the rod__ must be equal.

The floor end moves horizontally at speed $$v$$. The angle the rod makes with the horizontal is $$\\theta$$, so the component of $$v$$ along the rod is $$v\\cos\\theta$$.

The wall end moves along the slanted wall. The wall makes angle $$\\alpha$$ with the vertical, so the angle between the wall and the rod is $$\\alpha - \\theta$$. The component of $$u$$ along the rod is $$u\\cos(\\alpha - \\theta)$$.

Setting these equal:

$$v\\cos\\theta = u\\cos(\\alpha - \\theta) \\implies u = \\frac{v\\cos\\theta}{\\cos(\\alpha - \\theta)}.$$

The answer is D.`,
  },
  {
    n: 17, correct: 'B',
    statement: `An object is thrown directly downward from the top of a 180 meter tall building. It takes 1.0 seconds for the object to fall the last 60 meters. With what initial downward speed was the object thrown from the roof?`,
    choices: {
      A: '15 m/s',
      B: '25 m/s',
      C: '35 m/s',
      D: '55 m/s',
      E: 'insufficient information.',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `The average velocity during the last 1.0 s is $$60\\text{ m}/1.0\\text{ s} = 60$$ m/s. Because the acceleration is constant, this average velocity equals the instantaneous velocity 0.5 s before impact, so the velocity at impact is

$$v_f = 60\\text{ m/s} + (0.5\\text{ s})(10\\text{ m/s}^2) = 65\\text{ m/s.}$$

By the kinematic formula $$v_f^2 - v_i^2 = 2ad$$, with $$a = g = 10$$ m/s$$^2$$ and $$d = 180$$ m:

$$v_i = \\sqrt{v_f^2 - 2gh} = \\sqrt{(65)^2 - 2(10)(180)} = \\sqrt{4225 - 3600} = \\sqrt{625} = 25\\text{ m/s.}$$

The answer is B.`,
  },
  {
    n: 18, correct: 'D',
    statement: `A uniform disk is being pulled by a force $$F$$ through a string attached to its center of mass. Assume that the disk is rolling smoothly without slipping. At a certain instant of time, in which region of the disk (if any) is there a point moving with zero total acceleration?`,
    choices: {
      A: 'Region I',
      B: 'Region II',
      C: 'Region III',
      D: 'Region IV',
      E: 'All points on the disk have non-zero acceleration.',
    },
    figures: [F17(18)], topics: ['Mechanics'], tags: ['rolling without slipping', 'rotational dynamics', 'circular motion'],
    solution: `The total acceleration of any point on the disk is the sum of three contributions: centripetal acceleration $$\\vec{a}_c = r\\omega^2$$ (pointing toward the disk center), tangential acceleration $$\\vec{a}_t = r\\alpha$$ (tangent to the circular path), and the translational acceleration $$\\vec{a}$$ of the center (pointing right, in the direction of $$F$$).

For the total to be zero, $$\\vec{a}_c + \\vec{a}_t$$ must point due left to cancel $$\\vec{a}$$. Checking each region:

1. Region I: $$\\vec{a}_c$$ points lower-left, $$\\vec{a}_t$$ points lower-right — sum is roughly downward.
2. Region II: $$\\vec{a}_c$$ points lower-right, $$\\vec{a}_t$$ points upper-right — sum is roughly rightward.
3. Region III: $$\\vec{a}_c$$ points upper-right, $$\\vec{a}_t$$ points upper-left — sum is roughly upward.
4. Region IV: $$\\vec{a}_c$$ points upper-left, $$\\vec{a}_t$$ points lower-left — sum is roughly leftward.

Only in Region IV does $$\\vec{a}_c + \\vec{a}_t$$ point in a direction that can cancel $$\\vec{a}$$. Since $$\\|\\vec{a}_c + \\vec{a}_t\\| = r\\sqrt{\\omega^4 + \\alpha^2}$$ increases with $$r$$ and $$\\|\\vec{a}\\| = \\alpha R$$, by the intermediate value theorem there exists some $$r \\in [0, R]$$ for which these magnitudes are equal; adjusting the angle $$\\theta$$ within Region IV gives zero total acceleration. The answer is D.`,
  },
  {
    n: 19, correct: 'D',
    statement: `A puck is kicked up a ramp, which makes an angle of $$30^\\circ$$ with the horizontal. The graph below depicts the speed of the puck versus time. What is the coefficient of friction between the puck and the ramp?`,
    choices: {
      A: '0.07',
      B: '0.15',
      C: '0.22',
      D: '0.29',
      E: '0.37',
    },
    figures: [F17(19)], topics: ['Mechanics'], tags: ['friction', 'graph interpretation', '1d kinematics'],
    solution: `From the graph the deceleration while going up is $$a_1$$ and the acceleration while coming down is $$a_2$$, with a 3:1 ratio (the slope going up is steeper than going down by a factor of 3). Kinetic friction reverses direction when the puck reverses:

$$a_1 = g\\sin\\theta + \\mu g\\cos\\theta, \\qquad a_2 = g\\sin\\theta - \\mu g\\cos\\theta.$$

Dividing:

$$\\frac{a_1}{a_2} = \\frac{1 + \\mu\\cot\\theta \\cdot \\tan\\theta}{1 - \\mu\\cot\\theta \\cdot \\tan\\theta} = \\frac{1 + \\mu/\\tan 30^\\circ}{1 - \\mu/\\tan 30^\\circ} = \\frac{1 + \\mu\\sqrt{3}}{1 - \\mu\\sqrt{3}} = 3.$$

Solving: $$1 + \\mu\\sqrt{3} = 3(1 - \\mu\\sqrt{3}) \\implies 4\\mu\\sqrt{3} = 2 \\implies \\mu = \\frac{1}{2\\sqrt{3}} \\approx 0.29.$$

The answer is D.`,
  },
  {
    n: 20, correct: 'A',
    statement: `__The following information applies to questions 20, 21, and 22.__

A particle of mass $$m$$ moving at speed $$v_0$$ collides with a particle of mass $$M$$ which is originally at rest. The fractional momentum transfer $$f$$ is the absolute value of the final momentum of $$M$$ divided by the initial momentum of $$m$$.

If the collision is completely inelastic, under what condition will the fractional momentum transfer between the two objects be a maximum?`,
    choices: {
      A: '$$m/M \\ll 1$$',
      B: '$$0.5 < m/M < 1$$',
      C: '$$m = M$$',
      D: '$$1 < m/M < 2$$',
      E: '$$m/M \\gg 1$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'extreme cases'],
    solution: `By conservation of momentum for a completely inelastic collision, the final speed of the combined object is

$$v_1 = \\frac{mv_0}{m + M}.$$

The fractional momentum transfer is

$$f = \\frac{Mv_1}{mv_0} = \\frac{M}{m + M} = \\frac{1}{1 + m/M}.$$

This fraction approaches its maximum of 1 when $$m/M \\to 0$$, i.e., when $$m \\ll M$$. The answer is A.`,
  },
  {
    n: 21, correct: 'D',
    statement: `__The following information applies to questions 20, 21, and 22.__

A particle of mass $$m$$ moving at speed $$v_0$$ collides with a particle of mass $$M$$ which is originally at rest. The fractional momentum transfer $$f$$ is the absolute value of the final momentum of $$M$$ divided by the initial momentum of $$m$$.

If the collision is perfectly elastic, what is the maximum possible fractional momentum transfer, $$f_{\\max}$$?`,
    choices: {
      A: '$$0 < f_{\\max} < \\tfrac{1}{2}$$',
      B: '$$f_{\\max} = \\tfrac{1}{2}$$',
      C: '$$\\tfrac{1}{2} < f_{\\max} < \\tfrac{3}{2}$$',
      D: '$$f_{\\max} = 2$$',
      E: '$$f_{\\max} \\geq 3$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation', 'extreme cases'],
    solution: `The fractional momentum transfer is maximized when the final momentum of $$M$$ is maximal, equivalently when the final momentum of $$m$$ is minimal.

In the limit $$m \\ll M$$, the heavy mass $$M$$ acts as a stationary wall, and $$m$$ bounces back at speed $$v_0$$, giving final momentum $$-mv_0$$. By conservation of energy, the final speed of $$m$$ cannot exceed $$v_0$$, so this is indeed the optimal case.

The fractional transfer in this limit is

$$f_{\\max} = \\frac{|\\Delta p_m|}{p_{m,0}} = \\frac{mv_0 - (-mv_0)}{mv_0} = 2.$$

The answer is D.`,
  },
  {
    n: 22, correct: 'C',
    statement: `__The following information applies to questions 20, 21, and 22.__

A particle of mass $$m$$ moving at speed $$v_0$$ collides with a particle of mass $$M$$ which is originally at rest. The fractional momentum transfer $$f$$ is the absolute value of the final momentum of $$M$$ divided by the initial momentum of $$m$$.

The fractional energy transfer is the absolute value of the final kinetic energy of $$M$$ divided by the initial kinetic energy of $$m$$.

If the collision is perfectly elastic, under what condition will the fractional energy transfer between the two objects be a maximum?`,
    choices: {
      A: '$$m/M \\ll 1$$',
      B: '$$0.5 < m/M < 1$$',
      C: '$$m = M$$',
      D: '$$1 < m/M < 2$$',
      E: '$$m/M \\gg 1$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'energy conservation', 'extreme cases'],
    solution: `The fractional energy transfer cannot exceed 1 without violating conservation of energy.

In the special case of two equal masses colliding elastically head-on, their velocities are simply swapped: the incoming particle stops and the target acquires all the kinetic energy. Thus the fractional energy transfer is exactly 1 when $$m = M$$, which is the maximum possible value. The answer is C.`,
  },
  {
    n: 23, correct: 'C',
    statement: `A spring has a length of 1.0 meter when there is no tension on it. The spring is then stretched between two points 10 meters apart. A wave pulse travels between the two end points in the spring in a time of 1.0 seconds. The spring is now stretched between two points that are 20 meters apart. The new time it takes for a wave pulse to travel between the ends of the spring is closest to`,
    choices: {
      A: '0.5 seconds',
      B: '0.7 seconds',
      C: '1 second',
      D: '1.4 seconds',
      E: '2 seconds',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'scaling'],
    solution: `The speed of a transverse wave on a spring is $$v = \\sqrt{T/\\mu}$$, where $$T$$ is the tension and $$\\mu$$ is the linear mass density.

When the spring is stretched from 10 m to 20 m (original length 1 m, so both are in the highly-stretched regime), the tension approximately doubles (by Hooke's law, since the extension roughly doubles) while the linear mass density $$\\mu = m/L$$ is halved (same mass, double the length). The wave speed therefore changes by a factor of

$$\\frac{v_2}{v_1} = \\sqrt{\\frac{2T_1}{\\mu_1/2}} / \\sqrt{\\frac{T_1}{\\mu_1}} = \\sqrt{4} = 2.$$

However, the length of the spring also doubles, so the travel time is

$$t_2 = \\frac{2L}{2v_1} = \\frac{L}{v_1} = t_1 = 1\\text{ s.}$$

The answer is C.`,
  },
  {
    n: 24, correct: 'A',
    statement: `A ball of mass $$m$$ moving at speed $$v$$ collides with a massless spring of spring constant $$k$$ mounted on a stationary box of mass $$M$$ in free space. No mechanical energy is lost in the collision. If the system does not rotate, what is the maximum compression $$x$$ of the spring?`,
    choices: {
      A: '$$x = v\\sqrt{\\dfrac{mM}{(m+M)k}}$$',
      B: '$$x = v\\sqrt{\\dfrac{m}{k}}$$',
      C: '$$x = v\\sqrt{\\dfrac{M}{k}}$$',
      D: '$$x = v\\sqrt{\\dfrac{m+M}{k}}$$',
      E: '$$x = v\\sqrt{\\dfrac{(m+M)^3}{mMk}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'energy conservation', 'momentum conservation', 'reduced mass'],
    solution: `At maximum compression, the ball and box have the same velocity (no relative motion). This is identical to a perfectly inelastic collision scenario — the kinetic energy at that moment is

$$K_f = \\frac{1}{2}(m + M)\\left(\\frac{mv}{m+M}\\right)^2 = \\frac{m}{m+M} \\cdot \\frac{1}{2}mv^2.$$

The energy stored in the spring equals the lost kinetic energy:

$$U = \\frac{1}{2}mv^2 - \\frac{m}{m+M}\\cdot\\frac{1}{2}mv^2 = \\frac{M}{m+M}\\cdot\\frac{1}{2}mv^2.$$

Setting $$U = \\frac{1}{2}kx^2$$ and solving:

$$x = \\sqrt{\\frac{2U}{k}} = v\\sqrt{\\frac{mM}{(m+M)k}}.$$

The answer is A.`,
  },
  {
    n: 25, correct: 'A',
    statement: `A planet orbits around a star $$S$$, as shown in the figure. The semi-major axis of the orbit is $$a$$. The perigee, namely the shortest distance between the planet and the star is $$0.5a$$. When the planet passes point $$P$$ (on the line through the star and perpendicular to the major axis), its speed is $$v_1$$. What is its speed $$v_2$$ when it passes the perigee?`,
    choices: {
      A: '$$v_2 = \\dfrac{3}{\\sqrt{5}}v_1$$',
      B: '$$v_2 = \\dfrac{3}{\\sqrt{7}}v_1$$',
      C: '$$v_2 = \\dfrac{2}{\\sqrt{3}}v_1$$',
      D: '$$v_2 = \\dfrac{\\sqrt{7}}{\\sqrt{3}}v_1$$',
      E: '$$v_2 = 4v_1$$',
    },
    figures: [F17(25)], topics: ['Mechanics'], tags: ['kepler\'s laws', 'energy conservation', 'gravitation', 'angular momentum conservation'],
    solution: `Since the semi-major axis is $$a$$ and the perigee is $$a/2$$, the apogee is $$3a/2$$. The sum of distances from any point on the ellipse to both foci equals $$2a$$. Point $$P$$ is on the perpendicular through the star, so

$$SP + \\sqrt{SP^2 + a^2} = 2a \\implies SP = \\frac{3a}{4}.$$

By the vis-viva equation, $$v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)$$:

$$\\frac{v_2^2}{v_1^2} = \\frac{\\frac{2}{a/2} - \\frac{1}{a}}{\\frac{2}{3a/4} - \\frac{1}{a}} = \\frac{4 - 1}{\\frac{8}{3} - 1} = \\frac{3}{5/3} = \\frac{9}{5}.$$

Therefore $$v_2 = \\dfrac{3}{\\sqrt{5}}v_1$$, and the answer is A.`,
  },
]
