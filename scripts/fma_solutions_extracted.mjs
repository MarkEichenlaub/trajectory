// Extracted and LaTeX-formatted solutions for F=ma exams.
// Math is rendered via renderStatement.js: use $$...$$ for ALL math (inline KaTeX),
// blank lines separate paragraphs, __text__ is bold. No HTML tags.

export const solutions2024 = {
  1: `The two times $$t_1 = 1\\ \\text{s}$$ and $$t_2 = 2\\ \\text{s}$$ both satisfy $$h = v_0 t - \\frac{1}{2}g t^2$$, so by Vieta's formulas for the quadratic $$\\frac{g}{2}t^2 - v_0 t + h = 0$$ we have $$t_1 t_2 = \\frac{2h}{g}$$. Plugging in the numbers gives $$h = \\frac{g t_1 t_2}{2} = \\frac{(10)(1)(2)}{2} = 10\\ \\text{m}$$.

Alternatively, since the arrow is at the same height at $$t_1 = 1\\ \\text{s}$$ and $$t_2 = 2\\ \\text{s}$$, it reached the apex at $$t = 1.5\\ \\text{s}$$, so the initial vertical speed was $$v_0 = g \\cdot 1.5 = 15\\ \\text{m/s}$$. The average vertical speed in the first second is $$(15 + 5)/2 = 10\\ \\text{m/s}$$, giving $$h = 10\\ \\text{m}$$.`,

  2: `When the rider's feet just lift off, the floor exerts no normal force, so the only contact force is the normal force $$N$$ from the angled wall. That force must balance gravity vertically and provide the centripetal acceleration horizontally:
$$N\\cos\\theta = mg, \\quad N\\sin\\theta = m\\omega^2 R.$$

Dividing gives $$\\tan\\theta = \\omega^2 R / g$$, so $$\\omega = \\sqrt{g\\tan\\theta / R}$$. With $$\\theta = 30°$$ and $$R = 5.0\\ \\text{m}$$, we get $$\\omega = \\sqrt{(10)(1/\\sqrt{3})/5} \\approx 1.9\\ \\text{rad/s}$$.`,

  3: `To balance vertical forces at the top vertex, the vertical rod must pull upward, so it is in __tension__. To balance vertical forces at the sloped joints connecting the diagonal rods to the top, the diagonal rods must push upward, so they are in __compression__. To balance the horizontal components of the diagonal rod forces at the bottom corners, the horizontal rods must pull inward, so they are in __tension__. Therefore both the vertical rod and the horizontal rods are in tension.`,

  4: `While the ball is in the air its speed is $$v(t) = |v_0 - gt|$$, so its kinetic energy is $$K = \\frac{1}{2}m(v_0 - gt)^2$$. This is a concave-up parabola in time, reaching a minimum of zero at the apex. Because the collisions are perfectly elastic, the speed just after each bounce equals the speed just before, so there is no discontinuity in $$K$$ at the bounce times. The graph is therefore a sequence of concave-up parabolic arcs that touch zero at equally spaced times.`,

  5: `The scale reads the vertical component of the contact force the incline exerts on the block. The normal force from the frictionless incline has magnitude $$N = mg\\cos\\theta$$ (directed perpendicular to the surface), and its vertical component is $$N\\cos\\theta = mg\\cos^2\\theta$$. With $$\\theta = 30°$$, the reading is $$mg\\cos^2 30° = mg\\left(\\frac{\\sqrt{3}}{2}\\right)^2 = \\frac{3mg}{4}$$.`,

  6: `The amount of water that lands at any location is proportional to the time the bucket spends there, which is inversely proportional to the bucket's speed. The bucket moves fastest at the bottom (equilibrium) and slowest near the turning points. Therefore the water density on the ground is lowest at the center and highest near the endpoints of the swing, giving a distribution that is high at the edges and has a nonzero minimum in the middle.`,

  7: `The particle accelerates uniformly from rest, travels at constant speed, then decelerates uniformly to rest. As a function of distance, the velocity increases, stays constant, then decreases — mirroring the time-domain shape.

During the uniform-acceleration phase, $$v \propto t$$ while $$x \propto t^2$$, so $$v \propto \sqrt{x}$$: the velocity rises as a square root of distance. By time-reversal symmetry the deceleration phase is a mirror image. The graph of $$v$$ vs $$x$$ is therefore a symmetric shape with square-root-curved flanks and a flat top.`,

  8: `At $$45°$$ the geometry is symmetric: the bottom of the rod moves rightward at speed $$v$$, and by symmetry the top moves downward at the same speed $$v$$. The velocity of the midpoint is the average of those of the two endpoints. The average of a rightward vector $$v$$ and a downward vector $$v$$ has magnitude $$\\frac{v}{\\sqrt{2}}$$.`,

  9: `On dry road the work–energy theorem gives $$\\frac{1}{2}mv^2 = \\mu_d mg x$$, so $$v^2 = 2\\mu_d g x$$ with $$x = 100\\ \\text{m}$$ and $$\\mu_d = 0.8$$. On the mixed road, the same initial kinetic energy is used up by friction on dry pavement (first 50 m) and ice (remaining distance $$y$$):
$$\\mu_d g (50) + \\mu_i g y = \\mu_d g (100).$$

Solving with $$\\mu_i = 0.2$$: $$y = (50)(\\mu_d/\\mu_i) = (50)(0.8/0.2) = 200\\ \\text{m}$$. The total braking distance is $$50 + 200 = 250\\ \\text{m}$$.`,

  10: `In the rotating reference frame, the block is in equilibrium. The left spring (rest length $$\\ell$$, constant $$k$$) has the axis at one end and the block at the other, so its current length is $$r$$ and its extension is $$r - \\ell$$ (it pulls the block toward the axis). The right spring (rest length $$2\\ell$$, constant $$2k$$) connects the block to the far wall at distance $$3\\ell$$, so its current length is $$3\\ell - r$$ and its extension is $$(3\\ell - r) - 2\\ell = \\ell - r$$ if $$r < \\ell$$, or compression $$r - \\ell$$ if $$r > \\ell$$.

For $$r > \\ell$$ (the physical regime), the left spring is stretched (pulls block inward) and the right spring is compressed (also pushes block inward). The net inward spring force is $$(r - \\ell)(k + 2k) = 3k(r - \\ell)$$. In the rotating frame the centrifugal force $$m\\omega^2 r$$ points outward. Balancing:
$$m\\omega^2 r = 3k(r - \\ell) \\implies r = \\frac{3k\\ell}{3k - m\\omega^2}.$$`,

  11: `The sphere was sealed at half sea-level pressure, so inside it the pressure is $$P_{inside} = P_0/2$$. At sea level the outside pressure is $$P_0 = 10^5\\ \\text{Pa}$$, giving a net inward pressure difference $$\\Delta P = P_0 - P_0/2 = P_0/2 = 5\\times10^4\\ \\text{Pa}$$.

The net inward force on one hemisphere acts over the projected circular area $$A = \\pi r^2$$ with $$r = 0.40\\ \\text{m}$$:
$$F = \\Delta P \\cdot \\pi r^2 = (5\\times10^4)(\\pi)(0.16) \\approx 25{,}000\\ \\text{N}.$$`,

  12: `Asteroid C exerts a force directed from P toward C, passing through C itself, so it contributes zero torque about C. Only asteroids A and B contribute.

From the geometry, both A and B are at distance $$\\sqrt{2}\\,d$$ from P. Each gravitational force has magnitude $$F = GM_i m/(\\sqrt{2}\\,d)^2 = GM_i m/(2d^2)$$. The moment arm (perpendicular distance from C to the force line) for each is $$d/\\sqrt{2}$$. Asteroid A (mass $$M$$) gives a torque in one sense and asteroid B (mass $$2M$$) gives a torque in the opposite sense. The net torque is:
$$\\tau = \\frac{GMm}{2d^2}\\cdot\\frac{d}{\\sqrt{2}} \\cdot \\left(2 - 1\\right) = \\frac{GMm}{2d^2}\\cdot\\frac{d}{\\sqrt{2}} = \\frac{1}{2\\sqrt{2}}\\frac{GMm}{d}.$$`,

  13: `Use limiting cases. When $$x = 0$$ the setup is an Atwood machine with equal masses, so the system is in equilibrium and $$T = mg$$. As $$x \\to \\infty$$ the string over the pulley becomes nearly horizontal, so the left block's string segment is essentially horizontal. Force balance on each block gives $$T = mg/2$$. The unique answer choice consistent with $$T(0) = mg$$ and $$T(\\infty) = mg/2$$ (decreasing from $$mg$$ to $$mg/2$$) is choice B. The exact result is $$T = \\frac{h^2 + x^2}{h^2 + 2x^2}\\,mg$$.`,

  14: `When the bead stops sliding relative to the hoop, both have the same velocity. By conservation of horizontal momentum, that common velocity is $$v_{cm} = v_0/2$$ (since total mass is $$2m$$ and initial momentum is $$mv_0$$).

Energy conservation then gives:
$$\\frac{1}{2}mv_0^2 = \\frac{1}{2}(2m)\\left(\\frac{v_0}{2}\\right)^2 + mg\\,\\Delta h.$$

Solving: $$\\Delta h = \\frac{v_0^2}{4g} = \\frac{(2)^2}{4(10)} = 0.10\\ \\text{m} = 10\\ \\text{cm}$$. On a hoop of radius $$R = 20\\ \\text{cm}$$, a rise of $$\\Delta h = R(1 - \\cos\\phi)$$, so $$\\cos\\phi = 1 - 10/20 = 1/2$$, giving $$\\phi = 60°$$.`,

  15: `From the definition of viscosity $$F = \\eta A v / d$$, the units of $$\\eta$$ are $$\\text{kg}/(\\text{m}\\cdot\\text{s})$$. Surface tension $$\\gamma$$ is force per length, so $$[\\gamma] = \\text{kg}/\\text{s}^2$$. Density $$[\\rho] = \\text{kg}/\\text{m}^3$$, length $$[\\ell] = \\text{m}$$.

We need a dimensionless combination proportional to $$\\eta$$. Check $$\\eta/\\sqrt{\\rho\\gamma\\ell}$$: $$[\\sqrt{\\rho\\gamma\\ell}] = \\sqrt{(\\text{kg/m}^3)(\\text{kg/s}^2)(\\text{m})} = \\text{kg}/(\\text{m}\\cdot\\text{s})$$, which matches $$[\\eta]$$. So the Ohnesorge number is $$\\eta/\\sqrt{\\rho\\gamma\\ell}$$.`,

  16: `By dimensional analysis, the maximum range $$d$$ can only depend on $$\\ell$$, $$H$$, $$m$$, and $$g$$. Since $$g$$ is the only quantity with a time dimension, and $$d$$ has no time dimension, $$d$$ cannot depend on $$g$$ at all. Therefore changing the gravitational acceleration (from Earth to Moon) does not change $$d_{\\max}$$, so $$d_{\\text{Moon}} = d_E$$.`,

  17: `When the block's mass doubles, the tension in the rope holding the block increases by $$mg$$. The bottom spring (constant $$3k$$) stretches by $$\\Delta x_3 = mg/(3k)$$. The bottom pulley now has an extra $$2mg$$ of downward force, so the tension in the rope over the top pulley increases by $$mg$$, stretching the top spring ($$k$$) by $$\\Delta x_1 = mg/k$$ and the middle spring ($$2k$$) by $$\\Delta x_2 = mg/(2k)$$.

Because each unit of rope-end displacement equals the sum of all spring extensions (via the pulley geometry), the total displacement of the rope end (where the block hangs) is:
$$\\Delta x = \\Delta x_1 + \\Delta x_2 + \\Delta x_3 = \\frac{mg}{k} + \\frac{mg}{2k} + \\frac{mg}{3k} = \\frac{11mg}{6k}.$$`,

  18: `In the initial circular orbit at radius $$R$$, the speed is $$v_i = \\sqrt{GM/R}$$. The elliptical orbit has periapsis $$R$$ and apoapsis $$2R$$, so its semimajor axis is $$a = 3R/2$$.

Using the orbital energy formula $$E/m = -GM/(2a)$$:
$$-\\frac{GM}{3R} = -\\frac{GM}{R} + \\frac{1}{2}v_f^2,$$

which gives $$v_f^2 = \\frac{4}{3}\\frac{GM}{R}$$. Therefore:
$$\\Delta v = v_f - v_i = \\sqrt{\\frac{4GM}{3R}} - \\sqrt{\\frac{GM}{R}} = \\left(\\frac{2}{\\sqrt{3}} - 1\\right)\\sqrt{\\frac{GM}{R}} \\approx 0.155\\sqrt{\\frac{GM}{R}}.$$`,

  19: `This is a physical pendulum. The moment of inertia about the central axle is:
$$I = mR^2 + \\frac{1}{3}(m + m + m + 3m)R^2 = mR^2 + 2mR^2 = 3mR^2,$$
where the rim contributes $$mR^2$$ and each spoke (rod pivoted at one end) contributes $$\\frac{1}{3}m_i R^2$$.

The heavy spoke has mass $$3m$$ and the opposite spoke has mass $$m$$, giving a net restoring torque when displaced by small angle $$\\theta$$:
$$\\tau = -(3m - m)g\\frac{R}{2}\\sin\\theta \\approx -mgR\\,\\theta.$$

The angular frequency is $$\\omega = \\sqrt{\\tau_{\\max}/(I\\theta)} = \\sqrt{mgR/(3mR^2)} = \\sqrt{g/(3R)}$$.`,

  20: `Suppose each hinge moves a distance $$x$$ from equilibrium and has speed $$v$$. By symmetry all four hinges move the same way (two compress, two expand), so the total kinetic energy is $$K = \\frac{1}{2}(4m)v^2$$.

Each diagonal spring is stretched or compressed by $$2x$$ (the two hinges on a diagonal move toward or away from each other by $$x$$ each), so the total potential energy is $$U = 2 \\times \\frac{1}{2}k(2x)^2 = 4kx^2$$. This is equivalent to a spring of constant $$k_{\\text{eff}} = 8k$$ with a mass $$m_{\\text{eff}} = 4m$$, giving:
$$\\omega = \\sqrt{\\frac{k_{\\text{eff}}}{m_{\\text{eff}}}} = \\sqrt{\\frac{8k}{4m}} = \\sqrt{\\frac{2k}{m}}, \\quad T = 2\\pi\\sqrt{\\frac{m}{2k}}.$$`,

  21: `By continuity, the speed of water leaving the needle is $$v' = v A_1/A_2$$, where $$v$$ is the (slow) piston speed. Since $$A_2 \\ll A_1$$, we have $$v' \\gg v$$. By Bernoulli's principle:
$$P - P_{\\text{atm}} = \\frac{1}{2}\\rho(v'^2 - v^2) \\approx \\frac{1}{2}\\rho v'^2 = \\frac{\\rho v^2 A_1^2}{2A_2^2}.$$

The force required equals this pressure difference times the piston area:
$$F = (P - P_{\\text{atm}})\\,A_1 = \\frac{\\rho v^2 A_1^3}{2A_2^2}.$$`,

  22: `By the shell theorem, the gravitational field __inside__ a spherical shell is exactly zero, so $$g_1 = 0$$ (the point just inside). Just outside, the shell looks like a point mass $$M = 4\\pi\\sigma R^2$$ at the center:
$$g_2 = \\frac{GM}{R^2} = \\frac{G \\cdot 4\\pi\\sigma R^2}{R^2} = 4\\pi G\\sigma.$$

Note that $$R$$ cancels, so the answer is $$|g_1 - g_2| = 4\\pi G\\sigma$$ regardless of the sphere's radius.`,

  23: `In the paddle's rest frame, the ball loses half its kinetic energy each bounce (since it bounces to half the original height). So if the ball hits the paddle with relative speed $$u$$, it leaves with speed $$u/\\sqrt{2}$$.

Let $$v$$ be the ball's speed (downward) just before hitting the paddle (moving upward at $$u_p = 1.0\\ \\text{m/s}$$). The relative approach speed is $$v + u_p$$. After the bounce in the paddle frame, the relative speed is $$(v + u_p)/\\sqrt{2}$$. The ball's speed just after in the lab frame is $$(v + u_p)/\\sqrt{2} - u_p$$.

For steady bouncing, this outgoing speed must equal the incoming speed $$v$$:
$$v = \\frac{v + u_p}{\\sqrt{2}} - u_p.$$

Solving: $$v\\sqrt{2} - v = u_p(1 + \\sqrt{2})$$, so $$v = u_p\\frac{1+\\sqrt{2}}{\\sqrt{2}-1} = u_p(1+\\sqrt{2})^2 \\approx 5.83\\ \\text{m/s}$$. The bouncing height is $$h = v^2/(2g) \\approx 1.7\\ \\text{m}$$.`,

  24: `The terminal velocity satisfies $$F_{\\text{drag}} = F_{\\text{grav}}$$, i.e. $$C\\rho_f R^2 v_t^2 \\sim \\rho_s R^3 g$$, giving $$v_t \\sim \\sqrt{\\rho_s R g/\\rho_f}$$.

At half terminal velocity, the drag is still small compared to gravity (since drag $$\\propto v^2 \\propto \\frac{1}{4}v_t^2$$), so the sphere falls roughly freely: $$v \\sim \\sqrt{gd}$$. Setting $$v \\sim v_t/2$$ gives $$gd \\sim v_t^2/4 \\sim \\rho_s R g/(4\\rho_f)$$, so $$d \\sim (\\rho_s/\\rho_f)R$$.`,

  25: `As the string unwinds, the radius $$r$$ of string remaining on the axle decreases. If the yo-yo has fallen a distance $$z$$ from a string of total length $$\\ell$$, then $$r^2/R^2 = (\\ell - z)/\\ell$$.

Energy conservation gives $$mgz = \\frac{1}{2}mv^2 + \\frac{1}{2}I\\omega^2$$ with $$\\omega = v/r$$ and $$I = mR^2/2$$. Solving for $$v$$:
$$v^2 = \\frac{2gz}{1 + \\ell/(2(\\ell-z))}.$$

This expression has a maximum at roughly $$z = 0.6\\ell$$ and then decreases to zero when the string fully unwinds. So the yo-yo's translational speed actually increases then decreases, meaning its acceleration first points downward and then points __upward__ — none of the simple descriptions match. The answer is "none of the above."`
}

export const solutions2025 = {
  1: `A constant speed of 1 m/s means $$v_x^2 + v_y^2 = 1\\ (\\text{m/s})^2$$ at all times.

In plot I the particle traces a circle of radius 10 m; the amplitude of each component suggests a period of about 10 s, giving a speed of $$2\\pi(10)/10 \\approx 63\\ \\text{m/s}$$, far more than 1 m/s. In plot III the slopes of the linear segments give $$|v_x| = |v_y| \\approx 0.5\\ \\text{m/s}$$, so the speed is $$\\sqrt{0.5^2 + 0.5^2} \\approx 0.71\\ \\text{m/s} \\neq 1\\ \\text{m/s}$$. In plot II the slopes give $$|v_x| = 0.8\\ \\text{m/s}$$ and $$|v_y| = 0.6\\ \\text{m/s}$$, so $$\\sqrt{0.64 + 0.36} = 1\\ \\text{m/s}$$. Only plot II is consistent.`,

  2: `By symmetry the third disk continues along the original axis. The two stationary disks can only be pushed along the line connecting their centers to the incoming disk, which makes an angle of $$30°$$ to the original velocity. If the third disk has final velocity $$v_f$$ (positive = forward) and the other two each have speed $$u$$, then:

Conservation of momentum: $$v = v_f + 2u\\cos30° = v_f + \\sqrt{3}\\,u.$$

Conservation of energy: $$v^2 = v_f^2 + 2u^2.$$

Solving these simultaneously gives $$v_f = -v/5$$ (i.e., $$v/5$$ in the opposite direction).`,

  3: `In the sequential-collision scenario, the incoming disk first hits one of the stationary disks. In a head-on elastic collision between equal masses, all kinetic energy and momentum transfer to the struck disk. But the collision is not perfectly head-on: the component of velocity along the line of centers is $$v\\cos30°$$, and that component is fully transferred. The perpendicular component $$v\\sin30° = v/2$$ remains with the third disk.

The third disk now travels at $$v/2$$ in a direction $$60°$$ from the line toward the remaining stationary disk. The component along that line of centers is $$(v/2)\\cos60° = v/4$$. After the second elastic collision, this component transfers and the third disk retains the perpendicular component $$(v/2)\\sin60°$$... but wait, the question asks for the third disk's final speed after the first of the two subsequent collisions. After the first collision: third disk speed $$= v\\sin30° = v/2$$. After the second (with the remaining stationary disk at $$60°$$): the component along the line of centers is $$(v/2)\\sin30° = v/4$$... The final speed of the third disk is $$v\\sin^2 30° = v/4$$.`,

  4: `The cat always points toward the mouse, so the cat's velocity direction changes continuously. Since the cat moves at constant speed $$u_2$$, its acceleration is purely centripetal (perpendicular to its velocity) with magnitude $$a = u_2 \\omega$$, where $$\\omega$$ is the angular rate at which the cat's heading rotates.

At the instant when $$MC \\perp AA'$$, the cat's velocity points directly toward the mouse (along $$MC$$) and the mouse moves perpendicular to $$MC$$ at speed $$u_1$$. The angular rate at which the direction $$MC$$ rotates equals the transverse speed of the mouse divided by the distance $$L$$: $$\\omega = u_1/L$$. Therefore $$a = u_1 u_2 / L$$.`,

  5: `A force analysis of the top cylinder (weight $$mg$$ downward, normal forces $$N_1$$ from each bottom cylinder at $$60°$$ from vertical, friction forces $$f_1$$ from each bottom cylinder horizontal) and each bottom cylinder (weight $$mg$$, normal from table $$N_2$$, friction from table $$f_2$$, forces from top cylinder) yields:
$$N_1 = \\frac{mg}{2}, \\quad N_2 = \\frac{3mg}{2}, \\quad f_1 = f_2 = \\frac{mg}{2(2+\\sqrt{3})}.$$

Equilibrium requires $$f_1 \\leq \\mu_1 N_1$$ and $$f_2 \\leq \\mu_2 N_2$$, giving:
$$\\mu_1 \\geq \\frac{1}{2+\\sqrt{3}} \\approx 0.27, \\quad \\mu_2 \\geq \\frac{1}{3(2+\\sqrt{3})} \\approx 0.089.$$

Checking the pairs: Pair 2 $$(\\mu_1 = 1/3 \\approx 0.33, \\mu_2 = 1/10 = 0.10)$$ satisfies both. Pair 1 $$(\\mu_1 = 1/2, \\mu_2 = 1/12 \\approx 0.083)$$ fails the $$\\mu_2$$ condition. Pair 3 $$(\\mu_1 = 1/4 = 0.25, \\mu_2 = 1/8 = 0.125)$$ fails the $$\\mu_1$$ condition. Only Pair 2 works.`,

  6: `The ball's speed at the bottom of the ramp is $$v = \\sqrt{2g \\cdot c \\cdot \\Delta h}$$, where $$c$$ is a constant that accounts for rotational kinetic energy (since the ball rolls without slipping, a fixed fraction of the energy goes to rotation). The horizontal range after leaving the ramp scales as $$v$$, so range $$\\propto \\sqrt{\\Delta h}$$.

To get 25 cm from 10 cm, the range must scale by 2.5, so $$\\Delta h$$ must scale by $$2.5^2 = 6.25$$. Starting position A, which is furthest up the ramp, provides this factor, so the answer is Position A.`,

  7: `The middle mass sits at the hinge. Its velocity has two contributions: one from the rotation of the first rod (speed $$l\\omega_1$$) and one from the rotation of the second rod relative to the first (speed $$l\\omega_2$$). Writing out the velocity components:
$$v_{1x} = -l\\omega_1\\sin\\theta_1, \\quad v_{1y} = l\\omega_1\\cos\\theta_1,$$
$$v_{2x} = -l\\omega_1\\sin\\theta_1 - l\\omega_2\\sin\\theta_2, \\quad v_{2y} = l\\omega_1\\cos\\theta_1 + l\\omega_2\\cos\\theta_2.$$

The total energy is kinetic (from all three masses) plus gravitational potential plus the torsional spring energy:
$$E = ml^2\\omega_1^2 + \\frac{1}{2}ml^2\\omega_2^2 + ml^2\\omega_1\\omega_2\\cos(\\theta_1 - \\theta_2) + 2mgl\\sin\\theta_1 + mgl\\sin\\theta_2 + U_s.$$`,

  8: `The frictionless plate cannot exert any torque on the top, so the top's angular momentum is unchanged. In the lab frame the top continues to spin clockwise at $$\\omega$$.

In the frame rotating with the plate (counterclockwise at $$\\omega$$), the apparent angular velocity of the top is:
$$\\omega_{\\text{top, rotating}} = \\omega_{\\text{top, lab}} - \\omega_{\\text{plate}} = (-\\omega) - (+\\omega) = -2\\omega.$$

The negative sign denotes clockwise rotation, so the observer on the plate sees the top spinning clockwise at $$2\\omega$$.`,

  9: `All four circles rotate with the same angular frequency $$\\omega$$ in the same direction. The center of each successive circle is fixed on the previous one and moves at the same angular rate $$\\omega$$. This means the entire nested structure rotates as a rigid body — the relative orientations between all circles never change (like the Moon always facing the same side toward Earth). The mass on $$C_4$$ therefore moves in a perfect circle at constant speed, and its acceleration magnitude is constant.`,

  10: `In a head-on elastic collision where the heavy object (mass $$M$$, speed $$v$$) hits a light stationary object (mass $$m \\ll M$$), the light object acquires speed approximately $$2v$$. Its kinetic energy is:
$$E_m = \\frac{1}{2}m(2v)^2 = 2mv^2 = \\frac{1}{2}Mv^2 \\cdot \\frac{4m}{M}.$$

So the fraction transferred is approximately $$4m/M$$.`,

  11: `In an elastic collision where the light object (mass $$m$$, speed $$v$$) strikes the heavy stationary object (mass $$M \\gg m$$), the light object bounces back with nearly the same speed $$v$$. The impulse delivered to the heavy object is approximately $$2mv$$, so its kinetic energy is:
$$E_M = \\frac{(2mv)^2}{2M} = \\frac{2m^2v^2}{M} = \\frac{1}{2}mv^2 \\cdot \\frac{4m}{M}.$$

The fraction transferred is approximately $$4m/M$$.`,

  12: `The clay (mass $$m_0 = 50\\ \\text{g}$$) sticks to the bob (mass $$m_b = 200\\ \\text{g}$$). By conservation of momentum during the collision:
$$m_0 v_0 = (m_0 + m_b)v_b \\implies v_b = \\frac{(0.05)(20)}{0.25} = 4\\ \\text{m/s}.$$

By energy conservation, the pendulum rises to height:
$$h = \\frac{v_b^2}{2g} = \\frac{16}{20} = 0.8\\ \\text{m}.$$

With pendulum length $$l = 1\\ \\text{m}$$, the maximum angle satisfies $$\\cos\\phi = 1 - h/l = 1 - 0.8 = 0.2 = 1/5$$, so $$\\phi = \\arccos(1/5)$$.`,

  13: `While slipping, kinetic friction acts backward on the ball (reducing $$v$$) and provides a forward torque (increasing $$\\omega$$). Both changes are linear in time since the friction force is constant ($$= \\mu m g$$). The linear speed decreases linearly and the rotational speed (times $$R$$) increases linearly until they meet. At that moment friction drops to zero and both remain constant. The graph shows $$v$$ decreasing linearly to a constant and $$\\omega$$ increasing linearly to a constant, both reaching their final values at the same time.`,

  14: `The friction force provides a linear deceleration $$\\dot{v} = -\\mu g$$ and an angular acceleration $$\\dot{\\omega} = \\mu m g R / I$$. Rolling without slipping begins when $$v = \\omega R$$.

The quantity $$mR^2/I$$ is larger when mass is concentrated near the center. For a solid ball $$I = \\frac{2}{5}mR^2$$, giving $$mR^2/I = 5/2$$. For a thin shell $$I = \\frac{2}{3}mR^2$$, giving $$mR^2/I = 3/2$$. The solid balls reach the rolling condition sooner (with a higher final speed) than the shell. Balls II and III (solid wood and solid rubber) have the same $$I/mR^2$$ ratio and thus the same final speed, which is higher than for Ball I.`,

  15: `Immediately after the impulse, the junction between the two rods has some velocity. Let $$v$$ be the velocity of the center of mass of the massive rod and $$\\Omega$$ its angular velocity. The constraints give (by angular momentum about the pivot and the geometry of the pivot):

The instantaneous center of rotation of the massive rod is at distance $$x = L/3$$ from its center. The geometric relationship between the angle $$\\theta$$ of the massless rod and the angle $$\\phi$$ of the massive rod (from the figure) gives $$\\sin\\phi / (L/3) \\cdot (2/3L) \\approx (2/3L) \\Omega = L\\omega$$ in the small-angle limit, yielding $$\\Omega = \\frac{3}{2}\\omega$$.`,

  16: `The excess pressure inside a soap bubble of radius $$r$$ is $$\\Delta P = 4\\gamma/r$$ (factor of 4 because the bubble has two surfaces). Since $$R_1 < R_2$$, we have $$\\Delta P_1 > \\Delta P_2$$: the pressure inside the smaller bubble is higher. Air flows from high to low pressure, i.e., from the smaller bubble into the larger one. The smaller bubble shrinks and eventually collapses while the larger one grows.`,

  17: `The potential $$U = -k(x^2 + y^2)/2$$ gives a force $$\\vec{F} = k(x\\hat{x} + y\\hat{y})$$ pointing radially outward, proportional to distance from the origin. This force provides no torque about the origin, so angular momentum is conserved.

As the particle moves outward, the radial component of velocity grows while the tangential component (fixed by angular momentum conservation, which requires $$r v_\\perp = \\text{const}$$) decreases relative to the radial component. In the long run, the direction of motion becomes increasingly radial. The equations of motion are $$\\ddot{x} = (k/m)x$$ and $$\\ddot{y} = (k/m)y$$, with solutions $$x(t) = a_1 e^{\\omega t} + b_1 e^{-\\omega t}$$. For large $$t$$ the growing exponential dominates, and the trajectory approaches a straight ray from the origin.`,

  18: `The potential $$U = kxy/2$$ has a saddle shape. The force is $$\\vec{F} = -(k/2)(y\\hat{x} + x\\hat{y})$$. Displacing along $$y = x$$ (i.e., $$x = y = s/\\sqrt{2}$$ for displacement $$s$$) gives $$U = k(s/\\sqrt{2})^2/2 = ks^2/4$$. This is exactly a harmonic potential with spring constant $$k/2$$, giving angular frequency $$\\omega = \\sqrt{k/(2m)}$$ and period:
$$T = 2\\pi\\sqrt{\\frac{2m}{k}}.$$`,

  19: `Wind speed is proportional to height, so at 20 m the wind speed is $$v_{20} = 2v_{10}$$. The power extracted from wind scales as the rate of kinetic energy flux: power $$\\propto (\\text{mass flow rate}) \\times v^2 \\propto v \\times v^2 = v^3$$.

Therefore the power at 20 m is $$2^3 = 8$$ times the power at 10 m:
$$P_{20} = 8 \\times 15\\ \\text{kW} = 120\\ \\text{kW}.$$`,

  20: `After being tossed radially inward, the spanner enters a slightly different elliptical orbit. Tossing inward increases the spanner's speed at that point, so its orbit has greater total energy and slightly longer semimajor axis — meaning a slightly longer period than the ISS.

After one full ISS orbital period (93 min), the spanner is very slightly behind the ISS on the orbit, making this the time the spanner is closest to the astronaut. At any other time the spanner is farther ahead or behind in the orbit, increasing the separation.`,

  21: `By continuity, $$A_1 v_1 = A_2 v_2$$. With $$r_1 = 5\\ \\text{cm}$$, $$r_2 = 2.5\\ \\text{cm}$$ and $$v_1 = 10\\ \\text{cm/s}$$:
$$v_2 = v_1 \\frac{A_1}{A_2} = v_1 \\left(\\frac{r_1}{r_2}\\right)^2 = 10 \\times 4 = 40\\ \\text{cm/s}.$$

The difference is $$v_2 - v_1 = 40 - 10 = 30\\ \\text{cm/s}$$.`,

  22: `By Bernoulli's principle, the pressure difference between the two pipe sections is:
$$\\Delta p = \\frac{1}{2}\\rho(v_2^2 - v_1^2) = \\frac{1}{2}(1000)(0.40^2 - 0.10^2) = \\frac{1}{2}(1000)(0.15) = 75\\ \\text{Pa}.$$

This pressure difference supports a column of water of height $$\\Delta h = \\Delta p/(\\rho g) = 75/((1000)(10)) = 0.0075\\ \\text{m} = 7.5\\ \\text{mm}$$.`,

  23: `The spring constant is $$k = mg/x$$. The fractional uncertainties are: ruler $$\\sigma_l/l = (0.5\\ \\text{mm})/(15\\ \\text{mm}) = 0.033$$; mass $$\\sigma_m/m = (6\\ \\text{g})/(204\\ \\text{g}) = 0.029$$ (half the range of the two measurements); gravity $$\\sigma_g/g \\approx 10^{-4}$$ (negligible).

The fractional uncertainty in $$k$$ is:
$$\\frac{\\sigma_k}{k} = \\sqrt{\\sigma_l^2/l^2 + \\sigma_m^2/m^2} = \\sqrt{0.033^2 + 0.029^2} \\approx 0.044 \\approx 4\\%.$$`,

  24: `Without gravity, the only force on the bead is the constraint force from the rigid rod, which is directed along the rod (radially). This force changes the direction of the bead's velocity but not its magnitude. The bead moves at constant speed $$v$$ along the surface of a sphere of radius $$L$$. Regardless of $$\\theta$$, the bead traces a great circle and must travel a total distance of $$2\\pi L$$ to return to its starting point. The time is:
$$t = \\frac{2\\pi L}{v}.$$`,

  25: `In the rest frame of the prism, the puck starts at rest and slides down a height $$h$$, gaining speed $$v_{\\text{rel}} = \\sqrt{2gh} = v$$ (using the given condition $$v_{\\text{prism}} = \\sqrt{2gh}$$) relative to the prism. When the puck reaches the bottom, it is moving at speed $$v$$ relative to the prism in the horizontal direction. Since the prism has much greater mass, it moves at speed $$v$$ to the right throughout (unaffected by the puck). In the lab frame, the puck's final horizontal velocity is $$v_{\\text{prism}} + v_{\\text{rel}} = v + v = 2v$$.`
}

export const solutionsPractice = {
  1: `All cars reach the same final speed $$v_f = 30\\ \\text{m/s}$$. With constant acceleration $$a$$, the time to reach this speed is $$t = v_f/a$$, and the average speed is $$v_f/2$$, so:
$$x = \\bar{v}\\,t = \\frac{v_f}{2} \\cdot \\frac{v_f}{a} = \\frac{v_f^2}{2a} \\propto \\frac{1}{a}.$$

As $$a \\to 0$$ the distance goes to infinity; as $$a \\to \\infty$$ the distance goes to zero. This is a hyperbola $$x \\propto 1/a$$, which corresponds to plot (d).`,

  2: `Kepler's third law states $$T \\propto a^{3/2}$$, so $$\\omega \\propto T^{-1} \\propto a^{-3/2}$$. For a nearly circular orbit, the area swept per unit time is:
$$\\frac{\\Delta A}{\\Delta t} = \\frac{1}{2}r^2\\omega \\propto a^2 \\cdot a^{-3/2} = a^{1/2}.$$

Alternatively, by dimensional analysis the only combination of $$\\sqrt{GM}$$ (dimensions $$L^{3/2}/T$$) and $$a$$ (dimension $$L$$) that gives $$L^2/T$$ is $$\\sqrt{GMa}$$, confirming $$\\Delta A/\\Delta t \\propto a^{1/2}$$.`,

  3: `Gravity pulls the mass downward with force $$mg$$. The tension $$T$$ in the string must have a vertical component equal to $$mg$$. Since the string makes angle $$\\theta$$ with the horizontal, the vertical component of tension is $$T\\sin\\theta$$. Setting $$T\\sin\\theta = mg$$ gives:
$$T = \\frac{mg}{\\sin\\theta}.$$`,

  4: `We eliminate answer choices using limiting cases.

If $$\\theta = 89°$$, a slope nearly vertical, choice (a) would say fire at $$45° + 89° = 134°$$ (backwards), and choice (d) would say fire below $$45°$$ which is below the slope — clearly wrong. Choice (c) claims the $$y$$-velocity reaches zero at impact, but on a flat hill ($$\\theta = 0$$) the maximum range occurs when the projectile hits at $$45°$$ with both components nonzero, so (c) is wrong.

By dimensional analysis, the maximum range $$R_m$$ must be a function of $$v_0$$, $$g$$, and $$\\theta$$. The only dimensionally correct form is $$R_m = (v_0^2/g)\\,f(\\theta)$$, so $$R_m \\propto v_0^2$$. Choice (b) is correct.`,

  5: `As the ice melts it converts to water. Water is denser than ice, so the melted water occupies less volume than the original ice. The total volume of fluid (oil + water + ice) decreases, so the top surface of the oil goes down.

Before melting, the ice floats at the oil–water interface, displacing some oil and some water. The combined buoyant force equals the ice's weight, so the displaced fluid mass equals the ice mass. Since oil is less dense than water, less water than ice-mass-equivalent volume is displaced. After melting, the ice contributes its full mass as water to the water layer. This additional water volume exceeds what was previously displaced into the water, so the water level rises.

The oil surface falls and the water surface rises.`,

  6: `A stretched spring of cross-section $$A$$ and length $$l$$ obeys Young's modulus: $$T = YA\\,\\Delta l/l$$, so it acts as a spring with constant $$k = YA/l$$. The oscillation frequency is:
$$f = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} = \\frac{1}{2\\pi}\\sqrt{\\frac{YA}{lm}}.$$

With $$Y = 2\\times10^{11}\\ \\text{Pa}$$, $$A = \\pi(0.0015)^2\\ \\text{m}^2$$, $$l = 2\\ \\text{m}$$, $$m = 300\\ \\text{kg}$$:
$$f = \\frac{1}{2\\pi}\\sqrt{\\frac{(2\\times10^{11})(\\pi)(2.25\\times10^{-6})}{(2)(300)}} \\approx 7.7\\ \\text{Hz}.$$`,

  7: `For a circular orbit at the surface of a planet of density $$\\rho$$ and radius $$R$$, the orbital condition $$\\omega^2 R = GM/R^2$$ combined with $$M = \\frac{4}{3}\\pi R^3 \\rho$$ gives $$\\omega^2 = \\frac{4}{3}\\pi G\\rho$$, so the period $$T = 2\\pi/\\omega \\propto \\rho^{-1/2}$$, meaning $$\\rho \\propto T^{-2}$$.

Therefore:
$$\\frac{\\rho_{\\text{Moon}}}{\\rho_{\\text{Earth}}} = \\left(\\frac{T_{\\text{Earth}}}{T_{\\text{Moon}}}\\right)^2 = \\left(\\frac{90}{115}\\right)^2 \\approx 0.61 \\approx 0.6.$$`,

  8: `In uniform circular motion, the velocity $$\\vec{v}$$ is tangent to the circle, the acceleration $$\\vec{a} = -\\omega^2\\vec{r}$$ points radially inward, and the jerk is $$\\vec{j} = d\\vec{a}/dt = -\\omega^2\\vec{v}$$. Since $$\\vec{v}$$ points in the direction of motion, $$\\vec{j} = -\\omega^2\\vec{v}$$ points opposite to the direction of motion.`,

  9: `From the work–energy theorem, $$\\frac{1}{2}mv_0^2 = \\mu m g x$$, giving $$\\mu = v_0^2/(2gx)$$. Numerically: $$\\mu = (5.0)^2/(2 \\cdot 10 \\cdot 6.4) = 25/128 \\approx 0.195$$.

The fractional uncertainty is:
$$\\frac{\\Delta\\mu}{\\mu} = \\sqrt{\\left(\\frac{2\\Delta v_0}{v_0}\\right)^2 + \\left(\\frac{\\Delta x}{x}\\right)^2} = \\sqrt{\\left(\\frac{2(0.3)}{5.0}\\right)^2 + \\left(\\frac{0.5}{6.4}\\right)^2} \\approx 0.14,$$

so $$\\Delta\\mu \\approx 0.028$$. The result is $$\\mu = 0.195 \\pm 0.028$$.`,

  10: `The string must be attached to the right of center because the extra mass on the right would otherwise tip that end down. So $$x_1 > x_2$$.

Each half of the rod must exert equal torque about the string. The torque is (mass) $$\\times$$ (distance from string to center of mass of that half). The left half is a uniform piece of length $$x_1$$ with its center at $$x_1/2$$ from the string. The right half has the same uniform part plus the extra mass nearer the string. One can show (by algebra or by considering special cases) that the center of mass of the right half is closer to the string than the center of the left half is. Equal torques therefore require the right half to be heavier: $$m_1 < m_2$$. The answer is $$x_1 > x_2$$ and $$m_1 < m_2$$.`,

  11: `Doubling the molecule's speed doubles the momentum transferred per collision __and__ doubles the collision rate (since the molecule crosses the container in half the time). The momentum transferred per unit time (force) is therefore multiplied by $$2 \\times 2 = 4$$. Dividing by the wall area gives pressure, so $$P \\propto v^2$$.`,

  12: `Since power is constant, $$P = \\text{const}$$, the kinetic energy grows linearly: $$\\frac{1}{2}mv^2 = Pt$$, giving $$v \\propto t^{1/2}$$.

From $$P = mav$$, we get $$a = P/(mv) \\propto v^{-1} \\propto t^{-1/2}$$. The acceleration decreases as $$t^{-1/2}$$: it is large and decreasing at first, approaching zero but never reaching it. This corresponds to a curve that starts high and asymptotically approaches zero (concave upward on a log scale) — plot (c).`,

  13: `In the limit $$m_1 \\gg m_2$$, the hanging mass $$m_2$$ provides a tiny force, so the rotation is barely perturbed and oscillations are very slow. The only answer that gives a very small frequency when $$m_1 \\gg m_2$$ is $$\\omega = \\sqrt{3m_2 g/[(m_1+m_2)l]}$$, choice (b). (Choices involving $$m_1$$ in the numerator or standalone $$g/l$$ would remain large.)

The exact derivation uses conservation of angular momentum ($$m_1 \\omega_0 l^2 = m_1 \\omega r^2$$) and energy, leading to a restoring term $$\\propto 3m_2 g/[(m_1+m_2)l]$$ for small radial perturbations.`,

  14: `The two springs each have zero rest length and are attached to diametrically opposite points. At any position of the ring, they form two sides of a right triangle inscribed in the circle (since the angle in a semicircle is $$90°$$). The force from each spring is proportional to its length and directed along it.

The tangential component of the net force is proportional to the sum of the projections of the two spring forces onto the tangent. Equivalently, the total potential energy is $$U \\propto l_1^2 + l_2^2$$. But $$l_1^2 + l_2^2 = d^2$$ where $$d$$ is the diameter (a constant), so $$U$$ is the same at every position. No tangential force acts on the ring at any location — the ring is in equilibrium everywhere along the rod.`,

  15: `The cube must tip (not slide) before the applied force $$F$$ reaches a critical value. The pivot is the front bottom edge. Gravity exerts a torque $$mgs/2$$ trying to keep the cube flat. The applied force (at height $$s/2$$ on the rear face) exerts a torque $$Fs/2$$ trying to tip it. For tipping, $$F > mg$$.

For the cube not to slide, the friction force must be at least $$F$$. The maximum static friction is $$\mu mg$$, so we need $$\mu mg \geq F > mg$$, giving $$\mu > 1$$. The minimum coefficient is $$\mu_{\\min} = 1$$.`,

  16: `For method 1 (measuring side length once, then cubing): $$\\Delta V/V = 3\\,\\Delta s/s = 3\\%$$.

For method 2 (measuring three independent sides): $$\\Delta V/V = \\sqrt{(\\Delta l/l)^2 + (\\Delta w/w)^2 + (\\Delta h/h)^2} = \\sqrt{3} \\times 1\\% \\approx 1.73\\%$$.

For method 3 (direct volume measurement): $$\\Delta V/V = 1\\%$$.

Ranking: method 1 has the most uncertainty, method 3 the least: $$1 > 2 > 3$$.`,

  17: `Springs in parallel have $$k_p = k_1 + k_2$$; in series $$k_s = k_1 k_2/(k_1+k_2)$$. Since $$\\omega \\propto \\sqrt{k}$$:
$$\\frac{\\omega_p}{\\omega_s} = \\sqrt{\\frac{k_p}{k_s}} = \\frac{k_1+k_2}{\\sqrt{k_1 k_2}}.$$

Let $$x = k_1/k_2 = \\omega_p/\\omega_s$$. Then $$x = (x+1)/\\sqrt{x}$$, or $$x^{3/2} = x+1$$. Testing the answer choices, $$x \\approx 2.148$$ satisfies this equation.`,

  18: `The spring constant $$k$$ (force per unit deflection) has dimensions $$MT^{-2}$$, and Young's modulus $$Y$$ has dimensions $$ML^{-1}T^{-2}$$. The spring constant can only depend on $$Y$$, the cross-section side $$s$$, and the length $$l$$. By dimensional analysis:
$$k = Y \\cdot s \\cdot f(l/s)$$

for some dimensionless function $$f$$. Since both beams have the same ratio $$l/s$$ (beam 1: $$l/s$$; beam 2: $$2l/(2s) = l/s$$), the function $$f$$ is the same for both. Thus $$k \\propto Ys \\propto s$$, and $$k_2 = 2k_1$$.`,

  19: `The first meter stick has uncertainty $$\\sigma_1 = 0.2\\ \\text{cm}$$. The second (two independent half-meter sticks each with $$0.1\\ \\text{cm}$$) has $$\\sigma_2 = \\sqrt{0.1^2 + 0.1^2} = 0.1\\sqrt{2} \\approx 0.141\\ \\text{cm}$$. The third (cut from a stick with uncertainty $$0.4\\ \\text{cm}$$) has $$\\sigma_3 = 0.4/2 = 0.2\\ \\text{cm}$$. Therefore $$\\sigma_3 = \\sigma_1 > \\sigma_2$$.`,

  20: `The disk has mass $$M$$, and the circular hole can be treated as negative mass $$m_{\\text{hole}} = -M(r/R)^2 = -M/16$$ at its center, which is a distance $$r = R/4$$ above the disk's center.

Moment of inertia of the full disk: $$I_d = \\frac{1}{2}MR^2$$. Moment of inertia of the hole about the disk's center (by parallel axis theorem): $$I_h = \\frac{1}{2}m_{\\text{hole}}r^2 + m_{\\text{hole}}r^2 = \\frac{3}{2}m_{\\text{hole}}r^2$$. Total: $$I = \\frac{1}{2}MR^2 + \\frac{3}{2}m_{\\text{hole}}r^2$$.

When displaced by angle $$\\Delta\\theta$$, the hole's center moves $$r\\,\\Delta\\theta$$ horizontally, giving restoring torque $$\\tau = m_{\\text{hole}}g r\\,\\Delta\\theta$$. Angular frequency:
$$\\omega = \\sqrt{\\frac{|m_{\\text{hole}}|gr}{I}} = \\sqrt{\\frac{2r^3 g}{R^4 - 3r^4}}.$$

With $$r = R/4$$: $$\\omega = \\sqrt{\\frac{2}{67}}\\sqrt{g/R} \\approx 0.17\\sqrt{g/R}$$.`,

  21: `Object $$M$$ slides from height $$4R$$ (above the loop bottom) and arrives at the bottom of the loop with speed $$v_b = \\sqrt{2g(4R)} = \\sqrt{8gR}$$. After the inelastic collision with $$m$$ at rest:
$$v_c = v_b \\frac{M}{M+m}.$$

At the top of the loop (height $$2R$$ above bottom), the minimum speed condition $$v_t^2/R = g$$ gives $$v_t^2 = gR$$. Energy conservation from bottom to top:
$$\\frac{1}{2}v_c^2 = \\frac{1}{2}v_t^2 + 2gR = \\frac{5gR}{2}.$$

So $$v_c^2 = 5gR$$. Combining with the collision equation:
$$8gR\\left(\\frac{M}{M+m}\\right)^2 = 5gR \\implies \\frac{M}{M+m} = \\sqrt{\\frac{5}{8}}.$$

Solving: $$M/m = 1/(\\sqrt{8/5}-1) \\approx 3.77$$.`,

  22: `Think of the half-disk as two quarter-disks joined along the diameter. The two quarter-disk centers of mass are symmetric about the diameter and each at distance $$r_{\\pi/2} = \\frac{4\\sqrt{2}R}{3\\pi}$$ from the corner. They lie at $$45°$$ on each side of the symmetry axis of the half-disk.

The center of mass of the half-disk lies midway along the line segment joining the two quarter-disk centers, at distance $$r_{\\pi/2}\\sin(45°) = r_{\\pi/2}/\\sqrt{2} = \\frac{4R}{3\\pi}$$ from the original center.`,

  23: `Because the wedge is a right triangle with legs at angles $$\\alpha$$ and $$\\beta$$ to the horizontal (so $$\\alpha + \\beta = 90°$$), we have $$\\cos\\alpha = \\sin\\beta$$ and $$\\cos\\beta = \\sin\\alpha$$.

The horizontal force the wedge exerts on each mass equals the normal force times $$\\sin$$ of the slope angle: for the left mass $$F_L = mg\\cos\\alpha\\sin\\alpha$$ and for the right mass $$F_R = mg\\cos\\beta\\sin\\beta$$.

The net horizontal force on the wedge (by Newton's third law) is $$F_L - F_R = mg(\\cos\\alpha\\sin\\alpha - \\cos\\beta\\sin\\beta) = mg(\\sin\\beta\\cos\\beta - \\cos\\beta\\sin\\beta) = 0$$. The wedge does not accelerate.`,

  24: `The density of the crown is $$\\rho = M/V = 2700/143 \\approx 18.88\\ \\text{g/cm}^3$$. The gold fraction by volume is:
$$\\alpha = \\frac{\\rho - \\rho_s}{\\rho_g - \\rho_s} = \\frac{18.88 - 10.49}{19.32 - 10.49} \\approx 0.950.$$

The fractional uncertainty in $$\\rho$$ (from $$\\Delta M/M$$ and $$\\Delta V/V$$) is:
$$\\frac{\\Delta\\rho}{\\rho} = \\sqrt{\\left(\\frac{0.03}{2.70}\\right)^2 + \\left(\\frac{1.5}{143}\\right)^2} \\approx 0.015.$$

Then $$\\Delta\\alpha = \\Delta\\rho/(\\rho_g - \\rho_s) = 0.015 \\times 18.88 / 8.83 \\approx 0.032$$. The answer is $$\\alpha = 0.95 \\pm 0.03$$ (95 ± 3%).`,

  25: `Define: $$a_b$$ = bale acceleration, $$a_s$$ = sled acceleration, $$F_f$$ = friction between sled and bale, $$m_b = 600\\ \\text{kg}$$, $$m_s = 300\\ \\text{kg}$$, $$F = 1500\\ \\text{N}$$.

Newton's law for the bale: $$m_b a_b = F_f$$. For the sled: $$m_s a_s = F - F_f$$. Rotational equation for the bale (moment of inertia $$\\frac{1}{2}m_b r^2$$): $$\\alpha = F_f r / (\\frac{1}{2}m_b r^2) = 2F_f/(m_b r)$$.

No-slip condition: $$a_s = a_b + \\alpha r = a_b + 2F_f/m_b = a_b + 2a_b = 3a_b$$. Substituting into Newton's laws:
$$3a_b m_s + m_b a_b = F \\implies a_b = \\frac{F}{3m_s + m_b} = \\frac{1500}{900 + 600} = 1\\ \\text{m/s}^2.$$`
}

export const solutions2026 = {
  1: `The jet emits one light pulse at $$A$$ at time $$t_1$$ and another at $$B$$ at time $$t_2 = t_1 + \\delta t$$. The observer at distance $$d$$ receives the first pulse at $$t_1' = t_1 + (d + v\\delta t\\cos\\theta)/c$$ (the extra path length because $$B$$ is slightly closer to $$O$$) and the second at $$t_2' = t_2 + d/c$$. The observed time interval is:
$$\\delta t' = t_2' - t_1' = \\delta t - \\frac{v\\delta t\\cos\\theta}{c} = \\delta t(1 - \\beta\\cos\\theta).$$

The apparent transverse distance is $$v\\,\\delta t\\sin\\theta$$, so the apparent transverse velocity is:
$$v_T = \\frac{v\\,\\delta t\\sin\\theta}{\\delta t'} = \\frac{\\beta c\\sin\\theta}{1 - \\beta\\cos\\theta}, \\quad \\beta_T = \\frac{\\beta\\sin\\theta}{1-\\beta\\cos\\theta}.$$`,

  2: `The relevant timescale for a domino of height $$h$$ to fall is set by dimensional analysis: $$\\tau \\sim \\sqrt{h/g}$$. The wave propagates one spacing $$d$$ per topple time $$\\tau$$, so $$v \\sim d/\\tau \\sim d\\sqrt{g/h}$$.

When all lengths scale by $$\\lambda$$ ($$d \\to \\lambda d$$, $$h \\to \\lambda h$$):
$$v' \\sim (\\lambda d)\\sqrt{\\frac{g}{\\lambda h}} = \\lambda d\\sqrt{\\frac{g}{h}} \\cdot \\frac{1}{\\sqrt{\\lambda}} = \\sqrt{\\lambda}\\,v.$$

So $$v' \\sim \\sqrt{\\lambda}$$.`,

  3: `Reading the trajectory: the point starts at the top and moves right along the top segment ($$v_x > 0$$, $$v_y = 0$$), then curves downward-left along the next segment ($$v_x < 0$$, $$v_y < 0$$), then continues downward along the right side ($$v_x = 0$$, $$v_y < 0$$). The corresponding velocity pair shows $$v_x$$ positive then negative then zero, and $$v_y$$ zero then negative and staying negative. This matches choice B.`,

  4: `Both balls are launched from the same point at the same time. The relative velocity between ball 1 (launched vertically at 3 m/s) and ball 2 (launched horizontally at 4 m/s) has magnitude $$\\sqrt{3^2 + 4^2} = 5\\ \\text{m/s}$$ — and since there is no air resistance, the relative velocity is constant (both experience the same gravitational acceleration, which cancels in the relative frame).

Ball 2 lands after time $$t = 20\\ \\text{m}/(4\\ \\text{m/s}) = 5\\ \\text{s}$$. At that moment, the separation is:
$$|\\Delta \\vec{r}| = |\\vec{v}_{\\text{rel}}| \\cdot t = 5 \\times 5 = 25\\ \\text{m}.$$`,

  5: `Each sand grain is released with the helicopter's instantaneous horizontal velocity $$v_{\\text{horiz}} = \\omega R$$ (tangential). It falls for time $$T = \\sqrt{2h/g}$$ and travels a horizontal distance $$\\omega R T$$ perpendicular to the radius at the release point.

The landing point is displaced from the release point on the circle, so its distance from the center is:
$$R_{\\text{sand}} = \\sqrt{R^2 + (\\omega R T)^2} = R\\sqrt{1 + \\omega^2 T^2} = R\\sqrt{1 + \\frac{2h\\omega^2}{g}}.$$`,

  6: `Newton's approximation gives a fixed penetration depth $$D = L(\\rho_A/\\rho_B)$$, independent of velocity. The projectile starts with kinetic energy $$K = \\frac{1}{2}m v^2 \\propto v^2$$ and comes to rest over distance $$D$$. By the work–energy theorem, $$F = K/D \\propto v^2$$. So $$F \\propto v^2$$.`,

  7: `The L2 point is an equilibrium in the rotating frame. For a radial (outward) displacement: the centrifugal force increases with $$r$$ while the net inward gravitational force decreases, so the net effect is a net outward force — the point is __unstable__ to radial perturbations.

For a tangential displacement: moving tangentially away from L2, the Coriolis and gravitational forces combine to push the object back toward L2 — the point is __stable__ to tangential perturbations.`,

  8: `In the rest frame of the heavy bump ($$M \\gg m$$), the puck's initial speed is $$v + v/2 = 3v/2$$ (since both are approaching each other). By energy conservation in this frame, the puck reaches a maximum height:
$$h = \\frac{(3v/2)^2}{2g} = \\frac{9v^2}{8g}.$$

(Since $$M \\gg m$$, the bump's speed is essentially unchanged throughout, so the bump's rest frame is an inertial frame at the time of maximum height.)`,

  9: `At the first collision, the ball has fallen from a height equal to Earth's radius, acquiring speed equal to the orbital speed $$v$$ at zero altitude. Each subsequent elastic collision with the plate moving upward at speed $$u = v/1000$$ increases the ball's speed by $$2u$$ (in an elastic collision with a much more massive wall moving at $$u$$, the ball's speed increases by $$2u$$).

After $$N$$ collisions, the ball's speed is $$v + 2Nu = v + 2N(v/1000)$$. To escape, this must reach the escape velocity $$v_{\\text{esc}} = v\\sqrt{2}$$:
$$v + 2N\\frac{v}{1000} = v\\sqrt{2} \\implies N = 500(\\sqrt{2}-1) \\approx 207.1.$$

After 207 collisions the ball still falls back, so the 208th collision is the one that causes escape.`,

  10: `All three objects have the same mass $$M$$ and the same flat circular face of radius $$a$$. By symmetry, the gravitational field at the center of the flat face is perpendicular to the face.

Starting from the half-ball and continuously deforming it into a short cylinder (height $$a$$): mass elements move farther from the center and more off-axis, reducing the component of gravitational field perpendicular to the face. So $$g_{\\text{ball}} > g_a$$.

Extending the short cylinder to height $$2a$$ while keeping mass fixed: the added mass (in the upper half) is farther away and more off-axis, further reducing the field. So $$g_a > g_{2a}$$. Therefore $$g_{\\text{ball}} > g_a > g_{2a}$$.`,

  11: `Both momentum and energy are conserved. Let $$\\vec{u}$$ be the track's velocity and $$\\vec{v}$$ the bead's velocity when the bead is at tick 3 (a $$90°$$ turn from tick 1). From momentum conservation and the geometry (tick 1 to tick 3 is $$90°$$, so the initial velocity direction is perpendicular to the radius at tick 3):

$$p_x: v_0 = v_x + u_x; \\quad p_y: 0 = v_y + u_y; \\quad \\text{energy}: u^2 + v^2 = v_0^2.$$

The track constraint at tick 3 requires the bead's velocity relative to the track to be tangential: $$v_x - u_x = 0$$, so $$v_x = u_x$$. Solving: $$u_x = v_0/2$$, $$v_x = v_0/2$$, $$u_y = -v_y$$. From energy: $$2(v_0/2)^2 + 2u_y^2 = v_0^2$$, giving $$u_y^2 = v_0^2/4$$. Therefore $$u = \\sqrt{u_x^2 + u_y^2} = \\sqrt{v_0^2/4 + v_0^2/4} = v_0/\\sqrt{2}$$.`,

  12: `At constant velocity, net force is zero. Vertically: the buoyant force $$F_B$$ plus the vertical component of the water's normal reaction $$R_y$$ balance gravity: $$R_y = Mg - F_B$$.

Since the water reaction is normal to the board (angled at $$\\theta$$ to vertical), its horizontal component is $$R_x = R_y \\tan\\theta = (Mg - F_B)\\tan\\theta$$. For constant velocity, the tow rope tension $$T$$ must balance this drag:
$$T = (Mg - F_B)\\tan\\theta.$$`,

  13: `Friction always opposes the direction of motion. The block bouncing elastically between springs is equivalent to a block sliding indefinitely on a surface with kinetic friction $$\\mu_k$$ (since each reversal involves no energy loss, and the friction force magnitude is the same). The block decelerates at rate $$\\mu_k g$$, starting from $$v_0$$, and comes to rest after time:
$$T = \\frac{v_0}{\\mu_k g}.$$`,

  14: `The swing consists of two rigid rods with the constraint $$l_1^2 + l_2^2 = a^2 + b^2$$. The effective pendulum length for the mass at $$C$$ can be found by determining the perpendicular distance from $$C$$ to the line $$AB$$ (which acts as the effective pivot line).

Using the law of sines on triangle $$ABC$$: the perpendicular distance from $$C$$ to $$AB$$ is $$|CD| = l_1 l_2 / a$$. The period of small oscillations is:
$$T = 2\\pi\\sqrt{\\frac{|CD|}{g}} = 2\\pi\\sqrt{\\frac{l_1 l_2}{ga}}.$$`,

  15: `While slipping, kinetic friction decelerates the ball at rate $$\\mu g$$ and angularly accelerates it at rate $$\\mu m g r / I$$. The ball stops slipping when $$v = \\omega r$$. Writing $$v(t) = v_0 - \\mu g t$$ and $$\\omega(t)r = \\mu g (mR^2/I) t$$, setting them equal gives:
$$t^* = \\frac{v_0}{\\mu g (1 + mR^2/I)},$$

and the final speed $$v_f = v_0 - \\mu g t^* = \\frac{v_0}{1 + mR^2/I}$$. This depends only on $$v_0$$ and the ball's moment of inertia ratio — __not__ on $$\\mu$$. The coefficient of friction has no effect on the final rolling speed.`,

  16: `In elastic collisions between frictionless bodies, the collision only produces forces normal to the contact surface. This means the rack receives no torque and does not rotate. In the rack's instantaneous rest frame (which is inertial at each collision instant), each collision is equivalent to specular reflection off a frictionless wall.

The puck's initial velocity (parallel to $$BC$$) hits the midpoint of $$AB$$ (which is perpendicular to... actually at $$60°$$ to the velocity). Tracing the reflections: after the first collision at the midpoint of $$AB$$, the puck reflects and hits the midpoint of $$BC$$. The third collision (second after the initial one) occurs at point $$D$$, the midpoint of $$AC$$.`,

  17: `The ladder detaches from the wall before its base reaches $$x = \\sqrt{3}L/2$$. Detachment occurs when the normal force at the wall drops to zero, which happens at $$\\sin\\theta_{\\det} = 2/3$$ (angle $$\\theta$$ from horizontal).

At detachment, the base speed is:
$$v_{B,\\det} = \\sqrt{3gL(1-\\sin\\theta_{\\det})\\sin^2\\theta_{\\det}} = \\sqrt{3gL \\cdot \\frac{1}{3} \\cdot \\frac{4}{9}} = \\frac{2}{3}\\sqrt{gL} \\approx 0.67\\sqrt{gL}.$$

The problem asks for the speed at $$x = \\sqrt{3}L/2$$, which requires tracking the free-flight phase after detachment. Because this is difficult to resolve exactly within the exam format, credit was awarded for $$0.61\\sqrt{gL}$$ (obtained by assuming the ladder stays in contact throughout) and $$0.66\\sqrt{gL}$$ (the detachment speed). Both are accepted answers.`,

  18: `Let $$y$$ be the displacement of the mass, and $$x_1, x_2, x_3$$ the extensions of the three springs (constants $$k_1=k$$, $$k_2=k/5$$, $$k_3=k/3$$). The pulley arrangement gives the kinematic constraint $$y = (x_1+x_2+x_3)/2$$, and since the springs are connected in the same rope the tension is equal in all three: $$k_1 x_1 = k_2 x_2 = k_3 x_3 = F_s$$.

Express all extensions in terms of $$x_1$$: $$x_2 = (k_1/k_2)x_1 = 5x_1$$, $$x_3 = (k_1/k_3)x_1 = 3x_1$$. Then $$y = (x_1 + 5x_1 + 3x_1)/2 = 9x_1/2$$, so $$x_1 = 2y/9$$. The equation of motion for the mass gives effective spring constant $$k_{\\text{eff}} = 4k_1/(1 + k_1/k_2 + k_1/k_3)^2 \\times \\text{(pulley factor)}$$. Working through the algebra yields $$\\omega^2 = 4k/(9m)$$. Since $$T_0 = 2\\pi\\sqrt{m/k}$$:
$$\\frac{T}{T_0} = \\sqrt{\\frac{k}{\\omega^2 m}} = \\sqrt{\\frac{k}{4k/9}} = \\sqrt{\\frac{9}{4}} = \\frac{3}{2}.$$`,

  19: `In the zero-total-momentum frame, let $$v$$ be the box's velocity and $$\\Omega = \\dot\\theta$$. Conservation of horizontal momentum (no external horizontal forces) gives:
$$m_2 v + m_1(v + L\\Omega) = 0 \\implies v = -\\frac{m_1}{m_1+m_2}L\\Omega.$$

The total kinetic energy to second order is:
$$T = \\frac{1}{2}\\frac{m_1 m_2}{m_1+m_2}L^2\\Omega^2.$$

The potential energy is $$U \\approx \\text{const} + \\frac{1}{2}m_1 gL\\theta^2$$. The system is equivalent to a harmonic oscillator with:
$$\\omega = \\sqrt{\\frac{m_1 gL}{m_1 m_2 L^2/(m_1+m_2)}} = \\sqrt{\\frac{(m_1+m_2)g}{m_2 L}}.$$`,

  20: `The lower rod is pivoted at $$O$$ and tilted at angle $$\\theta \\neq 0$$. To keep $$\\theta$$ constant, the net torque about $$O$$ must be zero at all times. The gravitational torque on the lower rod is constant (since $$\\theta$$ is fixed). The motor acts on the second rod at its center of mass (point $$P$$), so it exerts no net gravitational torque by displacement — but the spinning second rod contributes a changing angular momentum $$L_O$$ about $$O$$.

To produce a constant $$dL_O/dt$$ (needed to balance the constant gravitational torque), the second rod must have a constant angular acceleration — i.e., angular velocity increasing linearly in time.`,

  21: `A vertical jump of height $$h$$ has a total flight time $$\\tau = 2\\sqrt{2h/g}$$. With $$h = 0.31\\ \\text{m}$$ and $$g = 10\\ \\text{m/s}^2$$: $$\\tau = 2\\sqrt{0.062} \\approx 0.498\\ \\text{s}$$.

While airborne from radius $$r$$, the student moves tangentially at $$v = \\omega r$$ (no horizontal forces), landing at:
$$r' = \\sqrt{r^2 + (\\omega r \\tau)^2} = r\\sqrt{1+\\omega^2\\tau^2}.$$

With $$\\omega = 1.2\\ \\text{rad/s}$$: $$\\omega\\tau \\approx 0.598$$, so the radius growth factor per jump is $$F = \\sqrt{1 + 0.357} \\approx 1.164$$. Starting at $$r_0 = 1.0\\ \\text{m}$$, after $$N$$ jumps $$r_N = 1.164^N\\ \\text{m}$$. To reach $$r = 2.0\\ \\text{m}$$: $$N > \\ln 2/\\ln 1.164 \\approx 4.46$$, so $$N = 5$$.`,

  22: `The front wheel and left rear wheel slide on dry pavement ($$\\mu_k = 0.5$$); the right rear wheel is on ice (frictionless). First find the normal forces: summing moments about the rear axle gives $$N_f = mgb/L = (100)(10)(0.4)/1.0 = 400\\ \\text{N}$$, and the total rear load is $$mg - N_f = 600\\ \\text{N}$$, split equally so $$N_{\\text{left}} = 300\\ \\text{N}$$ and $$N_{\\text{right}} = 300\\ \\text{N}$$.

Friction forces (southward): front $$= \\mu_k N_f = 200\\ \\text{N}$$, left rear $$= \\mu_k N_{\\text{left}} = 150\\ \\text{N}$$, right rear $$= 0$$. By symmetry, the front wheel's friction acts on the central axis and creates no torque about the CM. The left rear wheel is $$d/2 = 0.5\\ \\text{m}$$ to the left of the central axis. Its southward friction force creates a CCW torque:
$$\\tau = 150 \\times 0.5 = 75\\ \\text{N\\cdot m}.$$

With $$I = mk^2 = 100(0.5)^2 = 25\\ \\text{kg\\cdot m}^2$$: $$\\alpha = \\tau/I = 75/25 = 3.0\\ \\text{rad/s}^2$$ counter-clockwise.`,

  23: `The moment of inertia of a uniform hexagon of side $$s$$ scales as $$I \\propto \\rho s^4$$ (since mass $$\\propto \\rho s^2$$ and the characteristic length squared is $$s^2$$). The largest hexagon has side $$\\sqrt{3}\\,a$$, so $$I_2 = C\\rho(\\sqrt{3}a)^4 = 9C\\rho a^4$$.

The figure alternates: add hexagon side $$\\sqrt{3}a$$, cut out side $$a$$, add side $$a/\\sqrt{3}$$, cut out side $$a/3$$, etc. Each successive ratio of sides is $$1/\\sqrt{3}$$, and the contribution alternates in sign:
$$I_1 = 9C\\rho a^4 - C\\rho a^4 \\sum_{n=0}^{\\infty}\\left(-\\frac{1}{9}\\right)^n = 9C\\rho a^4 - C\\rho a^4 \\cdot \\frac{1}{1+1/9} = 9C\\rho a^4 - \\frac{9}{10}C\\rho a^4 = \\frac{81}{10}C\\rho a^4.$$

Therefore $$I_1/I_2 = (81/10)/(9) = 9/10$$.`,

  24: `Consider a small arc element of the air sheet of angular extent $$\\delta\\theta$$ at radius $$R$$. The arc length (per unit depth into the page) is $$R\\,\\delta\\theta$$, and the sheet has thickness $$t$$, so the mass per unit depth is $$\\delta m = \\rho t R\\,\\delta\\theta$$. For the sheet to follow the curved surface, this element needs centripetal force $$\\delta m\\, v^2/R = \\rho t v^2\\,\\delta\\theta$$.

The inward pressure force from the pressure difference $$\\Delta P$$ acting over area $$R\\,\\delta\\theta$$ (per unit depth) is $$\\Delta P \\cdot R\\,\\delta\\theta$$. Setting these equal:
$$\\Delta P \\cdot R = \\rho t v^2 \\implies v = \\sqrt{\\frac{\\Delta P_{\\max} R}{\\rho t}} = \\sqrt{\\frac{120 \\times 0.05}{1.2 \\times 0.005}} = \\sqrt{1000} \\approx 31.6\\ \\text{m/s}.$$

The maximum integer speed is $$v_{\\max} = 31\\ \\text{m/s}$$.`,

  25: `By Torricelli's law the exit speed at height $$z$$ above the hole is $$v_{\\text{exit}}(z) = \\sqrt{2gz}$$. The time to drain a thin horizontal slice of volume $$\\Delta V$$ at height $$z$$ is $$\\Delta t \\propto \\Delta V / (a\\sqrt{z})$$, where $$a$$ is the hole area.

Slices at larger $$z$$ drain faster. To minimize total drain time, arrange the geometry so as much water as possible sits at large $$z$$. Vase (a) is widest at the top and narrow at the bottom, so most of its fixed volume is stored at large height. This makes it drain the fastest among the options.`
}
