import { useState } from 'react'

export default function SendEmailModal({ draft, onSend, onClose }) {
  const [to, setTo] = useState(draft.to)
  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState(null)

  async function handleSend() {
    setSending(true)
    setErr(null)
    try {
      await onSend({ to, subject, body })
    } catch (e) {
      setErr(e.message)
      setSending(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: '95vw' }}>
        <h3>Send Email</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label>To</label>
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              style={{ width: '100%' }}
              placeholder="email@example.com, …"
            />
          </div>
          <div>
            <label>Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ width: '100%', height: 300, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
            />
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{err}</div>}

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSend} disabled={sending || !to.trim()}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
