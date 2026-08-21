// Digitized 2021 F=ma exam questions. Sources:
// Exam: work/fma/fma-2021.pdf (text extracted to work/fma/fma-2021.txt)
// Solutions: work/fma/fma-2021-sol.pdf (text extracted to work/fma/fma-2021-sol.txt)
// NOTE: 2021 is not in the AAPT 2011-2019 solutions manual; the solutions PDF above
// is the sole source of worked solutions.
// Figures: work/figure_manifest.json, key "fma-2021" — already cropped and uploaded.
//
// Answer key:
// ←CORRECT markers survive text extraction for Q3–Q12, Q14–Q17, Q19–Q25.
// Four markers missing from extraction:
//   Q1: solution says "the answer is (C)"
//   Q2: solution says "the answer is (E)"
//   Q13: solution says "the only choice with all these features is (D)"
//   Q18: solution says "leaving (B) as the answer"
// All four confirmed by rendering the solution PDF pages as images.

const F21 = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2021/fma-2021-q${String(n).padStart(2, '0')}.png`

const F21c = (n, letter) =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2021/fma-2021-q${String(n).padStart(2, '0')}${letter}.png`

export const examId = 'fma-2021'
export const questions = [
  {
    n: 1, correct: 'C',
    statement: `The following information applies to problems 1 and 2.

At time $$t = 0$$, a small ball is released on the track shown, with an initial rightward velocity. Assume the ball always rolls along the track without slipping.

The ball starts at point A, turns around at point B, and returns to point A. Which of the following shows the __speed__ of the ball as a function of time?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: F21c(1, 'A'), B: F21c(1, 'B'), C: F21c(1, 'C'), D: F21c(1, 'D'), E: F21c(1, 'E'),
    },
    figures: [F21(1)], topics: ['Mechanics'], tags: ['graph interpretation', 'rolling without slipping', 'energy conservation'],
    solution: `The track is flat at first (point A), then rises up a slope to point B. The ball starts with a constant rightward speed on the flat section. When it reaches the slope, it decelerates uniformly (constant gravitational component along the slope) until its speed reaches zero at point B. Then it reverses direction and accelerates back down the slope at the same uniform rate, returning to the flat section with the same speed it started with.

The speed graph therefore shows: constant speed on the flat, a linear decrease to zero, a linear increase back to the original speed — symmetric about the turnaround. The answer is (C).`,
  },
  {
    n: 2, correct: 'E',
    statement: `The following information applies to problems 1 and 2.

At time $$t = 0$$, a small ball is released on the track shown, with an initial rightward velocity. Assume the ball always rolls along the track without slipping.

Which of the following shows the __horizontal velocity__ of the ball as a function of time?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: F21c(2, 'A'), B: F21c(2, 'B'), C: F21c(2, 'C'), D: F21c(2, 'D'), E: F21c(2, 'E'),
    },
    figures: [F21(1)], topics: ['Mechanics'], tags: ['graph interpretation', 'rolling without slipping', 'kinematics-2d'],
    solution: `The horizontal velocity is initially positive and constant while the ball rolls on the flat section. When the ball reaches the bend at the base of the slope, its speed is unchanged (the bend is smooth), but its velocity direction quickly changes so that only a fraction is directed horizontally — the horizontal component drops very abruptly. As the ball climbs the slope, its speed decreases uniformly, so its horizontal velocity decreases linearly (since the slope angle is constant). At point B the speed is zero, so the horizontal velocity is zero. On the way back down the slope, the horizontal velocity (now negative, i.e. leftward) increases in magnitude linearly. At the base of the slope the ball rounds the bend again, and the horizontal velocity quickly jumps to its full negative (leftward) value.

The key feature is that the horizontal velocity has abrupt sharp drops/rises at the bends, with linear changes on the slope sections, and the ball returns moving to the left. The answer is (E).`,
  },
  {
    n: 3, correct: 'B',
    statement: `Two massless rods are attached to frictionless pivots, with their ends touching. The distances between the pivot points and the endpoints of the rods are shown below: the left rod has lengths 2 m and 1 m on each side of its pivot, and the right rod has lengths 0.5 m and 2 m on each side of its pivot.

Neglecting friction between the rods, if a force $$F$$ is applied at the left end of the left rod, what force $$F'$$ must be applied at the right end of the right rod to keep the system in equilibrium?`,
    choices: {
      A: '$$F/8$$',
      B: '$$F/2$$',
      C: '$$4F/7$$',
      D: '$$6F/5$$',
      E: '$$2F$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium'],
    solution: `By balancing torques on the first rod about its pivot, the normal force at its right end (where the rods touch) is twice the applied force $$F$$ on the left end. The first rod acts as a lever with mechanical advantage 2, since the force arm on the left is 2 m and on the right is 1 m:

$$N = F \\cdot \\frac{2\\text{ m}}{1\\text{ m}} = 2F.$$

This force $$N = 2F$$ is then applied to the left end of the second rod (at the touching point, 0.5 m from the second pivot). Balancing torques on the second rod:

$$2F \\cdot 0.5\\text{ m} = F' \\cdot 2\\text{ m} \\implies F' = \\frac{F}{2}.$$

Equivalently, the second rod acts as a lever with mechanical advantage $$1/4$$ (0.5 m divided by 2 m), and the overall mechanical advantage is $$2 \\times (1/4) = 1/2$$, so $$F' = F/2$$. The answer is (B).`,
  },
  {
    n: 4, correct: 'E',
    statement: `Alice and Bethany stand side by side on the Earth's equator. If Alice jumps directly upward, in her frame of reference, to a small height $$h$$ much less than the radius of the Earth, she will land a distance $$D$$ to the west of Bethany. If Alice had instead jumped to a height $$2h$$, how far to the west of Bethany would she land? Neglect air resistance.`,
    choices: {
      A: '$$D/\\sqrt{2}$$',
      B: '$$D$$',
      C: '$$\\sqrt{2}\\, D$$',
      D: '$$2D$$',
      E: '$$2^{3/2} D$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['non-inertial frames', 'kinematics-2d', 'scaling'],
    solution: `The westward displacement is $$\\Delta = \\Delta v \\cdot t$$, where $$\\Delta v$$ is the average difference in tangential velocity between Alice during her jump and Bethany on the ground, and $$t$$ is the total flight time.

By conservation of angular momentum, as Alice rises to average height $$h_{\\text{ave}} \\approx h/2$$, her tangential speed decreases:

$$v_{\\text{ave}}(R + h_{\\text{ave}}) \\approx v_0 R \\implies \\Delta v \\approx \\frac{v_0 h_{\\text{ave}}}{R} \\propto h.$$

The flight time from basic kinematics (height $$h$$, upward then downward) scales as $$t \\propto h^{1/2}$$.

Therefore:

$$\\Delta \\propto \\Delta v \\cdot t \\propto h \\cdot h^{1/2} = h^{3/2}.$$

When the height doubles from $$h$$ to $$2h$$:

$$\\frac{\\Delta(2h)}{\\Delta(h)} = \\left(\\frac{2h}{h}\\right)^{3/2} = 2^{3/2}.$$

So Alice lands $$2^{3/2} D$$ to the west. The answer is (E).`,
  },
  {
    n: 5, correct: 'C',
    statement: `A train starts from city A and stops in city B. The distance between the cities is $$s$$. The train's maximal acceleration is $$a_1$$ and its maximal deceleration is $$a_2$$ (in absolute value). What is the shortest time in which the train can travel between A and B?`,
    choices: {
      A: '$$2\\sqrt{\\dfrac{s}{a_1 + a_2}}$$',
      B: '$$2\\sqrt{\\dfrac{s}{\\sqrt{a_1 a_2}}}$$',
      C: '$$\\sqrt{\\dfrac{2s(a_1 + a_2)}{a_1 a_2}}$$',
      D: '$$\\sqrt{\\dfrac{2s a_2}{a_1(a_1 + a_2)}}$$',
      E: '$$\\dfrac{s\\sqrt{a_1 a_2}}{(a_1 + a_2)^2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion', 'extreme cases'],
    solution: `The optimal strategy is to accelerate at $$a_1$$ for time $$t_1$$ reaching speed $$v = a_1 t_1$$, then immediately decelerate at $$a_2$$ for time $$t_2 = v/a_2 = a_1 t_1 / a_2$$, arriving at rest.

Since the average speed is $$v/2$$ in each phase:

$$\\frac{v t_1}{2} + \\frac{v t_2}{2} = s \\implies \\frac{v(t_1 + t_2)}{2} = s.$$

Substituting $$v = a_1 t_1$$ and $$t_2 = a_1 t_1 / a_2$$:

$$\\frac{a_1 t_1}{2}\\left(t_1 + \\frac{a_1 t_1}{a_2}\\right) = s \\implies t_1^2 = \\frac{2s a_2}{a_1(a_1 + a_2)}.$$

The total time is:

$$t = t_1 + t_2 = t_1 \\cdot \\frac{a_1 + a_2}{a_2} = \\sqrt{\\frac{2s a_2}{a_1(a_1+a_2)}} \\cdot \\frac{a_1+a_2}{a_2} = \\sqrt{\\frac{2s(a_1+a_2)}{a_1 a_2}}.$$

As a check: when $$a_2 \\to \\infty$$ (instantaneous stop), $$t \\to \\sqrt{2s/a_1}$$, which is the correct answer for uniform acceleration over distance $$s$$. The answer is (C).`,
  },
  {
    n: 6, correct: 'D',
    statement: `A cylindrical bucket of negligible mass has radius $$R$$ and height $$h$$, and is open at the top. It is submerged in water of density $$\\rho$$, with its top a distance $$H$$ below the surface. How much work is needed to pull the bucket slowly up so that its bottom is just above the lake surface?`,
    choices: {
      A: '$$\\rho g \\pi R^2 h(H - h)$$',
      B: '$$\\rho g \\pi R^2 h^2$$',
      C: '$$\\rho g \\pi R^2 (H - h)^2$$',
      D: '$$\\rho g \\pi R^2 h^2/2$$',
      E: '$$\\rho g \\pi R^2 h(H - h)/2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics', 'work-energy theorem'],
    solution: `While the bucket is fully submerged, it is full of water, and the weight of the water inside is exactly cancelled by the buoyant force on that water. The net upward force on the bucket-plus-water system is therefore zero, and no work is required to lift it while it remains completely submerged.

Work is only required once the bucket top reaches the water surface and water begins to drain out. At this stage, over a displacement $$dx$$, the water in the bucket is depleted. The force required equals the weight of remaining water: $$F(x) = \\rho g \\pi R^2 (h - x)$$, where $$x$$ is the distance the bucket has risen above the point where its top was at the surface (so $$x$$ goes from 0 to $$h$$).

$$W = \\int_0^h \\rho g \\pi R^2 (h - x)\\, dx = \\rho g \\pi R^2 \\left[hx - \\frac{x^2}{2}\\right]_0^h = \\rho g \\pi R^2 \\cdot \\frac{h^2}{2}.$$

Equivalently: the average force is half the initial water weight, and the distance is $$h$$. The answer is (D).`,
  },
  {
    n: 7, correct: 'D',
    statement: `A point mass slides with speed $$v$$ on a frictionless horizontal surface between two fixed parallel walls, initially a distance $$L$$ apart. It bounces between the walls perfectly elastically. You move one of the walls towards the other by a distance $$0.01L$$, with speed $$0.0001v$$. What is the final speed of the point mass?`,
    choices: {
      A: '$$1.001v$$',
      B: '$$1.002v$$',
      C: '$$1.005v$$',
      D: '$$1.01v$$',
      E: '$$1.02v$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'collisions', 'adiabatic invariant'],
    solution: `The wall moves very slowly compared to the ball ($$0.0001v \\ll v$$), so we can treat the wall as essentially stationary between collisions while tracking how many collisions occur.

The total time for the wall to move $$0.01L$$ at speed $$0.0001v$$ is:

$$T_{\\text{total}} = \\frac{0.01L}{0.0001v} = 100\\frac{L}{v}.$$

During this time the ball makes round trips of length $$2L$$ at speed $$\\approx v$$, so the number of round trips (and thus collisions with the moving wall) is:

$$N = \\frac{100L/v}{2L/v} = 50.$$

Each elastic collision with a wall moving toward the ball at speed $$u = 0.0001v$$ increases the ball's speed by $$2u = 0.0002v$$ (in the wall's frame the ball reverses, gaining $$2u$$ in the lab frame).

Total speed increase: $$50 \\times 0.0002v = 0.01v$$.

Final speed: $$v + 0.01v = 1.01v$$. The answer is (D).`,
  },
  {
    n: 8, correct: 'D',
    statement: `A mint produces 100,000 coins. Upon weighing some of them with a precise scale, officials find that the coins vary slightly in weight, with an independent uncertainty of 1%. About how many coins must be randomly sampled and weighed in order to determine the total weight of the coins to within 0.1% uncertainty? Assume there are no sources of systematic uncertainty.`,
    choices: {
      A: 'Almost all of the coins must be weighed.',
      B: '10,000',
      C: '1,000',
      D: '100',
      E: '10',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'estimation'],
    solution: `Each coin has an independent 1% weight uncertainty. When $$N$$ coins are sampled, the uncertainties add in quadrature: the fractional uncertainty in the total weight of the sample scales as $$1\\%/\\sqrt{N}$$.

To achieve 0.1% uncertainty, we need:

$$\\frac{1\\%}{\\sqrt{N}} = 0.1\\% \\implies \\sqrt{N} = 10 \\implies N = 100.$$

Note that with 100,000 total coins but only 100 sampled, we use the sample mean to estimate the total, so the uncertainty is the same as estimating the sample total. The answer is (D).`,
  },
  {
    n: 9, correct: 'B',
    statement: `NASA trains astronauts to experience weightlessness with an airplane which flies in a parabolic arc with constant acceleration $$g$$ toward the ground. The plane can remain on this trajectory for at most 25 seconds, due to the large change in altitude required. If instead of simulating weightlessness, NASA wanted to fly a trajectory that would simulate the gravitational acceleration of Mars, $$3.7 \\text{ m/s}^2$$, for what length of time can the plane simulate Mars gravity? Assume that the maximum change in altitude is the same for both trajectories.`,
    choices: {
      A: '25 s',
      B: '31 s',
      C: '41 s',
      D: '68 s',
      E: '183 s',
    },
    figures: [], topics: ['Mechanics'], tags: ['kinematics-2d', 'non-inertial frames', 'equations of motion'],
    solution: `To simulate weightlessness, the plane accelerates downward at $$g = 10 \\text{ m/s}^2$$. The altitude change over time $$t$$ is $$\\Delta h = \\frac{1}{2} g t^2$$.

To simulate Mars gravity, the net downward acceleration felt by astronauts must be $$g_M = 3.7 \\text{ m/s}^2$$. The plane must therefore accelerate downward at $$g - g_M = 10 - 3.7 = 6.3 \\text{ m/s}^2$$. The altitude change over time $$\\tau$$ is $$\\Delta h = \\frac{1}{2}(6.3)\\tau^2$$.

Setting the altitude changes equal:

$$\\frac{1}{2}(10)(25)^2 = \\frac{1}{2}(6.3)\\tau^2 \\implies \\tau = 25\\sqrt{\\frac{10}{6.3}} \\approx 25 \\times 1.26 \\approx 31 \\text{ s}.$$

The answer is (B).`,
  },
  {
    n: 10, correct: 'C',
    statement: `A uniform solid circular disk of mass $$m$$ is on a flat, frictionless horizontal table. The center of mass of the disk is at rest and the disk is spinning with angular frequency $$\\omega_0$$. A stone, modeled as a point object also of mass $$m$$, is placed on the edge of the disk, with zero initial velocity relative to the table. A rim built into the disk constrains the stone to slide, with friction, along the disk's edge. After the stone stops sliding with respect to the disk, what is the angular frequency of rotation of the disk and stone together?`,
    choices: {
      A: '$$\\omega_0$$',
      B: '$$2\\omega_0/3$$',
      C: '$$\\omega_0/2$$',
      D: '$$\\omega_0/3$$',
      E: '$$\\omega_0/4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum conservation', 'rotational dynamics', 'moment of inertia'],
    solution: `The table is frictionless, so there is no external horizontal force or torque on the disk-stone system. The center of mass is initially at rest and remains at rest. Since the final motion is purely rotational about the center of mass (both objects rotate together), we use angular momentum conservation.

The center of mass of the disk-stone system lies halfway between the disk's center and the stone (both have mass $$m$$), i.e., at $$R/2$$ from the disk center, where $$R$$ is the disk's radius.

Initial angular momentum about the center of mass:

$$L_0 = I_{\\text{disk,cm}} \\omega_0,$$

where the moment of inertia of the disk about the system center of mass is, by the parallel axis theorem:

$$I_{\\text{disk,cm}} = \\frac{1}{2}mR^2 + m\\left(\\frac{R}{2}\\right)^2 = \\frac{3mR^2}{4}.$$

Wait — the stone starts at rest, so its angular momentum about the system CM is zero (its velocity is zero). The disk's angular momentum about its own center is $$I_0 \\omega_0 = \\frac{1}{2}mR^2 \\omega_0$$. Since the disk's CM is at rest, angular momentum about any fixed point equals angular momentum about the disk's own center: $$L_0 = \\frac{1}{2}mR^2 \\omega_0$$.

Final moment of inertia about the system center of mass (at $$R/2$$ from disk center):

$$I_{\\text{total}} = \\left[\\frac{1}{2}mR^2 + m\\left(\\frac{R}{2}\\right)^2\\right] + m\\left(\\frac{R}{2}\\right)^2 = \\frac{mR^2}{2} + \\frac{mR^2}{4} + \\frac{mR^2}{4} = mR^2.$$

Angular momentum conservation:

$$\\frac{1}{2}mR^2 \\omega_0 = mR^2 \\omega_f \\implies \\omega_f = \\frac{\\omega_0}{2}.$$

The answer is (C).`,
  },
  {
    n: 11, correct: 'D',
    statement: `Projectiles A, B, and C are simultaneously thrown off a cliff, and take the trajectories shown.

Neglecting air resistance, rank the times $$t_A$$, $$t_B$$, and $$t_C$$ they take to hit the ground.`,
    choices: {
      A: '$$t_A < t_B < t_C$$',
      B: '$$t_A < t_C < t_B$$',
      C: '$$t_C < t_B < t_A$$',
      D: '$$t_C < t_A < t_B$$',
      E: 'There is not enough information to decide.',
    },
    figures: [F21(11)], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d'],
    solution: `With no air resistance, horizontal and vertical motions are independent. The time to hit the ground depends only on the initial vertical velocity component $$v_y$$ and the height of the cliff.

From the figure: trajectory C is launched downward (or with a large downward $$v_y$$), so it reaches the ground quickly. Trajectory A appears to be launched roughly horizontally ($$v_y \\approx 0$$), and trajectory B is launched with a large upward component, rising to a maximum height before falling, spending the most time in the air.

Therefore $$t_C < t_A < t_B$$. The answer is (D).`,
  },
  {
    n: 12, correct: 'C',
    statement: `An object of mass $$m = 1$$ kg is attached to a platform of mass $$M = 4$$ kg with a spring of spring constant $$k = 400$$ N/m. There is no friction between the object and the platform, and the coefficient of static friction between the platform and the ground is $$\\mu = 0.1$$. The object is placed at its equilibrium position, and then given a horizontal velocity $$v$$.

For what $$v$$ will the platform never slip on the ground?`,
    choices: {
      A: '$$v \\leq 0.1 \\text{ m/s}$$',
      B: '$$v \\leq 0.2 \\text{ m/s}$$',
      C: '$$v \\leq 0.25 \\text{ m/s}$$',
      D: '$$v \\leq 0.4 \\text{ m/s}$$',
      E: '$$v \\leq 0.5 \\text{ m/s}$$',
    },
    figures: [F21(12)], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM', 'friction', 'newton\'s laws'],
    solution: `The object oscillates on the frictionless platform, compressing and stretching the spring. The spring force on the platform is $$F_s = kx$$, where $$x$$ is the displacement of the object from equilibrium.

By conservation of energy, the maximum displacement is:

$$\\frac{1}{2}mv^2 = \\frac{1}{2}kx_{\\max}^2 \\implies x_{\\max} = v\\sqrt{\\frac{m}{k}}.$$

The maximum spring force on the platform is therefore:

$$F_{s,\\max} = k x_{\\max} = v\\sqrt{km}.$$

For the platform not to slip, this must be less than the maximum static friction force:

$$v\\sqrt{km} \\leq \\mu(M + m)g.$$

Solving for $$v$$:

$$v \\leq \\frac{\\mu(M + m)g}{\\sqrt{km}} = \\frac{0.1 \\times 5 \\times 10}{\\sqrt{400 \\times 1}} = \\frac{5}{20} = 0.25 \\text{ m/s}.$$

The answer is (C).`,
  },
  {
    n: 13, correct: 'D',
    statement: `A car is driving on a semicircular racetrack. Its velocity at several points along the track is shown below.

Which of the following could depict its acceleration at the corresponding points?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: F21c(13, 'A'), B: F21c(13, 'B'), C: F21c(13, 'C'), D: F21c(13, 'D'), E: F21c(13, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'kinematics-2d', 'vectors'],
    solution: `The car is undergoing circular motion on the semicircular track. Since the velocity vectors shown indicate the car is speeding up as it goes around the turn, the acceleration has two components:

1. A __centripetal (radial) component__ directed toward the center of the track, with magnitude $$v^2/r$$. Since $$v$$ increases through the turn, this component grows larger as the car progresses.
2. A __tangential component__ directed along the track (in the direction of motion), since the car is speeding up.

The correct answer must show acceleration vectors that point inward (toward center) and also have a forward tangential component, with the inward component growing as $$v$$ increases. The answer is (D).`,
  },
  {
    n: 14, correct: 'C',
    statement: `A bacterium cell swims by rotating its bundle of flagella to counter a viscous drag force in the medium. The drag force $$F(R, v, \\eta)$$ only depends on the typical length scale of the cell $$R$$, its speed $$v$$, and the viscosity of the fluid $$\\eta$$, which has units of kg/(m·s). It is observed under a microscope that a cell of length 1 µm swims at about 20 µm/s. Estimate the speed of a cell of length 0.5 µm, assuming cells of all sizes generate the same amount of force from their flagella.`,
    choices: {
      A: '5 µm/s',
      B: '10 µm/s',
      C: '40 µm/s',
      D: '80 µm/s',
      E: 'There is not enough information to decide.',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'drag force', 'scaling'],
    solution: `By dimensional analysis, find the form of $$F(R, v, \\eta)$$. Setting $$[R]^a [v]^b [\\eta]^c = [\\text{N}] = \\text{kg}\\cdot\\text{m/s}^2$$:

$$[m]^a [m/s]^b [kg/(m \\cdot s)]^c = kg \\cdot m \\cdot s^{-2}.$$

Matching powers: kg: $$c = 1$$; s: $$-b - c = -2 \\implies b = 1$$; m: $$a + b - c = 1 \\implies a = 1$$.

So $$F \\sim \\eta R v$$. At terminal velocity (constant speed), the propulsive force equals the drag:

$$F_{\\text{flagella}} = \\eta R v \\implies v = \\frac{F_{\\text{flagella}}}{\\eta R}.$$

Since $$F_{\\text{flagella}}$$ is the same for all cells and $$\\eta$$ is the same medium:

$$v \\propto \\frac{1}{R}.$$

When the cell length halves from 1 µm to 0.5 µm, the speed doubles: $$v' = 2 \\times 20 = 40 \\text{ µm/s}$$. The answer is (C).`,
  },
  {
    n: 15, correct: 'B',
    statement: `A block is released from rest at the top of a fixed, frictionless ramp with horizontal length $$L$$ and inclination $$\\theta$$.

For a fixed value of $$L$$, which value of $$\\theta$$ minimizes the time needed for the block to reach the bottom of the ramp?`,
    choices: {
      A: '$$30^\\circ$$',
      B: '$$45^\\circ$$',
      C: '$$60^\\circ$$',
      D: '$$75^\\circ$$',
      E: '$$80^\\circ$$',
    },
    figures: [F21(15)], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion', 'extreme cases'],
    solution: `The length of the ramp is $$d = L/\\cos\\theta$$. The acceleration down the ramp is $$a = g\\sin\\theta$$. Starting from rest:

$$d = \\frac{1}{2}a t^2 \\implies t^2 = \\frac{2d}{a} = \\frac{2L}{\\cos\\theta \\cdot g\\sin\\theta} = \\frac{2L}{g \\cdot \\frac{1}{2}\\sin(2\\theta)} = \\frac{4L}{g\\sin(2\\theta)}.$$

To minimize $$t$$, we maximize $$\\sin(2\\theta)$$. This is maximized when $$2\\theta = 90°$$, i.e., $$\\theta = 45°$$. The answer is (B).`,
  },
  {
    n: 16, correct: 'A',
    statement: `A particle begins at the point $$x = 0$$ and moves along the $$x$$-axis with initial rightward velocity $$v_0$$. Later, the particle reaches the point $$x = L$$. The velocity as a function of position during this time interval is shown below (a straight line from $$(0, v_0)$$ to $$(L, 0)$$).

Consider the following three statements.

I. The particle instantaneously stops at $$x = L$$.

II. The particle is uniformly accelerated.

III. The particle could be performing simple harmonic motion.

Which of these statements are true?`,
    choices: {
      A: 'Only I.',
      B: 'Only II.',
      C: 'Both I and II.',
      D: 'Both I and III.',
      E: 'None of the above.',
    },
    figures: [F21(16)], topics: ['Mechanics'], tags: ['1d kinematics', 'oscillations/SHM', 'graph interpretation'],
    solution: `__Statement I:__ Since $$v(L) = 0$$ from the graph, the particle instantaneously stops at $$x = L$$. True.

__Statement II:__ Uniform acceleration means $$v$$ is linear in __time__, not in __position__. With constant force $$F$$, energy conservation gives $$\\frac{1}{2}mv^2 = \\frac{1}{2}mv_0^2 - Fx$$, so $$v^2 = v_0^2 - \\frac{2F}{m}x$$. This is a parabola in $$x$$ (i.e., $$v \\propto \\sqrt{L - x}$$), not a straight line. The $$v$$-vs-$$x$$ graph for uniform acceleration is not linear. False.

__Statement III:__ In SHM, energy conservation gives $$\\frac{1}{2}mv^2 + \\frac{1}{2}kx^2 = \\text{const}$$, so $$v^2 = v_{\\max}^2 - \\frac{k}{m}x^2$$. This means $$v \\propto \\sqrt{v_{\\max}^2 - (kx^2/m)}$$, which is an ellipse, not a straight line, in the $$v$$-vs-$$x$$ graph. False.

Only Statement I is true. The answer is (A).`,
  },
  {
    n: 17, correct: 'C',
    statement: `In a certain country, the short hand of a clock is exactly half as long as the long hand, and rotates twice for each rotation of the long hand.

The three points shown on the clock hands have accelerations of magnitude $$a_A$$, $$a_B$$, and $$a_C$$. The point B is at the midpoint of the long hand. Which of the following is true?`,
    choices: {
      A: '$$a_A < a_B = a_C$$',
      B: '$$a_A = a_B < a_C$$',
      C: '$$a_B < a_A < a_C$$',
      D: '$$a_B < a_A = a_C$$',
      E: '$$a_B < a_C < a_A$$',
    },
    figures: [F21(17)], topics: ['Mechanics'], tags: ['circular motion', 'rotational motion'],
    solution: `The centripetal acceleration of a point at radius $$r$$ rotating at angular speed $$\\Omega$$ is $$a = \\Omega^2 r$$. From the figure, the long hand has length $$\\ell$$ and rotates at $$\\omega$$, while the short hand has length $$\\ell/2$$ and rotates at $$2\\omega$$ (two rotations per rotation of the long hand). Point A is the tip of the long hand, point B is the midpoint of the long hand, and point C is the tip of the short hand.

$$a_A = \\omega^2 \\ell$$

$$a_B = \\omega^2 \\cdot \\frac{\\ell}{2} = \\frac{\\omega^2 \\ell}{2}$$

$$a_C = (2\\omega)^2 \\cdot \\frac{\\ell}{2} = 4\\omega^2 \\cdot \\frac{\\ell}{2} = 2\\omega^2 \\ell$$

Comparing: $$a_B = \\frac{\\omega^2\\ell}{2} < a_A = \\omega^2\\ell < a_C = 2\\omega^2\\ell$$, so $$a_B < a_A < a_C$$.

The answer is (C).`,
  },
  {
    n: 18, correct: 'B',
    statement: `A factory's smokestack continually produces smoke. The smoke always rises with a constant speed relative to the air around it. Suppose that the air was initially still, then abruptly started blowing to the right, then abruptly became still again for some time. Which of the following could show the resulting shape of the smoke plume?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: F21c(18, 'A'), B: F21c(18, 'B'), C: F21c(18, 'C'), D: F21c(18, 'D'), E: F21c(18, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['kinematics-2d', 'relative motion', 'reference frames'],
    solution: `Consider the smoke at different heights:

__Smoke near the top of the plume:__ This smoke was emitted long ago, before the wind started. It rose straight upward and then was carried to the right by the wind for the full duration of the wind. It is displaced far to the right.

__Smoke at an intermediate height:__ This smoke was emitted during or shortly before the wind started. It spent some time rising in still air, then some time in the wind, then (if after the wind stopped) some time in still air again. It is displaced to the right, but by less than the top.

__Smoke near the smokestack:__ This was emitted recently, after the wind stopped. It has been rising in still air, so it goes straight up.

So the plume has three segments: a vertical segment at the top (emitted before the wind), a tilted/diagonal segment in the middle (emitted during the wind), and a vertical segment at the bottom (emitted after the wind). The segments connect smoothly.

This rules out (A) (would need the top to be tilted), (C) and (D) (wrong shape of the tilted section), and (E) (wrong continuity). The answer is (B).`,
  },
  {
    n: 19, correct: 'E',
    statement: `A cavity of radius $$R/2$$ is dug out of a spherical planet with uniform mass density of mass $$M$$ and radius $$R$$. What is the magnitude of the gravitational field at point P in the diagram below?

(Point P is on the surface of the full sphere, directly above the center of the cavity. The cavity is a sphere of radius $$R/2$$ internally tangent to the full sphere at the bottom.)`,
    choices: {
      A: '$$(0.200)GM/R^2$$',
      B: '$$(0.457)GM/R^2$$',
      C: '$$(0.829)GM/R^2$$',
      D: '$$(0.900)GM/R^2$$',
      E: '$$(0.912)GM/R^2$$',
    },
    figures: [F21(19)], topics: ['Mechanics'], tags: ['gravitation', 'shell theorem', 'vectors', 'superposition'],
    solution: `Use superposition: treat the holey sphere as a full sphere of mass $$M$$ plus a small sphere of negative mass $$-M/8$$ (since the cavity has radius $$R/2$$ and volume $$\\frac{1}{8}$$ of the full sphere).

The cavity sphere is internally tangent to the full sphere at the bottom, so its center lies a distance $$R/2$$ from the full sphere's center, along the direction toward the bottom of the sphere. Point P is on the surface of the full sphere, directly above the cavity center.

__Contribution from the full sphere:__ P is on the surface at distance $$R$$ from the center. The field points inward (toward the center):
$$g_1 = \\frac{GM}{R^2}.$$

__Contribution from the removed mass (negative-mass cavity sphere):__ The cavity has mass $$M/8$$ and its center is at distance $$r_{cP}$$ from P. Using the geometry of the diagram, $$r_{cP} = \\frac{R\\sqrt{5}}{2}$$. The magnitude of the field from this sphere at P is:
$$g_c = \\frac{G(M/8)}{(R\\sqrt{5}/2)^2} = \\frac{GM/8}{5R^2/4} = \\frac{GM}{10R^2}.$$

This field points from P toward the cavity center (attractive toward the removed mass), but since we subtract it (negative mass), it points away from the cavity center.

__Vector addition:__ Resolving both contributions along the vertical (toward the full sphere's center) and adding their vector components gives a total field magnitude of approximately $$(0.912)GM/R^2$$, directed toward the full sphere's center and slightly away from the cavity.

The answer is (E).`,
  },
  {
    n: 20, correct: 'B',
    statement: `The line between day and night on a planet or moon is called the terminator. How fast does the terminator of Earth's moon move across its surface at the equator? The radius of the moon is $$1.74 \\times 10^6$$ m.`,
    choices: {
      A: '0 m/s',
      B: '4.5 m/s',
      C: '83 m/s',
      D: '465 m/s',
      E: '2201 m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational motion', 'orbital mechanics', 'estimation'],
    solution: `The Moon is tidally locked to Earth: the same face of the Moon always points toward Earth. This means the Moon rotates on its own axis with the same period as its orbital period — approximately 28 days.

From the Moon's surface perspective, the Sun appears to move across the sky (completing a circuit) once per lunar day, which is also about 28 days. The terminator therefore sweeps around the Moon's equator once every 28 days.

Speed of the terminator:

$$v = \\frac{2\\pi R_{\\text{moon}}}{T} = \\frac{2\\pi \\times 1.74 \\times 10^6 \\text{ m}}{28 \\times 24 \\times 3600 \\text{ s}} \\approx \\frac{1.09 \\times 10^7}{2.42 \\times 10^6} \\approx 4.5 \\text{ m/s}.$$

The answer is (B).`,
  },
  {
    n: 21, correct: 'A',
    statement: `A solid sphere sits at the top of a ramp of height $$h$$ inclined at angle $$\\theta$$ to the horizontal. Both the static and kinetic coefficients of friction between the sphere and incline are $$\\mu_k = \\mu_s = 0.2$$. The sphere is released from rest at the top of the incline. For which of the following values of $$\\theta$$ is the total translational plus rotational kinetic energy of the sphere greatest when it reaches the bottom of the incline?`,
    choices: {
      A: '$$10^\\circ$$',
      B: '$$45^\\circ$$',
      C: '$$60^\\circ$$',
      D: '$$80^\\circ$$',
      E: 'The mechanical energy is the same for all choices.',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'rotational dynamics', 'friction', 'energy conservation'],
    solution: `For a solid sphere rolling without slipping, the friction force provides the torque needed for rolling, but does no work (the contact point has zero velocity). The sphere converts all its gravitational potential energy $$mgh$$ into kinetic energy — no energy is lost.

For a sphere rolling without slipping down a slope, the required friction force is $$f = \\frac{2}{7}mg\\sin\\theta$$. This must not exceed the maximum static friction $$\\mu_s mg\\cos\\theta$$. The condition for rolling without slipping is:

$$\\frac{2}{7}mg\\sin\\theta \\leq \\mu_s mg\\cos\\theta \\implies \\tan\\theta \\leq \\frac{7\\mu_s}{2} = \\frac{7 \\times 0.2}{2} = 0.7 \\implies \\theta \\leq \\arctan(0.7) \\approx 35°.$$

For $$\\theta = 10°$$: the sphere rolls without slipping, all of $$mgh$$ becomes kinetic energy.

For $$\\theta = 45°, 60°, 80°$$: the slope is too steep — the sphere slips. When slipping, kinetic friction dissipates energy, so the kinetic energy at the bottom is less than $$mgh$$.

Therefore $$\\theta = 10°$$ gives the most kinetic energy. The answer is (A).`,
  },
  {
    n: 22, correct: 'A',
    statement: `A ship rams into a hunk of ice floating in the sea. "Icebreakers" are ships designed so that when this happens, the ice is pushed down beneath the ship. If the coefficient of static friction between the ice and the ship is $$\\mu_s$$, what condition applies to the angle $$\\theta$$, as shown in the figure, so that the icebreaker functions as intended?`,
    choices: {
      A: '$$\\cot\\theta > \\mu$$',
      B: '$$\\cos\\theta > \\mu$$',
      C: '$$\\cot\\theta < \\mu$$',
      D: '$$\\cos\\theta < \\mu$$',
      E: 'It depends on the curvature of the ice.',
    },
    figures: [F21(22)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'friction', 'free-body diagrams', 'newton\'s laws'],
    solution: `The ship exerts a contact force on the ice that can be decomposed into a normal force $$N$$ (perpendicular to the ship's sloped bow, pointing inward into the ice) and a friction force $$f$$ (along the sloped surface, at most $$\\mu N$$).

With $$\\theta$$ as the angle of the ship's bow from the horizontal: the normal force $$N$$ points at angle $$\\theta$$ from the vertical (perpendicular to the slope). The vertical components of the forces on the ice from the ship:

- Normal force vertical component: $$-N\\cos\\theta$$ (downward into ice if the slope is inclined, but the ship's bow slope means the normal points... let's set up carefully)

The bow makes angle $$\\theta$$ with the vertical (or $$90° - \\theta$$ with the horizontal). The normal to the bow surface points into the ice at angle $$\\theta$$ from horizontal. The vertical component of the normal force on the ice is $$N\\sin\\theta$$ upward (pushing ice up) — but the ship is on top, so the normal from ship's sloped bow pushes ice downward and outward.

From the solution: the vertical force on the ice from the ship is $$F_y \\leq \\mu N\\sin\\theta - N\\cos\\theta$$. For the ice to be pushed __down__, we need $$F_y < 0$$:

$$N\\cos\\theta > \\mu N\\sin\\theta \\implies \\cot\\theta > \\mu.$$

The answer is (A).`,
  },
  {
    n: 23, correct: 'C',
    statement: `An imperfect spring has a restoring force $$F$$ that depends on the displacement $$x$$ from equilibrium as in the graph shown below. The slope of the curve for $$x < -d$$ and $$x > d$$ is a constant $$-k$$, and the force is zero for $$|x| \\leq d$$.

A mass $$m$$ is attached to the spring and released from rest at the position $$x = A$$, where $$A > d$$. What is the period of the subsequent motion?`,
    choices: {
      A: '$$T = \\sqrt{\\dfrac{m}{k}}\\left(2\\pi + \\dfrac{2d}{A}\\right)$$',
      B: '$$T = \\sqrt{\\dfrac{m}{k}}\\left(2\\pi + \\dfrac{2d}{A - d}\\right)$$',
      C: '$$T = \\sqrt{\\dfrac{m}{k}}\\left(2\\pi + \\dfrac{4d}{A - d}\\right)$$',
      D: '$$T = \\sqrt{\\dfrac{m}{k}}\\left(2\\pi + \\dfrac{\\pi d}{A - d}\\right)$$',
      E: '$$T = \\sqrt{\\dfrac{m}{k}}\\left(2\\pi + \\dfrac{2\\pi d}{A - d}\\right)$$',
    },
    figures: [F21(23)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'energy conservation'],
    solution: `The motion has two distinct phases:

__Phase 1 — SHM region ($$|x| > d$$):__ The spring acts normally with spring constant $$k$$. The mass oscillates as in simple harmonic motion. Starting from rest at $$x = A$$, by energy conservation, the speed when the mass reaches $$x = d$$ is:

$$\\frac{1}{2}mv^2 = \\frac{1}{2}k(A^2 - d^2) \\implies v = \\sqrt{\\frac{k}{m}}(A - d)\\sqrt{\\frac{A+d}{A-d}} \\approx \\sqrt{\\frac{k}{m}}(A - d)$$

More precisely: $$v = \\sqrt{k/m}\\sqrt{A^2 - d^2}$$... but by energy conservation and $$F = -kx$$ for $$|x| > d$$ (with equilibrium effectively at $$x = 0$$ for the SHM part):

$$\\frac{1}{2}k(A - d)^2 = \\frac{1}{2}mv^2$$... no, the spring constant acts for displacement beyond $$d$$, so the effective energy stored in the spring part is $$\\frac{1}{2}k(A - d)^2$$:

Actually from the graph: for $$x > d$$, $$F = -k(x - d)$$ (slope $$-k$$ starting from $$x = d$$). So the effective potential energy stored when at position $$A$$ relative to the zero-force region boundary at $$d$$ is $$\\frac{1}{2}k(A - d)^2$$. The speed at $$x = d$$ (entering the dead zone):

$$\\frac{1}{2}mv^2 = \\frac{1}{2}k(A - d)^2 \\implies v = (A - d)\\sqrt{k/m}.$$

__Phase 2 — dead zone ($$|x| \\leq d$$):__ No force, so the mass moves at constant speed $$v$$ through the region of width $$2d$$ (from $$+d$$ to $$-d$$). Time for this traverse:

$$t_{\\text{dead}} = \\frac{2d}{v} = \\frac{2d}{(A-d)\\sqrt{k/m}} = \\frac{2d}{A-d}\\sqrt{\\frac{m}{k}}.$$

By symmetry the same happens on the other side. The full period consists of: the SHM portion (mass goes from $$A$$ to $$d$$, then $$-d$$ to $$-A$$ and back in the spring region) plus two dead-zone traversals.

The time spent in the spring region (SHM) on one full oscillation corresponds to the fraction of an SHM period with amplitude $$A - d$$ and equilibrium at $$\\pm d$$ boundary... the cleanest way: the full SHM period $$2\\pi\\sqrt{m/k}$$ includes the passage through the dead zone as well. Since the dead zone replaces what would have been oscillation through $$x = 0$$, the time saved in the dead zone is exactly $$2 \\times \\frac{2d}{v}$$ total (two crossings per full period).

The SHM period for ideal spring is $$T_0 = 2\\pi\\sqrt{m/k}$$. This already includes passing through zero, but now the mass traverses the dead zone at constant speed instead. The dead zone takes $$\\frac{2d}{v}$$ each way, two times per period:

$$T = 2\\pi\\sqrt{\\frac{m}{k}} + 2 \\times \\frac{2d}{(A-d)\\sqrt{k/m}} = \\sqrt{\\frac{m}{k}}\\left(2\\pi + \\frac{4d}{A-d}\\right).$$

The answer is (C).`,
  },
  {
    n: 24, correct: 'B',
    statement: `Two satellites are in circular orbits around a star with equal radius $$r$$, speed $$v$$, and period $$T$$. The satellites are initially diametrically opposite each other. In order to meet the second satellite in time $$T/2$$, the first satellite should decrease its speed to approximately`,
    choices: {
      A: '$$0.50v$$',
      B: '$$0.64v$$',
      C: '$$0.71v$$',
      D: '$$0.76v$$',
      E: '$$0.82v$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'kepler\'s laws', 'energy conservation'],
    solution: `The two satellites start diametrically opposite at orbital radius $$r$$ with period $$T$$. Satellite 1 decreases its speed, dropping into a smaller elliptical orbit with a shorter period $$T'$$.

The meeting condition: satellite 2 continues its circular orbit, moving 180° in time $$T/2$$, and arrives at satellite 1's original starting position. Satellite 1 must also arrive there at the same time. If satellite 1 completes exactly one full orbit in time $$T/2$$, it returns to its own starting position — exactly where satellite 2 now is. This requires $$T' = T/2$$.

By Kepler's third law ($$T \\propto a^{3/2}$$), the new semi-major axis satisfies:

$$a' = r\\left(\\frac{T'}{T}\\right)^{2/3} = \\frac{r}{2^{2/3}}.$$

When satellite 1 reduces speed, it is at radius $$r$$, which becomes the apoapsis of its new elliptical orbit. Using the vis-viva equation with $$v_c^2 = GM/r$$:

$$v'^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a'}\\right) = v^2\\left(2 - \\frac{r}{a'}\\right) = v^2(2 - 2^{2/3}).$$

Since $$2^{2/3} \\approx 1.587$$:

$$v' = v\\sqrt{2 - 2^{2/3}} \\approx v\\sqrt{0.413} \\approx 0.64v.$$

The answer is (B).`,
  },
  {
    n: 25, correct: 'E',
    statement: `Spaceman Fred's trusty pellet sprayer is held at rest a distance $$h$$ away from the center of Planet Orb, which has radius $$R \\ll h$$. The pellet sprayer ejects pellets radially outward, uniformly in the plane of the page. These pellets are all launched with the same speed $$v$$, so that a pellet launched directly away from Orb by the pellet sprayer can just barely escape it. What fraction of the pellets eventually lands on Orb? (Hint: you may use the small angle approximation, $$\\sin\\theta \\approx \\theta$$ for $$\\theta \\ll 1$$, where $$\\theta$$ is in radians.)`,
    choices: {
      A: '$$\\dfrac{1}{2\\pi}\\dfrac{R}{h}$$',
      B: '$$\\dfrac{1}{\\pi}\\dfrac{R}{h}$$',
      C: '$$\\dfrac{2}{\\pi}\\dfrac{R}{h}$$',
      D: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{R}{h}}$$',
      E: '$$\\dfrac{1}{\\pi}\\sqrt{\\dfrac{R}{h}}$$',
    },
    figures: [F21(25)], topics: ['Mechanics'], tags: ['orbital mechanics', 'energy conservation', 'angular momentum conservation'],
    solution: `Since the pellets are launched at exactly the escape velocity, the speed of a pellet at distance $$r$$ from Orb's center is (from energy conservation with $$E_{\\text{total}} = 0$$):

$$v(r) = \\sqrt{\\frac{2GM}{r}}.$$

At $$r = h$$: $$v = \\sqrt{2GM/h}$$ (the launch speed, by definition of escape velocity).

A pellet launched at angle $$\\theta$$ from the radially-outward direction has angular momentum:

$$L = mvh\\sin\\theta \\approx mvh\\theta \\quad (\\text{small angle}).$$

At the distance of closest approach $$r_{\\min}$$, the velocity is perpendicular to the radius vector (tangential), so:

$$L = mv(r_{\\min}) r_{\\min} = m\\sqrt{\\frac{2GM}{r_{\\min}}} \\cdot r_{\\min} = m\\sqrt{2GM \\cdot r_{\\min}}.$$

Setting these equal:

$$mvh\\theta = m\\sqrt{2GM \\cdot r_{\\min}} \\implies v^2 h^2 \\theta^2 = 2GM \\cdot r_{\\min}.$$

Since $$v^2 = 2GM/h$$:

$$\\frac{2GM}{h} \\cdot h^2 \\theta^2 = 2GM \\cdot r_{\\min} \\implies r_{\\min} = h\\theta^2.$$

The pellet hits Orb when $$r_{\\min} \\leq R$$:

$$h\\theta^2 \\leq R \\implies |\\theta| \\leq \\theta_{\\max} = \\sqrt{R/h}.$$

The pellets are ejected uniformly in the plane (i.e., uniformly in angle $$\\theta$$ over $$[0, 2\\pi)$$). The fraction that hits Orb is $$2\\theta_{\\max}/(2\\pi)$$ (both $$+\\theta_{\\max}$$ and $$-\\theta_{\\max}$$ sides of the radially-outward direction):

$$f = \\frac{2\\theta_{\\max}}{2\\pi} = \\frac{\\theta_{\\max}}{\\pi} = \\frac{1}{\\pi}\\sqrt{\\frac{R}{h}}.$$

The answer is (E).`,
  },
]
