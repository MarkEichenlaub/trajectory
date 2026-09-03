// Problem generators for the algebraic/procedural fluency drill.
//
// Each skill isolates one narrow manipulation Leo has hesitated on in real
// sessions (see design spec, "Leo fluency" email, 2026-09-02) and generates
// problems that get harder as `level` rises. Every problem is built by
// picking the TARGET answer first and computing the given numbers from it
// (or, for pure arithmetic, by literally evaluating the expression in JS) --
// never by re-deriving the answer with a separate symbolic formula. That
// means a generator can't drift out of sync with its own checker.
//
// Coefficients are drawn from small "nice" pools (EASY_DIVISORS,
// QUOTIENT_MANTISSAS, SQRT_MANTISSAS) rather than arbitrary decimals, so
// every arithmetic step is doable by hand -- the skill being drilled is
// exponent/unit bookkeeping, not decimal long division. (Mark: "let's not
// do anything you'd have to plug into a calculator to solve.")
//
// A problem is: { skill, level, seed, promptMd, equation?, fields, answer,
// tolerance, explanationMd, timeTargetSec }. promptMd/explanationMd use the
// same "$$...$$ is KaTeX, blank line separates paragraphs" convention as
// utils/renderStatement.js. `equation`, when present, is an ordered list of
// { tex } static segments and { blank: fieldKey, sup? } inline inputs, so
// the problem renders as a real fill-in-the-equation line instead of a
// separate "?" placeholder plus a detached answer box. `fields` is 1-2
// answer inputs; `answer`/`tolerance` are keyed the same way -- tolerance 0
// means exact (rounded) integer match, otherwise a relative fraction.

function mulberry32(seed) {
  let a = seed >>> 0
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min }
function randDec(rng, min, max, decimals = 1) {
  const v = rng() * (max - min) + min
  const f = 10 ** decimals
  return Math.round(v * f) / f
}
function randChoice(rng, arr) { return arr[Math.floor(rng() * arr.length)] }
function randNonZeroInt(rng, min, max) {
  let v = 0
  while (v === 0) v = randInt(rng, min, max)
  return v
}

// Normalizes any nonzero float to {c, e} with 1 <= |c| < 10, c*10^e == value
// (up to float precision). This is what lets every "compute a physics
// quantity" skill share one grader: the raw value is always computed by
// literally doing the arithmetic on the numbers shown, then normalized here.
function normalizeSci(value) {
  if (value === 0) return { c: 0, e: 0 }
  const sign = value < 0 ? -1 : 1
  const abs = Math.abs(value)
  let e = Math.floor(Math.log10(abs))
  let c = abs / 10 ** e
  // Float log10 can land a hair on the wrong side of a power-of-ten boundary.
  if (c >= 10) { c /= 10; e += 1 }
  if (c < 1) { c *= 10; e -= 1 }
  return { c: sign * Math.round(c * 1000) / 1000, e }
}

function sciTex(c, e) {
  const cStr = Number.isInteger(c) ? String(c) : c.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return e === 0 ? `${cStr}` : `${cStr} \\times 10^{${e}}`
}

// A unit raised to a power belongs OUTSIDE \text{...} -- KaTeX's \text is a
// text-mode group where ^ has no special meaning, so `\text{kW^2}` is a
// parse error (and, with throwOnError:false, renders as literal red text).
// `\text{kW}^2` is valid: the ^ applies to the text group from math mode.
function unitTex(prefix, unit, power) {
  return power === 1 ? `\\text{${prefix}${unit}}` : `\\text{${prefix}${unit}}^{${power}}`
}

const VARS = ['x', 'a', 'v', 'q', 'r']

// ── "Nice number" toolkit: every generator below draws coefficients from
// these pools (or constructs a pair so a division comes out clean) instead
// of arbitrary decimals, so the arithmetic never requires a calculator.
const EASY_DIVISORS = [1, 2, 4, 5, 8]
const QUOTIENT_MANTISSAS = [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 7.5, 8, 9]
const SQRT_MANTISSAS = [1, 4, 9] // sqrt -> 1, 2, 3

// Picks (c1, c2) with c1 = c2 * (a nice mantissa), c1 landing in [1, 10) --
// so c1/c2 is a hand-computable division by construction.
function niceQuotientPair(rng) {
  for (let i = 0; i < 30; i++) {
    const c2 = randChoice(rng, EASY_DIVISORS)
    const q = randChoice(rng, QUOTIENT_MANTISSAS)
    const c1 = Math.round(c2 * q * 10) / 10
    if (c1 >= 1 && c1 < 10) return { c1, c2 }
  }
  return { c1: 4, c2: 2 }
}

// ── Shared answer-blank builder ─────────────────────────────────────────
// Decides how a computed result should be answered: a plain decimal when
// it's within a few places of 1 (per Mark: forcing scientific notation on
// something like 0.078 adds a needless step), otherwise coefficient x10^exp.
// Returns the RHS blank segments (caller supplies the "=" and LHS) plus the
// matching fields/answer/tolerance.
function answerBlanks(raw, unitTex) {
  const { c, e } = normalizeSci(raw)
  const tail = unitTex ? [{ tex: unitTex }] : []
  if (Math.abs(e) <= 3) {
    return {
      fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 4.2' }],
      answer: { v: raw }, tolerance: { v: 0.02 },
      equation: [{ blank: 'v' }, ...tail],
    }
  }
  return {
    fields: [
      { key: 'c', label: 'coefficient (1 ≤ c < 10)', type: 'decimal', placeholder: 'e.g. 3.2' },
      { key: 'e', label: 'power of 10', type: 'int', placeholder: 'e.g. -6' },
    ],
    answer: { c, e }, tolerance: { c: 0.03, e: 0 },
    equation: [{ blank: 'c' }, { tex: '\\times 10' }, { blank: 'e', sup: true }, ...tail],
  }
}

function fmtSigned(n) { return n >= 0 ? `${n}` : `(${n})` }
function round2(x) { return Math.round(x * 100) / 100 }

// ═══════════════════════════════════════════════════════════════════════
// Skill 1 — sign of the exponent when a power crosses the division bar
// ═══════════════════════════════════════════════════════════════════════
function genExpSignDivision(level, rng) {
  const V = randChoice(rng, VARS)
  let num, den, promptExpr

  if (level === 0) {
    den = randInt(rng, 1, 5); num = den + randInt(rng, 1, 6)
    promptExpr = `\\dfrac{${V}^{${num}}}{${V}^{${den}}}`
  } else if (level === 1) {
    num = randInt(rng, 2, 9); den = -randInt(rng, 1, 6)
    promptExpr = `\\dfrac{${V}^{${num}}}{${V}^{${den}}}`
  } else if (level === 2) {
    num = -randInt(rng, 2, 9); den = randInt(rng, 1, 6)
    promptExpr = `\\dfrac{${V}^{${num}}}{${V}^{${den}}}`
  } else if (level === 3) {
    num = -randInt(rng, 1, 9); den = -randInt(rng, 1, 6)
    promptExpr = `\\dfrac{${V}^{${num}}}{${V}^{${den}}}`
  } else if (level === 4) {
    const a = randNonZeroInt(rng, -6, 6), b = randNonZeroInt(rng, -6, 6), c = randNonZeroInt(rng, -6, 6)
    num = a + b; den = c
    promptExpr = `\\dfrac{${V}^{${a}} \\cdot ${V}^{${b}}}{${V}^{${c}}}`
  } else {
    const fracs = [[1, 2], [-1, 2], [3, 2], [-3, 2], [1, 3], [2, 3], [-2, 3], [1, 4], [3, 4]]
    const [p1, q1] = randChoice(rng, fracs)
    const [p2, q2] = randChoice(rng, fracs)
    num = p1 / q1; den = p2 / q2
    const t = (p, q) => (q === 1 ? `${p}` : `${p}/${q}`)
    promptExpr = `\\dfrac{${V}^{${t(p1, q1)}}}{${V}^{${t(p2, q2)}}}`
  }

  const result = num - den
  const isInt = Number.isInteger(result)
  const field = isInt
    ? { key: 'exp', label: 'exponent', type: 'int', placeholder: 'e.g. -3' }
    : { key: 'exp', label: 'exponent', type: 'decimal', placeholder: 'e.g. 1.5' }

  return {
    promptMd: `Simplify to a single power of ${V}.`,
    equation: [{ tex: `${promptExpr} = ${V}` }, { blank: 'exp', sup: true }],
    fields: [field],
    answer: { exp: result },
    tolerance: { exp: isInt ? 0 : 0.01 },
    explanationMd:
      `Dividing powers of the same base subtracts exponents: numerator exponent minus denominator exponent.\n\n` +
      `Here that's $$${fmtSigned(num)} - (${fmtSigned(den)}) = ${fmtSigned(result)}$$\n\n` +
      `A negative exponent in the denominator flips sign when it crosses the bar (it *adds* to the numerator's exponent) — that's the step this drill is built to make automatic.`,
    timeTargetSec: Math.max(8, 22 - level * 2),
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 2 — scientific-notation arithmetic (the fraction-of-powers-of-ten drill)
// ═══════════════════════════════════════════════════════════════════════
const SKIN_TEMPLATES = [
  {
    build: rng => {
      const { c1: F, c2: A } = niceQuotientPair(rng)
      const Fe = randInt(rng, 0, 4), Ae = randInt(rng, -8, -2)
      return {
        promptMd: `A wire carries tension $$F = ${sciTex(F, Fe)}\\text{ N}$$ and has cross-sectional area $$A = ${sciTex(A, Ae)}\\text{ m}^2$$.\n\nFind the stress $$\\sigma = F/A$$, in pascals.`,
        raw: (F * 10 ** Fe) / (A * 10 ** Ae), label: '\\sigma', unit: '\\text{Pa}',
        rule: 'stress = force / area — divide the coefficients, subtract the exponents',
      }
    },
  },
  {
    build: rng => {
      const v = randChoice(rng, [1, 1.5, 2, 2.5, 3, 3.5, 4]), ve = randInt(rng, 1, 5)
      const m = randInt(rng, 2, 9), me = randInt(rng, -3, 2)
      return {
        promptMd: `A particle of mass $$m = ${sciTex(m, me)}\\text{ kg}$$ moves at $$v = ${sciTex(v, ve)}\\text{ m/s}$$.\n\nFind its kinetic energy $$KE = \\tfrac12 mv^2$$, in joules.`,
        raw: 0.5 * (m * 10 ** me) * (v * 10 ** ve) ** 2, label: 'KE', unit: '\\text{J}',
        rule: 'square the coefficient and double its exponent for v², then multiply by ½m',
      }
    },
  },
  {
    build: rng => {
      const q1 = randInt(rng, 2, 9), q1e = randInt(rng, -9, -6)
      const q2 = randInt(rng, 2, 9), q2e = randInt(rng, -9, -6)
      const r = randChoice(rng, [1, 2]), re = randInt(rng, -2, 0)
      const k = 9, ke = 9
      return {
        promptMd: `Two charges $$q_1 = ${sciTex(q1, q1e)}\\text{ C}$$ and $$q_2 = ${sciTex(q2, q2e)}\\text{ C}$$ are separated by $$r = ${sciTex(r, re)}\\text{ m}$$.\n\nUsing $$F = k\\dfrac{q_1 q_2}{r^2}$$ with $$k = ${sciTex(k, ke)}$$, find F in newtons.`,
        raw: (k * 10 ** ke * (q1 * 10 ** q1e) * (q2 * 10 ** q2e)) / (r * 10 ** re) ** 2, label: 'F', unit: '\\text{N}',
        rule: 'multiply the coefficients in the numerator, then divide by r² — square r\'s coefficient and double its exponent first',
      }
    },
  },
  {
    build: rng => {
      const { c1: P, c2: I } = niceQuotientPair(rng)
      const Pe = randInt(rng, 1, 5), Ie = randInt(rng, -3, 1)
      return {
        promptMd: `A device dissipates power $$P = ${sciTex(P, Pe)}\\text{ W}$$ while drawing current $$I = ${sciTex(I, Ie)}\\text{ A}$$.\n\nFind the voltage $$V = P/I$$, in volts.`,
        raw: (P * 10 ** Pe) / (I * 10 ** Ie), label: 'V', unit: '\\text{V}',
        rule: 'voltage = power / current — divide the coefficients, subtract the exponents',
      }
    },
  },
]

function genSciNotationArith(level, rng) {
  if (level === 0) {
    const a = randNonZeroInt(rng, -6, 6), b = randNonZeroInt(rng, -6, 6)
    const raw = 10 ** a / 10 ** b
    return {
      promptMd: `Simplify to a single power of 10.`,
      equation: [{ tex: `\\dfrac{10^{${a}}}{10^{${b}}} = 10` }, { blank: 'e', sup: true }],
      fields: [{ key: 'e', label: 'power of 10', type: 'int', placeholder: 'e.g. 4' }],
      answer: { e: a - b }, tolerance: { e: 0 },
      explanationMd: `Dividing powers of ten subtracts exponents: $$${fmtSigned(a)} - (${fmtSigned(b)}) = ${a - b}$$`,
      timeTargetSec: 15,
    }
  }
  if (level === 1) {
    const { c1, c2 } = niceQuotientPair(rng)
    const a = randInt(rng, -8, 8), b = randInt(rng, -8, 8)
    const raw = (c1 * 10 ** a) / (c2 * 10 ** b)
    const blanks = answerBlanks(raw, null)
    return {
      promptMd: `Simplify, in proper scientific notation.`,
      equation: [{ tex: `\\dfrac{${sciTex(c1, a)}}{${sciTex(c2, b)}}` }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, answer: blanks.answer, tolerance: blanks.tolerance,
      explanationMd: `Divide the coefficients ($$${c1}/${c2} = ${round2(c1 / c2)}$$) and subtract the exponents ($$${fmtSigned(a)} - (${fmtSigned(b)}) = ${a - b}$$), then renormalize so the coefficient is between 1 and 10.`,
      timeTargetSec: 25,
    }
  }
  if (level === 2) {
    const c1 = randInt(rng, 2, 9), a1 = randInt(rng, -6, 6)
    const c2 = randInt(rng, 2, 9), a2 = randInt(rng, -6, 6)
    const c3 = randChoice(rng, EASY_DIVISORS), a3 = randInt(rng, -6, 6)
    const raw = (c1 * 10 ** a1 * c2 * 10 ** a2) / (c3 * 10 ** a3)
    const blanks = answerBlanks(raw, null)
    return {
      promptMd: `Simplify, in proper scientific notation.`,
      equation: [{ tex: `\\dfrac{(${sciTex(c1, a1)})(${sciTex(c2, a2)})}{${sciTex(c3, a3)}}` }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, answer: blanks.answer, tolerance: blanks.tolerance,
      explanationMd: `Multiply the numerator's coefficients and add its exponents first, then divide by the denominator the same way you would in an ordinary fraction — combine all the exponent bookkeeping before renormalizing.`,
      timeTargetSec: 30,
    }
  }
  if (level === 3) {
    const squareIt = rng() < 0.5
    let c1, a1, c2, a2, raw, expr
    if (squareIt) {
      c1 = randChoice(rng, [1.5, 2, 2.5, 3, 3.5, 4]); a1 = randInt(rng, -6, 6)
      c2 = randChoice(rng, EASY_DIVISORS); a2 = randInt(rng, -6, 6)
      raw = (c1 * 10 ** a1) ** 2 / (c2 * 10 ** a2)
      expr = `\\dfrac{(${sciTex(c1, a1)})^2}{${sciTex(c2, a2)}}`
    } else {
      c1 = randChoice(rng, SQRT_MANTISSAS); a1 = randInt(rng, -6, 6) * 2 // even, so the exponent halves cleanly
      c2 = randChoice(rng, EASY_DIVISORS); a2 = randInt(rng, -6, 6)
      raw = Math.sqrt(c1 * 10 ** a1) / (c2 * 10 ** a2)
      expr = `\\dfrac{\\sqrt{${sciTex(c1, a1)}}}{${sciTex(c2, a2)}}`
    }
    const blanks = answerBlanks(raw, null)
    return {
      promptMd: `Simplify, in proper scientific notation.`,
      equation: [{ tex: expr }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, answer: blanks.answer, tolerance: blanks.tolerance,
      explanationMd: squareIt
        ? `Squaring $$c \\times 10^{n}$$ squares the coefficient and *doubles* the exponent — a common slip is adding instead of doubling.`
        : `Taking a square root halves the exponent — the exponent here is even so it halves cleanly, and the coefficient (${c1}) is a perfect square.`,
      timeTargetSec: 30,
    }
  }
  const skin = randChoice(rng, SKIN_TEMPLATES).build(rng)
  const blanks = answerBlanks(skin.raw, skin.unit)
  return {
    promptMd: skin.promptMd,
    equation: [{ tex: `${skin.label}` }, { tex: '=' }, ...blanks.equation],
    fields: blanks.fields, answer: blanks.answer, tolerance: blanks.tolerance,
    explanationMd: skin.rule,
    timeTargetSec: 35,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 3 — unit-prefix conversion, including squared/cubed units
// (directly pulled from Leo's 2026-09-02 session: 2.0 mm² = 2×10⁻⁶ m²)
// ═══════════════════════════════════════════════════════════════════════
const PREFIXES = { G: 1e9, M: 1e6, k: 1e3, '': 1, c: 1e-2, m: 1e-3, 'μ': 1e-6, n: 1e-9 }
const UNITS = ['m', 'g', 's', 'N', 'Pa', 'C', 'W']

function genUnitPrefixConvert(level, rng) {
  const unit = randChoice(rng, UNITS)
  const value = randDec(rng, 1, 9.9, 1)
  let fromP, toP, power

  if (level === 0) { fromP = randChoice(rng, ['k', 'c', 'm']); toP = ''; power = 1 }
  else if (level === 1) { fromP = randChoice(rng, ['k', 'c', 'm']); toP = ''; power = 2 }
  else if (level === 2) { fromP = randChoice(rng, ['k', 'c', 'm']); toP = ''; power = 3 }
  else if (level === 3) {
    const opts = [['c', 'm'], ['m', 'c'], ['k', 'm'], ['m', 'k'], ['c', 'k']]
    ;[fromP, toP] = randChoice(rng, opts)
    power = randChoice(rng, [1, 2])
  } else {
    fromP = randChoice(rng, ['G', 'M', 'μ', 'n', 'k', 'm']); toP = ''; power = randChoice(rng, [1, 2, 3])
  }

  const raw = value * (PREFIXES[fromP] / PREFIXES[toP]) ** power
  const blanks = answerBlanks(raw, unitTex(toP, unit, power))

  return {
    promptMd: power > 1
      ? `Convert. Remember: the conversion factor gets raised to the power on the unit too.`
      : `Convert.`,
    equation: [{ tex: `${value}\\ ${unitTex(fromP, unit, power)}` }, { tex: '=' }, ...blanks.equation],
    fields: blanks.fields, answer: blanks.answer, tolerance: blanks.tolerance,
    explanationMd: power === 1
      ? `1 ${fromP}${unit} = ${PREFIXES[fromP] / PREFIXES[toP]} ${toP}${unit}, so multiply straight through.`
      : `Because the unit is raised to the ${power}${power === 2 ? 'nd' : 'rd'} power, the linear conversion factor (${PREFIXES[fromP] / PREFIXES[toP]}) must also be raised to the ${power}${power === 2 ? 'nd' : 'rd'} power — this is exactly the step that turns "1 mm² = 10⁻³ m²" (wrong) into "1 mm² = 10⁻⁶ m²" (right).`,
    timeTargetSec: Math.max(12, 26 - level * 2),
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 4 — signed vector components
// Angles are always a 30-60-90 or 45-45-90 reference angle reflected into
// the right quadrant -- the standard "no calculator" trig set -- so the
// arithmetic is a memorized-ratio lookup, never a calculator trig call.
// ═══════════════════════════════════════════════════════════════════════
const REF_ANGLES = [30, 45, 60]
const NICE_MAGNITUDES = [4, 6, 8, 10, 12, 16, 20, 24]

function genVectorComponents(level, rng) {
  const M = randChoice(rng, NICE_MAGNITUDES)
  const ref = randChoice(rng, REF_ANGLES)
  let theta, promptMd

  if (level === 0) theta = ref
  else if (level === 1) theta = 180 - ref
  else if (level === 2) theta = 180 + ref
  else if (level === 3) theta = 360 - ref

  if (level <= 3) {
    promptMd = `A vector has magnitude $$${M}$$ at $$${theta}°$$ (measured counterclockwise from the +x axis — a 30-60-90 or 45-45-90 reference angle, so no calculator needed).\n\nFind its x- and y-components.`
  } else if (level === 4) {
    const phrasings = [
      { desc: t => `${t}° below the +x-axis`, toStd: t => 360 - t },
      { desc: t => `${t}° west of north`, toStd: t => 90 + t },
      { desc: t => `${t}° above the −x-axis`, toStd: t => 180 - t },
      { desc: t => `${t}° south of west`, toStd: t => 180 + t },
    ]
    const p = randChoice(rng, phrasings)
    theta = p.toStd(ref)
    promptMd = `A vector has magnitude $$${M}$$, directed $$${p.desc(ref)}$$.\n\nFind its x- and y-components (standard axes: +x right, +y up).`
  } else {
    const Ax = randChoice(rng, [-12, -8, -6, -4, 0, 4, 6, 8, 12])
    const Ay = randChoice(rng, [-12, -8, -6, -4, 0, 4, 6, 8, 12])
    const MB = randChoice(rng, NICE_MAGNITUDES)
    const refB = randChoice(rng, REF_ANGLES)
    const thB = randChoice(rng, [refB, 180 - refB, 180 + refB, 360 - refB])
    const rad = thB * Math.PI / 180
    const Bx = MB * Math.cos(rad), By = MB * Math.sin(rad)
    return {
      promptMd: `Vector A has components $$(${Ax}, ${Ay})$$. Vector B has magnitude $$${MB}$$ at $$${thB}°$$ from the +x axis (a 30-60-90 / 45-45-90 angle).\n\nFind the components of the resultant $$\\vec A + \\vec B$$.`,
      fields: [
        { key: 'x', label: 'x-component', type: 'decimal', placeholder: 'e.g. -3.2' },
        { key: 'y', label: 'y-component', type: 'decimal', placeholder: 'e.g. 7.1' },
      ],
      answer: { x: Ax + Bx, y: Ay + By },
      tolerance: { x: 0.02, y: 0.02 },
      explanationMd: `Add components separately: $$A_x + B_x$$ and $$A_y + B_y$$, where $$B_x = M_B\\cos\\theta_B$$ and $$B_y = M_B\\sin\\theta_B$$ come from the reference-angle ratios.`,
      timeTargetSec: 35,
    }
  }

  const rad = theta * Math.PI / 180
  const Vx = M * Math.cos(rad), Vy = M * Math.sin(rad)
  return {
    promptMd,
    fields: [
      { key: 'x', label: 'x-component', type: 'decimal', placeholder: 'e.g. -3.2' },
      { key: 'y', label: 'y-component', type: 'decimal', placeholder: 'e.g. 7.1' },
    ],
    answer: { x: Vx, y: Vy },
    tolerance: { x: 0.02, y: 0.02 },
    explanationMd: `$$V_x = M\\cos\\theta = ${M}\\cos(${theta}°)$$, $$V_y = M\\sin\\theta = ${M}\\sin(${theta}°)$$, using the ${ref}° reference triangle's ratios. The quadrant of θ decides the signs — that's the part worth checking.`,
    timeTargetSec: Math.max(15, 30 - level * 2),
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 5 — isolate a variable, then evaluate
// (target is picked first, as a nice integer or half-integer, and the
// givens are back-computed from it -- exact by construction, and every
// division/root lands on a friendly number)
// ═══════════════════════════════════════════════════════════════════════
function genIsolateVariable(level, rng) {
  if (level === 0) {
    const a = randChoice(rng, EASY_DIVISORS)
    const t = randChoice(rng, [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8])
    const v0 = randChoice(rng, [-8, -5, -4, -2, 0, 2, 4, 5, 8])
    const v = v0 + a * t
    return {
      promptMd: `An object's velocity follows $$v = v_0 + at$$ with $$v_0 = ${v0}\\text{ m/s}$$, $$a = ${a}\\text{ m/s}^2$$, and $$v = ${round2(v)}\\text{ m/s}$$.\n\nSolve for $$t$$ (in seconds).`,
      fields: [{ key: 't', label: 't (s)', type: 'decimal', placeholder: 'e.g. 3.5' }],
      answer: { t }, tolerance: { t: 0.02 },
      explanationMd: `Isolate t by subtracting $$v_0$$ from both sides, then dividing by a: $$t = \\dfrac{v - v_0}{a} = \\dfrac{${round2(v)} - (${v0})}{${a}} = ${t}$$`,
      timeTargetSec: 20,
    }
  }
  if (level === 1) {
    const v = randChoice(rng, [2, 3, 4, 5, 6, 7, 8])
    const m = randChoice(rng, EASY_DIVISORS)
    const KE = 0.5 * m * v * v
    return {
      promptMd: `Kinetic energy is $$KE = \\tfrac12 mv^2$$, with $$m = ${m}\\text{ kg}$$ and $$KE = ${round2(KE)}\\text{ J}$$.\n\nSolve for the (positive) speed $$v$$ (in m/s).`,
      fields: [{ key: 'v', label: 'v (m/s)', type: 'decimal', placeholder: 'e.g. 4' }],
      answer: { v }, tolerance: { v: 0.02 },
      explanationMd: `Multiply both sides by $$2/m$$ to isolate $$v^2$$, then take the square root: $$v = \\sqrt{2KE/m} = \\sqrt{${round2(v * v)}} = ${v}$$.`,
      timeTargetSec: 25,
    }
  }
  if (level === 2) {
    const t = randChoice(rng, [2, 3, 4, 5, 6, 7, 8])
    const a = randChoice(rng, EASY_DIVISORS)
    const d = 0.5 * a * t * t
    return {
      promptMd: `An object starting from rest covers $$d = \\tfrac12 at^2$$, with $$a = ${a}\\text{ m/s}^2$$ and $$d = ${round2(d)}\\text{ m}$$.\n\nSolve for the (positive) time $$t$$ (in seconds).`,
      fields: [{ key: 't', label: 't (s)', type: 'decimal', placeholder: 'e.g. 4' }],
      answer: { t }, tolerance: { t: 0.02 },
      explanationMd: `Multiply both sides by $$2/a$$ to isolate $$t^2$$, then take the square root: $$t = \\sqrt{2d/a} = \\sqrt{${round2(t * t)}} = ${t}$$.`,
      timeTargetSec: 25,
    }
  }
  const p = randChoice(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12])
  const m = randChoice(rng, [1, 2, 4])
  const KE = (p * p) / (2 * m)
  return {
    promptMd: `Momentum and kinetic energy are related by $$KE = \\dfrac{p^2}{2m}$$, with $$m = ${m}\\text{ kg}$$ and $$KE = ${round2(KE)}\\text{ J}$$.\n\nSolve for the (positive) momentum $$p$$ (in kg·m/s).`,
    fields: [{ key: 'p', label: 'p (kg·m/s)', type: 'decimal', placeholder: 'e.g. 6' }],
    answer: { p }, tolerance: { p: 0.02 },
    explanationMd: `Multiply both sides by $$2m$$ to isolate $$p^2$$, then take the square root: $$p = \\sqrt{2m \\cdot KE} = \\sqrt{${round2(p * p)}} = ${p}$$.`,
    timeTargetSec: 30,
  }
}

// ── Catalog ──────────────────────────────────────────────────────────────

export const SKILLS = [
  {
    slug: 'exp-sign-division', name: 'Exponent sign across a division bar',
    description: 'Simplifying a^m / a^n to a single power, including negative and fractional exponents.',
    category: 'exponents', maxLevel: 5, generate: genExpSignDivision,
  },
  {
    slug: 'sci-notation-arith', name: 'Scientific-notation arithmetic',
    description: 'Multiplying/dividing numbers in scientific notation and renormalizing, including inside physics formulas.',
    category: 'scientific notation', maxLevel: 4, generate: genSciNotationArith,
  },
  {
    slug: 'unit-prefix-convert', name: 'Unit-prefix conversion (incl. squared/cubed)',
    description: 'Converting between SI prefixes, including the trap of squaring/cubing the conversion factor for area/volume units.',
    category: 'units', maxLevel: 4, generate: genUnitPrefixConvert,
  },
  {
    slug: 'vector-components', name: 'Signed vector components',
    description: 'Decomposing a vector into x/y components with the correct sign for its quadrant, including worded directions.',
    category: 'vectors', maxLevel: 5, generate: genVectorComponents,
  },
  {
    slug: 'isolate-variable', name: 'Isolate a variable, then evaluate',
    description: 'Rearranging a physics formula to solve for a target variable (including one buried under a square or square root).',
    category: 'algebra', maxLevel: 3, generate: genIsolateVariable,
  },
]

const BY_SLUG = Object.fromEntries(SKILLS.map(s => [s.slug, s]))

export function generateProblem(slug, level, seed) {
  const skill = BY_SLUG[slug]
  if (!skill) throw new Error(`Unknown fluency skill: ${slug}`)
  const clamped = Math.max(0, Math.min(level, skill.maxLevel))
  const rng = mulberry32(seed)
  const problem = skill.generate(clamped, rng)
  return { skill: slug, level: clamped, seed, ...problem }
}

// Grades a submitted set of field values against a problem's answer/tolerance.
// Returns { correct, perField } so the UI can show which field(s) were off.
// The floor scales with the target's own order of magnitude, so a tiny
// decimal answer (e.g. 0.078) isn't held to the same absolute tolerance as a
// physics-scale one (e.g. 2e8) -- a fixed floor was too loose for the former
// and irrelevant for the latter.
export function gradeAnswer(problem, submitted) {
  const perField = {}
  let allCorrect = true
  for (const f of problem.fields) {
    const raw = submitted[f.key]
    const val = typeof raw === 'string' ? parseFloat(raw.replace(/,/g, '')) : raw
    const target = problem.answer[f.key]
    const tol = problem.tolerance[f.key] || 0
    let ok
    if (!Number.isFinite(val)) {
      ok = false
    } else if (tol === 0) {
      ok = Math.round(val) === Math.round(target)
    } else {
      const scale = target !== 0 ? 10 ** Math.floor(Math.log10(Math.abs(target))) : 1
      const floor = f.key === 'e' ? 0.01 : Math.max(scale * 0.015, 1e-6)
      ok = Math.abs(val - target) <= Math.max(tol * Math.abs(target), floor)
    }
    perField[f.key] = ok
    if (!ok) allCorrect = false
  }
  return { correct: allCorrect, perField }
}
