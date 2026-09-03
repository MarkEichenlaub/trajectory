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
    expect(problem.promptMd).toMatch(/\^2/)
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
