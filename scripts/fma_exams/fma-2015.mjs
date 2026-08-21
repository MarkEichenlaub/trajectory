// Digitized 2015 F=ma exam questions. Sources:
// Exam: work/fma/fma-2015.pdf (text extracted to work/fma/fma-2015.txt)
// Solutions: work/fma/fma-2015-sol.pdf (←CORRECT markers and worked solutions)
// Cross-check: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2015.1. through 2015.25.
// Figures: work/figure_manifest.json, key "fma-2015" — already cropped and uploaded.
//
// Answer key: D A B A E A A B A E C E D C D E E D A B B C B A A
// All 25 answers confirmed consistent between ←CORRECT markers and book solutions.
// No missing markers. No source disagreements.
//
// Q4 note: question shows five acceleration-vs-force graphs; the stem figure
// (q04) shows those graphs. Choice labels A–E correspond to the five graph shapes.
// Q13 note: five small vector-diagram options are drawn inline; the stem figure
// (q13) shows the pendulum with all five vectors. Choice labels are described
// in text since no per-choice crops exist in the manifest.
// Q23 note: the official solution PDF uses m1 (the falling mass) in the energy
// equation, not the combined mass. The book confirms the same approach. Answer is B.

const F15 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2015/fma-2015-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2015'
export const questions = [
  {
    n: 1, correct: 'D',
    statement: `A 600 meter wide river flows directly south at 4.0 m/s. A small motor boat travels at 5.0 m/s in still water and points in such a direction so that it will travel directly east relative to the land.

The time it takes to cross the river is closest to`,
    choices: {
      A: '67 s',
      B: '120 s',
      C: '150 s',
      D: '200 s',
      E: '600 s',
    },
    figures: [F15(1)], topics: ['Mechanics'], tags: ['kinematics-2d', 'relative motion', 'vectors'],
    solution: `The boat must point somewhat north of east so that the southward river current is cancelled. The velocity of the boat relative to the land is purely eastward with magnitude $$w$$. By the Pythagorean theorem applied to the velocity triangle,

$$w = \\sqrt{u^2 - v^2} = \\sqrt{5.0^2 - 4.0^2} = 3.0 \\text{ m/s,}$$

where $$u = 5.0$$ m/s is the boat's speed in still water and $$v = 4.0$$ m/s is the river speed.

The time to cross the 600 m wide river at 3.0 m/s is

$$t = \\frac{600 \\text{ m}}{3.0 \\text{ m/s}} = 200 \\text{ s.}$$

The answer is D.`,
  },
  {
    n: 2, correct: 'A',
    statement: `A car travels directly north on a straight highway at a constant speed of 80 km/hr for a distance of 25 km. The car then continues directly north at a constant speed of 50 km/hr for a distance of 75 more kilometers. The average speed of the car for the entire journey is closest to`,
    choices: {
      A: '55.2 km/hr',
      B: '57.5 km/hr',
      C: '65 km/hr',
      D: '69.6 km/hr',
      E: '72.5 km/hr',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics'],
    solution: `Average speed is total distance divided by total time.

Time for the first segment: $$t_1 = 25/80 = 0.3125$$ hr.

Time for the second segment: $$t_2 = 75/50 = 1.5$$ hr.

Average speed:

$$v_{\\text{avg}} = \\frac{25 + 75}{0.3125 + 1.5} = \\frac{100}{1.8125} \\approx 55.2 \\text{ km/hr.}$$

The answer is A.`,
  },
  {
    n: 3, correct: 'B',
    statement: `The force of friction on an airplane in level flight is given by $$F_f = kv^2$$, where $$k$$ is some constant, and $$v$$ is the speed of the airplane. When the power output from the engines is $$P_0$$, the plane is able to fly at a speed $$v_0$$. If the power output of the engines is increased by 100% to $$2P_0$$, the airplane will be able to fly at a new speed given by`,
    choices: {
      A: '$$1.12 v_0$$',
      B: '$$1.26 v_0$$',
      C: '$$1.41 v_0$$',
      D: '$$2.82 v_0$$',
      E: '$$8 v_0$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'energy conservation', 'equations of motion'],
    solution: `At the sustained (terminal) speed, the engine force equals the friction force. Since $$P = Fv$$ and $$F = kv^2$$,

$$P = kv^3.$$

Therefore the speed scales as $$v \\propto P^{1/3}$$. When the power doubles,

$$\\frac{v_1}{v_0} = \\left(\\frac{2P_0}{P_0}\\right)^{1/3} = 2^{1/3} \\approx 1.26.$$

The answer is B.`,
  },
  {
    n: 4, correct: 'A',
    statement: `A 2.0 kg box is originally at rest on a horizontal surface where the coefficient of static friction between the box and the surface is $$\\mu_s$$ and the coefficient of the kinetic friction between the box and the surface is $$\\mu_k = 0.90\\mu_s$$. An external horizontal force of magnitude $$P$$ is then applied to the box. Which of the following is a graph of the acceleration of the box $$a$$ versus the external force $$P$$?`,
    choices: {
      A: 'Graph showing $$a = 0$$ for $$P \\leq \\mu_s mg$$, then a jump discontinuity upward to a straight line with slope $$1/m$$ (the line does not pass through the origin).',
      B: 'Graph showing $$a = 0$$ for $$P \\leq \\mu_s mg$$, then a straight line starting at $$a = 0$$ with slope $$1/m$$ (continuous, no jump).',
      C: 'Graph showing a straight line through the origin with slope $$1/m$$ for all $$P > 0$$.',
      D: 'Graph showing $$a$$ increasing nonlinearly from $$P = 0$$.',
      E: 'Graph showing a straight line through the origin followed by a kink.',
    },
    figures: [F15(4)], topics: ['Mechanics'], tags: ['friction', 'free-body diagrams', 'equations of motion'],
    solution: `The box does not move until $$P$$ exceeds the maximum static friction force $$P_s = \\mu_s mg$$. For $$P \\leq \\mu_s mg$$, $$a = 0$$.

Once the box moves, kinetic friction takes over. By Newton's second law,

$$a = \\frac{P - \\mu_k mg}{m} = \\frac{P}{m} - \\mu_k g.$$

This is a linear function of $$P$$ with slope $$1/m$$, but the line does not pass through the origin (it has a negative intercept $$-\\mu_k g$$). At the transition point $$P = \\mu_s mg$$, kinetic friction is slightly less than static friction (since $$\\mu_k = 0.90 \\mu_s$$), so there is an upward jump discontinuity in acceleration.

The correct graph shows $$a = 0$$ up to $$\\mu_s mg$$, then a jump to a positive value, then a straight line. The answer is A.`,
  },
  {
    n: 5, correct: 'E',
    statement: `A 470 gram lead ball is launched at a 60 degree angle above the horizontal with an initial speed of 100 m/s directly toward a target on a vertical cliff wall that is 150 meters away.

Ignoring air friction, by what distance does the lead ball miss the target when it hits the cliff wall?`,
    choices: {
      A: '1.3 m',
      B: '2.2 m',
      C: '5.0 m',
      D: '7.1 m',
      E: '11 m',
    },
    figures: [F15(5)], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d'],
    solution: `The ball is aimed directly at the target at $$60^\\circ$$ above horizontal, so without gravity it would travel straight to the target in time

$$t = \\frac{d}{v_0} = \\frac{150 \\text{ m}}{100 \\text{ m/s}} = 1.5 \\text{ s.}$$

During this time gravity deflects the ball downward by

$$\\delta = \\frac{1}{2}g t^2 = \\frac{1}{2}(10)(1.5)^2 = 11.25 \\text{ m.}$$

This is the miss distance (perpendicular to the original aim direction). The horizontal component of $$\\delta$$ is negligible and the ball hits the cliff wall at essentially 150 m horizontal distance, so the vertical miss at the wall is also approximately 11 m. The closest answer is 11 m. The answer is E.`,
  },
  {
    n: 6, correct: 'A',
    statement: `Three trolley carts are free to move on a one dimensional frictionless horizontal track. Cart A has a mass of 1.9 kg and an initial speed of 1.7 m/s to the right; Cart B has a mass of 1.1 kg and an initial speed of 2.5 m/s to the left; cart C has a mass of 1.3 kg and is originally at rest. Collisions between carts A and B are perfectly elastic; collisions between carts B and C are perfectly inelastic.

What is the velocity of the center of mass of the system of the three carts after the last collision?`,
    choices: {
      A: '0.11 m/s',
      B: '0.16 m/s',
      C: '1.4 m/s',
      D: '2.0 m/s',
      E: '3.23 m/s',
    },
    figures: [F15(6)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'center of mass'],
    solution: `The velocity of the center of mass of a system is unchanged by any internal collisions — this is a direct consequence of conservation of linear momentum, regardless of whether collisions are elastic or inelastic.

The initial center-of-mass velocity (taking rightward as positive, so $$v_B = -2.5$$ m/s) is

$$v_{cm} = \\frac{m_A v_A + m_B v_B + m_C v_C}{m_A + m_B + m_C} = \\frac{(1.9)(1.7) + (1.1)(-2.5) + (1.3)(0)}{1.9 + 1.1 + 1.3}$$

$$= \\frac{3.23 - 2.75}{4.3} = \\frac{0.48}{4.3} \\approx 0.11 \\text{ m/s (rightward).}$$

The answer is A.`,
  },
  {
    n: 7, correct: 'A',
    statement: `Carts A, B, and C are on a long horizontal frictionless track. The masses of the carts are $$m$$, $$3m$$, and $$9m$$. Originally cart B is at rest at the 1.0 meter mark and cart C is at rest at the 2.0 meter mark. Cart A is originally at the zero meter mark moving toward cart B at a speed of $$v_0$$.

Assuming that all collisions are completely inelastic, what is the final speed of cart C?`,
    choices: {
      A: '$$v_0/13$$',
      B: '$$v_0/10$$',
      C: '$$v_0/9$$',
      D: '$$v_0/3$$',
      E: '$$2v_0/5$$',
    },
    figures: [F15(7)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation'],
    solution: `For each completely inelastic collision, use conservation of momentum.

First collision (A hits B): mass $$m$$ at $$v_0$$ hits mass $$3m$$ at rest.

$$m v_0 = (m + 3m) v_1 \\implies v_1 = \\frac{v_0}{4}.$$

Second collision (AB hits C): combined mass $$4m$$ at $$v_1$$ hits mass $$9m$$ at rest.

$$4m \\cdot \\frac{v_0}{4} = (4m + 9m) v_2 \\implies v_2 = \\frac{m v_0}{13m} = \\frac{v_0}{13}.$$

The final speed of cart C (and the merged system) is $$v_0/13$$. The answer is A.`,
  },
  {
    n: 8, correct: 'B',
    statement: `Carts A, B, and C are on a long horizontal frictionless track. The masses of the carts are $$m$$, $$3m$$, and $$9m$$. Originally cart B is at rest at the 1.0 meter mark and cart C is at rest at the 2.0 meter mark. Cart A is originally at the zero meter mark moving toward cart B at a speed of $$v_0$$.

Assuming that all collisions are completely elastic, what is the final speed of cart C?`,
    choices: {
      A: '$$v_0/8$$',
      B: '$$v_0/4$$',
      C: '$$v_0/2$$',
      D: '$$v_0$$',
      E: '$$2v_0$$',
    },
    figures: [F15(7)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
    solution: `For elastic collisions, the standard formulas for a moving object hitting a stationary target give the target's final velocity as

$$v_{2f} = v_0 \\frac{2m_1}{m_1 + m_2}.$$

First collision (A hits B): $$m_1 = m$$, $$m_2 = 3m$$, $$v_0 = v_0$$.

$$v_B = v_0 \\frac{2m}{m + 3m} = \\frac{v_0}{2}.$$

Cart A bounces back and does not interact further (B moves away from A).

Second collision (B hits C): $$m_1 = 3m$$, $$m_2 = 9m$$, initial speed of B is $$v_0/2$$.

$$v_C = \\frac{v_0}{2} \\cdot \\frac{2(3m)}{3m + 9m} = \\frac{v_0}{2} \\cdot \\frac{6m}{12m} = \\frac{v_0}{4}.$$

The final speed of cart C is $$v_0/4$$. The answer is B.`,
  },
  {
    n: 9, correct: 'A',
    statement: `A 0.650 kg ball moving at 5.00 m/s collides with a 0.750 kg ball that is originally at rest. After the collision, the 0.750 kg ball moves off with a speed of 4.00 m/s, and the 0.650 kg ball moves off at a right angle to the final direction of motion of the 0.750 kg ball.

What is the final speed of the 0.650 kg ball?`,
    choices: {
      A: '1.92 m/s',
      B: '2.32 m/s',
      C: '3.00 m/s',
      D: '4.64 m/s',
      E: '5.77 m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'vectors'],
    solution: `Since the two final momenta are perpendicular, the Pythagorean theorem applies to the momentum triangle. The initial momentum magnitude is

$$p_i = (0.650)(5.00) = 3.25 \\text{ kg·m/s.}$$

The final momentum of the 0.750 kg ball is

$$p_2 = (0.750)(4.00) = 3.00 \\text{ kg·m/s.}$$

By the Pythagorean theorem (since $$\\vec{p}_1$$ and $$\\vec{p}_2$$ are perpendicular and their vector sum equals $$\\vec{p}_i$$):

$$p_1^2 + p_2^2 = p_i^2 \\implies p_1 = \\sqrt{3.25^2 - 3.00^2} = \\sqrt{10.5625 - 9.00} = \\sqrt{1.5625} = 1.25 \\text{ kg·m/s.}$$

The final speed of the 0.650 kg ball is

$$v_1 = \\frac{p_1}{m_1} = \\frac{1.25}{0.650} \\approx 1.92 \\text{ m/s.}$$

The answer is A.`,
  },
  {
    n: 10, correct: 'E',
    statement: `A 0.650 kg ball moving at 5.00 m/s collides with a 0.750 kg ball that is originally at rest. After the collision, the 0.750 kg ball moves off with a speed of 4.00 m/s, and the 0.650 kg ball moves off at a right angle to the final direction of motion of the 0.750 kg ball.

Let the change in total kinetic energy in this collision be defined by $$\\Delta K = K_f - K_i$$, where $$K_f$$ is the total final kinetic energy, and $$K_i$$ is the total initial kinetic energy. Which of the following is true?`,
    choices: {
      A: '$$\\Delta K = (K_i + K_f)/2$$',
      B: '$$K_f < \\Delta K < K_i$$',
      C: '$$0 < \\Delta K < K_f$$',
      D: '$$\\Delta K = 0$$',
      E: '$$-K_i < \\Delta K < 0$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'energy conservation'],
    solution: `Computing the kinetic energies using the results from the previous question:

$$K_i = \\frac{1}{2}(0.650)(5.00)^2 = 8.125 \\text{ J,}$$

$$K_f = \\frac{1}{2}(0.650)(1.92)^2 + \\frac{1}{2}(0.750)(4.00)^2 = 1.198 + 6.00 = 7.20 \\text{ J.}$$

So $$\\Delta K = K_f - K_i = 7.20 - 8.125 = -0.93 \\text{ J.}$$

This is negative (energy was lost) and its magnitude is less than $$K_i = 8.125$$ J, so $$-K_i < \\Delta K < 0$$. The answer is E.

More elegantly: the momentum perpendicular to the initial direction must be zero, forcing the final momenta to form a right triangle with the initial momentum as hypotenuse. The masses $$m_1$$ and $$m_2$$ are different, so the kinetic energies of two objects with the same momentum but different masses are different. Specifically, $$\\Delta K = \\frac{1}{2}p_{2f}^2 \\left(\\frac{1}{m_2} - \\frac{1}{m_1}\\right)$$, which is negative since $$m_2 > m_1$$, confirming $$\\Delta K < 0$$. Also $$|\\Delta K| < K_i$$ since momentum is conserved.`,
  },
  {
    n: 11, correct: 'C',
    statement: `A sphere floats in water with 2/3 of the volume of the sphere submerged. The sphere is removed and placed in oil that has 3/4 the density of water. If it floats in the oil, what fraction of the sphere would be submerged in the oil?`,
    choices: {
      A: '1/12',
      B: '1/2',
      C: '8/9',
      D: '17/12',
      E: 'The sphere will not float, it will sink in the oil.',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `The fraction of an object submerged in a fluid equals the ratio of the object's density to the fluid's density (for a floating object).

From the water case: $$\\frac{\\rho_{\\text{sphere}}}{\\rho_w} = \\frac{2}{3}$$, so $$\\rho_{\\text{sphere}} = \\frac{2}{3} \\rho_w$$.

In the oil with $$\\rho_o = \\frac{3}{4} \\rho_w$$, the fraction submerged is

$$f = \\frac{\\rho_{\\text{sphere}}}{\\rho_o} = \\frac{\\frac{2}{3}\\rho_w}{\\frac{3}{4}\\rho_w} = \\frac{2}{3} \\cdot \\frac{4}{3} = \\frac{8}{9}.$$

Since $$8/9 < 1$$, the sphere does float in oil. The answer is C.`,
  },
  {
    n: 12, correct: 'E',
    statement: `A pendulum consists of a small bob of mass $$m$$ attached to a fixed point by a string of length $$L$$. The pendulum bob swings down from rest from an initial angle $$\\theta_{\\max} < 90^\\circ$$.

Which of the following statements about the pendulum bob's acceleration is true?`,
    choices: {
      A: 'The magnitude of the acceleration is constant for the motion.',
      B: 'The magnitude of the acceleration at the lowest point is $$g$$, the acceleration of free fall.',
      C: 'The magnitude of the acceleration is zero at some point of the pendulum\'s swing.',
      D: 'The acceleration is always directed toward the center of the circle.',
      E: 'The acceleration at the bottom of the swing is pointing vertically upward.',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'free-body diagrams', 'equations of motion'],
    solution: `At the bottom of the swing (the lowest point), the bob is moving horizontally and the string is vertical. The centripetal acceleration is directed toward the center of the circle, which is directly upward (toward the pivot). The tangential acceleration at the bottom is zero because gravity has no component along the direction of motion. Therefore the total acceleration at the bottom is purely centripetal — directed vertically upward. The answer is E.

Checking the other options:
A is false: the magnitude varies as the bob moves (it equals $$\\sqrt{a_c^2 + a_t^2}$$ which changes with position).
B is false: at the bottom, $$a_c = v^2/L = 2g(1 - \\cos\\theta_{\\max}) / L \\cdot L / L$$... more precisely, $$a_c = 2g(1 - \\cos\\theta_{\\max})$$, which equals $$g$$ only for a specific $$\\theta_{\\max}$$.
C is false: $$a_c = 0$$ only at the endpoints (where $$v = 0$$), but then $$a_t = g\\sin\\theta \\neq 0$$, so the total magnitude is never zero.
D is false: there is always a tangential component (except at the bottom).`,
  },
  {
    n: 13, correct: 'D',
    statement: `A pendulum consists of a small bob of mass $$m$$ attached to a fixed point by a string of length $$L$$. The pendulum bob swings down from rest from an initial angle $$\\theta_{\\max} < 90^\\circ$$.

Consider the pendulum bob when it is at an angle $$\\theta = \\frac{1}{2}\\theta_{\\max}$$ on the way up (moving toward $$\\theta_{\\max}$$). What is the direction of the acceleration vector?`,
    choices: {
      A: 'The acceleration points upward and to the right, away from the center of the circle and toward $$\\theta_{\\max}$$ (away from equilibrium along the arc).',
      B: 'The acceleration points directly toward the pivot (purely centripetal, along the string).',
      C: 'The acceleration points upward and to the left, toward the center of the circle and away from equilibrium along the arc.',
      D: 'The acceleration points upward and toward the equilibrium position — it has a centripetal component (toward the pivot) and a tangential component directed back toward the bottom (opposing the motion).',
      E: 'The acceleration points downward, in the direction of gravity.',
    },
    figures: [F15(13)], topics: ['Mechanics'], tags: ['circular motion', 'free-body diagrams', 'vectors'],
    solution: `At angle $$\\theta = \\frac{1}{2}\\theta_{\\max}$$ on the way up, there are two components of acceleration:

__Centripetal (radial) component:__ always directed toward the center of rotation (the pivot), i.e., along the string upward and inward. This is nonzero since the bob is moving.

__Tangential component:__ due to the component of gravity along the arc. Gravity pulls the bob downward; the tangential component of gravity points back toward the equilibrium (the bottom), opposing the upward motion of the bob.

The total acceleration vector therefore points toward the pivot and toward the equilibrium — that is, it has a component along the string toward the pivot and a component along the arc toward the bottom. This corresponds to option D. The answer is D.`,
  },
  {
    n: 14, correct: 'C',
    statement: `A 3.0 meter long massless rod is free to rotate horizontally about its center. Two 5.0 kg point objects are originally located at the ends of the rod; they are free to slide on the frictionless rod and are kept from flying off the rod by an inflexible massless rope that connects the two objects. Originally the system is rotating at 4.0 radians per second; assume the system is completely frictionless; and ignore any concerns about instability of the system.

Calculate the original tension in the rope.`,
    choices: {
      A: '60 N',
      B: '106 N',
      C: '120 N',
      D: '240 N',
      E: '480 N',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'tension'],
    solution: `Each mass moves in a circle of radius $$R = L/2 = 1.5$$ m at angular velocity $$\\omega = 4.0$$ rad/s. The centripetal force required for each mass is provided by the tension in the rope:

$$T = m \\omega^2 R = (5.0 \\text{ kg})(4.0 \\text{ rad/s})^2(1.5 \\text{ m}) = 5.0 \\times 16 \\times 1.5 = 120 \\text{ N.}$$

The answer is C.`,
  },
  {
    n: 15, correct: 'D',
    statement: `A 3.0 meter long massless rod is free to rotate horizontally about its center. Two 5.0 kg point objects are originally located at the ends of the rod; they are free to slide on the frictionless rod and are kept from flying off the rod by an inflexible massless rope that connects the two objects. Originally the system is rotating at 4.0 radians per second; assume the system is completely frictionless; and ignore any concerns about instability of the system.

The rope is slowly tightened by a small massless motor attached to one of the objects. It is done in such a way as to pull the two objects closer to the center of the rotating rod. How much work is done by the motor in pulling the two objects from the ends of the rod until they are each 0.5 meters from the center of rotation?`,
    choices: {
      A: '120 J',
      B: '180 J',
      C: '240 J',
      D: '1440 J',
      E: '1620 J',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum conservation', 'energy conservation', 'rotational dynamics'],
    solution: `There are no external torques, so angular momentum $$L = I\\omega$$ is conserved.

Initial moment of inertia: $$I_i = 2mR^2 = 2(5.0)(1.5)^2 = 22.5 \\text{ kg·m}^2$$.

Initial angular momentum: $$L = I_i \\omega_i = 22.5 \\times 4.0 = 90 \\text{ kg·m}^2/\\text{s}$$.

Final moment of inertia: $$I_f = 2mr^2 = 2(5.0)(0.5)^2 = 2.5 \\text{ kg·m}^2$$.

The kinetic energy of a rotating system can be written as $$E_k = \\frac{L^2}{2I}$$. The work done by the motor equals the change in kinetic energy:

$$W = \\frac{L^2}{2I_f} - \\frac{L^2}{2I_i} = \\frac{90^2}{2(2.5)} - \\frac{90^2}{2(22.5)} = \\frac{8100}{5} - \\frac{8100}{45} = 1620 - 180 = 1440 \\text{ J.}$$

The answer is D.`,
  },
  {
    n: 16, correct: 'E',
    statement: `Shown below is a graph of potential energy as a function of position for a 0.50 kg object. The graph shows $$E$$ (in joules) vs $$x$$ (in cm), with $$E$$ ranging from $$-10$$ J to $$20$$ J. The curve has a local maximum at about $$x = 1$$ cm (where $$E \\approx 10$$ J), drops to a local minimum at $$x = 3$$ cm (where $$E \\approx -10$$ J), and rises steeply near $$x = 4$$ to $$5$$ cm.

Which of the following statements is __not__ true in the range $$0 \\text{ cm} < x < 6$$ cm?`,
    choices: {
      A: 'The object could be at equilibrium at either $$x = 1$$ cm or $$x = 3$$ cm.',
      B: 'The minimum possible total energy for this object in the range is $$-10$$ J.',
      C: 'The magnitude of the force on the object at 4 cm is approximately 1000 N.',
      D: 'If the total energy of the particle is 0 J then the object will have a maximum kinetic energy of 10 J.',
      E: 'The magnitude of the acceleration of the object at $$x = 2$$ cm is approximately $$4 \\text{ cm/s}^2$$.',
    },
    figures: [F15(16)], topics: ['Mechanics'], tags: ['energy conservation', 'graph interpretation', 'equations of motion'],
    solution: `Evaluate each statement using $$F = -dE_p/dx$$ and $$a = F/m$$:

__A (true):__ Equilibrium requires $$F = -dE_p/dx = 0$$, i.e., a local extremum of the potential. There are extrema at $$x = 1$$ cm (local max, unstable) and $$x = 3$$ cm (local min, stable).

__B (true):__ The minimum of the potential energy in the range is $$-10$$ J at $$x = 3$$ cm, which is also the minimum possible total energy (when $$K = 0$$).

__C (true):__ At $$x = 4$$ cm the slope of the curve is steep. Estimating from the graph: a change of about 10 J over about 0.01 m (1 cm) gives $$|F| = |dE_p/dx| \\approx 10/0.01 = 1000 \\text{ N}$$.

__D (true):__ If total energy is 0 J and the minimum of the potential is $$-10$$ J (at $$x = 3$$ cm), then $$K_{\\max} = E_{\\text{total}} - E_{p,\\min} = 0 - (-10) = 10$$ J.

__E (false):__ At $$x = 2$$ cm the slope is approximately $$10 \\text{ J} / 0.01 \\text{ m} = 1000 \\text{ N}$$, giving $$a = F/m = 1000/0.50 = 2000 \\text{ m/s}^2 = 2 \\times 10^7 \\text{ cm/s}^2$$, not 4 cm/s$$^2$$.

The statement that is NOT true is E. The answer is E.`,
  },
  {
    n: 17, correct: 'E',
    statement: `A flywheel can rotate in order to store kinetic energy. The flywheel is a uniform disk made of a material with a density $$\\rho$$ and tensile strength $$\\sigma$$ (measured in Pascals), a radius $$r$$, and a thickness $$h$$. The flywheel is rotating at the maximum possible angular velocity so that it does not break. Which of the following expressions correctly gives the maximum kinetic energy per kilogram that can be stored in the flywheel? Assume that $$\\alpha$$ is a dimensionless constant.`,
    choices: {
      A: '$$\\alpha \\sqrt{\\rho \\sigma / r}$$',
      B: '$$\\alpha h \\sqrt{\\rho \\sigma / r}$$',
      C: '$$\\alpha \\sqrt{(h/r)(\\sigma/\\rho)^2}$$',
      D: '$$\\alpha (h/r)(\\sigma/\\rho)$$',
      E: '$$\\alpha \\sigma/\\rho$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'rotational dynamics'],
    solution: `We need the combination of $$\\rho$$, $$\\sigma$$, $$r$$, $$h$$ that has dimensions of energy per mass ($$\\text{J/kg} = \\text{m}^2/\\text{s}^2$$).

In SI units: $$[\\rho] = \\text{kg/m}^3$$, $$[\\sigma] = \\text{Pa} = \\text{kg/(m·s}^2)$$, $$[r] = [h] = \\text{m}$$.

Checking $$\\sigma/\\rho$$:

$$[\\sigma/\\rho] = \\frac{\\text{kg/(m·s}^2)}{\\text{kg/m}^3} = \\frac{\\text{m}^3}{\\text{m·s}^2} = \\frac{\\text{m}^2}{\\text{s}^2}.$$

This has exactly the dimensions of energy per mass. Furthermore, doubling the disk thickness doubles both the stored energy and the mass, leaving energy per mass unchanged — so the expression should be independent of $$h$$. This rules out B and D.

Among the remaining choices, only E ($$\\alpha\\sigma/\\rho$$) has correct dimensions. The answer is E.`,
  },
  {
    n: 18, correct: 'D',
    statement: `Shown below are three graphs of the same data: a linear $$y$$ vs $$x$$ graph (curved), a linear $$\\log(y)$$ vs $$x$$ graph (straight line), and a log-log $$\\log(y)$$ vs $$\\log(x)$$ graph (curved).

Which is the correct functional relationship between the data points? Assume $$a$$ and $$b$$ are constants.`,
    choices: {
      A: '$$y = ax + b$$',
      B: '$$y = ax^2 + b$$',
      C: '$$y = ax^b$$',
      D: '$$y = ae^{bx}$$',
      E: '$$y = a \\log x + b$$',
    },
    figures: [F15(18)], topics: ['Mechanics'], tags: ['data analysis', 'graph interpretation'],
    solution: `The key observation is which graph is a straight line:

- If $$y$$ vs $$x$$ is straight, the relationship is linear (A).
- If $$\\log y$$ vs $$\\log x$$ is straight, the relationship is a power law $$y = ax^b$$ (C).
- If $$\\log y$$ vs $$x$$ is straight, the relationship is exponential.

The problem states the $$\\log(y)$$ vs $$x$$ graph is the straight line. Writing this as

$$\\log y = Bx + \\log a,$$

exponentiating gives $$y = a \\cdot 10^{Bx}$$, which is equivalent to $$y = ae^{bx}$$ (with $$b = B \\ln 10$$). The answer is D.`,
  },
  {
    n: 19, correct: 'A',
    statement: `A U-tube manometer consists of a uniform diameter cylindrical tube that is bent into a U shape. It is originally filled with water that has a density $$\\rho_w$$. The total length of the column of water is $$L$$. Ignore surface tension and viscosity.

The water is displaced slightly so that one side moves up a distance $$x$$ and the other side lowers a distance $$x$$. Find the frequency of oscillation.`,
    choices: {
      A: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{2g}{L}}$$',
      B: '$$2\\pi\\sqrt{\\dfrac{g}{L}}$$',
      C: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{2L}{g}}$$',
      D: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{g}{\\rho_w}}$$',
      E: '$$2\\pi\\sqrt{\\rho_w g L}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid dynamics', 'equations of motion', 'springs'],
    solution: `When the water is displaced by $$x$$ on each side, one column is raised by $$x$$ and the other is lowered by $$x$$, creating a height difference of $$2x$$. The net restoring force is due to this excess column of water of height $$2x$$:

$$F = 2x \\rho_w A g,$$

where $$A$$ is the cross-sectional area. This is like a spring with effective constant $$k = 2\\rho_w A g$$.

The total mass of water oscillating is $$m = \\rho_w A L$$. The angular frequency is

$$\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{2\\rho_w A g}{\\rho_w A L}} = \\sqrt{\\frac{2g}{L}}.$$

Therefore the frequency is

$$f = \\frac{\\omega}{2\\pi} = \\frac{1}{2\\pi}\\sqrt{\\frac{2g}{L}}.$$

The answer is A.`,
  },
  {
    n: 20, correct: 'B',
    statement: `A U-tube manometer consists of a uniform diameter cylindrical tube that is bent into a U shape. It is originally filled with water that has a density $$\\rho_w$$. The total length of the column of water is $$L$$. Ignore surface tension and viscosity.

Oil with a density half that of water is added to one side of the tube until the total length of oil is equal to the total length of water. Determine the equilibrium height difference between the two sides.`,
    choices: {
      A: '$$L$$',
      B: '$$L/2$$',
      C: '$$L/3$$',
      D: '$$3L/4$$',
      E: '$$L/4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid statics', 'fluid dynamics'],
    solution: `Let $$z$$ be the height of water on the side that contains only water, and let $$\\rho_o = \\rho_w/2$$. The oil column (of total length $$L$$) sits on top of water on the other side; let that water height be $$L - z$$.

For pressure equilibrium at the bottom of the U-tube, the pressure from each side must be equal:

$$\\rho_w g z = \\rho_o g L + \\rho_w g (L - z),$$

$$\\rho_w z = \\frac{\\rho_w}{2} L + \\rho_w (L - z),$$

$$z = \\frac{L}{2} + L - z,$$

$$2z = \\frac{3L}{2} \\implies z = \\frac{3L}{4}.$$

The height of the left side (water only) is $$z = 3L/4$$.
The height of the right side (oil plus water) is $$L + (L - z) = L + L/4 = 5L/4$$.

Height difference:

$$\\Delta h = \\frac{5L}{4} - \\frac{3L}{4} = \\frac{L}{2}.$$

The answer is B.`,
  },
  {
    n: 21, correct: 'B',
    statement: `An object launched vertically upward from the ground with a speed of 50 m/s bounces off of the ground on the return trip with a coefficient of restitution given by $$C_R = 0.9$$, meaning that immediately after a bounce the upward speed is 90% of the previous downward speed. The ball continues to bounce like this; what is the total amount of time between when the ball is launched and when it finally comes to a rest? Assume the collision time is zero; the bounce is instantaneous. Treat the problem as ideally classical and ignore any quantum effects that might happen for very small bounces.`,
    choices: {
      A: '71 s',
      B: '100 s',
      C: '141 s',
      D: '1000 s',
      E: '$$\\infty$$ (the ball never comes to a rest)',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion', 'energy conservation'],
    solution: `The time of flight for a ball launched upward at speed $$v$$ is $$t = 2v/g$$. Let $$v_0 = 50$$ m/s be the initial speed. After each bounce, the speed is multiplied by $$C_R = 0.9$$, so the speed after the $$n$$-th bounce is $$v_n = C_R^n v_0$$.

The total time (including the initial flight) is an infinite geometric series:

$$T = \\sum_{n=0}^{\\infty} \\frac{2v_n}{g} = \\frac{2v_0}{g} \\sum_{n=0}^{\\infty} C_R^n = \\frac{2v_0}{g} \\cdot \\frac{1}{1 - C_R}.$$

Substituting $$v_0 = 50$$ m/s, $$g = 10$$ m/s$$^2$$, $$C_R = 0.9$$:

$$T = \\frac{2(50)}{10} \\cdot \\frac{1}{1 - 0.9} = 10 \\times \\frac{1}{0.1} = 100 \\text{ s.}$$

The series converges because $$|C_R| < 1$$, so the ball does come to rest in finite time. The answer is B.`,
  },
  {
    n: 22, correct: 'C',
    statement: `A solid ball is released from rest down inclines of various inclination angles $$\\theta$$ but through a fixed vertical height $$h$$. The coefficient of static and kinetic friction are both equal to $$\\mu$$. Which of the following graphs best represents the total kinetic energy of the ball at the bottom of the incline as a function of the angle of the incline?`,
    choices: {
      A: 'A curve that decreases monotonically from a positive value at $$\\theta = 0$$ to zero at $$\\theta = 90^\\circ$$.',
      B: 'A curve that increases monotonically from zero at $$\\theta = 0$$ to $$mgh$$ at $$\\theta = 90^\\circ$$.',
      C: 'A curve that is constant at $$mgh$$ for small $$\\theta$$, then dips below $$mgh$$ to a minimum for intermediate $$\\theta$$, then returns to $$mgh$$ at $$\\theta = 90^\\circ$$.',
      D: 'A curve showing a jump discontinuity at a critical angle, with the energy lower above the critical angle.',
      E: 'A curve that is constant at $$mgh$$ for all $$\\theta$$.',
    },
    figures: [F15(22)], topics: ['Mechanics'], tags: ['rolling without slipping', 'energy conservation', 'friction'],
    solution: `For angles $$\\theta$$ below a critical angle $$\\theta_c$$ (where $$\\tan \\theta_c = 7\\mu/2$$ for a solid ball), the ball rolls without slipping and static friction does no work. The total kinetic energy equals the full loss in gravitational potential energy: $$E_k = mgh$$.

For $$\\theta > \\theta_c$$, the ball slips and kinetic friction dissipates energy, so $$E_k < mgh$$. As $$\\theta \\to 90^\\circ$$ the ball falls nearly straight down; the normal force (and therefore the friction force) goes to zero, so friction dissipates negligible energy and $$E_k \\to mgh$$ again.

Therefore the graph is flat at $$mgh$$ for small $$\\theta$$, dips below $$mgh$$ for intermediate angles, and recovers to $$mgh$$ at $$\\theta = 90^\\circ$$. Since $$\\mu_k = \\mu_s$$, the transition at $$\\theta_c$$ is smooth (no discontinuity). The answer is C.`,
  },
  {
    n: 23, correct: 'B',
    statement: `A 2.0 kg object falls from rest a distance of 5.0 meters onto a 6.0 kg object that is supported by a vertical massless spring with spring constant $$k = 72$$ N/m. The two objects stick together after the collision, which results in the mass/spring system oscillating. What is the maximum magnitude of the displacement of the 6.0 kg object from its original location before it is struck by the falling object?`,
    choices: {
      A: '0.27 m',
      B: '1.1 m',
      C: '2.5 m',
      D: '2.8 m',
      E: '3.1 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'collisions', 'springs'],
    solution: `Let $$m_1 = 2.0$$ kg (falling), $$m_2 = 6.0$$ kg (on spring), $$y = 5.0$$ m (drop height), $$k = 72$$ N/m.

__Step 1: Speed of $$m_1$$ just before collision.__
$$v = \\sqrt{2gy} = \\sqrt{2(10)(5.0)} = 10 \\text{ m/s.}$$

__Step 2: Speed of combined mass just after collision (perfectly inelastic).__
$$v_f = v \\frac{m_1}{m_1 + m_2} = 10 \\cdot \\frac{2.0}{8.0} = 2.5 \\text{ m/s.}$$

__Step 3: Find the maximum additional compression $$x$$ below $$m_2$$'s original position.__
The spring is already compressed by $$h = m_2 g / k = 60/72 = 0.833$$ m supporting $$m_2$$. Taking downward as positive and measuring $$x$$ as additional compression from $$m_2$$'s initial position, energy conservation gives (the $$m_2 g$$ and spring terms cancel in a convenient way):

$$\\frac{1}{2}(m_1 + m_2)v_f^2 = \\frac{1}{2}kx^2 + m_1 g x,$$

$$\\frac{1}{2}(8.0)(2.5)^2 = \\frac{1}{2}(72)x^2 + (2.0)(10)x,$$

$$25 = 36x^2 + 20x,$$

$$36x^2 + 20x - 25 = 0.$$

Using the quadratic formula: $$x = \\frac{-20 + \\sqrt{400 + 3600}}{72} = \\frac{-20 + \\sqrt{4000}}{72} \\approx \\frac{-20 + 63.2}{72} \\approx \\frac{43.2}{72} \\approx 0.60$$ m going down... but the maximum displacement upward must also be considered.

For the maximum displacement in the other direction (upward from $$m_2$$'s original position, so the spring is less compressed), $$x < 0$$: the quadratic gives $$x \\approx -1.156$$ m, i.e., the object goes about 1.156 m above $$m_2$$'s original position. The closest answer to $$|x| \\approx 1.15$$ m is 1.1 m. The answer is B.`,
  },
  {
    n: 24, correct: 'A',
    statement: `The speed of a transverse wave on a long cylindrical steel string is given by

$$v = \\sqrt{\\frac{T}{M/L}},$$

where $$T$$ is the tension in the string, $$M$$ is the mass, and $$L$$ is the length of the string. Ignore any string stiffness, and assume that it does not stretch when tightened.

Consider two steel strings of the same length, the first with radius $$r_1$$ and a second thicker string with radius $$r_2 = 4r_1$$. Each string is tightened to the maximum possible tension without breaking. What is the ratio $$f_1/f_2$$ of the fundamental frequencies of vibration on the two strings?`,
    choices: {
      A: '$$1$$',
      B: '$$\\sqrt{2}$$',
      C: '$$2$$',
      D: '$$2\\sqrt{2}$$',
      E: '$$4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'waves', 'equations of motion'],
    solution: `The maximum tension before breaking is $$T_{\\max} = \\sigma A$$, where $$\\sigma$$ is the tensile strength and $$A = \\pi r^2$$ is the cross-sectional area.

The linear mass density is $$M/L = \\rho A = \\rho \\pi r^2$$.

The wave speed at maximum tension is

$$v = \\sqrt{\\frac{\\sigma A}{\\rho A}} = \\sqrt{\\frac{\\sigma}{\\rho}},$$

which is independent of the radius. Since both strings are made of the same steel (same $$\\sigma$$ and $$\\rho$$), they have the same wave speed.

The fundamental frequency of a string of length $$L$$ is $$f = v/(2L)$$. Since both strings have the same $$v$$ and the same $$L$$, they have the same fundamental frequency:

$$\\frac{f_1}{f_2} = 1.$$

The answer is A.`,
  },
  {
    n: 25, correct: 'A',
    statement: `Two identical carts A and B each with mass $$m$$ are connected via a spring with spring constant $$k$$. Two additional springs, identical to the first, connect the carts to two fixed points. The carts are free to oscillate under the effect of the springs in one dimensional frictionless motion.

Under suitable initial conditions, the two carts will oscillate in phase according to $$x_A(t) = x_0 \\sin \\omega_1 t = x_B(t)$$, where $$x_A$$ and $$x_B$$ are the locations of carts A and B relative to their respective equilibrium positions. Under other suitable initial conditions, the two carts will oscillate exactly out of phase according to $$x_A(t) = x_0 \\sin \\omega_2 t = -x_B(t)$$.

Determine the ratio $$\\omega_2 / \\omega_1$$.`,
    choices: {
      A: '$$\\sqrt{3}$$',
      B: '$$2$$',
      C: '$$2\\sqrt{2}$$',
      D: '$$3$$',
      E: '$$5$$',
    },
    figures: [F15(25)], topics: ['Mechanics'], tags: ['springs', 'equations of motion'],
    solution: `__In-phase mode:__ When $$x_A = x_B$$, the middle spring is neither stretched nor compressed (both ends move together), so it exerts no net force on either cart. Each cart is acted on only by its own wall spring (spring constant $$k$$). Therefore

$$\\omega_1 = \\sqrt{\\frac{k}{m}}.$$

__Out-of-phase mode:__ When $$x_A = -x_B$$, there is a point of zero displacement at the center of the middle spring. Each cart behaves as if it is connected to: (1) its wall spring (spring constant $$k$$), and (2) half of the middle spring. The half-spring has spring constant $$2k$$ (a spring cut in half doubles its constant). These two springs act in parallel, giving an effective constant $$k + 2k = 3k$$. Therefore

$$\\omega_2 = \\sqrt{\\frac{3k}{m}}.$$

The ratio is

$$\\frac{\\omega_2}{\\omega_1} = \\sqrt{\\frac{3k/m}{k/m}} = \\sqrt{3}.$$

The answer is A.`,
  },
]
