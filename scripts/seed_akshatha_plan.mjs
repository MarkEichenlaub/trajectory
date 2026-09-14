// Seed Akshatha's plan: what we're doing next session, and the month-by-month
// route to the USAPhO. Text comes from the Aug 30 email to Arun, adjusted for
// the Sep 13-14 texts (AIME and USAMO take Nov and Dec, so USAPhO topics move
// earlier) and the Sep 14 WOOT practice exam (rigid-body oscillation periods).
// Usage: node scripts/seed_akshatha_plan.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  readFileSync(join(__dirname, '../.env'), 'utf8')
    .split('\n')
    .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
    ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) {
  console.error('Could not read service key from .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const NEXT_SESSION = 'Finish gravity and Kepler’s laws.'

const OUTLINE = `\
Sep 2026: F=ma Topics
> The goal is a comfortable buffer above the qualifying score, not a bare pass.
- Rotational motion and angular momentum
- Gravity and Kepler's laws
- Period of oscillation of a rigid body (parallel axis theorem plus simple harmonic motion)
- Fluid statics
- Fluid dynamics
- Error analysis and propagation
- Material properties
- More full-length practice exams

Oct 2026: Introduction to the USAPhO
> Moved up, since AIME and USAMO take most of November and December.
- Calculus in physics: derivatives and integrals as they show up in mechanics
- Calculus-based mechanics past the F=ma syllabus
- How to write a USAPhO solution and earn partial credit
- Organizing work and making progress on long problems
- Problems from real USAPhOs, other olympiads, and ones I've written

Nov 2026: Electromagnetism 1
> Lighter pace while Akshatha focuses on AIME and USAMO.
- Charge, Coulomb's law, and the electric field
- Gauss's law
- Current and circuits
- Magnetic fields, the Lorentz force, and fields due to currents
- We pick up a textbook here: Halliday, Resnick, and Krane, Physics, 5th ed.

Dec 2026: Electromagnetism 2
> Lighter pace while Akshatha focuses on AIME and USAMO.
- Induction
- Light as an electromagnetic wave
- Maxwell's equations in integral form
- First timed exams, limited to what we've covered so far

Jan 2027: Thermodynamics
- The ideal gas
- Thermodynamic cycles
- The laws of thermodynamics
- Kinetic theory and the Boltzmann factor

Feb 2027: Waves, Optics, and Quantum Mechanics
- The wave equation and superposition
- The lens equation and polarization
- The uncertainty principle, wavefunctions, and the hydrogen atom
- Full-length exams covering the whole syllabus, since many leave out relativity

Mar 2027: Relativity
- Lorentz transformations and spacetime diagrams
- Relativistic energy and momentum
- The spacetime interval and the classic paradoxes
- Full-length exams

Apr 2027: USAPhO
- Final practice exams and review
- The USAPhO exam
`

const { error } = await supabase.from('student_plans').upsert({
  student_id: 'akshatha',
  next_session: NEXT_SESSION,
  outline: OUTLINE,
}, { onConflict: 'student_id' })

if (error) {
  console.error(error.message)
  process.exit(1)
}
console.log('Seeded plan for akshatha')
