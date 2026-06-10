import { describe, it, expect, beforeEach } from 'vitest'
import { createCalcEngine, preprocessInput } from '../engine.js'
import { requiredTolerance } from '../qama.js'
import { createEstimateProblem } from '../estimate.js'
import { parse } from '../math-setup.js'

let engine
beforeEach(() => {
  engine = createCalcEngine({ angleMode: 'deg' })
})

function spec(input) {
  const ast = parse(preprocessInput(input))
  return requiredTolerance(ast, engine.getScope())
}

describe('trivial cases demand exact answers', () => {
  it('times tables', () => {
    expect(spec('7*8').kind).toBe('exact')
    expect(spec('12*12').kind).toBe('exact')
  })
  it('powers of ten', () => {
    expect(spec('13*10').kind).toBe('exact')
    expect(spec('300/10').kind).toBe('exact')
    expect(spec('4.7 * 1000').kind).toBe('exact')
  })
  it('multiplying by ~1 or 0', () => {
    expect(spec('123 * 1').kind).toBe('exact')
    expect(spec('123 * 0').kind).toBe('exact')
  })
  it('small integer addition', () => {
    expect(spec('2+2').kind).toBe('exact')
    expect(spec('7+5').kind).toBe('exact')
  })
  it('small squares', () => {
    expect(spec('9^2').kind).toBe('exact')
  })
  it('special trig angles', () => {
    expect(spec('sin(30)').kind).toBe('exact')
    expect(spec('cos(60)').kind).toBe('exact')
    expect(spec('tan(45)').kind).toBe('exact')
    expect(spec('sin(90)').kind).toBe('exact')
  })
  it('perfect square roots', () => {
    expect(spec('sqrt(9)').kind).toBe('exact')
  })
  it('integer log10', () => {
    expect(spec('log10(100)').kind).toBe('exact')
  })
  it('small factorials', () => {
    expect(spec('5!').kind).toBe('exact')
  })
})

describe('multiplication/division tolerance', () => {
  it('23*47 allows roughly ±10%', () => {
    const s = spec('23*47') // = 1081
    expect(s.kind).toBe('range')
    expect(s.lo).toBeLessThanOrEqual(1000)
    expect(s.hi).toBeGreaterThanOrEqual(1150)
    expect(s.lo).toBeGreaterThan(850) // but not absurdly loose
    expect(s.hi).toBeLessThan(1350)
  })
  it('13/21 has a modest band', () => {
    const s = spec('13/21') // ≈ 0.619
    expect(s.lo).toBeGreaterThan(0.5)
    expect(s.hi).toBeLessThan(0.75)
  })
})

describe('addition/subtraction tolerance', () => {
  it('345+678 uses the digit rule with cap', () => {
    const s = spec('345+678') // = 1023, cap = 0.5*345 = 172.5
    expect(s.kind).toBe('range')
    expect(s.hi - s.valueSI).toBeLessThanOrEqual(172.5 + 1e-9)
    expect(s.hi - s.valueSI).toBeGreaterThan(50)
  })
  it('cancellation subtraction is strict', () => {
    const s = spec('1000 - 998') // = 2
    expect(s.hi - s.lo).toBeLessThan(3)
  })
})

describe('functions', () => {
  it('non-special trig has a relative band', () => {
    const s = spec('tan(20)')
    expect(s.kind).toBe('range')
    expect(s.pct).toBeGreaterThan(0.1)
    expect(s.pct).toBeLessThanOrEqual(0.3)
  })
  it('log10(50) interval stays inside (1,2)', () => {
    const s = spec('log10(50)') // ≈ 1.69897
    expect(s.lo).toBeGreaterThanOrEqual(1)
    expect(s.hi).toBeLessThanOrEqual(2)
    expect(s.lo).toBeCloseTo(1.59897, 3)
  })
  it('7! allows ±20%', () => {
    const s = spec('7!') // 5040
    expect(s.pct).toBeCloseTo(0.2, 1)
  })
  it('13! is order-of-magnitude', () => {
    const s = spec('13!')
    expect(s.kind).toBe('orderOfMagnitude')
  })
  it('non-integer powers are loose', () => {
    const s = spec('23^2.1') // ≈ 723.8
    expect(s.lo).toBeLessThanOrEqual(550)
    expect(s.hi).toBeGreaterThan(750)
  })
})

describe('composite expressions', () => {
  it('kinetic energy composite is tighter than 20%', () => {
    const s = spec('0.5*70*3^2')
    expect(s.kind).not.toBe('exact')
    expect(s.pct).toBeLessThan(0.25)
  })
  it('unit-bearing expressions work', () => {
    const s = spec('0.5 * 70 kg * (3 m/s)^2')
    expect(s.valueSI).toBeCloseTo(315, 5)
    expect(s.lo).toBeLessThan(315)
    expect(s.hi).toBeGreaterThan(315)
  })
})

describe('estimate sessions', () => {
  it('accepts a good estimate with units', () => {
    const p = createEstimateProblem(engine, '0.5 * 70 kg * (3 m/s)^2')
    expect(p.ok).toBe(true)
    const r = p.check('300 J')
    expect(r.accepted).toBe(true)
    expect(r.display).toMatch(/315 J/)
  })
  it('rejects a unitless estimate when the answer has units', () => {
    const p = createEstimateProblem(engine, '0.5 * 70 kg * (3 m/s)^2')
    const r = p.check('300')
    expect(r.accepted).toBe(false)
    expect(r.hint).toMatch(/units/)
  })
  it('rejects the wrong dimension', () => {
    const p = createEstimateProblem(engine, '0.5 * 70 kg * (3 m/s)^2')
    const r = p.check('300 N')
    expect(r.accepted).toBe(false)
    expect(r.hint).toMatch(/force/)
  })
  it('accepts estimates in any compatible unit', () => {
    const p = createEstimateProblem(engine, '0.5 * 70 kg * (3 m/s)^2')
    const r = p.check('0.3 kJ')
    expect(r.accepted).toBe(true)
  })
  it('reveals after 5 failed attempts', () => {
    const p = createEstimateProblem(engine, '23*47')
    let r
    for (let i = 0; i < 5; i++) r = p.check('5')
    expect(r.revealed).toBe(true)
    expect(r.accepted).toBe(false)
    expect(p.done).toBe(true)
  })
  it('gives order-of-magnitude hints', () => {
    const p = createEstimateProblem(engine, '23*47') // 1081
    expect(p.check('2').hint).toMatch(/orders of magnitude|order of magnitude/)
    expect(p.check('900').hint).toMatch(/ballpark/)
  })
  it('sets ans only after reveal', () => {
    engine.evaluate('1+1') // ans = 2
    const p = createEstimateProblem(engine, '23*47')
    expect(engine.evaluate('ans').ascii).toBe('2')
    p.check('1100') // accepted -> revealed
    expect(engine.evaluate('ans').ascii).toBe('1081')
  })
  it('updates the 23*47 acceptance window per design', () => {
    const p = createEstimateProblem(engine, '23*47')
    expect(p.check('1000').accepted).toBe(true)
  })
})
