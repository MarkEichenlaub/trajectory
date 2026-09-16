// Turn a piece of the page into a PNG on the clipboard, so an F=ma question
// can be pasted straight onto a Miro board during a session.
//
// The trick is SVG <foreignObject>: an HTML subtree drawn inside an SVG, which
// a canvas can then rasterize. The catch is that the browser refuses to fetch
// anything at all while rendering that SVG — no stylesheets, no webfonts, no
// <img> over the network — so everything has to be carried inside the markup:
//
//   * every stylesheet the page can read is inlined as one <style> block
//     (that's where the KaTeX rules live, without which math renders twice —
//     the visible copy and the MathML one that CSS is supposed to clip away);
//   * every font file those rules reference becomes a data: URI;
//   * every <img> (question figures, choice figures) is fetched and swapped
//     for a data: URI, which also keeps the canvas untainted so it can be read
//     back out as a blob.
//
// Fonts are the expensive part, so the assembled CSS is built once per page
// load and reused by every later copy.

const FONT_URL_RE = /url\(\s*(['"]?)([^'")]+\.(?:woff2|woff|ttf|otf))\1\s*\)/gi

// There is no <body> inside a foreignObject, so the page's body rule — which
// is where the type and text colour are set — never fires. The wrapper takes
// those over, and its own box is drawn in `nodeToPngBlob`.
const EXPORT_ROOT_CLASS = 'copy-image-root'
const EXPORT_ROOT_CSS = `
.${EXPORT_ROOT_CLASS} {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px; line-height: 1.5; color: var(--text, #1f3a5f);
  -webkit-font-smoothing: antialiased;
}
.${EXPORT_ROOT_CLASS} img { max-width: 100%; }
`

let cssPromise = null

async function fetchAsDataUrl(url) {
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
  const blob = await res.blob()
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

// Swap every font file referenced by a chunk of CSS for a data: URI. A font
// that won't load is dropped from the src list rather than failing the whole
// copy — worst case one family falls back and the rest still render.
async function inlineFonts(cssText, baseUrl) {
  const urls = new Set()
  for (const m of cssText.matchAll(FONT_URL_RE)) urls.add(m[2])

  const resolved = new Map()
  await Promise.all([...urls].map(async raw => {
    // Only the woff2 copy is worth carrying: it's the smallest, and every
    // browser that can render a foreignObject can read it. The .woff/.ttf
    // fallbacks in the same src list would triple the payload for nothing.
    if (raw.startsWith('data:')) { resolved.set(raw, raw); return }
    if (!/\.woff2(\?|$)/i.test(raw)) return
    try {
      resolved.set(raw, await fetchAsDataUrl(new URL(raw, baseUrl).href))
    } catch { /* leave it out; the family falls back */ }
  }))

  return cssText.replace(FONT_URL_RE, (whole, _q, raw) => {
    const data = resolved.get(raw)
    return data ? `url("${data}")` : whole
  })
}

// Everything the page's own stylesheets say, with fonts embedded. Sheets from
// another origin (the Google Fonts link) throw on .cssRules and are skipped —
// their families just fall back to the next name in each stack.
function buildCss() {
  if (cssPromise) return cssPromise
  cssPromise = (async () => {
    const parts = []
    for (const sheet of Array.from(document.styleSheets)) {
      let rules
      try {
        rules = sheet.cssRules
      } catch {
        continue
      }
      if (!rules) continue
      const text = Array.from(rules).map(r => r.cssText).join('\n')
      if (!text) continue
      parts.push(await inlineFonts(text, sheet.href || document.baseURI))
    }
    return parts.join('\n')
  })()
  return cssPromise
}

// Figures live in a public Supabase bucket that sends
// Access-Control-Allow-Origin: *, so they can be read into data: URIs. Sizes
// are pinned from the on-screen layout, because inside the foreignObject there
// is no intrinsic-size pass to fall back on.
async function inlineImages(clone, originals) {
  const clonedImgs = Array.from(clone.querySelectorAll('img'))
  await Promise.all(clonedImgs.map(async (img, i) => {
    const live = originals[i]
    if (live) {
      const rect = live.getBoundingClientRect()
      if (rect.width) img.setAttribute('width', String(Math.round(rect.width)))
      if (rect.height) img.setAttribute('height', String(Math.round(rect.height)))
    }
    img.removeAttribute('loading')
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:')) return
    try {
      img.setAttribute('src', await fetchAsDataUrl(src))
    } catch {
      // A figure that won't come across is worse as a broken-image icon than
      // as nothing, and the statement usually still reads without it.
      img.remove()
    }
  }))
}

/**
 * Render a live DOM node to a PNG blob.
 *
 * @param {HTMLElement} node          the node to draw
 * @param {object}      [opts]
 * @param {number}      [opts.width]  layout width in CSS px (defaults to the node's own)
 * @param {number}      [opts.scale]  pixel ratio; 2 keeps text crisp when Miro scales it up
 * @param {number}      [opts.padding]
 * @param {string}      [opts.background]
 * @param {(clone: HTMLElement) => void} [opts.prepare] edit the clone before it's drawn
 */
export async function nodeToPngBlob(node, opts = {}) {
  const {
    width = Math.ceil(node.getBoundingClientRect().width) || 680,
    scale = 2,
    padding = 20,
    background = '#ffffff',
    prepare,
  } = opts

  const css = await buildCss()

  const clone = node.cloneNode(true)
  prepare?.(clone)
  await inlineImages(clone, Array.from(node.querySelectorAll('img')))

  // Laid out off-screen in the real document first: that's the only way to
  // learn how tall the content ends up, and the SVG needs an exact height or
  // the bottom is cropped. The stage carries exactly the frame the SVG's
  // wrapper will, so the height measured here is the height drawn there.
  const stage = document.createElement('div')
  stage.className = EXPORT_ROOT_CLASS
  stage.setAttribute('style', [
    'position:fixed', 'left:-10000px', 'top:0', 'z-index:-1',
    'pointer-events:none', `width:${width}px`, `background:${background}`,
    `padding:${padding}px`, 'box-sizing:border-box',
  ].join(';'))
  stage.appendChild(clone)
  document.body.appendChild(stage)

  let svgUrl, height
  try {
    height = Math.ceil(stage.getBoundingClientRect().height)
    const inner = new XMLSerializer().serializeToString(clone)
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<foreignObject x="0" y="0" width="${width}" height="${height}">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" class="${EXPORT_ROOT_CLASS}" ` +
      `style="width:${width}px;background:${background};padding:${padding}px;box-sizing:border-box">` +
      `<style>${css}${EXPORT_ROOT_CSS}</style>${inner}` +
      `</div></foreignObject></svg>`
    svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  } finally {
    stage.remove()
  }

  const img = new Image()
  img.decoding = 'sync'
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error("the browser couldn't draw this question"))
    img.src = svgUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  return await new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('the image came out empty')), 'image/png')
  })
}

/**
 * Render a node and put it on the clipboard as a PNG.
 *
 * Called straight from a click handler: the blob is handed to ClipboardItem as
 * a promise so the browser keeps the click's permission alive across the font
 * and figure fetches, which on a cold first copy take a moment.
 */
export async function copyNodeAsImage(node, opts) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('this browser has no image clipboard')
  }
  const blob = nodeToPngBlob(node, opts)
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  } catch (e) {
    // Firefox (and older Chrome) reject a promise-valued ClipboardItem. Await
    // the render and write the blob itself; this only fails if the tab has
    // meanwhile lost focus, which the caller reports as a retry.
    const settled = await blob
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': settled })])
    } catch {
      throw e
    }
  }
}
