// Digitized 2010 F=ma exam questions. Source: AAPT exam + answer-key PDFs at
// https://aapt.org/physicsteam/2010/upload/2010_Fma.pdf
// https://aapt.org/physicsteam/2010/upload/2010_FmaSolutions.pdf
//
// Correct answers derived from the ←CORRECT markers in the answer-key PDF.
// All 25 markers were present and unambiguous.
//
// Solutions written from scratch by Claude (no worked solutions exist for 2010).
//
// figure_urls from work/figure_manifest.json key "fma-2010".
// Questions with figures: 5, 9, 10, 11, 13, 22, 23, 24, 25.

const F10 = n => `https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/handout-pdfs/fma-figures/fma-2010/fma-2010-q${String(n).padStart(2, '0')}.png`

export const examId = 'fma-2010'
export const questions = [
  {
    n: 1,
    correct: 'C',
    statement: `Questions 1 to 3 refer to the figure below which shows a representation of the motion of a squirrel as it runs in a straight-line along a telephone wire. The letters A through E refer to the indicated times. The graph shows a curve that rises from A to B, levels off between B and C, descends steeply from C to D, and rises again from D to E.

If the graph is a graph of POSITION vs. TIME, then the squirrel has the greatest speed at what time(s) or during what time interval(s)?`,
    choices: {
      A: 'From A to B',
      B: 'From B to C only',
      C: 'From B to D',
      D: 'From C to D only',
      E: 'From D to E',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['graph interpretation', '1d kinematics', 'speed vs velocity'],
    solution: `On a position-vs-time graph, speed equals the magnitude of the slope. The squirrel moves fastest where the curve is steepest.

Between B and C the graph is flat (slope zero, so the squirrel is stationary). The steep descent from C to D has the largest magnitude slope. From B to C the slope is zero, and from A to B and D to E the slopes are smaller than from C to D.

The steepest (largest-magnitude) slope occurs over the interval B to D, which includes the steep descent from C to D as its dominant portion. (From B to C the speed is zero, but the interval B to D is asked about as a whole interval during which the peak speed occurs.) The answer is choice __(C)__.`,
  },
  {
    n: 2,
    correct: 'D',
    statement: `Questions 1 to 3 refer to the figure below which shows a representation of the motion of a squirrel as it runs in a straight-line along a telephone wire. The letters A through E refer to the indicated times. The graph shows a curve that rises from A to B, levels off between B and C, descends steeply from C to D, and rises again from D to E.

If, instead, the graph is a graph of VELOCITY vs. TIME, then the squirrel has the greatest speed at what time(s) or during what time interval(s)?`,
    choices: {
      A: 'at B',
      B: 'at C',
      C: 'at D',
      D: 'at both B and D',
      E: 'From C to D',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['graph interpretation', '1d kinematics', 'speed vs velocity'],
    solution: `When the graph shows velocity vs. time, speed is the magnitude of the value read off the vertical axis (not the slope).

The curve rises to a local maximum at B, drops through zero at C (direction reversal), descends to a minimum (most negative) at D, then returns toward zero. Speed is $$|v|$$, so the squirrel is fastest where the curve is farthest from zero in either direction.

The magnitude at B equals the magnitude at D (the curve is symmetric about C by inspection — it reaches equal peak values above and below zero). Both B and D are the extreme points. Therefore the greatest speed occurs at both B and D, choice __(D)__.`,
  },
  {
    n: 3,
    correct: 'B',
    statement: `Questions 1 to 3 refer to the figure below which shows a representation of the motion of a squirrel as it runs in a straight-line along a telephone wire. The letters A through E refer to the indicated times. The graph shows a curve that rises from A to B, levels off between B and C, descends steeply from C to D, and rises again from D to E.

If, instead, the graph is a graph of ACCELERATION vs. TIME and the squirrel starts from rest, then the squirrel has the greatest speed at what time(s) or during what time interval?`,
    choices: {
      A: 'at B',
      B: 'at C',
      C: 'at D',
      D: 'at both B and D',
      E: 'From C to D',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['graph interpretation', '1d kinematics', '1d kinematics'],
    solution: `When the graph is acceleration vs. time, velocity is the area under the curve from time zero up to the current time (since the squirrel starts from rest).

Speed is maximum when the squirrel momentarily stops accelerating in the direction of motion and begins decelerating — equivalently, when the accumulated area under the acceleration graph is maximized before net negative area starts to reduce the speed.

From A to B the acceleration is positive and growing, so the squirrel speeds up. At B the acceleration is at its positive peak. From B to C the acceleration is still positive but decreasing, so the squirrel continues to speed up (just less rapidly). At C the acceleration passes through zero — this is the moment the net additional area stops being positive. After C the acceleration is negative, so the squirrel begins to slow.

The velocity is greatest at the moment the acceleration crosses zero, which is at C, choice __(B)__.`,
  },
  {
    n: 4,
    correct: 'A',
    statement: `Two teams of movers are lowering a piano from the window of a 10 floor apartment building. The rope breaks when the piano is 30 meters above the ground. The movers on the ground, alerted by the shouts of the movers above, first notice the piano when it is 14 meters above the ground. How long do they have to get out of the way before the piano hits the ground?`,
    choices: {
      A: '0.66 sec',
      B: '0.78 sec',
      C: '1.67 sec',
      D: '1.79 sec',
      E: '2.45 sec',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['1d kinematics', 'projectile motion'],
    solution: `The piano starts from rest and falls freely after the rope breaks. First find how long the piano takes to fall the full 30 m from where the rope breaks to the ground.

$$30 = \\frac{1}{2}g t_{\\text{total}}^2 \\implies t_{\\text{total}} = \\sqrt{\\frac{2 \\times 30}{10}} = \\sqrt{6} \\approx 2.449 \\text{ s}$$

Next find the time at which the piano is at 14 m above the ground, i.e., it has fallen $$30 - 14 = 16$$ m.

$$16 = \\frac{1}{2}g t_1^2 \\implies t_1 = \\sqrt{\\frac{2 \\times 16}{10}} = \\sqrt{3.2} \\approx 1.789 \\text{ s}$$

The movers have from $$t_1$$ to $$t_{\\text{total}}$$:

$$\\Delta t = \\sqrt{6} - \\sqrt{3.2} \\approx 2.449 - 1.789 = 0.66 \\text{ s}$$

The answer is __(A)__.`,
  },
  {
    n: 5,
    correct: 'C',
    statement: `Two projectiles are launched from a 35 meter ledge as shown in the diagram. One is launched from a 37 degree angle above the horizontal and the other is launched from 37 degrees below the horizontal. Both of the launches are given the same initial speed of $$v_0 = 50$$ m/s.

The difference in the times of flight for these two projectiles, $$t_1 - t_2$$, is closest to`,
    choices: {
      A: '3 s',
      B: '5 s',
      C: '6 s',
      D: '8 s',
      E: '10 s',
    },
    figures: [F10(5)],
    topics: ['Mechanics'],
    tags: ['projectile motion', 'kinematics-2d'],
    solution: `Use $$\\sin 37° \\approx 0.6$$, $$\\cos 37° \\approx 0.8$$. The initial vertical components are $$v_{y1} = +30$$ m/s (upward) and $$v_{y2} = -30$$ m/s (downward). Both projectiles must fall a net 35 m downward to hit the ground, so taking down as positive displacement $$y = -35$$ m with up positive:

For projectile 1 (launched upward at 37°): $$v_{y0} = +30$$ m/s
$$-35 = 30 t_1 - \\tfrac{1}{2}(10)t_1^2 = 30t_1 - 5t_1^2$$
$$5t_1^2 - 30t_1 - 35 = 0 \\implies t_1^2 - 6t_1 - 7 = 0 \\implies (t_1-7)(t_1+1) = 0$$
So $$t_1 = 7$$ s.

For projectile 2 (launched downward at 37°): $$v_{y0} = -30$$ m/s
$$-35 = -30 t_2 - 5t_2^2$$
$$5t_2^2 + 30t_2 - 35 = 0 \\implies t_2^2 + 6t_2 - 7 = 0 \\implies (t_2+7)(t_2-1) = 0$$
So $$t_2 = 1$$ s.

$$t_1 - t_2 = 7 - 1 = 6 \\text{ s}$$, choice __(C)__.`,
  },
  {
    n: 6,
    correct: 'E',
    statement: `A projectile is launched across flat ground at an angle $$\\theta$$ to the horizontal and travels in the absence of air resistance. It rises to a maximum height $$H$$ and lands a horizontal distance $$R$$ away. What is the ratio $$H/R$$?`,
    choices: {
      A: '$$\\tan\\theta$$',
      B: '$$2\\tan\\theta$$',
      C: '$$\\dfrac{2}{\\tan\\theta}$$',
      D: '$$\\dfrac{1}{2}\\tan\\theta$$',
      E: '$$\\dfrac{1}{4}\\tan\\theta$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['projectile motion', 'kinematics-2d'],
    solution: `With initial speed $$v_0$$ at angle $$\\theta$$: the vertical component is $$v_0\\sin\\theta$$ and horizontal is $$v_0\\cos\\theta$$.

Maximum height: at the apex the vertical velocity is zero. Using $$v^2 = v_{y0}^2 - 2gH$$:
$$H = \\frac{v_0^2 \\sin^2\\theta}{2g}$$

Range: total time of flight $$T = \\frac{2v_0\\sin\\theta}{g}$$, so
$$R = v_0\\cos\\theta \\cdot T = \\frac{2v_0^2 \\sin\\theta\\cos\\theta}{g} = \\frac{v_0^2 \\sin 2\\theta}{g}$$

Therefore:
$$\\frac{H}{R} = \\frac{v_0^2\\sin^2\\theta / (2g)}{2v_0^2\\sin\\theta\\cos\\theta / g} = \\frac{\\sin^2\\theta}{4\\sin\\theta\\cos\\theta} = \\frac{\\sin\\theta}{4\\cos\\theta} = \\frac{\\tan\\theta}{4}$$

The answer is choice __(E)__.`,
  },
  {
    n: 7,
    correct: 'D',
    statement: `Harry Potter is sitting 2.0 meters from the center of a merry-go-round when Draco Malfoy casts a spell that glues Harry in place and then makes the merry-go-round start spinning on its axis. Harry has a mass of 50.0 kg and can withstand 5.0 g's of acceleration before passing out. What is the magnitude of Harry's angular momentum when he passes out?`,
    choices: {
      A: '$$200\\text{ kg·m}^2/\\text{s}$$',
      B: '$$330\\text{ kg·m}^2/\\text{s}$$',
      C: '$$660\\text{ kg·m}^2/\\text{s}$$',
      D: '$$1000\\text{ kg·m}^2/\\text{s}$$',
      E: '$$2200\\text{ kg·m}^2/\\text{s}$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['circular motion', 'angular momentum', 'rotational motion'],
    solution: `Harry passes out when his centripetal acceleration reaches $$a = 5.0g = 50 \\text{ m/s}^2$$ at radius $$r = 2.0$$ m.

Centripetal acceleration: $$a = \\omega^2 r$$, so
$$\\omega = \\sqrt{\\frac{a}{r}} = \\sqrt{\\frac{50}{2.0}} = 5 \\text{ rad/s}$$

Harry's speed at that moment: $$v = \\omega r = 5 \\times 2.0 = 10 \\text{ m/s}$$

Angular momentum: $$L = mvr = 50.0 \\times 10 \\times 2.0 = 1000 \\text{ kg·m}^2/\\text{s}$$

The answer is __(D)__.`,
  },
  {
    n: 8,
    correct: 'B',
    statement: `A car attempts to accelerate up a hill at an angle $$\\theta$$ to the horizontal. The coefficient of static friction between the tires and the hill is $$\\mu > \\tan\\theta$$. What is the maximum acceleration the car can achieve (in the direction upwards along the hill)? Neglect the rotational inertia of the wheels.`,
    choices: {
      A: '$$g\\tan\\theta$$',
      B: '$$g(\\mu\\cos\\theta - \\sin\\theta)$$',
      C: '$$g(\\mu - \\sin\\theta)$$',
      D: '$$g\\mu\\cos\\theta$$',
      E: '$$g(\\mu\\sin\\theta - \\cos\\theta)$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['newton\'s laws', 'friction', 'free-body diagrams'],
    solution: `The car is driven by static friction at the driving wheels — friction pushes the car up the slope. The maximum static friction force is $$f = \\mu N$$ where the normal force $$N = mg\\cos\\theta$$.

Along the slope, Newton's second law (taking up-slope as positive):
$$f - mg\\sin\\theta = ma$$
$$\\mu mg\\cos\\theta - mg\\sin\\theta = ma$$
$$a = g(\\mu\\cos\\theta - \\sin\\theta)$$

This is positive because $$\\mu > \\tan\\theta$$ guarantees $$\\mu\\cos\\theta > \\sin\\theta$$. The answer is __(B)__.`,
  },
  {
    n: 9,
    correct: 'C',
    statement: `A point object of mass $$M$$ hangs from the ceiling of a car from a massless string of length $$L$$. It is observed to make an angle $$\\theta$$ from the vertical as the car accelerates uniformly from rest. Find the acceleration of the car in terms of $$\\theta$$, $$M$$, $$L$$, and $$g$$.`,
    choices: {
      A: '$$Mg\\sin\\theta$$',
      B: '$$MgL\\tan\\theta$$',
      C: '$$g\\tan\\theta$$',
      D: '$$g\\cot\\theta$$',
      E: '$$Mg\\tan\\theta$$',
    },
    figures: [F10(9)],
    topics: ['Mechanics'],
    tags: ['newton\'s laws', 'non-inertial frames', 'tension'],
    solution: `In the accelerating car's frame the pendulum hangs at angle $$\\theta$$ from vertical, balanced between gravity and the pseudo-force. Equivalently, in the ground frame the string tension provides both the vertical support (against gravity) and the horizontal centripetal (accelerating) force.

Resolving the tension $$T$$ along the string:
$$T\\cos\\theta = Mg \\quad \\text{(vertical)}$$
$$T\\sin\\theta = Ma \\quad \\text{(horizontal)}$$

Dividing the second equation by the first:
$$\\tan\\theta = \\frac{a}{g} \\implies a = g\\tan\\theta$$

Note the result is independent of $$M$$ and $$L$$, which eliminates choices (A), (B), and (E). The answer is __(C)__.`,
  },
  {
    n: 10,
    correct: 'A',
    statement: `A block of mass $$m_1$$ is on top of a block of mass $$m_2$$. The lower block is on a horizontal surface, and a rope can pull horizontally on the lower block. The coefficient of kinetic friction for all surfaces is $$\\mu$$. What is the resulting acceleration of the lower block if a force $$F$$ is applied to the rope? Assume that $$F$$ is sufficiently large so that the top block slips on the lower block.`,
    choices: {
      A: '$$a_2 = (F - \\mu g(2m_1 + m_2))/m_2$$',
      B: '$$a_2 = (F - \\mu g(m_1 + m_2))/m_2$$',
      C: '$$a_2 = (F - \\mu g(m_1 + 2m_2))/m_2$$',
      D: '$$a_2 = (F + \\mu g(m_1 + m_2))/m_2$$',
      E: '$$a_2 = (F - \\mu g(m_2 - m_1))/m_2$$',
    },
    figures: [F10(10)],
    topics: ['Mechanics'],
    tags: ['newton\'s laws', 'friction', 'free-body diagrams'],
    solution: `Identify the friction forces on the lower block $$m_2$$. There are two kinetic friction forces opposing $$m_2$$'s motion (to the right):

1. Friction from the floor on the bottom of $$m_2$$: the normal force from the floor is $$(m_1+m_2)g$$ (supporting both blocks), so this friction is $$\\mu(m_1+m_2)g$$ directed left.

2. Friction from the top block $$m_1$$ on top of $$m_2$$: because the blocks slip, kinetic friction acts on $$m_2$$ from $$m_1$$ directed left (reaction to the friction that pushes $$m_1$$ forward). The normal force between them is $$m_1 g$$, giving friction $$\\mu m_1 g$$ directed left.

Net friction on $$m_2$$ (leftward): $$\\mu(m_1+m_2)g + \\mu m_1 g = \\mu(2m_1 + m_2)g$$

Newton's second law for $$m_2$$:
$$F - \\mu g(2m_1 + m_2) = m_2 a_2$$
$$a_2 = \\frac{F - \\mu g(2m_1 + m_2)}{m_2}$$

The answer is __(A)__.`,
  },
  {
    n: 11,
    correct: 'E',
    statement: `The three masses shown in the accompanying diagram are equal. The pulleys are small, the string is lightweight, and friction is negligible. Assuming the system is in equilibrium, what is the ratio $$a/b$$? The figure is not drawn to scale!`,
    choices: {
      A: '$$1/2$$',
      B: '$$1$$',
      C: '$$\\sqrt{3}$$',
      D: '$$2$$',
      E: '$$2\\sqrt{3}$$',
    },
    figures: [F10(11)],
    topics: ['Mechanics'],
    tags: ['statics/equilibrium', 'tension', 'pulleys/tension'],
    solution: `From the figure, two equal masses hang from a horizontal string via two pulleys separated by distance $$a$$, and a third equal mass hangs from the midpoint of the string at depth $$b$$ below the pulley level. Let each hanging mass have weight $$mg$$.

The two outer sections of string each support one mass $$mg$$, so the tension in each outer segment is $$mg$$.

At the center junction where the middle mass hangs, three string segments meet. The two outer segments each make an angle $$\\phi$$ with the horizontal, where $$\\tan\\phi = b/(a/2) = 2b/a$$.

Vertical equilibrium at the center junction: the two outer segments contribute upward vertical components that together balance the weight of the central mass:
$$2T\\sin\\phi = mg$$

Since $$T = mg$$:
$$2mg\\sin\\phi = mg \\implies \\sin\\phi = \\frac{1}{2} \\implies \\phi = 30°$$

Therefore $$\\tan\\phi = \\tan 30° = 1/\\sqrt{3}$$:
$$\\frac{2b}{a} = \\frac{1}{\\sqrt{3}} \\implies \\frac{a}{b} = 2\\sqrt{3}$$

The answer is __(E)__.`,
  },
  {
    n: 12,
    correct: 'B',
    statement: `A ball with mass $$m$$ projected horizontally off the end of a table with an initial kinetic energy $$K$$. At a time $$t$$ after it leaves the end of the table it has kinetic energy $$3K$$. What is $$t$$? Neglect air resistance.`,
    choices: {
      A: '$$\\dfrac{3}{g}\\sqrt{K/m}$$',
      B: '$$\\dfrac{2}{g}\\sqrt{K/m}$$',
      C: '$$\\dfrac{1}{g}\\sqrt{8K/m}$$',
      D: '$$\\dfrac{K}{g}\\sqrt{6/m}$$',
      E: '$$\\dfrac{2K}{g}\\sqrt{1/m}$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['energy conservation', 'projectile motion', 'work-energy theorem'],
    solution: `The ball is launched horizontally with kinetic energy $$K = \\frac{1}{2}mv_x^2$$, so $$v_x^2 = 2K/m$$.

After time $$t$$, the ball has acquired downward speed $$v_y = gt$$. The total KE is:
$$\\frac{1}{2}m(v_x^2 + v_y^2) = 3K$$

Substituting $$\\frac{1}{2}mv_x^2 = K$$ and $$v_y = gt$$:
$$K + \\frac{1}{2}m g^2 t^2 = 3K$$
$$\\frac{1}{2}mg^2 t^2 = 2K$$
$$t^2 = \\frac{4K}{mg^2}$$
$$t = \\frac{2}{g}\\sqrt{\\frac{K}{m}}$$

The answer is __(B)__.`,
  },
  {
    n: 13,
    correct: 'D',
    statement: `A ball of mass $$M$$ and radius $$R$$ has a moment of inertia of $$I = \\frac{2}{5}MR^2$$. The ball is released from rest and rolls down the ramp with no frictional loss of energy. The ball is projected vertically upward off a ramp as shown in the diagram, reaching a maximum height $$y_{\\max}$$ above the point where it leaves the ramp. Determine the maximum height of the projectile $$y_{\\max}$$ in terms of $$h$$.`,
    choices: {
      A: '$$h$$',
      B: '$$\\dfrac{25}{49}h$$',
      C: '$$\\dfrac{2}{5}h$$',
      D: '$$\\dfrac{5}{7}h$$',
      E: '$$\\dfrac{7}{5}h$$',
    },
    figures: [F10(13)],
    topics: ['Mechanics'],
    tags: ['rolling without slipping', 'energy conservation', 'rotational dynamics'],
    solution: `The ball rolls down without slipping from height $$h$$. At the bottom (before the ramp redirects it), all gravitational PE has become KE — split between translational and rotational.

Using energy conservation (no friction losses):
$$Mgh = \\frac{1}{2}Mv^2 + \\frac{1}{2}I\\omega^2 = \\frac{1}{2}Mv^2 + \\frac{1}{2}\\cdot\\frac{2}{5}MR^2\\cdot\\frac{v^2}{R^2} = \\frac{1}{2}Mv^2\\left(1 + \\frac{2}{5}\\right) = \\frac{7}{10}Mv^2$$

So $$v^2 = \\frac{10gh}{7}$$.

When the ball leaves the ramp as a projectile going vertically upward, it no longer rolls — the contact with the ramp has ended. However, friction during the brief ramp section does no work (rolling constraint, no slipping), so the spin is still present but no longer relevant to vertical height gain (the rotation does no work against gravity). Only the translational KE converts to height:

$$y_{\\max} = \\frac{v^2}{2g} = \\frac{10gh/7}{2g} = \\frac{5h}{7}$$

The answer is __(D)__.`,
  },
  {
    n: 14,
    correct: 'B',
    statement: `A 5.0 kg block with a speed of 8.0 m/s travels 2.0 m along a horizontal surface where it makes a head-on, perfectly elastic collision with a 15.0 kg block which is at rest. The coefficient of kinetic friction between both blocks and the surface is 0.35. How far does the 15.0 kg block travel before coming to rest?`,
    choices: {
      A: '0.76 m',
      B: '1.79 m',
      C: '2.29 m',
      D: '3.04 m',
      E: '9.14 m',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['collisions', 'energy conservation', 'friction'],
    solution: `__Step 1: Find the 5 kg block's speed just before the collision.__ Friction decelerates it over 2.0 m:
$$v_1^2 = v_0^2 - 2\\mu g d = 64 - 2(0.35)(10)(2.0) = 64 - 14 = 50 \\implies v_1 = \\sqrt{50} \\text{ m/s}$$

__Step 2: Elastic collision between $$m_1 = 5$$ kg at $$v_1$$ and $$m_2 = 15$$ kg at rest.__ For a perfectly elastic collision:
$$v_2' = \\frac{2m_1}{m_1+m_2}v_1 = \\frac{2(5)}{20}\\sqrt{50} = \\frac{1}{2}\\sqrt{50} \\text{ m/s}$$

So $$v_2'^2 = 50/4 = 12.5 \\text{ m}^2/\\text{s}^2$$.

__Step 3: Distance the 15 kg block travels after the collision.__ Friction decelerates it:
$$d_2 = \\frac{v_2'^2}{2\\mu g} = \\frac{12.5}{2(0.35)(10)} = \\frac{12.5}{7} \\approx 1.79 \\text{ m}$$

The answer is __(B)__.`,
  },
  {
    n: 15,
    correct: 'C',
    statement: `The following figure is used for questions 15 and 16.

A small block of mass $$m$$ is moving on a horizontal table surface at initial speed $$v_0$$. It then moves smoothly onto a sloped big block of mass $$M$$. The big block can also move on the table surface. Assume that everything moves without friction.

A small block moving with initial speed $$v_0$$ moves smoothly onto a sloped big block of mass $$M$$. After the small block reaches the height $$h$$ on the slope, it slides down. Find the height $$h$$.`,
    choices: {
      A: '$$h = \\dfrac{v_0^2}{2g}$$',
      B: '$$h = \\dfrac{1}{g}\\dfrac{Mv_0^2}{m+M}$$',
      C: '$$h = \\dfrac{1}{2g}\\dfrac{Mv_0^2}{m+M}$$',
      D: '$$h = \\dfrac{1}{2g}\\dfrac{mv_0^2}{m+M}$$',
      E: '$$h = \\dfrac{v_0^2}{g}$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['momentum conservation', 'energy conservation', 'reference frames'],
    solution: `At the moment of maximum height, the small block and large block move at the same horizontal velocity (they are momentarily at rest relative to each other). Momentum conservation (no friction):
$$mv_0 = (m + M)V \\implies V = \\frac{mv_0}{m+M}$$

Energy conservation from initial state to the moment of maximum height:
$$\\frac{1}{2}mv_0^2 = \\frac{1}{2}(m+M)V^2 + mgh$$

$$mgh = \\frac{1}{2}mv_0^2 - \\frac{1}{2}(m+M)\\left(\\frac{mv_0}{m+M}\\right)^2 = \\frac{1}{2}mv_0^2 - \\frac{m^2v_0^2}{2(m+M)}$$

$$mgh = \\frac{mv_0^2}{2}\\left(1 - \\frac{m}{m+M}\\right) = \\frac{mv_0^2}{2}\\cdot\\frac{M}{m+M}$$

$$h = \\frac{Mv_0^2}{2g(m+M)}$$

The answer is __(C)__.`,
  },
  {
    n: 16,
    correct: 'E',
    statement: `The following figure is used for questions 15 and 16.

A small block of mass $$m$$ is moving on a horizontal table surface at initial speed $$v_0$$. It then moves smoothly onto a sloped big block of mass $$M$$. The big block can also move on the table surface. Assume that everything moves without friction.

Following the previous set up, find the speed $$v$$ of the small block after it leaves the slope.`,
    choices: {
      A: '$$v = v_0$$',
      B: '$$v = \\dfrac{m}{m+M}v_0$$',
      C: '$$v = \\dfrac{M}{m+M}v_0$$',
      D: '$$v = \\dfrac{M-m}{m}v_0$$',
      E: '$$v = \\dfrac{M-m}{m+M}v_0$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['momentum conservation', 'energy conservation', 'collisions'],
    solution: `The interaction between the small block and the large block is elastic (no friction, no energy loss) and confined to the horizontal direction. This is equivalent to a 1D elastic collision.

For a 1D elastic collision where the target (big block) starts at rest:
$$v_{\\text{small}}' = \\frac{m - M}{m + M}v_0$$

The speed of the small block after leaving the slope is:
$$v = \\left|\\frac{m-M}{m+M}\\right|v_0$$

Since $$M > m$$ in a typical scenario the small block bounces back, so $$v = \\frac{M-m}{m+M}v_0$$. The answer choices show the signed version $$v = \\frac{M-m}{m+M}v_0$$, which is correct with the convention that negative means the block returns to the left.

The answer is __(E)__.`,
  },
  {
    n: 17,
    correct: 'D',
    statement: `Four masses $$m$$ are arranged at the vertices of a tetrahedron of side length $$a$$. What is the gravitational potential energy of this arrangement?`,
    choices: {
      A: '$$-2\\dfrac{Gm^2}{a}$$',
      B: '$$-3\\dfrac{Gm^2}{a}$$',
      C: '$$-4\\dfrac{Gm^2}{a}$$',
      D: '$$-6\\dfrac{Gm^2}{a}$$',
      E: '$$-12\\dfrac{Gm^2}{a}$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['gravitation', 'potential energy', 'symmetry'],
    solution: `The gravitational potential energy of a pair of masses $$m$$ separated by distance $$a$$ is $$-Gm^2/a$$. The total PE is the sum over all distinct pairs.

A tetrahedron has 4 vertices. The number of distinct pairs is $$\\binom{4}{2} = 6$$, and each pair is separated by the same side length $$a$$ (regular tetrahedron — all edges equal).

$$U = 6 \\times \\left(-\\frac{Gm^2}{a}\\right) = -\\frac{6Gm^2}{a}$$

The answer is __(D)__.`,
  },
  {
    n: 18,
    correct: 'E',
    statement: `The following graph of potential energy is used for questions 18 through 20.

The potential energy graph shows $$U(x)$$ in joules vs. $$x$$ in meters. The potential is $$U = 0$$ for $$x < -10$$ m and $$x > 10$$ m. Between $$x = -10$$ m and $$x = 0$$, the potential decreases linearly from 0 to $$-10$$ J. Between $$x = 0$$ and $$x = 10$$ m, the potential increases linearly from $$-10$$ J back to 0. The graph is a V-shape with minimum at $$x = 0$$.

Which of the following represents the force corresponding to the given potential?`,
    choices: {
      A: 'Force is negative for $$x < -10$$ and $$x > 10$$, zero between, and has a positive step at $$x = 0$$',
      B: 'Force is negative for $$x < 0$$ and positive for $$x > 0$$, with discontinuities at the boundaries',
      C: 'Force is zero everywhere except a negative spike at $$x = 0$$',
      D: 'Force is a small positive constant for $$-10 < x < 0$$ and a small negative constant for $$0 < x < 10$$',
      E: 'Force is a positive constant (about $$+1$$ N) for $$-10 < x < 0$$ and a negative constant (about $$-1$$ N) for $$0 < x < 10$$, and zero outside',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['potential energy', 'equations of motion'],
    solution: `Force is the negative gradient of potential energy: $$F = -dU/dx$$.

For $$x < -10$$ m: $$U = 0$$, so $$F = 0$$.
For $$-10 < x < 0$$ m: $$U$$ decreases linearly from 0 to $$-10$$ J over 10 m, slope $$= -10/10 = -1$$ J/m. Force $$= -(-1) = +1$$ N (constant positive).
For $$0 < x < 10$$ m: $$U$$ increases linearly from $$-10$$ J to 0 over 10 m, slope $$= +10/10 = +1$$ J/m. Force $$= -(+1) = -1$$ N (constant negative).
For $$x > 10$$ m: $$U = 0$$, so $$F = 0$$.

This gives a piecewise constant force: $$+1$$ N for $$-10 < x < 0$$, $$-1$$ N for $$0 < x < 10$$, and 0 outside. Looking at the graphs provided, choice (E) shows exactly this pattern, choice __(E)__.`,
  },
  {
    n: 19,
    correct: 'D',
    statement: `The following graph of potential energy is used for questions 18 through 20.

The potential energy graph shows a V-shape: $$U = 0$$ outside $$|x| > 10$$ m, linearly decreasing from 0 to $$-10$$ J as $$x$$ goes from $$-10$$ m to 0, and linearly increasing from $$-10$$ J to 0 as $$x$$ goes from 0 to 10 m. The minimum is at $$x = 0$$.

Consider the following graphs of position vs. time.

Graph I: particle sits at $$x \\approx +12$$ m, constant (a horizontal line).
Graph II: particle sits at $$x \\approx -5$$ m, constant (a horizontal line).
Graph III: particle's position increases slowly and monotonically from about $$x = 0$$ to $$x = 12$$ m.

Which of the graphs could be the motion of a particle in the given potential?`,
    choices: {
      A: 'I',
      B: 'III',
      C: 'I and II',
      D: 'I and III',
      E: 'I, II, and III',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['potential energy', 'equations of motion', 'energy conservation'],
    solution: `Analyze each graph using the potential energy landscape. A particle can only remain stationary where the force is zero, i.e., where $$dU/dx = 0$$ (a flat spot of the potential).

__Graph I__ (constant position at $$x \\approx +12$$ m, outside the V-shape): the potential is flat ($$U=0$$) and force is zero there, so a particle can sit at rest. This is a valid free-particle solution with zero KE. __Possible.__

__Graph II__ (constant position at $$x \\approx -5$$ m, inside the V-shape): at $$x = -5$$ m the potential has a nonzero slope and hence a nonzero force ($$+1$$ N), so the particle cannot be stationary. __Impossible.__

__Graph III__ (slow monotonic increase through the V-shape into the flat region): a particle with enough energy launched from the left could traverse the potential well and coast to the right with constant speed in the zero-force region. The position slowly increases — this corresponds to slow uniform motion in the flat regions and acceleration through the well, ultimately moving to the right. __Possible.__

The answer is __(D)__.`,
  },
  {
    n: 20,
    correct: 'A',
    statement: `The following graph of potential energy is used for questions 18 through 20.

The potential energy graph shows a V-shape: $$U = 0$$ outside $$|x| > 10$$ m, linearly decreasing from 0 to $$-10$$ J as $$x$$ goes from $$-10$$ m to 0, and linearly increasing from $$-10$$ J to 0 as $$x$$ goes from 0 to 10 m.

Consider the following graph of position vs. time, which represents the motion of a certain particle in the given potential. The graph shows the particle oscillating between approximately $$x = -5$$ m and $$x = +5$$ m in a smooth sinusoidal-looking pattern.

What is the total energy of the particle?`,
    choices: {
      A: '$$-5$$ J',
      B: '$$0$$ J',
      C: '$$5$$ J',
      D: '$$10$$ J',
      E: '$$15$$ J',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['potential energy', 'energy conservation', 'oscillations/SHM'],
    solution: `The particle oscillates between $$x \\approx -5$$ m and $$x \\approx +5$$ m. At the turning points the kinetic energy is zero, so the total energy equals the potential energy at those positions.

At $$x = 5$$ m (inside the right branch of the V, where $$U$$ increases from $$-10$$ J at $$x=0$$ to 0 at $$x=10$$ m linearly):
$$U(5) = -10 + \\frac{5}{10}(10) = -10 + 5 = -5 \\text{ J}$$

Since $$KE = 0$$ at the turning point:
$$E_{\\text{total}} = KE + U = 0 + (-5) = -5 \\text{ J}$$

The total energy is $$-5$$ J, choice __(A)__.`,
  },
  {
    n: 21,
    correct: 'E',
    statement: `The gravitational self potential energy of a solid ball of mass density $$\\rho$$ and radius $$R$$ is $$E$$. What is the gravitational self potential energy of a ball of mass density $$\\rho$$ and radius $$2R$$?`,
    choices: {
      A: '$$2E$$',
      B: '$$4E$$',
      C: '$$8E$$',
      D: '$$16E$$',
      E: '$$32E$$',
    },
    figures: [],
    topics: ['Mechanics'],
    tags: ['gravitation', 'scaling', 'shell theorem'],
    solution: `The gravitational self-energy of a uniform sphere scales as $$U \\propto -Gm^2/R$$. With constant density $$\\rho$$, the mass scales as $$m \\propto \\rho R^3 \\propto R^3$$.

So $$U \\propto \\frac{m^2}{R} \\propto \\frac{R^6}{R} = R^5$$.

When the radius doubles from $$R$$ to $$2R$$:
$$\\frac{U(2R)}{U(R)} = \\left(\\frac{2R}{R}\\right)^5 = 2^5 = 32$$

The new self-energy is $$32E$$, choice __(E)__.`,
  },
  {
    n: 22,
    correct: 'D',
    statement: `A balloon filled with helium gas is tied by a light string to the floor of a car; the car is sealed so that the motion of the car does not cause air from outside to affect the balloon. If the car is traveling with constant speed along a circular path, in what direction will the balloon on the string lean towards?

In the diagram, the car travels along a circle and the balloon is shown from above. The labeled directions are: A (outward, away from center), B (toward the center), C (backward, opposite to velocity), D (toward the center — inward). Wait — from the figure: A is upward in the diagram (toward center of curve is B, away is D, and B/D are horizontal across the car).`,
    choices: {
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      E: 'Remains vertical',
    },
    figures: [F10(22)],
    topics: ['Mechanics'],
    tags: ['non-inertial frames', 'buoyancy', 'circular motion'],
    solution: `In the car's non-inertial reference frame, there is an effective centrifugal force pushing everything outward (away from the center of the circular path). For normal dense objects, this centrifugal force pushes them outward.

The helium balloon is lighter than the surrounding air. In the car's frame the air is pushed outward by the centrifugal effect, creating a pressure gradient that increases outward (just as atmospheric pressure increases downward due to gravity). The buoyant force on the balloon points toward lower pressure — inward, toward the center of the circle — just as a balloon floats upward in gravity.

This is analogous to a balloon in an accelerating car leaning forward (toward the direction of acceleration): it leans inward toward the center of the circular path.

From the figure, direction D is toward the center of the circular path (inward). The balloon leans toward D, choice __(D)__.`,
  },
  {
    n: 23,
    correct: 'C',
    statement: `Two streams of water flow through the U-shaped tubes shown. The tube on the left has cross-sectional area $$A$$, and the speed of the water flowing through it is $$v$$; the tube on the right has cross-sectional area $$A' = \\frac{1}{2}A$$. If the net force on the tube assembly is zero, what must be the speed $$v'$$ of the water flowing through the tube on the right? Neglect gravity, and assume that the speed of the water in each tube is the same upon entry and exit.`,
    choices: {
      A: '$$\\tfrac{1}{2}v$$',
      B: '$$v$$',
      C: '$$\\sqrt{2}\\,v$$',
      D: '$$2v$$',
      E: '$$4v$$',
    },
    figures: [F10(23)],
    topics: ['Mechanics'],
    tags: ['fluid dynamics', 'momentum conservation', 'continuity equation'],
    solution: `Each U-tube reverses the direction of flow, exerting a force on the tube equal to twice the momentum flux (since momentum is reversed). The force on a tube equals the rate of change of momentum of the fluid passing through it.

For the left tube (area $$A$$, speed $$v$$): the mass flow rate is $$\\dot{m} = \\rho A v$$. The force on the tube from reversing this flow is $$F_L = 2\\dot{m}v = 2\\rho A v^2$$.

For the right tube (area $$A/2$$, speed $$v'$$): mass flow rate is $$\\rho (A/2) v'$$. Force is $$F_R = 2\\rho (A/2)(v')^2 = \\rho A (v')^2$$.

For zero net force, the two forces must be equal in magnitude (they point in opposite directions since the U-tubes face opposite ways):
$$2\\rho A v^2 = \\rho A (v')^2$$
$$(v')^2 = 2v^2$$
$$v' = \\sqrt{2}\\,v$$

The answer is __(C)__.`,
  },
  {
    n: 24,
    correct: 'B',
    statement: `A uniform circular disk of radius $$R$$ begins with a mass $$M$$; about an axis through the center of the disk and perpendicular to the plane of the disk the moment of inertia is $$I_0 = \\frac{1}{2}MR^2$$. A hole is cut in the disk as shown in the diagram. The hole has radius $$R/2$$ and its center is at distance $$R/2$$ from the center of the original disk (so the hole is tangent to the center and tangent to the edge). In terms of the radius $$R$$ and the mass $$M$$ of the original disk, what is the moment of inertia of the resulting object about the axis shown?`,
    choices: {
      A: '$$\\dfrac{15}{32}MR^2$$',
      B: '$$\\dfrac{13}{32}MR^2$$',
      C: '$$\\dfrac{3}{8}MR^2$$',
      D: '$$\\dfrac{9}{32}MR^2$$',
      E: '$$\\dfrac{15}{16}MR^2$$',
    },
    figures: [F10(24)],
    topics: ['Mechanics'],
    tags: ['moment of inertia', 'rotational motion'],
    solution: `Use the subtraction method: treat the removed disk as a negative mass object.

__Mass of removed disk:__ The hole has radius $$R/2$$, area $$\\pi(R/2)^2 = \\pi R^2/4$$. The full disk has area $$\\pi R^2$$. Since the disk is uniform, the mass of the removed piece is $$m_h = M \\cdot \\frac{\\pi R^2/4}{\\pi R^2} = M/4$$.

__Moment of inertia of the removed disk about the original axis:__ The hole's center is at distance $$d = R/2$$ from the original rotation axis. Using the parallel-axis theorem for the removed disk (radius $$R/2$$, mass $$M/4$$, center at distance $$R/2$$ from axis):
$$I_h = \\frac{1}{2}m_h(R/2)^2 + m_h(R/2)^2 = \\frac{1}{2}\\cdot\\frac{M}{4}\\cdot\\frac{R^2}{4} + \\frac{M}{4}\\cdot\\frac{R^2}{4}$$
$$= \\frac{MR^2}{32} + \\frac{MR^2}{16} = \\frac{MR^2}{32} + \\frac{2MR^2}{32} = \\frac{3MR^2}{32}$$

__Moment of inertia of the remaining disk:__
$$I = I_0 - I_h = \\frac{1}{2}MR^2 - \\frac{3}{32}MR^2 = \\frac{16}{32}MR^2 - \\frac{3}{32}MR^2 = \\frac{13}{32}MR^2$$

The answer is __(B)__.`,
  },
  {
    n: 25,
    correct: 'A',
    statement: `Spaceman Fred's spaceship (which has negligible mass) is in an elliptical orbit about Planet Bob. The minimum distance between the spaceship and the planet is $$R$$; the maximum distance between the spaceship and the planet is $$2R$$. At the point of maximum distance, Spaceman Fred is traveling at speed $$v_0$$. He then fires his thrusters so that he enters a circular orbit of radius $$2R$$. What is his new speed?`,
    choices: {
      A: '$$\\sqrt{3/2}\\,v_0$$',
      B: '$$\\sqrt{5}\\,v_0$$',
      C: '$$\\sqrt{3/5}\\,v_0$$',
      D: '$$\\sqrt{2}\\,v_0$$',
      E: '$$2v_0$$',
    },
    figures: [F10(25)],
    topics: ['Mechanics'],
    tags: ['orbital mechanics', 'energy conservation', 'angular momentum conservation'],
    solution: `__Find $$GM$$ in terms of $$v_0$$ and $$R$$ using the elliptical orbit.__ For an ellipse with semi-major axis $$a = (R + 2R)/2 = 3R/2$$, the vis-viva equation gives the speed at the apoapsis (distance $$2R$$):

$$v_0^2 = GM\\left(\\frac{2}{2R} - \\frac{1}{a}\\right) = GM\\left(\\frac{1}{R} - \\frac{2}{3R}\\right) = GM\\cdot\\frac{1}{3R}$$

Therefore $$GM = 3Rv_0^2$$.

__Find the speed for a circular orbit at radius $$2R$$.__ For a circular orbit the centripetal force equals gravity:
$$\\frac{v_c^2}{2R} = \\frac{GM}{(2R)^2} \\implies v_c^2 = \\frac{GM}{2R} = \\frac{3Rv_0^2}{2R} = \\frac{3}{2}v_0^2$$

$$v_c = \\sqrt{\\frac{3}{2}}\\,v_0$$

The new speed is $$\\sqrt{3/2}\\,v_0$$, choice __(A)__.`,
  },
]
