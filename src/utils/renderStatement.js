import katex from 'katex'

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
