import { useEffect, useState } from 'react'
import { signFmaScratchWork } from '../../utils/supabase'

// One question's handwritten work, cut out of the page it was written on.
//
// Nothing is re-cropped into a new file. The splitter stores a box as four
// fractions of the page, and the crop is made here by blowing the page image up
// inside a window the shape of that box: 1/w of the page fits across the
// window, and the box's top-left corner is pulled up to the window's. That
// keeps the original scan as the only copy of the work -- a box the model got
// wrong is four numbers to fix, not an image to regenerate -- and it means the
// copy-to-Miro path gets the crop for free, since it photographs the DOM.
export default function WorkCrop({ work, alt = 'Student work for this question' }) {
  const { page, x, y, w, h } = work
  const [url, setUrl] = useState(null)
  const [err, setErr] = useState(null)

  // The bucket is private, so the page has to be signed before it will load.
  useEffect(() => {
    let cancelled = false
    signFmaScratchWork(page.storage_path)
      .then(u => { if (!cancelled) setUrl(u) })
      .catch(e => { if (!cancelled) setErr(e.message) })
    return () => { cancelled = true }
  }, [page.storage_path])

  if (err) return <div style={{ fontSize: 11, color: 'var(--red)' }}>Couldn't load the work: {err}</div>

  // Without the page's pixel size there is no way to know the crop's shape, so
  // fall back to the box's own proportions on a letter-ish page.
  const pageW = page.width || 1700
  const pageH = page.height || 2200
  const aspect = (w * pageW) / (h * pageH)

  return (
    <div className="fma-work-crop" style={{ aspectRatio: `${aspect}` }}>
      {url ? (
        <img
          className="fma-work-crop-img"
          src={url}
          alt={alt}
          style={{
            width: `${100 / w}%`,
            height: `${100 / h}%`,
            left: `${-(x / w) * 100}%`,
            top: `${-(y / h) * 100}%`,
          }}
        />
      ) : (
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      )}
    </div>
  )
}
