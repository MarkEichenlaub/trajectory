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
  // Float log10 can land a hair on the wrong side of a power-of-ten boundary
  // (e.g. 8e-7/8e2 evaluates to 9.999999999999998e-10, not exactly 1e-9).
  if (c >= 10) { c /= 10; e += 1 }
  if (c < 1) { c *= 10; e -= 1 }
  c = Math.round(c * 1000) / 1000
  // Rounding to 3 decimals can itself push c to exactly 10 (9.9999996 -> 10.000)
  // even though the pre-round value was inside [1, 10) -- re-check after rounding
  // or the stored answer silently drifts out of proper-scientific-notation range
  // and no longer matches the freshly-recomputed explanation text.
  if (c >= 10) { c /= 10; e += 1 }
  return { c: sign * c, e }
}

// Evaluates a small arithmetic expression typed as an answer -- "6*sqrt(3)/2"
// as well as a plain "5.196" -- so a student who works a vector/root problem
// out to an exact form isn't forced to round it to a decimal by hand just to
// have something to type. No eval(): a hand-rolled recursive-descent parser
// over +, -, *, /, ^, parens, and sqrt(...) only. Returns NaN on anything
// else (including empty input), which the grader already treats as wrong.
export function evalMathExpr(input) {
  if (typeof input === 'number') return input
  if (typeof input !== 'string') return NaN
  const src = input.trim()
  if (!src || !/^[-+*/^().\d\s a-zA-Z]*$/.test(src)) return NaN
  let pos = 0
  const peek = () => { while (src[pos] === ' ') pos++; return src[pos] }
  function expr() {
    let v = term()
    for (let c = peek(); c === '+' || c === '-'; c = peek()) {
      pos++
      v = c === '+' ? v + term() : v - term()
    }
    return v
  }
  function term() {
    let v = unary()
    for (let c = peek(); c === '*' || c === '/'; c = peek()) {
      pos++
      v = c === '*' ? v * unary() : v / unary()
    }
    return v
  }
  function unary() {
    const c = peek()
    if (c === '-') { pos++; return -unary() }
    if (c === '+') { pos++; return unary() }
    return power()
  }
  function power() {
    const base = atom()
    if (peek() === '^') { pos++; return Math.pow(base, unary()) }
    return base
  }
  function atom() {
    peek()
    if (src[pos] === '(') {
      pos++
      const v = expr()
      if (peek() !== ')') throw new Error('unbalanced')
      pos++
      return v
    }
    if (src.slice(pos, pos + 4).toLowerCase() === 'sqrt') {
      pos += 4
      if (peek() !== '(') throw new Error('sqrt needs (')
      pos++
      const v = expr()
      if (peek() !== ')') throw new Error('unbalanced')
      pos++
      return Math.sqrt(v)
    }
    // Accepts "5", "5.2", and ".5" -- a leading-zero-less decimal like the
    // last one used to fail to match at all (reported: ".5" graded wrong
    // even though it equals the expected 0.5).
    const m = /^(?:\d+\.?\d*|\.\d+)/.exec(src.slice(pos))
    if (!m) throw new Error('expected a number')
    pos += m[0].length
    return parseFloat(m[0])
  }
  try {
    const v = expr()
    peek()
    return pos === src.length ? v : NaN
  } catch {
    return NaN
  }
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
// "1 + coeff*term" written the way a person would write it by hand -- "1 - 2x"
// rather than the glued "1+-2x" a naive template literal produces for a
// negative coefficient.
function fmtTerm(coeff, term) {
  if (coeff === 1) return `+ ${term}`
  if (coeff === -1) return `- ${term}`
  return coeff >= 0 ? `+ ${coeff}${term}` : `- ${Math.abs(coeff)}${term}`
}
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
      promptMd: `Simplify.`,
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
      promptMd: `Simplify.`,
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
      promptMd: `Simplify.`,
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
    // Prefix-to-prefix conversions, not just prefix-to-base -- including pairs
    // where NEITHER side is the base unit (e.g. "100 kPa in GPa"), which the
    // level-4 case below never generates because it always converts to base.
    const opts = [
      ['c', 'm'], ['m', 'c'], ['k', 'm'], ['m', 'k'], ['c', 'k'],
      ['k', 'M'], ['M', 'k'], ['k', 'G'], ['G', 'k'], ['M', 'G'], ['G', 'M'],
      ['m', 'μ'], ['μ', 'm'], ['n', 'μ'], ['μ', 'n'],
    ]
    ;[fromP, toP] = randChoice(rng, opts)
    power = randChoice(rng, [1, 2])
  } else {
    fromP = randChoice(rng, ['G', 'M', 'μ', 'n', 'k', 'm']); toP = ''; power = randChoice(rng, [1, 2, 3])
  }

  const raw = value * (PREFIXES[fromP] / PREFIXES[toP]) ** power
  const blanks = answerBlanks(raw, unitTex(toP, unit, power))

  return {
    promptMd: `Convert.`,
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
    promptMd = `A vector has magnitude $$${M}$$ at $$${theta}°$$ from the +x axis.\n\nFind its x- and y-components.`
  } else if (level === 4) {
    const phrasings = [
      { desc: t => `${t}° below the +x-axis`, toStd: t => 360 - t },
      { desc: t => `${t}° west of north`, toStd: t => 90 + t },
      { desc: t => `${t}° above the −x-axis`, toStd: t => 180 - t },
      { desc: t => `${t}° south of west`, toStd: t => 180 + t },
    ]
    const p = randChoice(rng, phrasings)
    theta = p.toStd(ref)
    promptMd = `A vector has magnitude $$${M}$$, directed $$${p.desc(ref)}$$.\n\nFind its x- and y-components.`
  } else {
    const Ax = randChoice(rng, [-12, -8, -6, -4, 0, 4, 6, 8, 12])
    const Ay = randChoice(rng, [-12, -8, -6, -4, 0, 4, 6, 8, 12])
    const MB = randChoice(rng, NICE_MAGNITUDES)
    const refB = randChoice(rng, REF_ANGLES)
    const thB = randChoice(rng, [refB, 180 - refB, 180 + refB, 360 - refB])
    const rad = thB * Math.PI / 180
    const Bx = MB * Math.cos(rad), By = MB * Math.sin(rad)
    return {
      promptMd: `Vector A has components $$(${Ax}, ${Ay})$$. Vector B has magnitude $$${MB}$$ at $$${thB}°$$ from the +x axis.\n\nFind the components of the resultant $$\\vec A + \\vec B$$.`,
      fields: [
        { key: 'x', label: 'x-component', type: 'decimal' },
        { key: 'y', label: 'y-component', type: 'decimal' },
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

// ═══════════════════════════════════════════════════════════════════════
// Skill 6 — unit dimensional analysis: simplify a fraction of base units,
// then recall/expand named derived units (N, J, Pa, W, Hz), then read the
// units of an unknown constant off a physics formula. Every answer is
// exponents of kg/m/s -- always exact integers, including under a square
// root, because the templates are built (or curated) so that holds.
// ═══════════════════════════════════════════════════════════════════════
const BASE = ['kg', 'm', 's']
// Exponents of kg, m, s for each named derived unit (all expressible in
// pure mechanics -- no ampere/kelvin/mole needed).
const UNIT_EXP = {
  N: { kg: 1, m: 1, s: -2 },
  J: { kg: 1, m: 2, s: -2 },
  Pa: { kg: 1, m: -1, s: -2 },
  W: { kg: 1, m: 2, s: -3 },
  Hz: { kg: 0, m: 0, s: -1 },
  kg: { kg: 1, m: 0, s: 0 },
  m: { kg: 0, m: 1, s: 0 },
  s: { kg: 0, m: 0, s: 1 },
}
function addExp(a, b, sign = 1) {
  return { kg: a.kg + sign * b.kg, m: a.m + sign * b.m, s: a.s + sign * b.s }
}
function scaleExp(a, k) { return { kg: a.kg * k, m: a.m * k, s: a.s * k } }

// A base-unit exponent vector as an actual fraction (positive exponents on
// top, negative ones flipped to the bottom) -- "kg/(m·s^2)" rather than
// "kg^1 m^-1 s^-2" -- which is how these show up in a real formula.
function fracTex(exp) {
  const pos = BASE.filter(u => exp[u] > 0).map(u => (exp[u] === 1 ? `\\text{${u}}` : `\\text{${u}}^{${exp[u]}}`))
  const neg = BASE.filter(u => exp[u] < 0).map(u => (-exp[u] === 1 ? `\\text{${u}}` : `\\text{${u}}^{${-exp[u]}}`))
  const numer = pos.length ? pos.join(' \\cdot ') : '1'
  return neg.length ? `\\dfrac{${numer}}{${neg.join(' \\cdot ')}}` : numer
}

// "kg^{2} \cdot m" style tex for a set of base-unit exponents (all >= 0).
// Units with exponent 0 are omitted; exponent 1 shows no visible power.
// Units are set upright (\text{...}) rather than KaTeX's default italic --
// bare "kg" in math mode reads as the product of variables k and g.
function unitTermTex(exp) {
  const parts = BASE.filter(u => exp[u] > 0).map(u => (exp[u] === 1 ? `\\text{${u}}` : `\\text{${u}}^{${exp[u]}}`))
  return parts.length ? parts.join(' \\cdot ') : '1'
}

// The always-present "= kg^[_] m^[_] s^[_]" answer tail, shared by every
// level of this skill so a student always states units the same way Mark
// asked for: "in kg, m, s."
function baseExponentBlanks() {
  return {
    fields: [
      { key: 'ekg', label: 'power of kg', type: 'int', placeholder: 'e.g. -1' },
      { key: 'em', label: 'power of m', type: 'int', placeholder: 'e.g. 3' },
      { key: 'es', label: 'power of s', type: 'int', placeholder: 'e.g. -2' },
    ],
    equation: [
      { tex: '\\text{kg}' }, { blank: 'ekg', sup: true },
      { tex: '\\,\\text{m}' }, { blank: 'em', sup: true },
      { tex: '\\,\\text{s}' }, { blank: 'es', sup: true },
    ],
  }
}
function baseExponentAnswer(exp) {
  return { answer: { ekg: exp.kg, em: exp.m, es: exp.s }, tolerance: { ekg: 0, em: 0, es: 0 } }
}
// Same idea as unitTermTex but for a result that may have negative
// exponents (unitTermTex is display-only for non-negative inputs).
function fmtExp(exp) {
  const parts = BASE.filter(u => exp[u] !== 0).map(u => (exp[u] === 1 ? `\\text{${u}}` : `\\text{${u}}^{${exp[u]}}`))
  return parts.length ? parts.join('\\cdot ') : '1'
}

const DERIVED_POOL = ['N', 'J', 'Pa', 'W', 'Hz']

// Unit names are wrapped in \text{...} throughout -- upright, not KaTeX's
// default italic (bare "kg" in math mode reads as k times g).
const SQRT_UNIT_TEMPLATES = [
  { tex: '\\sqrt{\\text{J}/\\text{kg}}', exp: { kg: 0, m: 1, s: -1 }, steps: '$$\\text{J}/\\text{kg} = \\text{kg}\\,\\text{m}^2\\,\\text{s}^{-2} / \\text{kg} = \\text{m}^2\\,\\text{s}^{-2}$$, and $$\\sqrt{\\text{m}^2\\,\\text{s}^{-2}} = \\text{m}\\,\\text{s}^{-1}$$.' },
  { tex: '\\sqrt{\\text{N} \\cdot \\text{m}/\\text{kg}}', exp: { kg: 0, m: 1, s: -1 }, steps: '$$\\text{N}\\cdot\\text{m}/\\text{kg} = (\\text{kg}\\,\\text{m}\\,\\text{s}^{-2})(\\text{m})/\\text{kg} = \\text{m}^2\\,\\text{s}^{-2}$$, and $$\\sqrt{\\text{m}^2\\,\\text{s}^{-2}} = \\text{m}\\,\\text{s}^{-1}$$.' },
  { tex: '\\sqrt{\\text{Pa} \\cdot \\text{m}^3/\\text{kg}}', exp: { kg: 0, m: 1, s: -1 }, steps: '$$\\text{Pa}\\cdot\\text{m}^3/\\text{kg} = (\\text{kg}\\,\\text{m}^{-1}\\text{s}^{-2})(\\text{m}^3)/\\text{kg} = \\text{m}^2\\,\\text{s}^{-2}$$, and $$\\sqrt{\\text{m}^2\\,\\text{s}^{-2}} = \\text{m}\\,\\text{s}^{-1}$$.' },
  { tex: '\\sqrt{\\text{N}/(\\text{kg} \\cdot \\text{m})}', exp: { kg: 0, m: 0, s: -1 }, steps: '$$\\text{N}/(\\text{kg}\\cdot\\text{m}) = (\\text{kg}\\,\\text{m}\\,\\text{s}^{-2})/(\\text{kg}\\,\\text{m}) = \\text{s}^{-2}$$, and $$\\sqrt{\\text{s}^{-2}} = \\text{s}^{-1}$$.' },
  { tex: '\\sqrt{\\text{J}/(\\text{kg} \\cdot \\text{m}^2)}', exp: { kg: 0, m: 0, s: -1 }, steps: '$$\\text{J}/(\\text{kg}\\cdot\\text{m}^2) = (\\text{kg}\\,\\text{m}^2\\,\\text{s}^{-2})/(\\text{kg}\\,\\text{m}^2) = \\text{s}^{-2}$$, and $$\\sqrt{\\text{s}^{-2}} = \\text{s}^{-1}$$.' },
]

// Each entry states a formula, which quantities' units are given, and
// derives the unknown's units as exponent-vector arithmetic on those givens
// -- exact by construction, and hand-checkable the same way a student would.
const DIMENSIONAL_FORMULAS = [
  {
    label: 'G', promptMd: `Newton's law of gravitation is $$F = G\\dfrac{m_1 m_2}{r^2}$$, where F is in newtons, $$m_1$$ and $$m_2$$ are in kg, and r is in m.\n\nFind the units of G.`,
    exp: addExp(addExp(UNIT_EXP.N, scaleExp(UNIT_EXP.m, 2)), scaleExp(UNIT_EXP.kg, 2), -1),
    steps: '$$G = \\dfrac{F r^2}{m_1 m_2}$$, so its units are $$\\text{N} \\cdot \\text{m}^2 / \\text{kg}^2$$ — substitute $$\\text{N} = \\text{kg}\\,\\text{m}\\,\\text{s}^{-2}$$ and simplify.',
  },
  {
    label: 'k', promptMd: `A spring obeys Hooke's law, $$F = kx$$, where F is in newtons and x is in m.\n\nFind the units of the spring constant k.`,
    exp: addExp(UNIT_EXP.N, UNIT_EXP.m, -1),
    steps: '$$k = F/x$$, so its units are $$\\text{N}/\\text{m}$$ — substitute $$\\text{N} = \\text{kg}\\,\\text{m}\\,\\text{s}^{-2}$$ and cancel the m.',
  },
  {
    label: 'h', promptMd: `A photon's energy is $$E = hf$$, where E is in joules and f (frequency) is in Hz ($$\\text{s}^{-1}$$).\n\nFind the units of Planck's constant h.`,
    exp: addExp(UNIT_EXP.J, UNIT_EXP.Hz, -1),
    steps: '$$h = E/f$$, so its units are $$\\text{J}/\\text{Hz} = \\text{J}\\cdot\\text{s}$$ — substitute $$\\text{J} = \\text{kg}\\,\\text{m}^2\\,\\text{s}^{-2}$$.',
  },
  {
    label: '\\eta', promptMd: `Stokes' law for drag on a sphere is $$F = 6\\pi\\eta r v$$, where F is in newtons, r is in m, and v (speed) is in m/s.\n\nFind the units of the viscosity η.`,
    exp: addExp(addExp(UNIT_EXP.N, UNIT_EXP.m, -1), { kg: 0, m: 1, s: -1 }, -1),
    steps: '$$\\eta = \\dfrac{F}{r v}$$, so its units are $$\\dfrac{\\text{N}}{\\text{m} \\cdot (\\text{m}/\\text{s})}$$ — substitute $$\\text{N} = \\text{kg}\\,\\text{m}\\,\\text{s}^{-2}$$ and simplify.',
  },
  {
    label: 'b', promptMd: `A linear drag force is $$F = bv$$, where F is in newtons and v (speed) is in m/s.\n\nFind the units of the damping coefficient b.`,
    exp: addExp(UNIT_EXP.N, { kg: 0, m: 1, s: -1 }, -1),
    steps: '$$b = F/v$$, so its units are $$\\text{N}/(\\text{m}/\\text{s}) = \\text{N}\\cdot\\text{s}/\\text{m}$$ — substitute $$\\text{N} = \\text{kg}\\,\\text{m}\\,\\text{s}^{-2}$$.',
  },
  {
    label: 'I', promptMd: `Rotational form of Newton's second law: $$\\tau = I\\alpha$$, where torque τ is in $$\\text{N}\\cdot\\text{m}$$ and angular acceleration α is in $$\\text{s}^{-2}$$.\n\nFind the units of the moment of inertia I.`,
    exp: addExp(addExp(UNIT_EXP.N, UNIT_EXP.m), { kg: 0, m: 0, s: -2 }, -1),
    steps: '$$I = \\tau/\\alpha$$, so its units are $$(\\text{N}\\cdot\\text{m})/\\text{s}^{-2} = \\text{N}\\cdot\\text{m}\\cdot\\text{s}^2$$ — substitute $$\\text{N} = \\text{kg}\\,\\text{m}\\,\\text{s}^{-2}$$.',
  },
]

function genUnitDimensions(level, rng) {
  if (level === 0) {
    let num, den
    do { num = { kg: randInt(rng, 0, 3), m: randInt(rng, 0, 3), s: randInt(rng, 0, 3) } } while (num.kg + num.m + num.s === 0)
    do { den = { kg: randInt(rng, 0, 2), m: randInt(rng, 0, 2), s: randInt(rng, 0, 2) } } while (den.kg + den.m + den.s === 0)
    const result = addExp(num, den, -1)
    const blanks = baseExponentBlanks()
    return {
      promptMd: `Simplify to a single power of each base unit.`,
      equation: [{ tex: `\\dfrac{${unitTermTex(num)}}{${unitTermTex(den)}}` }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, ...baseExponentAnswer(result),
      explanationMd: `Subtract exponents base by base: kg, then m, then s. $$\\dfrac{${unitTermTex(num)}}{${unitTermTex(den)}} = ${fmtExp(result)}$$`,
      timeTargetSec: 20,
    }
  }
  if (level === 1) {
    const name = randChoice(rng, DERIVED_POOL)
    const exp = UNIT_EXP[name]
    const blanks = baseExponentBlanks()
    return {
      promptMd: `State the definition of a ${name === 'Pa' ? 'pascal' : name === 'Hz' ? 'hertz' : name === 'N' ? 'newton' : name === 'J' ? 'joule' : 'watt'} in kg, m, and s.`,
      equation: [{ tex: `1\\ \\text{${name}}` }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, ...baseExponentAnswer(exp),
      explanationMd: `$$1\\ \\text{${name}} = ${fmtExp(exp)}$$ — this is worth memorizing outright; every other derived-unit question builds on it.`,
      timeTargetSec: 15,
    }
  }
  if (level === 2) {
    const pool = [...DERIVED_POOL, ...BASE]
    // At least one derived unit on top, so expansion is unavoidable.
    const numNames = [randChoice(rng, DERIVED_POOL), randChoice(rng, pool)]
    const denName = randChoice(rng, pool)
    const num = addExp(UNIT_EXP[numNames[0]], UNIT_EXP[numNames[1]])
    const result = addExp(num, UNIT_EXP[denName], -1)
    const numTex = numNames.map(n => `\\text{${n}}`).join(' \\cdot ')
    const blanks = baseExponentBlanks()
    return {
      promptMd: `Expand each unit into kg, m, s, then simplify.`,
      equation: [{ tex: `\\dfrac{${numTex}}{\\text{${denName}}}` }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, ...baseExponentAnswer(result),
      explanationMd: `Expand: $$\\text{${numNames[0]}} = ${fmtExp(UNIT_EXP[numNames[0]])}$$, $$\\text{${numNames[1]}} = ${fmtExp(UNIT_EXP[numNames[1]])}$$, $$\\text{${denName}} = ${fmtExp(UNIT_EXP[denName])}$$, then combine exponents base by base.`,
      timeTargetSec: 30,
    }
  }
  if (level === 3) {
    const t = randChoice(rng, SQRT_UNIT_TEMPLATES)
    const blanks = baseExponentBlanks()
    return {
      promptMd: `Expand, simplify, then take the square root.`,
      equation: [{ tex: t.tex }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, ...baseExponentAnswer(t.exp),
      explanationMd: t.steps,
      timeTargetSec: 35,
    }
  }
  if (level === 4) {
    const f = randChoice(rng, DIMENSIONAL_FORMULAS)
    const blanks = baseExponentBlanks()
    return {
      promptMd: f.promptMd,
      equation: [{ tex: f.label }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, ...baseExponentAnswer(f.exp),
      explanationMd: f.steps + ` Final units: $$${fmtExp(f.exp)}$$.`,
      timeTargetSec: 40,
    }
  }
  // Level 5 -- a fraction of two square roots, each itself a fraction of base
  // units (e.g. sqrt(kg/(m·s^2)) / sqrt(kg/m^3)). `diff` is picked with even
  // components so (numIn - denIn)/2 is an exact integer vector -- the whole
  // thing collapses to sqrt(numIn/denIn), which is why the two square roots
  // don't each need to come out even on their own.
  let numIn, denIn, diff, tries = 0
  do {
    numIn = { kg: randInt(rng, -3, 3), m: randInt(rng, -3, 3), s: randInt(rng, -3, 3) }
    diff = { kg: randInt(rng, -2, 2) * 2, m: randInt(rng, -2, 2) * 2, s: randInt(rng, -2, 2) * 2 }
    denIn = addExp(numIn, diff, -1)
    tries++
  } while (tries < 50 && (
    (numIn.kg === 0 && numIn.m === 0 && numIn.s === 0) ||
    (denIn.kg === 0 && denIn.m === 0 && denIn.s === 0) ||
    Math.max(Math.abs(denIn.kg), Math.abs(denIn.m), Math.abs(denIn.s)) > 3
  ))
  const result = scaleExp(diff, 0.5)
  const blanks = baseExponentBlanks()
  return {
    promptMd: `Simplify.`,
    equation: [
      { tex: `\\dfrac{\\sqrt{${fracTex(numIn)}}}{\\sqrt{${fracTex(denIn)}}}` }, { tex: '=' }, ...blanks.equation,
    ],
    fields: blanks.fields, ...baseExponentAnswer(result),
    explanationMd: `Combine into one square root first: $$\\dfrac{\\sqrt{${fracTex(numIn)}}}{\\sqrt{${fracTex(denIn)}}} = \\sqrt{\\dfrac{${fracTex(numIn)}}{${fracTex(denIn)}}}$$, simplify what's inside base by base, *then* take the root. Result: $$${fmtExp(result)}$$.`,
    timeTargetSec: 45,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 7 — exponent rules: power-of-a-power, product of powers, and roots
// of powers (Leo's 2026-09-03 session: sqrt(T^-2)). Deliberately separate
// from exp-sign-division, which only drills the division-bar sign flip --
// this one is the other core rules, in both bare-variable and physics form.
// ═══════════════════════════════════════════════════════════════════════
const PHYS_EXP_VARS = ['T', 'M', 'L', 'v', 'r', 'm', '\\omega']

function genExponentRules(level, rng) {
  const V = randChoice(rng, VARS)
  if (level === 0) {
    const a = randNonZeroInt(rng, -5, 5), b = randNonZeroInt(rng, -4, 4)
    const result = a * b
    return {
      promptMd: `Simplify to a single power of ${V}.`,
      equation: [{ tex: `(${V}^{${a}})^{${b}}` }, { tex: '=' }, { tex: V }, { blank: 'exp', sup: true }],
      fields: [{ key: 'exp', label: 'exponent', type: 'int', placeholder: 'e.g. -6' }],
      answer: { exp: result }, tolerance: { exp: 0 },
      explanationMd: `Raising a power to a power multiplies the exponents: $$(${V}^{${a}})^{${b}} = ${V}^{${fmtSigned(a)}\\times ${fmtSigned(b)}} = ${V}^{${result}}$$`,
      timeTargetSec: 15,
    }
  }
  if (level === 1) {
    const a = randNonZeroInt(rng, -6, 6), b = randNonZeroInt(rng, -6, 6)
    const result = a + b
    return {
      promptMd: `Simplify to a single power of ${V}.`,
      equation: [{ tex: `${V}^{${a}} \\cdot ${V}^{${b}}` }, { tex: '=' }, { tex: V }, { blank: 'exp', sup: true }],
      fields: [{ key: 'exp', label: 'exponent', type: 'int', placeholder: 'e.g. 3' }],
      answer: { exp: result }, tolerance: { exp: 0 },
      explanationMd: `Multiplying powers of the same base adds exponents: $$${fmtSigned(a)} + (${fmtSigned(b)}) = ${result}$$`,
      timeTargetSec: 12,
    }
  }
  if (level === 2) {
    const PV = randChoice(rng, PHYS_EXP_VARS)
    const half = randNonZeroInt(rng, -4, 4)
    const n = half * 2
    return {
      promptMd: `Simplify.`,
      equation: [{ tex: `\\sqrt{${PV}^{${n}}}` }, { tex: '=' }, { tex: PV }, { blank: 'exp', sup: true }],
      fields: [{ key: 'exp', label: 'exponent', type: 'int', placeholder: 'e.g. -1' }],
      answer: { exp: half }, tolerance: { exp: 0 },
      explanationMd: `A square root halves the exponent: $$\\sqrt{${PV}^{${n}}} = ${PV}^{${n}/2} = ${PV}^{${half}}$$ — the same move that turns $$\\sqrt{${PV}^{-2}}$$ into $$${PV}^{-1}$$.`,
      timeTargetSec: 15,
    }
  }
  if (level === 3) {
    const PV = randChoice(rng, PHYS_EXP_VARS)
    let n
    do { n = randNonZeroInt(rng, -7, 7) } while (n % 2 === 0)
    const half = n / 2
    return {
      promptMd: `Simplify.`,
      equation: [{ tex: `\\sqrt{${PV}^{${n}}}` }, { tex: '=' }, { tex: PV }, { blank: 'exp', sup: true }],
      fields: [{ key: 'exp', label: 'exponent', type: 'decimal', placeholder: 'e.g. 1.5' }],
      answer: { exp: half }, tolerance: { exp: 0.01 },
      explanationMd: `A square root halves the exponent even when it doesn't land on a whole number: $$${n}/2 = ${half}$$`,
      timeTargetSec: 18,
    }
  }
  if (rng() < 0.5) {
    const PV = randChoice(rng, PHYS_EXP_VARS.filter(v => v !== '\\omega'))
    let a, b, c, inner
    do {
      a = randNonZeroInt(rng, -4, 4); b = randNonZeroInt(rng, -3, 3); c = randNonZeroInt(rng, -6, 6)
      inner = a * b - c
    } while (inner % 2 !== 0)
    const result = inner / 2
    return {
      promptMd: `Simplify.`,
      equation: [
        { tex: `\\sqrt{\\dfrac{(${PV}^{${a}})^{${b}}}{${PV}^{${c}}}}` }, { tex: '=' }, { tex: PV }, { blank: 'exp', sup: true },
      ],
      fields: [{ key: 'exp', label: 'exponent', type: 'decimal', placeholder: 'e.g. 2' }],
      answer: { exp: result }, tolerance: { exp: 0.01 },
      explanationMd: `Combine the power-of-a-power and the division first: $$${fmtSigned(a)}\\times ${fmtSigned(b)} - ${fmtSigned(c)} = ${inner}$$. Then the square root halves it: $$${inner}/2 = ${result}$$.`,
      timeTargetSec: 30,
    }
  }
  const V2 = randChoice(rng, VARS.filter(v => v !== V))
  const a = randNonZeroInt(rng, -4, 4), b = randNonZeroInt(rng, -4, 4), c = randNonZeroInt(rng, -3, 3)
  return {
    promptMd: `Simplify $$(${V}^{${a}} ${V2}^{${b}})^{${c}}$$ and give the exponent of ${V}.`,
    fields: [{ key: 'exp', label: `exponent of ${V}`, type: 'int', placeholder: 'e.g. -6' }],
    answer: { exp: a * c }, tolerance: { exp: 0 },
    explanationMd: `Raise each factor to the outer power separately: the exponent of ${V} is $$${a}\\times ${c} = ${a * c}$$ (and ${V2}'s would be $$${b}\\times ${c} = ${b * c}$$).`,
    timeTargetSec: 25,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 8 — physics symbol literacy: meaning, pronunciation, SI units, and
// M/L/T dimensions of the symbols that actually show up on F=ma exams, plus
// the reverse (name a quantity, pick its symbol). `exp` reuses the same
// kg/m/s exponent vectors as the unit-dimensions skill; dimensions (M, L, T)
// are the same numbers under a different label, so no separate data needed.
// ═══════════════════════════════════════════════════════════════════════
const PHYSICS_SYMBOLS = [
  // tier 0 — the everyday Latin letters
  { symbol: 'F', meaning: 'force', pronunciation: 'eff', greek: false, exp: { kg: 1, m: 1, s: -2 }, namedUnit: 'N', tier: 0 },
  { symbol: 'm', meaning: 'mass', pronunciation: 'em', greek: false, exp: { kg: 1, m: 0, s: 0 }, namedUnit: null, tier: 0 },
  { symbol: 'a', meaning: 'acceleration', pronunciation: 'ay', greek: false, exp: { kg: 0, m: 1, s: -2 }, namedUnit: null, tier: 0 },
  { symbol: 'v', meaning: 'velocity (speed)', pronunciation: 'vee', greek: false, exp: { kg: 0, m: 1, s: -1 }, namedUnit: null, tier: 0 },
  { symbol: 't', meaning: 'time', pronunciation: 'tee', greek: false, exp: { kg: 0, m: 0, s: 1 }, namedUnit: null, tier: 0 },
  { symbol: 'g', meaning: 'gravitational acceleration (near a surface)', pronunciation: 'jee', greek: false, exp: { kg: 0, m: 1, s: -2 }, namedUnit: null, tier: 0 },
  { symbol: 'p', meaning: 'momentum', pronunciation: 'pee', greek: false, exp: { kg: 1, m: 1, s: -1 }, namedUnit: null, tier: 0 },
  { symbol: 'W', meaning: 'work', pronunciation: 'double-u', greek: false, exp: { kg: 1, m: 2, s: -2 }, namedUnit: 'J', tier: 0 },
  // tier 1 — less-common Latin letters and the first Greek letters
  { symbol: 'N', meaning: 'normal force', pronunciation: 'en', greek: false, exp: { kg: 1, m: 1, s: -2 }, namedUnit: 'N', tier: 1 },
  { symbol: 'k', meaning: 'spring constant', pronunciation: 'kay', greek: false, exp: { kg: 1, m: 0, s: -2 }, namedUnit: null, tier: 1 },
  { symbol: 'U', meaning: 'potential energy', pronunciation: 'you', greek: false, exp: { kg: 1, m: 2, s: -2 }, namedUnit: 'J', tier: 1 },
  { symbol: 'K', meaning: 'kinetic energy', pronunciation: 'kay', greek: false, exp: { kg: 1, m: 2, s: -2 }, namedUnit: 'J', tier: 1 },
  { symbol: 'P', meaning: 'power', pronunciation: 'pee', greek: false, exp: { kg: 1, m: 2, s: -3 }, namedUnit: 'W', tier: 1 },
  { symbol: 'I', meaning: 'moment of inertia', pronunciation: 'eye', greek: false, exp: { kg: 1, m: 2, s: 0 }, namedUnit: null, tier: 1 },
  { symbol: 'L', meaning: 'angular momentum', pronunciation: 'el', greek: false, exp: { kg: 1, m: 2, s: -1 }, namedUnit: null, tier: 1 },
  { symbol: '\\mu', meaning: 'coefficient of friction', pronunciation: 'myoo', greek: true, exp: { kg: 0, m: 0, s: 0 }, namedUnit: null, tier: 1 },
  { symbol: '\\rho', meaning: 'density', pronunciation: 'row', greek: true, exp: { kg: 1, m: -3, s: 0 }, namedUnit: null, tier: 1 },
  { symbol: '\\theta', meaning: 'angle', pronunciation: 'THAY-tuh', greek: true, exp: { kg: 0, m: 0, s: 0 }, namedUnit: null, tier: 1 },
  { symbol: '\\omega', meaning: 'angular velocity', pronunciation: 'oh-MAY-guh', greek: true, exp: { kg: 0, m: 0, s: -1 }, namedUnit: null, tier: 1 },
  // tier 2 — the ones Leo will only see cold on the real exam
  { symbol: 'G', meaning: 'universal gravitational constant', pronunciation: 'big jee', greek: false, exp: { kg: -1, m: 3, s: -2 }, namedUnit: null, tier: 2 },
  { symbol: '\\tau', meaning: 'torque', pronunciation: 'taw', greek: true, exp: { kg: 1, m: 2, s: -2 }, namedUnit: null, tier: 2 },
  { symbol: '\\alpha', meaning: 'angular acceleration', pronunciation: 'AL-fuh', greek: true, exp: { kg: 0, m: 0, s: -2 }, namedUnit: null, tier: 2 },
  { symbol: '\\eta', meaning: 'viscosity', pronunciation: 'AY-tuh', greek: true, exp: { kg: 1, m: -1, s: -1 }, namedUnit: null, tier: 2 },
  { symbol: '\\lambda', meaning: 'linear mass density', pronunciation: 'LAM-duh', greek: true, exp: { kg: 1, m: -1, s: 0 }, namedUnit: null, tier: 2 },
  { symbol: '\\sigma', meaning: 'stress', pronunciation: 'SIG-muh', greek: true, exp: { kg: 1, m: -1, s: -2 }, namedUnit: 'Pa', tier: 2 },
  { symbol: 'b', meaning: 'linear drag coefficient', pronunciation: 'bee', greek: false, exp: { kg: 1, m: 0, s: -1 }, namedUnit: null, tier: 2 },
  { symbol: 'f', meaning: 'frequency', pronunciation: 'eff', greek: false, exp: { kg: 0, m: 0, s: -1 }, namedUnit: 'Hz', tier: 2 },
]

// M/L/T dimension letters are set upright with \mathrm{}, not \text{} (which
// is for unit *names* like kg/m/s) and never bare italic.
function dimensionBlanks() {
  return {
    fields: [
      { key: 'eM', label: 'power of M', type: 'int', placeholder: 'e.g. 1' },
      { key: 'eL', label: 'power of L', type: 'int', placeholder: 'e.g. -3' },
      { key: 'eT', label: 'power of T', type: 'int', placeholder: 'e.g. -2' },
    ],
    equation: [
      { tex: '\\mathrm{M}' }, { blank: 'eM', sup: true },
      { tex: '\\,\\mathrm{L}' }, { blank: 'eL', sup: true },
      { tex: '\\,\\mathrm{T}' }, { blank: 'eT', sup: true },
    ],
  }
}
function dimensionAnswer(exp) {
  return { answer: { eM: exp.kg, eL: exp.m, eT: exp.s }, tolerance: { eM: 0, eL: 0, eT: 0 } }
}
function fmtDimensions(exp) {
  const map = [['M', exp.kg], ['L', exp.m], ['T', exp.s]]
  const parts = map.filter(([, e]) => e !== 0).map(([u, e]) => (e === 1 ? `\\mathrm{${u}}` : `\\mathrm{${u}}^{${e}}`))
  return parts.length ? parts.join('\\, ') : '1 (dimensionless)'
}

function shuffle(rng, arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function pickN(rng, pool, n) {
  return shuffle(rng, pool).slice(0, Math.min(n, pool.length))
}

// Picks n distractors whose *displayed* text (via textFn) doesn't collide
// with the correct option's or each other's -- e.g. K, k, and P all
// pronounce "kay"/"pee", so a plain pickN can silently produce an MC
// question with two buttons showing the exact same text.
function pickDistinctDistractors(rng, correct, pool, textFn, n) {
  const used = new Set([textFn(correct)])
  const picked = []
  for (const cand of shuffle(rng, pool)) {
    const t = textFn(cand)
    if (used.has(t)) continue
    used.add(t)
    picked.push(cand)
    if (picked.length >= n) break
  }
  return picked
}

function symbolPool(level) {
  const maxTier = Math.min(level, 2)
  return PHYSICS_SYMBOLS.filter(s => s.tier <= maxTier)
}

function genPhysicsSymbols(level, rng) {
  const pool = symbolPool(level)
  const kinds = ['meaning', 'meaning-reverse', 'units', 'dimensions']
  if (pool.some(s => s.greek)) kinds.push('pronunciation')
  const kind = randChoice(rng, kinds)

  if (kind === 'meaning' || kind === 'pronunciation') {
    const field = kind === 'meaning' ? 'meaning' : 'pronunciation'
    const candidates = kind === 'pronunciation' ? pool.filter(s => s.greek) : pool
    const correct = randChoice(rng, candidates)
    const distractors = pickDistinctDistractors(rng, correct, pool.filter(s => s !== correct), s => s[field], 3)
    const options = shuffle(rng, [correct, ...distractors]).map(s => ({ key: s.symbol, label: s[field] }))
    return {
      promptMd: kind === 'meaning'
        ? `In a physics formula, $$${correct.symbol}$$ most commonly stands for:`
        : `How do you pronounce $$${correct.symbol}$$?`,
      fields: [{ key: 'ans', type: 'mc', label: '', options }],
      answer: { ans: correct.symbol }, tolerance: {},
      explanationMd: kind === 'meaning'
        ? `$$${correct.symbol}$$ is the standard symbol for **${correct.meaning}**.`
        : `$$${correct.symbol}$$ is pronounced "${correct.pronunciation}."`,
      timeTargetSec: 10,
    }
  }

  if (kind === 'meaning-reverse') {
    const correct = randChoice(rng, pool)
    const distractors = pickN(rng, pool.filter(s => s !== correct), 3)
    const options = shuffle(rng, [correct, ...distractors]).map(s => ({ key: s.symbol, tex: s.symbol }))
    return {
      promptMd: `Which symbol usually stands for **${correct.meaning}**?`,
      fields: [{ key: 'ans', type: 'mc', label: '', options }],
      answer: { ans: correct.symbol }, tolerance: {},
      explanationMd: `${correct.meaning[0].toUpperCase()}${correct.meaning.slice(1)} is usually written $$${correct.symbol}$$.`,
      timeTargetSec: 12,
    }
  }

  if (kind === 'units') {
    const withNamed = pool.filter(s => s.namedUnit)
    const withoutNamed = pool.filter(s => !s.namedUnit)
    const useNamed = withNamed.length > 0 && (withoutNamed.length === 0 || rng() < 0.4)
    if (useNamed) {
      const s = randChoice(rng, withNamed)
      return {
        promptMd: `What SI unit (symbol) would you measure $$${s.symbol}$$ (${s.meaning}) in?`,
        fields: [{ key: 'unit', label: 'unit symbol', type: 'text', placeholder: 'e.g. Pa' }],
        answer: { unit: s.namedUnit }, tolerance: {},
        explanationMd: `${s.meaning[0].toUpperCase()}${s.meaning.slice(1)} ($$${s.symbol}$$) is measured in ${s.namedUnit === 'N' ? 'newtons' : s.namedUnit === 'J' ? 'joules' : s.namedUnit === 'W' ? 'watts' : s.namedUnit === 'Pa' ? 'pascals' : 'hertz'}, symbol $$\\text{${s.namedUnit}}$$.`,
        timeTargetSec: 12,
      }
    }
    const s = randChoice(rng, withoutNamed.length ? withoutNamed : pool)
    const blanks = baseExponentBlanks()
    return {
      promptMd: `What SI units would you measure $$${s.symbol}$$ (${s.meaning}) in?`,
      equation: [{ tex: `[${s.symbol}]` }, { tex: '=' }, ...blanks.equation],
      fields: blanks.fields, ...baseExponentAnswer(s.exp),
      explanationMd: `${s.meaning[0].toUpperCase()}${s.meaning.slice(1)} has units $$${fmtExp(s.exp)}$$.`,
      timeTargetSec: 20,
    }
  }

  // kind === 'dimensions'
  const s = randChoice(rng, pool)
  const blanks = dimensionBlanks()
  return {
    promptMd: `What are the dimensions of $$${s.symbol}$$ (${s.meaning})?`,
    equation: [{ tex: `[${s.symbol}]` }, { tex: '=' }, ...blanks.equation],
    fields: blanks.fields, ...dimensionAnswer(s.exp),
    explanationMd: `${s.meaning[0].toUpperCase()}${s.meaning.slice(1)} has dimensions $$${fmtDimensions(s.exp)}$$ — mass (M), length (L), time (T).`,
    timeTargetSec: 20,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 9 — Taylor series to 1st/2nd order. Content pulled from the "Taylor
// Series for the F = ma Exam" handout (the 5-box summary) plus Morin's
// Appendix B, both reviewed 2026-09-03. Every problem is either pure recall
// or a one-line application with "nice" numbers -- nothing here needs more
// than mental arithmetic, per the handout's own "no calculator" framing.
// ═══════════════════════════════════════════════════════════════════════
const TAYLOR_FORMULAS = [
  { key: 'pow', lhs: '(1+x)^n', rhs: '1 + nx' },
  { key: 'exp', lhs: 'e^{x}', rhs: '1 + x' },
  { key: 'expneg', lhs: 'e^{-x}', rhs: '1 - x' },
  { key: 'ln', lhs: '\\ln(1+x)', rhs: 'x' },
  { key: 'sin', lhs: '\\sin x', rhs: 'x' },
  { key: 'cos', lhs: '\\cos x', rhs: '1 - \\tfrac{1}{2}x^2' },
  { key: 'inv', lhs: '\\dfrac{1}{1+x}', rhs: '1 - x' },
  { key: 'sqrt', lhs: '\\sqrt{1+x}', rhs: '1 + \\tfrac{1}{2}x' },
  { key: 'invsqrt', lhs: '\\dfrac{1}{\\sqrt{1+x}}', rhs: '1 - \\tfrac{1}{2}x' },
  { key: 'invsq', lhs: '\\dfrac{1}{(1+x)^2}', rhs: '1 - 2x' },
]

const TAYLOR_COEFF_TEMPLATES = [
  { promptMd: `Fill in the coefficient: $$\\cos x \\approx 1 + a\\,x^2$$`, coeff: -0.5 },
  { promptMd: `Fill in the coefficient: $$\\sqrt{1+x} \\approx 1 + a\\,x$$`, coeff: 0.5 },
  { promptMd: `Fill in the coefficient: $$\\dfrac{1}{\\sqrt{1+x}} \\approx 1 + a\\,x$$`, coeff: -0.5 },
  { promptMd: `Fill in the coefficient: $$\\dfrac{1}{(1+x)^2} \\approx 1 + a\\,x$$`, coeff: -2 },
  { promptMd: `Fill in the coefficient (2nd order): $$e^{x} \\approx 1 + x + a\\,x^2$$`, coeff: 0.5 },
]

// build(rng) -> { promptMd, raw, explanationMd } -- same "skin" pattern as
// SKIN_TEMPLATES above, applying (1+x)^n ≈ 1+nx (or e^x ≈ 1+x) to a small
// mechanics scenario straight out of the handout's "Physics Applications".
const TAYLOR_PHYSICS_TEMPLATES = [
  rng => {
    const frac = randChoice(rng, [0.001, 0.002, 0.004, 0.005, 0.008, 0.01])
    return {
      promptMd: `Near a planet's surface, $$g(h) = g_0(1+h/R)^{-2}$$. If $$h/R = ${frac}$$ (small), by what fraction does $$g$$ decrease? (Answer as a decimal, e.g. 0.01 for 1%.)`,
      raw: 2 * frac,
      explanationMd: `$$(1+x)^{-2} \\approx 1-2x$$ with $$x=h/R$$, so $$g$$ drops by about $$2(h/R) = ${round2(2 * frac * 1000) / 1000}$$ — twice the height fraction, because $$n=-2$$.`,
    }
  },
  rng => {
    const eps = randChoice(rng, [0.02, 0.04, 0.06, 0.08, 0.1, 0.12])
    return {
      promptMd: `A pendulum's period is $$T = 2\\pi\\sqrt{L/g}$$. If the length $$L$$ increases by a fraction $$${eps}$$, by what fraction does $$T$$ increase?`,
      raw: eps / 2,
      explanationMd: `$$T \\propto L^{1/2}$$, so $$(1+\\epsilon)^{1/2}\\approx 1+\\tfrac12\\epsilon$$: the period grows by half the fractional length change, $$\\tfrac12(${eps}) = ${eps / 2}$$.`,
    }
  },
  rng => {
    const n = randChoice(rng, [2, 3, -1, -2])
    const eps = randChoice(rng, [0.01, 0.02, 0.03, 0.04, 0.05])
    return {
      promptMd: `A measured speed $$v$$ has fractional uncertainty $$${eps}$$. If $$Q = v^{${n}}$$, what is the fractional uncertainty in $$Q$$? (Give a positive decimal.)`,
      raw: Math.abs(n) * eps,
      explanationMd: `A power multiplies percentage error by the exponent: $$(1+\\epsilon)^{${n}} \\approx 1 ${fmtTerm(n, '\\epsilon')}$$, so the fractional error in $$Q$$ is $$|${n}|\\times ${eps} = ${round2(Math.abs(n) * eps * 1000) / 1000}$$.`,
    }
  },
  rng => {
    const tOverTau = randChoice(rng, [0.01, 0.02, 0.03, 0.04, 0.05])
    return {
      promptMd: `A radioactive sample decays as $$N(t)=N_0e^{-t/\\tau}$$. If $$t/\\tau = ${tOverTau}$$ (small), about what fraction of the sample has decayed?`,
      raw: tOverTau,
      explanationMd: `$$e^{-x}\\approx 1-x$$ with $$x=t/\\tau$$, so the surviving fraction is $$\\approx 1-${tOverTau}$$ and the decayed fraction is $$\\approx ${tOverTau}$$.`,
    }
  },
  rng => {
    const v2c2 = randChoice(rng, [0.01, 0.02, 0.03, 0.04])
    return {
      promptMd: `Special relativity's $$\\gamma = (1-v^2/c^2)^{-1/2}$$. If $$v^2/c^2 = ${v2c2}$$, estimate $$\\gamma$$.`,
      raw: 1 + v2c2 / 2,
      explanationMd: `With $$x=-v^2/c^2$$ and $$n=-\\tfrac12$$: $$\\gamma \\approx 1-\\tfrac12(-${v2c2}) = 1+${v2c2 / 2}$$.`,
    }
  },
]

const TAYLOR_SECOND_ORDER_TEMPLATES = [
  rng => {
    const omega = randChoice(rng, [2, 4, 6, 8])
    return {
      promptMd: `Expand to second order in $$t$$: $$\\cos(${omega}t) \\approx 1 - a\\,t^2$$. Find $$a$$.`,
      raw: (omega * omega) / 2,
      explanationMd: `$$\\cos u \\approx 1-\\tfrac12 u^2$$ with $$u=${omega}t$$, so $$a = \\tfrac12(${omega})^2 = ${(omega * omega) / 2}$$.`,
    }
  },
  rng => {
    const mgL = randChoice(rng, [2, 4, 6, 8, 10, 12])
    return {
      promptMd: `A pendulum's potential energy is $$U(\\theta)=mgL(1-\\cos\\theta)$$, with $$mgL = ${mgL}$$ J. For small $$\\theta$$, $$U \\approx a\\,\\theta^2$$. Find $$a$$.`,
      raw: mgL / 2,
      explanationMd: `$$1-\\cos\\theta \\approx \\tfrac12\\theta^2$$, so $$U \\approx \\tfrac12(mgL)\\theta^2$$, giving $$a = ${mgL}/2 = ${mgL / 2}$$.`,
    }
  },
  rng => {
    const x = randChoice(rng, [0.1, 0.2, 0.06, 0.04])
    return {
      promptMd: `Estimate $$e^{${x}}$$ keeping terms through $$x^2$$ (i.e. $$1+x+x^2/2$$).`,
      raw: 1 + x + (x * x) / 2,
      explanationMd: `$$e^{${x}} \\approx 1+${x}+\\dfrac{(${x})^2}{2} = ${round2((1 + x + (x * x) / 2) * 10000) / 10000}$$ — closer to the true value than stopping at first order.`,
    }
  },
]

function genTaylorSeries(level, rng) {
  if (level === 0) {
    const correct = randChoice(rng, TAYLOR_FORMULAS)
    const distractors = pickDistinctDistractors(rng, correct, TAYLOR_FORMULAS.filter(f => f !== correct), f => f.rhs, 3)
    const options = shuffle(rng, [correct, ...distractors]).map(f => ({ key: f.key, tex: f.rhs }))
    return {
      promptMd: `For small $$x$$ (angles in radians):\n\n$$${correct.lhs} \\approx\\ ?$$`,
      fields: [{ key: 'ans', type: 'mc', label: '', options }],
      answer: { ans: correct.key }, tolerance: {},
      explanationMd: `$$${correct.lhs} \\approx ${correct.rhs}$$ — one of the handful of Taylor approximations worth memorizing outright.`,
      timeTargetSec: 10,
    }
  }
  if (level === 1) {
    const t = randChoice(rng, TAYLOR_COEFF_TEMPLATES)
    return {
      promptMd: t.promptMd,
      fields: [{ key: 'a', label: 'a', type: 'decimal', placeholder: 'e.g. -0.5' }],
      answer: { a: t.coeff }, tolerance: { a: 0.02 },
      explanationMd: `Match term by term against the memorized expansion — the coefficient here is $$${t.coeff}$$.`,
      timeTargetSec: 15,
    }
  }
  if (level === 2) {
    const mode = randChoice(rng, ['pow', 'sin', 'cos', 'exp', 'ln'])
    if (mode === 'pow') {
      const n = randChoice(rng, [2, 3, 4, 5, -1, -2, -3])
      const x = randChoice(rng, [0.01, 0.02, 0.03, 0.04, -0.01, -0.02, -0.03, -0.04])
      const base = round2(1 + x)
      return {
        promptMd: `Estimate $$(${base})^{${n}}$$ without a calculator (use $$(1+x)^n \\approx 1+nx$$).`,
        fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 1.08' }],
        answer: { v: 1 + n * x }, tolerance: { v: 0.02 },
        explanationMd: `$$x = ${x}$$, $$n = ${n}$$: $$(1+x)^n \\approx 1+nx = 1 ${fmtTerm(n, `(${x})`)} = ${round2((1 + n * x) * 1000) / 1000}$$.`,
        timeTargetSec: 20,
      }
    }
    if (mode === 'sin') {
      const x = randChoice(rng, [0.01, 0.02, 0.03, 0.04, 0.05, 0.1])
      return {
        promptMd: `Estimate $$\\sin(${x})$$ (x in radians).`,
        fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 0.03' }],
        answer: { v: x }, tolerance: { v: 0.02 },
        explanationMd: `$$\\sin x \\approx x$$, so $$\\sin(${x}) \\approx ${x}$$.`,
        timeTargetSec: 12,
      }
    }
    if (mode === 'cos') {
      const x = randChoice(rng, [0.1, 0.2, 0.3, 0.06, 0.04, 0.02])
      const v = 1 - (x * x) / 2
      return {
        promptMd: `Estimate $$\\cos(${x})$$.`,
        fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 0.98' }],
        answer: { v }, tolerance: { v: 0.02 },
        explanationMd: `$$\\cos x \\approx 1-\\tfrac12x^2 = 1 - \\tfrac12(${x})^2 = ${round2(v * 10000) / 10000}$$.`,
        timeTargetSec: 18,
      }
    }
    if (mode === 'exp') {
      const x = randChoice(rng, [0.01, 0.02, 0.03, 0.04, 0.05, -0.01, -0.02, -0.03])
      return {
        promptMd: `Estimate $$e^{${x}}$$.`,
        fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 1.03' }],
        answer: { v: 1 + x }, tolerance: { v: 0.02 },
        explanationMd: `$$e^x \\approx 1+x$$, so $$e^{${x}} \\approx ${round2((1 + x) * 1000) / 1000}$$.`,
        timeTargetSec: 12,
      }
    }
    const x = randChoice(rng, [0.01, 0.02, 0.03, 0.04, 0.05, -0.01, -0.02, -0.03])
    const value = round2(1 + x)
    return {
      promptMd: `Estimate $$\\ln(${value})$$.`,
      fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 0.03' }],
      answer: { v: x }, tolerance: { v: 0.02 },
      explanationMd: `Write ${value} as $$1 + (${x})$$: $$\\ln(1+x) \\approx x$$, so $$\\ln(${value}) \\approx ${x}$$.`,
      timeTargetSec: 15,
    }
  }
  if (level === 3) {
    const t = randChoice(rng, TAYLOR_PHYSICS_TEMPLATES)(rng)
    return {
      promptMd: t.promptMd,
      fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 0.02' }],
      answer: { v: t.raw }, tolerance: { v: 0.02 },
      explanationMd: t.explanationMd,
      timeTargetSec: 30,
    }
  }
  const t = randChoice(rng, TAYLOR_SECOND_ORDER_TEMPLATES)(rng)
  return {
    promptMd: t.promptMd,
    fields: [{ key: 'v', label: 'answer', type: 'decimal', placeholder: 'e.g. 8' }],
    answer: { v: t.raw }, tolerance: { v: 0.02 },
    explanationMd: t.explanationMd,
    timeTargetSec: 35,
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
  {
    slug: 'unit-dimensions', name: 'Unit simplification & dimensional analysis',
    description: 'Simplifying fractions of kg/m/s (including a fraction of two square-rooted fractions), recalling derived units (N, J, Pa, W), and reading a constant\'s units off a formula.',
    category: 'units', maxLevel: 5, generate: genUnitDimensions,
  },
  {
    slug: 'exponent-rules', name: 'Exponent rules',
    description: 'Power-of-a-power, product of powers, and roots of powers (e.g. sqrt(T^-2)), in both bare-variable and physics-flavored form.',
    category: 'exponents', maxLevel: 4, generate: genExponentRules,
  },
  {
    slug: 'physics-symbols', name: 'Physics symbols: meaning, units & dimensions',
    description: 'Given a common F=ma symbol, recall its meaning, pronunciation, SI units, or M/L/T dimensions -- and the reverse (name a quantity, pick its symbol).',
    category: 'symbols', maxLevel: 2, generate: genPhysicsSymbols,
  },
  {
    slug: 'taylor-series', name: 'Taylor series (1st & 2nd order)',
    description: 'Recall and apply the standard small-x approximations (sin, cos, e^x, (1+x)^n, ...), including simple mechanics applications.',
    category: 'taylor series', maxLevel: 4, generate: genTaylorSeries,
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
    const target = problem.answer[f.key]
    let ok
    if (f.type === 'mc' || f.type === 'text') {
      // Multiple-choice (target is the chosen option's key) and short exact-
      // text answers (e.g. a unit symbol like "Pa") are string matches, not
      // numeric ones -- skip the tolerance/rounding logic entirely.
      ok = typeof raw === 'string' && raw.trim() === target
      perField[f.key] = ok
      if (!ok) allCorrect = false
      continue
    }
    const val = typeof raw === 'string' ? evalMathExpr(raw.replace(/,/g, '')) : raw
    const tol = problem.tolerance[f.key] || 0
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
