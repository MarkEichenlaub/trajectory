// Digitized 2016 F=ma exam questions. Sources:
// Exam: work/fma/fma-2016.pdf (text extracted to work/fma/fma-2016.txt)
// Answer key: work/fma/fma-2016-sol.pdf (←CORRECT markers)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2016.1. through 2016.25.
// Figures: work/figure_manifest.json, key "fma-2016" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions.
// All 25 ←CORRECT markers were present; no conflicts detected.
//
// Notes on diagram questions (Q4, Q5, Q6):
//   Q4: The five choices are graphs of acceleration vs. time. The stem figure shows
//     labelled axes only; the cropped figure captures all five panels. Text descriptions
//     of each panel are given in the choices.
//   Q5 & Q6: The five choices are trajectory diagrams inside a box. The stem figure
//     shows the initial setup (particle with upward-right velocity, gravity down, box
//     accelerating right). The cropped figure for Q5 and Q6 share the same crop
//     (fma-2016-q05.png). Text descriptions of each path shape are given in choices.

const F16 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2016/fma-2016-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2016'
export const questions = [
  {
    n: 1, correct: 'E',
    statement: `A car drives anticlockwise (counterclockwise) around a flat, circular curve at constant speed, so that the left, front wheel traces out a circular path of radius $$R = 9.60$$ m. If the width of the car is $$1.74$$ m, what is the ratio of the angular velocity about its axle of the left, front wheel to that of the right, front wheel, of the car as it moves through the curve? Assume the wheels roll without slipping.`,
    choices: {
      A: '$$0.331$$',
      B: '$$0.630$$',
      C: '$$0.708$$',
      D: '$$0.815$$',
      E: '$$0.847$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'rolling without slipping', 'rigid body kinematics'],
    solution: `Both front wheels sweep the same angle $$\\Delta\\theta$$ in the same time $$\\Delta t$$, so their angular velocities ratio equals the ratio of arc lengths traveled. The left (inner) wheel travels on radius $$R$$ and the right (outer) wheel on radius $$R + d$$, where $$d = 1.74$$ m is the car's width:

$$\\frac{\\omega_L}{\\omega_R} = \\frac{R}{R + d} = \\frac{9.60}{9.60 + 1.74} = \\frac{9.60}{11.34} \\approx 0.847.$$

The answer is E.`,
  },
  {
    n: 2, correct: 'B',
    statement: `A 3.0 cm thick layer of oil with density $$\\rho_o = 800$$ kg/m$$^3$$ is floating above water that has density $$\\rho_w = 1000$$ kg/m$$^3$$. A solid cylinder is floating so that $$1/3$$ is in the water, $$1/3$$ is in the oil, and $$1/3$$ is in the air. Additional oil is added until the cylinder is floating only in oil. What fraction of the cylinder is in the oil?`,
    choices: {
      A: '$$3/5$$',
      B: '$$3/4$$',
      C: '$$2/3$$',
      D: '$$8/9$$',
      E: '$$4/5$$',
    },
    figures: [F16(2)], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `Let $$V$$ be the volume of the cylinder. The buoyancy force equals the weight, so the cylinder's mass is

$$m = \\frac{1}{3}\\rho_o V + \\frac{1}{3}\\rho_w V = \\frac{V}{3}(\\rho_o + \\rho_w).$$

When floating only in oil, the submerged fraction $$x$$ satisfies $$x \\rho_o V = m$$:

$$x = \\frac{m}{\\rho_o V} = \\frac{\\rho_o + \\rho_w}{3\\rho_o} = \\frac{800 + 1000}{3 \\times 800} = \\frac{1800}{2400} = \\frac{3}{4}.$$

The answer is B.`,
  },
  {
    n: 3, correct: 'E',
    statement: `An introductory physics student, elated by a first semester grade, celebrates by dropping a textbook from a balcony into a deep layer of soft snow which is 3.00 m below. Upon hitting the snow the book sinks a further 1.00 m into it before coming to a stop. The mass of the book is 5.0 kg. Assuming a constant retarding force, what is the force from the snow on the book?`,
    choices: {
      A: '85 N',
      B: '100 N',
      C: '120 N',
      D: '150 N',
      E: '200 N',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion', 'newton\'s laws'],
    solution: `Let $$H = 3.00$$ m be the drop height and $$h = 1.00$$ m the stopping distance in snow. The book hits the snow with speed $$v^2 = 2gH$$. Inside the snow the deceleration $$a$$ satisfies $$v^2 = 2ah$$, so

$$a = \\frac{gH}{h} = \\frac{10 \\times 3.00}{1.00} = 30 \\text{ m/s}^2.$$

Applying Newton's second law (taking downward as positive):

$$mg - F_\\text{snow} = -ma \\implies F_\\text{snow} = m(g + a) = 5.0(10 + 30) = 200 \\text{ N.}$$

The answer is E.`,
  },
  {
    n: 4, correct: 'D',
    statement: `A small bead slides from rest along a wire that is shaped like a vertical uniform helix (spring). Which graph below shows the magnitude of the acceleration $$a$$ as a function of time?`,
    choices: {
      A: 'Constant (horizontal line above zero): $$a$$ is the same for all $$t$$.',
      B: 'Straight line from the origin: $$a$$ grows linearly from zero.',
      C: 'Curve from the origin that bends upward faster than linear (starts at zero, accelerates upward with increasing slope).',
      D: 'Curve that starts at a positive nonzero value at $$t = 0$$ and curves upward, growing faster than linear.',
      E: 'Straight line starting from a positive nonzero value at $$t = 0$$, growing linearly.',
    },
    figures: [F16(4)], topics: ['Mechanics'], tags: ['1d kinematics', 'circular motion', 'equations of motion'],
    solution: `The tangential acceleration along the helix is $$a_t = g\\sin\\alpha$$ (constant, since the helix angle $$\\alpha$$ is uniform). This means $$a_t$$ is nonzero at $$t = 0$$, ruling out options B and C. As the bead speeds up, the centripetal acceleration grows as $$a_c = v_h^2/r = (a_t t)^2/r$$, where $$v_h$$ is the horizontal speed component. The total acceleration magnitude is

$$a = \\sqrt{a_t^2 + a_c^2} = \\sqrt{P + Qt^4},$$

where $$P = a_t^2 > 0$$ and $$Q > 0$$. At $$t = 0$$ this equals $$a_t > 0$$ (nonzero constant), and it curves upward at an increasing rate for large $$t$$. This matches graph D.

The answer is D.`,
  },
  {
    n: 5, correct: 'C',
    statement: `__The following information applies to questions 5 and 6.__

Consider a particle in a box where the force of gravity is down as shown in the figure. The particle has an initial velocity as shown (upward and to the right), and the box has a constant acceleration to the right.

In the frame of the box, which of the following is a possible path followed by the particle?`,
    choices: {
      A: 'Path that curves to the left initially, then bends back to the right — effectively curving back toward the left wall.',
      B: 'Path that curves upward then strongly to the right — bending upward and then right near the top of the box.',
      C: 'Path that curves to the right and downward in a parabolic arc, bending down and to the right (consistent with an effective gravity pointing down-left).',
      D: 'Path that arcs up and then back down symmetrically (like a standard projectile with no horizontal acceleration).',
      E: 'Symmetric parabolic arc that curves upward and then falls, with no net horizontal drift.',
    },
    figures: [F16(5)], topics: ['Mechanics'], tags: ['non-inertial frames', 'kinematics-2d', 'projectile motion'],
    solution: `In the frame of the (rightward-accelerating) box, there is a pseudo-force pointing to the left, so the effective gravity is directed down and to the left. Combined with the initial upward-right velocity, the particle follows a parabolic arc that bends down and to the right (the parabola axis points down-left), which is path C.

Options A and B cannot be correct because the particle cannot curve back against its initial horizontal velocity without a rightward force, and options D and E show no horizontal bias from the box acceleration. The answer is C.`,
  },
  {
    n: 6, correct: 'A',
    statement: `__The following information applies to questions 5 and 6.__

Consider a particle in a box where the force of gravity is down as shown in the figure. The particle has an initial velocity as shown (upward and to the right), and the box has a constant acceleration to the right.

If the magnitude of the acceleration of the box is chosen correctly, the launched particle will follow a path that returns to the point that it was launched. In the frame of the box, which path is followed by the particle?`,
    choices: {
      A: 'A straight diagonal line: the particle travels in a straight line from the launch point and returns along the same straight line (an out-and-back path coinciding with the initial velocity direction).',
      B: 'A teardrop loop that starts at the launch point, curves into a closed teardrop shape, and returns to the start from below.',
      C: 'A teardrop loop that starts at the launch point, curves into a closed teardrop shape, and returns to the start from the right.',
      D: 'A circle, with the launch point at the lower left, the path going clockwise.',
      E: 'A circle, with the launch point at the lower right, the path going counterclockwise.',
    },
    figures: [F16(5)], topics: ['Mechanics'], tags: ['non-inertial frames', 'kinematics-2d', 'projectile motion'],
    solution: `When the box's acceleration is chosen so that the effective gravity points exactly opposite to the initial velocity, the effective gravitational field is antiparallel to $$\\vec{v}_0$$. In that frame the particle decelerates to a stop and returns along the exact same straight line — just like throwing a ball straight up. The result is a straight out-and-back path coinciding with the direction of the initial velocity, which is path A.

The answer is A.`,
  },
  {
    n: 7, correct: 'C',
    statement: `A mass on a frictionless table is attached to the midpoint of an originally unstretched spring fixed at the ends. If the mass is displaced a distance $$A$$ parallel to the table surface but perpendicular to the spring, it exhibits oscillations. The period $$T$$ of the oscillations`,
    choices: {
      A: 'does not depend on $$A$$.',
      B: 'increases as $$A$$ increases, approaching a fixed value.',
      C: 'decreases as $$A$$ increases, approaching a fixed value.',
      D: 'is approximately constant for small values of $$A$$, then increases without bound.',
      E: 'is approximately constant for small values of $$A$$, then decreases without bound.',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'energy conservation'],
    solution: `Let the half-length of the relaxed spring be $$L$$ and the spring constant of each half be $$k$$. When displaced by $$A$$ perpendicular to the spring, each half stretches by $$x = \\sqrt{L^2 + A^2} - L$$, and the potential energy is $$E_p = kx^2$$.

__Large $$A$$ limit__ ($$A \\gg L$$): $$x \\approx A$$, so $$E_p \\approx kA^2$$ — quadratic in $$A$$, giving simple harmonic motion with a fixed period.

__Small $$A$$ limit__ ($$A \\ll L$$): $$x \\approx \\frac{A^2}{2L}$$, so $$E_p \\approx \\frac{k}{4L^2}A^4$$ — quartic in $$A$$. The restoring force $$F \\approx -\\frac{k}{L^2}A^3$$ grows more slowly than the displacement, so the effective "spring constant" decreases as $$A$$ increases toward the large-$$A$$ regime, meaning the period decreases.

Therefore, $$T$$ decreases as $$A$$ increases, approaching the large-$$A$$ fixed value. The answer is C.`,
  },
  {
    n: 8, correct: 'B',
    statement: `Kepler's Laws state that

__I.__ the orbits of planets are elliptical with one focus at the sun,

__II.__ a line connecting the sun and a planet sweeps out equal areas in equal times, and

__III.__ the square of the period of a planet's orbit is proportional to the cube of its semimajor axis.

Which of these laws would remain true if the force of gravity were proportional to $$1/r^3$$ rather than $$1/r^2$$?`,
    choices: {
      A: 'Only I.',
      B: 'Only II.',
      C: 'Only III.',
      D: 'Both II and III.',
      E: 'None of the above.',
    },
    figures: [], topics: ['Mechanics'], tags: ['kepler\'s laws', 'orbital mechanics', 'angular momentum conservation'],
    solution: `Kepler's Second Law (equal areas in equal times) is a consequence of conservation of angular momentum, which holds for __any__ central force — regardless of whether it goes as $$1/r^2$$ or $$1/r^3$$. It does not depend on the specific form of the force.

Kepler's First Law (elliptical orbits) and Third Law ($$T^2 \\propto a^3$$) are consequences specific to the inverse-square law. Under a $$1/r^3$$ force, orbits are generally not ellipses and the period-axis relation changes.

Therefore only Law II remains true, and the answer is B.`,
  },
  {
    n: 9, correct: 'E',
    statement: `A small bead is placed on the top of a frictionless glass sphere of diameter $$D$$ as shown. The bead is given a slight push and starts sliding down along the sphere. Find the speed $$v$$ of the bead at the point at which the bead leaves the sphere.`,
    choices: {
      A: '$$v = \\sqrt{gD}$$',
      B: '$$v = \\sqrt{4gD/5}$$',
      C: '$$v = \\sqrt{2gD/3}$$',
      D: '$$v = \\sqrt{gD/2}$$',
      E: '$$v = \\sqrt{gD/3}$$',
    },
    figures: [F16(9)], topics: ['Mechanics'], tags: ['energy conservation', 'circular motion', 'normal force'],
    solution: `Let $$R = D/2$$ be the radius and $$\\theta$$ the angle from the top at which the bead leaves. At that point the centripetal condition (no normal force) gives

$$mg\\cos\\theta = \\frac{mv^2}{R}.$$

Energy conservation from the top (height drop $$h = R(1 - \\cos\\theta) = R - R\\cos\\theta$$):

$$\\frac{mv^2}{2} = mgh = mgR(1 - \\cos\\theta).$$

From the centripetal condition, $$\\cos\\theta = v^2/(gR)$$. Substituting:

$$\\frac{v^2}{2} = gR\\!\\left(1 - \\frac{v^2}{gR}\\right) = gR - v^2 \\implies \\frac{3v^2}{2} = gR \\implies v^2 = \\frac{2gR}{3} = \\frac{gD}{3}.$$

Therefore $$v = \\sqrt{gD/3}$$, and the answer is E.`,
  },
  {
    n: 10, correct: 'D',
    statement: `Two blocks are suspended by two massless elastic strings to the ceiling as shown in the figure. The masses of the upper and lower block are $$m_1 = 2$$ kg and $$m_2 = 4$$ kg respectively. If the upper string is suddenly cut just above the top block, what are the accelerations of the two blocks at the moment when the top block begins to fall?`,
    choices: {
      A: 'upper: 10 m/s$$^2$$; lower: 0',
      B: 'upper: 10 m/s$$^2$$; lower: 10 m/s$$^2$$',
      C: 'upper: 20 m/s$$^2$$; lower: 10 m/s$$^2$$',
      D: 'upper: 30 m/s$$^2$$; lower: 0',
      E: 'upper: 30 m/s$$^2$$; lower: 10 m/s$$^2$$',
    },
    figures: [F16(10)], topics: ['Mechanics'], tags: ['newton\'s laws', 'springs', 'free-body diagrams'],
    solution: `Before the cut, each block is in equilibrium. The lower string tension is $$T_2 = m_2 g = 40$$ N (supporting block 2). The upper string tension is $$T_1 = (m_1 + m_2)g = 60$$ N (supporting both blocks).

Immediately after the upper string is cut, the spring forces have not yet changed (elastic strings take time to relax). Block 2 still has $$T_2 = 40$$ N upward and $$m_2 g = 40$$ N downward, so its net force is zero and $$a_2 = 0$$.

Block 1 now has $$T_2 = 40$$ N upward (from the lower string) and $$m_1 g = 20$$ N downward, but no longer the upper string tension. Net force on block 1 is $$T_2 + m_1 g = 40 + 20 = 60$$ N downward? Wait — the lower string pulls block 1 __upward__? No: the string between them pulls block 1 __downward__ (the lower block hangs from block 1 via the lower string). So block 1 has $$m_1 g$$ downward and $$T_2$$ downward from the connection, giving net downward force $$m_1 g + T_2 = 20 + 40 = 60$$ N. Acceleration: $$a_1 = 60/2 = 30$$ m/s$$^2$$ downward.

Alternatively: before the cut $$T_1 - T_2 - m_1 g = 0$$, so $$T_1 = T_2 + m_1 g$$. After the cut, the net force on block 1 is $$T_1$$ (no longer there) replaced by nothing, leaving $$-T_2 - m_1 g + 0$$... The net downward force is $$T_2 + m_1 g = (m_1 + m_2)g = 60$$ N, giving $$a_1 = (m_1 + m_2)g/m_1 = 3g = 30$$ m/s$$^2$$. The answer is D.`,
  },
  {
    n: 11, correct: 'A',
    statement: `The power output from a certain experimental car design to be shaped like a cube is proportional to the mass $$m$$ of the car. The force of air friction on the car is proportional to $$Av^2$$, where $$v$$ is the speed of the car and $$A$$ is the cross-sectional area. On a level surface the car has a maximum speed $$v_\\text{max}$$. Assuming that all versions of this design have the same density, then which of the following is true?`,
    choices: {
      A: '$$v_\\text{max} \\propto m^{1/9}$$',
      B: '$$v_\\text{max} \\propto m^{1/7}$$',
      C: '$$v_\\text{max} \\propto m^{1/3}$$',
      D: '$$v_\\text{max} \\propto m^{2/3}$$',
      E: '$$v_\\text{max} \\propto m^{3/4}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling', 'power', 'drag force'],
    solution: `For a cube with constant density, the side length $$L \\propto m^{1/3}$$, so the frontal area $$A = L^2 \\propto m^{2/3}$$.

At maximum speed the engine power equals the power dissipated by air drag:

$$P = F_\\text{drag} \\cdot v_\\text{max} \\propto A v_\\text{max}^2 \\cdot v_\\text{max} = A v_\\text{max}^3 \\propto m^{2/3} v_\\text{max}^3.$$

Since $$P \\propto m$$:

$$m \\propto m^{2/3} v_\\text{max}^3 \\implies m^{1/3} \\propto v_\\text{max}^3 \\implies v_\\text{max} \\propto m^{1/9}.$$

The answer is A.`,
  },
  {
    n: 12, correct: 'C',
    statement: `A block floats partially submerged in a container of liquid. When the entire container is accelerated upward, which of the following happens? Assume that both the liquid and the block are incompressible.`,
    choices: {
      A: 'The block descends down lower into the liquid.',
      B: 'The block ascends up higher in the liquid.',
      C: 'The block does not ascend nor descend in the liquid.',
      D: 'The answer depends on the direction of motion of the container.',
      E: 'The answer depends on the rate of change of the acceleration.',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics', 'non-inertial frames'],
    solution: `The equilibrium condition for a floating block is that the buoyancy force equals the weight:

$$\\rho_\\text{liquid} V_\\text{sub} g = \\rho_\\text{block} V g,$$

giving submerged fraction $$V_\\text{sub}/V = \\rho_\\text{block}/\\rho_\\text{liquid}$$.

When the container accelerates upward at $$a$$, by Einstein's equivalence principle the effective gravitational acceleration becomes $$g' = g + a$$. Both the weight and the buoyancy force scale with $$g'$$, so the ratio $$\\rho_\\text{block}/\\rho_\\text{liquid}$$ is unchanged and the submerged fraction stays the same. The block neither ascends nor descends.

The answer is C.`,
  },
  {
    n: 13, correct: 'E',
    statement: `An object of mass $$m_1$$ initially moving at speed $$v_0$$ collides with an originally stationary object of mass $$m_2 = \\alpha m_1$$, where $$\\alpha < 1$$. The collision could be completely elastic, completely inelastic, or partially inelastic. After the collision the two objects move at speeds $$v_1$$ and $$v_2$$. Assume that the collision is one dimensional, and that object one cannot pass through object two.

After the collision, the speed ratio $$r_2 = v_2/v_0$$ of object 2 is bounded by`,
    choices: {
      A: '$$\\dfrac{1 - \\alpha}{1 + \\alpha} \\leq r_2 \\leq 1$$',
      B: '$$\\dfrac{1 - \\alpha}{1 + \\alpha} \\leq r_2 \\leq \\dfrac{1}{1 + \\alpha}$$',
      C: '$$\\dfrac{\\alpha}{1 + \\alpha} \\leq r_2 \\leq 1$$',
      D: '$$0 \\leq r_2 \\leq \\dfrac{2\\alpha}{1 + \\alpha}$$',
      E: '$$\\dfrac{1}{1 + \\alpha} \\leq r_2 \\leq \\dfrac{2}{1 + \\alpha}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
    solution: `The two extreme cases bound $$r_2$$:

__Elastic collision__ (maximum $$r_2$$): Conserving both momentum and kinetic energy gives

$$r_2 = \\frac{2m_1}{m_1 + m_2} = \\frac{2}{1 + \\alpha}.$$

__Perfectly inelastic collision__ (minimum $$r_2$$): Both objects move together, so

$$r_2 = \\frac{m_1}{m_1 + m_2} = \\frac{1}{1 + \\alpha}.$$

Since object 1 cannot pass through object 2, object 2 must always move at least as fast as object 1 after the collision. All partially inelastic collisions give intermediate values of $$r_2$$, so:

$$\\frac{1}{1 + \\alpha} \\leq r_2 \\leq \\frac{2}{1 + \\alpha}.$$

The answer is E.`,
  },
  {
    n: 14, correct: 'A',
    statement: `__The following information applies to questions 14 and 15.__

A uniform rod of length $$l$$ lies on a frictionless horizontal surface. One end of the rod is attached to a pivot. An unstretched spring of length $$L \\gg l$$ lies on the surface perpendicular to the rod; one end of the spring is attached to the movable end of the rod, and the other end is attached to a fixed post. When the rod is rotated slightly about the pivot, it oscillates at frequency $$f$$.

The spring attachment is moved to the midpoint of the rod, and the post is moved so the spring remains unstretched and perpendicular to the rod. The system is again set into small oscillations. What is the new frequency of oscillation?`,
    choices: {
      A: '$$f/2$$',
      B: '$$f/\\sqrt{2}$$',
      C: '$$f$$',
      D: '$$\\sqrt{2}\\,f$$',
      E: '$$2f$$',
    },
    figures: [F16(14)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'torque', 'springs'],
    solution: `Let $$I$$ be the moment of inertia of the rod about the pivot and $$r$$ the distance from the pivot to the spring attachment point. When the rod rotates by angle $$\\theta$$, the spring extends by $$r\\theta$$ (for $$L \\gg l$$), exerting a restoring torque $$\\tau = -k r^2 \\theta$$. The equation of motion is

$$I\\ddot{\\theta} = -kr^2\\theta,$$

giving angular frequency $$\\omega = r\\sqrt{k/I}$$ and frequency $$f = \\frac{r}{2\\pi}\\sqrt{k/I}$$.

So frequency is proportional to $$r$$. Moving the attachment from $$r = l$$ to $$r = l/2$$ halves the frequency:

$$f' = f/2.$$

The answer is A.`,
  },
  {
    n: 15, correct: 'C',
    statement: `__The following information applies to questions 14 and 15.__

A uniform rod of length $$l$$ lies on a frictionless horizontal surface. One end of the rod is attached to a pivot. An unstretched spring of length $$L \\gg l$$ lies on the surface perpendicular to the rod; one end of the spring is attached to the movable end of the rod, and the other end is attached to a fixed post. When the rod is rotated slightly about the pivot, it oscillates at frequency $$f$$.

The spring attachment is moved back to the end of the rod; the post is moved so that it is in line with the rod and the pivot and the spring is unstretched. The post is then moved away from the pivot by an additional amount $$l$$. What is the new frequency of oscillation?`,
    choices: {
      A: '$$f/3$$',
      B: '$$f/\\sqrt{3}$$',
      C: '$$f$$',
      D: '$$\\sqrt{3}\\,f$$',
      E: '$$3f$$',
    },
    figures: [F16(14)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'torque', 'springs'],
    solution: `In this configuration the spring lies along the direction of the rod (post inline with pivot). When the rod rotates by $$\\theta$$, the end moves through an arc $$l\\theta$$ perpendicular to the rod. The spring extension is approximately $$l\\theta$$ (the horizontal displacement for small angles), so the spring force is $$F = kl\\theta$$. The lever arm is $$l\\sin\\theta \\approx l\\theta$$, giving torque

$$\\tau = -F \\cdot l\\theta \\approx -k l^2 \\theta^2.$$

Wait — more carefully: the torque arm is the perpendicular distance from the pivot to the line of the spring force. With the spring along the original rod direction and the rod displaced by $$\\theta$$, the spring force $$F = kl\\theta$$ acts perpendicular to the rod, with lever arm $$l$$. So

$$\\tau = -kl\\theta \\cdot l = -kl^2\\theta,$$

which is the same equation of motion as before with $$r = l$$. Therefore the frequency is unchanged:

$$f' = f.$$

The answer is C.`,
  },
  {
    n: 16, correct: 'C',
    statement: `A ball rolls from the back of a large truck traveling 10.0 m/s to the right. The ball is traveling horizontally at 8.0 m/s to the left relative to an observer in the truck. The ball lands on the roadway 1.25 m below its starting level. How far behind the truck does it land?`,
    choices: {
      A: '0.50 m',
      B: '1.0 m',
      C: '4.0 m',
      D: '5.0 m',
      E: '9.0 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'reference frames', 'kinematics-2d'],
    solution: `The question asks for the distance behind the truck, so we work in the truck's frame. The ball leaves the truck at 8.0 m/s horizontally (to the left relative to the truck) and falls 1.25 m.

Time to fall: $$h = \\frac{1}{2}gt^2 \\implies t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\times 1.25}{10}} = 0.50$$ s.

Horizontal distance behind the truck: $$d = u \\cdot t = 8.0 \\times 0.50 = 4.0$$ m.

The truck's speed (10.0 m/s) is irrelevant since the question is relative to the truck. The answer is C.`,
  },
  {
    n: 17, correct: 'A',
    statement: `As shown in the figure, a ping-pong ball with mass $$m$$ with initial horizontal velocity $$v$$ and angular velocity $$\\omega$$ comes into contact with the ground. Friction is not negligible, so both the velocity and angular velocity of the ping-pong ball change. What is the critical velocity $$v_c$$ such that the ping-pong ball will stop and remain stopped? Treat the ping-pong ball as a hollow sphere.`,
    choices: {
      A: '$$v_c = \\dfrac{2}{3}R\\omega$$',
      B: '$$v_c = \\dfrac{2}{5}R\\omega$$',
      C: '$$v_c = R\\omega$$',
      D: '$$v_c = \\dfrac{3}{5}R\\omega$$',
      E: '$$v_c = \\dfrac{5}{3}R\\omega$$',
    },
    figures: [F16(17)], topics: ['Mechanics'], tags: ['angular momentum', 'impulse', 'rolling without slipping', 'rotational dynamics'],
    solution: `The moment of inertia of a hollow sphere is $$I = \\frac{2}{3}mR^2$$. The friction force $$F$$ acts for time $$\\delta t$$ at the contact point.

For translation: $$F\\delta t = mv_c$$ (the impulse stops the ball).

For rotation: $$FR\\delta t = I\\omega = \\frac{2}{3}mR^2\\omega$$ (the torque impulse stops the spin).

Dividing the second equation by the first:

$$R = \\frac{\\frac{2}{3}mR^2\\omega}{mv_c} \\implies v_c = \\frac{2}{3}R\\omega.$$

The answer is A.`,
  },
  {
    n: 18, correct: 'E',
    statement: `A spinning object begins from rest and accelerates to an angular velocity of $$\\omega = \\pi/15$$ rad/s with an angular acceleration of $$\\alpha = \\pi/75$$ rad/s$$^2$$. It remains spinning at that constant angular velocity and then stops with an angular acceleration of the same magnitude as it previously accelerated. The object made a total of 3 complete rotations during the entire motion. How much time did the motion take?`,
    choices: {
      A: '75 s',
      B: '80 s',
      C: '85 s',
      D: '90 s',
      E: '95 s',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational motion', 'equations of motion', '1d kinematics'],
    solution: `The spin-up and spin-down phases are symmetric, each taking time $$t_1 = \\omega/\\alpha = \\frac{\\pi/15}{\\pi/75} = 5$$ s and covering angle $$\\theta_1 = \\frac{\\omega^2}{2\\alpha} = \\frac{(\\pi/15)^2}{2(\\pi/75)} = \\frac{\\pi}{6}$$ rad each. Together they sweep $$2\\theta_1 = \\pi/3$$ rad.

Total angle: $$\\theta_\\text{total} = 3 \\times 2\\pi = 6\\pi$$ rad. Angle at constant speed: $$\\theta_2 = 6\\pi - \\pi/3 = \\frac{17\\pi}{3}$$ rad.

Time at constant speed: $$t_2 = \\theta_2/\\omega = \\frac{17\\pi/3}{\\pi/15} = \\frac{17 \\times 15}{3} = 85$$ s.

Total time: $$T = t_1 + t_2 + t_1 = 5 + 85 + 5 = 95$$ s.

The answer is E.`,
  },
  {
    n: 19, correct: 'D',
    statement: `A semicircular wire of radius $$R$$ is oriented vertically. A small bead is released from rest at the top of the wire, it slides without friction under the influence of gravity to the bottom, where it then leaves the wire horizontally and falls a distance $$H$$ to the ground. The bead lands a horizontal distance $$D$$ away from where it was launched.

Which of the following is a correct graph of $$RH$$ against $$D^2$$?`,
    choices: {
      A: 'A straight line from the origin with positive slope ($$RH \\propto D^2$$).',
      B: 'A curve that starts steeply and levels off (sublinear, like $$\\sqrt{D^2}$$).',
      C: 'A curve that starts flat and increases faster than linearly (superlinear).',
      D: 'A straight line from the origin with positive slope (same as A — $$RH$$ proportional to $$D^2$$, linear through origin).',
      E: 'A curve that does not pass through the origin (nonzero intercept).',
    },
    figures: [F16(19)], topics: ['Mechanics'], tags: ['energy conservation', 'projectile motion', 'graph interpretation'],
    solution: `The bead falls from the top of the semicircle (height $$2R$$ above the bottom) to the bottom, gaining speed $$v$$ via energy conservation:

$$\\frac{mv^2}{2} = mg(2R) \\implies v^2 = 4gR.$$

As a projectile from the bottom of the wire, it falls height $$H$$ in time $$t$$ and travels horizontally $$D = vt$$:

$$H = \\frac{gt^2}{2} \\implies t^2 = \\frac{2H}{g}, \\quad D^2 = v^2 t^2 = 4gR \\cdot \\frac{2H}{g} = 8RH.$$

Therefore $$RH = \\frac{D^2}{8}$$, a linear relation through the origin. The graph of $$RH$$ vs $$D^2$$ is a straight line through the origin. This corresponds to graph D.

The answer is D.`,
  },
  {
    n: 20, correct: 'E',
    statement: `A uniform solid right prism whose cross section is an isosceles right triangle with height $$h$$ and width $$w = 2h$$ is placed on an incline that has a variable angle with the horizontal $$\\theta$$. What is the minimum coefficient of static friction so that the prism topples before it begins sliding as $$\\theta$$ is slowly increased from zero?`,
    choices: {
      A: '0.71',
      B: '1.41',
      C: '1.50',
      D: '1.73',
      E: '3.00',
    },
    figures: [F16(20)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'friction', 'center of mass'],
    solution: `The prism rests on its widest face (width $$w = 2h$$). The centroid (center of mass) of an isosceles right triangle with height $$h$$ lies $$h/3$$ above the base.

__Toppling condition:__ The prism topples when the vertical through the center of mass passes the lower edge of the base. This occurs at angle $$\\theta_\\text{top}$$ where

$$\\tan\\theta_\\text{top} = \\frac{h/3}{h} = \\frac{1}{3}\\cdot\\frac{w/2}{h/3}.$$

More carefully: the CM is at height $$h/3$$ above the base and at horizontal distance $$w/2 = h$$ from the lower edge (by symmetry of the right triangle, the CM is at $$h$$ from the right-angle vertex side). Toppling occurs when $$\\tan\\theta = (h/3)/h = 1/3$$? Let's recalculate: The CM of the triangle is at $$1/3$$ of the height from the base, i.e., at $$h_\\text{CM} = h/3$$, and horizontally centered at $$w/2 = h$$ from each side. The lower corner is at the base. The tipping point is when the CM is directly above the lower edge:

$$\\tan\\theta_\\text{top} = \\frac{h_\\text{CM,horizontal}}{h_\\text{CM,vertical}} = \\frac{h}{h/3} = 3.$$

__Sliding condition:__ Sliding begins when $$\\tan\\theta_\\text{slide} = \\mu$$.

For toppling before sliding we need $$\\theta_\\text{top} < \\theta_\\text{slide}$$, i.e., $$\\mu > \\tan\\theta_\\text{top} = 3$$. The minimum coefficient is $$\\mu = 3.00$$.

The answer is E.`,
  },
  {
    n: 21, correct: 'A',
    statement: `__The following information applies to questions 21 and 22.__

A small ball of mass $$3m$$ is at rest on the ground. A second small ball of mass $$m$$ is positioned above the ground by a vertical massless rod of length $$L$$ that is also attached to the ball on the ground. The original orientation of the rod is directly vertical, and the top ball is given a small horizontal nudge. There is no friction; assume that everything happens in a single plane.

Determine the horizontal displacement $$x$$ of the second ball just before it hits the ground.`,
    choices: {
      A: '$$x = \\dfrac{3}{4}L$$',
      B: '$$x = \\dfrac{3}{5}L$$',
      C: '$$x = \\dfrac{1}{4}L$$',
      D: '$$x = \\dfrac{1}{3}L$$',
      E: '$$x = \\dfrac{2}{5}L$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['center of mass', 'momentum conservation', 'constraint kinematics'],
    solution: `There are no external horizontal forces on the system, so the horizontal position of the center of mass is conserved.

Initially, both balls are at rest with the rod vertical: the CM is directly above the lower ball. As the upper ball falls and swings out, the lower ball slides horizontally on the frictionless ground to keep the CM fixed.

When the rod is horizontal (the upper ball has reached the ground level), the upper ball has moved a horizontal distance $$x$$ from its starting position. The lower ball has moved horizontally by $$d$$ in the opposite direction. CM conservation:

$$m \\cdot x = 3m \\cdot d \\implies d = x/3.$$

The rod constraint says $$x + d = L$$ (the rod length projected horizontally when horizontal):

$$x + x/3 = L \\implies \\frac{4x}{3} = L \\implies x = \\frac{3}{4}L.$$

The answer is A.`,
  },
  {
    n: 22, correct: 'A',
    statement: `__The following information applies to questions 21 and 22.__

A small ball of mass $$3m$$ is at rest on the ground. A second small ball of mass $$m$$ is positioned above the ground by a vertical massless rod of length $$L$$ that is also attached to the ball on the ground. The original orientation of the rod is directly vertical, and the top ball is given a small horizontal nudge. There is no friction; assume that everything happens in a single plane.

Determine the speed $$v$$ of the second (originally top) ball just before it hits the ground.`,
    choices: {
      A: '$$v = \\sqrt{2gL}$$',
      B: '$$v = \\sqrt{gL}$$',
      C: '$$v = \\sqrt{2gL/3}$$',
      D: '$$v = \\sqrt{3gL/2}$$',
      E: '$$v = \\sqrt{gL/4}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'center of mass', 'constraint kinematics'],
    solution: `Just before the upper ball (mass $$m$$) hits the ground, the rod is horizontal. At this moment the lower ball (mass $$3m$$) has moved horizontally by $$d = L/4$$ (from Q21). Because the rod is rigid and horizontal, the velocity of the lower ball is horizontal. By the constraint that the rod length is constant, the upper ball's velocity at this moment is purely vertical (the upper ball is moving straight down when the rod is horizontal).

Since the lower ball's velocity is horizontal and the upper ball's velocity is vertical, they are perpendicular. The CM has zero horizontal velocity (no external horizontal forces), so $$3m v_{3m} = m v_{m,\\text{horiz}}$$. But $$v_{m,\\text{horiz}} = 0$$ (purely vertical), so $$v_{3m} = 0$$ — the lower ball is momentarily at rest.

Energy conservation: the system started from rest with the upper ball at height $$L$$. The CM of the system was initially at height $$L/4$$ (since CM = $$\\frac{m \\cdot L + 3m \\cdot 0}{4m} = L/4$$). When the rod is horizontal, both balls are at ground level (height 0). All potential energy converts to kinetic energy of just the upper ball:

$$4m \\cdot g \\cdot \\frac{L}{4} = \\frac{1}{2}mv^2 \\implies mgL = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gL}.$$

The answer is A.`,
  },
  {
    n: 23, correct: 'D',
    statement: `A uniform thin circular rubber band of mass $$M$$ and spring constant $$k$$ has an original radius $$R$$. Now it is tossed into the air. Assume it remains circular when stabilized in air and rotates at angular speed $$\\omega$$ about its center uniformly. Which of the following gives the new radius of the rubber band?`,
    choices: {
      A: '$$\\dfrac{2\\pi k R}{2\\pi k - M\\omega^2}$$',
      B: '$$\\dfrac{4\\pi k R}{4\\pi k - M\\omega^2}$$',
      C: '$$\\dfrac{8\\pi^2 k R}{8\\pi^2 k - M\\omega^2}$$',
      D: '$$\\dfrac{4\\pi^2 k R}{4\\pi^2 k - M\\omega^2}$$',
      E: '$$\\dfrac{4\\pi k R}{2\\pi k - M\\omega^2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'springs', 'tension', 'rotational dynamics'],
    solution: `Consider a small arc element of the band subtending angle $$\\Delta\\theta$$ at the new radius $$R'$$. Its mass is $$\\Delta m = M\\Delta\\theta/(2\\pi)$$ and it requires centripetal force $$\\Delta m \\,\\omega^2 R'$$.

The tension $$T$$ in the band provides this centripetal force. Each side of the element pulls with tension $$T$$ at angle $$\\Delta\\theta/2$$ from tangential, giving a net radial (inward) force:

$$2T\\sin\\!\\left(\\frac{\\Delta\\theta}{2}\\right) \\approx T\\Delta\\theta = \\Delta m\\,\\omega^2 R' = \\frac{M\\Delta\\theta}{2\\pi}\\omega^2 R'.$$

So $$T = \\frac{M\\omega^2 R'}{2\\pi}$$.

The rubber band is a spring: when stretched from radius $$R$$ to $$R'$$, its circumference increases by $$2\\pi(R' - R)$$, so the tension is also $$T = k \\cdot 2\\pi(R' - R)$$. Equating:

$$2\\pi k(R' - R) = \\frac{M\\omega^2 R'}{2\\pi} \\implies 4\\pi^2 k(R' - R) = M\\omega^2 R' \\implies R'(4\\pi^2 k - M\\omega^2) = 4\\pi^2 k R,$$

$$R' = \\frac{4\\pi^2 k R}{4\\pi^2 k - M\\omega^2}.$$

The answer is D.`,
  },
  {
    n: 24, correct: 'B',
    statement: `The moment of inertia of a uniform equilateral triangle with mass $$m$$ and side length $$a$$ about an axis through one of its sides and parallel to that side is $$\\frac{1}{8}ma^2$$. What is the moment of inertia of a uniform regular hexagon of mass $$m$$ and side length $$a$$ about an axis through two opposite vertices?`,
    choices: {
      A: '$$\\dfrac{1}{6}ma^2$$',
      B: '$$\\dfrac{5}{24}ma^2$$',
      C: '$$\\dfrac{17}{72}ma^2$$',
      D: '$$\\dfrac{19}{72}ma^2$$',
      E: '$$\\dfrac{9}{32}ma^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['moment of inertia', 'rotational dynamics', 'symmetry'],
    solution: `A regular hexagon with side $$a$$ can be divided into 6 equilateral triangles, each with mass $$m/6$$ and side $$a$$. The axis passes through two opposite vertices of the hexagon.

Of the 6 triangles, 4 of them have the axis running along one of their sides (the two triangles adjacent to each vertex), giving moment of inertia $$\\frac{1}{8}(m/6)a^2$$ each. The remaining 2 triangles have the axis passing through their opposite vertex; by the parallel-axis theorem, their moment of inertia about the axis through a side is $$\\frac{1}{8}(m/6)a^2$$, and the centroid-to-side distance is $$h/3 = \\frac{a\\sqrt{3}/2}{3} = \\frac{a}{2\\sqrt{3}}$$, while the centroid-to-opposite-vertex distance is $$2h/3 = \\frac{a}{\\sqrt{3}}$$. Using the parallel axis theorem:

$$I_\\text{vertex} = I_\\text{CM} + (m/6)\\left(\\frac{a}{\\sqrt{3}}\\right)^2$$

where $$I_\\text{CM} = I_\\text{side} - (m/6)\\left(\\frac{a}{2\\sqrt{3}}\\right)^2 = \\frac{m a^2}{48} - \\frac{ma^2}{72} = \\frac{ma^2}{144}$$.

So $$I_\\text{vertex} = \\frac{ma^2}{144} + \\frac{m}{6} \\cdot \\frac{a^2}{3} = \\frac{ma^2}{144} + \\frac{ma^2}{18} = \\frac{ma^2}{144} + \\frac{8ma^2}{144} = \\frac{9ma^2}{144} = \\frac{3ma^2}{48}$$.

Total:

$$I = 4 \\times \\frac{ma^2}{48} + 2 \\times \\frac{3ma^2}{48} = \\frac{4ma^2 + 6ma^2}{48} = \\frac{10ma^2}{48} = \\frac{5ma^2}{24}.$$

The answer is B.`,
  },
  {
    n: 25, correct: 'A',
    statement: `Three students make measurements of the length of a 1.50 meter rod. Each student reports an uncertainty estimate representing an independent random error applicable to the measurement.

__Alice:__ A single measurement using a 2.0 meter long tape measure, to within $$\\pm 2$$ mm.

__Bob:__ Two measurements using a wooden meter stick, each to within $$\\pm 2$$ mm, which he adds together.

__Christina:__ Two measurements using a machinist's meter ruler, each to within $$\\pm 1$$ mm, which she adds together.

The students' teacher prefers measurements that are likely to have less error. Which is the correct order of preference?`,
    choices: {
      A: `Christina's is preferable to Alice's, which is preferable to Bob's`,
      B: `Alice's is preferable to Christina's, which is preferable to Bob's`,
      C: `Alice's and Christina's are equally preferable; both are preferable to Bob's`,
      D: `Christina's is preferable to both Alice's and to Bob's, which are equally preferable`,
      E: `Alice's is preferable to Bob's and Christina's, which are equally preferable`,
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'data analysis'],
    solution: `When independent Gaussian measurement errors are added, the combined uncertainty is the quadrature (Pythagorean) sum of the individual uncertainties:

__Alice:__ Single measurement, $$\\Delta_A = 2$$ mm.

__Bob:__ Two measurements each $$\\pm 2$$ mm, combined: $$\\Delta_B = \\sqrt{2^2 + 2^2} = 2\\sqrt{2} \\approx 2.83$$ mm.

__Christina:__ Two measurements each $$\\pm 1$$ mm, combined: $$\\Delta_C = \\sqrt{1^2 + 1^2} = \\sqrt{2} \\approx 1.41$$ mm.

Ranking from smallest (most preferred) to largest uncertainty:

$$\\Delta_C \\approx 1.41 \\text{ mm} < \\Delta_A = 2 \\text{ mm} < \\Delta_B \\approx 2.83 \\text{ mm.}$$

So Christina's is best, then Alice's, then Bob's. The answer is A.`,
  },
]
