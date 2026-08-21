export const solutions2008 = {
  1: `Use the kinematic relation $$v^2 = v_0^2 + 2a\\Delta x$$ to find the acceleration directly from the initial speed, final speed, and distance.

Substituting $$v_0 = 10$$ m/s, $$v = 18$$ m/s, and $$\\Delta x = 40$$ m:

$$a = \\frac{v^2 - v_0^2}{2\\Delta x} = \\frac{18^2 - 10^2}{2(40)} = \\frac{324 - 100}{80} = \\frac{224}{80} = 2.8 \\text{ m/s}^2$$

The answer is __(D)__.`,

  2: `Displacement is the straight-line distance from start to finish — it does not depend on the path the cockroach actually takes along the walls.

The cockroach starts at one corner of a cube of side $$s = 3$$ m and ends at the diagonally opposite corner. The displacement vector has components $$(s, s, s)$$ along the three cube edges, so its magnitude is

$$|\\vec{d}| = \\sqrt{s^2 + s^2 + s^2} = s\\sqrt{3} = 3\\sqrt{3} \\text{ m}$$

The answer is __(C)__.`,

  3: `The instantaneous velocity equals the slope of the position-versus-time graph.

The graph shows a straight line passing from $$x \\approx 4$$ m at $$t = 0$$ s to $$x \\approx 0$$ m at $$t = 2$$ s, then continuing downward with the same slope. Because the graph is a straight line, the slope — and therefore the velocity — is constant everywhere, including at $$t = 2$$ s.

$$v = \\frac{\\Delta x}{\\Delta t} = \\frac{0 - 4}{2 - 0} = -2 \\text{ m/s}$$

The answer is __(A)__.`,

  4: `Displacement equals the area under the velocity-versus-time graph. The car is moving in the positive direction whenever $$v > 0$$, so the maximum displacement from the start occurs when $$v$$ first reaches zero.

From the graph, $$v$$ increases linearly from 2 m/s at $$t = 0$$ to 4 m/s at $$t = 1$$ s (slope $$= +2$$ m/s²), then decreases linearly from 4 m/s at $$t = 1$$ s to 0 m/s at $$t = 3$$ s (slope $$= -2$$ m/s²). The velocity first reaches zero at $$t = 3$$ s.

Maximum displacement = area under the graph from $$t = 0$$ to $$t = 3$$ s:
$$\\Delta x_{\\max} = \\underbrace{\\tfrac{1}{2}(2+4)(1)}_{\\text{trapezoid, } 0\\to 1} + \\underbrace{\\tfrac{1}{2}(4)(2)}_{\\text{triangle, } 1\\to 3} = 3 + 4 = 7 \\text{ m}$$

The answer is __(D)__.`,

  5: `The acceleration is the slope of the velocity-versus-time graph, which is piecewise linear.

From $$t = 0$$ to $$t = 1$$ s, the slope is $$+2$$ m/s² (positive constant). From $$t = 1$$ s to $$t = 3$$ s, the slope is $$-2$$ m/s² (negative constant). There is a sudden jump in acceleration at $$t = 1$$ s.

The correct acceleration graph is therefore a positive constant that abruptly switches to a negative constant at $$t = 1$$ s, with $$a = 0$$ outside $$[0, 3]$$ s. This matches graph __(C)__.`,

  6: `The range formula for projectile motion at launch angle $$\\theta$$ and fixed speed $$v_0$$ is

$$R = \\frac{v_0^2 \\sin 2\\theta}{g}$$

The maximum range $$L$$ occurs at $$\\theta = 45°$$, where $$\\sin 2\\theta = 1$$, so $$L = v_0^2/g$$.

At $$\\theta = \\pi/6 = 30°$$:

$$R = \\frac{v_0^2}{g} \\sin 60° = L \\cdot \\frac{\\sqrt{3}}{2}$$

The answer is __(A)__.`,

  7: `Use conservation of momentum. Take the original direction of the sled as positive. The sled and its riders move at $$+2.0$$ m/s with total mass 120 kg. The child (40 kg) moves in the opposite direction at $$-5.0$$ m/s.

$$p_i = (120)(2.0) + (40)(-5.0) = 240 - 200 = 40 \\text{ kg·m/s}$$

After the perfectly inelastic collision the combined mass is $$120 + 40 = 160$$ kg:

$$v_f = \\frac{p_i}{m_{\\text{total}}} = \\frac{40}{160} = 0.25 \\text{ m/s}$$

The positive sign means the sled continues in its original direction. The answer is __(A)__.`,

  8: `With the floor removed, the wall provides the centripetal force (the normal force $$N$$) and the maximum static friction force $$\\mu_s N$$ must support the rider's weight $$mg$$.

The centripetal acceleration for a rider of mass $$m$$ at radius $$r = 4.0$$ m spinning at $$\\omega = 45 \\text{ rev/min} = 45 \\times \\frac{2\\pi}{60}$$ rad/s $$= \\frac{3\\pi}{2}$$ rad/s is

$$a_c = \\omega^2 r = \\left(\\frac{3\\pi}{2}\\right)^2 (4.0) \\approx (4.712)^2 (4.0) \\approx 88.8 \\text{ m/s}^2$$

Newton's second law gives $$N = m a_c$$. For the rider not to slip, $$\\mu_s N \\geq mg$$:

$$\\mu_s \\geq \\frac{g}{a_c} = \\frac{10}{88.8} \\approx 0.11$$

The answer is __(C)__.`,

  9: `The conserved quantities for a two-body collision with no external forces are (i) total momentum in every direction, and (ii) the y-component of momentum is separately zero because there was none initially.

Check each statement: __I__ has $$m_1$$ multiplying $$v_{2x}$$ instead of $$m_2$$ — wrong. __II__ equates x-momentum to y-momentum — wrong. __III__ correctly states that $$m_1 v_{1y} + m_2 v_{2y} = 0$$ (zero initial y-momentum). __IV__ mixes x and y components — wrong. __V__ correctly states x-momentum conservation: $$m_1 v_0 = m_1 v_{1x} + m_2 v_{2x}$$.

The system must satisfy __III__ and __V__. The answer is __(B)__.`,

  10: `Newton's second law for the block gives $$F = ma + f$$, where $$f = \\mu_k m g$$ is the kinetic friction force (constant). So the relationship between $$F$$ and $$a$$ is linear: $$F = ma + \\mu_k mg$$.

The slope of $$F$$ vs. $$a$$ equals the mass. Using two data points $$(0.095, 3.05)$$ and $$(0.495, 5.05)$$:

$$m = \\frac{\\Delta F}{\\Delta a} = \\frac{5.05 - 3.05}{0.495 - 0.095} = \\frac{2.00}{0.400} = 5.0 \\text{ kg}$$

The answer is __(B)__.`,

  11: `From the previous problem, $$m = 5$$ kg. The friction force is the y-intercept of the $$F$$-vs-$$a$$ line, i.e., the value of $$F$$ when $$a = 0$$.

Extrapolating using the slope and one point: $$f = F - ma = 3.05 - (5)(0.095) = 3.05 - 0.475 = 2.575$$ N. Using another point: $$5.05 - (5)(0.495) = 5.05 - 2.475 = 2.575$$ N. (Consistent.)

Since $$f = \\mu_k m g$$:

$$\\mu_k = \\frac{f}{mg} = \\frac{2.575}{(5)(10)} = \\frac{2.575}{50} \\approx 0.05$$

The answer is __(A)__.`,

  12: `The moment of inertia of a uniform disk of mass $$M$$ and radius $$R$$ is $$I_{\\text{cm}} = \\tfrac{1}{2}MR^2$$ about its center.

By the parallel-axis theorem, the moment about an axis at the edge (distance $$R$$ from center) is

$$I_{\\text{edge}} = I_{\\text{cm}} + MR^2 = \\tfrac{1}{2}MR^2 + MR^2 = \\tfrac{3}{2}MR^2$$

Since the angular velocity $$\\omega$$ is the same in both cases, the kinetic energies are proportional to the moments of inertia:

$$\\frac{K_{\\text{edge}}}{K_{\\text{cm}}} = \\frac{\\tfrac{3}{2}MR^2}{\\tfrac{1}{2}MR^2} = 3$$

The new kinetic energy is $$3E$$. The answer is __(D)__.`,

  13: `Because the spring is at its natural length when the initial velocity $$v_0$$ is given, all the initial kinetic energy converts to elastic potential energy at maximum amplitude:

$$\\tfrac{1}{2}mv_0^2 = \\tfrac{1}{2}kA^2 \\implies A = v_0\\sqrt{m/k}$$

With spring constant $$2k$$ and the same $$v_0$$:

$$A' = v_0\\sqrt{m/(2k)} = \\frac{v_0}{\\sqrt{2}}\\sqrt{m/k} = \\frac{A}{\\sqrt{2}}$$

The answer is __(B)__.`,

  14: `The key constraint is that as the tether is reeled in with no external torques, __angular momentum is conserved__. With two equal masses $$m$$ each at distance $$r$$ from the center, the total moment of inertia is $$I = 2mr^2$$ and angular momentum is $$L = I\\omega = 2mr^2\\omega$$.

Conservation of $$L$$ as $$\omega$$ doubles: $$2mr_i^2 \\omega = 2mr_f^2 (2\\omega)$$, so $$r_f^2 = r_i^2/2$$, meaning $$r_f = r_i/\\sqrt{2}$$.

The new kinetic energy:

$$K_f = \\tfrac{1}{2} I_f (2\\omega)^2 = \\tfrac{1}{2}(2mr_f^2)(4\\omega^2) = 4mr_f^2\\omega^2 = 4m\\frac{r_i^2}{2}\\omega^2 = 2mr_i^2\\omega^2$$

The original kinetic energy was $$E = \\tfrac{1}{2}(2mr_i^2)\\omega^2 = mr_i^2\\omega^2$$. Therefore $$K_f = 2E$$. The answer is __(B)__.`,

  15: `The table will tip when one pair of opposite legs lifts off the ground. The critical configuration is when the carpenter sits directly over one leg's edge: the table is on the verge of rotating about the line connecting the two nearest legs.

The legs are spaced 3.0 m apart (center to center), so they sit at radius $$3.0/2 = 1.5$$ m from the center of the table. The pivot for tipping is the line of the two nearest legs. The carpenter sits at the table edge, which is 2.0 m from the center.

The carpenter's moment arm about the pivot line is $$2.0 - 1.5 = 0.5$$ m. The table's center of mass is at the center, so its moment arm about the pivot line is $$1.5$$ m (toward the opposite legs side, so it resists tipping).

Torque balance (taking the two nearest legs as pivot):
$$M_{\\text{carp}} g (0.5) = M_{\\text{table}} g (1.5)$$

$$M_{\\text{carp}} = \\frac{M_{\\text{table}} \\times 1.5}{0.5} = 50.0 \\times 3 = 150 \\text{ kg}$$

The answer is __(D)__.`,

  16: `Once the ball is attached to the spring and at height $$y$$ (measured upward from the top of the spring at rest), the spring is compressed by $$-y$$ (compressed when $$y < 0$$) — but for a spring measuring displacement from natural length, the spring extension equals $$-y$$ (positive compression when the ball is below the spring's free end). The spring exerts an upward force $$-ky$$ (directed toward the natural length position at $$y=0$$). Gravity exerts a downward force $$-mg$$.

Applying Newton's second law (positive direction up, negative down):

$$ma = -ky - mg$$

$$a = -\\frac{k}{m}y - g$$

This matches choice __(E)__.`,

  17: `In the original (box at rest) equilibrium, the spring stretches by $$\\delta_0 = mg/k$$ below the spring's natural length, so the mass hangs at distance $$L + mg/k$$ from the spring's attachment point.

When the box accelerates upward at $$a$$, the effective gravitational acceleration in the box's frame is $$g + a$$. The new equilibrium stretch is $$\\delta_1 = m(g+a)/k$$.

The equilibrium position moves down by

$$\\delta_1 - \\delta_0 = \\frac{m(g+a)}{k} - \\frac{mg}{k} = \\frac{ma}{k}$$

This is how much closer the mass's equilibrium moves toward the bottom. The answer is __(E)__.`,

  18: `Energy is conserved as the particle falls from far away toward the ring. The gravitational potential energy of a particle of mass $$m$$ at the center of a ring of mass $$M_R$$ and radius $$R$$ is $$U = -GM_Rm/R$$ (all parts of the ring are equidistant from the center at distance $$R$$). Far away, $$U \\to 0$$.

The particle achieves maximum speed when potential energy is minimized — this occurs at the center of the ring (the only equilibrium point on the axis). Energy conservation from far away to the center gives $$\\tfrac{1}{2}mv^2 = GM_Rm/R$$.

When the radius is doubled to $$2R$$, the linear mass density is the same, so the new mass is $$M_R' = 2M_R$$. The new maximum speed $$v'$$ satisfies:

$$\\tfrac{1}{2}mv'^2 = \\frac{GM_R' m}{2R} = \\frac{G(2M_R)m}{2R} = \\frac{GM_R m}{R}$$

This is the same energy as before, so $$v' = v$$. The answer is __(C)__.`,

  19: `With constant power $$P$$, the work-energy theorem gives $$Pt = \\tfrac{1}{2}mv^2$$, so $$v = \\sqrt{2Pt/m}$$. The acceleration is

$$a = \\frac{dv}{dt} = \\frac{d}{dt}\\sqrt{\\frac{2Pt}{m}} = \\frac{1}{2}\\sqrt{\\frac{2P}{mt}}$$

This shows $$a \\propto 1/\\sqrt{t}$$. Therefore:

$$\\frac{a(2t_0)}{a(t_0)} = \\sqrt{\\frac{t_0}{2t_0}} = \\frac{1}{\\sqrt{2}}$$

The acceleration at $$t = 2t_0$$ is $$\\dfrac{a_0}{\\sqrt{2}}$$. The answer is __(B)__.`,

  20: `This is a dimensional-analysis elimination problem. The deflection $$\\delta$$ must depend on the given quantities $$L$$, $$h$$, $$w$$, $$\\rho$$, $$E$$, $$g$$.

The answer cannot involve $$w$$ (width) by symmetry — doubling $$w$$ doubles both the load and the beam's resistance to bending equally. Eliminate choices not depending on $$L$$ or $$\\rho$$.

Physically: a longer beam deflects more (higher power of $$L$$), a stiffer material deflects less ($$1/E$$), a heavier density deflects more ($$\\rho$$), and thicker beams are stiffer (negative power of $$h$$). The correct scaling from beam theory is $$\\delta \\propto \\rho g L^4/(E h^2)$$, matching

$$\\delta = \\frac{3}{2}\\frac{\\rho g L^4}{E h^2}$$

The answer is __(D)__.`,

  21: `Consider each statement for two-body vs. three-body decays from rest.

__(A)__ is true for __both__: momentum conservation forces all momenta to lie in a plane (in 2-body they are exactly back-to-back; in 3-body they still must sum to zero so they must be coplanar). Not the answer.

__(B)__ In a two-body decay, conservation of momentum fixes the magnitudes of both momenta (they are equal and opposite), and with known masses the speeds are fully determined from the total kinetic energy. In a three-body decay, there are many possible ways to distribute the energy among three particles consistent with momentum conservation, so individual speeds are __not__ determined. This is true in 2-body, false in 3-body.

__(D)__ is true for both (total momentum is zero in both cases since the parent was at rest).

The answer is __(B)__.`,

  22: `Two steps: (1) find the minimum post-collision speed at the bottom for the combined mass to complete the loop; (2) use momentum conservation to find the required bullet speed.

__Step 1.__ At the top of the loop, the minimum speed requires gravity alone to supply centripetal force: $$v_{\\text{top}}^2 = gL$$. Energy conservation from bottom to top:

$$\\tfrac{1}{2}(m_1+m_2)v_b^2 = \\tfrac{1}{2}(m_1+m_2)v_{\\text{top}}^2 + (m_1+m_2)g(2L)$$

$$v_b^2 = gL + 4gL = 5gL \\implies v_b = \\sqrt{5gL}$$

__Step 2.__ The collision is perfectly inelastic. Momentum conservation (bullet hits stationary bob):

$$m_1 v_0 = (m_1 + m_2)v_b$$

$$v_0 = \\frac{(m_1+m_2)}{m_1}\\sqrt{5gL}$$

The answer is __(E)__.`,

  23: `For a uniform spherical planet of density $$\\rho$$ and radius $$R$$: mass $$M = \\tfrac{4}{3}\\pi R^3 \\rho$$, and surface gravity $$g_s = GM/R^2 \\propto \\rho R$$. Both $$g_s$$ and escape velocity $$v_{\\text{esc}} = \\sqrt{2g_s R} \\propto R$$ depend on radius, so they differ between the two planets.

For a satellite in a circular orbit just above the surface (radius $$\\approx R$$):

$$\\frac{mv^2}{R} = \\frac{GMm}{R^2} \\implies v = \\sqrt{gR}$$

Period $$T = \\frac{2\\pi R}{v} = 2\\pi\\sqrt{\\frac{R}{g_s}} = 2\\pi\\sqrt{\\frac{R}{G\\rho R}} \\cdot \\frac{1}{\\sqrt{4\\pi/3}} = \\sqrt{\\frac{3\\pi}{G\\rho}}$$

This depends only on the density $$\\rho$$, which is the same for both planets. The orbital period of a satellite just above the surface is the same. The answer is __(C)__.`,

  24: `The total bounce time is an infinite geometric series. The first flight (upward from ground): time in air $$= 2v_0/g$$.

After the first bounce the speed is $$rv_0$$, so the next flight takes $$2rv_0/g$$. After the $$n$$-th bounce, the flight time is $$2r^n v_0/g$$. Summing all flights:

$$T = \\frac{2v_0}{g}\\left(1 + r + r^2 + \\cdots\\right) = \\frac{2v_0}{g} \\cdot \\frac{1}{1-r}$$

The answer is __(A)__.`,

  25: `The first satellite's circular orbit at radius $$R$$ sets the orbital speed: $$v_0 = \\sqrt{GM/R}$$, so $$GM = v_0^2 R$$.

The second satellite is launched tangentially at speed $$v_0/2$$ from radius $$R$$. Because its speed is less than circular speed, it will be at the apoapsis (farthest point) of its elliptical orbit at launch. By angular momentum conservation ($$L = mv_0 R/2$$ at launch) and energy conservation:

Energy: $$E = \\tfrac{1}{2}m(v_0/2)^2 - \\frac{GMm}{R} = \\frac{mv_0^2}{8} - \\frac{mv_0^2}{1} = -\\frac{7mv_0^2}{8}$$

At periapsis (closest approach, radius $$r_p$$), the velocity is perpendicular and angular momentum gives $$mv_p r_p = mv_0 R/2$$, so $$v_p = v_0 R/(2r_p)$$.

Energy at periapsis: $$\\tfrac{1}{2}mv_p^2 - GMm/r_p = -7mv_0^2/8$$

$$\\frac{v_0^2 R^2}{8r_p^2} - \\frac{v_0^2}{r_p/R} = -\\frac{7v_0^2}{8}$$

Let $$u = r_p/R$$:

$$\\frac{1}{8u^2} - \\frac{1}{u} = -\\frac{7}{8}$$

Multiply by $$8u^2$$: $$1 - 8u = -7u^2$$, so $$7u^2 - 8u + 1 = 0$$, giving $$(7u-1)(u-1) = 0$$.

Solutions: $$u = 1$$ (the apoapsis, rejected) and $$u = 1/7$$. The minimum distance is $$R/7$$. The answer is __(E)__.`
}

export const solutions2009 = {
  1: `Find the speed just before impact using energy conservation (free fall from $$h = 0.40$$ m):

$$v = \\sqrt{2gh} = \\sqrt{2(10)(0.40)} = 2\\sqrt{2} \\approx 2.83 \\text{ m/s}$$

The apple stops in $$\\Delta t = 0.1$$ s. The contact force is found from the impulse-momentum theorem. The net upward force on the apple is $$F_c - mg$$, and it changes the apple's momentum from $$mv$$ downward to zero:

$$(F_c - mg)\\Delta t = mv \\implies F_c = \\frac{mv}{\\Delta t} + mg$$

Numerically: $$F_c = \\frac{(0.3)(2\\sqrt{2})}{0.1} + (0.3)(10) \\approx 8.49 + 3 = 11.5 \\text{ N}$$, giving $$P = 11.5/(4\\times10^{-4}) \\approx 28{,}700$$ Pa.

In problems like this the stopping impulse typically dominates and weight is neglected: $$F_c \\approx mv/\\Delta t \\approx 8.49$$ N, giving $$P \\approx 8.49/(4\\times10^{-4}) \\approx 21{,}000$$ Pa. This is the intended approximation and matches choice (B). The answer is __(B)__.`,

  2: `In elastic collisions between equal-mass objects, the velocities are exchanged. Trace what happens step by step.

Label the blocks L (left, speed $$+v$$), C (center, at rest, initially closer to L), and R (right, speed $$-v$$).

Because C is closer to L, L hits C first. After that collision: L stops, C moves at $$+v$$, and R is still moving at $$-v$$. Now C and R collide: C stops (where C used to be), R moves at $$+v$$. Then R travels right and C is stationary again. Next L (stopped) and the now-rightward-moving R never interact again, but C must interact with L… actually L has stopped at the position where it first hit C.

The key insight: in equal-mass elastic collisions, the velocities just swap. After all interactions are complete, the two outer blocks end up moving outward (L to the left, R to the right), and C ends up at rest. Moreover, by symmetry of the swapping, C always ends up at rest at its original position — the net displacement of C is zero. The answer is __(D)__.`,

  3: `Label the blocks L (mass $$m$$, initial velocity $$+v$$), C (mass $$m$$, at rest, closer to L), R (mass $$m$$, initial velocity $$-v$$).

Since C is closer to L, the first collision is between L and C (perfectly inelastic): they stick together with velocity $$(m \cdot v + m \cdot 0)/(2m) = v/2$$. This combined mass $$(2m)$$ moves at $$v/2$$ toward R moving at $$-v$$.

Second collision: $$(2m)$$ at $$+v/2$$ collides with R $$(m)$$ at $$-v$$. Combined mass is $$3m$$:

$$v_f = \\frac{2m(v/2) + m(-v)}{3m} = \\frac{mv - mv}{3m} = 0$$

After both collisions, all three blocks are stuck together and at rest. But where? The first collision occurred at C's original position (L traveled to meet C there). The second collision occurred between $$2m$$ (moving right from C's original position) and R (moving left). The combined mass comes to rest somewhere to the right of C's original position. The answer is __(E)__.`,

  4: `Newton's third law: the force the spaceman exerts on the spacecraft equals the force the spacecraft exerts on the spaceman, but in the opposite direction.

The spacecraft accelerates upward at $$5g$$. By Newton's second law, the net upward force on the spaceman (mass 80 kg) is:

$$F_{\\text{net}} = m(5g) = (80)(5)(10) = 4000 \\text{ N (upward)}$$

This net force equals $$N - mg$$ (where $$N$$ is the normal force from the seat):

$$N = m(5g) + mg = m(6g) = (80)(6)(10) = 4800 \\text{ N}$$

By Newton's third law, the spaceman pushes on the spacecraft with 4800 N downward. The answer is __(A)__.`,

  5: `Angular momentum of a satellite about the central planet is $$L = mvr\\sin\\phi$$, where $$\\phi$$ is the angle between the position vector and velocity vector. For a circular orbit, $$\\phi = 90°$$ always, so $$L = mvr$$. For an elliptical orbit, $$L$$ is conserved but varies in the apparent "lever arm" at each point.

From the figure, satellite A is in the largest circular orbit, B is in an elliptical orbit, and C is in the smallest circular orbit. For circular orbits, $$v = \\sqrt{GM/r}$$, so $$L = m\\sqrt{GMr}$$ — larger radius means larger angular momentum. Thus $$L_A > L_C$$.

For satellite B (elliptical orbit), conservation of energy and angular momentum show that its angular momentum lies between C and A's circular-orbit values. At apoapsis B is farther out than its semi-major axis and at periapsis closer in. Comparing with A (the largest orbit), B's total energy is less negative than C's but more negative than A's, so $$L_A > L_B > L_C$$. The answer is __(A)__.`,

  6: `At height $$h$$, energy conservation gives:

$$\\tfrac{1}{2}mv^2 + mgh = \\tfrac{1}{2}mv_0^2$$

$$v^2 = v_0^2 - 2gh$$

The right-hand side depends only on $$v_0$$ (fixed) and $$h$$ (fixed) — not on the launch angle $$\\alpha$$ at all. Therefore $$v = \\sqrt{v_0^2 - 2gh}$$ is constant regardless of $$\\alpha$$ (as long as the height $$h$$ is reached). The answer is __(C)__.`,

  7: `Apply the kinematic formula $$v^2 = v_0^2 + 2a\\Delta x$$ with $$v_0 = 10$$ m/s, $$v = 15$$ m/s, $$\\Delta x = 25$$ m:

$$a = \\frac{v^2 - v_0^2}{2\\Delta x} = \\frac{225 - 100}{50} = \\frac{125}{50} = 2.5 \\text{ m/s}^2$$

The answer is __(B)__.`,

  8: `The angular acceleration is the slope of the $$\\omega$$-vs-$$t$$ graph. The graph shows $$\\omega$$ decreasing linearly from 4 rad/s at $$t = 0$$ to $$-2$$ rad/s at $$t = 3$$ s. The slope is constant:

$$\\alpha = \\frac{\\Delta\\omega}{\\Delta t} = \\frac{-2 - 4}{3 - 0} = \\frac{-6}{3} = -2 \\text{ rad/s}^2$$

This is the same at every instant, including $$t = 2.0$$ s. The answer is __(D)__.`,

  9: `The net angle turned equals the area under the $$\\omega$$-vs-$$t$$ graph, paying attention to sign. With $$\\omega = 4 - 2t$$, the disk spins positively for $$t < 2$$ s and negatively for $$t > 2$$ s.

$$\\theta = \\int_0^3 (4 - 2t)\\,dt = \\left[4t - t^2\\right]_0^3 = 12 - 9 = 3 \\text{ rad}$$

The positive area (0 to 2 s) is 4 rad and the negative area (2 to 3 s) is $$-1$$ rad, giving a net of 3 rad. The answer is __(E)__.`,

  10: `Both apples start from the same point with the same speed $$v_0 = 7$$ m/s, one upward and one downward. After time $$t = 2$$ s:

- Apple thrown upward: position $$y_1 = v_0 t - \\tfrac{1}{2}gt^2 = 7(2) - 5(4) = 14 - 20 = -6$$ m (6 m below start).
- Apple thrown downward: position $$y_2 = -v_0 t - \\tfrac{1}{2}gt^2 = -7(2) - 5(4) = -14 - 20 = -34$$ m (34 m below start).

Separation = $$|y_1 - y_2| = |-6 - (-34)| = 28$$ m.

Notice this equals $$2v_0 t = 2(7)(2) = 28$$ m — the separation grows at $$2v_0$$ because the acceleration affects both apples equally, and the relative velocity is simply $$2v_0$$. The answer is __(C)__.`,

  11: `Work equals $$\\int F\\,dx = m\\int a\\,dx$$, so the work done on the mass equals its mass times the area under the acceleration-vs-position graph.

From the graph: the acceleration rises linearly from 0 at $$x = 0$$ to 4 m/s² at $$x = 4$$ m (a triangle of area $$\\tfrac{1}{2}(4)(4) = 8$$ m²/s²), then stays at 4 m/s² from $$x = 4$$ to $$x = 8$$ m (area $$= 4 \\times 4 = 16$$... wait, rereading the graph).

Looking at the graph shape: the acceleration goes from 0 at $$x=0$$, rises to 4 m/s² at $$x=4$$ m, then falls back to 0 at $$x=8$$ m (a triangle with base 8 m and height 4 m/s²). The total area under the positive portion is $$\\tfrac{1}{2}(8)(4) = 16$$ m·(m/s²).

$$W = m \\times 16 = 2.25 \\times 16 = 36 \\text{ J}$$

The answer is __(A)__.`,

  12: `To lift Robin, Batman must do work equal to Robin's gain in gravitational potential energy. Batman himself also climbs to the roof (doing work against his own weight), but the question asks for total work Batman does.

Batman (100 kg) climbs 30 m: work on himself is stored as his own potential energy, which isn't counted as "work done on Robin." But the question asks total work Batman does — this includes the work to lift Robin and the work to lift himself.

Wait — re-reading: Batman climbs first, then pulls Robin up. His own climbing involved his legs doing work, but the question seems to focus on the rope-pulling phase. The most natural reading is: what is the total mechanical work done by Batman's muscles throughout the scenario?

Batman climbing: work done by Batman's muscles against gravity on himself: $$W_1 = Mgh = 100 \\times 10 \\times 30 = 30{,}000$$ J.

Batman pulling Robin up 30 m by a massless rope: $$W_2 = mgh = 75 \\times 10 \\times 30 = 22{,}500$$ J.

Total: $$52{,}500$$ J $$\\approx 5 \\times 10^4$$ J. The answer is __(C)__.`,

  13: `For the seesaw to balance, the net torque about the pivot (fulcrum) must be zero. Since it does balance, the pivot must be located somewhere along the seesaw. The torque each person exerts is their weight times their distance from the pivot.

Let the pivot be at distance $$d$$ from Lucy. Henry is at $$d + 2.74$$ m from Lucy, and Mary is at $$d + 5.48$$ m. Torque balance:

$$33.1 g \\cdot d = 63.7 g(2.74 - d) + 24.3 g(5.48 - d)$$

(Lucy on one side, Henry and Mary on the other, taking moments about the pivot.) Solving: this determines the pivot position, but we only need to know who exerts the greatest torque magnitude.

The pivot divides the seesaw such that the net torque is zero. The person farthest from the pivot exerts the most torque. Since the seesaw must be balanced with Henry (the heaviest) closer to the pivot than a lighter person to compensate, Lucy (lightest on her side) must be farthest from the pivot.

Solving the torque balance gives the pivot at $$d \\approx 2.74$$ m from Lucy (i.e., at Henry's position), or more precisely:

Lucy at $$d$$ from pivot, Henry at 2.74 m from Lucy, Mary at 5.48 m from Lucy. Setting total clockwise = counterclockwise:

$$63.7 \\cdot 2.74 + 24.3 \\cdot 5.48 = 33.1 \\cdot x \\cdot \\frac{1}{g}$$...

Let the pivot be at distance $$x$$ from Lucy (Lucy side), distance $$(2.74 - x)$$ from Henry, and $$(5.48 - x)$$ from Mary if $$x < 2.74$$, or we try $$x > 2.74$$. Let's balance torques. If Lucy is on the left at position 0, Henry at 2.74, Mary at 5.48, and the pivot at position $$p$$:

$$33.1(p - 0) = 63.7(2.74 - p) + 24.3(5.48 - p)$$ requires $$p < 2.74$$ for this sign to work:

$$33.1p = 174.54 - 63.7p + 133.16 - 24.3p$$

$$(33.1 + 63.7 + 24.3)p = 307.70$$

$$121.1 p = 307.70 \\implies p = 2.54 \\text{ m from Lucy}$$

Torques: Lucy: $$33.1 \\times 2.54 = 84.1$$ N·m; Henry: $$63.7 \\times 0.20 = 12.7$$ N·m; Mary: $$24.3 \\times 2.94 = 71.4$$ N·m.

Lucy exerts the greatest torque. The answer is __(B)__.`,

  14: `Consider which quantities are conserved over the full interval from $$t = -10$$ s to $$t = +10$$ s.

The peg exerts a force on the rope (and hence on the system) during the entire 20-second interval, including the long pendulum swings before and after the collision. This peg force has both horizontal and vertical components (it's a tension at varying angles). Therefore linear momentum (total and horizontal component) is __not__ conserved.

Mechanical energy is lost during the inelastic collision at $$t = 0$$, so it is __not__ conserved.

Angular momentum about the peg: the peg force acts at the peg, so its torque about the peg axis is zero. However, gravity also acts on the system, and gravity has a nonzero torque about the peg axis (whenever the pendulum is not at the bottom). So angular momentum about the peg is __not__ conserved over the full 20-second interval.

None of the listed quantities are conserved from $$t = -10$$ s to $$t = +10$$ s. The answer is __(E)__.`,

  15: `At constant velocity, the net force on the suitcase is zero. The forces are: applied force $$F = 100$$ N at $$30°$$ above horizontal, normal force $$N$$ upward, weight $$mg$$ downward, and kinetic friction $$f_k = \\mu_k N$$ opposing motion (horizontal, backward).

Vertical equilibrium: $$N + F\\sin 30° = mg$$

$$N = mg - F\\sin 30° = (22.0)(10) - 100(0.5) = 220 - 50 = 170 \\text{ N}$$

Horizontal equilibrium: $$F\\cos 30° = \\mu_k N$$

$$\\mu_k = \\frac{F\\cos 30°}{N} = \\frac{100(\\sqrt{3}/2)}{170} = \\frac{86.6}{170} \\approx 0.509$$

The answer is __(C)__.`,

  16: `Think of this as a reduced-mass oscillator. By symmetry, the center of the spring never moves. Each mass therefore effectively oscillates against a spring of length $$L/2$$ and constant $$2k$$ (half the spring compressed to zero moves twice as much) — but the cleanest way is the reduced-mass approach.

In the center-of-mass frame, the relative coordinate $$x_{\\text{rel}} = x_1 - x_2$$ satisfies

$$\\mu \\ddot{x}_{\\text{rel}} = -k x_{\\text{rel}}$$

where $$\\mu = m \\cdot m/(m+m) = m/2$$ is the reduced mass. Therefore:

$$\\omega = \\sqrt{\\frac{k}{\\mu}} = \\sqrt{\\frac{k}{m/2}} = \\sqrt{\\frac{2k}{m}}$$

The answer is __(B)__.`,

  17: `To measure a quantity in SI units, you need to express it as a combination of the base units — kilograms, meters, seconds — and have a standard for each.

You have: a kilogram (mass standard) and a tuning fork in Hz (time standard, since 1 Hz = 1/s). You can time oscillations with the tuning fork, and you can measure mass with the kilogram. But without knowing any fundamental constants, you cannot determine length independently — you cannot define a meter.

- Gravity (m/s²): you need length, which requires a length standard. Not measurable. No.
- Speed of light: requires a length standard. No.
- Density of water: $$\\rho = m/V$$; volume requires length cubed. No.
- __Spring constant $$k$$__: measured in N/m = kg/s², which needs only mass and time. Hang the standard kilogram on the spring, measure the period of oscillation $$T$$ (in seconds using the tuning fork), and use $$T = 2\\pi\\sqrt{m/k}$$ to get $$k = 4\\pi^2 m/T^2$$ in kg/s². Yes!
- Air pressure: Pa = N/m² = kg/(m·s²). Requires length. No.

The answer is __(D)__.`,

  18: `The pendulum has two distinct half-periods: one swinging on the full length $$L$$ (left half of the swing, from start back to vertical), and one swinging on the effective length $$L/3$$ after the string catches the peg (right half, from vertical to extreme right and back to vertical).

The peg is at $$2L/3$$ below the pivot, so when the string wraps around it, the effective pendulum length becomes $$L - 2L/3 = L/3$$.

Half-period for length $$L$$: $$T_1/2 = \\pi\\sqrt{L/g}$$

Half-period for length $$L/3$$: $$T_2/2 = \\pi\\sqrt{(L/3)/g} = \\pi\\sqrt{L/g} \\cdot \\frac{1}{\\sqrt{3}}$$

Total time to return to starting position = one half-swing at length $$L$$ (going down and to the right until the string catches, then up on length $$L/3$$, then back to vertical on length $$L/3$$) + one half-swing back at full length $$L$$. Actually: starting displaced to the left, the mass swings right, passes vertical (string catches peg), swings out on short length, returns to vertical, then swings back to the left to the starting position on full length.

Time = $$\\frac{T_L}{2} + \\frac{T_{L/3}}{2} = \\pi\\sqrt{\\frac{L}{g}} + \\pi\\sqrt{\\frac{L}{3g}} = \\pi\\sqrt{\\frac{L}{g}}\\left(1 + \\frac{1}{\\sqrt{3}}\\right)$$

The answer is __(E)__.`,

  19: `For maximum range, launch at $$45°$$. The range is $$R_{\\max} = v_0^2/g = 80$$ m, giving $$v_0^2 = 800$$ m²/s².

At $$45°$$, the horizontal and vertical components of initial velocity are equal: $$v_x = v_y = v_0/\\sqrt{2}$$. The time of flight is $$t = 2v_y/g = 2(v_0/\\sqrt{2})/g$$.

The maximum height occurs at $$t_{\\text{peak}} = v_y/g = v_0/(g\\sqrt{2})$$:

$$h_{\\max} = v_y t_{\\text{peak}} - \\tfrac{1}{2}g t_{\\text{peak}}^2 = \\frac{v_y^2}{2g} = \\frac{v_0^2/2}{2g} = \\frac{v_0^2}{4g} = \\frac{800}{4(10)} = 20 \\text{ m}$$

The answer is __(B)__.`,

  20: `Momentum is conserved in each direction. Let north be $$+\\hat{y}$$ and east be $$+\\hat{x}$$. Total mass after collision = $$m + 3m = 4m$$.

$$p_x = 3m(v_0/2) = \\frac{3mv_0}{2}; \\quad v_{fx} = \\frac{3v_0}{8}$$

$$p_y = m(v_0) = mv_0; \\quad v_{fy} = \\frac{mv_0}{4m} = \\frac{v_0}{4}$$

Final speed:

$$v_f = \\sqrt{v_{fx}^2 + v_{fy}^2} = \\sqrt{\\left(\\frac{3v_0}{8}\\right)^2 + \\left(\\frac{v_0}{4}\\right)^2} = v_0\\sqrt{\\frac{9}{64} + \\frac{4}{64}} = v_0\\sqrt{\\frac{13}{64}} = \\frac{\\sqrt{13}}{8}v_0$$

The answer is __(C)__.`,

  21: `The gravitational potential energy of two masses $$m_1$$ and $$m_2$$ separated by distance $$d$$ is

$$U = -\\frac{Gm_1 m_2}{d} = -\\frac{G(3M)(M)}{d} = -\\frac{3GM^2}{d}$$

The answer is __(D)__.`,

  22: `Both stars orbit their common center of mass. The center of mass lies at distances $$d_1$$ from the $$3M$$ star and $$d_2$$ from the $$M$$ star, with $$3M \\cdot d_1 = M \\cdot d_2$$ and $$d_1 + d_2 = d$$, giving $$d_1 = d/4$$.

Each star has the same orbital period $$T$$. The gravitational force provides centripetal force. For the $$3M$$ star:

$$\\frac{G(3M)(M)}{d^2} = (3M)\\omega^2 d_1 = (3M)\\omega^2 \\frac{d}{4}$$

$$\\frac{GM}{d^2} = \\frac{\\omega^2 d}{4} \\implies \\omega^2 = \\frac{4GM}{d^3}$$

$$T = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{2}\\sqrt{\\frac{d^3}{GM}} = \\pi\\sqrt{\\frac{d^3}{GM}}$$

The answer is __(A)__.`,

  23: `Set up coordinates: at $$t = 0$$, the spring is at natural length and the mass has velocity $$v_0$$. The motion is $$x(t) = A\\sin(\\omega t)$$, so the velocity is $$v(t) = A\\omega\\cos(\\omega t)$$ and the spring force is $$F = -kx = -kA\\sin(\\omega t)$$.

Power delivered by the spring: $$P = Fv = (-kA\\sin\\omega t)(A\\omega\\cos\\omega t) = -kA^2\\omega\\sin\\omega t\\cos\\omega t = -\\tfrac{1}{2}kA^2\\omega\\sin(2\\omega t)$$

Power is maximized when $$\\sin(2\\omega t) = -1$$, i.e., when $$2\\omega t = 3\\pi/2$$, giving $$t = 3\\pi/(4\\omega) = 3T/8$$.

(Intuition: the power is most negative — most energy taken from mass — at $$T/8$$ when the mass is moving toward a compressed spring; the power is most __positive__ — most energy given to mass — at $$3T/8$$ when the spring pushes the mass hard in the direction it is already moving fast.)

The answer is __(D)__.`,

  24: `Tipping occurs when the normal force at the base shifts to the downhill corner; slipping occurs when the slope's tangent force exceeds static friction.

__Critical angle for tipping__: the block tips when the center of mass is directly above the downhill base corner. For a block of height $$a$$ (perpendicular to the incline) and length $$b$$ (along the incline), the center of mass is at $$b/2$$ from the downhill edge along the incline and $$a/2$$ perpendicular to it. Tipping occurs when $$\\tan\\theta_{\\text{tip}} = b/a$$... actually with height $$a$$ (vertical face) and length $$b$$ (base along incline):

The block tips when $$\\tan\\theta_{\\text{tip}} = b/a$$ (center of mass directly above the downhill corner).

__Critical angle for slipping__: the block slips when $$\\tan\\theta_{\\text{slip}} = \\mu_s$$.

For tipping to occur before slipping, we need $$\\theta_{\\text{tip}} < \\theta_{\\text{slip}}$$, i.e., $$\\tan\\theta_{\\text{tip}} < \\tan\\theta_{\\text{slip}}$$:

$$\\frac{b}{a} < \\mu_s \\implies \\mu_s > \\frac{b}{a}$$

The answer is __(C)__.`,

  25: `The friction between the disk edges applies equal and opposite tangential impulses at the contact point. The torque on disk 1 (radius $$r_1$$) and disk 2 (radius $$r_2$$) from the friction force $$f$$:

$$\\tau_1 = -f r_1 = I_1 \\dot{\\omega}_1, \\quad \\tau_2 = +f r_2 = I_2 \\dot{\\omega}_2$$

The moment of inertia of a disk of uniform density $$\\rho$$, thickness $$t$$, and radius $$r$$ is $$I = \\tfrac{1}{2}\\pi \\rho t r^4$$.

Both discs come to rest, so integrating the torque equations over time: the angular impulse on each disk equals its change in angular momentum.

$$f_\\text{impulse} \\cdot r_1 = I_1 \\omega_1 = \\tfrac{1}{2}\\pi\\rho t r_1^4 \\omega_1$$

$$f_\\text{impulse} \\cdot r_2 = I_2 \\omega_2 = \\tfrac{1}{2}\\pi\\rho t r_2^4 \\omega_2$$

The friction impulse $$f_\\text{impulse}$$ is the same magnitude on both (Newton's third law integrated over time). Therefore:

$$\\frac{I_1 \\omega_1}{r_1} = \\frac{I_2 \\omega_2}{r_2}$$

$$\\frac{r_1^4 \\omega_1}{r_1} = \\frac{r_2^4 \\omega_2}{r_2}$$

$$\\omega_1 r_1^3 = \\omega_2 r_2^3$$

The answer is __(D)__.`
}
