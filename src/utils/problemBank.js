import { fetchJSON } from './github'
import { fetchHandouts } from './supabase'

// Map a handouts-table row into the same shape as the static problem entries,
// so handouts/books/exams sit alongside contest problems in one bank.
function handoutToProblem(h) {
  return {
    id: h.id,
    contest: h.source,
    type: h.resource_type === 'book' ? 'Book' : h.resource_type === 'exam' ? 'Exam' : 'Handout',
    name: h.name,
    desc: h.description || '',
    topics: h.topics || [],
    tags: h.tags || [],
    year: h.year || 0,
    label: '',
    country: '',
    problemUrl: h.pdf_url || '',
    solutionUrl: h.solution_url || null,
  }
}

// Combine the three problem sources into the unified bank used everywhere.
export function assembleProblemBank({ problems = [], aopsProblems = [], handouts = [] }) {
  return [...problems, ...aopsProblems, ...handouts.map(handoutToProblem)]
}

// Fetch all three sources and return the assembled bank. Used by the launcher;
// AdminApp keeps its own state-backed copy but shares assembleProblemBank().
export async function loadProblemBank() {
  const [problems, aopsProblems, handouts] = await Promise.all([
    fetchJSON('data/problems.json').catch(() => []),
    fetchJSON('data/aops-mechanics.json').catch(() => []),
    fetchHandouts().catch(() => []),
  ])
  return assembleProblemBank({ problems, aopsProblems, handouts })
}
