import katex from 'katex'
import { statementBlocks } from './statementText'
// KaTeX emits a MathML copy of every expression alongside the visual HTML, and
// relies on its own stylesheet to clip that copy out of view. Without the CSS
// both render, so "$$m$$" shows up as "mm" and \sqrt{} falls apart. This used to
// be imported only by ProblemPreviewModal, which is lazy-loaded — so anything
// rendering math on another screen (the F=ma test runner) got no styles at all.
import 'katex/dist/katex.min.css'

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Placeholders stand in for rendered math while the surrounding prose is
// escaped and marked up. Private-use code points, so nothing in a statement can
// collide with them and escapeHtml leaves them alone.
const HOLE_OPEN = ''
const HOLE_CLOSE = ''

// One run of prose: $$...$$ segments rendered as INLINE KaTeX, __text__ as
// bold, everything else escaped.
function renderInline(text) {
  // Math is rendered first and set aside behind a placeholder so the bold pass
  // sees the text whole. Bolding used to run per-fragment, which meant a __...__
  // run containing a formula had its opening and closing markers land in
  // different fragments — neither matched, and the student was shown the
  // underscores.
  const math = []
  const withHoles = text.replace(/\$\$[\s\S]*?\$\$/g, seg => {
    if (seg.length < 4) return seg
    math.push(katex.renderToString(seg.slice(2, -2), { throwOnError: false, displayMode: false }))
    return `${HOLE_OPEN}${math.length - 1}${HOLE_CLOSE}`
  })
  return escapeHtml(withHoles)
    .replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
    .replace(new RegExp(`${HOLE_OPEN}(\\d+)${HOLE_CLOSE}`, 'g'), (_, i) => math[Number(i)])
}

// Render a problem/question statement to HTML: paragraphs split on blank lines,
// and a multiple-choice run at the end of a paragraph broken out one choice per
// line, the way the choices are laid out on the real exam.
export function renderStatementHtml(text) {
  if (!text) return ''
  return statementBlocks(text)
    .map(({ stem, choices }) => {
      const stemHtml = stem ? `<p>${renderInline(stem)}</p>` : ''
      if (choices.length === 0) return stemHtml
      const items = choices
        .map(c => `<div class="statement-choice"><span class="choice-label">(${c.letter})</span> ${renderInline(c.text)}</div>`)
        .join('')
      return `${stemHtml}<div class="statement-choices">${items}</div>`
    })
    .join('')
}
