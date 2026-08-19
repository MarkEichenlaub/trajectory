// Digitized F=ma 2024 + 2025 exam questions (pilot). Source: AAPT exam + solution
// PDFs already seeded as handouts fma-2024 / fma-2025 (see seed_fma_exams.mjs).
// figure_urls reference full exam PAGE screenshots (uploaded by upload_fma_figures.mjs)
// rather than per-question crops — a deliberate pilot simplification; a question's
// page image may show neighboring questions too.

const P24 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2024/p${n}.png`
const P25 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2025/p${n}.png`

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
