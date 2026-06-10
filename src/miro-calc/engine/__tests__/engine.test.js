import { describe, it, expect, beforeEach } from 'vitest'
import { createCalcEngine } from '../engine.js'
import { selfTest } from '../data/catalog.js'

let engine
beforeEach(() => {
  engine = createCalcEngine({ angleMode: 'deg' })
})

function evalOk(input) {
  const res = engine.evaluate(input)
  expect(res.ok, `${input} -> ${res.error}`).toBe(true)
  return res
}

describe('catalog self-test', () => {
  it('has no parse errors or name collisions', () => {
    expect(selfTest()).toEqual([])
  })
})

describe('basic arithmetic', () => {
  it('evaluates plain arithmetic', () => {
    expect(evalOk('2+2*3').ascii).toBe('8')
  })
  it('strips a trailing =', () => {
    expect(evalOk('6*7 =').ascii).toBe('42')
  })
  it('handles scientific notation', () => {
    expect(evalOk('3e8 / 1.5e8').ascii).toBe('2')
  })
  it('normalizes unicode operators', () => {
    expect(evalOk('6×7').ascii).toBe('42')
    expect(evalOk('10÷4').ascii).toBe('2.5')
    expect(evalOk('3²').ascii).toBe('9')
  })
})

describe('angle modes', () => {
  it('sin(30) = 0.5 in deg mode', () => {
    expect(Number(evalOk('sin(30)').ascii)).toBeCloseTo(0.5, 10)
  })
  it('sin(30 deg) works in rad mode too', () => {
    engine.setAngleMode('rad')
    expect(Number(evalOk('sin(30 deg)').ascii)).toBeCloseTo(0.5, 10)
    engine.setAngleMode('deg')
  })
  it('sin(pi/2) = 1 in rad mode', () => {
    engine.setAngleMode('rad')
    expect(Number(evalOk('sin(pi/2)').ascii)).toBeCloseTo(1, 10)
    engine.setAngleMode('deg')
  })
  it('asin(0.5) displays as 30 deg in deg mode', () => {
    expect(evalOk('asin(0.5)').ascii).toMatch(/30 deg/)
  })
  it('inverse trig result feeds back into trig', () => {
    expect(Number(evalOk('sin(asin(0.5))').ascii)).toBeCloseTo(0.5, 10)
  })
})

describe('units', () => {
  it('converts mph to m/s', () => {
    const res = evalOk('60 mph in m/s')
    expect(res.ascii).toMatch(/m \/ s|m\/s/)
    expect(parseFloat(res.ascii)).toBeCloseTo(26.822, 3)
  })
  it('simplifies N*m to J', () => {
    expect(evalOk('5 N * 3 m').ascii).toBe('15 J')
  })
  it('computes kinetic energy with explicit conversion', () => {
    expect(evalOk('0.5 * 70 kg * (3 m/s)^2 in J').ascii).toBe('315 J')
  })
  it('kinetic energy auto-simplifies to J without "in"', () => {
    expect(evalOk('0.5 * 70 kg * (3 m/s)^2').ascii).toBe('315 J')
  })
  it('disambiguates inch from the in operator', () => {
    expect(evalOk('2 in in cm').ascii).toBe('5.08 cm')
  })
  it('converts light-years to AU', () => {
    expect(parseFloat(evalOk('1 ly in AU').ascii)).toBeCloseTo(63241, 0)
  })
  it('sqrt of a unit quantity', () => {
    expect(parseFloat(evalOk('sqrt(2 * g0 * 5 m)').ascii)).toBeCloseTo(9.8995, 3)
  })
  it('gram is still a unit', () => {
    expect(evalOk('3 g in kg').ascii).toBe('0.003 kg')
  })
  it('rejects adding incompatible units with a friendly error', () => {
    const res = engine.evaluate('5 m + 3 s')
    expect(res.ok).toBe(false)
  })
  it('rejects converting incompatible units', () => {
    const res = engine.evaluate('5 J in N')
    expect(res.ok).toBe(false)
  })
})

describe('constants and data', () => {
  it('g0 is 9.8 m/s^2', () => {
    expect(evalOk('g0').ascii).toMatch(/9.8 m \/ s\^2/)
  })
  it('computes surface gravity from G and earth data', () => {
    const res = evalOk('G * earth.mass / earth.radius^2')
    expect(parseFloat(res.ascii)).toBeCloseTo(9.82, 1)
  })
  it('flat alias m_earth works', () => {
    expect(evalOk('m_earth').ascii).toMatch(/5.972/)
  })
  it('thermal energy in eV', () => {
    const res = evalOk('kB * 300 K in eV')
    expect(parseFloat(res.ascii)).toBeCloseTo(0.025852, 4)
  })
  it('heating water', () => {
    const res = evalOk('water.c * 2 kg * 30 K in kJ')
    expect(parseFloat(res.ascii)).toBeCloseTo(251.16, 1)
  })
  it('Coulomb force between two charges', () => {
    const res = evalOk('k_e * qe^2 / (1 angstrom)^2')
    expect(res.ascii).toMatch(/N$/)
    expect(parseFloat(res.ascii)).toBeCloseTo(2.307e-8, 10)
  })
})

describe('ans and variables', () => {
  it('supports assignment and reuse', () => {
    evalOk('v = 3 m/s')
    expect(evalOk('0.5 * 2 kg * v^2').ascii).toBe('9 J')
  })
  it('ans holds the previous answer', () => {
    evalOk('0.5 * 2 kg * (3 m/s)^2')
    expect(evalOk('ans + 1 J').ascii).toBe('10 J')
  })
  it('rejects assigning to a reserved constant', () => {
    const res = engine.evaluate('c = 5')
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/built-in/)
  })
  it('rejects assigning to a unit name', () => {
    const res = engine.evaluate('g = 5')
    expect(res.ok).toBe(false)
  })
  it('lists and clears user variables', () => {
    evalOk('q1 = 5 C')
    expect(engine.getVariables().map((v) => v.name)).toContain('q1')
    engine.clearVariables()
    expect(engine.getVariables()).toEqual([])
  })
})

describe('hardening', () => {
  it('blocks dangerous functions in expressions', () => {
    for (const expr of ['import({})', 'createUnit("zz")', 'evaluate("1")', 'parse("1")']) {
      const res = engine.evaluate(expr)
      expect(res.ok, expr).toBe(false)
    }
  })
})

describe('formatting', () => {
  it('uses scientific notation for big numbers with superscript display', () => {
    const res = evalOk('2.5e7 * 1')
    expect(res.ascii).toMatch(/2.5e\+?7/)
    expect(res.display).toContain('×10')
  })
  it('keeps 5 significant figures', () => {
    expect(evalOk('2/3').ascii).toBe('0.66667')
  })
})
