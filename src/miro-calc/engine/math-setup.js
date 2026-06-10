// Configured mathjs instance for the Miro calculator engine.
// This is the ONLY file that imports mathjs directly.
import { create, all } from 'mathjs'

export const math = create(all, { number: 'number' })

// Captured before hardening below disables them for user expressions.
export const parse = math.parse.bind(math)

// ---------------------------------------------------------------------------
// Custom units (physics units mathjs lacks)
// ---------------------------------------------------------------------------
function ensureUnit(name, definition, options = {}) {
  try {
    if (math.Unit.isValuelessUnit(name)) return
  } catch {
    /* isValuelessUnit shouldn't throw, but don't let it kill startup */
  }
  try {
    math.createUnit(name, { definition, ...options })
  } catch (err) {
    console.warn(`miro-calc: could not define unit ${name}: ${err.message}`)
  }
}

// Names of the units we add, plus aliases. Exported so the formatter can keep
// auto-simplification from "helpfully" presenting results in mph or AU.
export const CUSTOM_UNIT_NAMES = new Set([
  'mph',
  'knot',
  'knots',
  'amu',
  'Da',
  'u',
  'AU',
  'au',
  'ly',
  'lightyear',
  'pc',
  'parsec',
  'gauss',
  'Gs',
])

ensureUnit('mph', '1 mi/h')
ensureUnit('knot', '0.514444 m/s', { aliases: ['knots'] })
ensureUnit('amu', '1.66053906892e-27 kg', { aliases: ['Da'] })
ensureUnit('u', '1 amu')
ensureUnit('AU', '149597870700 m', { aliases: ['au'] })
ensureUnit('ly', '9460730472580800 m', { aliases: ['lightyear'] })
ensureUnit('pc', '3.0856775814913673e16 m', { aliases: ['parsec'] })
ensureUnit('gauss', '1e-4 T', { aliases: ['Gs'] })

// ---------------------------------------------------------------------------
// Angle mode (deg default — high-school physics convention)
// sin(30) = 0.5 in deg mode; sin(30 deg) works in either mode;
// inverse trig returns a value in deg (as a Unit) in deg mode.
// ---------------------------------------------------------------------------
let angleMode = 'deg'

export function setAngleMode(mode) {
  if (mode === 'deg' || mode === 'rad') angleMode = mode
  else throw new Error(`Unknown angle mode: ${mode}`)
}

export function getAngleMode() {
  return angleMode
}

const RAD_PER_DEG = Math.PI / 180
const ANGLE_BASE = math.unit(1, 'rad')

const rawTrig = {}
for (const n of ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'asin', 'acos', 'atan', 'atan2']) {
  rawTrig[n] = math[n]
}

function toRadians(x) {
  if (math.isUnit(x)) {
    if (!x.equalBase(ANGLE_BASE)) {
      throw new Error('Trig functions take an angle (a plain number or e.g. "30 deg")')
    }
    return x.toNumber('rad')
  }
  if (typeof x === 'number' && angleMode === 'deg') return x * RAD_PER_DEG
  return x
}

function fromRadians(r) {
  if (typeof r === 'number' && angleMode === 'deg') return math.unit(r / RAD_PER_DEG, 'deg')
  return r
}

const trigOverrides = {}
for (const name of ['sin', 'cos', 'tan', 'sec', 'csc', 'cot']) {
  trigOverrides[name] = (x) => rawTrig[name](toRadians(x))
}
for (const name of ['asin', 'acos', 'atan']) {
  trigOverrides[name] = (x) => fromRadians(rawTrig[name](x))
}
trigOverrides.atan2 = (y, x) => fromRadians(rawTrig.atan2(y, x))

math.import(trigOverrides, { override: true })
math.import({ ln: (x) => math.log(x) }, { override: true })

// ---------------------------------------------------------------------------
// Hardening: input comes from a shared whiteboard, so anything that mutates
// the math instance or re-enters the parser is disabled inside expressions.
// ---------------------------------------------------------------------------
const disabled = (name) => () => {
  throw new Error(`"${name}" is not available in this calculator`)
}

math.import(
  {
    import: disabled('import'),
    createUnit: disabled('createUnit'),
    evaluate: disabled('evaluate'),
    parse: disabled('parse'),
    simplify: disabled('simplify'),
    derivative: disabled('derivative'),
    resolve: disabled('resolve'),
  },
  { override: true }
)
