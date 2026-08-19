import katex from 'katex'
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

// Render a problem/question statement to HTML: paragraphs split on blank lines,
// $$...$$ segments rendered as INLINE KaTeX, __text__ as bold, rest escaped.
export function renderStatementHtml(text) {
  if (!text) return ''
  return text
    .split(/\n\s*\n/)
    .map(par => {
      const parts = par.split(/(\$\$[\s\S]*?\$\$)/)
      const html = parts.map(part => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          return katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: false })
        }
        return escapeHtml(part).replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
      }).join('')
      return `<p>${html}</p>`
    })
    .join('')
}
