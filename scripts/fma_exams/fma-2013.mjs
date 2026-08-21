// Digitized 2013 F=ma exam questions. Sources:
// Exam: work/fma/fma-2013.pdf (text extracted to work/fma/fma-2013.txt)
// Solutions: work/fma/fma-2013-sol.pdf — full worked solutions (no ←CORRECT markers;
//   answers derived by matching solution's final result to the five choices).
// Cross-check: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2013.1. through 2013.25.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// solutions PDF (derived from final result) and the book solutions.
// Key: E C E E C C D A E B C B A B D D B E B E A D E A D

const F13 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2013/fma-2013-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2013'
export const questions = [
  {
    n: 1, correct: 'E',
    statement: `An observer stands on the side of the front of a stationary train. When the train starts moving with constant acceleration, it takes 5 seconds for the first car to pass the observer. How long will it take for the 10th car to pass?`,
    choices: {
      A: '1.07 s',
      B: '0.98 s',
      C: '0.91 s',
      D: '0.86 s',
      E: '0.81 s',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `Let $$a$$ be the acceleration and $$L$$ the length of one car. Starting from rest, the time $$t_k$$ at which the $$k$$-th car has completely passed the observer satisfies

$$kL = \\frac{1}{2}at_k^2 \\implies t_k = t_1\\sqrt{k}.$$

We are given $$t_1 = 5$$ s. The 10th car passes during the interval $$t_9$$ to $$t_{10}$$:

$$t_{10} - t_9 = t_1(\\sqrt{10} - \\sqrt{9}) = 5(3.162 - 3) = 5 \\times 0.162 = 0.81 \\text{ s.}$$

The answer is E.`,
  },
  {
    n: 2, correct: 'C',
    statement: `Jordi stands 20 m from a wall and Diego stands 10 m from the same wall. Jordi throws a ball at an angle of 30° above the horizontal, and it collides elastically with the wall. How fast does Jordi need to throw the ball so that Diego will catch it? Consider Jordi and Diego to be the same height, and both are on the same perpendicular line from the wall.`,
    choices: {
      A: '11 m/s',
      B: '15 m/s',
      C: '19 m/s',
      D: '30 m/s',
      E: '35 m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d'],
    solution: `Because the collision with the wall is elastic and the wall is vertical, the ball's horizontal velocity component reverses while the vertical component is unchanged — exactly as a mirror reflection. The situation is therefore equivalent to Jordi throwing directly to Diego's mirror image on the other side of the wall, a total distance of $$20 + 10 = 30$$ m.

Using the range formula with $$\\theta = 30^\\circ$$ and $$\\sin 2\\theta = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$$:

$$R = \\frac{v^2 \\sin 2\\theta}{g} \\implies v = \\sqrt{\\frac{gR}{\\sin 2\\theta}} = \\sqrt{\\frac{10 \\times 30}{\\sqrt{3}/2}} \\approx 19 \\text{ m/s.}$$

The answer is C.`,
  },
  {
    n: 3, correct: 'E',
    statement: `Tom throws a football to Wes, who is a distance $$l$$ away. Tom can control the time of flight $$t$$ of the ball by choosing any speed up to $$v_{\\max}$$ and any launch angle between 0° and 90°. Ignore air resistance and assume Tom and Wes are at the same height. Which of the following statements is __incorrect__?

(A) If $$v_{\\max} < \\sqrt{gl}$$, the ball cannot reach Wes at all.

(B) Assuming the ball can reach Wes, as $$v_{\\max}$$ increases with $$l$$ held fixed, the minimum value of $$t$$ decreases.

(C) Assuming the ball can reach Wes, as $$v_{\\max}$$ increases with $$l$$ held fixed, the maximum value of $$t$$ increases.

(D) Assuming the ball can reach Wes, as $$l$$ increases with $$v_{\\max}$$ held fixed, the minimum value of $$t$$ increases.

(E) Assuming the ball can reach Wes, as $$l$$ increases with $$v_{\\max}$$ held fixed, the maximum value of $$t$$ increases.`,
    choices: {
      A: 'Statement (A) is incorrect.',
      B: 'Statement (B) is incorrect.',
      C: 'Statement (C) is incorrect.',
      D: 'Statement (D) is incorrect.',
      E: 'Statement (E) is incorrect.',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d', 'extreme cases'],
    solution: `For a launch angle $$\\theta$$ and speed $$v_0$$, the range and time of flight satisfy

$$l = v_0 \\cos\\theta \\cdot t, \\qquad t = \\frac{2v_0 \\sin\\theta}{g}.$$

Eliminating $$\\theta$$ gives $$\\frac{g^2}{4}t^4 - v_0^2 t^2 + l^2 = 0$$, so

$$t^2 = \\frac{2v_0^2 \\pm \\sqrt{v_0^4 - g^2 l^2}}{g^2}.$$

Statement (A) is correct — the discriminant requires $$v_0 \\geq \\sqrt{gl}$$. Increasing $$v_{\\max}$$ expands the discriminant, moving both $$t_{\\min}$$ down (B correct) and $$t_{\\max}$$ up (C correct). Increasing $$l$$ shrinks the discriminant, moving $$t_{\\min}$$ up (D correct). However, increasing $$l$$ also shrinks $$t_{\\max}$$ — a larger range forces a less steep angle, reducing the time in the air. Statement (E) claims $$t_{\\max}$$ increases with $$l$$, which is incorrect.

The answer is E.`,
  },
  {
    n: 4, correct: 'E',
    statement: `The sign shown below consists of two uniform legs attached by a frictionless hinge. The coefficient of friction between the ground and the legs is $$\\mu$$. Which of the following gives the maximum value of $$\\theta$$ such that the sign will not collapse?`,
    choices: {
      A: '$$\\sin\\theta = 2\\mu$$',
      B: '$$\\sin(\\theta/2) = \\mu/2$$',
      C: '$$\\tan(\\theta/2) = \\mu$$',
      D: '$$\\tan\\theta = 2\\mu$$',
      E: '$$\\tan(\\theta/2) = 2\\mu$$',
    },
    figures: [F13(4)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'friction'],
    solution: `By symmetry, each leg has weight $$W/2$$ and is supported by a normal force $$N = W/2$$ from the ground. The hinge exerts a horizontal force on each leg's top; friction at the base must balance this horizontal force.

Taking torques about the hinge for one leg (half-angle $$\\alpha = \\theta/2$$), with $$L$$ the leg length:

$$\\text{(friction)} \\times L\\cos\\alpha = \\text{(weight)} \\times \\frac{L}{2}\\sin\\alpha$$

$$F_f = \\frac{W}{4}\\tan\\alpha = \\frac{W}{4}\\tan\\frac{\\theta}{2}.$$

The maximum static friction is $$\\mu N = \\mu W/2$$. Setting $$F_f = \\mu N$$:

$$\\frac{W}{4}\\tan\\frac{\\theta}{2} = \\mu \\frac{W}{2} \\implies \\tan\\frac{\\theta}{2} = 2\\mu.$$

The answer is E.`,
  },
  {
    n: 5, correct: 'C',
    statement: `The following information applies to questions 5 and 6.

A student steps onto a stationary elevator and stands on a bathroom scale. The elevator then travels from the top of the building to the bottom. The student records the reading on the scale as a function of time. (The scale reads 80 kg at rest, drops to 60 kg from 2 s to 4 s, stays at 80 kg from 4 s to 22 s, drops to 60 kg from 22 s to 24 s, then returns to 80 kg.)

At what time(s) does the student have maximum downward velocity?`,
    choices: {
      A: 'At all times between 2 s and 4 s',
      B: 'At 4 s only',
      C: 'At all times between 4 s and 22 s',
      D: 'At 22 s only',
      E: 'At all times between 22 s and 24 s',
    },
    figures: [F13(5)], topics: ['Mechanics'], tags: ['1d kinematics', 'newton\'s laws', 'graph interpretation'],
    solution: `The scale reads $$m_{\\text{scale}} = N/g$$, where $$N$$ is the normal force on the student. The student's mass is the resting reading: $$m = 80$$ kg. The downward acceleration is

$$a = g\\left(1 - \\frac{m_{\\text{scale}}}{m}\\right).$$

From 2 s to 4 s, $$m_{\\text{scale}} = 60$$ kg, so $$a = 10(1 - 60/80) = 2.5$$ m/s$$^2$$ downward — the elevator accelerates downward. From 4 s to 22 s, $$m_{\\text{scale}} = 80$$ kg, so $$a = 0$$ — constant speed. The maximum downward velocity is maintained throughout this constant-speed phase.

The answer is C.`,
  },
  {
    n: 6, correct: 'C',
    statement: `The following information applies to questions 5 and 6.

A student steps onto a stationary elevator and stands on a bathroom scale. The elevator then travels from the top of the building to the bottom. The student records the reading on the scale as a function of time. (The scale reads 80 kg at rest, drops to 60 kg from 2 s to 4 s, stays at 80 kg from 4 s to 22 s, drops to 60 kg from 22 s to 24 s, then returns to 80 kg.)

How tall is the building?`,
    choices: {
      A: '50 m',
      B: '80 m',
      C: '100 m',
      D: '150 m',
      E: '400 m',
    },
    figures: [F13(5)], topics: ['Mechanics'], tags: ['1d kinematics', 'graph interpretation'],
    solution: `From Question 5, the elevator accelerates downward at $$a = 2.5$$ m/s$$^2$$ for 2 s, reaching $$v = 5$$ m/s. It then travels at constant 5 m/s from 4 s to 22 s (18 s), then decelerates to rest. The velocity-time graph is a trapezoid with parallel sides 18 s and 22 s and height 5 m/s, giving total displacement

$$x = \\frac{(18 + 22) \\times 5}{2} = 100 \\text{ m.}$$

The answer is C.`,
  },
  {
    n: 7, correct: 'D',
    statement: `A light car and a heavy truck have the same momentum. The truck weighs ten times as much as the car. How do their kinetic energies compare?`,
    choices: {
      A: 'The truck\'s kinetic energy is larger by a factor of 100',
      B: 'The truck\'s kinetic energy is larger by a factor of 10',
      C: 'They have the same kinetic energy',
      D: 'The car\'s kinetic energy is larger by a factor of 10',
      E: 'The car\'s kinetic energy is larger by a factor of 100',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation'],
    solution: `Expressing kinetic energy in terms of momentum: $$K = p^2/(2m)$$. With equal momenta, kinetic energy is inversely proportional to mass. Since the truck is 10 times heavier, the car's kinetic energy is larger by a factor of 10.

The answer is D.`,
  },
  {
    n: 8, correct: 'A',
    statement: `The following information applies to questions 8 and 9.

A truck is initially moving at velocity $$v$$. The driver presses the brake in order to slow the truck to a stop. The brake applies a constant force $$F$$ to the truck. The truck rolls a distance $$x$$ before coming to a stop, and the time it takes to stop is $$t$$.

Which of the following expressions is equal to the initial kinetic energy of the truck (i.e. the kinetic energy before the driver starts braking)?`,
    choices: {
      A: '$$Fx$$',
      B: '$$Fvt$$',
      C: '$$Fxt$$',
      D: '$$Ft$$',
      E: 'Both (A) and (B) are correct',
    },
    figures: [], topics: ['Mechanics'], tags: ['work-energy theorem', 'energy conservation'],
    solution: `The work done by the braking force equals the change in kinetic energy:

$$W = F \\cdot x = \\Delta K = K_i - 0 = K_i.$$

So $$K_i = Fx$$. Checking (B): the truck decelerates uniformly from $$v$$ to 0, so $$x = \\frac{1}{2}vt$$, giving $$Fvt = F \\cdot 2x = 2K_i \\neq K_i$$. So (B) is incorrect and (E) is also incorrect.

The answer is A.`,
  },
  {
    n: 9, correct: 'E',
    statement: `The following information applies to questions 8 and 9.

A truck is initially moving at velocity $$v$$. The driver presses the brake in order to slow the truck to a stop. The brake applies a constant force $$F$$ to the truck. The truck rolls a distance $$x$$ before coming to a stop, and the time it takes to stop is $$t$$.

Which of the following expressions is equal to the initial momentum of the truck (i.e. the momentum before the driver starts braking)?`,
    choices: {
      A: '$$Fx$$',
      B: '$$Ft/2$$',
      C: '$$Fxt$$',
      D: '$$2Ft$$',
      E: '$$2Fx/v$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'impulse', 'work-energy theorem'],
    solution: `The initial kinetic energy is $$K_i = Fx$$ (from Question 8) and also $$K_i = \\frac{1}{2}mv^2 = \\frac{1}{2}p_i v$$. Therefore

$$p_i = \\frac{2K_i}{v} = \\frac{2Fx}{v}.$$

(Note: impulse gives $$p_i = Ft$$, but since $$x = \\frac{1}{2}vt$$, this is equivalent: $$Ft = 2Fx/v$$. However, $$Ft$$ is not a choice; $$2Fx/v$$ is.)

The answer is E.`,
  },
  {
    n: 10, correct: 'B',
    statement: `Which of the following can be used to distinguish a solid ball from a hollow sphere of the same radius and mass?`,
    choices: {
      A: 'Measurements of the orbit of a test mass around the object.',
      B: 'Measurements of the time it takes the object to roll down an inclined plane.',
      C: 'Measurements of the tidal forces applied by the object to a liquid body.',
      D: 'Measurements of the behavior of the object as it floats in water.',
      E: 'Measurements of the force applied to the object by a uniform gravitational field.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'moment of inertia', 'shell theorem'],
    solution: `The solid ball has moment of inertia $$I = \\frac{2}{5}MR^2$$ while the hollow sphere has $$I = \\frac{2}{3}MR^2$$. For an object rolling without slipping, the acceleration down an incline is $$a = g\\sin\\theta/(1 + c)$$ where $$I = cMR^2$$. Since $$c$$ differs, the rolling times differ — this distinguishes them.

(A) and (C) are unhelpful: by the shell theorem, the external gravitational field of any spherically symmetric mass distribution depends only on total mass, so external measurements of gravity (including tidal forces and orbital parameters) cannot distinguish the distributions. (D) is unhelpful: buoyancy depends only on external volume. (E) is unhelpful: in a uniform field, the force equals $$Mg$$ regardless of internal structure.

The answer is B.`,
  },
  {
    n: 11, correct: 'C',
    statement: `A right-triangular wooden block of mass $$M$$ is at rest on a table, as shown in the figure. Two smaller wooden cubes, both with mass $$m$$, initially rest on the two sides of the larger block. As all contact surfaces are frictionless, the smaller cubes start sliding down the larger block while the block remains at rest. What is the normal force from the system to the table?`,
    choices: {
      A: '$$2mg$$',
      B: '$$2mg + Mg$$',
      C: '$$mg + Mg$$',
      D: '$$Mg + mg(\\sin\\alpha + \\sin\\beta)$$',
      E: '$$Mg + mg(\\cos\\alpha + \\cos\\beta)$$',
    },
    figures: [F13(11)], topics: ['Mechanics'], tags: ['newton\'s laws', 'free-body diagrams', 'center of mass'],
    solution: `Let $$\\alpha$$ and $$\\beta$$ be the two acute angles of the right triangle (so $$\\alpha + \\beta = 90^\\circ$$). Each sliding cube has only two forces: gravity $$mg$$ downward and the normal force from its face. The normal force on the cube at angle $$\\alpha$$ has magnitude $$mg\\cos\\alpha$$, directed perpendicular to that face, so its vertical component transmitted to the ground is $$mg\\cos^2\\alpha$$. Similarly the other cube contributes $$mg\\cos^2\\beta$$.

Since $$\\alpha + \\beta = 90^\\circ$$:

$$\\cos^2\\alpha + \\cos^2\\beta = \\cos^2\\alpha + \\sin^2\\alpha = 1.$$

Adding the block's weight: $$N = mg\\cos^2\\alpha + mg\\cos^2\\beta + Mg = mg + Mg.$$

The answer is C.`,
  },
  {
    n: 12, correct: 'B',
    statement: `A spherical shell of mass $$M$$ and radius $$R$$ is completely filled with a frictionless fluid, also of mass $$M$$. It is released from rest, and then it rolls without slipping down an incline that makes an angle $$\\theta$$ with the horizontal. What will be the acceleration of the shell down the incline just after it is released? Assume the acceleration of free fall is $$g$$. The moment of inertia of a thin shell of radius $$r$$ and mass $$m$$ about the center of mass is $$I = \\frac{2}{3}mr^2$$; the moment of inertia of a solid sphere of radius $$r$$ and mass $$m$$ about the center of mass is $$I = \\frac{2}{5}mr^2$$.`,
    choices: {
      A: '$$a = g\\sin\\theta$$',
      B: '$$a = \\dfrac{3}{4}g\\sin\\theta$$',
      C: '$$a = \\dfrac{1}{2}g\\sin\\theta$$',
      D: '$$a = \\dfrac{3}{8}g\\sin\\theta$$',
      E: '$$a = \\dfrac{3}{5}g\\sin\\theta$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'rotational dynamics', 'moment of inertia'],
    solution: `Since the fluid is frictionless, it does not rotate with the shell — it only translates. The fluid therefore contributes $$MR^2$$ to the moment of inertia about the contact point (parallel-axis theorem, point mass). The shell contributes $$\\frac{2}{3}MR^2 + MR^2 = \\frac{5}{3}MR^2$$. Together:

$$I_{\\text{contact}} = \\frac{2}{3}MR^2 + MR^2 + MR^2 = \\frac{8}{3}MR^2.$$

The torque about the contact point is $$\\tau = 2MgR\\sin\\theta$$ (total weight times lever arm). Then

$$\\alpha = \\frac{\\tau}{I} = \\frac{2MgR\\sin\\theta}{\\frac{8}{3}MR^2} = \\frac{3g\\sin\\theta}{4R}, \\quad a = R\\alpha = \\frac{3}{4}g\\sin\\theta.$$

The answer is B.`,
  },
  {
    n: 13, correct: 'A',
    statement: `There is a ring outside of Saturn. In order to distinguish if the ring is actually a part of Saturn or is instead part of the satellites of Saturn, we need to know the relation between the velocity $$v$$ of each layer in the ring and the distance $$R$$ of the layer to the center of Saturn. Which of the following statements is correct?`,
    choices: {
      A: 'If $$v \\propto R$$, then the layer is part of Saturn.',
      B: 'If $$v^2 \\propto R$$, then the layer is part of the satellites of Saturn.',
      C: 'If $$v \\propto 1/R$$, then the layer is part of Saturn.',
      D: 'If $$v^2 \\propto 1/R$$, then the layer is part of Saturn.',
      E: 'If $$v \\propto R^2$$, then the layer is part of the satellites of Saturn.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational motion', 'orbital mechanics', 'kepler\'s laws'],
    solution: `If the ring is part of Saturn (rigid body rotation), every part shares the same angular velocity $$\\omega$$, so $$v = R\\omega \\propto R$$.

If the ring consists of independent satellites in orbit, gravity provides centripetal force:

$$\\frac{mv^2}{R} = \\frac{GMm}{R^2} \\implies v^2 = \\frac{GM}{R} \\propto \\frac{1}{R}.$$

Statement (A) correctly identifies $$v \\propto R$$ as rigid-body rotation, i.e. part of Saturn. Statement (D) correctly describes satellites but identifies it as Saturn — that's wrong. Only (A) is correct.

The answer is A.`,
  },
  {
    n: 14, correct: 'B',
    statement: `A cart of mass $$m$$ moving at 12 m/s to the right collides elastically with a cart of mass 4.0 kg that is originally at rest. After the collision, the cart of mass $$m$$ moves to the left with a velocity of 6.0 m/s. Assuming an elastic collision in one dimension only, what is the velocity of the center of mass $$v_{\\rm cm}$$ of the two carts before the collision?`,
    choices: {
      A: '$$v_{\\rm cm} = 2.0$$ m/s',
      B: '$$v_{\\rm cm} = 3.0$$ m/s',
      C: '$$v_{\\rm cm} = 6.0$$ m/s',
      D: '$$v_{\\rm cm} = 9.0$$ m/s',
      E: '$$v_{\\rm cm} = 18$$ m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'reference frames', 'momentum conservation'],
    solution: `In an elastic collision, velocities in the center-of-mass frame simply reverse. The velocity of cart $$m$$ changes from $$+12$$ m/s to $$-6$$ m/s, a change of $$-18$$ m/s. In the CM frame the reversal means the initial velocity was $$+9$$ m/s and final velocity $$-9$$ m/s. Since the lab-frame initial velocity is 12 m/s and the CM-frame initial velocity is 9 m/s, the CM frame moves at $$12 - 9 = 3.0$$ m/s to the right.

Therefore $$v_{\\rm cm} = 3.0$$ m/s, and the answer is B.`,
  },
  {
    n: 15, correct: 'D',
    statement: `A uniform rod is partially in water with one end suspended, as shown in the figure. The density of the rod is 5/9 that of water. At equilibrium, what portion of the rod is above water?`,
    choices: {
      A: '0.25',
      B: '0.33',
      C: '0.5',
      D: '0.67',
      E: '0.75',
    },
    figures: [F13(15)], topics: ['Mechanics'], tags: ['buoyancy', 'statics/equilibrium', 'torque'],
    solution: `Let $$\\ell/L$$ be the fraction of the rod above water. Taking torques about the pivot (the suspended end), gravity acts at the rod's midpoint (torque arm $$L/2$$) and buoyancy acts at the midpoint of the submerged portion (torque arm $$L - (L - \\ell)/2 = (L + \\ell)/2$$ from the pivot... using the pivot at top):

Actually let $$\\alpha = \\ell/L$$ be the fraction above water. Then the fraction submerged is $$1 - \\alpha$$. Balancing torques about the pivot:

$$\\rho_r V g \\cdot \\frac{L}{2} = \\rho_w (1-\\alpha) V g \\cdot \\left(\\alpha + \\frac{1-\\alpha}{2}\\right) L$$

$$\\frac{\\rho_r}{\\rho_w} = (1-\\alpha)\\left(\\alpha + \\frac{1-\\alpha}{2}\\right) \\cdot 2 = (1-\\alpha^2)$$

With $$\\rho_r/\\rho_w = 5/9$$:

$$1 - \\alpha^2 = \\frac{5}{9} \\implies \\alpha^2 = \\frac{4}{9} \\implies \\alpha = \\frac{2}{3} \\approx 0.67.$$

The answer is D.`,
  },
  {
    n: 16, correct: 'D',
    statement: `A very large number of small particles forms a spherical cloud. Initially they are at rest, have uniform mass density per unit volume $$\\rho_0$$, and occupy a region of radius $$r_0$$. The cloud collapses due to gravitation; the particles do not interact with each other in any other way.

How much time passes until the cloud collapses fully? (The constant 0.5427 is actually $$\\sqrt{3\\pi/32}$$.)`,
    choices: {
      A: '$$\\dfrac{0.5427\\, r_0^2}{\\sqrt{G\\rho_0}}$$',
      B: '$$\\dfrac{0.5427\\, r_0}{\\sqrt{G\\rho_0}}$$',
      C: '$$\\dfrac{0.5427\\, \\sqrt{r_0}}{\\sqrt{G\\rho_0}}$$',
      D: '$$\\dfrac{0.5427}{\\sqrt{G\\rho_0}}$$',
      E: '$$\\dfrac{0.5427}{\\sqrt{G\\rho_0}\\, r_0}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'gravitation'],
    solution: `All choices have the form $$t = 0.5427\\, G^{-1/2}\\rho_0^{-1/2}\\, r_0^n$$. We need $$[t] = \\text{s}$$.

$$[G] = \\frac{\\text{m}^3}{\\text{kg}\\cdot\\text{s}^2}, \\quad [\\rho_0] = \\frac{\\text{kg}}{\\text{m}^3}, \\quad [r_0] = \\text{m.}$$

$$[G^{-1/2}\\rho_0^{-1/2}] = \\left(\\frac{\\text{m}^3}{\\text{kg}\\cdot\\text{s}^2} \\cdot \\frac{\\text{kg}}{\\text{m}^3}\\right)^{-1/2} = \\left(\\frac{1}{\\text{s}^2}\\right)^{-1/2} = \\text{s.}$$

Since $$G^{-1/2}\\rho_0^{-1/2}$$ already has dimensions of time, the collapse time is independent of $$r_0$$ — so $$n = 0$$.

The answer is D.`,
  },
  {
    n: 17, correct: 'B',
    statement: `Two small, equal masses are attached by a lightweight rod. This object orbits a planet; the length of the rod is smaller than the radius of the orbit, but not negligible. The rod rotates about its axis in such a way that it remains vertical with respect to the planet.

- Is there a force in the rod? If so, is it tension or compression?
- Is the equilibrium stable, unstable, or neutral with respect to a small perturbation in the angle of the rod? (Assume this perturbation maintains the rate of rotation, so that in the co-rotating frame the rod is still stationary but at an angle to the vertical.)`,
    choices: {
      A: 'There is no force in the rod; the equilibrium is neutral.',
      B: 'The rod is in tension; the equilibrium is stable.',
      C: 'The rod is in compression; the equilibrium is stable.',
      D: 'The rod is in tension; the equilibrium is unstable.',
      E: 'The rod is in compression; the equilibrium is unstable.',
    },
    figures: [F13(17)], topics: ['Mechanics'], tags: ['orbital mechanics', 'non-inertial frames', 'statics/equilibrium'],
    solution: `In the co-rotating frame, each mass experiences gravity (inward, proportional to $$1/r^2$$) and centrifugal force (outward, proportional to $$r$$). The outer mass needs more centripetal force than gravity alone provides (since it is farther out), so the rod must pull it inward — tension. Similarly the inner mass needs less centripetal force than gravity provides, so the rod pulls it outward — also consistent with tension.

For stability: when the rod is tilted slightly, the tidal gradient (stronger gravity closer to the planet, and the centrifugal force gradient) creates a net torque that restores the rod to the vertical orientation. This is the gravity-gradient stabilization mechanism used by real satellites. The equilibrium is stable.

The answer is B.`,
  },
  {
    n: 18, correct: 'E',
    statement: `Two point particles, each of mass 1 kg, begin in the state shown below: one at $$(1, 1)$$ m moving in the $$-x$$ direction at 1.0 m/s, the other at $$(1, -1)$$ m moving in the $$+x$$ direction at 1.0 m/s.

The system evolves through internal forces only. Which of the following could be the state after some time has passed? (All speeds shown are 1.0 m/s except where noted.)`,
    choices: {
      A: 'A particle at $$(-1, 0)$$ m moving in $$-y$$, and one at $$(1, 0)$$ m moving in $$+y$$.',
      B: 'A particle at $$(1, 1)$$ m moving in $$-x$$ at 2.0 m/s, and one at rest at $$(1, -1)$$ m.',
      C: 'A particle at $$(2, 0)$$ m moving up and to the left, and one at $$(0, 0)$$ m moving down and to the right.',
      D: 'A particle at $$(0, 2)$$ m moving in $$-x$$, and one at $$(2, -2)$$ m moving in $$+x$$.',
      E: 'A particle at $$(2, 1)$$ m moving in $$+y$$, and one at $$(0, -1)$$ m moving in $$-y$$.',
    },
    figures: [F13(18)], topics: ['Mechanics'], tags: ['momentum conservation', 'angular momentum conservation', 'center of mass'],
    solution: `Internal forces can rearrange the system however they like, but they cannot change the total momentum, the position of the centre of mass, or the total angular momentum. Compute all three for the initial state and use them as filters.

__Momentum.__ The two velocities are equal and opposite, so the total momentum is zero. That immediately kills __(B)__, whose single moving particle carries momentum $$(-2, 0)$$ kg m/s.

__Centre of mass.__ Zero total momentum means the centre of mass never moves. It starts at $$\\frac{(1,1)+(1,-1)}{2} = (1, 0)$$. State __(A)__ has its particles at $$(-1,0)$$ and $$(1,0)$$, a centre of mass of $$(0,0)$$ — the centre of mass would have had to drift, so (A) is out.

__Angular momentum.__ With zero linear momentum the angular momentum is the same about every point, so take the origin and use $$L = \\sum m\\,(x v_y - y v_x)$$. Initially

$$L = (1)(0) - (1)(-1) \\;+\\; (1)(0) - (-1)(1) = 2 \\text{ kg m}^2\\text{/s}$$

counterclockwise. Now test the survivors. In __(C)__ the particles sit at $$(0,0)$$ and $$(2,0)$$ moving along the diagonals, giving $$L = \\sqrt{2}$$. In __(D)__ they sit at $$(0,2)$$ and $$(2,-2)$$, giving $$L = 2 + 2 = 4$$. Neither is 2, so both are out.

That leaves __(E)__: particles at $$(2,1)$$ moving in $$+y$$ and $$(0,-1)$$ moving in $$-y$$. Its momentum is zero, its centre of mass is $$(1,0)$$, and

$$L = (2)(1) - (1)(0) \\;+\\; (0)(-1) - (-1)(0) = 2 \\text{ kg m}^2\\text{/s},$$

matching on all three counts. The answer is __(E)__.`,
  },
  {
    n: 19, correct: 'B',
    statement: `The following information applies to questions 19, 20, and 21.

A simple pendulum experiment is constructed from a point mass $$m$$ attached to a pivot by a massless rod of length $$L$$ in a constant gravitational field. The rod is released from an angle $$\\theta_0 < \\pi/2$$ at rest and the period of motion is found to be $$T_0$$. Ignore air resistance and friction.

At what angle $$\\theta_g$$ during the swing is the tension in the rod the greatest?`,
    choices: {
      A: 'The tension is the greatest at the point $$\\theta_g = \\theta_0$$.',
      B: 'The tension is the greatest at the point $$\\theta_g = 0$$.',
      C: 'The tension is the greatest at an angle $$\\theta_g$$ with $$0 < \\theta_g < \\theta_0$$.',
      D: 'The tension is constant.',
      E: 'None of the above is true for all values of $$\\theta_0$$ with $$0 < \\theta_0 < \\pi/2$$.',
    },
    figures: [], topics: ['Mechanics'], tags: ['pendulum', 'tension', 'energy conservation'],
    solution: `At angle $$\\theta$$ from vertical with speed $$v$$, the radial equation of motion gives

$$T - mg\\cos\\theta = \\frac{mv^2}{L}.$$

Thus $$T = mg\\cos\\theta + mv^2/L$$. Both $$\\cos\\theta$$ and $$v^2$$ are maximized at the bottom of the swing ($$\\theta = 0$$), where all potential energy has been converted to kinetic energy. Therefore $$T$$ is maximum at $$\\theta_g = 0$$.

The answer is B.`,
  },
  {
    n: 20, correct: 'E',
    statement: `The following information applies to questions 19, 20, and 21.

A simple pendulum experiment is constructed from a point mass $$m$$ attached to a pivot by a massless rod of length $$L$$ in a constant gravitational field. The rod is released from an angle $$\\theta_0 < \\pi/2$$ at rest and the period of motion is found to be $$T_0$$. Ignore air resistance and friction.

What is the maximum value of the tension in the rod?`,
    choices: {
      A: '$$mg$$',
      B: '$$2mg$$',
      C: '$$mL\\theta_0/T_0^2$$',
      D: '$$mg\\sin\\theta_0$$',
      E: '$$mg(3 - 2\\cos\\theta_0)$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['pendulum', 'tension', 'energy conservation'],
    solution: `At the bottom ($$\\theta = 0$$), conservation of energy from the release point gives

$$\\frac{1}{2}mv^2 = mgL(1 - \\cos\\theta_0).$$

Substituting into the tension formula $$T = mg\\cos\\theta + mv^2/L$$ at $$\\theta = 0$$:

$$T_{\\max} = mg + \\frac{2mg(1 - \\cos\\theta_0)}{1} \\cdot \\frac{1}{1} = mg + 2mg(1 - \\cos\\theta_0) = mg(3 - 2\\cos\\theta_0).$$

The answer is E.`,
  },
  {
    n: 21, correct: 'A',
    statement: `The following information applies to questions 19, 20, and 21.

A simple pendulum experiment is constructed from a point mass $$m$$ attached to a pivot by a massless rod of length $$L$$ in a constant gravitational field. The rod is released from an angle $$\\theta_0 < \\pi/2$$ at rest and the period of motion is found to be $$T_0$$. Ignore air resistance and friction.

The experiment is repeated with a new pendulum with a rod of length $$4L$$, using the same angle $$\\theta_0$$, and the period of motion is found to be $$T$$. Which of the following statements is correct?`,
    choices: {
      A: '$$T = 2T_0$$ regardless of the value of $$\\theta_0$$.',
      B: '$$T > 2T_0$$ with $$T \\approx 2T_0$$ if $$\\theta_0 \\ll 1$$.',
      C: '$$T < 2T_0$$ with $$T \\approx 2T_0$$ if $$\\theta_0 \\ll 1$$.',
      D: '$$T > 2T_0$$ for some values of $$\\theta_0$$ and $$T < 2T_0$$ for other values of $$\\theta_0$$.',
      E: '$$T_0$$ and $$T$$ are undefined because the motion is not periodic unless $$\\theta_0 \\ll 1$$.',
    },
    figures: [], topics: ['Mechanics'], tags: ['pendulum', 'dimensional analysis', 'oscillations/SHM'],
    solution: `By dimensional analysis, the period of a pendulum can only depend on $$L$$, $$g$$, and $$\\theta_0$$. Since $$\\theta_0$$ is dimensionless, the period must take the form $$T = f(\\theta_0)\\sqrt{L/g}$$ for some function $$f$$. Since $$\\theta_0$$ is kept the same, $$f(\\theta_0)$$ is unchanged. Therefore

$$\\frac{T}{T_0} = \\sqrt{\\frac{4L}{L}} = 2 \\implies T = 2T_0,$$

for any value of $$\\theta_0$$, not just the small-angle limit.

The answer is A.`,
  },
  {
    n: 22, correct: 'D',
    statement: `A simplified model of the foot is shown. When a student of mass $$m = 60$$ kg stands on a single toe, the tension $$T$$ in the Achilles Tendon is closest to`,
    choices: {
      A: '$$T = 600$$ N',
      B: '$$T = 1200$$ N',
      C: '$$T = 1800$$ N',
      D: '$$T = 2400$$ N',
      E: '$$T = 3000$$ N',
    },
    figures: [F13(22)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque'],
    solution: `The student's full weight $$W = mg = (60)(10) = 600$$ N is supported by the toe. Taking torques about the ankle joint, the Achilles tendon attaches approximately 5 cm behind the ankle while the toe is approximately 20 cm in front:

$$T \\times 5 \\text{ cm} = W \\times 20 \\text{ cm}$$

$$T = \\frac{600 \\times 20}{5} = 2400 \\text{ N.}$$

The answer is D.`,
  },
  {
    n: 23, correct: 'E',
    statement: `The following information applies to questions 23 and 24.

A man with mass $$m$$ jumps off of a high bridge with a bungee cord attached to his ankles. The man falls through a maximum distance $$H$$ at which point the bungee cord brings him to a momentary rest before he bounces back up. The bungee cord is perfectly elastic, obeying Hooke's force law with a spring constant $$k$$, and stretches from an original length of $$L_0$$ to a final length $$L = L_0 + h$$. The maximum tension in the bungee cord is four times the weight of the man.

Determine the spring constant $$k$$.`,
    choices: {
      A: '$$k = \\dfrac{mg}{h}$$',
      B: '$$k = \\dfrac{2mg}{h}$$',
      C: '$$k = \\dfrac{mg}{H}$$',
      D: '$$k = \\dfrac{4mg}{H}$$',
      E: '$$k = \\dfrac{8mg}{H}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'energy conservation'],
    solution: `At maximum extension, the man is momentarily at rest. Energy conservation (note that the total fall distance is $$H$$, so $$H = L_0 + h$$, but we use $$H$$ for potential energy and $$h$$ for spring extension):

$$mgH = \\frac{1}{2}kh^2. \\quad (1)$$

Maximum tension occurs at maximum extension: $$kh = 4mg$$. \\quad (2)

Dividing (1) by (2): $$\\frac{H}{4} = \\frac{h}{2}$$, so $$h = H/2$$. Substituting back into (2): $$k \\cdot \\frac{H}{2} = 4mg$$, giving

$$k = \\frac{8mg}{H}.$$

The answer is E.`,
  },
  {
    n: 24, correct: 'A',
    statement: `The following information applies to questions 23 and 24.

A man with mass $$m$$ jumps off of a high bridge with a bungee cord attached to his ankles. The man falls through a maximum distance $$H$$ at which point the bungee cord brings him to a momentary rest before he bounces back up. The bungee cord is perfectly elastic, obeying Hooke's force law with a spring constant $$k$$, and stretches from an original length of $$L_0$$ to a final length $$L = L_0 + h$$. The maximum tension in the bungee cord is four times the weight of the man.

Find the maximum extension of the bungee cord $$h$$.`,
    choices: {
      A: '$$h = \\dfrac{1}{2}H$$',
      B: '$$h = \\dfrac{1}{4}H$$',
      C: '$$h = \\dfrac{1}{5}H$$',
      D: '$$h = \\dfrac{2}{5}H$$',
      E: '$$h = \\dfrac{1}{8}H$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'energy conservation'],
    solution: `From the solution to Question 23, dividing the energy equation $$mgH = \\frac{1}{2}kh^2$$ by the tension equation $$kh = 4mg$$ yields

$$\\frac{H}{4} = \\frac{h}{2} \\implies h = \\frac{H}{2}.$$

The answer is A.`,
  },
  {
    n: 25, correct: 'D',
    statement: `A box with weight $$W$$ will slide down a 30° incline at constant speed under the influence of gravity and friction alone. If instead a horizontal force $$P$$ is applied to the box, the box can be made to move up the ramp at constant speed. What is the magnitude of $$P$$?`,
    choices: {
      A: '$$P = W/2$$',
      B: '$$P = 2W/\\sqrt{3}$$',
      C: '$$P = W$$',
      D: '$$P = \\sqrt{3}\\,W$$',
      E: '$$P = 2W$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'statics/equilibrium', 'free-body diagrams'],
    solution: `Since the box slides down at constant speed, friction balances gravity along the slope: $$\\mu = \\tan 30^\\circ = 1/\\sqrt{3}$$.

When pushed up by horizontal force $$P$$ at constant speed, balancing perpendicular to ramp:

$$N = W\\cos 30^\\circ + P\\sin 30^\\circ.$$

Friction now acts down the slope (opposing upward motion), and balancing along the ramp:

$$P\\cos 30^\\circ = W\\sin 30^\\circ + \\mu N = W\\sin 30^\\circ + \\mu(W\\cos 30^\\circ + P\\sin 30^\\circ).$$

Dividing through by $$\\cos 30^\\circ$$ and using $$\\mu = \\tan 30^\\circ$$:

$$P = \\tan 30^\\circ(W + P\\tan 30^\\circ) + W\\tan 30^\\circ = \\frac{2\\mu}{1 - \\mu^2}W.$$

With $$\\mu = 1/\\sqrt{3}$$: $$\\frac{2/\\sqrt{3}}{1 - 1/3} = \\frac{2/\\sqrt{3}}{2/3} = \\frac{3}{\\sqrt{3}} = \\sqrt{3}$$, so $$P = \\sqrt{3}\\,W$$.

The answer is D.`,
  },
]
