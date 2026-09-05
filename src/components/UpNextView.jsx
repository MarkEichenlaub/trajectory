import { useMemo, useState } from 'react'
import { buildCourseSequence, computeUpNext, courseNamesWithSequence } from '../utils/lessonSequence'

const KIND_LABEL = { handout: 'Handout', script: 'Class Problems', homework: 'Homework' }
const DEFAULT_VISIBLE = 9 // ~3 lessons' worth

function PENDING_LABEL(handout) {
  if (handout.status === 'building' || handout.status === 'requested') return 'Building…'
  if (handout.status === 'failed') return 'Build failed'
  return 'Awaiting your review'
}

function ItemRow({ item, selected, onToggle }) {
  const title = item.handout?.name || `${item.lessonName} ${KIND_LABEL[item.kind]}`
  const sunk = item.state === 'completed'
  return (
    <div className={`assigned-row upnext-row${sunk ? ' upnext-sunk' : ''}`}>
      {item.state === 'ready'
        ? <input type="checkbox" checked={selected} onChange={() => onToggle(item.handout.id)} />
        : <span className="upnext-checkbox-spacer" />}
      <div className="assigned-problem-info">
        <span className="p-label">{item.label} · {KIND_LABEL[item.kind]}</span>
        <span className="p-name">{title}</span>
      </div>
      {item.state === 'completed' && (
        <span className="status-badge completed">Completed {item.assignment.completed_date || ''}</span>
      )}
      {item.state === 'in_progress' && (
        <span className="status-badge assigned">Assigned {item.assignment.assigned_date || ''}</span>
      )}
      {item.state === 'pending' && (
        <span className="status-badge upnext-pending">{PENDING_LABEL(item.handout)}</span>
      )}
      {item.state === 'missing' && <span className="upnext-missing">Not built yet</span>}
      {item.state === 'ready' && <span className="status-badge upnext-ready">Ready</span>}
    </div>
  )
}

function CourseSection({ course, items, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const visible = items.filter(it => it.state !== 'completed')
  const completed = items.filter(it => it.state === 'completed')
  const shown = expanded ? visible : visible.slice(0, DEFAULT_VISIBLE)
  const hiddenCount = visible.length - shown.length

  return (
    <div className="upnext-course">
      <h3>{course}</h3>
      <div className="assigned-list">
        {shown.map(item => (
          <ItemRow key={item.key} item={item} selected={selected.has(item.handout?.id)} onToggle={onToggle} />
        ))}
      </div>
      {(hiddenCount > 0 || (!expanded && completed.length > 0)) && (
        <button className="sm upnext-expand" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show less' : `Show ${hiddenCount > 0 ? `${hiddenCount} more` : `${completed.length} completed`}`}
        </button>
      )}
      {expanded && completed.length > 0 && (
        <div className="assigned-list" style={{ marginTop: 8 }}>
          {completed.map(item => (
            <ItemRow key={item.key} item={item} selected={false} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

// The next handout / class-problems packet / homework packet to assign a
// student, in the fixed order a linear AoPS course moves through them —
// completed work and stale leftovers sink to the bottom so the top of the
// list is always what's next.
export default function UpNextView({ student, aopsProblems, handouts, assignments, onAssign }) {
  const [selected, setSelected] = useState(new Set())

  const sections = useMemo(() => {
    if (!student) return []
    return courseNamesWithSequence(aopsProblems)
      .map(course => {
        const lessons = buildCourseSequence(aopsProblems, course)
        const items = computeUpNext(lessons, handouts, assignments, student.id)
        return { course, items }
      })
      .filter(({ items }) => items.some(it => it.state !== 'missing'))
  }, [student, aopsProblems, handouts, assignments])

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAssignClick() {
    onAssign([...selected])
    setSelected(new Set())
  }

  if (!student) return <div className="assigned-view"><div className="empty-state">No student selected.</div></div>

  return (
    <div className="assigned-view upnext-view">
      <div className="assigned-header">
        <h2>Up Next for {student.name}</h2>
      </div>
      {sections.length === 0 && (
        <div className="empty-state">No linear course sequence found for {student.name} yet.</div>
      )}
      {sections.map(({ course, items }) => (
        <CourseSection key={course} course={course} items={items} selected={selected} onToggle={toggle} />
      ))}
      {selected.size > 0 && (
        <div className="upnext-action-bar">
          <span className="sel-count">{selected.size} selected</span>
          <button className="sm primary" onClick={handleAssignClick}>Assign to {student.name}</button>
        </div>
      )}
    </div>
  )
}
