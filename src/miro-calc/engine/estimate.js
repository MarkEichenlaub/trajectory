// QAMA estimate session: hold the exact answer back until the student's
// estimate lands inside the required interval (or 5 attempts are used up).
import { math } from './math-setup.js'
import { requiredTolerance, siMagnitude, QAMA_PARAMS } from './qama.js'
import { formatValue, dimensionName, FORMAT_OPTS } from './format.js'

function revealDisplay(value, spec) {
  // Anti-cheat: when the tolerance was loose, don't reveal more precision
  // than the problem deserved (patent behavior).
  if (spec.kind !== 'exact' && spec.pct >= QAMA_PARAMS.revealRoundPct) {
    const ascii = math.format(value, { ...FORMAT_OPTS, precision: 3 })
    return formatValue(value).display.length <= ascii.length ? formatValue(value).display : ascii
  }
  return formatValue(value).display
}

function hintFor(estSI, spec) {
  const v = spec.valueSI
  if (v === 0) return 'not quite — think about whether things cancel'
  if (estSI === 0) return 'zero is not close — give a nonzero estimate'
  if (Math.sign(estSI) !== Math.sign(v)) return 'check the sign of your answer'
  const ooms = Math.abs(Math.log10(Math.abs(estSI / v)))
  const direction = Math.abs(estSI) > Math.abs(v) ? 'too high' : 'too low'
  if (ooms > 2) return `way off — about ${Math.round(ooms)} orders of magnitude ${direction}`
  if (ooms > 1) return `wrong order of magnitude (${direction})`
  return `right ballpark, but ${direction} — tighten it up`
}

// engine: a createCalcEngine() instance. input: the expression string.
// opts.attempts lets a host restore a half-finished problem after a reload.
export function createEstimateProblem(engine, input, opts = {}) {
  const res = engine.evaluate(input, { updateAns: false })
  if (!res.ok) return { ok: false, error: res.error }

  let spec
  try {
    spec = requiredTolerance(res.ast, engine.getScope())
  } catch (err) {
    return { ok: false, error: `Could not set up estimate: ${err.message}` }
  }

  const exact = res.value
  const exactIsUnit = math.isUnit(exact)
  let attempts = Math.min(Math.max(0, opts.attempts ?? 0), QAMA_PARAMS.maxAttempts - 1)
  let done = false

  function finish(accepted) {
    done = true
    engine.setAns(exact)
    return {
      accepted,
      revealed: true,
      display: accepted ? formatValue(exact).display : revealDisplay(exact, spec),
      attemptsLeft: QAMA_PARAMS.maxAttempts - attempts,
      hint: accepted ? null : `out of attempts — the answer is shown (rounded)`,
    }
  }

  return {
    ok: true,
    expr: input,
    spec,
    get attempts() {
      return attempts
    },
    get done() {
      return done
    },
    // What to tell the student up front, e.g. "estimate within ~10%"
    prompt() {
      if (spec.kind === 'exact') return 'This one you should know exactly — type the answer.'
      if (spec.kind === 'orderOfMagnitude') return 'Estimate the order of magnitude.'
      const pct = Math.max(1, Math.round(spec.pct * 100))
      return `Estimate first (within ~${pct}%)${exactIsUnit ? ' — include units' : ''}.`
    },
    check(estimateString) {
      if (done) return { accepted: true, revealed: true, display: formatValue(exact).display, attemptsLeft: 0 }

      const est = engine.evaluate(estimateString, { updateAns: false })
      if (!est.ok) {
        return { accepted: false, revealed: false, hint: est.error, attemptsLeft: QAMA_PARAMS.maxAttempts - attempts }
      }

      // dimension check — tolerance never forgives wrong units
      const estIsUnit = math.isUnit(est.value)
      if (exactIsUnit && !estIsUnit) {
        attempts++
        if (attempts >= QAMA_PARAMS.maxAttempts) return finish(false)
        return {
          accepted: false,
          revealed: false,
          hint: `include units — the answer is ${dimensionName(exact)}`,
          attemptsLeft: QAMA_PARAMS.maxAttempts - attempts,
        }
      }
      if (exactIsUnit && estIsUnit && !exact.equalBase(est.value)) {
        attempts++
        if (attempts >= QAMA_PARAMS.maxAttempts) return finish(false)
        return {
          accepted: false,
          revealed: false,
          hint: `wrong units: you gave ${dimensionName(est.value)}, the answer is ${dimensionName(exact)}`,
          attemptsLeft: QAMA_PARAMS.maxAttempts - attempts,
        }
      }
      if (!exactIsUnit && estIsUnit) {
        attempts++
        if (attempts >= QAMA_PARAMS.maxAttempts) return finish(false)
        return {
          accepted: false,
          revealed: false,
          hint: 'no units needed — the answer is a plain number',
          attemptsLeft: QAMA_PARAMS.maxAttempts - attempts,
        }
      }

      const estSI = siMagnitude(est.value)
      if (Number.isFinite(estSI) && estSI >= spec.lo && estSI <= spec.hi) {
        return finish(true)
      }

      attempts++
      if (attempts >= QAMA_PARAMS.maxAttempts) return finish(false)
      return {
        accepted: false,
        revealed: false,
        hint: hintFor(estSI, spec),
        attemptsLeft: QAMA_PARAMS.maxAttempts - attempts,
      }
    },
    skip() {
      return finish(false)
    },
  }
}
