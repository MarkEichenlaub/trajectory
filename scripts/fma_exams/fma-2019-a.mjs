// Digitized 2019 F=ma Exam A questions. Sources:
// Exam: work/fma/fma-2019-a.pdf (text extracted to work/fma/fma-2019-a.txt)
// Solutions: work/fma/fma-2019-a-sol.pdf (←CORRECT markers + worked solutions)
// Cross-check: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections 2019.1 through 2019.25 (Exam A solutions; Exam B begins at pdfpage 276).
// Figures: work/figure_manifest.json, key "fma-2019-a" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions.
//
// Q12 note: the ←CORRECT marker appears immediately after "(B)" in the PDF;
//   graph B shows τ decreasing linearly to zero, consistent with τ_n = τ_0 − (1−α)t_n.
// Q16 note: the official solution awards credit to both A (3.5 m) and C (14 m)
//   due to an ambiguous use of "smallest"; ←CORRECT marker is on C (14 m), confirmed
//   by book. We use C.
// Q22 note: ←CORRECT marker appears after "(C)" in the PDF; graph C shows ratio = 0
//   below a threshold ω and approaching 1 asymptotically, confirmed by book.
// Q23 note: ←CORRECT marker in the PDF reads "←COR- RECT" split across a line break,
//   appearing after option (D). Confirmed D by book.

const F19A = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-a/fma-2019-a-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2019-a'
export const questions = [
  {
    n: 1, correct: 'C',
    statement: `A coin of mass $$m$$ is dropped straight down from the top of a very tall building. As the coin approaches terminal speed, which is true of the net force on the coin?`,
    choices: {
      A: 'The net force on the coin is upward.',
      B: 'The net force on the coin is 0.',
      C: 'The net force on the coin is downward, with a magnitude less than $$mg$$.',
      D: 'The net force on the coin is downward, with a magnitude equal to $$mg$$.',
      E: 'The net force on the coin is downward, with a magnitude greater than $$mg$$.',
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'newton\'s laws', 'free-body diagrams'],
    solution: `Before the coin reaches terminal velocity it is still accelerating downward, so the net force is directed downward. However, because the coin has nonzero speed there is an upward drag force opposing its motion. The only other force is gravity $$mg$$ downward, so the net downward force equals $$mg$$ minus the drag — which is less than $$mg$$ in magnitude.

The answer is C.`,
  },
  {
    n: 2, correct: 'E',
    statement: `A mass of $$3M$$ moving at a speed $$v$$ collides with a mass of $$M$$ moving directly toward it, also with a speed $$v$$. If the collision is completely elastic, the total kinetic energy after the collision is $$K_e$$. If the two masses stick together, the total kinetic energy after the collision is $$K_s$$. What is the ratio $$K_e/K_s$$?`,
    choices: {
      A: '$$1/2$$',
      B: '$$1$$',
      C: '$$\\sqrt{2}$$',
      D: '$$2$$',
      E: '$$4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'energy conservation', 'momentum conservation'],
    solution: `For an elastic collision kinetic energy is conserved, so $$K_e$$ equals the total kinetic energy before the collision:

$$K_e = \\tfrac{1}{2}(3M)v^2 + \\tfrac{1}{2}Mv^2 = 2Mv^2.$$

For the completely inelastic collision, momentum conservation gives the speed $$w$$ of the merged object:

$$p_i = 3Mv - Mv = 2Mv = (3M + M)w \\implies w = \\tfrac{v}{2}.$$

The kinetic energy after the inelastic collision is:

$$K_s = \\tfrac{1}{2}(4M)w^2 = \\tfrac{1}{2}(4M)\\tfrac{v^2}{4} = \\tfrac{1}{2}Mv^2.$$

Therefore:

$$\\frac{K_e}{K_s} = \\frac{2Mv^2}{\\tfrac{1}{2}Mv^2} = 4.$$

The answer is E.`,
  },
  {
    n: 3, correct: 'E',
    statement: `A block of mass $$m$$ is launched horizontally onto a curved wedge of mass $$M$$ at a velocity $$v$$. What is the maximum height reached by the block after it shoots off the vertical segment of the wedge? Assume all surfaces are frictionless; both the block and the curved wedge are free to move. The curved wedge does not tilt or topple.`,
    choices: {
      A: '$$\\dfrac{v^2}{2g}$$',
      B: '$$\\left(\\dfrac{m}{m+M}\\right)^{\\!2}\\cdot\\dfrac{v^2}{2g}$$',
      C: '$$\\left(\\dfrac{M}{m+M}\\right)^{\\!2}\\cdot\\dfrac{v^2}{2g}$$',
      D: '$$\\dfrac{m}{m+M}\\cdot\\dfrac{v^2}{2g}$$',
      E: '$$\\dfrac{M}{m+M}\\cdot\\dfrac{v^2}{2g}$$',
    },
    figures: [F19A(3)], topics: ['Mechanics'], tags: ['energy conservation', 'momentum conservation', 'collisions', 'reference frames'],
    solution: `When the block shoots off the vertical part of the wedge, both the block and the wedge share the same horizontal velocity $$w$$ (the block leaves the wedge vertically in the wedge's frame). Horizontal momentum conservation gives:

$$mv = (m + M)w \\implies w = \\frac{mv}{m+M}.$$

The initial kinetic energy is $$\\tfrac{1}{2}mv^2$$. The final kinetic energy associated with the common horizontal motion is:

$$\\frac{p^2}{2(m+M)} = \\frac{m^2v^2}{2(m+M)}.$$

The energy converted to vertical kinetic energy (and then to height) of the block is:

$$\\Delta E = \\tfrac{1}{2}mv^2 - \\frac{m^2v^2}{2(m+M)} = \\frac{Mmv^2}{2(m+M)}.$$

Setting $$\\Delta E = mgh$$ and solving:

$$h = \\frac{Mv^2}{2(m+M)g} = \\frac{M}{m+M}\\cdot\\frac{v^2}{2g}.$$

The answer is E.`,
  },
  {
    n: 4, correct: 'C',
    statement: `A massless spring hangs from the ceiling, and a mass is hung from the bottom of it. The mass is supported so that initially the tension in the spring is zero. The mass is then suddenly released. At the bottom of its trajectory, the mass is 5 centimeters from its original position. Find its oscillation period.`,
    choices: {
      A: '$$0.05 \\ \\text{s}$$',
      B: '$$0.07 \\ \\text{s}$$',
      C: '$$0.31 \\ \\text{s}$$',
      D: '$$0.44 \\ \\text{s}$$',
      E: 'Not enough information is given.',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'energy conservation'],
    solution: `When released the mass oscillates about the new equilibrium position, which is midway between the release point and the lowest point. So the new equilibrium is at $$y = 2.5 \\ \\text{cm} = 0.025 \\ \\text{m}$$ below the original position.

At equilibrium, $$mg = ky$$, so $$m/k = y/g$$. The angular frequency is:

$$\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{g}{y}},$$

and the period is:

$$T = \\frac{2\\pi}{\\omega} = 2\\pi\\sqrt{\\frac{y}{g}} = 2\\pi\\sqrt{\\frac{0.025}{10}} \\approx 0.314 \\ \\text{s}.$$

The answer is C.`,
  },
  {
    n: 5, correct: 'C',
    statement: `A cylinder has a radius $$R$$ and weight $$G$$. You try to roll it over a step of height $$h < R$$. The minimum force needed to roll the cylinder over is:`,
    choices: {
      A: '$$\\dfrac{\\sqrt{2Rh - h^2}}{R - h}\\,G$$',
      B: '$$\\dfrac{\\sqrt{2Rh - h^2}}{2R - h}\\,G$$',
      C: '$$\\dfrac{\\sqrt{2Rh - h^2}}{2R}\\,G$$',
      D: '$$\\dfrac{\\sqrt{2Rh - h^2}}{R}\\,G$$',
      E: '$$\\dfrac{\\sqrt{Rh - h^2}}{2R}\\,G$$',
    },
    figures: [F19A(5)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium', 'rotational dynamics'],
    solution: `To roll the cylinder over the step we must overcome the gravitational torque about the corner of the step. The horizontal distance from the corner to the cylinder's center is:

$$d = \\sqrt{R^2 - (R-h)^2} = \\sqrt{2Rh - h^2}.$$

This is the moment arm for gravity, so the gravitational torque about the corner is:

$$\\tau_g = G\\sqrt{2Rh - h^2}.$$

To minimize the required force we maximize its moment arm. The maximum possible moment arm for a force applied to the cylinder is the diameter $$2R$$ (applying the force tangentially at the point diametrically opposite the corner). Therefore:

$$F_{\\min} = \\frac{\\tau_g}{2R} = \\frac{G\\sqrt{2Rh - h^2}}{2R}.$$

The answer is C.`,
  },
  {
    n: 6, correct: 'A',
    statement: `A ball is released from rest above an inclined plane and bounces elastically down the plane. As the ball progresses down the plane, the time and the distance between each collision will:`,
    choices: {
      A: 'remain the same, and increase.',
      B: 'increase, and remain the same.',
      C: 'decrease, and increase.',
      D: 'decrease, and remain the same.',
      E: 'both remain the same.',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'reference frames', 'projectile motion'],
    solution: `Work in a coordinate system with the $$x$$-axis along the incline and the $$y$$-axis perpendicular to it.

In the $$y$$-direction the ball bounces elastically with acceleration $$-g\\cos\\alpha$$ (where $$\\alpha$$ is the incline angle). The bounce is perfectly elastic, so the $$y$$-speed just after each bounce equals the $$y$$-speed just before it — the perpendicular motion is exactly repetitive. Therefore __the time between bounces is constant__.

In the $$x$$-direction gravity provides a steady acceleration $$g\\sin\\alpha$$ down the slope. Between each bounce the ball gains more speed along the slope, so it travels a greater distance before the next bounce. Therefore __the distance between collisions increases__.

The answer is A.`,
  },
  {
    n: 7, correct: 'B',
    statement: `An object of mass $$m$$ is attached to the end of a massless rod of length $$L$$. The other end of the rod is attached to a frictionless pivot. The object is raised so that its height is $$0.8L$$ above the pivot, as shown in the figure. After the object is released from rest, what is the tension in the rod when it is horizontal?`,
    choices: {
      A: '$$0.6\\,mg$$',
      B: '$$1.6\\,mg$$',
      C: '$$2.6\\,mg$$',
      D: '$$3.6\\,mg$$',
      E: '$$5.36\\,mg$$',
    },
    figures: [F19A(7)], topics: ['Mechanics'], tags: ['energy conservation', 'circular motion', 'tension', 'rotational dynamics'],
    solution: `When the rod reaches the horizontal position the object has descended $$h = 0.8L$$ from its starting height. By energy conservation:

$$\\tfrac{1}{2}mv^2 = mgh = m(0.8L)g \\implies v^2 = 1.6gL.$$

When the rod is horizontal, the object moves in a circle and the tension $$T$$ in the rod provides the centripetal force (gravity acts perpendicularly to the rod at this instant and does not contribute to the centripetal direction):

$$T = \\frac{mv^2}{L} = \\frac{m(1.6gL)}{L} = 1.6\\,mg.$$

The answer is B.`,
  },
  {
    n: 8, correct: 'C',
    statement: `The mass and the radius of the Earth are $$M$$ and $$R$$. If an object starting at a distance of $$R$$ from the Earth's surface is moving at a velocity $$v_0 = \\sqrt{\\dfrac{2GM}{3R}}$$ tangentially, what is its trajectory?`,
    choices: {
      A: 'A parabola or a hyperbola',
      B: 'A circle around Earth',
      C: 'An ellipse whose minimum distance from the Earth\'s surface is $$R$$',
      D: 'An ellipse whose maximum distance from the Earth\'s surface is $$R$$',
      E: 'A straight line along the direction of the initial velocity',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'kepler\'s laws', 'gravitation', 'energy conservation'],
    solution: `The object is at distance $$r = 2R$$ from Earth's center (one Earth-radius above the surface). At radius $$r$$, the relevant speeds are:

- Circular orbit speed: $$v_c = \\sqrt{GM/r} = \\sqrt{GM/(2R)}$$
- Escape speed: $$v_{\\text{esc}} = \\sqrt{2GM/r} = \\sqrt{GM/R}$$

The given speed is $$v_0 = \\sqrt{2GM/(3R)}$$. Comparing:

$$v_c^2 = \\frac{GM}{2R}, \\quad v_0^2 = \\frac{2GM}{3R}, \\quad v_{\\text{esc}}^2 = \\frac{GM}{R}.$$

Since $$v_c^2 < v_0^2 < v_{\\text{esc}}^2$$, the orbit is elliptical with the launch point being the closest approach (perigee). The minimum distance from Earth's surface is therefore $$R$$.

The answer is C.`,
  },
  {
    n: 9, correct: 'E',
    statement: `A wheel of radius $$R$$ is rolling without slipping with angular velocity $$\\omega$$. For point A on the wheel at an angle $$\\theta$$ with respect to the vertical, shown in the figure, what is the magnitude of its velocity with respect to the ground?`,
    choices: {
      A: '$$\\omega R$$',
      B: '$$\\omega R \\sin(|\\theta|/2)$$',
      C: '$$\\sqrt{2}\\,\\omega R \\sin(|\\theta|/2)$$',
      D: '$$2\\omega R \\sin(|\\theta|)$$',
      E: '$$2\\omega R \\sin(|\\theta|/2)$$',
    },
    figures: [F19A(9)], topics: ['Mechanics'], tags: ['rolling without slipping', 'rigid body kinematics', 'constraint kinematics'],
    solution: `The velocity of point A is the sum of the center-of-mass velocity $$v_c = \\omega R$$ and the velocity of A relative to the center $$\\omega R$$ at angle $$\\theta$$ from vertical. Working out the components:

$$v_x = v_c - \\omega R\\cos\\theta = \\omega R(1 - \\cos\\theta), \\qquad v_y = -\\omega R\\sin\\theta.$$

The squared speed is:

$$v_A^2 = (\\omega R)^2\\bigl[(1-\\cos\\theta)^2 + \\sin^2\\theta\\bigr] = (\\omega R)^2 \\cdot 2(1 - \\cos\\theta).$$

Using the half-angle identity $$1 - \\cos\\theta = 2\\sin^2(\\theta/2)$$:

$$v_A = \\omega R\\sqrt{4\\sin^2(\\theta/2)} = 2\\omega R\\sin(|\\theta|/2).$$

Equivalently, in rolling without slipping the instantaneous axis of rotation is at the contact point, and the distance from the contact point to A is $$2R\\sin(|\\theta|/2)$$, giving the same result directly.

The answer is E.`,
  },
  {
    n: 10, correct: 'D',
    statement: `A flat uniform disk of radius $$2R$$ has a hole of radius $$R$$ removed from the center. The resulting annulus is then cut in half along the diameter. The remaining shape has mass $$M$$. What is the moment of inertia of this shape, about the axis of rotational symmetry of the original disk?`,
    choices: {
      A: '$$\\dfrac{45}{32}MR^2$$',
      B: '$$\\dfrac{7}{6}MR^2$$',
      C: '$$\\dfrac{8}{5}MR^2$$',
      D: '$$\\dfrac{5}{2}MR^2$$',
      E: '$$\\dfrac{15}{8}MR^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['moment of inertia', 'rotational motion', 'symmetry'],
    solution: `Let the original full disk (radius $$2R$$, before removing the hole) have mass $$m$$. The moment of inertia of the full disk is $$\\tfrac{1}{2}m(2R)^2 = 2mR^2$$. The removed central disk (radius $$R$$, mass $$m/4$$) has moment of inertia $$\\tfrac{1}{2}(m/4)R^2 = mR^2/8$$. So the annulus has:

$$I_{\\text{annulus}} = 2mR^2 - \\frac{mR^2}{8} = \\frac{15}{8}mR^2.$$

The annulus has mass $$m - m/4 = 3m/4$$, and the final semi-annulus has mass $$M = \\tfrac{1}{2}(3m/4) = 3m/8$$, so $$m = 8M/3$$.

Cutting the annulus in half halves the mass but does not change the moment of inertia formula (each half has half the moment of inertia of the whole):

$$I = \\frac{1}{2}\\cdot\\frac{15}{8}mR^2 = \\frac{15}{16}mR^2 = \\frac{15}{16}\\cdot\\frac{8M}{3}R^2 = \\frac{5}{2}MR^2.$$

The answer is D.`,
  },
  {
    n: 11, correct: 'B',
    statement: `To test the speed of a model car, you time the car with a stopwatch as it travels a distance of 100 m. You record a time of 5.0 s, and your measurement has an uncertainty of 0.2 s. What is the uncertainty in your estimate of the car's speed? Assume that the car travels at a constant speed and the distance of 100 m is known very precisely.`,
    choices: {
      A: '$$v = 20 \\pm 0.16 \\ \\text{m/s}$$',
      B: '$$v = 20 \\pm 0.8 \\ \\text{m/s}$$',
      C: '$$v = 20 \\pm 1.0 \\ \\text{m/s}$$',
      D: '$$v = 20 \\pm 1.25 \\ \\text{m/s}$$',
      E: '$$v = 20 \\pm 4.0 \\ \\text{m/s}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation'],
    solution: `The speed is $$v = x/t$$. Propagating the uncertainty in $$t$$:

$$\\Delta v = \\left|\\frac{dv}{dt}\\right|\\Delta t = \\frac{x}{t^2}\\,\\Delta t = v\\,\\frac{\\Delta t}{t} = 20\\,\\frac{0.2}{5.0} = 0.8 \\ \\text{m/s}.$$

The answer is B.`,
  },
  {
    n: 12, correct: 'B',
    statement: `A steel ball bearing bounces vertically on a steel plate. If the speed of the ball just before a bounce is $$v_i$$, the speed of the ball immediately afterward is $$v_f = \\alpha v_i$$, with $$\\alpha < 1$$. Which one of the following graphs best shows the time between successive bounces, $$\\tau$$, as a function of time?`,
    choices: {
      A: 'Graph showing $$\\tau$$ constant (horizontal line).',
      B: 'Graph showing $$\\tau$$ decreasing linearly to zero.',
      C: 'Graph showing $$\\tau$$ decreasing rapidly (concave up) toward zero.',
      D: 'Graph showing $$\\tau$$ increasing with a concave-up curve.',
      E: 'Graph showing $$\\tau$$ increasing and leveling off (concave down).',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'graph interpretation', 'series/geometric sums'],
    solution: `The speed just before the $$n$$-th bounce is $$v_n = \\alpha^n v_i$$, so the time between bounces $$n$$ and $$n+1$$ is:

$$\\tau_n = \\frac{2v_n}{g} = \\tau_0\\,\\alpha^n, \\qquad \\tau_0 = \\frac{2v_i}{g}.$$

The total time to the $$n$$-th bounce is:

$$t_n = \\tau_0(\\alpha + \\alpha^2 + \\cdots + \\alpha^{n-1}) = \\frac{\\tau_0\\,\\alpha(1 - \\alpha^{n-1})}{1 - \\alpha} = \\frac{\\tau_1 - \\tau_n}{1 - \\alpha}.$$

Solving for $$\\tau_n$$:

$$\\tau_n = \\tau_1 - (1 - \\alpha)\\,t_n.$$

So $$\\tau$$ is a __linearly decreasing__ function of the actual elapsed time $$t$$, eventually reaching zero (when the ball comes to rest). This matches graph B.

The answer is B.`,
  },
  {
    n: 13, correct: 'C',
    statement: `A juggler juggles $$N$$ identical balls, catching and tossing one ball at a time. Assuming that the juggler requires a minimum time $$T$$ between ball tosses, the minimum possible power required for the juggler to continue juggling is proportional to`,
    choices: {
      A: '$$N^0$$',
      B: '$$N^1$$',
      C: '$$N^2$$',
      D: '$$N^3$$',
      E: '$$N^4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'power', 'scaling', 'estimation'],
    solution: `The optimal strategy is to toss each ball so that it stays in the air for exactly $$NT$$ — the minimum time that allows the juggler to handle all $$N$$ balls before catching the first one again. Tossing higher would increase the time between tosses but would cost disproportionately more energy, increasing power.

For a ball with time of flight $$NT = 2v/g$$, the initial speed is $$v \\propto N$$, so the energy per ball is $$\\tfrac{1}{2}mv^2 \\propto N^2$$.

The power equals energy per toss divided by time per toss $$T$$, so:

$$P \\propto \\frac{N^2}{T} \\propto N^2.$$

The answer is C.`,
  },
  {
    n: 14, correct: 'D',
    statement: `A man standing at $$30^\\circ$$ latitude fires a bullet northward at a speed of 200 m/s. The radius of the Earth is 6371 km. What is the sideways deflection of the bullet after traveling 100 m?`,
    choices: {
      A: '3.1 mm west',
      B: '1.8 mm west',
      C: '0 mm',
      D: '1.8 mm east',
      E: '3.1 mm east',
    },
    figures: [], topics: ['Mechanics'], tags: ['non-inertial frames', 'reference frames', 'equations of motion'],
    solution: `The Coriolis acceleration is $$\\vec{a} = -2\\vec{\\omega} \\times \\vec{v}$$. For a bullet fired northward at latitude $$\\theta = 30^\\circ$$, the magnitude of the horizontal Coriolis acceleration is:

$$a = 2\\omega v \\sin\\theta,$$

where $$\\omega = 2\\pi/\\text{day}$$ and $$v = 200 \\ \\text{m/s}$$.

The time of flight over distance $$L = 100 \\ \\text{m}$$ is $$t = L/v$$. The deflection is:

$$d = \\tfrac{1}{2}a t^2 = \\tfrac{1}{2}(2\\omega v \\sin\\theta)\\frac{L^2}{v^2} = \\frac{\\omega L^2 \\sin\\theta}{v} = \\frac{(2\\pi/86400)(100)^2 \\sin 30^\\circ}{200} \\approx 1.8 \\ \\text{mm}.$$

The direction: the cross product $$-2\\vec{\\omega} \\times \\vec{v}$$ for a northward bullet in the Northern Hemisphere gives an eastward deflection.

The answer is D.`,
  },
  {
    n: 15, correct: 'B',
    statement: `An upright rod of length $$\\ell$$ is launched into the air with vertical velocity $$v_y$$. It is given enough angular momentum so that the rod rotates by an angle of $$2\\pi$$ before landing. Find the initial horizontal velocity of the bottom of the rod.`,
    choices: {
      A: '$$\\dfrac{2\\ell g}{v_y^2}$$',
      B: '$$\\dfrac{\\pi \\ell g}{2v_y}$$',
      C: '$$\\sqrt{\\ell g}$$',
      D: '$$\\dfrac{2v_y}{\\ell g}$$',
      E: '$$\\dfrac{2v_y^2}{\\pi\\sqrt{\\ell g}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational motion', 'projectile motion', 'angular momentum'],
    solution: `The time of flight (up and back to the same height) is:

$$t = \\frac{2v_y}{g}.$$

For the rod to complete exactly one full rotation ($$2\\pi$$ radians) during this time with angular speed $$\\omega$$:

$$t = \\frac{2\\pi}{\\omega} \\implies \\omega = \\frac{\\pi g}{v_y}.$$

The initial horizontal velocity of the __end__ of the rod is related to $$\\omega$$ by the distance from the center of mass (which is at $$\\ell/2$$ from each end):

$$v_x = \\omega \\cdot \\frac{\\ell}{2} = \\frac{\\pi g}{v_y}\\cdot\\frac{\\ell}{2} = \\frac{\\pi \\ell g}{2v_y}.$$

The answer is B.`,
  },
  {
    n: 16, correct: 'C',
    statement: `The depth of a well, $$d$$, is measured by dropping a stone into it and measuring the time $$t$$ until the splash is heard at the top. What is the smallest value of $$d$$ for which ignoring the time for the sound to travel gives less than a 5% error in the depth measurement? The speed of sound in air is 330 m/s.`,
    choices: {
      A: '3.5 m',
      B: '7 m',
      C: '14 m',
      D: '54 m',
      E: '330 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'estimation', 'error analysis'],
    solution: `The true fall time is $$t = \\sqrt{2d/g}$$. The sound travel time is $$\\Delta t = d/v_s$$. The measured total time is $$t + \\Delta t$$, and using it naively overestimates $$d$$:

$$d + \\Delta d = \\tfrac{1}{2}g(t + \\Delta t)^2 \\approx \\tfrac{1}{2}gt^2 + gt\\,\\Delta t = d + gt\\,\\Delta t.$$

So the relative error is:

$$\\frac{\\Delta d}{d} \\approx \\frac{gt\\,\\Delta t}{d} = \\frac{g\\sqrt{2d/g}\\cdot(d/v_s)}{d} = \\frac{\\sqrt{2dg}}{v_s}.$$

Setting this less than or equal to 5%:

$$\\frac{\\sqrt{2dg}}{v_s} \\leq 0.05 \\implies d \\leq \\frac{(0.05)^2 v_s^2}{2g} = \\frac{(0.05)^2(330)^2}{20} \\approx 13.6 \\ \\text{m}.$$

AAPT accepted both A (3.5 m) and C (14 m) here, because the problem asks for the "smallest" depth and that phrase has two valid readings: the smallest depth at which the error first reaches 5% (giving 14 m, the upper bound), or the smallest depth at which the error can be as large as 5% (giving a smaller value). The canonical answer is C.

The answer is C.`,
  },
  {
    n: 17, correct: 'A',
    statement: `The following information applies to questions 17 and 18.

A launcher is designed to shoot objects horizontally across an ice rink. It consists of two boards of negligible mass connected via a spring-loaded hinge, which exerts a constant torque $$\\tau$$ on each board to keep them together. For both problems, neglect friction with either the ice or the launch boards.

A hard disc is pushed into the launcher between the boards until the boards make contact with it a distance $$\\ell$$ from the hinge and are open to an angle $$\\theta$$, as shown in the figure. What is the minimum force necessary to hold the disc in this position?`,
    choices: {
      A: '$$2\\tau\\sin(\\theta/2)/\\ell$$',
      B: '$$2\\tau\\cos(\\theta/2)/\\ell$$',
      C: '$$\\tau\\cos(\\theta)/\\ell$$',
      D: '$$\\tau\\tan(\\theta)/\\ell$$',
      E: '$$2\\tau\\tan(\\theta)/\\ell$$',
    },
    figures: [F19A(17)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium', 'free-body diagrams'],
    solution: `Each board exerts a force of magnitude $$F = \\tau/\\ell$$ on the disc directed toward the disc's center (perpendicular to the board at the contact point). By symmetry, the two forces are symmetric about the axis of the launcher.

Each force makes an angle $$\\theta/2$$ with the symmetry axis. The components perpendicular to the axis cancel; the components parallel to the axis (directed outward along the launcher axis) add:

$$F_{\\text{tot}} = 2F\\sin(\\theta/2) = \\frac{2\\tau}{\\ell}\\sin(\\theta/2).$$

The minimum holding force must equal $$F_{\\text{tot}}$$.

The answer is A.`,
  },
  {
    n: 18, correct: 'D',
    statement: `The following information applies to questions 17 and 18.

A launcher is designed to shoot objects horizontally across an ice rink. It consists of two boards of negligible mass connected via a spring-loaded hinge, which exerts a constant torque $$\\tau$$ on each board to keep them together. For both problems, neglect friction with either the ice or the launch boards.

The disc is removed and replaced with a pie-shaped wedge of the same mass $$m$$, so that the hinge is still initially held open at an angle $$\\theta$$, as shown in the following figure. If the wedge is released from rest, what is its speed after it exits the launcher?`,
    choices: {
      A: '$$\\sqrt{\\dfrac{\\tau}{2m\\theta}}$$',
      B: '$$\\sqrt{\\dfrac{4\\tau\\theta}{m}}$$',
      C: '$$\\sqrt{\\dfrac{\\tau\\theta^2}{2m}}$$',
      D: '$$\\sqrt{\\dfrac{2\\tau\\theta}{m}}$$',
      E: '$$\\sqrt{\\dfrac{2\\tau}{m\\theta}}$$',
    },
    figures: [F19A(18)], topics: ['Mechanics'], tags: ['energy conservation', 'torque', 'work-energy theorem'],
    solution: `The torque $$\\tau$$ is constant. As the hinge closes through angle $$\\theta$$, the work done by the hinge on the wedge is:

$$W = \\tau\\theta.$$

(This is analogous to $$W = Fd$$ for a constant linear force.) All of this work goes into the kinetic energy of the wedge (the boards are massless and the ice is frictionless):

$$\\tau\\theta = \\tfrac{1}{2}mv^2 \\implies v = \\sqrt{\\frac{2\\tau\\theta}{m}}.$$

The answer is D.`,
  },
  {
    n: 19, correct: 'A',
    statement: `A small rock is tied to a massless string of length 5 m. The density of the rock is twice the density of the water. The rock is lowered into the water, while the other end of the string is attached to a pivot. Neglect any resistive forces from the water. The rock oscillates like a pendulum with angular frequency of which of the following?`,
    choices: {
      A: '1 rad/s',
      B: '0.7 rad/s',
      C: '0.5 rad/s',
      D: '1.4 rad/s',
      E: '2 rad/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['pendulum', 'buoyancy', 'oscillations/SHM'],
    solution: `The rock's density is $$2\\rho_w$$, so it displaces water of mass equal to half its own mass. The upward buoyant force is therefore half its weight. The net downward force on the submerged rock is:

$$F_{\\text{net}} = mg - \\tfrac{1}{2}mg = \\tfrac{1}{2}mg,$$

giving an effective gravitational acceleration $$g_{\\text{eff}} = g/2 = 5 \\ \\text{m/s}^2$$.

The pendulum angular frequency is:

$$\\omega = \\sqrt{\\frac{g_{\\text{eff}}}{\\ell}} = \\sqrt{\\frac{5}{5}} = 1 \\ \\text{rad/s}.$$

The answer is A.`,
  },
  {
    n: 20, correct: 'A',
    statement: `A uniform rod of mass $$M$$ and length $$L$$ is hinged on a horizontal surface at the bottom. Its top end is connected to two springs, both with spring constant $$k$$. What relation must $$M$$, $$k$$, and $$L$$ satisfy such that the position shown in the figure is a stable equilibrium?`,
    choices: {
      A: '$$Mg < 4kL$$',
      B: '$$Mg < 2kL$$',
      C: '$$2kL < Mg < 4kL$$',
      D: '$$kL/2 < Mg < kL$$',
      E: '$$Mg < kL$$',
    },
    figures: [F19A(20)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'springs', 'oscillations/SHM', 'torque', 'rotational dynamics'],
    solution: `Give the rod an infinitesimal angular displacement $$\\delta\\theta$$ from vertical. The top of the rod moves by $$L\\,\\delta\\theta$$, compressing one spring and stretching the other each by $$\\delta x = L\\,\\delta\\theta$$. Each spring provides a restoring force $$k\\,\\delta x$$, and the combined restoring torque about the hinge is:

$$\\tau_{\\text{spring}} = 2k(L\\,\\delta\\theta) \\cdot L = 2kL^2\\,\\delta\\theta.$$

The displaced rod has a component of gravity in the azimuthal direction of magnitude $$Mg\\sin\\delta\\theta \\approx Mg\\,\\delta\\theta$$, acting at the center of mass (distance $$L/2$$ from the hinge). The destabilizing torque is:

$$\\tau_{\\text{grav}} = Mg\\,\\delta\\theta \\cdot \\frac{L}{2} = \\frac{MgL}{2}\\,\\delta\\theta.$$

For stability the restoring torque must exceed the destabilizing torque:

$$2kL^2\\,\\delta\\theta > \\frac{MgL}{2}\\,\\delta\\theta \\implies Mg < 4kL.$$

The answer is A.`,
  },
  {
    n: 21, correct: 'E',
    statement: `A spherical cloud of dust has uniform mass density $$\\rho$$ and radius $$R$$. Satellite A of negligible mass is orbiting the cloud at its edge, in a circular orbit of radius $$R$$, and satellite B is orbiting the cloud just inside the cloud, in a circular orbit of radius $$r$$, with $$r < R$$. If $$v_i$$ is the speed of satellite $$i$$ and $$T_i$$ is the period of satellite $$i$$, which of the following is true? Neglect any drag forces from the dust.`,
    choices: {
      A: '$$T_A > T_B$$ and $$v_A > v_B$$',
      B: '$$T_A > T_B$$ and $$v_A < v_B$$',
      C: '$$T_A < T_B$$ and $$v_A > v_B$$',
      D: '$$T_A < T_B$$ and $$v_A < v_B$$',
      E: '$$T_A = T_B$$ and $$v_A > v_B$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'gravitation', 'kepler\'s laws', 'shell theorem'],
    solution: `For a circular orbit inside a uniform-density sphere, the gravitational force comes only from the mass enclosed within radius $$r$$. Setting centripetal acceleration equal to gravity:

$$\\frac{mv^2}{r} = \\frac{Gm(\\frac{4}{3}\\pi r^3 \\rho)}{r^2} = \\frac{4\\pi G\\rho m r}{3}.$$

This gives $$v^2 = \\frac{4\\pi G\\rho r^2}{3}$$, so the period is:

$$T = \\frac{2\\pi r}{v} = 2\\pi\\sqrt{\\frac{3}{4\\pi G\\rho}} = \\sqrt{\\frac{3\\pi}{G\\rho}},$$

which is __independent of $$r$$__. Therefore $$T_A = T_B$$.

Since the angular velocities are equal, speeds are proportional to orbital radii: $$v_A/v_B = R/r > 1$$, so $$v_A > v_B$$.

The answer is E.`,
  },
  {
    n: 22, correct: 'C',
    statement: `A vertical pole has two massless strings, both of length $$L$$, attached a distance $$L$$ apart. The other ends of the strings are attached to a mass $$M$$. The mass is rotated around the pole with an angular speed $$\\omega$$. Which of the following graphs best gives the ratio of the tension in the bottom string to the tension in the top string as a function of $$\\omega$$?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-a/fma-2019-a-q22A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-a/fma-2019-a-q22B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-a/fma-2019-a-q22C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-a/fma-2019-a-q22D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-a/fma-2019-a-q22E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['tension', 'circular motion', 'statics/equilibrium', 'graph interpretation'],
    solution: `The strings form an equilateral triangle (each string has length $$L$$, the attachment points are $$L$$ apart on the pole), so the mass sits at a horizontal distance from the pole and both strings are taut only if $$\\omega$$ is large enough.

For small $$\\omega$$ (below a threshold), the bottom string goes slack (a string cannot push). In that regime the bottom tension $$T_b = 0$$ and the ratio $$T_b/T_t = 0$$.

For large $$\\omega$$, centrifugal effects dominate over gravity and the tension ratio approaches $$1$$ asymptotically (the two strings carry equal load in the horizontal centripetal direction, and gravity becomes negligible).

Only graph C shows: ratio = 0 below a threshold $$\\omega$$, then rising continuously toward 1.

The answer is C.`,
  },
  {
    n: 23, correct: 'D',
    statement: `A rectangular slab sits on a frictionless surface. A sphere sits on the slab. There is sufficient friction between the sphere and the slab such that the sphere will not slip relative to the slab. A force to the right is applied to the slab, with both the slab and the sphere initially at rest.

The sphere will then:`,
    choices: {
      A: 'begin spinning clockwise while its center of mass accelerates to the right.',
      B: 'begin spinning counterclockwise while its center of mass accelerates to the left.',
      C: 'begin spinning clockwise while its center of mass accelerates to the left.',
      D: 'begin spinning counterclockwise while its center of mass accelerates to the right.',
      E: 'not spin, while its center of mass accelerates to the right.',
    },
    figures: [F19A(23)], topics: ['Mechanics'], tags: ['friction', 'rolling without slipping', 'newton\'s laws', 'rotational dynamics'],
    solution: `The only horizontal force on the sphere is the static friction force from the slab. This friction force both accelerates the sphere's center of mass and provides a torque about the center.

Consider energy: when the slab is pulled to the right, the sphere takes some of the energy delivered. Therefore the slab accelerates less than it would without the sphere — meaning the friction force on the slab from the sphere acts to the __left__. By Newton's third law, the friction force on the sphere from the slab acts to the __right__.

Therefore:
- The sphere's center of mass accelerates __to the right__.
- The rightward friction force acts at the bottom of the sphere, creating a torque that spins the sphere __counterclockwise__ (when viewed from the side with rightward being positive).

The answer is D.`,
  },
  {
    n: 24, correct: 'D',
    statement: `A particle moves in the $$xy$$ plane with the potential energy

$$U(x, y) = 9kx^2 + 16ky^2.$$

The particle can perform several different types of periodic motion. The ratio between the maximum and minimum possible periods is`,
    choices: {
      A: '$$2/\\sqrt{3}$$',
      B: '$$4/3$$',
      C: '$$\\sqrt{5}$$',
      D: '$$4$$',
      E: '$$5$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'normal modes', 'potential energy'],
    solution: `The potential $$U = 9kx^2 + 16ky^2$$ corresponds to a 2D harmonic oscillator with effective spring constants $$k_x = 18k$$ and $$k_y = 32k$$. The angular frequencies are:

$$\\omega_x = \\sqrt{\\frac{k_x}{m}} = \\sqrt{\\frac{18k}{m}}, \\qquad \\omega_y = \\sqrt{\\frac{k_y}{m}} = \\sqrt{\\frac{32k}{m}}.$$

The corresponding periods are:

$$T_x = \\frac{2\\pi}{\\omega_x} \\propto \\frac{1}{\\sqrt{18k}} \\propto \\frac{1}{3\\sqrt{2k}}, \\qquad T_y = \\frac{2\\pi}{\\omega_y} \\propto \\frac{1}{\\sqrt{32k}} \\propto \\frac{1}{4\\sqrt{2k}},$$

so $$T_x = \\tfrac{4}{3}T_y$$. The minimum period is $$T_y$$; the maximum period is the lowest common multiple of $$T_x$$ and $$T_y$$, which is $$\\text{lcm}(\\tfrac{4}{3}T_y,\\, T_y) = 4T_y$$ (since $$3T_x = 4T_y$$). The ratio is:

$$\\frac{T_{\\max}}{T_{\\min}} = \\frac{4T_y}{T_y} = 4.$$

The answer is D.`,
  },
  {
    n: 25, correct: 'A',
    statement: `A car is turning left along a circular track of radius $$r$$ at a constant speed $$v$$. A cylindrical beaker is placed vertically inside the car. The beaker has a small hole on its right side. If the water's highest point in the beaker is a height $$h$$ above the hole, at what instantaneous speed does water escape the hole, from a passenger's perspective?`,
    choices: {
      A: '$$\\sqrt{2gh}$$',
      B: '$$\\sqrt{(v^2/r)h}$$',
      C: '$$\\sqrt{gh}$$',
      D: '$$\\sqrt{h\\sqrt{(v^2/r)^2 + g^2}}$$',
      E: '$$\\sqrt{2h\\sqrt{(v^2/r)^2 + g^2}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['non-inertial frames', 'bernoulli\'s principle', 'fluid statics', 'pressure'],
    solution: `In the passenger's (non-inertial) reference frame, there is an effective gravity:

$$\\vec{g}_{\\text{eff}} = \\frac{v^2}{r}\\hat{i} - g\\hat{j},$$

pointing down and to the right (toward the outside of the turn). The water surface is perpendicular to $$\\vec{g}_{\\text{eff}}$$, tilted at angle $$\\theta$$ from horizontal where $$\\tan\\theta = v^2/(rg)$$.

The hole is on the right side of the beaker. The "highest point" of the water surface is at the right edge (pushed outward by the centrifugal effect), so that point is indeed a vertical height $$h$$ above the hole as given.

The pressure at the hole due to the column of water of vertical height $$h$$ is:

$$p = \\rho\\,g_{\\text{eff}}\\,h_{\\text{eff}} = \\rho\\,g_{\\text{eff}}\\,(h\\cos\\theta) = \\rho\\,(g_{\\text{eff}}\\cos\\theta)\\,h = \\rho g h,$$

since $$g_{\\text{eff}}\\cos\\theta = g$$. Applying Bernoulli's equation:

$$\\rho g h = \\tfrac{1}{2}\\rho u^2 \\implies u = \\sqrt{2gh}.$$

The answer is A.`,
  },
]
