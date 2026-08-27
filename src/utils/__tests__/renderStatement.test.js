import { describe, it, expect } from 'vitest'
import { renderStatementHtml } from '../renderStatement'

const displayCount = html => (html.match(/katex-display/g) || []).length

describe('renderStatementHtml', () => {
  it('breaks a multiple-choice run into one line per choice', () => {
    const html = renderStatementHtml('Which is greatest? (a) $$\\omega$$ (b) $$2\\omega$$ (c) $$3\\omega$$')
    expect(html).toContain('<p>Which is greatest?</p>')
    expect((html.match(/class="statement-choice"/g) || []).length).toBe(3)
    expect(html).toContain('<span class="choice-label">(b)</span>')
  })

  // A choice is usually nothing but a formula. Left to the "whole chunk is one
  // formula" rule it would be centred on a line of its own, and five of them
  // would no longer read as a list.
  it('keeps choice math inline', () => {
    expect(displayCount(renderStatementHtml('Pick: (a) $$\\omega$$ (b) $$2\\omega$$ (c) $$3\\omega$$'))).toBe(0)
  })

  it('sets a formula that is a paragraph by itself in display mode', () => {
    expect(displayCount(renderStatementHtml('So we have\n\n$$F = ma$$'))).toBe(1)
    expect(displayCount(renderStatementHtml('We know $$F = ma$$ holds here.'))).toBe(0)
  })

  it('sets a multi-line environment in display mode even mid-paragraph', () => {
    const html = renderStatementHtml('We know that $$\\begin{aligned} a &= 1 \\\\ b &= 2 \\end{aligned}$$ and so on.')
    expect(displayCount(html)).toBe(1)
  })

  it('renders a figure where it appears in the prose', () => {
    const html = renderStatementHtml('The plot looks like this:\n\n![](https://example.com/a%20b.png)')
    expect(html).toContain('<img class="statement-figure" src="https://example.com/a%20b.png"')
  })

  // A non-http src is left as inert escaped text rather than becoming an <img>,
  // and the alt text — the one part an author controls — is dropped, so neither
  // can carry an attribute out of the tag.
  it('will not turn a figure into a script vector', () => {
    const html = renderStatementHtml('![](javascript:alert(1)) ![" onerror="x](https://e.com/a.png)')
    expect(html).not.toContain('src="javascript:')
    expect(html).not.toContain('onerror=')
    expect((html.match(/<img /g) || []).length).toBe(1)
    expect(html).toContain('src="https://e.com/a.png"')
  })

  it('renders bold that wraps a formula', () => {
    const html = renderStatementHtml('__the speed $$v$$ matters__')
    expect(html).toContain('<strong>')
    expect(html).not.toContain('__')
  })
})
