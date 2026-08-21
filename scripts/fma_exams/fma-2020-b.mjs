// Digitized 2020 F=ma Exam B questions.
// Source — Exam: work/fma/fma-2020-b.pdf (text: work/fma/fma-2020-b.txt)
//          Solutions: work/fma/fma-2020-b-sol.pdf (text: work/fma/fma-2020-b-sol.txt)
//          Figures: work/figure_manifest.json, key "fma-2020-b"
//
// Answer-key cross-check: all 25 ←CORRECT markers verified against the solution text.
// Q3 note: the solutions PDF has a typo in the tan θ formula (writes √(r²−d²) instead
//   of √(d²−r²)), but the ←CORRECT marker and final result both correctly indicate D.
// Q12 note: the ←CORRECT marker appears split across two lines between options C and D
//   in the extraction; it belongs to C. The solution text says "tensive and compressive
//   forces at the top and bottom" confirming C.
// Q20 note: ←CORRECT marker appears after option E. The solution explains W < Mg but
//   the comparison to (M−m)g is indeterminate, so E is correct.

const F20B = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-b/fma-2020-b-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2020-b'
export const questions = [
  {
    n: 1, correct: 'D',
    statement: `A ball is bouncing vertically between a floor and ceiling, which are both horizontal and separated by 4 m. All collisions are perfectly elastic, and when the ball hits the floor, it has a speed of 12 m/s. How long does a complete up-down cycle take?`,
    choices: {
      A: '0.3 s',
      B: '0.4 s',
      C: '0.6 s',
      D: '0.8 s',
      E: '2.4 s',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `The ball leaves the floor at 12 m/s upward. Its height above the floor is $$h = 12t - \\frac{1}{2}(10)t^2$$. Setting $$h = 4$$ m and solving the quadratic gives $$t_{\\text{top}} = 0.4$$ s to reach the ceiling. By symmetry (elastic collisions), the return trip takes the same time. The full cycle is $$2 \\times 0.4 = 0.8$$ s.

The answer is D.`,
  },
  {
    n: 2, correct: 'A',
    statement: `A uniform rod of mass $$m$$ and length $$\\ell$$ has moment of inertia $$m\\ell^2/12$$ about an axis that is perpendicular to the rod and passes through its center. What is the moment of inertia of a uniform square plate with mass $$M$$ and side length $$L$$ about the axis along its diagonal?`,
    choices: {
      A: '$$ML^2/12$$',
      B: '$$\\sqrt{2}\\,ML^2/12$$',
      C: '$$ML^2/6$$',
      D: '$$ML^2/4$$',
      E: '$$ML^2/3$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational motion', 'symmetry'],
    solution: `Place the origin at the center of the square with $$x$$ and $$y$$ along the sides. The perpendicular axis theorem gives $$I_z = I_x + I_y$$. Each of $$I_x$$ and $$I_y$$ equals the moment of inertia of a uniform rod of mass $$M$$ and length $$L$$ about its center: $$I_x = I_y = ML^2/12$$. So $$I_z = ML^2/6$$.

Now rotate the axes by 45° to align with the diagonals, giving axes $$x'$$ and $$y'$$. Applying the perpendicular axis theorem again, $$I_z = I_{x'} + I_{y'}$$. By symmetry $$I_{x'} = I_{y'}$$, so $$ML^2/6 = 2I_{x'}$$, giving $$I_{x'} = ML^2/12$$.

The answer is A.`,
  },
  {
    n: 3, correct: 'D',
    statement: `A conical pendulum of length $$d$$ swings in a horizontal circle of radius $$r$$, as shown. If $$\\omega$$ is the angular frequency of this motion, what is $$\\omega^2$$?`,
    choices: {
      A: '$$g/d$$',
      B: '$$g/r$$',
      C: '$$g/\\sqrt{d^2 + r^2}$$',
      D: '$$g/\\sqrt{d^2 - r^2}$$',
      E: '$$g/\\sqrt{dr}$$',
    },
    figures: [F20B(3)], topics: ['Mechanics'], tags: ['circular motion', 'tension', 'free-body diagrams'],
    solution: `Let $$\\theta$$ be the angle of the string from the vertical. The vertical height of the pendulum below the pivot is $$\\sqrt{d^2 - r^2}$$, so $$\\cos\\theta = \\sqrt{d^2 - r^2}/d$$ and $$\\tan\\theta = r/\\sqrt{d^2 - r^2}$$.

Balancing the vertical component of tension with gravity: $$T\\cos\\theta = mg$$. The horizontal component provides centripetal force: $$T\\sin\\theta = m\\omega^2 r$$. Dividing gives $$\\omega^2 r/g = \\tan\\theta = r/\\sqrt{d^2 - r^2}$$, so $$\\omega^2 = g/\\sqrt{d^2 - r^2}$$.

As a check: when $$r \\to 0$$ this approaches $$g/d$$, the result for a simple pendulum. When $$r \\to d$$ the pendulum is nearly horizontal and $$\\omega^2 \\to \\infty$$, which is correct.

The answer is D.`,
  },
  {
    n: 4, correct: 'C',
    statement: `In "zero-g" airplane rides, passengers can float around the cabin, as if they were weightless. A flight trajectory for such a ride is shown below, with a few points during the journey labelled. Which of the following statements is correct? Take $$a$$ to be the acceleration of the plane during the "zero-g" part of the flight.`,
    choices: {
      A: 'The "zero-g" flight begins at $$a$$ and ends at $$c$$, during which $$|a| = g$$ and $$a$$ points up.',
      B: 'The "zero-g" flight begins at $$a$$ and ends at $$e$$, during which $$|a| = 0$$.',
      C: 'The "zero-g" flight begins at $$b$$ and ends at $$d$$, during which $$|a| = g$$ and $$a$$ points down.',
      D: 'The "zero-g" flight begins at $$c$$ and ends at $$e$$, during which $$|a| = g$$ and $$a$$ points down.',
      E: 'The "zero-g" flight begins at $$d$$ and ends at $$e$$, during which $$|a| = 0$$.',
    },
    figures: [F20B(4)], topics: ['Mechanics'], tags: ['free-body diagrams', 'equations of motion', 'reference frames'],
    solution: `The zero-g segment is the portion where the airplane follows a free-fall (parabolic) trajectory with acceleration $$g$$ downward. On the height-vs-time graph this is a concave-down parabola, corresponding to the segment from $$b$$ to $$d$$. During this segment the passengers are in free fall along with the plane, so they feel weightless.

The answer is C.`,
  },
  {
    n: 5, correct: 'C',
    statement: `A mote of dust is initially located at distance $$R$$ from the sun, which has mass $$M$$. At this point, the mote has a small tangential velocity $$v$$. Which of the following is a good approximation for the distance of closest subsequent approach between the mote and the sun?`,
    choices: {
      A: '$$\\dfrac{R^3 v^4}{G^2 M^2}$$',
      B: '$$\\dfrac{R^3 v^4}{2G^2 M^2}$$',
      C: '$$\\dfrac{R^2 v^2}{2GM}$$',
      D: '$$\\dfrac{R^2 v^2}{GM}$$',
      E: '$$\\dfrac{2R^2 v^2}{GM}$$',
    },
    figures: [F20B(5)], topics: ['Mechanics'], tags: ['gravitation', 'energy conservation', 'angular momentum conservation'],
    solution: `Since $$v$$ is small, the mote starts essentially at rest with negligible kinetic energy compared to the (also negligible) gravitational potential energy at distance $$R \\gg R'$$. We can set the total energy to zero.

Let $$R'$$ be the distance of closest approach and $$v'$$ the speed there. Angular momentum conservation gives $$mvR = mv'R'$$, so $$v' = vR/R'$$. Energy conservation with total energy zero gives $$0 = -GMm/R' + \\frac{1}{2}mv'^2$$. Substituting $$v'$$:

$$\\frac{GMm}{R'} = \\frac{1}{2}m\\frac{v^2 R^2}{R'^2}$$

$$R' = \\frac{R^2 v^2}{2GM}$$

The answer is C.`,
  },
  {
    n: 6, correct: 'A',
    statement: `A three-legged table is shaped like a uniform equilateral triangle, and has identical legs at each corner. When the mass of an object placed on the center of the table exceeds $$m_{\\text{max}}$$, the table's legs will all simultaneously break. Which of the following shaded regions shows the area within which an object of $$2m_{\\text{max}}/3$$ can be placed without breaking any legs of the table?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-b/fma-2020-b-q06A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-b/fma-2020-b-q06B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-b/fma-2020-b-q06C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-b/fma-2020-b-q06D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-b/fma-2020-b-q06E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque'],
    solution: `A leg breaks if it bears more than $$m_{\\text{max}}g/3$$ (its breaking threshold). The object has weight $$\\frac{2}{3}m_{\\text{max}}g$$, so a leg breaks if it bears more than half of the object's weight.

Label the vertices $$A$$, $$B$$, $$C$$ and let $$h$$ be the triangle's height. Consider torque balance about an axis through the mass parallel to side $$BC$$. If the mass is at distance $$y$$ from $$BC$$, then

$$y(F_B + F_C) = (h - y)F_A$$

Combined with $$F_A + F_B + F_C = \\frac{2}{3}m_{\\text{max}}g$$, one finds $$F_A = \\frac{2}{3}m_{\\text{max}}g \\cdot \\frac{y}{h}$$. Leg $$A$$ breaks when $$F_A > \\frac{1}{3}m_{\\text{max}}g$$, i.e., when $$y > h/2$$ (the mass is more than halfway toward vertex $$A$$ from side $$BC$$). The same constraint applies to all three vertices.

The safe region is the set of points that are within half the triangle's height from each side — i.e., within the inner triangle formed by connecting the midpoints of the sides (choice A).

The answer is A.`,
  },
  {
    n: 7, correct: 'A',
    statement: `Two satellites are initially in identical circular orbits around the Sun, with orbital speed $$v = 1 \\times 10^4$$ m/s. The first satellite fires its thrusters toward the Sun, and quickly obtains a radial velocity of $$\\Delta v_r = 1$$ m/s. The second satellite instead fires its thrusters behind it, and quickly increases its tangential velocity by $$\\Delta v_t$$. If the two satellites subsequently perform orbits with the same period, approximately what was $$\\Delta v_t$$?`,
    choices: {
      A: '$$0.000\\,05$$ m/s',
      B: '$$0.005$$ m/s',
      C: '$$0.5$$ m/s',
      D: '$$1$$ m/s',
      E: '$$50$$ m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['kepler\'s laws', 'energy conservation', 'orbital mechanics'],
    solution: `By Kepler's third law, equal periods require equal semimajor axes, which means equal total orbital energies. The total energy of an elliptic orbit is $$E = -GMm/2a$$, so equal $$a$$ means equal $$E$$ and hence equal speed at the same orbital radius.

For the two satellites to have the same speed after firing, we need $$(v + \\Delta v_t)^2 = v^2 + (\\Delta v_r)^2$$ (the first satellite's speed is the vector sum of the original tangential speed and the added radial component; the second satellite's speed is $$v + \\Delta v_t$$ tangentially).

Expanding and keeping only first-order terms in the small quantities:

$$2v\\,\\Delta v_t \\approx (\\Delta v_r)^2$$

$$\\Delta v_t \\approx \\frac{(\\Delta v_r)^2}{2v} = \\frac{1^2}{2 \\times 10^4} = 5 \\times 10^{-5} \\text{ m/s}.$$

The answer is A.`,
  },
  {
    n: 8, correct: 'C',
    statement: `A conveyor belt is moving with velocity $$v$$ to the east. A block with velocity $$v$$ to the south slides from the ground onto the conveyor belt. The coefficient of friction between the block and the belt is $$\\mu$$. The block stops slipping after a time`,
    choices: {
      A: '$$\\dfrac{v}{\\sqrt{2}\\,\\mu g}$$',
      B: '$$\\dfrac{v}{\\mu g}$$',
      C: '$$\\dfrac{\\sqrt{2}\\,v}{\\mu g}$$',
      D: '$$\\dfrac{2v}{\\mu g}$$',
      E: 'The block never stops slipping.',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'relative motion', 'reference frames'],
    solution: `Work in the reference frame of the conveyor belt. In this frame the block's initial velocity has a component $$v$$ to the south (unchanged, since the belt moves east) and a component $$v$$ to the west (opposite the belt's eastward motion), giving an initial speed of $$\\sqrt{v^2 + v^2} = \\sqrt{2}\\,v$$ relative to the belt.

Kinetic friction decelerates the block at rate $$\\mu g$$ in the direction opposing slip. The block stops slipping in time $$t = \\sqrt{2}\\,v/(\\mu g)$$.

The answer is C.`,
  },
  {
    n: 9, correct: 'B',
    statement: `__The following information is relevant to problems 9 and 10.__

Two equal masses $$m$$ are connected by an elastic string that acts like an ideal spring with spring constant $$k$$ and unstretched length $$l$$. The two masses are hung over a frictionless pulley. What is the total length of the string at equilibrium? (Diagram not necessarily to scale.)`,
    choices: {
      A: '$$2mg/k$$',
      B: '$$l + mg/k$$',
      C: '$$l + mg/2k$$',
      D: '$$l + 2mg/k$$',
      E: 'There is not enough information to decide.',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'statics/equilibrium', 'tension'],
    solution: `Consider either mass. The tension in the string (spring force) must equal $$mg$$ to keep the mass in equilibrium: $$kx = mg$$, where $$x$$ is the extension of the spring. So $$x = mg/k$$ and the total length is $$l + x = l + mg/k$$.

Note that both halves of the string are in tension with the same force $$mg$$, so the extension is $$mg/k$$ total (not per half — the spring is a single spring of constant $$k$$ and natural length $$l$$).

The answer is B.`,
  },
  {
    n: 10, correct: 'B',
    statement: `__The following information is relevant to problems 9 and 10.__

The two masses are both displaced downward by a small vertical distance $$x$$ and simultaneously released from rest. What is the period of oscillation?`,
    choices: {
      A: '$$2\\pi\\sqrt{l/g}$$',
      B: '$$\\pi\\sqrt{2m/k}$$',
      C: '$$2\\pi\\sqrt{m/k}$$',
      D: '$$2\\pi\\sqrt{m/k + l/g}$$',
      E: 'There is not enough information to decide.',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'simple harmonic motion'],
    solution: `Gravity only affects the equilibrium position, not the oscillation frequency. When each mass is displaced downward by $$x$$, the total stretch of the spring increases by $$2x$$ (one end goes down by $$x$$, the other also goes down by $$x$$, so the separation increases by $$2x$$). Each mass therefore feels a restoring force $$F = -2kx$$, giving an effective spring constant $$k_{\\text{eff}} = 2k$$.

The period is $$T = 2\\pi\\sqrt{m/k_{\\text{eff}}} = 2\\pi\\sqrt{m/(2k)} = \\pi\\sqrt{2m/k}$$.

Equivalently, the reduced mass of the two-body system is $$\\mu = m/2$$, giving $$T = 2\\pi\\sqrt{\\mu/k} = \\pi\\sqrt{2m/k}$$.

The answer is B.`,
  },
  {
    n: 11, correct: 'B',
    statement: `An escalator can carry passengers up a vertical distance of 10 m in 30 s. A mischievous person of mass 50 kg walks down the up-escalator so that they stay in place with respect to the building. If the child does this for 30 s, the total work the child performs on the escalator, in the frame of the building, is`,
    choices: {
      A: '$$-10^4$$ J',
      B: '$$-5 \\times 10^3$$ J',
      C: '0 J',
      D: '$$5 \\times 10^3$$ J',
      E: '$$10^4$$ J',
    },
    figures: [], topics: ['Mechanics'], tags: ['work-energy theorem', 'reference frames'],
    solution: `Work is force times displacement of the point of contact, not of the center of mass. The person's feet exert a downward force $$mg = 500$$ N on the escalator steps. In the building frame, the escalator steps move upward at $$v_y = 10/30$$ m/s. The power delivered by the person to the escalator is $$P = (-mg)(v_y) = -500 \\times (1/3) = -500/3$$ W.

Over 30 s, the work done by the person on the escalator is $$W = P \\times t = -(500/3)(30) = -5000$$ J $$= -5 \\times 10^3$$ J.

(The person's CM is stationary, but that does not mean zero work — work depends on the motion of the contact point, not the CM.)

The answer is B.`,
  },
  {
    n: 12, correct: 'C',
    statement: `A platform juts out horizontally from the edge of a building. If the platform is modeled as a uniform metal rod, which one of the following statements about the tensile and compressive stress is correct?`,
    choices: {
      A: 'There is a horizontal compression throughout the rod.',
      B: 'There is a horizontal tension throughout the rod.',
      C: 'There is horizontal tension in the top of the rod and a compression in the bottom.',
      D: 'There is a horizontal tension near the middle of the rod and a compression near the end.',
      E: 'There is a horizontal compression near the middle of the rod and a tension near the end.',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque'],
    solution: `The platform is like a cantilever beam: fixed at the wall end, free at the outer end, with gravity pulling it down. The wall must exert forces on the rod to keep it from rotating: a downward force near the bottom and an upward force near the top (or equivalently, the attachment acts like a fixed support that provides a bending moment).

Consider the rod as a bent beam. Gravity pulls the free end down, trying to rotate the platform downward about the wall. To resist this, the wall attachment puts the top surface of the rod in tension (being stretched) and the bottom surface in compression (being squeezed).

The answer is C.`,
  },
  {
    n: 13, correct: 'B',
    statement: `A uniform disk of mass $$m$$ and radius $$r$$ is attached at its edge to a flexible pivot on the ceiling. It is given a small displacement perpendicular to the plane of the disk, so that it begins to oscillate perpendicular to the plane of the disk. What is the period of oscillation? The moment of inertia of a disk about the axis going through its center and perpendicular to the plane it's in is $$I_{\\text{disk}} = \\frac{1}{2}mr^2$$.`,
    choices: {
      A: '$$\\pi\\sqrt{2r/5g}$$',
      B: '$$\\pi\\sqrt{5r/g}$$',
      C: '$$\\pi\\sqrt{6r/g}$$',
      D: '$$2\\pi\\sqrt{r/g}$$',
      E: '$$2\\pi\\sqrt{2r/g}$$',
    },
    figures: [F20B(13)], topics: ['Mechanics'], tags: ['rotational dynamics', 'simple harmonic motion'],
    solution: `The disk pivots about its edge, oscillating like a physical pendulum. The pivot axis is tangent to the disk's edge, lying in the plane of the disk.

By the perpendicular axis theorem, $$I_{\\perp} = I_{\\text{cm,x}} + I_{\\text{cm,y}}$$, where $$I_{\\perp} = \\frac{1}{2}mr^2$$ is the moment about the disk's symmetry axis. By symmetry, $$I_{\\text{cm,x}} = I_{\\text{cm,y}} \\equiv I_{\\text{cm}}$$, so $$I_{\\text{cm}} = \\frac{1}{4}mr^2$$.

By the parallel axis theorem, the moment about the pivot (edge) is $$I = I_{\\text{cm}} + mr^2 = \\frac{1}{4}mr^2 + mr^2 = \\frac{5}{4}mr^2$$.

For small oscillation angle $$\\theta$$ about the pivot, the restoring torque is $$\\tau = -mgr\\sin\\theta \\approx -mgr\\theta$$. Applying $$\\tau = I\\ddot{\\theta}$$ gives $$\\omega^2 = mgr/I = mgr/(\\frac{5}{4}mr^2) = \\frac{4g}{5r}$$.

The period is $$T = 2\\pi/\\omega = 2\\pi\\sqrt{5r/(4g)} = \\pi\\sqrt{5r/g}$$.

The answer is B.`,
  },
  {
    n: 14, correct: 'C',
    statement: `A large block of mass 5 kg is moving to the right at a velocity of 10 m/s. Spaced out every meter are smaller, initially stationary blocks of mass 1 kg. All collisions are perfectly inelastic. Neglecting friction, how far will the large block travel before its velocity has decreased to below 3 m/s?`,
    choices: {
      A: '5 m',
      B: '8 m',
      C: '12 m',
      D: '17 m',
      E: '50 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation'],
    solution: `The initial momentum is $$p = 5 \\times 10 = 50$$ kg·m/s, which is conserved in each perfectly inelastic collision. For the composite block's velocity to fall below 3 m/s, its mass must exceed $$p/v = 50/3 \\approx 16.7$$ kg.

Starting at 5 kg and gaining 1 kg per collision: after absorbing 12 small blocks the mass is $$5 + 12 = 17$$ kg, giving speed $$50/17 \\approx 2.94$$ m/s $$< 3$$ m/s. After only 11 blocks the mass is 16 kg, giving speed $$50/16 = 3.125$$ m/s $$> 3$$ m/s.

Since the blocks are spaced 1 m apart, the large block must travel 12 m to absorb 12 small blocks.

The answer is C.`,
  },
  {
    n: 15, correct: 'A',
    statement: `In the device shown, blocks of various masses are placed on pistons so that the device is in equilibrium. (The fluid in the drawing is to scale.) There are valves that are both initially open at locations A and B. One of the valves is closed, and the system is allowed to come to equilibrium. How will this affect the height of the mass $$m_2$$?`,
    choices: {
      A: 'Closing either valve will have no effect on the height of $$m_2$$.',
      B: 'Closing either valve causes $$m_2$$ to rise.',
      C: 'Closing either valve causes $$m_2$$ to fall.',
      D: 'Closing valve A causes $$m_2$$ to rise, and closing valve B causes $$m_2$$ to fall.',
      E: 'Closing valve A causes $$m_2$$ to fall, and closing valve B causes $$m_2$$ to rise.',
    },
    figures: [F20B(15)], topics: ['Mechanics'], tags: ['fluid statics'],
    solution: `In equilibrium the pressure in the horizontal connecting tube must be consistent across all three pistons: $$m_1/A_1 = m_2/A_2 = m_3/A_3$$ (where $$A_i$$ is the cross-sectional area of each tube). This condition already holds for all three pairs of tubes before any valve is closed.

When valve A is closed, the new equilibrium condition for the right two tubes is $$m_2/A_2 = m_3/A_3$$, which is already satisfied. When valve B is closed, the condition for the outer two tubes $$m_1/A_1 = m_3/A_3$$ is also already satisfied. In either case, no fluid needs to move to re-establish equilibrium, so $$m_2$$ does not change height.

The answer is A.`,
  },
  {
    n: 16, correct: 'D',
    statement: `__The following information is relevant to problems 16 and 17.__

A mass $$M$$ sits on top of a vertical spring of spring constant $$k$$, in equilibrium. A mass $$m$$ is held a height $$h$$ above it. The mass $$M$$ is then pushed downward by a distance $$\\Delta x$$, and both masses are released from rest simultaneously. For what value of $$h$$ will the two masses first collide when $$M$$ first returns to its equilibrium position?`,
    choices: {
      A: '$$\\dfrac{\\pi M^2 g^2}{4k^2 \\Delta x}$$',
      B: '$$\\dfrac{8Mg}{\\pi^2 k}$$',
      C: '$$\\dfrac{Mg}{k}$$',
      D: '$$\\dfrac{\\pi^2 Mg}{8k}$$',
      E: '$$\\dfrac{\\pi k \\Delta x^2}{4Mg}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'simple harmonic motion', 'equations of motion'],
    solution: `Mass $$M$$ undergoes simple harmonic motion about its equilibrium position with period $$T = 2\\pi\\sqrt{M/k}$$. It returns to equilibrium for the first time after one quarter of an oscillation: $$t_{\\text{osc}} = T/4 = (\\pi/2)\\sqrt{M/k}$$.

Mass $$m$$ is in free fall starting from rest at height $$h$$: it falls a distance $$h$$ in time $$t_{\\text{fall}} = \\sqrt{2h/g}$$.

Setting these equal: $$\\sqrt{2h/g} = (\\pi/2)\\sqrt{M/k}$$, so $$2h/g = (\\pi^2/4)(M/k)$$, giving

$$h = \\frac{\\pi^2 Mg}{8k}.$$

The answer is D.`,
  },
  {
    n: 17, correct: 'E',
    statement: `__The following information is relevant to problems 16 and 17.__

Assume that $$h$$ takes the value found in the previous question, and that the collision between the two masses is perfectly elastic. For what value of $$\\Delta x$$ will $$m$$ rebound to a maximum height that is exactly equal to its original height?`,
    choices: {
      A: '$$\\dfrac{\\pi g}{2k}\\sqrt{\\dfrac{m^3}{M}}$$',
      B: '$$\\dfrac{\\pi g}{k}\\sqrt{\\dfrac{m^3}{2M}}$$',
      C: '$$\\dfrac{2g}{\\pi k}\\sqrt{\\dfrac{2m^3}{M}}$$',
      D: '$$\\dfrac{4mg}{\\pi k}$$',
      E: '$$\\dfrac{\\pi mg}{2k}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'energy conservation', 'springs', 'simple harmonic motion'],
    solution: `For $$m$$ to rebound to its original height $$h$$, it must leave the collision with the same speed it had just before impact. Since the collision is perfectly elastic and $$m$$ must exit with the same kinetic energy it entered, the only way this happens while satisfying both energy and momentum conservation is if the two masses exchange momenta — which requires their momenta to be equal and opposite just before the collision: $$Mv_M = mv_m$$.

__Speed of $$M$$ at collision:__ Mass $$M$$ oscillates with amplitude $$\\Delta x$$ about its equilibrium. At its equilibrium position (where the collision occurs) its speed is maximum:

$$v_M = \\Delta x\\sqrt{\\frac{k}{M}}.$$

__Speed of $$m$$ at collision:__ Mass $$m$$ falls from rest at height $$h = \\pi^2 Mg/(8k)$$:

$$v_m = \\sqrt{2gh} = \\sqrt{\\frac{\\pi^2 Mg^2}{4k}} = \\frac{\\pi g}{2}\\sqrt{\\frac{M}{k}}.$$

__Setting momenta equal:__

$$Mv_M = mv_m$$

$$M \\cdot \\Delta x\\sqrt{\\frac{k}{M}} = m \\cdot \\frac{\\pi g}{2}\\sqrt{\\frac{M}{k}}$$

$$\\Delta x\\sqrt{kM} = \\frac{\\pi mg}{2}\\sqrt{\\frac{M}{k}}$$

$$\\Delta x = \\frac{\\pi mg}{2}\\sqrt{\\frac{M}{k}} \\cdot \\frac{1}{\\sqrt{kM}} = \\frac{\\pi mg}{2k}.$$

The answer is E.`,
  },
  {
    n: 18, correct: 'A',
    statement: `An extendable arm is made from rigid beams free to pivot around the dots shown. Spring 1, with equilibrium length $$L_1$$, is attached between points A and C while spring 2, with equilibrium length $$L_2$$ is attached between B and D. The system is allowed to come to equilibrium. In equilibrium, what is the ratio of the tension in spring 1 to the tension in spring 2?`,
    choices: {
      A: '$$-2/3$$',
      B: '$$-3/4$$',
      C: '$$-1$$',
      D: '$$-3/2$$',
      E: 'There is not enough information to determine the ratio.',
    },
    figures: [F20B(18)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'springs', 'energy conservation'],
    solution: `Use the virtual work principle. Imagine extending the entire arm by a small amount $$dx$$. By the geometry of the extendable arm, spring 1 (between A and C) lengthens by $$\\frac{3}{4}dx$$ and spring 2 (between B and D) lengthens by $$\\frac{1}{2}dx$$.

The virtual work done against the spring tensions is $$T_1 \\cdot \\frac{3}{4}dx + T_2 \\cdot \\frac{1}{2}dx$$. At equilibrium the potential energy is stationary, so this must equal zero:

$$T_1 \\cdot \\frac{3}{4} + T_2 \\cdot \\frac{1}{2} = 0 \\implies \\frac{T_1}{T_2} = -\\frac{2}{3}.$$

The negative sign indicates that if one spring is in tension the other is in compression.

The answer is A.`,
  },
  {
    n: 19, correct: 'A',
    statement: `Consider an axially symmetric object that experiences no external forces and initially rotates about its symmetry axis. The object then changes its shape while remaining axially symmetric. Afterward, it is found that its moment of inertia about the symmetry axis has increased. How have its kinetic energy $$T$$ and angular velocity $$\\omega$$ changed?`,
    choices: {
      A: '$$T$$ has decreased, and $$\\omega$$ has decreased.',
      B: '$$T$$ has decreased, and $$\\omega$$ stays the same.',
      C: '$$T$$ stays the same, and $$\\omega$$ has decreased.',
      D: '$$T$$ has increased, and $$\\omega$$ has increased.',
      E: '$$T$$ has increased, and $$\\omega$$ stays the same.',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum conservation', 'rotational dynamics', 'energy conservation'],
    solution: `No external torques act, so angular momentum $$L = I\\omega$$ is conserved. Since $$I$$ increases, $$\\omega = L/I$$ decreases.

The kinetic energy is $$T = L^2/(2I)$$. Since $$L$$ is constant and $$I$$ increases, $$T$$ decreases. (The object must do internal work to expand against the centrifugal tendency, taking energy from rotation.)

The answer is A.`,
  },
  {
    n: 20, correct: 'E',
    statement: `A well-calibrated scale reads zero when nothing is placed on it. When a deflated balloon is placed on the scale, it reads $$mg$$. When a non-airtight box is placed on the scale, it reads $$Mg$$, where $$M > m$$. The balloon is inflated with helium, so that it floats upward in air. The balloon is placed in the box, and the box is placed on the scale. If the scale reads $$W$$, which of the following is true?`,
    choices: {
      A: '$$W \\leq (M - m)g$$',
      B: '$$(M - m)g < W < (M + m)g$$',
      C: '$$W = (M + m)g$$',
      D: '$$W > (M + m)g$$',
      E: 'None of the above are necessarily true.',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics', 'free-body diagrams'],
    solution: `The box is non-airtight, so the air pressure inside equals atmospheric pressure. The scale reads the net downward force on the platform.

Before the balloon is inserted, the scale reads $$Mg$$ (the box weight minus any buoyant force on the box is already captured in the calibrated reading $$Mg$$). When the inflated helium balloon is placed inside the box, the balloon pushes up on the top of the box with a force equal to the buoyant force on the balloon minus the balloon's weight. Since the balloon floats, the buoyant force exceeds the balloon weight ($$= mg$$), so the balloon pushes up on the box lid, reducing the scale reading below $$Mg$$.

Whether $$W$$ is larger or smaller than $$(M - m)g$$ depends on the buoyant force on the balloon, which requires knowing the volume of helium — information not given. None of the specific bounds A–D can be guaranteed.

The answer is E.`,
  },
  {
    n: 21, correct: 'C',
    statement: `A person stands on the seat of a swing and squats down, so that the distance between their center of mass (CM) and the swing's pivot is $$\\ell$$. As the swing gets to the lowest point, the speed of their CM is $$v$$. At this moment, they quickly stand up, and thus decrease the distance from their CM to the swing's pivot to $$\\ell'$$. Immediately after they finish standing up, their CM speed is $$v'$$. Which of the following statements is correct? You may neglect friction, the change in moment of inertia of the person about their CM, and the time taken to stand up.`,
    choices: {
      A: '$$v/\\ell = v\'/\\ell\'$$',
      B: '$$v = v\'$$',
      C: '$$v\\ell = v\'\\ell\'$$',
      D: '$$\\frac{1}{2}v^2 = \\frac{1}{2}v\'^2 + g(\\ell - \\ell\')$$',
      E: 'Multiple statements are correct.',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum conservation', 'constraint kinematics'],
    solution: `The person stands up by pushing on the swing's ropes (via their legs). These internal-to-the-system forces do not exert a torque about the pivot, so angular momentum about the pivot is conserved.

At the lowest point, the CM moves purely horizontally. The angular momentum about the pivot is $$L = mv\\ell$$ while squatting and $$L = mv'\\ell'$$ after standing. Conservation gives $$v\\ell = v'\\ell'$$.

Energy is not conserved (the person does work standing up). Option A gives the angular velocity, not the angular momentum: $$v/\\ell = \\omega$$ and $$v'/\\ell' = \\omega'$$, and angular velocity is not conserved. Option C is correct and is the only correct statement (the others are wrong or not necessarily true).

The answer is C.`,
  },
  {
    n: 22, correct: 'A',
    statement: `A point mass $$m$$ sits on a long block, also of mass $$m$$, which rests on the floor. The coefficient of static and kinetic friction between the mass and the block is $$\\mu$$, and the coefficient of static and kinetic friction between the block and the floor is $$\\mu/3$$. An impulse gives a horizontal momentum $$p$$ to the point mass. After a long time, how far has the point mass moved relative to the block? Assume the mass does not fall off the block.`,
    choices: {
      A: '$$\\dfrac{3p^2}{8m^2 \\mu g}$$',
      B: '$$\\dfrac{15p^2}{32m^2 \\mu g}$$',
      C: '$$\\dfrac{9p^2}{16m^2 \\mu g}$$',
      D: '$$\\dfrac{3p^2}{10m^2 \\mu g}$$',
      E: '$$\\dfrac{3p^2}{4m^2 \\mu g}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'impulse', 'equations of motion', 'relative motion'],
    solution: `Immediately after the impulse, the point mass has velocity $$v_0 = p/m$$ and the block is at rest.

The friction force on the point mass from the block is $$f_1 = \\mu mg$$ (backward on the mass). The normal force on the floor from the block is $$(m + m)g = 2mg$$, so friction from the floor on the block is $$f_2 = (\\mu/3)(2mg) = 2\\mu mg/3$$ (backward on the block).

Net force on block: $$f_1 - f_2 = \\mu mg - 2\\mu mg/3 = \\mu mg/3$$ (forward). Since $$f_1 > f_2$$, the block accelerates forward — it does not remain stationary.

Accelerations: point mass $$a_m = -\\mu g$$ (deceleration); block $$a_b = +\\mu g/3$$ (acceleration forward).

Relative acceleration (mass relative to block): $$a_{\\text{rel}} = a_m - a_b = -\\mu g - \\mu g/3 = -4\\mu g/3$$.

Initial relative velocity: $$v_{\\text{rel,0}} = p/m$$.

The relative velocity reaches zero after time $$t = v_{\\text{rel,0}}/|a_{\\text{rel}}| = (p/m)/(4\\mu g/3) = 3p/(4m\\mu g)$$. We must check they are still slipping at this point: yes, since the block is moving forward throughout (check at any intermediate time).

Relative displacement: $$s = v_{\\text{rel,0}}^2 / (2|a_{\\text{rel}}|) = (p/m)^2 / (2 \\cdot 4\\mu g/3) = \\frac{p^2/m^2}{8\\mu g/3} = \\frac{3p^2}{8m^2 \\mu g}$$.

The answer is A.`,
  },
  {
    n: 23, correct: 'C',
    statement: `Assume that the drag force for a fish in water depends only on the typical length scale of the fish $$R$$, its velocity $$v$$, and the density of water $$\\rho$$. A pufferfish is about 10 cm in length and swims at about 5 m/s. How fast does a clown fish, about 1 cm in length, need to swim such that it experiences the same drag force as the pufferfish?`,
    choices: {
      A: '5 m/s',
      B: '16 m/s',
      C: '50 m/s',
      D: '500 m/s',
      E: '2500 m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'drag force', 'scaling'],
    solution: `By dimensional analysis with $$F$$, $$R$$, $$v$$, $$\\rho$$: $$[F] = \\text{kg·m/s}^2$$, $$[\\rho R^2 v^2] = (\\text{kg/m}^3)(\\text{m}^2)(\\text{m}^2/\\text{s}^2) = \\text{kg·m/s}^2$$. So $$F \\propto \\rho R^2 v^2$$.

For equal drag forces with equal water density: $$R_{\\text{puff}}^2 v_{\\text{puff}}^2 = R_{\\text{clown}}^2 v_{\\text{clown}}^2$$, giving $$v_{\\text{clown}} = v_{\\text{puff}} \\cdot (R_{\\text{puff}}/R_{\\text{clown}}) = 5 \\times (10/1) = 50$$ m/s.

The answer is C.`,
  },
  {
    n: 24, correct: 'D',
    statement: `Three boxes A, B and C lie along a straight line on a horizontal frictionless surface, as shown. Box A is initially moving to the right with speed $$v$$ while the other two boxes are initially at rest. If all collisions are elastic, and the masses of the boxes can be chosen freely, which of the following is closest to the maximum possible final speed of box C?`,
    choices: {
      A: '$$v$$',
      B: '$$2v$$',
      C: '$$3v$$',
      D: '$$4v$$',
      E: '$$5v$$',
    },
    figures: [F20B(24)], topics: ['Mechanics'], tags: ['collisions', 'energy conservation', 'momentum conservation', 'extreme cases'],
    solution: `In an elastic collision between a heavy mass $$M$$ (moving at speed $$u$$) and a light stationary mass $$m \\ll M$$, the light mass recoils at speed $$\\approx 2u$$ and $$M$$ is nearly unaffected.

Optimal strategy: make $$m_A \\gg m_B \\gg m_C$$. First, A collides with B: B acquires speed $$\\approx 2v$$. Then B collides with C: C acquires speed $$\\approx 2(2v) = 4v$$. Quantitatively, in the limit $$m_A \\to \\infty$$ and $$m_B/m_C \\to \\infty$$, the final speed of C approaches $$4v$$.

One might try to do better by arranging multiple collisions (B bouncing back and forth), but the analysis shows this cannot exceed $$4v$$.

The answer is D.`,
  },
  {
    n: 25, correct: 'D',
    statement: `If a certain radioactive decay process happens $$n$$ times per hour on average, then in any given hour, one expects to observe $$n$$ decays with an uncertainty of $$\\sqrt{n}$$. Each hour can be assumed independent of the previous one, and $$n$$ can be assumed constant over time. How many hours do you need to conduct the observation so that you can determine $$n$$ within an uncertainty of 1%?`,
    choices: {
      A: '$$n/10^2$$',
      B: '$$n/10^4$$',
      C: '$$10^2/n$$',
      D: '$$10^4/n$$',
      E: '$$10^8/n^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['data analysis', 'error analysis', 'uncertainty propagation'],
    solution: `Observe for $$h$$ hours. The total number of decays observed is $$N = nh$$ on average. Since each hour is independent with standard deviation $$\\sqrt{n}$$, the standard deviation of the total count is $$\\sqrt{h} \\cdot \\sqrt{n} = \\sqrt{nh}$$.

Our estimate of $$n$$ is $$\\hat{n} = N/h$$ with uncertainty $$\\sigma_n = \\sqrt{nh}/h = \\sqrt{n/h}$$.

For 1% precision: $$\\sigma_n/n = 0.01$$, so $$\\sqrt{n/h}/n = 0.01$$, giving $$1/\\sqrt{nh} = 0.01$$, so $$nh = 10^4$$, meaning $$h = 10^4/n$$.

The answer is D.`,
  },
]
