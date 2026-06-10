import { fetchJSON } from './github'
import { fetchHandouts } from './supabase'

const COURSE_PREFIX_MAP = {
  MCH: 'Mechanics',
}

// Lesson-code tags like MCH01, PW101, I2P03, FMA02
export const LESSON_CODE_RE = /^[A-Za-z][A-Za-z0-9]{0,4}\d{1,3}$/

function formatLesson(lesson) {
  if (!lesson) return lesson
  const m = lesson.match(/^([A-Z]+)(\d+):\s*(.*)$/)
  if (!m) return lesson
  const [, prefix, num, title] = m
  const courseName = COURSE_PREFIX_MAP[prefix]
  if (!courseName) return lesson
  return `${courseName} ${parseInt(num)}: ${title}`
}

// Normalized "source" for a handouts-table row: summary / handout / book / exam.
export function handoutSource(h) {
  if (h.resource_type === 'summary' || (h.tags || []).includes('summary')) return 'summary'
  if (h.resource_type === 'book') return 'book'
  if (h.resource_type === 'exam') return 'exam'
  return 'handout'
}

// If a handout row carries a lesson-code tag (e.g. MCH04), use it as its label
// so the Course → Week filters can pick it up alongside the AoPS records.
export function handoutLessonLabel(h) {
  return (h.tags || []).find(t => LESSON_CODE_RE.test(t)) || ''
}

// Map a handouts-table row into the same shape as the static problem entries,
// so handouts/books/exams sit alongside contest problems in one bank.
function handoutToProblem(h) {
  return {
    id: h.id,
    contest: h.source,
    type: h.resource_type === 'book' ? 'Book' : h.resource_type === 'exam' ? 'Exam' : 'Handout',
    source: handoutSource(h),
    name: h.name,
    desc: h.description || '',
    topics: h.topics || [],
    tags: h.tags || [],
    year: h.year || 0,
    label: handoutLessonLabel(h),
    country: '',
    problemUrl: h.pdf_url || '',
    solutionUrl: h.solution_url || null,
  }
}

// Combine the three problem sources into the unified bank used everywhere.
// Every record gets a normalized `source` ("homework"/"script" for AoPS rows,
// "handout"/"summary"/"book"/"exam" for handouts-derived rows).
export function assembleProblemBank({ problems = [], aopsProblems = [], handouts = [] }) {
  const normalizedAops = aopsProblems.map(p => ({
    ...p,
    lesson: formatLesson(p.lesson),
    source: p.source || (p.type === 'AoPS Script' ? 'script' : 'homework'),
  }))
  return [...problems, ...normalizedAops, ...handouts.map(handoutToProblem)]
}

// Fetch every AoPS course file listed in the manifest and flatten the results.
// A bad/missing file resolves to [] so it doesn't sink the rest.
export async function fetchAopsProblems() {
  const index = await fetchJSON('data/aops-index.json')
  const lists = await Promise.all(
    (index.files || []).map(f => fetchJSON(`data/${f}`).catch(() => []))
  )
  return lists.flat()
}

// Fetch all three sources and return the assembled bank. Used by the launcher;
// AdminApp keeps its own state-backed copy but shares assembleProblemBank().
export async function loadProblemBank() {
  const [problems, aopsProblems, handouts] = await Promise.all([
    fetchJSON('data/problems.json').catch(() => []),
    fetchAopsProblems().catch(() => []),
    fetchHandouts().catch(() => []),
  ])
  return assembleProblemBank({ problems, aopsProblems, handouts })
}
