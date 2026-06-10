import { useState } from 'react'
import { sendStagedInvoice } from '../../utils/supabase'

// Shared invoice list: rows + status badge + admin "Send" for staged drafts.
// Used by both InvoicesTab and ContactsPanel's billing section.
export default function InvoiceList({ invoices, setInvoices, isAdmin }) {
  const [sendingId, setSendingId] = useState(null)
  const [err, setErr] = useState(null)

  async function handleSendInvoice(inv) {
    if (!confirm(`Send the invoice email to ${inv.staged_email_to}?`)) return
    setSendingId(inv.id)
    setErr(null)
    try {
      await sendStagedInvoice(inv)
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'sent' } : i))
    } catch (e) {
      setErr(e.message)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {invoices.map(inv => (
          <div key={inv.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', width: 100, flexShrink: 0 }}>
              {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span style={{ fontSize: 13, flex: 1 }}>
              ${(inv.amount_cents / 100).toLocaleString()} — {inv.sessions_count} sessions
            </span>
            {(() => {
              let label, bg, color, line
              if (inv.status === 'paid') {
                label = 'paid'; bg = 'var(--green-bg)'; color = 'var(--green)'; line = 'var(--green-line)'
              } else if (inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()) {
                label = 'overdue'; bg = 'var(--red-bg)'; color = 'var(--red)'; line = 'var(--red-line)'
              } else if (inv.status === 'sent') {
                label = 'due'; bg = 'var(--yellow-bg)'; color = 'var(--yellow)'; line = 'var(--yellow-line)'
              } else {
                label = inv.status === 'draft' ? 'draft — review' : inv.status
                bg = 'var(--yellow-bg)'; color = 'var(--yellow)'; line = 'var(--yellow-line)'
              }
              return (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: bg, color, border: `1px solid ${line}` }}>
                  {label}
                </span>
              )
            })()}
            {inv.stripe_invoice_url && (
              <a href={inv.stripe_invoice_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, flexShrink: 0 }}>
                {inv.status === 'draft' ? 'Open in Stripe ↗' : 'View ↗'}
              </a>
            )}
            {isAdmin && inv.status === 'draft' && inv.staged_email_body && (
              <button
                className="sm primary"
                style={{ fontSize: 11, flexShrink: 0 }}
                disabled={sendingId === inv.id}
                onClick={() => handleSendInvoice(inv)}
              >
                {sendingId === inv.id ? 'Sending…' : 'Send'}
              </button>
            )}
          </div>
        ))}
      </div>
      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{err}</div>}
    </>
  )
}
