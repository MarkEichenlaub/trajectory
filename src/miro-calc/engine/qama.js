// QAMA-style adaptive tolerance, modeled on patent US 6820800B2 (Ilan Samson).
// Walks the expression AST and computes an accepted interval for an estimate.
// All coefficients live in QAMA_PARAMS so they can be tuned against real students.
import { math, getAngleMode } from './math-setup.js'

export const QAMA_PARAMS = {
  // addition / subtraction (digit-position rule)
  addPerDigit: 1.0, // × place value, for each digit position nonzero in BOTH operands
  addLeading: 0.3, // × place value of the result's leading digit
  addCapFraction: 0.5, // cap: fraction of the smaller |operand|
  subCancelFraction: 0.3, // extra cap on subtraction results (cancellation)
  addTrivialMax: 12, // a+b with both integers ≤ this → exact
  // multiplication / division
  mulBase: 0.09, // base relative tolerance
  mulPerExtraDigit: 0.01, // per nonzero 2nd/3rd significant digit of each operand
  timesTableMax: 12, // a×b with both integers ≤ this → exact
  powerOfTenSlack: 0.02, // "is a power of ten, or very close"
  // functions
  sqrtRel: 0.18,
  trigRelMin: 0.05,
  trigRelMax: 0.2,
  invTrigAbsMinDeg: 5,
  invTrigAbsMaxDeg: 15,
  log10Below: 0.1,
  log10Above: 0.25,
  lnRel: 0.08,
  lnAbs: 0.1,
  powNonIntLo: 0.7, // accepted interval [lo·v, hi·v] for non-integer exponents
  powNonIntHi: 1.35,
  expRelPerUnitX: 0.1,
  genericFnRel: 0.05,
  // session
  oomCollapseRatio: 100, // hi/lo beyond this → "order of magnitude" problem
  maxAttempts: 5,
  revealRoundPct: 0.05, // tolerance above this → reveal rounded to 3 sig figs
}

const P = QAMA_PARAMS

// ---- numeric helpers -------------------------------------------------------

export function siMagnitude(v) {
  if (math.isUnit(v)) {
    // Units store their value normalized to SI base; a valueless unit (a bare
    // symbol like "kg" mid-expression) normalizes to its SI scale factor.
    if (v.value === null || v.value === undefined) return math.multiply(1, v).value
    return v.value
  }
  if (typeof v === 'number') return v
  return NaN
}

const isIntegerish = (x) => Number.isFinite(x) && Math.abs(x - Math.round(x)) < 1e-9

function isPowerOfTenish(x) {
  const a = Math.abs(x)
  if (!Number.isFinite(a) || a === 0) return false
  const nearest = Math.pow(10, Math.round(Math.log10(a)))
  return Math.abs(a / nearest - 1) <= P.powerOfTenSlack
}

function nonzeroDigitPositions(x) {
  const set = new Set()
  if (!Number.isFinite(x) || x === 0) return set
  const [mant, expStr] = Math.abs(x).toExponential(11).split('e')
  const exp = parseInt(expStr, 10)
  const digits = mant.replace('.', '').replace(/0+$/, '')
  for (let i = 0; i < digits.length; i++) {
    if (digits[i] !== '0') set.add(exp - i)
  }
  return set
}

// count of nonzero 2nd and 3rd significant digits (0..2)
function extraDigits(x) {
  if (!Number.isFinite(x) || x === 0) return 0
  const digits = Math.abs(x).toExponential(11).split('e')[0].replace('.', '').replace(/0+$/, '')
  let count = 0
  if (digits.length > 1 && digits[1] !== '0') count++
  if (digits.length > 2 && digits[2] !== '0') count++
  return count
}

const RSS = (...xs) => Math.sqrt(xs.reduce((s, x) => s + x * x, 0))

// ---- NodeTol: per-subtree tolerance ---------------------------------------
// { value, abs, rel, lo, hi, exact }

function exactTol(v) {
  return { value: v, abs: 0, rel: 0, lo: v, hi: v, exact: true }
}

function tolFrom(v, abs, rel) {
  const t = abs + rel * Math.abs(v)
  return { value: v, abs, rel, lo: v - t, hi: v + t, exact: t === 0 }
}

function intervalTol(v, lo, hi) {
  if (lo > hi) [lo, hi] = [hi, lo]
  return { value: v, abs: Math.max(v - lo, hi - v, 0), rel: 0, lo, hi, exact: lo === hi }
}

const absEff = (t) => t.abs + t.rel * Math.abs(t.value)
const relEff = (t) => (t.value === 0 ? t.rel : t.rel + t.abs / Math.abs(t.value))

function negate(t) {
  return { value: -t.value, abs: t.abs, rel: t.rel, lo: -t.hi, hi: -t.lo, exact: t.exact }
}

// ---- per-operation rules ---------------------------------------------------

function addSubAbs(a, b, v) {
  const A = Math.abs(a)
  const B = Math.abs(b)
  if (A === 0 || B === 0) return 0
  let tol = 0
  const posA = nonzeroDigitPositions(a)
  for (const p of nonzeroDigitPositions(b)) {
    if (posA.has(p)) tol += P.addPerDigit * Math.pow(10, p)
  }
  if (v !== 0 && Number.isFinite(v)) {
    tol += P.addLeading * Math.pow(10, Math.floor(Math.log10(Math.abs(v))))
  }
  return Math.min(tol, P.addCapFraction * Math.min(A, B))
}

function trivialMulDiv(a, b) {
  if (a === 0 || b === 0) return true
  if (isPowerOfTenish(a) || isPowerOfTenish(b)) return true
  return (
    isIntegerish(a) && isIntegerish(b) && Math.abs(a) <= P.timesTableMax && Math.abs(b) <= P.timesTableMax
  )
}

function trigTol(name, value, argTol) {
  // exact when the value is a "known" special value (0, ±1/2, ±1 for sin/cos; 0, ±1 for tan)
  const specials = name === 'tan' ? [0, 1] : [0, 0.5, 1]
  if (specials.some((s) => Math.abs(Math.abs(value) - s) < 1e-9)) return exactTol(value)
  // difficulty grows with distance (in degrees) from the nearest multiple of 45°
  const argDeg = argTol.argDeg
  let rel = P.trigRelMax
  if (Number.isFinite(argDeg)) {
    const d = Math.abs(((argDeg % 45) + 45) % 45)
    const dist = Math.min(d, 45 - d) // 0..22.5
    rel = P.trigRelMin + (P.trigRelMax - P.trigRelMin) * (dist / 22.5)
  }
  if (!argTol.exact) rel = RSS(rel, P.trigRelMax)
  return tolFrom(value, 0, rel)
}

function factorialTol(n, v) {
  if (!isIntegerish(n) || n < 0) return tolFrom(v, 0, P.mulBase)
  if (n <= 6) return exactTol(v)
  if (n <= 8) return tolFrom(v, 0, 0.2)
  if (n <= 12) return intervalTol(v, v / 10, v * 10)
  return intervalTol(v, v / 100, v * 100)
}

// ---- the AST walk ----------------------------------------------------------

function evalNode(node, scope) {
  return node.compile().evaluate(Object.assign({}, scope))
}

function argInDegrees(argValue) {
  if (math.isUnit(argValue)) {
    try {
      return argValue.toNumber('deg')
    } catch {
      return NaN
    }
  }
  if (typeof argValue === 'number') {
    return getAngleMode() === 'deg' ? argValue : (argValue * 180) / Math.PI
  }
  return NaN
}

function walk(node, scope) {
  if (node.isParenthesisNode) return walk(node.content, scope)
  if (node.isAssignmentNode) return walk(node.value, scope)
  if (node.isConstantNode) return exactTol(siMagnitude(node.value))

  if (node.isSymbolNode || node.isAccessorNode) {
    return exactTol(siMagnitude(evalNode(node, scope)))
  }

  if (node.isOperatorNode) {
    const v = siMagnitude(evalNode(node, scope))

    if (node.fn === 'unaryMinus') return negate(walk(node.args[0], scope))
    if (node.fn === 'unaryPlus') return walk(node.args[0], scope)

    if (node.fn === 'factorial') {
      const A = walk(node.args[0], scope)
      return factorialTol(A.value, v)
    }

    if (node.args.length !== 2) return tolFrom(v, 0, P.mulBase)
    const A = walk(node.args[0], scope)
    const B = walk(node.args[1], scope)

    switch (node.op) {
      case '+':
      case '-': {
        const opAbs = addSubAbs(A.value, B.value, v)
        let abs = RSS(absEff(A), absEff(B), opAbs)
        if (node.op === '-') abs = Math.min(abs, P.subCancelFraction * Math.abs(v) + absEff(A) + absEff(B))
        const trivial =
          A.exact &&
          B.exact &&
          isIntegerish(A.value) &&
          isIntegerish(B.value) &&
          Math.abs(A.value) <= P.addTrivialMax &&
          Math.abs(B.value) <= P.addTrivialMax
        return trivial ? exactTol(v) : tolFrom(v, abs, 0)
      }
      case '*':
      case '/': {
        if (A.exact && B.exact && trivialMulDiv(A.value, B.value)) return exactTol(v)
        const opRel = P.mulBase + P.mulPerExtraDigit * (extraDigits(A.value) + extraDigits(B.value))
        const rel = RSS(relEff(A), relEff(B), opRel)
        return tolFrom(v, 0, rel)
      }
      case '^': {
        const y = B.value
        if (isIntegerish(y)) {
          if (A.exact && isPowerOfTenish(A.value)) return exactTol(v)
          if (A.exact && isIntegerish(A.value) && Math.abs(A.value) <= P.timesTableMax && Math.abs(y) <= 2) {
            return exactTol(v)
          }
          const rel = RSS(relEff(A) * Math.abs(y), P.mulBase * Math.abs(y))
          return tolFrom(v, 0, rel)
        }
        const lo = v >= 0 ? v * P.powNonIntLo : v * P.powNonIntHi
        const hi = v >= 0 ? v * P.powNonIntHi : v * P.powNonIntLo
        return intervalTol(v, lo, hi)
      }
      default:
        return tolFrom(v, 0, P.mulBase)
    }
  }

  if (node.isFunctionNode) {
    const name = node.fn && node.fn.name
    const v = siMagnitude(evalNode(node, scope))
    const argValues = node.args.map((a) => evalNode(a, scope))
    const A = node.args.length ? walk(node.args[0], scope) : exactTol(0)

    switch (name) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sec':
      case 'csc':
      case 'cot': {
        A.argDeg = argInDegrees(argValues[0])
        return trigTol(name === 'sec' || name === 'csc' || name === 'cot' ? 'tan' : name, v, A)
      }
      case 'asin':
      case 'acos':
      case 'atan':
      case 'atan2': {
        const argMag = Math.min(Math.abs(siMagnitude(argValues[0])) || 0, 1)
        const absDeg = P.invTrigAbsMinDeg + (P.invTrigAbsMaxDeg - P.invTrigAbsMinDeg) * argMag
        // result SI magnitude is radians whether or not it displays in degrees
        return tolFrom(v, (absDeg * Math.PI) / 180, 0)
      }
      case 'log10': {
        if (isIntegerish(v)) return exactTol(v)
        let lo = v - P.log10Below
        let hi = v + P.log10Above
        lo = Math.max(lo, Math.floor(v))
        hi = Math.min(hi, Math.ceil(v))
        return intervalTol(v, lo, hi)
      }
      case 'log':
      case 'ln':
        return tolFrom(v, P.lnAbs, RSS(P.lnRel, relEff(A) * 0.5))
      case 'sqrt': {
        if (A.exact && isIntegerish(A.value) && A.value >= 0 && A.value <= 144 && isIntegerish(Math.sqrt(A.value))) {
          return exactTol(v)
        }
        return tolFrom(v, 0, RSS(relEff(A) * 0.5, P.sqrtRel))
      }
      case 'cbrt':
        return tolFrom(v, 0, RSS(relEff(A) / 3, P.sqrtRel))
      case 'exp': {
        const x = siMagnitude(argValues[0])
        const rel = RSS(P.expRelPerUnitX * Math.abs(x), absEff(A))
        return tolFrom(v, 0, Math.max(rel, P.mulBase))
      }
      case 'abs':
      case 'round':
      case 'floor':
      case 'ceil':
        return A.exact ? exactTol(v) : tolFrom(v, 0, RSS(relEff(A), P.genericFnRel))
      default:
        return A.exact ? tolFrom(v, 0, P.mulBase) : tolFrom(v, 0, RSS(relEff(A), P.mulBase))
    }
  }

  // unknown node type — fall back to multiplication-grade tolerance
  return tolFrom(siMagnitude(evalNode(node, scope)), 0, P.mulBase)
}

// ---- public API -------------------------------------------------------------
// requiredTolerance(ast, scope) -> ToleranceSpec
//   { kind: 'exact'|'range'|'orderOfMagnitude', value, valueSI, lo, hi, pct }
export function requiredTolerance(ast, scope) {
  const exactValue = evalNode(ast, scope)
  const vSI = siMagnitude(exactValue)

  let t
  try {
    t = walk(ast, scope)
  } catch {
    t = tolFrom(vSI, 0, P.mulBase)
  }
  // sanity: the walk should land on the same value; if not, fall back
  if (!Number.isFinite(t.value) || (Number.isFinite(vSI) && vSI !== 0 && Math.abs(t.value / vSI - 1) > 1e-6)) {
    t = tolFrom(vSI, 0, P.mulBase)
  }

  let { lo, hi } = t
  if (lo > hi) [lo, hi] = [hi, lo]

  let kind = 'range'
  if (t.exact) kind = 'exact'
  else if (lo > 0 && hi / lo >= P.oomCollapseRatio) kind = 'orderOfMagnitude'
  else if (hi < 0 && lo / hi >= P.oomCollapseRatio) kind = 'orderOfMagnitude'

  const pct = vSI !== 0 && kind !== 'exact' ? (hi - lo) / (2 * Math.abs(vSI)) : 0

  return { kind, value: exactValue, valueSI: vSI, lo, hi, pct }
}
