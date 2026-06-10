// Miro text items hold limited HTML; convert to/from plain calculator text.

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
}

export function htmlToText(html) {
  if (!html) return ''
  let s = String(html)
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<\/p>\s*<p[^>]*>/gi, '\n')
  s = s.replace(/<[^>]+>/g, '')
  s = s.replace(/&[a-zA-Z#0-9]+;/g, (m) => ENTITIES[m.toLowerCase()] ?? m)
  s = s.replace(/ /g, ' ')
  return s.trim()
}

export function textToHtml(text) {
  const esc = String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return (
    '<p>' +
    esc
      .split('\n')
      .map((line) => line || '&nbsp;')
      .join('</p><p>') +
    '</p>'
  )
}

// The expression to evaluate: the last nonempty line the student typed.
export function lastLine(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.length ? lines[lines.length - 1] : ''
}
