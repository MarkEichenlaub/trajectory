// Digitized PhysicsWOOT 2 Practice F=ma Exam 2. Source: AoPS crypt collection 191, document 11254.
//
// Notes on this exam:
// - Q7's five answer options are drawn INSIDE the statement's [asy] figures
//   (labelled A-E), so `choices` is null in the parsed input. Per the spec the
//   choices are rendered as '(a)'..'(e)' and all six statement figures (the x(t)
//   plot plus the five candidate v(t) graphs) are listed in `figures`.
// - Q8 is the same shape but the source did supply an enumerate of literal
//   letters A-E; its five option graphs are statement figures q08-q1..q08-q5.
// - 7 questions have no \boxed at all (Q2, Q7, Q8, Q9, Q10, Q14, Q20); for
//   those the letter comes from the solution's concluding sentence/equation.
// - Source typo: Q11 choice (c) is written "$\sqrt{3}{2}M$" in the LaTeX, which
//   is almost certainly meant to be $\frac{\sqrt{3}}{2}M$. Reproduced faithfully
//   as \dfrac{\sqrt{3}}{2}M since that is clearly the intent; it is not the
//   answer either way.
// - Source slip: Q25's solution drops a factor of 2 between the inequality
//   "TN dL/L > F/2" and "N T F^2/(4T'^2) > F". The boxed result N > 4T/F is
//   still one of the choices and is what the exam intends.

const FIG = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-pwoot2-p2/fma-pwoot2-p2-${n}.png`

export const examId = 'fma-pwoot2-p2'
export const questions = [
  {
    n: 1, correct: 'E',
    statement: `A rigid rod with a point mass at the end can pivot freely around the opposite end, forming a physical pendulum. The rod initially hangs straight down, then the point mass is given some sideways velocity $$v,$$ setting the pendulum into motion.

How does the period of the pendulum's motion depend on $$v?$$ Give an answer using Newtonian mechanics only.`,
    choices: {
      A: 'The period is independent of $$v.$$',
      B: 'The period increases with $$v.$$',
      C: 'The period increases with $$v$$ to some finite maximum, then decreases asymptotically to zero.',
      D: 'The period increases with $$v$$ to infinity, then decreases to some positive asymptote.',
      E: 'The period increases with $$v$$ to infinity, then decreases asymptotically to zero.',
    },
    topics: ['Mechanics'], tags: ['oscillations', 'pendulum', 'energy'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{increases to infinity, then to zero}}$$

For small $$v,$$ the pendulum oscillates back and forth, so its period increases. (The often-quoted result that the period of a pendulum is independent of its amplitude is only an approximation; in fact the period increases with amplitude for small amplitudes. Indeed, the increase in period is first-order in $$v.$$) In this regime, the pendulum reaches some maximum angle $$\\theta(v).$$ When $$\\theta(v) = \\pi,$$ the period increases to infinity because the pendulum can balance vertically at this angle. As $$v$$ continues to increase, rather than oscillate back and forth, the pendulum rotates in circles. The higher $$v,$$ the faster the circles, with a lower bound only of zero as the pendulum speed increases. So the period increases with $$v$$ to infinity, then decreases asymptotically to zero.`,
  },
  {
    n: 2, correct: 'D', // why: no boxed; solution ends "F \approx 53 N", matching choice D
    statement: `A uniform lever with a mass of $$10 \\;\\mathrm{kg}$$ leans on a prop $$25 \\;\\mathrm{cm}$$ from its left end. The lever can rotate about the prop but cannot slide left or right relative to it. The lever is $$1 \\;\\mathrm{m}$$ long. A weight with a mass of $$2 \\;\\mathrm{kg}$$ is suspended from the left end of the lever. What force must be applied at the right end at an angle of $$30^\\circ$$ above the horizontal so that the lever is in equilibrium?`,
    choices: {
      A: '$$6.7 \\;\\mathrm{N}$$',
      B: '$$27 \\;\\mathrm{N}$$',
      C: '$$35 \\;\\mathrm{N}$$',
      D: '$$53 \\;\\mathrm{N}$$',
      E: '$$60 \\;\\mathrm{N}$$',
    },
    figures: [FIG('q02-q1')],
    topics: ['Mechanics'], tags: ['statics', 'torque', 'rigid bodies'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad 53 \\;\\mathrm{N}}$$

Calculated about the prop, there are three torques on the lever. There is a torque from the mass hanging off the left, there's a torque from gravity, and there's a torque from the force on the right. These torques must sum to zero for the lever to be in equilibrium.

Gravity can be thought of as a force of $$100 \\;\\mathrm{N}$$ acting $$25 \\;\\mathrm{cm}$$ to the right of the prop. The mass is a force of $$20 \\;\\mathrm{N}$$ acting $$25 \\;\\mathrm{cm}$$ to the left of the prop. The net is $$80 \\;\\mathrm{N}$$ acting downward to the right of the prop at a distance of $$25 \\;\\mathrm{cm}.$$

The torque from the force at the right end of the lever is $$F \\cdot 75 \\;\\mathrm{cm} \\cdot \\sin(30^\\circ).$$ This must balance the net torque from the other two forces, so

$$F \\cdot 75 \\;\\mathrm{cm} \\cdot \\dfrac12 = 80 \\;\\mathrm{N} \\cdot 25 \\;\\mathrm{cm}.$$

Solving for $$F,$$ we get

$$F \\approx 53 \\;\\mathrm{N}.$$`,
  },
  {
    n: 3, correct: 'D',
    statement: `A massless rope is thrown over a fixed, horizontal beam and fastened to a mass $$m = 6 \\;\\mathrm{kg}.$$ The minimum force required to keep the mass from falling is $$F_1 = 40 \\;\\mathrm{N}.$$ What is the minimum force $$F_2$$ required to pull the mass upward?`,
    choices: {
      A: '$$40 \\;\\mathrm{N}$$',
      B: '$$60 \\;\\mathrm{N}$$',
      C: '$$80 \\;\\mathrm{N}$$',
      D: '$$90 \\;\\mathrm{N}$$',
      E: '$$100 \\;\\mathrm{N}$$',
    },
    figures: [FIG('q03-q1')],
    topics: ['Mechanics'], tags: ['friction', 'pulleys/tension', 'dimensional analysis'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad 90 \\;\\mathrm{N}}$$

We begin by analyzing the situation where the force is minimal to hold the mass up.

The mass has a weight of $$60 \\;\\mathrm{N},$$ so the tension in the rope above the mass is $$60 \\;\\mathrm{N}$$ when the mass is not accelerating.

The problem tells us that the force on the left required to hold the mass up is only $$40 \\;\\mathrm{N},$$ so the tension is $$40 \\;\\mathrm{N}$$ on the left side of the rope.

This means there must be a frictional force of $$20 \\;\\mathrm{N}$$ on the rope holding the mass up. We note especially that the tension in the right hand side of the rope is $$1.5$$ times the tension on the left.

Next, we imagine increasing the force on the rope until the mass is about to slip. The situation is similar to the previous one in that the forces are unequal and the situation is static. However, in this case the force on the left is greater than the force on the right.

One might initially guess that friction on the rope from the pulley is unchanged in magnitude, but this is not correct. The tension in the rope is greater in this scenario, meaning that the pulley exerts a greater normal force on the rope, and tension can be greater.

The magnitude of the friction force is not the same. What is the same is the fraction by which the force on one side of the pulley can be greater than the other without inducing slipping. This fraction, as previously noted is $$1.5,$$ so that the maximum tension in the right hand side is $$60 \\;\\mathrm{N}\\cdot 1.5 = 90 \\;\\mathrm{N}.$$

One way to justify that it is the ratio of force between left and right that determines when there will be slipping, not the absolute difference between the forces, is dimensional analysis. Given just the rope and beam and gravitational acceleration, there are no dimensions of mass, and therefore no force (which has mass dimensions) can be a property of the rope-pulley system. It must be a ratio of forces that characterizes slipping.

To double-check this answer, in the first scenario, the average tension in the rope was $$50 \\;\\mathrm{N}.$$ In the second scenario, it is $$75 \\;\\mathrm{N}.$$ This means the tension in the rope was $$1.5$$ times greater in the second scenario. That means the friction is $$1.5$$ times greater as well. This aligns with our calculation of the frictional forces: $$20 \\;\\mathrm{N}$$ in the first scenario and $$30 \\;\\mathrm{N}$$ in the second scenario.`,
  },
  {
    n: 4, correct: 'B', // why: boxed value "106 m" matches choice B
    statement: `An artificial satellite travels in a circular orbit at $$500 \\;\\mathrm{km}$$ above the Earth's surface. The satellite's period is found to decrease by $$2.0 \\;\\mathrm{s}$$ per day. About how much altitude does the satellite lose per orbit? The radius of Earth is $$6.37 \\times 10^6 \\;\\mathrm{m}.$$ The mass of Earth is $$5.972 \\times 10^{24} \\;\\mathrm{kg}.$$`,
    choices: {
      A: '$$67 \\;\\mathrm{m}$$',
      B: '$$106 \\;\\mathrm{m}$$',
      C: '$$150 \\;\\mathrm{m}$$',
      D: '$$1.7 \\;\\mathrm{km}$$',
      E: '$$28 \\;\\mathrm{km}$$',
    },
    topics: ['Mechanics'], tags: ['gravitation', 'orbits', 'uncertainty'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad 106 \\;\\mathrm{m}}$$

The period of the satellite obeys Kepler's third law,

$$\\tau \\propto r^{3/2}.$$

We want to know how small changes in $$r$$ correspond to small changes in $$\\tau,$$ a job done by the error propagation formulas.

Applying the error propagation formulas, we see

$$\\dfrac{\\delta \\tau}{\\tau} \\approx \\dfrac32 \\dfrac{\\delta r}{r}.$$

Solving for $$\\delta r,$$

$$\\delta r \\approx \\dfrac23 r \\dfrac{\\delta \\tau}{\\tau}.$$

This is per orbit. If there are $$N$$ orbits per day, then $$\\delta \\tau = 2.0 \\;\\mathrm{s}/N$$ and $$\\tau = 1 \\;\\mathrm{day}/N.$$ This means

$$\\begin{aligned}
\\dfrac{\\delta \\tau}{\\tau} & = \\dfrac{2.0 \\;\\mathrm{s}/N}{\\mathrm{day}/N} \\\\[8pt]
{} & = \\dfrac{2.0}{8.64 \\times 10^4}.
\\end{aligned}$$

We have

$$\\begin{aligned}
\\delta r & \\approx \\dfrac23 \\cdot 6.87 \\times 10^6 \\;\\mathrm{m} \\cdot \\dfrac{2.0}{8.64 \\times 10^4} \\\\
{} & = 106 \\;\\mathrm{m}.
\\end{aligned}$$`,
  },
  {
    n: 5, correct: 'B', // why: boxed value 2m/M matches choice B
    statement: `A large mass $$M$$ moving to the right collides elastically with a stationary mass $$m.$$ Which expression gives the fractional decrease in the speed of the large mass in the limit $$m\\ll M?$$`,
    choices: {
      A: '$$\\dfrac{m}{2M}$$',
      B: '$$\\dfrac{2m}{M}$$',
      C: '$$\\dfrac{M}{2m}$$',
      D: '$$\\dfrac{2M}{m}$$',
      E: 'none of these',
    },
    topics: ['Mechanics'], tags: ['collisions', 'momentum', 'reference frames'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad \\dfrac{2m}{M}}$$

In the frame of the large mass, the small mass approaches with speed $$v$$ and bounces off, changing its momentum by $$2mv.$$ So in the original frame, the large mass decreases its momentum from $$Mv$$ to $$Mv - 2mv.$$ Dividing by the mass, the large mass slows from $$v$$ to $$v - 2\\dfrac{m}{M}v.$$ So the mass slows by a fraction $$\\dfrac{2m}{M}.$$`,
  },
  {
    n: 6, correct: 'B', // why: boxed value 45 W matches choice B
    statement: `A cyclist travelling on a straight road at $$5 \\;\\mathrm{m/s}$$ on a calm day is subject to air resistance proportional to the square of the apparent wind speed. The cyclist exerts $$20 \\;\\mathrm{W}$$ to overcome wind drag. Approximately what power must they exert against wind drag to maintain the same speed if there is a $$10 \\;\\mathrm{m/s}$$ crosswind? (A crosswind blows perpendicular to the road, in the road's frame.)`,
    choices: {
      A: '$$20 \\;\\mathrm{W}$$',
      B: '$$45 \\;\\mathrm{W}$$',
      C: '$$60 \\;\\mathrm{W}$$',
      D: '$$100 \\;\\mathrm{W}$$',
      E: '$$180 \\;\\mathrm{W}$$',
    },
    solutionFigures: [FIG('q06-s1')],
    topics: ['Mechanics'], tags: ['drag', 'work-energy theorem', 'vectors'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad 45 \\;\\mathrm{W}}$$

In the first situation, the force on the cyclist is

$$\\begin{aligned}
F_1 & = c v^2 \\\\
{} & = c (25 \\;\\mathrm{m^2/s^2}).
\\end{aligned}$$

In the second situation, the cyclist experiences a wind with velocity

$$\\begin{aligned}
v & = \\sqrt{5^2 + 10^2}\\;\\mathrm{m/s} \\\\
{} & = 5\\sqrt{5} \\;\\mathrm{m/s}.
\\end{aligned}$$

The force experienced by the cyclist is

$$\\begin{aligned}
F_2 & = cv^2 \\\\
{} & = c(125 \\;\\mathrm{m^2/s^2}) \\\\
{} & = 5F_1.
\\end{aligned}$$

The component of force in the cyclist's direction of motion is

$$\\begin{aligned}
F_{\\mathrm{motion}} & = F_2 \\dfrac{5 \\;\\mathrm{m/s}}{\\sqrt{125} \\;\\mathrm{m/s}} \\\\
{} & = \\sqrt{5}F_1.
\\end{aligned}$$

Because the force in the direction of motion is $$\\sqrt{5}$$ times as great, the cyclist must exert this many times the power, or about $$45 \\;\\mathrm{W}.$$`,
  },
  {
    n: 7, correct: 'C', // why: no boxed; the five options are drawn in the statement figure, and the solution concludes "This corresponds to choice (C)."
    statement: `A particle moves in one dimension under the influence of a force which depends only on its position. Its position $$x$$ as a function of time $$t$$ is plotted (accurately) in the first graph below.

Which of the following shows the velocity of the particle as a function of time? The five candidate graphs are shown below, labelled A through E in order.`,
    choices: { A: '(a)', B: '(b)', C: '(c)', D: '(d)', E: '(e)' },
    figures: [FIG('q07-q1'), FIG('q07-q2'), FIG('q07-q3'), FIG('q07-q4'), FIG('q07-q5'), FIG('q07-q6')],
    topics: ['Mechanics'], tags: ['graph interpretation', 'kinematics-1d', 'energy'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad \\text{graph C}}$$

We can rule out (E) immediately; the velocity should be negative until just before $$3 \\, \\mathrm{s}.$$ ((E) actually shows the acceleration of the particle.)

Next, let's look at the overall scale of the velocity. The particle travels about $$-9 \\, \\mathrm{m}$$ in the first $$3 \\, \\mathrm{s}$$, so its average velocity during this time should be about $$-3 \\, \\mathrm{m/s}.$$ This rules out (B) and (D). (These choices are identical to (A) and (C) but with an incorrect axis scale.)

Distinguishing between (A) and (C) requires a closer inspection of the graph; $$x$$ is a somewhat steeper function of $$t$$ near $$3 \\, \\mathrm{s}$$ than near $$5 \\, \\mathrm{s}$$, so the velocity should be greater near $$3 \\, \\mathrm{s}.$$ This corresponds to choice (C).`,
  },
  {
    n: 8, correct: 'E', // why: no boxed; solution concludes "This corresponds to choice (E)."
    statement: `Which of the following could show the potential energy of the particle in problem (7) as a function of $$x$$? The five candidate graphs are shown below, labelled A through E in order.`,
    choices: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
    figures: [FIG('q08-q1'), FIG('q08-q2'), FIG('q08-q3'), FIG('q08-q4'), FIG('q08-q5')],
    topics: ['Mechanics'], tags: ['graph interpretation', 'potential energy', 'energy'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{graph E}}$$

We can rule out (A-C) immediately; the particle experiences a bound motion and the potential energy should therefore be large on both sides. ((A-C) actually show variations on the force on the particle.)

To distinguish between (D) and (E), observe that the particle moves faster near $$x = 2 \\, \\mathrm{m}$$ than near $$x = 8 \\, \\mathrm{m}.$$ This means its kinetic energy is larger there, so its potential energy should be smaller. This corresponds to choice (E).`,
  },
  {
    n: 9, correct: 'B', // why: no boxed; solution's final line is "m = 0.5 kg", matching choice B
    statement: `Assuming the answer to problem (8) is in fact the potential energy function, what is the mass of the particle?`,
    choices: {
      A: '$$0.25 \\;\\mathrm{kg}$$',
      B: '$$0.5 \\;\\mathrm{kg}$$',
      C: '$$1 \\;\\mathrm{kg}$$',
      D: '$$2 \\;\\mathrm{kg}$$',
      E: '$$4 \\;\\mathrm{kg}$$',
    },
    topics: ['Mechanics'], tags: ['energy', 'graph interpretation', 'potential energy'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad 0.5 \\;\\mathrm{kg}}$$

There are various approaches here, all requiring us to read the graphs quantitatively. Probably the most straightforward one is to compare the potential energy of the particle at two points. For example, at $$x = 2 \\, \\mathrm{m}$$ the potential energy is $$U = 0 \\, \\mathrm{J}$$ and the particle's speed is $$v = 6 \\, \\mathrm{m/s}$$; at $$x = 8 \\, \\mathrm{m}$$ the potential energy is $$U = 5 \\, \\mathrm{J}$$ and the particle's speed is $$4 \\, \\mathrm{m/s}.$$ So from conservation of energy,

$$U + \\frac{1}{2} m v^2 = \\mathrm{const.}$$

Comparing the two points,

$$0 \\, \\mathrm{J} + \\frac{1}{2} m (6 \\, \\mathrm{m/s})^2 = 5 \\, \\mathrm{J} + \\frac{1}{2} m (4 \\, \\mathrm{m/s})^2,$$

which gives

$$m = 0.5 \\, \\mathrm{kg}.$$

(Reading the potential energy graph at the plateaus is probably more accurate than reading it at other points, but the answer choices are selected to be forgiving of moderate reading errors, anyway.)`,
  },
  {
    n: 10, correct: 'B', // why: no boxed; solution's final line is "T = 86164.1 s", matching choice B
    statement: `It is commonly noted that the effective gravity on Earth's surface includes effects due to the motion of the Earth. The largest such effect is the centrifugal acceleration due to the rotation of the Earth,

$$a_c = \\left(\\frac{2 \\pi}{T}\\right)^2 r$$

where $$r$$ is the distance to the Earth's axis.

Which of the following gives the best value for $$T$$? (Hint: $$24 \\, \\mathrm{hr} = 86400 \\, \\mathrm{s}$$, and there are $$365.24$$ days in a year. The Earth's angular momentum due to its spin and due to its rotation around the Sun are less than $$90 ^\\circ$$ apart. A diagram may be helpful.)`,
    choices: {
      A: '$$T = 86163.4 \\, \\mathrm{s}$$',
      B: '$$T = 86164.1 \\, \\mathrm{s}$$',
      C: '$$T = 86400.0 \\, \\mathrm{s}$$',
      D: '$$T = 86636.6 \\, \\mathrm{s}$$',
      E: '$$T = 86637.2 \\, \\mathrm{s}$$',
    },
    solutionFigures: [FIG('q10-s1'), FIG('q10-s2')],
    topics: ['Mechanics'], tags: ['reference frames', 'circular motion', 'astronomy'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad T = 86164.1 \\, \\mathrm{s}}$$

Perhaps surprisingly, there are no tricky dynamics here; we do simply want the period of the Earth's rotation. But that period is not exactly 24 hours!

To see this, suppose that the Earth were not rotating at all, and consider its orbital motion around the Sun:

From the point of view of an observer on Earth, the orbital motion causes exactly one sunrise and sunset per year. More generally, over the course of a year, the number of rotations of the Earth (in an inertial reference frame) differs from the number of sunrises and sunsets (solar days) by exactly one.

To find the sign of the difference, we need to use the fact that the orbital and spin motions of the Earth have the same handedness. Here's one full (inertial) rotation of the Earth, with the orbital motion exaggerated:

In the left picture, it is noon for the observer indicated by the black dot. By the right picture, when the Earth has made a full rotation, it is not quite noon yet. Therefore, there are fewer solar days in a year than rotations of the Earth; there are 365.24 solar days and 366.24 rotations. The wall-clock day of $$86400 \\, \\mathrm{s}$$ relates to the apparent motion of the Sun and is therefore a solar day. Thus,

$$\\begin{aligned}
1 \\, \\mathrm{year} & = 365.24 \\cdot 86400 \\, \\mathrm{s} \\\\
{} & = 366.24 \\cdot T,
\\end{aligned}$$

so

$$T = 86164.1 \\, \\mathrm{s}.$$

This time is called a sidereal day.`,
  },
  {
    n: 11, correct: 'A', // why: boxed value "m = M" matches choice A
    statement: `A circular hoop is fixed in space. There are two massless, frictionless rings on the hoop. A string passes through the rings. Masses $$M$$ are attached to either end of the string, and a mass $$m$$ is attached to its center. If the rings are in equilibrium when they are $$30^\\circ$$ from vertical, what is $$m?$$`,
    choices: {
      A: '$$M$$',
      B: '$$2M$$',
      C: '$$\\dfrac{\\sqrt{3}}{2}M$$',
      D: '$$\\dfrac12 M$$',
      E: '$$\\sqrt{3}M$$',
    },
    figures: [FIG('q11-q1')],
    topics: ['Mechanics'], tags: ['statics', 'pulleys/tension', 'free-body diagrams'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad M}$$

First we examine an individual ring. There are two forces from tension on it. These two forces have the same magnitude, so they must be at equal angles from the line from the ring to the center of the hoop. This means the mass $$m$$ hangs down $$30^\\circ$$ below the horizontal.

Balancing vertical forces on the mass $$m,$$

$$2T\\sin\\theta = mg,$$

where $$\\theta = 30^\\circ$$ and $$T = Mg.$$

Substituting these in,

$$m = M.$$`,
  },
  {
    n: 12, correct: 'B', // why: boxed value "129 km" is closest to choice B (100 km)
    statement: `In a certain cartoon series, half of the moon is destroyed in a freak accident; the moon appears as a hemisphere for the remainder of the series. While a real moon is not a single piece of rock, suppose the moon in the series is a monolithic rock with density $$3 \\ \\mathrm{g}/\\mathrm{cm}^3$$ and compressive and tensile strength $$10 \\, \\mathrm{MPa}$$. Which of the following is the best estimate for its maximum possible diameter, given that it does not collapse under its own weight? (For comparison, the diameter of Earth's moon is $$3500 \\, \\mathrm{km}$$.)`,
    choices: {
      A: '$$1 \\, \\mathrm{km}$$',
      B: '$$100 \\, \\mathrm{km}$$',
      C: '$$10^4 \\, \\mathrm{km}$$',
      D: '$$10^6 \\, \\mathrm{km}$$',
      E: '$$10^8 \\, \\mathrm{km}$$',
    },
    topics: ['Mechanics'], tags: ['dimensional analysis', 'estimation', 'gravitation'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad 100 \\, \\mathrm{km}}$$

A full analysis of the stresses in the moon is, of course, beyond the scope of the problem; we hope to get within a factor of $$100$$ simply by dimensional analysis. The maximum stress in the moon should depend on its diameter $$d$$, its density $$\\rho$$, and the universal gravitational constant $$G$$:

$$\\sigma \\sim d^\\alpha \\rho^\\beta G^\\gamma.$$

The only dimensionally correct solution is

$$\\sigma \\sim G \\rho^2 d^2.$$

Note that this formula passes simple reasonableness checks: we expect the stress to increase as the moon gets denser and as it gets larger.

We can also arrive at this formula using a conceptual model: suppose that two masses of density $$\\rho$$ and volume $$d^3$$ are separated by a distance $$d$$ by a structural element of area $$d^2.$$ Then the force between the masses due to gravity is

$$F \\sim \\frac{G (\\rho d^3)^2}{d^2},$$

and the compressive force in the structural element is

$$F \\sim \\sigma d^2.$$

Equating these,

$$\\sigma d^2 \\sim \\frac{G (\\rho d^3)^2}{d^2},$$

which yields the same result.

In any event, given a maximum stress $$\\sigma$$ the maximum diameter is

$$d \\sim \\frac{\\sqrt{\\sigma}}{\\rho \\sqrt{G}}.$$

Using the given values, the right side equals $$129 \\, \\mathrm{km}.$$`,
  },
  {
    n: 13, correct: 'D', // why: boxed value "A_2/A_1 = 2" matches choice D
    statement: `Three carts of equal mass rest on an incline. The bottom two carts are connected via inextensible strings. The top cart is connected to a spring. The incline is frictionless. The system is initially at rest. If the lower string is cut, releasing the bottom cart, the remaining two carts oscillate with amplitude $$A_1.$$ If the upper string is cut, the remaining top cart oscillates with amplitude $$A_2.$$ Find $$\\dfrac{A_2}{A_1}.$$`,
    choices: {
      A: '$$\\dfrac12$$',
      B: '$$1$$',
      C: '$$\\sqrt{2}$$',
      D: '$$2$$',
      E: '$$4$$',
    },
    figures: [FIG('q13-q1')],
    topics: ['Mechanics'], tags: ['oscillations', 'springs', 'inclined planes'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad 2}$$

The carts will oscillate around their equilibrium point, so the amplitude of the oscillation is the distance from the equilibrium point when there are three carts to the equilibrium point when there are two or one carts, depending in which string is cut.

The equilibrium occurs when

$$nmg\\sin\\theta = kx,$$

with $$n$$ the number of carts, $$k$$ the spring constant, and $$x$$ the extension of the spring.

Cutting one cart off the system moves the equilibrium by $$\\dfrac{mg\\sin\\theta}{k}$$ and cutting another cart off moves it by the same amount. So when two carts are cut, the amplitude of oscillations is twice as great, and $$\\dfrac{A_2}{A_1} = 2.$$`,
  },
  {
    n: 14, correct: 'E', // why: no boxed; solution says Alpher plots T vs sqrt(l) (option c), Bethe's manipulation gives l vs T^2 (option b), Gamow plots log T vs log l (option a) => "Alpher - c; Bethe - b; Gamow - a"
    statement: `Alpher, Bethe, and Gamow perform an experiment on the simple pendulum, whose period of small oscillations is of course

$$T = 2 \\pi \\sqrt{\\frac{\\ell}{g}}$$

The experimenters vary $$\\ell$$ and measure $$T$$. It's 1948 and they have to analyze their data by hand, so they want to plot it in such a way that the result is a straight line. Each experimenter has doubts about a different aspect of their experiment:

- Alpher is worried about reaction time when stopping the timer.

- Bethe is worried about the meter stick, which is worn at one end.

- Gamow can't remember if $$T$$ is proportional to $$1 / \\sqrt{\\ell}$$, $$\\ell$$, or perhaps $$\\ell^2$$, instead of $$\\sqrt{\\ell}$$.

Here are some options for plotting the data. (All three produce a straight line if the theoretical relationship holds perfectly.)

a. Plot $$\\log T$$ versus $$\\log \\ell$$.

b. Plot $$\\ell$$ versus $$T^2$$.

c. Plot $$T$$ versus $$\\sqrt{\\ell}$$.

Which option should each experimenter choose?`,
    choices: {
      A: 'Alpher - b; Bethe - c; Gamow must make multiple plots.',
      B: 'Alpher - c; Bethe - b; Gamow must make multiple plots.',
      C: 'Alpher - c; Bethe - c; Gamow - c',
      D: 'Alpher - b; Bethe - c; Gamow - a',
      E: 'Alpher - c; Bethe - b; Gamow - a',
    },
    topics: ['Mechanics'], tags: ['uncertainty', 'graph interpretation', 'oscillations'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad \\text{Alpher - c; Bethe - b; Gamow - a}}$$

Each experimenter's concern can be expressed as a modification to the theoretical expression, which we can then manipulate to obtain a linear form $$y = a x + b.$$ Alpher's concern corresponds to an offset $$\\Delta T$$ in the measured period:

$$T + \\Delta T = 2 \\pi \\sqrt{\\frac{\\ell}{g}},$$

or

$$T = \\frac{2 \\pi}{\\sqrt{g}} \\sqrt{\\ell} - \\Delta T.$$

Bethe's concern corresponds to an offset $$\\Delta \\ell$$ in the measured length:

$$T = 2 \\pi \\sqrt{\\frac{\\ell + \\Delta \\ell}{g}},$$

or

$$\\ell = \\frac{g}{(2 \\pi)^2} T^2 - \\Delta \\ell.$$

This implies Alpher should choose to plot $$T$$ versus $$\\sqrt{\\ell}.$$

Gamow's concern corresponds to an unknown exponent $$n$$ on $$\\ell$$ (and presumably some constants other than $$g$$ that keep the equation dimensionally correct):

$$T = k \\ell^n,$$

so

$$\\log T = n \\log \\ell + \\log k.$$

Gamow should plot $$\\log T$$ versus $$\\log \\ell.$$

(Note that the problem is intentionally vague about whether the log in question is natural or common; it doesn't matter!)`,
  },
  {
    n: 15, correct: 'B', // why: boxed value sqrt(3k/m) matches choice B
    statement: `Three masses of mass $$m$$ on a frictionless table are connected by three springs with spring constant $$k$$ and rest length $$L$$, forming an equilateral triangle with side length $$L$$. The masses are pulled apart such that each of the springs is elongated by $$\\Delta x$$. Then, all three masses are simultaneously released from rest. What is the angular frequency of the resulting oscillations?`,
    choices: {
      A: '$$\\sqrt{\\dfrac{k}{m}}$$',
      B: '$$\\sqrt{\\dfrac{3k}{m}}$$',
      C: '$$\\sqrt{\\dfrac{\\sqrt{3}k}{m}}$$',
      D: '$$\\sqrt{\\dfrac{\\sqrt{3}k}{2m}}$$',
      E: '$$\\sqrt{\\dfrac{k}{2m}}$$',
    },
    topics: ['Mechanics'], tags: ['oscillations', 'springs', 'symmetry'],
    solution: `$$\\boxed{\\mathrm{(b)} \\quad \\sqrt{\\dfrac{3k}{m}}}$$

The tension in each spring is $$k\\Delta x.$$ Examining an individual mass, there are two forces on it - each tension from a spring. The forces each make an angle of $$30^\\circ$$ with the direction of acceleration of the mass, so their components in the direction of acceleration are each $$\\dfrac{\\sqrt{3}}{2}k\\Delta x.$$ Because there are two springs, the net force on the mass is $$\\sqrt{3}k\\Delta x.$$

The distance moved by the mass is $$\\dfrac{\\Delta x}{\\sqrt{3}},$$ so the effective spring constant on the mass is $$3k.$$ That makes the angular frequency

$$\\omega = \\sqrt{\\dfrac{3k}{m}}.$$`,
  },
  {
    n: 16, correct: 'D', // why: boxed value x = L sqrt(M/(12m)) matches choice D
    statement: `A rod of mass $$M$$ and length $$L$$ is anchored at its midpoint and a weight of mass $$m$$ is taped onto it $$x$$ below the midpoint. If the rod is displaced slightly and released, it will undergo small oscillations. What value of $$x$$ minimizes the period of these oscillations? All dimensions other than $$x$$ and $$L$$ can be ignored.`,
    choices: {
      A: '$$L/2$$',
      B: '$$L$$',
      C: '$$L \\left(\\dfrac{M}{12m}\\right)^2$$',
      D: '$$L \\sqrt{\\dfrac{M}{12m}}$$',
      E: '$$L \\dfrac{M}{12m}$$',
    },
    figures: [FIG('q16-q1')],
    topics: ['Mechanics'], tags: ['oscillations', 'rotational inertia', 'optimization'],
    solution: `$$\\boxed{\\mathrm{(d)} \\quad L \\sqrt{\\dfrac{M}{12m}}}$$

The moment of inertia of the rod about its pivot is

$$I = \\dfrac{1}{12} ML^2 + mx^2.$$

If the rod is displaced slightly, the torque on it due to gravity is

$$\\tau \\approx mgx\\theta.$$

The angular frequency will be highest when we maximize $$\\dfrac{\\tau}{I},$$ or when we maximize

$$\\dfrac{mx}{\\dfrac{1}{12}ML^2 + mx^2}.$$

We can simply choose $$M = 1,$$ $$m = 1,$$ and $$L = 1$$ and see which answer choices yields the highest ratio; the answer is $$x = L\\sqrt{\\dfrac{M}{12 m}}.$$`,
  },
  {
    n: 17, correct: 'E', // why: boxed value 500,000,000 kg matches choice E
    statement: `The up-and-coming space program of WOOTLand has developed a rocket capable of accelerating a $$1 \\, \\mathrm{kg}$$ object to $$1000 \\, \\mathrm{m}/\\mathrm{s}$$. The initial mass of this rocket, including the accelerated object, is $$5 \\, \\mathrm{kg}$$. The rocket design is highly scalable; there is also a $$50 \\, \\mathrm{kg}$$ rocket which accelerates a $$10 \\, \\mathrm{kg}$$ object to the same speed, and so on. WOOTLand uses a combination of these rockets to launch their first (tiny!) satellite of mass $$10 \\, \\mathrm{kg}$$ to Earth escape velocity, approximately $$11000 \\, \\mathrm{m}/\\mathrm{s}$$. Which of the following is closest to the total rocket mass required?`,
    choices: {
      A: '$$500 \\;\\mathrm{kg}$$',
      B: '$$1000 \\;\\mathrm{kg}$$',
      C: '$$5000 \\;\\mathrm{kg}$$',
      D: '$$50\\,000 \\;\\mathrm{kg}$$',
      E: '$$500\\,000\\,000 \\;\\mathrm{kg}$$',
    },
    topics: ['Mechanics'], tags: ['rocket equation', 'momentum', 'reference frames'],
    solution: `$$\\boxed{\\mathrm{(e)} \\quad 500\\,000\\,000 \\;\\mathrm{kg}}$$

The last rocket, which accelerates the $$10 \\, \\mathrm{kg}$$ satellite from $$10000 \\, \\mathrm{m}/\\mathrm{s}$$ to $$11000 \\, \\mathrm{m}/\\mathrm{s}$$, has a total mass of only $$50 \\, \\mathrm{kg}.$$ So how bad can it be?

The key observation is that each rocket accelerates its payload to $$1000 \\, \\mathrm{m}/\\mathrm{s}$$ in the reference frame where it is initially at rest. Therefore the entire $$50 \\, \\mathrm{kg}$$ rocket has to be moving at $$10000 \\, \\mathrm{m}/\\mathrm{s}$$ in order to accomplish its mission; the WOOTLand rocket that accelerates it from $$9000 \\, \\mathrm{m}/\\mathrm{s}$$ to $$10000 \\, \\mathrm{m}/\\mathrm{s}$$ has a total mass of $$250 \\;\\mathrm{kg}.$$ The previous stage (from $$8000 \\, \\mathrm{m}/\\mathrm{s}$$ to $$9000 \\, \\mathrm{m}/\\mathrm{s}$$) has a total mass of $$1250 \\;\\mathrm{kg}$$, and so on. We see that the total mass required for $$N$$ stages is

$$10 \\, \\mathrm{kg} \\cdot 5^N.$$

We need

$$\\begin{aligned}
N & = \\frac{11000 \\, \\mathrm{m}/\\mathrm{s}}{1000 \\, \\mathrm{m}/\\mathrm{s}} \\\\
{} & = 11
\\end{aligned}$$

stages, so the total mass is $$10 \\, \\mathrm{kg} \\cdot 5^{11} = 4.88 \\times 10^8 \\, \\mathrm{kg} \\approx 500\\,000\\,000 \\;\\mathrm{kg}.$$ WOOTLand needs better rockets!

This is one intuitive way of understanding the Tsiolkovsky rocket equation, which you have seen:

$$M = m_p \\exp \\left(\\frac{\\Delta v}{v_e}\\right),$$

where $$m_p$$ is the mass of the payload, $$\\Delta v$$ is the required change in velocity, $$v_e$$ is the speed of the exhaust, and $$M$$ is the total rocket mass. For $$\\Delta v$$ even moderately larger than $$v_e$$ an exponentially increasing amount of fuel is required. (An example you may be familiar with is the truly immense size of the Saturn V rocket compared to its Apollo spacecraft payload -- much of whose mass was also made up of rocket fuel.)`,
  },
  {
    n: 18, correct: 'A', // why: boxed value T = mgk^2/(k^2+r^2) matches choice A
    statement: `A spool of thread with radius $$r$$ and moment of inertia about its axis $$mk^2$$ is allowed to unwind under gravity. The upper end of the thread is held fixed. The thread is constrained from moving horizontally by a frictionless wall. What is the tension in the thread?`,
    choices: {
      A: '$$\\dfrac{mgk^2}{k^2 + r^2}$$',
      B: '$$mg$$',
      C: '$$\\dfrac{mgr^2}{k^2 + r^2}$$',
      D: '$$\\dfrac{mg(r^2+k^2)}{r^2}$$',
      E: '$$\\dfrac{mg k^2}{r^2-k^2}$$',
    },
    figures: [FIG('q18-q1')],
    topics: ['Mechanics'], tags: ['rotational inertia', 'torque', 'rigid bodies'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad \\dfrac{mgk^2}{k^2 + r^2}}$$

First we'll analyze the spool using the contact point with the wall as a pivot. This makes the torque from the thread zero.

About this pivot, the torque due to gravity is

$$\\tau_g = mgr.$$

The moment of inertia is

$$I_w = mk^2 + mr^2.$$

The angular acceleration is

$$\\begin{aligned}
\\alpha & = \\dfrac{\\tau_g}{I_w} \\\\[8pt]
{} & = \\dfrac{gr}{k^2 + r^2}.
\\end{aligned}$$

Now we analyze the situation using the center of the spool as a pivot. Then the torque from gravity is zero, and there is torque from the thread.

$$\\tau_t = Tr,$$

where $$T$$ is the tension.
The angular acceleration is

$$\\alpha = \\dfrac{Tr}{mk^2}.$$

Equating the two expressions for $$\\alpha$$ and solving for $$T,$$ we find

$$T = \\dfrac{mgk^2}{k^2 + r^2}.$$`,
  },
  {
    n: 19, correct: 'A', // why: boxed value 7.4e-28 m matches choice A
    statement: `In a proposed system of units, the following fundamental constants are defined to have the value unity (and are therefore dimensionless):

- The ratio of gravitational to inertial mass of any body

- The Newtonian constant of gravitation, $$G$$

- The speed of light, $$c.$$

In this system, mass, length, and time can all be measured in meters. Under this system, what is the mass in meters of a mass of one kilogram?

Under the usual definitions, $$c \\approx 3\\times 10^8 \\;\\mathrm{m/s}$$ and $$G = 6.67 \\times 10^{-11} \\;\\mathrm{m^3 kg^{-1}s^{-2}}.$$`,
    choices: {
      A: '$$7.4 \\times 10^{-28} \\;\\mathrm{m}$$',
      B: '$$1 \\;\\mathrm{m}$$',
      C: '$$0.020 \\;\\mathrm{m}$$',
      D: '$$6.0 \\times 10^6 \\;\\mathrm{m}$$',
      E: '$$1.3 \\times 10^{27} \\;\\mathrm{m}$$',
    },
    topics: ['Mechanics'], tags: ['dimensional analysis', 'units', 'gravitation'],
    solution: `$$\\boxed{\\mathrm{(a)} \\quad 7.4 \\times 10^{-28} \\;\\mathrm{m}}$$

$$\\begin{aligned}
\\mathrm{kg} & = 6.67 \\times 10^{-11} \\;\\mathrm{m^3 s^{-2}} \\cdot \\left(3 \\times 10^8 \\;\\mathrm{m/s}\\right)^{-2} \\\\
{} & = 7.4 \\times 10^{-28} \\;\\mathrm{m}.
\\end{aligned}$$`,
  },
  {
    n: 20, correct: 'C', // why: no boxed; solution's final line gives M_p/M_s = 1/10, matching choice C (0.1)
    statement: `Planet $$P$$ orbits star $$S$$, and moon $$M$$ orbits planet $$P$$. Both orbits are circles relative to the central body. It happens that the path of the moon relative to the distant stars forms the nine-pointed shape shown at the center above. This shape is at the exact transition between shapes with loops (like the one on the left) and shapes without (like the one on the right). Which of the following is closest to the ratio of the mass of the planet to the mass of the star?

You may neglect the mass of the moon; you may assume the star is fixed in place, even though the mass of the planet is not negligible; you may neglect variations in the strength of the star's gravitational field over the moon's path.`,
    choices: {
      A: '$$0.01$$',
      B: '$$0.03$$',
      C: '$$0.1$$',
      D: '$$0.3$$',
      E: '$$0.5$$',
    },
    figures: [FIG('q20-q1')],
    topics: ['Mechanics'], tags: ['orbits', 'gravitation', 'reference frames'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad 0.1}$$

Let the speed of the planet relative to the star be $$v_p$$; let the speed of the moon relative to the planet be $$v_m.$$ The velocity of the moon relative to the distant stars is a vector sum which can only point backwards if $$v_m > v_p.$$ So the transition occurs when

$$v_m = v_p.$$

Meanwhile, the periods $$T_p$$ and $$T_m$$ of the orbits satisfy

$$T_p = 10 T_m.$$

The ratio is $$10$$, not $$9$$, for the reason explained in the solution to problem 10. (But we have arranged the answer selections far enough apart that you can still find the correct answer if you miss this point.)

From Kepler's laws we know that the radius $$r$$ of each orbit satisfies

$$T^2 = 4 \\pi^2 \\frac{r^3}{GM},$$

or, since $$2 \\pi r = v T$$,

$$2 \\pi GM = v^3 T.$$

Therefore

$$\\begin{aligned}
\\frac{M_p}{M_s} & = \\frac{v_m^3 T_m}{v_p^3 T_p} \\\\[8pt]
{} & = \\frac{1}{10}.
\\end{aligned}$$`,
  },
  {
    n: 21, correct: 'C', // why: boxed value 4v matches choice C
    statement: `A liquid's viscosity can be measured in units of $$\\mathrm{N \\cdot s \\cdot m^{-2}}.$$ A small sphere of radius $$r$$ is dropped into liquid of viscosity $$\\mu$$ and density $$\\rho_1.$$ The density of the sphere is $$\\rho_2.$$ The terminal velocity of the sphere is $$v.$$ Experiments have already determined that the terminal velocity is inversely proportional to the viscosity. If a sphere of radius $$2r$$ and the same density were dropped, what would its terminal velocity be?`,
    choices: {
      A: '$$v$$',
      B: '$$2v$$',
      C: '$$4v$$',
      D: '$$8v$$',
      E: '$$2\\sqrt{2}v$$',
    },
    topics: ['Mechanics'], tags: ['dimensional analysis', 'drag', 'fluids'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad 4v}$$

The relevant quantities have dimensions

$$\\begin{aligned}
{}[v] & = LT^{-1} \\\\
[g] & = LT^{-2} \\\\
[r] & = L \\\\
[\\mu] & = ML^{-1}T^{-1}\\\\
[\\rho_\\mathrm{fluid}] & = ML^{-3}\\\\
[\\rho_\\mathrm{sphere}] & = ML^{-3}.
\\end{aligned}$$

To cancel out the mass units in $$\\mu,$$ we construct

$$\\left[\\dfrac{\\rho}{\\mu}\\right] = L^{-2}T,$$

where $$\\rho$$ can be the density of either the fluid or the sphere. The velocity must be directly proportional to this quantity.

Now the only dimensionally-correct formula that is inversely proportional to $$\\mu$$ is

$$v = \\dfrac{r^2 \\rho g}{\\mu} f\\left(\\dfrac{\\rho_\\mathrm{fluid}}{\\rho_\\mathrm{sphere}}\\right).$$

This implies the larger sphere falls at $$4v.$$`,
  },
  {
    n: 22, correct: 'C', // why: boxed value alpha = 1/3 matches choice C
    statement: `A cylindrical rod of mass $$m$$ and length much longer than its diameter has a point mass $$2m$$ attached to one end. The average density of the rod (including the point mass) is $$\\alpha$$ that of water. What is the maximum $$\\alpha$$ such that the rod's orientation when floating in water is not vertical?`,
    choices: {
      A: '$$1$$',
      B: '$$\\dfrac12$$',
      C: '$$\\dfrac13$$',
      D: '$$\\dfrac14$$',
      E: '$$\\dfrac15$$',
    },
    solutionFigures: [FIG('q22-s1')],
    topics: ['Mechanics'], tags: ['buoyancy', 'statics', 'torque'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad \\dfrac13}$$

If floating at some angle under the water, the rod experiences three forces: a gravitational force on the point mass (located at the end of the rod), a gravitational force on the rest of the rod (located at the center of the rod), and a buoyant force (located half way along the submerged portion of the rod).

A fraction $$\\alpha$$ of the rod is submerged, so the distance from the buoyant force to the point mass must be $$\\dfrac{\\alpha}{2}L,$$ with $$L$$ the length of the rod. In order for there to be no torque about the point where the buoyant force is applied, the distance to the center of the rod from that point must be twice that to the point mass (because the force is half as much), or $$\\alpha L.$$

We therefore have

$$\\dfrac{L}{2} = \\dfrac{\\alpha}{2}L + \\alpha L.$$

Solving for $$\\alpha,$$ we get

$$\\alpha = \\dfrac13.$$

This is the value of $$\\alpha$$ for which the rod is at equilibrium at any angle - a state called "metastable". At higher $$\\alpha,$$ the heavy mass sinks to the bottom, making the rod vertical. At lower $$\\alpha,$$ the portion of the rod out of the water is too heavy to stick up in the air, and the rod lays flat horizontally.`,
  },
  {
    n: 23, correct: 'C', // why: boxed value 1.25 nautical miles matches choice C
    statement: `A large cruise liner moves at $$20$$ knots along a straight course that takes it within one nautical mile of a port. A small boat capable of $$12$$ knots leaves port at the last possible minute to intercept the liner. How far must the small boat go to intercept it?`,
    choices: {
      A: '$$1$$ nautical mile',
      B: '$$1.17$$ nautical miles',
      C: '$$1.25$$ nautical miles',
      D: '$$1.33$$ nautical miles',
      E: '$$1.67$$ nautical miles',
    },
    solutionFigures: [
      FIG('q23-s1'), FIG('q23-s2'), FIG('q23-s3'), FIG('q23-s4'), FIG('q23-s5'),
      FIG('q23-s6'), FIG('q23-s7'), FIG('q23-s8'), FIG('q23-s9'), FIG('q23-s10'),
    ],
    topics: ['Mechanics'], tags: ['relative motion', 'optimization', 'geometry'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad 1.25 \\text{ nautical miles}}$$

The small boat leaves the port traveling at some angle $$\\theta$$ to the horizontal.

The boat leaves at the last moment to still intercept the liner. A plot of when the boat needs to leave in order to intercept the liner, as a function of $$\\theta,$$ is some unknown function like this:

The salient point is that if $$\\theta$$ is chosen so that the time of departure is as late as possible, then choosing a nearby $$\\theta$$ doesn't affect the time of departure because the slope of the time of departure vs $$\\theta$$ graph is flat at the point of the latest time of departure.

We imagine increasing $$\\theta$$ by some small amount. Then the small boat and the liner should still intercept, only this time they will intercept at the red dot shown below.

There is a small triangle similar to the larger triangle, filled in with red below.

If we blow this triangle up, it looks like this:

The vertical side of the triangle is the extra distance the liner travels to get to the new intercept point. The highest side of the triangle is the extra distance the small boat travels. These two should take the same amount of time, so

$$\\sin\\theta = \\dfrac{v_{sb}}{v_{l}},$$

where $$v_{sb}$$ is the speed of the small boat and $$v_l$$ is the speed of the liner.

This implies $$\\sin\\theta = \\dfrac{12}{20},$$ so $$\\sin\\theta = \\dfrac35$$ and $$\\cos\\theta = \\dfrac45.$$ The distance traveled by the boat is

$$\\begin{aligned}
d & = \\dfrac{1 \\text{ nautical mile}}{\\cos\\theta} \\\\
{} & = 1.25 \\text{ nautical miles}.
\\end{aligned}$$

An alternative solution, avoiding the use of infinitesimal angles, is below:

Let $$v_s = 12 \\, \\mathrm{kt}$$, $$v_l = 20 \\, \\mathrm{kt}$$, and $$L = 1 \\, \\mathrm{nmi}.$$ Let's work in the liner's frame of reference, in which the port is moving past the liner at a constant speed $$v_l.$$ What is the range of positions the small boat can pass through after leaving port?

At the moment it leaves, of course, the boat is in port.

After some time $$t$$, the port has moved $$v_l t$$ from its starting point, and the boat could be as far as $$v_s t$$ from the port:

After some more time:

Since all of the distances are proportional, the overall range of the small boat in the liner frame is triangular in shape:

The boat shown above left with plenty of time to spare. If it leaves at the last possible minute:

The angle marked in the diagram must be a right angle because the line marking the limit of the boat's range is tangent to the circle. From here it's just a geometry problem to solve for the desired distance $$d$$,

$$d = \\frac{L}{\\sqrt{1 - (v_s / v_l)^2}}.$$`,
  },
  {
    n: 24, correct: 'C', // why: boxed value x = (2/3)b matches choice C
    statement: `A door consists of a uniform rectangular prism of width $$b.$$ The door is made to swing about a vertical axis along one edge. How far from the axis should a door stop be placed if there is to be no reaction at the hinges when the door strikes it?`,
    choices: {
      A: '$$\\dfrac13 b$$',
      B: '$$\\dfrac12 b$$',
      C: '$$\\dfrac23 b$$',
      D: '$$\\dfrac34 b$$',
      E: '$$b$$',
    },
    topics: ['Mechanics'], tags: ['angular momentum', 'impulse', 'rigid bodies'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad \\dfrac23 b}$$

The moment of inertia of the door about the axis is $$\\dfrac13 mb^2.$$ This means the door's angular momentum is

$$L = \\dfrac13 m b^2 \\omega.$$

The door's momentum is its mass times the velocity of its center of mass,

$$p = \\dfrac12 m b \\omega.$$

If there is no reaction at the door, then the impulse from the doorstop must both bring the door to a stop and prevent the door from rotating. This means the impulse must be of magnitude $$p$$ and exert an angular impulse $$L.$$ We also have that the angular impulse is $$px,$$ with $$x$$ the distance of the doorstop from the axis.

Equating the two expressions for the angular impulse,

$$\\dfrac13 mb^2 \\omega = \\dfrac12 m b \\omega x.$$

Solving for $$x$$ we get

$$x = \\dfrac23b.$$`,
  },
  {
    n: 25, correct: 'C', // why: boxed condition N > 4T/F matches choice C
    statement: `A massless ideal spring is stretched between two posts a distance $$L$$ apart. The tension in the spring is $$T.$$ The spring constant of the spring is $$\\dfrac{NT}{L}.$$

You consider two ways of increasing the force from the spring on the left post:

1. Exert a force $$F$$ to the right on the middle of the spring

2. Exert a force $$F$$ perpendicular to the spring on the middle of the spring

You may assume $$F \\ll T.$$ Under what condition will method (2) result in a larger increase in the force from the spring on the left post?`,
    choices: {
      A: '$$N < \\dfrac{4T^2}{F^2}$$',
      B: '$$N < \\dfrac{4T}{F}$$',
      C: '$$N > \\dfrac{4T}{F}$$',
      D: '$$N > \\dfrac{4T^2}{F^2}$$',
      E: 'Method (2) never results in a greater increase in force.',
    },
    topics: ['Mechanics'], tags: ['springs', 'statics', 'approximations'],
    solution: `$$\\boxed{\\mathrm{(c)} \\quad N > \\dfrac{4T}{F}}$$

First we analyze method (1). Imagine a small mass at the center of the spring. When we apply a force to the right on it, the left half of the spring stretches and the right half of the spring compresses. This continues until the left half of the spring exerts a force $$F/2$$ to the left greater than it previously did and the right half of the spring exerts a force $$F/2$$ smaller than its previous force. So we increase the force on the left post by $$F/2.$$

Next we analyze method (2).

Because $$F \\ll T,$$ the angle of deflection of the spring will be small in method (2). If the tension after applying the force is $$T',$$ then we have

$$T'\\theta \\approx \\dfrac{F}{2}.$$

Additionally, from the definition of the spring constant,

$$\\begin{aligned}
T' & = T + k\\Delta L \\\\[8pt]
{} & = T + TN \\dfrac{\\Delta L}{L}.
\\end{aligned}$$

So method (2) allows us to exert a greater force when

$$TN \\dfrac{\\Delta L}{L} > \\dfrac12 F.$$

We wish to eliminate $$\\Delta L$$ and $$L.$$

To do this, we note

$$\\dfrac{1}{\\cos\\theta} = \\dfrac{L+\\Delta L}{L}.$$

Using $$\\dfrac{1}{\\cos\\theta} \\approx 1 + \\theta^2/2,$$ we have

$$\\dfrac{\\Delta L}{L} \\approx \\dfrac{\\theta^2}{2}.$$

Then eliminating $$\\theta,$$

$$\\dfrac{\\Delta L}{L} \\approx \\dfrac{F^2}{8T'^2}.$$

Using this in the inequality, the condition for method (2) to exert a greater force is

$$\\dfrac{NTF^2}{8T'^2} > \\dfrac{F}{2}.$$

Because $$F \\ll T,$$ we can let $$T' \\approx T,$$ and solving for $$N,$$ we get

$$N > \\dfrac{4T}{F}.$$`,
  },
]
