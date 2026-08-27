import { describe, it, expect } from 'vitest'
import {
  splitChoiceRun,
  latexToUnicode,
  statementToPlainText,
  problemToClipboardText,
} from '../statementText'

// The problem from the screenshot that prompted the Copy button (FMA12 #6).
const DROPLET = {
  contest: 'F=ma Problem Series',
  lesson: 'FMA12: Dimensional Analysis',
  label: 'FMA12',
  set_label: 'Problem 6',
  year: 0,
  statement:
    "A water droplet falling through the air can oscillate with some angular frequency. " +
    "If a certain drop oscillates with angular frequency $$\\omega,$$ what is the oscillation " +
    "angular frequency of a drop with half of the first drop's radius? " +
    '(a) $$\\omega/2$$ (b) $$\\omega$$ (c) $$\\sqrt{2}\\omega$$ (d) $$2\\omega$$ (e) $$2\\sqrt{2}\\omega$$',
}

describe('splitChoiceRun', () => {
  it('splits a trailing (a)-(e) run off the stem', () => {
    const got = splitChoiceRun(DROPLET.statement)
    expect(got.stem.endsWith("first drop's radius?")).toBe(true)
    expect(got.choices.map(c => c.letter)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(got.choices[2].text).toBe('$$\\sqrt{2}\\omega$$')
  })

  it('handles upper-case runs and choices that are figures', () => {
    const got = splitChoiceRun('Which graph shows the motion? (A) (B) (C) (D) (E)')
    expect(got.choices.map(c => c.letter)).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(got.choices.every(c => c.text === '')).toBe(true)
  })

  // The AoPS scripts label multi-part questions "__(a)__", and their prose
  // often points back at earlier parts -- neither is a choice list.
  it('leaves bold part labels and prose cross-references alone', () => {
    expect(splitChoiceRun('__(a)__ What happens? __(b)__ Why? __(c)__ Explain.')).toBe(null)
    expect(splitChoiceRun('Choose one of (a) or (b) and one of (c) or (d).')).toBe(null)
    expect(splitChoiceRun('Note that statements (a) and (b) are about velocities. (c) is not.')).toBe(null)
  })

  it('needs a lead-in for a short run, but trusts a full a-e sweep', () => {
    const midSentence = 'Three designs attach the rope at point (A) near the wall, at point (B) halfway out, or at point (C) near the end.'
    expect(splitChoiceRun(midSentence)).toBe(null)
    const leadIn = 'Using only one horse would: (A) halve the tension; (B) not change the tension; (C) double the tension.'
    expect(splitChoiceRun(leadIn).choices).toHaveLength(3)
  })

  it('ignores markers inside math, which would split a formula in half', () => {
    expect(splitChoiceRun('Enter $$(a) > (b) = (c) > (d)$$ to rank them.')).toBe(null)
  })
})

describe('latexToUnicode', () => {
  it.each([
    [String.raw`\omega/2`, 'ω/2'],
    [String.raw`2\sqrt{2}\omega`, '2√2ω'],
    [String.raw`\sqrt{g/L}`, '√(g/L)'],
    [String.raw`\dfrac{1}{2}`, '1/2'],
    [String.raw`\dfrac{2L}{gt^2}`, '2L/gt²'],
    [String.raw`\dfrac{v_f T}{2}`, '(v_f T)/2'],
    [String.raw`3\;\mathrm{m/s^2}`, '3 m/s²'],
    [String.raw`1.054\times 10^{-34}\;\mathrm{J\cdot s}`, '1.054×10⁻³⁴ J·s'],
    [String.raw`45^\circ`, '45°'],
    [String.raw`x = x_0 + v_0 t + \tfrac12 a t^2`, 'x = x₀ + v₀ t + 1/2 a t²'],
    [String.raw`\vec{a} = -\vec{g}`, 'a⃗ = -g⃗'],
    [String.raw`F_d \approx \rho A v^2`, 'F_d ≈ ρ A v²'],
    [String.raw`\left|\dfrac{\Delta x}{\Delta t}\right| \le \dfrac{\pi}{2}`, '|(Δ x)/(Δ t)| ≤ π/2'],
  ])('renders %s', (tex, expected) => {
    expect(latexToUnicode(tex)).toBe(expected)
  })

  // Whatever it can't map, it should at least not leak raw markup into the
  // clipboard -- an unknown command drops out and leaves its argument behind.
  it('leaves no backslashes or braces behind', () => {
    const out = latexToUnicode(String.raw`\overbrace{\alpha}^{\text{unknown}} \boxed{q}`)
    expect(out).not.toMatch(/[\\{}]/)
  })
})

describe('statementToPlainText', () => {
  it('puts each choice on its own line with Unicode math', () => {
    expect(statementToPlainText(DROPLET.statement).split('\n').slice(1)).toEqual([
      '(a) ω/2',
      '(b) ω',
      '(c) √2ω',
      '(d) 2ω',
      '(e) 2√2ω',
    ])
  })

  it('keeps paragraphs and drops bold markers', () => {
    expect(statementToPlainText('First __part__.\n\nSecond part.')).toBe('First part.\n\nSecond part.')
  })
})

describe('problemToClipboardText', () => {
  it('leads with the source line, then the statement', () => {
    const text = problemToClipboardText(DROPLET)
    expect(text.split('\n')[0]).toBe('F=ma Problem Series · FMA12: Dimensional Analysis · Problem 6')
    expect(text).toContain('\n\nA water droplet')
    expect(text.endsWith('(e) 2√2ω')).toBe(true)
  })

  it('uses year and label when there is no lesson', () => {
    const line = problemToClipboardText({ contest: 'USAPhO', year: 2021, label: 'A1', statement: 'Go.' })
    expect(line).toBe('USAPhO · 2021 · A1\n\nGo.')
  })
})
