// Digitized 2022 F=ma Exam B questions.
// Sources:
//   Exam:      work/fma/fma-2022-b.pdf  (text: work/fma/fma-2022-b.txt)
//   Solutions: work/fma/fma-2022-b-sol.pdf  (text: work/fma/fma-2022-b-sol.txt)
//   Figures:   work/figure_manifest.json, key "fma-2022-b" — already cropped and uploaded.
//
// Correct-answer convention: in the solutions PDF the correct choice's letter is
// NOT wrapped in parentheses; all wrong choices appear as "(A)", "(B)", etc.
// Visually confirmed on rendered PDF pages for every question.
//
// Answer key: D A C A E D A E C B E A D E B B B D E D B D C C D
//
// Ambiguous / notes:
//   Q23: AAPT's printed solution signs off "giving choice (B)", but the boxed
//        letter on the exam is (C) -- and (C) is the ellipse the solution spends
//        its whole argument deriving, while (B) is a pair of crossed straight
//        lines. The prose is a slip in the source; the key is C.
//
// Figure notes:
//   Q13: has a stem figure; the answer choices are text (heights), not diagrams —
//        no choiceFigures.  The description text in each choice was garbled in the
//        PDF but the LaTeX expressions are clear from context.
//   Q15: choices (A)–(D) show a diagram of an orbiting spacecraft with a thrust
//        direction arrow; these were not split into per-choice crops.  Short factual
//        descriptions are used for (A)–(D) and the stem figure carries the context.
//   Q16: same situation — block on incline with labeled points; stem figure used.
//   Q23: choices are small phase-space graphs; no per-choice crops were made.
//        Brief descriptions used.

const F22B = n =>
  `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2022-b'
export const questions = [
  {
    n: 1, correct: 'D',
    statement: `A ball is held a height $$h$$ above a slope, which is at an angle $$45^\\circ$$ from the horizontal. The ball is dropped from rest. Assume the ball bounces off the slope perfectly elastically. What is the distance between its first and second impact points?`,
    choices: {
      A: '$$2h$$',
      B: '$$2\\sqrt{2}\\,h$$',
      C: '$$4h$$',
      D: '$$4\\sqrt{2}\\,h$$',
      E: '$$8h$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['projectile motion', 'kinematics-2d', 'energy conservation'],
    solution: `By conservation of energy the ball's speed when it first hits the slope is $$v = \\sqrt{2gh}$$. Because the bounce is perfectly elastic and the slope is at $$45^\\circ$$, the velocity is redirected from straight down to purely horizontal (the component along the slope is unchanged; the component perpendicular to the slope reverses sign, and the geometry of a $$45^\\circ$$ surface turns that into horizontal motion).

After the bounce, let $$t$$ be the time to the second impact. With axes parallel and perpendicular to the slope,

$$\\Delta x_{\\parallel} = vt, \\qquad \\Delta x_{\\perp} = -\\tfrac{1}{2}(g/\\sqrt{2})t^2.$$

The second impact occurs when the ball is back on the slope, i.e., $$\\Delta x_{\\parallel} = -\\Delta x_{\\perp}$$, giving

$$vt = \\frac{g}{2\\sqrt{2}}t^2 \\implies t = \\frac{2\\sqrt{2}\\,v}{g}.$$

The straight-line distance between the two impact points is $$\\sqrt{2}\\,\\Delta x_{\\parallel}$$:

$$d = \\sqrt{2}\\,v\\cdot\\frac{2\\sqrt{2}\\,v}{g} = \\frac{4v^2}{g} = \\frac{4(2gh)}{g} = 4\\sqrt{2}\\,h.$$

The answer is D.`,
  },
  {
    n: 2, correct: 'A',
    statement: `A massless wheel of radius $$R$$ has four small masses $$M$$ placed evenly along its rim. Let the moment of inertia for rotations about the center of the wheel, in the plane of the wheel, be $$I_0$$.

Now consider rotations about the two axes shown (one passing through two opposite masses, one at $$45^\\circ$$ to that), with corresponding moments of inertia $$I_1$$ and $$I_2$$. Which of the following is true?`,
    choices: {
      A: '$$I_1 = I_2 = I_0/2$$',
      B: '$$I_1 = I_2 = I_0/\\sqrt{2}$$',
      C: '$$I_1 = I_2 = I_0$$',
      D: '$$I_1 = I_0/2,\\quad I_2 = I_0/\\sqrt{2}$$',
      E: '$$I_1 = I_0,\\quad I_2 = I_0/\\sqrt{2}$$',
    },
    figures: [F22B(2)], topics: ['Mechanics'],
    tags: ['moment of inertia', 'rotational motion'],
    solution: `The four masses sit at distance $$R$$ from the center, so $$I_0 = 4MR^2$$.

For the axis $$I_1$$ (passing through two opposite masses): the two masses on the axis contribute zero, and the other two are each at distance $$R$$, so $$I_1 = 2MR^2 = I_0/2$$.

For the axis $$I_2$$ (at $$45^\\circ$$, so all four masses are at perpendicular distance $$R/\\sqrt{2}$$ from the axis): $$I_2 = 4M(R/\\sqrt{2})^2 = 2MR^2 = I_0/2$$.

Therefore $$I_1 = I_2 = I_0/2$$. The answer is A.`,
  },
  {
    n: 3, correct: 'C',
    statement: `Four evenly spaced points are marked on a massless seesaw, as shown. Two blocks, of masses 5 kg and 7 kg, are placed on the seesaw, so that it balances when the fulcrum is at point IV. (The diagram is not drawn to scale.) Now suppose the fulcrum is moved to point II. How much mass should be placed at point I so that the seesaw again balances?`,
    choices: {
      A: '12 kg',
      B: '18 kg',
      C: '24 kg',
      D: '36 kg',
      E: 'There is not enough information to decide.',
    },
    figures: [F22B(3)], topics: ['Mechanics'],
    tags: ['statics/equilibrium', 'torque', 'center of mass'],
    solution: `It might seem that the positions of the 5 kg and 7 kg blocks are unknown, but that doesn't affect the answer. Because the seesaw balances with the fulcrum at point IV, the center of mass of the two-block system must be directly above point IV. Therefore the combined weight $$W = (5+7) \\times 10 = 120$$ N can be treated as a single force acting at point IV.

Label the points I, II, III, IV evenly spaced with spacing $$d$$. When the fulcrum is moved to point II, point IV is a distance $$2d$$ to one side. Taking torques about point II:

$$120\\text{ N} \\times 2d = F_{\\text{new}} \\times d$$

$$F_{\\text{new}} = 240\\text{ N} \\implies m = 24\\text{ kg}.$$

The answer is C.`,
  },
  {
    n: 4, correct: 'A',
    statement: `A firework explodes, sending shells in all directions in a vertical plane, as shown. Suppose the shells are all launched with the same speed, and ignore air resistance, but not gravity. A long time later, but before any of the shells hit the ground, what shape do the shells make?`,
    choices: { A: '', B: '', C: '', D: '', E: '' },
    choiceFigures: {
      A: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q04A.png',
      B: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q04B.png',
      C: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q04C.png',
      D: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q04D.png',
      E: 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q04E.png',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['projectile motion', 'kinematics-2d', 'symmetry'],
    solution: `In the absence of gravity all shells move at the same speed $$v_0$$, so they always lie on a circle of radius $$v_0 t$$ centered on the explosion point.

Gravity adds the same downward displacement $$\\tfrac{1}{2}gt^2$$ to every shell regardless of its launch direction. Shifting every point on a circle by the same vector produces another circle of the same radius, just displaced downward.

Therefore the shells always form a circle (just shifted downward from the launch point as time passes). The answer is A.`,
  },
  {
    n: 5, correct: 'E',
    statement: `A swimmer swims at speed $$v$$ relative to still water. A river flows from a pier to a lake, with speed $$u$$. If the swimmer swims downstream from the pier to the lake, then back upstream, what was their average speed during the trip?`,
    choices: {
      A: '$$v$$',
      B: '$$\\sqrt{v^2 - u^2}$$',
      C: '$$\\dfrac{(v-u)^2}{v}$$',
      D: '$$\\dfrac{(v+u)^2}{v}$$',
      E: '$$\\dfrac{v^2 - u^2}{v}$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['kinematics-2d', 'relative motion', '1d kinematics'],
    solution: `Let $$d$$ be the one-way distance from pier to lake. The swimmer's speed relative to the ground is $$v + u$$ downstream and $$v - u$$ upstream.

Total distance: $$2d$$. Total time:

$$t = \\frac{d}{v+u} + \\frac{d}{v-u} = \\frac{d(v-u) + d(v+u)}{(v+u)(v-u)} = \\frac{2dv}{v^2 - u^2}.$$

Average speed:

$$\\bar{v} = \\frac{2d}{t} = \\frac{2d \\cdot (v^2 - u^2)}{2dv} = \\frac{v^2 - u^2}{v}.$$

The answer is E.`,
  },
  {
    n: 6, correct: 'D',
    statement: `A block of mass $$m$$ is at rest on a frictionless table. It is pushed horizontally by a constant force $$F$$, and has total momentum $$p$$ when it reaches the end of the table. If a block of mass $$2m$$ is pushed across the table in the same way, also starting from rest, what is its momentum when it reaches the end of the table?`,
    choices: {
      A: '$$p/2$$',
      B: '$$p/\\sqrt{2}$$',
      C: '$$p$$',
      D: '$$\\sqrt{2}\\,p$$',
      E: '$$2p$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['work-energy theorem', 'momentum conservation', 'energy conservation'],
    solution: `Since the same force acts over the same distance, the work done is the same in both cases: $$W = F \\cdot L$$.

The kinetic energy is related to momentum by $$K = p^2/(2m)$$, so

$$p = \\sqrt{2mK} = \\sqrt{2m \\cdot FL}.$$

For mass $$2m$$: $$p' = \\sqrt{2(2m) \\cdot FL} = \\sqrt{2}\\,\\sqrt{2m \\cdot FL} = \\sqrt{2}\\,p.$$

The answer is D.`,
  },
  {
    n: 7, correct: 'A',
    statement: `Two blocks of unequal mass $$M$$ and $$m$$ are hung from the ends of a massless, frictionless pulley, as shown. The blocks are held in place, and the entire pulley is mounted on a sensitive scale.

After the blocks are released from rest, but before either has fallen off the pulley, what is the scale reading?`,
    choices: {
      A: 'It is less than $$(M + m)g$$.',
      B: 'It is equal to $$(M + m)g$$.',
      C: 'It is more than $$(M + m)g$$.',
      D: 'It is initially less than $$(M + m)g$$, then approaches $$(M + m)g$$.',
      E: 'It is initially more than $$(M + m)g$$, then approaches $$(M + m)g$$.',
    },
    figures: [F22B(7)], topics: ['Mechanics'],
    tags: ['newton\'s laws', 'pulleys/tension', 'free-body diagrams'],
    solution: `Once released, the heavier block accelerates downward and the lighter block accelerates upward. The center of mass of the two-block system therefore accelerates downward with some acceleration $$a_{cm} > 0$$.

Applying Newton's second law to the whole system (scale reading $$N$$ acts upward, gravity $$(M+m)g$$ acts downward):

$$(M + m)a_{cm,\\text{down}} = (M + m)g - N$$

Since $$a_{cm} > 0$$, we have $$N < (M + m)g$$. The acceleration is constant (no time dependence), so the reading is always less than $$(M+m)g$$.

The answer is A.`,
  },
  {
    n: 8, correct: 'E',
    statement: `A ball is launched with speed $$v$$ at an angle $$\\theta$$ to a fixed ramp, which itself makes a $$45^\\circ$$ angle with the horizontal. Assume that when the ball hits the ramp, it bounces elastically and frictionlessly. For what value of $$\\theta$$ will the ball bounce off the ramp two times, and then return to its original launch point?`,
    choices: {
      A: '$$9.5^\\circ$$',
      B: '$$11.3^\\circ$$',
      C: '$$14.0^\\circ$$',
      D: '$$14.5^\\circ$$',
      E: '$$18.4^\\circ$$',
    },
    figures: [F22B(8)], topics: ['Mechanics'],
    tags: ['projectile motion', 'kinematics-2d', 'reference frames'],
    solution: `Work in a rotated coordinate system with axes parallel and perpendicular to the ramp. In these coordinates gravity has components $$g/\\sqrt{2}$$ perpendicular into the ramp and $$g/\\sqrt{2}$$ along the ramp (directed downward along the slope). The initial velocity has components $$v\\sin\\theta$$ perpendicular to the ramp and $$v\\cos\\theta$$ along the ramp.

Each bounce reverses the perpendicular component while leaving the parallel component unchanged. The perpendicular motion is like a 1D bounce problem: the ball returns to the ramp each time the perpendicular displacement is zero. The time between consecutive bounces is

$$\\Delta t = \\frac{2v\\sin\\theta}{g/\\sqrt{2}} = \\frac{2\\sqrt{2}\\,v\\sin\\theta}{g}.$$

Three contacts occur (two bounces plus the return to the launch point, which counts as a third "landing"), so the total time is $$t = 3\\Delta t = \\frac{6\\sqrt{2}\\,v\\sin\\theta}{g}$$.

For the ball to return to the launch point, the net displacement along the ramp must be zero. The velocity along the ramp changes at rate $$g/\\sqrt{2}$$, so after total time $$t$$ the parallel velocity has changed by $$(g/\\sqrt{2})\\,t$$. For the ball to return with the reversed parallel velocity we need

$$\\frac{g}{\\sqrt{2}}\\cdot t = 2v\\cos\\theta.$$

Substituting $$t$$:

$$\\frac{g}{\\sqrt{2}}\\cdot\\frac{6\\sqrt{2}\\,v\\sin\\theta}{g} = 2v\\cos\\theta \\implies 6\\sin\\theta = 2\\cos\\theta \\implies \\tan\\theta = \\frac{1}{3}.$$

$$\\theta = \\arctan(1/3) \\approx 18.4^\\circ.$$

The answer is E.`,
  },
  {
    n: 9, correct: 'C',
    statement: `Billy is leaning on a box of mass 30.0 kg, exerting a force $$35.0^\\circ$$ below the horizontal. If the coefficient of static friction of the box on the ground is $$\\mu_s = 0.400$$, what is the minimum force needed for the box to slide?`,
    choices: {
      A: '120 N',
      B: '147 N',
      C: '203 N',
      D: '224 N',
      E: '342 N',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['friction', 'statics/equilibrium', 'free-body diagrams', 'newton\'s laws'],
    solution: `Let $$F$$ be the magnitude of Billy's force, directed $$35^\\circ$$ below the horizontal. The horizontal component is $$F\\cos 35^\\circ$$ and the downward vertical component is $$F\\sin 35^\\circ$$.

The normal force from the ground must support both the box's weight and Billy's downward push:

$$N = mg + F\\sin 35^\\circ = (30.0)(10) + F\\sin 35^\\circ = 300 + F\\sin 35^\\circ.$$

The maximum static friction force is

$$f_{\\max} = \\mu_s N = 0.400(300 + F\\sin 35^\\circ).$$

The box slides when the horizontal push exceeds friction:

$$F\\cos 35^\\circ \\geq 0.400(300 + F\\sin 35^\\circ).$$

Solving for the minimum $$F$$:

$$F(\\cos 35^\\circ - 0.400\\sin 35^\\circ) = 120$$

$$F = \\frac{120}{\\cos 35^\\circ - 0.400\\sin 35^\\circ} = \\frac{120}{0.819 - 0.229} \\approx \\frac{120}{0.590} \\approx 203\\text{ N}.$$

The answer is C.`,
  },
  {
    n: 10, correct: 'B',
    statement: `Two springs with spring constants 2 N/cm and 4 N/cm are connected in parallel. They are both connected in series to a spring of constant 3 N/cm, as shown. What force must be exerted at the end to extend the system by 1 cm from its relaxed length?`,
    choices: {
      A: '0.5 N',
      B: '2 N',
      C: '3 N',
      D: '6 N',
      E: '9 N',
    },
    figures: [F22B(10)], topics: ['Mechanics'],
    tags: ['springs', 'statics/equilibrium'],
    solution: `The two parallel springs (2 N/cm and 4 N/cm) combine to give an effective spring constant

$$k_{\\parallel} = 2 + 4 = 6\\text{ N/cm}.$$

This parallel combination is in series with the 3 N/cm spring. Springs in series add as reciprocals:

$$\\frac{1}{k_{\\text{total}}} = \\frac{1}{6} + \\frac{1}{3} = \\frac{1}{6} + \\frac{2}{6} = \\frac{3}{6} = \\frac{1}{2}$$

$$k_{\\text{total}} = 2\\text{ N/cm}.$$

For a 1 cm extension: $$F = k_{\\text{total}} \\times 1\\text{ cm} = 2\\text{ N}$$.

The answer is B.`,
  },
  {
    n: 11, correct: 'E',
    statement: `Water with total mass $$M$$ is poured into a cup of cross-sectional area $$A$$. A block of mass $$m$$, whose density is half that of water, is tied to a thin string. The string is attached to the bottom of the cup, and the block floats in the water as shown. The atmospheric pressure is $$P_{\\text{atm}}$$. What is the total pressure force that the water exerts on the bottom of the cup?`,
    choices: {
      A: '$$Mg$$',
      B: '$$(M + m)g$$',
      C: '$$P_{\\text{atm}}A + Mg$$',
      D: '$$P_{\\text{atm}}A + (M + m)g$$',
      E: '$$P_{\\text{atm}}A + (M + 2m)g$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['fluid statics', 'buoyancy', 'free-body diagrams'],
    solution: `Consider the block-plus-water system together. The external forces are:
- Atmospheric pressure, pushing down: $$P_{\\text{atm}}A$$ downward.
- Gravity: $$(M + m)g$$ downward.
- The upward pressure force from the base of the cup: $$F_{\\text{base}}$$ upward.

(The string tension is internal to the cup structure once the cup is the system boundary, but more carefully: the cup wall and base exert the string tension as a reaction; treating the block-plus-water as the system, the cup exerts $$F_{\\text{base}}$$ up from the bottom and $$P_{\\text{atm}}A$$ down through the open top.)

The block is stationary. The buoyant force on the block equals $$\\rho_w V_b g = 2mg$$ (since water is twice as dense as the block), directed upward. The string must then pull the block down with tension $$T = 2mg - mg = mg$$. By Newton's third law the string pulls the water (and cup bottom) upward with $$mg$$. So the net downward load on the cup bottom through the water column is $$(M + m)g + P_{\\text{atm}}A + mg = (M + 2m)g + P_{\\text{atm}}A$$; the base provides this upward.

Equivalently: if the block were replaced by water of the same volume $$2m/\\rho_w$$, the total water mass would be $$M + 2m$$, and the base force would be $$P_{\\text{atm}}A + (M + 2m)g$$. Since the pressure distribution in the water is unchanged by this substitution, the answer is the same.

The answer is E.`,
  },
  {
    n: 12, correct: 'A',
    statement: `Two identical bricks of mass $$m$$ are attached to two frictionless pulleys by a massless string, on a fixed slope of angle $$\\theta$$ to the horizontal, as shown. Suppose that the coefficient of static friction between the lower block and the slope is $$\\mu$$, and all other surfaces are frictionless. What is the minimum value of $$\\mu$$ so that the blocks can stay static?`,
    choices: {
      A: '$$\\dfrac{1}{2}\\tan\\theta$$',
      B: '$$\\dfrac{2}{3}\\tan\\theta$$',
      C: '$$\\tan\\theta$$',
      D: '$$\\dfrac{3}{2}\\tan\\theta$$',
      E: '$$2\\tan\\theta$$',
    },
    figures: [F22B(12)], topics: ['Mechanics'],
    tags: ['statics/equilibrium', 'pulleys/tension', 'friction', 'free-body diagrams'],
    solution: `Let $$T$$ be the tension throughout the single string. The setup is a block-and-tackle: the fixed pulley at the top of the slope redirects the rope, and the upper brick carries a movable pulley around which the rope loops.

__Upper brick (movable pulley, two rope segments):__ Both segments of the rope pull the upper brick up the slope. Since the slope below the upper brick is frictionless, force balance along the slope gives:
$$2T = mg\\sin\\theta \\implies T = \\frac{mg\\sin\\theta}{2}.$$

__Lower brick (single rope segment):__ The rope pulls the lower brick up the slope with force $$T$$. Gravity pulls it down with $$mg\\sin\\theta$$. Since $$T = mg\\sin\\theta/2 < mg\\sin\\theta$$, the rope alone cannot hold it; static friction $$f$$ acts up the slope.

Force balance along the slope:
$$T + f = mg\\sin\\theta \\implies f = mg\\sin\\theta - \\frac{mg\\sin\\theta}{2} = \\frac{mg\\sin\\theta}{2}.$$

For the minimum $$\\mu$$, set $$f = \\mu_s N = \\mu_s mg\\cos\\theta$$:
$$\\mu_s mg\\cos\\theta = \\frac{mg\\sin\\theta}{2} \\implies \\mu_s = \\frac{1}{2}\\tan\\theta.$$

The answer is A.`,
  },
  {
    n: 13, correct: 'D',
    statement: `A ballistic pendulum is designed as shown below. A uniform ball of mass $$m$$ and radius $$r$$ is attached to a massless rigid rod, so that its center is a distance $$\\ell$$ from the ceiling. The ball has a small tunnel hollowed out. A small block of mass $$m$$ and speed $$v$$ goes into the tunnel and collides at the center of the ball, perfectly inelastically. Subsequently, to what maximum height does the block rise?`,
    choices: {
      A: '$$\\dfrac{v^2}{8g}$$',
      B: '$$\\dfrac{v^2}{8g\\!\\left(1 + r^2/5\\ell^2\\right)^2}$$',
      C: '$$\\dfrac{v^2}{8g\\!\\left(1 + 2r^2/5\\ell^2\\right)^2}$$',
      D: '$$\\dfrac{v^2}{8g\\!\\left(1 + r^2/5\\ell^2\\right)}$$',
      E: '$$\\dfrac{v^2}{8g\\!\\left(1 + 2r^2/5\\ell^2\\right)}$$',
    },
    figures: [F22B(13)], topics: ['Mechanics'],
    tags: ['angular momentum conservation', 'collisions', 'oscillations/SHM', 'energy conservation', 'moment of inertia'],
    solution: `__Step 1 — Collision (angular momentum conservation about the ceiling pivot):__

The rod constrains the system, so the ceiling pivot exerts an impulsive force during the collision. Linear momentum is not conserved, but angular momentum about the pivot is. Before the collision, only the block moves, with angular momentum $$L = mv\\ell$$ (the block moves horizontally and the pivot is $$\\ell$$ above the ball center).

After the collision, the ball (moment of inertia about its own center: $$\\tfrac{2}{5}mr^2$$ for a solid ball, but the tunnel makes it hollow; since the tunnel is small and the block fills it, we can treat the ball as uniform for this) plus the embedded block rotate together. The moment of inertia about the pivot is

$$I = \\frac{2}{5}mr^2 + m\\ell^2 + m\\ell^2 = \\frac{2}{5}mr^2 + 2m\\ell^2.$$

Angular momentum conservation: $$mv\\ell = I\\omega$$.

$$\\omega = \\frac{mv\\ell}{\\tfrac{2}{5}mr^2 + 2m\\ell^2} = \\frac{v\\ell}{2\\ell^2 + \\tfrac{2}{5}r^2}.$$

__Step 2 — Energy conservation after collision:__

The combined system (total mass $$2m$$) swings up. At the highest point, all kinetic energy converts to potential energy. The center of mass of the (ball + block) system is at distance $$\\ell$$ from the pivot (both are at the same point for a small block at the ball center). Maximum height $$h$$ of the center of mass:

$$2mgh = \\frac{1}{2}I\\omega^2 = \\frac{L^2}{2I} = \\frac{m^2v^2\\ell^2}{2\\left(2m\\ell^2 + \\tfrac{2}{5}mr^2\\right)}.$$

$$h = \\frac{mv^2\\ell^2}{4\\ell^2 m\\left(2 + \\tfrac{r^2}{5\\ell^2}\\cdot\\frac{1}{1}\\right) \\cdot 2} = \\frac{v^2}{8g\\!\\left(1 + \\dfrac{r^2}{5\\ell^2}\\right)}.$$

More carefully: $$2mgh = \\frac{m^2v^2\\ell^2}{2m(2\\ell^2 + \\frac{2r^2}{5})} = \\frac{mv^2\\ell^2}{4\\ell^2 + \\frac{4r^2}{5}}$$, so

$$h = \\frac{v^2\\ell^2}{8g\\ell^2\\!\\left(1 + \\dfrac{r^2}{5\\ell^2}\\right)} = \\frac{v^2}{8g\\!\\left(1 + \\dfrac{r^2}{5\\ell^2}\\right)}.$$

The answer is D.`,
  },
  {
    n: 14, correct: 'E',
    statement: `A cylinder of water is suspended in a space station. Under the influence of surface tension, the cylinder splits into droplets. After a short time, viscosity causes the droplets to settle into static shapes. Neglect the effect of evaporation. Compared to the original cylinder, the final set of droplets will have`,
    choices: {
      A: 'Almost exactly the same volume and surface area.',
      B: 'More volume, but almost exactly the same surface area.',
      C: 'Less volume, but almost exactly the same surface area.',
      D: 'More surface area, but almost exactly the same volume.',
      E: 'Less surface area, but almost exactly the same volume.',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['surface tension', 'energy conservation'],
    solution: `Water is nearly incompressible, so the total volume of water is conserved throughout the process. Volume is almost exactly the same.

The surface tension force causes the cylinder to break up and the droplets to become spherical. Energy is dissipated by viscosity. Since the surface tension energy is proportional to total surface area, and energy is dissipated (not created), the total surface area must decrease. (Spheres minimize surface area for a given volume, so breaking into spherical droplets does reduce surface area compared to a long cylinder.)

The answer is E.`,
  },
  {
    n: 15, correct: 'B',
    statement: `Five astronauts are orbiting Earth in a low circular orbit. They decided to go around the planet following the same orbit, but much faster, to set a new record for orbiting Earth. Four of them thought that they could quickly increase the velocity, then use a jet engine to maintain an orbit of the same shape; in the first four choices below, the red arrow denotes the direction that fuel will flow out of the jet nozzle. The fifth astronaut was skeptical about such a possibility. Who is right?`,
    choices: {
      A: 'Jet nozzle pointed tangentially forward (fuel flows forward, thrust backward — decelerating thrust).',
      B: 'Jet nozzle pointed radially outward (fuel flows outward, thrust inward toward Earth).',
      C: 'Jet nozzle pointed tangentially backward (fuel flows backward, thrust forward — accelerating thrust).',
      D: 'Jet nozzle pointed radially inward toward Earth (fuel flows inward, thrust outward away from Earth).',
      E: 'It is impossible to follow the same orbit faster.',
    },
    figures: [F22B(15)], topics: ['Mechanics'],
    tags: ['circular motion', 'gravitation', 'newton\'s laws'],
    solution: `For circular orbital motion the required centripetal acceleration is $$a_c = v^2/r$$. If the spacecraft moves faster (larger $$v$$) along the same circular orbit (same $$r$$), it needs a larger centripetal (inward) acceleration than gravity alone provides.

Gravity provides a fixed inward acceleration $$GM/r^2$$ for a given orbit radius. To maintain the circular path at higher speed, the engine must supply additional inward (centripetal) force. The thrust must point __inward__ toward Earth. For this, the fuel must flow __outward__ (away from Earth), so the nozzle points radially outward.

The answer is B.`,
  },
  {
    n: 16, correct: 'B',
    statement: `A uniform rectangular block is in static equilibrium on an inclined plane, and experiences gravity, static friction, and the normal force from the plane. Though gravity acts on the entire volume of the block, for the purposes of torque balance, it is equivalent to a single resultant force acting at the block's center of mass. Similarly, while the normal force acts on the entire bottom surface of the block, its torque is equivalent to a resultant force acting at a single point. Which of the following best shows this point?

The labeled points are: A at the lowest point of the bottom side, B directly below the center of mass (projected onto the bottom surface along the direction perpendicular to the incline), C at the midpoint of the bottom side, D directly below the top corner, and E at the highest point of the bottom side.`,
    choices: {
      A: 'Point A, at the lowest point of the bottom side.',
      B: 'Point B, directly below the center of mass.',
      C: 'Point C, at the midpoint of the bottom side.',
      D: 'Point D, directly below the top corner.',
      E: 'Point E, at the highest point of the bottom side.',
    },
    figures: [F22B(16)], topics: ['Mechanics'],
    tags: ['statics/equilibrium', 'torque', 'free-body diagrams'],
    solution: `The block is in static equilibrium under three forces: gravity (acting at the center of mass), static friction (acting along the slope at the base), and the normal force (distributed over the base, equivalent to a single resultant force at some point).

To locate the normal-force resultant, take torques about point B — the point on the bottom surface directly below the center of mass (perpendicular to the slope).

- __Gravity__ acts vertically downward at the center of mass. Its line of action passes directly through B (B is obtained by dropping a perpendicular from the CM to the base), so gravity's moment arm about B is zero. Gravity contributes zero torque about B.
- __Static friction__ acts along the slope at the base. Its line of action lies in the base surface and passes through B (since B is on the base). Friction also contributes zero torque about B.

Since the net torque about B is zero (equilibrium) and both gravity and friction contribute zero torque about B, the normal-force resultant must also produce zero torque about B. This means the resultant normal force acts through point B.

The answer is B.`,
  },
  {
    n: 17, correct: 'B',
    statement: `A box of mass $$M$$ is sliding to the right with velocity $$v$$ on a frictionless table. A small puck of mass $$M/2$$ slides frictionlessly inside the box. Initially, the puck is at the left wall of the box, with a rightward velocity of $$2v$$ with respect to the table. After a time $$T$$, the puck collides elastically with the right wall of the box. How much longer will it take until the puck hits the left wall of the box again?`,
    choices: {
      A: '$$T/2$$',
      B: '$$T$$',
      C: '$$2T$$',
      D: '$$3T$$',
      E: '$$4T$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['collisions', 'momentum conservation', 'reference frames', 'relative motion'],
    solution: `Work in the center-of-mass frame. The total momentum is $$Mv + (M/2)(2v) = 2Mv$$, so the CM velocity is $$v_{cm} = 2Mv/(M + M/2) = 4v/3$$.

In the CM frame, the box has initial velocity $$v - 4v/3 = -v/3$$ and the puck has initial velocity $$2v - 4v/3 = 2v/3$$. Their momenta are equal and opposite (as required in the CM frame): box $$M(-v/3)$$, puck $$(M/2)(2v/3) = Mv/3$$. ✓

The relative velocity of the puck with respect to the box before the collision is $$2v - v = v$$ (puck moves right faster than the box). In an elastic collision between any two objects, the relative velocity simply reverses sign. So after the collision with the right wall, the puck's velocity relative to the box is $$-v$$ (puck moves left relative to the box at the same speed).

Since the relative speed is unchanged, and the puck must now traverse the same box length (from right wall back to left wall), the time to the next collision is the same as the time $$T$$ it took for the first collision.

The answer is B.`,
  },
  {
    n: 18, correct: 'D',
    statement: `__The following information applies to problems 18 and 19.__

A uniform rod of length $$L$$ and mass $$M$$ is placed with its ends resting on two identical springs of spring constant $$k$$, as shown. The rod is initially in equilibrium. If the rod is uniformly displaced downward and released from rest, what is the frequency $$f$$ of its oscillations?`,
    choices: {
      A: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k}{4M}}$$',
      B: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k}{2M}}$$',
      C: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k}{M}}$$',
      D: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{2k}{M}}$$',
      E: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{4k}{M}}$$',
    },
    figures: [F22B(18)], topics: ['Mechanics'],
    tags: ['springs', 'oscillations/SHM'],
    solution: `When the rod is displaced uniformly downward by $$\\Delta \\ell$$, each spring compresses by $$\\Delta \\ell$$ beyond its equilibrium compression. Each spring exerts an additional restoring force $$k\\Delta\\ell$$, and there are two springs, so the total restoring force is $$2k\\Delta\\ell$$.

This is equivalent to a single spring of effective constant $$k_{\\text{eff}} = 2k$$ attached to a mass $$M$$. The angular frequency is $$\\omega = \\sqrt{2k/M}$$, giving

$$f = \\frac{\\omega}{2\\pi} = \\frac{1}{2\\pi}\\sqrt{\\frac{2k}{M}}.$$

The answer is D.`,
  },
  {
    n: 19, correct: 'E',
    statement: `__The following information applies to problems 18 and 19.__

A uniform rod of length $$L$$ and mass $$M$$ is placed with its ends resting on two identical springs of spring constant $$k$$, as shown. Next, the rod is brought back to equilibrium. It is slightly rotated about its center of mass, then released from rest. What is the frequency $$f$$ of its oscillations?`,
    choices: {
      A: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k}{M}}$$',
      B: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{2k}{M}}$$',
      C: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{3k}{M}}$$',
      D: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{4k}{M}}$$',
      E: '$$\\dfrac{1}{2\\pi}\\sqrt{\\dfrac{6k}{M}}$$',
    },
    figures: ['https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2022-b/fma-2022-b-q18.png'], topics: ['Mechanics'],
    tags: ['springs', 'oscillations/SHM', 'rotational dynamics', 'moment of inertia'],
    solution: `When the rod is rotated by a small angle $$\\theta$$ about its center, each end is displaced by $$\\pm (L/2)\\theta$$. The spring at one end compresses by an additional $$(L/2)\\theta$$ and the other spring stretches by the same amount (relative to equilibrium). Each spring exerts an additional restoring force $$k(L/2)\\theta$$, and each force acts at a distance $$L/2$$ from the center.

The net restoring torque about the center is

$$\\tau = -2 \\cdot k\\frac{L}{2}\\theta \\cdot \\frac{L}{2} = -\\frac{kL^2}{2}\\theta.$$

The moment of inertia of a uniform rod about its center is $$I = \\frac{1}{12}ML^2$$. Applying $$\\tau = I\\alpha$$:

$$\\frac{1}{12}ML^2\\,\\ddot{\\theta} = -\\frac{kL^2}{2}\\theta \\implies \\ddot{\\theta} = -\\frac{6k}{M}\\theta.$$

This is SHM with $$\\omega^2 = 6k/M$$, so

$$f = \\frac{1}{2\\pi}\\sqrt{\\frac{6k}{M}}.$$

The answer is E.`,
  },
  {
    n: 20, correct: 'D',
    statement: `A uniform, hollow sphere is initially at rest on a horizontal plane. The plane begins to accelerate horizontally to the right, with acceleration $$a$$. If friction is high enough to prevent the sphere from slipping, what is its translational acceleration?`,
    choices: {
      A: '$$2a/3$$ to the left',
      B: '$$a/3$$ to the left',
      C: 'zero',
      D: '$$2a/5$$ to the right',
      E: '$$2a/3$$ to the right',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['rolling without slipping', 'non-inertial frames', 'rotational dynamics', 'friction'],
    solution: `Work in the non-inertial frame of the accelerating plane. In this frame there is a fictitious force $$Ma$$ on the sphere directed to the left, effectively applied at its center of mass. The only real horizontal force on the sphere in the lab frame is static friction from the plane.

Taking torques about the contact point (to eliminate the normal force and friction from the torque equation):

The fictitious force $$Ma$$ acts at height $$R$$ above the contact point, giving torque $$MaR$$ (tending to rotate the sphere in the direction the plane is accelerating, i.e., making the contact point move backward). The moment of inertia of a hollow sphere about its center is $$I_{cm} = \\tfrac{2}{3}MR^2$$, and about the contact point (parallel axis theorem) is $$I = \\tfrac{2}{3}MR^2 + MR^2 = \\tfrac{5}{3}MR^2$$.

Rolling without slipping: $$\\alpha = a_{cm}/R$$ (in the plane's frame). In the plane's frame the sphere's center accelerates at $$a_{cm,\\text{plane}} = a_{cm,\\text{lab}} - a$$.

In the plane's frame, the net fictitious-force torque about the contact point gives:

$$MaR = I\\alpha_{\\text{plane}} = \\frac{5}{3}MR^2 \\cdot \\frac{a_{cm,\\text{plane}}}{R}$$

$$a \\cdot R = \\frac{5}{3}R \\cdot a_{cm,\\text{plane}} \\implies a_{cm,\\text{plane}} = \\frac{3a}{5}\\text{ to the left (in plane frame).}$$

Transforming back to the lab frame:

$$a_{cm,\\text{lab}} = a_{cm,\\text{plane}} + a = -\\frac{3a}{5} + a = \\frac{2a}{5}\\text{ to the right.}$$

The answer is D.`,
  },
  {
    n: 21, correct: 'B',
    statement: `Amora and Bronko are given a long, thin rectangle of sheet metal. (It has been machined very precisely, so they can assume it is perfectly rectangular.) Using calipers, Amora measures the width of the rectangle as 1 cm with 1% uncertainty. Using a tape measure, Bronko independently measures its length as 100 cm with 0.1% uncertainty. Which of the following are closest to the relative uncertainties they should report for the area and the perimeter of the rectangle, respectively?`,
    choices: {
      A: '0.1%; 0.2%',
      B: '1%; 0.1%',
      C: '1%; 0.2%',
      D: '1%; 1%',
      E: '1%; 2%',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['error analysis', 'uncertainty propagation'],
    solution: `__Area__ $$= w \\times \\ell$$. When multiplying two quantities the relative uncertainties add:

$$\\frac{\\delta A}{A} = \\frac{\\delta w}{w} + \\frac{\\delta \\ell}{\\ell} = 1\\% + 0.1\\% \\approx 1\\%.$$

Amora's 1% dominates.

__Perimeter__ $$= 2w + 2\\ell \\approx 2\\ell$$ (since $$w \\ll \\ell$$). When adding two quantities the absolute uncertainties add:

$$\\delta P = 2\\delta w + 2\\delta\\ell.$$

Amora's absolute uncertainty: $$\\delta w = 0.01\\text{ cm}$$. Bronko's absolute uncertainty: $$\\delta\\ell = 0.1\\text{ cm}$$. The total absolute uncertainty $$\\delta P = 0.02 + 0.20 = 0.22\\text{ cm}$$.

The perimeter is $$P = 2(1) + 2(100) = 202\\text{ cm}$$. Relative uncertainty:

$$\\frac{\\delta P}{P} = \\frac{0.22}{202} \\approx 0.11\\% \\approx 0.1\\%.$$

Bronko's measurement dominates.

The answer is B.`,
  },
  {
    n: 22, correct: 'D',
    statement: `A cannon just above the surface of a spherical planet with mass $$M$$ and radius $$R$$ launches a particle with speed $$v$$, where $$\\sqrt{GM/R} < v < \\sqrt{2GM/R}$$. The initial velocity of the particle makes an angle $$\\theta$$ with the vertical direction. Neglect drag. For what $$\\theta$$ will the particle never collide with the planet?`,
    choices: {
      A: 'All possible launch angles, $$0^\\circ \\leq \\theta \\leq 90^\\circ$$.',
      B: '$$\\cos^{-1}\\!\\left(\\sqrt{\\dfrac{v^2 R}{GM} - 1}\\right) \\leq \\theta \\leq 90^\\circ$$',
      C: '$$\\sin^{-1}\\!\\left(\\sqrt{\\dfrac{v^2 R}{GM} - 1}\\right) \\leq \\theta \\leq 90^\\circ$$',
      D: 'Only $$\\theta = 90^\\circ$$.',
      E: 'A collision will occur for any value of $$\\theta$$.',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['gravitation', 'kepler\'s laws', 'energy conservation'],
    solution: `The launch speed satisfies $$v_{\\text{circ}} < v < v_{\\text{esc}}$$, where $$v_{\\text{circ}} = \\sqrt{GM/R}$$ is the circular orbital speed and $$v_{\\text{esc}} = \\sqrt{2GM/R}$$ is the escape speed.

Because $$v < v_{\\text{esc}}$$, the orbit is a closed ellipse (by energy considerations). Because the particle is launched from the surface, the launch point is on the planet.

For $$\\theta = 90^\\circ$$ (launch tangent to the surface), the velocity is horizontal. Since $$v > v_{\\text{circ}}$$, the circular orbit speed is exceeded, and the resulting ellipse has the launch point as its __periapsis__ (closest approach). The orbit is entirely above the surface and never re-intersects the planet. ✓

For any other angle $$\\theta \\ne 90^\\circ$$, the velocity has a radial component. The orbit is still an ellipse, but now the launch point is no longer the periapsis. By Kepler's first law, the orbit is a closed ellipse, and since the launch point is on the surface, the orbit must pass through a point on or below the surface elsewhere on the ellipse — i.e., it intersects the planet.

Therefore only $$\\theta = 90^\\circ$$ avoids a collision. The answer is D.`,
  },
  {
    // The printed solution signs off "giving choice (B)", but the boxed letter
    // on the exam is (C) -- and (C) is the ellipse the solution spends its whole
    // argument deriving, while (B) is a pair of crossed straight lines. The
    // prose is a slip in the source; the key is C.
    n: 23, correct: 'C',
    statement: `A mass attached to a spring is performing simple harmonic motion, with velocity $$v(t)$$ and acceleration $$a(t)$$. Which of the following could be a graph of the curve $$(v(t),\\, a(t))$$ over a complete oscillation?`,
    choices: {
      A: 'A single straight line of negative slope through the origin.',
      B: 'Two straight lines through the origin, crossing in an X.',
      C: 'An ellipse centred on the origin, occupying all four quadrants.',
      D: 'An arch above the horizontal axis, meeting it at both ends.',
      E: 'A pair of vertical lines, one either side of the vertical axis.',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['oscillations/SHM', 'graph interpretation', 'energy conservation'],
    solution: `For SHM: $$v(t) = v_0\\cos(\\omega t)$$ and $$a(t) = -\\omega^2 x(t) = -v_0\\omega\\sin(\\omega t)$$.

Thus $$v = v_0\\cos(\\omega t)$$ and $$a = -v_0\\omega\\sin(\\omega t)$$, which satisfy

$$\\frac{v^2}{v_0^2} + \\frac{a^2}{(v_0\\omega)^2} = \\cos^2(\\omega t) + \\sin^2(\\omega t) = 1.$$

This is an __ellipse__ (circle if $$v_0 = v_0\\omega$$, i.e., $$\\omega = 1$$, but in general an ellipse) centered at the origin. Since all four combinations of signs of $$v$$ and $$a$$ occur during one oscillation, the ellipse occupies all four quadrants.

Note: from energy conservation, $$E = kx^2/2 + mv^2/2$$ and $$a = -kx/m$$, so $$x = -ma/k$$ and $$E = (ma^2)/(2k) + mv^2/2$$, confirming the ellipse.

The answer is __(C)__. (AAPT's printed solution ends "giving choice (B)", but (B) is a pair of crossed straight lines; (C) is the ellipse, and (C) is the letter boxed on the exam.)`,
  },
  {
    n: 24, correct: 'C',
    statement: `A ramp with height $$h$$ is moving with fixed, uniform speed $$v$$ to the right. A small block of mass $$m$$ is placed at the top of the ramp, and is released at rest with respect to the ramp. The block slides smoothly to the bottom of the ramp and onto the floor. How much kinetic energy does it gain in this process? Neglect friction.`,
    choices: {
      A: '$$mgh$$',
      B: '$$mgh + mv^2/2$$',
      C: '$$mgh + mv\\sqrt{2gh}$$',
      D: '$$mgh + mv\\sqrt{gh} + mv^2/2$$',
      E: '$$mgh + mv\\sqrt{2gh} + mv^2$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['energy conservation', 'reference frames', 'work-energy theorem', 'kinematics-2d'],
    solution: `Work in the reference frame of the ramp (moving right at speed $$v$$). In this frame, the ramp is stationary and the block starts at rest at the top.

In the ramp frame, the block slides down a frictionless ramp of height $$h$$. By energy conservation it arrives at the bottom with speed $$\\sqrt{2gh}$$ directed horizontally (along the bottom of the ramp, which is horizontal).

Transforming back to the lab frame: the block's velocity in the lab is the ramp-frame velocity plus $$v$$ (rightward). The ramp-frame velocity at the bottom is $$\\sqrt{2gh}$$ to the right (for a ramp that slopes down to the left relative to the moving ramp). So the lab-frame speed is $$v + \\sqrt{2gh}$$.

The block starts with speed $$v$$ in the lab frame (at rest on the ramp, which moves at $$v$$), so:

$$\\Delta K = \\frac{1}{2}m(v + \\sqrt{2gh})^2 - \\frac{1}{2}mv^2 = \\frac{1}{2}m(2v\\sqrt{2gh} + 2gh) = mgh + mv\\sqrt{2gh}.$$

The answer is C.`,
  },
  {
    n: 25, correct: 'D',
    statement: `Two masses are initially at rest, separated by a distance $$r$$, and attract each other gravitationally. If their masses are $$m$$ and $$2m$$, then they will collide after a time $$T$$. How long would they take to collide if they both had mass $$2m$$?`,
    choices: {
      A: '$$\\left(\\dfrac{2}{3}\\right)^{3/2}T$$',
      B: '$$\\dfrac{3}{4}T$$',
      C: '$$\\sqrt{\\dfrac{2}{3}}\\,T$$',
      D: '$$\\sqrt{\\dfrac{3}{4}}\\,T$$',
      E: '$$\\sqrt{\\dfrac{8}{9}}\\,T$$',
    },
    figures: [], topics: ['Mechanics'],
    tags: ['gravitation', 'energy conservation', 'momentum conservation', 'relative motion'],
    solution: `Compare the relative speed of the two masses when they are separated by distance $$r' < r$$.

__Case 1: masses $$m$$ and $$2m$$.__

By momentum conservation, if mass $$2m$$ has speed $$v_1$$, then mass $$m$$ has speed $$2v_1$$ (opposite direction). The relative speed is $$3v_1$$. By energy conservation (starting from rest at separation $$r$$):

$$\\frac{1}{2}m(2v_1)^2 + \\frac{1}{2}(2m)v_1^2 = Gm(2m)\\left(\\frac{1}{r'} - \\frac{1}{r}\\right)$$

$$3mv_1^2 = 2Gm^2\\left(\\frac{1}{r'} - \\frac{1}{r}\\right)$$

$$v_1 = \\sqrt{\\frac{2Gm}{3}\\left(\\frac{1}{r'} - \\frac{1}{r}\\right)}.$$

Relative speed: $$3v_1 = \\sqrt{6Gm\\left(\\frac{1}{r'}-\\frac{1}{r}\\right)}$$.

__Case 2: both masses $$2m$$.__

By symmetry both masses have the same speed $$v_2$$. By energy conservation:

$$2 \\cdot \\frac{1}{2}(2m)v_2^2 = G(2m)^2\\left(\\frac{1}{r'} - \\frac{1}{r}\\right)$$

$$2mv_2^2 = 4Gm^2\\left(\\frac{1}{r'} - \\frac{1}{r}\\right)$$

$$v_2 = \\sqrt{2Gm\\left(\\frac{1}{r'} - \\frac{1}{r}\\right)}.$$

Relative speed: $$2v_2 = \\sqrt{8Gm\\left(\\frac{1}{r'}-\\frac{1}{r}\\right)}$$.

The ratio of relative speeds (Case 2 to Case 1) at any separation $$r'$$ is:

$$\\frac{2v_2}{3v_1} = \\sqrt{\\frac{8}{6}} = \\sqrt{\\frac{4}{3}}.$$

Since the relative speed is always $$\\sqrt{4/3}$$ times larger in Case 2, the collision time is $$1/\\sqrt{4/3} = \\sqrt{3/4}$$ times shorter:

$$t_2 = \\sqrt{\\frac{3}{4}}\\,T.$$

The answer is D.`,
  },
]
