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
// A problem is: { skill, level, seed, promptMd, fields, answer, tolerance,
// explanationMd, timeTargetSec }. promptMd/explanationMd use the same
// "$$...$$ is KaTeX, blank line separates paragraphs" convention as
// utils/renderStatement.js. `fields` is 1-2 answer inputs; `answer`/
// `tolerance` are keyed the same way -- tolerance 0 means exact (rounded)
// integer match, otherwise it's a relative fraction (checked against a small
// absolute floor so an answer near zero isn't impossible to hit).

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
function randSign(rng) { return rng() < 0.5 ? -1 : 1 }

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

const VARS = ['x', 'a', 'v', 'q', 'r']

// ── Shared field/answer helpers ─────────────────────────────────────────

function sciFields(withCoefficient) {
  return withCoefficient
    ? [
        { key: 'c', label: 'coefficient (1 ≤ c < 10)', type: 'decimal', placeholder: 'e.g. 3.2' },
        { key: 'e', label: 'power of 10', type: 'int', placeholder: 'e.g. -6' },
      ]
    : [{ key: 'e', label: 'power of 10', type: 'int', placeholder: 'e.g. 4' }]
}

function sciAnswer(raw, withCoefficient) {
  const { c, e } = normalizeSci(raw)
  return withCoefficient
    ? { answer: { c, e }, tolerance: { c: 0.03, e: 0 } }
    : { answer: { e }, tolerance: { e: 0 } }
}

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
    ? { key: 'exp', label: 'resulting exponent', type: 'int', placeholder: 'e.g. -3' }
    : { key: 'exp', label: 'resulting exponent (decimal)', type: 'decimal', placeholder: 'e.g. 1.5' }

  return {
    promptMd: `Simplify to a single power of ${V}. What is the exponent?\n\n$$${promptExpr} = ${V}^{?}$$`,
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
function fmtSigned(n) { return n >= 0 ? `${n}` : `(${n})` }

// ═══════════════════════════════════════════════════════════════════════
// Skill 2 — scientific-notation arithmetic (the fraction-of-powers-of-ten drill)
// ═══════════════════════════════════════════════════════════════════════
const SKIN_TEMPLATES = [
  {
    build: rng => {
      const F = randDec(rng, 1, 9.9, 1), Fe = randInt(rng, 0, 4)
      const A = randDec(rng, 1, 9.9, 1), Ae = randInt(rng, -8, -2)
      return {
        promptMd: `A wire carries tension $$F = ${sciTex(F, Fe)}\\text{ N}$$ and has cross-sectional area $$A = ${sciTex(A, Ae)}\\text{ m}^2$$.\n\nFind the stress $$\\sigma = F/A$$, in pascals.`,
        raw: (F * 10 ** Fe) / (A * 10 ** Ae),
        rule: 'stress = force / area — divide the coefficients, subtract the exponents',
      }
    },
  },
  {
    build: rng => {
      const m = randDec(rng, 1, 9.9, 1), me = randInt(rng, -3, 2)
      const v = randDec(rng, 1, 9.9, 1), ve = randInt(rng, 1, 5)
      return {
        promptMd: `A particle of mass $$m = ${sciTex(m, me)}\\text{ kg}$$ moves at $$v = ${sciTex(v, ve)}\\text{ m/s}$$.\n\nFind its kinetic energy $$KE = \\tfrac12 mv^2$$, in joules.`,
        raw: 0.5 * (m * 10 ** me) * (v * 10 ** ve) ** 2,
        rule: 'square the coefficient and double its exponent for v², then multiply by ½m',
      }
    },
  },
  {
    build: rng => {
      const q1 = randDec(rng, 1, 9.9, 1), q1e = randInt(rng, -9, -6)
      const q2 = randDec(rng, 1, 9.9, 1), q2e = randInt(rng, -9, -6)
      const r = randDec(rng, 1, 9.9, 1), re = randInt(rng, -2, 0)
      const k = 8.99, ke = 9
      return {
        promptMd: `Two charges $$q_1 = ${sciTex(q1, q1e)}\\text{ C}$$ and $$q_2 = ${sciTex(q2, q2e)}\\text{ C}$$ are separated by $$r = ${sciTex(r, re)}\\text{ m}$$.\n\nUsing $$F = k\\dfrac{q_1 q_2}{r^2}$$ with $$k = ${sciTex(k, ke)}$$, find F in newtons.`,
        raw: (k * 10 ** ke * (q1 * 10 ** q1e) * (q2 * 10 ** q2e)) / (r * 10 ** re) ** 2,
        rule: 'multiply the coefficients in the numerator, then divide by r² — square r\'s coefficient and double its exponent first',
      }
    },
  },
  {
    build: rng => {
      const P = randDec(rng, 1, 9.9, 1), Pe = randInt(rng, 1, 5)
      const I = randDec(rng, 1, 9.9, 1), Ie = randInt(rng, -3, 1)
      return {
        promptMd: `A device dissipates power $$P = ${sciTex(P, Pe)}\\text{ W}$$ while drawing current $$I = ${sciTex(I, Ie)}\\text{ A}$$.\n\nFind the voltage $$V = P/I$$, in volts.`,
        raw: (P * 10 ** Pe) / (I * 10 ** Ie),
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
      promptMd: `$$\\dfrac{10^{${a}}}{10^{${b}}} = 10^{?}$$`,
      ...withField(sciFields(false), sciAnswer(raw, false)),
      explanationMd: `Dividing powers of ten subtracts exponents: $$${fmtSigned(a)} - (${fmtSigned(b)}) = ${a - b}$$`,
      timeTargetSec: 15,
    }
  }
  if (level === 1) {
    const c1 = randDec(rng, 1, 9.9, 1), a = randInt(rng, -8, 8)
    const c2 = randDec(rng, 1, 9.9, 1), b = randInt(rng, -8, 8)
    const raw = (c1 * 10 ** a) / (c2 * 10 ** b)
    return {
      promptMd: `$$\\dfrac{${sciTex(c1, a)}}{${sciTex(c2, b)}} = \\ ?$$\n\nGive the answer in proper scientific notation.`,
      ...withField(sciFields(true), sciAnswer(raw, true)),
      explanationMd: `Divide the coefficients ($$${c1}/${c2} \\approx ${(c1 / c2).toFixed(3)}$$) and subtract the exponents ($$${fmtSigned(a)} - (${fmtSigned(b)}) = ${a - b}$$), then renormalize so the coefficient is between 1 and 10.`,
      timeTargetSec: 25,
    }
  }
  if (level === 2) {
    const c1 = randDec(rng, 1, 9.9, 1), a1 = randInt(rng, -6, 6)
    const c2 = randDec(rng, 1, 9.9, 1), a2 = randInt(rng, -6, 6)
    const c3 = randDec(rng, 1, 9.9, 1), a3 = randInt(rng, -6, 6)
    const raw = (c1 * 10 ** a1 * c2 * 10 ** a2) / (c3 * 10 ** a3)
    return {
      promptMd: `$$\\dfrac{(${sciTex(c1, a1)})(${sciTex(c2, a2)})}{${sciTex(c3, a3)}} = \\ ?$$`,
      ...withField(sciFields(true), sciAnswer(raw, true)),
      explanationMd: `Multiply the numerator's coefficients and add its exponents first, then divide by the denominator the same way you would in level 1 — combine all the exponent bookkeeping before renormalizing.`,
      timeTargetSec: 30,
    }
  }
  if (level === 3) {
    const c1 = randDec(rng, 1, 9.9, 1), a1 = randInt(rng, -6, 6)
    const c2 = randDec(rng, 1, 9.9, 1), a2 = randInt(rng, -6, 6)
    const squareIt = rng() < 0.5
    const raw = squareIt ? (c1 * 10 ** a1) ** 2 / (c2 * 10 ** a2) : Math.sqrt(c1 * 10 ** a1) / (c2 * 10 ** a2)
    const expr = squareIt
      ? `\\dfrac{(${sciTex(c1, a1)})^2}{${sciTex(c2, a2)}}`
      : `\\dfrac{\\sqrt{${sciTex(c1, a1)}}}{${sciTex(c2, a2)}}`
    return {
      promptMd: `$$${expr} = \\ ?$$`,
      ...withField(sciFields(true), sciAnswer(raw, true)),
      explanationMd: squareIt
        ? `Squaring $$c \\times 10^{n}$$ squares the coefficient and *doubles* the exponent — a common slip is adding instead of doubling.`
        : `Taking a square root halves the exponent — if the exponent is odd, pull one power of ten out first so the remaining exponent is even.`,
      timeTargetSec: 30,
    }
  }
  const skin = randChoice(rng, SKIN_TEMPLATES).build(rng)
  return {
    promptMd: skin.promptMd + `\n\nGive the answer in proper scientific notation.`,
    ...withField(sciFields(true), sciAnswer(skin.raw, true)),
    explanationMd: skin.rule,
    timeTargetSec: 35,
  }
}

function withField(fields, ans) { return { fields, answer: ans.answer, tolerance: ans.tolerance } }

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
  const unitPow = power === 1 ? unit : `${unit}^${power}`
  const fromLabel = `${fromP}${unitPow}`
  const toLabel = `${toP}${unitPow}`

  return {
    promptMd: `Convert $$${value}\\ \\text{${fromLabel}}$$ to $$\\text{${toLabel}}$$.` +
      (power > 1 ? `\n\n(Remember: the conversion factor gets raised to the power on the unit too.)` : ''),
    ...withField(sciFields(true), sciAnswer(raw, true)),
    explanationMd: power === 1
      ? `1 ${fromP}${unit} = ${PREFIXES[fromP] / PREFIXES[toP]} ${toP}${unit}, so multiply straight through.`
      : `Because the unit is raised to the ${power}${power === 2 ? 'nd' : 'rd'} power, the linear conversion factor (${PREFIXES[fromP] / PREFIXES[toP]}) must also be raised to the ${power}${power === 2 ? 'nd' : 'rd'} power — this is exactly the step that turns "1 mm² = 10⁻³ m²" (wrong) into "1 mm² = 10⁻⁶ m²" (right).`,
    timeTargetSec: Math.max(12, 26 - level * 2),
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 4 — signed vector components
// ═══════════════════════════════════════════════════════════════════════
function genVectorComponents(level, rng) {
  const M = randDec(rng, 2, 40, 1)
  let theta, promptMd

  if (level === 0) theta = randInt(rng, 5, 85)
  else if (level === 1) theta = randInt(rng, 95, 175)
  else if (level === 2) theta = randInt(rng, 185, 265)
  else if (level === 3) theta = randInt(rng, 275, 355)

  if (level <= 3) {
    promptMd = `A vector has magnitude $$${M}$$ at $$${theta}°$$ (measured counterclockwise from the +x axis).\n\nFind its x- and y-components.`
  } else if (level === 4) {
    const phrasings = [
      { desc: t => `${t}° below the +x-axis`, toStd: t => 360 - t },
      { desc: t => `${t}° west of north`, toStd: t => 90 + t },
      { desc: t => `${t}° above the −x-axis`, toStd: t => 180 - t },
      { desc: t => `${t}° south of west`, toStd: t => 180 + t },
    ]
    const p = randChoice(rng, phrasings)
    const t = randInt(rng, 10, 80)
    theta = p.toStd(t)
    promptMd = `A vector has magnitude $$${M}$$, directed $$${p.desc(t)}$$.\n\nFind its x- and y-components (standard axes: +x right, +y up).`
  } else {
    const Ax = randDec(rng, -20, 20, 1), Ay = randDec(rng, -20, 20, 1)
    const MB = randDec(rng, 2, 30, 1), thB = randInt(rng, 0, 359)
    const rad = thB * Math.PI / 180
    const Bx = MB * Math.cos(rad), By = MB * Math.sin(rad)
    return {
      promptMd: `Vector A has components $$(${Ax}, ${Ay})$$. Vector B has magnitude $$${MB}$$ at $$${thB}°$$ from the +x axis.\n\nFind the components of the resultant $$\\vec A + \\vec B$$.`,
      fields: [
        { key: 'x', label: 'x-component', type: 'decimal', placeholder: 'e.g. -3.2' },
        { key: 'y', label: 'y-component', type: 'decimal', placeholder: 'e.g. 7.1' },
      ],
      answer: { x: Ax + Bx, y: Ay + By },
      tolerance: { x: 0.02, y: 0.02 },
      explanationMd: `Add components separately: $$A_x + B_x$$ and $$A_y + B_y$$, where $$B_x = M_B\\cos\\theta_B$$ and $$B_y = M_B\\sin\\theta_B$$.`,
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
    explanationMd: `$$V_x = M\\cos\\theta = ${M}\\cos(${theta}°) \\approx ${Vx.toFixed(2)}$$, $$V_y = M\\sin\\theta = ${M}\\sin(${theta}°) \\approx ${Vy.toFixed(2)}$$.\n\nThe quadrant of θ decides the signs — that's the part worth checking before you trust the calculator.`,
    timeTargetSec: Math.max(15, 30 - level * 2),
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Skill 5 — isolate a variable, then evaluate
// (target is picked first and the givens are back-computed from it, so the
// answer is exact by construction)
// ═══════════════════════════════════════════════════════════════════════
function genIsolateVariable(level, rng) {
  if (level === 0) {
    const t = randDec(rng, 0.5, 12, 1)
    const v0 = randDec(rng, -10, 10, 1), a = randDec(rng, 1, 8, 1)
    const v = v0 + a * t
    return {
      promptMd: `An object's velocity follows $$v = v_0 + at$$ with $$v_0 = ${v0}\\text{ m/s}$$, $$a = ${a}\\text{ m/s}^2$$, and $$v = ${round2(v)}\\text{ m/s}$$.\n\nSolve for $$t$$ (in seconds).`,
      fields: [{ key: 't', label: 't (s)', type: 'decimal', placeholder: 'e.g. 3.5' }],
      answer: { t }, tolerance: { t: 0.02 },
      explanationMd: `Isolate t by subtracting $$v_0$$ from both sides, then dividing by a: $$t = \\dfrac{v - v_0}{a}$$.`,
      timeTargetSec: 20,
    }
  }
  if (level === 1) {
    const v = randDec(rng, 1, 15, 1)
    const m = randDec(rng, 0.5, 10, 1)
    const KE = 0.5 * m * v * v
    return {
      promptMd: `Kinetic energy is $$KE = \\tfrac12 mv^2$$, with $$m = ${m}\\text{ kg}$$ and $$KE = ${round2(KE)}\\text{ J}$$.\n\nSolve for the (positive) speed $$v$$ (in m/s).`,
      fields: [{ key: 'v', label: 'v (m/s)', type: 'decimal', placeholder: 'e.g. 4.2' }],
      answer: { v }, tolerance: { v: 0.02 },
      explanationMd: `Multiply both sides by $$2/m$$ to isolate $$v^2$$, then take the square root: $$v = \\sqrt{2KE/m}$$. Physically only the positive root makes sense here.`,
      timeTargetSec: 25,
    }
  }
  if (level === 2) {
    const T = randDec(rng, 0.5, 4, 2)
    const g = 9.8
    const L = randDec(rng, 0.2, 3, 2)
    const Tcalc = 2 * Math.PI * Math.sqrt(L / g)
    return {
      promptMd: `A pendulum's period is $$T = 2\\pi\\sqrt{L/g}$$, with $$g = 9.8\\text{ m/s}^2$$ and $$T = ${round2(Tcalc)}\\text{ s}$$.\n\nSolve for the length $$L$$ (in meters).`,
      fields: [{ key: 'L', label: 'L (m)', type: 'decimal', placeholder: 'e.g. 1.2' }],
      answer: { L }, tolerance: { L: 0.02 },
      explanationMd: `Divide by $$2\\pi$$, square both sides to clear the square root, then multiply by g: $$L = g\\left(\\dfrac{T}{2\\pi}\\right)^2$$.`,
      timeTargetSec: 30,
    }
  }
  const p = randDec(rng, 1, 20, 1)
  const m = randDec(rng, 0.2, 8, 1)
  const KE = (p * p) / (2 * m)
  return {
    promptMd: `Momentum and kinetic energy are related by $$KE = \\dfrac{p^2}{2m}$$, with $$m = ${m}\\text{ kg}$$ and $$KE = ${round2(KE)}\\text{ J}$$.\n\nSolve for the (positive) momentum $$p$$ (in kg·m/s).`,
    fields: [{ key: 'p', label: 'p (kg·m/s)', type: 'decimal', placeholder: 'e.g. 6.3' }],
    answer: { p }, tolerance: { p: 0.02 },
    explanationMd: `Multiply both sides by $$2m$$ to isolate $$p^2$$, then take the square root: $$p = \\sqrt{2m \\cdot KE}$$.`,
    timeTargetSec: 30,
  }
}
function round2(x) { return Math.round(x * 100) / 100 }

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
      const floor = f.key === 'e' ? 0.01 : Math.max(0.05, Math.abs(target) * 0.005)
      ok = Math.abs(val - target) <= Math.max(tol * Math.abs(target), floor)
    }
    perField[f.key] = ok
    if (!ok) allCorrect = false
  }
  return { correct: allCorrect, perField }
}
