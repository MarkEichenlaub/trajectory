// Digitized PhysicsWOOT 2 Practice F=ma Exam 1. Source: AoPS crypt collection 191, document 11108.
//
// Answer key: B E D C E  C E E A E  A E D D C  A E D E B  B C D A A
//
// Correct-answer convention: these are AoPS-written solutions, so most questions
// end in a \boxed{...}. Six questions (3, 6, 7, 13, 14, 22) have no \boxed at
// all and were resolved from the solution's concluding sentence/equation; those
// carry a `// why:` note. Several other boxes hold a VALUE rather than a letter
// and were matched against the five choices; those are noted too.
//
// Figure notes:
//   Q2  (Newton's cradle) and Q5 (bicycle pedal) carry a CDN photograph in the
//       statement rather than an [asy] diagram. Those two files are .jpg, so they
//       use FIG_JPG; every other figure is a rendered .png.
//   Q1's five answer choices live inside a single statement figure (five labelled
//       x-vs-t plots), so `choices` is (a)-(e) pointing at that figure.
//   Q12 and Q17 additionally have solution figures.
//
// Source oddities (see report):
//   Q2  choice (a) reads "the only possible motion at conserves linear momentum"
//       -- "at" is a typo for "that" in the original; preserved as-is below.
//   Q9  the solution writes "\tau = -Mga\sin\theta \approx -Mga\sin\theta", where
//       the right-hand side was clearly meant to be the small-angle form
//       -Mga\theta. Transcribed faithfully.
//   Q13 the solution opens "The correct choice is (D)" and then derives
//       rho ~ 1/r, which is choice (d). Consistent.
//   Q20 the statement's note says a triangle's center of mass is at height h/3,
//       while the solution uses "2/3 of the way from the tip to the base" -- the
//       same point measured from the other end. Not a contradiction.
//   Q24 the alternative virtual-work derivation stops at
//       T = (1/S_2 - 1/S_1)^{-1} rho g l but prints it as
//       T = (1/S_2 - 1/S_1) rho g l, dropping the inverse. The boxed primary
//       answer S_1 S_2/(S_1 - S_2) * rho g l is correct and equals the intended
//       virtual-work result (verified numerically).

const FIG = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-pwoot2-p1/fma-pwoot2-p1-${n}.png`
const FIG_JPG = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-pwoot2-p1/fma-pwoot2-p1-${n}.jpg`

export const examId = 'fma-pwoot2-p1'
export const questions = [
  {
    n: 1, correct: 'B',
    statement: `The position vs time, velocity vs time, and acceleration vs time plots of a particle's motion all have the same shape, meaning that they are identical apart from multiplying the vertical axis of the plots by some dimensional constant. All vertical axes begin at $$0.$$ Which of the following could be the position vs time plot of the particle's motion?`,
    choices: { A: '(a)', B: '(b)', C: '(c)', D: '(d)', E: '(e)' },
    figures: [FIG('q01-q1')],
    topics: ['Mechanics'],
    tags: ['graph interpretation', '1d kinematics', 'calculus'],
    solution: `$$\\boxed{\\mathrm{(b)}}$$

Choices (a) and (c) show straight lines with non-zero slope. If the position vs time graph is a straight line, the velocity graph will be a flat line, so the velocity graph will not have the same shape as the position graph.

Choice (e) shows a particle whose position is increasing with time, but because the slope is getting smaller, the velocity is decreasing in time, so for this plot position and velocity do not have the same shape.

Plots (b) and (d) both show particles whose position vs time graph curves upward. The graphs have the same shape apart from being vertically offset. Plot (d) goes through the point (0,0), so that if the velocity and acceleration plots have the same shape, they too go through (0,0). But the slope of plot (d) is not zero at $$x=0,$$ so the velocity plot does not go through (0,0), and the plots of position and velocity vs time do not have the same shape.

The correct answer is (b).

In fact, one can determine from the problem statement

$$\\dfrac{\\mathrm{d}x}{\\mathrm{d}t} = k \\cdot x.$$

Integrating, we obtain

$$x = A e^{kt}.$$

This confirms answer (b).`,
  },
  {
    n: 2, correct: 'E', // why: boxed is "\text{None}", i.e. none of the first four -- choice (e) "None of the above."
    statement: `Newton's cradle is a famous toy in which a series of five steel balls are suspended from strings in a row, touching one another.

When the leftmost ball is pulled up to the left and released, it falls down and strikes the remaining four balls. Collisions between the balls are assumed elastic. After the collision, the leftmost ball and the center three balls remain stationary while the rightmost ball shoots off to the right. This happens because:`,
    choices: {
      A: 'this is the only possible motion at conserves linear momentum.',
      B: 'this is the only possible motion that conserves kinetic energy.',
      C: 'this is the only possible motion that conserves both linear momentum and kinetic energy.',
      D: 'this is the only possible motion that conserves linear momentum, kinetic energy, and angular momentum.',
      E: 'None of the above.',
    },
    figures: [FIG_JPG('q02-q1')],
    topics: ['Mechanics'],
    tags: ['collisions', 'momentum conservation', 'energy conservation', 'angular momentum conservation'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{None of the above}}$$

None of the first four solutions are correct. Any number of balls could bounce off the right hand side of Newton's cradle while conserving momentum and kinetic energy. For example, one possible solution is for two balls to pop out the right hand side of the cradle and for the leftmost ball to bounce back in the direction it came. This provides two degrees of freedom (the speed of the rightmost balls and the speed of the leftmost ball), allowing us to adjust the degrees of freedom to conserve both momentum and kinetic energy.

The collisions themselves can be considered to occur in a straight line, so that any motion which conserves momentum conserves angular momentum as well. The subsequent motion of the balls swinging does not conserve angular momentum because gravity provides a torque, so conservation of angular momentum is not relevant to the dynamics of the cradle.

For a nuanced perspective on why Newton's cradle does behave as observed, see:

Hutzler, Stefan, et al. "Rocking Newton’s cradle." American Journal of Physics 72.12 (2004): 1508-1516.`,
  },
  {
    n: 3, correct: 'D', // why: no boxed; solution's final line gives r ~ 2.2e2 m, matching choice (d).
    statement: `A pilot flies an airplane in a horizontal circle. They feel an effective gravitational force of $$1.5 g,$$ and their speed is $$50 \\;\\mathrm{m/s}.$$ What is the radius of their circular path?`,
    choices: {
      A: '$$1.0 \\times 10^2 \\;\\mathrm{m}.$$',
      B: '$$1.2 \\times 10^2 \\;\\mathrm{m}.$$',
      C: '$$1.7 \\times 10^2 \\;\\mathrm{m}.$$',
      D: '$$2.2 \\times 10^2 \\;\\mathrm{m}.$$',
      E: '$$2.5 \\times 10^2 \\;\\mathrm{m}.$$',
    },
    topics: ['Mechanics'],
    tags: ['circular motion', 'free-body diagrams', 'newton\'s laws'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad 2.2 \\times 10^2 \\;\\mathrm{m}}$$

The pilot's acceleration is

$$a = \\dfrac{v^2}{r}$$

and is directed toward the center of the circle. This means the pilot feels a force

$$F_c = \\dfrac{mv^2}{r}$$

toward the center of the circle, where $$m$$ is the mass of the pilot.

The pilot also feels a force

$$F_s = mg$$

upward from their seat, countering gravitational force.

We are told that the sum of these two forces has magnitude

$$F_{\\mathrm{tot}} = 1.5 mg.$$

Because the forces are perpendicular, we have

$$F_{\\mathrm{tot}}^2 = F_s^2 + F_c^2.$$

Plugging in what we've already determined about each force, we have

$$(1.5 mg)^2 = \\left(\\dfrac{mv^2}{r}\\right)^2 + (mg)^2.$$

Solving for $$r,$$ we find

$$r = \\dfrac{2v^2}{\\sqrt{5} g}.$$

Plugging in the given numbers and using $$g = 10 \\;\\mathrm{m/s^2},$$ we find

$$r \\approx 2.2 \\times 10^2 \\;\\mathrm{m}.$$`,
  },
  {
    n: 4, correct: 'C', // why: boxed value \dfrac{\omega}{\lambda} matches choice (c).
    statement: `A "puzzle box" is a mechanical device containing ropes, pulleys, masses, pivots, etc. The only source of potential energy in the puzzle box is from ideal springs. (The device operates in zero gravity.) The "bobber arm" in the puzzle box oscillates sinusoidally at angular frequency $$\\omega.$$ You build a scale model of the puzzle box in which all the materials are identical but all lengths are scaled by a factor $$\\lambda,$$ so that any length $$x$$ in the puzzle box becomes $$\\lambda x$$ in the model. What is the angular frequency of the oscillations of the bobber arm in your scale model?`,
    choices: {
      A: '$$\\omega.$$',
      B: '$$\\lambda \\omega.$$',
      C: '$$\\dfrac{\\omega}{\\lambda}.$$',
      D: '$$\\sqrt{\\lambda}\\omega.$$',
      E: '$$\\dfrac{\\omega}{\\sqrt{\\lambda}}.$$',
    },
    topics: ['Mechanics'],
    tags: ['scaling', 'dimensional analysis', 'oscillations/SHM', 'springs'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad \\dfrac{\\omega}{\\lambda}}$$

The angular frequency of an oscillator with mass $$m$$ and spring constant $$k$$ is

$$\\omega = \\sqrt{\\dfrac{k}{m}}.$$

To answer the question, we need to know how the spring constants and masses in the contraption change when scaled down.

In the scale model, all spring lengths are shorter by a factor $$\\lambda.$$ This increases the spring constant by a factor $$\\lambda.$$ All the springs also have cross-sectional areas reduced by a factor $$\\lambda^2,$$ reducing the spring constants by the same factor. In total, the spring constants are reduced by a factor $$\\lambda.$$

The mass of the oscillator in the contraption has been reduced by a factor $$\\lambda^3.$$ So the angular frequency of the contraption is

$$\\begin{aligned}
\\omega' & = \\omega \\sqrt{\\dfrac{\\lambda}{\\lambda^3}} \\\\[8pt]
{} & = \\dfrac{\\omega}{\\lambda}.
\\end{aligned}$$

Alternatively, we may note that the angular frequency is some function of the densities, $$\\rho,$$ the Young's moduli, $$Y,$$ and the lengths, $$L.$$ Dimensional analysis then yields

$$\\omega \\propto \\dfrac{1}{L} \\left(\\dfrac{Y}{\\rho}\\right)^{1/2}.$$

From this we derive the same answer.`,
  },
  {
    n: 5, correct: 'E', // why: boxed is "\text{constant}" -- the speed is constant, which is choice (e).
    statement: `A bicyclist rides in such a way that their foot pedals remain flat while cycling. Consider a point at the front of the pedal (the point on the pedal closest to the cyclist's toes, shown with a red dot in the figure). The cyclist rides at constant speed without changing the gearing of the bicycle and pedals continuously.

You may consult the further illustration of this motion available at the end of the test.

When does this point have the greatest instantaneous speed relative to the bicycle frame?`,
    choices: {
      A: 'When the pedal is at the front of its cycle.',
      B: 'When the pedal is at the bottom of its cycle.',
      C: 'When the pedal is at the back of its cycle.',
      D: 'When the pedal is at the top of its cycle.',
      E: 'The point has constant speed.',
    },
    figures: [FIG_JPG('q05-q1')],
    topics: ['Mechanics'],
    tags: ['rotational motion', 'relative motion', 'kinematics-2d'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{The point has constant speed}}$$

The center of the pedal rotates at a constant speed. It has some angular velocity $$\\omega.$$ The pedal itself counter-rotates with angular velocity $$-\\omega$$ to remain flat. This means the red dot's displacement from the center of the pedal is a constant vector. The time derivative of this constant vector is zero, so the red dot has the same velocity as the center of the pedal. This means the speed of the red dot is constant.`,
  },
  {
    n: 6, correct: 'A', // why: crypt key verified 2026-08: the boxed answer is (a); the earlier 'C' reading of the solution prose was a mis-key.
    statement: `Consider an escalator whose steps move upwards at a constant rate. (An escalator is a set of steps on an inclined plane, with a motor that moves the steps up or down the plane.) During period 1, the escalator is empty. Then a person stands on one of the steps of the escalator; call this period 2. Finally, the person begins climbing down the steps in order to remain at the same height relative to the ground; call this period 3. Consider the power $$P$$ that must be supplied to the escalator's motor during each period, ignoring friction and short-term fluctuations due to the climbing motion. Which statement is true?`,
    choices: {
      A: '$$P_1 < P_2 = P_3.$$',
      B: '$$P_1 < P_3 < P_2.$$',
      C: '$$P_1 = P_3 < P_2.$$',
      D: '$$P_3 < P_1 = P_2.$$',
      E: '$$P_1 = P_2 = P_3.$$',
    },
    topics: ['Mechanics'],
    tags: ['power', 'work-energy theorem', 'energy conservation'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad P_1 < P_2 = P_3}$$

This problem is simpler than it may look. Since the steps move at the same rate at all three times, all that matters is the force $$F$$ applied to the steps by the person. This is obviously zero during period 1. During periods 2 and 3, the person moves at constant velocity, so the net force on them is zero; hence in both cases $$F$$ is exactly their weight, and $$P_2 = P_3.$$ The force acts downwards on the upwards-moving steps, so it does negative work on the steps; to counteract this, additional power must be supplied to the motor, so $$P_1 < P_2.$$

The main trap in the problem is that the person's potential energy increases only during period 2, making $$P_1 = P_3 < P_2$$ a tempting option. However, the escalator delivers power to the person during both periods $$2$$ and $$3$$ -- during period $$3$$ that power is dissipated by the person as they climb down. (If this seems unintuitive, consider what happens when you climb down a set of stationary stairs -- you release your stored potential energy, but none of this energy goes into the stairs as work, since of course they aren't moving. Instead it is dissipated in your legs and by the inelastic collisions between your feet and the steps.)`,
  },
  {
    n: 7, correct: 'E', // why: no boxed; the solution's final displayed equation is exactly choice (e).
    statement: `A student launches a ball straight up into the air. Air resistance can be neglected. The student measures the initial velocity of the ball to be $$v \\pm \\delta v.$$ The student measures the maximum height reached by the ball to be $$h \\pm \\delta h.$$ The student uses the data to calculate $$g.$$ The uncertainties in $$v$$ and $$h$$ are independent. Which equation for the student's uncertainty $$\\delta g$$ in the result is correct?`,
    choices: {
      A: '$$\\delta g = \\sqrt{\\delta v^2 + \\delta h^2}.$$',
      B: '$$\\delta g = g\\left(2\\dfrac{\\delta v}{v} + \\dfrac{\\delta h}{h}\\right).$$',
      C: '$$\\delta g = \\sqrt{2\\delta v^2 + \\delta h^2}.$$',
      D: '$$\\left(\\dfrac{\\delta g}{g}\\right)^2 = \\left(\\dfrac{\\delta v}{v}\\right)^2 + \\left(2\\dfrac{\\delta h}{h}\\right)^2.$$',
      E: '$$\\delta g^2 = \\left(\\dfrac{v}{h}\\delta v\\right)^2 + \\left(\\dfrac{v^2}{2h^2}\\delta h\\right)^2.$$',
    },
    topics: ['Mechanics'],
    tags: ['uncertainty propagation', 'error analysis', 'energy conservation'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\delta g^2 = \\left(\\dfrac{v}{h}\\delta v\\right)^2 + \\left(\\dfrac{v^2}{2h^2}\\delta h\\right)^2}$$

By conservation of energy,

$$\\dfrac12 mv^2 = mgh.$$

Solving for $$g,$$ we find

$$g = \\dfrac{v^2}{2h}.$$

Combining the rules for uncertainty in a power and the rule for uncertainty in a product, we have

$$\\left(\\dfrac{\\delta g}{g}\\right)^2 = \\left(2\\dfrac{\\delta v}{v}\\right)^2 + \\left(\\dfrac{\\delta h}{h}\\right)^2.$$

Multiplying both sides by $$g^2,$$ we get

$$\\delta g^2 = \\left(2g\\dfrac{\\delta v}{v}\\right)^2 + \\left(g\\dfrac{\\delta h}{h}\\right)^2.$$

And applying the formula $$g = \\dfrac{v^2}{2h},$$ this becomes

$$\\delta g^2 = \\left(\\dfrac{v}{h}\\delta v\\right)^2 + \\left(\\dfrac{v^2}{2h^2}\\delta h\\right)^2.$$`,
  },
  {
    n: 8, correct: 'E', // why: boxed value v ~ sqrt(gMr/m) matches choice (e).
    statement: `A wheel consists of a circular disk of mass $$M$$ and radius $$r$$ and a small weight of mass $$m$$ attached to the rim. The wheel rolls without slipping along the ground. Approximately how fast must the wheel roll before it jumps up off the ground? Assume $$m \\ll M.$$`,
    choices: {
      A: '$$v\\approx \\sqrt{\\dfrac{gMr}{M-m}}.$$',
      B: '$$v \\approx \\sqrt{\\dfrac{gMr}{M+m}}.$$',
      C: '$$v \\approx \\sqrt{gr}.$$',
      D: '$$v \\approx \\sqrt{\\dfrac{gmr}{M}}.$$',
      E: '$$v\\approx \\sqrt{\\dfrac{gMr}{m}}.$$',
    },
    topics: ['Mechanics'],
    tags: ['circular motion', 'rolling without slipping', 'newton\'s laws', 'limiting cases'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad v\\approx \\sqrt{\\dfrac{gMr}{m}}}$$

Because the mass $$m$$ is so small, we can treat the wheel as rolling with constant angular velocity $$\\omega.$$

Then the acceleration of the mass is $$\\omega^2r$$ where $$r$$ is the radius of the wheel. The net force on the mass is $$m \\omega^2 r.$$

The force that accelerates the mass is a combination of gravity and the force from the wheel. When the mass is at the top of the wheel, the wheel exerts a downward force on the mass. By Newton's third law, the mass exerts a force of the same magnitude upward on the wheel.

At that point, gravity and the force from the wheel on the mass both point downward, so

$$F_{\\mathrm{wheel} \\to \\mathrm{mass}} + mg = m \\omega^2 r.$$

The wheel will pop up off the ground if the force from the mass equals the weight of the wheel, so we have

$$Mg = F_{\\mathrm{wheel} \\to \\mathrm{mass}}.$$

Substituting in our equation for $$F_{\\mathrm{wheel} \\to \\mathrm{mass}}$$ and solving for $$\\omega^2r^2,$$ we get

$$\\omega^2r^2 = g \\left(\\dfrac{m+M}{m}\\right) r.$$

$$\\omega^2r^2$$ is simply $$v^2.$$ We can also approximate $$m+M \\approx M$$ to get

$$v \\approx \\sqrt{\\dfrac{gMr}{m}}.$$

Alternatively, we can examine some extreme cases. Suppose we let $$m \\to 0.$$ Then we should get $$v\\to\\infty.$$ Only the correct choice works.`,
  },
  {
    n: 9, correct: 'A', // why: boxed value T = 2\pi\sqrt{(R^2+2a^2)/(2ga)} matches choice (a) exactly.
    statement: `A uniform solid disk of radius $$R$$ is pivoted on a horizontal axis a distance $$a$$ from its center.

Find the period of small oscillations of the disk.`,
    choices: {
      A: '$$T = 2\\pi \\sqrt{\\dfrac{R^2 + 2a^2}{2ga}}.$$',
      B: '$$T = 2\\pi R \\sqrt{\\dfrac{1}{2ga}}.$$',
      C: '$$T = 2\\pi \\sqrt{\\dfrac{R}{2g}}.$$',
      D: '$$T = 2\\pi \\sqrt{\\dfrac{a}{g}}.$$',
      E: '$$T = 2\\pi \\sqrt{\\dfrac{2R^2 + a^2}{2ga}}.$$',
    },
    figures: [FIG('q09-q1')],
    topics: ['Mechanics'],
    tags: ['oscillations/SHM', 'moment of inertia', 'rotational dynamics', 'torque'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad T = 2\\pi \\sqrt{\\dfrac{R^2 + 2a^2}{2ga}}}$$

The period of a physical pendulum is

$$T = 2\\pi \\sqrt{\\dfrac{I}{k}},$$

where the torque on the pendulum is

$$\\tau = -k\\theta,$$

and $$\\theta$$ is the pendulum's angular displacement from equilibrium.

By the parallel axis theorem, the moment of inertia of the disk is

$$I = \\dfrac12 MR^2 + Ma^2,$$

where we have used the moment of inertia about the center of mass, $$I_{cm} = \\dfrac12 MR^2,$$ for the first term.

When the disk is displaced by an angle $$\\theta,$$ the torque on it is

$$\\begin{aligned}
\\tau & = -Mga\\sin\\theta \\\\
{} & \\approx -Mga\\theta.\\end{aligned}$$

This gives

$$k = Mga.$$

That makes the period

$$T = 2\\pi \\sqrt{\\dfrac{\\dfrac12 MR^2 + Ma^2}{Mga}}.$$

We can simplify this to

$$T = 2\\pi \\sqrt{\\dfrac{R^2 + 2a^2}{2ga}}.$$`,
  },
  {
    n: 10, correct: 'E', // why: boxed is "\text{none}" of (a),(b),(c) -- choice (e) "None of the above."
    statement: `A particle moves in a straight line in such a way that, over any given one-second period, its displacement is one meter. Which is necessarily true of the particle's motion?`,
    choices: {
      A: 'Its velocity is constant.',
      B: 'Its speed is $$1 \\;\\mathrm{m/s}.$$',
      C: 'It does not change direction.',
      D: 'All of (a), (b), and (c).',
      E: 'None of the above.',
    },
    topics: ['Mechanics'],
    tags: ['1d kinematics', 'speed vs velocity', 'graph interpretation'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{None of the above}}$$

Consider a motion in which the particle begins at $$0 \\;\\mathrm{m/s},$$ accelerates with constant acceleration to $$2 \\;\\mathrm{m/s}$$ in the first second, then instantly drops back to $$0 \\;\\mathrm{m/s}$$ and accelerates to $$2 \\;\\mathrm{m/s}$$ again over the second second, etc. Then in any given second, the particle would travel a total distance of $$1 \\;\\mathrm{m},$$ but the speed and velocity of the particle are not constant. We could modify this scenario so the particle's velocity begins at $$-1 \\;\\mathrm{m/s}$$ and ends at $$3 \\;\\mathrm{m/s},$$ in which case the particle changes directions as well. So none of (a), (b), or (c) are correct.

The motion must be any periodic motion with a period of one second and an average velocity of zero, plus a constant velocity of $$1 \\;\\mathrm{m/s}$$ superimposed on that. For example, the motion could be $$v = 1 \\;\\mathrm{m/s} + v_0\\sin(2\\pi t/(1 \\;\\mathrm{s})).$$ There is enough freedom in this choice so that none of the options must be true.`,
  },
  {
    n: 11, correct: 'A', // why: boxed value r \propto R^{7/3} matches choice (a).
    statement: `A planet has density $$\\rho$$ and angular momentum per unit mass (about its own axis of rotation) $$\\ell.$$ A satellite is placed in an orbit above the equator so that it stays above the same spot on the planet's surface at all times. How does the radius $$r$$ of this orbit depend on $$R,$$ the radius of the planet?`,
    choices: {
      A: '$$r\\propto R^{7/3}.$$',
      B: '$$r\\propto R^{5/3}.$$',
      C: '$$r\\propto R^{2/3}.$$',
      D: '$$r\\propto R.$$',
      E: '$$r\\propto R^{3/2}.$$',
    },
    topics: ['Mechanics'],
    tags: ['gravitation', 'scaling', 'angular momentum conservation', 'circular motion'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad r\\propto R^{7/3}}$$

The satellite orbits with angular velocity $$\\omega,$$ which is also the angular velocity of rotation of the planet. We will use the angular momentum of the planet to find one equation for $$\\omega$$ in terms of $$R$$ and orbital dynamics to find another equation for $$\\omega$$ in terms of $$r.$$
The angular momentum of the planet is

$$L = I\\omega \\propto M R^2 \\omega.$$

The angular momentum is also

$$L = \\ell M.$$

Combining these, we get

$$\\ell M \\propto MR^2 \\omega,$$

or

$$\\omega \\propto \\dfrac{\\ell}{R^2}.$$

Next we consider the orbital dynamics. The satellite has acceleration

$$a = \\omega^2 r \\propto \\dfrac{M}{r^2},$$

where the right hand side is from Newton's gravitational law.
From this we conclude

$$\\omega \\propto \\sqrt{\\dfrac{\\rho R^3}{r^3}}.$$

Putting our two findings together,

$$\\dfrac{\\ell}{R^2} \\propto \\sqrt{\\dfrac{\\rho R^3}{r^3}}.$$

We can ignore $$\\ell$$ and $$\\rho$$ because they are constants, so

$$R^{-2} \\propto R^{3/2} r^{-3/2},$$

or

$$r \\propto R^{7/3}.$$`,
  },
  {
    n: 12, correct: 'E', // why: boxed value mg\sec\theta matches choice (e).
    statement: `A person of mass $$m$$ stands in a large sphere of radius $$R$$ at angle $$\\theta$$ from the bottom of the sphere. The height of the person can be neglected relative to the radius of the sphere. The sphere rotates about its vertical axis at angular frequency $$\\omega$$ such that the person perceives themself to be standing upright. What is the normal force between the sphere and the person? Give your answer as a function of $$R, \\theta,$$ and $$mg.$$`,
    choices: {
      A: '$$\\sqrt{(R\\sin\\theta)^2 + (mg)^2}.$$',
      B: '$$mg\\cos\\theta.$$',
      C: '$$mg \\cot\\theta.$$',
      D: '$$mg\\sin\\theta.$$',
      E: '$$mg \\sec\\theta.$$',
    },
    figures: [FIG('q12-q1')],
    solutionFigures: [FIG('q12-s1')],
    topics: ['Mechanics'],
    tags: ['non-inertial frames', 'circular motion', 'free-body diagrams', 'statics/equilibrium'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad mg \\sec\\theta}$$

In the frame rotating with the sphere, the person feels three forces: a gravitational force $$mg$$ downwards, a centrifugal force $$F_c$$ horizontally, and a normal force $$N$$ from the floor.

Because the person perceives themself upright, they do not feel a friction force from the floor. The forces must sum to zero. The normal force points towards the center of the sphere, so the sum of the gravitational forces and centrifugal forces must point directly away from the center of the sphere. This implies

$$\\tan \\theta = \\frac{F_c}{mg},$$

 or

$$F_c = mg\\tan\\theta.$$

 The magnitude of the normal force is the person's perceived weight. We can find the magnitude by finding the magnitude of the sum of the weight and centrifugal forces. They are at right angles, so the Pythagorean theorem implies

$$\\begin{aligned}
|N| & = \\sqrt{(mg)^2 + F_c^2} \\\\
{} & = mg\\sqrt{1 + \\tan^2\\theta} \\\\[8pt]
{} & = \\frac{mg}{\\cos\\theta}.
\\end{aligned}$$

So the person's perceived weight is

$$\\dfrac{mg}{\\cos\\theta} = mg\\sec\\theta.$$

 The sphere radius $$R$$ is immaterial.

As an alternative approach:
Since there is no friction, the only forces with a component in the vertical direction are the normal force $$N$$ and the weight $$mg.$$ The vertical component of the normal force is $$N\\cos\\theta,$$ so

$$N\\cos\\theta = mg.$$

And solving for $$N,$$

$$N = \\dfrac{mg}{\\cos\\theta}.$$

This confirms our first solution method. The approach is somewhat simpler than the first approach because it chooses to analyze the direction perpendicular to the unknown centrifugal force. This allows us to ignore the centrifugal force's magnitude.`,
  },
  {
    n: 13, correct: 'D', // why: no boxed, but the solution opens "The correct choice is (D)" and derives rho = g/(2 pi r G), i.e. rho ~ r^{-1}, which is choice (d).
    statement: `A spherical asteroid has a mass density $$\\rho$$ that varies only with the distance $$r$$ from its center. Miners dig a thin and very deep shaft into the asteroid and find that the gravitational field has a constant strength throughout the shaft. How does $$\\rho$$ vary with $$r$$?

(Note: Assume the problem is not concerned about the exact center of the planet, where some of the answer choices blow up.)`,
    choices: {
      A: '$$\\rho = kr^2.$$',
      B: '$$\\rho = kr.$$',
      C: '$$\\rho = k.$$',
      D: '$$\\rho = kr^{-1}.$$',
      E: '$$\\rho = kr^{-2}.$$',
    },
    topics: ['Mechanics'],
    tags: ['gravitation', 'dimensional analysis', 'calculus'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad \\rho = kr^{-1}}$$

__Direct approach__: Let $$M(r)$$ be the mass contained inside a sphere of radius $$r$$. Then the gravitational field strength is given by

$$g = \\frac{G}{r^2} M(r).$$

If $$g$$ is constant, we thus have

$$M(r) = \\frac{g r^2}{G}.$$

A spherical shell of thickness $$dr$$ thus has mass

$$dM = \\frac{2 g r}{G} dr.$$

But such a shell also has mass $$4 \\pi r^2 \\rho(r) \\, dr$$, so

$$4 \\pi r^2 \\rho(r) \\, dr = \\frac{2 g r}{G} dr,$$

which gives

$$\\rho(r) = \\frac{g}{2 \\pi r G}.$$

__Dimensional analysis approach__: The proportionality constant is a combination of the gravitational field strength $$g$$ and the universal gravitational constant $$G$$:

$$\\rho = a G^\\alpha g^\\beta r^\\gamma,$$

$$M L^{-3} = (M^{-1} L^3 T^{-2})^\\alpha (L T^{-2})^\\beta L^\\gamma.$$

We conclude that $$\\alpha = -1$$, $$\\beta = 1$$, and $$\\gamma = -1.$$`,
  },
  {
    n: 14, correct: 'D', // why: no boxed; both derivations end at F_pivot = F L/(L-x), which is choice (d).
    statement: `A massless rod of length $$L$$ is pivoted at a point a distance $$x$$ from its left end. A force $$F$$ is applied at the left end perpendicular to the rod. A second force is applied at the right hand end, perpendicular to the rod, so that the rod remains stationary. What is the force from the pivot on the rod?`,
    choices: {
      A: '$$2F.$$',
      B: '$$0.$$',
      C: '$$F\\left(\\dfrac{x}{L-x}\\right).$$',
      D: '$$F\\left(\\dfrac{L}{L-x}\\right).$$',
      E: '$$F\\left(\\dfrac{x}{L}\\right).$$',
    },
    topics: ['Mechanics'],
    tags: ['torque', 'statics/equilibrium', 'free-body diagrams'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad F\\left(\\dfrac{L}{L-x}\\right)}$$

The force $$F$$ exerts a torque $$Fx$$ about the pivot. The second force $$F_2$$ must exert an equal torque, so

$$Fx = F_2 (L-x).$$

The entire rod doesn't move, so there is no net force on it. This means the force from the pivot cancels the other two applied forces, or

$$F_p = F + F_2.$$

Solving algebraically, we find

$$F_p = F\\left(\\dfrac{L}{L-x}\\right).$$

Alternatively, we can calculate the torque about the right hand end of the rod. With this approach, the force on the pivot and the force on the left hand end of the rod exert torques. Balancing these torques,

$$FL = F_{\\mathrm{pivot}}(L-x).$$

And solving, we find

$$F_{\\mathrm{pivot}} = F\\dfrac{L}{L-x}.$$`,
  },
  {
    n: 15, correct: 'C', // why: boxed value f = F(1-\beta)/(1+\beta) gives f/F = (1-\beta)/(1+\beta), choice (c).
    statement: `A cylinder with mass $$m$$, radius $$r$$, and moment of inertia $$\\beta mr^2$$ about the symmetry axis of the cylinder rests on a flat horizontal surface. A constant force $$F$$ is applied to the right at the top of the cylinder (e.g. by pulling on a string that has been spooled around the cylinder), causing the cylinder to roll without slipping.

In order for this to happen, the ground must also exert a frictional force $$f$$ on the cylinder. Let $$f$$ be positive if the friction force is directed towards the right, and negative if the friction force is directed towards the left. What is the ratio $$\\dfrac{f}{F}?$$`,
    choices: {
      A: '$$\\beta.$$',
      B: '$$\\dfrac{1}{\\beta}.$$',
      C: '$$\\dfrac{1-\\beta}{1+\\beta}.$$',
      D: '$$\\dfrac{1+\\beta}{1-\\beta}.$$',
      E: '$$1+ \\beta^2.$$',
    },
    figures: [FIG('q15-q1')],
    topics: ['Mechanics'],
    tags: ['rolling without slipping', 'friction', 'rotational dynamics', 'moment of inertia'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad \\dfrac{1-\\beta}{1+\\beta}}$$

There are two forces on the cylinder, the force $$F$$ to the right and the friction force $$f$$ to the right. By Newton's second law,

$$a = \\dfrac{F+f}{m}.$$

Both $$F$$ and $$f$$ exert a torque about the center of mass of the cylinder. They exert torques in opposite directions, so by the rotational analog of Newton's second law

$$\\begin{aligned}
\\alpha & = \\dfrac{\\tau}{I} \\\\[8pt]
{} & = \\dfrac{Fr-fr}{\\beta m r^2} \\\\[8pt]
{} & = \\dfrac{F-f}{\\beta m r}.
\\end{aligned}$$

Because the cylinder rolls without slipping, the acceleration is

$$a = \\alpha r.$$

Plugging in $$a$$ and $$\\alpha,$$ we have

$$\\dfrac{F+f}{m} = \\dfrac{F-f}{\\beta m r}r.$$

Solving for $$f,$$

$$f = F\\left(\\dfrac{1-\\beta}{1+\\beta}\\right).$$`,
  },
  {
    n: 16, correct: 'A', // why: boxed value v = \sqrt{gh} matches choice (a).
    statement: `A cable is thrown over a cylinder so that some of the cable is on the table and some is on the floor. The cable is released and accelerates. As parts of the cable reach the floor, they collide inelastically. After some time, the cable moves at constant velocity $$v.$$ What is this velocity?`,
    choices: {
      A: '$$v = \\sqrt{gh}.$$',
      B: '$$v = \\sqrt{2gh}.$$',
      C: '$$v = \\sqrt{\\dfrac{gh}{2}}.$$',
      D: '$$v = 2\\sqrt{gh}.$$',
      E: '$$v = \\dfrac12 \\sqrt{gh}.$$',
    },
    figures: [FIG('q16-q1')],
    topics: ['Mechanics'],
    tags: ['momentum conservation', 'variable mass', 'energy conservation', 'collisions'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad v = \\sqrt{gh}}$$

The parts of the cable hanging from either side of the pulley and above the table are balanced, so the part of the cable of length $$h$$ hanging at the bottom on the right is unbalanced. If the cable has mass per unit length $$\\lambda,$$ this part of the cable has mass $$\\lambda h.$$ The cable is not accelerating, so tension in the cable at the height of the table must be $$T = g\\lambda h.$$
This tension force pulls up on the cable pile on the left, adding momentum $$g \\lambda h$$ per unit time to that pile of cable. The momentum added per unit time is also equal to the mass per unit time drawn up (which is $$\\lambda v$$) times the momentum per unit mass (which is $$v$$). That gives us

$$T = \\lambda v \\cdot v.$$

Using our earlier equation for $$T,$$ we have

$$g\\lambda h =\\lambda v^2,$$

and solving for $$v,$$ we get

$$v = \\sqrt{gh}.$$

Note that an energy-based approach is somewhat subtle. Suppose the cable runs at speed $$v.$$ The cable striking the floor dissipates a power

$$\\begin{aligned}
P_{\\mathrm{floor}} & = \\dfrac12 \\dot{m}v^2 \\\\[8pt]
{} & = \\dfrac12 \\lambda v^3.
\\end{aligned}$$

The power released by gravitational potential energy is

$$\\begin{aligned}
P_{\\mathrm{grav}} & = \\dot{m}gh \\\\
{} & = \\lambda v g h.
\\end{aligned}$$

Finally, we look for the power dissipated in the left hand pile. The power delivered by the rope is $$Fv = \\dot{m}v^2,$$ which is $$\\lambda v^3.$$ But the rate of change of kinetic energy of the rope is $$\\dot{T} = \\dfrac12 \\dot{m}v^2,$$ which is $$\\dfrac12 \\lambda v^3.$$ So the power dissipated in the left hand pile is

$$P_{\\mathrm{left}} = \\dfrac12 \\lambda v^3.$$

Equating the total dissipated power to the power released by gravity,

$$\\lambda v^3 = \\lambda v gh.$$

Solving for $$v,$$

$$v = \\sqrt{gh}.$$

Another way of thinking of this is that the rope could be thought as a chain of small, rigid pieces. Each rigid piece is jerked up in an inelastic collision with the piece above it when it begins moving. These inelastic collisions dissipate power.`,
  },
  {
    n: 17, correct: 'E', // why: boxed value \sqrt{x^2+y^2} = 4 km matches choice (e).
    statement: `Two airplanes are flying at the same altitude. One flies east at $$800 \\;\\mathrm{km/h}$$ and the other flies north at $$600 \\;\\mathrm{km/h}.$$ The plane flying north is $$20 \\;\\mathrm{km}$$ east and $$20 \\;\\mathrm{km}$$ south of the other plane. Both planes maintain a constant velocity. What will be the least distance between the two planes as they fly?`,
    choices: {
      A: '$$0.2 \\;\\mathrm{km}.$$',
      B: '$$1.92 \\;\\mathrm{km}.$$',
      C: '$$2.4 \\;\\mathrm{km}.$$',
      D: '$$3.2 \\;\\mathrm{km}.$$',
      E: '$$4 \\;\\mathrm{km}.$$',
    },
    solutionFigures: [FIG('q17-s1'), FIG('q17-s2')],
    topics: ['Mechanics'],
    tags: ['relative motion', 'kinematics-2d', 'vectors'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad 4 \\;\\mathrm{km}}$$

The airplanes are both originally approaching each other. Once an airplane has passed the dot on the image below, it is retreating from the other airplane.

We have introduced the variables $$v_f = 800 \\;\\mathrm{km/h}$$ for the speed of the fast airplane and $$v_s = 600 \\;\\mathrm{km/h}$$ for the speed of the slower airplane.

The faster-moving plane will begin retreating before the slower-moving plane. The distance between the planes will shrink until one airplane (the fast plane) is retreating and the other (the slow plane) is approaching at the same rate that the fast plane is retreating.
The rate at which an airplane is retreating / approaching is its velocity projected onto the line between the planes. Thus, the distance is minimal in a situation as shown below, with the lengths of the solid red line segments equal.

The projection of the plane's velocity onto the hypotenuse of the triangle is proportional to the side length of the triangle parallel to the plane's velocity. Then we have

$$v_f \\cdot x = v_s \\cdot y.$$

We can set up another equation relating the sides of the triangle simply by calculating how far from the dot the planes are. If the fast plane reaches the dot at time $$t = 0,$$ then

$$x = v_f \\cdot t,$$

$$y = d - \\left(\\dfrac{d}{v_f} + t\\right)v_s,$$

where $$d$$ is the original distance of the planes from the dot. The second equation is derived by the consideration that the slow plane begins a distance $$d$$ from the dot. It takes the fast plane a time $$\\dfrac{d}{v_f}$$ to reach the dot, so the slow plane travels for a time $$\\dfrac{d}{v_f} + t$$. Multiplying that time by $$v_s$$ gives the distance the slow plane travels. Subtracting that distance from $$d$$ gives the distance the slow plane has yet to travel to arrive at the dot.
We can now solve the equations for $$\\sqrt{x^2 + y^2},$$ finding

$$\\sqrt{x^2 + y^2} = \\dfrac{d(v_f - v_s)}{\\sqrt{v_s^2 + v_f^2}}.$$

Plugging in the given values, the closest approach was

$$\\sqrt{x^2 + y^2} = 4 \\;\\mathrm{km}.$$

As an alternative solution, let $$\\hat i$$ be east and $$\\hat j$$ be north. Then the separation between the two planes is

$$\\vec d = (20 \\, \\mathrm{km} - (800 \\, \\mathrm{km}/\\mathrm{h}) t) \\, \\hat i + (-20 \\, \\mathrm{km} + (600 \\, \\mathrm{km}/\\mathrm{h}) t) \\, \\hat j.$$

For convenience, write $$s = (1000 \\, \\mathrm{km}/\\mathrm{h}) t$$; then

$$\\vec d = \\vec a + \\vec b \\, s,$$

where

$$\\vec a = (20 \\, \\mathrm{km}) \\, \\hat i + (-20 \\, \\mathrm{km}) \\, \\hat j,$$

$$\\vec b = -0.8 \\, \\hat i + 0.6 \\, \\hat j.$$

From here the intuition is that we're looking for the component of $$\\vec a$$ perpendicular to $$\\vec b$$, since that's the component that can never be reduced during the motion. One way to find that is to use the cross product. Remember that

$$|\\vec d \\times \\vec b| = |\\vec d||\\vec b| |\\sin \\theta|,$$

where $$\\theta$$ is the angle between the vectors. Since $$|\\sin \\theta| \\le 1$$, at all times

$$|\\vec d \\times \\vec b| \\le |\\vec d||\\vec b|,$$

and since we have chosen $$\\vec b$$ so that $$|\\vec b| = 1$$,

$$|\\vec d| \\ge |\\vec d \\times \\vec b|.$$

(Technically we now have to check that we actually attain the minimum; however, this is clear physically, since the planes begin by getting closer together.)

Now, by the definition of $$\\vec d$$ we have

$$\\vec d \\times \\vec b = \\vec a \\times \\vec b + s \\vec b \\times \\vec b,$$

and since the cross product of any vector with itself is zero,

$$\\vec d \\times \\vec b = \\vec a \\times \\vec b.$$

Even though $$\\vec d$$ is changing, the cross product is a constant! And it's one we can easily evaluate:

$$\\begin{aligned}
|\\vec a \\times \\vec b| & = |(20 \\, \\mathrm{km}) \\cdot 0.6 - (-20 \\, \\mathrm{km}) \\cdot -0.8| \\\\
{} & = 4 \\, \\mathrm{km}.
\\end{aligned}$$

Note: you might look for another solution by adopting a frame of reference in which one of the planes is stationary.`,
  },
  {
    n: 18, correct: 'D', // why: boxed value H = h(M/(M+m))^2 matches choice (d).
    statement: `The inclined surfaces of two movable wedges of the same mass $$M$$ meet the horizontal plane smoothly, as shown. The wedges are not attached to one another. A washer of mass $$m$$ slides down the left-hand wedge from a height $$h.$$ To what maximum height will the washer rise on the right-hand wedge? (Ignore friction)`,
    choices: {
      A: '$$h.$$',
      B: '$$h \\left(\\dfrac{M}{M+m}\\right).$$',
      C: '$$h \\left(\\dfrac{m}{M}\\right).$$',
      D: '$$h \\left(\\dfrac{M}{M+m}\\right)^2.$$',
      E: '$$h \\left(\\dfrac{m}{M}\\right)^2.$$',
    },
    figures: [FIG('q18-q1')],
    topics: ['Mechanics'],
    tags: ['momentum conservation', 'energy conservation', 'collisions', 'reference frames'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad h \\left(\\dfrac{M}{M+m}\\right)^2}$$

As the mass $$m$$ falls, it releases gravitational potential energy $$mgh.$$ This energy is shared between the small mass and the larger wedge, which is pushed backward.
The two conserve momentum, so

$$mv + MV = 0,$$

where $$v$$ is the speed of the block and $$V$$ the speed of the wedge.
By conservation of energy,

$$\\dfrac12(mv^2 + MV^2) = mgh.$$

Combining these equations, we find

$$\\dfrac12 mv^2 = \\dfrac{mMgh}{m+M}.$$

Next, the mass climbs the second wedge. The system of the mass and the second wedge conserves momentum and energy during this process.
This gives us two equations

$$\\begin{aligned}
mv & = (m+M) V' \\\\[8pt]
\\dfrac12 mv^2 & = mgH + \\dfrac12(m+M) V'^2,
\\end{aligned}$$

where $$H$$ is the height to which the block rises on the wedge and $$V'$$ is the speed of the block and wedge when the block rises to its greatest height.
Solving for $$H,$$ we get

$$H = \\dfrac{v^2}{2g} \\dfrac{M}{M+m},$$

and using our earlier result for $$v^2,$$

$$H = h \\left(\\dfrac{M}{M+m}\\right)^2.$$`,
  },
  {
    n: 19, correct: 'E', // why: boxed is the prose "water runs to the right", and the solution shows it happens regardless of which vessel is heated -- choice (e).
    statement: `Two vessels are shaped as shown, and connected via their tube at their bottoms. The bottoms are at the same level. Water is poured into the vessels so that the water is at equilibrium.

Suppose that water on either the left or right is heated. The water in that beaker expands (the vessels themselves are unchanged). Then in which direction does water flow through the tube?

In this problem, ignore any changes in atmospheric pressure with altitude.`,
    choices: {
      A: 'Water does not flow through the tube.',
      B: 'If the left vessel is heated, water flows to the left and if the right vessel is heated, water flows to the right.',
      C: 'If the left vessel is heated, water flows to the right and if the right vessel is heated, water flows to the left.',
      D: 'Water flows to the left regardless of which vessel is heated.',
      E: 'Water flows to the right regardless of which vessel is heated.',
    },
    figures: [FIG('q19-q1')],
    topics: ['Mechanics'],
    tags: ['fluid statics', 'pressure', 'thermal expansion'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{Water flows to the right regardless of which vessel is heated}}$$

Water will flow from wherever there is higher pressure to wherever there is lower pressure, so to answer the question, we need to know whether heating (and therefore expanding) the water will change the pressure at the bottom of the beaker.
The pressure at the bottom of a beaker is $$\\rho g h,$$ where $$\\rho$$ is the density of the water.
Suppose we heat the water in a beaker with straight vertical sides. Then if we heat the water and increase its volume by $$1\\%,$$ $$\\rho$$ decreases by $$1\\%.$$ Also, $$h$$ increases by $$1\\%.$$ The result is no change to the pressure at the bottom of the beaker.

However, suppose we heat the water in the left beaker so that the volume increases by $$1\\%.$$ Then again $$\\rho$$ decreases by $$1\\%.$$ However, the extra volume of water is concentrated in a narrow space at the top of the beaker. Because the cross-sectional area available to this extra volume is smaller than average for the beaker, the water height rises more than it would in a beaker with straight sides. $$h$$ increases by more than $$1 \\%$$. Thus, when we heat the water on the left, the pressure at the bottom of the left beaker increases and water runs to the right.

Next suppose we heat the water on the right. Then by the same reasoning in reverse, the pressure at the bottom of the right beaker decreases. This means the pressure at the bottom of the left beaker is greater than that at the bottom of the right beaker, and water again runs to the right.
So regardless of which beaker is heated, water runs to the right.`,
  },
  {
    n: 20, correct: 'B', // why: boxed value T = 2\pi\sqrt{3\pi r/(8g)} matches choice (b).
    statement: `A solid circular disk of uniform density is cut in half along a diameter. The resulting semi-circle hangs vertically through the center of the original circle. What is the period of small oscillations of the disk?

note for a triangle with one side along the $$x$$ axis and a height $$h,$$ the center of mass is at height $$\\dfrac{h}{3}.$$`,
    choices: {
      A: '$$2\\pi \\sqrt{\\dfrac{3\\pi r}{4g}}.$$',
      B: '$$2\\pi \\sqrt{\\dfrac{3\\pi r}{8g}}.$$',
      C: '$$2\\pi \\sqrt{\\dfrac{3\\pi r}{16g}}.$$',
      D: '$$2\\pi \\sqrt{\\dfrac{2r}{g}}.$$',
      E: '$$2\\pi \\sqrt{\\dfrac{r}{2g}}.$$',
    },
    topics: ['Mechanics'],
    tags: ['oscillations/SHM', 'moment of inertia', 'center of mass', 'energy conservation'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad 2\\pi \\sqrt{\\dfrac{3\\pi r}{8g}}}$$

First, let's find the moment of inertia of the semi-circular disk. The moment of inertia of a solid circular disk is

$$I_{c} = \\dfrac12 Mr^2,$$

where $$m$$ is the mass of the disk. The moment of the semi-circular disk is half this much, or

$$I_{sc} = \\dfrac12 \\cdot \\dfrac12 M r^2.$$

However, the mass of the semicircle is $$m = \\dfrac12 M,$$ so the moment of inertia is

$$I_{sc} = \\dfrac12 mr^2.$$

Next, we need to find the relation between small oscillations of the semi-circle and the restoring torque. This is done most easily by considering energy. Suppose the semi-circle is rotated through some small angle $$\\mathrm{d}\\theta$$. This is equivalent to cutting off a small triangle of material from the left and pasting it into the right. The small triangle has angle $$\\mathrm{d}\\theta$$.
The center of mass of a triangle is $$\\dfrac23$$ of the way from the tip to the base, so the center of mass of the triangle rises $$\\dfrac23r \\mathrm{d}\\theta.$$ (Note that the center of mass is in the middle of the triangle vertically, so it rises $$\\dfrac12 \\cdot \\dfrac23r \\cdot 2\\mathrm{d}\\theta.$$)

The mass of the triangle is $$\\dfrac{\\mathrm{d}\\theta}{\\pi} m,$$ so the energy increase in moving the triangle is

$$\\mathrm{d}U = \\dfrac{2 gm r (\\mathrm{d}\\theta)^2}{3\\pi}.$$

This can also be written

$$\\mathrm{d}U = \\dfrac12 \\kappa (\\mathrm{d}\\theta)^2,$$

where $$\\kappa$$ is the torque per unit angular displacement of the semicircle. Then

$$\\kappa = \\dfrac{4mgr}{3\\pi}.$$

The angular frequency is

$$\\begin{aligned}
\\omega & = \\sqrt{\\dfrac{\\kappa}{I}} \\\\[8pt]
{} & = \\sqrt{\\dfrac{8g}{3\\pi r}}.
\\end{aligned}$$

The period is

$$\\begin{aligned}
T & = \\dfrac{2\\pi}{\\omega} \\\\[8pt]
{} & = 2\\pi \\sqrt{\\dfrac{3\\pi r}{8g}}.
\\end{aligned}$$`,
  },
  {
    n: 21, correct: 'B', // why: boxed value l < v^2/(2g) matches choice (b).
    statement: `A dumbbell consisting of a massless bar with identical small balls at both ends stands vertically on a smooth level table. A horizontal velocity $$v$$ is imparted to the upper ball by hitting it. What is a necessary condition on the bar length $$\\ell$$ such that the lower ball of the dumbbell loses contact with the table immediately after the upper ball is struck?`,
    choices: {
      A: '$$\\ell > \\dfrac{v^2}{2g}.$$',
      B: '$$\\ell < \\dfrac{v^2}{2g}.$$',
      C: '$$\\ell > \\dfrac{2v^2}{g}.$$',
      D: '$$\\ell < \\dfrac{2v^2}{g}.$$',
      E: '$$\\ell = \\dfrac{v^2}{g}.$$',
    },
    topics: ['Mechanics'],
    tags: ['rotational dynamics', 'center of mass', 'newton\'s laws', 'circular motion'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad \\ell < \\dfrac{v^2}{2g}}$$

Immediately after the ball is struck, the top ball moves to the right at speed $$v$$ while the bottom ball is stationary. The center of mass of the dumbbell moves to the right at speed $$v/2.$$
This means the angular velocity of the system is such that $$\\omega r = v/2$$ so that the bottom dumbbell's velocity, which is the velocity of the center of mass plus its velocity due to the system's rotation, is zero. That gives us

$$\\omega \\dfrac{\\ell}{2} = \\dfrac{v}{2},$$

or

$$\\omega = \\dfrac{v}{\\ell}.$$

If the dumbbell is just at the point of lifting off the table, there is no normal force from the table on the lower ball, so the center of mass accelerates downward at $$g.$$ The acceleration is $$\\omega^2 r,$$ so we have

$$\\omega^2 \\dfrac{\\ell}{2} = g,$$

or, using our equation for $$\\omega$$ and solving for $$\\ell,$$

$$\\ell_{\\mathrm{critical}}= \\dfrac{v^2}{2g}.$$

If $$v$$ were increased, this would also lift the dumbbell off the table, so the condition is

$$\\ell < \\dfrac{v^2}{2g}.$$`,
  },
  {
    n: 22, correct: 'C', // why: no boxed; the solution shows the true area is 612 cm^2 (a 2% error, i.e. 600 +/- 12) and that r's uncertainty cannot be determined without more information -- choice (c).
    statement: `A student receives the information that the length and width of a rectangular piece of paper are:

$$\\ell = 30.0 \\pm 0.3 \\, \\mathrm{cm}$$

$$w = 20.0 \\pm 0.2 \\, \\mathrm{cm}$$

The student uses the sum-of-squares uncertainty rule to report the area of the paper and the ratio of its length to its width:

$$A = \\ell w = 600 \\pm 8 \\, \\mathrm{cm}^2$$

$$r = \\frac{\\ell}{w} = 1.50 \\pm 0.02$$

Next, the student learns that the uncertainty was not due to random measurement error, but due to calibration error. The ruler used to make the measurements can be used to make consistent measurements with only a small random error, but those measurements are incorrect by some fixed percentage which is not known, but estimated to be on the order of $$1\\%.$$ (Perhaps the ruler expands or contracts depending on temperature, and the temperature at the time of the measurements is unknown, but both measurements were made at the same temperature.) Should the student change their reported result, and if so, how?`,
    choices: {
      A: 'Yes; $$A = 600 \\pm 6 \\, \\mathrm{cm}^2$$ and $$r = 1.500 \\pm 0.015$$.',
      B: 'Yes; $$A = 600 \\pm 12 \\, \\mathrm{cm}^2$$ and $$r = 1.50 \\pm 0.03$$.',
      C: 'Yes; $$A = 600 \\pm 12 \\, \\mathrm{cm}^2$$, but the student needs more information to determine the uncertainty in $$r$$.',
      D: 'No; uncertainty analysis formulas apply regardless of the source of uncertainty.',
      E: 'No; each formula uses $$\\ell$$ and $$w$$ only once, so it is appropriate to apply the sum-of-squares rule.',
    },
    topics: ['Mechanics'],
    tags: ['uncertainty propagation', 'error analysis', 'systematic error'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad \\text{Yes; } A = 600 \\pm 12 \\, \\mathrm{cm}^2 \\text{; more information needed for } r}$$

First, as a reminder, the student's original calculation uses the sum-of-squares formula for products,

$$\\frac{\\Delta A}{A} = \\sqrt{\\left(\\frac{\\Delta \\ell}{\\ell}\\right)^2 + \\left(\\frac{\\Delta w}{w}\\right)^2},$$

and the similar formula for ratios. Such sum-of-squares formulas depend on the assumption that the errors in the various inputs are independent -- that is, knowing that one measurement is off in one direction does not make it more or less likely that other measurements are off in that direction. The news about the ruler means this assumption does not hold, so the student has to reconsider.

The general study of non-independent uncertainties is complex, but in this case we can reason by example. Suppose the measurement of $$\\ell$$ was $$0.3 \\, \\mathrm{cm}$$ too small, so that the true length of the paper was $$30.3 \\, \\mathrm{cm}$$. This would imply that the ruler was stretched by $$1\\%$$, so the measurement of $$w$$ should also be $$1\\%$$ too small, and the true width of the paper is $$20.2 \\, \\mathrm{cm}$$. The true area of the paper would be

$$A = 612 \\, \\mathrm{cm}^2.$$

The two $$1\\%$$ errors compound into a $$2\\%$$ error when calculating $$A$$, because scaling an object by a factor $$f$$ scales its area by a factor $$f^2$$. Meanwhile, the true aspect ratio of the paper would be

$$r = 1.50.$$

The two $$1\\%$$ errors cancel! This does not mean that the measurement is exact. While the stretching of the ruler does not cause uncertainty in $$r$$, the measurements were subject to other sources of uncertainty, and the student needs to know their magnitude (and whether they are independent!) to report the uncertainty in $$r$$.`,
  },
  {
    n: 23, correct: 'D', // why: boxed value T = 2mg matches choice (d).
    statement: `A pulley consists of a circle of radius $$R$$ is pivoted about a point a distance $$R/2$$ from the circle's center. A string attaches to a block hanging from the pulley as shown. The coefficient of friction between the string and pulley is infinite. Find the tension in the horizontal part of the string if the system is at rest.`,
    choices: {
      A: '$$\\dfrac12 mg.$$',
      B: '$$mg$$',
      C: '$$\\dfrac32 mg.$$',
      D: '$$2mg$$',
      E: '$$\\sqrt{5}mg.$$',
    },
    figures: [FIG('q23-q1')],
    topics: ['Mechanics'],
    tags: ['torque', 'statics/equilibrium', 'pulleys/tension'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad 2mg}$$

We will find the torque of each force about the pivot point. The moment arm for the torque from the force of tension in the horizontal segment of the string is $$R/2.$$ The moment arm for the force from tension on the vertical part of the string is $$R.$$ The torque from these forces should be equal, so the tension in the horizontal part of the string must be twice as great as in the vertical part of the string, so $$T = 2mg.$$`,
  },
  {
    n: 24, correct: 'A', // why: boxed value T = S_1 S_2/(S_1 - S_2) * (rho g l) matches choice (a).
    statement: `Two weightless disks of areas $$S_1$$ and $$S_2$$ are connected by a thin weightless string of length $$\\ell.$$ The disks are positioned in cylinders with cross-sectional areas $$S_1$$ and $$S_2$$ as shown in the figure. The space between the disks is filled with water of density $$\\rho.$$ The cylinders are oriented vertically and gravitational acceleration is $$g.$$ Both cylinders are open to the atmosphere at pressure $$P_0.$$ Find the tension in the string.`,
    choices: {
      A: '$$T = \\dfrac{S_1S_2}{S_1 - S_2}(\\rho g \\ell).$$',
      B: '$$T = \\rho g \\ell S_2.$$',
      C: '$$T = P_0 S_2.$$',
      D: '$$T = \\dfrac{S_1^2}{S_2}(P_0 - \\rho g \\ell).$$',
      E: '$$T = \\dfrac{S_2^2}{S_1}(\\rho g \\ell).$$',
    },
    figures: [FIG('q24-q1')],
    topics: ['Mechanics'],
    tags: ['fluid statics', 'pressure', 'statics/equilibrium', 'virtual work'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad T = \\dfrac{S_1S_2}{S_1 - S_2}(\\rho g \\ell)}$$

Each disk has three forces on it: pressure from the atmosphere, pressure from the water, and tension from the string. These forces must sum to zero on each disk.

For the top disk, tension and pressure from the atmosphere push downward, while pressure from the water pushes upward. Therefore,

$$P_0 S_1 + T = P_1 S_1,$$

where $$P_1$$ is the pressure of the water at the top disk.

For the bottom disk, tension and pressure from the atmosphere push upward, while pressure from the water pushes down. Therefore,

$$T + P_0 S_2 = P_2S_2,$$

where $$P_2$$ is the pressure from the water at the bottom disk.

Pressure increases with depth, giving

$$P_2 = P_1 + \\rho g h.$$

We can solve these three equations. First, we substitute the third equation into the second to eliminate $$P_2.$$ Then we solve the first equation for $$P_1$$ and plug it into the second equation to eliminate $$P_1.$$ Finally, we solve for the tension in the string. The result is

$$T = \\dfrac{S_1S_2}{S_1 - S_2} \\left(\\rho g \\ell\\right).$$

Alternatively, we can solve the problem using the principle of virtual work:

Suppose that a small volume $$V$$ of water moves from the top of the apparatus to the bottom. The water moves a distance $$\\ell$$, so gravity does work

$$\\rho V g \\ell.$$

The string shortens at the top by a distance $$\\frac{V}{S_1}$$, so at the top the string does work

$$\\frac{V}{S_1} T,$$

and likewise at the bottom it does work

$$-\\frac{V}{S_2} T.$$

The volume of the atmosphere stays constant, so atmospheric pressure does no work. In equilibrium the total work done in the motion is zero:

$$\\rho V g \\ell + \\frac{V}{S_1} T - \\frac{V}{S_2} T = 0,$$

so

$$T = \\left(\\frac{1}{S_2} - \\frac{1}{S_1}\\right)^{-1} \\rho g \\ell.$$`,
  },
  {
    n: 25, correct: 'A', // why: boxed value x_1 = l(1/2 - sqrt(3)/4) ~ 0.0670 l matches choice (a).
    statement: `A massless string of length $$\\ell$$ is fixed at either end and under tension $$T.$$

A mass $$m$$ is attached to the string a distance $$x$$ from the left end. The mass is displaced slightly in the direction perpendicular to the string.

At what value of $$x$$ is the oscillation frequency double the minimum oscillation frequency?`,
    choices: {
      A: '$$0.0670\\ell$$',
      B: '$$0.125\\ell$$',
      C: '$$0.146\\ell$$',
      D: '$$0.25\\ell$$',
      E: '$$0.354\\ell$$',
    },
    topics: ['Mechanics'],
    tags: ['oscillations/SHM', 'springs', 'statics/equilibrium'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad 0.0670\\ell}$$

There are two restoring forces on the mass - one from the left and one from the right. Their horizontal components are both approximately $$T$$ and cancel. Their vertical components are in the same direction.
For small displacements, the vertical component of the force from the string is $$T\\theta,$$ where $$\\theta$$ is the angle above the horizontal that the string makes. This gives us

$$F_{\\mathrm{restore}} = T \\dfrac{y}{x} + T \\dfrac{y}{\\ell-x},$$

where $$y$$ is the displacement of the ball from equilibrium. This gives an effective spring constant

$$\\begin{aligned}
k_{\\mathrm{eff}} & = \\dfrac{F_{\\mathrm{restore}}}{y} \\\\[8pt]
{} & = T\\dfrac{\\ell}{x(\\ell-x)}.
\\end{aligned}$$

The angular frequency is

$$\\begin{aligned}
\\omega & = \\sqrt{\\dfrac{k}{m}} \\\\[8pt]
{} & = \\sqrt{\\dfrac{T\\ell}{mx(\\ell-x)}}.
\\end{aligned}$$

The minimum $$\\omega$$ occurs when $$x(\\ell-x)$$ takes on its maximum value. This is a quadratic whose maximum occurs at $$x = \\dfrac{\\ell}{2},$$ so the minimum frequency is when the mass is in the center of the string.
The ratio of two oscillation frequencies is

$$\\dfrac{\\omega_1}{\\omega_2} = \\sqrt{\\dfrac{x_2(\\ell-x_2)}{x_1(\\ell-x_1)}}.$$

In this case, we have

$$\\dfrac{\\omega_1}{\\omega_2} = 2$$

 and

$$x_2 = \\dfrac{\\ell}{2}.$$

Substituting these values in, we have

$$2 = \\sqrt{\\dfrac{(\\ell/2)(\\ell/2)}{x_1(\\ell-x_1)}}.$$

This is a quadratic equation in $$x_1$$ with the solutions

$$x_1 = \\ell \\left(\\dfrac12 - \\dfrac{\\sqrt{3}}{4}\\right) \\approx 0.0670\\,\\ell,$$

$$x_1 = \\ell \\left(\\dfrac12 + \\dfrac{\\sqrt{3}}{4}\\right) \\approx 0.9330\\,\\ell.$$

There are two solutions simply because the mass can be displaced $$0.0670 \\ell$$ either from the left or from the right and have the same frequency.`,
  },
]
