-- Seed Leo's missing sessions (weeks 3-21 from Oct 2025 – Mar 2026)
-- Sourced from post-session emails to silvio.savarese@gmail.com
-- All sessions are set to balance_decremented=true (already billed/paid)

INSERT INTO public.sessions (id, student_id, scheduled_at, end_time, notes, miro_board_url, balance_decremented) VALUES

('leo-session-2025-10-09', 'leo', '2025-10-09T00:00:00+00:00', '2025-10-09T01:00:00+00:00',
 'Week 3 — Projectile motion. Continued deriving kinematic formulas from velocity vs. time plots, and distinguished different representations such as height vs. horizontal position for a projectile. Leo has solid algebra and graphing skills.',
 'https://app.ziteboard.com/team/527469fa-5ae0-4b40-aaf2-a73b51ed3246',
 true),

('leo-session-2025-10-16', 'leo', '2025-10-16T00:00:00+00:00', '2025-10-16T01:00:00+00:00',
 'Week 4 — Energy conservation. Discussed the abstract approach in the AoPS class, did theoretical derivations and homework problems. Leo handled difficult conceptual material including parsing mathematical statements with different notation.',
 'https://view.ziteboard.com/shared/53432907606711?backgroundcolor=FFFFFF',
 true),

('leo-session-2025-10-23', 'leo', '2025-10-23T00:00:00+00:00', '2025-10-23T01:00:00+00:00',
 'Week 5 — Power laws and wind energy scaling. Worked through why wind power scales as the cube of wind speed. Leo modeled the situation and worked through calculations. Spent time on density definitions and combining units.',
 'https://view.ziteboard.com/shared/03810796216718?backgroundcolor=FFFFFF',
 true),

('leo-session-2025-10-30', 'leo', '2025-10-30T00:00:00+00:00', '2025-10-30T01:00:00+00:00',
 'Week 6 — Simple machines / quadratic optimization. Deeply explored how to apply minimizing a quadratic (potential energy) in a physics context. Drew diagrams, translated to graphs and equations, and built physical intuition around parabolas.',
 'https://app.ziteboard.com/?code=a2cddb7a-cd1b-4fa6-b96c-b0866b2241e5',
 true),

('leo-session-2025-11-06', 'leo', '2025-11-06T00:00:00+00:00', '2025-11-06T01:00:00+00:00',
 'Week 7 — Circular motion. Spent the entire hour deriving the centripetal acceleration formula. Leo developed a strong conceptual understanding of limits and worked with velocity vectors intuitively despite not having formally studied vectors.',
 'https://view.ziteboard.com/shared/07796928426713?backgroundcolor=FFFFFF',
 true),

('leo-session-2025-11-13', 'leo', '2025-11-13T00:00:00+00:00', '2025-11-13T01:00:00+00:00',
 'Week 8 — Scaling, power laws, and springs in series. Leo independently realized he could focus on scaling relationships rather than solving for exact values. Practiced interpreting springs in series physically.',
 NULL,
 true),

('leo-session-2025-11-20', 'leo', '2025-11-20T00:00:00+00:00', '2025-11-20T01:00:00+00:00',
 'Week 9 — Rotational kinematics. Leo came in with his own agenda. Worked on angular speed and acceleration, analogies to linear motion, dimensions and units, and a numerical example using Earth''s rotation period to find the difference between sidereal and synodic periods of the Moon.',
 'https://view.ziteboard.com/shared/77128329636716?backgroundcolor=FFFFFF',
 true),

('leo-session-2025-12-04', 'leo', '2025-12-04T00:00:00+00:00', '2025-12-04T01:00:00+00:00',
 'Week 10 — Rotational dynamics. After a week off, worked on rotational kinematics and dynamics. Leo worked through a writing problem on aliasing (wagon-wheel effect). Discussed moment of inertia and why a solid ball rolls faster than a hollow ball using energy conservation.',
 NULL,
 true),

('leo-session-2025-12-11', 'leo', '2025-12-11T00:00:00+00:00', '2025-12-11T01:00:00+00:00',
 'Week 11 — Vectors. Leo handled trig-based problems easily. As a bonus, explored systems of linear equations and the special condition making them unsolvable, connecting it graphically to parallel row vectors. 3-week break before Jan 8.',
 'https://view.ziteboard.com/shared/89410470556714?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-01-08', 'leo', '2026-01-08T00:00:00+00:00', '2026-01-08T01:00:00+00:00',
 'Week 13 — Momentum and the rocket equation. Worked through the "tyranny of the rocket equation" algebraically and then sought intuitive understanding. Both ran out of time before finishing the discussion.',
 'https://view.ziteboard.com/shared/35691662976713?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-01-14', 'leo', '2026-01-14T00:00:00+00:00', '2026-01-14T01:00:00+00:00',
 'Week 14 — Collisions and reference frames. Leo was sick (had just come from urgent care). Worked a problem on dropping a basketball with a tennis ball stacked on top using reference frame transformations. Also did a quantitative 1D collision problem.',
 'https://view.ziteboard.com/shared/97026244486717?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-01-22', 'leo', '2026-01-22T00:00:00+00:00', '2026-01-22T01:00:00+00:00',
 'Week 15 — Forces. Leo was surprised how the forces curriculum builds on earlier momentum and energy work. Worked on interpreting force as the slope of a momentum vs. time graph, and started a long scaling problem. Leo expressed interest in continuing to the F=ma contest-prep course.',
 'https://view.ziteboard.com/shared/11792753196718?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-01-29', 'leo', '2026-01-29T00:00:00+00:00', '2026-01-29T01:00:00+00:00',
 'Week 16 — Force and energy connection. Leo noted that introducing force felt like very little new material, validating the course''s organization of teaching momentum and energy first. Leo solved homework problems with Mark as a sounding board.',
 'https://view.ziteboard.com/shared/49722404796718?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-02-05', 'leo', '2026-02-05T00:00:00+00:00', '2026-02-05T01:00:00+00:00',
 'Week 17 — Statics. Distinguished weight, mass, and scale readings. Worked through a tension-at-angles problem requiring trigonometry. Spent time tracking down a calculation error that turned out to be using 45° instead of the problem''s stated 40°.',
 'https://view.ziteboard.com/shared/60983264307718?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-02-12', 'leo', '2026-02-12T00:00:00+00:00', '2026-02-12T01:00:00+00:00',
 'Week 18 — Newton''s second law applied to systems of boxes. Leo quickly grasped applying F=ma to different subsystems. Then struggled with the same calculation using variables instead of numbers, and wanted to go back and master the concept after the session.',
 'https://view.ziteboard.com/shared/42165505907718?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-02-26', 'leo', '2026-02-26T00:00:00+00:00', '2026-02-26T01:00:00+00:00',
 'Week 19 — Newton''s law of gravity. Leo had missed part of the class on gravity. Worked on fundamentals and sensemaking. Leo handled multi-step derivations and worked out for himself why gravitational force depends on the product (not sum) of masses.',
 'https://view.ziteboard.com/shared/08420316127717?backgroundcolor=FFFFFF',
 true),

('leo-session-2026-03-05', 'leo', '2026-03-05T00:00:00+00:00', '2026-03-05T01:00:00+00:00',
 'Week 20 — Torque. New topic: focused on definitions and breaking forces into components using trig. Leo had a breakthrough moment applying trig to find vector components and appreciated how torque can be broken down in different ways.',
 NULL,
 true),

('leo-session-2026-03-19', 'leo', '2026-03-19T00:00:00+00:00', '2026-03-19T01:00:00+00:00',
 'Week 21 — Buoyancy. Built intuition around density, volume, and mass. After practice, Leo suddenly improved his ability to juggle those quantities — described as a "phase transition" in learning.',
 'https://view.ziteboard.com/shared/77078567937716?backgroundcolor=FFFFFF',
 true);
