import { useState, useEffect, useCallback } from 'react'
import {
  fetchFluencySkills, fetchFluencyStudentSkills, fetchFluencySkillState, fetchFluencyAttempts,
  setFluencyPracticeEnabled, setFluencyStudentSkillEnabled,
  addFluencySkillNote, fetchFluencySkillNotes, resolveFluencySkillNote,
} from '../utils/supabase'

// Mark's tagging + oversight tool: turn the feature on for a student, choose
// which skills are in their active rotation, jot a quick note during/after a
// session about a hesitation that doesn't have a generator yet, and review
// what a student has actually been doing. See "Leo fluency" design spec,
// open question #3 (tagging workflow) — this is the "quick admin form" answer.
export default function AdminFluencyView({ studentId, studentName, enabled, onEnabledChange }) {
  const [skills, setSkills] = useState([])
  const [studentSkills, setStudentSkills] = useState([])
  const [state, setState] = useState({})
  const [attempts, setAttempts] = useState([])
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setErr(null)
    try {
      const [sk, ss, st, at, no] = await Promise.all([
        fetchFluencySkills(), fetchFluencyStudentSkills(studentId),
        fetchFluencySkillState(studentId), fetchFluencyAttempts(studentId, 40),
        fetchFluencySkillNotes(studentId),
      ])
      setSkills(sk)
      setStudentSkills(ss)
      setState(Object.fromEntries(st.map(s => [s.skill_id, s])))
      setAttempts(at)
      setNotes(no)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  async function toggleEnabled() {
    setBusy(true)
    try {
      await setFluencyPracticeEnabled(studentId, !enabled)
      onEnabledChange?.(!enabled)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  async function toggleSkill(skillId, currentlyOn) {
    setStudentSkills(prev => {
      const has = prev.some(s => s.skill_id === skillId)
      return has
        ? prev.map(s => s.skill_id === skillId ? { ...s, enabled: !currentlyOn } : s)
        : [...prev, { student_id: studentId, skill_id: skillId, enabled: !currentlyOn }]
    })
    try {
      await setFluencyStudentSkillEnabled(studentId, skillId, !currentlyOn)
    } catch (e) {
      setErr(e.message)
      load()
    }
  }

  async function submitNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    setBusy(true)
    try {
      await addFluencySkillNote(studentId, noteText.trim())
      setNoteText('')
      setNotes(await fetchFluencySkillNotes(studentId))
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  async function toggleResolved(note) {
    try {
      await resolveFluencySkillNote(note.id, note.resolved ? null : note.resolved_skill_id)
      setNotes(await fetchFluencySkillNotes(studentId))
    } catch (e) { setErr(e.message) }
  }

  if (!studentId) return <div className="empty-state">Select a student first.</div>

  const enabledIds = new Set(studentSkills.filter(s => s.enabled).map(s => s.skill_id))

  return (
    <div className="admin-pane" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Fluency Practice — {studentName}</h3>
        <button className="sm" disabled={busy}
          style={{ color: enabled ? 'var(--green)' : 'var(--text-dim)' }}
          onClick={toggleEnabled}>
          {enabled ? '● on' : '○ off'}
        </button>
      </div>

      <form onSubmit={submitNote} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Quick skill note</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>
          Jot what {studentName} hesitated on — a generator gets built for it later.
        </div>
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
          placeholder="e.g. sign of exponent when dividing negative powers"
          rows={2} style={{ width: '100%', marginBottom: 8 }} />
        <button className="sm primary" disabled={busy || !noteText.trim()} type="submit">Log note</button>
      </form>

      {notes.filter(n => !n.resolved).length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-dim)' }}>Unresolved notes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {notes.filter(n => !n.resolved).map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 12 }}>
                <button className="sm" style={{ padding: '1px 6px' }} onClick={() => toggleResolved(n)} title="Mark resolved">✓</button>
                <span>{n.note}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading…</div>
      ) : (
        <>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-dim)' }}>Active rotation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {skills.map(skill => {
                const on = enabledIds.has(skill.id)
                const st = state[skill.id]
                return (
                  <label key={skill.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer',
                  }}>
                    <input type="checkbox" checked={on} onChange={() => toggleSkill(skill.id, on)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{skill.description}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
                      {st ? `level ${st.level} · ${st.correct_count}/${st.attempt_count}` : 'not started'}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-dim)' }}>Recent attempts</div>
            {attempts.length === 0 ? (
              <div className="empty-state">No attempts yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
                {attempts.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 10, fontSize: 12, alignItems: 'center' }}>
                    <span style={{ color: a.is_correct ? 'var(--green)' : 'var(--red)', fontWeight: 700, width: 14 }}>{a.is_correct ? '✓' : '✕'}</span>
                    <span style={{ flex: 1 }}>{a.fluency_skills?.name || a.skill_id}</span>
                    <span style={{ color: 'var(--text-dim)' }}>L{a.level_before}→{a.level_after}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{a.mode}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{new Date(a.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
