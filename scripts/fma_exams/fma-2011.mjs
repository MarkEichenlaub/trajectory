// Digitized 2011 F=ma exam questions. Sources:
// Exam + answer key: AAPT official PDFs (fma-2011.pdf / fma-2011-sol.pdf)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (fma-book.pdf),
//   markers 2011.1. through 2011.25.
//
// Figures: pre-cropped and uploaded; URLs from work/figure_manifest.json key "fma-2011".
// Stem figures: Q12, Q13, Q22, Q24.
// Choice-picture questions: Q11 (water-level graphs), Q14 (string-weight diagrams).

const BASE = 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2011'
const P = n => `${BASE}/fma-2011-q${String(n).padStart(2, '0')}.png`
const CF = (n, letter) => `${BASE}/fma-2011-q${String(n).padStart(2, '0')}${letter}.png`

export const examId = 'fma-2011'
export const questions = [
  {
    n: 1, correct: 'A',
    statement: `A cyclist travels at a constant speed of 22.0 km/hr except for a 20 minute stop. The cyclist's average speed was 17.5 km/hr. How far did the cyclist travel?`,
    choices: {
      A: '28.5 km',
      B: '30.3 km',
      C: '31.2 km',
      D: '36.5 km',
      E: '38.9 km',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'relative motion'],
    solution: `Let $$\\bar{v}$$ be the average speed, $$v$$ the constant driving speed, $$T$$ the break duration, $$t$$ the total travel time, and $$s$$ the distance. Then $$s = \\bar{v}t$$ and $$s = v(t - T)$$. Eliminating $$t$$:

$$s = v\\!\\left(\\frac{s}{\\bar{v}} - T\\right) \\implies s\\left(\\frac{v}{\\bar{v}} - 1\\right) = vT \\implies s = \\frac{v\\bar{v}T}{v - \\bar{v}}.$$

Plugging in $$v = 22.0$$ km/hr, $$\\bar{v} = 17.5$$ km/hr, $$T = 1/3$$ hr:

$$s = \\frac{22.0 \\times 17.5 \\times \\tfrac{1}{3}}{22.0 - 17.5} = \\frac{128.3}{4.5} \\approx 28.5 \\text{ km}.$$

The answer is __A__.`,
  },
  {
    n: 2, correct: 'E',
    statement: `Questions 2 to 4 refer to the three graphs below which show velocity of three objects as a function of time. Each object is moving only in one dimension. (See figures for Objects I, II, and III.)

Rank the magnitudes of the average acceleration during the ten second interval.`,
    choices: {
      A: 'I > II > III',
      B: 'II > I > III',
      C: 'III > II > I',
      D: 'I > II = III',
      E: 'I = II = III',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'graph interpretation'],
    solution: `The magnitude of the average acceleration is $$|\\bar{a}| = |v_f - v_i|/\\Delta t$$. Reading from the graphs over the 10-second interval:

$$|a_I| = \\frac{|{-2} - 0|}{10} = 0.2 \\text{ m/s}^2, \\quad |a_{II}| = \\frac{|0 - 2|}{10} = 0.2 \\text{ m/s}^2, \\quad |a_{III}| = \\frac{|2 - 0|}{10} = 0.2 \\text{ m/s}^2.$$

All three magnitudes are equal, so the answer is __E__.`,
  },
  {
    n: 3, correct: 'D',
    statement: `Questions 2 to 4 refer to the three graphs below which show velocity of three objects as a function of time. Each object is moving only in one dimension. (See figures for Objects I, II, and III.)

Rank the magnitudes of the maximum velocity achieved during the ten second interval.`,
    choices: {
      A: 'I > II > III',
      B: 'II > I > III',
      C: 'III > II > I',
      D: 'I > II = III',
      E: 'I = II = III',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'graph interpretation', 'speed vs velocity'],
    solution: `Reading directly from the graphs: the maximum speed in graph I is 4 m/s (the peak), while for both graphs II and III the maximum speed is 2 m/s. Therefore $$v_{I,\\max} > v_{II,\\max} = v_{III,\\max}$$, and the answer is __D__.`,
  },
  {
    n: 4, correct: 'B',
    statement: `Questions 2 to 4 refer to the three graphs below which show velocity of three objects as a function of time. Each object is moving only in one dimension. (See figures for Objects I, II, and III.)

Rank the magnitudes of the distance traveled during the ten second interval.`,
    choices: {
      A: 'I > II > III',
      B: 'II > I > III',
      C: 'III > II > I',
      D: 'I = II > III',
      E: 'I = II = III',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'graph interpretation'],
    solution: `In a velocity-time graph, total distance traveled equals the total area between the graph and the time axis (both positive and negative regions count as positive). Computing the areas:

$$s_I = \\tfrac{1}{2}(4)(4) + \\tfrac{1}{2}(4)(4) + \\tfrac{1}{2}(2)(2) = 8 + 8 + 2 = 18 \\text{ m},$$

$$s_{II} = (2)(9) + \\tfrac{1}{2}(2)(1) = 18 + 1 = 19 \\text{ m},$$

$$s_{III} = \\tfrac{1}{2}(2)(6) + (2)(4) = 6 + 8 = 14 \\text{ m}.$$

Therefore $$s_{II} > s_I > s_{III}$$, and the answer is __B__.`,
  },
  {
    n: 5, correct: 'B',
    statement: `A crude approximation is that the Earth travels in a circular orbit about the Sun at constant speed, at a distance of 150,000,000 km from the Sun. Which of the following is the closest for the acceleration of the Earth in this orbit?`,
    choices: {
      A: 'exactly 0 m/s$$^2$$',
      B: '0.006 m/s$$^2$$',
      C: '0.6 m/s$$^2$$',
      D: '6 m/s$$^2$$',
      E: '10 m/s$$^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'orbital mechanics'],
    solution: `Even though the Earth's speed is constant, its velocity direction is continuously changing, so its centripetal acceleration is non-zero. The Earth's orbital speed is

$$v = \\frac{2\\pi r}{T} = \\frac{2\\pi \\times 1.5 \\times 10^{11} \\text{ m}}{3.156 \\times 10^7 \\text{ s}} \\approx 3.0 \\times 10^4 \\text{ m/s},$$

and the centripetal acceleration is

$$a_c = \\frac{v^2}{r} = \\frac{(3.0 \\times 10^4)^2}{1.5 \\times 10^{11}} \\approx 0.006 \\text{ m/s}^2.$$

The answer is __B__.`,
  },
  {
    n: 6, correct: 'E',
    statement: `A child is sliding out of control with velocity $$v_c$$ across a frozen lake. He runs head-on into another child, initially at rest, with 3 times the mass of the first child, who holds on so that the two now slide together. What is the velocity of the couple after the collision?`,
    choices: {
      A: '$$2v_c$$',
      B: '$$v_c$$',
      C: '$$v_c/2$$',
      D: '$$v_c/3$$',
      E: '$$v_c/4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'collisions'],
    solution: `This is a perfectly inelastic collision. Conservation of linear momentum gives

$$m v_c + 3m \\cdot 0 = (m + 3m)\\,w \\implies w = \\frac{mv_c}{4m} = \\frac{v_c}{4}.$$

The answer is __E__.`,
  },
  {
    n: 7, correct: 'B',
    statement: `An ice skater can rotate about a vertical axis with an angular velocity $$\\omega_0$$ by holding her arms straight out. She can then pull in her arms close to her body so that her angular velocity changes to $$2\\omega_0$$, without the application of any external torque. What is the ratio of her final rotational kinetic energy to her initial rotational kinetic energy?`,
    choices: {
      A: '$$\\sqrt{2}$$',
      B: '$$2$$',
      C: '$$2\\sqrt{2}$$',
      D: '$$4$$',
      E: '$$8$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum', 'energy conservation', 'rotational dynamics'],
    solution: `Since there is no external torque, angular momentum is conserved: $$L = I\\omega = \\text{const}$$. Because $$\\omega_2 = 2\\omega_1$$, we must have $$I_2 = \\tfrac{1}{2}I_1$$. The ratio of kinetic energies is

$$\\frac{E_{k2}}{E_{k1}} = \\frac{\\tfrac{1}{2}I_2\\omega_2^2}{\\tfrac{1}{2}I_1\\omega_1^2} = \\frac{\\tfrac{1}{2}(I_1/2)(2\\omega_1)^2}{\\tfrac{1}{2}I_1\\omega_1^2} = \\frac{I_1 \\cdot 2\\omega_1^2}{I_1\\omega_1^2} = 2.$$

The skater does work pulling her arms in, which becomes additional rotational kinetic energy. The answer is __B__.`,
  },
  {
    n: 8, correct: 'D',
    statement: `When a block of wood with a weight of 30 N is completely submerged under water the buoyant force on the block of wood from the water is 50 N. When the block is released it floats at the surface. What fraction of the block will then be visible above the surface of the water when the block is floating?`,
    choices: {
      A: '1/15',
      B: '1/5',
      C: '1/3',
      D: '2/5',
      E: '3/5',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `By Archimedes' Principle the buoyancy equals the weight of displaced water. When fully submerged $$B = 50$$ N while the weight is $$W = 30$$ N. When floating, the displaced water weighs exactly $$W = 30$$ N, so the part of the block that is out of water previously displaced $$B - W = 20$$ N of water. The fraction above the surface is

$$\\frac{B - W}{B} = \\frac{20}{50} = \\frac{2}{5}.$$

The answer is __D__.`,
  },
  {
    n: 9, correct: 'C',
    statement: `A spring has an equilibrium length of 2.0 meters and a spring constant of 10 newtons/meter. Alice is pulling on one end of the spring with a force of 3.0 newtons. Bob is pulling on the opposite end of the spring with a force of 3.0 newtons, in the opposite direction. What is the resulting length of the spring?`,
    choices: {
      A: '1.7 m',
      B: '2.0 m',
      C: '2.3 m',
      D: '2.6 m',
      E: '8.0 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'statics/equilibrium', 'newton\'s laws'],
    solution: `When two people pull opposite ends with equal forces, the situation is identical to one person pulling against a fixed wall with the same force — by symmetry the center of the spring does not move, so each half acts like a spring against a wall. The net extension is the same as if one end were fixed:

$$\\Delta x = \\frac{F}{k} = \\frac{3.0 \\text{ N}}{10 \\text{ N/m}} = 0.3 \\text{ m}.$$

The new length is $$2.0 + 0.3 = 2.3$$ m. The answer is __C__.`,
  },
  {
    n: 10, correct: 'C',
    statement: `Which of the following changes will result in an increase in the period of a simple pendulum?`,
    choices: {
      A: 'Decrease the length of the pendulum',
      B: 'Increase the mass of the pendulum',
      C: 'Increase the amplitude of the pendulum swing',
      D: 'Operate the pendulum in an elevator that is accelerating upward',
      E: 'Operate the pendulum in an elevator that is moving downward at constant speed.',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum'],
    solution: `For small amplitudes the period is $$T = 2\\pi\\sqrt{\\ell/g}$$, which is independent of mass and amplitude. Examining each choice:

A — Decreasing $$\\ell$$ decreases $$T$$. Incorrect.

B — $$T$$ does not depend on mass. Incorrect.

C — For larger amplitudes the approximation $$\\sin\\theta \\approx \\theta$$ becomes less accurate; the true period increases with amplitude ($$T \\approx 2\\pi\\sqrt{\\ell/g}\\,(1 + \\theta_0^2/16 + \\cdots)$$). __Correct.__

D — Upward acceleration effectively increases $$g$$, which decreases $$T$$. Incorrect.

E — Constant velocity means no acceleration, so $$g_\\text{eff} = g$$ and $$T$$ is unchanged. Incorrect.

The answer is __C__.`,
  },
  {
    n: 11, correct: 'C',
    statement: `A large metal cylindrical cup floats in a rectangular tub half-filled with water. The tap is placed over the cup and turned on, releasing water at a constant rate. Eventually the cup sinks to the bottom and is completely submerged. Which of the following five graphs could represent the water level in the sink as a function of time?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF(11, 'A'),
      B: CF(11, 'B'),
      C: CF(11, 'C'),
      D: CF(11, 'D'),
      E: CF(11, 'E'),
    },
    figures: [],
    topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics'],
    solution: `As water fills the cup it continues to float, but sinks deeper, raising the tub level at a constant rate (because the horizontal cross-sections of both the cup and the tub are constant, so the displacement increases linearly with the incoming water volume). When the cup's rim reaches the water line, tub water rapidly floods into it, causing a sudden drop in tub level. After the cup rests on the bottom, the water level rises again at a constant rate determined by the full tub cross-section.

The key observation is that the rate of rise before and after sinking is the same: in either case every increment $$\\Delta V$$ of incoming water raises the tub level by $$\\Delta V / A$$ where $$A$$ is the tub floor area (before sinking, the cup goes deeper by the same amount it is filled, displacing an equal volume into the tub). This matches graph C, which shows two equal-slope linear segments separated by a sudden drop. The answer is __C__.`,
  },
  {
    n: 12, correct: 'C',
    statement: `You are given a large collection of identical heavy balls and lightweight rods. When two balls are placed at the ends of one rod and interact through their mutual gravitational attraction (as is shown on the left), the compressive force in the rod is $$F$$. Next, three balls and three rods are placed at the vertexes and edges of an equilateral triangle (as is shown on the right). What is the compressive force in each rod in the latter case?`,
    choices: {
      A: '$$\\dfrac{1}{\\sqrt{3}}F$$',
      B: '$$\\dfrac{\\sqrt{3}}{2}F$$',
      C: '$$F$$',
      D: '$$\\sqrt{3}\\,F$$',
      E: '$$2F$$',
    },
    figures: [P(12)], topics: ['Mechanics'], tags: ['gravitation', 'statics/equilibrium', 'vectors'],
    solution: `Label the three balls A, B, C. Consider ball A: it is attracted toward B with force $$F$$ (along rod AB) and toward C with force $$F$$ (along rod AC). The resultant of these two equal forces at $$60^\\circ$$ to each other has magnitude

$$F_{BC} = 2F\\cos30^\\circ = F\\sqrt{3}.$$

To find the compressive force in each rod, we decompose this resultant back along the two rod directions AB and AC. By symmetry each rod carries exactly $$F$$. (Alternatively: each rod connects one gravitationally attracting pair, so it must carry force $$F$$ to keep that pair in equilibrium — the third ball's contribution cancels by symmetry.) The answer is __C__.`,
  },
  {
    n: 13, correct: 'D',
    statement: `The apparatus in the diagram consists of a solid cylinder of radius 1 cm attached at the center to two disks of radius 2 cm. It is placed on a surface where it can roll, but will not slip. A thread is wound around the central cylinder. When the thread is pulled at the angle $$\\theta = 90^\\circ$$ to the horizontal (directly up), the apparatus rolls to the right. Which below is the largest value of $$\\theta$$ for which it will not roll to the right when pulling on the thread?`,
    choices: {
      A: '$$\\theta = 15^\\circ$$',
      B: '$$\\theta = 30^\\circ$$',
      C: '$$\\theta = 45^\\circ$$',
      D: '$$\\theta = 60^\\circ$$',
      E: 'None, the apparatus will always roll to the right',
    },
    figures: [P(13)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium', 'rolling without slipping', 'free-body diagrams'],
    solution: `The two forces acting on the apparatus are the string tension $$T$$ (at angle $$\\theta$$ above horizontal) and static friction $$F_s$$ at the contact point. For translational equilibrium horizontally: $$F_s = T\\cos\\theta$$. For rotational equilibrium about the contact point (outer radius $$R = 2$$ cm, inner radius $$r = 1$$ cm), the torque from tension must balance the torque from friction:

$$Tr = F_s R \\implies T \\cdot r = T\\cos\\theta \\cdot R \\implies \\cos\\theta = \\frac{r}{R} = \\frac{1}{2} \\implies \\theta = 60^\\circ.$$

At this critical angle the net torque about the contact point is zero, so the apparatus is on the verge of rolling. For $$\\theta < 60^\\circ$$ the horizontal component of $$T$$ creates a larger torque tending to roll left (friction wins), so it will not roll right. The largest such angle is $$\\theta = 60^\\circ$$. The answer is __D__.`,
  },
  {
    n: 14, correct: 'D',
    statement: `You have 5 different strings with weights tied at various points, all hanging from the ceiling, and reaching down to the floor. The string is released at the top, allowing the weights to fall. Which one will create a regular, uniform beating sound as the weights hit the floor?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF(14, 'A'),
      B: CF(14, 'B'),
      C: CF(14, 'C'),
      D: CF(14, 'D'),
      E: CF(14, 'E'),
    },
    figures: [],
    topics: ['Mechanics'], tags: ['1d kinematics', 'projectile motion'],
    solution: `For the weights to hit the floor in a steady rhythm, the time between successive impacts must be constant. Since all weights start from rest and fall under gravity, the time to fall a distance $$d$$ is $$t = \\sqrt{2d/g}$$. For equally spaced time intervals, the successive distances from the ceiling (measured to the positions of the weights) must follow the pattern of distances covered in equal time intervals from rest: these go as $$1, 4, 9, 16, \\ldots$$ (i.e., proportional to $$n^2$$), so the gaps between consecutive weights are proportional to $$1, 3, 5, 7, \\ldots$$ (odd multiples of the first gap). Answer choice D shows weights placed at distances in these proportions, producing equal time spacings between impacts. The answer is __D__.`,
  },
  {
    n: 15, correct: 'D',
    statement: `A vertical mass-spring oscillator is displaced 2.0 cm from equilibrium. The 100 g mass passes through the equilibrium point with a speed of 0.75 m/s. What is the spring constant of the spring?`,
    choices: {
      A: '90 N/m',
      B: '100 N/m',
      C: '110 N/m',
      D: '140 N/m',
      E: '160 N/m',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'energy conservation'],
    solution: `For a vertical mass-spring system, gravity shifts the equilibrium point but does not change the oscillation energy formula measured from equilibrium. At maximum displacement $$x$$ from equilibrium all energy is potential; at the equilibrium point all is kinetic:

$$\\frac{1}{2}kx^2 = \\frac{1}{2}mv^2 \\implies k = \\frac{mv^2}{x^2} = \\frac{(0.100 \\text{ kg})(0.75 \\text{ m/s})^2}{(0.020 \\text{ m})^2} = \\frac{0.05625}{0.0004} \\approx 140 \\text{ N/m}.$$

The answer is __D__.`,
  },
  {
    n: 16, correct: 'E',
    statement: `Questions 16 and 17 refer to the information below.

Jonathan is using a rope to lift a box with Becky in it; the box is hanging off the side of a bridge, Jonathan is on top. A rope is hooked up from the box and passes a fixed railing; Jonathan holds the box up by pressing the rope against the railing with a massless, frictionless physics textbook. The static friction coefficient between the rope and railing is $$\\mu_s$$; the kinetic friction coefficient between the rope and railing is $$\\mu_k < \\mu_s$$; the mass of the box and Becky combined is $$M$$; and the initial height of the bottom of the box above the ground is $$h$$. Assume a massless rope.

What magnitude force does Jonathan need to exert on the physics book to keep the rope from slipping?`,
    choices: {
      A: '$$Mg$$',
      B: '$$\\mu_k Mg$$',
      C: '$$\\mu_k Mg / \\mu_s$$',
      D: '$$(\\mu_s + \\mu_k)Mg$$',
      E: '$$Mg / \\mu_s$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'statics/equilibrium', 'free-body diagrams', 'newton\'s laws'],
    solution: `The static friction between the rope and the railing must balance the weight of the box and Becky. If Jonathan presses the book with force $$F$$, the normal force on the rope is $$F$$ and the maximum static friction is $$\\mu_s F$$. Setting this equal to $$Mg$$:

$$\\mu_s F = Mg \\implies F = \\frac{Mg}{\\mu_s}.$$

The answer is __E__.`,
  },
  {
    n: 17, correct: 'D',
    statement: `Questions 16 and 17 refer to the information below.

Jonathan is using a rope to lift a box with Becky in it; the box is hanging off the side of a bridge, Jonathan is on top. A rope is hooked up from the box and passes a fixed railing; Jonathan holds the box up by pressing the rope against the railing with a massless, frictionless physics textbook. The static friction coefficient between the rope and railing is $$\\mu_s$$; the kinetic friction coefficient between the rope and railing is $$\\mu_k < \\mu_s$$; the mass of the box and Becky combined is $$M$$; and the initial height of the bottom of the box above the ground is $$H$$. Assume a massless rope.

Jonathan applies a normal force that is just enough to keep the rope from slipping. Becky makes a small jump, barely leaving contact with the floor of the box. Upon landing on the box, the force of the impact causes the rope to start slipping from Jonathan's hand. At what speed does the box smash into the ground? Assume Jonathan's normal force does not change.`,
    choices: {
      A: '$$\\sqrt{2gH}\\,(\\mu_k/\\mu_s)$$',
      B: '$$\\sqrt{2gH}\\,(1 - \\mu_k/\\mu_s)$$',
      C: '$$\\sqrt{2gH}\\,\\sqrt{\\mu_k/\\mu_s}$$',
      D: '$$\\sqrt{2gH\\,(1 - \\mu_k/\\mu_s)}$$',
      E: '$$\\sqrt{2gH}\\,(\\mu_s - \\mu_k)$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'energy conservation', 'pulleys/tension'],
    solution: `Once the rope is slipping, kinetic friction replaces static. Jonathan's normal force remains $$F = Mg/\\mu_s$$ (from question 16), so the kinetic friction force retarding the box is $$F_k = \\mu_k F = \\mu_k Mg/\\mu_s$$. Applying the work-energy theorem over the fall $$H$$:

$$MgH - F_k H = \\frac{1}{2}Mv^2 \\implies MgH - \\frac{\\mu_k Mg}{\\mu_s}H = \\frac{1}{2}Mv^2$$

$$v^2 = 2gH\\left(1 - \\frac{\\mu_k}{\\mu_s}\\right) \\implies v = \\sqrt{2gH\\left(1 - \\frac{\\mu_k}{\\mu_s}\\right)}.$$

The answer is __D__.`,
  },
  {
    n: 18, correct: 'A',
    statement: `A block of mass $$m = 3.0$$ kg slides down one ramp, and then up a second ramp. The coefficient of kinetic friction between the block and each ramp is $$\\mu_k = 0.40$$. The block begins at a height $$h_1 = 1.0$$ m above the horizontal. Both ramps are at a $$30^\\circ$$ incline above the horizontal. To what height above the horizontal does the block rise on the second ramp?`,
    choices: {
      A: '0.18 m',
      B: '0.52 m',
      C: '0.59 m',
      D: '0.69 m',
      E: '0.71 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'friction', 'kinematics-2d'],
    solution: `The kinetic friction force along each ramp is $$F_k = \\mu_k mg\\cos\\theta$$. The path length along the first ramp is $$s_1 = h_1/\\sin\\theta$$ and along the second is $$s_2 = h_2/\\sin\\theta$$. Energy conservation with friction losses:

$$mgh_1 = mgh_2 + F_k(s_1 + s_2) = mgh_2 + \\mu_k mg\\cos\\theta \\cdot \\frac{h_1 + h_2}{\\sin\\theta}.$$

Dividing by $$mg$$ and solving for $$h_2$$:

$$h_2 = h_1\\,\\frac{\\sin\\theta - \\mu_k\\cos\\theta}{\\sin\\theta + \\mu_k\\cos\\theta} = 1.0 \\times \\frac{\\sin 30^\\circ - 0.40\\cos 30^\\circ}{\\sin 30^\\circ + 0.40\\cos 30^\\circ} = \\frac{0.500 - 0.346}{0.500 + 0.346} \\approx 0.18 \\text{ m}.$$

The answer is __A__.`,
  },
  {
    n: 19, correct: 'C',
    statement: `Questions 19 and 20 refer to the following information.

A particle of mass 2.00 kg moves under a force given by $$\\vec{F} = -(8.00 \\text{ N/m})(x\\,\\hat{i} + y\\,\\hat{j})$$ where $$\\hat{i}$$ and $$\\hat{j}$$ are unit vectors in the $$x$$ and $$y$$ directions. The particle is placed at the origin with an initial velocity $$\\vec{v} = (3.00 \\text{ m/s})\\hat{i} + (4.00 \\text{ m/s})\\hat{j}$$.

After how much time will the particle first return to the origin?`,
    choices: {
      A: '0.785 s',
      B: '1.26 s',
      C: '1.57 s',
      D: '2.00 s',
      E: '3.14 s',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'equations of motion'],
    solution: `The force components $$F_x = -kx$$ and $$F_y = -ky$$ with $$k = 8.00$$ N/m are independent spring-like restoring forces with equal spring constants. Each direction undergoes simple harmonic motion with the same period

$$T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{2.00}{8.00}} = 2\\pi \\times 0.5 = \\pi \\approx 3.14 \\text{ s}.$$

Both $$x(t)$$ and $$y(t)$$ are sinusoids starting at the origin, so the particle returns to the origin for the first time after half a period:

$$t = \\frac{T}{2} = \\frac{\\pi}{2} \\approx 1.57 \\text{ s}.$$

The answer is __C__.`,
  },
  {
    n: 20, correct: 'B',
    statement: `Questions 19 and 20 refer to the following information.

A particle of mass 2.00 kg moves under a force given by $$\\vec{F} = -(8.00 \\text{ N/m})(x\\,\\hat{i} + y\\,\\hat{j})$$ where $$\\hat{i}$$ and $$\\hat{j}$$ are unit vectors in the $$x$$ and $$y$$ directions. The particle is placed at the origin with an initial velocity $$\\vec{v} = (3.00 \\text{ m/s})\\hat{i} + (4.00 \\text{ m/s})\\hat{j}$$.

What is the maximum distance between the particle and the origin?`,
    choices: {
      A: '2.00 m',
      B: '2.50 m',
      C: '3.50 m',
      D: '5.00 m',
      E: '7.00 m',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'energy conservation', 'equations of motion'],
    solution: `Each direction is an independent SHM with $$k = 8.00$$ N/m, $$m = 2.00$$ kg. The amplitudes are found from energy conservation in each direction:

$$x_{\\max} = v_{0x}\\sqrt{\\frac{m}{k}} = 3.00 \\times \\sqrt{\\frac{2.00}{8.00}} = 3.00 \\times 0.5 = 1.5 \\text{ m},$$

$$y_{\\max} = v_{0y}\\sqrt{\\frac{m}{k}} = 4.00 \\times 0.5 = 2.0 \\text{ m}.$$

The maximum distance from the origin occurs when both reach their amplitudes simultaneously (which is possible since both have the same frequency):

$$r_{\\max} = \\sqrt{x_{\\max}^2 + y_{\\max}^2} = \\sqrt{1.5^2 + 2.0^2} = \\sqrt{2.25 + 4.00} = \\sqrt{6.25} = 2.5 \\text{ m}.$$

The answer is __B__.`,
  },
  {
    n: 21, correct: 'A',
    statement: `An engineer is given a fixed volume $$V_m$$ of metal with which to construct a spherical pressure vessel. Interestingly, assuming the vessel has thin walls and is always pressurized to near its bursting point, the amount of gas the vessel can contain, $$n$$ (measured in moles), does not depend on the radius $$r$$ of the vessel; instead it depends only on $$V_m$$ (measured in m$$^3$$), the temperature $$T$$ (measured in K), the ideal gas constant $$R$$ (measured in J/(K$$\\cdot$$mol)), and the tensile strength of the metal $$\\sigma$$ (measured in N/m$$^2$$). Which of the following gives $$n$$ in terms of these parameters?`,
    choices: {
      A: '$$n = \\dfrac{2}{3}\\dfrac{V_m\\sigma}{RT}$$',
      B: '$$n = \\dfrac{2}{3}\\dfrac{\\sqrt[3]{V_m}\\,\\sigma}{RT}$$',
      C: '$$n = \\dfrac{2}{3}\\dfrac{\\sqrt[3]{V_m\\,\\sigma^2}}{RT}$$',
      D: '$$n = \\dfrac{2}{3}\\dfrac{\\sqrt[3]{V_m^2\\,\\sigma}}{RT}$$',
      E: '$$n = \\dfrac{2}{3}\\dfrac{\\sqrt[3]{V_m\\,\\sigma^2}}{RT}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'units'],
    solution: `This is a dimensional analysis problem. We need the right-hand side to have units of mol. The unit of $$n$$ is [mol], $$R$$ has units J/(K$$\\cdot$$mol) = (N$$\\cdot$$m)/(K$$\\cdot$$mol), $$T$$ has units K, $$V_m$$ has units m$$^3$$, $$\\sigma$$ has units N/m$$^2$$. Check formula A:

$$\\frac{V_m \\sigma}{RT} \\to \\frac{\\text{m}^3 \\cdot \\text{N/m}^2}{[\\text{J/(K} \\cdot \\text{mol)}]\\cdot\\text{K}} = \\frac{\\text{N}\\cdot\\text{m}}{\\text{N}\\cdot\\text{m/mol}} = \\text{mol}. \\checkmark$$

All other formulas fail to produce the correct units (they involve fractional powers of $$V_m$$ or $$\\sigma$$ that do not balance dimensionally). The answer is __A__.`,
  },
  {
    n: 22, correct: 'D',
    statement: `This graph depicts the torque output of a hypothetical gasoline engine as a function of rotation frequency. The engine is incapable of running outside of the graphed range. (See figure for the torque vs. RPM graph with marked points I, II, and III.)

At what engine RPM (revolutions per minute) does the engine produce maximum power?`,
    choices: {
      A: 'I',
      B: 'At some point between I and II',
      C: 'II',
      D: 'At some point between II and III',
      E: 'III',
    },
    figures: [P(22)], topics: ['Mechanics'], tags: ['power', 'rotational dynamics'],
    solution: `Power in rotational motion is $$P = \\tau\\omega$$, where $$\\tau$$ is the torque and $$\\omega$$ is the angular velocity (proportional to RPM). Curves of constant power are hyperbolas $$\\tau = P/\\omega$$ in the torque-RPM plane. The maximum power occurs where the highest such hyperbola is tangent to the torque curve. Reading the graph, the torque peaks near point II and then decreases, but $$\\omega$$ continues to increase. The product $$\\tau\\omega$$ is maximized at some point to the right of the torque peak, between II and III. The answer is __D__.`,
  },
  {
    n: 23, correct: 'E',
    statement: `A particle is launched from the surface of a uniform, stationary spherical planet at an angle to the vertical. The particle travels in the absence of air resistance and eventually falls back onto the planet. Spaceman Fred describes the path of the particle as a parabola using the laws of projectile motion. Spacewoman Kate recalls from Kepler's laws that every bound orbit around a point mass is an ellipse (or circle), and that the gravitation due to a uniform sphere is identical to that of a point mass. Which of the following best explains the discrepancy?`,
    choices: {
      A: 'Because the experiment takes place very close to the surface of the sphere, it is no longer valid to replace the sphere with a point mass.',
      B: 'Because the particle strikes the ground, it is not in orbit of the planet and therefore can follow a non-elliptical path.',
      C: 'Kate disregarded the fact that motions around a point mass may also be parabolas or hyperbolas.',
      D: "Kepler's laws only hold in the limit of large orbits.",
      E: 'The path is an ellipse, but is very close to a parabola due to the short length of the flight relative to the distance from the center of the planet.',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'kepler\'s laws', 'gravitation'],
    solution: `Spacewoman Kate is correct: the trajectory is an ellipse (since the particle is bound and returns to the surface). The spherical planet can be replaced by a point mass at its center for external gravity. The apparent "parabola" arises because when the flight path is very short compared to the planet's radius, the gravitational field lines are nearly parallel and nearly constant in magnitude over the trajectory. In this limit, the relevant portion of the ellipse is extremely well approximated by a parabola — the same approximation underlying standard projectile motion. The answer is __E__.`,
  },
  {
    n: 24, correct: 'A',
    statement: `A turntable is supported on a Teflon ring of inner radius $$R$$ and outer radius $$R + \\delta$$ ($$\\delta \\ll R$$), as shown in the diagram. To rotate the turntable at a constant rate, power must be supplied to overcome friction. The manufacturer of the turntable wishes to reduce the power required without changing the rotation rate, the weight of the turntable, or the coefficient of friction of the Teflon surface. Engineers propose two solutions: increasing the width of the bearing (increasing $$\\delta$$), or increasing the radius (increasing $$R$$). What are the effects of these proposed changes?`,
    choices: {
      A: 'Increasing $$\\delta$$ has no significant effect on the required power; increasing $$R$$ increases the required power.',
      B: 'Increasing $$\\delta$$ has no significant effect on the required power; increasing $$R$$ decreases the required power.',
      C: 'Increasing $$\\delta$$ increases the required power; increasing $$R$$ has no significant effect on the required power.',
      D: 'Increasing $$\\delta$$ decreases the required power; increasing $$R$$ has no significant effect on the required power.',
      E: 'Neither change has a significant effect on the required power.',
    },
    figures: [P(24)], topics: ['Mechanics'], tags: ['friction', 'rotational dynamics', 'power', 'torque'],
    solution: `Since $$\\delta \\ll R$$, all of the friction force acts at essentially the same radius $$R$$. The friction force equals $$\\mu W$$ where $$W$$ is the weight and $$\\mu$$ is the friction coefficient. The required power to maintain angular velocity $$\\omega$$ is

$$P = F_k v = \\mu W R\\omega.$$

Since $$\\mu$$, $$W$$, and $$\\omega$$ are held fixed: increasing $$\\delta$$ (while $$\\delta \\ll R$$) does not change $$R$$ appreciably, so $$P$$ is unchanged. Increasing $$R$$ directly increases $$P$$ proportionally. The answer is __A__.`,
  },
  {
    n: 25, correct: 'C',
    statement: `A hollow cylinder with a very thin wall (like a toilet paper tube) and a block are placed at rest at the top of a plane with inclination $$\\theta$$ above the horizontal. The cylinder rolls down the plane without slipping and the block slides down the plane; it is found that both objects reach the bottom of the plane simultaneously. What is the coefficient of kinetic friction between the block and the plane?`,
    choices: {
      A: '$$0$$',
      B: '$$\\dfrac{1}{3}\\tan\\theta$$',
      C: '$$\\dfrac{1}{2}\\tan\\theta$$',
      D: '$$\\dfrac{2}{3}\\tan\\theta$$',
      E: '$$\\tan\\theta$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'energy conservation', 'rotational dynamics'],
    solution: `The acceleration of the block down the incline is

$$a_1 = g\\sin\\theta - \\mu_k g\\cos\\theta.$$

For a rolling object with moment of inertia $$I = cmr^2$$, the acceleration without slipping is $$a_2 = g\\sin\\theta/(1+c)$$. For a thin-walled hollow cylinder $$c = 1$$, so

$$a_2 = \\frac{g\\sin\\theta}{2}.$$

Setting $$a_1 = a_2$$:

$$g\\sin\\theta - \\mu_k g\\cos\\theta = \\frac{g\\sin\\theta}{2}$$

$$\\frac{g\\sin\\theta}{2} = \\mu_k g\\cos\\theta$$

$$\\mu_k = \\frac{\\sin\\theta}{2\\cos\\theta} = \\frac{1}{2}\\tan\\theta.$$

The answer is __C__.`,
  },
]
