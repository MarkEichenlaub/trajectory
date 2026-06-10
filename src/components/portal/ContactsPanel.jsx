import { useState } from 'react'
import {
  addMyContact, updateMyContact, deleteMyContact,
  fetchStudentContacts, saveStudentContact, updateStudentContact, deleteStudentContact,
  sendContactVerification,
} from '../../utils/supabase'
import { makeContactLocks } from '../../utils/contacts'
import InvoiceList from './InvoiceList'

const CONTACT_TOGGLES = [
  ['receives_meets', 'Meet invites'],
  ['receives_reports', 'Progress reports'],
  ['receives_invoices', 'Invoices'],
  ['receives_assignments', 'Assignments'],
  ['receives_assignment_reminders', 'Assignment reminders'],
]

function ContactsPanel({ studentId, contacts, setContacts, isAdmin, canBill, isStudentRole, invoices, setInvoices }) {
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState(isStudentRole ? 'student' : 'parent')
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState(null)
  const [verifyingId, setVerifyingId] = useState(null)
  const [notice, setNotice] = useState(null)

  // Students never see the invoice-routing toggle (billing is hidden from them).
  const toggles = canBill ? CONTACT_TOGGLES : CONTACT_TOGGLES.filter(([f]) => f !== 'receives_invoices')

  // A student may only manage student-labelled contacts; parent contacts are
  // read-only for them (they can see what a parent receives, not change it).
  const canEditContact = (c) => !isStudentRole || c.label === 'student'

  // Mirror the DB invariant trigger: an active student must keep >=1 verified
  // meet recipient, >=1 invoice recipient, >=1 login-capable contact. Disable
  // the controls that would drop the last one (the trigger is the real guard).
  const { deleteLocked, toggleLocked } = makeContactLocks(contacts)

  async function handleAdd() {
    if (adding || !newEmail.trim()) return
    setAdding(true)
    setErr(null)
    setNotice(null)
    try {
      const row = {
        student_id: studentId,
        email: newEmail.trim().toLowerCase(),
        label: isStudentRole ? 'student' : newLabel,
        receives_meets: true,
        receives_reports: true,
        receives_invoices: false,
        can_login: isAdmin,
      }
      let newId
      if (isAdmin) {
        await saveStudentContact(row)
        const fresh = await fetchStudentContacts(studentId)
        setContacts(fresh)
        newId = fresh.find(c => c.email === row.email)?.id
      } else {
        const contact = await addMyContact(row)
        setContacts(prev => [...prev, contact])
        newId = contact.id
      }
      setNewEmail('')
      // New addresses are held until confirmed — send the verification email.
      if (newId) {
        try {
          await sendContactVerification(newId, isAdmin)
          setNotice(`Confirmation email sent to ${row.email}. They'll start receiving messages once they confirm.`)
        } catch (e) {
          setNotice(`Contact added, but the confirmation email failed to send (${e.message}). Use “Resend”.`)
        }
      }
    } catch (e) {
      setErr(e.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleResend(c) {
    setVerifyingId(c.id)
    setErr(null)
    setNotice(null)
    try {
      await sendContactVerification(c.id, isAdmin)
      setNotice(`Confirmation email re-sent to ${c.email}.`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setVerifyingId(null)
    }
  }

  // Optimistic: flip the checkbox immediately, roll back if the server says no.
  async function handleToggle(id, field, value) {
    const updateFn = isAdmin ? updateStudentContact : updateMyContact
    const prevContacts = contacts
    setErr(null)
    try {
      // Invoice routing is exclusive. Set the new recipient ON before clearing
      // the others so the count never momentarily hits 0 and trips the DB invariant.
      if (field === 'receives_invoices' && value) {
        setContacts(prev => prev.map(c => ({ ...c, receives_invoices: c.id === id })))
        await updateFn(id, { receives_invoices: true })
        for (const c of prevContacts) {
          if (c.id !== id && c.receives_invoices) {
            await updateFn(c.id, { receives_invoices: false })
          }
        }
        return
      }
      setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
      await updateFn(id, { [field]: value })
    } catch (e) {
      setContacts(prevContacts)
      setErr(e.message)
    }
  }

  async function handleDelete(id) {
    setErr(null)
    try {
      if (isAdmin) await deleteStudentContact(id)
      else await deleteMyContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Email Addresses</h3>
      {contacts.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: 16 }}>No additional email addresses.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {contacts.map(c => (
            <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>{c.label}</span>
                  {c.bounced ? (
                    <span title={c.bounce_reason || 'email bounced'} style={{ color: 'var(--red)', fontWeight: 600 }}>● bounced</span>
                  ) : c.verified ? (
                    <span style={{ color: 'var(--green)' }}>● verified</span>
                  ) : (
                    <>
                      <span style={{ color: 'var(--yellow)' }}>● unconfirmed</span>
                      {canEditContact(c) && (
                        <button className="sm" style={{ fontSize: 10, padding: '0 5px' }} disabled={verifyingId === c.id} onClick={() => handleResend(c)}>
                          {verifyingId === c.id ? 'Sending…' : 'Resend'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {toggles.map(([field, label]) => {
                  const locked = toggleLocked(c, field)
                  return (
                    <label key={field} title={locked ? 'An active student must keep at least one recipient here.' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: canEditContact(c) && !locked ? 'pointer' : 'default', fontSize: 12, color: c[field] ? 'var(--accent)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={!!c[field]}
                        disabled={!canEditContact(c) || locked}
                        onChange={e => handleToggle(c.id, field, e.target.checked)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
              {canEditContact(c)
                ? <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} disabled={deleteLocked(c)} title={deleteLocked(c) ? 'This is the last required recipient for an active student and cannot be removed.' : undefined} onClick={() => handleDelete(c.id)}>✕</button>
                : <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }} title="Parent contacts are managed by your parent or tutor">read-only</span>}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="email@example.com"
          style={{ flex: 1, minWidth: 200 }}
        />
        {isStudentRole ? (
          <span style={{ fontSize: 13, color: 'var(--text-dim)', padding: '6px 4px' }}>student email</span>
        ) : (
          <select
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13 }}
          >
            {isAdmin && <option value="student">student</option>}
            <option value="parent">parent</option>
            <option value="other">other</option>
          </select>
        )}
        <button className="sm primary" onClick={handleAdd} disabled={adding || !newEmail.trim()}>
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </div>
      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{err}</div>}
      {notice && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 6 }}>{notice}</div>}
      {!isAdmin && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
          Added addresses receive selected communications but cannot log in to this portal. Contact your tutor to enable login access for an email.
        </p>
      )}

      {canBill && invoices?.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Invoices</h3>
          <InvoiceList invoices={invoices} setInvoices={setInvoices} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  )
}

export default ContactsPanel
export { ContactsPanel as ContactsTab }
