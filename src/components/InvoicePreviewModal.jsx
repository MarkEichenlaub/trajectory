import { useState } from 'react'

// Shows the staged invoice email exactly as the billing contact will receive it,
// before anything is sent. The body is HTML, so it's rendered in a sandboxed
// iframe rather than dumped into a textarea — the point is to see what they see.
export default function InvoicePreviewModal({ invoice, studentName, onSend, onClose }) {
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState(null)

  async function handleSend() {
    setSending(true)
    setErr(null)
    try {
      await onSend(invoice)
    } catch (e) {
      setErr(e.message)
      setSending(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 680, maxWidth: '95vw' }}>
        <h3>Invoice email for {studentName}</h3>

        <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          <div><strong style={{ color: 'var(--text)' }}>To:</strong> {invoice.staged_email_to}</div>
          <div><strong style={{ color: 'var(--text)' }}>Subject:</strong> {invoice.staged_email_subject}</div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Amount:</strong> ${(invoice.amount_cents / 100).toLocaleString()} — {invoice.sessions_count} sessions
            {invoice.stripe_invoice_url && (
              <> · <a href={invoice.stripe_invoice_url} target="_blank" rel="noreferrer">Open in Stripe ↗</a></>
            )}
          </div>
        </div>

        {/* sandbox="" so nothing in the email body can execute here. */}
        <iframe
          title="Invoice email preview"
          srcDoc={invoice.staged_email_body}
          sandbox=""
          style={{ width: '100%', height: 400, border: '1px solid var(--border)', borderRadius: 6, background: '#fff' }}
        />

        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 10 }}>{err}</div>}

        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10 }}>
          The invoice already exists in Stripe. Sending emails this to the billing contact.
        </div>

        <div className="modal-footer">
          <button className="sm" disabled={sending} onClick={onClose}>Close</button>
          <button className="primary" disabled={sending} onClick={handleSend}>
            {sending ? 'Sending…' : `Send to ${invoice.staged_email_to}`}
          </button>
        </div>
      </div>
    </div>
  )
}
