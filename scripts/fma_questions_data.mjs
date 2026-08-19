// Digitized F=ma 2024 + 2025 exam questions (pilot). Source: AAPT exam + solution
// PDFs already seeded as handouts fma-2024 / fma-2025 (see seed_fma_exams.mjs).
// figure_urls reference full exam PAGE screenshots (uploaded by upload_fma_figures.mjs)
// rather than per-question crops — a deliberate pilot simplification; a question's
// page image may show neighboring questions too.

const P24 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2024/p${n}.png`
const P25 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2025/p${n}.png`
const PP = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-practice-aops/p${n}.png`
const P08 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2008/p${n}.png`
const P09 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2009/p${n}.png`

export const questions2024 = [
  {
    n: 1, correct: 'B',
    statement: `An archer fires an arrow from the ground so that it passes through two hoops, which are both a height $$h$$ above the ground. The arrow passes through the first hoop one second after the arrow is launched, and through the second hoop another second later. What is the value of $$h$$?`,
    choices: { A: '5 m', B: '10 m', C: '12 m', D: '15 m', E: 'There is not enough information to decide.' },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', '1d kinematics'],
  },
  {
    n: 2, correct: 'A',
    statement: `An amusement park ride consists of a circular, horizontal room. A rider leans against its frictionless outer walls, which are angled back at $$30^\\circ$$ with respect to the vertical, so that the rider's center of mass is 5.0 m from the center of the room. When the room begins to spin about its center, at what angular velocity will the rider's feet first lift off the floor?`,
    choices: { A: '1.9 rad/s', B: '2.3 rad/s', C: '3.5 rad/s', D: '4.0 rad/s', E: '5.6 rad/s' },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', "newton's laws", 'normal force'],
  },
  {
    n: 3, correct: 'D',
    statement: `A simple bridge is made of five thin rods rigidly connected at four vertices (see figure). The ground is frictionless, so that it can only exert vertical normal forces at B and D. The weight of the bridge is negligible, but a person stands at its middle, exerting a downward force $$F$$ at vertex C. In static equilibrium, each rod can be experiencing either tension or compression. Which of the following is true?`,
    choices: {
      A: 'Only the vertical rod is in tension.',
      B: 'Only the horizontal rods are in tension.',
      C: 'Both the vertical rod and the diagonal rods are in tension.',
      D: 'Both the vertical rod and the horizontal rods are in tension.',
      E: 'All of the rods are in tension.',
    },
    figures: [P24(2)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'free-body diagrams'],
  },
  {
    n: 4, correct: 'D',
    statement: `A bouncy ball is thrown vertically upward from the ground. Air resistance is negligible, and the ball's collisions with the ground are perfectly elastic. Which of the following shows the kinetic energy of the ball as a function of time? Assume the collisions are too quick for their duration to be seen in the plot. (See figure for the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [P24(3)], topics: ['Mechanics'], tags: ['energy conservation', 'graph interpretation', '1d kinematics'],
  },
  {
    n: 5, correct: 'C',
    statement: `A massless inclined plane with angle $$30^\\circ$$ to the horizontal is fixed to a scale. A block of mass $$m$$ is released from the top of the plane, which is frictionless. As the block slides down the plane, what is the reading on the scale?`,
    choices: { A: '$$\\sqrt{3}\\,mg/4$$', B: '$$mg/2$$', C: '$$3mg/4$$', D: '$$\\sqrt{3}\\,mg/2$$', E: '$$mg$$' },
    figures: [P24(3)], topics: ['Mechanics'], tags: ["newton's laws", 'normal force', 'free-body diagrams'],
  },
  {
    n: 6, correct: 'C',
    statement: `A pendulum is made with a string and a bucket full of water. When the string is vertical, the bottom of the bucket is near the ground. Then, the pendulum is set swinging with a small amplitude, and a very small hole is opened at the bottom of the bucket, which leaks water at a constant rate. After a few full swings, which of the following best shows the amount of water that has landed on the ground as a function of position? (See figure for setup and the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [P24(3)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'graph interpretation'],
  },
  {
    n: 7, correct: 'C',
    statement: `A particle travels in a straight line. Its velocity as a function of time is shown in the figure (a trapezoid: ramps up, constant, ramps down). Which of the following shows the velocity as a function of distance $$x$$ from its initial position? (See figure for the stem plot and the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [P24(4)], topics: ['Mechanics'], tags: ['graph interpretation', '1d kinematics'],
  },
  {
    n: 8, correct: 'B',
    statement: `A rod of length $$L$$ is sliding down a frictionless wall (see figure). When the rod makes an angle of $$45^\\circ$$ to the horizontal, the bottom of the rod has speed $$v$$. At this moment, what is the speed of the middle of the rod?`,
    choices: { A: '$$v/2$$', B: '$$v/\\sqrt{2}$$', C: '$$v$$', D: '$$\\sqrt{2}\\,v$$', E: '$$2v$$' },
    figures: [P24(4)], topics: ['Mechanics'], tags: ['rotational motion', 'rigid body kinematics', 'relative motion'],
  },
  {
    n: 9, correct: 'C',
    statement: `When a car's brakes are fully engaged, it takes 100 m to stop on a dry road, which has coefficient of kinetic friction $$\\mu_k = 0.8$$ with the tires. Now suppose only the first 50 m of the road is dry, and the rest is covered with ice, with $$\\mu_k = 0.2$$. What total distance does the car need to stop?`,
    choices: { A: '150 m', B: '200 m', C: '250 m', D: '400 m', E: '850 m' },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'energy conservation', '1d kinematics'],
  },
  {
    n: 10, correct: 'D',
    statement: `A block of mass $$m$$ is connected to the walls of a frictionless box by two massless springs with relaxed lengths $$\\ell$$ and $$2\\ell$$, and spring constants $$k$$ and $$2k$$ respectively. The length of the box is $$3\\ell$$. The system rotates with a constant angular velocity $$\\omega$$ about one of its walls (see figure). Suppose the block stays at a constant distance $$r$$ from the axis of rotation, without touching either of the walls. What is the value of $$r$$?`,
    choices: {
      A: '$$\\dfrac{2k\\ell}{2k - m\\omega^2}$$', B: '$$\\dfrac{2k\\ell}{2k + m\\omega^2}$$', C: '$$\\dfrac{2k\\ell}{3k + m\\omega^2}$$',
      D: '$$\\dfrac{3k\\ell}{3k - m\\omega^2}$$', E: '$$\\dfrac{3k\\ell}{3k + m\\omega^2}$$',
    },
    figures: [P24(5)], topics: ['Mechanics'], tags: ['springs', 'circular motion', 'non-inertial frames'],
  },
  {
    n: 11, correct: 'A',
    statement: `Two hemispherical shells can be pressed together to form an airtight sphere of radius 40 cm. Suppose the shells are pressed together at a high altitude, where the air pressure is half its value at sea level. The sphere is then returned to sea level, where the air pressure is $$10^5$$ Pa. What force $$F$$, applied directly outward to each hemisphere, is required to pull them apart?`,
    choices: { A: '25,000 N', B: '50,000 N', C: '100,000 N', D: '200,000 N', E: '400,000 N' },
    figures: [], topics: ['Mechanics'], tags: ['fluid statics', 'pressure'],
  },
  {
    n: 12, correct: 'A',
    statement: `A space probe with mass $$m$$ at point P traverses through a cluster of three asteroids, at points A, B, and C, with masses $$M$$, $$2M$$, $$3M$$ respectively as shown in the figure (all separated by distance $$d$$). What is the torque on the probe about point C?`,
    choices: {
      A: '$$\\dfrac{1}{2\\sqrt{2}} \\dfrac{GMm}{d}$$', B: '$$\\dfrac{1}{2} \\dfrac{GMm}{d}$$', C: '$$\\dfrac{1}{\\sqrt{2}} \\dfrac{GMm}{d}$$',
      D: '$$\\dfrac{GMm}{d}$$', E: '$$\\sqrt{2}\\,\\dfrac{GMm}{d}$$',
    },
    figures: [P24(5)], topics: ['Mechanics'], tags: ['torque', 'gravitation', 'angular momentum'],
  },
  {
    n: 13, correct: 'B',
    statement: `Two frictionless blocks of mass $$m$$ are connected by a massless string which passes through a fixed massless pulley, which is a height $$h$$ above the ground. Suppose the blocks are initially held with horizontal separation $$x$$, and the length of the string is chosen so that the right block hangs in the air as shown. If the blocks are released, the tension in the string immediately afterward will be $$T$$. Which of the following shows a plot of $$T$$ versus $$x$$? (See figure for setup and the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [P24(6)], topics: ['Mechanics'], tags: ['pulleys/tension', "newton's laws", 'graph interpretation'],
  },
  {
    n: 14, correct: 'C',
    statement: `A bead of mass $$m$$ can slide frictionlessly on a vertical circular wire hoop of radius 20 cm. The hoop is attached to a stand of mass $$m$$, which can slide frictionlessly on the ground (see figure). Initially, the bead is at the bottom of the hoop, the stand is at rest, and the bead has velocity 2 m/s to the right. At some point, the bead will stop moving with respect to the hoop. At that moment, through what angle along the hoop has the bead traveled?`,
    choices: { A: '$$30^\\circ$$', B: '$$45^\\circ$$', C: '$$60^\\circ$$', D: '$$90^\\circ$$', E: '$$120^\\circ$$' },
    figures: [P24(6)], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation', 'center of mass'],
  },
  {
    n: 15, correct: 'E',
    statement: `The viscous force between two plates of area $$A$$, with relative speed $$v$$ and separation $$d$$, is $$F = \\eta A v / d$$, where $$\\eta$$ is the viscosity. In fluid mechanics, the Ohnesorge number is a dimensionless number proportional to $$\\eta$$ which characterizes the importance of viscous forces, in a drop of fluid of density $$\\rho$$, surface tension $$\\gamma$$, and length scale $$\\ell$$. Which of the following could be the definition of the Ohnesorge number?`,
    choices: {
      A: '$$\\dfrac{\\eta \\ell}{\\sqrt{\\rho \\gamma}}$$', B: '$$\\eta \\ell \\sqrt{\\rho/\\gamma}$$', C: '$$\\eta \\sqrt{\\rho/(\\gamma \\ell)}$$',
      D: '$$\\eta \\sqrt{\\rho \\ell / \\gamma}$$', E: '$$\\dfrac{\\eta}{\\sqrt{\\rho \\gamma \\ell}}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis'],
  },
  {
    n: 16, correct: 'C',
    statement: `A child of mass $$m$$ holds onto the end of a massless rope of length $$\\ell$$, which is attached to a pivot a height $$H$$ above the ground. The child is released from rest when the rope is straight and horizontal (see figure). At some point, the child lets go of the rope, flies through the air, and lands on the ground a horizontal distance $$d$$ from the pivot. On Earth, the maximum possible value of $$d$$ is $$d_E$$. If the setup is moved to the Moon, which has 1/6 the gravitational acceleration, what is the new maximum possible value of $$d$$?`,
    choices: { A: '$$d_E/6$$', B: '$$d_E/\\sqrt{6}$$', C: '$$d_E$$', D: '$$\\sqrt{6}\\,d_E$$', E: '$$6\\,d_E$$' },
    figures: [P24(7)], topics: ['Mechanics'], tags: ['dimensional analysis', 'projectile motion', 'energy conservation'],
  },
  {
    n: 17, correct: 'E',
    statement: `Consider the following system of massless and frictionless pulleys, ropes, and springs with constants $$k$$, $$2k$$, $$3k$$ (see figure). Initially, a block of mass $$m$$ is attached to the end of a rope, and the system is in equilibrium. Next the block is doubled in mass, and the system is allowed to come to equilibrium again. During the transition between these equilibria, how far does the end of the rope (where the block is suspended) move?`,
    choices: {
      A: '$$\\dfrac{7}{12}\\dfrac{mg}{k}$$', B: '$$\\dfrac{11}{12}\\dfrac{mg}{k}$$', C: '$$\\dfrac{13}{12}\\dfrac{mg}{k}$$',
      D: '$$\\dfrac{7}{6}\\dfrac{mg}{k}$$', E: '$$\\dfrac{11}{6}\\dfrac{mg}{k}$$',
    },
    figures: [P24(7)], topics: ['Mechanics'], tags: ['springs', 'statics/equilibrium', 'pulleys/tension'],
  },
  {
    n: 18, correct: 'B',
    statement: `A satellite is initially in a circular orbit of radius $$R$$ around a planet of mass $$M$$. It fires its rockets to instantaneously increase its speed by $$\\Delta v$$, keeping the direction of its velocity the same, so that it enters an elliptical orbit whose maximum distance from the planet is $$2R$$ (see figure). What is the value of $$\\Delta v$$? (Hint: when the satellite is in an elliptical orbit with semimajor axis $$a$$, its total energy per unit mass is $$-GM/2a$$.)`,
    choices: {
      A: '$$0.08\\sqrt{GM/R}$$', B: '$$0.15\\sqrt{GM/R}$$', C: '$$0.22\\sqrt{GM/R}$$',
      D: '$$0.29\\sqrt{GM/R}$$', E: '$$0.41\\sqrt{GM/R}$$',
    },
    figures: [P24(8)], topics: ['Mechanics'], tags: ['orbital mechanics', 'energy conservation', 'gravitation'],
  },
  {
    n: 19, correct: 'A',
    statement: `A wheel of radius $$R$$ has a thin rim and four spokes, each of which have uniform density. The entire rim has mass $$m$$, three of the spokes each have mass $$m$$, and the fourth spoke has mass $$3m$$ (see figure). The wheel is suspended on a horizontal frictionless axle passing through its center. If the wheel is slightly rotated from its equilibrium position, what is the angular frequency of small oscillations?`,
    choices: {
      A: '$$\\sqrt{g/3R}$$', B: '$$\\sqrt{g/2R}$$', C: '$$\\sqrt{2g/3R}$$', D: '$$\\sqrt{g/R}$$', E: '$$\\sqrt{7g/6R}$$',
    },
    figures: [P24(8)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'moment of inertia', 'torque', 'rotational motion'],
  },
  {
    n: 20, correct: 'B',
    statement: `Four massless rigid rods are connected into a quadrilateral by four hinges. The hinges have mass $$m$$, and allow the rods to freely rotate. A spring of spring constant $$k$$ is connected across each of the diagonals, so that the springs are at their relaxed length when the rods form a square (see figure). Assume the springs do not interfere with each other. If the square is slightly compressed along one of its diagonals, its shape will oscillate over time. What is the period of these oscillations?`,
    choices: {
      A: '$$2\\pi\\sqrt{m/4k}$$', B: '$$2\\pi\\sqrt{m/2k}$$', C: '$$2\\pi\\sqrt{m/k}$$', D: '$$2\\pi\\sqrt{2m/k}$$', E: '$$2\\pi\\sqrt{4m/k}$$',
    },
    figures: [P24(9)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'symmetry'],
  },
  {
    n: 21, correct: 'D',
    statement: `A syringe is filled with water of density $$\\rho$$ and negligible viscosity. Its body is a cylinder of cross-sectional area $$A_1$$, which gradually tapers into a needle with cross-sectional area $$A_2 \\ll A_1$$. The syringe is held in place and its end is slowly pushed inward by a force $$F$$, so that it moves with constant speed $$v$$. Water shoots straight out of the needle's tip. What is the approximate value of $$F$$?`,
    choices: {
      A: '$$\\rho v^2 A_1$$', B: '$$\\dfrac{\\rho v^2 A_1^2}{2A_2}$$', C: '$$\\dfrac{\\rho v^2 A_1^2}{A_2}$$',
      D: '$$\\dfrac{\\rho v^2 A_1^3}{2A_2^2}$$', E: '$$\\dfrac{\\rho v^2 A_1^3}{A_2^2}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid dynamics', "bernoulli's principle"],
  },
  {
    n: 22, correct: 'D',
    statement: `A spherical shell is made from a thin sheet of material with a mass per area of $$\\sigma$$. Consider two points, $$P_1$$ and $$P_2$$, which are close to each other, but just inside and outside the sphere, respectively. If the accelerations due to gravity at these points are $$g_1$$ and $$g_2$$, respectively, what is the value of $$|g_1 - g_2|$$?`,
    choices: { A: '$$\\pi G \\sigma$$', B: '$$4\\pi G \\sigma / 3$$', C: '$$2\\pi G \\sigma$$', D: '$$4\\pi G \\sigma$$', E: '$$8\\pi G \\sigma$$' },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'shell theorem'],
  },
  {
    n: 23, correct: 'D',
    statement: `Collisions between ping pong balls and paddles are not perfectly elastic. Suppose that if a player holds a paddle still and drops a ball on top of it from any height $$h$$, it will bounce back up to height $$h/2$$. To keep the ball bouncing steadily, the player moves the paddle up and down, so that it is moving upward with speed 1.0 m/s whenever the ball hits it. What is the height to which the ball is bouncing?`,
    choices: { A: '0.21 m', B: '0.45 m', C: '1.0 m', D: '1.7 m', E: 'There is not enough information to determine the height.' },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'collisions', 'reference frames'],
  },
  {
    n: 24, correct: 'B',
    statement: `When a projectile falls through a fluid, it experiences a drag force proportional to the product of its cross-sectional area, the fluid density $$\\rho_f$$, and the square of its speed. Suppose a sphere of density $$\\rho_s \\gg \\rho_f$$ of radius $$R$$ is dropped in the fluid from rest. When the projectile has reached half of its terminal velocity, which of the following is its displacement proportional to?`,
    choices: {
      A: '$$R\\sqrt{\\rho_s/\\rho_f}$$', B: '$$R\\,\\rho_s/\\rho_f$$', C: '$$R(\\rho_s/\\rho_f)^{3/2}$$',
      D: '$$R(\\rho_s/\\rho_f)^2$$', E: '$$R(\\rho_s/\\rho_f)^3$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid dynamics', 'drag force', 'scaling', 'dimensional analysis'],
  },
  {
    n: 25, correct: 'E',
    statement: `A yo-yo consists of two massive uniform disks of radius $$R$$ connected by a thin axle. A thick string is wrapped many times around the axle, so that the end of the string is initially a distance $$R$$ from the axle. Then, the end of the string is held in place and the yo-yo is dropped from rest. Assume that energy losses are negligible, and that the string has negligible mass and always remains vertical (see figure for a cross-section partway through the descent). Between the moment the yo-yo is released and the moment the string completely unwinds, which of the following is true regarding the yo-yo's acceleration?`,
    choices: {
      A: 'It is always zero.', B: 'It points downward, but decreases in magnitude over time.',
      C: 'It points downward and has constant magnitude.', D: 'It points downward, but increases in magnitude over time.',
      E: 'None of the above.',
    },
    figures: [P24(10)], topics: ['Mechanics'], tags: ['rotational dynamics', 'energy conservation', 'moment of inertia'],
  },
]

export const questions2025 = [
  {
    n: 1, correct: 'B',
    statement: `A particle is moving on a plane at a constant speed of 1 m/s, but not necessarily in a straight line. Which of the following plot pairs (I, II, III — see figure) could describe the particle's position over time, in rectilinear coordinates?`,
    choices: {
      A: 'I only', B: 'II only', C: 'III only', D: 'II and III only',
      E: 'All three plots could describe the particle’s position over time',
    },
    figures: [P25(2)], topics: ['Mechanics'], tags: ['graph interpretation', 'kinematics-2d', 'speed vs velocity'],
  },
  {
    n: 2, correct: 'D',
    statement: `Three identical disks are placed on a frictionless table. Initially, two of the disks are at rest and in contact with each other. The third disk is launched with speed $$v$$ directly toward the midpoint of the two stationary disks along a path perpendicular to the line connecting their centers (see figure). Analyze the motion of the disks after the collision, assuming all interactions are perfectly elastic and that when the disks collide, there is no friction or inelastic energy loss. Assume that all three disks collide simultaneously. What is the final velocity of the third disk?`,
    choices: {
      A: 'v/3 in the opposite direction to the initial velocity', B: 'v/3 in the same direction as the initial velocity',
      C: '0 (zero)', D: 'v/5 in the opposite direction to the initial velocity', E: 'v/5 in the same direction as the initial velocity',
    },
    figures: [P25(3)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
  },
  {
    n: 3, correct: 'C',
    statement: `(Continuing the three-disk setup from the previous problem.) Assume that there is a little imperfection in the disks' initial alignment so when the disks collide two collisions happen one at a time, rather than all three disks colliding simultaneously. What is the final speed of the third disk?`,
    choices: { A: 'v/2', B: 'v/3', C: 'v/4', D: 'v/5', E: '0' },
    figures: [P25(3)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
  },
  {
    n: 4, correct: 'C',
    statement: `A mouse M is running from A to A' with constant speed $$u_1$$. A cat C is chasing the mouse with constant speed $$u_2$$ and direction always toward the mouse. At a certain time $$MC \\perp AA'$$ and the length of $$MC = L$$ (see figure). What is the magnitude of the acceleration of the cat C?`,
    choices: {
      A: '0', B: '$$(u_1 - u_2)^2/(2\\pi L)$$', C: '$$u_1 u_2 / L$$', D: '$$u_1 u_2 / (2\\pi L)$$', E: 'none of the above',
    },
    figures: [P25(3)], topics: ['Mechanics'], tags: ['circular motion', 'relative motion', 'pursuit curve'],
  },
  {
    n: 5, correct: 'B',
    statement: `Three identical cylinders are used in this setup. Two of them are placed side by side on a horizontal surface, with a negligible distance between their surfaces so they do not touch. The third identical cylinder is placed on top of the first two, such that their centers form an equilateral triangle (see figure). The coefficients of friction are $$\\mu_1$$ (between the cylinders) and $$\\mu_2$$ (between the cylinders and the ground). For which of the following pairs $$(\\mu_1, \\mu_2)$$ will the system remain in equilibrium? Pair 1: $$(1/2, 1/12)$$. Pair 2: $$(1/3, 1/10)$$. Pair 3: $$(1/4, 1/8)$$.`,
    choices: { A: 'Pair 1 only', B: 'Pair 2 only', C: 'Pair 3 only', D: 'Pairs 1 and 2 only', E: 'Pairs 1, Pair 2, and Pair 3' },
    figures: [P25(4)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'friction', 'free-body diagrams'],
  },
  {
    n: 6, correct: 'A',
    statement: `A ball rolls without slipping down a ramp, which turns horizontal at the bottom; at the bottom of the ramp, the ball falls through the air (see figure, with marked starting positions A-E above the reference position O). If the ball starts from the position marked O, it lands 10 cm away from the bottom of the ramp. Which starting position will get the ball to land closest to 25 cm away?`,
    choices: { A: 'Position A', B: 'Position B', C: 'Position C', D: 'Position D', E: 'Position E' },
    figures: [P25(4)], topics: ['Mechanics'], tags: ['energy conservation', 'rolling without slipping', 'projectile motion', 'scaling'],
  },
  {
    n: 7, correct: 'C',
    statement: `A mechanism consists of three point masses, each of mass $$m$$, connected by two massless rods of length $$l$$ and a torsion spring acting as a hinge. The potential energy of the torsion spring is given by $$U_s$$. This system is designed to "walk" down a set of stairs (see figure). The angles $$\\theta_1$$ and $$\\theta_2$$ represent the orientation of the rods, and their rates of change, $$\\omega_1$$ and $$\\omega_2$$, are the corresponding angular velocities. Assume that the mass on the surface is instantaneously at rest. Which equation correctly describes the total energy of the system?`,
    choices: {
      A: '$$E = ml^2\\omega_1^2 + \\tfrac12 ml^2\\omega_2^2 + ml^2\\omega_1\\omega_2\\cos(\\theta_1+\\theta_2) + 2mgl\\sin\\theta_1 + mgl\\sin\\theta_2 + U_s$$',
      B: '$$E = \\tfrac12 ml^2\\omega_1^2 + \\tfrac12 ml^2\\omega_2^2 + 2mgl\\sin\\theta_1 + mgl\\sin\\theta_2 - U_s$$',
      C: '$$E = ml^2\\omega_1^2 + \\tfrac12 ml^2\\omega_2^2 + ml^2\\omega_1\\omega_2\\cos(\\theta_1-\\theta_2) + 2mgl\\sin\\theta_1 + mgl\\sin\\theta_2 + U_s$$',
      D: '$$E = ml^2\\omega_1^2 + \\tfrac12 ml^2\\omega_2^2 - ml^2\\omega_1\\omega_2\\cos(\\theta_1-\\theta_2) + 2mgl\\sin\\theta_1 + mgl\\sin\\theta_2 + U_s$$',
      E: '$$E = \\tfrac12 ml^2\\omega_1^2 + \\tfrac12 ml^2\\omega_2^2 + 2mgl\\sin\\theta_1 + mgl\\sin\\theta_2 + U_s$$',
    },
    figures: [P25(5)], topics: ['Mechanics'], tags: ['energy conservation', 'rotational motion', 'constraint kinematics'],
  },
  {
    n: 8, correct: 'C',
    statement: `A symmetric spinning top, rotating clockwise at an angular frequency $$\\omega$$, is placed upright in the center of a frictionless circular plate. The plate then begins to rotate counterclockwise at a constant angular velocity $$\\omega$$. Assume the top's axis remains perfectly vertical and stable without any precession. From the perspective of an observer rotating with the plate, how does the top appear to rotate?`,
    choices: {
      A: 'The top appears stationary without any rotation.', B: 'The top appears to rotate clockwise at angular frequency ω.',
      C: 'The top appears to rotate clockwise at angular frequency 2ω.', D: 'The top appears to rotate counterclockwise at angular frequency ω.',
      E: 'The top appears to rotate counterclockwise at angular frequency 2ω.',
    },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum', 'reference frames', 'rotational motion'],
  },
  {
    n: 9, correct: 'E',
    statement: `$$N$$ circles in a plane, $$C_i$$, each rotate with frequency $$\\omega$$ relative to an inertial frame. The center of $$C_1$$ is fixed in the inertial frame, and the center of $$C_i$$ is fixed on $$C_{i-1}$$ (for $$i = 2,\\dots,N$$), as shown in the figure. Each circle has radius $$r_i = \\lambda r_{i-1}$$, where $$0 < \\lambda < 1$$. A mass is fixed on $$C_N$$. For the $$N=4$$ case shown, during the time interval from 0 to $$2\\pi/\\omega$$, the magnitude of acceleration of the mass on $$C_4$$:`,
    choices: {
      A: 'reached its maximum and minimum more than once.', B: 'reached its maximum and minimum exactly once.',
      C: 'reached its maximum only once but the minimum more than once.', D: 'reached its minimum only once but the maximum more than once.',
      E: 'was constant.',
    },
    figures: [P25(6)], topics: ['Mechanics'], tags: ['circular motion', 'kinematics-2d', 'rotational motion'],
  },
  {
    n: 10, correct: 'C',
    statement: `When two objects of very different masses collide, it is difficult to transfer a substantial fraction of the energy of one to the other. Consider two objects, of mass $$m$$ and $$M \\gg m$$. If the lighter object is initially at rest, and the heavier object collides elastically with it, what is the approximate maximum fraction of the heavier object's kinetic energy that could be transferred to the lighter object?`,
    choices: { A: 'm/M', B: '2m/M', C: '4m/M', D: '$$m^2/M^2$$', E: '$$2m^2/M^2$$' },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
  },
  {
    n: 11, correct: 'C',
    statement: `(Same setup as the previous problem: masses $$m$$ and $$M \\gg m$$.) Now suppose that instead, the heavier object is initially at rest, and the lighter object collides elastically with it. What is the approximate maximum fraction of the lighter object's kinetic energy that could be transferred to the heavier object?`,
    choices: { A: 'm/M', B: '2m/M', C: '4m/M', D: '$$m^2/M^2$$', E: '$$2m^2/M^2$$' },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
  },
  {
    n: 12, correct: 'A',
    statement: `A 50 g piece of clay is thrown horizontally with a velocity of 20 m/s striking the bob of a stationary pendulum with length $$l = 1$$ m and a bob mass of 200 g. Upon impact, the clay sticks to the pendulum weight and the pendulum starts to swing. What is the maximum change in angle of the pendulum?`,
    choices: { A: '$$\\arccos(1/5)$$', B: '$$\\arcsin(7/10)$$', C: '$$\\arccos(2/3)$$', D: '$$\\arcsin(3/10)$$', E: '$$\\arctan(4/5)$$' },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation', 'pendulum'],
  },
  {
    n: 13, correct: 'A',
    statement: `Angela the puppy loves chasing tennis balls, so her owners built a tennis ball launcher. It fires balls along the floor at some initial speed, applying no rotation to them. The balls initially slip along the floor, then start rolling without slipping. Ignore the potential deformation of the ball and floor during this process, as well as air resistance. Which of the following plot pairs could show the linear speed $$v$$ and rotational speed $$\\omega$$ of one of the balls over time? Assume the floor has a constant roughness. (See figure for the five candidate plot pairs.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [P25(7)], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'graph interpretation'],
  },
  {
    n: 14, correct: 'D',
    statement: `(Same tennis-ball-launcher setup.) There are three kinds of balls that can be launched, all having the same radius $$R$$: I. a regular tennis ball (a thin spherical shell of rubber) of mass $$m_1$$; II. a solid wooden ball of mass $$m_2$$; III. a solid rubber ball of mass $$m_3$$; where $$m_1 < m_2 < m_3$$. All three types of ball emerge from the launcher with the same velocity. For which ball will the final velocity (once it's rolling without slipping) be highest?`,
    choices: { A: 'Ball I', B: 'Ball II', C: 'Ball III', D: 'Balls II and III', E: 'The final velocity will be the same for all three balls' },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'moment of inertia', 'friction'],
  },
  {
    n: 15, correct: 'E',
    statement: `A uniform rigid rod of mass $$M$$ and length $$2L$$ is attached to a massless rod of length $$L$$, which is fixed at one end to the ceiling and free to rotate in a vertical plane. The massive rod is connected to the free end of the massless rod (see figure). Suppose an impulse $$J$$ is applied horizontally to the bottom of the massive rod. Determine the relationship between the magnitudes of the angular velocity $$\\omega$$ of the massless rod and $$\\Omega$$ of the massive rod immediately after the impulse is applied. The moment of inertia of a uniform rod of length $$d$$ and mass $$m$$ about its center of mass is $$I = \\tfrac{1}{12}md^2$$.`,
    choices: {
      A: '$$\\Omega = \\tfrac34 \\omega$$', B: '$$\\Omega = \\tfrac23 \\omega$$', C: '$$\\Omega = \\tfrac43 \\omega$$',
      D: '$$\\Omega = \\tfrac{1}{12} \\omega$$', E: '$$\\Omega = \\tfrac32 \\omega$$',
    },
    figures: [P25(8)], topics: ['Mechanics'], tags: ['angular momentum', 'impulse', 'rotational dynamics', 'moment of inertia'],
  },
  {
    n: 16, correct: 'A',
    statement: `Two soap bubbles of radii $$R_1 = 1$$ cm and $$R_2 = 2$$ cm conjoin together in the air, such that a narrow bridge forms between them. Assuming the system starts in equilibrium, the bubbles are extremely thin, and that air can flow freely between the bubbles through the bridge, describe the evolution and final state of the bubbles.`,
    choices: {
      A: 'The smaller bubble will shrink and the larger bubble will grow.', B: 'The larger bubble will shrink and the smaller bubble will grow.',
      C: 'The bubbles will maintain their sizes.', D: 'Air will oscillate between the two bubbles.', E: 'Both bubbles will simultaneously shrink.',
    },
    figures: [], topics: ['Mechanics'], tags: ['surface tension', 'fluid statics', 'pressure'],
  },
  {
    n: 17, correct: 'B',
    statement: `A particle of mass $$m$$ moves in the $$xy$$ plane with potential energy $$U(x,y) = -k\\dfrac{x^2+y^2}{2}$$. The closest point to the origin during its motion was at a distance $$d$$, and the particle's speed at that point was $$v \\neq 0$$. Which of the following statements is true regarding the path of the particle after a long time $$t$$ ($$t \\gg d/v$$)?`,
    choices: {
      A: "The particle's trajectory will be circular.", B: "The particle's trajectory will be asymptotic to a straight line pointing away from the origin.",
      C: 'The particle will spiral outwards away from the origin.', D: 'The particle will travel on a parabolic trajectory.',
      E: 'The particle will spiral inwards towards the origin.',
    },
    figures: [], topics: ['Mechanics'], tags: ['potential energy', 'angular momentum conservation', 'equations of motion'],
  },
  {
    n: 18, correct: 'D',
    statement: `A particle of mass $$m$$ moves in the $$xy$$ plane with potential energy $$U(x,y) = kxy/2$$. If the particle begins at the origin, then it is possible to displace it slightly in some direction, so that the particle subsequently oscillates periodically. What is the period of this motion?`,
    choices: { A: '$$2\\pi\\sqrt{m/4k}$$', B: '$$2\\pi\\sqrt{m/2k}$$', C: '$$2\\pi\\sqrt{m/k}$$', D: '$$2\\pi\\sqrt{2m/k}$$', E: '$$2\\pi\\sqrt{4m/k}$$' },
    figures: [], topics: ['Mechanics'], tags: ['potential energy', 'oscillations/SHM', 'normal modes'],
  },
  {
    n: 19, correct: 'E',
    statement: `Near the ground, wind speed can be modeled as proportional to height above the ground. A wind turbine converts a constant fraction of the available kinetic energy into electricity. The conditions are such that when operating at 10 m above the ground, the turbine delivers 15 kW of power. How much power would the same windmill deliver if it were operating at 20 m above the ground?`,
    choices: { A: '15 kW', B: '21 kW', C: '30 kW', D: '60 kW', E: '120 kW' },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling', 'energy conservation', 'power'],
  },
  {
    n: 20, correct: 'C',
    statement: `The International Space Station orbits the Earth in a circular orbit 400 km above the surface, and a full revolution takes 93 minutes. An astronaut on a space walk neglects safety precautions and tosses away a spanner at a speed of 1 m/s directly towards the Earth. You may assume that the Earth is a sphere of uniform density. At which of the following five times will the spanner be closest to the astronaut?`,
    choices: { A: 'After 139.5 minutes.', B: 'After 131.5 minutes.', C: 'After 93 minutes.', D: 'After 46.5 minutes.', E: 'After 1 minute.' },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'relative motion', 'gravitation'],
  },
  {
    n: 21, correct: 'B',
    statement: `Water flows through a pipe with a radius of 5 cm at a velocity of 10 cm/s before entering a narrower section of pipe with a radius of 2.5 cm (see figure). What is the difference in the speed of water between the two pipes?`,
    choices: { A: '20 cm/s', B: '30 cm/s', C: '40 cm/s', D: '50 cm/s', E: '60 cm/s' },
    figures: [P25(10)], topics: ['Mechanics'], tags: ['fluid dynamics', 'continuity equation'],
  },
  {
    n: 22, correct: 'B',
    statement: `(Same pipe setup as the previous problem.) To measure the speed difference, two graduated cylinders are connected to the top of the pipe (one in the broad section and the other in the narrowed section). Water then flows up each pipe and the height the water reaches is measured. Estimate the difference in height between the two cylinders.`,
    choices: { A: '6.3 mm', B: '7.5 mm', C: '8.2 mm', D: '12.2 mm', E: '12.7 mm' },
    figures: [P25(10)], topics: ['Mechanics'], tags: ['fluid dynamics', "bernoulli's principle"],
  },
  {
    n: 23, correct: 'B',
    statement: `A student conducted an experiment to determine the spring constant of a spring using a ruler and two different weighing scales. The measured elongation of the spring was 1.5 cm, and the smallest division on the ruler was 1 mm. The mass of the attached weight was measured using two different scales in the school laboratory, yielding values of 198 g and 210 g. The student also found that the local acceleration due to gravity in her city is given as $$(9.806 \\pm 0.001)\\,\\text{m/s}^2$$. Calculate the percent error in measuring the spring constant.`,
    choices: { A: '2 %', B: '4 %', C: '8 %', D: '11 %', E: '14 %' },
    figures: [], topics: ['Experimental Methods'], tags: ['data analysis', 'uncertainty propagation', 'error analysis'],
  },
  {
    n: 24, correct: 'A',
    statement: `A massive bead is attached to the end of a massless rigid rod of length $$L$$. The other end of the rod is attached to an ideal pivot, which allows it to rotate frictionlessly in any direction. The rod is initially at angle $$\\theta$$ to the horizontal, and there is no gravitational force (see figure). Next, the bead receives an impulse directly into the page, giving it a speed $$v$$. How long does it take for the bead to return to its original position?`,
    choices: { A: '$$2\\pi L/v$$', B: '$$(2\\pi L/v)\\sin\\theta$$', C: '$$(2\\pi L/v)\\cos\\theta$$', D: '$$(2\\pi L/v)\\cos^2\\theta$$', E: '$$(2\\pi L/v)\\cos^2(2\\theta)$$' },
    figures: [P25(11)], topics: ['Mechanics'], tags: ['circular motion', 'impulse', 'kinematics-2d'],
  },
  {
    n: 25, correct: 'E',
    statement: `A puck of mass $$m$$ can slide on a frictionless inclined plane (prism). The prism has a much greater mass compared to the puck and is itself sliding without friction on a horizontal surface (see figure). The velocity of the prism is $$v = \\sqrt{2gh}$$, where $$h$$ is the height from which the puck starts sliding on the prism. The transition from the prism to the horizontal surface is smooth. The puck starts from rest relative to the prism. Find the final velocity of the puck once it begins sliding on the horizontal surface.`,
    choices: { A: '$$v/2$$', B: '$$v/\\sqrt{2}$$', C: '$$v$$', D: '$$\\sqrt{2}\\,v$$', E: '$$2v$$' },
    figures: [P25(11)], topics: ['Mechanics'], tags: ['momentum conservation', 'relative motion', 'reference frames'],
  },
]

// AoPS-authored "Practice Exam 1" for the F=ma Problem Series course (2019) —
// not an official AAPT exam. Source: G:\My Drive\AoPS\courses\F=ma Problem Series\old docs\PracticeF-ma_questions.pdf / _solutions.pdf
export const questionsPractice = [
  {
    n: 1, correct: 'D',
    statement: `At a certain car show, cars accelerate from rest with some constant acceleration $$a$$ along a straight course. Each car has a different acceleration, but each accelerates to a maximum speed of 30 m/s. When the car reaches this speed, its position $$x$$ is recorded. Which of the following shows a plot of $$x$$ vs $$a$$? (See figure for the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [PP(2)], topics: ['Mechanics'], tags: ['graph interpretation', 'dimensional analysis', '1d kinematics'],
  },
  {
    n: 2, correct: 'E',
    statement: `Kepler's second law states that the area per unit time, $$\\Delta A/\\Delta t$$, swept out by a planet orbiting the sun is constant along the planet's orbit. How does $$\\Delta A/\\Delta t$$ depend on the length $$a$$ of the semi-major axis of the planet's orbit?`,
    choices: { A: '$$\\Delta A/\\Delta t \\propto a^{-3/2}$$', B: '$$\\Delta A/\\Delta t \\propto a^{-1}$$', C: '$$\\Delta A/\\Delta t \\propto a^{-1/2}$$', D: '$$\\Delta A/\\Delta t \\propto a^0$$', E: '$$\\Delta A/\\Delta t \\propto a^{1/2}$$' },
    figures: [], topics: ['Mechanics'], tags: ["kepler's laws", 'orbital mechanics', 'dimensional analysis'],
  },
  {
    n: 3, correct: 'B',
    statement: `A mass $$m$$ is connected to the end of a string of length $$l$$. You hold the far end of the string and swing the mass around your head at a constant angular velocity such that the string makes an angle $$\\theta$$ with the horizontal (see figure). What is the tension in the string?`,
    choices: { A: '$$mg\\sin\\theta$$', B: '$$mg/\\sin\\theta$$', C: '$$mgl^2\\cos\\theta$$', D: '$$mg$$', E: '$$(mg/l)\\tan\\theta$$' },
    figures: [PP(3)], topics: ['Mechanics'], tags: ['circular motion', 'tension', "newton's laws"],
  },
  {
    n: 4, correct: 'B',
    statement: `A projectile is launched at speed $$v_0$$ and angle $$\\phi$$ above the horizontal on a hill which slopes upward at angle $$\\theta > 0$$ above the horizontal (see figure). The range of the projectile is $$R$$. Air resistance is negligible. Which of the following are true?`,
    choices: {
      A: 'R is maximized when $$\\phi - \\theta = 45^\\circ$$.', B: 'The maximum of R is proportional to $$v_0^2$$.',
      C: "To maximize R, the projectile should be fired so its y-component of velocity reaches zero at impact with the hill.",
      D: 'The angle $$\\phi$$ which maximizes R is less than $$45^\\circ$$.', E: 'None of the above.',
    },
    figures: [PP(3)], topics: ['Mechanics'], tags: ['projectile motion', 'dimensional analysis', 'extreme cases'],
  },
  {
    n: 5, correct: 'D',
    statement: `An ice cube has density less than that of water and greater than that of oil. The ice cube floats between a layer of water and oil (see figure). When the ice cube melts, what happens? (Ignore any thermal expansion or contraction of the water.)`,
    choices: {
      A: 'The top of the oil goes down and the top of the water remains the same.', B: 'The top of the oil stays the same and the top of the water remains the same.',
      C: 'The top of the oil goes down and the top of the water goes down.', D: 'The top of the oil goes down and the top of the water goes up.',
      E: 'The top of the oil goes up and the top of the water goes up.',
    },
    figures: [PP(4)], topics: ['Mechanics'], tags: ['fluid statics', 'buoyancy'],
  },
  {
    n: 6, correct: 'A',
    statement: `The Young's modulus of steel is $$Y = 200$$ GPa. A mass of $$m = 300$$ kg is suspended from a steel wire of circular cross section and radius $$r = 0.15$$ cm and length $$l = 2$$ m. Find the frequency of vertical oscillations of the mass.`,
    choices: { A: '7.7 Hz', B: '12.0 Hz', C: '19.9 Hz', D: '48.5 Hz', E: '305 Hz' },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'material properties'],
  },
  {
    n: 7, correct: 'A',
    statement: `A low-altitude circular orbit of Earth takes approximately 90 minutes and a low-altitude circular orbit of the Moon takes about 115 minutes. What is the ratio of the density of the moon to the density of Earth?`,
    choices: { A: '0.6', B: '0.8', C: '1.0', D: '1.3', E: '1.6' },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'gravitation', 'dimensional analysis'],
  },
  {
    n: 8, correct: 'B',
    statement: `The jerk of a given motion is the rate of change of the acceleration, $$j = \\Delta a/\\Delta t$$. (Thus, jerk is to acceleration what acceleration is to velocity.) In uniform circular motion, in which direction does the jerk point?`,
    choices: {
      A: 'In the same direction as the motion.', B: 'In the opposite direction as the motion.',
      C: 'Towards the center of the circle.', D: 'Away from the center of the circle.', E: 'None of the above.',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'kinematics-2d'],
  },
  {
    n: 9, correct: 'C',
    statement: `You are asked to measure the coefficient of kinetic friction between the floor and a box. To do this, you push the box with an initial velocity $$v_0 = 5.0 \\pm 0.3$$ m/s and observe that the box travels a distance $$6.4 \\pm 0.5$$ m. Assuming there is negligible uncertainty in $$g$$, how should you report the friction coefficient and your uncertainty on it?`,
    choices: { A: '$$\\mu = 0.195 \\pm 0.005$$', B: '$$\\mu = 0.195 \\pm 0.019$$', C: '$$\\mu = 0.195 \\pm 0.028$$', D: '$$\\mu = 0.20 \\pm 0.11$$', E: '$$\\mu = 0.20 \\pm 0.14$$' },
    figures: [], topics: ['Mechanics'], tags: ['data analysis', 'uncertainty propagation', 'friction'],
  },
  {
    n: 10, correct: 'D',
    statement: `A uniform rod with an extra mass attached somewhere near the right hand end has a string tied to it so that the rod hangs horizontally from the string (see figure). The distances $$x_1$$ from the string to the left end and $$x_2$$ to the right end are measured. Then the rod is cut at the string, resulting in two parts, found to have masses $$m_1$$ and $$m_2$$ ($$m_2$$ includes the extra mass). It is found that:`,
    choices: {
      A: '$$x_1 = x_2$$ and $$m_1 = m_2$$.', B: '$$x_1 > x_2$$ and $$m_1 = m_2$$.', C: '$$x_1 > x_2$$ and $$m_1 > m_2$$.',
      D: '$$x_1 > x_2$$ and $$m_1 < m_2$$.', E: '$$x_1 < x_2$$ and $$m_1 = m_2$$.',
    },
    figures: [PP(5)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium', 'center of mass'],
  },
  {
    n: 11, correct: 'D',
    statement: `A molecule bounces back and forth between the walls of a container. All collisions are elastic. Considered over a period of time long compared to the crossing time, the collisions exert a pressure $$P$$ on the walls. How does this pressure depend on $$v$$, the speed of the molecule?`,
    choices: { A: '$$P \\propto v^{1/2}$$', B: '$$P \\propto v$$', C: '$$P \\propto v^{3/2}$$', D: '$$P \\propto v^2$$', E: '$$P \\propto v^3$$' },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'scaling', 'kinetic theory'],
  },
  {
    n: 12, correct: 'C',
    statement: `A particle begins at rest and experiences an external force such that the power delivered to the particle is constant. Which of the following plots shows the acceleration of the particle as a function of time? (See figure for the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [PP(6)], topics: ['Mechanics'], tags: ['graph interpretation', 'power', 'energy conservation'],
  },
  {
    n: 13, correct: 'B',
    statement: `Two masses, $$m_1$$ and $$m_2$$, are attached to either end of a string which extends through a hole in a frictionless table (see figure). The mass $$m_2$$ hangs vertically while $$m_1$$ rotates around the table at an angular velocity such that $$m_2$$ is stationary. The length of string on top of the table is $$l$$. Next, $$m_1$$ is given a small radial velocity. Find the angular frequency of oscillations of $$m_2$$.`,
    choices: {
      A: '$$\\sqrt{g/l}$$', B: '$$\\sqrt{3m_2g/((m_1+m_2)l)}$$', C: '$$\\sqrt{3m_1g/((m_1+m_2)l)}$$',
      D: '$$\\sqrt{2m_1g/(m_2l)}$$', E: '$$\\sqrt{3g/l}$$',
    },
    figures: [PP(7)], topics: ['Mechanics'], tags: ['circular motion', 'oscillations/SHM', 'extreme cases', 'angular momentum'],
  },
  {
    n: 14, correct: 'E',
    statement: `A rod is bent into a circle. A ring is threaded around the rod and moves without friction on the rod. Two ideal Hookean zero-rest-length springs are attached to the rod at opposite sides of a diameter, and each spring is also connected to the ring (see figure). At which of the numbered positions is the ring in equilibrium? (Ignore gravity.)`,
    choices: {
      A: 'At position 1 and 5 only.', B: 'At position 3 only.', C: 'At positions 1, 3, and 5 only.',
      D: 'At positions 2 and 4 only.', E: 'At positions 1, 2, 3, 4, and 5.',
    },
    figures: [PP(8)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'springs', 'symmetry'],
  },
  {
    n: 15, correct: 'D',
    statement: `A solid cube of uniform density rests on the ground. A horizontal force is exerted on the center of one vertical face of the cube toward the center of the cube. What is the minimum coefficient of static friction such that the cube rotates up off the ground?`,
    choices: { A: '$$\\mu_{min} = 0.25$$', B: '$$\\mu_{min} = 0.5$$', C: '$$\\mu_{min} = 0.707$$', D: '$$\\mu_{min} = 1$$', E: '$$\\mu_{min} = 2$$' },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'friction'],
  },
  {
    n: 16, correct: 'A',
    statement: `Consider three methods of determining the volume of a cube: (1) measuring the side length $$s$$ to accuracy $$\\Delta s$$, then cubing it; (2) measuring length, width, height independently with errors $$\\Delta l, \\Delta w, \\Delta h$$, then taking the product; (3) submersing the cube in water to directly measure the volume, with error $$\\Delta V$$. Suppose for each independent measurement, the relative error is 1%. Then the methods ranked in terms of their total error in the volume are:`,
    choices: { A: '1 > 2 > 3', B: '1 = 2 > 3', C: '1 = 2 = 3', D: '2 > 1 = 3', E: '1 > 2 = 3' },
    figures: [], topics: ['Mechanics'], tags: ['data analysis', 'uncertainty propagation'],
  },
  {
    n: 17, correct: 'D',
    statement: `Two springs of spring constants $$k_1$$ and $$k_2$$ are attached to the same side of a mass in parallel (see figure). The angular frequency $$\\omega_p$$ of the oscillations is measured. Then the springs are attached in series, and the angular frequency $$\\omega_s$$ is measured. It is found that $$\\omega_p/\\omega_s = k_1/k_2$$. Find $$\\omega_p/\\omega_s$$.`,
    choices: { A: '1.414', B: '1.618', C: '2', D: '2.148', E: '4' },
    figures: [PP(9)], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM'],
  },
  {
    n: 18, correct: 'D',
    statement: `A beam is constructed with a square cross section of side length $$s$$ and length $$l$$. The beam is laid horizontally between two supports and a load $$F$$ is applied to its center, causing a sag $$\\Delta y_1$$ obeying $$k_1 \\Delta y_1 = F_1$$ (the sag due to the beam's own weight is negligible). A second beam of the same material has length $$2l$$ and cross-section side length $$2s$$; its sag obeys $$k_2 \\Delta y_2 = F_2$$. How is $$k_2$$ related to $$k_1$$?`,
    choices: { A: '$$k_2 = k_1/4$$.', B: '$$k_2 = k_1/2$$.', C: '$$k_2 = k_1$$.', D: '$$k_2 = 2k_1$$.', E: '$$k_2 = 4k_1$$.' },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling', 'material properties'],
  },
  {
    n: 19, correct: 'E',
    statement: `Consider three methods of obtaining a meter stick: (a) buy one of length $$100 \\pm 0.2$$ cm ($$\\sigma_1 = 0.2$$ cm); (b) take two sticks, each $$50.0 \\pm 0.1$$ cm, measured independently, and connect them end-to-end with no gap (uncertainty $$\\sigma_2$$); (c) take a stick of length $$200.0 \\pm 0.4$$ cm and cut it exactly in half (uncertainty $$\\sigma_3$$). Which answer gives the correct ranking in the uncertainties of the meter sticks?`,
    choices: { A: '$$\\sigma_3 > \\sigma_2 > \\sigma_1$$.', B: '$$\\sigma_1 = \\sigma_2 = \\sigma_3$$.', C: '$$\\sigma_1 > \\sigma_3 > \\sigma_2$$.', D: '$$\\sigma_3 > \\sigma_1 > \\sigma_2$$.', E: '$$\\sigma_3 = \\sigma_1 > \\sigma_2$$.' },
    figures: [], topics: ['Mechanics'], tags: ['data analysis', 'uncertainty propagation'],
  },
  {
    n: 20, correct: 'D',
    statement: `A disk of radius $$R$$ has a hole of radius $$r = R/4$$ cut out. The center of the hole is a distance $$r$$ above the center of the disk (see figure). The disk is pivoted about an axis through its center, perpendicular to the disk, and can freely rotate about this pivot. If the disk is rotated a small amount, it undergoes harmonic oscillation. What is the frequency of these oscillations?`,
    choices: { A: '$$\\sqrt{g/R}$$', B: '$$0.57\\sqrt{g/R}$$', C: '$$0.25\\sqrt{g/R}$$', D: '$$0.17\\sqrt{g/R}$$', E: '$$0.088\\sqrt{g/R}$$' },
    figures: [PP(11)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'moment of inertia', 'torque'],
  },
  {
    n: 21, correct: 'E',
    statement: `A frictionless track contains a loop with radius $$R$$. The loop begins at a height $$4R$$ above the bottom of the loop (see figure). An object of mass $$M$$ is released from rest at the top of the track. At the bottom of the loop, it collides inelastically with a second object of mass $$m$$. Find the minimum ratio $$M/m$$ so that the balls go around the loop.`,
    choices: { A: '1', B: '1.67', C: '2', D: '2.41', E: '3.77' },
    figures: [PP(12)], topics: ['Mechanics'], tags: ['energy conservation', 'momentum conservation', 'collisions', 'circular motion'],
  },
  {
    n: 22, correct: 'B',
    statement: `A solid disk of radius $$R$$ is cut into quarters, and one quarter is considered; its center of mass lies on the axis of symmetry a distance $$r_{\\pi/2} = R\\cdot\\frac{4\\sqrt{2}}{3\\pi}$$ from the tip (see figure). When a solid disk is cut in half, the center of mass of a half is again on the axis of symmetry. How far is the distance $$r_\\pi$$ from the center of mass to the point that was the center of the solid disk?`,
    choices: { A: '$$2\\sqrt{2}/3\\pi$$', B: '$$4/3\\pi$$', C: '$$8/3\\pi$$', D: '$$1/2$$', E: '$$2/3$$' },
    figures: [PP(13)], topics: ['Mechanics'], tags: ['center of mass'],
  },
  {
    n: 23, correct: 'C',
    statement: `A triangular wedge of mass $$M$$ has the shape of a right triangle with its hypotenuse resting on a frictionless table. The angles the sides make with the horizontal are $$\\alpha$$ and $$\\beta$$ (see figure). A mass $$m$$ sits on each side; the sides of the wedge are frictionless. Everything is released from rest. Assuming $$\\alpha < \\beta$$, which direction does the wedge accelerate?`,
    choices: { A: 'left', B: 'right', C: 'the wedge does not accelerate', D: 'it depends on the value of $$\\alpha$$', E: 'up' },
    figures: [PP(13)], topics: ['Mechanics'], tags: ['statics/equilibrium', "newton's laws", 'symmetry'],
  },
  {
    n: 24, correct: 'C',
    statement: `Archimedes was given a crown and asked to determine whether it was pure gold, made of some percent gold and the remainder silver. He determined the volume of the crown to be $$143 \\pm 1.5$$ cm³ and its mass to be $$2.70 \\pm 0.03$$ kg. The density of silver is 10.49 g/cm³ and of gold is 19.32 g/cm³. Assuming volume and mass are unchanged on mixing, what percent of the crown should Archimedes report to be gold, by volume?`,
    choices: { A: '95 ± 1%', B: '95 ± 2%', C: '95 ± 3%', D: '95 ± 4%', E: '95 ± 5%' },
    figures: [], topics: ['Mechanics'], tags: ['data analysis', 'uncertainty propagation', 'fluid statics'],
  },
  {
    n: 25, correct: 'B',
    statement: `A 600 kg bale of hay (modeled as a solid cylinder) sits on a sled of weight 300 kg on frictionless ice (see figure). When the sled is pulled to the right by a net force of 1500 N, the bale rolls without slipping. Find the acceleration of the center of the bale.`,
    choices: { A: '0', B: '1 m/s²', C: '1.25 m/s²', D: '1.67 m/s²', E: '2.5 m/s²' },
    figures: [PP(14)], topics: ['Mechanics'], tags: ['rolling without slipping', "newton's laws", 'friction'],
  },
]

// 2008 official AAPT F=ma exam (25 Q, single-penalty era: -1/4 for wrong).
export const questions2008 = [
  {
    n: 1, correct: 'D',
    statement: `A bird flying in a straight line, initially at 10 m/s, uniformly increases its speed to 18 m/s while covering a distance of 40 m. What is the magnitude of the acceleration of the bird?`,
    choices: { A: '0.1 m/s²', B: '0.2 m/s²', C: '2.0 m/s²', D: '2.8 m/s²', E: '5.6 m/s²' },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics'],
  },
  {
    n: 2, correct: 'C',
    statement: `A cockroach is crawling along the walls inside a cubical room that has an edge length of 3 m. If the cockroach starts from the back lower left hand corner of the cube and finishes at the front upper right hand corner, what is the magnitude of the displacement of the cockroach?`,
    choices: { A: '$$3\\sqrt{2}$$ m', B: '$$3\\sqrt[3]{2}$$ m', C: '$$3\\sqrt{3}$$ m', D: '3 m', E: '9 m' },
    figures: [], topics: ['Mechanics'], tags: ['kinematics-2d', 'vectors'],
  },
  {
    n: 3, correct: 'A',
    statement: `The position vs. time graph for an object moving in a straight line is shown below. What is the instantaneous velocity at $$t = 2$$ s?`,
    choices: { A: '-2 m/s', B: '$$-\\tfrac12$$ m/s', C: '0 m/s', D: '2 m/s', E: '4 m/s' },
    figures: [P08(2)], topics: ['Mechanics'], tags: ['graph interpretation', '1d kinematics'],
  },
  {
    n: 4, correct: 'D',
    statement: `The information below is for this and the next problem. Shown is the velocity vs. time graph for a toy car moving along a straight line. What is the maximum displacement from start for the toy car?`,
    choices: { A: '3 m', B: '5 m', C: '6.5 m', D: '7 m', E: '7.5 m' },
    figures: [P08(3)], topics: ['Mechanics'], tags: ['graph interpretation', '1d kinematics'],
  },
  {
    n: 5, correct: 'C',
    statement: `(Same toy car velocity-vs-time graph as the previous problem.) Which of the following acceleration vs. time graphs most closely represents the acceleration of the toy car? (See figure for the five candidate plots.)`,
    choices: { A: '(see figure)', B: '(see figure)', C: '(see figure)', D: '(see figure)', E: '(see figure)' },
    figures: [P08(3)], topics: ['Mechanics'], tags: ['graph interpretation', '1d kinematics'],
  },
  {
    n: 6, correct: 'A',
    statement: `A cannon fires projectiles on a flat range at a fixed speed but with variable angle. The maximum range of the cannon is $$L$$. What is the range of the cannon when it fires at an angle $$\\pi/6$$ above the horizontal? Ignore air resistance.`,
    choices: { A: '$$\\tfrac{\\sqrt3}{2}L$$', B: '$$\\tfrac{1}{\\sqrt2}L$$', C: '$$\\tfrac{1}{\\sqrt3}L$$', D: '$$\\tfrac12 L$$', E: '$$\\tfrac13 L$$' },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion'],
  },
  {
    n: 7, correct: 'A',
    statement: `A toboggan sled is traveling at 2.0 m/s across the snow. The sled and its riders have a combined mass of 120 kg. Another child ($$m_{child} = 40$$ kg) headed in the opposite direction jumps on the sled from the front. She has a speed of 5.0 m/s immediately before she lands on the sled. What is the new speed of the sled? Neglect any effects of friction.`,
    choices: { A: '0.25 m/s', B: '0.33 m/s', C: '2.75 m/s', D: '3.04 m/s', E: '3.67 m/s' },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'collisions'],
  },
  {
    n: 8, correct: 'C',
    statement: `Riders in a carnival ride stand with their backs against the wall of a circular room of diameter 8.0 m. The room is spinning horizontally about an axis through its center at a rate of 45 rev/min when the floor drops so that it no longer provides any support for the riders. What is the minimum coefficient of static friction between the wall and the rider required so that the rider does not slide down the wall?`,
    choices: { A: '0.0012', B: '0.056', C: '0.11', D: '0.53', E: '8.9' },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'friction', 'normal force'],
  },
  {
    n: 9, correct: 'B',
    statement: `A ball of mass $$m_1$$ travels along the x-axis in the positive direction with an initial speed of $$v_0$$. It collides with a ball of mass $$m_2$$ that is originally at rest. After the collision, the ball of mass $$m_1$$ has velocity $$v_{1x}\\hat x + v_{1y}\\hat y$$ and the ball of mass $$m_2$$ has velocity $$v_{2x}\\hat x + v_{2y}\\hat y$$. Consider the five statements: I) $$0 = m_1v_{1x} + m_1v_{2x}$$; II) $$m_1v_0 = m_1v_{1y} + m_2v_{2y}$$; III) $$0 = m_1v_{1y} + m_2v_{2y}$$; IV) $$m_1v_0 = m_1v_{1x} + m_1v_{1y}$$; V) $$m_1v_0 = m_1v_{1x} + m_2v_{2x}$$. Of these, the system must satisfy`,
    choices: { A: 'I and II', B: 'III and V', C: 'II and V', D: 'III and IV', E: 'I and III' },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'collisions', 'vectors'],
  },
  {
    n: 10, correct: 'B',
    statement: `The following applies to this and the next problem. An experiment consists of pulling a heavy wooden block across a level surface with a spring force meter. The constant force for each try is recorded, as is the acceleration of the block: Force $$F$$ (N): 3.05, 3.45, 4.05, 4.45, 5.05; acceleration $$a$$ (m/s²): 0.095, 0.205, 0.295, 0.405, 0.495. Which is the best value for the mass of the block?`,
    choices: { A: '3 kg', B: '5 kg', C: '10 kg', D: '20 kg', E: '30 kg' },
    figures: [P08(5)], topics: ['Mechanics'], tags: ['data analysis', "newton's laws"],
  },
  {
    n: 11, correct: 'A',
    statement: `(Same force/acceleration data as the previous problem.) Which is the best value for the coefficient of friction between the block and the surface?`,
    choices: { A: '0.05', B: '0.07', C: '0.09', D: '0.5', E: '0.6' },
    figures: [P08(5)], topics: ['Mechanics'], tags: ['data analysis', 'friction'],
  },
  {
    n: 12, correct: 'D',
    statement: `A uniform disk rotates at a fixed angular velocity on an axis through its center normal to the plane of the disk, and has kinetic energy $$E$$. If the same disk rotates at the same angular velocity about an axis on the edge of the disk (still normal to the plane), what is its kinetic energy?`,
    choices: { A: '$$\\tfrac12 E$$', B: '$$\\tfrac32 E$$', C: '$$2E$$', D: '$$3E$$', E: '$$4E$$' },
    figures: [], topics: ['Mechanics'], tags: ['moment of inertia', 'energy conservation', 'rotational motion'],
  },
  {
    n: 13, correct: 'B',
    statement: `A mass is attached to the wall by a spring of constant $$k$$. When the spring is at its natural length, the mass is given a certain initial velocity, resulting in oscillations of amplitude $$A$$. If the spring is replaced by a spring of constant $$2k$$, and the mass is given the same initial velocity, what is the amplitude of the resulting oscillation?`,
    choices: { A: '$$\\tfrac12 A$$', B: '$$\\tfrac{1}{\\sqrt2}A$$', C: '$$\\sqrt2 A$$', D: '$$2A$$', E: '$$4A$$' },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM', 'energy conservation'],
  },
  {
    n: 14, correct: 'B',
    statement: `A spaceborne energy storage device consists of two equal masses connected by a tether and rotating about their center of mass. Additional energy is stored by reeling in the tether; no external forces are applied. Initially the device has kinetic energy $$E$$ and rotates at angular velocity $$\\omega$$. Energy is added until the device rotates at angular velocity $$2\\omega$$. What is the new kinetic energy of the device?`,
    choices: { A: '$$\\sqrt2 E$$', B: '$$2E$$', C: '$$2\\sqrt2 E$$', D: '$$4E$$', E: '$$8E$$' },
    figures: [], topics: ['Mechanics'], tags: ['angular momentum', 'energy conservation', 'rotational motion'],
  },
  {
    n: 15, correct: 'D',
    statement: `A uniform round tabletop of diameter 4.0 m and mass 50.0 kg rests on massless, evenly spaced legs of length 1.0 m and spacing 3.0 m (see figure). A carpenter sits on the edge of the table. What is the maximum mass of the carpenter such that the table remains upright? Assume the force exerted by the carpenter on the table is vertical and at the edge of the table.`,
    choices: { A: '67 kg', B: '75 kg', C: '81 kg', D: '150 kg', E: '350 kg' },
    figures: [P08(7)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium'],
  },
  {
    n: 16, correct: 'E',
    statement: `A massless spring with spring constant $$k$$ is vertically mounted so that the bottom end is firmly attached to the ground, and the top end free. A ball with mass $$m$$ falls vertically down on the top end of the spring, becoming attached, so that the ball oscillates vertically on the spring. What equation describes the acceleration $$a$$ of the ball when it is at height $$y$$ above the original position of the top end of the spring? Let down be negative, and neglect air resistance; $$g$$ is the magnitude of the acceleration of free fall.`,
    choices: { A: '$$a = mv^2/y + g$$', B: '$$a = mv^2/k - g$$', C: '$$a = (k/m)y - g$$', D: '$$a = -(k/m)y + g$$', E: '$$a = -(k/m)y - g$$' },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM', "newton's laws"],
  },
  {
    n: 17, correct: 'E',
    statement: `A mass $$m$$ is resting at equilibrium suspended from a vertical spring of natural length $$L$$ and spring constant $$k$$ inside a box (see figure). The box begins accelerating upward with acceleration $$a$$. How much closer does the equilibrium position of the mass move to the bottom of the box?`,
    choices: { A: '$$(a/g)L$$', B: '$$(g/a)L$$', C: '$$m(g+a)/k$$', D: '$$m(g-a)/k$$', E: '$$ma/k$$' },
    figures: [P08(8)], topics: ['Mechanics'], tags: ['springs', 'non-inertial frames', "newton's laws"],
  },
  {
    n: 18, correct: 'C',
    statement: `A uniform circular ring of radius $$R$$ is fixed in place. A particle is placed on the axis of the ring at a distance much greater than $$R$$ and allowed to fall towards the ring under the influence of the ring's gravity. The particle achieves a maximum speed $$v$$. The ring is replaced with one of the same (linear) mass density but radius $$2R$$, and the experiment is repeated. What is the new maximum speed of the particle?`,
    choices: { A: '$$\\tfrac12 v$$', B: '$$\\tfrac{1}{\\sqrt2}v$$', C: '$$v$$', D: '$$\\sqrt2 v$$', E: '$$2v$$' },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'scaling'],
  },
  {
    n: 19, correct: 'B',
    statement: `A car has an engine which delivers a constant power. It accelerates from rest at time $$t = 0$$, and at $$t = t_0$$ its acceleration is $$a_0$$. What is its acceleration at $$t = 2t_0$$? Ignore energy loss due to friction.`,
    choices: { A: '$$\\tfrac12 a_0$$', B: '$$\\tfrac{1}{\\sqrt2}a_0$$', C: '$$a_0$$', D: '$$\\sqrt2 a_0$$', E: '$$2a_0$$' },
    figures: [], topics: ['Mechanics'], tags: ['power', 'energy conservation', 'dimensional analysis'],
  },
  {
    n: 20, correct: 'D',
    statement: `The Young's modulus, $$E$$, of a material measures how stiff it is. Consider a solid, rectangular steel beam which is anchored horizontally to the wall at one end and allowed to deflect under its own weight. The beam has length $$L$$, vertical thickness $$h$$, width $$w$$, mass density $$\\rho$$, and Young's modulus $$E$$; the acceleration due to gravity is $$g$$. What is the distance through which the other end moves? (Hint: eliminate implausible answers — all choices are dimensionally correct.)`,
    choices: { A: '$$h\\exp(\\rho g L/E)$$', B: '$$2\\rho g h^2/E$$', C: '$$\\sqrt{2Lh}$$', D: '$$\\tfrac32 \\rho g L^4/(Eh^2)$$', E: '$$\\sqrt3\\, EL/(\\rho g h)$$' },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling', 'material properties'],
  },
  {
    n: 21, correct: 'B',
    statement: `Consider a particle at rest which may decay into two (daughter) particles or into three (daughter) particles. Which of the following is true in the two-body case but false in the three-body case? (There are no external forces.)`,
    choices: {
      A: 'The velocity vectors of the daughter particles must lie in a single plane.', B: 'Given the total kinetic energy of the system and the mass of each daughter particle, it is possible to determine the speed of each daughter particle.',
      C: 'Given the speed(s) of all but one daughter particle, it is possible to determine the speed of the remaining particle.', D: 'The total momentum of the daughter particles is zero.', E: 'None of the above.',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation'],
  },
  {
    n: 22, correct: 'E',
    statement: `A bullet of mass $$m_1$$ strikes a pendulum of mass $$m_2$$ suspended from a pivot by a string of length $$L$$ with a horizontal velocity $$v_0$$. The collision is perfectly inelastic and the bullet sticks to the bob. Find the minimum velocity $$v_0$$ such that the bob (with the bullet inside) completes a circular vertical loop.`,
    choices: { A: '$$2\\sqrt{Lg}$$', B: '$$\\sqrt{5Lg}$$', C: '$$(m_1+m_2)2\\sqrt{Lg}/m_1$$', D: '$$(m_1-m_2)\\sqrt{Lg}/m_2$$', E: '$$(m_1+m_2)\\sqrt{5Lg}/m_1$$' },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation', 'circular motion', 'collisions'],
  },
  {
    n: 23, correct: 'C',
    statement: `Consider two uniform spherical planets of equal density but unequal radius. Which of the following quantities is the same for both planets?`,
    choices: {
      A: "The escape velocity from the planet's surface.", B: 'The acceleration due to gravity at the surface.',
      C: 'The orbital period of a satellite in a circular orbit just above the surface.', D: 'The orbital period of a satellite in a circular orbit at a given distance from the center.', E: 'None of the above.',
    },
    figures: [], topics: ['Mechanics'], tags: ['gravitation', 'scaling', 'orbital mechanics'],
  },
  {
    n: 24, correct: 'A',
    statement: `A ball is launched upward from the ground at an initial vertical speed of $$v_0$$ and begins bouncing vertically. Every time it rebounds, it loses a proportion of the magnitude of its velocity due to inelastic collisions, such that if the speed just before hitting the ground is $$v$$, the speed just after is $$rv$$, where $$r < 1$$ is constant. Calculate the total length of time the ball remains bouncing (contact time negligible).`,
    choices: { A: '$$\\tfrac{2v_0}{g}\\cdot\\tfrac{1}{1-r}$$', B: '$$\\tfrac{v_0}{g}\\cdot\\tfrac{r}{1-r}$$', C: '$$\\tfrac{2v_0}{g}\\cdot\\tfrac{1-r}{r}$$', D: '$$\\tfrac{2v_0}{g}\\cdot\\tfrac{1}{1-r^2}$$', E: '$$\\tfrac{2v_0}{g}\\cdot\\tfrac{1}{1+(1-r)^2}$$' },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'energy conservation', 'series/geometric sums'],
  },
  {
    n: 25, correct: 'E',
    statement: `Two satellites are launched at a distance $$R$$ from a planet of negligible radius, both in the tangential direction. The first satellite launches correctly at speed $$v_0$$ and enters a circular orbit. The second satellite is launched at speed $$\\tfrac12 v_0$$. What is the minimum distance between the second satellite and the planet over the course of its orbit?`,
    choices: { A: '$$\\tfrac{1}{\\sqrt2}R$$', B: '$$\\tfrac12 R$$', C: '$$\\tfrac13 R$$', D: '$$\\tfrac14 R$$', E: '$$\\tfrac17 R$$' },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'energy conservation', 'angular momentum'],
  },
]

// 2009 official AAPT F=ma exam.
export const questions2009 = [
  {
    n: 1, correct: 'B',
    statement: `A 0.3 kg apple falls from rest through a height of 40 cm onto a flat surface. Upon impact, the apple comes to rest in 0.1 s, and 4 cm² of the apple comes into contact with the surface during the impact. What is the average pressure exerted on the apple during the impact? Ignore air resistance.`,
    choices: { A: '67,000 Pa', B: '21,000 Pa', C: '6,700 Pa', D: '210 Pa', E: '67 Pa' },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'pressure', "newton's laws"],
  },
  {
    n: 2, correct: 'D',
    statement: `The following applies to this and the next problem. Three blocks of identical mass are placed on a frictionless table (see figure). The center block is at rest, whereas the other two blocks are moving directly towards it at identical speeds $$v$$. The center block is initially closer to the left block than the right one. All motion takes place along a single horizontal line. Suppose that all collisions are instantaneous and perfectly elastic. After a long time, which of the following is true?`,
    choices: {
      A: 'The center block is moving to the left.', B: 'The center block is moving to the right.',
      C: 'The center block is at rest somewhere to the left of its initial position.', D: 'The center block is at rest at its initial position.',
      E: 'The center block is at rest somewhere to the right of its initial position.',
    },
    figures: [P09(2)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'symmetry'],
  },
  {
    n: 3, correct: 'E',
    statement: `(Same three-block setup as the previous problem.) Suppose, instead, that all collisions are instantaneous and perfectly inelastic. After a long time, which of the following is true?`,
    choices: {
      A: 'The center block is moving to the left.', B: 'The center block is moving to the right.',
      C: 'The center block is at rest somewhere to the left of its initial position.', D: 'The center block is at rest at its initial position.',
      E: 'The center block is at rest somewhere to the right of its initial position.',
    },
    figures: [P09(2)], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation'],
  },
  {
    n: 4, correct: 'A',
    statement: `A spaceman of mass 80 kg is sitting in a spacecraft near the surface of the Earth. The spacecraft is accelerating upward at five times the acceleration due to gravity. What is the force of the spaceman on the spacecraft?`,
    choices: { A: '4800 N', B: '4000 N', C: '3200 N', D: '800 N', E: '400 N' },
    figures: [], topics: ['Mechanics'], tags: ["newton's laws", 'non-inertial frames'],
  },
  {
    n: 5, correct: 'A',
    statement: `Three equal mass satellites A, B, and C are in coplanar orbits around a planet as shown in the figure. The magnitudes of the angular momenta of the satellites as measured about the planet are $$L_A$$, $$L_B$$, and $$L_C$$. Which of the following statements is correct?`,
    choices: {
      A: '$$L_A > L_B > L_C$$', B: '$$L_C > L_B > L_A$$', C: '$$L_B > L_C > L_A$$', D: '$$L_B > L_A > L_C$$',
      E: 'The relationship between the magnitudes is different at various instants in time.',
    },
    figures: [P09(3)], topics: ['Mechanics'], tags: ['angular momentum', 'orbital mechanics', "kepler's laws"],
  },
  {
    n: 6, correct: 'C',
    statement: `An object is thrown with a fixed initial speed $$v_0$$ at various angles $$\\alpha$$ relative to the horizon. At some constant height $$h$$ above the launch point the speed $$v$$ of the object is measured as a function of the initial angle $$\\alpha$$. Which of the following best describes the dependence of $$v$$ on $$\\alpha$$? (Assume height $$h$$ is achieved; no air resistance.)`,
    choices: {
      A: '$$v$$ will increase monotonically with $$\\alpha$$.', B: '$$v$$ will increase to some critical value $$v_{max}$$ and then decrease.',
      C: '$$v$$ will remain constant, independent of $$\\alpha$$.', D: '$$v$$ will decrease to some critical value $$v_{min}$$ and then increase.', E: 'None of the above.',
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'energy conservation'],
  },
  {
    n: 7, correct: 'B',
    statement: `A bird is flying in a straight line initially at 10 m/s. It uniformly increases its speed to 15 m/s while covering a distance of 25 m. What is the magnitude of the acceleration of the bird?`,
    choices: { A: '5.0 m/s²', B: '2.5 m/s²', C: '2.0 m/s²', D: '0.5 m/s²', E: '0.2 m/s²' },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics'],
  },
  {
    n: 8, correct: 'D',
    statement: `The following applies to this and the next problem. A flat disk rotates about an axis perpendicular to the plane of the disk and through the center of the disk with an angular velocity as shown in the graph below. Determine the angular acceleration of the disk when $$t = 2.0$$ s.`,
    choices: { A: '-12 rad/s².', B: '-8 rad/s².', C: '-4 rad/s².', D: '-2 rad/s².', E: '0 rad/s².' },
    figures: [P09(4)], topics: ['Mechanics'], tags: ['graph interpretation', 'rotational motion'],
  },
  {
    n: 9, correct: 'E',
    statement: `(Same angular-velocity-vs-time graph as the previous problem.) Through what net angle does the disk turn during the 3 seconds?`,
    choices: { A: '9 rad.', B: '8 rad.', C: '6 rad.', D: '4 rad.', E: '3 rad.' },
    figures: [P09(4)], topics: ['Mechanics'], tags: ['graph interpretation', 'rotational motion'],
  },
  {
    n: 10, correct: 'C',
    statement: `A person standing on the edge of a fire escape simultaneously launches two apples, one straight up with a speed of 7 m/s and the other straight down at the same speed. How far apart are the two apples 2 seconds after they were thrown, assuming that neither has hit the ground?`,
    choices: { A: '14 m', B: '20 m', C: '28 m', D: '34 m', E: '56 m' },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'projectile motion'],
  },
  {
    n: 11, correct: 'A',
    statement: `A 2.25 kg mass undergoes an acceleration as a function of position, as shown below (a piecewise-linear a-vs-x graph). How much work is done on the mass?`,
    choices: { A: '36 J', B: '22 J', C: '5 J', D: '-17 J', E: '-36 J' },
    figures: [P09(5)], topics: ['Mechanics'], tags: ['graph interpretation', 'energy conservation', 'work-energy theorem'],
  },
  {
    n: 12, correct: 'C',
    statement: `Batman, who has a mass of $$M = 100$$ kg, climbs to the roof of a 30 m building and then lowers one end of a massless rope to his sidekick Robin. Batman then pulls Robin, who has a mass of $$m = 75$$ kg, up the roof of the building. Approximately how much total work has Batman done after Robin is on the roof?`,
    choices: { A: '60 J', B: '$$7\\times10^3$$ J', C: '$$5\\times10^4$$ J', D: '600 J', E: '$$3\\times10^4$$ J' },
    figures: [], topics: ['Mechanics'], tags: ['energy conservation', 'work-energy theorem', 'estimation'],
  },
  {
    n: 13, correct: 'B',
    statement: `Lucy (mass 33.1 kg), Henry (mass 63.7 kg), and Mary (mass 24.3 kg) sit on a lightweight seesaw at evenly spaced 2.74 m intervals (in that order; Henry is between Lucy and Mary) so that the seesaw balances. Who exerts the most torque (in magnitude) on the seesaw? Ignore the mass of the seesaw.`,
    choices: { A: 'Henry', B: 'Lucy', C: 'Mary', D: 'They all exert the same torque.', E: 'There is not enough information to answer the question.' },
    figures: [], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium'],
  },
  {
    n: 14, correct: 'E',
    statement: `A wooden block (mass $$M$$) is hung from a peg by a massless rope (see figure). A speeding bullet (mass $$m$$, initial speed $$v_0$$) collides with the block at time $$t=0$$ and embeds in it. Let $$S$$ be the system consisting of the block and bullet. Which quantities are conserved between $$t=-10$$ s and $$t=+10$$ s?`,
    choices: {
      A: 'The total linear momentum of S.', B: 'The horizontal component of the linear momentum of S.', C: 'The mechanical energy of S.',
      D: 'The angular momentum of S as measured about a perpendicular axis through the peg.', E: 'None of the above are conserved.',
    },
    figures: [P09(6)], topics: ['Mechanics'], tags: ['momentum conservation', 'angular momentum', 'collisions'],
  },
  {
    n: 15, correct: 'C',
    statement: `A 22.0 kg suitcase is dragged in a straight line at a constant speed of 1.10 m/s across a level airport floor. The individual pulls with a $$1.00\\times10^2$$ N force along a handle which makes an upward angle of 30.0 degrees with respect to the horizontal. What is the coefficient of kinetic friction between the suitcase and the floor?`,
    choices: { A: '$$\\mu_k = 0.013$$', B: '$$\\mu_k = 0.394$$', C: '$$\\mu_k = 0.509$$', D: '$$\\mu_k = 0.866$$', E: '$$\\mu_k = 1.055$$' },
    figures: [], topics: ['Mechanics'], tags: ['friction', "newton's laws"],
  },
  {
    n: 16, correct: 'B',
    statement: `Two identical objects of mass $$m$$ are placed at either end of a spring of spring constant $$k$$ and the whole system is placed on a horizontal frictionless surface. At what angular frequency $$\\omega$$ does the system oscillate?`,
    choices: { A: '$$\\sqrt{k/m}$$', B: '$$\\sqrt{2k/m}$$', C: '$$\\sqrt{k/2m}$$', D: '$$2\\sqrt{k/m}$$', E: '$$\\sqrt{k/m}/2$$' },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM', 'reduced mass'],
  },
  {
    n: 17, correct: 'D',
    statement: `You are given a standard kilogram mass and a tuning fork that is calibrated in Hz. You are also provided with a complete collection of laboratory equipment, but none of it is calibrated in SI units, and you do not know the values of any fundamental constants. Which of the following quantities could you measure in SI units?`,
    choices: {
      A: 'The acceleration due to gravity.', B: 'The speed of light in a vacuum.', C: 'The density of room temperature water.',
      D: 'The spring constant of a given spring.', E: 'The air pressure in the room.',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis', 'units'],
  },
  {
    n: 18, correct: 'E',
    statement: `A simple pendulum of length $$L$$ is constructed from a point object of mass $$m$$ suspended by a massless string attached to a fixed pivot point. A small peg is placed a distance $$2L/3$$ directly below the fixed pivot point so that the pendulum swings as shown in the figure. The mass is displaced 5 degrees from vertical and released. How long does it take to return to its starting position?`,
    choices: {
      A: '$$\\pi\\sqrt{L/g}\\left(1+\\sqrt{2/3}\\right)$$', B: '$$\\pi\\sqrt{L/g}\\left(2+2/\\sqrt3\\right)$$', C: '$$\\pi\\sqrt{L/g}\\left(1+1/3\\right)$$',
      D: '$$\\pi\\sqrt{L/g}\\left(1+\\sqrt3\\right)$$', E: '$$\\pi\\sqrt{L/g}\\left(1+1/\\sqrt3\\right)$$',
    },
    figures: [P09(7)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum'],
  },
  {
    n: 19, correct: 'B',
    statement: `A certain football quarterback can throw a football a maximum range of 80 meters on level ground. What is the highest point reached by the football if thrown this maximum range? Ignore air friction.`,
    choices: { A: '10 m', B: '20 m', C: '30 m', D: '40 m', E: '50 m' },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion'],
  },
  {
    n: 20, correct: 'C',
    statement: `Consider a completely inelastic collision between two lumps of space goo. Lump 1 has mass $$m$$ and originally moves directly north with speed $$v_0$$. Lump 2 has mass $$3m$$ and originally moves directly east with speed $$v_0/2$$. What is the final speed of the masses after the collision? Ignore gravity, and assume the two lumps stick together.`,
    choices: { A: '$$7/16\\, v_0$$', B: '$$\\sqrt5/8\\, v_0$$', C: '$$\\sqrt{13}/8\\, v_0$$', D: '$$5/8\\, v_0$$', E: '$$\\sqrt{13/8}\\, v_0$$' },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'collisions', 'vectors'],
  },
  {
    n: 21, correct: 'D',
    statement: `The following applies to this and the next problem. Two stars orbit their common center of mass (see figure). The masses of the two stars are $$3M$$ and $$M$$. The distance between the stars is $$d$$. What is the value of the gravitational potential energy of the two star system?`,
    choices: { A: '$$-GM^2/d$$', B: '$$3GM^2/d$$', C: '$$-GM^2/d^2$$', D: '$$-3GM^2/d$$', E: '$$-3GM^2/d^2$$' },
    figures: [P09(8)], topics: ['Mechanics'], tags: ['gravitation', 'energy conservation'],
  },
  {
    n: 22, correct: 'A',
    statement: `(Same two-star system as the previous problem.) Determine the period of orbit for the star of mass $$3M$$.`,
    choices: { A: '$$\\pi\\sqrt{d^3/(GM)}$$', B: '$$\\tfrac{3\\pi}{4}\\sqrt{d^3/(GM)}$$', C: '$$\\pi\\sqrt{d^3/(3GM)}$$', D: '$$2\\pi\\sqrt{d^3/(GM)}$$', E: '$$\\tfrac{\\pi}{4}\\sqrt{d^3/(GM)}$$' },
    figures: [P09(8)], topics: ['Mechanics'], tags: ['orbital mechanics', 'gravitation', "kepler's laws"],
  },
  {
    n: 23, correct: 'D',
    statement: `A mass is attached to an ideal spring. At time $$t=0$$ the spring is at its natural length and the mass is given an initial velocity; the period of the ensuing (one-dimensional) simple harmonic motion is $$T$$. At what time is the power delivered to the mass by the spring first a maximum?`,
    choices: { A: '$$t=0$$', B: '$$t=T/8$$', C: '$$t=T/4$$', D: '$$t=3T/8$$', E: '$$t=T/2$$' },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM', 'power'],
  },
  {
    n: 24, correct: 'C',
    statement: `A uniform rectangular wood block of mass $$M$$, with length $$b$$ and height $$a$$, rests on an incline (see figure). The incline and the wood block have a coefficient of static friction, $$\\mu_s$$. The incline is moved upwards from an angle of zero through an angle $$\\theta$$. At some critical angle the block will either tip over or slip. Determine the relationship between $$a$$, $$b$$, and $$\\mu_s$$ such that the block will tip over (and not slip) at the critical angle. ($$a \\neq b$$.)`,
    choices: { A: '$$\\mu_s > a/b$$', B: '$$\\mu_s > 1 - a/b$$', C: '$$\\mu_s > b/a$$', D: '$$\\mu_s < a/b$$', E: '$$\\mu_s < b/a - 1$$' },
    figures: [P09(9)], topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'friction'],
  },
  {
    n: 25, correct: 'D',
    statement: `Two discs are mounted on thin, lightweight vertical rods through their centers, normal to the discs (see figure), and can pivot frictionlessly on the rods. The discs have identical thickness and are made of the same material, but have differing radii $$r_1$$ and $$r_2$$. They are given angular velocities of magnitudes $$\\omega_1$$ and $$\\omega_2$$ and brought into contact at their edges. After the discs interact via friction, both come exactly to a halt. Which of the following must hold?`,
    choices: { A: '$$\\omega_1^2 r_1 = \\omega_2^2 r_2$$', B: '$$\\omega_1 r_1 = \\omega_2 r_2$$', C: '$$\\omega_1 r_1^2 = \\omega_2 r_2^2$$', D: '$$\\omega_1 r_1^3 = \\omega_2 r_2^3$$', E: '$$\\omega_1 r_1^4 = \\omega_2 r_2^4$$' },
    figures: [P09(9)], topics: ['Mechanics'], tags: ['angular momentum', 'rotational dynamics', 'friction'],
  },
]
