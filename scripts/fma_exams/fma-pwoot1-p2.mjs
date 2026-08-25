// Digitized PhysicsWOOT 1 Practice F=ma Exam 2. Source: AoPS crypt collection 175, document 9208.
//
// Notes on this exam:
// - Q5's five answer choices are a single scanned IMAGE (five force-vs-time
//   graphs labelled a)-e)), not text. The image is served as .jpg, so it uses
//   the FIG_JPG helper. The choices here are placeholders pointing the student
//   at the labelled graphs in that image.
// - Q17's five options are drawn inside the statement's own asy figure and
//   labelled (a)-(e), so choices are the bare labels.
// - Q5 and Q12 have no \boxed{} in the official solution; the letter comes from
//   the concluding sentence in each case (see the // why: comments).
// - Q20's solution text says "we multiply m/I by 4" where the scaling actually
//   divides m/I by 4; the boxed result (1/2 omega_p) is nevertheless correct.

const FIG = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-pwoot1-p2/fma-pwoot1-p2-${n}.png`

const FIG_JPG = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-pwoot1-p2/fma-pwoot1-p2-${n}.jpg`

export const examId = 'fma-pwoot1-p2'
export const questions = [
  {
    n: 1, correct: 'C',
    statement: `Dick and Jane had a car race along a straight track. Dick accelerated with constant acceleration $$a$$ for the entire race. Jane accelerated at $$a$$ for the first half of the race and $$-a$$ for the second half, stopping at the finish line. What was the ratio of Jane's finishing time to Dick's finishing time?`,
    choices: {
      A: '$$\\dfrac54$$',
      B: '$$\\dfrac43$$',
      C: '$$\\sqrt{2}$$',
      D: '$$\\dfrac32$$',
      E: '$$2$$',
    },
    topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `Let the length of the race be $$d$$. Then the time Dick took to complete the race obeys $$\\dfrac12 a t_D^2 = d.$$ Jane completed the first half the race in a time $$\\dfrac{t_J}{2}$$ because both halves of the race took the same time for Jane. So $$\\dfrac12 a \\left(\\dfrac{t_J}{2}\\right)^2 = \\dfrac{d}{2}.$$ From this we have $$\\dfrac12 a \\left(\\dfrac{t_J}{2}\\right)^2 = \\dfrac14 a t_D^2.$$ Solving for $$\\dfrac{t_J}{t_D}$$ gives $$\\dfrac{t_J}{t_D} = \\sqrt{2}.$$`,
  },
  {
    n: 2, correct: 'D',
    statement: `Two balls are dropped from the top of a tower, one 0.1 seconds after the other. Air resistance can be neglected as the balls fall. Then:`,
    choices: {
      A: 'the distance between the balls stays the same as they fall and they hit the ground 0.1 seconds apart.',
      B: 'the distance between the balls stays the same as they fall and they hit the ground less than 0.1 seconds apart.',
      C: 'the distance between the balls stays the same as they fall and they hit the ground more than 0.1 seconds apart.',
      D: 'the distance between the balls increases as they fall and they hit the ground 0.1 seconds apart.',
      E: 'the distance between the balls increases as they fall and they hit the ground more than 0.1 seconds apart.',
    },
    topics: ['Mechanics'], tags: ['1d kinematics', 'free fall'],
    solution: `The balls have the same acceleration, so the time from release to impact with the ground is the same for them, and they hit the ground 0.1 seconds apart. The balls are going faster when they are near the ground, so in 0.1 seconds they travel further, so the distance between them must be larger since they remain separated by the same amount of time. This is answer (d).`,
  },
  {
    n: 3, correct: 'C',
    statement: `An airplane flies horizontally at a constant velocity. You are on the ground and hear its engine noise and look upwards when the noise is directly overhead. However, you then have to turn your eyes through an angle of $$35^\\circ$$ to look at the airplane. At what Mach number (fraction of the speed of sound) is the airplane flying? Ignore any variation of atmospheric conditions with altitude; ignore the curvature of the Earth.`,
    choices: {
      A: '$$0.57$$',
      B: '$$0.61$$',
      C: '$$0.70$$',
      D: '$$1.43$$',
      E: 'The Mach number cannot be determined from the given information.',
    },
    solutionFigures: [FIG('q03-s1')],
    topics: ['Mechanics'], tags: ['relative motion', 'waves/sound', 'geometry'],
    solution: `The discrepancy between where you see the airplane and where you hear it is, of course, caused by the difference between the speed of light and the speed of sound. The former is essentially infinite, so you see the airplane at its true position, but you only hear the airplane some time after it emits the sound.

At the moment the airplane is directly overhead, it emits engine noise, which travels downward to you at the speed of sound $$v_s$$ in some time $$t$$. Meanwhile the airplane continues to fly horizontally at the Mach number $$M$$ times the speed of sound. Drawing a diagram:

Thus we simply have $$M = \\tan \\theta$$, which in this case is $$0.70$$.`,
  },
  {
    n: 4, correct: 'C', // why: boxed holds the phrase "angular velocity", not a letter; choice (c) (time to move through an additional degree) is exactly an angular velocity, and the solution explicitly rules out (a) and (b).
    statement: `In the previous problem, what additional information would allow you to determine the altitude of the airplane? Assume you know the speed of sound at current atmospheric conditions, but no engineering data about the airplane.`,
    choices: {
      A: 'The wingspan of the airplane (in degrees) as seen by you.',
      B: 'The intensity of the engine noise as heard by you when the noise is directly overhead.',
      C: 'The amount of time needed for the airplane to move through an additional degree as seen by you.',
      D: 'None of the above pieces of information would allow you to determine the altitude of the airplane.',
      E: 'No additional information is required; it is already possible to determine the altitude of the airplane.',
    },
    topics: ['Mechanics'], tags: ['dimensional analysis', 'relative motion', 'estimation'],
    solution: `Dimensional analysis shows that the given information is not sufficient to find the altitude of the airplane; we cannot find a length from only a speed and dimensionless quantities. The same argument rules out using the angular wingspan or sound intensity alone; we could use these quantities only if we had other measurements of the airplane such as the wingspan in meters or the total sound power emitted by the engines. However, an angular velocity can be combined with a speed to obtain a length, and it's easy to work out how to do so in this specific case.`,
  },
  {
    n: 5, correct: 'A', // why: no boxed in the solution; it computes a maximum of 0.49 N and concludes "as depicted in the first choice", i.e. graph a).
    statement: `A bead slides on a frictionless U-shaped track in the absence of gravity.

Which of the following graphs could correctly show the force on the bead in the $$x$$ direction as a function of time?`,
    choices: {
      A: 'Graph a) in the figure',
      B: 'Graph b) in the figure',
      C: 'Graph c) in the figure',
      D: 'Graph d) in the figure',
      E: 'Graph e) in the figure',
    },
    figures: [FIG('q05-q1'), FIG_JPG('q05-c1')],
    topics: ['Mechanics'], tags: ['circular motion', 'graph interpretation', 'free-body diagrams'],
    solution: `The force on the bead is certainly zero while it is on the straight segment of track. On the semicircular segment, the magnitude of the force is constant, but its direction rotates from $$-y$$ to $$+y$$ at a constant rate; thus its $$x$$-component should vary sinusoidally from zero to a maximum back to zero. This is depicted in the first two choices.

All choices show the bead moving along the semicircular segment in $$1 \\; \\mathrm{s}$$, so its angular velocity is $$\\omega = \\frac{\\pi}{1 \\; \\mathrm{s}}$$ and the centripetal force has magnitude

$$F = m \\omega^2 r = (0.25 \\; \\mathrm{kg}) \\left(\\frac{\\pi}{1 \\; \\mathrm{s}}\\right)^2 (0.2 \\; \\mathrm{m}) = 0.49 \\; \\mathrm{N}$$

This should be the maximum value of the $$x$$ component of the force, as depicted in the first choice.`,
  },
  {
    n: 6, correct: 'B',
    statement: `A spherical planet spins about its north-south axis at angular velocity $$\\omega.$$ The acceleration of a point on the equator is $$a$$. What is the acceleration of a point at a latitude of 45 degrees?`,
    choices: {
      A: '$$\\dfrac12 a$$',
      B: '$$\\dfrac{\\sqrt{2}}{2} a$$',
      C: '$$a$$',
      D: '$$\\sqrt{2} a$$',
      E: '$$2a$$',
    },
    topics: ['Mechanics'], tags: ['circular motion', 'rotational motion'],
    solution: `Any point on the planet surface undergoes uniform circular motion. All points have the same angular velocity $$\\omega,$$ and the acceleration of an object in uniform circular motion is $$a = \\omega^2 r.$$ The acceleration is therefore proportional to $$r$$, the distance from the axis of the planet's rotation (not the distance from the center of the planet). At $$45^\\circ$$, this distance is $$R \\cos(45^\\circ) = \\dfrac{\\sqrt{2}}{2},$$ so the acceleration of the point at $$45^\\circ$$ latitude is smaller than that of the point on the equator by a factor $$\\dfrac{\\sqrt{2}}{2},$$ so the answer is (b).`,
  },
  {
    n: 7, correct: 'B',
    statement: `A see-saw with a fulcrum in the middle is perfectly balanced, with its center of mass over the fulcrum. A floating helium balloon is tied to the left-hand side of the see-saw.

Then the center of mass of the see-saw / balloon system:`,
    choices: {
      A: 'is left of the fulcrum and the left side of the see-saw tips down',
      B: 'is left of the fulcrum and the right side of the see-saw tips down',
      C: 'is at the fulcrum and the see-saw stays balanced',
      D: 'is to the right of the fulcrum and the right side of the see-saw tips down',
      E: 'is to the right of the fulcrum and the left side of the see-saw tips down',
    },
    figures: [FIG('q07-q1')],
    topics: ['Mechanics'], tags: ['buoyancy', 'statics/equilibrium', 'center of mass', 'torque'],
    solution: `The balloon has mass and that mass is left of the fulcrum, so the center of mass is moved to the left of the fulcrum. There is a buoyant force on the balloon, so the balloon pulls upward on the left side of the see-saw. So the left side goes up and the right side goes down. This is (b). The normal rule that a see-saw tips down on whichever side its center of mass is on does not apply here because that rule doesn't account for the buoyant force.`,
  },
  {
    n: 8, correct: 'D',
    statement: `A ball is thrown through the air. Jane is able to observe only its shadow on a wall, telling her the vertical position of the ball. She calculates the kinetic energy of the ball to be $$T$$ assuming there is no horizontal motion. In fact, the ball was moving at an angle $$\\theta$$ to the horizontal. What is the kinetic energy of the ball?`,
    choices: {
      A: '$$T \\cot\\theta$$',
      B: '$$\\dfrac{T}{\\cos\\theta}$$',
      C: '$$\\dfrac{T}{\\sin\\theta}$$',
      D: '$$\\dfrac{T}{\\sin^2\\theta}$$',
      E: '$$\\dfrac{T}{\\cos^2\\theta}$$',
    },
    topics: ['Mechanics'], tags: ['energy conservation', 'vectors', 'projectile motion'],
    solution: `If the speed of the ball is $$v,$$ the its component of velocity in the vertical direction is $$v_y = v\\sin\\theta.$$ This is what Jane measures. So she calculated $$T = \\dfrac12 mv_y^2.$$ The real kinetic energy is $$\\dfrac12 m v^2 = \\dfrac12 m \\left(\\dfrac{v_y}{\\sin\\theta}\\right)^2 = \\dfrac{T}{\\sin^2\\theta}.$$`,
  },
  {
    n: 9, correct: 'D',
    statement: `A rod of length $$l$$ is attached to the ground at one end via a frictionless pivot. The rod is held at an angle $$\\theta$$ from the vertical and released. It crashes into the ground after a time $$\\tau$$. If the experiment is repeated with a rod of the same mass per unit length and length $$L,$$ the time for it to crash into the ground will be`,
    choices: {
      A: '$$\\tau$$',
      B: '$$\\tau \\dfrac{l}{L}$$',
      C: '$$\\tau \\dfrac{L}{l}$$',
      D: '$$\\tau \\sqrt{\\dfrac{L}{l}}$$',
      E: '$$\\tau \\left( \\dfrac{L}{l} \\right)^2$$',
    },
    topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling', 'rotational dynamics'],
    solution: `For a pure dimensional analysis solution, the combination of $$g$$ and $$l$$ that has dimensions of time is $$\\sqrt{\\dfrac{l}{g}}.$$ Because $$g$$ is the same for each rod, the time is $$\\tau \\sqrt{\\dfrac{L}{l}}.$$

For a solution in mechanics, the torque on a rod of length $$l$$ is $$mg \\dfrac{l}{2}\\sin\\theta.$$ Its moment of inertia is $$\\dfrac13 ml^2,$$ so its equation of motion is $$\\ddot{\\theta} = \\dfrac{3g\\sin\\theta}{2l}$$. If we replace $$l$$ with $$L$$, then to recover the same equation of motion we would need to scale time longer by a factor of $$\\sqrt{\\dfrac{L}{l}},$$ so that in taking two time derivatives on the left hand side we again divide by a factor $$\\dfrac{L}{l}.$$ This gives us the same answer as the dimensional analysis solution.`,
  },
  {
    n: 10, correct: 'C',
    statement: `In the previous problem, suppose the maximum force exerted by the pivot on the rod of length $$l$$ was $$F$$. Then the maximum force exerted by the pivot on the rod of length $$L$$ is`,
    choices: {
      A: '$$F$$',
      B: '$$F \\dfrac{l}{L}$$',
      C: '$$F \\dfrac{L}{l}$$',
      D: '$$F \\sqrt{\\dfrac{L}{l}}$$',
      E: 'the pivot does not exert force on the rod in these scenarios',
    },
    topics: ['Mechanics'], tags: ['dimensional analysis', 'scaling', 'rotational dynamics'],
    solution: `The only way to make a force from the variables $$m, g,$$ and $$l$$ is $$mg.$$ So the force is proportional to mass, which is proportional to length, so $$F\\propto l$$ and the answer is $$F \\dfrac{L}{l}.$$`,
  },
  {
    n: 11, correct: 'C',
    statement: `A U-shaped tube has a connector between its two sides. There are massless, movable dividers in the middle of the connector and at the bottom of the tube. The dividers are initially held stationary. Water is poured in the left side of the tube and oil is poured in the right side. Water is more dense than oil. The heights of the water and oil columns are such that the pressure is equalized between the water and oil at the bottom divider.

Then the dividers are then allowed to slide left or right slowly. The dividers settle into a final position such that`,
    choices: {
      A: 'neither divider has moved',
      B: 'the top divider has moved left and the bottom divider has not moved',
      C: 'the top divider has moved left and the bottom divider has moved right',
      D: 'the top divider has moved right and the bottom divider has not moved',
      E: 'the top divider has moved right and the bottom divider has moved left',
    },
    figures: [FIG('q11-q1')],
    topics: ['Mechanics'], tags: ['fluid statics', 'pressure', 'statics/equilibrium'],
    solution: `Before the dividers are released, the pressure is the same in the oil and water at the bottom divider. Because the water is more dense than oil, there is a greater pressure change in the water from the bottom divider to the top divider. This means the pressure is lower in the water at the top divider. When the dividers are released, the higher pressure in the oil pushes the divider to the left.

This raises the water level on the left, which increases the pressure at the bottom of the tube in the water. This means the bottom divider gets pushed right by the higher pressure in the water. The answer is (c).`,
  },
  {
    n: 12, correct: 'A', // why: no boxed in the solution; its concluding sentence states the mass-m block has 5 of the 6 units of energy, "so its energy is 5/6 S", which is choice (a).
    statement: `A massless spring is compressed between two blocks of mass $$m$$ and $$5m$$. The blocks are initially at rest, then the spring is released. If the spring releases energy $$S$$ to be shared between the two blocks, what is the maximum kinetic energy of the block of mass $$m$$? The only forces on the blocks are from the spring.`,
    choices: {
      A: '$$\\dfrac56 S$$',
      B: '$$\\dfrac45 S$$',
      C: '$$\\dfrac12 S$$',
      D: '$$\\dfrac15 S$$',
      E: '$$\\dfrac16 S$$',
    },
    topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation', 'springs'],
    solution: `By momentum conservation, the masses have equal magnitude of momentum. We can use the formula $$KE = \\dfrac{p^2}{2m}$$ to see that the energy of each block is inversely proportional to its mass. So if the block of mass $$m$$ has one unit of energy, the block of mass $$5m$$ has $$\\dfrac15$$ a unit of energy. Or, if the block of mass $$m$$ has 5 units of energy, the block of mass $$5m$$ has 1 unit of energy. Then the block of mass $$m$$ has 5 of the 6 units of energy, so its energy is $$\\dfrac56 S.$$`,
  },
  {
    n: 13, correct: 'E',
    statement: `A rod with uniform density, total mass $$m$$, and length $$l$$ is pivoted about its center. The rod is horizontal and sits of a frictionless table. A spring of spring constant $$k$$ is attached to the left side of the rod, and a second spring with the same spring constant is attached to the right side of the rod. What is the angular frequency of small-amplitude oscillations of the rod?`,
    choices: {
      A: '$$\\sqrt{\\dfrac{k}{m}}$$',
      B: '$$\\sqrt{\\dfrac{3k}{2m}}$$',
      C: '$$\\sqrt{\\dfrac{2k}{m}}$$',
      D: '$$\\sqrt{\\dfrac{3k}{m}}$$',
      E: '$$\\sqrt{\\dfrac{6k}{m}}$$',
    },
    figures: [FIG('q13-q1')],
    topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'moment of inertia', 'torque'],
    solution: `Suppose the rod is rotated an angle $$\\theta$$ from its equilibrium. Then the springs have some small horizontal component, but this is not first-order in $$\\theta$$ and can be ignored. The torque from each spring has magnitude $$k \\dfrac{l}{2} \\theta \\cdot \\dfrac{l}{2},$$ so the total torque has magnitude $$\\dfrac{k l^2 \\theta}{2}$$. The moment of inertia is $$\\dfrac{1}{12} ml^2,$$ so angular frequency is $$\\omega = \\sqrt{\\dfrac{kl^2/2}{(1/12) ml^2}} = \\sqrt{\\dfrac{6k}{m}}.$$`,
  },
  {
    n: 14, correct: 'C',
    statement: `Local gravitational acceleration at the surface of a star is $$g$$. The star undergoes gravitational collapse and its radius decreases by a factor of 10 and its mass decreases by a factor of 2. What the new gravitational acceleration at the surface of the star? You may assume the star is spherically-symmetric before and after the collapse.`,
    choices: {
      A: '$$\\dfrac{g}{2}$$',
      B: '$$20g$$',
      C: '$$50g$$',
      D: '$$200g$$',
      E: '$$2000g$$',
    },
    topics: ['Mechanics'], tags: ['gravitation', 'scaling'],
    solution: `Using the shell theorem, Newton's second law, and Newton's gravitational law, the acceleration on the surface of a spherically-symmetric mass distribution of radius $$r$$ is $$\\dfrac{GM}{r^2}.$$ In this problem $$M$$ decreases by a factor of 2, decreasing the acceleration by the same factor. $$r$$ decreases by a factor of 10, increasing the acceleration by a factor of $$10^2 = 100.$$ Over all, the acceleration increases by a factor of $$\\dfrac12 \\cdot 100 = 50.$$`,
  },
  {
    n: 15, correct: 'E',
    statement: `A rod of mass $$m$$ and length $$l$$ is hung on one end to a linear railing where it is free to slide without friction and to rotate about its point of contact with the railing.

The rod is held at a small angle from the vertical and is in the plane of the railing and gravity. The rod is then released. What is the angular frequency of oscillations of the rod?`,
    choices: {
      A: '$$\\sqrt{\\dfrac{g}{l}}$$',
      B: '$$\\sqrt{\\dfrac{3g}{2l}}$$',
      C: '$$\\sqrt{\\dfrac{2g}{l}}$$',
      D: '$$\\sqrt{\\dfrac{3g}{l}}$$',
      E: '$$\\sqrt{\\dfrac{6g}{l}}$$',
    },
    figures: [FIG('q15-q1')],
    topics: ['Mechanics'], tags: ['oscillations/SHM', 'center of mass', 'moment of inertia', 'energy conservation'],
    solution: `There are no forces in the horizontal direction, so the rod's center of mass in that direction doesn't move. When the rod is at an angle $$\\theta,$$ the height of its center of mass is $$-\\dfrac{l}{2} \\cos\\theta$$ above the railing. For small $$\\theta,$$ this makes the potential energy $$\\dfrac{lmg}{4}\\theta^2$$.

Next we need to find the kinetic energy of the rod. For small displacements, we can ignore the kinetic energy related to vertical motion because there is no first-order vertical velocity in the vertical direction. The moment of inertia of the rod about its center is $$\\dfrac{1}{12} ml^2,$$ so the kinetic energy is $$\\dfrac{1}{24} m l^2 \\dot{\\theta}^2.$$ The angular frequency is then $$\\sqrt{\\dfrac{lmg/4}{ml^2/24}} = \\sqrt{\\dfrac{6g}{l}}.$$`,
  },
  {
    n: 16, correct: 'A',
    statement: `A force to the left is applied to the top right corner of a square. A second force angled 45 degrees right of vertical is applied to the bottom left corner.

Where can a force be applied so that the square is in equilibrium, regardless of the magnitude of the other two forces? Ignore gravity in this problem.`,
    choices: {
      A: 'At the top right corner of the square',
      B: 'At the top left corner of the square',
      C: 'At the bottom right corner of the square',
      D: 'At the bottom left corner of the square',
      E: 'This is not possible at any corner of the square.',
    },
    figures: [FIG('q16-q1')],
    topics: ['Mechanics'], tags: ['statics/equilibrium', 'torque', 'vectors'],
    solution: `Neither of the two described forces exert a torque about the top right corner of the square. So we can apply a force to the top right corner that is equal to the negative of the sum of the other two forces. Then the sum of the forces will be zero and the torque about the top right corner will be zero, so the square will be in equilibrium.

If we apply a force at any other corner, that force must point directly towards the top right corner for its torque about that corner to be zero. If the force is applied to the top left or bottom right, we cannot cancel any net horizontal force from the first two forces. If the force is applied to the bottom left, we cannot cancel torque from the force on the top left about the bottom left. So at no other corner is it always possible to exert a force such that the square is in equilibrium. The answer is (a).`,
  },
  {
    n: 17, correct: 'A',
    statement: `A massive rope of uniform mass per unit length connects two masses, with $$m_A < m_B.$$ The rope is taut and spins in deep space so that both masses move in circles. Which plot shows the tension in the rope as a function of $$x,$$ the distance along the rope from $$A$$?`,
    choices: { A: '(a)', B: '(b)', C: '(c)', D: '(d)', E: '(e)' },
    figures: [FIG('q17-q1')],
    topics: ['Mechanics'], tags: ['circular motion', 'tension', 'graph interpretation', 'center of mass'],
    solution: `Because the rope is massive, each piece of the rope experiences a net force. This means the tension changes along the rope. The rope rotates around its center of mass. The further from the center of mass, the greater the acceleration, and so the greater the net force on a piece of rope of a given size. So the rate of change of the net force is not constant along the rope. So the options with straight lines are not possible. At the center of mass there is no acceleration and therefore no change in tension, so the correct plot must be (a) because that plot is flat somewhere between $$A$$ and $$B$$.`,
  },
  {
    n: 18, correct: 'E',
    statement: `A ball of mass $$m$$ is connected to a spring with spring constant $$k$$ and oscillates in simple harmonic motion with amplitude $$A$$ and angular frequency $$\\omega$$. While the ball is oscillating, a high-powered laser pulse suddenly heats the spring, leaving its rest length unaffected but decreasing its spring constant to $$k' < k$$. (Other properties of the spring do not change appreciably in this instant.) What is the change in mechanical energy of the system?`,
    choices: {
      A: '$$0$$',
      B: '$$\\dfrac12 (k\'-k) A^2$$',
      C: '$$\\dfrac14 (k\'-k) A^2$$',
      D: '$$\\dfrac12 m \\dfrac{k\'}{k} \\omega^2 A^2$$',
      E: 'There is not enough information to determine $$\\Delta E.$$',
    },
    topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'energy conservation'],
    solution: `The spring is all the way stretched at the moment the spring constant changes, the spring's potential energy changes. If the spring is at its equilibrium length at the moment the spring constant changes, there is no change in energy. So there is not enough information to answer the question.`,
  },
  {
    n: 19, correct: 'D',
    statement: `A domino of width $$w$$ and height $$h$$ sits on a rug. The domino is a rectangular prism with uniform density. The rug begins to be pulled to the right. The acceleration of the rug begins at 0 and very slowly increases to $$a.$$ What is the minimum $$a$$ so that the domino topples?`,
    choices: {
      A: '$$g\\sqrt{\\dfrac{w}{h}}$$',
      B: '$$g \\arctan\\left(\\dfrac{h}{w}\\right)$$',
      C: '$$g \\arctan\\left(\\dfrac{w}{h}\\right)$$',
      D: '$$g \\dfrac{w}{h}$$',
      E: '$$g \\dfrac{h}{w}$$',
    },
    topics: ['Mechanics'], tags: ['non-inertial frames', 'statics/equilibrium', 'torque', 'center of mass'],
    solution: `In a frame accelerating to the right at $$a$$, the domino feels an effective gravitational acceleration $$a$$ to the left. The domino will topple if the line through the center of the domino and parallel to gravitational acceleration points outside the base of the domino. This occurs when $$\\dfrac{a}{g} > \\dfrac{w}{h}$$. The minimum $$a$$ is $$\\dfrac{gw}{h}.$$`,
  },
  {
    n: 20, correct: 'C',
    statement: `Toy top $$A$$ has an axis of length $$l$$ is spun with angular velocity $$\\omega_s$$. The top is tilted at an angle $$\\theta$$ from the vertical. You may assume $$\\theta$$ is small. The top's axis precesses so that the top of its handle moves in a circle with angular velocity $$\\omega_p$$. Top $$B$$ is a scaled-up version of top $$A$$ with the same proportions, but axis length $$2l$$. If it is spun with the same angular velocity $$\\omega_s,$$ what is its precession rate? You may assume the precession is slow compared to the spin angular velocity.`,
    choices: {
      A: '$$\\dfrac18 \\omega_p$$',
      B: '$$\\dfrac14 \\omega_p$$',
      C: '$$\\dfrac12 \\omega_p$$',
      D: '$$\\dfrac{\\sqrt{2}}{2} \\omega_p$$',
      E: '$$\\omega_p$$',
    },
    topics: ['Mechanics'], tags: ['angular momentum', 'rotational dynamics', 'scaling', 'torque'],
    solution: `The angular momentum vector of the top points along its axis. (This is not perfectly true because the top is precessing, but because the precession is slow, it is nearly true.) The horizontal component of the angular momentum is $$\\sin\\theta \\omega_s L \\approx \\theta \\omega_s I,$$ with $$I$$ the moment of inertia of the top about its axis. This horizontal component goes in a circle with angular frequency $$\\omega_p,$$ so the rate of change of the momentum is $$\\omega_p \\theta \\omega_s I.$$ This is equal to the torque $$c \\theta m g l$$ on the top, where $$c$$ is a number from 0 to 1 indicating how far along the axis the top's center of mass is and $$m$$ is the mass. The precession rate is therefore $$\\omega_p = \\dfrac{c m g l}{\\omega_s I}.$$

When we scale the top up by a factor of 2, we multiply $$l$$ by 2. We multiply $$\\dfrac{m}{I}$$ by 4 because its dimensions are $$L^2,$$ so over all we multiply $$\\omega_p$$ by $$\\dfrac12$$, so the new precession rate is $$\\dfrac12 \\omega_p.$$`,
  },
  {
    n: 21, correct: 'C',
    statement: `A point mass began with zero velocity at $$t=0$$. Its acceleration at time $$t$$ was $$c - bt$$ for $$0<t<\\dfrac{c}{b}.$$ At what time was the power being delivered to the object the greatest?`,
    choices: {
      A: '$$t = 0$$',
      B: '$$t = 0.114 \\dfrac{c}{b}$$',
      C: '$$t = 0.422 \\dfrac{c}{b}$$',
      D: '$$t = 0.95 \\dfrac{c}{b}$$',
      E: '$$t = \\dfrac{c}{b}$$',
    },
    solutionFigures: [FIG('q21-s1')],
    topics: ['Mechanics'], tags: ['power', 'equations of motion', 'graph interpretation'],
    solution: `The power delivered is $$P = Fv = mav.$$ The velocity of the particle is $$ct - \\dfrac12 bt^2,$$ so the power per unit mass is $$(c-bt)(ct - \\dfrac12 bt^2).$$ We can factor this into a cubic in $$t$$ with roots $$\\dfrac{c}{b}, 0,$$ and $$\\dfrac{2c}{b}$$. There power is positive between times 0 and $$\\dfrac{c}{b},$$ and reaches a peak somewhere between those two times. Taking the derivative of the power and setting it to zero shows this time is $$\\dfrac{c(1 - \\sqrt{3}/3)}{b} \\approx 0.422 \\dfrac{c}{b},$$ but for our purposes, a rough sketch of the cubic should convince us the peak is fairly close to $$\\dfrac{c}{2b}.$$

The best answer is $$0.422 \\dfrac{c}{b}.$$`,
  },
  {
    n: 22, correct: 'D',
    statement: `You measure the length of a simple pendulum of length $$l$$ to within $$\\delta l$$ and the amplitude (greatest angular displacement) $$\\theta$$ to within $$\\delta \\theta$$. The mass and gravitational acceleration are known exactly. Assuming $$\\theta \\ll 1,$$ what is your uncertainty $$\\delta E$$ in $$E,$$ the energy of the pendulum? The pendulum's energy at equilibrium is zero.`,
    choices: {
      A: '$$\\sqrt{(\\delta l)^2 + (\\delta \\theta)^2}$$',
      B: '$$mg\\left(\\delta l \\dfrac{\\theta^2}{2} + l \\theta \\;\\delta \\theta\\right)$$',
      C: '$$E \\sqrt{\\left(\\dfrac{\\delta l}{l}\\right)^2 + \\left(\\dfrac{\\delta \\theta}{\\theta}\\right)^2}$$',
      D: '$$mg \\sqrt{\\left(\\dfrac{\\theta^2 \\delta l}{2}\\right)^2 + \\left(l \\theta\\; \\delta \\theta\\right)^2 }$$',
      E: '$$\\delta l + l \\;\\delta \\theta$$',
    },
    topics: ['Mechanics'], tags: ['uncertainty propagation', 'error analysis', 'pendulum', 'energy conservation'],
    solution: `The pendulum's energy is $$E = mg\\dfrac{l\\theta^2}{2}.$$ The uncertainty due to uncertainty in $$l$$ is $$\\delta E_l = \\delta_l \\dfrac{\\mathrm{d}E}{\\mathrm{d}l} = mg\\dfrac{\\theta^2}{2}\\delta l.$$ The uncertainty due to uncertainty in $$\\theta$$ is $$\\delta E_{\\theta} = mgl\\theta\\delta \\theta.$$ The total uncertainty in $$E$$ is $$\\delta E = \\sqrt{(\\delta E_l)^2 + (\\delta E_\\theta)^2}.$$ This gives us choice (d).`,
  },
  {
    n: 23, correct: 'E',
    statement: `Imagine a modified version of Newton's gravitational law in which the force between point particles of mass $$m$$ and $$M$$ was given by $$F = \\dfrac{\\tilde{G}Mm}{r}$$ where $$\\tilde{G}$$ is a gravitational constant applicable to the modified law and the other variables have the same meaning as in the original Newton's gravitational law. Then then for satellites orbiting in circular, low-Earth orbits, the period $$T$$ of an orbit would scale with $$r,$$ the radius of the orbit from the center of Earth as`,
    choices: {
      A: '$$T \\propto r^{1/2}$$',
      B: '$$T \\propto r$$',
      C: '$$T \\propto r^{3/2}$$',
      D: '$$T \\propto r^2$$',
      E: 'The relationship between $$T$$ and $$r$$ would not be a power law.',
    },
    topics: ['Mechanics'], tags: ['gravitation', 'orbital mechanics', 'scaling'],
    solution: `Without the inverse-square law, the shell theorem does not hold, and the gravitational force from the planet is not the same as if all the mass were located at the center. If the orbiting body were far away from the planet, we could treat the planet as nearly a point mass and the scaling law $$T\\propto r$$ would hold, but this law breaks in near-Earth orbit, so the answer is (e).`,
  },
  {
    n: 24, correct: 'C',
    statement: `A see-saw is a beam balanced on a fulcrum at the center of its bottom. A thin see-saw is balanced at any angle of inclination from the horizontal. A see-saw of finite thickness $$t$$ and length $$l$$:`,
    choices: {
      A: 'Is balanced at any $$\\theta$$',
      B: 'Is balanced only at $$\\theta = 0,$$ and this is a stable equilibrium',
      C: 'Is balanced only at $$\\theta = 0,$$ and this is an unstable equilibrium',
      D: 'Is balanced for all $$\\theta < \\arctan\\left(\\dfrac{t}{l}\\right)$$',
      E: 'Is balanced for $$\\theta = 0$$ and for $$\\theta > \\arctan\\left(\\dfrac{t}{l}\\right)$$',
    },
    figures: [FIG('q24-q1')],
    topics: ['Mechanics'], tags: ['statics/equilibrium', 'center of mass', 'stability'],
    solution: `The see-saw is balanced with its center of mass is over the fulcrum. This occurs only for $$\\theta = 0$$. The equilibrium at $$\\theta = 0$$ is unstable because any rotation of the see-saw lowers the center of mass, so the answer is (c).`,
  },
  {
    n: 25, correct: 'D',
    statement: `$$n$$ disks are stacked on top each other. The odd-numbered disks are attached to a plate to the right and the even-numbered disks are attached to a plate to the left. The plates do not support the weight of the disks; all forces between the disks and plates are horizontal. The plates are then pulled apart so that the disks slide past each other. For large $$n$$, how does the force $$F$$ needed to pull the plates apart depend on $$n$$?`,
    choices: {
      A: '$$F\\propto n^0$$',
      B: '$$F \\propto n^{1/2}$$',
      C: '$$F \\propto n$$',
      D: '$$F \\propto n^2$$',
      E: '$$F \\propto n^3$$',
    },
    topics: ['Mechanics'], tags: ['friction', 'scaling', 'statics/equilibrium'],
    solution: `The normal force on the middle disk, which is about the average normal force, scales with $$n$$ because there are about $$n/2$$ disks above it, and the normal force is equal to their weight. So the friction force on a given disk scales with $$n,$$ but the number of disks also scales with $$n,$$ so the total force scales as $$F \\propto n^2.$$`,
  },
]
