// Digitized 2018 F=ma Exam B questions. Sources:
// Exam: work/fma/fma-2018-b.pdf (text extracted to work/fma/fma-2018-b.txt)
// Answer key: work/fma/fma-2018-b-sol.pdf (←CORRECT markers)
// Worked solutions: Kisacanin & Zhang, "2011-2019 Solutions Manual" (work/fma-book.txt),
//   sections labelled 2018.1. through 2018.25. in the "Solutions for Exam B" section.
// Figures: work/figure_manifest.json, key "fma-2018-b" — already cropped and uploaded.
//
// Answer key cross-check: all 25 answers confirmed consistent between the
// ←CORRECT markers in the solution PDF and the book solutions.
// Q4 note: ←CORRECT appears after option E with no letter prefix; solution text
//   and book (2018.4) both confirm E ("Neither the kinetic energy nor the momentum is conserved").
// Q9 note: ←CORRECT appears after option E with no letter prefix; solution text
//   and book (2018.9) both confirm E (2.0 kg ball moves south at 15 m/s).

const F18B = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2018-b'
export const questions = [
  {
    n: 1, correct: 'B',
    statement: `A large lump of clay is dropped off of a wall and lands on the ground. Which graph best represents the acceleration of the center of mass of the clay as a function of time?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q01A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q01B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q01C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q01D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q01E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['graph interpretation', '1d kinematics', 'collisions'],
    solution: `The motion has three phases.

During free fall, the only force on the clay is gravity, so the acceleration is a constant $$-g = -10 \\text{ m/s}^2$$ — a horizontal line below the time axis. This rules out choice A (which shows no constant phase) immediately.

When the clay hits the ground, it experiences a brief, large upward impulsive force from the ground that brings it to rest. This produces a sudden spike upward in the acceleration graph.

After landing, the clay sits at rest on the ground, so its acceleration is zero — a horizontal line at the axis.

Only choice B shows all three features correctly: a constant negative value during free fall, a sharp upward spike at impact, and zero afterward.

The answer is B.`,
  },
  {
    n: 2, correct: 'D',
    statement: `A uniform block of mass 10 kg is released at rest from the top of an incline with length 10 m and inclination $$30^\\circ$$, and slides to the bottom. The coefficients of static and kinetic friction are $$\\mu_s = \\mu_k = 0.1$$. How much energy is dissipated due to friction?`,
    choices: {
      A: '0 J',
      B: '22 J',
      C: '43 J',
      D: '87 J',
      E: '164 J',
    },
    figures: [], topics: ['Mechanics'], tags: ['friction', 'energy conservation', 'work-energy theorem'],
    solution: `First, check that the block actually slides. The gravitational component along the incline is $$mg\\sin 30^\\circ = (10)(10)(0.5) = 50 \\text{ N}$$, while the maximum static friction is $$\\mu_s mg\\cos 30^\\circ = (0.1)(10)(10)(\\sqrt{3}/2) \\approx 8.7 \\text{ N}$$. Since gravity along the slope exceeds maximum static friction, the block slides.

The normal force on the incline is

$$N = mg\\cos 30^\\circ = (10)(10)\\frac{\\sqrt{3}}{2} = 50\\sqrt{3} \\text{ N.}$$

The kinetic friction force is

$$f_k = \\mu_k N = (0.1)(50\\sqrt{3}) = 5\\sqrt{3} \\text{ N.}$$

The energy dissipated by friction over the 10 m length of the incline is

$$W_f = f_k \\cdot d = 5\\sqrt{3} \\times 10 = 50\\sqrt{3} \\approx 86.6 \\text{ J.}$$

The closest answer is 87 J.

The answer is D.`,
  },
  {
    n: 3, correct: 'C',
    statement: `A 3.0 kg mass moving at 40 m/s to the right collides with and sticks to a 2.0 kg mass traveling at 20 m/s to the right. After the collision, the kinetic energy of the system is closest to`,
    choices: {
      A: '600 J',
      B: '1200 J',
      C: '2600 J',
      D: '2800 J',
      E: '3400 J',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
    solution: `Since the masses stick together, this is a perfectly inelastic collision. By conservation of momentum, the velocity of the combined mass is

$$v_f = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2} = \\frac{(3.0)(40) + (2.0)(20)}{5.0} = \\frac{120 + 40}{5} = 32 \\text{ m/s.}$$

The kinetic energy after the collision is

$$K_f = \\frac{1}{2}(m_1 + m_2)v_f^2 = \\frac{1}{2}(5.0)(32)^2 = \\frac{1}{2}(5.0)(1024) = 2560 \\text{ J.}$$

The closest answer is 2600 J.

The answer is C.`,
  },
  {
    n: 4, correct: 'E',
    statement: `A basketball is released from rest and bounces on the ground. Considering only the ball just before and just after the bounce, which of the following statements must be true?`,
    choices: {
      A: 'The momentum and the total energy of the ball are conserved.',
      B: 'The momentum of the ball is conserved, but not the kinetic energy.',
      C: 'The total energy of the ball is conserved, but not the momentum.',
      D: 'The kinetic energy of the ball is conserved, but not the momentum.',
      E: 'Neither the kinetic energy of the ball nor the momentum is conserved.',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'energy conservation', 'collisions'],
    solution: `The question asks what is true of the __ball alone__ (not the ball-Earth system).

__Momentum is not conserved.__ The ground exerts a large external force on the ball during the bounce, changing the ball's momentum from downward to upward. This is an external force on the ball, so the ball's momentum is not conserved. (You can also see this directly: the ball's velocity reverses direction.)

__Kinetic energy is not conserved.__ A real basketball bounce is inelastic — energy is dissipated into sound (you can hear the bounce), heat, and deformation of the ball. The ball bounces to a lower height than it was dropped from, confirming that kinetic energy is lost.

Therefore, neither quantity is conserved for the ball alone.

The answer is E.`,
  },
  {
    n: 5, correct: 'D',
    statement: `The hard disk in a computer will spin up to speed within 10 rotations, but when turned off will spin through 50 rotations before coming to a stop. Assuming the hard disk has constant angular acceleration $$\\alpha_1$$ and angular deceleration $$\\alpha_2$$, the ratio $$\\alpha_1/\\alpha_2$$ is`,
    choices: {
      A: '$$1/5$$',
      B: '$$1/\\sqrt{5}$$',
      C: '$$\\sqrt{5}$$',
      D: '5',
      E: '25',
    },
    figures: [], topics: ['Mechanics'], tags: ['rotational dynamics', 'equations of motion'],
    solution: `Using the rotational kinematics formula $$\\omega_f^2 - \\omega_i^2 = 2\\alpha\\theta$$:

For spin-up (from rest to final speed $$\\omega$$): $$\\omega^2 = 2\\alpha_1 \\theta_1$$ where $$\\theta_1 = 10$$ rotations.

For spin-down (from speed $$\\omega$$ to rest): $$\\omega^2 = 2\\alpha_2 \\theta_2$$ where $$\\theta_2 = 50$$ rotations.

Since both expressions equal $$\\omega^2$$, the product $$\\alpha\\theta$$ is the same in both cases:

$$\\alpha_1 \\theta_1 = \\alpha_2 \\theta_2$$

$$\\frac{\\alpha_1}{\\alpha_2} = \\frac{\\theta_2}{\\theta_1} = \\frac{50}{10} = 5.$$

The answer is D.`,
  },
  {
    n: 6, correct: 'D',
    statement: `A massless beam of length $$L$$ is fixed on one end. A downward force $$F$$ is applied to the free end of the beam, deflecting the beam downward by a distance $$x$$. The deflection $$x$$ is linear in $$F$$ and is inversely proportional to the cross-section moment $$I$$, which has units m$$^4$$. The deflection is also dependent on Young's modulus $$E$$, which has units N/m$$^2$$. Then $$x$$ depends on $$L$$ according to`,
    choices: {
      A: '$$x \\propto \\sqrt{L}$$',
      B: '$$x \\propto L$$',
      C: '$$x \\propto L^2$$',
      D: '$$x \\propto L^3$$',
      E: '$$x \\propto L^4$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['dimensional analysis'],
    solution: `We use dimensional analysis. The deflection must have units of length (m), and it is proportional to $$F$$ and inversely proportional to $$I$$ and $$E$$:

$$x \\propto \\frac{F}{EI} L^\\gamma.$$

Check units: $$F$$ is in N, $$E$$ is in N/m$$^2$$, and $$I$$ is in m$$^4$$. So

$$\\left[\\frac{F}{EI}\\right] = \\frac{\\text{N}}{(\\text{N/m}^2)(\\text{m}^4)} = \\frac{\\text{N}}{\\text{N}\\cdot\\text{m}^2} = \\text{m}^{-2}.$$

Since $$x$$ must have units of m, we need $$L^\\gamma$$ to contribute m$$^3$$, so $$\\gamma = 3$$.

Indeed, the exact formula from beam theory is $$x = FL^3/(3EI)$$, confirming $$x \\propto L^3$$.

The answer is D.`,
  },
  {
    n: 7, correct: 'A',
    statement: `A pendulum of length $$L$$ oscillates inside a box. A person picks up the box and gently shakes it vertically with frequency $$\\omega$$ and a fixed amplitude for a fixed time. To maximize the final amplitude of the pendulum, $$\\omega$$ should satisfy`,
    choices: {
      A: '$$\\omega = \\sqrt{4g/L}$$',
      B: '$$\\omega = \\sqrt{2g/L}$$',
      C: '$$\\omega = \\sqrt{g/L}$$',
      D: '$$\\omega = \\sqrt{g/4L}$$',
      E: 'there will be no significant effect on the pendulum amplitude for any value of $$\\omega$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'pendulum', 'non-inertial frames'],
    solution: `In the reference frame of the box, the vertical shaking is equivalent to making the effective gravitational acceleration $$g_{\\text{eff}}$$ oscillate at frequency $$\\omega$$ about its average value $$g$$. Since the shaking is gentle, $$g_{\\text{eff}}$$ stays close to $$g$$, and the pendulum's natural frequency remains approximately $$\\omega_0 = \\sqrt{g/L}$$.

To build up the pendulum's amplitude (parametric resonance), we want $$g_{\\text{eff}}$$ to be stronger than average when the pendulum is swinging downward (gaining speed) and weaker when it is swinging upward (losing speed). This requires the effective gravity to complete one full oscillation for every half-period of the pendulum, i.e., the driving frequency must be twice the pendulum frequency:

$$\\omega = 2\\omega_0 = 2\\sqrt{\\frac{g}{L}} = \\sqrt{\\frac{4g}{L}}.$$

The answer is A.`,
  },
  {
    n: 8, correct: 'C',
    statement: `The coefficients of static and kinetic friction between a ball and a horizontal plane are $$\\mu_s = \\mu_k = \\mu$$. The ball is given a horizontal speed but no rotational velocity about its center of mass. Which of the following graphs best shows the rotational velocity of the ball about its center of mass as a function of time?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q08A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q08B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q08C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q08D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q08E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['rolling without slipping', 'friction', 'rotational dynamics'],
    solution: `Initially the ball slides without rotating. The kinetic friction force $$f_k = \\mu_k mg$$ acts backward on the ball at the contact point, applying a constant torque $$\\tau = f_k r$$ that spins the ball up. Since the torque is constant, the angular velocity increases linearly with time. This rules out choices A and E (which do not start at zero) and choice B (which curves).

Once the ball's contact point reaches the no-slip condition $$\\omega = v/r$$, static friction takes over and the ball rolls without slipping. The net torque drops to zero and the angular velocity stays constant.

The graph shows a linear increase starting at zero, then a flat (constant) portion — which is choice C.

The answer is C.`,
  },
  {
    n: 9, correct: 'E',
    statement: `A 3.0 kg ball moving at 10 m/s east collides elastically with a 2.0 kg ball moving 15 m/s west. Which of the following statements could be true after the collision?`,
    choices: {
      A: 'The two balls are both moving directly east.',
      B: 'The 3.0 kg ball moves directly west at 15 m/s.',
      C: 'The 2.0 kg ball moves directly north at 10 m/s.',
      D: 'The 3.0 kg ball is at rest.',
      E: 'The 2.0 kg ball moves directly south at 15 m/s.',
    },
    figures: [], topics: ['Mechanics'], tags: ['collisions', 'momentum conservation', 'energy conservation'],
    solution: `First, compute the total momentum:

$$p = (3.0)(10) + (2.0)(-15) = 30 - 30 = 0 \\text{ kg·m/s.}$$

The center-of-mass frame is the lab frame here. Since total momentum is zero, after the elastic collision the two balls must move with equal and opposite momenta.

Let $$3.0 v_1 = 2.0 v_2$$ (magnitudes). By conservation of kinetic energy:

$$\\frac{1}{2}(3.0)(10)^2 + \\frac{1}{2}(2.0)(15)^2 = \\frac{1}{2}(3.0)v_1^2 + \\frac{1}{2}(2.0)v_2^2.$$

The initial kinetic energy is $$150 + 225 = 375 \\text{ J}$$. Substituting $$v_2 = (3/2)v_1$$:

$$375 = \\frac{1}{2}(3.0)v_1^2 + \\frac{1}{2}(2.0)\\frac{9}{4}v_1^2 = \\frac{15}{4}v_1^2 \\implies v_1 = 10 \\text{ m/s},\\ v_2 = 15 \\text{ m/s.}$$

The speeds after collision are the same as before (10 m/s for the 3 kg ball and 15 m/s for the 2 kg ball), but they can be in any opposite pair of directions. Choice E (2 kg ball at 15 m/s south) is consistent with this — the 3 kg ball would then move at 10 m/s north, satisfying both conservation laws.

The other choices fail: A requires both moving east (no zero-momentum solution), B gives wrong speed for 3 kg ball, C gives wrong speed for 2 kg ball, D has 3 kg ball at rest which requires zero speed for 2 kg ball too.

The answer is E.`,
  },
  {
    n: 10, correct: 'D',
    statement: `A balloon filled with air submerged in water at a depth $$h$$ experiences a buoyant force $$B_0$$. The balloon is moved to a depth of $$2h$$, where it experiences a buoyant force $$B$$. Assuming the water is incompressible and the balloon and air are compressible, the buoyant force $$B$$ satisfies`,
    choices: {
      A: '$$B \\geq 2B_0$$',
      B: '$$B_0 < B < 2B_0$$',
      C: '$$B = B_0$$',
      D: '$$B < B_0$$',
      E: 'it depends on the compressibility of the balloon and air',
    },
    figures: [], topics: ['Mechanics'], tags: ['buoyancy', 'fluid statics', 'pressure'],
    solution: `The buoyant force equals $$\\rho_{\\text{water}} g V_{\\text{displaced}}$$, where $$\\rho_{\\text{water}}$$ is the (incompressible) density of water and $$V_{\\text{displaced}}$$ is the volume of water displaced by the balloon.

At depth $$h$$, the gauge pressure on the balloon is $$\\rho_{\\text{water}} g h$$. At depth $$2h$$ the gauge pressure doubles. Since the balloon and the air inside are compressible, the increased pressure compresses the balloon, reducing its volume.

With a smaller volume at depth $$2h$$, less water is displaced, so the buoyant force decreases: $$B < B_0$$.

(If the balloon were incompressible — like a rigid sphere — the buoyant force would stay the same. But the problem states the balloon is compressible, so it must shrink.)

The answer is D.`,
  },
  {
    n: 11, correct: 'C',
    statement: `A circle of rope is spinning in outer space with an angular velocity $$\\omega_0$$. Transverse waves on the rope have speed $$v_0$$, as measured in a rotating reference frame where the rope is at rest. If the angular velocity of the rope is doubled, the new speed of transverse waves, as measured in a rotating reference frame where the rope is at rest, will be`,
    choices: {
      A: '$$v_0$$',
      B: '$$\\sqrt{2}\\,v_0$$',
      C: '$$2v_0$$',
      D: '$$4v_0$$',
      E: '$$8v_0$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['circular motion', 'tension', 'dimensional analysis'],
    solution: `Consider a small segment of rope of mass $$\\delta m$$ at radius $$R$$. The tension $$T$$ in the rope provides the centripetal force for that segment:

$$T \\propto \\delta m\\, R\\, \\omega^2 \\propto \\omega^2.$$

The speed of transverse waves on a rope is $$v = \\sqrt{T/\\mu}$$, where $$\\mu$$ is the linear mass density (constant). Therefore

$$v \\propto \\sqrt{T} \\propto \\sqrt{\\omega^2} = \\omega.$$

If $$\\omega$$ doubles, then $$v$$ also doubles: the new wave speed is $$2v_0$$.

This can also be derived from dimensional analysis: the only length scale is the rope's circumference $$2\\pi R$$ and the only frequency scale is $$\\omega$$, so $$v \\propto \\omega R$$.

The answer is C.`,
  },
  {
    n: 12, correct: 'C',
    statement: `A child in a circular, rotating space station tosses a ball in such a way so that once the station has rotated through one half rotation, the child catches the ball. From the child's point of view, which plot shows the trajectory of the ball? The child is at the bottom of the space station in the diagrams below, but only the initial location of the ball is shown.`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q12A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q12B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q12C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q12D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q12E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['reference frames', 'non-inertial frames', 'kinematics-2d'],
    solution: `Since the child both throws and catches the ball, the trajectory in the child's frame must begin and end at the child's position. This rules out choices A and E.

To decide between B, C, and D, examine the initial velocity the child observes. In the inertial (lab) frame at the moment of the throw, the ball travels directly toward the center (upward), while the child moves tangentially (say, to the right). In the child's rotating frame, the ball's initial velocity is the ball's lab velocity minus the child's lab velocity: it points upward and to the left — i.e., diagonally toward the upper-left.

Only choice C begins with the ball moving to the upper left from the child's position and returns to the child after half a rotation.

(More precisely, in polar coordinates the ball's radius grows linearly with time and the angle it subtends in the lab frame is constant, while in the child's frame the angle changes linearly as the station rotates. The resulting spiral path is choice C.)

The answer is C.`,
  },
  {
    n: 13, correct: 'D',
    statement: `Two blocks of masses $$m_1 = 2.0 \\text{ kg}$$ and $$m_2 = 1.0 \\text{ kg}$$ are stacked together on top of a frictionless table as shown. The coefficient of static friction between the blocks is $$\\mu_s = 0.20$$. What is the minimum horizontal force that must be applied to the top block to make it slide across the bottom block?`,
    choices: {
      A: '4.0 N',
      B: '6.0 N',
      C: '8.0 N',
      D: '12.0 N',
      E: 'The top block will not slide across the bottom block',
    },
    figures: [F18B(13)], topics: ['Mechanics'], tags: ["newton's laws", 'friction', 'free-body diagrams'],
    solution: `The applied force $$F$$ acts on $$m_1$$ (the top block). The only horizontal force on $$m_2$$ (the bottom block) is static friction from $$m_1$$. As long as the blocks move together, their common acceleration is

$$a = \\frac{F}{m_1 + m_2} = \\frac{F}{3.0}.$$

The static friction force that $$m_1$$ exerts on $$m_2$$ must produce this acceleration for $$m_2$$:

$$f_s = m_2 a = (1.0)\\frac{F}{3} = \\frac{F}{3}.$$

The maximum static friction between the blocks is

$$f_{s,\\max} = \\mu_s m_1 g = (0.20)(2.0)(10) = 4.0 \\text{ N.}$$

The blocks slip when $$f_s > f_{s,\\max}$$:

$$\\frac{F}{3} > 4.0 \\implies F > 12 \\text{ N.}$$

The minimum force to cause sliding is 12.0 N.

The answer is D.`,
  },
  {
    n: 14, correct: 'B',
    statement: `A spool is made of a cylinder with a thin disc attached to either end of the cylinder, as shown. The cylinder has radius $$r = 0.75 \\text{ cm}$$ and the discs each have radius $$R = 1.00 \\text{ cm}$$. A string is attached to the cylinder and wound around the cylinder a few times. At what angle above the horizontal can the string be pulled so that the spool will slip without rotating?`,
    choices: {
      A: '$$31.2^\\circ$$',
      B: '$$41.4^\\circ$$',
      C: '$$54.0^\\circ$$',
      D: '$$60.8^\\circ$$',
      E: '$$81.5^\\circ$$',
    },
    figures: [F18B(14)], topics: ['Mechanics'], tags: ['torque', 'statics/equilibrium', 'rolling without slipping'],
    solution: `For the spool to slip without rotating, the net torque about the contact point with the ground must be zero. This means the line of action of the string tension must pass directly through the contact point.

Draw the geometry: the string leaves the cylinder (radius $$r$$) tangentially, and the contact point is at the bottom where the disc (radius $$R$$) touches the ground. The string's line of action passes through the contact point when the string makes angle $$\\theta$$ above horizontal such that

$$\\cos(90^\\circ - \\theta) = \\sin\\theta = \\frac{r}{R}$$

Wait — let us draw the right triangle more carefully. The line from the center of the spool to the contact point has length $$R$$ (vertical). The line from the center to where the string leaves the cylinder is perpendicular to the string and has length $$r$$. For the string to pass through the contact point, the angle $$\\theta$$ satisfies

$$\\cos\\theta = \\frac{r}{R} = \\frac{0.75}{1.00} = 0.75$$

$$\\theta = \\arccos(0.75) \\approx 41.4^\\circ.$$

The answer is B.`,
  },
  {
    n: 15, correct: 'E',
    statement: `You are standing on a weight scale that reads 700 Newtons while holding a large physics textbook that is originally at rest. At time $$t = 1$$ seconds you begin moving the textbook upward so that by time $$t = 2$$ seconds the textbook is now half a meter higher and once again at rest. Which of the following graphs best illustrates how the reading on the scale might vary with time?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q15A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q15B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q15C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q15D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2018-b/fma-2018-b-q15E.png',
    },
    figures: [], topics: ['Mechanics'], tags: ['graph interpretation', "newton's laws", 'free-body diagrams'],
    solution: `Consider the system of you plus the textbook. The scale reads the normal force $$N$$, and Newton's second law gives $$N - (m_{\\text{you}} + m_{\\text{book}})g = (m_{\\text{you}} + m_{\\text{book}})a_{\\text{cm}}$$.

The center of mass of the system starts at rest and ends at rest (the textbook moves 0.5 m up, you stay in place, so the CM shifts slightly upward but starts and ends at rest). By the impulse-momentum theorem, the net impulse is zero:

$$\\int_0^T (N - Mg)\\,dt = 0 \\implies \\int N\\,dt = MgT.$$

This means the __average__ scale reading over the whole event must equal the combined weight of 700 N, ruling out any graph where the scale ends at a different level than it started.

The sequence: before $$t = 1$$ s the scale reads 700 N (at rest). To start the book moving upward, you push it up — this increases the load on your feet, so the scale spikes __above__ 700 N. As the book decelerates to a stop, you pull back on it (downward relative to its motion), which reduces the load — the scale dips __below__ 700 N. After $$t = 2$$ s, both you and the book are at rest, so the scale returns to 700 N.

The graph must show: flat at 700, then spike above, then dip below, then return to 700. Only choice E matches this shape while satisfying the equal-area requirement.

The answer is E.`,
  },
  {
    n: 16, correct: 'C',
    statement: `A plane can fly by tilting the trailing edge of the wings downward by a small angle $$\\theta$$, called the angle of attack. In still air, a plane with ground speed $$v$$ will have a lift force proportional to $$v^2\\theta$$ and a drag force proportional to $$v^2$$.

Consider a plane initially in level flight in still air with constant ground speed $$v$$. If the plane enters a region with a tailwind with speed $$w < v$$ (the wind is blowing in the same direction that the plane wants to fly), how must the engine power and the angle of attack change for the plane to maintain level flight at the same ground speed?`,
    choices: {
      A: 'The engine power decreases and the angle of attack decreases',
      B: 'The engine power decreases and the angle of attack stays the same',
      C: 'The engine power decreases and the angle of attack increases',
      D: 'The engine power increases and the angle of attack decreases',
      E: 'The engine power increases and the angle of attack increases',
    },
    figures: [], topics: ['Mechanics'], tags: ['drag force', 'fluid dynamics', 'scaling'],
    solution: `The aerodynamic forces depend on the speed of the plane __relative to the air__, not relative to the ground. Let $$u = v - w$$ be the airspeed (relative to the surrounding air). Since the tailwind helps, $$u < v$$.

__Angle of attack:__ The lift force must still equal the plane's weight:

$$\\text{Lift} \\propto u^2 \\theta = W.$$

Since $$u$$ decreased, $$\\theta$$ must increase to keep the product $$u^2 \\theta$$ constant. The angle of attack __increases__.

__Engine power:__ The drag force is proportional to $$u^2$$, and the engine must supply the force to overcome drag at airspeed $$u$$. The engine power equals drag force times airspeed:

$$P = F_{\\text{drag}} \\cdot u \\propto u^2 \\cdot u = u^3.$$

Since $$u < v$$, the required engine power __decreases__.

The answer is C.`,
  },
  {
    n: 17, correct: 'E',
    statement: `A pogo stick is modeled as a massless spring of spring constant $$k$$ attached to the bottom of a block of mass $$m$$. The pogo stick is dropped with the spring pointing downward and hits the ground with speed $$v$$. At the moment of the collision, the free end of the spring sticks permanently to the ground.

During the subsequent oscillations, the maximum speed of the block is`,
    choices: {
      A: '$$v$$',
      B: '$$v + 2mg^2/kv$$',
      C: '$$v + mg^2/kv$$',
      D: '$$\\sqrt{v^2 + 2mg^2/k}$$',
      E: '$$\\sqrt{v^2 + mg^2/k}$$',
    },
    figures: [F18B(17)], topics: ['Mechanics'], tags: ['oscillations/SHM', 'springs', 'energy conservation'],
    solution: `When the spring tip hits the ground and sticks, the spring is at its natural (unextended) length $$\\ell$$ and the block has speed $$v$$ downward. The system then oscillates as a vertical spring-mass system.

The equilibrium position for vertical oscillations is where the net force on the block is zero: at a displacement $$\\delta = mg/k$$ below the natural length point. At the moment of sticking, the block is at the natural length position, which is $$\\delta = mg/k$$ __above__ equilibrium.

In a spring-mass system, maximum speed occurs at the equilibrium position. The energy at the moment of sticking (measured relative to the equilibrium position) is:

$$E = \\frac{1}{2}mv^2 + \\frac{1}{2}k\\delta^2 = \\frac{1}{2}mv^2 + \\frac{1}{2}k\\left(\\frac{mg}{k}\\right)^2 = \\frac{1}{2}mv^2 + \\frac{m^2g^2}{2k}.$$

At the equilibrium (maximum speed), all this energy is kinetic:

$$\\frac{1}{2}mv_{\\max}^2 = \\frac{1}{2}mv^2 + \\frac{m^2g^2}{2k}$$

$$v_{\\max} = \\sqrt{v^2 + \\frac{mg^2}{k}}.$$

The answer is E.`,
  },
  {
    n: 18, correct: 'B',
    statement: `A spring of relaxed length $$\\ell_1$$ and spring constant $$k_1$$ is placed 'in parallel' with a spring of relaxed length $$\\ell_2$$ and spring constant $$k_2$$. A force $$F$$ is applied to each end.

The combination of the springs acts like a single spring with spring constant $$k$$ and relaxed length $$\\ell$$ where`,
    choices: {
      A: '$$k = k_1 + k_2$$ and $$\\ell = \\ell_1\\ell_2/(\\ell_1 + \\ell_2)$$',
      B: '$$k = k_1 + k_2$$ and $$\\ell = (\\ell_1 k_1 + \\ell_2 k_2)/(k_1 + k_2)$$',
      C: '$$k = k_1 + k_2$$ and $$\\ell = (\\ell_1 k_2 + \\ell_2 k_1)/(k_1 + k_2)$$',
      D: '$$k = (\\ell_1 k_1 + \\ell_2 k_2)/(\\ell_1 + \\ell_2)$$ and $$\\ell = (\\ell_1 k_1 + \\ell_2 k_2)/(k_1 + k_2)$$',
      E: '$$k = (\\ell_2 k_1 + \\ell_1 k_2)/(\\ell_1 + \\ell_2)$$ and $$\\ell = (\\ell_1 k_2 + \\ell_2 k_1)/(k_1 + k_2)$$',
    },
    figures: [F18B(18)], topics: ['Mechanics'], tags: ['springs', 'statics/equilibrium'],
    solution: `When the two springs are connected in parallel and the combination has length $$x$$, each spring is stretched (or compressed) by an amount equal to $$x$$ minus its own relaxed length. The restoring forces add:

$$F_{\\text{net}} = k_1(x - \\ell_1) + k_2(x - \\ell_2) = (k_1 + k_2)x - (k_1\\ell_1 + k_2\\ell_2).$$

Comparing to the form $$F = k(x - \\ell)$$, we identify:

$$k = k_1 + k_2,$$

$$k\\ell = k_1\\ell_1 + k_2\\ell_2 \\implies \\ell = \\frac{k_1\\ell_1 + k_2\\ell_2}{k_1 + k_2}.$$

This rules out choices D and E (wrong $$k$$) and choices A and C (wrong $$\\ell$$).

The answer is B.`,
  },
  {
    n: 19, correct: 'E',
    statement: `In an experiment to determine the speed of sound, a student measured the distance that a sound wave traveled to be $$75.0 \\pm 2.0$$ cm, and found the time it took the sound wave to travel this distance to be $$2.15 \\pm 0.10$$ ms. Assume the uncertainties are Gaussian. The computed speed of sound should be recorded as`,
    choices: {
      A: '$$348.8 \\pm 0.5 \\text{ m/s}$$',
      B: '$$348.8 \\pm 0.8 \\text{ m/s}$$',
      C: '$$349 \\pm 8 \\text{ m/s}$$',
      D: '$$349 \\pm 15 \\text{ m/s}$$',
      E: '$$349 \\pm 19 \\text{ m/s}$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'data analysis'],
    solution: `The speed is $$v = d/t$$. Since uncertainties are Gaussian (independent), the fractional uncertainty in $$v$$ is found by adding fractional uncertainties in quadrature:

$$\\frac{\\Delta v}{v} = \\sqrt{\\left(\\frac{\\Delta d}{d}\\right)^2 + \\left(\\frac{\\Delta t}{t}\\right)^2} = \\sqrt{\\left(\\frac{2.0}{75.0}\\right)^2 + \\left(\\frac{0.10}{2.15}\\right)^2}.$$

Computing each term:

$$\\frac{2.0}{75.0} \\approx 0.0267 \\quad (2.67\\%)$$

$$\\frac{0.10}{2.15} \\approx 0.0465 \\quad (4.65\\%)$$

$$\\frac{\\Delta v}{v} = \\sqrt{(0.0267)^2 + (0.0465)^2} = \\sqrt{0.000713 + 0.00216} \\approx \\sqrt{0.00287} \\approx 0.0536 \\quad (5.36\\%).$$

The best estimate of $$v$$ is $$75.0 \\text{ cm} / 2.15 \\text{ ms} \\approx 349 \\text{ m/s}$$. The absolute uncertainty is

$$\\Delta v = 0.0536 \\times 349 \\approx 19 \\text{ m/s.}$$

The answer is E.`,
  },
  {
    n: 20, correct: 'A',
    statement: `A massive, uniform, flexible string of length $$L$$ is placed on a horizontal table of length $$L/3$$ that has a coefficient of friction $$\\mu_s = 1/7$$, so equal lengths $$L/3$$ of string hang freely from both sides of the table. The string passes over the edges of the table on smooth, frictionless, curved surfaces.

Now suppose that one of the hanging ends of the string is pulled a distance $$x$$ downward, then released at rest. Neither end of the string ever touches the ground in this problem. The maximum value of $$x$$ so that the string does not slip off of the table is`,
    choices: {
      A: '$$L/42$$',
      B: '$$L/21$$',
      C: '$$L/14$$',
      D: '$$2L/21$$',
      E: '$$3L/14$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['statics/equilibrium', 'friction', 'tension'],
    solution: `Let the total mass of the string be $$M$$. After pulling one end down by $$x$$, one hanging side has length $$L/3 + x$$ and the other has length $$L/3 - x$$. The on-table portion still has length $$L/3$$ and mass $$M/3$$.

The tension at each edge equals the weight of the corresponding hanging section. The tension difference pulling the string to one side is

$$\\Delta F = \\frac{(L/3 + x)Mg}{L} - \\frac{(L/3 - x)Mg}{L} = \\frac{2xMg}{L}.$$

The only force that can resist this imbalance is static friction from the table, which acts on the $$L/3$$ portion lying on the table. The maximum static friction force is

$$f_{s,\\max} = \\mu_s \\cdot \\frac{Mg}{3} = \\frac{1}{7} \\cdot \\frac{Mg}{3} = \\frac{Mg}{21}.$$

For the string to remain stationary after being released, the tension difference must not exceed maximum friction:

$$\\frac{2xMg}{L} \\leq \\frac{Mg}{21} \\implies x \\leq \\frac{L}{42}.$$

The answer is A.`,
  },
  {
    n: 21, correct: 'B',
    statement: `A uniform bar of length $$L$$ and mass $$M$$ is supported by a fixed pivot a distance $$x$$ from its center. The bar is released from rest from a horizontal position. The period of the resulting oscillations is minimal when`,
    choices: {
      A: '$$x = L/2$$',
      B: '$$x = L/(2\\sqrt{3})$$',
      C: '$$x = L/4$$',
      D: '$$x = L/(4\\sqrt{3})$$',
      E: '$$x = L/12$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['oscillations/SHM', 'rotational dynamics', 'moment of inertia'],
    solution: `The bar is a physical pendulum pivoted at distance $$x$$ from the center. The period is

$$T = 2\\pi\\sqrt{\\frac{I}{Mgx}},$$

where $$I$$ is the moment of inertia about the pivot. By the parallel axis theorem:

$$I = \\frac{ML^2}{12} + Mx^2.$$

To minimize $$T$$, minimize $$I/(Mgx) = (L^2/12 + x^2)/x$$. Let $$f(x) = x + L^2/(12x)$$. Taking the derivative and setting it to zero:

$$f'(x) = 1 - \\frac{L^2}{12x^2} = 0 \\implies x^2 = \\frac{L^2}{12} \\implies x = \\frac{L}{2\\sqrt{3}}.$$

(This can also be found by AM-GM: $$x + L^2/(12x) \\geq 2\\sqrt{x \\cdot L^2/(12x)} = L/\\sqrt{3}$$, with equality when $$x = L^2/(12x)$$, i.e., $$x = L/(2\\sqrt{3})$$.)

The answer is B.`,
  },
  {
    n: 22, correct: 'B',
    statement: `Two particles of mass $$m$$ are connected by pulleys as shown. The mass on the left is given a small horizontal velocity, and oscillates back and forth. The mass on the right`,
    choices: {
      A: 'remains at rest',
      B: 'oscillates vertically, and with a net upward motion',
      C: 'oscillates vertically, and with a net downward motion',
      D: 'oscillates vertically, with no net motion',
      E: 'oscillates horizontally, with no net motion',
    },
    figures: [F18B(22)], topics: ['Mechanics'], tags: ['pulleys/tension', 'oscillations/SHM', 'statics/equilibrium'],
    solution: `The pulley system converts the string tension — regardless of the direction in which it pulls the left mass — into an equal upward force on the right mass. So the right mass can only move vertically (ruling out E), and its motion is driven by changes in the string tension (ruling out A, since the oscillating left mass causes tension to vary).

Now consider the time-averaged behavior. Suppose for contradiction that the right mass oscillates with no net vertical displacement. Then, averaged over one oscillation, the right mass is stationary, and the average upward tension force on it equals $$mg$$.

The same tension acts on the left mass (via the string). But the left mass is also moving horizontally, so the tension has a horizontal component as well. If the __vertical__ component averages to $$mg$$ while there is also a nonzero horizontal component, the average magnitude of the tension must exceed $$mg$$. This contradicts $$\\langle T \\rangle = mg$$ (required to support the right mass with zero average vertical acceleration).

To resolve this contradiction, the average tension must be greater than $$mg$$, so the right mass experiences a net upward force on average and drifts upward while oscillating.

The answer is B.`,
  },
  {
    n: 23, correct: 'A',
    statement: `Two particles with mass $$m_1$$ and $$m_2$$ are connected by a massless rigid rod of length $$L$$ and placed on a horizontal frictionless table. At time $$t = 0$$, the first mass receives an impulse perpendicular to the rod, giving it speed $$v$$. At this moment, the second mass is at rest. The next time the second mass is at rest is`,
    choices: {
      A: '$$t = 2\\pi L/v$$',
      B: '$$t = \\pi(m_1 + m_2)L/m_2 v$$',
      C: '$$t = 2\\pi m_2 L/(m_1 + m_2)v$$',
      D: '$$t = 2\\pi m_1 m_2 L/(m_1 + m_2)^2 v$$',
      E: '$$t = 2\\pi m_1 L/(m_1 + m_2)v$$',
    },
    figures: [], topics: ['Mechanics'], tags: ['momentum conservation', 'rotational dynamics', 'rigid body kinematics'],
    solution: `The motion of the rigid rod system is the superposition of:

1. __Uniform translation__ of the center of mass at velocity $$v_{cm} = m_1 v/(m_1 + m_2)$$.

2. __Rotation__ about the center of mass at angular velocity $$\\omega$$.

The center of mass is at distances $$r_1 = m_2 L/(m_1 + m_2)$$ from $$m_1$$ and $$r_2 = m_1 L/(m_1 + m_2)$$ from $$m_2$$.

At $$t = 0$$, $$m_1$$ has speed $$v$$ and $$m_2$$ has speed $$0$$. The velocity of $$m_1$$ in the lab is the sum of $$v_{cm}$$ and the rotational contribution $$r_1\\omega$$:

$$v = v_{cm} + r_1\\omega = \\frac{m_1 v}{m_1 + m_2} + \\frac{m_2 L}{m_1 + m_2}\\omega.$$

Solving: $$\\omega = v/L$$.

At $$t = 0$$, $$m_2$$'s velocity is $$v_{cm} - r_2\\omega = \\frac{m_1 v}{m_1+m_2} - \\frac{m_1 L}{m_1+m_2}\\cdot\\frac{v}{L} = 0$$. This is consistent.

The velocity of $$m_2$$ is zero again when its rotational velocity exactly cancels $$v_{cm}$$ — which happens after one complete revolution of the rotation (i.e., one period):

$$t = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{v/L} = \\frac{2\\pi L}{v}.$$

The answer is A.`,
  },
  {
    n: 24, correct: 'E',
    statement: `A particle of mass $$m$$ is placed at the center of a hemispherical shell of radius $$R$$ and mass density $$\\sigma$$, where $$\\sigma$$ has dimensions of kg/m$$^2$$.

The gravitational force of the shell on the particle is`,
    choices: {
      A: '$$\\dfrac{1}{3}\\pi Gm\\sigma$$',
      B: '$$\\dfrac{2}{3}\\pi Gm\\sigma$$',
      C: '$$\\dfrac{1}{\\sqrt{2}}\\pi Gm\\sigma$$',
      D: '$$\\dfrac{3}{4}\\pi Gm\\sigma$$',
      E: '$$\\pi Gm\\sigma$$',
    },
    figures: [F18B(24)], topics: ['Mechanics'], tags: ['gravitation', 'symmetry', 'shell theorem'],
    solution: `By Newton's third law, the force of the shell on the particle equals the force of the particle on the shell. Since every point on the shell is at the same distance $$R$$ from the particle, the particle exerts the same gravitational field strength on every unit area of the shell:

$$P = \\frac{Gm\\sigma}{R^2}$$

(this acts as a pressure pushing the shell outward from the particle, or equivalently — by reversal — as a pressure pulling the shell inward toward the particle).

To find the net force from this uniform pressure on the curved hemispherical surface, use the following trick: imagine sealing the hemisphere with a flat circular lid and filling the closed volume with a gas at constant pressure $$P$$. Since the closed hemisphere is in static equilibrium with itself, the net force on the curved surface equals and opposes the net force on the flat lid:

$$F_{\\text{lid}} = P \\cdot A_{\\text{lid}} = \\frac{Gm\\sigma}{R^2} \\cdot \\pi R^2 = \\pi Gm\\sigma.$$

This is the net force on the particle directed toward the flat face of the hemisphere.

The answer is E.`,
  },
  {
    n: 25, correct: 'D',
    statement: `A student is measuring the surface area of a cylindrical wire. The student measures the radius of the wire to be $$1 \\pm 0.1$$ cm using a ruler and the length of the wire to be $$1.00 \\pm 0.01$$ m using a meter-stick. The precision of their result can be increased in several ways.

1: Upgrade the ruler to a caliper with uncertainty 0.01 cm.

2: Upgrade the meter-stick to a tape measure with uncertainty 0.001 m.

3: Repeat the measurement independently ten times and average the results.

How do the resulting uncertainties of the measurements compare?`,
    choices: {
      A: 'Method 3 has the lowest uncertainty, while methods 1 and 2 have the same uncertainty',
      B: 'Method 3 has the highest uncertainty, while methods 1 and 2 have the same uncertainty',
      C: 'Method 1 has the highest uncertainty, and method 2 has the lowest',
      D: 'Method 2 has the highest uncertainty, and method 1 has the lowest',
      E: 'Method 2 has the highest uncertainty, and method 3 has the lowest',
    },
    figures: [], topics: ['Mechanics'], tags: ['error analysis', 'uncertainty propagation', 'data analysis'],
    solution: `The lateral surface area of the cylinder is $$A = 2\\pi r \\ell$$. For a product, relative uncertainties add in quadrature.

__Baseline:__ Fractional uncertainty in $$r$$: $$0.1/1 = 10\\%$$. Fractional uncertainty in $$\\ell$$: $$0.01/1.00 = 1\\%$$. Combined: $$\\sqrt{(10\\%)^2 + (1\\%)^2} \\approx 10\\%$$.

__Method 1__ (caliper, $$\\Delta r = 0.01$$ cm): Fractional uncertainty in $$r$$ becomes $$0.01/1 = 1\\%$$. Combined: $$\\sqrt{(1\\%)^2 + (1\\%)^2} \\approx 1.4\\%$$.

__Method 2__ (tape measure, $$\\Delta\\ell = 0.001$$ m): Fractional uncertainty in $$\\ell$$ becomes $$0.001/1.00 = 0.1\\%$$. But the ruler's uncertainty in $$r$$ is still $$10\\%$$. Combined: $$\\sqrt{(10\\%)^2 + (0.1\\%)^2} \\approx 10\\%$$.

__Method 3__ (average 10 trials): Averaging reduces the uncertainty by $$1/\\sqrt{10}$$. Both measurements' fractional uncertainties are reduced: $$r$$ becomes $$10\\%/\\sqrt{10} \\approx 3.16\\%$$ and $$\\ell$$ becomes $$1\\%/\\sqrt{10} \\approx 0.32\\%$$. Combined: $$\\sqrt{(3.16\\%)^2 + (0.32\\%)^2} \\approx 3.2\\%$$.

Ranking: Method 1 ($$\\approx 1.4\\%$$) $$<$$ Method 3 ($$\\approx 3.2\\%$$) $$<$$ Method 2 ($$\\approx 10\\%$$).

Method 2 has the highest uncertainty and Method 1 has the lowest.

The answer is D.`,
  },
]
