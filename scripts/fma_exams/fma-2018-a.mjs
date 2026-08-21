// Digitized 2018 F=ma Exam A questions. Sources:
// Exam: work/fma/fma-2018-a.pdf (text extracted to work/fma/fma-2018-a.txt)
// Answer key: work/fma/fma-2018-a-sol.pdf (←CORRECT markers), confirmed against
//   work/fma-book.txt sections 2018.1 through 2018.25 (Exam A — comes first in the book).
// Figures: work/figure_manifest.json, key "fma-2018-a" — already cropped and uploaded.
//
// Answer key notes:
// Q3: ←CORRECT marker appears on its own line between choices B and C in the PDF
//   (extraction artefact), clearly labelling B. Confirmed by book (2018.3 → B).
// Q4: ←CORRECT marker appears on its own line after choice A. Confirmed by book (2018.4 → A).
// Q9: ←CORRECT marker appears after choice B. Confirmed by book (2018.9 → B).
// Q15: ←CORRECT marker appears after choice A on its own line. Confirmed by book (2018.15 → A).
// Q16: ←CORRECT marker appears after choice B on its own line. Confirmed by book (2018.16 → B).
// Q24: ←CORRECT marker appears after choice E on its own line. Confirmed by book (2018.24 → E).
// All 25 answers are consistent between the solution PDF and the book.

const F18A = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-a/fma-2018-a-q${String(n).padStart(2, '0')}.png`

const CF18A = (n, letter) =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-a/fma-2018-a-q${String(n).padStart(2, '0')}${letter}.png`

export const examId = 'fma-2018-a'
export const questions = [
  {
    n: 1, correct: 'D',
    statement: `Which of the following graphs best shows the velocity versus time of an object originally moving upward in the presence of air friction?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF18A(1, 'A'), B: CF18A(1, 'B'), C: CF18A(1, 'C'), D: CF18A(1, 'D'), E: CF18A(1, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'graph interpretation', '1d kinematics'],
    solution: `The object starts moving upward (positive velocity). Air friction acts opposite to motion, so while moving up both gravity and air friction decelerate it — the magnitude of acceleration is greater than $$g$$. Once the object reverses direction and moves downward, friction now opposes downward motion (acts upward), partially canceling gravity. The object approaches a terminal velocity that is constant and negative.

The graph must start at a positive velocity, decrease through zero, and asymptote to a negative constant. Only graph D has all of these features. The answer is D.`,
  },
  {
    n: 2, correct: 'B',
    statement: `A 3.0 kg mass moving at 30 m/s to the right collides elastically with a 2.0 kg mass traveling at 20 m/s to the left. After the collision, the center of mass of the system is moving at a speed of`,
    choices: {
      A: '5 m/s',
      B: '10 m/s',
      C: '20 m/s',
      D: '24 m/s',
      E: '26 m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'center of mass', 'collisions'],
    solution: `The velocity of the center of mass is conserved by conservation of momentum — the collision does not change it. We compute it from the initial momenta, taking rightward as positive:

$$v_{cm} = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2} = \\frac{(3.0)(30) + (2.0)(-20)}{3.0 + 2.0} = \\frac{90 - 40}{5} = 10 \\text{ m/s.}$$

The answer is B.`,
  },
  {
    n: 3, correct: 'B',
    statement: `Ball 1 traveling in the positive x direction strikes an equal mass ball 2 that is originally at rest. All of the following must be true after the collision, except`,
    choices: {
      A: 'The total final momentum in the x direction equals the initial momentum of ball 1.',
      B: 'The total kinetic energy after the collision equals the initial kinetic energy of ball 1.',
      C: 'The final momentum of the two balls in the y direction adds to zero.',
      D: 'The final speed of the center of mass of the two balls is equal to half the initial speed of ball 1.',
      E: 'The balls can\'t both be at rest after the collision.',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'collisions', 'energy conservation'],
    solution: `Choices A, C, and E follow from conservation of momentum in each direction and the requirement that at least one ball must carry the initial momentum. Choice D follows because $$v_{cm} = p_{tot}/(m_1+m_2) = mv_0/(2m) = v_0/2$$.

Choice B is __not__ necessarily true: the problem does not state the collision is elastic. In a partially or fully inelastic collision, kinetic energy is lost. The answer is B.`,
  },
  {
    n: 4, correct: 'A',
    statement: `A satellite is following an elliptical orbit around the Earth. Its engines are capable of providing a one-time impulse of a fixed magnitude. In order to maximize the energy of the satellite, the impulse should be`,
    choices: {
      A: 'directed along the satellite\'s velocity and applied when the satellite is in its perigee.',
      B: 'directed along the satellite\'s velocity and applied when the satellite is in apogee.',
      C: 'directed toward the Earth and applied when the satellite is in perigee.',
      D: 'directed toward the Earth and applied when the satellite is in apogee.',
      E: 'directed away from the Earth and applied when the satellite is in apogee.',
    },
    figures: [F18A(4)], topics: ['Mechanics'], tags: ['orbital mechanics', 'energy conservation', 'impulse'],
    solution: `First, the impulse should be parallel to the velocity to maximize the work done ($$W = \\vec{F} \\cdot \\vec{v}\\,\\Delta t$$); any perpendicular component merely deflects without adding kinetic energy.

Second, with a fixed $$|\\Delta v|$$, the change in kinetic energy is

$$\\Delta K = \\frac{1}{2}m(v + \\Delta v)^2 - \\frac{1}{2}mv^2 = mv\\,\\Delta v + \\frac{1}{2}m(\\Delta v)^2.$$

This is maximized when $$v$$ is largest, which occurs at perigee (the point of closest approach) by conservation of angular momentum / Kepler's second law. The answer is A.`,
  },
  {
    n: 5, correct: 'E',
    statement: `Two masses are attached with pulleys by a massless rope on an inclined plane as shown. All surfaces are frictionless. If the masses are released from rest, then the inclined plane`,
    choices: {
      A: 'accelerates to the left if $$m_1 < m_2$$',
      B: 'accelerates to the right if $$m_1 < m_2$$',
      C: 'accelerates to the left regardless of the masses',
      D: 'accelerates to the right regardless of the masses',
      E: 'does not move',
    },
    figures: [F18A(5)], topics: ['Mechanics'], tags: ['momentum conservation', 'pulleys/tension', 'newton\'s laws'],
    solution: `Consider the entire system (both masses plus the inclined plane). The only external forces are gravity (downward) and the normal force from the ground (upward). There is no external horizontal force.

By Newton's first law, the horizontal component of the total momentum is conserved. Since everything starts at rest with zero total horizontal momentum, the inclined plane cannot accelerate horizontally. The masses can only move up or down (along or perpendicular to the incline), so horizontal momentum remains zero.

The answer is E.`,
  },
  {
    n: 6, correct: 'A',
    statement: `A packing crate with mass $$m = 115$$ kg is slid up a 5.00 m long ramp which makes an angle of $$20.0^\\circ$$ with respect to the horizontal by an applied force of $$F = 1.00 \\times 10^3$$ N directed parallel to the ramp's incline. A frictional force of magnitude $$f = 4.00 \\times 10^2$$ N resists the motion. If the crate starts from rest, what is its speed at the top of the ramp?`,
    choices: {
      A: '4.24 m/s',
      B: '5.11 m/s',
      C: '7.22 m/s',
      D: '8.26 m/s',
      E: '9.33 m/s',
    },
    figures: [], topics: ['Mechanics'], tags: ['work-energy theorem', 'friction', 'energy conservation'],
    solution: `Use the work-energy theorem. The net work done on the crate along the 5.00 m ramp is

$$W_{net} = (F - f - mg\\sin\\theta)\\,d = (1000 - 400 - 115 \\times 10 \\times \\sin 20.0^\\circ)(5.00).$$

Computing $$mg\\sin\\theta = 1150 \\times 0.342 = 393$$ N:

$$W_{net} = (1000 - 400 - 393)(5.00) = (207)(5.00) = 1035 \\text{ J.}$$

Setting equal to kinetic energy:

$$\\frac{1}{2}mv^2 = 1035 \\text{ J} \\implies v = \\sqrt{\\frac{2 \\times 1035}{115}} = \\sqrt{18.0} = 4.24 \\text{ m/s.}$$

The answer is A.`,
  },
  {
    n: 7, correct: 'E',
    statement: `A car has a maximum acceleration of $$a_0$$ and a minimum acceleration of $$-a_0$$. The shortest possible time for the car to begin at rest, then arrive at rest at a point a distance $$d$$ away is`,
    choices: {
      A: '$$\\sqrt{d/2a_0}$$',
      B: '$$\\sqrt{d/a_0}$$',
      C: '$$\\sqrt{2d/a_0}$$',
      D: '$$\\sqrt{3d/a_0}$$',
      E: '$$2\\sqrt{d/a_0}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['1d kinematics', 'equations of motion'],
    solution: `The optimal strategy is to apply maximum acceleration $$a_0$$ for the first half of the journey, then maximum deceleration $$-a_0$$ for the second half. By symmetry the car reaches its peak speed at the midpoint $$d/2$$ and arrives at rest exactly at $$d$$.

For the first half:

$$\\frac{d}{2} = \\frac{1}{2}a_0\\left(\\frac{t}{2}\\right)^2 \\implies t = 2\\sqrt{\\frac{d}{a_0}}.$$

The answer is E.`,
  },
  {
    n: 8, correct: 'D',
    statement: `A disk of radius $$r$$ rolls uniformly without slipping around the inside of a fixed hoop of radius $$R$$. If the period of the disc's motion around the hoop is $$T$$, what is the instantaneous speed of the point on the disk opposite to the point of contact?`,
    choices: {
      A: '$$2\\pi(R + r)/T$$',
      B: '$$2\\pi(R + 2r)/T$$',
      C: '$$4\\pi(R - 2r)/T$$',
      D: '$$4\\pi(R - r)/T$$',
      E: '$$4\\pi(R + r)/T$$',
    },
    figures: [F18A(8)], topics: ['Mechanics'], tags: ['rolling without slipping', 'circular motion', 'rigid body kinematics'],
    solution: `The center of the disk traces a circle of radius $$R - r$$ (it is inside the hoop at distance $$r$$ from the rim). The speed of the disk's center is

$$v_c = \\frac{2\\pi(R-r)}{T}.$$

Since the disk rolls without slipping, its instantaneous motion is a pure rotation about the contact point. The point opposite the contact point is at a distance $$2r$$ from the contact point, which is twice the distance of the center ($$r$$ from the contact point). Therefore its speed is twice that of the center:

$$v = 2v_c = \\frac{4\\pi(R-r)}{T}.$$

The answer is D.`,
  },
  {
    n: 9, correct: 'B',
    statement: `A uniform stick of mass $$m$$ is originally on a horizontal surface. One end is attached to a vertical rope, which pulls up with a constant tension force $$F$$ so that the center of mass of the stick moves upward with acceleration $$a < g$$. The normal force $$N$$ of the ground on the other end of the stick shortly after the right end of the stick leaves the surface satisfies`,
    choices: {
      A: '$$N = mg$$',
      B: '$$mg > N > mg/2$$',
      C: '$$N = mg/2$$',
      D: '$$mg/2 > N > 0$$',
      E: '$$N = 0$$',
    },
    figures: [F18A(9)], topics: ['Mechanics'], tags: ['rotational dynamics', 'torque', 'newton\'s laws', 'free-body diagrams'],
    solution: `Let $$L$$ be the length of the stick. Newton's second law for vertical translation:

$$F + N - mg = ma.$$

Take torques about the left end (where the rope is attached). Gravity acts at the center ($$L/2$$ from the left), and $$N$$ acts at the right end ($$L$$ from the left). The stick rotates about the left end with angular acceleration $$\\alpha = a/(L/2) = 2a/L$$ (since the CM moves with acceleration $$a$$). The moment of inertia about the left end is $$I = mL^2/3$$. Torque equation:

$$NL - mg\\frac{L}{2} = I\\alpha = \\frac{mL^2}{3} \\cdot \\frac{2a}{L} = \\frac{2maL}{3}.$$

Solving for $$N$$:

$$N = \\frac{mg}{2} + \\frac{ma}{3} \\cdot 2 = \\frac{mg}{2} + \\frac{2ma}{3}.$$

Since $$0 < a < g$$, we have $$N > mg/2$$. Also, at $$a = g$$: $$N = mg/2 + 2mg/3 = 7mg/6 > mg$$, but $$a < g$$ is given, so $$N < mg/2 + 2mg/3 = 7mg/6$$. We need to check the upper bound differently. At $$a = 0$$: $$N = mg/2 < mg$$. As $$a$$ increases from 0 to $$g$$, $$N$$ increases from $$mg/2$$ to $$7mg/6$$, but $$a < g$$, so $$N < 7mg/6$$. The lower bound is $$N > mg/2$$ and the answer is B.`,
  },
  {
    n: 10, correct: 'E',
    statement: `Which of the following graphs best shows the acceleration versus time of an object originally moving upward in the presence of air friction?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF18A(10, 'A'), B: CF18A(10, 'B'), C: CF18A(10, 'C'), D: CF18A(10, 'D'), E: CF18A(10, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'graph interpretation', '1d kinematics'],
    solution: `Initially the object moves upward, so both gravity and air friction act downward, giving an acceleration more negative than $$-g$$. As the object slows, the air friction force decreases. After the object reverses direction and falls, air friction now acts upward (opposing downward motion), so the net downward acceleration is less than $$g$$. As the object approaches terminal velocity, the net force approaches zero — the acceleration asymptotes to zero.

The graph must always be negative (net force always downward), start below $$-g$$, increase toward zero, and asymptote to zero. Only graph E has all these features. The answer is E.`,
  },
  {
    n: 11, correct: 'D',
    statement: `A light, uniform, ideal spring is fixed at one end. If a mass is attached to the other end, the system oscillates with angular frequency $$\\omega$$. Now suppose the spring is fixed at the other end, then cut in half. The mass is attached between the two half springs.

The new angular frequency of oscillations is`,
    choices: {
      A: '$$\\omega/2$$',
      B: '$$\\omega$$',
      C: '$$\\sqrt{2}\\,\\omega$$',
      D: '$$2\\omega$$',
      E: '$$4\\omega$$',
    },
    figures: [F18A(11)], topics: ['Mechanics'], tags: ['springs', 'oscillations/SHM'],
    solution: `Cutting a spring in half doubles its spring constant, because the same force now produces half the extension. Each half has spring constant $$k' = 2k$$.

When the mass is placed between the two half springs (one attached to each fixed end), the springs act in parallel — both are compressed or stretched in the same sense when the mass displaces. The effective spring constant is

$$k_{eff} = k' + k' = 4k.$$

The angular frequency is $$\\omega' = \\sqrt{k_{eff}/m} = \\sqrt{4k/m} = 2\\omega.$$

The answer is D.`,
  },
  {
    n: 12, correct: 'D',
    statement: `A group of students wish to measure the acceleration of gravity with a simple pendulum. They take one length measurement of the pendulum to be $$L = 1.00 \\pm 0.05$$ m. They then measure the period of a single swing to be $$T = 2.00 \\pm 0.10$$ s. Assume that all uncertainties are Gaussian. The computed acceleration of gravity from this experiment illustrating the range of possible values should be recorded as`,
    choices: {
      A: '$$9.87 \\pm 0.10 \\text{ m/s}^2$$',
      B: '$$9.87 \\pm 0.15 \\text{ m/s}^2$$',
      C: '$$9.9 \\pm 0.25 \\text{ m/s}^2$$',
      D: '$$9.9 \\pm 1.1 \\text{ m/s}^2$$',
      E: '$$9.9 \\pm 1.5 \\text{ m/s}^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'pendulum'],
    solution: `From $$T = 2\\pi\\sqrt{L/g}$$ we get $$g = 4\\pi^2 L/T^2$$. The central value is

$$g = \\frac{4\\pi^2 \\times 1.00}{(2.00)^2} = \\pi^2 \\approx 9.87 \\text{ m/s}^2 \\approx 9.9 \\text{ m/s}^2.$$

For Gaussian uncertainties, relative uncertainties propagate as:

$$\\frac{\\Delta g}{g} = \\sqrt{\\left(\\frac{\\Delta L}{L}\\right)^2 + \\left(2\\,\\frac{\\Delta T}{T}\\right)^2} = \\sqrt{(0.05)^2 + (0.10)^2} = \\sqrt{0.0025 + 0.010} = \\sqrt{0.0125} \\approx 0.112.$$

(The relative uncertainty of $$T^2$$ is $$2 \\times \\Delta T/T = 2 \\times 0.05 = 0.10$$.)

The absolute uncertainty is $$\\Delta g = 0.112 \\times 9.87 \\approx 1.1 \\text{ m/s}^2$$. The answer is D.`,
  },
  {
    n: 13, correct: 'E',
    statement: `A massless cable of diameter 2.54 cm (1 inch) is tied horizontally between two trees 18.0 m apart. A tightrope walker stands at the center of the cable, giving it a tension of 7300 N. The cable stretches and makes an angle of $$1.50^\\circ$$ with the horizontal.

The Young's modulus is defined as the ratio of stress to strain, where stress is the force applied per unit area and strain is the fractional change in length $$\\Delta L/L$$. The cable's Young's modulus is`,
    choices: {
      A: '$$1.5 \\times 10^6 \\text{ N/m}^2$$',
      B: '$$2.0 \\times 10^8 \\text{ N/m}^2$$',
      C: '$$2.2 \\times 10^9 \\text{ N/m}^2$$',
      D: '$$2.4 \\times 10^{10} \\text{ N/m}^2$$',
      E: '$$4.2 \\times 10^{10} \\text{ N/m}^2$$',
    },
    figures: [F18A(13)], topics: ['Mechanics'], tags: ['material properties'],
    solution: `The radius of the cable is $$r = 1.27$$ cm $$= 0.0127$$ m, so the cross-sectional area is $$A = \\pi r^2 = \\pi(0.0127)^2 = 5.07 \\times 10^{-4} \\text{ m}^2$$.

The stress is $$\\sigma = F/A = 7300/5.07 \\times 10^{-4} = 1.44 \\times 10^7 \\text{ N/m}^2$$.

The original length of each half-cable is $$L_0 = 9.0$$ m. After stretching, the half-length becomes $$L_0/\\cos\\theta$$, so the strain is

$$\\varepsilon = \\frac{\\Delta L}{L} = \\frac{1}{\\cos\\theta} - 1 \\approx \\frac{\\theta^2}{2} = \\frac{(1.50 \\times \\pi/180)^2}{2} = \\frac{(0.02618)^2}{2} = 3.43 \\times 10^{-4}.$$

Young's modulus:

$$Y = \\frac{\\sigma}{\\varepsilon} = \\frac{1.44 \\times 10^7}{3.43 \\times 10^{-4}} = 4.2 \\times 10^{10} \\text{ N/m}^2.$$

The answer is E.`,
  },
  {
    n: 14, correct: 'C',
    statement: `Three identical masses are connected with identical rigid rods and pivoted at point A. If the lowest mass receives a small horizontal push to the left, it oscillates with period $$T_1$$. If it instead receives a small push into the page, it oscillates with period $$T_2$$. The ratio $$T_1/T_2$$ is`,
    choices: {
      A: '$$1/2$$',
      B: '$$1$$',
      C: '$$\\sqrt{3}$$',
      D: '$$2\\sqrt{2}$$',
      E: '$$2\\sqrt{5}$$',
    },
    figures: [F18A(14)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'moment of inertia', 'rotational dynamics'],
    solution: `Both cases are physical pendulums. The period is $$T = 2\\pi\\sqrt{I/(Mgx)}$$ where $$x$$ is the distance from the pivot to the center of mass, and $$I$$ is the moment of inertia about the pivot. The center of mass is at the same position in both cases, so $$x$$ and $$Mg$$ are the same.

__Push to the left (in-plane oscillation):__ All three masses swing in the plane perpendicular to the rod axis. Each mass at distance $$R$$ from A contributes $$MR^2$$ to the moment of inertia. So $$I_1 = 3MR^2$$.

__Push into the page (out-of-plane oscillation):__ The two upper masses lie on the rotation axis (the rod from A along which they are strung), so they contribute zero. Only the lowest mass, at distance $$R$$, contributes. So $$I_2 = MR^2$$.

Therefore:

$$\\frac{T_1}{T_2} = \\sqrt{\\frac{I_1}{I_2}} = \\sqrt{\\frac{3MR^2}{MR^2}} = \\sqrt{3}.$$

The answer is C.`,
  },
  {
    n: 15, correct: 'A',
    statement: `A satellite is in a circular orbit about the Earth. Over a long period of time, the effects of air resistance decrease the satellite's total energy by 1 J. The kinetic energy of the satellite`,
    choices: {
      A: 'increases by 1 J.',
      B: 'remains unchanged.',
      C: 'decreases by $$\\frac{1}{2}$$ J.',
      D: 'decreases by 1 J.',
      E: 'decreases by 2 J.',
    },
    figures: [], topics: ['Mechanics'], tags: ['orbital mechanics', 'energy conservation', 'gravitation'],
    solution: `For a circular orbit, the kinetic energy, potential energy, and total energy are related by the virial theorem:

$$K = -\\frac{1}{2}U \\quad \\text{and} \\quad E_{total} = K + U = -K.$$

Thus $$K = -E_{total}$$. If the total energy decreases by $$\\Delta E = 1$$ J (becomes more negative), then $$K$$ increases by 1 J (the orbit shrinks to a smaller radius, where the satellite moves faster).

The answer is A.`,
  },
  {
    n: 16, correct: 'B',
    statement: `A cylindrical space station produces 'artificial gravity' by rotating with angular frequency $$\\omega$$. Consider working in the reference frame rotating with the space station. In this frame, an astronaut is initially at rest standing on the floor, facing in the direction that the space station is rotating. The astronaut jumps up vertically relative to the floor of the space station, with an initial speed less than that of the speed of the floor. Just after leaving the floor, the motion of the astronaut, relative to the space station floor,`,
    choices: {
      A: 'always has a component of acceleration directed toward the floor, and they land at the same point they jumped from.',
      B: 'always has a component of acceleration directed toward the floor, and they land in front of the point they jumped from.',
      C: 'always has a component of acceleration directed toward the floor, and they land behind the point they jumped from.',
      D: 'has a component of acceleration directed away from the floor, and they land behind the point they jumped from.',
      E: 'has a zero acceleration relative to the floor, and the astronaut never reaches the floor again.',
    },
    figures: [F18A(16)], topics: ['Mechanics'], tags: ['non-inertial frames', 'circular motion', 'reference frames'],
    solution: `In the rotating frame, the astronaut feels a centrifugal force directed outward (toward the floor). This always provides a component of acceleration toward the floor, ruling out D and E.

To find where the astronaut lands, switch to the inertial frame. When the astronaut leaves the floor, they have the same velocity as the floor at that point (both are moving tangentially in the inertial frame). After leaving the floor, the astronaut travels in a straight line (ignoring gravity — the centrifugal effect is geometric). The dot on the floor directly below continues to travel in a circular arc.

A straight-line chord subtends more angular distance than the arc of the same length. Therefore, in the time the dot travels its arc, the astronaut travels a slightly greater angular displacement — landing __ahead__ of (in front of) the original point. The answer is B.`,
  },
  {
    n: 17, correct: 'D',
    statement: `A stream of sand is dropped out of a helicopter initially moving at a constant speed $$v$$ to the right. The helicopter suddenly turns and begins moving at a constant speed $$v$$ to the left. Neglecting air resistance on the sand, what is the shape of the stream of sand, as viewed from the ground? The black dot represents the helicopter.`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF18A(17, 'A'), B: CF18A(17, 'B'), C: CF18A(17, 'C'), D: CF18A(17, 'D'), E: CF18A(17, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['projectile motion', 'kinematics-2d', 'reference frames'],
    solution: `Once sand leaves the helicopter, it is in free fall with no air resistance. Since it was dropped (released from rest relative to the helicopter, which was moving horizontally), each grain of sand retains the horizontal velocity it had at the moment of release.

If the helicopter moves at constant velocity $$v$$ to the right, each grain dropped at time $$t$$ before the turn has horizontal velocity $$v$$ to the right at the moment of release. After release, no horizontal force acts, so that grain continues to move at $$v$$ to the right and always remains directly below the helicopter's position at the time of release.

From the ground, the entire stream of sand falling while the helicopter moved right appears as a __vertical line__ at some $$x$$ range, and similarly the sand dropped while moving left appears as another vertical line. The two lines are separated (the helicopter turned from one direction to the other), matching picture D — two disconnected vertical line segments.

The answer is D.`,
  },
  {
    n: 18, correct: 'C',
    statement: `A mass $$m$$ is attached to a thin rod of length $$\\ell$$ so that it can freely spin in a vertical circle with period $$T$$. The difference in the tensions in the rod when the mass is at the top and the bottom of the circle is`,
    choices: {
      A: '$$6mg^2T^2/\\ell$$',
      B: '$$4\\pi mg^2T^2/\\ell$$',
      C: '$$6mg$$',
      D: '$$\\pi^2 m\\ell/T^2$$',
      E: '$$4\\pi m\\ell/T^2$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'energy conservation', 'newton\'s laws'],
    solution: `Let $$v_b$$ and $$v_t$$ be the speeds at the bottom and top. By energy conservation (the height difference is $$2\\ell$$):

$$\\frac{1}{2}mv_b^2 = \\frac{1}{2}mv_t^2 + 2mg\\ell \\implies v_b^2 - v_t^2 = 4g\\ell.$$

At the bottom, centripetal acceleration is upward, gravity is downward:

$$T_b - mg = \\frac{mv_b^2}{\\ell}.$$

At the top, centripetal acceleration is downward, gravity is downward:

$$T_t + mg = \\frac{mv_t^2}{\\ell}.$$

Subtracting the second from the first:

$$T_b - T_t - 2mg = \\frac{m(v_b^2 - v_t^2)}{\\ell} = \\frac{4mg\\ell}{\\ell} = 4mg.$$

Therefore:

$$T_b - T_t = 6mg.$$

The period $$T$$ is a red herring. The answer is C.`,
  },
  {
    n: 19, correct: 'E',
    statement: `Raindrops with a number density of $$n$$ drops per cubic meter and radius $$r_0$$ hit the ground with a speed $$v_0$$. The resulting pressure on the ground from the rain is $$P_0$$. If the number density is doubled, the drop radius is halved, and the speed is halved, the new pressure will be`,
    choices: {
      A: '$$P_0$$',
      B: '$$P_0/2$$',
      C: '$$P_0/4$$',
      D: '$$P_0/8$$',
      E: '$$P_0/16$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'pressure', 'scaling'],
    solution: `Pressure equals force per unit area, which equals the rate of momentum delivery per unit area. Consider a unit area of ground over a time interval $$\\Delta t$$.

The number of drops striking the area per unit time is $$n v$$ (drops per unit volume times the volume swept per unit time per unit area). Each drop has mass $$m = \\frac{4}{3}\\pi r^3 \\rho$$ and delivers momentum $$mv$$.

So pressure $$P = (nv)(mv) = nv^2 \\cdot \\frac{4}{3}\\pi r^3 \\rho \\propto n v^2 r^3$$.

With $$n \\to 2n$$, $$r \\to r/2$$, $$v \\to v/2$$:

$$P' = P_0 \\cdot 2 \\cdot (1/2)^2 \\cdot (1/2)^3 = P_0 \\cdot 2 \\cdot \\frac{1}{4} \\cdot \\frac{1}{8} = \\frac{P_0}{16}.$$

The answer is E.`,
  },
  {
    n: 20, correct: 'C',
    statement: `A spring stretched to double its unstretched length has a potential energy $$U_0$$. If the spring is cut in half, and each half spring is stretched to double its unstretched length, then the total potential energy stored in the two half springs will be`,
    choices: {
      A: '$$4U_0$$',
      B: '$$2U_0$$',
      C: '$$U_0$$',
      D: '$$U_0/2$$',
      E: '$$U_0/4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['springs', 'energy conservation', 'scaling'],
    solution: `Let the original spring have natural length $$L_0$$ and spring constant $$k_0$$. Stretched to double its length means stretched by $$x = L_0$$, so $$U_0 = \\frac{1}{2}k_0 L_0^2$$.

Each half-spring has natural length $$L_0/2$$ and spring constant $$k' = 2k_0$$ (spring constant is inversely proportional to length). When each half is stretched to double its natural length, it is stretched by $$x' = L_0/2$$. The energy of one half-spring is

$$U' = \\frac{1}{2}k'(x')^2 = \\frac{1}{2}(2k_0)(L_0/2)^2 = \\frac{1}{2}(2k_0)\\frac{L_0^2}{4} = \\frac{U_0}{2}.$$

Two half-springs: $$U_{total} = 2U' = U_0.$$

The answer is C.`,
  },
  {
    n: 21, correct: 'A',
    statement: `A ping-pong ball (a hollow spherical shell) with mass $$m$$ is placed on the ground with initial velocity $$v_0$$ and zero angular velocity at time $$t = 0$$. The coefficient of friction between the ping-pong ball and the ground is $$\\mu_s = \\mu_k = \\mu$$. The time the ping-pong ball begins to roll without slipping is`,
    choices: {
      A: '$$t = \\dfrac{2}{5}\\dfrac{v_0}{\\mu g}$$',
      B: '$$t = \\dfrac{2}{3}\\dfrac{v_0}{\\mu g}$$',
      C: '$$t = \\dfrac{v_0}{\\mu g}$$',
      D: '$$t = \\dfrac{5}{3}\\dfrac{v_0}{\\mu g}$$',
      E: '$$t = \\dfrac{3}{2}\\dfrac{v_0}{\\mu g}$$',
    },
    figures: [F18A(21)], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'rotational dynamics', 'angular momentum'],
    solution: `The ball slides with kinetic friction $$f = \\mu mg$$ opposing its translational motion. The translational deceleration is

$$a = -\\mu g \\implies v(t) = v_0 - \\mu g t.$$

The moment of inertia of a hollow spherical shell is $$I = \\frac{2}{3}mR^2$$. Friction exerts a torque $$\\tau = \\mu mg R$$ about the center, producing angular acceleration:

$$\\alpha = \\frac{\\tau}{I} = \\frac{\\mu mg R}{\\frac{2}{3}mR^2} = \\frac{3\\mu g}{2R} \\implies \\omega(t) = \\frac{3\\mu g}{2R}\\,t.$$

Rolling without slipping begins when $$v = R\\omega$$:

$$v_0 - \\mu g t = R \\cdot \\frac{3\\mu g}{2R} t = \\frac{3\\mu g}{2}\\,t$$

$$v_0 = \\mu g t\\left(1 + \\frac{3}{2}\\right) = \\frac{5}{2}\\mu g t \\implies t = \\frac{2}{5}\\frac{v_0}{\\mu g}.$$

The answer is A.`,
  },
  {
    n: 22, correct: 'A',
    statement: `A small hole is punched into the bottom of a rectangular boat, allowing water to enter the boat. As the boat sinks into the water, which of the following graphs best shows how the rate water flows through the hole varies with time? Assume that the boat remains horizontal as it sinks.`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF18A(22, 'A'), B: CF18A(22, 'B'), C: CF18A(22, 'C'), D: CF18A(22, 'D'), E: CF18A(22, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['fluid statics', 'fluid dynamics', 'buoyancy', 'bernoulli\'s principle'],
    solution: `By Archimedes' principle, the boat is in equilibrium when the buoyant force equals the total weight (boat + water inside). As water enters, the boat sinks, displacing more water outside. The weight of the boat plus interior water increases, but so does the buoyant force.

The key insight: the pressure difference across the hole equals $$\\rho g \\Delta h$$, where $$\\Delta h$$ is the difference between the outside water level and the inside water level. This height difference $$\\Delta h$$ remains constant throughout the sinking process (it is determined by the boat's structural weight and area — a fixed quantity). Since the pressure driving the flow is constant, by Torricelli's theorem / Bernoulli's principle the flow rate is also constant.

The graph should be a horizontal (constant) line, which is graph A. The answer is A.`,
  },
  {
    n: 23, correct: 'C',
    statement: `The coefficients of static and kinetic friction between a ball and a ramp are $$\\mu_s = \\mu_k = \\mu$$. The ball is released from rest at the top of the ramp. Which of the following graphs best shows the rotational acceleration of the ball about its center of mass as a function of the angle of the ramp?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: CF18A(23, 'A'), B: CF18A(23, 'B'), C: CF18A(23, 'C'), D: CF18A(23, 'D'), E: CF18A(23, 'E'),
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'rotational dynamics', 'graph interpretation', 'extreme cases'],
    solution: `__Limiting cases:__ At $$\\theta = 0^\\circ$$, the ball sits on a horizontal surface with no tendency to slip — it does not rotate at all, so $$\\alpha = 0$$. At $$\\theta = 90^\\circ$$, the normal force is zero, friction is zero, and $$\\alpha = 0$$ again.

__Between the limits:__ For small angles, the ball rolls without slipping. The frictional torque is $$\\tau = fR = \\mu_s N R$$ up to the maximum static friction. The angular acceleration is $$\\alpha = g\\sin\\theta / [(1 + I/(mR^2))R] \\propto \\sin\\theta$$, increasing with $$\\theta$$.

At a critical angle $$\\theta_c = \\arctan(\\mu g / (1 + 2/5)) = \\ldots$$, slipping begins and kinetic friction takes over. For $$\\theta > \\theta_c$$, the friction force is $$\\mu_k mg\\cos\\theta$$, so $$\\alpha \\propto \\cos\\theta$$, which decreases toward zero.

The graph therefore increases from zero, reaches a peak where rolling transitions to slipping, then decreases back to zero — forming two smooth concave-down pieces joined at the transition, as shown in graph C. The answer is C.`,
  },
  {
    n: 24, correct: 'E',
    statement: `A mass is attached to one end of a rigid rod, while the other end of the rod is attached to a fixed horizontal axle. Initially the mass hangs at the end of the rod and the rod is vertical. The mass is given an initial kinetic energy $$K$$. If $$K$$ is very small, the mass behaves like a pendulum, performing small-angle oscillations with period $$T_0$$. As $$K$$ is increased, the period of the motion for the mass`,
    choices: {
      A: 'remains the same.',
      B: 'increases, approaching a finite constant.',
      C: 'decreases, approaching a finite non-zero constant.',
      D: 'decreases, approaching zero.',
      E: 'initially increases, then decreases.',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'energy conservation'],
    solution: `For a simple pendulum (rod, not string), the restoring torque is $$\\tau = -mg\\ell\\sin\\theta$$. Since $$\\sin\\theta < \\theta$$ for $$\\theta > 0$$, larger amplitudes have a weaker restoring force than the small-angle approximation predicts, so the period increases as amplitude increases.

As the amplitude approaches $$\\pi$$ (mass almost reaching the top), the period diverges to infinity — the mass barely makes it and spends a very long time near the unstable equilibrium.

When $$K$$ exceeds $$2mg\\ell$$ (the potential energy at the top), the mass swings over the top and keeps going around in one direction. Now the motion is full rotation, not oscillation. In this regime, the "period" is the time for one full revolution. As $$K$$ increases further, the mass moves faster and the period decreases, approaching zero.

Therefore the period initially increases (diverges) then decreases. The answer is E.`,
  },
  {
    n: 25, correct: 'B',
    statement: `Alice and Bob are working on a lab report. Alice measures the period of a pendulum to be $$1.013 \\pm 0.008$$ s, while Bob independently measures the period to be $$0.997 \\pm 0.016$$ s. Alice and Bob can combine their measurements in several ways.

1: Keep Alice's result and ignore Bob's

2: Average Alice's and Bob's results

3: Perform a weighted average of Alice's and Bob's results, with Alice's result weighted 4 times more than Bob's

How are the uncertainties of these results related?`,
    choices: {
      A: 'Method 1 has the lowest uncertainty, and method 2 has the highest',
      B: 'Method 3 has the lowest uncertainty, and method 2 has the highest',
      C: 'Method 2 has the lowest uncertainty, and method 1 has the highest',
      D: 'Method 3 has the lowest uncertainty, and method 1 has the highest',
      E: 'Method 1 has the lowest uncertainty, and method 3 has the highest',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'data analysis'],
    solution: `Let Alice's uncertainty be $$\\Delta a = 0.008$$ s and Bob's be $$\\Delta b = 0.016 = 2\\Delta a$$ s.

__Method 1__ (Alice only): uncertainty $$= \\Delta a$$.

__Method 2__ (simple average $$(a+b)/2$$): uncertainty $$= \\frac{1}{2}\\sqrt{(\\Delta a)^2 + (\\Delta b)^2} = \\frac{1}{2}\\sqrt{(\\Delta a)^2 + (2\\Delta a)^2} = \\frac{\\sqrt{5}}{2}\\Delta a \\approx 1.118\\,\\Delta a$$.

__Method 3__ (weighted average $$(4a + b)/5$$): uncertainty $$= \\frac{1}{5}\\sqrt{(4\\Delta a)^2 + (\\Delta b)^2} = \\frac{1}{5}\\sqrt{16(\\Delta a)^2 + 4(\\Delta a)^2} = \\frac{\\sqrt{20}}{5}\\Delta a = \\frac{2\\sqrt{5}}{5}\\Delta a \\approx 0.894\\,\\Delta a$$.

Ordering: Method 3 $$(\\approx 0.894\\,\\Delta a) <$$ Method 1 $$(= \\Delta a) <$$ Method 2 $$(\\approx 1.118\\,\\Delta a)$$. The lowest uncertainty is method 3, and the highest is method 2. The answer is B.`,
  },
]
