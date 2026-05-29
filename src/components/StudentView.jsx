import { useState, useEffect } from 'react'
import {
  supabase,
  fetchMyContacts, addMyContact, updateMyContact, deleteMyContact,
  fetchStudentContacts, saveStudentContact, updateStudentContact, deleteStudentContact,
  fetchStudyPlans, saveStudyPlan, approvePendingPlan, rejectPendingPlan,
  fetchMyStudyPlans, proposeStudyPlan,
  fetchInvoices, fetchMyInvoices,
} from '../utils/supabase'

export default function StudentView({ student, assignments, sessions, problems, onSignOut, isPreview }) {
  const [tab, setTab] = useState('assigned')
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [tagSort, setTagSort] = useState('freq')
  const [tagSearch, setTagSearch] = useState('')
  const [contacts, setContacts] = useState([])
  const [contactsLoaded, setContactsLoaded] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [invoicesLoaded, setInvoicesLoaded] = useState(false)

  useEffect(() => {
    if (tab !== 'account' || !student?.id || contactsLoaded) return
    const load = isPreview ? fetchStudentContacts(student.id) : fetchMyContacts(student.id)
    load.then(c => { setContacts(c); setContactsLoaded(true) }).catch(console.error)
  }, [tab, student?.id, isPreview, contactsLoaded])

  useEffect(() => {
    if (tab !== 'account' || !student?.id || invoicesLoaded) return
    const load = isPreview ? fetchInvoices(student.id) : fetchMyInvoices()
    load.then(inv => { setInvoices(inv); setInvoicesLoaded(true) }).catch(console.error)
  }, [tab, student?.id, isPreview, invoicesLoaded])

  function problemById(id) {
    return problems.find(p => p.id === id)
  }

  const assignedItems = assignments
    .filter(a => a.status === 'assigned')
    .sort((a, b) => (b.assigned_date || '').localeCompare(a.assigned_date || ''))

  const completedItems = assignments
    .filter(a => a.status === 'completed')
    .sort((a, b) => (b.completed_date || b.assigned_date || '').localeCompare(a.completed_date || a.assigned_date || ''))

  const allItems = [...assignedItems, ...completedItems]
  const tabItems = tab === 'assigned' ? assignedItems : tab === 'completed' ? completedItems : allItems

  const sortedSessions = [...(sessions || [])].sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

  const now = new Date().toISOString()
  const nextSession = [...(sessions || [])]
    .filter(s => s.scheduled_at > now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0] || null

  const allTagCounts = {}
  sortedSessions.forEach(s => {
    ;(s.tags || []).forEach(tag => {
      allTagCounts[tag] = (allTagCounts[tag] || 0) + 1
    })
  })

  const filteredTagList = Object.entries(allTagCounts)
    .filter(([tag]) => tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .sort(tagSort === 'freq'
      ? ([, a], [, b]) => b - a
      : ([a], [b]) => a.localeCompare(b))

  const filteredSessions = selectedTags.size === 0
    ? sortedSessions
    : sortedSessions.filter(s => [...selectedTags].every(tag => (s.tags || []).includes(tag)))

  function toggleTag(tag) {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const tabs = [
    ['assigned', 'Assigned', assignedItems.length],
    ['completed', 'Completed', completedItems.length],
    ['all', 'All Problems', allItems.length],
    ['sessions', 'Sessions', sortedSessions.length],
    ['study-plan', 'Study Plan', null],
    ['account', 'Account', null],
  ]

  return (
    <div className="student-portal">
      <div className="sp-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1>{student?.name ? `${student.name}'s Portal` : 'My Portal'}</h1>
            <p className="sp-subtitle">
              {assignedItems.length} assigned · {completedItems.length} completed · {sortedSessions.length} sessions
              {student?.session_balance != null && (
                <span style={{
                  marginLeft: 8,
                  color: student.session_balance <= 1 ? 'var(--yellow)' : 'var(--green)',
                  fontWeight: 600,
                }}>
                  · {student.session_balance} session{student.session_balance !== 1 ? 's' : ''} remaining
                </span>
              )}
            </p>
          </div>
          {onSignOut && (
            <button className="sm" style={{ flexShrink: 0 }} onClick={onSignOut}>Sign out</button>
          )}
        </div>
      </div>

      <div className="assigned-tabs">
        {tabs.map(([key, label, count]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            {label}
            {count != null && <span className="tab-count">{count}</span>}
          </button>
        ))}
      </div>

      {tab === 'study-plan' ? (
        <StudyPlanTab
          studentId={student.id}
          studentName={student?.name || 'Student'}
          isAdmin={isPreview}
        />
      ) : tab === 'account' ? (
        <ContactsTab
          studentId={student.id}
          contacts={contacts}
          setContacts={setContacts}
          isAdmin={isPreview}
          invoices={invoices}
        />
      ) : tab === 'sessions' ? (
        sortedSessions.length === 0 ? (
          <div className="empty-state">No sessions yet.</div>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {filteredTagList.length > 0 && (
              <div style={{ width: 182, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'sticky', top: 0 }}>
                <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Topics
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['freq', 'alpha'].map(s => (
                      <button key={s} className="sm" onClick={() => setTagSort(s)}
                        style={{ flex: 1, textAlign: 'center', ...(tagSort === s ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : {}) }}>
                        {s === 'freq' ? 'By use' : 'A–Z'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '6px 10px' }}>
                  <input
                    style={{ width: '100%', fontSize: 12 }}
                    placeholder="Search…"
                    value={tagSearch}
                    onChange={e => setTagSearch(e.target.value)}
                  />
                </div>
                {selectedTags.size > 0 && (
                  <div style={{ padding: '0 10px 6px' }}>
                    <button className="sm" onClick={() => setSelectedTags(new Set())}
                      style={{ width: '100%', fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      Clear {selectedTags.size} filter{selectedTags.size > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
                <div style={{ paddingBottom: 6 }}>
                  {filteredTagList.map(([tag, count]) => (
                    <div key={tag} onClick={() => toggleTag(tag)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                        background: selectedTags.has(tag) ? 'var(--accent-dim)' : 'transparent',
                        color: selectedTags.has(tag) ? 'var(--accent)' : 'var(--text)',
                        borderLeft: `2px solid ${selectedTags.has(tag) ? 'var(--accent)' : 'transparent'}`,
                      }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4, flexShrink: 0 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredSessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>No sessions match the selected topics.</div>
              ) : filteredSessions.map(s => (
                <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: s.summary ? 8 : 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(s.scheduled_at)}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {s.miro_board_url && (
                        <a href={s.miro_board_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Whiteboard ↗</a>
                      )}
                      {s.miro_pdf_url && (
                        <a href={s.miro_pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>PDF ↗</a>
                      )}
                    </div>
                  </div>
                  {s.summary && (
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0, marginBottom: (s.tags || []).length ? 10 : 0 }}>
                      {s.summary}
                    </p>
                  )}
                  {(s.tags || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(s.tags || []).map(tag => (
                        <span key={tag} className="tag" onClick={() => toggleTag(tag)}
                          style={{
                            cursor: 'pointer',
                            ...(selectedTags.has(tag) ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}),
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ) : tabItems.length === 0 ? (
        <div className="empty-state">
          {tab === 'assigned' ? 'No problems currently assigned.'
            : tab === 'completed' ? 'No completed problems yet.'
            : 'No problems yet.'}
        </div>
      ) : (
        <div className="assigned-list">
          {tabItems.map(a => {
            const p = problemById(a.problem_id)
            if (!p) return null
            const isResource = p.type === 'Book' || p.type === 'Handout'
            const linkLabel = p.type === 'Book' ? 'Book' : p.type === 'Handout' ? 'Handout' : 'Problem'
            const dateLabel = a.status === 'completed' && a.completed_date
              ? `Completed ${a.completed_date}`
              : `Assigned ${a.assigned_date}`
            const dueLabel = a.status === 'assigned' && nextSession
              ? `Due ${formatDate(nextSession.scheduled_at)}`
              : null
            return (
              <div key={a.id} className="assigned-row">
                <span className={`status-badge ${a.status}`}>
                  {a.status === 'assigned' ? '→ Assigned' : '✓ Completed'}
                </span>
                <div className="assigned-problem-info">
                  <span className="p-label">{p.contest}{!isResource ? ` ${p.year} ${p.label}` : ''}</span>
                  <span className="p-name">{p.name}</span>
                  {a.notes && <span className="p-date" style={{ fontStyle: 'italic' }}>{a.notes}</span>}
                  <span className="p-date">{dueLabel || dateLabel}</span>
                </div>
                <div className="assigned-row-links">
                  <a href={p.problemUrl} target="_blank" rel="noreferrer">{linkLabel} ↗</a>
                  {p.solutionUrl && <a href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const CONTACT_TOGGLES = [
  ['receives_meets', 'Meet invites'],
  ['receives_reports', 'Progress reports'],
  ['receives_invoices', 'Invoices'],
  ['receives_assignments', 'Assignments'],
]

function ContactsTab({ studentId, contacts, setContacts, isAdmin, invoices }) {
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState('parent')
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState(null)

  async function handleAdd() {
    if (!newEmail.trim()) return
    setAdding(true)
    setErr(null)
    try {
      const row = {
        student_id: studentId,
        email: newEmail.trim().toLowerCase(),
        label: newLabel,
        receives_meets: true,
        receives_reports: true,
        receives_invoices: false,
        can_login: isAdmin,
      }
      if (isAdmin) {
        await saveStudentContact(row)
        setContacts(await fetchStudentContacts(studentId))
      } else {
        const contact = await addMyContact(row)
        setContacts(prev => [...prev, contact])
      }
      setNewEmail('')
    } catch (e) {
      setErr(e.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(id, field, value) {
    const updateFn = isAdmin ? updateStudentContact : updateMyContact
    if (field === 'receives_invoices' && value) {
      for (const c of contacts) {
        if (c.id !== id && c.receives_invoices) {
          await updateFn(c.id, { receives_invoices: false })
        }
      }
      setContacts(prev => prev.map(c => c.id !== id ? { ...c, receives_invoices: false } : c))
    }
    await updateFn(id, { [field]: value })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  async function handleDelete(id) {
    if (isAdmin) await deleteStudentContact(id)
    else await deleteMyContact(id)
    setContacts(prev => prev.filter(c => c.id !== id))
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
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{c.label}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {CONTACT_TOGGLES.map(([field, label]) => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, color: c[field] ? 'var(--accent)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    <input
                      type="checkbox"
                      checked={!!c[field]}
                      onChange={e => handleToggle(c.id, field, e.target.checked)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <button className="sm danger" style={{ fontSize: 11, padding: '1px 6px', flexShrink: 0 }} onClick={() => handleDelete(c.id)}>✕</button>
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
        <select
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, padding: '6px 8px', fontSize: 13 }}
        >
          {isAdmin && <option value="student">student</option>}
          <option value="parent">parent</option>
          <option value="other">other</option>
        </select>
        <button className="sm primary" onClick={handleAdd} disabled={adding || !newEmail.trim()}>
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </div>
      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{err}</div>}
      {!isAdmin && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
          Added addresses receive selected communications but cannot log in to this portal. Contact your tutor to enable login access for an email.
        </p>
      )}

      {invoices?.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Invoices</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {invoices.map(inv => (
              <div key={inv.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', width: 100, flexShrink: 0 }}>
                  {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ fontSize: 13, flex: 1 }}>
                  ${(inv.amount_cents / 100).toLocaleString()} — {inv.sessions_count} sessions
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: inv.status === 'paid' ? 'var(--green-bg)' : 'var(--yellow-bg)',
                  color: inv.status === 'paid' ? 'var(--green)' : 'var(--yellow)',
                  border: `1px solid ${inv.status === 'paid' ? 'var(--green-line)' : 'var(--yellow-line)'}`,
                }}>
                  {inv.status}
                </span>
                {inv.stripe_invoice_url && (
                  <a href={inv.stripe_invoice_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, flexShrink: 0 }}>
                    View ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StudyPlanTab({ studentId, studentName, isAdmin }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    const load = isAdmin ? fetchStudyPlans(studentId) : fetchMyStudyPlans(studentId)
    load.then(setPlans).catch(console.error).finally(() => setLoading(false))
  }, [studentId, isAdmin])

  async function reload() {
    const data = isAdmin ? await fetchStudyPlans(studentId) : await fetchMyStudyPlans(studentId)
    setPlans(data)
  }

  const activePlan = plans.find(p => p.status === 'active')
  const pendingPlan = plans.find(p => p.status === 'pending_approval')
  const archivedPlans = plans.filter(p => p.status === 'archived')

  function handleStartEdit() {
    setDraft(activePlan?.content || '')
    setEditing(true)
    setErr(null)
  }

  async function handleSave() {
    setSaving(true)
    setErr(null)
    try {
      if (isAdmin) {
        await saveStudyPlan(studentId, draft)
      } else {
        await proposeStudyPlan(studentId, draft)
        await supabase.functions.invoke('send-email', {
          body: {
            to: ['mark@eichenlaubphysics.com'],
            subject: `${studentName} proposed study plan changes`,
            body: `${studentName} has proposed changes to their study plan.\n\n---\n\n${draft}`,
          },
        })
      }
      await reload()
      setEditing(false)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleApprove() {
    await approvePendingPlan(pendingPlan.id, studentId)
    await reload()
  }

  async function handleReject() {
    await rejectPendingPlan(pendingPlan.id)
    await reload()
  }

  function formatPlanDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Pending proposal banner (admin) */}
      {isAdmin && pendingPlan && !editing && (
        <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-line)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--yellow)' }}>Student proposed changes · {formatPlanDate(pendingPlan.created_at)}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="sm primary" onClick={handleApprove}>Approve</button>
              <button className="sm danger" onClick={handleReject}>Reject</button>
            </div>
          </div>
          <pre style={{ fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{pendingPlan.content}</pre>
        </div>
      )}

      {/* Pending notice (student) */}
      {!isAdmin && pendingPlan && (
        <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-line)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--yellow)' }}>
          Your proposed changes are pending review.
        </div>
      )}

      {/* Editor */}
      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            style={{ width: '100%', height: 400, fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.7, resize: 'vertical' }}
          />
          {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="sm primary" onClick={handleSave} disabled={saving || !draft.trim()}>
              {saving ? 'Saving…' : isAdmin ? 'Save' : 'Submit for review'}
            </button>
            <button className="sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Active plan */}
          {activePlan ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Updated {formatPlanDate(activePlan.created_at)}
                </span>
                <button className="sm" onClick={handleStartEdit}>
                  {isAdmin ? 'Edit' : 'Propose changes'}
                </button>
              </div>
              <pre style={{ fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{activePlan.content}</pre>
            </div>
          ) : (
            <div className="empty-state" style={{ marginBottom: 16 }}>
              No study plan yet.
              {isAdmin && <><br /><button className="sm primary" style={{ marginTop: 10 }} onClick={handleStartEdit}>Create plan</button></>}
            </div>
          )}

          {/* History */}
          {archivedPlans.length > 0 && (
            <div>
              <button className="sm" onClick={() => setShowHistory(v => !v)} style={{ marginBottom: 10 }}>
                {showHistory ? 'Hide' : 'Show'} history ({archivedPlans.length})
              </button>
              {showHistory && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {archivedPlans.map(p => (
                    <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', opacity: 0.7 }}>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {formatPlanDate(p.created_at)} · {p.proposed_by === 'student' ? 'student proposal' : 'by mentor'}
                      </div>
                      <pre style={{ fontFamily: 'var(--font)', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{p.content}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
