// Some AoPS courses (so far "Physics 1: Mechanics") move a student straight
// through a fixed sequence of lessons, each with up to three assignable
// pieces in a fixed order: the lesson handout, its script (in-class)
// problems bundled into one packet, then its homework problems bundled into
// one packet. This derives that sequence from the AoPS problem data and
// matches it against whatever packets already exist in the handouts table,
// so the portal can show a student's "up next" queue instead of making Mark
// hunt through the full problem browser.

const SLOT_KINDS = ['handout', 'script', 'homework']

// One entry per lesson code (e.g. "MCH05"), in course order, for one course.
export function buildCourseSequence(aopsProblems, courseName) {
  const byLabel = new Map()
  for (const p of aopsProblems) {
    if (p.contest !== courseName || !p.label) continue
    if (!byLabel.has(p.label)) {
      const name = (p.lesson || '').slice((p.lesson || '').indexOf(':') + 1).trim()
      byLabel.set(p.label, { label: p.label, week: p.week, name, scriptIds: new Set(), homeworkIds: new Set() })
    }
    const lesson = byLabel.get(p.label)
    if (p.source === 'script') lesson.scriptIds.add(p.id)
    else if (p.source === 'homework') lesson.homeworkIds.add(p.id)
  }
  return [...byLabel.values()].sort((a, b) => a.week - b.week)
}

// Every distinct course that has a lesson sequence at all.
export function courseNamesWithSequence(aopsProblems) {
  return [...new Set(aopsProblems.filter(p => p.label).map(p => p.contest))]
}

// Which handouts-table row (any status) fills a lesson's handout/script/
// homework slot, matched by id convention first, then by which problems it
// packages (for older rows built by hand under an arbitrary title).
function matchSlot(handouts, lesson, kind) {
  if (kind === 'handout') {
    return handouts.find(h => h.id === `handout-${lesson.label.toLowerCase()}`) || null
  }
  const candidates = handouts.filter(h => (h.tags || []).includes(lesson.label))
  const bySuffix = candidates.find(h => h.id.endsWith(`-${kind}`))
  if (bySuffix) return bySuffix
  const idSet = kind === 'script' ? lesson.scriptIds : lesson.homeworkIds
  return candidates.find(h => {
    const ids = h.request?.problem_ids
    return ids && ids.length > 0 && ids.every(id => idSet.has(id))
  }) || null
}

function slotState(handout, studentId, assignments) {
  if (!handout) return { state: 'missing', handout: null, assignment: null }
  if (handout.status && handout.status !== 'active') {
    return { state: 'pending', handout, assignment: null }
  }
  const assignment = assignments.find(a => a.student_id === studentId && a.problem_id === handout.id)
  if (!assignment) return { state: 'ready', handout, assignment: null }
  if (assignment.status === 'completed') return { state: 'completed', handout, assignment }
  return { state: 'in_progress', handout, assignment }
}

// Flattened, ordered list of {label, week, lessonName, kind, state, handout,
// assignment} across every lesson in the sequence — completed items, and any
// never-assigned item from before the student's current lesson (a leftover
// that never got assigned in the normal flow, e.g. an early handout that was
// skipped), sink to the bottom so the top of the list is always what's next.
export function computeUpNext(lessons, handouts, assignments, studentId) {
  const items = lessons.flatMap(lesson =>
    SLOT_KINDS.map(kind => ({
      key: `${lesson.label}-${kind}`,
      label: lesson.label,
      week: lesson.week,
      lessonName: lesson.name,
      kind,
      ...slotState(matchSlot(handouts, lesson, kind), studentId, assignments),
    }))
  )
  const touchedWeeks = items
    .filter(it => it.state === 'completed' || it.state === 'in_progress')
    .map(it => it.week)
  const frontier = touchedWeeks.length ? Math.max(...touchedWeeks) : -Infinity
  const sinkRank = it => (it.state === 'completed' ? 2 : it.week < frontier ? 1 : 0)
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => sinkRank(a.item) - sinkRank(b.item) || a.i - b.i)
    .map(({ item }) => item)
}
