// Merges constants + data files into:
//   - the base evaluation scope (constants, data objects, flat aliases)
//   - CATALOG: a flat searchable list for the UI
//   - selfTest(): startup validation (everything parses, no unit collisions)
import { math, parse } from '../math-setup.js'
import { CONSTANT_DEFS } from '../constants.js'
import { formatValue } from '../format.js'
import astronomy from './astronomy.js'
import materials from './materials.js'

const DATASETS = [astronomy, materials]

// Names that intentionally shadow a mathjs unit (documented in constants.js).
// kB shadows kilobyte (useless in physics class); hbar shadows mathjs's
// built-in hbar unit with the identical value.
const INTENTIONAL_SHADOWS = new Set(['kB', 'hbar'])

function parseLiteral(str) {
  // Data values are literals like '5.972e24 kg' or '1.33'.
  return parse(str).evaluate()
}

let built = null

function build() {
  if (built) return built

  const scope = {}
  const catalog = []
  const problems = []

  const claim = (name, source) => {
    if (name in scope) {
      problems.push(`duplicate name "${name}" (${source})`)
      return false
    }
    let isUnit = false
    try {
      isUnit = math.Unit.isValuelessUnit(name)
    } catch {
      /* ignore */
    }
    if (isUnit && !INTENTIONAL_SHADOWS.has(name)) {
      problems.push(`name "${name}" collides with a mathjs unit (${source})`)
      return false
    }
    return true
  }

  for (const def of CONSTANT_DEFS) {
    let value
    try {
      value = parseLiteral(def.value)
    } catch (err) {
      problems.push(`constant ${def.names[0]}: ${err.message}`)
      continue
    }
    for (const name of def.names) {
      if (claim(name, `constant ${def.names[0]}`)) scope[name] = value
    }
    catalog.push({
      id: def.names[0],
      names: def.names,
      label: def.label,
      display: formatValue(value).display,
      insert: def.names[0],
      category: 'constants',
      tags: def.names.map((n) => n.toLowerCase()),
    })
  }

  for (const dataset of DATASETS) {
    for (const [objName, obj] of Object.entries(dataset.objects)) {
      if (!claim(objName, `${dataset.category} object`)) continue
      const holder = {}
      for (const [propName, prop] of Object.entries(obj.props)) {
        let value
        try {
          value = parseLiteral(prop.value)
        } catch (err) {
          problems.push(`${objName}.${propName}: ${err.message}`)
          continue
        }
        holder[propName] = value
        const id = `${objName}.${propName}`
        const names = [id, ...(prop.aliases ?? [])]
        catalog.push({
          id,
          names,
          label: `${obj.label} — ${prop.label}`,
          display: formatValue(value).display,
          insert: id,
          category: dataset.category,
          tags: [objName, propName, ...(prop.aliases ?? []), obj.label.toLowerCase()],
        })
        for (const alias of prop.aliases ?? []) {
          if (claim(alias, id)) scope[alias] = value
        }
      }
      scope[objName] = Object.freeze(holder)
    }
  }

  const reserved = new Set([
    ...Object.keys(scope),
    'ans',
    'pi',
    'e',
    'i',
    'tau',
    'phi',
    'true',
    'false',
    'Infinity',
    'NaN',
    'end',
    'mod',
    'to',
    'in',
    'and',
    'or',
    'not',
    'xor',
  ])

  built = { scope: Object.freeze(scope), catalog, reserved, problems }
  return built
}

export function getBaseScope() {
  return build().scope
}

export function getReservedNames() {
  return build().reserved
}

export function getCatalog() {
  return build().catalog
}

export function selfTest() {
  return build().problems
}

export function searchCatalog(query) {
  const q = String(query ?? '').trim().toLowerCase()
  const catalog = build().catalog
  if (!q) return catalog
  const scored = []
  for (const entry of catalog) {
    const names = entry.names.map((n) => n.toLowerCase())
    let score = 0
    if (names.includes(q)) score = 100
    else if (names.some((n) => n.startsWith(q))) score = 80
    else if (names.some((n) => n.includes(q))) score = 60
    else if (entry.label.toLowerCase().includes(q)) score = 40
    else if (entry.tags.some((t) => t.includes(q))) score = 20
    if (score > 0) scored.push({ entry, score })
  }
  scored.sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
  return scored.map((s) => s.entry)
}
