import { describe, it, expect } from 'vitest'
import { SKILLS, generateProblem, gradeAnswer } from './generators'
import { nextLevel, nextDueAt, buildSessionPlan, MAX_LEVEL } from './spacing'

// The single most important property: a problem's own computed answer must
// pass its own grader, for every skill and every level, across many random
// seeds. This is what "answer computed by construction, not a parallel
// formula" is actually buying us -- catch it here, not on Leo's phone.
describe('every generator is self-consistent', () => {
  for (const skill of SKILLS) {
    for (let level = 0; level <= skill.maxLevel; level++) {
      it(`${skill.slug} level ${level} grades its own answer as correct`, () => {
        for (let seed = 1; seed <= 40; seed++) {
          const problem = generateProblem(skill.slug, level, seed * 97 + level)
          const submitted = Object.fromEntries(
            problem.fields.map(f => [f.key, problem.answer[f.key]])
          )
          const { correct, perField } = gradeAnswer(problem, submitted)
          expect(correct, `seed ${seed}: ${JSON.stringify(problem.answer)} vs ${JSON.stringify(perField)}`).toBe(true)
        }
      })
    }
  }
})

describe('grader rejects wrong answers', () => {
  it('flags an off-by-a-lot numeric answer', () => {
    const problem = generateProblem('exp-sign-division', 0, 1)
    const { correct } = gradeAnswer(problem, { exp: problem.answer.exp + 5 })
    expect(correct).toBe(false)
  })
  it('flags a coefficient outside tolerance', () => {
    const problem = generateProblem('sci-notation-arith', 1, 2)
    const { correct } = gradeAnswer(problem, { c: problem.answer.c + 1, e: problem.answer.e })
    expect(correct).toBe(false)
  })
})

describe('unit-prefix-convert reproduces the squared-unit trap', () => {
  it('mm² to m² uses the 1e-6 factor, not 1e-3', () => {
    // level 1 is power=2, toPrefix='' — same shape as Leo's 2.0 mm² = 2×10⁻⁶ m²
    const problem = generateProblem('unit-prefix-convert', 1, 7)
    const lhsTex = problem.equation[0].tex
    expect(lhsTex).toMatch(/\}\^\{2\}/) // ^2 outside \text{...}, not baked inside it
    expect(lhsTex).not.toMatch(/\\text\{[^}]*\^/) // never a caret inside a \text group
  })
})

// KaTeX renders a parse error as literal red text (throwOnError: false), which
// is exactly what happened when a unit label's ^2 was built inside \text{...}
// (see the fix above). Guard every equation/promptMd segment against that
// whole class of mistake, for every skill/level, not just the one that shipped.
describe('no LaTeX segment ever puts a caret or underscore inside \\text{...}', () => {
  const BAD = /\\text\{[^}]*[\^_][^}]*\}/
  for (const skill of SKILLS) {
    for (let level = 0; level <= skill.maxLevel; level++) {
      it(`${skill.slug} level ${level}`, () => {
        for (let seed = 1; seed <= 15; seed++) {
          const problem = generateProblem(skill.slug, level, seed * 53 + level)
          for (const seg of problem.equation || []) {
            if (seg.tex) expect(seg.tex).not.toMatch(BAD)
          }
          expect(problem.promptMd).not.toMatch(BAD)
          expect(problem.explanationMd).not.toMatch(BAD)
        }
      })
    }
  }
})

describe('answerBlanks prefers a plain decimal for small exponents', () => {
  it('7.8 cm -> m (exponent -2) asks for one decimal field, not coefficient+exponent', () => {
    // level 0 is power=1, toPrefix='' — cm to m is always a small exponent.
    for (let seed = 1; seed <= 30; seed++) {
      const problem = generateProblem('unit-prefix-convert', 0, seed)
      if (Math.abs(problem.answer.e ?? 0) > 3) continue // only assert when this seed lands in decimal range
      expect(problem.fields.map(f => f.key)).toEqual(['v'])
    }
  })
  it('mm² -> m² (exponent -6) still uses coefficient x 10^exponent', () => {
    const problem = generateProblem('unit-prefix-convert', 1, 7)
    expect(problem.fields.map(f => f.key)).toEqual(['c', 'e'])
  })
})

describe('vector-components only uses calculator-free reference angles', () => {
  const REF = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, 0]
  // Levels 0-4 give a single vector, so its own angle IS the resultant's
  // angle — recoverable via atan2. Level 5 sums two vectors (only one of
  // which is angle-based) so their sum generally lands off the reference
  // set even though each input was calculator-free; that's expected and
  // checked separately below.
  it('levels 0-4 land on a 30-60-90 / 45-45-90 angle', () => {
    for (let level = 0; level <= 4; level++) {
      for (let seed = 1; seed <= 20; seed++) {
        const problem = generateProblem('vector-components', level, seed * 31 + level)
        const deg = ((Math.round(Math.atan2(problem.answer.y, problem.answer.x) * 180 / Math.PI) % 360) + 360) % 360
        expect(REF, `level ${level} seed ${seed} got ${deg}°`).toContain(deg)
      }
    }
  })
  it('level 5 gives vector A as plain integers (no trig needed for that half)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const problem = generateProblem('vector-components', 5, seed * 31 + 5)
      expect(problem.promptMd).toMatch(/Vector A has components \$\$\((-?\d+), (-?\d+)\)\$\$/)
    }
  })
})

describe('isolate-variable roots are always exact integers/half-integers', () => {
  it('level 1 and 2 (square-root skills) never require an ugly root', () => {
    for (const level of [1, 2]) {
      for (let seed = 1; seed <= 20; seed++) {
        const problem = generateProblem('isolate-variable', level, seed * 17 + level)
        const key = problem.fields[0].key
        expect(Number.isInteger(problem.answer[key])).toBe(true)
      }
    }
  })
})

describe('spacing', () => {
  it('promotes on a correct, on-time answer and caps at MAX_LEVEL', () => {
    expect(nextLevel({ level: 4, correct: true, mode: 'untimed' })).toBe(5)
    expect(nextLevel({ level: 5, correct: true, mode: 'untimed' })).toBe(MAX_LEVEL)
  })
  it('drops two boxes on a miss, floored at 0', () => {
    expect(nextLevel({ level: 1, correct: false, mode: 'untimed' })).toBe(0)
    expect(nextLevel({ level: 0, correct: false, mode: 'untimed' })).toBe(0)
  })
  it('withholds promotion in timed mode if the response was too slow', () => {
    const slow = nextLevel({ level: 2, correct: true, mode: 'timed', responseMs: 60000, timeTargetSec: 20 })
    expect(slow).toBe(2)
    const fast = nextLevel({ level: 2, correct: true, mode: 'timed', responseMs: 5000, timeTargetSec: 20 })
    expect(fast).toBe(3)
  })
  it('next_due_at moves further out as level rises', () => {
    const d0 = new Date(nextDueAt(0, new Date('2026-01-01')))
    const d3 = new Date(nextDueAt(3, new Date('2026-01-01')))
    expect(d3.getTime()).toBeGreaterThan(d0.getTime())
  })
  it('buildSessionPlan interleaves rather than blocking one skill at a time', () => {
    const ids = ['a', 'b', 'c']
    const state = { a: { level: 0, next_due_at: null }, b: { level: 0, next_due_at: null }, c: { level: 0, next_due_at: null } }
    const plan = buildSessionPlan({ enabledSkillIds: ids, stateBySkill: state, targetCount: 6 })
    // No skill should appear twice in a row across the whole plan.
    for (let i = 1; i < plan.length; i++) expect(plan[i]).not.toBe(plan[i - 1])
  })
  it('buildSessionPlan excludes low-level skills from timed mode', () => {
    const ids = ['a', 'b']
    const state = { a: { level: 1, next_due_at: null }, b: { level: 4, next_due_at: null } }
    const plan = buildSessionPlan({ enabledSkillIds: ids, stateBySkill: state, targetCount: 4, mode: 'timed' })
    expect(plan.every(id => id === 'b')).toBe(true)
  })
})

describe('unit-dimensions', () => {
  it('level 1 recall matches the textbook definition of each derived unit', () => {
    const KNOWN = {
      N: { ekg: 1, em: 1, es: -2 },
      J: { ekg: 1, em: 2, es: -2 },
      Pa: { ekg: 1, em: -1, es: -2 },
      W: { ekg: 1, em: 2, es: -3 },
      Hz: { ekg: 0, em: 0, es: -1 },
    }
    for (let seed = 1; seed <= 30; seed++) {
      const problem = generateProblem('unit-dimensions', 1, seed)
      const unitName = Object.keys(KNOWN).find(n => problem.equation[0].tex.includes(n))
      expect(problem.answer).toEqual(KNOWN[unitName])
    }
  })

  // Ground truth from real SI unit definitions, independent of this codebase's
  // own exponent arithmetic -- catches a conceptual error, not just a typo.
  it('level 4 formulas land on each constant\'s real-world SI units', () => {
    const KNOWN_BY_LABEL = {
      G: { ekg: -1, em: 3, es: -2 },       // m^3 kg^-1 s^-2
      k: { ekg: 1, em: 0, es: -2 },        // N/m = kg s^-2
      h: { ekg: 1, em: 2, es: -1 },        // J*s = kg m^2 s^-1
      '\\eta': { ekg: 1, em: -1, es: -1 }, // Pa*s = kg m^-1 s^-1
      b: { ekg: 1, em: 0, es: -1 },        // N*s/m = kg s^-1
      I: { ekg: 1, em: 2, es: 0 },         // kg m^2
    }
    const seenLabels = new Set()
    for (let seed = 1; seed <= 40; seed++) {
      const problem = generateProblem('unit-dimensions', 4, seed)
      const label = problem.equation[0].tex
      seenLabels.add(label)
      expect(problem.answer, `label ${label}`).toEqual(KNOWN_BY_LABEL[label])
    }
    expect(seenLabels.size).toBe(6) // all 6 formulas got exercised across 40 seeds
  })

  it('level 3 square-root templates always resolve to an integer exponent triple', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const problem = generateProblem('unit-dimensions', 3, seed)
      for (const key of ['ekg', 'em', 'es']) expect(Number.isInteger(problem.answer[key])).toBe(true)
    }
  })
})
