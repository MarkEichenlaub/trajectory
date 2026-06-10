// The calculator engine: stateful evaluate() with ans, user variables,
// angle mode, and friendly errors. Pure JS — no DOM, no Miro, no network.
import { math, parse, setAngleMode, getAngleMode } from './math-setup.js'
import { getBaseScope, getReservedNames } from './data/catalog.js'
import { formatValue, friendlyError } from './format.js'

// Whiteboard text arrives with unicode math symbols; normalize to parseable input.
export function preprocessInput(raw) {
  let s = String(raw ?? '')
  s = s
    .replace(/×/g, '*') // ×
    .replace(/⋅/g, '*') // ⋅
    .replace(/÷/g, '/') // ÷
    .replace(/−/g, '-') // − (unicode minus)
    .replace(/²/g, '^2') // ²
    .replace(/³/g, '^3') // ³
    .replace(/°/g, ' deg') // °
    .replace(/π/g, ' pi ') // π
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, ' ') // non-breaking space
  s = s.trim()
  while (s.endsWith('=')) s = s.slice(0, -1).trimEnd()
  return s.trim()
}

function assignmentTargets(ast) {
  const targets = []
  ast.traverse((node) => {
    if (node.isAssignmentNode && node.object && node.object.isSymbolNode) {
      targets.push(node.object.name)
    } else if (node.isFunctionAssignmentNode) {
      targets.push(node.name)
    }
  })
  return targets
}

export function createCalcEngine({ angleMode = 'deg' } = {}) {
  setAngleMode(angleMode)

  const baseScope = getBaseScope()
  const reserved = getReservedNames()
  // NOTE: must be a plain object — mathjs scopes reject null-prototype objects.
  const scope = Object.assign({}, baseScope)
  const userVars = new Set()

  function evaluate(input, { updateAns = true } = {}) {
    const text = preprocessInput(input)
    if (!text) return { ok: false, error: 'Empty expression' }

    let ast
    try {
      ast = parse(text)
    } catch (err) {
      return { ok: false, error: friendlyError(err, text) }
    }

    for (const name of assignmentTargets(ast)) {
      if (reserved.has(name)) {
        return { ok: false, error: `"${name}" is a built-in constant — pick another name (e.g. ${name}1)` }
      }
      let isUnit = false
      try {
        isUnit = math.Unit.isValuelessUnit(name)
      } catch {
        /* ignore */
      }
      if (isUnit) {
        return { ok: false, error: `"${name}" is a unit — pick another name (e.g. ${name}1)` }
      }
    }

    let value
    try {
      value = ast.compile().evaluate(scope)
    } catch (err) {
      return { ok: false, error: friendlyError(err, text) }
    }

    // Multi-statement input ("a = 1; b = 2") returns a ResultSet — show the last value.
    if (value && value.isResultSet && value.entries) {
      value = value.entries[value.entries.length - 1]
    }

    for (const name of assignmentTargets(ast)) userVars.add(name)

    if (typeof value === 'function') {
      return { ok: true, value, ast, display: '(function defined)', ascii: '(function defined)' }
    }
    if (value === undefined) {
      return { ok: false, error: 'No result' }
    }

    if (updateAns) scope.ans = value
    const { display, ascii } = formatValue(value)
    return { ok: true, value, ast, display, ascii }
  }

  return {
    evaluate,
    getScope: () => scope,
    setAns: (value) => {
      scope.ans = value
    },
    setAngleMode,
    getAngleMode,
    setVariable: (name, valueString) => evaluate(`${name} = ${valueString}`, { updateAns: false }),
    getVariables: () =>
      [...userVars]
        .filter((name) => name in scope)
        .map((name) => ({ name, display: formatValue(scope[name]).display })),
    clearVariables: () => {
      for (const name of userVars) delete scope[name]
      userVars.clear()
    },
  }
}
