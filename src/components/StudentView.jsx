import { useState, useEffect, useMemo } from 'react'
import {
  supabase,
  fetchMyContacts, fetchMyContactsView, addMyContact, updateMyContact, deleteMyContact,
  fetchStudentContacts, saveStudentContact, updateStudentContact, deleteStudentContact,
  sendContactVerification,
  fetchInvoices, fetchMyInvoices, sendStagedInvoice,
  fetchMyProgressReports,
  createInvite, setStudentStatus, cancelUpcomingSessions,
  markMyProblemCompleted,
} from '../utils/supabase'
import FilterSidebar from './FilterSidebar'

export default function StudentView({ student, assignments, sessions, problems, accessibleSources, onMarkCompleted, onSignOut, isPreview, previewRole, account }) {
  // Billing (sessions-remaining, invoices, invoice routing) is visible only to
  // billing-capable roles. A logged-in student sees study info only. In admin
  // preview the role is chosen via previewRole, so Mark can see exactly what a
  // student / parent / adult sees; isPreview also switches reads to the admin
  // source and disables side-effecting actions.
  const role = isPreview ? (previewRole || 'student') : (account?.role || 'student')
  const canBill = role === 'parent' || role === 'adult'
  const isStudentRole = role === 'student'

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
    // Admin preview → full rows; billing-capable → full rows incl invoice flags;
    // student → RPC view that omits invoice routing.
    const load = isPreview
      ? fetchStudentContacts(student.id)
      : isStudentRole
        ? fetchMyContactsView(student.id)
        : fetchMyContacts(student.id)
    load.then(c => { setContacts(c); setContactsLoaded(true) }).catch(console.error)
  }, [tab, student?.id, isPreview, isStudentRole, contactsLoaded])

  useEffect(() => {
    if ((tab !== 'account' && tab !== 'invoices') || !student?.id || invoicesLoaded || !canBill) return
    const load = isPreview ? fetchInvoices(student.id) : fetchMyInvoices()
    load.then(inv => { setInvoices(inv); setInvoicesLoaded(true) }).catch(console.error)
  }, [tab, student?.id, isPreview, canBill, invoicesLoaded])

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

  // Problem bank: accessible sources + any assigned/completed problems
  const bankProblems = useMemo(() => {
    const accessibleSet = new Set(accessibleSources || [])
    const assignedIds = new Set(assignments.map(a => a.problem_id))
    return problems.filter(p => accessibleSet.has(p.contest) || assignedIds.has(p.id))
  }, [problems, accessibleSources, assignments])

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
    ['all', 'All Problems', bankProblems.length],
    ['sessions', 'Sessions', sortedSessions.length],
    ['scheduling', 'Scheduling', null],
    ['progress-plan', 'Progress and Plan', null],
    ...(canBill ? [['invoices', 'Invoices', null]] : []),
    ['account', 'Account', null],
  ]

  const schedulePrefill = {
    name: student?.name || '',
    email: (isPreview ? student?.email : account?.email) || '',
  }

  return (
    <div className="student-portal">
      <div className="sp-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1>{student?.name ? `${student.name}'s Portal` : 'My Portal'}</h1>
            <p className="sp-subtitle">
              {assignedItems.length} assigned · {completedItems.length} completed · {sortedSessions.length} sessions
              {canBill && student?.session_balance != null && (
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

      {tab === 'progress-plan' ? (
        <ProgressAndPlanTab studentId={student.id} />
      ) : tab === 'scheduling' ? (
        <SchedulingTab prefill={schedulePrefill} sessions={sortedSessions} formatDate={formatDate} />
      ) : tab === 'invoices' ? (
        <InvoicesTab invoices={invoices} setInvoices={setInvoices} isAdmin={isPreview} />
      ) : tab === 'account' ? (
        <>
          {canBill && (
            <AccountManagement
              student={student}
              relationship={isPreview ? (role === 'parent' ? 'parent' : 'self') : account?.students?.find(s => s.id === student.id)?.relationship}
              isPreview={isPreview}
            />
          )}
          <ContactsTab
            studentId={student.id}
            contacts={contacts}
            setContacts={setContacts}
            isAdmin={isPreview}
            canBill={canBill}
            isStudentRole={isStudentRole}
          />
        </>
      ) : tab === 'all' ? (
        <ProblemBankBrowser
          bankProblems={bankProblems}
          assignments={assignments}
          student={student}
          onMarkCompleted={onMarkCompleted}
          isPreview={isPreview}
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
            : 'No completed problems yet.'}
        </div>
      ) : (
        <div className="assigned-list">
          {tabItems.map(a => {
            const p = problemById(a.problem_id)
            if (!p) return null
            const isResource = p.type === 'Book' || p.type === 'Handout' || p.type === 'Exam'
            const linkLabel = p.type === 'Book' ? 'Book' : p.type === 'Handout' ? 'Handout' : p.type === 'Exam' ? 'Exam' : 'Problem'
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

const DEFAULT_BANK_FILTERS = {
  contests: new Set(),
  types: new Set(),
  topics: new Set(),
  statuses: new Set(),
  selectedTags: new Set(),
  textSearch: '',
  hideCompleted: false,
}

function ProblemBankBrowser({ bankProblems, assignments, student, onMarkCompleted, isPreview }) {
  const [filters, setFilters] = useState(DEFAULT_BANK_FILTERS)
  const [sortCol, setSortCol] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [markingDoneId, setMarkingDoneId] = useState(null)

  const statusMap = useMemo(() => {
    const map = {}
    assignments.forEach(a => { map[a.problem_id] = a.status })
    return map
  }, [assignments])

  const preTagFiltered = useMemo(() => bankProblems.filter(p => {
    if (filters.contests.size > 0 && !filters.contests.has(p.contest)) return false
    if (filters.types.size > 0 && !filters.types.has(p.type)) return false
    if (filters.topics.size > 0 && !p.topics.some(t => filters.topics.has(t))) return false
    if (filters.hideCompleted && statusMap[p.id] === 'completed') return false
    if (filters.statuses.size > 0) {
      const s = statusMap[p.id] || 'not-started'
      if (!filters.statuses.has(s)) return false
    }
    if (filters.textSearch) {
      const q = filters.textSearch.toLowerCase()
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.desc.toLowerCase().includes(q) &&
        !p.tags.some(t => t.toLowerCase().includes(q)) &&
        !(p.year ? String(p.year).includes(q) : false) &&
        !(p.country || '').toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [bankProblems, filters, statusMap])

  const filtered = useMemo(() => {
    if (filters.selectedTags.size === 0) return preTagFiltered
    return preTagFiltered.filter(p =>
      [...filters.selectedTags].every(tag => p.tags.includes(tag))
    )
  }, [preTagFiltered, filters.selectedTags])

  const sorted = useMemo(() => {
    const statusOrder = { assigned: 0, 'not-started': 1, completed: 2 }
    return [...filtered].sort((a, b) => {
      let av, bv
      if (sortCol === 'status') {
        av = statusOrder[statusMap[a.id] || 'not-started']
        bv = statusOrder[statusMap[b.id] || 'not-started']
      } else {
        av = a[sortCol]; bv = b[sortCol]
        if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortCol, sortDir, statusMap])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir(col === 'year' ? 'desc' : 'asc') }
  }

  async function handleMarkDone(problemId) {
    if (!student?.id || !onMarkCompleted || isPreview) return
    setMarkingDoneId(problemId)
    try {
      const result = await markMyProblemCompleted(student.id, problemId)
      if (result) onMarkCompleted(result)
    } catch (e) {
      console.error('Failed to mark done:', e)
    } finally {
      setMarkingDoneId(null)
    }
  }

  if (bankProblems.length === 0) {
    return (
      <div className="empty-state">
        No problem bank configured yet. Your tutor will add accessible sources.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
      <FilterSidebar
        problems={bankProblems}
        filteredProblems={preTagFiltered}
        filters={filters}
        setFilters={setFilters}
        statusMap={statusMap}
      />
      <div className="problem-area" style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
        <div className="search-bar">
          <input
            placeholder="Search problems, tags, countries…"
            value={filters.textSearch}
            onChange={e => setFilters(f => ({ ...f, textSearch: e.target.value }))}
          />
          <span className="result-count">{sorted.length} problem{sorted.length !== 1 ? 's' : ''}</span>
        </div>
        {sorted.length === 0 ? (
          <div className="empty-state">No problems match the current filters.</div>
        ) : (
          <div className="problem-table-wrap">
            <table style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ width: 80, cursor: 'pointer' }} onClick={() => handleSort('status')}>
                    Status {sortCol === 'status' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ width: 56, cursor: 'pointer' }} onClick={() => handleSort('year')}>
                    Year {sortCol === 'year' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ width: 48 }}>#</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Problem {sortCol === 'name' && <span className="sort-icon">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th style={{ width: 170 }}>Topics</th>
                  <th style={{ width: 88 }}>Links</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => {
                  const status = statusMap[p.id]
                  const isResource = p.type === 'Book' || p.type === 'Handout' || p.type === 'Exam'
                  const isCompleted = status === 'completed'
                  return (
                    <tr key={p.id} className={isCompleted ? 'done' : status === 'assigned' ? 'assigned-row-tr' : ''}>
                      <td>
                        {status === 'assigned' && <span className="status-badge assigned">→ Assigned</span>}
                        {status === 'completed' && <span className="status-badge completed">✓ Done</span>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {isResource
                          ? <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 500 }}>{p.contest}</span>
                          : <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.year}</span>
                        }
                      </td>
                      <td>
                        {!isResource && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{p.label}</span>}
                      </td>
                      <td>
                        <div className="problem-name">{p.name}</div>
                        {!isResource && <div className="problem-desc">{p.desc}</div>}
                      </td>
                      <td>
                        <div className="tag-list">
                          {(p.topics || []).map(t => <span key={t} className="tag topic">{t}</span>)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {p.problemUrl && (
                            <a className="pdf-link" href={p.problemUrl} target="_blank" rel="noreferrer">
                              {p.type === 'Exam' ? 'Exam ↗' : isResource ? 'PDF ↗' : 'Problem ↗'}
                            </a>
                          )}
                          {p.solutionUrl && <a className="pdf-link" href={p.solutionUrl} target="_blank" rel="noreferrer">Solution ↗</a>}
                        </div>
                      </td>
                      <td>
                        {!isCompleted && !isPreview && onMarkCompleted && (
                          <button
                            className="sm"
                            style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                            disabled={markingDoneId === p.id}
                            onClick={() => handleMarkDone(p.id)}
                          >
                            {markingDoneId === p.id ? '…' : 'Mark done'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Parent/adult self-service: invite another guardian and pause/resume the
// student. Both go through server-authorized paths (create-invite edge function
// and set_student_status RPC), which verify billing access.
function AccountManagement({ student, relationship, isPreview }) {
  const [status, setStatus] = useState(student?.status || 'active')
  const [busy, setBusy] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  async function handleToggleStatus() {
    const next = status === 'active' ? 'inactive' : 'active'
    setBusy(true); setErr(null); setMsg(null)
    try {
      await setStudentStatus(student.id, next)
      if (next === 'inactive') await cancelUpcomingSessions(student.id)
      setStatus(next)
      setMsg(next === 'inactive'
        ? `${student.name} is paused — upcoming sessions cancelled, automated emails and invoicing will stop.`
        : `${student.name} is active again.`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleInvite() {
    const addr = inviteEmail.trim().toLowerCase()
    if (!addr) return
    setSending(true); setErr(null); setMsg(null)
    try {
      await createInvite({ student_id: student.id, email: addr, relationship: 'parent', account_type: 'parent' })
      setInviteEmail('')
      setMsg(`Invitation sent to ${addr}. They'll get access by signing in with that email.`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Account</h3>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, flex: 1, minWidth: 180 }}>
            Status: <strong style={{ color: status === 'active' ? 'var(--green)' : 'var(--text-dim)' }}>{status}</strong>
          </span>
          <button className="sm" disabled={busy || isPreview} onClick={handleToggleStatus}>
            {busy ? '…' : status === 'active' ? 'Pause tutoring' : 'Resume tutoring'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '8px 0 0', lineHeight: 1.5 }}>
          Pausing cancels all upcoming sessions and stops automated emails and invoicing.
        </p>
      </div>

      {relationship !== 'self' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Invite another parent or guardian</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="email@example.com"
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="sm primary" disabled={sending || isPreview || !inviteEmail.trim()} onClick={handleInvite}>
              {sending ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </div>
      )}

      {isPreview && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>Preview only — actions are disabled.</div>}
      {msg && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>{msg}</div>}
      {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{err}</div>}
    </div>
  )
}

const CONTACT_TOGGLES = [
  ['receives_meets', 'Meet invites'],
  ['receives_reports', 'Progress reports'],
  ['receives_invoices', 'Invoices'],
  ['receives_assignments', 'Assignments'],
]

export function ContactsTab({ studentId, contacts, setContacts, isAdmin, canBill, isStudentRole, invoices, setInvoices }) {
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState(isStudentRole ? 'student' : 'parent')
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState(null)
  const [sendingId, setSendingId] = useState(null)
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
  const verifiedMeetIds = contacts.filter(c => c.verified && c.receives_meets).map(c => c.id)
  const invoiceIds = contacts.filter(c => c.receives_invoices).map(c => c.id)
  const loginIds = contacts.filter(c => c.can_login).map(c => c.id)
  const isLastVerifiedMeet = (c) => verifiedMeetIds.length === 1 && verifiedMeetIds[0] === c.id
  const isLastInvoice = (c) => invoiceIds.length === 1 && invoiceIds[0] === c.id
  const isLastLogin = (c) => loginIds.length === 1 && loginIds[0] === c.id
  const deleteLocked = (c) => isLastVerifiedMeet(c) || isLastInvoice(c) || isLastLogin(c)
  const toggleLocked = (c, field) =>
    (field === 'receives_meets' && isLastVerifiedMeet(c)) ||
    (field === 'receives_invoices' && isLastInvoice(c))

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

  async function handleAdd() {
    if (!newEmail.trim()) return
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

  async function handleToggle(id, field, value) {
    const updateFn = isAdmin ? updateStudentContact : updateMyContact
    // Invoice routing is exclusive. Set the new recipient ON before clearing the
    // others so the count never momentarily hits 0 and trips the DB invariant.
    if (field === 'receives_invoices' && value) {
      await updateFn(id, { receives_invoices: true })
      for (const c of contacts) {
        if (c.id !== id && c.receives_invoices) {
          await updateFn(c.id, { receives_invoices: false })
        }
      }
      setContacts(prev => prev.map(c => ({ ...c, receives_invoices: c.id === id })))
      return
    }
    await updateFn(id, { [field]: value })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
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
        </div>
      )}
    </div>
  )
}

function InvoicesTab({ invoices, setInvoices, isAdmin }) {
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

  if (!invoices || invoices.length === 0) {
    return <div className="empty-state">No invoices yet.</div>
  }

  return (
    <div>
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
    </div>
  )
}

// Cal.com booking config. calLink is the public booking handle; namespace
// isolates this embed instance. Reschedule/cancel links use a session's stored
// cal_uid (the booking's string UID, written by the cal-webhook function).
const CAL_LINK = 'markeichenlaub'
const CAL_NAMESPACE = 'tutoring'
const CAL_BRAND = '#2a4a6d'

// Vanilla Cal.com embed loader. Injects the embed script once and returns the
// queueing Cal() shim; safe to call on every mount.
function loadCalApi() {
  const C = window
  const A = 'https://app.cal.com/embed/embed.js'
  const L = 'init'
  const p = (a, ar) => { a.q.push(ar) }
  const d = C.document
  C.Cal = C.Cal || function () {
    const cal = C.Cal
    const ar = arguments
    if (!cal.loaded) {
      cal.ns = {}
      cal.q = cal.q || []
      d.head.appendChild(d.createElement('script')).src = A
      cal.loaded = true
    }
    if (ar[0] === L) {
      const api = function () { p(api, arguments) }
      const namespace = ar[1]
      api.q = api.q || []
      if (typeof namespace === 'string') {
        cal.ns[namespace] = cal.ns[namespace] || api
        p(cal.ns[namespace], ar)
        p(cal, ['initNamespace', namespace])
      } else p(cal, ar)
      return
    }
    p(cal, ar)
  }
  return C.Cal
}

function SchedulingTab({ prefill, sessions, formatDate }) {
  useEffect(() => {
    const Cal = loadCalApi()
    Cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' })
    const config = { layout: 'month_view' }
    if (prefill?.name) config.name = prefill.name
    if (prefill?.email) config.email = prefill.email
    Cal.ns[CAL_NAMESPACE]('inline', {
      elementOrSelector: '#cal-inline-tutoring',
      calLink: `${CAL_LINK}/1-hr-session`,
      config,
    })
    Cal.ns[CAL_NAMESPACE]('ui', {
      cssVarsPerTheme: { light: { 'cal-brand': CAL_BRAND } },
      hideEventTypeDetails: false,
      layout: 'month_view',
    })
  }, [prefill?.name, prefill?.email])

  const now = new Date().toISOString()
  const upcoming = (sessions || [])
    .filter(s => s.scheduled_at > now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {upcoming.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Upcoming sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(s => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, flex: 1, minWidth: 160 }}>{formatDate(s.scheduled_at)}</span>
                {s.cal_uid ? (
                  <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
                    <a href={`https://cal.com/reschedule/${s.cal_uid}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Reschedule ↗</a>
                    <a href={`https://cal.com/booking/${s.cal_uid}?cancel=true`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--red)' }}>Cancel ↗</a>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>scheduled manually</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Book a session</h3>
        <div id="cal-inline-tutoring" style={{ width: '100%', minHeight: 600, overflow: 'scroll' }} />
      </div>
    </div>
  )
}

function ProgressAndPlanTab({ studentId }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    // fetchMyProgressReports() returns all rows the caller's RLS allows
    // (admin sees every student), so scope to this student client-side.
    fetchMyProgressReports()
      .then(r => setReports(r.filter(rep => rep.student_id === studentId)))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  function fmt(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>Loading…</div>

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Progress and Plan</h3>
        {reports.length === 0 ? (
          <div className="empty-state">No reports yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reports.map(r => (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{fmt(r.created_at)}</div>
                </div>
                {r.pdf_url && (
                  <a href={r.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, flexShrink: 0 }}>Download ↗</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

