import { useState } from 'react'
import { signFmaScratchWork } from '../../utils/supabase'

// The fma-scratch-work bucket is private, so a stored path has to be signed
// before it can be opened. Signing happens on click rather than on render:
// the attempt-detail screen would otherwise mint a URL for every attempt whether
// or not anyone looks at it, and the links expire.
export default function ScratchWorkLink({ path, label = 'Scratch work ↗', style }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  if (!path) return null

  async function open(e) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const url = await signFmaScratchWork(path)
      window.open(url, '_blank', 'noopener')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span style={style}>
      <a href="#" onClick={open} style={{ fontSize: 12 }}>{busy ? 'Opening…' : label}</a>
      {err && <span style={{ fontSize: 11, color: 'var(--red)', marginLeft: 6 }}>{err}</span>}
    </span>
  )
}
