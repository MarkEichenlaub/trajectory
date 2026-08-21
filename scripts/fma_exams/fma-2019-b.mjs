// Digitized 2019 F=ma Exam B questions. Sources:
// Exam: work/fma/fma-2019-b.pdf (text extracted to work/fma/fma-2019-b.txt)
// Answer key: work/fma/fma-2019-b-sol.pdf (←CORRECT markers)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2019.1 through 2019.25 under "Solutions for Exam B".
// Figures: work/figure_manifest.json, key "fma-2019-b" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions (Problems 2019-B.1
// through 2019-B.25).
// Q17 note: The book notes the original problem had a typo and students received
//   full credit. The intended answer D is confirmed by the solutions PDF.

const F19B = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-b/fma-2019-b-q${String(n).padStart(2, '0')}.png`

const CF19B = (n, letter) =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2019-b/fma-2019-b-q${String(n).padStart(2, '0')}${letter}.png`

export const examId = 'fma-2019-b'
export const questions = [
  {
    n: 1, correct: 'B',
    statement: `A uniform block of mass 10 kg is released at rest from the top of an incline of length 10 m and inclination 30°. The coefficients of static and kinetic friction between the incline and the block are $$\\mu_s = 0.15$$ and $$\\mu_k = 0.1$$. The end of the incline is connected to a frictionless horizontal surface. After a long time, how much energy is dissipated due to friction?`,
    choices: {
      A: '75 J',
      B: '87 J',
      C: '130 J',
      D: '147 J',
      E: '500 J',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'energy conservation', 'work-energy theorem'],
    solution: `First check whether the block slides. The component of gravity along the incline is $$mg\\sin\\theta = 10 \\times 10 \\times 0.5 = 50\\text{ N}$$, while the maximum static friction is $$\\mu_s mg\\cos\\theta = 0.15 \\times 100 \\times \\frac{\\sqrt{3}}{2} \\approx 13\\text{ N}$$. Since gravity exceeds maximum static friction, the block slides and kinetic friction applies.

The block starts with enough gravitational potential energy ($$mgh = 10 \\times 10 \\times 5 = 500\\text{ J}$$) to reach the bottom. Friction acts over the full 10 m incline length:

$$W_{\\text{friction}} = \\mu_k mg\\cos\\theta \\cdot L = 0.1 \\times 100 \\times \\frac{\\sqrt{3}}{2} \\times 10 \\approx 87\\text{ J}.$$

On the frictionless horizontal surface no further energy is dissipated, so the total energy lost is __87 J__. The answer is B.`,
  },
  {
    n: 2, correct: 'A',
    statement: `Three cubical blocks of the same volume are made out of wood, styrofoam, and plastic. When the plastic block is placed in water, half of its volume is submerged. If the wooden block is placed in water with the plastic block on top, the wooden block is just fully submerged. Similarly, if the styrofoam block is placed in oil with the plastic block on top, the styrofoam block is just fully submerged. The density of oil is 0.7 times that of the water. What is the ratio of the density of wood to the density of styrofoam, $$\\rho_{\\text{wood}}/\\rho_{\\text{styrofoam}}$$?`,
    choices: {
      A: '2.5',
      B: '0.5',
      C: '0.7',
      D: '1.4',
      E: '1',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `Let $$\\rho_0$$ be the density of water and $$V$$ be the volume of each block.

__Plastic block alone in water:__ Half submerged means the buoyant force equals its weight:
$$\\rho_0 g \\cdot \\tfrac{1}{2}V = \\rho_{\\text{plastic}} V g \\implies \\rho_{\\text{plastic}} = \\tfrac{1}{2}\\rho_0.$$

__Wood + plastic in water (wood just fully submerged):__ The buoyant force on the pair equals both weights:
$$\\rho_0 V g = (\\rho_{\\text{wood}} + \\rho_{\\text{plastic}})Vg \\implies \\rho_{\\text{wood}} = \\rho_0 - \\tfrac{1}{2}\\rho_0 = \\tfrac{1}{2}\\rho_0.$$

__Styrofoam + plastic in oil (styrofoam just fully submerged):__ The oil's buoyant force on the styrofoam equals both weights:
$$0.7\\rho_0 V g = (\\rho_{\\text{styrofoam}} + \\rho_{\\text{plastic}})Vg \\implies \\rho_{\\text{styrofoam}} = 0.7\\rho_0 - 0.5\\rho_0 = 0.2\\rho_0.$$

Therefore $$\\rho_{\\text{wood}}/\\rho_{\\text{styrofoam}} = \\frac{0.5}{0.2} = 2.5$$. The answer is A.`,
  },
  {
    n: 3, correct: 'C',
    statement: `Two springs of spring constants $$k_1$$ and $$k_2$$, respectively, are connected in series and stretched, as shown below. What is the ratio of their potential energies, $$U_1/U_2$$?`,
    choices: {
      A: '$$1$$',
      B: '$$k_1/k_2$$',
      C: '$$k_2/k_1$$',
      D: '$$(k_1/k_2)^2$$',
      E: '$$(k_2/k_1)^2$$',
    },
    figures: [F19B(3)], topics: ['Mechanics'], tags: ['springs', 'potential energy', 'statics/equilibrium'],
    solution: `Springs in series carry the same tension $$F$$, so $$k_1 x_1 = k_2 x_2 = F$$, meaning $$x_i = F/k_i$$.

The potential energy of each spring is $$U_i = \\tfrac{1}{2}k_i x_i^2 = \\tfrac{F^2}{2k_i}$$. Therefore

$$\\frac{U_1}{U_2} = \\frac{F^2/(2k_1)}{F^2/(2k_2)} = \\frac{k_2}{k_1}.$$

Intuitively, the stiffer spring stretches less, so it stores less energy even though the force is the same. The answer is C.`,
  },
  {
    n: 4, correct: 'D',
    statement: `Consider two identical masses that interact only by gravitational attraction to each other. If one mass is fixed in place and the other is released from rest, then the two masses collide in time $$T$$. If both masses are released from rest, they collide in time`,
    choices: {
      A: '$$T/4$$',
      B: '$$T/(2\\sqrt{2})$$',
      C: '$$T/2$$',
      D: '$$T/\\sqrt{2}$$',
      E: '$$T$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'energy conservation', 'reference frames'],
    solution: `When both masses are free to move, work in the center-of-mass frame. The kinetic energy released by gravity goes equally into both masses, so each has speed $$v/\\sqrt{2}$$ when the fixed-mass case would give speed $$v$$. The relative velocity is therefore $$\\sqrt{2}$$ times larger than in the one-fixed case.

Because the relative speed is uniformly $$\\sqrt{2}$$ times larger at every separation, the same distance is covered in $$1/\\sqrt{2}$$ of the time. The collision occurs in time $$T/\\sqrt{2}$$. The answer is D.`,
  },
  {
    n: 5, correct: 'E',
    statement: `The density of the Earth increases gradually from around 3 g/cm³ at the crust to about 13 g/cm³ at the core. Which one of these plots could show local gravitational acceleration as a function of distance from Earth's center?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF19B(5, 'A'),
      B: CF19B(5, 'B'),
      C: CF19B(5, 'C'),
      D: CF19B(5, 'D'),
      E: CF19B(5, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'shell theorem', 'graph interpretation'],
    solution: `At the Earth's center, symmetry requires $$g = 0$$, so graphs A and D (which do not pass through the origin) are eliminated.

For a constant-density planet, by the shell theorem the enclosed mass grows as $$r^3$$, giving $$g \\propto r$$ — a straight line through the origin, like graph B.

Earth's density decreases with radius, so the enclosed mass grows __slower__ than $$r^3$$. This means $$g$$ grows more slowly than linearly (and may even decrease), which matches only graph E.

The answer is E.`,
  },
  {
    n: 6, correct: 'C',
    statement: `A very long cylinder of dust is spinning about its axis with angular velocity $$\\omega$$ at steady state. Let $$r$$ be the distance from the axis. If the dust is only held together by gravity, the density of the dust is proportional to:`,
    choices: {
      A: '$$r^{-2}$$',
      B: '$$r^{-1}$$',
      C: 'the density does not depend on $$r$$.',
      D: '$$r$$',
      E: '$$r^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'circular motion', 'dimensional analysis'],
    solution: `Apply Gauss's law for gravity to a cylindrical Gaussian surface of radius $$r$$ and length $$\\ell$$:

$$(2\\pi r \\ell)\\,g = 4\\pi G M_{\\text{enc}},$$

so $$g = 2G\\lambda/r$$, where $$\\lambda = M_{\\text{enc}}/\\ell$$ is the enclosed linear mass density.

For steady-state rotation the gravitational pull at radius $$r$$ must supply the centripetal acceleration:

$$g = \\omega^2 r \\implies \\frac{2G\\lambda}{r} = \\omega^2 r \\implies \\lambda = \\frac{\\omega^2 r^2}{2G}.$$

Since $$\\lambda = \\pi r^2 \\rho$$, we get $$\\pi r^2 \\rho = \\frac{\\omega^2 r^2}{2G}$$, so $$\\rho$$ is constant — it does not depend on $$r$$. The answer is C.`,
  },
  {
    n: 7, correct: 'B',
    statement: `A trough half-filled with water is suspended from wires, as shown. The tension is initially the same in each wire.

A boat is placed in the trough directly under the left wire. It floats without touching the sides of the trough or overflowing the water. How does the tension in the wires change as a result?`,
    choices: {
      A: 'The tension is not affected in either wire.',
      B: 'The tension increases equally in both wires.',
      C: 'The tension increases in the left wire and decreases in the right wire.',
      D: 'The tension increases in the left wire and stays the same in the right wire.',
      E: 'The tension increases in the left wire and increases by a smaller amount in the right wire.',
    },
    figures: [F19B(7)], topics: ['Mechanics'], tags: ['fluid statics', 'pressure', 'statics/equilibrium'],
    solution: `The boat touches only the water (not the wires or trough walls). By Pascal's law, pressure is transmitted uniformly throughout the water, so the water exerts the same pressure distribution on the trough floor regardless of where the boat sits. This means the force from the water is spread evenly over the trough — there is no net torque imbalance.

Adding the boat increases the total weight of the system (boat + water + trough) by the boat's weight. The wires must together support this extra weight. Since the pressure remains balanced, both wires increase equally.

The answer is B.`,
  },
  {
    n: 8, correct: 'A',
    statement: `A scale is calibrated so that it gives a correct reading when sitting on the ground. A person holds the scale and presses it on both sides with their hands, pushing up on the bottom with the left hand and pushing down on the top with the right. The scale has a mass of 5 kg, and their left hand exerts a force of 200 N. The reading on the scale is:`,
    choices: {
      A: '15 kg',
      B: '20 kg',
      C: '35 kg',
      D: '40 kg',
      E: '45 kg',
    },
    figures: [], topics: ['Mechanics'], tags: ['newton\'s laws', 'normal force', 'free-body diagrams'],
    solution: `A calibrated scale reads the compressive force across it. Consider the scale as a system: the left hand pushes up with 200 N and the scale weighs $$5 \\times 10 = 50\\text{ N}$$. For the scale to be in equilibrium (held steady), the force from the right hand pressing down on the top must equal $$200 - 50 = 150\\text{ N}$$.

The scale measures this 150 N compression. Calibrated in kg (dividing by $$g = 10\\text{ N/kg}$$), it reads $$150/10 = 15\\text{ kg}$$. The answer is A.`,
  },
  {
    n: 9, correct: 'B',
    statement: `A light board of length $$\\ell$$ is hinged to a vertical wall. A solid ball of weight $$G$$ and radius $$R$$ is held between the wall and the board by a force $$F$$ applied perpendicular at the end of the board, as shown in the figure below. Both the wall and the board are frictionless. The angle between the board and the wall is 60°. What is the magnitude of $$F$$?`,
    choices: {
      A: '$$\\dfrac{2}{\\sqrt{3}}G$$',
      B: '$$\\dfrac{2R}{\\ell}G$$',
      C: '$$\\dfrac{2R}{\\sqrt{3}\\,\\ell}G$$',
      D: '$$\\dfrac{4R}{\\sqrt{3}\\,\\ell}G$$',
      E: '$$\\dfrac{\\sqrt{3}\\,R}{\\ell}G$$',
    },
    figures: [F19B(9)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium', 'free-body diagrams'],
    solution: `Balance torques on the board about the hinge. The board is frictionless, so it can only exert a normal force $$N$$ on the ball, perpendicular to the board.

__Force on the ball:__ The ball is in equilibrium under its weight $$G$$ downward, the normal from the board (perpendicular to board), and the normal from the wall (horizontal, away from wall). For the vertical component of the board's normal force to equal $$G$$:

$$N\\sin 60^\\circ = G \\implies N = \\frac{2G}{\\sqrt{3}}.$$

__Contact point geometry:__ With the angle between wall and board equal to 60°, and the ball of radius $$R$$ tangent to both surfaces, the contact point lies a distance $$R/\\sin 60^\\circ = \\frac{2R}{\\sqrt{3}}$$ from the hinge measured along the board (by trigonometry of the inscribed geometry). The lever arm of $$N$$ (perpendicular to board, so moment arm equals distance along board) is $$\\frac{2R}{\\sqrt{3}} \\cdot \\sin 60^\\circ = R\\cdot\\ldots$$

More directly: balance torques about the hinge. The torque from $$N$$ (perpendicular to the board) has moment arm equal to the distance along the board to the contact point. That distance is $$\\sqrt{3}R$$. The torque from $$F$$ (perpendicular to the board, applied at the end) has moment arm $$\\ell$$. So:

$$N \\cdot \\sqrt{3}R = F\\ell \\implies F = \\frac{\\sqrt{3}R \\cdot N}{\\ell} = \\frac{\\sqrt{3}R}{\\ell} \\cdot \\frac{2G}{\\sqrt{3}} = \\frac{2RG}{\\ell}.$$

The answer is B.`,
  },
  {
    n: 10, correct: 'D',
    statement: `A ball of mass $$m$$ rolls in a bowl bolted on a cart. The bowl and cart move together and have a combined mass $$M_c$$, as shown in the figure. Initially, the cart moves to the right with speed $$v_0$$ with respect to the ground, while the ball is at rest with respect to the cart. The ball then slides down to the bottom of the bowl. When it reaches the bottom of the bowl, it moves with velocity $$v_b$$ with respect to the cart. At this instant, how fast is the cart moving with respect to the ground?`,
    choices: {
      A: '$$v_0 - v_b$$',
      B: '$$v_0 - \\dfrac{m}{M_c}v_b$$',
      C: '$$\\dfrac{M_c v_0 - mv_b}{M_c + m}$$',
      D: '$$\\dfrac{(m + M_c)v_0 - mv_b}{m + M_c}$$',
      E: 'The answer depends on the coefficient of friction between the ball and bowl.',
    },
    figures: [F19B(10)], topics: ['Mechanics'], tags: ['momentum conservation', 'reference frames'],
    solution: `Friction between ball and bowl is an internal force, so horizontal momentum of the entire system is conserved (no external horizontal forces).

Initially, both ball and cart move at $$v_0$$ to the right. Total initial momentum: $$(m + M_c)v_0$$.

Let $$v_c$$ be the final cart velocity (in the ground frame). The ball's velocity in the ground frame is $$v_c + v_b$$ (cart velocity plus ball velocity relative to cart).

Momentum conservation:
$$(m + M_c)v_0 = M_c v_c + m(v_c + v_b) = (m + M_c)v_c + mv_b.$$

Solving: $$v_c = \\frac{(m + M_c)v_0 - mv_b}{m + M_c} = v_0 - \\frac{m}{m + M_c}v_b.$$

The answer is D.`,
  },
  {
    n: 11, correct: 'A',
    statement: `Consider a flat uniform square of mass $$M$$ and side length $$L$$. Cut a circle out of the square that has a diameter equal to the length of the side of the square, with the same center as the square. Determine the moment of inertia of the remaining shape about an axis through the center and perpendicular to the plane of the square.`,
    choices: {
      A: '$$\\left(\\dfrac{1}{6} - \\dfrac{\\pi}{32}\\right)ML^2$$',
      B: '$$\\left(\\dfrac{1}{12} - \\dfrac{\\pi}{64}\\right)ML^2$$',
      C: '$$\\left(\\dfrac{\\pi}{24} - \\dfrac{1}{3\\pi}\\right)ML^2$$',
      D: '$$\\left(\\dfrac{1}{2\\pi} - \\dfrac{1}{16}\\right)ML^2$$',
      E: '$$\\left(\\dfrac{1}{2\\pi} - \\dfrac{1}{8}\\right)ML^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['moment of inertia', 'rotational dynamics'],
    solution: `Use the perpendicular axis theorem and the additivity of moments of inertia.

__Full square:__ The moment of inertia of a uniform square of mass $$M$$ and side $$L$$ about a central axis perpendicular to its plane is $$I_{\\text{sq}} = \\frac{1}{6}ML^2$$ (by the perpendicular axis theorem: $$I_x = I_y = \\frac{1}{12}ML^2$$ for axes through the center along each side, so $$I_z = I_x + I_y = \\frac{1}{6}ML^2$$).

__Removed circle:__ The circle has diameter $$L$$, so radius $$L/2$$. Its mass is the fraction of the square's area it occupies: $$M_c = M \\cdot \\frac{\\pi(L/2)^2}{L^2} = \\frac{\\pi}{4}M$$. Its moment of inertia about the same central axis (using $$I = \\frac{1}{2}M_c R^2$$) is:
$$I_{\\text{circle}} = \\frac{1}{2} \\cdot \\frac{\\pi M}{4} \\cdot \\frac{L^2}{4} = \\frac{\\pi M L^2}{32}.$$

__Remaining shape:__
$$I = I_{\\text{sq}} - I_{\\text{circle}} = \\frac{1}{6}ML^2 - \\frac{\\pi}{32}ML^2 = \\left(\\frac{1}{6} - \\frac{\\pi}{32}\\right)ML^2.$$

The answer is A.`,
  },
  {
    n: 12, correct: 'C',
    statement: `Two planets A and B have masses $$m_A = 2m_B$$. They orbit a star in circular orbits of radius $$r_A = 3r_B$$. Let $$E_i$$ and $$L_i$$ be the kinetic energy and the magnitude of the angular momentum of planet $$i$$, respectively. Which of the following is true?`,
    choices: {
      A: '$$E_A > E_B$$ and $$L_A > L_B$$',
      B: '$$E_A > E_B$$ and $$L_A < L_B$$',
      C: '$$E_A < E_B$$ and $$L_A > L_B$$',
      D: '$$E_A < E_B$$ and $$L_A < L_B$$',
      E: '$$E_A = E_B$$ and $$L_A > L_B$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'kepler\'s laws', 'angular momentum'],
    solution: `For a circular orbit, gravitational force provides centripetal acceleration: $$\\frac{GMm}{r^2} = \\frac{mv^2}{r}$$, giving $$v = \\sqrt{GM/r}$$.

__Kinetic energy:__ $$E = \\frac{1}{2}mv^2 = \\frac{GMm}{2r} \\propto \\frac{m}{r}$$.

$$\\frac{E_A}{E_B} = \\frac{m_A/r_A}{m_B/r_B} = \\frac{2m_B/(3r_B)}{m_B/r_B} = \\frac{2}{3} < 1, \\text{ so } E_A < E_B.$$

__Angular momentum:__ $$L = mvr = m\\sqrt{GM/r}\\cdot r = m\\sqrt{GMr} \\propto m\\sqrt{r}$$.

$$\\frac{L_A}{L_B} = \\frac{m_A\\sqrt{r_A}}{m_B\\sqrt{r_B}} = \\frac{2m_B\\sqrt{3r_B}}{m_B\\sqrt{r_B}} = 2\\sqrt{3} > 1, \\text{ so } L_A > L_B.$$

The answer is C.`,
  },
  {
    n: 13, correct: 'D',
    statement: `A water hose is at ground level against the base of a large wall. By aiming the hose at some angle, and squirting water at a speed $$v$$, one wets a region on the wall, as shown below. If the speed of the water is doubled, what is the new region that can be wetted? Ignore the effect of water splashing beyond the point of contact.

In the answer choices, the dotted line marks the initial wetted region.`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF19B(13, 'A'),
      B: CF19B(13, 'B'),
      C: CF19B(13, 'C'),
      D: CF19B(13, 'D'),
      E: CF19B(13, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'projectile motion', 'scaling'],
    solution: `The only dimensional quantities in this problem are the water speed $$v$$ and gravitational acceleration $$g$$. All lengths in the problem must therefore be proportional to $$v^2/g$$.

When $$v$$ is doubled, $$v^2$$ quadruples, so all lengths — both the height and width of the wetted region — scale by a factor of 4.

This can be verified explicitly: the maximum height is achieved by aiming nearly straight up, giving $$H_{\\\\max} = v^2/(2g) \\propto v^2$$. The maximum horizontal range (width of the wetted region at ground level) also goes as $$v^2 \\sin 2\\theta / g$$. Both scale as $$v^2$$, so doubling $$v$$ quadruples both height and width.

The answer is D (four times height, four times width).`,
  },
  {
    n: 14, correct: 'E',
    statement: `A ball is launched at speed $$v$$ at angle $$\\theta$$ above the horizontal toward a vertical wall a distance $$L$$ away. It bounces elastically off the wall and falls back to its launch point. What was its initial speed?`,
    choices: {
      A: '$$\\sqrt{\\dfrac{Lg}{\\tan\\theta}}$$',
      B: '$$\\sqrt{\\dfrac{Lg}{\\sqrt{\\tan\\theta}}}$$',
      C: '$$\\sqrt{\\dfrac{Lg}{\\sin\\theta}}$$',
      D: '$$\\sqrt{\\dfrac{Lg}{\\sqrt{\\sin\\theta}}}$$',
      E: '$$\\sqrt{\\dfrac{2Lg}{\\sin 2\\theta}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d'],
    solution: `An elastic bounce off a vertical wall reverses only the horizontal component of velocity, leaving the vertical component unchanged. This is equivalent to the ball passing through the wall and landing at a point $$2L$$ away from the launch point.

Applying the range formula $$d = \\frac{v^2 \\sin 2\\theta}{g}$$ with range $$2L$$:

$$2L = \\frac{v^2 \\sin 2\\theta}{g} \\implies v = \\sqrt{\\frac{2Lg}{\\sin 2\\theta}}.$$

The answer is E.`,
  },
  {
    n: 15, correct: 'D',
    statement: `A mass of $$M = 100\\text{ g}$$ is attached to the end of a string of length $$R = 2\\text{ m}$$. A person swings the mass overhead such that their hand traverses a circle of radius $$r = 3\\text{ cm}$$ at angular velocity $$\\omega = 10\\text{ rad/s}$$, ahead of the mass $$M$$ by an angle of $$\\pi/2$$. Estimate the force of air resistance on the object.`,
    choices: {
      A: '0.02 N',
      B: '0.03 N',
      C: '0.2 N',
      D: '0.3 N',
      E: '2 N',
    },
    figures: [F19B(15)], topics: ['Mechanics'], tags: ['circular motion', 'power', 'estimation', 'drag force'],
    solution: `Since $$r \\ll R$$, the string is nearly radial and the tension approximately equals the centripetal force on $$M$$:

$$T \\approx M\\omega^2 R = 0.1 \\times 100 \\times 2 = 20\\text{ N}.$$

The system is in steady state (constant kinetic energy), so the power input by the hand equals the power dissipated by air resistance. The hand moves at speed $$v_h = \\omega r = 10 \\times 0.03 = 0.3\\text{ m/s}$$ and is $$\\pi/2$$ ahead of the mass, so it pulls nearly tangentially on the string. The tangential component of the tension on the hand is approximately $$T \\cdot (r/R)$$ (by similar triangles).

The power delivered by the hand to the mass via the string is $$P = T_\\text{tang} \\cdot v_h$$, and the power dissipated by air resistance on the mass moving at speed $$v_M = \\omega R = 20\\text{ m/s}$$ is $$P = F_\\text{air} \\cdot v_M$$.

Using power balance: $$T \\cdot \\omega r = F_\\text{air} \\cdot \\omega R$$, so $$F_\\text{air} = T \\cdot r/R = 20 \\times 0.03/2 = 0.3\\text{ N}$$. The answer is D.`,
  },
  {
    n: 16, correct: 'B',
    statement: `The following information applies to questions 16 and 17.

A hoop of radius $$r$$ is launched to the right at initial speed $$v_0$$ at ground-level. As it is launched, it is also spun counterclockwise at angular velocity $$3v_0/r$$. The coefficient of kinetic friction between the ground and the hoop is $$\\mu_k$$.

How long does it take the hoop to return to its starting position?`,
    choices: {
      A: '$$\\dfrac{v_0}{2\\mu_k g}$$',
      B: '$$\\dfrac{2v_0}{\\mu_k g}$$',
      C: '$$\\dfrac{\\mu_k v_0}{2g}$$',
      D: '$$\\dfrac{\\mu_k v_0}{g}$$',
      E: '$$\\dfrac{2\\mu_k v_0}{g}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'rotational dynamics', 'angular momentum conservation'],
    solution: `While slipping occurs, kinetic friction $$F_k = \\mu_k mg$$ acts leftward on the hoop (since the contact point moves to the right — the spin is counterclockwise but the hoop translates rightward).

The linear deceleration is $$a = -\\mu_k g$$ and the angular acceleration is $$\\alpha = +\\mu_k g/r$$ (friction provides a clockwise torque, reducing the counterclockwise spin). Starting with $$v_c(0) = v_0$$ and $$\\omega(0) = -3v_0/r$$ (counterclockwise taken as negative for the rolling condition):

Slipping stops when $$v_c(T) = r\\omega(T)$$:
$$(v_0 - \\mu_k g T) = r(-3v_0/r + \\mu_k g T/r) = -3v_0 + \\mu_k g T.$$
$$v_0 - \\mu_k g T = -3v_0 + \\mu_k g T \\implies 4v_0 = 2\\mu_k g T \\implies T = \\frac{2v_0}{\\mu_k g}.$$

At time $$T$$, the velocity is $$v_c(T) = v_0 - \\mu_k g \\cdot \\frac{2v_0}{\\mu_k g} = -v_0$$. Since the acceleration was constant, and the hoop went from $$+v_0$$ to $$-v_0$$ uniformly, the displacement is zero — it has returned exactly to its starting position. The answer is B.`,
  },
  {
    n: 17, correct: 'D',
    statement: `The following information applies to questions 16 and 17.

A hoop of radius $$r$$ is launched to the right at initial speed $$v_0$$ at ground-level. As it is launched, it is also spun counterclockwise at angular velocity $$3v_0/r$$. The coefficient of kinetic friction between the ground and the hoop is $$\\mu_k$$.

Would the answer to the previous question, namely the amount of time to return to the starting position, be the same for a uniform disk with the same coefficient of friction launched with the same initial conditions?`,
    choices: {
      A: 'Yes.',
      B: 'No, because the torque due to friction is larger for the hoop.',
      C: 'No, because the disk never returns to its starting position.',
      D: 'No, because the disk stops slipping too soon.',
      E: 'There is not enough information to decide.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'rotational dynamics', 'moment of inertia'],
    solution: `For a disk, $$I = \\frac{1}{2}mr^2$$ (half that of the hoop), so the angular acceleration from friction is twice as large: $$\\alpha' = 2\\mu_k g/r$$. The rolling condition $$v_c(T') = r\\omega(T')$$ gives:

$$(v_0 - \\mu_k g T') = r(-3v_0/r + 2\\mu_k g T'/r) = -3v_0 + 2\\mu_k g T'.$$
$$4v_0 = 3\\mu_k g T' \\implies T' = \\frac{4v_0}{3\\mu_k g}.$$

At this point, $$v_c(T') = v_0 - \\mu_k g \\cdot \\frac{4v_0}{3\\mu_k g} = -\\frac{v_0}{3}$$, and the displacement is $$x(T') = \\frac{4v_0^2}{9\\mu_k g} > 0$$ — the disk has not yet returned!

After slipping stops, the disk rolls at constant velocity $$-v_0/3$$ back toward the start. The additional time to cover $$x(T')$$ is $$\\frac{4v_0}{3\\mu_k g}$$, for a total of $$\\frac{8v_0}{3\\mu_k g} \\neq T$$. The disk stops slipping too soon (before returning), so the answer is D.`,
  },
  {
    n: 18, correct: 'A',
    statement: `You are predicting the time for a car to complete a race. The car begins with an initial speed $$v_0$$ and maintains a constant acceleration $$a$$ throughout the race. Both $$v_0$$ and $$a$$ have independent uncertainties of 10%. Which contributes greater uncertainty to your estimate of the time for the car to complete the race?`,
    choices: {
      A: 'The uncertainty in $$v_0$$ for sufficiently short races and the uncertainty in $$a$$ for sufficiently long races.',
      B: 'The uncertainty in $$v_0$$ for sufficiently long races and the uncertainty in $$a$$ for sufficiently short races.',
      C: 'The uncertainty in $$v_0$$.',
      D: 'The uncertainty in $$a$$.',
      E: 'They contribute equally in the uncertainty.',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', '1d kinematics'],
    solution: `The car covers distance $$d = v_0 t + \\frac{1}{2}at^2$$. The average speed is $$\\bar{v} = v_0 + \\frac{1}{2}at$$, so the uncertainty in $$\\bar{v}$$ comes from two terms: $$\\sigma_{v_0}$$ (from initial speed) and $$\\frac{1}{2}\\sigma_a t$$ (from acceleration).

For __short__ races, $$at \\ll v_0$$, so $$\\bar{v} \\approx v_0$$ and uncertainty in $$v_0$$ dominates.

For __long__ races, $$at \\gg v_0$$, so $$\\bar{v} \\approx \\frac{1}{2}at$$ and uncertainty in $$a$$ dominates.

The answer is A.`,
  },
  {
    n: 19, correct: 'A',
    statement: `A physical pendulum consists of a mass on one end of a massless rigid rod that can pivot about the opposite end. Assuming the oscillations have an amplitude of 90°, which of the following graphs best shows the total acceleration of the mass as a function of the angular position $$\\theta$$, measured between the pendulum and the vertical direction?`,
    choices: {
      A: 'Starts at 20 m/s² at $$\\theta=0°$$, decreases in a concave-up curve to 10 m/s² at $$\\theta=90°$$.',
      B: 'Constant at 10 m/s² for all $$\\theta$$.',
      C: 'Starts at 20 m/s² at $$\\theta=0°$$, decreases in a nearly straight line to 0 at $$\\theta=90°$$.',
      D: 'Starts at 20 m/s² at $$\\theta=0°$$, decreases in a concave-down curve to 0 at $$\\theta=90°$$.',
      E: 'Starts at about 10 m/s² at $$\\theta=0°$$, rises to a peak near 20 m/s², then falls back to about 10 m/s² at $$\\theta=90°$$.',
    },
    figures: [],
    topics: ['Mechanics'], tags: ['pendulum', 'circular motion', 'graph interpretation', 'energy conservation'],
    solution: `Let $$\\ell$$ be the pendulum length and $$g = 10\\text{ m/s}^2$$. Released from $$\\theta = 90°$$ (horizontal), energy conservation gives speed at angle $$\\theta$$:

$$\\frac{1}{2}mv^2 = mg\\ell\\cos\\theta \\implies v^2 = 2g\\ell\\cos\\theta.$$

The radial (centripetal) acceleration is $$a_r = v^2/\\ell = 2g\\cos\\theta$$. The tangential acceleration is $$a_t = g\\sin\\theta$$.

Total acceleration magnitude:
$$a = \\sqrt{a_r^2 + a_t^2} = \\sqrt{4g^2\\cos^2\\theta + g^2\\sin^2\\theta} = g\\sqrt{1 + 3\\cos^2\\theta}.$$

At $$\\theta = 90°$$: $$a = g\\sqrt{1+0} = g = 10\\text{ m/s}^2$$. At $$\\theta = 0°$$: $$a = g\\sqrt{1+3} = 2g = 20\\text{ m/s}^2$$. The function decreases monotonically from 20 at $$0°$$ to 10 at $$90°$$. This matches graph A. The answer is A.`,
  },
  {
    n: 20, correct: 'C',
    statement: `A block on a ramp is given an initial velocity $$v_0$$ upward along the ramp. It slides upward for a time $$t_u$$, traveling some distance, and then slides downward for a time $$t_d$$ until it returns to its original position. What is $$t_d$$ in terms of $$t_u$$?

The height of the incline is 0.6 times its length and the coefficient of kinetic friction between the block and the incline is 0.5.`,
    choices: {
      A: '$$t_u/5$$',
      B: '$$t_u/\\sqrt{5}$$',
      C: '$$\\sqrt{5}\\,t_u$$',
      D: '$$2t_u$$',
      E: '$$5t_u$$',
    },
    figures: [F19B(20)], topics: ['Mechanics'], tags: ['friction', '1d kinematics', 'equations of motion'],
    solution: `The incline has $$\\sin\\theta = 0.6$$ and $$\\cos\\theta = 0.8$$.

__Going up:__ friction and gravity both act downward along the ramp.
$$a_u = g\\sin\\theta + \\mu_k g\\cos\\theta = 10(0.6) + 0.5 \\times 10(0.8) = 6 + 4 = 10\\text{ m/s}^2.$$

__Going down:__ gravity acts downward, friction acts upward.
$$a_d = g\\sin\\theta - \\mu_k g\\cos\\theta = 6 - 4 = 2\\text{ m/s}^2.$$

For motion starting or ending at rest over the same distance $$d$$: $$d = \\frac{1}{2}a t^2$$, so $$t \\propto 1/\\sqrt{a}$$.

$$\\frac{t_d}{t_u} = \\sqrt{\\frac{a_u}{a_d}} = \\sqrt{\\frac{10}{2}} = \\sqrt{5}.$$

The answer is C.`,
  },
  {
    n: 21, correct: 'E',
    statement: `An empty freight car on a level railroad track has a mass $$M$$. A chute above the freight car opens and grain falls down into the car at a rate of $$r$$, measured in kilograms per second. The grain falls a vertical distance $$h$$ before hitting the bed of the freight car without bouncing up. How much normal force is exerted on the freight car from the rails at a time $$t$$ after the grain begins to hit the bed of the car? Assume the grain starts from rest.`,
    choices: {
      A: '$$Mg + rtg$$',
      B: '$$Mg + r\\sqrt{gh}$$',
      C: '$$Mg + r\\sqrt{2gh}$$',
      D: '$$Mg + r\\sqrt{gh} + rtg$$',
      E: '$$Mg + r\\sqrt{2gh} + rtg$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'impulse', 'newton\'s laws', 'normal force'],
    solution: `The normal force from the rails must balance all downward forces on the freight car system.

__Weight of car:__ $$Mg$$.

__Weight of accumulated grain:__ After time $$t$$, mass $$rt$$ has collected, weighing $$rtg$$.

__Impact force:__ In a small interval $$\\Delta t$$, mass $$\\Delta m = r\\,\\Delta t$$ falls from height $$h$$ and arrives with speed $$v = \\sqrt{2gh}$$ (by energy conservation). This grain's momentum $$\\Delta p = r\\,\\Delta t\\,\\sqrt{2gh}$$ is absorbed by the car. The average force is:
$$F_{\\text{impact}} = \\frac{\\Delta p}{\\Delta t} = r\\sqrt{2gh}.$$

Total normal force: $$N = Mg + rtg + r\\sqrt{2gh}$$. The answer is E.`,
  },
  {
    n: 22, correct: 'C',
    statement: `The bruise threshold for a fruit is the largest height it can be dropped from rest without bruising. The bruise threshold of a 0.2 kg apple on steel is 10 cm. Suppose that it always takes 0.1 seconds after impact for the apple to fully stop and that 4 cm² of the apple comes into contact with the surface during the impact. What minimum average pressure is required to cause the apple to bruise?`,
    choices: {
      A: '67 Pa',
      B: '210 Pa',
      C: '7100 Pa',
      D: '23 000 Pa',
      E: '67 000 Pa',
    },
    figures: [], topics: ['Mechanics'], tags: ['impulse', 'pressure', 'estimation'],
    solution: `An apple dropped from the bruise threshold $$h = 0.10\\text{ m}$$ hits the ground with speed $$v = \\sqrt{2gh} = \\sqrt{2 \\times 10 \\times 0.10} = \\sqrt{2}\\text{ m/s}$$.

Its momentum at impact is $$p = mv = 0.2\\sqrt{2} \\approx 0.283\\text{ kg·m/s}$$.

Stopping in time $$t = 0.1\\text{ s}$$, the average force is:
$$F = p/t = 0.2\\sqrt{2}/0.1 = 2\\sqrt{2} \\approx 2.83\\text{ N}.$$

Over contact area $$A = 4\\text{ cm}^2 = 4 \\times 10^{-4}\\text{ m}^2$$:
$$P = F/A = \\frac{0.2\\sqrt{2 \\times 10 \\times 0.10}}{(4 \\times 10^{-4})(0.1)} = \\frac{0.2 \\times \\sqrt{2}}{4 \\times 10^{-5}} \\approx 7100\\text{ Pa}.$$

The answer is C.`,
  },
  {
    n: 23, correct: 'B',
    statement: `A train travels at 360 km/hr on an almost straight track. The track is slightly sinusoidal, with a vertical amplitude of $$h$$ over a 1 km distance, as shown in the figure. If the maximum tolerable vertical acceleration of the train is set at 0.1 m/s², what is the maximum allowable size of $$h$$?`,
    choices: {
      A: '12.5 cm',
      B: '25 cm',
      C: '50 cm',
      D: '100 cm',
      E: '1000 cm',
    },
    figures: [F19B(23)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'kinematics-2d'],
    solution: `The train speed is $$v = 360\\text{ km/hr} = 100\\text{ m/s}$$ and the wavelength of the sinusoidal track is $$\\lambda = 1\\text{ km} = 1000\\text{ m}$$.

The period of vertical oscillation is $$T = \\lambda/v = 10\\text{ s}$$, giving angular frequency $$\\omega = 2\\pi/T$$.

For sinusoidal vertical motion $$y(t) = h\\sin(\\omega t)$$, the maximum vertical acceleration is $$a_{\\\\max} = \\omega^2 h$$:

$$a_{\\\\max} = \\left(\\frac{2\\pi v}{\\lambda}\\right)^2 h \\leq 0.1\\text{ m/s}^2.$$

$$h \\leq \\frac{0.1}{\\omega^2} = \\frac{0.1 \\lambda^2}{4\\pi^2 v^2} = \\frac{0.1 \\times (1000)^2}{4\\pi^2 \\times (100)^2} = \\frac{10^4}{4\\pi^2 \\times 10^4} \\approx \\frac{1}{4\\pi^2} \\approx 0.25\\text{ m} = 25\\text{ cm}.$$

The answer is B.`,
  },
  {
    n: 24, correct: 'E',
    statement: `A uniform rope of length $$L$$ and mass $$M$$ passes over a frictionless pulley, and hangs with both ends at equal heights. If one end is pulled down a distance $$x$$ and the rope is released, the acceleration of that end at this instant will be:`,
    choices: {
      A: '$$xg/4L$$',
      B: '$$xg/3L$$',
      C: '$$xg/2L$$',
      D: '$$xg/L$$',
      E: '$$2xg/L$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['pulleys/tension', 'newton\'s laws', 'equations of motion'],
    solution: `Initially the rope hangs with $$L/2$$ on each side. After pulling one end down by $$x$$, that side has length $$L/2 + x$$ and the other has $$L/2 - x$$. The difference in length is $$2x$$.

The difference in mass between the two sides is $$\\Delta m = M \\cdot \\frac{2x}{L}$$.

This excess mass creates a net gravitational force along the rope:
$$F = \\Delta m \\cdot g = \\frac{2Mgx}{L}.$$

The entire rope (mass $$M$$) accelerates under this net force:
$$a = F/M = \\frac{2gx}{L}.$$

The answer is E.`,
  },
  {
    n: 25, correct: 'A',
    statement: `A student makes an estimate of the acceleration due to gravity, $$g$$, by dropping a rock from a known height $$h$$ and measuring the time, $$t$$, it takes to hit the ground. Neglecting air resistance, which one of the following situations will lead to the smallest value of the relative uncertainty, $$(\\Delta g)/g$$, in the estimate?`,
    choices: {
      A: 'There is no uncertainty in $$t$$, and $$h$$ has a 10% uncertainty.',
      B: 'There is no uncertainty in $$h$$, and $$t$$ has a 10% uncertainty.',
      C: 'Both $$t$$ and $$h$$ have a 5% uncertainty.',
      D: '(A) and (B) yield the same uncertainty, which is smaller than in (C).',
      E: '(A), (B), and (C) all yield the same uncertainty.',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'data analysis'],
    solution: `From $$h = \\frac{1}{2}gt^2$$, we get $$g = 2h/t^2$$. Using error propagation (treating independent uncertainties):

$$\\frac{\\Delta g}{g} = \\sqrt{\\left(\\frac{\\Delta h}{h}\\right)^2 + \\left(\\frac{2\\,\\Delta t}{t}\\right)^2}.$$

The factor of 2 on $$\\Delta t$$ comes from $$t$$ being squared: an uncertainty in $$t$$ contributes twice the relative uncertainty to $$t^2$$.

__(A)__ $$\\Delta t = 0$$, $$\\Delta h/h = 10\\%$$: $$\\Delta g/g = 10\\%$$.

__(B)__ $$\\Delta h = 0$$, $$\\Delta t/t = 10\\%$$: $$\\Delta g/g = 2 \\times 10\\% = 20\\%$$.

__(C)__ Both 5%: $$\\Delta g/g = \\sqrt{(5\\%)^2 + (10\\%)^2} \\approx 11.2\\%$$.

Ranking: A (10%) < C (11.2%) < B (20%). The smallest uncertainty is in case A. The answer is A.`,
  },
]
