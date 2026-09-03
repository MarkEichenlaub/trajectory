import { fetchJSON } from './github'
import { fetchHandouts } from './supabase'
import { swrFirst, k, cacheSet, getCachedUserId } from './cache'

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
  if (h.resource_type === 'homework') return 'homework'
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
    type: h.resource_type === 'book' ? 'Book'
      : h.resource_type === 'exam' ? 'Exam'
      : h.resource_type === 'homework' ? 'Homework'
      : 'Handout',
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

// Contest problems (problems.json) carry curated topics/desc/tags; AoPS homework and
// handout-derived entries don't (their "desc" is just the raw statement), so only
// contest problems get the parenthetical summary in the compact assigned-list rows.
export function problemSummary(p) {
  if (p.type !== 'Theory' && p.type !== 'Experiment') return ''
  const bits = []
  if (p.topics?.length) bits.push(`${p.topics.join(', ')}.`)
  if (p.desc) bits.push(p.desc)
  if (p.tags?.length) bits.push(p.tags.slice(0, 3).join(', '))
  return bits.join(' ')
}

// Combine the three problem sources into the unified bank used everywhere.
// Every record gets a normalized `source` ("homework"/"script" for AoPS rows,
// "handout"/"summary"/"book"/"exam" for handouts-derived rows).
// rawLesson keeps the original "MCH01: Velocity" code — the homework-packet
// builder needs it, while `lesson` becomes the display string. Draft packets
// (handouts still being built/reviewed) stay out of the bank until approved.
export function assembleProblemBank({ problems = [], aopsProblems = [], handouts = [] }) {
  const normalizedAops = aopsProblems.map(p => ({
    ...p,
    lesson: formatLesson(p.lesson),
    rawLesson: p.lesson,
    source: p.source || (p.type === 'AoPS Script' ? 'script' : 'homework'),
  }))
  const activeHandouts = handouts.filter(h => !h.status || h.status === 'active')
  return [...problems, ...normalizedAops, ...activeHandouts.map(handoutToProblem)]
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
// Cache-first: returns the last-seen bank instantly while refreshing behind
// the scenes (same IndexedDB keys the main portal uses).
export async function loadProblemBank() {
  const uid = getCachedUserId()
  const [problems, aopsProblems, handouts] = await Promise.all([
    swrFirst(k('gh', 'problems'), () => fetchJSON('data/problems.json')).catch(() => []),
    swrFirst(k('gh', 'aops'), fetchAopsProblems).catch(() => []),
    swrFirst(k('sb', uid, 'handouts'), fetchHandouts).catch(() => []),
  ])
  return assembleProblemBank({ problems, aopsProblems, handouts })
}

// Force-refetch the GitHub problem-bank JSON (cache-busted) and rewrite the
// cache. Used by the Settings "Refresh data" button — e.g. right after a
// script commits new problems and you don't want to wait out CDN caching.
export async function refreshProblemBank() {
  const [problems, index] = await Promise.all([
    fetchJSON('data/problems.json', { bust: true }),
    fetchJSON('data/aops-index.json', { bust: true }),
  ])
  const lists = await Promise.all(
    (index.files || []).map(f => fetchJSON(`data/${f}`, { bust: true }).catch(() => []))
  )
  const aopsProblems = lists.flat()
  cacheSet(k('gh', 'problems'), problems)
  cacheSet(k('gh', 'aops'), aopsProblems)
  return { problems, aopsProblems }
}
