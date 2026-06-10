// Display formatting: significant figures, scientific notation thresholds,
// preferred-unit simplification, friendly dimension names.
import { math, CUSTOM_UNIT_NAMES } from './math-setup.js'

export const FORMAT_OPTS = { notation: 'auto', precision: 5, lowerExp: -4, upperExp: 6 }

// Dimensions that should display as a conventional unit when the user didn't
// ask for a specific one with "in <unit>". Without this, mathjs's
// auto-simplification can pick any same-dimension unit — including our custom
// ones (9.9 m/s would come back as 22.1 mph).
const PREFERRED_UNITS = [
  'N',
  'J',
  'W',
  'Pa',
  'C',
  'V',
  'ohm',
  'Hz',
  'T',
  'Wb',
  'F',
  'H',
  'm/s',
  'm/s^2',
  'kg m/s',
  'm',
  'm^2',
  'm^3',
  'kg',
  's',
  'K',
  'A',
  'mol',
]

// Rescue only results whose unit came out of arithmetic as a compound, or as
// one of our custom units — a clean single built-in unit (e.g. "6 km") stays.
function needsRescue(v) {
  const list = v.units || []
  if (list.length > 1) return true
  return list.some((u) => u.unit && CUSTOM_UNIT_NAMES.has(u.unit.name))
}

let preferredCache = null
function preferredUnitList() {
  if (!preferredCache) {
    preferredCache = PREFERRED_UNITS.map((name) => ({ name, ref: math.unit(1, name) }))
  }
  return preferredCache
}

const DIMENSION_LABELS = [
  ['J', 'an energy'],
  ['N', 'a force'],
  ['W', 'a power'],
  ['Pa', 'a pressure'],
  ['C', 'a charge'],
  ['V', 'a voltage'],
  ['ohm', 'a resistance'],
  ['Hz', 'a frequency'],
  ['T', 'a magnetic field'],
  ['kg m/s', 'a momentum'],
  ['m', 'a length'],
  ['m^2', 'an area'],
  ['m^3', 'a volume'],
  ['s', 'a time'],
  ['kg', 'a mass'],
  ['m/s', 'a speed'],
  ['m/s^2', 'an acceleration'],
  ['K', 'a temperature'],
  ['A', 'a current'],
  ['rad', 'an angle'],
  ['mol', 'an amount of substance'],
]

let dimCache = null
function dimensionList() {
  if (!dimCache) {
    dimCache = DIMENSION_LABELS.map(([u, label]) => ({ ref: math.unit(1, u), label }))
  }
  return dimCache
}

// "an energy", "a force", or a fallback describing the base units.
export function dimensionName(value) {
  if (!math.isUnit(value)) return 'a plain number'
  for (const { ref, label } of dimensionList()) {
    if (value.equalBase(ref)) return label
  }
  try {
    const base = value.toSI().formatUnits()
    return `a quantity with units ${base}`
  } catch {
    return 'a quantity with units'
  }
}

const SUPERSCRIPTS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', '+': '' }

function unicodeify(ascii) {
  // 2.5e+7 -> 2.5×10⁷ (display only; ascii form stays valid calculator input)
  return ascii.replace(/e([+-]?\d+)/g, (_, exp) => {
    const sup = exp
      .split('')
      .map((ch) => SUPERSCRIPTS[ch] ?? ch)
      .join('')
    return `×10${sup}`
  })
}

// Returns { display, ascii }. ascii is always re-enterable calculator input.
export function formatValue(value) {
  let v = value

  if (math.isUnit(v)) {
    // Respect explicit "in <unit>" conversions (mathjs marks these).
    if (!v.skipAutomaticSimplification && needsRescue(v)) {
      for (const { name, ref } of preferredUnitList()) {
        if (v.equalBase(ref)) {
          v = v.to(name)
          break
        }
      }
    }
    const ascii = math.format(v, FORMAT_OPTS)
    return { display: unicodeify(ascii), ascii }
  }

  if (typeof v === 'number' || typeof v === 'bigint') {
    const ascii = math.format(v, FORMAT_OPTS)
    return { display: unicodeify(ascii), ascii }
  }

  // booleans, strings, complex, matrices… just let mathjs print them
  const ascii = math.format(v, FORMAT_OPTS)
  return { display: unicodeify(ascii), ascii }
}

// Friendlier wording for the most common mathjs error shapes.
export function friendlyError(err, input) {
  let msg = err && err.message ? err.message : String(err)

  let m = msg.match(/Units do not match \(['"]?(.+?)['"]? != ['"]?(.+?)['"]?\)/)
  if (m) {
    try {
      const a = math.unit(1, m[1])
      const b = math.unit(1, m[2])
      return `Can't combine ${dimensionName(a).replace(/^an? /, '')} and ${dimensionName(b).replace(/^an? /, '')} (${m[1]} vs ${m[2]})`
    } catch {
      /* fall through */
    }
  }

  m = msg.match(/Undefined symbol (\w+)/)
  if (m) return `I don't know "${m[1]}" — check the constants list, or define it like "${m[1]} = 5 m"`

  if (/Unexpected end of expression|Parenthesis \) expected/.test(msg)) {
    return 'Incomplete expression — check your parentheses'
  }

  return msg
}
