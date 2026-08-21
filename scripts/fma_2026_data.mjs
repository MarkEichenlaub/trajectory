// Digitized 2026 F=ma exam questions. Source: AAPT exam + solution PDFs at
// https://aapt.org/physicsteam/2026/upload/2026_FMA_exam.pdf
// https://aapt.org/physicsteam/2026/upload/2026_FMA_solutions_v2.pdf
//
// Correct answer convention: in the solutions PDF the correct option's letter
// is NOT wrapped in parentheses; all wrong options are listed as "(A)", "(B)",
// etc. That is the signal used here.
//
// Q17 note: the solutions PDF awards full credit for both D (0.61) and E (0.66)
// because determining the true answer requires post-detachment dynamics beyond
// the scope of the exam. We use D as the canonical correct_choice.
//
// figure_urls reference per-question crops produced by crop_fma_figures.py and
// uploaded to Supabase storage by upload_fma_figures.mjs.

const P26 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2026/fma-2026-q${String(n).padStart(2, '0')}.png`

export const questions2026 = [
  {
    n: 1, correct: 'A',
    statement: `In astronomy, some galactic objects appear to sweep across the sky faster than light speed, $$c$$. This effect, called superluminal motion, comes purely from geometry and the finite travel time of light, and it has nothing to do with special relativity.

A jet moves from point A to B at speed $$v = \\beta c$$. The jet emits a pulse of light at A, and a second pulse a time $$\\delta t$$ later at B. An observer sees these pulses at point O. The angle between the jet and the line of sight is $$\\theta$$. Assume the angle $$\\phi$$ is small, so the distances from O to points B and C can be treated as equal. (See figure.)

Find the apparent transverse velocity, $$v_T$$, along CB as measured by the observer, in terms of $$\\beta$$ and $$\\theta$$. Express your answer as $$\\beta_T \\equiv v_T/c$$.`,
    choices: {
      A: '$$\\beta_T = \\dfrac{\\beta \\sin\\theta}{1 - \\beta \\cos\\theta}$$',
      B: '$$\\beta_T = \\beta \\sin\\theta\\,(1 - \\beta \\cos\\theta)$$',
      C: '$$\\beta_T = \\dfrac{\\beta \\sin\\theta}{1 + \\beta \\cos\\theta}$$',
      D: '$$\\beta_T = \\dfrac{\\beta \\sin\\theta}{\\sqrt{1 - \\beta^2}}$$',
      E: '$$\\beta_T = \\beta \\tan\\theta$$',
    },
    figures: [P26(1)], topics: ['Mechanics'], tags: ['kinematics-2d', 'relative motion', 'reference frames'],
  },
  {
    n: 2, correct: 'D',
    statement: `A series of dominoes are stood upright in a line. The dominoes have mass density $$\\rho$$, height $$h$$, and spacing $$d$$ between them. When the first domino is knocked over, a wave of falling dominoes propagates down the line with speed $$v$$.

Now, a second set of dominoes is set up identically, but with all dimensions ($$h$$ and $$d$$) scaled by $$\\lambda$$. The mass density is the same. Let $$v'$$ denote the wave speed of the scaled system. Which of the following best describes how $$v'$$ depends on $$\\lambda$$?`,
    choices: {
      A: '$$v\' \\sim \\dfrac{1}{\\sqrt{\\lambda}}$$',
      B: '$$v\' \\sim \\lambda$$',
      C: '$$v\' \\sim \\dfrac{1}{\\lambda}$$',
      D: '$$v\' \\sim \\sqrt{\\lambda}$$',
      E: '$$v\'$$ is independent of $$\\lambda$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling'],
  },
  {
    n: 3, correct: 'B',
    statement: `A point moves in the $$xy$$ plane, and its trajectory is shown in the figure below.

One of the following pairs of graphs shows the time dependence of $$v_x$$ and $$v_y$$ for this motion. Select the correct pair.`,
    // Diagram options: the stem shows the trajectory, each choice its own vx/vy
    // pair. Crops come from work/crop_q3.py via scripts/fix_fma_2026_q03.mjs,
    // because the bulk crop produced one clipped image for the whole question.
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map(L => [L, `${P26(3).replace('.png', '')}-${L.toLowerCase()}.png`])),
    figures: [P26(3)], topics: ['Mechanics'], tags: ['graph interpretation', 'kinematics-2d', 'speed vs velocity'],
  },
  {
    n: 4, correct: 'A',
    statement: `Two small balls are launched simultaneously from the same point at some height above horizontal ground. One ball is launched vertically upward with speed 3 m/s, while the other is launched horizontally with speed 4 m/s and lands on the ground at a horizontal distance of 20 m from the launch point. Neglect air resistance. At the moment the second ball lands, how far is it from the first ball?`,
    choices: { A: '25 m', B: '36 m', C: '60 m', D: '80 m', E: '240 m' },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d', 'relative motion'],
  },
  {
    n: 5, correct: 'E',
    statement: `A helicopter flies at constant height $$h$$ along a circular trajectory of radius $$R$$ with constant angular velocity $$\\omega$$, continuously dropping sand. Ignore air resistance. What is the radius of the curve traced by the sand on the ground?`,
    choices: {
      A: '$$R$$',
      B: '$$R\\sqrt{1 + h^2}$$',
      C: '$$R\\sqrt{1 + 2h^2}$$',
      D: '$$R\\sqrt{1 + \\dfrac{h\\omega^2}{g}}$$',
      E: '$$R\\sqrt{1 + \\dfrac{2h\\omega^2}{g}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'circular motion', 'kinematics-2d'],
  },
  {
    n: 6, correct: 'D',
    statement: `Newton's Impact Depth Approximation provides an estimate on how far a projectile will penetrate a material at high speeds. If a projectile of length $$L$$ and density $$\\rho_A$$ impacts a wall of density $$\\rho_B$$, Newton's approximation states that the projectile will penetrate to a depth of $$D = L\\,\\dfrac{\\rho_A}{\\rho_B}$$. Assuming this is true for all velocities, how does the average force the wall exerts on the projectile $$F$$ scale with the initial projectile speed $$v$$?`,
    choices: {
      A: '$$F \\propto v^{1/2}$$',
      B: '$$F \\propto v$$',
      C: '$$F \\propto v^{3/2}$$',
      D: '$$F \\propto v^2$$',
      E: '$$F \\propto v^{5/2}$$',
    },
    figures: [P26(6)], topics: ['Mechanics'], tags: ['scaling', 'dimensional analysis', 'energy conservation'],
  },
  {
    n: 7, correct: 'C',
    statement: `The James Webb telescope lies at a point called the Lagrange Point 2 or L2. This is a point where the telescope would remain stationary in a frame rotating with Earth's orbit around the sun, so a telescope placed exactly at L2 would be in an equilibrium position relative to Earth's orbit. What is the stability of this equilibrium point with respect to radial and tangential perturbations?`,
    choices: {
      A: 'Stable to both radial and tangential perturbations.',
      B: 'Stable to radial perturbations. Unstable to tangential perturbations.',
      C: 'Stable to tangential perturbations. Unstable to radial perturbations.',
      D: 'Unstable to both radial and tangential perturbations.',
      E: 'None of the listed. L2 is not a real equilibrium point because the centrifugal force is a fictitious force.',
    },
    figures: [P26(7)], topics: ['Mechanics'], tags: ['orbital mechanics', 'non-inertial frames', 'statics/equilibrium'],
  },
  {
    n: 8, correct: 'B',
    statement: `A puck of mass $$m$$ moves with speed $$v$$ toward a heavy bump of mass $$M$$, where $$M \\gg m$$. Both the puck and the bump slide without friction. The bump moves toward the puck with speed $$v/2$$ and provides a smooth transition from the horizontal surface onto the bump. The bump is tall enough that the puck slides back down. Find the maximum height $$h$$ the puck reaches. (See figure.)`,
    choices: {
      A: '$$\\dfrac{v^2}{2g}$$',
      B: '$$\\dfrac{9v^2}{8g}$$',
      C: '$$\\dfrac{3v^2}{8g}$$',
      D: '$$\\dfrac{7v^2}{4g}$$',
      E: '$$\\dfrac{3v^2}{4g}$$',
    },
    figures: [P26(8)], topics: ['Mechanics'], tags: ['energy conservation', 'reference frames', 'momentum conservation'],
  },
  {
    n: 9, correct: 'B',
    statement: `A vertical cylindrical pipe with a sealed bottom contains no air and is tall enough that its top is open to outer space (no atmosphere). A heavy plate is mounted at the bottom of the cylinder and vibrates vertically. A small ball inside the pipe undergoes elastic collisions with the plate.

The plate vibrates in such a way that, during each collision, it is moving upward with a constant speed equal to $$v/1000$$, where $$v$$ is the orbital speed at zero altitude above the Earth. The plate moves downward sufficiently fast that the ball collides with the plate only while the plate is moving upward. The ball is initially dropped from rest from a height equal to the Earth's radius above the plate.

After how many collisions with the plate will the ball escape the Earth's gravitational field?`,
    choices: { A: '207', B: '208', C: '414', D: '415', E: '1000' },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'collisions', 'orbital mechanics'],
  },
  {
    n: 10, correct: 'C',
    statement: `Consider the following three solid objects, each of mass $$M$$ and uniform density:

(i) a half-ball of radius $$a$$;

(ii) a cylinder of radius $$a$$ and height $$a$$;

(iii) a cylinder of radius $$a$$ and height $$2a$$.

For each object, consider the gravitational acceleration at the center of its flat circular face. Let $$g_\\text{ball}$$, $$g_a$$, and $$g_{2a}$$ denote these accelerations for the half-ball, the cylinder of height $$a$$, and the cylinder of height $$2a$$, respectively. Which of the following is correct?`,
    choices: {
      A: '$$g_a > g_\\text{ball} > g_{2a}$$',
      B: '$$g_\\text{ball} > g_{2a} > g_a$$',
      C: '$$g_\\text{ball} > g_a > g_{2a}$$',
      D: '$$g_{2a} > g_\\text{ball} > g_a$$',
      E: '$$g_{2a} > g_a > g_\\text{ball}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'shell theorem', 'symmetry'],
  },
  {
    n: 11, correct: 'D',
    statement: `A circular track of mass $$m$$ lies flat horizontally on a frictionless table and is free to move on it. A bead also of mass $$m$$ can slide without friction on the track. The track is initially at rest, and it is labeled every $$45^\\circ$$ with tick marks. The bead is placed on tick 1 and is given an initial velocity $$\\vec{v}_0$$ tangential to the track as shown below. (See figure.)

What is the speed of the track's center O when the bead reaches tick 3?`,
    choices: {
      A: '$$v_0$$',
      B: '$$\\dfrac{v_0}{2}$$',
      C: '$$\\dfrac{\\sqrt{3}\\,v_0}{2}$$',
      D: '$$\\dfrac{v_0}{\\sqrt{2}}$$',
      E: '$$\\dfrac{v_0}{2\\sqrt{2}}$$',
    },
    figures: [P26(11)], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation', 'circular motion', 'constraint kinematics'],
  },
  {
    n: 12, correct: 'B',
    statement: `A wake surfer of total mass $$M$$ (surfer plus board) is being towed at a constant horizontal velocity $$v$$ across a flat lake. The wakeboard has a specific geometry such that, at this speed, it is partially submerged and provides a static buoyant force $$F_B$$ (where $$F_B < Mg$$).

To support the remainder of the weight, the board moves with an angle of attack $$\\theta$$ relative to the horizontal water surface. Assume that the water exerts a reaction force strictly normal to the bottom surface of the board. Which of the following expressions represents the horizontal tension $$T$$ in the tow rope required to maintain this constant velocity?`,
    choices: {
      A: '$$T = Mg\\tan\\theta$$',
      B: '$$T = (Mg - F_B)\\tan\\theta$$',
      C: '$$T = (Mg - F_B)\\sin\\theta$$',
      D: '$$T = Mg\\sin\\theta$$',
      E: '$$T = F_B\\cos\\theta$$',
    },
    figures: [], topics: ['Mechanics'], tags: ["newton's laws", 'statics/equilibrium', 'free-body diagrams', 'fluid statics', 'buoyancy'],
  },
  {
    n: 13, correct: 'C',
    statement: `A block of mass $$m$$ slides along a surface with a coefficient of kinetic friction $$\\mu_k$$. The block is confined to move between two walls separated by a distance $$L$$. Attached to each wall is an ideal, perfectly elastic spring with a very large force constant $$k$$.

The block is launched from the midpoint between the walls with an initial speed $$v_0$$ directed toward one of the springs. It bounces back and forth between the springs, losing speed only due to friction with the surface.

Assume the time spent in contact with the springs is negligible compared to the travel time between them. Which of the following expressions correctly gives the total time $$T$$ required for the block to come to a permanent rest?`,
    choices: {
      A: '$$T = \\dfrac{v_0}{2\\mu_k g L}$$',
      B: '$$T = \\dfrac{v_0}{\\mu_k g}\\!\\left(1 - e^{-\\mu_k g / v_0}\\right)$$',
      C: '$$T = \\dfrac{v_0}{\\mu_k g}$$',
      D: '$$T = \\dfrac{v_0}{\\mu_k g L}\\sum_{n=0}^{\\infty}\\!\\left(\\dfrac{1}{2}\\right)^n$$',
      E: '$$T = \\sqrt{\\dfrac{2L}{\\mu_k g}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', '1d kinematics', 'springs', 'energy conservation'],
  },
  {
    n: 14, correct: 'B',
    statement: `In the following swing, all lines are rigid rods and their lengths satisfy the relation $$l_1^2 + l_2^2 = a^2 + b^2$$. What is the period of small oscillation of the mass at point C? (See figure.)`,
    choices: {
      A: '$$2\\pi\\sqrt{\\dfrac{l_1^2 + l_2^2}{ga}}$$',
      B: '$$2\\pi\\sqrt{\\dfrac{l_1 l_2}{ga}}$$',
      C: '$$2\\pi\\sqrt{\\dfrac{l_1 l_2}{g\\sqrt{a^2+b^2}}}$$',
      D: '$$2\\pi\\sqrt{\\dfrac{a\\,l_1 l_2}{g(l_1^2+l_2^2)}}$$',
      E: '$$2\\pi\\sqrt{\\dfrac{b\\,l_1 l_2}{g(l_1^2+l_2^2)}}$$',
    },
    figures: [P26(14)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'constraint kinematics'],
  },
  {
    n: 15, correct: 'B',
    statement: `A ball launcher fires balls along the floor at some initial speed, applying no rotation to them. The balls initially slip along the floor, then start rolling without slipping. Ignore the potential deformation of the ball and flooring during this process, as well as air resistance. How does the final speed of the rolling ball depend on the coefficient of friction $$\\mu$$ between the ball and the floor?`,
    choices: {
      A: 'The final speed is larger when $$\\mu$$ is large.',
      B: 'The final speed is the same regardless of $$\\mu$$.',
      C: 'The final speed is larger when $$\\mu$$ is small.',
      D: 'The final speed is larger when $$\\mu$$ is small for high launch speeds, and when $$\\mu$$ is large for low launch speeds.',
      E: 'The final speed is larger when $$\\mu$$ is large for high launch speeds, and when $$\\mu$$ is small for low launch speeds.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'angular momentum'],
  },
  {
    n: 16, correct: 'E',
    statement: `A small puck of mass $$m$$ slides without friction inside a rigid, uniform triangle rack of mass $$5m$$, whose inner boundary is an equilateral triangle ABC. The rack is initially at rest and can move freely on a frictionless horizontal table. All collisions between the puck and the rack are perfectly elastic.

At some instant, the puck strikes the midpoint of side AB from inside the rack. Just before this collision, the puck's velocity is parallel to side BC.

After the collision at the midpoint of AB, the puck collides with the rack again, and then collides once more. At which part of the triangle does this second collision after the initial one occur?

(Some answer choices refer to the midpoint D of side AC.) (See figure.)`,
    choices: {
      A: 'a point in the interior of segment AB',
      B: 'a point in the interior of segment BC',
      C: 'a point in the interior of segment AD',
      D: 'a point in the interior of segment DC',
      E: 'the point D',
    },
    figures: [P26(16)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'symmetry', 'reference frames'],
  },
  {
    n: 17, correct: 'D',
    statement: `A ladder is leaning against a vertical wall. The ladder is a uniform rod of mass $$M$$ and length $$L$$, and both the wall and the ground are frictionless. The ladder is released from rest from an almost-vertical position and begins to slide. What is the speed of the point of the ladder that is in contact with the floor when it is a horizontal distance $$\\dfrac{\\sqrt{3}\\,L}{2}$$ away from the wall?

__Note: the official solutions award full credit for both D and E.__`,
    choices: {
      A: '$$0.46\\sqrt{gL}$$',
      B: '$$0.51\\sqrt{gL}$$',
      C: '$$0.56\\sqrt{gL}$$',
      D: '$$0.61\\sqrt{gL}$$',
      E: '$$0.66\\sqrt{gL}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational dynamics', 'rigid body kinematics', 'energy conservation', 'constraint kinematics'],
  },
  {
    n: 18, correct: 'B',
    statement: `Three springs and a block of mass $$m$$ are connected as shown in the figure below. The spring constants are $$k_1 = k$$, $$k_2 = k/5$$, and $$k_3 = k/3$$. All pulleys and ropes are massless, and there is no friction anywhere in the system. Find the ratio of the period of oscillations of this system, $$T$$, to the period $$T_0$$ of a simple mass–spring system with mass $$m$$ and spring constant $$k$$. (See figure.)

The value of $$T/T_0$$ is:`,
    choices: {
      A: '$$\\dfrac{2}{3}$$',
      B: '$$\\dfrac{3}{2}$$',
      C: '$$\\dfrac{\\sqrt{2}}{\\sqrt{3}}$$',
      D: '$$\\sqrt{\\dfrac{7}{6}}$$',
      E: '$$\\sqrt{\\dfrac{6}{7}}$$',
    },
    figures: [P26(18)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'pulleys/tension', 'constraint kinematics'],
  },
  {
    n: 19, correct: 'A',
    statement: `A point mass $$m_1$$ is attached to a box of mass $$m_2$$ by a massless, inextensible rope of fixed length $$L$$, attached to the center of the box. The box can slide without friction on a horizontal surface. The mass $$m_1$$ swings freely under gravity, and all motion occurs in the plane of the picture. Neglect air resistance. (See figure.)

Find the angular frequency $$\\omega$$ of small oscillations about the stable equilibrium.`,
    choices: {
      A: '$$\\omega = \\sqrt{\\dfrac{m_1 + m_2}{m_2}\\,\\dfrac{g}{L}}$$',
      B: '$$\\omega = \\sqrt{\\dfrac{m_1 + m_2}{m_1}\\,\\dfrac{g}{L}}$$',
      C: '$$\\omega = \\sqrt{\\dfrac{m_1}{m_1 + m_2}\\,\\dfrac{g}{L}}$$',
      D: '$$\\omega = \\sqrt{\\dfrac{m_2}{m_1 + m_2}\\,\\dfrac{g}{L}}$$',
      E: '$$\\omega = \\sqrt{\\dfrac{g}{L}}$$',
    },
    figures: [P26(19)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'momentum conservation', 'reduced mass'],
  },
  {
    n: 20, correct: 'D',
    statement: `Two uniform rigid rods lie in a vertical plane. The lower rod rests on a rough horizontal table at a single point O and makes angle $$\\theta \\neq 0$$ with the vertical. The rod can pivot about point O without slipping. The second rod is rigidly attached at its center of mass to the top of the lower rod at point P. A motor causes the second rod to rotate in the plane about P. The motor is rigidly attached to the lower rod and does not exert forces or torques on the table. (See figure.)

Which of the following types of motion of the second rod could keep the angle $$\\theta$$ fixed in time?`,
    choices: {
      A: 'The second rod rotates with constant angular velocity.',
      B: 'The second rod rotates with angular velocity that varies periodically in time.',
      C: 'The system cannot remain at constant $$\\theta$$ because only internal torques are produced by the motor.',
      D: 'The second rod rotates with angular velocity that increases linearly in time.',
      E: '$$\\theta$$ changes because the moment of inertia of the second rod about point O varies during the motion.',
    },
    figures: [P26(20)], topics: ['Mechanics'], tags: ['rotational dynamics', 'torque', 'angular momentum', 'statics/equilibrium'],
  },
  {
    n: 21, correct: 'C',
    statement: `A student stands on a large horizontal merry-go-round ($$R = 2.0$$ m) at an initial radius of $$r_0 = 1.0$$ m. Both rotate at constant angular speed $$\\omega = 1.2$$ rad/s. The student wants to get off without walking and performs a sequence of identical vertical jumps of height $$h = 0.31$$ m. Ignore air resistance.

What is the minimum number of jumps needed for the student to land off the platform? You may assume that the merry-go-round is much more massive than the student and that friction instantly brings the student back into co-rotation with the platform.`,
    choices: {
      A: '3',
      B: '4',
      C: '5',
      D: '6',
      E: 'It is impossible to move outward by purely vertical jumps.',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'projectile motion', 'kinematics-2d'],
  },
  {
    n: 22, correct: 'A',
    statement: `A tricycle of mass $$m = 100$$ kg is traveling north on a horizontal surface. The geometry of the tricycle is defined as follows:

• Wheelbase (distance from front axle to rear axle): $$L = 1.0$$ m

• Rear track width (distance between rear wheels): $$d = 1.0$$ m

• Center of mass (CM) location: on the longitudinal symmetry axis, a distance $$b = 0.4$$ m forward of the rear axle

• Radius of gyration about the CM: $$k = 0.5$$ m (defined by $$I_{CM} = mk^2$$)

Seeing a patch of ice on their right side ahead, the rider panics and slams on the brakes. The front wheel and the left rear wheel slide on dry pavement with a coefficient of kinetic friction $$\\mu_k = 0.5$$, while the right rear wheel slides on frictionless ice ($$\\mu = 0$$).

This asymmetry in friction forces produces a net torque about the center of mass, causing the tricycle to begin rotating. Calculate the initial angular acceleration $$\\alpha$$ of the tricycle.`,
    choices: {
      A: '$$3.0 \\text{ rad/s}^2$$, Counter-Clockwise',
      B: '$$3.0 \\text{ rad/s}^2$$, Clockwise',
      C: '$$3.3 \\text{ rad/s}^2$$, Counter-Clockwise',
      D: '$$6.0 \\text{ rad/s}^2$$, Counter-Clockwise',
      E: '$$3.3 \\text{ rad/s}^2$$, Clockwise',
    },
    figures: [], topics: ['Mechanics'], tags: ['torque', 'rotational dynamics', 'friction', 'free-body diagrams'],
  },
  {
    n: 23, correct: 'C',
    statement: `Consider the infinitely repeating hexagonal sequence where the largest hexagon has side length $$\\sqrt{3}\\,a$$ and is filled with mass. Inside it, a smaller hexagon of side length $$a$$ is rotated $$30^\\circ$$ clockwise and cut out. Then, an even smaller hexagon of side length $$a/\\sqrt{3}$$ is rotated again by $$30^\\circ$$ clockwise and filled. This pattern continues infinitely. (See figure.)

Let $$I_1$$ be the moment of inertia of this 2D figure about an axis through its center of mass, perpendicular to its plane, and $$I_2$$ be the moment of inertia of a regular hexagon with side length $$\\sqrt{3}\\,a$$. What is $$I_1/I_2$$?

$$\\left(\\sum_{n=0}^{\\infty} r^n = \\dfrac{1}{1-r}\\text{ for }|r|<1\\right)$$`,
    choices: {
      A: '$$\\dfrac{1}{4}$$',
      B: '$$\\dfrac{2\\sqrt{3}+3}{9\\sqrt{3}+9}$$',
      C: '$$\\dfrac{9}{10}$$',
      D: '$$\\dfrac{3\\sqrt{3}+6}{9\\sqrt{3}+6}$$',
      E: 'none of the listed',
    },
    figures: [P26(23)], topics: ['Mechanics'], tags: ['moment of inertia', 'series/geometric sums', 'symmetry'],
  },
  {
    n: 24, correct: 'C',
    statement: `A thin sheet of air with density $$\\rho$$ is blown at a uniform speed $$v$$ toward a smooth, convex cylindrical surface of radius $$R$$. The sheet has uniform thickness $$t \\ll R$$ and remains everywhere tangent to the cylinder while it stays attached. Neglect gravity and viscosity.

The pressure on the outer side of the air sheet is constant and equal to $$P$$. The pressure on the side adjacent to the cylinder is lower by an amount $$\\Delta P$$. The air sheet follows the curvature of the cylinder until it can no longer remain attached. (See figure.)

Given: $$\\rho = 1.2$$ kg/m³, $$t = 5.0$$ mm, $$R = 5.0$$ cm, $$\\Delta P_\\text{max} = 120$$ Pa. What is the maximum integer speed $$v_\\text{max}$$ for which the sheet can remain attached to the surface?`,
    choices: { A: '8 m/s', B: '22 m/s', C: '31 m/s', D: '44 m/s', E: '60 m/s' },
    figures: [P26(24)], topics: ['Mechanics'], tags: ['fluid dynamics', 'circular motion', 'pressure'],
  },
  {
    n: 25, correct: 'A',
    statement: `The five vases below are filled with water to the same initial volume and initial height $$H$$. Each vase has an identical drainage hole at the bottom. (See figure for the five vase shapes.)

Which vase will drain completely in the shortest amount of time?`,
    choices: {
      A: 'Vase a',
      B: 'Vase b',
      C: 'Vase c',
      D: 'Vase d',
      E: 'All vases drain in the same amount of time.',
    },
    figures: [P26(25)], topics: ['Mechanics'], tags: ['fluid dynamics', 'fluid statics', "bernoulli's principle", 'scaling'],
  },
]
