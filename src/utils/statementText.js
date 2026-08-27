// Two jobs, both about a problem's `statement` text:
//
//   1. splitting a trailing multiple-choice run — "(a) … (b) … (c) …" — off the
//      question stem, so choices can be shown one per line the way they appear
//      on the real exam (see renderStatement.js and .statement-choices in the CSS);
//   2. turning a statement into plain text with Unicode math, for the Problems
//      tab's Copy button (Miro and other paste targets have no LaTeX).

// A choice marker: "(a)".."(e)", either case, not part of a word and not the
// "__(a)__" bold part-labels the AoPS scripts use for multi-part questions.
const CHOICE_TOKEN_RE = /(^|[^_\w])\(([a-eA-E])\)/g

// Lead-ins that make a short (3–4 option) run believable as a real choice list.
const STEM_LEAD_IN_RE = /[?:.!]$|\$\$$/

function mathSpans(par) {
  const spans = []
  const re = /\$\$[\s\S]*?\$\$/g
  let m
  while ((m = re.exec(par))) spans.push([m.index, m.index + m[0].length])
  return spans
}

// Pull a multiple-choice run out of one paragraph, or return null if this
// paragraph is just prose. Prose that merely *mentions* "(a)" and "(b)" is the
// thing to avoid here, so a run has to look like a real choice list: at least
// three markers in ascending order starting from (a), outside any math, each
// with either no text at all (the choices are figures) or enough text to be an
// answer rather than a connective like "or". A full (a)–(e) sweep is the F=ma
// format and is trusted on its own; a shorter run also needs a stem that reads
// like a lead-in ("…which is greatest?", "…the period is:") or no stem at all.
export function splitChoiceRun(par) {
  if (!par) return null
  const spans = mathSpans(par)
  const inMath = i => spans.some(([s, e]) => i >= s && i < e)

  const tokens = []
  let m
  CHOICE_TOKEN_RE.lastIndex = 0
  while ((m = CHOICE_TOKEN_RE.exec(par))) {
    const start = m.index + m[1].length
    if (!inMath(start)) tokens.push({ letter: m[2], start, end: m.index + m[0].length })
  }

  let run = null
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].letter !== 'a' && tokens[i].letter !== 'A') continue
    const candidate = [tokens[i]]
    for (let j = i + 1; j < tokens.length; j++) {
      const next = String.fromCharCode(candidate[candidate.length - 1].letter.charCodeAt(0) + 1)
      if (tokens[j].letter !== next) break
      candidate.push(tokens[j])
    }
    if (candidate.length >= 3 && (!run || candidate.length > run.length)) run = candidate
  }
  if (!run) return null

  const stem = par.slice(0, run[0].start).trim()
  const choices = run.map((t, i) => ({
    letter: t.letter,
    text: par.slice(t.end, i + 1 < run.length ? run[i + 1].start : par.length).trim(),
  }))
  if (choices.some(c => c.text.length > 0 && c.text.length < 4)) return null
  if (run.length < 5 && stem && !STEM_LEAD_IN_RE.test(stem)) return null
  return { stem, choices }
}

// A statement as blocks: one per paragraph, each with its prose and (when the
// paragraph ends in a choice list) the choices split off.
export function statementBlocks(text) {
  return (text || '').split(/\n\s*\n/).map(par => {
    const split = splitChoiceRun(par)
    return split || { stem: par, choices: [] }
  })
}

// ---- LaTeX → Unicode ------------------------------------------------------

const SYMBOLS = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
  tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', approx: '≈', sim: '∼',
  simeq: '≃', equiv: '≡', propto: '∝', neq: '≠', ne: '≠', le: '≤', leq: '≤',
  ge: '≥', geq: '≥', ll: '≪', gg: '≫', infty: '∞', partial: '∂', nabla: '∇',
  sum: '∑', prod: '∏', int: '∫', iint: '∬', iiint: '∭', oint: '∮',
  to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
  uparrow: '↑', downarrow: '↓', Rightarrow: '⇒', mapsto: '↦',
  ldots: '…', dots: '…', cdots: '…', circ: '°', degree: '°', ell: 'ℓ',
  hbar: 'ℏ', odot: '⊙', oplus: '⊕', otimes: '⊗', perp: '⊥', parallel: '∥',
  angle: '∠', triangle: '△', square: '□', langle: '⟨', rangle: '⟩',
  prime: '′', AA: 'Å', i: 'ı', j: 'ȷ', blank: '____', slider: '__', drop: '__',
  drag: '__',
}

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

// Commands whose visual effect doesn't survive plain text: drop the command and
// keep whatever follows (a braced group is transparent to the parser below).
const TRANSPARENT = new Set([
  'mathrm', 'text', 'textrm', 'textnormal', 'mathbf', 'textbf', 'textit',
  'mathit', 'textsl', 'mathcal', 'mathscr', 'mathbb', 'mathsf', 'boldsymbol',
  'operatorname', 'left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'rm', 'bf',
  'it', 'sf', 'displaystyle', 'textstyle', 'scriptstyle', 'tiny', 'small',
  'large', 'Large', 'huge', 'limits', 'nolimits',
])

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'sinh', 'cosh', 'tanh',
  'arcsin', 'arccos', 'arctan', 'ln', 'log', 'exp', 'lim', 'max', 'min', 'det',
])

const ACCENTS = {
  vec: '⃗', hat: '̂', bar: '̄', overline: '̄',
  dot: '̇', ddot: '̈', tilde: '̃', mathring: '̊',
}

const SPACERS = { ',': ' ', ';': ' ', ':': ' ', ' ': ' ', quad: ' ', qquad: '  ', '!': '' }

// Multiplication binds tightly: "2 \times 10^{8}" should read "2×10⁸", not
// "2× 10⁸", so these swallow the spaces the source puts around them.
const TIGHT = new Set(['times', 'cdot', 'div'])

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ' }
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ' }

// Read a {...} group starting at `i` (which points at the brace).
function readGroup(tex, i) {
  let depth = 0
  for (let j = i; j < tex.length; j++) {
    if (tex[j] === '\\') { j++; continue }
    if (tex[j] === '{') depth++
    else if (tex[j] === '}') {
      depth--
      if (depth === 0) return { body: tex.slice(i + 1, j), end: j + 1 }
    }
  }
  return { body: tex.slice(i + 1), end: tex.length }
}

// Read one argument: a braced group, a single command, or a single character.
function readArg(tex, i) {
  while (tex[i] === ' ') i++
  if (i >= tex.length) return { body: '', end: i }
  if (tex[i] === '{') return readGroup(tex, i)
  const cmd = /^\\([a-zA-Z]+|.)/.exec(tex.slice(i))
  if (cmd) return { body: cmd[0], end: i + cmd[0].length }
  return { body: tex[i], end: i + 1 }
}

// Parenthesize a fraction part / radicand unless it's a single atom.
function atom(s) {
  if (!s) return s
  if (/^[^\s+\-−·×/]+$/.test(s)) return s
  if (/^\(.*\)$/.test(s)) return s
  return `(${s})`
}

function script(converted, table, marker) {
  if (!converted) return marker
  const mapped = [...converted].map(c => table[c]).join('')
  if (mapped.length === converted.length && !mapped.includes('undefined')) return mapped
  return marker + (converted.length > 1 ? `(${converted})` : converted)
}

// Best-effort LaTeX → Unicode for pasting into places with no math support.
// Everyday statement math (Greek, fractions, roots, scripts, units) comes out
// readable; exotic constructions degrade to something legible rather than raw
// backslashes.
export function latexToUnicode(tex) {
  let out = ''
  let i = 0
  while (i < tex.length) {
    const ch = tex[i]

    if (ch === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(tex.slice(i))
      const name = m ? m[1] : ''
      i += m ? m[0].length : 1
      if (name === '\\') { out += ' '; continue }
      if (has(SPACERS, name)) { out += SPACERS[name]; continue }
      if (TRANSPARENT.has(name)) continue
      if (name === 'begin' || name === 'end') { const g = readArg(tex, i); i = g.end; continue }
      if (name === 'hline' || name === 'vspace' || name === 'color') {
        if (name !== 'hline') { const g = readArg(tex, i); i = g.end }
        continue
      }
      if (name === 'textcolor') { const g = readArg(tex, i); i = g.end; continue }
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const a = readArg(tex, i); const b = readArg(tex, a.end)
        i = b.end
        out += `${atom(latexToUnicode(a.body))}/${atom(latexToUnicode(b.body))}`
        continue
      }
      if (name === 'sqrt') {
        let root = ''
        if (tex[i] === '[') {
          const close = tex.indexOf(']', i)
          root = tex.slice(i + 1, close)
          i = close + 1
        }
        const a = readArg(tex, i)
        i = a.end
        const sign = root === '3' ? '∛' : root === '4' ? '∜' : '√'
        out += sign + atom(latexToUnicode(a.body))
        continue
      }
      if (has(ACCENTS, name)) {
        const a = readArg(tex, i)
        i = a.end
        const base = latexToUnicode(a.body)
        out += base.length === 1 ? base + ACCENTS[name] : base
        continue
      }
      if (FUNCTIONS.has(name)) { out += name + ' '; continue }
      if (has(SYMBOLS, name)) {
        if (TIGHT.has(name)) {
          out = out.replace(/ +$/, '')
          while (tex[i] === ' ') i++
        }
        out += SYMBOLS[name]
        continue
      }
      if (/^[a-zA-Z]+$/.test(name)) continue // unknown command: drop it, keep its args
      out += name // escaped literal: \{ \% \$ \_ \&
      continue
    }

    if (ch === '{') { const g = readGroup(tex, i); out += latexToUnicode(g.body); i = g.end; continue }
    if (ch === '}') { i++; continue }
    if (ch === '^' || ch === '_') {
      const a = readArg(tex, i + 1)
      i = a.end
      const inner = latexToUnicode(a.body).trim()
      out += inner === '°' ? '°' : script(inner, ch === '^' ? SUP : SUB, ch)
      continue
    }
    if (ch === '&' || ch === '~') { out += ' '; i++; continue }
    out += ch
    i++
  }
  return out
}

// One chunk of statement prose (no choice splitting) as plain text.
function chunkToPlainText(text) {
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => latexToUnicode(tex))
    .replace(/__([\s\S]+?)__/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ([,.;:?!])/g, '$1')
    .trim()
}

// Whole statement as plain text: paragraphs blank-line separated, each answer
// choice on its own line.
export function statementToPlainText(text) {
  return statementBlocks(text)
    .map(({ stem, choices }) => [
      chunkToPlainText(stem),
      ...choices.map(c => `(${c.letter}) ${chunkToPlainText(c.text)}`.trim()),
    ].filter(Boolean).join('\n'))
    .filter(Boolean)
    .join('\n\n')
}

// The grey "where this came from" line above a statement: collection, year,
// lesson and problem number, skipping whatever a given problem doesn't have.
export function problemSourceLine(p) {
  if (!p) return ''
  return [
    p.contest,
    p.year > 0 ? p.year : null,
    p.lesson || p.label,
    p.set_label,
  ].filter(Boolean).join(' · ')
}

// What the Problems tab's Copy button puts on the clipboard: the source line
// and the problem itself, without the title, tags or links.
export function problemToClipboardText(p) {
  const source = problemSourceLine(p)
  const body = statementToPlainText(p.statement || p.desc || '')
  return [source, body].filter(Boolean).join('\n\n')
}
