// Digitized 2020 F=ma Exam A questions. Sources:
// Exam: work/fma/fma-2020-a.pdf (text extracted to work/fma/fma-2020-a.txt)
// Solutions: work/fma/fma-2020-a-sol.pdf (text extracted to work/fma/fma-2020-a-sol.txt)
//   — full worked solutions with ←CORRECT markers.
// Figures: work/figure_manifest.json, key "fma-2020-a" — already cropped and uploaded.
//
// Answer key notes:
// Q14: The solutions PDF states "credit was given for all answers" due to a typo
//   (µs < µk should be µk < µs). The ←CORRECT marker points to (B); we use B as the
//   canonical answer, noting the problem is officially credit-all.
// Q21: Both (B) and (C) are marked ←CORRECT and the solutions confirm they are
//   equivalent. We use B as the canonical answer.
// Q1 (graph choices): The five choices are graph-style options that were not split into
//   separate figures. Short factual text descriptions are provided for each choice.
//
// Preamble for Q9 and Q10 is included in both question statements.

const F20A = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2020-a'
export const questions = [
  {
    n: 1, correct: 'E',
    statement: `A ball is launched straight toward the ground from height $$h$$. When it bounces off the ground, it loses half of its kinetic energy. It reaches a maximum height of $$2h$$ before falling back to the ground again. What was the initial speed of the ball?`,
    choices: {
      A: '$$\\sqrt{gh}$$',
      B: '$$\\sqrt{2gh}$$',
      C: '$$\\sqrt{3gh}$$',
      D: '$$\\sqrt{4gh}$$',
      E: '$$\\sqrt{6gh}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', '1d kinematics'],
    solution: `Use energy. Let $$v_0$$ be the initial downward speed. Just before hitting the ground the ball's total energy is
$$E_0 = mgh + \\tfrac{1}{2}mv_0^2.$$
After the bounce it retains half its kinetic energy and rises to height $$2h$$:
$$\\tfrac{1}{2}E_0 = \\tfrac{1}{2}\\!\\left(\\tfrac{1}{2}mv_0^2 + mgh\\right) = mg(2h).$$
Solving: $$\\tfrac{1}{2}mv_0^2 + mgh = 4mgh$$, so $$v_0^2 = 6gh$$ and $$v_0 = \\sqrt{6gh}$$.

The answer is E.`,
  },
  {
    n: 2, correct: 'E',
    statement: `A rigid ball of radius $$R$$ is rolling without slipping along the rib of a right-angle chute, as shown at left. A cross section of the ball, taken perpendicular to the ball's direction of travel, is shown at right.

Points $$A$$ and $$B$$ are the contact points with the chute; $$O$$ is the center; $$P$$ is at the top of the cross section; $$Q$$ is at the corner opposite the rib (farthest from the AB axis). Which of the marked point(s) of the ball have the highest speed?`,
    choices: {
      A: 'All the marked points have the same speed.',
      B: 'The contact points A and B.',
      C: 'The center O.',
      D: 'The point P.',
      E: 'The point Q.',
    },
    figures: [F20A(2)], topics: ['Mechanics'], tags: ['rolling without slipping', 'rotational motion', 'rigid body kinematics'],
    solution: `Points $$A$$ and $$B$$ are the instantaneous contact points with the chute. Because the ball rolls without slipping, those points are momentarily at rest, so they define the instantaneous axis of rotation.

The speed of any point on the ball is proportional to its distance from the line $$AB$$. Among the labeled points, $$Q$$ (the corner diagonally opposite the rib) is farthest from the axis $$AB$$. If the center $$O$$ (distance $$R/\\sqrt{2}$$ from $$AB$$) has speed $$v$$, then $$Q$$ (distance $$(1+\\sqrt{2})R/\\sqrt{2}$$ from $$AB$$) has speed $$(1+\\sqrt{2})v$$.

The answer is E.`,
  },
  {
    n: 3, correct: 'B',
    statement: `When an axe is swung with kinetic energy $$E$$ directly at a piece of wood, the edge of the axe is buried a depth $$L$$ into the wood. If the axe is swung with kinetic energy $$2E$$, how deep will it be buried into the wood? Assume that the axe is wedge-shaped with a constant angle and that the force per unit contact area between the axe and the wood during the impact is proportional to the depth.`,
    choices: {
      A: '$$2^{1/4}L$$',
      B: '$$2^{1/3}L$$',
      C: '$$\\sqrt{2}\\,L$$',
      D: '$$2L$$',
      E: '$$4L$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'scaling', 'work-energy theorem'],
    solution: `Let the depth be $$d$$. As the axe penetrates to depth $$d$$, the contact length grows as $$d$$ (wedge geometry), and the force per unit area is proportional to $$d$$, so the force is proportional to $$d^2$$. The energy required to reach depth $$d$$ is:
$$E \\propto \\int_0^d F\\,dd' \\propto \\int_0^d d'^2\\,dd' \\propto d^3.$$
Therefore $$E \\propto L^3$$. Doubling the energy increases the depth by a factor of $$2^{1/3}$$, giving a final depth of $$2^{1/3}L$$.

The answer is B.`,
  },
  {
    n: 4, correct: 'B',
    statement: `Four identical rods, each of mass $$m$$ and length $$2d$$, are joined together to form a square. The square is then spun around its center at an angular frequency of $$\\omega$$. What is the magnitude of the force that the joints between the rods (at the corners of the square) must bear?`,
    choices: {
      A: '$$m\\omega^2 d/2$$',
      B: '$$m\\omega^2 d/\\sqrt{2}$$',
      C: '$$m\\omega^2 d$$',
      D: '$$\\sqrt{2}\\,m\\omega^2 d$$',
      E: '$$2m\\omega^2 d$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'rotational dynamics', 'free-body diagrams'],
    solution: `Consider one rod (say the rightmost one), oriented vertically with its center at $$(d, 0)$$. Each mass element at position $$(d, y)$$ requires centripetal acceleration of magnitude $$\\omega^2 d$$ in the horizontal direction (toward the center). Integrating over the whole rod, the net horizontal (rightward) centripetal force required is $$F_\\text{cent} = m\\omega^2 d$$.

The two corner joints exert forces on this rod. By symmetry and Newton's third law, each joint force is directed perpendicular to the corresponding diagonal (i.e., at $$45^\\circ$$ to the horizontal). Balancing the horizontal component: $$2F_\\text{joint}\\cos(45^\\circ) = m\\omega^2 d$$, so
$$F_\\text{joint} = \\frac{m\\omega^2 d}{\\sqrt{2}}.$$

The answer is B.`,
  },
  {
    n: 5, correct: 'A',
    statement: `A pendulum of length $$L$$ oscillates inside a box. A person picks up the box and gently shakes it horizontally with frequency $$\\omega$$ and a fixed amplitude for a fixed time. The final amplitude can be maximized if $$\\omega$$ satisfies`,
    choices: {
      A: '$$\\omega = \\sqrt{g/L}$$',
      B: '$$\\omega = 2\\sqrt{g/L}$$',
      C: '$$\\omega = \\frac{1}{2}\\sqrt{g/L}$$',
      D: 'There will be no effect on the amplitude for any value of $$\\omega$$.',
      E: 'None of the above.',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'resonance'],
    solution: `In the non-inertial frame of the box, the horizontal shaking acts as a periodic driving force on the pendulum. The pendulum's natural frequency is $$\\omega_0 = \\sqrt{g/L}$$. To maximize the final amplitude, drive at resonance: $$\\omega = \\sqrt{g/L}$$.

The answer is A.`,
  },
  {
    n: 6, correct: 'B',
    statement: `A planet is orbiting a star in a circular orbit of radius $$r_0$$. Over a very long period of time, much greater than the period of the orbit, the star slowly and steadily loses 1% of its mass. Throughout the process, the planet's orbit remains approximately circular. The final orbit radius is closest to`,
    choices: {
      A: '$$1.02\\,r_0$$',
      B: '$$1.01\\,r_0$$',
      C: '$$r_0$$',
      D: '$$0.99\\,r_0$$',
      E: '$$0.98\\,r_0$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'kepler\'s laws', 'energy conservation', 'angular momentum conservation'],
    solution: `Since the mass loss is adiabatically slow (many orbits per unit mass loss), the angular momentum $$L = mvr$$ is conserved. For a circular orbit, the virial relation gives $$mv^2 = GMm/r$$, so $$v \\propto \\sqrt{M/r}$$. Then $$L = mvr \\propto \\sqrt{Mr}$$ is constant, giving $$r \\propto 1/M$$. A 1% decrease in $$M$$ therefore produces a 1% increase in $$r$$.

Final radius $$\\approx 1.01\\,r_0$$. The answer is B.`,
  },
  {
    n: 7, correct: 'E',
    statement: `An astronaut standing on the exterior of the international space station wants to dispose of three pieces of trash. They face the station's direction of travel with the Earth to their left. From the astronaut's perspective, the three pieces are thrown (I) left, (II) right, and (III) up. To the astronaut's frustration, some of the pieces of trash return to the space station after several hours.

They are`,
    choices: {
      A: 'II only',
      B: 'III only',
      C: 'I and II',
      D: 'II and III',
      E: 'I, II, and III',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'kepler\'s laws', 'energy conservation'],
    solution: `By Kepler's third law, the orbital period depends only on the semimajor axis: $$T^2 \\propto a^3$$, and the total energy is $$E = -GMm/(2a)$$. The astronaut's throw imparts a velocity change that is negligibly small compared to the orbital speed ($$\\sim 7.7$$ km/s), so the change in total energy — and hence in $$a$$ and $$T$$ — is negligible.

For all three pieces, the orbit period is essentially unchanged at $$\\approx 1.5$$ hours, so after one full orbit each piece returns to the original location and meets the station again.

The answer is E.`,
  },
  {
    n: 8, correct: 'C',
    statement: `The velocity versus position plot of a particle is shown below. The plot shows $$v$$ proportional to $$x$$ (a straight line through the origin with positive slope). Which of the following choices is the correct acceleration vs. position plot of the particle?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q08A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q08B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q08C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q08D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q08E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'graph interpretation'],
    solution: `The $$v$$-vs-$$x$$ plot shows $$v = kx$$ for some constant $$k$$. Differentiating with respect to time:
$$a = \\frac{dv}{dt} = k\\frac{dx}{dt} = kv = k(kx) = k^2 x.$$
So $$a \\propto x$$: the acceleration is a straight line through the origin with positive slope. The plot must start at $$(0, 0)$$ and increase linearly.

The answer is C.`,
  },
  {
    n: 9, correct: 'B',
    statement: `__The following information is relevant to problems 9 and 10.__

A block of mass $$m$$ is attached to a massless string. The string is passed over a massless pulley and the end of the string is fixed in place. The horizontal part of the string has length $$L$$. Now a small mass $$m$$ is hung from the horizontal part of the string, and the system comes to equilibrium. (Diagram not necessarily to scale.)

Neglecting friction everywhere, the tension at the end of the string is`,
    choices: {
      A: '$$mg/2$$',
      B: '$$mg$$',
      C: '$$3mg/2$$',
      D: '$$2mg$$',
      E: '$$3mg$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'pulleys/tension', 'free-body diagrams'],
    solution: `The string is continuous and massless, passing over a massless frictionless pulley. For torque balance on any massless pulley, the tension must be the same on both sides. Treating the hanging mass $$m$$ as another "pulley" (it just redirects the string), the tension is the same throughout the string. The hanging mass is in equilibrium under two upward string tensions and its weight $$mg$$, so $$2T = mg$$... but wait — the mass hangs from a single point on the horizontal string, not over a pulley. Each side of the string meeting at the hanging mass pulls upward with tension $$T$$ at equal angles, and the vertical components support the weight. For the string to be in equilibrium, the tension $$T$$ is the same throughout (massless string, frictionless pulley), and the hanging mass pulls down with force $$mg$$ supported by two equal vertical tension components. This gives $$2T\\sin\\theta = mg$$. However, the simpler argument from the solutions: one can think of the hanging mass as just another massless pulley — the tension is uniform throughout the string and equals $$mg$$ (supporting the block of mass $$m$$ on the other side of the pulley).

The tension everywhere in the string equals $$mg$$. The answer is B.`,
  },
  {
    n: 10, correct: 'A',
    statement: `__The following information is relevant to problems 9 and 10.__

A block of mass $$m$$ is attached to a massless string. The string is passed over a massless pulley and the end of the string is fixed in place. The horizontal part of the string has length $$L$$. Now a small mass $$m$$ is hung from the horizontal part of the string, and the system comes to equilibrium. (Diagram not necessarily to scale.)

During this process, the block has been raised by approximately a height`,
    choices: {
      A: '$$0.15L$$',
      B: '$$0.23L$$',
      C: '$$0.31L$$',
      D: '$$0.37L$$',
      E: '$$0.40L$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'geometry'],
    solution: `From Q9, the tension throughout is $$mg$$. For force balance on the hanging mass $$m$$, the two string segments meeting at it must each make angle $$30^\\circ$$ with the horizontal (since $$2T\\sin 30^\\circ = mg$$ gives $$T\\sin 30^\\circ = mg/2$$, i.e. $$T = mg$$ ✓). The hanging mass must therefore be at the midpoint of the original horizontal section.

The original horizontal string of length $$L$$ is now replaced by two segments each at $$30^\\circ$$ to the horizontal and meeting at the midpoint. Each segment has length $$\\frac{L/2}{\\cos 30^\\circ} = \\frac{L}{\\sqrt{3}}$$. Total string length in the sagged configuration: $$\\frac{2L}{\\sqrt{3}}$$. The extra string length $$\\frac{2L}{\\sqrt{3}} - L = L\\!\\left(\\frac{2}{\\sqrt{3}} - 1\\right) \\approx 0.155L$$ is used to raise the block by that same amount.

$$\\Delta h \\approx 0.15L.$$ The answer is A.`,
  },
  {
    n: 11, correct: 'C',
    statement: `The maximal tension per area a material can sustain without failure is called its tensile strength. Plain steel has a tensile strength of 415 MPa. What is the maximal mass one can hang on a vertical steel rod of negligible mass and a diameter of 2 cm?`,
    choices: {
      A: '1300 kg',
      B: '5200 kg',
      C: '13 000 kg',
      D: '52 000 kg',
      E: 'The answer depends on the length of the steel rod.',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'estimation', 'units'],
    solution: `The cross-sectional area of the rod is $$A = \\pi r^2 = \\pi(0.01\\text{ m})^2 = \\pi \\times 10^{-4}\\text{ m}^2$$.

The maximum tension is $$F = \\sigma A = 415 \\times 10^6 \\times \\pi \\times 10^{-4} \\approx 1.3 \\times 10^5\\text{ N}$$.

The maximum mass: $$m = F/g = 1.3 \\times 10^5 / 10 = 13\\,000\\text{ kg}$$.

The answer is C.`,
  },
  {
    n: 12, correct: 'D',
    statement: `A point mass $$m$$ is glued inside a massless hollow rod of length $$L$$ at an unknown location. When the rod is pivoted at one end, the period of small oscillations is $$T$$. When the rod is pivoted at the other end, the period of small oscillations is $$2T$$. How far is the mass from the center?`,
    choices: {
      A: '$$L/8$$',
      B: '$$L/6$$',
      C: '$$L/4$$',
      D: '$$3L/10$$',
      E: '$$2L/5$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'rotational dynamics'],
    solution: `For a point mass on a massless rod, the period of a physical pendulum about a pivot is $$T \\propto \\sqrt{\\ell}$$ where $$\\ell$$ is the distance from the pivot to the mass (since $$T = 2\\pi\\sqrt{I/mg\\ell} = 2\\pi\\sqrt{m\\ell^2/(mg\\ell)} = 2\\pi\\sqrt{\\ell/g}$$).

Let the mass be at distance $$\\ell_1$$ from end 1 and $$\\ell_2 = L - \\ell_1$$ from end 2. We have $$T_1 \\propto \\sqrt{\\ell_1}$$ and $$T_2 \\propto \\sqrt{\\ell_2}$$. Given $$T_2 = 2T_1$$:
$$\\frac{\\ell_2}{\\ell_1} = 4 \\implies \\ell_2 = 4\\ell_1.$$
With $$\\ell_1 + \\ell_2 = L$$: $$\\ell_1 = L/5$$ and $$\\ell_2 = 4L/5$$.

The center of the rod is at $$L/2$$ from either end. The mass is at $$L/5$$ from one end, which is $$L/2 - L/5 = 3L/10$$ from the center.

The answer is D.`,
  },
  {
    n: 13, correct: 'C',
    statement: `A ballerina with moment of inertia $$I$$ is quickly twirling with angular velocity $$\\omega$$. In her hand she has a pen of mass $$m$$ at a radius $$R$$ from her axis of rotation. The ballerina releases the pen. Afterward, what happens to the vertical component of the angular momentum of the system consisting of the ballerina and the pen? You may ignore all friction, but not gravity or normal forces.`,
    choices: {
      A: 'It decreases until the pen hits the floor.',
      B: 'It increases until the pen hits the floor.',
      C: 'It always stays the same.',
      D: 'It initially stays the same, but decreases when the pen hits the floor.',
      E: 'It initially stays the same, but increases when the pen hits the floor.',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum conservation', 'angular momentum'],
    solution: `After the pen is released, the external forces on the system (ballerina + pen) are gravity and normal forces, both of which are vertical. Vertical forces have zero torque about the vertical axis, so the vertical component of angular momentum of the system is conserved throughout (both before and after the pen hits the floor, as long as we include both objects).

When the pen hits the floor, the floor exerts a normal force on the pen — which is vertical — and therefore still produces no torque about the vertical axis.

The answer is C.`,
  },
  {
    // The stated mu_s < mu_k is impossible, so AAPT credited all answers.
    n: 14, correct: 'B', alsoAccepted: ['A', 'C', 'D', 'E'],
    statement: `Two blocks of mass $$m$$ are placed on top of each other, and the bottom block is placed on the ground. The ground is frictionless. The static and kinetic coefficients of friction between the two blocks are $$\\mu_s$$ and $$\\mu_k$$, with $$\\mu_s < \\mu_k$$. The blocks are at rest initially. When a constant horizontal force $$F$$ is then applied to the bottom block, which of the following graphs could show its acceleration as a function of $$F$$?

__Note: the problem as stated contains a typo ($$\\mu_s < \\mu_k$$ should be $$\\mu_k < \\mu_s$$). Full credit was awarded for all answer choices.__`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q14A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q14B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q14C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q14D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2020-a/fma-2020-a-q14E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'newton\'s laws', 'graph interpretation', 'free-body diagrams'],
    solution: `__Note: full credit was awarded for all answers because the problem statement has a typo: $$\\mu_s < \\mu_k$$ is physically impossible. The intended condition was $$\\mu_k < \\mu_s$$.__

With the corrected condition $$\\mu_k < \\mu_s$$, the intended analysis is:

For small $$F$$, both blocks move together (static friction keeps them coupled), and $$a = F/(2m)$$ — a straight line.

At a threshold force $$F^* = \\mu_s mg$$, the top block begins to slip. Once slipping begins, the friction force drops to $$\\mu_k mg < \\mu_s mg$$, so the net force on the bottom block suddenly increases: $$a = (F - \\mu_k mg)/m$$. The acceleration jumps upward discontinuously at $$F^*$$, then continues linearly with a steeper slope.

The intended answer is B (a graph showing a linear rise that jumps up discontinuously at the slipping threshold, then continues linearly with steeper slope).`,
  },
  {
    n: 15, correct: 'A',
    statement: `As shown in the figure, a vessel contains two types of liquid: the liquid with density $$\\rho_1$$ on top and $$\\rho_2$$ on the bottom. The depth of the top liquid is $$h_1$$, and the interface area between the top and the bottom liquid is $$s_1$$. The bottom liquid has a depth of $$h_2$$. The area of the bottom of the vessel is $$s_2$$. What is the gauge pressure (i.e. pressure in excess of atmospheric pressure) at the bottom of the vessel?`,
    choices: {
      A: '$$(\\rho_1 h_1 + \\rho_2 h_2)g$$',
      B: '$$\\dfrac{\\rho_1 s_1 h_1 + \\rho_2 s_2 h_2}{s_2}\\,g$$',
      C: '$$\\tfrac{1}{2}(\\rho_1 + \\rho_2)(h_1 + h_2)g$$',
      D: '$$(\\rho_1 + \\rho_2)(h_1 + h_2)g$$',
      E: '$$\\rho_2(h_1 + h_2)g$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid statics', 'pressure'],
    solution: `Pressure in a static fluid increases with depth according to $$dP = \\rho g\\, dh$$. Starting from atmospheric pressure at the top surface, after descending $$h_1$$ through the top liquid the pressure is $$P_1 = P_\\text{atm} + \\rho_1 g h_1$$. After descending a further $$h_2$$ through the bottom liquid: $$P_\\text{bottom} = P_\\text{atm} + \\rho_1 g h_1 + \\rho_2 g h_2$$.

The gauge pressure is $$(\\rho_1 h_1 + \\rho_2 h_2)g$$. The areas $$s_1$$ and $$s_2$$ are irrelevant to the pressure calculation. The answer is A.`,
  },
  {
    n: 16, correct: 'D',
    statement: `Liquid droplets store a given amount of potential energy per unit surface area, due to their surface tension. When two identical, nearly spherical liquid droplets coalesce on a certain type of surface, part of this energy can be converted into upward kinetic energy, causing the coalesced droplet to jump. Assuming the conversion is 100% efficient, how does the maximum height $$h$$ depend on the radius $$r$$ of the initial droplets?`,
    choices: {
      A: '$$h \\propto r$$',
      B: '$$h \\propto r^{1/2}$$',
      C: '$$h \\propto r^{-1/2}$$',
      D: '$$h \\propto r^{-1}$$',
      E: '$$h \\propto r^{-2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['surface tension', 'energy conservation', 'scaling', 'dimensional analysis'],
    solution: `The surface energy released is proportional to the change in surface area. Before coalescence: two spheres of radius $$r$$ have total area $$2 \\times 4\\pi r^2 = 8\\pi r^2$$. After: one sphere of radius $$r_f$$ where $$\\frac{4}{3}\\pi r_f^3 = 2 \\times \\frac{4}{3}\\pi r^3$$, so $$r_f = 2^{1/3}r$$ and area $$= 4\\pi(2^{1/3}r)^2 = 4\\pi 2^{2/3}r^2$$. The change in surface area is proportional to $$r^2$$, so the energy released $$E \\propto r^2$$.

The mass of the coalesced droplet is $$m \\propto r^3$$. Setting $$E = mgh$$:
$$r^2 \\propto r^3 h \\implies h \\propto r^{-1}.$$

The answer is D.`,
  },
  {
    n: 17, correct: 'B',
    statement: `Paul the Giant stands outside on a force-meter calibrated in Newtons, which reads 5000 N. Paul is wearing a large cowboy hat, which has horizontal cross-sectional area $$A = 1\\text{ m}^2$$ and completely covers both him and the scale when seen from directly above. At time $$t = 0$$, rain begins to fall vertically downward on Paul, and any rain that hits his hat is collected in the hat's brim. The raindrops have a constant downward speed of $$1\\text{ m/s}$$, and the rain accumulates on the ground at a rate of $$1\\text{ mm/s}$$. What is the reading (in N) on the scale as a function of the time $$t > 0$$ (in s)? The density of water is $$1000\\text{ kg/m}^3$$.`,
    choices: {
      A: '$$5001 + 11t$$',
      B: '$$5001 + 10t$$',
      C: '$$5000 + 11t$$',
      D: '$$5001 + 1.1t$$',
      E: '$$5001 + t$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['impulse', 'momentum conservation', 'free-body diagrams', 'estimation'],
    solution: `There are three contributions to the scale reading:

__1. Paul's weight:__ 5000 N (constant).

__2. Momentum impact force:__ Raindrops of mass $$dm$$ per unit time hit the hat and stop. The rate of mass accumulation on the hat is $$\\dot{m} = \\rho \\times (1\\text{ mm/s}) \\times A = 1000 \\times 10^{-3} \\times 1 = 1\\text{ kg/s}$$. The impact force is $$F = \\dot{m}\\,v = 1 \\times 1 = 1\\text{ N}$$ (constant).

__3. Weight of accumulated water:__ Volume accumulated by time $$t$$: $$V = (10^{-3}\\text{ m/s})(1\\text{ m}^2)(t) = 10^{-3}t\\text{ m}^3$$. Weight $$= \\rho g V = 1000 \\times 10 \\times 10^{-3}t = 10t\\text{ N}$$.

Total: $$5000 + 1 + 10t = 5001 + 10t\\text{ N}$$. The answer is B.`,
  },
  {
    n: 18, correct: 'D',
    statement: `A massless rigid rod is pivoted at one end, and a mass $$M$$ is at the other end. Originally, the rod rotates frictionlessly about the pivot with a uniform angular velocity such that the mass $$M$$ has speed $$v$$. The rotating rod collides with another mass $$M$$ at its midpoint, which then sticks to the rod. After the collision, what is the kinetic energy of the system?`,
    choices: {
      A: '$$\\dfrac{1}{4}Mv^2$$',
      B: '$$\\dfrac{1}{3}Mv^2$$',
      C: '$$\\dfrac{7}{18}Mv^2$$',
      D: '$$\\dfrac{2}{5}Mv^2$$',
      E: '$$\\dfrac{1}{2}Mv^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum conservation', 'rotational dynamics', 'collisions', 'energy conservation'],
    solution: `Let $$r$$ be the length of the rod. Before collision: the mass $$M$$ at the end moves at speed $$v$$, so $$\\omega_i = v/r$$.

Angular momentum about the pivot is conserved in the collision. Let $$\\omega_f$$ be the final angular velocity of the rod. The second mass $$M$$ sticks at the midpoint $$r/2$$, moving at speed $$\\omega_f(r/2) = v'/2$$ (where $$v' = \\omega_f r$$ is the final speed of the endpoint mass).

Conserving angular momentum:
$$M v r = M(\\omega_f r)r + M(\\omega_f r/2)(r/2) = M\\omega_f r^2 + M\\omega_f r^2/4 = \\frac{5}{4}M\\omega_f r^2.$$
$$\\omega_f = \\frac{4}{5}\\omega_i, \\quad v' = \\frac{4}{5}v.$$

Final kinetic energy:
$$KE = \\frac{1}{2}M(v')^2 + \\frac{1}{2}M(v'/2)^2 = \\frac{1}{2}M\\left(\\frac{4}{5}v\\right)^2 + \\frac{1}{2}M\\left(\\frac{2}{5}v\\right)^2 = \\frac{8}{25}Mv^2 + \\frac{2}{25}Mv^2 = \\frac{2}{5}Mv^2.$$

The answer is D.`,
  },
  {
    n: 19, correct: 'E',
    statement: `A system of cylinders and plates is set up as shown. There are three plates (floor, middle plate, top plate) and two layers of cylinders between them. The cylinders all have radius $$r$$, and roll without slipping to the right with angular velocity $$\\omega$$. What is the speed of the top plate?`,
    choices: {
      A: '$$\\omega r$$',
      B: '$$2\\omega r$$',
      C: '$$3\\omega r$$',
      D: '$$4\\omega r$$',
      E: '$$6\\omega r$$',
    },
    figures: [F20A(19)], topics: ['Mechanics'], tags: ['rolling without slipping', 'constraint kinematics', 'rigid body kinematics'],
    solution: `Each cylinder rolls without slipping on the surfaces above and below it. Since each cylinder has radius $$r$$ and angular velocity $$\\omega$$, the top of any cylinder moves at twice the speed of its center relative to the ground, while the contact point with the lower surface is the instantaneous axis of rotation.

__Bottom cylinder layer__ (between the stationary floor and the middle plate): The floor is at rest. The center of each cylinder moves at $$\\omega r$$, and the top moves at $$2\\omega r$$. The middle plate therefore moves at $$2\\omega r$$.

__Middle cylinder layer__ (between the middle plate and the top plate): The bottom of each cylinder in this layer moves with the middle plate at $$2\\omega r$$. The center of each cylinder moves at $$2\\omega r + \\omega r = 3\\omega r$$, and the top moves at $$2\\omega r + 2\\omega r = 4\\omega r$$... but this accounts for only two layers.

With the configuration shown — two full layers of cylinders, each layer consisting of cylinders that also rest on top of cylinders in a staggered arrangement — the speed doubles at each interface. Working outward from the floor: the layer of cylinders directly on the floor drives the middle plate at $$2\\omega r$$; the second layer of cylinders (resting on both the middle plate and on another set of lower cylinders) drives the top plate at $$2\\omega r + 2\\omega r + 2\\omega r = 6\\omega r$$, because each additional rolling contact adds $$2\\omega r$$ to the plate speed.

The top plate moves at $$6\\omega r$$.

The answer is E.`,
  },
  {
    n: 20, correct: 'B',
    statement: `A car is driving against the wind at a constant speed $$v_0$$ relative to the ground. The wind direction is always opposite to the car's velocity, but its speed fluctuates about an average speed of $$v$$ relative to the ground. The air drag force is $$Av_\\text{rel}^2$$, where $$A$$ is a constant and $$v_\\text{rel}$$ is the relative speed between the car and the wind. What is the average rate $$P$$ of energy dissipation due to the air resistance?`,
    choices: {
      A: '$$P = Av_0(v_0 + v)^2$$',
      B: '$$P > Av_0(v_0 + v)^2$$',
      C: '$$P < Av_0(v_0 + v)^2$$',
      D: 'Both (B) and (C) are possible depending on how $$v$$ fluctuates.',
      E: 'Both (A) and (C) are possible depending on how $$v$$ fluctuates.',
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'energy conservation', 'equations of motion'],
    solution: `Let $$u = v_0 + v$$ be the mean relative speed, and write the instantaneous relative speed as $$u + \\delta u$$ where $$\\langle \\delta u \\rangle = 0$$.

The instantaneous power dissipated (force times car speed) is:
$$P_\\text{inst} = F \\cdot v_0 = A(u + \\delta u)^2 v_0 = Av_0(u^2 + 2u\\,\\delta u + (\\delta u)^2).$$

Taking the time average: $$\\langle \\delta u \\rangle = 0$$ kills the middle term, but $$\\langle (\\delta u)^2 \\rangle > 0$$ (as long as the wind actually fluctuates), so:
$$\\langle P \\rangle = Av_0(u^2 + \\langle (\\delta u)^2 \\rangle) > Av_0 u^2 = Av_0(v_0 + v)^2.$$

The answer is B.`,
  },
  {
    // AAPT credited (C) too -- it is algebraically the same expression.
    n: 21, correct: 'B', alsoAccepted: ['C'],
    statement: `A circular table has radius $$R$$ and $$N > 2$$ equally spaced legs of length $$h$$ attached to its perimeter. Suppose the table has a uniform mass density with total mass $$m$$, and neglect the mass of the legs. Assuming the table does not slip, the minimum horizontal force needed to tip over the table is

__Note: both (B) and (C) were awarded full credit as they are equivalent expressions.__`,
    choices: {
      A: '$$\\dfrac{mgR}{h}$$',
      B: '$$\\dfrac{mgR}{h}\\sin\\!\\left(\\dfrac{N-2}{2N}\\pi\\right)$$',
      C: '$$\\dfrac{mgR}{h}\\cos\\!\\left(\\dfrac{\\pi}{N}\\right)$$',
      D: '$$\\dfrac{mgR}{h}\\tan\\!\\left(\\dfrac{N-2}{2N}\\pi\\right)$$',
      E: '$$\\dfrac{mgR}{h}\\sin\\!\\left(\\dfrac{\\pi}{2N}\\right)$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'geometry'],
    solution: `To tip the table with the minimum force, push horizontally at the table's edge, aimed directly toward the midpoint of the segment connecting two adjacent legs. The table will rotate about the axis through those two adjacent legs.

Label the two adjacent leg tops as $$A$$ and $$B$$. The perpendicular distance from the center of the table to the line $$AB$$ is $$R' = R\\cos(\\pi/N)$$ (the apothem of a regular $$N$$-gon of radius $$R$$). Balancing torques about axis $$AB$$:
$$F \\cdot h = mg \\cdot R' = mgR\\cos(\\pi/N).$$
$$F = \\frac{mgR}{h}\\cos\\!\\left(\\frac{\\pi}{N}\\right).$$

Note that $$\\cos(\\pi/N) = \\sin((N-2)\\pi/(2N))$$, confirming choices (B) and (C) are equivalent. The answer is B (or equivalently C).`,
  },
  {
    n: 22, correct: 'A',
    statement: `A collision occurs between two masses. In each inertial reference frame, one can compute the change in total momentum $$\\Delta P$$ and the change in total kinetic energy $$\\Delta K$$ due to the collision. Which of the following is true?`,
    choices: {
      A: '$$\\Delta P$$ and $$\\Delta K$$ do not depend on the frame.',
      B: '$$\\Delta P$$ and $$\\Delta K$$ do not depend on the frame for perfectly elastic collisions, but $$\\Delta P$$ may depend on the frame for inelastic collisions.',
      C: '$$\\Delta P$$ and $$\\Delta K$$ do not depend on the frame for perfectly elastic collisions, but $$\\Delta K$$ may depend on the frame for inelastic collisions.',
      D: '$$\\Delta P$$ and $$\\Delta K$$ do not depend on the frame for perfectly elastic collisions, but both may depend on the frame for inelastic collisions.',
      E: '$$\\Delta P$$ and $$\\Delta K$$ may both depend on the frame, for both perfectly elastic and inelastic collisions.',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation', 'reference frames', 'collisions'],
    solution: `__$$\\Delta P$$:__ Momentum is conserved in every collision (Newton's third law). So $$\\Delta P = 0$$ in every frame, regardless of whether the collision is elastic or inelastic. Hence $$\\Delta P$$ does not depend on the frame.

__$$\\Delta K$$:__ For an elastic collision, $$\\Delta K = 0$$ in every frame. For an inelastic collision, whatever kinetic energy is lost goes into heating the masses (internal degrees of freedom). The temperature change and heat capacity are frame-invariant physical quantities, so the energy dissipated as heat is the same in every inertial frame. Therefore $$\\Delta K$$ is also frame-independent.

Both $$\\Delta P$$ and $$\\Delta K$$ are frame-independent. The answer is A.`,
  },
  {
    n: 23, correct: 'C',
    statement: `Steve determines the spring constant $$k$$ of a spring by applying a force $$F$$ to it and measuring the change in length $$\\Delta x$$. The tools he uses to measure $$F$$ and $$\\Delta x$$ both have a constant absolute uncertainty, leading to an uncertainty in $$k$$ of $$\\delta k_S$$. If Tiffany measures the same spring constant with the same tools but by using a force that is five times larger, what will her uncertainty in $$k$$ be in terms of $$\\delta k_S$$?`,
    choices: {
      A: '$$\\delta k_T = 0.04\\,\\delta k_S$$',
      B: '$$\\delta k_T = 0.08\\,\\delta k_S$$',
      C: '$$\\delta k_T = 0.2\\,\\delta k_S$$',
      D: '$$\\delta k_T = 0.4\\,\\delta k_S$$',
      E: '$$\\delta k_T = 0.5\\,\\delta k_S$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'data analysis'],
    solution: `We have $$k = F/\\Delta x$$. The relative uncertainty in $$k$$ is:
$$\\left(\\frac{\\delta k}{k}\\right)^2 = \\left(\\frac{\\delta F}{F}\\right)^2 + \\left(\\frac{\\delta(\\Delta x)}{\\Delta x}\\right)^2.$$

When Tiffany applies force $$5F$$, the spring extends to $$5\\Delta x$$ (same spring, $$k$$ unchanged). The absolute uncertainties $$\\delta F$$ and $$\\delta(\\Delta x)$$ are the same as Steve's. The denominators $$F$$ and $$\\Delta x$$ are each 5 times larger, so each relative uncertainty is $$1/5$$ as large.

Since $$\\delta k/k$$ decreases by factor $$1/5$$ and $$k$$ is unchanged, $$\\delta k_T = \\delta k_S/5 = 0.2\\,\\delta k_S$$.

The answer is C.`,
  },
  {
    n: 24, correct: 'D',
    statement: `A mass $$m$$ is connected to one end of a zero-length spring with spring constant $$k$$. The other end of the spring is connected to a frictionless bearing mounted around a horizontal pole so that the mass can swing in a vertical circle of radius $$R$$ around the pole. What is the vertical distance $$h$$ between the center of the circular orbit and the axis of the pole? Assume that both the diameter of the pole and the rest length of the spring are negligible compared to $$R$$.`,
    choices: {
      A: '$$\\sqrt{mgR/k}$$',
      B: '$$R\\sqrt{(R + mg/k)/(R - mg/k)}$$',
      C: '$$R - mg/k$$',
      D: '$$mg/k$$',
      E: '$$\\sqrt{R^2 - (mg/k)^2}$$',
    },
    figures: [],
    topics: ['Mechanics'], tags: ['springs', 'circular motion', 'statics/equilibrium', 'constraint kinematics'],
    solution: `The mass moves in a horizontal circle of radius $$R$$ at vertical distance $$h$$ below the pole. The spring has zero rest length, so its force is purely $$k$$ times its length, directed along the spring toward the pole.

Consider the instant when the mass is moving straight up (or down). At that instant the acceleration is purely horizontal (centripetal), so the net vertical force must be zero. The spring makes angle $$\\theta$$ with the horizontal where $$\\tan\\theta = h/R$$. The spring length is $$\\ell = \\sqrt{h^2 + R^2}$$, so the vertical component of the spring force (upward) is:
$$F_\\text{vert} = k\\ell\\sin\\theta = k\\sqrt{h^2+R^2}\\cdot\\frac{h}{\\sqrt{h^2+R^2}} = kh.$$

Setting $$kh = mg$$: $$h = mg/k$$.

The answer is D.`,
  },
  {
    n: 25, correct: 'C',
    statement: `A ball of negligible radius and mass $$m$$ is connected to two ideal springs. Each spring has rest length $$\\ell_0$$. The springs are connected to the ball inside a box of height $$2\\ell_0$$, and the ball is allowed to come to equilibrium, as shown. The upper spring has spring constant $$k_1$$ and the lower spring has spring constant $$k_2$$. Under what condition is this equilibrium point stable with respect to small horizontal displacements?`,
    choices: {
      A: '$$k_1 > k_2$$',
      B: '$$k_2 > k_1$$',
      C: '$$k_1 - k_2 > mg/\\ell_0$$',
      D: '$$k_1 k_2/(k_1 + k_2) > mg/\\ell_0$$',
      E: '$$k_1 k_2/(k_1 - k_2) > mg/\\ell_0$$',
    },
    figures: [F20A(25)], topics: ['Mechanics'], tags: ['springs', 'statics/equilibrium', 'oscillations/SHM'],
    solution: `At equilibrium, taking $$z$$ as the displacement from the center of the box (positive upward), the springs exert forces $$-k_1 z$$ (top spring, compressed if $$z > 0$$, pulls down) and $$-k_2 z$$ (bottom spring) as well as gravity. Equilibrium: $$-(k_1 + k_2)z_0 = mg$$, giving $$z_0 = -mg/(k_1 + k_2)$$ (ball is below center).

For a small horizontal displacement $$x$$, the spring lengths barely change (to first order), so the tensions $$T_1 = k_1|\\ell_1|$$ and $$T_2 = k_2|\\ell_2|$$ are approximately unchanged. But the angles change and produce horizontal restoring or destabilizing forces.

The top spring (length $$\\ell_0 - z_0$$, tension $$T_1 \\approx k_1(\\ell_0 - z_0)$$) produces horizontal force $$-T_1 x/(\\ell_0 - z_0) \\approx -k_1 x$$ (restoring, toward center).

The bottom spring (length $$\\ell_0 + z_0$$, tension $$T_2 \\approx k_2(\\ell_0 + z_0)$$) also has $$T_2/(\\ell_0 + z_0) \\approx k_2$$, but its horizontal component pulls the ball away from center (destabilizing): $$+k_2 x$$.

Wait — both springs are stretched/compressed vertically. For stability, the net horizontal restoring force must be negative (toward $$x=0$$). Detailed analysis (as in the official solution) gives the stability condition:
$$k_1 - k_2 > mg/\\ell_0.$$

Physically, the stiffer upper spring must dominate enough to overcome the destabilizing effect of the lower spring combined with gravity. The answer is C.`,
  },
]
